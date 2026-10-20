
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41076f0: d104c3ff     	sub	sp, sp, #0x130
 41076f4: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 41076f8: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 41076fc: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 4107700: a91057f6     	stp	x22, x21, [sp, #0x100]
 4107704: a9114ff4     	stp	x20, x19, [sp, #0x110]
 4107708: a9127bfd     	stp	x29, x30, [sp, #0x120]
 410770c: 910483fd     	add	x29, sp, #0x120
 4107710: f9400428     	ldr	x8, [x1, #0x8]
 4107714: b5000648     	cbnz	x8, 0x41077dc <_ChromeMain+0x4102540>
 4107718: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 410771c: a9514ff4     	ldp	x20, x19, [sp, #0x110]
 4107720: a95057f6     	ldp	x22, x21, [sp, #0x100]
 4107724: a94f5ff8     	ldp	x24, x23, [sp, #0xf0]
 4107728: a94e67fa     	ldp	x26, x25, [sp, #0xe0]
 410772c: a94d6ffc     	ldp	x28, x27, [sp, #0xd0]
 4107730: 9104c3ff     	add	sp, sp, #0x130
 4107734: d65f03c0     	ret
 4107738: aa1503e8     	mov	x8, x21
 410773c: f9400ab5     	ldr	x21, [x21, #0x10]
 4107740: f94002a9     	ldr	x9, [x21]
 4107744: eb09011f     	cmp	x8, x9
 4107748: 54ffff81     	b.ne	0x4107738 <_ChromeMain+0x410249c>
 410774c: 14000002     	b	0x4107754 <_ChromeMain+0x41024b8>
 4107750: f9403bf5     	ldr	x21, [sp, #0x70]
 4107754: eb1602bf     	cmp	x21, x22
 4107758: 54000140     	b.eq	0x4107780 <_ChromeMain+0x41024e4>
 410775c: f94012a1     	ldr	x1, [x21, #0x20]
 4107760: aa1403e0     	mov	x0, x20
 4107764: 959139d3     	bl	0xa555eb0 <_ChromeMain+0xa550c14>
 4107768: f94006a8     	ldr	x8, [x21, #0x8]
 410776c: b4fffe68     	cbz	x8, 0x4107738 <_ChromeMain+0x410249c>
 4107770: aa0803f5     	mov	x21, x8
 4107774: f9400108     	ldr	x8, [x8]
 4107778: b5ffffc8     	cbnz	x8, 0x4107770 <_ChromeMain+0x41024d4>
 410777c: 17fffff6     	b	0x4107754 <_ChromeMain+0x41024b8>
 4107780: aa1403e0     	mov	x0, x20
 4107784: 95912a10     	bl	0xa551fc4 <_ChromeMain+0xa54cd28>
 4107788: 360001f7     	tbz	w23, #0x0, 0x41077c4 <_ChromeMain+0x4102528>
 410778c: f9400a60     	ldr	x0, [x19, #0x10]
 4107790: f9400008     	ldr	x8, [x0]
 4107794: f940b508     	ldr	x8, [x8, #0x168]
 4107798: d63f0100     	blr	x8
 410779c: 52800028     	mov	w8, #0x1                ; =1
 41077a0: 381903a8     	sturb	w8, [x29, #-0x70]
 41077a4: 381a83a8     	sturb	w8, [x29, #-0x58]
 41077a8: d0046ea1     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 41077ac: 911dcc21     	add	x1, x1, #0x773
 41077b0: d101c3a3     	sub	x3, x29, #0x70
 41077b4: 528003a2     	mov	w2, #0x1d               ; =29
 41077b8: 9750083c     	bl	0x15098a8 <_ChromeMain+0x150460c>
 41077bc: d101c3a0     	sub	x0, x29, #0x70
 41077c0: 97545c05     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 41077c4: f9403fe1     	ldr	x1, [sp, #0x78]
 41077c8: 9101c3e8     	add	x8, sp, #0x70
 41077cc: f81903a8     	stur	x8, [x29, #-0x70]
 41077d0: d101c3a0     	sub	x0, x29, #0x70
 41077d4: 971eea60     	bl	0x8c2154 <_ChromeMain+0x8bceb8>
 41077d8: 17ffffd0     	b	0x4107718 <_ChromeMain+0x410247c>
 41077dc: aa0203f6     	mov	x22, x2
 41077e0: aa0103f5     	mov	x21, x1
 41077e4: aa0003f3     	mov	x19, x0
 41077e8: f9400800     	ldr	x0, [x0, #0x10]
 41077ec: 972bd024     	bl	0xbfb87c <_ChromeMain+0xbf65e0>
 41077f0: aa0003f4     	mov	x20, x0
 41077f4: aa0003f7     	mov	x23, x0
 41077f8: f8450ee8     	ldr	x8, [x23, #0x50]!
 41077fc: b5001748     	cbnz	x8, 0x4107ae4 <_ChromeMain+0x4102848>
 4107800: 9100e297     	add	x23, x20, #0x38
 4107804: f94002f7     	ldr	x23, [x23]
 4107808: aa1403e0     	mov	x0, x20
 410780c: 95912994     	bl	0xa551e5c <_ChromeMain+0xa54cbc0>
 4107810: f94026f8     	ldr	x24, [x23, #0x48]
 4107814: d101c3a8     	sub	x8, x29, #0x70
 4107818: aa1703e0     	mov	x0, x23
 410781c: aa1603e1     	mov	x1, x22
 4107820: 97fffee9     	bl	0x41073c4 <_ChromeMain+0x4102128>
 4107824: 390223ff     	strb	wzr, [sp, #0x88]
 4107828: 390283ff     	strb	wzr, [sp, #0xa0]
 410782c: d101c3a3     	sub	x3, x29, #0x70
 4107830: 910223e7     	add	x7, sp, #0x88
 4107834: aa1403e0     	mov	x0, x20
 4107838: aa1703e1     	mov	x1, x23
 410783c: aa1803e2     	mov	x2, x24
 4107840: d2800004     	mov	x4, #0x0                ; =0
 4107844: d2800005     	mov	x5, #0x0                ; =0
 4107848: d2800006     	mov	x6, #0x0                ; =0
 410784c: 959135a2     	bl	0xa554ed4 <_ChromeMain+0xa54fc38>
 4107850: aa0003f6     	mov	x22, x0
 4107854: 394283e8     	ldrb	w8, [sp, #0xa0]
 4107858: 340000e8     	cbz	w8, 0x4107874 <_ChromeMain+0x41025d8>
 410785c: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 4107860: 36f800a8     	tbz	w8, #0x1f, 0x4107874 <_ChromeMain+0x41025d8>
 4107864: f94047e0     	ldr	x0, [sp, #0x88]
 4107868: f9404fe8     	ldr	x8, [sp, #0x98]
 410786c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4107870: 96fc0592     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4107874: 38da73a8     	ldursb	w8, [x29, #-0x59]
 4107878: 36f800a8     	tbz	w8, #0x1f, 0x410788c <_ChromeMain+0x41025f0>
 410787c: f85903a0     	ldur	x0, [x29, #-0x70]
 4107880: f85a03a8     	ldur	x8, [x29, #-0x60]
 4107884: d37ff901     	lsl	x1, x8, #1
 4107888: 96fc058c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 410788c: f81883b6     	stur	x22, [x29, #-0x78]
 4107890: 9101c3e8     	add	x8, sp, #0x70
 4107894: 91002116     	add	x22, x8, #0x8
 4107898: a907ffff     	stp	xzr, xzr, [sp, #0x78]
 410789c: f9003bf6     	str	x22, [sp, #0x70]
 41078a0: 9101c3e0     	add	x0, sp, #0x70
 41078a4: 9101c3e1     	add	x1, sp, #0x70
 41078a8: d101e3a2     	sub	x2, x29, #0x78
 41078ac: 94ae8bcd     	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 41078b0: f94006a8     	ldr	x8, [x21, #0x8]
 41078b4: d378dd09     	lsl	x9, x8, #8
 41078b8: 52800017     	mov	w23, #0x0               ; =0
 41078bc: eb081128     	subs	x8, x9, x8, lsl #4
 41078c0: 54fff480     	b.eq	0x4107750 <_ChromeMain+0x41024b4>
 41078c4: f94002b8     	ldr	x24, [x21]
 41078c8: 8b080319     	add	x25, x24, x8
 41078cc: 910043fa     	add	x26, sp, #0x10
 41078d0: 14000016     	b	0x4107928 <_ChromeMain+0x410268c>
 41078d4: 3900c3ff     	strb	wzr, [sp, #0x30]
 41078d8: 390123ff     	strb	wzr, [sp, #0x48]
 41078dc: 91026303     	add	x3, x24, #0x98
 41078e0: 9100c3e7     	add	x7, sp, #0x30
 41078e4: aa1403e0     	mov	x0, x20
 41078e8: d2800004     	mov	x4, #0x0                ; =0
 41078ec: d2800005     	mov	x5, #0x0                ; =0
 41078f0: d2800006     	mov	x6, #0x0                ; =0
 41078f4: 95913578     	bl	0xa554ed4 <_ChromeMain+0xa54fc38>
 41078f8: 394123e8     	ldrb	w8, [sp, #0x48]
 41078fc: 34000108     	cbz	w8, 0x410791c <_ChromeMain+0x4102680>
 4107900: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4107904: 36f800c8     	tbz	w8, #0x1f, 0x410791c <_ChromeMain+0x4102680>
 4107908: 9100c3e8     	add	x8, sp, #0x30
 410790c: f94023e9     	ldr	x9, [sp, #0x40]
 4107910: f9400100     	ldr	x0, [x8]
 4107914: 9240f921     	and	x1, x9, #0x7fffffffffffffff
 4107918: 96fc0568     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 410791c: 9103c318     	add	x24, x24, #0xf0
 4107920: eb19031f     	cmp	x24, x25
 4107924: 54fff160     	b.eq	0x4107750 <_ChromeMain+0x41024b4>
 4107928: 39400708     	ldrb	w8, [x24, #0x1]
 410792c: 37000068     	tbnz	w8, #0x0, 0x4107938 <_ChromeMain+0x410269c>
 4107930: 39408308     	ldrb	w8, [x24, #0x20]
 4107934: 34ffff48     	cbz	w8, 0x410791c <_ChromeMain+0x4102680>
 4107938: 39400308     	ldrb	w8, [x24]
 410793c: 120002e9     	and	w9, w23, #0x1
 4107940: 2a090108     	orr	w8, w8, w9
 4107944: 7100011f     	cmp	w8, #0x0
 4107948: 1a9f07f7     	cset	w23, ne
 410794c: f85883a1     	ldur	x1, [x29, #-0x78]
 4107950: f81903a1     	stur	x1, [x29, #-0x70]
 4107954: f9404708     	ldr	x8, [x24, #0x88]
 4107958: 8b080508     	add	x8, x8, x8, lsl #1
 410795c: d37df109     	lsl	x9, x8, #3
 4107960: b4000089     	cbz	x9, 0x4107970 <_ChromeMain+0x41026d4>
 4107964: f9404315     	ldr	x21, [x24, #0x80]
 4107968: 8b080ebb     	add	x27, x21, x8, lsl #3
 410796c: 14000044     	b	0x4107a7c <_ChromeMain+0x41027e0>
 4107970: 9101c3e0     	add	x0, sp, #0x70
 4107974: 9101c3e1     	add	x1, sp, #0x70
 4107978: d101c3a2     	sub	x2, x29, #0x70
 410797c: 94ae8b99     	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 4107980: 39400708     	ldrb	w8, [x24, #0x1]
 4107984: f85903a1     	ldur	x1, [x29, #-0x70]
 4107988: f9402422     	ldr	x2, [x1, #0x48]
 410798c: 3707fa48     	tbnz	w8, #0x0, 0x41078d4 <_ChromeMain+0x4102638>
 4107990: f9405b06     	ldr	x6, [x24, #0xb0]
 4107994: 390043ff     	strb	wzr, [sp, #0x10]
 4107998: 3900a3ff     	strb	wzr, [sp, #0x28]
 410799c: 390023ff     	strb	wzr, [sp, #0x8]
 41079a0: f90003fa     	str	x26, [sp]
 41079a4: 91026303     	add	x3, x24, #0x98
 41079a8: 91002304     	add	x4, x24, #0x8
 41079ac: aa1403e0     	mov	x0, x20
 41079b0: d2800005     	mov	x5, #0x0                ; =0
 41079b4: 52800027     	mov	w7, #0x1                ; =1
 41079b8: 9591368e     	bl	0xa5553f0 <_ChromeMain+0xa550154>
 41079bc: 3940a3e8     	ldrb	w8, [sp, #0x28]
 41079c0: 34fffae8     	cbz	w8, 0x410791c <_ChromeMain+0x4102680>
 41079c4: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 41079c8: 36fffaa8     	tbz	w8, #0x1f, 0x410791c <_ChromeMain+0x4102680>
 41079cc: 910043e8     	add	x8, sp, #0x10
 41079d0: f94013e9     	ldr	x9, [sp, #0x20]
 41079d4: 17ffffcf     	b	0x4107910 <_ChromeMain+0x4102674>
 41079d8: aa0903e8     	mov	x8, x9
 41079dc: 14000021     	b	0x4107a60 <_ChromeMain+0x41027c4>
 41079e0: 91002108     	add	x8, x8, #0x8
 41079e4: eb09011f     	cmp	x8, x9
 41079e8: 54ffff80     	b.eq	0x41079d8 <_ChromeMain+0x410273c>
 41079ec: f940010b     	ldr	x11, [x8]
 41079f0: b940f96a     	ldr	w10, [x11, #0xf8]
 41079f4: 34ffff6a     	cbz	w10, 0x41079e0 <_ChromeMain+0x4102744>
 41079f8: 39407d6a     	ldrb	w10, [x11, #0x1f]
 41079fc: 13001d4c     	sxtb	w12, w10
 4107a00: f940096d     	ldr	x13, [x11, #0x10]
 4107a04: 7100019f     	cmp	w12, #0x0
 4107a08: 9a8a41aa     	csel	x10, x13, x10, mi
 4107a0c: 39405eae     	ldrb	w14, [x21, #0x17]
 4107a10: 13001dcd     	sxtb	w13, w14
 4107a14: f94006af     	ldr	x15, [x21, #0x8]
 4107a18: 710001bf     	cmp	w13, #0x0
 4107a1c: 9a8e41ee     	csel	x14, x15, x14, mi
 4107a20: eb0e015f     	cmp	x10, x14
 4107a24: 54fffde1     	b.ne	0x41079e0 <_ChromeMain+0x4102744>
 4107a28: b40001ca     	cbz	x10, 0x4107a60 <_ChromeMain+0x41027c4>
 4107a2c: 9100216e     	add	x14, x11, #0x8
 4107a30: f94002ab     	ldr	x11, [x21]
 4107a34: 710001bf     	cmp	w13, #0x0
 4107a38: 9a95416b     	csel	x11, x11, x21, mi
 4107a3c: f94001cd     	ldr	x13, [x14]
 4107a40: 7100019f     	cmp	w12, #0x0
 4107a44: 9a8e41ac     	csel	x12, x13, x14, mi
 4107a48: 7840258d     	ldrh	w13, [x12], #0x2
 4107a4c: 7840256e     	ldrh	w14, [x11], #0x2
 4107a50: 6b0d01df     	cmp	w14, w13
 4107a54: 54fffc61     	b.ne	0x41079e0 <_ChromeMain+0x4102744>
 4107a58: f100054a     	subs	x10, x10, #0x1
 4107a5c: 54ffff61     	b.ne	0x4107a48 <_ChromeMain+0x41027ac>
 4107a60: eb09011f     	cmp	x8, x9
 4107a64: 54000160     	b.eq	0x4107a90 <_ChromeMain+0x41027f4>
 4107a68: f9400101     	ldr	x1, [x8]
 4107a6c: f81903a1     	stur	x1, [x29, #-0x70]
 4107a70: 910062b5     	add	x21, x21, #0x18
 4107a74: eb1b02bf     	cmp	x21, x27
 4107a78: 54fff7c0     	b.eq	0x4107970 <_ChromeMain+0x41026d4>
 4107a7c: a9440828     	ldp	x8, x2, [x1, #0x40]
 4107a80: d37df04a     	lsl	x10, x2, #3
 4107a84: 8b020d09     	add	x9, x8, x2, lsl #3
 4107a88: b4fffeca     	cbz	x10, 0x4107a60 <_ChromeMain+0x41027c4>
 4107a8c: 17ffffd8     	b	0x41079ec <_ChromeMain+0x4102750>
 4107a90: 390143ff     	strb	wzr, [sp, #0x50]
 4107a94: 3901a3ff     	strb	wzr, [sp, #0x68]
 4107a98: 910143e7     	add	x7, sp, #0x50
 4107a9c: aa1403e0     	mov	x0, x20
 4107aa0: aa1503e3     	mov	x3, x21
 4107aa4: d2800004     	mov	x4, #0x0                ; =0
 4107aa8: d2800005     	mov	x5, #0x0                ; =0
 4107aac: d2800006     	mov	x6, #0x0                ; =0
 4107ab0: 95913509     	bl	0xa554ed4 <_ChromeMain+0xa54fc38>
 4107ab4: aa0003e1     	mov	x1, x0
 4107ab8: f81903a0     	stur	x0, [x29, #-0x70]
 4107abc: 3941a3e8     	ldrb	w8, [sp, #0x68]
 4107ac0: 34fffd88     	cbz	w8, 0x4107a70 <_ChromeMain+0x41027d4>
 4107ac4: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4107ac8: 36fffd48     	tbz	w8, #0x1f, 0x4107a70 <_ChromeMain+0x41027d4>
 4107acc: f9402be0     	ldr	x0, [sp, #0x50]
 4107ad0: f94033e8     	ldr	x8, [sp, #0x60]
 4107ad4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4107ad8: 96fc04f8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4107adc: f85903a1     	ldur	x1, [x29, #-0x70]
 4107ae0: 17ffffe4     	b	0x4107a70 <_ChromeMain+0x41027d4>
 4107ae4: 90055920     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4107ae8: 910a2000     	add	x0, x0, #0x288
 4107aec: 970045e5     	bl	0x119280 <_ChromeMain+0x113fe4>
 4107af0: 36000140     	tbz	w0, #0x0, 0x4107b18 <_ChromeMain+0x410287c>
 4107af4: f94002e8     	ldr	x8, [x23]
 4107af8: b4ffe848     	cbz	x8, 0x4107800 <_ChromeMain+0x4102564>
 4107afc: 90055920     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4107b00: 910a2000     	add	x0, x0, #0x288
 4107b04: 970045df     	bl	0x119280 <_ChromeMain+0x113fe4>
 4107b08: 3707e7e0     	tbnz	w0, #0x0, 0x4107804 <_ChromeMain+0x4102568>
 4107b0c: d4200000     	brk	#0
 4107b10: d4400000     	hlt	#0
 4107b14: d4200020     	brk	#0x1
 4107b18: d4200000     	brk	#0
 4107b1c: d4400000     	hlt	#0
 4107b20: d4200020     	brk	#0x1
