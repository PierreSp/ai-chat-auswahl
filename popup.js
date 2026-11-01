// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Pierre Springer
const {t, language} = globalThis.ChatCleanerI18n;
document.documentElement.lang = language;
for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
document.getElementById('open').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    if (!tab?.id) throw new Error(t('errorNoActiveTab'));
    const response = await chrome.tabs.sendMessage(tab.id,{type:'CHAT_CLEANER_OPEN'});
    if (!response?.ok) throw new Error(t('errorUnavailable'));
    window.close();
  } catch {
    document.getElementById('status').textContent = t('popupUnavailable');
  }
});
