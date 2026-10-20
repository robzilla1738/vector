
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426d388: d106c3ff     	sub	sp, sp, #0x1b0
 426d38c: a9156ffc     	stp	x28, x27, [sp, #0x150]
 426d390: a91667fa     	stp	x26, x25, [sp, #0x160]
 426d394: a9175ff8     	stp	x24, x23, [sp, #0x170]
 426d398: a91857f6     	stp	x22, x21, [sp, #0x180]
 426d39c: a9194ff4     	stp	x20, x19, [sp, #0x190]
 426d3a0: a91a7bfd     	stp	x29, x30, [sp, #0x1a0]
 426d3a4: 910683fd     	add	x29, sp, #0x1a0
 426d3a8: aa0303f3     	mov	x19, x3
 426d3ac: aa0203f4     	mov	x20, x2
 426d3b0: aa0103f7     	mov	x23, x1
 426d3b4: aa0003f5     	mov	x21, x0
 426d3b8: aa0203e0     	mov	x0, x2
 426d3bc: aa0203e1     	mov	x1, x2
 426d3c0: aa1703e2     	mov	x2, x23
 426d3c4: 9732846f     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 426d3c8: 360004c1     	tbz	w1, #0x0, 0x426d460 <_ChromeMain+0x42681c4>
 426d3cc: f94006ba     	ldr	x26, [x21, #0x8]
 426d3d0: f1000b5f     	cmp	x26, #0x2
 426d3d4: 54000463     	b.lo	0x426d460 <_ChromeMain+0x42681c4>
 426d3d8: 910283f8     	add	x24, sp, #0xa0
 426d3dc: f94002b9     	ldr	x25, [x21]
 426d3e0: 39405ee8     	ldrb	w8, [x23, #0x17]
 426d3e4: 13001d09     	sxtb	w9, w8
 426d3e8: 7100013f     	cmp	w9, #0x0
 426d3ec: a94026ea     	ldp	x10, x9, [x23]
 426d3f0: 9a884136     	csel	x22, x9, x8, mi
 426d3f4: 9a974157     	csel	x23, x10, x23, mi
 426d3f8: 5280003b     	mov	w27, #0x1               ; =1
 426d3fc: 14000005     	b	0x426d410 <_ChromeMain+0x4268174>
 426d400: 91000b7b     	add	x27, x27, #0x2
 426d404: 91010339     	add	x25, x25, #0x40
 426d408: eb1a037f     	cmp	x27, x26
 426d40c: 540002a2     	b.hs	0x426d460 <_ChromeMain+0x42681c4>
 426d410: 39406328     	ldrb	w8, [x25, #0x18]
 426d414: 7100111f     	cmp	w8, #0x4
 426d418: 54ffff41     	b.ne	0x426d400 <_ChromeMain+0x4268164>
 426d41c: 39405f29     	ldrb	w9, [x25, #0x17]
 426d420: 13001d28     	sxtb	w8, w9
 426d424: f940072a     	ldr	x10, [x25, #0x8]
 426d428: 7100011f     	cmp	w8, #0x0
 426d42c: 9a894149     	csel	x9, x10, x9, mi
 426d430: eb16013f     	cmp	x9, x22
 426d434: 54fffe61     	b.ne	0x426d400 <_ChromeMain+0x4268164>
 426d438: f9400329     	ldr	x9, [x25]
 426d43c: 7100011f     	cmp	w8, #0x0
 426d440: 9a994120     	csel	x0, x9, x25, mi
 426d444: aa1703e1     	mov	x1, x23
 426d448: aa1603e2     	mov	x2, x22
 426d44c: 94f67105     	bl	0x8009860 <_ChromeMain+0x80045c4>
 426d450: 35fffd80     	cbnz	w0, 0x426d400 <_ChromeMain+0x4268164>
 426d454: 3940e328     	ldrb	w8, [x25, #0x38]
 426d458: 7100191f     	cmp	w8, #0x6
 426d45c: 54000260     	b.eq	0x426d4a8 <_ChromeMain+0x426820c>
 426d460: a95a7bfd     	ldp	x29, x30, [sp, #0x1a0]
 426d464: a9594ff4     	ldp	x20, x19, [sp, #0x190]
 426d468: a95857f6     	ldp	x22, x21, [sp, #0x180]
 426d46c: a9575ff8     	ldp	x24, x23, [sp, #0x170]
 426d470: a95667fa     	ldp	x26, x25, [sp, #0x160]
 426d474: a9556ffc     	ldp	x28, x27, [sp, #0x150]
 426d478: 9106c3ff     	add	sp, sp, #0x1b0
 426d47c: d65f03c0     	ret
 426d480: 528001e8     	mov	w8, #0xf                ; =15
 426d484: f004c589     	adrp	x9, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426d488: 91156129     	add	x9, x9, #0x558
 426d48c: 3900dfe8     	strb	w8, [sp, #0x37]
 426d490: f9400128     	ldr	x8, [x9]
 426d494: f90013e8     	str	x8, [sp, #0x20]
 426d498: f8407128     	ldur	x8, [x9, #0x7]
 426d49c: f80273e8     	stur	x8, [sp, #0x27]
 426d4a0: 3900bfff     	strb	wzr, [sp, #0x2f]
 426d4a4: 14000024     	b	0x426d534 <_ChromeMain+0x4268298>
 426d4a8: 91008336     	add	x22, x25, #0x20
 426d4ac: d004ac01     	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426d4b0: 91258021     	add	x1, x1, #0x960
 426d4b4: aa1603e0     	mov	x0, x22
 426d4b8: 528000a2     	mov	w2, #0x5                ; =5
 426d4bc: 971bc4e1     	bl	0x95e840 <_ChromeMain+0x9595a4>
 426d4c0: f100001f     	cmp	x0, #0x0
 426d4c4: 9a8002d6     	csel	x22, x22, x0, eq
 426d4c8: b4fffcd6     	cbz	x22, 0x426d460 <_ChromeMain+0x42681c4>
 426d4cc: f004c581     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426d4d0: 91153821     	add	x1, x1, #0x54e
 426d4d4: aa1603e0     	mov	x0, x22
 426d4d8: 52800122     	mov	w2, #0x9                ; =9
 426d4dc: 9707f619     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426d4e0: b4000ec0     	cbz	x0, 0x426d6b8 <_ChromeMain+0x426841c>
 426d4e4: 39406008     	ldrb	w8, [x0, #0x18]
 426d4e8: 7100191f     	cmp	w8, #0x6
 426d4ec: 54000e61     	b.ne	0x426d6b8 <_ChromeMain+0x426841c>
 426d4f0: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 426d4f4: f9001bff     	str	xzr, [sp, #0x30]
 426d4f8: f004ac61     	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 426d4fc: 91307021     	add	x1, x1, #0xc1c
 426d500: aa1603e0     	mov	x0, x22
 426d504: 528000a2     	mov	w2, #0x5                ; =5
 426d508: 9776f15e     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 426d50c: b4fffba0     	cbz	x0, 0x426d480 <_ChromeMain+0x42681e4>
 426d510: 910083e8     	add	x8, sp, #0x20
 426d514: eb00011f     	cmp	x8, x0
 426d518: 540000e0     	b.eq	0x426d534 <_ChromeMain+0x4268298>
 426d51c: 39c05c08     	ldrsb	w8, [x0, #0x17]
 426d520: 37f80c48     	tbnz	w8, #0x1f, 0x426d6a8 <_ChromeMain+0x426840c>
 426d524: 3dc00000     	ldr	q0, [x0]
 426d528: f9400808     	ldr	x8, [x0, #0x10]
 426d52c: f9001be8     	str	x8, [sp, #0x30]
 426d530: 3d800be0     	str	q0, [sp, #0x20]
 426d534: 6f00e400     	movi.2d	v0, #0000000000000000
 426d538: 3c898300     	stur	q0, [x24, #0x98]
 426d53c: 910283f7     	add	x23, sp, #0xa0
 426d540: 3c888300     	stur	q0, [x24, #0x88]
 426d544: 3c878300     	stur	q0, [x24, #0x78]
 426d548: 3c868300     	stur	q0, [x24, #0x68]
 426d54c: 3c858300     	stur	q0, [x24, #0x58]
 426d550: 3c848300     	stur	q0, [x24, #0x48]
 426d554: 3c838300     	stur	q0, [x24, #0x38]
 426d558: 3c828300     	stur	q0, [x24, #0x28]
 426d55c: 3c818300     	stur	q0, [x24, #0x18]
 426d560: 3dc00be0     	ldr	q0, [sp, #0x20]
 426d564: 3d802be0     	str	q0, [sp, #0xa0]
 426d568: f9401be8     	ldr	x8, [sp, #0x30]
 426d56c: f900a7ff     	str	xzr, [sp, #0x148]
 426d570: f9005be8     	str	x8, [sp, #0xb0]
 426d574: 3900dfff     	strb	wzr, [sp, #0x37]
 426d578: 390083ff     	strb	wzr, [sp, #0x20]
 426d57c: f004c581     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426d580: 9113e821     	add	x1, x1, #0x4fa
 426d584: aa1603e0     	mov	x0, x22
 426d588: 52800162     	mov	w2, #0xb                ; =11
 426d58c: 975afd3d     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 426d590: b40000e0     	cbz	x0, 0x426d5ac <_ChromeMain+0x4268310>
 426d594: a9402016     	ldp	x22, x8, [x0]
 426d598: 8b0816c9     	add	x9, x22, x8, lsl #5
 426d59c: eb0902df     	cmp	x22, x9
 426d5a0: 54001e88     	b.hi	0x426d970 <_ChromeMain+0x42686d4>
 426d5a4: d37be918     	lsl	x24, x8, #5
 426d5a8: b5000798     	cbnz	x24, 0x426d698 <_ChromeMain+0x42683fc>
 426d5ac: a940a668     	ldp	x8, x9, [x19, #0x8]
 426d5b0: eb09011f     	cmp	x8, x9
 426d5b4: 54001be0     	b.eq	0x426d930 <_ChromeMain+0x4268694>
 426d5b8: f9400269     	ldr	x9, [x19]
 426d5bc: 5280160a     	mov	w10, #0xb0              ; =176
 426d5c0: 9b0a2514     	madd	x20, x8, x10, x9
 426d5c4: b4001b54     	cbz	x20, 0x426d92c <_ChromeMain+0x4268690>
 426d5c8: 3dc02be0     	ldr	q0, [sp, #0xa0]
 426d5cc: f9405be8     	ldr	x8, [sp, #0xb0]
 426d5d0: f9000a88     	str	x8, [x20, #0x10]
 426d5d4: 3d800280     	str	q0, [x20]
 426d5d8: a90affff     	stp	xzr, xzr, [sp, #0xa8]
 426d5dc: f90053ff     	str	xzr, [sp, #0xa0]
 426d5e0: aa1403e0     	mov	x0, x20
 426d5e4: 38018c1f     	strb	wzr, [x0, #0x18]!
 426d5e8: 3901e01f     	strb	wzr, [x0, #0x78]
 426d5ec: 3944c3e8     	ldrb	w8, [sp, #0x130]
 426d5f0: 360000a8     	tbz	w8, #0x0, 0x426d604 <_ChromeMain+0x4268368>
 426d5f4: 910062e1     	add	x1, x23, #0x18
 426d5f8: 96fdb613     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 426d5fc: 52800028     	mov	w8, #0x1                ; =1
 426d600: 39024288     	strb	w8, [x20, #0x90]
 426d604: f9409fe8     	ldr	x8, [sp, #0x138]
 426d608: f9009fff     	str	xzr, [sp, #0x138]
 426d60c: f9004e88     	str	x8, [x20, #0x98]
 426d610: f940a3e8     	ldr	x8, [sp, #0x140]
 426d614: f900a3ff     	str	xzr, [sp, #0x140]
 426d618: f9005288     	str	x8, [x20, #0xa0]
 426d61c: f940a7e8     	ldr	x8, [sp, #0x148]
 426d620: f900a7ff     	str	xzr, [sp, #0x148]
 426d624: f9005688     	str	x8, [x20, #0xa8]
 426d628: 9102c280     	add	x0, x20, #0xb0
 426d62c: f9400268     	ldr	x8, [x19]
 426d630: eb080008     	subs	x8, x0, x8
 426d634: 9344fd08     	asr	x8, x8, #4
 426d638: d2917469     	mov	x9, #0x8ba3             ; =35747
 426d63c: f2b745c9     	movk	x9, #0xba2e, lsl #16
 426d640: f2d45d09     	movk	x9, #0xa2e8, lsl #32
 426d644: f2e5d169     	movk	x9, #0x2e8b, lsl #48
 426d648: 9b097d08     	mul	x8, x8, x9
 426d64c: f9000668     	str	x8, [x19, #0x8]
 426d650: 540016e0     	b.eq	0x426d92c <_ChromeMain+0x4268690>
 426d654: 910283e0     	add	x0, sp, #0xa0
 426d658: 97fff75a     	bl	0x426b3c0 <_ChromeMain+0x4266124>
 426d65c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 426d660: 36fff008     	tbz	w8, #0x1f, 0x426d460 <_ChromeMain+0x42681c4>
 426d664: f94013e0     	ldr	x0, [sp, #0x20]
 426d668: f9401be8     	ldr	x8, [sp, #0x30]
 426d66c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426d670: 96f66e12     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426d674: 17ffff7b     	b	0x426d460 <_ChromeMain+0x42681c4>
 426d678: 910262e3     	add	x3, x23, #0x98
 426d67c: aa1503e0     	mov	x0, x21
 426d680: aa1603e1     	mov	x1, x22
 426d684: aa1403e2     	mov	x2, x20
 426d688: 97ffff40     	bl	0x426d388 <_ChromeMain+0x42680ec>
 426d68c: 910082d6     	add	x22, x22, #0x20
 426d690: f1008318     	subs	x24, x24, #0x20
 426d694: 54fff8c0     	b.eq	0x426d5ac <_ChromeMain+0x4268310>
 426d698: 394062c8     	ldrb	w8, [x22, #0x18]
 426d69c: 7100111f     	cmp	w8, #0x4
 426d6a0: 54ffff61     	b.ne	0x426d68c <_ChromeMain+0x42683f0>
 426d6a4: 17fffff5     	b	0x426d678 <_ChromeMain+0x42683dc>
 426d6a8: a9400801     	ldp	x1, x2, [x0]
 426d6ac: 910083e0     	add	x0, sp, #0x20
 426d6b0: 9708ed01     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 426d6b4: 17ffffa0     	b	0x426d534 <_ChromeMain+0x4268298>
 426d6b8: f004c581     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426d6bc: 9115a021     	add	x1, x1, #0x568
 426d6c0: aa1603e0     	mov	x0, x22
 426d6c4: 52800222     	mov	w2, #0x11               ; =17
 426d6c8: 9707f59e     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426d6cc: b4ffeca0     	cbz	x0, 0x426d460 <_ChromeMain+0x42681c4>
 426d6d0: aa0003e1     	mov	x1, x0
 426d6d4: 39406008     	ldrb	w8, [x0, #0x18]
 426d6d8: 7100111f     	cmp	w8, #0x4
 426d6dc: 54ffec21     	b.ne	0x426d460 <_ChromeMain+0x42681c4>
 426d6e0: f9004bff     	str	xzr, [sp, #0x90]
 426d6e4: 6f00e400     	movi.2d	v0, #0000000000000000
 426d6e8: ad0383e0     	stp	q0, q0, [sp, #0x70]
 426d6ec: ad0283e0     	stp	q0, q0, [sp, #0x50]
 426d6f0: ad0183e0     	stp	q0, q0, [sp, #0x30]
 426d6f4: 3d800be0     	str	q0, [sp, #0x20]
 426d6f8: 39805c22     	ldrsb	x2, [x1, #0x17]
 426d6fc: b6f80042     	tbz	x2, #0x3f, 0x426d704 <_ChromeMain+0x4268468>
 426d700: a9400821     	ldp	x1, x2, [x1]
 426d704: 910083f4     	add	x20, sp, #0x20
 426d708: 910083e0     	add	x0, sp, #0x20
 426d70c: 97040ab2     	bl	0x3701d4 <_ChromeMain+0x36af38>
 426d710: 3940e3e8     	ldrb	w8, [sp, #0x38]
 426d714: 34000268     	cbz	w8, 0x426d760 <_ChromeMain+0x42684c4>
 426d718: f004ac21     	adrp	x1, 0xd7f4000 <dyld_stub_binder+0xd7f4000>
 426d71c: 910b4c21     	add	x1, x1, #0x2d3
 426d720: 910083e0     	add	x0, sp, #0x20
 426d724: 528000c2     	mov	w2, #0x6                ; =6
 426d728: 970ccb1a     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 426d72c: 370001a0     	tbnz	w0, #0x0, 0x426d760 <_ChromeMain+0x42684c4>
 426d730: b004b1a1     	adrp	x1, 0xd8a2000 <dyld_stub_binder+0xd8a2000>
 426d734: 91144021     	add	x1, x1, #0x510
 426d738: 910083e0     	add	x0, sp, #0x20
 426d73c: 52800202     	mov	w2, #0x10               ; =16
 426d740: 970ccb14     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 426d744: 370000e0     	tbnz	w0, #0x0, 0x426d760 <_ChromeMain+0x42684c4>
 426d748: b004bb01     	adrp	x1, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 426d74c: 9133cc21     	add	x1, x1, #0xcf3
 426d750: 910083e0     	add	x0, sp, #0x20
 426d754: 52800102     	mov	w2, #0x8                ; =8
 426d758: 970ccb0e     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 426d75c: 360001e0     	tbz	w0, #0x0, 0x426d798 <_ChromeMain+0x42684fc>
 426d760: 9101c280     	add	x0, x20, #0x70
 426d764: d2800001     	mov	x1, #0x0                ; =0
 426d768: 96f6e954     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 426d76c: 91008280     	add	x0, x20, #0x20
 426d770: 96f6e942     	bl	0x27c78 <_ChromeMain+0x229dc>
 426d774: 17ffffba     	b	0x426d65c <_ChromeMain+0x42683c0>
 426d778: 39406008     	ldrb	w8, [x0, #0x18]
 426d77c: 7100111f     	cmp	w8, #0x4
 426d780: 54000281     	b.ne	0x426d7d0 <_ChromeMain+0x4268534>
 426d784: 14000015     	b	0x426d7d8 <_ChromeMain+0x426853c>
 426d788: a9400801     	ldp	x1, x2, [x0]
 426d78c: 910003e0     	mov	x0, sp
 426d790: 9708ecc9     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 426d794: 1400001c     	b	0x426d804 <_ChromeMain+0x4268568>
 426d798: a9007fff     	stp	xzr, xzr, [sp]
 426d79c: f9000bff     	str	xzr, [sp, #0x10]
 426d7a0: f004ac61     	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 426d7a4: 91307021     	add	x1, x1, #0xc1c
 426d7a8: aa1603e0     	mov	x0, x22
 426d7ac: 528000a2     	mov	w2, #0x5                ; =5
 426d7b0: 9776f0b4     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 426d7b4: b5000120     	cbnz	x0, 0x426d7d8 <_ChromeMain+0x426853c>
 426d7b8: f004c581     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426d7bc: 9115e821     	add	x1, x1, #0x57a
 426d7c0: aa1603e0     	mov	x0, x22
 426d7c4: 52800262     	mov	w2, #0x13               ; =19
 426d7c8: 9707f55e     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426d7cc: b5fffd60     	cbnz	x0, 0x426d778 <_ChromeMain+0x42684dc>
 426d7d0: 910083e0     	add	x0, sp, #0x20
 426d7d4: 970ffcad     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 426d7d8: 910003e8     	mov	x8, sp
 426d7dc: eb00011f     	cmp	x8, x0
 426d7e0: 54000120     	b.eq	0x426d804 <_ChromeMain+0x4268568>
 426d7e4: 39c05fe9     	ldrsb	w9, [sp, #0x17]
 426d7e8: 39405c08     	ldrb	w8, [x0, #0x17]
 426d7ec: 37f80aa9     	tbnz	w9, #0x1f, 0x426d940 <_ChromeMain+0x42686a4>
 426d7f0: 373ffcc8     	tbnz	w8, #0x7, 0x426d788 <_ChromeMain+0x42684ec>
 426d7f4: 3dc00000     	ldr	q0, [x0]
 426d7f8: f9400808     	ldr	x8, [x0, #0x10]
 426d7fc: f9000be8     	str	x8, [sp, #0x10]
 426d800: 3d8003e0     	str	q0, [sp]
 426d804: 6f00e400     	movi.2d	v0, #0000000000000000
 426d808: 3c898300     	stur	q0, [x24, #0x98]
 426d80c: 910283f5     	add	x21, sp, #0xa0
 426d810: 3c888300     	stur	q0, [x24, #0x88]
 426d814: 3c878300     	stur	q0, [x24, #0x78]
 426d818: 3c868300     	stur	q0, [x24, #0x68]
 426d81c: 3c858300     	stur	q0, [x24, #0x58]
 426d820: 3c848300     	stur	q0, [x24, #0x48]
 426d824: 3c838300     	stur	q0, [x24, #0x38]
 426d828: 3c828300     	stur	q0, [x24, #0x28]
 426d82c: 3c818300     	stur	q0, [x24, #0x18]
 426d830: 3dc003e0     	ldr	q0, [sp]
 426d834: 3d802be0     	str	q0, [sp, #0xa0]
 426d838: f9400be8     	ldr	x8, [sp, #0x10]
 426d83c: f900a7ff     	str	xzr, [sp, #0x148]
 426d840: f9005be8     	str	x8, [sp, #0xb0]
 426d844: 39005fff     	strb	wzr, [sp, #0x17]
 426d848: 390003ff     	strb	wzr, [sp]
 426d84c: 910062a0     	add	x0, x21, #0x18
 426d850: 910083e1     	add	x1, sp, #0x20
 426d854: 96fdb57c     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 426d858: 52800028     	mov	w8, #0x1                ; =1
 426d85c: 3904c3e8     	strb	w8, [sp, #0x130]
 426d860: a940a668     	ldp	x8, x9, [x19, #0x8]
 426d864: eb09011f     	cmp	x8, x9
 426d868: 540007c0     	b.eq	0x426d960 <_ChromeMain+0x42686c4>
 426d86c: f9400269     	ldr	x9, [x19]
 426d870: 5280160a     	mov	w10, #0xb0              ; =176
 426d874: 9b0a2516     	madd	x22, x8, x10, x9
 426d878: b40005b6     	cbz	x22, 0x426d92c <_ChromeMain+0x4268690>
 426d87c: 3dc02be0     	ldr	q0, [sp, #0xa0]
 426d880: f9405be8     	ldr	x8, [sp, #0xb0]
 426d884: f9000ac8     	str	x8, [x22, #0x10]
 426d888: 3d8002c0     	str	q0, [x22]
 426d88c: a90affff     	stp	xzr, xzr, [sp, #0xa8]
 426d890: f90053ff     	str	xzr, [sp, #0xa0]
 426d894: aa1603e0     	mov	x0, x22
 426d898: 38018c1f     	strb	wzr, [x0, #0x18]!
 426d89c: 3901e01f     	strb	wzr, [x0, #0x78]
 426d8a0: 3944c3e8     	ldrb	w8, [sp, #0x130]
 426d8a4: 360000a8     	tbz	w8, #0x0, 0x426d8b8 <_ChromeMain+0x426861c>
 426d8a8: 910062a1     	add	x1, x21, #0x18
 426d8ac: 96fdb566     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 426d8b0: 52800028     	mov	w8, #0x1                ; =1
 426d8b4: 390242c8     	strb	w8, [x22, #0x90]
 426d8b8: f9409fe8     	ldr	x8, [sp, #0x138]
 426d8bc: f9009fff     	str	xzr, [sp, #0x138]
 426d8c0: f9004ec8     	str	x8, [x22, #0x98]
 426d8c4: f940a3e8     	ldr	x8, [sp, #0x140]
 426d8c8: f900a3ff     	str	xzr, [sp, #0x140]
 426d8cc: f90052c8     	str	x8, [x22, #0xa0]
 426d8d0: f940a7e8     	ldr	x8, [sp, #0x148]
 426d8d4: f900a7ff     	str	xzr, [sp, #0x148]
 426d8d8: f90056c8     	str	x8, [x22, #0xa8]
 426d8dc: 9102c2c0     	add	x0, x22, #0xb0
 426d8e0: f9400268     	ldr	x8, [x19]
 426d8e4: eb080008     	subs	x8, x0, x8
 426d8e8: 9344fd08     	asr	x8, x8, #4
 426d8ec: d2917469     	mov	x9, #0x8ba3             ; =35747
 426d8f0: f2b745c9     	movk	x9, #0xba2e, lsl #16
 426d8f4: f2d45d09     	movk	x9, #0xa2e8, lsl #32
 426d8f8: f2e5d169     	movk	x9, #0x2e8b, lsl #48
 426d8fc: 9b097d08     	mul	x8, x8, x9
 426d900: f9000668     	str	x8, [x19, #0x8]
 426d904: 54000140     	b.eq	0x426d92c <_ChromeMain+0x4268690>
 426d908: 910283e0     	add	x0, sp, #0xa0
 426d90c: 97fff6ad     	bl	0x426b3c0 <_ChromeMain+0x4266124>
 426d910: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 426d914: 36fff268     	tbz	w8, #0x1f, 0x426d760 <_ChromeMain+0x42684c4>
 426d918: f94003e0     	ldr	x0, [sp]
 426d91c: f9400be8     	ldr	x8, [sp, #0x10]
 426d920: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426d924: 96f66d65     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426d928: 17ffff8e     	b	0x426d760 <_ChromeMain+0x42684c4>
 426d92c: d4200020     	brk	#0x1
 426d930: 910283e1     	add	x1, sp, #0xa0
 426d934: aa1303e0     	mov	x0, x19
 426d938: 94000011     	bl	0x426d97c <_ChromeMain+0x42686e0>
 426d93c: 17ffff3c     	b	0x426d62c <_ChromeMain+0x4268390>
 426d940: 13001d09     	sxtb	w9, w8
 426d944: 7100013f     	cmp	w9, #0x0
 426d948: a9402809     	ldp	x9, x10, [x0]
 426d94c: 9a804121     	csel	x1, x9, x0, mi
 426d950: 9a884142     	csel	x2, x10, x8, mi
 426d954: 910003e0     	mov	x0, sp
 426d958: 9708ecaa     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 426d95c: 17ffffaa     	b	0x426d804 <_ChromeMain+0x4268568>
 426d960: 910283e1     	add	x1, sp, #0xa0
 426d964: aa1303e0     	mov	x0, x19
 426d968: 94000005     	bl	0x426d97c <_ChromeMain+0x42686e0>
 426d96c: 17ffffdd     	b	0x426d8e0 <_ChromeMain+0x4268644>
 426d970: d4200000     	brk	#0
 426d974: d4400000     	hlt	#0
 426d978: 17ffffed     	b	0x426d92c <_ChromeMain+0x4268690>
