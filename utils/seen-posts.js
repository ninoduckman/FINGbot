const fs = require('fs');
const path = require('path');

const SEEN_FILE = path.join(__dirname, '..', 'seen_posts.json');
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

module.exports = {
    lastSeenTitles,
    loadSeenPosts,
    saveSeenPosts
};