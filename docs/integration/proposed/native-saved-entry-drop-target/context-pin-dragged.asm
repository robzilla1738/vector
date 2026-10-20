
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4116b58: d10203ff     	sub	sp, sp, #0x80
 4116b5c: a9026ffc     	stp	x28, x27, [sp, #0x20]
 4116b60: a90367fa     	stp	x26, x25, [sp, #0x30]
 4116b64: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4116b68: a90557f6     	stp	x22, x21, [sp, #0x50]
 4116b6c: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4116b70: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4116b74: 9101c3fd     	add	x29, sp, #0x70
 4116b78: f9419c09     	ldr	x9, [x0, #0x338]
 4116b7c: b4000069     	cbz	x9, 0x4116b88 <_ChromeMain+0x41118ec>
 4116b80: 3943e128     	ldrb	w8, [x9, #0xf8]
 4116b84: 36000168     	tbz	w8, #0x0, 0x4116bb0 <_ChromeMain+0x4111914>
 4116b88: 52800016     	mov	w22, #0x0               ; =0
 4116b8c: aa1603e0     	mov	x0, x22
 4116b90: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4116b94: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4116b98: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4116b9c: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4116ba0: a94367fa     	ldp	x26, x25, [sp, #0x30]
 4116ba4: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 4116ba8: 910203ff     	add	sp, sp, #0x80
 4116bac: d65f03c0     	ret
 4116bb0: f9406928     	ldr	x8, [x9, #0xd0]
 4116bb4: 8b081108     	add	x8, x8, x8, lsl #4
 4116bb8: d37df115     	lsl	x21, x8, #3
 4116bbc: b4fffe75     	cbz	x21, 0x4116b88 <_ChromeMain+0x41118ec>
 4116bc0: aa0103f4     	mov	x20, x1
 4116bc4: aa0003f3     	mov	x19, x0
 4116bc8: 52800008     	mov	w8, #0x0                ; =0
 4116bcc: f9406529     	ldr	x9, [x9, #0xc8]
 4116bd0: 91004136     	add	x22, x9, #0x10
 4116bd4: 14000004     	b	0x4116be4 <_ChromeMain+0x4111948>
 4116bd8: 52800028     	mov	w8, #0x1                ; =1
 4116bdc: f10222b5     	subs	x21, x21, #0x88
 4116be0: 54000240     	b.eq	0x4116c28 <_ChromeMain+0x411198c>
 4116be4: f84886c1     	ldr	x1, [x22], #0x88
 4116be8: b4ffffa1     	cbz	x1, 0x4116bdc <_ChromeMain+0x4111940>
 4116bec: f9418e60     	ldr	x0, [x19, #0x318]
 4116bf0: b40019a0     	cbz	x0, 0x4116f24 <_ChromeMain+0x4111c88>
 4116bf4: 96fc4343     	bl	0x27900 <_ChromeMain+0x22664>
 4116bf8: 3100041f     	cmn	w0, #0x1
 4116bfc: 54fffc60     	b.eq	0x4116b88 <_ChromeMain+0x41118ec>
 4116c00: 34fffed4     	cbz	w20, 0x4116bd8 <_ChromeMain+0x411193c>
 4116c04: f9418e68     	ldr	x8, [x19, #0x318]
 4116c08: b40019a8     	cbz	x8, 0x4116f3c <_ChromeMain+0x4111ca0>
 4116c0c: f9400108     	ldr	x8, [x8]
 4116c10: 93407c01     	sxtw	x1, w0
 4116c14: aa0803e0     	mov	x0, x8
 4116c18: 973d1db8     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4116c1c: 39424008     	ldrb	w8, [x0, #0x90]
 4116c20: 3707fb48     	tbnz	w8, #0x0, 0x4116b88 <_ChromeMain+0x41118ec>
 4116c24: 17ffffed     	b	0x4116bd8 <_ChromeMain+0x411193c>
 4116c28: 3607fb08     	tbz	w8, #0x0, 0x4116b88 <_ChromeMain+0x41118ec>
 4116c2c: f9419e68     	ldr	x8, [x19, #0x338]
 4116c30: f9406909     	ldr	x9, [x8, #0xd0]
 4116c34: 8b091129     	add	x9, x9, x9, lsl #4
 4116c38: d37df138     	lsl	x24, x9, #3
 4116c3c: b4fffa78     	cbz	x24, 0x4116b88 <_ChromeMain+0x41118ec>
 4116c40: d2800019     	mov	x25, #0x0               ; =0
 4116c44: d280001a     	mov	x26, #0x0               ; =0
 4116c48: d2800015     	mov	x21, #0x0               ; =0
 4116c4c: f9406508     	ldr	x8, [x8, #0xc8]
 4116c50: 9100411b     	add	x27, x8, #0x10
 4116c54: 92fc0017     	mov	x23, #0x1fffffffffffffff ; =2305843009213693951
 4116c58: 1400000a     	b	0x4116c80 <_ChromeMain+0x41119e4>
 4116c5c: 8b1a0abc     	add	x28, x21, x26, lsl #2
 4116c60: b4000b5c     	cbz	x28, 0x4116dc8 <_ChromeMain+0x4111b2c>
 4116c64: b9000396     	str	w22, [x28]
 4116c68: 91001388     	add	x8, x28, #0x4
 4116c6c: eb150108     	subs	x8, x8, x21
 4116c70: 54000ac0     	b.eq	0x4116dc8 <_ChromeMain+0x4111b2c>
 4116c74: 9342fd1a     	asr	x26, x8, #2
 4116c78: f1022318     	subs	x24, x24, #0x88
 4116c7c: 54000360     	b.eq	0x4116ce8 <_ChromeMain+0x4111a4c>
 4116c80: f8488761     	ldr	x1, [x27], #0x88
 4116c84: b4ffffa1     	cbz	x1, 0x4116c78 <_ChromeMain+0x41119dc>
 4116c88: f9418e60     	ldr	x0, [x19, #0x318]
 4116c8c: b40015e0     	cbz	x0, 0x4116f48 <_ChromeMain+0x4111cac>
 4116c90: 96fc431c     	bl	0x27900 <_ChromeMain+0x22664>
 4116c94: 3100041f     	cmn	w0, #0x1
 4116c98: 540015e0     	b.eq	0x4116f54 <_ChromeMain+0x4111cb8>
 4116c9c: f9418e68     	ldr	x8, [x19, #0x318]
 4116ca0: b4001608     	cbz	x8, 0x4116f60 <_ChromeMain+0x4111cc4>
 4116ca4: aa0003f6     	mov	x22, x0
 4116ca8: 37f81440     	tbnz	w0, #0x1f, 0x4116f30 <_ChromeMain+0x4111c94>
 4116cac: f9400108     	ldr	x8, [x8]
 4116cb0: b9401909     	ldr	w9, [x8, #0x18]
 4116cb4: 6b0902df     	cmp	w22, w9
 4116cb8: 540013ca     	b.ge	0x4116f30 <_ChromeMain+0x4111c94>
 4116cbc: f9404908     	ldr	x8, [x8, #0x90]
 4116cc0: b9401908     	ldr	w8, [x8, #0x18]
 4116cc4: 6b0802df     	cmp	w22, w8
 4116cc8: 1a9fa7e8     	cset	w8, lt
 4116ccc: 6b08029f     	cmp	w20, w8
 4116cd0: 54fffd40     	b.eq	0x4116c78 <_ChromeMain+0x41119dc>
 4116cd4: eb19035f     	cmp	x26, x25
 4116cd8: 54000de0     	b.eq	0x4116e94 <_ChromeMain+0x4111bf8>
 4116cdc: 17ffffe0     	b	0x4116c5c <_ChromeMain+0x41119c0>
 4116ce0: d2800017     	mov	x23, #0x0               ; =0
 4116ce4: 14000030     	b	0x4116da4 <_ChromeMain+0x4111b08>
 4116ce8: f100035f     	cmp	x26, #0x0
 4116cec: 1a9f07f6     	cset	w22, ne
 4116cf0: b4ffff9a     	cbz	x26, 0x4116ce0 <_ChromeMain+0x4111a44>
 4116cf4: 8b1a0ab7     	add	x23, x21, x26, lsl #2
 4116cf8: dac01348     	clz	x8, x26
 4116cfc: d37ff908     	lsl	x8, x8, #1
 4116d00: d27f1502     	eor	x2, x8, #0x7e
 4116d04: aa1503e0     	mov	x0, x21
 4116d08: aa1703e1     	mov	x1, x23
 4116d0c: 52800023     	mov	w3, #0x1                ; =1
 4116d10: 978697ac     	bl	0x22bcbc0 <_ChromeMain+0x22b7924>
 4116d14: f100075f     	cmp	x26, #0x1
 4116d18: 54000160     	b.eq	0x4116d44 <_ChromeMain+0x4111aa8>
 4116d1c: d280000b     	mov	x11, #0x0               ; =0
 4116d20: d37ef74c     	lsl	x12, x26, #2
 4116d24: d1001188     	sub	x8, x12, #0x4
 4116d28: 8b0b02a9     	add	x9, x21, x11
 4116d2c: 2940352a     	ldp	w10, w13, [x9]
 4116d30: 6b0d015f     	cmp	w10, w13
 4116d34: 540006e0     	b.eq	0x4116e10 <_ChromeMain+0x4111b74>
 4116d38: 9100116b     	add	x11, x11, #0x4
 4116d3c: eb0b011f     	cmp	x8, x11
 4116d40: 54ffff41     	b.ne	0x4116d28 <_ChromeMain+0x4111a8c>
 4116d44: f9418e78     	ldr	x24, [x19, #0x318]
 4116d48: b4001158     	cbz	x24, 0x4116f70 <_ChromeMain+0x4111cd4>
 4116d4c: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4116d50: d37ef757     	lsl	x23, x26, #2
 4116d54: f9000fff     	str	xzr, [sp, #0x18]
 4116d58: b400017a     	cbz	x26, 0x4116d84 <_ChromeMain+0x4111ae8>
 4116d5c: d37eff48     	lsr	x8, x26, #62
 4116d60: b5000e08     	cbnz	x8, 0x4116f20 <_ChromeMain+0x4111c84>
 4116d64: aa1703e0     	mov	x0, x23
 4116d68: 96fbe180     	bl	0xf368 <_ChromeMain+0xa0cc>
 4116d6c: f90007e0     	str	x0, [sp, #0x8]
 4116d70: f9000ffa     	str	x26, [sp, #0x18]
 4116d74: aa1503e1     	mov	x1, x21
 4116d78: aa1703e2     	mov	x2, x23
 4116d7c: 94fbe154     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4116d80: f9000bfa     	str	x26, [sp, #0x10]
 4116d84: 910023e1     	add	x1, sp, #0x8
 4116d88: aa1803e0     	mov	x0, x24
 4116d8c: aa1403e2     	mov	x2, x20
 4116d90: 94033c04     	bl	0x41e5da0 <_ChromeMain+0x41e0b04>
 4116d94: f94007e0     	ldr	x0, [sp, #0x8]
 4116d98: b50001a0     	cbnz	x0, 0x4116dcc <_ChromeMain+0x4111b30>
 4116d9c: aa1303e0     	mov	x0, x19
 4116da0: 94000079     	bl	0x4116f84 <_ChromeMain+0x4111ce8>
 4116da4: b4ffef55     	cbz	x21, 0x4116b8c <_ChromeMain+0x41118f0>
 4116da8: d342fee8     	lsr	x8, x23, #2
 4116dac: 52800089     	mov	w9, #0x4                ; =4
 4116db0: 8b1502ea     	add	x10, x23, x21
 4116db4: cb0a0129     	sub	x9, x9, x10
 4116db8: d342052a     	lsl	x10, x9, #62
 4116dbc: cb090149     	sub	x9, x10, x9
 4116dc0: eb49091f     	cmp	x8, x9, lsr #2
 4116dc4: 54000a69     	b.ls	0x4116f10 <_ChromeMain+0x4111c74>
 4116dc8: d4200020     	brk	#0x1
 4116dcc: f9400be8     	ldr	x8, [sp, #0x10]
 4116dd0: d37ef509     	lsl	x9, x8, #2
 4116dd4: b4000109     	cbz	x9, 0x4116df4 <_ChromeMain+0x4111b58>
 4116dd8: cb080be8     	neg	x8, x8, lsl #2
 4116ddc: 8b000129     	add	x9, x9, x0
 4116de0: d1001129     	sub	x9, x9, #0x4
 4116de4: b4ffff29     	cbz	x9, 0x4116dc8 <_ChromeMain+0x4111b2c>
 4116de8: d1001129     	sub	x9, x9, #0x4
 4116dec: 91001108     	add	x8, x8, #0x4
 4116df0: b5ffffa8     	cbnz	x8, 0x4116de4 <_ChromeMain+0x4111b48>
 4116df4: f9000bff     	str	xzr, [sp, #0x10]
 4116df8: f9400fe8     	ldr	x8, [sp, #0x18]
 4116dfc: d37ef501     	lsl	x1, x8, #2
 4116e00: 96fbc82e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4116e04: 17ffffe6     	b	0x4116d9c <_ChromeMain+0x4111b00>
 4116e08: 9342fd3a     	asr	x26, x9, #2
 4116e0c: 17ffffce     	b	0x4116d44 <_ChromeMain+0x4111aa8>
 4116e10: eb0b018d     	subs	x13, x12, x11
 4116e14: eb0b019f     	cmp	x12, x11
 4116e18: 54fff960     	b.eq	0x4116d44 <_ChromeMain+0x4111aa8>
 4116e1c: 91001128     	add	x8, x9, #0x4
 4116e20: d100218c     	sub	x12, x12, #0x8
 4116e24: eb0b019f     	cmp	x12, x11
 4116e28: 54000121     	b.ne	0x4116e4c <_ChromeMain+0x4111bb0>
 4116e2c: eb17011f     	cmp	x8, x23
 4116e30: 54fffcc8     	b.hi	0x4116dc8 <_ChromeMain+0x4111b2c>
 4116e34: cb150109     	sub	x9, x8, x21
 4116e38: eb0802ff     	cmp	x23, x8
 4116e3c: 54fffe60     	b.eq	0x4116e08 <_ChromeMain+0x4111b6c>
 4116e40: f10012f7     	subs	x23, x23, #0x4
 4116e44: 54ffffa1     	b.ne	0x4116e38 <_ChromeMain+0x4111b9c>
 4116e48: 17ffffe0     	b	0x4116dc8 <_ChromeMain+0x4111b2c>
 4116e4c: d10021ab     	sub	x11, x13, #0x8
 4116e50: 14000005     	b	0x4116e64 <_ChromeMain+0x4111bc8>
 4116e54: b8004d2a     	str	w10, [x9, #0x4]!
 4116e58: 91001108     	add	x8, x8, #0x4
 4116e5c: f100116b     	subs	x11, x11, #0x4
 4116e60: 540000c0     	b.eq	0x4116e78 <_ChromeMain+0x4111bdc>
 4116e64: aa0a03ec     	mov	x12, x10
 4116e68: b940050a     	ldr	w10, [x8, #0x4]
 4116e6c: 6b0a019f     	cmp	w12, w10
 4116e70: 54ffff40     	b.eq	0x4116e58 <_ChromeMain+0x4111bbc>
 4116e74: 17fffff8     	b	0x4116e54 <_ChromeMain+0x4111bb8>
 4116e78: 9100112a     	add	x10, x9, #0x4
 4116e7c: eb17015f     	cmp	x10, x23
 4116e80: 54fffa48     	b.hi	0x4116dc8 <_ChromeMain+0x4111b2c>
 4116e84: eb09011f     	cmp	x8, x9
 4116e88: aa0a03e8     	mov	x8, x10
 4116e8c: 54fff5c0     	b.eq	0x4116d44 <_ChromeMain+0x4111aa8>
 4116e90: 17ffffe9     	b	0x4116e34 <_ChromeMain+0x4111b98>
 4116e94: 91000728     	add	x8, x25, #0x1
 4116e98: d37efd09     	lsr	x9, x8, #62
 4116e9c: b5000429     	cbnz	x9, 0x4116f20 <_ChromeMain+0x4111c84>
 4116ea0: d37ffb29     	lsl	x9, x25, #1
 4116ea4: eb08013f     	cmp	x9, x8
 4116ea8: 9a888128     	csel	x8, x9, x8, hi
 4116eac: eb17033f     	cmp	x25, x23
 4116eb0: 92f80009     	mov	x9, #0x3fffffffffffffff ; =4611686018427387903
 4116eb4: 9a89311a     	csel	x26, x8, x9, lo
 4116eb8: b400063a     	cbz	x26, 0x4116f7c <_ChromeMain+0x4111ce0>
 4116ebc: d37eff48     	lsr	x8, x26, #62
 4116ec0: b5000568     	cbnz	x8, 0x4116f6c <_ChromeMain+0x4111cd0>
 4116ec4: d37ef740     	lsl	x0, x26, #2
 4116ec8: 96fbe128     	bl	0xf368 <_ChromeMain+0xa0cc>
 4116ecc: ab19081c     	adds	x28, x0, x25, lsl #2
 4116ed0: 54fff7c0     	b.eq	0x4116dc8 <_ChromeMain+0x4111b2c>
 4116ed4: b9000396     	str	w22, [x28]
 4116ed8: d37ef737     	lsl	x23, x25, #2
 4116edc: cb190b96     	sub	x22, x28, x25, lsl #2
 4116ee0: aa1603e0     	mov	x0, x22
 4116ee4: aa1503e1     	mov	x1, x21
 4116ee8: aa1703e2     	mov	x2, x23
 4116eec: 94fbcb83     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 4116ef0: b4000095     	cbz	x21, 0x4116f00 <_ChromeMain+0x4111c64>
 4116ef4: aa1503e0     	mov	x0, x21
 4116ef8: aa1703e1     	mov	x1, x23
 4116efc: 96fbc7ef     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4116f00: aa1603f5     	mov	x21, x22
 4116f04: aa1a03f9     	mov	x25, x26
 4116f08: 92fc0017     	mov	x23, #0x1fffffffffffffff ; =2305843009213693951
 4116f0c: 17ffff57     	b	0x4116c68 <_ChromeMain+0x41119cc>
 4116f10: d37ef721     	lsl	x1, x25, #2
 4116f14: aa1503e0     	mov	x0, x21
 4116f18: 96fbc7e8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4116f1c: 17ffff1c     	b	0x4116b8c <_ChromeMain+0x41118f0>
 4116f20: 9777f398     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 4116f24: d4200000     	brk	#0
 4116f28: d4400000     	hlt	#0
 4116f2c: d4200020     	brk	#0x1
 4116f30: d4200000     	brk	#0
 4116f34: d4400000     	hlt	#0
 4116f38: d4200020     	brk	#0x1
 4116f3c: d4200000     	brk	#0
 4116f40: d4400000     	hlt	#0
 4116f44: d4200020     	brk	#0x1
 4116f48: d4200000     	brk	#0
 4116f4c: d4400000     	hlt	#0
 4116f50: d4200020     	brk	#0x1
 4116f54: d4200000     	brk	#0
 4116f58: d4400000     	hlt	#0
 4116f5c: d4200020     	brk	#0x1
 4116f60: d4200000     	brk	#0
 4116f64: d4400000     	hlt	#0
 4116f68: d4200020     	brk	#0x1
 4116f6c: 942bbc2d     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 4116f70: d4200000     	brk	#0
 4116f74: d4400000     	hlt	#0
 4116f78: d4200020     	brk	#0x1
 4116f7c: d2800000     	mov	x0, #0x0                ; =0
 4116f80: 17ffffd3     	b	0x4116ecc <_ChromeMain+0x4111c30>
