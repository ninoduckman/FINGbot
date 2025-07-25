// Import required modules 
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const cron = require("node-cron");
const cheerio = require("cheerio");
const path = require('path');

const SEEN_FILE = path.join(__dirname, 'seen_posts.json');
const MATERIAS_FILE = path.join(__dirname, "materias.json");

const fechasExamenes = require('./exams.json');

let lastSeenTitles = {};

function loadSeenPosts() {
    if (fs.existsSync(SEEN_FILE)) {
        try {
            const raw = fs.readFileSync(SEEN_FILE, 'utf-8');
            lastSeenTitles = JSON.parse(raw);
        } catch (err) {
            console.error('❌ Error reading seen posts:', err);
        }
    }
}

function saveSeenPosts() {
    fs.writeFileSync(SEEN_FILE, JSON.stringify(lastSeenTitles, null, 2));
}
let materias = {};
function loadMaterias() {
    if (fs.existsSync(MATERIAS_FILE)) {
        materias = JSON.parse(fs.readFileSync(MATERIAS_FILE, "utf8"));
    }
}

function saveMaterias() {
    fs.writeFileSync(MATERIAS_FILE, JSON.stringify(materias, null, 2));
}

// Create a new Discord client with message intent 
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});




async function checkForum(name, channel) {
    const materiaInfo = materias[name];
    if (materiaInfo == null) {
        if (channel) channel.send("Parece haber un error, este grupo no esta en la lista de materias con foros :(");
        return;
    }
    const url = materiaInfo[1];
    if (!url) {
        console.log(name);
        if(channel) channel.send("Este canal no tiene un foro asociado! pidele a un administrador que utilice `^agregarForo " + name + " {url}`");
        return;
    }

    try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = await cheerio.load(html);

        // Select the first forum discussion row
        const firstDiscussion = $("tr.discussion").first();

        // Extract title and link from the <a> tag inside <th class="topic">
        const aTag = firstDiscussion.find("a[href*='mod/forum/discuss.php?d=']").first();
        const title = aTag.text().trim();
        const link = aTag.attr("href")?.trim();

        if (!title || !link) { console.log(firstDiscussion); return; }

        // Avoid duplicate notifications
        if (lastSeenTitles[name] !== title) {
            lastSeenTitles[name] = title;
            saveSeenPosts();

            // Ensure full URL
            const fullLink = link.startsWith("http") ? link : new URL(link, url).href;

            const postRes = await fetch(fullLink);
            const postHtml = await postRes.text();
            const $$ = cheerio.load(postHtml);

            const firstPost = $$('.post-content-container').first();
            const paragraphs = [];

            firstPost.find('p').each((i, el) => {
                const text = $$(el).text().trim();
                if (text) paragraphs.push(text);
            });

            // Combine into one message block (or split if too long for Discord)
            const postText = paragraphs.join('\n\n');


            const guild = client.guilds.cache.get("1212035805212573706");
            if (!guild) return console.error("Guild not found!");

            const channel = guild.channels.cache.find(
                (ch) => ch.type === 0 && ch.name.toLowerCase() === name.toLowerCase()
            );
            if (channel != null) {
                const message = `📢 Nuevo post en **${name}**:\n**${title}**\n🔗 ${fullLink}`;

                await channel.send(message);

                if (postText.length > 0) {
                    // Split if needed (Discord limit is 2000)
                    const chunks = postText.match(/[\s\S]{1,1900}([\n\r]|$)/g) || [];
                    for (const chunk of chunks) {
                        await channel.send(">>> " + chunk);
                    }
                }
            }
            else
                console.log("nuhuh" + fullLink);
        }
        else if (channel) {
            channel.send("Nada nuevo en el foro!")
        }
    } catch (err) {
        console.error(`❌ Error checking forum "${name}":`, err.message);
    }
}

async function checkAllForums() {
    for (const name of Object.keys(materias)) {
        await checkForum(name);
    }
}
cron.schedule("1 2 * * *", () => {
    checkAllForums();
});

// Bot is ready 
client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    loadSeenPosts();
    loadMaterias();
    checkAllForums(); // Initial check
});

// Listen and respond to messages 
client.on('messageCreate', async (message) => {

    // Ignore messages from bots 
    if (message.author.bot || message.content[0] != '^') return;

    var args = message.content.split(" ");
    console.log(args[0]);

    switch (args[0]) {
        case "^examen":
            {
                const input = args.slice(1).join(' ').toUpperCase();
                const materia = materias[input][0] || input;
                const e = fechasExamenes.find(ex => ex.subject === materia);
                const [day, month, year] = e.date.split('/');
                const examDate = new Date(`${year}-${month}-${day}T${e.time}`);

                const options = { weekday: 'long', month: 'long', day: 'numeric' };
                const formattedDate = examDate.toLocaleDateString('es-UY', options);
                const formattedTime = examDate.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
                if (e != undefined)
                    message.reply(`## 📚 ${e.subject}\n🗓️   ${formattedDate}\n🕒   ${formattedTime}`);
                else
                    message.reply("no hay examen con ese nombre :(")
            }
            break;
        case "^matricularse":
            {
                if (args.length == 1 || !materias[args[1].toUpperCase()][0]) {
                    message.reply("materias:");
                    return;
                }
                const role = await message.guild.roles.cache.find(role => role.name == args[1]);
                const member = await message.guild.members.fetch(message.author.id).catch(() => null);
                try {
                    await member.roles.add(role);
                    message.reply(`Matriculado en **${role.name}**`);
                } catch (err) {
                    console.error(err);
                    message.reply("no existe brother");
                }
            }
            break;
        case "^desmatricularse":
            {
                if (args.length == 1) {
                    message.reply("materias:");
                    return;
                }
                const role = await message.guild.roles.cache.find(role => role.name == args[1]);
                const member = await message.guild.members.fetch(message.author.id).catch(() => null);
                try {
                    await member.roles.remove(role);
                    message.reply(`Desmatriculado en **${role.name}**`);
                } catch (err) {
                    console.error(err);
                    message.reply("no existe brother");
                }
            }
            break;
        case "^novedades":
            {
                checkForum(message.channel.name.toUpperCase(), message.channel);
            }
            break;
        case "^agregarMateria":
            {
                if (!message.member.permissions.has("Administrator")) return message.reply("❌ Solo administradores.");

                if (args.length < 3) return message.reply("Uso: `^agregar_materia {abreviacion} {nombre oficial (igual al de las tablas de pruebas)}`");

                const code = args[1].toUpperCase();
                const name = args.slice(2).join(" ");

                const channel = message.guild.channels.cache.find(
                    (ch) => ch.type === 0 && ch.name.toLowerCase() === code.toLowerCase()
                );
                if (!channel) {
                    message.guild.channels.create({
                        name: code.toLowerCase(),
                        type: ChannelType.GuildText,
                        parent: "1212036115314376796"
                    });
                }

                if (materias[code]) {
                    message.reply(`✅ Nombre de materia actualizado, de **${materias[code]}** a **${name.toUpperCase()}**`);
                    materias[code] = name;
                    return;
                }

                materias[code] = [name, ""];
                saveMaterias();


                message.reply(`✅ Materia **${name}** agregada como código **${code}**.`);
            }
            break;
        case "^agregarForo":
            {
                if (!message.member.permissions.has("Administrator")) return message.reply("❌ Solo administradores.");

                if (args.length < 3) return message.reply("Uso: `!actualizar_link CODIGO URL`");

                const code = args[1].toUpperCase();
                const link = args[2];

                if (!materias[code]) return message.reply("❌ Esa materia no existe.");

                materias[code][1] = link;
                saveMaterias();

                message.reply(`🔗 Link actualizado para **${code}**:\n${link}`);
            }
            break;
        case "^help":
            {
                const helpMessage = `
# 📖 Comandos disponibles

## 📅 **^examen {CODIGO}**
Muestra la fecha y hora del próximo examen.
> Ej: \`^examen P3\`

## 🎓 **^matricularse {CODIGO}**
Te asigna el rol de la materia para recibir avisos del foro.
> Ej: \`^matricularse P3\`

## 🧹 **^desmatricularse {CODIGO}**
Remueve el rol de la materia.
> Ej: \`^desmatricularse P3\`

## 🆕 **^novedades**
Consulta novedades del foro de EVA (usando el canal actual como referencia).

---

## ⚙️ Comandos de administrador

### ➕ **^agregarMateria {CODIGO} {NOMBRE}**
Agrega una materia al sistema y crea su canal si no existe.
> Ej: \`^agregarMateria P5 PROGRAMACIÓN 5\`

### 🔗 **^agregarForo {CODIGO} {URL}**
Asocia o actualiza el link al foro de EVA para la materia.
> Ej: \`^agregarForo P3 https://eva.fing.edu.uy/mod/forum/view.php?id=XXXXX\`
`;

                message.reply(helpMessage);
            }
            break;
    }
});


// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN); 