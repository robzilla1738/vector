
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2d63680: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 2d63684: a9015ff8     	stp	x24, x23, [sp, #0x10]
 2d63688: a90257f6     	stp	x22, x21, [sp, #0x20]
 2d6368c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 2d63690: a9047bfd     	stp	x29, x30, [sp, #0x40]
 2d63694: 910103fd     	add	x29, sp, #0x40
 2d63698: aa0403f8     	mov	x24, x4
 2d6369c: aa0303f6     	mov	x22, x3
 2d636a0: aa0203f7     	mov	x23, x2
 2d636a4: aa0103f5     	mov	x21, x1
 2d636a8: aa0003f3     	mov	x19, x0
 2d636ac: 9005aab9     	adrp	x25, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 2d636b0: 913c2339     	add	x25, x25, #0xf08
 2d636b4: f9000019     	str	x25, [x0]
 2d636b8: 52800100     	mov	w0, #0x8                ; =8
 2d636bc: 974aaf2b     	bl	0xf368 <_ChromeMain+0xa0cc>
 2d636c0: b900001f     	str	wzr, [x0]
 2d636c4: 3900101f     	strb	wzr, [x0, #0x4]
 2d636c8: b40000c0     	cbz	x0, 0x2d636e0 <_ChromeMain+0x2d5e444>
 2d636cc: 52800028     	mov	w8, #0x1                ; =1
 2d636d0: b8280008     	ldadd	w8, w8, [x0]
 2d636d4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d636d8: 6b09011f     	cmp	w8, w9
 2d636dc: 54000f00     	b.eq	0x2d638bc <_ChromeMain+0x2d5e620>
 2d636e0: d005a968     	adrp	x8, 0xe291000 <dyld_stub_binder+0xe291000>
 2d636e4: 91192108     	add	x8, x8, #0x648
 2d636e8: a900ce60     	stp	x0, x19, [x19, #0x8]
 2d636ec: f9000268     	str	x8, [x19]
 2d636f0: aa1303f4     	mov	x20, x19
 2d636f4: f8018e99     	str	x25, [x20, #0x18]!
 2d636f8: 52800100     	mov	w0, #0x8                ; =8
 2d636fc: 974aaf1b     	bl	0xf368 <_ChromeMain+0xa0cc>
 2d63700: b900001f     	str	wzr, [x0]
 2d63704: 3900101f     	strb	wzr, [x0, #0x4]
 2d63708: b40000c0     	cbz	x0, 0x2d63720 <_ChromeMain+0x2d5e484>
 2d6370c: 52800028     	mov	w8, #0x1                ; =1
 2d63710: b8280008     	ldadd	w8, w8, [x0]
 2d63714: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d63718: 6b09011f     	cmp	w8, w9
 2d6371c: 54000d60     	b.eq	0x2d638c8 <_ChromeMain+0x2d5e62c>
 2d63720: f005a648     	adrp	x8, 0xe22e000 <dyld_stub_binder+0xe22e000>
 2d63724: 91198108     	add	x8, x8, #0x660
 2d63728: a9018268     	stp	x8, x0, [x19, #0x18]
 2d6372c: d0059da8     	adrp	x8, 0xe119000 <dyld_stub_binder+0xe119000>
 2d63730: 910d2108     	add	x8, x8, #0x348
 2d63734: a902a274     	stp	x20, x8, [x19, #0x28]
 2d63738: 9100e260     	add	x0, x19, #0x38
 2d6373c: 97aa1a69     	bl	0x17ea0e0 <_ChromeMain+0x17e4e44>
 2d63740: d0059da8     	adrp	x8, 0xe119000 <dyld_stub_binder+0xe119000>
 2d63744: 9128c108     	add	x8, x8, #0xa30
 2d63748: f9000268     	str	x8, [x19]
 2d6374c: 91016109     	add	x9, x8, #0x58
 2d63750: f9000e69     	str	x9, [x19, #0x18]
 2d63754: 91024108     	add	x8, x8, #0x90
 2d63758: f9001a68     	str	x8, [x19, #0x30]
 2d6375c: a90b5a77     	stp	x23, x22, [x19, #0xb0]
 2d63760: 925e7708     	and	x8, x24, #0xfffffffc00000000
 2d63764: f005f279     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2d63768: f9404729     	ldr	x9, [x25, #0x88]
 2d6376c: eb09011f     	cmp	x8, x9
 2d63770: 54000b80     	b.eq	0x2d638e0 <_ChromeMain+0x2d5e644>
 2d63774: f9006278     	str	x24, [x19, #0xc0]
 2d63778: b900ca7f     	str	wzr, [x19, #0xc8]
 2d6377c: 52801300     	mov	w0, #0x98               ; =152
 2d63780: 974aaefa     	bl	0xf368 <_ChromeMain+0xa0cc>
 2d63784: aa0003f8     	mov	x24, x0
 2d63788: 91012008     	add	x8, x0, #0x48
 2d6378c: 6f00e400     	movi.2d	v0, #0000000000000000
 2d63790: ad000000     	stp	q0, q0, [x0]
 2d63794: ad010000     	stp	q0, q0, [x0, #0x20]
 2d63798: a904201f     	stp	xzr, x8, [x0, #0x40]
 2d6379c: a9057c08     	stp	x8, xzr, [x0, #0x50]
 2d637a0: b900601f     	str	wzr, [x0, #0x60]
 2d637a4: b900681f     	str	wzr, [x0, #0x68]
 2d637a8: a9077c1f     	stp	xzr, xzr, [x0, #0x70]
 2d637ac: f807e01f     	stur	xzr, [x0, #0x7e]
 2d637b0: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 2d637b4: f9404729     	ldr	x9, [x25, #0x88]
 2d637b8: eb09011f     	cmp	x8, x9
 2d637bc: 54000061     	b.ne	0x2d637c8 <_ChromeMain+0x2d5e52c>
 2d637c0: aa1703e0     	mov	x0, x23
 2d637c4: 974ac2ce     	bl	0x142fc <_ChromeMain+0xf060>
 2d637c8: f9004717     	str	x23, [x24, #0x88]
 2d637cc: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 2d637d0: f9404729     	ldr	x9, [x25, #0x88]
 2d637d4: eb09011f     	cmp	x8, x9
 2d637d8: 54000061     	b.ne	0x2d637e4 <_ChromeMain+0x2d5e548>
 2d637dc: aa1603e0     	mov	x0, x22
 2d637e0: 974ac2c7     	bl	0x142fc <_ChromeMain+0xf060>
 2d637e4: f9004b16     	str	x22, [x24, #0x90]
 2d637e8: f9006a78     	str	x24, [x19, #0xd0]
 2d637ec: 52801300     	mov	w0, #0x98               ; =152
 2d637f0: 974aaede     	bl	0xf368 <_ChromeMain+0xa0cc>
 2d637f4: aa1503e1     	mov	x1, x21
 2d637f8: 97f9e3f8     	bl	0x2bdc7d8 <_ChromeMain+0x2bd753c>
 2d637fc: a90f7e7f     	stp	xzr, xzr, [x19, #0xf0]
 2d63800: aa1303e8     	mov	x8, x19
 2d63804: f80e8d1f     	str	xzr, [x8, #0xe8]!
 2d63808: a90da260     	stp	x0, x8, [x19, #0xd8]
 2d6380c: 91044268     	add	x8, x19, #0x110
 2d63810: a9107e7f     	stp	xzr, xzr, [x19, #0x100]
 2d63814: a9112268     	stp	x8, x8, [x19, #0x110]
 2d63818: f900927f     	str	xzr, [x19, #0x120]
 2d6381c: b9012a7f     	str	wzr, [x19, #0x128]
 2d63820: f9009a7f     	str	xzr, [x19, #0x130]
 2d63824: 925e7675     	and	x21, x19, #0xfffffffc00000000
 2d63828: f9404728     	ldr	x8, [x25, #0x88]
 2d6382c: eb0802bf     	cmp	x21, x8
 2d63830: 54000081     	b.ne	0x2d63840 <_ChromeMain+0x2d5e5a4>
 2d63834: aa1303e0     	mov	x0, x19
 2d63838: 974ac2b1     	bl	0x142fc <_ChromeMain+0xf060>
 2d6383c: f9404728     	ldr	x8, [x25, #0x88]
 2d63840: a913fe73     	stp	x19, xzr, [x19, #0x138]
 2d63844: eb0802bf     	cmp	x21, x8
 2d63848: 54000081     	b.ne	0x2d63858 <_ChromeMain+0x2d5e5bc>
 2d6384c: aa1303e0     	mov	x0, x19
 2d63850: 974ac2ab     	bl	0x142fc <_ChromeMain+0xf060>
 2d63854: f9404728     	ldr	x8, [x25, #0x88]
 2d63858: a914fe73     	stp	x19, xzr, [x19, #0x148]
 2d6385c: 925e7689     	and	x9, x20, #0xfffffffc00000000
 2d63860: eb08013f     	cmp	x9, x8
 2d63864: 54000061     	b.ne	0x2d63870 <_ChromeMain+0x2d5e5d4>
 2d63868: aa1403e0     	mov	x0, x20
 2d6386c: 974ac2a4     	bl	0x142fc <_ChromeMain+0xf060>
 2d63870: a915fe74     	stp	x20, xzr, [x19, #0x158]
 2d63874: 52800100     	mov	w0, #0x8                ; =8
 2d63878: 974aaebc     	bl	0xf368 <_ChromeMain+0xa0cc>
 2d6387c: b900001f     	str	wzr, [x0]
 2d63880: 3900101f     	strb	wzr, [x0, #0x4]
 2d63884: b40000c0     	cbz	x0, 0x2d6389c <_ChromeMain+0x2d5e600>
 2d63888: 52800028     	mov	w8, #0x1                ; =1
 2d6388c: b8280008     	ldadd	w8, w8, [x0]
 2d63890: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d63894: 6b09011f     	cmp	w8, w9
 2d63898: 540001e0     	b.eq	0x2d638d4 <_ChromeMain+0x2d5e638>
 2d6389c: a916ce60     	stp	x0, x19, [x19, #0x168]
 2d638a0: aa1303e0     	mov	x0, x19
 2d638a4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 2d638a8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 2d638ac: a94257f6     	ldp	x22, x21, [sp, #0x20]
 2d638b0: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 2d638b4: a8c567fa     	ldp	x26, x25, [sp], #0x50
 2d638b8: d65f03c0     	ret
 2d638bc: d4200000     	brk	#0
 2d638c0: d4400000     	hlt	#0
 2d638c4: d4200020     	brk	#0x1
 2d638c8: d4200000     	brk	#0
 2d638cc: d4400000     	hlt	#0
 2d638d0: d4200020     	brk	#0x1
 2d638d4: d4200000     	brk	#0
 2d638d8: d4400000     	hlt	#0
 2d638dc: d4200020     	brk	#0x1
 2d638e0: aa1803e0     	mov	x0, x24
 2d638e4: 974ac286     	bl	0x142fc <_ChromeMain+0xf060>
 2d638e8: a94b5a77     	ldp	x23, x22, [x19, #0xb0]
 2d638ec: 17ffffa2     	b	0x2d63774 <_ChromeMain+0x2d5e4d8>
 2d638f0: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 2d638f4: a90157f6     	stp	x22, x21, [sp, #0x10]
 2d638f8: a9024ff4     	stp	x20, x19, [sp, #0x20]
 2d638fc: a9037bfd     	stp	x29, x30, [sp, #0x30]
 2d63900: 9100c3fd     	add	x29, sp, #0x30
 2d63904: aa0303f4     	mov	x20, x3
 2d63908: aa0203f5     	mov	x21, x2
 2d6390c: aa0103f6     	mov	x22, x1
 2d63910: aa0003f3     	mov	x19, x0
 2d63914: 9005aaa8     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 2d63918: 913c2108     	add	x8, x8, #0xf08
 2d6391c: f9000008     	str	x8, [x0]
 2d63920: 52800100     	mov	w0, #0x8                ; =8
 2d63924: 974aae91     	bl	0xf368 <_ChromeMain+0xa0cc>
 2d63928: b900001f     	str	wzr, [x0]
 2d6392c: 3900101f     	strb	wzr, [x0, #0x4]
 2d63930: b40000c0     	cbz	x0, 0x2d63948 <_ChromeMain+0x2d5e6ac>
 2d63934: 52800028     	mov	w8, #0x1                ; =1
 2d63938: b8280008     	ldadd	w8, w8, [x0]
 2d6393c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d63940: 6b09011f     	cmp	w8, w9
 2d63944: 540004a0     	b.eq	0x2d639d8 <_ChromeMain+0x2d5e73c>
 2d63948: a900ce60     	stp	x0, x19, [x19, #0x8]
 2d6394c: d0059da8     	adrp	x8, 0xe119000 <dyld_stub_binder+0xe119000>
 2d63950: 912bc108     	add	x8, x8, #0xaf0
 2d63954: f9000268     	str	x8, [x19]
 2d63958: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 2d6395c: f005f277     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2d63960: f94046e9     	ldr	x9, [x23, #0x88]
 2d63964: eb09011f     	cmp	x8, x9
 2d63968: 54000061     	b.ne	0x2d63974 <_ChromeMain+0x2d5e6d8>
 2d6396c: aa1603e0     	mov	x0, x22
 2d63970: 974ac263     	bl	0x142fc <_ChromeMain+0xf060>
 2d63974: f9000e76     	str	x22, [x19, #0x18]
 2d63978: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 2d6397c: f94046e9     	ldr	x9, [x23, #0x88]
 2d63980: eb09011f     	cmp	x8, x9
 2d63984: 54000061     	b.ne	0x2d63990 <_ChromeMain+0x2d5e6f4>
 2d63988: aa1503e0     	mov	x0, x21
 2d6398c: 974ac25c     	bl	0x142fc <_ChromeMain+0xf060>
 2d63990: f9001275     	str	x21, [x19, #0x20]
 2d63994: 925e7688     	and	x8, x20, #0xfffffffc00000000
 2d63998: f94046e9     	ldr	x9, [x23, #0x88]
 2d6399c: eb09011f     	cmp	x8, x9
 2d639a0: 54000061     	b.ne	0x2d639ac <_ChromeMain+0x2d5e710>
 2d639a4: aa1403e0     	mov	x0, x20
 2d639a8: 974ac255     	bl	0x142fc <_ChromeMain+0xf060>
 2d639ac: f9001674     	str	x20, [x19, #0x28]
 2d639b0: f9400e68     	ldr	x8, [x19, #0x18]
 2d639b4: 9103e100     	add	x0, x8, #0xf8
 2d639b8: aa1303e1     	mov	x1, x19
 2d639bc: 97b15911     	bl	0x19b9e00 <_ChromeMain+0x19b4b64>
 2d639c0: aa1303e0     	mov	x0, x19
 2d639c4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 2d639c8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 2d639cc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 2d639d0: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 2d639d4: d65f03c0     	ret
 2d639d8: d4200000     	brk	#0
 2d639dc: d4400000     	hlt	#0
 2d639e0: d4200020     	brk	#0x1
 2d639e4: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 2d639e8: a9014ff4     	stp	x20, x19, [sp, #0x10]
 2d639ec: a9027bfd     	stp	x29, x30, [sp, #0x20]
 2d639f0: 910083fd     	add	x29, sp, #0x20
 2d639f4: aa0103f4     	mov	x20, x1
 2d639f8: aa0003f3     	mov	x19, x0
 2d639fc: 9005aaa8     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 2d63a00: 913c2108     	add	x8, x8, #0xf08
 2d63a04: f9000008     	str	x8, [x0]
 2d63a08: 52800100     	mov	w0, #0x8                ; =8
 2d63a0c: 974aae57     	bl	0xf368 <_ChromeMain+0xa0cc>
 2d63a10: b900001f     	str	wzr, [x0]
 2d63a14: 3900101f     	strb	wzr, [x0, #0x4]
 2d63a18: b40000c0     	cbz	x0, 0x2d63a30 <_ChromeMain+0x2d5e794>
 2d63a1c: 52800028     	mov	w8, #0x1                ; =1
 2d63a20: b8280008     	ldadd	w8, w8, [x0]
 2d63a24: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d63a28: 6b09011f     	cmp	w8, w9
 2d63a2c: 54000860     	b.eq	0x2d63b38 <_ChromeMain+0x2d5e89c>
 2d63a30: a900ce60     	stp	x0, x19, [x19, #0x8]
 2d63a34: d0059da8     	adrp	x8, 0xe119000 <dyld_stub_binder+0xe119000>
 2d63a38: 912c8108     	add	x8, x8, #0xb20
 2d63a3c: f9000268     	str	x8, [x19]
 2d63a40: 925e7688     	and	x8, x20, #0xfffffffc00000000
 2d63a44: f005f275     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2d63a48: f94046a9     	ldr	x9, [x21, #0x88]
 2d63a4c: eb09011f     	cmp	x8, x9
 2d63a50: 54000061     	b.ne	0x2d63a5c <_ChromeMain+0x2d5e7c0>
 2d63a54: aa1403e0     	mov	x0, x20
 2d63a58: 974ac229     	bl	0x142fc <_ChromeMain+0xf060>
 2d63a5c: f9000e74     	str	x20, [x19, #0x18]
 2d63a60: 6f00e400     	movi.2d	v0, #0000000000000000
 2d63a64: ad010260     	stp	q0, q0, [x19, #0x20]
 2d63a68: 3d801260     	str	q0, [x19, #0x40]
 2d63a6c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 2d63a70: f94046a9     	ldr	x9, [x21, #0x88]
 2d63a74: eb09011f     	cmp	x8, x9
 2d63a78: 54000061     	b.ne	0x2d63a84 <_ChromeMain+0x2d5e7e8>
 2d63a7c: aa1303e0     	mov	x0, x19
 2d63a80: 974ac21f     	bl	0x142fc <_ChromeMain+0xf060>
 2d63a84: f9002a73     	str	x19, [x19, #0x50]
 2d63a88: aa1303f6     	mov	x22, x19
 2d63a8c: 6f00e400     	movi.2d	v0, #0000000000000000
 2d63a90: 3c858ec0     	str	q0, [x22, #0x58]!
 2d63a94: 9101e268     	add	x8, x19, #0x78
 2d63a98: 3c868260     	stur	q0, [x19, #0x68]
 2d63a9c: a907a268     	stp	x8, x8, [x19, #0x78]
 2d63aa0: f900467f     	str	xzr, [x19, #0x88]
 2d63aa4: b900927f     	str	wzr, [x19, #0x90]
 2d63aa8: 52800100     	mov	w0, #0x8                ; =8
 2d63aac: 974aae2f     	bl	0xf368 <_ChromeMain+0xa0cc>
 2d63ab0: b900001f     	str	wzr, [x0]
 2d63ab4: 3900101f     	strb	wzr, [x0, #0x4]
 2d63ab8: b40000c0     	cbz	x0, 0x2d63ad0 <_ChromeMain+0x2d5e834>
 2d63abc: 52800028     	mov	w8, #0x1                ; =1
 2d63ac0: b8280008     	ldadd	w8, w8, [x0]
 2d63ac4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d63ac8: 6b09011f     	cmp	w8, w9
 2d63acc: 540003c0     	b.eq	0x2d63b44 <_ChromeMain+0x2d5e8a8>
 2d63ad0: a909ce60     	stp	x0, x19, [x19, #0x98]
 2d63ad4: f9400e74     	ldr	x20, [x19, #0x18]
 2d63ad8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 2d63adc: f94046a9     	ldr	x9, [x21, #0x88]
 2d63ae0: eb09011f     	cmp	x8, x9
 2d63ae4: 54000221     	b.ne	0x2d63b28 <_ChromeMain+0x2d5e88c>
 2d63ae8: aa1403e0     	mov	x0, x20
 2d63aec: 974ac204     	bl	0x142fc <_ChromeMain+0xf060>
 2d63af0: f94002c0     	ldr	x0, [x22]
 2d63af4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2d63af8: f94046a9     	ldr	x9, [x21, #0x88]
 2d63afc: eb09011f     	cmp	x8, x9
 2d63b00: 54000180     	b.eq	0x2d63b30 <_ChromeMain+0x2d5e894>
 2d63b04: f9002e74     	str	x20, [x19, #0x58]
 2d63b08: f9402a61     	ldr	x1, [x19, #0x50]
 2d63b0c: 9103e280     	add	x0, x20, #0xf8
 2d63b10: 97b158bc     	bl	0x19b9e00 <_ChromeMain+0x19b4b64>
 2d63b14: aa1303e0     	mov	x0, x19
 2d63b18: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 2d63b1c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 2d63b20: a8c357f6     	ldp	x22, x21, [sp], #0x30
 2d63b24: d65f03c0     	ret
 2d63b28: d2800000     	mov	x0, #0x0                ; =0
 2d63b2c: 17fffff2     	b	0x2d63af4 <_ChromeMain+0x2d5e858>
 2d63b30: 974afbc3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 2d63b34: 17fffff4     	b	0x2d63b04 <_ChromeMain+0x2d5e868>
 2d63b38: d4200000     	brk	#0
 2d63b3c: d4400000     	hlt	#0
 2d63b40: d4200020     	brk	#0x1
 2d63b44: d4200000     	brk	#0
 2d63b48: d4400000     	hlt	#0
 2d63b4c: d4200020     	brk	#0x1
 2d63b50: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 2d63b54: a9014ff4     	stp	x20, x19, [sp, #0x10]
 2d63b58: a9027bfd     	stp	x29, x30, [sp, #0x20]
 2d63b5c: 910083fd     	add	x29, sp, #0x20
 2d63b60: aa0003f3     	mov	x19, x0
 2d63b64: f9409814     	ldr	x20, [x0, #0x130]
 2d63b68: f9009801     	str	x1, [x0, #0x130]
 2d63b6c: b5000a34     	cbnz	x20, 0x2d63cb0 <_ChromeMain+0x2d5ea14>
 2d63b70: aa1303f4     	mov	x20, x19
 2d63b74: f84e8e80     	ldr	x0, [x20, #0xe8]!
 2d63b78: 940c0328     	bl	0x3064818 <_ChromeMain+0x305f57c>
 2d63b7c: a9007e9f     	stp	xzr, xzr, [x20]
 2d63b80: f81f8294     	stur	x20, [x20, #-0x8]
 2d63b84: f85f0280     	ldur	x0, [x20, #-0x10]
 2d63b88: 9400007a     	bl	0x2d63d70 <_ChromeMain+0x2d5ead4>
 2d63b8c: f85c8294     	ldur	x20, [x20, #-0x38]
 2d63b90: b4000cf4     	cbz	x20, 0x2d63d2c <_ChromeMain+0x2d5ea90>
 2d63b94: 925e7688     	and	x8, x20, #0xfffffffc00000000
 2d63b98: f005f275     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2d63b9c: f94046a9     	ldr	x9, [x21, #0x88]
 2d63ba0: eb09011f     	cmp	x8, x9
 2d63ba4: 54000061     	b.ne	0x2d63bb0 <_ChromeMain+0x2d5e914>
 2d63ba8: aa1403e0     	mov	x0, x20
 2d63bac: 974ac1d4     	bl	0x142fc <_ChromeMain+0xf060>
 2d63bb0: f940a260     	ldr	x0, [x19, #0x140]
 2d63bb4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2d63bb8: f94046a9     	ldr	x9, [x21, #0x88]
 2d63bbc: eb09011f     	cmp	x8, x9
 2d63bc0: 54000be0     	b.eq	0x2d63d3c <_ChromeMain+0x2d5eaa0>
 2d63bc4: f900a274     	str	x20, [x19, #0x140]
 2d63bc8: f9409e61     	ldr	x1, [x19, #0x138]
 2d63bcc: 9100c280     	add	x0, x20, #0x30
 2d63bd0: 9758df74     	bl	0x39b9a0 <_ChromeMain+0x396704>
 2d63bd4: f9405e74     	ldr	x20, [x19, #0xb8]
 2d63bd8: b4000214     	cbz	x20, 0x2d63c18 <_ChromeMain+0x2d5e97c>
 2d63bdc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 2d63be0: f94046a9     	ldr	x9, [x21, #0x88]
 2d63be4: eb09011f     	cmp	x8, x9
 2d63be8: 54000061     	b.ne	0x2d63bf4 <_ChromeMain+0x2d5e958>
 2d63bec: aa1403e0     	mov	x0, x20
 2d63bf0: 974ac1c3     	bl	0x142fc <_ChromeMain+0xf060>
 2d63bf4: f940aa60     	ldr	x0, [x19, #0x150]
 2d63bf8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2d63bfc: f94046a9     	ldr	x9, [x21, #0x88]
