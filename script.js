let filmid = "";
let filmcsv = [];
let film = [];
let video = [];
let trailerIndex = 1;
let scanner;

// CSV laden
fetch("Filmster-Filme-V3.csv")
  .then(response => response.text())
  .then(text => {
    filmcsv = parseCSV(text);
    console.log("CSV geladen:", filmcsv);

    // Scanner erst jetzt starten
    startScanner();
  });

// Scanner starten
function startScanner() {
  const qrDiv = document.getElementById("QR-Code");
  qrDiv.style.display = "block";   // wichtig!
  qrDiv.innerHTML = "";            // alte Inhalte leeren
  if (scanner) {
    scanner.stop().then(() => {
      scanner.clear();
      scanner = null;
      initScanner();
    }).catch(err => {
      console.error("Error stopping scanner:", err);
      initScanner();
    });
  } else {
    initScanner();
  }
}

function initScanner() {
  const cameraSelector = document.getElementById("camera-selector");
  const cameraSelectorContainer = document.getElementById("camera-selector-container");

  Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
      cameraSelectorContainer.style.display = "block"; // Dropdown anzeigen
      cameraSelector.innerHTML = ''; // Vorherige Optionen leeren
      cameras.forEach(camera => {
        const option = document.createElement("option");
        option.value = camera.id;
        option.text = camera.label || `Camera ${camera.id}`;
        cameraSelector.appendChild(option);
      });

      // Rückkamera (environment) standardmäßig auswählen, wenn vorhanden
      const environmentCamera = cameras.find(camera => camera.label.toLowerCase().includes("back") || camera.label.toLowerCase().includes("environment"));
      if (environmentCamera) {
          cameraSelector.value = environmentCamera.id;
      }
    } else {
        cameraSelectorContainer.style.display = "none";
    }
    
    // Starte den Scanner mit der ausgewählten Kamera
    startScannerWithSelectedCamera(cameraSelector.value);

  }).catch(err => {
    console.error("Kameras konnten nicht gelistet werden:", err);
    startScannerWithSelectedCamera(null); // Versuche, ohne spezifische Kamera zu starten
  });
}

function startScannerWithSelectedCamera(cameraId) {
  scanner = new Html5Qrcode("QR-Code");
  const qrCodeConfig = {
      fps: 10,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
          const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7);
          return { width: size, height: size };
      }
  };
  
  let cameraConfig;
  if (cameraId) {
      cameraConfig = { deviceId: { exact: cameraId } };
  } else {
      cameraConfig = { facingMode: "environment" };
  }

  scanner.start(
    cameraConfig,
    qrCodeConfig,
    onScanSuccess,
    onScanFailure
  ).catch(err => {
    console.error("Scanner konnte nicht gestartet werden:", err);
    const qrDiv = document.getElementById("QR-Code");
    if (qrDiv) {
      qrDiv.innerHTML = "Die Kamera konnte nicht gestartet werden. <br> Bitte erteile die notwendigen Berechtigungen und lade die Seite neu.";
    }
  });

  // Hinzufügen eines Event-Listeners, um bei Änderung der Auswahl den Scanner neu zu starten
  document.getElementById("camera-selector").addEventListener("change", (e) => {
    scanner.stop().then(() => {
      scanner.clear();
      startScannerWithSelectedCamera(e.target.value);
    }).catch(err => {
      console.error("Error stopping scanner for camera switch:", err);
      startScannerWithSelectedCamera(e.target.value);
    });
  });
}

function onScanSuccess(decodedText, decodedResult) {
    // ID mit RegEx auslesen
  let match = decodedText.match(/id=(\d+)/);
  let filmId = (match ? match[1] : null);
  scanner.stop().then(() => {
    scanner.clear();
  }).catch(err => {
    console.error("Error stopping scanner after success:", err);
  });
  console.log(filmId);
  if (filmId) {
    //Film suchen
    film = filmcsv.find(f => f.Nr && f.Nr.trim() === filmId.trim());
    console.log(film);
    if (film) {
      document.getElementById("QR-Code").style.display = "none";
      document.getElementById("camera-selector-container").style.display = "none";
      let textElem = document.getElementById("text");
      if (textElem) {
        textElem.innerText = "Schau genau Hin!";
      }
      let videoContainer = document.getElementById("videoContainer");
      if (videoContainer) videoContainer.style.display = "block";
      showTrailer(film);

    } else {
      let ergebnisElem = document.getElementById("ergebnis");
      if (ergebnisElem) {
        ergebnisElem.innerText = "Der Film konnte nicht gefunden Wedn!";
      }
      console.log("Film nicht in CSV gefunden!");
    }
  } else {
    let ergebnisElem = document.getElementById("ergebnis");
    if (ergebnisElem) {
      ergebnisElem.innerText = "Kein gültiger Film-ID gefunden";
    }
  }
}

// Button-Logik
document.getElementById("scanAgainButton").addEventListener("click", function() {
  let videoElement = document.getElementById("trailer");
  if (videoElement) {
    videoElement.pause();
    videoElement.style.display = "none";
  }

  let continueButton = document.getElementById("continueButton");
  if (continueButton) {
    continueButton.style.display = "none";
  }
  let scanAgainButton = document.getElementById("scanAgainButton");
  if (scanAgainButton) {
    scanAgainButton.style.display = "none";
  }

  // Ergebnis zurücksetzen
  let ergebnisElem = document.getElementById("ergebnis");
  if (ergebnisElem) {
    ergebnisElem.innerText = "";
  }
  let textElem = document.getElementById("text");
  if (textElem) {
    textElem.innerText = "Scanne den QR-code auf deiner Karte";
  }
  document.getElementById("QR-Code").style.display = "";
  let videoContainer = document.getElementById("videoContainer");
  if (videoContainer) videoContainer.style.display = "none";
  // Zähler zurücksetzen
  trailerIndex = 1;

  // Scanner neu starten: Scanner-Objekt neu erstellen und rendern
  initScanner();
  startScanner();
});

// Debounce mechanism for continueButton
let continueButtonDebounce = false;
document.getElementById("continueButton").addEventListener("click", function() {
  if (continueButtonDebounce) return;
  continueButtonDebounce = true;
  setTimeout(() => {
    showTrailer(film); // spielt den nächsten Trailer ab
    continueButtonDebounce = false;
  }, 500); // 300ms delay before showing trailer
});

function updateButtons() {
  const scanAgainButton = document.getElementById("scanAgainButton");
  const continueButton = document.getElementById("continueButton");
  if (trailerIndex > 3) {
    if (scanAgainButton) scanAgainButton.style.display = "inline-block";
    if (continueButton) continueButton.style.display = "none";
  } else {
    if (scanAgainButton) scanAgainButton.style.display = "inline-block";
    if (continueButton) continueButton.style.display = "inline-block";
  }
}

function showTrailer(film) {
  let trailerUrl = film["App-Link_Video-" + trailerIndex];

  let videoElement = document.getElementById("trailer");
  if (videoElement) {
    videoElement.src = trailerUrl;
    videoElement.style.display = "block";
    videoElement.load();
    videoElement.play();
  }

  trailerIndex++;
  console.log(trailerIndex);
  updateButtons();
}

function parseCSV(text) {
  let rows = text.trim().split("\n");
  let headers = rows.shift().split(";").map(h => h.trim());

  return rows.map(row => {
    let values = row.split(";").map(v => v.trim());
    let entry = {};
    headers.forEach((header, i) => {
      entry[header] = values[i];
    });
    return entry;
  });
}

function onScanFailure(error) {
  // Fehler beim Scannen ignorieren
  console.warn("Scan-Fehler:", error);
}