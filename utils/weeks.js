const weeks = require('../weeks.json');

function parseLocalDate(str) {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day); // months are 0-indexed
}

function getCurrentWeek() {
  const today = new Date();
  for (const [weekName, data] of Object.entries(weeks)) {
    const start = parseLocalDate(data.start);
    const end = parseLocalDate(data.end);
    if (today >= start && today <= end) return { weekName, ...data };
  }
  return null;
}

function getWeek(name) {
    const data = weeks[name];
    if (data) return { weekName: name, ...data };
    return null;
}

module.exports = {
    getCurrentWeek,
    getWeek
};