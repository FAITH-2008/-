const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require("fs");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        auth: state,
        const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        auth: state,
        browser: ["ShadowBot", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    // MANUAL QR HANDLING (IMPORTANT FIX)
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("📲 Scan this QR in WhatsApp Linked Devices");
            console.log(qr);
        }

        if (connection === "open") {
            console.log("✅ Bot connected");
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;

            console.log("❌ Disconnected:", reason);

            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            } else {
                console.log("⚠️ Logged out. Delete session and rescan QR.");
            }
        }
    });
}

startBot();
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
