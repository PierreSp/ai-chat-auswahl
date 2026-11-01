// DOM variants captured from public provider adapter sources, without account data.
async function modernChatGPT(page, {hiddenMenu=false}={}) {
 await page.evaluate(({hiddenMenu})=>{
  const nav=document.querySelector('nav');nav.removeAttribute('id');nav.removeAttribute('aria-label');
  for(const row of document.querySelectorAll('#rows>.row')) {
   const link=row.querySelector('a');const entry=document.createElement('div');
   entry.setAttribute('role','button');entry.setAttribute('data-sidebar-item','true');
   entry.setAttribute('aria-label',link.querySelector('span').textContent);
   entry.style.cssText='display:flex;min-height:44px;flex:1';
   while(link.firstChild)entry.append(link.firstChild);
   const menu=row.querySelector('button')||entry.querySelector('button');
   menu.setAttribute('data-conversation-options-trigger',row.dataset.id);menu.removeAttribute('aria-haspopup');
   if(hiddenMenu)menu.style.visibility='hidden';
   entry.append(menu);link.replaceWith(entry);
  }
 },{hiddenMenu});
}
async function metadataGemini(page, encoded) {
 await page.evaluate(encoded=>{
  for(const row of document.querySelectorAll('#rows>.row')) {
   row.removeAttribute('data-test-id');row.classList.add('conversation-items-container');
   const link=row.querySelector('a');const entry=document.createElement('div');
   entry.setAttribute('data-test-id','conversation');entry.style.cssText='display:flex;min-height:44px;flex:1';
   const metadata=JSON.stringify([['c_'+row.dataset.id]]);
   entry.setAttribute('jslog','123;track:click;BardVeMetadataKey:'+(encoded?btoa(metadata):metadata)+';mutable:true');
   while(link.firstChild)entry.append(link.firstChild);link.replaceWith(entry);
  }
 },encoded);
}
// Structural shapes from the user's redacted 1.2.2 diagnostic reports.
async function reportedChatGPT(page) {
 await page.evaluate(()=>{
  const nav=document.querySelector('nav'),aside=document.createElement('aside');
  nav.removeAttribute('id');nav.setAttribute('role','navigation');nav.setAttribute('aria-label','Navigation principale');
  nav.replaceWith(aside);aside.append(nav);
  const home=document.createElement('a');home.href='/';home.textContent='Accueil';nav.prepend(home);
  for(const row of document.querySelectorAll('#rows>.row')) {
   const link=row.querySelector('a'),menu=row.querySelector('button');
   row.append(menu); // Real report: four ancestors between the link and row.
   let wrapped=link;
   for(let i=0;i<3;i++) {
    const wrapper=document.createElement('div');wrapper.style.display='flex';
    wrapped.replaceWith(wrapper);wrapper.append(wrapped);wrapped=wrapper;
   }
   row.setAttribute('role','group');
   const contents=document.createElement('div');contents.style.display='contents';
   row.replaceWith(contents);contents.append(row);
  }
 });
}
async function reportedGemini(page, mainRole=false) {
 await page.evaluate(mainRole=>{
  const nav=document.querySelector('nav'),sidebar=document.createElement('bard-sidenav');
  sidebar.setAttribute('role','navigation');sidebar.style.display='flex';
  const shell=document.createElement(mainRole?'div':'main');
  if(mainRole)shell.setAttribute('role','main');
  shell.style.cssText='position:static;max-width:none';
  nav.replaceWith(shell);shell.append(sidebar);sidebar.append(nav);
  nav.removeAttribute('aria-label');
  const rows=document.querySelector('#rows'),list=document.createElement('conversations-list');
  list.style.display='grid';rows.replaceWith(list);list.append(rows);
  for(const row of rows.querySelectorAll('.row')) {
   const link=row.querySelector('a'),menu=row.querySelector('button'),host=document.createElement('gem-icon-button');
   link.setAttribute('jslog','123;BardVeMetadataKey:'+btoa(JSON.stringify([['c_'+row.dataset.id]])));
   host.setAttribute('data-test-id','actions-menu-button');host.setAttribute('aria-haspopup','menu');
   menu.removeAttribute('aria-haspopup');menu.removeAttribute('data-test-id');menu.replaceWith(host);host.append(menu);
  }
 },mainRole);
}
// Native ChatGPT dialog inspected live; all titles here remain fixture data.
async function liveChatGPTDialog(page, settings={}) {
 await page.evaluate(settings=>{
  options.english=true;
  new MutationObserver(()=>{
   const dialog=document.querySelector('dialog');if(!dialog||dialog.dataset.liveShape)return;
   dialog.dataset.liveShape='true';
   const heading=dialog.querySelector('h2'),description=dialog.querySelector('p');
   const title=settings.title??'Alte Notizen';
   const sentence=value=>`This will permanently delete ${value}. This can't be undone.`;
   description.id='native-description';description.textContent=settings.buttonOnly?'Confirm removal.':sentence(settings.describedTitle??title);
   description.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
   dialog.setAttribute('aria-describedby',description.id);
   if(settings.nativeShell){dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('data-overlay-owner','slate-sidebar');}
   const form=document.createElement('form'),visibleHeading=document.createElement('div'),visibleDescription=document.createElement('div');
   visibleHeading.textContent=heading.textContent;visibleDescription.textContent=settings.noVisibleCopy?'Confirm removal.':settings.buttonOnly?'Confirm removal.':sentence(title);
   form.append(visibleHeading,visibleDescription);
   for(const button of [...dialog.querySelectorAll('button')]){
    if(button.hasAttribute('data-testid')){button.removeAttribute('data-testid');button.textContent='Delete chat';button.type='button';}
    form.append(button);
   }
   if(settings.buttonOnly){const button=document.createElement('button');button.type='button';button.textContent=sentence(title);form.append(button);}
   if(settings.extraTitle){const span=document.createElement('span');span.textContent=settings.extraTitle;form.append(span);}
   dialog.append(form);
  }).observe(document.body,{childList:true,subtree:true});
 },settings);
}
// Native Gemini dialog and delayed Angular menu binding, using synthetic IDs.
async function liveGemini(page, settings={}) {
 await reportedGemini(page);
 await page.evaluate(settings=>{
  options.english=true;
  for(const button of document.querySelectorAll('gem-icon-button button')) {
   const open=button.onclick;
   button.onclick=event=>{
    open(event);
    document.querySelector('[role="menu"] [data-test-id="delete-button"]').setAttribute('jslog','186000;track:generic_click,impression;BardVeMetadataKey:'+btoa(JSON.stringify([[`c_${settings.menuId||button.closest('[data-id]').dataset.id}`]])));
    const host=button.parentElement,controls=host.getAttribute('aria-controls');
    if(settings.bindingDelay){host.removeAttribute('aria-controls');host.removeAttribute('aria-expanded');setTimeout(()=>{host.setAttribute('aria-controls',settings.foreignMenu?'foreign-menu':controls);host.setAttribute('aria-expanded','true');},settings.bindingDelay);}
   };
  }
  new MutationObserver(()=>{
   const dialog=document.querySelector('dialog');if(!dialog||dialog.dataset.liveGemini)return;
   dialog.dataset.liveGemini='true';
   const heading=dialog.querySelector('h2'),description=dialog.querySelector('p');
   heading.textContent=settings.heading||'Delete chat?';
   description.textContent=settings.description||'This will delete prompts, responses and feedback from your Gemini Apps activity, plus any content that you created.';
   const help=document.createElement('a');help.href='https://support.google.com/gemini?p=deleted_chats';help.textContent='Learn more Opens in a new window';description.after(help);
   for(const button of dialog.querySelectorAll('button')) {
    const host=document.createElement('gem-button');button.replaceWith(host);host.append(button);
    if(button.hasAttribute('data-test-id')) {
     button.removeAttribute('data-test-id');button.removeAttribute('data-testid');
     button.textContent=settings.confirmName||'Delete';
     button.setAttribute('jslog',(settings.action||'186009')+';track:generic_click,impression;BardVeMetadataKey:'+(settings.invalidMetadata?'not-base64':btoa(JSON.stringify([settings.confirmIds||[`c_${settings.confirmId||'8000000000000002'}`]]))));
     if(settings.missingMetadataKey)button.setAttribute('jslog','186009;other:"c_8000000000000002"');
     if(settings.duplicateMetadataKey)button.setAttribute('jslog',button.getAttribute('jslog')+';BardVeMetadataKey:'+btoa(JSON.stringify([['c_8000000000000099']])));
    } else {button.textContent=settings.cancelName||'Cancel';button.setAttribute('jslog','305700;track:generic_click,impression');}
   }
   if(settings.hiddenMetadata){
    const confirm=dialog.querySelector('button[jslog^="186009"]'),hidden=confirm.cloneNode(true);
    hidden.hidden=true;dialog.append(hidden);confirm.removeAttribute('jslog');confirm.setAttribute('data-test-id','confirm-button');
   }
  }).observe(document.body,{subtree:true,childList:true});
 },settings);
}
async function codexTasks(page, settings={}) {
 await reportedChatGPT(page);
 await page.evaluate(settings=>{
  if(settings.onlyTasks)document.querySelector('#rows').replaceChildren();
  const id='task_e_00000000000000000000000000000001';
  addChat(id,'Codex-Testaufgabe');
  const row=document.querySelector(`[data-id="${id}"]`),a=row.querySelector('a'),button=row.querySelector('button');
  row.setAttribute('data-app-action-sidebar-thread-row','');
  row.setAttribute('data-app-action-sidebar-thread-kind','remote');
  row.setAttribute('data-app-action-sidebar-thread-id','remote:'+id);
  a.href='/remote/'+id;
  const duplicate=a.cloneNode(true);duplicate.textContent='';duplicate.setAttribute('aria-hidden','true');row.append(duplicate);
  const open=button.onclick;
  button.onclick=event=>{
   open(event);
   const menu=document.querySelector('[role="menu"]'),remove=menu.querySelector('[role="menuitem"]');
   remove.textContent='Permanently delete';remove.className='text-danger';
   if(settings.direct)remove.onclick=()=>{deleted.push(id);row.remove();menu.remove();};
  };
 },settings);
}
async function stagedGeminiDialog(page, mode, settings={}) {
 await reportedGemini(page);
 await page.evaluate(({mode,settings})=>{
  const style=document.createElement('style');style.textContent='mat-dialog-container{display:block;position:fixed;top:150px;left:330px;width:420px;padding:20px;background:white}mat-dialog-content,mat-dialog-actions,gem-button{display:block}message-dialog{display:contents;overflow:hidden}mat-dialog-container button{display:flex;padding:12px}';document.head.append(style);
  for(const button of document.querySelectorAll('gem-icon-button button')) {
   const open=button.onclick;
   button.onclick=event=>{
    open(event);const menu=document.querySelector('[role="menu"]'),row=button.closest('[data-id]'),id=row.dataset.id;
    menu.querySelector('[role="menuitem"]').onclick=()=>{
     menu.remove();button.parentElement.setAttribute('aria-expanded','false');
     const dialog=document.createElement('mat-dialog-container');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-label','Delete chat');dialog.setAttribute('aria-modal','false');
     const inner=document.createElement('div'),surface=document.createElement('div'),message=document.createElement('message-dialog');inner.append(surface);surface.append(message);dialog.append(inner);
     const populate=()=>{
      const h=document.createElement('h1');h.textContent='Delete chat?';
      const content=document.createElement('mat-dialog-content'),span=document.createElement('span'),p=document.createElement('p'),help=document.createElement('a');
      p.textContent='This will delete prompts, responses and feedback from your Gemini Apps activity, plus any content that you created.';
      help.href='https://support.google.com/gemini?p=deleted_chats';help.textContent='Learn more Opens in a new window';span.append(p);content.append(span,help);
      const actions=document.createElement('mat-dialog-actions');
      for(const [name,action] of [['Cancel','305700'],['Delete','186009']]) {
       const host=document.createElement('gem-button'),control=document.createElement('button'),label=document.createElement('span');label.textContent=name;control.append(label);host.append(control);actions.append(host);
       const mark=()=>control.setAttribute('jslog',action+';track:generic_click,impression'+(action==='186009'?';BardVeMetadataKey:'+btoa(JSON.stringify([null,null,null,null,null,null,null,['c_'+(settings.foreignId||id),null,0]])):''));
       if(mode==='metadata')setTimeout(mark,settings.delay||200);else mark();
       control.onclick=()=>{if(name==='Delete'){deleted.push(id);row.remove();}dialog.remove();};
      }
      message.append(h,content,actions);
     };
     if(mode==='body'){document.body.append(dialog);setTimeout(populate,settings.delay||200);}
     else {populate();if(mode==='animation')inner.style.visibility='hidden';document.body.append(dialog);if(mode==='animation')setTimeout(()=>inner.style.visibility='visible',settings.delay||200);}
    };
   };
  }
 },{mode,settings});
}
// Claude can briefly render two native confirmation shells during a transition.
// Keep both actionable so choosing either while ambiguous is observable.
async function overlappingClaudeDialogs(page, settings={}) {
 await page.evaluate(settings=>{
  window.nativeConfirmations=[];window.nativeDialogOpens=0;
  for(const more of document.querySelectorAll('#rows .row button')) {
   const open=more.onclick;
   more.onclick=event=>{
    open(event);
    const row=more.closest('.row'),id=row.dataset.id;
    const menu=document.querySelector('[role="menu"]');
    menu.querySelector('[role="menuitem"]').onclick=()=>{
     menu.remove();more.setAttribute('aria-expanded','false');
     const overlap=++window.nativeDialogOpens===(settings.overlapAt??2);
     let phase=overlap?'overlap':'settled';
     const makeDialog=foreign=>{
      const dialog=document.createElement('div');
      dialog.setAttribute('role','alertdialog');dialog.setAttribute('data-cds','ConfirmationDialog');dialog.setAttribute('data-open','');
      dialog.style.cssText=`position:fixed;left:${foreign?650:300}px;top:100px;width:300px;padding:20px;background:white`;
      const heading=document.createElement('h2');heading.textContent='Delete session?';
      const description=document.createElement('p');description.textContent='This session will be permanently deleted. This can’t be undone.';
      const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.onclick=()=>dialog.remove();
      const confirm=document.createElement('button');confirm.textContent='Delete';confirm.className='bg-danger-000';
      confirm.onclick=()=>{
       const count=[...document.querySelectorAll('[role="alertdialog"]')].filter(el=>el.isConnected&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden').length;
       nativeConfirmations.push({id:foreign?'foreign-confirmation':id,count,phase});
       deleted.push(foreign?'foreign-confirmation':id);if(!foreign)row.remove();dialog.remove();
      };
      dialog.append(heading,description,cancel,confirm);return dialog;
     };
     let primary=makeDialog(false);document.body.append(primary);
     if(!overlap)return;
     const duplicate=makeDialog(true);
     if(settings.mode==='foreign-id')duplicate.setAttribute('data-conversation-id','00000000-0000-4000-8000-000000000099');
     document.body.append(duplicate);
     if(settings.mode==='persistent')return;
     if(settings.mode==='changed-target')setTimeout(()=>{row.querySelector('a span').textContent='Changed during transition';},150);
     if(settings.mode==='unstable'){
      setTimeout(()=>duplicate.remove(),150);
      setTimeout(()=>document.body.append(duplicate),250);
      setTimeout(()=>{const replacement=makeDialog(false);primary.replaceWith(replacement);primary=replacement;},350);
     }
     setTimeout(()=>{phase='settled';duplicate.remove();},settings.delay??550);
    };
   };
  }
 },settings);
}
module.exports={modernChatGPT,metadataGemini,reportedChatGPT,reportedGemini,liveChatGPTDialog,liveGemini,codexTasks,stagedGeminiDialog,overlappingClaudeDialogs};
