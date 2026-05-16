const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require("fs");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ["ShadowBot", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("✅ Connected");
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;

            console.log("❌ Closed reason:", reason);

            // IMPORTANT FIX: prevent infinite loop crash
            if (reason === DisconnectReason.loggedOut) {
                console.log("⚠️ Session logged out. Delete /session and rescan QR.");
                return;
            }

            setTimeout(startBot, 3000);
        }
    });
}

startBot();
