
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464c280: d10103ff     	sub	sp, sp, #0x40
 464c284: a90157f6     	stp	x22, x21, [sp, #0x10]
 464c288: a9024ff4     	stp	x20, x19, [sp, #0x20]
 464c28c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 464c290: 9100c3fd     	add	x29, sp, #0x30
 464c294: f9401414     	ldr	x20, [x0, #0x28]
 464c298: b4000914     	cbz	x20, 0x464c3b8 <_ChromeMain+0x464711c>
 464c29c: aa0103f3     	mov	x19, x1
 464c2a0: b40008c1     	cbz	x1, 0x464c3b8 <_ChromeMain+0x464711c>
 464c2a4: 39472288     	ldrb	w8, [x20, #0x1c8]
 464c2a8: 36000888     	tbz	w8, #0x0, 0x464c3b8 <_ChromeMain+0x464711c>
 464c2ac: f940c680     	ldr	x0, [x20, #0x188]
 464c2b0: b4000840     	cbz	x0, 0x464c3b8 <_ChromeMain+0x464711c>
 464c2b4: f9400008     	ldr	x8, [x0]
 464c2b8: f9405508     	ldr	x8, [x8, #0xa8]
 464c2bc: d63f0100     	blr	x8
 464c2c0: 340007c0     	cbz	w0, 0x464c3b8 <_ChromeMain+0x464711c>
 464c2c4: b9400a68     	ldr	w8, [x19, #0x8]
 464c2c8: 321f0108     	orr	w8, w8, #0x2
 464c2cc: 71000d1f     	cmp	w8, #0x3
 464c2d0: 54000741     	b.ne	0x464c3b8 <_ChromeMain+0x464711c>
 464c2d4: b9409a75     	ldr	w21, [x19, #0x98]
 464c2d8: 721206bf     	tst	w21, #0xc000
 464c2dc: 540006e0     	b.eq	0x464c3b8 <_ChromeMain+0x464711c>
 464c2e0: 2d520660     	ldp	s0, s1, [x19, #0x90]
 464c2e4: 1e254000     	frintm	s0, s0
 464c2e8: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 464c2ec: 1e222000     	fcmp	s0, s2
 464c2f0: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 464c2f4: 1a88b3e9     	csel	w9, wzr, w8, lt
 464c2f8: 1e226803     	fmaxnm	s3, s0, s2
 464c2fc: 1e38006a     	fcvtzs	w10, s3
 464c300: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 464c304: 1e270163     	fmov	s3, w11
 464c308: 1e232000     	fcmp	s0, s3
 464c30c: 1a899149     	csel	w9, w10, w9, ls
 464c310: 1e254020     	frintm	s0, s1
 464c314: 1e222000     	fcmp	s0, s2
 464c318: 1a88b3e8     	csel	w8, wzr, w8, lt
 464c31c: 1e226801     	fmaxnm	s1, s0, s2
 464c320: 1e38002a     	fcvtzs	w10, s1
 464c324: 1e232000     	fcmp	s0, s3
 464c328: 1a889148     	csel	w8, w10, w8, ls
 464c32c: aa088128     	orr	x8, x9, x8, lsl #32
 464c330: f90007e8     	str	x8, [sp, #0x8]
 464c334: 910023e2     	add	x2, sp, #0x8
 464c338: aa1403e0     	mov	x0, x20
 464c33c: d2800001     	mov	x1, #0x0                ; =0
 464c340: 97f68f81     	bl	0x43f0144 <_ChromeMain+0x43eaea8>
 464c344: f940e288     	ldr	x8, [x20, #0x1c0]
 464c348: 29412be9     	ldp	w9, w10, [sp, #0x8]
 464c34c: 2a0a012b     	orr	w11, w9, w10
 464c350: 3100057f     	cmn	w11, #0x1
 464c354: d360fd0b     	lsr	x11, x8, #32
 464c358: 7a4bc140     	ccmp	w10, w11, #0x0, gt
 464c35c: 7a48b120     	ccmp	w9, w8, #0x0, lt
 464c360: 540002ca     	b.ge	0x464c3b8 <_ChromeMain+0x464711c>
 464c364: 39418268     	ldrb	w8, [x19, #0x60]
 464c368: 360004c8     	tbz	w8, #0x0, 0x464c400 <_ChromeMain+0x4647164>
 464c36c: b9407668     	ldr	w8, [x19, #0x74]
 464c370: 32000508     	orr	w8, w8, #0x3
 464c374: b9007668     	str	w8, [x19, #0x74]
 464c378: b9400a68     	ldr	w8, [x19, #0x8]
 464c37c: 7100051f     	cmp	w8, #0x1
 464c380: 54000120     	b.eq	0x464c3a4 <_ChromeMain+0x4647108>
 464c384: f9422e88     	ldr	x8, [x20, #0x458]
 464c388: b40000e8     	cbz	x8, 0x464c3a4 <_ChromeMain+0x4647108>
 464c38c: f9429d08     	ldr	x8, [x8, #0x538]
 464c390: b40000a8     	cbz	x8, 0x464c3a4 <_ChromeMain+0x4647108>
 464c394: f9403508     	ldr	x8, [x8, #0x68]
 464c398: b4000068     	cbz	x8, 0x464c3a4 <_ChromeMain+0x4647108>
 464c39c: 39412108     	ldrb	w8, [x8, #0x48]
 464c3a0: 36000168     	tbz	w8, #0x0, 0x464c3cc <_ChromeMain+0x4647130>
 464c3a4: 39418268     	ldrb	w8, [x19, #0x60]
 464c3a8: 36000328     	tbz	w8, #0x0, 0x464c40c <_ChromeMain+0x4647170>
 464c3ac: b9407668     	ldr	w8, [x19, #0x74]
 464c3b0: 32000508     	orr	w8, w8, #0x3
 464c3b4: b9007668     	str	w8, [x19, #0x74]
 464c3b8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 464c3bc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 464c3c0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 464c3c4: 910103ff     	add	sp, sp, #0x40
 464c3c8: d65f03c0     	ret
 464c3cc: 39686688     	ldrb	w8, [x20, #0xa19]
 464c3d0: 3707fea8     	tbnz	w8, #0x0, 0x464c3a4 <_ChromeMain+0x4647108>
 464c3d4: aa1403e0     	mov	x0, x20
 464c3d8: 94001540     	bl	0x46518d8 <_ChromeMain+0x464c63c>
 464c3dc: f9400408     	ldr	x8, [x0, #0x8]
 464c3e0: f100091f     	cmp	x8, #0x2
 464c3e4: 54fffe03     	b.lo	0x464c3a4 <_ChromeMain+0x4647108>
 464c3e8: 721202bf     	tst	w21, #0x4000
 464c3ec: 52800028     	mov	w8, #0x1                ; =1
 464c3f0: 5a880501     	cneg	w1, w8, ne
 464c3f4: aa1403e0     	mov	x0, x20
 464c3f8: 94002d73     	bl	0x46579c4 <_ChromeMain+0x4652728>
 464c3fc: 17ffffea     	b	0x464c3a4 <_ChromeMain+0x4647108>
 464c400: d4200000     	brk	#0
 464c404: d4400000     	hlt	#0
 464c408: d4200020     	brk	#0x1
 464c40c: d4200000     	brk	#0
 464c410: d4400000     	hlt	#0
 464c414: d4200020     	brk	#0x1
 464c418: d100c3ff     	sub	sp, sp, #0x30
 464c41c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 464c420: a9027bfd     	stp	x29, x30, [sp, #0x20]
 464c424: 910083fd     	add	x29, sp, #0x20
 464c428: b40006e1     	cbz	x1, 0x464c504 <_ChromeMain+0x4647268>
 464c42c: aa0003f4     	mov	x20, x0
 464c430: f9401400     	ldr	x0, [x0, #0x28]
 464c434: b4000680     	cbz	x0, 0x464c504 <_ChromeMain+0x4647268>
 464c438: aa0103f3     	mov	x19, x1
 464c43c: 94000041     	bl	0x464c540 <_ChromeMain+0x46472a4>
 464c440: 34000620     	cbz	w0, 0x464c504 <_ChromeMain+0x4647268>
 464c444: f9401680     	ldr	x0, [x20, #0x28]
 464c448: 39686008     	ldrb	w8, [x0, #0xa18]
 464c44c: 370004c8     	tbnz	w8, #0x0, 0x464c4e4 <_ChromeMain+0x4647248>
 464c450: 39686408     	ldrb	w8, [x0, #0xa19]
 464c454: 37000488     	tbnz	w8, #0x0, 0x464c4e4 <_ChromeMain+0x4647248>
 464c458: 2d520660     	ldp	s0, s1, [x19, #0x90]
 464c45c: 1e254000     	frintm	s0, s0
 464c460: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 464c464: 1e222000     	fcmp	s0, s2
 464c468: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 464c46c: 1a88b3e9     	csel	w9, wzr, w8, lt
 464c470: 1e226803     	fmaxnm	s3, s0, s2
 464c474: 1e38006a     	fcvtzs	w10, s3
 464c478: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 464c47c: 1e270163     	fmov	s3, w11
 464c480: 1e232000     	fcmp	s0, s3
 464c484: 1a899149     	csel	w9, w10, w9, ls
 464c488: 1e254020     	frintm	s0, s1
 464c48c: 1e222000     	fcmp	s0, s2
 464c490: 1a88b3e8     	csel	w8, wzr, w8, lt
 464c494: 1e226801     	fmaxnm	s1, s0, s2
 464c498: 1e38002a     	fcvtzs	w10, s1
 464c49c: 1e232000     	fcmp	s0, s3
 464c4a0: 1a889148     	csel	w8, w10, w8, ls
 464c4a4: aa088128     	orr	x8, x9, x8, lsl #32
 464c4a8: f90007e8     	str	x8, [sp, #0x8]
 464c4ac: 910023e2     	add	x2, sp, #0x8
 464c4b0: d2800001     	mov	x1, #0x0                ; =0
 464c4b4: 97f68f24     	bl	0x43f0144 <_ChromeMain+0x43eaea8>
 464c4b8: b9400be9     	ldr	w9, [sp, #0x8]
 464c4bc: 37f80249     	tbnz	w9, #0x1f, 0x464c504 <_ChromeMain+0x4647268>
 464c4c0: f9401680     	ldr	x0, [x20, #0x28]
 464c4c4: f940e008     	ldr	x8, [x0, #0x1c0]
 464c4c8: 6b08013f     	cmp	w9, w8
 464c4cc: 540001ca     	b.ge	0x464c504 <_ChromeMain+0x4647268>
 464c4d0: b9400fe9     	ldr	w9, [sp, #0xc]
 464c4d4: 37f80189     	tbnz	w9, #0x1f, 0x464c504 <_ChromeMain+0x4647268>
 464c4d8: d360fd08     	lsr	x8, x8, #32
 464c4dc: 6b08013f     	cmp	w9, w8
 464c4e0: 5400012a     	b.ge	0x464c504 <_ChromeMain+0x4647268>
 464c4e4: aa1303e1     	mov	x1, x19
 464c4e8: 940000a6     	bl	0x464c780 <_ChromeMain+0x46474e4>
 464c4ec: 340000c0     	cbz	w0, 0x464c504 <_ChromeMain+0x4647268>
 464c4f0: 39418268     	ldrb	w8, [x19, #0x60]
 464c4f4: 36000108     	tbz	w8, #0x0, 0x464c514 <_ChromeMain+0x4647278>
 464c4f8: b9407668     	ldr	w8, [x19, #0x74]
 464c4fc: 32000508     	orr	w8, w8, #0x3
 464c500: b9007668     	str	w8, [x19, #0x74]
 464c504: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 464c508: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 464c50c: 9100c3ff     	add	sp, sp, #0x30
 464c510: d65f03c0     	ret
 464c514: d4200000     	brk	#0
 464c518: d4400000     	hlt	#0
 464c51c: d4200020     	brk	#0x1
 464c520: d503201f     	nop
 464c524: d503201f     	nop
 464c528: d503201f     	nop
 464c52c: d503201f     	nop
 464c530: d503201f     	nop
 464c534: d503201f     	nop
 464c538: d503201f     	nop
 464c53c: d503201f     	nop
 464c540: 39472008     	ldrb	w8, [x0, #0x1c8]
 464c544: 34000548     	cbz	w8, 0x464c5ec <_ChromeMain+0x4647350>
 464c548: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 464c54c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 464c550: a9027bfd     	stp	x29, x30, [sp, #0x20]
 464c554: 910083fd     	add	x29, sp, #0x20
 464c558: aa0003f4     	mov	x20, x0
 464c55c: f940c400     	ldr	x0, [x0, #0x188]
 464c560: b40003e0     	cbz	x0, 0x464c5dc <_ChromeMain+0x4647340>
 464c564: aa0103f3     	mov	x19, x1
 464c568: f9400008     	ldr	x8, [x0]
 464c56c: f9405508     	ldr	x8, [x8, #0xa8]
 464c570: d63f0100     	blr	x8
 464c574: 34000340     	cbz	w0, 0x464c5dc <_ChromeMain+0x4647340>
 464c578: f9442695     	ldr	x21, [x20, #0x848]
 464c57c: d0052ae0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 464c580: 9118e000     	add	x0, x0, #0x638
 464c584: 96eb333f     	bl	0x119280 <_ChromeMain+0x113fe4>
 464c588: 370000a0     	tbnz	w0, #0x0, 0x464c59c <_ChromeMain+0x4647300>
 464c58c: d0052ae0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 464c590: 91192000     	add	x0, x0, #0x648
 464c594: 96eb333b     	bl	0x119280 <_ChromeMain+0x113fe4>
 464c598: 34000220     	cbz	w0, 0x464c5dc <_ChromeMain+0x4647340>
 464c59c: 394782a8     	ldrb	w8, [x21, #0x1e0]
 464c5a0: 340001c8     	cbz	w8, 0x464c5d8 <_ChromeMain+0x464733c>
 464c5a4: f9422e88     	ldr	x8, [x20, #0x458]
 464c5a8: b4000188     	cbz	x8, 0x464c5d8 <_ChromeMain+0x464733c>
 464c5ac: f9429d08     	ldr	x8, [x8, #0x538]
 464c5b0: b4000148     	cbz	x8, 0x464c5d8 <_ChromeMain+0x464733c>
 464c5b4: f9403508     	ldr	x8, [x8, #0x68]
 464c5b8: b4000108     	cbz	x8, 0x464c5d8 <_ChromeMain+0x464733c>
 464c5bc: 52800000     	mov	w0, #0x0                ; =0
 464c5c0: b40000f3     	cbz	x19, 0x464c5dc <_ChromeMain+0x4647340>
 464c5c4: 39412108     	ldrb	w8, [x8, #0x48]
 464c5c8: 370000a8     	tbnz	w8, #0x0, 0x464c5dc <_ChromeMain+0x4647340>
 464c5cc: b9400a68     	ldr	w8, [x19, #0x8]
 464c5d0: 71008d1f     	cmp	w8, #0x23
 464c5d4: 54000100     	b.eq	0x464c5f4 <_ChromeMain+0x4647358>
 464c5d8: 52800000     	mov	w0, #0x0                ; =0
 464c5dc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 464c5e0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 464c5e4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 464c5e8: d65f03c0     	ret
 464c5ec: 52800000     	mov	w0, #0x0                ; =0
 464c5f0: d65f03c0     	ret
 464c5f4: f9442688     	ldr	x8, [x20, #0x848]
 464c5f8: 39424108     	ldrb	w8, [x8, #0x90]
 464c5fc: 340000a8     	cbz	w8, 0x464c610 <_ChromeMain+0x4647374>
 464c600: 39682289     	ldrb	w9, [x20, #0xa08]
 464c604: 37000269     	tbnz	w9, #0x0, 0x464c650 <_ChromeMain+0x46473b4>
 464c608: 39683289     	ldrb	w9, [x20, #0xa0c]
 464c60c: 37000229     	tbnz	w9, #0x0, 0x464c650 <_ChromeMain+0x46473b4>
 464c610: 3973828a     	ldrb	w10, [x20, #0xce0]
 464c614: 397de289     	ldrb	w9, [x20, #0xf78]
 464c618: 3700008a     	tbnz	w10, #0x0, 0x464c628 <_ChromeMain+0x464738c>
 464c61c: 37000089     	tbnz	w9, #0x0, 0x464c62c <_ChromeMain+0x4647390>
 464c620: 3707fdc8     	tbnz	w8, #0x0, 0x464c5d8 <_ChromeMain+0x464733c>
 464c624: 1400000b     	b	0x464c650 <_ChromeMain+0x46473b4>
 464c628: 34000729     	cbz	w9, 0x464c70c <_ChromeMain+0x4647470>
 464c62c: b941c288     	ldr	w8, [x20, #0x1c0]
 464c630: aa0803e9     	mov	x9, x8
 464c634: 6b08013f     	cmp	w9, w8
 464c638: 1a88b12a     	csel	w10, w9, w8, lt
 464c63c: d503201f     	nop
 464c640: 7100011f     	cmp	w8, #0x0
 464c644: 1a89c148     	csel	w8, w10, w9, gt
 464c648: 71025d1f     	cmp	w8, #0x97
 464c64c: 54fffc6b     	b.lt	0x464c5d8 <_ChromeMain+0x464733c>
 464c650: 39686288     	ldrb	w8, [x20, #0xa18]
 464c654: 37000068     	tbnz	w8, #0x0, 0x464c660 <_ChromeMain+0x46473c4>
 464c658: 39686688     	ldrb	w8, [x20, #0xa19]
 464c65c: 36000068     	tbz	w8, #0x0, 0x464c668 <_ChromeMain+0x46473cc>
 464c660: 52800020     	mov	w0, #0x1                ; =1
 464c664: 17ffffde     	b	0x464c5dc <_ChromeMain+0x4647340>
 464c668: f942da88     	ldr	x8, [x20, #0x5b0]
 464c66c: b40001a8     	cbz	x8, 0x464c6a0 <_ChromeMain+0x4647404>
 464c670: 3952b109     	ldrb	w9, [x8, #0x4ac]
 464c674: 34000169     	cbz	w9, 0x464c6a0 <_ChromeMain+0x4647404>
 464c678: b944a108     	ldr	w8, [x8, #0x4a0]
 464c67c: 7100051f     	cmp	w8, #0x1
 464c680: 54000101     	b.ne	0x464c6a0 <_ChromeMain+0x4647404>
 464c684: b940fa68     	ldr	w8, [x19, #0xf8]
 464c688: 7100051f     	cmp	w8, #0x1
 464c68c: 540000a0     	b.eq	0x464c6a0 <_ChromeMain+0x4647404>
 464c690: 35fffa48     	cbnz	w8, 0x464c5d8 <_ChromeMain+0x464733c>
 464c694: b940f668     	ldr	w8, [x19, #0xf4]
 464c698: 7100091f     	cmp	w8, #0x2
 464c69c: 54fff9e1     	b.ne	0x464c5d8 <_ChromeMain+0x464733c>
 464c6a0: 295ea668     	ldp	w8, w9, [x19, #0xf4]
 464c6a4: 340000e8     	cbz	w8, 0x464c6c0 <_ChromeMain+0x4647424>
 464c6a8: 7100053f     	cmp	w9, #0x1
 464c6ac: 540000e0     	b.eq	0x464c6c8 <_ChromeMain+0x464742c>
 464c6b0: 35fff949     	cbnz	w9, 0x464c5d8 <_ChromeMain+0x464733c>
 464c6b4: 7100091f     	cmp	w8, #0x2
 464c6b8: 54fff901     	b.ne	0x464c5d8 <_ChromeMain+0x464733c>
 464c6bc: 14000003     	b	0x464c6c8 <_ChromeMain+0x464742c>
 464c6c0: 71000d3f     	cmp	w9, #0x3
 464c6c4: 54fff8a0     	b.eq	0x464c5d8 <_ChromeMain+0x464733c>
 464c6c8: bd40e260     	ldr	s0, [x19, #0xe0]
 464c6cc: 1e202008     	fcmp	s0, #0.0
 464c6d0: 54000041     	b.ne	0x464c6d8 <_ChromeMain+0x464743c>
 464c6d4: bd40ea60     	ldr	s0, [x19, #0xe8]
 464c6d8: bd40e661     	ldr	s1, [x19, #0xe4]
 464c6dc: 1e202028     	fcmp	s1, #0.0
 464c6e0: 54000041     	b.ne	0x464c6e8 <_ChromeMain+0x464744c>
 464c6e4: bd40ee61     	ldr	s1, [x19, #0xec]
 464c6e8: 1e20c000     	fabs	s0, s0
 464c6ec: 1e20c021     	fabs	s1, s1
 464c6f0: 1e2f1002     	fmov	s2, #1.50000000
 464c6f4: 1e220821     	fmul	s1, s1, s2
 464c6f8: 1e2e1002     	fmov	s2, #1.00000000
 464c6fc: 1e226821     	fmaxnm	s1, s1, s2
 464c700: 1e212000     	fcmp	s0, s1
 464c704: 1a9fd7e0     	cset	w0, gt
 464c708: 17ffffb5     	b	0x464c5dc <_ChromeMain+0x4647340>
 464c70c: 3974a288     	ldrb	w8, [x20, #0xd28]
 464c710: 350000c8     	cbnz	w8, 0x464c728 <_ChromeMain+0x464748c>
 464c714: fd46a280     	ldr	d0, [x20, #0xd40]
 464c718: 1e6e1001     	fmov	d1, #1.00000000
 464c71c: 1e612000     	fcmp	d0, d1
 464c720: 1a9f17e8     	cset	w8, eq
 464c724: 14000005     	b	0x464c738 <_ChromeMain+0x464749c>
 464c728: b94d2688     	ldr	w8, [x20, #0xd24]
 464c72c: 7100011f     	cmp	w8, #0x0
 464c730: 1a9f17e8     	cset	w8, eq
 464c734: fd46a280     	ldr	d0, [x20, #0xd40]
 464c738: b0021da9     	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 464c73c: 912db129     	add	x9, x9, #0xb6c
 464c740: 90ff7b8a     	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 464c744: 9103514a     	add	x10, x10, #0xd4
 464c748: 7100011f     	cmp	w8, #0x0
 464c74c: 9a891148     	csel	x8, x10, x9, ne
 464c750: b948ca89     	ldr	w9, [x20, #0x8c8]
 464c754: 1e620121     	scvtf	d1, w9
 464c758: 1e610800     	fmul	d0, d0, d1
 464c75c: d63f0100     	blr	x8
 464c760: 1e780009     	fcvtzs	w9, d0
 464c764: b941c288     	ldr	w8, [x20, #0x1c0]
 464c768: 17ffffb3     	b	0x464c634 <_ChromeMain+0x4647398>
 464c76c: d503201f     	nop
 464c770: d503201f     	nop
 464c774: d503201f     	nop
 464c778: d503201f     	nop
 464c77c: d503201f     	nop
 464c780: d101c3ff     	sub	sp, sp, #0x70
 464c784: 6d0223e9     	stp	d9, d8, [sp, #0x20]
 464c788: a9035ff8     	stp	x24, x23, [sp, #0x30]
 464c78c: a90457f6     	stp	x22, x21, [sp, #0x40]
 464c790: a9054ff4     	stp	x20, x19, [sp, #0x50]
 464c794: a9067bfd     	stp	x29, x30, [sp, #0x60]
 464c798: 910183fd     	add	x29, sp, #0x60
 464c79c: aa0003f3     	mov	x19, x0
 464c7a0: f9422c08     	ldr	x8, [x0, #0x458]
 464c7a4: b4000188     	cbz	x8, 0x464c7d4 <_ChromeMain+0x4647538>
 464c7a8: f9429d08     	ldr	x8, [x8, #0x538]
 464c7ac: b4000148     	cbz	x8, 0x464c7d4 <_ChromeMain+0x4647538>
 464c7b0: f9403508     	ldr	x8, [x8, #0x68]
 464c7b4: b4000108     	cbz	x8, 0x464c7d4 <_ChromeMain+0x4647538>
 464c7b8: aa0103f4     	mov	x20, x1
 464c7bc: b40000c1     	cbz	x1, 0x464c7d4 <_ChromeMain+0x4647538>
 464c7c0: 39412108     	ldrb	w8, [x8, #0x48]
 464c7c4: 37000088     	tbnz	w8, #0x0, 0x464c7d4 <_ChromeMain+0x4647538>
 464c7c8: b9400a88     	ldr	w8, [x20, #0x8]
 464c7cc: 71008d1f     	cmp	w8, #0x23
 464c7d0: 54000260     	b.eq	0x464c81c <_ChromeMain+0x4647580>
 464c7d4: 52800000     	mov	w0, #0x0                ; =0
 464c7d8: 3928627f     	strb	wzr, [x19, #0xa18]
 464c7dc: f9050a7f     	str	xzr, [x19, #0xa10]
 464c7e0: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 464c7e4: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 464c7e8: a94457f6     	ldp	x22, x21, [sp, #0x40]
 464c7ec: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 464c7f0: 6d4223e9     	ldp	d9, d8, [sp, #0x20]
 464c7f4: 9101c3ff     	add	sp, sp, #0x70
 464c7f8: d65f03c0     	ret
 464c7fc: b940f688     	ldr	w8, [x20, #0xf4]
 464c800: 34000ae8     	cbz	w8, 0x464c95c <_ChromeMain+0x46476c0>
 464c804: 39686268     	ldrb	w8, [x19, #0xa18]
 464c808: 34000e28     	cbz	w8, 0x464c9cc <_ChromeMain+0x4647730>
 464c80c: aa1303e0     	mov	x0, x19
 464c810: 94002b58     	bl	0x4657570 <_ChromeMain+0x46522d4>
 464c814: 52800020     	mov	w0, #0x1                ; =1
 464c818: 17fffff2     	b	0x464c7e0 <_ChromeMain+0x4647544>
 464c81c: f9442668     	ldr	x8, [x19, #0x848]
 464c820: 39424108     	ldrb	w8, [x8, #0x90]
 464c824: 340000a8     	cbz	w8, 0x464c838 <_ChromeMain+0x464759c>
 464c828: 39682269     	ldrb	w9, [x19, #0xa08]
 464c82c: 37000249     	tbnz	w9, #0x0, 0x464c874 <_ChromeMain+0x46475d8>
 464c830: 39683269     	ldrb	w9, [x19, #0xa0c]
 464c834: 37000209     	tbnz	w9, #0x0, 0x464c874 <_ChromeMain+0x46475d8>
 464c838: 3973826a     	ldrb	w10, [x19, #0xce0]
 464c83c: 397de269     	ldrb	w9, [x19, #0xf78]
 464c840: 3700008a     	tbnz	w10, #0x0, 0x464c850 <_ChromeMain+0x46475b4>
 464c844: 37000089     	tbnz	w9, #0x0, 0x464c854 <_ChromeMain+0x46475b8>
 464c848: 35fffc68     	cbnz	w8, 0x464c7d4 <_ChromeMain+0x4647538>
 464c84c: 1400000a     	b	0x464c874 <_ChromeMain+0x46475d8>
 464c850: 34000409     	cbz	w9, 0x464c8d0 <_ChromeMain+0x4647634>
 464c854: b941c268     	ldr	w8, [x19, #0x1c0]
 464c858: aa0803e9     	mov	x9, x8
 464c85c: 6b08013f     	cmp	w9, w8
 464c860: 1a88b12a     	csel	w10, w9, w8, lt
 464c864: 7100011f     	cmp	w8, #0x0
 464c868: 1a89c148     	csel	w8, w10, w9, gt
 464c86c: 71025d1f     	cmp	w8, #0x97
 464c870: 54fffb2b     	b.lt	0x464c7d4 <_ChromeMain+0x4647538>
 464c874: 39686668     	ldrb	w8, [x19, #0xa19]
 464c878: 3707fce8     	tbnz	w8, #0x0, 0x464c814 <_ChromeMain+0x4647578>
 464c87c: b940fa88     	ldr	w8, [x20, #0xf8]
 464c880: 7100051f     	cmp	w8, #0x1
 464c884: 540000c0     	b.eq	0x464c89c <_ChromeMain+0x4647600>
 464c888: 35fffba8     	cbnz	w8, 0x464c7fc <_ChromeMain+0x4647560>
 464c88c: b940f688     	ldr	w8, [x20, #0xf4]
 464c890: 34000668     	cbz	w8, 0x464c95c <_ChromeMain+0x46476c0>
 464c894: 7100091f     	cmp	w8, #0x2
 464c898: 54fffb61     	b.ne	0x464c804 <_ChromeMain+0x4647568>
 464c89c: 3975a268     	ldrb	w8, [x19, #0xd68]
 464c8a0: 35001988     	cbnz	w8, 0x464cbd0 <_ChromeMain+0x4647934>
 464c8a4: 3977c268     	ldrb	w8, [x19, #0xdf0]
 464c8a8: 35001c68     	cbnz	w8, 0x464cc34 <_ChromeMain+0x4647998>
 464c8ac: f9422e68     	ldr	x8, [x19, #0x458]
 464c8b0: b4000508     	cbz	x8, 0x464c950 <_ChromeMain+0x46476b4>
 464c8b4: f9432509     	ldr	x9, [x8, #0x648]
 464c8b8: b40003c9     	cbz	x9, 0x464c930 <_ChromeMain+0x4647694>
 464c8bc: f941d92a     	ldr	x10, [x9, #0x3b0]
 464c8c0: d37df155     	lsl	x21, x10, #3
 464c8c4: b4000375     	cbz	x21, 0x464c930 <_ChromeMain+0x4647694>
 464c8c8: f941d536     	ldr	x22, [x9, #0x3a8]
 464c8cc: 14000075     	b	0x464caa0 <_ChromeMain+0x4647804>
 464c8d0: 3974a268     	ldrb	w8, [x19, #0xd28]
 464c8d4: 350000c8     	cbnz	w8, 0x464c8ec <_ChromeMain+0x4647650>
 464c8d8: fd46a260     	ldr	d0, [x19, #0xd40]
 464c8dc: 1e6e1001     	fmov	d1, #1.00000000
 464c8e0: 1e612000     	fcmp	d0, d1
 464c8e4: 1a9f17e8     	cset	w8, eq
 464c8e8: 14000005     	b	0x464c8fc <_ChromeMain+0x4647660>
 464c8ec: b94d2668     	ldr	w8, [x19, #0xd24]
 464c8f0: 7100011f     	cmp	w8, #0x0
 464c8f4: 1a9f17e8     	cset	w8, eq
 464c8f8: fd46a260     	ldr	d0, [x19, #0xd40]
 464c8fc: b0021da9     	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 464c900: 912db129     	add	x9, x9, #0xb6c
 464c904: 90ff7b8a     	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 464c908: 9103514a     	add	x10, x10, #0xd4
 464c90c: 7100011f     	cmp	w8, #0x0
 464c910: 9a891148     	csel	x8, x10, x9, ne
 464c914: b948ca69     	ldr	w9, [x19, #0x8c8]
 464c918: 1e620121     	scvtf	d1, w9
 464c91c: 1e610800     	fmul	d0, d0, d1
 464c920: d63f0100     	blr	x8
 464c924: 1e780009     	fcvtzs	w9, d0
 464c928: b941c268     	ldr	w8, [x19, #0x1c0]
 464c92c: 17ffffcc     	b	0x464c85c <_ChromeMain+0x46475c0>
 464c930: 39286a7f     	strb	wzr, [x19, #0xa1a]
 464c934: f9432508     	ldr	x8, [x8, #0x648]
 464c938: b40000e8     	cbz	x8, 0x464c954 <_ChromeMain+0x46476b8>
 464c93c: f941d909     	ldr	x9, [x8, #0x3b0]
 464c940: d37df135     	lsl	x21, x9, #3
 464c944: b4000095     	cbz	x21, 0x464c954 <_ChromeMain+0x46476b8>
 464c948: f941d516     	ldr	x22, [x8, #0x3a8]
 464c94c: 1400004c     	b	0x464ca7c <_ChromeMain+0x46477e0>
 464c950: 39286a7f     	strb	wzr, [x19, #0xa1a]
 464c954: 3928627f     	strb	wzr, [x19, #0xa18]
 464c958: f9050a7f     	str	xzr, [x19, #0xa10]
 464c95c: bd40e288     	ldr	s8, [x20, #0xe0]
 464c960: 1e202108     	fcmp	s8, #0.0
 464c964: 54000041     	b.ne	0x464c96c <_ChromeMain+0x46476d0>
 464c968: bd40ea88     	ldr	s8, [x20, #0xe8]
 464c96c: bd40e689     	ldr	s9, [x20, #0xe4]
 464c970: 1e202128     	fcmp	s9, #0.0
 464c974: 54000041     	b.ne	0x464c97c <_ChromeMain+0x46476e0>
 464c978: bd40ee89     	ldr	s9, [x20, #0xec]
 464c97c: 39686268     	ldrb	w8, [x19, #0xa18]
 464c980: 340000e8     	cbz	w8, 0x464c99c <_ChromeMain+0x4647700>
 464c984: 1e202128     	fcmp	s9, #0.0
 464c988: 540000a1     	b.ne	0x464c99c <_ChromeMain+0x4647700>
 464c98c: b940fa89     	ldr	w9, [x20, #0xf8]
 464c990: 1e202108     	fcmp	s8, #0.0
 464c994: 7a400920     	ccmp	w9, #0x0, #0x0, eq
 464c998: 54fff3a0     	b.eq	0x464c80c <_ChromeMain+0x4647570>
 464c99c: 1e20c100     	fabs	s0, s8
 464c9a0: 1e20c121     	fabs	s1, s9
 464c9a4: 1e2f1002     	fmov	s2, #1.50000000
 464c9a8: 1e220821     	fmul	s1, s1, s2
 464c9ac: 1e2e1002     	fmov	s2, #1.00000000
 464c9b0: 1e226821     	fmaxnm	s1, s1, s2
 464c9b4: 1e212000     	fcmp	s0, s1
 464c9b8: 540000ec     	b.gt	0x464c9d4 <_ChromeMain+0x4647738>
 464c9bc: 370000c8     	tbnz	w8, #0x0, 0x464c9d4 <_ChromeMain+0x4647738>
 464c9c0: b940fa88     	ldr	w8, [x20, #0xf8]
 464c9c4: 71000d1f     	cmp	w8, #0x3
 464c9c8: 54fff060     	b.eq	0x464c7d4 <_ChromeMain+0x4647538>
 464c9cc: 52800000     	mov	w0, #0x0                ; =0
 464c9d0: 17ffff84     	b	0x464c7e0 <_ChromeMain+0x4647544>
 464c9d4: aa1303e0     	mov	x0, x19
 464c9d8: 940013c0     	bl	0x46518d8 <_ChromeMain+0x464c63c>
 464c9dc: f9400408     	ldr	x8, [x0, #0x8]
 464c9e0: f100051f     	cmp	x8, #0x1
 464c9e4: 54ffef89     	b.ls	0x464c7d4 <_ChromeMain+0x4647538>
 464c9e8: 39686268     	ldrb	w8, [x19, #0xa18]
 464c9ec: 370006c8     	tbnz	w8, #0x0, 0x464cac4 <_ChromeMain+0x4647828>
 464c9f0: 3975a268     	ldrb	w8, [x19, #0xd68]
 464c9f4: 35001528     	cbnz	w8, 0x464cc98 <_ChromeMain+0x46479fc>
 464c9f8: 2f00e400     	movi	d0, #0000000000000000
 464c9fc: fd050a60     	str	d0, [x19, #0xa10]
 464ca00: f9422e68     	ldr	x8, [x19, #0x458]
 464ca04: b4000608     	cbz	x8, 0x464cac4 <_ChromeMain+0x4647828>
 464ca08: f9432508     	ldr	x8, [x8, #0x648]
 464ca0c: b40005c8     	cbz	x8, 0x464cac4 <_ChromeMain+0x4647828>
 464ca10: f941d909     	ldr	x9, [x8, #0x3b0]
 464ca14: d37df136     	lsl	x22, x9, #3
 464ca18: b4000576     	cbz	x22, 0x464cac4 <_ChromeMain+0x4647828>
 464ca1c: f941d517     	ldr	x23, [x8, #0x3a8]
 464ca20: 14000006     	b	0x464ca38 <_ChromeMain+0x464779c>
 464ca24: aa1503e0     	mov	x0, x21
 464ca28: 97fe09a7     	bl	0x45cf0c4 <_ChromeMain+0x45c9e28>
 464ca2c: 910022f7     	add	x23, x23, #0x8
 464ca30: f10022d6     	subs	x22, x22, #0x8
 464ca34: 54000480     	b.eq	0x464cac4 <_ChromeMain+0x4647828>
 464ca38: f94002e8     	ldr	x8, [x23]
 464ca3c: b4ffff88     	cbz	x8, 0x464ca2c <_ChromeMain+0x4647790>
 464ca40: f941b915     	ldr	x21, [x8, #0x370]
 464ca44: b4ffff55     	cbz	x21, 0x464ca2c <_ChromeMain+0x4647790>
 464ca48: f94002a8     	ldr	x8, [x21]
 464ca4c: f9405508     	ldr	x8, [x8, #0xa8]
 464ca50: aa1503e0     	mov	x0, x21
 464ca54: d63f0100     	blr	x8
 464ca58: 34fffe60     	cbz	w0, 0x464ca24 <_ChromeMain+0x4647788>
 464ca5c: aa1503e0     	mov	x0, x21
 464ca60: 97fe0925     	bl	0x45ceef4 <_ChromeMain+0x45c9c58>
 464ca64: 17fffff2     	b	0x464ca2c <_ChromeMain+0x4647790>
 464ca68: 1e2e1000     	fmov	s0, #1.00000000
 464ca6c: 97fe09f5     	bl	0x45cf240 <_ChromeMain+0x45c9fa4>
 464ca70: 910022d6     	add	x22, x22, #0x8
 464ca74: f10022b5     	subs	x21, x21, #0x8
 464ca78: 54fff6e0     	b.eq	0x464c954 <_ChromeMain+0x46476b8>
 464ca7c: f94002c8     	ldr	x8, [x22]
 464ca80: b4ffff88     	cbz	x8, 0x464ca70 <_ChromeMain+0x46477d4>
 464ca84: f941b900     	ldr	x0, [x8, #0x370]
 464ca88: b4ffff40     	cbz	x0, 0x464ca70 <_ChromeMain+0x46477d4>
 464ca8c: 17fffff7     	b	0x464ca68 <_ChromeMain+0x46477cc>
 464ca90: 97fe098d     	bl	0x45cf0c4 <_ChromeMain+0x45c9e28>
 464ca94: 910022d6     	add	x22, x22, #0x8
 464ca98: f10022b5     	subs	x21, x21, #0x8
 464ca9c: 540000c0     	b.eq	0x464cab4 <_ChromeMain+0x4647818>
 464caa0: f94002c8     	ldr	x8, [x22]
 464caa4: b4ffff88     	cbz	x8, 0x464ca94 <_ChromeMain+0x46477f8>
 464caa8: f941b900     	ldr	x0, [x8, #0x370]
 464caac: b4ffff40     	cbz	x0, 0x464ca94 <_ChromeMain+0x46477f8>
 464cab0: 17fffff8     	b	0x464ca90 <_ChromeMain+0x46477f4>
 464cab4: f9422e68     	ldr	x8, [x19, #0x458]
 464cab8: 39286a7f     	strb	wzr, [x19, #0xa1a]
 464cabc: b5fff3c8     	cbnz	x8, 0x464c934 <_ChromeMain+0x4647698>
 464cac0: 17ffffa5     	b	0x464c954 <_ChromeMain+0x46476b8>
 464cac4: 52800028     	mov	w8, #0x1                ; =1
 464cac8: 39286268     	strb	w8, [x19, #0xa18]
 464cacc: bd4a1260     	ldr	s0, [x19, #0xa10]
 464cad0: 1e202900     	fadd	s0, s8, s0
 464cad4: bd0a1260     	str	s0, [x19, #0xa10]
 464cad8: bd4a1661     	ldr	s1, [x19, #0xa14]
 464cadc: 1e212921     	fadd	s1, s9, s1
 464cae0: bd0a1661     	str	s1, [x19, #0xa14]
 464cae4: 1e20c002     	fabs	s2, s0
 464cae8: 1e20c021     	fabs	s1, s1
 464caec: 1e2f1003     	fmov	s3, #1.50000000
 464caf0: 1e230823     	fmul	s3, s1, s3
 464caf4: 1e2e1001     	fmov	s1, #1.00000000
 464caf8: 1e216863     	fmaxnm	s3, s3, s1
 464cafc: 1e232040     	fcmp	s2, s3
 464cb00: 5400010c     	b.gt	0x464cb20 <_ChromeMain+0x4647884>
 464cb04: 91284274     	add	x20, x19, #0xa10
 464cb08: aa1303e0     	mov	x0, x19
 464cb0c: 94002ad5     	bl	0x4657660 <_ChromeMain+0x46523c4>
 464cb10: 52800000     	mov	w0, #0x0                ; =0
 464cb14: 3900229f     	strb	wzr, [x20, #0x8]
 464cb18: f900029f     	str	xzr, [x20]
 464cb1c: 17ffff31     	b	0x464c7e0 <_ChromeMain+0x4647544>
 464cb20: 1e214000     	fneg	s0, s0
 464cb24: bd41c262     	ldr	s2, [x19, #0x1c0]
 464cb28: 5e21d842     	scvtf	s2, s2
 464cb2c: 1e216842     	fmaxnm	s2, s2, s1
 464cb30: 1e221800     	fdiv	s0, s0, s2
 464cb34: 1e212000     	fcmp	s0, s1
 464cb38: 1e20cc21     	fcsel	s1, s1, s0, gt
 464cb3c: 1e3e1002     	fmov	s2, #-1.00000000
 464cb40: 1e222000     	fcmp	s0, s2
 464cb44: 1e214c48     	fcsel	s8, s2, s1, mi
 464cb48: 1e202108     	fcmp	s8, #0.0
 464cb4c: 5a9f53e8     	csetm	w8, mi
 464cb50: 1a9fd501     	csinc	w1, w8, wzr, le
 464cb54: 34000301     	cbz	w1, 0x464cbb4 <_ChromeMain+0x4647918>
 464cb58: 910003e8     	mov	x8, sp
 464cb5c: aa1303e0     	mov	x0, x19
 464cb60: 94002b2c     	bl	0x4657810 <_ChromeMain+0x4652574>
 464cb64: 394063e8     	ldrb	w8, [sp, #0x18]
 464cb68: 34000108     	cbz	w8, 0x464cb88 <_ChromeMain+0x46478ec>
 464cb6c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 464cb70: 36f80228     	tbz	w8, #0x1f, 0x464cbb4 <_ChromeMain+0x4647918>
 464cb74: f94003e0     	ldr	x0, [sp]
 464cb78: f9400be8     	ldr	x8, [sp, #0x10]
 464cb7c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464cb80: 96e6f0ce     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464cb84: 1400000c     	b	0x464cbb4 <_ChromeMain+0x4647918>
 464cb88: b004c828     	adrp	x8, 0xdf51000 <dyld_stub_binder+0xdf51000>
 464cb8c: bd490100     	ldr	s0, [x8, #0x900]
 464cb90: 1e200900     	fmul	s0, s8, s0
 464cb94: 9004c828     	adrp	x8, 0xdf50000 <dyld_stub_binder+0xdf50000>
 464cb98: bd4b3501     	ldr	s1, [x8, #0xb34]
 464cb9c: 1e212000     	fcmp	s0, s1
 464cba0: 1e20cc21     	fcsel	s1, s1, s0, gt
 464cba4: b004c828     	adrp	x8, 0xdf51000 <dyld_stub_binder+0xdf51000>
 464cba8: bd433502     	ldr	s2, [x8, #0x334]
 464cbac: 1e222000     	fcmp	s0, s2
 464cbb0: 1e214c48     	fcsel	s8, s2, s1, mi
 464cbb4: aa1303e0     	mov	x0, x19
 464cbb8: 4ea81d00     	mov.16b	v0, v8
 464cbbc: 97fff471     	bl	0x4649d80 <_ChromeMain+0x4644ae4>
 464cbc0: b940fa88     	ldr	w8, [x20, #0xf8]
 464cbc4: 71000d1f     	cmp	w8, #0x3
 464cbc8: 54ffe220     	b.eq	0x464c80c <_ChromeMain+0x4647570>
 464cbcc: 17ffff12     	b	0x464c814 <_ChromeMain+0x4647578>
 464cbd0: 3935a27f     	strb	wzr, [x19, #0xd68]
 464cbd4: f946be60     	ldr	x0, [x19, #0xd78]
 464cbd8: 91356261     	add	x1, x19, #0xd58
 464cbdc: 976af2c9     	bl	0x2109700 <_ChromeMain+0x2104464>
 464cbe0: f946ae68     	ldr	x8, [x19, #0xd58]
 464cbe4: f9401d08     	ldr	x8, [x8, #0x38]
 464cbe8: 91356260     	add	x0, x19, #0xd58
 464cbec: d63f0100     	blr	x8
 464cbf0: f946ba68     	ldr	x8, [x19, #0xd70]
 464cbf4: b4ffe588     	cbz	x8, 0x464c8a4 <_ChromeMain+0x4647608>
 464cbf8: f946ae68     	ldr	x8, [x19, #0xd58]
 464cbfc: f9402108     	ldr	x8, [x8, #0x40]
 464cc00: 91356260     	add	x0, x19, #0xd58
 464cc04: d63f0100     	blr	x8
 464cc08: f946ba68     	ldr	x8, [x19, #0xd70]
 464cc0c: f9400109     	ldr	x9, [x8]
 464cc10: 7100001f     	cmp	w0, #0x0
 464cc14: 5280020a     	mov	w10, #0x10              ; =16
 464cc18: 5280040b     	mov	w11, #0x20              ; =32
 464cc1c: 9a8a116a     	csel	x10, x11, x10, ne
 464cc20: f86a6929     	ldr	x9, [x9, x10]
 464cc24: 91356261     	add	x1, x19, #0xd58
 464cc28: aa0803e0     	mov	x0, x8
 464cc2c: d63f0120     	blr	x9
 464cc30: 17ffff1d     	b	0x464c8a4 <_ChromeMain+0x4647608>
 464cc34: 3937c27f     	strb	wzr, [x19, #0xdf0]
 464cc38: f9470260     	ldr	x0, [x19, #0xe00]
 464cc3c: 91378261     	add	x1, x19, #0xde0
 464cc40: 976af2b0     	bl	0x2109700 <_ChromeMain+0x2104464>
 464cc44: f946f268     	ldr	x8, [x19, #0xde0]
 464cc48: f9401d08     	ldr	x8, [x8, #0x38]
 464cc4c: 91378260     	add	x0, x19, #0xde0
 464cc50: d63f0100     	blr	x8
 464cc54: f946fe68     	ldr	x8, [x19, #0xdf8]
 464cc58: b4ffe2a8     	cbz	x8, 0x464c8ac <_ChromeMain+0x4647610>
 464cc5c: f946f268     	ldr	x8, [x19, #0xde0]
 464cc60: f9402108     	ldr	x8, [x8, #0x40]
 464cc64: 91378260     	add	x0, x19, #0xde0
 464cc68: d63f0100     	blr	x8
 464cc6c: f946fe68     	ldr	x8, [x19, #0xdf8]
 464cc70: f9400109     	ldr	x9, [x8]
 464cc74: 7100001f     	cmp	w0, #0x0
 464cc78: 5280020a     	mov	w10, #0x10              ; =16
 464cc7c: 5280040b     	mov	w11, #0x20              ; =32
 464cc80: 9a8a116a     	csel	x10, x11, x10, ne
 464cc84: f86a6929     	ldr	x9, [x9, x10]
 464cc88: 91378261     	add	x1, x19, #0xde0
 464cc8c: aa0803e0     	mov	x0, x8
 464cc90: d63f0120     	blr	x9
 464cc94: 17ffff06     	b	0x464c8ac <_ChromeMain+0x4647610>
 464cc98: 3935a27f     	strb	wzr, [x19, #0xd68]
 464cc9c: f946be60     	ldr	x0, [x19, #0xd78]
 464cca0: 91356261     	add	x1, x19, #0xd58
 464cca4: 976af297     	bl	0x2109700 <_ChromeMain+0x2104464>
 464cca8: f946ae68     	ldr	x8, [x19, #0xd58]
 464ccac: f9401d08     	ldr	x8, [x8, #0x38]
 464ccb0: 91356260     	add	x0, x19, #0xd58
 464ccb4: d63f0100     	blr	x8
 464ccb8: f946ba68     	ldr	x8, [x19, #0xd70]
 464ccbc: b4ffe9e8     	cbz	x8, 0x464c9f8 <_ChromeMain+0x464775c>
 464ccc0: f946ae68     	ldr	x8, [x19, #0xd58]
 464ccc4: f9402108     	ldr	x8, [x8, #0x40]
 464ccc8: 91356260     	add	x0, x19, #0xd58
 464cccc: d63f0100     	blr	x8
 464ccd0: f946ba68     	ldr	x8, [x19, #0xd70]
 464ccd4: f9400109     	ldr	x9, [x8]
 464ccd8: 7100001f     	cmp	w0, #0x0
 464ccdc: 5280020a     	mov	w10, #0x10              ; =16
 464cce0: 5280040b     	mov	w11, #0x20              ; =32
 464cce4: 9a8a116a     	csel	x10, x11, x10, ne
 464cce8: f86a6929     	ldr	x9, [x9, x10]
 464ccec: 91356261     	add	x1, x19, #0xd58
 464ccf0: aa0803e0     	mov	x0, x8
 464ccf4: d63f0120     	blr	x9
 464ccf8: 17ffff40     	b	0x464c9f8 <_ChromeMain+0x464775c>
 464ccfc: d101c3ff     	sub	sp, sp, #0x70
 464cd00: a9035ff8     	stp	x24, x23, [sp, #0x30]
 464cd04: a90457f6     	stp	x22, x21, [sp, #0x40]
 464cd08: a9054ff4     	stp	x20, x19, [sp, #0x50]
 464cd0c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 464cd10: 910183fd     	add	x29, sp, #0x60
 464cd14: f9423c14     	ldr	x20, [x0, #0x478]
 464cd18: b4002574     	cbz	x20, 0x464d1c4 <_ChromeMain+0x4647f28>
 464cd1c: aa0003f3     	mov	x19, x0
 464cd20: f9434000     	ldr	x0, [x0, #0x680]
 464cd24: b40024a0     	cbz	x0, 0x464d1b8 <_ChromeMain+0x4647f1c>
 464cd28: f940cc02     	ldr	x2, [x0, #0x198]
 464cd2c: aa1403e1     	mov	x1, x20
 464cd30: 9704b1b3     	bl	0x7793fc <_ChromeMain+0x774160>
 464cd34: aa1403e0     	mov	x0, x20
 464cd38: 52800021     	mov	w1, #0x1                ; =1
 464cd3c: 97eb723b     	bl	0x4129628 <_ChromeMain+0x412438c>
