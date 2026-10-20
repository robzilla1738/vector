
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46407f8: f9400028     	ldr	x8, [x1]
 46407fc: 1e270100     	fmov	s0, w8
 4640800: d360fd09     	lsr	x9, x8, #32
 4640804: 4b0403ed     	neg	w13, w4
 4640808: 2b0d0129     	adds	w9, w9, w13
 464080c: 131f7d2a     	asr	w10, w9, #31
 4640810: 5201014a     	eor	w10, w10, #0x80000000
 4640814: 1a896149     	csel	w9, w10, w9, vs
 4640818: fd400421     	ldr	d1, [x1, #0x8]
 464081c: 4e080421     	dup.2d	v1, v1[0]
 4640820: d004c7ca     	adrp	x10, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4640824: 3dc01142     	ldr	q2, [x10, #0x40]
 4640828: 6ee24421     	ushl.2d	v1, v1, v2
 464082c: 0ea12821     	xtn.2s	v1, v1
 4640830: 4e0c1d20     	mov.s	v0[1], w9
 4640834: 0ea10c01     	sqadd.2s	v1, v0, v1
 4640838: 0ea02c20     	sqsub.2s	v0, v1, v0
 464083c: 6f00e403     	movi.2d	v3, #0000000000000000
 4640840: 0ea36400     	smax.2s	v0, v0, v3
 4640844: f940004a     	ldr	x10, [x2]
 4640848: 1e270141     	fmov	s1, w10
 464084c: d360fd4b     	lsr	x11, x10, #32
 4640850: 2b0d016b     	adds	w11, w11, w13
 4640854: 131f7d6c     	asr	w12, w11, #31
 4640858: 5201018c     	eor	w12, w12, #0x80000000
 464085c: 1a8b618b     	csel	w11, w12, w11, vs
 4640860: fd400444     	ldr	d4, [x2, #0x8]
 4640864: 4e080484     	dup.2d	v4, v4[0]
 4640868: 6ee24484     	ushl.2d	v4, v4, v2
 464086c: 0ea12884     	xtn.2s	v4, v4
 4640870: 4e0c1d61     	mov.s	v1[1], w11
 4640874: 0ea40c24     	sqadd.2s	v4, v1, v4
 4640878: 0ea12c81     	sqsub.2s	v1, v4, v1
 464087c: 0ea36421     	smax.2s	v1, v1, v3
 4640880: f940006c     	ldr	x12, [x3]
 4640884: 1e270184     	fmov	s4, w12
 4640888: d360fd8e     	lsr	x14, x12, #32
 464088c: 2b0d01cd     	adds	w13, w14, w13
 4640890: 131f7dae     	asr	w14, w13, #31
 4640894: 520101ce     	eor	w14, w14, #0x80000000
 4640898: 1a8d61cd     	csel	w13, w14, w13, vs
 464089c: fd400465     	ldr	d5, [x3, #0x8]
 46408a0: 4e0804a5     	dup.2d	v5, v5[0]
 46408a4: 6ee244a2     	ushl.2d	v2, v5, v2
 46408a8: 4e0c1da4     	mov.s	v4[1], w13
 46408ac: 0ea12842     	xtn.2s	v2, v2
 46408b0: 0ea20c82     	sqadd.2s	v2, v4, v2
 46408b4: 0ea42c42     	sqsub.2s	v2, v2, v4
 46408b8: 0ea36442     	smax.2s	v2, v2, v3
 46408bc: b943800e     	ldr	w14, [x0, #0x380]
 46408c0: 6b0801df     	cmp	w14, w8
 46408c4: 54000441     	b.ne	0x464094c <_ChromeMain+0x463b6b0>
 46408c8: b943840e     	ldr	w14, [x0, #0x384]
 46408cc: 6b0901df     	cmp	w14, w9
 46408d0: 540003e1     	b.ne	0x464094c <_ChromeMain+0x463b6b0>
 46408d4: fd41c403     	ldr	d3, [x0, #0x388]
 46408d8: 2ea08c63     	cmeq.2s	v3, v3, v0
 46408dc: 0e0c3c6e     	mov.s	w14, v3[1]
 46408e0: 1e26006f     	fmov	w15, s3
 46408e4: 0a0e01ee     	and	w14, w15, w14
 46408e8: 3600032e     	tbz	w14, #0x0, 0x464094c <_ChromeMain+0x463b6b0>
 46408ec: b943900e     	ldr	w14, [x0, #0x390]
 46408f0: 6b0a01df     	cmp	w14, w10
 46408f4: 540002c1     	b.ne	0x464094c <_ChromeMain+0x463b6b0>
 46408f8: b943940e     	ldr	w14, [x0, #0x394]
 46408fc: 6b0b01df     	cmp	w14, w11
 4640900: 54000261     	b.ne	0x464094c <_ChromeMain+0x463b6b0>
 4640904: fd41cc03     	ldr	d3, [x0, #0x398]
 4640908: 2ea18c63     	cmeq.2s	v3, v3, v1
 464090c: 0e0c3c6e     	mov.s	w14, v3[1]
 4640910: 1e26006f     	fmov	w15, s3
 4640914: 0a0e01ee     	and	w14, w15, w14
 4640918: 360001ae     	tbz	w14, #0x0, 0x464094c <_ChromeMain+0x463b6b0>
 464091c: b943a00e     	ldr	w14, [x0, #0x3a0]
 4640920: 6b0c01df     	cmp	w14, w12
 4640924: 54000141     	b.ne	0x464094c <_ChromeMain+0x463b6b0>
 4640928: b943a40e     	ldr	w14, [x0, #0x3a4]
 464092c: 6b0d01df     	cmp	w14, w13
 4640930: 540000e1     	b.ne	0x464094c <_ChromeMain+0x463b6b0>
 4640934: fd41d403     	ldr	d3, [x0, #0x3a8]
 4640938: 2ea28c63     	cmeq.2s	v3, v3, v2
 464093c: 0e0c3c6e     	mov.s	w14, v3[1]
 4640940: 1e26006f     	fmov	w15, s3
 4640944: 0a0e01ee     	and	w14, w15, w14
 4640948: 3700014e     	tbnz	w14, #0x0, 0x4640970 <_ChromeMain+0x463b6d4>
 464094c: b3607d28     	bfi	x8, x9, #32, #32
 4640950: f901c008     	str	x8, [x0, #0x380]
 4640954: fd01c400     	str	d0, [x0, #0x388]
 4640958: b3607d6a     	bfi	x10, x11, #32, #32
 464095c: f901c80a     	str	x10, [x0, #0x390]
 4640960: b3607dac     	bfi	x12, x13, #32, #32
 4640964: fd01cc01     	str	d1, [x0, #0x398]
 4640968: f901d00c     	str	x12, [x0, #0x3a0]
 464096c: fd01d402     	str	d2, [x0, #0x3a8]
 4640970: d65f03c0     	ret
