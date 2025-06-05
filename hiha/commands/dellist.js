// dellist.js
module.exports = async (sock, msg, args, isAdmin, db) => {
  if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Khusus admin' });

  const groupId = msg.key.remoteJid;
  const keyword = args[0];
  if (!db.lists?.[groupId]?.[keyword]) return sock.sendMessage(groupId, { text: '❌ List tidak ditemukan' });

  delete db.lists[groupId][keyword];
  sock.sendMessage(groupId, { text: `✅ List "${keyword}" berhasil dihapus.` });
};
