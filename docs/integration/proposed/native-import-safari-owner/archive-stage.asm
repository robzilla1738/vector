
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4279d08: 96f63c6c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279d0c: 17fffff9     	b	0x4279cf0 <_ChromeMain+0x4274a54>
 4279d10: d10383ff     	sub	sp, sp, #0xe0
 4279d14: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 4279d18: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 4279d1c: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 4279d20: 910343fd     	add	x29, sp, #0xd0
 4279d24: aa0003f4     	mov	x20, x0
 4279d28: aa0803f3     	mov	x19, x8
 4279d2c: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 4279d30: f90027ff     	str	xzr, [sp, #0x48]
 4279d34: b00472a0     	adrp	x0, 0xd0ce000 <dyld_stub_binder+0xd0ce000>
 4279d38: 91178c00     	add	x0, x0, #0x5e3
 4279d3c: 9100e3e2     	add	x2, sp, #0x38
 4279d40: 52800141     	mov	w1, #0xa                ; =10
 4279d44: 97b83ce3     	bl	0x30890d0 <_ChromeMain+0x3083e34>
 4279d48: 370001a0     	tbnz	w0, #0x0, 0x4279d7c <_ChromeMain+0x4274ae0>
 4279d4c: 3900027f     	strb	wzr, [x19]
 4279d50: 6f00e400     	movi.2d	v0, #0000000000000000
 4279d54: 3c808260     	stur	q0, [x19, #0x8]
 4279d58: 3c818260     	stur	q0, [x19, #0x18]
 4279d5c: 3c828260     	stur	q0, [x19, #0x28]
 4279d60: 9100e3e0     	add	x0, sp, #0x38
 4279d64: 97affdd3     	bl	0x2e794b0 <_ChromeMain+0x2e74214>
 4279d68: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 4279d6c: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 4279d70: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 4279d74: 910383ff     	add	sp, sp, #0xe0
 4279d78: d65f03c0     	ret
 4279d7c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4279d80: f9001bff     	str	xzr, [sp, #0x30]
 4279d84: 910083f5     	add	x21, sp, #0x20
 4279d88: 910083e8     	add	x8, sp, #0x20
 4279d8c: 9100e3e0     	add	x0, sp, #0x38
 4279d90: 95162ce5     	bl	0x8805124 <_ChromeMain+0x87ffe88>
 4279d94: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4279d98: f9000fff     	str	xzr, [sp, #0x18]
 4279d9c: d004c541     	adrp	x1, 0xdb23000 <dyld_stub_binder+0xdb23000>
 4279da0: 9111a821     	add	x1, x1, #0x46a
 4279da4: 910023e8     	add	x8, sp, #0x8
 4279da8: 910083e0     	add	x0, sp, #0x20
 4279dac: 52800222     	mov	w2, #0x11               ; =17
 4279db0: 97507d99     	bl	0x1699414 <_ChromeMain+0x1694178>
 4279db4: a9400a81     	ldp	x1, x2, [x20]
 4279db8: 910023e0     	add	x0, sp, #0x8
 4279dbc: 977c4981     	bl	0x218c3c0 <_ChromeMain+0x2187124>
 4279dc0: 370004e0     	tbnz	w0, #0x0, 0x4279e5c <_ChromeMain+0x4274bc0>
 4279dc4: d10183a8     	sub	x8, x29, #0x60
 4279dc8: 6f00e400     	movi.2d	v0, #0000000000000000
 4279dcc: ad010100     	stp	q0, q0, [x8, #0x20]
 4279dd0: ad3d03a0     	stp	q0, q0, [x29, #-0x60]
 4279dd4: b004c780     	adrp	x0, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 4279dd8: 91384400     	add	x0, x0, #0xe11
 4279ddc: b004c781     	adrp	x1, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 4279de0: 91311421     	add	x1, x1, #0xc45
 4279de4: 910143e8     	add	x8, sp, #0x50
 4279de8: 52802f62     	mov	w2, #0x17b              ; =379
 4279dec: 96f75ba5     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4279df0: d10183a0     	sub	x0, x29, #0x60
 4279df4: 910143e1     	add	x1, sp, #0x50
 4279df8: 52800002     	mov	w2, #0x0                ; =0
 4279dfc: 97185e02     	bl	0x891604 <_ChromeMain+0x88c368>
 4279e00: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4279e04: f94013e9     	ldr	x9, [sp, #0x20]
 4279e08: 7100011f     	cmp	w8, #0x0
 4279e0c: 9a954121     	csel	x1, x9, x21, mi
 4279e10: 12800020     	mov	w0, #-0x2               ; =-2
 4279e14: 52800022     	mov	w2, #0x1                ; =1
 4279e18: 975a7e7c     	bl	0x1919808 <_ChromeMain+0x191456c>
 4279e1c: d10183a0     	sub	x0, x29, #0x60
 4279e20: 971fd359     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 4279e24: 3900027f     	strb	wzr, [x19]
 4279e28: 6f00e400     	movi.2d	v0, #0000000000000000
 4279e2c: 3c808260     	stur	q0, [x19, #0x8]
 4279e30: 3c818260     	stur	q0, [x19, #0x18]
 4279e34: 3c828260     	stur	q0, [x19, #0x28]
 4279e38: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4279e3c: 37f80308     	tbnz	w8, #0x1f, 0x4279e9c <_ChromeMain+0x4274c00>
 4279e40: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4279e44: 36fff8e8     	tbz	w8, #0x1f, 0x4279d60 <_ChromeMain+0x4274ac4>
 4279e48: f94013e0     	ldr	x0, [sp, #0x20]
 4279e4c: f9401be8     	ldr	x8, [sp, #0x30]
 4279e50: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4279e54: 96f63c19     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279e58: 17ffffc2     	b	0x4279d60 <_ChromeMain+0x4274ac4>
 4279e5c: 52800028     	mov	w8, #0x1                ; =1
 4279e60: aa1303e0     	mov	x0, x19
 4279e64: 38008408     	strb	w8, [x0], #0x8
 4279e68: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4279e6c: 37f80228     	tbnz	w8, #0x1f, 0x4279eb0 <_ChromeMain+0x4274c14>
 4279e70: 3dc00be0     	ldr	q0, [sp, #0x20]
 4279e74: 3d800000     	str	q0, [x0]
 4279e78: f9401be8     	ldr	x8, [sp, #0x30]
 4279e7c: f9000808     	str	x8, [x0, #0x10]
 4279e80: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4279e84: 37f801c8     	tbnz	w8, #0x1f, 0x4279ebc <_ChromeMain+0x4274c20>
 4279e88: 3cc083e0     	ldur	q0, [sp, #0x8]
 4279e8c: 3c820260     	stur	q0, [x19, #0x20]
 4279e90: f9400fe8     	ldr	x8, [sp, #0x18]
 4279e94: f8030268     	stur	x8, [x19, #0x30]
 4279e98: 17ffffe8     	b	0x4279e38 <_ChromeMain+0x4274b9c>
 4279e9c: f94007e0     	ldr	x0, [sp, #0x8]
 4279ea0: f9400fe8     	ldr	x8, [sp, #0x18]
 4279ea4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4279ea8: 96f63c04     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279eac: 17ffffe5     	b	0x4279e40 <_ChromeMain+0x4274ba4>
 4279eb0: a9420be1     	ldp	x1, x2, [sp, #0x20]
 4279eb4: 96f678d9     	bl	0x18218 <_ChromeMain+0x12f7c>
 4279eb8: 17fffff2     	b	0x4279e80 <_ChromeMain+0x4274be4>
 4279ebc: a9408be1     	ldp	x1, x2, [sp, #0x8]
 4279ec0: 91008260     	add	x0, x19, #0x20
 4279ec4: 96f678d5     	bl	0x18218 <_ChromeMain+0x12f7c>
 4279ec8: 17ffffdc     	b	0x4279e38 <_ChromeMain+0x4274b9c>
 4279ecc: d10403ff     	sub	sp, sp, #0x100
 4279ed0: a90a6ffc     	stp	x28, x27, [sp, #0xa0]
 4279ed4: a90b67fa     	stp	x26, x25, [sp, #0xb0]
 4279ed8: a90c5ff8     	stp	x24, x23, [sp, #0xc0]
 4279edc: a90d57f6     	stp	x22, x21, [sp, #0xd0]
 4279ee0: a90e4ff4     	stp	x20, x19, [sp, #0xe0]
 4279ee4: a90f7bfd     	stp	x29, x30, [sp, #0xf0]
 4279ee8: 9103c3fd     	add	x29, sp, #0xf0
 4279eec: aa0003f3     	mov	x19, x0
 4279ef0: 39400028     	ldrb	w8, [x1]
 4279ef4: 36002008     	tbz	w8, #0x0, 0x427a2f4 <_ChromeMain+0x4275058>
 4279ef8: aa0103f4     	mov	x20, x1
 4279efc: 91002028     	add	x8, x1, #0x8
 4279f00: 91034269     	add	x9, x19, #0xd0
 4279f04: eb08013f     	cmp	x9, x8
 4279f08: 54000120     	b.eq	0x4279f2c <_ChromeMain+0x4274c90>
 4279f0c: 39c39e6b     	ldrsb	w11, [x19, #0xe7]
 4279f10: 39407e8a     	ldrb	w10, [x20, #0x1f]
 4279f14: 37f8302b     	tbnz	w11, #0x1f, 0x427a518 <_ChromeMain+0x427527c>
 4279f18: 3738096a     	tbnz	w10, #0x7, 0x427a044 <_ChromeMain+0x4274da8>
 4279f1c: 3dc00100     	ldr	q0, [x8]
 4279f20: f9400908     	ldr	x8, [x8, #0x10]
 4279f24: f9000928     	str	x8, [x9, #0x10]
 4279f28: 3d800120     	str	q0, [x9]
 4279f2c: f9401e60     	ldr	x0, [x19, #0x38]
 4279f30: b4000860     	cbz	x0, 0x427a03c <_ChromeMain+0x4274da0>
 4279f34: f9400008     	ldr	x8, [x0]
 4279f38: f940a508     	ldr	x8, [x8, #0x148]
 4279f3c: d63f0100     	blr	x8
 4279f40: aa0003fb     	mov	x27, x0
 4279f44: f9407a60     	ldr	x0, [x19, #0xf0]
 4279f48: f9007a7f     	str	xzr, [x19, #0xf0]
 4279f4c: b5000840     	cbnz	x0, 0x427a054 <_ChromeMain+0x4274db8>
 4279f50: f9407660     	ldr	x0, [x19, #0xe8]
 4279f54: f900767f     	str	xzr, [x19, #0xe8]
 4279f58: b4000080     	cbz	x0, 0x4279f68 <_ChromeMain+0x4274ccc>
 4279f5c: 97b7a8b3     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 4279f60: 52802f01     	mov	w1, #0x178              ; =376
 4279f64: 96f63bd5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279f68: f9408268     	ldr	x8, [x19, #0x100]
 4279f6c: d37ef509     	lsl	x9, x8, #2
 4279f70: b4000129     	cbz	x9, 0x4279f94 <_ChromeMain+0x4274cf8>
 4279f74: f9407e6a     	ldr	x10, [x19, #0xf8]
 4279f78: cb080be8     	neg	x8, x8, lsl #2
 4279f7c: 8b0a0129     	add	x9, x9, x10
 4279f80: d1001129     	sub	x9, x9, #0x4
 4279f84: b4000709     	cbz	x9, 0x427a064 <_ChromeMain+0x4274dc8>
 4279f88: d1001129     	sub	x9, x9, #0x4
 4279f8c: 91001108     	add	x8, x8, #0x4
 4279f90: b5ffffa8     	cbnz	x8, 0x4279f84 <_ChromeMain+0x4274ce8>
 4279f94: f900827f     	str	xzr, [x19, #0x100]
 4279f98: b400153b     	cbz	x27, 0x427a23c <_ChromeMain+0x4274fa0>
 4279f9c: 97aba56e     	bl	0x2d63554 <_ChromeMain+0x2d5e2b8>
 4279fa0: aa1b03e1     	mov	x1, x27
 4279fa4: 52800022     	mov	w2, #0x1                ; =1
 4279fa8: 96f7637b     	bl	0x52d94 <_ChromeMain+0x4daf8>
 4279fac: aa0003fc     	mov	x28, x0
 4279fb0: aa1b03e0     	mov	x0, x27
 4279fb4: 974f5c0a     	bl	0x1650fdc <_ChromeMain+0x164bd40>
 4279fb8: aa0003fa     	mov	x26, x0
 4279fbc: aa1b03e0     	mov	x0, x27
 4279fc0: 52800001     	mov	w1, #0x0                ; =0
 4279fc4: 976bc0ae     	bl	0x1d6a27c <_ChromeMain+0x1d64fe0>
 4279fc8: aa0003f7     	mov	x23, x0
 4279fcc: aa1b03e0     	mov	x0, x27
 4279fd0: 9726062b     	bl	0xbfb87c <_ChromeMain+0xbf65e0>
 4279fd4: aa0003f8     	mov	x24, x0
 4279fd8: aa1b03e0     	mov	x0, x27
 4279fdc: 97a4d131     	bl	0x2bae4a0 <_ChromeMain+0x2ba9204>
 4279fe0: aa0003f5     	mov	x21, x0
 4279fe4: aa1b03e0     	mov	x0, x27
 4279fe8: 977ccbf6     	bl	0x21acfc0 <_ChromeMain+0x21a7d24>
 4279fec: b400129c     	cbz	x28, 0x427a23c <_ChromeMain+0x4274fa0>
 4279ff0: b400127a     	cbz	x26, 0x427a23c <_ChromeMain+0x4274fa0>
 4279ff4: b4001257     	cbz	x23, 0x427a23c <_ChromeMain+0x4274fa0>
 4279ff8: b4001238     	cbz	x24, 0x427a23c <_ChromeMain+0x4274fa0>
 4279ffc: b4001215     	cbz	x21, 0x427a23c <_ChromeMain+0x4274fa0>
 427a000: a90457e0     	stp	x0, x21, [sp, #0x40]
 427a004: aa1b03e0     	mov	x0, x27
 427a008: 52800001     	mov	w1, #0x0                ; =0
 427a00c: 97b41ac4     	bl	0x2f80b1c <_ChromeMain+0x2f7b880>
 427a010: aa0003f5     	mov	x21, x0
 427a014: aa1b03e0     	mov	x0, x27
 427a018: 52800001     	mov	w1, #0x0                ; =0
 427a01c: 9756c64c     	bl	0x182b94c <_ChromeMain+0x18266b0>
 427a020: aa0003f6     	mov	x22, x0
 427a024: f10002bf     	cmp	x21, #0x0
 427a028: fa401804     	ccmp	x0, #0x0, #0x4, ne
 427a02c: 1a9f07f9     	cset	w25, ne
 427a030: 54000241     	b.ne	0x427a078 <_ChromeMain+0x4274ddc>
 427a034: b5000e56     	cbnz	x22, 0x427a1fc <_ChromeMain+0x4274f60>
 427a038: 14000078     	b	0x427a218 <_ChromeMain+0x4274f7c>
 427a03c: d280001b     	mov	x27, #0x0               ; =0
 427a040: 17ffffc1     	b	0x4279f44 <_ChromeMain+0x4274ca8>
 427a044: a9408a81     	ldp	x1, x2, [x20, #0x8]
 427a048: 91034260     	add	x0, x19, #0xd0
 427a04c: 9708ba9a     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 427a050: 17ffffb7     	b	0x4279f2c <_ChromeMain+0x4274c90>
 427a054: 94d34e9a     	bl	0x774dabc <_ChromeMain+0x7748820>
 427a058: 52805801     	mov	w1, #0x2c0              ; =704
 427a05c: 96f63b97     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a060: 17ffffbc     	b	0x4279f50 <_ChromeMain+0x4274cb4>
 427a064: d4200020     	brk	#0x1
 427a068: a9400b21     	ldp	x1, x2, [x25]
 427a06c: d101c3a0     	sub	x0, x29, #0x70
 427a070: 96f6786a     	bl	0x18218 <_ChromeMain+0x12f7c>
 427a074: 1400004d     	b	0x427a1a8 <_ChromeMain+0x4274f0c>
 427a078: 52802f00     	mov	w0, #0x178              ; =376
 427a07c: 96f654bb     	bl	0xf368 <_ChromeMain+0xa0cc>
 427a080: 910022a9     	add	x9, x21, #0x8
 427a084: 52800028     	mov	w8, #0x1                ; =1
 427a088: b828012a     	ldadd	w8, w10, [x9]
 427a08c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 427a090: 6b09015f     	cmp	w10, w9
 427a094: 54002520     	b.eq	0x427a538 <_ChromeMain+0x427529c>
 427a098: 910022ca     	add	x10, x22, #0x8
 427a09c: b8280148     	ldadd	w8, w8, [x10]
 427a0a0: 6b09011f     	cmp	w8, w9
 427a0a4: 54002500     	b.eq	0x427a544 <_ChromeMain+0x42752a8>
 427a0a8: aa1c03e1     	mov	x1, x28
 427a0ac: aa1503e2     	mov	x2, x21
 427a0b0: aa1603e3     	mov	x3, x22
 427a0b4: d2800004     	mov	x4, #0x0                ; =0
 427a0b8: 97aba572     	bl	0x2d63680 <_ChromeMain+0x2d5e3e4>
 427a0bc: f940767c     	ldr	x28, [x19, #0xe8]
 427a0c0: f9001fe0     	str	x0, [sp, #0x38]
 427a0c4: f9007660     	str	x0, [x19, #0xe8]
 427a0c8: b40000fc     	cbz	x28, 0x427a0e4 <_ChromeMain+0x4274e48>
 427a0cc: aa1c03e0     	mov	x0, x28
 427a0d0: 97b7a856     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 427a0d4: 52802f01     	mov	w1, #0x178              ; =376
 427a0d8: 96f63b78     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a0dc: f9407668     	ldr	x8, [x19, #0xe8]
 427a0e0: f9001fe8     	str	x8, [sp, #0x38]
 427a0e4: f940275a     	ldr	x26, [x26, #0x48]
 427a0e8: f9400368     	ldr	x8, [x27]
 427a0ec: f940b508     	ldr	x8, [x8, #0x168]
 427a0f0: aa1b03e0     	mov	x0, x27
 427a0f4: d63f0100     	blr	x8
 427a0f8: aa0003fc     	mov	x28, x0
 427a0fc: 52800b00     	mov	w0, #0x58               ; =88
 427a100: 96f6549a     	bl	0xf368 <_ChromeMain+0xa0cc>
 427a104: aa0003fb     	mov	x27, x0
 427a108: 9004ff68     	adrp	x8, 0xe266000 <dyld_stub_binder+0xe266000>
 427a10c: 91372108     	add	x8, x8, #0xdc8
 427a110: f9000008     	str	x8, [x0]
 427a114: 6f00e400     	movi.2d	v0, #0000000000000000
 427a118: 3c808000     	stur	q0, [x0, #0x8]
 427a11c: 3c818000     	stur	q0, [x0, #0x18]
 427a120: b900281f     	str	wzr, [x0, #0x28]
 427a124: a9037c1f     	stp	xzr, xzr, [x0, #0x30]
 427a128: b900401f     	str	wzr, [x0, #0x40]
 427a12c: 52800100     	mov	w0, #0x8                ; =8
 427a130: 96f6548e     	bl	0xf368 <_ChromeMain+0xa0cc>
 427a134: b900001f     	str	wzr, [x0]
 427a138: 3900101f     	strb	wzr, [x0, #0x4]
 427a13c: b40000c0     	cbz	x0, 0x427a154 <_ChromeMain+0x4274eb8>
 427a140: 52800028     	mov	w8, #0x1                ; =1
 427a144: b8280008     	ldadd	w8, w8, [x0]
 427a148: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 427a14c: 6b09011f     	cmp	w8, w9
 427a150: 54002060     	b.eq	0x427a55c <_ChromeMain+0x42752c0>
 427a154: b90037f9     	str	w25, [sp, #0x34]
 427a158: a904ef60     	stp	x0, x27, [x27, #0x48]
 427a15c: 90056368     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 427a160: f9467d08     	ldr	x8, [x8, #0xcf8]
 427a164: f9414909     	ldr	x9, [x8, #0x290]
 427a168: a9026bfc     	stp	x28, x26, [sp, #0x20]
 427a16c: b4001fe9     	cbz	x9, 0x427a568 <_ChromeMain+0x42752cc>
 427a170: f9402939     	ldr	x25, [x9, #0x50]
 427a174: b4001ef9     	cbz	x25, 0x427a550 <_ChromeMain+0x42752b4>
 427a178: 52805800     	mov	w0, #0x2c0              ; =704
 427a17c: 96f6547b     	bl	0xf368 <_ChromeMain+0xa0cc>
 427a180: aa0003fc     	mov	x28, x0
 427a184: 9102a268     	add	x8, x19, #0xa8
 427a188: f100027f     	cmp	x19, #0x0
 427a18c: 9a8803fa     	csel	x26, xzr, x8, eq
 427a190: 39c05f28     	ldrsb	w8, [x25, #0x17]
 427a194: 37fff6a8     	tbnz	w8, #0x1f, 0x427a068 <_ChromeMain+0x4274dcc>
 427a198: 3dc00320     	ldr	q0, [x25]
 427a19c: f9400b28     	ldr	x8, [x25, #0x10]
 427a1a0: f81a03a8     	stur	x8, [x29, #-0x60]
 427a1a4: 3c9903a0     	stur	q0, [x29, #-0x70]
 427a1a8: d101c3a8     	sub	x8, x29, #0x70
 427a1ac: a900a3fb     	stp	x27, x8, [sp, #0x8]
 427a1b0: a9420fe8     	ldp	x8, x3, [sp, #0x20]
 427a1b4: f90003e8     	str	x8, [sp]
 427a1b8: aa1c03e0     	mov	x0, x28
 427a1bc: aa1a03e1     	mov	x1, x26
 427a1c0: a9439fe2     	ldp	x2, x7, [sp, #0x38]
 427a1c4: aa1703e4     	mov	x4, x23
 427a1c8: aa1803e5     	mov	x5, x24
 427a1cc: f94027e6     	ldr	x6, [sp, #0x48]
 427a1d0: 97f9cf89     	bl	0x40edff4 <_ChromeMain+0x40e8d58>
 427a1d4: 38da73a8     	ldursb	w8, [x29, #-0x59]
 427a1d8: b94037f9     	ldr	w25, [sp, #0x34]
 427a1dc: 36f800a8     	tbz	w8, #0x1f, 0x427a1f0 <_ChromeMain+0x4274f54>
 427a1e0: f85903a0     	ldur	x0, [x29, #-0x70]
 427a1e4: f85a03a8     	ldur	x8, [x29, #-0x60]
 427a1e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427a1ec: 96f63b33     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a1f0: f9407a60     	ldr	x0, [x19, #0xf0]
 427a1f4: f9007a7c     	str	x28, [x19, #0xf0]
 427a1f8: b5001880     	cbnz	x0, 0x427a508 <_ChromeMain+0x427526c>
 427a1fc: 910022c8     	add	x8, x22, #0x8
 427a200: 12800009     	mov	w9, #-0x1               ; =-1
 427a204: b8e90108     	ldaddal	w9, w8, [x8]
 427a208: 7100051f     	cmp	w8, #0x1
 427a20c: 54000061     	b.ne	0x427a218 <_ChromeMain+0x4274f7c>
 427a210: aa1603e0     	mov	x0, x22
 427a214: 9791b852     	bl	0x26e835c <_ChromeMain+0x26e30c0>
 427a218: b4000115     	cbz	x21, 0x427a238 <_ChromeMain+0x4274f9c>
 427a21c: 910022a8     	add	x8, x21, #0x8
 427a220: 12800009     	mov	w9, #-0x1               ; =-1
 427a224: b8e90108     	ldaddal	w9, w8, [x8]
 427a228: 7100051f     	cmp	w8, #0x1
 427a22c: 54000061     	b.ne	0x427a238 <_ChromeMain+0x4274f9c>
 427a230: aa1503e0     	mov	x0, x21
 427a234: 9791b84a     	bl	0x26e835c <_ChromeMain+0x26e30c0>
 427a238: 37001119     	tbnz	w25, #0x0, 0x427a458 <_ChromeMain+0x42751bc>
 427a23c: aa1303e0     	mov	x0, x19
 427a240: 97fffe05     	bl	0x4279a54 <_ChromeMain+0x42747b8>
 427a244: 528000c8     	mov	w8, #0x6                ; =6
 427a248: 39019fe8     	strb	w8, [sp, #0x67]
 427a24c: 910143e8     	add	x8, sp, #0x50
 427a250: b27f0509     	orr	x9, x8, #0x6
 427a254: 9004648a     	adrp	x10, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427a258: 9110c14a     	add	x10, x10, #0x430
 427a25c: eb0a013f     	cmp	x9, x10
 427a260: fa4a8102     	ccmp	x8, x10, #0x2, hi
 427a264: 54fff009     	b.ls	0x427a064 <_ChromeMain+0x4274dc8>
 427a268: 528c8ca8     	mov	w8, #0x6465             ; =25701
 427a26c: 7900abe8     	strh	w8, [sp, #0x54]
 427a270: 528c2cc8     	mov	w8, #0x6166             ; =24934
 427a274: 72ad8d28     	movk	w8, #0x6c69, lsl #16
 427a278: b90053e8     	str	w8, [sp, #0x50]
 427a27c: 39015bff     	strb	wzr, [sp, #0x56]
 427a280: 52800400     	mov	w0, #0x20               ; =32
 427a284: 96f65439     	bl	0xf368 <_ChromeMain+0xa0cc>
 427a288: 91006c09     	add	x9, x0, #0x1b
 427a28c: eb00013f     	cmp	x9, x0
 427a290: 54ffeea3     	b.lo	0x427a064 <_ChromeMain+0x4274dc8>
 427a294: aa0003f4     	mov	x20, x0
 427a298: 90046488     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427a29c: 91115908     	add	x8, x8, #0x456
 427a2a0: eb08013f     	cmp	x9, x8
 427a2a4: fa488002     	ccmp	x0, x8, #0x2, hi
 427a2a8: 54ffede9     	b.ls	0x427a064 <_ChromeMain+0x4274dc8>
 427a2ac: 3dc00100     	ldr	q0, [x8]
 427a2b0: 3d800280     	str	q0, [x20]
 427a2b4: 3cc0b100     	ldur	q0, [x8, #0xb]
 427a2b8: 3c80b280     	stur	q0, [x20, #0xb]
 427a2bc: 39006e9f     	strb	wzr, [x20, #0x1b]
 427a2c0: 91016275     	add	x21, x19, #0x58
 427a2c4: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427a2c8: 37f81168     	tbnz	w8, #0x1f, 0x427a4f4 <_ChromeMain+0x4275258>
 427a2cc: 3dc017e0     	ldr	q0, [sp, #0x50]
 427a2d0: 3d8002a0     	str	q0, [x21]
 427a2d4: f94033e8     	ldr	x8, [sp, #0x60]
 427a2d8: f9000aa8     	str	x8, [x21, #0x10]
 427a2dc: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 427a2e0: 37f81008     	tbnz	w8, #0x1f, 0x427a4e0 <_ChromeMain+0x4275244>
 427a2e4: f9004a74     	str	x20, [x19, #0x90]
 427a2e8: b004e608     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 427a2ec: 3dc0f100     	ldr	q0, [x8, #0x3c0]
 427a2f0: 1400002c     	b	0x427a3a0 <_ChromeMain+0x4275104>
 427a2f4: 528000c8     	mov	w8, #0x6                ; =6
 427a2f8: 3901ffe8     	strb	w8, [sp, #0x7f]
 427a2fc: 9101a3e8     	add	x8, sp, #0x68
 427a300: b27f0509     	orr	x9, x8, #0x6
 427a304: 9004648a     	adrp	x10, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427a308: 9110c14a     	add	x10, x10, #0x430
 427a30c: eb0a013f     	cmp	x9, x10
 427a310: fa4a8102     	ccmp	x8, x10, #0x2, hi
 427a314: 54ffea89     	b.ls	0x427a064 <_ChromeMain+0x4274dc8>
 427a318: 528c8ca8     	mov	w8, #0x6465             ; =25701
 427a31c: 7900dbe8     	strh	w8, [sp, #0x6c]
 427a320: 528c2cc8     	mov	w8, #0x6166             ; =24934
 427a324: 72ad8d28     	movk	w8, #0x6c69, lsl #16
 427a328: b9006be8     	str	w8, [sp, #0x68]
 427a32c: 3901bbff     	strb	wzr, [sp, #0x6e]
 427a330: 52800400     	mov	w0, #0x20               ; =32
 427a334: 96f6540d     	bl	0xf368 <_ChromeMain+0xa0cc>
 427a338: 91007809     	add	x9, x0, #0x1e
 427a33c: eb00013f     	cmp	x9, x0
 427a340: 54ffe923     	b.lo	0x427a064 <_ChromeMain+0x4274dc8>
 427a344: aa0003f4     	mov	x20, x0
 427a348: 90046488     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427a34c: 9110dd08     	add	x8, x8, #0x437
 427a350: eb08013f     	cmp	x9, x8
 427a354: fa488002     	ccmp	x0, x8, #0x2, hi
 427a358: 54ffe869     	b.ls	0x427a064 <_ChromeMain+0x4274dc8>
 427a35c: 3dc00100     	ldr	q0, [x8]
 427a360: 3d800280     	str	q0, [x20]
 427a364: 3cc0e100     	ldur	q0, [x8, #0xe]
 427a368: 3c80e280     	stur	q0, [x20, #0xe]
 427a36c: 39007a9f     	strb	wzr, [x20, #0x1e]
 427a370: 91016275     	add	x21, x19, #0x58
 427a374: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427a378: 37f80a08     	tbnz	w8, #0x1f, 0x427a4b8 <_ChromeMain+0x427521c>
 427a37c: 3cc683e0     	ldur	q0, [sp, #0x68]
 427a380: 3d8002a0     	str	q0, [x21]
 427a384: f9403fe8     	ldr	x8, [sp, #0x78]
 427a388: f9000aa8     	str	x8, [x21, #0x10]
 427a38c: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 427a390: 37f809e8     	tbnz	w8, #0x1f, 0x427a4cc <_ChromeMain+0x4275230>
 427a394: f9004a74     	str	x20, [x19, #0x90]
 427a398: b004e608     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 427a39c: 3dc10500     	ldr	q0, [x8, #0x410]
 427a3a0: 3c898260     	stur	q0, [x19, #0x98]
 427a3a4: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 427a3a8: 37f80448     	tbnz	w8, #0x1f, 0x427a430 <_ChromeMain+0x4275194>
 427a3ac: 3901e27f     	strb	wzr, [x19, #0x78]
 427a3b0: 39023e7f     	strb	wzr, [x19, #0x8f]
 427a3b4: 3941be69     	ldrb	w9, [x19, #0x6f]
 427a3b8: 13001d28     	sxtb	w8, w9
 427a3bc: f940326a     	ldr	x10, [x19, #0x60]
 427a3c0: 7100011f     	cmp	w8, #0x0
 427a3c4: 9a894149     	csel	x9, x10, x9, mi
 427a3c8: f100253f     	cmp	x9, #0x9
 427a3cc: 540001a1     	b.ne	0x427a400 <_ChromeMain+0x4275164>
 427a3d0: f94002a9     	ldr	x9, [x21]
 427a3d4: 7100011f     	cmp	w8, #0x0
 427a3d8: 9a954128     	csel	x8, x9, x21, mi
 427a3dc: f9400109     	ldr	x9, [x8]
 427a3e0: 39402108     	ldrb	w8, [x8, #0x8]
 427a3e4: 7101911f     	cmp	w8, #0x64
 427a3e8: d28eae68     	mov	x8, #0x7573             ; =30067
 427a3ec: f2ac6c68     	movk	x8, #0x6363, lsl #16
 427a3f0: f2ccaca8     	movk	x8, #0x6565, lsl #32
 427a3f4: f2ecac88     	movk	x8, #0x6564, lsl #48
 427a3f8: fa480120     	ccmp	x9, x8, #0x0, eq
 427a3fc: 54000220     	b.eq	0x427a440 <_ChromeMain+0x42751a4>
 427a400: fd403a60     	ldr	d0, [x19, #0x70]
 427a404: fd003a60     	str	d0, [x19, #0x70]
 427a408: aa1303e0     	mov	x0, x19
 427a40c: 97fffd2e     	bl	0x42798c4 <_ChromeMain+0x4274628>
 427a410: a94f7bfd     	ldp	x29, x30, [sp, #0xf0]
 427a414: a94e4ff4     	ldp	x20, x19, [sp, #0xe0]
 427a418: a94d57f6     	ldp	x22, x21, [sp, #0xd0]
 427a41c: a94c5ff8     	ldp	x24, x23, [sp, #0xc0]
 427a420: a94b67fa     	ldp	x26, x25, [sp, #0xb0]
 427a424: a94a6ffc     	ldp	x28, x27, [sp, #0xa0]
 427a428: 910403ff     	add	sp, sp, #0x100
 427a42c: d65f03c0     	ret
 427a430: f9403e68     	ldr	x8, [x19, #0x78]
 427a434: 3900011f     	strb	wzr, [x8]
 427a438: f900427f     	str	xzr, [x19, #0x80]
 427a43c: 17ffffde     	b	0x427a3b4 <_ChromeMain+0x4275118>
 427a440: 1e6e1000     	fmov	d0, #1.00000000
 427a444: 17fffff0     	b	0x427a404 <_ChromeMain+0x4275168>
 427a448: 528000e8     	mov	w8, #0x7                ; =7
 427a44c: f9003268     	str	x8, [x19, #0x60]
 427a450: f9402e68     	ldr	x8, [x19, #0x58]
 427a454: 14000006     	b	0x427a46c <_ChromeMain+0x42751d0>
 427a458: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427a45c: 37ffff68     	tbnz	w8, #0x1f, 0x427a448 <_ChromeMain+0x42751ac>
 427a460: 91016268     	add	x8, x19, #0x58
 427a464: 528000e9     	mov	w9, #0x7                ; =7
 427a468: 3901be69     	strb	w9, [x19, #0x6f]
 427a46c: 528d2dc9     	mov	w9, #0x696e             ; =26990
 427a470: 72acedc9     	movk	w9, #0x676e, lsl #16
 427a474: b8003109     	stur	w9, [x8, #0x3]
 427a478: 528eae49     	mov	w9, #0x7572             ; =30066
 427a47c: 72adcdc9     	movk	w9, #0x6e6e, lsl #16
 427a480: b9000109     	str	w9, [x8]
 427a484: 39001d1f     	strb	wzr, [x8, #0x7]
 427a488: d2828f68     	mov	x8, #0x147b             ; =5243
 427a48c: f2a8f5c8     	movk	x8, #0x47ae, lsl #16
 427a490: f2cf5c28     	movk	x8, #0x7ae1, lsl #32
 427a494: f2e7f688     	movk	x8, #0x3fb4, lsl #48
 427a498: f9003a68     	str	x8, [x19, #0x70]
 427a49c: aa1303e0     	mov	x0, x19
 427a4a0: 97fffd09     	bl	0x42798c4 <_ChromeMain+0x4274628>
 427a4a4: f9407a60     	ldr	x0, [x19, #0xf0]
 427a4a8: 39432262     	ldrb	w2, [x19, #0xc8]
 427a4ac: 91008281     	add	x1, x20, #0x20
 427a4b0: 97f9cfff     	bl	0x40ee4ac <_ChromeMain+0x40e9210>
 427a4b4: 17ffffd7     	b	0x427a410 <_ChromeMain+0x4275174>
 427a4b8: f9402e60     	ldr	x0, [x19, #0x58]
 427a4bc: f9403668     	ldr	x8, [x19, #0x68]
 427a4c0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427a4c4: 96f63a7d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a4c8: 17ffffad     	b	0x427a37c <_ChromeMain+0x42750e0>
 427a4cc: f9404a60     	ldr	x0, [x19, #0x90]
 427a4d0: f9405268     	ldr	x8, [x19, #0xa0]
 427a4d4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427a4d8: 96f63a78     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a4dc: 17ffffae     	b	0x427a394 <_ChromeMain+0x42750f8>
 427a4e0: f9404a60     	ldr	x0, [x19, #0x90]
 427a4e4: f9405268     	ldr	x8, [x19, #0xa0]
 427a4e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427a4ec: 96f63a73     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a4f0: 17ffff7d     	b	0x427a2e4 <_ChromeMain+0x4275048>
 427a4f4: f9402e60     	ldr	x0, [x19, #0x58]
 427a4f8: f9403668     	ldr	x8, [x19, #0x68]
 427a4fc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427a500: 96f63a6e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a504: 17ffff72     	b	0x427a2cc <_ChromeMain+0x4275030>
 427a508: 94d34d6d     	bl	0x774dabc <_ChromeMain+0x7748820>
 427a50c: 52805801     	mov	w1, #0x2c0              ; =704
 427a510: 96f63a6a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a514: 17ffff3a     	b	0x427a1fc <_ChromeMain+0x4274f60>
 427a518: 13001d49     	sxtb	w9, w10
 427a51c: 7100013f     	cmp	w9, #0x0
 427a520: a940ae89     	ldp	x9, x11, [x20, #0x8]
 427a524: 9a884121     	csel	x1, x9, x8, mi
 427a528: 9a8a4162     	csel	x2, x11, x10, mi
 427a52c: 91034260     	add	x0, x19, #0xd0
 427a530: 9708b9b4     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 427a534: 17fffe7e     	b	0x4279f2c <_ChromeMain+0x4274c90>
 427a538: d4200000     	brk	#0
 427a53c: d4400000     	hlt	#0
 427a540: d4200020     	brk	#0x1
 427a544: d4200000     	brk	#0
 427a548: d4400000     	hlt	#0
 427a54c: d4200020     	brk	#0x1
 427a550: d4200000     	brk	#0
 427a554: d4400000     	hlt	#0
 427a558: d4200020     	brk	#0x1
 427a55c: d4200000     	brk	#0
 427a560: d4400000     	hlt	#0
 427a564: d4200020     	brk	#0x1
 427a568: f9400900     	ldr	x0, [x8, #0x10]
 427a56c: 978548a3     	bl	0x23cc7f8 <_ChromeMain+0x23c755c>
 427a570: 91004019     	add	x25, x0, #0x10
 427a574: 17ffff01     	b	0x427a178 <_ChromeMain+0x4274edc>
 427a578: b40008c0     	cbz	x0, 0x427a690 <_ChromeMain+0x42753f4>
 427a57c: d10183ff     	sub	sp, sp, #0x60
 427a580: a9044ff4     	stp	x20, x19, [sp, #0x40]
 427a584: a9057bfd     	stp	x29, x30, [sp, #0x50]
 427a588: 910143fd     	add	x29, sp, #0x50
 427a58c: aa0103f3     	mov	x19, x1
 427a590: aa0003f4     	mov	x20, x0
 427a594: f9400409     	ldr	x9, [x0, #0x8]
 427a598: 910023e8     	add	x8, sp, #0x8
 427a59c: d63f0120     	blr	x9
 427a5a0: 12800008     	mov	w8, #-0x1               ; =-1
 427a5a4: b8e80288     	ldaddal	w8, w8, [x20]
 427a5a8: 7100051f     	cmp	w8, #0x1
 427a5ac: 54000081     	b.ne	0x427a5bc <_ChromeMain+0x4275320>
 427a5b0: f9400a88     	ldr	x8, [x20, #0x10]
 427a5b4: aa1403e0     	mov	x0, x20
 427a5b8: d63f0100     	blr	x8
 427a5bc: 52800700     	mov	w0, #0x38               ; =56
 427a5c0: 96f6536a     	bl	0xf368 <_ChromeMain+0xa0cc>
 427a5c4: 394023e8     	ldrb	w8, [sp, #0x8]
 427a5c8: 39000008     	strb	w8, [x0]
 427a5cc: 3cc103e0     	ldur	q0, [sp, #0x10]
 427a5d0: 3c808000     	stur	q0, [x0, #0x8]
 427a5d4: f94013e8     	ldr	x8, [sp, #0x20]
 427a5d8: f9000c08     	str	x8, [x0, #0x18]
 427a5dc: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 427a5e0: 3cc283e0     	ldur	q0, [sp, #0x28]
 427a5e4: 3d800800     	str	q0, [x0, #0x20]
 427a5e8: f9401fe8     	ldr	x8, [sp, #0x38]
 427a5ec: f9001808     	str	x8, [x0, #0x30]
 427a5f0: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 427a5f4: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 427a5f8: f9400274     	ldr	x20, [x19]
 427a5fc: f9000260     	str	x0, [x19]
 427a600: b4000154     	cbz	x20, 0x427a628 <_ChromeMain+0x427538c>
 427a604: 39c0de88     	ldrsb	w8, [x20, #0x37]
 427a608: 37f803a8     	tbnz	w8, #0x1f, 0x427a67c <_ChromeMain+0x42753e0>
 427a60c: 39c07e88     	ldrsb	w8, [x20, #0x1f]
 427a610: 37f802c8     	tbnz	w8, #0x1f, 0x427a668 <_ChromeMain+0x42753cc>
 427a614: aa1403e0     	mov	x0, x20
 427a618: 52800701     	mov	w1, #0x38               ; =56
 427a61c: 96f63a27     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a620: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 427a624: 37f800e8     	tbnz	w8, #0x1f, 0x427a640 <_ChromeMain+0x42753a4>
 427a628: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 427a62c: 37f80148     	tbnz	w8, #0x1f, 0x427a654 <_ChromeMain+0x42753b8>
 427a630: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 427a634: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 427a638: 910183ff     	add	sp, sp, #0x60
 427a63c: d65f03c0     	ret
 427a640: f94017e0     	ldr	x0, [sp, #0x28]
 427a644: f9401fe8     	ldr	x8, [sp, #0x38]
 427a648: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427a64c: 96f63a1b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a650: 17fffff6     	b	0x427a628 <_ChromeMain+0x427538c>
 427a654: f9400be0     	ldr	x0, [sp, #0x10]
 427a658: f94013e8     	ldr	x8, [sp, #0x20]
 427a65c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427a660: 96f63a16     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a664: 17fffff3     	b	0x427a630 <_ChromeMain+0x4275394>
 427a668: f9400680     	ldr	x0, [x20, #0x8]
 427a66c: f9400e88     	ldr	x8, [x20, #0x18]
 427a670: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427a674: 96f63a11     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a678: 17ffffe7     	b	0x427a614 <_ChromeMain+0x4275378>
 427a67c: f9401280     	ldr	x0, [x20, #0x20]
 427a680: f9401a88     	ldr	x8, [x20, #0x30]
 427a684: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427a688: 96f63a0c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427a68c: 17ffffe0     	b	0x427a60c <_ChromeMain+0x4275370>
 427a690: d4200000     	brk	#0
 427a694: d4400000     	hlt	#0
 427a698: d4200020     	brk	#0x1
 427a69c: d10183ff     	sub	sp, sp, #0x60
 427a6a0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 427a6a4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 427a6a8: 910143fd     	add	x29, sp, #0x50
 427a6ac: f9400028     	ldr	x8, [x1]
 427a6b0: 39400109     	ldrb	w9, [x8]
 427a6b4: 390023e9     	strb	w9, [sp, #0x8]
 427a6b8: f9400d09     	ldr	x9, [x8, #0x18]
 427a6bc: 3cc08100     	ldur	q0, [x8, #0x8]
 427a6c0: 3c8103e0     	stur	q0, [sp, #0x10]
 427a6c4: f90013e9     	str	x9, [sp, #0x20]
 427a6c8: a9017d1f     	stp	xzr, xzr, [x8, #0x10]
 427a6cc: f900051f     	str	xzr, [x8, #0x8]
 427a6d0: 3dc00900     	ldr	q0, [x8, #0x20]
 427a6d4: f9401909     	ldr	x9, [x8, #0x30]
 427a6d8: f9001fe9     	str	x9, [sp, #0x38]
 427a6dc: 3c8283e0     	stur	q0, [sp, #0x28]
 427a6e0: a902fd1f     	stp	xzr, xzr, [x8, #0x28]
 427a6e4: f900111f     	str	xzr, [x8, #0x20]
 427a6e8: b40003c0     	cbz	x0, 0x427a760 <_ChromeMain+0x42754c4>
 427a6ec: aa0003f3     	mov	x19, x0
 427a6f0: f9400408     	ldr	x8, [x0, #0x8]
 427a6f4: 910023e1     	add	x1, sp, #0x8
 427a6f8: d63f0100     	blr	x8
 427a6fc: 12800008     	mov	w8, #-0x1               ; =-1
 427a700: b8e80268     	ldaddal	w8, w8, [x19]
 427a704: 7100051f     	cmp	w8, #0x1
 427a708: 54000081     	b.ne	0x427a718 <_ChromeMain+0x427547c>
 427a70c: f9400a68     	ldr	x8, [x19, #0x10]
 427a710: aa1303e0     	mov	x0, x19
 427a714: d63f0100     	blr	x8
 427a718: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 427a71c: 37f80188     	tbnz	w8, #0x1f, 0x427a74c <_ChromeMain+0x42754b0>
 427a720: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 427a724: 37f800a8     	tbnz	w8, #0x1f, 0x427a738 <_ChromeMain+0x427549c>
 427a728: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 427a72c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 427a730: 910183ff     	add	sp, sp, #0x60
 427a734: d65f03c0     	ret
 427a738: f9400be0     	ldr	x0, [sp, #0x10]
 427a73c: f94013e8     	ldr	x8, [sp, #0x20]
