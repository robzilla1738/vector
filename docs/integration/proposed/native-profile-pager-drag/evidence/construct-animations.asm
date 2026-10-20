Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e0314: 9139a260     	add	x0, x19, #0xe68
 37e0318: 9115e261     	add	x1, x19, #0x578
 37e031c: 52800782     	mov	w2, #0x3c               ; =60
 37e0320: 976e3a38     	bl	0x136ec00 <_ChromeMain+0x1369964>
 37e0324: b0055808     	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 37e0328: 91240108     	add	x8, x8, #0x900
 37e032c: f9073668     	str	x8, [x19, #0xe68]
 37e0330: f9404788     	ldr	x8, [x28, #0x88]
 37e0334: eb08031f     	cmp	x24, x8
 37e0338: 54000061     	b.ne	0x37e0344 <_ChromeMain+0x37db0a8>
 37e033c: 9115e260     	add	x0, x19, #0x578
 37e0340: 9720cfef     	bl	0x142fc <_ChromeMain+0xf060>
 37e0344: 91400677     	add	x23, x19, #0x1, lsl #12 ; =0x1000
 37e0348: f9075a75     	str	x21, [x19, #0xeb0]
 37e034c: b90eba79     	str	w25, [x19, #0xeb8]
 37e0350: 393af27f     	strb	wzr, [x19, #0xebc]
 37e0354: 393b027f     	strb	wzr, [x19, #0xec0]
 37e0358: f907667f     	str	xzr, [x19, #0xec8]
 37e035c: f9076e7f     	str	xzr, [x19, #0xed8]
 37e0360: f9076a7f     	str	xzr, [x19, #0xed0]
 37e0364: 529a9808     	mov	w8, #0xd4c0             ; =54464
 37e0368: 72a00028     	movk	w8, #0x1, lsl #16
 37e036c: f9077268     	str	x8, [x19, #0xee0]
 37e0370: f907767a     	str	x26, [x19, #0xee8]
 37e0374: 913bc260     	add	x0, x19, #0xef0
 37e0378: 9115e261     	add	x1, x19, #0x578
 37e037c: 52800782     	mov	w2, #0x3c               ; =60
 37e0380: 976e3a20     	bl	0x136ec00 <_ChromeMain+0x1369964>
 37e0384: b0055808     	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 37e0388: 91240108     	add	x8, x8, #0x900
 37e038c: f9077a68     	str	x8, [x19, #0xef0]
 37e0390: f9404788     	ldr	x8, [x28, #0x88]
 37e0394: eb08031f     	cmp	x24, x8
 37e0398: 54000061     	b.ne	0x37e03a4 <_ChromeMain+0x37db108>
 37e039c: 9115e260     	add	x0, x19, #0x578
 37e03a0: 9720cfd7     	bl	0x142fc <_ChromeMain+0xf060>
 37e03a4: f9079e75     	str	x21, [x19, #0xf38]
 37e03a8: 52800028     	mov	w8, #0x1                ; =1
 37e03ac: b90f4268     	str	w8, [x19, #0xf40]
 37e03b0: 393d127f     	strb	wzr, [x19, #0xf44]
 37e03b4: 393d227f     	strb	wzr, [x19, #0xf48]
 37e03b8: 913d4268     	add	x8, x19, #0xf50
 37e03bc: f907aa7f     	str	xzr, [x19, #0xf50]
 37e03c0: 6f00e400     	movi.2d	v0, #0000000000000000
 37e03c4: 3c808100     	stur	q0, [x8, #0x8]
 37e03c8: 529a9808     	mov	w8, #0xd4c0             ; =54464
 37e03cc: 72a00028     	movk	w8, #0x1, lsl #16
 37e03d0: f907b668     	str	x8, [x19, #0xf68]
 37e03d4: d2e7fe08     	mov	x8, #0x3ff0000000000000 ; =4607182418800017408
 37e03d8: f907ba68     	str	x8, [x19, #0xf70]
