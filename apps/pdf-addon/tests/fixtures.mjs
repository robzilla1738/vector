// Writes the synthetic PDFs the parity test runs on. Everything is generated here: no
// owner documents, no downloads. See docs/spec/native/pdf.md section 6 for what each covers.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';

/** A PDF under construction: objects are numbered from 1 in the order they are reserved. */
class Pdf {
  objects = [];
  reserve() { this.objects.push(null); return this.objects.length; }
  add(body) { const id = this.reserve(); this.set(id, body); return id; }
  set(id, body) { this.objects[id - 1] = body; }
  stream(dict, data) { return this.add({ dict, data: Buffer.isBuffer(data) ? data : Buffer.from(data, 'latin1') }); }
  /** `encrypt(id, bytes)` encrypts stream data; fixtures that encrypt keep strings out of their objects. */
  bytes({ root, trailer = '', encrypt = (id, data) => data }) {
    const parts = [Buffer.from('%PDF-1.7\n%\xe2\xe3\xcf\xd3\n', 'latin1')], offsets = [];
    let size = parts[0].length;
    const push = (buffer) => { parts.push(buffer); size += buffer.length; };
    this.objects.forEach((body, index) => {
      offsets.push(size);
      const id = index + 1;
      if (typeof body === 'string') return push(Buffer.from(`${id} 0 obj\n${body}\nendobj\n`, 'latin1'));
      const data = encrypt(id, body.data);
      push(Buffer.from(`${id} 0 obj\n<< ${body.dict} /Length ${data.length} >>\nstream\n`, 'latin1'));
      push(data);
      push(Buffer.from('\nendstream\nendobj\n', 'latin1'));
    });
    const xref = size;
    push(Buffer.from(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
      + `trailer\n<< /Size ${offsets.length + 1} /Root ${root} 0 R ${trailer} >>\nstartxref\n${xref}\n%%EOF\n`, 'latin1'));
    return Buffer.concat(parts);
  }
}

function png(width, height) {
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]), length = Buffer.alloc(4), crc = Buffer.alloc(4);
    length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header.set([8, 2, 0, 0, 0], 8);
  const rows = Array.from({ length: height }, (_, y) => Buffer.from([0, ...Array.from({ length: width }, (_, x) => [x * 255 / width, y * 255 / height, 128]).flat()]));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
}

const helvetica = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';

/** Three pages: text in a standard and a non-embedded system font, a landscape page rotated 90, an empty page. */
function textPdf() {
  const pdf = new Pdf(), catalog = pdf.reserve(), pages = pdf.reserve();
  const f1 = pdf.add(helvetica);
  const f2 = pdf.add('<< /Type /Font /Subtype /TrueType /BaseFont /Arial,Bold /FirstChar 32 /LastChar 126 /Encoding /WinAnsiEncoding >>');
  const fonts = `/Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >>`;
  const first = pdf.stream('', '1 0 0 rg 20 20 60 40 re f 0 0 1 RG 4 w 100 40 m 280 120 l S 0 g\n'
    + 'BT /F1 18 Tf 40 720 Td (Aux First) Tj 0 -24 Td /F1 11 Tf (Second line, caf\\351 \\(parens\\)) Tj ET\n'
    + 'BT /F2 14 Tf 40 640 Td (Arial bold text) Tj ET\nBT /F1 9 Tf 300 640 Td (Right column) Tj ET\n');
  const second = pdf.stream('', 'BT /F1 16 Tf 30 150 Td (Aux Second) Tj ET 0.2 0.6 0.2 rg 200 40 120 60 re f\n');
  const kids = [
    pdf.add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 612 792] ${fonts} /Contents ${first} 0 R >>`),
    pdf.add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 400 200] /Rotate 90 ${fonts} /Contents ${second} 0 R >>`),
    pdf.add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 300 300] >>`),
  ];
  pdf.set(pages, `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`);
  pdf.set(catalog, `<< /Type /Catalog /Pages ${pages} 0 R >>`);
  return pdf.bytes({ root: catalog });
}

/** One page with a Flate RGB image, a DCT (JPEG) image, a gray image and text in Courier. */
function imagePdf(jpeg) {
  const pdf = new Pdf(), catalog = pdf.reserve(), pages = pdf.reserve();
  const rgb = Buffer.from(Array.from({ length: 32 * 32 }, (_, i) => [(i % 32) * 8, (i >> 5) * 8, 200]).flat());
  const flate = pdf.stream('/Type /XObject /Subtype /Image /Width 32 /Height 32 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode', deflateSync(rgb));
  const dct = pdf.stream('/Type /XObject /Subtype /Image /Width 48 /Height 32 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode', jpeg);
  const gray = pdf.stream('/Type /XObject /Subtype /Image /Width 8 /Height 8 /ColorSpace /DeviceGray /BitsPerComponent 8', Buffer.from(Array.from({ length: 64 }, (_, i) => (i * 37) % 256)));
  const font = pdf.add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');
  const content = pdf.stream('', 'q 200 0 0 200 20 380 cm /A Do Q q 240 0 0 160 240 420 cm /B Do Q q 64 0 0 64 20 300 cm /C Do Q\n'
    + 'BT /F1 12 Tf 20 260 Td (Images: flate, dct, gray) Tj ET\n');
  const page = pdf.add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 500 600] /Resources << /XObject << /A ${flate} 0 R /B ${dct} 0 R /C ${gray} 0 R >> /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`);
  pdf.set(pages, `<< /Type /Pages /Kids [${page} 0 R] /Count 1 >>`);
  pdf.set(catalog, `<< /Type /Catalog /Pages ${pages} 0 R >>`);
  return pdf.bytes({ root: catalog });
}

/** Two pages of AcroForm fields: every field type the module distinguishes, sort ties, a nameless widget and a two-widget field. */
function formPdf({ xfa = false } = {}) {
  const pdf = new Pdf(), catalog = pdf.reserve(), pages = pdf.reserve(), page1 = pdf.reserve(), page2 = pdf.reserve();
  const helv = pdf.add(helvetica);
  const on = pdf.stream('/Type /XObject /Subtype /Form /BBox [0 0 20 20]', '0 g 4 4 12 12 re f');
  const off = pdf.stream('/Type /XObject /Subtype /Form /BBox [0 0 20 20]', '0 G 1 1 18 18 re S');
  const widget = (page, rect, extra) => pdf.add(`<< /Type /Annot /Subtype /Widget /P ${page} 0 R /F 4 /Rect [${rect}] /DA (/Helv 12 Tf 0 g) ${extra} >>`);
  const fields = [], annots1 = [], annots2 = [];
  const field1 = (rect, extra) => { const id = widget(page1, rect, extra); fields.push(id); annots1.push(id); return id; };
  const field2 = (rect, extra) => { const id = widget(page2, rect, extra); fields.push(id); annots2.push(id); return id; };
  field1('20 700 300 730', '/FT /Tx /T (name) /TU (Full name) /V (Before)');
  field1('20 600 300 680', '/FT /Tx /Ff 4096 /T (notes) /V (Line one)');
  field1('20 560 40 580', `/FT /Btn /T (agree) /V /Off /AS /Off /MK << /CA (4) >> /AP << /N << /Yes ${on} 0 R /Off ${off} 0 R >> >>`);
  const color = pdf.reserve();
  const kids = ['red', 'blue'].map((value, i) => {
    const id = widget(page1, `${20 + 40 * i} 520 ${40 + 40 * i} 540`, `/Parent ${color} 0 R /AS /Off /MK << /CA (l) >> /AP << /N << /${value} ${on} 0 R /Off ${off} 0 R >> >>`);
    annots1.push(id); return id;
  });
  pdf.set(color, `<< /FT /Btn /Ff 49152 /T (color) /V /Off /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] >>`);
  fields.push(color);
  field1('20 480 200 500', '/FT /Ch /Ff 131072 /T (size) /Opt [(Small) (Medium) (Large)] /V (Medium)');
  field1('20 400 200 460', '/FT /Ch /T (fruit) /TU (Pick one) /Opt [(Apple) (Banana) (Cherry)]');
  field1('220 480 280 500', '/FT /Btn /Ff 65536 /T (go) /MK << /CA (Go) >>');
  field2('300 700 400 720', '/FT /Tx /T (b_right) /V (Right)');
  field2('20 700 120 720', '/FT /Tx /T (a_left) /V (Left)');
  annots2.push(widget(page2, '20 650 120 670', '/FT /Tx /V (Nameless)'));
  field2('300 400 500 440', '/FT /Sig /T (sig)');
  const dup = pdf.reserve();
  const dupKids = [widget(page2, '20 300 120 320', `/Parent ${dup} 0 R`), widget(page2, '20 250 120 270', `/Parent ${dup} 0 R`)];
  annots2.push(...dupKids);
  pdf.set(dup, `<< /FT /Tx /T (dup) /V (Twice) /Kids [${dupKids.map((k) => `${k} 0 R`).join(' ')}] >>`);
  fields.push(dup);
  const resources = `/Resources << /Font << /Helv ${helv} 0 R >> >>`;
  const label = pdf.stream('', 'BT /Helv 10 Tf 20 740 Td (Form page) Tj ET');
  pdf.set(page1, `<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 612 792] ${resources} /Contents ${label} 0 R /Annots [${annots1.map((a) => `${a} 0 R`).join(' ')}] >>`);
  pdf.set(page2, `<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 612 792] ${resources} /Annots [${annots2.map((a) => `${a} 0 R`).join(' ')}] >>`);
  pdf.set(pages, `<< /Type /Pages /Kids [${page1} 0 R ${page2} 0 R] /Count 2 >>`);
  const xfaEntry = xfa ? `/XFA ${pdf.stream('', '<?xml version="1.0"?><xdp:xdp xmlns:xdp="http://ns.adobe.com/xdp/"><template/></xdp:xdp>')} 0 R` : '';
  const form = pdf.add(`<< /Fields [${fields.map((f) => `${f} 0 R`).join(' ')}] /DR << /Font << /Helv ${helv} 0 R >> >> /DA (/Helv 0 Tf 0 g) /NeedAppearances true ${xfaEntry} >>`);
  pdf.set(catalog, `<< /Type /Catalog /Pages ${pages} 0 R /AcroForm ${form} 0 R ${xfa ? '/NeedsRendering true' : ''} >>`);
  return pdf.bytes({ root: catalog });
}

/** RC4, which Node's default OpenSSL provider no longer offers. */
function rc4(key, data) {
  const s = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 0, j = 0; i < 256; i++) { j = (j + s[i] + key[i % key.length]) & 255; [s[i], s[j]] = [s[j], s[i]]; }
  const out = Buffer.alloc(data.length);
  for (let n = 0, i = 0, j = 0; n < data.length; n++) {
    i = (i + 1) & 255; j = (j + s[i]) & 255; [s[i], s[j]] = [s[j], s[i]];
    out[n] = data[n] ^ s[(s[i] + s[j]) & 255];
  }
  return out;
}

/** A one-page PDF under the standard security handler, revision 2 (40-bit RC4). */
function encryptedPdf(userPassword) {
  const pad = Buffer.from('28BF4E5E4E758A4164004E56FFFA01082E2E00B6D0683E802F0CA9FE6453697A', 'hex');
  const padded = (text) => Buffer.concat([Buffer.from(text, 'latin1'), pad]).subarray(0, 32);
  const md5 = (...parts) => createHash('md5').update(Buffer.concat(parts)).digest();
  const id = Buffer.from('00112233445566778899aabbccddeeff', 'hex'), permissions = Buffer.alloc(4);
  permissions.writeInt32LE(-4);
  const owner = rc4(md5(padded('aux-owner')).subarray(0, 5), padded(userPassword));
  const key = md5(padded(userPassword), owner, permissions, id).subarray(0, 5);
  const user = rc4(key, pad);
  const objectKey = (n) => md5(key, Buffer.from([n & 255, (n >> 8) & 255, n >> 16, 0, 0])).subarray(0, 10);

  const pdf = new Pdf(), catalog = pdf.reserve(), pages = pdf.reserve();
  const font = pdf.add(helvetica);
  const content = pdf.stream('', 'BT /F1 20 Tf 40 700 Td (Encrypted Aux text) Tj ET');
  const page = pdf.add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`);
  pdf.set(pages, `<< /Type /Pages /Kids [${page} 0 R] /Count 1 >>`);
  pdf.set(catalog, `<< /Type /Catalog /Pages ${pages} 0 R >>`);
  const encrypt = pdf.add(`<< /Filter /Standard /V 1 /R 2 /Length 40 /P -4 /O <${owner.toString('hex')}> /U <${user.toString('hex')}> >>`);
  return pdf.bytes({
    root: catalog, trailer: `/Encrypt ${encrypt} 0 R /ID [<${id.toString('hex')}> <${id.toString('hex')}>]`,
    encrypt: (n, data) => (n === encrypt ? data : rc4(objectKey(n), data)),
  });
}

/** A page whose MediaBox is empty, and one whose page tree points at a missing object. */
function oddPdf() {
  const pdf = new Pdf(), catalog = pdf.reserve(), pages = pdf.reserve();
  const zero = pdf.add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 0 0] >>`);
  const tiny = pdf.add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 3 2000] >>`);
  pdf.set(pages, `<< /Type /Pages /Kids [${zero} 0 R ${tiny} 0 R 99 0 R] /Count 3 >>`);
  pdf.set(catalog, `<< /Type /Catalog /Pages ${pages} 0 R >>`);
  return pdf.bytes({ root: catalog });
}

/** Writes every fixture into `dir` and returns their paths by name. */
export function writeFixtures(dir) {
  writeFileSync(join(dir, 'gradient.png'), png(48, 32));
  execFileSync('sips', ['-s', 'format', 'jpeg', join(dir, 'gradient.png'), '--out', join(dir, 'gradient.jpg')], { stdio: 'ignore' });
  const text = textPdf();
  const files = {
    text, image: imagePdf(readFileSync(join(dir, 'gradient.jpg'))), form: formPdf(), xfa: formPdf({ xfa: true }),
    encryptedOpen: encryptedPdf(''), encryptedLocked: encryptedPdf('secret'), odd: oddPdf(),
    // Damage: no PDF at all, cut in half, every xref offset wrong (PDFium rebuilds the table), empty.
    garbage: Buffer.from('this is not a pdf\n'.repeat(20)), truncated: text.subarray(0, text.length >> 1),
    badXref: Buffer.from(text.toString('latin1').replace(/(\n\d{10}) 00000 n/g, (_, o) => `\n${String(Number(o) + 7).padStart(10, '0')} 00000 n`), 'latin1'),
    empty: Buffer.alloc(0),
  };
  const paths = {};
  for (const [name, bytes] of Object.entries(files)) writeFileSync(paths[name] = join(dir, `${name}.pdf`), bytes);
  paths.unicode = join(dir, 'ünïcødé name.pdf');
  writeFileSync(paths.unicode, text);
  return paths;
}
