const fs = require('fs');
const path = require('path');
const commands = fs.readdirSync(__dirname).filter(file => file !== 'index.js');

const handlers = {};
for (const file of commands) {
  const command = path.parse(file).name;
  handlers[command] = require(path.join(__dirname, file));
}

async function handleCommand(sock, m, db, isAdmin, quoted, media) {
  const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
  const command = body.trim().split(" ")[0].toLowerCase().replace(/^!/, "");
  const args = body.trim().split(" ").slice(1);

  if (handlers[command]) {
    await handlers[command](sock, m, args, isAdmin, quoted, media, db, command);
  }
}

module.exports = { handleCommand };
