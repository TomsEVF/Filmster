    let filmid = "";
    let filmcsv = [];
    let film = null;
    let trailerIndex = 1;
    let scanner;
    let continueButtonDebounce = false;
    let currentLanguage = 'de';

    // Load CSV file
    fetch("Filmster-Filme-V4.csv")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            filmcsv = parseCSV(text);
            console.log("CSV loaded:", filmcsv);
            startScanner();
        })
        .catch(error => {
            document.getElementById("ergebnis").textContent = "Fehler beim Laden der Film-Daten.";
            console.error("Error loading CSV file:", error);
        });

    // Start or restart scanner
    function startScanner() {
        const qrDiv = document.getElementById("QR-Code");
        qrDiv.style.display = "block";
        qrDiv.innerHTML = "";
        
        if (scanner) {
            scanner.stop().then(() => {
                scanner.clear();
                scanner = null;
                // Add a small delay to allow the camera to become available again
                setTimeout(initScanner, 500); 
            }).catch(err => {
                console.error("Error stopping scanner:", err);
                initScanner();
            });
        } else {
            initScanner();
        }
    }

    // Initialize camera and start scanner
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
                document.getElementById("ergebnis").textContent = "Keine Kamera gefunden. Bitte stelle sicher, dass deine Kamera angeschlossen und freigegeben ist.";
            }
        }).catch(err => {
            document.getElementById("ergebnis").textContent = "Kamerazugriff verweigert. Bitte erlaube den Kamerazugriff in den Browsereinstellungen.";
            console.error("Error getting cameras:", err);
        });
    }

    function startQrCodeScanner() {
        const qrDiv = document.getElementById("QR-Code");
        const cameraSelector = document.getElementById("camera-selector");
        const cameraId = cameraSelector.value;
        if (!cameraId) {
            console.error("No camera selected.");
            return;
        }

        if (scanner) {
            scanner.stop().then(() => {
                scanner.clear();
                startNewScanner(cameraId, qrDiv);
            }).catch(err => {
                console.error("Error stopping scanner:", err);
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
            document.getElementById("ergebnis").textContent = "Fehler beim Starten der Kamera. Bitte erlaube den Kamerazugriff.";
            console.error("Error starting scanner:", err);
        });
    }

    function handleScanSuccess(decodedText) {
        const idRegex = /filmster:\/\/result\?id=(\d{3})/;
        const match = decodedText.match(idRegex);
        if (match) {
            filmid = match[1];
            film = filmcsv.find(f => f.Nr === filmid);

            if (film) {
                console.log("Film found:", film);
                if (scanner) {
                    scanner.stop().catch(err => console.error("Error stopping scanner:", err));
                }
                document.getElementById("QR-Code").style.display = "none";
                // Show the video container immediately, without changing the text
                document.getElementById("videoContainer").style.display = "flex";
                trailerIndex = 1;
                showTrailer(film);
            } else {
                document.getElementById("ergebnis").textContent = "Film nicht gefunden!";
                console.log("Film not found for ID:", filmid);
            }
        } else {
            document.getElementById("ergebnis").textContent = "Ungültiger QR-Code!";
            console.log("Invalid QR code:", decodedText);
        }
    }

    // Event listeners for buttons
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

    // Language selection buttons
    document.querySelectorAll('.lang-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.lang-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentLanguage = button.dataset.lang;
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
        if (trailerUrl && trailerUrl.trim() !== "") {
            videoElement.src = trailerUrl;
            videoElement.style.display = "block";
            videoElement.load();
            videoElement.play();
            trailerIndex++;
            updateButtons();
        } else {
            trailerIndex = 1;
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