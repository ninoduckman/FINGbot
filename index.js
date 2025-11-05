const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const cron = require("node-cron");

const { loadSeenPosts } = require('./utils/seen-posts');
const { checkAllForums } = require('./utils/forum');

// Create a new Discord client with message intent 
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Load commands from the commands directory
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands'))
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    const commandName = file.split('.')[0];
    commands.set(commandName, command);
}

// Set up cron job for forum checks
cron.schedule("0 12,18,23 * * *", () => {
    checkAllForums();
});

// Bot is ready 
client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    loadSeenPosts();
    checkAllForums(); // Initial check
});

// Listen and respond to messages 
client.on('messageCreate', async (message) => {
    // Ignore messages from bots or messages that don't start with ^
    if (message.author.bot || message.content[0] !== '^') return;

    // Parse command and arguments
    const args = message.content.slice(1).split(' ');
    const commandName = args.shift().toLowerCase();

    // Special handling for upload commands that share the same handler
    if (commandName === 'subirexamenes' || commandName === 'subirparciales') {
        const handler = commands.get('subirArchivos');
        if (handler) {
            await handler(message, [commandName === 'subirexamenes' ? 'examenes' : 'parciales']);
        }
        return;
    }

    // Execute command if it exists
    const command = commands.get(commandName);
    if (command) {
        try {
            await command(message, args);
        } catch (error) {
            console.error(error);
            await message.reply('Hubo un error al ejecutar el comando.');
        }
    }
});


// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN); 