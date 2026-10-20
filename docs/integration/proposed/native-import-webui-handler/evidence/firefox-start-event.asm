
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42526c0: d10403ff     	sub	sp, sp, #0x100
 42526c4: a90b67fa     	stp	x26, x25, [sp, #0xb0]
 42526c8: a90c5ff8     	stp	x24, x23, [sp, #0xc0]
 42526cc: a90d57f6     	stp	x22, x21, [sp, #0xd0]
 42526d0: a90e4ff4     	stp	x20, x19, [sp, #0xe0]
 42526d4: a90f7bfd     	stp	x29, x30, [sp, #0xf0]
 42526d8: 9103c3fd     	add	x29, sp, #0xf0
 42526dc: d004eea8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 42526e0: f940f908     	ldr	x8, [x8, #0x1f0]
 42526e4: f9400108     	ldr	x8, [x8]
 42526e8: f81b83a8     	stur	x8, [x29, #-0x48]
 42526ec: f9401413     	ldr	x19, [x0, #0x28]
 42526f0: f900141f     	str	xzr, [x0, #0x28]
 42526f4: b40002b3     	cbz	x19, 0x4252748 <_ChromeMain+0x424d4ac>
 42526f8: f9401817     	ldr	x23, [x0, #0x30]
 42526fc: f9400034     	ldr	x20, [x1]
 4252700: 19404268     	ldapurb	w8, [x19, #0x4]
 4252704: f10002ff     	cmp	x23, #0x0
 4252708: 1a9f07e9     	cset	w9, ne
 425270c: d360fe8a     	lsr	x10, x20, #32
 4252710: 0a0a0129     	and	w9, w9, w10
 4252714: 7100011f     	cmp	w8, #0x0
 4252718: 1a8913e8     	csel	w8, wzr, w9, ne
 425271c: 340000e8     	cbz	w8, 0x4252738 <_ChromeMain+0x424d49c>
 4252720: 19404268     	ldapurb	w8, [x19, #0x4]
 4252724: 35001828     	cbnz	w8, 0x4252a28 <_ChromeMain+0x424d78c>
 4252728: f9400ee8     	ldr	x8, [x23, #0x18]
 425272c: b4000068     	cbz	x8, 0x4252738 <_ChromeMain+0x424d49c>
 4252730: 3940b108     	ldrb	w8, [x8, #0x2c]
 4252734: 360002c8     	tbz	w8, #0x0, 0x425278c <_ChromeMain+0x424d4f0>
 4252738: 12800008     	mov	w8, #-0x1               ; =-1
 425273c: b8e80268     	ldaddal	w8, w8, [x19]
 4252740: 7100051f     	cmp	w8, #0x1
 4252744: 540001c0     	b.eq	0x425277c <_ChromeMain+0x424d4e0>
 4252748: f85b83a8     	ldur	x8, [x29, #-0x48]
 425274c: d004eea9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4252750: f940f929     	ldr	x9, [x9, #0x1f0]
 4252754: f9400129     	ldr	x9, [x9]
 4252758: eb08013f     	cmp	x9, x8
 425275c: 54001641     	b.ne	0x4252a24 <_ChromeMain+0x424d788>
 4252760: a94f7bfd     	ldp	x29, x30, [sp, #0xf0]
 4252764: a94e4ff4     	ldp	x20, x19, [sp, #0xe0]
 4252768: a94d57f6     	ldp	x22, x21, [sp, #0xd0]
 425276c: a94c5ff8     	ldp	x24, x23, [sp, #0xc0]
 4252770: a94b67fa     	ldp	x26, x25, [sp, #0xb0]
 4252774: 910403ff     	add	sp, sp, #0x100
 4252778: d65f03c0     	ret
 425277c: aa1303e0     	mov	x0, x19
 4252780: 52800101     	mov	w1, #0x8                ; =8
 4252784: 96f6d9cd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4252788: 17fffff0     	b	0x4252748 <_ChromeMain+0x424d4ac>
 425278c: f94006f5     	ldr	x21, [x23, #0x8]
 4252790: b004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4252794: 91054021     	add	x1, x1, #0x150
 4252798: 9100e3e0     	add	x0, sp, #0x38
 425279c: 979c7dd1     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 42527a0: 910163e0     	add	x0, sp, #0x58
 42527a4: 9100e3e1     	add	x1, sp, #0x38
 42527a8: 97793522     	bl	0x209fc30 <_ChromeMain+0x209a994>
 42527ac: d00465a1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42527b0: 9100c821     	add	x1, x1, #0x32
 42527b4: 910063e0     	add	x0, sp, #0x18
 42527b8: 979c7dca     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 42527bc: 9101c3e8     	add	x8, sp, #0x70
 42527c0: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 42527c4: 3cc583e0     	ldur	q0, [sp, #0x58]
 42527c8: 3d801fe0     	str	q0, [sp, #0x70]
 42527cc: f94037e9     	ldr	x9, [sp, #0x68]
 42527d0: a9087fe9     	stp	x9, xzr, [sp, #0x80]
 42527d4: 91006100     	add	x0, x8, #0x18
 42527d8: 910063e1     	add	x1, sp, #0x18
 42527dc: 97793515     	bl	0x209fc30 <_ChromeMain+0x209a994>
 42527e0: 9004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 42527e4: 911e5021     	add	x1, x1, #0x794
 42527e8: 9101c3e3     	add	x3, sp, #0x70
 42527ec: aa1503e0     	mov	x0, x21
 42527f0: 52800302     	mov	w2, #0x18               ; =24
 42527f4: 52800044     	mov	w4, #0x2                ; =2
 42527f8: 949d7fd7     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 42527fc: 3940c3e8     	ldrb	w8, [sp, #0x30]
 4252800: f0053376     	adrp	x22, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4252804: 9121e2d6     	add	x22, x22, #0x878
 4252808: 7103fd1f     	cmp	w8, #0xff
 425280c: 54000060     	b.eq	0x4252818 <_ChromeMain+0x424d57c>
 4252810: 721e791f     	tst	w8, #0xfffffffd
 4252814: 540005a1     	b.ne	0x42528c8 <_ChromeMain+0x424d62c>
 4252818: 394143e8     	ldrb	w8, [sp, #0x50]
 425281c: 7103fd1f     	cmp	w8, #0xff
 4252820: 54000060     	b.eq	0x425282c <_ChromeMain+0x424d590>
 4252824: 721e791f     	tst	w8, #0xfffffffd
 4252828: 54000421     	b.ne	0x42528ac <_ChromeMain+0x424d610>
 425282c: f9400ef5     	ldr	x21, [x23, #0x18]
 4252830: f9401af8     	ldr	x24, [x23, #0x30]
 4252834: b40000d8     	cbz	x24, 0x425284c <_ChromeMain+0x424d5b0>
 4252838: 52800028     	mov	w8, #0x1                ; =1
 425283c: b8280308     	ldadd	w8, w8, [x24]
 4252840: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4252844: 6b09011f     	cmp	w8, w9
 4252848: 54000f60     	b.eq	0x4252a34 <_ChromeMain+0x424d798>
 425284c: f9401ef9     	ldr	x25, [x23, #0x38]
 4252850: 52800900     	mov	w0, #0x48               ; =72
 4252854: 96f6f2c5     	bl	0xf368 <_ChromeMain+0xa0cc>
 4252858: aa0003e2     	mov	x2, x0
 425285c: 52800028     	mov	w8, #0x1                ; =1
 4252860: b9000008     	str	w8, [x0]
 4252864: b0ffef88     	adrp	x8, 0x4043000 <_ChromeMain+0x403dd64>
 4252868: 913d0108     	add	x8, x8, #0xf40
 425286c: d0ffe8c9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4252870: 91250129     	add	x9, x9, #0x940
 4252874: a900a408     	stp	x8, x9, [x0, #0x8]
 4252878: 90fff2e8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 425287c: 911b0108     	add	x8, x8, #0x6c0
 4252880: 10fe7ba9     	adr	x9, 0x424f7f4 <_ChromeMain+0x424a558>
 4252884: d503201f     	nop
 4252888: a901a408     	stp	x8, x9, [x0, #0x18]
 425288c: a902e01f     	stp	xzr, x24, [x0, #0x28]
 4252890: f9001c19     	str	x25, [x0, #0x38]
 4252894: b9004014     	str	w20, [x0, #0x40]
 4252898: aa1503e0     	mov	x0, x21
 425289c: aa1403e1     	mov	x1, x20
 42528a0: 94004169     	bl	0x4262e44 <_ChromeMain+0x425dba8>
 42528a4: 3707f4a0     	tbnz	w0, #0x0, 0x4252738 <_ChromeMain+0x424d49c>
 42528a8: 1400001d     	b	0x425291c <_ChromeMain+0x424d680>
 42528ac: 7100111f     	cmp	w8, #0x4
 42528b0: 54000280     	b.eq	0x4252900 <_ChromeMain+0x424d664>
 42528b4: f8685ac8     	ldr	x8, [x22, w8, uxtw #3]
 42528b8: 9101c3e0     	add	x0, sp, #0x70
 42528bc: 9100e3e1     	add	x1, sp, #0x38
 42528c0: d63f0100     	blr	x8
 42528c4: 17ffffda     	b	0x425282c <_ChromeMain+0x424d590>
 42528c8: 7100111f     	cmp	w8, #0x4
 42528cc: 540000c0     	b.eq	0x42528e4 <_ChromeMain+0x424d648>
 42528d0: f8685ac8     	ldr	x8, [x22, w8, uxtw #3]
 42528d4: 9101c3e0     	add	x0, sp, #0x70
 42528d8: 910063e1     	add	x1, sp, #0x18
 42528dc: d63f0100     	blr	x8
 42528e0: 17ffffce     	b	0x4252818 <_ChromeMain+0x424d57c>
 42528e4: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 42528e8: 36fff988     	tbz	w8, #0x1f, 0x4252818 <_ChromeMain+0x424d57c>
 42528ec: f9400fe0     	ldr	x0, [sp, #0x18]
 42528f0: f94017e8     	ldr	x8, [sp, #0x28]
 42528f4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42528f8: 96f6d970     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42528fc: 17ffffc7     	b	0x4252818 <_ChromeMain+0x424d57c>
 4252900: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 4252904: 36fff948     	tbz	w8, #0x1f, 0x425282c <_ChromeMain+0x424d590>
 4252908: f9401fe0     	ldr	x0, [sp, #0x38]
 425290c: f94027e8     	ldr	x8, [sp, #0x48]
 4252910: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4252914: 96f6d969     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4252918: 17ffffc5     	b	0x425282c <_ChromeMain+0x424d590>
 425291c: f94006f4     	ldr	x20, [x23, #0x8]
 4252920: b004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4252924: 91059c21     	add	x1, x1, #0x167
 4252928: 9100e3e0     	add	x0, sp, #0x38
 425292c: 979c7d6d     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4252930: 910003e0     	mov	x0, sp
 4252934: 9100e3e1     	add	x1, sp, #0x38
 4252938: 977934be     	bl	0x209fc30 <_ChromeMain+0x209a994>
 425293c: d00465a1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4252940: 9100c821     	add	x1, x1, #0x32
 4252944: 910063e0     	add	x0, sp, #0x18
 4252948: 979c7d66     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 425294c: 9101c3e8     	add	x8, sp, #0x70
 4252950: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 4252954: 3dc003e0     	ldr	q0, [sp]
 4252958: 3d801fe0     	str	q0, [sp, #0x70]
 425295c: f9400be9     	ldr	x9, [sp, #0x10]
 4252960: a9087fe9     	stp	x9, xzr, [sp, #0x80]
 4252964: 91006100     	add	x0, x8, #0x18
 4252968: 910063e1     	add	x1, sp, #0x18
 425296c: 977934b1     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4252970: 9004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 4252974: 911e5021     	add	x1, x1, #0x794
 4252978: 9101c3e3     	add	x3, sp, #0x70
 425297c: aa1403e0     	mov	x0, x20
 4252980: 52800302     	mov	w2, #0x18               ; =24
 4252984: 52800044     	mov	w4, #0x2                ; =2
 4252988: 949d7f73     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 425298c: 3940c3e8     	ldrb	w8, [sp, #0x30]
 4252990: 7103fd1f     	cmp	w8, #0xff
 4252994: 54000060     	b.eq	0x42529a0 <_ChromeMain+0x424d704>
 4252998: 721e791f     	tst	w8, #0xfffffffd
 425299c: 540001a1     	b.ne	0x42529d0 <_ChromeMain+0x424d734>
 42529a0: 394143e8     	ldrb	w8, [sp, #0x50]
 42529a4: 7103fd1f     	cmp	w8, #0xff
 42529a8: 54ffec80     	b.eq	0x4252738 <_ChromeMain+0x424d49c>
 42529ac: 721e791f     	tst	w8, #0xfffffffd
 42529b0: 54ffec40     	b.eq	0x4252738 <_ChromeMain+0x424d49c>
 42529b4: 7100111f     	cmp	w8, #0x4
 42529b8: 54000280     	b.eq	0x4252a08 <_ChromeMain+0x424d76c>
 42529bc: f8685ac8     	ldr	x8, [x22, w8, uxtw #3]
 42529c0: 9101c3e0     	add	x0, sp, #0x70
 42529c4: 9100e3e1     	add	x1, sp, #0x38
 42529c8: d63f0100     	blr	x8
 42529cc: 17ffff5b     	b	0x4252738 <_ChromeMain+0x424d49c>
 42529d0: 7100111f     	cmp	w8, #0x4
 42529d4: 540000c0     	b.eq	0x42529ec <_ChromeMain+0x424d750>
 42529d8: f8685ac8     	ldr	x8, [x22, w8, uxtw #3]
 42529dc: 9101c3e0     	add	x0, sp, #0x70
 42529e0: 910063e1     	add	x1, sp, #0x18
 42529e4: d63f0100     	blr	x8
 42529e8: 17ffffee     	b	0x42529a0 <_ChromeMain+0x424d704>
 42529ec: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 42529f0: 36fffd88     	tbz	w8, #0x1f, 0x42529a0 <_ChromeMain+0x424d704>
 42529f4: f9400fe0     	ldr	x0, [sp, #0x18]
 42529f8: f94017e8     	ldr	x8, [sp, #0x28]
 42529fc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4252a00: 96f6d92e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4252a04: 17ffffe7     	b	0x42529a0 <_ChromeMain+0x424d704>
 4252a08: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 4252a0c: 36ffe968     	tbz	w8, #0x1f, 0x4252738 <_ChromeMain+0x424d49c>
 4252a10: f9401fe0     	ldr	x0, [sp, #0x38]
 4252a14: f94027e8     	ldr	x8, [sp, #0x48]
 4252a18: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4252a1c: 96f6d927     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4252a20: 17ffff46     	b	0x4252738 <_ChromeMain+0x424d49c>
 4252a24: 94f6c64f     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4252a28: d4200000     	brk	#0
 4252a2c: d4400000     	hlt	#0
 4252a30: d4200020     	brk	#0x1
 4252a34: d4200000     	brk	#0
 4252a38: d4400000     	hlt	#0
 4252a3c: d4200020     	brk	#0x1
 4252a40: f9401808     	ldr	x8, [x0, #0x30]
 4252a44: b4000068     	cbz	x8, 0x4252a50 <_ChromeMain+0x424d7b4>
 4252a48: 19404108     	ldapurb	w8, [x8, #0x4]
 4252a4c: 34000048     	cbz	w8, 0x4252a54 <_ChromeMain+0x424d7b8>
 4252a50: d65f03c0     	ret
 4252a54: f9401c08     	ldr	x8, [x0, #0x38]
 4252a58: b4ffffc8     	cbz	x8, 0x4252a50 <_ChromeMain+0x424d7b4>
 4252a5c: f940180a     	ldr	x10, [x0, #0x30]
 4252a60: b40004ca     	cbz	x10, 0x4252af8 <_ChromeMain+0x424d85c>
 4252a64: a9422408     	ldp	x8, x9, [x0, #0x20]
 4252a68: 1940414a     	ldapurb	w10, [x10, #0x4]
 4252a6c: 3500046a     	cbnz	w10, 0x4252af8 <_ChromeMain+0x424d85c>
 4252a70: f9401c0a     	ldr	x10, [x0, #0x38]
 4252a74: 8b890540     	add	x0, x10, x9, asr #1
 4252a78: 36000069     	tbz	w9, #0x0, 0x4252a84 <_ChromeMain+0x424d7e8>
 4252a7c: f9400009     	ldr	x9, [x0]
 4252a80: f8684928     	ldr	x8, [x9, w8, uxtw]
 4252a84: d10183ff     	sub	sp, sp, #0x60
 4252a88: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4252a8c: 910143fd     	add	x29, sp, #0x50
 4252a90: b9400029     	ldr	w9, [x1]
 4252a94: b90003e9     	str	w9, [sp]
 4252a98: 3cc08020     	ldur	q0, [x1, #0x8]
 4252a9c: 3c8083e0     	stur	q0, [sp, #0x8]
 4252aa0: f9400c29     	ldr	x9, [x1, #0x18]
 4252aa4: f9000fe9     	str	x9, [sp, #0x18]
 4252aa8: a900fc3f     	stp	xzr, xzr, [x1, #0x8]
 4252aac: 3dc00820     	ldr	q0, [x1, #0x20]
 4252ab0: 3d800be0     	str	q0, [sp, #0x20]
 4252ab4: f9401829     	ldr	x9, [x1, #0x30]
 4252ab8: f9001be9     	str	x9, [sp, #0x30]
