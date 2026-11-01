# Release verification — ChatSweep 1.4.0

Date: 2026-11-01. Browser: the user's connected Chrome profile on Linux/Flatpak.
Tests were performed through the visible websites, without using private APIs,
cookies or provider authentication tokens. Only chats created expressly for this
disposable test workflow were selected for deletion.

## Live scope

Three ordinary saved chats, labelled `Store-Test 2026-11-01 A/B/C`, were created
on each of ChatGPT, Claude and Gemini. One additional disposable Claude chat D
was created to verify a dialog-transition correction. No existing user chat was
selected or deleted. Native history groups containing existing chats were
collapsed for screenshots.

| Check | ChatGPT | Claude | Gemini |
| --- | --- | --- | --- |
| A/B/C receive checkboxes | Passed | Passed | Passed |
| Review A+B lists exactly those two, leaving C unselected | Passed | Passed | Passed |
| Cancel review preserves all three chats | Passed | Passed | Passed |
| Stop A+B after first operation preserves B and C | Passed | Passed | Passed |
| English 1.4.0 interface after extension reload | Passed | Passed | Passed |
| Complete two-chat deletion | Passed B+C | Final C+D verification pending | Passed B+C |
| Deleted test IDs absent from loaded native history after page reload | Passed A/B/C | Pending final verification | Passed A/B/C |

The initial cancellation and Stop checks used the local 1.3.1 development build.
English-interface and full-completion checks used 1.4.0. Neither 1.3.1 nor this
pre-release 1.4.0 test build was a Chrome Web Store listing.

## Issue found during final testing

Claude removed B, then safely stopped before C with “Multiple confirmation
dialogs detected.” A subsequent DOM inspection showed one native confirmation
dialog; the exact two elements present at the earlier instant were not captured.
The remaining native dialog was cancelled without confirming deletion.

An automated two-chat regression reproduced the same observable failure: the
second operation stopped while overlapping dialog shells were temporarily
present. The correction waits for one unchanged Claude confirmation dialog to
remain unique for 300 ms, within a six-second limit. It continues checking the
bound chat, explicit conflicting identities and batch errors. It never chooses
a dialog while multiple candidates are visible. Persistent ambiguity, a changed
target or Stop still prevents confirmation.

Six regression cases cover temporary and persistent overlap, Stop, changed
targets, foreign IDs, and briefly unique dialogs followed by replacement.

## Automated verification

The final `npm test` run completed successfully: **149 tests passed, zero failed,
zero skipped** (254 seconds). The six focused Claude transition tests also
passed separately. They first reproduced the bug against the earlier code:
the second selected chat was retained instead of the batch completing.

Locale tests cover English, German and fallback from another browser language,
localized popup messages, and an English extension acting on German native
controls. Title identity checks and literal text handling remain enforced.
Distribution archives were checked against the explicit 20-file allowlist and
source bytes; Store screenshot dimensions were checked separately.

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
