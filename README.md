# AI Chat-Auswahl

Chrome-Erweiterung zum Auswählen und gemeinsamen Löschen von Chats bei ChatGPT,
Claude und Gemini. Version **1.2.8**, derzeit in privater Erprobung.

Die Erweiterung ergänzt Checkboxen in der Verlaufsseitenleiste und zeigt vor
dem Löschen eine prüfbare Auswahl. Sie arbeitet über die Oberfläche der Website,
ohne eigene Netzwerkanfragen, API-Schlüssel oder Telemetrie.

**Löschen ist endgültig.** Bei unklaren Chat-IDs, Menüs oder Dialogen hält der
Ablauf an. Änderungen an den Websites können Anpassungen erforderlich machen.

## Installation

1. Dieses Repository klonen oder den Quellcode als ZIP herunterladen und entpacken.
2. In Chrome `chrome://extensions` öffnen und den Entwicklermodus einschalten.
3. „Entpackte Erweiterung laden“ wählen und den Ordner mit `manifest.json` auswählen.
4. Die Tabs der unterstützten Dienste neu laden und „Chats aufräumen“ öffnen.

Nach Änderungen die Erweiterung auf `chrome://extensions` neu laden und danach
die betroffenen Tabs neu laden. Für die Benutzung sind Node.js und npm nicht nötig.

Die vollständige Bedienung, bekannte Grenzen und bisherige Änderungen stehen
in [README.txt](README.txt).

## Entwicklung und Tests

Voraussetzung: Node.js 20 oder neuer.

```sh
npm ci
npx playwright install chromium
npm test
```

Die Browsertests laufen in einem neuen temporären Profil. Anfragen an die drei
Dienste werden durch lokale Testseiten ersetzt; andere Anfragen werden blockiert.
Die Tests verwenden künstliche Chats und löschen keine echten Kontodaten.
Optional können `PLAYWRIGHT_MODULE` und `CHROMIUM_PATH` vorhandene Installationen
angeben.

Die bisherigen Live-Prüfungen bestätigen die Checkbox-Erkennung bei ChatGPT und
Gemini. ChatGPTs nativer Löschdialog wurde geöffnet und wieder abgebrochen; seine
Struktur wird durch lokale Tests nachgebildet. Ein vollständiger Live-Löschtest
mit eigens angelegten Testchats steht noch aus. Die Dialogerkennung unterstützt
bekannte Strukturen und Textvorlagen, nicht jede mögliche Sprache oder Variante.

ChatGPTs Verlauf unterstützt auch Codex-Aufgaben mit einer nativen Aufgaben-ID.
Diese erhalten Checkboxen und werden in der Vorschau als „Codex-Aufgabe“ markiert.
Link, Zeilen-ID und Menü müssen zum selben Eintrag gehören. Die Erweiterung
berücksichtigt sowohl direkte Löschaktionen als auch vorgeschaltete Dialoge;
sie wiederholt keine Aktion mit unklarem Ergebnis. Die endgültige Codex-Löschung
wurde nur mit künstlichen Testdaten geprüft.

Geminis aktueller Löschdialog wurde ebenfalls live geöffnet und abgebrochen.
Version 1.2.8 wartet auch darauf, dass Inhalt, Animation und Metadaten des Dialogs
fertig aufgebaut sind. Die native Chat-ID muss zur Auswahl passen; widersprüchliche
oder fehlerhafte Metadaten führen weiterhin zum Abbruch.

## Versionsverwaltung und Veröffentlichung

Der erste Git-Stand erfasst Version 1.2.6. Ältere Änderungen sind in `README.txt`
dokumentiert, liegen aber nicht als einzelne Git-Commits vor. ZIPs, lokale
Diagnosen, Zugangsdaten und Testausgaben gehören nicht ins Repository.

Vor einer öffentlichen Beta sind vollständige Tests mit eigens angelegten Chats
bei allen drei Diensten sowie die Wahl einer Quellcode-Lizenz vorgesehen. Eine
Veröffentlichung im Chrome Web Store wäre ein eigener Schritt.

Unabhängiges Hilfsprogramm; kein offizielles Produkt der drei Anbieter.
