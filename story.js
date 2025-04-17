// story.js

// === Komutlar Tanımı ===
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
    // ... diğer komutlar da buraya gelecek (kac, sol, sag, gonca, vs.)
];

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

    writeSystemSequence(intro, 1, 1, null, () => {
        showChoices([
            { text: "Makası al", onSelect: () => handleCommand("makasi al") },
            { text: "Çevrene bak", onSelect: () => handleCommand("cevrende ne var") }
        ]);
    });
}
