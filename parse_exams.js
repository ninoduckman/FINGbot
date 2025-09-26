

const fs = require('fs');
const pdf = require('pdf-parse');
const examenes = fs.readFileSync('./horarios/examenes.pdf');
const parciales = fs.readFileSync('./horarios/parciales.pdf');

/*function parseExams(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const exams = [];

  for (const line of lines) {
    console.log(line);
    const match = line.match(/^(\S+)\s+(.+?)Examen\s+\d+\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})/);

    if (match) {
      const [, code, subject, date, time] = match;
      exams.push({
        code,
        subject: subject.trim(),
        date,
        time
      });
    }
  }

  return exams;
}
*/
function parseExams(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const exams = [];

  let currentDate = null;
  let currentTime = null;

  for (const line of lines) {
    let m;

    // Match "Día 1 – Viernes 19/09"
    if ((m = line.match(/Día \d+ – \S+ (\d{2}\/\d{2})/))) {
      currentDate = m[1] + "/2025"; // you may need to adjust the year
      continue;
    }

    // Match "Hora 08:00"
    if ((m = line.match(/^Hora (\d{2}:\d{2})/))) {
      currentTime = m[1];
      continue;
    }

    // Match "# Materia"
    if ((m = line.match(/^# (.+)/))) {
      exams.push({
        subject: m[1],
        date: currentDate,
        time: currentTime
      });
    }
  }

  return exams;
}

var rawText = "";
pdf(examenes).then(function(data) {
    rawText = data.text;
}).then(() =>{
console.log(rawText.length);
const parsedExams = parseExams(rawText);
fs.writeFileSync('exams.json', JSON.stringify(parsedExams, null, 2), 'utf8');

console.log(`✅ Saved ${parsedExams.length} exams to exams.json`);

})

pdf(parciales).then(function(data) {
    rawText = data.text;
}).then(() =>{
console.log(rawText.length);
const parsedExams = parseExams(rawText);
fs.writeFileSync('parciales.json', JSON.stringify(parsedExams, null, 2), 'utf8');
})