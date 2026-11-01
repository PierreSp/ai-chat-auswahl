const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const extension=path.resolve(__dirname,'..');const fixture=fs.readFileSync(path.join(__dirname,'fixture.html'),'utf8');

async function localizedPage(t,locale,url='https://chatgpt.com/') {
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'chatsweep-locale-'));
 const context=await chromium.launchPersistentContext(profile,{channel:'chromium',executablePath:process.env.CHROMIUM_PATH,headless:true,locale,env:{...process.env,LANG:locale.replace('-','_')+'.UTF-8',LANGUAGE:locale.replace('-','_')},args:[`--lang=${locale}`,`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 t.after(async()=>{await context.close();fs.rmSync(profile,{recursive:true,force:true});});
 await context.route('**/*',r=>new URL(r.request().url()).protocol==='chrome-extension:'?r.continue():['chatgpt.com','claude.ai','gemini.google.com'].includes(new URL(r.request().url()).hostname)?r.fulfill({contentType:'text/html',body:fixture}):r.abort());
 const page=await context.newPage();page.setDefaultTimeout(3500);await page.goto(url);return {page,context};
}
async function extensionDetails(context,page) {
 const session=await context.newCDPSession(page),contexts=[];
 session.on('Runtime.executionContextCreated',event=>contexts.push(event.context));await session.send('Runtime.enable');
 const isolated=contexts.find(c=>c.origin.startsWith('chrome-extension://'));
 assert.ok(isolated,'extension content-script world exists');
 const result=await session.send('Runtime.evaluate',{contextId:isolated.id,expression:'({id:chrome.runtime.id,manifest:chrome.runtime.getManifest(),language:chrome.i18n.getUILanguage()})',returnByValue:true});
 await session.detach();return result.result.value;
}
for(const [locale,launch,select,remove,agree,cancel] of [
 ['en-US','Clean up chats','Select chat: Alte Notizen','Delete selection','I have reviewed the selection.','Cancel'],
 ['de-DE','Chats aufräumen','Chat auswählen: Alte Notizen','Auswahl löschen','Ich habe die Auswahl geprüft.','Abbrechen'],
 ['fr-FR','Clean up chats','Select chat: Alte Notizen','Delete selection','I have reviewed the selection.','Cancel']
]) test(`i18n: ${locale} review uses the UI language or English fallback and preserves native titles`,async t=>{
 const {page,context}=await localizedPage(t,locale);
 await page.getByRole('button',{name:launch,exact:true}).click();
 await page.getByRole('checkbox',{name:select,exact:true}).check();
 await page.getByRole('button',{name:remove,exact:true}).click();
 assert.equal(await page.locator('#review-list .title').textContent(),'Alte Notizen');
 assert.equal(await page.getByRole('checkbox',{name:agree,exact:true}).isChecked(),false);
 assert.equal(await page.locator('#confirm').isDisabled(),true);
 await page.getByRole('button',{name:cancel,exact:true}).click();
 assert.deepEqual(await page.evaluate(()=>window.deleted),[]);
 const details=await extensionDetails(context,page);
 assert.ok(details.language.startsWith(locale.split('-')[0]), `Chrome UI language: ${details.language}`);
 assert.equal(details.manifest.default_locale,'en');
 assert.equal(details.manifest.name,locale==='de-DE'?'ChatSweep – Chats gesammelt löschen':'ChatSweep – Bulk delete chats');
});

test('i18n: English UI deletes only the reviewed fixture ID through German provider controls',async t=>{
 const {page}=await localizedPage(t,'en-US');
 await page.getByRole('button',{name:'Clean up chats',exact:true}).click();
 await page.getByRole('checkbox',{name:'Select chat: Alte Notizen',exact:true}).check();
 await page.getByRole('button',{name:'Delete selection',exact:true}).click();
 await page.getByRole('checkbox',{name:'I have reviewed the selection.',exact:true}).check();
 await page.getByRole('button',{name:'Permanently delete 1 chat',exact:true}).click();
 await page.getByRole('status').filter({hasText:'1 of 1 removed from history. Done.'}).waitFor({timeout:15000});
 assert.deepEqual(await page.evaluate(()=>window.deleted),['00000000-0000-4000-8000-000000000002']);
});

test('i18n: English safety errors preserve a changed title literally without authorizing deletion',async t=>{
 const {page}=await localizedPage(t,'en-US');
 const title='<img src=x onerror="window.injected=true"> $1';
 await page.evaluate(title=>document.querySelector('[data-id$="0002"] a span').textContent=title,title);
 await page.getByRole('button',{name:'Clean up chats',exact:true}).click();
 await page.getByRole('checkbox',{name:`Select chat: ${title}`,exact:true}).check();
 await page.evaluate(()=>document.querySelector('[data-id$="0002"] a span').textContent='Changed');
 await page.getByRole('button',{name:'Delete selection',exact:true}).click();
 assert.equal(await page.locator('#review-list .title').evaluate(el=>el.firstChild.textContent),title);
 assert.equal(await page.locator('#review-list img').count(),0);
 await page.getByRole('checkbox',{name:'I have reviewed the selection.',exact:true}).check();
 await page.getByRole('button',{name:'Permanently delete 1 chat',exact:true}).click();
 const status=page.getByRole('status').filter({hasText:'Stopped.'});await status.waitFor();
 assert.ok((await status.textContent()).includes(`“${title}”`));
 assert.match(await status.textContent(),/Nothing has been deleted yet/);
 assert.deepEqual(await page.evaluate(()=>window.deleted),[]);assert.equal(await page.evaluate(()=>window.injected),undefined);
});

for(const [locale,open,error] of [
 ['en-US','Open selection in this tab','Please open ChatGPT, Claude or Gemini'],
 ['de-DE','Auswahl in diesem Tab öffnen','Bitte ChatGPT, Claude oder Gemini']
]) test(`i18n: ${locale} popup and unavailable-tab error are localized`,async t=>{
 const {page,context}=await localizedPage(t,locale);await page.locator('[data-cc-app]').waitFor({state:'attached'});
 const {id}=await extensionDetails(context,page),popup=await context.newPage();popup.setDefaultTimeout(3500);
 await popup.goto(`chrome-extension://${id}/popup.html`);
 await popup.bringToFront();
 await popup.getByRole('button',{name:open,exact:true}).click();
 await popup.getByRole('status').filter({hasText:error}).waitFor();
 assert.equal(await popup.locator('html').getAttribute('lang'),locale.startsWith('de')?'de':'en');
});
