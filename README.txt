AI CHAT-AUSWAHL — Version 1.3.0 (öffentliche Beta)
Für ChatGPT, Claude und Gemini im Chrome-Browser.
Kostenlos, lokal installiert, ohne API-Schlüssel oder Tracking.

INSTALLATION
1. ai-chat-auswahl-1.3.0.zip entpacken.
2. In Chrome chrome://extensions öffnen und „Entwicklermodus“ einschalten.
3. „Entpackte Erweiterung laden“ wählen.
4. Den entpackten Ordner ai-chat-auswahl mit manifest.json auswählen.
5. ChatGPT, Claude oder Gemini öffnen, anmelden und den Tab einmal neu laden.
Der installierte Ordner muss an seinem Platz bleiben. Die Erweiterung ist für
Chrome unter Windows, macOS und Linux gedacht, nicht für die nativen Chat-Apps.
Node.js und npm werden für die Benutzung nicht benötigt.

AKTUALISIEREN
Die neuen Dateien in den bisher geladenen Erweiterungsordner kopieren, in
chrome://extensions bei „AI Chat-Auswahl“ auf „Neu laden“ klicken und anschließend
die betroffenen Webseiten neu laden. Nicht während eines Löschvorgangs aktualisieren.

BEDIENUNG
- „Chats aufräumen“ und die Verlaufsseitenleiste der Website öffnen.
- Chats über die Checkboxen auswählen. Für einen Bereich zuerst eine Checkbox
  normal anklicken, dann Umschalt halten und die Checkbox am anderen Ende
  anklicken. Ihr neuer Zustand gilt für den ganzen Bereich. Markierungen außerhalb
  bleiben bestehen; bei Bedarf vorher „Auswahl leeren“ verwenden.
- „Alle geladenen auswählen“ wählt nur aktuell erkannte Einträge aus.
- „Weitere Chats laden“ scrollt die erkannte Seitenleiste höchstens 30 Sekunden
  oder 40 Schritte pro Durchlauf. „Laden anhalten“ oder Escape beendet das Nachladen.
  Neue Einträge bleiben abgewählt. Manuelles Scrollen funktioniert ebenfalls.
  „Laden beendet“ bedeutet nicht, dass alle Kontochats geladen sind.
- „−“ minimiert das Fenster und behält die Auswahl. „×“ verwirft die Auswahl.
- „Auswahl löschen“ öffnet die vollständige Vorschau. Einzelne Chats können dort
  entfernt werden; jede Änderung setzt die Bestätigung zurück. Bei gleichen Titeln
  helfen die angezeigten Chat-IDs beim Unterscheiden. Codex-Aufgaben im ChatGPT-Verlauf
  sind als solche gekennzeichnet.
- Nach Prüfung „Ich habe die Auswahl geprüft“ anhaken und Löschen bestätigen.
- Während des Löschens den Tab geöffnet lassen. Nicht neu laden und nicht zu
  einer anderen Seite wechseln, bis der Vorgang beendet ist.
- „Anhalten“ oder Escape stoppt weitere Löschungen. Eine bereits bestätigte
  Löschung kann noch fertig werden. Bei einem Abbruch den Verlauf prüfen,
  bevor eine neue Auswahl bestätigt wird.

Löschen ist endgültig und betrifft das Konto, nicht nur diesen Computer.
Bei Gemini werden auch zugehörige Aktivitäten und im Chat erzeugte Inhalte
wie Canvas-Dokumente oder -Apps gelöscht. Der Hinweis steht in der Vorschau.

UMFANG UND GRENZEN
Geladene Chats außerhalb des Bildschirms erhalten ebenfalls Checkboxen.
Noch nicht geladene Einträge werden erst nach dem Nachladen erkannt.
Eingeklappte Gruppen selbst öffnen. Geschlossene Projekte, Archive und
Suchergebnisse werden nicht durchsucht. Unklare Einträge erhalten keine Checkbox.

Die Erweiterung prüft die gesamte Auswahl vor dem Start und jeden Eintrag erneut
vor seiner Löschung. Sie hält bei uneindeutigen IDs, Menüs oder Dialogen an.
Geänderte oder entladene Einträge können in der Vorschau entfernt werden.
Eine verschwundene Zeile ist keine unabhängige Serverbestätigung. Verspätete
Fehlermeldungen, Verbindungsabbrüche und spätere Rücknahmen durch die Website
kann eine reine Oberflächensteuerung nicht ausschließen.

Website-Änderungen, andere Sprachen oder Kontovarianten können Anpassungen
erforderlich machen. Die automatischen Tests verwenden künstliche Chats.
Live wurden Menüs und Dialoge untersucht und abgebrochen; produktive Löschungen
wurden vom Benutzer erprobt. Eine vollständige Live-Testmatrix liegt nicht vor.

DATENSCHUTZ
Keine eigenen Netzwerkanfragen, Telemetrie, Diagnoseexporte oder API-Schlüssel.
Die Erweiterung liest lokal Titel, IDs und Bedienelemente aus der Website.
Auswahl und Fortschritt liegen nur im Arbeitsspeicher des Tabs und gehen beim
Neuladen verloren. Die Websites senden nach den Klicks ihre normalen Anfragen.
Weitere Einzelheiten stehen in PRIVACY.md.

QUELLCODE, VERSIONEN UND FEHLERMELDUNGEN
https://github.com/PierreSp/ai-chat-auswahl
Bitte bei öffentlichen Fehlermeldungen private Chat-Titel und Kontodaten entfernen.

LIZENZ
Copyright (C) 2026 Pierre Springer.
Dieses Programm ist freie Software unter der GNU General Public License,
Version 3 (GPL-3.0-only), und wird ohne Gewährleistung bereitgestellt.
Der vollständige Lizenztext liegt in der Datei LICENSE bei.

ENTFERNEN
In chrome://extensions „AI Chat-Auswahl“ entfernen und betroffene Tabs neu laden.

Unabhängiges Hilfsprogramm; kein offizielles Produkt von OpenAI, Anthropic oder Google.
