
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
