// h.js
module.exports = async (sock, msg, args, isAdmin) => {
  if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Admin only' });

  const text = args.join(' ') || '🔊';
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  const members = metadata.participants.map(p => p.id);

  await sock.sendMessage(msg.key.remoteJid, {
    text,
    mentions: members,
  });
};
