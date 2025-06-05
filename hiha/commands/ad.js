// ad.js
export default async function ad(sock, msg, args, isAdmin, quoted, media, db) {
  if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Hanya admin yang boleh menggunakan perintah ini.' });

  if (args.length < 3) return sock.sendMessage(msg.key.remoteJid, { text: 'Format salah! Ketik: ad {nama produk} {harga} {prefixCode}' });

  const prefixCode = args[args.length -1].toUpperCase();
  const harga = parseInt(args[args.length -2]);
  const namaProduk = args.slice(0, args.length -2).join(' ');

  if (isNaN(harga) || harga <= 0) return sock.sendMessage(msg.key.remoteJid, { text: 'Harga harus angka positif.' });
  if (!prefixCode.match(/^[A-Z]+$/)) return sock.sendMessage(msg.key.remoteJid, { text: 'Prefix code harus huruf kapital tanpa spasi.' });

  // Cari kode produk tertinggi dengan prefix yang sama
  let nomorTerbesar = 0;
  for (const code in db.produk) {
    if (code.startsWith(prefixCode)) {
      const nomorStr = code.slice(prefixCode.length);
      const nomor = parseInt(nomorStr);
      if (!isNaN(nomor) && nomor > nomorTerbesar) nomorTerbesar = nomor;
    }
  }

  const newKode = prefixCode + (nomorTerbesar + 1);

  db.produk[newKode] = {
    nama: namaProduk,
    harga: harga
  };

  sock.sendMessage(msg.key.remoteJid, {
    text: `✅ Produk berhasil ditambahkan!\nNama: ${namaProduk}\nKode Produk: ${newKode}\nHarga: Rp${harga.toLocaleString()}`
  });
}
