/* Opt-in, local-only structural report. Never serializes DOM text or raw IDs. */
(() => {
  'use strict';
  const Core = globalThis.ChatCleanerCore;
  if (!Core) return;
  const Provider = Core.provider;
  const candidateSelector = 'a[href], [data-sidebar-item], [data-test-id="conversation"], [data-conversation-id], [data-conversation-options-trigger]';
  const buttonSelector = 'button, [role="button"], gem-icon-button';
  const knownMarkers = new Set(['conversation', 'conversation-title', 'actions-menu-button', 'more-actions-button', 'history-item-more', 'history', 'sidebar', 'history-sidebar', 'left-sidebar', 'chat-history']);
  const knownAttributes = new Set(['id','class','style','href','title','role','hidden','inert','tabindex','type','disabled','aria-label','aria-labelledby','aria-describedby','aria-controls','aria-haspopup','aria-expanded','aria-hidden','aria-disabled','data-testid','data-test-id','data-sidebar-item','data-sidebar-keep-open','data-conversation-id','data-conversation-options-trigger','data-chat-id','data-id','jslog']);
  const knownTags = new Set(['a','aside','nav','div','span','p','section','article','header','footer','main','button','ul','ol','li','h1','h2','h3','h4','h5','h6','details','summary','form','input','dialog','svg','gem-nav-list-item','bard-sidenav','mat-sidenav','conversations-list','gem-icon-button','gem-menu-item','gem-button','mat-icon','gem-icon','mat-dialog-container']);
  function shape(value) {
    if (value === null) return null;
    return {length:value.length, uuid:/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value), hex:/^(?:c_)?[0-9a-f]{12,64}$/i.test(value)};
  }
  function route(href) {
    try {
      const url = new URL(href, location.origin);
      if (url.origin !== location.origin) return {sameOrigin:false};
      const known = new Set(['app','c','chat','u','g','conversation','history','project','projects','new','recents','chats']);
      return {sameOrigin:true, segments:url.pathname.split('/').filter(Boolean).map(part => known.has(part) ? part : shape(part))};
    } catch { return {invalid:true}; }
  }
  function nodeInfo(node) {
    const style = getComputedStyle(node), rect = node.getBoundingClientRect();
    const markers = {};
    for (const key of ['data-testid','data-test-id']) {
      const value = node.getAttribute(key);
      if (value !== null) markers[key] = knownMarkers.has(value) ? value : /^history-item-\d+-options$/.test(value) ? 'history-item-N-options' : shape(value);
    }
    const flags = {};
    for (const key of ['role','aria-haspopup','aria-expanded','aria-hidden','aria-disabled','data-sidebar-item','data-sidebar-keep-open']) {
      const value = node.getAttribute(key);
      if (value !== null) flags[key] = /^(true|false|menu|button|navigation|list|listitem|link|none|dialog)$/.test(value) ? value : '[other]';
    }
    const log = node.getAttribute('jslog');
    const tag = node.tagName.toLowerCase();
    const attributes = node.getAttributeNames().filter(name=>!name.startsWith('data-cc-'));
    return {
      tag:knownTags.has(tag)?tag:'[other-element]', attributes:attributes.filter(name=>knownAttributes.has(name)), unknownAttributeCount:attributes.filter(name=>!knownAttributes.has(name)).length, markers, flags,
      id:shape(node.getAttribute('id')), conversationId:shape(node.getAttribute('data-conversation-id')),
      triggerId:shape(node.getAttribute('data-conversation-options-trigger')),
      href:node.hasAttribute('href') ? route(node.getAttribute('href')) : null,
      metadata:log === null ? null : {length:log.length, hasMetadataKey:log.includes('BardVeMetadataKey:'), hasPlainConversationId:/"c_[0-9a-f]+"/i.test(log)},
      layout:{width:Math.round(rect.width), height:Math.round(rect.height),clientWidth:node.clientWidth,clientHeight:node.clientHeight, display:style.display, visibility:style.visibility, overflowX:style.overflowX,overflowY:style.overflowY, boxes:node.getClientRects().length, hidden:node.hasAttribute('hidden')}
    };
  }
  function inspectionInfo(candidate) {
    const result=Core.inspect(candidate);
    const visibility=value=>({reason:value.reason,blocker:value.blocker?nodeInfo(value.blocker):null});
    return {visibility:visibility(result.visibility),titleRecognized:result.titleRecognized,
      roots:result.roots.map(value=>({node:nodeInfo(value.root),accepted:value.accepted,visible:value.visibility.reason===null,visibility:visibility(value.visibility),contentExcluded:value.contentExcluded,
        menuFound:Boolean(value.menu),menu:value.menu?nodeInfo(value.menu):null,
        menuPath:value.trace.map(step=>({node:nodeInfo(step.row),distinctIds:step.ids,controlCount:step.buttons.length,controls:step.buttons.slice(0,3).map(nodeInfo)}))}))};
  }
  function collect() {
    const discovered = Core.discover();
    const roots = [...document.querySelectorAll(`${Provider.sidebars}, nav, aside, [role="navigation"], bard-sidenav, mat-sidenav, conversations-list`)].slice(0,16);
    const samples = [], signatures = new Set();
    // Include provider-marked rows even when their enclosing sidebar changed.
    const candidates = new Set([...roots.flatMap(root=>[...root.querySelectorAll(candidateSelector)].slice(0,80)),
      ...document.querySelectorAll('[data-sidebar-item], [data-test-id="conversation"], [data-conversation-id], [data-conversation-options-trigger]')]);
    for (const candidate of candidates) {
      if (candidate.closest('main, [role="main"]') && !roots.some(root=>root.contains(candidate))) continue;
      const node = nodeInfo(candidate), inspection=inspectionInfo(candidate);
      const signature = JSON.stringify({node:{...node,layout:undefined},inspection});
      if (signatures.has(signature)) continue;
      signatures.add(signature);
      const ancestors = [];let parent = candidate.parentElement;
      for (let depth=0;parent && parent!==document.body && depth<5;depth++,parent=parent.parentElement) ancestors.push(nodeInfo(parent));
      let identityRecognized=false;
      try { identityRecognized=Boolean(Provider.identity(candidate)); } catch { /* No raw exception text in reports. */ }
      const nearby = candidate.parentElement || candidate;
      samples.push({node, ancestors, inspection,identityRecognized, recognizedChat:discovered.some(chat=>chat.anchor===candidate), checkboxAttached:Boolean(candidate.querySelector(':scope > [data-cc-box]')),
        controls:[...nearby.querySelectorAll(buttonSelector)].slice(0,6).map(nodeInfo)});
      if (samples.length>=20) break;
    }
    return {schema:1, version:chrome.runtime.getManifest().version, provider:Provider.name, detectedChats:discovered.length,
      roots:roots.map(root=>({node:nodeInfo(root), providerRoot:root.matches(Provider.sidebars)&&Provider.isRoot(root), insideMain:Boolean(root.closest('main, [role="main"]')),
        candidateCount:root.querySelectorAll(candidateSelector).length})), samples};
  }
  function save() {
    const blob = new Blob([JSON.stringify(collect(),null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href=url;link.download=`ai-chat-diagnose-${Provider.key}.json`;
    link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  globalThis.ChatCleanerDiagnostics = Object.freeze({save});
})();
