
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4276114: 8b1602e8     	add	x8, x23, x22
 4276118: 91002103     	add	x3, x8, #0x8
 427611c: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 4276120: f81703bf     	stur	xzr, [x29, #-0x90]
 4276124: 39807d04     	ldrsb	x4, [x8, #0x1f]
 4276128: b6f80064     	tbz	x4, #0x3f, 0x4276134 <_ChromeMain+0x4270e98>
 427612c: f9400063     	ldr	x3, [x3]
 4276130: f9400904     	ldr	x4, [x8, #0x10]
 4276134: d10283a0     	sub	x0, x29, #0xa0
 4276138: aa1403e1     	mov	x1, x20
 427613c: 52800042     	mov	w2, #0x2                ; =2
 4276140: 9750a922     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 4276144: 8b1602e8     	add	x8, x23, x22
 4276148: 91008100     	add	x0, x8, #0x20
 427614c: 3980dd01     	ldrsb	x1, [x8, #0x37]
 4276150: b6f80061     	tbz	x1, #0x3f, 0x427615c <_ChromeMain+0x4270ec0>
 4276154: f9400000     	ldr	x0, [x0]
 4276158: f9401501     	ldr	x1, [x8, #0x28]
 427615c: d102e3a8     	sub	x8, x29, #0xb8
 4276160: 9734b2ea     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4276164: 3cc68380     	ldur	q0, [x28, #0x68]
 4276168: 3c9803a0     	stur	q0, [x29, #-0x80]
 427616c: f85583a8     	ldur	x8, [x29, #-0xa8]
 4276170: f81903a8     	stur	x8, [x29, #-0x70]
 4276174: a934ffbf     	stp	xzr, xzr, [x29, #-0xb8]
 4276178: f81583bf     	stur	xzr, [x29, #-0xa8]
 427617c: 381983b3     	sturb	w19, [x29, #-0x68]
 4276180: d10283a0     	sub	x0, x29, #0xa0
 4276184: d10203a3     	sub	x3, x29, #0x80
 4276188: aa1503e1     	mov	x1, x21
 427618c: 52800082     	mov	w2, #0x4                ; =4
 4276190: 970b134c     	bl	0x53aec0 <_ChromeMain+0x535c24>
 4276194: 385983a8     	ldurb	w8, [x29, #-0x68]
 4276198: f103fd1f     	cmp	x8, #0xff
 427619c: 540000a0     	b.eq	0x42761b0 <_ChromeMain+0x4270f14>
 42761a0: f8687b68     	ldr	x8, [x27, x8, lsl #3]
 42761a4: d10343a0     	sub	x0, x29, #0xd0
 42761a8: d10203a1     	sub	x1, x29, #0x80
 42761ac: d63f0100     	blr	x8
 42761b0: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 42761b4: 36f800a8     	tbz	w8, #0x1f, 0x42761c8 <_ChromeMain+0x4270f2c>
 42761b8: f85483a0     	ldur	x0, [x29, #-0xb8]
 42761bc: f85583a8     	ldur	x8, [x29, #-0xa8]
 42761c0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42761c4: 96f64b3d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42761c8: 8b1602e8     	add	x8, x23, x22
 42761cc: 39813d09     	ldrsb	x9, [x8, #0x4f]
 42761d0: b7fff8e9     	tbnz	x9, #0x3f, 0x42760ec <_ChromeMain+0x4270e50>
 42761d4: b4fff909     	cbz	x9, 0x42760f4 <_ChromeMain+0x4270e58>
 42761d8: 9100e100     	add	x0, x8, #0x38
 42761dc: 39813d01     	ldrsb	x1, [x8, #0x4f]
 42761e0: b6f80081     	tbz	x1, #0x3f, 0x42761f0 <_ChromeMain+0x4270f54>
 42761e4: f9400000     	ldr	x0, [x0]
 42761e8: 8b1602e8     	add	x8, x23, x22
 42761ec: f9402101     	ldr	x1, [x8, #0x40]
 42761f0: d102e3a8     	sub	x8, x29, #0xb8
 42761f4: 9734b2c5     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 42761f8: 3cc68380     	ldur	q0, [x28, #0x68]
 42761fc: 3c9803a0     	stur	q0, [x29, #-0x80]
 4276200: f85583a8     	ldur	x8, [x29, #-0xa8]
 4276204: f81903a8     	stur	x8, [x29, #-0x70]
 4276208: a934ffbf     	stp	xzr, xzr, [x29, #-0xb8]
 427620c: f81583bf     	stur	xzr, [x29, #-0xa8]
 4276210: 381983b3     	sturb	w19, [x29, #-0x68]
 4276214: d10283a0     	sub	x0, x29, #0xa0
 4276218: d10203a3     	sub	x3, x29, #0x80
 427621c: d004b7a1     	adrp	x1, 0xd96c000 <dyld_stub_binder+0xd96c000>
 4276220: 912a7c21     	add	x1, x1, #0xa9f
 4276224: 52800102     	mov	w2, #0x8                ; =8
 4276228: 970b1326     	bl	0x53aec0 <_ChromeMain+0x535c24>
 427622c: 385983a8     	ldurb	w8, [x29, #-0x68]
 4276230: f103fd1f     	cmp	x8, #0xff
 4276234: 540000a0     	b.eq	0x4276248 <_ChromeMain+0x4270fac>
 4276238: f8687b68     	ldr	x8, [x27, x8, lsl #3]
 427623c: d10343a0     	sub	x0, x29, #0xd0
 4276240: d10203a1     	sub	x1, x29, #0x80
 4276244: d63f0100     	blr	x8
 4276248: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 427624c: 36fff548     	tbz	w8, #0x1f, 0x42760f4 <_ChromeMain+0x4270e58>
 4276250: f85483a0     	ldur	x0, [x29, #-0xb8]
 4276254: f85583a8     	ldur	x8, [x29, #-0xa8]
 4276258: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427625c: 96f64b17     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276260: 17ffffa5     	b	0x42760f4 <_ChromeMain+0x4270e58>
