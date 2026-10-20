
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4278274: d10203ff     	sub	sp, sp, #0x80
 4278278: a9045ff8     	stp	x24, x23, [sp, #0x40]
 427827c: a90557f6     	stp	x22, x21, [sp, #0x50]
 4278280: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4278284: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4278288: 9101c3fd     	add	x29, sp, #0x70
 427828c: aa0303f4     	mov	x20, x3
 4278290: aa0203f5     	mov	x21, x2
 4278294: aa0103f6     	mov	x22, x1
 4278298: aa0003f7     	mov	x23, x0
 427829c: aa0803f3     	mov	x19, x8
 42782a0: a9007d1f     	stp	xzr, xzr, [x8]
 42782a4: f900091f     	str	xzr, [x8, #0x10]
 42782a8: 39405c08     	ldrb	w8, [x0, #0x17]
 42782ac: 13001d09     	sxtb	w9, w8
 42782b0: a9402c0a     	ldp	x10, x11, [x0]
 42782b4: 7100013f     	cmp	w9, #0x0
 42782b8: 9a804143     	csel	x3, x10, x0, mi
 42782bc: 9a884164     	csel	x4, x11, x8, mi
 42782c0: f004aba1     	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 42782c4: 9109e421     	add	x1, x1, #0x279
 42782c8: aa1303e0     	mov	x0, x19
 42782cc: 52800042     	mov	w2, #0x2                ; =2
 42782d0: 9750a0be     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 42782d4: 39805ee1     	ldrsb	x1, [x23, #0x17]
 42782d8: b6f80041     	tbz	x1, #0x3f, 0x42782e0 <_ChromeMain+0x4273044>
 42782dc: a94006f7     	ldp	x23, x1, [x23]
 42782e0: 910003e8     	mov	x8, sp
 42782e4: aa1703e0     	mov	x0, x23
 42782e8: 97fff4ae     	bl	0x42755a0 <_ChromeMain+0x4270304>
 42782ec: 3dc003e0     	ldr	q0, [sp]
 42782f0: 3d800be0     	str	q0, [sp, #0x20]
 42782f4: f9400be8     	ldr	x8, [sp, #0x10]
 42782f8: f9001be8     	str	x8, [sp, #0x30]
 42782fc: 52800088     	mov	w8, #0x4                ; =4
 4278300: 3900e3e8     	strb	w8, [sp, #0x38]
 4278304: d004abc1     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 4278308: 9138dc21     	add	x1, x1, #0xe37
 427830c: 910083e3     	add	x3, sp, #0x20
 4278310: aa1303e0     	mov	x0, x19
 4278314: 52800082     	mov	w2, #0x4                ; =4
 4278318: 970b0aea     	bl	0x53aec0 <_ChromeMain+0x535c24>
 427831c: 3940e3e8     	ldrb	w8, [sp, #0x38]
 4278320: b0053257     	adrp	x23, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4278324: 9121e2f7     	add	x23, x23, #0x878
 4278328: f103fd1f     	cmp	x8, #0xff
 427832c: 540000a0     	b.eq	0x4278340 <_ChromeMain+0x42730a4>
 4278330: f8687ae8     	ldr	x8, [x23, x8, lsl #3]
 4278334: 91007fe0     	add	x0, sp, #0x1f
 4278338: 910083e1     	add	x1, sp, #0x20
 427833c: d63f0100     	blr	x8
 4278340: f004c541     	adrp	x1, 0xdb23000 <dyld_stub_binder+0xdb23000>
 4278344: 91101421     	add	x1, x1, #0x405
 4278348: aa1303e0     	mov	x0, x19
 427834c: 52800102     	mov	w2, #0x8                ; =8
 4278350: aa1603e3     	mov	x3, x22
 4278354: 9722bab9     	bl	0xb26e38 <_ChromeMain+0xb21b9c>
 4278358: f004c541     	adrp	x1, 0xdb23000 <dyld_stub_binder+0xdb23000>
 427835c: 91103821     	add	x1, x1, #0x40e
 4278360: aa1303e0     	mov	x0, x19
 4278364: 52800242     	mov	w2, #0x12               ; =18
 4278368: aa1503e3     	mov	x3, x21
 427836c: 9722bab3     	bl	0xb26e38 <_ChromeMain+0xb21b9c>
 4278370: 34000234     	cbz	w20, 0x42783b4 <_ChromeMain+0x4273118>
 4278374: 52800028     	mov	w8, #0x1                ; =1
 4278378: 390083e8     	strb	w8, [sp, #0x20]
 427837c: 3900e3e8     	strb	w8, [sp, #0x38]
 4278380: f004c541     	adrp	x1, 0xdb23000 <dyld_stub_binder+0xdb23000>
 4278384: 91108421     	add	x1, x1, #0x421
 4278388: 910083e3     	add	x3, sp, #0x20
 427838c: aa1303e0     	mov	x0, x19
 4278390: 52800242     	mov	w2, #0x12               ; =18
 4278394: 970b0acb     	bl	0x53aec0 <_ChromeMain+0x535c24>
 4278398: 3940e3e8     	ldrb	w8, [sp, #0x38]
 427839c: f103fd1f     	cmp	x8, #0xff
 42783a0: 540000a0     	b.eq	0x42783b4 <_ChromeMain+0x4273118>
 42783a4: f8687ae8     	ldr	x8, [x23, x8, lsl #3]
 42783a8: 910003e0     	mov	x0, sp
 42783ac: 910083e1     	add	x1, sp, #0x20
 42783b0: d63f0100     	blr	x8
 42783b4: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 42783b8: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 42783bc: a94557f6     	ldp	x22, x21, [sp, #0x50]
 42783c0: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 42783c4: 910203ff     	add	sp, sp, #0x80
 42783c8: d65f03c0     	ret
