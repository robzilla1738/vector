
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460f608: d10383ff     	sub	sp, sp, #0xe0
 460f60c: a9086ffc     	stp	x28, x27, [sp, #0x80]
 460f610: a90967fa     	stp	x26, x25, [sp, #0x90]
 460f614: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 460f618: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 460f61c: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 460f620: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 460f624: 910343fd     	add	x29, sp, #0xd0
 460f628: a9050fe2     	stp	x2, x3, [sp, #0x50]
 460f62c: f90027e1     	str	x1, [sp, #0x48]
 460f630: aa0003f3     	mov	x19, x0
 460f634: 52800021     	mov	w1, #0x1                ; =1
 460f638: 95825704     	bl	0xa6a5248 <_ChromeMain+0xa69ffac>
 460f63c: b0050897     	adrp	x23, 0xe720000 <dyld_stub_binder+0xe720000>
 460f640: 910842f7     	add	x23, x23, #0x210
 460f644: 911462e9     	add	x9, x23, #0x518
 460f648: a9002417     	stp	x23, x9, [x0]
 460f64c: 911462ea     	add	x10, x23, #0x518
 460f650: 911502e9     	add	x9, x23, #0x540
 460f654: 911502e8     	add	x8, x23, #0x540
 460f658: a903abe8     	stp	x8, x10, [sp, #0x38]
 460f65c: f9000809     	str	x9, [x0, #0x10]
 460f660: 9115e2e9     	add	x9, x23, #0x578
 460f664: 9116a2ea     	add	x10, x23, #0x5a8
 460f668: 9115e2eb     	add	x11, x23, #0x578
 460f66c: a906a809     	stp	x9, x10, [x0, #0x68]
 460f670: 9116a2e8     	add	x8, x23, #0x5a8
 460f674: a902afe8     	stp	x8, x11, [sp, #0x28]
 460f678: 9117e2e9     	add	x9, x23, #0x5f8
 460f67c: 9117e2ea     	add	x10, x23, #0x5f8
 460f680: f9005809     	str	x9, [x0, #0xb0]
 460f684: 911962e9     	add	x9, x23, #0x658
 460f688: 911962e8     	add	x8, x23, #0x658
 460f68c: a901abe8     	stp	x8, x10, [sp, #0x18]
 460f690: f9006c09     	str	x9, [x0, #0xd8]
 460f694: 911a22e9     	add	x9, x23, #0x688
 460f698: 911a22ea     	add	x10, x23, #0x688
 460f69c: f9007c09     	str	x9, [x0, #0xf8]
 460f6a0: 911ac2e9     	add	x9, x23, #0x6b0
 460f6a4: 911ac2e8     	add	x8, x23, #0x6b0
 460f6a8: a900abe8     	stp	x8, x10, [sp, #0x8]
 460f6ac: f9018809     	str	x9, [x0, #0x310]
 460f6b0: 911b62e9     	add	x9, x23, #0x6d8
 460f6b4: 911b62e8     	add	x8, x23, #0x6d8
 460f6b8: f90003e8     	str	x8, [sp]
 460f6bc: f9023009     	str	x9, [x0, #0x460]
 460f6c0: 911d62fc     	add	x28, x23, #0x758
 460f6c4: f902341c     	str	x28, [x0, #0x468]
 460f6c8: 912062f9     	add	x25, x23, #0x818
 460f6cc: f9023819     	str	x25, [x0, #0x470]
 460f6d0: 912142fa     	add	x26, x23, #0x850
 460f6d4: f902601a     	str	x26, [x0, #0x4c0]
 460f6d8: 912462f8     	add	x24, x23, #0x918
 460f6dc: f9026c18     	str	x24, [x0, #0x4d8]
 460f6e0: 9126e2f4     	add	x20, x23, #0x9b8
 460f6e4: f9027c14     	str	x20, [x0, #0x4f8]
 460f6e8: 912862f5     	add	x21, x23, #0xa18
 460f6ec: f9028015     	str	x21, [x0, #0x500]
 460f6f0: 912a62f6     	add	x22, x23, #0xa98
 460f6f4: f9028416     	str	x22, [x0, #0x508]
 460f6f8: 912b22fb     	add	x27, x23, #0xac8
 460f6fc: f902881b     	str	x27, [x0, #0x510]
 460f700: 9004c5e0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 460f704: 911bbc00     	add	x0, x0, #0x6ef
 460f708: 9004c5e1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 460f70c: 911c2021     	add	x1, x1, #0x708
 460f710: 910183e8     	add	x8, sp, #0x60
 460f714: 52809342     	mov	w2, #0x49a              ; =1178
 460f718: 96e9055a     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 460f71c: 91118260     	add	x0, x19, #0x460
 460f720: 910183e2     	add	x2, sp, #0x60
 460f724: aa1303e1     	mov	x1, x19
 460f728: 97357d76     	bl	0x136ed00 <_ChromeMain+0x1369a64>
 460f72c: 9004e548     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 460f730: 913c2108     	add	x8, x8, #0xf08
 460f734: f9026268     	str	x8, [x19, #0x4c0]
 460f738: 52800100     	mov	w0, #0x8                ; =8
 460f73c: 96e7ff0b     	bl	0xf368 <_ChromeMain+0xa0cc>
 460f740: b900001f     	str	wzr, [x0]
 460f744: 3900101f     	strb	wzr, [x0, #0x4]
 460f748: b40000c0     	cbz	x0, 0x460f760 <_ChromeMain+0x460a4c4>
 460f74c: 52800028     	mov	w8, #0x1                ; =1
 460f750: b8280008     	ldadd	w8, w8, [x0]
 460f754: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460f758: 6b09011f     	cmp	w8, w9
 460f75c: 54004540     	b.eq	0x4610004 <_ChromeMain+0x460ad68>
 460f760: 91130268     	add	x8, x19, #0x4c0
 460f764: f9026660     	str	x0, [x19, #0x4c8]
 460f768: f9026a68     	str	x8, [x19, #0x4d0]
 460f76c: 9113a268     	add	x8, x19, #0x4e8
 460f770: 6f00e400     	movi.2d	v0, #0000000000000000
 460f774: 3d800100     	str	q0, [x8]
 460f778: f9027268     	str	x8, [x19, #0x4e0]
 460f77c: a943a7e8     	ldp	x8, x9, [sp, #0x38]
 460f780: a9002677     	stp	x23, x9, [x19]
 460f784: f9000a68     	str	x8, [x19, #0x10]
 460f788: a942a7e8     	ldp	x8, x9, [sp, #0x28]
 460f78c: a906a269     	stp	x9, x8, [x19, #0x68]
 460f790: a941a7e8     	ldp	x8, x9, [sp, #0x18]
 460f794: f9005a69     	str	x9, [x19, #0xb0]
 460f798: f9006e68     	str	x8, [x19, #0xd8]
 460f79c: a940a7e8     	ldp	x8, x9, [sp, #0x8]
 460f7a0: f9007e69     	str	x9, [x19, #0xf8]
 460f7a4: f9018a68     	str	x8, [x19, #0x310]
 460f7a8: f94003e8     	ldr	x8, [sp]
 460f7ac: f9023268     	str	x8, [x19, #0x460]
 460f7b0: f902367c     	str	x28, [x19, #0x468]
 460f7b4: f9023a79     	str	x25, [x19, #0x470]
 460f7b8: f902627a     	str	x26, [x19, #0x4c0]
 460f7bc: f9026e78     	str	x24, [x19, #0x4d8]
 460f7c0: f9027e74     	str	x20, [x19, #0x4f8]
 460f7c4: f9028275     	str	x21, [x19, #0x500]
 460f7c8: f9028676     	str	x22, [x19, #0x508]
 460f7cc: f9028a7b     	str	x27, [x19, #0x510]
 460f7d0: f94027f4     	ldr	x20, [sp, #0x48]
 460f7d4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 460f7d8: f0052d17     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 460f7dc: f94046e9     	ldr	x9, [x23, #0x88]
 460f7e0: eb09011f     	cmp	x8, x9
 460f7e4: 54000061     	b.ne	0x460f7f0 <_ChromeMain+0x460a554>
 460f7e8: aa1403e0     	mov	x0, x20
 460f7ec: 96e812c4     	bl	0x142fc <_ChromeMain+0xf060>
 460f7f0: f9028e74     	str	x20, [x19, #0x518]
 460f7f4: a94553f5     	ldp	x21, x20, [sp, #0x50]
 460f7f8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 460f7fc: f94046e9     	ldr	x9, [x23, #0x88]
 460f800: eb09011f     	cmp	x8, x9
 460f804: 54000061     	b.ne	0x460f810 <_ChromeMain+0x460a574>
 460f808: aa1503e0     	mov	x0, x21
 460f80c: 96e812bc     	bl	0x142fc <_ChromeMain+0xf060>
 460f810: f9029275     	str	x21, [x19, #0x520]
 460f814: 925e7688     	and	x8, x20, #0xfffffffc00000000
 460f818: f94046e9     	ldr	x9, [x23, #0x88]
 460f81c: eb09011f     	cmp	x8, x9
 460f820: 91130275     	add	x21, x19, #0x4c0
 460f824: 54000061     	b.ne	0x460f830 <_ChromeMain+0x460a594>
 460f828: aa1403e0     	mov	x0, x20
 460f82c: 96e812b4     	bl	0x142fc <_ChromeMain+0xf060>
 460f830: f9029674     	str	x20, [x19, #0x528]
 460f834: f9029a7f     	str	xzr, [x19, #0x530]
 460f838: f902a27f     	str	xzr, [x19, #0x540]
 460f83c: f9029e7f     	str	xzr, [x19, #0x538]
 460f840: 91152260     	add	x0, x19, #0x548
 460f844: 91118261     	add	x1, x19, #0x460
 460f848: 52800782     	mov	w2, #0x3c               ; =60
 460f84c: 97357ced     	bl	0x136ec00 <_ChromeMain+0x1369964>
 460f850: d004e688     	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 460f854: 91240108     	add	x8, x8, #0x900
 460f858: f902a668     	str	x8, [x19, #0x548]
 460f85c: 91118274     	add	x20, x19, #0x460
 460f860: 925e7688     	and	x8, x20, #0xfffffffc00000000
 460f864: f94046e9     	ldr	x9, [x23, #0x88]
 460f868: eb09011f     	cmp	x8, x9
 460f86c: 54000061     	b.ne	0x460f878 <_ChromeMain+0x460a5dc>
 460f870: 91118260     	add	x0, x19, #0x460
 460f874: 96e812a2     	bl	0x142fc <_ChromeMain+0xf060>
 460f878: f902ca74     	str	x20, [x19, #0x590]
 460f87c: 52800034     	mov	w20, #0x1               ; =1
 460f880: b9059a74     	str	w20, [x19, #0x598]
 460f884: 3916727f     	strb	wzr, [x19, #0x59c]
 460f888: 3916827f     	strb	wzr, [x19, #0x5a0]
 460f88c: f902d67f     	str	xzr, [x19, #0x5a8]
 460f890: f902de7f     	str	xzr, [x19, #0x5b8]
 460f894: f902da7f     	str	xzr, [x19, #0x5b0]
 460f898: 529a9808     	mov	w8, #0xd4c0             ; =54464
 460f89c: 72a00028     	movk	w8, #0x1, lsl #16
 460f8a0: f902e268     	str	x8, [x19, #0x5c0]
 460f8a4: d2e7fe08     	mov	x8, #0x3ff0000000000000 ; =4607182418800017408
 460f8a8: f902e668     	str	x8, [x19, #0x5c8]
 460f8ac: 6f00e400     	movi.2d	v0, #0000000000000000
 460f8b0: 3d817660     	str	q0, [x19, #0x5d0]
 460f8b4: 3d817a60     	str	q0, [x19, #0x5e0]
 460f8b8: 3d817e60     	str	q0, [x19, #0x5f0]
 460f8bc: 3d818260     	str	q0, [x19, #0x600]
 460f8c0: 3d818660     	str	q0, [x19, #0x610]
 460f8c4: 3d818a60     	str	q0, [x19, #0x620]
 460f8c8: 9004e548     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 460f8cc: 913c2108     	add	x8, x8, #0xf08
 460f8d0: f9031a68     	str	x8, [x19, #0x630]
 460f8d4: 52800100     	mov	w0, #0x8                ; =8
 460f8d8: 96e7fea4     	bl	0xf368 <_ChromeMain+0xa0cc>
 460f8dc: b900001f     	str	wzr, [x0]
 460f8e0: 3900101f     	strb	wzr, [x0, #0x4]
 460f8e4: b40000a0     	cbz	x0, 0x460f8f8 <_ChromeMain+0x460a65c>
 460f8e8: b8340008     	ldadd	w20, w8, [x0]
 460f8ec: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460f8f0: 6b09011f     	cmp	w8, w9
 460f8f4: 540038e0     	b.eq	0x4610010 <_ChromeMain+0x460ad74>
 460f8f8: 911bca74     	add	x20, x19, #0x6f2
 460f8fc: 9118c268     	add	x8, x19, #0x630
 460f900: f9031e60     	str	x0, [x19, #0x638]
 460f904: f9032268     	str	x8, [x19, #0x640]
 460f908: 9004e6c8     	adrp	x8, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 460f90c: 91124108     	add	x8, x8, #0x490
 460f910: f9031a68     	str	x8, [x19, #0x630]
 460f914: f903267f     	str	xzr, [x19, #0x648]
 460f918: 91196268     	add	x8, x19, #0x658
 460f91c: 925e76a9     	and	x9, x21, #0xfffffffc00000000
 460f920: 6f00e400     	movi.2d	v0, #0000000000000000
 460f924: ad000100     	stp	q0, q0, [x8]
 460f928: f94046e8     	ldr	x8, [x23, #0x88]
 460f92c: eb08013f     	cmp	x9, x8
 460f930: 54000061     	b.ne	0x460f93c <_ChromeMain+0x460a6a0>
 460f934: 91130260     	add	x0, x19, #0x4c0
 460f938: 96e81271     	bl	0x142fc <_ChromeMain+0xf060>
 460f93c: f9033e75     	str	x21, [x19, #0x678]
 460f940: 911a0276     	add	x22, x19, #0x680
 460f944: b906ee7f     	str	wzr, [x19, #0x6ec]
 460f948: 52802008     	mov	w8, #0x100              ; =256
 460f94c: 790de268     	strh	w8, [x19, #0x6f0]
 460f950: 6f00e401     	movi.2d	v1, #0000000000000000
 460f954: 3d81a261     	str	q1, [x19, #0x680]
 460f958: 3d81a661     	str	q1, [x19, #0x690]
 460f95c: 3d81aa61     	str	q1, [x19, #0x6a0]
 460f960: 3d81ae61     	str	q1, [x19, #0x6b0]
 460f964: 3d81b261     	str	q1, [x19, #0x6c0]
 460f968: 3d81b661     	str	q1, [x19, #0x6d0]
 460f96c: 3c8592c1     	stur	q1, [x22, #0x59]
 460f970: 911be268     	add	x8, x19, #0x6f8
 460f974: 911d2269     	add	x9, x19, #0x748
 460f978: 391da27f     	strb	wzr, [x19, #0x768]
 460f97c: 391dc27f     	strb	wzr, [x19, #0x770]
 460f980: 911de26a     	add	x10, x19, #0x778
 460f984: 911ea26b     	add	x11, x19, #0x7a8
 460f988: f903e27f     	str	xzr, [x19, #0x7c0]
 460f98c: 790f927f     	strh	wzr, [x19, #0x7c8]
 460f990: 911f426c     	add	x12, x19, #0x7d0
 460f994: b900029f     	str	wzr, [x20]
 460f998: ad000501     	stp	q1, q1, [x8]
 460f99c: ad010501     	stp	q1, q1, [x8, #0x20]
 460f9a0: 3c83c101     	stur	q1, [x8, #0x3c]
 460f9a4: b907627f     	str	wzr, [x19, #0x760]
 460f9a8: f903ae7f     	str	xzr, [x19, #0x758]
 460f9ac: 3d800121     	str	q1, [x9]
 460f9b0: ad000541     	stp	q1, q1, [x10]
 460f9b4: 3c819141     	stur	q1, [x10, #0x19]
 460f9b8: 3d800161     	str	q1, [x11]
 460f9bc: 391ee27f     	strb	wzr, [x19, #0x7b8]
 460f9c0: f903f27f     	str	xzr, [x19, #0x7e0]
 460f9c4: b801719f     	stur	wzr, [x12, #0x17]
 460f9c8: 3d81f661     	str	q1, [x19, #0x7d0]
 460f9cc: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 460f9d0: 3d81fe60     	str	q0, [x19, #0x7f0]
 460f9d4: 3d820260     	str	q0, [x19, #0x800]
 460f9d8: 3d820660     	str	q0, [x19, #0x810]
 460f9dc: 3d820a60     	str	q0, [x19, #0x820]
 460f9e0: 7910627f     	strh	wzr, [x19, #0x830]
 460f9e4: 9120e268     	add	x8, x19, #0x838
 460f9e8: 3921e27f     	strb	wzr, [x19, #0x878]
 460f9ec: 91220269     	add	x9, x19, #0x880
 460f9f0: 3923027f     	strb	wzr, [x19, #0x8c0]
 460f9f4: 9123226a     	add	x10, x19, #0x8c8
 460f9f8: 3c829121     	stur	q1, [x9, #0x29]
 460f9fc: 3d822a61     	str	q1, [x19, #0x8a0]
 460fa00: 3d822661     	str	q1, [x19, #0x890]
 460fa04: 3d822261     	str	q1, [x19, #0x880]
 460fa08: 91089a89     	add	x9, x20, #0x226
 460fa0c: 3c829101     	stur	q1, [x8, #0x29]
 460fa10: ad008501     	stp	q1, q1, [x8, #0x10]
 460fa14: 3d800101     	str	q1, [x8]
 460fa18: 3c83b141     	stur	q1, [x10, #0x3b]
 460fa1c: ad010541     	stp	q1, q1, [x10, #0x20]
 460fa20: ad000541     	stp	q1, q1, [x10]
 460fa24: 3d800120     	str	q0, [x9]
 460fa28: 9108da88     	add	x8, x20, #0x236
 460fa2c: 3d800100     	str	q0, [x8]
 460fa30: 91091a88     	add	x8, x20, #0x246
 460fa34: 3d800100     	str	q0, [x8]
 460fa38: 91095a88     	add	x8, x20, #0x256
 460fa3c: 3d800100     	str	q0, [x8]
 460fa40: 7912b27f     	strh	wzr, [x19, #0x958]
 460fa44: 3926627f     	strb	wzr, [x19, #0x998]
 460fa48: 3926827f     	strb	wzr, [x19, #0x9a0]
 460fa4c: 3926a27f     	strb	wzr, [x19, #0x9a8]
 460fa50: 91272274     	add	x20, x19, #0x9c8
 460fa54: f904e27f     	str	xzr, [x19, #0x9c0]
 460fa58: 3d826e61     	str	q1, [x19, #0x9b0]
 460fa5c: 3926427f     	strb	wzr, [x19, #0x990]
 460fa60: 3d826261     	str	q1, [x19, #0x980]
 460fa64: 3d825e61     	str	q1, [x19, #0x970]
 460fa68: 3d825a61     	str	q1, [x19, #0x960]
 460fa6c: f904e674     	str	x20, [x19, #0x9c8]
 460fa70: f904ea74     	str	x20, [x19, #0x9d0]
 460fa74: f904ee7f     	str	xzr, [x19, #0x9d8]
 460fa78: 3927827f     	strb	wzr, [x19, #0x9e0]
 460fa7c: f904f67f     	str	xzr, [x19, #0x9e8]
 460fa80: 52800100     	mov	w0, #0x8                ; =8
 460fa84: 96e7fe39     	bl	0xf368 <_ChromeMain+0xa0cc>
 460fa88: b900001f     	str	wzr, [x0]
 460fa8c: 3900101f     	strb	wzr, [x0, #0x4]
 460fa90: b40000c0     	cbz	x0, 0x460faa8 <_ChromeMain+0x460a80c>
 460fa94: 52800028     	mov	w8, #0x1                ; =1
 460fa98: b8280008     	ldadd	w8, w8, [x0]
 460fa9c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460faa0: 6b09011f     	cmp	w8, w9
 460faa4: 54002bc0     	b.eq	0x461001c <_ChromeMain+0x460ad80>
 460faa8: f904fa60     	str	x0, [x19, #0x9f0]
 460faac: f904fe74     	str	x20, [x19, #0x9f8]
 460fab0: 91280268     	add	x8, x19, #0xa00
 460fab4: f9050268     	str	x8, [x19, #0xa00]
 460fab8: f9050668     	str	x8, [x19, #0xa08]
 460fabc: 6f00e400     	movi.2d	v0, #0000000000000000
 460fac0: 3d828660     	str	q0, [x19, #0xa10]
 460fac4: 3d828a60     	str	q0, [x19, #0xa20]
 460fac8: 52800100     	mov	w0, #0x8                ; =8
 460facc: 96e7fe27     	bl	0xf368 <_ChromeMain+0xa0cc>
 460fad0: b900001f     	str	wzr, [x0]
 460fad4: 3900101f     	strb	wzr, [x0, #0x4]
 460fad8: b40000c0     	cbz	x0, 0x460faf0 <_ChromeMain+0x460a854>
 460fadc: 52800028     	mov	w8, #0x1                ; =1
 460fae0: b8280008     	ldadd	w8, w8, [x0]
 460fae4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460fae8: 6b09011f     	cmp	w8, w9
 460faec: 540029e0     	b.eq	0x4610028 <_ChromeMain+0x460ad8c>
 460faf0: f9051a60     	str	x0, [x19, #0xa30]
 460faf4: f9051e73     	str	x19, [x19, #0xa38]
 460faf8: aa1303e0     	mov	x0, x19
 460fafc: 52800021     	mov	w1, #0x1                ; =1
 460fb00: 95826033     	bl	0xa6a7bcc <_ChromeMain+0xa6a2930>
 460fb04: aa1303e0     	mov	x0, x19
 460fb08: 52800001     	mov	w1, #0x0                ; =0
 460fb0c: 95825933     	bl	0xa6a5fd8 <_ChromeMain+0xa6a0d3c>
 460fb10: f9428e69     	ldr	x9, [x19, #0x518]
 460fb14: b40026c9     	cbz	x9, 0x460ffec <_ChromeMain+0x460ad50>
 460fb18: f940b128     	ldr	x8, [x9, #0x160]
 460fb1c: b40003a8     	cbz	x8, 0x460fb90 <_ChromeMain+0x460a8f4>
 460fb20: 91058129     	add	x9, x9, #0x160
 460fb24: f005142a     	adrp	x10, 0xe896000 <dyld_stub_binder+0xe896000>
 460fb28: 913ae14a     	add	x10, x10, #0xeb8
 460fb2c: 14000013     	b	0x460fb78 <_ChromeMain+0x460a8dc>
 460fb30: eb09011f     	cmp	x8, x9
 460fb34: 540002e0     	b.eq	0x460fb90 <_ChromeMain+0x460a8f4>
 460fb38: f9401514     	ldr	x20, [x8, #0x28]
 460fb3c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 460fb40: f94046e9     	ldr	x9, [x23, #0x88]
 460fb44: eb09011f     	cmp	x8, x9
 460fb48: 54000261     	b.ne	0x460fb94 <_ChromeMain+0x460a8f8>
 460fb4c: aa1403e0     	mov	x0, x20
 460fb50: 96e811eb     	bl	0x142fc <_ChromeMain+0xf060>
 460fb54: 14000010     	b	0x460fb94 <_ChromeMain+0x460a8f8>
 460fb58: 52800028     	mov	w8, #0x1                ; =1
 460fb5c: b900f2a8     	str	w8, [x21, #0xf0]
 460fb60: aa1503e0     	mov	x0, x21
 460fb64: 52800021     	mov	w1, #0x1                ; =1
 460fb68: 975155d2     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 460fb6c: 14000055     	b	0x460fcc0 <_ChromeMain+0x460aa24>
 460fb70: f9400108     	ldr	x8, [x8]
 460fb74: b40000e8     	cbz	x8, 0x460fb90 <_ChromeMain+0x460a8f4>
 460fb78: f940110b     	ldr	x11, [x8, #0x20]
 460fb7c: eb0a017f     	cmp	x11, x10
 460fb80: 54ffff88     	b.hi	0x460fb70 <_ChromeMain+0x460a8d4>
 460fb84: 54fffd60     	b.eq	0x460fb30 <_ChromeMain+0x460a894>
 460fb88: f9400508     	ldr	x8, [x8, #0x8]
 460fb8c: b5ffff68     	cbnz	x8, 0x460fb78 <_ChromeMain+0x460a8dc>
 460fb90: d2800014     	mov	x20, #0x0               ; =0
 460fb94: 925e7688     	and	x8, x20, #0xfffffffc00000000
 460fb98: f94046e9     	ldr	x9, [x23, #0x88]
 460fb9c: eb09011f     	cmp	x8, x9
 460fba0: 54000061     	b.ne	0x460fbac <_ChromeMain+0x460a910>
 460fba4: aa1403e0     	mov	x0, x20
 460fba8: 96e84ba5     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 460fbac: f00547d8     	adrp	x24, 0xef0a000 <dyld_stub_binder+0xef0a000>
 460fbb0: 91120318     	add	x24, x24, #0x480
 460fbb4: f8bfc300     	ldapr	x0, [x24]
 460fbb8: b40021e0     	cbz	x0, 0x460fff4 <_ChromeMain+0x460ad58>
 460fbbc: 52808301     	mov	w1, #0x418              ; =1048
 460fbc0: d2800002     	mov	x2, #0x0                ; =0
 460fbc4: 96ea6e7b     	bl	0xab5b0 <_ChromeMain+0xa6314>
 460fbc8: aa0003f5     	mov	x21, x0
 460fbcc: aa1403e1     	mov	x1, x20
 460fbd0: 94e69b1c     	bl	0x7fb6840 <_ChromeMain+0x7fb15a4>
 460fbd4: aa1303e0     	mov	x0, x19
 460fbd8: aa1503e1     	mov	x1, x21
 460fbdc: 95825ac5     	bl	0xa6a66f0 <_ChromeMain+0xa6a1454>
 460fbe0: 390183ff     	strb	wzr, [sp, #0x60]
 460fbe4: 3901a3ff     	strb	wzr, [sp, #0x68]
 460fbe8: 910183e1     	add	x1, sp, #0x60
 460fbec: aa1303e0     	mov	x0, x19
 460fbf0: 95825874     	bl	0xa6a5dc0 <_ChromeMain+0xa6a0b24>
 460fbf4: 52800048     	mov	w8, #0x2                ; =2
 460fbf8: b9044268     	str	w8, [x19, #0x440]
 460fbfc: aa1303e0     	mov	x0, x19
 460fc00: 97f766cd     	bl	0x43e9734 <_ChromeMain+0x43e4498>
 460fc04: f8bfc300     	ldapr	x0, [x24]
 460fc08: b4001fa0     	cbz	x0, 0x460fffc <_ChromeMain+0x460ad60>
 460fc0c: 52806201     	mov	w1, #0x310              ; =784
 460fc10: d2800002     	mov	x2, #0x0                ; =0
 460fc14: 96ea6e67     	bl	0xab5b0 <_ChromeMain+0xa6314>
 460fc18: aa0003f4     	mov	x20, x0
 460fc1c: 52806201     	mov	w1, #0x310              ; =784
 460fc20: 94e7e6fc     	bl	0x8009810 <_ChromeMain+0x8004574>
 460fc24: aa1403e0     	mov	x0, x20
 460fc28: 97357d46     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 460fc2c: d0050888     	adrp	x8, 0xe721000 <dyld_stub_binder+0xe721000>
 460fc30: 910cc108     	add	x8, x8, #0x330
 460fc34: 910fa109     	add	x9, x8, #0x3e8
 460fc38: a9002688     	stp	x8, x9, [x20]
 460fc3c: 91104109     	add	x9, x8, #0x410
 460fc40: f9000a89     	str	x9, [x20, #0x10]
 460fc44: 91112109     	add	x9, x8, #0x448
 460fc48: 9111e10a     	add	x10, x8, #0x478
 460fc4c: a906aa89     	stp	x9, x10, [x20, #0x68]
 460fc50: 91132109     	add	x9, x8, #0x4c8
 460fc54: f9005a89     	str	x9, [x20, #0xb0]
 460fc58: 9114a109     	add	x9, x8, #0x528
 460fc5c: f9006e89     	str	x9, [x20, #0xd8]
 460fc60: 91156108     	add	x8, x8, #0x558
 460fc64: f9007e88     	str	x8, [x20, #0xf8]
 460fc68: 52802900     	mov	w0, #0x148              ; =328
 460fc6c: 96e7fdbf     	bl	0xf368 <_ChromeMain+0xa0cc>
 460fc70: aa0003f5     	mov	x21, x0
 460fc74: 97900257     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 460fc78: b004f7c8     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 460fc7c: 912c8108     	add	x8, x8, #0xb20
 460fc80: f9000008     	str	x8, [x0]
 460fc84: 91036108     	add	x8, x8, #0xd8
 460fc88: f9001408     	str	x8, [x0, #0x28]
 460fc8c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 460fc90: f94046e9     	ldr	x9, [x23, #0x88]
 460fc94: eb09011f     	cmp	x8, x9
 460fc98: 54000061     	b.ne	0x460fca4 <_ChromeMain+0x460aa08>
 460fc9c: aa1303e0     	mov	x0, x19
 460fca0: 96e81197     	bl	0x142fc <_ChromeMain+0xf060>
 460fca4: f900a2b3     	str	x19, [x21, #0x140]
 460fca8: aa1403e0     	mov	x0, x20
 460fcac: aa1503e1     	mov	x1, x21
 460fcb0: 9755e6e2     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 460fcb4: b940f2a8     	ldr	w8, [x21, #0xf0]
 460fcb8: 7100051f     	cmp	w8, #0x1
 460fcbc: 54fff4e1     	b.ne	0x460fb58 <_ChromeMain+0x460a8bc>
 460fcc0: 52800068     	mov	w8, #0x3                ; =3
 460fcc4: b90063e8     	str	w8, [sp, #0x60]
 460fcc8: d0051fa1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 460fccc: 9115a021     	add	x1, x1, #0x568
 460fcd0: 910462a0     	add	x0, x21, #0x118
 460fcd4: 910183e2     	add	x2, sp, #0x60
 460fcd8: 97515533     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 460fcdc: b940faa8     	ldr	w8, [x21, #0xf8]
 460fce0: 7100051f     	cmp	w8, #0x1
 460fce4: 54001761     	b.ne	0x460ffd0 <_ChromeMain+0x460ad34>
 460fce8: b940fea8     	ldr	w8, [x21, #0xfc]
 460fcec: 7100211f     	cmp	w8, #0x8
 460fcf0: 54001701     	b.ne	0x460ffd0 <_ChromeMain+0x460ad34>
 460fcf4: b94102a8     	ldr	w8, [x21, #0x100]
 460fcf8: 350016c8     	cbnz	w8, 0x460ffd0 <_ChromeMain+0x460ad34>
 460fcfc: b94106a8     	ldr	w8, [x21, #0x104]
 460fd00: 7100211f     	cmp	w8, #0x8
 460fd04: 54001661     	b.ne	0x460ffd0 <_ChromeMain+0x460ad34>
 460fd08: 3943d2a8     	ldrb	w8, [x21, #0xf4]
 460fd0c: 370000c8     	tbnz	w8, #0x0, 0x460fd24 <_ChromeMain+0x460aa88>
 460fd10: 52800028     	mov	w8, #0x1                ; =1
 460fd14: 3903d2a8     	strb	w8, [x21, #0xf4]
 460fd18: aa1503e0     	mov	x0, x21
 460fd1c: 52800021     	mov	w1, #0x1                ; =1
 460fd20: 97515564     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 460fd24: aa1303e0     	mov	x0, x19
 460fd28: aa1403e1     	mov	x1, x20
 460fd2c: 958254a5     	bl	0xa6a4fc0 <_ChromeMain+0xa69fd24>
 460fd30: 925e7688     	and	x8, x20, #0xfffffffc00000000
 460fd34: f94046e9     	ldr	x9, [x23, #0x88]
 460fd38: eb09011f     	cmp	x8, x9
 460fd3c: 54000061     	b.ne	0x460fd48 <_ChromeMain+0x460aaac>
 460fd40: aa1403e0     	mov	x0, x20
 460fd44: 96e8116e     	bl	0x142fc <_ChromeMain+0xf060>
 460fd48: f9429e60     	ldr	x0, [x19, #0x538]
 460fd4c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 460fd50: f94046e9     	ldr	x9, [x23, #0x88]
 460fd54: eb09011f     	cmp	x8, x9
 460fd58: 54000041     	b.ne	0x460fd60 <_ChromeMain+0x460aac4>
 460fd5c: 96e84b38     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 460fd60: f9029e74     	str	x20, [x19, #0x538]
 460fd64: 52802000     	mov	w0, #0x100              ; =256
 460fd68: 96e7fd80     	bl	0xf368 <_ChromeMain+0xa0cc>
 460fd6c: 52800035     	mov	w21, #0x1               ; =1
 460fd70: aa1403e1     	mov	x1, x20
 460fd74: 52800022     	mov	w2, #0x1                ; =1
 460fd78: 978b7865     	bl	0x28edf0c <_ChromeMain+0x28e8c70>
 460fd7c: f942a274     	ldr	x20, [x19, #0x540]
 460fd80: f902a260     	str	x0, [x19, #0x540]
 460fd84: b40000d4     	cbz	x20, 0x460fd9c <_ChromeMain+0x460ab00>
 460fd88: aa1403e0     	mov	x0, x20
 460fd8c: 976fde52     	bl	0x22076d4 <_ChromeMain+0x2202438>
 460fd90: 52802001     	mov	w1, #0x100              ; =256
 460fd94: 96e7e449     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460fd98: f942a260     	ldr	x0, [x19, #0x540]
 460fd9c: 528000e8     	mov	w8, #0x7                ; =7
 460fda0: b900f808     	str	w8, [x0, #0xf8]
 460fda4: f942a268     	ldr	x8, [x19, #0x540]
 460fda8: 9101c100     	add	x0, x8, #0x70
 460fdac: 91142261     	add	x1, x19, #0x508
 460fdb0: 97518af4     	bl	0x1a72980 <_ChromeMain+0x1a6d6e4>
 460fdb4: f942a268     	ldr	x8, [x19, #0x540]
 460fdb8: f9407908     	ldr	x8, [x8, #0xf0]
 460fdbc: f902e268     	str	x8, [x19, #0x5c0]
 460fdc0: b9059a75     	str	w21, [x19, #0x598]
 460fdc4: b946ee68     	ldr	w8, [x19, #0x6ec]
 460fdc8: 36f802c8     	tbz	w8, #0x1f, 0x460fe20 <_ChromeMain+0x460ab84>
 460fdcc: b906ee7f     	str	wzr, [x19, #0x6ec]
 460fdd0: f9429e74     	ldr	x20, [x19, #0x538]
 460fdd4: b4000274     	cbz	x20, 0x460fe20 <_ChromeMain+0x460ab84>
 460fdd8: 52800400     	mov	w0, #0x20               ; =32
 460fddc: 96e7fd63     	bl	0xf368 <_ChromeMain+0xa0cc>
 460fde0: aa0003e1     	mov	x1, x0
 460fde4: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 460fde8: b9000808     	str	w8, [x0, #0x8]
 460fdec: 52800028     	mov	w8, #0x1                ; =1
 460fdf0: b004e9e9     	adrp	x9, 0xe34c000 <dyld_stub_binder+0xe34c000>
 460fdf4: 91044129     	add	x9, x9, #0x110
 460fdf8: 39003008     	strb	w8, [x0, #0xc]
 460fdfc: f9000009     	str	x9, [x0]
 460fe00: a9017c1f     	stp	xzr, xzr, [x0, #0x10]
 460fe04: f9400288     	ldr	x8, [x20]
 460fe08: f9408908     	ldr	x8, [x8, #0x110]
 460fe0c: aa1403e0     	mov	x0, x20
 460fe10: d63f0100     	blr	x8
 460fe14: f9429e60     	ldr	x0, [x19, #0x538]
 460fe18: 52800001     	mov	w1, #0x0                ; =0
 460fe1c: 97008196     	bl	0x630474 <_ChromeMain+0x62b1d8>
 460fe20: f9429274     	ldr	x20, [x19, #0x520]
 460fe24: b40000f4     	cbz	x20, 0x460fe40 <_ChromeMain+0x460aba4>
 460fe28: 91008280     	add	x0, x20, #0x20
 460fe2c: 91136261     	add	x1, x19, #0x4d8
 460fe30: 975173f8     	bl	0x1a6ce10 <_ChromeMain+0x1a67b74>
 460fe34: 91136260     	add	x0, x19, #0x4d8
 460fe38: aa1403e1     	mov	x1, x20
 460fe3c: 97517445     	bl	0x1a6cf50 <_ChromeMain+0x1a67cb4>
 460fe40: 52800100     	mov	w0, #0x8                ; =8
 460fe44: 96e7fd49     	bl	0xf368 <_ChromeMain+0xa0cc>
 460fe48: aa0003e8     	mov	x8, x0
 460fe4c: b004e0a9     	adrp	x9, 0xe224000 <dyld_stub_binder+0xe224000>
 460fe50: 911dc129     	add	x9, x9, #0x770
 460fe54: f9000009     	str	x9, [x0]
 460fe58: f9434660     	ldr	x0, [x19, #0x688]
 460fe5c: f9034668     	str	x8, [x19, #0x688]
 460fe60: b4000060     	cbz	x0, 0x460fe6c <_ChromeMain+0x460abd0>
 460fe64: 52800101     	mov	w1, #0x8                ; =8
 460fe68: 96e7e414     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460fe6c: 9114c275     	add	x21, x19, #0x530
 460fe70: aa1303e0     	mov	x0, x19
 460fe74: 94000072     	bl	0x461003c <_ChromeMain+0x460ada0>
 460fe78: aa1303e0     	mov	x0, x19
 460fe7c: 940000cd     	bl	0x46101b0 <_ChromeMain+0x460af14>
 460fe80: f9428e68     	ldr	x8, [x19, #0x518]
 460fe84: f9402100     	ldr	x0, [x8, #0x40]
 460fe88: 9717ae7d     	bl	0xbfb87c <_ChromeMain+0xbf65e0>
 460fe8c: aa0003f4     	mov	x20, x0
 460fe90: 925e7408     	and	x8, x0, #0xfffffffc00000000
 460fe94: f94046e9     	ldr	x9, [x23, #0x88]
 460fe98: eb09011f     	cmp	x8, x9
 460fe9c: 54000061     	b.ne	0x460fea8 <_ChromeMain+0x460ac0c>
 460fea0: aa1403e0     	mov	x0, x20
 460fea4: 96e81116     	bl	0x142fc <_ChromeMain+0xf060>
 460fea8: f94002a0     	ldr	x0, [x21]
 460feac: 925e7408     	and	x8, x0, #0xfffffffc00000000
 460feb0: f94046e9     	ldr	x9, [x23, #0x88]
 460feb4: eb09011f     	cmp	x8, x9
 460feb8: 54000041     	b.ne	0x460fec0 <_ChromeMain+0x460ac24>
 460febc: 96e84ae0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 460fec0: f90002b4     	str	x20, [x21]
 460fec4: b4000314     	cbz	x20, 0x460ff24 <_ChromeMain+0x460ac88>
 460fec8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 460fecc: f94046e9     	ldr	x9, [x23, #0x88]
 460fed0: eb09011f     	cmp	x8, x9
 460fed4: 54000061     	b.ne	0x460fee0 <_ChromeMain+0x460ac44>
 460fed8: aa1403e0     	mov	x0, x20
 460fedc: 96e81108     	bl	0x142fc <_ChromeMain+0xf060>
 460fee0: f94002c0     	ldr	x0, [x22]
 460fee4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 460fee8: f94046e9     	ldr	x9, [x23, #0x88]
 460feec: eb09011f     	cmp	x8, x9
 460fef0: 54000a20     	b.eq	0x4610034 <_ChromeMain+0x460ad98>
 460fef4: f9034274     	str	x20, [x19, #0x680]
 460fef8: f9433e61     	ldr	x1, [x19, #0x678]
 460fefc: 9101c280     	add	x0, x20, #0x70
 460ff00: 96f62ea8     	bl	0x39b9a0 <_ChromeMain+0x396704>
 460ff04: f9429a68     	ldr	x8, [x19, #0x530]
 460ff08: 39408508     	ldrb	w8, [x8, #0x21]
 460ff0c: 340000c8     	cbz	w8, 0x460ff24 <_ChromeMain+0x460ac88>
 460ff10: 911bce74     	add	x20, x19, #0x6f3
 460ff14: 39400288     	ldrb	w8, [x20]
 460ff18: 34000288     	cbz	w8, 0x460ff68 <_ChromeMain+0x460accc>
 460ff1c: 52800028     	mov	w8, #0x1                ; =1
 460ff20: 790dea68     	strh	w8, [x19, #0x6f4]
 460ff24: 395bc261     	ldrb	w1, [x19, #0x6f0]
 460ff28: 39472268     	ldrb	w8, [x19, #0x1c8]
 460ff2c: 6b08003f     	cmp	w1, w8
 460ff30: 540000a0     	b.eq	0x460ff44 <_ChromeMain+0x460aca8>
 460ff34: f9400268     	ldr	x8, [x19]
 460ff38: f9405108     	ldr	x8, [x8, #0xa0]
 460ff3c: aa1303e0     	mov	x0, x19
 460ff40: d63f0100     	blr	x8
 460ff44: aa1303e0     	mov	x0, x19
 460ff48: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 460ff4c: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 460ff50: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 460ff54: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 460ff58: a94967fa     	ldp	x26, x25, [sp, #0x90]
 460ff5c: a9486ffc     	ldp	x28, x27, [sp, #0x80]
 460ff60: 910383ff     	add	sp, sp, #0xe0
 460ff64: d65f03c0     	ret
 460ff68: 925e7695     	and	x21, x20, #0xfffffffc00000000
 460ff6c: f94046e8     	ldr	x8, [x23, #0x88]
 460ff70: eb0802bf     	cmp	x21, x8
 460ff74: 54000060     	b.eq	0x460ff80 <_ChromeMain+0x460ace4>
 460ff78: 52800016     	mov	w22, #0x0               ; =0
 460ff7c: 14000004     	b	0x460ff8c <_ChromeMain+0x460acf0>
 460ff80: 911bce60     	add	x0, x19, #0x6f3
 460ff84: 96e810de     	bl	0x142fc <_ChromeMain+0xf060>
 460ff88: 39400296     	ldrb	w22, [x20]
 460ff8c: 52800008     	mov	w8, #0x0                ; =0
 460ff90: 52800029     	mov	w9, #0x1                ; =1
 460ff94: 39000289     	strb	w9, [x20]
 460ff98: 391bd27f     	strb	wzr, [x19, #0x6f4]
 460ff9c: 12000101     	and	w1, w8, #0x1
 460ffa0: aa1303e0     	mov	x0, x19
 460ffa4: 94001717     	bl	0x4615c00 <_ChromeMain+0x4610964>
 460ffa8: 395bd668     	ldrb	w8, [x19, #0x6f5]
 460ffac: 395bd269     	ldrb	w9, [x19, #0x6f4]
 460ffb0: 3707ff49     	tbnz	w9, #0x0, 0x460ff98 <_ChromeMain+0x460acfc>
 460ffb4: 39000296     	strb	w22, [x20]
 460ffb8: f94046e8     	ldr	x8, [x23, #0x88]
 460ffbc: eb0802bf     	cmp	x21, x8
 460ffc0: 54fffb21     	b.ne	0x460ff24 <_ChromeMain+0x460ac88>
 460ffc4: 911bce60     	add	x0, x19, #0x6f3
 460ffc8: 96e84a9d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 460ffcc: 17ffffd6     	b	0x460ff24 <_ChromeMain+0x460ac88>
 460ffd0: 9004c9c8     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 460ffd4: 3dc29100     	ldr	q0, [x8, #0xa40]
 460ffd8: 3c8f82a0     	stur	q0, [x21, #0xf8]
 460ffdc: aa1503e0     	mov	x0, x21
 460ffe0: 52800021     	mov	w1, #0x1                ; =1
 460ffe4: 975154b3     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 460ffe8: 17ffff48     	b	0x460fd08 <_ChromeMain+0x460aa6c>
 460ffec: d2800014     	mov	x20, #0x0               ; =0
 460fff0: 17fffeef     	b	0x460fbac <_ChromeMain+0x460a910>
 460fff4: 97f30dc1     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 460fff8: 17fffef1     	b	0x460fbbc <_ChromeMain+0x460a920>
 460fffc: 97f30dbf     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4610000: 17ffff03     	b	0x460fc0c <_ChromeMain+0x460a970>
 4610004: d4200000     	brk	#0
 4610008: d4400000     	hlt	#0
 461000c: d4200020     	brk	#0x1
 4610010: d4200000     	brk	#0
 4610014: d4400000     	hlt	#0
 4610018: d4200020     	brk	#0x1
 461001c: d4200000     	brk	#0
 4610020: d4400000     	hlt	#0
 4610024: d4200020     	brk	#0x1
 4610028: d4200000     	brk	#0
 461002c: d4400000     	hlt	#0
 4610030: d4200020     	brk	#0x1
 4610034: 96e84a82     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4610038: 17ffffaf     	b	0x460fef4 <_ChromeMain+0x460ac58>
