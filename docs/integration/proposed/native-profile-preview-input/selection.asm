
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46520e4: f9422c08     	ldr	x8, [x0, #0x458]
 46520e8: b40007c8     	cbz	x8, 0x46521e0 <_ChromeMain+0x464cf44>
 46520ec: d10243ff     	sub	sp, sp, #0x90
 46520f0: a90467fa     	stp	x26, x25, [sp, #0x40]
 46520f4: a9055ff8     	stp	x24, x23, [sp, #0x50]
 46520f8: a90657f6     	stp	x22, x21, [sp, #0x60]
 46520fc: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4652100: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4652104: 910203fd     	add	x29, sp, #0x80
 4652108: f9429d08     	ldr	x8, [x8, #0x538]
 465210c: b40005e8     	cbz	x8, 0x46521c8 <_ChromeMain+0x464cf2c>
 4652110: aa0103f4     	mov	x20, x1
 4652114: 39405c29     	ldrb	w9, [x1, #0x17]
 4652118: f940042a     	ldr	x10, [x1, #0x8]
 465211c: 7219013f     	tst	w9, #0x80
 4652120: 9a891149     	csel	x9, x10, x9, ne
 4652124: b4000529     	cbz	x9, 0x46521c8 <_ChromeMain+0x464cf2c>
 4652128: aa0003f3     	mov	x19, x0
 465212c: f9403500     	ldr	x0, [x8, #0x68]
 4652130: f9400008     	ldr	x8, [x0]
 4652134: f940a508     	ldr	x8, [x8, #0x148]
 4652138: d63f0100     	blr	x8
 465213c: b4000180     	cbz	x0, 0x465216c <_ChromeMain+0x464ced0>
 4652140: f9400008     	ldr	x8, [x0]
 4652144: f9401909     	ldr	x9, [x8, #0x30]
 4652148: 910083e8     	add	x8, sp, #0x20
 465214c: d63f0120     	blr	x9
 4652150: 910083e0     	add	x0, sp, #0x20
 4652154: aa1403e1     	mov	x1, x20
 4652158: 9729e7eb     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 465215c: aa0003f5     	mov	x21, x0
 4652160: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4652164: 37f80548     	tbnz	w8, #0x1f, 0x465220c <_ChromeMain+0x464cf70>
 4652168: 37000315     	tbnz	w21, #0x0, 0x46521c8 <_ChromeMain+0x464cf2c>
 465216c: 39c05e88     	ldrsb	w8, [x20, #0x17]
 4652170: 37f80448     	tbnz	w8, #0x1f, 0x46521f8 <_ChromeMain+0x464cf5c>
 4652174: 3dc00280     	ldr	q0, [x20]
 4652178: 3d8003e0     	str	q0, [sp]
 465217c: f9400a89     	ldr	x9, [x20, #0x10]
 4652180: f9000be9     	str	x9, [sp, #0x10]
 4652184: f9400689     	ldr	x9, [x20, #0x8]
 4652188: 92401d0a     	and	x10, x8, #0xff
 465218c: 7219011f     	tst	w8, #0x80
 4652190: 9a8a1128     	csel	x8, x9, x10, ne
 4652194: b40000c8     	cbz	x8, 0x46521ac <_ChromeMain+0x464cf10>
 4652198: aa1303e0     	mov	x0, x19
 465219c: 97fffdcf     	bl	0x46518d8 <_ChromeMain+0x464c63c>
 46521a0: f9400408     	ldr	x8, [x0, #0x8]
 46521a4: f100091f     	cmp	x8, #0x2
 46521a8: 54000522     	b.hs	0x465224c <_ChromeMain+0x464cfb0>
 46521ac: 52800034     	mov	w20, #0x1               ; =1
 46521b0: 910003e1     	mov	x1, sp
 46521b4: aa1303e0     	mov	x0, x19
 46521b8: aa1403e2     	mov	x2, x20
 46521bc: 94000f21     	bl	0x4655e40 <_ChromeMain+0x4650ba4>
 46521c0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 46521c4: 37f80108     	tbnz	w8, #0x1f, 0x46521e4 <_ChromeMain+0x464cf48>
 46521c8: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 46521cc: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 46521d0: a94657f6     	ldp	x22, x21, [sp, #0x60]
 46521d4: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 46521d8: a94467fa     	ldp	x26, x25, [sp, #0x40]
 46521dc: 910243ff     	add	sp, sp, #0x90
 46521e0: d65f03c0     	ret
 46521e4: f94003e0     	ldr	x0, [sp]
 46521e8: f9400be8     	ldr	x8, [sp, #0x10]
 46521ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46521f0: 96e6db32     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46521f4: 17fffff5     	b	0x46521c8 <_ChromeMain+0x464cf2c>
 46521f8: a9400a81     	ldp	x1, x2, [x20]
 46521fc: 910003e0     	mov	x0, sp
 4652200: 96e71806     	bl	0x18218 <_ChromeMain+0x12f7c>
 4652204: 39405e88     	ldrb	w8, [x20, #0x17]
 4652208: 17ffffdf     	b	0x4652184 <_ChromeMain+0x464cee8>
 465220c: f94013e0     	ldr	x0, [sp, #0x20]
 4652210: f9401be8     	ldr	x8, [sp, #0x30]
 4652214: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4652218: 96e6db28     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465221c: 3607fa95     	tbz	w21, #0x0, 0x465216c <_ChromeMain+0x464ced0>
 4652220: 17ffffea     	b	0x46521c8 <_ChromeMain+0x464cf2c>
 4652224: d2800014     	mov	x20, #0x0               ; =0
 4652228: 390083ff     	strb	wzr, [sp, #0x20]
 465222c: 3900e3ff     	strb	wzr, [sp, #0x38]
 4652230: 3940e3e8     	ldrb	w8, [sp, #0x38]
 4652234: 34000068     	cbz	w8, 0x4652240 <_ChromeMain+0x464cfa4>
 4652238: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 465223c: 37f808c8     	tbnz	w8, #0x1f, 0x4652354 <_ChromeMain+0x464d0b8>
 4652240: d360fe88     	lsr	x8, x20, #32
 4652244: b5fffb68     	cbnz	x8, 0x46521b0 <_ChromeMain+0x464cf14>
 4652248: 17ffffd9     	b	0x46521ac <_ChromeMain+0x464cf10>
 465224c: 6f00e400     	movi.2d	v0, #0000000000000000
 4652250: ad0103e0     	stp	q0, q0, [sp, #0x20]
 4652254: f9422e68     	ldr	x8, [x19, #0x458]
 4652258: b4fffe68     	cbz	x8, 0x4652224 <_ChromeMain+0x464cf88>
 465225c: f9429d08     	ldr	x8, [x8, #0x538]
 4652260: b4fffe28     	cbz	x8, 0x4652224 <_ChromeMain+0x464cf88>
 4652264: aa0003f5     	mov	x21, x0
 4652268: f9403500     	ldr	x0, [x8, #0x68]
 465226c: f9400008     	ldr	x8, [x0]
 4652270: f940a508     	ldr	x8, [x8, #0x148]
 4652274: d63f0100     	blr	x8
 4652278: b4fffd60     	cbz	x0, 0x4652224 <_ChromeMain+0x464cf88>
 465227c: f9400008     	ldr	x8, [x0]
 4652280: f9401909     	ldr	x9, [x8, #0x30]
 4652284: 910083e8     	add	x8, sp, #0x20
 4652288: d63f0120     	blr	x9
 465228c: 52800028     	mov	w8, #0x1                ; =1
 4652290: 3900e3e8     	strb	w8, [sp, #0x38]
 4652294: a94022b6     	ldp	x22, x8, [x21]
 4652298: 8b080509     	add	x9, x8, x8, lsl #1
 465229c: d37df137     	lsl	x23, x9, #3
 46522a0: b4000557     	cbz	x23, 0x4652348 <_ChromeMain+0x464d0ac>
 46522a4: 8b090ed8     	add	x24, x22, x9, lsl #3
 46522a8: 910083e1     	add	x1, sp, #0x20
 46522ac: aa1603e0     	mov	x0, x22
 46522b0: 9729e795     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 46522b4: 370000a0     	tbnz	w0, #0x0, 0x46522c8 <_ChromeMain+0x464d02c>
 46522b8: 910062d6     	add	x22, x22, #0x18
 46522bc: f10062f7     	subs	x23, x23, #0x18
 46522c0: 54ffff41     	b.ne	0x46522a8 <_ChromeMain+0x464d00c>
 46522c4: aa1803f6     	mov	x22, x24
 46522c8: a94022b7     	ldp	x23, x8, [x21]
 46522cc: 8b080509     	add	x9, x8, x8, lsl #1
 46522d0: d37df138     	lsl	x24, x9, #3
 46522d4: b4000378     	cbz	x24, 0x4652340 <_ChromeMain+0x464d0a4>
 46522d8: 8b090ef9     	add	x25, x23, x9, lsl #3
 46522dc: aa1703e0     	mov	x0, x23
 46522e0: aa1403e1     	mov	x1, x20
 46522e4: 9729e788     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 46522e8: 370000a0     	tbnz	w0, #0x0, 0x46522fc <_ChromeMain+0x464d060>
 46522ec: 910062f7     	add	x23, x23, #0x18
 46522f0: f1006318     	subs	x24, x24, #0x18
 46522f4: 54ffff41     	b.ne	0x46522dc <_ChromeMain+0x464d040>
 46522f8: aa1903f7     	mov	x23, x25
 46522fc: aa1703e9     	mov	x9, x23
 4652300: a94022b7     	ldp	x23, x8, [x21]
 4652304: 5280030a     	mov	w10, #0x18              ; =24
 4652308: 9b0a5d08     	madd	x8, x8, x10, x23
 465230c: eb0802df     	cmp	x22, x8
 4652310: 54000140     	b.eq	0x4652338 <_ChromeMain+0x464d09c>
 4652314: eb0902df     	cmp	x22, x9
 4652318: 54000100     	b.eq	0x4652338 <_ChromeMain+0x464d09c>
 465231c: b20003ea     	mov	x10, #0x100000001       ; =4294967297
 4652320: b24083eb     	mov	x11, #0x1ffffffff       ; =8589934591
 4652324: eb16013f     	cmp	x9, x22
 4652328: 9a8a316a     	csel	x10, x11, x10, lo
 465232c: eb08013f     	cmp	x9, x8
 4652330: 9a8a03f4     	csel	x20, xzr, x10, eq
 4652334: 17ffffbf     	b	0x4652230 <_ChromeMain+0x464cf94>
 4652338: d2800014     	mov	x20, #0x0               ; =0
 465233c: 17ffffbd     	b	0x4652230 <_ChromeMain+0x464cf94>
 4652340: aa1703e9     	mov	x9, x23
 4652344: 17fffff0     	b	0x4652304 <_ChromeMain+0x464d068>
 4652348: aa1603f7     	mov	x23, x22
 465234c: aa1603e9     	mov	x9, x22
 4652350: 17ffffed     	b	0x4652304 <_ChromeMain+0x464d068>
 4652354: f94013e0     	ldr	x0, [sp, #0x20]
 4652358: f9401be8     	ldr	x8, [sp, #0x30]
 465235c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4652360: 96e6dad6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4652364: 17ffffb7     	b	0x4652240 <_ChromeMain+0x464cfa4>
