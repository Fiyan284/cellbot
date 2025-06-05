// list.js
module.exports = async (sock, msg, args, isAdmin, db) => {
  if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Khusus admin' });

  const groupId = msg.key.remoteJid;
  const keyword = args[0];
  const item = db.lists?.[groupId]?.[keyword];

  if (!item) return sock.sendMessage(groupId, { text: '❌ List tidak ditemukan.' });

  if (item.media?.length > 0) {
    for (const media of item.media) {
      await sock.sendMessage(groupId, { ...media, caption: item.desc });
    }
  } else {
    sock.sendMessage(groupId, { text: item.desc });
  }
};
