// role.js
module.exports = async (sock, msg) => {
  sock.sendMessage(msg.key.remoteJid, {
    text: `🎖️ Daftar Role:\n• Elite: 5.000 (-0.5%)\n• Platinum: 15.000 (-1.3%)\n• Reseller: 25.000 (-2%)`
  });
};
