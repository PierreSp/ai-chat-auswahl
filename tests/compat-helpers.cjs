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
   const title=settings.title||'Alte Notizen';
   const sentence=value=>`This will permanently delete ${value}. This can't be undone.`;
   description.id='native-description';description.textContent=settings.buttonOnly?'Confirm removal.':sentence(settings.describedTitle||title);
   description.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
   dialog.setAttribute('aria-describedby',description.id);
   const form=document.createElement('form'),visibleHeading=document.createElement('div'),visibleDescription=document.createElement('div');
   visibleHeading.textContent=heading.textContent;visibleDescription.textContent=settings.buttonOnly?'Confirm removal.':sentence(title);
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
module.exports={modernChatGPT,metadataGemini,reportedChatGPT,reportedGemini,liveChatGPTDialog};
