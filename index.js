// Import required modules 
const { Client, GatewayIntentBits } = require('discord.js'); 
const fs = require('fs');
require('dotenv').config(); 

const fechasExamenes = require('./exams.json');


// Create a new Discord client with message intent 
const client = new Client({ 
  intents: [ 
      GatewayIntentBits.Guilds,  
      GatewayIntentBits.GuildMessages,  
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions
    ] 
}); 

const materias = {
    "P1": "PROGRAMACION 1",
    "P2": "PROGRAMACION 2",
    "P3": "PROGRAMACION 3",
    "P4": "PROGRAMACION 4",
    "CDIV": "CALCULO DIF. E INTEGRAL EN UNA VARIABLE",
    "CDIVV": "CALCULO DIF. E INTEGRAL EN VARIAS VARIABLES",
    "GAL": "GEOMETRIA Y ALGEBRA LINEAL 1",
    "GAL1": "GEOMETRIA Y ALGEBRA LINEAL 1",
    "GAL2": "GEOMETRIA Y ALGEBRA LINEAL 2",
    "MD1": "MATEMATICA DISCRETA 1",
    "MD2": "MATEMATICA DISCRETA 2",
    "LOGICA": "LOGICA",
    "PYE": "PROBABILIDAD Y ESTADISTICA"
    // agrega los que necesites
};

// Bot is ready 
client.once('ready', () => { 
  console.log(`🤖 Logged in as ${client.user.tag}`); 
}); 

// Listen and respond to messages 
client.on('messageCreate', async (message) => { 

  // Ignore messages from bots 
  if (message.author.bot || message.content[0] != '^') return; 

  var args = message.content.split(" ");
  console.log(args[0]);

  switch(args[0]) {
    case "^examen":
        {
            const input = args.slice(1).join(' ').toUpperCase();
            const materia = materias[input] || input;
            const e = fechasExamenes.find(ex => ex.subject === materia);
            if(e != undefined)
                message.reply(e.date + " " + e.time);
            else
                message.reply("no hay examen con ese nombre :(")
        }
    break;
    case "^matricularse":
        {
            if(args.length == 1 || !materias[args[1].toUpperCase()]){
                message.reply("materias:");
                return;
            }
            const role = await message.guild.roles.cache.find(role => role.name == args[1]);
            const member = await message.guild.members.fetch(message.author.id).catch(() => null);
            try {
                await member.roles.add(role);
                message.reply(`Matriculado en **${role.name}**`);
            } catch(err) {
                console.error(err);
                message.reply("no existe brother");
            }
        }
    break;
    case "^desmatricularse":
        {
            if(args.length == 1){
                message.reply("materias:");
                return;
            }
            const role = await message.guild.roles.cache.find(role => role.name == args[1]);
            const member = await message.guild.members.fetch(message.author.id).catch(() => null);
            try {
                await member.roles.remove(role);
                message.reply(`Desmatriculado en **${role.name}**`);
            } catch(err) {
                console.error(err);
                message.reply("no existe brother");
            }
        }
    break;
  }
});   


// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN); 
