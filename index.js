const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");

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
            console.log("✅ Bot connected successfully");
        }

        if (connection === "close") {
            const reason =
                lastDisconnect?.error?.output?.statusCode;

            console.log("❌ Disconnected. Reason:", reason);

            // auto-reconnect
            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            } else {
                console.log("⚠️ Logged out. Re-scan QR needed.");
            }
        }
    });

    // simple test command
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (text === "ping") {
            await sock.sendMessage(msg.key.remoteJid, { text: "pong ✅" });
        }
    });
}

startBot();
