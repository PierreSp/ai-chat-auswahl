# Release verification — ChatSweep 1.4.1

Date: 2026-11-01. Browser: the user's connected Chrome profile on Linux/Flatpak.
Tests were performed through the visible websites, without using private APIs,
cookies or provider authentication tokens. Only chats created expressly for this
disposable test workflow were selected for deletion.

## Live scope

Three ordinary saved chats, labelled `Store-Test 2026-11-01 A/B/C`, were created
on each of ChatGPT, Claude and Gemini. Five additional disposable Claude chats
D/E/F/G/H were created to investigate and verify the notification correction.
No existing user chat was selected or deleted. Native history groups containing
existing chats were collapsed for Store screenshots.

| Check | ChatGPT | Claude | Gemini |
| --- | --- | --- | --- |
| A/B/C receive checkboxes | Passed | Passed | Passed |
| Review A+B lists exactly those two, leaving C unselected | Passed | Passed | Passed |
| Cancel review preserves all three chats | Passed | Passed | Passed |
| Stop A+B after first operation preserves B and C | Passed | Passed | Passed |
| English 1.4.0 interface after extension reload | Passed | Passed | Passed |
| Complete two-chat deletion | Passed B+C | Passed G+H on 1.4.1 | Passed B+C |
| Deleted test IDs absent from loaded native history after page reload | Passed A/B/C | Passed A–H | Passed A/B/C |

The initial cancellation and Stop checks used the local 1.3.1 development build.
English-interface and ChatGPT/Gemini completion checks used 1.4.0. Claude's final
notification correction is in 1.4.1. The 1.3.1 and 1.4.0 development builds were
not published releases or Chrome Web Store listings.

## Issue found during final testing

Claude removed the first chat in each batch, then safely stopped before the
second with “Multiple confirmation dialogs detected.” The remaining native
confirmation was cancelled. The retained test chats were subsequently deleted
in separately reviewed single-chat operations.

DOM observations taken during a batch established the cause: Claude's neutral
“Session deleted” notification also has `role="dialog"`. It remains present for
several seconds while the next genuine `role="alertdialog"` confirmation opens.
An earlier attempt to wait for a unique dialog did not resolve this live case
and was removed.

Version 1.4.1 distinguishes only the observed native neutral notification shape:
a nonmodal dialog inside Claude's Toast component and live notification region,
a linked neutral heading, and a single hidden-from-accessibility dismiss button.
The predicate does not match translated notification prose. It does not click or
dismiss notifications. Unknown, actionable, error/warning and genuine confirmation
dialogs remain candidates and can block processing. The selected chat ID,
confirmation identity and unique final confirmation checks are retained.

Nine focused browser regression cases cover persistent and preexisting success
notifications, localized text and ending animation, retained blocking overlays,
foreign confirmation IDs, and notification-only responses that must not authorize
a deletion. The positive batch test first failed against the previous code with
only the first selected ID deleted, then passed with the structural correction.

The final live G+H batch on 1.4.1 reported **2 of 2 removed from history. Done.**
After reloading and expanding the native history, all eight Claude test IDs were
absent; the two preexisting history entries remained. Across all three providers,
all **14** newly created disposable chats were cleaned up. Test tabs were closed
and the native history groups used for screenshots were restored.

## Automated verification

The final 1.4.1 `npm test` run passed **152 tests, zero failed, zero skipped**
(249 seconds). The nine focused notification tests also passed separately.
The previous 1.4.0 suite passed 149 tests but did not reproduce the real native
toast structure; the speculative transition cases were replaced by the observed
notification regression cases.

Locale tests cover English, German and fallback from another browser language,
localized popup messages, and an English extension acting on German native
controls. Title identity checks and literal text handling remain enforced.
Distribution archives are checked against the explicit 20-file allowlist and
source bytes; Store screenshot dimensions are checked separately.

## Limits

This is a smoke test of the accounts and website variants available on the test
date, not certification of all account types, regions or provider languages.
Native provider UI changes can require updates.

The live run did not create or delete a Codex task, test closed projects or
archives, or exercise a very large history. Codex identity handling, pagination,
range selection, rollback, conflicting identities and failure paths are covered
by isolated automated browser tests. Those tests use synthetic pages and do not
delete account data.

Screenshots show the actual extension with disposable sample chats. They were
visually checked for private content. See [screenshots](screenshots/README.md)
and the separate [artwork provenance](assets/README.md).
