
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425cda0: d10143ff     	sub	sp, sp, #0x50
 425cda4: a90257f6     	stp	x22, x21, [sp, #0x20]
 425cda8: a9034ff4     	stp	x20, x19, [sp, #0x30]
 425cdac: a9047bfd     	stp	x29, x30, [sp, #0x40]
 425cdb0: 910103fd     	add	x29, sp, #0x40
 425cdb4: b40002a2     	cbz	x2, 0x425ce08 <_ChromeMain+0x4257b6c>
 425cdb8: aa0203f3     	mov	x19, x2
 425cdbc: aa0103f5     	mov	x21, x1
 425cdc0: aa0003f4     	mov	x20, x0
 425cdc4: 39405c09     	ldrb	w9, [x0, #0x17]
 425cdc8: 13001d28     	sxtb	w8, w9
 425cdcc: f940040a     	ldr	x10, [x0, #0x8]
 425cdd0: 7100011f     	cmp	w8, #0x0
 425cdd4: 9a894141     	csel	x1, x10, x9, mi
 425cdd8: b4000261     	cbz	x1, 0x425ce24 <_ChromeMain+0x4257b88>
 425cddc: f9400289     	ldr	x9, [x20]
 425cde0: 7100011f     	cmp	w8, #0x0
 425cde4: 9a944120     	csel	x0, x9, x20, mi
 425cde8: 90046562     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 425cdec: 91042c42     	add	x2, x2, #0x10b
 425cdf0: 52800063     	mov	w3, #0x3                ; =3
 425cdf4: 52800004     	mov	w4, #0x0                ; =0
 425cdf8: 9726e95c     	bl	0xc17368 <_ChromeMain+0xc120cc>
 425cdfc: 36000280     	tbz	w0, #0x0, 0x425ce4c <_ChromeMain+0x4257bb0>
 425ce00: 394042a8     	ldrb	w8, [x21, #0x10]
 425ce04: 35000428     	cbnz	w8, 0x425ce88 <_ChromeMain+0x4257bec>
 425ce08: 52800014     	mov	w20, #0x0               ; =0
 425ce0c: aa1403e0     	mov	x0, x20
 425ce10: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 425ce14: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 425ce18: a94257f6     	ldp	x22, x21, [sp, #0x20]
 425ce1c: 910143ff     	add	sp, sp, #0x50
 425ce20: d65f03c0     	ret
 425ce24: 39c05e68     	ldrsb	w8, [x19, #0x17]
 425ce28: 37f800a8     	tbnz	w8, #0x1f, 0x425ce3c <_ChromeMain+0x4257ba0>
 425ce2c: 3900027f     	strb	wzr, [x19]
 425ce30: 39005e7f     	strb	wzr, [x19, #0x17]
 425ce34: 52800034     	mov	w20, #0x1               ; =1
 425ce38: 17fffff5     	b	0x425ce0c <_ChromeMain+0x4257b70>
 425ce3c: f9400268     	ldr	x8, [x19]
 425ce40: 3900011f     	strb	wzr, [x8]
 425ce44: f900067f     	str	xzr, [x19, #0x8]
 425ce48: 17fffffb     	b	0x425ce34 <_ChromeMain+0x4257b98>
 425ce4c: eb14027f     	cmp	x19, x20
 425ce50: 54ffff20     	b.eq	0x425ce34 <_ChromeMain+0x4257b98>
 425ce54: 39c05e69     	ldrsb	w9, [x19, #0x17]
 425ce58: 39405e88     	ldrb	w8, [x20, #0x17]
 425ce5c: 37f805c9     	tbnz	w9, #0x1f, 0x425cf14 <_ChromeMain+0x4257c78>
 425ce60: 373800c8     	tbnz	w8, #0x7, 0x425ce78 <_ChromeMain+0x4257bdc>
 425ce64: 3dc00280     	ldr	q0, [x20]
 425ce68: f9400a88     	ldr	x8, [x20, #0x10]
 425ce6c: f9000a68     	str	x8, [x19, #0x10]
 425ce70: 3d800260     	str	q0, [x19]
 425ce74: 17fffff0     	b	0x425ce34 <_ChromeMain+0x4257b98>
 425ce78: a9400a81     	ldp	x1, x2, [x20]
 425ce7c: aa1303e0     	mov	x0, x19
 425ce80: 97092f0d     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 425ce84: 17ffffec     	b	0x425ce34 <_ChromeMain+0x4257b98>
 425ce88: 39405e89     	ldrb	w9, [x20, #0x17]
 425ce8c: 13001d28     	sxtb	w8, w9
 425ce90: f940068a     	ldr	x10, [x20, #0x8]
 425ce94: 7100011f     	cmp	w8, #0x0
 425ce98: 9a894149     	csel	x9, x10, x9, mi
 425ce9c: f100093f     	cmp	x9, #0x2
 425cea0: 54000529     	b.ls	0x425cf44 <_ChromeMain+0x4257ca8>
 425cea4: f940028a     	ldr	x10, [x20]
 425cea8: 6f00e400     	movi.2d	v0, #0000000000000000
 425ceac: ad0003e0     	stp	q0, q0, [sp]
 425ceb0: 7100011f     	cmp	w8, #0x0
 425ceb4: 9a94414a     	csel	x10, x10, x20, mi
 425ceb8: d1000d24     	sub	x4, x9, #0x3
 425cebc: 90046562     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 425cec0: 91043c42     	add	x2, x2, #0x10f
 425cec4: 910003e8     	mov	x8, sp
 425cec8: 91000d43     	add	x3, x10, #0x3
 425cecc: aa1503e0     	mov	x0, x21
 425ced0: 52800201     	mov	w1, #0x10               ; =16
 425ced4: 951adda2     	bl	0x891455c <_ChromeMain+0x890f2c0>
 425ced8: 394063f4     	ldrb	w20, [sp, #0x18]
