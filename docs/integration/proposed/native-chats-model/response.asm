
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463e350: d102c3ff     	sub	sp, sp, #0xb0
 463e354: a9075ff8     	stp	x24, x23, [sp, #0x70]
 463e358: a90857f6     	stp	x22, x21, [sp, #0x80]
 463e35c: a9094ff4     	stp	x20, x19, [sp, #0x90]
 463e360: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 463e364: 910283fd     	add	x29, sp, #0xa0
 463e368: f9497413     	ldr	x19, [x0, #0x12e8]
 463e36c: f909741f     	str	xzr, [x0, #0x12e8]
 463e370: 397e4008     	ldrb	w8, [x0, #0xf90]
 463e374: 37000468     	tbnz	w8, #0x0, 0x463e400 <_ChromeMain+0x4639164>
 463e378: aa0003f4     	mov	x20, x0
 463e37c: b9537008     	ldr	w8, [x0, #0x1370]
 463e380: 6b08005f     	cmp	w2, w8
 463e384: 540003e1     	b.ne	0x463e400 <_ChromeMain+0x4639164>
 463e388: f9422e88     	ldr	x8, [x20, #0x458]
 463e38c: b40003a8     	cbz	x8, 0x463e400 <_ChromeMain+0x4639164>
 463e390: f9429d08     	ldr	x8, [x8, #0x538]
 463e394: f9403500     	ldr	x0, [x8, #0x68]
 463e398: b4000340     	cbz	x0, 0x463e400 <_ChromeMain+0x4639164>
 463e39c: aa0403f5     	mov	x21, x4
 463e3a0: aa0303f7     	mov	x23, x3
 463e3a4: aa0103f6     	mov	x22, x1
 463e3a8: f9400008     	ldr	x8, [x0]
 463e3ac: f940a508     	ldr	x8, [x8, #0x148]
 463e3b0: d63f0100     	blr	x8
 463e3b4: f9400008     	ldr	x8, [x0]
 463e3b8: f9401909     	ldr	x9, [x8, #0x30]
 463e3bc: 910103e8     	add	x8, sp, #0x40
 463e3c0: d63f0120     	blr	x9
 463e3c4: 910103e0     	add	x0, sp, #0x40
 463e3c8: aa1703e1     	mov	x1, x23
 463e3cc: 972a374e     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 463e3d0: aa0003f7     	mov	x23, x0
 463e3d4: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 463e3d8: 37f802a8     	tbnz	w8, #0x1f, 0x463e42c <_ChromeMain+0x4639190>
 463e3dc: 34000137     	cbz	w23, 0x463e400 <_ChromeMain+0x4639164>
 463e3e0: b4000093     	cbz	x19, 0x463e3f0 <_ChromeMain+0x4639154>
 463e3e4: f9409268     	ldr	x8, [x19, #0x120]
 463e3e8: b9401509     	ldr	w9, [x8, #0x14]
 463e3ec: 340002c9     	cbz	w9, 0x463e444 <_ChromeMain+0x46391a8>
 463e3f0: 397e4288     	ldrb	w8, [x20, #0xf90]
 463e3f4: 37000068     	tbnz	w8, #0x0, 0x463e400 <_ChromeMain+0x4639164>
 463e3f8: 39624288     	ldrb	w8, [x20, #0x890]
 463e3fc: 35000448     	cbnz	w8, 0x463e484 <_ChromeMain+0x46391e8>
 463e400: b40000b3     	cbz	x19, 0x463e414 <_ChromeMain+0x4639178>
 463e404: aa1303e0     	mov	x0, x19
 463e408: 973fbde4     	bl	0x162db98 <_ChromeMain+0x16288fc>
 463e40c: 52804501     	mov	w1, #0x228              ; =552
 463e410: 96e72aaa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463e414: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 463e418: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 463e41c: a94857f6     	ldp	x22, x21, [sp, #0x80]
 463e420: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 463e424: 9102c3ff     	add	sp, sp, #0xb0
 463e428: d65f03c0     	ret
 463e42c: f94023e0     	ldr	x0, [sp, #0x40]
 463e430: f9402be8     	ldr	x8, [sp, #0x50]
 463e434: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463e438: 96e72aa0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463e43c: 35fffd37     	cbnz	w23, 0x463e3e0 <_ChromeMain+0x4639144>
 463e440: 17fffff0     	b	0x463e400 <_ChromeMain+0x4639164>
 463e444: f9401108     	ldr	x8, [x8, #0x20]
 463e448: b4fffd48     	cbz	x8, 0x463e3f0 <_ChromeMain+0x4639154>
 463e44c: f9400d09     	ldr	x9, [x8, #0x18]
 463e450: b40000c9     	cbz	x9, 0x463e468 <_ChromeMain+0x46391cc>
 463e454: b9403929     	ldr	w9, [x9, #0x38]
 463e458: 7103213f     	cmp	w9, #0xc8
 463e45c: 54000061     	b.ne	0x463e468 <_ChromeMain+0x46391cc>
 463e460: 394062a9     	ldrb	w9, [x21, #0x18]
 463e464: 35000689     	cbnz	w9, 0x463e534 <_ChromeMain+0x4639298>
 463e468: 3707fc56     	tbnz	w22, #0x0, 0x463e3f0 <_ChromeMain+0x4639154>
 463e46c: f9400d08     	ldr	x8, [x8, #0x18]
 463e470: b4fffc08     	cbz	x8, 0x463e3f0 <_ChromeMain+0x4639154>
 463e474: b9403908     	ldr	w8, [x8, #0x38]
 463e478: 7106451f     	cmp	w8, #0x191
 463e47c: 54fffba1     	b.ne	0x463e3f0 <_ChromeMain+0x4639154>
 463e480: 14000028     	b	0x463e520 <_ChromeMain+0x4639284>
 463e484: b004c460     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463e488: 912e3000     	add	x0, x0, #0xb8c
 463e48c: b004c461     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463e490: 912c7821     	add	x1, x1, #0xb1e
 463e494: 910103e8     	add	x8, sp, #0x40
 463e498: 52841062     	mov	w2, #0x2083             ; =8323
 463e49c: 96e849f9     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 463e4a0: f94a0695     	ldr	x21, [x20, #0x1408]
 463e4a4: b40000d5     	cbz	x21, 0x463e4bc <_ChromeMain+0x4639220>
 463e4a8: 52800028     	mov	w8, #0x1                ; =1
 463e4ac: b82802a8     	ldadd	w8, w8, [x21]
 463e4b0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463e4b4: 6b09011f     	cmp	w8, w9
 463e4b8: 54000de0     	b.eq	0x463e674 <_ChromeMain+0x46393d8>
 463e4bc: 52826216     	mov	w22, #0x1310            ; =4880
 463e4c0: f94a0a97     	ldr	x23, [x20, #0x1410]
 463e4c4: 52800800     	mov	w0, #0x40               ; =64
 463e4c8: 96e743a8     	bl	0xf368 <_ChromeMain+0xa0cc>
 463e4cc: aa0003e3     	mov	x3, x0
 463e4d0: 52800028     	mov	w8, #0x1                ; =1
 463e4d4: b0ffcbe9     	adrp	x9, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 463e4d8: 911c0129     	add	x9, x9, #0x700
 463e4dc: 90ffcb0a     	adrp	x10, 0x3f9e000 <_ChromeMain+0x3f98d64>
 463e4e0: 9111014a     	add	x10, x10, #0x440
 463e4e4: b9000008     	str	w8, [x0]
 463e4e8: 90ffd168     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 463e4ec: 910a0108     	add	x8, x8, #0x280
 463e4f0: 10ffb28b     	adr	x11, 0x463db40 <_ChromeMain+0x46388a4>
 463e4f4: d503201f     	nop
 463e4f8: a900a809     	stp	x9, x10, [x0, #0x8]
 463e4fc: a901ac08     	stp	x8, x11, [x0, #0x18]
 463e500: a902d41f     	stp	xzr, x21, [x0, #0x28]
 463e504: f9001c17     	str	x23, [x0, #0x38]
 463e508: 8b160280     	add	x0, x20, x22
 463e50c: 910103e1     	add	x1, sp, #0x40
 463e510: 52884802     	mov	w2, #0x4240             ; =16960
 463e514: 72a001e2     	movk	w2, #0xf, lsl #16
 463e518: 96f9affb     	bl	0x4aa504 <_ChromeMain+0x4a5268>
 463e51c: 17ffffb9     	b	0x463e400 <_ChromeMain+0x4639164>
 463e520: 97ec7c0d     	bl	0x415d554 <_ChromeMain+0x41582b8>
 463e524: aa1403e0     	mov	x0, x20
 463e528: 52800021     	mov	w1, #0x1                ; =1
 463e52c: 97fffd87     	bl	0x463db48 <_ChromeMain+0x46388ac>
 463e530: 17ffffb5     	b	0x463e404 <_ChromeMain+0x4639168>
 463e534: a9007fff     	stp	xzr, xzr, [sp]
 463e538: f9000bff     	str	xzr, [sp, #0x10]
 463e53c: f90033ff     	str	xzr, [sp, #0x60]
 463e540: 6f00e400     	movi.2d	v0, #0000000000000000
 463e544: ad0203e0     	stp	q0, q0, [sp, #0x40]
 463e548: 39805ea8     	ldrsb	x8, [x21, #0x17]
 463e54c: a9402aa9     	ldp	x9, x10, [x21]
 463e550: f100011f     	cmp	x8, #0x0
 463e554: 9a954120     	csel	x0, x9, x21, mi
 463e558: 7100011f     	cmp	w8, #0x0
 463e55c: 9a884141     	csel	x1, x10, x8, mi
 463e560: 910103e8     	add	x8, sp, #0x40
 463e564: 52800002     	mov	w2, #0x0                ; =0
 463e568: 52801903     	mov	w3, #0xc8               ; =200
 463e56c: 97560eaf     	bl	0x1bc2028 <_ChromeMain+0x1bbcd8c>
 463e570: 394183e9     	ldrb	w9, [sp, #0x60]
 463e574: 394163e8     	ldrb	w8, [sp, #0x58]
 463e578: 7100191f     	cmp	w8, #0x6
 463e57c: 1a9f17ea     	cset	w10, eq
 463e580: 6a0a013f     	tst	w9, w10
 463e584: 54000540     	b.eq	0x463e62c <_ChromeMain+0x4639390>
 463e588: 9100a3f5     	add	x21, sp, #0x28
 463e58c: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 463e590: 910022a9     	add	x9, x21, #0x8
 463e594: 910003e8     	mov	x8, sp
 463e598: f9000ff5     	str	x21, [sp, #0x18]
 463e59c: a90227e8     	stp	x8, x9, [sp, #0x20]
 463e5a0: d004a701     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 463e5a4: 9114e821     	add	x1, x1, #0x53a
 463e5a8: 910103e0     	add	x0, sp, #0x40
 463e5ac: 528000c2     	mov	w2, #0x6                ; =6
 463e5b0: 974bb934     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 463e5b4: aa0003e1     	mov	x1, x0
 463e5b8: 910063e0     	add	x0, sp, #0x18
 463e5bc: 9400bf44     	bl	0x466e2cc <_ChromeMain+0x4669030>
 463e5c0: d004c461     	adrp	x1, 0xdecc000 <dyld_stub_binder+0xdecc000>
 463e5c4: 91032c21     	add	x1, x1, #0xcb
 463e5c8: 910103e0     	add	x0, sp, #0x40
 463e5cc: 528000e2     	mov	w2, #0x7                ; =7
 463e5d0: 974bb92c     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 463e5d4: aa0003e1     	mov	x1, x0
 463e5d8: 910063e0     	add	x0, sp, #0x18
 463e5dc: 9400bf3c     	bl	0x466e2cc <_ChromeMain+0x4669030>
 463e5e0: f9401be1     	ldr	x1, [sp, #0x30]
 463e5e4: f9000ff5     	str	x21, [sp, #0x18]
 463e5e8: 910063e0     	add	x0, sp, #0x18
 463e5ec: 97038930     	bl	0x720aac <_ChromeMain+0x71b810>
 463e5f0: 394183e8     	ldrb	w8, [sp, #0x60]
 463e5f4: 360000c8     	tbz	w8, #0x0, 0x463e60c <_ChromeMain+0x4639370>
 463e5f8: 394163e8     	ldrb	w8, [sp, #0x58]
 463e5fc: 7103fd1f     	cmp	w8, #0xff
 463e600: 54000060     	b.eq	0x463e60c <_ChromeMain+0x4639370>
 463e604: 721e791f     	tst	w8, #0xfffffffd
 463e608: 54000241     	b.ne	0x463e650 <_ChromeMain+0x46393b4>
 463e60c: 910003f5     	mov	x21, sp
 463e610: 910003e1     	mov	x1, sp
 463e614: aa1403e0     	mov	x0, x20
 463e618: 97ffdb4c     	bl	0x4635348 <_ChromeMain+0x46300ac>
 463e61c: f90023f5     	str	x21, [sp, #0x40]
 463e620: 910103e0     	add	x0, sp, #0x40
 463e624: 9400bebb     	bl	0x466e110 <_ChromeMain+0x4668e74>
 463e628: 17ffff72     	b	0x463e3f0 <_ChromeMain+0x4639154>
 463e62c: 3607ff09     	tbz	w9, #0x0, 0x463e60c <_ChromeMain+0x4639370>
 463e630: 17fffff3     	b	0x463e5fc <_ChromeMain+0x4639360>
 463e634: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 463e638: 36fffea8     	tbz	w8, #0x1f, 0x463e60c <_ChromeMain+0x4639370>
 463e63c: f94023e0     	ldr	x0, [sp, #0x40]
 463e640: f9402be8     	ldr	x8, [sp, #0x50]
 463e644: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463e648: 96e72a1c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463e64c: 17fffff0     	b	0x463e60c <_ChromeMain+0x4639370>
 463e650: 7100111f     	cmp	w8, #0x4
 463e654: 54ffff00     	b.eq	0x463e634 <_ChromeMain+0x4639398>
 463e658: f0051409     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 463e65c: 9121e129     	add	x9, x9, #0x878
 463e660: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 463e664: 9100a3e0     	add	x0, sp, #0x28
 463e668: 910103e1     	add	x1, sp, #0x40
 463e66c: d63f0100     	blr	x8
 463e670: 17ffffe7     	b	0x463e60c <_ChromeMain+0x4639370>
 463e674: d4200000     	brk	#0
