import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import P from "pino";

const app = express();

app.get("/", (req, res) => {
    res.send("Bot is alive");
});

app.listen(3000, () => console.log("Server running"));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
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
}

startBot();
