// topup.js
module.exports = async (sock, msg, args, db) => {
  const [code, id, server] = args;
  const sender = msg.key.participant || msg.key.remoteJid;
  const produk = db.produk[code];

  if (!produk || !id || !server) return sock.sendMessage(msg.key.remoteJid, { text: 'Format: topup <kode> <id> <server>' });

  const user = db.users[sender];
  if (!user || user.saldo < produk.harga) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Saldo tidak cukup' });

  user.saldo -= produk.harga;

  sock.sendMessage(msg.key.remoteJid, {
    text: `🛒 Top Up Berhasil Diterima\nProduk: ${produk.nama}\nID: ${id} (${server})\nHarga: Rp${produk.harga}\nStatus: Diproses\nWaktu: ${new Date().toLocaleString()}`
  });
};
