
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
