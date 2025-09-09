let filmid = "";
    let filmcsv = [];
    let film = null;
    let trailerIndex = 1;
    let scanner;
    let continueButtonDebounce = false;
    let currentLanguage = 'de';

    // CSV-Datei laden (V4)
    fetch("Filmster-Filme-V4.csv")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            filmcsv = parseCSV(text);
            console.log("CSV geladen:", filmcsv);
            // Scanner erst jetzt starten
            document.getElementById("QR-Code").style.display = "block";
            startScanner();
        })
        .catch(error => console.error("Fehler beim Laden der CSV-Datei:", error));

    // Scanner starten
    function startScanner() {
        const qrDiv = document.getElementById("QR-Code");
        qrDiv.style.display = "block";
        qrDiv.innerHTML = "";
        if (scanner) {
            scanner.stop().then(() => {
                scanner.clear();
                scanner = null;
                initScanner();
            }).catch(err => {
                console.error("Fehler beim Stoppen des Scanners:", err);
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
                cameraSelectorContainer.style.display = "block";
                cameraSelector.innerHTML = '';
                cameras.forEach(camera => {
                    const option = document.createElement("option");
                    option.value = camera.id;
                    option.text = camera.label || `Kamera ${cameras.indexOf(camera) + 1}`;
                    cameraSelector.appendChild(option);
                });
                cameraSelector.addEventListener('change', startQrCodeScanner);
                startQrCodeScanner();
            } else {
                console.error("Keine Kamera gefunden.");
            }
        }).catch(err => {
            console.error("Fehler beim Abrufen der Kameras:", err);
        });
    }

    function startQrCodeScanner() {
        const qrDiv = document.getElementById("QR-Code");
        const cameraSelector = document.getElementById("camera-selector");
        const cameraId = cameraSelector.value;
        if (!cameraId) return;

        if (scanner) {
            scanner.stop().then(() => {
                scanner.clear();
                startNewScanner(cameraId, qrDiv);
            }).catch(err => {
                console.error("Fehler beim Stoppen des Scanners:", err);
                startNewScanner(cameraId, qrDiv);
            });
        } else {
            startNewScanner(cameraId, qrDiv);
        }
    }

    function startNewScanner(cameraId, qrDiv) {
        scanner = new Html5Qrcode("QR-Code");
        scanner.start(
            cameraId, {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                }
            },
            (decodedText, decodedResult) => {
                handleScanSuccess(decodedText);
            },
            (errorMessage) => {}
        ).catch(err => {
            console.error("Fehler beim Starten des Scanners:", err);
        });
    }

    function handleScanSuccess(decodedText) {
        const idRegex = /filmster:\/\/result\?id=(\d{3})/;
        const match = decodedText.match(idRegex);
        if (match) {
            filmid = match[1];
            film = filmcsv.find(f => f.Nr === filmid);

            if (film) {
                console.log("Film gefunden:", film);
                scanner.stop();
                document.getElementById("QR-Code").style.display = "none";
                document.getElementById("text").textContent = film['Titel Deutsch'];
                document.getElementById("videoContainer").style.display = "flex";
                trailerIndex = 1;
                showTrailer(film);
            } else {
                document.getElementById("ergebnis").textContent = "Film nicht gefunden!";
                console.log("Film nicht gefunden für ID:", filmid);
            }
        } else {
            document.getElementById("ergebnis").textContent = "Ungültiger QR-Code!";
            console.log("Ungültiger QR-Code:", decodedText);
        }
    }

    // Event-Listener für Buttons
    const continueButton = document.getElementById("continueButton");
    const scanAgainButton = document.getElementById("scanAgainButton");
    const videoElement = document.getElementById("trailer");

    continueButton.addEventListener("click", () => {
        if (continueButtonDebounce) return;
        continueButtonDebounce = true;
        setTimeout(() => {
            showTrailer(film);
            continueButtonDebounce = false;
        }, 500);
    });

    scanAgainButton.addEventListener("click", () => {
        videoElement.pause();
        document.getElementById("videoContainer").style.display = "none";
        document.getElementById("text").textContent = "Scanne den QR-Code auf deiner Karte";
        document.getElementById("ergebnis").textContent = "";
        startScanner();
    });

    // Sprachauswahl-Buttons
    document.querySelectorAll('.lang-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.lang-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentLanguage = button.dataset.lang;
            // Starte den Trailer neu in der neuen Sprache
            trailerIndex = 1;
            showTrailer(film);
        });
    });

    function updateButtons() {
        const nextTrailerKey = `App-Link_Video-${trailerIndex}_${currentLanguage.toUpperCase()}`;
        const hasNextTrailer = film[nextTrailerKey] && film[nextTrailerKey].trim() !== "";
        continueButton.style.display = hasNextTrailer ? "block" : "none";
    }

    function showTrailer(film) {
        let trailerUrl = film[`App-Link_Video-${trailerIndex}_${currentLanguage.toUpperCase()}`];
        console.log(`Versuche, Trailer ${trailerIndex} in ${currentLanguage} zu laden: ${trailerUrl}`);
        if (trailerUrl && trailerUrl.trim() !== "") {
            videoElement.src = trailerUrl;
            videoElement.style.display = "block";
            videoElement.load();
            videoElement.play();
            trailerIndex++;
            updateButtons();
        } else {
            console.log("Kein weiterer Trailer verfügbar, kehre zum ersten zurück.");
            trailerIndex = 1; // Kehre zum ersten Trailer zurück
            showTrailer(film);
        }
    }

    function parseCSV(text) {
        let rows = text.trim().split("\n");
        let headers = rows.shift().split(";").map(h => h.trim());

        return rows.map(row => {
            let values = row.split(";").map(v => v.trim());
            let entry = {};
            headers.forEach((header, i) => {
                entry[header] = values[i] || "";
            });
            return entry;
        });
    }