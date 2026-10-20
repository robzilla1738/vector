
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4277730: 54ffe0e3     	b.lo	0x427734c <_ChromeMain+0x42720b0>
 4277734: 17fffef6     	b	0x427730c <_ChromeMain+0x4272070>
 4277738: 3dc01360     	ldr	q0, [x27, #0x40]
 427773c: 3d803f60     	str	q0, [x27, #0xf0]
 4277740: f9402b68     	ldr	x8, [x27, #0x50]
 4277744: f9008368     	str	x8, [x27, #0x100]
 4277748: 17fffe60     	b	0x42770c8 <_ChromeMain+0x4271e2c>
 427774c: b7f816d6     	tbnz	x22, #0x3f, 0x4277a24 <_ChromeMain+0x4272788>
 4277750: f9400015     	ldr	x21, [x0]
 4277754: aa1603e0     	mov	x0, x22
 4277758: 96f65f04     	bl	0xf368 <_ChromeMain+0xa0cc>
 427775c: aa0003f7     	mov	x23, x0
 4277760: aa1503e1     	mov	x1, x21
 4277764: aa1603e2     	mov	x2, x22
 4277768: 94f64964     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 427776c: f940ea98     	ldr	x24, [x20, #0x1d0]
 4277770: b5000058     	cbnz	x24, 0x4277778 <_ChromeMain+0x42724dc>
 4277774: f940e698     	ldr	x24, [x20, #0x1c8]
 4277778: f9400a88     	ldr	x8, [x20, #0x10]
 427777c: f9411519     	ldr	x25, [x8, #0x228]
 4277780: 52802600     	mov	w0, #0x130              ; =304
 4277784: 96f65ef9     	bl	0xf368 <_ChromeMain+0xa0cc>
 4277788: aa0003f5     	mov	x21, x0
 427778c: 39c2dfe8     	ldrsb	w8, [sp, #0xb7]
 4277790: 37f800c8     	tbnz	w8, #0x1f, 0x42777a8 <_ChromeMain+0x427250c>
 4277794: 3dc02be0     	ldr	q0, [sp, #0xa0]
 4277798: 3d800b40     	str	q0, [x26, #0x20]
 427779c: f9405be8     	ldr	x8, [sp, #0xb0]
 42777a0: f9001b48     	str	x8, [x26, #0x30]
 42777a4: 14000004     	b	0x42777b4 <_ChromeMain+0x4272518>
 42777a8: a94a0be1     	ldp	x1, x2, [sp, #0xa0]
 42777ac: d10203a0     	sub	x0, x29, #0x80
 42777b0: 96f6829a     	bl	0x18218 <_ChromeMain+0x12f7c>
 42777b4: 39c05f28     	ldrsb	w8, [x25, #0x17]
 42777b8: 37f800c8     	tbnz	w8, #0x1f, 0x42777d0 <_ChromeMain+0x4272534>
 42777bc: 3dc00320     	ldr	q0, [x25]
 42777c0: f9400b28     	ldr	x8, [x25, #0x10]
 42777c4: f9009368     	str	x8, [x27, #0x120]
 42777c8: 3d804760     	str	q0, [x27, #0x110]
 42777cc: 14000004     	b	0x42777dc <_ChromeMain+0x4272540>
 42777d0: a9400b21     	ldp	x1, x2, [x25]
 42777d4: d10283a0     	sub	x0, x29, #0xa0
 42777d8: 96f68290     	bl	0x18218 <_ChromeMain+0x12f7c>
 42777dc: f9401348     	ldr	x8, [x26, #0x20]
 42777e0: 3cc28340     	ldur	q0, [x26, #0x28]
 42777e4: a9027f5f     	stp	xzr, xzr, [x26, #0x20]
 42777e8: f9001b5f     	str	xzr, [x26, #0x30]
 42777ec: 528000c9     	mov	w9, #0x6                ; =6
 42777f0: 381573a9     	sturb	w9, [x29, #-0xa9]
 42777f4: d10303a9     	sub	x9, x29, #0xc0
 42777f8: b27f052a     	orr	x10, x9, #0x6
 42777fc: f004648b     	adrp	x11, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4277800: 910e116b     	add	x11, x11, #0x384
 4277804: eb0b015f     	cmp	x10, x11
 4277808: fa4b8122     	ccmp	x9, x11, #0x2, hi
 427780c: 54ffe4c9     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4277810: 528d2e49     	mov	w9, #0x6972             ; =26994
 4277814: 7901eb69     	strh	w9, [x27, #0xf4]
 4277818: 528c2e69     	mov	w9, #0x6173             ; =24947
 427781c: 72ac2cc9     	movk	w9, #0x6166, lsl #16
 4277820: b900f369     	str	w9, [x27, #0xf0]
 4277824: 381463bf     	sturb	wzr, [x29, #-0xba]
 4277828: f9408b79     	ldr	x25, [x27, #0x110]
 427782c: 3cc08342     	ldur	q2, [x26, #0x8]
 4277830: a9007f5f     	stp	xzr, xzr, [x26]
 4277834: f9000b5f     	str	xzr, [x26, #0x10]
 4277838: f90006a8     	str	x8, [x21, #0x8]
 427783c: f9408368     	ldr	x8, [x27, #0x100]
 4277840: f9001aa8     	str	x8, [x21, #0x30]
 4277844: 3dc03f61     	ldr	q1, [x27, #0xf0]
 4277848: ad0086a0     	stp	q0, q1, [x21, #0x10]
 427784c: 925e7708     	and	x8, x24, #0xfffffffc00000000
 4277850: f00549c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4277854: f9404529     	ldr	x9, [x9, #0x88]
 4277858: eb09011f     	cmp	x8, x9
 427785c: 540000a1     	b.ne	0x4277870 <_ChromeMain+0x42725d4>
 4277860: aa1803e0     	mov	x0, x24
 4277864: 3d800be2     	str	q2, [sp, #0x20]
 4277868: 96f672a5     	bl	0x142fc <_ChromeMain+0xf060>
 427786c: 3dc00be2     	ldr	q2, [sp, #0x20]
 4277870: a903e6b8     	stp	x24, x25, [x21, #0x38]
 4277874: 3c8482a2     	stur	q2, [x21, #0x48]
 4277878: 910162a8     	add	x8, x21, #0x58
 427787c: 528000c9     	mov	w9, #0x6                ; =6
 4277880: 3901bea9     	strb	w9, [x21, #0x6f]
 4277884: 91017aa9     	add	x9, x21, #0x5e
 4277888: eb08013f     	cmp	x9, x8
 427788c: 54ffe0c3     	b.lo	0x42774a4 <_ChromeMain+0x4272208>
 4277890: f004648a     	adrp	x10, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4277894: 9110254a     	add	x10, x10, #0x409
 4277898: eb0a013f     	cmp	x9, x10
 427789c: fa4a8102     	ccmp	x8, x10, #0x2, hi
 42778a0: 54ffe029     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 42778a4: 528c8ca9     	mov	w9, #0x6465             ; =25701
 42778a8: 79000909     	strh	w9, [x8, #0x4]
 42778ac: 528eae29     	mov	w9, #0x7571             ; =30065
 42778b0: 72aeaca9     	movk	w9, #0x7565, lsl #16
 42778b4: b9000109     	str	w9, [x8]
 42778b8: 39017abf     	strb	wzr, [x21, #0x5e]
 42778bc: 6f00e400     	movi.2d	v0, #0000000000000000
 42778c0: ad0382a0     	stp	q0, q0, [x21, #0x70]
 42778c4: 3d8026a0     	str	q0, [x21, #0x90]
 42778c8: f004ffa8     	adrp	x8, 0xe26e000 <dyld_stub_binder+0xe26e000>
 42778cc: 9136a108     	add	x8, x8, #0xda8
 42778d0: f90002a8     	str	x8, [x21]
 42778d4: 91020108     	add	x8, x8, #0x80
 42778d8: a90a22bf     	stp	xzr, x8, [x21, #0xa0]
 42778dc: a90b5ab7     	stp	x23, x22, [x21, #0xb0]
 42778e0: f90062b6     	str	x22, [x21, #0xc0]
 42778e4: b94033e8     	ldr	w8, [sp, #0x30]
 42778e8: 390322a8     	strb	w8, [x21, #0xc8]
 42778ec: ad0702a0     	stp	q0, q0, [x21, #0xe0]
 42778f0: 3d8042a0     	str	q0, [x21, #0x100]
 42778f4: aa1503e8     	mov	x8, x21
 42778f8: 3c8d0d00     	str	q0, [x8, #0xd0]!
 42778fc: 3c839100     	stur	q0, [x8, #0x39]
 4277900: 52800100     	mov	w0, #0x8                ; =8
 4277904: 96f65e99     	bl	0xf368 <_ChromeMain+0xa0cc>
 4277908: b900001f     	str	wzr, [x0]
 427790c: 3900101f     	strb	wzr, [x0, #0x4]
 4277910: b40000c0     	cbz	x0, 0x4277928 <_ChromeMain+0x427268c>
 4277914: 52800028     	mov	w8, #0x1                ; =1
 4277918: b8280008     	ldadd	w8, w8, [x0]
 427791c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4277920: 6b09011f     	cmp	w8, w9
 4277924: 54000880     	b.eq	0x4277a34 <_ChromeMain+0x4272798>
 4277928: a91256a0     	stp	x0, x21, [x21, #0x120]
 427792c: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4277930: 36f800a8     	tbz	w8, #0x1f, 0x4277944 <_ChromeMain+0x42726a8>
 4277934: f9400340     	ldr	x0, [x26]
 4277938: f9400b48     	ldr	x8, [x26, #0x10]
 427793c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4277940: 96f6455e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4277944: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4277948: 36ffcbe8     	tbz	w8, #0x1f, 0x42772c4 <_ChromeMain+0x4272028>
 427794c: f9401340     	ldr	x0, [x26, #0x20]
 4277950: f9401b48     	ldr	x8, [x26, #0x30]
 4277954: 17fffe5a     	b	0x42772bc <_ChromeMain+0x4272020>
 4277958: 91002319     	add	x25, x24, #0x8
 427795c: 17fffe85     	b	0x4277370 <_ChromeMain+0x42720d4>
 4277960: d0055676     	adrp	x22, 0xed45000 <dyld_stub_binder+0xed45000>
 4277964: 910c22d6     	add	x22, x22, #0x308
 4277968: aa1603e0     	mov	x0, x22
 427796c: 94f633d5     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 4277970: 34ffcb20     	cbz	w0, 0x42772d4 <_ChromeMain+0x4272038>
 4277974: d0055668     	adrp	x8, 0xed45000 <dyld_stub_binder+0xed45000>
 4277978: 910bc108     	add	x8, x8, #0x2f0
 427797c: f900091f     	str	xzr, [x8, #0x10]
 4277980: aa0803e9     	mov	x9, x8
 4277984: f8008d3f     	str	xzr, [x9, #0x8]!
 4277988: f9000109     	str	x9, [x8]
 427798c: 52800037     	mov	w23, #0x1               ; =1
 4277990: 089ffed7     	stlrb	w23, [x22]
 4277994: 900553a0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 4277998: 9127c000     	add	x0, x0, #0x9f0
 427799c: 94f633cc     	bl	0x80048cc <_ChromeMain+0x7fff630>
 42779a0: 35000600     	cbnz	w0, 0x4277a60 <_ChromeMain+0x42727c4>
 42779a4: d0055668     	adrp	x8, 0xed45000 <dyld_stub_binder+0xed45000>
 42779a8: 394c2516     	ldrb	w22, [x8, #0x309]
 42779ac: 390c2517     	strb	w23, [x8, #0x309]
 42779b0: 900553a0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 42779b4: 9127c000     	add	x0, x0, #0x9f0
 42779b8: 94f633d3     	bl	0x8004904 <_ChromeMain+0x7fff668>
 42779bc: 35000420     	cbnz	w0, 0x4277a40 <_ChromeMain+0x42727a4>
 42779c0: 3617c8b6     	tbz	w22, #0x2, 0x42772d4 <_ChromeMain+0x4272038>
 42779c4: 900553a0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 42779c8: 9128c000     	add	x0, x0, #0xa30
 42779cc: 94f633d1     	bl	0x8004910 <_ChromeMain+0x7fff674>
 42779d0: 34ffc820     	cbz	w0, 0x42772d4 <_ChromeMain+0x4272038>
 42779d4: b004e3e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42779d8: 911c4d08     	add	x8, x8, #0x713
 42779dc: f90003e8     	str	x8, [sp]
 42779e0: b004e3e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42779e4: 911c9c00     	add	x0, x0, #0x727
 42779e8: 94f633cd     	bl	0x800491c <_ChromeMain+0x7fff680>
 42779ec: d4200000     	brk	#0
 42779f0: d4400000     	hlt	#0
 42779f4: d4200020     	brk	#0x1
 42779f8: 7103fd1f     	cmp	w8, #0xff
 42779fc: 54000081     	b.ne	0x4277a0c <_ChromeMain+0x4272770>
 4277a00: b004ab60     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4277a04: 913be000     	add	x0, x0, #0xef8
 4277a08: 9426be22     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 4277a0c: b004ab60     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4277a10: 913c6000     	add	x0, x0, #0xf18
 4277a14: 9426be1f     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 4277a18: d4200000     	brk	#0
 4277a1c: d4400000     	hlt	#0
 4277a20: d4200020     	brk	#0x1
 4277a24: 977270d7     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 4277a28: d4200000     	brk	#0
 4277a2c: d4400000     	hlt	#0
 4277a30: d4200020     	brk	#0x1
 4277a34: d4200000     	brk	#0
 4277a38: d4400000     	hlt	#0
 4277a3c: d4200020     	brk	#0x1
 4277a40: b004e3e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4277a44: 911c4d08     	add	x8, x8, #0x713
 4277a48: f90003e8     	str	x8, [sp]
 4277a4c: b004e3e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4277a50: 911be000     	add	x0, x0, #0x6f8
