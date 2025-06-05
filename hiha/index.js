// index.js
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import qrcode from 'qrcode-terminal';

const db = {
  users: JSON.parse(fs.existsSync('./db/users.json') ? fs.readFileSync('./db/users.json') : '{}'),
  lists: JSON.parse(fs.existsSync('./db/lists.json') ? fs.readFileSync('./db/lists.json') : '{}'),
  produk: JSON.parse(fs.existsSync('./db/produk.json') ? fs.readFileSync('./db/produk.json') : '{}')
};

const saveDB = () => {
  fs.writeFileSync('./db/users.json', JSON.stringify(db.users, null, 2));
  fs.writeFileSync('./db/lists.json', JSON.stringify(db.lists, null, 2));
  fs.writeFileSync('./db/produk.json', JSON.stringify(db.produk, null, 2));
};

const adminNumbers = ['6285801239557@s.whatsapp.net']; // Ganti dengan nomor adminmu

const COMMANDS = {
  addlist: './commands/addlist.js',
  list: './commands/list.js',
  dellist: './commands/dellist.js',
  open: './commands/openclose.js',
  close: './commands/openclose.js',
  ban: './commands/ban.js',
  promote: './commands/promote.js',
  demote: './commands/promote.js',
  h: './commands/h.js',
  daftar: './commands/daftar.js',
  info: './commands/info.js',
  role: './commands/role.js',
  up: './commands/up.js',
  topup: './commands/topup.js',
  ad: './commands/ad.js',
  adsaldo: './commands/adsaldo.js'
};

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
  logger: pino({ level: "silent" }),
  auth: state,
  version
});

  sock.ev.on("creds.update", saveCreds);

sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const isAdmin = isGroup && adminNumbers.includes(sender);

  let body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  let command = body.split(' ')[0].toLowerCase();
  const args = body.trim().split(' ').slice(1);

  if (command.startsWith('!')) command = command.slice(1);

  if (COMMANDS[command]) {
    try {
      const quoted = msg.message.extendedTextMessage?.contextInfo;
      const media = msg.message.imageMessage || msg.message.videoMessage
        ? {
            mimetype: msg.message.imageMessage?.mimetype || msg.message.videoMessage?.mimetype,
            message: msg.message.imageMessage || msg.message.videoMessage
          }
        : null;

      const handler = await import(COMMANDS[command]);
      await handler.default(sock, msg, args, isAdmin, quoted, media, db, command);
      saveDB();
    } catch (err) {
      console.log(err);
      sock.sendMessage(from, { text: '❌ Error pada command.' });
    }
  } else {
    // Autorespond dari list jika ada
    const groupLists = db.lists[from];
    if (groupLists && groupLists[body]) {
      const item = groupLists[body];
      if (item.media?.length > 0) {
        for (const media of item.media) {
          await sock.sendMessage(from, { ...media, caption: item.desc });
        }
      } else {
        sock.sendMessage(from, { text: item.desc });
      }
    }
  }
});
  sock.ev.on('group-participants.update', async (update) => {
    if (update.action === 'add') {
      for (const participant of update.participants) {
        await sock.sendMessage(update.id, { text: `👋 Selamat datang @${participant.split('@')[0]}!`, mentions: [participant] });
      }
    }
  });

sock.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    console.log("📱 Scan QR berikut:");
    qrcode.generate(qr, { small: true });
  }

  if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
    startSock();
  } else if (connection === 'open') {
    console.log("✅ Bot siap!");
  }
});
};

startSock();
