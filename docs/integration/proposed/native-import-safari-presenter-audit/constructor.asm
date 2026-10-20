
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
