const input = document.getElementById("input");
const output = document.getElementById("output");
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");

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
    const screen = document.getElementById("game-screen");
    screen.classList.add("glitch-active");

    setTimeout(() => {
        screen.classList.remove("glitch-active");
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
    overlay.classList.remove("show");

    visualShowing = false;

    setTimeout(() => {
        overlay.style.display = "none";
        enableInput();
    }, 100); // animasyon süresi kadar bekle sonra tamamen kaldır
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
    "sola": { stage: 3, class: "keyword-orange keyword-glow" },
    "saga": { stage: 3, class: "keyword-orange keyword-glow" },
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
        "Yanimda bir makas var. Belki isime yarar.",
        " ",
        " ",
        "Ne yapmak istersin?"
    ];

    writeSystemSequence(intro, 30, 400);
}

// === Komutlar Tanimi ===
const commands = [
    {
        keywords: ["makas al", "al makas", "makasi al", "al makasi"],
        action: () => {
            if (gameState.stage === 0) {
                gameState.stage = 1;

            
                showVisual("images/scissors.png", 
                    "Makasi eline aliyorsun. Sivri... pasli... ise yarayabilir.");
                
                const scissorOwned = [
                    "Makas artik sende",
                ];
                playSoundFromFile("sounds/knife-draw.wav",0,0.05);
                writeSystemSequence(scissorOwned, 40, 500);
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
                    "Disarida karanlik bir koridor, yerde kan izleri.",
                    "...",
                    "Bir ses yaklasiyor...",
                    "Nedir bu?",
                    "Beklemeli miyim yoksa kacmali miyim...."
                ];

                playSoundFromFile("sounds/door-opening_closing.wav",0,0.3);

                writeSystemSequence(out1, 40, 2000, (index, line) => {
                    if (index === 3) {
                        playSoundFromFile("sounds/monster-growl.wav", 0, 0.7);
                        triggerGlitch(5000);
                    }
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
                    writeSystemSequence([
                        "Kosmaya basliyorsun... koridordan geciyorsun...",
                        "Zemin kaygan... bir noktada sendeleyebilirsin.",
                        "Karanlikta hizli kararlar vermek zorundasin.",
                        "Sola donen bir kapali kapi... saga acik bir kapi... hangisi?"
                    ], 35, 1800);
                }
            }
        }
    },




    {
        keywords: ["ilerleme", "durum"],
        action: () => {
            writeSystem("Mevcut oyun asamasi: " + gameState.stage);
        }
    },
    {
        keywords: ["sex", "seks", "sikis", "porno", "hayir", "kudur", "mokar"],
        action: () => {
            writeSystem("Yapma ya. Fazla komiksin. Simarma.");
        }
    },
    {
        keywords: ["gonca","Gonca","atılgan","maviportakal", "mavi portakal", "Mavi portakal"],
        action: () => {
            writeSystem("Seni çok seviyorum");
        }
    }
    
];

// === Komut Isleyici ===
function handleCommand(cmd) {
    let matched = false;

    for (const command of commands) {
        for (const keyword of command.keywords) {
            if (cmd.includes(keyword)) {
                command.action(cmd); // ← cmd'yi action fonksiyonuna gönderiyoruz
                matched = true;
                break;
            }
        }
        if (matched) break;
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
