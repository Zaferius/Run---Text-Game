const input = document.getElementById("input");
const output = document.getElementById("output");
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");

// Input kontrolü
let inputEnabled = true;

function disableInput() {
    input.disabled = true;
    inputEnabled = false;
}

function enableInput() {
    input.disabled = false;
    inputEnabled = true;
    input.focus();
}

startButton.addEventListener("click", () => {
    titleScreen.style.display = "none";
    gameScreen.style.display = "block";
    input.focus();
    startIntro();
});

// === Oyun Durumu ===
const gameState = {
    makasAlindi: false,
    kapidanCikildi: false
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
        "Gozlerini actiginda tavandaki florasanlar titriyor.",
        "Soguk bir hastane odasindasin. Vucudun sargilarla kapli.",
        "Kapinin arkasindan insan gibi ama degil gibi bir ciglik duyuluyor.",
        "Basini toparlayip yataktan kalkiyorsun...",
        "Yanimda bir makas var. Belki isime yarar.",
        "Ne yapmak istersin?"
    ];

    writeSystemSequence(intro, 15, 2000);
}

// === Komutlar Tanimi ===
const commands = [
    {
        keywords: ["makas al", "al makas"],
        action: () => {
            if (!gameState.makasAlindi) {
                gameState.makasAlindi = true;
                writeSystem("Makas artik sende. Sivri ve pasli. Bir silah gibi kullanabilirsin.");
            } else {
                writeSystem("Makas zaten elinde.");
            }
        }
    },
    {
        keywords: ["kapi ac", "ac kapi", "disari cik", "koridora cik"],
        action: () => {
            if (!gameState.kapidanCikildi) {
                gameState.kapidanCikildi = true;
                if (gameState.makasAlindi) {

                    const out1 = [
                        "Kapiyi araliyorsun... Disarida karanlik bir koridor, yerde kan izleri. Makasini daha sikiyorsun...",
                        "Bir ses yaklasiyor... NE YAPACAKSIN?"
                    ];

                    writeSystemSequence(out1, 40, 2000);
                } else {
                    writeSystem("Disari cikmaya calisiyorsun ama kendini koruyacak bir sey olmadan bu cok riskli.");
                }
            } else {
                writeSystem("Zaten koridordasin. Sesler yaklasiyor...");
            }
        }
    },
    {
        keywords: ["bagir", "yardim", "imdat"],
        action: () => {
            writeSystem("Bagiriyorsun... ama bu hataydi.");
            writeSystem("Sesler daha hizli yaklasiyor. Simdi ne yapacaksin?");
        }
    },
    {
        keywords: ["sex", "seks", "sikis", "porno", "hayir"],
        action: () => {
            writeSystem("Yapma ya. Fazla komiksin. Simarma.");
        }
    }
];

// === Komut Isleyici ===
function handleCommand(cmd) {
    let matched = false;

    for (const command of commands) {
        for (const keyword of command.keywords) {
            if (cmd.includes(keyword)) {
                command.action();
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

// === Sistem Yazdirma ===
function writeSystem(text, speed = 35, onComplete = null) {
    disableInput();

    const line = document.createElement("div");
    line.classList.add("system-message");
    output.appendChild(line);

    let i = 0;

    function typeNextChar() {
        if (i < text.length) {
            line.innerText += text.charAt(i);
            i++;
            setTimeout(typeNextChar, speed);
        } else {
            window.scrollTo(0, document.body.scrollHeight);
            if (onComplete) {
                setTimeout(onComplete, 100); // biraz gecikme ile
            } else {
                enableInput();
            }
        }
    }

    typeNextChar();
}

// === Coklu Sistem Mesaji (satir satir yaz) ===
function writeSystemSequence(lines, speed = 35, delayBetweenLines = 1500) {
    disableInput();
    let index = 0;

    function writeNextLine() {
        if (index < lines.length) {
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
