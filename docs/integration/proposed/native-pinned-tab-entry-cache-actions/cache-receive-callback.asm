
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
