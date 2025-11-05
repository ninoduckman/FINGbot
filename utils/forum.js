const cheerio = require("cheerio");
const { materias } = require('./data');
const { lastSeenTitles, saveSeenPosts } = require('./seen-posts');

async function checkForum(name, channel) {
    const materiaInfo = materias[name];
    if (materiaInfo == null) {
        if (channel) channel.send("Parece haber un error, este grupo no esta en la lista de materias con foros :(");
        return;
    }
    const url = materiaInfo[1];
    if (!url || url == "/") {
        console.log(name);
        if (channel) channel.send("Este canal no tiene un foro asociado! pidele a un administrador que utilice `^agregarForo " + name + " {url}`");
        return;
    }

    try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = await cheerio.load(html);

        const firstDiscussion = $("tr.discussion").first();
        const aTag = firstDiscussion.find("a[href*='mod/forum/discuss.php?d=']").first();
        const title = aTag.text().trim();
        const link = aTag.attr("href")?.trim();

        if (!title || !link) { 
            console.log(firstDiscussion); 
            if(channel)channel.send("Lo siento, pero no puedo ver el foro de este canal, parece que los creadores de este curso se sienten demasiado importantes para dejarme ver el foro :)");
            return; 
        }

        if (lastSeenTitles[name] !== title) {
            lastSeenTitles[name] = title;
            saveSeenPosts();

            const fullLink = link.startsWith("http") ? link : new URL(link, url).href;
            const postRes = await fetch(fullLink);
            const postHtml = await postRes.text();
            const $$ = cheerio.load(postHtml);

            const firstPost = $$('.post-content-container').first();
            const paragraphs = [];

            firstPost.children().each((i, el) => {
                const tag = el.tagName?.toLowerCase();

                if (!tag) return;

                if (tag === 'p' || tag === 'div') {
                    const text = $$(el).text().trim();
                    if (text) paragraphs.push(text);
                } else if (tag === 'ul' || tag === 'ol') {
                    const isOrdered = tag === 'ol';
                    $$(el).find('li').each((j, li) => {
                        const itemText = $$(li).text().trim();
                        if (itemText) {
                            paragraphs.push(`${isOrdered ? `${j + 1}.` : '•'} ${itemText}`);
                        }
                    });
                } else if (tag === 'blockquote') {
                    const quote = $$(el).text().trim();
                    if (quote) paragraphs.push(`> ${quote.replace(/\n/g, '\n> ')}`);
                } else {
                    const fallbackText = $$(el).text().trim();
                    if (fallbackText) paragraphs.push(fallbackText);
                }
            });

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

module.exports = {
    checkForum,
    checkAllForums
};