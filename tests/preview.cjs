// Optional screenshots of the local fixture. Never connects to a real account.
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
const extension=path.resolve(__dirname,'..');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'chat-cleaner-preview-'));
const context=await chromium.launchPersistentContext(profile,{channel:'chromium',executablePath:process.env.CHROMIUM_PATH,headless:true,locale:'de-DE',env:{...process.env,LANG:'de_DE.UTF-8',LANGUAGE:'de_DE'},viewport:{width:1280,height:900},args:['--lang=de-DE',`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
try{
await context.route('**/*',r=>['chatgpt.com','claude.ai','gemini.google.com'].includes(new URL(r.request().url()).hostname)?r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'fixture.html'),'utf8')}):r.abort());
const p=await context.newPage();await p.goto(process.env.PREVIEW_URL||'https://chatgpt.com/');await p.getByRole('button',{name:'Chats aufräumen',exact:true}).click();await p.getByRole('checkbox',{name:'Chat auswählen: Urlaub planen',exact:true}).check();await p.getByRole('checkbox',{name:'Chat auswählen: Alte Notizen',exact:true}).check();
const out=process.env.CAPTURE_DIR||process.cwd();fs.mkdirSync(out,{recursive:true});
await p.screenshot({path:path.join(out,'auswahl.png')});
await p.setViewportSize({width:390,height:800});await p.screenshot({path:path.join(out,'schmal-auswahl.png')});await p.setViewportSize({width:1280,height:900});
await p.emulateMedia({colorScheme:'dark'});await p.screenshot({path:path.join(out,'dunkel.png')});await p.emulateMedia({colorScheme:'light'});
await p.getByRole('button',{name:'Auswahl löschen',exact:true}).click();
await p.screenshot({path:path.join(out,'bestaetigung.png')});
await p.setViewportSize({width:390,height:800});await p.screenshot({path:path.join(out,'schmal.png')});
await p.setViewportSize({width:1280,height:900});await p.getByRole('button',{name:'Abbrechen',exact:true}).click();await p.evaluate(()=>document.querySelector('[data-id$="0002"]').remove());await p.getByRole('button',{name:'Auswahl löschen',exact:true}).click();await p.screenshot({path:path.join(out,'nicht-erreichbar.png')});
console.log('Screenshots gespeichert: '+out);
}finally{await context.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
