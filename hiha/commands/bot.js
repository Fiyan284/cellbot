module.exports = {
    bot: async (sock, m) => {
        await sock.sendMessage(m.chat, { text: 'Bot aktif dan siap digunakan!' });
    }
};
