# Provider compatibility fix

> **For agentic workers:** Execute the authorized bugfix inline, with test-first changes and a final independent code review.

**Goal:** Restore ChatGPT/Gemini checkboxes and Claude session deletion, including language-independent semantic controls.
**Architecture:** Keep the DOM-only provider adapters and sequential deletion. Derive IDs from native conversation markers/metadata; keep every available ID consistent. Accept titleless confirmations through an ID-bound menu and a uniquely marked destructive action, with existing text templates only as a fallback.
**Tech Stack:** Manifest V3, plain JavaScript, Playwright/Node tests.
**Spec:** User bug report and exact Claude dialog supplied in this chat.

## Constraints and review focus

- No service APIs, tokens, network calls or live deletions.
- Reject conflicting IDs, foreign navigation links, ambiguous menus/actions and changed targets.
- A hidden row stays excluded; a hover-only menu does not hide an otherwise valid row.
- Explicit foreign dialog titles/IDs must still stop deletion.
- Plain and base64 Gemini metadata must agree with links and container IDs.
- Native controls must remain tied to the selected row; wording alone cannot establish ownership.

## Tasks

- [x] Add failing browser fixtures/tests for modern ChatGPT rows, Gemini metadata, hover-only menus, Claude session dialogs and localized destructive controls. Run only `compat:` tests to establish failures.
- [x] Update `providers.js`, `core.js` and the attribute observer in `content.js`; run the regression cases and the full `npm test` suite.
- [x] Independently review the patch and resolve findings; update version/README.
- [x] Package and verify the distributable ZIP and update the two previously delivered extension folders. Archives and both copies were compared byte-for-byte with the tested source.

Verification: 53 original tests passed before the patch. New compatibility cases failed before their fixes. Final full run: 72 tests passed, 0 failed; `/tmp/ai-chat-final-verified.log`. Independent review verified rejection of a moved foreign menu with a duplicate title and successful localized Gemini confirmation. No authenticated live account was available.

Original test environment: an existing Playwright installation was selected with `PLAYWRIGHT_MODULE`. Browser startup required the host sandbox exemption; fixtures blocked all non-test requests. Git had not yet been initialized at that stage. Current setup instructions are in the repository README.
