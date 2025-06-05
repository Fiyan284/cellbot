const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const LISTS_FILE = path.join(__dirname, 'lists.json');

if (!fs.existsSync(LISTS_FILE)) fs.writeFileSync(LISTS_FILE, JSON.stringify({}));

const loadLists = () => {
    try {
        return JSON.parse(fs.readFileSync(LISTS_FILE));
    } catch (err) {
        console.error('Error loading lists:', err);
        return {};
    }
};

const saveLists = (data) => {
    try {
        fs.writeFileSync(LISTS_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error saving lists:', err);
    }
};

let client;

const startClient = () => {
    client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
        console.log('QR Code received, scan it!');
    });

    client.on('ready', () => {
        console.log('✅ Bot siap dan terhubung!');
    });

    client.on('disconnected', async (reason) => {
        console.error('❌ Client disconnected:', reason);
        console.log('🔄 Closing client and exiting...');
        await client.destroy();
        process.exit(1);
    });

    client.on('auth_failure', async (msg) => {
        console.error('⚠️ Authentication failed:', msg);
        console.log('🔄 Closing client and exiting...');
        await client.destroy();
        process.exit(1);
    });

    const lists = loadLists();

    client.on('message', async (message) => {
        try {
            const chat = await message.getChat();
            const sender = message.from;
            const body = message.body.trim();
            const lowerBody = body.toLowerCase();
            const isPrivate = !sender.endsWith('@g.us');
            const TARGET_GROUP_ID = '120363417712869256@g.us';
            const OWNER_ID = '6285801239557@c.us';

            // --- Handle command /t dari owner ---
            if (lowerBody.startsWith('/t')) {
                if (!isPrivate || sender !== OWNER_ID) {
                    return message.reply('❌ Perintah ini hanya bisa digunakan di chat pribadi oleh pemilik.');
                }

                const content = body.slice(2).trim();

                if (!content && !message.hasMedia) {
                    return message.reply('⚠️ Kirim teks atau gambar setelah perintah /t.');
                }

                if (message.hasMedia) {
                    const media = await message.downloadMedia();
                    if (!media) return message.reply('⚠️ Gagal mengambil media.');

                    await client.sendMessage(TARGET_GROUP_ID, media, {
                        caption: content || '',
                    });

                    return message.reply('✅ Media berhasil dikirim ke grup.');
                }

                await client.sendMessage(TARGET_GROUP_ID, content);
                return message.reply('✅ Pesan teks berhasil dikirim ke grup.');
            }

            const participants = await chat.participants;
            const groupAdmins = participants
              .filter(p => p.isAdmin || p.isSuperAdmin)
              .map(p => p.id._serialized);
            const senderId = message.author || message.from;
            const isAdmin = groupAdmins.includes(senderId);

            const linkRegex = /(https?:\/\/[^\s]+)/gi;
            const timeLimit = 3 * 60 * 1000; // 3 menit dalam milidetik
            
            if (linkRegex.test(message.body) && !isAdmin) {
                try {
                    const userId = message.author || message.from; // ambil ID pengirim (grup/pribadi)
                    
                    // Mengambil pesan sebelumnya di chat (misalnya 20 pesan terakhir)
                    const messages = await chat.fetchMessages({ limit: 20 });
            
                    // Filter pesan-pesan dari user yang sama dan berisi link yang belum lebih dari 3 menit
                    const messagesToDelete = messages.filter(msg => 
                        msg.from === userId && 
                        linkRegex.test(msg.body) && 
                        (Date.now() - msg.timestamp) <= timeLimit // Cek jika pesan tidak lebih dari 3 menit
                    );
                    // Hapus setiap pesan yang berisi link dan belum lebih dari 3 menit
                    for (let msg of messagesToDelete) {
                        await msg.delete(true); // Hapus pesan
                    }
                        await message.delete(true); // Hapus pesan link yang baru saja diterima

                    // Kick user
                    await chat.removeParticipants([userId]);

                } catch (e) {
                    console.error('Gagal menghapus pesan atau mengubah setting:', e);
                }
            }

if (lowerBody === '/open' && isAdmin) {
  await chat.setMessagesAdminsOnly(false);
  const author = await message.getContact();
  const mentionTag = `@${author.pushname || author.number}`;
  await chat.sendMessage(
    `📢 *[INFO TOKO]*\n\n` +
    `🟢 *Grup Telah Dibuka!*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Halo pelanggan setia!\nGrup ini telah *dibuka kembali* dan semua member kini dapat mengirim pesan seperti biasa. Silakan chat admin untuk melakukan pemesanan, tanya stok, atau konsultasi lainnya 💬\n\n` +
    `🔓 *Status:* Grup Aktif (Bebas Chat)\n` +
    `🕒 *Waktu:* ${new Date().toLocaleString('id-ID')}\n` +
    `👤 *Dibuka oleh:* ${mentionTag}\n\n` +
    `Terima kasih telah berbelanja di toko kami! 🛍️`,
    {
      mentions: [author.id._serialized]
    }
  );

} else if (lowerBody === '/close' && isAdmin) {
  await chat.setMessagesAdminsOnly(true);
  const author = await message.getContact();
  const mentionTag = `@${author.pushname || author.number}`;
  await chat.sendMessage(
    `📢 *[INFO TOKO]*\n\n` +
    `🔴 *Grup Telah Ditutup Sementara!*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Untuk sementara, hanya admin yang dapat mengirim pesan di grup ini.\nJika Anda memiliki pertanyaan atau pesanan, silakan hubungi admin via chat pribadi 📩\n\n` +
    `🔒 *Status:* Grup Terkunci (Hanya Admin)\n` +
    `🕒 *Waktu:* ${new Date().toLocaleString('id-ID')}\n` +
    `👤 *Ditutup oleh:* ${mentionTag}\n\n` +
    `Terima kasih atas pengertian Anda 🙏`,
    {
      mentions: [author.id._serialized]
    }
  );

} else if ((lowerBody === '/open' || lowerBody === '/close') && !isAdmin) {
  await message.reply(
    `⛔ *Akses Ditolak!*\n\n` +
    `Perintah ini hanya bisa digunakan oleh *admin toko*.\nHubungi admin jika Anda merasa ini kesalahan.`
  );

// --- Perintah .p dan .d (khusus admin) ---
} else if (isAdmin && (body.toLowerCase().startsWith('.p') || body.toLowerCase().startsWith('.d'))) {
    const now = new Date();
    const formatTime = now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    if (!message.hasQuotedMsg) return message.reply('❌ Gunakan perintah ini dengan me-reply pesan yang sesuai.');

    const quotedMsg = await message.getQuotedMessage();
    const quotedText = quotedMsg.body || '';

    function generateRandomId(length = 18) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    if (body.toLowerCase().startsWith('.p')) {
        const nomorAkun = quotedText.split('\n')
            .map(line => line.trim())
            .filter(line => line.match(/^\d{6,}(?:\s\d{4,})?$/)) // tangkap 1 atau 2 ID akun
            .join(' ') || 'Tidak ditemukan';

        const harga = body.slice(2).trim(); // hilangkan prefix ".p"
        const hargaText = harga ? `*Harga* : ${harga}\n` : '';
        const trxId = generateRandomId();

        const pesan = `*Rincian Pesanan*\n*============*\n*ID TRX* : ${trxId}\n*ID Akun* : ${nomorAkun}\n${hargaText}*Waktu* : ${formatTime}\n*Status* : *Proses*\n\n_Note_ : Terimakasih sudah bertransaksi di *CelaStore*!!`;
        await message.reply(pesan);

    } else if (body.toLowerCase().startsWith('.d')) {
        const idAkun = quotedText.match(/\*ID Akun\* ?: (.+)/)?.[1]?.trim() || 'Tidak ditemukan';
        const harga = quotedText.match(/\*Harga\* ?: (.+)/)?.[1]?.trim() || '';
        const trxId = quotedText.match(/\*ID TRX\* ?: (.+)/)?.[1]?.trim() || generateRandomId();
        const hargaText = harga ? `*Harga* : ${harga}\n` : '';

        const pesan = `*Rincian Pesanan*\n*============*\n*ID TRX* : ${trxId}\n*ID Akun* : ${idAkun}\n${hargaText}*Waktu* : ${formatTime}\n*Status* : *Succes*\n\n_Note_ : Terimakasih sudah bertransaksi di *CelaStore*!!`;
        await message.reply(pesan);
    }

    } else if (lowerBody === '/list') {
       const list = lists[chat.id] || [];
       if (list.length === 0) return await message.reply('_Belum ada list ditambahkan._');

       // Urutkan berdasarkan kode huruf A-Z (case-insensitive)
       const sortedList = list.sort((a, b) => a.kode.toLowerCase().localeCompare(b.kode.toLowerCase()));

       const text = sortedList.map((item, i) => `- ${item.kode} -- ${item.judul}\n`).join('\n');
       await message.reply(`📋 *DAFTAR LIST*\n▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n${text}`);

            } else if (lowerBody.startsWith('/addlist') && isAdmin) {
                const args = body.slice(9).trim().split('|');
                if (args.length < 3) return await message.reply('Format salah!\nContoh: /addlist kode|isi|judul');

                const [kode, isi, judul] = args;
                let gambarPath = null;

                if (message.hasMedia) {
                    const media = await message.downloadMedia();
                    gambarPath = path.join(__dirname, `img_${Date.now()}.jpg`);
                    fs.writeFileSync(gambarPath, Buffer.from(media.data, 'base64'));
                }

                if (!lists[chat.id]) lists[chat.id] = [];
                lists[chat.id].push({ kode: kode.toLowerCase(), isi, judul, gambar: gambarPath });
                saveLists(lists);

                await message.reply(`✅ List ditambahkan:\n*${judul}*`);
                if (gambarPath && fs.existsSync(gambarPath)) {
                    const media = MessageMedia.fromFilePath(gambarPath);
                    await chat.sendMessage(media, { caption: isi });
                }

            } else if (lowerBody.startsWith('/updatelist') && isAdmin) {
                const args = body.slice(12).trim().split('|');
                const kode = args[0]?.toLowerCase();
                const isiBaru = args[1];
                const judulBaru = args[2];

                if (!kode || !isiBaru) return await message.reply('Format salah!\nContoh: /updatelist kode|IsiBaru|[JudulBaru]');

                const list = lists[chat.id] || [];
                const idx = list.findIndex(item => item.kode === kode);

                if (idx === -1) return await message.reply(`List dengan kode "${kode}" tidak ditemukan.`);

                list[idx].isi = isiBaru;
                if (judulBaru) list[idx].judul = judulBaru;
                saveLists(lists);

                await message.reply(`✅ List "${kode}" berhasil diperbarui.`);

            } else if (lowerBody.startsWith('/dellist') && isAdmin) {
                const kode = body.split(' ')[1]?.toLowerCase();
                const list = lists[chat.id] || [];
                const idx = list.findIndex(item => item.kode === kode);

                if (idx !== -1) {
                    const deleted = list.splice(idx, 1)[0];
                    saveLists(lists);
                    await message.reply(`🗑️ List "${deleted.judul}" dengan kode "${deleted.kode}" dihapus.`);
                } else {
                    await message.reply(`List dengan kode "${kode}" tidak ditemukan.`);
                }

            } else if (lowerBody.startsWith('/h') && isAdmin) {
                const quoted = message.hasQuotedMsg ? await message.getQuotedMessage() : null;
                const teks = quoted ? quoted.body : body.slice(2).trim() || '👋';
                const mentions = chat.participants.map(p => p.id._serialized);
                await chat.sendMessage(teks, { mentions });

            } else if (lowerBody === '/resbot' && isAdmin) {
                await message.reply('♻️ Merestart bot...');
                await client.destroy();
                process.exit(0);

            } else if (lowerBody === '/menu') {
                const menuText = `
📖 *MENU UTAMA BOT* 📖

🛠 *Admin Commands*
- /open — Buka grup
- /close — Tutup grup
- /setopen [pesan] — Ubah pesan saat /open
- /setclose [pesan] — Ubah pesan saat /close
- /h [teks] — Mention semua member
- /resbot — Restart bot

📋 *List Commands*
- /list — Tampilkan semua list
- /addlist kode|isi|judul — Tambah list
- /updatelist kode|isiBaru|[judulBaru] — Update list
- /dellist kode — Hapus list

🤖 *Auto Response*
- Ketik kode list untuk balasan otomatis. tanpa prefix (/)

📎 *Catatan:*
- Gunakan "|" tanpa spasi antar pemisah.
- Semua perintah admin hanya untuk admin grup.
`;
                await message.reply(menuText);
            }

            const currentGroupList = lists[chat.id] || [];
            const matchedItem = currentGroupList.find(item => item.kode === lowerBody);

            if (matchedItem) {
                if (matchedItem.gambar && fs.existsSync(matchedItem.gambar)) {
                    const media = MessageMedia.fromFilePath(matchedItem.gambar);
                    await chat.sendMessage(media, { caption: matchedItem.isi });
                } else {
                    await message.reply(matchedItem.isi);
                }
            }
        } catch (err) {
            console.error('❌ Error handling message:', err.message);
        }
    });

    client.initialize();
};

startClient();

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔴 Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('🔴 Uncaught Exception:', err);
});
