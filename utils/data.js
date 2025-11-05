const fs = require('fs');
const path = require('path');

const MATERIAS_FILE = path.join(__dirname, "..", "materias.json");
const fechasExamenes = require('../exams.json');
const fechasParciales = require('../parciales.json');

let materias = {};

function loadMaterias() {
    if (fs.existsSync(MATERIAS_FILE)) {
        materias = JSON.parse(fs.readFileSync(MATERIAS_FILE, "utf8"));
    }
}

function saveMaterias() {
    fs.writeFileSync(MATERIAS_FILE, JSON.stringify(materias, null, 2));
}

loadMaterias();

module.exports = {
    materias,
    fechasExamenes,
    fechasParciales,
    saveMaterias
};