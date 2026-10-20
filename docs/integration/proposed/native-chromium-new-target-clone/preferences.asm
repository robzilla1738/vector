
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425e608: d10503ff     	sub	sp, sp, #0x140
 425e60c: a90e6ffc     	stp	x28, x27, [sp, #0xe0]
 425e610: a90f67fa     	stp	x26, x25, [sp, #0xf0]
 425e614: a9105ff8     	stp	x24, x23, [sp, #0x100]
 425e618: a91157f6     	stp	x22, x21, [sp, #0x110]
 425e61c: a9124ff4     	stp	x20, x19, [sp, #0x120]
 425e620: a9137bfd     	stp	x29, x30, [sp, #0x130]
 425e624: 9104c3fd     	add	x29, sp, #0x130
 425e628: aa0403f5     	mov	x21, x4
 425e62c: aa0303f4     	mov	x20, x3
 425e630: aa0203f7     	mov	x23, x2
 425e634: aa0103f6     	mov	x22, x1
 425e638: aa0003f8     	mov	x24, x0
 425e63c: d004ee48     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 425e640: f940f908     	ldr	x8, [x8, #0x1f0]
 425e644: f9400108     	ldr	x8, [x8]
 425e648: f81a03a8     	stur	x8, [x29, #-0x60]
 425e64c: 977f177d     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 425e650: 34000220     	cbz	w0, 0x425e694 <_ChromeMain+0x42593f8>
 425e654: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 425e658: f90043ff     	str	xzr, [sp, #0x80]
 425e65c: 9101c3f3     	add	x19, sp, #0x70
 425e660: 9101c3e1     	add	x1, sp, #0x70
 425e664: aa1803e0     	mov	x0, x24
 425e668: 92800002     	mov	x2, #-0x1               ; =-1
 425e66c: 9774d147     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 425e670: 35000320     	cbnz	w0, 0x425e6d4 <_ChromeMain+0x4259438>
 425e674: 52800018     	mov	w24, #0x0               ; =0
 425e678: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 425e67c: 36f800e8     	tbz	w8, #0x1f, 0x425e698 <_ChromeMain+0x42593fc>
 425e680: f9403be0     	ldr	x0, [sp, #0x70]
 425e684: f94043e8     	ldr	x8, [sp, #0x80]
 425e688: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425e68c: 96f6aa0b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425e690: 14000002     	b	0x425e698 <_ChromeMain+0x42593fc>
 425e694: 52800038     	mov	w24, #0x1               ; =1
 425e698: f85a03a8     	ldur	x8, [x29, #-0x60]
 425e69c: d004ee49     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 425e6a0: f940f929     	ldr	x9, [x9, #0x1f0]
 425e6a4: f9400129     	ldr	x9, [x9]
 425e6a8: eb08013f     	cmp	x9, x8
 425e6ac: 540034a1     	b.ne	0x425ed40 <_ChromeMain+0x4259aa4>
 425e6b0: aa1803e0     	mov	x0, x24
 425e6b4: a9537bfd     	ldp	x29, x30, [sp, #0x130]
 425e6b8: a9524ff4     	ldp	x20, x19, [sp, #0x120]
 425e6bc: a95157f6     	ldp	x22, x21, [sp, #0x110]
 425e6c0: a9505ff8     	ldp	x24, x23, [sp, #0x100]
 425e6c4: a94f67fa     	ldp	x26, x25, [sp, #0xf0]
 425e6c8: a94e6ffc     	ldp	x28, x27, [sp, #0xe0]
 425e6cc: 910503ff     	add	sp, sp, #0x140
 425e6d0: d65f03c0     	ret
 425e6d4: f90003f8     	str	x24, [sp]
 425e6d8: 6f00e400     	movi.2d	v0, #0000000000000000
 425e6dc: ad0283e0     	stp	q0, q0, [sp, #0x50]
 425e6e0: 39821fe8     	ldrsb	x8, [sp, #0x87]
 425e6e4: a9472be9     	ldp	x9, x10, [sp, #0x70]
 425e6e8: f100011f     	cmp	x8, #0x0
 425e6ec: 9a934120     	csel	x0, x9, x19, mi
 425e6f0: 7100011f     	cmp	w8, #0x0
 425e6f4: 9a884141     	csel	x1, x10, x8, mi
 425e6f8: 910143e8     	add	x8, sp, #0x50
 425e6fc: 52800002     	mov	w2, #0x0                ; =0
 425e700: 52801903     	mov	w3, #0xc8               ; =200
 425e704: 97658e0e     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 425e708: 52800018     	mov	w24, #0x0               ; =0
 425e70c: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425e710: 34fffb48     	cbz	w8, 0x425e678 <_ChromeMain+0x42593dc>
 425e714: b50027f7     	cbnz	x23, 0x425ec10 <_ChromeMain+0x4259974>
 425e718: 90046401     	adrp	x1, 0xcede000 <dyld_stub_binder+0xcede000>
 425e71c: 912a0021     	add	x1, x1, #0xa80
 425e720: 910223e8     	add	x8, sp, #0x88
 425e724: 910143e0     	add	x0, sp, #0x50
 425e728: 52800262     	mov	w2, #0x13               ; =19
 425e72c: 9769acfd     	bl	0x1cc9b20 <_ChromeMain+0x1cc4884>
 425e730: 3942a3e8     	ldrb	w8, [sp, #0xa8]
 425e734: 35002ca8     	cbnz	w8, 0x425ecc8 <_ChromeMain+0x4259a2c>
 425e738: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425e73c: 36002928     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425e740: 90046401     	adrp	x1, 0xcede000 <dyld_stub_binder+0xcede000>
 425e744: 9123cc21     	add	x1, x1, #0x8f3
 425e748: 910223e8     	add	x8, sp, #0x88
 425e74c: 910143e0     	add	x0, sp, #0x50
 425e750: 528002a2     	mov	w2, #0x15               ; =21
 425e754: 9769acf3     	bl	0x1cc9b20 <_ChromeMain+0x1cc4884>
 425e758: 3942a3e8     	ldrb	w8, [sp, #0xa8]
 425e75c: 35002ca8     	cbnz	w8, 0x425ecf0 <_ChromeMain+0x4259a54>
 425e760: 710012df     	cmp	w22, #0x4
 425e764: 54000921     	b.ne	0x425e888 <_ChromeMain+0x42595ec>
 425e768: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425e76c: 360027a8     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425e770: b00463c1     	adrp	x1, 0xced7000 <dyld_stub_binder+0xced7000>
 425e774: 91051021     	add	x1, x1, #0x144
 425e778: 910143e0     	add	x0, sp, #0x50
 425e77c: 528003a2     	mov	w2, #0x1d               ; =29
 425e780: 97083170     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425e784: b5002700     	cbnz	x0, 0x425ec64 <_ChromeMain+0x42599c8>
 425e788: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425e78c: 360026a8     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425e790: d00463e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 425e794: 912bbc21     	add	x1, x1, #0xaef
 425e798: 910143e0     	add	x0, sp, #0x50
 425e79c: 52800282     	mov	w2, #0x14               ; =20
 425e7a0: 97083168     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425e7a4: b4000620     	cbz	x0, 0x425e868 <_ChromeMain+0x42595cc>
 425e7a8: aa0003f6     	mov	x22, x0
 425e7ac: 39406008     	ldrb	w8, [x0, #0x18]
 425e7b0: 71001d1f     	cmp	w8, #0x7
 425e7b4: 540005a1     	b.ne	0x425e868 <_ChromeMain+0x42595cc>
 425e7b8: a94022d7     	ldp	x23, x8, [x22]
 425e7bc: 8b0816e9     	add	x9, x23, x8, lsl #5
 425e7c0: eb0902ff     	cmp	x23, x9
 425e7c4: 54002ea8     	b.hi	0x425ed98 <_ChromeMain+0x4259afc>
 425e7c8: aa1703ea     	mov	x10, x23
 425e7cc: aa1703f3     	mov	x19, x23
 425e7d0: aa0903f8     	mov	x24, x9
 425e7d4: 14000006     	b	0x425e7ec <_ChromeMain+0x4259550>
 425e7d8: 910082f7     	add	x23, x23, #0x20
 425e7dc: a94022ca     	ldp	x10, x8, [x22]
 425e7e0: 8b081549     	add	x9, x10, x8, lsl #5
 425e7e4: eb09015f     	cmp	x10, x9
 425e7e8: 54002d28     	b.hi	0x425ed8c <_ChromeMain+0x4259af0>
 425e7ec: eb0a027f     	cmp	x19, x10
 425e7f0: 54002c21     	b.ne	0x425ed74 <_ChromeMain+0x4259ad8>
 425e7f4: eb09031f     	cmp	x24, x9
 425e7f8: 54002c41     	b.ne	0x425ed80 <_ChromeMain+0x4259ae4>
 425e7fc: eb0902ff     	cmp	x23, x9
 425e800: 54000220     	b.eq	0x425e844 <_ChromeMain+0x42595a8>
 425e804: b4fffeb7     	cbz	x23, 0x425e7d8 <_ChromeMain+0x425953c>
 425e808: 394062e8     	ldrb	w8, [x23, #0x18]
 425e80c: 7100111f     	cmp	w8, #0x4
 425e810: 54fffe41     	b.ne	0x425e7d8 <_ChromeMain+0x425953c>
 425e814: aa1703e0     	mov	x0, x23
 425e818: 9400017f     	bl	0x425ee14 <_ChromeMain+0x4259b78>
 425e81c: 34fffde0     	cbz	w0, 0x425e7d8 <_ChromeMain+0x425953c>
 425e820: a903dff3     	stp	x19, x23, [sp, #0x38]
 425e824: f90027f8     	str	x24, [sp, #0x48]
 425e828: 910223e8     	add	x8, sp, #0x88
 425e82c: 9100e3e1     	add	x1, sp, #0x38
 425e830: aa1603e0     	mov	x0, x22
 425e834: 951684b3     	bl	0x87ffb00 <_ChromeMain+0x87fa864>
 425e838: a948dff3     	ldp	x19, x23, [sp, #0x88]
 425e83c: f9404ff8     	ldr	x24, [sp, #0x98]
 425e840: 17ffffe7     	b	0x425e7dc <_ChromeMain+0x4259540>
 425e844: b5000128     	cbnz	x8, 0x425e868 <_ChromeMain+0x42595cc>
 425e848: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425e84c: 360020a8     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425e850: d00463e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 425e854: 912b5021     	add	x1, x1, #0xad4
 425e858: 910143e0     	add	x0, sp, #0x50
 425e85c: 52800342     	mov	w2, #0x1a               ; =26
 425e860: 97083138     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425e864: b5002a00     	cbnz	x0, 0x425eda4 <_ChromeMain+0x4259b08>
 425e868: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425e86c: 36001fa8     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425e870: d00463e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 425e874: 91151821     	add	x1, x1, #0x546
 425e878: 910143e0     	add	x0, sp, #0x50
 425e87c: 52800102     	mov	w2, #0x8                ; =8
 425e880: 97083130     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425e884: b5001960     	cbnz	x0, 0x425ebb0 <_ChromeMain+0x4259914>
 425e888: f9400aa8     	ldr	x8, [x21, #0x10]
 425e88c: b40008c8     	cbz	x8, 0x425e9a4 <_ChromeMain+0x4259708>
 425e890: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425e894: 36001e68     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425e898: 910022b7     	add	x23, x21, #0x8
 425e89c: b004c601     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425e8a0: 9126f421     	add	x1, x1, #0x9bd
 425e8a4: 910143e0     	add	x0, sp, #0x50
 425e8a8: 52800262     	mov	w2, #0x13               ; =19
 425e8ac: 97083125     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425e8b0: b4000360     	cbz	x0, 0x425e91c <_ChromeMain+0x4259680>
 425e8b4: aa0003f6     	mov	x22, x0
 425e8b8: 39406008     	ldrb	w8, [x0, #0x18]
 425e8bc: 7100191f     	cmp	w8, #0x6
 425e8c0: 540002e1     	b.ne	0x425e91c <_ChromeMain+0x4259680>
 425e8c4: f94002b3     	ldr	x19, [x21]
 425e8c8: 14000009     	b	0x425e8ec <_ChromeMain+0x4259650>
 425e8cc: 91008261     	add	x1, x19, #0x20
 425e8d0: aa1603e0     	mov	x0, x22
 425e8d4: 9762143b     	bl	0x1ae39c0 <_ChromeMain+0x1ade724>
 425e8d8: f9400668     	ldr	x8, [x19, #0x8]
 425e8dc: b4000148     	cbz	x8, 0x425e904 <_ChromeMain+0x4259668>
 425e8e0: aa0803f3     	mov	x19, x8
 425e8e4: f9400108     	ldr	x8, [x8]
 425e8e8: b5ffffc8     	cbnz	x8, 0x425e8e0 <_ChromeMain+0x4259644>
 425e8ec: eb17027f     	cmp	x19, x23
 425e8f0: 54000160     	b.eq	0x425e91c <_ChromeMain+0x4259680>
 425e8f4: 3980de62     	ldrsb	x2, [x19, #0x37]
 425e8f8: b6fffea2     	tbz	x2, #0x3f, 0x425e8cc <_ChromeMain+0x4259630>
 425e8fc: a9420a61     	ldp	x1, x2, [x19, #0x20]
 425e900: 17fffff4     	b	0x425e8d0 <_ChromeMain+0x4259634>
 425e904: aa1303e8     	mov	x8, x19
 425e908: f9400a73     	ldr	x19, [x19, #0x10]
 425e90c: f9400269     	ldr	x9, [x19]
 425e910: eb09011f     	cmp	x8, x9
 425e914: 54ffff81     	b.ne	0x425e904 <_ChromeMain+0x4259668>
 425e918: 17fffff5     	b	0x425e8ec <_ChromeMain+0x4259650>
 425e91c: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425e920: 34001a08     	cbz	w8, 0x425ec60 <_ChromeMain+0x42599c4>
 425e924: b004c601     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425e928: 9114a021     	add	x1, x1, #0x528
 425e92c: 910143e0     	add	x0, sp, #0x50
 425e930: 52800262     	mov	w2, #0x13               ; =19
 425e934: 97083103     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425e938: b4001280     	cbz	x0, 0x425eb88 <_ChromeMain+0x42598ec>
 425e93c: aa0003f6     	mov	x22, x0
 425e940: 39406008     	ldrb	w8, [x0, #0x18]
 425e944: 7100191f     	cmp	w8, #0x6
 425e948: 54001201     	b.ne	0x425eb88 <_ChromeMain+0x42598ec>
 425e94c: f94002b3     	ldr	x19, [x21]
 425e950: 14000009     	b	0x425e974 <_ChromeMain+0x42596d8>
 425e954: 91008261     	add	x1, x19, #0x20
 425e958: aa1603e0     	mov	x0, x22
 425e95c: 97621419     	bl	0x1ae39c0 <_ChromeMain+0x1ade724>
 425e960: f9400668     	ldr	x8, [x19, #0x8]
 425e964: b4000148     	cbz	x8, 0x425e98c <_ChromeMain+0x42596f0>
 425e968: aa0803f3     	mov	x19, x8
 425e96c: f9400108     	ldr	x8, [x8]
 425e970: b5ffffc8     	cbnz	x8, 0x425e968 <_ChromeMain+0x42596cc>
 425e974: eb17027f     	cmp	x19, x23
 425e978: 54001080     	b.eq	0x425eb88 <_ChromeMain+0x42598ec>
 425e97c: 3980de62     	ldrsb	x2, [x19, #0x37]
 425e980: b6fffea2     	tbz	x2, #0x3f, 0x425e954 <_ChromeMain+0x42596b8>
 425e984: a9420a61     	ldp	x1, x2, [x19, #0x20]
 425e988: 17fffff4     	b	0x425e958 <_ChromeMain+0x42596bc>
 425e98c: aa1303e8     	mov	x8, x19
 425e990: f9400a73     	ldr	x19, [x19, #0x10]
 425e994: f9400269     	ldr	x9, [x19]
 425e998: eb09011f     	cmp	x8, x9
 425e99c: 54ffff81     	b.ne	0x425e98c <_ChromeMain+0x42596f0>
 425e9a0: 17fffff5     	b	0x425e974 <_ChromeMain+0x42596d8>
 425e9a4: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 425e9a8: f81903bf     	stur	xzr, [x29, #-0x70]
 425e9ac: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425e9b0: 36001588     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425e9b4: 910143e8     	add	x8, sp, #0x50
 425e9b8: f90047e8     	str	x8, [sp, #0x88]
 425e9bc: 528000c8     	mov	w8, #0x6                ; =6
 425e9c0: 390263e8     	strb	w8, [sp, #0x98]
 425e9c4: d10203b3     	sub	x19, x29, #0x80
 425e9c8: 910223e0     	add	x0, sp, #0x88
 425e9cc: d10203a2     	sub	x2, x29, #0x80
 425e9d0: 52800001     	mov	w1, #0x0                ; =0
 425e9d4: 52801903     	mov	w3, #0xc8               ; =200
 425e9d8: 9793af72     	bl	0x274a7a0 <_ChromeMain+0x2745504>
 425e9dc: 52800018     	mov	w24, #0x0               ; =0
 425e9e0: 34000140     	cbz	w0, 0x425ea08 <_ChromeMain+0x425976c>
 425e9e4: 389973a8     	ldursb	x8, [x29, #-0x69]
 425e9e8: a9782ba9     	ldp	x9, x10, [x29, #-0x80]
 425e9ec: f100011f     	cmp	x8, #0x0
 425e9f0: 9a934121     	csel	x1, x9, x19, mi
 425e9f4: 7100011f     	cmp	w8, #0x0
 425e9f8: 9a884142     	csel	x2, x10, x8, mi
 425e9fc: f94003e0     	ldr	x0, [sp]
 425ea00: 977cb670     	bl	0x218c3c0 <_ChromeMain+0x2187124>
 425ea04: aa0003f8     	mov	x24, x0
 425ea08: 38d973a8     	ldursb	w8, [x29, #-0x69]
 425ea0c: 36f800a8     	tbz	w8, #0x1f, 0x425ea20 <_ChromeMain+0x4259784>
 425ea10: f85803a0     	ldur	x0, [x29, #-0x80]
 425ea14: f85903a8     	ldur	x8, [x29, #-0x70]
 425ea18: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ea1c: 96f6a927     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ea20: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425ea24: 34ffe2a8     	cbz	w8, 0x425e678 <_ChromeMain+0x42593dc>
 425ea28: 910143e0     	add	x0, sp, #0x50
 425ea2c: 971bfe95     	bl	0x95e480 <_ChromeMain+0x9591e4>
 425ea30: 17ffff12     	b	0x425e678 <_ChromeMain+0x42593dc>
 425ea34: a940a7e8     	ldp	x8, x9, [sp, #0x8]
 425ea38: 91002129     	add	x9, x9, #0x8
 425ea3c: eb08013f     	cmp	x9, x8
 425ea40: 54fffb20     	b.eq	0x425e9a4 <_ChromeMain+0x4259708>
 425ea44: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425ea48: 360010c8     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425ea4c: f9400134     	ldr	x20, [x9]
 425ea50: b4001094     	cbz	x20, 0x425ec60 <_ChromeMain+0x42599c4>
 425ea54: f9000be9     	str	x9, [sp, #0x10]
 425ea58: aa1403e0     	mov	x0, x20
 425ea5c: 94f69250     	bl	0x800339c <_ChromeMain+0x7ffe100>
 425ea60: aa0003e2     	mov	x2, x0
 425ea64: 910143e0     	add	x0, sp, #0x50
 425ea68: aa1403e1     	mov	x1, x20
 425ea6c: 970830b5     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425ea70: b4fffe20     	cbz	x0, 0x425ea34 <_ChromeMain+0x4259798>
 425ea74: aa0003f4     	mov	x20, x0
 425ea78: 39406008     	ldrb	w8, [x0, #0x18]
 425ea7c: 71001d1f     	cmp	w8, #0x7
 425ea80: 54fffda1     	b.ne	0x425ea34 <_ChromeMain+0x4259798>
 425ea84: a9406a99     	ldp	x25, x26, [x20]
 425ea88: 8b1a1728     	add	x8, x25, x26, lsl #5
 425ea8c: eb08033f     	cmp	x25, x8
 425ea90: 540016c8     	b.hi	0x425ed68 <_ChromeMain+0x4259acc>
 425ea94: aa1903fb     	mov	x27, x25
 425ea98: aa1903fc     	mov	x28, x25
 425ea9c: aa0803f3     	mov	x19, x8
 425eaa0: 14000008     	b	0x425eac0 <_ChromeMain+0x4259824>
 425eaa4: 540004e2     	b.hs	0x425eb40 <_ChromeMain+0x42598a4>
 425eaa8: f94002f7     	ldr	x23, [x23]
 425eaac: b50002f7     	cbnz	x23, 0x425eb08 <_ChromeMain+0x425986c>
 425eab0: 9100839c     	add	x28, x28, #0x20
 425eab4: 8b1a1728     	add	x8, x25, x26, lsl #5
 425eab8: eb08033f     	cmp	x25, x8
 425eabc: 54001508     	b.hi	0x425ed5c <_ChromeMain+0x4259ac0>
 425eac0: eb19037f     	cmp	x27, x25
 425eac4: 54001401     	b.ne	0x425ed44 <_ChromeMain+0x4259aa8>
 425eac8: eb08027f     	cmp	x19, x8
 425eacc: 54001421     	b.ne	0x425ed50 <_ChromeMain+0x4259ab4>
 425ead0: eb08039f     	cmp	x28, x8
 425ead4: 54fffb00     	b.eq	0x425ea34 <_ChromeMain+0x4259798>
 425ead8: 39406388     	ldrb	w8, [x28, #0x18]
 425eadc: 7100111f     	cmp	w8, #0x4
 425eae0: 54fffe81     	b.ne	0x425eab0 <_ChromeMain+0x4259814>
 425eae4: f9400fe8     	ldr	x8, [sp, #0x18]
 425eae8: f9400117     	ldr	x23, [x8]
 425eaec: b4fffe37     	cbz	x23, 0x425eab0 <_ChromeMain+0x4259814>
 425eaf0: 39805f88     	ldrsb	x8, [x28, #0x17]
 425eaf4: a9402b89     	ldp	x9, x10, [x28]
 425eaf8: f100011f     	cmp	x8, #0x0
 425eafc: 9a9c4135     	csel	x21, x9, x28, mi
 425eb00: 7100011f     	cmp	w8, #0x0
 425eb04: 9a884158     	csel	x24, x10, x8, mi
 425eb08: aa1703e8     	mov	x8, x23
 425eb0c: f8420d09     	ldr	x9, [x8, #0x20]!
 425eb10: 39805d0a     	ldrsb	x10, [x8, #0x17]
 425eb14: f100015f     	cmp	x10, #0x0
 425eb18: 9a884121     	csel	x1, x9, x8, mi
 425eb1c: f9400508     	ldr	x8, [x8, #0x8]
 425eb20: 7100015f     	cmp	w10, #0x0
 425eb24: 9a8a4116     	csel	x22, x8, x10, mi
 425eb28: eb1802df     	cmp	x22, x24
 425eb2c: 9a9832c2     	csel	x2, x22, x24, lo
 425eb30: aa1503e0     	mov	x0, x21
 425eb34: 94f6ab4b     	bl	0x8009860 <_ChromeMain+0x80045c4>
 425eb38: 340000a0     	cbz	w0, 0x425eb4c <_ChromeMain+0x42598b0>
 425eb3c: 37fffb60     	tbnz	w0, #0x1f, 0x425eaa8 <_ChromeMain+0x425980c>
 425eb40: f94006f7     	ldr	x23, [x23, #0x8]
 425eb44: b4fffb77     	cbz	x23, 0x425eab0 <_ChromeMain+0x4259814>
 425eb48: 17fffff0     	b	0x425eb08 <_ChromeMain+0x425986c>
 425eb4c: eb16031f     	cmp	x24, x22
 425eb50: 54fffaa1     	b.ne	0x425eaa4 <_ChromeMain+0x4259808>
 425eb54: f9400fe8     	ldr	x8, [sp, #0x18]
 425eb58: eb0802ff     	cmp	x23, x8
 425eb5c: 54fffaa0     	b.eq	0x425eab0 <_ChromeMain+0x4259814>
 425eb60: a90273fb     	stp	x27, x28, [sp, #0x20]
 425eb64: f9001bf3     	str	x19, [sp, #0x30]
 425eb68: 910223e8     	add	x8, sp, #0x88
 425eb6c: 910083e1     	add	x1, sp, #0x20
 425eb70: aa1403e0     	mov	x0, x20
 425eb74: 951683e3     	bl	0x87ffb00 <_ChromeMain+0x87fa864>
 425eb78: a948f3fb     	ldp	x27, x28, [sp, #0x88]
 425eb7c: f9404ff3     	ldr	x19, [sp, #0x98]
 425eb80: a9406a99     	ldp	x25, x26, [x20]
 425eb84: 17ffffcc     	b	0x425eab4 <_ChromeMain+0x4259818>
 425eb88: b0053248     	adrp	x8, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 425eb8c: d503201f     	nop
 425eb90: 3dc0bd00     	ldr	q0, [x8, #0x2f0]
 425eb94: 3c9803a0     	stur	q0, [x29, #-0x80]
 425eb98: d10203a9     	sub	x9, x29, #0x80
 425eb9c: 91004128     	add	x8, x9, #0x10
 425eba0: f90007e8     	str	x8, [sp, #0x8]
 425eba4: 91002288     	add	x8, x20, #0x8
 425eba8: f9000fe8     	str	x8, [sp, #0x18]
 425ebac: 17ffffa6     	b	0x425ea44 <_ChromeMain+0x42597a8>
 425ebb0: 39406008     	ldrb	w8, [x0, #0x18]
 425ebb4: 7100111f     	cmp	w8, #0x4
 425ebb8: 54ffe681     	b.ne	0x425e888 <_ChromeMain+0x42595ec>
 425ebbc: 94000096     	bl	0x425ee14 <_ChromeMain+0x4259b78>
 425ebc0: 34ffe640     	cbz	w0, 0x425e888 <_ChromeMain+0x42595ec>
 425ebc4: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425ebc8: 360004c8     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425ebcc: d00463e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 425ebd0: 91151821     	add	x1, x1, #0x546
 425ebd4: 910223e8     	add	x8, sp, #0x88
 425ebd8: 910143e0     	add	x0, sp, #0x50
 425ebdc: 52800102     	mov	w2, #0x8                ; =8
 425ebe0: 9769abd0     	bl	0x1cc9b20 <_ChromeMain+0x1cc4884>
 425ebe4: 3942a3e8     	ldrb	w8, [sp, #0xa8]
 425ebe8: 35000988     	cbnz	w8, 0x425ed18 <_ChromeMain+0x4259a7c>
 425ebec: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425ebf0: 36000388     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425ebf4: d00463e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 425ebf8: 91153c21     	add	x1, x1, #0x54f
 425ebfc: 910143e0     	add	x0, sp, #0x50
 425ec00: 528002c2     	mov	w2, #0x16               ; =22
 425ec04: 52800023     	mov	w3, #0x1                ; =1
 425ec08: 951681ee     	bl	0x87ff3c0 <_ChromeMain+0x87fa124>
 425ec0c: 17ffff1f     	b	0x425e888 <_ChromeMain+0x42595ec>
 425ec10: 39805ee1     	ldrsb	x1, [x23, #0x17]
 425ec14: b6f80041     	tbz	x1, #0x3f, 0x425ec1c <_ChromeMain+0x4259980>
 425ec18: a94006f7     	ldp	x23, x1, [x23]
 425ec1c: 910223e8     	add	x8, sp, #0x88
 425ec20: aa1703e0     	mov	x0, x23
 425ec24: 97351039     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 425ec28: d00463c1     	adrp	x1, 0xced8000 <dyld_stub_binder+0xced8000>
 425ec2c: 913d4021     	add	x1, x1, #0xf50
 425ec30: 910143e0     	add	x0, sp, #0x50
 425ec34: 910223e3     	add	x3, sp, #0x88
 425ec38: 52800182     	mov	w2, #0xc                ; =12
 425ec3c: 9516823b     	bl	0x87ff528 <_ChromeMain+0x87fa28c>
 425ec40: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 425ec44: 36f800a8     	tbz	w8, #0x1f, 0x425ec58 <_ChromeMain+0x42599bc>
 425ec48: f94047e0     	ldr	x0, [sp, #0x88]
 425ec4c: f9404fe8     	ldr	x8, [sp, #0x98]
 425ec50: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ec54: 96f6a899     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ec58: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425ec5c: 3707d5e8     	tbnz	w8, #0x0, 0x425e718 <_ChromeMain+0x425947c>
 425ec60: d4200020     	brk	#0x1
 425ec64: 39406008     	ldrb	w8, [x0, #0x18]
 425ec68: 7100111f     	cmp	w8, #0x4
 425ec6c: 54ffd8e1     	b.ne	0x425e788 <_ChromeMain+0x42594ec>
 425ec70: 94000069     	bl	0x425ee14 <_ChromeMain+0x4259b78>
 425ec74: 34ffd8a0     	cbz	w0, 0x425e788 <_ChromeMain+0x42594ec>
 425ec78: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425ec7c: 3607ff28     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425ec80: b00463c1     	adrp	x1, 0xced7000 <dyld_stub_binder+0xced7000>
 425ec84: 91051021     	add	x1, x1, #0x144
 425ec88: 910223e8     	add	x8, sp, #0x88
 425ec8c: 910143e0     	add	x0, sp, #0x50
 425ec90: 528003a2     	mov	w2, #0x1d               ; =29
 425ec94: 9769aba3     	bl	0x1cc9b20 <_ChromeMain+0x1cc4884>
 425ec98: 3942a3e8     	ldrb	w8, [sp, #0xa8]
 425ec9c: 34ffd768     	cbz	w8, 0x425e788 <_ChromeMain+0x42594ec>
 425eca0: 394283e8     	ldrb	w8, [sp, #0xa0]
 425eca4: f103fd1f     	cmp	x8, #0xff
 425eca8: 54ffd700     	b.eq	0x425e788 <_ChromeMain+0x42594ec>
 425ecac: f0053309     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 425ecb0: 9121e129     	add	x9, x9, #0x878
 425ecb4: f8687928     	ldr	x8, [x9, x8, lsl #3]
 425ecb8: d10203a0     	sub	x0, x29, #0x80
 425ecbc: 910223e1     	add	x1, sp, #0x88
 425ecc0: d63f0100     	blr	x8
 425ecc4: 17fffeb1     	b	0x425e788 <_ChromeMain+0x42594ec>
 425ecc8: 394283e8     	ldrb	w8, [sp, #0xa0]
 425eccc: f103fd1f     	cmp	x8, #0xff
 425ecd0: 54ffd340     	b.eq	0x425e738 <_ChromeMain+0x425949c>
 425ecd4: f0053309     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 425ecd8: 9121e129     	add	x9, x9, #0x878
 425ecdc: f8687928     	ldr	x8, [x9, x8, lsl #3]
 425ece0: d10203a0     	sub	x0, x29, #0x80
 425ece4: 910223e1     	add	x1, sp, #0x88
 425ece8: d63f0100     	blr	x8
 425ecec: 17fffe93     	b	0x425e738 <_ChromeMain+0x425949c>
 425ecf0: 394283e8     	ldrb	w8, [sp, #0xa0]
 425ecf4: f103fd1f     	cmp	x8, #0xff
 425ecf8: 54ffd340     	b.eq	0x425e760 <_ChromeMain+0x42594c4>
 425ecfc: f0053309     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 425ed00: 9121e129     	add	x9, x9, #0x878
 425ed04: f8687928     	ldr	x8, [x9, x8, lsl #3]
 425ed08: d10203a0     	sub	x0, x29, #0x80
 425ed0c: 910223e1     	add	x1, sp, #0x88
 425ed10: d63f0100     	blr	x8
 425ed14: 17fffe93     	b	0x425e760 <_ChromeMain+0x42594c4>
 425ed18: 394283e8     	ldrb	w8, [sp, #0xa0]
 425ed1c: f103fd1f     	cmp	x8, #0xff
 425ed20: 54fff660     	b.eq	0x425ebec <_ChromeMain+0x4259950>
 425ed24: f0053309     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 425ed28: 9121e129     	add	x9, x9, #0x878
 425ed2c: f8687928     	ldr	x8, [x9, x8, lsl #3]
 425ed30: d10203a0     	sub	x0, x29, #0x80
 425ed34: 910223e1     	add	x1, sp, #0x88
 425ed38: d63f0100     	blr	x8
 425ed3c: 17ffffac     	b	0x425ebec <_ChromeMain+0x4259950>
 425ed40: 94f69588     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 425ed44: d4200000     	brk	#0
 425ed48: d4400000     	hlt	#0
 425ed4c: d4200020     	brk	#0x1
 425ed50: d4200000     	brk	#0
 425ed54: d4400000     	hlt	#0
 425ed58: d4200020     	brk	#0x1
 425ed5c: d4200000     	brk	#0
 425ed60: d4400000     	hlt	#0
 425ed64: d4200020     	brk	#0x1
 425ed68: d4200000     	brk	#0
 425ed6c: d4400000     	hlt	#0
 425ed70: d4200020     	brk	#0x1
 425ed74: d4200000     	brk	#0
 425ed78: d4400000     	hlt	#0
 425ed7c: d4200020     	brk	#0x1
 425ed80: d4200000     	brk	#0
 425ed84: d4400000     	hlt	#0
 425ed88: d4200020     	brk	#0x1
 425ed8c: d4200000     	brk	#0
 425ed90: d4400000     	hlt	#0
 425ed94: d4200020     	brk	#0x1
 425ed98: d4200000     	brk	#0
 425ed9c: d4400000     	hlt	#0
 425eda0: d4200020     	brk	#0x1
 425eda4: 39406008     	ldrb	w8, [x0, #0x18]
 425eda8: 7100091f     	cmp	w8, #0x2
 425edac: 54ffd5e1     	b.ne	0x425e868 <_ChromeMain+0x42595cc>
 425edb0: b9400008     	ldr	w8, [x0]
 425edb4: 7100111f     	cmp	w8, #0x4
 425edb8: 54ffd581     	b.ne	0x425e868 <_ChromeMain+0x42595cc>
 425edbc: 3941a3e8     	ldrb	w8, [sp, #0x68]
 425edc0: 3607f508     	tbz	w8, #0x0, 0x425ec60 <_ChromeMain+0x42599c4>
 425edc4: 528000a8     	mov	w8, #0x5                ; =5
 425edc8: b9008be8     	str	w8, [sp, #0x88]
 425edcc: 52800048     	mov	w8, #0x2                ; =2
 425edd0: 390283e8     	strb	w8, [sp, #0xa0]
 425edd4: d00463e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 425edd8: 912b5021     	add	x1, x1, #0xad4
 425eddc: 910143e0     	add	x0, sp, #0x50
 425ede0: 910223e3     	add	x3, sp, #0x88
 425ede4: 52800342     	mov	w2, #0x1a               ; =26
 425ede8: 976a4d96     	bl	0x1cf2440 <_ChromeMain+0x1ced1a4>
 425edec: 394283e8     	ldrb	w8, [sp, #0xa0]
 425edf0: f103fd1f     	cmp	x8, #0xff
 425edf4: 54ffd3a0     	b.eq	0x425e868 <_ChromeMain+0x42595cc>
 425edf8: f0053309     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 425edfc: 9121e129     	add	x9, x9, #0x878
 425ee00: f8687928     	ldr	x8, [x9, x8, lsl #3]
 425ee04: d10203a0     	sub	x0, x29, #0x80
 425ee08: 910223e1     	add	x1, sp, #0x88
 425ee0c: d63f0100     	blr	x8
 425ee10: 17fffe96     	b	0x425e868 <_ChromeMain+0x42595cc>
