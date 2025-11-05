const fs = require('fs');

module.exports = async (message, args) => {
    if (!message.member.permissions.has("Administrator")) {
        return message.reply("❌ Solo administradores.");
    }

    const attachment = message.attachments.first();
    if (!attachment) {
        return message.reply("❌ Debes adjuntar un archivo PDF.");
    }

    const isExamenes = args[0] === "examenes";
    const expectedFile = isExamenes ? "examenes.pdf" : "parciales.pdf";
    const savePath = `./horarios/${expectedFile}`;

    if (!attachment.name.toLowerCase().endsWith(".pdf")) {
        return message.reply("❌ Solo se aceptan archivos PDF.");
    }

    const res = await fetch(attachment.url);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(savePath, Buffer.from(buffer));

    message.reply(`📁 Se ha actualizado el archivo **${expectedFile}** correctamente.`);
};