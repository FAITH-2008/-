import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import P from "pino";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({ status: "Bot is running" });
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection } = update;

        if (connection === "open") {
            console.log("✅ Bot connected");
        }

        if (connection === "close") {
            console.log("❌ Bot disconnected");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        const sender = msg.key.remoteJid;

        console.log("Message:", text);

        if (text === "/start") {
            await sock.sendMessage(sender, {
                text: "👋 Hello! Bot is alive ⚡"
            });
        }

        if (text === "/ping") {
            await sock.sendMessage(sender, {
                text: "🏓 Pong!"
            });
        }
    });
}

startBot();
