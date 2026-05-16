const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ["ShadowBot", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, pairingCode } = update;

        if (pairingCode) {
            console.log("📲 Pairing Code:", pairingCode);
        }

        if (connection === "open") {
            console.log("✅ Bot connected");
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;

            console.log("❌ Disconnected:", reason);

            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            }
        }
    });
}

startBot();
