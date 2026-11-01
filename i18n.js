// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Pierre Springer
(() => {
  'use strict';
  // Chrome chooses the UI locale and falls back to manifest.default_locale.
  // Substitutions are data, never markup or provider-identification rules.
  const t = (key, ...values) => chrome.i18n.getMessage(key, values.map(String));
  globalThis.ChatCleanerI18n = Object.freeze({t, language:t('uiLanguage')});
})();
