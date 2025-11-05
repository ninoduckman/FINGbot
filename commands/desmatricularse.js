const fs = require('fs');
const path = require('path');
const { materias } = require('../utils/data');

const USUARIOS_FILE = path.join(__dirname, '..', 'usuarios.json');

function loadUsuarios() {
    if (fs.existsSync(USUARIOS_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(USUARIOS_FILE, 'utf8'));
        } catch (err) {
            console.error('Error reading usuarios.json:', err);
            return {};
        }
    }
    return {};
}

function saveUsuarios(usuarios) {
    fs.writeFileSync(USUARIOS_FILE, JSON.stringify(usuarios, null, 2));
}

module.exports = async (message, args) => {
    if (args.length === 0) {
        message.reply("Uso: ^desmatricularse {CODIGO}\nEjemplo: ^desmatricularse P3");
        return;
    }

    const codigo = args[0].toUpperCase();
    const usuarios = loadUsuarios();
    const userId = message.author.id;

    if (!usuarios[userId] || !usuarios[userId].materias || !usuarios[userId].materias.includes(codigo)) {
        message.reply(`No estabas matriculado en **${codigo}**`);
        return;
    }

    usuarios[userId].materias = usuarios[userId].materias.filter(m => m !== codigo);
    saveUsuarios(usuarios);

    message.reply(`✅ Desmatriculado de **${codigo}**`);
};