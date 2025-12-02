# 🎬 Filmster QR Scanner

![Filmster App](https://via.placeholder.com/800x400/0f172a/3b82f6?text=Filmster+QR+Scanner+App)
*Eine elegante Web-App zum Scannen von Filmkarten-QR-Codes und Ansehen von Trailern*

---

## ✨ Features

- **📷 QR-Scanner** mit automatischer Rückkamera-Erkennung
- **🎬 Trailer-Player** mit mehrsprachigen Trailern (DE/EN)
- **🎨 Modernes Glas-Design** mit elegantem UI
- **📱 Progressive Web App** - Installation auf Home Screen möglich
- **⚡ Sofortige Performance** - Keine Ladezeiten nach Initialisierung
- **🔄 Intelligente Navigation** - Kein Überspringen von Trailern
- **🔦 Kamera-Steuerung** - Wechsel zwischen Kameras, Flash-Funktion
- **📶 Offline-First** - Funktioniert ohne ständige Internetverbindung

---

## 🚀 Live Demo

**[Demo auf GitHub Pages ansehen](https://tomsevf.github.io/filmster/)**

*Hinweis: Für Kamera-Zugriff HTTPS erforderlich - lokal mit `http://localhost` funktioniert ebenfalls.*

---

## 📸 Screenshots

| Scanner-Modus | Trailer-Player |
|--------------|----------------|
| ![Scanner](https://via.placeholder.com/300x600/1e293b/3b82f6?text=QR+Scanner+View) | ![Player](https://via.placeholder.com/300x600/1e293b/ef4444?text=Trailer+Player+View) |

---

## 🛠️ Technologien

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **QR-Scanning**: [QrScanner Library](https://github.com/nimiq/qr-scanner) v1.4.2
- **Styling**: Modernes CSS mit Glassmorphism-Effekten
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Inter)
- **Hosting**: GitHub Pages (kostenlos)
- **Performance**: Optimiert für mobile Geräte

---

## 📦 Installation & Lokale Entwicklung

### Voraussetzungen
- Moderner Browser (Chrome 80+, Firefox 75+, Safari 13+)
- Node.js oder Python für lokalen Server (optional)
- Git (für Entwicklung)

### Schnellstart

```bash
# 1. Repository klonen
git clone https://github.com/tomsevf/filmster.git
cd filmster

# 2. Einen lokalen Server starten

# Option A: Mit Python (einfachst)
python -m http.server 8000

# Option B: Mit Node.js
npx serve .

# Option C: Mit PHP
php -S localhost:8000

# 3. Im Browser öffnen
# http://localhost:8000
```

### Für Entwicklung

```bash
# Repository forken und klonen
git clone https://github.com/tomsevf/filmster.git
cd filmster

# Live Server mit Hot Reload (empfohlen)
npm install -g live-server
live-server --port=8000

# Oder mit VS Code:
# 1. "Live Server" Extension installieren
# 2. Rechtsklick auf index.html → "Open with Live Server"
```

---

## 🏗️ Projektstruktur

```
filmster-qr-scanner/
├── index.html              # Haupt-HTML-Datei
├── style.css              # Stylesheet mit Glass-Design
├── app.js                 # Haupt-JavaScript-Logik
├── Filmster-Filme-V4.csv  # Film-Datenbank (480 Filme)
├── docs/                  # Dokumentation
│   ├── DOCUMENTATION.md   # Technische Dokumentation
│   ├── DEVELOPER_GUIDE.md # Entwicklerhandbuch
│   └── DEPLOYMENT.md      # Deployment-Anleitung
├── .github/              # GitHub Workflows
│   └── workflows/
│       └── deploy.yml    # Auto-Deployment zu GitHub Pages
└── assets/               # Statische Assets
    ├── icons/            # App-Icons für PWA
    └── screenshots/      # App-Screenshots
```

---

## 📱 Verwendung

### 1. QR-Code scannen
- App öffnen (Scanner startet automatisch)
- Kamera über QR-Code auf Filmkarte halten
- Rückkamera wird automatisch verwendet

### 2. Trailer ansehen
- Nach erfolgreichem Scan startet der erste Trailer
- Sprache zwischen **DE** (Deutsch) und **EN** (Englisch) wechseln
- Mit **Vor/Zurück** zwischen verfügbaren Trailern navigieren
- Automatischer Wechsel nach Trailer-Ende

### 3. Neu scannen
- Auf **"Neu scannen"** klicken
- Neue Filmkarte scannen

### Kamera-Steuerung
- **🔄 Kamera wechseln**: Zwischen Front- und Rückkamera umschalten
- **⚡ Flash**: Taschenlampe ein-/ausschalten (falls verfügbar)

---

## 🎨 Design

### Glas-Effekt (Glassmorphism)
```css
.element {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
}
```

### Farbpalette
- **Primär**: `#3b82f6` (Blau)
- **Hintergrund**: `#0f172a` (Dunkelblau)
- **Text**: `#f8fafc` (Weiß)
- **Akzent**: `#8b5cf6` (Lila)

### Responsive Design
- Mobile-First Ansatz
- Optimiert für alle Bildschirmgrößen
- Landscape-Mode Unterstützung

---

## 📖 Dokumentation

| Dokument | Beschreibung | Link |
|----------|--------------|------|
| 📚 **Vollständige Dokumentation** | Technische Details, Architektur, Code-Erklärungen | [DOCUMENTATION.md](docs/DOCUMENTATION.md) |
| 🛠️ **Entwicklerhandbuch** | Anleitung für Entwickler, Erweiterungen, Customizing | [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) |
| 🚀 **Deployment-Anleitung** | Hosting, PWA-Konfiguration, Produktion | [DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| 🔧 **API-Referenz** | Funktionen, Parameter, Rückgabewerte | [API.md](docs/API.md) |

---

## 🌐 Browser Support

| Browser | Version | Status | Notizen |
|---------|---------|--------|---------|
| Chrome | 80+ | ✅ Vollständig | Empfohlener Browser |
| Firefox | 75+ | ✅ Vollständig | Gute Performance |
| Safari | 13+ | ✅ Vollständig | iOS Unterstützung |
| Edge | 80+ | ✅ Vollständig | Chromium-basiert |
| iOS Safari | 13+ | ✅ Vollständig | PWA Installation möglich |
| Android Chrome | 80+ | ✅ Vollständig | Native-like Experience |

---

## 📱 PWA Features

Die App ist eine **Progressive Web App** und kann auf dem Home Screen installiert werden:

### Installation
- **Android**: Chrome Menü → "Zum Startbildschirm hinzufügen"
- **iOS**: Safari Share Button → "Zum Home-Bildschirm"
- **Desktop**: Chrome/Edge → "Install Filmster"

### Vorteile
- ⚡ Schneller Start (wie native App)
- 📶 Limited Offline-Funktionalität
- 🔔 Push Notifications (erweiterbar)
- 🎨 Vollbild-Modus ohne Browser-UI

---

## 🔧 Entwicklung

### CSV-Datenbank
Die App verwendet eine CSV-Datei mit folgender Struktur:
```
Nr;Titel Deutsch;App-Link_Video-1_DE;App-Link_Video-1_EN;...
```

### Neue Filme hinzufügen
1. Neue Zeile in `Filmster-Filme-V4.csv` einfügen
2. Format beibehalten
3. QR-Codes müssen das Format haben: `filmster://result?id={FILM_ID}`

### Erweiterungsmöglichkeiten
- Weitere Sprachen hinzufügen (FR, ES, etc.)
- Dark/Light Mode implementieren
- Favoriten-Funktion
- Suchfunktion für Filme
- Analytics Integration

---

## 🤝 Beitragen

Beiträge sind willkommen! So kannst du helfen:

1. **🐛 Issues melden** - Bugs oder Feature Requests
2. **💻 Code beitragen** - Pull Requests
3. **📖 Dokumentation verbessern** - Typos, Klarheit
4. **🌍 Übersetzungen** - Neue Sprachunterstützung
5. **📱 Testing** - Auf verschiedenen Geräten testen

### Entwicklungsworkflow
```bash
# 1. Fork erstellen
# 2. Branch erstellen
git checkout -b feature/neue-funktion

# 3. Änderungen machen und commiten
git commit -m "feat: Neue Funktion hinzufügen"

# 4. Push zu deinem Fork
git push origin feature/neue-funktion

# 5. Pull Request erstellen
```

### Code Style
- **JavaScript**: ES6+, camelCase, ausführliche Kommentare
- **CSS**: BEM Methodology, CSS Custom Properties
- **HTML**: Semantisches Markup, Accessibility-first

---

## 📄 Lizenz

Dieses Projekt ist unter der **MIT-Lizenz** lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

### Open Source Komponenten
- [QrScanner](https://github.com/nimiq/qr-scanner) - MIT License
- [Font Awesome](https://fontawesome.com) - CC BY 4.0
- [Google Fonts](https://fonts.google.com) - Apache 2.0

---

## 📞 Support & Kontakt

- **GitHub Issues**: [Issues öffnen](https://github.com/tomsevf/filmster/issues)
- **E-Mail**: info@everyfilms.de
- **Dokumentation**: [Vollständige Docs](docs/DOCUMENTATION.md)

### Häufige Probleme & Lösungen

| Problem | Lösung |
|---------|--------|
| Kamera funktioniert nicht | HTTPS verwenden, Berechtigungen erteilen |
| QR-Code wird nicht erkannt | Bessere Beleuchtung, näher halten |
| Trailer laden nicht | Internetverbindung prüfen, alternative Sprache |
| App lädt langsam | Service Worker cachen, CDN verwenden |

---

## 🙏 Danksagung

- [QrScanner Library](https://github.com/nimiq/qr-scanner) für exzellente QR-Scanning-Funktionalität
- [Font Awesome](https://fontawesome.com) für die Icons
- [Google Fonts](https://fonts.google.com) für die Inter-Schriftart
- Allen Mitwirkenden und Testern

---

## 📊 Projekt Status

**Version**: 1.0.0  
**Letztes Update**: Oktober 2023  
**Autor**: [Dein Name]  
**Status**: ⚡ Aktiv entwickelt

| Bereich | Status | 
|---------|--------|
| Funktionalität | ✅ Vollständig |
| Dokumentation | ✅ Vollständig |
| Performance | ✅ Optimiert |
| Browser Support | ✅ Breit |
| Mobile Experience | ✅ Exzellent |

---

## 🌟 Stern Geschichte

Wenn dir dieses Projekt gefällt, gib ihm einen ⭐ auf GitHub!

---
