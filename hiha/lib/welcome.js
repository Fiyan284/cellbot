module.exports.welcomeNewMember = async (sock, update) => {
    const { id, participants, action } = update;
    if (action === 'add') {
        for (let user of participants) {
            await sock.sendMessage(id, {
                text: `Selamat datang @${user.split('@')[0]}! Ketik *daftar {namamu}* untuk mulai.`,
                mentions: [user]
            });
        }
    }
};
