import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import P from "pino";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

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
                text: "👋 Hello! Shadow bot is alive ⚡"
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
