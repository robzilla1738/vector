
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 466e2cc: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 466e2d0: a90167fa     	stp	x26, x25, [sp, #0x10]
 466e2d4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 466e2d8: a90357f6     	stp	x22, x21, [sp, #0x30]
 466e2dc: a9044ff4     	stp	x20, x19, [sp, #0x40]
 466e2e0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 466e2e4: 910143fd     	add	x29, sp, #0x50
 466e2e8: d108c3ff     	sub	sp, sp, #0x230
 466e2ec: b40002a1     	cbz	x1, 0x466e340 <_ChromeMain+0x46690a4>
 466e2f0: a9402034     	ldp	x20, x8, [x1]
 466e2f4: 8b08169a     	add	x26, x20, x8, lsl #5
 466e2f8: eb1a029f     	cmp	x20, x26
 466e2fc: 54005a68     	b.hi	0x466ee48 <_ChromeMain+0x4669bac>
 466e300: d37be908     	lsl	x8, x8, #5
 466e304: 910043fb     	add	x27, sp, #0x10
 466e308: b27e0369     	orr	x9, x27, #0x4
 466e30c: d0049caa     	adrp	x10, 0xda04000 <dyld_stub_binder+0xda04000>
 466e310: 9121654a     	add	x10, x10, #0x859
 466e314: eb0a037f     	cmp	x27, x10
 466e318: fa4a9120     	ccmp	x9, x10, #0x0, ls
 466e31c: 1a9f97f8     	cset	w24, hi
 466e320: b4000108     	cbz	x8, 0x466e340 <_ChromeMain+0x46690a4>
 466e324: aa0003f3     	mov	x19, x0
 466e328: 910243f6     	add	x22, sp, #0x90
 466e32c: d10383b9     	sub	x25, x29, #0xe0
 466e330: 9100633c     	add	x28, x25, #0x18
 466e334: b0048c15     	adrp	x21, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 466e338: 9109e6b5     	add	x21, x21, #0x279
 466e33c: 1400000e     	b	0x466e374 <_ChromeMain+0x46690d8>
 466e340: 9108c3ff     	add	sp, sp, #0x230
 466e344: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 466e348: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 466e34c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 466e350: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 466e354: a94167fa     	ldp	x26, x25, [sp, #0x10]
 466e358: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 466e35c: d65f03c0     	ret
 466e360: f94006e8     	ldr	x8, [x23, #0x8]
 466e364: b5000228     	cbnz	x8, 0x466e3a8 <_ChromeMain+0x466910c>
 466e368: 91008294     	add	x20, x20, #0x20
 466e36c: eb1a029f     	cmp	x20, x26
 466e370: 54fffe80     	b.eq	0x466e340 <_ChromeMain+0x46690a4>
 466e374: b4ffffb4     	cbz	x20, 0x466e368 <_ChromeMain+0x46690cc>
 466e378: 39406288     	ldrb	w8, [x20, #0x18]
 466e37c: 7100191f     	cmp	w8, #0x6
 466e380: 54ffff41     	b.ne	0x466e368 <_ChromeMain+0x46690cc>
 466e384: aa1403e0     	mov	x0, x20
 466e388: aa1503e1     	mov	x1, x21
 466e38c: 52800042     	mov	w2, #0x2                ; =2
 466e390: 9766edbc     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 466e394: b4fffea0     	cbz	x0, 0x466e368 <_ChromeMain+0x46690cc>
 466e398: aa0003f7     	mov	x23, x0
 466e39c: 39805c08     	ldrsb	x8, [x0, #0x17]
 466e3a0: b7fffe08     	tbnz	x8, #0x3f, 0x466e360 <_ChromeMain+0x46690c4>
 466e3a4: b4fffe28     	cbz	x8, 0x466e368 <_ChromeMain+0x46690cc>
 466e3a8: f9400260     	ldr	x0, [x19]
 466e3ac: aa0003e1     	mov	x1, x0
 466e3b0: aa1703e2     	mov	x2, x23
 466e3b4: 97228073     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 466e3b8: 3607fd81     	tbz	w1, #0x0, 0x466e368 <_ChromeMain+0x46690cc>
 466e3bc: f900a3ff     	str	xzr, [sp, #0x140]
 466e3c0: 6f00e400     	movi.2d	v0, #0000000000000000
 466e3c4: ad0903e0     	stp	q0, q0, [sp, #0x120]
 466e3c8: ad0803e0     	stp	q0, q0, [sp, #0x100]
 466e3cc: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 466e3d0: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 466e3d4: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 466e3d8: 3d8027e0     	str	q0, [sp, #0x90]
 466e3dc: 52800028     	mov	w8, #0x1                ; =1
 466e3e0: 390317e8     	strb	w8, [sp, #0xc5]
 466e3e4: eb1702df     	cmp	x22, x23
 466e3e8: 540000e0     	b.eq	0x466e404 <_ChromeMain+0x4669168>
 466e3ec: 39c05ee8     	ldrsb	w8, [x23, #0x17]
 466e3f0: 37f80408     	tbnz	w8, #0x1f, 0x466e470 <_ChromeMain+0x46691d4>
 466e3f4: 3dc002e0     	ldr	q0, [x23]
 466e3f8: f9400ae8     	ldr	x8, [x23, #0x10]
 466e3fc: f90053e8     	str	x8, [sp, #0xa0]
 466e400: 3d8027e0     	str	q0, [sp, #0x90]
 466e404: aa1403e0     	mov	x0, x20
 466e408: d0048c61     	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 466e40c: 91307021     	add	x1, x1, #0xc1c
 466e410: 528000a2     	mov	w2, #0x5                ; =5
 466e414: 9766ed9b     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 466e418: 528e4df7     	mov	w23, #0x726f            ; =29295
 466e41c: 72ac8cb7     	movk	w23, #0x6465, lsl #16
 466e420: b40004e0     	cbz	x0, 0x466e4bc <_ChromeMain+0x4669220>
 466e424: 39805c08     	ldrsb	x8, [x0, #0x17]
 466e428: b7f80468     	tbnz	x8, #0x3f, 0x466e4b4 <_ChromeMain+0x4669218>
 466e42c: b4000488     	cbz	x8, 0x466e4bc <_ChromeMain+0x4669220>
 466e430: 39805c01     	ldrsb	x1, [x0, #0x17]
 466e434: b6f80041     	tbz	x1, #0x3f, 0x466e43c <_ChromeMain+0x46691a0>
 466e438: a9400400     	ldp	x0, x1, [x0]
 466e43c: 910043e8     	add	x8, sp, #0x10
 466e440: 9709cfb4     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 466e444: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 466e448: 36f800a8     	tbz	w8, #0x1f, 0x466e45c <_ChromeMain+0x46691c0>
 466e44c: f94057e0     	ldr	x0, [sp, #0xa8]
 466e450: f9405fe8     	ldr	x8, [sp, #0xb8]
 466e454: d37ff901     	lsl	x1, x8, #1
 466e458: 96e66a98     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466e45c: 3dc007e0     	ldr	q0, [sp, #0x10]
 466e460: 3c8182c0     	stur	q0, [x22, #0x18]
 466e464: f94013e8     	ldr	x8, [sp, #0x20]
 466e468: f80282c8     	stur	x8, [x22, #0x28]
 466e46c: 14000018     	b	0x466e4cc <_ChromeMain+0x4669230>
 466e470: a9400ae1     	ldp	x1, x2, [x23]
 466e474: 910243e0     	add	x0, sp, #0x90
 466e478: 96f8e98f     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 466e47c: 17ffffe2     	b	0x466e404 <_ChromeMain+0x4669168>
 466e480: 52800088     	mov	w8, #0x4                ; =4
 466e484: 39009fe8     	strb	w8, [sp, #0x27]
 466e488: 35004e58     	cbnz	w24, 0x466ee50 <_ChromeMain+0x4669bb4>
 466e48c: 528c8d28     	mov	w8, #0x6469             ; =25705
 466e490: 72acad88     	movk	w8, #0x656c, lsl #16
 466e494: b90013e8     	str	w8, [sp, #0x10]
 466e498: 390053ff     	strb	wzr, [sp, #0x14]
 466e49c: 5280008b     	mov	w11, #0x4               ; =4
 466e4a0: 14000018     	b	0x466e500 <_ChromeMain+0x4669264>
 466e4a4: a9400801     	ldp	x1, x2, [x0]
 466e4a8: 910043e0     	add	x0, sp, #0x10
 466e4ac: 96e6a75b     	bl	0x18218 <_ChromeMain+0x12f7c>
 466e4b0: 14000013     	b	0x466e4fc <_ChromeMain+0x4669260>
 466e4b4: f9400408     	ldr	x8, [x0, #0x8]
 466e4b8: b5fffbc8     	cbnz	x8, 0x466e430 <_ChromeMain+0x4669194>
 466e4bc: 910062c0     	add	x0, x22, #0x18
 466e4c0: b004c8c1     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 466e4c4: 913c6021     	add	x1, x1, #0xf18
 466e4c8: 9731d59f     	bl	0x12e3b44 <_ChromeMain+0x12de8a8>
 466e4cc: aa1403e0     	mov	x0, x20
 466e4d0: f0048c61     	adrp	x1, 0xd7fd000 <dyld_stub_binder+0xd7fd000>
 466e4d4: 9128fc21     	add	x1, x1, #0xa3f
 466e4d8: 528000c2     	mov	w2, #0x6                ; =6
 466e4dc: 9766ed69     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 466e4e0: b4fffd00     	cbz	x0, 0x466e480 <_ChromeMain+0x46691e4>
 466e4e4: 39c05c08     	ldrsb	w8, [x0, #0x17]
 466e4e8: 37fffde8     	tbnz	w8, #0x1f, 0x466e4a4 <_ChromeMain+0x4669208>
 466e4ec: 3dc00000     	ldr	q0, [x0]
 466e4f0: f9400808     	ldr	x8, [x0, #0x10]
 466e4f4: f90013e8     	str	x8, [sp, #0x20]
 466e4f8: 3d8007e0     	str	q0, [sp, #0x10]
 466e4fc: 39409feb     	ldrb	w11, [sp, #0x27]
 466e500: 52800009     	mov	w9, #0x0                ; =0
 466e504: 13001d68     	sxtb	w8, w11
 466e508: 7100011f     	cmp	w8, #0x0
 466e50c: a94133e0     	ldp	x0, x12, [sp, #0x10]
 466e510: 9a9b400a     	csel	x10, x0, x27, mi
 466e514: 9a8b418b     	csel	x11, x12, x11, mi
 466e518: f100297f     	cmp	x11, #0xa
 466e51c: 5400112d     	b.le	0x466e740 <_ChromeMain+0x46694a4>
 466e520: f100417f     	cmp	x11, #0x10
 466e524: 5400036d     	b.le	0x466e590 <_ChromeMain+0x46692f4>
 466e528: f100457f     	cmp	x11, #0x11
 466e52c: 54000720     	b.eq	0x466e610 <_ChromeMain+0x4669374>
 466e530: f100657f     	cmp	x11, #0x19
 466e534: 54001261     	b.ne	0x466e780 <_ChromeMain+0x46694e4>
 466e538: a9402d49     	ldp	x9, x11, [x10]
 466e53c: f940094c     	ldr	x12, [x10, #0x10]
 466e540: 3940614a     	ldrb	w10, [x10, #0x18]
 466e544: 7101cd5f     	cmp	w10, #0x73
 466e548: d28cc5aa     	mov	x10, #0x662d            ; =26157
 466e54c: f2ae4dea     	movk	x10, #0x726f, lsl #16
 466e550: f2cd25aa     	movk	x10, #0x692d, lsl #32
 466e554: f2ec4dca     	movk	x10, #0x626e, lsl #48
 466e558: fa4a0160     	ccmp	x11, x10, #0x0, eq
 466e55c: d28f0dea     	mov	x10, #0x786f            ; =30831
 466e560: f2aca5aa     	movk	x10, #0x652d, lsl #16
 466e564: f2ccaeca     	movk	x10, #0x6576, lsl #32
 466e568: f2ee8dca     	movk	x10, #0x746e, lsl #48
 466e56c: fa4a0180     	ccmp	x12, x10, #0x0, eq
 466e570: d28eec2a     	mov	x10, #0x7761            ; =30561
 466e574: f2ad2c2a     	movk	x10, #0x6961, lsl #16
 466e578: f2cd2e8a     	movk	x10, #0x6974, lsl #32
 466e57c: f2ecedca     	movk	x10, #0x676e, lsl #48
 466e580: fa4a0120     	ccmp	x9, x10, #0x0, eq
 466e584: 54000fc1     	b.ne	0x466e77c <_ChromeMain+0x46694e0>
 466e588: 528000a9     	mov	w9, #0x5                ; =5
 466e58c: 1400007d     	b	0x466e780 <_ChromeMain+0x46694e4>
 466e590: f1002d7f     	cmp	x11, #0xb
 466e594: 540005e0     	b.eq	0x466e650 <_ChromeMain+0x46693b4>
 466e598: f1003d7f     	cmp	x11, #0xf
 466e59c: 54000f21     	b.ne	0x466e780 <_ChromeMain+0x46694e4>
 466e5a0: f9400149     	ldr	x9, [x10]
 466e5a4: f840714b     	ldur	x11, [x10, #0x7]
 466e5a8: d28d2ccc     	mov	x12, #0x6966            ; =26982
 466e5ac: f2ad2dcc     	movk	x12, #0x696e, lsl #16
 466e5b0: f2cd0e6c     	movk	x12, #0x6873, lsl #32
 466e5b4: f2ec8cac     	movk	x12, #0x6465, lsl #48
 466e5b8: eb0c013f     	cmp	x9, x12
 466e5bc: d285ac89     	mov	x9, #0x2d64             ; =11620
 466e5c0: f2adcea9     	movk	x9, #0x6e75, lsl #16
 466e5c4: f2ccae49     	movk	x9, #0x6572, lsl #32
 466e5c8: f2ec8c29     	movk	x9, #0x6461, lsl #48
 466e5cc: fa490160     	ccmp	x11, x9, #0x0, eq
 466e5d0: 54000ac0     	b.eq	0x466e728 <_ChromeMain+0x466948c>
 466e5d4: f9400149     	ldr	x9, [x10]
 466e5d8: f840714a     	ldur	x10, [x10, #0x7]
 466e5dc: d28eec2b     	mov	x11, #0x7761            ; =30561
 466e5e0: f2ad2c2b     	movk	x11, #0x6961, lsl #16
 466e5e4: f2cd2e8b     	movk	x11, #0x6974, lsl #32
 466e5e8: f2ecedcb     	movk	x11, #0x676e, lsl #48
 466e5ec: eb0b013f     	cmp	x9, x11
 466e5f0: d285ace9     	mov	x9, #0x2d67             ; =11623
 466e5f4: f2adcc29     	movk	x9, #0x6e61, lsl #16
 466e5f8: f2ceee69     	movk	x9, #0x7773, lsl #32
 466e5fc: f2ee4ca9     	movk	x9, #0x7265, lsl #48
 466e600: fa490140     	ccmp	x10, x9, #0x0, eq
 466e604: 54000bc1     	b.ne	0x466e77c <_ChromeMain+0x46694e0>
 466e608: 52800089     	mov	w9, #0x4                ; =4
 466e60c: 1400005d     	b	0x466e780 <_ChromeMain+0x46694e4>
 466e610: a9402d49     	ldp	x9, x11, [x10]
 466e614: 3940414a     	ldrb	w10, [x10, #0x10]
 466e618: 7101b15f     	cmp	w10, #0x6c
 466e61c: d28c25aa     	mov	x10, #0x612d            ; =24877
 466e620: f2ae0e0a     	movk	x10, #0x7070, lsl #16
 466e624: f2cdee4a     	movk	x10, #0x6f72, lsl #32
 466e628: f2ec2eca     	movk	x10, #0x6176, lsl #48
 466e62c: fa4a0160     	ccmp	x11, x10, #0x0, eq
 466e630: d28eec2a     	mov	x10, #0x7761            ; =30561
 466e634: f2ad2c2a     	movk	x10, #0x6961, lsl #16
 466e638: f2cd2e8a     	movk	x10, #0x6974, lsl #32
 466e63c: f2ecedca     	movk	x10, #0x676e, lsl #48
 466e640: fa4a0120     	ccmp	x9, x10, #0x0, eq
 466e644: 540009c1     	b.ne	0x466e77c <_ChromeMain+0x46694e0>
 466e648: 52800069     	mov	w9, #0x3                ; =3
 466e64c: 1400004d     	b	0x466e780 <_ChromeMain+0x46694e4>
 466e650: f9400149     	ldr	x9, [x10]
 466e654: d28dcd2b     	mov	x11, #0x6e69            ; =28265
 466e658: f2acae8b     	movk	x11, #0x6574, lsl #16
 466e65c: f2ce4e4b     	movk	x11, #0x7272, lsl #32
 466e660: f2ee0eab     	movk	x11, #0x7075, lsl #48
 466e664: ca0b0129     	eor	x9, x9, x11
 466e668: f840314a     	ldur	x10, [x10, #0x3]
 466e66c: d28e4cab     	mov	x11, #0x7265            ; =29285
 466e670: f2aeae4b     	movk	x11, #0x7572, lsl #16
 466e674: f2ce8e0b     	movk	x11, #0x7470, lsl #32
 466e678: f2ec8cab     	movk	x11, #0x6465, lsl #48
 466e67c: ca0b014a     	eor	x10, x10, x11
 466e680: aa0a0129     	orr	x9, x9, x10
 466e684: f100013f     	cmp	x9, #0x0
 466e688: 528000c9     	mov	w9, #0x6                ; =6
 466e68c: 1a8913e9     	csel	w9, wzr, w9, ne
 466e690: 1400003c     	b	0x466e780 <_ChromeMain+0x46694e4>
 466e694: b9400149     	ldr	w9, [x10]
 466e698: b840314b     	ldur	w11, [x10, #0x3]
 466e69c: 528eae4c     	mov	w12, #0x7572            ; =30066
 466e6a0: 72adcdcc     	movk	w12, #0x6e6e, lsl #16
 466e6a4: 6b0c013f     	cmp	w9, w12
 466e6a8: 528d2dc9     	mov	w9, #0x696e             ; =26990
 466e6ac: 72acedc9     	movk	w9, #0x676e, lsl #16
 466e6b0: 7a490160     	ccmp	w11, w9, #0x0, eq
 466e6b4: 54000240     	b.eq	0x466e6fc <_ChromeMain+0x4669460>
 466e6b8: b9400149     	ldr	w9, [x10]
 466e6bc: b840314b     	ldur	w11, [x10, #0x3]
 466e6c0: 528e4cac     	mov	w12, #0x7265            ; =29285
 466e6c4: 72adee4c     	movk	w12, #0x6f72, lsl #16
 466e6c8: 6b0c013f     	cmp	w9, w12
 466e6cc: 7a570160     	ccmp	w11, w23, #0x0, eq
 466e6d0: 54000280     	b.eq	0x466e720 <_ChromeMain+0x4669484>
 466e6d4: b9400149     	ldr	w9, [x10]
 466e6d8: 528c4c2b     	mov	w11, #0x6261            ; =25185
 466e6dc: 72ae4deb     	movk	w11, #0x726f, lsl #16
 466e6e0: 4a0b0129     	eor	w9, w9, w11
 466e6e4: b840314a     	ldur	w10, [x10, #0x3]
 466e6e8: 11080eeb     	add	w11, w23, #0x203
 466e6ec: 4a0b014a     	eor	w10, w10, w11
 466e6f0: 2a0a0129     	orr	w9, w9, w10
 466e6f4: 7100013f     	cmp	w9, #0x0
 466e6f8: 17ffffe4     	b	0x466e688 <_ChromeMain+0x46693ec>
 466e6fc: 52800029     	mov	w9, #0x1                ; =1
 466e700: 14000020     	b	0x466e780 <_ChromeMain+0x46694e4>
 466e704: b9400149     	ldr	w9, [x10]
 466e708: 3940114a     	ldrb	w10, [x10, #0x4]
 466e70c: 7101c95f     	cmp	w10, #0x72
 466e710: 528e4caa     	mov	w10, #0x7265            ; =29285
 466e714: 72adee4a     	movk	w10, #0x6f72, lsl #16
 466e718: 7a4a0120     	ccmp	w9, w10, #0x0, eq
 466e71c: 54000301     	b.ne	0x466e77c <_ChromeMain+0x46694e0>
 466e720: 528000c9     	mov	w9, #0x6                ; =6
 466e724: 14000017     	b	0x466e780 <_ChromeMain+0x46694e4>
 466e728: 52800049     	mov	w9, #0x2                ; =2
 466e72c: 14000015     	b	0x466e780 <_ChromeMain+0x46694e4>
 466e730: a9400801     	ldp	x1, x2, [x0]
 466e734: d10383a0     	sub	x0, x29, #0xe0
 466e738: 96f8e8df     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 466e73c: 14000045     	b	0x466e850 <_ChromeMain+0x46695b4>
 466e740: f100157f     	cmp	x11, #0x5
 466e744: 54fffe00     	b.eq	0x466e704 <_ChromeMain+0x4669468>
 466e748: f1001d7f     	cmp	x11, #0x7
 466e74c: 54fffa40     	b.eq	0x466e694 <_ChromeMain+0x46693f8>
 466e750: f100257f     	cmp	x11, #0x9
 466e754: 54000161     	b.ne	0x466e780 <_ChromeMain+0x46694e4>
 466e758: f9400149     	ldr	x9, [x10]
 466e75c: 3940214a     	ldrb	w10, [x10, #0x8]
 466e760: 7101915f     	cmp	w10, #0x64
 466e764: d28dec6a     	mov	x10, #0x6f63            ; =28515
 466e768: f2ae0daa     	movk	x10, #0x706d, lsl #16
 466e76c: f2ccad8a     	movk	x10, #0x656c, lsl #32
 466e770: f2ecae8a     	movk	x10, #0x6574, lsl #48
 466e774: fa4a0120     	ccmp	x9, x10, #0x0, eq
 466e778: 54fffd80     	b.eq	0x466e728 <_ChromeMain+0x466948c>
 466e77c: 52800009     	mov	w9, #0x0                ; =0
 466e780: b900c3e9     	str	w9, [sp, #0xc0]
 466e784: 36f80088     	tbz	w8, #0x1f, 0x466e794 <_ChromeMain+0x46694f8>
 466e788: f94013e8     	ldr	x8, [sp, #0x20]
 466e78c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 466e790: 96e669ca     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466e794: aa1403e0     	mov	x0, x20
 466e798: d004a581     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 466e79c: 9114e821     	add	x1, x1, #0x53a
 466e7a0: 528000c2     	mov	w2, #0x6                ; =6
 466e7a4: 9739cb47     	bl	0x14e14c0 <_ChromeMain+0x14dc224>
 466e7a8: 52802037     	mov	w23, #0x101             ; =257
 466e7ac: 6a2002ff     	bics	wzr, w23, w0
 466e7b0: 1a9f17e8     	cset	w8, eq
 466e7b4: 390313e8     	strb	w8, [sp, #0xc4]
 466e7b8: aa1403e0     	mov	x0, x20
 466e7bc: 9004a481     	adrp	x1, 0xdafe000 <dyld_stub_binder+0xdafe000>
 466e7c0: 91303021     	add	x1, x1, #0xc0c
 466e7c4: 528000c2     	mov	w2, #0x6                ; =6
 466e7c8: 9739cb3e     	bl	0x14e14c0 <_ChromeMain+0x14dc224>
 466e7cc: 0a170008     	and	w8, w0, w23
 466e7d0: 7104011f     	cmp	w8, #0x100
 466e7d4: 1a9f07e8     	cset	w8, ne
 466e7d8: 390317e8     	strb	w8, [sp, #0xc5]
 466e7dc: aa1403e0     	mov	x0, x20
 466e7e0: b004b9a1     	adrp	x1, 0xdda3000 <dyld_stub_binder+0xdda3000>
 466e7e4: 911aa421     	add	x1, x1, #0x6a9
 466e7e8: 528000e2     	mov	w2, #0x7                ; =7
 466e7ec: 970bc015     	bl	0x95e840 <_ChromeMain+0x9595a4>
 466e7f0: aa0003f7     	mov	x23, x0
 466e7f4: b4001180     	cbz	x0, 0x466ea24 <_ChromeMain+0x4669788>
 466e7f8: aa1703e0     	mov	x0, x23
 466e7fc: aa1503e1     	mov	x1, x21
 466e800: 52800042     	mov	w2, #0x2                ; =2
 466e804: 9766ec9f     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 466e808: b40010c0     	cbz	x0, 0x466ea20 <_ChromeMain+0x4669784>
 466e80c: 39805c08     	ldrsb	x8, [x0, #0x17]
 466e810: b7f81048     	tbnz	x8, #0x3f, 0x466ea18 <_ChromeMain+0x466977c>
 466e814: b4001068     	cbz	x8, 0x466ea20 <_ChromeMain+0x4669784>
 466e818: f81903bf     	stur	xzr, [x29, #-0x70]
 466e81c: 6f00e400     	movi.2d	v0, #0000000000000000
 466e820: ad3b83a0     	stp	q0, q0, [x29, #-0x90]
 466e824: ad3a83a0     	stp	q0, q0, [x29, #-0xb0]
 466e828: ad3983a0     	stp	q0, q0, [x29, #-0xd0]
 466e82c: 3c9203a0     	stur	q0, [x29, #-0xe0]
 466e830: eb00033f     	cmp	x25, x0
 466e834: 540000e0     	b.eq	0x466e850 <_ChromeMain+0x46695b4>
 466e838: 39c05c08     	ldrsb	w8, [x0, #0x17]
 466e83c: 37fff7a8     	tbnz	w8, #0x1f, 0x466e730 <_ChromeMain+0x4669494>
 466e840: 3dc00000     	ldr	q0, [x0]
 466e844: f9400808     	ldr	x8, [x0, #0x10]
 466e848: f81303a8     	stur	x8, [x29, #-0xd0]
 466e84c: 3c9203a0     	stur	q0, [x29, #-0xe0]
 466e850: aa1703e0     	mov	x0, x23
 466e854: d0048c61     	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 466e858: 913dc821     	add	x1, x1, #0xf72
 466e85c: 52800082     	mov	w2, #0x4                ; =4
 466e860: 9766ec88     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 466e864: eb00039f     	cmp	x28, x0
 466e868: fa401804     	ccmp	x0, #0x0, #0x4, ne
 466e86c: 54000120     	b.eq	0x466e890 <_ChromeMain+0x46695f4>
 466e870: 38d4f3a9     	ldursb	w9, [x29, #-0xb1]
 466e874: 39405c08     	ldrb	w8, [x0, #0x17]
 466e878: 37f82f69     	tbnz	w9, #0x1f, 0x466ee64 <_ChromeMain+0x4669bc8>
 466e87c: 37380c68     	tbnz	w8, #0x7, 0x466ea08 <_ChromeMain+0x466976c>
 466e880: 3dc00000     	ldr	q0, [x0]
 466e884: f9400808     	ldr	x8, [x0, #0x10]
 466e888: f9000b88     	str	x8, [x28, #0x10]
 466e88c: 3d800380     	str	q0, [x28]
 466e890: aa1703e0     	mov	x0, x23
 466e894: d0048c61     	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 466e898: 91307021     	add	x1, x1, #0xc1c
 466e89c: 528000a2     	mov	w2, #0x5                ; =5
 466e8a0: 9766ec78     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 466e8a4: b4000200     	cbz	x0, 0x466e8e4 <_ChromeMain+0x4669648>
 466e8a8: 39805c01     	ldrsb	x1, [x0, #0x17]
 466e8ac: b6f80041     	tbz	x1, #0x3f, 0x466e8b4 <_ChromeMain+0x4669618>
 466e8b0: a9400400     	ldp	x0, x1, [x0]
 466e8b4: 910583e8     	add	x8, sp, #0x160
 466e8b8: 9709ce96     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 466e8bc: 38d673a8     	ldursb	w8, [x29, #-0x99]
 466e8c0: 36f800a8     	tbz	w8, #0x1f, 0x466e8d4 <_ChromeMain+0x4669638>
 466e8c4: f85503a0     	ldur	x0, [x29, #-0xb0]
 466e8c8: f85603a8     	ldur	x8, [x29, #-0xa0]
 466e8cc: d37ff901     	lsl	x1, x8, #1
 466e8d0: 96e6697a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466e8d4: 3dc05be0     	ldr	q0, [sp, #0x160]
 466e8d8: 3c830320     	stur	q0, [x25, #0x30]
 466e8dc: f940bbe8     	ldr	x8, [sp, #0x170]
 466e8e0: f8040328     	stur	x8, [x25, #0x40]
 466e8e4: f90003fc     	str	x28, [sp]
 466e8e8: aa1703e0     	mov	x0, x23
 466e8ec: b0049701     	adrp	x1, 0xd94f000 <dyld_stub_binder+0xd94f000>
 466e8f0: 9136a421     	add	x1, x1, #0xda9
 466e8f4: 52800082     	mov	w2, #0x4                ; =4
 466e8f8: 9766ec62     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 466e8fc: b4000200     	cbz	x0, 0x466e93c <_ChromeMain+0x46696a0>
 466e900: 39805c01     	ldrsb	x1, [x0, #0x17]
 466e904: b6f80041     	tbz	x1, #0x3f, 0x466e90c <_ChromeMain+0x4669670>
 466e908: a9400400     	ldp	x0, x1, [x0]
 466e90c: 910583e8     	add	x8, sp, #0x160
 466e910: 9709ce80     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 466e914: 38d7f3a8     	ldursb	w8, [x29, #-0x81]
 466e918: 36f800a8     	tbz	w8, #0x1f, 0x466e92c <_ChromeMain+0x4669690>
 466e91c: f85683a0     	ldur	x0, [x29, #-0x98]
 466e920: f85783a8     	ldur	x8, [x29, #-0x88]
 466e924: d37ff901     	lsl	x1, x8, #1
 466e928: 96e66964     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466e92c: 3dc05be0     	ldr	q0, [sp, #0x160]
 466e930: 3c848320     	stur	q0, [x25, #0x48]
 466e934: f940bbe8     	ldr	x8, [sp, #0x170]
 466e938: f8058328     	stur	x8, [x25, #0x58]
 466e93c: b9000ff8     	str	w24, [sp, #0xc]
 466e940: aa1703e0     	mov	x0, x23
 466e944: b0049361     	adrp	x1, 0xd8db000 <dyld_stub_binder+0xd8db000>
 466e948: 913ee821     	add	x1, x1, #0xfba
 466e94c: 528000e2     	mov	w2, #0x7                ; =7
 466e950: 974af84c     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 466e954: b40000e0     	cbz	x0, 0x466e970 <_ChromeMain+0x46696d4>
 466e958: a9402017     	ldp	x23, x8, [x0]
 466e95c: 8b0816e9     	add	x9, x23, x8, lsl #5
 466e960: eb0902ff     	cmp	x23, x9
 466e964: 540029a8     	b.hi	0x466ee98 <_ChromeMain+0x4669bfc>
 466e968: d37be91c     	lsl	x28, x8, #5
 466e96c: b500195c     	cbnz	x28, 0x466ec94 <_ChromeMain+0x46699f8>
 466e970: 3cd203a0     	ldur	q0, [x29, #-0xe0]
 466e974: 3d8007e0     	str	q0, [sp, #0x10]
 466e978: a9327fbf     	stp	xzr, xzr, [x29, #-0xe0]
 466e97c: f94003fc     	ldr	x28, [sp]
 466e980: 3dc00380     	ldr	q0, [x28]
 466e984: 3c818360     	stur	q0, [x27, #0x18]
 466e988: f9400b88     	ldr	x8, [x28, #0x10]
 466e98c: f8028368     	stur	x8, [x27, #0x28]
 466e990: a9007f9f     	stp	xzr, xzr, [x28]
 466e994: f9000b9f     	str	xzr, [x28, #0x10]
 466e998: d10383b9     	sub	x25, x29, #0xe0
 466e99c: f8440328     	ldur	x8, [x25, #0x40]
 466e9a0: f8040368     	stur	x8, [x27, #0x40]
 466e9a4: 3cc30320     	ldur	q0, [x25, #0x30]
 466e9a8: 3c830360     	stur	q0, [x27, #0x30]
 466e9ac: a9037f3f     	stp	xzr, xzr, [x25, #0x30]
 466e9b0: 3cc48320     	ldur	q0, [x25, #0x48]
 466e9b4: f8458328     	ldur	x8, [x25, #0x58]
 466e9b8: f8058368     	stur	x8, [x27, #0x58]
 466e9bc: 3c848360     	stur	q0, [x27, #0x48]
 466e9c0: a9047f3f     	stp	xzr, xzr, [x25, #0x40]
 466e9c4: a9057f3f     	stp	xzr, xzr, [x25, #0x50]
 466e9c8: f85303a8     	ldur	x8, [x29, #-0xd0]
 466e9cc: f85803a9     	ldur	x9, [x29, #-0x80]
 466e9d0: f81303bf     	stur	xzr, [x29, #-0xd0]
 466e9d4: f90013e8     	str	x8, [sp, #0x20]
 466e9d8: f9003be9     	str	x9, [sp, #0x70]
 466e9dc: 910523e8     	add	x8, sp, #0x148
 466e9e0: 3ccc0100     	ldur	q0, [x8, #0xc0]
 466e9e4: f81903bf     	stur	xzr, [x29, #-0x70]
 466e9e8: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 466e9ec: 3c8783e0     	stur	q0, [sp, #0x78]
 466e9f0: 52800037     	mov	w23, #0x1               ; =1
 466e9f4: 390223f7     	strb	w23, [sp, #0x88]
 466e9f8: d10383a0     	sub	x0, x29, #0xe0
 466e9fc: 97fef1a9     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 466ea00: b9400ff8     	ldr	w24, [sp, #0xc]
 466ea04: 1400000a     	b	0x466ea2c <_ChromeMain+0x4669790>
 466ea08: a9400801     	ldp	x1, x2, [x0]
 466ea0c: 91006320     	add	x0, x25, #0x18
 466ea10: 96f8e829     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 466ea14: 17ffff9f     	b	0x466e890 <_ChromeMain+0x46695f4>
 466ea18: f9400408     	ldr	x8, [x0, #0x8]
 466ea1c: b5ffefe8     	cbnz	x8, 0x466e818 <_ChromeMain+0x466957c>
 466ea20: 52800017     	mov	w23, #0x0               ; =0
 466ea24: 390043ff     	strb	wzr, [sp, #0x10]
 466ea28: 390223ff     	strb	wzr, [sp, #0x88]
 466ea2c: 394503e8     	ldrb	w8, [sp, #0x140]
 466ea30: 6b17011f     	cmp	w8, w23
 466ea34: 54000500     	b.eq	0x466ead4 <_ChromeMain+0x4669838>
 466ea38: 37000448     	tbnz	w8, #0x0, 0x466eac0 <_ChromeMain+0x4669824>
 466ea3c: f94013e8     	ldr	x8, [sp, #0x20]
 466ea40: f9403be9     	ldr	x9, [sp, #0x70]
 466ea44: f80482c8     	stur	x8, [x22, #0x48]
 466ea48: f8428368     	ldur	x8, [x27, #0x28]
 466ea4c: f80602c8     	stur	x8, [x22, #0x60]
 466ea50: f8440368     	ldur	x8, [x27, #0x40]
 466ea54: f80782c8     	stur	x8, [x22, #0x78]
 466ea58: f8458368     	ldur	x8, [x27, #0x58]
 466ea5c: f80902c8     	stur	x8, [x22, #0x90]
 466ea60: 3dc007e0     	ldr	q0, [sp, #0x10]
 466ea64: 3c8382c0     	stur	q0, [x22, #0x38]
 466ea68: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 466ea6c: 3cc18360     	ldur	q0, [x27, #0x18]
 466ea70: 3c8502c0     	stur	q0, [x22, #0x50]
 466ea74: a901ff7f     	stp	xzr, xzr, [x27, #0x18]
 466ea78: 3cc30360     	ldur	q0, [x27, #0x30]
 466ea7c: 3c8682c0     	stur	q0, [x22, #0x68]
 466ea80: a902ff7f     	stp	xzr, xzr, [x27, #0x28]
 466ea84: a903ff7f     	stp	xzr, xzr, [x27, #0x38]
 466ea88: 3cc48360     	ldur	q0, [x27, #0x48]
 466ea8c: 3c8802c0     	stur	q0, [x22, #0x80]
 466ea90: a904ff7f     	stp	xzr, xzr, [x27, #0x48]
 466ea94: f805837f     	stur	xzr, [x27, #0x58]
 466ea98: f90013ff     	str	xzr, [sp, #0x20]
 466ea9c: f90097e9     	str	x9, [sp, #0x128]
 466eaa0: 3cc783e0     	ldur	q0, [sp, #0x78]
 466eaa4: f90043ff     	str	xzr, [sp, #0x80]
 466eaa8: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 466eaac: 3d804fe0     	str	q0, [sp, #0x130]
 466eab0: 52800028     	mov	w8, #0x1                ; =1
 466eab4: 390503e8     	strb	w8, [sp, #0x140]
 466eab8: 340001f7     	cbz	w23, 0x466eaf4 <_ChromeMain+0x4669858>
 466eabc: 1400000c     	b	0x466eaec <_ChromeMain+0x4669850>
 466eac0: 9100e2c0     	add	x0, x22, #0x38
 466eac4: 97fef177     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 466eac8: 390503ff     	strb	wzr, [sp, #0x140]
 466eacc: 37000117     	tbnz	w23, #0x0, 0x466eaec <_ChromeMain+0x4669850>
 466ead0: 14000009     	b	0x466eaf4 <_ChromeMain+0x4669858>
 466ead4: 36000108     	tbz	w8, #0x0, 0x466eaf4 <_ChromeMain+0x4669858>
 466ead8: 9100e2c0     	add	x0, x22, #0x38
 466eadc: 910043e1     	add	x1, sp, #0x10
 466eae0: 97fef121     	bl	0x462af64 <_ChromeMain+0x4625cc8>
 466eae4: 394223e8     	ldrb	w8, [sp, #0x88]
 466eae8: 36000068     	tbz	w8, #0x0, 0x466eaf4 <_ChromeMain+0x4669858>
 466eaec: 910043e0     	add	x0, sp, #0x10
 466eaf0: 97fef16c     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 466eaf4: f9400677     	ldr	x23, [x19, #0x8]
 466eaf8: a940a6e8     	ldp	x8, x9, [x23, #0x8]
 466eafc: eb09011f     	cmp	x8, x9
 466eb00: 54001aa0     	b.eq	0x466ee54 <_ChromeMain+0x4669bb8>
 466eb04: f94002e9     	ldr	x9, [x23]
 466eb08: 5280170a     	mov	w10, #0xb8              ; =184
 466eb0c: 9b0a2508     	madd	x8, x8, x10, x9
 466eb10: b4001a08     	cbz	x8, 0x466ee50 <_ChromeMain+0x4669bb4>
 466eb14: 3dc027e0     	ldr	q0, [sp, #0x90]
 466eb18: f94053e9     	ldr	x9, [sp, #0xa0]
 466eb1c: f9000909     	str	x9, [x8, #0x10]
 466eb20: 3d800100     	str	q0, [x8]
 466eb24: a909ffff     	stp	xzr, xzr, [sp, #0x98]
 466eb28: f9004bff     	str	xzr, [sp, #0x90]
 466eb2c: 3cc182c0     	ldur	q0, [x22, #0x18]
 466eb30: f84282c9     	ldur	x9, [x22, #0x28]
 466eb34: f9001509     	str	x9, [x8, #0x28]
 466eb38: 3c818100     	stur	q0, [x8, #0x18]
 466eb3c: a9027edf     	stp	xzr, xzr, [x22, #0x20]
 466eb40: f80182df     	stur	xzr, [x22, #0x18]
 466eb44: b84302ca     	ldur	w10, [x22, #0x30]
 466eb48: 784342cb     	ldurh	w11, [x22, #0x34]
 466eb4c: aa0803e9     	mov	x9, x8
 466eb50: 38038d3f     	strb	wzr, [x9, #0x38]!
 466eb54: 781fc12b     	sturh	w11, [x9, #-0x4]
 466eb58: b81f812a     	stur	w10, [x9, #-0x8]
 466eb5c: 3901e13f     	strb	wzr, [x9, #0x78]
 466eb60: 394503ea     	ldrb	w10, [sp, #0x140]
 466eb64: 3600048a     	tbz	w10, #0x0, 0x466ebf4 <_ChromeMain+0x4669958>
 466eb68: 3cc382c0     	ldur	q0, [x22, #0x38]
 466eb6c: f84482ca     	ldur	x10, [x22, #0x48]
 466eb70: f900092a     	str	x10, [x9, #0x10]
 466eb74: 3d800120     	str	q0, [x9]
 466eb78: a9047edf     	stp	xzr, xzr, [x22, #0x40]
 466eb7c: f80382df     	stur	xzr, [x22, #0x38]
 466eb80: 3cc502c0     	ldur	q0, [x22, #0x50]
 466eb84: f84602c9     	ldur	x9, [x22, #0x60]
 466eb88: f9003109     	str	x9, [x8, #0x60]
 466eb8c: 3d801500     	str	q0, [x8, #0x50]
 466eb90: a905fedf     	stp	xzr, xzr, [x22, #0x58]
 466eb94: f80502df     	stur	xzr, [x22, #0x50]
 466eb98: 3cc682c0     	ldur	q0, [x22, #0x68]
 466eb9c: f84782c9     	ldur	x9, [x22, #0x78]
 466eba0: f9003d09     	str	x9, [x8, #0x78]
 466eba4: 3c868100     	stur	q0, [x8, #0x68]
 466eba8: a9077edf     	stp	xzr, xzr, [x22, #0x70]
 466ebac: f80682df     	stur	xzr, [x22, #0x68]
 466ebb0: 3cc802c0     	ldur	q0, [x22, #0x80]
 466ebb4: f84902c9     	ldur	x9, [x22, #0x90]
 466ebb8: f9004909     	str	x9, [x8, #0x90]
 466ebbc: 3d802100     	str	q0, [x8, #0x80]
 466ebc0: a9087edf     	stp	xzr, xzr, [x22, #0x80]
 466ebc4: f80902df     	stur	xzr, [x22, #0x90]
 466ebc8: f94097e9     	ldr	x9, [sp, #0x128]
 466ebcc: f90097ff     	str	xzr, [sp, #0x128]
 466ebd0: f9004d09     	str	x9, [x8, #0x98]
 466ebd4: f9409be9     	ldr	x9, [sp, #0x130]
 466ebd8: f9009bff     	str	xzr, [sp, #0x130]
 466ebdc: f9005109     	str	x9, [x8, #0xa0]
 466ebe0: f9409fe9     	ldr	x9, [sp, #0x138]
 466ebe4: f9009fff     	str	xzr, [sp, #0x138]
 466ebe8: f9005509     	str	x9, [x8, #0xa8]
 466ebec: 52800029     	mov	w9, #0x1                ; =1
 466ebf0: 3902c109     	strb	w9, [x8, #0xb0]
 466ebf4: 9102e100     	add	x0, x8, #0xb8
 466ebf8: f94002e8     	ldr	x8, [x23]
 466ebfc: eb080008     	subs	x8, x0, x8
 466ec00: 9343fd08     	asr	x8, x8, #3
 466ec04: d286f4e9     	mov	x9, #0x37a7             ; =14247
 466ec08: f2bd37a9     	movk	x9, #0xe9bd, lsl #16
 466ec0c: f2cde9a9     	movk	x9, #0x6f4d, lsl #32
 466ec10: f2fa6f49     	movk	x9, #0xd37a, lsl #48
 466ec14: 9b097d08     	mul	x8, x8, x9
 466ec18: f90006e8     	str	x8, [x23, #0x8]
 466ec1c: 540011a0     	b.eq	0x466ee50 <_ChromeMain+0x4669bb4>
 466ec20: 394503e8     	ldrb	w8, [sp, #0x140]
 466ec24: 36000068     	tbz	w8, #0x0, 0x466ec30 <_ChromeMain+0x4669994>
 466ec28: 9100e2c0     	add	x0, x22, #0x38
 466ec2c: 97fef11d     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 466ec30: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 466ec34: 36f800a8     	tbz	w8, #0x1f, 0x466ec48 <_ChromeMain+0x46699ac>
 466ec38: f94057e0     	ldr	x0, [sp, #0xa8]
 466ec3c: f9405fe8     	ldr	x8, [sp, #0xb8]
 466ec40: d37ff901     	lsl	x1, x8, #1
 466ec44: 96e6689d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466ec48: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 466ec4c: 36ffb8e8     	tbz	w8, #0x1f, 0x466e368 <_ChromeMain+0x46690cc>
 466ec50: f9404be0     	ldr	x0, [sp, #0x90]
 466ec54: f94053e8     	ldr	x8, [sp, #0xa0]
 466ec58: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 466ec5c: 96e66897     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466ec60: 17fffdc2     	b	0x466e368 <_ChromeMain+0x46690cc>
 466ec64: a9400b21     	ldp	x1, x2, [x25]
 466ec68: 910583e0     	add	x0, sp, #0x160
 466ec6c: 96f8e792     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 466ec70: 1400002d     	b	0x466ed24 <_ChromeMain+0x4669a88>
 466ec74: f9400708     	ldr	x8, [x24, #0x8]
 466ec78: b4000088     	cbz	x8, 0x466ec88 <_ChromeMain+0x46699ec>
 466ec7c: 1400001d     	b	0x466ecf0 <_ChromeMain+0x4669a54>
 466ec80: f9400728     	ldr	x8, [x25, #0x8]
 466ec84: b50002f8     	cbnz	x24, 0x466ece0 <_ChromeMain+0x4669a44>
 466ec88: 910082f7     	add	x23, x23, #0x20
 466ec8c: f100839c     	subs	x28, x28, #0x20
 466ec90: 54ffe700     	b.eq	0x466e970 <_ChromeMain+0x46696d4>
 466ec94: b4ffffb7     	cbz	x23, 0x466ec88 <_ChromeMain+0x46699ec>
 466ec98: 394062e8     	ldrb	w8, [x23, #0x18]
 466ec9c: 7100191f     	cmp	w8, #0x6
 466eca0: 54ffff41     	b.ne	0x466ec88 <_ChromeMain+0x46699ec>
 466eca4: aa1703e0     	mov	x0, x23
 466eca8: aa1503e1     	mov	x1, x21
 466ecac: 52800042     	mov	w2, #0x2                ; =2
 466ecb0: 9766eb74     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 466ecb4: aa0003f9     	mov	x25, x0
 466ecb8: aa1703e0     	mov	x0, x23
 466ecbc: 90048ce1     	adrp	x1, 0xd80a000 <dyld_stub_binder+0xd80a000>
 466ecc0: 9101e021     	add	x1, x1, #0x78
 466ecc4: 528000a2     	mov	w2, #0x5                ; =5
 466ecc8: 9766eb6e     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 466eccc: b4fffdf9     	cbz	x25, 0x466ec88 <_ChromeMain+0x46699ec>
 466ecd0: aa0003f8     	mov	x24, x0
 466ecd4: 39805f28     	ldrsb	x8, [x25, #0x17]
 466ecd8: b7fffd48     	tbnz	x8, #0x3f, 0x466ec80 <_ChromeMain+0x46699e4>
 466ecdc: b4fffd78     	cbz	x24, 0x466ec88 <_ChromeMain+0x46699ec>
 466ece0: b4fffd48     	cbz	x8, 0x466ec88 <_ChromeMain+0x46699ec>
 466ece4: 39805f08     	ldrsb	x8, [x24, #0x17]
 466ece8: b7fffc68     	tbnz	x8, #0x3f, 0x466ec74 <_ChromeMain+0x46699d8>
 466ecec: b4fffce8     	cbz	x8, 0x466ec88 <_ChromeMain+0x46699ec>
 466ecf0: f900cbff     	str	xzr, [sp, #0x190]
 466ecf4: 6f00e400     	movi.2d	v0, #0000000000000000
 466ecf8: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 466ecfc: 3d805be0     	str	q0, [sp, #0x160]
 466ed00: 910583e8     	add	x8, sp, #0x160
 466ed04: eb19011f     	cmp	x8, x25
 466ed08: 540000e0     	b.eq	0x466ed24 <_ChromeMain+0x4669a88>
 466ed0c: 39c05f28     	ldrsb	w8, [x25, #0x17]
 466ed10: 37fffaa8     	tbnz	w8, #0x1f, 0x466ec64 <_ChromeMain+0x46699c8>
 466ed14: 3dc00320     	ldr	q0, [x25]
 466ed18: f9400b28     	ldr	x8, [x25, #0x10]
 466ed1c: f900bbe8     	str	x8, [sp, #0x170]
 466ed20: 3d805be0     	str	q0, [sp, #0x160]
 466ed24: 39805f01     	ldrsb	x1, [x24, #0x17]
 466ed28: b6f80041     	tbz	x1, #0x3f, 0x466ed30 <_ChromeMain+0x4669a94>
 466ed2c: a9400718     	ldp	x24, x1, [x24]
 466ed30: 910523e8     	add	x8, sp, #0x148
 466ed34: aa1803e0     	mov	x0, x24
 466ed38: 9709cd76     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 466ed3c: 39c63fe8     	ldrsb	w8, [sp, #0x18f]
 466ed40: 36f800a8     	tbz	w8, #0x1f, 0x466ed54 <_ChromeMain+0x4669ab8>
 466ed44: f940bfe0     	ldr	x0, [sp, #0x178]
 466ed48: f940c7e8     	ldr	x8, [sp, #0x188]
 466ed4c: d37ff901     	lsl	x1, x8, #1
 466ed50: 96e6685a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466ed54: 910523e8     	add	x8, sp, #0x148
 466ed58: 3dc00100     	ldr	q0, [x8]
 466ed5c: 910583e9     	add	x9, sp, #0x160
 466ed60: 3c818120     	stur	q0, [x9, #0x18]
 466ed64: f940afe8     	ldr	x8, [sp, #0x158]
 466ed68: f8028128     	stur	x8, [x9, #0x28]
 466ed6c: aa1703e0     	mov	x0, x23
 466ed70: d00491a1     	adrp	x1, 0xd8a4000 <dyld_stub_binder+0xd8a4000>
 466ed74: 91262421     	add	x1, x1, #0x989
 466ed78: 528000e2     	mov	w2, #0x7                ; =7
 466ed7c: 9739c9d1     	bl	0x14e14c0 <_ChromeMain+0x14dc224>
 466ed80: 52802028     	mov	w8, #0x101              ; =257
 466ed84: 6a20011f     	bics	wzr, w8, w0
 466ed88: 1a9f17e8     	cset	w8, eq
 466ed8c: 390643e8     	strb	w8, [sp, #0x190]
 466ed90: a978a7a8     	ldp	x8, x9, [x29, #-0x78]
 466ed94: eb09011f     	cmp	x8, x9
 466ed98: 54000760     	b.eq	0x466ee84 <_ChromeMain+0x4669be8>
 466ed9c: f85803a9     	ldur	x9, [x29, #-0x80]
 466eda0: 5280070a     	mov	w10, #0x38              ; =56
 466eda4: 9b0a2508     	madd	x8, x8, x10, x9
 466eda8: b4000548     	cbz	x8, 0x466ee50 <_ChromeMain+0x4669bb4>
 466edac: 3dc05be0     	ldr	q0, [sp, #0x160]
 466edb0: f940bbe9     	ldr	x9, [sp, #0x170]
 466edb4: f9000909     	str	x9, [x8, #0x10]
 466edb8: 3d800100     	str	q0, [x8]
 466edbc: a916ffff     	stp	xzr, xzr, [sp, #0x168]
 466edc0: f900b3ff     	str	xzr, [sp, #0x160]
 466edc4: 910583ea     	add	x10, sp, #0x160
 466edc8: 3cc18140     	ldur	q0, [x10, #0x18]
 466edcc: f8428149     	ldur	x9, [x10, #0x28]
 466edd0: f9001509     	str	x9, [x8, #0x28]
 466edd4: 3c818100     	stur	q0, [x8, #0x18]
 466edd8: a9027d5f     	stp	xzr, xzr, [x10, #0x20]
 466eddc: f801815f     	stur	xzr, [x10, #0x18]
 466ede0: 394643e9     	ldrb	w9, [sp, #0x190]
 466ede4: 3900c109     	strb	w9, [x8, #0x30]
 466ede8: 9100e100     	add	x0, x8, #0x38
 466edec: f85803a8     	ldur	x8, [x29, #-0x80]
 466edf0: eb080008     	subs	x8, x0, x8
 466edf4: 9343fd08     	asr	x8, x8, #3
 466edf8: d28db6e9     	mov	x9, #0x6db7             ; =28087
 466edfc: f2b6db69     	movk	x9, #0xb6db, lsl #16
 466ee00: f2db6da9     	movk	x9, #0xdb6d, lsl #32
 466ee04: f2edb6c9     	movk	x9, #0x6db6, lsl #48
 466ee08: 9b097d08     	mul	x8, x8, x9
 466ee0c: f81883a8     	stur	x8, [x29, #-0x78]
 466ee10: 54000200     	b.eq	0x466ee50 <_ChromeMain+0x4669bb4>
 466ee14: 39c63fe8     	ldrsb	w8, [sp, #0x18f]
 466ee18: 36f800a8     	tbz	w8, #0x1f, 0x466ee2c <_ChromeMain+0x4669b90>
 466ee1c: f940bfe0     	ldr	x0, [sp, #0x178]
 466ee20: f940c7e8     	ldr	x8, [sp, #0x188]
 466ee24: d37ff901     	lsl	x1, x8, #1
 466ee28: 96e66824     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466ee2c: 39c5dfe8     	ldrsb	w8, [sp, #0x177]
 466ee30: 36fff2c8     	tbz	w8, #0x1f, 0x466ec88 <_ChromeMain+0x46699ec>
 466ee34: f940b3e0     	ldr	x0, [sp, #0x160]
 466ee38: f940bbe8     	ldr	x8, [sp, #0x170]
 466ee3c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 466ee40: 96e6681e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466ee44: 17ffff91     	b	0x466ec88 <_ChromeMain+0x46699ec>
 466ee48: d4200000     	brk	#0
 466ee4c: d4400000     	hlt	#0
 466ee50: d4200020     	brk	#0x1
 466ee54: 910243e1     	add	x1, sp, #0x90
 466ee58: aa1703e0     	mov	x0, x23
 466ee5c: 9400008f     	bl	0x466f098 <_ChromeMain+0x4669dfc>
 466ee60: 17ffff66     	b	0x466ebf8 <_ChromeMain+0x466995c>
