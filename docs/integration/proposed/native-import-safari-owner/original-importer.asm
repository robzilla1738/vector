
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40ee4ac: d10283ff     	sub	sp, sp, #0xa0
 40ee4b0: a9046ffc     	stp	x28, x27, [sp, #0x40]
 40ee4b4: a90567fa     	stp	x26, x25, [sp, #0x50]
 40ee4b8: a9065ff8     	stp	x24, x23, [sp, #0x60]
 40ee4bc: a90757f6     	stp	x22, x21, [sp, #0x70]
 40ee4c0: a9084ff4     	stp	x20, x19, [sp, #0x80]
 40ee4c4: a9097bfd     	stp	x29, x30, [sp, #0x90]
 40ee4c8: 910243fd     	add	x29, sp, #0x90
 40ee4cc: aa0203f4     	mov	x20, x2
 40ee4d0: aa0103f5     	mov	x21, x1
 40ee4d4: aa0003f3     	mov	x19, x0
 40ee4d8: f0055608     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40ee4dc: f9468d08     	ldr	x8, [x8, #0xd18]
 40ee4e0: d63f0100     	blr	x8
 40ee4e4: f9006260     	str	x0, [x19, #0xc0]
 40ee4e8: 390a6274     	strb	w20, [x19, #0x298]
 40ee4ec: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 40ee4f0: f9001bff     	str	xzr, [sp, #0x30]
 40ee4f4: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 40ee4f8: 36f80568     	tbz	w8, #0x1f, 0x40ee5a4 <_ChromeMain+0x40e9308>
 40ee4fc: a9400aa1     	ldp	x1, x2, [x21]
 40ee500: 910083e0     	add	x0, sp, #0x20
 40ee504: 96fca745     	bl	0x18218 <_ChromeMain+0x12f7c>
 40ee508: 3940dfe8     	ldrb	w8, [sp, #0x37]
 40ee50c: f94017e9     	ldr	x9, [sp, #0x28]
 40ee510: 7219011f     	tst	w8, #0x80
 40ee514: 9a881128     	csel	x8, x9, x8, ne
 40ee518: b50005e8     	cbnz	x8, 0x40ee5d4 <_ChromeMain+0x40e9338>
 40ee51c: f004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40ee520: 9132d800     	add	x0, x0, #0xcb6
 40ee524: 52800021     	mov	w1, #0x1                ; =1
 40ee528: 52800082     	mov	w2, #0x4                ; =4
 40ee52c: 528000a3     	mov	w3, #0x5                ; =5
 40ee530: 52800024     	mov	w4, #0x1                ; =1
 40ee534: 9720bc13     	bl	0x91d580 <_ChromeMain+0x9182e4>
 40ee538: f9400008     	ldr	x8, [x0]
 40ee53c: f9401908     	ldr	x8, [x8, #0x30]
 40ee540: d0fe0649     	adrp	x9, 0x1b8000 <_ChromeMain+0x1b2d64>
 40ee544: 912b0129     	add	x9, x9, #0xac0
 40ee548: eb09011f     	cmp	x8, x9
 40ee54c: 54000361     	b.ne	0x40ee5b8 <_ChromeMain+0x40e931c>
 40ee550: 52800001     	mov	w1, #0x0                ; =0
 40ee554: 9703295b     	bl	0x1b8ac0 <_ChromeMain+0x1b3824>
 40ee558: f9401660     	ldr	x0, [x19, #0x28]
 40ee55c: b4002000     	cbz	x0, 0x40ee95c <_ChromeMain+0x40e96c0>
 40ee560: f9400008     	ldr	x8, [x0]
 40ee564: f9400908     	ldr	x8, [x8, #0x10]
 40ee568: d63f0100     	blr	x8
 40ee56c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 40ee570: 36f800a8     	tbz	w8, #0x1f, 0x40ee584 <_ChromeMain+0x40e92e8>
 40ee574: f94013e0     	ldr	x0, [sp, #0x20]
 40ee578: f9401be8     	ldr	x8, [sp, #0x30]
 40ee57c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40ee580: 96fc6a4e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40ee584: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 40ee588: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 40ee58c: a94757f6     	ldp	x22, x21, [sp, #0x70]
 40ee590: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 40ee594: a94567fa     	ldp	x26, x25, [sp, #0x50]
 40ee598: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 40ee59c: 910283ff     	add	sp, sp, #0xa0
 40ee5a0: d65f03c0     	ret
 40ee5a4: 3dc002a0     	ldr	q0, [x21]
 40ee5a8: 3d800be0     	str	q0, [sp, #0x20]
 40ee5ac: f9400aa8     	ldr	x8, [x21, #0x10]
 40ee5b0: f9001be8     	str	x8, [sp, #0x30]
 40ee5b4: 17ffffd5     	b	0x40ee508 <_ChromeMain+0x40e926c>
 40ee5b8: 52800001     	mov	w1, #0x0                ; =0
 40ee5bc: d63f0100     	blr	x8
 40ee5c0: 17ffffe6     	b	0x40ee558 <_ChromeMain+0x40e92bc>
 40ee5c4: a9400aa1     	ldp	x1, x2, [x21]
 40ee5c8: 9100e2c0     	add	x0, x22, #0x38
 40ee5cc: 96fca713     	bl	0x18218 <_ChromeMain+0x12f7c>
 40ee5d0: 14000044     	b	0x40ee6e0 <_ChromeMain+0x40e9444>
 40ee5d4: 91002274     	add	x20, x19, #0x8
 40ee5d8: f004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40ee5dc: 9131a400     	add	x0, x0, #0xc69
 40ee5e0: f004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40ee5e4: 91309421     	add	x1, x1, #0xc25
 40ee5e8: 910003f6     	mov	x22, sp
 40ee5ec: 910003e8     	mov	x8, sp
 40ee5f0: 52802782     	mov	w2, #0x13c              ; =316
 40ee5f4: 96fd89a3     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40ee5f8: 90055638     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40ee5fc: f9404708     	ldr	x8, [x24, #0x88]
 40ee600: 925e7699     	and	x25, x20, #0xfffffffc00000000
 40ee604: eb08033f     	cmp	x25, x8
 40ee608: 54000081     	b.ne	0x40ee618 <_ChromeMain+0x40e937c>
 40ee60c: 91002260     	add	x0, x19, #0x8
 40ee610: 96fc973b     	bl	0x142fc <_ChromeMain+0xf060>
 40ee614: f9404708     	ldr	x8, [x24, #0x88]
 40ee618: 925e76db     	and	x27, x22, #0xfffffffc00000000
 40ee61c: eb08037f     	cmp	x27, x8
 40ee620: 54000081     	b.ne	0x40ee630 <_ChromeMain+0x40e9394>
 40ee624: 910003e0     	mov	x0, sp
 40ee628: 96fc9735     	bl	0x142fc <_ChromeMain+0xf060>
 40ee62c: f9404708     	ldr	x8, [x24, #0x88]
 40ee630: eb08033f     	cmp	x25, x8
 40ee634: 54000061     	b.ne	0x40ee640 <_ChromeMain+0x40e93a4>
 40ee638: 91002260     	add	x0, x19, #0x8
 40ee63c: 96fcd100     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ee640: f9400297     	ldr	x23, [x20]
 40ee644: 925e76f6     	and	x22, x23, #0xfffffffc00000000
 40ee648: f9404708     	ldr	x8, [x24, #0x88]
 40ee64c: eb0802df     	cmp	x22, x8
 40ee650: 54000061     	b.ne	0x40ee65c <_ChromeMain+0x40e93c0>
 40ee654: aa1703e0     	mov	x0, x23
 40ee658: 96fc9729     	bl	0x142fc <_ChromeMain+0xf060>
 40ee65c: f9404708     	ldr	x8, [x24, #0x88]
 40ee660: eb0802df     	cmp	x22, x8
 40ee664: 54000061     	b.ne	0x40ee670 <_ChromeMain+0x40e93d4>
 40ee668: aa1703e0     	mov	x0, x23
 40ee66c: 96fc9724     	bl	0x142fc <_ChromeMain+0xf060>
 40ee670: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 40ee674: f9404709     	ldr	x9, [x24, #0x88]
 40ee678: eb09011f     	cmp	x8, x9
 40ee67c: 54000061     	b.ne	0x40ee688 <_ChromeMain+0x40e93ec>
 40ee680: aa1703e0     	mov	x0, x23
 40ee684: 96fcd0ee     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ee688: 52800a00     	mov	w0, #0x50               ; =80
 40ee68c: 96fc8337     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ee690: aa0003f6     	mov	x22, x0
 40ee694: 52800028     	mov	w8, #0x1                ; =1
 40ee698: 100216c9     	adr	x9, 0x40f2970 <_ChromeMain+0x40ed6d4>
 40ee69c: d503201f     	nop
 40ee6a0: 10dd5eca     	adr	x10, 0x40a9278 <_ChromeMain+0x40a3fdc>
 40ee6a4: d503201f     	nop
 40ee6a8: b9000008     	str	w8, [x0]
 40ee6ac: f0ff237a     	adrp	x26, 0x255d000 <_ChromeMain+0x2557d64>
 40ee6b0: 912c035a     	add	x26, x26, #0xb00
 40ee6b4: 10001608     	adr	x8, 0x40ee974 <_ChromeMain+0x40e96d8>
 40ee6b8: d503201f     	nop
 40ee6bc: a900a809     	stp	x9, x10, [x0, #0x8]
 40ee6c0: a901a01a     	stp	x26, x8, [x0, #0x18]
 40ee6c4: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 40ee6c8: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 40ee6cc: 37fff7c8     	tbnz	w8, #0x1f, 0x40ee5c4 <_ChromeMain+0x40e9328>
 40ee6d0: 3dc002a0     	ldr	q0, [x21]
 40ee6d4: 3c8382c0     	stur	q0, [x22, #0x38]
 40ee6d8: f9400aa8     	ldr	x8, [x21, #0x10]
 40ee6dc: f80482c8     	stur	x8, [x22, #0x48]
 40ee6e0: f9404708     	ldr	x8, [x24, #0x88]
 40ee6e4: eb08033f     	cmp	x25, x8
 40ee6e8: 54000081     	b.ne	0x40ee6f8 <_ChromeMain+0x40e945c>
 40ee6ec: 91002260     	add	x0, x19, #0x8
 40ee6f0: 96fc9703     	bl	0x142fc <_ChromeMain+0xf060>
 40ee6f4: f9404708     	ldr	x8, [x24, #0x88]
 40ee6f8: eb08037f     	cmp	x27, x8
 40ee6fc: 54000061     	b.ne	0x40ee708 <_ChromeMain+0x40e946c>
 40ee700: 910003e0     	mov	x0, sp
 40ee704: 96fc96fe     	bl	0x142fc <_ChromeMain+0xf060>
 40ee708: 52800600     	mov	w0, #0x30               ; =48
 40ee70c: 96fc8317     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ee710: aa0003e3     	mov	x3, x0
 40ee714: 52800028     	mov	w8, #0x1                ; =1
 40ee718: b9000008     	str	w8, [x0]
 40ee71c: 9000c9a8     	adrp	x8, 0x5a22000 <_ChromeMain+0x5a1cd64>
 40ee720: 91132108     	add	x8, x8, #0x4c8
 40ee724: 90feea09     	adrp	x9, 0x1e2e000 <_ChromeMain+0x1e28d64>
 40ee728: 913c0129     	add	x9, x9, #0xf00
 40ee72c: a900a408     	stp	x8, x9, [x0, #0x8]
 40ee730: 100015c8     	adr	x8, 0x40ee9e8 <_ChromeMain+0x40e974c>
 40ee734: d503201f     	nop
 40ee738: a901a01a     	stp	x26, x8, [x0, #0x18]
 40ee73c: f9400e60     	ldr	x0, [x19, #0x18]
 40ee740: 910003e1     	mov	x1, sp
 40ee744: aa1603e2     	mov	x2, x22
 40ee748: 94d982f4     	bl	0x774f318 <_ChromeMain+0x774a07c>
 40ee74c: f9404708     	ldr	x8, [x24, #0x88]
 40ee750: eb08033f     	cmp	x25, x8
 40ee754: 54000081     	b.ne	0x40ee764 <_ChromeMain+0x40e94c8>
 40ee758: 91002260     	add	x0, x19, #0x8
 40ee75c: 96fcd0b8     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ee760: f9404708     	ldr	x8, [x24, #0x88]
 40ee764: eb08037f     	cmp	x27, x8
 40ee768: 54000101     	b.ne	0x40ee788 <_ChromeMain+0x40e94ec>
 40ee76c: 910003e0     	mov	x0, sp
 40ee770: 96fcd0b3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ee774: f9404708     	ldr	x8, [x24, #0x88]
 40ee778: eb08037f     	cmp	x27, x8
 40ee77c: 54000061     	b.ne	0x40ee788 <_ChromeMain+0x40e94ec>
 40ee780: 910003e0     	mov	x0, sp
 40ee784: 96fcd0ae     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ee788: f004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40ee78c: 9131a400     	add	x0, x0, #0xc69
 40ee790: f004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40ee794: 91309421     	add	x1, x1, #0xc25
 40ee798: 910003f5     	mov	x21, sp
 40ee79c: 910003e8     	mov	x8, sp
 40ee7a0: 52802802     	mov	w2, #0x140              ; =320
 40ee7a4: 96fd8937     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40ee7a8: f940471b     	ldr	x27, [x24, #0x88]
 40ee7ac: eb1b033f     	cmp	x25, x27
 40ee7b0: 54000081     	b.ne	0x40ee7c0 <_ChromeMain+0x40e9524>
 40ee7b4: 91002260     	add	x0, x19, #0x8
 40ee7b8: 96fc96d1     	bl	0x142fc <_ChromeMain+0xf060>
 40ee7bc: f940471b     	ldr	x27, [x24, #0x88]
 40ee7c0: 925e76b7     	and	x23, x21, #0xfffffffc00000000
 40ee7c4: eb1b02ff     	cmp	x23, x27
 40ee7c8: 54000081     	b.ne	0x40ee7d8 <_ChromeMain+0x40e953c>
 40ee7cc: 910003e0     	mov	x0, sp
 40ee7d0: 96fc96cb     	bl	0x142fc <_ChromeMain+0xf060>
 40ee7d4: f940471b     	ldr	x27, [x24, #0x88]
 40ee7d8: eb1b033f     	cmp	x25, x27
 40ee7dc: 54000081     	b.ne	0x40ee7ec <_ChromeMain+0x40e9550>
 40ee7e0: 91002260     	add	x0, x19, #0x8
 40ee7e4: 96fcd096     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ee7e8: f940471b     	ldr	x27, [x24, #0x88]
 40ee7ec: f9400296     	ldr	x22, [x20]
 40ee7f0: 925e76d5     	and	x21, x22, #0xfffffffc00000000
 40ee7f4: eb1b02bf     	cmp	x21, x27
 40ee7f8: 54000081     	b.ne	0x40ee808 <_ChromeMain+0x40e956c>
 40ee7fc: aa1603e0     	mov	x0, x22
 40ee800: 96fc96bf     	bl	0x142fc <_ChromeMain+0xf060>
 40ee804: f940471b     	ldr	x27, [x24, #0x88]
 40ee808: eb1b02bf     	cmp	x21, x27
 40ee80c: 54000081     	b.ne	0x40ee81c <_ChromeMain+0x40e9580>
 40ee810: aa1603e0     	mov	x0, x22
 40ee814: 96fc96ba     	bl	0x142fc <_ChromeMain+0xf060>
 40ee818: f940471b     	ldr	x27, [x24, #0x88]
 40ee81c: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 40ee820: eb1b011f     	cmp	x8, x27
 40ee824: 54000081     	b.ne	0x40ee834 <_ChromeMain+0x40e9598>
 40ee828: aa1603e0     	mov	x0, x22
 40ee82c: 96fcd084     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ee830: f940471b     	ldr	x27, [x24, #0x88]
 40ee834: 52800a00     	mov	w0, #0x50               ; =80
 40ee838: 96fc82cc     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ee83c: aa0003f5     	mov	x21, x0
 40ee840: 52800028     	mov	w8, #0x1                ; =1
 40ee844: b9000008     	str	w8, [x0]
 40ee848: 10020bc8     	adr	x8, 0x40f29c0 <_ChromeMain+0x40ed724>
 40ee84c: d503201f     	nop
 40ee850: b0ffc509     	adrp	x9, 0x398f000 <_ChromeMain+0x3989d64>
 40ee854: 912e0129     	add	x9, x9, #0xb80
 40ee858: a900a408     	stp	x8, x9, [x0, #0x8]
 40ee85c: 10000f48     	adr	x8, 0x40eea44 <_ChromeMain+0x40e97a8>
 40ee860: d503201f     	nop
 40ee864: a901a01a     	stp	x26, x8, [x0, #0x18]
 40ee868: a902d81f     	stp	xzr, x22, [x0, #0x28]
 40ee86c: 3dc00be0     	ldr	q0, [sp, #0x20]
 40ee870: 3c838000     	stur	q0, [x0, #0x38]
 40ee874: f9401be8     	ldr	x8, [sp, #0x30]
 40ee878: f9002408     	str	x8, [x0, #0x48]
 40ee87c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 40ee880: f9001bff     	str	xzr, [sp, #0x30]
 40ee884: eb1b033f     	cmp	x25, x27
 40ee888: 54000081     	b.ne	0x40ee898 <_ChromeMain+0x40e95fc>
 40ee88c: 91002260     	add	x0, x19, #0x8
 40ee890: 96fc969b     	bl	0x142fc <_ChromeMain+0xf060>
 40ee894: f940471b     	ldr	x27, [x24, #0x88]
 40ee898: eb1b02ff     	cmp	x23, x27
 40ee89c: 54000061     	b.ne	0x40ee8a8 <_ChromeMain+0x40e960c>
 40ee8a0: 910003e0     	mov	x0, sp
 40ee8a4: 96fc9696     	bl	0x142fc <_ChromeMain+0xf060>
 40ee8a8: f9415a76     	ldr	x22, [x19, #0x2b0]
 40ee8ac: b40000d6     	cbz	x22, 0x40ee8c4 <_ChromeMain+0x40e9628>
 40ee8b0: 52800028     	mov	w8, #0x1                ; =1
 40ee8b4: b82802c8     	ldadd	w8, w8, [x22]
 40ee8b8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40ee8bc: 6b09011f     	cmp	w8, w9
 40ee8c0: 54000540     	b.eq	0x40ee968 <_ChromeMain+0x40e96cc>
 40ee8c4: f9415e7a     	ldr	x26, [x19, #0x2b8]
 40ee8c8: 52800800     	mov	w0, #0x40               ; =64
 40ee8cc: 96fc82a7     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ee8d0: aa0003e3     	mov	x3, x0
 40ee8d4: 52800028     	mov	w8, #0x1                ; =1
 40ee8d8: b9000008     	str	w8, [x0]
 40ee8dc: f0ff4448     	adrp	x8, 0x2979000 <_ChromeMain+0x2973d64>
 40ee8e0: 91340108     	add	x8, x8, #0xd00
 40ee8e4: d0fff3e9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40ee8e8: 912b0129     	add	x9, x9, #0xac0
 40ee8ec: a900a408     	stp	x8, x9, [x0, #0x8]
 40ee8f0: 10dfee88     	adr	x8, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40ee8f4: d503201f     	nop
 40ee8f8: 10001469     	adr	x9, 0x40eeb84 <_ChromeMain+0x40e98e8>
 40ee8fc: d503201f     	nop
 40ee900: a901a408     	stp	x8, x9, [x0, #0x18]
 40ee904: a902d81f     	stp	xzr, x22, [x0, #0x28]
 40ee908: f9001c1a     	str	x26, [x0, #0x38]
 40ee90c: f9400e60     	ldr	x0, [x19, #0x18]
 40ee910: 910003e1     	mov	x1, sp
 40ee914: aa1503e2     	mov	x2, x21
 40ee918: 97628a44     	bl	0x1991228 <_ChromeMain+0x198bf8c>
 40ee91c: f9404708     	ldr	x8, [x24, #0x88]
 40ee920: eb08033f     	cmp	x25, x8
 40ee924: 54000081     	b.ne	0x40ee934 <_ChromeMain+0x40e9698>
 40ee928: aa1403e0     	mov	x0, x20
 40ee92c: 96fcd044     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ee930: f9404708     	ldr	x8, [x24, #0x88]
 40ee934: eb0802ff     	cmp	x23, x8
 40ee938: 54ffe1a1     	b.ne	0x40ee56c <_ChromeMain+0x40e92d0>
 40ee93c: 910003e0     	mov	x0, sp
 40ee940: 96fcd03f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ee944: f9404708     	ldr	x8, [x24, #0x88]
 40ee948: eb0802ff     	cmp	x23, x8
 40ee94c: 54ffe101     	b.ne	0x40ee56c <_ChromeMain+0x40e92d0>
 40ee950: 910003e0     	mov	x0, sp
 40ee954: 96fcd03a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ee958: 17ffff05     	b	0x40ee56c <_ChromeMain+0x40e92d0>
 40ee95c: d4200000     	brk	#0
 40ee960: d4400000     	hlt	#0
 40ee964: d4200020     	brk	#0x1
 40ee968: d4200000     	brk	#0
 40ee96c: d4400000     	hlt	#0
 40ee970: d4200020     	brk	#0x1
 40ee974: d10383ff     	sub	sp, sp, #0xe0
 40ee978: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 40ee97c: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 40ee980: 910343fd     	add	x29, sp, #0xd0
 40ee984: aa0103e0     	mov	x0, x1
 40ee988: f90013ff     	str	xzr, [sp, #0x20]
 40ee98c: 6f00e400     	movi.2d	v0, #0000000000000000
 40ee990: ad0003e0     	stp	q0, q0, [sp]
 40ee994: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 40ee998: ad0403e0     	stp	q0, q0, [sp, #0x80]
 40ee99c: ad0303e0     	stp	q0, q0, [sp, #0x60]
 40ee9a0: ad0203e0     	stp	q0, q0, [sp, #0x40]
 40ee9a4: 3d800fe0     	str	q0, [sp, #0x30]
 40ee9a8: 9100c3e1     	add	x1, sp, #0x30
 40ee9ac: 9717fff0     	bl	0x6ee96c <_ChromeMain+0x6e96d0>
 40ee9b0: aa0003f3     	mov	x19, x0
 40ee9b4: 35000160     	cbnz	w0, 0x40ee9e0 <_ChromeMain+0x40e9744>
 40ee9b8: 910003e0     	mov	x0, sp
 40ee9bc: 9100c3e1     	add	x1, sp, #0x30
 40ee9c0: 973346b4     	bl	0xdc0490 <_ChromeMain+0xdbb1f4>
 40ee9c4: f94003e0     	ldr	x0, [sp]
 40ee9c8: 7100027f     	cmp	w19, #0x0
 40ee9cc: 1a9f17e1     	cset	w1, eq
 40ee9d0: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 40ee9d4: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 40ee9d8: 910383ff     	add	sp, sp, #0xe0
 40ee9dc: d65f03c0     	ret
 40ee9e0: d2800000     	mov	x0, #0x0                ; =0
 40ee9e4: 17fffff9     	b	0x40ee9c8 <_ChromeMain+0x40e972c>
 40ee9e8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 40ee9ec: a9017bfd     	stp	x29, x30, [sp, #0x10]
 40ee9f0: 910043fd     	add	x29, sp, #0x10
 40ee9f4: 910ffc08     	add	x8, x0, #0x3ff
 40ee9f8: f100001f     	cmp	x0, #0x0
 40ee9fc: 9a804108     	csel	x8, x8, x0, mi
 40eea00: d34afd08     	lsr	x8, x8, #10
 40eea04: 7200003f     	tst	w1, #0x1
 40eea08: 1a9f1113     	csel	w19, w8, wzr, ne
 40eea0c: f004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40eea10: 91338000     	add	x0, x0, #0xce0
 40eea14: 52807d01     	mov	w1, #0x3e8              ; =1000
 40eea18: 52942402     	mov	w2, #0xa120             ; =41248
 40eea1c: 72a000e2     	movk	w2, #0x7, lsl #16
 40eea20: 52800643     	mov	w3, #0x32               ; =50
 40eea24: 52800024     	mov	w4, #0x1                ; =1
 40eea28: 970fa366     	bl	0x4d77c0 <_ChromeMain+0x4d2524>
 40eea2c: f9400008     	ldr	x8, [x0]
 40eea30: f9401902     	ldr	x2, [x8, #0x30]
 40eea34: aa1303e1     	mov	x1, x19
 40eea38: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 40eea3c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 40eea40: d61f0040     	br	x2
 40eea44: d10183ff     	sub	sp, sp, #0x60
 40eea48: a90167fa     	stp	x26, x25, [sp, #0x10]
 40eea4c: a9025ff8     	stp	x24, x23, [sp, #0x20]
 40eea50: a90357f6     	stp	x22, x21, [sp, #0x30]
 40eea54: a9044ff4     	stp	x20, x19, [sp, #0x40]
 40eea58: a9057bfd     	stp	x29, x30, [sp, #0x50]
 40eea5c: 910143fd     	add	x29, sp, #0x50
 40eea60: aa0003f4     	mov	x20, x0
 40eea64: 39805c28     	ldrsb	x8, [x1, #0x17]
 40eea68: a9402829     	ldp	x9, x10, [x1]
 40eea6c: f100011f     	cmp	x8, #0x0
 40eea70: 9a814136     	csel	x22, x9, x1, mi
 40eea74: 7100011f     	cmp	w8, #0x0
 40eea78: 9a884153     	csel	x19, x10, x8, mi
 40eea7c: b40007f3     	cbz	x19, 0x40eeb78 <_ChromeMain+0x40e98dc>
 40eea80: b7f80813     	tbnz	x19, #0x3f, 0x40eeb80 <_ChromeMain+0x40e98e4>
 40eea84: 8b1302d7     	add	x23, x22, x19
 40eea88: aa1303e0     	mov	x0, x19
 40eea8c: 96fc8237     	bl	0xf368 <_ChromeMain+0xa0cc>
 40eea90: cb0003e8     	neg	x8, x0
 40eea94: aa3603e9     	mvn	x9, x22
 40eea98: 8b0902e9     	add	x9, x23, x9
 40eea9c: eb08013f     	cmp	x9, x8
 40eeaa0: 54000322     	b.hs	0x40eeb04 <_ChromeMain+0x40e9868>
 40eeaa4: aa0003f5     	mov	x21, x0
 40eeaa8: aa1603e1     	mov	x1, x22
 40eeaac: aa1303e2     	mov	x2, x19
 40eeab0: 94fc6c92     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 40eeab4: aa150268     	orr	x8, x19, x21
 40eeab8: f100011f     	cmp	x8, #0x0
 40eeabc: 9a9f16a1     	csinc	x1, x21, xzr, ne
 40eeac0: 910003e0     	mov	x0, sp
 40eeac4: aa1303e2     	mov	x2, x19
 40eeac8: 96fd6278     	bl	0x474a8 <_ChromeMain+0x4220c>
 40eeacc: a94007e0     	ldp	x0, x1, [sp]
 40eead0: 9428481c     	bl	0x4b00b40 <_ChromeMain+0x4afb8a4>
 40eead4: aa0003f7     	mov	x23, x0
 40eead8: f90003e0     	str	x0, [sp]
 40eeadc: 94284011     	bl	0x4afeb20 <_ChromeMain+0x4af9884>
 40eeae0: aa0003f6     	mov	x22, x0
 40eeae4: 36000220     	tbz	w0, #0x0, 0x40eeb28 <_ChromeMain+0x40e988c>
 40eeae8: b4000077     	cbz	x23, 0x40eeaf4 <_ChromeMain+0x40e9858>
 40eeaec: 910003e0     	mov	x0, sp
 40eeaf0: 94283fd8     	bl	0x4afea50 <_ChromeMain+0x4af97b4>
 40eeaf4: b40000b5     	cbz	x21, 0x40eeb08 <_ChromeMain+0x40e986c>
 40eeaf8: cb1503e8     	neg	x8, x21
 40eeafc: eb08027f     	cmp	x19, x8
 40eeb00: 54000349     	b.ls	0x40eeb68 <_ChromeMain+0x40e98cc>
 40eeb04: d4200020     	brk	#0x1
 40eeb08: 520002c0     	eor	w0, w22, #0x1
 40eeb0c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 40eeb10: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 40eeb14: a94357f6     	ldp	x22, x21, [sp, #0x30]
 40eeb18: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 40eeb1c: a94167fa     	ldp	x26, x25, [sp, #0x10]
 40eeb20: 910183ff     	add	sp, sp, #0x60
 40eeb24: d65f03c0     	ret
 40eeb28: 91002299     	add	x25, x20, #0x8
 40eeb2c: aa1703e0     	mov	x0, x23
 40eeb30: 95fffce4     	bl	0xc0edec0 <_ChromeMain+0xc0e8c24>
 40eeb34: aa0003f8     	mov	x24, x0
 40eeb38: 39404288     	ldrb	w8, [x20, #0x10]
 40eeb3c: 340000a8     	cbz	w8, 0x40eeb50 <_ChromeMain+0x40e98b4>
 40eeb40: f9400328     	ldr	x8, [x25]
 40eeb44: b4000068     	cbz	x8, 0x40eeb50 <_ChromeMain+0x40e98b4>
 40eeb48: 91002280     	add	x0, x20, #0x8
 40eeb4c: 94283fde     	bl	0x4afeac4 <_ChromeMain+0x4af9828>
 40eeb50: b4fffdb9     	cbz	x25, 0x40eeb04 <_ChromeMain+0x40e9868>
 40eeb54: f9000698     	str	x24, [x20, #0x8]
 40eeb58: 52800028     	mov	w8, #0x1                ; =1
 40eeb5c: 39004288     	strb	w8, [x20, #0x10]
 40eeb60: b5fffc77     	cbnz	x23, 0x40eeaec <_ChromeMain+0x40e9850>
 40eeb64: 17ffffe4     	b	0x40eeaf4 <_ChromeMain+0x40e9858>
 40eeb68: aa1503e0     	mov	x0, x21
 40eeb6c: aa1303e1     	mov	x1, x19
 40eeb70: 96fc68d2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40eeb74: 17ffffe5     	b	0x40eeb08 <_ChromeMain+0x40e986c>
 40eeb78: d2800015     	mov	x21, #0x0               ; =0
 40eeb7c: 17ffffce     	b	0x40eeab4 <_ChromeMain+0x40e9818>
 40eeb80: 97789480     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 40eeb84: d10283ff     	sub	sp, sp, #0xa0
 40eeb88: a9046ffc     	stp	x28, x27, [sp, #0x40]
 40eeb8c: a90567fa     	stp	x26, x25, [sp, #0x50]
 40eeb90: a9065ff8     	stp	x24, x23, [sp, #0x60]
 40eeb94: a90757f6     	stp	x22, x21, [sp, #0x70]
 40eeb98: a9084ff4     	stp	x20, x19, [sp, #0x80]
 40eeb9c: a9097bfd     	stp	x29, x30, [sp, #0x90]
 40eeba0: 910243fd     	add	x29, sp, #0x90
 40eeba4: aa0003f3     	mov	x19, x0
 40eeba8: 370003c1     	tbnz	w1, #0x0, 0x40eec20 <_ChromeMain+0x40e9984>
 40eebac: f004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40eebb0: 9132d800     	add	x0, x0, #0xcb6
 40eebb4: 52800021     	mov	w1, #0x1                ; =1
 40eebb8: 52800082     	mov	w2, #0x4                ; =4
 40eebbc: 528000a3     	mov	w3, #0x5                ; =5
 40eebc0: 52800024     	mov	w4, #0x1                ; =1
 40eebc4: 9720ba6f     	bl	0x91d580 <_ChromeMain+0x9182e4>
 40eebc8: f9400008     	ldr	x8, [x0]
 40eebcc: f9401908     	ldr	x8, [x8, #0x30]
 40eebd0: d0fe0649     	adrp	x9, 0x1b8000 <_ChromeMain+0x1b2d64>
 40eebd4: 912b0129     	add	x9, x9, #0xac0
 40eebd8: 52800041     	mov	w1, #0x2                ; =2
 40eebdc: eb09011f     	cmp	x8, x9
 40eebe0: 540001c1     	b.ne	0x40eec18 <_ChromeMain+0x40e997c>
 40eebe4: 970327b7     	bl	0x1b8ac0 <_ChromeMain+0x1b3824>
 40eebe8: f9401660     	ldr	x0, [x19, #0x28]
 40eebec: b4004980     	cbz	x0, 0x40ef51c <_ChromeMain+0x40ea280>
 40eebf0: f9400008     	ldr	x8, [x0]
 40eebf4: f9400901     	ldr	x1, [x8, #0x10]
 40eebf8: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 40eebfc: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 40eec00: a94757f6     	ldp	x22, x21, [sp, #0x70]
 40eec04: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 40eec08: a94567fa     	ldp	x26, x25, [sp, #0x50]
 40eec0c: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 40eec10: 910283ff     	add	sp, sp, #0xa0
 40eec14: d61f0020     	br	x1
 40eec18: d63f0100     	blr	x8
 40eec1c: 17fffff3     	b	0x40eebe8 <_ChromeMain+0x40e994c>
 40eec20: 394a6274     	ldrb	w20, [x19, #0x298]
 40eec24: f0055618     	adrp	x24, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40eec28: f9468f08     	ldr	x8, [x24, #0xd18]
 40eec2c: d63f0100     	blr	x8
 40eec30: 34000294     	cbz	w20, 0x40eec80 <_ChromeMain+0x40e99e4>
 40eec34: 9103e268     	add	x8, x19, #0xf8
 40eec38: 39440269     	ldrb	w9, [x19, #0x100]
 40eec3c: 350000c9     	cbnz	w9, 0x40eec54 <_ChromeMain+0x40e99b8>
 40eec40: b40046c8     	cbz	x8, 0x40ef518 <_ChromeMain+0x40ea27c>
 40eec44: f9007e60     	str	x0, [x19, #0xf8]
 40eec48: 52800028     	mov	w8, #0x1                ; =1
 40eec4c: 39040268     	strb	w8, [x19, #0x100]
 40eec50: 14000002     	b	0x40eec58 <_ChromeMain+0x40e99bc>
 40eec54: f9000100     	str	x0, [x8]
 40eec58: f9468f08     	ldr	x8, [x24, #0xd18]
 40eec5c: d63f0100     	blr	x8
 40eec60: 91096268     	add	x8, x19, #0x258
 40eec64: 39498269     	ldrb	w9, [x19, #0x260]
 40eec68: 35003c89     	cbnz	w9, 0x40ef3f8 <_ChromeMain+0x40ea15c>
 40eec6c: b4004568     	cbz	x8, 0x40ef518 <_ChromeMain+0x40ea27c>
 40eec70: f9012e60     	str	x0, [x19, #0x258]
 40eec74: 52800028     	mov	w8, #0x1                ; =1
 40eec78: 39098268     	strb	w8, [x19, #0x260]
 40eec7c: 140001e0     	b	0x40ef3fc <_ChromeMain+0x40ea160>
 40eec80: 9106a268     	add	x8, x19, #0x1a8
 40eec84: 3946c269     	ldrb	w9, [x19, #0x1b0]
 40eec88: 350000c9     	cbnz	w9, 0x40eeca0 <_ChromeMain+0x40e9a04>
 40eec8c: b4004468     	cbz	x8, 0x40ef518 <_ChromeMain+0x40ea27c>
 40eec90: f900d660     	str	x0, [x19, #0x1a8]
 40eec94: 52800028     	mov	w8, #0x1                ; =1
 40eec98: 3906c268     	strb	w8, [x19, #0x1b0]
 40eec9c: 14000002     	b	0x40eeca4 <_ChromeMain+0x40e9a08>
 40eeca0: f9000100     	str	x0, [x8]
 40eeca4: 91002276     	add	x22, x19, #0x8
 40eeca8: f004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40eecac: 91324c00     	add	x0, x0, #0xc93
 40eecb0: f004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40eecb4: 91309421     	add	x1, x1, #0xc25
 40eecb8: 910083f5     	add	x21, sp, #0x20
 40eecbc: 910083e8     	add	x8, sp, #0x20
 40eecc0: 52804782     	mov	w2, #0x23c              ; =572
 40eecc4: 96fd87ef     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40eecc8: 9005563a     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40eeccc: f9404754     	ldr	x20, [x26, #0x88]
 40eecd0: 925e76db     	and	x27, x22, #0xfffffffc00000000
 40eecd4: eb14037f     	cmp	x27, x20
 40eecd8: 54000081     	b.ne	0x40eece8 <_ChromeMain+0x40e9a4c>
 40eecdc: 91002260     	add	x0, x19, #0x8
 40eece0: 96fc9587     	bl	0x142fc <_ChromeMain+0xf060>
 40eece4: f9404754     	ldr	x20, [x26, #0x88]
 40eece8: 925e76b7     	and	x23, x21, #0xfffffffc00000000
 40eecec: eb1402ff     	cmp	x23, x20
 40eecf0: 54000081     	b.ne	0x40eed00 <_ChromeMain+0x40e9a64>
 40eecf4: 910083e0     	add	x0, sp, #0x20
 40eecf8: 96fc9581     	bl	0x142fc <_ChromeMain+0xf060>
 40eecfc: f9404754     	ldr	x20, [x26, #0x88]
 40eed00: eb14037f     	cmp	x27, x20
 40eed04: 54000081     	b.ne	0x40eed14 <_ChromeMain+0x40e9a78>
 40eed08: 91002260     	add	x0, x19, #0x8
 40eed0c: 96fccf4c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40eed10: f9404754     	ldr	x20, [x26, #0x88]
 40eed14: f94002d6     	ldr	x22, [x22]
 40eed18: 925e76d5     	and	x21, x22, #0xfffffffc00000000
 40eed1c: eb1402bf     	cmp	x21, x20
 40eed20: 54000081     	b.ne	0x40eed30 <_ChromeMain+0x40e9a94>
 40eed24: aa1603e0     	mov	x0, x22
 40eed28: 96fc9575     	bl	0x142fc <_ChromeMain+0xf060>
 40eed2c: f9404754     	ldr	x20, [x26, #0x88]
 40eed30: eb1402bf     	cmp	x21, x20
 40eed34: 54000081     	b.ne	0x40eed44 <_ChromeMain+0x40e9aa8>
 40eed38: aa1603e0     	mov	x0, x22
 40eed3c: 96fc9570     	bl	0x142fc <_ChromeMain+0xf060>
 40eed40: f9404754     	ldr	x20, [x26, #0x88]
 40eed44: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 40eed48: eb14011f     	cmp	x8, x20
 40eed4c: 54000081     	b.ne	0x40eed5c <_ChromeMain+0x40e9ac0>
 40eed50: aa1603e0     	mov	x0, x22
 40eed54: 96fccf3a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40eed58: f9404754     	ldr	x20, [x26, #0x88]
 40eed5c: 52800800     	mov	w0, #0x40               ; =64
 40eed60: 96fc8182     	bl	0xf368 <_ChromeMain+0xa0cc>
 40eed64: aa0003f5     	mov	x21, x0
 40eed68: 52800028     	mov	w8, #0x1                ; =1
 40eed6c: b9000008     	str	w8, [x0]
 40eed70: 10021289     	adr	x9, 0x40f2fc0 <_ChromeMain+0x40edd24>
 40eed74: d503201f     	nop
 40eed78: f0ffbd4a     	adrp	x10, 0x3899000 <_ChromeMain+0x3893d64>
 40eed7c: 9104014a     	add	x10, x10, #0x100
 40eed80: a900a809     	stp	x9, x10, [x0, #0x8]
 40eed84: f0ff236a     	adrp	x10, 0x255d000 <_ChromeMain+0x2557d64>
 40eed88: 912c014a     	add	x10, x10, #0xb00
 40eed8c: 10011c69     	adr	x9, 0x40f1118 <_ChromeMain+0x40ebe7c>
 40eed90: d503201f     	nop
 40eed94: a901a40a     	stp	x10, x9, [x0, #0x18]
 40eed98: a902d81f     	stp	xzr, x22, [x0, #0x28]
 40eed9c: 3900e008     	strb	w8, [x0, #0x38]
 40eeda0: eb14037f     	cmp	x27, x20
 40eeda4: 54000081     	b.ne	0x40eedb4 <_ChromeMain+0x40e9b18>
 40eeda8: 91002260     	add	x0, x19, #0x8
 40eedac: 96fc9554     	bl	0x142fc <_ChromeMain+0xf060>
 40eedb0: f9404754     	ldr	x20, [x26, #0x88]
 40eedb4: eb1402ff     	cmp	x23, x20
 40eedb8: 54000061     	b.ne	0x40eedc4 <_ChromeMain+0x40e9b28>
 40eedbc: 910083e0     	add	x0, sp, #0x20
 40eedc0: 96fc954f     	bl	0x142fc <_ChromeMain+0xf060>
 40eedc4: f9415a74     	ldr	x20, [x19, #0x2b0]
 40eedc8: b40000d4     	cbz	x20, 0x40eede0 <_ChromeMain+0x40e9b44>
 40eedcc: 52800028     	mov	w8, #0x1                ; =1
 40eedd0: b8280288     	ldadd	w8, w8, [x20]
 40eedd4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40eedd8: 6b09011f     	cmp	w8, w9
 40eeddc: 54003a60     	b.eq	0x40ef528 <_ChromeMain+0x40ea28c>
 40eede0: f9415e76     	ldr	x22, [x19, #0x2b8]
 40eede4: 52800800     	mov	w0, #0x40               ; =64
 40eede8: 96fc8160     	bl	0xf368 <_ChromeMain+0xa0cc>
 40eedec: aa0003e3     	mov	x3, x0
 40eedf0: 52800028     	mov	w8, #0x1                ; =1
 40eedf4: b9000008     	str	w8, [x0]
 40eedf8: 10021188     	adr	x8, 0x40f3028 <_ChromeMain+0x40edd8c>
 40eedfc: d503201f     	nop
 40eee00: d0fff3e9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40eee04: 912b0129     	add	x9, x9, #0xac0
 40eee08: a900a408     	stp	x8, x9, [x0, #0x8]
 40eee0c: 10dfc5a8     	adr	x8, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40eee10: d503201f     	nop
 40eee14: 10016d89     	adr	x9, 0x40f1bc4 <_ChromeMain+0x40ec928>
 40eee18: d503201f     	nop
 40eee1c: a901a408     	stp	x8, x9, [x0, #0x18]
 40eee20: a902d01f     	stp	xzr, x20, [x0, #0x28]
 40eee24: f9001c16     	str	x22, [x0, #0x38]
 40eee28: f9400e60     	ldr	x0, [x19, #0x18]
 40eee2c: 910083e1     	add	x1, sp, #0x20
 40eee30: aa1503e2     	mov	x2, x21
 40eee34: 97b6afb8     	bl	0x2e9ad14 <_ChromeMain+0x2e95a78>
 40eee38: f9404748     	ldr	x8, [x26, #0x88]
 40eee3c: eb08037f     	cmp	x27, x8
 40eee40: 54000081     	b.ne	0x40eee50 <_ChromeMain+0x40e9bb4>
 40eee44: 91002260     	add	x0, x19, #0x8
 40eee48: 96fccefd     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40eee4c: f9404748     	ldr	x8, [x26, #0x88]
 40eee50: eb0802ff     	cmp	x23, x8
 40eee54: 54000101     	b.ne	0x40eee74 <_ChromeMain+0x40e9bd8>
 40eee58: 910083e0     	add	x0, sp, #0x20
 40eee5c: 96fccef8     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40eee60: f9404748     	ldr	x8, [x26, #0x88]
 40eee64: eb0802ff     	cmp	x23, x8
 40eee68: 54000061     	b.ne	0x40eee74 <_ChromeMain+0x40e9bd8>
 40eee6c: 910083e0     	add	x0, sp, #0x20
 40eee70: 96fccef3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40eee74: f9468f08     	ldr	x8, [x24, #0xd18]
 40eee78: d63f0100     	blr	x8
 40eee7c: 91080268     	add	x8, x19, #0x200
 40eee80: 39482269     	ldrb	w9, [x19, #0x208]
 40eee84: 350000c9     	cbnz	w9, 0x40eee9c <_ChromeMain+0x40e9c00>
 40eee88: b4003488     	cbz	x8, 0x40ef518 <_ChromeMain+0x40ea27c>
 40eee8c: f9010260     	str	x0, [x19, #0x200]
 40eee90: 52800028     	mov	w8, #0x1                ; =1
 40eee94: 39082268     	strb	w8, [x19, #0x208]
 40eee98: 14000002     	b	0x40eeea0 <_ChromeMain+0x40e9c04>
 40eee9c: f9000100     	str	x0, [x8]
 40eeea0: f004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40eeea4: 91324c00     	add	x0, x0, #0xc93
 40eeea8: f004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40eeeac: 91309421     	add	x1, x1, #0xc25
 40eeeb0: 910083f4     	add	x20, sp, #0x20
 40eeeb4: 910083e8     	add	x8, sp, #0x20
 40eeeb8: 52804842     	mov	w2, #0x242              ; =578
 40eeebc: 96fd8771     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40eeec0: f9404748     	ldr	x8, [x26, #0x88]
 40eeec4: eb08037f     	cmp	x27, x8
 40eeec8: 54000081     	b.ne	0x40eeed8 <_ChromeMain+0x40e9c3c>
 40eeecc: 91002260     	add	x0, x19, #0x8
 40eeed0: 96fc950b     	bl	0x142fc <_ChromeMain+0xf060>
 40eeed4: f9404748     	ldr	x8, [x26, #0x88]
 40eeed8: 925e7694     	and	x20, x20, #0xfffffffc00000000
 40eeedc: eb08029f     	cmp	x20, x8
 40eeee0: 54000061     	b.ne	0x40eeeec <_ChromeMain+0x40e9c50>
 40eeee4: 910083e0     	add	x0, sp, #0x20
 40eeee8: 96fc9505     	bl	0x142fc <_ChromeMain+0xf060>
 40eeeec: f9415a76     	ldr	x22, [x19, #0x2b0]
 40eeef0: b40000d6     	cbz	x22, 0x40eef08 <_ChromeMain+0x40e9c6c>
 40eeef4: 52800028     	mov	w8, #0x1                ; =1
 40eeef8: b82802c8     	ldadd	w8, w8, [x22]
 40eeefc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40eef00: 6b09011f     	cmp	w8, w9
 40eef04: 54003240     	b.eq	0x40ef54c <_ChromeMain+0x40ea2b0>
 40eef08: f9415e77     	ldr	x23, [x19, #0x2b8]
 40eef0c: 52800800     	mov	w0, #0x40               ; =64
 40eef10: 96fc8116     	bl	0xf368 <_ChromeMain+0xa0cc>
 40eef14: aa0003f5     	mov	x21, x0
 40eef18: 52800028     	mov	w8, #0x1                ; =1
 40eef1c: 10020d69     	adr	x9, 0x40f30c8 <_ChromeMain+0x40ede2c>
 40eef20: d503201f     	nop
 40eef24: b9000008     	str	w8, [x0]
 40eef28: d0fff3e8     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40eef2c: 912b0108     	add	x8, x8, #0xac0
 40eef30: 10dfbc8a     	adr	x10, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40eef34: d503201f     	nop
 40eef38: a900a009     	stp	x9, x8, [x0, #0x8]
 40eef3c: 10017e08     	adr	x8, 0x40f1efc <_ChromeMain+0x40ecc60>
 40eef40: d503201f     	nop
 40eef44: a901a00a     	stp	x10, x8, [x0, #0x18]
 40eef48: a902d81f     	stp	xzr, x22, [x0, #0x28]
 40eef4c: f9001c17     	str	x23, [x0, #0x38]
 40eef50: f9400676     	ldr	x22, [x19, #0x8]
 40eef54: 925e76d7     	and	x23, x22, #0xfffffffc00000000
 40eef58: f9404748     	ldr	x8, [x26, #0x88]
 40eef5c: eb0802ff     	cmp	x23, x8
 40eef60: 54000061     	b.ne	0x40eef6c <_ChromeMain+0x40e9cd0>
 40eef64: aa1603e0     	mov	x0, x22
 40eef68: 96fc94e5     	bl	0x142fc <_ChromeMain+0xf060>
 40eef6c: f9404748     	ldr	x8, [x26, #0x88]
 40eef70: eb0802ff     	cmp	x23, x8
 40eef74: 54000061     	b.ne	0x40eef80 <_ChromeMain+0x40e9ce4>
 40eef78: aa1603e0     	mov	x0, x22
 40eef7c: 96fc94e0     	bl	0x142fc <_ChromeMain+0xf060>
 40eef80: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 40eef84: f9404749     	ldr	x9, [x26, #0x88]
 40eef88: eb09011f     	cmp	x8, x9
 40eef8c: 54000061     	b.ne	0x40eef98 <_ChromeMain+0x40e9cfc>
 40eef90: aa1603e0     	mov	x0, x22
 40eef94: 96fcceaa     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40eef98: 52800700     	mov	w0, #0x38               ; =56
 40eef9c: 96fc80f3     	bl	0xf368 <_ChromeMain+0xa0cc>
 40eefa0: aa0003f9     	mov	x25, x0
 40eefa4: 5280003c     	mov	w28, #0x1               ; =1
 40eefa8: 10a77748     	adr	x8, 0x403de90 <_ChromeMain+0x4038bf4>
 40eefac: d503201f     	nop
 40eefb0: b900001c     	str	w28, [x0]
 40eefb4: d0fecea9     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 40eefb8: 91180129     	add	x9, x9, #0x600
 40eefbc: 1001212a     	adr	x10, 0x40f13e0 <_ChromeMain+0x40ec144>
 40eefc0: d503201f     	nop
 40eefc4: a900a408     	stp	x8, x9, [x0, #0x8]
 40eefc8: f0ff237a     	adrp	x26, 0x255d000 <_ChromeMain+0x2557d64>
 40eefcc: 912c035a     	add	x26, x26, #0xb00
 40eefd0: a901a81a     	stp	x26, x10, [x0, #0x18]
 40eefd4: a902d81f     	stp	xzr, x22, [x0, #0x28]
 40eefd8: f9400e76     	ldr	x22, [x19, #0x18]
 40eefdc: 52800100     	mov	w0, #0x8                ; =8
 40eefe0: 96fc80e2     	bl	0xf368 <_ChromeMain+0xa0cc>
 40eefe4: aa0003f7     	mov	x23, x0
 40eefe8: f900001f     	str	xzr, [x0]
 40eefec: 52800700     	mov	w0, #0x38               ; =56
 40eeff0: 96fc80de     	bl	0xf368 <_ChromeMain+0xa0cc>
 40eeff4: aa0003f8     	mov	x24, x0
 40eeff8: b900001c     	str	w28, [x0]
 40eeffc: f0feada8     	adrp	x8, 0x16a5000 <_ChromeMain+0x169fd64>
 40ef000: 91190108     	add	x8, x8, #0x640
 40ef004: d0fff5c9     	adrp	x9, 0x3fa9000 <_ChromeMain+0x3fa3d64>
 40ef008: 91290129     	add	x9, x9, #0xa40
 40ef00c: a900a408     	stp	x8, x9, [x0, #0x8]
 40ef010: 10026a28     	adr	x8, 0x40f3d54 <_ChromeMain+0x40eeab8>
 40ef014: d503201f     	nop
 40ef018: a901a01a     	stp	x26, x8, [x0, #0x18]
 40ef01c: f9001419     	str	x25, [x0, #0x28]
 40ef020: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 40ef024: f005561a     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40ef028: f9404749     	ldr	x9, [x26, #0x88]
 40ef02c: eb09011f     	cmp	x8, x9
 40ef030: 54000061     	b.ne	0x40ef03c <_ChromeMain+0x40e9da0>
 40ef034: aa1703e0     	mov	x0, x23
 40ef038: 96fc94b1     	bl	0x142fc <_ChromeMain+0xf060>
 40ef03c: f9001b17     	str	x23, [x24, #0x30]
 40ef040: 52800700     	mov	w0, #0x38               ; =56
 40ef044: 96fc80c9     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef048: aa0003e3     	mov	x3, x0
 40ef04c: b900001c     	str	w28, [x0]
 40ef050: d0feb6a8     	adrp	x8, 0x17c5000 <_ChromeMain+0x17bfd64>
 40ef054: 91380108     	add	x8, x8, #0xe00
 40ef058: 10027e89     	adr	x9, 0x40f4028 <_ChromeMain+0x40eed8c>
 40ef05c: d503201f     	nop
 40ef060: a900a408     	stp	x8, x9, [x0, #0x8]
 40ef064: 10027568     	adr	x8, 0x40f3f10 <_ChromeMain+0x40eec74>
 40ef068: d503201f     	nop
 40ef06c: d0ff2369     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 40ef070: 912c0129     	add	x9, x9, #0xb00
 40ef074: a901a009     	stp	x9, x8, [x0, #0x18]
 40ef078: a902dc15     	stp	x21, x23, [x0, #0x28]
 40ef07c: 910083e1     	add	x1, sp, #0x20
 40ef080: aa1603e0     	mov	x0, x22
 40ef084: aa1803e2     	mov	x2, x24
 40ef088: 97428e8a     	bl	0x1192ab0 <_ChromeMain+0x118d814>
 40ef08c: f9404748     	ldr	x8, [x26, #0x88]
 40ef090: eb08037f     	cmp	x27, x8
 40ef094: d0055616     	adrp	x22, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40ef098: 54000081     	b.ne	0x40ef0a8 <_ChromeMain+0x40e9e0c>
 40ef09c: 91002260     	add	x0, x19, #0x8
 40ef0a0: 96fcce67     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ef0a4: f9404748     	ldr	x8, [x26, #0x88]
 40ef0a8: eb08029f     	cmp	x20, x8
 40ef0ac: 91002278     	add	x24, x19, #0x8
 40ef0b0: 54000061     	b.ne	0x40ef0bc <_ChromeMain+0x40e9e20>
 40ef0b4: 910083e0     	add	x0, sp, #0x20
 40ef0b8: 96fcce61     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ef0bc: f9468ec8     	ldr	x8, [x22, #0xd18]
 40ef0c0: d63f0100     	blr	x8
 40ef0c4: 9103e268     	add	x8, x19, #0xf8
 40ef0c8: 39440269     	ldrb	w9, [x19, #0x100]
 40ef0cc: 350000c9     	cbnz	w9, 0x40ef0e4 <_ChromeMain+0x40e9e48>
 40ef0d0: b4002248     	cbz	x8, 0x40ef518 <_ChromeMain+0x40ea27c>
 40ef0d4: f9007e60     	str	x0, [x19, #0xf8]
 40ef0d8: 52800028     	mov	w8, #0x1                ; =1
 40ef0dc: 39040268     	strb	w8, [x19, #0x100]
 40ef0e0: 14000002     	b	0x40ef0e8 <_ChromeMain+0x40e9e4c>
 40ef0e4: f9000100     	str	x0, [x8]
 40ef0e8: f9468ec8     	ldr	x8, [x22, #0xd18]
 40ef0ec: d63f0100     	blr	x8
 40ef0f0: 91096268     	add	x8, x19, #0x258
 40ef0f4: 39498269     	ldrb	w9, [x19, #0x260]
 40ef0f8: 350000c9     	cbnz	w9, 0x40ef110 <_ChromeMain+0x40e9e74>
 40ef0fc: b40020e8     	cbz	x8, 0x40ef518 <_ChromeMain+0x40ea27c>
 40ef100: f9012e60     	str	x0, [x19, #0x258]
 40ef104: 52800028     	mov	w8, #0x1                ; =1
 40ef108: 39098268     	strb	w8, [x19, #0x260]
 40ef10c: 14000002     	b	0x40ef114 <_ChromeMain+0x40e9e78>
 40ef110: f9000100     	str	x0, [x8]
 40ef114: d004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40ef118: 91324c00     	add	x0, x0, #0xc93
 40ef11c: d004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40ef120: 91309421     	add	x1, x1, #0xc25
 40ef124: 910003f4     	mov	x20, sp
 40ef128: 910003e8     	mov	x8, sp
 40ef12c: 52804902     	mov	w2, #0x248              ; =584
 40ef130: 96fd86d4     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40ef134: f9404748     	ldr	x8, [x26, #0x88]
 40ef138: eb08037f     	cmp	x27, x8
 40ef13c: 54000081     	b.ne	0x40ef14c <_ChromeMain+0x40e9eb0>
 40ef140: 91002260     	add	x0, x19, #0x8
 40ef144: 96fc946e     	bl	0x142fc <_ChromeMain+0xf060>
 40ef148: f9404748     	ldr	x8, [x26, #0x88]
 40ef14c: f90013f8     	str	x24, [sp, #0x20]
 40ef150: 925e7689     	and	x9, x20, #0xfffffffc00000000
 40ef154: eb08013f     	cmp	x9, x8
 40ef158: 54000061     	b.ne	0x40ef164 <_ChromeMain+0x40e9ec8>
 40ef15c: 910003e0     	mov	x0, sp
 40ef160: 96fc9467     	bl	0x142fc <_ChromeMain+0xf060>
 40ef164: 910003e8     	mov	x8, sp
 40ef168: 10010269     	adr	x9, 0x40f11b4 <_ChromeMain+0x40ebf18>
 40ef16c: d503201f     	nop
 40ef170: a902a7e8     	stp	x8, x9, [sp, #0x28]
 40ef174: f9001fff     	str	xzr, [sp, #0x38]
 40ef178: f9415a74     	ldr	x20, [x19, #0x2b0]
 40ef17c: b40000d4     	cbz	x20, 0x40ef194 <_ChromeMain+0x40e9ef8>
 40ef180: 52800028     	mov	w8, #0x1                ; =1
 40ef184: b8280288     	ldadd	w8, w8, [x20]
 40ef188: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40ef18c: 6b09011f     	cmp	w8, w9
 40ef190: 54001ea0     	b.eq	0x40ef564 <_ChromeMain+0x40ea2c8>
 40ef194: f9415e75     	ldr	x21, [x19, #0x2b8]
 40ef198: 52800800     	mov	w0, #0x40               ; =64
 40ef19c: 96fc8073     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef1a0: aa0003e1     	mov	x1, x0
 40ef1a4: 52800028     	mov	w8, #0x1                ; =1
 40ef1a8: 1001ea69     	adr	x9, 0x40f2ef4 <_ChromeMain+0x40edc58>
 40ef1ac: d503201f     	nop
 40ef1b0: b0fff3ea     	adrp	x10, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40ef1b4: 912b014a     	add	x10, x10, #0xac0
 40ef1b8: b9000008     	str	w8, [x0]
 40ef1bc: 10dfa828     	adr	x8, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40ef1c0: d503201f     	nop
 40ef1c4: 100126cb     	adr	x11, 0x40f169c <_ChromeMain+0x40ec400>
 40ef1c8: d503201f     	nop
 40ef1cc: a900a809     	stp	x9, x10, [x0, #0x8]
 40ef1d0: a901ac08     	stp	x8, x11, [x0, #0x18]
 40ef1d4: a902d01f     	stp	xzr, x20, [x0, #0x28]
 40ef1d8: f9001c15     	str	x21, [x0, #0x38]
 40ef1dc: 910083e0     	add	x0, sp, #0x20
 40ef1e0: 940008ca     	bl	0x40f1508 <_ChromeMain+0x40ec26c>
 40ef1e4: f94013e8     	ldr	x8, [sp, #0x20]
 40ef1e8: b5001b88     	cbnz	x8, 0x40ef558 <_ChromeMain+0x40ea2bc>
 40ef1ec: f94017e0     	ldr	x0, [sp, #0x28]
 40ef1f0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 40ef1f4: f9404749     	ldr	x9, [x26, #0x88]
 40ef1f8: eb09011f     	cmp	x8, x9
 40ef1fc: 54000041     	b.ne	0x40ef204 <_ChromeMain+0x40e9f68>
 40ef200: 96fcce0f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ef204: f9468ec8     	ldr	x8, [x22, #0xd18]
 40ef208: d63f0100     	blr	x8
 40ef20c: 91054268     	add	x8, x19, #0x150
 40ef210: 39456269     	ldrb	w9, [x19, #0x158]
 40ef214: 350000c9     	cbnz	w9, 0x40ef22c <_ChromeMain+0x40e9f90>
 40ef218: b4001808     	cbz	x8, 0x40ef518 <_ChromeMain+0x40ea27c>
 40ef21c: f900aa60     	str	x0, [x19, #0x150]
 40ef220: 52800028     	mov	w8, #0x1                ; =1
 40ef224: 39056268     	strb	w8, [x19, #0x158]
 40ef228: 14000002     	b	0x40ef230 <_ChromeMain+0x40e9f94>
 40ef22c: f9000100     	str	x0, [x8]
 40ef230: d004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40ef234: 91324c00     	add	x0, x0, #0xc93
 40ef238: d004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40ef23c: 91309421     	add	x1, x1, #0xc25
 40ef240: 910083f5     	add	x21, sp, #0x20
 40ef244: 910083e8     	add	x8, sp, #0x20
 40ef248: 528049a2     	mov	w2, #0x24d              ; =589
 40ef24c: 96fd868d     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40ef250: f9404754     	ldr	x20, [x26, #0x88]
 40ef254: eb14037f     	cmp	x27, x20
 40ef258: 54000081     	b.ne	0x40ef268 <_ChromeMain+0x40e9fcc>
 40ef25c: 91002260     	add	x0, x19, #0x8
 40ef260: 96fc9427     	bl	0x142fc <_ChromeMain+0xf060>
 40ef264: f9404754     	ldr	x20, [x26, #0x88]
 40ef268: 925e76b7     	and	x23, x21, #0xfffffffc00000000
 40ef26c: eb1402ff     	cmp	x23, x20
 40ef270: 54000081     	b.ne	0x40ef280 <_ChromeMain+0x40e9fe4>
 40ef274: 910083e0     	add	x0, sp, #0x20
 40ef278: 96fc9421     	bl	0x142fc <_ChromeMain+0xf060>
 40ef27c: f9404754     	ldr	x20, [x26, #0x88]
 40ef280: eb14037f     	cmp	x27, x20
 40ef284: 54000081     	b.ne	0x40ef294 <_ChromeMain+0x40e9ff8>
 40ef288: 91002260     	add	x0, x19, #0x8
 40ef28c: 96fccdec     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ef290: f9404754     	ldr	x20, [x26, #0x88]
 40ef294: f9400316     	ldr	x22, [x24]
 40ef298: 925e76d5     	and	x21, x22, #0xfffffffc00000000
 40ef29c: eb1402bf     	cmp	x21, x20
 40ef2a0: 54000081     	b.ne	0x40ef2b0 <_ChromeMain+0x40ea014>
 40ef2a4: aa1603e0     	mov	x0, x22
 40ef2a8: 96fc9415     	bl	0x142fc <_ChromeMain+0xf060>
 40ef2ac: f9404754     	ldr	x20, [x26, #0x88]
 40ef2b0: eb1402bf     	cmp	x21, x20
 40ef2b4: 54000081     	b.ne	0x40ef2c4 <_ChromeMain+0x40ea028>
 40ef2b8: aa1603e0     	mov	x0, x22
 40ef2bc: 96fc9410     	bl	0x142fc <_ChromeMain+0xf060>
 40ef2c0: f9404754     	ldr	x20, [x26, #0x88]
 40ef2c4: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 40ef2c8: eb14011f     	cmp	x8, x20
 40ef2cc: 54000081     	b.ne	0x40ef2dc <_ChromeMain+0x40ea040>
 40ef2d0: aa1603e0     	mov	x0, x22
 40ef2d4: 96fccdda     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ef2d8: f9404754     	ldr	x20, [x26, #0x88]
 40ef2dc: 52800800     	mov	w0, #0x40               ; =64
 40ef2e0: 96fc8022     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef2e4: aa0003f5     	mov	x21, x0
 40ef2e8: 52800028     	mov	w8, #0x1                ; =1
 40ef2ec: f0fff409     	adrp	x9, 0x3f72000 <_ChromeMain+0x3f6cd64>
 40ef2f0: 912c8129     	add	x9, x9, #0xb20
 40ef2f4: d0ffbd4a     	adrp	x10, 0x3899000 <_ChromeMain+0x3893d64>
 40ef2f8: 9104014a     	add	x10, x10, #0x100
 40ef2fc: b9000008     	str	w8, [x0]
 40ef300: a900a809     	stp	x9, x10, [x0, #0x8]
 40ef304: 1000f4c8     	adr	x8, 0x40f119c <_ChromeMain+0x40ebf00>
 40ef308: d503201f     	nop
 40ef30c: d0ff2369     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 40ef310: 912c0129     	add	x9, x9, #0xb00
 40ef314: a901a009     	stp	x9, x8, [x0, #0x18]
 40ef318: a902d81f     	stp	xzr, x22, [x0, #0x28]
 40ef31c: 52800068     	mov	w8, #0x3                ; =3
 40ef320: 3900e008     	strb	w8, [x0, #0x38]
 40ef324: eb14037f     	cmp	x27, x20
 40ef328: 54000081     	b.ne	0x40ef338 <_ChromeMain+0x40ea09c>
 40ef32c: 91002260     	add	x0, x19, #0x8
 40ef330: 96fc93f3     	bl	0x142fc <_ChromeMain+0xf060>
 40ef334: f9404754     	ldr	x20, [x26, #0x88]
 40ef338: eb1402ff     	cmp	x23, x20
 40ef33c: 54000061     	b.ne	0x40ef348 <_ChromeMain+0x40ea0ac>
 40ef340: 910083e0     	add	x0, sp, #0x20
 40ef344: 96fc93ee     	bl	0x142fc <_ChromeMain+0xf060>
 40ef348: f9415a74     	ldr	x20, [x19, #0x2b0]
 40ef34c: b40000d4     	cbz	x20, 0x40ef364 <_ChromeMain+0x40ea0c8>
 40ef350: 52800028     	mov	w8, #0x1                ; =1
 40ef354: b8280288     	ldadd	w8, w8, [x20]
 40ef358: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40ef35c: 6b09011f     	cmp	w8, w9
 40ef360: 54001080     	b.eq	0x40ef570 <_ChromeMain+0x40ea2d4>
 40ef364: f9415e76     	ldr	x22, [x19, #0x2b8]
 40ef368: 52800800     	mov	w0, #0x40               ; =64
 40ef36c: 96fc7fff     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef370: aa0003e3     	mov	x3, x0
 40ef374: 52800028     	mov	w8, #0x1                ; =1
 40ef378: b9000008     	str	w8, [x0]
 40ef37c: d0ff4448     	adrp	x8, 0x2979000 <_ChromeMain+0x2973d64>
 40ef380: 91340108     	add	x8, x8, #0xd00
 40ef384: b0fff3e9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40ef388: 912b0129     	add	x9, x9, #0xac0
 40ef38c: a900a408     	stp	x8, x9, [x0, #0x8]
 40ef390: 10df9988     	adr	x8, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40ef394: d503201f     	nop
 40ef398: 10017ea9     	adr	x9, 0x40f236c <_ChromeMain+0x40ed0d0>
 40ef39c: d503201f     	nop
 40ef3a0: a901a408     	stp	x8, x9, [x0, #0x18]
 40ef3a4: a902d01f     	stp	xzr, x20, [x0, #0x28]
 40ef3a8: f9001c16     	str	x22, [x0, #0x38]
 40ef3ac: f9400e60     	ldr	x0, [x19, #0x18]
 40ef3b0: 910083e1     	add	x1, sp, #0x20
 40ef3b4: aa1503e2     	mov	x2, x21
 40ef3b8: 94001368     	bl	0x40f4158 <_ChromeMain+0x40eeebc>
 40ef3bc: f9404748     	ldr	x8, [x26, #0x88]
 40ef3c0: eb08037f     	cmp	x27, x8
 40ef3c4: 54000081     	b.ne	0x40ef3d4 <_ChromeMain+0x40ea138>
 40ef3c8: aa1803e0     	mov	x0, x24
 40ef3cc: 96fccd9c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ef3d0: f9404748     	ldr	x8, [x26, #0x88]
 40ef3d4: eb0802ff     	cmp	x23, x8
 40ef3d8: 54000901     	b.ne	0x40ef4f8 <_ChromeMain+0x40ea25c>
 40ef3dc: 910083e0     	add	x0, sp, #0x20
 40ef3e0: 96fccd97     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ef3e4: f9404748     	ldr	x8, [x26, #0x88]
 40ef3e8: eb0802ff     	cmp	x23, x8
 40ef3ec: 54000861     	b.ne	0x40ef4f8 <_ChromeMain+0x40ea25c>
 40ef3f0: 910083e0     	add	x0, sp, #0x20
 40ef3f4: 14000040     	b	0x40ef4f4 <_ChromeMain+0x40ea258>
 40ef3f8: f9000100     	str	x0, [x8]
 40ef3fc: 91002275     	add	x21, x19, #0x8
 40ef400: d004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40ef404: 91324c00     	add	x0, x0, #0xc93
 40ef408: d004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40ef40c: 91309421     	add	x1, x1, #0xc25
 40ef410: 910003f6     	mov	x22, sp
 40ef414: 910003e8     	mov	x8, sp
 40ef418: 52804682     	mov	w2, #0x234              ; =564
 40ef41c: 96fd8619     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40ef420: f0055614     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40ef424: f9404688     	ldr	x8, [x20, #0x88]
 40ef428: 925e76a9     	and	x9, x21, #0xfffffffc00000000
 40ef42c: eb08013f     	cmp	x9, x8
 40ef430: 54000081     	b.ne	0x40ef440 <_ChromeMain+0x40ea1a4>
 40ef434: 91002260     	add	x0, x19, #0x8
 40ef438: 96fc93b1     	bl	0x142fc <_ChromeMain+0xf060>
 40ef43c: f9404688     	ldr	x8, [x20, #0x88]
 40ef440: f90013f5     	str	x21, [sp, #0x20]
 40ef444: 925e76c9     	and	x9, x22, #0xfffffffc00000000
 40ef448: eb08013f     	cmp	x9, x8
 40ef44c: 54000061     	b.ne	0x40ef458 <_ChromeMain+0x40ea1bc>
 40ef450: 910003e0     	mov	x0, sp
 40ef454: 96fc93aa     	bl	0x142fc <_ChromeMain+0xf060>
 40ef458: 910003e8     	mov	x8, sp
 40ef45c: 1000eac9     	adr	x9, 0x40f11b4 <_ChromeMain+0x40ebf18>
 40ef460: d503201f     	nop
 40ef464: a902a7e8     	stp	x8, x9, [sp, #0x28]
 40ef468: f9001fff     	str	xzr, [sp, #0x38]
 40ef46c: f9415a75     	ldr	x21, [x19, #0x2b0]
 40ef470: b40000d5     	cbz	x21, 0x40ef488 <_ChromeMain+0x40ea1ec>
 40ef474: 52800028     	mov	w8, #0x1                ; =1
 40ef478: b82802a8     	ldadd	w8, w8, [x21]
 40ef47c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40ef480: 6b09011f     	cmp	w8, w9
 40ef484: 540005e0     	b.eq	0x40ef540 <_ChromeMain+0x40ea2a4>
 40ef488: f9415e73     	ldr	x19, [x19, #0x2b8]
 40ef48c: 52800800     	mov	w0, #0x40               ; =64
 40ef490: 96fc7fb6     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef494: aa0003e1     	mov	x1, x0
 40ef498: 52800028     	mov	w8, #0x1                ; =1
 40ef49c: 1001d2c9     	adr	x9, 0x40f2ef4 <_ChromeMain+0x40edc58>
 40ef4a0: d503201f     	nop
 40ef4a4: b0fff3ea     	adrp	x10, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40ef4a8: 912b014a     	add	x10, x10, #0xac0
 40ef4ac: b9000008     	str	w8, [x0]
 40ef4b0: 10df9088     	adr	x8, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40ef4b4: d503201f     	nop
 40ef4b8: 10010f2b     	adr	x11, 0x40f169c <_ChromeMain+0x40ec400>
 40ef4bc: d503201f     	nop
 40ef4c0: a900a809     	stp	x9, x10, [x0, #0x8]
 40ef4c4: a901ac08     	stp	x8, x11, [x0, #0x18]
 40ef4c8: a902d41f     	stp	xzr, x21, [x0, #0x28]
 40ef4cc: f9001c13     	str	x19, [x0, #0x38]
 40ef4d0: 910083e0     	add	x0, sp, #0x20
 40ef4d4: 9400080d     	bl	0x40f1508 <_ChromeMain+0x40ec26c>
 40ef4d8: f94013e8     	ldr	x8, [sp, #0x20]
 40ef4dc: b50002c8     	cbnz	x8, 0x40ef534 <_ChromeMain+0x40ea298>
 40ef4e0: f94017e0     	ldr	x0, [sp, #0x28]
 40ef4e4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 40ef4e8: f9404689     	ldr	x9, [x20, #0x88]
 40ef4ec: eb09011f     	cmp	x8, x9
 40ef4f0: 54000041     	b.ne	0x40ef4f8 <_ChromeMain+0x40ea25c>
 40ef4f4: 96fccd52     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40ef4f8: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 40ef4fc: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 40ef500: a94757f6     	ldp	x22, x21, [sp, #0x70]
 40ef504: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 40ef508: a94567fa     	ldp	x26, x25, [sp, #0x50]
 40ef50c: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 40ef510: 910283ff     	add	sp, sp, #0xa0
 40ef514: d65f03c0     	ret
 40ef518: d4200020     	brk	#0x1
 40ef51c: d4200000     	brk	#0
 40ef520: d4400000     	hlt	#0
 40ef524: 17fffffd     	b	0x40ef518 <_ChromeMain+0x40ea27c>
 40ef528: d4200000     	brk	#0
 40ef52c: d4400000     	hlt	#0
 40ef530: d4200020     	brk	#0x1
 40ef534: d4200000     	brk	#0
 40ef538: d4400000     	hlt	#0
 40ef53c: d4200020     	brk	#0x1
 40ef540: d4200000     	brk	#0
 40ef544: d4400000     	hlt	#0
 40ef548: d4200020     	brk	#0x1
 40ef54c: d4200000     	brk	#0
 40ef550: d4400000     	hlt	#0
 40ef554: d4200020     	brk	#0x1
 40ef558: d4200000     	brk	#0
 40ef55c: d4400000     	hlt	#0
 40ef560: d4200020     	brk	#0x1
 40ef564: d4200000     	brk	#0
 40ef568: d4400000     	hlt	#0
 40ef56c: d4200020     	brk	#0x1
 40ef570: d4200000     	brk	#0
 40ef574: d4400000     	hlt	#0
 40ef578: d4200020     	brk	#0x1
 40ef57c: d10303ff     	sub	sp, sp, #0xc0
 40ef580: a9066ffc     	stp	x28, x27, [sp, #0x60]
 40ef584: a90767fa     	stp	x26, x25, [sp, #0x70]
 40ef588: a9085ff8     	stp	x24, x23, [sp, #0x80]
 40ef58c: a90957f6     	stp	x22, x21, [sp, #0x90]
 40ef590: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 40ef594: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 40ef598: 9102c3fd     	add	x29, sp, #0xb0
 40ef59c: aa0003f4     	mov	x20, x0
 40ef5a0: 394a6008     	ldrb	w8, [x0, #0x298]
 40ef5a4: f9415813     	ldr	x19, [x0, #0x2b0]
 40ef5a8: 34000648     	cbz	w8, 0x40ef670 <_ChromeMain+0x40ea3d4>
 40ef5ac: b40000d3     	cbz	x19, 0x40ef5c4 <_ChromeMain+0x40ea328>
 40ef5b0: 52800028     	mov	w8, #0x1                ; =1
 40ef5b4: b8280268     	ldadd	w8, w8, [x19]
 40ef5b8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40ef5bc: 6b09011f     	cmp	w8, w9
 40ef5c0: 540081c0     	b.eq	0x40f05f8 <_ChromeMain+0x40eb35c>
 40ef5c4: f9415e95     	ldr	x21, [x20, #0x2b8]
 40ef5c8: 52800800     	mov	w0, #0x40               ; =64
 40ef5cc: 96fc7f67     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef5d0: aa0003e1     	mov	x1, x0
 40ef5d4: 52800028     	mov	w8, #0x1                ; =1
 40ef5d8: f0fff3f6     	adrp	x22, 0x3f6e000 <_ChromeMain+0x3f68d64>
 40ef5dc: 912302d6     	add	x22, x22, #0x8c0
 40ef5e0: b0fff3f7     	adrp	x23, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40ef5e4: 912b02f7     	add	x23, x23, #0xac0
 40ef5e8: b9000008     	str	w8, [x0]
 40ef5ec: 10df86b8     	adr	x24, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40ef5f0: d503201f     	nop
 40ef5f4: 10008f88     	adr	x8, 0x40f07e4 <_ChromeMain+0x40eb548>
 40ef5f8: d503201f     	nop
 40ef5fc: a900dc16     	stp	x22, x23, [x0, #0x8]
 40ef600: a901a018     	stp	x24, x8, [x0, #0x18]
 40ef604: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 40ef608: f9001c15     	str	x21, [x0, #0x38]
 40ef60c: 52800020     	mov	w0, #0x1                ; =1
 40ef610: 97737a3a     	bl	0x1dcdef8 <_ChromeMain+0x1dc8c5c>
 40ef614: aa0003f3     	mov	x19, x0
 40ef618: d0055615     	adrp	x21, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40ef61c: f9468ea8     	ldr	x8, [x21, #0xd18]
 40ef620: d63f0100     	blr	x8
 40ef624: 91042288     	add	x8, x20, #0x108
 40ef628: 39444289     	ldrb	w9, [x20, #0x110]
 40ef62c: 350000c9     	cbnz	w9, 0x40ef644 <_ChromeMain+0x40ea3a8>
 40ef630: b4006da8     	cbz	x8, 0x40f03e4 <_ChromeMain+0x40eb148>
 40ef634: f9008680     	str	x0, [x20, #0x108]
 40ef638: 52800028     	mov	w8, #0x1                ; =1
 40ef63c: 39044288     	strb	w8, [x20, #0x110]
 40ef640: 14000002     	b	0x40ef648 <_ChromeMain+0x40ea3ac>
 40ef644: f9000100     	str	x0, [x8]
 40ef648: f9468ea8     	ldr	x8, [x21, #0xd18]
 40ef64c: d63f0100     	blr	x8
 40ef650: 9109a288     	add	x8, x20, #0x268
 40ef654: 3949c289     	ldrb	w9, [x20, #0x270]
 40ef658: 35005ee9     	cbnz	w9, 0x40f0234 <_ChromeMain+0x40eaf98>
 40ef65c: b4006c48     	cbz	x8, 0x40f03e4 <_ChromeMain+0x40eb148>
 40ef660: f9013680     	str	x0, [x20, #0x268]
 40ef664: 52800028     	mov	w8, #0x1                ; =1
 40ef668: 3909c288     	strb	w8, [x20, #0x270]
 40ef66c: 140002f3     	b	0x40f0238 <_ChromeMain+0x40eaf9c>
 40ef670: f90007e1     	str	x1, [sp, #0x8]
 40ef674: b40000d3     	cbz	x19, 0x40ef68c <_ChromeMain+0x40ea3f0>
 40ef678: 52800028     	mov	w8, #0x1                ; =1
 40ef67c: b8280268     	ldadd	w8, w8, [x19]
 40ef680: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40ef684: 6b09011f     	cmp	w8, w9
 40ef688: 54007c40     	b.eq	0x40f0610 <_ChromeMain+0x40eb374>
 40ef68c: f9415e95     	ldr	x21, [x20, #0x2b8]
 40ef690: 52800800     	mov	w0, #0x40               ; =64
 40ef694: 96fc7f35     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef698: aa0003e1     	mov	x1, x0
 40ef69c: 52800028     	mov	w8, #0x1                ; =1
 40ef6a0: f0fff3fb     	adrp	x27, 0x3f6e000 <_ChromeMain+0x3f68d64>
 40ef6a4: 9123037b     	add	x27, x27, #0x8c0
 40ef6a8: b0fff3fc     	adrp	x28, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40ef6ac: 912b039c     	add	x28, x28, #0xac0
 40ef6b0: b9000008     	str	w8, [x0]
 40ef6b4: 10df8069     	adr	x9, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40ef6b8: d503201f     	nop
 40ef6bc: 10008948     	adr	x8, 0x40f07e4 <_ChromeMain+0x40eb548>
 40ef6c0: d503201f     	nop
 40ef6c4: a900f01b     	stp	x27, x28, [x0, #0x8]
 40ef6c8: a901a009     	stp	x9, x8, [x0, #0x18]
 40ef6cc: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 40ef6d0: f9001c15     	str	x21, [x0, #0x38]
 40ef6d4: 52800080     	mov	w0, #0x4                ; =4
 40ef6d8: 97737a08     	bl	0x1dcdef8 <_ChromeMain+0x1dc8c5c>
 40ef6dc: aa0003f3     	mov	x19, x0
 40ef6e0: f9402e97     	ldr	x23, [x20, #0x58]
 40ef6e4: f0049c01     	adrp	x1, 0xd472000 <dyld_stub_binder+0xd472000>
 40ef6e8: 91369c21     	add	x1, x1, #0xda7
 40ef6ec: aa1703e0     	mov	x0, x23
 40ef6f0: 528002e2     	mov	w2, #0x17               ; =23
 40ef6f4: 970f3556     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 40ef6f8: b4000580     	cbz	x0, 0x40ef7a8 <_ChromeMain+0x40ea50c>
 40ef6fc: aa0003e8     	mov	x8, x0
 40ef700: f9401009     	ldr	x9, [x0, #0x20]
 40ef704: b4007809     	cbz	x9, 0x40f0604 <_ChromeMain+0x40eb368>
 40ef708: f9400929     	ldr	x9, [x9, #0x10]
 40ef70c: f9000bff     	str	xzr, [sp, #0x10]
 40ef710: f9401520     	ldr	x0, [x9, #0x28]
 40ef714: b40004a0     	cbz	x0, 0x40ef7a8 <_ChromeMain+0x40ea50c>
 40ef718: 39805d09     	ldrsb	x9, [x8, #0x17]
 40ef71c: a9402d0a     	ldp	x10, x11, [x8]
 40ef720: f100013f     	cmp	x9, #0x0
 40ef724: 9a884158     	csel	x24, x10, x8, mi
 40ef728: 7100013f     	cmp	w9, #0x0
 40ef72c: 9a894179     	csel	x25, x11, x9, mi
 40ef730: f9400008     	ldr	x8, [x0]
 40ef734: f9401108     	ldr	x8, [x8, #0x20]
 40ef738: b0fdfda9     	adrp	x9, 0xa4000 <_ChromeMain+0x9ed64>
 40ef73c: 91177129     	add	x9, x9, #0x5dc
 40ef740: eb09011f     	cmp	x8, x9
 40ef744: 54007161     	b.ne	0x40f0570 <_ChromeMain+0x40eb2d4>
 40ef748: f9402415     	ldr	x21, [x0, #0x48]
 40ef74c: b40002f5     	cbz	x21, 0x40ef7a8 <_ChromeMain+0x40ea50c>
 40ef750: f8410eb6     	ldr	x22, [x21, #0x10]!
 40ef754: b40002b6     	cbz	x22, 0x40ef7a8 <_ChromeMain+0x40ea50c>
 40ef758: 14000004     	b	0x40ef768 <_ChromeMain+0x40ea4cc>
 40ef75c: 54000223     	b.lo	0x40ef7a0 <_ChromeMain+0x40ea504>
 40ef760: f94006d6     	ldr	x22, [x22, #0x8]
 40ef764: b4000236     	cbz	x22, 0x40ef7a8 <_ChromeMain+0x40ea50c>
 40ef768: aa1603e8     	mov	x8, x22
 40ef76c: f8420d09     	ldr	x9, [x8, #0x20]!
 40ef770: 39805d0a     	ldrsb	x10, [x8, #0x17]
 40ef774: f100015f     	cmp	x10, #0x0
 40ef778: 9a884121     	csel	x1, x9, x8, mi
 40ef77c: f9400508     	ldr	x8, [x8, #0x8]
 40ef780: 7100015f     	cmp	w10, #0x0
 40ef784: 9a8a411a     	csel	x26, x8, x10, mi
 40ef788: eb19035f     	cmp	x26, x25
 40ef78c: 9a993342     	csel	x2, x26, x25, lo
 40ef790: aa1803e0     	mov	x0, x24
 40ef794: 94fc6833     	bl	0x8009860 <_ChromeMain+0x80045c4>
 40ef798: 340066c0     	cbz	w0, 0x40f0470 <_ChromeMain+0x40eb1d4>
 40ef79c: 36fffe20     	tbz	w0, #0x1f, 0x40ef760 <_ChromeMain+0x40ea4c4>
 40ef7a0: f94002d6     	ldr	x22, [x22]
 40ef7a4: b5fffe36     	cbnz	x22, 0x40ef768 <_ChromeMain+0x40ea4cc>
 40ef7a8: f901529f     	str	xzr, [x20, #0x2a0]
 40ef7ac: 900560a0     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 40ef7b0: 9135a000     	add	x0, x0, #0xd68
 40ef7b4: f9400008     	ldr	x8, [x0]
 40ef7b8: d63f0100     	blr	x8
 40ef7bc: f9400008     	ldr	x8, [x0]
 40ef7c0: b40070a8     	cbz	x8, 0x40f05d4 <_ChromeMain+0x40eb338>
 40ef7c4: f9400115     	ldr	x21, [x8]
 40ef7c8: b4007075     	cbz	x21, 0x40f05d4 <_ChromeMain+0x40eb338>
 40ef7cc: 910022a8     	add	x8, x21, #0x8
 40ef7d0: 52800029     	mov	w9, #0x1                ; =1
 40ef7d4: b8290108     	ldadd	w9, w8, [x8]
 40ef7d8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40ef7dc: 6b09011f     	cmp	w8, w9
 40ef7e0: 540075a0     	b.eq	0x40f0694 <_ChromeMain+0x40eb3f8>
 40ef7e4: aa0003f9     	mov	x25, x0
 40ef7e8: f9415a98     	ldr	x24, [x20, #0x2b0]
 40ef7ec: b40000b8     	cbz	x24, 0x40ef800 <_ChromeMain+0x40ea564>
 40ef7f0: 52800028     	mov	w8, #0x1                ; =1
 40ef7f4: b8280308     	ldadd	w8, w8, [x24]
 40ef7f8: 6b09011f     	cmp	w8, w9
 40ef7fc: 54007700     	b.eq	0x40f06dc <_ChromeMain+0x40eb440>
 40ef800: f9415e9a     	ldr	x26, [x20, #0x2b8]
 40ef804: 52800800     	mov	w0, #0x40               ; =64
 40ef808: 96fc7ed8     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef80c: aa0003f7     	mov	x23, x0
 40ef810: 52800036     	mov	w22, #0x1               ; =1
 40ef814: 100191c8     	adr	x8, 0x40f2a4c <_ChromeMain+0x40ed7b0>
 40ef818: d503201f     	nop
 40ef81c: b0fff3e9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40ef820: 912b0129     	add	x9, x9, #0xac0
 40ef824: b9000016     	str	w22, [x0]
 40ef828: 10df74ca     	adr	x10, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40ef82c: d503201f     	nop
 40ef830: d001b2eb     	adrp	x11, 0x774d000 <_ChromeMain+0x7747d64>
 40ef834: 9138c16b     	add	x11, x11, #0xe30
 40ef838: a900a408     	stp	x8, x9, [x0, #0x8]
 40ef83c: a901ac0a     	stp	x10, x11, [x0, #0x18]
 40ef840: a902e01f     	stp	xzr, x24, [x0, #0x28]
 40ef844: f9001c1a     	str	x26, [x0, #0x38]
 40ef848: d004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40ef84c: 9131dc00     	add	x0, x0, #0xc77
 40ef850: d004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40ef854: 91309421     	add	x1, x1, #0xc25
 40ef858: 910043e8     	add	x8, sp, #0x10
 40ef85c: 52802ca2     	mov	w2, #0x165              ; =357
 40ef860: 96fd8508     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40ef864: 52800600     	mov	w0, #0x30               ; =48
 40ef868: 96fc7ec0     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef86c: f9000015     	str	x21, [x0]
 40ef870: 3dc007e0     	ldr	q0, [sp, #0x10]
 40ef874: 3c808000     	stur	q0, [x0, #0x8]
 40ef878: b94023e8     	ldr	w8, [sp, #0x20]
 40ef87c: b9001808     	str	w8, [x0, #0x18]
 40ef880: f94017e8     	ldr	x8, [sp, #0x28]
 40ef884: a9025c08     	stp	x8, x23, [x0, #0x20]
 40ef888: b40070d7     	cbz	x23, 0x40f06a0 <_ChromeMain+0x40eb404>
 40ef88c: aa0003f8     	mov	x24, x0
 40ef890: 52800700     	mov	w0, #0x38               ; =56
 40ef894: 96fc7eb5     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef898: 1001fb68     	adr	x8, 0x40f3804 <_ChromeMain+0x40ee568>
 40ef89c: d503201f     	nop
 40ef8a0: b9000016     	str	w22, [x0]
 40ef8a4: 1001fe49     	adr	x9, 0x40f386c <_ChromeMain+0x40ee5d0>
 40ef8a8: d503201f     	nop
 40ef8ac: 1001f36a     	adr	x10, 0x40f3718 <_ChromeMain+0x40ee47c>
 40ef8b0: d503201f     	nop
 40ef8b4: a900a408     	stp	x8, x9, [x0, #0x8]
 40ef8b8: d0ff2368     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 40ef8bc: 912c0108     	add	x8, x8, #0xb00
 40ef8c0: a901a808     	stp	x8, x10, [x0, #0x18]
 40ef8c4: a902e01f     	stp	xzr, x24, [x0, #0x28]
 40ef8c8: f9400328     	ldr	x8, [x25]
 40ef8cc: b40068a8     	cbz	x8, 0x40f05e0 <_ChromeMain+0x40eb344>
 40ef8d0: f9400115     	ldr	x21, [x8]
 40ef8d4: b4006875     	cbz	x21, 0x40f05e0 <_ChromeMain+0x40eb344>
 40ef8d8: 910022a8     	add	x8, x21, #0x8
 40ef8dc: 52800029     	mov	w9, #0x1                ; =1
 40ef8e0: b8290108     	ldadd	w9, w8, [x8]
 40ef8e4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40ef8e8: 6b09011f     	cmp	w8, w9
 40ef8ec: 54006e00     	b.eq	0x40f06ac <_ChromeMain+0x40eb410>
 40ef8f0: aa0003f7     	mov	x23, x0
 40ef8f4: f9415a96     	ldr	x22, [x20, #0x2b0]
 40ef8f8: b40000b6     	cbz	x22, 0x40ef90c <_ChromeMain+0x40ea670>
 40ef8fc: 52800028     	mov	w8, #0x1                ; =1
 40ef900: b82802c8     	ldadd	w8, w8, [x22]
 40ef904: 6b09011f     	cmp	w8, w9
 40ef908: 54006f00     	b.eq	0x40f06e8 <_ChromeMain+0x40eb44c>
 40ef90c: f9415e98     	ldr	x24, [x20, #0x2b8]
 40ef910: 52800800     	mov	w0, #0x40               ; =64
 40ef914: 96fc7e95     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef918: 52800028     	mov	w8, #0x1                ; =1
 40ef91c: b9000008     	str	w8, [x0]
 40ef920: a900f01b     	stp	x27, x28, [x0, #0x8]
 40ef924: 10008c29     	adr	x9, 0x40f0aa8 <_ChromeMain+0x40eb80c>
 40ef928: d503201f     	nop
 40ef92c: 10df6caa     	adr	x10, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40ef930: d503201f     	nop
 40ef934: a901a40a     	stp	x10, x9, [x0, #0x18]
 40ef938: a902d81f     	stp	xzr, x22, [x0, #0x28]
 40ef93c: f9001c18     	str	x24, [x0, #0x38]
 40ef940: f9002fe0     	str	x0, [sp, #0x58]
 40ef944: b5005733     	cbnz	x19, 0x40f0428 <_ChromeMain+0x40eb18c>
 40ef948: 910163e0     	add	x0, sp, #0x58
 40ef94c: aa1303e1     	mov	x1, x19
 40ef950: 948e9f6d     	bl	0x6497704 <_ChromeMain+0x6492468>
 40ef954: aa0003f8     	mov	x24, x0
 40ef958: d004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40ef95c: 9131dc00     	add	x0, x0, #0xc77
 40ef960: d004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40ef964: 91309421     	add	x1, x1, #0xc25
 40ef968: 910043e8     	add	x8, sp, #0x10
 40ef96c: 52802d42     	mov	w2, #0x16a              ; =362
 40ef970: 96fd84c4     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40ef974: 52800600     	mov	w0, #0x30               ; =48
 40ef978: 96fc7e7c     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef97c: f9000015     	str	x21, [x0]
 40ef980: 3dc007e0     	ldr	q0, [sp, #0x10]
 40ef984: 3c808000     	stur	q0, [x0, #0x8]
 40ef988: b94023e8     	ldr	w8, [sp, #0x20]
 40ef98c: b9001808     	str	w8, [x0, #0x18]
 40ef990: f94017e8     	ldr	x8, [sp, #0x28]
 40ef994: a9026008     	stp	x8, x24, [x0, #0x20]
 40ef998: b4006918     	cbz	x24, 0x40f06b8 <_ChromeMain+0x40eb41c>
 40ef99c: aa0003fa     	mov	x26, x0
 40ef9a0: 52800700     	mov	w0, #0x38               ; =56
 40ef9a4: 96fc7e71     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ef9a8: aa0003f8     	mov	x24, x0
 40ef9ac: 52800028     	mov	w8, #0x1                ; =1
 40ef9b0: 90fea295     	adrp	x21, 0x153f000 <_ChromeMain+0x1539d64>
 40ef9b4: 912702b5     	add	x21, x21, #0x9c0
 40ef9b8: b9000008     	str	w8, [x0]
 40ef9bc: d0fe7cb6     	adrp	x22, 0x1085000 <_ChromeMain+0x107fd64>
 40ef9c0: 912102d6     	add	x22, x22, #0x840
 40ef9c4: b0fea29b     	adrp	x27, 0x1540000 <_ChromeMain+0x153ad64>
 40ef9c8: 9131037b     	add	x27, x27, #0xc40
 40ef9cc: a900d815     	stp	x21, x22, [x0, #0x8]
 40ef9d0: d0ff2368     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 40ef9d4: 912c0108     	add	x8, x8, #0xb00
 40ef9d8: a901ec08     	stp	x8, x27, [x0, #0x18]
 40ef9dc: a902e81f     	stp	xzr, x26, [x0, #0x28]
 40ef9e0: f9402fe0     	ldr	x0, [sp, #0x58]
 40ef9e4: b50058e0     	cbnz	x0, 0x40f0500 <_ChromeMain+0x40eb264>
 40ef9e8: f9400328     	ldr	x8, [x25]
 40ef9ec: b4006008     	cbz	x8, 0x40f05ec <_ChromeMain+0x40eb350>
 40ef9f0: f940011c     	ldr	x28, [x8]
 40ef9f4: b4005fdc     	cbz	x28, 0x40f05ec <_ChromeMain+0x40eb350>
 40ef9f8: 91002388     	add	x8, x28, #0x8
 40ef9fc: 52800029     	mov	w9, #0x1                ; =1
 40efa00: b8290108     	ldadd	w9, w8, [x8]
 40efa04: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40efa08: 6b09011f     	cmp	w8, w9
 40efa0c: 540065c0     	b.eq	0x40f06c4 <_ChromeMain+0x40eb428>
 40efa10: f9415a99     	ldr	x25, [x20, #0x2b0]
 40efa14: b40000b9     	cbz	x25, 0x40efa28 <_ChromeMain+0x40ea78c>
 40efa18: 52800028     	mov	w8, #0x1                ; =1
 40efa1c: b8280328     	ldadd	w8, w8, [x25]
 40efa20: 6b09011f     	cmp	w8, w9
 40efa24: 54006680     	b.eq	0x40f06f4 <_ChromeMain+0x40eb458>
 40efa28: f9415e9a     	ldr	x26, [x20, #0x2b8]
 40efa2c: 52800800     	mov	w0, #0x40               ; =64
 40efa30: 96fc7e4e     	bl	0xf368 <_ChromeMain+0xa0cc>
 40efa34: 52800028     	mov	w8, #0x1                ; =1
 40efa38: b9000008     	str	w8, [x0]
 40efa3c: f0fff3e9     	adrp	x9, 0x3f6e000 <_ChromeMain+0x3f68d64>
 40efa40: 9123012a     	add	x10, x9, #0x8c0
 40efa44: b0fff3e9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40efa48: 912b0129     	add	x9, x9, #0xac0
 40efa4c: a900a40a     	stp	x10, x9, [x0, #0x8]
 40efa50: 10008569     	adr	x9, 0x40f0afc <_ChromeMain+0x40eb860>
 40efa54: d503201f     	nop
 40efa58: 10df634a     	adr	x10, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40efa5c: d503201f     	nop
 40efa60: a901a40a     	stp	x10, x9, [x0, #0x18]
 40efa64: a902e41f     	stp	xzr, x25, [x0, #0x28]
 40efa68: f9001c1a     	str	x26, [x0, #0x38]
 40efa6c: f9002fe0     	str	x0, [sp, #0x58]
 40efa70: b5004ef3     	cbnz	x19, 0x40f044c <_ChromeMain+0x40eb1b0>
 40efa74: 910163e0     	add	x0, sp, #0x58
 40efa78: aa1303e1     	mov	x1, x19
 40efa7c: 948e9f22     	bl	0x6497704 <_ChromeMain+0x6492468>
 40efa80: aa0003fa     	mov	x26, x0
 40efa84: d004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40efa88: 9131dc00     	add	x0, x0, #0xc77
 40efa8c: d004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40efa90: 91309421     	add	x1, x1, #0xc25
 40efa94: 910043e8     	add	x8, sp, #0x10
 40efa98: 52802e02     	mov	w2, #0x170              ; =368
 40efa9c: 96fd8479     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40efaa0: 52800600     	mov	w0, #0x30               ; =48
 40efaa4: 96fc7e31     	bl	0xf368 <_ChromeMain+0xa0cc>
 40efaa8: f900001c     	str	x28, [x0]
 40efaac: 3dc007e0     	ldr	q0, [sp, #0x10]
 40efab0: 3c808000     	stur	q0, [x0, #0x8]
 40efab4: b94023e8     	ldr	w8, [sp, #0x20]
 40efab8: b9001808     	str	w8, [x0, #0x18]
 40efabc: f94017e8     	ldr	x8, [sp, #0x28]
 40efac0: a9026808     	stp	x8, x26, [x0, #0x20]
 40efac4: b400607a     	cbz	x26, 0x40f06d0 <_ChromeMain+0x40eb434>
 40efac8: aa0003f9     	mov	x25, x0
 40efacc: 52800700     	mov	w0, #0x38               ; =56
 40efad0: 96fc7e26     	bl	0xf368 <_ChromeMain+0xa0cc>
 40efad4: aa0003fa     	mov	x26, x0
 40efad8: 52800028     	mov	w8, #0x1                ; =1
 40efadc: b9000008     	str	w8, [x0]
 40efae0: a900d815     	stp	x21, x22, [x0, #0x8]
 40efae4: d0ff2368     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 40efae8: 912c0108     	add	x8, x8, #0xb00
 40efaec: a901ec08     	stp	x8, x27, [x0, #0x18]
 40efaf0: a902e41f     	stp	xzr, x25, [x0, #0x28]
 40efaf4: f9402fe0     	ldr	x0, [sp, #0x58]
 40efaf8: b5005120     	cbnz	x0, 0x40f051c <_ChromeMain+0x40eb280>
 40efafc: d0055608     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40efb00: f9468d08     	ldr	x8, [x8, #0xd18]
 40efb04: d63f0100     	blr	x8
 40efb08: 91058288     	add	x8, x20, #0x160
 40efb0c: 3945a289     	ldrb	w9, [x20, #0x168]
 40efb10: 350000c9     	cbnz	w9, 0x40efb28 <_ChromeMain+0x40ea88c>
 40efb14: b4004688     	cbz	x8, 0x40f03e4 <_ChromeMain+0x40eb148>
 40efb18: f900b280     	str	x0, [x20, #0x160]
 40efb1c: 52800028     	mov	w8, #0x1                ; =1
 40efb20: 3905a288     	strb	w8, [x20, #0x168]
 40efb24: 14000002     	b	0x40efb2c <_ChromeMain+0x40ea890>
 40efb28: f9000100     	str	x0, [x8]
 40efb2c: 91002296     	add	x22, x20, #0x8
 40efb30: d004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40efb34: 9131dc00     	add	x0, x0, #0xc77
 40efb38: d004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40efb3c: 91309421     	add	x1, x1, #0xc25
 40efb40: 910043f5     	add	x21, sp, #0x10
 40efb44: 910043e8     	add	x8, sp, #0x10
 40efb48: 52802ec2     	mov	w2, #0x176              ; =374
 40efb4c: 96fd844d     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40efb50: f005561b     	adrp	x27, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40efb54: f9404768     	ldr	x8, [x27, #0x88]
 40efb58: 925e76dc     	and	x28, x22, #0xfffffffc00000000
 40efb5c: eb08039f     	cmp	x28, x8
 40efb60: 54000081     	b.ne	0x40efb70 <_ChromeMain+0x40ea8d4>
 40efb64: 91002280     	add	x0, x20, #0x8
 40efb68: 96fc91e5     	bl	0x142fc <_ChromeMain+0xf060>
 40efb6c: f9404768     	ldr	x8, [x27, #0x88]
 40efb70: 925e76b5     	and	x21, x21, #0xfffffffc00000000
 40efb74: eb0802bf     	cmp	x21, x8
 40efb78: 54000061     	b.ne	0x40efb84 <_ChromeMain+0x40ea8e8>
 40efb7c: 910043e0     	add	x0, sp, #0x10
 40efb80: 96fc91df     	bl	0x142fc <_ChromeMain+0xf060>
 40efb84: 52800400     	mov	w0, #0x20               ; =32
 40efb88: 96fc7df8     	bl	0xf368 <_ChromeMain+0xa0cc>
 40efb8c: aa0003f9     	mov	x25, x0
 40efb90: d0050588     	adrp	x8, 0xe1a1000 <dyld_stub_binder+0xe1a1000>
 40efb94: 9110c108     	add	x8, x8, #0x430
 40efb98: a9005c08     	stp	x8, x23, [x0]
 40efb9c: b5004277     	cbnz	x23, 0x40f03e8 <_ChromeMain+0x40eb14c>
 40efba0: a9016b38     	stp	x24, x26, [x25, #0x10]
 40efba4: f940477a     	ldr	x26, [x27, #0x88]
 40efba8: eb1a039f     	cmp	x28, x26
 40efbac: 54000081     	b.ne	0x40efbbc <_ChromeMain+0x40ea920>
 40efbb0: 91002280     	add	x0, x20, #0x8
 40efbb4: 96fccba2     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40efbb8: f940477a     	ldr	x26, [x27, #0x88]
 40efbbc: f94002d8     	ldr	x24, [x22]
 40efbc0: 925e7717     	and	x23, x24, #0xfffffffc00000000
 40efbc4: eb1a02ff     	cmp	x23, x26
 40efbc8: 54000081     	b.ne	0x40efbd8 <_ChromeMain+0x40ea93c>
 40efbcc: aa1803e0     	mov	x0, x24
 40efbd0: 96fc91cb     	bl	0x142fc <_ChromeMain+0xf060>
 40efbd4: f940477a     	ldr	x26, [x27, #0x88]
 40efbd8: eb1a02ff     	cmp	x23, x26
 40efbdc: 54000081     	b.ne	0x40efbec <_ChromeMain+0x40ea950>
 40efbe0: aa1803e0     	mov	x0, x24
 40efbe4: 96fc91c6     	bl	0x142fc <_ChromeMain+0xf060>
 40efbe8: f940477a     	ldr	x26, [x27, #0x88]
 40efbec: 925e7708     	and	x8, x24, #0xfffffffc00000000
 40efbf0: eb1a011f     	cmp	x8, x26
 40efbf4: 54000081     	b.ne	0x40efc04 <_ChromeMain+0x40ea968>
 40efbf8: aa1803e0     	mov	x0, x24
 40efbfc: 96fccb90     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40efc00: f940477a     	ldr	x26, [x27, #0x88]
 40efc04: 52800900     	mov	w0, #0x48               ; =72
 40efc08: 96fc7dd8     	bl	0xf368 <_ChromeMain+0xa0cc>
 40efc0c: aa0003f7     	mov	x23, x0
 40efc10: 52800028     	mov	w8, #0x1                ; =1
 40efc14: b9000008     	str	w8, [x0]
 40efc18: 90fff428     	adrp	x8, 0x3f73000 <_ChromeMain+0x3f6dd64>
 40efc1c: 91320108     	add	x8, x8, #0xc80
 40efc20: 10017d89     	adr	x9, 0x40f2bd0 <_ChromeMain+0x40ed934>
 40efc24: d503201f     	nop
 40efc28: a900a408     	stp	x8, x9, [x0, #0x8]
 40efc2c: 10007928     	adr	x8, 0x40f0b50 <_ChromeMain+0x40eb8b4>
 40efc30: d503201f     	nop
 40efc34: d0ff2369     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 40efc38: 912c0129     	add	x9, x9, #0xb00
 40efc3c: a901a009     	stp	x9, x8, [x0, #0x18]
 40efc40: a902e01f     	stp	xzr, x24, [x0, #0x28]
 40efc44: f9415688     	ldr	x8, [x20, #0x2a8]
 40efc48: a903a019     	stp	x25, x8, [x0, #0x38]
 40efc4c: eb1a039f     	cmp	x28, x26
 40efc50: 54000081     	b.ne	0x40efc60 <_ChromeMain+0x40ea9c4>
 40efc54: 91002280     	add	x0, x20, #0x8
 40efc58: 96fc91a9     	bl	0x142fc <_ChromeMain+0xf060>
 40efc5c: f940477a     	ldr	x26, [x27, #0x88]
 40efc60: eb1a02bf     	cmp	x21, x26
 40efc64: d0055619     	adrp	x25, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40efc68: 54000061     	b.ne	0x40efc74 <_ChromeMain+0x40ea9d8>
 40efc6c: 910043e0     	add	x0, sp, #0x10
 40efc70: 96fc91a3     	bl	0x142fc <_ChromeMain+0xf060>
 40efc74: b5000156     	cbnz	x22, 0x40efc9c <_ChromeMain+0x40eaa00>
 40efc78: b4000217     	cbz	x23, 0x40efcb8 <_ChromeMain+0x40eaa1c>
 40efc7c: 12800008     	mov	w8, #-0x1               ; =-1
 40efc80: b8e802e8     	ldaddal	w8, w8, [x23]
 40efc84: 7100051f     	cmp	w8, #0x1
 40efc88: 54000181     	b.ne	0x40efcb8 <_ChromeMain+0x40eaa1c>
 40efc8c: f9400ae8     	ldr	x8, [x23, #0x10]
 40efc90: aa1703e0     	mov	x0, x23
 40efc94: d63f0100     	blr	x8
 40efc98: 14000008     	b	0x40efcb8 <_ChromeMain+0x40eaa1c>
 40efc9c: f9400e80     	ldr	x0, [x20, #0x18]
 40efca0: f9400008     	ldr	x8, [x0]
 40efca4: f9400108     	ldr	x8, [x8]
 40efca8: 910043e1     	add	x1, sp, #0x10
 40efcac: aa1703e2     	mov	x2, x23
 40efcb0: d2800003     	mov	x3, #0x0                ; =0
 40efcb4: d63f0100     	blr	x8
 40efcb8: f9404768     	ldr	x8, [x27, #0x88]
 40efcbc: eb0802bf     	cmp	x21, x8
 40efcc0: 54000081     	b.ne	0x40efcd0 <_ChromeMain+0x40eaa34>
 40efcc4: 910043e0     	add	x0, sp, #0x10
 40efcc8: 96fccb5d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40efccc: f9404768     	ldr	x8, [x27, #0x88]
 40efcd0: eb08039f     	cmp	x28, x8
 40efcd4: 54000081     	b.ne	0x40efce4 <_ChromeMain+0x40eaa48>
 40efcd8: 91002280     	add	x0, x20, #0x8
 40efcdc: 96fccb58     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40efce0: f9404768     	ldr	x8, [x27, #0x88]
 40efce4: eb0802bf     	cmp	x21, x8
 40efce8: f0fff3fb     	adrp	x27, 0x3f6e000 <_ChromeMain+0x3f68d64>
 40efcec: 9123037b     	add	x27, x27, #0x8c0
 40efcf0: b0fff3fc     	adrp	x28, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40efcf4: 912b039c     	add	x28, x28, #0xac0
 40efcf8: 54000061     	b.ne	0x40efd04 <_ChromeMain+0x40eaa68>
 40efcfc: 910043e0     	add	x0, sp, #0x10
 40efd00: 96fccb4f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40efd04: f9401288     	ldr	x8, [x20, #0x20]
 40efd08: b4000ea8     	cbz	x8, 0x40efedc <_ChromeMain+0x40eac40>
 40efd0c: b9403108     	ldr	w8, [x8, #0x30]
 40efd10: 7100091f     	cmp	w8, #0x2
 40efd14: 54000e41     	b.ne	0x40efedc <_ChromeMain+0x40eac40>
 40efd18: f9402e97     	ldr	x23, [x20, #0x58]
 40efd1c: d0046f61     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 40efd20: 91219021     	add	x1, x1, #0x864
 40efd24: aa1703e0     	mov	x0, x23
 40efd28: 52800342     	mov	w2, #0x1a               ; =26
 40efd2c: 970f33c8     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 40efd30: b40005a0     	cbz	x0, 0x40efde4 <_ChromeMain+0x40eab48>
 40efd34: aa0003e8     	mov	x8, x0
 40efd38: f9401009     	ldr	x9, [x0, #0x20]
 40efd3c: b4004fa9     	cbz	x9, 0x40f0730 <_ChromeMain+0x40eb494>
 40efd40: f9400929     	ldr	x9, [x9, #0x10]
 40efd44: f9000bff     	str	xzr, [sp, #0x10]
 40efd48: f9401520     	ldr	x0, [x9, #0x28]
 40efd4c: b40004a0     	cbz	x0, 0x40efde0 <_ChromeMain+0x40eab44>
 40efd50: 39805d09     	ldrsb	x9, [x8, #0x17]
 40efd54: a9402d0a     	ldp	x10, x11, [x8]
 40efd58: f100013f     	cmp	x9, #0x0
 40efd5c: 9a884158     	csel	x24, x10, x8, mi
 40efd60: 7100013f     	cmp	w9, #0x0
 40efd64: 9a894179     	csel	x25, x11, x9, mi
 40efd68: f9400008     	ldr	x8, [x0]
 40efd6c: f9401108     	ldr	x8, [x8, #0x20]
 40efd70: b0fdfda9     	adrp	x9, 0xa4000 <_ChromeMain+0x9ed64>
 40efd74: 91177129     	add	x9, x9, #0x5dc
 40efd78: eb09011f     	cmp	x8, x9
 40efd7c: 540040e1     	b.ne	0x40f0598 <_ChromeMain+0x40eb2fc>
 40efd80: f9402415     	ldr	x21, [x0, #0x48]
 40efd84: b40002f5     	cbz	x21, 0x40efde0 <_ChromeMain+0x40eab44>
 40efd88: f8410eb6     	ldr	x22, [x21, #0x10]!
 40efd8c: b40002b6     	cbz	x22, 0x40efde0 <_ChromeMain+0x40eab44>
 40efd90: 14000004     	b	0x40efda0 <_ChromeMain+0x40eab04>
 40efd94: 54000223     	b.lo	0x40efdd8 <_ChromeMain+0x40eab3c>
 40efd98: f94006d6     	ldr	x22, [x22, #0x8]
 40efd9c: b4000236     	cbz	x22, 0x40efde0 <_ChromeMain+0x40eab44>
 40efda0: aa1603e8     	mov	x8, x22
 40efda4: f8420d09     	ldr	x9, [x8, #0x20]!
 40efda8: 39805d0a     	ldrsb	x10, [x8, #0x17]
 40efdac: f100015f     	cmp	x10, #0x0
 40efdb0: 9a884121     	csel	x1, x9, x8, mi
 40efdb4: f9400508     	ldr	x8, [x8, #0x8]
 40efdb8: 7100015f     	cmp	w10, #0x0
 40efdbc: 9a8a411a     	csel	x26, x8, x10, mi
 40efdc0: eb19035f     	cmp	x26, x25
 40efdc4: 9a993342     	csel	x2, x26, x25, lo
 40efdc8: aa1803e0     	mov	x0, x24
 40efdcc: 94fc66a5     	bl	0x8009860 <_ChromeMain+0x80045c4>
 40efdd0: 34003b40     	cbz	w0, 0x40f0538 <_ChromeMain+0x40eb29c>
 40efdd4: 36fffe20     	tbz	w0, #0x1f, 0x40efd98 <_ChromeMain+0x40eaafc>
 40efdd8: f94002d6     	ldr	x22, [x22]
 40efddc: b5fffe36     	cbnz	x22, 0x40efda0 <_ChromeMain+0x40eab04>
 40efde0: d0055619     	adrp	x25, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40efde4: f9468f28     	ldr	x8, [x25, #0xd18]
 40efde8: d63f0100     	blr	x8
 40efdec: 9106e288     	add	x8, x20, #0x1b8
 40efdf0: 39470289     	ldrb	w9, [x20, #0x1c0]
 40efdf4: 350000c9     	cbnz	w9, 0x40efe0c <_ChromeMain+0x40eab70>
 40efdf8: b4002f68     	cbz	x8, 0x40f03e4 <_ChromeMain+0x40eb148>
 40efdfc: f900de80     	str	x0, [x20, #0x1b8]
 40efe00: 52800028     	mov	w8, #0x1                ; =1
 40efe04: 39070288     	strb	w8, [x20, #0x1c0]
 40efe08: 14000002     	b	0x40efe10 <_ChromeMain+0x40eab74>
 40efe0c: f9000100     	str	x0, [x8]
 40efe10: f9401297     	ldr	x23, [x20, #0x20]
 40efe14: f9415a95     	ldr	x21, [x20, #0x2b0]
 40efe18: b40000d5     	cbz	x21, 0x40efe30 <_ChromeMain+0x40eab94>
 40efe1c: 52800028     	mov	w8, #0x1                ; =1
 40efe20: b82802a8     	ldadd	w8, w8, [x21]
 40efe24: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40efe28: 6b09011f     	cmp	w8, w9
 40efe2c: 540049a0     	b.eq	0x40f0760 <_ChromeMain+0x40eb4c4>
 40efe30: f9415e96     	ldr	x22, [x20, #0x2b8]
 40efe34: 52800800     	mov	w0, #0x40               ; =64
 40efe38: 96fc7d4c     	bl	0xf368 <_ChromeMain+0xa0cc>
 40efe3c: 52800028     	mov	w8, #0x1                ; =1
 40efe40: d0ff4449     	adrp	x9, 0x2979000 <_ChromeMain+0x2973d64>
 40efe44: 91340129     	add	x9, x9, #0xd00
 40efe48: b0fff3ea     	adrp	x10, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40efe4c: 912b014a     	add	x10, x10, #0xac0
 40efe50: b9000008     	str	w8, [x0]
 40efe54: 10df436b     	adr	x11, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40efe58: d503201f     	nop
 40efe5c: 1000704c     	adr	x12, 0x40f0c64 <_ChromeMain+0x40eb9c8>
 40efe60: d503201f     	nop
 40efe64: a900a809     	stp	x9, x10, [x0, #0x8]
 40efe68: a901b00b     	stp	x11, x12, [x0, #0x18]
 40efe6c: a902d41f     	stp	xzr, x21, [x0, #0x28]
 40efe70: f9001c16     	str	x22, [x0, #0x38]
 40efe74: b4004653     	cbz	x19, 0x40f073c <_ChromeMain+0x40eb4a0>
 40efe78: b8280268     	ldadd	w8, w8, [x19]
 40efe7c: 7100011f     	cmp	w8, #0x0
 40efe80: 5400464d     	b.le	0x40f0748 <_ChromeMain+0x40eb4ac>
 40efe84: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40efe88: 6b09011f     	cmp	w8, w9
 40efe8c: 54004640     	b.eq	0x40f0754 <_ChromeMain+0x40eb4b8>
 40efe90: aa0003f8     	mov	x24, x0
 40efe94: 52800700     	mov	w0, #0x38               ; =56
 40efe98: 96fc7d34     	bl	0xf368 <_ChromeMain+0xa0cc>
 40efe9c: aa0003e2     	mov	x2, x0
 40efea0: 52800028     	mov	w8, #0x1                ; =1
 40efea4: f0feab49     	adrp	x9, 0x165a000 <_ChromeMain+0x1654d64>
 40efea8: 91374129     	add	x9, x9, #0xdd0
 40efeac: 90fff58a     	adrp	x10, 0x3f9f000 <_ChromeMain+0x3f99d64>
 40efeb0: 9100014a     	add	x10, x10, #0x0
 40efeb4: b9000008     	str	w8, [x0]
 40efeb8: a900a809     	stp	x9, x10, [x0, #0x8]
 40efebc: d0ff2368     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 40efec0: 912c0108     	add	x8, x8, #0xb00
 40efec4: f9000c08     	str	x8, [x0, #0x18]
 40efec8: a902cc18     	stp	x24, x19, [x0, #0x28]
 40efecc: aa1703e0     	mov	x0, x23
 40efed0: f94007e1     	ldr	x1, [sp, #0x8]
 40efed4: 94d9846b     	bl	0x7751080 <_ChromeMain+0x774bde4>
 40efed8: 1400001e     	b	0x40eff50 <_ChromeMain+0x40eacb4>
 40efedc: f9401680     	ldr	x0, [x20, #0x28]
 40efee0: b4004100     	cbz	x0, 0x40f0700 <_ChromeMain+0x40eb464>
 40efee4: b90013ff     	str	wzr, [sp, #0x10]
 40efee8: 6f00e400     	movi.2d	v0, #0000000000000000
 40efeec: 3c8183e0     	stur	q0, [sp, #0x18]
 40efef0: 3c8283e0     	stur	q0, [sp, #0x28]
 40efef4: 3c8383e0     	stur	q0, [sp, #0x38]
 40efef8: 3c8483e0     	stur	q0, [sp, #0x48]
 40efefc: f9400008     	ldr	x8, [x0]
 40eff00: f9402508     	ldr	x8, [x8, #0x48]
 40eff04: 910043e1     	add	x1, sp, #0x10
 40eff08: d63f0100     	blr	x8
 40eff0c: 910043e0     	add	x0, sp, #0x10
 40eff10: 94d97e1f     	bl	0x774f78c <_ChromeMain+0x774a4f0>
 40eff14: b4003fd3     	cbz	x19, 0x40f070c <_ChromeMain+0x40eb470>
 40eff18: 52800028     	mov	w8, #0x1                ; =1
 40eff1c: b8280268     	ldadd	w8, w8, [x19]
 40eff20: 7100011f     	cmp	w8, #0x0
 40eff24: 54003fad     	b.le	0x40f0718 <_ChromeMain+0x40eb47c>
 40eff28: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40eff2c: 6b09011f     	cmp	w8, w9
 40eff30: 54003fa0     	b.eq	0x40f0724 <_ChromeMain+0x40eb488>
 40eff34: f9400668     	ldr	x8, [x19, #0x8]
 40eff38: aa1303e0     	mov	x0, x19
 40eff3c: d63f0100     	blr	x8
 40eff40: 12800008     	mov	w8, #-0x1               ; =-1
 40eff44: b8e80268     	ldaddal	w8, w8, [x19]
 40eff48: 7100051f     	cmp	w8, #0x1
 40eff4c: 540031e0     	b.eq	0x40f0588 <_ChromeMain+0x40eb2ec>
 40eff50: f9468f28     	ldr	x8, [x25, #0xd18]
 40eff54: d63f0100     	blr	x8
 40eff58: 91042288     	add	x8, x20, #0x108
 40eff5c: 39444289     	ldrb	w9, [x20, #0x110]
 40eff60: 350000c9     	cbnz	w9, 0x40eff78 <_ChromeMain+0x40eacdc>
 40eff64: b4002408     	cbz	x8, 0x40f03e4 <_ChromeMain+0x40eb148>
 40eff68: f9008680     	str	x0, [x20, #0x108]
 40eff6c: 52800028     	mov	w8, #0x1                ; =1
 40eff70: 39044288     	strb	w8, [x20, #0x110]
 40eff74: 14000002     	b	0x40eff7c <_ChromeMain+0x40eace0>
 40eff78: f9000100     	str	x0, [x8]
 40eff7c: f9468f28     	ldr	x8, [x25, #0xd18]
 40eff80: d63f0100     	blr	x8
 40eff84: 9109a288     	add	x8, x20, #0x268
 40eff88: 3949c289     	ldrb	w9, [x20, #0x270]
 40eff8c: 350000c9     	cbnz	w9, 0x40effa4 <_ChromeMain+0x40ead08>
 40eff90: b40022a8     	cbz	x8, 0x40f03e4 <_ChromeMain+0x40eb148>
 40eff94: f9013680     	str	x0, [x20, #0x268]
 40eff98: 52800028     	mov	w8, #0x1                ; =1
 40eff9c: 3909c288     	strb	w8, [x20, #0x270]
 40effa0: 14000002     	b	0x40effa8 <_ChromeMain+0x40ead0c>
 40effa4: f9000100     	str	x0, [x8]
 40effa8: 900560a0     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 40effac: 9135a000     	add	x0, x0, #0xd68
 40effb0: f9400008     	ldr	x8, [x0]
 40effb4: d63f0100     	blr	x8
 40effb8: f9400008     	ldr	x8, [x0]
 40effbc: b4003008     	cbz	x8, 0x40f05bc <_ChromeMain+0x40eb320>
 40effc0: f9400116     	ldr	x22, [x8]
 40effc4: b4002fd6     	cbz	x22, 0x40f05bc <_ChromeMain+0x40eb320>
 40effc8: 910022c8     	add	x8, x22, #0x8
 40effcc: 52800029     	mov	w9, #0x1                ; =1
 40effd0: b8290108     	ldadd	w9, w8, [x8]
 40effd4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40effd8: 6b09011f     	cmp	w8, w9
 40effdc: 540032c0     	b.eq	0x40f0634 <_ChromeMain+0x40eb398>
 40effe0: aa0003f5     	mov	x21, x0
 40effe4: d004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40effe8: 9131dc00     	add	x0, x0, #0xc77
 40effec: d004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40efff0: 91309421     	add	x1, x1, #0xc25
 40efff4: 910043e8     	add	x8, sp, #0x10
 40efff8: 52803322     	mov	w2, #0x199              ; =409
 40efffc: 96fd8321     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40f0000: f9415a97     	ldr	x23, [x20, #0x2b0]
 40f0004: b40000d7     	cbz	x23, 0x40f001c <_ChromeMain+0x40ead80>
 40f0008: 52800028     	mov	w8, #0x1                ; =1
 40f000c: b82802e8     	ldadd	w8, w8, [x23]
 40f0010: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f0014: 6b09011f     	cmp	w8, w9
 40f0018: 54003200     	b.eq	0x40f0658 <_ChromeMain+0x40eb3bc>
 40f001c: f9415e98     	ldr	x24, [x20, #0x2b8]
 40f0020: 52800800     	mov	w0, #0x40               ; =64
 40f0024: 96fc7cd1     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f0028: 52800028     	mov	w8, #0x1                ; =1
 40f002c: b9000008     	str	w8, [x0]
 40f0030: a900f01b     	stp	x27, x28, [x0, #0x8]
 40f0034: 10003dc9     	adr	x9, 0x40f07ec <_ChromeMain+0x40eb550>
 40f0038: d503201f     	nop
 40f003c: 10df342a     	adr	x10, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40f0040: d503201f     	nop
 40f0044: a901a40a     	stp	x10, x9, [x0, #0x18]
 40f0048: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 40f004c: f9001c18     	str	x24, [x0, #0x38]
 40f0050: f9002fe0     	str	x0, [sp, #0x58]
 40f0054: b8280268     	ldadd	w8, w8, [x19]
 40f0058: 7100011f     	cmp	w8, #0x0
 40f005c: 54002f2d     	b.le	0x40f0640 <_ChromeMain+0x40eb3a4>
 40f0060: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f0064: 6b09011f     	cmp	w8, w9
 40f0068: 54002f20     	b.eq	0x40f064c <_ChromeMain+0x40eb3b0>
 40f006c: 910163e0     	add	x0, sp, #0x58
 40f0070: aa1303e1     	mov	x1, x19
 40f0074: 948e9da4     	bl	0x6497704 <_ChromeMain+0x6492468>
 40f0078: aa0003e2     	mov	x2, x0
 40f007c: f94002c8     	ldr	x8, [x22]
 40f0080: f9400108     	ldr	x8, [x8]
 40f0084: 910043e1     	add	x1, sp, #0x10
 40f0088: aa1603e0     	mov	x0, x22
 40f008c: d2800003     	mov	x3, #0x0                ; =0
 40f0090: d63f0100     	blr	x8
 40f0094: f9402fe0     	ldr	x0, [sp, #0x58]
 40f0098: b5001980     	cbnz	x0, 0x40f03c8 <_ChromeMain+0x40eb12c>
 40f009c: 910022c8     	add	x8, x22, #0x8
 40f00a0: 12800009     	mov	w9, #-0x1               ; =-1
 40f00a4: b8e90108     	ldaddal	w9, w8, [x8]
 40f00a8: 7100051f     	cmp	w8, #0x1
 40f00ac: 54000141     	b.ne	0x40f00d4 <_ChromeMain+0x40eae38>
 40f00b0: f94002c9     	ldr	x9, [x22]
 40f00b4: f9400d28     	ldr	x8, [x9, #0x18]
 40f00b8: d0000eca     	adrp	x10, 0x42ca000 <_ChromeMain+0x42c4d64>
 40f00bc: 912a314a     	add	x10, x10, #0xa8c
 40f00c0: eb0a011f     	cmp	x8, x10
 40f00c4: 54000041     	b.ne	0x40f00cc <_ChromeMain+0x40eae30>
 40f00c8: f9400928     	ldr	x8, [x9, #0x10]
 40f00cc: aa1603e0     	mov	x0, x22
 40f00d0: d63f0100     	blr	x8
 40f00d4: f9468f28     	ldr	x8, [x25, #0xd18]
 40f00d8: d63f0100     	blr	x8
 40f00dc: 91084288     	add	x8, x20, #0x210
 40f00e0: 39486289     	ldrb	w9, [x20, #0x218]
 40f00e4: 350000c9     	cbnz	w9, 0x40f00fc <_ChromeMain+0x40eae60>
 40f00e8: b40017e8     	cbz	x8, 0x40f03e4 <_ChromeMain+0x40eb148>
 40f00ec: f9010a80     	str	x0, [x20, #0x210]
 40f00f0: 52800028     	mov	w8, #0x1                ; =1
 40f00f4: 39086288     	strb	w8, [x20, #0x218]
 40f00f8: 14000002     	b	0x40f0100 <_ChromeMain+0x40eae64>
 40f00fc: f9000100     	str	x0, [x8]
 40f0100: f94002a8     	ldr	x8, [x21]
 40f0104: b4002628     	cbz	x8, 0x40f05c8 <_ChromeMain+0x40eb32c>
 40f0108: f9400115     	ldr	x21, [x8]
 40f010c: b40025f5     	cbz	x21, 0x40f05c8 <_ChromeMain+0x40eb32c>
 40f0110: 910022a8     	add	x8, x21, #0x8
 40f0114: 52800029     	mov	w9, #0x1                ; =1
 40f0118: b8290108     	ldadd	w9, w8, [x8]
 40f011c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f0120: 6b09011f     	cmp	w8, w9
 40f0124: 54002a00     	b.eq	0x40f0664 <_ChromeMain+0x40eb3c8>
 40f0128: b004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40f012c: 9131dc00     	add	x0, x0, #0xc77
 40f0130: b004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40f0134: 91309421     	add	x1, x1, #0xc25
 40f0138: 910043e8     	add	x8, sp, #0x10
 40f013c: 528033e2     	mov	w2, #0x19f              ; =415
 40f0140: 96fd82d0     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40f0144: f9415a96     	ldr	x22, [x20, #0x2b0]
 40f0148: b40000d6     	cbz	x22, 0x40f0160 <_ChromeMain+0x40eaec4>
 40f014c: 52800028     	mov	w8, #0x1                ; =1
 40f0150: b82802c8     	ldadd	w8, w8, [x22]
 40f0154: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f0158: 6b09011f     	cmp	w8, w9
 40f015c: 54002960     	b.eq	0x40f0688 <_ChromeMain+0x40eb3ec>
 40f0160: f9415e94     	ldr	x20, [x20, #0x2b8]
 40f0164: 52800800     	mov	w0, #0x40               ; =64
 40f0168: 96fc7c80     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f016c: 52800028     	mov	w8, #0x1                ; =1
 40f0170: b9000008     	str	w8, [x0]
 40f0174: a900f01b     	stp	x27, x28, [x0, #0x8]
 40f0178: 10005a89     	adr	x9, 0x40f0cc8 <_ChromeMain+0x40eba2c>
 40f017c: d503201f     	nop
 40f0180: 10df2a0a     	adr	x10, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40f0184: d503201f     	nop
 40f0188: a901a40a     	stp	x10, x9, [x0, #0x18]
 40f018c: a902d81f     	stp	xzr, x22, [x0, #0x28]
 40f0190: f9001c14     	str	x20, [x0, #0x38]
 40f0194: f9002fe0     	str	x0, [sp, #0x58]
 40f0198: b8280268     	ldadd	w8, w8, [x19]
 40f019c: 7100011f     	cmp	w8, #0x0
 40f01a0: 5400268d     	b.le	0x40f0670 <_ChromeMain+0x40eb3d4>
 40f01a4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f01a8: 6b09011f     	cmp	w8, w9
 40f01ac: 54002680     	b.eq	0x40f067c <_ChromeMain+0x40eb3e0>
 40f01b0: 910163e0     	add	x0, sp, #0x58
 40f01b4: aa1303e1     	mov	x1, x19
 40f01b8: 948e9d53     	bl	0x6497704 <_ChromeMain+0x6492468>
 40f01bc: aa0003e2     	mov	x2, x0
 40f01c0: f94002a8     	ldr	x8, [x21]
 40f01c4: f9400108     	ldr	x8, [x8]
 40f01c8: 910043e1     	add	x1, sp, #0x10
 40f01cc: aa1503e0     	mov	x0, x21
 40f01d0: d2800003     	mov	x3, #0x0                ; =0
 40f01d4: d63f0100     	blr	x8
 40f01d8: f9402fe0     	ldr	x0, [sp, #0x58]
 40f01dc: b5000e80     	cbnz	x0, 0x40f03ac <_ChromeMain+0x40eb110>
 40f01e0: 910022a8     	add	x8, x21, #0x8
 40f01e4: 12800014     	mov	w20, #-0x1              ; =-1
 40f01e8: b8f40108     	ldaddal	w20, w8, [x8]
 40f01ec: 7100051f     	cmp	w8, #0x1
 40f01f0: 54000141     	b.ne	0x40f0218 <_ChromeMain+0x40eaf7c>
 40f01f4: f94002a9     	ldr	x9, [x21]
 40f01f8: f9400d28     	ldr	x8, [x9, #0x18]
 40f01fc: d0000eca     	adrp	x10, 0x42ca000 <_ChromeMain+0x42c4d64>
 40f0200: 912a314a     	add	x10, x10, #0xa8c
 40f0204: eb0a011f     	cmp	x8, x10
 40f0208: 54000041     	b.ne	0x40f0210 <_ChromeMain+0x40eaf74>
 40f020c: f9400928     	ldr	x8, [x9, #0x10]
 40f0210: aa1503e0     	mov	x0, x21
 40f0214: d63f0100     	blr	x8
 40f0218: b8f40268     	ldaddal	w20, w8, [x19]
 40f021c: 7100051f     	cmp	w8, #0x1
 40f0220: 54000941     	b.ne	0x40f0348 <_ChromeMain+0x40eb0ac>
 40f0224: f9400a68     	ldr	x8, [x19, #0x10]
 40f0228: aa1303e0     	mov	x0, x19
 40f022c: d63f0100     	blr	x8
 40f0230: 14000046     	b	0x40f0348 <_ChromeMain+0x40eb0ac>
 40f0234: f9000100     	str	x0, [x8]
 40f0238: f0056080     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 40f023c: 9135a000     	add	x0, x0, #0xd68
 40f0240: f9400008     	ldr	x8, [x0]
 40f0244: d63f0100     	blr	x8
 40f0248: f9400008     	ldr	x8, [x0]
 40f024c: b4001b28     	cbz	x8, 0x40f05b0 <_ChromeMain+0x40eb314>
 40f0250: f9400115     	ldr	x21, [x8]
 40f0254: b4001af5     	cbz	x21, 0x40f05b0 <_ChromeMain+0x40eb314>
 40f0258: 910022a8     	add	x8, x21, #0x8
 40f025c: 52800029     	mov	w9, #0x1                ; =1
 40f0260: b8290108     	ldadd	w9, w8, [x8]
 40f0264: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f0268: 6b09011f     	cmp	w8, w9
 40f026c: 54001d80     	b.eq	0x40f061c <_ChromeMain+0x40eb380>
 40f0270: b004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40f0274: 9131dc00     	add	x0, x0, #0xc77
 40f0278: b004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40f027c: 91309421     	add	x1, x1, #0xc25
 40f0280: 910043e8     	add	x8, sp, #0x10
 40f0284: 52802a82     	mov	w2, #0x154              ; =340
 40f0288: 96fd827e     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40f028c: f9415a99     	ldr	x25, [x20, #0x2b0]
 40f0290: b40000d9     	cbz	x25, 0x40f02a8 <_ChromeMain+0x40eb00c>
 40f0294: 52800028     	mov	w8, #0x1                ; =1
 40f0298: b8280328     	ldadd	w8, w8, [x25]
 40f029c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f02a0: 6b09011f     	cmp	w8, w9
 40f02a4: 54001c20     	b.eq	0x40f0628 <_ChromeMain+0x40eb38c>
 40f02a8: f9415e94     	ldr	x20, [x20, #0x2b8]
 40f02ac: 52800800     	mov	w0, #0x40               ; =64
 40f02b0: 96fc7c2e     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f02b4: 52800028     	mov	w8, #0x1                ; =1
 40f02b8: b9000008     	str	w8, [x0]
 40f02bc: a900dc16     	stp	x22, x23, [x0, #0x8]
 40f02c0: 10002969     	adr	x9, 0x40f07ec <_ChromeMain+0x40eb550>
 40f02c4: d503201f     	nop
 40f02c8: a901a418     	stp	x24, x9, [x0, #0x18]
 40f02cc: a902e41f     	stp	xzr, x25, [x0, #0x28]
 40f02d0: f9001c14     	str	x20, [x0, #0x38]
 40f02d4: f9002fe0     	str	x0, [sp, #0x58]
 40f02d8: b5000493     	cbnz	x19, 0x40f0368 <_ChromeMain+0x40eb0cc>
 40f02dc: 910163e0     	add	x0, sp, #0x58
 40f02e0: aa1303e1     	mov	x1, x19
 40f02e4: 948e9d08     	bl	0x6497704 <_ChromeMain+0x6492468>
 40f02e8: aa0003e2     	mov	x2, x0
 40f02ec: f94002a8     	ldr	x8, [x21]
 40f02f0: f9400108     	ldr	x8, [x8]
 40f02f4: 910043e1     	add	x1, sp, #0x10
 40f02f8: aa1503e0     	mov	x0, x21
 40f02fc: d2800003     	mov	x3, #0x0                ; =0
 40f0300: d63f0100     	blr	x8
 40f0304: f9402fe0     	ldr	x0, [sp, #0x58]
 40f0308: b50003e0     	cbnz	x0, 0x40f0384 <_ChromeMain+0x40eb0e8>
 40f030c: 910022a8     	add	x8, x21, #0x8
 40f0310: 12800009     	mov	w9, #-0x1               ; =-1
 40f0314: b8e90108     	ldaddal	w9, w8, [x8]
 40f0318: 7100051f     	cmp	w8, #0x1
 40f031c: 54000141     	b.ne	0x40f0344 <_ChromeMain+0x40eb0a8>
 40f0320: f94002a9     	ldr	x9, [x21]
 40f0324: f9400d28     	ldr	x8, [x9, #0x18]
 40f0328: d0000eca     	adrp	x10, 0x42ca000 <_ChromeMain+0x42c4d64>
 40f032c: 912a314a     	add	x10, x10, #0xa8c
 40f0330: eb0a011f     	cmp	x8, x10
 40f0334: 54000041     	b.ne	0x40f033c <_ChromeMain+0x40eb0a0>
 40f0338: f9400928     	ldr	x8, [x9, #0x10]
 40f033c: aa1503e0     	mov	x0, x21
 40f0340: d63f0100     	blr	x8
 40f0344: b50002f3     	cbnz	x19, 0x40f03a0 <_ChromeMain+0x40eb104>
 40f0348: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 40f034c: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 40f0350: a94957f6     	ldp	x22, x21, [sp, #0x90]
 40f0354: a9485ff8     	ldp	x24, x23, [sp, #0x80]
 40f0358: a94767fa     	ldp	x26, x25, [sp, #0x70]
 40f035c: a9466ffc     	ldp	x28, x27, [sp, #0x60]
 40f0360: 910303ff     	add	sp, sp, #0xc0
 40f0364: d65f03c0     	ret
 40f0368: b8280268     	ldadd	w8, w8, [x19]
 40f036c: 7100011f     	cmp	w8, #0x0
 40f0370: 54001fed     	b.le	0x40f076c <_ChromeMain+0x40eb4d0>
 40f0374: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f0378: 6b09011f     	cmp	w8, w9
 40f037c: 54001fe0     	b.eq	0x40f0778 <_ChromeMain+0x40eb4dc>
 40f0380: 17ffffd7     	b	0x40f02dc <_ChromeMain+0x40eb040>
 40f0384: 12800008     	mov	w8, #-0x1               ; =-1
 40f0388: b8e80008     	ldaddal	w8, w8, [x0]
 40f038c: 7100051f     	cmp	w8, #0x1
 40f0390: 54fffbe1     	b.ne	0x40f030c <_ChromeMain+0x40eb070>
 40f0394: f9400808     	ldr	x8, [x0, #0x10]
 40f0398: d63f0100     	blr	x8
 40f039c: 17ffffdc     	b	0x40f030c <_ChromeMain+0x40eb070>
 40f03a0: 12800008     	mov	w8, #-0x1               ; =-1
 40f03a4: b8e80268     	ldaddal	w8, w8, [x19]
 40f03a8: 17ffff9d     	b	0x40f021c <_ChromeMain+0x40eaf80>
 40f03ac: 12800008     	mov	w8, #-0x1               ; =-1
 40f03b0: b8e80008     	ldaddal	w8, w8, [x0]
 40f03b4: 7100051f     	cmp	w8, #0x1
 40f03b8: 54fff141     	b.ne	0x40f01e0 <_ChromeMain+0x40eaf44>
 40f03bc: f9400808     	ldr	x8, [x0, #0x10]
 40f03c0: d63f0100     	blr	x8
 40f03c4: 17ffff87     	b	0x40f01e0 <_ChromeMain+0x40eaf44>
 40f03c8: 12800008     	mov	w8, #-0x1               ; =-1
 40f03cc: b8e80008     	ldaddal	w8, w8, [x0]
 40f03d0: 7100051f     	cmp	w8, #0x1
 40f03d4: 54ffe641     	b.ne	0x40f009c <_ChromeMain+0x40eae00>
 40f03d8: f9400808     	ldr	x8, [x0, #0x10]
 40f03dc: d63f0100     	blr	x8
 40f03e0: 17ffff2f     	b	0x40f009c <_ChromeMain+0x40eae00>
 40f03e4: d4200020     	brk	#0x1
 40f03e8: 52800028     	mov	w8, #0x1                ; =1
 40f03ec: b82802e8     	ldadd	w8, w8, [x23]
 40f03f0: 7100011f     	cmp	w8, #0x0
 40f03f4: 54001d4d     	b.le	0x40f079c <_ChromeMain+0x40eb500>
 40f03f8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f03fc: 6b09011f     	cmp	w8, w9
 40f0400: 54001d40     	b.eq	0x40f07a8 <_ChromeMain+0x40eb50c>
 40f0404: a9016b38     	stp	x24, x26, [x25, #0x10]
 40f0408: 12800008     	mov	w8, #-0x1               ; =-1
 40f040c: b8e802e8     	ldaddal	w8, w8, [x23]
 40f0410: 7100051f     	cmp	w8, #0x1
 40f0414: 54ffbc81     	b.ne	0x40efba4 <_ChromeMain+0x40ea908>
 40f0418: f9400ae8     	ldr	x8, [x23, #0x10]
 40f041c: aa1703e0     	mov	x0, x23
 40f0420: d63f0100     	blr	x8
 40f0424: 17fffde0     	b	0x40efba4 <_ChromeMain+0x40ea908>
 40f0428: b8280268     	ldadd	w8, w8, [x19]
 40f042c: 7100011f     	cmp	w8, #0x0
 40f0430: 54001aad     	b.le	0x40f0784 <_ChromeMain+0x40eb4e8>
 40f0434: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f0438: 6b09011f     	cmp	w8, w9
 40f043c: 54ffa861     	b.ne	0x40ef948 <_ChromeMain+0x40ea6ac>
 40f0440: d4200000     	brk	#0
 40f0444: d4400000     	hlt	#0
 40f0448: d4200020     	brk	#0x1
 40f044c: b8280268     	ldadd	w8, w8, [x19]
 40f0450: 7100011f     	cmp	w8, #0x0
 40f0454: 540019ed     	b.le	0x40f0790 <_ChromeMain+0x40eb4f4>
 40f0458: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f045c: 6b09011f     	cmp	w8, w9
 40f0460: 54ffb0a1     	b.ne	0x40efa74 <_ChromeMain+0x40ea7d8>
 40f0464: d4200000     	brk	#0
 40f0468: d4400000     	hlt	#0
 40f046c: d4200020     	brk	#0x1
 40f0470: eb1a033f     	cmp	x25, x26
 40f0474: 54ff9741     	b.ne	0x40ef75c <_ChromeMain+0x40ea4c0>
 40f0478: eb1502df     	cmp	x22, x21
 40f047c: 54ff9960     	b.eq	0x40ef7a8 <_ChromeMain+0x40ea50c>
 40f0480: d0049c01     	adrp	x1, 0xd472000 <dyld_stub_binder+0xd472000>
 40f0484: 91369c21     	add	x1, x1, #0xda7
 40f0488: aa1703e0     	mov	x0, x23
 40f048c: 528002e2     	mov	w2, #0x17               ; =23
 40f0490: 9708581c     	bl	0x306500 <_ChromeMain+0x301264>
 40f0494: 360798a0     	tbz	w0, #0x0, 0x40ef7a8 <_ChromeMain+0x40ea50c>
 40f0498: f9401680     	ldr	x0, [x20, #0x28]
 40f049c: b40018c0     	cbz	x0, 0x40f07b4 <_ChromeMain+0x40eb518>
 40f04a0: f9400008     	ldr	x8, [x0]
 40f04a4: f9402108     	ldr	x8, [x8, #0x40]
 40f04a8: d2800001     	mov	x1, #0x0                ; =0
 40f04ac: d63f0100     	blr	x8
 40f04b0: b0055619     	adrp	x25, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40f04b4: b4001873     	cbz	x19, 0x40f07c0 <_ChromeMain+0x40eb524>
 40f04b8: 52800028     	mov	w8, #0x1                ; =1
 40f04bc: b8280268     	ldadd	w8, w8, [x19]
 40f04c0: 7100011f     	cmp	w8, #0x0
 40f04c4: 5400184d     	b.le	0x40f07cc <_ChromeMain+0x40eb530>
 40f04c8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f04cc: 6b09011f     	cmp	w8, w9
 40f04d0: 54001840     	b.eq	0x40f07d8 <_ChromeMain+0x40eb53c>
 40f04d4: f9400668     	ldr	x8, [x19, #0x8]
 40f04d8: aa1303e0     	mov	x0, x19
 40f04dc: d63f0100     	blr	x8
 40f04e0: 12800008     	mov	w8, #-0x1               ; =-1
 40f04e4: b8e80268     	ldaddal	w8, w8, [x19]
 40f04e8: 7100051f     	cmp	w8, #0x1
 40f04ec: 54ffc0c1     	b.ne	0x40efd04 <_ChromeMain+0x40eaa68>
 40f04f0: f9400a68     	ldr	x8, [x19, #0x10]
 40f04f4: aa1303e0     	mov	x0, x19
 40f04f8: d63f0100     	blr	x8
 40f04fc: 17fffe02     	b	0x40efd04 <_ChromeMain+0x40eaa68>
 40f0500: 12800008     	mov	w8, #-0x1               ; =-1
 40f0504: b8e80008     	ldaddal	w8, w8, [x0]
 40f0508: 7100051f     	cmp	w8, #0x1
 40f050c: 54ffa6e1     	b.ne	0x40ef9e8 <_ChromeMain+0x40ea74c>
 40f0510: f9400808     	ldr	x8, [x0, #0x10]
 40f0514: d63f0100     	blr	x8
 40f0518: 17fffd34     	b	0x40ef9e8 <_ChromeMain+0x40ea74c>
 40f051c: 12800008     	mov	w8, #-0x1               ; =-1
 40f0520: b8e80008     	ldaddal	w8, w8, [x0]
 40f0524: 7100051f     	cmp	w8, #0x1
 40f0528: 54ffaea1     	b.ne	0x40efafc <_ChromeMain+0x40ea860>
 40f052c: f9400808     	ldr	x8, [x0, #0x10]
 40f0530: d63f0100     	blr	x8
 40f0534: 17fffd72     	b	0x40efafc <_ChromeMain+0x40ea860>
 40f0538: eb1a033f     	cmp	x25, x26
 40f053c: 54ffc2c1     	b.ne	0x40efd94 <_ChromeMain+0x40eaaf8>
 40f0540: eb1502df     	cmp	x22, x21
 40f0544: 54ffc4e0     	b.eq	0x40efde0 <_ChromeMain+0x40eab44>
 40f0548: b0046f61     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 40f054c: 91219021     	add	x1, x1, #0x864
 40f0550: aa1703e0     	mov	x0, x23
 40f0554: 52800342     	mov	w2, #0x1a               ; =26
 40f0558: 970857ea     	bl	0x306500 <_ChromeMain+0x301264>
 40f055c: b0055619     	adrp	x25, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40f0560: 3707c420     	tbnz	w0, #0x0, 0x40efde4 <_ChromeMain+0x40eab48>
 40f0564: d4200000     	brk	#0
 40f0568: d4400000     	hlt	#0
 40f056c: d4200020     	brk	#0x1
 40f0570: 910043e3     	add	x3, sp, #0x10
 40f0574: aa1803e1     	mov	x1, x24
 40f0578: aa1903e2     	mov	x2, x25
 40f057c: d63f0100     	blr	x8
 40f0580: 3707f800     	tbnz	w0, #0x0, 0x40f0480 <_ChromeMain+0x40eb1e4>
 40f0584: 17fffc89     	b	0x40ef7a8 <_ChromeMain+0x40ea50c>
 40f0588: f9400a68     	ldr	x8, [x19, #0x10]
 40f058c: aa1303e0     	mov	x0, x19
 40f0590: d63f0100     	blr	x8
 40f0594: 17fffe6f     	b	0x40eff50 <_ChromeMain+0x40eacb4>
 40f0598: 910043e3     	add	x3, sp, #0x10
 40f059c: aa1803e1     	mov	x1, x24
 40f05a0: aa1903e2     	mov	x2, x25
 40f05a4: d63f0100     	blr	x8
 40f05a8: 3707fd00     	tbnz	w0, #0x0, 0x40f0548 <_ChromeMain+0x40eb2ac>
 40f05ac: 17fffe0d     	b	0x40efde0 <_ChromeMain+0x40eab44>
 40f05b0: d4200000     	brk	#0
 40f05b4: d4400000     	hlt	#0
 40f05b8: d4200020     	brk	#0x1
 40f05bc: d4200000     	brk	#0
 40f05c0: d4400000     	hlt	#0
 40f05c4: d4200020     	brk	#0x1
 40f05c8: d4200000     	brk	#0
 40f05cc: d4400000     	hlt	#0
 40f05d0: d4200020     	brk	#0x1
 40f05d4: d4200000     	brk	#0
 40f05d8: d4400000     	hlt	#0
 40f05dc: d4200020     	brk	#0x1
 40f05e0: d4200000     	brk	#0
 40f05e4: d4400000     	hlt	#0
 40f05e8: d4200020     	brk	#0x1
 40f05ec: d4200000     	brk	#0
 40f05f0: d4400000     	hlt	#0
 40f05f4: d4200020     	brk	#0x1
 40f05f8: d4200000     	brk	#0
 40f05fc: d4400000     	hlt	#0
 40f0600: 17ffff79     	b	0x40f03e4 <_ChromeMain+0x40eb148>
 40f0604: d4200000     	brk	#0
 40f0608: d4400000     	hlt	#0
 40f060c: d4200020     	brk	#0x1
 40f0610: d4200000     	brk	#0
 40f0614: d4400000     	hlt	#0
 40f0618: d4200020     	brk	#0x1
 40f061c: d4200000     	brk	#0
 40f0620: d4400000     	hlt	#0
 40f0624: d4200020     	brk	#0x1
 40f0628: d4200000     	brk	#0
 40f062c: d4400000     	hlt	#0
 40f0630: d4200020     	brk	#0x1
 40f0634: d4200000     	brk	#0
 40f0638: d4400000     	hlt	#0
 40f063c: d4200020     	brk	#0x1
 40f0640: d4200000     	brk	#0
 40f0644: d4400000     	hlt	#0
 40f0648: d4200020     	brk	#0x1
 40f064c: d4200000     	brk	#0
 40f0650: d4400000     	hlt	#0
 40f0654: d4200020     	brk	#0x1
 40f0658: d4200000     	brk	#0
 40f065c: d4400000     	hlt	#0
 40f0660: d4200020     	brk	#0x1
 40f0664: d4200000     	brk	#0
 40f0668: d4400000     	hlt	#0
 40f066c: d4200020     	brk	#0x1
 40f0670: d4200000     	brk	#0
 40f0674: d4400000     	hlt	#0
 40f0678: d4200020     	brk	#0x1
 40f067c: d4200000     	brk	#0
 40f0680: d4400000     	hlt	#0
 40f0684: d4200020     	brk	#0x1
 40f0688: d4200000     	brk	#0
 40f068c: d4400000     	hlt	#0
 40f0690: d4200020     	brk	#0x1
 40f0694: d4200000     	brk	#0
 40f0698: d4400000     	hlt	#0
 40f069c: d4200020     	brk	#0x1
 40f06a0: d4200000     	brk	#0
 40f06a4: d4400000     	hlt	#0
 40f06a8: d4200020     	brk	#0x1
 40f06ac: d4200000     	brk	#0
 40f06b0: d4400000     	hlt	#0
 40f06b4: d4200020     	brk	#0x1
 40f06b8: d4200000     	brk	#0
 40f06bc: d4400000     	hlt	#0
 40f06c0: d4200020     	brk	#0x1
 40f06c4: d4200000     	brk	#0
 40f06c8: d4400000     	hlt	#0
 40f06cc: d4200020     	brk	#0x1
 40f06d0: d4200000     	brk	#0
 40f06d4: d4400000     	hlt	#0
 40f06d8: d4200020     	brk	#0x1
 40f06dc: d4200000     	brk	#0
 40f06e0: d4400000     	hlt	#0
 40f06e4: d4200020     	brk	#0x1
 40f06e8: d4200000     	brk	#0
 40f06ec: d4400000     	hlt	#0
 40f06f0: d4200020     	brk	#0x1
 40f06f4: d4200000     	brk	#0
 40f06f8: d4400000     	hlt	#0
 40f06fc: d4200020     	brk	#0x1
 40f0700: d4200000     	brk	#0
 40f0704: d4400000     	hlt	#0
 40f0708: d4200020     	brk	#0x1
 40f070c: d4200000     	brk	#0
 40f0710: d4400000     	hlt	#0
 40f0714: d4200020     	brk	#0x1
 40f0718: d4200000     	brk	#0
 40f071c: d4400000     	hlt	#0
 40f0720: d4200020     	brk	#0x1
 40f0724: d4200000     	brk	#0
 40f0728: d4400000     	hlt	#0
 40f072c: d4200020     	brk	#0x1
 40f0730: d4200000     	brk	#0
 40f0734: d4400000     	hlt	#0
 40f0738: d4200020     	brk	#0x1
 40f073c: d4200000     	brk	#0
 40f0740: d4400000     	hlt	#0
 40f0744: d4200020     	brk	#0x1
 40f0748: d4200000     	brk	#0
 40f074c: d4400000     	hlt	#0
 40f0750: d4200020     	brk	#0x1
 40f0754: d4200000     	brk	#0
 40f0758: d4400000     	hlt	#0
 40f075c: d4200020     	brk	#0x1
 40f0760: d4200000     	brk	#0
 40f0764: d4400000     	hlt	#0
 40f0768: d4200020     	brk	#0x1
 40f076c: d4200000     	brk	#0
 40f0770: d4400000     	hlt	#0
 40f0774: d4200020     	brk	#0x1
 40f0778: d4200000     	brk	#0
 40f077c: d4400000     	hlt	#0
 40f0780: d4200020     	brk	#0x1
 40f0784: d4200000     	brk	#0
 40f0788: d4400000     	hlt	#0
 40f078c: d4200020     	brk	#0x1
 40f0790: d4200000     	brk	#0
 40f0794: d4400000     	hlt	#0
 40f0798: d4200020     	brk	#0x1
 40f079c: d4200000     	brk	#0
 40f07a0: d4400000     	hlt	#0
 40f07a4: d4200020     	brk	#0x1
 40f07a8: d4200000     	brk	#0
 40f07ac: d4400000     	hlt	#0
 40f07b0: d4200020     	brk	#0x1
 40f07b4: d4200000     	brk	#0
 40f07b8: d4400000     	hlt	#0
 40f07bc: d4200020     	brk	#0x1
 40f07c0: d4200000     	brk	#0
 40f07c4: d4400000     	hlt	#0
 40f07c8: d4200020     	brk	#0x1
 40f07cc: d4200000     	brk	#0
 40f07d0: d4400000     	hlt	#0
 40f07d4: d4200020     	brk	#0x1
 40f07d8: d4200000     	brk	#0
 40f07dc: d4400000     	hlt	#0
 40f07e0: d4200020     	brk	#0x1
 40f07e4: 9102a000     	add	x0, x0, #0xa8
 40f07e8: 140015e6     	b	0x40f5f80 <_ChromeMain+0x40f0ce4>
 40f07ec: d10283ff     	sub	sp, sp, #0xa0
 40f07f0: a90567fa     	stp	x26, x25, [sp, #0x50]
 40f07f4: a9065ff8     	stp	x24, x23, [sp, #0x60]
 40f07f8: a90757f6     	stp	x22, x21, [sp, #0x70]
 40f07fc: a9084ff4     	stp	x20, x19, [sp, #0x80]
 40f0800: a9097bfd     	stp	x29, x30, [sp, #0x90]
 40f0804: 910243fd     	add	x29, sp, #0x90
 40f0808: aa0003f3     	mov	x19, x0
 40f080c: f9402c14     	ldr	x20, [x0, #0x58]
 40f0810: d0046f81     	adrp	x1, 0xcee2000 <dyld_stub_binder+0xcee2000>
 40f0814: 910ab421     	add	x1, x1, #0x2ad
 40f0818: aa1403e0     	mov	x0, x20
 40f081c: 52800322     	mov	w2, #0x19               ; =25
 40f0820: 970f310b     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 40f0824: b4000640     	cbz	x0, 0x40f08ec <_ChromeMain+0x40eb650>
 40f0828: aa0003e8     	mov	x8, x0
 40f082c: f9401009     	ldr	x9, [x0, #0x20]
 40f0830: b4001189     	cbz	x9, 0x40f0a60 <_ChromeMain+0x40eb7c4>
 40f0834: f9400929     	ldr	x9, [x9, #0x10]
 40f0838: f90013ff     	str	xzr, [sp, #0x20]
 40f083c: f9401520     	ldr	x0, [x9, #0x28]
 40f0840: b4000560     	cbz	x0, 0x40f08ec <_ChromeMain+0x40eb650>
 40f0844: 39805d09     	ldrsb	x9, [x8, #0x17]
 40f0848: a9402d0a     	ldp	x10, x11, [x8]
 40f084c: f100013f     	cmp	x9, #0x0
 40f0850: 9a884155     	csel	x21, x10, x8, mi
 40f0854: 7100013f     	cmp	w9, #0x0
 40f0858: 9a894176     	csel	x22, x11, x9, mi
 40f085c: f9400008     	ldr	x8, [x0]
 40f0860: f9401108     	ldr	x8, [x8, #0x20]
 40f0864: 90fdfda9     	adrp	x9, 0xa4000 <_ChromeMain+0x9ed64>
 40f0868: 91177129     	add	x9, x9, #0x5dc
 40f086c: eb09011f     	cmp	x8, x9
 40f0870: 540000c1     	b.ne	0x40f0888 <_ChromeMain+0x40eb5ec>
 40f0874: f9402417     	ldr	x23, [x0, #0x48]
 40f0878: b40003b7     	cbz	x23, 0x40f08ec <_ChromeMain+0x40eb650>
 40f087c: f8410ef8     	ldr	x24, [x23, #0x10]!
 40f0880: b4000378     	cbz	x24, 0x40f08ec <_ChromeMain+0x40eb650>
 40f0884: 1400000a     	b	0x40f08ac <_ChromeMain+0x40eb610>
 40f0888: 910083e3     	add	x3, sp, #0x20
 40f088c: aa1503e1     	mov	x1, x21
 40f0890: aa1603e2     	mov	x2, x22
 40f0894: d63f0100     	blr	x8
 40f0898: 37000c00     	tbnz	w0, #0x0, 0x40f0a18 <_ChromeMain+0x40eb77c>
 40f089c: 14000014     	b	0x40f08ec <_ChromeMain+0x40eb650>
 40f08a0: 54000223     	b.lo	0x40f08e4 <_ChromeMain+0x40eb648>
 40f08a4: f9400718     	ldr	x24, [x24, #0x8]
 40f08a8: b4000238     	cbz	x24, 0x40f08ec <_ChromeMain+0x40eb650>
 40f08ac: aa1803e8     	mov	x8, x24
 40f08b0: f8420d09     	ldr	x9, [x8, #0x20]!
 40f08b4: 39805d0a     	ldrsb	x10, [x8, #0x17]
 40f08b8: f100015f     	cmp	x10, #0x0
 40f08bc: 9a884121     	csel	x1, x9, x8, mi
 40f08c0: f9400508     	ldr	x8, [x8, #0x8]
 40f08c4: 7100015f     	cmp	w10, #0x0
 40f08c8: 9a8a4119     	csel	x25, x8, x10, mi
 40f08cc: eb16033f     	cmp	x25, x22
 40f08d0: 9a963322     	csel	x2, x25, x22, lo
 40f08d4: aa1503e0     	mov	x0, x21
 40f08d8: 94fc63e2     	bl	0x8009860 <_ChromeMain+0x80045c4>
 40f08dc: 34000960     	cbz	w0, 0x40f0a08 <_ChromeMain+0x40eb76c>
 40f08e0: 36fffe20     	tbz	w0, #0x1f, 0x40f08a4 <_ChromeMain+0x40eb608>
 40f08e4: f9400318     	ldr	x24, [x24]
 40f08e8: b5fffe38     	cbnz	x24, 0x40f08ac <_ChromeMain+0x40eb610>
 40f08ec: f9402274     	ldr	x20, [x19, #0x40]
 40f08f0: b4000bf4     	cbz	x20, 0x40f0a6c <_ChromeMain+0x40eb7d0>
 40f08f4: f9403e68     	ldr	x8, [x19, #0x78]
 40f08f8: f9001fe8     	str	x8, [sp, #0x38]
 40f08fc: 3dc02260     	ldr	q0, [x19, #0x80]
 40f0900: a907fe7f     	stp	xzr, xzr, [x19, #0x78]
 40f0904: f900467f     	str	xzr, [x19, #0x88]
 40f0908: 3c8403e0     	stur	q0, [sp, #0x40]
 40f090c: f00570e8     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
 40f0910: f946f500     	ldr	x0, [x8, #0xde8]
 40f0914: b4000b20     	cbz	x0, 0x40f0a78 <_ChromeMain+0x40eb7dc>
 40f0918: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 40f091c: f9001bff     	str	xzr, [sp, #0x30]
 40f0920: 910083e8     	add	x8, sp, #0x20
 40f0924: 5292ba81     	mov	w1, #0x95d4             ; =38356
 40f0928: 97470f6d     	bl	0x12b46dc <_ChromeMain+0x12af440>
 40f092c: 9100e3f5     	add	x21, sp, #0x38
 40f0930: 9100e3e1     	add	x1, sp, #0x38
 40f0934: 910083e2     	add	x2, sp, #0x20
 40f0938: aa1403e0     	mov	x0, x20
 40f093c: 94000f9c     	bl	0x40f47ac <_ChromeMain+0x40ef510>
 40f0940: aa0003f4     	mov	x20, x0
 40f0944: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 40f0948: 36f800a8     	tbz	w8, #0x1f, 0x40f095c <_ChromeMain+0x40eb6c0>
 40f094c: f94013e0     	ldr	x0, [sp, #0x20]
 40f0950: f9401be8     	ldr	x8, [sp, #0x30]
 40f0954: d37ff901     	lsl	x1, x8, #1
 40f0958: 96fc6158     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f095c: f90013f5     	str	x21, [sp, #0x20]
 40f0960: 910083e0     	add	x0, sp, #0x20
 40f0964: 94d95ca5     	bl	0x7747bf8 <_ChromeMain+0x774295c>
 40f0968: f9402660     	ldr	x0, [x19, #0x48]
 40f096c: b40008c0     	cbz	x0, 0x40f0a84 <_ChromeMain+0x40eb7e8>
 40f0970: f9404a68     	ldr	x8, [x19, #0x90]
 40f0974: f90007e8     	str	x8, [sp, #0x8]
 40f0978: 3cc98260     	ldur	q0, [x19, #0x98]
 40f097c: a9097e7f     	stp	xzr, xzr, [x19, #0x90]
 40f0980: f900527f     	str	xzr, [x19, #0xa0]
 40f0984: 3c8103e0     	stur	q0, [sp, #0x10]
 40f0988: 910023f6     	add	x22, sp, #0x8
 40f098c: 910023e1     	add	x1, sp, #0x8
 40f0990: 940011f8     	bl	0x40f5170 <_ChromeMain+0x40efed4>
 40f0994: aa0003f5     	mov	x21, x0
 40f0998: f90013f6     	str	x22, [sp, #0x20]
 40f099c: 910083e0     	add	x0, sp, #0x20
 40f09a0: 94d95c96     	bl	0x7747bf8 <_ChromeMain+0x774295c>
 40f09a4: 91032260     	add	x0, x19, #0xc8
 40f09a8: aa1403e1     	mov	x1, x20
 40f09ac: 940013ba     	bl	0x40f5894 <_ChromeMain+0x40f05f8>
 40f09b0: 9108a260     	add	x0, x19, #0x228
 40f09b4: aa1503e1     	mov	x1, x21
 40f09b8: 940013b7     	bl	0x40f5894 <_ChromeMain+0x40f05f8>
 40f09bc: 91032260     	add	x0, x19, #0xc8
 40f09c0: 52800041     	mov	w1, #0x2                ; =2
 40f09c4: 940012a7     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f09c8: 9108a260     	add	x0, x19, #0x228
 40f09cc: 52800041     	mov	w1, #0x2                ; =2
 40f09d0: 940012a4     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f09d4: f9401660     	ldr	x0, [x19, #0x28]
 40f09d8: b40005c0     	cbz	x0, 0x40f0a90 <_ChromeMain+0x40eb7f4>
 40f09dc: f9400008     	ldr	x8, [x0]
 40f09e0: f9401d08     	ldr	x8, [x8, #0x38]
 40f09e4: 8b1402a1     	add	x1, x21, x20
 40f09e8: d63f0100     	blr	x8
 40f09ec: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 40f09f0: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 40f09f4: a94757f6     	ldp	x22, x21, [sp, #0x70]
 40f09f8: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 40f09fc: a94567fa     	ldp	x26, x25, [sp, #0x50]
 40f0a00: 910283ff     	add	sp, sp, #0xa0
 40f0a04: d65f03c0     	ret
 40f0a08: eb1902df     	cmp	x22, x25
 40f0a0c: 54fff4a1     	b.ne	0x40f08a0 <_ChromeMain+0x40eb604>
 40f0a10: eb17031f     	cmp	x24, x23
 40f0a14: 54fff6c0     	b.eq	0x40f08ec <_ChromeMain+0x40eb650>
 40f0a18: d0046f81     	adrp	x1, 0xcee2000 <dyld_stub_binder+0xcee2000>
 40f0a1c: 910ab421     	add	x1, x1, #0x2ad
 40f0a20: aa1403e0     	mov	x0, x20
 40f0a24: 52800322     	mov	w2, #0x19               ; =25
 40f0a28: 970856b6     	bl	0x306500 <_ChromeMain+0x301264>
 40f0a2c: 3707f600     	tbnz	w0, #0x0, 0x40f08ec <_ChromeMain+0x40eb650>
 40f0a30: f9401660     	ldr	x0, [x19, #0x28]
 40f0a34: b4000340     	cbz	x0, 0x40f0a9c <_ChromeMain+0x40eb800>
 40f0a38: f9400008     	ldr	x8, [x0]
 40f0a3c: f9401d02     	ldr	x2, [x8, #0x38]
 40f0a40: d2800001     	mov	x1, #0x0                ; =0
 40f0a44: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 40f0a48: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 40f0a4c: a94757f6     	ldp	x22, x21, [sp, #0x70]
 40f0a50: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 40f0a54: a94567fa     	ldp	x26, x25, [sp, #0x50]
 40f0a58: 910283ff     	add	sp, sp, #0xa0
 40f0a5c: d61f0040     	br	x2
 40f0a60: d4200000     	brk	#0
 40f0a64: d4400000     	hlt	#0
 40f0a68: d4200020     	brk	#0x1
 40f0a6c: d4200000     	brk	#0
 40f0a70: d4400000     	hlt	#0
 40f0a74: d4200020     	brk	#0x1
 40f0a78: d4200000     	brk	#0
 40f0a7c: d4400000     	hlt	#0
 40f0a80: d4200020     	brk	#0x1
 40f0a84: d4200000     	brk	#0
 40f0a88: d4400000     	hlt	#0
 40f0a8c: d4200020     	brk	#0x1
 40f0a90: d4200000     	brk	#0
 40f0a94: d4400000     	hlt	#0
 40f0a98: d4200020     	brk	#0x1
 40f0a9c: d4200000     	brk	#0
 40f0aa0: d4400000     	hlt	#0
 40f0aa4: d4200020     	brk	#0x1
 40f0aa8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 40f0aac: a9017bfd     	stp	x29, x30, [sp, #0x10]
 40f0ab0: 910043fd     	add	x29, sp, #0x10
 40f0ab4: aa0003f3     	mov	x19, x0
 40f0ab8: f9415001     	ldr	x1, [x0, #0x2a0]
 40f0abc: 91048000     	add	x0, x0, #0x120
 40f0ac0: 94001375     	bl	0x40f5894 <_ChromeMain+0x40f05f8>
 40f0ac4: 91048260     	add	x0, x19, #0x120
 40f0ac8: 52800041     	mov	w1, #0x2                ; =2
 40f0acc: 94001265     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f0ad0: f9401660     	ldr	x0, [x19, #0x28]
 40f0ad4: b40000e0     	cbz	x0, 0x40f0af0 <_ChromeMain+0x40eb854>
 40f0ad8: f9415261     	ldr	x1, [x19, #0x2a0]
 40f0adc: f9400008     	ldr	x8, [x0]
 40f0ae0: f9402102     	ldr	x2, [x8, #0x40]
 40f0ae4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 40f0ae8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 40f0aec: d61f0040     	br	x2
 40f0af0: d4200000     	brk	#0
 40f0af4: d4400000     	hlt	#0
 40f0af8: d4200020     	brk	#0x1
 40f0afc: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 40f0b00: a9017bfd     	stp	x29, x30, [sp, #0x10]
 40f0b04: 910043fd     	add	x29, sp, #0x10
 40f0b08: aa0003f3     	mov	x19, x0
 40f0b0c: 91048000     	add	x0, x0, #0x120
 40f0b10: 52800021     	mov	w1, #0x1                ; =1
 40f0b14: 94001253     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f0b18: f9415261     	ldr	x1, [x19, #0x2a0]
 40f0b1c: 91048260     	add	x0, x19, #0x120
 40f0b20: 9400135d     	bl	0x40f5894 <_ChromeMain+0x40f05f8>
 40f0b24: f9401660     	ldr	x0, [x19, #0x28]
 40f0b28: b40000e0     	cbz	x0, 0x40f0b44 <_ChromeMain+0x40eb8a8>
 40f0b2c: f9415261     	ldr	x1, [x19, #0x2a0]
 40f0b30: f9400008     	ldr	x8, [x0]
 40f0b34: f9402102     	ldr	x2, [x8, #0x40]
 40f0b38: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 40f0b3c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 40f0b40: d61f0040     	br	x2
 40f0b44: d4200000     	brk	#0
 40f0b48: d4400000     	hlt	#0
 40f0b4c: d4200020     	brk	#0x1
 40f0b50: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 40f0b54: a9017bfd     	stp	x29, x30, [sp, #0x10]
 40f0b58: 910043fd     	add	x29, sp, #0x10
 40f0b5c: aa0103f3     	mov	x19, x1
 40f0b60: 39404008     	ldrb	w8, [x0, #0x10]
 40f0b64: 360001e8     	tbz	w8, #0x0, 0x40f0ba0 <_ChromeMain+0x40eb904>
 40f0b68: aa0003f4     	mov	x20, x0
 40f0b6c: f9400400     	ldr	x0, [x0, #0x8]
 40f0b70: aa1303e1     	mov	x1, x19
 40f0b74: 94283b7e     	bl	0x4aff96c <_ChromeMain+0x4afa6d0>
 40f0b78: 39404288     	ldrb	w8, [x20, #0x10]
 40f0b7c: 340000c8     	cbz	w8, 0x40f0b94 <_ChromeMain+0x40eb8f8>
 40f0b80: f8408288     	ldur	x8, [x20, #0x8]
 40f0b84: b4000068     	cbz	x8, 0x40f0b90 <_ChromeMain+0x40eb8f4>
 40f0b88: 91002280     	add	x0, x20, #0x8
 40f0b8c: 942837ce     	bl	0x4afeac4 <_ChromeMain+0x4af9828>
 40f0b90: 3900429f     	strb	wzr, [x20, #0x10]
 40f0b94: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 40f0b98: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 40f0b9c: d65f03c0     	ret
 40f0ba0: f9400e74     	ldr	x20, [x19, #0x18]
 40f0ba4: b40005b4     	cbz	x20, 0x40f0c58 <_ChromeMain+0x40eb9bc>
 40f0ba8: f9000e7f     	str	xzr, [x19, #0x18]
 40f0bac: f9400688     	ldr	x8, [x20, #0x8]
 40f0bb0: aa1403e0     	mov	x0, x20
 40f0bb4: d63f0100     	blr	x8
 40f0bb8: 12800008     	mov	w8, #-0x1               ; =-1
 40f0bbc: b8e80288     	ldaddal	w8, w8, [x20]
 40f0bc0: 7100051f     	cmp	w8, #0x1
 40f0bc4: 54000081     	b.ne	0x40f0bd4 <_ChromeMain+0x40eb938>
 40f0bc8: f9400a88     	ldr	x8, [x20, #0x10]
 40f0bcc: aa1403e0     	mov	x0, x20
 40f0bd0: d63f0100     	blr	x8
 40f0bd4: b4fffe13     	cbz	x19, 0x40f0b94 <_ChromeMain+0x40eb8f8>
 40f0bd8: f9400e60     	ldr	x0, [x19, #0x18]
 40f0bdc: b5000300     	cbnz	x0, 0x40f0c3c <_ChromeMain+0x40eb9a0>
 40f0be0: f9400a60     	ldr	x0, [x19, #0x10]
 40f0be4: b50001e0     	cbnz	x0, 0x40f0c20 <_ChromeMain+0x40eb984>
 40f0be8: f9400660     	ldr	x0, [x19, #0x8]
 40f0bec: b50000c0     	cbnz	x0, 0x40f0c04 <_ChromeMain+0x40eb968>
 40f0bf0: aa1303e0     	mov	x0, x19
 40f0bf4: 52800401     	mov	w1, #0x20               ; =32
 40f0bf8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 40f0bfc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 40f0c00: 16fc60ae     	b	0x8eb8 <_ChromeMain+0x3c1c>
 40f0c04: 12800008     	mov	w8, #-0x1               ; =-1
 40f0c08: b8e80008     	ldaddal	w8, w8, [x0]
 40f0c0c: 7100051f     	cmp	w8, #0x1
 40f0c10: 54ffff01     	b.ne	0x40f0bf0 <_ChromeMain+0x40eb954>
 40f0c14: f9400808     	ldr	x8, [x0, #0x10]
 40f0c18: d63f0100     	blr	x8
 40f0c1c: 17fffff5     	b	0x40f0bf0 <_ChromeMain+0x40eb954>
 40f0c20: 12800008     	mov	w8, #-0x1               ; =-1
 40f0c24: b8e80008     	ldaddal	w8, w8, [x0]
 40f0c28: 7100051f     	cmp	w8, #0x1
 40f0c2c: 54fffde1     	b.ne	0x40f0be8 <_ChromeMain+0x40eb94c>
 40f0c30: f9400808     	ldr	x8, [x0, #0x10]
 40f0c34: d63f0100     	blr	x8
 40f0c38: 17ffffec     	b	0x40f0be8 <_ChromeMain+0x40eb94c>
 40f0c3c: 12800008     	mov	w8, #-0x1               ; =-1
 40f0c40: b8e80008     	ldaddal	w8, w8, [x0]
 40f0c44: 7100051f     	cmp	w8, #0x1
 40f0c48: 54fffcc1     	b.ne	0x40f0be0 <_ChromeMain+0x40eb944>
 40f0c4c: f9400808     	ldr	x8, [x0, #0x10]
 40f0c50: d63f0100     	blr	x8
 40f0c54: 17ffffe3     	b	0x40f0be0 <_ChromeMain+0x40eb944>
 40f0c58: d4200000     	brk	#0
 40f0c5c: d4400000     	hlt	#0
 40f0c60: d4200020     	brk	#0x1
 40f0c64: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 40f0c68: a9017bfd     	stp	x29, x30, [sp, #0x10]
 40f0c6c: 910043fd     	add	x29, sp, #0x10
 40f0c70: aa0103f3     	mov	x19, x1
 40f0c74: aa0003f4     	mov	x20, x0
 40f0c78: f9400421     	ldr	x1, [x1, #0x8]
 40f0c7c: 9105e000     	add	x0, x0, #0x178
 40f0c80: 94001305     	bl	0x40f5894 <_ChromeMain+0x40f05f8>
 40f0c84: b9400268     	ldr	w8, [x19]
 40f0c88: 7100091f     	cmp	w8, #0x2
 40f0c8c: 52800028     	mov	w8, #0x1                ; =1
 40f0c90: 1a881501     	cinc	w1, w8, eq
 40f0c94: 9105e280     	add	x0, x20, #0x178
 40f0c98: 940011f2     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f0c9c: f9401680     	ldr	x0, [x20, #0x28]
 40f0ca0: b40000e0     	cbz	x0, 0x40f0cbc <_ChromeMain+0x40eba20>
 40f0ca4: f9400008     	ldr	x8, [x0]
 40f0ca8: f9402502     	ldr	x2, [x8, #0x48]
 40f0cac: aa1303e1     	mov	x1, x19
 40f0cb0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 40f0cb4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 40f0cb8: d61f0040     	br	x2
 40f0cbc: d4200000     	brk	#0
 40f0cc0: d4400000     	hlt	#0
 40f0cc4: d4200020     	brk	#0x1
 40f0cc8: d101c3ff     	sub	sp, sp, #0x70
 40f0ccc: a90267fa     	stp	x26, x25, [sp, #0x20]
 40f0cd0: a9035ff8     	stp	x24, x23, [sp, #0x30]
 40f0cd4: a90457f6     	stp	x22, x21, [sp, #0x40]
 40f0cd8: a9054ff4     	stp	x20, x19, [sp, #0x50]
 40f0cdc: a9067bfd     	stp	x29, x30, [sp, #0x60]
 40f0ce0: 910183fd     	add	x29, sp, #0x60
 40f0ce4: aa0003f3     	mov	x19, x0
 40f0ce8: f9402c14     	ldr	x20, [x0, #0x58]
 40f0cec: b0046f61     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 40f0cf0: 91157821     	add	x1, x1, #0x55e
 40f0cf4: aa1403e0     	mov	x0, x20
 40f0cf8: 52800382     	mov	w2, #0x1c               ; =28
 40f0cfc: 970f2fd4     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 40f0d00: b4000580     	cbz	x0, 0x40f0db0 <_ChromeMain+0x40ebb14>
 40f0d04: aa0003e8     	mov	x8, x0
 40f0d08: f9401009     	ldr	x9, [x0, #0x20]
 40f0d0c: b4001149     	cbz	x9, 0x40f0f34 <_ChromeMain+0x40ebc98>
 40f0d10: f9400929     	ldr	x9, [x9, #0x10]
 40f0d14: f90007ff     	str	xzr, [sp, #0x8]
 40f0d18: f9401520     	ldr	x0, [x9, #0x28]
 40f0d1c: b40004a0     	cbz	x0, 0x40f0db0 <_ChromeMain+0x40ebb14>
 40f0d20: 39805d09     	ldrsb	x9, [x8, #0x17]
 40f0d24: a9402d0a     	ldp	x10, x11, [x8]
 40f0d28: f100013f     	cmp	x9, #0x0
 40f0d2c: 9a884155     	csel	x21, x10, x8, mi
 40f0d30: 7100013f     	cmp	w9, #0x0
 40f0d34: 9a894176     	csel	x22, x11, x9, mi
 40f0d38: f9400008     	ldr	x8, [x0]
 40f0d3c: f9401108     	ldr	x8, [x8, #0x20]
 40f0d40: 90fdfda9     	adrp	x9, 0xa4000 <_ChromeMain+0x9ed64>
 40f0d44: 91177129     	add	x9, x9, #0x5dc
 40f0d48: eb09011f     	cmp	x8, x9
 40f0d4c: 54000e81     	b.ne	0x40f0f1c <_ChromeMain+0x40ebc80>
 40f0d50: f9402417     	ldr	x23, [x0, #0x48]
 40f0d54: b40002f7     	cbz	x23, 0x40f0db0 <_ChromeMain+0x40ebb14>
 40f0d58: f8410ef8     	ldr	x24, [x23, #0x10]!
 40f0d5c: b40002b8     	cbz	x24, 0x40f0db0 <_ChromeMain+0x40ebb14>
 40f0d60: 14000004     	b	0x40f0d70 <_ChromeMain+0x40ebad4>
 40f0d64: 54000223     	b.lo	0x40f0da8 <_ChromeMain+0x40ebb0c>
 40f0d68: f9400718     	ldr	x24, [x24, #0x8]
 40f0d6c: b4000238     	cbz	x24, 0x40f0db0 <_ChromeMain+0x40ebb14>
 40f0d70: aa1803e8     	mov	x8, x24
 40f0d74: f8420d09     	ldr	x9, [x8, #0x20]!
 40f0d78: 39805d0a     	ldrsb	x10, [x8, #0x17]
 40f0d7c: f100015f     	cmp	x10, #0x0
 40f0d80: 9a884121     	csel	x1, x9, x8, mi
 40f0d84: f9400508     	ldr	x8, [x8, #0x8]
 40f0d88: 7100015f     	cmp	w10, #0x0
 40f0d8c: 9a8a4119     	csel	x25, x8, x10, mi
 40f0d90: eb16033f     	cmp	x25, x22
 40f0d94: 9a963322     	csel	x2, x25, x22, lo
 40f0d98: aa1503e0     	mov	x0, x21
 40f0d9c: 94fc62b1     	bl	0x8009860 <_ChromeMain+0x80045c4>
 40f0da0: 340001a0     	cbz	w0, 0x40f0dd4 <_ChromeMain+0x40ebb38>
 40f0da4: 36fffe20     	tbz	w0, #0x1f, 0x40f0d68 <_ChromeMain+0x40ebacc>
 40f0da8: f9400318     	ldr	x24, [x24]
 40f0dac: b5fffe38     	cbnz	x24, 0x40f0d70 <_ChromeMain+0x40ebad4>
 40f0db0: f9403668     	ldr	x8, [x19, #0x68]
 40f0db4: b4000248     	cbz	x8, 0x40f0dfc <_ChromeMain+0x40ebb60>
 40f0db8: 52805709     	mov	w9, #0x2b8              ; =696
 40f0dbc: d2800014     	mov	x20, #0x0               ; =0
 40f0dc0: 9b097d16     	mul	x22, x8, x9
 40f0dc4: b4000876     	cbz	x22, 0x40f0ed0 <_ChromeMain+0x40ebc34>
 40f0dc8: f9403268     	ldr	x8, [x19, #0x60]
 40f0dcc: 9100a117     	add	x23, x8, #0x28
 40f0dd0: 14000027     	b	0x40f0e6c <_ChromeMain+0x40ebbd0>
 40f0dd4: eb1902df     	cmp	x22, x25
 40f0dd8: 54fffc61     	b.ne	0x40f0d64 <_ChromeMain+0x40ebac8>
 40f0ddc: eb17031f     	cmp	x24, x23
 40f0de0: 54fffe80     	b.eq	0x40f0db0 <_ChromeMain+0x40ebb14>
 40f0de4: b0046f61     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 40f0de8: 91157821     	add	x1, x1, #0x55e
 40f0dec: aa1403e0     	mov	x0, x20
 40f0df0: 52800382     	mov	w2, #0x1c               ; =28
 40f0df4: 970855c3     	bl	0x306500 <_ChromeMain+0x301264>
 40f0df8: 35fffdc0     	cbnz	w0, 0x40f0db0 <_ChromeMain+0x40ebb14>
 40f0dfc: f9401660     	ldr	x0, [x19, #0x28]
 40f0e00: b4000ac0     	cbz	x0, 0x40f0f58 <_ChromeMain+0x40ebcbc>
 40f0e04: f9400008     	ldr	x8, [x0]
 40f0e08: f9402902     	ldr	x2, [x8, #0x50]
 40f0e0c: d2800001     	mov	x1, #0x0                ; =0
 40f0e10: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 40f0e14: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 40f0e18: a94457f6     	ldp	x22, x21, [sp, #0x40]
 40f0e1c: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 40f0e20: a94267fa     	ldp	x26, x25, [sp, #0x20]
 40f0e24: 9101c3ff     	add	sp, sp, #0x70
 40f0e28: d61f0040     	br	x2
 40f0e2c: f94007e0     	ldr	x0, [sp, #0x8]
 40f0e30: f9400fe8     	ldr	x8, [sp, #0x18]
 40f0e34: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f0e38: 96fc6020     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f0e3c: b50003b5     	cbnz	x21, 0x40f0eb0 <_ChromeMain+0x40ebc14>
 40f0e40: f9401a60     	ldr	x0, [x19, #0x30]
 40f0e44: b4000900     	cbz	x0, 0x40f0f64 <_ChromeMain+0x40ebcc8>
 40f0e48: 52801508     	mov	w8, #0xa8               ; =168
 40f0e4c: f9400009     	ldr	x9, [x0]
 40f0e50: f8686928     	ldr	x8, [x9, x8]
 40f0e54: d100a2e1     	sub	x1, x23, #0x28
 40f0e58: d63f0100     	blr	x8
 40f0e5c: 91000694     	add	x20, x20, #0x1
 40f0e60: 910ae2f7     	add	x23, x23, #0x2b8
 40f0e64: f10ae2d6     	subs	x22, x22, #0x2b8
 40f0e68: 54000340     	b.eq	0x40f0ed0 <_ChromeMain+0x40ebc34>
 40f0e6c: d100a2e0     	sub	x0, x23, #0x28
 40f0e70: 9588d315     	bl	0xa325ac4 <_ChromeMain+0xa320828>
 40f0e74: 34ffff60     	cbz	w0, 0x40f0e60 <_ChromeMain+0x40ebbc4>
 40f0e78: f9401a75     	ldr	x21, [x19, #0x30]
 40f0e7c: b4000695     	cbz	x21, 0x40f0f4c <_ChromeMain+0x40ebcb0>
 40f0e80: 39805ee1     	ldrsb	x1, [x23, #0x17]
 40f0e84: b7f80221     	tbnz	x1, #0x3f, 0x40f0ec8 <_ChromeMain+0x40ebc2c>
 40f0e88: aa1703e0     	mov	x0, x23
 40f0e8c: 910023e8     	add	x8, sp, #0x8
 40f0e90: 973ac79e     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 40f0e94: 910023e1     	add	x1, sp, #0x8
 40f0e98: aa1503e0     	mov	x0, x21
 40f0e9c: 940b2444     	bl	0x43b9fac <_ChromeMain+0x43b4d10>
 40f0ea0: aa0003f5     	mov	x21, x0
 40f0ea4: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 40f0ea8: 37fffc28     	tbnz	w8, #0x1f, 0x40f0e2c <_ChromeMain+0x40ebb90>
 40f0eac: b4fffcb5     	cbz	x21, 0x40f0e40 <_ChromeMain+0x40ebba4>
 40f0eb0: b94026a8     	ldr	w8, [x21, #0x24]
 40f0eb4: 35fffc68     	cbnz	w8, 0x40f0e40 <_ChromeMain+0x40ebba4>
 40f0eb8: f9401a60     	ldr	x0, [x19, #0x30]
 40f0ebc: b40005a0     	cbz	x0, 0x40f0f70 <_ChromeMain+0x40ebcd4>
 40f0ec0: 52801708     	mov	w8, #0xb8               ; =184
 40f0ec4: 17ffffe2     	b	0x40f0e4c <_ChromeMain+0x40ebbb0>
 40f0ec8: a94006e0     	ldp	x0, x1, [x23]
 40f0ecc: 17fffff0     	b	0x40f0e8c <_ChromeMain+0x40ebbf0>
 40f0ed0: 91074260     	add	x0, x19, #0x1d0
 40f0ed4: aa1403e1     	mov	x1, x20
 40f0ed8: 9400126f     	bl	0x40f5894 <_ChromeMain+0x40f05f8>
 40f0edc: 91074260     	add	x0, x19, #0x1d0
 40f0ee0: 52800041     	mov	w1, #0x2                ; =2
 40f0ee4: 9400115f     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f0ee8: f9401660     	ldr	x0, [x19, #0x28]
 40f0eec: b40002a0     	cbz	x0, 0x40f0f40 <_ChromeMain+0x40ebca4>
 40f0ef0: f9400008     	ldr	x8, [x0]
 40f0ef4: f9402908     	ldr	x8, [x8, #0x50]
 40f0ef8: aa1403e1     	mov	x1, x20
 40f0efc: d63f0100     	blr	x8
 40f0f00: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 40f0f04: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 40f0f08: a94457f6     	ldp	x22, x21, [sp, #0x40]
 40f0f0c: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 40f0f10: a94267fa     	ldp	x26, x25, [sp, #0x20]
 40f0f14: 9101c3ff     	add	sp, sp, #0x70
 40f0f18: d65f03c0     	ret
 40f0f1c: 910023e3     	add	x3, sp, #0x8
 40f0f20: aa1503e1     	mov	x1, x21
 40f0f24: aa1603e2     	mov	x2, x22
 40f0f28: d63f0100     	blr	x8
 40f0f2c: 3707f5c0     	tbnz	w0, #0x0, 0x40f0de4 <_ChromeMain+0x40ebb48>
 40f0f30: 17ffffa0     	b	0x40f0db0 <_ChromeMain+0x40ebb14>
 40f0f34: d4200000     	brk	#0
 40f0f38: d4400000     	hlt	#0
 40f0f3c: d4200020     	brk	#0x1
 40f0f40: d4200000     	brk	#0
 40f0f44: d4400000     	hlt	#0
 40f0f48: d4200020     	brk	#0x1
 40f0f4c: d4200000     	brk	#0
 40f0f50: d4400000     	hlt	#0
 40f0f54: d4200020     	brk	#0x1
 40f0f58: d4200000     	brk	#0
 40f0f5c: d4400000     	hlt	#0
 40f0f60: d4200020     	brk	#0x1
 40f0f64: d4200000     	brk	#0
 40f0f68: d4400000     	hlt	#0
 40f0f6c: d4200020     	brk	#0x1
 40f0f70: d4200000     	brk	#0
 40f0f74: d4400000     	hlt	#0
 40f0f78: d4200020     	brk	#0x1
 40f0f7c: d101c3ff     	sub	sp, sp, #0x70
 40f0f80: a90267fa     	stp	x26, x25, [sp, #0x20]
 40f0f84: a9035ff8     	stp	x24, x23, [sp, #0x30]
 40f0f88: a90457f6     	stp	x22, x21, [sp, #0x40]
 40f0f8c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 40f0f90: a9067bfd     	stp	x29, x30, [sp, #0x60]
 40f0f94: 910183fd     	add	x29, sp, #0x60
 40f0f98: aa0003f5     	mov	x21, x0
 40f0f9c: 91002013     	add	x19, x0, #0x8
 40f0fa0: b004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40f0fa4: 91321800     	add	x0, x0, #0xc86
 40f0fa8: b004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40f0fac: 91309421     	add	x1, x1, #0xc25
 40f0fb0: 910003f4     	mov	x20, sp
 40f0fb4: 910003e8     	mov	x8, sp
 40f0fb8: 52803502     	mov	w2, #0x1a8              ; =424
 40f0fbc: 96fd7f31     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40f0fc0: d0055617     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40f0fc4: f94046e8     	ldr	x8, [x23, #0x88]
 40f0fc8: 925e7676     	and	x22, x19, #0xfffffffc00000000
 40f0fcc: eb0802df     	cmp	x22, x8
 40f0fd0: 54000081     	b.ne	0x40f0fe0 <_ChromeMain+0x40ebd44>
 40f0fd4: 910022a0     	add	x0, x21, #0x8
 40f0fd8: 96fc8cc9     	bl	0x142fc <_ChromeMain+0xf060>
 40f0fdc: f94046e8     	ldr	x8, [x23, #0x88]
 40f0fe0: 925e7698     	and	x24, x20, #0xfffffffc00000000
 40f0fe4: eb08031f     	cmp	x24, x8
 40f0fe8: 54000061     	b.ne	0x40f0ff4 <_ChromeMain+0x40ebd58>
 40f0fec: 910003e0     	mov	x0, sp
 40f0ff0: 96fc8cc3     	bl	0x142fc <_ChromeMain+0xf060>
 40f0ff4: b4000553     	cbz	x19, 0x40f109c <_ChromeMain+0x40ebe00>
 40f0ff8: f9400eb4     	ldr	x20, [x21, #0x18]
 40f0ffc: f94006b5     	ldr	x21, [x21, #0x8]
 40f1000: 925e76b9     	and	x25, x21, #0xfffffffc00000000
 40f1004: f94046e8     	ldr	x8, [x23, #0x88]
 40f1008: eb08033f     	cmp	x25, x8
 40f100c: 54000061     	b.ne	0x40f1018 <_ChromeMain+0x40ebd7c>
 40f1010: aa1503e0     	mov	x0, x21
 40f1014: 96fc8cba     	bl	0x142fc <_ChromeMain+0xf060>
 40f1018: f94046e8     	ldr	x8, [x23, #0x88]
 40f101c: eb08033f     	cmp	x25, x8
 40f1020: 54000061     	b.ne	0x40f102c <_ChromeMain+0x40ebd90>
 40f1024: aa1503e0     	mov	x0, x21
 40f1028: 96fc8cb5     	bl	0x142fc <_ChromeMain+0xf060>
 40f102c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 40f1030: f94046e9     	ldr	x9, [x23, #0x88]
 40f1034: eb09011f     	cmp	x8, x9
 40f1038: 54000061     	b.ne	0x40f1044 <_ChromeMain+0x40ebda8>
 40f103c: aa1503e0     	mov	x0, x21
 40f1040: 96fcc67f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f1044: 52800700     	mov	w0, #0x38               ; =56
 40f1048: 96fc78c8     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f104c: aa0003e2     	mov	x2, x0
 40f1050: 52800028     	mov	w8, #0x1                ; =1
 40f1054: b9000008     	str	w8, [x0]
 40f1058: f0fff3c8     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40f105c: 91270108     	add	x8, x8, #0x9c0
 40f1060: f0fece89     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 40f1064: 91180129     	add	x9, x9, #0x600
 40f1068: a900a408     	stp	x8, x9, [x0, #0x8]
 40f106c: 90ff2368     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 40f1070: 912c0108     	add	x8, x8, #0xb00
 40f1074: 10000369     	adr	x9, 0x40f10e0 <_ChromeMain+0x40ebe44>
 40f1078: d503201f     	nop
 40f107c: a901a408     	stp	x8, x9, [x0, #0x18]
 40f1080: a902d41f     	stp	xzr, x21, [x0, #0x28]
 40f1084: f9400288     	ldr	x8, [x20]
 40f1088: f9400108     	ldr	x8, [x8]
 40f108c: 910003e1     	mov	x1, sp
 40f1090: aa1403e0     	mov	x0, x20
 40f1094: d2800003     	mov	x3, #0x0                ; =0
 40f1098: d63f0100     	blr	x8
 40f109c: f94046e8     	ldr	x8, [x23, #0x88]
 40f10a0: eb08031f     	cmp	x24, x8
 40f10a4: 54000081     	b.ne	0x40f10b4 <_ChromeMain+0x40ebe18>
 40f10a8: 910003e0     	mov	x0, sp
 40f10ac: 96fcc664     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f10b0: f94046e8     	ldr	x8, [x23, #0x88]
 40f10b4: eb0802df     	cmp	x22, x8
 40f10b8: 54000061     	b.ne	0x40f10c4 <_ChromeMain+0x40ebe28>
 40f10bc: aa1303e0     	mov	x0, x19
 40f10c0: 96fcc65f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f10c4: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 40f10c8: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 40f10cc: a94457f6     	ldp	x22, x21, [sp, #0x40]
 40f10d0: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 40f10d4: a94267fa     	ldp	x26, x25, [sp, #0x20]
 40f10d8: 9101c3ff     	add	sp, sp, #0x70
 40f10dc: d65f03c0     	ret
 40f10e0: 39404008     	ldrb	w8, [x0, #0x10]
 40f10e4: 34000188     	cbz	w8, 0x40f1114 <_ChromeMain+0x40ebe78>
 40f10e8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 40f10ec: a9017bfd     	stp	x29, x30, [sp, #0x10]
 40f10f0: 910043fd     	add	x29, sp, #0x10
 40f10f4: aa0003f3     	mov	x19, x0
 40f10f8: f8408008     	ldur	x8, [x0, #0x8]
 40f10fc: b4000068     	cbz	x8, 0x40f1108 <_ChromeMain+0x40ebe6c>
 40f1100: 91002260     	add	x0, x19, #0x8
 40f1104: 94283670     	bl	0x4afeac4 <_ChromeMain+0x4af9828>
 40f1108: 3900427f     	strb	wzr, [x19, #0x10]
 40f110c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 40f1110: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 40f1114: d65f03c0     	ret
 40f1118: d10103ff     	sub	sp, sp, #0x40
 40f111c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 40f1120: a9037bfd     	stp	x29, x30, [sp, #0x30]
 40f1124: 9100c3fd     	add	x29, sp, #0x30
 40f1128: aa0803f3     	mov	x19, x8
 40f112c: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 40f1130: f9000fff     	str	xzr, [sp, #0x18]
 40f1134: 39404008     	ldrb	w8, [x0, #0x10]
 40f1138: 36000148     	tbz	w8, #0x0, 0x40f1160 <_ChromeMain+0x40ebec4>
 40f113c: f9400400     	ldr	x0, [x0, #0x8]
 40f1140: 910023e2     	add	x2, sp, #0x8
 40f1144: 94283c50     	bl	0x4b00284 <_ChromeMain+0x4afafe8>
 40f1148: 34000180     	cbz	w0, 0x40f1178 <_ChromeMain+0x40ebedc>
 40f114c: 3cc083e0     	ldur	q0, [sp, #0x8]
 40f1150: 3d800260     	str	q0, [x19]
 40f1154: f9400fe8     	ldr	x8, [sp, #0x18]
 40f1158: f9000a68     	str	x8, [x19, #0x10]
 40f115c: 14000003     	b	0x40f1168 <_ChromeMain+0x40ebecc>
 40f1160: a9007e7f     	stp	xzr, xzr, [x19]
 40f1164: f9000a7f     	str	xzr, [x19, #0x10]
 40f1168: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 40f116c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 40f1170: 910103ff     	add	sp, sp, #0x40
 40f1174: d65f03c0     	ret
 40f1178: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 40f117c: a900fe7f     	stp	xzr, xzr, [x19, #0x8]
 40f1180: f900027f     	str	xzr, [x19]
 40f1184: 36ffff28     	tbz	w8, #0x1f, 0x40f1168 <_ChromeMain+0x40ebecc>
 40f1188: f94007e0     	ldr	x0, [sp, #0x8]
 40f118c: f9400fe8     	ldr	x8, [sp, #0x18]
 40f1190: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f1194: 96fc5f49     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f1198: 17fffff4     	b	0x40f1168 <_ChromeMain+0x40ebecc>
 40f119c: 39404008     	ldrb	w8, [x0, #0x10]
 40f11a0: 34000068     	cbz	w8, 0x40f11ac <_ChromeMain+0x40ebf10>
 40f11a4: f9400400     	ldr	x0, [x0, #0x8]
 40f11a8: 14283665     	b	0x4afeb3c <_ChromeMain+0x4af98a0>
 40f11ac: d2800000     	mov	x0, #0x0                ; =0
 40f11b0: d65f03c0     	ret
 40f11b4: d10203ff     	sub	sp, sp, #0x80
 40f11b8: a90557f6     	stp	x22, x21, [sp, #0x50]
 40f11bc: a9064ff4     	stp	x20, x19, [sp, #0x60]
 40f11c0: a9077bfd     	stp	x29, x30, [sp, #0x70]
 40f11c4: 9101c3fd     	add	x29, sp, #0x70
 40f11c8: aa0003f4     	mov	x20, x0
 40f11cc: aa0803f3     	mov	x19, x8
 40f11d0: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 40f11d4: f90027ff     	str	xzr, [sp, #0x48]
 40f11d8: 39404008     	ldrb	w8, [x0, #0x10]
 40f11dc: 36000308     	tbz	w8, #0x0, 0x40f123c <_ChromeMain+0x40ebfa0>
 40f11e0: f9400680     	ldr	x0, [x20, #0x8]
 40f11e4: 9100e3e2     	add	x2, sp, #0x38
 40f11e8: 52800001     	mov	w1, #0x0                ; =0
 40f11ec: 94283c26     	bl	0x4b00284 <_ChromeMain+0x4afafe8>
 40f11f0: 35000180     	cbnz	w0, 0x40f1220 <_ChromeMain+0x40ebf84>
 40f11f4: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 40f11f8: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 40f11fc: f90013ff     	str	xzr, [sp, #0x20]
 40f1200: 36f800a8     	tbz	w8, #0x1f, 0x40f1214 <_ChromeMain+0x40ebf78>
 40f1204: f9401fe0     	ldr	x0, [sp, #0x38]
 40f1208: f94027e8     	ldr	x8, [sp, #0x48]
 40f120c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f1210: 96fc5f2a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f1214: d2800008     	mov	x8, #0x0                ; =0
 40f1218: 52800016     	mov	w22, #0x0               ; =0
 40f121c: 1400000c     	b	0x40f124c <_ChromeMain+0x40ebfb0>
 40f1220: f94027e8     	ldr	x8, [sp, #0x48]
 40f1224: f9001be8     	str	x8, [sp, #0x30]
 40f1228: 3cc383e0     	ldur	q0, [sp, #0x38]
 40f122c: 3d800be0     	str	q0, [sp, #0x20]
 40f1230: d378fd16     	lsr	x22, x8, #56
 40f1234: f94017e8     	ldr	x8, [sp, #0x28]
 40f1238: 14000005     	b	0x40f124c <_ChromeMain+0x40ebfb0>
 40f123c: d2800008     	mov	x8, #0x0                ; =0
 40f1240: 52800016     	mov	w22, #0x0               ; =0
 40f1244: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 40f1248: f9001bff     	str	xzr, [sp, #0x30]
 40f124c: 2a1603e9     	mov	w9, w22
 40f1250: 721902df     	tst	w22, #0x80
 40f1254: 9a891115     	csel	x21, x8, x9, ne
 40f1258: b40002b5     	cbz	x21, 0x40f12ac <_ChromeMain+0x40ec010>
 40f125c: 52800300     	mov	w0, #0x18               ; =24
 40f1260: 96fc7842     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f1264: aa0003e2     	mov	x2, x0
 40f1268: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 40f126c: f900001f     	str	xzr, [x0]
 40f1270: f9400e80     	ldr	x0, [x20, #0x18]
 40f1274: f9000e82     	str	x2, [x20, #0x18]
 40f1278: b40000a0     	cbz	x0, 0x40f128c <_ChromeMain+0x40ebff0>
 40f127c: 97b6208d     	bl	0x2e794b0 <_ChromeMain+0x2e74214>
 40f1280: 52800301     	mov	w1, #0x18               ; =24
 40f1284: 96fc5f0d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f1288: f9400e82     	ldr	x2, [x20, #0x18]
 40f128c: 39805c48     	ldrsb	x8, [x2, #0x17]
 40f1290: b7f80988     	tbnz	x8, #0x3f, 0x40f13c0 <_ChromeMain+0x40ec124>
 40f1294: b50000c8     	cbnz	x8, 0x40f12ac <_ChromeMain+0x40ec010>
 40f1298: b0047ee0     	adrp	x0, 0xd0ce000 <dyld_stub_binder+0xd0ce000>
 40f129c: 91178c00     	add	x0, x0, #0x5e3
 40f12a0: 52800141     	mov	w1, #0xa                ; =10
 40f12a4: 97be5f8b     	bl	0x30890d0 <_ChromeMain+0x3083e34>
 40f12a8: 370002e0     	tbnz	w0, #0x0, 0x40f1304 <_ChromeMain+0x40ec068>
 40f12ac: 3900027f     	strb	wzr, [x19]
 40f12b0: 3900627f     	strb	wzr, [x19, #0x18]
 40f12b4: f900127f     	str	xzr, [x19, #0x20]
 40f12b8: 363800b6     	tbz	w22, #0x7, 0x40f12cc <_ChromeMain+0x40ec030>
 40f12bc: f94013e0     	ldr	x0, [sp, #0x20]
 40f12c0: f9401be8     	ldr	x8, [sp, #0x30]
 40f12c4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f12c8: 96fc5efc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f12cc: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 40f12d0: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 40f12d4: a94557f6     	ldp	x22, x21, [sp, #0x50]
 40f12d8: 910203ff     	add	sp, sp, #0x80
 40f12dc: d65f03c0     	ret
 40f12e0: d2800008     	mov	x8, #0x0                ; =0
 40f12e4: 3900027f     	strb	wzr, [x19]
 40f12e8: 3900627f     	strb	wzr, [x19, #0x18]
 40f12ec: f9001268     	str	x8, [x19, #0x20]
 40f12f0: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 40f12f4: 37f80528     	tbnz	w8, #0x1f, 0x40f1398 <_ChromeMain+0x40ec0fc>
 40f12f8: 3940dff6     	ldrb	w22, [sp, #0x37]
 40f12fc: 373ffe16     	tbnz	w22, #0x7, 0x40f12bc <_ChromeMain+0x40ec020>
 40f1300: 17fffff3     	b	0x40f12cc <_ChromeMain+0x40ec030>
 40f1304: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 40f1308: f90027ff     	str	xzr, [sp, #0x48]
 40f130c: f9400e80     	ldr	x0, [x20, #0x18]
 40f1310: d004cc21     	adrp	x1, 0xda77000 <dyld_stub_binder+0xda77000>
 40f1314: 91081821     	add	x1, x1, #0x206
 40f1318: 9100e3e8     	add	x8, sp, #0x38
 40f131c: 528001c2     	mov	w2, #0xe                ; =14
 40f1320: 9756a03d     	bl	0x1699414 <_ChromeMain+0x1694178>
 40f1324: f94013e8     	ldr	x8, [sp, #0x20]
 40f1328: 721902df     	tst	w22, #0x80
 40f132c: 910083e9     	add	x9, sp, #0x20
 40f1330: 9a891101     	csel	x1, x8, x9, ne
 40f1334: 9100e3e0     	add	x0, sp, #0x38
 40f1338: aa1503e2     	mov	x2, x21
 40f133c: 97826c21     	bl	0x218c3c0 <_ChromeMain+0x2187124>
 40f1340: 3607fd00     	tbz	w0, #0x0, 0x40f12e0 <_ChromeMain+0x40ec044>
 40f1344: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 40f1348: 37f80328     	tbnz	w8, #0x1f, 0x40f13ac <_ChromeMain+0x40ec110>
 40f134c: 3cc383e0     	ldur	q0, [sp, #0x38]
 40f1350: 3d8003e0     	str	q0, [sp]
 40f1354: f94027e8     	ldr	x8, [sp, #0x48]
 40f1358: f9000be8     	str	x8, [sp, #0x10]
 40f135c: 52800029     	mov	w9, #0x1                ; =1
 40f1360: 390063e9     	strb	w9, [sp, #0x18]
 40f1364: b40002d3     	cbz	x19, 0x40f13bc <_ChromeMain+0x40ec120>
 40f1368: f94017e8     	ldr	x8, [sp, #0x28]
 40f136c: 3940dfea     	ldrb	w10, [sp, #0x37]
 40f1370: 7219015f     	tst	w10, #0x80
 40f1374: 9a8a1108     	csel	x8, x8, x10, ne
 40f1378: 3dc003e0     	ldr	q0, [sp]
 40f137c: 3d800260     	str	q0, [x19]
 40f1380: f9400bea     	ldr	x10, [sp, #0x10]
 40f1384: f9000a6a     	str	x10, [x19, #0x10]
 40f1388: a9007fff     	stp	xzr, xzr, [sp]
 40f138c: f9000bff     	str	xzr, [sp, #0x10]
 40f1390: 39006269     	strb	w9, [x19, #0x18]
 40f1394: 17ffffd6     	b	0x40f12ec <_ChromeMain+0x40ec050>
 40f1398: f9401fe0     	ldr	x0, [sp, #0x38]
 40f139c: f94027e8     	ldr	x8, [sp, #0x48]
 40f13a0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f13a4: 96fc5ec5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f13a8: 17ffffd4     	b	0x40f12f8 <_ChromeMain+0x40ec05c>
 40f13ac: a9438be1     	ldp	x1, x2, [sp, #0x38]
 40f13b0: 910003e0     	mov	x0, sp
 40f13b4: 96fc9b99     	bl	0x18218 <_ChromeMain+0x12f7c>
 40f13b8: 17ffffe9     	b	0x40f135c <_ChromeMain+0x40ec0c0>
 40f13bc: d4200020     	brk	#0x1
 40f13c0: f9400448     	ldr	x8, [x2, #0x8]
 40f13c4: b4fff6a8     	cbz	x8, 0x40f1298 <_ChromeMain+0x40ebffc>
 40f13c8: 17ffffb9     	b	0x40f12ac <_ChromeMain+0x40ec010>
 40f13cc: 39406028     	ldrb	w8, [x1, #0x18]
 40f13d0: 36000068     	tbz	w8, #0x0, 0x40f13dc <_ChromeMain+0x40ec140>
 40f13d4: f9400000     	ldr	x0, [x0]
 40f13d8: 1405f2f3     	b	0x426dfa4 <_ChromeMain+0x4268d08>
 40f13dc: d4200020     	brk	#0x1
 40f13e0: d10183ff     	sub	sp, sp, #0x60
 40f13e4: a90357f6     	stp	x22, x21, [sp, #0x30]
 40f13e8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 40f13ec: a9057bfd     	stp	x29, x30, [sp, #0x50]
 40f13f0: 910143fd     	add	x29, sp, #0x50
 40f13f4: aa0803f3     	mov	x19, x8
 40f13f8: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 40f13fc: f90017ff     	str	xzr, [sp, #0x28]
 40f1400: 39404008     	ldrb	w8, [x0, #0x10]
 40f1404: 34000308     	cbz	w8, 0x40f1464 <_ChromeMain+0x40ec1c8>
 40f1408: aa0003f4     	mov	x20, x0
 40f140c: f9400400     	ldr	x0, [x0, #0x8]
 40f1410: 910063e1     	add	x1, sp, #0x18
 40f1414: 9428382a     	bl	0x4aff4bc <_ChromeMain+0x4afa220>
 40f1418: 36000260     	tbz	w0, #0x0, 0x40f1464 <_ChromeMain+0x40ec1c8>
 40f141c: d2800000     	mov	x0, #0x0                ; =0
 40f1420: f9400ff5     	ldr	x21, [sp, #0x18]
 40f1424: 3cc203e0     	ldur	q0, [sp, #0x20]
 40f1428: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 40f142c: f90017ff     	str	xzr, [sp, #0x28]
 40f1430: 39404288     	ldrb	w8, [x20, #0x10]
 40f1434: 340000c8     	cbz	w8, 0x40f144c <_ChromeMain+0x40ec1b0>
 40f1438: f9400680     	ldr	x0, [x20, #0x8]
 40f143c: 52800041     	mov	w1, #0x2                ; =2
 40f1440: 3d8003e0     	str	q0, [sp]
 40f1444: 942835be     	bl	0x4afeb3c <_ChromeMain+0x4af98a0>
 40f1448: 3dc003e0     	ldr	q0, [sp]
 40f144c: f9000275     	str	x21, [x19]
 40f1450: 3c808260     	stur	q0, [x19, #0x8]
 40f1454: f9000e60     	str	x0, [x19, #0x18]
 40f1458: 14000005     	b	0x40f146c <_ChromeMain+0x40ec1d0>
 40f145c: aa1403e0     	mov	x0, x20
 40f1460: 14000018     	b	0x40f14c0 <_ChromeMain+0x40ec224>
 40f1464: 6f00e400     	movi.2d	v0, #0000000000000000
 40f1468: ad000260     	stp	q0, q0, [x19]
 40f146c: f9400ff4     	ldr	x20, [sp, #0x18]
 40f1470: b4000414     	cbz	x20, 0x40f14f0 <_ChromeMain+0x40ec254>
 40f1474: f94013e8     	ldr	x8, [sp, #0x20]
 40f1478: 52800b09     	mov	w9, #0x58               ; =88
 40f147c: 9b097d09     	mul	x9, x8, x9
 40f1480: b4fffee9     	cbz	x9, 0x40f145c <_ChromeMain+0x40ec1c0>
 40f1484: 8b140129     	add	x9, x9, x20
 40f1488: d1016133     	sub	x19, x9, #0x58
 40f148c: 92800ae9     	mov	x9, #-0x58              ; =-88
 40f1490: 9b097d15     	mul	x21, x8, x9
 40f1494: b4000393     	cbz	x19, 0x40f1504 <_ChromeMain+0x40ec268>
 40f1498: 9100c260     	add	x0, x19, #0x30
 40f149c: 97261349     	bl	0xa761c0 <_ChromeMain+0xa70f24>
 40f14a0: 91006260     	add	x0, x19, #0x18
 40f14a4: 97261347     	bl	0xa761c0 <_ChromeMain+0xa70f24>
 40f14a8: aa1303e0     	mov	x0, x19
 40f14ac: 97261345     	bl	0xa761c0 <_ChromeMain+0xa70f24>
 40f14b0: d1016273     	sub	x19, x19, #0x58
 40f14b4: b10162b5     	adds	x21, x21, #0x58
 40f14b8: 54fffee1     	b.ne	0x40f1494 <_ChromeMain+0x40ec1f8>
 40f14bc: f9400fe0     	ldr	x0, [sp, #0x18]
 40f14c0: cb000288     	sub	x8, x20, x0
 40f14c4: 9343fd08     	asr	x8, x8, #3
 40f14c8: d2917469     	mov	x9, #0x8ba3             ; =35747
 40f14cc: f2b745c9     	movk	x9, #0xba2e, lsl #16
 40f14d0: f2d45d09     	movk	x9, #0xa2e8, lsl #32
 40f14d4: f2e5d169     	movk	x9, #0x2e8b, lsl #48
 40f14d8: 9b097d08     	mul	x8, x8, x9
 40f14dc: f90013e8     	str	x8, [sp, #0x20]
 40f14e0: f94017e8     	ldr	x8, [sp, #0x28]
 40f14e4: 52800b09     	mov	w9, #0x58               ; =88
 40f14e8: 9b097d01     	mul	x1, x8, x9
 40f14ec: 96fc5e73     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f14f0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 40f14f4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 40f14f8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 40f14fc: 910183ff     	add	sp, sp, #0x60
 40f1500: d65f03c0     	ret
 40f1504: d4200020     	brk	#0x1
 40f1508: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 40f150c: a90167fa     	stp	x26, x25, [sp, #0x10]
 40f1510: a9025ff8     	stp	x24, x23, [sp, #0x20]
 40f1514: a90357f6     	stp	x22, x21, [sp, #0x30]
 40f1518: a9044ff4     	stp	x20, x19, [sp, #0x40]
 40f151c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 40f1520: 910143fd     	add	x29, sp, #0x50
 40f1524: aa0103f5     	mov	x21, x1
 40f1528: aa0003f3     	mov	x19, x0
 40f152c: a9405017     	ldp	x23, x20, [x0]
 40f1530: f94002f6     	ldr	x22, [x23]
 40f1534: 925e76d8     	and	x24, x22, #0xfffffffc00000000
 40f1538: b005561a     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40f153c: f9404748     	ldr	x8, [x26, #0x88]
 40f1540: eb08031f     	cmp	x24, x8
 40f1544: 54000061     	b.ne	0x40f1550 <_ChromeMain+0x40ec2b4>
 40f1548: aa1603e0     	mov	x0, x22
 40f154c: 96fc8b6c     	bl	0x142fc <_ChromeMain+0xf060>
 40f1550: f9404748     	ldr	x8, [x26, #0x88]
 40f1554: eb08031f     	cmp	x24, x8
 40f1558: 54000061     	b.ne	0x40f1564 <_ChromeMain+0x40ec2c8>
 40f155c: aa1603e0     	mov	x0, x22
 40f1560: 96fc8b67     	bl	0x142fc <_ChromeMain+0xf060>
 40f1564: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 40f1568: f9404749     	ldr	x9, [x26, #0x88]
 40f156c: eb09011f     	cmp	x8, x9
 40f1570: 54000061     	b.ne	0x40f157c <_ChromeMain+0x40ec2e0>
 40f1574: aa1603e0     	mov	x0, x22
 40f1578: 96fcc531     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f157c: 52800700     	mov	w0, #0x38               ; =56
 40f1580: 96fc777a     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f1584: aa0003f9     	mov	x25, x0
 40f1588: 5280003c     	mov	w28, #0x1               ; =1
 40f158c: 10a64828     	adr	x8, 0x403de90 <_ChromeMain+0x4038bf4>
 40f1590: d503201f     	nop
 40f1594: b900001c     	str	w28, [x0]
 40f1598: f0fece89     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 40f159c: 91180129     	add	x9, x9, #0x600
 40f15a0: 90ff237b     	adrp	x27, 0x255d000 <_ChromeMain+0x2557d64>
 40f15a4: 912c037b     	add	x27, x27, #0xb00
 40f15a8: a900a408     	stp	x8, x9, [x0, #0x8]
 40f15ac: f9000c1b     	str	x27, [x0, #0x18]
 40f15b0: 3dc00660     	ldr	q0, [x19, #0x10]
 40f15b4: 3d800800     	str	q0, [x0, #0x20]
 40f15b8: f9001816     	str	x22, [x0, #0x30]
 40f15bc: f9400af6     	ldr	x22, [x23, #0x10]
 40f15c0: 52800100     	mov	w0, #0x8                ; =8
 40f15c4: 96fc7769     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f15c8: aa0003f7     	mov	x23, x0
 40f15cc: f900001f     	str	xzr, [x0]
 40f15d0: 52800700     	mov	w0, #0x38               ; =56
 40f15d4: 96fc7765     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f15d8: aa0003f8     	mov	x24, x0
 40f15dc: b900001c     	str	w28, [x0]
 40f15e0: 90feada8     	adrp	x8, 0x16a5000 <_ChromeMain+0x169fd64>
 40f15e4: 91190108     	add	x8, x8, #0x640
 40f15e8: 90fff5c9     	adrp	x9, 0x3fa9000 <_ChromeMain+0x3fa3d64>
 40f15ec: 91290129     	add	x9, x9, #0xa40
 40f15f0: a900a408     	stp	x8, x9, [x0, #0x8]
 40f15f4: 10012788     	adr	x8, 0x40f3ae4 <_ChromeMain+0x40ee848>
 40f15f8: d503201f     	nop
 40f15fc: a901a01b     	stp	x27, x8, [x0, #0x18]
 40f1600: f9001419     	str	x25, [x0, #0x28]
 40f1604: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 40f1608: f9404749     	ldr	x9, [x26, #0x88]
 40f160c: eb09011f     	cmp	x8, x9
 40f1610: 54000061     	b.ne	0x40f161c <_ChromeMain+0x40ec380>
 40f1614: aa1703e0     	mov	x0, x23
 40f1618: 96fc8b39     	bl	0x142fc <_ChromeMain+0xf060>
 40f161c: f9001b17     	str	x23, [x24, #0x30]
 40f1620: 52800700     	mov	w0, #0x38               ; =56
 40f1624: 96fc7751     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f1628: aa0003e3     	mov	x3, x0
 40f162c: b900001c     	str	w28, [x0]
 40f1630: 90feb6a8     	adrp	x8, 0x17c5000 <_ChromeMain+0x17bfd64>
 40f1634: 91380108     	add	x8, x8, #0xe00
 40f1638: 10013389     	adr	x9, 0x40f3ca8 <_ChromeMain+0x40eea0c>
 40f163c: d503201f     	nop
 40f1640: a900a408     	stp	x8, x9, [x0, #0x8]
 40f1644: 10012d28     	adr	x8, 0x40f3be8 <_ChromeMain+0x40ee94c>
 40f1648: d503201f     	nop
 40f164c: a901a01b     	stp	x27, x8, [x0, #0x18]
 40f1650: a902dc15     	stp	x21, x23, [x0, #0x28]
 40f1654: aa1603e0     	mov	x0, x22
 40f1658: aa1403e1     	mov	x1, x20
 40f165c: aa1803e2     	mov	x2, x24
 40f1660: 97428514     	bl	0x1192ab0 <_ChromeMain+0x118d814>
 40f1664: f9400260     	ldr	x0, [x19]
 40f1668: 925e7408     	and	x8, x0, #0xfffffffc00000000
 40f166c: f9404749     	ldr	x9, [x26, #0x88]
 40f1670: eb09011f     	cmp	x8, x9
 40f1674: 54000041     	b.ne	0x40f167c <_ChromeMain+0x40ec3e0>
 40f1678: 96fcc4f1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f167c: f900027f     	str	xzr, [x19]
 40f1680: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 40f1684: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 40f1688: a94357f6     	ldp	x22, x21, [sp, #0x30]
 40f168c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 40f1690: a94167fa     	ldp	x26, x25, [sp, #0x10]
 40f1694: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 40f1698: d65f03c0     	ret
 40f169c: d10283ff     	sub	sp, sp, #0xa0
 40f16a0: a9046ffc     	stp	x28, x27, [sp, #0x40]
 40f16a4: a90567fa     	stp	x26, x25, [sp, #0x50]
 40f16a8: a9065ff8     	stp	x24, x23, [sp, #0x60]
 40f16ac: a90757f6     	stp	x22, x21, [sp, #0x70]
 40f16b0: a9084ff4     	stp	x20, x19, [sp, #0x80]
 40f16b4: a9097bfd     	stp	x29, x30, [sp, #0x90]
 40f16b8: 910243fd     	add	x29, sp, #0x90
 40f16bc: aa0103f4     	mov	x20, x1
 40f16c0: aa0003f3     	mov	x19, x0
 40f16c4: f9402c15     	ldr	x21, [x0, #0x58]
 40f16c8: b0046f81     	adrp	x1, 0xcee2000 <dyld_stub_binder+0xcee2000>
 40f16cc: 910ab421     	add	x1, x1, #0x2ad
 40f16d0: aa1503e0     	mov	x0, x21
 40f16d4: 52800322     	mov	w2, #0x19               ; =25
 40f16d8: 970f2d5d     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 40f16dc: b4000ba0     	cbz	x0, 0x40f1850 <_ChromeMain+0x40ec5b4>
 40f16e0: aa0003e8     	mov	x8, x0
 40f16e4: f9401009     	ldr	x9, [x0, #0x20]
 40f16e8: b4002449     	cbz	x9, 0x40f1b70 <_ChromeMain+0x40ec8d4>
 40f16ec: f9400929     	ldr	x9, [x9, #0x10]
 40f16f0: f90003ff     	str	xzr, [sp]
 40f16f4: f9401520     	ldr	x0, [x9, #0x28]
 40f16f8: b4000ac0     	cbz	x0, 0x40f1850 <_ChromeMain+0x40ec5b4>
 40f16fc: 39805d09     	ldrsb	x9, [x8, #0x17]
 40f1700: a9402d0a     	ldp	x10, x11, [x8]
 40f1704: f100013f     	cmp	x9, #0x0
 40f1708: 9a884156     	csel	x22, x10, x8, mi
 40f170c: 7100013f     	cmp	w9, #0x0
 40f1710: 9a894177     	csel	x23, x11, x9, mi
 40f1714: f9400008     	ldr	x8, [x0]
 40f1718: f9401108     	ldr	x8, [x8, #0x20]
 40f171c: f0fdfd89     	adrp	x9, 0xa4000 <_ChromeMain+0x9ed64>
 40f1720: 91177129     	add	x9, x9, #0x5dc
 40f1724: eb09011f     	cmp	x8, x9
 40f1728: 540000c1     	b.ne	0x40f1740 <_ChromeMain+0x40ec4a4>
 40f172c: f9402418     	ldr	x24, [x0, #0x48]
 40f1730: b4000918     	cbz	x24, 0x40f1850 <_ChromeMain+0x40ec5b4>
 40f1734: f8410f19     	ldr	x25, [x24, #0x10]!
 40f1738: b40008d9     	cbz	x25, 0x40f1850 <_ChromeMain+0x40ec5b4>
 40f173c: 14000035     	b	0x40f1810 <_ChromeMain+0x40ec574>
 40f1740: 910003e3     	mov	x3, sp
 40f1744: aa1603e1     	mov	x1, x22
 40f1748: aa1703e2     	mov	x2, x23
 40f174c: d63f0100     	blr	x8
 40f1750: 370000c0     	tbnz	w0, #0x0, 0x40f1768 <_ChromeMain+0x40ec4cc>
 40f1754: 1400003f     	b	0x40f1850 <_ChromeMain+0x40ec5b4>
 40f1758: eb1a02ff     	cmp	x23, x26
 40f175c: 54000541     	b.ne	0x40f1804 <_ChromeMain+0x40ec568>
 40f1760: eb18033f     	cmp	x25, x24
 40f1764: 54000760     	b.eq	0x40f1850 <_ChromeMain+0x40ec5b4>
 40f1768: b0046f81     	adrp	x1, 0xcee2000 <dyld_stub_binder+0xcee2000>
 40f176c: 910ab421     	add	x1, x1, #0x2ad
 40f1770: aa1503e0     	mov	x0, x21
 40f1774: 52800322     	mov	w2, #0x19               ; =25
 40f1778: 97085362     	bl	0x306500 <_ChromeMain+0x301264>
 40f177c: 370006a0     	tbnz	w0, #0x0, 0x40f1850 <_ChromeMain+0x40ec5b4>
 40f1780: f9401660     	ldr	x0, [x19, #0x28]
 40f1784: b40021a0     	cbz	x0, 0x40f1bb8 <_ChromeMain+0x40ec91c>
 40f1788: 52800028     	mov	w8, #0x1                ; =1
 40f178c: 3900c3e8     	strb	w8, [sp, #0x30]
 40f1790: b9003bff     	str	wzr, [sp, #0x38]
 40f1794: f9400008     	ldr	x8, [x0]
 40f1798: f9400d08     	ldr	x8, [x8, #0x18]
 40f179c: 9100c3e1     	add	x1, sp, #0x30
 40f17a0: 14000010     	b	0x40f17e0 <_ChromeMain+0x40ec544>
 40f17a4: f9400688     	ldr	x8, [x20, #0x8]
 40f17a8: b50005e8     	cbnz	x8, 0x40f1864 <_ChromeMain+0x40ec5c8>
 40f17ac: 91032260     	add	x0, x19, #0xc8
 40f17b0: 52800001     	mov	w1, #0x0                ; =0
 40f17b4: 94000f2b     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f17b8: 9108a260     	add	x0, x19, #0x228
 40f17bc: 52800001     	mov	w1, #0x0                ; =0
 40f17c0: 94000f28     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f17c4: f9401660     	ldr	x0, [x19, #0x28]
 40f17c8: b4001da0     	cbz	x0, 0x40f1b7c <_ChromeMain+0x40ec8e0>
 40f17cc: 390083ff     	strb	wzr, [sp, #0x20]
 40f17d0: f90017ff     	str	xzr, [sp, #0x28]
 40f17d4: f9400008     	ldr	x8, [x0]
 40f17d8: f9400d08     	ldr	x8, [x8, #0x18]
 40f17dc: 910083e1     	add	x1, sp, #0x20
 40f17e0: d63f0100     	blr	x8
 40f17e4: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 40f17e8: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 40f17ec: a94757f6     	ldp	x22, x21, [sp, #0x70]
 40f17f0: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 40f17f4: a94567fa     	ldp	x26, x25, [sp, #0x50]
 40f17f8: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 40f17fc: 910283ff     	add	sp, sp, #0xa0
 40f1800: d65f03c0     	ret
 40f1804: 54000223     	b.lo	0x40f1848 <_ChromeMain+0x40ec5ac>
 40f1808: f9400739     	ldr	x25, [x25, #0x8]
 40f180c: b4000239     	cbz	x25, 0x40f1850 <_ChromeMain+0x40ec5b4>
 40f1810: aa1903e8     	mov	x8, x25
 40f1814: f8420d09     	ldr	x9, [x8, #0x20]!
 40f1818: 39805d0a     	ldrsb	x10, [x8, #0x17]
 40f181c: f100015f     	cmp	x10, #0x0
 40f1820: 9a884121     	csel	x1, x9, x8, mi
 40f1824: f9400508     	ldr	x8, [x8, #0x8]
 40f1828: 7100015f     	cmp	w10, #0x0
 40f182c: 9a8a411a     	csel	x26, x8, x10, mi
 40f1830: eb17035f     	cmp	x26, x23
 40f1834: 9a973342     	csel	x2, x26, x23, lo
 40f1838: aa1603e0     	mov	x0, x22
 40f183c: 94fc6009     	bl	0x8009860 <_ChromeMain+0x80045c4>
 40f1840: 34fff8c0     	cbz	w0, 0x40f1758 <_ChromeMain+0x40ec4bc>
 40f1844: 36fffe20     	tbz	w0, #0x1f, 0x40f1808 <_ChromeMain+0x40ec56c>
 40f1848: f9400339     	ldr	x25, [x25]
 40f184c: b5fffe39     	cbnz	x25, 0x40f1810 <_ChromeMain+0x40ec574>
 40f1850: 39406288     	ldrb	w8, [x20, #0x18]
 40f1854: 34fffac8     	cbz	w8, 0x40f17ac <_ChromeMain+0x40ec510>
 40f1858: 39805e88     	ldrsb	x8, [x20, #0x17]
 40f185c: b7fffa48     	tbnz	x8, #0x3f, 0x40f17a4 <_ChromeMain+0x40ec508>
 40f1860: b4fffa68     	cbz	x8, 0x40f17ac <_ChromeMain+0x40ec510>
 40f1864: d0056080     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 40f1868: 9135a000     	add	x0, x0, #0xd68
 40f186c: f9400008     	ldr	x8, [x0]
 40f1870: d63f0100     	blr	x8
 40f1874: f9400008     	ldr	x8, [x0]
 40f1878: b4001888     	cbz	x8, 0x40f1b88 <_ChromeMain+0x40ec8ec>
 40f187c: f9400117     	ldr	x23, [x8]
 40f1880: b4001857     	cbz	x23, 0x40f1b88 <_ChromeMain+0x40ec8ec>
 40f1884: 910022e8     	add	x8, x23, #0x8
 40f1888: 52800029     	mov	w9, #0x1                ; =1
 40f188c: b8290108     	ldadd	w9, w8, [x8]
 40f1890: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f1894: 6b09011f     	cmp	w8, w9
 40f1898: 540017e0     	b.eq	0x40f1b94 <_ChromeMain+0x40ec8f8>
 40f189c: f9415a75     	ldr	x21, [x19, #0x2b0]
 40f18a0: b40000b5     	cbz	x21, 0x40f18b4 <_ChromeMain+0x40ec618>
 40f18a4: 52800028     	mov	w8, #0x1                ; =1
 40f18a8: b82802a8     	ldadd	w8, w8, [x21]
 40f18ac: 6b09011f     	cmp	w8, w9
 40f18b0: 540017e0     	b.eq	0x40f1bac <_ChromeMain+0x40ec910>
 40f18b4: f9415e79     	ldr	x25, [x19, #0x2b8]
 40f18b8: 52800800     	mov	w0, #0x40               ; =64
 40f18bc: 96fc76ab     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f18c0: aa0003f6     	mov	x22, x0
 40f18c4: 52800038     	mov	w24, #0x1               ; =1
 40f18c8: 1000c988     	adr	x8, 0x40f31f8 <_ChromeMain+0x40edf5c>
 40f18cc: d503201f     	nop
 40f18d0: f0fff3c9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40f18d4: 912b0129     	add	x9, x9, #0xac0
 40f18d8: b9000018     	str	w24, [x0]
 40f18dc: 10de6f2a     	adr	x10, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40f18e0: d503201f     	nop
 40f18e4: 1000724b     	adr	x11, 0x40f272c <_ChromeMain+0x40ed490>
 40f18e8: d503201f     	nop
 40f18ec: a900a408     	stp	x8, x9, [x0, #0x8]
 40f18f0: a901ac0a     	stp	x10, x11, [x0, #0x18]
 40f18f4: a902d41f     	stp	xzr, x21, [x0, #0x28]
 40f18f8: f9001c19     	str	x25, [x0, #0x38]
 40f18fc: 9004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40f1900: 91329400     	add	x0, x0, #0xca5
 40f1904: 9004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40f1908: 91309421     	add	x1, x1, #0xc25
 40f190c: 910003e8     	mov	x8, sp
 40f1910: 52805522     	mov	w2, #0x2a9              ; =681
 40f1914: 96fd7cdb     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40f1918: 52800600     	mov	w0, #0x30               ; =48
 40f191c: 96fc7693     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f1920: f9000017     	str	x23, [x0]
 40f1924: 3dc003e0     	ldr	q0, [sp]
 40f1928: 3c808000     	stur	q0, [x0, #0x8]
 40f192c: b94013e8     	ldr	w8, [sp, #0x10]
 40f1930: b9001808     	str	w8, [x0, #0x18]
 40f1934: f9400fe8     	ldr	x8, [sp, #0x18]
 40f1938: a9025808     	stp	x8, x22, [x0, #0x20]
 40f193c: b4001336     	cbz	x22, 0x40f1ba0 <_ChromeMain+0x40ec904>
 40f1940: aa0003f5     	mov	x21, x0
 40f1944: 52800700     	mov	w0, #0x38               ; =56
 40f1948: 96fc7688     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f194c: aa0003f6     	mov	x22, x0
 40f1950: 100156e8     	adr	x8, 0x40f442c <_ChromeMain+0x40ef190>
 40f1954: d503201f     	nop
 40f1958: 10015c09     	adr	x9, 0x40f44d8 <_ChromeMain+0x40ef23c>
 40f195c: d503201f     	nop
 40f1960: b9000018     	str	w24, [x0]
 40f1964: 90ff237c     	adrp	x28, 0x255d000 <_ChromeMain+0x2557d64>
 40f1968: 912c039c     	add	x28, x28, #0xb00
 40f196c: 10014f2a     	adr	x10, 0x40f4350 <_ChromeMain+0x40ef0b4>
 40f1970: d503201f     	nop
 40f1974: a900a408     	stp	x8, x9, [x0, #0x8]
 40f1978: a901a81c     	stp	x28, x10, [x0, #0x18]
 40f197c: a902d41f     	stp	xzr, x21, [x0, #0x28]
 40f1980: f9401281     	ldr	x1, [x20, #0x20]
 40f1984: 91032260     	add	x0, x19, #0xc8
 40f1988: 94000f01     	bl	0x40f558c <_ChromeMain+0x40f02f0>
 40f198c: f9401281     	ldr	x1, [x20, #0x20]
 40f1990: 9108a260     	add	x0, x19, #0x228
 40f1994: 94000efe     	bl	0x40f558c <_ChromeMain+0x40f02f0>
 40f1998: 91002275     	add	x21, x19, #0x8
 40f199c: 9004ccc0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40f19a0: 91329400     	add	x0, x0, #0xca5
 40f19a4: 9004ccc1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40f19a8: 91309421     	add	x1, x1, #0xc25
 40f19ac: 910003f7     	mov	x23, sp
 40f19b0: 910003e8     	mov	x8, sp
 40f19b4: 52805602     	mov	w2, #0x2b0              ; =688
 40f19b8: 96fd7cb2     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40f19bc: b0055619     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40f19c0: f9404728     	ldr	x8, [x25, #0x88]
 40f19c4: 925e76ba     	and	x26, x21, #0xfffffffc00000000
 40f19c8: eb08035f     	cmp	x26, x8
 40f19cc: 54000081     	b.ne	0x40f19dc <_ChromeMain+0x40ec740>
 40f19d0: 91002260     	add	x0, x19, #0x8
 40f19d4: 96fc8a4a     	bl	0x142fc <_ChromeMain+0xf060>
 40f19d8: f9404728     	ldr	x8, [x25, #0x88]
 40f19dc: 925e76fb     	and	x27, x23, #0xfffffffc00000000
 40f19e0: eb08037f     	cmp	x27, x8
 40f19e4: 54000081     	b.ne	0x40f19f4 <_ChromeMain+0x40ec758>
 40f19e8: 910003e0     	mov	x0, sp
 40f19ec: 96fc8a44     	bl	0x142fc <_ChromeMain+0xf060>
 40f19f0: f9404728     	ldr	x8, [x25, #0x88]
 40f19f4: eb08035f     	cmp	x26, x8
 40f19f8: 54000061     	b.ne	0x40f1a04 <_ChromeMain+0x40ec768>
 40f19fc: 91002260     	add	x0, x19, #0x8
 40f1a00: 96fcc40f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f1a04: f94002b8     	ldr	x24, [x21]
 40f1a08: 925e7717     	and	x23, x24, #0xfffffffc00000000
 40f1a0c: f9404728     	ldr	x8, [x25, #0x88]
 40f1a10: eb0802ff     	cmp	x23, x8
 40f1a14: 54000061     	b.ne	0x40f1a20 <_ChromeMain+0x40ec784>
 40f1a18: aa1803e0     	mov	x0, x24
 40f1a1c: 96fc8a38     	bl	0x142fc <_ChromeMain+0xf060>
 40f1a20: f9404728     	ldr	x8, [x25, #0x88]
 40f1a24: eb0802ff     	cmp	x23, x8
 40f1a28: 54000061     	b.ne	0x40f1a34 <_ChromeMain+0x40ec798>
 40f1a2c: aa1803e0     	mov	x0, x24
 40f1a30: 96fc8a33     	bl	0x142fc <_ChromeMain+0xf060>
 40f1a34: 925e7708     	and	x8, x24, #0xfffffffc00000000
 40f1a38: f9404729     	ldr	x9, [x25, #0x88]
 40f1a3c: eb09011f     	cmp	x8, x9
 40f1a40: 54000061     	b.ne	0x40f1a4c <_ChromeMain+0x40ec7b0>
 40f1a44: aa1803e0     	mov	x0, x24
 40f1a48: 96fcc3fd     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f1a4c: 52800c00     	mov	w0, #0x60               ; =96
 40f1a50: 96fc7646     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f1a54: aa0003f7     	mov	x23, x0
 40f1a58: 52800028     	mov	w8, #0x1                ; =1
 40f1a5c: b9000008     	str	w8, [x0]
 40f1a60: 1000c3c8     	adr	x8, 0x40f32d8 <_ChromeMain+0x40ee03c>
 40f1a64: d503201f     	nop
 40f1a68: 1000c909     	adr	x9, 0x40f3388 <_ChromeMain+0x40ee0ec>
 40f1a6c: d503201f     	nop
 40f1a70: a900a408     	stp	x8, x9, [x0, #0x8]
 40f1a74: 10ffcac8     	adr	x8, 0x40f13cc <_ChromeMain+0x40ec130>
 40f1a78: d503201f     	nop
 40f1a7c: a901a01c     	stp	x28, x8, [x0, #0x18]
 40f1a80: a902e01f     	stp	xzr, x24, [x0, #0x28]
 40f1a84: 38038c1f     	strb	wzr, [x0, #0x38]!
 40f1a88: 390142ff     	strb	wzr, [x23, #0x50]
 40f1a8c: 39406288     	ldrb	w8, [x20, #0x18]
 40f1a90: 34000128     	cbz	w8, 0x40f1ab4 <_ChromeMain+0x40ec818>
 40f1a94: 39c05e88     	ldrsb	w8, [x20, #0x17]
 40f1a98: 37f80668     	tbnz	w8, #0x1f, 0x40f1b64 <_ChromeMain+0x40ec8c8>
 40f1a9c: 3dc00280     	ldr	q0, [x20]
 40f1aa0: 3d800000     	str	q0, [x0]
 40f1aa4: f9400a88     	ldr	x8, [x20, #0x10]
 40f1aa8: f9000808     	str	x8, [x0, #0x10]
 40f1aac: 52800028     	mov	w8, #0x1                ; =1
 40f1ab0: 390142e8     	strb	w8, [x23, #0x50]
 40f1ab4: f9002ef6     	str	x22, [x23, #0x58]
 40f1ab8: f9404728     	ldr	x8, [x25, #0x88]
 40f1abc: eb08035f     	cmp	x26, x8
 40f1ac0: 54000081     	b.ne	0x40f1ad0 <_ChromeMain+0x40ec834>
 40f1ac4: 91002260     	add	x0, x19, #0x8
 40f1ac8: 96fc8a0d     	bl	0x142fc <_ChromeMain+0xf060>
 40f1acc: f9404728     	ldr	x8, [x25, #0x88]
 40f1ad0: eb08037f     	cmp	x27, x8
 40f1ad4: 54000061     	b.ne	0x40f1ae0 <_ChromeMain+0x40ec844>
 40f1ad8: 910003e0     	mov	x0, sp
 40f1adc: 96fc8a08     	bl	0x142fc <_ChromeMain+0xf060>
 40f1ae0: b4000315     	cbz	x21, 0x40f1b40 <_ChromeMain+0x40ec8a4>
 40f1ae4: f9400e60     	ldr	x0, [x19, #0x18]
 40f1ae8: f9400008     	ldr	x8, [x0]
 40f1aec: f9400108     	ldr	x8, [x8]
 40f1af0: 910003e1     	mov	x1, sp
 40f1af4: aa1703e2     	mov	x2, x23
 40f1af8: d2800003     	mov	x3, #0x0                ; =0
 40f1afc: d63f0100     	blr	x8
 40f1b00: f9404728     	ldr	x8, [x25, #0x88]
 40f1b04: eb08037f     	cmp	x27, x8
 40f1b08: 54000081     	b.ne	0x40f1b18 <_ChromeMain+0x40ec87c>
 40f1b0c: 910003e0     	mov	x0, sp
 40f1b10: 96fcc3cb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f1b14: f9404728     	ldr	x8, [x25, #0x88]
 40f1b18: eb08035f     	cmp	x26, x8
 40f1b1c: 54000081     	b.ne	0x40f1b2c <_ChromeMain+0x40ec890>
 40f1b20: aa1503e0     	mov	x0, x21
 40f1b24: 96fcc3c6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f1b28: f9404728     	ldr	x8, [x25, #0x88]
 40f1b2c: eb08037f     	cmp	x27, x8
 40f1b30: 54ffe5a1     	b.ne	0x40f17e4 <_ChromeMain+0x40ec548>
 40f1b34: 910003e0     	mov	x0, sp
 40f1b38: 96fcc3c1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f1b3c: 17ffff2a     	b	0x40f17e4 <_ChromeMain+0x40ec548>
 40f1b40: b4fffe17     	cbz	x23, 0x40f1b00 <_ChromeMain+0x40ec864>
 40f1b44: 12800008     	mov	w8, #-0x1               ; =-1
 40f1b48: b8e802e8     	ldaddal	w8, w8, [x23]
 40f1b4c: 7100051f     	cmp	w8, #0x1
 40f1b50: 54fffd81     	b.ne	0x40f1b00 <_ChromeMain+0x40ec864>
 40f1b54: f9400ae8     	ldr	x8, [x23, #0x10]
 40f1b58: aa1703e0     	mov	x0, x23
 40f1b5c: d63f0100     	blr	x8
 40f1b60: 17ffffe8     	b	0x40f1b00 <_ChromeMain+0x40ec864>
 40f1b64: a9400a81     	ldp	x1, x2, [x20]
 40f1b68: 96fc99ac     	bl	0x18218 <_ChromeMain+0x12f7c>
 40f1b6c: 17ffffd0     	b	0x40f1aac <_ChromeMain+0x40ec810>
 40f1b70: d4200000     	brk	#0
 40f1b74: d4400000     	hlt	#0
 40f1b78: d4200020     	brk	#0x1
 40f1b7c: d4200000     	brk	#0
 40f1b80: d4400000     	hlt	#0
 40f1b84: d4200020     	brk	#0x1
 40f1b88: d4200000     	brk	#0
 40f1b8c: d4400000     	hlt	#0
 40f1b90: d4200020     	brk	#0x1
 40f1b94: d4200000     	brk	#0
 40f1b98: d4400000     	hlt	#0
 40f1b9c: d4200020     	brk	#0x1
 40f1ba0: d4200000     	brk	#0
 40f1ba4: d4400000     	hlt	#0
 40f1ba8: d4200020     	brk	#0x1
 40f1bac: d4200000     	brk	#0
 40f1bb0: d4400000     	hlt	#0
 40f1bb4: d4200020     	brk	#0x1
 40f1bb8: d4200000     	brk	#0
 40f1bbc: d4400000     	hlt	#0
 40f1bc0: d4200020     	brk	#0x1
 40f1bc4: d106c3ff     	sub	sp, sp, #0x1b0
 40f1bc8: a9156ffc     	stp	x28, x27, [sp, #0x150]
 40f1bcc: a91667fa     	stp	x26, x25, [sp, #0x160]
 40f1bd0: a9175ff8     	stp	x24, x23, [sp, #0x170]
 40f1bd4: a91857f6     	stp	x22, x21, [sp, #0x180]
 40f1bd8: a9194ff4     	stp	x20, x19, [sp, #0x190]
 40f1bdc: a91a7bfd     	stp	x29, x30, [sp, #0x1a0]
 40f1be0: 910683fd     	add	x29, sp, #0x1a0
 40f1be4: aa0003f3     	mov	x19, x0
 40f1be8: 39405c28     	ldrb	w8, [x1, #0x17]
 40f1bec: f9400429     	ldr	x9, [x1, #0x8]
 40f1bf0: 7219011f     	tst	w8, #0x80
 40f1bf4: 9a881128     	csel	x8, x9, x8, ne
 40f1bf8: b40011a8     	cbz	x8, 0x40f1e2c <_ChromeMain+0x40ecb90>
 40f1bfc: aa0103f4     	mov	x20, x1
 40f1c00: f9402e75     	ldr	x21, [x19, #0x58]
 40f1c04: 90046f61     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 40f1c08: 91219021     	add	x1, x1, #0x864
 40f1c0c: aa1503e0     	mov	x0, x21
 40f1c10: 52800342     	mov	w2, #0x1a               ; =26
 40f1c14: 970f2c0e     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 40f1c18: b4000580     	cbz	x0, 0x40f1cc8 <_ChromeMain+0x40eca2c>
 40f1c1c: aa0003e8     	mov	x8, x0
 40f1c20: f9401009     	ldr	x9, [x0, #0x20]
 40f1c24: b4001549     	cbz	x9, 0x40f1ecc <_ChromeMain+0x40ecc30>
 40f1c28: f9400929     	ldr	x9, [x9, #0x10]
 40f1c2c: f9005bff     	str	xzr, [sp, #0xb0]
 40f1c30: f9401520     	ldr	x0, [x9, #0x28]
 40f1c34: b40004a0     	cbz	x0, 0x40f1cc8 <_ChromeMain+0x40eca2c>
 40f1c38: 39805d09     	ldrsb	x9, [x8, #0x17]
 40f1c3c: a9402d0a     	ldp	x10, x11, [x8]
 40f1c40: f100013f     	cmp	x9, #0x0
 40f1c44: 9a884156     	csel	x22, x10, x8, mi
 40f1c48: 7100013f     	cmp	w9, #0x0
 40f1c4c: 9a894177     	csel	x23, x11, x9, mi
 40f1c50: f9400008     	ldr	x8, [x0]
 40f1c54: f9401108     	ldr	x8, [x8, #0x20]
 40f1c58: f0fdfd89     	adrp	x9, 0xa4000 <_ChromeMain+0x9ed64>
 40f1c5c: 91177129     	add	x9, x9, #0x5dc
 40f1c60: eb09011f     	cmp	x8, x9
 40f1c64: 54000d81     	b.ne	0x40f1e14 <_ChromeMain+0x40ecb78>
 40f1c68: f9402418     	ldr	x24, [x0, #0x48]
 40f1c6c: b40002f8     	cbz	x24, 0x40f1cc8 <_ChromeMain+0x40eca2c>
 40f1c70: f8410f19     	ldr	x25, [x24, #0x10]!
 40f1c74: b40002b9     	cbz	x25, 0x40f1cc8 <_ChromeMain+0x40eca2c>
 40f1c78: 14000004     	b	0x40f1c88 <_ChromeMain+0x40ec9ec>
 40f1c7c: 54000223     	b.lo	0x40f1cc0 <_ChromeMain+0x40eca24>
 40f1c80: f9400739     	ldr	x25, [x25, #0x8]
 40f1c84: b4000239     	cbz	x25, 0x40f1cc8 <_ChromeMain+0x40eca2c>
 40f1c88: aa1903e8     	mov	x8, x25
 40f1c8c: f8420d09     	ldr	x9, [x8, #0x20]!
 40f1c90: 39805d0a     	ldrsb	x10, [x8, #0x17]
 40f1c94: f100015f     	cmp	x10, #0x0
 40f1c98: 9a884121     	csel	x1, x9, x8, mi
 40f1c9c: f9400508     	ldr	x8, [x8, #0x8]
 40f1ca0: 7100015f     	cmp	w10, #0x0
 40f1ca4: 9a8a411a     	csel	x26, x8, x10, mi
 40f1ca8: eb17035f     	cmp	x26, x23
 40f1cac: 9a973342     	csel	x2, x26, x23, lo
 40f1cb0: aa1603e0     	mov	x0, x22
 40f1cb4: 94fc5eeb     	bl	0x8009860 <_ChromeMain+0x80045c4>
 40f1cb8: 340007c0     	cbz	w0, 0x40f1db0 <_ChromeMain+0x40ecb14>
 40f1cbc: 36fffe20     	tbz	w0, #0x1f, 0x40f1c80 <_ChromeMain+0x40ec9e4>
 40f1cc0: f9400339     	ldr	x25, [x25]
 40f1cc4: b5fffe39     	cbnz	x25, 0x40f1c88 <_ChromeMain+0x40ec9ec>
 40f1cc8: 39805e81     	ldrsb	x1, [x20, #0x17]
 40f1ccc: b6f80041     	tbz	x1, #0x3f, 0x40f1cd4 <_ChromeMain+0x40eca38>
 40f1cd0: f9400681     	ldr	x1, [x20, #0x8]
 40f1cd4: 9105e260     	add	x0, x19, #0x178
 40f1cd8: 94000e2d     	bl	0x40f558c <_ChromeMain+0x40f02f0>
 40f1cdc: f9402a60     	ldr	x0, [x19, #0x50]
 40f1ce0: 97d245e5     	bl	0x3583474 <_ChromeMain+0x357e1d8>
 40f1ce4: 7100001f     	cmp	w0, #0x0
 40f1ce8: 52800037     	mov	w23, #0x1               ; =1
 40f1cec: 1a9706f5     	cinc	w21, w23, ne
 40f1cf0: f9401276     	ldr	x22, [x19, #0x20]
 40f1cf4: 3dc00280     	ldr	q0, [x20]
 40f1cf8: 3d8003e0     	str	q0, [sp]
 40f1cfc: f9400a88     	ldr	x8, [x20, #0x10]
 40f1d00: f9000be8     	str	x8, [sp, #0x10]
 40f1d04: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 40f1d08: f900029f     	str	xzr, [x20]
 40f1d0c: f9415a74     	ldr	x20, [x19, #0x2b0]
 40f1d10: b40000b4     	cbz	x20, 0x40f1d24 <_ChromeMain+0x40eca88>
 40f1d14: b8370288     	ldadd	w23, w8, [x20]
 40f1d18: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f1d1c: 6b09011f     	cmp	w8, w9
 40f1d20: 54000dc0     	b.eq	0x40f1ed8 <_ChromeMain+0x40ecc3c>
 40f1d24: f9415e73     	ldr	x19, [x19, #0x2b8]
 40f1d28: 52800800     	mov	w0, #0x40               ; =64
 40f1d2c: 96fc758f     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f1d30: aa0003e3     	mov	x3, x0
 40f1d34: 90ff4448     	adrp	x8, 0x2979000 <_ChromeMain+0x2973d64>
 40f1d38: 91340108     	add	x8, x8, #0xd00
 40f1d3c: f0fff3c9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 40f1d40: 912b0129     	add	x9, x9, #0xac0
 40f1d44: b9000017     	str	w23, [x0]
 40f1d48: 10de4bca     	adr	x10, 0x40ae6c0 <_ChromeMain+0x40a9424>
 40f1d4c: d503201f     	nop
 40f1d50: 100040eb     	adr	x11, 0x40f256c <_ChromeMain+0x40ed2d0>
 40f1d54: d503201f     	nop
 40f1d58: a900a408     	stp	x8, x9, [x0, #0x8]
 40f1d5c: a901ac0a     	stp	x10, x11, [x0, #0x18]
 40f1d60: a902d01f     	stp	xzr, x20, [x0, #0x28]
 40f1d64: f9001c13     	str	x19, [x0, #0x38]
 40f1d68: 910003e1     	mov	x1, sp
 40f1d6c: aa1603e0     	mov	x0, x22
 40f1d70: aa1503e2     	mov	x2, x21
 40f1d74: 94d97826     	bl	0x774fe0c <_ChromeMain+0x774ab70>
 40f1d78: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40f1d7c: 36f800a8     	tbz	w8, #0x1f, 0x40f1d90 <_ChromeMain+0x40ecaf4>
 40f1d80: f94003e0     	ldr	x0, [sp]
 40f1d84: f9400be8     	ldr	x8, [sp, #0x10]
 40f1d88: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f1d8c: 96fc5c4b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f1d90: a95a7bfd     	ldp	x29, x30, [sp, #0x1a0]
 40f1d94: a9594ff4     	ldp	x20, x19, [sp, #0x190]
 40f1d98: a95857f6     	ldp	x22, x21, [sp, #0x180]
 40f1d9c: a9575ff8     	ldp	x24, x23, [sp, #0x170]
 40f1da0: a95667fa     	ldp	x26, x25, [sp, #0x160]
 40f1da4: a9556ffc     	ldp	x28, x27, [sp, #0x150]
 40f1da8: 9106c3ff     	add	sp, sp, #0x1b0
 40f1dac: d65f03c0     	ret
 40f1db0: eb1a02ff     	cmp	x23, x26
 40f1db4: 54fff641     	b.ne	0x40f1c7c <_ChromeMain+0x40ec9e0>
 40f1db8: eb18033f     	cmp	x25, x24
 40f1dbc: 54fff860     	b.eq	0x40f1cc8 <_ChromeMain+0x40eca2c>
 40f1dc0: 90046f61     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 40f1dc4: 91219021     	add	x1, x1, #0x864
 40f1dc8: aa1503e0     	mov	x0, x21
 40f1dcc: 52800342     	mov	w2, #0x1a               ; =26
 40f1dd0: 970851cc     	bl	0x306500 <_ChromeMain+0x301264>
 40f1dd4: 3707f7a0     	tbnz	w0, #0x0, 0x40f1cc8 <_ChromeMain+0x40eca2c>
 40f1dd8: f9401660     	ldr	x0, [x19, #0x28]
 40f1ddc: b4000840     	cbz	x0, 0x40f1ee4 <_ChromeMain+0x40ecc48>
 40f1de0: 52800028     	mov	w8, #0x1                ; =1
 40f1de4: 390063e8     	strb	w8, [sp, #0x18]
 40f1de8: 910063f3     	add	x19, sp, #0x18
 40f1dec: b90023ff     	str	wzr, [sp, #0x20]
 40f1df0: f9400008     	ldr	x8, [x0]
 40f1df4: f9401508     	ldr	x8, [x8, #0x28]
 40f1df8: 910063e1     	add	x1, sp, #0x18
 40f1dfc: d63f0100     	blr	x8
 40f1e00: 394063e8     	ldrb	w8, [sp, #0x18]
 40f1e04: 721e791f     	tst	w8, #0xfffffffd
 40f1e08: 54fffc41     	b.ne	0x40f1d90 <_ChromeMain+0x40ecaf4>
 40f1e0c: 91002260     	add	x0, x19, #0x8
 40f1e10: 1400002d     	b	0x40f1ec4 <_ChromeMain+0x40ecc28>
 40f1e14: 9102c3e3     	add	x3, sp, #0xb0
 40f1e18: aa1603e1     	mov	x1, x22
 40f1e1c: aa1703e2     	mov	x2, x23
 40f1e20: d63f0100     	blr	x8
 40f1e24: 3707fce0     	tbnz	w0, #0x0, 0x40f1dc0 <_ChromeMain+0x40ecb24>
 40f1e28: 17ffffa8     	b	0x40f1cc8 <_ChromeMain+0x40eca2c>
 40f1e2c: 9105e260     	add	x0, x19, #0x178
 40f1e30: 52800001     	mov	w1, #0x0                ; =0
 40f1e34: 94000d8b     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f1e38: f9401660     	ldr	x0, [x19, #0x28]
 40f1e3c: b40005a0     	cbz	x0, 0x40f1ef0 <_ChromeMain+0x40ecc54>
 40f1e40: 9101a3e8     	add	x8, sp, #0x68
 40f1e44: b9006bff     	str	wzr, [sp, #0x68]
 40f1e48: 6f00e400     	movi.2d	v0, #0000000000000000
 40f1e4c: 3c8703e0     	stur	q0, [sp, #0x70]
 40f1e50: 3c818100     	stur	q0, [x8, #0x18]
 40f1e54: 3c828100     	stur	q0, [x8, #0x28]
 40f1e58: 3cc683e1     	ldur	q1, [sp, #0x68]
 40f1e5c: 3d802fe1     	str	q1, [sp, #0xb0]
 40f1e60: f9403fe9     	ldr	x9, [sp, #0x78]
 40f1e64: 3d800900     	str	q0, [x8, #0x20]
 40f1e68: 3c838100     	stur	q0, [x8, #0x38]
 40f1e6c: f9004fff     	str	xzr, [sp, #0x98]
 40f1e70: 381603bf     	sturb	wzr, [x29, #-0xa0]
 40f1e74: d10283b3     	sub	x19, x29, #0xa0
 40f1e78: f81783a9     	stur	x9, [x29, #-0x88]
 40f1e7c: 3c8a0101     	stur	q1, [x8, #0xa0]
 40f1e80: a90c7fe9     	stp	x9, xzr, [sp, #0xc0]
 40f1e84: ad3c83a0     	stp	q0, q0, [x29, #-0x70]
 40f1e88: 3c9803a0     	stur	q0, [x29, #-0x80]
 40f1e8c: f9007bff     	str	xzr, [sp, #0xf0]
 40f1e90: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 40f1e94: f9400008     	ldr	x8, [x0]
 40f1e98: f9401508     	ldr	x8, [x8, #0x28]
 40f1e9c: d10283a1     	sub	x1, x29, #0xa0
 40f1ea0: d63f0100     	blr	x8
 40f1ea4: 385603a8     	ldurb	w8, [x29, #-0xa0]
 40f1ea8: 721e791f     	tst	w8, #0xfffffffd
 40f1eac: 54000061     	b.ne	0x40f1eb8 <_ChromeMain+0x40ecc1c>
 40f1eb0: 91002260     	add	x0, x19, #0x8
 40f1eb4: 94d97636     	bl	0x774f78c <_ChromeMain+0x774a4f0>
 40f1eb8: 9102c3e0     	add	x0, sp, #0xb0
 40f1ebc: 94d97634     	bl	0x774f78c <_ChromeMain+0x774a4f0>
 40f1ec0: 9101a3e0     	add	x0, sp, #0x68
 40f1ec4: 94d97632     	bl	0x774f78c <_ChromeMain+0x774a4f0>
 40f1ec8: 17ffffb2     	b	0x40f1d90 <_ChromeMain+0x40ecaf4>
 40f1ecc: d4200000     	brk	#0
 40f1ed0: d4400000     	hlt	#0
 40f1ed4: d4200020     	brk	#0x1
 40f1ed8: d4200000     	brk	#0
 40f1edc: d4400000     	hlt	#0
 40f1ee0: d4200020     	brk	#0x1
 40f1ee4: d4200000     	brk	#0
 40f1ee8: d4400000     	hlt	#0
 40f1eec: d4200020     	brk	#0x1
 40f1ef0: d4200000     	brk	#0
 40f1ef4: d4400000     	hlt	#0
 40f1ef8: d4200020     	brk	#0x1
 40f1efc: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 40f1f00: a90167fa     	stp	x26, x25, [sp, #0x10]
 40f1f04: a9025ff8     	stp	x24, x23, [sp, #0x20]
 40f1f08: a90357f6     	stp	x22, x21, [sp, #0x30]
 40f1f0c: a9044ff4     	stp	x20, x19, [sp, #0x40]
 40f1f10: a9057bfd     	stp	x29, x30, [sp, #0x50]
 40f1f14: 910143fd     	add	x29, sp, #0x50
 40f1f18: d10d03ff     	sub	sp, sp, #0x340
 40f1f1c: aa0103f5     	mov	x21, x1
 40f1f20: aa0003f3     	mov	x19, x0
 40f1f24: f9402c14     	ldr	x20, [x0, #0x58]
 40f1f28: 90046f61     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 40f1f2c: 91157821     	add	x1, x1, #0x55e
 40f1f30: aa1403e0     	mov	x0, x20
 40f1f34: 52800382     	mov	w2, #0x1c               ; =28
 40f1f38: 970f2b45     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 40f1f3c: b4000580     	cbz	x0, 0x40f1fec <_ChromeMain+0x40ecd50>
 40f1f40: aa0003e8     	mov	x8, x0
 40f1f44: f9401009     	ldr	x9, [x0, #0x20]
 40f1f48: b4001fa9     	cbz	x9, 0x40f233c <_ChromeMain+0x40ed0a0>
 40f1f4c: f9400929     	ldr	x9, [x9, #0x10]
 40f1f50: f9001bff     	str	xzr, [sp, #0x30]
 40f1f54: f9401520     	ldr	x0, [x9, #0x28]
 40f1f58: b40004a0     	cbz	x0, 0x40f1fec <_ChromeMain+0x40ecd50>
 40f1f5c: 39805d09     	ldrsb	x9, [x8, #0x17]
 40f1f60: a9402d0a     	ldp	x10, x11, [x8]
 40f1f64: f100013f     	cmp	x9, #0x0
 40f1f68: 9a884156     	csel	x22, x10, x8, mi
 40f1f6c: 7100013f     	cmp	w9, #0x0
 40f1f70: 9a894177     	csel	x23, x11, x9, mi
 40f1f74: f9400008     	ldr	x8, [x0]
 40f1f78: f9401108     	ldr	x8, [x8, #0x20]
 40f1f7c: f0fdfd89     	adrp	x9, 0xa4000 <_ChromeMain+0x9ed64>
 40f1f80: 91177129     	add	x9, x9, #0x5dc
 40f1f84: eb09011f     	cmp	x8, x9
 40f1f88: 54000821     	b.ne	0x40f208c <_ChromeMain+0x40ecdf0>
 40f1f8c: f9402418     	ldr	x24, [x0, #0x48]
 40f1f90: b40002f8     	cbz	x24, 0x40f1fec <_ChromeMain+0x40ecd50>
 40f1f94: f8410f19     	ldr	x25, [x24, #0x10]!
 40f1f98: b40002b9     	cbz	x25, 0x40f1fec <_ChromeMain+0x40ecd50>
 40f1f9c: 14000004     	b	0x40f1fac <_ChromeMain+0x40ecd10>
 40f1fa0: 54000223     	b.lo	0x40f1fe4 <_ChromeMain+0x40ecd48>
 40f1fa4: f9400739     	ldr	x25, [x25, #0x8]
 40f1fa8: b4000239     	cbz	x25, 0x40f1fec <_ChromeMain+0x40ecd50>
 40f1fac: aa1903e8     	mov	x8, x25
 40f1fb0: f8420d09     	ldr	x9, [x8, #0x20]!
 40f1fb4: 39805d0a     	ldrsb	x10, [x8, #0x17]
 40f1fb8: f100015f     	cmp	x10, #0x0
 40f1fbc: 9a884121     	csel	x1, x9, x8, mi
 40f1fc0: f9400508     	ldr	x8, [x8, #0x8]
 40f1fc4: 7100015f     	cmp	w10, #0x0
 40f1fc8: 9a8a411a     	csel	x26, x8, x10, mi
 40f1fcc: eb17035f     	cmp	x26, x23
 40f1fd0: 9a973342     	csel	x2, x26, x23, lo
 40f1fd4: aa1603e0     	mov	x0, x22
 40f1fd8: 94fc5e22     	bl	0x8009860 <_ChromeMain+0x80045c4>
 40f1fdc: 34000320     	cbz	w0, 0x40f2040 <_ChromeMain+0x40ecda4>
 40f1fe0: 36fffe20     	tbz	w0, #0x1f, 0x40f1fa4 <_ChromeMain+0x40ecd08>
 40f1fe4: f9400339     	ldr	x25, [x25]
 40f1fe8: b5fffe39     	cbnz	x25, 0x40f1fac <_ChromeMain+0x40ecd10>
 40f1fec: f94006a8     	ldr	x8, [x21, #0x8]
 40f1ff0: b5000728     	cbnz	x8, 0x40f20d4 <_ChromeMain+0x40ece38>
 40f1ff4: 91074260     	add	x0, x19, #0x1d0
 40f1ff8: 52800001     	mov	w1, #0x0                ; =0
 40f1ffc: 94000d19     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f2000: f9401660     	ldr	x0, [x19, #0x28]
 40f2004: b4001a20     	cbz	x0, 0x40f2348 <_ChromeMain+0x40ed0ac>
 40f2008: 390043ff     	strb	wzr, [sp, #0x10]
 40f200c: f9000fff     	str	xzr, [sp, #0x18]
 40f2010: f9400008     	ldr	x8, [x0]
 40f2014: f9401908     	ldr	x8, [x8, #0x30]
 40f2018: 910043e1     	add	x1, sp, #0x10
 40f201c: d63f0100     	blr	x8
 40f2020: 910d03ff     	add	sp, sp, #0x340
 40f2024: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 40f2028: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 40f202c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 40f2030: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 40f2034: a94167fa     	ldp	x26, x25, [sp, #0x10]
 40f2038: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 40f203c: d65f03c0     	ret
 40f2040: eb1a02ff     	cmp	x23, x26
 40f2044: 54fffae1     	b.ne	0x40f1fa0 <_ChromeMain+0x40ecd04>
 40f2048: eb18033f     	cmp	x25, x24
 40f204c: 54fffd00     	b.eq	0x40f1fec <_ChromeMain+0x40ecd50>
 40f2050: f0046f41     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 40f2054: 91157821     	add	x1, x1, #0x55e
 40f2058: aa1403e0     	mov	x0, x20
 40f205c: 52800382     	mov	w2, #0x1c               ; =28
 40f2060: 97085128     	bl	0x306500 <_ChromeMain+0x301264>
 40f2064: 3707fc40     	tbnz	w0, #0x0, 0x40f1fec <_ChromeMain+0x40ecd50>
 40f2068: f9401660     	ldr	x0, [x19, #0x28]
 40f206c: b4001740     	cbz	x0, 0x40f2354 <_ChromeMain+0x40ed0b8>
 40f2070: 52800028     	mov	w8, #0x1                ; =1
 40f2074: 390083e8     	strb	w8, [sp, #0x20]
 40f2078: b9002bff     	str	wzr, [sp, #0x28]
 40f207c: f9400008     	ldr	x8, [x0]
 40f2080: f9401908     	ldr	x8, [x8, #0x30]
 40f2084: 910083e1     	add	x1, sp, #0x20
 40f2088: 17ffffe5     	b	0x40f201c <_ChromeMain+0x40ecd80>
 40f208c: 9100c3e3     	add	x3, sp, #0x30
 40f2090: aa1603e1     	mov	x1, x22
 40f2094: aa1703e2     	mov	x2, x23
 40f2098: d63f0100     	blr	x8
 40f209c: 3707fda0     	tbnz	w0, #0x0, 0x40f2050 <_ChromeMain+0x40ecdb4>
 40f20a0: 17ffffd3     	b	0x40f1fec <_ChromeMain+0x40ecd50>
 40f20a4: f9403674     	ldr	x20, [x19, #0x68]
 40f20a8: 91074260     	add	x0, x19, #0x1d0
 40f20ac: aa1403e1     	mov	x1, x20
 40f20b0: 94000d78     	bl	0x40f5690 <_ChromeMain+0x40f03f4>
 40f20b4: f9401660     	ldr	x0, [x19, #0x28]
 40f20b8: b4001540     	cbz	x0, 0x40f2360 <_ChromeMain+0x40ed0c4>
 40f20bc: 390003ff     	strb	wzr, [sp]
 40f20c0: f90007f4     	str	x20, [sp, #0x8]
 40f20c4: f9400008     	ldr	x8, [x0]
 40f20c8: f9401908     	ldr	x8, [x8, #0x30]
 40f20cc: 910003e1     	mov	x1, sp
 40f20d0: 17ffffd3     	b	0x40f201c <_ChromeMain+0x40ecd80>
 40f20d4: f9400ea1     	ldr	x1, [x21, #0x18]
 40f20d8: 91074260     	add	x0, x19, #0x1d0
 40f20dc: 94000d2c     	bl	0x40f558c <_ChromeMain+0x40f02f0>
 40f20e0: aa1303f4     	mov	x20, x19
 40f20e4: a9c62296     	ldp	x22, x8, [x20, #0x60]!
 40f20e8: 52805709     	mov	w9, #0x2b8              ; =696
 40f20ec: 9b097d0a     	mul	x10, x8, x9
 40f20f0: aa1603e9     	mov	x9, x22
 40f20f4: b400016a     	cbz	x10, 0x40f2120 <_ChromeMain+0x40ece84>
 40f20f8: 8b160149     	add	x9, x10, x22
 40f20fc: d10ae120     	sub	x0, x9, #0x2b8
 40f2100: 928056e9     	mov	x9, #-0x2b8             ; =-696
 40f2104: 9b097d17     	mul	x23, x8, x9
 40f2108: b4000320     	cbz	x0, 0x40f216c <_ChromeMain+0x40eced0>
 40f210c: 97b60bac     	bl	0x2e74fbc <_ChromeMain+0x2e6fd20>
 40f2110: d10ae000     	sub	x0, x0, #0x2b8
 40f2114: b10ae2f7     	adds	x23, x23, #0x2b8
 40f2118: 54ffff81     	b.ne	0x40f2108 <_ChromeMain+0x40ece6c>
 40f211c: f9400289     	ldr	x9, [x20]
 40f2120: cb0902c8     	sub	x8, x22, x9
 40f2124: 9343fd08     	asr	x8, x8, #3
 40f2128: d29d6ce9     	mov	x9, #0xeb67             ; =60263
 40f212c: f2adfa09     	movk	x9, #0x6fd0, lsl #16
 40f2130: f2c1d6c9     	movk	x9, #0xeb6, lsl #32
 40f2134: f2ecdfa9     	movk	x9, #0x66fd, lsl #48
 40f2138: 9b097d08     	mul	x8, x8, x9
 40f213c: f9003668     	str	x8, [x19, #0x68]
 40f2140: f94006a1     	ldr	x1, [x21, #0x8]
 40f2144: aa1403e0     	mov	x0, x20
 40f2148: 94d972d6     	bl	0x774eca0 <_ChromeMain+0x7749a04>
 40f214c: f94006a8     	ldr	x8, [x21, #0x8]
 40f2150: 52800b09     	mov	w9, #0x58               ; =88
 40f2154: 9b097d08     	mul	x8, x8, x9
 40f2158: b4fffa68     	cbz	x8, 0x40f20a4 <_ChromeMain+0x40ece08>
 40f215c: f94002b5     	ldr	x21, [x21]
 40f2160: 8b0802ba     	add	x26, x21, x8
 40f2164: d102a3bb     	sub	x27, x29, #0xa8
 40f2168: 1400001f     	b	0x40f21e4 <_ChromeMain+0x40ecf48>
 40f216c: d4200020     	brk	#0x1
 40f2170: f9414279     	ldr	x25, [x19, #0x280]
 40f2174: f9414678     	ldr	x24, [x19, #0x288]
 40f2178: d101e3a0     	sub	x0, x29, #0x78
 40f217c: 52800661     	mov	w1, #0x33               ; =51
 40f2180: 9724efc0     	bl	0xa2e080 <_ChromeMain+0xa28de4>
 40f2184: f9401be8     	ldr	x8, [sp, #0x30]
 40f2188: f9402108     	ldr	x8, [x8, #0x40]
 40f218c: 9100c3e0     	add	x0, sp, #0x30
 40f2190: d101e3a1     	sub	x1, x29, #0x78
 40f2194: aa1603e2     	mov	x2, x22
 40f2198: aa1703e3     	mov	x3, x23
 40f219c: aa1903e4     	mov	x4, x25
 40f21a0: aa1803e5     	mov	x5, x24
 40f21a4: 52800006     	mov	w6, #0x0                ; =0
 40f21a8: d63f0100     	blr	x8
 40f21ac: 38d6f3a8     	ldursb	w8, [x29, #-0x91]
 40f21b0: 36f800a8     	tbz	w8, #0x1f, 0x40f21c4 <_ChromeMain+0x40ecf28>
 40f21b4: f85583a0     	ldur	x0, [x29, #-0xa8]
 40f21b8: f85683a8     	ldur	x8, [x29, #-0x98]
 40f21bc: d37ff901     	lsl	x1, x8, #1
 40f21c0: 96fc5b3e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f21c4: 9100c3e1     	add	x1, sp, #0x30
 40f21c8: aa1403e0     	mov	x0, x20
 40f21cc: 94d973a1     	bl	0x774f050 <_ChromeMain+0x7749db4>
 40f21d0: 9100c3e0     	add	x0, sp, #0x30
 40f21d4: 97b60b7a     	bl	0x2e74fbc <_ChromeMain+0x2e6fd20>
 40f21d8: 9100a2b5     	add	x21, x21, #0x28
 40f21dc: eb1a02bf     	cmp	x21, x26
 40f21e0: 54fff620     	b.eq	0x40f20a4 <_ChromeMain+0x40ece08>
 40f21e4: 9100c3e0     	add	x0, sp, #0x30
 40f21e8: 52805701     	mov	w1, #0x2b8              ; =696
 40f21ec: 94fc5d89     	bl	0x8009810 <_ChromeMain+0x8004574>
 40f21f0: d101e3a8     	sub	x8, x29, #0x78
 40f21f4: 9766aa44     	bl	0x1a9cb04 <_ChromeMain+0x1a97868>
 40f21f8: 9100c3e0     	add	x0, sp, #0x30
 40f21fc: d101e3a1     	sub	x1, x29, #0x78
 40f2200: 97a7b528     	bl	0x2adf6a0 <_ChromeMain+0x2ada404>
 40f2204: 38d9f3a8     	ldursb	w8, [x29, #-0x61]
 40f2208: 36f800a8     	tbz	w8, #0x1f, 0x40f221c <_ChromeMain+0x40ecf80>
 40f220c: f85883a0     	ldur	x0, [x29, #-0x78]
 40f2210: f85983a8     	ldur	x8, [x29, #-0x68]
 40f2214: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f2218: 96fc5b28     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f221c: aa1503e0     	mov	x0, x21
 40f2220: 96fcf6cc     	bl	0x2fd50 <_ChromeMain+0x2aab4>
 40f2224: aa0003f6     	mov	x22, x0
 40f2228: aa1503e0     	mov	x0, x21
 40f222c: 978c301f     	bl	0x23fe2a8 <_ChromeMain+0x23f900c>
 40f2230: aa0003e1     	mov	x1, x0
 40f2234: b5000056     	cbnz	x22, 0x40f223c <_ChromeMain+0x40ecfa0>
 40f2238: b5fff9a1     	cbnz	x1, 0x40f216c <_ChromeMain+0x40eced0>
 40f223c: d10243a8     	sub	x8, x29, #0x90
 40f2240: aa1603e0     	mov	x0, x22
 40f2244: 971fc033     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 40f2248: 9100c3e0     	add	x0, sp, #0x30
 40f224c: d10243a1     	sub	x1, x29, #0x90
 40f2250: 9588c9ac     	bl	0xa324900 <_ChromeMain+0xa31f664>
 40f2254: 38d873a8     	ldursb	w8, [x29, #-0x79]
 40f2258: 36f800a8     	tbz	w8, #0x1f, 0x40f226c <_ChromeMain+0x40ecfd0>
 40f225c: f85703a0     	ldur	x0, [x29, #-0x90]
 40f2260: f85803a8     	ldur	x8, [x29, #-0x80]
 40f2264: d37ff901     	lsl	x1, x8, #1
 40f2268: 96fc5b14     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f226c: 910062b5     	add	x21, x21, #0x18
 40f2270: aa1503e0     	mov	x0, x21
 40f2274: 96fcf6b7     	bl	0x2fd50 <_ChromeMain+0x2aab4>
 40f2278: aa0003f6     	mov	x22, x0
 40f227c: aa1503e0     	mov	x0, x21
 40f2280: 978c300a     	bl	0x23fe2a8 <_ChromeMain+0x23f900c>
 40f2284: aa0003e1     	mov	x1, x0
 40f2288: b5000056     	cbnz	x22, 0x40f2290 <_ChromeMain+0x40ecff4>
 40f228c: b5fff701     	cbnz	x1, 0x40f216c <_ChromeMain+0x40eced0>
 40f2290: d101e3a8     	sub	x8, x29, #0x78
 40f2294: aa1603e0     	mov	x0, x22
 40f2298: 971fc01e     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 40f229c: 9100c3e0     	add	x0, sp, #0x30
 40f22a0: d101e3a1     	sub	x1, x29, #0x78
 40f22a4: 9588cb0c     	bl	0xa324ed4 <_ChromeMain+0xa31fc38>
 40f22a8: 38d9f3a8     	ldursb	w8, [x29, #-0x61]
 40f22ac: 36f800a8     	tbz	w8, #0x1f, 0x40f22c0 <_ChromeMain+0x40ed024>
 40f22b0: f85883a0     	ldur	x0, [x29, #-0x78]
 40f22b4: f85983a8     	ldur	x8, [x29, #-0x68]
 40f22b8: d37ff901     	lsl	x1, x8, #1
 40f22bc: 96fc5aff     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f22c0: b94032a0     	ldr	w0, [x21, #0x30]
 40f22c4: 9588b65f     	bl	0xa31fc40 <_ChromeMain+0xa31a9a4>
 40f22c8: b6000040     	tbz	x0, #0x20, 0x40f22d0 <_ChromeMain+0x40ed034>
 40f22cc: b900bbe0     	str	w0, [sp, #0xb8]
 40f22d0: b9403aa0     	ldr	w0, [x21, #0x38]
 40f22d4: 9588b674     	bl	0xa31fca4 <_ChromeMain+0xa31aa08>
 40f22d8: b6000040     	tbz	x0, #0x20, 0x40f22e0 <_ChromeMain+0x40ed044>
 40f22dc: b900bfe0     	str	w0, [sp, #0xbc]
 40f22e0: b90057ff     	str	wzr, [sp, #0x54]
 40f22e4: 910062b5     	add	x21, x21, #0x18
 40f22e8: aa1503e0     	mov	x0, x21
 40f22ec: 96fcf699     	bl	0x2fd50 <_ChromeMain+0x2aab4>
 40f22f0: aa0003f6     	mov	x22, x0
 40f22f4: aa1503e0     	mov	x0, x21
 40f22f8: 978c2fec     	bl	0x23fe2a8 <_ChromeMain+0x23f900c>
 40f22fc: aa0003e1     	mov	x1, x0
 40f2300: b5000056     	cbnz	x22, 0x40f2308 <_ChromeMain+0x40ed06c>
 40f2304: b5fff341     	cbnz	x1, 0x40f216c <_ChromeMain+0x40eced0>
 40f2308: d102a3a8     	sub	x8, x29, #0xa8
 40f230c: aa1603e0     	mov	x0, x22
 40f2310: 971fc000     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 40f2314: 3896f3a8     	ldursb	x8, [x29, #-0x91]
 40f2318: a975aba9     	ldp	x9, x10, [x29, #-0xa8]
 40f231c: f100011f     	cmp	x8, #0x0
 40f2320: 9a9b4136     	csel	x22, x9, x27, mi
 40f2324: 7100011f     	cmp	w8, #0x0
 40f2328: 9a884157     	csel	x23, x10, x8, mi
 40f232c: 398a5e78     	ldrsb	x24, [x19, #0x297]
 40f2330: b7fff218     	tbnz	x24, #0x3f, 0x40f2170 <_ChromeMain+0x40eced4>
 40f2334: 910a0279     	add	x25, x19, #0x280
 40f2338: 17ffff90     	b	0x40f2178 <_ChromeMain+0x40ecedc>
 40f233c: d4200000     	brk	#0
 40f2340: d4400000     	hlt	#0
 40f2344: d4200020     	brk	#0x1
 40f2348: d4200000     	brk	#0
 40f234c: d4400000     	hlt	#0
 40f2350: d4200020     	brk	#0x1
 40f2354: d4200000     	brk	#0
 40f2358: d4400000     	hlt	#0
 40f235c: 17ffff84     	b	0x40f216c <_ChromeMain+0x40eced0>
 40f2360: d4200000     	brk	#0
 40f2364: d4400000     	hlt	#0
 40f2368: d4200020     	brk	#0x1
 40f236c: d10203ff     	sub	sp, sp, #0x80
 40f2370: a90367fa     	stp	x26, x25, [sp, #0x30]
 40f2374: a9045ff8     	stp	x24, x23, [sp, #0x40]
 40f2378: a90557f6     	stp	x22, x21, [sp, #0x50]
 40f237c: a9064ff4     	stp	x20, x19, [sp, #0x60]
 40f2380: a9077bfd     	stp	x29, x30, [sp, #0x70]
 40f2384: 9101c3fd     	add	x29, sp, #0x70
 40f2388: aa0103f4     	mov	x20, x1
 40f238c: aa0003f3     	mov	x19, x0
 40f2390: f9402c15     	ldr	x21, [x0, #0x58]
 40f2394: 90049c01     	adrp	x1, 0xd472000 <dyld_stub_binder+0xd472000>
 40f2398: 91369c21     	add	x1, x1, #0xda7
 40f239c: aa1503e0     	mov	x0, x21
 40f23a0: 528002e2     	mov	w2, #0x17               ; =23
 40f23a4: 970f2a2a     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 40f23a8: b4000580     	cbz	x0, 0x40f2458 <_ChromeMain+0x40ed1bc>
 40f23ac: aa0003e8     	mov	x8, x0
 40f23b0: f9401009     	ldr	x9, [x0, #0x20]
 40f23b4: b4000ca9     	cbz	x9, 0x40f2548 <_ChromeMain+0x40ed2ac>
 40f23b8: f9400929     	ldr	x9, [x9, #0x10]
 40f23bc: f90017ff     	str	xzr, [sp, #0x28]
 40f23c0: f9401520     	ldr	x0, [x9, #0x28]
 40f23c4: b40004a0     	cbz	x0, 0x40f2458 <_ChromeMain+0x40ed1bc>
 40f23c8: 39805d09     	ldrsb	x9, [x8, #0x17]
 40f23cc: a9402d0a     	ldp	x10, x11, [x8]
 40f23d0: f100013f     	cmp	x9, #0x0
 40f23d4: 9a884156     	csel	x22, x10, x8, mi
 40f23d8: 7100013f     	cmp	w9, #0x0
 40f23dc: 9a894177     	csel	x23, x11, x9, mi
 40f23e0: f9400008     	ldr	x8, [x0]
 40f23e4: f9401108     	ldr	x8, [x8, #0x20]
 40f23e8: d0fdfd89     	adrp	x9, 0xa4000 <_ChromeMain+0x9ed64>
 40f23ec: 91177129     	add	x9, x9, #0x5dc
 40f23f0: eb09011f     	cmp	x8, x9
 40f23f4: 540009e1     	b.ne	0x40f2530 <_ChromeMain+0x40ed294>
 40f23f8: f9402418     	ldr	x24, [x0, #0x48]
 40f23fc: b40002f8     	cbz	x24, 0x40f2458 <_ChromeMain+0x40ed1bc>
 40f2400: f8410f19     	ldr	x25, [x24, #0x10]!
 40f2404: b40002b9     	cbz	x25, 0x40f2458 <_ChromeMain+0x40ed1bc>
 40f2408: 14000004     	b	0x40f2418 <_ChromeMain+0x40ed17c>
 40f240c: 54000223     	b.lo	0x40f2450 <_ChromeMain+0x40ed1b4>
 40f2410: f9400739     	ldr	x25, [x25, #0x8]
 40f2414: b4000239     	cbz	x25, 0x40f2458 <_ChromeMain+0x40ed1bc>
 40f2418: aa1903e8     	mov	x8, x25
 40f241c: f8420d09     	ldr	x9, [x8, #0x20]!
 40f2420: 39805d0a     	ldrsb	x10, [x8, #0x17]
 40f2424: f100015f     	cmp	x10, #0x0
 40f2428: 9a884121     	csel	x1, x9, x8, mi
 40f242c: f9400508     	ldr	x8, [x8, #0x8]
 40f2430: 7100015f     	cmp	w10, #0x0
 40f2434: 9a8a411a     	csel	x26, x8, x10, mi
 40f2438: eb17035f     	cmp	x26, x23
 40f243c: 9a973342     	csel	x2, x26, x23, lo
 40f2440: aa1603e0     	mov	x0, x22
 40f2444: 94fc5d07     	bl	0x8009860 <_ChromeMain+0x80045c4>
 40f2448: 340004e0     	cbz	w0, 0x40f24e4 <_ChromeMain+0x40ed248>
 40f244c: 36fffe20     	tbz	w0, #0x1f, 0x40f2410 <_ChromeMain+0x40ed174>
 40f2450: f9400339     	ldr	x25, [x25]
 40f2454: b5fffe39     	cbnz	x25, 0x40f2418 <_ChromeMain+0x40ed17c>
 40f2458: b40003d4     	cbz	x20, 0x40f24d0 <_ChromeMain+0x40ed234>
 40f245c: d341fe88     	lsr	x8, x20, #1
 40f2460: d29ef9e9     	mov	x9, #0xf7cf             ; =63439
 40f2464: f2bc6a69     	movk	x9, #0xe353, lsl #16
 40f2468: f2d374a9     	movk	x9, #0x9ba5, lsl #32
 40f246c: f2e41889     	movk	x9, #0x20c4, lsl #48
 40f2470: 9bc97d08     	umulh	x8, x8, x9
 40f2474: d344fd08     	lsr	x8, x8, #4
 40f2478: 91000515     	add	x21, x8, #0x1
 40f247c: 91048260     	add	x0, x19, #0x120
 40f2480: aa1403e1     	mov	x1, x20
 40f2484: 94000c42     	bl	0x40f558c <_ChromeMain+0x40f02f0>
 40f2488: 91048260     	add	x0, x19, #0x120
 40f248c: aa1503e1     	mov	x1, x21
 40f2490: 94000c80     	bl	0x40f5690 <_ChromeMain+0x40f03f4>
 40f2494: f9401660     	ldr	x0, [x19, #0x28]
 40f2498: b40005e0     	cbz	x0, 0x40f2554 <_ChromeMain+0x40ed2b8>
 40f249c: 390023ff     	strb	wzr, [sp, #0x8]
 40f24a0: f9000bf5     	str	x21, [sp, #0x10]
 40f24a4: f9400008     	ldr	x8, [x0]
 40f24a8: f9401108     	ldr	x8, [x8, #0x20]
 40f24ac: 910023e1     	add	x1, sp, #0x8
 40f24b0: d63f0100     	blr	x8
 40f24b4: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 40f24b8: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 40f24bc: a94557f6     	ldp	x22, x21, [sp, #0x50]
 40f24c0: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 40f24c4: a94367fa     	ldp	x26, x25, [sp, #0x30]
 40f24c8: 910203ff     	add	sp, sp, #0x80
 40f24cc: d65f03c0     	ret
 40f24d0: 91048260     	add	x0, x19, #0x120
 40f24d4: 52800001     	mov	w1, #0x0                ; =0
 40f24d8: 94000be2     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f24dc: d2800015     	mov	x21, #0x0               ; =0
 40f24e0: 17ffffed     	b	0x40f2494 <_ChromeMain+0x40ed1f8>
 40f24e4: eb1a02ff     	cmp	x23, x26
 40f24e8: 54fff921     	b.ne	0x40f240c <_ChromeMain+0x40ed170>
 40f24ec: eb18033f     	cmp	x25, x24
 40f24f0: 54fffb40     	b.eq	0x40f2458 <_ChromeMain+0x40ed1bc>
 40f24f4: 90049c01     	adrp	x1, 0xd472000 <dyld_stub_binder+0xd472000>
 40f24f8: 91369c21     	add	x1, x1, #0xda7
 40f24fc: aa1503e0     	mov	x0, x21
 40f2500: 528002e2     	mov	w2, #0x17               ; =23
 40f2504: 97084fff     	bl	0x306500 <_ChromeMain+0x301264>
 40f2508: 34fffa80     	cbz	w0, 0x40f2458 <_ChromeMain+0x40ed1bc>
 40f250c: f9401660     	ldr	x0, [x19, #0x28]
 40f2510: b4000280     	cbz	x0, 0x40f2560 <_ChromeMain+0x40ed2c4>
 40f2514: 52800028     	mov	w8, #0x1                ; =1
 40f2518: 390063e8     	strb	w8, [sp, #0x18]
 40f251c: b90023ff     	str	wzr, [sp, #0x20]
 40f2520: f9400008     	ldr	x8, [x0]
 40f2524: f9401108     	ldr	x8, [x8, #0x20]
 40f2528: 910063e1     	add	x1, sp, #0x18
 40f252c: 17ffffe1     	b	0x40f24b0 <_ChromeMain+0x40ed214>
 40f2530: 9100a3e3     	add	x3, sp, #0x28
 40f2534: aa1603e1     	mov	x1, x22
 40f2538: aa1703e2     	mov	x2, x23
 40f253c: d63f0100     	blr	x8
 40f2540: 3707fda0     	tbnz	w0, #0x0, 0x40f24f4 <_ChromeMain+0x40ed258>
 40f2544: 17ffffc5     	b	0x40f2458 <_ChromeMain+0x40ed1bc>
 40f2548: d4200000     	brk	#0
 40f254c: d4400000     	hlt	#0
 40f2550: d4200020     	brk	#0x1
 40f2554: d4200000     	brk	#0
 40f2558: d4400000     	hlt	#0
 40f255c: d4200020     	brk	#0x1
 40f2560: d4200000     	brk	#0
 40f2564: d4400000     	hlt	#0
 40f2568: d4200020     	brk	#0x1
 40f256c: d105c3ff     	sub	sp, sp, #0x170
 40f2570: a91457f6     	stp	x22, x21, [sp, #0x140]
 40f2574: a9154ff4     	stp	x20, x19, [sp, #0x150]
 40f2578: a9167bfd     	stp	x29, x30, [sp, #0x160]
 40f257c: 910583fd     	add	x29, sp, #0x160
 40f2580: aa0003f3     	mov	x19, x0
 40f2584: 910163f5     	add	x21, sp, #0x58
 40f2588: b9400028     	ldr	w8, [x1]
 40f258c: 7100251f     	cmp	w8, #0x9
 40f2590: 54000628     	b.hi	0x40f2654 <_ChromeMain+0x40ed3b8>
 40f2594: 52800309     	mov	w9, #0x18               ; =24
 40f2598: 1ac82529     	lsr	w9, w9, w8
 40f259c: 37000609     	tbnz	w9, #0x0, 0x40f265c <_ChromeMain+0x40ed3c0>
 40f25a0: 52802809     	mov	w9, #0x140              ; =320
 40f25a4: 1ac82529     	lsr	w9, w9, w8
 40f25a8: 370005e9     	tbnz	w9, #0x0, 0x40f2664 <_ChromeMain+0x40ed3c8>
 40f25ac: 52804089     	mov	w9, #0x204              ; =516
 40f25b0: 1ac82528     	lsr	w8, w9, w8
 40f25b4: 36000508     	tbz	w8, #0x0, 0x40f2654 <_ChromeMain+0x40ed3b8>
 40f25b8: aa0103f4     	mov	x20, x1
 40f25bc: f9401028     	ldr	x8, [x1, #0x20]
 40f25c0: f9400829     	ldr	x9, [x1, #0x10]
 40f25c4: 9105e260     	add	x0, x19, #0x178
 40f25c8: 8b080121     	add	x1, x9, x8
 40f25cc: 94000c31     	bl	0x40f5690 <_ChromeMain+0x40f03f4>
 40f25d0: f9401673     	ldr	x19, [x19, #0x28]
 40f25d4: b4000a73     	cbz	x19, 0x40f2720 <_ChromeMain+0x40ed484>
 40f25d8: 910283e0     	add	x0, sp, #0xa0
 40f25dc: aa1403e1     	mov	x1, x20
 40f25e0: 94000f2c     	bl	0x40f6290 <_ChromeMain+0x40f0ff4>
 40f25e4: 390023ff     	strb	wzr, [sp, #0x8]
 40f25e8: 910023f4     	add	x20, sp, #0x8
 40f25ec: 3cc482a0     	ldur	q0, [x21, #0x48]
 40f25f0: 3c8103e0     	stur	q0, [sp, #0x10]
 40f25f4: a94b27e8     	ldp	x8, x9, [sp, #0xb0]
 40f25f8: a90227e8     	stp	x8, x9, [sp, #0x20]
 40f25fc: 3cc682a2     	ldur	q2, [x21, #0x68]
 40f2600: 6f00e401     	movi.2d	v1, #0000000000000000
 40f2604: 3c8682a1     	stur	q1, [x21, #0x68]
 40f2608: 3cc782a0     	ldur	q0, [x21, #0x78]
 40f260c: ad0183e2     	stp	q2, q0, [sp, #0x30]
 40f2610: f94073e8     	ldr	x8, [sp, #0xe0]
 40f2614: f9002be8     	str	x8, [sp, #0x50]
 40f2618: 3c8782a1     	stur	q1, [x21, #0x78]
 40f261c: f9005fff     	str	xzr, [sp, #0xb8]
 40f2620: f90073ff     	str	xzr, [sp, #0xe0]
 40f2624: f9400268     	ldr	x8, [x19]
 40f2628: f9401508     	ldr	x8, [x8, #0x28]
 40f262c: 910023e1     	add	x1, sp, #0x8
 40f2630: aa1303e0     	mov	x0, x19
 40f2634: d63f0100     	blr	x8
 40f2638: 394023e8     	ldrb	w8, [sp, #0x8]
 40f263c: 721e791f     	tst	w8, #0xfffffffd
 40f2640: 54000061     	b.ne	0x40f264c <_ChromeMain+0x40ed3b0>
 40f2644: 91002280     	add	x0, x20, #0x8
 40f2648: 94d97451     	bl	0x774f78c <_ChromeMain+0x774a4f0>
 40f264c: 910283e0     	add	x0, sp, #0xa0
 40f2650: 1400002b     	b	0x40f26fc <_ChromeMain+0x40ed460>
 40f2654: 52800081     	mov	w1, #0x4                ; =4
 40f2658: 14000004     	b	0x40f2668 <_ChromeMain+0x40ed3cc>
 40f265c: 52800001     	mov	w1, #0x0                ; =0
 40f2660: 14000002     	b	0x40f2668 <_ChromeMain+0x40ed3cc>
 40f2664: 52800021     	mov	w1, #0x1                ; =1
 40f2668: 9102a260     	add	x0, x19, #0xa8
 40f266c: 94000ec6     	bl	0x40f6184 <_ChromeMain+0x40f0ee8>
 40f2670: f9401660     	ldr	x0, [x19, #0x28]
 40f2674: b4000500     	cbz	x0, 0x40f2714 <_ChromeMain+0x40ed478>
 40f2678: b9005bff     	str	wzr, [sp, #0x58]
 40f267c: 6f00e400     	movi.2d	v0, #0000000000000000
 40f2680: ad0303e0     	stp	q0, q0, [sp, #0x60]
 40f2684: 3c8803e0     	stur	q0, [sp, #0x80]
 40f2688: 3cc583e1     	ldur	q1, [sp, #0x58]
 40f268c: 3c8482a1     	stur	q1, [x21, #0x48]
 40f2690: f94037e8     	ldr	x8, [sp, #0x68]
 40f2694: 3c8783e0     	stur	q0, [sp, #0x78]
 40f2698: 3c8382a0     	stur	q0, [x21, #0x38]
 40f269c: f90047ff     	str	xzr, [sp, #0x88]
 40f26a0: 381903bf     	sturb	wzr, [x29, #-0x70]
 40f26a4: d101c3b3     	sub	x19, x29, #0x70
 40f26a8: f81a83a8     	stur	x8, [x29, #-0x58]
 40f26ac: 3c8a02a1     	stur	q1, [x21, #0xa0]
 40f26b0: a90b7fe8     	stp	x8, xzr, [sp, #0xb0]
 40f26b4: 3c8b82a0     	stur	q0, [x21, #0xb8]
 40f26b8: 3c8682a0     	stur	q0, [x21, #0x68]
 40f26bc: 3c8d82a0     	stur	q0, [x21, #0xd8]
 40f26c0: 3c8c82a0     	stur	q0, [x21, #0xc8]
 40f26c4: f90073ff     	str	xzr, [sp, #0xe0]
 40f26c8: 3c8782a0     	stur	q0, [x21, #0x78]
 40f26cc: f9400008     	ldr	x8, [x0]
 40f26d0: f9401508     	ldr	x8, [x8, #0x28]
 40f26d4: d101c3a1     	sub	x1, x29, #0x70
 40f26d8: d63f0100     	blr	x8
 40f26dc: 385903a8     	ldurb	w8, [x29, #-0x70]
 40f26e0: 721e791f     	tst	w8, #0xfffffffd
 40f26e4: 54000061     	b.ne	0x40f26f0 <_ChromeMain+0x40ed454>
 40f26e8: 91002260     	add	x0, x19, #0x8
 40f26ec: 94d97428     	bl	0x774f78c <_ChromeMain+0x774a4f0>
 40f26f0: 910283e0     	add	x0, sp, #0xa0
 40f26f4: 94d97426     	bl	0x774f78c <_ChromeMain+0x774a4f0>
 40f26f8: 910163e0     	add	x0, sp, #0x58
 40f26fc: 94d97424     	bl	0x774f78c <_ChromeMain+0x774a4f0>
 40f2700: a9567bfd     	ldp	x29, x30, [sp, #0x160]
 40f2704: a9554ff4     	ldp	x20, x19, [sp, #0x150]
 40f2708: a95457f6     	ldp	x22, x21, [sp, #0x140]
 40f270c: 9105c3ff     	add	sp, sp, #0x170
 40f2710: d65f03c0     	ret
 40f2714: d4200000     	brk	#0
 40f2718: d4400000     	hlt	#0
 40f271c: d4200020     	brk	#0x1
 40f2720: d4200000     	brk	#0
 40f2724: d4400000     	hlt	#0
 40f2728: d4200020     	brk	#0x1
 40f272c: d10443ff     	sub	sp, sp, #0x110
 40f2730: a90e57f6     	stp	x22, x21, [sp, #0xe0]
 40f2734: a90f4ff4     	stp	x20, x19, [sp, #0xf0]
 40f2738: a9107bfd     	stp	x29, x30, [sp, #0x100]
 40f273c: 910403fd     	add	x29, sp, #0x100
 40f2740: aa0003f3     	mov	x19, x0
 40f2744: 6f00e400     	movi.2d	v0, #0000000000000000
 40f2748: f9006bff     	str	xzr, [sp, #0xd0]
 40f274c: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 40f2750: ad0483e0     	stp	q0, q0, [sp, #0x90]
 40f2754: ad0383e0     	stp	q0, q0, [sp, #0x70]
 40f2758: 39400028     	ldrb	w8, [x1]
 40f275c: 3901c3e8     	strb	w8, [sp, #0x70]
 40f2760: 7100051f     	cmp	w8, #0x1
 40f2764: 54000661     	b.ne	0x40f2830 <_ChromeMain+0x40ed594>
 40f2768: 52800068     	mov	w8, #0x3                ; =3
 40f276c: 39000028     	strb	w8, [x1]
 40f2770: b9400834     	ldr	w20, [x1, #0x8]
 40f2774: b9007bf4     	str	w20, [sp, #0x78]
 40f2778: 7100169f     	cmp	w20, #0x5
 40f277c: 540002e2     	b.hs	0x40f27d8 <_ChromeMain+0x40ed53c>
 40f2780: 9102a260     	add	x0, x19, #0xa8
 40f2784: aa1403e1     	mov	x1, x20
 40f2788: 94000e3c     	bl	0x40f6078 <_ChromeMain+0x40f0ddc>
 40f278c: 91032260     	add	x0, x19, #0xc8
 40f2790: 52800021     	mov	w1, #0x1                ; =1
 40f2794: 94000b33     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f2798: 9108a260     	add	x0, x19, #0x228
 40f279c: 52800021     	mov	w1, #0x1                ; =1
 40f27a0: 94000b30     	bl	0x40f5460 <_ChromeMain+0x40f01c4>
 40f27a4: f9401660     	ldr	x0, [x19, #0x28]
 40f27a8: b4000c80     	cbz	x0, 0x40f2938 <_ChromeMain+0x40ed69c>
 40f27ac: 390043ff     	strb	wzr, [sp, #0x10]
 40f27b0: f9000fff     	str	xzr, [sp, #0x18]
 40f27b4: f9400008     	ldr	x8, [x0]
 40f27b8: f9400d08     	ldr	x8, [x8, #0x18]
 40f27bc: 910043e1     	add	x1, sp, #0x10
 40f27c0: d63f0100     	blr	x8
 40f27c4: a9507bfd     	ldp	x29, x30, [sp, #0x100]
 40f27c8: a94f4ff4     	ldp	x20, x19, [sp, #0xf0]
 40f27cc: a94e57f6     	ldp	x22, x21, [sp, #0xe0]
 40f27d0: 910443ff     	add	sp, sp, #0x110
 40f27d4: d65f03c0     	ret
 40f27d8: f004cca0     	adrp	x0, 0xda89000 <dyld_stub_binder+0xda89000>
 40f27dc: 91366c00     	add	x0, x0, #0xd9b
 40f27e0: 910043e8     	add	x8, sp, #0x10
 40f27e4: 52800421     	mov	w1, #0x21               ; =33
 40f27e8: 951b832b     	bl	0x87d3494 <_ChromeMain+0x87ce1f8>
 40f27ec: d100a3a8     	sub	x8, x29, #0x28
 40f27f0: 910043e1     	add	x1, sp, #0x10
 40f27f4: 52801220     	mov	w0, #0x91               ; =145
 40f27f8: 951b730c     	bl	0x87cf428 <_ChromeMain+0x87ca18c>
 40f27fc: f85d83b5     	ldur	x21, [x29, #-0x28]
 40f2800: f004cca1     	adrp	x1, 0xda89000 <dyld_stub_binder+0xda89000>
 40f2804: 91341821     	add	x1, x1, #0xd06
 40f2808: 910042a0     	add	x0, x21, #0x10
 40f280c: 528001e2     	mov	w2, #0xf                ; =15
 40f2810: 96fccb2b     	bl	0x254bc <_ChromeMain+0x20220>
 40f2814: 910042a0     	add	x0, x21, #0x10
 40f2818: aa1403e1     	mov	x1, x20
 40f281c: 97010fe1     	bl	0x1367a0 <_ChromeMain+0x131504>
 40f2820: d100a3a0     	sub	x0, x29, #0x28
 40f2824: 951b7341     	bl	0x87cf528 <_ChromeMain+0x87ca28c>
 40f2828: 52800094     	mov	w20, #0x4               ; =4
 40f282c: 17ffffd5     	b	0x40f2780 <_ChromeMain+0x40ed4e4>
 40f2830: 350008e8     	cbnz	w8, 0x40f294c <_ChromeMain+0x40ed6b0>
 40f2834: 9101c3f5     	add	x21, sp, #0x70
 40f2838: 52800048     	mov	w8, #0x2                ; =2
 40f283c: 38008428     	strb	w8, [x1], #0x8
 40f2840: b27d02a0     	orr	x0, x21, #0x8
 40f2844: 970dacb7     	bl	0x45db20 <_ChromeMain+0x458884>
 40f2848: 3941c3e8     	ldrb	w8, [sp, #0x70]
 40f284c: 7100091f     	cmp	w8, #0x2
 40f2850: 54000842     	b.hs	0x40f2958 <_ChromeMain+0x40ed6bc>
 40f2854: 37000788     	tbnz	w8, #0x0, 0x40f2944 <_ChromeMain+0x40ed6a8>
 40f2858: 910043e0     	add	x0, sp, #0x10
 40f285c: b27d02a1     	orr	x1, x21, #0x8
 40f2860: 970dacb0     	bl	0x45db20 <_ChromeMain+0x458884>
 40f2864: 9101e260     	add	x0, x19, #0x78
 40f2868: 94d97284     	bl	0x774f278 <_ChromeMain+0x7749fdc>
 40f286c: f9400be8     	ldr	x8, [sp, #0x10]
 40f2870: f9003e68     	str	x8, [x19, #0x78]
 40f2874: 3cc183e0     	ldur	q0, [sp, #0x18]
 40f2878: 3d802260     	str	q0, [x19, #0x80]
 40f287c: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 40f2880: f9000bff     	str	xzr, [sp, #0x10]
 40f2884: 91024260     	add	x0, x19, #0x90
 40f2888: 94d9727c     	bl	0x774f278 <_ChromeMain+0x7749fdc>
 40f288c: d2800014     	mov	x20, #0x0               ; =0
 40f2890: f94017e8     	ldr	x8, [sp, #0x28]
 40f2894: f9004a68     	str	x8, [x19, #0x90]
 40f2898: 3dc00fe0     	ldr	q0, [sp, #0x30]
 40f289c: 3c898260     	stur	q0, [x19, #0x98]
 40f28a0: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 40f28a4: f90017ff     	str	xzr, [sp, #0x28]
 40f28a8: f9404268     	ldr	x8, [x19, #0x80]
 40f28ac: d378dd09     	lsl	x9, x8, #8
 40f28b0: eb081128     	subs	x8, x9, x8, lsl #4
 40f28b4: 54000120     	b.eq	0x40f28d8 <_ChromeMain+0x40ed63c>
 40f28b8: d2800014     	mov	x20, #0x0               ; =0
 40f28bc: f9403e69     	ldr	x9, [x19, #0x78]
 40f28c0: 91000529     	add	x9, x9, #0x1
 40f28c4: 384f052a     	ldrb	w10, [x9], #0xf0
 40f28c8: d240014a     	eor	x10, x10, #0x1
 40f28cc: 8b0a0294     	add	x20, x20, x10
 40f28d0: f103c108     	subs	x8, x8, #0xf0
 40f28d4: 54ffff81     	b.ne	0x40f28c4 <_ChromeMain+0x40ed628>
 40f28d8: 91032260     	add	x0, x19, #0xc8
 40f28dc: aa1403e1     	mov	x1, x20
 40f28e0: 94000b6c     	bl	0x40f5690 <_ChromeMain+0x40f03f4>
 40f28e4: f9404e61     	ldr	x1, [x19, #0x98]
 40f28e8: 9108a260     	add	x0, x19, #0x228
 40f28ec: 94000b69     	bl	0x40f5690 <_ChromeMain+0x40f03f4>
 40f28f0: f9401660     	ldr	x0, [x19, #0x28]
 40f28f4: b4000380     	cbz	x0, 0x40f2964 <_ChromeMain+0x40ed6c8>
 40f28f8: f9404e68     	ldr	x8, [x19, #0x98]
 40f28fc: 8b140108     	add	x8, x8, x20
 40f2900: 390003ff     	strb	wzr, [sp]
 40f2904: f90007e8     	str	x8, [sp, #0x8]
 40f2908: f9400008     	ldr	x8, [x0]
 40f290c: f9400d08     	ldr	x8, [x8, #0x18]
 40f2910: 910003e1     	mov	x1, sp
 40f2914: d63f0100     	blr	x8
 40f2918: 910043e0     	add	x0, sp, #0x10
 40f291c: 94d9731c     	bl	0x774f58c <_ChromeMain+0x774a2f0>
 40f2920: 3941c3e8     	ldrb	w8, [sp, #0x70]
 40f2924: 721e791f     	tst	w8, #0xfffffffd
 40f2928: 54fff4e1     	b.ne	0x40f27c4 <_ChromeMain+0x40ed528>
 40f292c: b27d02a0     	orr	x0, x21, #0x8
 40f2930: 94d97317     	bl	0x774f58c <_ChromeMain+0x774a2f0>
 40f2934: 17ffffa4     	b	0x40f27c4 <_ChromeMain+0x40ed528>
 40f2938: d4200000     	brk	#0
 40f293c: d4400000     	hlt	#0
 40f2940: d4200020     	brk	#0x1
 40f2944: b9407bf4     	ldr	w20, [sp, #0x78]
 40f2948: 17ffff8c     	b	0x40f2778 <_ChromeMain+0x40ed4dc>
 40f294c: d4200000     	brk	#0
 40f2950: d4400000     	hlt	#0
 40f2954: d4200020     	brk	#0x1
 40f2958: d4200000     	brk	#0
 40f295c: d4400000     	hlt	#0
 40f2960: d4200020     	brk	#0x1
 40f2964: d4200000     	brk	#0
 40f2968: d4400000     	hlt	#0
 40f296c: d4200020     	brk	#0x1
