// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Pierre Springer
(() => {
  'use strict';
  if (document.querySelector('[data-cc-app]')) return;
  const Core = globalThis.ChatCleanerCore;
  if (!Core) return;
  const {t, language} = globalThis.ChatCleanerI18n;
  const selected = new Map();
  const boxes = new Map();
  let opened = false, busy = false, loading = false, reviewing = false, lastId = null, controller, loadController, refreshTimer;
  let chats = [];
  const host = document.createElement('div');
  host.dataset.ccApp = '';
  host.lang = language;
  const ui = host.attachShadow({mode: 'open'});
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'text') node.textContent = value;
      else if (key === 'class') node.className = value;
      else if (typeof value === 'boolean') { if (value) node.setAttribute(key, ''); }
      else node.setAttribute(key, value);
    }
    for (const child of children) node.append(typeof child === 'string' ? document.createTextNode(child) : child);
    return node;
  }
  const button = (id, text, cls = '', attrs = {}) => el('button', {id, text, class:cls, type:'button', ...attrs});
  const provider = Core.provider;
  const note = provider.key === 'gemini'
    ? t('geminiDeletionNote')
    : t('deletionNote');
  ui.append(el('style', {text:globalThis.ChatCleanerStyle}),
    button('launch',t('launch'),'primary'),el('div',{id:'scrim',hidden:true}),
    el('section',{id:'panel','aria-label':t('panelLabel'),hidden:true},[
      el('div',{class:'row between'},[
        el('div',{class:'row'},[el('strong',{text:'ChatSweep'}),el('span',{id:'provider',text:provider.name})]),
        el('div',{class:'icon-actions'},[
          button('minimize','−','close',{'aria-label':t('minimizeLabel'),title:t('minimizeTitle')}),
          button('close','×','close',{'aria-label':t('closeLabel'),title:t('closeTitle')})])]),
      el('h2',{text:t('selectHeading')}),
      el('div',{id:'stats'},[el('span',{id:'number',text:'0'}),t('selectedLabel'),el('p',{id:'loaded',class:'muted'})]),
      el('p',{id:'hint',class:'muted'}),
      el('details',{id:'scope'},[
        el('summary',{text:t('scopeHeading')}),
        el('p',{text:t('scopeLoaded')}),
        ...(provider.key === 'chatgpt' ? [el('p',{text:t('scopeCodex')})] : []),
        el('p',{text:t('scopeHidden')})]),
      button('load-more',t('loadMore'),'full'),
      el('div',{id:'loading',hidden:true},[
        el('p',{id:'loading-progress',class:'muted',role:'status'}),
        button('stop-loading',t('stopLoading'),'full')]),
      el('p',{id:'unavailable',class:'muted',hidden:true}),
      el('div',{class:'actions'},[button('all',t('selectAll')),button('none',t('selectNone'))]),
      button('remove',t('deleteSelection'),'danger full',{disabled:true}),
      el('div',{id:'running',hidden:true},[
        el('progress',{id:'bar',max:'1',value:'0','aria-label':t('deletionProgress')}),
        el('p',{id:'progress',class:'progress'}),button('stop',t('stop'),'full'),
        el('p',{id:'busy-note',class:'muted',text:t('busyNote')})]),
      el('p',{id:'status',role:'status','aria-live':'polite',text:t('ready')})]),
    el('dialog',{id:'review','aria-labelledby':'review-title','aria-describedby':'review-warning'},[
      el('h2',{id:'review-title',text:t('reviewHeading')}),
      el('p',{id:'review-warning',text:t('reviewWarning', provider.name)}),
      el('p',{id:'provider-note',text:note}),
      el('p',{text:t('reviewKeepTab')}),
      el('p',{id:'review-count'}),el('ol',{id:'review-list'}),
      el('label',{id:'agree-row'},[el('input',{id:'agree',type:'checkbox'}),el('span',{text:t('reviewAgree')})]),
      el('div',{class:'footer'},[button('cancel',t('cancel')),button('confirm','','danger',{disabled:true})])])
  );
  document.documentElement.append(host);
  const $ = id => ui.getElementById(id);
  function message(text, error = false) { $('status').textContent = text; $('status').classList.toggle('error', error); }
  function update() {
    $('number').textContent = selected.size;
    $('loaded').textContent = t('loadedCount', chats.length);
    $('hint').textContent = chats.length ? t('rangeHint') : t('noChats', provider.name);
    const locked = busy || loading || reviewing;
    $('remove').disabled = !selected.size || locked;
    $('all').disabled = !chats.length || locked;
    $('none').disabled = !selected.size || locked;
    $('close').disabled = busy || loading;
    $('minimize').disabled = busy || loading;
    $('load-more').hidden = loading || busy;
    $('load-more').disabled = reviewing || !chats.length;
    $('loading').hidden = !loading;
    const available = new Map(chats.map(chat=>[chat.id,chat.title]));
    const missing = [...selected.values()].filter(item=>available.get(item.id)!==item.title).length;
    $('unavailable').hidden = !missing || busy;
    $('unavailable').textContent = t('unavailableCount', missing);
    $('launch').textContent = opened ? t(selected.size===1?'launchSelectedOne':'launchSelectedMany', selected.size) : t('launch');
    $('running').hidden = !busy;
    $('remove').hidden = busy;
    $('scrim').hidden = !busy;
    for (const [anchor, box] of boxes) {
      box.input.checked = selected.has(box.id);
      box.input.disabled = locked;
    }
  }
  function setSelected(chat, value) {
    if (value) selected.set(chat.id, {id: chat.id, title: chat.title});
    else selected.delete(chat.id);
  }
  function cleanBoxes() {
    for (const [anchor, box] of boxes) {
      box.host.remove();anchor.removeAttribute('data-cc-anchor');
    }
    boxes.clear();
  }
  function refresh() {
    if (!opened || busy || reviewing) return;
    chats = Core.discover();
    const byAnchor = new Map(chats.map(chat => [chat.anchor, chat]));
    for (const [anchor, box] of boxes) {
      const current = byAnchor.get(anchor);
      if (!current || current.id !== box.id || !box.host.isConnected) {
        box.host.remove();anchor.removeAttribute('data-cc-anchor');boxes.delete(anchor);
      }
    }
    for (const chat of chats) {
      if (boxes.has(chat.anchor)) {
        boxes.get(chat.anchor).input.setAttribute('aria-label', t('selectChat', chat.title));
        continue;
      }
      const boxHost = document.createElement('span');boxHost.dataset.ccBox = '';
      const shadow = boxHost.attachShadow({mode:'open'});
      shadow.append(el('style',{text:':host{all:initial;display:block;width:32px;height:32px}label{display:flex;align-items:center;justify-content:center;width:32px;height:32px;cursor:pointer}input{box-sizing:border-box;margin:0;width:19px;height:19px;accent-color:#255b45;cursor:pointer}input:focus-visible{outline:3px solid #258060;outline-offset:3px}'}),el('label',{},[el('input',{type:'checkbox'})]));
      const input = shadow.querySelector('input');
      input.setAttribute('aria-label', t('selectChat', chat.title));
      boxHost.addEventListener('pointerdown', event => event.stopPropagation());
      boxHost.addEventListener('keydown', event => event.stopPropagation());
      boxHost.addEventListener('click', event => event.stopPropagation());
      input.addEventListener('click', event => {
        event.stopPropagation();
        if (busy || loading || reviewing) {event.preventDefault();return;}
        const current = Core.discover().find(c => c.anchor === chat.anchor && c.id === chat.id);
        if (!current) {event.preventDefault();refresh();return;}
        const next = input.checked;
        const start = chats.findIndex(c => c.id === lastId), end = chats.findIndex(c => c.id === chat.id);
        if (event.shiftKey && start >= 0 && end >= 0) {
          chats.slice(Math.min(start,end),Math.max(start,end)+1).forEach(c => setSelected(c,next));
        } else setSelected(current,next);
        lastId = current.id; update();
      });
      chat.anchor.dataset.ccAnchor = '';
      chat.anchor.append(boxHost);
      boxes.set(chat.anchor, {id:chat.id,host:boxHost,input});
    }
    update();
  }
  function scheduleRefresh(records) {
    if (!opened || busy || reviewing || refreshTimer) return;
    if (records.every(r => r.target === host || host.contains(r.target))) return;
    refreshTimer = setTimeout(() => {refreshTimer = null;refresh();},120);
  }
  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href','id','data-conversation-id','data-conversation-options-trigger','data-sidebar-item','data-sidebar-keep-open','data-app-action-sidebar-thread-id','data-app-action-sidebar-thread-kind','data-app-action-sidebar-thread-row','data-app-action-sidebar-thread-title','data-test-id','data-testid','jslog','aria-label','hidden','aria-hidden','open','class','style'],characterData:true});
  function open() { if (busy || loading) return;opened=true;$('panel').hidden=false;$('launch').hidden=true;refresh();$('close').focus(); }
  function close() {
    if (busy || loading) return;
    opened=false;selected.clear();lastId=null;cleanBoxes();update();message(t('ready'));
    $('panel').hidden=true;$('launch').hidden=false;$('launch').focus();
  }
  let snapshot = [];
  function renderReview() {
    const list = $('review-list'); list.replaceChildren();
    const titleCounts = new Map();
    const available = new Map(Core.discover().map(chat=>[chat.id,chat.title]));
    snapshot.forEach(item=>titleCounts.set(item.title,(titleCounts.get(item.title)||0)+1));
    snapshot.forEach(item=>{
      const title=el('span',{class:'title',text:item.title});
      if(provider.isTask(item.id)) title.append(el('small',{text:t('codexTask')}));
      if(titleCounts.get(item.title)>1) title.append(el('small',{text:t('chatId', item.id)}));
      if(available.get(item.id)!==item.title) title.append(el('small',{class:'unavailable',text:t('reviewUnavailable')}));
      const remove=button('', t('remove'), '', {'aria-label':t('removeFromSelection', item.title)});
      remove.onclick=()=>{
        snapshot=snapshot.filter(entry=>entry.id!==item.id); selected.delete(item.id);
        renderReview();update();
        const next=$('review-list').querySelector('button');(next||$('cancel')).focus();
      };
      list.append(el('li',{},[title,remove]));
    });
    $('review-count').textContent=snapshot.length ? t(snapshot.length===1?'reviewCountOne':'reviewCountMany', snapshot.length, provider.name) : t('emptySelection');
    $('agree').checked=false;$('agree').disabled=!snapshot.length;$('confirm').disabled=true;
    $('confirm').textContent=t(snapshot.length===1?'confirmOne':'confirmMany', snapshot.length);
  }
  function review() {
    if (!selected.size || busy || loading || reviewing) return;
    snapshot=[...selected.values()].map(item=>Object.freeze({...item}));
    renderReview();reviewing=true;update();$('review').showModal();$('cancel').focus();
  }
  function cancelReview() {reviewing=false;$('review').close();snapshot=[];refresh();($('remove').disabled?$('close'):$('remove')).focus();}
  async function run(items) {
    if (busy || !items.length) return;
    busy=true;controller=new AbortController();update();
    let done=0;$('bar').max=items.length;$('bar').value=0;
    const guard=Core.createBatchGuard();
    try {
      Core.preflight(items);
      for (const item of items) {
        if (controller.signal.aborted) throw new Error(t('errorStopped'));
        $('progress').textContent=t('progressItem', done+1, items.length, item.title);
        message(t('deletingProgress', done, items.length));
        await Core.deleteChat(item,controller.signal,guard);
        selected.delete(item.id);done++;$('bar').value=done;update();
      }
      $('progress').textContent=t('checkingResult');
      await guard.settle(controller.signal);
      message(t('deletionDone', done, items.length));
    } catch (error) {
      message(t('deletionStopped', done, items.length, error.message),true);
    } finally {busy=false;controller=null;refresh();update();}
  }
  async function loadMore() {
    if (busy || loading || reviewing) return;
    loading=true;loadController=new AbortController();update();
    $('loading-progress').textContent=t('loadingProgress');
    message(t('loadingStarted'));$('stop-loading').focus();
    try {
      const result=await Core.loadMore(loadController.signal,({added})=>{
        refresh();$('loading-progress').textContent=t('loadingAdded', added);
      });
      message(t('loadingDone', result.added, result.limited ? t('loadLimit') : t('loadNoMore')));
    } catch(error) {
      message(loadController.signal.aborted ? t('loadingStopped') : error.message,!loadController.signal.aborted);
    } finally {loading=false;loadController=null;refresh();$('load-more').focus();}
  }
  $('launch').onclick=open;$('close').onclick=close;
  $('minimize').onclick=()=>{if(busy||loading)return;$('panel').hidden=true;$('launch').hidden=false;update();$('launch').focus();};
  $('load-more').onclick=loadMore;
  $('stop-loading').onclick=()=>{loadController?.abort();$('loading-progress').textContent=t('loadingStopping');};
  $('all').onclick=()=>{refresh();chats.forEach(chat=>setSelected(chat,true));update();};
  $('none').onclick=()=>{selected.clear();lastId=null;update();};
  $('remove').onclick=review;$('cancel').onclick=cancelReview;
  $('review').addEventListener('cancel',event=>{event.preventDefault();cancelReview();});
  $('agree').onchange=()=>{$('confirm').disabled=!$('agree').checked||!snapshot.length;};
  $('confirm').onclick=()=>{
    if (!$('agree').checked || !reviewing || busy) return;
    const items=snapshot;snapshot=[];reviewing=false;$('review').close();run(items);
  };
  $('stop').onclick=()=>{controller?.abort();$('progress').textContent=t('stopping');};
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(busy||loading)){controller?.abort();loadController?.abort();event.preventDefault();}},true);
  window.addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue='';}});
  chrome.runtime.onMessage.addListener((request,sender,respond)=>{
    if(request?.type==='CHAT_CLEANER_OPEN'){open();respond({ok:true});}
  });
})();
