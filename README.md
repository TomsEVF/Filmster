# 🎬 Filmster – Turnier-Edition

**Filmster** ist eine interaktive Web-App für Filmabende, bei der Spieler*innen Film-QR-Codes scannen, Trailer ansehen, Hinweise zum Erscheinungsjahr erhalten und im Turniermodus Punkte sammeln können.  
Ideal für Spieleabende, Unterricht oder Filmclubs.

## ✨ Features

- **Zwei Spielmodi**
  - 🎞️ **Normalmodus** – Einfaches Scannen und Ansehen von Trailern + Tipps (ohne Punkte, ohne Spieler)
  - 🏆 **Turniermodus** – Rundenbasiertes Spiel mit Spieler*innen, Punktesystem und Siegbedingungen

- **QR-Code Scanner** – Erkennt Filmkarten (Format: `id=123` oder reine Zahl)
- **Trailer & Sprachumschaltung** – Deutsche/englische Trailer (bis zu 3 pro Film)
- **Hinweise zum Film** – Drei aufsteigend einfache Tipps zum Erscheinungsjahr / Kontext
- **Punktevergabe (Turnier)**  
  - Basis-Punkte = Schwierigkeit des Films  
  - Zusatzpunkte für das richtige Nennen von **Titel** und **Regisseur**  
  - Punktabzug pro genutztem Tipp  
  - Ziel: Erste/r mit `X` Punkten **oder** `Y` richtig erratenen Filmen

- **Spieler‑ & Punktestand** – Wird im Scanner-Bildschirm und auf der Filmseite angezeigt
- **Lokale Datenspeicherung** – Spielstand bleibt beim Neuladen erhalten (außer beim Moduswechsel)
- **Responsive Design** – Optimiert für Smartphones, Tablets und Desktop

## 🧩 Technologien

- HTML5, CSS3, JavaScript (ES6+)
- [QR Scanner](https://github.com/nimiq/qr-scanner) – leistungsstarker, kamera-basierter QR-Code-Leser
- Google Fonts, Font Awesome Icons
- CSV-Dateien als Datenbank (Filme, FunFacts)

## 📁 Projektstruktur

```
filmster/
├── index.html
├── style.css
├── app.js
├── README.md
├── Filmster-Filme-V5.csv
└── Filmster-FunFacts-V5.csv
```

## 🚀 Installation & Start

1. **Repository herunterladen** oder alle Dateien in einen Ordner kopieren.
2. Die beiden CSV-Dateien (`Filmster-Filme-V5.csv`, `Filmster-FunFacts-V5.csv`) müssen **im selben Ordner** wie `index.html` liegen.
3. **Lokalen Webserver starten** (wichtig wegen `fetch`-Zugriff auf CSV-Dateien):
   - Mit Python:  
     ```bash
     python3 -m http.server 8000
     ```
   - Mit VS Code Live Server
   - Oder einfach die Dateien auf einen beliebigen Webhosting-Dienst hochladen (z. B. Netlify, GitHub Pages)

4. Im Browser `http://localhost:8000` öffnen.

> **Hinweis:** Die Kamera-Berechtigung muss erteilt werden. Die App funktioniert nur über HTTPS (lokal via `localhost` ist HTTP erlaubt) oder auf producktiven HTTPS-Seiten.

## 🎮 Bedienung

### 1. Modus wählen
- **Normal** → Nur scannen, Trailer & Tipps. Keine Spieler, keine Punkte.
- **Turnier** → Zuerst Spieler*innen anlegen, dann Startspieler per Zufall.

### 2. Turnier‑Ablauf
- **Spieler‑Setup**: Namen hinzufügen, ggf. entfernen.
- **Scannen**: Filmkarte (QR-Code mit `id=123` oder nur Zahl) vor die Kamera halten.
- **Filmseite**:  
  - Trailer in Deutsch/Englisch ansehen  
  - Tipps anfordern (werden im Overlay groß angezeigt)  
  - **„Film erraten?“** (nur Turnier) – öffnet ein Modal, in dem der **echte Filmtitel** erst jetzt sichtbar wird.
- **Antwort**:  
  - *Ja* → Basis-Punkte (Schwierigkeit) + Bonusoptionen für Titel & Regisseur  
  - *Nein* → 0 Punkte, aber Tipps können trotzdem (mit Abzug) verwendet werden
- **Punktevergabe**:  
  - Titel-/Regisseur-Bonus kann der Spieler/die Spielerin (oder Spielleiter*in) vergeben  
  - Bestätigen → Punkte werden zum Spieler addiert, nächste Person ist dran
- **Spielende**: Sobald ein Spieler das Punkte- oder erraten-Ziel erreicht hat, wird der Sieger bekannt gegeben und die Daten zurückgesetzt.

### 3. Normalmodus
- Nach dem Scannen wird sofort der Trailer gezeigt, Tipps sind verfügbar.
- Über den Button **„Neuen Film scannen“** gelangt man direkt zurück zur Kamera – ohne Punkte oder Spielerwechsel.

## 🔧 Problemlösungen

| Problem | Lösung |
|---------|--------|
| Kamera startet nicht | Klick auf **Kamera neu starten** (⟳) – fordert ggf. erneut Berechtigung an |
| Ungültiger QR-Code | App zeigt Fehlermeldung, Kamera bleibt aktiv |
| CSV-Dateien werden nicht geladen | Stelle sicher, dass die Dateien im selben Ordner liegen und der Webserver läuft |
| Filmtitel wird zu früh angezeigt | Ist nicht mehr der Fall – der Titel erscheint erst im **„Film erraten?“**-Modal (Turnier) bzw. im Normalmodus gar nicht |

## 📌 Anpassung

- **Eigene Filme**: CSV-Datei `Filmster-Filme-V5.csv` bearbeiten. Wichtig: Spaltenköpfe nicht verändern.  
- **Eigene Hinweise/FunFacts**: In `Filmster-FunFacts-V5.csv` pro Film drei Hinweise (Array) und beliebige Fun Facts hinterlegen.
- **Design**: `style.css` – CSS-Variablen (`--primary`, `--bg-card`, etc.) erlauben schnelle Farbanpassungen.

## 👥 Autor / Lizenz

Dieses Projekt entstand für den privaten und schulischen Gebrauch.  
Keine kommerzielle Nutzung der enthaltenen Filmdaten ohne Zustimmung der Rechteinhaber.

Viel Spaß beim Raten und Turnieren! 🍿🎥