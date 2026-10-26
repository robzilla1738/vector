#!/usr/bin/env python3
"""Synthetic PDF/HEIC only; uses Python stdlib and macOS sips, no app/state/network."""
import hashlib,json,struct,subprocess,tempfile,zlib
from pathlib import Path
HERE=Path(__file__).resolve().parent
pdf=HERE/'document.pdf';heic=HERE/'image.heic'
assert not pdf.exists() and not heic.exists(), 'Preserve existing fixtures; generate in a fresh copy'
content=b'BT /F1 20 Tf 48 730 Td (AUX_PDF_TEXT_CEDAR_742) Tj 0 -36 Td /F1 14 Tf (Second marker: VIOLET_RIVER_319) Tj ET\n'
objects=[b'<< /Type /Catalog /Pages 2 0 R >>',b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',b'<< /Length '+str(len(content)).encode()+b' >>\nstream\n'+content+b'endstream']
data=b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';offsets=[]
for i,obj in enumerate(objects,1):offsets.append(len(data));data+=f'{i} 0 obj\n'.encode()+obj+b'\nendobj\n'
xref=len(data);data+=b'xref\n0 6\n0000000000 65535 f \n'+b''.join(f'{n:010} 00000 n \n'.encode() for n in offsets)+f'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode()
pdf.write_bytes(data)
def chunk(kind,payload):return struct.pack('>I',len(payload))+kind+payload+struct.pack('>I',zlib.crc32(kind+payload)&0xffffffff)
w,h=96,64;raw=bytearray()
for y in range(h):
 raw.append(0)
 for x in range(w):raw.extend((255,255,255) if 8<=x<24 and 8<=y<24 else ((30,170,80) if x<w//2 else (130,50,190)))
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
with tempfile.TemporaryDirectory(prefix='aux-synthetic-codec-') as tmp:
 source=Path(tmp)/'synthetic.png';source.write_bytes(png)
 subprocess.run(['/usr/bin/sips','-s','format','heic',str(source),'--out',str(heic)],check=True,capture_output=True)
metadata=subprocess.run(['/usr/bin/sips','-g','format','-g','pixelWidth','-g','pixelHeight',str(heic)],check=True,capture_output=True,text=True).stdout
assert 'format: heic' in metadata and 'pixelWidth: 96' in metadata and 'pixelHeight: 64' in metadata
receipt={'format':'aux.synthetic-format-fixtures.v1','generatorSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'pdf':{'version':'1.4','pages':1,'text':['AUX_PDF_TEXT_CEDAR_742','Second marker: VIOLET_RIVER_319']},'heic':{'format':'heic','width':w,'height':h,'appearance':'Green left half, violet right half, white square near top-left','sourcePngSha256':hashlib.sha256(png).hexdigest(),'encoder':'macOS /usr/bin/sips -s format heic','encoderVersion':subprocess.run(['/usr/bin/sips','--version'],check=True,capture_output=True,text=True).stdout.strip(),'reproduction':'Deterministic generated source pixels and PDF; HEIC byte encoding may depend on macOS codec version.'},'files':[{'path':p.name,'size':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [pdf,heic]],'appParserAccepted':False,'providerCalls':False,'ownerFilesRead':False}
(HERE/'formats-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
