// adsaldo.js
export default async function adsaldo(sock, msg, args, isAdmin, quoted, media, db) {
  if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Hanya admin yang boleh menggunakan perintah ini.' });

  if (args.length < 2) return sock.sendMessage(msg.key.remoteJid, { text: 'Format salah! Ketik: adsaldo {nomor_member} {jumlah}' });

  const nomor = args[0].includes('@') ? args[0] : `${args[0]}@s.whatsapp.net`;
  const jumlah = parseInt(args[1]);

  if (isNaN(jumlah) || jumlah <= 0) return sock.sendMessage(msg.key.remoteJid, { text: 'Jumlah saldo harus angka positif.' });

  if (!db.users[nomor]) {
    return sock.sendMessage(msg.key.remoteJid, { text: 'Nomor member tidak ditemukan di database.' });
  }

  db.users[nomor].saldo = (db.users[nomor].saldo || 0) + jumlah;

  sock.sendMessage(msg.key.remoteJid, { text: `✅ Berhasil menambahkan saldo Rp${jumlah.toLocaleString()} ke member ${nomor}` });
}
