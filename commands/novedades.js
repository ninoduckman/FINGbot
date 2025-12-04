const { checkForum } = require('../utils/forum');

module.exports = async (message, a, client) => {
    await checkForum(message.channel.name.toUpperCase(), message.channel, client);
};