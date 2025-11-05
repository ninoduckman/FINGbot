const { checkForum } = require('../utils/forum');

module.exports = async (message) => {
    await checkForum(message.channel.name.toUpperCase(), message.channel);
};