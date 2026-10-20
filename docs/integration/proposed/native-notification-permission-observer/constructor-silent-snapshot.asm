
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 32f48ac: d104c3ff     	sub	sp, sp, #0x130
 32f48b0: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 32f48b4: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 32f48b8: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 32f48bc: a91057f6     	stp	x22, x21, [sp, #0x100]
 32f48c0: a9114ff4     	stp	x20, x19, [sp, #0x110]
 32f48c4: a9127bfd     	stp	x29, x30, [sp, #0x120]
 32f48c8: 910483fd     	add	x29, sp, #0x120
 32f48cc: aa0103f6     	mov	x22, x1
 32f48d0: aa0003f3     	mov	x19, x0
 32f48d4: d00575a8     	adrp	x8, 0xe1aa000 <dyld_stub_binder+0xe1aa000>
 32f48d8: 913b4108     	add	x8, x8, #0xed0
 32f48dc: 91020109     	add	x9, x8, #0x80
 32f48e0: aa0003f5     	mov	x21, x0
 32f48e4: f8008ea9     	str	x9, [x21, #0x8]!
 32f48e8: f9000008     	str	x8, [x0]
 32f48ec: 9102c108     	add	x8, x8, #0xb0
 32f48f0: f9000808     	str	x8, [x0, #0x10]
 32f48f4: 925e7428     	and	x8, x1, #0xfffffffc00000000
 32f48f8: d005c5f7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 32f48fc: f94046e9     	ldr	x9, [x23, #0x88]
 32f4900: eb09011f     	cmp	x8, x9
 32f4904: 54000061     	b.ne	0x32f4910 <_ChromeMain+0x32ef674>
 32f4908: aa1603e0     	mov	x0, x22
 32f490c: 97347e7c     	bl	0x142fc <_ChromeMain+0xf060>
 32f4910: f9000e76     	str	x22, [x19, #0x18]
 32f4914: 6f00e400     	movi.2d	v0, #0000000000000000
 32f4918: ad010260     	stp	q0, q0, [x19, #0x20]
 32f491c: 52a7f008     	mov	w8, #0x3f800000         ; =1065353216
 32f4920: b9004268     	str	w8, [x19, #0x40]
 32f4924: 52800d00     	mov	w0, #0x68               ; =104
 32f4928: 97346a90     	bl	0xf368 <_ChromeMain+0xa0cc>
 32f492c: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 32f4930: d00575a8     	adrp	x8, 0xe1aa000 <dyld_stub_binder+0xe1aa000>
 32f4934: 91314108     	add	x8, x8, #0xc50
 32f4938: 12800009     	mov	w9, #-0x1               ; =-1
 32f493c: b9002809     	str	w9, [x0, #0x28]
 32f4940: 6f00e400     	movi.2d	v0, #0000000000000000
 32f4944: ad018000     	stp	q0, q0, [x0, #0x30]
 32f4948: 3d801400     	str	q0, [x0, #0x50]
 32f494c: b0057e29     	adrp	x9, 0xe2b9000 <dyld_stub_binder+0xe2b9000>
 32f4950: 91148129     	add	x9, x9, #0x520
 32f4954: f9000008     	str	x8, [x0]
 32f4958: a900fc09     	stp	x9, xzr, [x0, #0x8]
 32f495c: f900301f     	str	xzr, [x0, #0x60]
 32f4960: f0057e08     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 32f4964: 913c2108     	add	x8, x8, #0xf08
 32f4968: aa1303f4     	mov	x20, x19
 32f496c: f8078e88     	str	x8, [x20, #0x78]!
 32f4970: f81d0280     	stur	x0, [x20, #-0x30]
 32f4974: 3c9d8280     	stur	q0, [x20, #-0x28]
 32f4978: 3c9e8280     	stur	q0, [x20, #-0x18]
 32f497c: f81f829f     	stur	xzr, [x20, #-0x8]
 32f4980: 52800100     	mov	w0, #0x8                ; =8
 32f4984: 97346a79     	bl	0xf368 <_ChromeMain+0xa0cc>
 32f4988: b900001f     	str	wzr, [x0]
 32f498c: 3900101f     	strb	wzr, [x0, #0x4]
 32f4990: b40000c0     	cbz	x0, 0x32f49a8 <_ChromeMain+0x32ef70c>
 32f4994: 52800028     	mov	w8, #0x1                ; =1
 32f4998: b8280008     	ldadd	w8, w8, [x0]
 32f499c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 32f49a0: 6b09011f     	cmp	w8, w9
 32f49a4: 54001fa0     	b.eq	0x32f4d98 <_ChromeMain+0x32efafc>
 32f49a8: f0057f88     	adrp	x8, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 32f49ac: 91124108     	add	x8, x8, #0x490
 32f49b0: a9078268     	stp	x8, x0, [x19, #0x78]
 32f49b4: a908fe74     	stp	x20, xzr, [x19, #0x88]
 32f49b8: f900527f     	str	xzr, [x19, #0xa0]
 32f49bc: 52800038     	mov	w24, #0x1               ; =1
 32f49c0: 3902a278     	strb	w24, [x19, #0xa8]
 32f49c4: 52800100     	mov	w0, #0x8                ; =8
 32f49c8: 97346a68     	bl	0xf368 <_ChromeMain+0xa0cc>
 32f49cc: b900001f     	str	wzr, [x0]
 32f49d0: 3900101f     	strb	wzr, [x0, #0x4]
 32f49d4: b40000a0     	cbz	x0, 0x32f49e8 <_ChromeMain+0x32ef74c>
 32f49d8: b8380008     	ldadd	w24, w8, [x0]
 32f49dc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 32f49e0: 6b09011f     	cmp	w8, w9
 32f49e4: 54001d00     	b.eq	0x32f4d84 <_ChromeMain+0x32efae8>
 32f49e8: a90b4e60     	stp	x0, x19, [x19, #0xb0]
 32f49ec: aa1603e0     	mov	x0, x22
 32f49f0: 9793d4f0     	bl	0x17e9db0 <_ChromeMain+0x17e4b14>
 32f49f4: 9101c000     	add	x0, x0, #0x70
 32f49f8: aa1503e1     	mov	x1, x21
 32f49fc: 979de105     	bl	0x1a6ce10 <_ChromeMain+0x1a67b74>
 32f4a00: f9400e60     	ldr	x0, [x19, #0x18]
 32f4a04: f9400008     	ldr	x8, [x0]
 32f4a08: f940b508     	ldr	x8, [x8, #0x168]
 32f4a0c: d63f0100     	blr	x8
 32f4a10: aa0003f5     	mov	x21, x0
 32f4a14: 925e7408     	and	x8, x0, #0xfffffffc00000000
 32f4a18: f94046e9     	ldr	x9, [x23, #0x88]
 32f4a1c: eb09011f     	cmp	x8, x9
 32f4a20: 54000061     	b.ne	0x32f4a2c <_ChromeMain+0x32ef790>
 32f4a24: aa1503e0     	mov	x0, x21
 32f4a28: 97347e35     	bl	0x142fc <_ChromeMain+0xf060>
 32f4a2c: f9405260     	ldr	x0, [x19, #0xa0]
 32f4a30: 925e7408     	and	x8, x0, #0xfffffffc00000000
 32f4a34: f94046e9     	ldr	x9, [x23, #0x88]
 32f4a38: eb09011f     	cmp	x8, x9
 32f4a3c: 54000760     	b.eq	0x32f4b28 <_ChromeMain+0x32ef88c>
 32f4a40: f9005275     	str	x21, [x19, #0xa0]
 32f4a44: 925e7668     	and	x8, x19, #0xfffffffc00000000
 32f4a48: f94046e9     	ldr	x9, [x23, #0x88]
 32f4a4c: eb09011f     	cmp	x8, x9
 32f4a50: 54000061     	b.ne	0x32f4a5c <_ChromeMain+0x32ef7c0>
 32f4a54: aa1303e0     	mov	x0, x19
 32f4a58: 97347e29     	bl	0x142fc <_ChromeMain+0xf060>
 32f4a5c: 52800700     	mov	w0, #0x38               ; =56
 32f4a60: 97346a42     	bl	0xf368 <_ChromeMain+0xa0cc>
 32f4a64: 52800036     	mov	w22, #0x1               ; =1
 32f4a68: b9000016     	str	w22, [x0]
 32f4a6c: b0006228     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 32f4a70: 913a0108     	add	x8, x8, #0xe80
 32f4a74: b0002d29     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 32f4a78: 912d0129     	add	x9, x9, #0xb40
 32f4a7c: a900a408     	stp	x8, x9, [x0, #0x8]
 32f4a80: b0ff9357     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 32f4a84: 912c02f7     	add	x23, x23, #0xb00
 32f4a88: 90007028     	adrp	x8, 0x40f8000 <_ChromeMain+0x40f2d64>
 32f4a8c: 91207108     	add	x8, x8, #0x81c
 32f4a90: a901a017     	stp	x23, x8, [x0, #0x18]
 32f4a94: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 32f4a98: b40017c0     	cbz	x0, 0x32f4d90 <_ChromeMain+0x32efaf4>
 32f4a9c: aa0003f5     	mov	x21, x0
 32f4aa0: 52800600     	mov	w0, #0x30               ; =48
 32f4aa4: 97346a31     	bl	0xf368 <_ChromeMain+0xa0cc>
 32f4aa8: aa0003e3     	mov	x3, x0
 32f4aac: b9000016     	str	w22, [x0]
 32f4ab0: 90ff9088     	adrp	x8, 0x2504000 <_ChromeMain+0x24fed64>
 32f4ab4: 91117108     	add	x8, x8, #0x45c
 32f4ab8: 90002d29     	adrp	x9, 0x3898000 <_ChromeMain+0x3892d64>
 32f4abc: 91070129     	add	x9, x9, #0x1c0
 32f4ac0: a900a408     	stp	x8, x9, [x0, #0x8]
 32f4ac4: f9000c17     	str	x23, [x0, #0x18]
 32f4ac8: f9001415     	str	x21, [x0, #0x28]
 32f4acc: b004dfa1     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 32f4ad0: 9128a021     	add	x1, x1, #0xa28
 32f4ad4: aa1403e0     	mov	x0, x20
 32f4ad8: 52800662     	mov	w2, #0x33               ; =51
 32f4adc: 9777d855     	bl	0x10eac30 <_ChromeMain+0x10e5994>
 32f4ae0: f9400e74     	ldr	x20, [x19, #0x18]
 32f4ae4: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 32f4ae8: f90007ff     	str	xzr, [sp, #0x8]
 32f4aec: d101c3b5     	sub	x21, x29, #0x70
 32f4af0: d101c3a8     	sub	x8, x29, #0x70
 32f4af4: aa1403e0     	mov	x0, x20
 32f4af8: 94381325     	bl	0x40f978c <_ChromeMain+0x40f44f0>
 32f4afc: f85903b7     	ldur	x23, [x29, #-0x70]
 32f4b00: 910022b6     	add	x22, x21, #0x8
 32f4b04: eb1602ff     	cmp	x23, x22
 32f4b08: 54000c00     	b.eq	0x32f4c88 <_ChromeMain+0x32ef9ec>
 32f4b0c: 910083f8     	add	x24, sp, #0x20
 32f4b10: d10223b9     	sub	x25, x29, #0x88
 32f4b14: 528cac9a     	mov	w26, #0x6564            ; =25956
 32f4b18: 72ac2cda     	movk	w26, #0x6166, lsl #16
 32f4b1c: 528eac3b     	mov	w27, #0x7561            ; =30049
 32f4b20: 72ae8d9b     	movk	w27, #0x746c, lsl #16
 32f4b24: 1400002e     	b	0x32f4bdc <_ChromeMain+0x32ef940>
 32f4b28: 9734c7c7     	bl	0x26a44 <_ChromeMain+0x217a8>
 32f4b2c: 17ffffc5     	b	0x32f4a40 <_ChromeMain+0x32ef7a4>
 32f4b30: aa1703e8     	mov	x8, x23
 32f4b34: f9400af7     	ldr	x23, [x23, #0x10]
 32f4b38: f94002e9     	ldr	x9, [x23]
 32f4b3c: eb09011f     	cmp	x8, x9
 32f4b40: 54ffff81     	b.ne	0x32f4b30 <_ChromeMain+0x32ef894>
 32f4b44: 14000024     	b	0x32f4bd4 <_ChromeMain+0x32ef938>
 32f4b48: a9420ae1     	ldp	x1, x2, [x23, #0x20]
 32f4b4c: 910083e0     	add	x0, sp, #0x20
 32f4b50: 97348db2     	bl	0x18218 <_ChromeMain+0x12f7c>
 32f4b54: 14000007     	b	0x32f4b70 <_ChromeMain+0x32ef8d4>
 32f4b58: 39c0dee8     	ldrsb	w8, [x23, #0x37]
 32f4b5c: 37ffff68     	tbnz	w8, #0x1f, 0x32f4b48 <_ChromeMain+0x32ef8ac>
 32f4b60: 3dc00380     	ldr	q0, [x28]
 32f4b64: f9400b88     	ldr	x8, [x28, #0x10]
 32f4b68: f9001be8     	str	x8, [sp, #0x30]
 32f4b6c: 3d800be0     	str	q0, [sp, #0x20]
 32f4b70: 3cd783a0     	ldur	q0, [x29, #-0x88]
 32f4b74: 3c818300     	stur	q0, [x24, #0x18]
 32f4b78: f85883a8     	ldur	x8, [x29, #-0x78]
 32f4b7c: f8028308     	stur	x8, [x24, #0x28]
 32f4b80: 910023e0     	add	x0, sp, #0x8
 32f4b84: 910083e1     	add	x1, sp, #0x20
 32f4b88: 910083e2     	add	x2, sp, #0x20
 32f4b8c: 9782d33d     	bl	0x13a9880 <_ChromeMain+0x13a45e4>
 32f4b90: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 32f4b94: 36f800a8     	tbz	w8, #0x1f, 0x32f4ba8 <_ChromeMain+0x32ef90c>
 32f4b98: f9401fe0     	ldr	x0, [sp, #0x38]
 32f4b9c: f94027e8     	ldr	x8, [sp, #0x48]
 32f4ba0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 32f4ba4: 973450c5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 32f4ba8: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 32f4bac: 36f800a8     	tbz	w8, #0x1f, 0x32f4bc0 <_ChromeMain+0x32ef924>
 32f4bb0: f94013e0     	ldr	x0, [sp, #0x20]
 32f4bb4: f9401be8     	ldr	x8, [sp, #0x30]
 32f4bb8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 32f4bbc: 973450bf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 32f4bc0: f94006e8     	ldr	x8, [x23, #0x8]
 32f4bc4: b4fffb68     	cbz	x8, 0x32f4b30 <_ChromeMain+0x32ef894>
 32f4bc8: aa0803f7     	mov	x23, x8
 32f4bcc: f9400108     	ldr	x8, [x8]
 32f4bd0: b5ffffc8     	cbnz	x8, 0x32f4bc8 <_ChromeMain+0x32ef92c>
 32f4bd4: eb1602ff     	cmp	x23, x22
 32f4bd8: 54000580     	b.eq	0x32f4c88 <_ChromeMain+0x32ef9ec>
 32f4bdc: 910082fc     	add	x28, x23, #0x20
 32f4be0: a937ffbf     	stp	xzr, xzr, [x29, #-0x88]
 32f4be4: f81883bf     	stur	xzr, [x29, #-0x78]
 32f4be8: 3980dee2     	ldrsb	x2, [x23, #0x37]
 32f4bec: b7f804a2     	tbnz	x2, #0x3f, 0x32f4c80 <_ChromeMain+0x32ef9e4>
 32f4bf0: 910082e1     	add	x1, x23, #0x20
 32f4bf4: 910083e0     	add	x0, sp, #0x20
 32f4bf8: 9741ed77     	bl	0x3701d4 <_ChromeMain+0x36af38>
 32f4bfc: d10223a8     	sub	x8, x29, #0x88
 32f4c00: 910083e1     	add	x1, sp, #0x20
 32f4c04: aa1403e0     	mov	x0, x20
 32f4c08: 94381418     	bl	0x40f9c68 <_ChromeMain+0x40f49cc>
 32f4c0c: 9101c300     	add	x0, x24, #0x70
 32f4c10: d2800001     	mov	x1, #0x0                ; =0
 32f4c14: 9734cc29     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 32f4c18: 91008300     	add	x0, x24, #0x20
 32f4c1c: 9734cc17     	bl	0x27c78 <_ChromeMain+0x229dc>
 32f4c20: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 32f4c24: 36f800a8     	tbz	w8, #0x1f, 0x32f4c38 <_ChromeMain+0x32ef99c>
 32f4c28: f94013e0     	ldr	x0, [sp, #0x20]
 32f4c2c: f9401be8     	ldr	x8, [sp, #0x30]
 32f4c30: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 32f4c34: 973450a1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 32f4c38: 3858f3a9     	ldurb	w9, [x29, #-0x71]
 32f4c3c: 13001d28     	sxtb	w8, w9
 32f4c40: f85803aa     	ldur	x10, [x29, #-0x80]
 32f4c44: 7100011f     	cmp	w8, #0x0
 32f4c48: 9a894149     	csel	x9, x10, x9, mi
 32f4c4c: f1001d3f     	cmp	x9, #0x7
 32f4c50: 54fff841     	b.ne	0x32f4b58 <_ChromeMain+0x32ef8bc>
 32f4c54: f85783a0     	ldur	x0, [x29, #-0x88]
 32f4c58: 7100011f     	cmp	w8, #0x0
 32f4c5c: 9a994009     	csel	x9, x0, x25, mi
 32f4c60: b940012a     	ldr	w10, [x9]
 32f4c64: b8403129     	ldur	w9, [x9, #0x3]
 32f4c68: 6b1a015f     	cmp	w10, w26
 32f4c6c: 7a5b0120     	ccmp	w9, w27, #0x0, eq
 32f4c70: 54fff741     	b.ne	0x32f4b58 <_ChromeMain+0x32ef8bc>
 32f4c74: 36fffa68     	tbz	w8, #0x1f, 0x32f4bc0 <_ChromeMain+0x32ef924>
 32f4c78: f85883a8     	ldur	x8, [x29, #-0x78]
 32f4c7c: 17ffffcf     	b	0x32f4bb8 <_ChromeMain+0x32ef91c>
 32f4c80: a9420ae1     	ldp	x1, x2, [x23, #0x20]
 32f4c84: 17ffffdc     	b	0x32f4bf4 <_ChromeMain+0x32ef958>
 32f4c88: f85983a1     	ldur	x1, [x29, #-0x68]
 32f4c8c: f90013f5     	str	x21, [sp, #0x20]
 32f4c90: 910083e0     	add	x0, sp, #0x20
 32f4c94: 9750af86     	bl	0x720aac <_ChromeMain+0x71b810>
 32f4c98: f9403274     	ldr	x20, [x19, #0x60]
 32f4c9c: b50001d4     	cbnz	x20, 0x32f4cd4 <_ChromeMain+0x32efa38>
 32f4ca0: f94007e8     	ldr	x8, [sp, #0x8]
 32f4ca4: f9003268     	str	x8, [x19, #0x60]
 32f4ca8: 3cc103e0     	ldur	q0, [sp, #0x10]
 32f4cac: 3c868260     	stur	q0, [x19, #0x68]
 32f4cb0: aa1303e0     	mov	x0, x19
 32f4cb4: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 32f4cb8: a9514ff4     	ldp	x20, x19, [sp, #0x110]
 32f4cbc: a95057f6     	ldp	x22, x21, [sp, #0x100]
 32f4cc0: a94f5ff8     	ldp	x24, x23, [sp, #0xf0]
 32f4cc4: a94e67fa     	ldp	x26, x25, [sp, #0xe0]
 32f4cc8: a94d6ffc     	ldp	x28, x27, [sp, #0xd0]
 32f4ccc: 9104c3ff     	add	sp, sp, #0x130
 32f4cd0: d65f03c0     	ret
 32f4cd4: f9403668     	ldr	x8, [x19, #0x68]
 32f4cd8: 8b080508     	add	x8, x8, x8, lsl #1
 32f4cdc: d37ced15     	lsl	x21, x8, #4
 32f4ce0: b4000095     	cbz	x21, 0x32f4cf0 <_ChromeMain+0x32efa54>
 32f4ce4: d2800016     	mov	x22, #0x0               ; =0
 32f4ce8: aa1403f7     	mov	x23, x20
 32f4cec: 14000014     	b	0x32f4d3c <_ChromeMain+0x32efaa0>
 32f4cf0: aa1403e0     	mov	x0, x20
 32f4cf4: 14000019     	b	0x32f4d58 <_ChromeMain+0x32efabc>
 32f4cf8: f9400300     	ldr	x0, [x24]
 32f4cfc: f85e0108     	ldur	x8, [x8, #-0x20]
 32f4d00: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 32f4d04: 9734506d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 32f4d08: 14000009     	b	0x32f4d2c <_ChromeMain+0x32efa90>
 32f4d0c: 8b1502e8     	add	x8, x23, x21
 32f4d10: f85e8100     	ldur	x0, [x8, #-0x18]
 32f4d14: f85f8108     	ldur	x8, [x8, #-0x8]
 32f4d18: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 32f4d1c: 97345067     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 32f4d20: 8b1502e8     	add	x8, x23, x21
 32f4d24: 38de7109     	ldursb	w9, [x8, #-0x19]
 32f4d28: 37fffe89     	tbnz	w9, #0x1f, 0x32f4cf8 <_ChromeMain+0x32efa5c>
 32f4d2c: d100c2f7     	sub	x23, x23, #0x30
 32f4d30: 9100c2d6     	add	x22, x22, #0x30
 32f4d34: eb1602bf     	cmp	x21, x22
 32f4d38: 540000e0     	b.eq	0x32f4d54 <_ChromeMain+0x32efab8>
 32f4d3c: 8b1502e8     	add	x8, x23, x21
 32f4d40: f100c118     	subs	x24, x8, #0x30
 32f4d44: 54000240     	b.eq	0x32f4d8c <_ChromeMain+0x32efaf0>
 32f4d48: 38dff108     	ldursb	w8, [x8, #-0x1]
 32f4d4c: 36fffea8     	tbz	w8, #0x1f, 0x32f4d20 <_ChromeMain+0x32efa84>
 32f4d50: 17ffffef     	b	0x32f4d0c <_ChromeMain+0x32efa70>
 32f4d54: f9403260     	ldr	x0, [x19, #0x60]
 32f4d58: cb000288     	sub	x8, x20, x0
 32f4d5c: 9344fd08     	asr	x8, x8, #4
 32f4d60: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 32f4d64: f2955569     	movk	x9, #0xaaab
 32f4d68: 9b097d08     	mul	x8, x8, x9
 32f4d6c: f9003668     	str	x8, [x19, #0x68]
 32f4d70: f9403a68     	ldr	x8, [x19, #0x70]
 32f4d74: 8b080508     	add	x8, x8, x8, lsl #1
 32f4d78: d37ced01     	lsl	x1, x8, #4
 32f4d7c: 9734504f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 32f4d80: 17ffffc8     	b	0x32f4ca0 <_ChromeMain+0x32efa04>
 32f4d84: d4200000     	brk	#0
 32f4d88: d4400000     	hlt	#0
 32f4d8c: d4200020     	brk	#0x1
