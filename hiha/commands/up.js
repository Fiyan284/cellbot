// up.js
module.exports = async (sock, msg, args, isAdmin, db) => {
  if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Admin only' });

  const [code, harga] = args;
  if (!code || !harga) return sock.sendMessage(msg.key.remoteJid, { text: 'Format: up <kode> <harga>' });

  if (!db.produk[code]) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Produk tidak ditemukan' });

  db.produk[code].harga = parseInt(harga);
  sock.sendMessage(msg.key.remoteJid, { text: `✅ Harga produk ${code} diperbarui.` });
};
