const { materias, saveMaterias } = require('../utils/data');

module.exports = async (message, args) => {
    if (!message.member.permissions.has("Administrator")) {
        return message.reply("❌ Solo administradores.");
    }

    if (args.length < 2) {
        return message.reply("Uso: `!actualizar_link CODIGO URL`");
    }

    const code = args[0].toUpperCase();
    const link = args[1];

    if (!materias[code]) {
        return message.reply("❌ Esa materia no existe.");
    }

    materias[code][1] = link;
    saveMaterias();

    message.reply(`🔗 Link actualizado para **${code}**:\n${link}`);
};