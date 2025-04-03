const input = document.getElementById("input");
const output = document.getElementById("output");
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");

startButton.addEventListener("click", () => {
    titleScreen.style.display = "none";
    gameScreen.style.display = "block";
    input.focus();
});

// === Oyun Durumu ===
const gameState = {
    sandikAcildi: false,
    anahtarAlindi: false,
    kapiAcildi: false
};

// === Komutlar Tanimi ===
const commands = [
    {
        keywords: ["sandik ac", "ac sandik", "sandigi ac"],
        action: () => {
            if (!gameState.sandikAcildi) {
                gameState.sandikAcildi = true;
                gameState.anahtarAlindi = true;
                writeSystem("Sandigi actin. Icinde pasli bir anahtar buldun.");
            } else {
                writeSystem("Sandik zaten acildi. Icindeki anahtari aldin.");
            }
        }
    },
    {
        keywords: ["kapi ac", "ac kapi", "kapiyi ac"],
        action: () => {
            if (!gameState.kapiAcildi) {
                if (gameState.anahtarAlindi) {
                    gameState.kapiAcildi = true;
                    writeSystem("Anahtari kullandin. Kapi acildi! Bir sonraki odaya geciyorsun...");
                } else {
                    writeSystem("Kapi kilitli. Anahtara ihtiyacin var.");
                }
            } else {
                writeSystem("Kapi zaten acik.");
            }
        }
    },
    {
        keywords: ["anahtar kullan", "kullan anahtar", "anahtari kullan"],
        action: () => {
            if (gameState.anahtarAlindi && !gameState.kapiAcildi) {
                gameState.kapiAcildi = true;
                writeSystem("Anahtari kullandin. Kapi acildi!");
            } else if (gameState.kapiAcildi) {
                writeSystem("Kapi zaten acik.");
            } else {
                writeSystem("Elinde anahtar yok.");
            }
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
        writeSystem("Bu komutu anlayamadim.");
    }
}

// === Yazdirma Fonksiyonlari ===
function writeSystem(text, speed = 50) {
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
        }
    }

    typeNextChar();
}

function writePlayer(text) {
    const line = document.createElement("div");
    line.classList.add("player-input");
    line.innerText = "> " + text;
    output.appendChild(line);
    window.scrollTo(0, document.body.scrollHeight);
}

// === Input Dinleme ===
input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        const command = input.value.trim().toLowerCase();
        writePlayer(command);
        input.value = "";

        handleCommand(command);
    }
});
