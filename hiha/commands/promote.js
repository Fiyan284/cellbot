// promote.js
module.exports = async (sock, msg, command, quoted, isAdmin) => {
  if (!isAdmin || !quoted) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Admin only' });

  const target = quoted.participant;
  const action = command === 'promote' ? 'promote' : 'demote';

  await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], action);
  sock.sendMessage(msg.key.remoteJid, { text: `✅ Berhasil di-${action}` });
};
