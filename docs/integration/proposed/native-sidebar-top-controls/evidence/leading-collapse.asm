
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 347a450: f941b280     	ldr	x0, [x20, #0x360]
 347a454: b4000740     	cbz	x0, 0x347a53c <_ChromeMain+0x34752a0>
 347a458: 394eca88     	ldrb	w8, [x20, #0x3b2]
 347a45c: 52000108     	eor	w8, w8, #0x1
 347a460: b94033e9     	ldr	w9, [sp, #0x30]
 347a464: 6a08013f     	tst	w9, w8
 347a468: 540006a0     	b.eq	0x347a53c <_ChromeMain+0x34752a0>
 347a46c: 9004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 347a470: 911c4021     	add	x1, x1, #0x710
 347a474: 974d6e03     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 347a478: d360fc08     	lsr	x8, x0, #32
 347a47c: 4e080c00     	dup.2d	v0, x0
 347a480: 90055609     	adrp	x9, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 347a484: 3dc01121     	ldr	q1, [x9, #0x40]
 347a488: 6ee14400     	ushl.2d	v0, v0, v1
 347a48c: 0ea12800     	xtn.2s	v0, v0
 347a490: 8b40fd08     	add	x8, x8, x0, lsr #63
 347a494: 4b880748     	sub	w8, w26, w8, asr #1
 347a498: 1e2702c1     	fmov	s1, w22
 347a49c: 4e0c1d01     	mov.s	v1[1], w8
 347a4a0: 0aa87d15     	bic	w21, w8, w8, asr #31
 347a4a4: 0f046402     	movi.2s	v2, #0x80, lsl #24
 347a4a8: 1e614042     	fneg	d2, d2
 347a4ac: 0ea26421     	smax.2s	v1, v1, v2
 347a4b0: 290857f6     	stp	w22, w21, [sp, #0x40]
 347a4b4: 0ea00c20     	sqadd.2s	v0, v1, v0
 347a4b8: 0ea12c00     	sqsub.2s	v0, v0, v1
 347a4bc: 6f00e401     	movi.2d	v1, #0000000000000000
 347a4c0: 0ea16400     	smax.2s	v0, v0, v1
 347a4c4: 3d8007e0     	str	q0, [sp, #0x10]
 347a4c8: fd0027e0     	str	d0, [sp, #0x48]
 347a4cc: f941b288     	ldr	x8, [x20, #0x360]
 347a4d0: f9002fe8     	str	x8, [sp, #0x58]
 347a4d4: 52800028     	mov	w8, #0x1                ; =1
 347a4d8: 39015fe8     	strb	w8, [sp, #0x57]
 347a4dc: a9412668     	ldp	x8, x9, [x19, #0x10]
 347a4e0: eb09011f     	cmp	x8, x9
 347a4e4: 54005e21     	b.ne	0x347b0a8 <_ChromeMain+0x3475e0c>
 347a4e8: 91002260     	add	x0, x19, #0x8
 347a4ec: 910163e1     	add	x1, sp, #0x58
 347a4f0: 91015fe2     	add	x2, sp, #0x57
 347a4f4: 910103e3     	add	x3, sp, #0x40
 347a4f8: 974c170a     	bl	0x780120 <_ChromeMain+0x77ae84>
 347a4fc: f9400668     	ldr	x8, [x19, #0x8]
 347a500: eb080008     	subs	x8, x0, x8
 347a504: 9344fd08     	asr	x8, x8, #4
 347a508: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a50c: f2955569     	movk	x9, #0xaaab
 347a510: 9b097d08     	mul	x8, x8, x9
 347a514: f9000a68     	str	x8, [x19, #0x10]
 347a518: 54ff9e60     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a51c: 3dc007e0     	ldr	q0, [sp, #0x10]
 347a520: 1e260008     	fmov	w8, s0
 347a524: 0b16011b     	add	w27, w8, w22
 347a528: 0e0c3c16     	mov.s	w22, v0[1]
 347a52c: 528007e0     	mov	w0, #0x3f               ; =63
 347a530: 974224e4     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 347a534: 0b0002a8     	add	w8, w21, w0
 347a538: 0b0802ca     	add	w10, w22, w8
