
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462b5c0: d101c3ff     	sub	sp, sp, #0x70
 462b5c4: a90267fa     	stp	x26, x25, [sp, #0x20]
 462b5c8: a9035ff8     	stp	x24, x23, [sp, #0x30]
 462b5cc: a90457f6     	stp	x22, x21, [sp, #0x40]
 462b5d0: a9054ff4     	stp	x20, x19, [sp, #0x50]
 462b5d4: a9067bfd     	stp	x29, x30, [sp, #0x60]
 462b5d8: 910183fd     	add	x29, sp, #0x60
 462b5dc: aa0603f6     	mov	x22, x6
 462b5e0: aa0203f5     	mov	x21, x2
 462b5e4: aa0003f4     	mov	x20, x0
 462b5e8: aa0803f3     	mov	x19, x8
 462b5ec: f9433400     	ldr	x0, [x0, #0x668]
 462b5f0: b4000120     	cbz	x0, 0x462b614 <_ChromeMain+0x4626378>
 462b5f4: 394f0008     	ldrb	w8, [x0, #0x3c0]
 462b5f8: 340000e8     	cbz	w8, 0x462b614 <_ChromeMain+0x4626378>
 462b5fc: 39472008     	ldrb	w8, [x0, #0x1c8]
 462b600: 340000a8     	cbz	w8, 0x462b614 <_ChromeMain+0x4626378>
 462b604: f9435288     	ldr	x8, [x20, #0x6a0]
 462b608: b4000068     	cbz	x8, 0x462b614 <_ChromeMain+0x4626378>
 462b60c: 39472108     	ldrb	w8, [x8, #0x1c8]
 462b610: 35000e08     	cbnz	w8, 0x462b7d0 <_ChromeMain+0x4626534>
 462b614: f9435280     	ldr	x0, [x20, #0x6a0]
 462b618: b4000060     	cbz	x0, 0x462b624 <_ChromeMain+0x4626388>
 462b61c: 52800021     	mov	w1, #0x1                ; =1
 462b620: 97ff9ed0     	bl	0x4613160 <_ChromeMain+0x460dec4>
 462b624: f9435e97     	ldr	x23, [x20, #0x6b8]
 462b628: b4000117     	cbz	x23, 0x462b648 <_ChromeMain+0x46263ac>
 462b62c: 394ce2e8     	ldrb	w8, [x23, #0x338]
 462b630: 35001fc8     	cbnz	w8, 0x462ba28 <_ChromeMain+0x462678c>
 462b634: f94002e8     	ldr	x8, [x23]
 462b638: f9405108     	ldr	x8, [x8, #0xa0]
 462b63c: aa1703e0     	mov	x0, x23
 462b640: 52800001     	mov	w1, #0x0                ; =0
 462b644: d63f0100     	blr	x8
 462b648: f9465280     	ldr	x0, [x20, #0xca0]
 462b64c: f906529f     	str	xzr, [x20, #0xca0]
 462b650: b50005c0     	cbnz	x0, 0x462b708 <_ChromeMain+0x462646c>
 462b654: f9435680     	ldr	x0, [x20, #0x6a8]
 462b658: b4000100     	cbz	x0, 0x462b678 <_ChromeMain+0x46263dc>
 462b65c: b94006d7     	ldr	w23, [x22, #0x4]
 462b660: 9737efc5     	bl	0x1427574 <_ChromeMain+0x14222d8>
 462b664: d360fc28     	lsr	x8, x1, #32
 462b668: 8b408108     	add	x8, x8, x0, lsr #32
 462b66c: 11003108     	add	w8, w8, #0xc
 462b670: 6b0802ff     	cmp	w23, w8
 462b674: 5400052c     	b.gt	0x462b718 <_ChromeMain+0x462647c>
 462b678: 395b0288     	ldrb	w8, [x20, #0x6c0]
 462b67c: 34000348     	cbz	w8, 0x462b6e4 <_ChromeMain+0x4626448>
 462b680: 391b029f     	strb	wzr, [x20, #0x6c0]
 462b684: f9436e94     	ldr	x20, [x20, #0x6d8]
 462b688: b40002f4     	cbz	x20, 0x462b6e4 <_ChromeMain+0x4626448>
 462b68c: f9407288     	ldr	x8, [x20, #0xe0]
 462b690: b40002a8     	cbz	x8, 0x462b6e4 <_ChromeMain+0x4626448>
 462b694: 19404108     	ldapurb	w8, [x8, #0x4]
 462b698: 35000268     	cbnz	w8, 0x462b6e4 <_ChromeMain+0x4626448>
 462b69c: f9407688     	ldr	x8, [x20, #0xe8]
 462b6a0: b4000228     	cbz	x8, 0x462b6e4 <_ChromeMain+0x4626448>
 462b6a4: f9407288     	ldr	x8, [x20, #0xe0]
 462b6a8: b4001f28     	cbz	x8, 0x462ba8c <_ChromeMain+0x46267f0>
 462b6ac: 19404108     	ldapurb	w8, [x8, #0x4]
 462b6b0: 35001ee8     	cbnz	w8, 0x462ba8c <_ChromeMain+0x46267f0>
 462b6b4: f9407688     	ldr	x8, [x20, #0xe8]
 462b6b8: f9402500     	ldr	x0, [x8, #0x48]
 462b6bc: b4000060     	cbz	x0, 0x462b6c8 <_ChromeMain+0x462642c>
 462b6c0: 52800001     	mov	w1, #0x0                ; =0
 462b6c4: 97945bce     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 462b6c8: 97932f1f     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 462b6cc: f90003f4     	str	x20, [sp]
 462b6d0: f0030581     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 462b6d4: 91389021     	add	x1, x1, #0xe24
 462b6d8: 910003e3     	mov	x3, sp
 462b6dc: d2800002     	mov	x2, #0x0                ; =0
 462b6e0: 976fba39     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 462b6e4: 3900027f     	strb	wzr, [x19]
 462b6e8: 3900427f     	strb	wzr, [x19, #0x10]
 462b6ec: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 462b6f0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 462b6f4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 462b6f8: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 462b6fc: a94267fa     	ldp	x26, x25, [sp, #0x20]
 462b700: 9101c3ff     	add	sp, sp, #0x70
 462b704: d65f03c0     	ret
 462b708: 94e62b54     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462b70c: 52800301     	mov	w1, #0x18               ; =24
 462b710: 96e775ea     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462b714: 17ffffd0     	b	0x462b654 <_ChromeMain+0x46263b8>
 462b718: 52800028     	mov	w8, #0x1                ; =1
 462b71c: 391b0288     	strb	w8, [x20, #0x6c0]
 462b720: 39405ea8     	ldrb	w8, [x21, #0x17]
 462b724: f94006a9     	ldr	x9, [x21, #0x8]
 462b728: 7219011f     	tst	w8, #0x80
 462b72c: 9a881128     	csel	x8, x9, x8, ne
 462b730: b5000448     	cbnz	x8, 0x462b7b8 <_ChromeMain+0x462651c>
 462b734: 52800400     	mov	w0, #0x20               ; =32
 462b738: 96e78f0c     	bl	0xf368 <_ChromeMain+0xa0cc>
 462b73c: f90003e0     	str	x0, [sp]
 462b740: 9004c8a8     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 462b744: 3dc04100     	ldr	q0, [x8, #0x100]
 462b748: 3c8083e0     	stur	q0, [sp, #0x8]
 462b74c: 91007809     	add	x9, x0, #0x1e
 462b750: eb00013f     	cmp	x9, x0
 462b754: 54000fc3     	b.lo	0x462b94c <_ChromeMain+0x46266b0>
 462b758: 9004cae8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462b75c: 91392908     	add	x8, x8, #0xe4a
 462b760: eb08013f     	cmp	x9, x8
 462b764: fa488002     	ccmp	x0, x8, #0x2, hi
 462b768: 54000f29     	b.ls	0x462b94c <_ChromeMain+0x46266b0>
 462b76c: 3dc00100     	ldr	q0, [x8]
 462b770: 3d800000     	str	q0, [x0]
 462b774: 3cc0e100     	ldur	q0, [x8, #0xe]
 462b778: 3c80e000     	stur	q0, [x0, #0xe]
 462b77c: 79003c1f     	strh	wzr, [x0, #0x1e]
 462b780: 910003e1     	mov	x1, sp
 462b784: aa1403e0     	mov	x0, x20
 462b788: aa1603e2     	mov	x2, x22
 462b78c: 940095cd     	bl	0x4650ec0 <_ChromeMain+0x464bc24>
 462b790: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 462b794: 36f800a8     	tbz	w8, #0x1f, 0x462b7a8 <_ChromeMain+0x462650c>
 462b798: f94003e0     	ldr	x0, [sp]
 462b79c: f9400be8     	ldr	x8, [sp, #0x10]
 462b7a0: d37ff901     	lsl	x1, x8, #1
 462b7a4: 96e775c5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462b7a8: a9007e7f     	stp	xzr, xzr, [x19]
 462b7ac: 52800028     	mov	w8, #0x1                ; =1
 462b7b0: 39004268     	strb	w8, [x19, #0x10]
 462b7b4: 17ffffce     	b	0x462b6ec <_ChromeMain+0x4626450>
 462b7b8: 9004cae0     	adrp	x0, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462b7bc: 9139a800     	add	x0, x0, #0xe6a
 462b7c0: 910003e8     	mov	x8, sp
 462b7c4: aa1503e1     	mov	x1, x21
 462b7c8: 948ebd44     	bl	0x69dacd8 <_ChromeMain+0x69d5a3c>
 462b7cc: 17ffffed     	b	0x462b780 <_ChromeMain+0x46264e4>
 462b7d0: aa0503f7     	mov	x23, x5
 462b7d4: aa0303f8     	mov	x24, x3
 462b7d8: aa0103f9     	mov	x25, x1
 462b7dc: f9442688     	ldr	x8, [x20, #0x848]
 462b7e0: 39424108     	ldrb	w8, [x8, #0x90]
 462b7e4: 340000a8     	cbz	w8, 0x462b7f8 <_ChromeMain+0x462655c>
 462b7e8: 39682289     	ldrb	w9, [x20, #0xa08]
 462b7ec: 37000269     	tbnz	w9, #0x0, 0x462b838 <_ChromeMain+0x462659c>
 462b7f0: 39683289     	ldrb	w9, [x20, #0xa0c]
 462b7f4: 37000229     	tbnz	w9, #0x0, 0x462b838 <_ChromeMain+0x462659c>
 462b7f8: 3973828a     	ldrb	w10, [x20, #0xce0]
 462b7fc: 397de289     	ldrb	w9, [x20, #0xf78]
 462b800: 3700008a     	tbnz	w10, #0x0, 0x462b810 <_ChromeMain+0x4626574>
 462b804: 37000089     	tbnz	w9, #0x0, 0x462b814 <_ChromeMain+0x4626578>
 462b808: 36000188     	tbz	w8, #0x0, 0x462b838 <_ChromeMain+0x462659c>
 462b80c: 17ffff82     	b	0x462b614 <_ChromeMain+0x4626378>
 462b810: 340006a9     	cbz	w9, 0x462b8e4 <_ChromeMain+0x4626648>
 462b814: b941c288     	ldr	w8, [x20, #0x1c0]
 462b818: aa0803e9     	mov	x9, x8
 462b81c: 6b08013f     	cmp	w9, w8
 462b820: 1a88b12a     	csel	w10, w9, w8, lt
 462b824: 7100011f     	cmp	w8, #0x0
 462b828: 1a89c148     	csel	w8, w10, w9, gt
 462b82c: 71025d1f     	cmp	w8, #0x97
 462b830: 54ffef2b     	b.lt	0x462b614 <_ChromeMain+0x4626378>
 462b834: f9433680     	ldr	x0, [x20, #0x668]
 462b838: 9737ef4f     	bl	0x1427574 <_ChromeMain+0x14222d8>
 462b83c: b94002c8     	ldr	w8, [x22]
 462b840: 6b00011f     	cmp	w8, w0
 462b844: 54ffee8b     	b.lt	0x462b614 <_ChromeMain+0x4626378>
 462b848: 0b000029     	add	w9, w1, w0
 462b84c: 6b09011f     	cmp	w8, w9
 462b850: 54ffee2a     	b.ge	0x462b614 <_ChromeMain+0x4626378>
 462b854: b94006c8     	ldr	w8, [x22, #0x4]
 462b858: d360fc09     	lsr	x9, x0, #32
 462b85c: 6b09011f     	cmp	w8, w9
 462b860: 54ffedab     	b.lt	0x462b614 <_ChromeMain+0x4626378>
 462b864: 8b418129     	add	x9, x9, x1, lsr #32
 462b868: 6b09011f     	cmp	w8, w9
 462b86c: 54ffed4a     	b.ge	0x462b614 <_ChromeMain+0x4626378>
 462b870: a9007e7f     	stp	xzr, xzr, [x19]
 462b874: b900127f     	str	wzr, [x19, #0x10]
 462b878: f9435280     	ldr	x0, [x20, #0x6a0]
 462b87c: aa1303e8     	mov	x8, x19
 462b880: aa1903e1     	mov	x1, x25
 462b884: aa1503e2     	mov	x2, x21
 462b888: aa1603e3     	mov	x3, x22
 462b88c: 97ff9abe     	bl	0x4612384 <_ChromeMain+0x460d0e8>
 462b890: 39404268     	ldrb	w8, [x19, #0x10]
 462b894: 34ffec08     	cbz	w8, 0x462b614 <_ChromeMain+0x4626378>
 462b898: 395b0288     	ldrb	w8, [x20, #0x6c0]
 462b89c: 34000748     	cbz	w8, 0x462b984 <_ChromeMain+0x46266e8>
 462b8a0: 391b029f     	strb	wzr, [x20, #0x6c0]
 462b8a4: f9436e99     	ldr	x25, [x20, #0x6d8]
 462b8a8: b40006f9     	cbz	x25, 0x462b984 <_ChromeMain+0x46266e8>
 462b8ac: f9407328     	ldr	x8, [x25, #0xe0]
 462b8b0: b4000668     	cbz	x8, 0x462b97c <_ChromeMain+0x46266e0>
 462b8b4: 19404108     	ldapurb	w8, [x8, #0x4]
 462b8b8: 35000628     	cbnz	w8, 0x462b97c <_ChromeMain+0x46266e0>
 462b8bc: f9407728     	ldr	x8, [x25, #0xe8]
 462b8c0: b40005e8     	cbz	x8, 0x462b97c <_ChromeMain+0x46266e0>
 462b8c4: f9407328     	ldr	x8, [x25, #0xe0]
 462b8c8: b40003e8     	cbz	x8, 0x462b944 <_ChromeMain+0x46266a8>
 462b8cc: 19404108     	ldapurb	w8, [x8, #0x4]
 462b8d0: 350003a8     	cbnz	w8, 0x462b944 <_ChromeMain+0x46266a8>
 462b8d4: f9407728     	ldr	x8, [x25, #0xe8]
 462b8d8: f9402500     	ldr	x0, [x8, #0x48]
 462b8dc: b4000420     	cbz	x0, 0x462b960 <_ChromeMain+0x46266c4>
 462b8e0: 1400001e     	b	0x462b958 <_ChromeMain+0x46266bc>
 462b8e4: 3974a288     	ldrb	w8, [x20, #0xd28]
 462b8e8: 350000c8     	cbnz	w8, 0x462b900 <_ChromeMain+0x4626664>
 462b8ec: fd46a280     	ldr	d0, [x20, #0xd40]
 462b8f0: 1e6e1001     	fmov	d1, #1.00000000
 462b8f4: 1e612000     	fcmp	d0, d1
 462b8f8: 1a9f17e8     	cset	w8, eq
 462b8fc: 14000005     	b	0x462b910 <_ChromeMain+0x4626674>
 462b900: b94d2688     	ldr	w8, [x20, #0xd24]
 462b904: 7100011f     	cmp	w8, #0x0
 462b908: 1a9f17e8     	cset	w8, eq
 462b90c: fd46a280     	ldr	d0, [x20, #0xd40]
 462b910: d0021ea9     	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 462b914: 912db129     	add	x9, x9, #0xb6c
 462b918: b0ff7c8a     	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 462b91c: 9103514a     	add	x10, x10, #0xd4
 462b920: 7100011f     	cmp	w8, #0x0
 462b924: 9a891148     	csel	x8, x10, x9, ne
 462b928: b948ca89     	ldr	w9, [x20, #0x8c8]
 462b92c: 1e620121     	scvtf	d1, w9
 462b930: 1e610800     	fmul	d0, d0, d1
 462b934: d63f0100     	blr	x8
 462b938: 1e780009     	fcvtzs	w9, d0
 462b93c: b941c288     	ldr	w8, [x20, #0x1c0]
 462b940: 17ffffb7     	b	0x462b81c <_ChromeMain+0x4626580>
 462b944: d4200000     	brk	#0
 462b948: d4400000     	hlt	#0
 462b94c: d4200020     	brk	#0x1
 462b950: 1e6c1000     	fmov	d0, #0.50000000
 462b954: 1400001d     	b	0x462b9c8 <_ChromeMain+0x462672c>
 462b958: 52800001     	mov	w1, #0x0                ; =0
 462b95c: 97945b28     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 462b960: 97932e79     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 462b964: f90003f9     	str	x25, [sp]
 462b968: f0030581     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 462b96c: 91389021     	add	x1, x1, #0xe24
 462b970: 910003e3     	mov	x3, sp
 462b974: d2800002     	mov	x2, #0x0                ; =0
 462b978: 976fb993     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 462b97c: 39404268     	ldrb	w8, [x19, #0x10]
 462b980: 3607fe68     	tbz	w8, #0x0, 0x462b94c <_ChromeMain+0x46266b0>
 462b984: 3dc00260     	ldr	q0, [x19]
 462b988: 3d8003e0     	str	q0, [sp]
 462b98c: b9400ee9     	ldr	w9, [x23, #0xc]
 462b990: b94006c8     	ldr	w8, [x22, #0x4]
 462b994: 7100053f     	cmp	w9, #0x1
 462b998: 54fffdcb     	b.lt	0x462b950 <_ChromeMain+0x46266b4>
 462b99c: b94006ea     	ldr	w10, [x23, #0x4]
 462b9a0: 4b0a010a     	sub	w10, w8, w10
 462b9a4: 1e620140     	scvtf	d0, w10
 462b9a8: 1e630121     	ucvtf	d1, w9
 462b9ac: 1e611800     	fdiv	d0, d0, d1
 462b9b0: 1e6e1001     	fmov	d1, #1.00000000
 462b9b4: 1e612000     	fcmp	d0, d1
 462b9b8: 1e60cc21     	fcsel	d1, d1, d0, gt
 462b9bc: 1e602008     	fcmp	d0, #0.0
 462b9c0: 6f00e400     	movi.2d	v0, #0000000000000000
 462b9c4: 1e614c00     	fcsel	d0, d0, d1, mi
 462b9c8: b9400fe9     	ldr	w9, [sp, #0xc]
 462b9cc: 1e620121     	scvtf	d1, w9
 462b9d0: 1e610800     	fmul	d0, d0, d1
 462b9d4: 9e64000a     	fcvtas	x10, d0
 462b9d8: 4b0a0108     	sub	w8, w8, w10
 462b9dc: 2b090109     	adds	w9, w8, w9
 462b9e0: 131f7d2a     	asr	w10, w9, #31
 462b9e4: 5201014a     	eor	w10, w10, #0x80000000
 462b9e8: 1a896149     	csel	w9, w10, w9, vs
 462b9ec: 6b080129     	subs	w9, w9, w8
 462b9f0: 131f7d2a     	asr	w10, w9, #31
 462b9f4: 5201014a     	eor	w10, w10, #0x80000000
 462b9f8: 1a896149     	csel	w9, w10, w9, vs
 462b9fc: 0aa97d29     	bic	w9, w9, w9, asr #31
 462ba00: b90007e8     	str	w8, [sp, #0x4]
 462ba04: b9000fe9     	str	w9, [sp, #0xc]
 462ba08: 910003e4     	mov	x4, sp
 462ba0c: aa1403e0     	mov	x0, x20
 462ba10: aa1503e1     	mov	x1, x21
 462ba14: aa1803e2     	mov	x2, x24
 462ba18: aa1703e3     	mov	x3, x23
 462ba1c: 52800005     	mov	w5, #0x0                ; =0
 462ba20: 940095c8     	bl	0x4651140 <_ChromeMain+0x464bea4>
 462ba24: 17ffff32     	b	0x462b6ec <_ChromeMain+0x4626450>
 462ba28: 390ce2ff     	strb	wzr, [x23, #0x338]
 462ba2c: f941a6e0     	ldr	x0, [x23, #0x348]
 462ba30: 910ca2e1     	add	x1, x23, #0x328
 462ba34: 976b7733     	bl	0x2109700 <_ChromeMain+0x2104464>
 462ba38: f94196e8     	ldr	x8, [x23, #0x328]
 462ba3c: f9401d08     	ldr	x8, [x8, #0x38]
 462ba40: 910ca2e0     	add	x0, x23, #0x328
 462ba44: d63f0100     	blr	x8
 462ba48: f941a2e8     	ldr	x8, [x23, #0x340]
 462ba4c: b4ffdf48     	cbz	x8, 0x462b634 <_ChromeMain+0x4626398>
 462ba50: f94196e8     	ldr	x8, [x23, #0x328]
 462ba54: f9402108     	ldr	x8, [x8, #0x40]
 462ba58: 910ca2e0     	add	x0, x23, #0x328
 462ba5c: d63f0100     	blr	x8
 462ba60: f941a2e8     	ldr	x8, [x23, #0x340]
 462ba64: f9400109     	ldr	x9, [x8]
 462ba68: 7100001f     	cmp	w0, #0x0
 462ba6c: 5280020a     	mov	w10, #0x10              ; =16
 462ba70: 5280040b     	mov	w11, #0x20              ; =32
 462ba74: 9a8a116a     	csel	x10, x11, x10, ne
 462ba78: f86a6929     	ldr	x9, [x9, x10]
 462ba7c: 910ca2e1     	add	x1, x23, #0x328
 462ba80: aa0803e0     	mov	x0, x8
 462ba84: d63f0120     	blr	x9
 462ba88: 17fffeeb     	b	0x462b634 <_ChromeMain+0x4626398>
 462ba8c: d4200000     	brk	#0
 462ba90: d4400000     	hlt	#0
 462ba94: d4200020     	brk	#0x1
 462ba98: d10143ff     	sub	sp, sp, #0x50
 462ba9c: a90257f6     	stp	x22, x21, [sp, #0x20]
 462baa0: a9034ff4     	stp	x20, x19, [sp, #0x30]
 462baa4: a9047bfd     	stp	x29, x30, [sp, #0x40]
 462baa8: 910103fd     	add	x29, sp, #0x40
 462baac: aa0003f3     	mov	x19, x0
 462bab0: 52800000     	mov	w0, #0x0                ; =0
 462bab4: f9435276     	ldr	x22, [x19, #0x6a0]
 462bab8: b4000256     	cbz	x22, 0x462bb00 <_ChromeMain+0x4626864>
 462babc: aa0103f4     	mov	x20, x1
 462bac0: 39406028     	ldrb	w8, [x1, #0x18]
 462bac4: 360001e8     	tbz	w8, #0x0, 0x462bb00 <_ChromeMain+0x4626864>
 462bac8: aa0303f5     	mov	x21, x3
 462bacc: 395b0268     	ldrb	w8, [x19, #0x6c0]
 462bad0: 34000ba8     	cbz	w8, 0x462bc44 <_ChromeMain+0x46269a8>
 462bad4: 391b027f     	strb	wzr, [x19, #0x6c0]
 462bad8: b60004b5     	tbz	x21, #0x20, 0x462bb6c <_ChromeMain+0x46268d0>
 462badc: f9423668     	ldr	x8, [x19, #0x468]
 462bae0: b4000468     	cbz	x8, 0x462bb6c <_ChromeMain+0x46268d0>
 462bae4: f9400100     	ldr	x0, [x8]
 462bae8: b9401808     	ldr	w8, [x0, #0x18]
 462baec: 7100051f     	cmp	w8, #0x1
 462baf0: 540003eb     	b.lt	0x462bb6c <_ChromeMain+0x46268d0>
 462baf4: d2800016     	mov	x22, #0x0               ; =0
 462baf8: 1400000d     	b	0x462bb2c <_ChromeMain+0x4626890>
 462bafc: 52800000     	mov	w0, #0x0                ; =0
 462bb00: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 462bb04: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 462bb08: a94257f6     	ldp	x22, x21, [sp, #0x20]
 462bb0c: 910143ff     	add	sp, sp, #0x50
 462bb10: d65f03c0     	ret
 462bb14: 910006d6     	add	x22, x22, #0x1
 462bb18: f9423668     	ldr	x8, [x19, #0x468]
 462bb1c: f9400100     	ldr	x0, [x8]
 462bb20: b9801808     	ldrsw	x8, [x0, #0x18]
 462bb24: eb0802df     	cmp	x22, x8
 462bb28: 5400022a     	b.ge	0x462bb6c <_ChromeMain+0x46268d0>
 462bb2c: aa1603e1     	mov	x1, x22
 462bb30: 9728c9f2     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462bb34: b4ffff00     	cbz	x0, 0x462bb14 <_ChromeMain+0x4626878>
 462bb38: b9401008     	ldr	w8, [x0, #0x10]
 462bb3c: 6b15011f     	cmp	w8, w21
 462bb40: 54fffea1     	b.ne	0x462bb14 <_ChromeMain+0x4626878>
 462bb44: f9423668     	ldr	x8, [x19, #0x468]
 462bb48: f9400100     	ldr	x0, [x8]
 462bb4c: aa1603e1     	mov	x1, x22
 462bb50: 9728c9ea     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462bb54: 39418408     	ldrb	w8, [x0, #0x61]
 462bb58: 340000a8     	cbz	w8, 0x462bb6c <_ChromeMain+0x46268d0>
 462bb5c: f9423660     	ldr	x0, [x19, #0x468]
 462bb60: aa1603e1     	mov	x1, x22
 462bb64: 52800002     	mov	w2, #0x0                ; =0
 462bb68: 94dc9a59     	bl	0x7d524cc <_ChromeMain+0x7d4d230>
 462bb6c: f9422e68     	ldr	x8, [x19, #0x458]
 462bb70: b40000c8     	cbz	x8, 0x462bb88 <_ChromeMain+0x46268ec>
 462bb74: f9429d08     	ldr	x8, [x8, #0x538]
 462bb78: b4000088     	cbz	x8, 0x462bb88 <_ChromeMain+0x46268ec>
 462bb7c: f9403500     	ldr	x0, [x8, #0x68]
 462bb80: aa1403e1     	mov	x1, x20
 462bb84: 97eea4e7     	bl	0x41d4f20 <_ChromeMain+0x41cfc84>
 462bb88: f9435660     	ldr	x0, [x19, #0x6a8]
 462bb8c: b4000040     	cbz	x0, 0x462bb94 <_ChromeMain+0x46268f8>
 462bb90: 97ff6595     	bl	0x46051e4 <_ChromeMain+0x45fff48>
 462bb94: f9436e75     	ldr	x21, [x19, #0x6d8]
 462bb98: b40002f5     	cbz	x21, 0x462bbf4 <_ChromeMain+0x4626958>
 462bb9c: f94072a8     	ldr	x8, [x21, #0xe0]
 462bba0: b40002a8     	cbz	x8, 0x462bbf4 <_ChromeMain+0x4626958>
 462bba4: 19404108     	ldapurb	w8, [x8, #0x4]
 462bba8: 35000268     	cbnz	w8, 0x462bbf4 <_ChromeMain+0x4626958>
 462bbac: f94076a8     	ldr	x8, [x21, #0xe8]
 462bbb0: b4000228     	cbz	x8, 0x462bbf4 <_ChromeMain+0x4626958>
 462bbb4: f94072a8     	ldr	x8, [x21, #0xe0]
 462bbb8: b4001748     	cbz	x8, 0x462bea0 <_ChromeMain+0x4626c04>
 462bbbc: 19404108     	ldapurb	w8, [x8, #0x4]
 462bbc0: 35001708     	cbnz	w8, 0x462bea0 <_ChromeMain+0x4626c04>
 462bbc4: f94076a8     	ldr	x8, [x21, #0xe8]
 462bbc8: f9402500     	ldr	x0, [x8, #0x48]
 462bbcc: b4000060     	cbz	x0, 0x462bbd8 <_ChromeMain+0x462693c>
 462bbd0: 52800001     	mov	w1, #0x0                ; =0
 462bbd4: 97945a8a     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 462bbd8: 97932ddb     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 462bbdc: f9000ff5     	str	x21, [sp, #0x18]
 462bbe0: f0030581     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 462bbe4: 91389021     	add	x1, x1, #0xe24
 462bbe8: 910063e3     	add	x3, sp, #0x18
 462bbec: d2800002     	mov	x2, #0x0                ; =0
 462bbf0: 976fb8f5     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 462bbf4: aa1303e0     	mov	x0, x19
 462bbf8: 94000164     	bl	0x462c188 <_ChromeMain+0x4626eec>
 462bbfc: aa1303e0     	mov	x0, x19
 462bc00: 94006600     	bl	0x4645400 <_ChromeMain+0x4640164>
 462bc04: aa1303e0     	mov	x0, x19
 462bc08: 52800001     	mov	w1, #0x0                ; =0
 462bc0c: 9700121a     	bl	0x630474 <_ChromeMain+0x62b1d8>
 462bc10: f9422e68     	ldr	x8, [x19, #0x458]
 462bc14: b4fff748     	cbz	x8, 0x462bafc <_ChromeMain+0x4626860>
 462bc18: f9429d08     	ldr	x8, [x8, #0x538]
 462bc1c: b4fff708     	cbz	x8, 0x462bafc <_ChromeMain+0x4626860>
 462bc20: f9403500     	ldr	x0, [x8, #0x68]
 462bc24: aa1403e1     	mov	x1, x20
 462bc28: 97eea581     	bl	0x41d522c <_ChromeMain+0x41cff90>
 462bc2c: 52000000     	eor	w0, w0, #0x1
 462bc30: 17ffffb4     	b	0x462bb00 <_ChromeMain+0x4626864>
 462bc34: a9400841     	ldp	x1, x2, [x2]
 462bc38: 910003e0     	mov	x0, sp
 462bc3c: 96e86be5     	bl	0x46bd0 <_ChromeMain+0x41934>
 462bc40: 14000007     	b	0x462bc5c <_ChromeMain+0x46269c0>
 462bc44: 39c05c48     	ldrsb	w8, [x2, #0x17]
 462bc48: 37ffff68     	tbnz	w8, #0x1f, 0x462bc34 <_ChromeMain+0x4626998>
 462bc4c: 3dc00040     	ldr	q0, [x2]
 462bc50: 3d8003e0     	str	q0, [sp]
 462bc54: f9400848     	ldr	x8, [x2, #0x10]
 462bc58: f9000be8     	str	x8, [sp, #0x10]
 462bc5c: 910003e2     	mov	x2, sp
 462bc60: aa1603e0     	mov	x0, x22
 462bc64: aa1403e1     	mov	x1, x20
 462bc68: 97ff9d03     	bl	0x4613074 <_ChromeMain+0x460ddd8>
 462bc6c: aa0003f6     	mov	x22, x0
 462bc70: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 462bc74: 37f80168     	tbnz	w8, #0x1f, 0x462bca0 <_ChromeMain+0x4626a04>
 462bc78: b40001f6     	cbz	x22, 0x462bcb4 <_ChromeMain+0x4626a18>
 462bc7c: b6000695     	tbz	x21, #0x20, 0x462bd4c <_ChromeMain+0x4626ab0>
 462bc80: f9423668     	ldr	x8, [x19, #0x468]
 462bc84: b4000648     	cbz	x8, 0x462bd4c <_ChromeMain+0x4626ab0>
 462bc88: f9400100     	ldr	x0, [x8]
 462bc8c: b9401808     	ldr	w8, [x0, #0x18]
 462bc90: 7100051f     	cmp	w8, #0x1
 462bc94: 540005cb     	b.lt	0x462bd4c <_ChromeMain+0x4626ab0>
 462bc98: d2800016     	mov	x22, #0x0               ; =0
 462bc9c: 1400001c     	b	0x462bd0c <_ChromeMain+0x4626a70>
 462bca0: f94003e0     	ldr	x0, [sp]
 462bca4: f9400be8     	ldr	x8, [sp, #0x10]
 462bca8: d37ff901     	lsl	x1, x8, #1
 462bcac: 96e77483     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462bcb0: b5fffe76     	cbnz	x22, 0x462bc7c <_ChromeMain+0x46269e0>
 462bcb4: f9435e74     	ldr	x20, [x19, #0x6b8]
 462bcb8: b4000114     	cbz	x20, 0x462bcd8 <_ChromeMain+0x4626a3c>
 462bcbc: 394ce288     	ldrb	w8, [x20, #0x338]
 462bcc0: 35000be8     	cbnz	w8, 0x462be3c <_ChromeMain+0x4626ba0>
 462bcc4: f9400288     	ldr	x8, [x20]
 462bcc8: f9405108     	ldr	x8, [x8, #0xa0]
 462bccc: aa1403e0     	mov	x0, x20
 462bcd0: 52800001     	mov	w1, #0x0                ; =0
 462bcd4: d63f0100     	blr	x8
 462bcd8: f9465260     	ldr	x0, [x19, #0xca0]
 462bcdc: f906527f     	str	xzr, [x19, #0xca0]
 462bce0: b4fff100     	cbz	x0, 0x462bb00 <_ChromeMain+0x4626864>
 462bce4: 94e629dd     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462bce8: 52800301     	mov	w1, #0x18               ; =24
 462bcec: 96e77473     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462bcf0: 17ffff83     	b	0x462bafc <_ChromeMain+0x4626860>
 462bcf4: 910006d6     	add	x22, x22, #0x1
 462bcf8: f9423668     	ldr	x8, [x19, #0x468]
 462bcfc: f9400100     	ldr	x0, [x8]
 462bd00: b9801808     	ldrsw	x8, [x0, #0x18]
 462bd04: eb0802df     	cmp	x22, x8
 462bd08: 5400022a     	b.ge	0x462bd4c <_ChromeMain+0x4626ab0>
 462bd0c: aa1603e1     	mov	x1, x22
 462bd10: 9728c97a     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462bd14: b4ffff00     	cbz	x0, 0x462bcf4 <_ChromeMain+0x4626a58>
 462bd18: b9401008     	ldr	w8, [x0, #0x10]
 462bd1c: 6b15011f     	cmp	w8, w21
 462bd20: 54fffea1     	b.ne	0x462bcf4 <_ChromeMain+0x4626a58>
 462bd24: f9423668     	ldr	x8, [x19, #0x468]
 462bd28: f9400100     	ldr	x0, [x8]
 462bd2c: aa1603e1     	mov	x1, x22
 462bd30: 9728c972     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462bd34: 39418408     	ldrb	w8, [x0, #0x61]
 462bd38: 340000a8     	cbz	w8, 0x462bd4c <_ChromeMain+0x4626ab0>
 462bd3c: f9423660     	ldr	x0, [x19, #0x468]
 462bd40: aa1603e1     	mov	x1, x22
 462bd44: 52800002     	mov	w2, #0x0                ; =0
 462bd48: 94dc99e1     	bl	0x7d524cc <_ChromeMain+0x7d4d230>
 462bd4c: f9422e68     	ldr	x8, [x19, #0x458]
 462bd50: b40000c8     	cbz	x8, 0x462bd68 <_ChromeMain+0x4626acc>
 462bd54: f9429d08     	ldr	x8, [x8, #0x538]
 462bd58: b4000088     	cbz	x8, 0x462bd68 <_ChromeMain+0x4626acc>
 462bd5c: f9403500     	ldr	x0, [x8, #0x68]
 462bd60: aa1403e1     	mov	x1, x20
 462bd64: 97eea46f     	bl	0x41d4f20 <_ChromeMain+0x41cfc84>
 462bd68: f9435660     	ldr	x0, [x19, #0x6a8]
 462bd6c: b4000040     	cbz	x0, 0x462bd74 <_ChromeMain+0x4626ad8>
 462bd70: 97ff651d     	bl	0x46051e4 <_ChromeMain+0x45fff48>
 462bd74: f9435e74     	ldr	x20, [x19, #0x6b8]
 462bd78: b4000114     	cbz	x20, 0x462bd98 <_ChromeMain+0x4626afc>
 462bd7c: 394ce288     	ldrb	w8, [x20, #0x338]
 462bd80: 350002c8     	cbnz	w8, 0x462bdd8 <_ChromeMain+0x4626b3c>
 462bd84: f9400288     	ldr	x8, [x20]
 462bd88: f9405108     	ldr	x8, [x8, #0xa0]
 462bd8c: aa1403e0     	mov	x0, x20
 462bd90: 52800001     	mov	w1, #0x0                ; =0
 462bd94: d63f0100     	blr	x8
 462bd98: f9465260     	ldr	x0, [x19, #0xca0]
 462bd9c: f906527f     	str	xzr, [x19, #0xca0]
 462bda0: b5000140     	cbnz	x0, 0x462bdc8 <_ChromeMain+0x4626b2c>
 462bda4: aa1303e0     	mov	x0, x19
 462bda8: 940000f8     	bl	0x462c188 <_ChromeMain+0x4626eec>
 462bdac: aa1303e0     	mov	x0, x19
 462bdb0: 94006594     	bl	0x4645400 <_ChromeMain+0x4640164>
 462bdb4: aa1303e0     	mov	x0, x19
 462bdb8: 52800001     	mov	w1, #0x0                ; =0
 462bdbc: 970011ae     	bl	0x630474 <_ChromeMain+0x62b1d8>
 462bdc0: 52800020     	mov	w0, #0x1                ; =1
 462bdc4: 17ffff4f     	b	0x462bb00 <_ChromeMain+0x4626864>
 462bdc8: 94e629a4     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462bdcc: 52800301     	mov	w1, #0x18               ; =24
 462bdd0: 96e7743a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462bdd4: 17fffff4     	b	0x462bda4 <_ChromeMain+0x4626b08>
 462bdd8: 390ce29f     	strb	wzr, [x20, #0x338]
 462bddc: f941a680     	ldr	x0, [x20, #0x348]
 462bde0: 910ca281     	add	x1, x20, #0x328
 462bde4: 976b7647     	bl	0x2109700 <_ChromeMain+0x2104464>
 462bde8: f9419688     	ldr	x8, [x20, #0x328]
 462bdec: f9401d08     	ldr	x8, [x8, #0x38]
 462bdf0: 910ca280     	add	x0, x20, #0x328
 462bdf4: d63f0100     	blr	x8
 462bdf8: f941a288     	ldr	x8, [x20, #0x340]
 462bdfc: b4fffc48     	cbz	x8, 0x462bd84 <_ChromeMain+0x4626ae8>
 462be00: f9419688     	ldr	x8, [x20, #0x328]
 462be04: f9402108     	ldr	x8, [x8, #0x40]
 462be08: 910ca280     	add	x0, x20, #0x328
 462be0c: d63f0100     	blr	x8
 462be10: f941a288     	ldr	x8, [x20, #0x340]
 462be14: f9400109     	ldr	x9, [x8]
 462be18: 7100001f     	cmp	w0, #0x0
 462be1c: 5280020a     	mov	w10, #0x10              ; =16
 462be20: 5280040b     	mov	w11, #0x20              ; =32
 462be24: 9a8a116a     	csel	x10, x11, x10, ne
 462be28: f86a6929     	ldr	x9, [x9, x10]
 462be2c: 910ca281     	add	x1, x20, #0x328
 462be30: aa0803e0     	mov	x0, x8
 462be34: d63f0120     	blr	x9
 462be38: 17ffffd3     	b	0x462bd84 <_ChromeMain+0x4626ae8>
 462be3c: 390ce29f     	strb	wzr, [x20, #0x338]
 462be40: f941a680     	ldr	x0, [x20, #0x348]
 462be44: 910ca281     	add	x1, x20, #0x328
 462be48: 976b762e     	bl	0x2109700 <_ChromeMain+0x2104464>
 462be4c: f9419688     	ldr	x8, [x20, #0x328]
 462be50: f9401d08     	ldr	x8, [x8, #0x38]
 462be54: 910ca280     	add	x0, x20, #0x328
 462be58: d63f0100     	blr	x8
 462be5c: f941a288     	ldr	x8, [x20, #0x340]
 462be60: b4fff328     	cbz	x8, 0x462bcc4 <_ChromeMain+0x4626a28>
 462be64: f9419688     	ldr	x8, [x20, #0x328]
 462be68: f9402108     	ldr	x8, [x8, #0x40]
 462be6c: 910ca280     	add	x0, x20, #0x328
 462be70: d63f0100     	blr	x8
 462be74: f941a288     	ldr	x8, [x20, #0x340]
 462be78: f9400109     	ldr	x9, [x8]
 462be7c: 7100001f     	cmp	w0, #0x0
 462be80: 5280020a     	mov	w10, #0x10              ; =16
 462be84: 5280040b     	mov	w11, #0x20              ; =32
 462be88: 9a8a116a     	csel	x10, x11, x10, ne
 462be8c: f86a6929     	ldr	x9, [x9, x10]
 462be90: 910ca281     	add	x1, x20, #0x328
 462be94: aa0803e0     	mov	x0, x8
 462be98: d63f0120     	blr	x9
 462be9c: 17ffff8a     	b	0x462bcc4 <_ChromeMain+0x4626a28>
 462bea0: d4200000     	brk	#0
 462bea4: d4400000     	hlt	#0
 462bea8: d4200020     	brk	#0x1
 462beac: d100c3ff     	sub	sp, sp, #0x30
 462beb0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 462beb4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 462beb8: 910083fd     	add	x29, sp, #0x20
 462bebc: aa0003f3     	mov	x19, x0
 462bec0: f9435000     	ldr	x0, [x0, #0x6a0]
 462bec4: b4000060     	cbz	x0, 0x462bed0 <_ChromeMain+0x4626c34>
 462bec8: 52800021     	mov	w1, #0x1                ; =1
 462becc: 97ff9ca5     	bl	0x4613160 <_ChromeMain+0x460dec4>
 462bed0: f9435e74     	ldr	x20, [x19, #0x6b8]
 462bed4: b4000114     	cbz	x20, 0x462bef4 <_ChromeMain+0x4626c58>
 462bed8: 394ce288     	ldrb	w8, [x20, #0x338]
 462bedc: 35000588     	cbnz	w8, 0x462bf8c <_ChromeMain+0x4626cf0>
 462bee0: f9400288     	ldr	x8, [x20]
 462bee4: f9405108     	ldr	x8, [x8, #0xa0]
 462bee8: aa1403e0     	mov	x0, x20
 462beec: 52800001     	mov	w1, #0x0                ; =0
 462bef0: d63f0100     	blr	x8
 462bef4: f9465260     	ldr	x0, [x19, #0xca0]
 462bef8: f906527f     	str	xzr, [x19, #0xca0]
 462befc: b5000400     	cbnz	x0, 0x462bf7c <_ChromeMain+0x4626ce0>
 462bf00: 395b0268     	ldrb	w8, [x19, #0x6c0]
 462bf04: 34000348     	cbz	w8, 0x462bf6c <_ChromeMain+0x4626cd0>
 462bf08: 391b027f     	strb	wzr, [x19, #0x6c0]
 462bf0c: f9436e73     	ldr	x19, [x19, #0x6d8]
 462bf10: b40002f3     	cbz	x19, 0x462bf6c <_ChromeMain+0x4626cd0>
 462bf14: f9407268     	ldr	x8, [x19, #0xe0]
 462bf18: b40002a8     	cbz	x8, 0x462bf6c <_ChromeMain+0x4626cd0>
 462bf1c: 19404108     	ldapurb	w8, [x8, #0x4]
 462bf20: 35000268     	cbnz	w8, 0x462bf6c <_ChromeMain+0x4626cd0>
 462bf24: f9407668     	ldr	x8, [x19, #0xe8]
 462bf28: b4000228     	cbz	x8, 0x462bf6c <_ChromeMain+0x4626cd0>
 462bf2c: f9407268     	ldr	x8, [x19, #0xe0]
 462bf30: b4000608     	cbz	x8, 0x462bff0 <_ChromeMain+0x4626d54>
 462bf34: 19404108     	ldapurb	w8, [x8, #0x4]
 462bf38: 350005c8     	cbnz	w8, 0x462bff0 <_ChromeMain+0x4626d54>
 462bf3c: f9407668     	ldr	x8, [x19, #0xe8]
 462bf40: f9402500     	ldr	x0, [x8, #0x48]
 462bf44: b4000060     	cbz	x0, 0x462bf50 <_ChromeMain+0x4626cb4>
 462bf48: 52800001     	mov	w1, #0x0                ; =0
 462bf4c: 979459ac     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 462bf50: 97932cfd     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 462bf54: f90007f3     	str	x19, [sp, #0x8]
 462bf58: f0030581     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 462bf5c: 91389021     	add	x1, x1, #0xe24
 462bf60: 910023e3     	add	x3, sp, #0x8
 462bf64: d2800002     	mov	x2, #0x0                ; =0
 462bf68: 976fb817     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 462bf6c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 462bf70: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 462bf74: 9100c3ff     	add	sp, sp, #0x30
 462bf78: d65f03c0     	ret
 462bf7c: 94e62937     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462bf80: 52800301     	mov	w1, #0x18               ; =24
 462bf84: 96e773cd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462bf88: 17ffffde     	b	0x462bf00 <_ChromeMain+0x4626c64>
 462bf8c: 390ce29f     	strb	wzr, [x20, #0x338]
 462bf90: f941a680     	ldr	x0, [x20, #0x348]
 462bf94: 910ca281     	add	x1, x20, #0x328
 462bf98: 976b75da     	bl	0x2109700 <_ChromeMain+0x2104464>
 462bf9c: f9419688     	ldr	x8, [x20, #0x328]
 462bfa0: f9401d08     	ldr	x8, [x8, #0x38]
 462bfa4: 910ca280     	add	x0, x20, #0x328
 462bfa8: d63f0100     	blr	x8
 462bfac: f941a288     	ldr	x8, [x20, #0x340]
 462bfb0: b4fff988     	cbz	x8, 0x462bee0 <_ChromeMain+0x4626c44>
 462bfb4: f9419688     	ldr	x8, [x20, #0x328]
 462bfb8: f9402108     	ldr	x8, [x8, #0x40]
 462bfbc: 910ca280     	add	x0, x20, #0x328
 462bfc0: d63f0100     	blr	x8
 462bfc4: f941a288     	ldr	x8, [x20, #0x340]
 462bfc8: f9400109     	ldr	x9, [x8]
 462bfcc: 7100001f     	cmp	w0, #0x0
 462bfd0: 5280020a     	mov	w10, #0x10              ; =16
 462bfd4: 5280040b     	mov	w11, #0x20              ; =32
 462bfd8: 9a8a116a     	csel	x10, x11, x10, ne
 462bfdc: f86a6929     	ldr	x9, [x9, x10]
 462bfe0: 910ca281     	add	x1, x20, #0x328
 462bfe4: aa0803e0     	mov	x0, x8
 462bfe8: d63f0120     	blr	x9
 462bfec: 17ffffbd     	b	0x462bee0 <_ChromeMain+0x4626c44>
 462bff0: d4200000     	brk	#0
 462bff4: d4400000     	hlt	#0
 462bff8: d4200020     	brk	#0x1
