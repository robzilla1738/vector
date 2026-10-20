
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42530c0: d101c3ff     	sub	sp, sp, #0x70
 42530c4: a9035ff8     	stp	x24, x23, [sp, #0x30]
 42530c8: a90457f6     	stp	x22, x21, [sp, #0x40]
 42530cc: a9054ff4     	stp	x20, x19, [sp, #0x50]
 42530d0: a9067bfd     	stp	x29, x30, [sp, #0x60]
 42530d4: 910183fd     	add	x29, sp, #0x60
 42530d8: aa0303f5     	mov	x21, x3
 42530dc: 39404008     	ldrb	w8, [x0, #0x10]
 42530e0: 36000288     	tbz	w8, #0x0, 0x4253130 <_ChromeMain+0x424de94>
 42530e4: b50000f5     	cbnz	x21, 0x4253100 <_ChromeMain+0x424de64>
 42530e8: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 42530ec: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 42530f0: a94457f6     	ldp	x22, x21, [sp, #0x40]
 42530f4: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 42530f8: 9101c3ff     	add	sp, sp, #0x70
 42530fc: d65f03c0     	ret
 4253100: 12800008     	mov	w8, #-0x1               ; =-1
 4253104: b8e802a8     	ldaddal	w8, w8, [x21]
 4253108: 7100051f     	cmp	w8, #0x1
 425310c: 54fffee1     	b.ne	0x42530e8 <_ChromeMain+0x424de4c>
 4253110: f9400aa1     	ldr	x1, [x21, #0x10]
 4253114: aa1503e0     	mov	x0, x21
 4253118: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 425311c: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4253120: a94457f6     	ldp	x22, x21, [sp, #0x40]
 4253124: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4253128: 9101c3ff     	add	sp, sp, #0x70
 425312c: d61f0020     	br	x1
 4253130: aa0103f3     	mov	x19, x1
 4253134: aa0003f4     	mov	x20, x0
 4253138: b9400028     	ldr	w8, [x1]
 425313c: 29030808     	stp	w8, w2, [x0, #0x18]
 4253140: 39c0dc08     	ldrsb	w8, [x0, #0x37]
 4253144: 37f80088     	tbnz	w8, #0x1f, 0x4253154 <_ChromeMain+0x424deb8>
 4253148: 3900829f     	strb	wzr, [x20, #0x20]
 425314c: 3900de9f     	strb	wzr, [x20, #0x37]
 4253150: 14000004     	b	0x4253160 <_ChromeMain+0x424dec4>
 4253154: f9401288     	ldr	x8, [x20, #0x20]
 4253158: 3900011f     	strb	wzr, [x8]
 425315c: f900169f     	str	xzr, [x20, #0x28]
 4253160: 39c13e88     	ldrsb	w8, [x20, #0x4f]
 4253164: 37f80348     	tbnz	w8, #0x1f, 0x42531cc <_ChromeMain+0x424df30>
 4253168: 7900729f     	strh	wzr, [x20, #0x38]
 425316c: 39013e9f     	strb	wzr, [x20, #0x4f]
 4253170: 1400001a     	b	0x42531d8 <_ChromeMain+0x424df3c>
 4253174: 12800008     	mov	w8, #-0x1               ; =-1
 4253178: b8e80008     	ldaddal	w8, w8, [x0]
 425317c: 7100051f     	cmp	w8, #0x1
 4253180: 540003a1     	b.ne	0x42531f4 <_ChromeMain+0x424df58>
 4253184: f9400808     	ldr	x8, [x0, #0x10]
 4253188: d0fe6a89     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 425318c: 91190129     	add	x9, x9, #0x640
 4253190: eb09011f     	cmp	x8, x9
 4253194: 54000120     	b.eq	0x42531b8 <_ChromeMain+0x424df1c>
 4253198: b0ffb8c9     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 425319c: 91180129     	add	x9, x9, #0x600
 42531a0: eb09011f     	cmp	x8, x9
 42531a4: 54000060     	b.eq	0x42531b0 <_ChromeMain+0x424df14>
 42531a8: d63f0100     	blr	x8
 42531ac: 14000012     	b	0x42531f4 <_ChromeMain+0x424df58>
 42531b0: 52800701     	mov	w1, #0x38               ; =56
 42531b4: 14000004     	b	0x42531c4 <_ChromeMain+0x424df28>
 42531b8: f9401808     	ldr	x8, [x0, #0x30]
 42531bc: b5001748     	cbnz	x8, 0x42534a4 <_ChromeMain+0x424e208>
 42531c0: 52800901     	mov	w1, #0x48               ; =72
 42531c4: 96f6d73d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42531c8: 1400000b     	b	0x42531f4 <_ChromeMain+0x424df58>
 42531cc: f9401e88     	ldr	x8, [x20, #0x38]
 42531d0: 7900011f     	strh	wzr, [x8]
 42531d4: f900229f     	str	xzr, [x20, #0x40]
 42531d8: b00465a1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42531dc: 91034421     	add	x1, x1, #0xd1
 42531e0: 91014280     	add	x0, x20, #0x50
 42531e4: 97469258     	bl	0x13f7b44 <_ChromeMain+0x13f28a8>
 42531e8: f9403e80     	ldr	x0, [x20, #0x78]
 42531ec: f9003e95     	str	x21, [x20, #0x78]
 42531f0: b5fffc20     	cbnz	x0, 0x4253174 <_ChromeMain+0x424ded8>
 42531f4: 7801129f     	sturh	wzr, [x20, #0x11]
 42531f8: f9403680     	ldr	x0, [x20, #0x68]
 42531fc: f900369f     	str	xzr, [x20, #0x68]
 4253200: b4000080     	cbz	x0, 0x4253210 <_ChromeMain+0x424df74>
 4253204: 940017f8     	bl	0x42591e4 <_ChromeMain+0x4253f48>
 4253208: 52802001     	mov	w1, #0x100              ; =256
 425320c: 96f6d72b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4253210: 52800028     	mov	w8, #0x1                ; =1
 4253214: 39004288     	strb	w8, [x20, #0x10]
 4253218: f9403a88     	ldr	x8, [x20, #0x70]
 425321c: b5000488     	cbnz	x8, 0x42532ac <_ChromeMain+0x424e010>
 4253220: d00565a8     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 4253224: f940d516     	ldr	x22, [x8, #0x1a8]
 4253228: 52800400     	mov	w0, #0x20               ; =32
 425322c: 96f6f04f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253230: aa0003f5     	mov	x21, x0
 4253234: 910042c8     	add	x8, x22, #0x10
 4253238: f10002df     	cmp	x22, #0x0
 425323c: 9a8803e2     	csel	x2, xzr, x8, eq
 4253240: 394ae6c3     	ldrb	w3, [x22, #0x2b9]
 4253244: b00465a1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4253248: 9103c021     	add	x1, x1, #0xf0
 425324c: 972a311d     	bl	0xcdf6c0 <_ChromeMain+0xcda424>
 4253250: b40000e0     	cbz	x0, 0x425326c <_ChromeMain+0x424dfd0>
 4253254: 910022a8     	add	x8, x21, #0x8
 4253258: 52800029     	mov	w9, #0x1                ; =1
 425325c: b8290108     	ldadd	w9, w8, [x8]
 4253260: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4253264: 6b09011f     	cmp	w8, w9
 4253268: 54001380     	b.eq	0x42534d8 <_ChromeMain+0x424e23c>
 425326c: f9403a80     	ldr	x0, [x20, #0x70]
 4253270: f9003a95     	str	x21, [x20, #0x70]
 4253274: b40001c0     	cbz	x0, 0x42532ac <_ChromeMain+0x424e010>
 4253278: 91002008     	add	x8, x0, #0x8
 425327c: 12800009     	mov	w9, #-0x1               ; =-1
 4253280: b8e90108     	ldaddal	w9, w8, [x8]
 4253284: 7100051f     	cmp	w8, #0x1
 4253288: 54000121     	b.ne	0x42532ac <_ChromeMain+0x424e010>
 425328c: f9400009     	ldr	x9, [x0]
 4253290: f9400d28     	ldr	x8, [x9, #0x18]
 4253294: 103bbfca     	adr	x10, 0x42caa8c <_ChromeMain+0x42c57f0>
 4253298: d503201f     	nop
 425329c: eb0a011f     	cmp	x8, x10
 42532a0: 54000041     	b.ne	0x42532a8 <_ChromeMain+0x424e00c>
 42532a4: f9400928     	ldr	x8, [x9, #0x10]
 42532a8: d63f0100     	blr	x8
 42532ac: 39404e88     	ldrb	w8, [x20, #0x13]
 42532b0: 34000148     	cbz	w8, 0x42532d8 <_ChromeMain+0x424e03c>
 42532b4: f9400288     	ldr	x8, [x20]
 42532b8: b40000a8     	cbz	x8, 0x42532cc <_ChromeMain+0x424e030>
 42532bc: 19404108     	ldapurb	w8, [x8, #0x4]
 42532c0: 35000068     	cbnz	w8, 0x42532cc <_ChromeMain+0x424e030>
 42532c4: f9400688     	ldr	x8, [x20, #0x8]
 42532c8: b50009e8     	cbnz	x8, 0x4253404 <_ChromeMain+0x424e168>
 42532cc: d2800000     	mov	x0, #0x0                ; =0
 42532d0: 52800001     	mov	w1, #0x0                ; =0
 42532d4: 940ce731     	bl	0x458cf98 <_ChromeMain+0x4587cfc>
 42532d8: f004ad40     	adrp	x0, 0xd7fe000 <dyld_stub_binder+0xd7fe000>
 42532dc: 91242400     	add	x0, x0, #0x909
 42532e0: 9004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42532e4: 91080821     	add	x1, x1, #0x202
 42532e8: 910023e8     	add	x8, sp, #0x8
 42532ec: 52810702     	mov	w2, #0x838              ; =2104
 42532f0: 96f7f664     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42532f4: b9401e88     	ldr	w8, [x20, #0x1c]
 42532f8: 7100051f     	cmp	w8, #0x1
 42532fc: 54000060     	b.eq	0x4253308 <_ChromeMain+0x424e06c>
 4253300: 52800008     	mov	w8, #0x0                ; =0
 4253304: 14000002     	b	0x425330c <_ChromeMain+0x424e070>
 4253308: 39405288     	ldrb	w8, [x20, #0x14]
 425330c: 12000116     	and	w22, w8, #0x1
 4253310: 52800a00     	mov	w0, #0x50               ; =80
 4253314: 96f6f015     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253318: aa0003f5     	mov	x21, x0
 425331c: 52800028     	mov	w8, #0x1                ; =1
 4253320: b9000008     	str	w8, [x0]
 4253324: 100312c8     	adr	x8, 0x425957c <_ChromeMain+0x42542e0>
 4253328: d503201f     	nop
 425332c: 10032649     	adr	x9, 0x42597f4 <_ChromeMain+0x4254558>
 4253330: d503201f     	nop
 4253334: a900a408     	stp	x8, x9, [x0, #0x8]
 4253338: d0ff1848     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 425333c: 912c0108     	add	x8, x8, #0xb00
 4253340: f9000c08     	str	x8, [x0, #0x18]
 4253344: b9401a88     	ldr	w8, [x20, #0x18]
 4253348: b9002808     	str	w8, [x0, #0x28]
 425334c: 39c07e68     	ldrsb	w8, [x19, #0x1f]
 4253350: 37f800c8     	tbnz	w8, #0x1f, 0x4253368 <_ChromeMain+0x424e0cc>
 4253354: 3cc08260     	ldur	q0, [x19, #0x8]
 4253358: 3c8302a0     	stur	q0, [x21, #0x30]
 425335c: f8418268     	ldur	x8, [x19, #0x18]
 4253360: f80402a8     	stur	x8, [x21, #0x40]
 4253364: 14000004     	b	0x4253374 <_ChromeMain+0x424e0d8>
 4253368: a9408a61     	ldp	x1, x2, [x19, #0x8]
 425336c: 9100c2a0     	add	x0, x21, #0x30
 4253370: 96f713aa     	bl	0x18218 <_ChromeMain+0x12f7c>
 4253374: 390122b6     	strb	w22, [x21, #0x48]
 4253378: f9404296     	ldr	x22, [x20, #0x80]
 425337c: b40000d6     	cbz	x22, 0x4253394 <_ChromeMain+0x424e0f8>
 4253380: 52800028     	mov	w8, #0x1                ; =1
 4253384: b82802c8     	ldadd	w8, w8, [x22]
 4253388: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 425338c: 6b09011f     	cmp	w8, w9
 4253390: 540009e0     	b.eq	0x42534cc <_ChromeMain+0x424e230>
 4253394: f9404697     	ldr	x23, [x20, #0x88]
 4253398: 52801200     	mov	w0, #0x90               ; =144
 425339c: 96f6eff3     	bl	0xf368 <_ChromeMain+0xa0cc>
 42533a0: aa0003f4     	mov	x20, x0
 42533a4: 52800028     	mov	w8, #0x1                ; =1
 42533a8: 10ae9909     	adr	x9, 0x41b06c8 <_ChromeMain+0x41ab42c>
 42533ac: d503201f     	nop
 42533b0: 1003248a     	adr	x10, 0x4259840 <_ChromeMain+0x42545a4>
 42533b4: d503201f     	nop
 42533b8: b9000008     	str	w8, [x0]
 42533bc: f0fff2c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 42533c0: 911b0108     	add	x8, x8, #0x6c0
 42533c4: 1000092b     	adr	x11, 0x42534e8 <_ChromeMain+0x424e24c>
 42533c8: d503201f     	nop
 42533cc: a900a809     	stp	x9, x10, [x0, #0x8]
 42533d0: a901ac08     	stp	x8, x11, [x0, #0x18]
 42533d4: a902d81f     	stp	xzr, x22, [x0, #0x28]
 42533d8: f9001c17     	str	x23, [x0, #0x38]
 42533dc: 91010000     	add	x0, x0, #0x40
 42533e0: aa1303e1     	mov	x1, x19
 42533e4: 97ffeab9     	bl	0x424dec8 <_ChromeMain+0x4248c2c>
 42533e8: b00465a1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42533ec: 9103d821     	add	x1, x1, #0xf6
 42533f0: 910023e0     	add	x0, sp, #0x8
 42533f4: aa1503e2     	mov	x2, x21
 42533f8: aa1403e3     	mov	x3, x20
 42533fc: 94e6dcdd     	bl	0x7c0a770 <_ChromeMain+0x7c054d4>
 4253400: 17ffff3a     	b	0x42530e8 <_ChromeMain+0x424de4c>
 4253404: f0056488     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4253408: f9467d08     	ldr	x8, [x8, #0xcf8]
 425340c: f9414908     	ldr	x8, [x8, #0x290]
 4253410: f9400515     	ldr	x21, [x8, #0x8]
 4253414: f9400288     	ldr	x8, [x20]
 4253418: b40000a8     	cbz	x8, 0x425342c <_ChromeMain+0x424e190>
 425341c: 19404108     	ldapurb	w8, [x8, #0x4]
 4253420: 35000068     	cbnz	w8, 0x425342c <_ChromeMain+0x424e190>
 4253424: f9400680     	ldr	x0, [x20, #0x8]
 4253428: 14000002     	b	0x4253430 <_ChromeMain+0x424e194>
 425342c: d2800000     	mov	x0, #0x0                ; =0
 4253430: 970d3431     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 4253434: b4fff4e0     	cbz	x0, 0x42532d0 <_ChromeMain+0x424e034>
 4253438: f9402808     	ldr	x8, [x0, #0x50]
 425343c: b5000068     	cbnz	x8, 0x4253448 <_ChromeMain+0x424e1ac>
 4253440: f9402409     	ldr	x9, [x0, #0x48]
 4253444: b4fff449     	cbz	x9, 0x42532cc <_ChromeMain+0x424e030>
 4253448: 52800a09     	mov	w9, #0x50               ; =80
 425344c: 5280090a     	mov	w10, #0x48              ; =72
 4253450: f100011f     	cmp	x8, #0x0
 4253454: 9a890148     	csel	x8, x10, x9, eq
 4253458: f8686808     	ldr	x8, [x0, x8]
 425345c: f9400908     	ldr	x8, [x8, #0x10]
 4253460: f9400516     	ldr	x22, [x8, #0x8]
 4253464: b4fff356     	cbz	x22, 0x42532cc <_ChromeMain+0x424e030>
 4253468: 9100a2c8     	add	x8, x22, #0x28
 425346c: 3900bfff     	strb	wzr, [sp, #0x2f]
 4253470: 9100bfe9     	add	x9, sp, #0x2f
 4253474: a900a3e9     	stp	x9, x8, [sp, #0x8]
 4253478: d0fe5ae2     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 425347c: 912dc042     	add	x2, x2, #0xb70
 4253480: 910023e1     	add	x1, sp, #0x8
 4253484: aa1503e0     	mov	x0, x21
 4253488: 52800003     	mov	w3, #0x0                ; =0
 425348c: 52800004     	mov	w4, #0x0                ; =0
 4253490: 972d78f8     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 4253494: 3940bfe8     	ldrb	w8, [sp, #0x2f]
 4253498: 7100011f     	cmp	w8, #0x0
 425349c: 9a9f12c0     	csel	x0, x22, xzr, ne
 42534a0: 17ffff8c     	b	0x42532d0 <_ChromeMain+0x424e034>
 42534a4: 12800009     	mov	w9, #-0x1               ; =-1
 42534a8: b8e90109     	ldaddal	w9, w9, [x8]
 42534ac: 7100053f     	cmp	w9, #0x1
 42534b0: 54ffe881     	b.ne	0x42531c0 <_ChromeMain+0x424df24>
 42534b4: aa0003f5     	mov	x21, x0
 42534b8: aa0803e0     	mov	x0, x8
 42534bc: 52800101     	mov	w1, #0x8                ; =8
 42534c0: 96f6d67e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42534c4: aa1503e0     	mov	x0, x21
 42534c8: 17ffff3e     	b	0x42531c0 <_ChromeMain+0x424df24>
 42534cc: d4200000     	brk	#0
 42534d0: d4400000     	hlt	#0
 42534d4: d4200020     	brk	#0x1
 42534d8: d4200000     	brk	#0
 42534dc: d4400000     	hlt	#0
 42534e0: d4200020     	brk	#0x1
 42534e4: 00000000     	udf	#0x0
