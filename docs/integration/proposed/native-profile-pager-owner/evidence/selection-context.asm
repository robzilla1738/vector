
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
 4652368: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 465236c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4652370: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4652374: 910083fd     	add	x29, sp, #0x20
 4652378: b4000302     	cbz	x2, 0x46523d8 <_ChromeMain+0x464d13c>
 465237c: aa0003f3     	mov	x19, x0
 4652380: f9440808     	ldr	x8, [x0, #0x810]
 4652384: b40002a8     	cbz	x8, 0x46523d8 <_ChromeMain+0x464d13c>
 4652388: aa0203f5     	mov	x21, x2
 465238c: aa0103f4     	mov	x20, x1
 4652390: f9400048     	ldr	x8, [x2]
 4652394: f9403508     	ldr	x8, [x8, #0x68]
 4652398: aa0203e0     	mov	x0, x2
 465239c: d63f0100     	blr	x8
 46523a0: b40001c0     	cbz	x0, 0x46523d8 <_ChromeMain+0x464d13c>
 46523a4: 39805e88     	ldrsb	x8, [x20, #0x17]
 46523a8: b7f80208     	tbnz	x8, #0x3f, 0x46523e8 <_ChromeMain+0x464d14c>
 46523ac: b4000168     	cbz	x8, 0x46523d8 <_ChromeMain+0x464d13c>
 46523b0: f9442668     	ldr	x8, [x19, #0x848]
 46523b4: 39424108     	ldrb	w8, [x8, #0x90]
 46523b8: 350001e8     	cbnz	w8, 0x46523f4 <_ChromeMain+0x464d158>
 46523bc: f9440a60     	ldr	x0, [x19, #0x810]
 46523c0: aa1503e1     	mov	x1, x21
 46523c4: aa1403e2     	mov	x2, x20
 46523c8: 97fc72a5     	bl	0x456ee5c <_ChromeMain+0x4569bc0>
 46523cc: f9440e60     	ldr	x0, [x19, #0x818]
 46523d0: f9040e7f     	str	xzr, [x19, #0x818]
 46523d4: b5000360     	cbnz	x0, 0x4652440 <_ChromeMain+0x464d1a4>
 46523d8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 46523dc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 46523e0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 46523e4: d65f03c0     	ret
 46523e8: f9400688     	ldr	x8, [x20, #0x8]
 46523ec: b4ffff68     	cbz	x8, 0x46523d8 <_ChromeMain+0x464d13c>
 46523f0: 17fffff0     	b	0x46523b0 <_ChromeMain+0x464d114>
 46523f4: 39682268     	ldrb	w8, [x19, #0xa08]
 46523f8: 37000108     	tbnz	w8, #0x0, 0x4652418 <_ChromeMain+0x464d17c>
 46523fc: 39683276     	ldrb	w22, [x19, #0xa0c]
 4652400: f9440a60     	ldr	x0, [x19, #0x810]
 4652404: aa1503e1     	mov	x1, x21
 4652408: aa1403e2     	mov	x2, x20
 465240c: 97fc7294     	bl	0x456ee5c <_ChromeMain+0x4569bc0>
 4652410: 3607fdf6     	tbz	w22, #0x0, 0x46523cc <_ChromeMain+0x464d130>
 4652414: 14000005     	b	0x4652428 <_ChromeMain+0x464d18c>
 4652418: f9440a60     	ldr	x0, [x19, #0x810]
 465241c: aa1503e1     	mov	x1, x21
 4652420: aa1403e2     	mov	x2, x20
 4652424: 97fc728e     	bl	0x456ee5c <_ChromeMain+0x4569bc0>
 4652428: f9440a68     	ldr	x8, [x19, #0x810]
 465242c: f9400909     	ldr	x9, [x8, #0x10]
 4652430: b4fffce9     	cbz	x9, 0x46523cc <_ChromeMain+0x464d130>
 4652434: f9401108     	ldr	x8, [x8, #0x20]
 4652438: b5000108     	cbnz	x8, 0x4652458 <_ChromeMain+0x464d1bc>
 465243c: 17ffffe4     	b	0x46523cc <_ChromeMain+0x464d130>
 4652440: 94e59006     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 4652444: 52800301     	mov	w1, #0x18               ; =24
 4652448: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 465244c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4652450: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4652454: 16e6da99     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4652458: 397e4275     	ldrb	w21, [x19, #0xf90]
 465245c: 52800300     	mov	w0, #0x18               ; =24
 4652460: 96e6f3c2     	bl	0xf368 <_ChromeMain+0xa0cc>
 4652464: aa0003f4     	mov	x20, x0
 4652468: 710002bf     	cmp	w21, #0x0
 465246c: 9a9313e1     	csel	x1, xzr, x19, ne
 4652470: 52800042     	mov	w2, #0x2                ; =2
 4652474: 94e58fe0     	bl	0x7fb63f4 <_ChromeMain+0x7fb1158>
 4652478: f9440e60     	ldr	x0, [x19, #0x818]
 465247c: f9040e74     	str	x20, [x19, #0x818]
 4652480: b4fffac0     	cbz	x0, 0x46523d8 <_ChromeMain+0x464d13c>
 4652484: 17ffffef     	b	0x4652440 <_ChromeMain+0x464d1a4>
