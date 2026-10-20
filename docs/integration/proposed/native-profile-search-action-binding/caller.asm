
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 407a424: d102c3ff     	sub	sp, sp, #0xb0
 407a428: a90857f6     	stp	x22, x21, [sp, #0x80]
 407a42c: a9094ff4     	stp	x20, x19, [sp, #0x90]
 407a430: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 407a434: 910283fd     	add	x29, sp, #0xa0
 407a438: aa0803f3     	mov	x19, x8
 407a43c: 3940c008     	ldrb	w8, [x0, #0x30]
 407a440: 360014e8     	tbz	w8, #0x0, 0x407a6dc <_ChromeMain+0x4075440>
 407a444: aa0003f4     	mov	x20, x0
 407a448: 6f00e400     	movi.2d	v0, #0000000000000000
 407a44c: ad0203e0     	stp	q0, q0, [sp, #0x40]
 407a450: 910103e8     	add	x8, sp, #0x40
 407a454: 91006000     	add	x0, x0, #0x18
 407a458: 940d9ac8     	bl	0x43e0f78 <_ChromeMain+0x43dbcdc>
 407a45c: 394163e8     	ldrb	w8, [sp, #0x58]
 407a460: 36000768     	tbz	w8, #0x0, 0x407a54c <_ChromeMain+0x40752b0>
 407a464: f940ea80     	ldr	x0, [x20, #0x1d0]
 407a468: b5000040     	cbnz	x0, 0x407a470 <_ChromeMain+0x40751d4>
 407a46c: f940e680     	ldr	x0, [x20, #0x1c8]
 407a470: 97589cff     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 407a474: 394163e8     	ldrb	w8, [sp, #0x58]
 407a478: 36001328     	tbz	w8, #0x0, 0x407a6dc <_ChromeMain+0x4075440>
 407a47c: 91002000     	add	x0, x0, #0x8
 407a480: 910103e1     	add	x1, sp, #0x40
 407a484: 972e0ba0     	bl	0xbfd304 <_ChromeMain+0xbf8068>
 407a488: b5000860     	cbnz	x0, 0x407a594 <_ChromeMain+0x40752f8>
 407a48c: 52800600     	mov	w0, #0x30               ; =48
 407a490: 96fe53b6     	bl	0xf368 <_ChromeMain+0xa0cc>
 407a494: f90013e0     	str	x0, [sp, #0x20]
 407a498: 9004f608     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 407a49c: 3dc2e500     	ldr	q0, [x8, #0xb90]
 407a4a0: 3c8283e0     	stur	q0, [sp, #0x28]
 407a4a4: 91008c09     	add	x9, x0, #0x23
 407a4a8: eb00013f     	cmp	x9, x0
 407a4ac: 54001183     	b.lo	0x407a6dc <_ChromeMain+0x4075440>
 407a4b0: b0046ec8     	adrp	x8, 0xce53000 <dyld_stub_binder+0xce53000>
 407a4b4: 9109d108     	add	x8, x8, #0x274
 407a4b8: eb08013f     	cmp	x9, x8
 407a4bc: fa488002     	ccmp	x0, x8, #0x2, hi
 407a4c0: 540010e9     	b.ls	0x407a6dc <_ChromeMain+0x4075440>
 407a4c4: 52840c89     	mov	w9, #0x2064             ; =8292
 407a4c8: 72a5c549     	movk	w9, #0x2e2a, lsl #16
 407a4cc: b801f009     	stur	w9, [x0, #0x1f]
 407a4d0: ad400500     	ldp	q0, q1, [x8]
 407a4d4: ad000400     	stp	q0, q1, [x0]
 407a4d8: 39008c1f     	strb	wzr, [x0, #0x23]
 407a4dc: 394163e8     	ldrb	w8, [sp, #0x58]
 407a4e0: 36000fe8     	tbz	w8, #0x0, 0x407a6dc <_ChromeMain+0x4075440>
 407a4e4: 9100ffe8     	add	x8, sp, #0x3f
 407a4e8: 910083e1     	add	x1, sp, #0x20
 407a4ec: 910103e2     	add	x2, sp, #0x40
 407a4f0: aa1403e0     	mov	x0, x20
 407a4f4: 94af239b     	bl	0x6c43360 <_ChromeMain+0x6c3e0c4>
 407a4f8: 3940fff5     	ldrb	w21, [sp, #0x3f]
 407a4fc: b0015fe8     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 407a500: 91397108     	add	x8, x8, #0xe5c
 407a504: a93d7fa8     	stp	x8, xzr, [x29, #-0x30]
 407a508: f81c83b4     	stur	x20, [x29, #-0x38]
 407a50c: f000b120     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 407a510: 91120000     	add	x0, x0, #0x480
 407a514: d100c3a1     	sub	x1, x29, #0x30
 407a518: d100e3a2     	sub	x2, x29, #0x38
 407a51c: 94aff9af     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 407a520: 39000275     	strb	w21, [x19]
 407a524: f9000660     	str	x0, [x19, #0x8]
 407a528: 52800028     	mov	w8, #0x1                ; =1
 407a52c: 39004268     	strb	w8, [x19, #0x10]
 407a530: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 407a534: 36f80168     	tbz	w8, #0x1f, 0x407a560 <_ChromeMain+0x40752c4>
 407a538: f94013e0     	ldr	x0, [sp, #0x20]
 407a53c: f9401be8     	ldr	x8, [sp, #0x30]
 407a540: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 407a544: 96fe3a5d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 407a548: 14000006     	b	0x407a560 <_ChromeMain+0x40752c4>
 407a54c: aa1403e0     	mov	x0, x20
 407a550: 94aff45f     	bl	0x6c776cc <_ChromeMain+0x6c72430>
 407a554: aa1303e8     	mov	x8, x19
 407a558: aa1403e0     	mov	x0, x20
 407a55c: 94aff3ee     	bl	0x6c77514 <_ChromeMain+0x6c72278>
 407a560: 394163e8     	ldrb	w8, [sp, #0x58]
 407a564: 340000e8     	cbz	w8, 0x407a580 <_ChromeMain+0x40752e4>
 407a568: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 407a56c: 36f800a8     	tbz	w8, #0x1f, 0x407a580 <_ChromeMain+0x40752e4>
 407a570: f94023e0     	ldr	x0, [sp, #0x40]
 407a574: f9402be8     	ldr	x8, [sp, #0x50]
 407a578: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 407a57c: 96fe3a4f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 407a580: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 407a584: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 407a588: a94857f6     	ldp	x22, x21, [sp, #0x80]
 407a58c: 9102c3ff     	add	sp, sp, #0xb0
 407a590: d65f03c0     	ret
 407a594: aa0003f5     	mov	x21, x0
 407a598: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 407a59c: f9001bff     	str	xzr, [sp, #0x30]
 407a5a0: d0057400     	adrp	x0, 0xeefc000 <dyld_stub_binder+0xeefc000>
 407a5a4: 91262000     	add	x0, x0, #0x988
 407a5a8: 97965ca6     	bl	0x2611840 <_ChromeMain+0x260c5a4>
 407a5ac: f940ea96     	ldr	x22, [x20, #0x1d0]
 407a5b0: b5000056     	cbnz	x22, 0x407a5b8 <_ChromeMain+0x407531c>
 407a5b4: f940e696     	ldr	x22, [x20, #0x1c8]
 407a5b8: d0057400     	adrp	x0, 0xeefc000 <dyld_stub_binder+0xeefc000>
 407a5bc: 91262000     	add	x0, x0, #0x988
 407a5c0: 97965ca0     	bl	0x2611840 <_ChromeMain+0x260c5a4>
 407a5c4: aa1603e1     	mov	x1, x22
 407a5c8: 52800022     	mov	w2, #0x1                ; =1
 407a5cc: 96ff61f2     	bl	0x52d94 <_ChromeMain+0x4daf8>
 407a5d0: f9401816     	ldr	x22, [x0, #0x30]
 407a5d4: f940f280     	ldr	x0, [x20, #0x1e0]
 407a5d8: b4000080     	cbz	x0, 0x407a5e8 <_ChromeMain+0x407534c>
 407a5dc: 970fdd15     	bl	0x471a30 <_ChromeMain+0x46c794>
 407a5e0: aa0003e2     	mov	x2, x0
 407a5e4: 14000002     	b	0x407a5ec <_ChromeMain+0x4075350>
 407a5e8: d2800002     	mov	x2, #0x0                ; =0
 407a5ec: f940ea83     	ldr	x3, [x20, #0x1d0]
 407a5f0: b5000043     	cbnz	x3, 0x407a5f8 <_ChromeMain+0x407535c>
 407a5f4: f940e683     	ldr	x3, [x20, #0x1c8]
 407a5f8: 3944e684     	ldrb	w4, [x20, #0x139]
 407a5fc: 910083e5     	add	x5, sp, #0x20
 407a600: aa1603e0     	mov	x0, x22
 407a604: aa1503e1     	mov	x1, x21
 407a608: 94013bda     	bl	0x40c9570 <_ChromeMain+0x40c42d4>
 407a60c: 360001c0     	tbz	w0, #0x0, 0x407a644 <_ChromeMain+0x40753a8>
 407a610: aa1303e8     	mov	x8, x19
 407a614: aa1403e0     	mov	x0, x20
 407a618: 94aff560     	bl	0x6c77b98 <_ChromeMain+0x6c728fc>
 407a61c: b0015fe8     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 407a620: 91397108     	add	x8, x8, #0xe5c
 407a624: a93d7fa8     	stp	x8, xzr, [x29, #-0x30]
 407a628: f81c83b4     	stur	x20, [x29, #-0x38]
 407a62c: f000b120     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 407a630: 91120000     	add	x0, x0, #0x480
 407a634: d100c3a1     	sub	x1, x29, #0x30
 407a638: d100e3a2     	sub	x2, x29, #0x38
 407a63c: 94aff967     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 407a640: 17ffffb9     	b	0x407a524 <_ChromeMain+0x4075288>
 407a644: 3940dfe8     	ldrb	w8, [sp, #0x37]
 407a648: f94017e9     	ldr	x9, [sp, #0x28]
 407a64c: 7219011f     	tst	w8, #0x80
 407a650: 9a881128     	csel	x8, x9, x8, ne
 407a654: b50000a8     	cbnz	x8, 0x407a668 <_ChromeMain+0x40753cc>
 407a658: b0046ec1     	adrp	x1, 0xce53000 <dyld_stub_binder+0xce53000>
 407a65c: 910f0421     	add	x1, x1, #0x3c1
 407a660: 910083e0     	add	x0, sp, #0x20
 407a664: 974df538     	bl	0x13f7b44 <_ChromeMain+0x13f28a8>
 407a668: 3dc00be0     	ldr	q0, [sp, #0x20]
 407a66c: 3d8003e0     	str	q0, [sp]
 407a670: f9401be8     	ldr	x8, [sp, #0x30]
 407a674: f9000be8     	str	x8, [sp, #0x10]
 407a678: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 407a67c: f90013ff     	str	xzr, [sp, #0x20]
 407a680: 910003e1     	mov	x1, sp
 407a684: aa1303e8     	mov	x8, x19
 407a688: aa1403e0     	mov	x0, x20
 407a68c: 94aff331     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 407a690: b0015fe8     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 407a694: 91397108     	add	x8, x8, #0xe5c
 407a698: a93d7fa8     	stp	x8, xzr, [x29, #-0x30]
 407a69c: f81c83b4     	stur	x20, [x29, #-0x38]
 407a6a0: f000b120     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 407a6a4: 91120000     	add	x0, x0, #0x480
 407a6a8: d100c3a1     	sub	x1, x29, #0x30
 407a6ac: d100e3a2     	sub	x2, x29, #0x38
