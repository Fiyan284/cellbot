// info.js
module.exports = async (sock, msg, db) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const user = db.users[sender];

  if (!user) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Kamu belum daftar. Ketik: daftar <nama>' });

  sock.sendMessage(msg.key.remoteJid, {
    text: `👤 Nama: ${user.nama}\n💰 Saldo: ${user.saldo}\n🎖️ Role: ${user.role}`
  });
};
