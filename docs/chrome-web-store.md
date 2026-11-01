# Chrome Web Store: Einreichung vorbereiten

Stand: 1. November 2026. **ChatSweep 1.4.1** ist für Englisch und Deutsch
vorbereitet. Eine Store-Einreichung wurde noch nicht vorgenommen.

## Fertige Materialien

- Englischer Name: **ChatSweep – Bulk delete chats**
- Deutscher Name: **ChatSweep – Chats gesammelt löschen**
- [Englischer Store-Text](../store/listing-en.txt) und [deutscher Store-Text](../store/listing-de.txt)
- [Store-Icon, 128 × 128](../store/assets/icon128.png), mit transparentem Rand
- Kleine Werbekachel, 440 × 280: [Englisch](../store/assets/promo-small-en-440x280.png) / [Deutsch](../store/assets/promo-small-440x280.png)
- [Echte Screenshots und Upload-Reihenfolge](../store/screenshots/README.md)
- [Live-Testbericht und Grenzen](../store/live-test-report.md)
- Upload-Materialien gesammelt: `dist/chatsweep-1.4.1-store-assets.zip`
- Paket: `dist/chatsweep-1.4.1-webstore.zip`, Manifest direkt an der Archivwurzel
- Homepage: https://github.com/PierreSp/ai-chat-auswahl
- Support: https://github.com/PierreSp/ai-chat-auswahl/issues
- Privacy policy: https://github.com/PierreSp/ai-chat-auswahl/blob/main/PRIVACY.md
- Datenschutz: https://github.com/PierreSp/ai-chat-auswahl/blob/main/PRIVACY.de.md
- Lizenz: **GPL-3.0-only**

Die Standardsprache des Manifests ist Englisch. `_locales/en` und `_locales/de`
enthalten die Übersetzungen; Chrome wählt die passende Sprache. Andere
Browsersprachen verwenden Englisch. Die Erkennung der nativen Löschdialoge der
Anbieter ist davon unabhängig und unterstützt bekannte Varianten.

## Das Entwicklerkonto: vom Herausgeber zu erledigen

1. Im [Developer Dashboard](https://chrome.google.com/webstore/devconsole) mit dem
   Google-Konto anmelden, das dauerhaft als Herausgeber dienen soll. Die
   Konto-E-Mail lässt sich später nicht einfach ändern; ein Wechsel benötigt
   gegebenenfalls eine Übertragung der Erweiterung.
2. Bei der Registrierung die Entwicklervereinbarung selbst lesen und bestätigen
   und die dort angezeigte einmalige Registrierungsgebühr bezahlen.
3. [Bestätigung in zwei Schritten](https://myaccount.google.com/security) für dieses
   Google-Konto einschalten. Google verlangt sie vor Veröffentlichung oder Updates.
4. Im Konto einen öffentlichen Herausgebernamen und eine regelmäßig gelesene
   Kontakt-E-Mail angeben. Die Bestätigungs-E-Mail öffnen und verifizieren.
5. Den Händler-/Nicht-Händler-Status entsprechend der tatsächlichen Tätigkeit
   angeben. Kostenlos oder Open Source bedeutet nicht automatisch Nicht-Händler.
   Die Einordnung hängt davon ab, ob die Veröffentlichung im Rahmen einer
   gewerblichen/beruflichen Tätigkeit erfolgt. Geforderte Identitäts- oder
   Adressnachweise selbst direkt bei Google einreichen.

Passwörter, Zahlungsdaten, Ausweiskopien und Bestätigungscodes gehören nicht in
GitHub, die Erweiterung oder diese Anleitung.

## Eintrag anlegen

1. **Add new item** wählen und `chatsweep-1.4.1-webstore.zip` hochladen.
2. Die englische Beschreibung als Standard eintragen und Deutsch ergänzen.
3. Die passende Produktivitäts-/Werkzeugkategorie im aktuellen Dashboard wählen.
4. Icon und Screenshots hochladen; optional die vorbereitete Werbekachel verwenden.
5. Homepage-, Support- und Datenschutzlinks hinterlegen und ohne Anmeldung prüfen.
6. Die Datenschutzfelder wie unten ausfüllen und die Testanleitung hinterlegen.
7. Bei **Submit for review** zunächst die spätere manuelle Veröffentlichung wählen,
   damit nach der Google-Prüfung noch einmal der fertige Eintrag geprüft werden kann.

Einreichung und Veröffentlichung sind getrennte Schritte. Dieses Dokument ist
keine Bestätigung, dass Google die Erweiterung zugelassen hat.

## Zweck und Berechtigungen

**Single purpose (Englisch):**

> Select, review and bulk delete loaded conversations in supported AI chat websites
> using their existing interface, only after explicit user confirmation.

**Website access justification (Englisch):**

> Content scripts run only on chatgpt.com, claude.ai and gemini.google.com. Access
> is required to identify chat history entries, insert selection checkboxes, and
> operate the existing menus and confirmation dialogs for the chats the user has
> selected and reviewed. ChatSweep makes no network requests of its own and does
> not access cookies, authentication tokens or browser history.

**Remote code:** Nein. Alle ausführbaren Skripte sind im Paket enthalten.

**Data usage:** Nicht pauschal „keine Nutzerdaten“ angeben. Auch lokale Verarbeitung
muss offengelegt werden. Websiteinhalte wie Chat-Titel, IDs, Links, Menü-/Dialogtexte
und Fehlermeldungen werden ausschließlich zur Auswahl, Zuordnung und Löschung
lokal im Tab verarbeitet. Die passenden Kategorien im aktuellen Dashboard nach
diesen Angaben auswählen. Keine Übertragung an Entwickler oder Analysedienste,
kein Verkauf, keine Werbung oder Profilbildung. Die Limited-Use-Bestätigungen
müssen mit diesen Tatsachen übereinstimmen.

## Testanleitung für die Store-Prüfung (Englisch)

1. Sign in to ChatGPT, Claude or Gemini using your own test account. Create three
   disposable chats without personal information. Use normal saved chats.
2. Open the website's history sidebar and choose **Clean up chats**.
3. Select two test chats. Choose **Delete selection**, inspect the review, then
   choose **Cancel**. All three chats must remain.
4. Review the two test chats again, check **I have reviewed the selection.**, and
   confirm. Keep the tab open. **Stop** prevents later operations; a deletion
   already confirmed can still finish.
5. Review and delete any remaining disposable test chats. Verify the outcome in
   the native history and after reloading the page.
6. Repeat for the other supported providers. Never use real user conversations.

No extension-specific login or API key is required. The provider accounts are
needed because ChatSweep operates on their existing signed-in interfaces.

## Bilder und Auffindbarkeit

Mindestens ein Screenshot und ein Store-Icon sind erforderlich. Screenshots:
1280 × 800 Pixel, höchstens fünf. Das 128er-Icon hat eine Motivbreite von ungefähr
94 Pixeln und einen transparenten Rand. Die kleine Werbekachel 440 × 280 ist
optional. Keine privaten Chatlisten oder Kontaktdaten in Store-Bildern verwenden.

Versions-Tag und Manifestversion zusammen führen, z. B. `v1.4.1` und `1.4.1`.
GitHub-Themen: `chrome-extension`, `chatgpt`, `claude`, `gemini`, `chat-management`.
Im Store den Nutzen natürlich beschreiben; keine wiederholten Keywordlisten und
keine irreführende Anbieterzugehörigkeit.

## Offizielle Grundlagen

- [Registrierung und einmalige Gebühr](https://developer.chrome.com/docs/webstore/register/)
- [Entwicklerkonto und Kontakt](https://developer.chrome.com/docs/webstore/set-up-account)
- [2-Step Verification](https://developer.chrome.com/docs/webstore/program-policies/two-step-verification)
- [Trader/Non-Trader](https://developer.chrome.com/docs/webstore/program-policies/trader-disclosure)
- [Paket und Manifest](https://developer.chrome.com/docs/webstore/prepare)
- [Store-Eintrag und Bilder](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)
- [Datenangaben](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Auch lokale Verarbeitung offenlegen](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
- [Einreichung und manuelle Veröffentlichung](https://developer.chrome.com/docs/webstore/publish)
