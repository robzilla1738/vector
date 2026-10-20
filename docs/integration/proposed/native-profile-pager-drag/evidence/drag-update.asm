Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4652600: d10303ff     	sub	sp, sp, #0xc0
 4652604: a90957f6     	stp	x22, x21, [sp, #0x90]
 4652608: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 465260c: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 4652610: 9102c3fd     	add	x29, sp, #0xb0
 4652614: b4000081     	cbz	x1, 0x4652624 <_ChromeMain+0x464d388>
 4652618: aa0003f4     	mov	x20, x0
 465261c: 395f0009     	ldrb	w9, [x0, #0x7c0]
 4652620: 350000c9     	cbnz	w9, 0x4652638 <_ChromeMain+0x464d39c>
 4652624: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 4652628: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 465262c: a94957f6     	ldp	x22, x21, [sp, #0x90]
 4652630: 910303ff     	add	sp, sp, #0xc0
 4652634: d65f03c0     	ret
 4652638: f9438e8a     	ldr	x10, [x20, #0x718]
 465263c: b4ffff4a     	cbz	x10, 0x4652624 <_ChromeMain+0x464d388>
 4652640: aa0103f3     	mov	x19, x1
 4652644: f942f289     	ldr	x9, [x20, #0x5e0]
 4652648: f940cd2b     	ldr	x11, [x9, #0x198]
 465264c: d37df16b     	lsl	x11, x11, #3
 4652650: b40001cb     	cbz	x11, 0x4652688 <_ChromeMain+0x464d3ec>
 4652654: aa0203e8     	mov	x8, x2
 4652658: d280000c     	mov	x12, #0x0               ; =0
 465265c: f940c92d     	ldr	x13, [x9, #0x190]
 4652660: f86c69ae     	ldr	x14, [x13, x12]
 4652664: eb1301df     	cmp	x14, x19
 4652668: 540000a0     	b.eq	0x465267c <_ChromeMain+0x464d3e0>
 465266c: 9100218c     	add	x12, x12, #0x8
 4652670: eb0c017f     	cmp	x11, x12
 4652674: 54ffff61     	b.ne	0x4652660 <_ChromeMain+0x464d3c4>
 4652678: 14000004     	b	0x4652688 <_ChromeMain+0x464d3ec>
 465267c: 9343fd81     	asr	x1, x12, #3
 4652680: eb0a003f     	cmp	x1, x10
 4652684: 54000123     	b.lo	0x46526a8 <_ChromeMain+0x464d40c>
 4652688: aa1403e0     	mov	x0, x20
 465268c: aa1303e1     	mov	x1, x19
 4652690: 52800022     	mov	w2, #0x1                ; =1
 4652694: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 4652698: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 465269c: a94957f6     	ldp	x22, x21, [sp, #0x90]
 46526a0: 910303ff     	add	sp, sp, #0xc0
 46526a4: 1400009d     	b	0x4652918 <_ChromeMain+0x464d67c>
 46526a8: 5280000b     	mov	w11, #0x0               ; =0
 46526ac: d2800002     	mov	x2, #0x0                ; =0
 46526b0: d280000c     	mov	x12, #0x0               ; =0
 46526b4: f903de81     	str	x1, [x20, #0x7b8]
 46526b8: 5280002d     	mov	w13, #0x1               ; =1
 46526bc: 391f028d     	strb	w13, [x20, #0x7c0]
 46526c0: f9400108     	ldr	x8, [x8]
 46526c4: 2940346e     	ldp	w14, w13, [x3]
 46526c8: 6b0e010e     	subs	w14, w8, w14
 46526cc: 131f7dcf     	asr	w15, w14, #31
 46526d0: 520101ef     	eor	w15, w15, #0x80000000
 46526d4: 1a8e61f5     	csel	w21, w15, w14, vs
 46526d8: 110032ae     	add	w14, w21, #0xc
 46526dc: 531d714f     	lsl	w15, w10, #3
 46526e0: 4b0a15ef     	sub	w15, w15, w10, lsl #5
 46526e4: 12b00010     	mov	w16, #0x7fffffff        ; =2147483647
 46526e8: 12b00011     	mov	w17, #0x7fffffff        ; =2147483647
 46526ec: 14000018     	b	0x465274c <_ChromeMain+0x464d4b0>
 46526f0: b941c120     	ldr	w0, [x9, #0x1c0]
 46526f4: 0b0f0000     	add	w0, w0, w15
 46526f8: 0b407c00     	add	w0, w0, w0, lsr #31
 46526fc: 13017c03     	asr	w3, w0, #1
 4652700: 0b800560     	add	w0, w11, w0, asr #1
 4652704: 31006004     	adds	w4, w0, #0x18
 4652708: 1a846204     	csel	w4, w16, w4, vs
 465270c: 6b000080     	subs	w0, w4, w0
 4652710: 131f7c04     	asr	w4, w0, #31
 4652714: 52010084     	eor	w4, w4, #0x80000000
 4652718: 1a806080     	csel	w0, w4, w0, vs
 465271c: 0aa07c00     	bic	w0, w0, w0, asr #31
 4652720: 0b400460     	add	w0, w3, w0, lsr #1
 4652724: 0b000160     	add	w0, w11, w0
 4652728: 6b0001c0     	subs	w0, w14, w0
 465272c: 5a805400     	cneg	w0, w0, mi
 4652730: 6b11001f     	cmp	w0, w17
 4652734: 1a91b011     	csel	w17, w0, w17, lt
 4652738: 9a82b182     	csel	x2, x12, x2, lt
 465273c: 9100058c     	add	x12, x12, #0x1
 4652740: 1100616b     	add	w11, w11, #0x18
 4652744: eb0c015f     	cmp	x10, x12
 4652748: 54000080     	b.eq	0x4652758 <_ChromeMain+0x464d4bc>
 465274c: b5fffd29     	cbnz	x9, 0x46526f0 <_ChromeMain+0x464d454>
 4652750: 52800000     	mov	w0, #0x0                ; =0
 4652754: 17fffff5     	b	0x4652728 <_ChromeMain+0x464d48c>
 4652758: d360fd08     	lsr	x8, x8, #32
 465275c: 6b0d0108     	subs	w8, w8, w13
 4652760: 131f7d0a     	asr	w10, w8, #31
 4652764: 5201014a     	eor	w10, w10, #0x80000000
 4652768: 1a886148     	csel	w8, w10, w8, vs
 465276c: 3100191f     	cmn	w8, #0x6
 4652770: 128000aa     	mov	w10, #-0x6              ; =-6
 4652774: 1a8ac108     	csel	w8, w8, w10, gt
 4652778: 528000ca     	mov	w10, #0x6               ; =6
 465277c: d503201f     	nop
 4652780: 7100191f     	cmp	w8, #0x6
 4652784: 1a8ab116     	csel	w22, w8, w10, lt
 4652788: eb01005f     	cmp	x2, x1
 465278c: 54000080     	b.eq	0x465279c <_ChromeMain+0x464d500>
 4652790: aa1403e0     	mov	x0, x20
 4652794: 94000fc2     	bl	0x465669c <_ChromeMain+0x4651400>
 4652798: f942f289     	ldr	x9, [x20, #0x5e0]
 465279c: f940cd28     	ldr	x8, [x9, #0x198]
 46527a0: d37df10a     	lsl	x10, x8, #3
 46527a4: b4fff72a     	cbz	x10, 0x4652688 <_ChromeMain+0x464d3ec>
 46527a8: d2800008     	mov	x8, #0x0                ; =0
 46527ac: f940c92b     	ldr	x11, [x9, #0x190]
 46527b0: f868696c     	ldr	x12, [x11, x8]
 46527b4: eb13019f     	cmp	x12, x19
 46527b8: 540000a0     	b.eq	0x46527cc <_ChromeMain+0x464d530>
 46527bc: 91002108     	add	x8, x8, #0x8
 46527c0: eb08015f     	cmp	x10, x8
 46527c4: 54ffff61     	b.ne	0x46527b0 <_ChromeMain+0x464d514>
 46527c8: 17ffffb0     	b	0x4652688 <_ChromeMain+0x464d3ec>
 46527cc: b4000229     	cbz	x9, 0x4652810 <_ChromeMain+0x464d574>
 46527d0: 9343fd0b     	asr	x11, x8, #3
 46527d4: f9438e8a     	ldr	x10, [x20, #0x718]
 46527d8: eb0a017f     	cmp	x11, x10
 46527dc: 540001a2     	b.hs	0x4652810 <_ChromeMain+0x464d574>
 46527e0: 128002eb     	mov	w11, #-0x18             ; =-24
 46527e4: b941c129     	ldr	w9, [x9, #0x1c0]
 46527e8: 1b0b2549     	madd	w9, w10, w11, w9
 46527ec: 0b497d29     	add	w9, w9, w9, lsr #31
 46527f0: 53037d08     	lsr	w8, w8, #3
 46527f4: 5280030a     	mov	w10, #0x18              ; =24
 46527f8: 1b0a7d08     	mul	w8, w8, w10
 46527fc: 0b890508     	add	w8, w8, w9, asr #1
 4652800: 6b0802a8     	subs	w8, w21, w8
 4652804: 131f7d09     	asr	w9, w8, #31
 4652808: 52010129     	eor	w9, w9, #0x80000000
 465280c: 1a886135     	csel	w21, w9, w8, vs
 4652810: f9400268     	ldr	x8, [x19]
 4652814: f9402d08     	ldr	x8, [x8, #0x58]
 4652818: aa1303e0     	mov	x0, x19
 465281c: d63f0100     	blr	x8
 4652820: aa0003f4     	mov	x20, x0
 4652824: 9400a8e9     	bl	0x467cbc8 <_ChromeMain+0x467792c>
 4652828: f100029f     	cmp	x20, #0x0
 465282c: 1a9f07e8     	cset	w8, ne
 4652830: eb00029f     	cmp	x20, x0
 4652834: fa401a84     	ccmp	x20, #0x0, #0x4, ne
 4652838: 540000c0     	b.eq	0x4652850 <_ChromeMain+0x464d5b4>
 465283c: f9402694     	ldr	x20, [x20, #0x48]
 4652840: f100029f     	cmp	x20, #0x0
 4652844: 1a9f07e8     	cset	w8, ne
 4652848: fa401284     	ccmp	x20, x0, #0x4, ne
 465284c: 54ffff81     	b.ne	0x465283c <_ChromeMain+0x464d5a0>
 4652850: 34ffeea8     	cbz	w8, 0x4652624 <_ChromeMain+0x464d388>
 4652854: 52800028     	mov	w8, #0x1                ; =1
 4652858: 3913ca68     	strb	w8, [x19, #0x4f2]
 465285c: 6f00e400     	movi.2d	v0, #0000000000000000
 4652860: ad0003e0     	stp	q0, q0, [sp]
 4652864: f90043ff     	str	xzr, [sp, #0x80]
 4652868: ad0303e0     	stp	q0, q0, [sp, #0x60]
 465286c: ad0203e0     	stp	q0, q0, [sp, #0x40]
 4652870: ad0103e0     	stp	q0, q0, [sp, #0x20]
 4652874: 0f03f600     	fmov.2s	v0, #1.00000000
 4652878: fd0007e0     	str	d0, [sp, #0x8]
 465287c: 1e2202a0     	scvtf	s0, w21
 4652880: 1e2202c1     	scvtf	s1, w22
 4652884: 2d0207e0     	stp	s0, s1, [sp, #0x10]
 4652888: 910003e1     	mov	x1, sp
 465288c: aa1303e0     	mov	x0, x19
 4652890: 95821e1b     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
 4652894: f9401274     	ldr	x20, [x19, #0x20]
 4652898: b4000134     	cbz	x20, 0x46528bc <_ChromeMain+0x464d620>
 465289c: f940b280     	ldr	x0, [x20, #0x160]
 46528a0: b4000180     	cbz	x0, 0x46528d0 <_ChromeMain+0x464d634>
 46528a4: f004c7e8     	adrp	x8, 0xdf51000 <dyld_stub_binder+0xdf51000>
 46528a8: bd432500     	ldr	s0, [x8, #0x324]
 46528ac: 975288a3     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 46528b0: f9401261     	ldr	x1, [x19, #0x20]
 46528b4: f9400c20     	ldr	x0, [x1, #0x18]
 46528b8: b5000080     	cbnz	x0, 0x46528c8 <_ChromeMain+0x464d62c>
 46528bc: aa1303e0     	mov	x0, x19
 46528c0: 96fd3a2f     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46528c4: 17ffff58     	b	0x4652624 <_ChromeMain+0x464d388>
 46528c8: 956fc2d0     	bl	0xa243408 <_ChromeMain+0xa23e16c>
 46528cc: 17fffffc     	b	0x46528bc <_ChromeMain+0x464d620>
 46528d0: 52802400     	mov	w0, #0x120              ; =288
 46528d4: 96e6f2a5     	bl	0xf368 <_ChromeMain+0xa0cc>
 46528d8: aa0003f5     	mov	x21, x0
 46528dc: d2800001     	mov	x1, #0x0                ; =0
 46528e0: 97289e7e     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 46528e4: b40000a0     	cbz	x0, 0x46528f8 <_ChromeMain+0x464d65c>
 46528e8: b9400aa8     	ldr	w8, [x21, #0x8]
 46528ec: 31000508     	adds	w8, w8, #0x1
 46528f0: b9000aa8     	str	w8, [x21, #0x8]
 46528f4: 540000c2     	b.hs	0x465290c <_ChromeMain+0x464d670>
 46528f8: aa1403e0     	mov	x0, x20
 46528fc: aa1503e1     	mov	x1, x21
 4652900: 9730a63f     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 4652904: f940b280     	ldr	x0, [x20, #0x160]
 4652908: 17ffffe7     	b	0x46528a4 <_ChromeMain+0x464d608>
 465290c: d4200000     	brk	#0
 4652910: d4400000     	hlt	#0
 4652914: d4200020     	brk	#0x1
