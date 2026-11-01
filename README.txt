AI CHAT-AUSWAHL — Version 1.2.10
Für ChatGPT, Claude und Gemini im Chrome-Browser.
Kostenlos, lokal installiert, ohne API-Schlüssel oder Tracking.

VORHANDENE INSTALLATION AKTUALISIEREN
Der ursprünglich bereitgestellte Ordner „chatgpt-chat-auswahl“ wurde aktualisiert.
1. In Chrome chrome://extensions öffnen.
2. Bei der bisherigen Erweiterung auf „Neu laden“ (Kreispfeil) klicken.
3. Chrome kann wegen der zusätzlichen Domains eine neue Freigabe verlangen.
4. Die Tabs von ChatGPT, Claude und Gemini neu laden.
Die Erweiterung heißt danach „AI Chat-Auswahl“.

NEU INSTALLIEREN
1. ai-chat-auswahl.zip entpacken.
2. In Chrome chrome://extensions öffnen und „Entwicklermodus“ einschalten.
3. „Entpackte Erweiterung laden“ wählen.
4. Den entpackten Ordner mit manifest.json auswählen.
5. https://chatgpt.com, https://claude.ai oder https://gemini.google.com öffnen,
   anmelden und den Tab einmal neu laden.
Der installierte Ordner muss an seinem Platz bleiben. Die Erweiterung arbeitet
in Chrome auf Windows, macOS und Linux; nicht in den nativen Chat-Apps.

BEDIENUNG
- Unten rechts „Chats aufräumen“ öffnen, danach die Verlaufsseitenleiste öffnen.
- Die Anzeige nennt den erkannten Dienst und die Anzahl geladener Chats.
- Chats über die Checkboxen auswählen. Für einen Bereich zuerst eine Checkbox
  normal anklicken, dann Umschalt halten und die Checkbox am anderen Ende
  anklicken. Ihr neuer Zustand gilt für den ganzen Bereich. Markierungen außerhalb
  bleiben bestehen; bei Bedarf vorher „Auswahl leeren“ verwenden.
- „Alle geladenen auswählen“ wählt nur aktuell erkannte Einträge aus.
- Ältere Chats mit „Weitere Chats laden“ nachladen. Die Erweiterung scrollt
  dafür die erkannte Seitenleiste höchstens 30 Sekunden / 40 Schritte pro
  Durchlauf. „Laden anhalten“ oder Escape beendet das Nachladen. Es werden
  keine neuen Chats automatisch ausgewählt. Manuelles Scrollen funktioniert
  weiterhin. „Laden beendet“ bedeutet nicht, dass alle Kontochats geladen sind.
- Mit „−“ das Fenster minimieren: Checkboxen und Auswahl bleiben erhalten.
- Mit „×“ das Aufräumen beenden: die Auswahl wird verworfen.
- „Auswahl löschen“ öffnet die vollständige Vorschau. Dort können einzelne
  Chats mit „Entfernen“ abgewählt werden. Jede Änderung setzt die Bestätigung
  zurück. Bei gleichen Titeln helfen die angezeigten Chat-IDs beim Unterscheiden.
- Nach Prüfung „Ich habe die Auswahl geprüft“ anhaken und Löschen bestätigen.
- „Anhalten“ oder Escape stoppt weitere Löschungen. Eine bereits bestätigte
  Löschung kann noch fertig werden. Während des Ablaufs den Tab geöffnet lassen.

Löschen ist endgültig und betrifft das Konto, nicht nur diesen Computer.
Bei Gemini werden auch zugehörige Gemini-Aktivitäten und im Chat erzeugte Inhalte
wie Canvas-Dokumente oder -Apps gelöscht. Der Hinweis steht auch in der Vorschau.

VERSION 1.2.10: GESPEICHERTE CODEX-TITEL UND BEREICHSAUSWAHL
- Codex zeigt Titel in der Seitenleiste formatiert an, verwendet im Löschdialog
  aber den gespeicherten Text einschließlich Formatierungszeichen. Die Erweiterung
  verwendet jetzt den gespeicherten Titel genau derselben ID-geprüften Aufgabenzeile.
- Vorschau und Bestätigung stimmen dadurch überein, ohne Zeichen pauschal aus
  Titeln zu entfernen. Ändert sich der gespeicherte Titel nach der Auswahl,
  hält die Verarbeitung weiterhin vor der Löschung an.
- Umschalt-Auswahl live sowie lokal für Checkbox und größere Klickfläche in
  beide Richtungen geprüft. Sie funktioniert; die Anleitung nennt jetzt
  ausdrücklich den ersten normalen Checkbox-Klick und den zweiten mit Umschalt.
- Keine echten Chats oder Aufgaben wurden bei dieser Prüfung gelöscht.

VERSION 1.2.9: UNBENANNTE CHATGPT-CHATS
- Live beobachtet: Die Seitenleiste zeigt „New chat“, aber der Löschdialog
  enthält in beiden Beschreibungen "This will permanently delete . This can't
  be undone.". Der leere gespeicherte Titel löste die bisherige Ablehnung aus.
- Dieser konkrete Sonderfall ist jetzt unterstützt. Chat-ID, eigene native
  Zeile und eigener Menüknopf müssen zusammenpassen. Die zugängliche und die
  sichtbare Dialogbeschreibung müssen denselben leeren Titel enthalten.
- Benannte Chats, fremde IDs, widersprüchliche Beschreibungen oder ein Menüknopf
  außerhalb der eigenen Zeile erhalten diese Ausnahme nicht. Gleichnamige
  Einträge bleiben über ihre IDs getrennt. Live wurde der Dialog nur gelesen
  und abgebrochen; die vollständigen Löschtests verwenden künstliche Chats.

VERSION 1.2.8: CODEX-AUFGABEN UND GEMINIS DIALOGAUFBAU
- Codex-Aufgaben im ChatGPT-Verlauf erhalten jetzt ebenfalls Checkboxen.
  Native Aufgaben-ID, Link und Zeilentyp müssen übereinstimmen. Auch reine
  Aufgabenlisten werden unterstützt; doppelte Links erzeugen keine zweite Box.
- In der Löschvorschau steht bei diesen Einträgen „Codex-Aufgabe“. Ihr Menü
  muss innerhalb derselben geprüften Aufgabenzeile liegen. Nach einer Aktion
  wird entweder der native Dialog geprüft oder das Verschwinden der Aufgaben-ID
  beobachtet. Unklare Ergebnisse lösen keine automatische Wiederholung aus.
- Gemini: Die native Dialoghülle kann vor Inhalt, Animation und Metadaten
  erscheinen. Die vorschnelle Ablehnung wurde mit der vollständigen Struktur
  reproduziert. Die Prüfung wartet jetzt begrenzt auf sichtbare Kontrollen und
  Metadaten. Abbruch und widersprüchliche IDs stoppen weiterhin den Vorgang.
- Live wurden nur Strukturen und Menüs gelesen; echte Chats oder Aufgaben
  wurden nicht gelöscht. Die vollständigen Löschfälle laufen mit Testdaten.

VERSION 1.2.7: GEMINI-DIALOG UND GEMISCHTER CHATGPT-VERLAUF
- Gemini wurde live bis zum nativen Bestätigungsdialog geprüft und abgebrochen.
  Die Erweiterung wartet jetzt begrenzt, wenn das Menü schon sichtbar ist,
  seine Zuordnung am Auslöser aber noch fehlt. Widersprüche stoppen sofort.
- Die aktuellen nativen Gemini-Löschaktionen tragen die Chat-ID in Metadaten.
  Diese muss zur Auswahl passen. Bei dieser Variante sind ein fehlender oder
  mehrfacher Metadatenblock, fremde IDs und versteckte Bestätigungsknöpfe kein
  gültiger Nachweis. Die geprüfte Bestätigung ist genau der geklickte Knopf.
- ChatGPT wurde live nachgeladen: Alle 35 erkannten normalen Chats hatten
  Checkboxen. Die darunter angezeigten Einträge waren ältere Codex-Aufgaben,
  die weiterhin nicht gelöscht werden. Das Auswahlfenster erklärt diese
  ausgeschlossenen Aufgaben jetzt ausdrücklich und nennt den Filter „Chat“.
- Die Nachladefunktion scrollt die Liste, kann aber keine weiteren Einträge
  erzwingen, wenn die Website keine nachliefert. Ein vollständiger Live-Löschtest
  mit eigens angelegten Testchats steht weiter aus; echte Chats wurden nicht gelöscht.

VERSION 1.2.6: CHATGPT-DIALOG LIVE UNTERSUCHT
- Der angemeldete Chrome-Browser war nun verbunden. ChatGPTs Löschdialog wurde
  geöffnet, strukturell gelesen und wieder abgebrochen; kein Chat wurde gelöscht.
- Der aktuelle Dialog enthält den vollständigen Titel ausschließlich im Satz
  "This will permanently delete <Titel>. This can't be undone.". Derselbe Satz
  steht in einer zugänglichen Beschreibung und im sichtbaren Dialogtext.
- Diese Form wird jetzt anhand des vollständigen Titels geprüft. Abweichende
  Titel, widersprüchliche Kopien und reine Buttonbeschriftungen werden abgelehnt.
  Die bestehende Zuordnung zwischen Chat-ID, Menü und Dialog bleibt erforderlich.
- Gemini wurde live geprüft: Beide geladenen Chats erhielten Checkboxen.

VERSION 1.2.5: GEMINI-SICHTBARKEIT
- Die erweiterte Diagnose belegt: IDs, Titel und Menüknöpfe wurden erkannt,
  aber ein sichtbarer Inline-Vorfahre mit clientWidth/clientHeight gleich null
  wurde fälschlich als eingeklappt angesehen.
- Inline- und contents-Elemente werden nicht mehr als abschneidender Bereich
  behandelt. Echte eingeklappte Blockelemente und versteckte Chats bleiben
  ausgeschlossen; auch äußere Vorfahren werden weiterhin geprüft.
- Die Struktur wurde lokal nachgebildet und der Fehler vor der Korrektur
  reproduziert. Zu diesem Zeitpunkt war die angemeldete Browsersitzung noch
  nicht verbunden.
- ChatGPT: Der Nutzer bestätigt, dass der Ablauf nun den Löschdialog erreicht.
  Die dort noch scheiternde Titelprüfung wird getrennt untersucht.

VERSION 1.2.4: MENÜAKTIVIERUNG UND GENAUERE DIAGNOSE
- ChatGPT-Menüs erhalten Pointer-Ereignisse statt ausschließlich click.
  Hat sich der Menüzustand dadurch bereits geändert, wird kein zusätzlicher
  Klick ausgelöst. Die Zielzuordnung wird zwischen Ereignissen geprüft.
- Die Diagnose zeigt nun den genauen Sichtbarkeits-Blocker, die Erkennungsstufen
  und die gefundenen Menüknöpfe in verschachtelten Chatzeilen. Es werden weiter
  keine Chattexte, Titel, vollständigen IDs oder rohen Metadaten ausgegeben.
- Der Nutzerbericht aus Version 1.2.3 bestätigt ChatGPT-Checkboxen, aber noch
  keine Gemini-Checkboxen. Der genaue verbliebene Gemini-Blocker wird mit der
  erweiterten Diagnose untersucht; ein Live-Erfolg wird nicht behauptet.

KORREKTUREN IN VERSION 1.2.3
- Auswertung der vom Benutzer gespeicherten Diagnoseberichte für ChatGPT und
  Gemini: In beiden Fällen wurden Chat-IDs erkannt, aber die Seitenleisten
  von der Erweiterung ausgeschlossen.
- ChatGPT: erkennt die Navigation innerhalb der nativen Seitenleiste auch ohne
  die bisherigen Verlaufskennzeichnungen. Der übersetzte Navigationsname ist
  dabei unerheblich. Menüknöpfe werden auch in stärker verschachtelten Zeilen
  zugeordnet; widersprüchliche IDs bleiben ausgeschlossen.
- Gemini: berücksichtigt die native Seitenleiste innerhalb des Hauptbereichs.
  Ein gleich benannter Bereich mit Nachrichten wird weiterhin ausgeschlossen.
- Gemini: berücksichtigt Menüzuordnung und deaktivierten Zustand auch am
  nativen Element um den Menüknopf. Widersprüchliche Zuordnungen stoppen den
  Ablauf; deaktivierte Menüs werden auch beim Abbruch nicht angeklickt.
- Die Regeln gelten gleichermaßen für Checkboxen und das Nachladen von Chats.

DIAGNOSE SEIT VERSION 1.2.2
- „Fehlende Checkboxen untersuchen“ → „Diagnose speichern“ erstellt eine lokale
  JSON-Datei für den gerade geöffneten Dienst, auch bei null erkannten Chats.
- Der Bericht zeigt technische Elementstrukturen, Sichtbarkeit und die Stufen
  der Erkennung. Chattexte, Titel, Chat-IDs, URL-Parameter und Rohdaten aus
  Metadaten werden nicht ausgegeben. Es gibt keine automatische Übertragung.
- Dieser Diagnoseknopf klickt keine Menüs der Website und startet keine
  Löschvorgänge.
- Die Diagnose hilft insbesondere, wenn eine Live-Browserverbindung nicht
  verfügbar ist, etwa bei Flatpak-Chrome mit fehlender Desktop-Anbindung.

KORREKTUREN IN VERSION 1.2.1
- ChatGPT: erkennt auch die neuen Verlaufszeilen ohne Link über die native
  Chat-ID am Menüknopf. Verschachtelte Zeilen werden mit derselben ID geprüft.
- Gemini: liest Chat-IDs auch aus den DOM-Metadaten (JSON oder Base64).
  Widersprüchliche oder fehlerhafte Metadaten werden nicht übergangen.
- Menüknöpfe, die erst beim Darüberfahren sichtbar werden, verhindern nicht
  mehr die Checkbox-Erkennung. Verborgene Chatzeilen bleiben ausgeschlossen.
- Claude: unterstützt den Dialog „Delete session?“ und dessen Bestätigung.
- Löschaktionen werden vorrangig anhand nativer technischer Kennzeichnungen
  erkannt, unabhängig vom übersetzten Text. Dazu gehören Geminis confirm-button
  und destruktive Schaltflächenvarianten. Deutsch/Englisch dienen als Rückfall
  für ältere Oberflächen ohne solche Merkmale. Andere Sprachen funktionieren,
  sofern die Website die erforderlichen eindeutigen Kennzeichnungen bereitstellt.

WAS VERSION 1.2 ERGÄNZT
- Checkboxen für geladene Einträge auch außerhalb des sichtbaren Ausschnitts.
- Begrenzt automatisches Nachladen mit Stopptaste, ohne automatische Auswahl.
- „Welche Chats werden erfasst?“ erklärt den Umfang direkt im Fenster.
- Hinweis auf ausgewählte, inzwischen entladene oder veränderte Chats.
- Prüfung der gesamten Auswahl vor dem ersten Löschschritt; jeder Chat wird
  unmittelbar vor seinem Löschschritt zusätzlich erneut geprüft.
- Erneute Erkennung nach dem Ausklappen oder Einblenden von Chatgruppen.

WEITERE FUNKTIONEN
- Getrennte Erkennungsregeln für ChatGPT, Claude und Gemini.
- Dienstanzeige, größere Checkbox-Klickflächen und automatischer Dunkelmodus
  entsprechend der Systemeinstellung.
- Minimieren ohne Auswahlverlust, korrigierbare Vorschau und Fortschrittsbalken.
- Tastaturbedienung mit sichtbarem Fokus; Escape schließt die Vorschau oder
  hält einen laufenden Vorgang an. Fokus bleibt im Bestätigungsdialog.
- Unbekannte oder widersprüchliche Chat-IDs und deaktivierte Menüs werden abgelehnt.

KOMPATIBILITÄT UND TESTGRENZEN
Getestet als geladene Manifest-V3-Erweiterung in einem separaten Chromium-Profil
mit lokalen Beispielseiten für alle drei Dienste. Die Regressionstests für
Version 1.2.3 bilden zusätzlich die Strukturen aus den Diagnoseberichten nach.
Alle 94 lokalen Funktionstests bestanden für Version 1.2.6, einschließlich
Inline-/contents-Hüllen, echter eingeklappter Gruppen, Pointer-/Klick-Aktivierung
und präziser, datensparsam gefilterter Diagnosen.
Die Tests sind unter tests/ enthalten.
Testfälle umfassen Auswahl,
Abbrechen, nachgeladene Einträge, doppelte Titel, deutsch/englische Bedienelemente,
Fehler, verspätete Rücknahmen, ID-Konflikte, fremde Links, Nachladen, Scrollbereiche,
Abbrechen des Ladens, virtualisierte Listen und die Prüfung der gesamten Auswahl.
Neue Regressionstests prüfen moderne ChatGPT-Zeilen, Gemini-Metadaten,
versteckte Menüknöpfe, Claudes gemeldeten Session-Dialog, französische/japanische
Löschaktionen und widersprüchliche Zuordnungen auch bei gleichen Chat-Titeln.

Für Version 1.2.6 war der angemeldete Chrome-Browser verbunden: ChatGPTs nativer
Löschdialog wurde geöffnet, gelesen und abgebrochen; die Gemini-Checkboxen wurden
auf den beiden geladenen Chats geprüft. Endgültige Löschungen wurden weiterhin
ausschließlich mit lokalen Testdaten simuliert. Der zusätzliche ChatGPT-Zweig
unterstützt die konkret beobachtete englische Dialogformulierung.
Für frühere Versionen wurden die vom Benutzer exportierten, gefilterten
DOM-Diagnosen der angemeldeten ChatGPT- und Gemini-Seiten ausgewertet.
Der genaue Claude-Dialog wurde vom Benutzer mitgeteilt; ältere zusätzliche
DOM-Varianten beruhen auf veröffentlichten Adapterquellen.
Claude- und Gemini-Unterstützung ist vorläufig;
abweichende Oberflächen können eine Anpassung erfordern. Zuerst mit einem
entbehrlichen Chat ausprobieren. Es wurden beim Entwickeln keine echten Chats
gelöscht. „Perfekte UI/UX“ oder universelle Kompatibilität wird nicht behauptet.

WELCHE NICHT SICHTBAREN CHATS ERREICHT DIE ERWEITERUNG?
- Geladen, aber oberhalb/unterhalb des Bildschirmausschnitts: erhalten Checkboxen
  und werden von „Alle geladenen auswählen“ erfasst.
- Noch nicht geladen: werden nach manuellem Scrollen oder „Weitere Chats laden“
  erkannt, sofern die Website sie dadurch lädt und ihre Struktur unterstützt wird.
- Eingeklappte Gruppen: zuerst selbst öffnen; dann werden passende Einträge
  erneut geprüft. Die Erweiterung klickt keine fremden Aufklapp-Schaltflächen.
- Geschlossene Projekte, Archive, Suchergebnislisten und unklar zuordenbare
  Einträge: werden nicht erfasst. Eine Checkbox bedeutet eindeutige Erkennung,
  nicht die Garantie, dass die aktuelle Anbieteroberfläche unterstützt wird.

Es gibt keinen Zugriff auf den gesamten Verlauf über eine versteckte API. Bei
virtualisierten Listen entfernt die Website Einträge beim Scrollen aus der Seite.
Die Auswahl bleibt im Speicher, aber es erscheinen Hinweise zum erneuten Laden
oder Entfernen aus der Vorschau. In solchen Listen in kleineren Gruppen arbeiten.
Vorhandene Menüs/Dialoge, mehrere mögliche Scrollbereiche oder eine geänderte
Seitenleiste halten das Nachladen an. Ein Ladeende nach kurzer Ruhezeit beweist
nicht, dass langsame Netzwerkanfragen abgeschlossen oder alle Chats geladen sind.

Hinweis: Claude hat auch eine eigene Mehrfachauswahl: „Chats and tasks“ öffnen,
beim Chat ⋮ → „Select“, weitere Checkboxen oder „Select all“, dann „Delete“.

WENN KEINE CHECKBOXEN ERSCHEINEN
1. Den Tab nach der Installation/Aktualisierung neu laden.
2. Bei dem Dienst anmelden und die Verlaufsseitenleiste ausklappen.
3. Prüfen, ob Chrome den Zugriff der Erweiterung auf diese Website erlaubt.
4. Es kann sein, dass die aktuelle Oberfläche noch nicht erkannt wird.
   Die Erweiterung löscht dann nichts und muss angepasst werden.

WENN DIE VERARBEITUNG ANHÄLT
Offene Dialoge und Menüs prüfen. Bei verschwundenen oder geänderten Einträgen
neu auswählen. Wenn das Ergebnis der letzten Aktion unklar ist, zuerst den Tab
neu laden und den Verlauf prüfen. Keine automatische Wiederholung einer
möglicherweise bereits ausgeführten Löschung.

„Aus dem Verlauf entfernt“ beschreibt den beobachteten Zustand der Oberfläche,
keine unabhängige Bestätigung des serverseitigen Löschstatus. Die Erweiterung
überwacht neue Hinweise und wiederauftauchende Einträge während der ganzen
Verarbeitung und einer kurzen Abschlusskontrolle; beliebig späte Serverfehler
kann eine reine Oberflächensteuerung nicht ausschließen.

TECHNIK UND DATEN
- Zugriff nur auf chatgpt.com, claude.ai und gemini.google.com im Hauptfenster.
- Keine Cookies-, tabs-, storage- oder Alle-Webseiten-Berechtigung.
- Keine eigenen Netzwerkanfragen, keine Telemetrie, keine Zugriffstokens.
- Liest die sichtbare DOM-Struktur für Chat-Titel, IDs, Links, Menüs und Dialoge.
- Auswahl nur im Arbeitsspeicher des Tabs; keine Speicherung beim Neuladen.
- Nur ein Klick auf „Diagnose speichern“ erzeugt einen lokalen technischen
  Bericht. Der Benutzer entscheidet selbst über dessen Weitergabe.
- Die jeweiligen Websites senden ihre normalen Löschanfragen nach den Klicks.
- Menü und Auslöser müssen über aria-controls eindeutig zusammengehören.
- Bei Dialogen ohne Chat-Titel wird die Zuordnung aus dem zuvor geprüften,
  ID-gebundenen Menü und einer eindeutig gekennzeichneten Löschbestätigung
  abgeleitet. Explizite widersprüchliche IDs oder erkannte fremde Titel stoppen
  den Ablauf. Ein allgemeiner Dialog ist keine unabhängige Identitätsbestätigung.
  Fehlen technische Aktionsmerkmale, gelten begrenzte bekannte Textvorlagen.
- Bei Gemini müssen Link und Container-ID übereinstimmen. Ohne stabile ID wird
  ein Eintrag nicht ausgewählt; Titel und Listenposition sind kein Ersatz.
- Keine fremden Programmbibliotheken im ausgelieferten Erweiterungscode.
- Unabhängiges Hilfsprogramm, kein offizielles Produkt der drei Anbieter.

QUELLCODE UND TESTS
providers.js: domainspezifische Verlaufs-, ID- und Titelerkennung.
core.js: gemeinsame Menü-/Dialogprüfung und schrittweise Verarbeitung.
diagnostics.js: lokaler, manuell ausgelöster Bericht zur Chat-Erkennung.
content.js / content.css / ui-style.js: Checkboxen, Auswahl und Oberfläche.
popup.*: Erweiterungsmenü. manifest.json: Chrome-Konfiguration.
tests/: ausschließlich lokale Beispiele, keine Kontodaten.

Entwicklung (Node.js 20+): npm ci; npx playwright install chromium; npm test.
Tests verwenden ein neues temporäres Profil. Webseitenanfragen werden durch
lokale Testdaten ersetzt, andere Anfragen blockiert. Optional PLAYWRIGHT_MODULE
und CHROMIUM_PATH auf vorhandene Installationen setzen. Für die normale
Benutzung werden Node.js und npm nicht benötigt.

ENTFERNEN
In chrome://extensions „AI Chat-Auswahl“ entfernen und betroffene Tabs neu laden.

QUELLEN UND ERKENNUNGSBASIS
Offizielle Löschabläufe:
https://help.openai.com/de-de/articles/8809935-deleting-and-archiving-chats-in-chatgpt
https://support.claude.com/en/articles/8230524-delete-or-rename-a-conversation
https://support.google.com/gemini/answer/13666746?hl=en&co=GENIE.Platform%3DDesktop
Installation:
https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world
Öffentliche Hinweise auf Gemini-Selektorvarianten (kein Live-Nachweis):
https://github.com/learnerLj/ai-chat-bulk-manager/blob/master/spec.md
https://greasyfork.org/en/scripts/556503-gemini-bulk-chat-deleter/code
Zusätzlich wurde Geminis abgemeldete Navigation mit bard-sidenav live angesehen.
Zusätzliche Quellen für Version 1.2.1 (keine Live-Verifikation am Benutzerkonto):
https://github.com/AkumaNomu/ChatGPT-Web-Utils/blob/main/chatgpt-mass-delete/content.js
https://greasyfork.org/en/scripts/544960-gemini-conversation-folders/code
https://greasyfork.org/en/scripts/592510-gemini-imgen-enhancer/code
Die Implementierung ist eigenständig; Drittanbieter-Skripte werden nicht geladen.
