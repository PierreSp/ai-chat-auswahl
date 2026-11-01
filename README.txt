CHATSWEEP — Version 1.4.0 (public beta)
Fewer chats. More clarity.
For ChatGPT, Claude and Gemini in Chrome.

INSTALL
1. Unzip chatsweep-1.4.0.zip.
2. Open chrome://extensions and enable Developer mode.
3. Choose Load unpacked and select the chatsweep folder containing manifest.json.
4. Keep that folder in place. Reload ChatGPT, Claude or Gemini.
5. Open Clean up chats on the supported website.
No Node.js, npm, API key or separate account is required.

UPDATE
Replace the files in your existing extension folder, reload the extension on
chrome://extensions, then reload the supported websites. Do not update while
an operation is running. Existing AI Chat-Auswahl installations become ChatSweep.

USE
- Open the website's history sidebar and Clean up chats.
- Select chats with the checkboxes. For a range, click one checkbox normally,
  then Shift-click the checkbox at the other end. Its new state applies to the
  entire range; selections outside the range are retained. Clear selection first
  if you want to start over.
- Select all loaded includes only entries currently recognized.
- Load more chats scrolls the identified history for up to 30 seconds or 40 steps
  per run. Stop loading or Escape stops it. New entries remain unselected.
  Manual scrolling also works. Reaching the loading limit does not mean the
  account's complete history has been loaded.
- Minimize retains the selection; close clears it.
- Delete selection opens a complete review. Remove individual entries if needed.
  Every change resets the confirmation checkbox. Duplicate titles show their IDs;
  Codex tasks are identified separately.
- Check I have reviewed the selection, then confirm deletion.
- Keep the tab open until deletion finishes. Do not reload or navigate away.
- Stop or Escape prevents further deletions. A deletion already confirmed may
  still finish. Check your history after a stop or error before starting again.

Deletion is permanent and affects your account, not just this computer.
On Gemini it also removes associated activity and content created in the chat,
such as Canvas documents or apps.

SCOPE
Loaded entries outside the visible screen also receive checkboxes. Unloaded
entries must be loaded first. Open collapsed groups yourself. Closed projects,
archives and search results are not searched. Unclear entries are excluded.

ChatSweep checks the full selection before starting and each entry again before
its deletion. Changed or unloaded entries can be removed from the review.
A disappearing row is not an independent server receipt. Delayed provider errors,
connection failures and later rollbacks cannot be ruled out by UI automation.
Website changes or other native dialog variants can require an update.

LANGUAGE
The extension follows Chrome's UI language. German is supported; English is the
default and fallback for other languages. Native provider dialog compatibility
is separate from the extension's display language.
Deutsche Bedienungsanleitung:
https://github.com/PierreSp/ai-chat-auswahl/blob/main/README.de.md

PRIVACY
No extension-originated network requests, tracking, diagnostic exports or API keys.
Titles, identifiers and interface controls are processed locally in the tab.
Selection and progress are held only in memory and are lost when the tab reloads.
The provider websites send their normal requests after the confirmed actions.
See PRIVACY.md and PRIVACY.de.md for the full policy.

SOURCE AND SUPPORT
https://github.com/PierreSp/ai-chat-auswahl
Remove private titles and account information before publishing a bug report.

LICENSE
Copyright (C) 2026 Pierre Springer.
Free software under GNU General Public License version 3 only (GPL-3.0-only).
Provided without warranty. The full license is included in LICENSE.

REMOVE
Remove ChatSweep on chrome://extensions, then reload the supported websites.

Independent software; not an official product of OpenAI, Anthropic or Google.
