function serialize(sock, msg) {
    msg.isGroup = msg.key.remoteJid.endsWith('@g.us');
    msg.sender = msg.key.fromMe ? sock.user.id : msg.key.participant || msg.key.remoteJid;
    msg.body = msg.message?.conversation ||
               msg.message?.extendedTextMessage?.text ||
               msg.message?.imageMessage?.caption ||
               msg.message?.videoMessage?.caption || '';
    msg.reply = (text) => sock.sendMessage(msg.chat, { text }, { quoted: msg });
    msg.chat = msg.key.remoteJid;
    return msg;
}
module.exports = { serialize };
