
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 a08163c: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 a081640: a9015ff8     	stp	x24, x23, [sp, #0x10]
 a081644: a90257f6     	stp	x22, x21, [sp, #0x20]
 a081648: a9034ff4     	stp	x20, x19, [sp, #0x30]
 a08164c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 a081650: 910103fd     	add	x29, sp, #0x40
 a081654: aa0203f3     	mov	x19, x2
 a081658: aa0103f5     	mov	x21, x1
 a08165c: aa0003f4     	mov	x20, x0
 a081660: b9401017     	ldr	w23, [x0, #0x10]
 a081664: 36100177     	tbz	w23, #0x2, 0xa081690 <_ChromeMain+0xa07c3f4>
 a081668: f9402688     	ldr	x8, [x20, #0x48]
 a08166c: 927ef502     	and	x2, x8, #0xfffffffffffffffc
 a081670: 39805c43     	ldrsb	x3, [x2, #0x17]
 a081674: b6f80043     	tbz	x3, #0x3f, 0xa08167c <_ChromeMain+0xa07c3e0>
 a081678: a9400c42     	ldp	x2, x3, [x2]
 a08167c: aa1303e0     	mov	x0, x19
 a081680: 52800021     	mov	w1, #0x1                ; =1
 a081684: aa1503e4     	mov	x4, x21
 a081688: 963d2dc0     	bl	0x2fccd88 <_ChromeMain+0x2fc7aec>
 a08168c: aa0003f5     	mov	x21, x0
 a081690: 36500197     	tbz	w23, #0xa, 0xa0816c0 <_ChromeMain+0xa07c424>
 a081694: f9400268     	ldr	x8, [x19]
 a081698: eb0802bf     	cmp	x21, x8
 a08169c: 54001ea2     	b.hs	0xa081a70 <_ChromeMain+0xa07c7d4>
 a0816a0: b9808a89     	ldrsw	x9, [x20, #0x88]
 a0816a4: 5280020a     	mov	w10, #0x10              ; =16
 a0816a8: aa1503e8     	mov	x8, x21
 a0816ac: 3800150a     	strb	w10, [x8], #0x1
 a0816b0: 7102013f     	cmp	w9, #0x80
 a0816b4: 54001c22     	b.hs	0xa081a38 <_ChromeMain+0xa07c79c>
 a0816b8: 91000ab5     	add	x21, x21, #0x2
 a0816bc: 39000109     	strb	w9, [x8]
 a0816c0: 36180177     	tbz	w23, #0x3, 0xa0816ec <_ChromeMain+0xa07c450>
 a0816c4: f9402a88     	ldr	x8, [x20, #0x50]
 a0816c8: 927ef502     	and	x2, x8, #0xfffffffffffffffc
 a0816cc: 39805c43     	ldrsb	x3, [x2, #0x17]
 a0816d0: b6f80043     	tbz	x3, #0x3f, 0xa0816d8 <_ChromeMain+0xa07c43c>
 a0816d4: a9400c42     	ldp	x2, x3, [x2]
 a0816d8: aa1303e0     	mov	x0, x19
 a0816dc: 52800061     	mov	w1, #0x3                ; =3
 a0816e0: aa1503e4     	mov	x4, x21
 a0816e4: 963d2da9     	bl	0x2fccd88 <_ChromeMain+0x2fc7aec>
 a0816e8: aa0003f5     	mov	x21, x0
 a0816ec: 36200177     	tbz	w23, #0x4, 0xa081718 <_ChromeMain+0xa07c47c>
 a0816f0: f9402e88     	ldr	x8, [x20, #0x58]
 a0816f4: 927ef502     	and	x2, x8, #0xfffffffffffffffc
 a0816f8: 39805c43     	ldrsb	x3, [x2, #0x17]
 a0816fc: b6f80043     	tbz	x3, #0x3f, 0xa081704 <_ChromeMain+0xa07c468>
 a081700: a9400c42     	ldp	x2, x3, [x2]
 a081704: aa1303e0     	mov	x0, x19
 a081708: 52800081     	mov	w1, #0x4                ; =4
 a08170c: aa1503e4     	mov	x4, x21
 a081710: 963d2d9e     	bl	0x2fccd88 <_ChromeMain+0x2fc7aec>
 a081714: aa0003f5     	mov	x21, x0
 a081718: 36280177     	tbz	w23, #0x5, 0xa081744 <_ChromeMain+0xa07c4a8>
 a08171c: f9403288     	ldr	x8, [x20, #0x60]
 a081720: 927ef502     	and	x2, x8, #0xfffffffffffffffc
 a081724: 39805c43     	ldrsb	x3, [x2, #0x17]
 a081728: b6f80043     	tbz	x3, #0x3f, 0xa081730 <_ChromeMain+0xa07c494>
 a08172c: a9400c42     	ldp	x2, x3, [x2]
 a081730: aa1303e0     	mov	x0, x19
 a081734: 528000a1     	mov	w1, #0x5                ; =5
 a081738: aa1503e4     	mov	x4, x21
 a08173c: 963d2d93     	bl	0x2fccd88 <_ChromeMain+0x2fc7aec>
 a081740: aa0003f5     	mov	x21, x0
 a081744: 36300177     	tbz	w23, #0x6, 0xa081770 <_ChromeMain+0xa07c4d4>
 a081748: f9403688     	ldr	x8, [x20, #0x68]
 a08174c: 927ef502     	and	x2, x8, #0xfffffffffffffffc
 a081750: 39805c43     	ldrsb	x3, [x2, #0x17]
 a081754: b6f80043     	tbz	x3, #0x3f, 0xa08175c <_ChromeMain+0xa07c4c0>
 a081758: a9400c42     	ldp	x2, x3, [x2]
 a08175c: aa1303e0     	mov	x0, x19
 a081760: 528000c1     	mov	w1, #0x6                ; =6
 a081764: aa1503e4     	mov	x4, x21
 a081768: 963d2d88     	bl	0x2fccd88 <_ChromeMain+0x2fc7aec>
 a08176c: aa0003f5     	mov	x21, x0
 a081770: 36580137     	tbz	w23, #0xb, 0xa081794 <_ChromeMain+0xa07c4f8>
 a081774: f9400268     	ldr	x8, [x19]
 a081778: eb0802bf     	cmp	x21, x8
 a08177c: 54001842     	b.hs	0xa081a84 <_ChromeMain+0xa07c7e8>
 a081780: 39423288     	ldrb	w8, [x20, #0x8c]
 a081784: 52800709     	mov	w9, #0x38               ; =56
 a081788: 390002a9     	strb	w9, [x21]
 a08178c: 390006a8     	strb	w8, [x21, #0x1]
 a081790: 91000ab5     	add	x21, x21, #0x2
 a081794: 36380177     	tbz	w23, #0x7, 0xa0817c0 <_ChromeMain+0xa07c524>
 a081798: f9403a88     	ldr	x8, [x20, #0x70]
 a08179c: 927ef502     	and	x2, x8, #0xfffffffffffffffc
 a0817a0: 39805c43     	ldrsb	x3, [x2, #0x17]
 a0817a4: b6f80043     	tbz	x3, #0x3f, 0xa0817ac <_ChromeMain+0xa07c510>
 a0817a8: a9400c42     	ldp	x2, x3, [x2]
 a0817ac: aa1303e0     	mov	x0, x19
 a0817b0: 52800101     	mov	w1, #0x8                ; =8
 a0817b4: aa1503e4     	mov	x4, x21
 a0817b8: 963d2d74     	bl	0x2fccd88 <_ChromeMain+0x2fc7aec>
 a0817bc: aa0003f5     	mov	x21, x0
 a0817c0: 36000457     	tbz	w23, #0x0, 0xa081848 <_ChromeMain+0xa07c5ac>
 a0817c4: b9402a96     	ldr	w22, [x20, #0x28]
 a0817c8: 710006df     	cmp	w22, #0x1
 a0817cc: 540003eb     	b.lt	0xa081848 <_ChromeMain+0xa07c5ac>
 a0817d0: f9400268     	ldr	x8, [x19]
 a0817d4: eb0802bf     	cmp	x21, x8
 a0817d8: 540018c2     	b.hs	0xa081af0 <_ChromeMain+0xa07c854>
 a0817dc: 52800949     	mov	w9, #0x4a               ; =74
 a0817e0: aa1503e8     	mov	x8, x21
 a0817e4: 38001509     	strb	w9, [x8], #0x1
 a0817e8: 710202df     	cmp	w22, #0x80
 a0817ec: 54001742     	b.hs	0xa081ad4 <_ChromeMain+0xa07c838>
 a0817f0: 91000ab5     	add	x21, x21, #0x2
 a0817f4: 39000116     	strb	w22, [x8]
 a0817f8: f9400e88     	ldr	x8, [x20, #0x18]
 a0817fc: 91008289     	add	x9, x20, #0x20
 a081800: 927df10a     	and	x10, x8, #0xfffffffffffffff8
 a081804: f27e011f     	tst	x8, #0x4
 a081808: 9a8a0136     	csel	x22, x9, x10, eq
 a08180c: 36100068     	tbz	w8, #0x2, 0xa081818 <_ChromeMain+0xa07c57c>
 a081810: b9400128     	ldr	w8, [x9]
 a081814: 14000002     	b	0xa08181c <_ChromeMain+0xa07c580>
 a081818: 12000508     	and	w8, w8, #0x3
 a08181c: 8b28cad8     	add	x24, x22, w8, sxtw #2
 a081820: f9400268     	ldr	x8, [x19]
 a081824: eb0802bf     	cmp	x21, x8
 a081828: 54000ce2     	b.hs	0xa0819c4 <_ChromeMain+0xa07c728>
 a08182c: b88046c8     	ldrsw	x8, [x22], #0x4
 a081830: 7102011f     	cmp	w8, #0x80
 a081834: 54000d22     	b.hs	0xa0819d8 <_ChromeMain+0xa07c73c>
 a081838: aa0803e9     	mov	x9, x8
 a08183c: 380016a9     	strb	w9, [x21], #0x1
 a081840: eb1802df     	cmp	x22, x24
 a081844: 54fffee3     	b.lo	0xa081820 <_ChromeMain+0xa07c584>
 a081848: 36080317     	tbz	w23, #0x1, 0xa0818a8 <_ChromeMain+0xa07c60c>
 a08184c: b9403a98     	ldr	w24, [x20, #0x38]
 a081850: 340002d8     	cbz	w24, 0xa0818a8 <_ChromeMain+0xa07c60c>
 a081854: 52800016     	mov	w22, #0x0               ; =0
 a081858: 9100c299     	add	x25, x20, #0x30
 a08185c: b9403a81     	ldr	w1, [x20, #0x38]
 a081860: 37f80ad6     	tbnz	w22, #0x1f, 0xa0819b8 <_ChromeMain+0xa07c71c>
 a081864: 6b0102df     	cmp	w22, w1
 a081868: 54000a8a     	b.ge	0xa0819b8 <_ChromeMain+0xa07c71c>
 a08186c: f9400328     	ldr	x8, [x25]
 a081870: 8b36cd09     	add	x9, x8, w22, sxtw #3
 a081874: 91001d29     	add	x9, x9, #0x7
 a081878: f240011f     	tst	x8, #0x1
 a08187c: 9a890328     	csel	x8, x25, x9, eq
 a081880: f9400101     	ldr	x1, [x8]
 a081884: b9401422     	ldr	w2, [x1, #0x14]
 a081888: 52800140     	mov	w0, #0xa                ; =10
 a08188c: aa1503e3     	mov	x3, x21
 a081890: aa1303e4     	mov	x4, x19
 a081894: 94ac082e     	bl	0xcb8394c <_ChromeMain+0xcb7e6b0>
 a081898: aa0003f5     	mov	x21, x0
 a08189c: 110006d6     	add	w22, w22, #0x1
 a0818a0: 6b16031f     	cmp	w24, w22
 a0818a4: 54fffdc1     	b.ne	0xa08185c <_ChromeMain+0xa07c5c0>
 a0818a8: 36600137     	tbz	w23, #0xc, 0xa0818cc <_ChromeMain+0xa07c630>
 a0818ac: f9400268     	ldr	x8, [x19]
 a0818b0: eb0802bf     	cmp	x21, x8
 a0818b4: 54000fc2     	b.hs	0xa081aac <_ChromeMain+0xa07c810>
 a0818b8: 39423688     	ldrb	w8, [x20, #0x8d]
 a0818bc: 52800b09     	mov	w9, #0x58               ; =88
 a0818c0: 390002a9     	strb	w9, [x21]
 a0818c4: 390006a8     	strb	w8, [x21, #0x1]
 a0818c8: 91000ab5     	add	x21, x21, #0x2
 a0818cc: 367000d7     	tbz	w23, #0xe, 0xa0818e4 <_ChromeMain+0xa07c648>
 a0818d0: f9404a81     	ldr	x1, [x20, #0x90]
 a0818d4: aa1303e0     	mov	x0, x19
 a0818d8: aa1503e2     	mov	x2, x21
 a0818dc: 96443fe0     	bl	0x319185c <_ChromeMain+0x318c5c0>
 a0818e0: aa0003f5     	mov	x21, x0
 a0818e4: 36680137     	tbz	w23, #0xd, 0xa081908 <_ChromeMain+0xa07c66c>
 a0818e8: f9400268     	ldr	x8, [x19]
 a0818ec: eb0802bf     	cmp	x21, x8
 a0818f0: 54000e82     	b.hs	0xa081ac0 <_ChromeMain+0xa07c824>
 a0818f4: 39423a88     	ldrb	w8, [x20, #0x8e]
 a0818f8: 52800d09     	mov	w9, #0x68               ; =104
 a0818fc: 390002a9     	strb	w9, [x21]
 a081900: 390006a8     	strb	w8, [x21, #0x1]
 a081904: 91000ab5     	add	x21, x21, #0x2
 a081908: 36400177     	tbz	w23, #0x8, 0xa081934 <_ChromeMain+0xa07c698>
 a08190c: f9403e88     	ldr	x8, [x20, #0x78]
 a081910: 927ef502     	and	x2, x8, #0xfffffffffffffffc
 a081914: 39805c43     	ldrsb	x3, [x2, #0x17]
 a081918: b6f80043     	tbz	x3, #0x3f, 0xa081920 <_ChromeMain+0xa07c684>
 a08191c: a9400c42     	ldp	x2, x3, [x2]
 a081920: aa1303e0     	mov	x0, x19
 a081924: 528001c1     	mov	w1, #0xe                ; =14
 a081928: aa1503e4     	mov	x4, x21
 a08192c: 963d2d17     	bl	0x2fccd88 <_ChromeMain+0x2fc7aec>
 a081930: aa0003f5     	mov	x21, x0
 a081934: 36480177     	tbz	w23, #0x9, 0xa081960 <_ChromeMain+0xa07c6c4>
 a081938: f9404288     	ldr	x8, [x20, #0x80]
 a08193c: 927ef502     	and	x2, x8, #0xfffffffffffffffc
 a081940: 39805c43     	ldrsb	x3, [x2, #0x17]
 a081944: b6f80043     	tbz	x3, #0x3f, 0xa08194c <_ChromeMain+0xa07c6b0>
 a081948: a9400c42     	ldp	x2, x3, [x2]
 a08194c: aa1303e0     	mov	x0, x19
 a081950: 528001e1     	mov	w1, #0xf                ; =15
 a081954: aa1503e4     	mov	x4, x21
 a081958: 963d2d0c     	bl	0x2fccd88 <_ChromeMain+0x2fc7aec>
 a08195c: aa0003f5     	mov	x21, x0
 a081960: 367801b7     	tbz	w23, #0xf, 0xa081994 <_ChromeMain+0xa07c6f8>
 a081964: f9400268     	ldr	x8, [x19]
 a081968: eb0802bf     	cmp	x21, x8
 a08196c: 54000962     	b.hs	0xa081a98 <_ChromeMain+0xa07c7fc>
 a081970: f9404e89     	ldr	x9, [x20, #0x98]
 a081974: 5280300a     	mov	w10, #0x180             ; =384
 a081978: aa1503e8     	mov	x8, x21
 a08197c: 7800250a     	strh	w10, [x8], #0x2
 a081980: f102013f     	cmp	x9, #0x80
 a081984: 54000682     	b.hs	0xa081a54 <_ChromeMain+0xa07c7b8>
 a081988: 910006aa     	add	x10, x21, #0x1
 a08198c: 91000955     	add	x21, x10, #0x2
 a081990: 39000109     	strb	w9, [x8]
 a081994: f9400688     	ldr	x8, [x20, #0x8]
 a081998: 37000348     	tbnz	w8, #0x0, 0xa081a00 <_ChromeMain+0xa07c764>
 a08199c: aa1503e0     	mov	x0, x21
 a0819a0: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 a0819a4: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 a0819a8: a94257f6     	ldp	x22, x21, [sp, #0x20]
 a0819ac: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 a0819b0: a8c567fa     	ldp	x26, x25, [sp], #0x50
 a0819b4: d65f03c0     	ret
 a0819b8: aa1603e0     	mov	x0, x22
 a0819bc: 97a224ce     	bl	0x890acf4 <_ChromeMain+0x8905a58>
 a0819c0: 17ffffab     	b	0xa08186c <_ChromeMain+0xa07c5d0>
 a0819c4: aa1303e0     	mov	x0, x19
 a0819c8: aa1503e1     	mov	x1, x21
 a0819cc: 97a20de7     	bl	0x8905168 <_ChromeMain+0x88ffecc>
 a0819d0: aa0003f5     	mov	x21, x0
 a0819d4: 17ffff96     	b	0xa08182c <_ChromeMain+0xa07c590>
 a0819d8: 32190109     	orr	w9, w8, #0x80
 a0819dc: 380016a9     	strb	w9, [x21], #0x1
 a0819e0: d347fd09     	lsr	x9, x8, #7
 a0819e4: d34efd0a     	lsr	x10, x8, #14
 a0819e8: aa0903e8     	mov	x8, x9
 a0819ec: b5ffff6a     	cbnz	x10, 0xa0819d8 <_ChromeMain+0xa07c73c>
 a0819f0: 17ffff93     	b	0xa08183c <_ChromeMain+0xa07c5a0>
 a0819f4: f9400501     	ldr	x1, [x8, #0x8]
 a0819f8: b9401102     	ldr	w2, [x8, #0x10]
 a0819fc: 14000005     	b	0xa081a10 <_ChromeMain+0xa07c774>
 a081a00: 927ff908     	and	x8, x8, #0xfffffffffffffffe
 a081a04: 39807d02     	ldrsb	x2, [x8, #0x1f]
 a081a08: b7ffff62     	tbnz	x2, #0x3f, 0xa0819f4 <_ChromeMain+0xa07c758>
 a081a0c: 91002101     	add	x1, x8, #0x8
 a081a10: f9400268     	ldr	x8, [x19]
 a081a14: cb150108     	sub	x8, x8, x21
 a081a18: eb22c11f     	cmp	x8, w2, sxtw
 a081a1c: 5400074b     	b.lt	0xa081b04 <_ChromeMain+0xa07c868>
 a081a20: 93407c53     	sxtw	x19, w2
 a081a24: 2a0203e2     	mov	w2, w2
 a081a28: aa1503e0     	mov	x0, x21
 a081a2c: 94accf3c     	bl	0xcbb571c <dyld_stub_binder+0xcbb571c>
 a081a30: 8b1302b5     	add	x21, x21, x19
 a081a34: 17ffffda     	b	0xa08199c <_ChromeMain+0xa07c700>
 a081a38: 3219012a     	orr	w10, w9, #0x80
 a081a3c: 3800150a     	strb	w10, [x8], #0x1
 a081a40: d34efd2a     	lsr	x10, x9, #14
 a081a44: d347fd29     	lsr	x9, x9, #7
 a081a48: b5ffff8a     	cbnz	x10, 0xa081a38 <_ChromeMain+0xa07c79c>
 a081a4c: d1000515     	sub	x21, x8, #0x1
 a081a50: 17ffff1a     	b	0xa0816b8 <_ChromeMain+0xa07c41c>
 a081a54: 3219012a     	orr	w10, w9, #0x80
 a081a58: 3800150a     	strb	w10, [x8], #0x1
 a081a5c: d34efd2a     	lsr	x10, x9, #14
 a081a60: d347fd29     	lsr	x9, x9, #7
 a081a64: b5ffff8a     	cbnz	x10, 0xa081a54 <_ChromeMain+0xa07c7b8>
 a081a68: d100050a     	sub	x10, x8, #0x1
 a081a6c: 17ffffc8     	b	0xa08198c <_ChromeMain+0xa07c6f0>
 a081a70: aa1303e0     	mov	x0, x19
 a081a74: aa1503e1     	mov	x1, x21
 a081a78: 97a20dbc     	bl	0x8905168 <_ChromeMain+0x88ffecc>
 a081a7c: aa0003f5     	mov	x21, x0
 a081a80: 17ffff08     	b	0xa0816a0 <_ChromeMain+0xa07c404>
 a081a84: aa1303e0     	mov	x0, x19
 a081a88: aa1503e1     	mov	x1, x21
 a081a8c: 97a20db7     	bl	0x8905168 <_ChromeMain+0x88ffecc>
 a081a90: aa0003f5     	mov	x21, x0
 a081a94: 17ffff3b     	b	0xa081780 <_ChromeMain+0xa07c4e4>
 a081a98: aa1303e0     	mov	x0, x19
 a081a9c: aa1503e1     	mov	x1, x21
 a081aa0: 97a20db2     	bl	0x8905168 <_ChromeMain+0x88ffecc>
 a081aa4: aa0003f5     	mov	x21, x0
 a081aa8: 17ffffb2     	b	0xa081970 <_ChromeMain+0xa07c6d4>
 a081aac: aa1303e0     	mov	x0, x19
 a081ab0: aa1503e1     	mov	x1, x21
 a081ab4: 97a20dad     	bl	0x8905168 <_ChromeMain+0x88ffecc>
 a081ab8: aa0003f5     	mov	x21, x0
 a081abc: 17ffff7f     	b	0xa0818b8 <_ChromeMain+0xa07c61c>
 a081ac0: aa1303e0     	mov	x0, x19
 a081ac4: aa1503e1     	mov	x1, x21
 a081ac8: 97a20da8     	bl	0x8905168 <_ChromeMain+0x88ffecc>
 a081acc: aa0003f5     	mov	x21, x0
 a081ad0: 17ffff89     	b	0xa0818f4 <_ChromeMain+0xa07c658>
 a081ad4: 321902c9     	orr	w9, w22, #0x80
 a081ad8: 38001509     	strb	w9, [x8], #0x1
 a081adc: 530e7ec9     	lsr	w9, w22, #14
 a081ae0: 53077ed6     	lsr	w22, w22, #7
 a081ae4: 35ffff89     	cbnz	w9, 0xa081ad4 <_ChromeMain+0xa07c838>
 a081ae8: d1000515     	sub	x21, x8, #0x1
 a081aec: 17ffff41     	b	0xa0817f0 <_ChromeMain+0xa07c554>
 a081af0: aa1303e0     	mov	x0, x19
 a081af4: aa1503e1     	mov	x1, x21
 a081af8: 97a20d9c     	bl	0x8905168 <_ChromeMain+0x88ffecc>
 a081afc: aa0003f5     	mov	x21, x0
 a081b00: 17ffff37     	b	0xa0817dc <_ChromeMain+0xa07c540>
 a081b04: aa1303e0     	mov	x0, x19
 a081b08: aa1503e3     	mov	x3, x21
 a081b0c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 a081b10: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 a081b14: a94257f6     	ldp	x22, x21, [sp, #0x20]
 a081b18: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 a081b1c: a8c567fa     	ldp	x26, x25, [sp], #0x50
 a081b20: 17a20dda     	b	0x8905288 <_ChromeMain+0x88fffec>
