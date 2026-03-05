const fs = require('fs');
const path = require('path');
const { deflateSync } = require('zlib');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const PDF_PATH = path.resolve('C:/Users/Uporabnik/Desktop/Eterna photos/vidal cenik.pdf');
const OUTPUT_DIR = path.resolve('C:/Users/Uporabnik/Desktop/ETERNA/public/frames');

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

function makePNG(width, height, pixelData, hasAlpha) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = hasAlpha ? 6 : 2;
  const channels = hasAlpha ? 4 : 3;
  const rowSize = 1 + width * channels;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0;
    const srcOff = y * width * channels;
    const dstOff = y * rowSize + 1;
    for (let x = 0; x < width * channels; x++) {
      raw[dstOff + x] = pixelData[srcOff + x];
    }
  }
  const compressed = deflateSync(raw);
  return Buffer.concat([sig, createChunk('IHDR', ihdr), createChunk('IDAT', compressed), createChunk('IEND', Buffer.alloc(0))]);
}

async function main() {
  console.log('PDF:', PDF_PATH);
  console.log('Output:', OUTPUT_DIR);
  if (!fs.existsSync(PDF_PATH)) { console.error('PDF not found'); process.exit(1); }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  console.log('Size:', (data.length / 1048576).toFixed(2), 'MB');
  
  const doc = await pdfjsLib.getDocument({ data, verbosity: 0 }).promise;
  console.log('Pages:', doc.numPages);
  
  const maxPages = Math.min(doc.numPages, 10);
  let total = 0;
  
  for (let pn = 1; pn <= maxPages; pn++) {
    console.log('
--- Page', pn, '---');
    const page = await doc.getPage(pn);
    const ops = await page.getOperatorList();
    const OPS = pdfjsLib.OPS;
    let cnt = 0;
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject) {
        const name = ops.argsArray[i][0];
        const opName = fn === OPS.paintImageXObject ? 'ImageXObj' : 'JpegXObj';
        console.log('  Found:', opName, name);
        try {
          const img = await new Promise((res, rej) => {
            const r = page.objs.get(name);
            if (r) { res(r); return; }
            page.objs.get(name, d => d ? res(d) : rej(new Error('empty')));
          });
          if (!img) continue;
          const w = img.width, h = img.height;
          console.log('  Dimensions:', w, 'x', h, 'kind:', img.kind);
          if (img.data && w && h && w >= 50 && h >= 50) {
            const len = img.data.length;
            const rgba = w * h * 4;
            const rgb = w * h * 3;
            let png;
            if (len === rgba) png = makePNG(w, h, img.data, true);
            else if (len === rgb) png = makePNG(w, h, img.data, false);
            else if (len > rgb) png = makePNG(w, h, Buffer.from(img.data).slice(0, rgb), false);
            else { console.log('  Bad data len:', len); continue; }
            cnt++; total++;
            const fname = 'frame_p' + pn + '_' + cnt + '.png';
            fs.writeFileSync(path.join(OUTPUT_DIR, fname), png);
            console.log('  SAVED:', fname, w + 'x' + h, (png.length/1024).toFixed(1) + 'KB');
          } else if (img.src) {
            if (Buffer.isBuffer(img.src) || img.src instanceof Uint8Array) {
              cnt++; total++;
              const fname = 'frame_p' + pn + '_' + cnt + '.jpg';
              fs.writeFileSync(path.join(OUTPUT_DIR, fname), Buffer.from(img.src));
              console.log('  SAVED:', fname, (img.src.length/1024).toFixed(1) + 'KB');
            } else { console.log('  src type:', typeof img.src); }
          } else {
            console.log('  Keys:', Object.keys(img).join(','));
          }
        } catch(e) { console.log('  ERR:', e.message); }
      } else if (fn === OPS.paintInlineImageXObject || fn === OPS.paintInlineImageXObjectGroup) {
        const inf = opList ? ops.argsArray[i][0] : null;
        if (inf && inf.width >= 50 && inf.height >= 50 && inf.data) {
          const w = inf.width, h = inf.height;
          const len = inf.data.length;
          const rgba = w * h * 4, rgb = w * h * 3;
          let png;
          if (len === rgba) png = makePNG(w, h, inf.data, true);
          else if (len === rgb) png = makePNG(w, h, inf.data, false);
          else continue;
          cnt++; total++;
          const fname = 'frame_p' + pn + '_inline' + cnt + '.png';
          fs.writeFileSync(path.join(OUTPUT_DIR, fname), png);
          console.log('  SAVED inline:', fname);
        }
      }
    }
    console.log('  Page', pn, 'images:', cnt);
  }
  
  console.log('
===========================');
  console.log('Total images:', total, 'from', maxPages, 'pages');
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith('frame_'));
  files.forEach(f => {
    const s = fs.statSync(path.join(OUTPUT_DIR, f));
    console.log(' ', f, '-', (s.size/1024).toFixed(1), 'KB');
  });
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
