import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

async function startBot() {
  const sock = makeWASocket({
    auth: undefined, // Will be set after first login
    printQRInTerminal: true, // Shows QR code in terminal
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect.error instanceof Boom)?.output.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed due to', lastDisconnect.error, ', reconnecting ', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot connected to WhatsApp!');
    }
  });

  // Listen for incoming messages
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    console.log('📨 New message from', msg.key.remoteJid);
    
    // Echo message back (replace with your bot logic)
    await sock.sendMessage(msg.key.remoteJid, { text: 'Hello! Message received.' });
  });

  return sock;
}

app.get('/', (req, res) => {
  res.json({ status: 'Bot is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startBot();
});
