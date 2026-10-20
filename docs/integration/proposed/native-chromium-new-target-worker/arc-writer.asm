
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426c618: d103c3ff     	sub	sp, sp, #0xf0
 426c61c: a90b5ff8     	stp	x24, x23, [sp, #0xb0]
 426c620: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 426c624: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 426c628: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 426c62c: 910383fd     	add	x29, sp, #0xe0
 426c630: f9400428     	ldr	x8, [x1, #0x8]
 426c634: b4001688     	cbz	x8, 0x426c904 <_ChromeMain+0x4267668>
 426c638: aa0103f4     	mov	x20, x1
 426c63c: aa0003f3     	mov	x19, x0
 426c640: 6f00e400     	movi.2d	v0, #0000000000000000
 426c644: ad0003e0     	stp	q0, q0, [sp]
 426c648: ad0403e0     	stp	q0, q0, [sp, #0x80]
 426c64c: ad0303e0     	stp	q0, q0, [sp, #0x60]
 426c650: 9004b8c0     	adrp	x0, 0xd984000 <dyld_stub_binder+0xd984000>
 426c654: 911a9800     	add	x0, x0, #0x6a6
 426c658: d004c7e1     	adrp	x1, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 426c65c: 91311421     	add	x1, x1, #0xc45
 426c660: 910103e8     	add	x8, sp, #0x40
 426c664: 52804fa2     	mov	w2, #0x27d              ; =637
 426c668: 96f79186     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 426c66c: 910183e0     	add	x0, sp, #0x60
 426c670: 910103e1     	add	x1, sp, #0x40
 426c674: 52800002     	mov	w2, #0x0                ; =0
 426c678: 971893e3     	bl	0x891604 <_ChromeMain+0x88c368>
 426c67c: 39c05e68     	ldrsb	w8, [x19, #0x17]
 426c680: aa1303e0     	mov	x0, x19
 426c684: 36f80048     	tbz	w8, #0x1f, 0x426c68c <_ChromeMain+0x42673f0>
 426c688: f9400260     	ldr	x0, [x19]
 426c68c: 52800001     	mov	w1, #0x0                ; =0
 426c690: 957495a0     	bl	0x9f91d10 <_ChromeMain+0x9f8ca74>
 426c694: aa0003f5     	mov	x21, x0
 426c698: 910183e0     	add	x0, sp, #0x60
 426c69c: 9720093a     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 426c6a0: 340010b5     	cbz	w21, 0x426c8b4 <_ChromeMain+0x4267618>
 426c6a4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 426c6a8: f9002bff     	str	xzr, [sp, #0x50]
 426c6ac: 52800028     	mov	w8, #0x1                ; =1
 426c6b0: 3900ffe8     	strb	w8, [sp, #0x3f]
 426c6b4: 9100a3e8     	add	x8, sp, #0x28
 426c6b8: b2400109     	orr	x9, x8, #0x1
 426c6bc: b004abea     	adrp	x10, 0xd7e9000 <dyld_stub_binder+0xd7e9000>
 426c6c0: 91110d4a     	add	x10, x10, #0x443
 426c6c4: eb0a013f     	cmp	x9, x10
 426c6c8: fa4a8102     	ccmp	x8, x10, #0x2, hi
 426c6cc: 54002e89     	b.ls	0x426cc9c <_ChromeMain+0x4267a00>
 426c6d0: 52800628     	mov	w8, #0x31               ; =49
 426c6d4: 790053e8     	strh	w8, [sp, #0x28]
 426c6d8: 9004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426c6dc: 91163821     	add	x1, x1, #0x58e
 426c6e0: 9004c5a2     	adrp	x2, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426c6e4: 91167042     	add	x2, x2, #0x59c
 426c6e8: 9100a3f5     	add	x21, sp, #0x28
 426c6ec: 910183e8     	add	x8, sp, #0x60
 426c6f0: 9100a3e0     	add	x0, sp, #0x28
 426c6f4: 94000532     	bl	0x426dbbc <_ChromeMain+0x4268920>
 426c6f8: 9004c181     	adrp	x1, 0xda9c000 <dyld_stub_binder+0xda9c000>
 426c6fc: 911f2021     	add	x1, x1, #0x7c8
 426c700: 910103e0     	add	x0, sp, #0x40
 426c704: 910183e3     	add	x3, sp, #0x60
 426c708: 52800182     	mov	w2, #0xc                ; =12
 426c70c: 971e0dd8     	bl	0x9efe6c <_ChromeMain+0x9eabd0>
 426c710: 910183e0     	add	x0, sp, #0x60
 426c714: 971bc75b     	bl	0x95e480 <_ChromeMain+0x9591e4>
 426c718: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 426c71c: 36f800a8     	tbz	w8, #0x1f, 0x426c730 <_ChromeMain+0x4267494>
 426c720: f94017e0     	ldr	x0, [sp, #0x28]
 426c724: f9401fe8     	ldr	x8, [sp, #0x38]
 426c728: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426c72c: 96f671e3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426c730: 52800028     	mov	w8, #0x1                ; =1
 426c734: 3900ffe8     	strb	w8, [sp, #0x3f]
 426c738: b24002a8     	orr	x8, x21, #0x1
 426c73c: b004b0a9     	adrp	x9, 0xd881000 <dyld_stub_binder+0xd881000>
 426c740: 911e6529     	add	x9, x9, #0x799
 426c744: eb09011f     	cmp	x8, x9
 426c748: fa4982a2     	ccmp	x21, x9, #0x2, hi
 426c74c: 54002a89     	b.ls	0x426cc9c <_ChromeMain+0x4267a00>
 426c750: 52800648     	mov	w8, #0x32               ; =50
 426c754: 790053e8     	strh	w8, [sp, #0x28]
 426c758: 9004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426c75c: 91170421     	add	x1, x1, #0x5c1
 426c760: 9004c5a2     	adrp	x2, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426c764: 91174442     	add	x2, x2, #0x5d1
 426c768: 9100a3f5     	add	x21, sp, #0x28
 426c76c: 910183e8     	add	x8, sp, #0x60
 426c770: 9100a3e0     	add	x0, sp, #0x28
 426c774: 94000512     	bl	0x426dbbc <_ChromeMain+0x4268920>
 426c778: b004abc1     	adrp	x1, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 426c77c: 913ae821     	add	x1, x1, #0xeba
 426c780: 910103e0     	add	x0, sp, #0x40
 426c784: 910183e3     	add	x3, sp, #0x60
 426c788: 528000a2     	mov	w2, #0x5                ; =5
 426c78c: 971e0db8     	bl	0x9efe6c <_ChromeMain+0x9eabd0>
 426c790: 910183e0     	add	x0, sp, #0x60
 426c794: 971bc73b     	bl	0x95e480 <_ChromeMain+0x9591e4>
 426c798: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 426c79c: 36f800a8     	tbz	w8, #0x1f, 0x426c7b0 <_ChromeMain+0x4267514>
 426c7a0: f94017e0     	ldr	x0, [sp, #0x28]
 426c7a4: f9401fe8     	ldr	x8, [sp, #0x38]
 426c7a8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426c7ac: 96f671c3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426c7b0: 52800028     	mov	w8, #0x1                ; =1
 426c7b4: 3900ffe8     	strb	w8, [sp, #0x3f]
 426c7b8: b24002a8     	orr	x8, x21, #0x1
 426c7bc: f004b5e9     	adrp	x9, 0xd92b000 <dyld_stub_binder+0xd92b000>
 426c7c0: 910a3d29     	add	x9, x9, #0x28f
 426c7c4: eb09011f     	cmp	x8, x9
 426c7c8: fa4982a2     	ccmp	x21, x9, #0x2, hi
 426c7cc: 54002689     	b.ls	0x426cc9c <_ChromeMain+0x4267a00>
 426c7d0: 52800668     	mov	w8, #0x33               ; =51
 426c7d4: 790053e8     	strh	w8, [sp, #0x28]
 426c7d8: 9004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426c7dc: 9117f421     	add	x1, x1, #0x5fd
 426c7e0: 9004c5a2     	adrp	x2, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426c7e4: 91183842     	add	x2, x2, #0x60e
 426c7e8: 910183e8     	add	x8, sp, #0x60
 426c7ec: 9100a3e0     	add	x0, sp, #0x28
 426c7f0: 940004f3     	bl	0x426dbbc <_ChromeMain+0x4268920>
 426c7f4: 9004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426c7f8: 9117d821     	add	x1, x1, #0x5f6
 426c7fc: 910103e0     	add	x0, sp, #0x40
 426c800: 910183e3     	add	x3, sp, #0x60
 426c804: 528000c2     	mov	w2, #0x6                ; =6
 426c808: 971e0d99     	bl	0x9efe6c <_ChromeMain+0x9eabd0>
 426c80c: 910183e0     	add	x0, sp, #0x60
 426c810: 971bc71c     	bl	0x95e480 <_ChromeMain+0x9591e4>
 426c814: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 426c818: 36f800a8     	tbz	w8, #0x1f, 0x426c82c <_ChromeMain+0x4267590>
 426c81c: f94017e0     	ldr	x0, [sp, #0x28]
 426c820: f9401fe8     	ldr	x8, [sp, #0x38]
 426c824: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426c828: 96f671a4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426c82c: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 426c830: f90017ff     	str	xzr, [sp, #0x28]
 426c834: 9004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426c838: 9118cc21     	add	x1, x1, #0x633
 426c83c: 9100a3e0     	add	x0, sp, #0x28
 426c840: 910103e3     	add	x3, sp, #0x40
 426c844: 528000a2     	mov	w2, #0x5                ; =5
 426c848: 971e0d89     	bl	0x9efe6c <_ChromeMain+0x9eabd0>
 426c84c: 52800028     	mov	w8, #0x1                ; =1
 426c850: b90063e8     	str	w8, [sp, #0x60]
 426c854: 52800048     	mov	w8, #0x2                ; =2
 426c858: 3901e3e8     	strb	w8, [sp, #0x78]
 426c85c: 9004ac81     	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 426c860: 91296421     	add	x1, x1, #0xa59
 426c864: 9100a3e0     	add	x0, sp, #0x28
 426c868: 910183e3     	add	x3, sp, #0x60
 426c86c: 528000e2     	mov	w2, #0x7                ; =7
 426c870: 970b3994     	bl	0x53aec0 <_ChromeMain+0x535c24>
 426c874: 3941e3e8     	ldrb	w8, [sp, #0x78]
 426c878: 7103fd1f     	cmp	w8, #0xff
 426c87c: 54000060     	b.eq	0x426c888 <_ChromeMain+0x42675ec>
 426c880: 7100091f     	cmp	w8, #0x2
 426c884: 54000c21     	b.ne	0x426ca08 <_ChromeMain+0x426776c>
 426c888: 910103e0     	add	x0, sp, #0x40
 426c88c: 971bc6fd     	bl	0x95e480 <_ChromeMain+0x9591e4>
 426c890: 394063e8     	ldrb	w8, [sp, #0x18]
 426c894: 350004c8     	cbnz	w8, 0x426c92c <_ChromeMain+0x4267690>
 426c898: f94017e8     	ldr	x8, [sp, #0x28]
 426c89c: 3cc303e0     	ldur	q0, [sp, #0x30]
 426c8a0: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 426c8a4: f9001fff     	str	xzr, [sp, #0x38]
 426c8a8: 52800029     	mov	w9, #0x1                ; =1
 426c8ac: 390063e9     	strb	w9, [sp, #0x18]
 426c8b0: 14000025     	b	0x426c944 <_ChromeMain+0x42676a8>
 426c8b4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 426c8b8: f9002bff     	str	xzr, [sp, #0x50]
 426c8bc: 910103f5     	add	x21, sp, #0x40
 426c8c0: 910103e1     	add	x1, sp, #0x40
 426c8c4: aa1303e0     	mov	x0, x19
 426c8c8: 92800002     	mov	x2, #-0x1               ; =-1
 426c8cc: 977498af     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 426c8d0: 35000aa0     	cbnz	w0, 0x426ca24 <_ChromeMain+0x4267788>
 426c8d4: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 426c8d8: 36f800a8     	tbz	w8, #0x1f, 0x426c8ec <_ChromeMain+0x4267650>
 426c8dc: f94023e0     	ldr	x0, [sp, #0x40]
 426c8e0: f9402be8     	ldr	x8, [sp, #0x50]
 426c8e4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426c8e8: 96f67174     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426c8ec: 52800017     	mov	w23, #0x0               ; =0
 426c8f0: 394063e8     	ldrb	w8, [sp, #0x18]
 426c8f4: 340000a8     	cbz	w8, 0x426c908 <_ChromeMain+0x426766c>
 426c8f8: 910003e0     	mov	x0, sp
 426c8fc: 971bc6e1     	bl	0x95e480 <_ChromeMain+0x9591e4>
 426c900: 14000002     	b	0x426c908 <_ChromeMain+0x426766c>
 426c904: 52800037     	mov	w23, #0x1               ; =1
 426c908: aa1703e0     	mov	x0, x23
 426c90c: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 426c910: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 426c914: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 426c918: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 426c91c: 9103c3ff     	add	sp, sp, #0xf0
 426c920: d65f03c0     	ret
 426c924: d2800016     	mov	x22, #0x0               ; =0
 426c928: 14000016     	b	0x426c980 <_ChromeMain+0x42676e4>
 426c92c: 910003e0     	mov	x0, sp
 426c930: 978aad3c     	bl	0x2517e20 <_ChromeMain+0x2512b84>
 426c934: f94017e8     	ldr	x8, [sp, #0x28]
 426c938: 3cc303e0     	ldur	q0, [sp, #0x30]
 426c93c: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 426c940: f90017ff     	str	xzr, [sp, #0x28]
 426c944: f90003e8     	str	x8, [sp]
 426c948: 3c8083e0     	stur	q0, [sp, #0x8]
 426c94c: 9100a3e0     	add	x0, sp, #0x28
 426c950: 971bc6cc     	bl	0x95e480 <_ChromeMain+0x9591e4>
 426c954: 394063e8     	ldrb	w8, [sp, #0x18]
 426c958: 36001a28     	tbz	w8, #0x0, 0x426cc9c <_ChromeMain+0x4267a00>
 426c95c: f004c581     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 426c960: 91102c21     	add	x1, x1, #0x40b
 426c964: 910003e0     	mov	x0, sp
 426c968: 52800362     	mov	w2, #0x1b               ; =27
 426c96c: 9707f8f5     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426c970: b4fffda0     	cbz	x0, 0x426c924 <_ChromeMain+0x4267688>
 426c974: 39406008     	ldrb	w8, [x0, #0x18]
 426c978: 71001d1f     	cmp	w8, #0x7
 426c97c: 9a9f0016     	csel	x22, x0, xzr, eq
 426c980: 394063e8     	ldrb	w8, [sp, #0x18]
 426c984: 360018c8     	tbz	w8, #0x0, 0x426cc9c <_ChromeMain+0x4267a00>
 426c988: 9004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426c98c: 91136421     	add	x1, x1, #0x4d9
 426c990: 910003e0     	mov	x0, sp
 426c994: 52800242     	mov	w2, #0x12               ; =18
 426c998: 9707f8ea     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426c99c: b4fffa80     	cbz	x0, 0x426c8ec <_ChromeMain+0x4267650>
 426c9a0: 52800017     	mov	w23, #0x0               ; =0
 426c9a4: b4fffa76     	cbz	x22, 0x426c8f0 <_ChromeMain+0x4267654>
 426c9a8: aa0003f5     	mov	x21, x0
 426c9ac: 39406008     	ldrb	w8, [x0, #0x18]
 426c9b0: 7100191f     	cmp	w8, #0x6
 426c9b4: 54fff9e1     	b.ne	0x426c8f0 <_ChromeMain+0x4267654>
 426c9b8: b9002bff     	str	wzr, [sp, #0x28]
 426c9bc: 394063e8     	ldrb	w8, [sp, #0x18]
 426c9c0: 360016e8     	tbz	w8, #0x0, 0x426cc9c <_ChromeMain+0x4267a00>
 426c9c4: f004ac01     	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426c9c8: 9109e421     	add	x1, x1, #0x279
 426c9cc: 910003e0     	mov	x0, sp
 426c9d0: 52800042     	mov	w2, #0x2                ; =2
 426c9d4: 9776f42b     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 426c9d8: b40005a0     	cbz	x0, 0x426ca8c <_ChromeMain+0x42677f0>
 426c9dc: b90063ff     	str	wzr, [sp, #0x60]
 426c9e0: 39805c01     	ldrsb	x1, [x0, #0x17]
 426c9e4: b6f80041     	tbz	x1, #0x3f, 0x426c9ec <_ChromeMain+0x4267750>
 426c9e8: a9400400     	ldp	x0, x1, [x0]
 426c9ec: 910183e2     	add	x2, sp, #0x60
 426c9f0: 97594d3d     	bl	0x18bfee4 <_ChromeMain+0x18bac48>
 426c9f4: 340004c0     	cbz	w0, 0x426ca8c <_ChromeMain+0x42677f0>
 426c9f8: b94063e8     	ldr	w8, [sp, #0x60]
 426c9fc: 0aa87d08     	bic	w8, w8, w8, asr #31
 426ca00: b9002be8     	str	w8, [sp, #0x28]
 426ca04: 14000023     	b	0x426ca90 <_ChromeMain+0x42677f4>
 426ca08: b00532a9     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 426ca0c: 9121e129     	add	x9, x9, #0x878
 426ca10: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 426ca14: d100c7a0     	sub	x0, x29, #0x31
 426ca18: 910183e1     	add	x1, sp, #0x60
 426ca1c: d63f0100     	blr	x8
 426ca20: 17ffff9a     	b	0x426c888 <_ChromeMain+0x42675ec>
 426ca24: 39815fe8     	ldrsb	x8, [sp, #0x57]
 426ca28: a9442be9     	ldp	x9, x10, [sp, #0x40]
 426ca2c: f100011f     	cmp	x8, #0x0
 426ca30: 9a954120     	csel	x0, x9, x21, mi
 426ca34: 7100011f     	cmp	w8, #0x0
 426ca38: 9a884141     	csel	x1, x10, x8, mi
 426ca3c: 910183e8     	add	x8, sp, #0x60
 426ca40: 52800002     	mov	w2, #0x0                ; =0
 426ca44: 52801903     	mov	w3, #0xc8               ; =200
 426ca48: 9765553d     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 426ca4c: 910003e0     	mov	x0, sp
 426ca50: 910183e1     	add	x1, sp, #0x60
 426ca54: 9451c526     	bl	0x56ddeec <_ChromeMain+0x56d8c50>
 426ca58: 3941e3e8     	ldrb	w8, [sp, #0x78]
 426ca5c: 34000068     	cbz	w8, 0x426ca68 <_ChromeMain+0x42677cc>
 426ca60: 910183e0     	add	x0, sp, #0x60
 426ca64: 971bc687     	bl	0x95e480 <_ChromeMain+0x9591e4>
 426ca68: 394063f5     	ldrb	w21, [sp, #0x18]
 426ca6c: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 426ca70: 36f800a8     	tbz	w8, #0x1f, 0x426ca84 <_ChromeMain+0x42677e8>
 426ca74: f94023e0     	ldr	x0, [sp, #0x40]
 426ca78: f9402be8     	ldr	x8, [sp, #0x50]
 426ca7c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426ca80: 96f6710e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426ca84: 3707f695     	tbnz	w21, #0x0, 0x426c954 <_ChromeMain+0x42676b8>
 426ca88: 17ffff99     	b	0x426c8ec <_ChromeMain+0x4267650>
 426ca8c: 52800008     	mov	w8, #0x0                ; =0
 426ca90: f94007e9     	ldr	x9, [sp, #0x8]
 426ca94: d37be937     	lsl	x23, x9, #5
 426ca98: b4000137     	cbz	x23, 0x426cabc <_ChromeMain+0x4267820>
 426ca9c: f94003e8     	ldr	x8, [sp]
 426caa0: 91006118     	add	x24, x8, #0x18
 426caa4: f8420700     	ldr	x0, [x24], #0x20
 426caa8: 9100a3e1     	add	x1, sp, #0x28
 426caac: 940004d5     	bl	0x426de00 <_ChromeMain+0x4268b64>
 426cab0: f10082f7     	subs	x23, x23, #0x20
 426cab4: 54ffff81     	b.ne	0x426caa4 <_ChromeMain+0x4267808>
 426cab8: b9402be8     	ldr	w8, [sp, #0x28]
 426cabc: 11000508     	add	w8, w8, #0x1
 426cac0: b9002be8     	str	w8, [sp, #0x28]
 426cac4: 9100a3e1     	add	x1, sp, #0x28
 426cac8: aa1403e0     	mov	x0, x20
 426cacc: aa1603e2     	mov	x2, x22
 426cad0: 940000a7     	bl	0x426cd6c <_ChromeMain+0x4267ad0>
 426cad4: b0054a28     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 426cad8: f9468508     	ldr	x8, [x8, #0xd08]
 426cadc: 10319aa9     	adr	x9, 0x42cfe30 <_ChromeMain+0x42cab94>
 426cae0: d503201f     	nop
 426cae4: eb09011f     	cmp	x8, x9
 426cae8: 54000d61     	b.ne	0x426cc94 <_ChromeMain+0x42679f8>
 426caec: 94f713a9     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 426caf0: 1e602008     	fcmp	d0, #0.0
 426caf4: 54000d60     	b.eq	0x426cca0 <_ChromeMain+0x4267a04>
 426caf8: 92f00000     	mov	x0, #0x7fffffffffffffff ; =9223372036854775807
 426cafc: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 426cb00: 9e670101     	fmov	d1, x8
 426cb04: 1e612000     	fcmp	d0, d1
 426cb08: 540003a0     	b.eq	0x426cb7c <_ChromeMain+0x42678e0>
 426cb0c: 9004ede8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 426cb10: f9444908     	ldr	x8, [x8, #0x890]
 426cb14: fd400101     	ldr	d1, [x8]
 426cb18: 1e612800     	fadd	d0, d0, d1
 426cb1c: f004e6e8     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 426cb20: fd45ad01     	ldr	d1, [x8, #0xb58]
 426cb24: 1e610800     	fmul	d0, d0, d1
 426cb28: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 426cb2c: 9e670101     	fmov	d1, x8
 426cb30: 1e612000     	fcmp	d0, d1
 426cb34: 9a80b3e8     	csel	x8, xzr, x0, lt
 426cb38: 1e616801     	fmaxnm	d1, d0, d1
 426cb3c: 9e780029     	fcvtzs	x9, d1
 426cb40: 92f7840a     	mov	x10, #0x43dfffffffffffff ; =4890909195324358655
 426cb44: 9e670141     	fmov	d1, x10
 426cb48: 1e612000     	fcmp	d0, d1
 426cb4c: 9a889120     	csel	x0, x9, x8, ls
 426cb50: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 426cb54: 8b080008     	add	x8, x0, x8
 426cb58: f100091f     	cmp	x8, #0x2
 426cb5c: 54000103     	b.lo	0x426cb7c <_ChromeMain+0x42678e0>
 426cb60: d2880008     	mov	x8, #0x4000             ; =16384
 426cb64: f2a910c8     	movk	x8, #0x4886, lsl #16
 426cb68: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 426cb6c: f2e00528     	movk	x8, #0x29, lsl #48
 426cb70: ab080008     	adds	x8, x0, x8
 426cb74: 92f00009     	mov	x9, #0x7fffffffffffffff ; =9223372036854775807
 426cb78: 9a886120     	csel	x0, x9, x8, vs
 426cb7c: 910103e8     	add	x8, sp, #0x40
 426cb80: 975a82c9     	bl	0x190d6a4 <_ChromeMain+0x1908408>
 426cb84: 3dc013e0     	ldr	q0, [sp, #0x40]
 426cb88: 3d801be0     	str	q0, [sp, #0x60]
 426cb8c: f9402be8     	ldr	x8, [sp, #0x50]
 426cb90: f9003be8     	str	x8, [sp, #0x70]
 426cb94: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 426cb98: f9002bff     	str	xzr, [sp, #0x50]
 426cb9c: 52800088     	mov	w8, #0x4                ; =4
 426cba0: 3901e3e8     	strb	w8, [sp, #0x78]
 426cba4: 9004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426cba8: 9113b021     	add	x1, x1, #0x4ec
 426cbac: 910183e3     	add	x3, sp, #0x60
 426cbb0: aa1503e0     	mov	x0, x21
 426cbb4: 528001a2     	mov	w2, #0xd                ; =13
 426cbb8: 970b38c2     	bl	0x53aec0 <_ChromeMain+0x535c24>
 426cbbc: 3941e3e8     	ldrb	w8, [sp, #0x78]
 426cbc0: f103fd1f     	cmp	x8, #0xff
 426cbc4: 540000e0     	b.eq	0x426cbe0 <_ChromeMain+0x4267944>
 426cbc8: b00532a9     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 426cbcc: 9121e129     	add	x9, x9, #0x878
 426cbd0: f8687928     	ldr	x8, [x9, x8, lsl #3]
 426cbd4: d100c7a0     	sub	x0, x29, #0x31
 426cbd8: 910183e1     	add	x1, sp, #0x60
 426cbdc: d63f0100     	blr	x8
 426cbe0: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 426cbe4: 36f800a8     	tbz	w8, #0x1f, 0x426cbf8 <_ChromeMain+0x426795c>
 426cbe8: f94023e0     	ldr	x0, [sp, #0x40]
 426cbec: f9402be8     	ldr	x8, [sp, #0x50]
 426cbf0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426cbf4: 96f670b1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426cbf8: 394063e8     	ldrb	w8, [sp, #0x18]
 426cbfc: 36000508     	tbz	w8, #0x0, 0x426cc9c <_ChromeMain+0x4267a00>
 426cc00: d004bbc1     	adrp	x1, 0xd9e6000 <dyld_stub_binder+0xd9e6000>
 426cc04: 910ad421     	add	x1, x1, #0x2b5
 426cc08: 910003f4     	mov	x20, sp
 426cc0c: 910003e0     	mov	x0, sp
 426cc10: 52800102     	mov	w2, #0x8                ; =8
 426cc14: 9761db6b     	bl	0x1ae39c0 <_ChromeMain+0x1ade724>
 426cc18: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 426cc1c: f9002bff     	str	xzr, [sp, #0x50]
 426cc20: 394063e8     	ldrb	w8, [sp, #0x18]
 426cc24: 360003c8     	tbz	w8, #0x0, 0x426cc9c <_ChromeMain+0x4267a00>
 426cc28: f90033f4     	str	x20, [sp, #0x60]
 426cc2c: 528000c8     	mov	w8, #0x6                ; =6
 426cc30: 3901c3e8     	strb	w8, [sp, #0x70]
 426cc34: 910103f4     	add	x20, sp, #0x40
 426cc38: 910183e0     	add	x0, sp, #0x60
 426cc3c: 910103e2     	add	x2, sp, #0x40
 426cc40: 52800001     	mov	w1, #0x0                ; =0
 426cc44: 52801903     	mov	w3, #0xc8               ; =200
 426cc48: 979376d6     	bl	0x274a7a0 <_ChromeMain+0x2745504>
 426cc4c: 52800017     	mov	w23, #0x0               ; =0
 426cc50: 34000140     	cbz	w0, 0x426cc78 <_ChromeMain+0x42679dc>
 426cc54: 39815fe8     	ldrsb	x8, [sp, #0x57]
 426cc58: a9442be9     	ldp	x9, x10, [sp, #0x40]
 426cc5c: f100011f     	cmp	x8, #0x0
 426cc60: 9a944121     	csel	x1, x9, x20, mi
 426cc64: 7100011f     	cmp	w8, #0x0
 426cc68: 9a884142     	csel	x2, x10, x8, mi
 426cc6c: aa1303e0     	mov	x0, x19
 426cc70: 977c7dd4     	bl	0x218c3c0 <_ChromeMain+0x2187124>
 426cc74: aa0003f7     	mov	x23, x0
 426cc78: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 426cc7c: 36ffe3a8     	tbz	w8, #0x1f, 0x426c8f0 <_ChromeMain+0x4267654>
 426cc80: f94023e0     	ldr	x0, [sp, #0x40]
 426cc84: f9402be8     	ldr	x8, [sp, #0x50]
 426cc88: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426cc8c: 96f6708b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426cc90: 17ffff18     	b	0x426c8f0 <_ChromeMain+0x4267654>
 426cc94: d63f0100     	blr	x8
 426cc98: 17ffffb9     	b	0x426cb7c <_ChromeMain+0x42678e0>
 426cc9c: d4200020     	brk	#0x1
 426cca0: d2800000     	mov	x0, #0x0                ; =0
 426cca4: 17ffffb6     	b	0x426cb7c <_ChromeMain+0x42678e0>
 426cca8: d503201f     	nop
 426ccac: d503201f     	nop
 426ccb0: d503201f     	nop
 426ccb4: d503201f     	nop
 426ccb8: d503201f     	nop
 426ccbc: d503201f     	nop
 426ccc0: b4000501     	cbz	x1, 0x426cd60 <_ChromeMain+0x4267ac4>
 426ccc4: d10103ff     	sub	sp, sp, #0x40
 426ccc8: a90157f6     	stp	x22, x21, [sp, #0x10]
 426cccc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 426ccd0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 426ccd4: 9100c3fd     	add	x29, sp, #0x30
 426ccd8: aa0103f3     	mov	x19, x1
 426ccdc: aa0003f4     	mov	x20, x0
 426cce0: f004ac01     	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426cce4: 9109e421     	add	x1, x1, #0x279
 426cce8: 52800042     	mov	w2, #0x2                ; =2
 426ccec: 9776f365     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 426ccf0: b40001a0     	cbz	x0, 0x426cd24 <_ChromeMain+0x4267a88>
 426ccf4: b9000fff     	str	wzr, [sp, #0xc]
 426ccf8: 39805c01     	ldrsb	x1, [x0, #0x17]
 426ccfc: b6f80041     	tbz	x1, #0x3f, 0x426cd04 <_ChromeMain+0x4267a68>
 426cd00: a9400400     	ldp	x0, x1, [x0]
 426cd04: 910033e2     	add	x2, sp, #0xc
 426cd08: 97594c77     	bl	0x18bfee4 <_ChromeMain+0x18bac48>
 426cd0c: 340000c0     	cbz	w0, 0x426cd24 <_ChromeMain+0x4267a88>
 426cd10: b9400268     	ldr	w8, [x19]
 426cd14: b9400fe9     	ldr	w9, [sp, #0xc]
 426cd18: 6b09011f     	cmp	w8, w9
 426cd1c: 1a89c108     	csel	w8, w8, w9, gt
 426cd20: b9000268     	str	w8, [x19]
 426cd24: f9400688     	ldr	x8, [x20, #0x8]
 426cd28: d37be915     	lsl	x21, x8, #5
 426cd2c: b4000115     	cbz	x21, 0x426cd4c <_ChromeMain+0x4267ab0>
 426cd30: f9400288     	ldr	x8, [x20]
 426cd34: 91006114     	add	x20, x8, #0x18
 426cd38: f8420680     	ldr	x0, [x20], #0x20
 426cd3c: aa1303e1     	mov	x1, x19
 426cd40: 94000430     	bl	0x426de00 <_ChromeMain+0x4268b64>
 426cd44: f10082b5     	subs	x21, x21, #0x20
 426cd48: 54ffff81     	b.ne	0x426cd38 <_ChromeMain+0x4267a9c>
 426cd4c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 426cd50: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 426cd54: a94157f6     	ldp	x22, x21, [sp, #0x10]
 426cd58: 910103ff     	add	sp, sp, #0x40
 426cd5c: d65f03c0     	ret
 426cd60: d4200000     	brk	#0
 426cd64: d4400000     	hlt	#0
 426cd68: d4200020     	brk	#0x1
