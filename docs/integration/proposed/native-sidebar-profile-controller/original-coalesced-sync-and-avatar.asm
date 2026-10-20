
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465f620: d10143ff     	sub	sp, sp, #0x50
 465f624: a90257f6     	stp	x22, x21, [sp, #0x20]
 465f628: a9034ff4     	stp	x20, x19, [sp, #0x30]
 465f62c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 465f630: 910103fd     	add	x29, sp, #0x40
 465f634: 3954d808     	ldrb	w8, [x0, #0x536]
 465f638: 37000688     	tbnz	w8, #0x0, 0x465f708 <_ChromeMain+0x465a46c>
 465f63c: aa0003f4     	mov	x20, x0
 465f640: 3954d408     	ldrb	w8, [x0, #0x535]
 465f644: 37000628     	tbnz	w8, #0x0, 0x465f708 <_ChromeMain+0x465a46c>
 465f648: 52800028     	mov	w8, #0x1                ; =1
 465f64c: 3914d688     	strb	w8, [x20, #0x535]
 465f650: 90053520     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 465f654: 91360000     	add	x0, x0, #0xd80
 465f658: f9400008     	ldr	x8, [x0]
 465f65c: d63f0100     	blr	x8
 465f660: f9400008     	ldr	x8, [x0]
 465f664: b40005c8     	cbz	x8, 0x465f71c <_ChromeMain+0x465a480>
 465f668: f9400113     	ldr	x19, [x8]
 465f66c: b4000593     	cbz	x19, 0x465f71c <_ChromeMain+0x465a480>
 465f670: 9004c360     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 465f674: 913ea800     	add	x0, x0, #0xfaa
 465f678: 9004c361     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 465f67c: 912c7821     	add	x1, x1, #0xb1e
 465f680: 910003e8     	mov	x8, sp
 465f684: 52827362     	mov	w2, #0x139b             ; =5019
 465f688: 96e7c57e     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 465f68c: f942ee95     	ldr	x21, [x20, #0x5d8]
 465f690: b40000d5     	cbz	x21, 0x465f6a8 <_ChromeMain+0x465a40c>
 465f694: 52800028     	mov	w8, #0x1                ; =1
 465f698: b82802a8     	ldadd	w8, w8, [x21]
 465f69c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 465f6a0: 6b09011f     	cmp	w8, w9
 465f6a4: 54000420     	b.eq	0x465f728 <_ChromeMain+0x465a48c>
 465f6a8: f942f294     	ldr	x20, [x20, #0x5e0]
 465f6ac: 52800800     	mov	w0, #0x40               ; =64
 465f6b0: 96e6bf2e     	bl	0xf368 <_ChromeMain+0xa0cc>
 465f6b4: aa0003e2     	mov	x2, x0
 465f6b8: 52800028     	mov	w8, #0x1                ; =1
 465f6bc: b9000008     	str	w8, [x0]
 465f6c0: 90ffcae8     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 465f6c4: 911c0108     	add	x8, x8, #0x700
 465f6c8: f0ffc9e9     	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 465f6cc: 91110129     	add	x9, x9, #0x440
 465f6d0: a900a408     	stp	x8, x9, [x0, #0x8]
 465f6d4: f0ffd048     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 465f6d8: 910a0108     	add	x8, x8, #0x280
 465f6dc: 100002e9     	adr	x9, 0x465f738 <_ChromeMain+0x465a49c>
 465f6e0: d503201f     	nop
 465f6e4: a901a408     	stp	x8, x9, [x0, #0x18]
 465f6e8: a902d41f     	stp	xzr, x21, [x0, #0x28]
 465f6ec: f9001c14     	str	x20, [x0, #0x38]
 465f6f0: f9400268     	ldr	x8, [x19]
 465f6f4: f9400108     	ldr	x8, [x8]
 465f6f8: 910003e1     	mov	x1, sp
 465f6fc: aa1303e0     	mov	x0, x19
 465f700: d2800003     	mov	x3, #0x0                ; =0
 465f704: d63f0100     	blr	x8
 465f708: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 465f70c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 465f710: a94257f6     	ldp	x22, x21, [sp, #0x20]
 465f714: 910143ff     	add	sp, sp, #0x50
 465f718: d65f03c0     	ret
 465f71c: d4200000     	brk	#0
 465f720: d4400000     	hlt	#0
 465f724: d4200020     	brk	#0x1
 465f728: d4200000     	brk	#0
 465f72c: d4400000     	hlt	#0
 465f730: d4200020     	brk	#0x1
 465f734: 00000000     	udf	#0x0
 465f738: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 465f73c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 465f740: 910043fd     	add	x29, sp, #0x10
 465f744: 3914d41f     	strb	wzr, [x0, #0x535]
 465f748: 3954d808     	ldrb	w8, [x0, #0x536]
 465f74c: 36000088     	tbz	w8, #0x0, 0x465f75c <_ChromeMain+0x465a4c0>
 465f750: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465f754: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465f758: d65f03c0     	ret
 465f75c: aa0003f3     	mov	x19, x0
 465f760: f9400008     	ldr	x8, [x0]
 465f764: f9403508     	ldr	x8, [x8, #0x68]
 465f768: d63f0100     	blr	x8
 465f76c: b4ffff20     	cbz	x0, 0x465f750 <_ChromeMain+0x465a4b4>
 465f770: aa1303e0     	mov	x0, x19
 465f774: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465f778: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465f77c: 14000001     	b	0x465f780 <_ChromeMain+0x465a4e4>
 465f780: d102c3ff     	sub	sp, sp, #0xb0
 465f784: a9075ff8     	stp	x24, x23, [sp, #0x70]
 465f788: a90857f6     	stp	x22, x21, [sp, #0x80]
 465f78c: a9094ff4     	stp	x20, x19, [sp, #0x90]
 465f790: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 465f794: 910283fd     	add	x29, sp, #0xa0
 465f798: 3954d808     	ldrb	w8, [x0, #0x536]
 465f79c: 37000ae8     	tbnz	w8, #0x0, 0x465f8f8 <_ChromeMain+0x465a65c>
 465f7a0: aa0003f3     	mov	x19, x0
 465f7a4: 97fffe15     	bl	0x465eff8 <_ChromeMain+0x4659d5c>
 465f7a8: aa1303e0     	mov	x0, x19
 465f7ac: 97fff8c3     	bl	0x465dab8 <_ChromeMain+0x465881c>
 465f7b0: f9427e77     	ldr	x23, [x19, #0x4f8]
 465f7b4: b4000077     	cbz	x23, 0x465f7c0 <_ChromeMain+0x465a524>
 465f7b8: 395442e8     	ldrb	w8, [x23, #0x510]
 465f7bc: 35000aa8     	cbnz	w8, 0x465f910 <_ChromeMain+0x465a674>
 465f7c0: 790a667f     	strh	wzr, [x19, #0x532]
 465f7c4: 3914d27f     	strb	wzr, [x19, #0x534]
 465f7c8: aa1303e0     	mov	x0, x19
 465f7cc: 528002c1     	mov	w1, #0x16               ; =22
 465f7d0: 940000fc     	bl	0x465fbc0 <_ChromeMain+0x465a924>
 465f7d4: f9426a68     	ldr	x8, [x19, #0x4d0]
 465f7d8: f9429d08     	ldr	x8, [x8, #0x538]
 465f7dc: f9403515     	ldr	x21, [x8, #0x68]
 465f7e0: 90050e74     	adrp	x20, 0xe82b000 <dyld_stub_binder+0xe82b000>
 465f7e4: 91284294     	add	x20, x20, #0xa10
 465f7e8: b40001b5     	cbz	x21, 0x465f81c <_ChromeMain+0x465a580>
 465f7ec: aa1503e0     	mov	x0, x21
 465f7f0: 96fb290d     	bl	0x529c24 <_ChromeMain+0x524988>
 465f7f4: 7100081f     	cmp	w0, #0x2
 465f7f8: 540000e0     	b.eq	0x465f814 <_ChromeMain+0x465a578>
 465f7fc: 394122a8     	ldrb	w8, [x21, #0x48]
 465f800: 90050e69     	adrp	x9, 0xe82b000 <dyld_stub_binder+0xe82b000>
 465f804: 913c2129     	add	x9, x9, #0xf08
 465f808: 7100011f     	cmp	w8, #0x0
 465f80c: 9a941134     	csel	x20, x9, x20, ne
 465f810: 14000003     	b	0x465f81c <_ChromeMain+0x465a580>
 465f814: 90050e74     	adrp	x20, 0xe82b000 <dyld_stub_binder+0xe82b000>
 465f818: 91252294     	add	x20, x20, #0x948
 465f81c: 52801ba8     	mov	w8, #0xdd               ; =221
 465f820: b90023e8     	str	w8, [sp, #0x20]
 465f824: 390093ff     	strb	wzr, [sp, #0x24]
 465f828: 910103e8     	add	x8, sp, #0x40
 465f82c: 910083e1     	add	x1, sp, #0x20
 465f830: aa1403e0     	mov	x0, x20
 465f834: 528002c2     	mov	w2, #0x16               ; =22
 465f838: d2800003     	mov	x3, #0x0                ; =0
 465f83c: 971e5439     	bl	0xdf4920 <_ChromeMain+0xdef684>
 465f840: f9428660     	ldr	x0, [x19, #0x508]
 465f844: f9400008     	ldr	x8, [x0]
 465f848: f9405108     	ldr	x8, [x8, #0xa0]
 465f84c: 52800021     	mov	w1, #0x1                ; =1
 465f850: d63f0100     	blr	x8
 465f854: f9428a60     	ldr	x0, [x19, #0x510]
 465f858: f9400008     	ldr	x8, [x0]
 465f85c: f9405108     	ldr	x8, [x8, #0xa0]
 465f860: 52800001     	mov	w1, #0x0                ; =0
 465f864: d63f0100     	blr	x8
 465f868: f9428660     	ldr	x0, [x19, #0x508]
 465f86c: 910103e1     	add	x1, sp, #0x40
 465f870: 96fd060c     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 465f874: 910103e0     	add	x0, sp, #0x40
 465f878: 97079bf2     	bl	0x846840 <_ChromeMain+0x8415a4>
 465f87c: aa1303e0     	mov	x0, x19
 465f880: 97fff960     	bl	0x465de00 <_ChromeMain+0x4658b64>
 465f884: f9428e60     	ldr	x0, [x19, #0x518]
 465f888: 52801bb4     	mov	w20, #0xdd              ; =221
 465f88c: f9000bf4     	str	x20, [sp, #0x10]
 465f890: f9400008     	ldr	x8, [x0]
 465f894: f941f508     	ldr	x8, [x8, #0x3e8]
 465f898: 910043e1     	add	x1, sp, #0x10
 465f89c: d63f0100     	blr	x8
 465f8a0: f9429260     	ldr	x0, [x19, #0x520]
 465f8a4: f90007f4     	str	x20, [sp, #0x8]
 465f8a8: f9400008     	ldr	x8, [x0]
 465f8ac: f941f508     	ldr	x8, [x8, #0x3e8]
 465f8b0: 910023e1     	add	x1, sp, #0x8
 465f8b4: d63f0100     	blr	x8
 465f8b8: f9429673     	ldr	x19, [x19, #0x528]
 465f8bc: 52801bc8     	mov	w8, #0xde               ; =222
 465f8c0: b90003e8     	str	w8, [sp]
 465f8c4: 390013ff     	strb	wzr, [sp, #0x4]
 465f8c8: b0051ba0     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 465f8cc: 913d4000     	add	x0, x0, #0xf50
 465f8d0: 910103e8     	add	x8, sp, #0x40
 465f8d4: 910003e1     	mov	x1, sp
 465f8d8: 528000e2     	mov	w2, #0x7                ; =7
 465f8dc: d2800003     	mov	x3, #0x0                ; =0
 465f8e0: 971e5410     	bl	0xdf4920 <_ChromeMain+0xdef684>
 465f8e4: 910103e1     	add	x1, sp, #0x40
 465f8e8: aa1303e0     	mov	x0, x19
 465f8ec: 96fd05ed     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 465f8f0: 910103e0     	add	x0, sp, #0x40
 465f8f4: 97079bd3     	bl	0x846840 <_ChromeMain+0x8415a4>
 465f8f8: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 465f8fc: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 465f900: a94857f6     	ldp	x22, x21, [sp, #0x80]
 465f904: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 465f908: 9102c3ff     	add	sp, sp, #0xb0
 465f90c: d65f03c0     	ret
 465f910: 9113a2f4     	add	x20, x23, #0x4e8
 465f914: 395422e8     	ldrb	w8, [x23, #0x508]
 465f918: 7100051f     	cmp	w8, #0x1
 465f91c: 54000e21     	b.ne	0x465fae0 <_ChromeMain+0x465a844>
 465f920: f9400288     	ldr	x8, [x20]
 465f924: b4fff4e8     	cbz	x8, 0x465f7c0 <_ChromeMain+0x465a524>
 465f928: f9400d08     	ldr	x8, [x8, #0x18]
 465f92c: b4fff4a8     	cbz	x8, 0x465f7c0 <_ChromeMain+0x465a524>
 465f930: 52800028     	mov	w8, #0x1                ; =1
 465f934: 3914ca68     	strb	w8, [x19, #0x532]
 465f938: f9426a68     	ldr	x8, [x19, #0x4d0]
 465f93c: f9429d08     	ldr	x8, [x8, #0x538]
 465f940: f9403515     	ldr	x21, [x8, #0x68]
 465f944: f0054438     	adrp	x24, 0xeee6000 <dyld_stub_binder+0xeee6000>
 465f948: b4000315     	cbz	x21, 0x465f9a8 <_ChromeMain+0x465a70c>
 465f94c: f9467f00     	ldr	x0, [x24, #0xcf8]
 465f950: 974f008a     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 465f954: b40002a0     	cbz	x0, 0x465f9a8 <_ChromeMain+0x465a70c>
 465f958: 974f00ae     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 465f95c: aa0003f6     	mov	x22, x0
 465f960: f94002a8     	ldr	x8, [x21]
 465f964: f940a908     	ldr	x8, [x8, #0x150]
 465f968: aa1503e0     	mov	x0, x21
 465f96c: d63f0100     	blr	x8
 465f970: f9400008     	ldr	x8, [x0]
 465f974: f9401909     	ldr	x9, [x8, #0x30]
 465f978: 910103e8     	add	x8, sp, #0x40
 465f97c: d63f0120     	blr	x9
 465f980: 910103e1     	add	x1, sp, #0x40
 465f984: aa1603e0     	mov	x0, x22
 465f988: 974f00de     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 465f98c: aa0003f5     	mov	x21, x0
 465f990: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 465f994: 37f808e8     	tbnz	w8, #0x1f, 0x465fab0 <_ChromeMain+0x465a814>
 465f998: b4000095     	cbz	x21, 0x465f9a8 <_ChromeMain+0x465a70c>
 465f99c: aa1503e0     	mov	x0, x21
 465f9a0: 97838f2a     	bl	0x2743648 <_ChromeMain+0x273e3ac>
 465f9a4: 370003e0     	tbnz	w0, #0x0, 0x465fa20 <_ChromeMain+0x465a784>
 465f9a8: 3914ce7f     	strb	wzr, [x19, #0x533]
 465f9ac: f9426a68     	ldr	x8, [x19, #0x4d0]
 465f9b0: f9429d08     	ldr	x8, [x8, #0x538]
 465f9b4: f9403515     	ldr	x21, [x8, #0x68]
 465f9b8: b4000415     	cbz	x21, 0x465fa38 <_ChromeMain+0x465a79c>
 465f9bc: f9467f00     	ldr	x0, [x24, #0xcf8]
 465f9c0: 974f006e     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 465f9c4: b40003a0     	cbz	x0, 0x465fa38 <_ChromeMain+0x465a79c>
 465f9c8: 974f0092     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 465f9cc: aa0003f6     	mov	x22, x0
 465f9d0: f94002a8     	ldr	x8, [x21]
 465f9d4: f940a908     	ldr	x8, [x8, #0x150]
 465f9d8: aa1503e0     	mov	x0, x21
 465f9dc: d63f0100     	blr	x8
 465f9e0: f9400008     	ldr	x8, [x0]
 465f9e4: f9401909     	ldr	x9, [x8, #0x30]
 465f9e8: 910103e8     	add	x8, sp, #0x40
 465f9ec: d63f0120     	blr	x9
 465f9f0: 910103e1     	add	x1, sp, #0x40
 465f9f4: aa1603e0     	mov	x0, x22
 465f9f8: 974f00c2     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 465f9fc: aa0003f5     	mov	x21, x0
 465fa00: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 465fa04: 37f80628     	tbnz	w8, #0x1f, 0x465fac8 <_ChromeMain+0x465a82c>
 465fa08: b4000195     	cbz	x21, 0x465fa38 <_ChromeMain+0x465a79c>
 465fa0c: aa1503e0     	mov	x0, x21
 465fa10: 97ebec0a     	bl	0x415aa38 <_ChromeMain+0x415579c>
 465fa14: f100681f     	cmp	x0, #0x1a
 465fa18: 1a9f17e8     	cset	w8, eq
 465fa1c: 14000008     	b	0x465fa3c <_ChromeMain+0x465a7a0>
 465fa20: aa1503e0     	mov	x0, x21
 465fa24: 97838f47     	bl	0x2743740 <_ChromeMain+0x273e4a4>
 465fa28: f100001f     	cmp	x0, #0x0
 465fa2c: 1a9f07e8     	cset	w8, ne
 465fa30: 3914ce68     	strb	w8, [x19, #0x533]
 465fa34: b4fffbc0     	cbz	x0, 0x465f9ac <_ChromeMain+0x465a710>
 465fa38: 52800008     	mov	w8, #0x0                ; =0
 465fa3c: 3914d268     	strb	w8, [x19, #0x534]
 465fa40: aa1303e0     	mov	x0, x19
 465fa44: 52800281     	mov	w1, #0x14               ; =20
 465fa48: 9400005e     	bl	0x465fbc0 <_ChromeMain+0x465a924>
 465fa4c: 3954ce68     	ldrb	w8, [x19, #0x533]
 465fa50: 350000c8     	cbnz	w8, 0x465fa68 <_ChromeMain+0x465a7cc>
 465fa54: 3954d268     	ldrb	w8, [x19, #0x534]
 465fa58: 35000168     	cbnz	w8, 0x465fa84 <_ChromeMain+0x465a7e8>
 465fa5c: f90033ff     	str	xzr, [sp, #0x60]
 465fa60: 6f00e400     	movi.2d	v0, #0000000000000000
 465fa64: ad0203e0     	stp	q0, q0, [sp, #0x40]
 465fa68: 395442e8     	ldrb	w8, [x23, #0x510]
 465fa6c: 36000a48     	tbz	w8, #0x0, 0x465fbb4 <_ChromeMain+0x465a918>
 465fa70: 910103e8     	add	x8, sp, #0x40
 465fa74: aa1403e0     	mov	x0, x20
 465fa78: 52800281     	mov	w1, #0x14               ; =20
 465fa7c: 94d1cd83     	bl	0x7ad3088 <_ChromeMain+0x7acddec>
 465fa80: 17ffff70     	b	0x465f840 <_ChromeMain+0x465a5a4>
 465fa84: f9428660     	ldr	x0, [x19, #0x508]
 465fa88: f9400008     	ldr	x8, [x0]
 465fa8c: f9405108     	ldr	x8, [x8, #0xa0]
 465fa90: 52800001     	mov	w1, #0x0                ; =0
 465fa94: d63f0100     	blr	x8
 465fa98: f9428a60     	ldr	x0, [x19, #0x510]
 465fa9c: f9400008     	ldr	x8, [x0]
 465faa0: f9405108     	ldr	x8, [x8, #0xa0]
 465faa4: 52800021     	mov	w1, #0x1                ; =1
 465faa8: d63f0100     	blr	x8
 465faac: 17ffff74     	b	0x465f87c <_ChromeMain+0x465a5e0>
 465fab0: f94023e0     	ldr	x0, [sp, #0x40]
 465fab4: f9402be8     	ldr	x8, [sp, #0x50]
 465fab8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 465fabc: 96e6a4ff     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465fac0: b5fff6f5     	cbnz	x21, 0x465f99c <_ChromeMain+0x465a700>
 465fac4: 17ffffb9     	b	0x465f9a8 <_ChromeMain+0x465a70c>
 465fac8: f94023e0     	ldr	x0, [sp, #0x40]
 465facc: f9402be8     	ldr	x8, [sp, #0x50]
 465fad0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 465fad4: 96e6a4f9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465fad8: b5fff9b5     	cbnz	x21, 0x465fa0c <_ChromeMain+0x465a770>
 465fadc: 17ffffd7     	b	0x465fa38 <_ChromeMain+0x465a79c>
 465fae0: 35ffe708     	cbnz	w8, 0x465f7c0 <_ChromeMain+0x465a524>
 465fae4: f9400288     	ldr	x8, [x20]
 465fae8: b4ffe6c8     	cbz	x8, 0x465f7c0 <_ChromeMain+0x465a524>
 465faec: 790a667f     	strh	wzr, [x19, #0x532]
 465faf0: 3914d27f     	strb	wzr, [x19, #0x534]
 465faf4: aa1303e0     	mov	x0, x19
 465faf8: 528002c1     	mov	w1, #0x16               ; =22
 465fafc: 94000031     	bl	0x465fbc0 <_ChromeMain+0x465a924>
 465fb00: 6f00e400     	movi.2d	v0, #0000000000000000
 465fb04: ad0103e0     	stp	q0, q0, [sp, #0x20]
 465fb08: 395442e8     	ldrb	w8, [x23, #0x510]
 465fb0c: 36000548     	tbz	w8, #0x0, 0x465fbb4 <_ChromeMain+0x465a918>
 465fb10: 910083e8     	add	x8, sp, #0x20
 465fb14: aa1403e0     	mov	x0, x20
 465fb18: 9707a00f     	bl	0x847b54 <_ChromeMain+0x8428b8>
 465fb1c: f94013e0     	ldr	x0, [sp, #0x20]
 465fb20: 52801ba8     	mov	w8, #0xdd               ; =221
 465fb24: b9001be8     	str	w8, [sp, #0x18]
 465fb28: 390073ff     	strb	wzr, [sp, #0x1c]
 465fb2c: 910103e8     	add	x8, sp, #0x40
 465fb30: 910063e1     	add	x1, sp, #0x18
 465fb34: 528002c2     	mov	w2, #0x16               ; =22
 465fb38: d2800003     	mov	x3, #0x0                ; =0
 465fb3c: 971e5379     	bl	0xdf4920 <_ChromeMain+0xdef684>
 465fb40: f9428660     	ldr	x0, [x19, #0x508]
 465fb44: f9400008     	ldr	x8, [x0]
 465fb48: f9405108     	ldr	x8, [x8, #0xa0]
 465fb4c: 52800021     	mov	w1, #0x1                ; =1
 465fb50: d63f0100     	blr	x8
 465fb54: f9428a60     	ldr	x0, [x19, #0x510]
 465fb58: f9400008     	ldr	x8, [x0]
 465fb5c: f9405108     	ldr	x8, [x8, #0xa0]
 465fb60: 52800001     	mov	w1, #0x0                ; =0
 465fb64: d63f0100     	blr	x8
 465fb68: f9428660     	ldr	x0, [x19, #0x508]
 465fb6c: 910103e1     	add	x1, sp, #0x40
 465fb70: 96fd054c     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 465fb74: 910103e0     	add	x0, sp, #0x40
 465fb78: 97079b32     	bl	0x846840 <_ChromeMain+0x8415a4>
 465fb7c: f9401fe0     	ldr	x0, [sp, #0x38]
 465fb80: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465fb84: f0052a94     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465fb88: f9404689     	ldr	x9, [x20, #0x88]
 465fb8c: eb09011f     	cmp	x8, x9
 465fb90: 54000140     	b.eq	0x465fbb8 <_ChromeMain+0x465a91c>
 465fb94: f9001fff     	str	xzr, [sp, #0x38]
 465fb98: f94013e0     	ldr	x0, [sp, #0x20]
 465fb9c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465fba0: f9404689     	ldr	x9, [x20, #0x88]
 465fba4: eb09011f     	cmp	x8, x9
 465fba8: 54ffe6a1     	b.ne	0x465f87c <_ChromeMain+0x465a5e0>
 465fbac: 96e70ba4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465fbb0: 17ffff33     	b	0x465f87c <_ChromeMain+0x465a5e0>
 465fbb4: d4200020     	brk	#0x1
 465fbb8: 96e70ba1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465fbbc: 17fffff6     	b	0x465fb94 <_ChromeMain+0x465a8f8>
