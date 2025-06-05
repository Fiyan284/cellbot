const { spawn } = require('child_process');

function startBot() {
    const bot = spawn('node', ['c.js'], { stdio: 'inherit' });

    bot.on('exit', (code) => {
        console.log(`[Runner] Bot exited with code ${code}. Restarting...`);
        setTimeout(startBot, 100); // delay biar gak spam restart
    });
}

startBot();
