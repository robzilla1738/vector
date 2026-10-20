
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
 42534e8: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 42534ec: a90167fa     	stp	x26, x25, [sp, #0x10]
 42534f0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 42534f4: a90357f6     	stp	x22, x21, [sp, #0x30]
 42534f8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 42534fc: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4253500: 910143fd     	add	x29, sp, #0x50
 4253504: d10703ff     	sub	sp, sp, #0x1c0
 4253508: aa0203f4     	mov	x20, x2
 425350c: aa0103f5     	mov	x21, x1
 4253510: aa0003f3     	mov	x19, x0
 4253514: b9401c08     	ldr	w8, [x0, #0x1c]
 4253518: 7100051f     	cmp	w8, #0x1
 425351c: 54000d41     	b.ne	0x42536c4 <_ChromeMain+0x424e428>
 4253520: f9400268     	ldr	x8, [x19]
 4253524: b4000d88     	cbz	x8, 0x42536d4 <_ChromeMain+0x424e438>
 4253528: 19404108     	ldapurb	w8, [x8, #0x4]
 425352c: 35000d48     	cbnz	w8, 0x42536d4 <_ChromeMain+0x424e438>
 4253530: f9400668     	ldr	x8, [x19, #0x8]
 4253534: b4000d08     	cbz	x8, 0x42536d4 <_ChromeMain+0x424e438>
 4253538: f9400268     	ldr	x8, [x19]
 425353c: b4002e88     	cbz	x8, 0x4253b0c <_ChromeMain+0x424e870>
 4253540: 19404108     	ldapurb	w8, [x8, #0x4]
 4253544: 35002e48     	cbnz	w8, 0x4253b0c <_ChromeMain+0x424e870>
 4253548: f9400668     	ldr	x8, [x19, #0x8]
 425354c: f9413918     	ldr	x24, [x8, #0x270]
 4253550: b4000c38     	cbz	x24, 0x42536d4 <_ChromeMain+0x424e438>
 4253554: f9403a76     	ldr	x22, [x19, #0x70]
 4253558: 9004c660     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425355c: 91093000     	add	x0, x0, #0x24c
 4253560: 9004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253564: 91080821     	add	x1, x1, #0x202
 4253568: 9103c3e8     	add	x8, sp, #0xf0
 425356c: 52810be2     	mov	w2, #0x85f              ; =2143
 4253570: 96f7f5c4     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4253574: 52800e00     	mov	w0, #0x70               ; =112
 4253578: 96f6ef7c     	bl	0xf368 <_ChromeMain+0xa0cc>
 425357c: aa0003f7     	mov	x23, x0
 4253580: 52800028     	mov	w8, #0x1                ; =1
 4253584: 100318a9     	adr	x9, 0x4259898 <_ChromeMain+0x42545fc>
 4253588: d503201f     	nop
 425358c: 10031caa     	adr	x10, 0x4259920 <_ChromeMain+0x4254684>
 4253590: d503201f     	nop
 4253594: b9000008     	str	w8, [x0]
 4253598: d0ff1848     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 425359c: 912c0108     	add	x8, x8, #0xb00
 42535a0: 100045cb     	adr	x11, 0x4253e58 <_ChromeMain+0x424ebbc>
 42535a4: d503201f     	nop
 42535a8: a900a809     	stp	x9, x10, [x0, #0x8]
 42535ac: a901ac08     	stp	x8, x11, [x0, #0x18]
 42535b0: b9401a68     	ldr	w8, [x19, #0x18]
 42535b4: b9002808     	str	w8, [x0, #0x28]
 42535b8: 39c07ea8     	ldrsb	w8, [x21, #0x1f]
 42535bc: 37f809e8     	tbnz	w8, #0x1f, 0x42536f8 <_ChromeMain+0x424e45c>
 42535c0: 3cc082a0     	ldur	q0, [x21, #0x8]
 42535c4: 3c8302e0     	stur	q0, [x23, #0x30]
 42535c8: f84182a8     	ldur	x8, [x21, #0x18]
 42535cc: f80402e8     	stur	x8, [x23, #0x40]
 42535d0: 39405269     	ldrb	w9, [x19, #0x14]
 42535d4: aa1703e8     	mov	x8, x23
 42535d8: 38050d1f     	strb	wzr, [x8, #0x50]!
 42535dc: 381f8109     	sturb	w9, [x8, #-0x8]
 42535e0: 3900611f     	strb	wzr, [x8, #0x18]
 42535e4: 39406289     	ldrb	w9, [x20, #0x18]
 42535e8: 34000129     	cbz	w9, 0x425360c <_ChromeMain+0x424e370>
 42535ec: 3dc00280     	ldr	q0, [x20]
 42535f0: 3d800100     	str	q0, [x8]
 42535f4: f9400a89     	ldr	x9, [x20, #0x10]
 42535f8: f9000909     	str	x9, [x8, #0x10]
 42535fc: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 4253600: f900029f     	str	xzr, [x20]
 4253604: 52800028     	mov	w8, #0x1                ; =1
 4253608: 3901a2e8     	strb	w8, [x23, #0x68]
 425360c: f9404274     	ldr	x20, [x19, #0x80]
 4253610: b40000d4     	cbz	x20, 0x4253628 <_ChromeMain+0x424e38c>
 4253614: 52800028     	mov	w8, #0x1                ; =1
 4253618: b8280288     	ldadd	w8, w8, [x20]
 425361c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4253620: 6b09011f     	cmp	w8, w9
 4253624: 540027a0     	b.eq	0x4253b18 <_ChromeMain+0x424e87c>
 4253628: f9404675     	ldr	x21, [x19, #0x88]
 425362c: f9406313     	ldr	x19, [x24, #0xc0]
 4253630: b40000d3     	cbz	x19, 0x4253648 <_ChromeMain+0x424e3ac>
 4253634: 52800028     	mov	w8, #0x1                ; =1
 4253638: b8280268     	ldadd	w8, w8, [x19]
 425363c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4253640: 6b09011f     	cmp	w8, w9
 4253644: 54002700     	b.eq	0x4253b24 <_ChromeMain+0x424e888>
 4253648: f9406718     	ldr	x24, [x24, #0xc8]
 425364c: 52800a00     	mov	w0, #0x50               ; =80
 4253650: 96f6ef46     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253654: aa0003e3     	mov	x3, x0
 4253658: 52800028     	mov	w8, #0x1                ; =1
 425365c: b9000008     	str	w8, [x0]
 4253660: 1004d888     	adr	x8, 0x425d170 <_ChromeMain+0x4257ed4>
 4253664: d503201f     	nop
 4253668: 90ffef49     	adrp	x9, 0x403b000 <_ChromeMain+0x4035d64>
 425366c: 91178129     	add	x9, x9, #0x5e0
 4253670: a900a408     	stp	x8, x9, [x0, #0x8]
 4253674: f0fff2c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4253678: 911b0108     	add	x8, x8, #0x6c0
 425367c: 1000ff29     	adr	x9, 0x4255660 <_ChromeMain+0x42503c4>
 4253680: d503201f     	nop
 4253684: a901a408     	stp	x8, x9, [x0, #0x18]
 4253688: a902d01f     	stp	xzr, x20, [x0, #0x28]
 425368c: a903cc15     	stp	x21, x19, [x0, #0x38]
 4253690: f9002418     	str	x24, [x0, #0x48]
 4253694: 9103c3e1     	add	x1, sp, #0xf0
 4253698: aa1603e0     	mov	x0, x22
 425369c: aa1703e2     	mov	x2, x23
 42536a0: 940001b2     	bl	0x4253d68 <_ChromeMain+0x424eacc>
 42536a4: 910703ff     	add	sp, sp, #0x1c0
 42536a8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42536ac: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42536b0: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42536b4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42536b8: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42536bc: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42536c0: d65f03c0     	ret
 42536c4: f0056488     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 42536c8: f9467d00     	ldr	x0, [x8, #0xcf8]
 42536cc: 975f312b     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 42536d0: b5000360     	cbnz	x0, 0x425373c <_ChromeMain+0x424e4a0>
 42536d4: aa1303e0     	mov	x0, x19
 42536d8: 910703ff     	add	sp, sp, #0x1c0
 42536dc: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42536e0: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42536e4: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42536e8: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42536ec: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42536f0: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42536f4: 14000112     	b	0x4253b3c <_ChromeMain+0x424e8a0>
 42536f8: a9408aa1     	ldp	x1, x2, [x21, #0x8]
 42536fc: 9100c2e0     	add	x0, x23, #0x30
 4253700: 96f712c6     	bl	0x18218 <_ChromeMain+0x12f7c>
 4253704: 17ffffb3     	b	0x42535d0 <_ChromeMain+0x424e334>
 4253708: f9401e60     	ldr	x0, [x19, #0x38]
 425370c: f9402668     	ldr	x8, [x19, #0x48]
 4253710: d37ff901     	lsl	x1, x8, #1
 4253714: 96f6d5e9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4253718: 1400002e     	b	0x42537d0 <_ChromeMain+0x424e534>
 425371c: a9438a61     	ldp	x1, x2, [x19, #0x38]
 4253720: aa1703e0     	mov	x0, x23
 4253724: 9719ebf2     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 4253728: 14000052     	b	0x4253870 <_ChromeMain+0x424e5d4>
 425372c: a9420a61     	ldp	x1, x2, [x19, #0x20]
 4253730: 9103c3e0     	add	x0, sp, #0xf0
 4253734: 970954e0     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4253738: 14000042     	b	0x4253840 <_ChromeMain+0x424e5a4>
 425373c: aa0003f7     	mov	x23, x0
 4253740: 975f3134     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4253744: aa0003f6     	mov	x22, x0
 4253748: 9103c3e8     	add	x8, sp, #0xf0
 425374c: aa1703e0     	mov	x0, x23
 4253750: 94e1cff8     	bl	0x7ac7730 <_ChromeMain+0x7ac2494>
 4253754: 91008278     	add	x24, x19, #0x20
 4253758: 39c0de68     	ldrsb	w8, [x19, #0x37]
 425375c: 37f81be8     	tbnz	w8, #0x1f, 0x4253ad8 <_ChromeMain+0x424e83c>
 4253760: 3dc03fe0     	ldr	q0, [sp, #0xf0]
 4253764: 3d800300     	str	q0, [x24]
 4253768: f94083e8     	ldr	x8, [sp, #0x100]
 425376c: f9000b08     	str	x8, [x24, #0x10]
 4253770: b9401a60     	ldr	w0, [x19, #0x18]
 4253774: a90fffff     	stp	xzr, xzr, [sp, #0xf8]
 4253778: f9007bff     	str	xzr, [sp, #0xf0]
 425377c: 9103c3fa     	add	x26, sp, #0xf0
 4253780: 9103c3e8     	add	x8, sp, #0xf0
 4253784: 940031c3     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4253788: f004e921     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 425378c: 91130021     	add	x1, x1, #0x4c0
 4253790: 9103c3e0     	add	x0, sp, #0xf0
 4253794: 52800062     	mov	w2, #0x3                ; =3
 4253798: 97270b14     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 425379c: aa1503e8     	mov	x8, x21
 42537a0: f8420d09     	ldr	x9, [x8, #0x20]!
 42537a4: 39805d0a     	ldrsb	x10, [x8, #0x17]
 42537a8: f100015f     	cmp	x10, #0x0
 42537ac: 9a884121     	csel	x1, x9, x8, mi
 42537b0: f9400508     	ldr	x8, [x8, #0x8]
 42537b4: 7100015f     	cmp	w10, #0x0
 42537b8: 9a8a4102     	csel	x2, x8, x10, mi
 42537bc: 9103c3e0     	add	x0, sp, #0xf0
 42537c0: 97270b0a     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 42537c4: 9100e279     	add	x25, x19, #0x38
 42537c8: 39c13e68     	ldrsb	w8, [x19, #0x4f]
 42537cc: 37fff9e8     	tbnz	w8, #0x1f, 0x4253708 <_ChromeMain+0x424e46c>
 42537d0: 3dc03fe0     	ldr	q0, [sp, #0xf0]
 42537d4: 3d800320     	str	q0, [x25]
 42537d8: f94083e8     	ldr	x8, [sp, #0x100]
 42537dc: f9000b28     	str	x8, [x25, #0x10]
 42537e0: f900dbff     	str	xzr, [sp, #0x1b0]
 42537e4: 6f00e400     	movi.2d	v0, #0000000000000000
 42537e8: ad0c83e0     	stp	q0, q0, [sp, #0x190]
 42537ec: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 42537f0: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 42537f4: ad0983e0     	stp	q0, q0, [sp, #0x130]
 42537f8: ad0883e0     	stp	q0, q0, [sp, #0x110]
 42537fc: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 4253800: 97ae1b11     	bl	0x2dda444 <_ChromeMain+0x2dd51a8>
 4253804: aa0003e1     	mov	x1, x0
 4253808: 91022340     	add	x0, x26, #0x88
 425380c: 97ae1ac0     	bl	0x2dda30c <_ChromeMain+0x2dd5070>
 4253810: 790363ff     	strh	wzr, [sp, #0x1b0]
 4253814: 3906cbff     	strb	wzr, [sp, #0x1b2]
 4253818: eb18035f     	cmp	x26, x24
 425381c: 54000120     	b.eq	0x4253840 <_ChromeMain+0x424e5a4>
 4253820: 39c41fe9     	ldrsb	w9, [sp, #0x107]
 4253824: 3940de68     	ldrb	w8, [x19, #0x37]
 4253828: 37f81629     	tbnz	w9, #0x1f, 0x4253aec <_ChromeMain+0x424e850>
 425382c: 373ff808     	tbnz	w8, #0x7, 0x425372c <_ChromeMain+0x424e490>
 4253830: 3dc00300     	ldr	q0, [x24]
 4253834: 3d803fe0     	str	q0, [sp, #0xf0]
 4253838: f9400b08     	ldr	x8, [x24, #0x10]
 425383c: f90083e8     	str	x8, [sp, #0x100]
 4253840: 9103c3e8     	add	x8, sp, #0xf0
 4253844: 91006117     	add	x23, x8, #0x18
 4253848: eb1902ff     	cmp	x23, x25
 425384c: 54000120     	b.eq	0x4253870 <_ChromeMain+0x424e5d4>
 4253850: 39c47fe9     	ldrsb	w9, [sp, #0x11f]
 4253854: 39413e68     	ldrb	w8, [x19, #0x4f]
 4253858: 37f81309     	tbnz	w9, #0x1f, 0x4253ab8 <_ChromeMain+0x424e81c>
 425385c: 373ff608     	tbnz	w8, #0x7, 0x425371c <_ChromeMain+0x424e480>
 4253860: 3dc00320     	ldr	q0, [x25]
 4253864: 3d8002e0     	str	q0, [x23]
 4253868: f9400b28     	ldr	x8, [x25, #0x10]
 425386c: f9000ae8     	str	x8, [x23, #0x10]
 4253870: aa1603e0     	mov	x0, x22
 4253874: 94e1e9af     	bl	0x7acdf30 <_ChromeMain+0x7ac8c94>
 4253878: f94083e8     	ldr	x8, [sp, #0x100]
 425387c: f9001be8     	str	x8, [sp, #0x30]
 4253880: f9400ae8     	ldr	x8, [x23, #0x10]
 4253884: f90027e8     	str	x8, [sp, #0x48]
 4253888: 3dc03fe0     	ldr	q0, [sp, #0xf0]
 425388c: 3d800be0     	str	q0, [sp, #0x20]
 4253890: a90f7fff     	stp	xzr, xzr, [sp, #0xf0]
 4253894: 3dc002e0     	ldr	q0, [x23]
 4253898: 3c8383e0     	stur	q0, [sp, #0x38]
 425389c: a9007eff     	stp	xzr, xzr, [x23]
 42538a0: f9000aff     	str	xzr, [x23, #0x10]
 42538a4: f9409be8     	ldr	x8, [sp, #0x130]
 42538a8: f90033e8     	str	x8, [sp, #0x60]
 42538ac: 3dc04be0     	ldr	q0, [sp, #0x120]
 42538b0: 3d8017e0     	str	q0, [sp, #0x50]
 42538b4: f90083ff     	str	xzr, [sp, #0x100]
 42538b8: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 42538bc: 9100e7e8     	add	x8, sp, #0x39
 42538c0: 3ccff100     	ldur	q0, [x8, #0xff]
 42538c4: f940a7e8     	ldr	x8, [sp, #0x148]
 42538c8: f9003fe8     	str	x8, [sp, #0x78]
 42538cc: 3c8683e0     	stur	q0, [sp, #0x68]
 42538d0: a9147fff     	stp	xzr, xzr, [sp, #0x140]
 42538d4: a9137fff     	stp	xzr, xzr, [sp, #0x130]
 42538d8: f900afe0     	str	x0, [sp, #0x158]
 42538dc: ad4a87e0     	ldp	q0, q1, [sp, #0x150]
 42538e0: f940bbe8     	ldr	x8, [sp, #0x170]
 42538e4: f90053e8     	str	x8, [sp, #0xa0]
 42538e8: ad0407e0     	stp	q0, q1, [sp, #0x80]
 42538ec: a9167fff     	stp	xzr, xzr, [sp, #0x160]
 42538f0: 910083e8     	add	x8, sp, #0x20
 42538f4: f900bbff     	str	xzr, [sp, #0x170]
 42538f8: 91022100     	add	x0, x8, #0x88
 42538fc: 91022341     	add	x1, x26, #0x88
 4253900: 97ae1a83     	bl	0x2dda30c <_ChromeMain+0x2dd5070>
 4253904: 784c0348     	ldurh	w8, [x26, #0xc0]
 4253908: 7901c3e8     	strh	w8, [sp, #0xe0]
 425390c: 384c2348     	ldurb	w8, [x26, #0xc2]
 4253910: 39038be8     	strb	w8, [sp, #0xe2]
 4253914: 910083e1     	add	x1, sp, #0x20
 4253918: aa1603e0     	mov	x0, x22
 425391c: 979aaa15     	bl	0x28fe170 <_ChromeMain+0x28f8ed4>
 4253920: 910083e0     	add	x0, sp, #0x20
 4253924: 979beef8     	bl	0x294f504 <_ChromeMain+0x294a268>
 4253928: f9403a76     	ldr	x22, [x19, #0x70]
 425392c: 9004c660     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253930: 91093000     	add	x0, x0, #0x24c
 4253934: 9004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253938: 91080821     	add	x1, x1, #0x202
 425393c: 910003e8     	mov	x8, sp
 4253940: 52810f62     	mov	w2, #0x87b              ; =2171
 4253944: 96f7f4cf     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4253948: 52801300     	mov	w0, #0x98               ; =152
 425394c: 96f6ee87     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253950: aa0003f7     	mov	x23, x0
 4253954: 52800028     	mov	w8, #0x1                ; =1
 4253958: 1004cdc9     	adr	x9, 0x425d310 <_ChromeMain+0x4258074>
 425395c: d503201f     	nop
 4253960: 1004d20a     	adr	x10, 0x425d3a0 <_ChromeMain+0x4258104>
 4253964: d503201f     	nop
 4253968: b9000008     	str	w8, [x0]
 425396c: d0ff1848     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4253970: 912c0108     	add	x8, x8, #0xb00
 4253974: 1000f7ab     	adr	x11, 0x4255868 <_ChromeMain+0x42505cc>
 4253978: d503201f     	nop
 425397c: a900a809     	stp	x9, x10, [x0, #0x8]
 4253980: a901ac08     	stp	x8, x11, [x0, #0x18]
 4253984: b9401a68     	ldr	w8, [x19, #0x18]
 4253988: b9002808     	str	w8, [x0, #0x28]
 425398c: 39c07ea8     	ldrsb	w8, [x21, #0x1f]
 4253990: 37f807c8     	tbnz	w8, #0x1f, 0x4253a88 <_ChromeMain+0x424e7ec>
 4253994: 3cc082a0     	ldur	q0, [x21, #0x8]
 4253998: 3c8302e0     	stur	q0, [x23, #0x30]
 425399c: f84182a8     	ldur	x8, [x21, #0x18]
 42539a0: f80402e8     	stur	x8, [x23, #0x40]
 42539a4: 39c0de68     	ldrsb	w8, [x19, #0x37]
 42539a8: 37f80808     	tbnz	w8, #0x1f, 0x4253aa8 <_ChromeMain+0x424e80c>
 42539ac: 3dc00300     	ldr	q0, [x24]
 42539b0: 3c8482e0     	stur	q0, [x23, #0x48]
 42539b4: f9400b08     	ldr	x8, [x24, #0x10]
 42539b8: f80582e8     	stur	x8, [x23, #0x58]
 42539bc: 39c13e68     	ldrsb	w8, [x19, #0x4f]
 42539c0: 37f806c8     	tbnz	w8, #0x1f, 0x4253a98 <_ChromeMain+0x424e7fc>
 42539c4: 3dc00320     	ldr	q0, [x25]
 42539c8: 3c8602e0     	stur	q0, [x23, #0x60]
 42539cc: f9400b28     	ldr	x8, [x25, #0x10]
 42539d0: f80702e8     	stur	x8, [x23, #0x70]
 42539d4: aa1703e8     	mov	x8, x23
 42539d8: 38078d1f     	strb	wzr, [x8, #0x78]!
 42539dc: 3900611f     	strb	wzr, [x8, #0x18]
 42539e0: 39406289     	ldrb	w9, [x20, #0x18]
 42539e4: 34000129     	cbz	w9, 0x4253a08 <_ChromeMain+0x424e76c>
 42539e8: 3dc00280     	ldr	q0, [x20]
 42539ec: 3d800100     	str	q0, [x8]
 42539f0: f9400a89     	ldr	x9, [x20, #0x10]
 42539f4: f9000909     	str	x9, [x8, #0x10]
 42539f8: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 42539fc: f900029f     	str	xzr, [x20]
 4253a00: 52800028     	mov	w8, #0x1                ; =1
 4253a04: 390242e8     	strb	w8, [x23, #0x90]
 4253a08: f9404274     	ldr	x20, [x19, #0x80]
 4253a0c: b40000d4     	cbz	x20, 0x4253a24 <_ChromeMain+0x424e788>
 4253a10: 52800028     	mov	w8, #0x1                ; =1
 4253a14: b8280288     	ldadd	w8, w8, [x20]
 4253a18: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4253a1c: 6b09011f     	cmp	w8, w9
 4253a20: 54000880     	b.eq	0x4253b30 <_ChromeMain+0x424e894>
 4253a24: f9404673     	ldr	x19, [x19, #0x88]
 4253a28: 52800800     	mov	w0, #0x40               ; =64
 4253a2c: 96f6ee4f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253a30: aa0003e3     	mov	x3, x0
 4253a34: 52800028     	mov	w8, #0x1                ; =1
 4253a38: 1005b029     	adr	x9, 0x425f03c <_ChromeMain+0x4259da0>
 4253a3c: d503201f     	nop
 4253a40: b0ffe8ca     	adrp	x10, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4253a44: 912b014a     	add	x10, x10, #0xac0
 4253a48: b9000008     	str	w8, [x0]
 4253a4c: f0fff2c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4253a50: 911b0108     	add	x8, x8, #0x6c0
 4253a54: 1001df6b     	adr	x11, 0x4257640 <_ChromeMain+0x42523a4>
 4253a58: d503201f     	nop
 4253a5c: a900a809     	stp	x9, x10, [x0, #0x8]
 4253a60: a901ac08     	stp	x8, x11, [x0, #0x18]
 4253a64: a902d01f     	stp	xzr, x20, [x0, #0x28]
 4253a68: f9001c13     	str	x19, [x0, #0x38]
 4253a6c: 910003e1     	mov	x1, sp
 4253a70: aa1603e0     	mov	x0, x22
 4253a74: aa1703e2     	mov	x2, x23
 4253a78: 940000bc     	bl	0x4253d68 <_ChromeMain+0x424eacc>
 4253a7c: 9103c3e0     	add	x0, sp, #0xf0
 4253a80: 979beea1     	bl	0x294f504 <_ChromeMain+0x294a268>
 4253a84: 17ffff08     	b	0x42536a4 <_ChromeMain+0x424e408>
 4253a88: a9408aa1     	ldp	x1, x2, [x21, #0x8]
 4253a8c: 9100c2e0     	add	x0, x23, #0x30
 4253a90: 96f711e2     	bl	0x18218 <_ChromeMain+0x12f7c>
 4253a94: 17ffffc4     	b	0x42539a4 <_ChromeMain+0x424e708>
 4253a98: a9438a61     	ldp	x1, x2, [x19, #0x38]
 4253a9c: 910182e0     	add	x0, x23, #0x60
 4253aa0: 96f7cc4c     	bl	0x46bd0 <_ChromeMain+0x41934>
 4253aa4: 17ffffcc     	b	0x42539d4 <_ChromeMain+0x424e738>
 4253aa8: a9420a61     	ldp	x1, x2, [x19, #0x20]
 4253aac: 910122e0     	add	x0, x23, #0x48
 4253ab0: 96f711da     	bl	0x18218 <_ChromeMain+0x12f7c>
 4253ab4: 17ffffc2     	b	0x42539bc <_ChromeMain+0x424e720>
 4253ab8: 13001d09     	sxtb	w9, w8
 4253abc: 7100013f     	cmp	w9, #0x0
 4253ac0: a943aa69     	ldp	x9, x10, [x19, #0x38]
 4253ac4: 9a994121     	csel	x1, x9, x25, mi
 4253ac8: 9a884142     	csel	x2, x10, x8, mi
 4253acc: aa1703e0     	mov	x0, x23
 4253ad0: 9719eb59     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 4253ad4: 17ffff67     	b	0x4253870 <_ChromeMain+0x424e5d4>
 4253ad8: f9401260     	ldr	x0, [x19, #0x20]
 4253adc: f9401a68     	ldr	x8, [x19, #0x30]
 4253ae0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4253ae4: 96f6d4f5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4253ae8: 17ffff1e     	b	0x4253760 <_ChromeMain+0x424e4c4>
 4253aec: 13001d09     	sxtb	w9, w8
 4253af0: 7100013f     	cmp	w9, #0x0
 4253af4: a9422a69     	ldp	x9, x10, [x19, #0x20]
 4253af8: 9a984121     	csel	x1, x9, x24, mi
 4253afc: 9a884142     	csel	x2, x10, x8, mi
 4253b00: 9103c3e0     	add	x0, sp, #0xf0
 4253b04: 9709543f     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4253b08: 17ffff4e     	b	0x4253840 <_ChromeMain+0x424e5a4>
 4253b0c: d4200000     	brk	#0
 4253b10: d4400000     	hlt	#0
 4253b14: d4200020     	brk	#0x1
 4253b18: d4200000     	brk	#0
 4253b1c: d4400000     	hlt	#0
 4253b20: d4200020     	brk	#0x1
 4253b24: d4200000     	brk	#0
 4253b28: d4400000     	hlt	#0
 4253b2c: d4200020     	brk	#0x1
 4253b30: d4200000     	brk	#0
 4253b34: d4400000     	hlt	#0
 4253b38: d4200020     	brk	#0x1
