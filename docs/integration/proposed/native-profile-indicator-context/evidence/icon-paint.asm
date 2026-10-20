
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 456c738: d10243ff     	sub	sp, sp, #0x90
 456c73c: a90657f6     	stp	x22, x21, [sp, #0x60]
 456c740: a9074ff4     	stp	x20, x19, [sp, #0x70]
 456c744: a9087bfd     	stp	x29, x30, [sp, #0x80]
 456c748: 910203fd     	add	x29, sp, #0x80
 456c74c: aa0103f3     	mov	x19, x1
 456c750: aa0003f4     	mov	x20, x0
 456c754: 3952e008     	ldrb	w8, [x0, #0x4b8]
 456c758: 37000ce8     	tbnz	w8, #0x0, 0x456c8f4 <_ChromeMain+0x4567658>
 456c75c: b943be88     	ldr	w8, [x20, #0x3bc]
 456c760: 51000508     	sub	w8, w8, #0x1
 456c764: 7100051f     	cmp	w8, #0x1
 456c768: 54000c69     	b.ls	0x456c8f4 <_ChromeMain+0x4567658>
 456c76c: aa1403e0     	mov	x0, x20
 456c770: 9700d220     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 456c774: 3952e288     	ldrb	w8, [x20, #0x4b8]
 456c778: 7100011f     	cmp	w8, #0x0
 456c77c: 52801ba8     	mov	w8, #0xdd               ; =221
 456c780: 1a881501     	cinc	w1, w8, eq
 456c784: 9726ee91     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 456c788: aa0003f5     	mov	x21, x0
 456c78c: f9406276     	ldr	x22, [x19, #0xc0]
 456c790: f94002c8     	ldr	x8, [x22]
 456c794: f9401508     	ldr	x8, [x8, #0x28]
 456c798: b0fe39a9     	adrp	x9, 0xca1000 <_ChromeMain+0xc9bd64>
 456c79c: 911a2129     	add	x9, x9, #0x688
 456c7a0: eb09011f     	cmp	x8, x9
 456c7a4: 54000981     	b.ne	0x456c8d4 <_ChromeMain+0x4567638>
 456c7a8: 395d02c8     	ldrb	w8, [x22, #0x740]
 456c7ac: 35000a08     	cbnz	w8, 0x456c8ec <_ChromeMain+0x4567650>
 456c7b0: a94326ca     	ldp	x10, x9, [x22, #0x30]
 456c7b4: 91002128     	add	x8, x9, #0x8
 456c7b8: eb0a011f     	cmp	x8, x10
 456c7bc: 54001188     	b.hi	0x456c9ec <_ChromeMain+0x4567750>
 456c7c0: eb09014a     	subs	x10, x10, x9
 456c7c4: fa472940     	ccmp	x10, #0x7, #0x0, hs
 456c7c8: 54001789     	b.ls	0x456cab8 <_ChromeMain+0x456781c>
 456c7cc: f94016ca     	ldr	x10, [x22, #0x28]
 456c7d0: 8b090140     	add	x0, x10, x9
 456c7d4: f94022c9     	ldr	x9, [x22, #0x40]
 456c7d8: 91000529     	add	x9, x9, #0x1
 456c7dc: a903a6c8     	stp	x8, x9, [x22, #0x38]
 456c7e0: 52800388     	mov	w8, #0x1c               ; =28
 456c7e4: 39000008     	strb	w8, [x0]
 456c7e8: b94062c8     	ldr	w8, [x22, #0x60]
 456c7ec: 11000508     	add	w8, w8, #0x1
 456c7f0: b90062c8     	str	w8, [x22, #0x60]
 456c7f4: b946d2c8     	ldr	w8, [x22, #0x6d0]
 456c7f8: 11000508     	add	w8, w8, #0x1
 456c7fc: b906d2c8     	str	w8, [x22, #0x6d0]
 456c800: f9435ac8     	ldr	x8, [x22, #0x6b0]
 456c804: b9405909     	ldr	w9, [x8, #0x58]
 456c808: 11000529     	add	w9, w9, #0x1
 456c80c: b9005909     	str	w9, [x8, #0x58]
 456c810: f9406260     	ldr	x0, [x19, #0xc0]
 456c814: f9400008     	ldr	x8, [x0]
 456c818: f9403908     	ldr	x8, [x8, #0x70]
 456c81c: 1e229000     	fmov	s0, #5.00000000
 456c820: 1e229001     	fmov	s1, #5.00000000
 456c824: d63f0100     	blr	x8
 456c828: f9425a88     	ldr	x8, [x20, #0x4b0]
 456c82c: b4001408     	cbz	x8, 0x456caac <_ChromeMain+0x4567810>
 456c830: f9400901     	ldr	x1, [x8, #0x10]
 456c834: aa1303e0     	mov	x0, x19
 456c838: 52800242     	mov	w2, #0x12               ; =18
 456c83c: aa1503e3     	mov	x3, x21
 456c840: 9779a9ae     	bl	0x23d6ef8 <_ChromeMain+0x23d1c5c>
 456c844: f9406273     	ldr	x19, [x19, #0xc0]
 456c848: f9400268     	ldr	x8, [x19]
 456c84c: f9402d08     	ldr	x8, [x8, #0x58]
 456c850: d0fe5909     	adrp	x9, 0x108e000 <_ChromeMain+0x1088d64>
 456c854: 91258129     	add	x9, x9, #0x960
 456c858: eb09011f     	cmp	x8, x9
 456c85c: 54000421     	b.ne	0x456c8e0 <_ChromeMain+0x4567644>
 456c860: a943266a     	ldp	x10, x9, [x19, #0x30]
 456c864: 91002128     	add	x8, x9, #0x8
 456c868: eb0a011f     	cmp	x8, x10
 456c86c: 54000b88     	b.hi	0x456c9dc <_ChromeMain+0x4567740>
 456c870: eb09014a     	subs	x10, x10, x9
 456c874: 54001163     	b.lo	0x456caa0 <_ChromeMain+0x4567804>
 456c878: f1001d5f     	cmp	x10, #0x7
 456c87c: 54001129     	b.ls	0x456caa0 <_ChromeMain+0x4567804>
 456c880: f940166a     	ldr	x10, [x19, #0x28]
 456c884: 8b090140     	add	x0, x10, x9
 456c888: f9402269     	ldr	x9, [x19, #0x40]
 456c88c: 91000529     	add	x9, x9, #0x1
 456c890: a903a668     	stp	x8, x9, [x19, #0x38]
 456c894: 52800348     	mov	w8, #0x1a               ; =26
 456c898: 39000008     	strb	w8, [x0]
 456c89c: b9406268     	ldr	w8, [x19, #0x60]
 456c8a0: 51000508     	sub	w8, w8, #0x1
 456c8a4: b9006268     	str	w8, [x19, #0x60]
 456c8a8: 9101c260     	add	x0, x19, #0x70
 456c8ac: 96eaf29a     	bl	0x29314 <_ChromeMain+0x24078>
 456c8b0: 395d0268     	ldrb	w8, [x19, #0x740]
 456c8b4: 350000c8     	cbnz	w8, 0x456c8cc <_ChromeMain+0x4567630>
 456c8b8: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 456c8bc: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 456c8c0: a94657f6     	ldp	x22, x21, [sp, #0x60]
 456c8c4: 910243ff     	add	sp, sp, #0x90
 456c8c8: d65f03c0     	ret
 456c8cc: 391d027f     	strb	wzr, [x19, #0x740]
 456c8d0: 17fffffa     	b	0x456c8b8 <_ChromeMain+0x456761c>
 456c8d4: aa1603e0     	mov	x0, x22
 456c8d8: d63f0100     	blr	x8
 456c8dc: 17ffffcd     	b	0x456c810 <_ChromeMain+0x4567574>
 456c8e0: aa1303e0     	mov	x0, x19
 456c8e4: d63f0100     	blr	x8
 456c8e8: 17fffff4     	b	0x456c8b8 <_ChromeMain+0x456761c>
 456c8ec: 391d02df     	strb	wzr, [x22, #0x740]
 456c8f0: 17ffffb0     	b	0x456c7b0 <_ChromeMain+0x4567514>
 456c8f4: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 456c8f8: 6f00e400     	movi.2d	v0, #0000000000000000
 456c8fc: ad0183e0     	stp	q0, q0, [sp, #0x30]
 456c900: f9002bff     	str	xzr, [sp, #0x50]
 456c904: d2806029     	mov	x9, #0x301              ; =769
 456c908: f2f7f009     	movk	x9, #0xbf80, lsl #48
 456c90c: a90227e8     	stp	x8, x9, [sp, #0x20]
 456c910: aa1403e0     	mov	x0, x20
 456c914: 9700d1b7     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 456c918: 52801f01     	mov	w1, #0xf8               ; =248
 456c91c: 9726ee2b     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 456c920: 1e270000     	fmov	s0, w0
 456c924: 0e003800     	zip1.8b	v0, v0, v0
 456c928: 2f07b7e0     	bic.4h	v0, #0xff, lsl #8
 456c92c: 2f10a400     	ushll.4s	v0, v0, #0x0
 456c930: 52901028     	mov	w8, #0x8081             ; =32897
 456c934: 72a77008     	movk	w8, #0x3b80, lsl #16
 456c938: 4e040d01     	dup.4s	v1, w8
 456c93c: 6e21d800     	ucvtf.4s	v0, v0
 456c940: 6e21dc00     	fmul.4s	v0, v0, v1
 456c944: 4ea00800     	rev64.4s	v0, v0
 456c948: 6e006000     	ext.16b	v0, v0, v0, #0xc
 456c94c: 3d8007e0     	str	q0, [sp, #0x10]
 456c950: 91070288     	add	x8, x20, #0x1c0
 456c954: f90003ff     	str	xzr, [sp]
 456c958: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 456c95c: d004ce68     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 456c960: 3dc01101     	ldr	q1, [x8, #0x40]
 456c964: 6ee14400     	ushl.2d	v0, v0, v1
 456c968: 0ea12800     	xtn.2s	v0, v0
 456c96c: 6f00e401     	movi.2d	v1, #0000000000000000
 456c970: 0ea16400     	smax.2s	v0, v0, v1
 456c974: 2e21d800     	ucvtf.2s	v0, v0
 456c978: fd0007e0     	str	d0, [sp, #0x8]
 456c97c: 910003e1     	mov	x1, sp
 456c980: 1e231000     	fmov	s0, #6.00000000
 456c984: 910043e2     	add	x2, sp, #0x10
 456c988: aa1303e0     	mov	x0, x19
 456c98c: 95297a35     	bl	0x8fcb260 <_ChromeMain+0x8fc5fc4>
 456c990: f9402be0     	ldr	x0, [sp, #0x50]
 456c994: b5000620     	cbnz	x0, 0x456ca58 <_ChromeMain+0x45677bc>
 456c998: f94027e0     	ldr	x0, [sp, #0x48]
 456c99c: b50004c0     	cbnz	x0, 0x456ca34 <_ChromeMain+0x4567798>
 456c9a0: f94023e0     	ldr	x0, [sp, #0x40]
 456c9a4: b50006c0     	cbnz	x0, 0x456ca7c <_ChromeMain+0x45677e0>
 456c9a8: f9401fe0     	ldr	x0, [sp, #0x38]
 456c9ac: b5000280     	cbnz	x0, 0x456c9fc <_ChromeMain+0x4567760>
 456c9b0: f9401be0     	ldr	x0, [sp, #0x30]
 456c9b4: b4ffedc0     	cbz	x0, 0x456c76c <_ChromeMain+0x45674d0>
 456c9b8: 91002008     	add	x8, x0, #0x8
 456c9bc: 12800009     	mov	w9, #-0x1               ; =-1
 456c9c0: b8e90108     	ldaddal	w9, w8, [x8]
 456c9c4: 7100051f     	cmp	w8, #0x1
 456c9c8: 54ffed21     	b.ne	0x456c76c <_ChromeMain+0x45674d0>
 456c9cc: f9400008     	ldr	x8, [x0]
 456c9d0: f9400908     	ldr	x8, [x8, #0x10]
 456c9d4: d63f0100     	blr	x8
 456c9d8: 17ffff65     	b	0x456c76c <_ChromeMain+0x45674d0>
 456c9dc: 91006260     	add	x0, x19, #0x18
 456c9e0: 52800101     	mov	w1, #0x8                ; =8
 456c9e4: 96edfbd7     	bl	0xeb940 <_ChromeMain+0xe66a4>
 456c9e8: 17ffffab     	b	0x456c894 <_ChromeMain+0x45675f8>
 456c9ec: 910062c0     	add	x0, x22, #0x18
 456c9f0: 52800101     	mov	w1, #0x8                ; =8
 456c9f4: 96edfbd3     	bl	0xeb940 <_ChromeMain+0xe66a4>
 456c9f8: 17ffff7a     	b	0x456c7e0 <_ChromeMain+0x4567544>
 456c9fc: 91002008     	add	x8, x0, #0x8
 456ca00: 12800009     	mov	w9, #-0x1               ; =-1
 456ca04: b8e90108     	ldaddal	w9, w8, [x8]
 456ca08: 7100051f     	cmp	w8, #0x1
 456ca0c: 54fffd21     	b.ne	0x456c9b0 <_ChromeMain+0x4567714>
 456ca10: f9400009     	ldr	x9, [x0]
 456ca14: f9400928     	ldr	x8, [x9, #0x10]
 456ca18: b0fdd5ca     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 456ca1c: 9106014a     	add	x10, x10, #0x180
 456ca20: eb0a011f     	cmp	x8, x10
 456ca24: 54000041     	b.ne	0x456ca2c <_ChromeMain+0x4567790>
 456ca28: f9400528     	ldr	x8, [x9, #0x8]
 456ca2c: d63f0100     	blr	x8
 456ca30: 17ffffe0     	b	0x456c9b0 <_ChromeMain+0x4567714>
 456ca34: 91002008     	add	x8, x0, #0x8
 456ca38: 12800009     	mov	w9, #-0x1               ; =-1
 456ca3c: b8e90108     	ldaddal	w9, w8, [x8]
 456ca40: 7100051f     	cmp	w8, #0x1
 456ca44: 54fffae1     	b.ne	0x456c9a0 <_ChromeMain+0x4567704>
 456ca48: f9400008     	ldr	x8, [x0]
 456ca4c: f9400908     	ldr	x8, [x8, #0x10]
 456ca50: d63f0100     	blr	x8
 456ca54: 17ffffd3     	b	0x456c9a0 <_ChromeMain+0x4567704>
 456ca58: 91002008     	add	x8, x0, #0x8
 456ca5c: 12800009     	mov	w9, #-0x1               ; =-1
 456ca60: b8e90108     	ldaddal	w9, w8, [x8]
 456ca64: 7100051f     	cmp	w8, #0x1
 456ca68: 54fff981     	b.ne	0x456c998 <_ChromeMain+0x45676fc>
 456ca6c: f9400008     	ldr	x8, [x0]
 456ca70: f9400908     	ldr	x8, [x8, #0x10]
 456ca74: d63f0100     	blr	x8
 456ca78: 17ffffc8     	b	0x456c998 <_ChromeMain+0x45676fc>
 456ca7c: 91002008     	add	x8, x0, #0x8
 456ca80: 12800009     	mov	w9, #-0x1               ; =-1
 456ca84: b8e90108     	ldaddal	w9, w8, [x8]
 456ca88: 7100051f     	cmp	w8, #0x1
 456ca8c: 54fff8e1     	b.ne	0x456c9a8 <_ChromeMain+0x456770c>
 456ca90: f9400008     	ldr	x8, [x0]
 456ca94: f9400908     	ldr	x8, [x8, #0x10]
 456ca98: d63f0100     	blr	x8
 456ca9c: 17ffffc3     	b	0x456c9a8 <_ChromeMain+0x456770c>
 456caa0: d4200000     	brk	#0
 456caa4: d4400000     	hlt	#0
 456caa8: d4200020     	brk	#0x1
 456caac: d4200000     	brk	#0
 456cab0: d4400000     	hlt	#0
 456cab4: d4200020     	brk	#0x1
