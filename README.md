# Filmster – Multiplayer Film-Quiz

**Filmster** ist eine Web-App, die Film-Quiz-Sessions mit Freunden ermöglicht – synchronisiert über Firebase.  
Sie kombiniert QR-Code-Scanning, Trailer-Streaming und ein Punktesystem. Zwei Spielmodi: **lokal** (Einzelgerät, auch mit mehreren Spielern) und **online** (mehrere Geräte, inkl. TV-Gerät als zentrale Trailer-Wiedergabe).

![Filmster Logo](https://via.placeholder.com/800x200?text=Filmster+Preview)

## 📦 Inhalt

- [Funktionen](#funktionen)
- [Installation & Setup](#installation--setup)
- [Firebase einrichten](#firebase-einrichten)
- [CSV-Dateien vorbereiten](#csv-dateien-vorbereiten)
- [Spielmodi im Detail](#spielmodi-im-detail)
  - [Lokal – Einfacher Scan (ohne Punkte)](#lokal--einfacher-scan-ohne-punkte)
  - [Lokal – Mehrspieler (mit Punkten & Ziel)](#lokal--mehrspieler-mit-punkten--ziel)
  - [Online – Raum erstellen / beitreten](#online--raum-erstellen--beitreten)
  - [Online – TV-Modus](#online--tv-modus)
- [Bedienung während des Spiels](#bedienung-während-des-spiels)
- [CSV-Struktur](#csv-struktur)
- [Fehlerbehebung](#fehlerbehebung)
- [Technologie-Stack](#technologie-stack)

---

## ✨ Funktionen

- **QR-Code-Scan** von Filmkarten (ID-basiert)
- **Manueller Kamerawechsel** (Front‑/Rückkamera) – besonders nützlich auf Smartphones
- **Trailer-Wiedergabe** (bis zu 3 Trailer pro Film, Deutsch/Englisch)
- **Tipp-System** (Hinweise aus CSV, max. 3 pro Film)
- **Punktesystem** (Schwierigkeitsgrad + Bonus für Titel/Regisseur – Tippabzug)
- **Zwei lokale Varianten**:
  - Einfacher Scan (nur Trailer & Tipps, kein Punkte, kein Spielerwechsel)
  - Mehrspieler (Punkte, Spielerliste, Zielvorgabe)
- **Online-Modus** mit Firebase-Realtime-Database
  - Raum-Code (6‑stellig)
  - Synchronisierte Spielzüge (wer ist dran)
  - **TV-Modus**: Ein Gerät zeigt Trailer im Vollbild mit Ton, alle anderen dienen als Fernbedienung
  - Zuschauer-Ansicht (sehen Trailer stumm)
- **Sprachumschaltung** (Deutsch/Englisch) für Trailer
- **Zielvorgabe** (Punkte oder Anzahl richtig erratener Filme)

---

## 🚀 Installation & Setup

### 1. Dateien herunterladen

Lade folgende Dateien in ein Verzeichnis deines Webservers (oder lokal über `http-server`):

- `index.html`
- `style.css`
- `app.js`
- `Filmster-Filme-V5.csv`
- `Filmster-FunFacts-V5.csv`

### 2. Firebase-Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Neues Projekt erstellen (z. B. „Filmster“)
3. Unter „Build“ → **Realtime Database** aktivieren (Startmodus: **Testmodus** – später mit Sicherheitsregeln absichern)
4. Unter „Projektübersicht“ → „App einbinden“ → **Web-App** → Namen vergeben
5. Kopiere die **Firebase-Konfiguration** (apiKey, authDomain, databaseURL, projectId, ...)

### 3. Firebase-Konfiguration in `index.html` einfügen

Öffne `index.html` und ersetze die `FIREBASE_CONFIG`-Konstanten mit deinen Werten:

```javascript
const FIREBASE_CONFIG = {
    apiKey: "DEIN-API-KEY",
    authDomain: "dein-projekt.firebaseapp.com",
    databaseURL: "https://dein-projekt-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dein-projekt",
    storageBucket: "dein-projekt.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

> **Hinweis**: Der Testmodus erlaubt Lese- und Schreibzugriffe ohne Authentifizierung. Für den Produktivbetrieb empfehlen wir [Sicherheitsregeln](https://firebase.google.com/docs/database/security).

### 4. CSV-Dateien bereitstellen

Lege die beiden CSV-Dateien im selben Ordner wie `index.html` ab. Siehe [CSV-Struktur](#csv-struktur) für das erforderliche Format.

### 5. Server starten

Da die App mit `fetch` auf CSV-Dateien zugreift und die Kamera benötigt, musst du einen lokalen Webserver verwenden (z. B. `npx http-server .` oder über VS Code Live Server). Ein einfaches Öffnen der HTML-Datei (`file://`) funktioniert **nicht** (CORS und Kamera-Berechtigungen).

---

## 🗄️ CSV-Dateien vorbereiten

### `Filmster-Filme-V5.csv`

Enthält alle Filme mit folgenden Spalten (Trennzeichen `;`):

| Spalte | Beschreibung | Beispiel |
|--------|--------------|----------|
| `Nr` | Eindeutige ID (wird im QR-Code verwendet) | `134` |
| `Titel Deutsch` | Deutscher Titel | `Der Herr der Ringe` |
| `Titel Original` | Originaltitel | `The Lord of the Rings` |
| `Jahr` | Erscheinungsjahr | `2001` |
| `Regissure` | Regisseur(in) | `Peter Jackson` |
| `Schwierigkeit` | Basis-Punkte (1-5) | `3` |
| `App-Link_Video-1_DE` | URL zu Trailer 1 (Deutsch) | `https://...` |
| `App-Link_Video-2_DE` | URL zu Trailer 2 (Deutsch) | `https://...` |
| `App-Link_Video-3_DE` | URL zu Trailer 3 (Deutsch) | `https://...` |
| `App-Link_Video-1_EN` | URL zu Trailer 1 (Englisch) | `https://...` |
| `App-Link_Video-2_EN` | ... | ... |
| `App-Link_Video-3_EN` | ... | ... |

> **Wichtig**: Die Trailer-URLs müssen direkt abspielbare Video-Dateien sein (z. B. MP4). YouTube-Links funktionieren nicht.

### `Filmster-FunFacts-V5.csv`

Enthält Hinweise (Tipps) und Fun-Facts pro Film. Format (Trennzeichen `;`):

| Spalte | Beschreibung | Beispiel |
|--------|--------------|----------|
| `Nr` | Film-ID (wie in Filme-CSV) | `134` |
| `Hinweise` | JSON-Array mit max. 3 Hinweisen (z. B. Erscheinungsjahr, Schauspieler) | `["Der Film spielt in Mittelerde","Basierend auf einem Roman von J.R.R. Tolkien"]` |
| `FunFacts` | JSON-Array mit lustigen Fakten (wird Zuschauern gezeigt) | `["Die Dreharbeiten dauerten 274 Tage"]` |

Beide Arrays müssen gültiges JSON sein (in Anführungszeichen). Die App erwartet, dass die erste Zeile die Kopfzeile ist.

---

## 🎮 Spielmodi im Detail

### Lokal – Einfacher Scan (ohne Punkte)

- **Ziel**: Nur Trailer ansehen & Tipps lesen – kein Wettbewerb.
- **Ablauf**:
  1. „Lokal“ auswählen → „Einfacher Scan“.
  2. „Scanner starten“ → Kamera öffnet sich.
  3. QR-Code einer Filmkarte scannen.
  4. Trailer & Tipps werden angezeigt. Buttons: „Erneut scannen“ (verwirft Film) oder „Film erraten?“ (Bestätigung ohne Punkte).
  5. Nach Bestätigung startet der Scanner sofort neu – kein Spielerwechsel, keine Punkte.

### Lokal – Mehrspieler (mit Punkten & Ziel)

- **Ziel**: Mehrere Spieler treten gegeneinander an.
- **Setup**:
  - Spieler hinzufügen (Namen).
  - Ziel wählen: **Punkteziel** (z. B. 30 Punkte) oder **Anzahl richtig erratener Filme** (z. B. 5).
- **Ablauf**:
  1. Zufälliger Startspieler wird bestimmt.
  2. Aktiver Spieler scannt Film → sieht Trailer & Tipps (Ton an).
  3. Entscheidet, ob er den Film erraten hat:
     - **Ja**: Basis-Punkte (Schwierigkeit) werden gutgeschrieben + Bonus für Titel/Regisseur (manuell klickbar). Tipp-Abzug (1 Punkt pro genutztem Tipp).
     - **Nein**: 0 Punkte für diese Runde.
  4. Runde wird gespeichert, nächster Spieler ist dran.
  5. Sobald ein Spieler das Ziel erreicht, wird das Spiel beendet und der Sieger angezeigt.
- **Besonderheit**: Tipps werden nur dem aktiven Spieler angezeigt (Overlay). Bonus-Punkte können nach der Auflösung vergeben werden.

### Online – Raum erstellen / beitreten

- **Host**:
  1. „Online“ auswählen → „Neuen Raum erstellen“.
  2. Name eingeben → Raum-Code wird generiert (6-stellig).
  3. In der Warteschlange können weitere Spieler beitreten (Code teilen).
  4. Host kann **Ziel** festlegen (Punkte oder erratene Filme).
  5. „Spiel starten“ – das Spiel beginnt mit Spieler 0 (nach `joinedAt` sortiert).
- **Spieler**:
  1. „Beitreten“ – Raum-Code eingeben, Name vergeben.
  2. Warten, bis Host startet.
- **Ablauf** (ähnlich lokal Mehrspieler, aber synchronisiert):
  - Nur der aktive Spieler kann scannen und Punkte vergeben.
  - Alle anderen sind **Zuschauer** und sehen stummgeschaltete Trailer & Fun-Facts.
  - Der aktive Spieler sieht im Modal die Trailer-Steuerung (Sprache, nächster Trailer) – das Update erfolgt über Firebase.
  - Nach der Runde wird automatisch der nächste Spieler aktiv (Reihenfolge nach Beitrittszeit).

### Online – TV-Modus

- Ein Gerät (z. B. Smart-TV, Beamer-PC) wird als **Fernseher** markiert.
- **Aktivierung**: In der Warteschlange Haken bei „Dieses Gerät als Fernseher“ setzen.
- Der TV zeigt den Trailer **im Vollbild mit Ton**.
- Alle anderen Geräte (Spieler-Handys) haben **kein eigenes Video** – sie steuern nur:
  - Sprache umschalten
  - Trailer wechseln (vor/zurück)
  - Tipps anzeigen
  - Film erraten / Punkte vergeben
- Der TV reagiert sofort auf Änderungen der Datenbank (Trailer-Index, Sprache, Film-ID).

> **Technisch**: Der TV hat `isTVMode = true`, läuft im Vollbild-Overlay, ignoriert alle lokalen Video-Elemente und hört nur auf `syncTrailerFromDB`.

---

## 🎮 Bedienung während des Spiels

| Element | Funktion |
|---------|----------|
| **Sprach-Buttons (DE/EN)** | Wechselt die Sprache aller Trailer (für alle Geräte synchron). |
| **Trailer-Navigation ( ◀ / ▶ )** | Wechselt zum nächsten/vorherigen verfügbaren Trailer-Clip (1-3 pro Sprache). |
| **Tipp anzeigen** | Zeigt einen Hinweis zum Film (max. 3 pro Film, Overlay). |
| **Film erraten?** | Öffnet das Rate-Modal (Ja/Nein). Danach folgt die Punktevergabe (Bonus). |
| **Kamera wechseln (Symbol)** | Schaltet zwischen Front- und Rückkamera um – ideal für Geräte ohne automatische Erkennung. |
| **Erneut scannen** (nur lokal / online TV) | Setzt den aktuellen Film zurück und startet den Scanner neu – ohne Punkteverlust. |
| **Spiel beenden** (nur Host) | Beendet das gesamte Spiel, zeigt Sieger an und löscht den Raum. |

---

## 📁 CSV-Struktur (Beispielzeilen)

**Filmster-Filme-V5.csv**:
```
Nr;Titel Deutsch;Titel Original;Jahr;Regissure;Schwierigkeit;App-Link_Video-1_DE;App-Link_Video-2_DE;App-Link_Video-3_DE;App-Link_Video-1_EN;App-Link_Video-2_EN;App-Link_Video-3_EN
134;Der Herr der Ringe;The Lord of the Rings;2001;Peter Jackson;3;https://example.com/trailer1_de.mp4;;;https://example.com/trailer1_en.mp4;;;
```

**Filmster-FunFacts-V5.csv**:
```
Nr;Hinweise;FunFacts
134;["Der Film spielt in Mittelerde","Ein Hobbit namens Frodo","Der Ring muss nach Mordor"];["Die Dreharbeiten dauerten 274 Tage","Die Produktion kostete 93 Mio. Dollar"]
```

> **Wichtig**: Leere Felder (z. B. kein dritter Trailer) bleiben einfach leer (zwei Semikola hintereinander). Die App prüft auf `trim()` und ignoriert leere Einträge.

---

## 🛠 Fehlerbehebung

### 1. Kamera startet nicht (schwarzer Bildschirm)
- **Ursache**: Keine HTTPS-Verbindung (oder `file://`). Kamera-API benötigt sicheren Kontext.
- **Lösung**: Verwende einen lokalen Webserver (`http-server` oder Live Server).

### 2. Kamera zeigt das falsche Bild (z. B. Frontkamera statt Rückkamera)
- **Lösung**: Nutze den **Kamera-wechseln-Button** (Kamera-Symbol) in der Scanner-Ansicht, um manuell zwischen Front- und Rückkamera umzuschalten.

### 3. Trailer werden nicht abgespielt
- **Ursache**: Falsche oder ungültige Video-URL (z. B. YouTube-Link).
- **Lösung**: Verwende direkte MP4-Links. Prüfe, ob die URLs im CSV korrekt sind.

### 4. Firebase-Daten werden nicht synchronisiert
- **Ursache**: Falsche Datenbank-URL oder fehlende Berechtigungen.
- **Lösung**: Prüfe die `FIREBASE_CONFIG` in `index.html`. Stelle sicher, dass die Realtime Database im Testmodus ist (`read: true, write: true`).

### 5. Im TV-Modus bleibt das Handy des aktiven Spielers hängen (Buttons reagieren nicht)
- **Ursache**: Doppelte `debounce` oder fehlerhafter `tvModeActive`-Listener (in der aktuellen Version behoben).
- **Lösung**: Aktualisiere `app.js` auf die neueste Version (siehe [Code](#)).

### 6. Punkte werden nicht korrekt addiert (lokal Mehrspieler)
- **Ursache**: `gameMode` wurde nicht auf `'tournament'` gesetzt.
- **Lösung**: Stelle sicher, dass in `showLocalPlayerSetup()` `gameMode = localSimpleMode ? 'normal' : 'tournament'` gesetzt wird.

---

## 🧱 Technologie-Stack

- **Frontend**: HTML5, CSS3 (Glassmorphism-Design), JavaScript (ES2020)
- **QR-Code-Scanning**: [html5-qrcode](https://github.com/mebjas/html5-qrcode) (v2.3.8) mit optimierter Konfiguration (qrbox-Funktion, `disableFlip: false`, `rememberLastUsedCamera: true`)
- **Backend / Sync**: Firebase Realtime Database (v10.8.0)
- **Icons**: FontAwesome 6.4.0
- **Schrift**: Inter (Google Fonts)

---

## 📝 Lizenz

Dieses Projekt ist für den privaten und schulischen Gebrauch gedacht.  
Die enthaltenen Filmdaten und Trailer-URLs unterliegen den Rechten ihrer jeweiligen Eigentümer.

---

## 💬 Support & Beiträge

Bei Fragen oder Fehlern kannst du ein Issue im Repository öffnen.  
Verbesserungsvorschläge sind willkommen – bitte als Pull Request.

Viel Spaß mit **Filmster**! 🎬🍿