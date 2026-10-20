
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45719a0: d10783ff     	sub	sp, sp, #0x1e0
 45719a4: a9186ffc     	stp	x28, x27, [sp, #0x180]
 45719a8: a91967fa     	stp	x26, x25, [sp, #0x190]
 45719ac: a91a5ff8     	stp	x24, x23, [sp, #0x1a0]
 45719b0: a91b57f6     	stp	x22, x21, [sp, #0x1b0]
 45719b4: a91c4ff4     	stp	x20, x19, [sp, #0x1c0]
 45719b8: a91d7bfd     	stp	x29, x30, [sp, #0x1d0]
 45719bc: 910743fd     	add	x29, sp, #0x1d0
 45719c0: aa0003f6     	mov	x22, x0
 45719c4: f9400018     	ldr	x24, [x0]
 45719c8: b5000158     	cbnz	x24, 0x45719f0 <_ChromeMain+0x456c754>
 45719cc: aa1603e0     	mov	x0, x22
 45719d0: a95d7bfd     	ldp	x29, x30, [sp, #0x1d0]
 45719d4: a95c4ff4     	ldp	x20, x19, [sp, #0x1c0]
 45719d8: a95b57f6     	ldp	x22, x21, [sp, #0x1b0]
 45719dc: a95a5ff8     	ldp	x24, x23, [sp, #0x1a0]
 45719e0: a95967fa     	ldp	x26, x25, [sp, #0x190]
 45719e4: a9586ffc     	ldp	x28, x27, [sp, #0x180]
 45719e8: 910783ff     	add	sp, sp, #0x1e0
 45719ec: 17fff1f7     	b	0x456e1c8 <_ChromeMain+0x4568f2c>
 45719f0: aa0103f7     	mov	x23, x1
 45719f4: b0054ba8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 45719f8: f9467d00     	ldr	x0, [x8, #0xcf8]
 45719fc: b4000340     	cbz	x0, 0x4571a64 <_ChromeMain+0x456c7c8>
 4571a00: 9752b85e     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4571a04: b4000300     	cbz	x0, 0x4571a64 <_ChromeMain+0x456c7c8>
 4571a08: 9752b882     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4571a0c: aa1703e1     	mov	x1, x23
 4571a10: 9752b8bc     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4571a14: b4000280     	cbz	x0, 0x4571a64 <_ChromeMain+0x456c7c8>
 4571a18: d102e3a8     	sub	x8, x29, #0xb8
 4571a1c: 97efa3bb     	bl	0x415a908 <_ChromeMain+0x415566c>
 4571a20: a974d3b3     	ldp	x19, x20, [x29, #-0xb8]
 4571a24: f85583b9     	ldur	x25, [x29, #-0xa8]
 4571a28: 14000012     	b	0x4571a70 <_ChromeMain+0x456c7d4>
 4571a2c: f9400ea0     	ldr	x0, [x21, #0x18]
 4571a30: f94016a8     	ldr	x8, [x21, #0x28]
 4571a34: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4571a38: 96ea5d20     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4571a3c: 1400004e     	b	0x4571b74 <_ChromeMain+0x456c8d8>
 4571a40: f9401aa0     	ldr	x0, [x21, #0x30]
 4571a44: f94022a8     	ldr	x8, [x21, #0x40]
 4571a48: d37ff901     	lsl	x1, x8, #1
 4571a4c: 96ea5d1b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4571a50: 1400005f     	b	0x4571bcc <_ChromeMain+0x456c930>
 4571a54: a9400ae1     	ldp	x1, x2, [x23]
 4571a58: 910102c0     	add	x0, x22, #0x40
 4571a5c: 96ea99ef     	bl	0x18218 <_ChromeMain+0x12f7c>
 4571a60: 1400002b     	b	0x4571b0c <_ChromeMain+0x456c870>
 4571a64: d2800019     	mov	x25, #0x0               ; =0
 4571a68: d2800014     	mov	x20, #0x0               ; =0
 4571a6c: d2800013     	mov	x19, #0x0               ; =0
 4571a70: aa1603e0     	mov	x0, x22
 4571a74: 97fff1d5     	bl	0x456e1c8 <_ChromeMain+0x4568f2c>
 4571a78: 5280a700     	mov	w0, #0x538              ; =1336
 4571a7c: 96ea763b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4571a80: aa0003f5     	mov	x21, x0
 4571a84: d2800001     	mov	x1, #0x0                ; =0
 4571a88: 951f1e79     	bl	0x8d3946c <_ChromeMain+0x8d341d0>
 4571a8c: f81a83a0     	stur	x0, [x29, #-0x58]
 4571a90: f940c6da     	ldr	x26, [x22, #0x188]
 4571a94: b40000da     	cbz	x26, 0x4571aac <_ChromeMain+0x456c810>
 4571a98: 52800028     	mov	w8, #0x1                ; =1
 4571a9c: b8280348     	ldadd	w8, w8, [x26]
 4571aa0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4571aa4: 6b09011f     	cmp	w8, w9
 4571aa8: 54002560     	b.eq	0x4571f54 <_ChromeMain+0x456ccb8>
 4571aac: f940cadb     	ldr	x27, [x22, #0x190]
 4571ab0: 52800c00     	mov	w0, #0x60               ; =96
 4571ab4: 96ea762d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4571ab8: aa0003f6     	mov	x22, x0
 4571abc: 52800028     	mov	w8, #0x1                ; =1
 4571ac0: b9000008     	str	w8, [x0]
 4571ac4: 1008f768     	adr	x8, 0x45839b0 <_ChromeMain+0x457e714>
 4571ac8: d503201f     	nop
 4571acc: 1008fc29     	adr	x9, 0x4583a50 <_ChromeMain+0x457e7b4>
 4571ad0: d503201f     	nop
 4571ad4: a900a408     	stp	x8, x9, [x0, #0x8]
 4571ad8: b0ffd9e8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4571adc: 911b0108     	add	x8, x8, #0x6c0
 4571ae0: 10002529     	adr	x9, 0x4571f84 <_ChromeMain+0x456cce8>
 4571ae4: d503201f     	nop
 4571ae8: a901a408     	stp	x8, x9, [x0, #0x18]
 4571aec: a902e81f     	stp	xzr, x26, [x0, #0x28]
 4571af0: f9001c1b     	str	x27, [x0, #0x38]
 4571af4: 39c05ee8     	ldrsb	w8, [x23, #0x17]
 4571af8: 37fffae8     	tbnz	w8, #0x1f, 0x4571a54 <_ChromeMain+0x456c7b8>
 4571afc: 3dc002e0     	ldr	q0, [x23]
 4571b00: 3c8402c0     	stur	q0, [x22, #0x40]
 4571b04: f9400ae8     	ldr	x8, [x23, #0x10]
 4571b08: f80502c8     	stur	x8, [x22, #0x50]
 4571b0c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4571b10: b0053209     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4571b14: f9404529     	ldr	x9, [x9, #0x88]
 4571b18: eb09011f     	cmp	x8, x9
 4571b1c: 54000061     	b.ne	0x4571b28 <_ChromeMain+0x456c88c>
 4571b20: aa1503e0     	mov	x0, x21
 4571b24: 96ea89f6     	bl	0x142fc <_ChromeMain+0xf060>
 4571b28: f9002ed5     	str	x21, [x22, #0x58]
 4571b2c: 52800400     	mov	w0, #0x20               ; =32
 4571b30: 96ea760e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4571b34: 91006c09     	add	x9, x0, #0x1b
 4571b38: eb00013f     	cmp	x9, x0
 4571b3c: 540020a3     	b.lo	0x4571f50 <_ChromeMain+0x456ccb4>
 4571b40: aa0003f7     	mov	x23, x0
 4571b44: b004caa8     	adrp	x8, 0xdec6000 <dyld_stub_binder+0xdec6000>
 4571b48: 910aa108     	add	x8, x8, #0x2a8
 4571b4c: eb08013f     	cmp	x9, x8
 4571b50: fa488002     	ccmp	x0, x8, #0x2, hi
 4571b54: 54001fe9     	b.ls	0x4571f50 <_ChromeMain+0x456ccb4>
 4571b58: 3dc00100     	ldr	q0, [x8]
 4571b5c: 3d8002e0     	str	q0, [x23]
 4571b60: 3cc0b100     	ldur	q0, [x8, #0xb]
 4571b64: 3c80b2e0     	stur	q0, [x23, #0xb]
 4571b68: 39006eff     	strb	wzr, [x23, #0x1b]
 4571b6c: 39c0bea8     	ldrsb	w8, [x21, #0x2f]
 4571b70: 37fff5e8     	tbnz	w8, #0x1f, 0x4571a2c <_ChromeMain+0x456c790>
 4571b74: f9000eb7     	str	x23, [x21, #0x18]
 4571b78: d004ce48     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4571b7c: 3dc0f100     	ldr	q0, [x8, #0x3c0]
 4571b80: 3d800aa0     	str	q0, [x21, #0x20]
 4571b84: 52800400     	mov	w0, #0x20               ; =32
 4571b88: 96ea75f8     	bl	0xf368 <_ChromeMain+0xa0cc>
 4571b8c: 91006009     	add	x9, x0, #0x18
 4571b90: eb00013f     	cmp	x9, x0
 4571b94: 54001de3     	b.lo	0x4571f50 <_ChromeMain+0x456ccb4>
 4571b98: aa0003f7     	mov	x23, x0
 4571b9c: b004d0a8     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 4571ba0: 91392908     	add	x8, x8, #0xe4a
 4571ba4: eb08013f     	cmp	x9, x8
 4571ba8: fa488002     	ccmp	x0, x8, #0x2, hi
 4571bac: 54001d29     	b.ls	0x4571f50 <_ChromeMain+0x456ccb4>
 4571bb0: 3dc00100     	ldr	q0, [x8]
 4571bb4: 3d8002e0     	str	q0, [x23]
 4571bb8: f9400908     	ldr	x8, [x8, #0x10]
 4571bbc: f9000ae8     	str	x8, [x23, #0x10]
 4571bc0: 790032ff     	strh	wzr, [x23, #0x18]
 4571bc4: 39c11ea8     	ldrsb	w8, [x21, #0x47]
 4571bc8: 37fff3c8     	tbnz	w8, #0x1f, 0x4571a40 <_ChromeMain+0x456c7a4>
 4571bcc: f9001ab7     	str	x23, [x21, #0x30]
 4571bd0: d004ce68     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4571bd4: 3dc18d00     	ldr	q0, [x8, #0x630]
 4571bd8: 3d8003e0     	str	q0, [sp]
 4571bdc: 3c8382a0     	stur	q0, [x21, #0x38]
 4571be0: 52800a00     	mov	w0, #0x50               ; =80
 4571be4: 96ea75e1     	bl	0xf368 <_ChromeMain+0xa0cc>
 4571be8: 91011009     	add	x9, x0, #0x44
 4571bec: eb00013f     	cmp	x9, x0
 4571bf0: 54001b03     	b.lo	0x4571f50 <_ChromeMain+0x456ccb4>
 4571bf4: aa0003f7     	mov	x23, x0
 4571bf8: b004d0a8     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 4571bfc: 91399108     	add	x8, x8, #0xe64
 4571c00: eb08013f     	cmp	x9, x8
 4571c04: fa488002     	ccmp	x0, x8, #0x2, hi
 4571c08: 54001a49     	b.ls	0x4571f50 <_ChromeMain+0x456ccb4>
 4571c0c: 52800ca9     	mov	w9, #0x65               ; =101
 4571c10: 72a005c9     	movk	w9, #0x2e, lsl #16
 4571c14: b90042e9     	str	w9, [x23, #0x40]
 4571c18: 910283fa     	add	x26, sp, #0xa0
 4571c1c: ad400500     	ldp	q0, q1, [x8]
 4571c20: ad0006e0     	stp	q0, q1, [x23]
 4571c24: ad410500     	ldp	q0, q1, [x8, #0x20]
 4571c28: ad0106e0     	stp	q0, q1, [x23, #0x20]
 4571c2c: 79008aff     	strh	wzr, [x23, #0x44]
 4571c30: 39c1dea8     	ldrsb	w8, [x21, #0x77]
 4571c34: 37f80968     	tbnz	w8, #0x1f, 0x4571d60 <_ChromeMain+0x456cac4>
 4571c38: f90032b7     	str	x23, [x21, #0x60]
 4571c3c: d004ce68     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4571c40: 3dc0a900     	ldr	q0, [x8, #0x2a0]
 4571c44: 3c8682a0     	stur	q0, [x21, #0x68]
 4571c48: a9395bbf     	stp	xzr, x22, [x29, #-0x70]
 4571c4c: 52800035     	mov	w21, #0x1               ; =1
 4571c50: 381a03b5     	sturb	w21, [x29, #-0x60]
 4571c54: 381483b5     	sturb	w21, [x29, #-0xb8]
 4571c58: 381743bf     	sturb	wzr, [x29, #-0x8c]
 4571c5c: 6f00e400     	movi.2d	v0, #0000000000000000
 4571c60: ad040340     	stp	q0, q0, [x26, #0x80]
 4571c64: 381703bf     	sturb	wzr, [x29, #-0x90]
 4571c68: 381783b5     	sturb	w21, [x29, #-0x88]
 4571c6c: d10343a8     	sub	x8, x29, #0xd0
 4571c70: 91002109     	add	x9, x8, #0x8
 4571c74: b004d0aa     	adrp	x10, 0xdf86000 <dyld_stub_binder+0xdf86000>
 4571c78: 913aa94a     	add	x10, x10, #0xeaa
 4571c7c: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 4571c80: eb0a013f     	cmp	x9, x10
 4571c84: 52800089     	mov	w9, #0x4                ; =4
 4571c88: fa4a8102     	ccmp	x8, x10, #0x2, hi
 4571c8c: 381473a9     	sturb	w9, [x29, #-0xb9]
 4571c90: 54001609     	b.ls	0x4571f50 <_ChromeMain+0x456ccb4>
 4571c94: d2800a68     	mov	x8, #0x53               ; =83
 4571c98: f2a00c28     	movk	x8, #0x61, lsl #16
 4571c9c: f2c00ec8     	movk	x8, #0x76, lsl #32
 4571ca0: f2e00ca8     	movk	x8, #0x65, lsl #48
 4571ca4: f81303a8     	stur	x8, [x29, #-0xd0]
 4571ca8: 781383bf     	sturh	wzr, [x29, #-0xc8]
 4571cac: d102e3a0     	sub	x0, x29, #0xb8
 4571cb0: d10343a1     	sub	x1, x29, #0xd0
 4571cb4: 951f1c70     	bl	0x8d38e74 <_ChromeMain+0x8d33bd8>
 4571cb8: aa0003e2     	mov	x2, x0
 4571cbc: d10163a0     	sub	x0, x29, #0x58
 4571cc0: d101a3a1     	sub	x1, x29, #0x68
 4571cc4: 951f1d1c     	bl	0x8d39134 <_ChromeMain+0x8d33e98>
 4571cc8: 381283bf     	sturb	wzr, [x29, #-0xd8]
 4571ccc: 390283f5     	strb	w21, [sp, #0xa0]
 4571cd0: 390333ff     	strb	wzr, [sp, #0xcc]
 4571cd4: 6f00e400     	movi.2d	v0, #0000000000000000
 4571cd8: 3c808340     	stur	q0, [x26, #0x8]
 4571cdc: 3c818340     	stur	q0, [x26, #0x18]
 4571ce0: 390323ff     	strb	wzr, [sp, #0xc8]
 4571ce4: 390343f5     	strb	w21, [sp, #0xd0]
 4571ce8: a90e7fff     	stp	xzr, xzr, [sp, #0xe0]
 4571cec: 910223e9     	add	x9, sp, #0x88
 4571cf0: 9100312a     	add	x10, x9, #0xc
 4571cf4: b004d0a8     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 4571cf8: 913ad108     	add	x8, x8, #0xeb4
 4571cfc: f9006fff     	str	xzr, [sp, #0xd8]
 4571d00: eb08015f     	cmp	x10, x8
 4571d04: 528000ca     	mov	w10, #0x6               ; =6
 4571d08: fa488122     	ccmp	x9, x8, #0x2, hi
 4571d0c: 39027fea     	strb	w10, [sp, #0x9f]
 4571d10: 54001209     	b.ls	0x4571f50 <_ChromeMain+0x456ccb4>
 4571d14: 52800ca9     	mov	w9, #0x65               ; =101
 4571d18: 72a00d89     	movk	w9, #0x6c, lsl #16
 4571d1c: b90093e9     	str	w9, [sp, #0x90]
 4571d20: f9400108     	ldr	x8, [x8]
 4571d24: f90047e8     	str	x8, [sp, #0x88]
 4571d28: 79012bff     	strh	wzr, [sp, #0x94]
 4571d2c: 910283e0     	add	x0, sp, #0xa0
 4571d30: 910223e1     	add	x1, sp, #0x88
 4571d34: 951f1c50     	bl	0x8d38e74 <_ChromeMain+0x8d33bd8>
 4571d38: aa0003e2     	mov	x2, x0
 4571d3c: d10163a0     	sub	x0, x29, #0x58
 4571d40: d10383a1     	sub	x1, x29, #0xe0
 4571d44: 951f1d5e     	bl	0x8d392bc <_ChromeMain+0x8d34020>
 4571d48: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 4571d4c: f90043ff     	str	xzr, [sp, #0x80]
 4571d50: b7f80139     	tbnz	x25, #0x3f, 0x4571d74 <_ChromeMain+0x456cad8>
 4571d54: a905d3f3     	stp	x19, x20, [sp, #0x58]
 4571d58: f90037f9     	str	x25, [sp, #0x68]
 4571d5c: 1400000a     	b	0x4571d84 <_ChromeMain+0x456cae8>
 4571d60: f94032a0     	ldr	x0, [x21, #0x60]
 4571d64: f9403aa8     	ldr	x8, [x21, #0x70]
 4571d68: d37ff901     	lsl	x1, x8, #1
 4571d6c: 96ea5c53     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4571d70: 17ffffb2     	b	0x4571c38 <_ChromeMain+0x456c99c>
 4571d74: 910163e0     	add	x0, sp, #0x58
 4571d78: aa1303e1     	mov	x1, x19
 4571d7c: aa1403e2     	mov	x2, x20
 4571d80: 96eb5394     	bl	0x46bd0 <_ChromeMain+0x41934>
 4571d84: 52800028     	mov	w8, #0x1                ; =1
 4571d88: 390063e8     	strb	w8, [sp, #0x18]
 4571d8c: 6f00e400     	movi.2d	v0, #0000000000000000
 4571d90: ad0103e0     	stp	q0, q0, [sp, #0x20]
 4571d94: 3c8403e0     	stur	q0, [sp, #0x40]
 4571d98: f9002bff     	str	xzr, [sp, #0x50]
 4571d9c: 52800400     	mov	w0, #0x20               ; =32
 4571da0: 96ea7572     	bl	0xf368 <_ChromeMain+0xa0cc>
 4571da4: 91006009     	add	x9, x0, #0x18
 4571da8: eb00013f     	cmp	x9, x0
 4571dac: 54000d23     	b.lo	0x4571f50 <_ChromeMain+0x456ccb4>
 4571db0: b004d0a8     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 4571db4: 913b0908     	add	x8, x8, #0xec2
 4571db8: eb08013f     	cmp	x9, x8
 4571dbc: fa488002     	ccmp	x0, x8, #0x2, hi
 4571dc0: 54000c89     	b.ls	0x4571f50 <_ChromeMain+0x456ccb4>
 4571dc4: 3dc00100     	ldr	q0, [x8]
 4571dc8: 3d800000     	str	q0, [x0]
 4571dcc: f9400908     	ldr	x8, [x8, #0x10]
 4571dd0: f9000808     	str	x8, [x0, #0x10]
 4571dd4: 7900301f     	strh	wzr, [x0, #0x18]
 4571dd8: f90017e0     	str	x0, [sp, #0x28]
 4571ddc: 3dc003e0     	ldr	q0, [sp]
 4571de0: 3c8303e0     	stur	q0, [sp, #0x30]
 4571de4: 90052b34     	adrp	x20, 0xead5000 <dyld_stub_binder+0xead5000>
 4571de8: 910f6294     	add	x20, x20, #0x3d8
 4571dec: d10163a0     	sub	x0, x29, #0x58
 4571df0: 9101c3e2     	add	x2, sp, #0x70
 4571df4: 910163e3     	add	x3, sp, #0x58
 4571df8: 910063e4     	add	x4, sp, #0x18
 4571dfc: aa1403e1     	mov	x1, x20
 4571e00: 94e56d0f     	bl	0x7ecd23c <_ChromeMain+0x7ec7fa0>
 4571e04: f9400008     	ldr	x8, [x0]
 4571e08: f9412d09     	ldr	x9, [x8, #0x258]
 4571e0c: b5000aa9     	cbnz	x9, 0x4571f60 <_ChromeMain+0x456ccc4>
 4571e10: f9012d14     	str	x20, [x8, #0x258]
 4571e14: 910063e0     	add	x0, sp, #0x18
 4571e18: 951f250d     	bl	0x8d3b24c <_ChromeMain+0x8d35fb0>
 4571e1c: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 4571e20: 36f800a8     	tbz	w8, #0x1f, 0x4571e34 <_ChromeMain+0x456cb98>
 4571e24: f9402fe0     	ldr	x0, [sp, #0x58]
 4571e28: f94037e8     	ldr	x8, [sp, #0x68]
 4571e2c: d37ff901     	lsl	x1, x8, #1
 4571e30: 96ea5c22     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4571e34: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4571e38: 36f800a8     	tbz	w8, #0x1f, 0x4571e4c <_ChromeMain+0x456cbb0>
 4571e3c: f9403be0     	ldr	x0, [sp, #0x70]
 4571e40: f94043e8     	ldr	x8, [sp, #0x80]
 4571e44: d37ff901     	lsl	x1, x8, #1
 4571e48: 96ea5c1c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4571e4c: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 4571e50: 36f800a8     	tbz	w8, #0x1f, 0x4571e64 <_ChromeMain+0x456cbc8>
 4571e54: f94047e0     	ldr	x0, [sp, #0x88]
 4571e58: f9404fe8     	ldr	x8, [sp, #0x98]
 4571e5c: d37ff901     	lsl	x1, x8, #1
 4571e60: 96ea5c16     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4571e64: 910283e0     	add	x0, sp, #0xa0
 4571e68: 951f1be3     	bl	0x8d38df4 <_ChromeMain+0x8d33b58>
 4571e6c: 385283a8     	ldurb	w8, [x29, #-0xd8]
 4571e70: 51000508     	sub	w8, w8, #0x1
 4571e74: 7103f51f     	cmp	w8, #0xfd
 4571e78: 54000068     	b.hi	0x4571e84 <_ChromeMain+0x456cbe8>
 4571e7c: f85203a0     	ldur	x0, [x29, #-0xe0]
 4571e80: b50005a0     	cbnz	x0, 0x4571f34 <_ChromeMain+0x456cc98>
 4571e84: 52801fe8     	mov	w8, #0xff               ; =255
 4571e88: 381283a8     	sturb	w8, [x29, #-0xd8]
 4571e8c: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 4571e90: 36f800a8     	tbz	w8, #0x1f, 0x4571ea4 <_ChromeMain+0x456cc08>
 4571e94: f85303a0     	ldur	x0, [x29, #-0xd0]
 4571e98: f85403a8     	ldur	x8, [x29, #-0xc0]
 4571e9c: d37ff901     	lsl	x1, x8, #1
 4571ea0: 96ea5c06     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4571ea4: d102e3a0     	sub	x0, x29, #0xb8
 4571ea8: 951f1bd3     	bl	0x8d38df4 <_ChromeMain+0x8d33b58>
 4571eac: 385a03a8     	ldurb	w8, [x29, #-0x60]
 4571eb0: 51000508     	sub	w8, w8, #0x1
 4571eb4: 7103f51f     	cmp	w8, #0xfd
 4571eb8: 54000068     	b.hi	0x4571ec4 <_ChromeMain+0x456cc28>
 4571ebc: f85983a0     	ldur	x0, [x29, #-0x68]
 4571ec0: b50002c0     	cbnz	x0, 0x4571f18 <_ChromeMain+0x456cc7c>
 4571ec4: 52801fe8     	mov	w8, #0xff               ; =255
 4571ec8: 381a03a8     	sturb	w8, [x29, #-0x60]
 4571ecc: f85a83a1     	ldur	x1, [x29, #-0x58]
 4571ed0: b40004e1     	cbz	x1, 0x4571f6c <_ChromeMain+0x456ccd0>
 4571ed4: f81a83bf     	stur	xzr, [x29, #-0x58]
 4571ed8: 9100a300     	add	x0, x24, #0x28
 4571edc: 95b4b422     	bl	0xb29ef64 <_ChromeMain+0xb299cc8>
 4571ee0: f85a83a8     	ldur	x8, [x29, #-0x58]
 4571ee4: b50004a8     	cbnz	x8, 0x4571f78 <_ChromeMain+0x456ccdc>
 4571ee8: b6f80099     	tbz	x25, #0x3f, 0x4571ef8 <_ChromeMain+0x456cc5c>
 4571eec: d37ffb21     	lsl	x1, x25, #1
 4571ef0: aa1303e0     	mov	x0, x19
 4571ef4: 96ea5bf1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4571ef8: a95d7bfd     	ldp	x29, x30, [sp, #0x1d0]
 4571efc: a95c4ff4     	ldp	x20, x19, [sp, #0x1c0]
 4571f00: a95b57f6     	ldp	x22, x21, [sp, #0x1b0]
 4571f04: a95a5ff8     	ldp	x24, x23, [sp, #0x1a0]
 4571f08: a95967fa     	ldp	x26, x25, [sp, #0x190]
 4571f0c: a9586ffc     	ldp	x28, x27, [sp, #0x180]
 4571f10: 910783ff     	add	sp, sp, #0x1e0
 4571f14: d65f03c0     	ret
 4571f18: 12800008     	mov	w8, #-0x1               ; =-1
 4571f1c: b8e80008     	ldaddal	w8, w8, [x0]
 4571f20: 7100051f     	cmp	w8, #0x1
 4571f24: 54fffd01     	b.ne	0x4571ec4 <_ChromeMain+0x456cc28>
 4571f28: f9400808     	ldr	x8, [x0, #0x10]
 4571f2c: d63f0100     	blr	x8
 4571f30: 17ffffe5     	b	0x4571ec4 <_ChromeMain+0x456cc28>
 4571f34: 12800008     	mov	w8, #-0x1               ; =-1
 4571f38: b8e80008     	ldaddal	w8, w8, [x0]
 4571f3c: 7100051f     	cmp	w8, #0x1
 4571f40: 54fffa21     	b.ne	0x4571e84 <_ChromeMain+0x456cbe8>
 4571f44: f9400808     	ldr	x8, [x0, #0x10]
 4571f48: d63f0100     	blr	x8
 4571f4c: 17ffffce     	b	0x4571e84 <_ChromeMain+0x456cbe8>
 4571f50: d4200020     	brk	#0x1
 4571f54: d4200000     	brk	#0
 4571f58: d4400000     	hlt	#0
 4571f5c: 17fffffd     	b	0x4571f50 <_ChromeMain+0x456ccb4>
 4571f60: d4200000     	brk	#0
 4571f64: d4400000     	hlt	#0
 4571f68: d4200020     	brk	#0x1
 4571f6c: d4200000     	brk	#0
 4571f70: d4400000     	hlt	#0
 4571f74: d4200020     	brk	#0x1
 4571f78: d4200000     	brk	#0
 4571f7c: d4400000     	hlt	#0
 4571f80: d4200020     	brk	#0x1
 4571f84: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4571f88: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4571f8c: 910043fd     	add	x29, sp, #0x10
 4571f90: b5000082     	cbnz	x2, 0x4571fa0 <_ChromeMain+0x456cd04>
 4571f94: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4571f98: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4571f9c: d65f03c0     	ret
 4571fa0: aa0103f3     	mov	x19, x1
 4571fa4: 90052b21     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 4571fa8: 910f6021     	add	x1, x1, #0x3d8
 4571fac: 91052040     	add	x0, x2, #0x148
 4571fb0: 951f26fb     	bl	0x8d3bb9c <_ChromeMain+0x8d36900>
 4571fb4: b9400808     	ldr	w8, [x0, #0x8]
 4571fb8: 71001d1f     	cmp	w8, #0x7
 4571fbc: 540000e1     	b.ne	0x4571fd8 <_ChromeMain+0x456cd3c>
 4571fc0: b4fffea0     	cbz	x0, 0x4571f94 <_ChromeMain+0x456ccf8>
 4571fc4: 91028001     	add	x1, x0, #0xa0
 4571fc8: aa1303e0     	mov	x0, x19
 4571fcc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4571fd0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4571fd4: 17ee340a     	b	0x40feffc <_ChromeMain+0x40f9d60>
 4571fd8: d4200000     	brk	#0
 4571fdc: d4400000     	hlt	#0
 4571fe0: d4200020     	brk	#0x1
