module.exports = {
    "!menu": async (sock, m) => {
        await sock.sendMessage(m.chat, {
            text: `*📖 Menu Bot:*

- bot
- !menu
- addlist
- list
- dellist
- open / close
- promote / demote
- ban
- h
- daftar {nama}
- info
- role
- topup {kode} {id} {server}
- up {kode} {harga}
- ad {nama} {harga}
`
        });
    }
};
