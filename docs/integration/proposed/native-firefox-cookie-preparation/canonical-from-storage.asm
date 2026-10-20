
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1bed5d0: d10703ff     	sub	sp, sp, #0x1c0
 1bed5d4: a9166ffc     	stp	x28, x27, [sp, #0x160]
 1bed5d8: a91767fa     	stp	x26, x25, [sp, #0x170]
 1bed5dc: a9185ff8     	stp	x24, x23, [sp, #0x180]
 1bed5e0: a91957f6     	stp	x22, x21, [sp, #0x190]
 1bed5e4: a91a4ff4     	stp	x20, x19, [sp, #0x1a0]
 1bed5e8: a91b7bfd     	stp	x29, x30, [sp, #0x1b0]
 1bed5ec: 9106c3fd     	add	x29, sp, #0x1b0
 1bed5f0: a90497e7     	stp	x7, x5, [sp, #0x48]
 1bed5f4: f9002fe6     	str	x6, [sp, #0x58]
 1bed5f8: f90023e4     	str	x4, [sp, #0x40]
 1bed5fc: aa0303f9     	mov	x25, x3
 1bed600: aa0203fa     	mov	x26, x2
 1bed604: aa0103fb     	mov	x27, x1
 1bed608: aa0003fc     	mov	x28, x0
 1bed60c: b94033b6     	ldr	w22, [x29, #0x30]
 1bed610: f94013b8     	ldr	x24, [x29, #0x20]
 1bed614: b9401ba8     	ldr	w8, [x29, #0x18]
 1bed618: b90037e8     	str	w8, [sp, #0x34]
 1bed61c: b94017b7     	ldr	w23, [x29, #0x14]
 1bed620: 394047a8     	ldrb	w8, [x29, #0x11]
 1bed624: b9003fe8     	str	w8, [sp, #0x3c]
 1bed628: 394043a8     	ldrb	w8, [x29, #0x10]
 1bed62c: b9003be8     	str	w8, [sp, #0x38]
 1bed630: 294523b4     	ldp	w20, w8, [x29, #0x28]
 1bed634: f00621c9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 1bed638: f940f929     	ldr	x9, [x9, #0x1f0]
 1bed63c: f9400129     	ldr	x9, [x9]
 1bed640: f81a03a9     	stur	x9, [x29, #-0x60]
 1bed644: 11000509     	add	w9, w8, #0x1
 1bed648: 1280002a     	mov	w10, #-0x2              ; =-2
 1bed64c: 7140413f     	cmp	w9, #0x10, lsl #12      ; =0x10000
 1bed650: 1a8a9115     	csel	w21, w8, w10, ls
 1bed654: 52802600     	mov	w0, #0x130              ; =304
 1bed658: 97908744     	bl	0xf368 <_ChromeMain+0xa0cc>
 1bed65c: aa0003f3     	mov	x19, x0
 1bed660: 3dc00380     	ldr	q0, [x28]
 1bed664: 3d8033e0     	str	q0, [sp, #0xc0]
 1bed668: f9400b88     	ldr	x8, [x28, #0x10]
 1bed66c: f9006be8     	str	x8, [sp, #0xd0]
 1bed670: a9007f9f     	stp	xzr, xzr, [x28]
 1bed674: f9000b9f     	str	xzr, [x28, #0x10]
 1bed678: 3dc00360     	ldr	q0, [x27]
 1bed67c: 3d802be0     	str	q0, [sp, #0xa0]
 1bed680: f9400b68     	ldr	x8, [x27, #0x10]
 1bed684: f9005be8     	str	x8, [sp, #0xb0]
 1bed688: a900ff7f     	stp	xzr, xzr, [x27, #0x8]
 1bed68c: f900037f     	str	xzr, [x27]
 1bed690: 3dc00340     	ldr	q0, [x26]
 1bed694: f9400b48     	ldr	x8, [x26, #0x10]
 1bed698: f9004be8     	str	x8, [sp, #0x90]
 1bed69c: 3d8023e0     	str	q0, [sp, #0x80]
 1bed6a0: a900ff5f     	stp	xzr, xzr, [x26, #0x8]
 1bed6a4: f900035f     	str	xzr, [x26]
 1bed6a8: 3dc00320     	ldr	q0, [x25]
 1bed6ac: f9400b28     	ldr	x8, [x25, #0x10]
 1bed6b0: f9003be8     	str	x8, [sp, #0x70]
 1bed6b4: 3d801be0     	str	q0, [sp, #0x60]
 1bed6b8: a900ff3f     	stp	xzr, xzr, [x25, #0x8]
 1bed6bc: f900033f     	str	xzr, [x25]
 1bed6c0: 390363ff     	strb	wzr, [sp, #0xd8]
 1bed6c4: 390523ff     	strb	wzr, [sp, #0x148]
 1bed6c8: 3941c308     	ldrb	w8, [x24, #0x70]
 1bed6cc: 350011e8     	cbnz	w8, 0x1bed908 <_ChromeMain+0x1be866c>
 1bed6d0: 2904dbf5     	stp	w21, w22, [sp, #0x24]
 1bed6d4: b90023f4     	str	w20, [sp, #0x20]
 1bed6d8: 910363e8     	add	x8, sp, #0xd8
 1bed6dc: f9000fe8     	str	x8, [sp, #0x18]
 1bed6e0: b94037e8     	ldr	w8, [sp, #0x34]
 1bed6e4: 2901a3f7     	stp	w23, w8, [sp, #0xc]
 1bed6e8: 910303e1     	add	x1, sp, #0xc0
 1bed6ec: 910283e2     	add	x2, sp, #0xa0
 1bed6f0: 910203e3     	add	x3, sp, #0x80
 1bed6f4: 910183e4     	add	x4, sp, #0x60
 1bed6f8: 294727e8     	ldp	w8, w9, [sp, #0x38]
 1bed6fc: 390027e9     	strb	w9, [sp, #0x9]
 1bed700: 390023e8     	strb	w8, [sp, #0x8]
 1bed704: a94423e5     	ldp	x5, x8, [sp, #0x40]
 1bed708: f90003e8     	str	x8, [sp]
 1bed70c: aa1303e0     	mov	x0, x19
 1bed710: a9451fe6     	ldp	x6, x7, [sp, #0x50]
 1bed714: 940000eb     	bl	0x1bedac0 <_ChromeMain+0x1be8824>
 1bed718: 394523e8     	ldrb	w8, [sp, #0x148]
 1bed71c: 35000d28     	cbnz	w8, 0x1bed8c0 <_ChromeMain+0x1be8624>
 1bed720: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 1bed724: 37f80d48     	tbnz	w8, #0x1f, 0x1bed8cc <_ChromeMain+0x1be8630>
 1bed728: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 1bed72c: 37f80da8     	tbnz	w8, #0x1f, 0x1bed8e0 <_ChromeMain+0x1be8644>
 1bed730: 39c2dfe8     	ldrsb	w8, [sp, #0xb7]
 1bed734: 36f800a8     	tbz	w8, #0x1f, 0x1bed748 <_ChromeMain+0x1be84ac>
 1bed738: f94053e0     	ldr	x0, [sp, #0xa0]
 1bed73c: f9405be8     	ldr	x8, [sp, #0xb0]
 1bed740: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 1bed744: 97906ddd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 1bed748: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 1bed74c: 37f80d48     	tbnz	w8, #0x1f, 0x1bed8f4 <_ChromeMain+0x1be8658>
 1bed750: aa1303e0     	mov	x0, x19
 1bed754: 94000214     	bl	0x1bedfa4 <_ChromeMain+0x1be8d08>
 1bed758: d360fc08     	lsr	x8, x0, #32
 1bed75c: b5000a88     	cbnz	x8, 0x1bed8ac <_ChromeMain+0x1be8610>
 1bed760: 39807e74     	ldrsb	x20, [x19, #0x1f]
 1bed764: b7f80614     	tbnz	x20, #0x3f, 0x1bed824 <_ChromeMain+0x1be8588>
 1bed768: 91002275     	add	x21, x19, #0x8
 1bed76c: 39442268     	ldrb	w8, [x19, #0x108]
 1bed770: 36000d88     	tbz	w8, #0x0, 0x1bed920 <_ChromeMain+0x1be8684>
 1bed774: 910363e8     	add	x8, sp, #0xd8
 1bed778: 91038260     	add	x0, x19, #0xe0
 1bed77c: 940003b9     	bl	0x1bee660 <_ChromeMain+0x1be93c4>
 1bed780: 3943bfe9     	ldrb	w9, [sp, #0xef]
 1bed784: a94da3ea     	ldp	x10, x8, [sp, #0xd8]
 1bed788: b94037b6     	ldr	w22, [x29, #0x34]
 1bed78c: 13001d2b     	sxtb	w11, w9
 1bed790: 7100017f     	cmp	w11, #0x0
 1bed794: 910363eb     	add	x11, sp, #0xd8
 1bed798: 9a8b4142     	csel	x2, x10, x11, mi
 1bed79c: 2a0903e9     	mov	w9, w9
 1bed7a0: 9a894103     	csel	x3, x8, x9, mi
 1bed7a4: aa1503e0     	mov	x0, x21
 1bed7a8: aa1403e1     	mov	x1, x20
 1bed7ac: d2800004     	mov	x4, #0x0                ; =0
 1bed7b0: 94000095     	bl	0x1beda04 <_ChromeMain+0x1be8768>
 1bed7b4: aa0003f4     	mov	x20, x0
 1bed7b8: 39c3bfe8     	ldrsb	w8, [sp, #0xef]
 1bed7bc: 36f800a8     	tbz	w8, #0x1f, 0x1bed7d0 <_ChromeMain+0x1be8534>
 1bed7c0: f9406fe0     	ldr	x0, [sp, #0xd8]
 1bed7c4: f94077e8     	ldr	x8, [sp, #0xe8]
 1bed7c8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 1bed7cc: 97906dbb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 1bed7d0: 71000edf     	cmp	w22, #0x3
 1bed7d4: 540006a0     	b.eq	0x1bed8a8 <_ChromeMain+0x1be860c>
 1bed7d8: d0061ae8     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 1bed7dc: fd469900     	ldr	d0, [x8, #0xd30]
 1bed7e0: 979417a2     	bl	0xf3668 <_ChromeMain+0xee3cc>
 1bed7e4: 35000240     	cbnz	w0, 0x1bed82c <_ChromeMain+0x1be8590>
 1bed7e8: f85a03a8     	ldur	x8, [x29, #-0x60]
 1bed7ec: f00621c9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 1bed7f0: f940f929     	ldr	x9, [x9, #0x1f0]
 1bed7f4: f9400129     	ldr	x9, [x9]
 1bed7f8: eb08013f     	cmp	x9, x8
 1bed7fc: 54000541     	b.ne	0x1bed8a4 <_ChromeMain+0x1be8608>
 1bed800: aa1303e0     	mov	x0, x19
 1bed804: a95b7bfd     	ldp	x29, x30, [sp, #0x1b0]
 1bed808: a95a4ff4     	ldp	x20, x19, [sp, #0x1a0]
 1bed80c: a95957f6     	ldp	x22, x21, [sp, #0x190]
 1bed810: a9585ff8     	ldp	x24, x23, [sp, #0x180]
 1bed814: a95767fa     	ldp	x26, x25, [sp, #0x170]
 1bed818: a9566ffc     	ldp	x28, x27, [sp, #0x160]
 1bed81c: 910703ff     	add	sp, sp, #0x1c0
 1bed820: d65f03c0     	ret
 1bed824: a940d275     	ldp	x21, x20, [x19, #0x8]
 1bed828: 17ffffd1     	b	0x1bed76c <_ChromeMain+0x1be84d0>
 1bed82c: 710022df     	cmp	w22, #0x8
 1bed830: 54000840     	b.eq	0x1bed938 <_ChromeMain+0x1be869c>
 1bed834: b005fdc8     	adrp	x8, 0xdba6000 <dyld_stub_binder+0xdba6000>
 1bed838: 9114a108     	add	x8, x8, #0x528
 1bed83c: 52800449     	mov	w9, #0x22               ; =34
 1bed840: a90da7e8     	stp	x8, x9, [sp, #0xd8]
 1bed844: 71001adf     	cmp	w22, #0x6
 1bed848: 54000a41     	b.ne	0x1bed990 <_ChromeMain+0x1be86f4>
 1bed84c: b005fdc8     	adrp	x8, 0xdba6000 <dyld_stub_binder+0xdba6000>
 1bed850: 91175908     	add	x8, x8, #0x5d6
 1bed854: 52800309     	mov	w9, #0x18               ; =24
 1bed858: a90ea7e8     	stp	x8, x9, [sp, #0xe8]
 1bed85c: b005fdc8     	adrp	x8, 0xdba6000 <dyld_stub_binder+0xdba6000>
 1bed860: 91152d08     	add	x8, x8, #0x54b
 1bed864: 52800169     	mov	w9, #0xb                ; =11
 1bed868: a90fa7e8     	stp	x8, x9, [sp, #0xf8]
 1bed86c: 910303e8     	add	x8, sp, #0xc0
 1bed870: 910363e0     	add	x0, sp, #0xd8
 1bed874: 52800061     	mov	w1, #0x3                ; =3
 1bed878: 97a9f4b7     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 1bed87c: 910303e0     	add	x0, sp, #0xc0
 1bed880: aa1403e1     	mov	x1, x20
 1bed884: 97a878e7     	bl	0x60bc20 <_ChromeMain+0x606984>
 1bed888: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 1bed88c: 36fffae8     	tbz	w8, #0x1f, 0x1bed7e8 <_ChromeMain+0x1be854c>
 1bed890: f94063e0     	ldr	x0, [sp, #0xc0]
 1bed894: f9406be8     	ldr	x8, [sp, #0xd0]
 1bed898: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 1bed89c: 97906d87     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 1bed8a0: 17ffffd2     	b	0x1bed7e8 <_ChromeMain+0x1be854c>
 1bed8a4: 95905aaf     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 1bed8a8: 3707fa14     	tbnz	w20, #0x0, 0x1bed7e8 <_ChromeMain+0x1be854c>
 1bed8ac: b4fff9f3     	cbz	x19, 0x1bed7e8 <_ChromeMain+0x1be854c>
 1bed8b0: aa1303e0     	mov	x0, x19
 1bed8b4: 947a32bf     	bl	0x3a7a3b0 <_ChromeMain+0x3a75114>
 1bed8b8: d2800013     	mov	x19, #0x0               ; =0
 1bed8bc: 17ffffcb     	b	0x1bed7e8 <_ChromeMain+0x1be854c>
 1bed8c0: 910363e0     	add	x0, sp, #0xd8
 1bed8c4: 979532ac     	bl	0x13a374 <_ChromeMain+0x1350d8>
 1bed8c8: 17ffff96     	b	0x1bed720 <_ChromeMain+0x1be8484>
 1bed8cc: f94033e0     	ldr	x0, [sp, #0x60]
 1bed8d0: f9403be8     	ldr	x8, [sp, #0x70]
 1bed8d4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 1bed8d8: 97906d78     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 1bed8dc: 17ffff93     	b	0x1bed728 <_ChromeMain+0x1be848c>
 1bed8e0: f94043e0     	ldr	x0, [sp, #0x80]
 1bed8e4: f9404be8     	ldr	x8, [sp, #0x90]
 1bed8e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 1bed8ec: 97906d73     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 1bed8f0: 17ffff90     	b	0x1bed730 <_ChromeMain+0x1be8494>
 1bed8f4: f94063e0     	ldr	x0, [sp, #0xc0]
 1bed8f8: f9406be8     	ldr	x8, [sp, #0xd0]
 1bed8fc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 1bed900: 97906d6e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 1bed904: 17ffff93     	b	0x1bed750 <_ChromeMain+0x1be84b4>
 1bed908: 910363e0     	add	x0, sp, #0xd8
 1bed90c: aa1803e1     	mov	x1, x24
 1bed910: 947a35b0     	bl	0x3a7afd0 <_ChromeMain+0x3a75d34>
 1bed914: 52800028     	mov	w8, #0x1                ; =1
 1bed918: 390523e8     	strb	w8, [sp, #0x148]
 1bed91c: 17ffff6d     	b	0x1bed6d0 <_ChromeMain+0x1be8434>
 1bed920: d2800008     	mov	x8, #0x0                ; =0
 1bed924: d280000a     	mov	x10, #0x0               ; =0
