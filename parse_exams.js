

const fs = require('fs');
const pdf = require('pdf-parse');
const examenes = fs.readFileSync('./horarios/examenes.pdf');
const parciales = fs.readFileSync('./horarios/parciales.pdf');

function parseFormatA(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const exams = [];

  let currentDate = null;
  let currentTime = null;

  for (const line of lines) {
    let m;

    if ((m = line.match(/Día \d+ – \S+ (\d{2}\/\d{2})/))) {
      currentDate = m[1] + "/2025";
      continue;
    }

    if ((m = line.match(/^Hora (\d{2}:\d{2})/))) {
      currentTime = m[1];
      continue;
    }

    if ((m = line.match(/^# (.+)/))) {
      exams.push({
        subject: m[1].trim(),
        date: currentDate,
        time: currentTime
      });
    }
  }
  return exams;
}
function parseFormatB(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const exams = [];

  for (const line of lines) {

    // Match general structure:  CODE + SUBJECT + Examen + periodo + fecha + hora
    const m = line.match(/^(.*)Examen(\d{6})(\d{2}\/\d{2}\/\d{4})(\d{2}:\d{2})$/);
    if (!m) continue;

    let [_, left, periodo, date, time] = m;

    // Extract CODE at start: either 4 digits OR 1–3 letters + 2–3 digits
    const codeMatch = left.match(/^(?:\d{4}|[A-Z]{1,3}\d{2,3})/);
    if (!codeMatch) continue;

    const code = codeMatch[0];

    // Remove the code from the start → remainder is subject text
    const subject = left.slice(code.length).trim();

    exams.push({
      code,
      subject,
      date,
      time
    });
  }

  return exams;
}
function detectFormat(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const hasHashLines = lines.some(l => l.startsWith('# '));
  const hasDia = lines.some(l => /^D[ií]a\s+\d+/.test(l));

  if (hasHashLines || hasDia) return 'A';

  const hasCodeExamLine = lines.some(l => /^\d{3,5}\s+.*Examen/.test(l));
  const hasCodigoHeader = lines.some(l => /^C[oó]digo/i.test(l));

  if (hasCodeExamLine || hasCodigoHeader) return 'B';

  // Fallback: try both and pick the one that finds more exams
  const a = parseFormatA(text);
  const b = parseFormatB(text);
  return b.length > a.length ? 'B' : 'A';
}

function parseExams(text) {
  const fmt = detectFormat(text);
  console.log(`Detected format: ${fmt}`);

  if (fmt === "A") return parseFormatA(text);
  return parseFormatB(text);
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
console.log(`✅ Saved ${parsedExams.length} exams to parciales.json`);
})