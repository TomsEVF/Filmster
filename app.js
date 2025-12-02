/**
 * Filmster QR Scanner App - Finale Version
 */

// App State
let app = {
    films: [],
    currentFilm: null,
    scanner: null,
    currentLanguage: 'de',
    currentTrailerIndex: 1,
    availableTrailers: [],
    isInitialized: false // Verhindert doppelte Initialisierung
};

// Initialisierung
document.addEventListener('DOMContentLoaded', async () => {
    // Verhindere doppelte Initialisierung
    if (app.isInitialized) return;
    app.isInitialized = true;
    
    console.log('🚀 Filmster App startet...');
    
    try {
        // Zeige Loading
        document.getElementById('loadingOverlay').style.display = 'flex';
        
        // Warte auf QrScanner
        await waitForQrScanner();
        
        // Lade Film-Daten
        await loadFilms();
        
        // Setup Event Listener
        setupEvents();
        
        // Starte Scanner
        await startScanner();
        
        // Verstecke Loading
        document.getElementById('loadingOverlay').style.display = 'none';
        
        console.log('✅ App bereit');
        
    } catch (error) {
        console.error('❌ App Fehler:', error);
        document.getElementById('loadingOverlay').style.display = 'none';
        showError('App konnte nicht starten: ' + error.message);
    }
});

/**
 * Warte auf QrScanner
 */
function waitForQrScanner() {
    return new Promise((resolve) => {
        const check = () => {
            if (typeof QrScanner !== 'undefined') {
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

/**
 * Lade Film-Daten
 */
async function loadFilms() {
    try {
        console.log('📥 Lade Film-Daten...');
        
        const response = await fetch('Filmster-Filme-V4.csv');
        if (!response.ok) throw new Error('CSV nicht gefunden');
        
        const text = await response.text();
        app.films = parseCSV(text);
        
        console.log(`✅ ${app.films.length} Filme geladen`);
        
    } catch (error) {
        console.error('❌ CSV Fehler:', error);
        throw error;
    }
}

/**
 * CSV Parser
 */
function parseCSV(text) {
    const rows = text.trim().split('\n');
    const headers = rows[0].split(';').map(h => h.trim());
    
    return rows.slice(1).map(row => {
        const values = row.split(';').map(v => v.trim());
        const film = {};
        headers.forEach((h, i) => film[h] = values[i] || '');
        return film;
    });
}

/**
 * Starte Scanner (Rückkamera) - Vereinfachte Version ohne Overlay
 */
async function startScanner() {
    // Stoppe alten Scanner
    if (app.scanner) {
        await stopScanner();
    }
    
    // Zeige Scanner
    showScanner();
    
    try {
        // Erstelle neuen Scanner OHNE Highlighting
        app.scanner = new QrScanner(
            document.getElementById('scannerVideo'),
            handleQRScan,
            {
                preferredCamera: 'environment', // Rückkamera
                maxScansPerSecond: 2,
                highlightScanRegion: false,     // AUS
                highlightCodeOutline: false,    // AUS
                onCameraError: (error) => {
                    console.warn('Kamera-Fehler:', error);
                    // Versuche Frontkamera
                    if (app.scanner) {
                        app.scanner.setCamera('user').catch(() => {
                            showError('Kamera konnte nicht gestartet werden');
                        });
                    }
                }
            }
        );
        
        // Starte Scanner
        await app.scanner.start();
        console.log('📷 Scanner gestartet (kein Overlay)');
        
    } catch (error) {
        console.error('❌ Scanner Fehler:', error);
        
        // Versuche Frontkamera
        try {
            if (app.scanner) {
                await app.scanner.setCamera('user');
                console.log('📷 Frontkamera gestartet (Fallback)');
            }
        } catch (fallbackError) {
            console.error('❌ Auch Frontkamera fehlgeschlagen:', fallbackError);
            showError('Kamera konnte nicht gestartet werden');
        }
    }
}

/**
 * Scanner stoppen
 */
async function stopScanner() {
    if (!app.scanner) return;
    
    try {
        // Flash ausschalten
        try { 
            await app.scanner.turnFlashOff(); 
        } catch(e) {}
        
        // Scanner stoppen
        await app.scanner.stop();
        
        // Video Stream stoppen
        const video = document.getElementById('scannerVideo');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        
    } catch (error) {
        console.error('❌ Scanner Stop Fehler:', error);
    }
    
    app.scanner = null;
}

/**
 * QR Scan Handler
 */
async function handleQRScan(result) {
    console.log('🔍 QR Code:', result.data);
    
    // Scanner stoppen
    await stopScanner();
    
    // Film ID extrahieren
    const filmId = extractFilmId(result.data);
    
    if (!filmId) {
        showScannerError('Ungültiger QR-Code');
        return;
    }
    
    // Film suchen
    app.currentFilm = app.films.find(f => f.Nr === filmId);
    
    if (!app.currentFilm) {
        showScannerError(`Film #${filmId} nicht gefunden`);
        return;
    }
    
    // Zum Video wechseln
    switchToVideoMode();
}

/**
 * Film ID extrahieren
 */
function extractFilmId(qrData) {
    // Format: filmster://result?id=XXX
    const urlMatch = qrData.match(/id=(\d+)/);
    if (urlMatch) return urlMatch[1];
    
    // Format: Direkte Nummer
    const numMatch = qrData.match(/^(\d+)$/);
    if (numMatch) return numMatch[1];
    
    return null;
}

/**
 * Zum Video-Modus wechseln
 */
function switchToVideoMode() {
    // Scanner ausblenden
    document.getElementById('scannerSection').style.display = 'none';
    document.getElementById('scanResult').textContent = '';
    
    // Video anzeigen
    document.getElementById('videoSection').style.display = 'flex';
    
    // Verfügbare Trailer ermitteln
    updateAvailableTrailers();
    
    // Ersten Trailer laden
    app.currentTrailerIndex = 1;
    app.currentLanguage = 'de';
    updateLanguageButtons();
    loadCurrentTrailer();
}

/**
 * Verfügbare Trailer aktualisieren
 */
function updateAvailableTrailers() {
    app.availableTrailers = [];
    
    if (!app.currentFilm) return;
    
    // Prüfe Trailer 1-3 für aktuelle Sprache
    for (let i = 1; i <= 3; i++) {
        const key = `App-Link_Video-${i}_${app.currentLanguage.toUpperCase()}`;
        if (app.currentFilm[key] && app.currentFilm[key].trim() !== '') {
            app.availableTrailers.push(i);
        }
    }
    
    console.log(`📹 Verfügbare Trailer (${app.currentLanguage}):`, app.availableTrailers);
}

/**
 * Aktuellen Trailer laden
 */
function loadCurrentTrailer() {
    if (!app.currentFilm || app.availableTrailers.length === 0) {
        console.log('❌ Kein Trailer verfügbar');
        return;
    }
    
    // Sicherstellen, dass Index verfügbar ist
    if (!app.availableTrailers.includes(app.currentTrailerIndex)) {
        app.currentTrailerIndex = app.availableTrailers[0];
    }
    
    // Trailer URL
    const key = `App-Link_Video-${app.currentTrailerIndex}_${app.currentLanguage.toUpperCase()}`;
    const url = app.currentFilm[key];
    
    if (!url || url.trim() === '') {
        console.error('❌ Trailer URL leer');
        return;
    }
    
    // UI aktualisieren
    updateTrailerCounter();
    updateNavButtons();
    
    // Video laden
    const video = document.getElementById('trailerVideo');
    video.src = url;
    video.load();
    
    console.log(`▶️ Lade Trailer ${app.currentTrailerIndex}/${app.availableTrailers.length}`);
}

/**
 * Trailer Counter aktualisieren
 */
function updateTrailerCounter() {
    const counter = document.getElementById('trailerCounter');
    if (!counter) return;
    
    const position = app.availableTrailers.indexOf(app.currentTrailerIndex) + 1;
    counter.textContent = `Trailer ${position}/${app.availableTrailers.length}`;
}

/**
 * Navigation Buttons aktualisieren
 */
function updateNavButtons() {
    const prevBtn = document.getElementById('prevTrailerBtn');
    const nextBtn = document.getElementById('nextTrailerBtn');
    
    if (!prevBtn || !nextBtn) return;
    
    const currentPos = app.availableTrailers.indexOf(app.currentTrailerIndex);
    
    // Vor-Button
    prevBtn.disabled = currentPos <= 0;
    prevBtn.style.opacity = currentPos > 0 ? '1' : '0.5';
    
    // Weiter-Button
    nextBtn.disabled = currentPos >= app.availableTrailers.length - 1;
    nextBtn.style.opacity = currentPos < app.availableTrailers.length - 1 ? '1' : '0.5';
}

/**
 * Nächster Trailer
 */
function nextTrailer() {
    const currentPos = app.availableTrailers.indexOf(app.currentTrailerIndex);
    
    if (currentPos < app.availableTrailers.length - 1) {
        app.currentTrailerIndex = app.availableTrailers[currentPos + 1];
        loadCurrentTrailer();
    }
}

/**
 * Vorheriger Trailer
 */
function prevTrailer() {
    const currentPos = app.availableTrailers.indexOf(app.currentTrailerIndex);
    
    if (currentPos > 0) {
        app.currentTrailerIndex = app.availableTrailers[currentPos - 1];
        loadCurrentTrailer();
    }
}

/**
 * Sprache wechseln
 */
function switchLanguage(lang) {
    if (lang === app.currentLanguage) return;
    
    app.currentLanguage = lang;
    app.currentTrailerIndex = 1;
    
    // Sprach-Buttons aktualisieren
    updateLanguageButtons();
    
    // Trailer neu laden
    updateAvailableTrailers();
    loadCurrentTrailer();
}

/**
 * Sprach-Buttons aktualisieren
 */
function updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === app.currentLanguage);
    });
}

/**
 * Zum Scanner zurück
 */
async function backToScanner() {
    // Video stoppen
    const video = document.getElementById('trailerVideo');
    if (video) {
        video.pause();
        video.src = '';
    }
    
    // App State zurücksetzen
    app.currentFilm = null;
    app.availableTrailers = [];
    app.currentTrailerIndex = 1;
    app.currentLanguage = 'de';
    
    // Video ausblenden
    document.getElementById('videoSection').style.display = 'none';
    
    // Scanner neu starten
    await startScanner();
}

/**
 * UI Helper Functions
 */
function showScanner() {
    document.getElementById('scannerSection').style.display = 'flex';
    document.getElementById('videoSection').style.display = 'none';
    document.getElementById('scanResult').textContent = '';
}

function showScannerError(msg) {
    const result = document.getElementById('scanResult');
    if (result) {
        result.textContent = '❌ ' + msg;
        result.style.color = 'var(--color-danger)';
    }
    
    // Nach 2 Sekunden Scanner neu starten
    setTimeout(() => startScanner(), 2000);
}

function showError(msg) {
    const overlay = document.getElementById('errorOverlay');
    const message = document.getElementById('errorMessage');
    
    if (overlay) overlay.style.display = 'flex';
    if (message) message.textContent = msg;
}

/**
 * Event Listener Setup
 */
function setupEvents() {
    // Sprache wechseln
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchLanguage(btn.dataset.lang);
        });
    });
    
    // Trailer Navigation
    const prevBtn = document.getElementById('prevTrailerBtn');
    const nextBtn = document.getElementById('nextTrailerBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', prevTrailer);
    if (nextBtn) nextBtn.addEventListener('click', nextTrailer);
    
    // Neu scannen
    const scanAgainBtn = document.getElementById('scanAgainBtn');
    if (scanAgainBtn) {
        scanAgainBtn.addEventListener('click', async () => {
            await backToScanner();
        });
    }
    
    // Kamera wechseln
    const toggleCameraBtn = document.getElementById('toggleCameraBtn');
    if (toggleCameraBtn) {
        toggleCameraBtn.addEventListener('click', async () => {
            if (!app.scanner) return;
            
            try {
                // Aktuelle Kamera ermitteln
                const cameras = await QrScanner.listCameras(true);
                if (cameras.length <= 1) return;
                
                // Zur anderen Kamera wechseln
                const currentCamera = await app.scanner.getCamera();
                const otherCamera = cameras.find(cam => cam.id !== currentCamera);
                
                if (otherCamera) {
                    await app.scanner.setCamera(otherCamera.id);
                    console.log('📱 Kamera gewechselt');
                }
            } catch (error) {
                console.error('Kamerawechsel fehlgeschlagen:', error);
            }
        });
    }
    
    // Flash ein/aus
    const toggleFlashBtn = document.getElementById('toggleFlashBtn');
    if (toggleFlashBtn) {
        toggleFlashBtn.addEventListener('click', () => {
            if (!app.scanner) return;
            
            app.scanner.toggleFlash();
            const icon = toggleFlashBtn.querySelector('i');
            if (icon) {
                icon.style.color = icon.style.color === 'var(--color-warning)' 
                    ? '' 
                    : 'var(--color-warning)';
            }
        });
    }
    
    // Retry Button
    const retryButton = document.getElementById('retryButton');
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            document.getElementById('errorOverlay').style.display = 'none';
            startScanner();
        });
    }
    
    // Video Events
    const video = document.getElementById('trailerVideo');
    if (video) {
        // Auto-Weiter nach Ende
        video.addEventListener('ended', () => {
            setTimeout(nextTrailer, 1000);
        });
        
        // Click zum Abspielen
        video.addEventListener('click', () => {
            if (video.paused) {
                video.play().catch(e => console.log('Play fehlgeschlagen'));
            }
        });
    }
}