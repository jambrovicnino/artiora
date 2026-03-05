// Skripta za branje Vidal cenikov — izlušči profile in cene
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractPrices(pdfPath, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label}`);
  console.log(`${pdfPath}`);
  console.log('='.repeat(60));

  try {
    const doc = await pdfjsLib.getDocument(pdfPath).promise;
    console.log(`Strani: ${doc.numPages}\n`);

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(' ');

      console.log(`--- Stran ${i} ---`);
      console.log(text);
      console.log('');
    }
  } catch (err) {
    console.error(`Napaka: ${err.message}`);
  }
}

async function main() {
  const pdf1 = 'C:/Users/Uporabnik/Desktop/Eterna photos/Vidal - cenik okvirjanje 2022 (002).pdf';
  const pdf2 = 'C:/Users/Uporabnik/Desktop/Eterna photos/vidal cenik.pdf';

  await extractPrices(pdf1, 'CENIK 2022 (starejsi)');
  await extractPrices(pdf2, 'VIDAL CENIK (novejsi)');
}

main();
