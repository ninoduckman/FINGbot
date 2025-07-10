const fs = require('fs');
const pdf = require('pdf-parse');
const dataBuffer = fs.readFileSync('./horarios/examenes.pdf');

function parseExams(text) {
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

var rawText = "";
pdf(dataBuffer).then(function(data) {
    rawText = data.text;
}).then(() =>{
console.log(rawText.length);
const parsedExams = parseExams(rawText);

// Save to JSON file
fs.writeFileSync('exams.json', JSON.stringify(parsedExams, null, 2), 'utf8');

console.log(`✅ Saved ${parsedExams.length} exams to exams.json`);

})
