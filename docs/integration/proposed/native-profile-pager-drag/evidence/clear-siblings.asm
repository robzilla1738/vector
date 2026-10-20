Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4651c08: d10343ff     	sub	sp, sp, #0xd0
 4651c0c: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 4651c10: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 4651c14: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 4651c18: 910303fd     	add	x29, sp, #0xc0
 4651c1c: aa0003f3     	mov	x19, x0
 4651c20: f9474000     	ldr	x0, [x0, #0xe80]
 4651c24: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4651c28: b0052b14     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4651c2c: f9404689     	ldr	x9, [x20, #0x88]
 4651c30: eb09011f     	cmp	x8, x9
 4651c34: 54000041     	b.ne	0x4651c3c <_ChromeMain+0x464c9a0>
 4651c38: 96e75383     	bl	0x26a44 <_ChromeMain+0x217a8>
 4651c3c: f907427f     	str	xzr, [x19, #0xe80]
 4651c40: 3979e268     	ldrb	w8, [x19, #0xe78]
 4651c44: 35000788     	cbnz	w8, 0x4651d34 <_ChromeMain+0x464ca98>
 4651c48: 9115e275     	add	x21, x19, #0x578
 4651c4c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4651c50: f9404689     	ldr	x9, [x20, #0x88]
 4651c54: eb09011f     	cmp	x8, x9
 4651c58: 54000061     	b.ne	0x4651c64 <_ChromeMain+0x464c9c8>
 4651c5c: 9115e260     	add	x0, x19, #0x578
 4651c60: 96e709a7     	bl	0x142fc <_ChromeMain+0xf060>
 4651c64: f9474260     	ldr	x0, [x19, #0xe80]
 4651c68: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4651c6c: f9404689     	ldr	x9, [x20, #0x88]
 4651c70: eb09011f     	cmp	x8, x9
 4651c74: 54000340     	b.eq	0x4651cdc <_ChromeMain+0x464ca40>
 4651c78: f9074275     	str	x21, [x19, #0xe80]
 4651c7c: f943f275     	ldr	x21, [x19, #0x7e0]
 4651c80: 911fa274     	add	x20, x19, #0x7e8
 4651c84: eb1402bf     	cmp	x21, x20
 4651c88: 540000a0     	b.eq	0x4651c9c <_ChromeMain+0x464ca00>
 4651c8c: b004c748     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4651c90: 3dc1b500     	ldr	q0, [x8, #0x6d0]
 4651c94: 3d8003e0     	str	q0, [sp]
 4651c98: 14000018     	b	0x4651cf8 <_ChromeMain+0x464ca5c>
 4651c9c: f943f660     	ldr	x0, [x19, #0x7e8]
 4651ca0: 96e75578     	bl	0x27280 <_ChromeMain+0x21fe4>
 4651ca4: f903f274     	str	x20, [x19, #0x7e0]
 4651ca8: 6f00e400     	movi.2d	v0, #0000000000000000
 4651cac: 3d800280     	str	q0, [x20]
 4651cb0: 397b0268     	ldrb	w8, [x19, #0xec0]
 4651cb4: 35000a48     	cbnz	w8, 0x4651dfc <_ChromeMain+0x464cb60>
 4651cb8: d2e7fe08     	mov	x8, #0x3ff0000000000000 ; =4607182418800017408
 4651cbc: f9076e68     	str	x8, [x19, #0xed8]
 4651cc0: 3979e268     	ldrb	w8, [x19, #0xe78]
 4651cc4: 350006a8     	cbnz	w8, 0x4651d98 <_ChromeMain+0x464cafc>
 4651cc8: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 4651ccc: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4651cd0: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4651cd4: 910343ff     	add	sp, sp, #0xd0
 4651cd8: d65f03c0     	ret
 4651cdc: 96e7535a     	bl	0x26a44 <_ChromeMain+0x217a8>
 4651ce0: 17ffffe6     	b	0x4651c78 <_ChromeMain+0x464c9dc>
 4651ce4: aa0803f5     	mov	x21, x8
 4651ce8: f9400108     	ldr	x8, [x8]
 4651cec: b5ffffc8     	cbnz	x8, 0x4651ce4 <_ChromeMain+0x464ca48>
 4651cf0: eb1402bf     	cmp	x21, x20
 4651cf4: 54fffd40     	b.eq	0x4651c9c <_ChromeMain+0x464ca00>
 4651cf8: f94012a0     	ldr	x0, [x21, #0x20]
 4651cfc: b40000c0     	cbz	x0, 0x4651d14 <_ChromeMain+0x464ca78>
 4651d00: 390063ff     	strb	wzr, [sp, #0x18]
 4651d04: 3dc003e0     	ldr	q0, [sp]
 4651d08: 3c8203e0     	stur	q0, [sp, #0x20]
 4651d0c: 910063e1     	add	x1, sp, #0x18
 4651d10: 958220fb     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
 4651d14: f94006a8     	ldr	x8, [x21, #0x8]
 4651d18: b5fffe68     	cbnz	x8, 0x4651ce4 <_ChromeMain+0x464ca48>
 4651d1c: aa1503e8     	mov	x8, x21
 4651d20: f9400ab5     	ldr	x21, [x21, #0x10]
 4651d24: f94002a9     	ldr	x9, [x21]
 4651d28: eb09011f     	cmp	x8, x9
 4651d2c: 54ffff81     	b.ne	0x4651d1c <_ChromeMain+0x464ca80>
 4651d30: 17fffff0     	b	0x4651cf0 <_ChromeMain+0x464ca54>
 4651d34: 3939e27f     	strb	wzr, [x19, #0xe78]
 4651d38: f9474660     	ldr	x0, [x19, #0xe88]
 4651d3c: 9139a261     	add	x1, x19, #0xe68
 4651d40: 976ade70     	bl	0x2109700 <_ChromeMain+0x2104464>
 4651d44: f9473668     	ldr	x8, [x19, #0xe68]
 4651d48: f9401d08     	ldr	x8, [x8, #0x38]
 4651d4c: 9139a260     	add	x0, x19, #0xe68
 4651d50: d63f0100     	blr	x8
 4651d54: f9474268     	ldr	x8, [x19, #0xe80]
 4651d58: b4fff788     	cbz	x8, 0x4651c48 <_ChromeMain+0x464c9ac>
 4651d5c: f9473668     	ldr	x8, [x19, #0xe68]
 4651d60: f9402108     	ldr	x8, [x8, #0x40]
 4651d64: 9139a260     	add	x0, x19, #0xe68
 4651d68: d63f0100     	blr	x8
 4651d6c: f9474268     	ldr	x8, [x19, #0xe80]
 4651d70: f9400109     	ldr	x9, [x8]
 4651d74: 7100001f     	cmp	w0, #0x0
 4651d78: 5280020a     	mov	w10, #0x10              ; =16
 4651d7c: 5280040b     	mov	w11, #0x20              ; =32
 4651d80: 9a8a116a     	csel	x10, x11, x10, ne
 4651d84: f86a6929     	ldr	x9, [x9, x10]
 4651d88: 9139a261     	add	x1, x19, #0xe68
 4651d8c: aa0803e0     	mov	x0, x8
 4651d90: d63f0120     	blr	x9
 4651d94: 17ffffad     	b	0x4651c48 <_ChromeMain+0x464c9ac>
 4651d98: 3939e27f     	strb	wzr, [x19, #0xe78]
 4651d9c: f9474660     	ldr	x0, [x19, #0xe88]
 4651da0: 9139a261     	add	x1, x19, #0xe68
 4651da4: 976ade57     	bl	0x2109700 <_ChromeMain+0x2104464>
 4651da8: f9473668     	ldr	x8, [x19, #0xe68]
 4651dac: f9401d08     	ldr	x8, [x8, #0x38]
 4651db0: 9139a260     	add	x0, x19, #0xe68
 4651db4: d63f0100     	blr	x8
 4651db8: f9474268     	ldr	x8, [x19, #0xe80]
 4651dbc: b4fff868     	cbz	x8, 0x4651cc8 <_ChromeMain+0x464ca2c>
 4651dc0: f9473668     	ldr	x8, [x19, #0xe68]
 4651dc4: f9402108     	ldr	x8, [x8, #0x40]
 4651dc8: 9139a260     	add	x0, x19, #0xe68
 4651dcc: d63f0100     	blr	x8
 4651dd0: f9474268     	ldr	x8, [x19, #0xe80]
 4651dd4: f9400109     	ldr	x9, [x8]
 4651dd8: 7100001f     	cmp	w0, #0x0
 4651ddc: 5280020a     	mov	w10, #0x10              ; =16
 4651de0: 5280040b     	mov	w11, #0x20              ; =32
 4651de4: 9a8a116a     	csel	x10, x11, x10, ne
 4651de8: f86a6929     	ldr	x9, [x9, x10]
 4651dec: 9139a261     	add	x1, x19, #0xe68
 4651df0: aa0803e0     	mov	x0, x8
 4651df4: d63f0120     	blr	x9
 4651df8: 17ffffb4     	b	0x4651cc8 <_ChromeMain+0x464ca2c>
 4651dfc: 393b027f     	strb	wzr, [x19, #0xec0]
 4651e00: 17ffffae     	b	0x4651cb8 <_ChromeMain+0x464ca1c>
