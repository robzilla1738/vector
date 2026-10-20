
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460a228: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 460a22c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 460a230: a9027bfd     	stp	x29, x30, [sp, #0x20]
 460a234: 910083fd     	add	x29, sp, #0x20
 460a238: d11603ff     	sub	sp, sp, #0x580
 460a23c: f941a008     	ldr	x8, [x0, #0x340]
 460a240: b40008a8     	cbz	x8, 0x460a354 <_ChromeMain+0x46050b8>
 460a244: aa0103f4     	mov	x20, x1
 460a248: aa0003f3     	mov	x19, x0
 460a24c: f941b408     	ldr	x8, [x0, #0x368]
 460a250: eb08003f     	cmp	x1, x8
 460a254: 54000802     	b.hs	0x460a354 <_ChromeMain+0x46050b8>
 460a258: f941a668     	ldr	x8, [x19, #0x348]
 460a25c: b4000868     	cbz	x8, 0x460a368 <_ChromeMain+0x46050cc>
 460a260: f941b268     	ldr	x8, [x19, #0x360]
 460a264: 52804d09     	mov	w9, #0x268              ; =616
 460a268: 9b092281     	madd	x1, x20, x9, x8
 460a26c: aa1303e0     	mov	x0, x19
 460a270: 97fff54c     	bl	0x46077a0 <_ChromeMain+0x4602504>
 460a274: d360fc08     	lsr	x8, x0, #32
 460a278: b5000948     	cbnz	x8, 0x460a3a0 <_ChromeMain+0x4605104>
 460a27c: f941b668     	ldr	x8, [x19, #0x368]
 460a280: f81d03bf     	stur	xzr, [x29, #-0x30]
 460a284: 6f00e400     	movi.2d	v0, #0000000000000000
 460a288: ad3d83a0     	stp	q0, q0, [x29, #-0x50]
 460a28c: ad3c83a0     	stp	q0, q0, [x29, #-0x70]
 460a290: ad3b83a0     	stp	q0, q0, [x29, #-0x90]
 460a294: 3c9603a0     	stur	q0, [x29, #-0xa0]
 460a298: eb08029f     	cmp	x20, x8
 460a29c: 540009e2     	b.hs	0x460a3d8 <_ChromeMain+0x460513c>
 460a2a0: f941b268     	ldr	x8, [x19, #0x360]
 460a2a4: 52804d09     	mov	w9, #0x268              ; =616
 460a2a8: 9b092281     	madd	x1, x20, x9, x8
 460a2ac: d10283b4     	sub	x20, x29, #0xa0
 460a2b0: d10283a0     	sub	x0, x29, #0xa0
 460a2b4: 96ecbf38     	bl	0x139f94 <_ChromeMain+0x134cf8>
 460a2b8: 385783a8     	ldurb	w8, [x29, #-0x88]
 460a2bc: 34000368     	cbz	w8, 0x460a328 <_ChromeMain+0x460508c>
 460a2c0: 910003e0     	mov	x0, sp
 460a2c4: 5280a001     	mov	w1, #0x500              ; =1280
 460a2c8: 94e7fd52     	bl	0x8009810 <_ChromeMain+0x8004574>
 460a2cc: f941a268     	ldr	x8, [x19, #0x340]
 460a2d0: 9100a109     	add	x9, x8, #0x28
 460a2d4: f100011f     	cmp	x8, #0x0
 460a2d8: 9a8903e1     	csel	x1, xzr, x9, eq
 460a2dc: 52800053     	mov	w19, #0x2               ; =2
 460a2e0: 910003e0     	mov	x0, sp
 460a2e4: d10283a2     	sub	x2, x29, #0xa0
 460a2e8: 52800043     	mov	w3, #0x2                ; =2
 460a2ec: 97af08fc     	bl	0x31cc6dc <_ChromeMain+0x31c7440>
 460a2f0: 52800068     	mov	w8, #0x3                ; =3
 460a2f4: b90273e8     	str	w8, [sp, #0x270]
 460a2f8: b90293f3     	str	w19, [sp, #0x290]
 460a2fc: 381df3bf     	sturb	wzr, [x29, #-0x21]
 460a300: 910003e0     	mov	x0, sp
 460a304: d10087a1     	sub	x1, x29, #0x21
 460a308: 97c2ea8e     	bl	0x36c4d40 <_ChromeMain+0x36bfaa4>
 460a30c: b50003c0     	cbnz	x0, 0x460a384 <_ChromeMain+0x46050e8>
 460a310: f94133e0     	ldr	x0, [sp, #0x260]
 460a314: b4000060     	cbz	x0, 0x460a320 <_ChromeMain+0x4605084>
 460a318: d10283a1     	sub	x1, x29, #0xa0
 460a31c: 97fd3666     	bl	0x4557cb4 <_ChromeMain+0x4552a18>
 460a320: 910003e0     	mov	x0, sp
 460a324: 97af0945     	bl	0x31cc838 <_ChromeMain+0x31c759c>
 460a328: 9101c280     	add	x0, x20, #0x70
 460a32c: d2800001     	mov	x1, #0x0                ; =0
 460a330: 96e87662     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460a334: 91008280     	add	x0, x20, #0x20
 460a338: 96e87650     	bl	0x27c78 <_ChromeMain+0x229dc>
 460a33c: 38d773a8     	ldursb	w8, [x29, #-0x89]
 460a340: 36f800a8     	tbz	w8, #0x1f, 0x460a354 <_ChromeMain+0x46050b8>
 460a344: f85603a0     	ldur	x0, [x29, #-0xa0]
 460a348: f85703a8     	ldur	x8, [x29, #-0x90]
 460a34c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460a350: 96e7fada     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460a354: 911603ff     	add	sp, sp, #0x580
 460a358: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 460a35c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 460a360: a8c357f6     	ldp	x22, x21, [sp], #0x30
 460a364: d65f03c0     	ret
 460a368: f81d03bf     	stur	xzr, [x29, #-0x30]
 460a36c: 6f00e400     	movi.2d	v0, #0000000000000000
 460a370: ad3d83a0     	stp	q0, q0, [x29, #-0x50]
 460a374: ad3c83a0     	stp	q0, q0, [x29, #-0x70]
 460a378: ad3b83a0     	stp	q0, q0, [x29, #-0x90]
 460a37c: 3c9603a0     	stur	q0, [x29, #-0xa0]
 460a380: 17ffffc8     	b	0x460a2a0 <_ChromeMain+0x4605004>
 460a384: 12800008     	mov	w8, #-0x1               ; =-1
 460a388: b8e80008     	ldaddal	w8, w8, [x0]
 460a38c: 7100051f     	cmp	w8, #0x1
 460a390: 54fffc01     	b.ne	0x460a310 <_ChromeMain+0x4605074>
 460a394: 52800101     	mov	w1, #0x8                ; =8
 460a398: 96e7fac8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460a39c: 17ffffdd     	b	0x460a310 <_ChromeMain+0x4605074>
 460a3a0: aa0003f5     	mov	x21, x0
 460a3a4: f941a673     	ldr	x19, [x19, #0x348]
 460a3a8: f0052d28     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 460a3ac: f9468d08     	ldr	x8, [x8, #0xd18]
 460a3b0: d63f0100     	blr	x8
 460a3b4: aa0003e3     	mov	x3, x0
 460a3b8: aa1303e0     	mov	x0, x19
 460a3bc: aa1503e1     	mov	x1, x21
 460a3c0: 528000c2     	mov	w2, #0x6                ; =6
 460a3c4: 911603ff     	add	sp, sp, #0x580
 460a3c8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 460a3cc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 460a3d0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 460a3d4: 14dd15c5     	b	0x7d4fae8 <_ChromeMain+0x7d4a84c>
 460a3d8: d4200020     	brk	#0x1
 460a3dc: 00000000     	udf	#0x0
 460a3e0: d10303ff     	sub	sp, sp, #0xc0
 460a3e4: a9066ffc     	stp	x28, x27, [sp, #0x60]
 460a3e8: a90767fa     	stp	x26, x25, [sp, #0x70]
 460a3ec: a9085ff8     	stp	x24, x23, [sp, #0x80]
 460a3f0: a90957f6     	stp	x22, x21, [sp, #0x90]
 460a3f4: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 460a3f8: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 460a3fc: 9102c3fd     	add	x29, sp, #0xb0
 460a400: aa0203f4     	mov	x20, x2
 460a404: aa0003f3     	mov	x19, x0
 460a408: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 460a40c: f90023ff     	str	xzr, [sp, #0x40]
 460a410: aa0103e0     	mov	x0, x1
 460a414: 9701899d     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 460a418: 39c05c08     	ldrsb	w8, [x0, #0x17]
 460a41c: 37f804a8     	tbnz	w8, #0x1f, 0x460a4b0 <_ChromeMain+0x4605214>
 460a420: 3dc00000     	ldr	q0, [x0]
 460a424: f9400808     	ldr	x8, [x0, #0x10]
 460a428: f90023e8     	str	x8, [sp, #0x40]
 460a42c: 3d800fe0     	str	q0, [sp, #0x30]
 460a430: f941ce76     	ldr	x22, [x19, #0x398]
 460a434: b40007f6     	cbz	x22, 0x460a530 <_ChromeMain+0x4605294>
 460a438: 910e6279     	add	x25, x19, #0x398
 460a43c: 39811fe8     	ldrsb	x8, [sp, #0x47]
 460a440: 9100c3e9     	add	x9, sp, #0x30
 460a444: a9432fea     	ldp	x10, x11, [sp, #0x30]
 460a448: f100011f     	cmp	x8, #0x0
 460a44c: 9a894157     	csel	x23, x10, x9, mi
 460a450: 7100011f     	cmp	w8, #0x0
 460a454: 9a88417a     	csel	x26, x11, x8, mi
 460a458: aa1603f5     	mov	x21, x22
 460a45c: aa1503f8     	mov	x24, x21
 460a460: f8420f08     	ldr	x8, [x24, #0x20]!
 460a464: 39805f09     	ldrsb	x9, [x24, #0x17]
 460a468: f100013f     	cmp	x9, #0x0
 460a46c: 9a984101     	csel	x1, x8, x24, mi
 460a470: f9400708     	ldr	x8, [x24, #0x8]
 460a474: 7100013f     	cmp	w9, #0x0
 460a478: 9a89411b     	csel	x27, x8, x9, mi
 460a47c: eb1a037f     	cmp	x27, x26
 460a480: 9a9a3362     	csel	x2, x27, x26, lo
 460a484: aa1703e0     	mov	x0, x23
 460a488: 94e7fcf6     	bl	0x8009860 <_ChromeMain+0x80045c4>
 460a48c: 340001a0     	cbz	w0, 0x460a4c0 <_ChromeMain+0x4605224>
 460a490: 37f800a0     	tbnz	w0, #0x1f, 0x460a4a4 <_ChromeMain+0x4605208>
 460a494: f94006b5     	ldr	x21, [x21, #0x8]
 460a498: b5fffe35     	cbnz	x21, 0x460a45c <_ChromeMain+0x46051c0>
 460a49c: 14000025     	b	0x460a530 <_ChromeMain+0x4605294>
 460a4a0: 54ffffa2     	b.hs	0x460a494 <_ChromeMain+0x46051f8>
 460a4a4: f94002b5     	ldr	x21, [x21]
 460a4a8: b5fffdb5     	cbnz	x21, 0x460a45c <_ChromeMain+0x46051c0>
 460a4ac: 14000021     	b	0x460a530 <_ChromeMain+0x4605294>
 460a4b0: a9400801     	ldp	x1, x2, [x0]
 460a4b4: 9100c3e0     	add	x0, sp, #0x30
 460a4b8: 96e83758     	bl	0x18218 <_ChromeMain+0x12f7c>
 460a4bc: 17ffffdd     	b	0x460a430 <_ChromeMain+0x4605194>
 460a4c0: eb1b035f     	cmp	x26, x27
 460a4c4: 54fffee1     	b.ne	0x460a4a0 <_ChromeMain+0x4605204>
 460a4c8: eb1902bf     	cmp	x21, x25
 460a4cc: 54000320     	b.eq	0x460a530 <_ChromeMain+0x4605294>
 460a4d0: f94006a9     	ldr	x9, [x21, #0x8]
 460a4d4: b5000a29     	cbnz	x9, 0x460a618 <_ChromeMain+0x460537c>
 460a4d8: aa1503e8     	mov	x8, x21
 460a4dc: aa0803e9     	mov	x9, x8
 460a4e0: f9400908     	ldr	x8, [x8, #0x10]
 460a4e4: f940010a     	ldr	x10, [x8]
 460a4e8: eb0a013f     	cmp	x9, x10
 460a4ec: 54ffff81     	b.ne	0x460a4dc <_ChromeMain+0x4605240>
 460a4f0: f941ca69     	ldr	x9, [x19, #0x390]
 460a4f4: eb15013f     	cmp	x9, x21
 460a4f8: 54000041     	b.ne	0x460a500 <_ChromeMain+0x4605264>
 460a4fc: f901ca68     	str	x8, [x19, #0x390]
 460a500: f941d268     	ldr	x8, [x19, #0x3a0]
 460a504: d1000508     	sub	x8, x8, #0x1
 460a508: f901d268     	str	x8, [x19, #0x3a0]
 460a50c: aa1603e0     	mov	x0, x22
 460a510: aa1503e1     	mov	x1, x21
 460a514: 96ebf36e     	bl	0x1072cc <_ChromeMain+0x102030>
 460a518: b40008d8     	cbz	x24, 0x460a630 <_ChromeMain+0x4605394>
 460a51c: 39c0dea8     	ldrsb	w8, [x21, #0x37]
 460a520: 37f80728     	tbnz	w8, #0x1f, 0x460a604 <_ChromeMain+0x4605368>
 460a524: aa1503e0     	mov	x0, x21
 460a528: 52800701     	mov	w1, #0x38               ; =56
 460a52c: 96e7fa63     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460a530: f9400288     	ldr	x8, [x20]
 460a534: b4000588     	cbz	x8, 0x460a5e4 <_ChromeMain+0x4605348>
 460a538: f9400d09     	ldr	x9, [x8, #0x18]
 460a53c: b4000549     	cbz	x9, 0x460a5e4 <_ChromeMain+0x4605348>
 460a540: f90007e8     	str	x8, [sp, #0x8]
 460a544: b9400109     	ldr	w9, [x8]
 460a548: 31000529     	adds	w9, w9, #0x1
 460a54c: b9000109     	str	w9, [x8]
 460a550: 540006c2     	b.hs	0x460a628 <_ChromeMain+0x460538c>
 460a554: 52800028     	mov	w8, #0x1                ; =1
 460a558: 3900a3e8     	strb	w8, [sp, #0x28]
 460a55c: 9100c3e8     	add	x8, sp, #0x30
 460a560: f9002fe8     	str	x8, [sp, #0x58]
 460a564: d0042e62     	adrp	x2, 0xcbd8000 <dyld_stub_binder+0xcbd8000>
 460a568: 91392042     	add	x2, x2, #0xe48
 460a56c: 910de260     	add	x0, x19, #0x378
 460a570: 910de261     	add	x1, x19, #0x378
 460a574: 910163e3     	add	x3, sp, #0x58
 460a578: 91015fe4     	add	x4, sp, #0x57
 460a57c: 97ff6a19     	bl	0x45e4de0 <_ChromeMain+0x45dfb44>
 460a580: 9100e000     	add	x0, x0, #0x38
 460a584: 910023e1     	add	x1, sp, #0x8
 460a588: 9710bd30     	bl	0xa39a48 <_ChromeMain+0xa347ac>
 460a58c: 910023e0     	add	x0, sp, #0x8
 460a590: 9708f0ac     	bl	0x846840 <_ChromeMain+0x8415a4>
 460a594: f9400288     	ldr	x8, [x20]
 460a598: b40000a8     	cbz	x8, 0x460a5ac <_ChromeMain+0x4605310>
 460a59c: f9400d08     	ldr	x8, [x8, #0x18]
 460a5a0: b4000068     	cbz	x8, 0x460a5ac <_ChromeMain+0x4605310>
 460a5a4: aa1303e0     	mov	x0, x19
 460a5a8: 97ffeb0f     	bl	0x46051e4 <_ChromeMain+0x45fff48>
 460a5ac: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 460a5b0: 36f800a8     	tbz	w8, #0x1f, 0x460a5c4 <_ChromeMain+0x4605328>
 460a5b4: f9401be0     	ldr	x0, [sp, #0x30]
 460a5b8: f94023e8     	ldr	x8, [sp, #0x40]
 460a5bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460a5c0: 96e7fa3e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460a5c4: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 460a5c8: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 460a5cc: a94957f6     	ldp	x22, x21, [sp, #0x90]
 460a5d0: a9485ff8     	ldp	x24, x23, [sp, #0x80]
 460a5d4: a94767fa     	ldp	x26, x25, [sp, #0x70]
 460a5d8: a9466ffc     	ldp	x28, x27, [sp, #0x60]
 460a5dc: 910303ff     	add	sp, sp, #0xc0
 460a5e0: d65f03c0     	ret
 460a5e4: 52800008     	mov	w8, #0x0                ; =0
 460a5e8: f90007ff     	str	xzr, [sp, #0x8]
 460a5ec: 2f06e400     	movi	d0, #0xffff000000000000
 460a5f0: fd000be0     	str	d0, [sp, #0x10]
 460a5f4: 52800029     	mov	w9, #0x1                ; =1
 460a5f8: 390063e9     	strb	w9, [sp, #0x18]
 460a5fc: f90013ff     	str	xzr, [sp, #0x20]
 460a600: 17ffffd6     	b	0x460a558 <_ChromeMain+0x46052bc>
 460a604: f94012a0     	ldr	x0, [x21, #0x20]
 460a608: f9401aa8     	ldr	x8, [x21, #0x30]
 460a60c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460a610: 96e7fa2a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460a614: 17ffffc4     	b	0x460a524 <_ChromeMain+0x4605288>
 460a618: aa0903e8     	mov	x8, x9
 460a61c: f9400129     	ldr	x9, [x9]
 460a620: b5ffffc9     	cbnz	x9, 0x460a618 <_ChromeMain+0x460537c>
 460a624: 17ffffb3     	b	0x460a4f0 <_ChromeMain+0x4605254>
 460a628: d4200000     	brk	#0
 460a62c: d4400000     	hlt	#0
 460a630: d4200020     	brk	#0x1
