const { materias, fechasParciales } = require('../utils/data');

module.exports = async (message, args) => {
    if (!args.length) {
        message.reply("Debes especificar el código de la materia.");
        return;
    }

    const input = args.join(' ').toUpperCase();
    if (!materias[input]) {
        message.reply("Esta materia no existe watafac");
        return;
    }

    const materia = materias[input][0] || input;
    const e = fechasParciales.find(ex => 
        (ex.subject.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() === materia) || 
        (ex.subject.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() === input)
    );

    if (!e) {
        message.reply("No hay parcial con ese nombre :(");
        return;
    }

    const [day, month, year] = e.date.split('/');
    const examDate = new Date(`${year}-${month}-${day}T${e.time}`);

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const formattedDate = examDate.toLocaleDateString('es-UY', options);
    const formattedTime = examDate.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false });

    message.reply(`## 📚 ${e.subject}\n🗓️   ${formattedDate}\n🕒   ${formattedTime}`);
};