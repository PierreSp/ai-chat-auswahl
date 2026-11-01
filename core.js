// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Pierre Springer
/* Runs only in the extension's isolated content-script world. No network calls. */
(() => {
  'use strict';
  const Provider = globalThis.ChatCleanerProvider;
  if (!Provider) return;
  const {t} = globalThis.ChatCleanerI18n;
  const normal = Provider.normal;
  const sidebars = Provider.sidebars;
  const menuButtons = 'button[aria-haspopup="menu"], button[aria-haspopup="true"], [role="button"][aria-haspopup="menu"], button[data-conversation-options-trigger], [role="button"][data-conversation-options-trigger], button[data-testid="history-item-more"], button[data-testid^="history-item-"][data-testid$="-options"], button[data-test-id="actions-menu-button"], gem-icon-button[data-test-id="actions-menu-button"] button, button[aria-label^="More options"], button[aria-label^="Weitere Optionen"]';
  const dialogSelector = '[role="dialog"], [role="alertdialog"], dialog[open], mat-dialog-container';
  const deleteNames = new Set(['Löschen', 'Chat löschen', 'Unterhaltung löschen', 'Delete', 'Delete chat', 'Delete conversation']);
  const cancelNames = new Set(['Abbrechen', 'Cancel']);

  function visibilityIssue(el) {
    if (!el?.isConnected || !el.getClientRects().length) return {reason:'no-layout',blocker:el};
    const hidden = el.closest('[hidden], [aria-hidden="true"]');
    if (hidden) return {reason:'hidden-ancestor',blocker:hidden};
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return {reason:'hidden-style',blocker:el};
    for (let parent=el.parentElement;parent;parent=parent.parentElement) {
      if (parent.clientHeight && parent.clientWidth) continue;
      const clipping=getComputedStyle(parent);
      // Non-replaced inline and contents wrappers have no client box. Their
      // zero client dimensions do not make their visible children collapsed.
      if (clipping.display === 'inline' || clipping.display === 'contents') continue;
      // Ordinary scrolling retains a nonzero viewport. A zero-size clipping
      // ancestor is a collapsed group, even if descendants retain layout boxes.
      if ((!parent.clientHeight && /^(hidden|clip|auto|scroll)$/.test(clipping.overflowY)) ||
          (!parent.clientWidth && /^(hidden|clip|auto|scroll)$/.test(clipping.overflowX))) return {reason:'clipped-ancestor',blocker:parent};
    }
    return {reason:null,blocker:null};
  }
  const visible = el => visibilityIssue(el).reason === null;

  const titleOf = Provider.title;
  const chatId = Provider.identity;

  function menuController(button) {
    if (Provider.key !== 'gemini') return button;
    const host = button.closest('gem-icon-button[data-test-id="actions-menu-button"]');
    return host && host.querySelectorAll('button').length === 1 ? host : button;
  }
  function menuDisabled(button, controller = button) {
    return [button, controller].some(node => node.disabled || node.hasAttribute('disabled') || node.getAttribute('aria-disabled') === 'true');
  }

  function menuFor(anchor, root) {
    const expectedId = chatId(anchor);
    const taskRow = Provider.isTask(expectedId) ? anchor.closest('[data-app-action-sidebar-thread-row]') : null;
    let row = anchor;
    for (let depth = 0; row && row !== root && depth < 6; depth++, row = row.parentElement) {
      // ChatGPT now wraps the link in three layout elements before its row.
      // Never borrow a navigation-wide control when looking farther upward.
      if (row !== anchor && row.matches('nav, aside, [role="navigation"]')) break;
      const ids = new Set([...row.querySelectorAll(Provider.entries)].map(a => chatId(a)).filter(Boolean));
      if (row.matches(Provider.entries)) {const id=chatId(row);if(id)ids.add(id);}
      // Hover-only controls can have display:none/visibility:hidden. The row
      // must be visible, but its unique native menu need not be painted yet.
      const buttons = [...row.querySelectorAll(menuButtons)];
      if (ids.size > 1) return null;
      if (buttons.length === 1) {
        const triggerId = buttons[0].getAttribute('data-conversation-options-trigger');
        if (triggerId !== null && triggerId.toLowerCase() !== expectedId) return null;
        return buttons[0];
      }
      if (buttons.length > 1) return null;
      // A Codex menu action can delete immediately. Never search beyond its
      // validated native row and borrow a sibling task's destructive control.
      if (taskRow && row === taskRow) break;
    }
    return null;
  }

  function roots() { return [...document.querySelectorAll(sidebars)].filter(Provider.isRoot); }
  function discover() {
    const found = new Map();
    for (const root of roots()) {
      if (!visible(root)) continue;
      for (const anchor of root.querySelectorAll(Provider.entries)) {
        const main = anchor.closest('main, [role="main"]');
        if (main && root.contains(main)) continue;
        const id = chatId(anchor);
        if (!id || found.has(id) || !visible(anchor)) continue;
        const title = titleOf(anchor);
        const menu = menuFor(anchor, root);
        if (title && menu) found.set(id, {id, title, anchor, menu, controller: menuController(menu), root});
      }
    }
    return [...found.values()];
  }

  async function loadMore(signal, onProgress) {
    const initial = discover();
    const knownRoots = roots().filter(visible);
    const scrollers = new Set();
    for (const chat of initial) {
      for (let node = chat.anchor.parentElement; node && node !== document.body; node = node.parentElement) {
        if (!knownRoots.some(root => root.contains(node))) continue;
        const style = getComputedStyle(node);
        if (/^(auto|scroll)$/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 2 && node.clientHeight > 0) {
          scrollers.add(node);break;
        }
      }
    }
    if (scrollers.size !== 1) throw new Error(t('errorScrollList'));
    const scroller = [...scrollers][0];
    const seen = new Set(initial.map(chat => chat.id));
    let previous = new Set(seen), quiet = 0;
    const started = Date.now();
    for (let step = 0; step < 40 && Date.now() - started < 30000; step++) {
      check(signal);
      if (!visible(scroller) || !roots().some(root => root.contains(scroller))) throw new Error(t('errorListChanged'));
      if (confirmationDialogs().length || shown('[role="menu"]').length) throw new Error(t('errorCloseOverlays'));
      const beforeHeight = scroller.scrollHeight;
      const beforeCount = seen.size;
      scroller.scrollBy({top: Math.max(100, scroller.clientHeight * .85), behavior:'instant'});
      await delay(650);
      check(signal);
      const current = discover();
      const ids = new Set(current.map(chat => chat.id));
      if ([...previous].some(id => !ids.has(id))) throw new Error(t('errorVirtualized'));
      current.forEach(chat => seen.add(chat.id));previous=ids;
      onProgress({added:seen.size-initial.length});
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 3;
      quiet = atBottom && beforeHeight === scroller.scrollHeight && beforeCount === seen.size ? quiet + 1 : 0;
      if (quiet >= 4) return {added:seen.size-initial.length, limited:false};
    }
    return {added:seen.size-initial.length, limited:true};
  }

  function preflight(items) {
    const current = new Map(discover().map(chat => [chat.id,chat]));
    for (const item of items) {
      const chat = current.get(item.id);
      if (!chat || chat.title !== item.title) throw new Error(t('errorPreflight', item.title));
    }
  }

  function check(signal) {
    if (signal?.aborted) throw new Error(t('errorStopped'));
  }
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function waitFor(predicate, message, signal, timeout = 6000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      check(signal);
      const value = predicate();
      if (value) return value;
      await delay(100);
    }
    throw new Error(message);
  }
  function shown(selector, root = document) {
    const elements = [...root.querySelectorAll(selector)].filter(visible);
    return elements.filter(el => !elements.some(other => other !== el && other.contains(el)));
  }
  function neutralClaudeNotification(dialog) {
    // Claude's success toast also has role=dialog. Identify its native,
    // nonmodal notification structure without matching translated prose.
    if (Provider.key !== 'claude' || !dialog.matches('[role="dialog"][aria-modal="false"][data-type="neutral"]') ||
        dialog.matches('[data-cds="ConfirmationDialog"]')) return false;
    const region = dialog.parentElement;
    if (!region?.matches('[role="region"][aria-live="polite"][aria-atomic="false"][aria-relevant="additions text"]') ||
        !region.parentElement?.matches('[data-cds="Toast"]') ||
        !region.parentElement.parentElement?.matches('[data-cds-portal]') ||
        !region.style.getPropertyValue('--toast-frontmost-height') || !dialog.style.getPropertyValue('--toast-index')) return false;
    if (dialog.querySelector('[role="dialog"], [role="alertdialog"], [role="alert"], [data-cds="ConfirmationDialog"]')) return false;
    const headings = dialog.querySelectorAll('h1, h2, h3, [role="heading"]');
    if (headings.length !== 1 || !headings[0].matches('h2[data-type="neutral"][aria-atomic="true"]') ||
        !headings[0].id || dialog.getAttribute('aria-labelledby') !== headings[0].id) return false;
    const controls = dialog.querySelectorAll('button, [role="button"], a[href], input, select, textarea, form, [role="menuitem"], [contenteditable]');
    if (controls.length !== 1 || !controls[0].matches('button[type="button"][data-type="neutral"][aria-hidden="true"]')) return false;
    return !semanticDelete(controls[0], true) && !deleteNames.has(normal(controls[0].textContent)) &&
      !deleteNames.has(normal(controls[0].getAttribute('aria-label')));
  }
  const confirmationDialogs = () => shown(dialogSelector).filter(dialog => !neutralClaudeNotification(dialog));
  function named(root, selector, names) {
    return shown(selector, root).filter(el => {
      const copy = el.cloneNode(true);
      copy.querySelectorAll('svg, mat-icon, gem-icon, [aria-hidden="true"]').forEach(icon => icon.remove());
      return names.has(normal(copy.textContent)) || names.has(normal(el.getAttribute('aria-label')));
    });
  }
  function semanticDelete(control, confirmation = false) {
    if (confirmation && Provider.confirmationIdentity(control)) return true;
    const marker = Provider.key === 'chatgpt'
      ? '[data-testid="delete-chat-menu-item"], [data-testid="delete-conversation-confirm-button"]'
      : Provider.key === 'gemini' ? '[data-test-id="delete-button"]' : null;
    if (marker && (control.matches(marker) || control.querySelector(marker))) return true;
    if (!confirmation && Provider.key === 'gemini' && control.closest('gem-menu-item[data-test-id="delete-button"]')) return true;
    if (confirmation && Provider.key === 'gemini' &&
        (control.matches('button[data-test-id="confirm-button"]') || control.closest('gem-button[data-test-id="confirm-button"]'))) return true;
    if (control.matches('[data-variant="destructive"], [variant="destructive"]')) return true;
    // Claude's danger tokens are semantic UI variants, independent of locale.
    if ([...control.classList].some(token => /^(?:[^:]+:)*(?:bg|text)-(?:danger|destructive)(?:-|$)/.test(token))) return true;
    if (!confirmation && control.querySelector('svg.lucide-trash, svg.lucide-trash-2, [data-icon="trash"], [data-icon="trash-2"]')) return true;
    return false;
  }
  function deleteControls(root, selector, confirmation = false) {
    const textMatches = named(root, selector, deleteNames);
    return shown(selector, root).filter(control => semanticDelete(control, confirmation) || textMatches.includes(control));
  }
  function assertTarget(item) {
    const current = discover().find(chat => chat.id === item.id);
    if (!current) throw new Error(t('errorTargetMissing', item.title));
    if (current.title !== item.title) throw new Error(t('errorTitleChanged', item.title));
    return current;
  }
  function assertBoundTarget(target, item) {
    // Modal libraries may aria-hide the sidebar. Validate the bound DOM node
    // directly without relaxing discovery or looking up another chat by title.
    if (!target.anchor.isConnected || !target.root.contains(target.anchor) ||
        chatId(target.anchor) !== item.id || titleOf(target.anchor) !== item.title ||
        !target.menu.isConnected || menuFor(target.anchor, target.root) !== target.menu ||
        menuController(target.menu) !== target.controller) {
      throw new Error(t('errorBoundTarget'));
    }
  }
  function titleInDialog(dialog, title) {
    const described = (dialog.getAttribute('aria-describedby') || '').split(/\s+/)
      .map(id => document.getElementById(id)).filter(el => el && dialog.contains(el));
    const regions = described.length ? described : [dialog];
    const controls = 'button, [role="button"], a, input, select, textarea, [role="menuitem"], h1, h2, h3, h4, h5, h6, [role="heading"]';
    return regions.some(region => [region, ...region.querySelectorAll('strong, b, span, p')].some(el =>
      !el.closest(controls) && !el.querySelector(controls) && normal(el.textContent) === title));
  }
  function dialogIdentityConflict(dialog, item) {
    const explicitId = dialog.getAttribute('data-conversation-id');
    if (explicitId && explicitId.replace(/^c_/, '').toLowerCase() !== item.id) return true;
    const explicitTitles = [...dialog.querySelectorAll('strong, b, [data-chat-title], [data-testid="conversation-title"]')]
      .filter(el => !el.closest('button, [role="button"], h1, h2, h3, [role="heading"]'));
    if (explicitTitles.some(el => normal(el.textContent) && normal(el.textContent) !== item.title)) return true;
    const ids = [...dialog.querySelectorAll('button, [role="button"]')]
      .map(Provider.confirmationIdentity).filter(id => id !== undefined);
    return ids.length > 1 || ids.some(id => id !== item.id);
  }
  function untitledChatGPTDialog(dialog, item, target, sentence) {
    // ChatGPT renders its empty stored title as "New chat" in the sidebar,
    // but interpolates an empty string in both native confirmation copies.
    // Only this observed placeholder/shape can use the already-bound row ID.
    if (item.title !== 'New chat' || Provider.isTask(item.id) ||
        !dialog.matches('[role="dialog"][data-overlay-owner="slate-sidebar"][aria-modal="true"]')) return false;
    const row = target?.anchor.closest('[data-sidebar-cycle-item][role="group"]');
    if (!row || !target.root.contains(row) || !row.contains(target.menu) || row.querySelectorAll(menuButtons).length !== 1) return false;
    const links = [...row.querySelectorAll('a[href]')];
    if (!links.length || links.some(link => chatId(link) !== item.id)) return false;
    const described = (dialog.getAttribute('aria-describedby') || '').trim().split(/\s+/);
    const description = described.length === 1 ? document.getElementById(described[0]) : null;
    if (!description?.matches('p') || !dialog.contains(description) || normal(description.textContent) !== sentence) return false;
    const forms = dialog.querySelectorAll('form');
    if (forms.length !== 1 || named(forms[0], 'button, [role="button"]', cancelNames).length !== 1 ||
        deleteControls(forms[0], 'button, [role="button"]', true).length !== 1) return false;
    const controls = 'button, [role="button"], a, input, select, textarea, [role="menuitem"], h1, h2, h3, [role="heading"]';
    return [...forms[0].querySelectorAll('p, div, span')].some(el =>
      !el.closest(controls) && !el.querySelector(controls) && visible(el) && normal(el.textContent) === sentence);
  }
  function validDialog(dialog, item, target) {
    if (dialogIdentityConflict(dialog, item)) return false;
    const nativeConfirmationControls = [...dialog.querySelectorAll('button, [role="button"]')]
      .filter(control => Provider.confirmationIdentity(control) !== undefined);
    const nativeConfirmationIds = nativeConfirmationControls.map(Provider.confirmationIdentity);
    if (nativeConfirmationIds.length) {
      const actions = deleteControls(dialog, 'button, [role="button"]', true);
      if (nativeConfirmationIds.length !== 1 || nativeConfirmationIds[0] !== item.id ||
          actions.length !== 1 || actions[0] !== nativeConfirmationControls[0]) return false;
    }
    const description = dialog.cloneNode(true);
    description.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"], button, [role="button"], svg, mat-icon, gem-icon, [aria-hidden="true"]').forEach(el => el.remove());
    if (nativeConfirmationIds.length === 1) {
      // This generic warning starts with "This will delete", but names data
      // categories rather than a chat. Exempt only this exact observed warning
      // after the native confirmation metadata has matched the selected ID.
      description.querySelectorAll('p').forEach(el => {
        if (normal(el.textContent) === 'This will delete prompts, responses and feedback from your Gemini Apps activity, plus any content that you created.') el.remove();
      });
    }
    const descriptionText = normal(description.textContent);
    // Some older dialogs interpolate the title into a text node rather than
    // marking it up. Keep recognizing that explicit target as a veto, even
    // when the action button has a locale-independent destructive marker.
    const proseTitle = descriptionText.match(/^(?:This will delete |Dadurch wird folgender Chat gelöscht: )(.+)$/)?.[1];
    if (proseTitle && proseTitle !== item.title && proseTitle !== `${item.title}.`) return false;
    if (Provider.key === 'chatgpt') {
      // The current native dialog repeats its full sentence in an accessible
      // paragraph and a visible div, without a separate title element. Match
      // the complete subject, and reject conflicting copies of that sentence.
      const controls='button, [role="button"], a, input, select, textarea, [role="menuitem"], h1, h2, h3, h4, h5, h6, [role="heading"]';
      const titles=new Set([...dialog.querySelectorAll('p, div, span')]
        .filter(el=>!el.closest(controls)&&!el.querySelector(controls))
        .map(el=>normal(el.textContent).match(/^This will permanently delete (.*)\. This (?:can't|can’t|cannot) be undone\.$/)?.[1]).filter(title=>title!==undefined));
      if (titles.has('')) return titles.size===1 && untitledChatGPTDialog(dialog, item, target, "This will permanently delete . This can't be undone.");
      if (titles.size) return titles.size===1 && titles.has(item.title);
    }
    if (titleInDialog(dialog, item.title)) return true;
    if (!Provider.genericDialog) return false;
    const headings = shown('h1, h2, h3, [role="heading"]', dialog);
    if (headings.length !== 1 || !normal(headings[0].textContent)) return false;
    const actions = deleteControls(dialog, 'button, [role="button"]', true);
    // Called only after clicking the ID-bound row's verified delete menu item.
    // A unique semantic destructive action supports localized session dialogs
    // without inferring their identity from translated prose or button order.
    if (actions.length === 1 && semanticDelete(actions[0], true)) return true;
    const headingNames = new Set(['Delete chat', 'Delete chat?', 'Delete this chat?', 'Delete conversation', 'Delete conversation?', 'Delete session', 'Delete session?', 'Chat löschen', 'Chat löschen?', 'Diesen Chat löschen?', 'Unterhaltung löschen', 'Unterhaltung löschen?']);
    if (!headingNames.has(normal(headings[0].textContent))) return false;
    if (named(dialog, 'button, [role="button"]', cancelNames).length !== 1) return false;
    if (Provider.key === 'gemini' && !dialog.querySelector('[data-test-id="confirm-button"]')) return false;
    if (!Provider.genericDescriptions.has(descriptionText)) return false;
    // A generic dialog is accepted only after the exact ID-bound trigger/menu
    // relationship has been verified, never as an independently found dialog.
    return true;
  }
  function listedIds() {
    return new Set(roots().flatMap(root =>
      [...root.querySelectorAll(Provider.entries)].map(a => chatId(a)).filter(Boolean)));
  }
  function createBatchGuard() {
    // One baseline for the whole queue: a late error must not become the next
    // chat's "preexisting" alert. Reappearing completed IDs also stop the queue.
    const alertsBefore = new Map(shown('[role="alert"]').map(el => [el, normal(el.textContent)]));
    const processed = new Set();
    const verify = () => {
      const changed = shown('[role="alert"]').find(el => normal(el.textContent) && alertsBefore.get(el) !== normal(el.textContent));
      if (changed) throw new Error(t('errorProviderAlert', Provider.name));
      const listed = listedIds();
      if ([...processed].some(id => listed.has(id))) throw new Error(t('errorReappeared'));
    };
    return Object.freeze({
      verify,
      record: id => processed.add(id),
      async settle(signal) {
        const start = Date.now();
        await waitFor(() => {verify();return Date.now() - start >= 2200;}, t('errorCheckHistory'), signal, 4000);
      }
    });
  }
  async function activateMenu(button, verify = () => {}) {
    if (Provider.key === 'chatgpt') {
      // Menu libraries can toggle on pointerdown rather than click. Observe
      // the result: preventDefault alone can merely suppress a focus change.
      const expanded=button.getAttribute('aria-expanded'),before=shown('[role="menu"]');
      const init={bubbles:true,cancelable:true,composed:true,pointerType:'mouse',pointerId:1,isPrimary:true,button:0};
      button.dispatchEvent(new PointerEvent('pointerdown',{...init,buttons:1}));
      verify();
      button.dispatchEvent(new PointerEvent('pointerup',{...init,buttons:0}));
      await delay(0); // Let framework state updates from the pointer events settle.
      verify();
      const after=shown('[role="menu"]');
      if (expanded!==button.getAttribute('aria-expanded') || before.length!==after.length || before.some(menu=>!after.includes(menu))) return;
    }
    if (!menuDisabled(button,menuController(button))) button.click();
  }
  async function dismiss(dialog, menuButton, controller = menuButton) {
    if (dialog?.isConnected) {
      const cancel = named(dialog, 'button, [role="button"]', cancelNames);
      if (cancel.length === 1) cancel[0].click();
    }
    if (menuButton && !menuDisabled(menuButton, controller) &&
        [menuButton, controller].some(node => node.getAttribute('aria-expanded') === 'true')) await activateMenu(menuButton);
  }

  async function deleteChat(item, signal, guard = createBatchGuard()) {
    check(signal);
    guard.verify();
    if (confirmationDialogs().length || shown('[role="menu"]').length) {
      throw new Error(t('errorProviderOverlays', Provider.name));
    }
    let target = assertTarget(item);
    target.anchor.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: 'instant'});
    await delay(160);
    check(signal);
    target = assertTarget(item); // Scrolling can recycle a virtualized row.
    let dialog;
    let committed = false;
    try {
      guard.verify();
      if (menuDisabled(target.menu, target.controller)) throw new Error(t('errorMenuDisabled'));
      await activateMenu(target.menu,()=>{check(signal);assertBoundTarget(target,item);});
      const menu = await waitFor(() => {
        const menus = shown('[role="menu"]');
        if (menus.length > 1) throw new Error(t('errorMultipleMenus'));
        return menus[0];
      }, t('errorMenuMissing'), signal);
      // Gemini owns menu state on gem-icon-button, while its inner native
      // button receives the click. Conflicting associations must still stop.
      await waitFor(() => {
        guard.verify();assertBoundTarget(target, item);
        const menus = shown('[role="menu"]');
        if (menus.length !== 1 || menus[0] !== menu) throw new Error(t('errorMenuChanged'));
        const associations = new Set([target.menu, target.controller].map(node => normal(node.getAttribute('aria-controls'))).filter(Boolean));
        // Angular can render the menu before attaching aria-controls to its
        // trigger. Wait only for absent evidence; conflicting evidence fails.
        if (!associations.size) return false;
        const controls = [...associations][0];
        if (associations.size !== 1 || (menu.id !== controls && !document.getElementById(controls)?.contains(menu))) {
          throw new Error(t('errorMenuUnbound'));
        }
        return true;
      }, t('errorMenuUnbound'), signal);
      const remove = deleteControls(menu, '[role="menuitem"]');
      if (remove.length !== 1) throw new Error(t('errorDeleteAction'));
      const menuIdentity = Provider.deleteMenuIdentity(remove[0]);
      if (menuIdentity !== undefined && menuIdentity !== item.id) throw new Error(t('errorMenuIdentity'));
      if (remove[0].disabled || remove[0].getAttribute('aria-disabled') === 'true') throw new Error(t('errorDeleteDisabled'));
      check(signal);
      guard.verify();
      assertBoundTarget(target, item);
      // A Codex task may be removed by its menu action itself. The extension's
      // reviewed selection already authorized that exact ID. Treat the click
      // as potentially committed and observe it; never repeat it on timeout.
      const directTask = Provider.isTask(item.id), rootParent = target.root.parentElement;
      committed = directTask;
      remove[0].click();
      dialog = await waitFor(() => {
        guard.verify();
        const dialogs = confirmationDialogs();
        if (dialogs.length > 1) throw new Error(t('errorMultipleDialogs'));
        return dialogs[0] || (directTask && !listedIds().has(item.id) ? {removed:true} : null);
      }, t('errorResultMissing'), directTask ? null : signal);
      if (dialog.removed) dialog = null;
      else {
        committed = false;
        await waitFor(() => {
          guard.verify();assertBoundTarget(target, item);
          const dialogs = confirmationDialogs();
          if (dialogs.length !== 1 || dialogs[0] !== dialog) throw new Error(t('errorDialogChanged'));
          if (dialogIdentityConflict(dialog, item)) throw new Error(t('errorDialogIdentity', item.title));
          const controls = shown('button, [role="button"]', dialog);
          if (!shown('h1, h2, h3, [role="heading"]', dialog).length || controls.length < 2) return false;
          // Material renders its shell before content, animation and jslog
          // metadata are ready. Do not turn that temporary absence into either
          // permission or rejection. Explicit conflicting evidence fails above.
          if (Provider.key === 'gemini' && dialog.matches('mat-dialog-container') &&
              !controls.some(control => Provider.confirmationIdentity(control) !== undefined || semanticDelete(control, true))) return false;
          return true;
        }, t('errorDialogIncomplete'), signal);
        if (!validDialog(dialog, item, target)) {
          throw new Error(t('errorDialogIdentity', item.title));
        }
        const buttons = deleteControls(dialog, 'button, [role="button"]', true);
        if (buttons.length !== 1 || buttons[0].disabled || buttons[0].getAttribute('aria-disabled') === 'true') {
          throw new Error(t('errorConfirmation'));
        }
        check(signal);
        guard.verify();
        assertBoundTarget(target, item);
        const currentDialogs = confirmationDialogs();
        if (currentDialogs.length !== 1 || currentDialogs[0] !== dialog) throw new Error(t('errorDialogChanged'));
        committed = true;
        buttons[0].click();
      }
      // After committing, finish observing this one operation even if Stop is pressed.
      let goneSince = 0;
      await waitFor(() => {
        guard.verify();
        const stillListed = listedIds().has(item.id);
        if (visible(dialog) || confirmationDialogs().length || stillListed || !target.root.isConnected ||
            target.root.parentElement !== rootParent || !visible(target.root)) { goneSince = 0; return false; }
        if (!goneSince) goneSince = Date.now();
        return Date.now() - goneSince >= 1200;
      }, t('errorResultUnclear'), null, 10000);
      guard.record(item.id);
    } catch (error) {
      if (!committed) await dismiss(dialog, target.menu, target.controller);
      throw error;
    }
  }

  globalThis.ChatCleanerCore = Object.freeze({discover, loadMore, preflight, deleteChat, createBatchGuard, normal, provider: Provider});
})();
