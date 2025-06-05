// openclose.js
module.exports = async (sock, msg, command, isAdmin) => {
  if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Khusus admin' });

  await sock.groupSettingUpdate(msg.key.remoteJid, command === 'open' ? 'not_announcement' : 'announcement');
  sock.sendMessage(msg.key.remoteJid, { text: `✅ Grup telah di-${command === 'open' ? 'buka' : 'tutup'}.` });
};
