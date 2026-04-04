// ======================== TRYSTERO MULTIPLAYER SETUP ========================
import { joinRoom } from 'triste';  // Achtung: richtig heisst "trystero" – aber wegen Import Map nutzen wir den globalen Export

// Firebase Konfiguration (HIER DEINE EIGENEN DATEN EINFÜGEN!)
const firebaseConfig = {
  apiKey: "AIzaSyBe4heAjNSwz6wYyyP5FVG0_f8HBrqeXKw",
  authDomain: "filmster-multiplayer.firebaseapp.com",
  projectId: "filmster-multiplayer",
  storageBucket: "filmster-multiplayer.firebasestorage.app",
  messagingSenderId: "465659544612",
  appId: "1:465659544612:web:25ad37c1b7602c424384b1",
  measurementId: "G-HNWWSGWZHQ"
};

// Initialisiere Firebase (wird von Trystero benötigt)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Trystero importieren (via global)
let room = null;
let myPeerId = null;
let roomCode = null;
let isHost = false;
let players = [];           // { id, name, totalScore, correctGuesses, isHost }
let activePlayerId = null;
let currentFilm = null;     // aktuell gescannter Film (für Zuschauer)
let gameMode = 'normal';
let targetType = 'points';
let targetScore = 30;
let guessTarget = 5;
let gameStarted = false;

// DOM-Elemente (werden nach Laden gesetzt)
let lobbySection, playerSetupSection, spectatorView, waitTurnView, scannerSection, filmSection;

// Hilfsfunktionen für UI
function showSection(sectionId) {
    document.querySelectorAll('.setup-section, .scanner-section, .film-section, #spectatorView, #waitTurnView').forEach(s => s.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

// Wird aufgerufen, wenn der Spieler nicht am Zug ist (wartet)
function showSpectatorMode(filmData) {
    showSection('spectatorView');
    if (filmData) {
        document.getElementById('spectatorFilmTitle').innerText = getFilmTitle(filmData);
        document.getElementById('spectatorYear').innerText = filmData.Jahr || '?';
        document.getElementById('spectatorDirector').innerText = filmData.Regissure || '?';
        document.getElementById('spectatorFunFacts').innerHTML = ''; // später FunFacts
        document.getElementById('spectatorNoFilm').classList.add('hidden');
    } else {
        document.getElementById('spectatorNoFilm').classList.remove('hidden');
    }
}

// Wird aufgerufen, wenn der Spieler am Zug ist (Scanner + Film ohne Titel)
function showActivePlayerMode() {
    showSection('scannerSection');
    // später: nach Scan wird filmSection gezeigt (ohne Titel)
}

// Nachrichten, die über Trystero gesendet werden
function initMultiplayer() {
    // Trystero Room erstellen oder beitreten
    const { joinRoom } = window.trystero;
    room = joinRoom(firebaseConfig, roomCode);
    
    room.onPeerJoin(peerId => {
        console.log('Neuer Spieler beigetreten:', peerId);
        if (isHost) {
            // Spielerliste aktualisieren (Name muss noch vom Client gesendet werden)
            // Vereinfacht: Wir erwarten, dass jeder Spieler seinen Namen sendet
        }
    });
    
    room.onPeerLeave(peerId => {
        console.log('Spieler verlassen:', peerId);
        players = players.filter(p => p.id !== peerId);
        broadcastPlayers();
    });
    
    // Aktionen
    room.onAction('playerJoined', ({ name, peerId }) => {
        if (!players.find(p => p.id === peerId)) {
            players.push({ id: peerId, name, totalScore: 0, correctGuesses: 0, isHost: false });
            broadcastPlayers();
        }
    });
    
    room.onAction('gameStarted', ({ mode, targetT, targetS, guessT, activeId }) => {
        gameStarted = true;
        gameMode = mode;
        targetType = targetT;
        targetScore = targetS;
        guessTarget = guessT;
        activePlayerId = activeId;
        if (activePlayerId === myPeerId) {
            showActivePlayerMode();
        } else {
            showSpectatorMode(currentFilm);
        }
    });
    
    room.onAction('filmScanned', ({ film, scannedBy }) => {
        currentFilm = film;
        if (scannedBy === myPeerId) {
            // Aktiver Spieler: zeige Film-Ansicht ohne Titel
            showFilmActivePlayer(film);
        } else {
            // Zuschauer: zeige Film-Infos
            showSpectatorMode(film);
        }
    });
    
    room.onAction('roundFinished', ({ playerId, points, guessed, newTotalScore, newCorrectGuesses }) => {
        // Aktualisiere Spielerpunkte
        const p = players.find(p => p.id === playerId);
        if (p) {
            p.totalScore = newTotalScore;
            p.correctGuesses = newCorrectGuesses;
        }
        broadcastPlayers();
        // Nach Rundenende: nächsten Spieler bestimmen (wird vom Host nach Bestätigung gesendet)
    });
    
    room.onAction('nextPlayer', ({ newActiveId }) => {
        activePlayerId = newActiveId;
        if (activePlayerId === myPeerId) {
            showActivePlayerMode();
        } else {
            showSpectatorMode(currentFilm);
        }
    });
}

// Öffentliche Funktionen für app.js
window.multiplayer = {
    createRoom: (playerName) => {
        roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        isHost = true;
        myPeerId = `player_${Date.now()}_${Math.random()}`;
        players = [{ id: myPeerId, name: playerName, totalScore: 0, correctGuesses: 0, isHost: true }];
        initMultiplayer();
        // Host geht zum Setup-Bildschirm
        showSection('playerSetupSection');
        return roomCode;
    },
    joinRoom: (code, playerName) => {
        roomCode = code.toUpperCase();
        isHost = false;
        myPeerId = `player_${Date.now()}_${Math.random()}`;
        players = [];
        initMultiplayer();
        // Sende eigenen Namen an den Raum
        room.sendAction('playerJoined', { name: playerName, peerId: myPeerId });
        // Warte auf Spielstart
        showSection('lobbySection');
        document.getElementById('waitingForHost').classList.remove('hidden');
    },
    startGame: (mode, targetT, targetS, guessT) => {
        if (!isHost) return;
        // Zufälligen aktiven Spieler wählen
        const randomIndex = Math.floor(Math.random() * players.length);
        const activeId = players[randomIndex].id;
        room.sendAction('gameStarted', { mode, targetT, targetS, guessT, activeId });
        gameStarted = true;
        activePlayerId = activeId;
        if (activeId === myPeerId) showActivePlayerMode();
        else showSpectatorMode(null);
    },
    filmScanned: (film) => {
        room.sendAction('filmScanned', { film, scannedBy: myPeerId });
    },
    finishRound: (playerId, points, guessed, newTotal, newCorrect) => {
        room.sendAction('roundFinished', { playerId, points, guessed, newTotalScore: newTotal, newCorrectGuesses: newCorrect });
        // Host oder aktueller Spieler löst nextPlayer aus (hier vereinfacht: Host entscheidet)
        if (isHost) {
            // nächsten Spieler bestimmen (einfach rotieren)
            const currentIndex = players.findIndex(p => p.id === activePlayerId);
            const nextIndex = (currentIndex + 1) % players.length;
            const newActiveId = players[nextIndex].id;
            room.sendAction('nextPlayer', { newActiveId });
            activePlayerId = newActiveId;
        }
    },
    getPlayers: () => players,
    getActivePlayerId: () => activePlayerId,
    isHost: () => isHost,
    isMyTurn: () => activePlayerId === myPeerId,
    getMyId: () => myPeerId,
    getCurrentFilm: () => currentFilm
};