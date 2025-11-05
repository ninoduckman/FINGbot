const fs = require('fs');
const path = require('path');
const { materias, fechasParciales } = require('../utils/data');

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

function formatDate(date) {
    const options = { weekday: 'short', month: 'numeric', day: 'numeric' };
    return date.toLocaleDateString('es-UY', options);
}

module.exports = async (message) => {
    const usuarios = loadUsuarios();
    const userId = message.author.id;

    if (!usuarios[userId] || !usuarios[userId].materias || usuarios[userId].materias.length === 0) {
        message.reply("No estás matriculado en ninguna materia. Usa ^matricularse {CODIGO} para agregar materias.");
        return;
    }

    const userMaterias = usuarios[userId].materias;
    const userParciales = [];

    // Collect all parciales for user's subjects
    for (const codigo of userMaterias) {
        const materia = materias[codigo][0] || codigo;
        const parciales = fechasParciales.filter(p => 
            p.subject.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() === materia ||
            p.subject.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() === codigo
        );

        for (const parcial of parciales) {
            const [day, month, year] = parcial.date.split('/');
            const date = new Date(`${year}-${month}-${day}T${parcial.time}`);
            userParciales.push({
                codigo,
                date,
                time: parcial.time
            });
        }
    }

    // Sort by date
    userParciales.sort((a, b) => a.date - b.date);

    if (userParciales.length === 0) {
        message.reply("No hay parciales programados para tus materias.");
        return;
    }

    // Format the calendar
    const today = new Date();
    const calendarLines = ["## 📅 Calendario de Parciales\n"];
    
    for (const parcial of userParciales) {
        const dateStr = formatDate(parcial.date);
        const timeStr = parcial.time.substring(0, 5);  // HH:mm format
        const isPast = parcial.date < today;
        
        const line = isPast ? 
            `~~${dateStr} ${timeStr} - **${parcial.codigo}**~~` :
            `${dateStr} ${timeStr} - **${parcial.codigo}**`;
            
        calendarLines.push(line);
    }

    message.reply(calendarLines.join('\n'));
};