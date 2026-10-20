
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465c5f0: d103c3ff     	sub	sp, sp, #0xf0
 465c5f4: a9096ffc     	stp	x28, x27, [sp, #0x90]
 465c5f8: a90a67fa     	stp	x26, x25, [sp, #0xa0]
 465c5fc: a90b5ff8     	stp	x24, x23, [sp, #0xb0]
 465c600: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 465c604: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 465c608: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 465c60c: 910383fd     	add	x29, sp, #0xe0
 465c610: aa0203f7     	mov	x23, x2
 465c614: aa0103f6     	mov	x22, x1
 465c618: aa0003f3     	mov	x19, x0
 465c61c: f005063c     	adrp	x28, 0xe723000 <dyld_stub_binder+0xe723000>
 465c620: 913ac39c     	add	x28, x28, #0xeb0
 465c624: 91126388     	add	x8, x28, #0x498
 465c628: a900201c     	stp	x28, x8, [x0]
 465c62c: 91130388     	add	x8, x28, #0x4c0
 465c630: f9000808     	str	x8, [x0, #0x10]
 465c634: 9113e388     	add	x8, x28, #0x4f8
 465c638: 9114a389     	add	x9, x28, #0x528
 465c63c: a906a408     	stp	x8, x9, [x0, #0x68]
 465c640: 9115e388     	add	x8, x28, #0x578
 465c644: f9005808     	str	x8, [x0, #0xb0]
 465c648: 91176388     	add	x8, x28, #0x5d8
 465c64c: aa0003f4     	mov	x20, x0
 465c650: f80d8e88     	str	x8, [x20, #0xd8]!
 465c654: 91182388     	add	x8, x28, #0x608
 465c658: aa0003f5     	mov	x21, x0
 465c65c: f80f8ea8     	str	x8, [x21, #0xf8]!
 465c660: 9118c388     	add	x8, x28, #0x630
 465c664: f9018808     	str	x8, [x0, #0x310]
 465c668: 911ac388     	add	x8, x28, #0x6b0
 465c66c: f9018c08     	str	x8, [x0, #0x318]
 465c670: 911dc388     	add	x8, x28, #0x770
 465c674: f9019008     	str	x8, [x0, #0x320]
 465c678: 9112c01a     	add	x26, x0, #0x4b0
 465c67c: 911ea388     	add	x8, x28, #0x7a8
 465c680: f9025808     	str	x8, [x0, #0x4b0]
 465c684: 91200388     	add	x8, x28, #0x800
 465c688: f9026408     	str	x8, [x0, #0x4c8]
 465c68c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465c690: d0052ab8     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465c694: f9404709     	ldr	x9, [x24, #0x88]
 465c698: eb09011f     	cmp	x8, x9
 465c69c: 54000061     	b.ne	0x465c6a8 <_ChromeMain+0x465740c>
 465c6a0: aa1303e0     	mov	x0, x19
 465c6a4: 96e6df16     	bl	0x142fc <_ChromeMain+0xf060>
 465c6a8: 52800700     	mov	w0, #0x38               ; =56
 465c6ac: 96e6cb2f     	bl	0xf368 <_ChromeMain+0xa0cc>
 465c6b0: 52800028     	mov	w8, #0x1                ; =1
 465c6b4: b9000008     	str	w8, [x0]
 465c6b8: f0ffcaa8     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 465c6bc: 91300108     	add	x8, x8, #0xc00
 465c6c0: b0ff91e9     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 465c6c4: 912d0129     	add	x9, x9, #0xb40
 465c6c8: a900a408     	stp	x8, x9, [x0, #0x8]
 465c6cc: b0fef819     	adrp	x25, 0x255d000 <_ChromeMain+0x2557d64>
 465c6d0: 912c0339     	add	x25, x25, #0xb00
 465c6d4: 10008868     	adr	x8, 0x465d7e0 <_ChromeMain+0x4658544>
 465c6d8: d503201f     	nop
 465c6dc: a901a019     	stp	x25, x8, [x0, #0x18]
 465c6e0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 465c6e4: f81a03a0     	stur	x0, [x29, #-0x60]
 465c6e8: 52800048     	mov	w8, #0x2                ; =2
 465c6ec: 381a83a8     	sturb	w8, [x29, #-0x58]
 465c6f0: d10183a1     	sub	x1, x29, #0x60
 465c6f4: aa1303e0     	mov	x0, x19
 465c6f8: 97344762     	bl	0x136e480 <_ChromeMain+0x13691e4>
 465c6fc: 385a83a8     	ldurb	w8, [x29, #-0x58]
 465c700: 7103fd1f     	cmp	w8, #0xff
 465c704: 54000060     	b.eq	0x465c710 <_ChromeMain+0x4657474>
 465c708: f85a03a0     	ldur	x0, [x29, #-0x60]
 465c70c: b5007520     	cbnz	x0, 0x465d5b0 <_ChromeMain+0x4658314>
 465c710: 52801fe8     	mov	w8, #0xff               ; =255
 465c714: 381a83a8     	sturb	w8, [x29, #-0x58]
 465c718: f004e2db     	adrp	x27, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 465c71c: 913c237b     	add	x27, x27, #0xf08
 465c720: f900035b     	str	x27, [x26]
 465c724: 52800100     	mov	w0, #0x8                ; =8
 465c728: 96e6cb10     	bl	0xf368 <_ChromeMain+0xa0cc>
 465c72c: b900001f     	str	wzr, [x0]
 465c730: 3900101f     	strb	wzr, [x0, #0x4]
 465c734: b40000c0     	cbz	x0, 0x465c74c <_ChromeMain+0x46574b0>
 465c738: 52800028     	mov	w8, #0x1                ; =1
 465c73c: b8280008     	ldadd	w8, w8, [x0]
 465c740: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 465c744: 6b09011f     	cmp	w8, w9
 465c748: 540080c0     	b.eq	0x465d760 <_ChromeMain+0x46584c4>
 465c74c: f9025e60     	str	x0, [x19, #0x4b8]
 465c750: f902627a     	str	x26, [x19, #0x4c0]
 465c754: 91126388     	add	x8, x28, #0x498
 465c758: a900227c     	stp	x28, x8, [x19]
 465c75c: 91130388     	add	x8, x28, #0x4c0
 465c760: f9000a68     	str	x8, [x19, #0x10]
 465c764: 9113e388     	add	x8, x28, #0x4f8
 465c768: 9114a389     	add	x9, x28, #0x528
 465c76c: a906a668     	stp	x8, x9, [x19, #0x68]
 465c770: 9115e388     	add	x8, x28, #0x578
 465c774: f9005a68     	str	x8, [x19, #0xb0]
 465c778: 91176388     	add	x8, x28, #0x5d8
 465c77c: f9006e68     	str	x8, [x19, #0xd8]
 465c780: 91182388     	add	x8, x28, #0x608
 465c784: f9007e68     	str	x8, [x19, #0xf8]
 465c788: 9118c388     	add	x8, x28, #0x630
 465c78c: f9018a68     	str	x8, [x19, #0x310]
 465c790: 911ac388     	add	x8, x28, #0x6b0
 465c794: f9018e68     	str	x8, [x19, #0x318]
 465c798: 911dc388     	add	x8, x28, #0x770
 465c79c: f9019268     	str	x8, [x19, #0x320]
 465c7a0: 911ea388     	add	x8, x28, #0x7a8
 465c7a4: f9025a68     	str	x8, [x19, #0x4b0]
 465c7a8: 91200388     	add	x8, x28, #0x800
 465c7ac: f9026668     	str	x8, [x19, #0x4c8]
 465c7b0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 465c7b4: f9404709     	ldr	x9, [x24, #0x88]
 465c7b8: eb09011f     	cmp	x8, x9
 465c7bc: 54000061     	b.ne	0x465c7c8 <_ChromeMain+0x465752c>
 465c7c0: aa1603e0     	mov	x0, x22
 465c7c4: 96e6dece     	bl	0x142fc <_ChromeMain+0xf060>
 465c7c8: f9026a76     	str	x22, [x19, #0x4d0]
 465c7cc: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 465c7d0: f9404709     	ldr	x9, [x24, #0x88]
 465c7d4: eb09011f     	cmp	x8, x9
 465c7d8: 54000061     	b.ne	0x465c7e4 <_ChromeMain+0x4657548>
 465c7dc: aa1703e0     	mov	x0, x23
 465c7e0: 96e6dec7     	bl	0x142fc <_ChromeMain+0xf060>
 465c7e4: f9026e77     	str	x23, [x19, #0x4d8]
 465c7e8: f9429ed6     	ldr	x22, [x22, #0x538]
 465c7ec: 52803300     	mov	w0, #0x198              ; =408
 465c7f0: 96e6cade     	bl	0xf368 <_ChromeMain+0xa0cc>
 465c7f4: aa1603e1     	mov	x1, x22
 465c7f8: 97fc44e3     	bl	0x456db84 <_ChromeMain+0x45688e8>
 465c7fc: f9027260     	str	x0, [x19, #0x4e0]
 465c800: 9113a268     	add	x8, x19, #0x4e8
 465c804: 3914e27f     	strb	wzr, [x19, #0x538]
 465c808: 3914f27f     	strb	wzr, [x19, #0x53c]
 465c80c: 3915627f     	strb	wzr, [x19, #0x558]
 465c810: f902b27f     	str	xzr, [x19, #0x560]
 465c814: 925e7749     	and	x9, x26, #0xfffffffc00000000
 465c818: 6f00e400     	movi.2d	v0, #0000000000000000
 465c81c: ad000100     	stp	q0, q0, [x8]
 465c820: ad010100     	stp	q0, q0, [x8, #0x20]
 465c824: 3c83f100     	stur	q0, [x8, #0x3f]
 465c828: 3d815260     	str	q0, [x19, #0x540]
 465c82c: 3915427f     	strb	wzr, [x19, #0x550]
 465c830: f9404708     	ldr	x8, [x24, #0x88]
 465c834: eb08013f     	cmp	x9, x8
 465c838: 54000081     	b.ne	0x465c848 <_ChromeMain+0x46575ac>
 465c83c: 9112c260     	add	x0, x19, #0x4b0
 465c840: 96e6deaf     	bl	0x142fc <_ChromeMain+0xf060>
 465c844: f9404708     	ldr	x8, [x24, #0x88]
 465c848: f902b67a     	str	x26, [x19, #0x568]
 465c84c: f902ba7f     	str	xzr, [x19, #0x570]
 465c850: 9115e276     	add	x22, x19, #0x578
 465c854: 9004f569     	adrp	x9, 0xe508000 <dyld_stub_binder+0xe508000>
 465c858: 91384129     	add	x9, x9, #0xe10
 465c85c: f902be69     	str	x9, [x19, #0x578]
 465c860: 925e7669     	and	x9, x19, #0xfffffffc00000000
 465c864: eb08013f     	cmp	x9, x8
 465c868: 54000081     	b.ne	0x465c878 <_ChromeMain+0x46575dc>
 465c86c: aa1303e0     	mov	x0, x19
 465c870: 96e6dea3     	bl	0x142fc <_ChromeMain+0xf060>
 465c874: f9404708     	ldr	x8, [x24, #0x88]
 465c878: 91132277     	add	x23, x19, #0x4c8
 465c87c: f902c273     	str	x19, [x19, #0x580]
 465c880: 925e76c9     	and	x9, x22, #0xfffffffc00000000
 465c884: eb08013f     	cmp	x9, x8
 465c888: 54000081     	b.ne	0x465c898 <_ChromeMain+0x46575fc>
 465c88c: 9115e260     	add	x0, x19, #0x578
 465c890: 96e6de9b     	bl	0x142fc <_ChromeMain+0xf060>
 465c894: f9404708     	ldr	x8, [x24, #0x88]
 465c898: f902c676     	str	x22, [x19, #0x588]
 465c89c: f902ca7f     	str	xzr, [x19, #0x590]
 465c8a0: 925e76e9     	and	x9, x23, #0xfffffffc00000000
 465c8a4: eb08013f     	cmp	x9, x8
 465c8a8: 54000061     	b.ne	0x465c8b4 <_ChromeMain+0x4657618>
 465c8ac: 91132260     	add	x0, x19, #0x4c8
 465c8b0: 96e6de93     	bl	0x142fc <_ChromeMain+0xf060>
 465c8b4: f902ce77     	str	x23, [x19, #0x598]
 465c8b8: f902d27f     	str	xzr, [x19, #0x5a0]
 465c8bc: f902d67b     	str	x27, [x19, #0x5a8]
 465c8c0: 52800100     	mov	w0, #0x8                ; =8
 465c8c4: 96e6caa9     	bl	0xf368 <_ChromeMain+0xa0cc>
 465c8c8: b900001f     	str	wzr, [x0]
 465c8cc: 3900101f     	strb	wzr, [x0, #0x4]
 465c8d0: b40000c0     	cbz	x0, 0x465c8e8 <_ChromeMain+0x465764c>
 465c8d4: 52800028     	mov	w8, #0x1                ; =1
 465c8d8: b8280008     	ldadd	w8, w8, [x0]
 465c8dc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 465c8e0: 6b09011f     	cmp	w8, w9
 465c8e4: 54007440     	b.eq	0x465d76c <_ChromeMain+0x46584d0>
 465c8e8: 9116a268     	add	x8, x19, #0x5a8
 465c8ec: f902da60     	str	x0, [x19, #0x5b0]
 465c8f0: f902de68     	str	x8, [x19, #0x5b8]
 465c8f4: f004e448     	adrp	x8, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 465c8f8: 91124108     	add	x8, x8, #0x490
 465c8fc: f902d668     	str	x8, [x19, #0x5a8]
 465c900: f902e27f     	str	xzr, [x19, #0x5c0]
 465c904: f902ea7f     	str	xzr, [x19, #0x5d0]
 465c908: 52800100     	mov	w0, #0x8                ; =8
 465c90c: 96e6ca97     	bl	0xf368 <_ChromeMain+0xa0cc>
 465c910: aa0003f6     	mov	x22, x0
 465c914: b900001f     	str	wzr, [x0]
 465c918: 3900101f     	strb	wzr, [x0, #0x4]
 465c91c: b40000c0     	cbz	x0, 0x465c934 <_ChromeMain+0x4657698>
 465c920: 52800028     	mov	w8, #0x1                ; =1
 465c924: b82802c8     	ldadd	w8, w8, [x22]
 465c928: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 465c92c: 6b09011f     	cmp	w8, w9
 465c930: 54007240     	b.eq	0x465d778 <_ChromeMain+0x46584dc>
 465c934: f902ee76     	str	x22, [x19, #0x5d8]
 465c938: f902f273     	str	x19, [x19, #0x5e0]
 465c93c: 39518268     	ldrb	w8, [x19, #0x460]
 465c940: 340000c8     	cbz	w8, 0x465c958 <_ChromeMain+0x46576bc>
 465c944: 3911827f     	strb	wzr, [x19, #0x460]
 465c948: 91118261     	add	x1, x19, #0x460
 465c94c: aa1503e0     	mov	x0, x21
 465c950: 97232da0     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465c954: f942ee76     	ldr	x22, [x19, #0x5d8]
 465c958: f9427277     	ldr	x23, [x19, #0x4e0]
 465c95c: b40000d6     	cbz	x22, 0x465c974 <_ChromeMain+0x46576d8>
 465c960: 52800028     	mov	w8, #0x1                ; =1
 465c964: b82802c8     	ldadd	w8, w8, [x22]
 465c968: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 465c96c: 6b09011f     	cmp	w8, w9
 465c970: 54006f20     	b.eq	0x465d754 <_ChromeMain+0x46584b8>
 465c974: f942f27a     	ldr	x26, [x19, #0x5e0]
 465c978: 52800800     	mov	w0, #0x40               ; =64
 465c97c: 96e6ca7b     	bl	0xf368 <_ChromeMain+0xa0cc>
 465c980: 52800028     	mov	w8, #0x1                ; =1
 465c984: b9000008     	str	w8, [x0]
 465c988: f0ffcae8     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 465c98c: 911c0108     	add	x8, x8, #0x700
 465c990: d0ffca09     	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 465c994: 91110129     	add	x9, x9, #0x440
 465c998: a900a408     	stp	x8, x9, [x0, #0x8]
 465c99c: d0ffd068     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 465c9a0: 910a0108     	add	x8, x8, #0x280
 465c9a4: 100085e9     	adr	x9, 0x465da60 <_ChromeMain+0x46587c4>
 465c9a8: d503201f     	nop
 465c9ac: a901a408     	stp	x8, x9, [x0, #0x18]
 465c9b0: a902d81f     	stp	xzr, x22, [x0, #0x28]
 465c9b4: f9001c1a     	str	x26, [x0, #0x38]
 465c9b8: f940bef6     	ldr	x22, [x23, #0x178]
 465c9bc: f900bee0     	str	x0, [x23, #0x178]
 465c9c0: b5006336     	cbnz	x22, 0x465d624 <_ChromeMain+0x4658388>
 465c9c4: f9424268     	ldr	x8, [x19, #0x480]
 465c9c8: b900191f     	str	wzr, [x8, #0x18]
 465c9cc: b9446668     	ldr	w8, [x19, #0x464]
 465c9d0: 7120011f     	cmp	w8, #0x800
 465c9d4: 540000e0     	b.eq	0x465c9f0 <_ChromeMain+0x4657754>
 465c9d8: 91119268     	add	x8, x19, #0x464
 465c9dc: 52810009     	mov	w9, #0x800              ; =2048
 465c9e0: b9000109     	str	w9, [x8]
 465c9e4: 91119261     	add	x1, x19, #0x464
 465c9e8: aa1503e0     	mov	x0, x21
 465c9ec: 97232d79     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465c9f0: 52800028     	mov	w8, #0x1                ; =1
 465c9f4: 39072e68     	strb	w8, [x19, #0x1cb]
 465c9f8: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 465c9fc: f9002bff     	str	xzr, [sp, #0x50]
 465ca00: 910103e1     	add	x1, sp, #0x40
 465ca04: aa1303e0     	mov	x0, x19
 465ca08: 9707a7cf     	bl	0x846944 <_ChromeMain+0x8416a8>
 465ca0c: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 465ca10: 36f800a8     	tbz	w8, #0x1f, 0x465ca24 <_ChromeMain+0x4657788>
 465ca14: f94023e0     	ldr	x0, [sp, #0x40]
 465ca18: f9402be8     	ldr	x8, [sp, #0x50]
 465ca1c: d37ff901     	lsl	x1, x8, #1
 465ca20: 96e6b126     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465ca24: 52802800     	mov	w0, #0x140              ; =320
 465ca28: 96e6ca50     	bl	0xf368 <_ChromeMain+0xa0cc>
 465ca2c: aa0003f5     	mov	x21, x0
 465ca30: 978ecee8     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 465ca34: aa1303e0     	mov	x0, x19
 465ca38: aa1503e1     	mov	x1, x21
 465ca3c: 9754b37f     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 465ca40: b940f2a8     	ldr	w8, [x21, #0xf0]
 465ca44: 350059a8     	cbnz	w8, 0x465d578 <_ChromeMain+0x46582dc>
 465ca48: 52800028     	mov	w8, #0x1                ; =1
 465ca4c: b90043e8     	str	w8, [sp, #0x40]
 465ca50: b0051d41     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465ca54: 9115a021     	add	x1, x1, #0x568
 465ca58: 910462a0     	add	x0, x21, #0x118
 465ca5c: 910103e2     	add	x2, sp, #0x40
 465ca60: 975021d1     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 465ca64: d005457a     	adrp	x26, 0xef0a000 <dyld_stub_binder+0xef0a000>
 465ca68: 9112035a     	add	x26, x26, #0x480
 465ca6c: f8bfc340     	ldapr	x0, [x26]
 465ca70: b40061e0     	cbz	x0, 0x465d6ac <_ChromeMain+0x4658410>
 465ca74: 52806201     	mov	w1, #0x310              ; =784
 465ca78: d2800002     	mov	x2, #0x0                ; =0
 465ca7c: 96e93acd     	bl	0xab5b0 <_ChromeMain+0xa6314>
 465ca80: aa0003f5     	mov	x21, x0
 465ca84: 973449af     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 465ca88: 3945a408     	ldrb	w8, [x0, #0x169]
 465ca8c: 35006288     	cbnz	w8, 0x465d6dc <_ChromeMain+0x4658440>
 465ca90: f940ce62     	ldr	x2, [x19, #0x198]
 465ca94: aa1303e0     	mov	x0, x19
 465ca98: aa1503e1     	mov	x1, x21
 465ca9c: 97047258     	bl	0x7793fc <_ChromeMain+0x774160>
 465caa0: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 465caa4: f9404709     	ldr	x9, [x24, #0x88]
 465caa8: eb09011f     	cmp	x8, x9
 465caac: 54000061     	b.ne	0x465cab8 <_ChromeMain+0x465781c>
 465cab0: aa1503e0     	mov	x0, x21
 465cab4: 96e6de12     	bl	0x142fc <_ChromeMain+0xf060>
 465cab8: f9428260     	ldr	x0, [x19, #0x500]
 465cabc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465cac0: f9404709     	ldr	x9, [x24, #0x88]
 465cac4: eb09011f     	cmp	x8, x9
 465cac8: 54000041     	b.ne	0x465cad0 <_ChromeMain+0x4657834>
 465cacc: 96e717dc     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465cad0: f9028275     	str	x21, [x19, #0x500]
 465cad4: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 465cad8: 340000c8     	cbz	w8, 0x465caf0 <_ChromeMain+0x4657854>
 465cadc: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 465cae0: 9103e2a0     	add	x0, x21, #0xf8
 465cae4: 9106a6a1     	add	x1, x21, #0x1a9
 465cae8: 97232d3a     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465caec: f9428275     	ldr	x21, [x19, #0x500]
 465caf0: 52801f00     	mov	w0, #0xf8               ; =248
 465caf4: 96e6ca1d     	bl	0xf368 <_ChromeMain+0xa0cc>
 465caf8: aa0003f6     	mov	x22, x0
 465cafc: 9738a2f9     	bl	0x14856e0 <_ChromeMain+0x1480444>
 465cb00: d004e7a8     	adrp	x8, 0xe352000 <dyld_stub_binder+0xe352000>
 465cb04: 91366108     	add	x8, x8, #0xd98
 465cb08: f9000008     	str	x8, [x0]
 465cb0c: 91036108     	add	x8, x8, #0xd8
 465cb10: f9001408     	str	x8, [x0, #0x28]
 465cb14: 52802008     	mov	w8, #0x100              ; =256
 465cb18: 7901e008     	strh	w8, [x0, #0xf0]
 465cb1c: aa1503e0     	mov	x0, x21
 465cb20: aa1603e1     	mov	x1, x22
 465cb24: 9754b345     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 465cb28: f9428260     	ldr	x0, [x19, #0x500]
 465cb2c: 5280003c     	mov	w28, #0x1               ; =1
 465cb30: d2800281     	mov	x1, #0x14               ; =20
 465cb34: f2c00281     	movk	x1, #0x14, lsl #32
 465cb38: 52800022     	mov	w2, #0x1                ; =1
 465cb3c: 9785d3c9     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 465cb40: f9428268     	ldr	x8, [x19, #0x500]
 465cb44: 9004c729     	adrp	x9, 0xdf40000 <dyld_stub_binder+0xdf40000>
 465cb48: 3dc2a520     	ldr	q0, [x9, #0xa90]
 465cb4c: 3d8013e0     	str	q0, [sp, #0x40]
 465cb50: b0051d41     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465cb54: 91122021     	add	x1, x1, #0x488
 465cb58: 91036100     	add	x0, x8, #0xd8
 465cb5c: 910103e2     	add	x2, sp, #0x40
 465cb60: 975244c0     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 465cb64: f9428276     	ldr	x22, [x19, #0x500]
 465cb68: f8bfc340     	ldapr	x0, [x26]
 465cb6c: b4005a40     	cbz	x0, 0x465d6b4 <_ChromeMain+0x4658418>
 465cb70: 52807001     	mov	w1, #0x380              ; =896
 465cb74: d2800002     	mov	x2, #0x0                ; =0
 465cb78: 96e93a8e     	bl	0xab5b0 <_ChromeMain+0xa6314>
 465cb7c: aa0003f5     	mov	x21, x0
 465cb80: 977741ae     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 465cb84: d00502bb     	adrp	x27, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 465cb88: 912f437b     	add	x27, x27, #0xbd0
 465cb8c: 910fc368     	add	x8, x27, #0x3f0
 465cb90: a900201b     	stp	x27, x8, [x0]
 465cb94: 91106368     	add	x8, x27, #0x418
 465cb98: f9000808     	str	x8, [x0, #0x10]
 465cb9c: 91114368     	add	x8, x27, #0x450
 465cba0: 91120369     	add	x9, x27, #0x480
 465cba4: a906a408     	stp	x8, x9, [x0, #0x68]
 465cba8: 91134368     	add	x8, x27, #0x4d0
 465cbac: f9005808     	str	x8, [x0, #0xb0]
 465cbb0: 9114c368     	add	x8, x27, #0x530
 465cbb4: f9006c08     	str	x8, [x0, #0xd8]
 465cbb8: 91158368     	add	x8, x27, #0x560
 465cbbc: aa0003f7     	mov	x23, x0
 465cbc0: f80f8ee8     	str	x8, [x23, #0xf8]!
 465cbc4: f901a41f     	str	xzr, [x0, #0x348]
 465cbc8: 2f06e400     	movi	d0, #0xffff000000000000
 465cbcc: fd01a800     	str	d0, [x0, #0x350]
 465cbd0: 390d601c     	strb	w28, [x0, #0x358]
 465cbd4: f901b01f     	str	xzr, [x0, #0x360]
 465cbd8: 390da01f     	strb	wzr, [x0, #0x368]
 465cbdc: f901b81f     	str	xzr, [x0, #0x370]
 465cbe0: b903781f     	str	wzr, [x0, #0x378]
 465cbe4: 390df01f     	strb	wzr, [x0, #0x37c]
 465cbe8: 3945a408     	ldrb	w8, [x0, #0x169]
 465cbec: 350055a8     	cbnz	w8, 0x465d6a0 <_ChromeMain+0x4658404>
 465cbf0: f940cec2     	ldr	x2, [x22, #0x198]
 465cbf4: aa1603e0     	mov	x0, x22
 465cbf8: aa1503e1     	mov	x1, x21
 465cbfc: 97047200     	bl	0x7793fc <_ChromeMain+0x774160>
 465cc00: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 465cc04: f9404709     	ldr	x9, [x24, #0x88]
 465cc08: eb09011f     	cmp	x8, x9
 465cc0c: 54000061     	b.ne	0x465cc18 <_ChromeMain+0x465797c>
 465cc10: aa1503e0     	mov	x0, x21
 465cc14: 96e6ddba     	bl	0x142fc <_ChromeMain+0xf060>
 465cc18: f9428660     	ldr	x0, [x19, #0x508]
 465cc1c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465cc20: f9404709     	ldr	x9, [x24, #0x88]
 465cc24: eb09011f     	cmp	x8, x9
 465cc28: 54000041     	b.ne	0x465cc30 <_ChromeMain+0x4657994>
 465cc2c: 96e71784     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465cc30: f9028675     	str	x21, [x19, #0x508]
 465cc34: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 465cc38: 340000c8     	cbz	w8, 0x465cc50 <_ChromeMain+0x46579b4>
 465cc3c: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 465cc40: 9106a6a1     	add	x1, x21, #0x1a9
 465cc44: aa1703e0     	mov	x0, x23
 465cc48: 97232ce2     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465cc4c: f9428675     	ldr	x21, [x19, #0x508]
 465cc50: 910c42a8     	add	x8, x21, #0x310
 465cc54: 394c62a9     	ldrb	w9, [x21, #0x318]
 465cc58: 350059a9     	cbnz	w9, 0x465d78c <_ChromeMain+0x46584f0>
 465cc5c: b4005268     	cbz	x8, 0x465d6a8 <_ChromeMain+0x465840c>
 465cc60: d2800288     	mov	x8, #0x14               ; =20
 465cc64: f2c00288     	movk	x8, #0x14, lsl #32
 465cc68: f9018aa8     	str	x8, [x21, #0x310]
 465cc6c: 52800028     	mov	w8, #0x1                ; =1
 465cc70: 390c62a8     	strb	w8, [x21, #0x318]
 465cc74: f940c6a0     	ldr	x0, [x21, #0x188]
 465cc78: b40000a0     	cbz	x0, 0x465cc8c <_ChromeMain+0x46579f0>
 465cc7c: f9400008     	ldr	x8, [x0]
 465cc80: f9417d08     	ldr	x8, [x8, #0x2f8]
 465cc84: aa1503e1     	mov	x1, x21
 465cc88: d63f0100     	blr	x8
 465cc8c: aa1503e0     	mov	x0, x21
 465cc90: 52800001     	mov	w1, #0x0                ; =0
 465cc94: 96ff4df8     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465cc98: f90023f5     	str	x21, [sp, #0x40]
 465cc9c: 9104c2a0     	add	x0, x21, #0x130
 465cca0: 910103e3     	add	x3, sp, #0x40
 465cca4: 52800301     	mov	w1, #0x18               ; =24
 465cca8: 52800022     	mov	w2, #0x1                ; =1
 465ccac: 97092949     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 465ccb0: aa1503e0     	mov	x0, x21
 465ccb4: 972fe78d     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 465ccb8: f9428660     	ldr	x0, [x19, #0x508]
 465ccbc: d2800281     	mov	x1, #0x14               ; =20
 465ccc0: f2c00281     	movk	x1, #0x14, lsl #32
 465ccc4: 52800022     	mov	w2, #0x1                ; =1
 465ccc8: 9785d366     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 465cccc: f9428276     	ldr	x22, [x19, #0x500]
 465ccd0: f8bfc340     	ldapr	x0, [x26]
 465ccd4: b4004f40     	cbz	x0, 0x465d6bc <_ChromeMain+0x4658420>
 465ccd8: 52806801     	mov	w1, #0x340              ; =832
 465ccdc: d2800002     	mov	x2, #0x0                ; =0
 465cce0: 96e93a34     	bl	0xab5b0 <_ChromeMain+0xa6314>
 465cce4: aa0003f5     	mov	x21, x0
 465cce8: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 465ccec: f90023ff     	str	xzr, [sp, #0x40]
 465ccf0: 97344914     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 465ccf4: f00503e8     	adrp	x8, 0xe6db000 <dyld_stub_binder+0xe6db000>
 465ccf8: 91024108     	add	x8, x8, #0x90
 465ccfc: 910fa109     	add	x9, x8, #0x3e8
 465cd00: a9002408     	stp	x8, x9, [x0]
 465cd04: 91104109     	add	x9, x8, #0x410
 465cd08: f9000809     	str	x9, [x0, #0x10]
 465cd0c: 91112109     	add	x9, x8, #0x448
 465cd10: 9111e10a     	add	x10, x8, #0x478
 465cd14: a906a809     	stp	x9, x10, [x0, #0x68]
 465cd18: 91132109     	add	x9, x8, #0x4c8
 465cd1c: f9005809     	str	x9, [x0, #0xb0]
 465cd20: 9114a109     	add	x9, x8, #0x528
 465cd24: f9006c09     	str	x9, [x0, #0xd8]
 465cd28: 91156108     	add	x8, x8, #0x558
 465cd2c: aa0003f7     	mov	x23, x0
 465cd30: f80f8ee8     	str	x8, [x23, #0xf8]!
 465cd34: 910c4008     	add	x8, x0, #0x310
 465cd38: 910103e0     	add	x0, sp, #0x40
 465cd3c: 97fcaa91     	bl	0x4587780 <_ChromeMain+0x45824e4>
 465cd40: d2800288     	mov	x8, #0x14               ; =20
 465cd44: f2c00188     	movk	x8, #0xc, lsl #32
 465cd48: f90196a8     	str	x8, [x21, #0x328]
 465cd4c: f004c748     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 465cd50: 3dc22d00     	ldr	q0, [x8, #0x8b0]
 465cd54: 3d80cea0     	str	q0, [x21, #0x330]
 465cd58: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 465cd5c: 340000a8     	cbz	w8, 0x465cd70 <_ChromeMain+0x4657ad4>
 465cd60: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 465cd64: 9106a6a1     	add	x1, x21, #0x1a9
 465cd68: aa1703e0     	mov	x0, x23
 465cd6c: 97232c99     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465cd70: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 465cd74: 36f800a8     	tbz	w8, #0x1f, 0x465cd88 <_ChromeMain+0x4657aec>
 465cd78: f94023e0     	ldr	x0, [sp, #0x40]
 465cd7c: f9402be8     	ldr	x8, [sp, #0x50]
 465cd80: d37ff901     	lsl	x1, x8, #1
 465cd84: 96e6b04d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465cd88: 3945a6a8     	ldrb	w8, [x21, #0x169]
 465cd8c: 35004ae8     	cbnz	w8, 0x465d6e8 <_ChromeMain+0x465844c>
 465cd90: f940cec2     	ldr	x2, [x22, #0x198]
 465cd94: aa1603e0     	mov	x0, x22
 465cd98: aa1503e1     	mov	x1, x21
 465cd9c: 97047198     	bl	0x7793fc <_ChromeMain+0x774160>
 465cda0: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 465cda4: f9404709     	ldr	x9, [x24, #0x88]
 465cda8: eb09011f     	cmp	x8, x9
 465cdac: 54000061     	b.ne	0x465cdb8 <_ChromeMain+0x4657b1c>
 465cdb0: aa1503e0     	mov	x0, x21
 465cdb4: 96e6dd52     	bl	0x142fc <_ChromeMain+0xf060>
 465cdb8: f9428a60     	ldr	x0, [x19, #0x510]
 465cdbc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465cdc0: f9404709     	ldr	x9, [x24, #0x88]
 465cdc4: eb09011f     	cmp	x8, x9
 465cdc8: 54000041     	b.ne	0x465cdd0 <_ChromeMain+0x4657b34>
 465cdcc: 96e7171c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465cdd0: f9028a75     	str	x21, [x19, #0x510]
 465cdd4: f94002a8     	ldr	x8, [x21]
 465cdd8: f9405108     	ldr	x8, [x8, #0xa0]
 465cddc: aa1503e0     	mov	x0, x21
 465cde0: 52800001     	mov	w1, #0x0                ; =0
 465cde4: d63f0100     	blr	x8
 465cde8: f8bfc340     	ldapr	x0, [x26]
 465cdec: b40046c0     	cbz	x0, 0x465d6c4 <_ChromeMain+0x4658428>
 465cdf0: 52808c01     	mov	w1, #0x460              ; =1120
 465cdf4: d2800002     	mov	x2, #0x0                ; =0
 465cdf8: 96e939ee     	bl	0xab5b0 <_ChromeMain+0xa6314>
 465cdfc: aa0003f5     	mov	x21, x0
 465ce00: d2800001     	mov	x1, #0x0                ; =0
 465ce04: d2800002     	mov	x2, #0x0                ; =0
 465ce08: 528000a3     	mov	w3, #0x5                ; =5
 465ce0c: 52820004     	mov	w4, #0x1000             ; =4096
 465ce10: 52800005     	mov	w5, #0x0                ; =0
 465ce14: 9754b6b3     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 465ce18: 3945a408     	ldrb	w8, [x0, #0x169]
 465ce1c: 350046c8     	cbnz	w8, 0x465d6f4 <_ChromeMain+0x4658458>
 465ce20: f940ce62     	ldr	x2, [x19, #0x198]
 465ce24: aa1303e0     	mov	x0, x19
 465ce28: aa1503e1     	mov	x1, x21
 465ce2c: 97047174     	bl	0x7793fc <_ChromeMain+0x774160>
 465ce30: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 465ce34: f9404709     	ldr	x9, [x24, #0x88]
 465ce38: eb09011f     	cmp	x8, x9
 465ce3c: 54000061     	b.ne	0x465ce48 <_ChromeMain+0x4657bac>
 465ce40: aa1503e0     	mov	x0, x21
 465ce44: 96e6dd2e     	bl	0x142fc <_ChromeMain+0xf060>
 465ce48: f9428e60     	ldr	x0, [x19, #0x518]
 465ce4c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465ce50: f9404709     	ldr	x9, [x24, #0x88]
 465ce54: eb09011f     	cmp	x8, x9
 465ce58: 54000041     	b.ne	0x465ce60 <_ChromeMain+0x4657bc4>
 465ce5c: 96e716f8     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465ce60: f9028e75     	str	x21, [x19, #0x518]
 465ce64: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 465ce68: 340000c8     	cbz	w8, 0x465ce80 <_ChromeMain+0x4657be4>
 465ce6c: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 465ce70: 9103e2a0     	add	x0, x21, #0xf8
 465ce74: 9106a6a1     	add	x1, x21, #0x1a9
 465ce78: 97232c56     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465ce7c: f9428e75     	ldr	x21, [x19, #0x518]
 465ce80: aa1503e0     	mov	x0, x21
 465ce84: 52800061     	mov	w1, #0x3                ; =3
 465ce88: 9754b39e     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 465ce8c: f9428e60     	ldr	x0, [x19, #0x518]
 465ce90: 528000c1     	mov	w1, #0x6                ; =6
 465ce94: 96fd0fab     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 465ce98: f9428e75     	ldr	x21, [x19, #0x518]
 465ce9c: 394f62a8     	ldrb	w8, [x21, #0x3d8]
 465cea0: 34000108     	cbz	w8, 0x465cec0 <_ChromeMain+0x4657c24>
 465cea4: 390f62bf     	strb	wzr, [x21, #0x3d8]
 465cea8: aa1503e0     	mov	x0, x21
 465ceac: 96fd1a64     	bl	0x5a383c <_ChromeMain+0x59e5a0>
 465ceb0: 9103e2a0     	add	x0, x21, #0xf8
 465ceb4: 910f62a1     	add	x1, x21, #0x3d8
 465ceb8: 97232c46     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465cebc: f9428e75     	ldr	x21, [x19, #0x518]
 465cec0: 394edaa8     	ldrb	w8, [x21, #0x3b6]
 465cec4: 35003848     	cbnz	w8, 0x465d5cc <_ChromeMain+0x4658330>
 465cec8: aa1503e0     	mov	x0, x21
 465cecc: 52800001     	mov	w1, #0x0                ; =0
 465ced0: 97838928     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 465ced4: f9428e60     	ldr	x0, [x19, #0x518]
 465ced8: b81983bf     	stur	wzr, [x29, #-0x68]
 465cedc: 52800028     	mov	w8, #0x1                ; =1
 465cee0: 3819c3a8     	sturb	w8, [x29, #-0x64]
 465cee4: d101a3a1     	sub	x1, x29, #0x68
 465cee8: 9707ae02     	bl	0x8486f0 <_ChromeMain+0x843454>
 465ceec: f9428e75     	ldr	x21, [x19, #0x518]
 465cef0: f941aeb7     	ldr	x23, [x21, #0x358]
 465cef4: f94026f6     	ldr	x22, [x23, #0x48]
 465cef8: b94046c8     	ldr	w8, [x22, #0x44]
 465cefc: 3100051f     	cmn	w8, #0x1
 465cf00: 54004560     	b.eq	0x465d7ac <_ChromeMain+0x4658510>
 465cf04: 528001c9     	mov	w9, #0xe                ; =14
 465cf08: 4b080121     	sub	w1, w9, w8
 465cf0c: aa1603e0     	mov	x0, x22
 465cf10: 52800002     	mov	w2, #0x0                ; =0
 465cf14: 52803e83     	mov	w3, #0x1f4              ; =500
 465cf18: 975929da     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 465cf1c: f90023e0     	str	x0, [sp, #0x40]
 465cf20: b40000a0     	cbz	x0, 0x465cf34 <_ChromeMain+0x4657c98>
 465cf24: b9400008     	ldr	w8, [x0]
 465cf28: 31000508     	adds	w8, w8, #0x1
 465cf2c: b9000008     	str	w8, [x0]
 465cf30: 54003e82     	b.hs	0x465d700 <_ChromeMain+0x4658464>
 465cf34: f94002a8     	ldr	x8, [x21]
 465cf38: f941ed08     	ldr	x8, [x8, #0x3d8]
 465cf3c: 910103f6     	add	x22, sp, #0x40
 465cf40: 910103e1     	add	x1, sp, #0x40
 465cf44: aa1503e0     	mov	x0, x21
 465cf48: d63f0100     	blr	x8
 465cf4c: f94023e0     	ldr	x0, [sp, #0x40]
 465cf50: b40000c0     	cbz	x0, 0x465cf68 <_ChromeMain+0x4657ccc>
 465cf54: b9400009     	ldr	w9, [x0]
 465cf58: 51000528     	sub	w8, w9, #0x1
 465cf5c: b9000008     	str	w8, [x0]
 465cf60: 34003d69     	cbz	w9, 0x465d70c <_ChromeMain+0x4658470>
 465cf64: 34003028     	cbz	w8, 0x465d568 <_ChromeMain+0x46582cc>
 465cf68: f9428e75     	ldr	x21, [x19, #0x518]
 465cf6c: 52800800     	mov	w0, #0x40               ; =64
 465cf70: 96e6c8fe     	bl	0xf368 <_ChromeMain+0xa0cc>
 465cf74: 52800028     	mov	w8, #0x1                ; =1
 465cf78: b9000008     	str	w8, [x0]
 465cf7c: f0fe4e49     	adrp	x9, 0x1027000 <_ChromeMain+0x1021d64>
 465cf80: 91260129     	add	x9, x9, #0x980
 465cf84: d0fde4aa     	adrp	x10, 0x2f2000 <_ChromeMain+0x2ecd64>
 465cf88: 9122014a     	add	x10, x10, #0x880
 465cf8c: a900a809     	stp	x9, x10, [x0, #0x8]
 465cf90: d0ffa649     	adrp	x9, 0x3b26000 <_ChromeMain+0x3b20d64>
 465cf94: 91310129     	add	x9, x9, #0xc40
 465cf98: a901a419     	stp	x25, x9, [x0, #0x18]
 465cf9c: a902fc1f     	stp	xzr, xzr, [x0, #0x28]
 465cfa0: 3900e01f     	strb	wzr, [x0, #0x38]
 465cfa4: f9000be0     	str	x0, [sp, #0x10]
 465cfa8: 0f000420     	movi.2s	v0, #0x1
 465cfac: fd000fe0     	str	d0, [sp, #0x18]
 465cfb0: 52800069     	mov	w9, #0x3                ; =3
 465cfb4: b90023e9     	str	w9, [sp, #0x20]
 465cfb8: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 465cfbc: f90017ff     	str	xzr, [sp, #0x28]
 465cfc0: f9002bff     	str	xzr, [sp, #0x50]
 465cfc4: f90023e0     	str	x0, [sp, #0x40]
 465cfc8: b5002e20     	cbnz	x0, 0x465d58c <_ChromeMain+0x46582f0>
 465cfcc: 910043e8     	add	x8, sp, #0x10
 465cfd0: f8408109     	ldur	x9, [x8, #0x8]
 465cfd4: f80082c9     	stur	x9, [x22, #0x8]
 465cfd8: b8410108     	ldur	w8, [x8, #0x10]
 465cfdc: b80102c8     	stur	w8, [x22, #0x10]
 465cfe0: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 465cfe4: f9002fff     	str	xzr, [sp, #0x58]
 465cfe8: 52800048     	mov	w8, #0x2                ; =2
 465cfec: b9004be8     	str	w8, [sp, #0x48]
 465cff0: b0051d41     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465cff4: 91152021     	add	x1, x1, #0x548
 465cff8: 910362a0     	add	x0, x21, #0xd8
 465cffc: 910103e2     	add	x2, sp, #0x40
 465d000: 9756dce3     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 465d004: 910103e0     	add	x0, sp, #0x40
 465d008: 9743b747     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 465d00c: 910043e0     	add	x0, sp, #0x10
 465d010: 9743b745     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 465d014: f9428e68     	ldr	x8, [x19, #0x518]
 465d018: f004c729     	adrp	x9, 0xdf44000 <dyld_stub_binder+0xdf44000>
 465d01c: 3dc1fd20     	ldr	q0, [x9, #0x7f0]
 465d020: 3d8003e0     	str	q0, [sp]
 465d024: 3d8013e0     	str	q0, [sp, #0x40]
 465d028: 90051d41     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465d02c: 91122021     	add	x1, x1, #0x488
 465d030: 91036100     	add	x0, x8, #0xd8
 465d034: 910103e2     	add	x2, sp, #0x40
 465d038: 9752438a     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 465d03c: f8bfc340     	ldapr	x0, [x26]
 465d040: b4003460     	cbz	x0, 0x465d6cc <_ChromeMain+0x4658430>
 465d044: 52808c01     	mov	w1, #0x460              ; =1120
 465d048: d2800002     	mov	x2, #0x0                ; =0
 465d04c: 96e93959     	bl	0xab5b0 <_ChromeMain+0xa6314>
 465d050: aa0003f5     	mov	x21, x0
 465d054: d004c941     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 465d058: 913a9021     	add	x1, x1, #0xea4
 465d05c: 528000c2     	mov	w2, #0x6                ; =6
 465d060: 528000a3     	mov	w3, #0x5                ; =5
 465d064: 52820004     	mov	w4, #0x1000             ; =4096
 465d068: 52800005     	mov	w5, #0x0                ; =0
 465d06c: 9754b61d     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 465d070: 3945a408     	ldrb	w8, [x0, #0x169]
 465d074: 35003528     	cbnz	w8, 0x465d718 <_ChromeMain+0x465847c>
 465d078: f940ce62     	ldr	x2, [x19, #0x198]
 465d07c: aa1303e0     	mov	x0, x19
 465d080: aa1503e1     	mov	x1, x21
 465d084: 970470de     	bl	0x7793fc <_ChromeMain+0x774160>
 465d088: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 465d08c: f9404709     	ldr	x9, [x24, #0x88]
 465d090: eb09011f     	cmp	x8, x9
 465d094: 54000061     	b.ne	0x465d0a0 <_ChromeMain+0x4657e04>
 465d098: aa1503e0     	mov	x0, x21
 465d09c: 96e6dc98     	bl	0x142fc <_ChromeMain+0xf060>
 465d0a0: f9429260     	ldr	x0, [x19, #0x520]
 465d0a4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465d0a8: f9404709     	ldr	x9, [x24, #0x88]
 465d0ac: eb09011f     	cmp	x8, x9
 465d0b0: 54000041     	b.ne	0x465d0b8 <_ChromeMain+0x4657e1c>
 465d0b4: 96e71662     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465d0b8: f9029275     	str	x21, [x19, #0x520]
 465d0bc: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 465d0c0: 340000c8     	cbz	w8, 0x465d0d8 <_ChromeMain+0x4657e3c>
 465d0c4: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 465d0c8: 9103e2a0     	add	x0, x21, #0xf8
 465d0cc: 9106a6a1     	add	x1, x21, #0x1a9
 465d0d0: 97232bc0     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465d0d4: f9429275     	ldr	x21, [x19, #0x520]
 465d0d8: aa1503e0     	mov	x0, x21
 465d0dc: 52800021     	mov	w1, #0x1                ; =1
 465d0e0: 9754b308     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 465d0e4: f9429260     	ldr	x0, [x19, #0x520]
 465d0e8: 52800001     	mov	w1, #0x0                ; =0
 465d0ec: 96fd0f15     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 465d0f0: f9429275     	ldr	x21, [x19, #0x520]
 465d0f4: 394edaa8     	ldrb	w8, [x21, #0x3b6]
 465d0f8: 35002808     	cbnz	w8, 0x465d5f8 <_ChromeMain+0x465835c>
 465d0fc: aa1503e0     	mov	x0, x21
 465d100: 52800001     	mov	w1, #0x0                ; =0
 465d104: 9783889b     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 465d108: f9429275     	ldr	x21, [x19, #0x520]
 465d10c: f941aeb7     	ldr	x23, [x21, #0x358]
 465d110: f94026f6     	ldr	x22, [x23, #0x48]
 465d114: b94046c8     	ldr	w8, [x22, #0x44]
 465d118: 3100051f     	cmn	w8, #0x1
 465d11c: 54003520     	b.eq	0x465d7c0 <_ChromeMain+0x4658524>
 465d120: 52800149     	mov	w9, #0xa                ; =10
 465d124: 4b080121     	sub	w1, w9, w8
 465d128: aa1603e0     	mov	x0, x22
 465d12c: 52800002     	mov	w2, #0x0                ; =0
 465d130: 52803e83     	mov	w3, #0x1f4              ; =500
 465d134: 97592953     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 465d138: f90023e0     	str	x0, [sp, #0x40]
 465d13c: b40000a0     	cbz	x0, 0x465d150 <_ChromeMain+0x4657eb4>
 465d140: b9400008     	ldr	w8, [x0]
 465d144: 31000508     	adds	w8, w8, #0x1
 465d148: b9000008     	str	w8, [x0]
 465d14c: 54002ec2     	b.hs	0x465d724 <_ChromeMain+0x4658488>
 465d150: f94002a8     	ldr	x8, [x21]
 465d154: f941ed08     	ldr	x8, [x8, #0x3d8]
 465d158: 910103e1     	add	x1, sp, #0x40
 465d15c: aa1503e0     	mov	x0, x21
 465d160: d63f0100     	blr	x8
 465d164: f94023e0     	ldr	x0, [sp, #0x40]
 465d168: b40000c0     	cbz	x0, 0x465d180 <_ChromeMain+0x4657ee4>
 465d16c: b9400009     	ldr	w9, [x0]
 465d170: 51000528     	sub	w8, w9, #0x1
 465d174: b9000008     	str	w8, [x0]
 465d178: 34002dc9     	cbz	w9, 0x465d730 <_ChromeMain+0x4658494>
 465d17c: 34001ee8     	cbz	w8, 0x465d558 <_ChromeMain+0x46582bc>
 465d180: f9429275     	ldr	x21, [x19, #0x520]
 465d184: 52800400     	mov	w0, #0x20               ; =32
 465d188: 96e6c878     	bl	0xf368 <_ChromeMain+0xa0cc>
 465d18c: aa0003e1     	mov	x1, x0
 465d190: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 465d194: b9000808     	str	w8, [x0, #0x8]
 465d198: 52800037     	mov	w23, #0x1               ; =1
 465d19c: 39003017     	strb	w23, [x0, #0xc]
 465d1a0: f004e768     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 465d1a4: 91044108     	add	x8, x8, #0x110
 465d1a8: f9000008     	str	x8, [x0]
 465d1ac: d2c000a8     	mov	x8, #0x500000000        ; =21474836480
 465d1b0: 4e080d00     	dup.2d	v0, x8
 465d1b4: 3d800400     	str	q0, [x0, #0x10]
 465d1b8: f94002a8     	ldr	x8, [x21]
 465d1bc: f9408908     	ldr	x8, [x8, #0x110]
 465d1c0: aa1503e0     	mov	x0, x21
 465d1c4: d63f0100     	blr	x8
 465d1c8: f9429275     	ldr	x21, [x19, #0x520]
 465d1cc: 52801ae8     	mov	w8, #0xd7               ; =215
 465d1d0: b90013e8     	str	w8, [sp, #0x10]
 465d1d4: 390053ff     	strb	wzr, [sp, #0x14]
 465d1d8: 910043e0     	add	x0, sp, #0x10
 465d1dc: 1e231000     	fmov	s0, #6.00000000
 465d1e0: 52800001     	mov	w1, #0x0                ; =0
 465d1e4: 978407b7     	bl	0x275f0c0 <_ChromeMain+0x2759e24>
 465d1e8: aa0003e1     	mov	x1, x0
 465d1ec: aa1503e0     	mov	x0, x21
 465d1f0: 97232a04     	bl	0xf27a00 <_ChromeMain+0xf22764>
 465d1f4: f9429268     	ldr	x8, [x19, #0x520]
 465d1f8: 3dc003e0     	ldr	q0, [sp]
 465d1fc: 3d8013e0     	str	q0, [sp, #0x40]
 465d200: 90051d41     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465d204: 91122021     	add	x1, x1, #0x488
 465d208: 91036100     	add	x0, x8, #0xd8
 465d20c: 910103e2     	add	x2, sp, #0x40
 465d210: 97524314     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 465d214: f9429260     	ldr	x0, [x19, #0x520]
 465d218: f9400008     	ldr	x8, [x0]
 465d21c: f9405108     	ldr	x8, [x8, #0xa0]
 465d220: 52800001     	mov	w1, #0x0                ; =0
 465d224: d63f0100     	blr	x8
 465d228: f8bfc340     	ldapr	x0, [x26]
 465d22c: b4002540     	cbz	x0, 0x465d6d4 <_ChromeMain+0x4658438>
 465d230: 52807001     	mov	w1, #0x380              ; =896
 465d234: d2800002     	mov	x2, #0x0                ; =0
 465d238: 96e938de     	bl	0xab5b0 <_ChromeMain+0xa6314>
 465d23c: aa0003f5     	mov	x21, x0
 465d240: 97773ffe     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 465d244: 910fc368     	add	x8, x27, #0x3f0
 465d248: a900201b     	stp	x27, x8, [x0]
 465d24c: 91106368     	add	x8, x27, #0x418
 465d250: f9000808     	str	x8, [x0, #0x10]
 465d254: 91114368     	add	x8, x27, #0x450
 465d258: 91120369     	add	x9, x27, #0x480
 465d25c: a906a408     	stp	x8, x9, [x0, #0x68]
 465d260: 91134368     	add	x8, x27, #0x4d0
 465d264: f9005808     	str	x8, [x0, #0xb0]
 465d268: 9114c368     	add	x8, x27, #0x530
 465d26c: f9006c08     	str	x8, [x0, #0xd8]
 465d270: 91158368     	add	x8, x27, #0x560
 465d274: aa0003f6     	mov	x22, x0
 465d278: f80f8ec8     	str	x8, [x22, #0xf8]!
 465d27c: f901a41f     	str	xzr, [x0, #0x348]
 465d280: 2f06e400     	movi	d0, #0xffff000000000000
 465d284: fd01a800     	str	d0, [x0, #0x350]
 465d288: 390d6017     	strb	w23, [x0, #0x358]
 465d28c: f901b01f     	str	xzr, [x0, #0x360]
 465d290: 390da01f     	strb	wzr, [x0, #0x368]
 465d294: f901b81f     	str	xzr, [x0, #0x370]
 465d298: b903781f     	str	wzr, [x0, #0x378]
 465d29c: 390df01f     	strb	wzr, [x0, #0x37c]
 465d2a0: 3945a408     	ldrb	w8, [x0, #0x169]
 465d2a4: 350024c8     	cbnz	w8, 0x465d73c <_ChromeMain+0x46584a0>
 465d2a8: f940ce62     	ldr	x2, [x19, #0x198]
 465d2ac: aa1303e0     	mov	x0, x19
 465d2b0: aa1503e1     	mov	x1, x21
 465d2b4: 97047052     	bl	0x7793fc <_ChromeMain+0x774160>
 465d2b8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 465d2bc: f9404709     	ldr	x9, [x24, #0x88]
 465d2c0: eb09011f     	cmp	x8, x9
 465d2c4: 54000061     	b.ne	0x465d2d0 <_ChromeMain+0x4658034>
 465d2c8: aa1503e0     	mov	x0, x21
 465d2cc: 96e6dc0c     	bl	0x142fc <_ChromeMain+0xf060>
 465d2d0: f9429660     	ldr	x0, [x19, #0x528]
 465d2d4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465d2d8: f9404709     	ldr	x9, [x24, #0x88]
 465d2dc: eb09011f     	cmp	x8, x9
 465d2e0: 54000041     	b.ne	0x465d2e8 <_ChromeMain+0x465804c>
 465d2e4: 96e715d6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465d2e8: f9029675     	str	x21, [x19, #0x528]
 465d2ec: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 465d2f0: 340000c8     	cbz	w8, 0x465d308 <_ChromeMain+0x465806c>
 465d2f4: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 465d2f8: 9106a6a1     	add	x1, x21, #0x1a9
 465d2fc: aa1603e0     	mov	x0, x22
 465d300: 97232b34     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465d304: f9429675     	ldr	x21, [x19, #0x528]
 465d308: 910c42a8     	add	x8, x21, #0x310
 465d30c: 394c62a9     	ldrb	w9, [x21, #0x318]
 465d310: 350021c9     	cbnz	w9, 0x465d748 <_ChromeMain+0x46584ac>
 465d314: b4001ca8     	cbz	x8, 0x465d6a8 <_ChromeMain+0x465840c>
 465d318: b21e07e8     	mov	x8, #0xc0000000c        ; =51539607564
 465d31c: f9018aa8     	str	x8, [x21, #0x310]
 465d320: 52800028     	mov	w8, #0x1                ; =1
 465d324: 390c62a8     	strb	w8, [x21, #0x318]
 465d328: f940c6a0     	ldr	x0, [x21, #0x188]
 465d32c: b40000a0     	cbz	x0, 0x465d340 <_ChromeMain+0x46580a4>
 465d330: f9400008     	ldr	x8, [x0]
 465d334: f9417d08     	ldr	x8, [x8, #0x2f8]
 465d338: aa1503e1     	mov	x1, x21
 465d33c: d63f0100     	blr	x8
 465d340: aa1503e0     	mov	x0, x21
 465d344: 52800001     	mov	w1, #0x0                ; =0
 465d348: 96ff4c4b     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465d34c: f90023f5     	str	x21, [sp, #0x40]
 465d350: 9104c2a0     	add	x0, x21, #0x130
 465d354: 910103e3     	add	x3, sp, #0x40
 465d358: 52800301     	mov	w1, #0x18               ; =24
 465d35c: 52800022     	mov	w2, #0x1                ; =1
 465d360: 9709279c     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 465d364: aa1503e0     	mov	x0, x21
 465d368: 972fe5e0     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 465d36c: f9429660     	ldr	x0, [x19, #0x528]
 465d370: b21e07e1     	mov	x1, #0xc0000000c        ; =51539607564
 465d374: 52800022     	mov	w2, #0x1                ; =1
 465d378: 9785d1ba     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 465d37c: 52800600     	mov	w0, #0x30               ; =48
 465d380: 96e6c7fa     	bl	0xf368 <_ChromeMain+0xa0cc>
 465d384: aa0003e4     	mov	x4, x0
 465d388: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 465d38c: 7900301f     	strh	wzr, [x0, #0x18]
 465d390: b004e795     	adrp	x21, 0xe34e000 <dyld_stub_binder+0xe34e000>
 465d394: 913622b5     	add	x21, x21, #0xd88
 465d398: f9000015     	str	x21, [x0]
 465d39c: 4f026420     	movi.4s	v0, #0x41, lsl #24
 465d3a0: 3c81c000     	stur	q0, [x0, #0x1c]
 465d3a4: 90051d41     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465d3a8: 9114a021     	add	x1, x1, #0x528
 465d3ac: 9004b742     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 465d3b0: 91264842     	add	x2, x2, #0x992
 465d3b4: f0ff4063     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 465d3b8: 913c0063     	add	x3, x3, #0xf00
 465d3bc: aa1403e0     	mov	x0, x20
 465d3c0: d2800005     	mov	x5, #0x0                ; =0
 465d3c4: 97143376     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 465d3c8: b5000c00     	cbnz	x0, 0x465d548 <_ChromeMain+0x46582ac>
 465d3cc: aa1303e0     	mov	x0, x19
 465d3d0: 9734469c     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 465d3d4: aa1303e9     	mov	x9, x19
 465d3d8: f84e8d28     	ldr	x8, [x9, #0xe8]!
 465d3dc: b4000128     	cbz	x8, 0x465d400 <_ChromeMain+0x4658164>
 465d3e0: f0051d2a     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 465d3e4: 9132c14a     	add	x10, x10, #0xcb0
 465d3e8: f940110b     	ldr	x11, [x8, #0x20]
 465d3ec: eb0a017f     	cmp	x11, x10
 465d3f0: 54000528     	b.hi	0x465d494 <_ChromeMain+0x46581f8>
 465d3f4: 54000482     	b.hs	0x465d484 <_ChromeMain+0x46581e8>
 465d3f8: f9400508     	ldr	x8, [x8, #0x8]
 465d3fc: b5ffff68     	cbnz	x8, 0x465d3e8 <_ChromeMain+0x465814c>
 465d400: d2800014     	mov	x20, #0x0               ; =0
 465d404: 52800600     	mov	w0, #0x30               ; =48
 465d408: 96e6c7d8     	bl	0xf368 <_ChromeMain+0xa0cc>
 465d40c: aa0003e8     	mov	x8, x0
 465d410: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 465d414: 7900301f     	strh	wzr, [x0, #0x18]
 465d418: f9000015     	str	x21, [x0]
 465d41c: 4f026420     	movi.4s	v0, #0x41, lsl #24
 465d420: 3c81c000     	stur	q0, [x0, #0x1c]
 465d424: f9418e80     	ldr	x0, [x20, #0x318]
 465d428: f9018e88     	str	x8, [x20, #0x318]
 465d42c: b5001b80     	cbnz	x0, 0x465d79c <_ChromeMain+0x4658500>
 465d430: aa1403e0     	mov	x0, x20
 465d434: 52800001     	mov	w1, #0x0                ; =0
 465d438: 96ff4c0f     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465d43c: aa1403e0     	mov	x0, x20
 465d440: 96fd0f4f     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465d444: aa1303e0     	mov	x0, x19
 465d448: 9400019c     	bl	0x465dab8 <_ChromeMain+0x465881c>
 465d44c: aa1303e0     	mov	x0, x19
 465d450: 9400026c     	bl	0x465de00 <_ChromeMain+0x4658b64>
 465d454: b943be68     	ldr	w8, [x19, #0x3bc]
 465d458: 51000508     	sub	w8, w8, #0x1
 465d45c: 7100051f     	cmp	w8, #0x1
 465d460: 54000209     	b.ls	0x465d4a0 <_ChromeMain+0x4658204>
 465d464: 52800200     	mov	w0, #0x10               ; =16
 465d468: 96e6c7c0     	bl	0xf368 <_ChromeMain+0xa0cc>
 465d46c: aa0003e1     	mov	x1, x0
 465d470: d004e768     	adrp	x8, 0xe34b000 <dyld_stub_binder+0xe34b000>
 465d474: 913c0108     	add	x8, x8, #0xf00
 465d478: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 465d47c: a9002408     	stp	x8, x9, [x0]
 465d480: 14000010     	b	0x465d4c0 <_ChromeMain+0x4658224>
 465d484: eb09011f     	cmp	x8, x9
 465d488: 54fffbc0     	b.eq	0x465d400 <_ChromeMain+0x4658164>
 465d48c: f9401914     	ldr	x20, [x8, #0x30]
 465d490: 17ffffdd     	b	0x465d404 <_ChromeMain+0x4658168>
 465d494: f9400108     	ldr	x8, [x8]
 465d498: b5fffa88     	cbnz	x8, 0x465d3e8 <_ChromeMain+0x465814c>
 465d49c: 17ffffd9     	b	0x465d400 <_ChromeMain+0x4658164>
 465d4a0: 52801ee8     	mov	w8, #0xf7               ; =247
 465d4a4: b90043e8     	str	w8, [sp, #0x40]
 465d4a8: 390113ff     	strb	wzr, [sp, #0x44]
 465d4ac: 910103e0     	add	x0, sp, #0x40
 465d4b0: 1e241000     	fmov	s0, #8.00000000
 465d4b4: 52800001     	mov	w1, #0x0                ; =0
 465d4b8: 97840702     	bl	0x275f0c0 <_ChromeMain+0x2759e24>
 465d4bc: aa0003e1     	mov	x1, x0
 465d4c0: aa1303e0     	mov	x0, x19
 465d4c4: 9723294f     	bl	0xf27a00 <_ChromeMain+0xf22764>
 465d4c8: b0054448     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 465d4cc: f9467d00     	ldr	x0, [x8, #0xcf8]
 465d4d0: 974f09aa     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 465d4d4: b4000240     	cbz	x0, 0x465d51c <_ChromeMain+0x4658280>
 465d4d8: 974f09ce     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 465d4dc: aa0003f4     	mov	x20, x0
 465d4e0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465d4e4: f9404709     	ldr	x9, [x24, #0x88]
 465d4e8: eb09011f     	cmp	x8, x9
 465d4ec: 54000061     	b.ne	0x465d4f8 <_ChromeMain+0x465825c>
 465d4f0: aa1403e0     	mov	x0, x20
 465d4f4: 96e6db82     	bl	0x142fc <_ChromeMain+0xf060>
 465d4f8: f942d260     	ldr	x0, [x19, #0x5a0]
 465d4fc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465d500: f9404709     	ldr	x9, [x24, #0x88]
 465d504: eb09011f     	cmp	x8, x9
 465d508: 540013e0     	b.eq	0x465d784 <_ChromeMain+0x46584e8>
 465d50c: f902d274     	str	x20, [x19, #0x5a0]
 465d510: f942ce61     	ldr	x1, [x19, #0x598]
 465d514: 91006280     	add	x0, x20, #0x18
 465d518: 9739995e     	bl	0x14c3a90 <_ChromeMain+0x14be7f4>
 465d51c: aa1303e0     	mov	x0, x19
 465d520: 94000290     	bl	0x465df60 <_ChromeMain+0x4658cc4>
 465d524: aa1303e0     	mov	x0, x19
 465d528: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 465d52c: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 465d530: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 465d534: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 465d538: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 465d53c: a9496ffc     	ldp	x28, x27, [sp, #0x90]
 465d540: 9103c3ff     	add	sp, sp, #0xf0
 465d544: d65f03c0     	ret
 465d548: f9400008     	ldr	x8, [x0]
 465d54c: f9400508     	ldr	x8, [x8, #0x8]
 465d550: d63f0100     	blr	x8
 465d554: 17ffff9e     	b	0x465d3cc <_ChromeMain+0x4658130>
 465d558: 972bbc9b     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 465d55c: 52800a01     	mov	w1, #0x50               ; =80
 465d560: 96e6ae56     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d564: 17ffff07     	b	0x465d180 <_ChromeMain+0x4657ee4>
 465d568: 972bbc97     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 465d56c: 52800a01     	mov	w1, #0x50               ; =80
 465d570: 96e6ae52     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d574: 17fffe7d     	b	0x465cf68 <_ChromeMain+0x4657ccc>
 465d578: b900f2bf     	str	wzr, [x21, #0xf0]
 465d57c: aa1503e0     	mov	x0, x21
 465d580: 52800021     	mov	w1, #0x1                ; =1
 465d584: 97501f4b     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 465d588: 17fffd30     	b	0x465ca48 <_ChromeMain+0x46577ac>
 465d58c: b8280008     	ldadd	w8, w8, [x0]
 465d590: 7100011f     	cmp	w8, #0x0
 465d594: 5400120d     	b.le	0x465d7d4 <_ChromeMain+0x4658538>
 465d598: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 465d59c: 6b09011f     	cmp	w8, w9
 465d5a0: 54ffd161     	b.ne	0x465cfcc <_ChromeMain+0x4657d30>
 465d5a4: d4200000     	brk	#0
 465d5a8: d4400000     	hlt	#0
 465d5ac: d4200020     	brk	#0x1
 465d5b0: 12800008     	mov	w8, #-0x1               ; =-1
 465d5b4: b8e80008     	ldaddal	w8, w8, [x0]
 465d5b8: 7100051f     	cmp	w8, #0x1
 465d5bc: 54ff8aa1     	b.ne	0x465c710 <_ChromeMain+0x4657474>
 465d5c0: f9400808     	ldr	x8, [x0, #0x10]
 465d5c4: d63f0100     	blr	x8
 465d5c8: 17fffc52     	b	0x465c710 <_ChromeMain+0x4657474>
 465d5cc: 390edabf     	strb	wzr, [x21, #0x3b6]
 465d5d0: aa1503e0     	mov	x0, x21
 465d5d4: 97232b4d     	bl	0xf28308 <_ChromeMain+0xf2306c>
 465d5d8: aa1503e0     	mov	x0, x21
 465d5dc: 52800041     	mov	w1, #0x2                ; =2
 465d5e0: 970610e1     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 465d5e4: 9103e2a0     	add	x0, x21, #0xf8
 465d5e8: 910edaa1     	add	x1, x21, #0x3b6
 465d5ec: 97232a79     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465d5f0: f9428e75     	ldr	x21, [x19, #0x518]
 465d5f4: 17fffe35     	b	0x465cec8 <_ChromeMain+0x4657c2c>
 465d5f8: 390edabf     	strb	wzr, [x21, #0x3b6]
 465d5fc: aa1503e0     	mov	x0, x21
 465d600: 97232b42     	bl	0xf28308 <_ChromeMain+0xf2306c>
 465d604: aa1503e0     	mov	x0, x21
 465d608: 52800041     	mov	w1, #0x2                ; =2
 465d60c: 970610d6     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 465d610: 9103e2a0     	add	x0, x21, #0xf8
 465d614: 910edaa1     	add	x1, x21, #0x3b6
 465d618: 97232a6e     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465d61c: f9429275     	ldr	x21, [x19, #0x520]
 465d620: 17fffeb7     	b	0x465d0fc <_ChromeMain+0x4657e60>
 465d624: 12800008     	mov	w8, #-0x1               ; =-1
 465d628: b8e802c8     	ldaddal	w8, w8, [x22]
 465d62c: 7100051f     	cmp	w8, #0x1
 465d630: 54ff9ca1     	b.ne	0x465c9c4 <_ChromeMain+0x4657728>
 465d634: f9400ac8     	ldr	x8, [x22, #0x10]
 465d638: 90fe4a49     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 465d63c: 91190129     	add	x9, x9, #0x640
 465d640: eb09011f     	cmp	x8, x9
 465d644: 54000140     	b.eq	0x465d66c <_ChromeMain+0x46583d0>
 465d648: f0ff9869     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 465d64c: 91180129     	add	x9, x9, #0x600
 465d650: aa1603e0     	mov	x0, x22
 465d654: eb09011f     	cmp	x8, x9
 465d658: 54000060     	b.eq	0x465d664 <_ChromeMain+0x46583c8>
 465d65c: d63f0100     	blr	x8
 465d660: 17fffcd9     	b	0x465c9c4 <_ChromeMain+0x4657728>
 465d664: 52800701     	mov	w1, #0x38               ; =56
 465d668: 14000005     	b	0x465d67c <_ChromeMain+0x46583e0>
 465d66c: f9401ac0     	ldr	x0, [x22, #0x30]
 465d670: b50000a0     	cbnz	x0, 0x465d684 <_ChromeMain+0x46583e8>
 465d674: aa1603e0     	mov	x0, x22
 465d678: 52800901     	mov	w1, #0x48               ; =72
 465d67c: 96e6ae0f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d680: 17fffcd1     	b	0x465c9c4 <_ChromeMain+0x4657728>
 465d684: 12800008     	mov	w8, #-0x1               ; =-1
 465d688: b8e80008     	ldaddal	w8, w8, [x0]
 465d68c: 7100051f     	cmp	w8, #0x1
 465d690: 54ffff21     	b.ne	0x465d674 <_ChromeMain+0x46583d8>
 465d694: 52800101     	mov	w1, #0x8                ; =8
 465d698: 96e6ae08     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d69c: 17fffff6     	b	0x465d674 <_ChromeMain+0x46583d8>
 465d6a0: d4200000     	brk	#0
 465d6a4: d4400000     	hlt	#0
 465d6a8: d4200020     	brk	#0x1
 465d6ac: 97f1d813     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6b0: 17fffcf1     	b	0x465ca74 <_ChromeMain+0x46577d8>
 465d6b4: 97f1d811     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6b8: 17fffd2e     	b	0x465cb70 <_ChromeMain+0x46578d4>
 465d6bc: 97f1d80f     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6c0: 17fffd86     	b	0x465ccd8 <_ChromeMain+0x4657a3c>
 465d6c4: 97f1d80d     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6c8: 17fffdca     	b	0x465cdf0 <_ChromeMain+0x4657b54>
 465d6cc: 97f1d80b     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6d0: 17fffe5d     	b	0x465d044 <_ChromeMain+0x4657da8>
 465d6d4: 97f1d809     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6d8: 17fffed6     	b	0x465d230 <_ChromeMain+0x4657f94>
 465d6dc: d4200000     	brk	#0
 465d6e0: d4400000     	hlt	#0
 465d6e4: d4200020     	brk	#0x1
 465d6e8: d4200000     	brk	#0
 465d6ec: d4400000     	hlt	#0
 465d6f0: d4200020     	brk	#0x1
 465d6f4: d4200000     	brk	#0
 465d6f8: d4400000     	hlt	#0
 465d6fc: d4200020     	brk	#0x1
 465d700: d4200000     	brk	#0
 465d704: d4400000     	hlt	#0
 465d708: d4200020     	brk	#0x1
 465d70c: d4200000     	brk	#0
 465d710: d4400000     	hlt	#0
 465d714: d4200020     	brk	#0x1
 465d718: d4200000     	brk	#0
 465d71c: d4400000     	hlt	#0
 465d720: d4200020     	brk	#0x1
 465d724: d4200000     	brk	#0
 465d728: d4400000     	hlt	#0
 465d72c: d4200020     	brk	#0x1
 465d730: d4200000     	brk	#0
 465d734: d4400000     	hlt	#0
 465d738: d4200020     	brk	#0x1
 465d73c: d4200000     	brk	#0
 465d740: d4400000     	hlt	#0
 465d744: d4200020     	brk	#0x1
 465d748: b21e07e9     	mov	x9, #0xc0000000c        ; =51539607564
 465d74c: f9000109     	str	x9, [x8]
 465d750: 17fffef6     	b	0x465d328 <_ChromeMain+0x465808c>
 465d754: d4200000     	brk	#0
 465d758: d4400000     	hlt	#0
 465d75c: d4200020     	brk	#0x1
 465d760: d4200000     	brk	#0
 465d764: d4400000     	hlt	#0
 465d768: d4200020     	brk	#0x1
 465d76c: d4200000     	brk	#0
 465d770: d4400000     	hlt	#0
 465d774: d4200020     	brk	#0x1
 465d778: d4200000     	brk	#0
 465d77c: d4400000     	hlt	#0
 465d780: d4200020     	brk	#0x1
 465d784: 96e714ae     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465d788: 17ffff61     	b	0x465d50c <_ChromeMain+0x4658270>
 465d78c: d2800289     	mov	x9, #0x14               ; =20
 465d790: f2c00289     	movk	x9, #0x14, lsl #32
 465d794: f9000109     	str	x9, [x8]
 465d798: 17fffd37     	b	0x465cc74 <_ChromeMain+0x46579d8>
 465d79c: f9400008     	ldr	x8, [x0]
 465d7a0: f9400508     	ldr	x8, [x8, #0x8]
 465d7a4: d63f0100     	blr	x8
 465d7a8: 17ffff22     	b	0x465d430 <_ChromeMain+0x4658194>
 465d7ac: aa1603e0     	mov	x0, x22
 465d7b0: 976f2264     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 465d7b4: b94046c8     	ldr	w8, [x22, #0x44]
 465d7b8: f94026f6     	ldr	x22, [x23, #0x48]
 465d7bc: 17fffdd2     	b	0x465cf04 <_ChromeMain+0x4657c68>
 465d7c0: aa1603e0     	mov	x0, x22
 465d7c4: 976f225f     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 465d7c8: b94046c8     	ldr	w8, [x22, #0x44]
 465d7cc: f94026f6     	ldr	x22, [x23, #0x48]
 465d7d0: 17fffe54     	b	0x465d120 <_ChromeMain+0x4657e84>
 465d7d4: d4200000     	brk	#0
 465d7d8: d4400000     	hlt	#0
 465d7dc: d4200020     	brk	#0x1
