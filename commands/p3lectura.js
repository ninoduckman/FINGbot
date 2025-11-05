const fs = require('fs');
const { getCurrentWeek, getWeek } = require('../utils/weeks');

module.exports = async (message, args) => {
    let current;
    if(args.length > 0) {
        current = getWeek("week" + args[0]);
    } else {
        current = getCurrentWeek();
    }

    if (current) {
        console.log(`📘 ${current.weekName} (${current.start}–${current.end})`);
        console.log("Sections:", current.sections.join(", "));
        message.reply(`📘 **Semana ${current.weekName.slice(4)}** (${current.start}–${current.end})\nSecciones: ${current.sections.join(", ")}`);
        
        const filepath = `./weeks/${current.weekName}.pdf`;
        if (fs.existsSync(filepath)) {
            await message.reply({ files: [filepath] });
        }
    } else {
        console.log("No active week right now.");
    }
};