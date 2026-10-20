
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467e380: d104c3ff     	sub	sp, sp, #0x130
 467e384: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 467e388: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 467e38c: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 467e390: a91057f6     	stp	x22, x21, [sp, #0x100]
 467e394: a9114ff4     	stp	x20, x19, [sp, #0x110]
 467e398: a9127bfd     	stp	x29, x30, [sp, #0x120]
 467e39c: 910483fd     	add	x29, sp, #0x120
 467e3a0: aa0003f3     	mov	x19, x0
 467e3a4: f941bc00     	ldr	x0, [x0, #0x378]
 467e3a8: b40020e0     	cbz	x0, 0x467e7c4 <_ChromeMain+0x4679528>
 467e3ac: 910243f6     	add	x22, sp, #0x90
 467e3b0: 975f4c5a     	bl	0x1e51518 <_ChromeMain+0x1e4c27c>
 467e3b4: f941ee68     	ldr	x8, [x19, #0x3d8]
 467e3b8: d37be917     	lsl	x23, x8, #5
 467e3bc: b4000677     	cbz	x23, 0x467e488 <_ChromeMain+0x46791ec>
 467e3c0: d2800018     	mov	x24, #0x0               ; =0
 467e3c4: f941ea68     	ldr	x8, [x19, #0x3d0]
 467e3c8: 91006519     	add	x25, x8, #0x19
 467e3cc: 52801c3a     	mov	w26, #0xe1              ; =225
 467e3d0: 52801bbb     	mov	w27, #0xdd              ; =221
 467e3d4: f0051ab4     	adrp	x20, 0xe9d5000 <dyld_stub_binder+0xe9d5000>
 467e3d8: 9112c294     	add	x20, x20, #0x4b0
 467e3dc: 1400001e     	b	0x467e454 <_ChromeMain+0x46791b8>
 467e3e0: 3dc00100     	ldr	q0, [x8]
 467e3e4: f9400908     	ldr	x8, [x8, #0x10]
 467e3e8: f81a03a8     	stur	x8, [x29, #-0x60]
 467e3ec: 3d800ac0     	str	q0, [x22, #0x20]
 467e3f0: 385ff323     	ldurb	w3, [x25, #-0x1]
 467e3f4: 7100007f     	cmp	w3, #0x0
 467e3f8: 1a9a1368     	csel	w8, w27, w26, ne
 467e3fc: b81883a8     	stur	w8, [x29, #-0x78]
 467e400: 3818c3bf     	sturb	wzr, [x29, #-0x74]
 467e404: d101c3a1     	sub	x1, x29, #0x70
 467e408: d101e3a2     	sub	x2, x29, #0x78
 467e40c: aa1403e0     	mov	x0, x20
 467e410: 94000107     	bl	0x467e82c <_ChromeMain+0x4679590>
 467e414: 3945a408     	ldrb	w8, [x0, #0x169]
 467e418: 35001e68     	cbnz	w8, 0x467e7e4 <_ChromeMain+0x4679548>
 467e41c: aa0003e1     	mov	x1, x0
 467e420: 91000718     	add	x24, x24, #0x1
 467e424: f940cea2     	ldr	x2, [x21, #0x198]
 467e428: aa1503e0     	mov	x0, x21
 467e42c: 9703ebf4     	bl	0x7793fc <_ChromeMain+0x774160>
 467e430: 38da73a8     	ldursb	w8, [x29, #-0x59]
 467e434: 36f800a8     	tbz	w8, #0x1f, 0x467e448 <_ChromeMain+0x46791ac>
 467e438: f85903a0     	ldur	x0, [x29, #-0x70]
 467e43c: f85a03a8     	ldur	x8, [x29, #-0x60]
 467e440: d37ff901     	lsl	x1, x8, #1
 467e444: 96e62a9d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467e448: 91008339     	add	x25, x25, #0x20
 467e44c: f10082f7     	subs	x23, x23, #0x20
 467e450: 540001c0     	b.eq	0x467e488 <_ChromeMain+0x46791ec>
 467e454: aa1903e8     	mov	x8, x25
 467e458: 385e7509     	ldrb	w9, [x8], #-0x19
 467e45c: 34ffff69     	cbz	w9, 0x467e448 <_ChromeMain+0x46791ac>
 467e460: f100271f     	cmp	x24, #0x9
 467e464: 54000128     	b.hi	0x467e488 <_ChromeMain+0x46791ec>
 467e468: f941be75     	ldr	x21, [x19, #0x378]
 467e46c: 38dfe329     	ldursb	w9, [x25, #-0x2]
 467e470: 36fffb89     	tbz	w9, #0x1f, 0x467e3e0 <_ChromeMain+0x4679144>
 467e474: f85e7321     	ldur	x1, [x25, #-0x19]
 467e478: f85ef322     	ldur	x2, [x25, #-0x11]
 467e47c: d101c3a0     	sub	x0, x29, #0x70
 467e480: 96e721d4     	bl	0x46bd0 <_ChromeMain+0x41934>
 467e484: 17ffffdb     	b	0x467e3f0 <_ChromeMain+0x4679154>
 467e488: f941fa68     	ldr	x8, [x19, #0x3f0]
 467e48c: b40009a8     	cbz	x8, 0x467e5c0 <_ChromeMain+0x4679324>
 467e490: f941be74     	ldr	x20, [x19, #0x378]
 467e494: 52800128     	mov	w8, #0x9                ; =9
 467e498: 39029fe8     	strb	w8, [sp, #0xa7]
 467e49c: 910243e9     	add	x9, sp, #0x90
 467e4a0: 9100492a     	add	x10, x9, #0x12
 467e4a4: b004c848     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 467e4a8: 913b1108     	add	x8, x8, #0xec4
 467e4ac: eb08015f     	cmp	x10, x8
 467e4b0: fa488122     	ccmp	x9, x8, #0x2, hi
 467e4b4: 540019c9     	b.ls	0x467e7ec <_ChromeMain+0x4679550>
 467e4b8: 52800e69     	mov	w9, #0x73               ; =115
 467e4bc: b900a3e9     	str	w9, [sp, #0xa0]
 467e4c0: 3dc00100     	ldr	q0, [x8]
 467e4c4: 3d8002c0     	str	q0, [x22]
 467e4c8: 910243e0     	add	x0, sp, #0x90
 467e4cc: 9400012a     	bl	0x467e974 <_ChromeMain+0x46796d8>
 467e4d0: 3945a408     	ldrb	w8, [x0, #0x169]
 467e4d4: 35001a08     	cbnz	w8, 0x467e814 <_ChromeMain+0x4679578>
 467e4d8: aa0003e1     	mov	x1, x0
 467e4dc: f940ce82     	ldr	x2, [x20, #0x198]
 467e4e0: aa1403e0     	mov	x0, x20
 467e4e4: 9703ebc6     	bl	0x7793fc <_ChromeMain+0x774160>
 467e4e8: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 467e4ec: 36f800a8     	tbz	w8, #0x1f, 0x467e500 <_ChromeMain+0x4679264>
 467e4f0: f9404be0     	ldr	x0, [sp, #0x90]
 467e4f4: f94053e8     	ldr	x8, [sp, #0xa0]
 467e4f8: d37ff901     	lsl	x1, x8, #1
 467e4fc: 96e62a6f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467e500: f941fa68     	ldr	x8, [x19, #0x3f0]
 467e504: b40005e8     	cbz	x8, 0x467e5c0 <_ChromeMain+0x4679324>
 467e508: d2800016     	mov	x22, #0x0               ; =0
 467e50c: d2800017     	mov	x23, #0x0               ; =0
 467e510: 52801c38     	mov	w24, #0xe1              ; =225
 467e514: d0051ab4     	adrp	x20, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 467e518: 912bc294     	add	x20, x20, #0xaf0
 467e51c: 14000020     	b	0x467e59c <_ChromeMain+0x4679300>
 467e520: 3dc00100     	ldr	q0, [x8]
 467e524: f9400908     	ldr	x8, [x8, #0x10]
 467e528: f90043e8     	str	x8, [sp, #0x80]
 467e52c: 3d801fe0     	str	q0, [sp, #0x70]
 467e530: b9006bf8     	str	w24, [sp, #0x68]
 467e534: 3901b3ff     	strb	wzr, [sp, #0x6c]
 467e538: 9101c3e1     	add	x1, sp, #0x70
 467e53c: 9101a3e2     	add	x2, sp, #0x68
 467e540: aa1403e0     	mov	x0, x20
 467e544: 52800003     	mov	w3, #0x0                ; =0
 467e548: 940000b9     	bl	0x467e82c <_ChromeMain+0x4679590>
 467e54c: 3945a408     	ldrb	w8, [x0, #0x169]
 467e550: 35001508     	cbnz	w8, 0x467e7f0 <_ChromeMain+0x4679554>
 467e554: aa0003e1     	mov	x1, x0
 467e558: f940cea2     	ldr	x2, [x21, #0x198]
 467e55c: aa1503e0     	mov	x0, x21
 467e560: 9703eba7     	bl	0x7793fc <_ChromeMain+0x774160>
 467e564: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 467e568: 36f800a8     	tbz	w8, #0x1f, 0x467e57c <_ChromeMain+0x46792e0>
 467e56c: f9403be0     	ldr	x0, [sp, #0x70]
 467e570: f94043e8     	ldr	x8, [sp, #0x80]
 467e574: d37ff901     	lsl	x1, x8, #1
 467e578: 96e62a50     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467e57c: 910006e8     	add	x8, x23, #0x1
 467e580: f941fa69     	ldr	x9, [x19, #0x3f0]
 467e584: eb09011f     	cmp	x8, x9
 467e588: 540001c2     	b.hs	0x467e5c0 <_ChromeMain+0x4679324>
 467e58c: 910062d6     	add	x22, x22, #0x18
 467e590: f1000eff     	cmp	x23, #0x3
 467e594: aa0803f7     	mov	x23, x8
 467e598: 54000142     	b.hs	0x467e5c0 <_ChromeMain+0x4679324>
 467e59c: f941be75     	ldr	x21, [x19, #0x378]
 467e5a0: f941f668     	ldr	x8, [x19, #0x3e8]
 467e5a4: 8b160108     	add	x8, x8, x22
 467e5a8: 39c05d09     	ldrsb	w9, [x8, #0x17]
 467e5ac: 36fffba9     	tbz	w9, #0x1f, 0x467e520 <_ChromeMain+0x4679284>
 467e5b0: a9400901     	ldp	x1, x2, [x8]
 467e5b4: 9101c3e0     	add	x0, sp, #0x70
 467e5b8: 96e72186     	bl	0x46bd0 <_ChromeMain+0x41934>
 467e5bc: 17ffffdd     	b	0x467e530 <_ChromeMain+0x4679294>
 467e5c0: f941be74     	ldr	x20, [x19, #0x378]
 467e5c4: 52800088     	mov	w8, #0x4                ; =4
 467e5c8: 39019fe8     	strb	w8, [sp, #0x67]
 467e5cc: 910143e8     	add	x8, sp, #0x50
 467e5d0: 91002109     	add	x9, x8, #0x8
 467e5d4: b004c84a     	adrp	x10, 0xdf87000 <dyld_stub_binder+0xdf87000>
 467e5d8: 9129094a     	add	x10, x10, #0xa42
 467e5dc: eb0a013f     	cmp	x9, x10
 467e5e0: fa4a8102     	ccmp	x8, x10, #0x2, hi
 467e5e4: 54001049     	b.ls	0x467e7ec <_ChromeMain+0x4679550>
 467e5e8: d2800a88     	mov	x8, #0x54               ; =84
 467e5ec: f2a00c28     	movk	x8, #0x61, lsl #16
 467e5f0: f2c00c48     	movk	x8, #0x62, lsl #32
 467e5f4: f2e00e68     	movk	x8, #0x73, lsl #48
 467e5f8: f9002be8     	str	x8, [sp, #0x50]
 467e5fc: 7900b3ff     	strh	wzr, [sp, #0x58]
 467e600: 910143e0     	add	x0, sp, #0x50
 467e604: 940000dc     	bl	0x467e974 <_ChromeMain+0x46796d8>
 467e608: 3945a408     	ldrb	w8, [x0, #0x169]
 467e60c: 35000fe8     	cbnz	w8, 0x467e808 <_ChromeMain+0x467956c>
 467e610: aa0003e1     	mov	x1, x0
 467e614: f940ce82     	ldr	x2, [x20, #0x198]
 467e618: aa1403e0     	mov	x0, x20
 467e61c: 9703eb78     	bl	0x7793fc <_ChromeMain+0x774160>
 467e620: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 467e624: 36f800a8     	tbz	w8, #0x1f, 0x467e638 <_ChromeMain+0x467939c>
 467e628: f9402be0     	ldr	x0, [sp, #0x50]
 467e62c: f94033e8     	ldr	x8, [sp, #0x60]
 467e630: d37ff901     	lsl	x1, x8, #1
 467e634: 96e62a21     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467e638: f941ee68     	ldr	x8, [x19, #0x3d8]
 467e63c: d37be916     	lsl	x22, x8, #5
 467e640: b40006f6     	cbz	x22, 0x467e71c <_ChromeMain+0x4679480>
 467e644: d2800008     	mov	x8, #0x0                ; =0
 467e648: f941ea69     	ldr	x9, [x19, #0x3d0]
 467e64c: 91006537     	add	x23, x9, #0x19
 467e650: 52801c38     	mov	w24, #0xe1              ; =225
 467e654: 52801bb9     	mov	w25, #0xdd              ; =221
 467e658: f0051ab4     	adrp	x20, 0xe9d5000 <dyld_stub_binder+0xe9d5000>
 467e65c: 91046294     	add	x20, x20, #0x118
 467e660: 1400000b     	b	0x467e68c <_ChromeMain+0x46793f0>
 467e664: f85e72e1     	ldur	x1, [x23, #-0x19]
 467e668: f85ef2e2     	ldur	x2, [x23, #-0x11]
 467e66c: 9100c3e0     	add	x0, sp, #0x30
 467e670: 96e72158     	bl	0x46bd0 <_ChromeMain+0x41934>
 467e674: 14000013     	b	0x467e6c0 <_ChromeMain+0x4679424>
 467e678: aa0803fa     	mov	x26, x8
 467e67c: 910082f7     	add	x23, x23, #0x20
 467e680: aa1a03e8     	mov	x8, x26
 467e684: f10082d6     	subs	x22, x22, #0x20
 467e688: 54000480     	b.eq	0x467e718 <_ChromeMain+0x467947c>
 467e68c: aa1703e9     	mov	x9, x23
 467e690: 385e752a     	ldrb	w10, [x9], #-0x19
 467e694: 3707ff2a     	tbnz	w10, #0x0, 0x467e678 <_ChromeMain+0x46793dc>
 467e698: 9100051a     	add	x26, x8, #0x1
 467e69c: f100251f     	cmp	x8, #0x9
 467e6a0: 540003c8     	b.hi	0x467e718 <_ChromeMain+0x467947c>
 467e6a4: f941be75     	ldr	x21, [x19, #0x378]
 467e6a8: 38dfe2e8     	ldursb	w8, [x23, #-0x2]
 467e6ac: 37fffdc8     	tbnz	w8, #0x1f, 0x467e664 <_ChromeMain+0x46793c8>
 467e6b0: 3dc00120     	ldr	q0, [x9]
 467e6b4: f9400928     	ldr	x8, [x9, #0x10]
 467e6b8: f90023e8     	str	x8, [sp, #0x40]
 467e6bc: 3d800fe0     	str	q0, [sp, #0x30]
 467e6c0: 385ff2e3     	ldurb	w3, [x23, #-0x1]
 467e6c4: 7100007f     	cmp	w3, #0x0
 467e6c8: 1a981328     	csel	w8, w25, w24, ne
 467e6cc: b9002be8     	str	w8, [sp, #0x28]
 467e6d0: 3900b3ff     	strb	wzr, [sp, #0x2c]
 467e6d4: 9100c3e1     	add	x1, sp, #0x30
 467e6d8: 9100a3e2     	add	x2, sp, #0x28
 467e6dc: aa1403e0     	mov	x0, x20
 467e6e0: 94000053     	bl	0x467e82c <_ChromeMain+0x4679590>
 467e6e4: 3945a408     	ldrb	w8, [x0, #0x169]
 467e6e8: 350008a8     	cbnz	w8, 0x467e7fc <_ChromeMain+0x4679560>
 467e6ec: aa0003e1     	mov	x1, x0
 467e6f0: f940cea2     	ldr	x2, [x21, #0x198]
 467e6f4: aa1503e0     	mov	x0, x21
 467e6f8: 9703eb41     	bl	0x7793fc <_ChromeMain+0x774160>
 467e6fc: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 467e700: 36fffbe8     	tbz	w8, #0x1f, 0x467e67c <_ChromeMain+0x46793e0>
 467e704: f9401be0     	ldr	x0, [sp, #0x30]
 467e708: f94023e8     	ldr	x8, [sp, #0x40]
 467e70c: d37ff901     	lsl	x1, x8, #1
 467e710: 96e629ea     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467e714: 17ffffda     	b	0x467e67c <_ChromeMain+0x46793e0>
 467e718: b50004ba     	cbnz	x26, 0x467e7ac <_ChromeMain+0x4679510>
 467e71c: f941be74     	ldr	x20, [x19, #0x378]
 467e720: 528000e8     	mov	w8, #0x7                ; =7
 467e724: 39009fe8     	strb	w8, [sp, #0x27]
 467e728: 910043e9     	add	x9, sp, #0x10
 467e72c: 9100392a     	add	x10, x9, #0xe
 467e730: d004c848     	adrp	x8, 0xdf88000 <dyld_stub_binder+0xdf88000>
 467e734: 91004908     	add	x8, x8, #0x12
 467e738: eb08015f     	cmp	x10, x8
 467e73c: fa488122     	ccmp	x9, x8, #0x2, hi
 467e740: 54000569     	b.ls	0x467e7ec <_ChromeMain+0x4679550>
 467e744: f9400109     	ldr	x9, [x8]
 467e748: f9000be9     	str	x9, [sp, #0x10]
 467e74c: f8406108     	ldur	x8, [x8, #0x6]
 467e750: f80163e8     	stur	x8, [sp, #0x16]
 467e754: 79003fff     	strh	wzr, [sp, #0x1e]
 467e758: 52801ba8     	mov	w8, #0xdd               ; =221
 467e75c: b9000be8     	str	w8, [sp, #0x8]
 467e760: 390033ff     	strb	wzr, [sp, #0xc]
 467e764: f0051aa0     	adrp	x0, 0xe9d5000 <dyld_stub_binder+0xe9d5000>
 467e768: 91046000     	add	x0, x0, #0x118
 467e76c: 910043e1     	add	x1, sp, #0x10
 467e770: 910023e2     	add	x2, sp, #0x8
 467e774: 52800023     	mov	w3, #0x1                ; =1
 467e778: 9400002d     	bl	0x467e82c <_ChromeMain+0x4679590>
 467e77c: 3945a408     	ldrb	w8, [x0, #0x169]
 467e780: 35000508     	cbnz	w8, 0x467e820 <_ChromeMain+0x4679584>
 467e784: aa0003e1     	mov	x1, x0
 467e788: f940ce82     	ldr	x2, [x20, #0x198]
 467e78c: aa1403e0     	mov	x0, x20
 467e790: 9703eb1b     	bl	0x7793fc <_ChromeMain+0x774160>
 467e794: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 467e798: 36f800a8     	tbz	w8, #0x1f, 0x467e7ac <_ChromeMain+0x4679510>
 467e79c: f9400be0     	ldr	x0, [sp, #0x10]
 467e7a0: f94013e8     	ldr	x8, [sp, #0x20]
 467e7a4: d37ff901     	lsl	x1, x8, #1
 467e7a8: 96e629c4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467e7ac: f941be60     	ldr	x0, [x19, #0x378]
 467e7b0: 52800001     	mov	w1, #0x0                ; =0
 467e7b4: 96fec730     	bl	0x630474 <_ChromeMain+0x62b1d8>
 467e7b8: f941ba60     	ldr	x0, [x19, #0x370]
 467e7bc: 52800001     	mov	w1, #0x0                ; =0
 467e7c0: 96fec72d     	bl	0x630474 <_ChromeMain+0x62b1d8>
 467e7c4: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 467e7c8: a9514ff4     	ldp	x20, x19, [sp, #0x110]
 467e7cc: a95057f6     	ldp	x22, x21, [sp, #0x100]
 467e7d0: a94f5ff8     	ldp	x24, x23, [sp, #0xf0]
 467e7d4: a94e67fa     	ldp	x26, x25, [sp, #0xe0]
 467e7d8: a94d6ffc     	ldp	x28, x27, [sp, #0xd0]
 467e7dc: 9104c3ff     	add	sp, sp, #0x130
 467e7e0: d65f03c0     	ret
 467e7e4: d4200000     	brk	#0
 467e7e8: d4400000     	hlt	#0
 467e7ec: d4200020     	brk	#0x1
 467e7f0: d4200000     	brk	#0
 467e7f4: d4400000     	hlt	#0
 467e7f8: d4200020     	brk	#0x1
 467e7fc: d4200000     	brk	#0
 467e800: d4400000     	hlt	#0
 467e804: d4200020     	brk	#0x1
 467e808: d4200000     	brk	#0
 467e80c: d4400000     	hlt	#0
 467e810: d4200020     	brk	#0x1
 467e814: d4200000     	brk	#0
 467e818: d4400000     	hlt	#0
 467e81c: d4200020     	brk	#0x1
 467e820: d4200000     	brk	#0
 467e824: d4400000     	hlt	#0
 467e828: d4200020     	brk	#0x1
 467e82c: d10203ff     	sub	sp, sp, #0x80
 467e830: a9045ff8     	stp	x24, x23, [sp, #0x40]
 467e834: a90557f6     	stp	x22, x21, [sp, #0x50]
 467e838: a9064ff4     	stp	x20, x19, [sp, #0x60]
 467e83c: a9077bfd     	stp	x29, x30, [sp, #0x70]
 467e840: 9101c3fd     	add	x29, sp, #0x70
 467e844: aa0303f3     	mov	x19, x3
 467e848: aa0203f7     	mov	x23, x2
 467e84c: aa0103f8     	mov	x24, x1
 467e850: aa0003f5     	mov	x21, x0
 467e854: f100001f     	cmp	x0, #0x0
 467e858: 52800208     	mov	w8, #0x10               ; =16
 467e85c: 1a8803f6     	csel	w22, wzr, w8, eq
 467e860: 90054468     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 467e864: 91120108     	add	x8, x8, #0x480
 467e868: f8bfc100     	ldapr	x0, [x8]
 467e86c: b4000800     	cbz	x0, 0x467e96c <_ChromeMain+0x46796d0>
 467e870: 5280af01     	mov	w1, #0x578              ; =1400
 467e874: d2800002     	mov	x2, #0x0                ; =0
 467e878: 96e8b34e     	bl	0xab5b0 <_ChromeMain+0xa6314>
 467e87c: aa0003f4     	mov	x20, x0
 467e880: 3dc00300     	ldr	q0, [x24]
 467e884: 3d800be0     	str	q0, [sp, #0x20]
 467e888: f9400b08     	ldr	x8, [x24, #0x10]
 467e88c: f9001be8     	str	x8, [sp, #0x30]
 467e890: a900ff1f     	stp	xzr, xzr, [x24, #0x8]
 467e894: f900031f     	str	xzr, [x24]
 467e898: f94002e8     	ldr	x8, [x23]
 467e89c: a90123ff     	stp	xzr, x8, [sp, #0x10]
 467e8a0: a9007fff     	stp	xzr, xzr, [sp]
 467e8a4: 910083e2     	add	x2, sp, #0x20
 467e8a8: 910063e5     	add	x5, sp, #0x18
 467e8ac: 910003e7     	mov	x7, sp
 467e8b0: aa1503e1     	mov	x1, x21
 467e8b4: aa1603e3     	mov	x3, x22
 467e8b8: 528000e4     	mov	w4, #0x7                ; =7
 467e8bc: d2800446     	mov	x6, #0x22               ; =34
 467e8c0: f2c00026     	movk	x6, #0x1, lsl #32
 467e8c4: 9400006e     	bl	0x467ea7c <_ChromeMain+0x46797e0>
 467e8c8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 467e8cc: 36f800a8     	tbz	w8, #0x1f, 0x467e8e0 <_ChromeMain+0x4679644>
 467e8d0: f94003e0     	ldr	x0, [sp]
 467e8d4: f9400be8     	ldr	x8, [sp, #0x10]
 467e8d8: d37ff901     	lsl	x1, x8, #1
 467e8dc: 96e62977     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467e8e0: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 467e8e4: 36f800a8     	tbz	w8, #0x1f, 0x467e8f8 <_ChromeMain+0x467965c>
 467e8e8: f94013e0     	ldr	x0, [sp, #0x20]
 467e8ec: f9401be8     	ldr	x8, [sp, #0x30]
 467e8f0: d37ff901     	lsl	x1, x8, #1
 467e8f4: 96e62971     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467e8f8: 3946a688     	ldrb	w8, [x20, #0x1a9]
 467e8fc: 340000a8     	cbz	w8, 0x467e910 <_ChromeMain+0x4679674>
 467e900: 3906a69f     	strb	wzr, [x20, #0x1a9]
 467e904: 9103e280     	add	x0, x20, #0xf8
 467e908: 9106a681     	add	x1, x20, #0x1a9
 467e90c: 9722a5b1     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 467e910: 39544688     	ldrb	w8, [x20, #0x511]
 467e914: 6b13011f     	cmp	w8, w19
 467e918: 540000c0     	b.eq	0x467e930 <_ChromeMain+0x4679694>
 467e91c: 39144693     	strb	w19, [x20, #0x511]
 467e920: aa1403e0     	mov	x0, x20
 467e924: 940004a7     	bl	0x467fbc0 <_ChromeMain+0x467a924>
 467e928: aa1403e0     	mov	x0, x20
 467e92c: 96fc8a14     	bl	0x5a117c <_ChromeMain+0x59bee0>
 467e930: d2c00108     	mov	x8, #0x800000000        ; =34359738368
 467e934: 4e080d00     	dup.2d	v0, x8
 467e938: 3d800be0     	str	q0, [sp, #0x20]
 467e93c: f0051c21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 467e940: 91122021     	add	x1, x1, #0x488
 467e944: 91036280     	add	x0, x20, #0xd8
 467e948: 910083e2     	add	x2, sp, #0x20
 467e94c: 9751bd45     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 467e950: aa1403e0     	mov	x0, x20
 467e954: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 467e958: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 467e95c: a94557f6     	ldp	x22, x21, [sp, #0x50]
 467e960: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 467e964: 910203ff     	add	sp, sp, #0x80
 467e968: d65f03c0     	ret
 467e96c: 97f15363     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 467e970: 17ffffc0     	b	0x467e870 <_ChromeMain+0x46795d4>
 467e974: d10183ff     	sub	sp, sp, #0x60
 467e978: a9044ff4     	stp	x20, x19, [sp, #0x40]
 467e97c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 467e980: 910143fd     	add	x29, sp, #0x50
 467e984: aa0003f4     	mov	x20, x0
 467e988: 90054468     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 467e98c: 91120108     	add	x8, x8, #0x480
 467e990: f8bfc100     	ldapr	x0, [x8]
 467e994: b4000700     	cbz	x0, 0x467ea74 <_ChromeMain+0x46797d8>
 467e998: 5280af01     	mov	w1, #0x578              ; =1400
 467e99c: d2800002     	mov	x2, #0x0                ; =0
 467e9a0: 96e8b304     	bl	0xab5b0 <_ChromeMain+0xa6314>
 467e9a4: aa0003f3     	mov	x19, x0
 467e9a8: 3dc00280     	ldr	q0, [x20]
 467e9ac: 3d800be0     	str	q0, [sp, #0x20]
 467e9b0: f9400a88     	ldr	x8, [x20, #0x10]
 467e9b4: f9001be8     	str	x8, [sp, #0x30]
 467e9b8: a9007e9f     	stp	xzr, xzr, [x20]
 467e9bc: f9000a9f     	str	xzr, [x20, #0x10]
 467e9c0: 52801c48     	mov	w8, #0xe2               ; =226
 467e9c4: b9001be8     	str	w8, [sp, #0x18]
 467e9c8: 390073ff     	strb	wzr, [sp, #0x1c]
 467e9cc: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 467e9d0: f90003ff     	str	xzr, [sp]
 467e9d4: 910083e2     	add	x2, sp, #0x20
 467e9d8: 910063e5     	add	x5, sp, #0x18
 467e9dc: 910003e7     	mov	x7, sp
 467e9e0: d2800001     	mov	x1, #0x0                ; =0
 467e9e4: 52800003     	mov	w3, #0x0                ; =0
 467e9e8: 52800104     	mov	w4, #0x8                ; =8
 467e9ec: d2800386     	mov	x6, #0x1c               ; =28
 467e9f0: f2c00026     	movk	x6, #0x1, lsl #32
 467e9f4: 94000022     	bl	0x467ea7c <_ChromeMain+0x46797e0>
 467e9f8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 467e9fc: 36f800a8     	tbz	w8, #0x1f, 0x467ea10 <_ChromeMain+0x4679774>
 467ea00: f94003e0     	ldr	x0, [sp]
 467ea04: f9400be8     	ldr	x8, [sp, #0x10]
 467ea08: d37ff901     	lsl	x1, x8, #1
 467ea0c: 96e6292b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467ea10: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 467ea14: 36f800a8     	tbz	w8, #0x1f, 0x467ea28 <_ChromeMain+0x467978c>
 467ea18: f94013e0     	ldr	x0, [sp, #0x20]
 467ea1c: f9401be8     	ldr	x8, [sp, #0x30]
 467ea20: d37ff901     	lsl	x1, x8, #1
 467ea24: 96e62925     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467ea28: 3946a668     	ldrb	w8, [x19, #0x1a9]
 467ea2c: 340000a8     	cbz	w8, 0x467ea40 <_ChromeMain+0x46797a4>
 467ea30: 3906a67f     	strb	wzr, [x19, #0x1a9]
 467ea34: 9103e260     	add	x0, x19, #0xf8
 467ea38: 9106a661     	add	x1, x19, #0x1a9
 467ea3c: 9722a565     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 467ea40: d2c00108     	mov	x8, #0x800000000        ; =34359738368
 467ea44: 4e080d00     	dup.2d	v0, x8
 467ea48: 3d800be0     	str	q0, [sp, #0x20]
 467ea4c: f0051c21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 467ea50: 91122021     	add	x1, x1, #0x488
 467ea54: 91036260     	add	x0, x19, #0xd8
 467ea58: 910083e2     	add	x2, sp, #0x20
 467ea5c: 9751bd01     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 467ea60: aa1303e0     	mov	x0, x19
 467ea64: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 467ea68: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 467ea6c: 910183ff     	add	sp, sp, #0x60
 467ea70: d65f03c0     	ret
 467ea74: 97f15321     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 467ea78: 17ffffc8     	b	0x467e998 <_ChromeMain+0x46796fc>
