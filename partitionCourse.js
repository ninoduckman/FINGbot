// partitionCourse.js
import fs from "fs-extra";
import { PDFDocument } from "pdf-lib";

async function main() {
  const inputPdfPath = "./course.pdf";
  const weeksJsonPath = "./weeks.json";
  const chaptersJsonPath = "./chapters.json";
  const outputDir = "./weeks";

  await fs.ensureDir(outputDir);

  const weeks = JSON.parse(await fs.readFile(weeksJsonPath, "utf8"));
  const chapters = JSON.parse(await fs.readFile(chaptersJsonPath, "utf8"));
  const pdfBytes = await fs.readFile(inputPdfPath);
  const masterPdf = await PDFDocument.load(pdfBytes);

  for (const [weekName, weekData] of Object.entries(weeks)) {
    const { start, end, sections } = weekData;
    console.log(`\n📚 Processing ${weekName} (${start} → ${end})`);
    if (!Array.isArray(sections) || sections.length === 0) {
      console.warn(`⚠️ No sections listed for ${weekName}, skipping...`);
      continue;
    }

    const newPdf = await PDFDocument.create();
    let totalPages = 0;

    for (const chapter of sections) {
      const info = chapters[chapter];
      if (!info) {
        console.warn(`⚠️ Missing chapter mapping for "${chapter}"`);
        continue;
      }
      const { start: cStart, end: cEnd } = info;
      const pageIndices = Array.from(
        { length: cEnd - cStart + 1 },
        (_, i) => cStart - 1 + i
      );

      try {
        const pagesToCopy = await newPdf.copyPages(masterPdf, pageIndices);
        pagesToCopy.forEach((p) => newPdf.addPage(p));
        totalPages += pagesToCopy.length;
        console.log(`   ➕ Added ${chapter} (${cStart}-${cEnd})`);
      } catch (err) {
        console.error(`❌ Error copying pages for ${chapter}:`, err.message);
      }
    }

    if (totalPages === 0) {
      console.warn(`⚠️ No valid pages copied for ${weekName}, skipping save.`);
      continue;
    }

    const pdfBytes = await newPdf.save();
    const outputFile = `${outputDir}/${weekName}.pdf`;
    await fs.writeFile(outputFile, pdfBytes);

    console.log(`✅ Saved ${outputFile} (${totalPages} pages)`);
  }

  console.log("\n🎉 All weeks processed successfully!");
}

main().catch((err) => console.error("💥 Fatal error:", err));
