/**
 * Filmster – Multiplayer-Edition
 * - Modus-Auswahl: Einzel (manuell), Einzel (Turnier), Multiplayer (Host/Join)
 * - Multiplayer: PeerJS basierte Echtzeit-Synchronisation
 * - Host erstellt Raum mit Code, Spieler treten bei
 * - Punktestand wird live an alle synchronisiert
 * - QR-Code-Erkennung mit html5-qrcode, Fallback Datei-Upload
 */

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

// Spielzustand
let players = [];
let currentPlayerIndex = 0;
let gameMode = 'normal'; // normal, tournament, multiplayer
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
let invalidCount = 0;
let endAfterCurrentRound = false;
let endRoundPlayerIndex = null;

// Multiplayer
let peer = null;
let isHost = false;
let roomCode = null;
let connections = []; // Array von PeerJS DataConnections
let myPeerId = null;
let playerName = null;
let multiplayerScores = {}; // { peerId: { name, score, correctGuesses } }
let lobbySection, lobbyRoomCodeSpan, lobbyQrCodeDiv, lobbyPlayersUl, playerCountSpan, startMultiplayerGameBtn, backToModeFromLobbyBtn;
let multiplayerTargetType = 'points';
let multiplayerTargetValue = 30;

// DOM-Elemente
let modeSelectionSection, playerSetupSection, scannerSection, filmSection, guessModal, roundModal;
let scannerVideoContainer, scanFeedback, loadingOverlay, errorOverlay, errorMessage, retryButton;
let trailerVideo, prevTrailerBtn, nextTrailerBtn, trailerCounter;
let langBtns, toggleCameraBtn, toggleFlashBtn, retryCameraBtn, nextTipBtn, tipDisplay, tipOverlay, tipOverlayText;
let closeTipOverlayBtn, tipOverlayCloseBtn, backToSetupFromScannerBtn, askGuessBtn, nextFilmBtn;
let playerListUl, newPlayerNameInput, addPlayerBtn, startGameBtn, backToModeBtn;
let endGameBtn;
let basePointsSpan, titlePointsSpan, directorPointsSpan, tipCountSpan, tipPenaltySpan, roundTotalSpan;
let addTitlePointsBtn, addDirectorPointsBtn, confirmRoundBtn;
let guessFilmTitleSpan, currentPlayerNameSpan, guessYesBtn, guessNoBtn;
let scannerPlayerNameSpan, scannerPlayerScoreSpan;
let filmCurrentPlayerSpan, filmCurrentScoreSpan, filmPlayerInfo, filmTitleElement;
let modeRadiosSelect, targetTypeRadiosSelect, targetScoreSelect, guessTargetSelect, confirmModeBtn;
let tournamentSettingsSelectDiv, pointsTargetGroupSelect, guessesTargetGroupSelect;
let multiplayerSettingsDiv, hostGameBtn, joinGameBtn, joinGamePanel, roomCodeInput, confirmJoinBtn, hostInfoPanel, roomCodeDisplay;

// ======================== INIT ========================
document.addEventListener('DOMContentLoaded', async () => {
    if (app.isInitialized) return;
    app.isInitialized = true;

    // DOM-Referenzen
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
    lobbySection = document.getElementById('lobbySection');
    lobbyRoomCodeSpan = document.getElementById('lobbyRoomCode');
    lobbyQrCodeDiv = document.getElementById('lobbyQrCode');
    lobbyPlayersUl = document.getElementById('lobbyPlayersUl');
    playerCountSpan = document.getElementById('playerCount');
    startMultiplayerGameBtn = document.getElementById('startMultiplayerGameBtn');
    backToModeFromLobbyBtn = document.getElementById('backToModeFromLobbyBtn');
    
    // Modus-Auswahl Elemente
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
    hostInfoPanel = document.getElementById('hostInfoPanel');
    roomCodeDisplay = document.getElementById('roomCodeDisplay');

    // Daten laden
    await loadFilms();
    await loadFunFacts();
    await waitForQrScanner();
    
    // Event-Listener
    setupEventListeners();
    
    // Alle gespeicherten Daten löschen
    clearAllGameData();
    
    // Modus-Auswahl anzeigen
    showModeSelection();
    
    loadingOverlay.style.display = 'none';
    console.log('✅ App bereit');
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
    
    // Multiplayer zurücksetzen
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
    
    localStorage.removeItem('filmsterData');
    
    if (lobbyPlayersUl) lobbyPlayersUl.innerHTML = '';
    if (playerCountSpan) playerCountSpan.innerText = '0';
    if (startMultiplayerGameBtn) startMultiplayerGameBtn.disabled = true;
    if (scannerPlayerNameSpan) scannerPlayerNameSpan.innerText = '—';
    if (scannerPlayerScoreSpan) scannerPlayerScoreSpan.innerText = '0';
    updateScoreboard();
}

// ======================== SPIELERVERWALTUNG (Einzel) ========================
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
        html += `<ul>`;
        Object.values(multiplayerScores).forEach(p => {
            html += `<li><strong>${escapeHtml(p.name)}</strong>: ${p.score} Pkt. (${p.correctGuesses || 0} erraten)</li>`;
        });
        html += `</ul>`;
        scoreboardDiv.innerHTML = html;
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
    modeSelectionSection.classList.remove('hidden');
    playerSetupSection.classList.add('hidden');
    scannerSection.classList.add('hidden');
    filmSection.classList.add('hidden');
    if (guessModal) guessModal.classList.add('hidden');
    if (roundModal) roundModal.classList.add('hidden');
    
    // Multiplayer-Einstellungen zurücksetzen
    if (multiplayerSettingsDiv) multiplayerSettingsDiv.style.display = 'none';
    if (joinGamePanel) joinGamePanel.style.display = 'none';
    if (hostInfoPanel) hostInfoPanel.style.display = 'none';
}

function showPlayerSetup() {
    modeSelectionSection.classList.add('hidden');
    playerSetupSection.classList.remove('hidden');
    scannerSection.classList.add('hidden');
    filmSection.classList.add('hidden');
    if (guessModal) guessModal.classList.add('hidden');
    if (roundModal) roundModal.classList.add('hidden');
}

async function showScanner() {
    modeSelectionSection.classList.add('hidden');
    playerSetupSection.classList.add('hidden');
    scannerSection.classList.remove('hidden');
    filmSection.classList.add('hidden');
    if (guessModal) guessModal.classList.add('hidden');
    if (roundModal) roundModal.classList.add('hidden');
    updateScoreboard();
    updateScannerPlayerDisplay();
    await startScanner();
}

function showFilmView() {
    if (scannerSection) scannerSection.classList.add('hidden');
    if (playerSetupSection) playerSetupSection.classList.add('hidden');
    if (modeSelectionSection) modeSelectionSection.classList.add('hidden');
    if (filmSection) filmSection.classList.remove('hidden');
    if (guessModal) guessModal.classList.add('hidden');
    if (roundModal) roundModal.classList.add('hidden');

    if (filmTitleElement) filmTitleElement.innerText = '🎬 Film gescannt (geheim)';
    document.getElementById('filmYear').innerHTML = '';
    document.getElementById('filmDirector').innerHTML = '';
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
            nextFilmBtn.onclick = () => {
                showScanner();
            };
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
            qrbox: { width: 300, height: 300 },
            aspectRatio: 1.0,
            disableFlip: false,
            videoConstraints: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        await app.scanner.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                console.log("✅ QR-Code erkannt:", decodedText);
                handleQRScan({ data: decodedText });
            },
            (errorMessage) => {
                if (errorMessage && !errorMessage.includes("NotFoundException")) {
                    console.warn("Scan-Fehler:", errorMessage);
                }
            }
        );

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
                scanFeedback.innerText = '❌ QR-Code nicht erkennbar. Bei roten/grünen Codes: Helligkeit erhöhen oder anderen Winkel versuchen.';
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

// ======================== MULTIPLAYER FUNKTIONEN ========================
async function initMultiplayerAsHost() {
    isHost = true;
    gameMode = 'multiplayer';
    
    // Zufälligen Raumcode (6 Zeichen)
    roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Lobby-Bereich anzeigen
    modeSelectionSection.classList.add('hidden');
    lobbySection.classList.remove('hidden');
    lobbyRoomCodeSpan.innerText = roomCode;
    
    // QR-Code generieren (mit QRCode.js)
    lobbyQrCodeDiv.innerHTML = '';
    const joinUrl = window.location.href.split('?')[0] + '?join=' + roomCode;
    if (typeof QRCode !== 'undefined') {
        new QRCode(lobbyQrCodeDiv, {
            text: joinUrl,
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        lobbyQrCodeDiv.innerHTML = '<p>QR-Code konnte nicht geladen werden.</p>';
    }
    const joinLink = document.getElementById('lobbyJoinLink');
    if (joinLink) joinLink.href = joinUrl;
    
    // Peer-Server starten
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
        console.log('Neuer Spieler verbunden:', conn.peer);
        connections.push(conn);
        
        conn.on('data', (data) => {
            handleMultiplayerMessage(conn.peer, data);
        });
        
        conn.on('close', () => {
            console.log('Spieler getrennt:', conn.peer);
            connections = connections.filter(c => c.peer !== conn.peer);
            delete multiplayerScores[conn.peer];
            updateLobbyPlayerList();
            broadcastScores();
        });
        
        // Lobby-Info an den neuen Spieler senden
        conn.send({ 
            type: 'lobby_init', 
            players: multiplayerScores, 
            hostId: myPeerId,
            targetType: multiplayerTargetType,
            targetValue: multiplayerTargetValue
        });
    });
    
    peer.on('error', (err) => {
        console.error('Peer Fehler:', err);
        alert('Fehler beim Erstellen des Spielraums: ' + err);
        backToMode();
    });
    
    updateLobbyPlayerList();
    startMultiplayerGameBtn.disabled = true; // zunächst deaktiviert
}

async function initMultiplayerAsJoiner() {
    const code = roomCodeInput.value.trim().toUpperCase();
    if (!code) {
        alert('Bitte Raumcode eingeben');
        return;
    }
    roomCode = code;
    isHost = false;
    gameMode = 'multiplayer';
    
    const randomId = Math.random().toString(36).substring(2, 10);
    peer = new Peer(randomId);
    
    peer.on('open', (id) => {
        myPeerId = id;
        console.log('Joiner Peer ID:', id);
        playerName = prompt('Dein Name:', 'Spieler');
        if (!playerName) playerName = 'Spieler';
        
        const conn = peer.connect(roomCode);
        conn.on('open', () => {
            console.log('Verbunden mit Host');
            connections.push(conn);
            conn.send({ type: 'join', playerId: myPeerId, name: playerName });
        });
        
        conn.on('data', (data) => {
            handleMultiplayerMessage(conn.peer, data);
        });
        
        conn.on('close', () => {
            console.log('Verbindung zum Host getrennt');
            alert('Verbindung zum Host verloren');
            backToMode();
        });
    });
    
    peer.on('error', (err) => {
        console.error('Peer Fehler:', err);
        alert('Beitreten fehlgeschlagen: ' + err);
        backToMode();
    });
    
    // Warte-Bildschirm anzeigen, bis Host startet
    showWaitingForHost();
}

function handleMultiplayerMessage(senderId, data) {
    if (data.type === 'lobby_init') {
        // Spieler erhält Lobby-Info vom Host
        multiplayerScores = data.players;
        multiplayerTargetType = data.targetType;
        multiplayerTargetValue = data.targetValue;
        updateScoreboard();
        updateScannerPlayerDisplay();
        // Spieler bleibt im Warte-Bildschirm
    } else if (data.type === 'join') {
        // Spieler tritt bei (nur Host)
        multiplayerScores[data.playerId] = { name: data.name, score: 0, correctGuesses: 0 };
        updateLobbyPlayerList();
        broadcastLobbyState();
    } else if (data.type === 'lobby_update') {
        // Host aktualisiert Spielerliste
        multiplayerScores = data.players;
        updateLobbyPlayerList();
    } else if (data.type === 'start_game') {
        // Host startet Spiel – Spieler verlässt Warte-Bildschirm
        const waitingDiv = document.getElementById('waitingForHost');
        if (waitingDiv) waitingDiv.classList.add('hidden');
        showScanner();
    } else if (data.type === 'scoreUpdate') {
        if (isHost && multiplayerScores[senderId]) {
            multiplayerScores[senderId].score = data.score;
            multiplayerScores[senderId].correctGuesses = data.correctGuesses;
            updateScoreboard();
            broadcastScores();
        } else if (!isHost) {
            multiplayerScores = data.scores;
            updateScoreboard();
            updateScannerPlayerDisplay();
        }
    }
}

function broadcastScores() {
    const message = { type: 'scoreUpdate', scores: multiplayerScores };
    connections.forEach(conn => {
        try { conn.send(message); } catch(e) { console.warn('Send fehlgeschlagen', e); }
    });
    // Eigenes UI aktualisieren
    updateScoreboard();
    updateScannerPlayerDisplay();
}

function updateMultiplayerScore(peerId, newScore, newCorrectGuesses) {
    if (multiplayerScores[peerId]) {
        multiplayerScores[peerId].score = newScore;
        multiplayerScores[peerId].correctGuesses = newCorrectGuesses;
        updateScoreboard();
        if (isHost) {
            broadcastScores();
        } else {
            // Als Client: Update an Host senden
            const conn = connections[0];
            if (conn) {
                conn.send({ type: 'scoreUpdate', score: newScore, correctGuesses: newCorrectGuesses });
            }
        }
    }
}

function backToMode() {
    if (peer) {
        try { peer.destroy(); } catch(e) {}
        peer = null;
    }
    // Lobby-UI verstecken
    if (lobbySection) lobbySection.classList.add('hidden');
    const waitingDiv = document.getElementById('waitingForHost');
    if (waitingDiv) waitingDiv.classList.add('hidden');
    clearAllGameData();
    showModeSelection();
}

// ======================== MULTIPLAYER LOBBY & SPIELSTART ========================

function updateLobbyPlayerList() {
    if (!lobbyPlayersUl) return;
    lobbyPlayersUl.innerHTML = '';
    let count = 0;
    for (let [id, p] of Object.entries(multiplayerScores)) {
        // Host selbst wird nicht in der Liste angezeigt (kann optional hinzugefügt werden)
        if (id !== myPeerId) {
            count++;
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-user"></i> ${escapeHtml(p.name)} <span style="margin-left: auto; font-size:0.8rem;">✅ bereit</span>`;
            lobbyPlayersUl.appendChild(li);
        }
    }
    if (playerCountSpan) playerCountSpan.innerText = count;
    // Start-Button aktivieren, sobald mindestens ein Spieler da ist
    if (startMultiplayerGameBtn) startMultiplayerGameBtn.disabled = (count === 0);
}

function broadcastLobbyState() {
    const message = { type: 'lobby_update', players: multiplayerScores };
    connections.forEach(conn => {
        try { conn.send(message); } catch(e) {}
    });
    updateLobbyPlayerList();
}

function showWaitingForHost() {
    // Für Spieler: Warte-Bildschirm anzeigen
    let waitingDiv = document.getElementById('waitingForHost');
    if (!waitingDiv) {
        waitingDiv = document.createElement('div');
        waitingDiv.id = 'waitingForHost';
        waitingDiv.className = 'setup-section';
        waitingDiv.innerHTML = `<div class="glass-card"><h2><i class="fas fa-hourglass-half"></i> Warte auf Spielstart</h2><p>Der Host startet das Spiel gleich...</p><button id="cancelWaitBtn" class="secondary-btn">Abbrechen</button></div>`;
        document.querySelector('.app-main').appendChild(waitingDiv);
        document.getElementById('cancelWaitBtn')?.addEventListener('click', () => backToMode());
    }
    waitingDiv.classList.remove('hidden');
    // Andere Sektionen ausblenden
    modeSelectionSection.classList.add('hidden');
    playerSetupSection.classList.add('hidden');
    scannerSection.classList.add('hidden');
    filmSection.classList.add('hidden');
    if (lobbySection) lobbySection.classList.add('hidden');
}

function startMultiplayerGame() {
    // Host startet das Spiel
    if (lobbySection) lobbySection.classList.add('hidden');
    // Allen verbundenen Spielern Bescheid geben
    connections.forEach(conn => {
        try { conn.send({ type: 'start_game' }); } catch(e) {}
    });
    // Scanner anzeigen
    showScanner();
}

// ======================== GUESS MODAL ========================
function openGuessModal() {
    if (!app.currentFilm) return;
    guessFilmTitleSpan.innerText = getFilmTitle(app.currentFilm);
    if (gameMode === 'multiplayer') {
        const myData = multiplayerScores[myPeerId];
        currentPlayerNameSpan.innerText = myData ? myData.name : (playerName || '?');
    } else if (players.length > 0 && currentPlayerIndex < players.length) {
        currentPlayerNameSpan.innerText = players[currentPlayerIndex].name;
    } else {
        currentPlayerNameSpan.innerText = '?';
    }
    guessModal.classList.remove('hidden');
}
function closeGuessModal() { guessModal.classList.add('hidden'); }

// ======================== PUNKTEVERGABE ========================
function openRoundSummary() {
    if (gameMode === 'multiplayer') {
        // Im Multiplayer: Punkte direkt zum eigenen Score addieren
        if (!app.currentFilm) return;
        const roundTotal = roundBasePoints - currentTipUsage;
        const myData = multiplayerScores[myPeerId];
        if (myData) {
            const newScore = myData.score + roundTotal;
            const newCorrect = myData.correctGuesses + (wasGuessed ? 1 : 0);
            updateMultiplayerScore(myPeerId, newScore, newCorrect);
        }
        closeRoundSummary();
        showScanner();
        return;
    }
    
    // Turnier-Modus Einzel
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

// ======================== SPIELENDE LOGIK ========================
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
        Object.values(multiplayerScores).forEach(p => {
            if (p.score > maxScore) { maxScore = p.score; winners = [p.name]; }
            else if (p.score === maxScore) winners.push(p.name);
        });
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

// ======================== BUTTON-HANDLER (Punkte-Modal Einzel) ========================
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

// ======================== GUESS HANDLER ========================
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

// ======================== MODUS-AUSWAHL HANDLER ========================
function setupModeSelection() {
    const updateSettings = () => {
        const selected = document.querySelector('input[name="gameModeSelect"]:checked').value;
        tournamentSettingsSelectDiv.style.display = (selected === 'tournament') ? 'block' : 'none';
        multiplayerSettingsDiv.style.display = (selected === 'multiplayer') ? 'block' : 'none';
    };
    modeRadiosSelect.forEach(radio => radio.addEventListener('change', updateSettings));
    updateSettings();
    
    const updateTargetTypeVisibility = () => {
        const targetTypeVal = document.querySelector('input[name="targetTypeSelect"]:checked').value;
        if (targetTypeVal === 'points') {
            pointsTargetGroupSelect.style.display = 'block';
            guessesTargetGroupSelect.style.display = 'none';
        } else {
            pointsTargetGroupSelect.style.display = 'none';
            guessesTargetGroupSelect.style.display = 'block';
        }
    };
    targetTypeRadiosSelect.forEach(radio => radio.addEventListener('change', updateTargetTypeVisibility));
    updateTargetTypeVisibility();
    
    // Multiplayer Buttons
    if (hostGameBtn) {
        hostGameBtn.onclick = () => {
            // Zuerst Ziele aus den Radio-Buttons und Inputs auslesen
            const targetTypeRadios = document.querySelectorAll('input[name="targetTypeSelect"]');
            let selectedTargetType = 'points';
            for (let radio of targetTypeRadios) {
                if (radio.checked) selectedTargetType = radio.value;
            }
            let targetValue;
            if (selectedTargetType === 'points') {
                targetValue = parseInt(targetScoreSelect.value) || 30;
            } else {
                targetValue = parseInt(guessTargetSelect.value) || 5;
            }
            multiplayerTargetType = selectedTargetType;
            multiplayerTargetValue = targetValue;
            
            // Host initialisieren (Lobby wird dort geöffnet)
            initMultiplayerAsHost();
        };
    }
    if (joinGameBtn) {
        joinGameBtn.onclick = () => {
            joinGamePanel.style.display = 'block';
        };
    }
    if (confirmJoinBtn) {
        confirmJoinBtn.onclick = async () => {
            gameMode = 'multiplayer';
            await initMultiplayerAsJoiner();
            showScanner();
        };
    }
    
    confirmModeBtn.onclick = () => {
        const selectedMode = document.querySelector('input[name="gameModeSelect"]:checked').value;
        if (selectedMode === 'multiplayer') {
            // Wird separat behandelt
            return;
        }
        gameMode = selectedMode;
        if (gameMode === 'tournament') {
            targetType = document.querySelector('input[name="targetTypeSelect"]:checked').value;
            targetScore = parseInt(targetScoreSelect.value) || 30;
            guessTarget = parseInt(guessTargetSelect.value) || 5;
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

// ======================== EVENT LISTENER ========================
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
        if (gameMode === 'tournament') {
            showPlayerSetup();
        } else if (gameMode === 'multiplayer') {
            backToMode();
        } else {
            clearAllGameData();
            showModeSelection();
        }
    });
    if (startMultiplayerGameBtn) {
        startMultiplayerGameBtn.addEventListener('click', () => {
            const playerCount = Object.keys(multiplayerScores).filter(id => id !== myPeerId).length;
            if (playerCount === 0) {
                alert('Warte auf Spieler...');
                return;
            }
            startMultiplayerGame();
        });
    }
    if (backToModeFromLobbyBtn) {
        backToModeFromLobbyBtn.addEventListener('click', () => backToMode());
    }
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
    
    // Datei-Upload für QR-Code (Workaround)
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
            } catch (err) {
                alert("QR-Code in Datei nicht erkennbar: " + err);
            } finally {
                tempScanner.clear();
                startScanner();
                fileInput.value = '';
            }
        });
    }
}

function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => m==='&'?'&amp;':(m==='<'?'&lt;':'&gt;')); }