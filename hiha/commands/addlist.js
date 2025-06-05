// addlist.js
module.exports = async (sock, msg, args, isAdmin, quoted, media, db) => {
  if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Khusus admin' });

  const groupId = msg.key.remoteJid;
  const keyword = args[0];
  const text = args.slice(1).join(' ');

  if (!keyword || !text) return sock.sendMessage(groupId, { text: 'Format: addlist <kode> <deskripsi>' });

  db.lists[groupId] = db.lists[groupId] || {};
  db.lists[groupId][keyword] = db.lists[groupId][keyword] || { desc: text, media: [] };

  if (media) db.lists[groupId][keyword].media.push(media);

  sock.sendMessage(groupId, { text: `✅ List "${keyword}" ditambahkan.` });
};
