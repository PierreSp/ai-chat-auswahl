/* Host-specific, conservative DOM adapters. No private service APIs. */
(() => {
  'use strict';
  const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  const profiles = {
    'chatgpt.com': {
      name: 'ChatGPT', key: 'chatgpt',
      sidebars: '#history, #ds-sidebar, #sidebar, #stage-slideover-sidebar, [data-testid="history"], [data-testid="sidebar"], [data-testid="history-sidebar"], nav, aside',
      entries: 'a[href], [data-sidebar-item="true"]', path: new RegExp(`^/(?:g/[^/]+/)?c/(${uuid})/?$`, 'i'),
      genericDialog: false
    },
    'claude.ai': {
      name: 'Claude', key: 'claude',
      sidebars: 'nav, [data-testid="sidebar"], [data-testid="left-sidebar"], [data-testid="chat-history"]',
      entries: 'a[href]', path: new RegExp(`^/chat/(${uuid})/?$`, 'i'),
      genericDialog: true
    },
    'gemini.google.com': {
      name: 'Gemini', key: 'gemini',
      sidebars: 'bard-sidenav, mat-sidenav, [aria-label="Side Navigation"], .chat-history-list, .chat-history, conversations-list, [data-test-id="chat-history"]',
      entries: '[data-test-id="conversation"], a[href]', path: /^\/(?:u\/\d+\/)?app\/([0-9a-f]{12,64})\/?$/i,
      genericDialog: true
    }
  };
  const profile = profiles[location.hostname];
  if (!profile) return;
  const normal = value => String(value || '').normalize('NFC').replace(/\s+/g, ' ').trim();
  function fromURL(href) {
    if (!href) return null;
    try {
      const url = new URL(href, location.origin);
      if (url.origin !== location.origin) return null;
      const chat = url.pathname.match(profile.path)?.[1].toLowerCase(), task = workIdentity(href);
      return chat || (task ? `remote:${task}` : null);
    } catch { return null; }
  }
  function workIdentity(href) {
    if (profile.key !== 'chatgpt' || !href) return null;
    try {
      const url = new URL(href, location.origin);
      return url.origin === location.origin ? url.pathname.match(/^\/remote\/(task_e_[0-9a-f]{32})\/?$/i)?.[1].toLowerCase() || null : null;
    } catch { return null; }
  }
  function chatGPTNavigation(root, identify) {
    if (!root.matches('nav[role="navigation"]') || !root.closest('aside') || root.closest('main, [role="main"]')) return false;
    const links = [...root.querySelectorAll('a[href]')];
    const home = links.some(a => {
      try {const url=new URL(a.getAttribute('href'),location.origin);return url.origin===location.origin && url.pathname==='/';}catch{return false;}
    });
    return home && links.some(a => identify(a.getAttribute('href')));
  }
  function chatGPTIdentity(entry) {
    if (entry.matches('[data-sidebar-keep-open="true"]')) return null;
    if (entry.matches('a[href]') && !fromURL(entry.getAttribute('href'))) return null;
    const task = workIdentity(entry.getAttribute('href'));
    const row = entry.closest('[data-app-action-sidebar-thread-row]');
    const remoteRow = row && (row.getAttribute('data-app-action-sidebar-thread-kind') === 'remote' ||
      row.getAttribute('data-app-action-sidebar-thread-id')?.startsWith('remote:'));
    if (task || remoteRow) {
      if (!task || !row || row.getAttribute('data-app-action-sidebar-thread-kind') !== 'remote' ||
          row.getAttribute('data-app-action-sidebar-thread-id') !== `remote:${task}`) return null;
      const links = [...row.querySelectorAll('a[href]')];
      if (!links.length || links.some(a => fromURL(a.getAttribute('href')) !== `remote:${task}`)) return null;
      return `remote:${task}`;
    }
    if (!entry.matches('a[href]') && entry.querySelector('[data-app-action-sidebar-thread-kind="remote"], [data-app-action-sidebar-thread-id^="remote:"]')) return null;
    let owner = entry.closest('[data-sidebar-item="true"]') || entry;
    // Older layouts place the options trigger next to the link, in a row.
    if (owner === entry && entry.matches('a[href]') && entry.parentElement) {
      const links = [...entry.parentElement.querySelectorAll('a[href]')].filter(a => fromURL(a.getAttribute('href')));
      if (links.length === 1) owner = entry.parentElement;
    }
    if (owner.matches('[data-sidebar-keep-open="true"]')) return null;
    const ids = new Set([...owner.querySelectorAll('a[href]')].map(a => fromURL(a.getAttribute('href'))).filter(Boolean));
    if (owner.matches('a[href]')) ids.add(fromURL(owner.getAttribute('href')));
    for (const trigger of owner.querySelectorAll('[data-conversation-options-trigger]')) {
      const id = trigger.getAttribute('data-conversation-options-trigger');
      if (!new RegExp(`^${uuid}$`, 'i').test(id || '')) return null;
      ids.add(id.toLowerCase());
    }
    const id = ids.size === 1 ? [...ids][0] : null;
    // Generic wrappers cannot bypass the strict native-row checks above.
    // Task links inside those wrappers are discovered independently.
    return id?.startsWith('remote:') ? null : id;
  }
  function metadataIds(node) {
    const log = node.getAttribute('jslog') || '';
    const field = log.match(/(?:^|;)\s*BardVeMetadataKey:([^;]*)/);
    if (!field) return [...log.matchAll(/"c_([0-9a-f]{12,64})"/gi)].map(match => match[1].toLowerCase());
    try {
      const value = field[1].trim();
      if (!value || value.length > 8192) return null;
      const parsed = JSON.parse(value.startsWith('[') ? value : atob(value));
      if (!Array.isArray(parsed)) return null;
      const pending = [parsed], ids = [];
      while (pending.length) {
        const part = pending.pop();
        if (Array.isArray(part)) pending.push(...part);
        else if (typeof part === 'string' && /^c_/i.test(part)) {
          if (!/^c_[0-9a-f]{12,64}$/i.test(part)) return null;
          ids.push(part.slice(2).toLowerCase());
        } else if (part && typeof part === 'object') return null;
      }
      return ids;
    } catch { return null; }
  }
  function identity(entry) {
    if (profile.key === 'chatgpt') return chatGPTIdentity(entry);
    const isLink=entry.matches('a[href]');
    const linkId=isLink ? fromURL(entry.getAttribute('href')) : null;
    if (profile.key !== 'gemini') return linkId;
    if ((isLink && !linkId) || (!isLink && !entry.matches('[data-test-id="conversation"]'))) return null;
    const ids = new Set([...entry.querySelectorAll('a[href]')].map(a => fromURL(a.getAttribute('href'))).filter(Boolean));
    if (linkId) ids.add(linkId);
    // Read all identity evidence inside a row, including a marked anchor or
    // nested wrapper. Validate ancestors separately; never recurse into self.
    for (const node of [entry,...entry.querySelectorAll('[data-test-id="conversation"], [jslog]')]) {
      for (const value of [node.getAttribute('data-conversation-id'), node.id]) {
        const match = (value || '').match(/^(?:conversation-)?(?:c_)?([0-9a-f]{12,64})$/i);
        if (match) ids.add(match[1].toLowerCase());
      }
      const metadata = metadataIds(node);
      if (!metadata) return null;
      metadata.forEach(id => ids.add(id));
    }
    if (ids.size !== 1) return null;
    const id=[...ids][0];
    const owner=entry.parentElement?.closest('[data-test-id="conversation"]');
    return owner && identity(owner)!==id ? null : id; // Never identify by order or title.
  }
  function nativeActionIdentity(control, action) {
    // Gemini's current confirmation has no test ID. Its native action marker
    // and conversation metadata identify the action independently of locale.
    const log = control.getAttribute('jslog') || '';
    if (profile.key !== 'gemini' || !new RegExp(`^\\s*${action}\\s*(?:;|$)`).test(log)) return undefined;
    // Native destructive actions require exactly one real metadata field;
    // legacy row parsing's quoted-ID fallback must not authorize a click.
    if (log.split(';').filter(field => /^\s*BardVeMetadataKey:/.test(field)).length !== 1) return null;
    const ids = metadataIds(control);
    const unique = new Set(ids || []);
    return ids && unique.size === 1 ? [...unique][0] : null;
  }
  const confirmationIdentity = control => nativeActionIdentity(control, '186009');
  const deleteMenuIdentity = control => nativeActionIdentity(control, '186000');
  function title(entry) {
    if (profile.key === 'chatgpt' && isTask(identity(entry))) {
      // Codex renders formatting in the sidebar but confirms the stored title
      // verbatim (for example __cache__). Use only this ID-validated row's title.
      const stored = normal(entry.closest('[data-app-action-sidebar-thread-row]')?.getAttribute('data-app-action-sidebar-thread-title'));
      if (stored) return stored;
    }
    const preferred = profile.key === 'gemini' ? entry.querySelector('.conversation-title, [data-test-id="conversation-title"], .mdc-list-item__primary-text') : null;
    const copy = (preferred || entry).cloneNode(true);
    copy.querySelectorAll('button, [role="button"], svg, mat-icon, gem-icon, [aria-hidden="true"], [data-cc-box]').forEach(el => el.remove());
    return normal(copy.textContent) || normal(entry.getAttribute('title')) || normal(entry.getAttribute('aria-label'));
  }
  function isRoot(root) {
    // Gemini places the native sidenav inside the application's main landmark.
    // Its chat-history class also occurs in the message pane: only a native
    // sidenav may cross this boundary, never an arbitrary content-area list.
    if (root.closest('main, [role="main"]') &&
        !(profile.key === 'gemini' && root.closest('bard-sidenav, mat-sidenav'))) return false;
    if (profile.key === 'chatgpt') {
      if (root.matches('#history, #ds-sidebar, #sidebar, #stage-slideover-sidebar, [data-testid="history"], [data-testid="sidebar"], [data-testid="history-sidebar"], nav[aria-label="Chat history"], nav[aria-label="Chatverlauf"]')) return true;
      // Current layout: localized navigation in an aside, ordinary /c/ links,
      // no history test IDs or data-sidebar-item attributes.
      if (chatGPTNavigation(root, fromURL)) return true;
      return Boolean(root.querySelector('[data-sidebar-item="true"] [data-conversation-options-trigger], button[data-testid^="history-item-"][data-testid$="-options"]'));
    }
    if (profile.key !== 'claude') return true;
    if (root.matches('[data-testid="sidebar"], [data-testid="left-sidebar"], [data-testid="chat-history"], nav[aria-label="Sidebar"], nav[aria-label="Chat history"], nav[aria-label="Chatverlauf"]')) return true;
    if (!root.matches('nav')) return false;
    const paths = new Set([...root.querySelectorAll('a[href]')].map(a => {
      try {const url=new URL(a.getAttribute('href'),location.origin);return url.origin===location.origin?url.pathname:null;}catch{return null;}
    }));
    return paths.has('/new') && (paths.has('/recents') || paths.has('/chats'));
  }
  const isTask = id => profile.key === 'chatgpt' && /^remote:task_e_[0-9a-f]{32}$/.test(id);
  // Text fallback for older dialogs without semantic destructive controls.
  const genericDescriptions = new Set([
    'This will permanently delete this chat. This cannot be undone.',
    'Are you sure you want to delete this chat? This action cannot be undone.',
    'Are you sure you want to delete this conversation? This action cannot be undone.',
    'Are you sure you want to delete this chat? This cannot be undone.',
    'This action cannot be undone.',
    'This cannot be undone.',
    'This session will be permanently deleted. This can’t be undone.',
    "This session will be permanently deleted. This can't be undone.",
    'Dieser Chat wird dauerhaft gelöscht. Dies kann nicht rückgängig gemacht werden.',
    'Möchtest du diesen Chat wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    'Diese Aktion kann nicht rückgängig gemacht werden.'
  ]);
  globalThis.ChatCleanerProvider = Object.freeze({...profile, identity, confirmationIdentity, deleteMenuIdentity, title, normal, isRoot, isTask, genericDescriptions});
})();
