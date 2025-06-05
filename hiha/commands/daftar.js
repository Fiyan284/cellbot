// daftar.js
module.exports = async (sock, msg, args, db) => {
  const groupId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const nama = args.join(' ');

  if (!nama) return sock.sendMessage(groupId, { text: 'Format: daftar <namamu>' });

  db.users[sender] = db.users[sender] || {
    nama, saldo: 0, role: 'Member'
  };

  sock.sendMessage(groupId, { text: `✅ Pendaftaran berhasil: ${nama}` });
};
