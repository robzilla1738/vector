
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425a380: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 425a384: a90167fa     	stp	x26, x25, [sp, #0x10]
 425a388: a9025ff8     	stp	x24, x23, [sp, #0x20]
 425a38c: a90357f6     	stp	x22, x21, [sp, #0x30]
 425a390: a9044ff4     	stp	x20, x19, [sp, #0x40]
 425a394: a9057bfd     	stp	x29, x30, [sp, #0x50]
 425a398: 910143fd     	add	x29, sp, #0x50
 425a39c: d11783ff     	sub	sp, sp, #0x5e0
 425a3a0: aa0203f3     	mov	x19, x2
 425a3a4: d004ee68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 425a3a8: f940f908     	ldr	x8, [x8, #0x1f0]
 425a3ac: f9400108     	ldr	x8, [x8]
 425a3b0: f81a03a8     	stur	x8, [x29, #-0x60]
 425a3b4: b40006c2     	cbz	x2, 0x425a48c <_ChromeMain+0x42551f0>
 425a3b8: aa0103f4     	mov	x20, x1
 425a3bc: aa0003f5     	mov	x21, x0
 425a3c0: a9402277     	ldp	x23, x8, [x19]
 425a3c4: 52803509     	mov	w9, #0x1a8              ; =424
 425a3c8: 9b097d18     	mul	x24, x8, x9
 425a3cc: b4000898     	cbz	x24, 0x425a4dc <_ChromeMain+0x4255240>
 425a3d0: d2800019     	mov	x25, #0x0               ; =0
 425a3d4: d00503da     	adrp	x26, 0xe2d4000 <dyld_stub_binder+0xe2d4000>
 425a3d8: 910d235a     	add	x26, x26, #0x348
 425a3dc: aa1703fb     	mov	x27, x23
 425a3e0: 8b18037c     	add	x28, x27, x24
 425a3e4: f106a396     	subs	x22, x28, #0x1a8
 425a3e8: 54000300     	b.eq	0x425a448 <_ChromeMain+0x42551ac>
 425a3ec: d1002380     	sub	x0, x28, #0x8
 425a3f0: d2800001     	mov	x1, #0x0                ; =0
 425a3f4: 96f73631     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425a3f8: d1016380     	sub	x0, x28, #0x58
 425a3fc: 96f7361f     	bl	0x27c78 <_ChromeMain+0x229dc>
 425a400: 38d9f388     	ldursb	w8, [x28, #-0x61]
 425a404: 36f800c8     	tbz	w8, #0x1f, 0x425a41c <_ChromeMain+0x4255180>
 425a408: 8b180368     	add	x8, x27, x24
 425a40c: f8588100     	ldur	x0, [x8, #-0x78]
 425a410: f8598108     	ldur	x8, [x8, #-0x68]
 425a414: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a418: 96f6baa8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a41c: f90002da     	str	x26, [x22]
 425a420: 8b180368     	add	x8, x27, x24
 425a424: 38560109     	ldurb	w9, [x8, #-0xa0]
 425a428: 34000129     	cbz	w9, 0x425a44c <_ChromeMain+0x42551b0>
 425a42c: f8538100     	ldur	x0, [x8, #-0xc8]
 425a430: b40000e0     	cbz	x0, 0x425a44c <_ChromeMain+0x42551b0>
 425a434: 8b180368     	add	x8, x27, x24
 425a438: f8540109     	ldur	x9, [x8, #-0xc0]
 425a43c: cb0003ea     	neg	x10, x0
 425a440: eb0a013f     	cmp	x9, x10
 425a444: 54006149     	b.ls	0x425b06c <_ChromeMain+0x4255dd0>
 425a448: d4200020     	brk	#0x1
 425a44c: aa1603e0     	mov	x0, x22
 425a450: 974da690     	bl	0x15c3e90 <_ChromeMain+0x15bebf4>
 425a454: d106a37b     	sub	x27, x27, #0x1a8
 425a458: 9106a339     	add	x25, x25, #0x1a8
 425a45c: eb19031f     	cmp	x24, x25
 425a460: 54fffc01     	b.ne	0x425a3e0 <_ChromeMain+0x4255144>
 425a464: f9400268     	ldr	x8, [x19]
 425a468: 1400001e     	b	0x425a4e0 <_ChromeMain+0x4255244>
 425a46c: f941b3e0     	ldr	x0, [sp, #0x360]
 425a470: f941bbe8     	ldr	x8, [sp, #0x370]
 425a474: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a478: 96f6ba90     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a47c: 14000004     	b	0x425a48c <_ChromeMain+0x42551f0>
 425a480: 52800033     	mov	w19, #0x1               ; =1
 425a484: 39cddfe8     	ldrsb	w8, [sp, #0x377]
 425a488: 37ffff28     	tbnz	w8, #0x1f, 0x425a46c <_ChromeMain+0x42551d0>
 425a48c: f85a03a8     	ldur	x8, [x29, #-0x60]
 425a490: d004ee69     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 425a494: f940f929     	ldr	x9, [x9, #0x1f0]
 425a498: f9400129     	ldr	x9, [x9]
 425a49c: eb08013f     	cmp	x9, x8
 425a4a0: 540060c1     	b.ne	0x425b0b8 <_ChromeMain+0x4255e1c>
 425a4a4: aa1303e0     	mov	x0, x19
 425a4a8: 911783ff     	add	sp, sp, #0x5e0
 425a4ac: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 425a4b0: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 425a4b4: a94357f6     	ldp	x22, x21, [sp, #0x30]
 425a4b8: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 425a4bc: a94167fa     	ldp	x26, x25, [sp, #0x10]
 425a4c0: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 425a4c4: d65f03c0     	ret
 425a4c8: f941d3e0     	ldr	x0, [sp, #0x3a0]
 425a4cc: f941dbe8     	ldr	x8, [sp, #0x3b0]
 425a4d0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a4d4: 96f6ba79     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a4d8: 1400001b     	b	0x425a544 <_ChromeMain+0x42552a8>
 425a4dc: aa1703e8     	mov	x8, x23
 425a4e0: cb0802e8     	sub	x8, x23, x8
 425a4e4: 9343fd08     	asr	x8, x8, #3
 425a4e8: d28a43ba     	mov	x26, #0x521d            ; =21021
 425a4ec: f2b1827a     	movk	x26, #0x8c13, lsl #16
 425a4f0: f2d656fa     	movk	x26, #0xb2b7, lsl #32
 425a4f4: f2e439fa     	movk	x26, #0x21cf, lsl #48
 425a4f8: 9b1a7d08     	mul	x8, x8, x26
 425a4fc: f9000668     	str	x8, [x19, #0x8]
 425a500: f901b7ff     	str	xzr, [sp, #0x368]
 425a504: f901b3ff     	str	xzr, [sp, #0x360]
 425a508: f901bbff     	str	xzr, [sp, #0x370]
 425a50c: d004b341     	adrp	x1, 0xd8c4000 <dyld_stub_binder+0xd8c4000>
 425a510: 911ee821     	add	x1, x1, #0x7ba
 425a514: 910e83e8     	add	x8, sp, #0x3a0
 425a518: aa1503e0     	mov	x0, x21
 425a51c: 528000e2     	mov	w2, #0x7                ; =7
 425a520: 9750fbbd     	bl	0x1699414 <_ChromeMain+0x1694178>
 425a524: d004c321     	adrp	x1, 0xdac0000 <dyld_stub_binder+0xdac0000>
 425a528: 91047021     	add	x1, x1, #0x11c
 425a52c: 910d83e8     	add	x8, sp, #0x360
 425a530: 910e83e0     	add	x0, sp, #0x3a0
 425a534: 528000e2     	mov	w2, #0x7                ; =7
 425a538: 9750fbb7     	bl	0x1699414 <_ChromeMain+0x1694178>
 425a53c: 39cedfe8     	ldrsb	w8, [sp, #0x3b7]
 425a540: 37fffc48     	tbnz	w8, #0x1f, 0x425a4c8 <_ChromeMain+0x425522c>
 425a544: 910d83e0     	add	x0, sp, #0x360
 425a548: 977f27be     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 425a54c: 370001a0     	tbnz	w0, #0x0, 0x425a580 <_ChromeMain+0x42552e4>
 425a550: d004c321     	adrp	x1, 0xdac0000 <dyld_stub_binder+0xdac0000>
 425a554: 91047021     	add	x1, x1, #0x11c
 425a558: 910e83e8     	add	x8, sp, #0x3a0
 425a55c: aa1503e0     	mov	x0, x21
 425a560: 528000e2     	mov	w2, #0x7                ; =7
 425a564: 9750fbac     	bl	0x1699414 <_ChromeMain+0x1694178>
 425a568: 39cddfe8     	ldrsb	w8, [sp, #0x377]
 425a56c: 37f85728     	tbnz	w8, #0x1f, 0x425b050 <_ChromeMain+0x4255db4>
 425a570: 3dc0ebe0     	ldr	q0, [sp, #0x3a0]
 425a574: 3d80dbe0     	str	q0, [sp, #0x360]
 425a578: f941dbe8     	ldr	x8, [sp, #0x3b0]
 425a57c: f901bbe8     	str	x8, [sp, #0x370]
 425a580: 910d83e0     	add	x0, sp, #0x360
 425a584: 977f27af     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 425a588: 34fff7c0     	cbz	w0, 0x425a480 <_ChromeMain+0x42551e4>
 425a58c: f901abff     	str	xzr, [sp, #0x350]
 425a590: f901a7ff     	str	xzr, [sp, #0x348]
 425a594: f901afff     	str	xzr, [sp, #0x358]
 425a598: f9019fff     	str	xzr, [sp, #0x338]
 425a59c: f9019bff     	str	xzr, [sp, #0x330]
 425a5a0: f901a3ff     	str	xzr, [sp, #0x340]
 425a5a4: 39cddfe8     	ldrsb	w8, [sp, #0x377]
 425a5a8: 37f80c68     	tbnz	w8, #0x1f, 0x425a734 <_ChromeMain+0x4255498>
 425a5ac: 52800008     	mov	w8, #0x0                ; =0
 425a5b0: 3dc0dbe0     	ldr	q0, [sp, #0x360]
 425a5b4: 3d80cfe0     	str	q0, [sp, #0x330]
 425a5b8: f941bbe9     	ldr	x9, [sp, #0x370]
 425a5bc: f901a3e9     	str	x9, [sp, #0x340]
 425a5c0: 93407d08     	sxtw	x8, w8
 425a5c4: b5000508     	cbnz	x8, 0x425a664 <_ChromeMain+0x42553c8>
 425a5c8: 900473a0     	adrp	x0, 0xd0ce000 <dyld_stub_binder+0xd0ce000>
 425a5cc: 91178c00     	add	x0, x0, #0x5e3
 425a5d0: 910d23e2     	add	x2, sp, #0x348
 425a5d4: 52800141     	mov	w1, #0xa                ; =10
 425a5d8: 97b8babe     	bl	0x30890d0 <_ChromeMain+0x3083e34>
 425a5dc: 34000440     	cbz	w0, 0x425a664 <_ChromeMain+0x42553c8>
 425a5e0: f901d7ff     	str	xzr, [sp, #0x3a8]
 425a5e4: f901d3ff     	str	xzr, [sp, #0x3a0]
 425a5e8: f901dbff     	str	xzr, [sp, #0x3b0]
 425a5ec: 910883f5     	add	x21, sp, #0x220
 425a5f0: 910883e8     	add	x8, sp, #0x220
 425a5f4: 910d83e0     	add	x0, sp, #0x360
 425a5f8: 97485c1d     	bl	0x147166c <_ChromeMain+0x146c3d0>
 425a5fc: 3988dfe8     	ldrsb	x8, [sp, #0x237]
 425a600: f94113e9     	ldr	x9, [sp, #0x220]
 425a604: f94117ea     	ldr	x10, [sp, #0x228]
 425a608: f100011f     	cmp	x8, #0x0
 425a60c: 9a954121     	csel	x1, x9, x21, mi
 425a610: 7100011f     	cmp	w8, #0x0
 425a614: 9a884142     	csel	x2, x10, x8, mi
 425a618: 910e83e8     	add	x8, sp, #0x3a0
 425a61c: 910d23e0     	add	x0, sp, #0x348
 425a620: 9750fb7d     	bl	0x1699414 <_ChromeMain+0x1694178>
 425a624: 39c8dfe8     	ldrsb	w8, [sp, #0x237]
 425a628: 37f80948     	tbnz	w8, #0x1f, 0x425a750 <_ChromeMain+0x42554b4>
 425a62c: 910d83e0     	add	x0, sp, #0x360
 425a630: 910e83e1     	add	x1, sp, #0x3a0
 425a634: 9516c0e3     	bl	0x880a9c0 <_ChromeMain+0x8805724>
 425a638: 34000120     	cbz	w0, 0x425a65c <_ChromeMain+0x42553c0>
 425a63c: 39cd1fe9     	ldrsb	w9, [sp, #0x347]
 425a640: 394edfe8     	ldrb	w8, [sp, #0x3b7]
 425a644: 37f851c9     	tbnz	w9, #0x1f, 0x425b07c <_ChromeMain+0x4255de0>
 425a648: 373806c8     	tbnz	w8, #0x7, 0x425a720 <_ChromeMain+0x4255484>
 425a64c: 3dc0ebe0     	ldr	q0, [sp, #0x3a0]
 425a650: 3d80cfe0     	str	q0, [sp, #0x330]
 425a654: f941dbe8     	ldr	x8, [sp, #0x3b0]
 425a658: f901a3e8     	str	x8, [sp, #0x340]
 425a65c: 39cedfe8     	ldrsb	w8, [sp, #0x3b7]
 425a660: 37f80828     	tbnz	w8, #0x1f, 0x425a764 <_ChromeMain+0x42554c8>
 425a664: 6f00e400     	movi.2d	v0, #0000000000000000
 425a668: ad1883e0     	stp	q0, q0, [sp, #0x310]
 425a66c: ad1783e0     	stp	q0, q0, [sp, #0x2f0]
 425a670: ad1683e0     	stp	q0, q0, [sp, #0x2d0]
 425a674: ad1583e0     	stp	q0, q0, [sp, #0x2b0]
 425a678: ad1483e0     	stp	q0, q0, [sp, #0x290]
 425a67c: ad1383e0     	stp	q0, q0, [sp, #0x270]
 425a680: ad1283e0     	stp	q0, q0, [sp, #0x250]
 425a684: ad1183e0     	stp	q0, q0, [sp, #0x230]
 425a688: 3d808be0     	str	q0, [sp, #0x220]
 425a68c: d004aec1     	adrp	x1, 0xd834000 <dyld_stub_binder+0xd834000>
 425a690: 91299421     	add	x1, x1, #0xa65
 425a694: 910883e0     	add	x0, sp, #0x220
 425a698: 97b6d4ac     	bl	0x300f948 <_ChromeMain+0x300a6ac>
 425a69c: 910883e0     	add	x0, sp, #0x220
 425a6a0: 910cc3e1     	add	x1, sp, #0x330
 425a6a4: 974c1bf8     	bl	0x1561684 <_ChromeMain+0x155c3e8>
 425a6a8: 350008e0     	cbnz	w0, 0x425a7c4 <_ChromeMain+0x4255528>
 425a6ac: 52800013     	mov	w19, #0x0               ; =0
 425a6b0: 910883e0     	add	x0, sp, #0x220
 425a6b4: 976852cc     	bl	0x1c6f1e4 <_ChromeMain+0x1c69f48>
 425a6b8: 39cd1fe8     	ldrsb	w8, [sp, #0x347]
 425a6bc: 37f80288     	tbnz	w8, #0x1f, 0x425a70c <_ChromeMain+0x4255470>
 425a6c0: 39cd7fe8     	ldrsb	w8, [sp, #0x35f]
 425a6c4: 36f850a8     	tbz	w8, #0x1f, 0x425b0d8 <_ChromeMain+0x4255e3c>
 425a6c8: f941abe8     	ldr	x8, [sp, #0x350]
 425a6cc: b4000168     	cbz	x8, 0x425a6f8 <_ChromeMain+0x425545c>
 425a6d0: 910d23e0     	add	x0, sp, #0x348
 425a6d4: 97c04e15     	bl	0x326df28 <_ChromeMain+0x3268c8c>
 425a6d8: 39cd7fe8     	ldrsb	w8, [sp, #0x35f]
 425a6dc: 340000c0     	cbz	w0, 0x425a6f4 <_ChromeMain+0x4255458>
 425a6e0: 36f85008     	tbz	w8, #0x1f, 0x425b0e0 <_ChromeMain+0x4255e44>
 425a6e4: f941a7e8     	ldr	x8, [sp, #0x348]
 425a6e8: 3900011f     	strb	wzr, [x8]
 425a6ec: f901abff     	str	xzr, [sp, #0x350]
 425a6f0: 394d7fe8     	ldrb	w8, [sp, #0x35f]
 425a6f4: 363fec88     	tbz	w8, #0x7, 0x425a484 <_ChromeMain+0x42551e8>
 425a6f8: f941a7e0     	ldr	x0, [sp, #0x348]
 425a6fc: f941afe8     	ldr	x8, [sp, #0x358]
 425a700: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a704: 96f6b9ed     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a708: 17ffff5f     	b	0x425a484 <_ChromeMain+0x42551e8>
 425a70c: f9419be0     	ldr	x0, [sp, #0x330]
 425a710: f941a3e8     	ldr	x8, [sp, #0x340]
 425a714: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a718: 96f6b9e8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a71c: 17ffffe9     	b	0x425a6c0 <_ChromeMain+0x4255424>
 425a720: f941d3e1     	ldr	x1, [sp, #0x3a0]
 425a724: f941d7e2     	ldr	x2, [sp, #0x3a8]
 425a728: 910cc3e0     	add	x0, sp, #0x330
 425a72c: 970938e2     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 425a730: 17ffffcb     	b	0x425a65c <_ChromeMain+0x42553c0>
 425a734: f941b3e1     	ldr	x1, [sp, #0x360]
 425a738: f941b7e2     	ldr	x2, [sp, #0x368]
 425a73c: 910cc3e0     	add	x0, sp, #0x330
 425a740: 96f6f6b6     	bl	0x18218 <_ChromeMain+0x12f7c>
 425a744: 39cd7fe8     	ldrsb	w8, [sp, #0x35f]
 425a748: 36fff3c8     	tbz	w8, #0x1f, 0x425a5c0 <_ChromeMain+0x4255324>
 425a74c: 1400026f     	b	0x425b108 <_ChromeMain+0x4255e6c>
 425a750: f94113e0     	ldr	x0, [sp, #0x220]
 425a754: f9411be8     	ldr	x8, [sp, #0x230]
 425a758: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a75c: 96f6b9d7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a760: 17ffffb3     	b	0x425a62c <_ChromeMain+0x4255390>
 425a764: f941d3e0     	ldr	x0, [sp, #0x3a0]
 425a768: f941dbe8     	ldr	x8, [sp, #0x3b0]
 425a76c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a770: 96f6b9d2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a774: 17ffffbc     	b	0x425a664 <_ChromeMain+0x42553c8>
 425a778: f100039f     	cmp	x28, #0x0
 425a77c: fa400b64     	ccmp	x27, #0x0, #0x4, eq
 425a780: 1a9f17ea     	cset	w10, eq
 425a784: 52800013     	mov	w19, #0x0               ; =0
 425a788: f94103e8     	ldr	x8, [sp, #0x200]
 425a78c: f9401508     	ldr	x8, [x8, #0x28]
 425a790: b4000108     	cbz	x8, 0x425a7b0 <_ChromeMain+0x4255514>
 425a794: 394833e8     	ldrb	w8, [sp, #0x20c]
 425a798: 360000c8     	tbz	w8, #0x0, 0x425a7b0 <_ChromeMain+0x4255514>
 425a79c: b9420be8     	ldr	w8, [sp, #0x208]
 425a7a0: 51019109     	sub	w9, w8, #0x64
 425a7a4: 7100093f     	cmp	w9, #0x2
 425a7a8: 540045e2     	b.hs	0x425b064 <_ChromeMain+0x4255dc8>
 425a7ac: aa0a03f3     	mov	x19, x10
 425a7b0: 910803e0     	add	x0, sp, #0x200
 425a7b4: 972288e4     	bl	0xafcb44 <_ChromeMain+0xaf78a8>
 425a7b8: 17ffffbe     	b	0x425a6b0 <_ChromeMain+0x4255414>
 425a7bc: 52800013     	mov	w19, #0x0               ; =0
 425a7c0: 17fffffc     	b	0x425a7b0 <_ChromeMain+0x4255514>
 425a7c4: f9010bff     	str	xzr, [sp, #0x210]
 425a7c8: f90107ff     	str	xzr, [sp, #0x208]
 425a7cc: f9010fff     	str	xzr, [sp, #0x218]
 425a7d0: b004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425a7d4: 91157821     	add	x1, x1, #0x55e
 425a7d8: 910883e0     	add	x0, sp, #0x220
 425a7dc: 52802362     	mov	w2, #0x11b              ; =283
 425a7e0: 52800003     	mov	w3, #0x0                ; =0
 425a7e4: 97228dc7     	bl	0xafdf00 <_ChromeMain+0xaf8c64>
 425a7e8: f90103e0     	str	x0, [sp, #0x200]
 425a7ec: 390823ff     	strb	wzr, [sp, #0x208]
 425a7f0: 390833ff     	strb	wzr, [sp, #0x20c]
 425a7f4: 390843ff     	strb	wzr, [sp, #0x210]
 425a7f8: 390863ff     	strb	wzr, [sp, #0x218]
 425a7fc: f9401408     	ldr	x8, [x0, #0x28]
 425a800: b4fffde8     	cbz	x8, 0x425a7bc <_ChromeMain+0x4255520>
 425a804: 910803e0     	add	x0, sp, #0x200
 425a808: 9718d7ae     	bl	0x8906c0 <_ChromeMain+0x88b424>
 425a80c: 5280002a     	mov	w10, #0x1               ; =1
 425a810: 7101901f     	cmp	w0, #0x64
 425a814: 54fffb81     	b.ne	0x425a784 <_ChromeMain+0x42554e8>
 425a818: d280001b     	mov	x27, #0x0               ; =0
 425a81c: d280001c     	mov	x28, #0x0               ; =0
 425a820: d10383b8     	sub	x24, x29, #0xe0
 425a824: 910e83f5     	add	x21, sp, #0x3a0
 425a828: 9106c3f9     	add	x25, sp, #0x1b0
 425a82c: 14000020     	b	0x425a8ac <_ChromeMain+0x4255610>
 425a830: 52800017     	mov	w23, #0x0               ; =0
 425a834: 38d373a8     	ldursb	w8, [x29, #-0xc9]
 425a838: 36f800a8     	tbz	w8, #0x1f, 0x425a84c <_ChromeMain+0x42555b0>
 425a83c: f85203a0     	ldur	x0, [x29, #-0xe0]
 425a840: f85303a8     	ldur	x8, [x29, #-0xd0]
 425a844: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a848: 96f6b99c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a84c: 9100077b     	add	x27, x27, #0x1
 425a850: 35001317     	cbnz	w23, 0x425aab0 <_ChromeMain+0x4255814>
 425a854: 39c71fe8     	ldrsb	w8, [sp, #0x1c7]
 425a858: 36f800a8     	tbz	w8, #0x1f, 0x425a86c <_ChromeMain+0x42555d0>
 425a85c: f940dbe0     	ldr	x0, [sp, #0x1b0]
 425a860: f940e3e8     	ldr	x8, [sp, #0x1c0]
 425a864: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a868: 96f6b994     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a86c: 39c77fe8     	ldrsb	w8, [sp, #0x1df]
 425a870: 36f800a8     	tbz	w8, #0x1f, 0x425a884 <_ChromeMain+0x42555e8>
 425a874: f940e7e0     	ldr	x0, [sp, #0x1c8]
 425a878: f940efe8     	ldr	x8, [sp, #0x1d8]
 425a87c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a880: 96f6b98e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a884: 39c7dfe8     	ldrsb	w8, [sp, #0x1f7]
 425a888: 36f800a8     	tbz	w8, #0x1f, 0x425a89c <_ChromeMain+0x4255600>
 425a88c: f940f3e0     	ldr	x0, [sp, #0x1e0]
 425a890: f940fbe8     	ldr	x8, [sp, #0x1f0]
 425a894: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a898: 96f6b988     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a89c: 910803e0     	add	x0, sp, #0x200
 425a8a0: 9718d788     	bl	0x8906c0 <_ChromeMain+0x88b424>
 425a8a4: 7101901f     	cmp	w0, #0x64
 425a8a8: 54fff681     	b.ne	0x425a778 <_ChromeMain+0x42554dc>
 425a8ac: a91e7fff     	stp	xzr, xzr, [sp, #0x1e0]
 425a8b0: f900fbff     	str	xzr, [sp, #0x1f0]
 425a8b4: 910783e8     	add	x8, sp, #0x1e0
 425a8b8: 910803e0     	add	x0, sp, #0x200
 425a8bc: 52800081     	mov	w1, #0x4                ; =4
 425a8c0: 9711eebe     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425a8c4: a91cffff     	stp	xzr, xzr, [sp, #0x1c8]
 425a8c8: f900efff     	str	xzr, [sp, #0x1d8]
 425a8cc: 910723e8     	add	x8, sp, #0x1c8
 425a8d0: 910803e0     	add	x0, sp, #0x200
 425a8d4: 528000a1     	mov	w1, #0x5                ; =5
 425a8d8: 9534dc1a     	bl	0x8f91940 <_ChromeMain+0x8f8c6a4>
 425a8dc: a91b7fff     	stp	xzr, xzr, [sp, #0x1b0]
 425a8e0: f900e3ff     	str	xzr, [sp, #0x1c0]
 425a8e4: 9106c3e8     	add	x8, sp, #0x1b0
 425a8e8: 910803e0     	add	x0, sp, #0x200
 425a8ec: 52800021     	mov	w1, #0x1                ; =1
 425a8f0: 9711eeb2     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425a8f4: 3947dfe8     	ldrb	w8, [sp, #0x1f7]
 425a8f8: f940f7e9     	ldr	x9, [sp, #0x1e8]
 425a8fc: 7219011f     	tst	w8, #0x80
 425a900: 9a881128     	csel	x8, x9, x8, ne
 425a904: b5000d68     	cbnz	x8, 0x425aab0 <_ChromeMain+0x4255814>
 425a908: 39477fe8     	ldrb	w8, [sp, #0x1df]
 425a90c: f940ebe9     	ldr	x9, [sp, #0x1d0]
 425a910: 7219011f     	tst	w8, #0x80
 425a914: 9a881128     	csel	x8, x9, x8, ne
 425a918: b4000cc8     	cbz	x8, 0x425aab0 <_ChromeMain+0x4255814>
 425a91c: a9327fbf     	stp	xzr, xzr, [x29, #-0xe0]
 425a920: f81303bf     	stur	xzr, [x29, #-0xd0]
 425a924: 910723e0     	add	x0, sp, #0x1c8
 425a928: d10383a2     	sub	x2, x29, #0xe0
 425a92c: aa1403e1     	mov	x1, x20
 425a930: 9400091c     	bl	0x425cda0 <_ChromeMain+0x4257b04>
 425a934: 34fff7e0     	cbz	w0, 0x425a830 <_ChromeMain+0x4255594>
 425a938: 39871fe8     	ldrsb	x8, [sp, #0x1c7]
 425a93c: a95b2be9     	ldp	x9, x10, [sp, #0x1b0]
 425a940: f100011f     	cmp	x8, #0x0
 425a944: 9a994120     	csel	x0, x9, x25, mi
 425a948: 7100011f     	cmp	w8, #0x0
 425a94c: 9a884141     	csel	x1, x10, x8, mi
 425a950: 6f00e400     	movi.2d	v0, #0000000000000000
 425a954: ad1d03e0     	stp	q0, q0, [sp, #0x3a0]
 425a958: 910e83e2     	add	x2, sp, #0x3a0
 425a95c: 972d8251     	bl	0xdbb2a0 <_ChromeMain+0xdb6004>
 425a960: 52800600     	mov	w0, #0x30               ; =48
 425a964: 96f6d281     	bl	0xf368 <_ChromeMain+0xa0cc>
 425a968: 91008008     	add	x8, x0, #0x20
 425a96c: eb00011f     	cmp	x8, x0
 425a970: 54ffd6c3     	b.lo	0x425a448 <_ChromeMain+0x42551ac>
 425a974: aa0003f6     	mov	x22, x0
 425a978: eb0802bf     	cmp	x21, x8
 425a97c: fa4032a0     	ccmp	x21, x0, #0x0, lo
 425a980: 54ffd642     	b.hs	0x425a448 <_ChromeMain+0x42551ac>
 425a984: ad5d07e0     	ldp	q0, q1, [sp, #0x3a0]
 425a988: ad0006c0     	stp	q0, q1, [x22]
 425a98c: 390082df     	strb	wzr, [x22, #0x20]
 425a990: 389373a8     	ldursb	x8, [x29, #-0xc9]
 425a994: a9722ba9     	ldp	x9, x10, [x29, #-0xe0]
 425a998: f100011f     	cmp	x8, #0x0
 425a99c: 9a984120     	csel	x0, x9, x24, mi
 425a9a0: 7100011f     	cmp	w8, #0x0
 425a9a4: 9a884141     	csel	x1, x10, x8, mi
 425a9a8: aa1603e2     	mov	x2, x22
 425a9ac: 52800403     	mov	w3, #0x20               ; =32
 425a9b0: 52800004     	mov	w4, #0x0                ; =0
 425a9b4: 9726f26d     	bl	0xc17368 <_ChromeMain+0xc120cc>
 425a9b8: aa0003f7     	mov	x23, x0
 425a9bc: 340005c0     	cbz	w0, 0x425aa74 <_ChromeMain+0x42557d8>
 425a9c0: 385373a9     	ldurb	w9, [x29, #-0xc9]
 425a9c4: 13001d28     	sxtb	w8, w9
 425a9c8: f85283aa     	ldur	x10, [x29, #-0xd8]
 425a9cc: 7100011f     	cmp	w8, #0x0
 425a9d0: 9a894149     	csel	x9, x10, x9, mi
 425a9d4: f1007d3f     	cmp	x9, #0x1f
 425a9d8: 54003889     	b.ls	0x425b0e8 <_ChromeMain+0x4255e4c>
 425a9dc: f85203aa     	ldur	x10, [x29, #-0xe0]
 425a9e0: 7100011f     	cmp	w8, #0x0
 425a9e4: 9a984155     	csel	x21, x10, x24, mi
 425a9e8: d1008138     	sub	x24, x9, #0x20
 425a9ec: 92800208     	mov	x8, #-0x11              ; =-17
 425a9f0: f2efffe8     	movk	x8, #0x7fff, lsl #48
 425a9f4: eb08031f     	cmp	x24, x8
 425a9f8: 540037a2     	b.hs	0x425b0ec <_ChromeMain+0x4255e50>
 425a9fc: f1005b1f     	cmp	x24, #0x16
 425aa00: 54000428     	b.hi	0x425aa84 <_ChromeMain+0x42557e8>
 425aa04: 390edff8     	strb	w24, [sp, #0x3b7]
 425aa08: 910e83f9     	add	x25, sp, #0x3a0
 425aa0c: 8b180328     	add	x8, x25, x24
 425aa10: eb19011f     	cmp	x8, x25
 425aa14: 54ffd1a3     	b.lo	0x425a448 <_ChromeMain+0x42551ac>
 425aa18: 910082a1     	add	x1, x21, #0x20
 425aa1c: eb19003f     	cmp	x1, x25
 425aa20: 54000063     	b.lo	0x425aa2c <_ChromeMain+0x4255790>
 425aa24: eb08003f     	cmp	x1, x8
 425aa28: 54ffd103     	b.lo	0x425a448 <_ChromeMain+0x42551ac>
 425aa2c: aa1903e0     	mov	x0, x25
 425aa30: aa1803e2     	mov	x2, x24
 425aa34: 94f6d226     	bl	0x800f2cc <_ChromeMain+0x800a030>
 425aa38: 38386b3f     	strb	wzr, [x25, x24]
 425aa3c: 39c7dfe8     	ldrsb	w8, [sp, #0x1f7]
 425aa40: 36f800a8     	tbz	w8, #0x1f, 0x425aa54 <_ChromeMain+0x42557b8>
 425aa44: f940f3e0     	ldr	x0, [sp, #0x1e0]
 425aa48: f940fbe8     	ldr	x8, [sp, #0x1f0]
 425aa4c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425aa50: 96f6b91a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425aa54: 9100079c     	add	x28, x28, #0x1
 425aa58: 3dc0ebe0     	ldr	q0, [sp, #0x3a0]
 425aa5c: 3d807be0     	str	q0, [sp, #0x1e0]
 425aa60: f941dbe8     	ldr	x8, [sp, #0x3b0]
 425aa64: f900fbe8     	str	x8, [sp, #0x1f0]
 425aa68: d10383b8     	sub	x24, x29, #0xe0
 425aa6c: 910e83f5     	add	x21, sp, #0x3a0
 425aa70: 9106c3f9     	add	x25, sp, #0x1b0
 425aa74: aa1603e0     	mov	x0, x22
 425aa78: 52800601     	mov	w1, #0x30               ; =48
 425aa7c: 96f6b90f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425aa80: 17ffff6d     	b	0x425a834 <_ChromeMain+0x4255598>
 425aa84: 927ceb08     	and	x8, x24, #0x7ffffffffffffff0
 425aa88: 91004100     	add	x0, x8, #0x10
 425aa8c: 96f6d237     	bl	0xf368 <_ChromeMain+0xa0cc>
 425aa90: aa0003f9     	mov	x25, x0
 425aa94: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 425aa98: 927ceb09     	and	x9, x24, #0x7ffffffffffffff0
 425aa9c: cb080128     	sub	x8, x9, x8
 425aaa0: f901d3e0     	str	x0, [sp, #0x3a0]
 425aaa4: f901d7f8     	str	x24, [sp, #0x3a8]
 425aaa8: f901dbe8     	str	x8, [sp, #0x3b0]
 425aaac: 17ffffd8     	b	0x425aa0c <_ChromeMain+0x4255770>
 425aab0: 6f00e400     	movi.2d	v0, #0000000000000000
 425aab4: ad3c03a0     	stp	q0, q0, [x29, #-0x80]
 425aab8: ad3b03a0     	stp	q0, q0, [x29, #-0xa0]
 425aabc: ad3a03a0     	stp	q0, q0, [x29, #-0xc0]
 425aac0: ad3903a0     	stp	q0, q0, [x29, #-0xe0]
 425aac4: 910e83e8     	add	x8, sp, #0x3a0
 425aac8: 910803e0     	add	x0, sp, #0x200
 425aacc: 52800041     	mov	w1, #0x2                ; =2
 425aad0: 9711ee3a     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425aad4: 910803e0     	add	x0, sp, #0x200
 425aad8: 52800261     	mov	w1, #0x13               ; =19
 425aadc: 9711ed75     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425aae0: aa0003e1     	mov	x1, x0
 425aae4: d10383a8     	sub	x8, x29, #0xe0
 425aae8: 910e83e0     	add	x0, sp, #0x3a0
 425aaec: 952c650a     	bl	0x8d73f14 <_ChromeMain+0x8d6ec78>
 425aaf0: 39cedfe8     	ldrsb	w8, [sp, #0x3b7]
 425aaf4: 36f800a8     	tbz	w8, #0x1f, 0x425ab08 <_ChromeMain+0x425586c>
 425aaf8: f941d3e0     	ldr	x0, [sp, #0x3a0]
 425aafc: f941dbe8     	ldr	x8, [sp, #0x3b0]
 425ab00: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ab04: 96f6b8ed     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ab08: 385203a8     	ldurb	w8, [x29, #-0xe0]
 425ab0c: 7100091f     	cmp	w8, #0x2
 425ab10: 54002f02     	b.hs	0x425b0f0 <_ChromeMain+0x4255e54>
 425ab14: 35001328     	cbnz	w8, 0x425ad78 <_ChromeMain+0x4255adc>
 425ab18: 910663e8     	add	x8, sp, #0x198
 425ab1c: 910803e0     	add	x0, sp, #0x200
 425ab20: 52800061     	mov	w1, #0x3                ; =3
 425ab24: 9711ee25     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425ab28: 39c7dfe8     	ldrsb	w8, [sp, #0x1f7]
 425ab2c: 37f800c8     	tbnz	w8, #0x1f, 0x425ab44 <_ChromeMain+0x42558a8>
 425ab30: 3dc07be0     	ldr	q0, [sp, #0x1e0]
 425ab34: 3d8063e0     	str	q0, [sp, #0x180]
 425ab38: f940fbe8     	ldr	x8, [sp, #0x1f0]
 425ab3c: f900cbe8     	str	x8, [sp, #0x190]
 425ab40: 14000004     	b	0x425ab50 <_ChromeMain+0x42558b4>
 425ab44: a95e0be1     	ldp	x1, x2, [sp, #0x1e0]
 425ab48: 910603e0     	add	x0, sp, #0x180
 425ab4c: 96f6f5b3     	bl	0x18218 <_ChromeMain+0x12f7c>
 425ab50: 39c71fe8     	ldrsb	w8, [sp, #0x1c7]
 425ab54: f90027fb     	str	x27, [sp, #0x48]
 425ab58: 37f800c8     	tbnz	w8, #0x1f, 0x425ab70 <_ChromeMain+0x42558d4>
 425ab5c: 3dc06fe0     	ldr	q0, [sp, #0x1b0]
 425ab60: 3d805be0     	str	q0, [sp, #0x160]
 425ab64: f940e3e8     	ldr	x8, [sp, #0x1c0]
 425ab68: f900bbe8     	str	x8, [sp, #0x170]
 425ab6c: 14000004     	b	0x425ab7c <_ChromeMain+0x42558e0>
 425ab70: a95b0be1     	ldp	x1, x2, [sp, #0x1b0]
 425ab74: 910583e0     	add	x0, sp, #0x160
 425ab78: 96f6f5a8     	bl	0x18218 <_ChromeMain+0x12f7c>
 425ab7c: 910523e8     	add	x8, sp, #0x148
 425ab80: 910803e0     	add	x0, sp, #0x200
 425ab84: 528000c1     	mov	w1, #0x6                ; =6
 425ab88: 9711ee0c     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425ab8c: 910803e0     	add	x0, sp, #0x200
 425ab90: 52800001     	mov	w1, #0x0                ; =0
 425ab94: 9711ec27     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ab98: f9001fe0     	str	x0, [sp, #0x38]
 425ab9c: 910803e0     	add	x0, sp, #0x200
 425aba0: 528000e1     	mov	w1, #0x7                ; =7
 425aba4: 9711ec23     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425aba8: f9001be0     	str	x0, [sp, #0x30]
 425abac: 910803e0     	add	x0, sp, #0x200
 425abb0: 52800141     	mov	w1, #0xa                ; =10
 425abb4: 9711ec1f     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425abb8: f90017e0     	str	x0, [sp, #0x28]
 425abbc: 910803e0     	add	x0, sp, #0x200
 425abc0: 52800221     	mov	w1, #0x11               ; =17
 425abc4: 9711ec1b     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425abc8: aa0003f9     	mov	x25, x0
 425abcc: 910803e0     	add	x0, sp, #0x200
 425abd0: 52800101     	mov	w1, #0x8                ; =8
 425abd4: 9711ed37     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425abd8: aa0003f5     	mov	x21, x0
 425abdc: 910803e0     	add	x0, sp, #0x200
 425abe0: 52800121     	mov	w1, #0x9                ; =9
 425abe4: 9711ed33     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425abe8: aa0003fb     	mov	x27, x0
 425abec: 910803e0     	add	x0, sp, #0x200
 425abf0: 528001c1     	mov	w1, #0xe                ; =14
 425abf4: 9711ec0f     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425abf8: 71000c1f     	cmp	w0, #0x3
 425abfc: 5a9f3016     	csinv	w22, w0, wzr, lo
 425ac00: 910803e0     	add	x0, sp, #0x200
 425ac04: 528001a1     	mov	w1, #0xd                ; =13
 425ac08: 9711ec0a     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ac0c: 7100081f     	cmp	w0, #0x2
 425ac10: 52800028     	mov	w8, #0x1                ; =1
 425ac14: 1a881508     	cinc	w8, w8, eq
 425ac18: 7100001f     	cmp	w0, #0x0
 425ac1c: 1a8803f7     	csel	w23, wzr, w8, eq
 425ac20: 385203a8     	ldurb	w8, [x29, #-0xe0]
 425ac24: 350026c8     	cbnz	w8, 0x425b0fc <_ChromeMain+0x4255e60>
 425ac28: f90023fc     	str	x28, [sp, #0x40]
 425ac2c: 390343ff     	strb	wzr, [sp, #0xd0]
 425ac30: 390503ff     	strb	wzr, [sp, #0x140]
 425ac34: 385983a8     	ldurb	w8, [x29, #-0x68]
 425ac38: 34000168     	cbz	w8, 0x425ac64 <_ChromeMain+0x42559c8>
 425ac3c: 910343e0     	add	x0, sp, #0xd0
 425ac40: 91002301     	add	x1, x24, #0x8
 425ac44: 5280003c     	mov	w28, #0x1               ; =1
 425ac48: 96f83503     	bl	0x68054 <_ChromeMain+0x62db8>
 425ac4c: 3cc58300     	ldur	q0, [x24, #0x58]
 425ac50: 910343e8     	add	x8, sp, #0xd0
 425ac54: 3c850100     	stur	q0, [x8, #0x50]
 425ac58: 3cc64300     	ldur	q0, [x24, #0x64]
 425ac5c: 3c85c100     	stur	q0, [x8, #0x5c]
 425ac60: 390503fc     	strb	w28, [sp, #0x140]
 425ac64: 910803e0     	add	x0, sp, #0x200
 425ac68: 528001e1     	mov	w1, #0xf                ; =15
 425ac6c: 9711ebf1     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ac70: 7100081f     	cmp	w0, #0x2
 425ac74: 1a8083f8     	csel	w24, wzr, w0, hi
 425ac78: 910803e0     	add	x0, sp, #0x200
 425ac7c: 52800201     	mov	w1, #0x10               ; =16
 425ac80: 9711ebec     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ac84: aa0003fc     	mov	x28, x0
 425ac88: 910803e0     	add	x0, sp, #0x200
 425ac8c: 52800241     	mov	w1, #0x12               ; =18
 425ac90: 9711ebe8     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ac94: 7100081f     	cmp	w0, #0x2
 425ac98: 52800048     	mov	w8, #0x2                ; =2
 425ac9c: 1a880508     	cinc	w8, w8, ne
 425aca0: 7100041f     	cmp	w0, #0x1
 425aca4: 1a9f1508     	csinc	w8, w8, wzr, ne
 425aca8: 290373f8     	stp	w24, w28, [sp, #0x18]
 425acac: 910343e9     	add	x9, sp, #0xd0
 425acb0: f9000be9     	str	x9, [sp, #0x10]
 425acb4: 2900dff6     	stp	w22, w23, [sp, #0x4]
 425acb8: 390007fb     	strb	w27, [sp, #0x1]
 425acbc: 910663e0     	add	x0, sp, #0x198
 425acc0: 910603e1     	add	x1, sp, #0x180
 425acc4: 910583e2     	add	x2, sp, #0x160
 425acc8: 910523e3     	add	x3, sp, #0x148
 425accc: 390003f5     	strb	w21, [sp]
 425acd0: 528000a9     	mov	w9, #0x5                ; =5
 425acd4: 290427e8     	stp	w8, w9, [sp, #0x20]
 425acd8: a94313e5     	ldp	x5, x4, [sp, #0x30]
 425acdc: f94017e6     	ldr	x6, [sp, #0x28]
 425ace0: aa1903e7     	mov	x7, x25
 425ace4: 97664a3b     	bl	0x1bed5d0 <_ChromeMain+0x1be8334>
 425ace8: aa0003f6     	mov	x22, x0
 425acec: 394503e8     	ldrb	w8, [sp, #0x140]
 425acf0: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 425acf4: 910e83f5     	add	x21, sp, #0x3a0
 425acf8: 9106c3f9     	add	x25, sp, #0x1b0
 425acfc: 340000a8     	cbz	w8, 0x425ad10 <_ChromeMain+0x4255a74>
 425ad00: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 425ad04: 37f81d08     	tbnz	w8, #0x1f, 0x425b0a4 <_ChromeMain+0x4255e08>
 425ad08: 39c3bfe8     	ldrsb	w8, [sp, #0xef]
 425ad0c: 37f82048     	tbnz	w8, #0x1f, 0x425b114 <_ChromeMain+0x4255e78>
 425ad10: 39c57fe8     	ldrsb	w8, [sp, #0x15f]
 425ad14: 36f800a8     	tbz	w8, #0x1f, 0x425ad28 <_ChromeMain+0x4255a8c>
 425ad18: f940a7e0     	ldr	x0, [sp, #0x148]
 425ad1c: f940afe8     	ldr	x8, [sp, #0x158]
 425ad20: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ad24: 96f6b865     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ad28: 39c5dfe8     	ldrsb	w8, [sp, #0x177]
 425ad2c: d10383b8     	sub	x24, x29, #0xe0
 425ad30: 36f800a8     	tbz	w8, #0x1f, 0x425ad44 <_ChromeMain+0x4255aa8>
 425ad34: f940b3e0     	ldr	x0, [sp, #0x160]
 425ad38: f940bbe8     	ldr	x8, [sp, #0x170]
 425ad3c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ad40: 96f6b85e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ad44: 39c65fe8     	ldrsb	w8, [sp, #0x197]
 425ad48: 36f800a8     	tbz	w8, #0x1f, 0x425ad5c <_ChromeMain+0x4255ac0>
 425ad4c: f940c3e0     	ldr	x0, [sp, #0x180]
 425ad50: f940cbe8     	ldr	x8, [sp, #0x190]
 425ad54: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ad58: 96f6b858     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ad5c: 39c6bfe8     	ldrsb	w8, [sp, #0x1af]
 425ad60: 36f800a8     	tbz	w8, #0x1f, 0x425ad74 <_ChromeMain+0x4255ad8>
 425ad64: f940cfe0     	ldr	x0, [sp, #0x198]
 425ad68: f940d7e8     	ldr	x8, [sp, #0x1a8]
 425ad6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ad70: 96f6b852     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ad74: b5000096     	cbnz	x22, 0x425ad84 <_ChromeMain+0x4255ae8>
 425ad78: d10383a0     	sub	x0, x29, #0xe0
 425ad7c: 94c79387     	bl	0x743fb98 <_ChromeMain+0x743a8fc>
 425ad80: 17fffeb5     	b	0x425a854 <_ChromeMain+0x42555b8>
 425ad84: 910803e0     	add	x0, sp, #0x200
 425ad88: 52800101     	mov	w1, #0x8                ; =8
 425ad8c: 9711ecc9     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425ad90: 910e83f8     	add	x24, sp, #0x3a0
 425ad94: 370000e0     	tbnz	w0, #0x0, 0x425adb0 <_ChromeMain+0x4255b14>
 425ad98: 910803e0     	add	x0, sp, #0x200
 425ad9c: 528001e1     	mov	w1, #0xf                ; =15
 425ada0: 9711eba4     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ada4: 7100081f     	cmp	w0, #0x2
 425ada8: 1a9f17f7     	cset	w23, eq
 425adac: 14000002     	b	0x425adb4 <_ChromeMain+0x4255b18>
 425adb0: 52800037     	mov	w23, #0x1               ; =1
 425adb4: f90063ff     	str	xzr, [sp, #0xc0]
 425adb8: 6f00e400     	movi.2d	v0, #0000000000000000
 425adbc: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 425adc0: ad0403e0     	stp	q0, q0, [sp, #0x80]
 425adc4: ad0303e0     	stp	q0, q0, [sp, #0x60]
 425adc8: 3d8017e0     	str	q0, [sp, #0x50]
 425adcc: 39871fe8     	ldrsb	x8, [sp, #0x1c7]
 425add0: a95b2be9     	ldp	x9, x10, [sp, #0x1b0]
 425add4: f100011f     	cmp	x8, #0x0
 425add8: 9106c3eb     	add	x11, sp, #0x1b0
 425addc: 9a8b4139     	csel	x25, x9, x11, mi
 425ade0: 7100011f     	cmp	w8, #0x0
 425ade4: 9a884155     	csel	x21, x10, x8, mi
 425ade8: 910e83e8     	add	x8, sp, #0x3a0
 425adec: 910803e0     	add	x0, sp, #0x200
 425adf0: 528000c1     	mov	w1, #0x6                ; =6
 425adf4: 9711ed71     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425adf8: 398edfe8     	ldrsb	x8, [sp, #0x3b7]
 425adfc: f941d3e9     	ldr	x9, [sp, #0x3a0]
 425ae00: f941d7ea     	ldr	x10, [sp, #0x3a8]
 425ae04: f100011f     	cmp	x8, #0x0
 425ae08: 9a984122     	csel	x2, x9, x24, mi
 425ae0c: 7100011f     	cmp	w8, #0x0
 425ae10: 9a884143     	csel	x3, x10, x8, mi
 425ae14: 710002ff     	cmp	w23, #0x0
 425ae18: 52800088     	mov	w8, #0x4                ; =4
 425ae1c: 9a880517     	cinc	x23, x8, ne
 425ae20: d0044e28     	adrp	x8, 0xcc20000 <dyld_stub_binder+0xcc20000>
 425ae24: 91012d08     	add	x8, x8, #0x4b
 425ae28: d0044e29     	adrp	x9, 0xcc20000 <dyld_stub_binder+0xcc20000>
 425ae2c: 91011529     	add	x9, x9, #0x45
 425ae30: 9a881138     	csel	x24, x9, x8, ne
 425ae34: 910143e8     	add	x8, sp, #0x50
 425ae38: aa1903e0     	mov	x0, x25
 425ae3c: aa1503e1     	mov	x1, x21
 425ae40: aa1803e4     	mov	x4, x24
 425ae44: aa1703e5     	mov	x5, x23
 425ae48: 970f712e     	bl	0x637300 <_ChromeMain+0x632064>
 425ae4c: 39cedfe8     	ldrsb	w8, [sp, #0x3b7]
 425ae50: 36f800a8     	tbz	w8, #0x1f, 0x425ae64 <_ChromeMain+0x4255bc8>
 425ae54: f941d3e0     	ldr	x0, [sp, #0x3a0]
 425ae58: f941dbe8     	ldr	x8, [sp, #0x3b0]
 425ae5c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ae60: 96f6b816     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ae64: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425ae68: 910e83f5     	add	x21, sp, #0x3a0
 425ae6c: 9106c3f9     	add	x25, sp, #0x1b0
 425ae70: 370003c8     	tbnz	w8, #0x0, 0x425aee8 <_ChromeMain+0x4255c4c>
 425ae74: 39871fe8     	ldrsb	x8, [sp, #0x1c7]
 425ae78: a95b2be9     	ldp	x9, x10, [sp, #0x1b0]
 425ae7c: f100011f     	cmp	x8, #0x0
 425ae80: 9a994120     	csel	x0, x9, x25, mi
 425ae84: 7100011f     	cmp	w8, #0x0
 425ae88: 9a884141     	csel	x1, x10, x8, mi
 425ae8c: 910e83e8     	add	x8, sp, #0x3a0
 425ae90: d004ac62     	adrp	x2, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 425ae94: 9104f042     	add	x2, x2, #0x13c
 425ae98: 52800023     	mov	w3, #0x1                ; =1
 425ae9c: aa1803e4     	mov	x4, x24
 425aea0: aa1703e5     	mov	x5, x23
 425aea4: 970f7117     	bl	0x637300 <_ChromeMain+0x632064>
 425aea8: 910143e0     	add	x0, sp, #0x50
 425aeac: 910e83e1     	add	x1, sp, #0x3a0
 425aeb0: 970e7b0c     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425aeb4: 9101c2a0     	add	x0, x21, #0x70
 425aeb8: d2800001     	mov	x1, #0x0                ; =0
 425aebc: 96f7337f     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425aec0: 910082a0     	add	x0, x21, #0x20
 425aec4: 96f7336d     	bl	0x27c78 <_ChromeMain+0x229dc>
 425aec8: 39cedfe8     	ldrsb	w8, [sp, #0x3b7]
 425aecc: 36f800a8     	tbz	w8, #0x1f, 0x425aee0 <_ChromeMain+0x4255c44>
 425aed0: f941d3e0     	ldr	x0, [sp, #0x3a0]
 425aed4: f941dbe8     	ldr	x8, [sp, #0x3b0]
 425aed8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425aedc: 96f6b7f7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425aee0: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425aee4: 34000768     	cbz	w8, 0x425afd0 <_ChromeMain+0x4255d34>
 425aee8: 910e83e0     	add	x0, sp, #0x3a0
 425aeec: aa1603e1     	mov	x1, x22
 425aef0: 973415a8     	bl	0xf60590 <_ChromeMain+0xf5b2f4>
 425aef4: 9104c2a0     	add	x0, x21, #0x130
 425aef8: 910143e1     	add	x1, sp, #0x50
 425aefc: 96fb7c26     	bl	0x139f94 <_ChromeMain+0x134cf8>
 425af00: a9402668     	ldp	x8, x9, [x19]
 425af04: 5280350a     	mov	w10, #0x1a8             ; =424
 425af08: 9b0a2120     	madd	x0, x9, x10, x8
 425af0c: f901cfe0     	str	x0, [sp, #0x398]
 425af10: f9400a68     	ldr	x8, [x19, #0x10]
 425af14: 910e63ea     	add	x10, sp, #0x398
 425af18: f901c3ea     	str	x10, [sp, #0x380]
 425af1c: f901c7f5     	str	x21, [sp, #0x388]
 425af20: f901cbf3     	str	x19, [sp, #0x390]
 425af24: eb08013f     	cmp	x9, x8
 425af28: 54000ca0     	b.eq	0x425b0bc <_ChromeMain+0x4255e20>
 425af2c: b4ffa8e0     	cbz	x0, 0x425a448 <_ChromeMain+0x42551ac>
 425af30: 910e83e1     	add	x1, sp, #0x3a0
 425af34: 97341597     	bl	0xf60590 <_ChromeMain+0xf5b2f4>
 425af38: 9104c000     	add	x0, x0, #0x130
 425af3c: 9104c2a1     	add	x1, x21, #0x130
 425af40: 96fdffc1     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 425af44: f941cfe8     	ldr	x8, [sp, #0x398]
 425af48: 9106a108     	add	x8, x8, #0x1a8
 425af4c: f901cfe8     	str	x8, [sp, #0x398]
 425af50: f941cfe8     	ldr	x8, [sp, #0x398]
 425af54: f9400269     	ldr	x9, [x19]
 425af58: eb090108     	subs	x8, x8, x9
 425af5c: 9343fd08     	asr	x8, x8, #3
 425af60: 9b1a7d08     	mul	x8, x8, x26
 425af64: f9000668     	str	x8, [x19, #0x8]
 425af68: 54ffa700     	b.eq	0x425a448 <_ChromeMain+0x42551ac>
 425af6c: 910682a0     	add	x0, x21, #0x1a0
 425af70: d2800001     	mov	x1, #0x0                ; =0
 425af74: 96f73351     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425af78: 910542a0     	add	x0, x21, #0x150
 425af7c: 96f7333f     	bl	0x27c78 <_ChromeMain+0x229dc>
 425af80: 39d39fe8     	ldrsb	w8, [sp, #0x4e7]
 425af84: 36f800a8     	tbz	w8, #0x1f, 0x425af98 <_ChromeMain+0x4255cfc>
 425af88: f9426be0     	ldr	x0, [sp, #0x4d0]
 425af8c: f94273e8     	ldr	x8, [sp, #0x4e0]
 425af90: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425af94: 96f6b7c9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425af98: d00503c8     	adrp	x8, 0xe2d4000 <dyld_stub_binder+0xe2d4000>
 425af9c: 910d2108     	add	x8, x8, #0x348
 425afa0: f901d3e8     	str	x8, [sp, #0x3a0]
 425afa4: 3952a3e8     	ldrb	w8, [sp, #0x4a8]
 425afa8: 34000108     	cbz	w8, 0x425afc8 <_ChromeMain+0x4255d2c>
 425afac: f94243e0     	ldr	x0, [sp, #0x480]
 425afb0: b40000c0     	cbz	x0, 0x425afc8 <_ChromeMain+0x4255d2c>
 425afb4: f94247e8     	ldr	x8, [sp, #0x488]
 425afb8: cb0003e9     	neg	x9, x0
 425afbc: eb09011f     	cmp	x8, x9
 425afc0: 54ffa448     	b.hi	0x425a448 <_ChromeMain+0x42551ac>
 425afc4: 14000041     	b	0x425b0c8 <_ChromeMain+0x4255e2c>
 425afc8: 910e83e0     	add	x0, sp, #0x3a0
 425afcc: 974da3b1     	bl	0x15c3e90 <_ChromeMain+0x15bebf4>
 425afd0: 910143f7     	add	x23, sp, #0x50
 425afd4: 9101c2e0     	add	x0, x23, #0x70
 425afd8: d2800001     	mov	x1, #0x0                ; =0
 425afdc: 96f73337     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425afe0: 910082e0     	add	x0, x23, #0x20
 425afe4: 96f73325     	bl	0x27c78 <_ChromeMain+0x229dc>
 425afe8: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 425afec: 36f800a8     	tbz	w8, #0x1f, 0x425b000 <_ChromeMain+0x4255d64>
 425aff0: f9402be0     	ldr	x0, [sp, #0x50]
 425aff4: f94033e8     	ldr	x8, [sp, #0x60]
 425aff8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425affc: 96f6b7af     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b000: b00503c8     	adrp	x8, 0xe2d4000 <dyld_stub_binder+0xe2d4000>
 425b004: 910d2108     	add	x8, x8, #0x348
 425b008: f90002c8     	str	x8, [x22]
 425b00c: 394422c8     	ldrb	w8, [x22, #0x108]
 425b010: d10383b8     	sub	x24, x29, #0xe0
 425b014: 34000148     	cbz	w8, 0x425b03c <_ChromeMain+0x4255da0>
 425b018: f94072c0     	ldr	x0, [x22, #0xe0]
 425b01c: b4000100     	cbz	x0, 0x425b03c <_ChromeMain+0x4255da0>
 425b020: f94076c8     	ldr	x8, [x22, #0xe8]
 425b024: cb0003e9     	neg	x9, x0
 425b028: eb09011f     	cmp	x8, x9
 425b02c: 54ffa0e8     	b.hi	0x425a448 <_ChromeMain+0x42551ac>
 425b030: f90076df     	str	xzr, [x22, #0xe8]
 425b034: f9407ac1     	ldr	x1, [x22, #0xf0]
 425b038: 96f6b7a0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b03c: aa1603e0     	mov	x0, x22
 425b040: 974da394     	bl	0x15c3e90 <_ChromeMain+0x15bebf4>
 425b044: 52802601     	mov	w1, #0x130              ; =304
 425b048: 96f6b79c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b04c: 17ffff4b     	b	0x425ad78 <_ChromeMain+0x4255adc>
 425b050: f941b3e0     	ldr	x0, [sp, #0x360]
 425b054: f941bbe8     	ldr	x8, [sp, #0x370]
 425b058: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b05c: 96f6b797     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b060: 17fffd44     	b	0x425a570 <_ChromeMain+0x42552d4>
 425b064: 34ffba48     	cbz	w8, 0x425a7ac <_ChromeMain+0x4255510>
 425b068: 17fffdd5     	b	0x425a7bc <_ChromeMain+0x4255520>
 425b06c: f814011f     	stur	xzr, [x8, #-0xc0]
 425b070: f8548101     	ldur	x1, [x8, #-0xb8]
 425b074: 96f6b791     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b078: 17fffcf5     	b	0x425a44c <_ChromeMain+0x42551b0>
 425b07c: 13001d09     	sxtb	w9, w8
 425b080: 7100013f     	cmp	w9, #0x0
 425b084: 910e83e9     	add	x9, sp, #0x3a0
 425b088: f941d3ea     	ldr	x10, [sp, #0x3a0]
 425b08c: f941d7eb     	ldr	x11, [sp, #0x3a8]
 425b090: 9a894141     	csel	x1, x10, x9, mi
 425b094: 9a884162     	csel	x2, x11, x8, mi
 425b098: 910cc3e0     	add	x0, sp, #0x330
 425b09c: 970936d9     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 425b0a0: 17fffd6f     	b	0x425a65c <_ChromeMain+0x42553c0>
 425b0a4: f9407be0     	ldr	x0, [sp, #0xf0]
 425b0a8: f94083e8     	ldr	x8, [sp, #0x100]
 425b0ac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b0b0: 96f6b782     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b0b4: 17ffff15     	b	0x425ad08 <_ChromeMain+0x4255a6c>
 425b0b8: 94f6a4aa     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 425b0bc: 910e03e0     	add	x0, sp, #0x380
 425b0c0: 940007a4     	bl	0x425cf50 <_ChromeMain+0x4257cb4>
 425b0c4: 17ffffa3     	b	0x425af50 <_ChromeMain+0x4255cb4>
 425b0c8: f90247ff     	str	xzr, [sp, #0x488]
 425b0cc: f9424be1     	ldr	x1, [sp, #0x490]
 425b0d0: 96f6b77a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b0d4: 17ffffbd     	b	0x425afc8 <_ChromeMain+0x4255d2c>
 425b0d8: 35ffafc8     	cbnz	w8, 0x425a6d0 <_ChromeMain+0x4255434>
 425b0dc: 17fffcea     	b	0x425a484 <_ChromeMain+0x42551e8>
 425b0e0: 390d7fff     	strb	wzr, [sp, #0x35f]
 425b0e4: 17fffce8     	b	0x425a484 <_ChromeMain+0x42551e8>
 425b0e8: 94269476     	bl	0x4c002c0 <_ChromeMain+0x4bfb024>
 425b0ec: 942694a8     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 425b0f0: d4200000     	brk	#0
 425b0f4: d4400000     	hlt	#0
 425b0f8: d4200020     	brk	#0x1
 425b0fc: d4200000     	brk	#0
 425b100: d4400000     	hlt	#0
 425b104: d4200020     	brk	#0x1
 425b108: f941abe8     	ldr	x8, [sp, #0x350]
 425b10c: b4ffa5e8     	cbz	x8, 0x425a5c8 <_ChromeMain+0x425532c>
 425b110: 17fffd55     	b	0x425a664 <_ChromeMain+0x42553c8>
 425b114: f9406fe0     	ldr	x0, [sp, #0xd8]
 425b118: f94077e8     	ldr	x8, [sp, #0xe8]
 425b11c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b120: 96f6b766     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b124: 17fffefb     	b	0x425ad10 <_ChromeMain+0x4255a74>
