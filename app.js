// ======================== GLOBALE VARIABLEN ========================
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

// Lokale Spielvariablen (Einzelspieler Turnier)
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
let invalidCount = 0;

// Multiplayer-Variablen (PeerJS)
let peer = null;
let connections = [];
let multiplayerScores = {};
let playerOrder = [];
let currentTurnPlayerId = null;
let currentFilmData = null;
let myPeerId = null;
let playerName = null;
let isHost = false;
let roomCode = null;
let multiplayerTargetType = 'points';
let multiplayerTargetValue = 30;

// DOM-Elemente (werden beim Laden zugewiesen)
let modeSelectionSection, playerSetupSection, scannerSection, filmSection, guessModal, roundModal;
let scannerVideoContainer, scanFeedback, loadingOverlay, errorOverlay, errorMessage, retryButton;
let trailerVideo, prevTrailerBtn, nextTrailerBtn, trailerCounter;
let langBtns, toggleCameraBtn, toggleFlashBtn, retryCameraBtn, nextTipBtn, tipDisplay, tipOverlay, tipOverlayText;
let closeTipOverlayBtn, tipOverlayCloseBtn, backToSetupFromScannerBtn, askGuessBtn, nextFilmBtn;
let playerListUl, newPlayerNameInput, addPlayerBtn, startGameBtn, backToModeBtn;
let endGameBtn, basePointsSpan, titlePointsSpan, directorPointsSpan, tipCountSpan, tipPenaltySpan, roundTotalSpan;
let addTitlePointsBtn, addDirectorPointsBtn, confirmRoundBtn;
let guessFilmTitleSpan, currentPlayerNameSpan, guessYesBtn, guessNoBtn;
let scannerPlayerNameSpan, scannerPlayerScoreSpan, filmCurrentPlayerSpan, filmCurrentScoreSpan, filmPlayerInfo, filmTitleElement;
let modeRadiosSelect, targetTypeRadiosSelect, targetScoreSelect, guessTargetSelect, confirmModeBtn;
let tournamentSettingsSelectDiv, pointsTargetGroupSelect, guessesTargetGroupSelect, multiplayerSettingsDiv;
let hostGameBtn, joinGameBtn, joinGamePanel, roomCodeInput, confirmJoinBtn;
let lobbySection, lobbyRoomCodeSpan, lobbyQrCodeDiv, lobbyPlayersUl, playerCountSpan, startMultiplayerGameBtn, backToModeFromLobbyBtn;
let waitingView, waitingFilmTitleSpan, waitingTrailerVideo, waitingTipDisplay, scoreboardWaiting, cancelWaitBtn;
let spectatorView, waitTurnView;

// ======================== INIT ========================
document.addEventListener('DOMContentLoaded', async () => {
    if (app.isInitialized) return;
    app.isInitialized = true;

    // DOM-Referenzen setzen
    modeSelectionSection = document.getElementById('modeSelectionSection');
    playerSetupSection = document.getElementById('playerSetupSection');
    scannerSection = document.getElementById('scannerSection');
    filmSection = document.getElementById('filmSection');
    guessModal = document.getElementById('guessModal');
    roundModal = document.getElementById('roundSummaryModal');
    scannerVideoContainer = document.getElementById('scannerVideoContainer');
    scanFeedback = document.getElementById('scanFeedback');
    loadingOverlay = document.getElementById('loadingOverlay');
    errorOverlay = document.getElementById('errorOverlay');
    errorMessage = document.getElementById('errorMessage');
    retryButton = document.getElementById('retryButton');
    trailerVideo = document.getElementById('trailerVideo');
    prevTrailerBtn = document.getElementById('prevTrailerBtn');
    nextTrailerBtn = document.getElementById('nextTrailerBtn');
    trailerCounter = document.getElementById('trailerCounter');
    langBtns = document.querySelectorAll('.lang-btn');
    toggleCameraBtn = document.getElementById('toggleCameraBtn');
    toggleFlashBtn = document.getElementById('toggleFlashBtn');
    retryCameraBtn = document.getElementById('retryCameraBtn');
    nextTipBtn = document.getElementById('nextTipBtn');
    tipDisplay = document.getElementById('tipDisplay');
    tipOverlay = document.getElementById('tipOverlay');
    tipOverlayText = document.getElementById('tipOverlayText');
    closeTipOverlayBtn = document.getElementById('closeTipOverlay');
    tipOverlayCloseBtn = document.getElementById('tipOverlayCloseBtn');
    backToSetupFromScannerBtn = document.getElementById('backToSetupFromScannerBtn');
    askGuessBtn = document.getElementById('askGuessBtn');
    nextFilmBtn = document.getElementById('nextFilmBtn');
    playerListUl = document.getElementById('playerList');
    newPlayerNameInput = document.getElementById('newPlayerName');
    addPlayerBtn = document.getElementById('addPlayerBtn');
    startGameBtn = document.getElementById('startGameBtn');
    backToModeBtn = document.getElementById('backToModeBtn');
    endGameBtn = document.getElementById('endGameBtn');
    basePointsSpan = document.getElementById('basePoints');
    titlePointsSpan = document.getElementById('titlePoints');
    directorPointsSpan = document.getElementById('directorPoints');
    tipCountSpan = document.getElementById('tipCount');
    tipPenaltySpan = document.getElementById('tipPenalty');
    roundTotalSpan = document.getElementById('roundTotal');
    addTitlePointsBtn = document.getElementById('addTitlePointsBtn');
    addDirectorPointsBtn = document.getElementById('addDirectorPointsBtn');
    confirmRoundBtn = document.getElementById('confirmRoundBtn');
    guessFilmTitleSpan = document.getElementById('guessFilmTitle');
    currentPlayerNameSpan = document.getElementById('currentPlayerName');
    guessYesBtn = document.getElementById('guessYesBtn');
    guessNoBtn = document.getElementById('guessNoBtn');
    scannerPlayerNameSpan = document.getElementById('scannerPlayerName');
    scannerPlayerScoreSpan = document.getElementById('scannerPlayerScore');
    filmCurrentPlayerSpan = document.getElementById('filmCurrentPlayer');
    filmCurrentScoreSpan = document.getElementById('filmCurrentScore');
    filmPlayerInfo = document.getElementById('filmPlayerInfo');
    filmTitleElement = document.getElementById('filmTitle');
    modeRadiosSelect = document.querySelectorAll('input[name="gameModeSelect"]');
    targetTypeRadiosSelect = document.querySelectorAll('input[name="targetTypeSelect"]');
    targetScoreSelect = document.getElementById('targetScoreSelect');
    guessTargetSelect = document.getElementById('guessTargetSelect');
    confirmModeBtn = document.getElementById('confirmModeBtn');
    tournamentSettingsSelectDiv = document.getElementById('tournamentSettingsSelect');
    pointsTargetGroupSelect = document.getElementById('pointsTargetGroupSelect');
    guessesTargetGroupSelect = document.getElementById('guessesTargetGroupSelect');
    multiplayerSettingsDiv = document.getElementById('multiplayerSettings');
    hostGameBtn = document.getElementById('hostGameBtn');
    joinGameBtn = document.getElementById('joinGameBtn');
    joinGamePanel = document.getElementById('joinGamePanel');
    roomCodeInput = document.getElementById('roomCodeInput');
    confirmJoinBtn = document.getElementById('confirmJoinBtn');
    lobbySection = document.getElementById('lobbySection');
    lobbyRoomCodeSpan = document.getElementById('lobbyRoomCodeSpan');
    lobbyQrCodeDiv = document.getElementById('lobbyQrCode');
    lobbyPlayersUl = document.getElementById('lobbyPlayersUl');
    playerCountSpan = document.getElementById('playerCount');
    startMultiplayerGameBtn = document.getElementById('startMultiplayerGameBtn');
    backToModeFromLobbyBtn = document.getElementById('backToModeFromLobbyBtn');
    waitingView = document.getElementById('waitingView');
    waitingFilmTitleSpan = document.getElementById('waitingFilmTitleSpan');
    waitingTrailerVideo = document.getElementById('waitingTrailerVideo');
    waitingTipDisplay = document.getElementById('waitingTipDisplay');
    scoreboardWaiting = document.getElementById('scoreboardWaiting');
    cancelWaitBtn = document.getElementById('cancelWaitBtn');
    spectatorView = document.getElementById('spectatorView');
    waitTurnView = document.getElementById('waitTurnView');

    try {
        await loadFilms();
        await loadFunFacts();
        await waitForQrScanner();
        setupEventListeners();
        clearAllGameData();
        showModeSelection();
    } catch (err) {
        console.error('Initialisierungsfehler:', err);
        if (errorOverlay) {
            errorMessage.innerText = 'Fehler beim Laden der Daten: ' + err.message;
            errorOverlay.classList.remove('hidden');
        }
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
});

function waitForQrScanner() {
    return new Promise(r => { 
        const check = () => { 
            if (typeof Html5Qrcode !== 'undefined') r(); 
            else setTimeout(check, 100); 
        }; 
        check(); 
    });
}

// ======================== DATEN LADEN ========================
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

// ======================== DATEN LÖSCHEN ========================
function clearAllGameData() {
    players = [];
    currentPlayerIndex = 0;
    gameMode = 'normal';
    targetType = 'points';
    targetScore = 30;
    guessTarget = 5;
    currentTipUsage = 0;
    roundBasePoints = 0;
    titleBonusUsed = false;
    directorBonusUsed = false;
    tempTitleBonus = 0;
    tempDirectorBonus = 0;
    wasGuessed = false;
    endAfterCurrentRound = false;
    endRoundPlayerIndex = null;
    app.currentFilm = null;
    
    if (peer) {
        try { peer.destroy(); } catch(e) {}
        peer = null;
    }
    isHost = false;
    roomCode = null;
    connections = [];
    multiplayerScores = {};
    myPeerId = null;
    playerName = null;
    playerOrder = [];
    currentTurnPlayerId = null;
    currentFilmData = null;
    
    if (lobbyPlayersUl) lobbyPlayersUl.innerHTML = '';
    if (playerCountSpan) playerCountSpan.innerText = '0';
    if (startMultiplayerGameBtn) startMultiplayerGameBtn.disabled = true;
    
    localStorage.removeItem('filmsterData');
    
    if (playerListUl) playerListUl.innerHTML = '';
    if (scannerPlayerNameSpan) scannerPlayerNameSpan.innerText = '—';
    if (scannerPlayerScoreSpan) scannerPlayerScoreSpan.innerText = '0';
    updateScoreboard();
}

// ======================== SPIELERVERWALTUNG (Einzel-Turnier) ========================
function updatePlayerListUI() {
    if (!playerListUl) return;
    playerListUl.innerHTML = '';
    players.forEach((p, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${escapeHtml(p.name)} (${p.totalScore} Pkt., ${p.correctGuesses || 0} erraten)</span><button class="remove-player" data-idx="${idx}"><i class="fas fa-trash"></i></button>`;
        playerListUl.appendChild(li);
    });
    document.querySelectorAll('.remove-player').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            players.splice(idx, 1);
            savePlayersToLocal();
            updatePlayerListUI();
            updateScoreboard();
            updateScannerPlayerDisplay();
        });
    });
}
function addPlayer(name) {
    if (!name.trim()) return;
    players.push({ name: name.trim(), totalScore: 0, correctGuesses: 0, rounds: [] });
    savePlayersToLocal();
    updatePlayerListUI();
    updateScoreboard();
    updateScannerPlayerDisplay();
    if (newPlayerNameInput) newPlayerNameInput.value = '';
}
function savePlayersToLocal() {
    const data = { players, gameMode, targetType, targetScore, guessTarget };
    localStorage.setItem('filmsterData', JSON.stringify(data));
}
function loadPlayersFromLocal() {
    const saved = localStorage.getItem('filmsterData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            players = data.players || [];
            gameMode = data.gameMode || 'normal';
            targetType = data.targetType || 'points';
            targetScore = data.targetScore || 30;
            guessTarget = data.guessTarget || 5;
        } catch(e) {}
    }
    players.forEach(p => { if (p.correctGuesses === undefined) p.correctGuesses = 0; if (p.rounds === undefined) p.rounds = []; });
}
function getRandomStartPlayer() {
    if (players.length === 0) return null;
    return Math.floor(Math.random() * players.length);
}

// ======================== PUNKTETAFEL & ANZEIGEN ========================
function updateScoreboard() {
    const scoreboardDiv = document.getElementById('scoreboard');
    if (!scoreboardDiv) return;
    if (gameMode === 'multiplayer') {
        scoreboardDiv.style.display = 'block';
        let html = `<h4><i class="fas fa-chart-simple"></i> Live-Punktestand</h4>`;
        if (currentTurnPlayerId && multiplayerScores[currentTurnPlayerId]) {
            html += `<div class="current-player-indicator"><i class="fas fa-dice-d6"></i> Aktueller Spieler: <strong>${escapeHtml(multiplayerScores[currentTurnPlayerId].name)}</strong></div>`;
        }
        html += `<ul>`;
        for (let id of playerOrder) {
            let p = multiplayerScores[id];
            if (p) {
                html += `<li><strong>${escapeHtml(p.name)}</strong>: ${p.score} Pkt. (${p.correctGuesses || 0} erraten)</li>`;
            }
        }
        html += `</ul>`;
        scoreboardDiv.innerHTML = html;
        if (scoreboardWaiting) {
            let htmlWait = `<h4><i class="fas fa-chart-simple"></i> Live-Punktestand</h4>`;
            if (currentTurnPlayerId && multiplayerScores[currentTurnPlayerId]) {
                htmlWait += `<div class="current-player-indicator"><i class="fas fa-dice-d6"></i> Aktueller Spieler: <strong>${escapeHtml(multiplayerScores[currentTurnPlayerId].name)}</strong></div>`;
            }
            htmlWait += `<ul>`;
            for (let id of playerOrder) {
                let p = multiplayerScores[id];
                if (p) {
                    htmlWait += `<li><strong>${escapeHtml(p.name)}</strong>: ${p.score} Pkt. (${p.correctGuesses || 0} erraten)</li>`;
                }
            }
            htmlWait += `</ul>`;
            scoreboardWaiting.innerHTML = htmlWait;
        }
        return;
    }
    if (gameMode !== 'tournament' || players.length === 0) {
        scoreboardDiv.style.display = 'none';
        return;
    }
    scoreboardDiv.style.display = 'block';
    let html = `<h4><i class="fas fa-chart-simple"></i> Punktestand</h4>`;
    html += `<div class="current-player-indicator"><i class="fas fa-dice-d6"></i> Aktueller Spieler: <strong>${players[currentPlayerIndex]?.name || '—'}</strong></div>`;
    html += `<ul>`;
    players.forEach(p => {
        html += `<li><strong>${escapeHtml(p.name)}</strong>: ${p.totalScore} Pkt. (${p.correctGuesses || 0} erraten)</li>`;
    });
    html += `</ul>`;
    scoreboardDiv.innerHTML = html;
}

function updateScannerPlayerDisplay() {
    if (gameMode === 'multiplayer') {
        if (scannerPlayerNameSpan && scannerPlayerScoreSpan) {
            const myData = multiplayerScores[myPeerId];
            if (myData) {
                scannerPlayerNameSpan.innerText = myData.name;
                scannerPlayerScoreSpan.innerText = myData.score;
            } else {
                scannerPlayerNameSpan.innerText = playerName || '—';
                scannerPlayerScoreSpan.innerText = '0';
            }
        }
        return;
    }
    if (scannerPlayerNameSpan && scannerPlayerScoreSpan && players.length > 0 && currentPlayerIndex < players.length) {
        scannerPlayerNameSpan.innerText = players[currentPlayerIndex].name;
        scannerPlayerScoreSpan.innerText = players[currentPlayerIndex].totalScore;
    } else if (scannerPlayerNameSpan && scannerPlayerScoreSpan) {
        scannerPlayerNameSpan.innerText = '—';
        scannerPlayerScoreSpan.innerText = '0';
    }
}

function updateFilmPlayerDisplay() {
    if (gameMode === 'multiplayer') {
        if (filmCurrentPlayerSpan && filmCurrentScoreSpan) {
            const myData = multiplayerScores[myPeerId];
            filmCurrentPlayerSpan.innerText = myData ? myData.name : (playerName || '—');
            filmCurrentScoreSpan.innerText = myData ? myData.score : '0';
        }
        return;
    }
    if (filmCurrentPlayerSpan && filmCurrentScoreSpan && players.length > 0 && currentPlayerIndex < players.length) {
        filmCurrentPlayerSpan.innerText = players[currentPlayerIndex].name;
        filmCurrentScoreSpan.innerText = players[currentPlayerIndex].totalScore;
    }
}

// ======================== ANSICHTEN ========================
function showModeSelection() {
    if (modeSelectionSection) modeSelectionSection.classList.remove('hidden');
    if (playerSetupSection) playerSetupSection.classList.add('hidden');
    if (scannerSection) scannerSection.classList.add('hidden');
    if (filmSection) filmSection.classList.add('hidden');
    if (waitingView) waitingView.classList.add('hidden');
    if (guessModal) guessModal.classList.add('hidden');
    if (roundModal) roundModal.classList.add('hidden');
    if (lobbySection) lobbySection.classList.add('hidden');
    if (spectatorView) spectatorView.classList.add('hidden');
    if (waitTurnView) waitTurnView.classList.add('hidden');
    if (multiplayerSettingsDiv) multiplayerSettingsDiv.style.display = 'none';
    if (joinGamePanel) joinGamePanel.style.display = 'none';
}

function showPlayerSetup() {
    if (modeSelectionSection) modeSelectionSection.classList.add('hidden');
    if (playerSetupSection) playerSetupSection.classList.remove('hidden');
    if (scannerSection) scannerSection.classList.add('hidden');
    if (filmSection) filmSection.classList.add('hidden');
    if (waitingView) waitingView.classList.add('hidden');
    if (guessModal) guessModal.classList.add('hidden');
    if (roundModal) roundModal.classList.add('hidden');
    if (lobbySection) lobbySection.classList.add('hidden');
    if (spectatorView) spectatorView.classList.add('hidden');
    if (waitTurnView) waitTurnView.classList.add('hidden');
}

async function showScanner() {
    if (modeSelectionSection) modeSelectionSection.classList.add('hidden');
    if (playerSetupSection) playerSetupSection.classList.add('hidden');
    if (scannerSection) scannerSection.classList.remove('hidden');
    if (filmSection) filmSection.classList.add('hidden');
    if (waitingView) waitingView.classList.add('hidden');
    if (guessModal) guessModal.classList.add('hidden');
    if (roundModal) roundModal.classList.add('hidden');
    if (lobbySection) lobbySection.classList.add('hidden');
    if (spectatorView) spectatorView.classList.add('hidden');
    if (waitTurnView) waitTurnView.classList.add('hidden');
    updateScoreboard();
    updateScannerPlayerDisplay();
    await startScanner();
}

function showWaitingScreen(filmData) {
    if (scannerSection) scannerSection.classList.add('hidden');
    if (filmSection) filmSection.classList.add('hidden');
    if (waitingView) waitingView.classList.remove('hidden');
    updateScoreboard();
    if (filmData && waitingFilmTitleSpan && waitingTrailerVideo && waitingTipDisplay) {
        const title = getFilmTitle(filmData.film);
        waitingFilmTitleSpan.innerText = title;
        let trailerUrl = null;
        const lang = filmData.language || app.currentLanguage;
        if (lang === 'de' && filmData.film['App-Link_Video-1_DE']) {
            trailerUrl = filmData.film['App-Link_Video-1_DE'];
        } else if (filmData.film['App-Link_Video-1_EN']) {
            trailerUrl = filmData.film['App-Link_Video-1_EN'];
        }
        waitingTrailerVideo.src = trailerUrl || '';
        waitingTrailerVideo.load();
        const facts = app.funFactsMap.get(filmData.film.Nr);
        if (facts && facts.hinweise && facts.hinweise.length) {
            waitingTipDisplay.innerHTML = `<i class="fas fa-lightbulb"></i> ${escapeHtml(facts.hinweise[0])}`;
        } else {
            waitingTipDisplay.innerHTML = '<i class="fas fa-info-circle"></i> Keine Tipps verfügbar.';
        }
    }
}

function showFilmView() {
    if (scannerSection) scannerSection.classList.add('hidden');
    if (playerSetupSection) playerSetupSection.classList.add('hidden');
    if (modeSelectionSection) modeSelectionSection.classList.add('hidden');
    if (filmSection) filmSection.classList.remove('hidden');
    if (waitingView) waitingView.classList.add('hidden');
    if (guessModal) guessModal.classList.add('hidden');
    if (roundModal) roundModal.classList.add('hidden');
    if (lobbySection) lobbySection.classList.add('hidden');
    if (spectatorView) spectatorView.classList.add('hidden');
    if (waitTurnView) waitTurnView.classList.add('hidden');

    if (filmTitleElement) filmTitleElement.innerText = '🎬 Film gescannt (geheim)';
    const filmYearSpanElem = document.getElementById('filmYear');
    const filmDirectorSpanElem = document.getElementById('filmDirector');
    if (filmYearSpanElem) filmYearSpanElem.innerHTML = '';
    if (filmDirectorSpanElem) filmDirectorSpanElem.innerHTML = '';
    titleBonusUsed = false;
    directorBonusUsed = false;
    currentTipUsage = 0;
    wasGuessed = false;
    if (nextTipBtn) nextTipBtn.disabled = false;
    if (tipDisplay) tipDisplay.innerHTML = '<i class="fas fa-info-circle"></i> Klicke auf "Tipp anzeigen".';

    updateAvailableTrailers();
    app.currentTrailerIndex = 1;
    app.currentLanguage = 'de';
    updateLanguageButtons();
    loadCurrentTrailer();
    updateFilmPlayerDisplay();
    
    if (gameMode === 'normal') {
        if (askGuessBtn) askGuessBtn.style.display = 'none';
        if (filmPlayerInfo) filmPlayerInfo.style.display = 'none';
        if (nextFilmBtn) {
            nextFilmBtn.style.display = 'inline-flex';
            nextFilmBtn.onclick = () => { showScanner(); };
        }
    } else {
        if (askGuessBtn) askGuessBtn.style.display = 'inline-flex';
        if (filmPlayerInfo) filmPlayerInfo.style.display = 'flex';
        if (nextFilmBtn) nextFilmBtn.style.display = 'none';
    }
}

// ======================== KAMERA (html5-qrcode) ========================
async function startScanner() {
    if (app.scanner) {
        try { await stopScanner(); } catch(e) { console.warn('Stop vor Start fehlgeschlagen', e); }
    }
    if (scanFeedback) {
        scanFeedback.innerText = '⏳ Kamera wird gestartet...';
        scanFeedback.classList.remove('error');
    }
    try {
        const container = document.getElementById('scannerVideoContainer');
        if (container) container.innerHTML = '';
        app.scanner = new Html5Qrcode("scannerVideoContainer");
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
        try {
            await app.scanner.start(
                { facingMode: "environment" },
                config,
                (decodedText) => { handleQRScan({ data: decodedText }); },
                (errorMessage) => { if (errorMessage && !errorMessage.includes("NotFoundException")) console.warn("Scan-Fehler:", errorMessage); }
            );
        } catch (envError) {
            console.warn("Rückkamera fehlgeschlagen, versuche Frontkamera:", envError);
            await app.scanner.start(
                { facingMode: "user" },
                config,
                (decodedText) => { handleQRScan({ data: decodedText }); },
                (errorMessage) => { if (errorMessage && !errorMessage.includes("NotFoundException")) console.warn("Scan-Fehler (Frontkamera):", errorMessage); }
            );
        }
        if (scanFeedback) {
            scanFeedback.innerText = '✅ Kamera aktiv. Scanne QR-Code.';
            scanFeedback.classList.remove('error');
        }
    } catch (error) {
        console.error('Scanner Start Fehler:', error);
        if (scanFeedback) {
            scanFeedback.innerText = '❌ Kamera-Fehler: ' + error.message + '. Klicke auf "Kamera neu starten".';
            scanFeedback.classList.add('error');
        }
    }
}
async function stopScanner() {
    if (!app.scanner) return;
    try {
        await app.scanner.stop();
        await app.scanner.clear();
    } catch(e) { console.warn('Stop Fehler:', e); }
    app.scanner = null;
}
let lastScanTime = 0;
async function handleQRScan(result) {
    if (!app.scanner || !scannerSection.classList.contains('hidden') === false) return;
    const now = Date.now();
    if (now - lastScanTime < 500) return;
    lastScanTime = now;
    const qrData = result.data;
    const filmId = extractFilmId(qrData);
    if (!filmId) {
        invalidCount++;
        if (invalidCount >= 3) {
            if (scanFeedback) {
                scanFeedback.innerText = '❌ QR-Code nicht erkennbar. Helligkeit erhöhen oder anderen Winkel versuchen.';
                setTimeout(() => { 
                    if (scanFeedback && !scannerSection.classList.contains('hidden')) 
                        scanFeedback.innerText = '✅ Kamera aktiv. Scanne QR-Code.'; 
                    invalidCount = 0;
                }, 3000);
            }
        } else {
            if (scanFeedback) {
                scanFeedback.innerText = '❌ Ungültiger QR-Code – bitte Filmkarte scannen';
                setTimeout(() => { 
                    if (scanFeedback && !scannerSection.classList.contains('hidden')) 
                        scanFeedback.innerText = '✅ Kamera aktiv. Scanne QR-Code.'; 
                }, 2000);
            }
        }
        return;
    }
    invalidCount = 0;
    const foundFilm = app.films.find(f => f.Nr === filmId);
    if (!foundFilm) {
        if (scanFeedback) {
            scanFeedback.innerText = `❌ Film #${filmId} nicht in Datenbank`;
            setTimeout(() => { 
                if (scanFeedback && !scannerSection.classList.contains('hidden')) 
                    scanFeedback.innerText = '✅ Kamera aktiv. Scanne QR-Code.'; 
            }, 2000);
        }
        return;
    }
    app.currentFilm = foundFilm;
    await stopScanner();
    console.log('Film gefunden (Name geheim):', foundFilm['Titel Original']);
    
    if (gameMode === 'multiplayer' && isHost) {
        currentFilmData = { film: foundFilm, language: app.currentLanguage };
        broadcastFilmData(foundFilm);
    }
    showFilmView();
}
function extractFilmId(qrData) { 
    let m = qrData.match(/id=(\d+)/); 
    return m ? m[1] : (qrData.match(/^(\d+)$/) || [])[1]; 
}
function getFilmTitle(film) {
    if (app.currentLanguage === 'de' && film['Titel Deutsch'] && film['Titel Deutsch'].trim()) 
        return film['Titel Deutsch'];
    return film['Titel Original'] || 'Unbekannt';
}
async function restartCamera() {
    if (scanFeedback) {
        scanFeedback.innerText = '⏳ Kamera wird neu gestartet...';
        scanFeedback.classList.remove('error');
    }
    try {
        await startScanner();
    } catch(e) {
        console.error('Neustart fehlgeschlagen', e);
        if (scanFeedback) {
            scanFeedback.innerText = '❌ Kamera konnte nicht gestartet werden. Bitte Berechtigungen prüfen.';
            scanFeedback.classList.add('error');
        }
    }
}

// ======================== MULTIPLAYER KERNLOGIK (PeerJS) ========================
function updateLobbyPlayerList() {
    if (!lobbyPlayersUl) return;
    lobbyPlayersUl.innerHTML = '';
    let count = 0;
    for (let [id, p] of Object.entries(multiplayerScores)) {
        if (id !== myPeerId) {
            count++;
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-user"></i> ${escapeHtml(p.name)} <span style="margin-left: auto; font-size:0.8rem;">✅ bereit</span>`;
            lobbyPlayersUl.appendChild(li);
        }
    }
    if (playerCountSpan) playerCountSpan.innerText = count;
    if (startMultiplayerGameBtn) startMultiplayerGameBtn.disabled = (count === 0);
}
function broadcastLobbyState() {
    const message = { type: 'lobby_update', players: multiplayerScores, order: playerOrder };
    connections.forEach(conn => { try { conn.send(message); } catch(e) {} });
    updateLobbyPlayerList();
}
function broadcastFilmData(film) {
    const message = { type: 'film_data', film: film, language: app.currentLanguage };
    connections.forEach(conn => { try { conn.send(message); } catch(e) {} });
}
function broadcastTurnChange() {
    const message = { type: 'turn_change', currentTurnPlayerId: currentTurnPlayerId };
    connections.forEach(conn => { try { conn.send(message); } catch(e) {} });
    updateScoreboard();
    if (currentTurnPlayerId === myPeerId) {
        if (!app.currentFilm) showScanner();
        else showFilmView();
    } else {
        if (currentFilmData) showWaitingScreen(currentFilmData);
        else {
            if (waitingView) waitingView.classList.remove('hidden');
            if (scannerSection) scannerSection.classList.add('hidden');
            if (filmSection) filmSection.classList.add('hidden');
            updateScoreboard();
        }
    }
}
function broadcastScores() {
    const message = { type: 'scoreUpdate', scores: multiplayerScores, order: playerOrder, currentTurn: currentTurnPlayerId };
    connections.forEach(conn => { try { conn.send(message); } catch(e) {} });
    updateScoreboard();
    updateScannerPlayerDisplay();
}
function startMultiplayerGame() {
    playerOrder = [myPeerId];
    for (let id of Object.keys(multiplayerScores)) {
        if (id !== myPeerId) playerOrder.push(id);
    }
    currentTurnPlayerId = myPeerId;
    broadcastLobbyState();
    broadcastTurnChange();
    if (lobbySection) lobbySection.classList.add('hidden');
    showScanner();
}
async function initMultiplayerAsHost() {
    isHost = true;
    gameMode = 'multiplayer';
    const selectedTargetType = document.querySelector('input[name="targetTypeSelect"]:checked')?.value || 'points';
    multiplayerTargetType = selectedTargetType;
    if (selectedTargetType === 'points') multiplayerTargetValue = parseInt(targetScoreSelect?.value) || 30;
    else multiplayerTargetValue = parseInt(guessTargetSelect?.value) || 5;
    roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (modeSelectionSection) modeSelectionSection.classList.add('hidden');
    if (lobbySection) lobbySection.classList.remove('hidden');
    if (lobbyRoomCodeSpan) lobbyRoomCodeSpan.innerText = roomCode;
    if (lobbyQrCodeDiv) lobbyQrCodeDiv.innerHTML = '';
    const joinUrl = window.location.href.split('?')[0] + '?join=' + roomCode;
    if (typeof QRCode !== 'undefined' && lobbyQrCodeDiv) {
        new QRCode(lobbyQrCodeDiv, { text: joinUrl, width: 180, height: 180, colorDark: "#000000", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });
    }
    const joinLink = document.getElementById('lobbyJoinLink');
    if (joinLink) joinLink.href = joinUrl;
    peer = new Peer(roomCode);
    peer.on('open', (id) => {
        myPeerId = id;
        console.log('Host Peer ID:', id);
        playerName = prompt('Dein Name als Host:', 'Host');
        if (!playerName) playerName = 'Host';
        multiplayerScores[myPeerId] = { name: playerName, score: 0, correctGuesses: 0 };
        updateLobbyPlayerList();
    });
    peer.on('connection', (conn) => {
        connections.push(conn);
        conn.on('data', (data) => handleMultiplayerMessage(conn.peer, data));
        conn.on('close', () => {
            connections = connections.filter(c => c.peer !== conn.peer);
            delete multiplayerScores[conn.peer];
            playerOrder = playerOrder.filter(id => id !== conn.peer);
            if (currentTurnPlayerId === conn.peer) {
                let currentIndex = playerOrder.indexOf(currentTurnPlayerId);
                if (currentIndex !== -1) {
                    let nextIndex = (currentIndex + 1) % playerOrder.length;
                    currentTurnPlayerId = playerOrder[nextIndex];
                    broadcastTurnChange();
                }
            }
            updateLobbyPlayerList();
            broadcastScores();
        });
        conn.send({ type: 'lobby_init', players: multiplayerScores, hostId: myPeerId, targetType: multiplayerTargetType, targetValue: multiplayerTargetValue, order: playerOrder, currentTurn: currentTurnPlayerId, currentFilm: currentFilmData ? currentFilmData.film : null });
    });
    peer.on('error', (err) => { console.error('Peer Fehler:', err); alert('Fehler beim Erstellen des Spielraums: ' + err); backToMode(); });
    updateLobbyPlayerList();
    if (startMultiplayerGameBtn) startMultiplayerGameBtn.disabled = true;
}
async function initMultiplayerAsJoiner() {
    const code = roomCodeInput?.value.trim().toUpperCase();
    if (!code) { alert('Bitte Raumcode eingeben'); return; }
    roomCode = code;
    isHost = false;
    gameMode = 'multiplayer';
    const randomId = Math.random().toString(36).substring(2, 10);
    peer = new Peer(randomId);
    peer.on('open', (id) => {
        myPeerId = id;
        playerName = prompt('Dein Name:', 'Spieler');
        if (!playerName) playerName = 'Spieler';
        const conn = peer.connect(roomCode);
        conn.on('open', () => {
            connections.push(conn);
            conn.send({ type: 'join', playerId: myPeerId, name: playerName });
        });
        conn.on('data', (data) => handleMultiplayerMessage(conn.peer, data));
        conn.on('close', () => { alert('Verbindung zum Host verloren'); backToMode(); });
    });
    peer.on('error', (err) => { console.error('Peer Fehler:', err); alert('Beitreten fehlgeschlagen: ' + err); backToMode(); });
    if (waitingView) waitingView.classList.remove('hidden');
    if (scannerSection) scannerSection.classList.add('hidden');
    if (filmSection) filmSection.classList.add('hidden');
    if (modeSelectionSection) modeSelectionSection.classList.add('hidden');
    if (playerSetupSection) playerSetupSection.classList.add('hidden');
}
function handleMultiplayerMessage(senderId, data) {
    if (data.type === 'lobby_init') {
        multiplayerScores = data.players;
        multiplayerTargetType = data.targetType;
        multiplayerTargetValue = data.targetValue;
        playerOrder = data.order || [];
        currentTurnPlayerId = data.currentTurn;
        if (data.currentFilm) {
            currentFilmData = { film: data.currentFilm, language: 'de' };
            if (currentTurnPlayerId !== myPeerId) showWaitingScreen(currentFilmData);
        }
        updateScoreboard();
        updateScannerPlayerDisplay();
        if (modeSelectionSection) modeSelectionSection.classList.add('hidden');
    } else if (data.type === 'join') {
        multiplayerScores[data.playerId] = { name: data.name, score: 0, correctGuesses: 0 };
        if (isHost) {
            if (!playerOrder.includes(data.playerId)) playerOrder.push(data.playerId);
            updateLobbyPlayerList();
            broadcastLobbyState();
        } else {
            updateScoreboard();
        }
    } else if (data.type === 'lobby_update') {
        multiplayerScores = data.players;
        playerOrder = data.order || [];
        updateLobbyPlayerList();
        updateScoreboard();
    } else if (data.type === 'start_game') {
        if (waitingView) waitingView.classList.add('hidden');
        if (currentTurnPlayerId === myPeerId) showScanner();
        else showWaitingScreen(currentFilmData);
        updateScoreboard();
        if (modeSelectionSection) modeSelectionSection.classList.add('hidden');
    } else if (data.type === 'film_data') {
        currentFilmData = { film: data.film, language: data.language || 'de' };
        if (currentTurnPlayerId !== myPeerId) showWaitingScreen(currentFilmData);
    } else if (data.type === 'turn_change') {
        currentTurnPlayerId = data.currentTurnPlayerId;
        if (currentTurnPlayerId === myPeerId) {
            if (app.currentFilm) showFilmView();
            else showScanner();
        } else {
            if (currentFilmData) showWaitingScreen(currentFilmData);
            else {
                if (waitingView) waitingView.classList.remove('hidden');
                if (scannerSection) scannerSection.classList.add('hidden');
                if (filmSection) filmSection.classList.add('hidden');
            }
        }
        updateScoreboard();
    } else if (data.type === 'scoreUpdate') {
        if (isHost && multiplayerScores[senderId]) {
            multiplayerScores[senderId].score = data.score;
            multiplayerScores[senderId].correctGuesses = data.correctGuesses;
            updateScoreboard();
            broadcastScores();
        } else if (!isHost) {
            multiplayerScores = data.scores;
            playerOrder = data.order || playerOrder;
            currentTurnPlayerId = data.currentTurn;
            updateScoreboard();
            updateScannerPlayerDisplay();
        }
    } else if (data.type === 'round_complete') {
        if (isHost) {
            let currentIndex = playerOrder.indexOf(currentTurnPlayerId);
            let nextIndex = (currentIndex + 1) % playerOrder.length;
            currentTurnPlayerId = playerOrder[nextIndex];
            broadcastTurnChange();
            broadcastScores();
            app.currentFilm = null;
            currentFilmData = null;
            if (currentTurnPlayerId === myPeerId) showScanner();
            else showWaitingScreen(null);
        } else {
            // Client wartet auf turn_change
        }
    }
}
function updateMultiplayerScore(peerId, newScore, newCorrectGuesses) {
    if (multiplayerScores[peerId]) {
        multiplayerScores[peerId].score = newScore;
        multiplayerScores[peerId].correctGuesses = newCorrectGuesses;
        updateScoreboard();
        if (isHost) broadcastScores();
        else {
            const conn = connections[0];
            if (conn) conn.send({ type: 'scoreUpdate', score: newScore, correctGuesses: newCorrectGuesses });
        }
    }
}
function backToMode() {
    if (peer) { try { peer.destroy(); } catch(e) {} peer = null; }
    if (lobbySection) lobbySection.classList.add('hidden');
    if (waitingView) waitingView.classList.add('hidden');
    if (spectatorView) spectatorView.classList.add('hidden');
    if (waitTurnView) waitTurnView.classList.add('hidden');
    clearAllGameData();
    showModeSelection();
}

// ======================== GUESS MODAL (Nur Turnier) ========================
function openGuessModal() {
    if (gameMode !== 'tournament') return;
    if (!app.currentFilm) return;
    if (guessFilmTitleSpan) guessFilmTitleSpan.innerText = getFilmTitle(app.currentFilm);
    if (currentPlayerNameSpan && players.length > 0 && currentPlayerIndex < players.length) {
        currentPlayerNameSpan.innerText = players[currentPlayerIndex].name;
    } else {
        currentPlayerNameSpan.innerText = '?';
    }
    if (guessModal) guessModal.classList.remove('hidden');
}
function closeGuessModal() { if (guessModal) guessModal.classList.add('hidden'); }

// ======================== PUNKTEVERGABE (ROUND SUMMARY) Nur Turnier ========================
function openRoundSummary() {
    if (gameMode === 'multiplayer') {
        if (!app.currentFilm) return;
        const roundTotal = roundBasePoints - currentTipUsage;
        const myData = multiplayerScores[myPeerId];
        if (myData) {
            const newScore = myData.score + roundTotal;
            const newCorrect = myData.correctGuesses + (wasGuessed ? 1 : 0);
            updateMultiplayerScore(myPeerId, newScore, newCorrect);
        }
        closeRoundSummary();
        if (isHost) {
            connections.forEach(conn => { try { conn.send({ type: 'round_complete' }); } catch(e) {} });
            let currentIndex = playerOrder.indexOf(currentTurnPlayerId);
            let nextIndex = (currentIndex + 1) % playerOrder.length;
            currentTurnPlayerId = playerOrder[nextIndex];
            broadcastTurnChange();
            broadcastScores();
            app.currentFilm = null;
            currentFilmData = null;
            if (currentTurnPlayerId === myPeerId) showScanner();
            else showWaitingScreen(null);
        } else {
            const conn = connections[0];
            if (conn) conn.send({ type: 'round_complete' });
            if (waitingView) waitingView.classList.remove('hidden');
            if (scannerSection) scannerSection.classList.add('hidden');
            if (filmSection) filmSection.classList.add('hidden');
        }
        return;
    }
    if (gameMode !== 'tournament') return;
    if (!app.currentFilm) return;
    tempTitleBonus = 0;
    tempDirectorBonus = 0;
    titleBonusUsed = false;
    directorBonusUsed = false;
    if (basePointsSpan) basePointsSpan.innerText = roundBasePoints;
    if (titlePointsSpan) titlePointsSpan.innerText = 0;
    if (directorPointsSpan) directorPointsSpan.innerText = 0;
    if (tipCountSpan) tipCountSpan.innerText = currentTipUsage;
    if (tipPenaltySpan) tipPenaltySpan.innerText = currentTipUsage;
    let roundTotal = roundBasePoints - currentTipUsage;
    if (roundTotalSpan) roundTotalSpan.innerText = roundTotal;
    if (roundBasePoints > 0) {
        if (addTitlePointsBtn) addTitlePointsBtn.disabled = false;
        if (addDirectorPointsBtn) addDirectorPointsBtn.disabled = false;
    } else {
        if (addTitlePointsBtn) addTitlePointsBtn.disabled = true;
        if (addDirectorPointsBtn) addDirectorPointsBtn.disabled = true;
    }
    if (roundModal) roundModal.classList.remove('hidden');
}
function closeRoundSummary() { if (roundModal) roundModal.classList.add('hidden'); }

// ======================== TRAILER & TIPPS ========================
function updateAvailableTrailers() {
    app.availableTrailers = [];
    if (!app.currentFilm) return;
    for (let i=1;i<=3;i++) {
        const key = `App-Link_Video-${i}_${app.currentLanguage.toUpperCase()}`;
        if (app.currentFilm[key] && app.currentFilm[key].trim()) app.availableTrailers.push(i);
    }
}
function loadCurrentTrailer() {
    if (!app.currentFilm || !app.availableTrailers.length) {
        if (trailerVideo) trailerVideo.src = '';
        if (trailerCounter) trailerCounter.innerText = 'Kein Trailer';
        return;
    }
    if (!app.availableTrailers.includes(app.currentTrailerIndex)) app.currentTrailerIndex = app.availableTrailers[0];
    const key = `App-Link_Video-${app.currentTrailerIndex}_${app.currentLanguage.toUpperCase()}`;
    const url = app.currentFilm[key];
    if (url && trailerVideo) {
        trailerVideo.src = url;
        trailerVideo.load();
        updateTrailerCounter();
        updateNavButtons();
    }
}
function updateTrailerCounter() { const pos = app.availableTrailers.indexOf(app.currentTrailerIndex)+1; if (trailerCounter) trailerCounter.innerText = `Trailer ${pos}/${app.availableTrailers.length}`; }
function updateNavButtons() {
    if (!prevTrailerBtn || !nextTrailerBtn) return;
    const pos = app.availableTrailers.indexOf(app.currentTrailerIndex);
    prevTrailerBtn.disabled = pos<=0;
    nextTrailerBtn.disabled = pos>=app.availableTrailers.length-1;
}
function nextTrailer() { const pos = app.availableTrailers.indexOf(app.currentTrailerIndex); if (pos < app.availableTrailers.length-1) { app.currentTrailerIndex = app.availableTrailers[pos+1]; loadCurrentTrailer(); } }
function prevTrailer() { const pos = app.availableTrailers.indexOf(app.currentTrailerIndex); if (pos > 0) { app.currentTrailerIndex = app.availableTrailers[pos-1]; loadCurrentTrailer(); } }
function switchLanguage(lang) { if (lang===app.currentLanguage) return; app.currentLanguage=lang; app.currentTrailerIndex=1; updateLanguageButtons(); updateAvailableTrailers(); loadCurrentTrailer(); }
function updateLanguageButtons() { langBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === app.currentLanguage)); }
function showNextTip() {
    if (!app.currentFilm) return;
    const facts = app.funFactsMap.get(app.currentFilm.Nr);
    if (!facts || !facts.hinweise || !facts.hinweise.length) {
        if (tipDisplay) tipDisplay.innerHTML = '<i class="fas fa-ban"></i> Keine Hinweise verfügbar.';
        return;
    }
    let tipText = '';
    if (currentTipUsage === 0) tipText = facts.hinweise[0] || 'Schwerer Hinweis';
    else if (currentTipUsage === 1) tipText = facts.hinweise[1] || facts.hinweise[0];
    else tipText = facts.hinweise[2] || facts.hinweise[facts.hinweise.length-1];
    currentTipUsage++;
    if (currentTipUsage >= 3 && nextTipBtn) nextTipBtn.disabled = true;
    if (tipOverlayText) tipOverlayText.innerText = tipText;
    if (tipOverlay) tipOverlay.classList.remove('hidden');
    if (tipDisplay) tipDisplay.innerHTML = `<i class="fas fa-lightbulb"></i> ${escapeHtml(tipText)}`;
}
function closeTipOverlay() { if (tipOverlay) tipOverlay.classList.add('hidden'); }

// ======================== SPIELENDE LOGIK (Turnier) ========================
function checkWinConditionAndSetEndFlag(currentPlayer) {
    if (endAfterCurrentRound) return;
    if (targetType === 'points') {
        if (currentPlayer.totalScore >= targetScore) {
            endAfterCurrentRound = true;
            endRoundPlayerIndex = (currentPlayerIndex - 1 + players.length) % players.length;
        }
    } else {
        if (currentPlayer.correctGuesses >= guessTarget) {
            endAfterCurrentRound = true;
            endRoundPlayerIndex = (currentPlayerIndex - 1 + players.length) % players.length;
        }
    }
}
function endGameAndShowWinner(isAutoEnd = false) {
    if (gameMode === 'multiplayer') {
        let maxScore = -1, winners = [];
        for (let id of playerOrder) {
            let p = multiplayerScores[id];
            if (p && p.score > maxScore) { maxScore = p.score; winners = [p.name]; }
            else if (p && p.score === maxScore) winners.push(p.name);
        }
        if (winners.length === 1) alert(`🏆 SIEGER: ${winners[0]} mit ${maxScore} Punkten! 🏆`);
        else alert(`🏆 Unentschieden zwischen: ${winners.join(', ')} mit ${maxScore} Punkten. 🏆`);
        backToMode();
        return;
    }
    if (gameMode !== 'tournament' || players.length === 0) {
        alert('Kein aktives Turnier.');
        return;
    }
    let maxScore = -1, winners = [];
    players.forEach(p => {
        if (p.totalScore > maxScore) { maxScore = p.totalScore; winners = [p.name]; }
        else if (p.totalScore === maxScore) winners.push(p.name);
    });
    if (winners.length === 1) alert(`🏆 SIEGER: ${winners[0]} mit ${maxScore} Punkten! 🏆`);
    else alert(`🏆 Unentschieden zwischen: ${winners.join(', ')} mit ${maxScore} Punkten. 🏆`);
    clearAllGameData();
    showModeSelection();
}

// ======================== BUTTON-HANDLER ========================
function initRoundSummaryHandlers() {
    if (addTitlePointsBtn) {
        addTitlePointsBtn.onclick = () => {
            if (titleBonusUsed) return;
            titleBonusUsed = true;
            tempTitleBonus++;
            if (titlePointsSpan) titlePointsSpan.innerText = tempTitleBonus;
            let total = roundBasePoints + tempTitleBonus + tempDirectorBonus - currentTipUsage;
            if (roundTotalSpan) roundTotalSpan.innerText = total;
            addTitlePointsBtn.disabled = true;
        };
    }
    if (addDirectorPointsBtn) {
        addDirectorPointsBtn.onclick = () => {
            if (directorBonusUsed) return;
            directorBonusUsed = true;
            tempDirectorBonus++;
            if (directorPointsSpan) directorPointsSpan.innerText = tempDirectorBonus;
            let total = roundBasePoints + tempTitleBonus + tempDirectorBonus - currentTipUsage;
            if (roundTotalSpan) roundTotalSpan.innerText = total;
            addDirectorPointsBtn.disabled = true;
        };
    }
    if (confirmRoundBtn) {
        confirmRoundBtn.onclick = () => {
            try {
                if (!app.currentFilm) {
                    alert('Fehler: Kein Film geladen.');
                    closeRoundSummary();
                    showScanner();
                    return;
                }
                const roundTotal = roundBasePoints + tempTitleBonus + tempDirectorBonus - currentTipUsage;
                const currentPlayer = players[currentPlayerIndex];
                if (currentPlayer) {
                    currentPlayer.totalScore += roundTotal;
                    if (wasGuessed) {
                        currentPlayer.correctGuesses = (currentPlayer.correctGuesses || 0) + 1;
                    }
                    currentPlayer.rounds.push({
                        filmTitle: getFilmTitle(app.currentFilm),
                        basePoints: roundBasePoints,
                        titleBonus: tempTitleBonus,
                        directorBonus: tempDirectorBonus,
                        tipPenalty: currentTipUsage,
                        roundTotal: roundTotal,
                        wasGuessed: wasGuessed
                    });
                }
                savePlayersToLocal();
                updateScoreboard();
                updateScannerPlayerDisplay();
                updateFilmPlayerDisplay();
                
                checkWinConditionAndSetEndFlag(currentPlayer);
                const finishedPlayerIndex = currentPlayerIndex;
                currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
                
                if (endAfterCurrentRound && finishedPlayerIndex === endRoundPlayerIndex) {
                    closeRoundSummary();
                    endGameAndShowWinner(true);
                    return;
                }
                
                closeRoundSummary();
                showScanner();
            } catch (err) {
                console.error('Fehler beim Speichern der Runde:', err);
                alert('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
                closeRoundSummary();
                showScanner();
            }
        };
    }
}
function initGuessHandlers() {
    if (guessYesBtn) {
        guessYesBtn.onclick = () => {
            closeGuessModal();
            wasGuessed = true;
            roundBasePoints = parseInt(app.currentFilm.Schwierigkeit) || 3;
            openRoundSummary();
        };
    }
    if (guessNoBtn) {
        guessNoBtn.onclick = () => {
            closeGuessModal();
            wasGuessed = false;
            roundBasePoints = 0;
            openRoundSummary();
            if (tipDisplay) tipDisplay.innerHTML = '<i class="fas fa-info-circle"></i> Du hast den Film nicht erraten. Tipps kosten je 1 Punkt, aber es gibt keine Basis- oder Zusatzpunkte.';
        };
    }
}
function setupModeSelection() {
    const updateSettings = () => {
        const selected = document.querySelector('input[name="gameModeSelect"]:checked')?.value;
        if (tournamentSettingsSelectDiv) tournamentSettingsSelectDiv.style.display = (selected === 'tournament') ? 'block' : 'none';
        if (multiplayerSettingsDiv) multiplayerSettingsDiv.style.display = (selected === 'multiplayer') ? 'block' : 'none';
    };
    modeRadiosSelect.forEach(radio => radio.addEventListener('change', updateSettings));
    updateSettings();
    const updateTargetTypeVisibility = () => {
        const targetTypeVal = document.querySelector('input[name="targetTypeSelect"]:checked')?.value;
        if (targetTypeVal === 'points') {
            if (pointsTargetGroupSelect) pointsTargetGroupSelect.style.display = 'block';
            if (guessesTargetGroupSelect) guessesTargetGroupSelect.style.display = 'none';
        } else {
            if (pointsTargetGroupSelect) pointsTargetGroupSelect.style.display = 'none';
            if (guessesTargetGroupSelect) guessesTargetGroupSelect.style.display = 'block';
        }
    };
    targetTypeRadiosSelect.forEach(radio => radio.addEventListener('change', updateTargetTypeVisibility));
    updateTargetTypeVisibility();
    if (hostGameBtn) hostGameBtn.onclick = () => { initMultiplayerAsHost(); };
    if (joinGameBtn) joinGameBtn.onclick = () => { if (joinGamePanel) joinGamePanel.style.display = 'block'; };
    if (confirmJoinBtn) confirmJoinBtn.onclick = async () => { await initMultiplayerAsJoiner(); };
    if (confirmModeBtn) {
        confirmModeBtn.onclick = () => {
            const selectedMode = document.querySelector('input[name="gameModeSelect"]:checked')?.value;
            if (selectedMode === 'multiplayer') return;
            gameMode = selectedMode;
            if (gameMode === 'tournament') {
                targetType = document.querySelector('input[name="targetTypeSelect"]:checked')?.value || 'points';
                targetScore = parseInt(targetScoreSelect?.value) || 30;
                guessTarget = parseInt(guessTargetSelect?.value) || 5;
                players = [];
                updatePlayerListUI();
                showPlayerSetup();
            } else {
                players = [];
                gameMode = 'normal';
                showScanner();
            }
        };
    }
}
function setupEventListeners() {
    initGuessHandlers();
    initRoundSummaryHandlers();
    setupModeSelection();

    if (addPlayerBtn) addPlayerBtn.addEventListener('click', () => addPlayer(newPlayerNameInput ? newPlayerNameInput.value : ''));
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            if (players.length === 0) { alert('Bitte füge zuerst Spieler hinzu.'); return; }
            currentPlayerIndex = getRandomStartPlayer();
            alert(`Startspieler: ${players[currentPlayerIndex].name}`);
            updateScoreboard();
            updateScannerPlayerDisplay();
            endAfterCurrentRound = false;
            endRoundPlayerIndex = null;
            showScanner();
        });
    }
    if (backToModeBtn) backToModeBtn.addEventListener('click', () => {
        clearAllGameData();
        showModeSelection();
    });
    if (backToSetupFromScannerBtn) backToSetupFromScannerBtn.addEventListener('click', async () => {
        await stopScanner();
        if (gameMode === 'tournament') showPlayerSetup();
        else if (gameMode === 'multiplayer') backToMode();
        else { clearAllGameData(); showModeSelection(); }
    });
    if (endGameBtn) endGameBtn.addEventListener('click', () => endGameAndShowWinner(false));
    if (askGuessBtn) askGuessBtn.addEventListener('click', openGuessModal);
    if (langBtns.length) langBtns.forEach(btn => btn.addEventListener('click', () => switchLanguage(btn.dataset.lang)));
    if (prevTrailerBtn) prevTrailerBtn.addEventListener('click', prevTrailer);
    if (nextTrailerBtn) nextTrailerBtn.addEventListener('click', nextTrailer);
    if (toggleCameraBtn) toggleCameraBtn.disabled = true;
    if (toggleFlashBtn) toggleFlashBtn.disabled = true;
    if (retryCameraBtn) retryCameraBtn.addEventListener('click', () => restartCamera());
    if (retryButton) retryButton.addEventListener('click', () => location.reload());
    if (nextTipBtn) nextTipBtn.addEventListener('click', showNextTip);
    if (closeTipOverlayBtn) closeTipOverlayBtn.addEventListener('click', closeTipOverlay);
    if (tipOverlayCloseBtn) tipOverlayCloseBtn.addEventListener('click', closeTipOverlay);
    if (trailerVideo) trailerVideo.addEventListener('ended', () => setTimeout(nextTrailer, 1000));
    if (startMultiplayerGameBtn) startMultiplayerGameBtn.addEventListener('click', () => {
        const playerCount = Object.keys(multiplayerScores).filter(id => id !== myPeerId).length;
        if (playerCount === 0) { alert('Warte auf Spieler...'); return; }
        startMultiplayerGame();
    });
    if (backToModeFromLobbyBtn) backToModeFromLobbyBtn.addEventListener('click', () => backToMode());
    if (cancelWaitBtn) cancelWaitBtn.addEventListener('click', () => backToMode());
    
    // Datei-Upload Workaround für Kamera-Probleme
    const uploadBtn = document.createElement('button');
    uploadBtn.textContent = '📁 QR-Code aus Bild laden';
    uploadBtn.className = 'secondary-btn';
    uploadBtn.style.marginTop = '0.5rem';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    const cameraTools = document.querySelector('.camera-tools');
    if (cameraTools && !document.getElementById('uploadBtn')) {
        uploadBtn.id = 'uploadBtn';
        fileInput.id = 'fileInput';
        cameraTools.parentNode.insertBefore(uploadBtn, cameraTools.nextSibling);
        cameraTools.parentNode.insertBefore(fileInput, uploadBtn.nextSibling);
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const tempScanner = new Html5Qrcode("scannerVideoContainer");
            try {
                const decodedText = await tempScanner.scanFile(file, false);
                handleQRScan({ data: decodedText });
            } catch (err) { alert("QR-Code in Datei nicht erkennbar: " + err); }
            finally { tempScanner.clear(); startScanner(); fileInput.value = ''; }
        });
    }
}

function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => m==='&'?'&amp;':(m==='<'?'&lt;':'&gt;')); }