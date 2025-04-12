const input = document.getElementById("input");
const output = document.getElementById("output");
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");

let audioContextUnlocked = false;

function unlockAudioContext() {
    if (audioContextUnlocked) return;

    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = context.createBuffer(1, 1, 22050);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);

        if (context.state === "suspended") {
            context.resume();
        }

        audioContextUnlocked = true;
        console.log("🔓 AudioContext unlocked!");
    } catch (e) {
        console.warn("❌ AudioContext unlock failed:", e);
    }

    window.removeEventListener("click", unlockAudioContext);
    window.removeEventListener("keydown", unlockAudioContext);
}


const assetsToPreload = [
    "images/scissors.png",
    "images/monster1.png",
    "images/opening-door.png",
    "images/running-hallway.png",
    "images/hospital-hallway.png",
    "sounds/ambient.mp3",
    "sounds/door-opening_closing.wav",
    "sounds/knife-draw.wav",
    "sounds/monster-growl.wav",
    "sounds/monster1_jumpscare3.wav",
    "sounds/run.wav"
  ];
  
  const soundCache = {};

  function preloadAssets(callback) {
    const total = assetsToPreload.length;
    let loaded = 0;
  
    const bar = document.getElementById("loading-bar");
  
    const checkDone = () => {
      loaded++;
      bar.style.width = ((loaded / total) * 100) + "%";
  
      if (loaded >= total) {
        setTimeout(() => {
          document.getElementById("loading-screen").style.display = "none";
          callback(); // Oyun başlasın
        }, 300);
      }
    };
  
    for (const asset of assetsToPreload) {
      if (asset.match(/\.(png|jpg|jpeg)$/i)) {
        const img = new Image();
        img.src = asset;
        img.onload = checkDone;
        img.onerror = checkDone;
  
      } else if (asset.match(/\.(mp3|wav)$/i)) {
        const audio = new Audio();
        audio.src = asset;
        audio.load(); // 🔥 Safari için çok önemli
        soundCache[asset] = audio;
  
        // 🔁 Safari ve diğer tüm tarayıcılar için güvenli preload
        audio.onloadeddata = checkDone;
        audio.onerror = checkDone;
      }
    }
  }

  window.addEventListener("load", () => {
    preloadAssets(() => {
      document.getElementById("title-screen").style.display = "block";
    });
  });

// Input kontrolü
let inputEnabled = true;
let visualShowing = false;

function disableInput() {
    input.disabled = true;
    inputEnabled = false;
}

function enableInput() {
    if(visualShowing) return;
    input.disabled = false;
    inputEnabled = true;
    input.focus();
}

let gameStarted = false;

startButton.addEventListener("click", () => {
    if (gameStarted) return; // ⛔ Eğer zaten başladıysa bir daha başlatma
    gameStarted = true;

    unlockAudioContext(); // (önceden eklediğimiz ses unlock kodu)

    setTimeout(() => {
        fade.style.opacity = 1;
    }, 100);

    setTimeout(() => {
        fade.style.opacity = 0;
        titleScreen.style.display = "none";
        gameScreen.style.display = "block";
        input.focus();
        startAmbientMusic("sounds/ambient.mp3");
        startIntro();
    }, 2000);
});

document.getElementById("restart-button").addEventListener("click", () => {
    location.reload();
});

let ambientMusic = null;

function startAmbientMusic(path) {
    ambientMusic = new Audio(path);
    ambientMusic.loop = true;
    ambientMusic.volume = 0.2; // 0.0 - 1.0 arası (kısık ses)
    ambientMusic.play();
}

function stopAmbientMusic() {
    if (ambientMusic) {
        ambientMusic.pause();
        ambientMusic.currentTime = 0;
    }
}

function playSoundFromFile(path, delay = 0, volume = 1) {
    setTimeout(() => {
      let audio;
      if (soundCache[path]) {
        audio = soundCache[path].cloneNode(); // 🔁 Kopyasını çal
      } else {
        audio = new Audio(path); // fallback
      }
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch((e) => console.warn("Ses çalma hatası:", e));
    }, delay);
  }
  

function triggerGlitch(duration = 1000) {
    const container = document.getElementById("game-screen");
    const containerV = document.getElementById("visual-container");
    container.classList.add("glitch-active");
    containerV.classList.add("glitch-active");
  
    setTimeout(() => {
      container.classList.remove("glitch-active");
      containerV.classList.remove("glitch-active");
    }, duration);
  }


function showVisual(imagePath, captionText = "", autoCloseAfter = null) {
    const overlay = document.getElementById("visual-overlay");
    const image = document.getElementById("visual-image");
    const caption = document.getElementById("visual-caption");

    image.src = imagePath;
    caption.innerText = captionText;
    overlay.style.display = "flex";
    visualShowing = true;
    disableInput();

    // küçük zamanlama farkıyla opacity geçişi sağla
    setTimeout(() => overlay.classList.add("show"), 10);

    if (autoCloseAfter) {
        setTimeout(() => hideVisual(), autoCloseAfter);
    }
}

function hideVisual() {
    const overlay = document.getElementById("visual-overlay");
    const image = document.getElementById("visual-image");

    overlay.classList.remove("show");
    visualShowing = false;

    setTimeout(() => {
        overlay.style.display = "none";
        image.src = "";
        image.removeAttribute("style");
        enableInput();
    }, 100);
}

function showVisualWithCallback(
    imagePath,
    captionText = "",
    onClose = null,
    autoCloseAfter = null,
    backgroundColor = null,
    imageStyle = {},
    onShow = null, // ← yeni parametre
) {
    const overlay = document.getElementById("visual-overlay");
    const image = document.getElementById("visual-image");
    const caption = document.getElementById("visual-caption");

    image.src = imagePath;
    caption.innerText = captionText;

    // 📌 Default width ve height
    image.style.width = "75%";
    image.style.height = "auto";

    // Eğer imageStyle ile geçersiz değer varsa onları uygula
    for (let key in imageStyle) {
        image.style[key] = imageStyle[key];
    }

    // Arkaplan rengi
    overlay.style.backgroundColor = backgroundColor || "rgba(0, 0, 0, 0.8)";
    overlay.style.display = "flex";

    setTimeout(() => {
        overlay.classList.add("show");

        if (onShow) onShow(); // 🔥 Görsel gösterildiğinde tetikle
    }, 10);

    disableInput();

    const closeHandler = () => {
        overlay.classList.remove("show");
        setTimeout(() => {
            overlay.style.display = "none";
            enableInput();
            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            image.removeAttribute("style"); // 👈 Style sıfırla (width ve height dahil)
            if (onClose) onClose();
        }, 100);
    };

    if (autoCloseAfter) {
        setTimeout(closeHandler, autoCloseAfter);
    } else {
        overlay.onclick = () => {
            overlay.onclick = null;
            closeHandler();
        };
    }
}



// === Oyun Durumu ===
const gameState = {
    stage: 0, // 0: uyanis, 
    escapeWarnings: 0 // yeni eklendi!
    // 2: kapidan cikildi,
    // 3+: yeni bolumler
    // 3+: yeni bolumler
    // 3+: yeni bolumler
    // 3+: yeni bolumler
    // 3+: yeni bolumler
    // 3+: yeni bolumler
    // 3+: yeni bolumler

};

function getKeywordClass(word) {
    const info = keywordColorsConfig[word.toLowerCase()];
    if (!info) return null;

    // Eğer sahne tanımlıysa ve şu anki sahnedeysek uygula
    if (info.stage === undefined || gameState.stage === info.stage) {
        return info.class;
    }

    return null;
}

const keywordColorsConfig = {
    "bagir": { stage: 2, class: "keyword-orange keyword-glow" },
    "makas": { stage: 0, class: "keyword-orange keyword-glow" },
    "kapi": { stage: 0, class: "keyword-orange keyword-glow" },
    "bekle": { stage: 2, class: "keyword-orange keyword-glow" },
    "sol": { stage: 3, class: "keyword-orange keyword-glow" },
    "sag": { stage: 3, class: "keyword-orange keyword-glow" },
    "kac": { stage: 2, class: "keyword-orange keyword-glow" },
    "kan": { stage: 2, class: "keyword-red" }
};

// === Bilinmeyen komut cevaplari ===
const unknownCommandResponses = [
    "Bu komutu anlayamadim.",
    "Ne? tekrar dene.",
    "Yapamazsin öyle bir sey.",
    "Bunu yapamazsin.",
    "Sacmalama.",
    "Hayir, bunu yapamazsin."
];

// === Giris Hikayesi ===
function startIntro() {
    const intro = [
        " ",
        "Gozlerini actiginda tavandaki florasanlar titriyor.",
        "Soguk bir hastane odasindasin. Kafan sargilarla kapli.",
        "Kapinin arkasindan insan disi bir ciglik duyuluyor.",
        "Basini toparlayip yataktan kalkiyorsun...",
        "-Yanimda bir makas var. Belki isime yarar.",
        " ",
        " ",
        "Ne yapacaksin?"
    ];

    //startDecisionCountdown(1000);
    writeSystemSequence(intro, 25, 800);
    //writeSystemSequence(intro, 1, 1);
}

const commands = [
    {
        action: (cmd) => {
            if (gameState.stage === 0 && (
                cmd.includes("makas al") || cmd.includes("al makas") || cmd.includes("makasi al") || cmd.includes("al makasi")
            )) {
                gameState.stage = 1;

                playSoundFromFile("sounds/knife-draw.wav", 0, 0.55);
                showVisualWithCallback("images/scissors.png", 
                    "Sivri... pasli... ise yarayabilir.", () => {
                        writeSystem("Makas artık elinde.");
                    });
                return true;
            }

            if (gameState.stage > 0 && cmd.includes("makas")) {
                writeSystem("Makas zaten elinde.");
                return true;
            }
        }
    },
    {
        action: (cmd) => {
            if (gameState.stage === 1 && (
                cmd.includes("kapiyi ac") || cmd.includes("ac kapiyi") || cmd.includes("disari cik") || cmd.includes("koridora cik")
            )) {
                gameState.stage = 2;

                playSoundFromFile("sounds/door-opening_closing.wav", 0, 0.55);
                showVisualWithCallback("images/hospital-hallway.png", 
                    "Karanlik bir koridor, yerde kan izleri", () => {
                        writeSystemSequence([
                            "...",
                            "Bir ses yaklasiyor...",
                            "NE YAPACAKSIN?"
                        ], 40, 1500, (index, line) => {
                            if (index === 1) {
                                playSoundFromFile("sounds/monster-growl.wav", 0, 0.8);
                                triggerGlitch(2000);
                            }
                        });
                    });

                return true;
            }

            if (gameState.stage < 1 && cmd.includes("kapi")) {
                writeSystem("Disari cikmaya calisiyorsun ama kendini koruyacak bir sey olmadan bu cok riskli.");
                return true;
            }

            if (gameState.stage > 1 && cmd.includes("kapi")) {
                writeSystem("Zaten koridordasin.");
                return true;
            }
        }
    },
    {
        action: (cmd) => {
            if (gameState.stage === 2) {
                if (
                    cmd.includes("kac") || cmd.includes("kos") || cmd.includes("arkana don") ||
                    cmd.includes("geri kos") || cmd.includes("geri don")
                ) {
                    gameState.stage = 3;
                    gameState.escapeWarnings = 0; // sıfırla
                    playSoundFromFile("sounds/run.wav", 0, 0.6);
                    showVisualWithCallback("images/running-hallway.png", "...", () => {
                        writeSystemSequence([
                            "Kosmaya basliyorsun... koridordan geciyorsun...",
                            "Zemin kaygan... bir noktada sendeleyebilirsin.",
                            "Sola donen bir kapali kapi... saga acik bir kapi... hangisi? HANGİSİ!"
                        ], 35, 1800);
                        startDecisionCountdown(20000); // 20 saniye süre başlasın
                    });
                    return true;
                } else {
                    // yanlış girişlerde sırayla mesaj göster
                    const warnings = [
                        "Gerçekten kacmayacak mısın?",
                        "Bence kacmalısın...",
                        "KAC"
                    ];
    
                    if (gameState.escapeWarnings < warnings.length) {
                        writeSystem(warnings[gameState.escapeWarnings]);
                        gameState.escapeWarnings++;
                    } else {
                        // 4. yanlışta jumpscare + game over
                        triggerGlitch(1000);
                        setTimeout(triggerGameOverScreen, 800);
                        playSoundFromFile("sounds/monster1_jumpscare3.wav", 0, 0.3);
                        showVisualWithCallback("images/monster1.png", "", () => {
                            writeSystem(" ");
                        }, null, "#160000", { width: "100%", height: "auto" });
                    }
    
                    return true;
                }
            }
        }
    },
    {
        action: (cmd) => {
            if (gameState.stage === 3) {
                if (
                    cmd.includes("sol") || cmd.includes("sol kapi") || cmd.includes("soldaki kapiyi ac")
                ) {
                    cancelDecisionCountdown();
                    playSoundFromFile("sounds/door-opening.wav", 0, 0.5);
                    showVisualWithCallback("images/opening-door.png", "...", () => {
                        setTimeout(triggerGameOverScreen, 4);
                        writeSystemSequence(["Güvenli.... Çok şanslısın."], 35, 1800);
                    });
                    return true;
                }

                if (
                    cmd.includes("sag") || cmd.includes("sag kapi") || cmd.includes("sagdaki kapiyi ac")
                ) {
                    cancelDecisionCountdown();
                    gameState.stage = 4;
                    playSoundFromFile("sounds/door-opening.wav", 0, 0.5);
                    showVisualWithCallback("images/opening-door.png", "...", () => {
                        triggerGlitch(1000);
                        setTimeout(triggerGameOverScreen, 800);
                        playSoundFromFile("sounds/monster1_jumpscare3.wav", 0, 0.3);
                        showVisualWithCallback("images/monster1.png", "", () => {
                            writeSystem(" ");
                        }, null, "#160000", { width: "80%", height: "auto" });
                    });
                    return true;
                } else {
                    writeSystem("-Karar vermeliyim! sol mu, sag mı?");
                    return true;
                }
            }
        }
    },
    {
        action: (cmd) => {
            const lower = cmd.toLowerCase();
            if (lower.includes("durum") || lower.includes("ilerleme")) {
                writeSystem("Mevcut oyun asamasi: " + gameState.stage);
                return true;
            } else if (lower.includes("gonca")) {
                writeSystem("Seni çok seviyorum ❤️");
                return true;
            } else if (lower.includes("karpat")) {
                writeSystem("Tarlayaaa");
                return true;
            }
        }
    }
];




function handleCommand(cmd) {
    const lower = cmd.toLowerCase();

    for (const command of commands) {
        if (typeof command.action === "function") {
            const result = command.action(lower);
            if (result === true) return; // eşleştiyse dur
        }
    }

    // Hiçbir komut eşleşmediyse
    const randomMessage = unknownCommandResponses[Math.floor(Math.random() * unknownCommandResponses.length)];
    writeSystem(randomMessage);
}




function writeSystem(text, speed = 35, onComplete = null) {
    disableInput();

    const line = document.createElement("div");
    line.classList.add("system-message");
    output.appendChild(line);

    let i = 0;
    function typeNextChar() {
        if (i >= text.length) {
            window.scrollTo(0, document.body.scrollHeight);
            if (onComplete) {
                setTimeout(onComplete, 100);
            } else {
                enableInput();
            }
            return;
        }

        for (const keyword in keywordColorsConfig) {
            const keywordLower = keyword.toLowerCase();
            const segment = text.substring(i, i + keyword.length).toLowerCase();
        
            if (segment === keywordLower) {
                const keywordClass = getKeywordClass(keyword);
                const span = document.createElement("span");
                
                if (keywordClass) {
                    keywordClass.split(" ").forEach(cls => span.classList.add(cls));
                }
        
                span.textContent = text.substring(i, i + keyword.length);
                line.appendChild(span);
                i += keyword.length;
                setTimeout(typeNextChar, speed);
                return;
            }
        }

        // Anahtar kelime yoksa normal harf ekle
        const charSpan = document.createElement("span");
        charSpan.textContent = text.charAt(i);
        line.appendChild(charSpan);
        i++;
        setTimeout(typeNextChar, speed);
    }

    typeNextChar();
}




function writeSystemSequence(lines, speed = 35, delayBetweenLines = 1500, onLine = null) {
    disableInput();
    let index = 0;

    function writeNextLine() {
        if (index < lines.length) {
            if (onLine) onLine(index, lines[index]); // 🔥 satır geldiğinde tetiklenir

            writeSystem(lines[index], speed, () => {
                index++;
                setTimeout(writeNextLine, delayBetweenLines);
            });
        } else {
            enableInput();
        }
    }

    writeNextLine();
}


// === Oyuncu Yazisi ===
function writePlayer(text) {
    const line = document.createElement("div");
    line.classList.add("player-input");
    line.innerText = "> " + text;
    output.appendChild(line);
    window.scrollTo(0, document.body.scrollHeight);
}

// === Input Dinleme ===
input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && inputEnabled) {
        const command = input.value.trim().toLowerCase();
        writePlayer(command);
        input.value = "";

        handleCommand(command);
    }
});

function triggerGameOverScreen() {
    const gameOver = document.getElementById("gameover-screen");

    // Tüm oyun ekranını karart
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("visual-overlay").style.display = "none";
    input.blur(); // input'u da devre dışı bırak
    stopAmbientMusic();

    setTimeout(() => {
        gameOver.style.display = "flex";
        gameOver.classList.add("show");
    }, 4000); // ← 4 saniye sonra çalıştır
}

let decisionTimer = null;
let vignetteInterval = null;

function startDecisionCountdown(timeout) {
    const vignette = document.getElementById("vignette-timer");
    let opacity = 0;
    vignette.style.opacity = opacity;

    vignetteInterval = setInterval(() => {
        opacity += 0.1;
        vignette.style.opacity = opacity.toFixed(2);

        if (opacity >= 1) {
            clearInterval(vignetteInterval);
        }
    }, timeout / 10); // her 1 saniyede opacity %10 artar

    decisionTimer = setTimeout(() => {
        clearInterval(vignetteInterval);
        vignette.style.opacity = 0;
        triggerGlitch(1000);
        setTimeout(triggerGameOverScreen, 800);
        showVisualWithCallback(
            "images/monster1.png",
            "",
            () => {
                triggerGameOverScreen();
            },
            null,
            "#160000",
            { width: "100%", height: "auto" },
            () => {
                // 💥 Görsel tam gösterildiğinde ses çalsın
                playSoundFromFile("sounds/monster1_jumpscare3.wav", 0, 0.6);
            }
        );
    }, timeout);
}

function cancelDecisionCountdown() {
    clearTimeout(decisionTimer);
    clearInterval(vignetteInterval);
    const vignette = document.getElementById("vignette-timer");
    vignette.style.opacity = 0;
}
