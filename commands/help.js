module.exports = async (message) => {
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
};