// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Pierre Springer
document.getElementById('open').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    if (!tab?.id) throw new Error('Kein aktiver Tab.');
    const response = await chrome.tabs.sendMessage(tab.id,{type:'CHAT_CLEANER_OPEN'});
    if (!response?.ok) throw new Error('Nicht verfügbar.');
    window.close();
  } catch {
    document.getElementById('status').textContent = 'Bitte ChatGPT, Claude oder Gemini im Browser öffnen und den Tab einmal neu laden. Danach erneut versuchen.';
  }
});
