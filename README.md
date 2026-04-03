# 🎬 Filmster – Turnier-Edition

Eine interaktive Web‑App für ein Gesellschaftsspiel mit Filmen.  
Spieler scannen QR‑Codes auf Filmkarten, sehen Trailer, erhalten Hinweise zum Erscheinungsjahr und vergeben Punkte.  
Im **Turniermodus** wird der Punktestand aller Spieler verwaltet, das Spiel kann mit einem Punkteziel oder manuell beendet werden.

---

## ✨ Features

- **QR‑Code Scanner** – Erkennt Filmkarten (Format `filmster://result?id=001` oder reine Nummer `001`).
- **Trailer & Sprachauswahl** – Pro Film bis zu 3 Trailer (Deutsch/Englisch, je nach CSV).
- **Tipp‑System** – Drei aufsteigende Hinweise zum Erscheinungsjahr (schwer → mittel → leicht).
- **Turniermodus**:
  - Beliebig viele Spieler/Teams hinzufügen.
  - Zufälliger Startspieler.
  - Punktevergabe nach jeder Runde:
    - Basis = Schwierigkeit (1–5)
    - +1 für erratenen Titel
    - +1 für erratenen Regisseur
    - –1 pro genutztem Tipp
  - Punkteziel (z.B. 30 Punkte) → Sieger wird automatisch ermittelt.
  - Spiel beenden & Sieger küren (auch manuell möglich).
  - CSV‑Export/Import der Spielerdaten (inkl. Rundenergebnisse).
- **Normalmodus** – ohne Spielerverwaltung, nur QR‑Scan, Trailer, Tipps.
- **Responsive Design** – Optimiert für Smartphones, Tablets und Desktop.

---

## 📁 Projektstruktur

```
filmster/
├── index.html          # Hauptseite
├── style.css           # Alle Styles
├── app.js              # Komplette Anwendungslogik
├── Filmster-Filme-V5.csv      # Filmdaten (Titel, Jahr, Regie, Trailer-URLs, Schwierigkeit)
├── Filmster-FunFacts-V5.csv   # Hinweise und Fun Facts
└── README.md           # Diese Datei
```

> **Hinweis:** Die CSV‑Dateien müssen **im selben Ordner** wie `index.html` liegen.  
> Die Trailer‑Videos werden über die in der CSV angegebenen URLs geladen (z. B. von Bunny.net).

---

## 🚀 Installation & Start

### Lokal (z. B. mit VS Code Live Server)

1. **Repository klonen** oder alle Dateien herunterladen.
2. Sicherstellen, dass die beiden CSV‑Dateien vorhanden sind.
3. Die `index.html` mit **Live Server** öffnen (Rechtsklick → `Open with Live Server`).  
   → Die Kamera benötigt HTTPS oder `localhost`. Der Live Server erfüllt dies.
4. Kamera‑Berechtigung erlauben → los geht’s.

### Auf GitHub Pages

1. Repository auf GitHub anlegen.
2. Alle Dateien (`index.html`, `style.css`, `app.js`, die beiden CSV‑Dateien) in den Hauptordner legen.
3. In den Repository‑Einstellungen **GitHub Pages** aktivieren (Branch `main` / `master`).
4. Die Seite ist unter `https://<benutzername>.github.io/<repository>/` erreichbar.

> **Wichtig:** Die Kamera funktioniert nur über **HTTPS** (GitHub Pages) oder **localhost**.  
> Lokales Öffnen der `index.html` per `file://` führt zu einem Fehler.

---

## 🎮 Spielablauf (Turniermodus)

1. **Spieler hinzufügen** – Namen eintragen und mit `+ Hinzufügen` bestätigen.
2. **Turniermodus** auswählen und ggf. ein **Punkteziel** festlegen (z. B. 30).
3. **Spiel starten** – Ein zufälliger Startspieler wird ausgelost.
4. **Karte scannen** – QR‑Code der Filmkarte vor die Kamera halten.
5. **Trailer ansehen** – In Deutsch/Englisch wechseln, zwischen mehreren Trailern navigieren.
6. **Tipps nutzen** – Maximal drei Hinweise zum Erscheinungsjahr (zählen als Minuspunkte).
7. **„Film erraten?“** – Button klicken und im Modal bestätigen, ob der Film erraten wurde.
8. **Punkte vergeben** – Im erscheinenden Modal:
   - Schwierigkeit (automatisch)  
   - Titel richtig? → `+1` (nur einmal klickbar)  
   - Regisseur richtig? → `+1` (nur einmal klickbar)  
   - Anzahl genutzter Tipps → Abzug (automatisch)
9. **Runde speichern** – Punkte werden zum aktuellen Spieler addiert.
10. **Nächster Spieler** – Der Scanner öffnet sich wieder für den nächsten Spieler.
11. **Spiel beenden** – Über den Button `Spiel beenden & Sieger` wird der Spieler mit den meisten Punkten gekürt. Das Spiel kann anschließend zurückgesetzt werden.

### Normalmodus
- Keine Spielerliste, kein Punktesystem.
- Nach QR‑Scan werden sofort Trailer und Tipps angezeigt.
- Der Button `Neu scannen` kehrt zum Scanner zurück.

---

## 📦 CSV‑Dateien – Format

### `Filmster-Filme-V5.csv`

| Spalte | Beispiel |
|--------|----------|
| Nr | `001` |
| Titel Original | `A Walk to Remember` |
| Titel Deutsch | `Nur mit Dir` |
| Jahr | `2002` |
| Regissure | `Adam Shankman` |
| … | … |
| Schwierigkeit | `5` (1–5) |
| App-Link_Video-1_DE | `https://…/Filmster_001_DE_Video-1.mp4` |
| App-Link_Video-1_EN | `https://…/Filmster_001_EN_Video-1.mp4` |
| App-Link_Video-2_DE | … |
| App-Link_Video-3_DE | … |

### `Filmster-FunFacts-V5.csv`

| Spalte | Beispiel |
|--------|----------|
| Nr | `001` |
| Hinweise | `["Hinweis 1","Hinweis 2","Hinweis 3"]` |
| FunFacts | `["Fakt 1","Fakt 2"]` |

> **Wichtig:** Die Arrays müssen als gültiges JSON formatiert sein (doppelte Anführungszeichen).  
> Die App enthält einen robusten Parser, der auch fehlerhafte JSON‑Strings korrigiert.

---

## 🛠 Technologien

- **HTML5, CSS3, Vanilla JavaScript** – keine zusätzlichen Frameworks.
- **QR Scanner Bibliothek** – [`qr-scanner`](https://github.com/nimiq/qr-scanner) (lädt das Video‑Element).
- **Font Awesome** – Icons.
- **Google Fonts** – Schriftart *Inter*.
- **LocalStorage** – Speicherung von Spielerdaten und Einstellungen.

---

## 📄 Lizenz

Dieses Projekt ist für den privaten und nicht‑kommerziellen Gebrauch bestimmt.  
Die enthaltenen Filmdaten und Trailer unterliegen den Rechten ihrer jeweiligen Inhaber.

---

## 🙌 Mitwirken / Fehler melden

Bei Problemen oder Verbesserungsvorschlägen erstelle bitte ein **Issue** im GitHub‑Repository.  
Folgende Informationen helfen bei der Fehlersuche:

- Welcher Browser / welches Gerät?
- Konsole‑Ausgabe (F12) nach dem Auftreten des Fehlers.
- Schritte zum Reproduzieren.

---

**Viel Spaß beim Spielen!** 🎬🍿