// app.js – Synchronisierte Trailer-Steuerung (TV / kein TV) mit Firebase
let db = null;
let currentRoomRef = null;
let currentRoomId = null;
let isOnlineMode = false;
let isTVMode = false;
let isRoomCreator = false;
let myPlayerId = null;
let localSimpleMode = true; 
let currentCameraMode = 'environment'; // 'environment' oder 'user'
let localCameraMode = 'environment';

let app = {
    films: [],
    funFactsMap: new Map(),
    currentFilm: null,
    scanner: null,
    currentLanguage: 'de',
    currentTrailerIndex: 1,
    availableTrailers: [],
    isInitialized: false
};

let players = [];
let currentPlayerIndex = 0;
let gameMode = 'normal';
let targetType = 'points';
let targetScore = 30;
let guessTarget = 5;
let currentTipUsage = 0;
let roundBasePoints = 0;
let titleBonusUsed = false;
let directorBonusUsed = false;
let tempTitleBonus = 0;
let tempDirectorBonus = 0;
let wasGuessed = false;
let endAfterCurrentRound = false;
let endRoundPlayerIndex = null;
let tipUsage = 0;
let currentTvTrailerIndex = 1;
let hasTVInRoom = false;
let currentTVLanguage = 'de';

let elements = {};

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function initDomReferences() {
    elements.guessModal = document.getElementById('guessModal');
    elements.roundModal = document.getElementById('roundSummaryModal');
    elements.tipOverlay = document.getElementById('tipOverlay');
    elements.tipOverlayText = document.getElementById('tipOverlayText');
    elements.closeTipOverlay = document.getElementById('closeTipOverlay');
    elements.tipOverlayCloseBtn = document.getElementById('tipOverlayCloseBtn');
    elements.loadingOverlay = document.getElementById('loadingOverlay');
    elements.errorOverlay = document.getElementById('errorOverlay');
    elements.errorMessage = document.getElementById('errorMessage');
    elements.retryButton = document.getElementById('retryButton');
    elements.guessFilmTitleSpan = document.getElementById('guessFilmTitle');
    elements.currentPlayerNameSpan = document.getElementById('currentPlayerName');
    elements.guessYesBtn = document.getElementById('guessYesBtn');
    elements.guessNoBtn = document.getElementById('guessNoBtn');
    elements.basePointsSpan = document.getElementById('basePoints');
    elements.titlePointsSpan = document.getElementById('titlePoints');
    elements.directorPointsSpan = document.getElementById('directorPoints');
    elements.tipCountSpan = document.getElementById('tipCount');
    elements.tipPenaltySpan = document.getElementById('tipPenalty');
    elements.roundTotalSpan = document.getElementById('roundTotal');
    elements.addTitlePointsBtn = document.getElementById('addTitlePointsBtn');
    elements.addDirectorPointsBtn = document.getElementById('addDirectorPointsBtn');
    elements.confirmRoundBtn = document.getElementById('confirmRoundBtn');
    elements.modeSelectionSection = document.getElementById('modeSelectionSection');
    elements.modeRadios = document.querySelectorAll('input[name="gameModeSelect"]');
    elements.confirmModeBtn = document.getElementById('confirmModeBtn');
    elements.roomSetupSection = document.getElementById('roomSetupSection');
    elements.createRoomBtn = document.getElementById('createRoomBtn');
    elements.joinRoomCode = document.getElementById('joinRoomCode');
    elements.joinRoomBtn = document.getElementById('joinRoomBtn');
    elements.backToModeFromRoomBtn = document.getElementById('backToModeFromRoomBtn');
    elements.waitingSection = document.getElementById('waitingSection');
    elements.onlinePlayerListUl = document.getElementById('onlinePlayerListUl');
    elements.tvModeCheckbox = document.getElementById('tvModeCheckbox');
    elements.waitingMessage = document.getElementById('waitingMessage');
    elements.leaveRoomBtn = document.getElementById('leaveRoomBtn');
    elements.waitingRoomCodeSpan = document.getElementById('waitingRoomCodeSpan');
    elements.startGameFromWaitingBtn = document.getElementById('startGameFromWaitingBtn');
    elements.hostTargetSettings = document.getElementById('hostTargetSettings');
    elements.waitingTargetTypeRadios = document.querySelectorAll('input[name="waitingTargetType"]');
    elements.waitingTargetScore = document.getElementById('waitingTargetScore');
    elements.waitingGuessTarget = document.getElementById('waitingGuessTarget');
    elements.waitingPointsTargetGroup = document.getElementById('waitingPointsTargetGroup');
    elements.waitingGuessesTargetGroup = document.getElementById('waitingGuessesTargetGroup');
    elements.applyTargetSettingsBtn = document.getElementById('applyTargetSettingsBtn');
    elements.activePlayerSection = document.getElementById('activePlayerSection');
    elements.activePlayerName = document.getElementById('activePlayerName');
    elements.activePlayerScore = document.getElementById('activePlayerScore');
    elements.scannerVideoContainer = document.getElementById('scannerVideoContainer');
    elements.scanFeedback = document.getElementById('scanFeedback');
    elements.toggleCameraBtn = document.getElementById('toggleCameraBtn');
    elements.toggleFlashBtn = document.getElementById('toggleFlashBtn');
    elements.retryCameraBtn = document.getElementById('retryCameraBtn');
    elements.endGameOnlineBtn = document.getElementById('endGameOnlineBtn');
    elements.leaveActiveRoomBtn = document.getElementById('leaveActiveRoomBtn');
    elements.nextTrailerOnTvBtn = document.getElementById('nextTrailerOnTvBtn');
    elements.spectatorSection = document.getElementById('spectatorSection');
    elements.spectatorCurrentPlayer = document.getElementById('spectatorCurrentPlayer');
    elements.spectatorContent = document.getElementById('spectatorContent');
    elements.leaveSpectatorRoomBtn = document.getElementById('leaveSpectatorRoomBtn');
    elements.spectatorScoreList = document.getElementById('spectatorScoreList');
    elements.spectatorTrailerArea = document.getElementById('spectatorTrailerArea');
    elements.spectatorTrailerVideo = document.getElementById('spectatorTrailerVideo');
    elements.spectatorFunFactDisplay = document.getElementById('spectatorFunFactDisplay');
    elements.tvStatusIndicator = document.getElementById('tvStatusIndicator');
    elements.localPlayerSetupSection = document.getElementById('localPlayerSetupSection');
    elements.localPlayerList = document.getElementById('localPlayerList');
    elements.localNewPlayerName = document.getElementById('localNewPlayerName');
    elements.localAddPlayerBtn = document.getElementById('localAddPlayerBtn');
    elements.localStartGameBtn = document.getElementById('localStartGameBtn');
    elements.backToModeFromLocalBtn = document.getElementById('backToModeFromLocalBtn');
    elements.localScannerSection = document.getElementById('localScannerSection');
    elements.localScannerPlayerName = document.getElementById('localScannerPlayerName');
    elements.localScannerPlayerScore = document.getElementById('localScannerPlayerScore');
    elements.localScannerVideoContainer = document.getElementById('localScannerVideoContainer');
    elements.localScanFeedback = document.getElementById('localScanFeedback');
    elements.localToggleCameraBtn = document.getElementById('localToggleCameraBtn');
    elements.localToggleFlashBtn = document.getElementById('localToggleFlashBtn');
    elements.localRetryCameraBtn = document.getElementById('localRetryCameraBtn');
    elements.localScoreboard = document.getElementById('localScoreboard');
    elements.localEndGameBtn = document.getElementById('localEndGameBtn');
    elements.backToLocalSetupBtn = document.getElementById('backToLocalSetupBtn');
    elements.localFilmSection = document.getElementById('localFilmSection');
    elements.localFilmTitle = document.getElementById('localFilmTitle');
    elements.localFilmYear = document.getElementById('localFilmYear');
    elements.localFilmDirector = document.getElementById('localFilmDirector');
    elements.localFilmPlayerInfo = document.getElementById('localFilmPlayerInfo');
    elements.localFilmCurrentPlayer = document.getElementById('localFilmCurrentPlayer');
    elements.localFilmCurrentScore = document.getElementById('localFilmCurrentScore');
    elements.localAskGuessBtn = document.getElementById('localAskGuessBtn');
    elements.localNextFilmBtn = document.getElementById('localNextFilmBtn');
    elements.localLangBtns = document.querySelectorAll('.local-lang');
    elements.localPrevTrailerBtn = document.getElementById('localPrevTrailerBtn');
    elements.localNextTrailerBtn = document.getElementById('localNextTrailerBtn');
    elements.localTrailerCounter = document.getElementById('localTrailerCounter');
    elements.localTrailerVideo = document.getElementById('localTrailerVideo');
    elements.localNextTipBtn = document.getElementById('localNextTipBtn');
    elements.localTipDisplay = document.getElementById('localTipDisplay');
    elements.tvFullscreenOverlay = document.getElementById('tvFullscreenOverlay');
    elements.tvFullscreenVideo = document.getElementById('tvFullscreenVideo');
    elements.closeTvOverlay = document.getElementById('closeTvOverlay');
}

function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => m==='&'?'&amp;':(m==='<'?'&lt;':'&gt;')); }
function showLoading(show) { if(elements.loadingOverlay) elements.loadingOverlay.style.display = show ? 'flex' : 'none'; }
function showError(msg) { elements.errorMessage.innerText = msg; elements.errorOverlay.classList.remove('hidden'); }
function hideError() { elements.errorOverlay.classList.add('hidden'); }

async function loadFilms() {
    const response = await fetch('Filmster-Filme-V5.csv');
    if (!response.ok) throw new Error('Film-CSV nicht gefunden');
    const text = await response.text();
    app.films = parseCSV(text);
    console.log(`${app.films.length} Filme geladen`);
}
async function loadFunFacts() {
    try {
        const response = await fetch('Filmster-FunFacts-V5.csv');
        if (!response.ok) throw new Error('FunFacts CSV nicht gefunden');
        const text = await response.text();
        const lines = text.trim().split('\n');
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            let firstSemi = -1, secondSemi = -1, inQuotes = false;
            for (let j = 0; j < line.length; j++) {
                const ch = line[j];
                if (ch === '"') inQuotes = !inQuotes;
                if (ch === ';' && !inQuotes) {
                    if (firstSemi === -1) firstSemi = j;
                    else if (secondSemi === -1) { secondSemi = j; break; }
                }
            }
            if (firstSemi === -1 || secondSemi === -1) continue;
            const nr = line.substring(0, firstSemi).trim();
            let hinweiseRaw = line.substring(firstSemi + 1, secondSemi).trim();
            let funFactsRaw = line.substring(secondSemi + 1).trim();
            if (hinweiseRaw.startsWith('"') && hinweiseRaw.endsWith('"')) hinweiseRaw = hinweiseRaw.slice(1, -1);
            if (funFactsRaw.startsWith('"') && funFactsRaw.endsWith('"')) funFactsRaw = funFactsRaw.slice(1, -1);
            hinweiseRaw = hinweiseRaw.replace(/""/g, '"');
            funFactsRaw = funFactsRaw.replace(/""/g, '"');
            let hinweise = [], funFacts = [];
            try { hinweise = JSON.parse(hinweiseRaw); if (!Array.isArray(hinweise)) hinweise = []; } catch(e) {
                const match = hinweiseRaw.match(/\[(.*)\]/s);
                if (match) hinweise = match[1].split(/","/).map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
            }
            try { funFacts = JSON.parse(funFactsRaw); if (!Array.isArray(funFacts)) funFacts = []; } catch(e) {
                const match = funFactsRaw.match(/\[(.*)\]/s);
                if (match) funFacts = match[1].split(/","/).map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
            }
            app.funFactsMap.set(nr, { hinweise, funFacts });
        }
        console.log(`FunFacts geladen (${app.funFactsMap.size} Einträge)`);
    } catch(err) { console.warn('FunFacts nicht verfügbar:', err); }
}
function parseCSV(text) {
    const rows = text.trim().split('\n');
    const headers = rows[0].split(';').map(h => h.trim());
    return rows.slice(1).map(row => {
        const values = row.split(';').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || '');
        return obj;
    });
}

function initFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        db = firebase.database();
        console.log('✅ Firebase initialisiert');
        return true;
    } catch (err) {
        console.error('Firebase Init Fehler:', err);
        showError('Firebase konnte nicht initialisiert werden.');
        return false;
    }
}

function generateRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createRoom() {
    if (!db) { showError('Firebase nicht verbunden.'); return; }
    showLoading(true);
    try {
        const roomCode = generateRoomCode();
        const roomRef = db.ref(`rooms/${roomCode}`);
        await roomRef.set({
            gameState: 'waiting',
            currentPlayerIndex: 0,
            currentFilmId: null,
            players: {},
            targetType: 'points',
            targetScore: 30,
            guessTarget: 5,
            createdAt: Date.now(),
            tvTrailerIndex: 1,
            tvLanguage: 'de',
            tvModeActive: false,
            hasTV: false
        });
        currentRoomId = roomCode;
        currentRoomRef = roomRef;
        isRoomCreator = true;
        if (elements.waitingRoomCodeSpan) elements.waitingRoomCodeSpan.innerText = roomCode;
        if (elements.startGameFromWaitingBtn) elements.startGameFromWaitingBtn.disabled = false;
        if (elements.hostTargetSettings) elements.hostTargetSettings.style.display = 'block';
        const playerName = prompt('Dein Name:') || 'Spieler';
        myPlayerId = `player_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        await roomRef.child(`players/${myPlayerId}`).set({
            id: myPlayerId,
            name: playerName,
            totalScore: 0,
            correctGuesses: 0,
            joinedAt: Date.now()
        });
        joinRoomListeners(roomRef);
        showWaitingScreen();
    } catch (err) {
        console.error('Fehler beim Erstellen des Raums:', err);
        showError('Raum konnte nicht erstellt werden: ' + err.message);
    } finally {
        showLoading(false);
    }
}

async function joinRoom(roomCode) {
    if (!db) { showError('Firebase nicht verbunden.'); return; }
    showLoading(true);
    try {
        const roomRef = db.ref(`rooms/${roomCode}`);
        const snapshot = await roomRef.get();
        if (!snapshot.exists()) { alert('Raum nicht gefunden'); return; }
        currentRoomId = roomCode;
        currentRoomRef = roomRef;
        isRoomCreator = false;
        if (elements.waitingRoomCodeSpan) elements.waitingRoomCodeSpan.innerText = roomCode;
        if (elements.startGameFromWaitingBtn) elements.startGameFromWaitingBtn.disabled = true;
        if (elements.hostTargetSettings) elements.hostTargetSettings.style.display = 'none';
        const isTV = localStorage.getItem('tvMode') === 'true';
        if (!isTV) {
            const playerName = prompt('Dein Name:') || 'Spieler';
            myPlayerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
            await roomRef.child(`players/${myPlayerId}`).set({
                id: myPlayerId,
                name: playerName,
                totalScore: 0,
                correctGuesses: 0,
                joinedAt: Date.now()
            });
        } else {
            myPlayerId = null;
            isTVMode = true;
            showTVScreen();
        }
        joinRoomListeners(roomRef);
        showWaitingScreen();
    } catch (err) {
        console.error(err);
        showError('Beitreten fehlgeschlagen.');
    } finally {
        showLoading(false);
    }
}

async function startScannerWithMode(mode) {
    elements.scannerVideoContainer.innerHTML = '';
    activeScanner = new Html5Qrcode("scannerVideoContainer");
    const config = {
        fps: 15,
        qrbox: function(viewfinderWidth, viewfinderHeight) {
            let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            let size = Math.floor(minEdge * 0.8);
            size = Math.min(500, Math.max(150, size));
            return { width: size, height: size };
        },
        aspectRatio: 1.0,
        disableFlip: false,
        rememberLastUsedCamera: true,
        supportedScanTypes: [0]
    };
    await activeScanner.start({ facingMode: mode }, config,
        (decodedText) => handleOnlineScan(decodedText),
        (err) => { if (!err.includes("NotFoundException")) console.warn(err); }
    );
}

async function startLocalScannerWithMode(mode) {
    elements.localScannerVideoContainer.innerHTML = '';
    localScanner = new Html5Qrcode("localScannerVideoContainer");
    const config = {
        fps: 15,
        qrbox: function(viewfinderWidth, viewfinderHeight) {
            let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            let size = Math.floor(minEdge * 0.8);
            size = Math.min(500, Math.max(150, size));
            return { width: size, height: size };
        },
        aspectRatio: 1.0,
        disableFlip: false,
        rememberLastUsedCamera: true,
        supportedScanTypes: [0]
    };
    await localScanner.start({ facingMode: mode }, config,
        (decodedText) => handleLocalScan(decodedText),
        (err) => { if (!err.includes("NotFoundException")) console.warn(err); }
    );
}

async function switchCamera() {
    if (!activeScanner) return;
    currentCameraMode = currentCameraMode === 'environment' ? 'user' : 'environment';
    await stopActiveScanner();
    elements.scanFeedback.innerText = '⏳ Kamera wird gewechselt...';
    try {
        await startScannerWithMode(currentCameraMode);
        elements.scanFeedback.innerText = '✅ Kamera gewechselt.';
    } catch (err) {
        elements.scanFeedback.innerText = '❌ Kamerawechsel fehlgeschlagen.';
        console.error(err);
    }
}

async function switchLocalCamera() {
    if (!localScanner) return;
    localCameraMode = localCameraMode === 'environment' ? 'user' : 'environment';
    await stopLocalScanner();
    elements.localScanFeedback.innerText = '⏳ Kamera wird gewechselt...';
    try {
        await startLocalScannerWithMode(localCameraMode);
        elements.localScanFeedback.innerText = '✅ Kamera gewechselt.';
    } catch (err) {
        elements.localScanFeedback.innerText = '❌ Kamerawechsel fehlgeschlagen.';
        console.error(err);
    }
}

// --------------------------------------------------------------
// NEU: Zentrale Synchronisation des Trailers basierend auf DB-Werten
// --------------------------------------------------------------
function getTrailerUrlFromFilm(film, language, index) {
    if (!film) return null;
    const key = `App-Link_Video-${index}_${language.toUpperCase()}`;
    return film[key] && film[key].trim() ? film[key] : null;
}

const lastLoadedUrlMap = new WeakMap();

function updateVideoElement(videoEl, url, muted, autoplay = true) {
    if (!videoEl) return;
    
    const lastUrl = lastLoadedUrlMap.get(videoEl);
    if (lastUrl === url && videoEl.src === url) {
        // Gleiche URL – nur ggf. mute anpassen und weiter abspielen
        if (videoEl.muted !== muted) videoEl.muted = muted;
        if (autoplay && videoEl.paused && url) {
            videoEl.play().catch(e => console.log('play after mute change failed', e));
        }
        return;
    }
    
    lastLoadedUrlMap.set(videoEl, url);
    const wasPlaying = !videoEl.paused;
    videoEl.muted = muted;
    
    if (url && videoEl.src !== url) {
        videoEl.pause();
        videoEl.src = url;
        videoEl.load();
        if (autoplay) {
            videoEl.play().catch(e => console.log('Autoplay blockiert', e));
        }
    } else if (!url) {
        videoEl.pause();
        videoEl.src = '';
        videoEl.load();
    } else if (wasPlaying && !videoEl.paused) {
        // keep playing
    } else if (autoplay && videoEl.paused && url) {
        videoEl.play().catch(e => console.log('Autoplay nach URL-Update blockiert', e));
    }
}

async function syncTrailerFromDB(data) {
    if (!data) return;
    const filmId = data.currentFilmId;
    const language = data.tvLanguage || 'de';
    const trailerIndex = data.tvTrailerIndex || 1;
    const tvModeActive = data.tvModeActive === true;

    let film = null;
    if (filmId) film = app.films.find(f => f.Nr === filmId);

    // 1. TV-Gerät
    if (isTVMode && elements.tvFullscreenVideo) {
        const url = film ? getTrailerUrlFromFilm(film, language, trailerIndex) : null;
        updateVideoElement(elements.tvFullscreenVideo, url, false, true);
        return;
    }

    // 2. Normale Geräte
    const isActivePlayerOnline = (gameMode === 'tournament' && players.length && myPlayerId === players[currentPlayerIndex]?.id);
    const isSpectator = gameMode === 'tournament' && !isActivePlayerOnline;

    // Aktives Film-Modal suchen
    const activeFilmModal = document.querySelector('.modal:not(#guessModal):not(#roundSummaryModal)');
    const modalVideo = activeFilmModal ? activeFilmModal.querySelector('.trailer-player') : null;
    const trailerCountSpan = activeFilmModal ? activeFilmModal.querySelector('.trailer-count') : null;

    // Anzahl verfügbarer Trailer für aktuelle Sprache berechnen (für Counter)
    let availableCount = 0;
    let currentPos = 0;
    if (film) {
        const available = [];
        for (let i = 1; i <= 3; i++) {
            const key = `App-Link_Video-${i}_${language.toUpperCase()}`;
            if (film[key] && film[key].trim()) available.push(i);
        }
        availableCount = available.length;
        currentPos = available.indexOf(trailerIndex) + 1;
        if (currentPos === 0 && availableCount > 0) currentPos = 1;
    }
    
    // Trailer-Counter aktualisieren (immer, auch im TV-Modus)
    if (trailerCountSpan) {
        if (availableCount > 0 && currentPos > 0) {
            trailerCountSpan.innerText = `Trailer ${currentPos}/${availableCount}`;
        } else {
            trailerCountSpan.innerText = 'Kein Trailer';
        }
    }

    // --- Video-Logik nach Rollen und TV-Modus ---
    if (isActivePlayerOnline && !tvModeActive && modalVideo) {
        // Aktiver Spieler, KEIN TV aktiv → Video mit Ton
        const url = film ? getTrailerUrlFromFilm(film, language, trailerIndex) : null;
        updateVideoElement(modalVideo, url, false, true);
        if (elements.spectatorTrailerArea) elements.spectatorTrailerArea.style.display = 'none';
    } 
    else if (isActivePlayerOnline && tvModeActive) {
        // AKTIVER SPIELER IM TV-MODUS: Video ausblenden/leeren, damit keine endlosen Updates
        if (modalVideo) updateVideoElement(modalVideo, null, true, false);
        // Zuschauer-Trailer ausblenden
        if (elements.spectatorTrailerArea) elements.spectatorTrailerArea.style.display = 'none';
    }
    else if (isSpectator && !tvModeActive && elements.spectatorTrailerVideo) {
        // Zuschauer, kein TV aktiv → stummgeschaltetes Video
        const url = film ? getTrailerUrlFromFilm(film, language, trailerIndex) : null;
        updateVideoElement(elements.spectatorTrailerVideo, url, true, true);
        if (elements.spectatorTrailerArea) elements.spectatorTrailerArea.style.display = film ? 'block' : 'none';
    }
    else {
        // Alle anderen Fälle (z.B. wenn kein Film oder Zuschauer bei TV aktiv)
        if (modalVideo) updateVideoElement(modalVideo, null, true, false);
        if (elements.spectatorTrailerVideo) updateVideoElement(elements.spectatorTrailerVideo, null, true, false);
        if (elements.spectatorTrailerArea) elements.spectatorTrailerArea.style.display = 'none';
    }

    // Fun Fact für Zuschauer (nur wenn kein TV aktiv)
    if (isSpectator && !tvModeActive && filmId && elements.spectatorFunFactDisplay) {
        const funFactsObj = app.funFactsMap.get(filmId);
        const funFact = funFactsObj?.funFacts?.[0] || 'Keine Fun Facts verfügbar.';
        elements.spectatorFunFactDisplay.innerHTML = `<i class="fas fa-info-circle"></i> ${escapeHtml(funFact)}`;
    }
}

const debouncedSync = debounce(syncTrailerFromDB, 100);

// --------------------------------------------------------------

function joinRoomListeners(roomRef) {
    roomRef.child('players').on('value', (snapshot) => {
        const playersObj = snapshot.val() || {};
        players = Object.values(playersObj).sort((a, b) => a.joinedAt - b.joinedAt);
        updateOnlinePlayerList(players);
        updateSpectatorScoreboard(players);
        if (gameMode === 'tournament' && currentPlayerIndex !== undefined) {
            updateRoleBasedUI();
            syncTrailerFromDB({ currentFilmId: null }); // ggf. Video zurücksetzen
        }
    });

    roomRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        // Globale Zustände übernehmen
        if (data.gameState === 'active' && gameMode !== 'tournament') {
            startOnlineGameFromData(data);
        }
        if (data.currentPlayerIndex !== undefined) currentPlayerIndex = data.currentPlayerIndex;
        if (data.targetType) targetType = data.targetType;
        if (data.targetScore) targetScore = data.targetScore;
        if (data.guessTarget) guessTarget = data.guessTarget;
        if (data.gameState === 'active' && gameMode === 'tournament') {
            updateRoleBasedUI();
        }
        
        // Trailer-Synchronisation
        debouncedSync(data);
        if (data.gameState === 'finished') endOnlineGame(data);
    });

    roomRef.child('tvModeActive').on('value', async (snap) => {
        const tvActive = snap.val();
        if (tvActive && !isTVMode) {
            // Zuschauer: Video ausblenden
            if (elements.spectatorTrailerArea) elements.spectatorTrailerArea.style.display = 'none';
        } else if (!tvActive && !isTVMode && gameMode === 'tournament') {
            // TV wurde deaktiviert – Zuschauer sollen wieder Video sehen
            const currentData = (await roomRef.once('value')).val();
            const filmId = currentData?.currentFilmId;
            const tvLanguage = currentData?.tvLanguage || 'de';
            const tvTrailerIndex = currentData?.tvTrailerIndex || 1;
            if (filmId) {
                syncTrailerFromDB({
                    currentFilmId: filmId,
                    tvLanguage: tvLanguage,
                    tvTrailerIndex: tvTrailerIndex,
                    tvModeActive: false
                });
            }
        }
    });
}

function updateOnlinePlayerList(playersArray) {
    if (!elements.onlinePlayerListUl) return;
    elements.onlinePlayerListUl.innerHTML = '';
    playersArray.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${escapeHtml(p.name)} (${p.totalScore || 0} Pkt.)</span>`;
        elements.onlinePlayerListUl.appendChild(li);
    });
}

function updateSpectatorScoreboard(playersArray) {
    if (!elements.spectatorScoreList) return;
    elements.spectatorScoreList.innerHTML = '';
    playersArray.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${escapeHtml(p.name)}</strong>: ${p.totalScore || 0} Pkt. (${p.correctGuesses || 0} erraten)`;
        elements.spectatorScoreList.appendChild(li);
    });
}

async function showWaitingScreen() {
    await stopActiveScanner();
    elements.roomSetupSection.classList.add('hidden');
    elements.waitingSection.classList.remove('hidden');
    isOnlineMode = true;
    gameMode = 'waiting';
}

function startOnlineGameFromData(data) {
    gameMode = 'tournament';
    currentPlayerIndex = data.currentPlayerIndex;
    targetType = data.targetType;
    targetScore = data.targetScore;
    guessTarget = data.guessTarget;
    updateRoleBasedUI();
}

async function startOnlineGame() {
    if (!isRoomCreator) { alert('Nur der Host kann starten.'); return; }
    if (!currentRoomRef) { alert('Kein Raum.'); return; }
    try {
        const targetTypeElem = document.querySelector('input[name="waitingTargetType"]:checked');
        const targetTypeVal = targetTypeElem ? targetTypeElem.value : 'points';
        const targetScoreVal = parseInt(elements.waitingTargetScore?.value) || 30;
        const guessTargetVal = parseInt(elements.waitingGuessTarget?.value) || 5;
        await currentRoomRef.update({
            gameState: 'active',
            currentPlayerIndex: 0,
            targetType: targetTypeVal,
            targetScore: targetScoreVal,
            guessTarget: guessTargetVal
        });
    } catch (err) {
        console.error(err);
        alert('Fehler beim Starten: ' + err.message);
    }
}
window.startOnlineGameExternal = startOnlineGame;

function updateRoleBasedUI() {
    if (!players.length) return;
    const currentPlayerId = players[currentPlayerIndex]?.id;
    if (currentPlayerId === myPlayerId) {
        showActivePlayerScreen();
    } else {
        showSpectatorScreen();
    }
    if (elements.endGameOnlineBtn) {
        elements.endGameOnlineBtn.style.display = isRoomCreator ? 'inline-flex' : 'none';
    }
}

function showActivePlayerScreen() {
    elements.waitingSection.classList.add('hidden');
    elements.spectatorSection.classList.add('hidden');
    elements.activePlayerSection.classList.remove('hidden');
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer) {
        elements.activePlayerName.innerText = currentPlayer.name;
        elements.activePlayerScore.innerText = currentPlayer.totalScore;
    }
    // Zuschauer-Trailer stoppen
    if (elements.spectatorTrailerVideo) {
        elements.spectatorTrailerVideo.pause();
        elements.spectatorTrailerVideo.src = '';
        elements.spectatorTrailerArea.style.display = 'none';
    }
    if (elements.endGameOnlineBtn) {
        elements.endGameOnlineBtn.style.display = isRoomCreator ? 'inline-flex' : 'none';
    }
    startActiveScanner();
}

async function showSpectatorScreen() {
    await stopActiveScanner();
    elements.waitingSection.classList.add('hidden');
    elements.activePlayerSection.classList.add('hidden');
    elements.spectatorSection.classList.remove('hidden');
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer) elements.spectatorCurrentPlayer.innerText = currentPlayer.name;
    elements.spectatorContent.innerHTML = '<p class="text-muted">🔍 Der aktive Spieler rätselt gerade...</p>';
    // Sichtbarkeit des Trailer-Bereichs wird durch syncTrailerFromDB gesteuert
}

function endOnlineGame(data) {
    const playersArray = data.players ? Object.values(data.players) : [];
    let maxScore = -1, winners = [];
    playersArray.forEach(p => {
        if (p.totalScore > maxScore) { maxScore = p.totalScore; winners = [p.name]; }
        else if (p.totalScore === maxScore) winners.push(p.name);
    });
    alert(`🏆 Spiel beendet! Sieger: ${winners.join(', ')} mit ${maxScore} Punkten.`);
    if (currentRoomRef) currentRoomRef.remove();
    resetToModeSelection();
}

function resetToModeSelection() {
    if (currentRoomRef) currentRoomRef.off();
    if (elements.waitingRoomCodeSpan) elements.waitingRoomCodeSpan.innerText = '----';
    stopActiveScanner();
    isOnlineMode = false;
    currentRoomId = null;
    currentRoomRef = null;
    isRoomCreator = false;
    myPlayerId = null;
    gameMode = 'normal';
    elements.modeSelectionSection.classList.remove('hidden');
    elements.roomSetupSection.classList.add('hidden');
    elements.waitingSection.classList.add('hidden');
    elements.activePlayerSection.classList.add('hidden');
    elements.spectatorSection.classList.add('hidden');
    elements.localPlayerSetupSection.classList.add('hidden');
    elements.localScannerSection.classList.add('hidden');
    elements.localFilmSection.classList.add('hidden');
}

async function leaveRoom() {
    await stopActiveScanner();
    if (currentRoomRef && myPlayerId) {
        await currentRoomRef.child(`players/${myPlayerId}`).remove();
        if (isRoomCreator) await currentRoomRef.remove();
    }
    if (isTVMode && currentRoomRef) {
        await currentRoomRef.update({ hasTV: false, tvModeActive: false });
    }
    resetToModeSelection();
}

async function setTVMode(enabled) {
    if (!enabled) {
        await stopActiveScanner();
        location.reload();
    }
    if (elements.tvFullscreenOverlay) {
        elements.tvFullscreenOverlay.classList.remove('hidden');
    }
    isTVMode = enabled;
    if (enabled && currentRoomRef) {
        if (myPlayerId) {
            await currentRoomRef.child(`players/${myPlayerId}`).remove();
            myPlayerId = null;
        }
        await currentRoomRef.update({ tvModeActive: true, hasTV: true });
        showTVScreen();
        // Autoplay-Button für TV hinzufügen (falls noch nicht vorhanden)
        if (elements.tvFullscreenOverlay && !document.getElementById('tvStartButton')) {
            const startBtn = document.createElement('button');
            startBtn.id = 'tvStartButton';
            startBtn.className = 'primary-btn tv-start-btn';
            startBtn.innerHTML = '<i class="fas fa-play"></i> Abspielen starten';
            startBtn.style.position = 'absolute';
            startBtn.style.bottom = '30px';
            startBtn.style.left = '50%';
            startBtn.style.transform = 'translateX(-50%)';
            startBtn.style.zIndex = '10002';
            startBtn.onclick = () => {
                if (elements.tvFullscreenVideo) {
                    elements.tvFullscreenVideo.muted = false;
                    elements.tvFullscreenVideo.play().catch(e => console.log('Play fehlgeschlagen', e));
                }
                startBtn.remove();
            };
            elements.tvFullscreenOverlay.appendChild(startBtn);
        }
    } else if (!enabled && currentRoomRef) {
        await currentRoomRef.update({ tvModeActive: false, hasTV: false });
        isTVMode = false;
        location.reload();
    }
}

function showTVScreen() {
    elements.waitingSection.classList.add('hidden');
    elements.activePlayerSection.classList.add('hidden');
    elements.spectatorSection.classList.add('hidden');
    elements.modeSelectionSection.classList.add('hidden');
    elements.roomSetupSection.classList.add('hidden');
    elements.localPlayerSetupSection.classList.add('hidden');
    if (elements.tvFullscreenOverlay) {
        elements.tvFullscreenOverlay.classList.remove('hidden');
    }
}

// --------------------------------------------------------------
// NEUE DB-Steuerung für Trailer-Wechsel und Sprache
// --------------------------------------------------------------
async function nextTrailer() {
    console.log('nextTrailer called, isActivePlayer:', myPlayerId === players[currentPlayerIndex]?.id);
    if (!currentRoomRef || gameMode !== 'tournament') return;
    const isActivePlayer = (myPlayerId === players[currentPlayerIndex]?.id);
    if (!isActivePlayer) {
        alert('Nur der aktive Spieler kann den Trailer wechseln.');
        return;
    }
    const filmId = (await currentRoomRef.child('currentFilmId').once('value')).val();
    if (!filmId) return;
    const film = app.films.find(f => f.Nr === filmId);
    if (!film) return;
    const lang = (await currentRoomRef.child('tvLanguage').once('value')).val() || 'de';
    // Verfügbare Trailer für diesen Film in dieser Sprache ermitteln
    let available = [];
    for (let i = 1; i <= 3; i++) {
        const key = `App-Link_Video-${i}_${lang.toUpperCase()}`;
        if (film[key] && film[key].trim()) available.push(i);
    }
    if (available.length === 0) return;
    let current = (await currentRoomRef.child('tvTrailerIndex').once('value')).val() || 1;
    let pos = available.indexOf(current);
    let next = available[(pos + 1) % available.length];
    await currentRoomRef.update({ tvTrailerIndex: next });
}

async function prevTrailer() {
    if (!currentRoomRef || gameMode !== 'tournament') return;
    const isActivePlayer = (myPlayerId === players[currentPlayerIndex]?.id);
    if (!isActivePlayer) {
        alert('Nur der aktive Spieler kann den Trailer wechseln.');
        return;
    }
    const filmId = (await currentRoomRef.child('currentFilmId').once('value')).val();
    if (!filmId) return;
    const film = app.films.find(f => f.Nr === filmId);
    if (!film) return;
    const lang = (await currentRoomRef.child('tvLanguage').once('value')).val() || 'de';
    let available = [];
    for (let i = 1; i <= 3; i++) {
        const key = `App-Link_Video-${i}_${lang.toUpperCase()}`;
        if (film[key] && film[key].trim()) available.push(i);
    }
    if (available.length === 0) return;
    let current = (await currentRoomRef.child('tvTrailerIndex').once('value')).val() || 1;
    let pos = available.indexOf(current);
    let prev = available[(pos - 1 + available.length) % available.length];
    await currentRoomRef.update({ tvTrailerIndex: prev });
}

async function switchLanguage(lang) {
    if (!currentRoomRef || gameMode !== 'tournament') return;
    const isActivePlayer = (myPlayerId === players[currentPlayerIndex]?.id);
    if (!isActivePlayer) {
        alert('Nur der aktive Spieler kann die Sprache ändern.');
        return;
    }
    await currentRoomRef.update({ tvLanguage: lang });
}
// --------------------------------------------------------------

let activeScanner = null;
async function startActiveScanner() {
    if (activeScanner) {
        try { await activeScanner.stop(); } catch(e) {}
        activeScanner = null;
    }
    elements.scanFeedback.innerText = '⏳ Kamera wird gestartet...';
    try {
        await startScannerWithMode(currentCameraMode);
        elements.scanFeedback.innerText = '✅ Kamera aktiv. Scanne QR-Code.';
    } catch (err) {
        console.error('Kamera-Fehler:', err);
        elements.scanFeedback.innerText = '❌ Kamera-Fehler: ' + (err.message || 'Unbekannt');
        elements.scanFeedback.classList.add('error');
    }
}

async function handleOnlineScan(qrData) {
    const filmId = extractFilmId(qrData);
    if (!filmId) {
        elements.scanFeedback.innerText = '❌ Ungültiger QR-Code';
        setTimeout(() => { if(elements.scanFeedback) elements.scanFeedback.innerText = '✅ Kamera aktiv'; }, 2000);
        return;
    }
    const film = app.films.find(f => f.Nr === filmId);
    if (!film) {
        elements.scanFeedback.innerText = `❌ Film #${filmId} nicht in DB`;
        return;
    }
    if (activeScanner) {
        await stopActiveScanner();
        activeScanner = null;
    }
    await currentRoomRef.update({ currentFilmId: filmId });
    app.currentFilm = film;
    openActiveFilmModal(film);
}

async function stopActiveScanner() {
    if (activeScanner) {
        try {
            await activeScanner.stop();
        } catch(e) {
            if (!e.message.includes('not running')) console.warn(e);
        }
        activeScanner = null;
    }
}

async function openActiveFilmModal(film) {
    // Bestehendes Modal entfernen
    const existingModal = document.querySelector('.modal:not(#guessModal):not(#roundSummaryModal)');
    if (existingModal) {
        const existingVideo = existingModal.querySelector('video');
        if (existingVideo) {
            existingVideo.pause();
            existingVideo.src = '';
        }
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content glass-card" style="max-width: 800px;">
            <h2>Film gescannt (geheim)</h2>
            <div class="trailer-toolbar">
                <div class="language-switch">
                    <button data-lang="de" class="lang-btn active">Deutsch</button>
                    <button data-lang="en" class="lang-btn">English</button>
                </div>
                <div class="trailer-nav">
                    <button class="nav-btn prev-trailer"><i class="fas fa-chevron-left"></i></button>
                    <span class="trailer-count">Trailer 0/0</span>
                    <button class="nav-btn next-trailer"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="video-wrapper"><video class="trailer-player" controls playsinline preload="metadata"></video></div>
            <div class="tips-section">
                <div class="tips-header"><i class="fas fa-lightbulb"></i><span>Tipps</span></div>
                <button class="tip-btn primary-tip next-tip">📢 Tipp anzeigen</button>
                <div class="tip-display"><i class="fas fa-info-circle"></i> Klicke auf Tipp.</div>
            </div>
            <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                <button class="primary-btn guess-btn">🎬 Film erraten?</button>
                <button class="secondary-btn rescann-btn">🔄 Erneut scannen</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const video = modal.querySelector('.trailer-player');
    const nextTipBtn = modal.querySelector('.next-tip');
    const tipDisplay = modal.querySelector('.tip-display');
    
    const currentLangFromDB = (await currentRoomRef.child('tvLanguage').once('value')).val() || 'de';
    const langBtns = modal.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLangFromDB);
        btn.onclick = async () => {
            const newLang = btn.dataset.lang;
            await switchLanguage(newLang);
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });

    // Trailer‑Navigation
    const prevBtn = modal.querySelector('.prev-trailer');
    const nextBtn = modal.querySelector('.next-trailer');
    prevBtn.onclick = async () => { await prevTrailer(); };
    nextBtn.onclick = async () => { await nextTrailer(); };
    
    // Tipp-Logik (lokal)
    let localTipUsage = 0;
    nextTipBtn.onclick = () => {
        localTipUsage++;
        currentTipUsage = localTipUsage;
        if (localTipUsage >= 3) nextTipBtn.disabled = true;
        const facts = app.funFactsMap.get(film.Nr);
        if (!facts || !facts.hinweise || !facts.hinweise.length) {
            tipDisplay.innerHTML = '<i class="fas fa-ban"></i> Keine Hinweise.';
            return;
        }
        let tipText = '';
        if (localTipUsage === 1) tipText = facts.hinweise[0];
        else if (localTipUsage === 2) tipText = facts.hinweise[1] || facts.hinweise[0];
        else tipText = facts.hinweise[2] || facts.hinweise[facts.hinweise.length - 1];
        if (elements.tipOverlayText) elements.tipOverlayText.innerText = tipText;
        if (elements.tipOverlay) {
            elements.tipOverlay.style.display = 'flex';
            elements.tipOverlay.classList.remove('hidden');
        }
        tipDisplay.innerHTML = `<i class="fas fa-lightbulb"></i> ${escapeHtml(tipText)}`;
    };
    
    // ----- NEU: "Erneut scannen" Button -----
    const rescannBtn = modal.querySelector('.rescann-btn');
    rescannBtn.onclick = async () => {
        // Film in DB zurücksetzen
        await currentRoomRef.update({ currentFilmId: null });
        // Modal schließen
        modal.remove();
        // Scanner neu starten (ohne Punkte oder Rundenwechsel)
        await startActiveScanner();
        // Hinweis: keine Änderung an Punkten, Tipps, currentPlayerIndex
    };
    // ---------------------------------------
    
    modal.querySelector('.guess-btn').onclick = async () => {
        await stopActiveScanner();
        modal.remove();
        openGuessModalOnline(film);
    };
    
    const tvActive = await currentRoomRef.child('tvModeActive').once('value').then(s => s.val());
    if (tvActive) {
        const videoWrapper = modal.querySelector('.video-wrapper');
        if (videoWrapper) videoWrapper.style.display = 'none';
        // Toolbar bleibt sichtbar (Steuerung für den aktiven Spieler)
    }

    // Initialen Trailer aus DB laden
    const data = (await currentRoomRef.once('value')).val();
    syncTrailerFromDB(data);
}

function openGuessModalOnline(film) {
    const title = getFilmTitle(film);
    elements.guessFilmTitleSpan.innerText = title;
    elements.currentPlayerNameSpan.innerText = players.find(p=>p.id===myPlayerId)?.name || '?';
    elements.guessModal.classList.remove('hidden');
    const yesHandler = () => { elements.guessModal.classList.add('hidden'); wasGuessed=true; roundBasePoints = parseInt(film.Schwierigkeit) || 3; openRoundSummaryOnline(film); cleanup(); };
    const noHandler = () => { elements.guessModal.classList.add('hidden'); wasGuessed=false; roundBasePoints=0; openRoundSummaryOnline(film); cleanup(); };
    const cleanup = () => { elements.guessYesBtn.removeEventListener('click', yesHandler); elements.guessNoBtn.removeEventListener('click', noHandler); };
    elements.guessYesBtn.onclick = yesHandler;
    elements.guessNoBtn.onclick = noHandler;
}

function openRoundSummaryOnline(film) {
    tempTitleBonus=0; tempDirectorBonus=0; titleBonusUsed=false; directorBonusUsed=false;
    elements.basePointsSpan.innerText = roundBasePoints;
    elements.titlePointsSpan.innerText = 0;
    elements.directorPointsSpan.innerText = 0;
    elements.tipCountSpan.innerText = currentTipUsage;
    elements.tipPenaltySpan.innerText = currentTipUsage;
    let total = roundBasePoints - currentTipUsage;
    elements.roundTotalSpan.innerText = total;
    elements.roundModal.classList.remove('hidden');
    const confirmHandler = async () => {
        const roundTotal = roundBasePoints + tempTitleBonus + tempDirectorBonus - currentTipUsage;
        await currentRoomRef.child(`players/${myPlayerId}/totalScore`).transaction(score => (score||0) + roundTotal);
        if(wasGuessed) await currentRoomRef.child(`players/${myPlayerId}/correctGuesses`).transaction(g => (g||0)+1);
        await stopActiveScanner();
        const snap = await currentRoomRef.get();
        const data = snap.val();
        const nextIndex = (data.currentPlayerIndex + 1) % players.length;
        await currentRoomRef.update({ currentPlayerIndex: nextIndex, currentFilmId: null });
        elements.roundModal.classList.add('hidden');
        const playersAfter = Object.values(data.players || {});
        let finished = false;
        if(targetType === 'points') finished = playersAfter.some(p => p.totalScore >= targetScore);
        else finished = playersAfter.some(p => p.correctGuesses >= guessTarget);
        if(finished) await currentRoomRef.update({ gameState: 'finished' });
        elements.confirmRoundBtn.removeEventListener('click', confirmHandler);
    };
    elements.confirmRoundBtn.onclick = confirmHandler;
    elements.addTitlePointsBtn.onclick = () => { if(titleBonusUsed) return; titleBonusUsed=true; tempTitleBonus++; elements.titlePointsSpan.innerText=tempTitleBonus; let total = roundBasePoints+tempTitleBonus+tempDirectorBonus-currentTipUsage; elements.roundTotalSpan.innerText=total; elements.addTitlePointsBtn.disabled=true; };
    elements.addDirectorPointsBtn.onclick = () => { if(directorBonusUsed) return; directorBonusUsed=true; tempDirectorBonus++; elements.directorPointsSpan.innerText=tempDirectorBonus; let total = roundBasePoints+tempTitleBonus+tempDirectorBonus-currentTipUsage; elements.roundTotalSpan.innerText=total; elements.addDirectorPointsBtn.disabled=true; };
}

// --------------------------------------------------------------
// Lokaler Modus (unverändert, aber funktionsfähig)
// --------------------------------------------------------------
let localScanner = null;
let localPlayers = [];
let localCurrentPlayerIndex = 0;
let localCurrentFilm = null;
let localTipUsage = 0;
let localWasGuessed = false;
let localRoundBasePoints = 0;
let localTempTitleBonus = 0, localTempDirectorBonus = 0;
let localTitleBonusUsed = false, localDirectorBonusUsed = false;
let localEndAfterCurrentRound = false, localEndRoundPlayerIndex = null;

function showLocalPlayerSetup() {
    elements.modeSelectionSection.classList.add('hidden');
    elements.localPlayerSetupSection.classList.remove('hidden');
    
    const simpleRadio = document.querySelector('input[name="localGameMode"][value="simple"]');
    const tournamentRadio = document.querySelector('input[name="localGameMode"][value="tournament"]');
    const targetSettingsDiv = document.getElementById('localTargetSettings');
    
    // Event-Listener für die Ziel-Radiobuttons (lokal)
    const targetTypeRadios = document.querySelectorAll('input[name="localTargetType"]');
    const pointsGroup = document.getElementById('localPointsTargetGroup');
    const guessesGroup = document.getElementById('localGuessesTargetGroup');
    
    function updateTargetVisibility() {
        const isPoints = document.querySelector('input[name="localTargetType"]:checked').value === 'points';
        pointsGroup.style.display = isPoints ? 'block' : 'none';
        guessesGroup.style.display = isPoints ? 'none' : 'block';
    }
    
    targetTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateTargetVisibility);
    });
    updateTargetVisibility();
    
    const updateUIMode = () => {
        localSimpleMode = simpleRadio.checked;
        gameMode = localSimpleMode ? 'normal' : 'tournament';
        
        const playerListContainer = document.querySelector('#localPlayerSetupSection .player-list-container');
        const addPlayerDiv = document.querySelector('#localPlayerSetupSection .add-player');
        const startBtn = elements.localStartGameBtn;
        
        if (localSimpleMode) {
            if (playerListContainer) playerListContainer.style.display = 'none';
            if (addPlayerDiv) addPlayerDiv.style.display = 'none';
            if (targetSettingsDiv) targetSettingsDiv.style.display = 'none';
            startBtn.innerHTML = '<i class="fas fa-play"></i> Scanner starten';
            startBtn.onclick = () => {
                localPlayers = [];
                startLocalScanner();
            };
        } else {
            if (playerListContainer) playerListContainer.style.display = 'block';
            if (addPlayerDiv) addPlayerDiv.style.display = 'flex';
            if (targetSettingsDiv) targetSettingsDiv.style.display = 'block';
            startBtn.innerHTML = '<i class="fas fa-play"></i> Spiel starten';
            startBtn.onclick = () => {
                if (localPlayers.length === 0) {
                    alert('Bitte füge Spieler hinzu.');
                    return;
                }
                // Ziel-Einstellungen übernehmen
                const selectedTargetType = document.querySelector('input[name="localTargetType"]:checked').value;
                targetType = selectedTargetType;
                if (selectedTargetType === 'points') {
                    targetScore = parseInt(document.getElementById('localTargetScore').value) || 30;
                } else {
                    guessTarget = parseInt(document.getElementById('localGuessTarget').value) || 5;
                }
                
                localCurrentPlayerIndex = Math.floor(Math.random() * localPlayers.length);
                alert(`Startspieler: ${localPlayers[localCurrentPlayerIndex].name}\nZiel: ${targetType === 'points' ? targetScore + ' Punkte' : guessTarget + ' erratene Filme'}`);
                updateLocalScoreboard();
                startLocalScanner();
            };
        }
    };
    
    simpleRadio.addEventListener('change', updateUIMode);
    tournamentRadio.addEventListener('change', updateUIMode);
    updateUIMode(); // Initiale Ansicht setzen
    
    updateLocalPlayerListUI();
}

function updateLocalPlayerListUI() { elements.localPlayerList.innerHTML = ''; localPlayers.forEach((p, idx) => { const li = document.createElement('li'); li.innerHTML = `<span>${escapeHtml(p.name)} (${p.totalScore} Pkt., ${p.correctGuesses || 0} erraten)</span><button class="remove-player" data-idx="${idx}"><i class="fas fa-trash"></i></button>`; elements.localPlayerList.appendChild(li); }); document.querySelectorAll('#localPlayerList .remove-player').forEach(btn => { btn.addEventListener('click', (e) => { const idx = parseInt(btn.dataset.idx); localPlayers.splice(idx, 1); updateLocalPlayerListUI(); updateLocalScoreboard(); }); }); }

function addLocalPlayer(name) { if (!name.trim()) return; localPlayers.push({ name: name.trim(), totalScore: 0, correctGuesses: 0, rounds: [] }); updateLocalPlayerListUI(); elements.localNewPlayerName.value = ''; }
function updateLocalScoreboard() { if (gameMode !== 'tournament') return; elements.localScoreboard.style.display = 'block'; let html = `<h4><i class="fas fa-chart-simple"></i> Punktestand</h4><div class="current-player-indicator">Aktueller Spieler: <strong>${localPlayers[localCurrentPlayerIndex]?.name || '—'}</strong></div><ul>`; localPlayers.forEach(p => { html += `<li><strong>${escapeHtml(p.name)}</strong>: ${p.totalScore} Pkt. (${p.correctGuesses || 0} erraten)</li>`; }); html += `</ul>`; elements.localScoreboard.innerHTML = html; }
function startLocalScanner() {
    elements.localPlayerSetupSection.classList.add('hidden');
    elements.localScannerSection.classList.remove('hidden');
    elements.localFilmSection.classList.add('hidden');
    
    if (!localSimpleMode) {
        updateLocalScannerDisplay();   // zeigt Namen & Punktestand
        if (elements.localScoreboard) elements.localScoreboard.style.display = 'block';
    } else {
        // Im einfachen Modus: Spielerinfo ausblenden
        const playerBadge = document.querySelector('#localScannerSection .current-player-badge');
        if (playerBadge) playerBadge.style.display = 'none';
        if (elements.localScoreboard) elements.localScoreboard.style.display = 'none';
    }
    initLocalScanner();
}
function updateLocalScannerDisplay() { if (localPlayers.length > 0 && localCurrentPlayerIndex < localPlayers.length) { elements.localScannerPlayerName.innerText = localPlayers[localCurrentPlayerIndex].name; elements.localScannerPlayerScore.innerText = localPlayers[localCurrentPlayerIndex].totalScore; } else { elements.localScannerPlayerName.innerText = '—'; elements.localScannerPlayerScore.innerText = '0'; } }
async function initLocalScanner() {
    if (localScanner) {
        try { await localScanner.stop(); } catch(e) {}
        localScanner = null;
    }
    elements.localScanFeedback.innerText = '⏳ Kamera wird gestartet...';
    try {
        await startLocalScannerWithMode(localCameraMode);
        elements.localScanFeedback.innerText = '✅ Kamera aktiv.';
    } catch (err) {
        elements.localScanFeedback.innerText = '❌ Kamera-Fehler: ' + (err.message || 'Unbekannt');
    }
}
function handleLocalScan(qrData) { const filmId = extractFilmId(qrData); if (!filmId) { elements.localScanFeedback.innerText = '❌ Ungültiger QR-Code'; return; } const film = app.films.find(f => f.Nr === filmId); if (!film) { elements.localScanFeedback.innerText = `❌ Film #${filmId} nicht gefunden`; return; } localCurrentFilm = film; stopLocalScanner(); showLocalFilmView(); }
async function stopLocalScanner() { if (localScanner) { try { await localScanner.stop(); } catch(e) {} localScanner = null; } }
function showLocalFilmView() {
    elements.localScannerSection.classList.add('hidden');
    elements.localFilmSection.classList.remove('hidden');
    
    elements.localFilmTitle.innerText = '🎬 Film gescannt (geheim)';
    elements.localFilmYear.innerHTML = '';
    elements.localFilmDirector.innerHTML = '';
    
    localTipUsage = 0;
    elements.localNextTipBtn.disabled = false;
    elements.localTipDisplay.innerHTML = '<i class="fas fa-info-circle"></i> Klicke auf "Tipp anzeigen".';
    
    updateLocalAvailableTrailers();
    localCurrentTrailerIndex = 1;
    localCurrentLanguage = 'de';
    updateLocalLanguageButtons();
    loadLocalCurrentTrailer();
    
    // Spielerinfo nur im Turnier-Modus anzeigen
    if (!localSimpleMode) {
        elements.localFilmPlayerInfo.style.display = 'flex';
        updateLocalFilmPlayerDisplay();
    } else {
        elements.localFilmPlayerInfo.style.display = 'none';
    }
    
    const guessBtn = elements.localAskGuessBtn;
    const nextFilmBtn = elements.localNextFilmBtn;
    
    if (localSimpleMode) {
        // Einfacher Modus: "Film erraten?" + "Erneut scannen"
        guessBtn.style.display = 'inline-flex';
        guessBtn.onclick = () => openLocalSimpleGuess();
        nextFilmBtn.style.display = 'none';
        
        // "Erneut scannen" Button ggf. erstellen
        let rescannBtn = document.getElementById('localRescannBtn');
        if (!rescannBtn) {
            rescannBtn = document.createElement('button');
            rescannBtn.id = 'localRescannBtn';
            rescannBtn.className = 'secondary-btn';
            rescannBtn.innerHTML = '<i class="fas fa-redo-alt"></i> Erneut scannen';
            guessBtn.parentNode.insertBefore(rescannBtn, guessBtn.nextSibling);
        }
        rescannBtn.style.display = 'inline-flex';
        rescannBtn.onclick = () => {
            localCurrentFilm = null;
            stopLocalScanner();
            startLocalScanner();
        };
    } else {
        // Turnier-Modus: alles wie gehabt
        guessBtn.style.display = 'inline-flex';
        guessBtn.onclick = () => openLocalGuessModal();
        nextFilmBtn.style.display = 'none';
        const existingRescann = document.getElementById('localRescannBtn');
        if (existingRescann) existingRescann.style.display = 'none';
    }
}
let localAvailableTrailers = [], localCurrentTrailerIndex = 1, localCurrentLanguage = 'de';
function updateLocalAvailableTrailers() { localAvailableTrailers = []; for (let i=1;i<=3;i++) { const key = `App-Link_Video-${i}_${localCurrentLanguage.toUpperCase()}`; if (localCurrentFilm[key] && localCurrentFilm[key].trim()) localAvailableTrailers.push(i); } }
function loadLocalCurrentTrailer() { if (!localCurrentFilm || !localAvailableTrailers.length) { if (elements.localTrailerVideo) elements.localTrailerVideo.src = ''; if (elements.localTrailerCounter) elements.localTrailerCounter.innerText = 'Kein Trailer'; return; } if (!localAvailableTrailers.includes(localCurrentTrailerIndex)) localCurrentTrailerIndex = localAvailableTrailers[0]; const key = `App-Link_Video-${localCurrentTrailerIndex}_${localCurrentLanguage.toUpperCase()}`; const url = localCurrentFilm[key]; if (url && elements.localTrailerVideo) { elements.localTrailerVideo.src = url; elements.localTrailerVideo.load(); const pos = localAvailableTrailers.indexOf(localCurrentTrailerIndex)+1; elements.localTrailerCounter.innerText = `Trailer ${pos}/${localAvailableTrailers.length}`; updateLocalNavButtons(); } }
function updateLocalNavButtons() { const pos = localAvailableTrailers.indexOf(localCurrentTrailerIndex); elements.localPrevTrailerBtn.disabled = pos <= 0; elements.localNextTrailerBtn.disabled = pos >= localAvailableTrailers.length-1; }
function nextLocalTrailer() { const pos = localAvailableTrailers.indexOf(localCurrentTrailerIndex); if (pos < localAvailableTrailers.length-1) { localCurrentTrailerIndex = localAvailableTrailers[pos+1]; loadLocalCurrentTrailer(); } }
function prevLocalTrailer() { const pos = localAvailableTrailers.indexOf(localCurrentTrailerIndex); if (pos > 0) { localCurrentTrailerIndex = localAvailableTrailers[pos-1]; loadLocalCurrentTrailer(); } }
function switchLocalLanguage(lang) { if (lang === localCurrentLanguage) return; localCurrentLanguage = lang; localCurrentTrailerIndex = 1; updateLocalLanguageButtons(); updateLocalAvailableTrailers(); loadLocalCurrentTrailer(); }
function updateLocalLanguageButtons() { elements.localLangBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === localCurrentLanguage)); }
function showLocalNextTip() { if (!localCurrentFilm) return; const facts = app.funFactsMap.get(localCurrentFilm.Nr); if (!facts || !facts.hinweise || !facts.hinweise.length) { elements.localTipDisplay.innerHTML = '<i class="fas fa-ban"></i> Keine Hinweise verfügbar.'; return; } let tipText = ''; if (localTipUsage === 0) tipText = facts.hinweise[0]; else if (localTipUsage === 1) tipText = facts.hinweise[1] || facts.hinweise[0]; else tipText = facts.hinweise[2] || facts.hinweise[facts.hinweise.length-1]; localTipUsage++; if (localTipUsage >= 3) elements.localNextTipBtn.disabled = true; elements.localTipDisplay.innerHTML = `<i class="fas fa-lightbulb"></i> ${escapeHtml(tipText)}`; }
function openLocalGuessModal() { if (gameMode !== 'tournament') return; const title = getFilmTitle(localCurrentFilm); elements.guessFilmTitleSpan.innerText = title; elements.currentPlayerNameSpan.innerText = localPlayers[localCurrentPlayerIndex]?.name || '?'; elements.guessModal.classList.remove('hidden'); const yesHandler = () => { elements.guessModal.classList.add('hidden'); localWasGuessed = true; localRoundBasePoints = parseInt(localCurrentFilm.Schwierigkeit) || 3; openLocalRoundSummary(); elements.guessYesBtn.removeEventListener('click', yesHandler); elements.guessNoBtn.removeEventListener('click', noHandler); }; const noHandler = () => { elements.guessModal.classList.add('hidden'); localWasGuessed = false; localRoundBasePoints = 0; openLocalRoundSummary(); elements.guessYesBtn.removeEventListener('click', yesHandler); elements.guessNoBtn.removeEventListener('click', noHandler); }; elements.guessYesBtn.onclick = yesHandler; elements.guessNoBtn.onclick = noHandler; }

function openLocalSimpleGuess() {
    if (!localCurrentFilm) return;
    const title = getFilmTitle(localCurrentFilm);
    // Zum Scanner zurück
    localCurrentFilm = null;
    stopLocalScanner();
    startLocalScanner();
}

function openLocalRoundSummary() {
    localTempTitleBonus = 0;
    localTempDirectorBonus = 0;
    localTitleBonusUsed = false;
    localDirectorBonusUsed = false;
    elements.basePointsSpan.innerText = localRoundBasePoints;
    elements.titlePointsSpan.innerText = 0;
    elements.directorPointsSpan.innerText = 0;
    elements.tipCountSpan.innerText = localTipUsage;
    elements.tipPenaltySpan.innerText = localTipUsage;
    let total = localRoundBasePoints - localTipUsage;
    elements.roundTotalSpan.innerText = total;
    elements.roundModal.classList.remove('hidden');
    
    const confirmHandler = () => {
        const roundTotal = localRoundBasePoints + localTempTitleBonus + localTempDirectorBonus - localTipUsage;
        const currentPlayer = localPlayers[localCurrentPlayerIndex];
        if (currentPlayer) {
            currentPlayer.totalScore += roundTotal;
            if (localWasGuessed) currentPlayer.correctGuesses = (currentPlayer.correctGuesses || 0) + 1;
        }
        // Punktestand aktualisieren
        updateLocalScoreboard();
        
        // Prüfen, ob Spiel zu Ende ist
        checkLocalWinCondition(currentPlayer);
        
        // Nächsten Spieler bestimmen (wenn nicht zu Ende)
        if (!localEndAfterCurrentRound) {
            localCurrentPlayerIndex = (localCurrentPlayerIndex + 1) % localPlayers.length;
        } else if (localCurrentPlayerIndex === localEndRoundPlayerIndex) {
            // Spiel beenden
            elements.roundModal.classList.add('hidden');
            endLocalGame();
            return;
        }
        
        elements.roundModal.classList.add('hidden');
        // Für den nächsten Spieler Scanner starten
        startLocalScanner();
        elements.confirmRoundBtn.removeEventListener('click', confirmHandler);
    };
    
    elements.confirmRoundBtn.onclick = confirmHandler;
    
    // Bonus-Buttons zurücksetzen
    elements.addTitlePointsBtn.disabled = false;
    elements.addDirectorPointsBtn.disabled = false;
    elements.addTitlePointsBtn.onclick = () => {
        if (localTitleBonusUsed) return;
        localTitleBonusUsed = true;
        localTempTitleBonus++;
        elements.titlePointsSpan.innerText = localTempTitleBonus;
        let total = localRoundBasePoints + localTempTitleBonus + localTempDirectorBonus - localTipUsage;
        elements.roundTotalSpan.innerText = total;
        elements.addTitlePointsBtn.disabled = true;
    };
    elements.addDirectorPointsBtn.onclick = () => {
        if (localDirectorBonusUsed) return;
        localDirectorBonusUsed = true;
        localTempDirectorBonus++;
        elements.directorPointsSpan.innerText = localTempDirectorBonus;
        let total = localRoundBasePoints + localTempTitleBonus + localTempDirectorBonus - localTipUsage;
        elements.roundTotalSpan.innerText = total;
        elements.addDirectorPointsBtn.disabled = true;
    };
}

function checkLocalWinCondition(currentPlayer) { if (localEndAfterCurrentRound) return; if (targetType === 'points') { if (currentPlayer.totalScore >= targetScore) { localEndAfterCurrentRound = true; localEndRoundPlayerIndex = (localCurrentPlayerIndex - 1 + localPlayers.length) % localPlayers.length; } } else { if (currentPlayer.correctGuesses >= guessTarget) { localEndAfterCurrentRound = true; localEndRoundPlayerIndex = (localCurrentPlayerIndex - 1 + localPlayers.length) % localPlayers.length; } } }
function endLocalGame() { let maxScore = -1, winners = []; localPlayers.forEach(p => { if (p.totalScore > maxScore) { maxScore = p.totalScore; winners = [p.name]; } else if (p.totalScore === maxScore) winners.push(p.name); }); alert(`🏆 SIEGER: ${winners.join(', ')} mit ${maxScore} Punkten!`); localPlayers = []; localCurrentPlayerIndex = 0; localEndAfterCurrentRound = false; showLocalPlayerSetup(); }
function updateLocalFilmPlayerDisplay() { if (localPlayers.length && localCurrentPlayerIndex < localPlayers.length) { elements.localFilmCurrentPlayer.innerText = localPlayers[localCurrentPlayerIndex].name; elements.localFilmCurrentScore.innerText = localPlayers[localCurrentPlayerIndex].totalScore; } }
function getFilmTitle(film) { if (localCurrentLanguage === 'de' && film['Titel Deutsch'] && film['Titel Deutsch'].trim()) return film['Titel Deutsch']; return film['Titel Original'] || 'Unbekannt'; }
function extractFilmId(qrData) { let m = qrData.match(/id=(\d+)/); return m ? m[1] : (qrData.match(/^(\d+)$/) || [])[1]; }



function setupEventListeners() {
    elements.confirmModeBtn.onclick = () => {
        const selectedMode = document.querySelector('input[name="gameModeSelect"]:checked').value;
        if (selectedMode === 'local') {
            // gameMode wird später in showLocalPlayerSetup() je nach Auswahl gesetzt
            showLocalPlayerSetup();
        } else {
            if (!initFirebase()) { alert('Firebase Verbindung fehlgeschlagen.'); return; }
            elements.modeSelectionSection.classList.add('hidden');
            elements.roomSetupSection.classList.remove('hidden');
        }
    };
    elements.createRoomBtn.onclick = () => createRoom();
    elements.joinRoomBtn.onclick = () => joinRoom(elements.joinRoomCode.value.trim());
    elements.startGameFromWaitingBtn.onclick = () => startOnlineGame();
    elements.backToModeFromRoomBtn.onclick = () => resetToModeSelection();
    elements.leaveRoomBtn.onclick = () => leaveRoom();
    elements.leaveActiveRoomBtn.onclick = () => leaveRoom();
    elements.leaveSpectatorRoomBtn.onclick = () => leaveRoom();
    elements.tvModeCheckbox.onchange = async (e) => {
        const enabled = e.target.checked;
        if (enabled) {
            if (currentRoomRef && myPlayerId) {
                await currentRoomRef.child(`players/${myPlayerId}`).remove();
                myPlayerId = null;
                isTVMode = true;
                await currentRoomRef.update({ tvModeActive: true, hasTV: true });
            }
            showTVScreen();
        } else {
            if (currentRoomRef) {
                await currentRoomRef.update({ hasTV: false, tvModeActive: false });
            }
            location.reload();
        }
    };
    elements.endGameOnlineBtn.onclick = async () => {
        if (!isRoomCreator) {
            alert('⛔ Nur der Host kann das Spiel beenden.');
            return;
        }
        if (!currentRoomRef) {
            alert('❌ Keine Verbindung zum Raum. Bitte Seite neu laden.');
            return;
        }
        if (!confirm('Wirklich das gesamte Spiel beenden? Alle Daten gehen verloren.')) return;
        
        try {
            await currentRoomRef.update({ gameState: 'finished' });
            // Die endOnlineGame-Funktion wird automatisch durch den Listener aufgerufen
        } catch (err) {
            console.error('Fehler beim Setzen von gameState:', err);
            alert('Fehler: ' + err.message);
        }
    };
    elements.localAddPlayerBtn.onclick = () => addLocalPlayer(elements.localNewPlayerName.value);
    elements.localStartGameBtn.onclick = () => { if (localPlayers.length === 0) { alert('Bitte füge Spieler hinzu.'); return; } localCurrentPlayerIndex = Math.floor(Math.random() * localPlayers.length); alert(`Startspieler: ${localPlayers[localCurrentPlayerIndex].name}`); updateLocalScoreboard(); startLocalScanner(); };
    elements.backToModeFromLocalBtn.onclick = () => resetToModeSelection();
    elements.backToLocalSetupBtn.onclick = () => { stopLocalScanner(); showLocalPlayerSetup(); };
    elements.localEndGameBtn.onclick = () => endLocalGame();
    elements.localAskGuessBtn.onclick = () => openLocalGuessModal();
    elements.localNextTipBtn.onclick = () => showLocalNextTip();
    elements.localPrevTrailerBtn.onclick = () => prevLocalTrailer();
    elements.localNextTrailerBtn.onclick = () => nextLocalTrailer();
    elements.localLangBtns.forEach(btn => btn.addEventListener('click', () => switchLocalLanguage(btn.dataset.lang)));
    elements.localRetryCameraBtn.onclick = () => initLocalScanner();
    const closeTipOverlay = () => elements.tipOverlay.classList.add('hidden');
    elements.closeTipOverlay.onclick = closeTipOverlay;
    elements.tipOverlayCloseBtn.onclick = closeTipOverlay;
    elements.retryButton.onclick = () => location.reload();
    elements.waitingTargetTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isPoints = document.querySelector('input[name="waitingTargetType"]:checked').value === 'points';
            elements.waitingPointsTargetGroup.style.display = isPoints ? 'block' : 'none';
            elements.waitingGuessesTargetGroup.style.display = isPoints ? 'none' : 'block';
        });
    });
    elements.applyTargetSettingsBtn.onclick = async () => {
        if (!isRoomCreator) { alert('Nur der Host kann das Ziel festlegen.'); return; }
        const targetTypeVal = document.querySelector('input[name="waitingTargetType"]:checked').value;
        const targetScoreVal = parseInt(elements.waitingTargetScore.value) || 30;
        const guessTargetVal = parseInt(elements.waitingGuessTarget.value) || 5;
        targetType = targetTypeVal;
        targetScore = targetScoreVal;
        guessTarget = guessTargetVal;
        await currentRoomRef.update({ targetType: targetTypeVal, targetScore: targetScoreVal, guessTarget: guessTargetVal });
        alert(`Ziel gespeichert: ${targetTypeVal === 'points' ? targetScoreVal + ' Punkte' : guessTargetVal + ' richtig erratene Filme'}`);
    };
    if (elements.closeTvOverlay) {
        elements.closeTvOverlay.onclick = () => {
            elements.tvFullscreenOverlay.classList.add('hidden');
            if (currentRoomRef) currentRoomRef.update({ tvModeActive: false });
            isTVMode = false;
            location.reload();
        };
    }
    if (elements.nextTrailerOnTvBtn) {
        elements.nextTrailerOnTvBtn.onclick = () => nextTrailer(); // nutzt die neue DB-Funktion
    }
    if (elements.toggleCameraBtn) {
        elements.toggleCameraBtn.onclick = () => switchCamera();
    }
    if (elements.localToggleCameraBtn) {
        elements.localToggleCameraBtn.onclick = () => switchLocalCamera();
    }
}

async function init() {
    if (app.isInitialized) return;
    app.isInitialized = true;
    initDomReferences();
    await loadFilms();
    await loadFunFacts();
    setupEventListeners();
    showLoading(false);
    console.log('✅ App bereit (synchronisierte Trailer-Steuerung)');
}
document.addEventListener('DOMContentLoaded', init);