
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4606b20: d10583ff     	sub	sp, sp, #0x160
 4606b24: 6d0e2beb     	stp	d11, d10, [sp, #0xe0]
 4606b28: 6d0f23e9     	stp	d9, d8, [sp, #0xf0]
 4606b2c: a9106ffc     	stp	x28, x27, [sp, #0x100]
 4606b30: a91167fa     	stp	x26, x25, [sp, #0x110]
 4606b34: a9125ff8     	stp	x24, x23, [sp, #0x120]
 4606b38: a91357f6     	stp	x22, x21, [sp, #0x130]
 4606b3c: a9144ff4     	stp	x20, x19, [sp, #0x140]
 4606b40: a9157bfd     	stp	x29, x30, [sp, #0x150]
 4606b44: 910543fd     	add	x29, sp, #0x150
 4606b48: aa0203f4     	mov	x20, x2
 4606b4c: aa0003f3     	mov	x19, x0
 4606b50: 360000b4     	tbz	w20, #0x0, 0x4606b64 <_ChromeMain+0x46018c8>
 4606b54: f941b668     	ldr	x8, [x19, #0x368]
 4606b58: eb01011f     	cmp	x8, x1
 4606b5c: 9a813101     	csel	x1, x8, x1, lo
 4606b60: 9278e294     	and	x20, x20, #0xffffffffffffff01
 4606b64: 39558268     	ldrb	w8, [x19, #0x560]
 4606b68: 12001e89     	and	w9, w20, #0xff
 4606b6c: 6a09011f     	tst	w8, w9
 4606b70: 54000320     	b.eq	0x4606bd4 <_ChromeMain+0x4601938>
 4606b74: 36001a94     	tbz	w20, #0x0, 0x4606ec4 <_ChromeMain+0x4601c28>
 4606b78: f942ae68     	ldr	x8, [x19, #0x558]
 4606b7c: eb01011f     	cmp	x8, x1
 4606b80: 54000081     	b.ne	0x4606b90 <_ChromeMain+0x46018f4>
 4606b84: 39555268     	ldrb	w8, [x19, #0x554]
 4606b88: 6b09011f     	cmp	w8, w9
 4606b8c: 540013a0     	b.eq	0x4606e00 <_ChromeMain+0x4601b64>
 4606b90: 9100e3e8     	add	x8, sp, #0x38
 4606b94: 91002108     	add	x8, x8, #0x8
 4606b98: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 4606b9c: a90023e1     	stp	x1, x8, [sp]
 4606ba0: f9001fe8     	str	x8, [sp, #0x38]
 4606ba4: f940ce68     	ldr	x8, [x19, #0x198]
 4606ba8: d37df109     	lsl	x9, x8, #3
 4606bac: b4000c89     	cbz	x9, 0x4606d3c <_ChromeMain+0x4601aa0>
 4606bb0: f940ca7a     	ldr	x26, [x19, #0x190]
 4606bb4: 8b080f55     	add	x21, x26, x8, lsl #3
 4606bb8: 9004c9a8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4606bbc: 3dc01100     	ldr	q0, [x8, #0x40]
 4606bc0: 3d800be0     	str	q0, [sp, #0x20]
 4606bc4: 0f0167e8     	movi.2s	v8, #0x3f, lsl #24
 4606bc8: 0f0665e9     	movi.2s	v9, #0xcf, lsl #24
 4606bcc: 2f05662a     	mvni.2s	v10, #0xb1, lsl #24
 4606bd0: 14000030     	b	0x4606c90 <_ChromeMain+0x46019f4>
 4606bd4: 6b09011f     	cmp	w8, w9
 4606bd8: 54fffdc1     	b.ne	0x4606b90 <_ChromeMain+0x46018f4>
 4606bdc: 17ffffea     	b	0x4606b84 <_ChromeMain+0x46018e8>
 4606be0: aa1803f7     	mov	x23, x24
 4606be4: 14000023     	b	0x4606c70 <_ChromeMain+0x46019d4>
 4606be8: f9400308     	ldr	x8, [x24]
 4606bec: aa1803fb     	mov	x27, x24
 4606bf0: b4000148     	cbz	x8, 0x4606c18 <_ChromeMain+0x460197c>
 4606bf4: aa0803f8     	mov	x24, x8
 4606bf8: f9401108     	ldr	x8, [x8, #0x20]
 4606bfc: eb0802df     	cmp	x22, x8
 4606c00: 54ffff43     	b.lo	0x4606be8 <_ChromeMain+0x460194c>
 4606c04: eb16011f     	cmp	x8, x22
 4606c08: 54fffec2     	b.hs	0x4606be0 <_ChromeMain+0x4601944>
 4606c0c: f9400708     	ldr	x8, [x24, #0x8]
 4606c10: b5ffff28     	cbnz	x8, 0x4606bf4 <_ChromeMain+0x4601958>
 4606c14: 9100231b     	add	x27, x24, #0x8
 4606c18: 52800700     	mov	w0, #0x38               ; =56
 4606c1c: 96e821d3     	bl	0xf368 <_ChromeMain+0xa0cc>
 4606c20: b4001520     	cbz	x0, 0x4606ec4 <_ChromeMain+0x4601c28>
 4606c24: aa0003f7     	mov	x23, x0
 4606c28: b100801f     	cmn	x0, #0x20
 4606c2c: 540014c0     	b.eq	0x4606ec4 <_ChromeMain+0x4601c28>
 4606c30: a9007eff     	stp	xzr, xzr, [x23]
 4606c34: a902feff     	stp	xzr, xzr, [x23, #0x28]
 4606c38: f90012f6     	str	x22, [x23, #0x20]
 4606c3c: f9000af8     	str	x24, [x23, #0x10]
 4606c40: f9000377     	str	x23, [x27]
 4606c44: f9401fe8     	ldr	x8, [sp, #0x38]
 4606c48: f9400108     	ldr	x8, [x8]
 4606c4c: aa1703e1     	mov	x1, x23
 4606c50: b4000068     	cbz	x8, 0x4606c5c <_ChromeMain+0x46019c0>
 4606c54: f9001fe8     	str	x8, [sp, #0x38]
 4606c58: f9400361     	ldr	x1, [x27]
 4606c5c: f94023e0     	ldr	x0, [sp, #0x40]
 4606c60: 96e95380     	bl	0x5ba60 <_ChromeMain+0x567c4>
 4606c64: f94027e8     	ldr	x8, [sp, #0x48]
 4606c68: 91000508     	add	x8, x8, #0x1
 4606c6c: f90027e8     	str	x8, [sp, #0x48]
 4606c70: a902f2f9     	stp	x25, x28, [x23, #0x28]
 4606c74: aa1303e0     	mov	x0, x19
 4606c78: aa1603e1     	mov	x1, x22
 4606c7c: 52800002     	mov	w2, #0x0                ; =0
 4606c80: 94000ab2     	bl	0x4609748 <_ChromeMain+0x46044ac>
 4606c84: 9100235a     	add	x26, x26, #0x8
 4606c88: eb15035f     	cmp	x26, x21
 4606c8c: 54000580     	b.eq	0x4606d3c <_ChromeMain+0x4601aa0>
 4606c90: f9400356     	ldr	x22, [x26]
 4606c94: b40004f6     	cbz	x22, 0x4606d30 <_ChromeMain+0x4601a94>
 4606c98: 9106e2c8     	add	x8, x22, #0x1b8
 4606c9c: 910702c9     	add	x9, x22, #0x1c0
 4606ca0: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 4606ca4: 3dc00be1     	ldr	q1, [sp, #0x20]
 4606ca8: 6ee14400     	ushl.2d	v0, v0, v1
 4606cac: 0ea1280b     	xtn.2s	v11, v0
 4606cb0: 4d40cd20     	ld1r.2d	{ v0 }, [x9]
 4606cb4: 3d8007e0     	str	q0, [sp, #0x10]
 4606cb8: 910143e8     	add	x8, sp, #0x50
 4606cbc: aa1603e0     	mov	x0, x22
 4606cc0: 97f7a398     	bl	0x43efb20 <_ChromeMain+0x43ea884>
 4606cc4: 910143e0     	add	x0, sp, #0x50
 4606cc8: 96f8dc79     	bl	0x43deac <_ChromeMain+0x438c10>
 4606ccc: 6e0c0420     	mov.s	v0[1], v1[0]
 4606cd0: 0e28d400     	fadd.2s	v0, v0, v8
 4606cd4: 0e219800     	frintm.2s	v0, v0
 4606cd8: 2e20e541     	fcmge.2s	v1, v10, v0
 4606cdc: 2e29e402     	fcmge.2s	v2, v0, v9
 4606ce0: 2f047402     	bic.2s	v2, #0x80, lsl #24
 4606ce4: 2ea9e403     	fcmgt.2s	v3, v0, v9
 4606ce8: 2ee31d20     	bif.8b	v0, v9, v3
 4606cec: 0ea1b800     	fcvtzs.2s	v0, v0
 4606cf0: 2ee11c40     	bif.8b	v0, v2, v1
 4606cf4: 0ea00d60     	sqadd.2s	v0, v11, v0
 4606cf8: ad4087e2     	ldp	q2, q1, [sp, #0x10]
 4606cfc: 6ee14441     	ushl.2d	v1, v2, v1
 4606d00: 0ea12821     	xtn.2s	v1, v1
 4606d04: 0ea10c01     	sqadd.2s	v1, v0, v1
 4606d08: 0ea02c21     	sqsub.2s	v1, v1, v0
 4606d0c: 0e0c3c28     	mov.s	w8, v1[1]
 4606d10: 1e260029     	fmov	w9, s1
 4606d14: 0aa97d29     	bic	w9, w9, w9, asr #31
 4606d18: 0aa87d08     	bic	w8, w8, w8, asr #31
 4606d1c: aa08813c     	orr	x28, x9, x8, lsl #32
 4606d20: 9e660019     	fmov	x25, d0
 4606d24: f94023e8     	ldr	x8, [sp, #0x40]
 4606d28: f94007f8     	ldr	x24, [sp, #0x8]
 4606d2c: 17ffffb0     	b	0x4606bec <_ChromeMain+0x4601950>
 4606d30: d280001c     	mov	x28, #0x0               ; =0
 4606d34: d2800019     	mov	x25, #0x0               ; =0
 4606d38: 17fffffb     	b	0x4606d24 <_ChromeMain+0x4601a88>
 4606d3c: f94003e8     	ldr	x8, [sp]
 4606d40: f902ae68     	str	x8, [x19, #0x558]
 4606d44: 12001e88     	and	w8, w20, #0xff
 4606d48: 39158268     	strb	w8, [x19, #0x560]
 4606d4c: 39155268     	strb	w8, [x19, #0x554]
 4606d50: f941b668     	ldr	x8, [x19, #0x368]
 4606d54: f100011f     	cmp	x8, #0x0
 4606d58: 1a9f07e8     	cset	w8, ne
 4606d5c: 2a140108     	orr	w8, w8, w20
 4606d60: f9400269     	ldr	x9, [x19]
 4606d64: f9405129     	ldr	x9, [x9, #0xa0]
 4606d68: 12000101     	and	w1, w8, #0x1
 4606d6c: aa1303e0     	mov	x0, x19
 4606d70: d63f0120     	blr	x9
 4606d74: f940ce68     	ldr	x8, [x19, #0x198]
 4606d78: b4000368     	cbz	x8, 0x4606de4 <_ChromeMain+0x4601b48>
 4606d7c: d2800015     	mov	x21, #0x0               ; =0
 4606d80: 14000010     	b	0x4606dc0 <_ChromeMain+0x4601b24>
 4606d84: f942ae68     	ldr	x8, [x19, #0x558]
 4606d88: eb0802bf     	cmp	x21, x8
 4606d8c: 9a9536a1     	cinc	x1, x21, hs
 4606d90: f940ca68     	ldr	x8, [x19, #0x190]
 4606d94: f8757914     	ldr	x20, [x8, x21, lsl #3]
 4606d98: aa1303e0     	mov	x0, x19
 4606d9c: 94000525     	bl	0x4608230 <_ChromeMain+0x4602f94>
 4606da0: a90507e0     	stp	x0, x1, [sp, #0x50]
 4606da4: 910143e1     	add	x1, sp, #0x50
 4606da8: aa1403e0     	mov	x0, x20
 4606dac: 970a7779     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 4606db0: 910006b5     	add	x21, x21, #0x1
 4606db4: f940ce68     	ldr	x8, [x19, #0x198]
 4606db8: eb0802bf     	cmp	x21, x8
 4606dbc: 540000a2     	b.hs	0x4606dd0 <_ChromeMain+0x4601b34>
 4606dc0: 39558268     	ldrb	w8, [x19, #0x560]
 4606dc4: aa1503e1     	mov	x1, x21
 4606dc8: 34fffe48     	cbz	w8, 0x4606d90 <_ChromeMain+0x4601af4>
 4606dcc: 17ffffee     	b	0x4606d84 <_ChromeMain+0x4601ae8>
 4606dd0: d37df109     	lsl	x9, x8, #3
 4606dd4: b4000089     	cbz	x9, 0x4606de4 <_ChromeMain+0x4601b48>
 4606dd8: f940ca74     	ldr	x20, [x19, #0x190]
 4606ddc: 8b080e95     	add	x21, x20, x8, lsl #3
 4606de0: 1400001e     	b	0x4606e58 <_ChromeMain+0x4601bbc>
 4606de4: aa1303e0     	mov	x0, x19
 4606de8: 96fe68e5     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4606dec: f94023e1     	ldr	x1, [sp, #0x40]
 4606df0: 9100e3e8     	add	x8, sp, #0x38
 4606df4: f9002be8     	str	x8, [sp, #0x50]
 4606df8: 910143e0     	add	x0, sp, #0x50
 4606dfc: 97a27b51     	bl	0x2ea5b40 <_ChromeMain+0x2ea08a4>
 4606e00: a9557bfd     	ldp	x29, x30, [sp, #0x150]
 4606e04: a9544ff4     	ldp	x20, x19, [sp, #0x140]
 4606e08: a95357f6     	ldp	x22, x21, [sp, #0x130]
 4606e0c: a9525ff8     	ldp	x24, x23, [sp, #0x120]
 4606e10: a95167fa     	ldp	x26, x25, [sp, #0x110]
 4606e14: a9506ffc     	ldp	x28, x27, [sp, #0x100]
 4606e18: 6d4f23e9     	ldp	d9, d8, [sp, #0xf0]
 4606e1c: 6d4e2beb     	ldp	d11, d10, [sp, #0xe0]
 4606e20: 910583ff     	add	sp, sp, #0x160
 4606e24: d65f03c0     	ret
 4606e28: f9400108     	ldr	x8, [x8]
 4606e2c: b4000108     	cbz	x8, 0x4606e4c <_ChromeMain+0x4601bb0>
 4606e30: f9401109     	ldr	x9, [x8, #0x20]
 4606e34: eb09003f     	cmp	x1, x9
 4606e38: 54ffff83     	b.lo	0x4606e28 <_ChromeMain+0x4601b8c>
 4606e3c: eb01013f     	cmp	x9, x1
 4606e40: 54000142     	b.hs	0x4606e68 <_ChromeMain+0x4601bcc>
 4606e44: f9400508     	ldr	x8, [x8, #0x8]
 4606e48: b5ffff48     	cbnz	x8, 0x4606e30 <_ChromeMain+0x4601b94>
 4606e4c: 91002294     	add	x20, x20, #0x8
 4606e50: eb15029f     	cmp	x20, x21
 4606e54: 54fffc80     	b.eq	0x4606de4 <_ChromeMain+0x4601b48>
 4606e58: f94023e8     	ldr	x8, [sp, #0x40]
 4606e5c: b4ffff88     	cbz	x8, 0x4606e4c <_ChromeMain+0x4601bb0>
 4606e60: f9400281     	ldr	x1, [x20]
 4606e64: 17fffff3     	b	0x4606e30 <_ChromeMain+0x4601b94>
 4606e68: f94007e9     	ldr	x9, [sp, #0x8]
 4606e6c: eb09011f     	cmp	x8, x9
 4606e70: 54fffee0     	b.eq	0x4606e4c <_ChromeMain+0x4601bb0>
 4606e74: b941b82a     	ldr	w10, [x1, #0x1b8]
 4606e78: 2945210b     	ldp	w11, w8, [x8, #0x28]
 4606e7c: b941bc29     	ldr	w9, [x1, #0x1bc]
 4606e80: 6b09010c     	subs	w12, w8, w9
 4606e84: 131f7d8d     	asr	w13, w12, #31
 4606e88: 520101ad     	eor	w13, w13, #0x80000000
 4606e8c: 1a8c61ac     	csel	w12, w13, w12, vs
 4606e90: 6b0a016a     	subs	w10, w11, w10
 4606e94: 131f7d4b     	asr	w11, w10, #31
 4606e98: 5201016b     	eor	w11, w11, #0x80000000
 4606e9c: 1a8a616a     	csel	w10, w11, w10, vs
 4606ea0: aa0c814a     	orr	x10, x10, x12, lsl #32
 4606ea4: f9002bea     	str	x10, [sp, #0x50]
 4606ea8: 54000061     	b.ne	0x4606eb4 <_ChromeMain+0x4601c18>
 4606eac: 6b09011f     	cmp	w8, w9
 4606eb0: 54fffce0     	b.eq	0x4606e4c <_ChromeMain+0x4601bb0>
 4606eb4: 910143e2     	add	x2, sp, #0x50
 4606eb8: aa1303e0     	mov	x0, x19
 4606ebc: 94000a78     	bl	0x460989c <_ChromeMain+0x4604600>
 4606ec0: 17ffffe3     	b	0x4606e4c <_ChromeMain+0x4601bb0>
 4606ec4: d4200020     	brk	#0x1
