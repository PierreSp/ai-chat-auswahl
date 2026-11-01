# Chrome Web Store: Vorbereitung

Stand: 1. November 2026. Die GitHub-Beta und eine Store-Veröffentlichung sind
getrennte Veröffentlichungen. Die Erweiterung wurde noch nicht im Store eingereicht.

## Vorbereitete Angaben

- Name: **AI Chat-Auswahl**
- Sprache: **Deutsch**
- Kategorie: die passende Produktivitäts-/Werkzeugkategorie im aktuellen Dashboard.
- Homepage: https://github.com/PierreSp/ai-chat-auswahl
- Support: https://github.com/PierreSp/ai-chat-auswahl/issues
- Datenschutz: https://github.com/PierreSp/ai-chat-auswahl/blob/main/PRIVACY.md
- Lizenz: **GPL-3.0-only**
- Upload: `dist/ai-chat-auswahl-1.3.0-webstore.zip`; das Manifest liegt direkt
  an der Archivwurzel. Das andere ZIP ist für die manuelle Installation gedacht.

## Beschreibung zum Übernehmen

Wähle mehrere Chats bei ChatGPT, Claude und Gemini per Checkbox aus, prüfe die
Auswahl und lösche sie anschließend Schritt für Schritt.

AI Chat-Auswahl ergänzt die Verlaufsseitenleiste der unterstützten Websites:

- Einzelne Chats oder Bereiche mit Umschalt auswählen.
- Geladene Chats gesammelt markieren und weitere Einträge nachladen.
- Codex-Aufgaben im ChatGPT-Verlauf ebenfalls auswählen.
- Die vollständige Auswahl vor dem Löschen prüfen und korrigieren.
- Einen laufenden Vorgang anhalten; bei uneindeutigen Einträgen stoppt die Erweiterung.

Während des Löschens den Tab geöffnet lassen, nicht neu laden und nicht zu einer
anderen Seite wechseln. Die Löschung ist endgültig und wirkt auf dein Konto.
Bei Gemini umfasst sie auch zugehörige Aktivitäten und im Chat erzeugte Inhalte.

Die Erweiterung verarbeitet Chat-Titel, IDs und Bedienelemente lokal im Tab.
Keine eigenen Netzwerkanfragen, Telemetrie, Diagnoseexporte oder API-Schlüssel.
Die Websites führen nach den ausgelösten Klicks ihre üblichen Anfragen aus.

Erste öffentliche Beta. Änderungen an den Websites können Anpassungen erfordern.
Geschlossene Projekte, Archive und Suchergebnisse werden nicht durchsucht.
Die Oberfläche ist deutsch; nicht jede native Dialogsprache wird unterstützt.

Freie Software unter GPL-3.0. Unabhängiges Hilfsprogramm, kein offizielles Produkt
von OpenAI, Anthropic oder Google.

## Zweck und Berechtigungen

**Einziger Zweck:** Geladene Unterhaltungen in den unterstützten KI-Webdiensten
auswählen, vorab prüfen und auf ausdrückliche Bestätigung gemeinsam löschen.

**Website-Zugriff:** Content Scripts laufen ausschließlich auf `chatgpt.com`,
`claude.ai` und `gemini.google.com`. Der Zugriff ist nötig, um Verlaufszeilen
zu erkennen, Checkboxen einzufügen und die vorhandenen Menüs und Löschdialoge
zu bedienen. Es gibt keine Cookies-, Storage- oder Alle-Webseiten-Berechtigung.

**Remote Code:** Nein. Alle ausführbaren Skripte sind im Erweiterungspaket enthalten.

**Datenangaben:** Nicht pauschal „keine Nutzerdaten“ angeben. Auch die lokale
Verarbeitung muss offengelegt werden. Websiteinhalte wie Chat-Titel, IDs, Links,
Menü-/Dialogtexte und Fehlermeldungen werden ausschließlich für den genannten
Zweck im Tab verarbeitet. Die passenden Kategorien im aktuellen Dashboard anhand
dieser Angaben prüfen; keine Übertragung an Entwickler oder Analysedienste.
Die Limited-Use-Bestätigungen müssen zur tatsächlichen Verarbeitung passen.

## Vor der Einreichung offen

- Entwicklerkonto registrieren bzw. prüfen; Google verlangt eine einmalige
  Registrierungsgebühr. Veröffentlichungsname und Kontakt-E-Mail festlegen und
  die E-Mail verifizieren. Kontodaten nicht aus privaten Browserdaten übernehmen.
- Store-Icon mit dem empfohlenen transparenten Rand vorbereiten: 128 × 128 Pixel,
  bei quadratischem Motiv ungefähr 96 × 96 Pixel Motivfläche. Das aktuelle
  Erweiterungsicon füllt fast die gesamte Fläche und sollte dafür angepasst werden.
- Mindestens einen Screenshot im Format 1280 × 800 Pixel hochladen. Die lokalen
  Vorschauen zeigen die echte Erweiterungsoberfläche auf einer ausdrücklich
  gekennzeichneten Testseite. Für den Store echte unterstützte Oberflächen mit
  ausschließlich künstlichen Testchats aufnehmen; keine privaten Chatlisten.
- Empfehlenswert: kleine Werbekachel 440 × 280 Pixel. Sie ist laut aktueller
  Dokumentation optional, ebenso die große Kachel 1400 × 560 Pixel.
- Vollständige Abläufe mit eigens angelegten Testchats für jeden Anbieter prüfen:
  Auswahl, Vorschau, erfolgreiche Löschung, Abbruch, Nachladen und Fehlerfall.
  Automatische Tests und bisherige Benutzerberichte ersetzen diese Matrix nicht.
- Öffentliche Datenschutz- und Supportlinks ohne Anmeldung öffnen und prüfen.
- Konto-/Vertriebsangaben und Datenschutzkategorien im aktuellen Dashboard prüfen.
- Testanleitung für Google hinterlegen. Keine privaten Kontozugangsdaten eintragen.

## Testanleitung für die Store-Prüfung

1. In einem unterstützten Dienst mit einem eigenen Testkonto anmelden und zwei
   entbehrliche Chats erstellen. Für Codex optional eine entbehrliche Aufgabe nutzen.
2. Die Verlaufsseitenleiste und „Chats aufräumen“ öffnen.
3. Einen Testchat auswählen, „Auswahl löschen“ öffnen und zunächst abbrechen.
   Es darf nichts gelöscht werden.
4. Die Auswahl erneut öffnen, prüfen, bestätigen und den Tab geöffnet lassen.
   Nur der ausgewählte Testchat darf aus dem Verlauf verschwinden.
5. Für die beiden anderen Dienste wiederholen. Keine echten Nutzerdaten verwenden.

## Versionen und Auffindbarkeit

Git-Versionstag und Manifestversion zusammen führen, z. B. `v1.3.0` und `1.3.0`.
Pro veröffentlichter Version ein Release mit Änderungen und installierbarem ZIP.
GitHub-Themen: `chrome-extension`, `chatgpt`, `claude`, `gemini`, `chat-management`.
Im Store Nutzen und unterstützte Dienste natürlich beschreiben; keine wiederholten
Keywordlisten oder irreführende Anbieterzugehörigkeit.

## Offizielle Grundlagen

- [Paket und Manifest vorbereiten](https://developer.chrome.com/docs/webstore/prepare)
- [Store-Eintrag und Bildformate](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)
- [Bildgestaltung und Icon-Abstände](https://developer.chrome.com/docs/webstore/images)
- [Datenangaben](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Auch lokale Datenverarbeitung offenlegen](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
- [Registrierung](https://developer.chrome.com/docs/webstore/register/)
- [Entwicklerkonto und Kontakt](https://developer.chrome.com/docs/webstore/set-up-account)
- [Einreichen und Veröffentlichung steuern](https://developer.chrome.com/docs/webstore/publish)
