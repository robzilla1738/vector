
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42522c0: d10383ff     	sub	sp, sp, #0xe0
 42522c4: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 42522c8: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 42522cc: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 42522d0: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 42522d4: 910343fd     	add	x29, sp, #0xd0
 42522d8: f9401413     	ldr	x19, [x0, #0x28]
 42522dc: f900141f     	str	xzr, [x0, #0x28]
 42522e0: b4000313     	cbz	x19, 0x4252340 <_ChromeMain+0x424d0a4>
 42522e4: f9401809     	ldr	x9, [x0, #0x30]
 42522e8: f9400028     	ldr	x8, [x1]
 42522ec: 1940426a     	ldapurb	w10, [x19, #0x4]
 42522f0: f100013f     	cmp	x9, #0x0
 42522f4: 1a9f07eb     	cset	w11, ne
 42522f8: d360fd0c     	lsr	x12, x8, #32
 42522fc: 0a0c016b     	and	w11, w11, w12
 4252300: 7100015f     	cmp	w10, #0x0
 4252304: 1a8b13ea     	csel	w10, wzr, w11, ne
 4252308: 3400014a     	cbz	w10, 0x4252330 <_ChromeMain+0x424d094>
 425230c: 1940426a     	ldapurb	w10, [x19, #0x4]
 4252310: 350018ca     	cbnz	w10, 0x4252628 <_ChromeMain+0x424d38c>
 4252314: f940112a     	ldr	x10, [x9, #0x20]
 4252318: b40000ca     	cbz	x10, 0x4252330 <_ChromeMain+0x424d094>
 425231c: 1940426a     	ldapurb	w10, [x19, #0x4]
 4252320: 350017ea     	cbnz	w10, 0x425261c <_ChromeMain+0x424d380>
 4252324: f9401134     	ldr	x20, [x9, #0x20]
 4252328: f9400e89     	ldr	x9, [x20, #0x18]
 425232c: b40002e9     	cbz	x9, 0x4252388 <_ChromeMain+0x424d0ec>
 4252330: 12800008     	mov	w8, #-0x1               ; =-1
 4252334: b8e80268     	ldaddal	w8, w8, [x19]
 4252338: 7100051f     	cmp	w8, #0x1
 425233c: 540000e0     	b.eq	0x4252358 <_ChromeMain+0x424d0bc>
 4252340: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 4252344: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 4252348: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 425234c: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 4252350: 910383ff     	add	sp, sp, #0xe0
 4252354: d65f03c0     	ret
 4252358: aa1303e0     	mov	x0, x19
 425235c: 52800101     	mov	w1, #0x8                ; =8
 4252360: 96f6dad6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4252364: 17fffff7     	b	0x4252340 <_ChromeMain+0x424d0a4>
 4252368: f9403688     	ldr	x8, [x20, #0x68]
 425236c: 7900011f     	strh	wzr, [x8]
 4252370: f9003a9f     	str	xzr, [x20, #0x70]
 4252374: 14000010     	b	0x42523b4 <_ChromeMain+0x424d118>
 4252378: f9402a88     	ldr	x8, [x20, #0x50]
 425237c: 3900011f     	strb	wzr, [x8]
 4252380: f9002e9f     	str	xzr, [x20, #0x58]
 4252384: 14000008     	b	0x42523a4 <_ChromeMain+0x424d108>
 4252388: f9401689     	ldr	x9, [x20, #0x28]
 425238c: b5fffd29     	cbnz	x9, 0x4252330 <_ChromeMain+0x424d094>
 4252390: b9004a88     	str	w8, [x20, #0x48]
 4252394: 39c19e88     	ldrsb	w8, [x20, #0x67]
 4252398: 37ffff08     	tbnz	w8, #0x1f, 0x4252378 <_ChromeMain+0x424d0dc>
 425239c: 3901429f     	strb	wzr, [x20, #0x50]
 42523a0: 39019e9f     	strb	wzr, [x20, #0x67]
 42523a4: 39c1fe88     	ldrsb	w8, [x20, #0x7f]
 42523a8: 37fffe08     	tbnz	w8, #0x1f, 0x4252368 <_ChromeMain+0x424d0cc>
 42523ac: 7900d29f     	strh	wzr, [x20, #0x68]
 42523b0: 3901fe9f     	strb	wzr, [x20, #0x7f]
 42523b4: f9400a88     	ldr	x8, [x20, #0x10]
 42523b8: b40004a8     	cbz	x8, 0x425244c <_ChromeMain+0x424d1b0>
 42523bc: f9403115     	ldr	x21, [x8, #0x60]
 42523c0: b4000475     	cbz	x21, 0x425244c <_ChromeMain+0x424d1b0>
 42523c4: 900564a8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 42523c8: f9467d08     	ldr	x8, [x8, #0xcf8]
 42523cc: f9414908     	ldr	x8, [x8, #0x290]
 42523d0: f9400516     	ldr	x22, [x8, #0x8]
 42523d4: aa1503e0     	mov	x0, x21
 42523d8: 970d3847     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 42523dc: b4000380     	cbz	x0, 0x425244c <_ChromeMain+0x424d1b0>
 42523e0: f9402808     	ldr	x8, [x0, #0x50]
 42523e4: b5000068     	cbnz	x8, 0x42523f0 <_ChromeMain+0x424d154>
 42523e8: f9402409     	ldr	x9, [x0, #0x48]
 42523ec: b4000309     	cbz	x9, 0x425244c <_ChromeMain+0x424d1b0>
 42523f0: 52800a09     	mov	w9, #0x50               ; =80
 42523f4: 5280090a     	mov	w10, #0x48              ; =72
 42523f8: f100011f     	cmp	x8, #0x0
 42523fc: 9a890148     	csel	x8, x10, x9, eq
 4252400: f8686808     	ldr	x8, [x0, x8]
 4252404: f9400908     	ldr	x8, [x8, #0x10]
 4252408: f9400517     	ldr	x23, [x8, #0x8]
 425240c: b4000217     	cbz	x23, 0x425244c <_ChromeMain+0x424d1b0>
 4252410: 9100a2e8     	add	x8, x23, #0x28
 4252414: 390123ff     	strb	wzr, [sp, #0x48]
 4252418: 910123e9     	add	x9, sp, #0x48
 425241c: a90623e9     	stp	x9, x8, [sp, #0x60]
 4252420: f0fe5ae2     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 4252424: 912dc042     	add	x2, x2, #0xb70
 4252428: 910183e1     	add	x1, sp, #0x60
 425242c: aa1603e0     	mov	x0, x22
 4252430: 52800003     	mov	w3, #0x0                ; =0
 4252434: 52800004     	mov	w4, #0x0                ; =0
 4252438: 972d7d0e     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 425243c: 394123e8     	ldrb	w8, [sp, #0x48]
 4252440: 34000068     	cbz	w8, 0x425244c <_ChromeMain+0x424d1b0>
 4252444: f9403ee8     	ldr	x8, [x23, #0x78]
 4252448: b5000088     	cbnz	x8, 0x4252458 <_ChromeMain+0x424d1bc>
 425244c: aa1403e0     	mov	x0, x20
 4252450: 97fffbf4     	bl	0x4251420 <_ChromeMain+0x424c184>
 4252454: 17ffffb7     	b	0x4252330 <_ChromeMain+0x424d094>
 4252458: 52800200     	mov	w0, #0x10               ; =16
 425245c: 96f6f3c3     	bl	0xf368 <_ChromeMain+0xa0cc>
 4252460: aa0003f6     	mov	x22, x0
 4252464: b004fa08     	adrp	x8, 0xe193000 <dyld_stub_binder+0xe193000>
 4252468: 91090108     	add	x8, x8, #0x240
 425246c: f9000008     	str	x8, [x0]
 4252470: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4252474: 90054b09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4252478: f9404529     	ldr	x9, [x9, #0x88]
 425247c: eb09011f     	cmp	x8, x9
 4252480: 54000061     	b.ne	0x425248c <_ChromeMain+0x424d1f0>
 4252484: aa1503e0     	mov	x0, x21
 4252488: 96f7079d     	bl	0x142fc <_ChromeMain+0xf060>
 425248c: f90006d5     	str	x21, [x22, #0x8]
 4252490: aa1403e0     	mov	x0, x20
 4252494: aa1603e1     	mov	x1, x22
 4252498: 95673fa7     	bl	0x9c22334 <_ChromeMain+0x9c1d098>
 425249c: aa0003e8     	mov	x8, x0
 42524a0: f9400e80     	ldr	x0, [x20, #0x18]
 42524a4: f9000e88     	str	x8, [x20, #0x18]
 42524a8: b4000120     	cbz	x0, 0x42524cc <_ChromeMain+0x424d230>
 42524ac: 91002008     	add	x8, x0, #0x8
 42524b0: 12800009     	mov	w9, #-0x1               ; =-1
 42524b4: b8e90108     	ldaddal	w9, w8, [x8]
 42524b8: 7100051f     	cmp	w8, #0x1
 42524bc: 54000081     	b.ne	0x42524cc <_ChromeMain+0x424d230>
 42524c0: f9400008     	ldr	x8, [x0]
 42524c4: f9400d08     	ldr	x8, [x8, #0x18]
 42524c8: d63f0100     	blr	x8
 42524cc: f9004bff     	str	xzr, [sp, #0x90]
 42524d0: 6f00e400     	movi.2d	v0, #0000000000000000
 42524d4: ad0383e0     	stp	q0, q0, [sp, #0x70]
 42524d8: 3d801be0     	str	q0, [sp, #0x60]
 42524dc: 52800028     	mov	w8, #0x1                ; =1
 42524e0: b90097e8     	str	w8, [sp, #0x94]
 42524e4: 910183e0     	add	x0, sp, #0x60
 42524e8: 52800021     	mov	w1, #0x1                ; =1
 42524ec: 943ca9d8     	bl	0x517cc4c <_ChromeMain+0x51779b0>
 42524f0: f94037e8     	ldr	x8, [sp, #0x68]
 42524f4: b4000988     	cbz	x8, 0x4252624 <_ChromeMain+0x424d388>
 42524f8: f94033e0     	ldr	x0, [sp, #0x60]
 42524fc: 52800068     	mov	w8, #0x3                ; =3
 4252500: 39017fe8     	strb	w8, [sp, #0x5f]
 4252504: 910123e8     	add	x8, sp, #0x48
 4252508: b2400509     	orr	x9, x8, #0x3
 425250c: f004b68a     	adrp	x10, 0xd925000 <dyld_stub_binder+0xd925000>
 4252510: 911a294a     	add	x10, x10, #0x68a
 4252514: eb0a013f     	cmp	x9, x10
 4252518: fa4a8102     	ccmp	x8, x10, #0x2, hi
 425251c: 54000849     	b.ls	0x4252624 <_ChromeMain+0x424d388>
 4252520: 528d2f48     	mov	w8, #0x697a             ; =27002
 4252524: 72a00e08     	movk	w8, #0x70, lsl #16
 4252528: b9004be8     	str	w8, [sp, #0x48]
 425252c: 910123e1     	add	x1, sp, #0x48
 4252530: 975bc91e     	bl	0x19449a8 <_ChromeMain+0x193f70c>
 4252534: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 4252538: 36f800a8     	tbz	w8, #0x1f, 0x425254c <_ChromeMain+0x424d2b0>
 425253c: f94027e0     	ldr	x0, [sp, #0x48]
 4252540: f9402fe8     	ldr	x8, [sp, #0x58]
 4252544: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4252548: 96f6da5c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425254c: f9400e94     	ldr	x20, [x20, #0x18]
 4252550: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 4252554: f9002fff     	str	xzr, [sp, #0x58]
 4252558: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 425255c: f90023ff     	str	xzr, [sp, #0x40]
 4252560: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 4252564: f90017ff     	str	xzr, [sp, #0x28]
 4252568: f9403ee0     	ldr	x0, [x23, #0x78]
 425256c: f9400008     	ldr	x8, [x0]
 4252570: f9401109     	ldr	x9, [x8, #0x20]
 4252574: 910023e8     	add	x8, sp, #0x8
 4252578: d63f0120     	blr	x9
 425257c: f90003ff     	str	xzr, [sp]
 4252580: 910123e2     	add	x2, sp, #0x48
 4252584: 9100c3e3     	add	x3, sp, #0x30
 4252588: 910183e4     	add	x4, sp, #0x60
 425258c: 910063e6     	add	x6, sp, #0x18
 4252590: 910023e7     	add	x7, sp, #0x8
 4252594: aa1403e0     	mov	x0, x20
 4252598: 528000a1     	mov	w1, #0x5                ; =5
 425259c: 52800005     	mov	w5, #0x0                ; =0
 42525a0: 95674008     	bl	0x9c225c0 <_ChromeMain+0x9c1d324>
 42525a4: f94007f4     	ldr	x20, [sp, #0x8]
 42525a8: f90007ff     	str	xzr, [sp, #0x8]
 42525ac: b40000d4     	cbz	x20, 0x42525c4 <_ChromeMain+0x424d328>
 42525b0: aa1403e0     	mov	x0, x20
 42525b4: 951066d9     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 42525b8: aa1403e0     	mov	x0, x20
 42525bc: 52800101     	mov	w1, #0x8                ; =8
 42525c0: 96f6da3e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42525c4: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 42525c8: 36f800a8     	tbz	w8, #0x1f, 0x42525dc <_ChromeMain+0x424d340>
 42525cc: f9400fe0     	ldr	x0, [sp, #0x18]
 42525d0: f94017e8     	ldr	x8, [sp, #0x28]
 42525d4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42525d8: 96f6da38     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42525dc: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 42525e0: 37f80148     	tbnz	w8, #0x1f, 0x4252608 <_ChromeMain+0x424d36c>
 42525e4: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 42525e8: 36f800a8     	tbz	w8, #0x1f, 0x42525fc <_ChromeMain+0x424d360>
 42525ec: f94027e0     	ldr	x0, [sp, #0x48]
 42525f0: f9402fe8     	ldr	x8, [sp, #0x58]
 42525f4: d37ff901     	lsl	x1, x8, #1
 42525f8: 96f6da30     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42525fc: 910183e0     	add	x0, sp, #0x60
 4252600: 9485f7a4     	bl	0x63d0490 <_ChromeMain+0x63cb1f4>
 4252604: 17ffff4b     	b	0x4252330 <_ChromeMain+0x424d094>
 4252608: f9401be0     	ldr	x0, [sp, #0x30]
 425260c: f94023e8     	ldr	x8, [sp, #0x40]
 4252610: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4252614: 96f6da29     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4252618: 17fffff3     	b	0x42525e4 <_ChromeMain+0x424d348>
 425261c: d4200000     	brk	#0
 4252620: d4400000     	hlt	#0
 4252624: d4200020     	brk	#0x1
 4252628: d4200000     	brk	#0
 425262c: d4400000     	hlt	#0
 4252630: d4200020     	brk	#0x1
 4252634: b4000180     	cbz	x0, 0x4252664 <_ChromeMain+0x424d3c8>
 4252638: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 425263c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4252640: 910043fd     	add	x29, sp, #0x10
 4252644: aa0003f3     	mov	x19, x0
 4252648: f9401400     	ldr	x0, [x0, #0x28]
 425264c: b50000e0     	cbnz	x0, 0x4252668 <_ChromeMain+0x424d3cc>
 4252650: aa1303e0     	mov	x0, x19
 4252654: 52800701     	mov	w1, #0x38               ; =56
 4252658: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 425265c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4252660: 16f6da16     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4252664: d65f03c0     	ret
 4252668: 12800008     	mov	w8, #-0x1               ; =-1
 425266c: b8e80008     	ldaddal	w8, w8, [x0]
 4252670: 7100051f     	cmp	w8, #0x1
 4252674: 54fffee1     	b.ne	0x4252650 <_ChromeMain+0x424d3b4>
 4252678: 52800101     	mov	w1, #0x8                ; =8
 425267c: 96f6da0f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4252680: 17fffff4     	b	0x4252650 <_ChromeMain+0x424d3b4>
 4252684: d503201f     	nop
 4252688: d503201f     	nop
 425268c: d503201f     	nop
 4252690: d503201f     	nop
 4252694: d503201f     	nop
 4252698: d503201f     	nop
 425269c: d503201f     	nop
 42526a0: d503201f     	nop
 42526a4: d503201f     	nop
 42526a8: d503201f     	nop
 42526ac: d503201f     	nop
 42526b0: d503201f     	nop
 42526b4: d503201f     	nop
 42526b8: d503201f     	nop
 42526bc: d503201f     	nop
