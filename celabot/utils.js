// utils.js

// Fungsi untuk menghasilkan Transaction ID
function generateTransactionId() {
    return 'TXN' + Date.now(); // contoh format ID transaksi
}

// Fungsi untuk mendapatkan waktu saat ini dalam format tertentu
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

module.exports = { generateTransactionId, getCurrentTime };
