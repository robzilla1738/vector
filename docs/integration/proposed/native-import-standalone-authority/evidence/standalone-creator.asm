
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4202ac4: a9bc6ffc     	stp	x28, x27, [sp, #-0x40]!
 4202ac8: a90157f6     	stp	x22, x21, [sp, #0x10]
 4202acc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4202ad0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4202ad4: 9100c3fd     	add	x29, sp, #0x30
 4202ad8: d10b03ff     	sub	sp, sp, #0x2c0
 4202adc: f9400428     	ldr	x8, [x1, #0x8]
 4202ae0: b5001e88     	cbnz	x8, 0x4202eb0 <_ChromeMain+0x41fdc14>
 4202ae4: aa0003f3     	mov	x19, x0
 4202ae8: f9403400     	ldr	x0, [x0, #0x68]
 4202aec: b4001dc0     	cbz	x0, 0x4202ea4 <_ChromeMain+0x41fdc08>
 4202af0: f9400008     	ldr	x8, [x0]
 4202af4: f940a508     	ldr	x8, [x8, #0x148]
 4202af8: d63f0100     	blr	x8
 4202afc: f900f3e0     	str	x0, [sp, #0x1e0]
 4202b00: f81b03bf     	stur	xzr, [x29, #-0x50]
 4202b04: 90056728     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4202b08: f9467d08     	ldr	x8, [x8, #0xcf8]
 4202b0c: f9414908     	ldr	x8, [x8, #0x290]
 4202b10: f9400500     	ldr	x0, [x8, #0x8]
 4202b14: 910783e8     	add	x8, sp, #0x1e0
 4202b18: d10143a9     	sub	x9, x29, #0x50
 4202b1c: a90f27e8     	stp	x8, x9, [sp, #0xf0]
 4202b20: 100068c2     	adr	x2, 0x4203838 <_ChromeMain+0x41fe59c>
 4202b24: d503201f     	nop
 4202b28: 9103c3e1     	add	x1, sp, #0xf0
 4202b2c: 52800003     	mov	w3, #0x0                ; =0
 4202b30: 52800004     	mov	w4, #0x0                ; =0
 4202b34: 972ebb4f     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 4202b38: f85b03b4     	ldur	x20, [x29, #-0x50]
 4202b3c: b40001f4     	cbz	x20, 0x4202b78 <_ChromeMain+0x41fd8dc>
 4202b40: f9403e80     	ldr	x0, [x20, #0x78]
 4202b44: f9400008     	ldr	x8, [x0]
 4202b48: f9402108     	ldr	x8, [x8, #0x40]
 4202b4c: d63f0100     	blr	x8
 4202b50: f9403e80     	ldr	x0, [x20, #0x78]
 4202b54: f9400008     	ldr	x8, [x0]
 4202b58: f9403508     	ldr	x8, [x8, #0x68]
 4202b5c: d63f0100     	blr	x8
 4202b60: 910b03ff     	add	sp, sp, #0x2c0
 4202b64: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4202b68: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4202b6c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4202b70: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4202b74: d65f03c0     	ret
 4202b78: f9403660     	ldr	x0, [x19, #0x68]
 4202b7c: 979e9111     	bl	0x29a6fc0 <_ChromeMain+0x29a1d24>
 4202b80: 35ffff00     	cbnz	w0, 0x4202b60 <_ChromeMain+0x41fd8c4>
 4202b84: f9403668     	ldr	x8, [x19, #0x68]
 4202b88: f9400d08     	ldr	x8, [x8, #0x18]
 4202b8c: 3940c108     	ldrb	w8, [x8, #0x30]
 4202b90: 3707fe88     	tbnz	w8, #0x0, 0x4202b60 <_ChromeMain+0x41fd8c4>
 4202b94: 6f00e400     	movi.2d	v0, #0000000000000000
 4202b98: ad0e03e0     	stp	q0, q0, [sp, #0x1c0]
 4202b9c: ad0d03e0     	stp	q0, q0, [sp, #0x1a0]
 4202ba0: ad0c03e0     	stp	q0, q0, [sp, #0x180]
 4202ba4: ad0b03e0     	stp	q0, q0, [sp, #0x160]
 4202ba8: ad0a03e0     	stp	q0, q0, [sp, #0x140]
 4202bac: ad0903e0     	stp	q0, q0, [sp, #0x120]
 4202bb0: ad0803e0     	stp	q0, q0, [sp, #0x100]
 4202bb4: d10143a9     	sub	x9, x29, #0x50
 4202bb8: 9100452a     	add	x10, x9, #0x11
 4202bbc: 90046808     	adrp	x8, 0xcf02000 <dyld_stub_binder+0xcf02000>
 4202bc0: 91249108     	add	x8, x8, #0x924
 4202bc4: 3d803fe0     	str	q0, [sp, #0xf0]
 4202bc8: eb08015f     	cmp	x10, x8
 4202bcc: 5280022a     	mov	w10, #0x11              ; =17
 4202bd0: fa488122     	ccmp	x9, x8, #0x2, hi
 4202bd4: 381c73aa     	sturb	w10, [x29, #-0x39]
 4202bd8: 540016a9     	b.ls	0x4202eac <_ChromeMain+0x41fdc10>
 4202bdc: 52800c29     	mov	w9, #0x61               ; =97
 4202be0: 781c03a9     	sturh	w9, [x29, #-0x40]
 4202be4: 3dc00100     	ldr	q0, [x8]
 4202be8: 3c9b03a0     	stur	q0, [x29, #-0x50]
 4202bec: f9400a68     	ldr	x8, [x19, #0x10]
 4202bf0: f9403115     	ldr	x21, [x8, #0x60]
 4202bf4: a93a7fbf     	stp	xzr, xzr, [x29, #-0x60]
 4202bf8: b40002b5     	cbz	x21, 0x4202c4c <_ChromeMain+0x41fd9b0>
 4202bfc: aa1503e0     	mov	x0, x21
 4202c00: 97b9f76a     	bl	0x30809a8 <_ChromeMain+0x307b70c>
 4202c04: b4000140     	cbz	x0, 0x4202c2c <_ChromeMain+0x41fd990>
 4202c08: f9400008     	ldr	x8, [x0]
 4202c0c: f9401d08     	ldr	x8, [x8, #0x38]
 4202c10: d63f0100     	blr	x8
 4202c14: aa0103f4     	mov	x20, x1
 4202c18: a93a07a0     	stp	x0, x1, [x29, #-0x60]
 4202c1c: 34000094     	cbz	w20, 0x4202c2c <_ChromeMain+0x41fd990>
 4202c20: d360fe88     	lsr	x8, x20, #32
 4202c24: aa0803f6     	mov	x22, x8
 4202c28: b5000168     	cbnz	x8, 0x4202c54 <_ChromeMain+0x41fd9b8>
 4202c2c: f94076a0     	ldr	x0, [x21, #0xe8]
 4202c30: f9400008     	ldr	x8, [x0]
 4202c34: f9401508     	ldr	x8, [x8, #0x28]
 4202c38: d63f0100     	blr	x8
 4202c3c: aa0103f4     	mov	x20, x1
 4202c40: a93a07a0     	stp	x0, x1, [x29, #-0x60]
 4202c44: d360fc36     	lsr	x22, x1, #32
 4202c48: 14000003     	b	0x4202c54 <_ChromeMain+0x41fd9b8>
 4202c4c: 52800016     	mov	w22, #0x0               ; =0
 4202c50: 52800014     	mov	w20, #0x0               ; =0
 4202c54: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 4202c58: d0056868     	adrp	x8, 0xef10000 <dyld_stub_binder+0xef10000>
 4202c5c: f942f500     	ldr	x0, [x8, #0x5e8]
 4202c60: b4000480     	cbz	x0, 0x4202cf0 <_ChromeMain+0x41fda54>
 4202c64: 910783f5     	add	x21, sp, #0x1e0
 4202c68: 34000294     	cbz	w20, 0x4202cb8 <_ChromeMain+0x41fda1c>
 4202c6c: 34000276     	cbz	w22, 0x4202cb8 <_ChromeMain+0x41fda1c>
 4202c70: f9400008     	ldr	x8, [x0]
 4202c74: f9403109     	ldr	x9, [x8, #0x60]
 4202c78: 910783e8     	add	x8, sp, #0x1e0
 4202c7c: d10183a1     	sub	x1, x29, #0x60
 4202c80: d63f0120     	blr	x9
 4202c84: 3cc282a0     	ldur	q0, [x21, #0x28]
 4202c88: 3c9903a0     	stur	q0, [x29, #-0x70]
 4202c8c: 39c9dfe8     	ldrsb	w8, [sp, #0x277]
 4202c90: 37f81168     	tbnz	w8, #0x1f, 0x4202ebc <_ChromeMain+0x41fdc20>
 4202c94: f94127e0     	ldr	x0, [sp, #0x248]
 4202c98: b40000a0     	cbz	x0, 0x4202cac <_ChromeMain+0x41fda10>
 4202c9c: 12800008     	mov	w8, #-0x1               ; =-1
 4202ca0: b8e80008     	ldaddal	w8, w8, [x0]
 4202ca4: 7100051f     	cmp	w8, #0x1
 4202ca8: 54000f00     	b.eq	0x4202e88 <_ChromeMain+0x41fdbec>
 4202cac: 29755bb4     	ldp	w20, w22, [x29, #-0x58]
 4202cb0: 35000234     	cbnz	w20, 0x4202cf4 <_ChromeMain+0x41fda58>
 4202cb4: 14000011     	b	0x4202cf8 <_ChromeMain+0x41fda5c>
 4202cb8: f9400008     	ldr	x8, [x0]
 4202cbc: f9403509     	ldr	x9, [x8, #0x68]
 4202cc0: 910783e8     	add	x8, sp, #0x1e0
 4202cc4: d63f0120     	blr	x9
 4202cc8: 3cc282a0     	ldur	q0, [x21, #0x28]
 4202ccc: 3c9903a0     	stur	q0, [x29, #-0x70]
 4202cd0: 39c9dfe8     	ldrsb	w8, [sp, #0x277]
 4202cd4: 37f80fe8     	tbnz	w8, #0x1f, 0x4202ed0 <_ChromeMain+0x41fdc34>
 4202cd8: f94127e0     	ldr	x0, [sp, #0x248]
 4202cdc: b40000a0     	cbz	x0, 0x4202cf0 <_ChromeMain+0x41fda54>
 4202ce0: 12800008     	mov	w8, #-0x1               ; =-1
 4202ce4: b8e80008     	ldaddal	w8, w8, [x0]
 4202ce8: 7100051f     	cmp	w8, #0x1
 4202cec: 54000d40     	b.eq	0x4202e94 <_ChromeMain+0x41fdbf8>
 4202cf0: 34000054     	cbz	w20, 0x4202cf8 <_ChromeMain+0x41fda5c>
 4202cf4: 35000076     	cbnz	w22, 0x4202d00 <_ChromeMain+0x41fda64>
 4202cf8: 3cd903a0     	ldur	q0, [x29, #-0x70]
 4202cfc: 3c9a03a0     	stur	q0, [x29, #-0x60]
 4202d00: 3cda03a1     	ldur	q1, [x29, #-0x60]
 4202d04: 3d807be1     	str	q1, [sp, #0x1e0]
 4202d08: fd40f7e0     	ldr	d0, [sp, #0x1e8]
 4202d0c: 928059e8     	mov	x8, #-0x2d0             ; =-720
 4202d10: f2dfc188     	movk	x8, #0xfe0c, lsl #32
 4202d14: 9e670102     	fmov	d2, x8
 4202d18: 0ea28400     	add.2s	v0, v0, v2
 4202d1c: 2f211400     	usra.2s	v0, v0, #0x1f
 4202d20: 0f3f1401     	ssra.2s	v1, v0, #0x1
 4202d24: d2805a14     	mov	x20, #0x2d0             ; =720
 4202d28: f2c03e94     	movk	x20, #0x1f4, lsl #32
 4202d2c: 9e670280     	fmov	d0, x20
 4202d30: 0ea00c20     	sqadd.2s	v0, v1, v0
 4202d34: 0ea12c00     	sqsub.2s	v0, v0, v1
 4202d38: 6f00e402     	movi.2d	v2, #0000000000000000
 4202d3c: 0ea26400     	smax.2s	v0, v0, v2
 4202d40: 6e180401     	mov.d	v1[1], v0[0]
 4202d44: 3d807be1     	str	q1, [sp, #0x1e0]
 4202d48: b85983a8     	ldur	w8, [x29, #-0x68]
 4202d4c: 340000e8     	cbz	w8, 0x4202d68 <_ChromeMain+0x41fdacc>
 4202d50: b859c3a8     	ldur	w8, [x29, #-0x64]
 4202d54: 340000a8     	cbz	w8, 0x4202d68 <_ChromeMain+0x41fdacc>
 4202d58: 910783e0     	add	x0, sp, #0x1e0
 4202d5c: d101c3a1     	sub	x1, x29, #0x70
 4202d60: 976827c8     	bl	0x1c0cc80 <_ChromeMain+0x1c079e4>
 4202d64: fd40f7e0     	ldr	d0, [sp, #0x1e8]
 4202d68: 1e260008     	fmov	w8, s0
 4202d6c: 7100011f     	cmp	w8, #0x0
 4202d70: 0e0c3c08     	mov.s	w8, v0[1]
 4202d74: 7a401904     	ccmp	w8, #0x0, #0x4, ne
 4202d78: a95e27e8     	ldp	x8, x9, [sp, #0x1e0]
 4202d7c: 9a8803e8     	csel	x8, xzr, x8, eq
 4202d80: 9a890289     	csel	x9, x20, x9, eq
 4202d84: a91e27e8     	stp	x8, x9, [sp, #0x1e0]
 4202d88: f9403663     	ldr	x3, [x19, #0x68]
 4202d8c: 52800033     	mov	w19, #0x1               ; =1
 4202d90: 9103c3e8     	add	x8, sp, #0xf0
 4202d94: d10143a0     	sub	x0, x29, #0x50
 4202d98: 910783e2     	add	x2, sp, #0x1e0
 4202d9c: 52800021     	mov	w1, #0x1                ; =1
 4202da0: 52800024     	mov	w4, #0x1                ; =1
 4202da4: 94e5877f     	bl	0x7b64ba0 <_ChromeMain+0x7b5f904>
 4202da8: 38dc73a8     	ldursb	w8, [x29, #-0x39]
 4202dac: 36f800a8     	tbz	w8, #0x1f, 0x4202dc0 <_ChromeMain+0x41fdb24>
 4202db0: f85b03a0     	ldur	x0, [x29, #-0x50]
 4202db4: f85c03a8     	ldur	x8, [x29, #-0x40]
 4202db8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4202dbc: 96f8183f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4202dc0: 79026bf3     	strh	w19, [sp, #0x134]
 4202dc4: 790323ff     	strh	wzr, [sp, #0x190]
 4202dc8: 39064bff     	strb	wzr, [sp, #0x192]
 4202dcc: 910003e0     	mov	x0, sp
 4202dd0: 9103c3e1     	add	x1, sp, #0xf0
 4202dd4: 97bf255b     	bl	0x31cc340 <_ChromeMain+0x31c70a4>
 4202dd8: 910003e0     	mov	x0, sp
 4202ddc: 97bf2509     	bl	0x31cc200 <_ChromeMain+0x31c6f64>
 4202de0: aa0003f3     	mov	x19, x0
 4202de4: 910003e0     	mov	x0, sp
 4202de8: 9785e67e     	bl	0x237c7e0 <_ChromeMain+0x2377544>
 4202dec: b5000093     	cbnz	x19, 0x4202dfc <_ChromeMain+0x41fdb60>
 4202df0: 9103c3e0     	add	x0, sp, #0xf0
 4202df4: 9785e67b     	bl	0x237c7e0 <_ChromeMain+0x2377544>
 4202df8: 17ffff5a     	b	0x4202b60 <_ChromeMain+0x41fd8c4>
 4202dfc: f100a274     	subs	x20, x19, #0x28
 4202e00: 9a9303f5     	csel	x21, xzr, x19, eq
 4202e04: 90046801     	adrp	x1, 0xcf02000 <dyld_stub_binder+0xcf02000>
 4202e08: 9124d821     	add	x1, x1, #0x936
 4202e0c: 910783f6     	add	x22, sp, #0x1e0
 4202e10: 910783e0     	add	x0, sp, #0x1e0
 4202e14: 52800362     	mov	w2, #0x1b               ; =27
 4202e18: 9705b4ef     	bl	0x3701d4 <_ChromeMain+0x36af38>
 4202e1c: 381b03bf     	sturb	wzr, [x29, #-0x50]
 4202e20: 381c03bf     	sturb	wzr, [x29, #-0x40]
 4202e24: 910783e1     	add	x1, sp, #0x1e0
 4202e28: d10143a4     	sub	x4, x29, #0x50
 4202e2c: aa1503e0     	mov	x0, x21
 4202e30: 12800002     	mov	w2, #-0x1               ; =-1
 4202e34: 52800023     	mov	w3, #0x1                ; =1
 4202e38: 52800005     	mov	w5, #0x0                ; =0
 4202e3c: 95a45452     	bl	0xab17f84 <_ChromeMain+0xab12ce8>
 4202e40: 9101c2c0     	add	x0, x22, #0x70
 4202e44: d2800001     	mov	x1, #0x0                ; =0
 4202e48: 96f8939c     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4202e4c: 910082c0     	add	x0, x22, #0x20
 4202e50: 96f8938a     	bl	0x27c78 <_ChromeMain+0x229dc>
 4202e54: 39c7dfe8     	ldrsb	w8, [sp, #0x1f7]
 4202e58: 36f800a8     	tbz	w8, #0x1f, 0x4202e6c <_ChromeMain+0x41fdbd0>
 4202e5c: f940f3e0     	ldr	x0, [sp, #0x1e0]
 4202e60: f940fbe8     	ldr	x8, [sp, #0x1f0]
 4202e64: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4202e68: 96f81814     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4202e6c: aa1403e0     	mov	x0, x20
 4202e70: 940e2764     	bl	0x458cc00 <_ChromeMain+0x4587964>
 4202e74: f9402a60     	ldr	x0, [x19, #0x50]
 4202e78: f9400008     	ldr	x8, [x0]
 4202e7c: f9402108     	ldr	x8, [x8, #0x40]
 4202e80: d63f0100     	blr	x8
 4202e84: 17ffffdb     	b	0x4202df0 <_ChromeMain+0x41fdb54>
 4202e88: 52803e81     	mov	w1, #0x1f4              ; =500
 4202e8c: 96f8180b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4202e90: 17ffff87     	b	0x4202cac <_ChromeMain+0x41fda10>
 4202e94: 52803e81     	mov	w1, #0x1f4              ; =500
 4202e98: 96f81808     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4202e9c: 35fff2d4     	cbnz	w20, 0x4202cf4 <_ChromeMain+0x41fda58>
 4202ea0: 17ffff96     	b	0x4202cf8 <_ChromeMain+0x41fda5c>
 4202ea4: d4200000     	brk	#0
 4202ea8: d4400000     	hlt	#0
 4202eac: d4200020     	brk	#0x1
 4202eb0: d4200000     	brk	#0
 4202eb4: d4400000     	hlt	#0
 4202eb8: d4200020     	brk	#0x1
