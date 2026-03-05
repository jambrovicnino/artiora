// Skripta za branje Vidal cenikov — izlušči profile in cene
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractPrices(pdfPath, label) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📄 ${label}`);
  console.log(`   ${pdfPath}`);
  console.log('═'.repeat(60));

  try {
    const doc = await getDocument(pdfPath).promise;
    console.log(`   Strani: ${doc.numPages}\n`);

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(' ');

      console.log(`--- Stran ${i} ---`);
      console.log(text.substring(0, 2000));
      console.log('');
    }
  } catch (err) {
    console.error(`Napaka: ${err.message}`);
  }
}

const pdf1 = 'C:/Users/Uporabnik/Desktop/Eterna photos/Vidal - cenik okvirjanje 2022 (002).pdf';
const pdf2 = 'C:/Users/Uporabnik/Desktop/Eterna photos/vidal cenik.pdf';

await extractPrices(pdf1, 'CENIK 2022 (starejši)');
await extractPrices(pdf2, 'VIDAL CENIK (novejši)');
