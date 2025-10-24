let filmid = "";
    let filmcsv = [];
    let film = null;
    let trailerIndex = 1;
    let scanner;
    let continueButtonDebounce = false;
    let currentLanguage = 'de';

    // Elemente abrufen
    const ergebnisDiv = document.getElementById("ergebnis");
    const textDiv = document.getElementById("text");
    const qrCodeDiv = document.getElementById("QR-Code");
    const videoContainer = document.getElementById("videoContainer");
    const videoElement = document.getElementById("trailer");
    const continueButton = document.getElementById("continueButton");
    const scanAgainButton = document.getElementById("scanAgainButton");
    const cameraSelectorContainer = document.getElementById("camera-selector-container");
    const cameraSelector = document.getElementById("camera-selector");
    
    // Konfiguration für den QrScanner (Bibliothek muss extern geladen werden)
    const qrScannerOptions = {
        // Hier wird die Rückkamera (environment) als Standard bevorzugt.
        // Bei Misserfolg wird auf die Frontkamera (user) zurückgegriffen.
        preferredCamera: "environment", 
        maxScansPerSecond: 1, // Reduziert die CPU-Last
        highlightScanRegion: true,
        highlightCodeOutline: true,
        calculateScanRegion: (video) => {
            // Zentrierte, quadratische Scan-Region
            const size = Math.min(video.videoWidth, video.videoHeight) * 0.8; // 80% der kleineren Dimension
            const x = (video.videoWidth - size) / 2;
            const y = (video.videoHeight - size) / 2;
            return { x, y, width: size, height: size };
        }
    };


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

    // Helper to safely stop and clear the scanner
    function safeStopScanner() {
        return new Promise((resolve) => {
            if (scanner) {
                scanner.stop().then(() => {
                    scanner.clear();
                    scanner = null;
                    resolve();
                }).catch(err => {
                    console.error("Error stopping scanner:", err);
                    // Still clear and null scanner
                    try { scanner.clear(); } catch (e) {}
                    scanner = null;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    // Start or restart scanner
    async function startScanner() {
        // Sicherstellen, dass der alte Scanner gestoppt und bereinigt ist
        await safeStopScanner();

        // UI-Anpassungen für den Scan-Modus
        ergebnisDiv.textContent = "";
        textDiv.style.display = "block";
        videoContainer.style.display = "none";
        qrCodeDiv.style.display = "block";

        // Füge das Video-Element für den Scanner in den QR-Code-Div ein
        const video = document.createElement('video');
        video.id = 'qr-video';
        qrCodeDiv.appendChild(video);

        try {
            // Initialisiert den QrScanner mit der konfigurierten Option für die Rückkamera
            scanner = new QrScanner(
                video,
                result => handleScanResult(result),
                qrScannerOptions
            );

            // Startet den Scanner
            await scanner.start();
            console.log("Scanner started, camera preferred:", qrScannerOptions.preferredCamera);

            // Liste der Kameras abrufen und Auswahl-Dropdown füllen
            updateCameraSelector(scanner);
        } catch (err) {
            ergebnisDiv.textContent = "Kamerazugriff nicht möglich oder keine Kamera gefunden.";
            textDiv.style.display = "none";
            qrCodeDiv.style.display = "none";
            console.error("Fehler beim Starten des Scanners:", err);
        }
    }

    function updateCameraSelector(scannerInstance) {
        QrScanner.listCameras(true).then(cameras => {
            cameraSelector.innerHTML = ''; // Vorherige Optionen löschen
            let hasMultipleCameras = cameras.length > 1;
            
            if (hasMultipleCameras) {
                cameraSelectorContainer.style.display = 'block';
                cameras.forEach(camera => {
                    const option = document.createElement('option');
                    option.value = camera.id;
                    option.text = camera.label || `Kamera ${camera.id}`;
                    // Setze die standardmäßig bevorzugte Kamera als ausgewählt, wenn sie in der Liste ist
                    if (camera.facingMode === qrScannerOptions.preferredCamera) {
                        option.selected = true;
                    }
                    cameraSelector.appendChild(option);
                });

                // Event-Listener für Kamerawechsel
                cameraSelector.onchange = () => {
                    scannerInstance.setCamera(cameraSelector.value);
                };
            } else {
                cameraSelectorContainer.style.display = 'none';
            }
        });
    }
    
    // Debounce-Funktion
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    // Funktion zur Verarbeitung des Scan-Ergebnisses
    const handleScanResult = debounce(async (result) => {
        // Führe nur fort, wenn kein Debounce aktiv ist
        if (continueButtonDebounce) return; 

        await safeStopScanner(); // Scanner stoppen
        qrCodeDiv.style.display = "none";
        textDiv.style.display = "none";

        const decodedText = result.data;
        console.log("QR Code Decoded:", decodedText);

        const urlParams = new URLSearchParams(decodedText.split('?')[1]);
        filmid = urlParams.get('id');

        if (filmid) {
            film = filmcsv.find(f => f.Nr === filmid);

            if (film) {
                ergebnisDiv.textContent = `Film ${filmid} gefunden: ${film['Titel Deutsch']}`;
                trailerIndex = 1;
                videoContainer.style.display = "flex";
                showTrailer(film);
            } else {
                ergebnisDiv.textContent = `Fehler: Film-ID ${filmid} nicht in der Datenbank gefunden.`;
                startScanner(); // Neustart nach Fehler
            }
        } else {
            ergebnisDiv.textContent = `Fehler: Ungültiger QR-Code-Inhalt.`;
            startScanner(); // Neustart nach Fehler
        }
    }, 1000);


    // Event Listener für Buttons
    continueButton.addEventListener('click', () => {
        if (!continueButtonDebounce) {
            continueButtonDebounce = true;
            setTimeout(() => { continueButtonDebounce = false; }, 500); // Debounce für 500ms
            
            if (film) {
                showTrailer(film);
            }
        }
    });
    
    scanAgainButton.addEventListener('click', () => {
        videoContainer.style.display = "none";
        startScanner();
    });

    // Language Buttons setup
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