const input = document.getElementById("input");
const output = document.getElementById("output");
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");

const assetsToPreload = [
    "images/scissors.png",
    "images/monster1.png",
    "images/opening-door.png",
    "images/running-hallway.png",
    "images/hospital-hallway.png",
    "sounds/ambient.mp3",
    "sounds/knife-draw.wav",
    "sounds/door-opening_closing.wav",
    "sounds/monster1_jumpscare_reverb.mp3",
    "sounds/monster-growl.wav"
  ];
  
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
          callback(); // oyun başlayabilir
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
        audio.oncanplaythrough = checkDone;
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

startButton.addEventListener("click", () => {
    
    // 2. sonra fade-out başlasın
    setTimeout(() => {
        fade.style.opacity = 1;
    }, 100); // minik gecikme

    // 3. intro yazılarını başlat (fade bittikten sonra)
    setTimeout(() => {
        fade.style.opacity = 0;
        titleScreen.style.display = "none";
        gameScreen.style.display = "block";
        input.focus();
        startAmbientMusic("sounds/ambient.mp3");
        startIntro();
    }, 2000); // fade süresi kadar bekle
    
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
        const audio = new Audio(path);
        audio.currentTime = 0;
        audio.volume = volume;
        audio.play();
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
    imageStyle = {}
) {
    const overlay = document.getElementById("visual-overlay");
    const image = document.getElementById("visual-image");
    const caption = document.getElementById("visual-caption");

    image.src = imagePath;
    caption.innerText = captionText;

    // Arka plan rengi set et (opsiyonel)
    if (backgroundColor) {
        overlay.style.backgroundColor = backgroundColor;
    } else {
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // default
    }

    // Görsel stilini uygula (önce default, sonra override)
image.style.width = "60%";
image.style.height = "auto";

for (let key in imageStyle) {   
    image.style[key] = imageStyle[key];
}

    overlay.style.display = "flex";
    setTimeout(() => overlay.classList.add("show"), 10);

    disableInput();

    const closeHandler = () => {
        overlay.classList.remove("show");
        setTimeout(() => {
            overlay.style.display = "none";
            enableInput();

            // Reset background & image style
            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            image.removeAttribute("style");

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
    stage: 0 // 0: uyanis, 
    // 1: makas alindi,
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

    writeSystemSequence(intro, 1, 400);
}

// === Komutlar Tanimi ===
const commands = [
    {
        keywords: ["makas al", "al makas", "makasi al", "al makasi"],
        action: () => {
            if (gameState.stage === 0) {
                gameState.stage = 1;

                // triggerGlitch(10000);
                playSoundFromFile("sounds/knife-draw.wav", 0, 0.55);
                showVisualWithCallback("images/scissors.png", 
                    "Sivri... pasli... ise yarayabilir.", () => {
                        writeSystem("Makas artık elinde.");
                });

                // showVisualWithCallback(
                //     "images/scissors.png",
                //     "Elin kana bulandi...",
                //     () => {
                //         writeSystem("Bu senin ilk darben olabilir...");
                //     },
                //     null,
                //     "#600000", // koyu kırmızı arkaplan
                //     { width: "1000px", height: "auto" }
                // );

        
              
                
            } else if (gameState.stage > 0) {
                writeSystem("Makas zaten elinde.");
            }
        }
    },
    {
        keywords: ["kapiyi ac", "ac kapiyi", "disari cik", "koridora cik"],
        action: () => {
            if (gameState.stage === 1) {
                gameState.stage = 2;
                const out1 = [
                    "Kapiyi araliyorsun...",
                    "...",
                    "Bir ses yaklasiyor...",
                    "Nedir bu?",
                    "Beklemeli miyim yoksa kacmali miyim...."
                ];

                playSoundFromFile("sounds/door-opening_closing.wav",0,0.3);

                showVisualWithCallback("images/hospital-hallway.png", 
                    "Karanlik bir koridor, yerde kan izleri", () => {
                        writeSystemSequence([
                            "...",
                            "Bir ses yaklasiyor...",
                            "NE YAPACAKSIN?"
                        ], 40, 1500, (index, line) => {
                            if (index === 1) {
                                playSoundFromFile("sounds/monster-growl.wav", 0, 0.8);
                                triggerGlitch(5000); // efekt süresi sana bağlı
                            }
                        });
                });



            } else if (gameState.stage < 1) {
                writeSystem("Disari cikmaya calisiyorsun ama kendini koruyacak bir sey olmadan bu cok riskli.");
            } else {
                writeSystem("Zaten koridordasin. Sesler yaklasiyor...");
            }
        }
    },
    {
        keywords: ["bekle", "kac", "kos", "arkana don", "geri kos", "geri don"],
        action: (cmd) => {
            if (gameState.stage === 2) {
               
                if (cmd.includes("bekle")) {
                    const out3 = [
                        "Bekliyorsun... ama bu hataydi.",
                        "Varliğin farkedilmiş olmali.."
                    ];
                    writeSystemSequence(out3, 40, 1000);
                } 
                else if (cmd.includes("kac") 
                    || cmd.includes("kos") 
                    || cmd.includes("arkana don") 
                    || cmd.includes("geri kos") 
                    || cmd.includes("geri don") )
                     {
                    gameState.stage = 3;
                   
                    playSoundFromFile("sounds/run.wav", 0, 0.6);
                    showVisualWithCallback("images/running-hallway.png", 
                        "...", () => {
                            writeSystemSequence([
                                "Kosmaya basliyorsun... koridordan geciyorsun...",
                                "Zemin kaygan... bir noktada sendeleyebilirsin.",
                                "Sola donen bir kapali kapi... saga acik bir kapi... hangisi? HANGİSİ!"
                            ], 35, 1800, (index, line) => {
                                if (index === 0) {
                                    //playSoundFromFile("sounds/run.wav", 0, 0.9);
                                }
                            });
                    });
                }
            }
        }
    },
    {
        keywords: ["sol", "sol kapi", "soldaki kapiyi ac","sag", "sag kapi", "sagdaki kapiyi ac"],
        action: (cmd) => {
            if (gameState.stage === 3) {
                if (cmd.includes("sol") 
                    || cmd.includes("sol kapi"
                    || cmd.includes("soldaki kapiyi ac"))) {
                        showVisualWithCallback("images/opening-door.png", 
                            "...", () => {
                                writeSystemSequence([
                                    "Güvenli.... Çok şanslısın.",
                                ], 35, 1800, (index, line) => {
                                    if (index === 0) {
                                        //playSoundFromFile("sounds/monster-growl.wav", 0, 0.8);
                                    }
                                });
                        });
                } 
                else if (cmd.includes("sag") 
                    || cmd.includes("sag kapi") 
                    || cmd.includes("sagdaki kapiyi ac")) {
                    gameState.stage = 4;
                    
                    showVisualWithCallback("images/opening-door.png", 
                        "...", () => {
                            triggerGlitch(10000);

                            setTimeout(triggerGameOverScreen, 1000);

                             playSoundFromFile("sounds/monster1_jumpscare3.wav", 0, 0.4);
                            showVisualWithCallback(
                                "images/monster1.png",
                                "",
                                () => {
                                    writeSystem(" ");
                                },
                                null,
                                "#030000", // koyu kırmızı arkaplan
                                { width: "80%", height: "auto" }
                            );
                    });    


                    }
            }
        }
    },
    {
        keywords: ["durum", "ilerleme", "gonca"],
        action: (cmd) => {
            const lower = cmd.toLowerCase();
    
            if (lower.includes("durum") || lower.includes("ilerleme")) {
                writeSystem("Mevcut oyun asamasi: " + gameState.stage);
            }
            else if (lower.includes("gonca")) {
                writeSystem("Seni çok seviyorum ❤️");
            }
        }
    }
];

function handleCommand(cmd) {
    let matched = false;
    const lower = cmd.toLowerCase();

    for (const command of commands) {
        // keywords varsa ona göre kontrol et
        if (command.keywords && Array.isArray(command.keywords)) {
            for (const keyword of command.keywords) {
                if (lower.includes(keyword)) {
                    command.action(cmd);
                    matched = true;
                    break;
                }
            }
        }
    }

    if (!matched) {
        const randomMessage = unknownCommandResponses[Math.floor(Math.random() * unknownCommandResponses.length)];
        writeSystem(randomMessage);
    }
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

    setTimeout(() => {
        gameOver.style.display = "flex";
        gameOver.classList.add("show");
    }, 2000); // ← 4 saniye sonra çalıştır
}
