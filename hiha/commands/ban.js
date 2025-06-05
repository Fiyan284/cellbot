// ban.js
module.exports = async (sock, msg, quoted, isAdmin) => {
  if (!isAdmin || !quoted) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Hanya admin bisa memban' });

  const banned = quoted.participant;
  await sock.groupParticipantsUpdate(msg.key.remoteJid, [banned], 'remove');
  sock.sendMessage(msg.key.remoteJid, { text: '✅ Pengguna telah diban.' });
};
