const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {modernChatGPT,metadataGemini,reportedChatGPT,reportedGemini,liveChatGPTDialog,liveGemini,codexTasks,stagedGeminiDialog,claudeNotificationToast}=require('./compat-helpers.cjs');
const extension=path.resolve(__dirname,'..');const fixture=fs.readFileSync(path.join(__dirname,'fixture.html'),'utf8');
let context,profile;
before(async()=>{profile=fs.mkdtempSync(path.join(os.tmpdir(),'chat-cleaner-test-'));context=await chromium.launchPersistentContext(profile,{channel:'chromium',executablePath:process.env.CHROMIUM_PATH,headless:true,locale:'de-DE',env:{...process.env,LANG:'de_DE.UTF-8',LANGUAGE:'de_DE'},args:['--lang=de-DE',`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});await context.route('**/*',r=>['chatgpt.com','claude.ai','gemini.google.com'].includes(new URL(r.request().url()).hostname)?r.fulfill({contentType:'text/html',headers:r.request().url().includes('tt=1')?{'Content-Security-Policy':"require-trusted-types-for 'script'"}:{},body:fixture}):r.abort());});
after(async()=>{await context?.close();if(profile)fs.rmSync(profile,{recursive:true,force:true});});
async function pageFor(t,url='https://chatgpt.com/'){const p=await context.newPage();p.setDefaultTimeout(2500);t.after(()=>p.close());await p.goto(url);await p.getByRole('button',{name:'Chats aufräumen',exact:true}).click();return p;}
const box=(p,title)=>p.getByRole('checkbox',{name:`Chat auswählen: ${title}`,exact:true});
test('Codex raw title: rendered formatting does not change the confirmation title',async t=>{
 const p=await pageFor(t);await codexTasks(p);
 await p.evaluate(()=>{
  const row=document.querySelector('[data-app-action-sidebar-thread-row]');
  row.setAttribute('data-app-action-sidebar-thread-title','Datei __cache__ aktualisieren');
  row.querySelector('a span').textContent='Datei cache aktualisieren';
 });
 await liveChatGPTDialog(p,{title:'Datei __cache__ aktualisieren'});
 await p.locator('[data-app-action-sidebar-thread-row]').getByRole('checkbox').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['task_e_00000000000000000000000000000001']);
});
test('Codex raw title: changing stored title after selection stops before any menu action',async t=>{
 const p=await pageFor(t);await codexTasks(p);
 await p.evaluate(()=>document.querySelector('[data-app-action-sidebar-thread-row]').setAttribute('data-app-action-sidebar-thread-title','Codex-Testaufgabe'));
 await box(p,'Codex-Testaufgabe').check();
 await p.evaluate(()=>{
  document.querySelector('[data-app-action-sidebar-thread-row]').setAttribute('data-app-action-sidebar-thread-title','Andere Aufgabe');
  window.menuClicks=0;document.querySelector('[data-app-action-sidebar-thread-row] button').addEventListener('click',()=>window.menuClicks++);
 });
 await confirm(p);await status(p,/Angehalten|Fertig/);assert.equal(await p.evaluate(()=>window.menuClicks),0);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
for(const target of ['input','label'])for(const reverse of [false,true])test(`range selection: shift on ${target}, ${reverse?'up':'down'}, selects and clears the interval`,async t=>{
 const p=await pageFor(t),names=reverse?['Behalten: Projektideen','Urlaub planen']:['Urlaub planen','Behalten: Projektideen'];
 const click=async(name,shift=false)=>{
  const input=box(p,name),locator=target==='input'?input:input.locator('..');
  await locator.click({modifiers:shift?['Shift']:[],...(target==='label'?{position:{x:2,y:2}}:{})});
 };
 await click(names[0]);await click(names[1],true);
 assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).evaluateAll(els=>els.filter(el=>el.checked).length),3);
 await click(names[0],true);
 assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).evaluateAll(els=>els.filter(el=>el.checked).length),0);
 assert.equal(p.url(),'https://chatgpt.com/');assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
for(const mode of ['body','animation','metadata'])test(`staged Gemini: waits for ${mode} before confirming the selected ID`,async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await stagedGeminiDialog(p,mode);await box(p,'Alte Notizen').check();
 await confirm(p);await status(p,/Angehalten|Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),['8000000000000002']);
});
test('staged Gemini: delayed foreign confirmation metadata is still rejected',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await stagedGeminiDialog(p,'metadata',{foreignId:'8000000000000099'});await box(p,'Alte Notizen').check();
 await confirm(p);await status(p,/Angehalten|Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('staged Gemini: cancellation while the native dialog is building prevents confirmation',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await stagedGeminiDialog(p,'body',{delay:800});await box(p,'Alte Notizen').check();
 await confirm(p);await p.locator('mat-dialog-container').waitFor({state:'attached'});await p.getByRole('button',{name:'Anhalten',exact:true}).click();await status(p,/Angehalten/);
 await p.waitForTimeout(900);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
for(const [name,settings] of [
 ['current native dialog',{}],
 ['delayed menu binding',{bindingDelay:250}],
 ['localized metadata-bound confirmation',{heading:'Supprimer la discussion ?',description:'Cette discussion sera supprimée définitivement.',confirmName:'Supprimer',cancelName:'Annuler'}]
])test(`live Gemini: ${name} deletes only the selected fixture ID`,async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await liveGemini(p,settings);
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['8000000000000002']);
});
for(const [name,settings] of [
 ['foreign confirmation ID',{confirmId:'8000000000000099'}],
 ['foreign delete-menu metadata',{menuId:'8000000000000099'}],
 ['conflicting confirmation IDs',{confirmIds:['c_8000000000000002','c_8000000000000099']}],
 ['malformed confirmation metadata',{invalidMetadata:true}],
 ['missing native metadata field',{missingMetadataKey:true}],
 ['duplicate native metadata fields',{duplicateMetadataKey:true}],
 ['metadata on a hidden button authorizing a different control',{hiddenMetadata:true}],
 ['unknown action even with matching ID',{action:'987654',confirmName:'Supprimer'}],
 ['foreign title in prose despite matching metadata',{description:'This will delete Behalten: Projektideen.'}],
 ['delayed foreign menu binding',{bindingDelay:250,foreignMenu:true}]
])test(`live Gemini: rejects ${name}`,async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await liveGemini(p,settings);
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('live Gemini: stopping during delayed menu binding never opens the delete dialog',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await liveGemini(p,{bindingDelay:1200});
 await box(p,'Alte Notizen').check();await confirm(p);await p.getByRole('menu').waitFor();
 await p.getByRole('button',{name:'Anhalten',exact:true}).click();await status(p,/Angehalten/);
 assert.equal(await p.locator('dialog[data-live-gemini]').count(),0);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('live Gemini: changed target while waiting for menu binding never opens the delete dialog',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await liveGemini(p,{bindingDelay:600});
 await box(p,'Alte Notizen').check();await confirm(p);await p.getByRole('menu').waitFor();
 await p.evaluate(()=>document.querySelector('[data-id$="0002"]').remove());await status(p,/Angehalten/);
 assert.equal(await p.locator('dialog[data-live-gemini]').count(),0);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
for(const onlyTasks of [false,true])test(`Codex: selects tasks once per ID in a ${onlyTasks?'task-only':'mixed'} sidebar`,async t=>{
 const p=await pageFor(t);await codexTasks(p,{onlyTasks});await box(p,'Codex-Testaufgabe').check();
 assert.equal(await box(p,'Codex-Testaufgabe').count(),1);
 assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),onlyTasks?1:4);
 await p.getByRole('button',{name:'Auswahl löschen',exact:true}).click();
 assert.ok((await p.locator('#review-list').textContent()).includes('Codex-Aufgabe'));
 await p.getByRole('button',{name:'Abbrechen',exact:true}).click();assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
for(const direct of [false,true])test(`Codex: only the reviewed task is removed ${direct?'without':'with'} a native dialog`,async t=>{
 const p=await pageFor(t);await codexTasks(p,{direct});await box(p,'Codex-Testaufgabe').check();
 await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['task_e_00000000000000000000000000000001']);
 assert.equal(await p.locator('#rows .row').count(),3);
});
test('Codex: observing a direct deletion also works when the last task leaves the sidebar empty',async t=>{
 const p=await pageFor(t);await codexTasks(p,{direct:true,onlyTasks:true});await box(p,'Codex-Testaufgabe').check();
 await confirm(p);await status(p,/Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),['task_e_00000000000000000000000000000001']);
});
test('Codex: stopping after its direct menu action observes that task and keeps the next chat',async t=>{
 const p=await pageFor(t);await codexTasks(p,{direct:true});await box(p,'Codex-Testaufgabe').check();await box(p,'Alte Notizen').check();
 await confirm(p);await p.locator('[data-app-action-sidebar-thread-row]').waitFor({state:'detached'});
 await p.getByRole('button',{name:'Anhalten',exact:true}).click();await status(p,/Angehalten.*1 von 2/s);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['task_e_00000000000000000000000000000001']);
});
for(const mutation of ['wrong-id','wrong-kind','foreign-link','different-hidden-link'])test(`Codex: rejects conflicting row evidence: ${mutation}`,async t=>{
 const p=await pageFor(t);await codexTasks(p);await box(p,'Codex-Testaufgabe').waitFor();
 await p.evaluate(mutation=>{
  const row=document.querySelector('[data-app-action-sidebar-thread-row]');
  if(mutation==='wrong-id')row.setAttribute('data-app-action-sidebar-thread-id','remote:task_e_00000000000000000000000000000099');
  if(mutation==='wrong-kind')row.setAttribute('data-app-action-sidebar-thread-kind','chat');
  if(mutation==='foreign-link')row.querySelector('a').href='https://example.org/remote/task_e_00000000000000000000000000000001';
  if(mutation==='different-hidden-link')row.querySelector('a[aria-hidden]').href='/remote/task_e_00000000000000000000000000000099';
 },mutation);
 await box(p,'Codex-Testaufgabe').waitFor({state:'detached'});assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('Codex: a generic sidebar wrapper cannot bypass conflicting native task evidence',async t=>{
 const p=await pageFor(t);await codexTasks(p);await box(p,'Codex-Testaufgabe').waitFor();
 await p.evaluate(()=>{
  const row=document.querySelector('[data-app-action-sidebar-thread-row]'),wrapper=document.createElement('div');
  wrapper.setAttribute('data-sidebar-item','true');row.replaceWith(wrapper);wrapper.append(row);
  row.setAttribute('data-app-action-sidebar-thread-kind','chat');
 });
 await box(p,'Codex-Testaufgabe').waitFor({state:'detached'});assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('Codex: missing task menu never borrows another rows menu from an outer wrapper',async t=>{
 const p=await pageFor(t);await codexTasks(p);await box(p,'Codex-Testaufgabe').check();
 await p.evaluate(()=>{
  const row=document.querySelector('[data-app-action-sidebar-thread-row]'),wrapper=document.createElement('div');
  row.querySelector('button').remove();row.replaceWith(wrapper);wrapper.append(row,document.querySelector('[data-id$="0002"] button'));
 });
 await box(p,'Codex-Testaufgabe').waitFor({state:'detached'});
 await confirm(p);await status(p,/Angehalten/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('Codex: a normal-chat link cannot bypass the task ID of its native remote row',async t=>{
 const p=await pageFor(t);await codexTasks(p);await box(p,'Codex-Testaufgabe').waitFor();
 await p.evaluate(()=>document.querySelector('[data-app-action-sidebar-thread-row] a').href='/c/00000000-0000-4000-8000-000000000099');
 await box(p,'Codex-Testaufgabe').waitFor({state:'detached'});assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
async function confirm(p){await p.getByRole('button',{name:'Auswahl löschen',exact:true}).click();await p.getByRole('checkbox',{name:'Ich habe die Auswahl geprüft.'}).check();await p.getByRole('button',{name:/^\d+ Chats? endgültig löschen$/}).click();}
async function status(p,re){await p.getByRole('status').filter({hasText:re}).waitFor({timeout:15000});}

async function untitledChatGPT(p,settings={}) {
 await reportedChatGPT(p);
 await p.evaluate(settings=>{
  for(const row of document.querySelectorAll('#rows .row')){
   row.setAttribute('data-sidebar-cycle-item','');row.querySelector('a span').textContent='New chat';
  }
  const row=document.querySelector('[data-id$="0002"]');
  if(settings.named)row.querySelector('a span').textContent='Alte Notizen';
  if(settings.noRowMarker)row.removeAttribute('data-sidebar-cycle-item');
  if(settings.foreignMenu){row.querySelector('button').remove();row.parentElement.append(document.querySelector('[data-id$="0001"] button'));}
  if(settings.foreignId)options.dialogId='00000000-0000-4000-8000-000000000099';
 },settings);
 await liveChatGPTDialog(p,{title:'',nativeShell:true,...settings});
}
test('untitled ChatGPT: empty native title confirms only the selected ID among duplicate New chat labels',async t=>{
 const p=await pageFor(t);await untitledChatGPT(p);
 await p.locator('[data-id$="0002"]').getByRole('checkbox').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);
});
for(const [name,settings] of [
 ['named chat',{named:true}],['unknown row structure',{noRowMarker:true}],
 ['foreign row menu',{foreignMenu:true}],['foreign dialog ID',{foreignId:true}],
 ['conflicting accessible title',{describedTitle:'Unbeteiligter Chat'}],
 ['missing visible copy',{noVisibleCopy:true}],['unknown dialog structure',{nativeShell:false}]
])test(`untitled ChatGPT: rejects ${name}`,async t=>{
 const p=await pageFor(t);await untitledChatGPT(p,settings);
 await p.locator('[data-id$="0002"]').getByRole('checkbox').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('live ChatGPT dialog: full title in repeated plain prose confirms only the selected fixture chat',async t=>{
 const p=await pageFor(t);await liveChatGPTDialog(p);
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);
});
for(const [name,settings] of [
 ['different title with same prefix',{title:'Alte Notizen zusätzlich'}],
 ['conflicting accessible and visible descriptions',{describedTitle:'Urlaub planen'}],
 ['target wording only in a button',{buttonOnly:true}],
 ['wrong prose title with a matching secondary note',{title:'Urlaub planen',extraTitle:'Alte Notizen'}]
])test(`live ChatGPT dialog: rejects ${name}`,async t=>{
 const p=await pageFor(t);await liveChatGPTDialog(p,settings);
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});

for(const display of ['inline','contents'])test(`Gemini report: visible history in a ${display} wrapper is not a collapsed group`,async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await reportedGemini(p);
 await p.evaluate(display=>{
  const list=document.querySelector('conversations-list'),wrapper=document.createElement('gemini-history-wrapper');
  wrapper.style.cssText=`display:${display};overflow-x:hidden;overflow-y:auto`;
  list.replaceWith(wrapper);wrapper.append(list);
 },display);
 const metrics=await p.locator('gemini-history-wrapper').evaluate(el=>({width:el.clientWidth,height:el.clientHeight,childHeight:el.firstElementChild.getBoundingClientRect().height}));
 assert.equal(metrics.width,0);assert.equal(metrics.height,0);assert.ok(metrics.childHeight>0);
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();
 assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),3);
 assert.equal(await box(p,'Alte Notizen').isChecked(),true);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});

for(const cancelPointer of [true,false])test(`menu activation: pointerdown-triggered ChatGPT menu opens once (cancel=${cancelPointer})`,async t=>{
 const p=await pageFor(t);await reportedChatGPT(p);
 await p.evaluate(cancelPointer=>{
  const b=document.querySelector('[data-id$="0002"] button'),open=b.onclick;b.onclick=null;
  b.addEventListener('pointerdown',event=>{if(event.button===0 && !event.ctrlKey){open(new MouseEvent('click'));if(cancelPointer)event.preventDefault();}});
  b.addEventListener('click',()=>document.querySelector('[role="menu"]')?.remove());
 },cancelPointer);
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);
});
test('menu activation: cancelled pointerdown does not suppress a click-driven ChatGPT menu',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>document.querySelector('[data-id$="0002"] button').addEventListener('pointerdown',event=>event.preventDefault()));
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);
});


test('report regression: ChatGPT aside navigation and deeply wrapped links get checkboxes',async t=>{
 const p=await pageFor(t);await reportedChatGPT(p);
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();
 assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),3);
 await p.getByRole('button',{name:'Auswahl leeren',exact:true}).click();await box(p,'Alte Notizen').check();
 await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);
});
test('report regression: deeply wrapped ChatGPT links reject conflicting menu IDs',async t=>{
 const p=await pageFor(t);await reportedChatGPT(p);
 await p.evaluate(()=>document.querySelector('[data-id$="0001"] button').setAttribute('data-conversation-options-trigger','00000000-0000-4000-8000-000000000099'));
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();
 assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),2);
 assert.equal(await box(p,'Urlaub planen').count(),0);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
for(const mainRole of [false,true])test(`report regression: Gemini sidebar inside ${mainRole?'role=main':'main'} gets checkboxes`,async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await reportedGemini(p,mainRole);
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();
 assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),3);
 await p.getByRole('button',{name:'Auswahl leeren',exact:true}).click();await box(p,'Alte Notizen').check();
 await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['8000000000000002']);
});
test('report regression: Gemini content-area chat-history is excluded beside the real sidebar',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await reportedGemini(p);
 await p.evaluate(()=>{
  const content=document.querySelector('main:last-of-type'),fake=document.createElement('div');fake.className='chat-history';
  const row=document.querySelector('#rows>.row').cloneNode(true);row.querySelectorAll('[data-cc-box]').forEach(n=>n.remove());
  row.querySelector('a').href='/app/8000000000000099';row.querySelector('a').removeAttribute('jslog');
  row.querySelector('span').textContent='Verlinkter Chat im Inhalt';fake.append(row);content.append(fake);
 });
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();
 assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),3);
 assert.equal(await box(p,'Verlinkter Chat im Inhalt').count(),0);
});
test('report regression: conflicting Gemini host and button menu associations stop deletion',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await reportedGemini(p);
 await p.evaluate(()=>document.querySelector('[data-id$="0002"] button').setAttribute('aria-controls','foreign-menu'));
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('report regression: disabled Gemini menu host is never clicked',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await reportedGemini(p);
 await p.evaluate(()=>{
  document.querySelector('[data-id$="0002"] gem-icon-button').setAttribute('aria-disabled','true');
  document.querySelector('[data-id$="0002"] gem-icon-button').setAttribute('aria-expanded','true');
  window.menuClicks=0;document.querySelector('[data-id$="0002"] button').addEventListener('click',()=>window.menuClicks++);
 });
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten/);
 assert.equal(await p.evaluate(()=>window.menuClicks),0);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});

test('compat: ChatGPT button rows expose checkboxes and delete only selected IDs',async t=>{
 const p=await pageFor(t);await modernChatGPT(p);await box(p,'Alte Notizen').check();
 await confirm(p);await status(p,/Angehalten|Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);
});
test('compat: hover-only ChatGPT menus do not suppress checkboxes',async t=>{
 const p=await pageFor(t);await modernChatGPT(p,{hiddenMenu:true});
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();
 assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),3);
 await confirm(p);await status(p,/Angehalten|Fertig/);assert.equal(await p.evaluate(()=>window.deleted.length),3);
});
test('compat: ChatGPT link and native trigger ID conflicts are rejected',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>document.querySelector('[data-id$="0001"] button').setAttribute('data-conversation-options-trigger','00000000-0000-4000-8000-000000000099'));
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),2);
});
test('compat: a wrapped ChatGPT link cannot borrow another conversation trigger',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>{
  const row=document.querySelector('[data-id$="0001"]'),link=row.querySelector('a'),wrapper=document.createElement('div');
  link.replaceWith(wrapper);wrapper.append(link);
  row.querySelector('button').setAttribute('data-conversation-options-trigger','00000000-0000-4000-8000-000000000099');
 });
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),2);
});
test('compat: a moved foreign menu with a duplicate title cannot delete the unselected chat',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>document.querySelector('[data-id$="0001"] a span').textContent='Alte Notizen');
 await p.locator('[data-id$="0001"]').getByRole('checkbox').check();
 await p.evaluate(()=>{
  const rowA=document.querySelector('[data-id$="0001"]'),rowB=document.querySelector('[data-id$="0002"]');
  const link=rowA.querySelector('a'),wrapper=document.createElement('div'),foreignMenu=rowB.querySelector('button');
  rowA.querySelector('button').remove();link.replaceWith(wrapper);wrapper.append(link);
  foreignMenu.setAttribute('data-conversation-options-trigger',rowB.dataset.id);rowA.append(foreignMenu);
 });
 await confirm(p);await status(p,/Angehalten/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
for(const encoded of [false,true])test(`compat: Gemini ${encoded?'base64':'plain'} metadata supplies stable IDs`,async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await metadataGemini(p,encoded);
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),3);
 await p.getByRole('button',{name:'Auswahl leeren',exact:true}).click();await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['8000000000000002']);
});
test('compat: Gemini conflicting metadata is not bypassed through a nested link',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await p.evaluate(()=>document.querySelector('[data-id$="0001"]').setAttribute('jslog','123;BardVeMetadataKey:'+btoa(JSON.stringify([['c_8000000000000099']]))));
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),2);
});
test('compat: Gemini malformed metadata is not bypassed through a nested link',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await p.evaluate(()=>document.querySelector('[data-id$="0001"]').setAttribute('jslog','123;BardVeMetadataKey:not-base64'));
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),2);
});
test('compat: Gemini unexpected metadata shape does not hide conflicting identity',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await p.evaluate(()=>document.querySelector('[data-id$="0001"]').setAttribute('jslog','123;BardVeMetadataKey:'+btoa(JSON.stringify({conversation:'c_8000000000000099'}))));
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),2);
});
test('compat: changed ChatGPT trigger ID invalidates selection before any deletion',async t=>{
 const p=await pageFor(t);await modernChatGPT(p);await box(p,'Urlaub planen').check();
 await p.evaluate(()=>document.querySelector('[data-id$="0001"] button').setAttribute('data-conversation-options-trigger','00000000-0000-4000-8000-000000000099'));
 await p.locator('[data-id$="0001"] [data-cc-box] input').waitFor({state:'attached'});
 await confirm(p);await status(p,/Angehalten/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('compat: ChatGPT project headers with conversation descendants are not chat entries',async t=>{
 const p=await pageFor(t);await modernChatGPT(p);
 await p.evaluate(()=>document.querySelector('[data-id$="0001"] [data-sidebar-item]').setAttribute('data-sidebar-keep-open','true'));
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),2);
});
test('compat: Claude exact reported session dialog succeeds',async t=>{
 const p=await pageFor(t,'https://claude.ai/');await p.evaluate(()=>Object.assign(options,{english:true,heading:'Delete session?',plainDialog:'This session will be permanently deleted. This can’t be undone.',noConfirmMarker:true}));
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);
});
test('Claude notification toast: persistent success notifications do not block a two-chat batch',async t=>{
 const p=await pageFor(t,'https://claude.ai/');await claudeNotificationToast(p);
 await box(p,'Urlaub planen').check();await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002']);
 assert.equal(await p.locator('[data-cds="Toast"] [role="dialog"]').count(),2);assert.equal(await p.locator('#rows .row').count(),1);
 assert.deepEqual(await p.evaluate(()=>window.notificationActions),[]);
});
test('Claude notification toast: a preexisting localized neutral notification does not block deletion',async t=>{
 const p=await pageFor(t,'https://claude.ai/');await claudeNotificationToast(p,{preexisting:true,text:'Sitzung gelöscht',afterDeletion:false});
 // Claude removes this property during its ending animation; identity comes
 // from the remaining native notification structure, not rendered height.
 await p.evaluate(()=>document.querySelector('[data-cds="Toast"] [role="dialog"]').style.removeProperty('--toast-height'));
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);
 assert.equal(await p.locator('[data-cds="Toast"] [role="dialog"]').count(),1);assert.deepEqual(await p.evaluate(()=>window.notificationActions),[]);
});
for(const variant of ['unknown-nonmodal','error','warning','actionable','confirmation'])test(`Claude notification toast: ${variant} dialog is retained as a blocking overlay`,async t=>{
 const p=await pageFor(t,'https://claude.ai/');await claudeNotificationToast(p,{preexisting:true,variant});
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),[]);assert.equal(await p.evaluate(()=>window.nativeMenuDeletes),0);
 assert.deepEqual(await p.evaluate(()=>window.notificationActions),[]);
});
test('Claude notification toast: ignoring a success notification cannot override a foreign confirmation ID',async t=>{
 const p=await pageFor(t,'https://claude.ai/');await claudeNotificationToast(p,{preexisting:true,afterDeletion:false});
 await p.evaluate(()=>options.dialogId='00000000-0000-4000-8000-000000000099');
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),[]);assert.equal(await p.evaluate(()=>window.nativeMenuDeletes),1);
 assert.deepEqual(await p.evaluate(()=>window.notificationActions),[]);
});
test('Claude notification toast: a notification alone never authorizes deletion or advances the queue',async t=>{
 const p=await pageFor(t,'https://claude.ai/');await claudeNotificationToast(p,{toastOnly:true});
 await box(p,'Urlaub planen').check();await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),[]);assert.equal(await p.evaluate(()=>window.nativeMenuDeletes),1);
 assert.equal(await p.locator('#rows .row').count(),3);assert.deepEqual(await p.evaluate(()=>window.notificationActions),[]);
});
for(const [language,menuName,heading,plainDialog,cancelName] of [
 ['French','Supprimer','Supprimer la session ?','Cette session sera définitivement supprimée. Cette action est irréversible.','Annuler'],
 ['Japanese','削除','セッションを削除しますか？','このセッションは完全に削除されます。この操作は元に戻せません。','キャンセル']
])test(`compat: Claude semantic destructive controls work in ${language}`,async t=>{
 const p=await pageFor(t,'https://claude.ai/');await p.evaluate(values=>Object.assign(options,values),{semanticDelete:true,menuName,confirmName:menuName,heading,plainDialog,cancelName});
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);
 assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);
});
test('compat: Gemini native controls work with localized titleless confirmation',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');await p.evaluate(()=>{
  Object.assign(options,{menuName:'Supprimer',confirmName:'Supprimer',cancelName:'Annuler',heading:'Supprimer la conversation ?',plainDialog:'Cette conversation et les activités associées seront supprimées.'});
  new MutationObserver(()=>{
   const menuButton=document.querySelector('[role="menu"] button[data-test-id="delete-button"]');if(menuButton){
    const item=document.createElement('gem-menu-item');item.setAttribute('data-test-id','delete-button');menuButton.removeAttribute('data-test-id');menuButton.replaceWith(item);item.append(menuButton);
   }
   const button=document.querySelector('dialog [data-test-id="confirm-button"]');if(button&&button.tagName==='BUTTON'){
   const wrapper=document.createElement('gem-button');wrapper.setAttribute('data-test-id','confirm-button');button.removeAttribute('data-test-id');delete button.dataset.testid;button.replaceWith(wrapper);wrapper.append(button);
  }}).observe(document.body,{childList:true});
 });
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),['8000000000000002']);
});
test('compat: semantic confirmation still rejects a foreign explicit title',async t=>{
 const p=await pageFor(t,'https://claude.ai/');await p.evaluate(()=>Object.assign(options,{semanticDelete:true,heading:'Delete session?',wrongTitle:'Unbeteiligter Chat'}));
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('compat: semantic confirmation still rejects a foreign explicit ID',async t=>{
 const p=await pageFor(t,'https://claude.ai/');await p.evaluate(()=>Object.assign(options,{semanticDelete:true,heading:'Delete session?',plainDialog:'This session will be permanently deleted. This can’t be undone.',dialogId:'00000000-0000-4000-8000-000000000099'}));
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('compat: two semantic destructive confirmations stop without deletion',async t=>{
 const p=await pageFor(t,'https://claude.ai/');await p.evaluate(()=>{
  Object.assign(options,{semanticDelete:true,heading:'Delete session?',plainDialog:'This session will be permanently deleted. This can’t be undone.'});
  new MutationObserver(()=>{const d=document.querySelector('dialog');if(d&&!d.dataset.changed){d.dataset.changed='true';const b=document.createElement('button');b.className='bg-danger-000';b.textContent='Delete everything';b.onclick=()=>window.deleted.push('wrong-action');d.append(b);}}).observe(document.body,{childList:true});
 });
 await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
// Catches accidental selection of content links and premature destructive actions.
test('checkboxes cover only history; cancel deletes nothing',async t=>{const p=await pageFor(t);assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),3);await box(p,'Alte Notizen').check();await p.getByRole('button',{name:'Auswahl löschen',exact:true}).click();assert.equal(await p.getByRole('button',{name:'1 Chat endgültig löschen'}).isEnabled(),false);await p.getByRole('button',{name:'Abbrechen',exact:true}).click();assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
// Catches deletion by title instead of identity and selection growth during execution.
test('deletes only checked IDs sequentially including nested menu button',async t=>{const p=await pageFor(t);await box(p,'Urlaub planen').check();await box(p,'Alte Notizen').check();await confirm(p);await status(p,/2 von 2/);assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002']);assert.equal(await p.locator('#rows .row').count(),1);});
test('duplicate titles retain separate identities; title is rendered as text',async t=>{const p=await pageFor(t);await p.evaluate(()=>{addChat('00000000-0000-4000-8000-000000000004','Urlaub planen');addChat('00000000-0000-4000-8000-000000000005','<img src=x onerror=alert(1)>');});await box(p,'Urlaub planen').nth(1).check();await box(p,'<img src=x onerror=alert(1)>').check();await confirm(p);await status(p,/2 von 2/);assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000005']);});
test('wrong native confirmation stops without deleting any chat',async t=>{const p=await pageFor(t);await p.evaluate(()=>options.wrongTitle='Unbeteiligter Chat');await box(p,'Alte Notizen').check();await confirm(p);await status(p,/angehalten/i);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
test('changed title after review stops the queue',async t=>{const p=await pageFor(t);await box(p,'Alte Notizen').check();await p.getByRole('button',{name:'Auswahl löschen',exact:true}).click();await p.evaluate(()=>document.querySelector('[data-id$="002"] a span').textContent='Geändert');await p.getByRole('checkbox',{name:'Ich habe die Auswahl geprüft.'}).check();await p.getByRole('button',{name:'1 Chat endgültig löschen'}).click();await status(p,/angehalten/i);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
test('server error stops before the next selected chat',async t=>{const p=await pageFor(t);await p.evaluate(()=>options.failure=true);await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();await confirm(p);await status(p,/angehalten/i);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
test('stop before native confirmation prevents deletion',async t=>{const p=await pageFor(t);await p.evaluate(()=>options.noDialog=true);await box(p,'Alte Notizen').check();await confirm(p);await p.locator('dialog').waitFor({state:'attached'});await p.getByRole('button',{name:'Anhalten',exact:true}).click();await status(p,/angehalten/i);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
test('English controls work',async t=>{const p=await pageFor(t);await p.evaluate(()=>options.english=true);await box(p,'Urlaub planen').check();await confirm(p);await status(p,/1 von 1/);assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000001']);});
test('closing removes injected checkboxes, reopening resets selection',async t=>{const p=await pageFor(t);await box(p,'Alte Notizen').check();await p.getByRole('button',{name:'Aufräumen schließen'}).click();assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),0);await p.getByRole('button',{name:'Chats aufräumen',exact:true}).click();assert.equal(await box(p,'Alte Notizen').isChecked(),false);});

// Modal libraries hide the background from assistive technology, without removing the target row.
test('modal accessibility hiding does not lose the bound chat identity',async t=>{const p=await pageFor(t);await p.evaluate(()=>options.hideBackground=true);await box(p,'Alte Notizen').check();await confirm(p);await status(p,/1 von 1.*Fertig/s);assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);});
test('recycled row before final confirmation cannot delete another ID',async t=>{const p=await pageFor(t);await p.evaluate(()=>options.recycleAtDialog=true);await box(p,'Alte Notizen').check();await confirm(p);await status(p,/angehalten/i);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
test('missing selected row never falls back to another chat',async t=>{const p=await pageFor(t);await box(p,'Alte Notizen').check();await p.evaluate(()=>document.querySelector('[data-id$="002"]').remove());await confirm(p);await status(p,/angehalten/i);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
test('stop after one committed delete leaves the rest untouched',async t=>{const p=await pageFor(t);await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();await confirm(p);await p.locator('[data-id$="001"]').waitFor({state:'detached'});await p.getByRole('button',{name:'Anhalten',exact:true}).click();await status(p,/Angehalten.*1 von 3/s);assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000001']);});
test('newly loaded chats get boxes but are not automatically selected',async t=>{const p=await pageFor(t);await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();await p.evaluate(()=>addChat('00000000-0000-4000-8000-000000000004','Nachgeladen'));await box(p,'Nachgeladen').waitFor();assert.equal(await box(p,'Nachgeladen').isChecked(),false);});

// No title, even a duplicate, substitutes for an associated trigger/menu pair.
test('unowned menu with a duplicate title cannot delete an unselected chat',async t=>{const p=await pageFor(t);await p.evaluate(()=>{options.noControls=true;options.redirectMenu=true;document.querySelector('[data-id$="001"] a span').textContent='Alte Notizen';});await p.locator('[data-id$=\"001\"]').getByRole('checkbox').check();await confirm(p);await status(p,/angehalten/i);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
test('late error and rollback stop before any further delete',async t=>{const p=await pageFor(t);await p.evaluate(()=>options.rollback=true);await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();await confirm(p);await status(p,/angehalten/i);assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000001']);assert.equal(await p.locator('[data-id$="001"]').count(),1);});
test('silent rollback of a processed ID also stops the batch',async t=>{const p=await pageFor(t);await p.evaluate(()=>{options.rollback=true;options.silentRollback=true;});await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();await confirm(p);await status(p,/angehalten/i);assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000001']);});
test('a button caption is not accepted as the dialog chat title',async t=>{const p=await pageFor(t);await p.evaluate(()=>{addChat('00000000-0000-4000-8000-000000000004','Löschen');options.wrongTitle='Anderer Chat';options.buttonSpan=true;});await box(p,'Löschen').check();await confirm(p);await status(p,/angehalten/i);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});

for(const [provider,origin,wanted] of [['Claude','https://claude.ai/','00000000-0000-4000-8000-000000000002'],['Gemini','https://gemini.google.com/app','8000000000000002']]){
 test(`${provider}: selected ID deleted through generic confirmation only`,async t=>{const p=await pageFor(t,origin);assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),3);await box(p,'Alte Notizen').check();await confirm(p);await status(p,/1 von 1.*Fertig/s);assert.deepEqual(await p.evaluate(()=>window.deleted),[wanted]);});
 test(`${provider}: mismatched explicit dialog title stops`,async t=>{const p=await pageFor(t,origin);await p.evaluate(()=>options.wrongTitle='Ein anderer Chat');await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
 test(`${provider}: missing menu association cannot delete`,async t=>{const p=await pageFor(t,origin);await p.evaluate(()=>options.noControls=true);await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
}
test('Gemini: legacy rows require stable identity and never use list position',async t=>{const p=await pageFor(t,'https://gemini.google.com/app');await p.evaluate(()=>{for(const row of document.querySelectorAll('gem-nav-list-item')){const link=row.querySelector('a');const div=document.createElement('div');div.setAttribute('data-test-id','conversation');div.id='c_'+row.dataset.id;div.className='row';div.dataset.id=row.dataset.id;while(link.firstChild)div.append(link.firstChild);for(const button of row.querySelectorAll('button'))div.append(button);row.replaceWith(div);}document.querySelector('[data-id$="0003"]').removeAttribute('id');});await box(p,'Behalten: Projektideen').waitFor({state:'detached'});await box(p,'Urlaub planen').waitFor();await box(p,'Alte Notizen').waitFor();assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),2);});
test('UI works with enforced Trusted Types without a permissive policy',async t=>{const p=await pageFor(t,'https://chatgpt.com/?tt=1');await box(p,'Alte Notizen').check();assert.equal(await box(p,'Alte Notizen').isChecked(),true);});
test('minimizing keeps selection and checkboxes',async t=>{const p=await pageFor(t);await box(p,'Alte Notizen').check();await p.getByRole('button',{name:'Auswahlfenster minimieren'}).click();assert.equal(await box(p,'Alte Notizen').isChecked(),true);await p.getByRole('button',{name:'Auswahl öffnen: 1 Chat'}).click();assert.equal(await box(p,'Alte Notizen').isChecked(),true);});
test('removing a chat in review resets consent and deletes only the remainder',async t=>{const p=await pageFor(t);await box(p,'Urlaub planen').check();await box(p,'Alte Notizen').check();await p.getByRole('button',{name:'Auswahl löschen',exact:true}).click();await p.getByRole('checkbox',{name:'Ich habe die Auswahl geprüft.'}).check();await p.getByRole('button',{name:'Aus Auswahl entfernen: Urlaub planen',exact:true}).click();assert.equal(await p.getByRole('button',{name:'1 Chat endgültig löschen'}).isEnabled(),false);await p.getByRole('checkbox',{name:'Ich habe die Auswahl geprüft.'}).check();await p.getByRole('button',{name:'1 Chat endgültig löschen'}).click();await status(p,/1 von 1.*Fertig/s);assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);});

test('Gemini: stable legacy div rows can delete the selected ID',async t=>{const p=await pageFor(t,'https://gemini.google.com/app?legacy=1');await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),['8000000000000002']);});
test('Gemini: a conflicting wrapper ID cannot be bypassed through its nested link',async t=>{const p=await pageFor(t,'https://gemini.google.com/app');await p.evaluate(()=>document.querySelector('[data-id$="0001"]').setAttribute('data-conversation-id','8000000000000099'));await box(p,'Urlaub planen').waitFor({state:'detached'});assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),2);});
test('matching title never overrides a conflicting explicit dialog ID',async t=>{const p=await pageFor(t,'https://claude.ai/');await p.evaluate(()=>{options.includeTitle=true;options.dialogId='00000000-0000-4000-8000-000000000099';});await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
test('generic confirmation rejects a different title in unmarked prose',async t=>{const p=await pageFor(t,'https://gemini.google.com/app');await p.evaluate(()=>options.plainDialog='This will delete Behalten: Projektideen.');await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});
test('larger checkbox hit area selects without navigating',async t=>{const p=await pageFor(t);const label=p.locator('[data-id$="002"] [data-cc-box] label');await label.click({position:{x:2,y:2}});assert.equal(await box(p,'Alte Notizen').isChecked(),true);assert.equal(p.url(),'https://chatgpt.com/');});

for(const [name,url,path] of [['ChatGPT','https://chatgpt.com/','/c/00000000-0000-4000-8000-000000000099'],['Claude','https://claude.ai/','/chat/00000000-0000-4000-8000-000000000099'],['Gemini','https://gemini.google.com/app','/app/8000000000000099']]){
 test(`${name}: valid conversation URLs in unrelated navigation stay unselected`,async t=>{const p=await pageFor(t,url);await p.evaluate(path=>{const aside=document.createElement('aside');const nav=document.createElement('nav');nav.setAttribute('aria-label','References');nav.setAttribute('role','navigation');const row=document.createElement('div');const a=document.createElement('a');a.href=path;a.textContent='Unbeteiligter Link';const b=document.createElement('button');b.setAttribute('aria-haspopup','menu');b.textContent='Options';row.append(a,b);nav.append(row);aside.append(nav);document.body.append(aside);},path);await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),3);});
}
test('disabled delete menu item is never programmatically clicked',async t=>{const p=await pageFor(t);await p.evaluate(()=>options.disabledMenu=true);await box(p,'Alte Notizen').check();await confirm(p);await status(p,/Angehalten|Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);});

// v1.2: selection must include rendered rows below the viewport, not just onscreen rows.
test('offscreen history rows have checkboxes and can be selected together',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>{document.querySelector('nav').style.height='170px';for(let i=4;i<=20;i++)addChat('00000000-0000-4000-8000-'+String(i).padStart(12,'0'),'Älterer Chat '+i);});
 await box(p,'Älterer Chat 20').waitFor({state:'attached'});await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();
 assert.equal(await box(p,'Älterer Chat 20').isChecked(),true);assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),20);
 assert.equal(await p.locator('nav').evaluate(n=>n.scrollTop),0);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
// Load more must actually drive the sidebar's scroll and let its normal lazy loader work.
for(const [provider,url] of [['ChatGPT','https://chatgpt.com/'],['Claude','https://claude.ai/'],['Gemini','https://gemini.google.com/app']]){
 test(`load more discovers lazy history on ${provider} without growing selection`,async t=>{
  const p=await pageFor(t,url);await box(p,'Alte Notizen').check();
  await p.evaluate(()=>{const nav=document.querySelector('nav');nav.style.height='170px';let batch=0,pending=false;nav.addEventListener('scroll',()=>{if(pending||batch>=2||nav.scrollTop+nav.clientHeight<nav.scrollHeight-3)return;pending=true;setTimeout(()=>{batch++;addChat('00000000-0000-4000-8000-'+String(3+batch).padStart(12,'0'),'Nachgeladen '+batch);pending=false;},batch===0?200:1300);});});
  await p.getByRole('button',{name:'Weitere Chats laden',exact:true}).click();await box(p,'Nachgeladen 2').waitFor({state:'attached',timeout:12000});
  await status(p,/Laden beendet/);assert.equal(await box(p,'Nachgeladen 2').isChecked(),false);assert.equal(await box(p,'Alte Notizen').isChecked(),true);
  assert.equal(await p.getByRole('button',{name:'Auswahl löschen',exact:true}).isEnabled(),true);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
 });
}
test('load more stops promptly and keeps the existing selection',async t=>{
 const p=await pageFor(t);await box(p,'Alte Notizen').check();await p.evaluate(()=>{document.querySelector('nav').style.height='170px';});
 await p.getByRole('button',{name:'Weitere Chats laden',exact:true}).click();assert.equal(await p.getByRole('button',{name:'Auswahl löschen',exact:true}).isEnabled(),false);
 await p.getByRole('button',{name:'Laden anhalten',exact:true}).click();await status(p,/Laden angehalten/);assert.equal(await box(p,'Alte Notizen').isChecked(),true);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('load more never scrolls the chat content when history has no scroller',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>{const main=document.querySelector('main');main.style.height='200px';main.style.overflow='auto';const block=document.createElement('div');block.style.height='1800px';main.append(block);});
 await p.getByRole('button',{name:'Weitere Chats laden',exact:true}).click();await status(p,/Keine eindeutige scrollbare/);
 assert.equal(await p.locator('main').evaluate(n=>n.scrollTop),0);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('load more detects rows being virtualized and preserves selected identity',async t=>{
 const p=await pageFor(t);await box(p,'Urlaub planen').check();await p.evaluate(()=>{const nav=document.querySelector('nav');nav.style.height='170px';nav.addEventListener('scroll',()=>{document.querySelector('[data-id$="0001"]')?.remove();},{once:true});});
 await p.getByRole('button',{name:'Weitere Chats laden',exact:true}).click();await status(p,/blendet.*Chats aus/);
 await p.getByRole('button',{name:'Auswahl löschen',exact:true}).click();assert.equal(await p.locator('#review-list').textContent().then(s=>s.includes('Urlaub planen')),true);
 assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('preflight of the entire selection prevents a partial batch when a later row disappeared',async t=>{
 const p=await pageFor(t);await box(p,'Urlaub planen').check();await box(p,'Alte Notizen').check();await p.evaluate(()=>document.querySelector('[data-id$="002"]').remove());
 await confirm(p);await status(p,/Angehalten/);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('collapsed groups get no checkbox until opened and keep it outside the viewport',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>{const details=document.createElement('details');details.innerHTML='<summary>Ältere Chats</summary>';const row=document.querySelector('[data-id$="003"]');row.parentNode.append(details);details.append(row);});
 await box(p,'Behalten: Projektideen').waitFor({state:'detached'});await p.getByText('Ältere Chats',{exact:true}).click();await box(p,'Behalten: Projektideen').waitFor({state:'attached'});
 assert.equal(await box(p,'Behalten: Projektideen').isChecked(),false);
});

test('load more Escape cancels without removing selected chats',async t=>{
 const p=await pageFor(t);await box(p,'Urlaub planen').check();await p.evaluate(()=>document.querySelector('nav').style.height='170px');
 await p.getByRole('button',{name:'Weitere Chats laden',exact:true}).click();await p.keyboard.press('Escape');await status(p,/Laden angehalten/);
 assert.equal(await box(p,'Urlaub planen').isChecked(),true);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('load more refuses to scroll underneath an open provider menu',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>{document.querySelector('nav').style.height='170px';document.querySelector('[data-id$="001"] button').click();});
 await p.getByRole('button',{name:'Weitere Chats laden',exact:true}).click();await status(p,/offene Menüs/);
 assert.equal(await p.locator('nav').evaluate(n=>n.scrollTop),0);assert.deepEqual(await p.evaluate(()=>window.deleted),[]);
});
test('load more refuses ambiguous scrollable history groups',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>{const nav=document.querySelector('nav');nav.style.height='170px';const other=nav.cloneNode(true);other.id='sidebar';other.setAttribute('aria-label','Other history');other.querySelectorAll('[data-cc-box]').forEach(n=>n.remove());other.querySelectorAll('a').forEach(a=>a.href=a.href.replace('4000','4001'));document.body.append(other);});
 await p.getByRole('button',{name:'Weitere Chats laden',exact:true}).click();await status(p,/Keine eindeutige scrollbare/);
 assert.deepEqual(await p.locator('nav').evaluateAll(nodes=>nodes.map(n=>n.scrollTop)),[0,0]);
});
test('CSS-hidden history is rechecked after it is revealed',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>document.querySelector('[data-id$="003"]').style.display='none');
 await p.locator('[data-id$="003"] [data-cc-box]').waitFor({state:'detached'});
 await p.evaluate(()=>document.querySelector('[data-id$="003"]').style.display='flex');await box(p,'Behalten: Projektideen').waitFor();assert.equal(await box(p,'Behalten: Projektideen').isChecked(),false);
});

// Reviewer regressions: hidden clipping, actionable review, Gemini anchor ownership.
test('zero-height clipped groups stay out of bulk selection until expanded',async t=>{
 const p=await pageFor(t);await p.evaluate(()=>{const group=document.createElement('div');group.id='collapsed';group.style.cssText='height:0;overflow:hidden';const row=document.querySelector('[data-id$="003"]');row.parentElement.append(group);group.append(row);});
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();await p.getByRole('button',{name:'Auswahl löschen',exact:true}).click();assert.equal(await p.locator('#review-list li').count(),2);
 await p.getByRole('button',{name:'Abbrechen',exact:true}).click();await p.evaluate(()=>document.querySelector('#collapsed').style.height='auto');await box(p,'Behalten: Projektideen').waitFor();assert.equal(await box(p,'Behalten: Projektideen').isChecked(),false);
});
test('unavailable selection is marked individually in review and can be removed',async t=>{
 const p=await pageFor(t);await box(p,'Urlaub planen').check();await box(p,'Alte Notizen').check();await p.evaluate(()=>document.querySelector('[data-id$="002"]').remove());await p.getByRole('button',{name:'Auswahl löschen',exact:true}).click();
 const row=p.locator('#review-list li').filter({hasText:'Alte Notizen'});assert.match(await row.textContent(),/nicht geladen|verändert/);
 assert.doesNotMatch(await p.locator('#review-list li').filter({hasText:'Urlaub planen'}).textContent(),/nicht geladen|verändert/);
 await row.getByRole('button',{name:'Aus Auswahl entfernen: Alte Notizen'}).click();await p.getByRole('checkbox',{name:'Ich habe die Auswahl geprüft.'}).check();await p.getByRole('button',{name:'1 Chat endgültig löschen'}).click();await status(p,/Fertig/);assert.deepEqual(await p.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000001']);
});
test('Gemini conversation anchors do not recurse and still validate own identity',async t=>{
 const p=await pageFor(t,'https://gemini.google.com/app');const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.evaluate(()=>{const link=document.querySelector('[data-id$="0001"] a');link.setAttribute('data-test-id','conversation');link.setAttribute('data-conversation-id','8000000000000001');document.querySelector('nav').dataset.changed='yes';});
 await p.getByRole('button',{name:'Alle geladenen auswählen',exact:true}).click();assert.equal(await box(p,'Urlaub planen').isChecked(),true);assert.equal(errors.length,0);
 await p.evaluate(()=>document.querySelector('[data-id$="0001"] a').setAttribute('data-conversation-id','8000000000000099'));
 await p.locator('[data-id$="0001"] [data-cc-box]').waitFor({state:'detached'});assert.equal(await p.getByRole('checkbox',{name:/Chat auswählen:/}).count(),2);
});
