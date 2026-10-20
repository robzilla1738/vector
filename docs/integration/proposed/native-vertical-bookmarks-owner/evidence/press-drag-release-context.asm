
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4618b60: d10183ff     	sub	sp, sp, #0x60
 4618b64: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4618b68: a90357f6     	stp	x22, x21, [sp, #0x30]
 4618b6c: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4618b70: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4618b74: 910143fd     	add	x29, sp, #0x50
 4618b78: b40000c1     	cbz	x1, 0x4618b90 <_ChromeMain+0x46138f4>
 4618b7c: aa0203f4     	mov	x20, x2
 4618b80: b9405048     	ldr	w8, [x2, #0x50]
 4618b84: 12151108     	and	w8, w8, #0xf800
 4618b88: 7120011f     	cmp	w8, #0x800
 4618b8c: 540000e0     	b.eq	0x4618ba8 <_ChromeMain+0x461390c>
 4618b90: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4618b94: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4618b98: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4618b9c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4618ba0: 910183ff     	add	sp, sp, #0x60
 4618ba4: d65f03c0     	ret
 4618ba8: aa0103f5     	mov	x21, x1
 4618bac: aa0003f3     	mov	x19, x0
 4618bb0: f942ec08     	ldr	x8, [x0, #0x5d8]
 4618bb4: d37ced16     	lsl	x22, x8, #4
 4618bb8: b4000276     	cbz	x22, 0x4618c04 <_ChromeMain+0x4613968>
 4618bbc: f942ea68     	ldr	x8, [x19, #0x5d0]
 4618bc0: 91002117     	add	x23, x8, #0x8
 4618bc4: 1400000c     	b	0x4618bf4 <_ChromeMain+0x4613958>
 4618bc8: b904541f     	str	wzr, [x0, #0x454]
 4618bcc: 96fe216c     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4618bd0: f94002e0     	ldr	x0, [x23]
 4618bd4: 52800001     	mov	w1, #0x0                ; =0
 4618bd8: 52800002     	mov	w2, #0x0                ; =0
 4618bdc: 52800003     	mov	w3, #0x0                ; =0
 4618be0: 52800024     	mov	w4, #0x1                ; =1
 4618be4: 97fff957     	bl	0x4617140 <_ChromeMain+0x4611ea4>
 4618be8: 910042f7     	add	x23, x23, #0x10
 4618bec: f10042d6     	subs	x22, x22, #0x10
 4618bf0: 540000a0     	b.eq	0x4618c04 <_ChromeMain+0x4613968>
 4618bf4: f94002e0     	ldr	x0, [x23]
 4618bf8: b9445408     	ldr	w8, [x0, #0x454]
 4618bfc: 34fffec8     	cbz	w8, 0x4618bd4 <_ChromeMain+0x4613938>
 4618c00: 17fffff2     	b	0x4618bc8 <_ChromeMain+0x461392c>
 4618c04: f941f2b6     	ldr	x22, [x21, #0x3e0]
 4618c08: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4618c0c: d0052cd7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4618c10: f94046e9     	ldr	x9, [x23, #0x88]
 4618c14: eb09011f     	cmp	x8, x9
 4618c18: 54000061     	b.ne	0x4618c24 <_ChromeMain+0x4613988>
 4618c1c: aa1603e0     	mov	x0, x22
 4618c20: 96e7edb7     	bl	0x142fc <_ChromeMain+0xf060>
 4618c24: f9437e60     	ldr	x0, [x19, #0x6f8]
 4618c28: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4618c2c: f94046e9     	ldr	x9, [x23, #0x88]
 4618c30: eb09011f     	cmp	x8, x9
 4618c34: 54000041     	b.ne	0x4618c3c <_ChromeMain+0x46139a0>
 4618c38: 96e82781     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4618c3c: f9037e76     	str	x22, [x19, #0x6f8]
 4618c40: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4618c44: f94046e9     	ldr	x9, [x23, #0x88]
 4618c48: eb09011f     	cmp	x8, x9
 4618c4c: 54000061     	b.ne	0x4618c58 <_ChromeMain+0x46139bc>
 4618c50: aa1503e0     	mov	x0, x21
 4618c54: 96e7edaa     	bl	0x142fc <_ChromeMain+0xf060>
 4618c58: f9438260     	ldr	x0, [x19, #0x700]
 4618c5c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4618c60: f94046e9     	ldr	x9, [x23, #0x88]
 4618c64: eb09011f     	cmp	x8, x9
 4618c68: 54000041     	b.ne	0x4618c70 <_ChromeMain+0x46139d4>
 4618c6c: 96e82774     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4618c70: f9038275     	str	x21, [x19, #0x700]
 4618c74: 391d027f     	strb	wzr, [x19, #0x740]
 4618c78: 911ea276     	add	x22, x19, #0x7a8
 4618c7c: f943d660     	ldr	x0, [x19, #0x7a8]
 4618c80: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4618c84: f94046e9     	ldr	x9, [x23, #0x88]
 4618c88: eb09011f     	cmp	x8, x9
 4618c8c: 54000041     	b.ne	0x4618c94 <_ChromeMain+0x46139f8>
 4618c90: 96e8276b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4618c94: a9007edf     	stp	xzr, xzr, [x22]
 4618c98: 390042df     	strb	wzr, [x22, #0x10]
 4618c9c: f943e260     	ldr	x0, [x19, #0x7c0]
 4618ca0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4618ca4: f94046e9     	ldr	x9, [x23, #0x88]
 4618ca8: eb09011f     	cmp	x8, x9
 4618cac: 54000041     	b.ne	0x4618cb4 <_ChromeMain+0x4613a18>
 4618cb0: 96e82763     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4618cb4: f903e27f     	str	xzr, [x19, #0x7c0]
 4618cb8: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4618cbc: a9007fff     	stp	xzr, xzr, [sp]
 4618cc0: 910063e2     	add	x2, sp, #0x18
 4618cc4: 910003e3     	mov	x3, sp
 4618cc8: aa1303e0     	mov	x0, x19
 4618ccc: 52800001     	mov	w1, #0x0                ; =0
 4618cd0: 52800004     	mov	w4, #0x0                ; =0
 4618cd4: 94000bce     	bl	0x461bc0c <_ChromeMain+0x4616970>
 4618cd8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4618cdc: 36f800a8     	tbz	w8, #0x1f, 0x4618cf0 <_ChromeMain+0x4613a54>
 4618ce0: f94003e0     	ldr	x0, [sp]
 4618ce4: f9400be8     	ldr	x8, [sp, #0x10]
 4618ce8: d37ff901     	lsl	x1, x8, #1
 4618cec: 96e7c073     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4618cf0: f9437276     	ldr	x22, [x19, #0x6e0]
 4618cf4: b4000216     	cbz	x22, 0x4618d34 <_ChromeMain+0x4613a98>
 4618cf8: 52800028     	mov	w8, #0x1                ; =1
 4618cfc: b82802c8     	ldadd	w8, w8, [x22]
 4618d00: 7100011f     	cmp	w8, #0x0
 4618d04: 5400030d     	b.le	0x4618d64 <_ChromeMain+0x4613ac8>
 4618d08: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4618d0c: 6b09011f     	cmp	w8, w9
 4618d10: 54000300     	b.eq	0x4618d70 <_ChromeMain+0x4613ad4>
 4618d14: f9437268     	ldr	x8, [x19, #0x6e0]
 4618d18: f9400508     	ldr	x8, [x8, #0x8]
 4618d1c: aa1603e0     	mov	x0, x22
 4618d20: d63f0100     	blr	x8
 4618d24: 12800008     	mov	w8, #-0x1               ; =-1
 4618d28: b8e802c8     	ldaddal	w8, w8, [x22]
 4618d2c: 7100051f     	cmp	w8, #0x1
 4618d30: 54000120     	b.eq	0x4618d54 <_ChromeMain+0x4613ab8>
 4618d34: aa1303e0     	mov	x0, x19
 4618d38: 95fffcc9     	bl	0xc61805c <_ChromeMain+0xc612dc0>
 4618d3c: f9429e61     	ldr	x1, [x19, #0x538]
 4618d40: aa1503e0     	mov	x0, x21
 4618d44: aa1403e2     	mov	x2, x20
 4618d48: 94000b19     	bl	0x461b9ac <_ChromeMain+0x4616710>
 4618d4c: f9039e60     	str	x0, [x19, #0x738]
 4618d50: 17ffff90     	b	0x4618b90 <_ChromeMain+0x46138f4>
 4618d54: f9400ac8     	ldr	x8, [x22, #0x10]
 4618d58: aa1603e0     	mov	x0, x22
 4618d5c: d63f0100     	blr	x8
 4618d60: 17fffff5     	b	0x4618d34 <_ChromeMain+0x4613a98>
 4618d64: d4200000     	brk	#0
 4618d68: d4400000     	hlt	#0
 4618d6c: d4200020     	brk	#0x1
 4618d70: d4200000     	brk	#0
 4618d74: d4400000     	hlt	#0
 4618d78: d4200020     	brk	#0x1
 4618d7c: d503201f     	nop
 4618d80: d10343ff     	sub	sp, sp, #0xd0
 4618d84: 6d0623e9     	stp	d9, d8, [sp, #0x60]
 4618d88: a9076ffc     	stp	x28, x27, [sp, #0x70]
 4618d8c: a90867fa     	stp	x26, x25, [sp, #0x80]
 4618d90: a9095ff8     	stp	x24, x23, [sp, #0x90]
 4618d94: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 4618d98: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 4618d9c: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 4618da0: 910303fd     	add	x29, sp, #0xc0
 4618da4: b40000c1     	cbz	x1, 0x4618dbc <_ChromeMain+0x4613b20>
 4618da8: aa0103f4     	mov	x20, x1
 4618dac: aa0003f3     	mov	x19, x0
 4618db0: f9438008     	ldr	x8, [x0, #0x700]
 4618db4: eb01011f     	cmp	x8, x1
 4618db8: 54000200     	b.eq	0x4618df8 <_ChromeMain+0x4613b5c>
 4618dbc: 52800013     	mov	w19, #0x0               ; =0
 4618dc0: aa1303e0     	mov	x0, x19
 4618dc4: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 4618dc8: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4618dcc: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4618dd0: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 4618dd4: a94867fa     	ldp	x26, x25, [sp, #0x80]
 4618dd8: a9476ffc     	ldp	x28, x27, [sp, #0x70]
 4618ddc: 6d4623e9     	ldp	d9, d8, [sp, #0x60]
 4618de0: 910343ff     	add	sp, sp, #0xd0
 4618de4: d65f03c0     	ret
 4618de8: aa1303e0     	mov	x0, x19
 4618dec: 94000a92     	bl	0x461b834 <_ChromeMain+0x4616598>
 4618df0: 52800033     	mov	w19, #0x1               ; =1
 4618df4: 17fffff3     	b	0x4618dc0 <_ChromeMain+0x4613b24>
 4618df8: f9437e68     	ldr	x8, [x19, #0x6f8]
 4618dfc: b4fffe08     	cbz	x8, 0x4618dbc <_ChromeMain+0x4613b20>
 4618e00: aa0203f6     	mov	x22, x2
 4618e04: b9405048     	ldr	w8, [x2, #0x50]
 4618e08: 12151108     	and	w8, w8, #0xf800
 4618e0c: 7120011f     	cmp	w8, #0x800
 4618e10: 54fffd61     	b.ne	0x4618dbc <_ChromeMain+0x4613b20>
 4618e14: f9429e61     	ldr	x1, [x19, #0x538]
 4618e18: aa1403e0     	mov	x0, x20
 4618e1c: aa1603e2     	mov	x2, x22
 4618e20: 94000ae3     	bl	0x461b9ac <_ChromeMain+0x4616710>
 4618e24: aa0003f5     	mov	x21, x0
 4618e28: 395d0268     	ldrb	w8, [x19, #0x740]
 4618e2c: 37000368     	tbnz	w8, #0x0, 0x4618e98 <_ChromeMain+0x4613bfc>
 4618e30: 9e6702a0     	fmov	d0, x21
 4618e34: fd439e61     	ldr	d1, [x19, #0x738]
 4618e38: 0ea12c00     	sqsub.2s	v0, v0, v1
 4618e3c: 0ea0b800     	abs.2s	v0, v0
 4618e40: 0f000501     	movi.2s	v1, #0x8
 4618e44: 0ea13400     	cmgt.2s	v0, v0, v1
 4618e48: 9e660008     	fmov	x8, d0
 4618e4c: b4fffb88     	cbz	x8, 0x4618dbc <_ChromeMain+0x4613b20>
 4618e50: f9437e68     	ldr	x8, [x19, #0x6f8]
 4618e54: 3944e108     	ldrb	w8, [x8, #0x138]
 4618e58: 3707fb28     	tbnz	w8, #0x0, 0x4618dbc <_ChromeMain+0x4613b20>
 4618e5c: 52800028     	mov	w8, #0x1                ; =1
 4618e60: 391d0268     	strb	w8, [x19, #0x740]
 4618e64: f9429e68     	ldr	x8, [x19, #0x538]
 4618e68: b4000188     	cbz	x8, 0x4618e98 <_ChromeMain+0x4613bfc>
 4618e6c: 395d0668     	ldrb	w8, [x19, #0x741]
 4618e70: 37000148     	tbnz	w8, #0x0, 0x4618e98 <_ChromeMain+0x4613bfc>
 4618e74: f9438a68     	ldr	x8, [x19, #0x710]
 4618e78: b4000108     	cbz	x8, 0x4618e98 <_ChromeMain+0x4613bfc>
 4618e7c: 52800029     	mov	w9, #0x1                ; =1
 4618e80: 391d0669     	strb	w9, [x19, #0x741]
 4618e84: d37df109     	lsl	x9, x8, #3
 4618e88: b4000089     	cbz	x9, 0x4618e98 <_ChromeMain+0x4613bfc>
 4618e8c: f9438677     	ldr	x23, [x19, #0x708]
 4618e90: 8b080ef8     	add	x24, x23, x8, lsl #3
 4618e94: 140001b7     	b	0x4619570 <_ChromeMain+0x46142d4>
 4618e98: d360febc     	lsr	x28, x21, #32
 4618e9c: b9473a68     	ldr	w8, [x19, #0x738]
 4618ea0: 6b0802a8     	subs	w8, w21, w8
 4618ea4: 131f7d09     	asr	w9, w8, #31
 4618ea8: 52010129     	eor	w9, w9, #0x80000000
 4618eac: 1a886128     	csel	w8, w9, w8, vs
 4618eb0: b9473e69     	ldr	w9, [x19, #0x73c]
 4618eb4: 6b090389     	subs	w9, w28, w9
 4618eb8: 131f7d2a     	asr	w10, w9, #31
 4618ebc: 5201014a     	eor	w10, w10, #0x80000000
 4618ec0: 1a896157     	csel	w23, w10, w9, vs
 4618ec4: 3100291f     	cmn	w8, #0xa
 4618ec8: 12800129     	mov	w9, #-0xa               ; =-10
 4618ecc: 1a89c108     	csel	w8, w8, w9, gt
 4618ed0: 52800249     	mov	w9, #0x12               ; =18
 4618ed4: 7100491f     	cmp	w8, #0x12
 4618ed8: 1a89b118     	csel	w24, w8, w9, lt
 4618edc: f9438a68     	ldr	x8, [x19, #0x710]
 4618ee0: d37df109     	lsl	x9, x8, #3
 4618ee4: b4000529     	cbz	x9, 0x4618f88 <_ChromeMain+0x4613cec>
 4618ee8: f9438679     	ldr	x25, [x19, #0x708]
 4618eec: 8b080f3a     	add	x26, x25, x8, lsl #3
 4618ef0: 1400000b     	b	0x4618f1c <_ChromeMain+0x4613c80>
 4618ef4: f9437e69     	ldr	x9, [x19, #0x6f8]
 4618ef8: eb08013f     	cmp	x9, x8
 4618efc: 1a9f17e4     	cset	w4, eq
 4618f00: 52800021     	mov	w1, #0x1                ; =1
 4618f04: aa1803e2     	mov	x2, x24
 4618f08: aa1703e3     	mov	x3, x23
 4618f0c: 97fff88d     	bl	0x4617140 <_ChromeMain+0x4611ea4>
 4618f10: 91002339     	add	x25, x25, #0x8
 4618f14: eb1a033f     	cmp	x25, x26
 4618f18: 54000380     	b.eq	0x4618f88 <_ChromeMain+0x4613cec>
 4618f1c: f9400328     	ldr	x8, [x25]
 4618f20: f942ea6a     	ldr	x10, [x19, #0x5d0]
 4618f24: f942ee6b     	ldr	x11, [x19, #0x5d8]
 4618f28: d37ced69     	lsl	x9, x11, #4
 4618f2c: b40002a9     	cbz	x9, 0x4618f80 <_ChromeMain+0x4613ce4>
 4618f30: 9344fd2c     	asr	x12, x9, #4
 4618f34: aa0a03e9     	mov	x9, x10
 4618f38: d341fd8d     	lsr	x13, x12, #1
 4618f3c: 8b0d112e     	add	x14, x9, x13, lsl #4
 4618f40: f84105cf     	ldr	x15, [x14], #0x10
 4618f44: aa6c07f0     	mvn	x16, x12, lsr #1
 4618f48: 8b10018c     	add	x12, x12, x16
 4618f4c: eb0801ff     	cmp	x15, x8
 4618f50: 9a8d318c     	csel	x12, x12, x13, lo
 4618f54: 9a8931c9     	csel	x9, x14, x9, lo
 4618f58: b5ffff0c     	cbnz	x12, 0x4618f38 <_ChromeMain+0x4613c9c>
 4618f5c: 8b0b114a     	add	x10, x10, x11, lsl #4
 4618f60: eb0a013f     	cmp	x9, x10
 4618f64: 54fffd60     	b.eq	0x4618f10 <_ChromeMain+0x4613c74>
 4618f68: f940012a     	ldr	x10, [x9]
 4618f6c: eb0a011f     	cmp	x8, x10
 4618f70: 54fffd03     	b.lo	0x4618f10 <_ChromeMain+0x4613c74>
 4618f74: f9400520     	ldr	x0, [x9, #0x8]
 4618f78: b4fffcc0     	cbz	x0, 0x4618f10 <_ChromeMain+0x4613c74>
 4618f7c: 17ffffde     	b	0x4618ef4 <_ChromeMain+0x4613c58>
 4618f80: aa0a03e9     	mov	x9, x10
 4618f84: 17fffff6     	b	0x4618f5c <_ChromeMain+0x4613cc0>
 4618f88: f942ee68     	ldr	x8, [x19, #0x5d8]
 4618f8c: d37ced18     	lsl	x24, x8, #4
 4618f90: b4000198     	cbz	x24, 0x4618fc0 <_ChromeMain+0x4613d24>
 4618f94: f942ea68     	ldr	x8, [x19, #0x5d0]
 4618f98: 91002119     	add	x25, x8, #0x8
 4618f9c: 14000005     	b	0x4618fb0 <_ChromeMain+0x4613d14>
 4618fa0: b904541f     	str	wzr, [x0, #0x454]
 4618fa4: 96fe2076     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4618fa8: f1004318     	subs	x24, x24, #0x10
 4618fac: 540000a0     	b.eq	0x4618fc0 <_ChromeMain+0x4613d24>
 4618fb0: f8410720     	ldr	x0, [x25], #0x10
 4618fb4: b9445408     	ldr	w8, [x0, #0x454]
 4618fb8: 34ffff88     	cbz	w8, 0x4618fa8 <_ChromeMain+0x4613d0c>
 4618fbc: 17fffff9     	b	0x4618fa0 <_ChromeMain+0x4613d04>
 4618fc0: 911ea27b     	add	x27, x19, #0x7a8
 4618fc4: f943d660     	ldr	x0, [x19, #0x7a8]
 4618fc8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4618fcc: d0052cda     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4618fd0: f9404749     	ldr	x9, [x26, #0x88]
 4618fd4: eb09011f     	cmp	x8, x9
 4618fd8: 54000041     	b.ne	0x4618fe0 <_ChromeMain+0x4613d44>
 4618fdc: 96e82698     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4618fe0: a9007f7f     	stp	xzr, xzr, [x27]
 4618fe4: 3900437f     	strb	wzr, [x27, #0x10]
 4618fe8: f9437e68     	ldr	x8, [x19, #0x6f8]
 4618fec: b940f908     	ldr	w8, [x8, #0xf8]
 4618ff0: 34000a28     	cbz	w8, 0x4619134 <_ChromeMain+0x4613e98>
 4618ff4: 39512688     	ldrb	w8, [x20, #0x449]
 4618ff8: 340001c8     	cbz	w8, 0x4619030 <_ChromeMain+0x4613d94>
 4618ffc: 3911269f     	strb	wzr, [x20, #0x449]
 4619000: f9401298     	ldr	x24, [x20, #0x20]
 4619004: b4000178     	cbz	x24, 0x4619030 <_ChromeMain+0x4613d94>
 4619008: 39511e88     	ldrb	w8, [x20, #0x447]
 461900c: 7100011f     	cmp	w8, #0x0
 4619010: 9004c9c8     	adrp	x8, 0xdf51000 <dyld_stub_binder+0xdf51000>
 4619014: bd432500     	ldr	s0, [x8, #0x324]
 4619018: 1e2e1001     	fmov	s1, #1.00000000
 461901c: 1e211c08     	fcsel	s8, s0, s1, ne
 4619020: f940b300     	ldr	x0, [x24, #0x160]
 4619024: b4005c00     	cbz	x0, 0x4619ba4 <_ChromeMain+0x4614908>
 4619028: 4ea81d00     	mov.16b	v0, v8
 461902c: 97536ec3     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 4619030: f943e260     	ldr	x0, [x19, #0x7c0]
 4619034: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4619038: f9404749     	ldr	x9, [x26, #0x88]
 461903c: eb09011f     	cmp	x8, x9
 4619040: 54000041     	b.ne	0x4619048 <_ChromeMain+0x4613dac>
 4619044: 96e8267e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4619048: f903e27f     	str	xzr, [x19, #0x7c0]
 461904c: f9437278     	ldr	x24, [x19, #0x6e0]
 4619050: b4000218     	cbz	x24, 0x4619090 <_ChromeMain+0x4613df4>
 4619054: 52800028     	mov	w8, #0x1                ; =1
 4619058: b8280308     	ldadd	w8, w8, [x24]
 461905c: 7100011f     	cmp	w8, #0x0
 4619060: 54005fed     	b.le	0x4619c5c <_ChromeMain+0x46149c0>
 4619064: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4619068: 6b09011f     	cmp	w8, w9
 461906c: 54005f20     	b.eq	0x4619c50 <_ChromeMain+0x46149b4>
 4619070: f9437268     	ldr	x8, [x19, #0x6e0]
 4619074: f9400508     	ldr	x8, [x8, #0x8]
 4619078: aa1803e0     	mov	x0, x24
 461907c: d63f0100     	blr	x8
 4619080: 12800008     	mov	w8, #-0x1               ; =-1
 4619084: b8e80308     	ldaddal	w8, w8, [x24]
 4619088: 7100051f     	cmp	w8, #0x1
 461908c: 54005aa0     	b.eq	0x4619be0 <_ChromeMain+0x4614944>
 4619090: aa1403e0     	mov	x0, x20
 4619094: aa1303e1     	mov	x1, x19
 4619098: aa1603e2     	mov	x2, x22
 461909c: 94000a44     	bl	0x461b9ac <_ChromeMain+0x4616710>
 46190a0: 71004eff     	cmp	w23, #0x13
 46190a4: 5400010b     	b.lt	0x46190c4 <_ChromeMain+0x4613e28>
 46190a8: f9437e68     	ldr	x8, [x19, #0x6f8]
 46190ac: b940f908     	ldr	w8, [x8, #0xf8]
 46190b0: 350000a8     	cbnz	w8, 0x46190c4 <_ChromeMain+0x4613e28>
 46190b4: d360fc08     	lsr	x8, x0, #32
 46190b8: b941c669     	ldr	w9, [x19, #0x1c4]
 46190bc: 6b08013f     	cmp	w9, w8
 46190c0: 54000c6d     	b.le	0x461924c <_ChromeMain+0x4613fb0>
 46190c4: f90013ff     	str	xzr, [sp, #0x20]
 46190c8: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 46190cc: f90023ff     	str	xzr, [sp, #0x40]
 46190d0: 910083e2     	add	x2, sp, #0x20
 46190d4: 9100c3e3     	add	x3, sp, #0x30
 46190d8: aa1303e0     	mov	x0, x19
 46190dc: 52800001     	mov	w1, #0x0                ; =0
 46190e0: 52800004     	mov	w4, #0x0                ; =0
 46190e4: 94000aca     	bl	0x461bc0c <_ChromeMain+0x4616970>
 46190e8: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 46190ec: 36f800a8     	tbz	w8, #0x1f, 0x4619100 <_ChromeMain+0x4613e64>
 46190f0: f9401be0     	ldr	x0, [sp, #0x30]
 46190f4: f94023e8     	ldr	x8, [sp, #0x40]
 46190f8: d37ff901     	lsl	x1, x8, #1
 46190fc: 96e7bf6f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4619100: f9430668     	ldr	x8, [x19, #0x608]
 4619104: b4ffe728     	cbz	x8, 0x4618de8 <_ChromeMain+0x4613b4c>
 4619108: d37df109     	lsl	x9, x8, #3
 461910c: b4001949     	cbz	x9, 0x4619434 <_ChromeMain+0x4614198>
 4619110: 1e270380     	fmov	s0, w28
 4619114: 4e0c1ea0     	mov.s	v0[1], w21
 4619118: 3d8007e0     	str	q0, [sp, #0x10]
 461911c: f9430278     	ldr	x24, [x19, #0x600]
 4619120: 8b080f19     	add	x25, x24, x8, lsl #3
 4619124: b004c908     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4619128: 3dc00d00     	ldr	q0, [x8, #0x30]
 461912c: 3d8003e0     	str	q0, [sp]
 4619130: 14000062     	b	0x46192b8 <_ChromeMain+0x461401c>
 4619134: f9436a68     	ldr	x8, [x19, #0x6d0]
 4619138: b4fff5e8     	cbz	x8, 0x4618ff4 <_ChromeMain+0x4613d58>
 461913c: aa1403e0     	mov	x0, x20
 4619140: aa1603e1     	mov	x1, x22
 4619144: 94000a6a     	bl	0x461baec <_ChromeMain+0x4616850>
 4619148: f9002fe0     	str	x0, [sp, #0x58]
 461914c: f9437e78     	ldr	x24, [x19, #0x6f8]
 4619150: f9421288     	ldr	x8, [x20, #0x420]
 4619154: b4004e88     	cbz	x8, 0x4619b24 <_ChromeMain+0x4614888>
 4619158: 9100c3e0     	add	x0, sp, #0x30
 461915c: 910d2101     	add	x1, x8, #0x348
 4619160: 970296ff     	bl	0x6bed5c <_ChromeMain+0x6b9ac0>
 4619164: aa1403e0     	mov	x0, x20
 4619168: 97383903     	bl	0x1427574 <_ChromeMain+0x14222d8>
 461916c: a90207e0     	stp	x0, x1, [sp, #0x20]
 4619170: f9436a79     	ldr	x25, [x19, #0x6d0]
 4619174: b40057b9     	cbz	x25, 0x4619c68 <_ChromeMain+0x46149cc>
 4619178: 52800028     	mov	w8, #0x1                ; =1
 461917c: b8280328     	ldadd	w8, w8, [x25]
 4619180: 7100011f     	cmp	w8, #0x0
 4619184: 5400578d     	b.le	0x4619c74 <_ChromeMain+0x46149d8>
 4619188: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461918c: 6b09011f     	cmp	w8, w9
 4619190: 54005780     	b.eq	0x4619c80 <_ChromeMain+0x46149e4>
 4619194: f9436a68     	ldr	x8, [x19, #0x6d0]
 4619198: f9400508     	ldr	x8, [x8, #0x8]
 461919c: 9100c3e2     	add	x2, sp, #0x30
 46191a0: 910083e3     	add	x3, sp, #0x20
 46191a4: 910163e4     	add	x4, sp, #0x58
 46191a8: aa1903e0     	mov	x0, x25
 46191ac: aa1803e1     	mov	x1, x24
 46191b0: d63f0100     	blr	x8
 46191b4: aa0003f8     	mov	x24, x0
 46191b8: 12800008     	mov	w8, #-0x1               ; =-1
 46191bc: b8e80328     	ldaddal	w8, w8, [x25]
 46191c0: 7100051f     	cmp	w8, #0x1
 46191c4: 54000081     	b.ne	0x46191d4 <_ChromeMain+0x4613f38>
 46191c8: f9400b28     	ldr	x8, [x25, #0x10]
 46191cc: aa1903e0     	mov	x0, x25
 46191d0: d63f0100     	blr	x8
 46191d4: 9100c3e0     	add	x0, sp, #0x30
 46191d8: 9708b59a     	bl	0x846840 <_ChromeMain+0x8415a4>
 46191dc: 34fff0d8     	cbz	w24, 0x4618ff4 <_ChromeMain+0x4613d58>
 46191e0: f9437e75     	ldr	x21, [x19, #0x6f8]
 46191e4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 46191e8: f9404749     	ldr	x9, [x26, #0x88]
 46191ec: eb09011f     	cmp	x8, x9
 46191f0: 54000061     	b.ne	0x46191fc <_ChromeMain+0x4613f60>
 46191f4: aa1503e0     	mov	x0, x21
 46191f8: 96e7ec41     	bl	0x142fc <_ChromeMain+0xf060>
 46191fc: f943e260     	ldr	x0, [x19, #0x7c0]
 4619200: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4619204: f9404749     	ldr	x9, [x26, #0x88]
 4619208: eb09011f     	cmp	x8, x9
 461920c: 54000041     	b.ne	0x4619214 <_ChromeMain+0x4613f78>
 4619210: 96e8260b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4619214: f903e275     	str	x21, [x19, #0x7c0]
 4619218: 39512688     	ldrb	w8, [x20, #0x449]
 461921c: 36004948     	tbz	w8, #0x0, 0x4619b44 <_ChromeMain+0x46148a8>
 4619220: aa1303e0     	mov	x0, x19
 4619224: 94000984     	bl	0x461b834 <_ChromeMain+0x4616598>
 4619228: f90013ff     	str	xzr, [sp, #0x20]
 461922c: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 4619230: f90023ff     	str	xzr, [sp, #0x40]
 4619234: 910083e2     	add	x2, sp, #0x20
 4619238: 9100c3e3     	add	x3, sp, #0x30
 461923c: aa1303e0     	mov	x0, x19
 4619240: 52800001     	mov	w1, #0x0                ; =0
 4619244: 52800004     	mov	w4, #0x0                ; =0
 4619248: 1400000f     	b	0x4619284 <_ChromeMain+0x4613fe8>
 461924c: aa1303e0     	mov	x0, x19
 4619250: 94000979     	bl	0x461b834 <_ChromeMain+0x4616598>
 4619254: aa1403e0     	mov	x0, x20
 4619258: aa1603e1     	mov	x1, x22
 461925c: 94000a24     	bl	0x461baec <_ChromeMain+0x4616850>
 4619260: f90013e0     	str	x0, [sp, #0x20]
 4619264: f9437e60     	ldr	x0, [x19, #0x6f8]
 4619268: 9100c3e8     	add	x8, sp, #0x30
 461926c: 94000acd     	bl	0x461bda0 <_ChromeMain+0x4616b04>
 4619270: 910083e2     	add	x2, sp, #0x20
 4619274: 9100c3e3     	add	x3, sp, #0x30
 4619278: aa1303e0     	mov	x0, x19
 461927c: 52800021     	mov	w1, #0x1                ; =1
 4619280: 52800024     	mov	w4, #0x1                ; =1
 4619284: 94000a62     	bl	0x461bc0c <_ChromeMain+0x4616970>
 4619288: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 461928c: 36ffdb28     	tbz	w8, #0x1f, 0x4618df0 <_ChromeMain+0x4613b54>
 4619290: f9401be0     	ldr	x0, [sp, #0x30]
 4619294: f94023e8     	ldr	x8, [sp, #0x40]
 4619298: d37ff901     	lsl	x1, x8, #1
 461929c: 96e7bf07     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46192a0: 17fffed4     	b	0x4618df0 <_ChromeMain+0x4613b54>
 46192a4: aa0803fa     	mov	x26, x8
 46192a8: 1400001e     	b	0x4619320 <_ChromeMain+0x4614084>
 46192ac: 91002318     	add	x24, x24, #0x8
 46192b0: eb19031f     	cmp	x24, x25
 46192b4: 54000c00     	b.eq	0x4619434 <_ChromeMain+0x4614198>
 46192b8: f9400316     	ldr	x22, [x24]
 46192bc: b4000156     	cbz	x22, 0x46192e4 <_ChromeMain+0x4614048>
 46192c0: f9438a68     	ldr	x8, [x19, #0x710]
 46192c4: d37df108     	lsl	x8, x8, #3
 46192c8: b40000e8     	cbz	x8, 0x46192e4 <_ChromeMain+0x4614048>
 46192cc: f9438669     	ldr	x9, [x19, #0x708]
 46192d0: f840852a     	ldr	x10, [x9], #0x8
 46192d4: eb16015f     	cmp	x10, x22
 46192d8: 54fffea0     	b.eq	0x46192ac <_ChromeMain+0x4614010>
 46192dc: f1002108     	subs	x8, x8, #0x8
 46192e0: 54ffff81     	b.ne	0x46192d0 <_ChromeMain+0x4614034>
 46192e4: f942ea68     	ldr	x8, [x19, #0x5d0]
 46192e8: f942ee69     	ldr	x9, [x19, #0x5d8]
 46192ec: d37ced2a     	lsl	x10, x9, #4
 46192f0: b4fffdaa     	cbz	x10, 0x46192a4 <_ChromeMain+0x4614008>
 46192f4: 9344fd4a     	asr	x10, x10, #4
 46192f8: aa0803fa     	mov	x26, x8
 46192fc: d341fd4b     	lsr	x11, x10, #1
 4619300: 8b0b134c     	add	x12, x26, x11, lsl #4
 4619304: f841058d     	ldr	x13, [x12], #0x10
 4619308: aa6a07ee     	mvn	x14, x10, lsr #1
 461930c: 8b0e014a     	add	x10, x10, x14
 4619310: eb1601bf     	cmp	x13, x22
 4619314: 9a8b314a     	csel	x10, x10, x11, lo
 4619318: 9a9a319a     	csel	x26, x12, x26, lo
 461931c: b5ffff0a     	cbnz	x10, 0x46192fc <_ChromeMain+0x4614060>
 4619320: 8b091108     	add	x8, x8, x9, lsl #4
 4619324: eb08035f     	cmp	x26, x8
 4619328: 54fffc20     	b.eq	0x46192ac <_ChromeMain+0x4614010>
 461932c: f9400348     	ldr	x8, [x26]
 4619330: eb0802df     	cmp	x22, x8
 4619334: 54fffbc3     	b.lo	0x46192ac <_ChromeMain+0x4614010>
 4619338: f9400740     	ldr	x0, [x26, #0x8]
 461933c: f9429e77     	ldr	x23, [x19, #0x538]
 4619340: 9738388d     	bl	0x1427574 <_ChromeMain+0x14222d8>
 4619344: aa0103f4     	mov	x20, x1
 4619348: f9001be0     	str	x0, [sp, #0x30]
 461934c: 9100c3e1     	add	x1, sp, #0x30
 4619350: aa1703e0     	mov	x0, x23
 4619354: 97435b63     	bl	0x16f00e0 <_ChromeMain+0x16eae44>
 4619358: f9401be8     	ldr	x8, [sp, #0x30]
 461935c: 6b0802bf     	cmp	w21, w8
 4619360: 54fffa6b     	b.lt	0x46192ac <_ChromeMain+0x4614010>
 4619364: 4e080d00     	dup.2d	v0, x8
 4619368: d360fe89     	lsr	x9, x20, #32
 461936c: 3dc003e1     	ldr	q1, [sp]
 4619370: 6ee14400     	ushl.2d	v0, v0, v1
 4619374: 0ea12801     	xtn.2s	v1, v0
 4619378: 4e181e80     	mov.d	v0[1], x20
 461937c: 0ea12800     	xtn.2s	v0, v0
 4619380: 1e270122     	fmov	s2, w9
 4619384: 4e0c1d02     	mov.s	v2[1], w8
 4619388: 0ea00c42     	sqadd.2s	v2, v2, v0
 461938c: 0ea12c41     	sqsub.2s	v1, v2, v1
 4619390: 6f00e402     	movi.2d	v2, #0000000000000000
 4619394: 0ea26421     	smax.2s	v1, v1, v2
 4619398: 4e0c1d00     	mov.s	v0[1], w8
 461939c: 0ea08420     	add.2s	v0, v1, v0
 46193a0: 3dc007e1     	ldr	q1, [sp, #0x10]
 46193a4: 0ea13400     	cmgt.2s	v0, v0, v1
 46193a8: 0e0c3c09     	mov.s	w9, v0[1]
 46193ac: 3607f809     	tbz	w9, #0x0, 0x46192ac <_ChromeMain+0x4614010>
 46193b0: d360fd08     	lsr	x8, x8, #32
 46193b4: 6b08039f     	cmp	w28, w8
 46193b8: 54fff7ab     	b.lt	0x46192ac <_ChromeMain+0x4614010>
 46193bc: 1e260008     	fmov	w8, s0
 46193c0: 3607f768     	tbz	w8, #0x0, 0x46192ac <_ChromeMain+0x4614010>
 46193c4: f940075a     	ldr	x26, [x26, #0x8]
 46193c8: b400039a     	cbz	x26, 0x4619438 <_ChromeMain+0x461419c>
 46193cc: b4ffd0fa     	cbz	x26, 0x4618de8 <_ChromeMain+0x4613b4c>
 46193d0: b4ffd0d6     	cbz	x22, 0x4618de8 <_ChromeMain+0x4613b4c>
 46193d4: f942f668     	ldr	x8, [x19, #0x5e8]
 46193d8: f942fa69     	ldr	x9, [x19, #0x5f0]
 46193dc: d37ced2a     	lsl	x10, x9, #4
 46193e0: b400026a     	cbz	x10, 0x461942c <_ChromeMain+0x4614190>
 46193e4: 9344fd4a     	asr	x10, x10, #4
 46193e8: aa0803f4     	mov	x20, x8
 46193ec: d341fd4b     	lsr	x11, x10, #1
 46193f0: 8b0b128c     	add	x12, x20, x11, lsl #4
 46193f4: f841058d     	ldr	x13, [x12], #0x10
 46193f8: aa6a07ee     	mvn	x14, x10, lsr #1
 46193fc: 8b0e014a     	add	x10, x10, x14
 4619400: eb1601bf     	cmp	x13, x22
 4619404: 9a8b314a     	csel	x10, x10, x11, lo
 4619408: 9a943194     	csel	x20, x12, x20, lo
 461940c: b5ffff0a     	cbnz	x10, 0x46193ec <_ChromeMain+0x4614150>
 4619410: 8b091108     	add	x8, x8, x9, lsl #4
 4619414: eb08029f     	cmp	x20, x8
 4619418: 54ffce80     	b.eq	0x4618de8 <_ChromeMain+0x4613b4c>
 461941c: f9400288     	ldr	x8, [x20]
 4619420: eb0802df     	cmp	x22, x8
 4619424: 54001442     	b.hs	0x46196ac <_ChromeMain+0x4614410>
 4619428: 17fffe70     	b	0x4618de8 <_ChromeMain+0x4613b4c>
 461942c: aa0803f4     	mov	x20, x8
 4619430: 17fffff8     	b	0x4619410 <_ChromeMain+0x4614174>
 4619434: d2800016     	mov	x22, #0x0               ; =0
 4619438: f9430668     	ldr	x8, [x19, #0x608]
 461943c: d37df109     	lsl	x9, x8, #3
 4619440: b4ffcd49     	cbz	x9, 0x4618de8 <_ChromeMain+0x4613b4c>
 4619444: d280001a     	mov	x26, #0x0               ; =0
 4619448: f9430278     	ldr	x24, [x19, #0x600]
 461944c: 8b080f19     	add	x25, x24, x8, lsl #3
 4619450: 1400001c     	b	0x46194c0 <_ChromeMain+0x4614224>
 4619454: f9429e7a     	ldr	x26, [x19, #0x538]
 4619458: aa1703e0     	mov	x0, x23
 461945c: 97383846     	bl	0x1427574 <_ChromeMain+0x14222d8>
 4619460: aa0103f6     	mov	x22, x1
 4619464: f9001be0     	str	x0, [sp, #0x30]
 4619468: 9100c3e1     	add	x1, sp, #0x30
 461946c: aa1a03e0     	mov	x0, x26
 4619470: 97435b1c     	bl	0x16f00e0 <_ChromeMain+0x16eae44>
 4619474: b94037e8     	ldr	w8, [sp, #0x34]
 4619478: d360fec9     	lsr	x9, x22, #32
 461947c: 2b090109     	adds	w9, w8, w9
 4619480: 131f7d2a     	asr	w10, w9, #31
 4619484: 5201014a     	eor	w10, w10, #0x80000000
 4619488: 1a896149     	csel	w9, w10, w9, vs
 461948c: 6b080129     	subs	w9, w9, w8
 4619490: 131f7d2a     	asr	w10, w9, #31
 4619494: 5201014a     	eor	w10, w10, #0x80000000
 4619498: 1a896149     	csel	w9, w10, w9, vs
 461949c: 0aa97d29     	bic	w9, w9, w9, asr #31
 46194a0: 0b490508     	add	w8, w8, w9, lsr #1
 46194a4: aa1403f6     	mov	x22, x20
 46194a8: aa1703fa     	mov	x26, x23
 46194ac: 6b1c011f     	cmp	w8, w28
 46194b0: 54fff8ec     	b.gt	0x46193cc <_ChromeMain+0x4614130>
 46194b4: 91002318     	add	x24, x24, #0x8
 46194b8: eb19031f     	cmp	x24, x25
 46194bc: 54fff880     	b.eq	0x46193cc <_ChromeMain+0x4614130>
 46194c0: f9400314     	ldr	x20, [x24]
 46194c4: b4000154     	cbz	x20, 0x46194ec <_ChromeMain+0x4614250>
 46194c8: f9438a68     	ldr	x8, [x19, #0x710]
 46194cc: d37df108     	lsl	x8, x8, #3
 46194d0: b40000e8     	cbz	x8, 0x46194ec <_ChromeMain+0x4614250>
 46194d4: f9438669     	ldr	x9, [x19, #0x708]
 46194d8: f840852a     	ldr	x10, [x9], #0x8
 46194dc: eb14015f     	cmp	x10, x20
 46194e0: 54fffea0     	b.eq	0x46194b4 <_ChromeMain+0x4614218>
 46194e4: f1002108     	subs	x8, x8, #0x8
 46194e8: 54ffff81     	b.ne	0x46194d8 <_ChromeMain+0x461423c>
 46194ec: f942ea68     	ldr	x8, [x19, #0x5d0]
 46194f0: f942ee6a     	ldr	x10, [x19, #0x5d8]
 46194f4: d37ced49     	lsl	x9, x10, #4
 46194f8: b40002a9     	cbz	x9, 0x461954c <_ChromeMain+0x46142b0>
 46194fc: 9344fd2b     	asr	x11, x9, #4
 4619500: aa0803e9     	mov	x9, x8
 4619504: d341fd6c     	lsr	x12, x11, #1
 4619508: 8b0c112d     	add	x13, x9, x12, lsl #4
 461950c: f84105ae     	ldr	x14, [x13], #0x10
 4619510: aa6b07ef     	mvn	x15, x11, lsr #1
 4619514: 8b0f016b     	add	x11, x11, x15
 4619518: eb1401df     	cmp	x14, x20
 461951c: 9a8c316b     	csel	x11, x11, x12, lo
 4619520: 9a8931a9     	csel	x9, x13, x9, lo
 4619524: b5ffff0b     	cbnz	x11, 0x4619504 <_ChromeMain+0x4614268>
 4619528: 8b0a1108     	add	x8, x8, x10, lsl #4
 461952c: eb08013f     	cmp	x9, x8
 4619530: 54fffc20     	b.eq	0x46194b4 <_ChromeMain+0x4614218>
 4619534: f9400128     	ldr	x8, [x9]
 4619538: eb08029f     	cmp	x20, x8
 461953c: 54fffbc3     	b.lo	0x46194b4 <_ChromeMain+0x4614218>
 4619540: f9400537     	ldr	x23, [x9, #0x8]
 4619544: b4fffb97     	cbz	x23, 0x46194b4 <_ChromeMain+0x4614218>
 4619548: 17ffffc3     	b	0x4619454 <_ChromeMain+0x46141b8>
 461954c: aa0803e9     	mov	x9, x8
 4619550: 17fffff6     	b	0x4619528 <_ChromeMain+0x461428c>
 4619554: aa0a03e9     	mov	x9, x10
 4619558: 14000016     	b	0x46195b0 <_ChromeMain+0x4614314>
 461955c: f940cc02     	ldr	x2, [x0, #0x198]
 4619560: 97c0d806     	bl	0x364f578 <_ChromeMain+0x364a2dc>
 4619564: 910022f7     	add	x23, x23, #0x8
 4619568: eb1802ff     	cmp	x23, x24
 461956c: 54ffc960     	b.eq	0x4618e98 <_ChromeMain+0x4613bfc>
 4619570: f94002e8     	ldr	x8, [x23]
 4619574: f942ea6a     	ldr	x10, [x19, #0x5d0]
 4619578: f942ee6b     	ldr	x11, [x19, #0x5d8]
 461957c: d37ced69     	lsl	x9, x11, #4
 4619580: b4fffea9     	cbz	x9, 0x4619554 <_ChromeMain+0x46142b8>
 4619584: 9344fd2c     	asr	x12, x9, #4
 4619588: aa0a03e9     	mov	x9, x10
 461958c: d341fd8d     	lsr	x13, x12, #1
 4619590: 8b0d112e     	add	x14, x9, x13, lsl #4
 4619594: f84105cf     	ldr	x15, [x14], #0x10
 4619598: aa6c07f0     	mvn	x16, x12, lsr #1
 461959c: 8b10018c     	add	x12, x12, x16
 46195a0: eb0801ff     	cmp	x15, x8
 46195a4: 9a8d318c     	csel	x12, x12, x13, lo
 46195a8: 9a8931c9     	csel	x9, x14, x9, lo
 46195ac: b5ffff0c     	cbnz	x12, 0x461958c <_ChromeMain+0x46142f0>
 46195b0: 8b0b114a     	add	x10, x10, x11, lsl #4
 46195b4: eb0a013f     	cmp	x9, x10
 46195b8: 54fffd60     	b.eq	0x4619564 <_ChromeMain+0x46142c8>
 46195bc: f940012a     	ldr	x10, [x9]
 46195c0: eb0a011f     	cmp	x8, x10
 46195c4: 54fffd03     	b.lo	0x4619564 <_ChromeMain+0x46142c8>
 46195c8: f9400521     	ldr	x1, [x9, #0x8]
 46195cc: b4fffcc1     	cbz	x1, 0x4619564 <_ChromeMain+0x46142c8>
 46195d0: f940c428     	ldr	x8, [x1, #0x188]
 46195d4: f9429e60     	ldr	x0, [x19, #0x538]
 46195d8: eb08001f     	cmp	x0, x8
 46195dc: 54fffc41     	b.ne	0x4619564 <_ChromeMain+0x46142c8>
 46195e0: 17ffffdf     	b	0x461955c <_ChromeMain+0x46142c0>
 46195e4: 8b0a0d0a     	add	x10, x8, x10, lsl #3
 46195e8: eb0a013f     	cmp	x9, x10
 46195ec: 54ffbfe0     	b.eq	0x4618de8 <_ChromeMain+0x4613b4c>
 46195f0: f943026a     	ldr	x10, [x19, #0x600]
 46195f4: aa0a03eb     	mov	x11, x10
 46195f8: d37df2ac     	lsl	x12, x21, #3
 46195fc: b4002fac     	cbz	x12, 0x4619bf0 <_ChromeMain+0x4614954>
 4619600: f940016d     	ldr	x13, [x11]
 4619604: eb1601bf     	cmp	x13, x22
 4619608: 54002f40     	b.eq	0x4619bf0 <_ChromeMain+0x4614954>
 461960c: 9100216b     	add	x11, x11, #0x8
 4619610: f100218c     	subs	x12, x12, #0x8
 4619614: 54ffff61     	b.ne	0x4619600 <_ChromeMain+0x4614364>
 4619618: 17fffdf4     	b	0x4618de8 <_ChromeMain+0x4613b4c>
 461961c: f9401ed6     	ldr	x22, [x22, #0x38]
 4619620: b4ffbe56     	cbz	x22, 0x4618de8 <_ChromeMain+0x4613b4c>
 4619624: aa0803ed     	mov	x13, x8
 4619628: b4000189     	cbz	x9, 0x4619658 <_ChromeMain+0x46143bc>
 461962c: aa0803ed     	mov	x13, x8
 4619630: aa0c03ee     	mov	x14, x12
 4619634: d341fdcf     	lsr	x15, x14, #1
 4619638: 8b0f11b0     	add	x16, x13, x15, lsl #4
 461963c: f8410611     	ldr	x17, [x16], #0x10
 4619640: aa6e07e0     	mvn	x0, x14, lsr #1
 4619644: 8b0001ce     	add	x14, x14, x0
 4619648: eb16023f     	cmp	x17, x22
 461964c: 9a8f31ce     	csel	x14, x14, x15, lo
 4619650: 9a8d320d     	csel	x13, x16, x13, lo
 4619654: b5ffff0e     	cbnz	x14, 0x4619634 <_ChromeMain+0x4614398>
 4619658: eb0a01bf     	cmp	x13, x10
 461965c: 54fffe00     	b.eq	0x461961c <_ChromeMain+0x4614380>
 4619660: f94001ae     	ldr	x14, [x13]
 4619664: eb0e02df     	cmp	x22, x14
 4619668: 54fffda3     	b.lo	0x461961c <_ChromeMain+0x4614380>
 461966c: b94009ad     	ldr	w13, [x13, #0x8]
 4619670: 6b0b01bf     	cmp	w13, w11
 4619674: 54fffd41     	b.ne	0x461961c <_ChromeMain+0x4614380>
 4619678: f9401ed4     	ldr	x20, [x22, #0x38]
 461967c: b4ffbb74     	cbz	x20, 0x4618de8 <_ChromeMain+0x4613b4c>
 4619680: a9442a88     	ldp	x8, x10, [x20, #0x40]
 4619684: aa0803e9     	mov	x9, x8
 4619688: d37df14b     	lsl	x11, x10, #3
 461968c: b4fffacb     	cbz	x11, 0x46195e4 <_ChromeMain+0x4614348>
 4619690: f940012c     	ldr	x12, [x9]
 4619694: eb16019f     	cmp	x12, x22
 4619698: 54fffa60     	b.eq	0x46195e4 <_ChromeMain+0x4614348>
 461969c: 91002129     	add	x9, x9, #0x8
 46196a0: f100216b     	subs	x11, x11, #0x8
 46196a4: 54ffff61     	b.ne	0x4619690 <_ChromeMain+0x46143f4>
 46196a8: 17fffdd0     	b	0x4618de8 <_ChromeMain+0x4613b4c>
 46196ac: 510042a8     	sub	w8, w21, #0x10
 46196b0: 52849269     	mov	w9, #0x2493             ; =9363
 46196b4: 72b24929     	movk	w9, #0x9249, lsl #16
 46196b8: 9b297d09     	smull	x9, w8, w9
 46196bc: 8b498108     	add	x8, x8, x9, lsr #32
 46196c0: 13037d09     	asr	w9, w8, #3
 46196c4: 0b487d39     	add	w25, w9, w8, lsr #31
 46196c8: 0ab97f38     	bic	w24, w25, w25, asr #31
 46196cc: f9429e75     	ldr	x21, [x19, #0x538]
 46196d0: aa1a03e0     	mov	x0, x26
 46196d4: 973837a8     	bl	0x1427574 <_ChromeMain+0x14222d8>
 46196d8: aa0103f7     	mov	x23, x1
 46196dc: f9001be0     	str	x0, [sp, #0x30]
 46196e0: 9100c3e1     	add	x1, sp, #0x30
 46196e4: aa1503e0     	mov	x0, x21
 46196e8: 97435a7e     	bl	0x16f00e0 <_ChromeMain+0x16eae44>
 46196ec: b94037e8     	ldr	w8, [sp, #0x34]
 46196f0: d360fee9     	lsr	x9, x23, #32
 46196f4: 2b090109     	adds	w9, w8, w9
 46196f8: 131f7d2a     	asr	w10, w9, #31
 46196fc: 5201014a     	eor	w10, w10, #0x80000000
 4619700: 1a896149     	csel	w9, w10, w9, vs
 4619704: 6b080129     	subs	w9, w9, w8
 4619708: 131f7d2a     	asr	w10, w9, #31
 461970c: 5201014a     	eor	w10, w10, #0x80000000
 4619710: 1a896149     	csel	w9, w10, w9, vs
 4619714: 0aa97d29     	bic	w9, w9, w9, asr #31
 4619718: 0b49050c     	add	w12, w8, w9, lsr #1
 461971c: b940faca     	ldr	w10, [x22, #0xf8]
 4619720: 340000ca     	cbz	w10, 0x4619738 <_ChromeMain+0x461449c>
 4619724: 6b1c019f     	cmp	w12, w28
 4619728: 5400008c     	b.gt	0x4619738 <_ChromeMain+0x461449c>
 461972c: b9400a88     	ldr	w8, [x20, #0x8]
 4619730: 6b08031f     	cmp	w24, w8
 4619734: 54000ccc     	b.gt	0x46198cc <_ChromeMain+0x4614630>
 4619738: f9430675     	ldr	x21, [x19, #0x608]
 461973c: f942f668     	ldr	x8, [x19, #0x5e8]
 4619740: f942fa6b     	ldr	x11, [x19, #0x5f0]
 4619744: d37ced69     	lsl	x9, x11, #4
 4619748: 6b1c019f     	cmp	w12, w28
 461974c: 5400036d     	b.le	0x46197b8 <_ChromeMain+0x461451c>
 4619750: aa0803ec     	mov	x12, x8
 4619754: b4000189     	cbz	x9, 0x4619784 <_ChromeMain+0x46144e8>
 4619758: 9344fd2a     	asr	x10, x9, #4
 461975c: aa0803ec     	mov	x12, x8
 4619760: d341fd4d     	lsr	x13, x10, #1
 4619764: 8b0d118e     	add	x14, x12, x13, lsl #4
 4619768: f84105cf     	ldr	x15, [x14], #0x10
 461976c: aa6a07f0     	mvn	x16, x10, lsr #1
 4619770: 8b10014a     	add	x10, x10, x16
 4619774: eb1601ff     	cmp	x15, x22
 4619778: 9a8d314a     	csel	x10, x10, x13, lo
 461977c: 9a8c31cc     	csel	x12, x14, x12, lo
 4619780: b5ffff0a     	cbnz	x10, 0x4619760 <_ChromeMain+0x46144c4>
 4619784: 8b0b110a     	add	x10, x8, x11, lsl #4
 4619788: eb0a019f     	cmp	x12, x10
 461978c: 54ffb2e0     	b.eq	0x4618de8 <_ChromeMain+0x4613b4c>
 4619790: f940018b     	ldr	x11, [x12]
 4619794: eb0b02df     	cmp	x22, x11
 4619798: 54ffb283     	b.lo	0x4618de8 <_ChromeMain+0x4613b4c>
 461979c: b940098b     	ldr	w11, [x12, #0x8]
 46197a0: 37f825cb     	tbnz	w11, #0x1f, 0x4619c58 <_ChromeMain+0x46149bc>
 46197a4: 6b18017f     	cmp	w11, w24
 46197a8: 1a98316b     	csel	w11, w11, w24, lo
 46197ac: 54fff669     	b.ls	0x4619678 <_ChromeMain+0x46143dc>
 46197b0: 9344fd2c     	asr	x12, x9, #4
 46197b4: 17ffff9c     	b	0x4619624 <_ChromeMain+0x4614388>
 46197b8: aa0803ec     	mov	x12, x8
 46197bc: b0052cda     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46197c0: b4000189     	cbz	x9, 0x46197f0 <_ChromeMain+0x4614554>
 46197c4: 9344fd2d     	asr	x13, x9, #4
 46197c8: aa0803ec     	mov	x12, x8
 46197cc: d341fdae     	lsr	x14, x13, #1
 46197d0: 8b0e118f     	add	x15, x12, x14, lsl #4
 46197d4: f84105f0     	ldr	x16, [x15], #0x10
 46197d8: aa6d07f1     	mvn	x17, x13, lsr #1
 46197dc: 8b1101ad     	add	x13, x13, x17
 46197e0: eb16021f     	cmp	x16, x22
 46197e4: 9a8e31ad     	csel	x13, x13, x14, lo
 46197e8: 9a8c31ec     	csel	x12, x15, x12, lo
 46197ec: b5ffff0d     	cbnz	x13, 0x46197cc <_ChromeMain+0x4614530>
 46197f0: 8b0b110b     	add	x11, x8, x11, lsl #4
 46197f4: eb0b019f     	cmp	x12, x11
 46197f8: 54ffaf80     	b.eq	0x4618de8 <_ChromeMain+0x4613b4c>
 46197fc: f940018d     	ldr	x13, [x12]
 4619800: eb0d02df     	cmp	x22, x13
 4619804: 54ffaf23     	b.lo	0x4618de8 <_ChromeMain+0x4613b4c>
 4619808: b940098c     	ldr	w12, [x12, #0x8]
 461980c: 3400116a     	cbz	w10, 0x4619a38 <_ChromeMain+0x461479c>
 4619810: 6b0c031f     	cmp	w24, w12
 4619814: 5400112d     	b.le	0x4619a38 <_ChromeMain+0x461479c>
 4619818: f94026d7     	ldr	x23, [x22, #0x48]
 461981c: d37df2a9     	lsl	x9, x21, #3
 4619820: b4000129     	cbz	x9, 0x4619844 <_ChromeMain+0x46145a8>
 4619824: d280000a     	mov	x10, #0x0               ; =0
 4619828: f9430268     	ldr	x8, [x19, #0x600]
 461982c: f86a690b     	ldr	x11, [x8, x10]
 4619830: eb16017f     	cmp	x11, x22
 4619834: 54000e00     	b.eq	0x46199f4 <_ChromeMain+0x4614758>
 4619838: 9100214a     	add	x10, x10, #0x8
 461983c: eb0a013f     	cmp	x9, x10
 4619840: 54ffff61     	b.ne	0x461982c <_ChromeMain+0x4614590>
 4619844: aa1603f4     	mov	x20, x22
 4619848: f9437e68     	ldr	x8, [x19, #0x6f8]
 461984c: eb14011f     	cmp	x8, x20
 4619850: 54ffacc0     	b.eq	0x4618de8 <_ChromeMain+0x4613b4c>
 4619854: aa1403e9     	mov	x9, x20
 4619858: b4002308     	cbz	x8, 0x4619cb8 <_ChromeMain+0x4614a1c>
 461985c: eb09011f     	cmp	x8, x9
 4619860: 540022c0     	b.eq	0x4619cb8 <_ChromeMain+0x4614a1c>
 4619864: f9401d29     	ldr	x9, [x9, #0x38]
 4619868: b5ffff89     	cbnz	x9, 0x4619858 <_ChromeMain+0x46145bc>
 461986c: 52800028     	mov	w8, #0x1                ; =1
 4619870: 391ee268     	strb	w8, [x19, #0x7b8]
 4619874: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4619878: f9404749     	ldr	x9, [x26, #0x88]
 461987c: eb09011f     	cmp	x8, x9
 4619880: 54000061     	b.ne	0x461988c <_ChromeMain+0x46145f0>
 4619884: aa1403e0     	mov	x0, x20
 4619888: 96e7ea9d     	bl	0x142fc <_ChromeMain+0xf060>
 461988c: f9400360     	ldr	x0, [x27]
 4619890: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4619894: f9404749     	ldr	x9, [x26, #0x88]
 4619898: eb09011f     	cmp	x8, x9
 461989c: 54000041     	b.ne	0x46198a4 <_ChromeMain+0x4614608>
 46198a0: 96e82467     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46198a4: f903d674     	str	x20, [x19, #0x7a8]
 46198a8: f903da77     	str	x23, [x19, #0x7b0]
 46198ac: aa1303e0     	mov	x0, x19
 46198b0: aa1403e1     	mov	x1, x20
 46198b4: aa1703e2     	mov	x2, x23
 46198b8: 9400078f     	bl	0x461b6f4 <_ChromeMain+0x4616458>
 46198bc: aa1303e0     	mov	x0, x19
 46198c0: aa1503e1     	mov	x1, x21
 46198c4: 97ffee67     	bl	0x4615260 <_ChromeMain+0x460ffc4>
 46198c8: 17fffd4a     	b	0x4618df0 <_ChromeMain+0x4613b54>
 46198cc: f9437e68     	ldr	x8, [x19, #0x6f8]
 46198d0: eb16011f     	cmp	x8, x22
 46198d4: 54fff320     	b.eq	0x4619738 <_ChromeMain+0x461449c>
 46198d8: aa1603e9     	mov	x9, x22
 46198dc: b4001d88     	cbz	x8, 0x4619c8c <_ChromeMain+0x46149f0>
 46198e0: eb09011f     	cmp	x8, x9
 46198e4: 54001d40     	b.eq	0x4619c8c <_ChromeMain+0x46149f0>
 46198e8: f9401d29     	ldr	x9, [x9, #0x38]
 46198ec: b5ffff89     	cbnz	x9, 0x46198dc <_ChromeMain+0x4614640>
 46198f0: f94026d5     	ldr	x21, [x22, #0x48]
 46198f4: aa1603e9     	mov	x9, x22
 46198f8: b4001d08     	cbz	x8, 0x4619c98 <_ChromeMain+0x46149fc>
 46198fc: eb09011f     	cmp	x8, x9
 4619900: 54001cc0     	b.eq	0x4619c98 <_ChromeMain+0x46149fc>
 4619904: f9401d29     	ldr	x9, [x9, #0x38]
 4619908: b5ffff89     	cbnz	x9, 0x46198f8 <_ChromeMain+0x461465c>
 461990c: 52800028     	mov	w8, #0x1                ; =1
 4619910: 391ee268     	strb	w8, [x19, #0x7b8]
 4619914: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4619918: b0052cc9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461991c: f9404529     	ldr	x9, [x9, #0x88]
 4619920: eb09011f     	cmp	x8, x9
 4619924: 54000061     	b.ne	0x4619930 <_ChromeMain+0x4614694>
 4619928: aa1603e0     	mov	x0, x22
 461992c: 96e7ea74     	bl	0x142fc <_ChromeMain+0xf060>
 4619930: f9400360     	ldr	x0, [x27]
 4619934: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4619938: b0052cc9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461993c: f9404529     	ldr	x9, [x9, #0x88]
 4619940: eb09011f     	cmp	x8, x9
 4619944: 54000041     	b.ne	0x461994c <_ChromeMain+0x46146b0>
 4619948: 96e8243d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461994c: f903d676     	str	x22, [x19, #0x7a8]
 4619950: f903da75     	str	x21, [x19, #0x7b0]
 4619954: aa1303e0     	mov	x0, x19
 4619958: aa1603e1     	mov	x1, x22
 461995c: aa1503e2     	mov	x2, x21
 4619960: 94000765     	bl	0x461b6f4 <_ChromeMain+0x4616458>
 4619964: f9430661     	ldr	x1, [x19, #0x608]
 4619968: d37df029     	lsl	x9, x1, #3
 461996c: b4000129     	cbz	x9, 0x4619990 <_ChromeMain+0x46146f4>
 4619970: d280000a     	mov	x10, #0x0               ; =0
 4619974: f9430268     	ldr	x8, [x19, #0x600]
 4619978: f86a690b     	ldr	x11, [x8, x10]
 461997c: eb16017f     	cmp	x11, x22
 4619980: 540001c0     	b.eq	0x46199b8 <_ChromeMain+0x461471c>
 4619984: 9100214a     	add	x10, x10, #0x8
 4619988: eb0a013f     	cmp	x9, x10
 461998c: 54ffff61     	b.ne	0x4619978 <_ChromeMain+0x46146dc>
 4619990: aa1303e0     	mov	x0, x19
 4619994: 97ffee33     	bl	0x4615260 <_ChromeMain+0x460ffc4>
 4619998: b9445748     	ldr	w8, [x26, #0x454]
 461999c: 52800033     	mov	w19, #0x1               ; =1
 46199a0: 7100051f     	cmp	w8, #0x1
 46199a4: 54ffa0e0     	b.eq	0x4618dc0 <_ChromeMain+0x4613b24>
 46199a8: b9045753     	str	w19, [x26, #0x454]
 46199ac: aa1a03e0     	mov	x0, x26
 46199b0: 96fe1df3     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46199b4: 17fffd03     	b	0x4618dc0 <_ChromeMain+0x4613b24>
 46199b8: 9343fd4a     	asr	x10, x10, #3
 46199bc: 91000549     	add	x9, x10, #0x1
 46199c0: eb09003f     	cmp	x1, x9
 46199c4: 9a8a842a     	csinc	x10, x1, x10, hi
 46199c8: eb01013f     	cmp	x9, x1
 46199cc: 54000063     	b.lo	0x46199d8 <_ChromeMain+0x461473c>
 46199d0: aa0a03e1     	mov	x1, x10
 46199d4: 17ffffef     	b	0x4619990 <_ChromeMain+0x46146f4>
 46199d8: f869790b     	ldr	x11, [x8, x9, lsl #3]
 46199dc: eb0b02df     	cmp	x22, x11
 46199e0: 54001720     	b.eq	0x4619cc4 <_ChromeMain+0x4614a28>
 46199e4: f9401d6b     	ldr	x11, [x11, #0x38]
 46199e8: b5ffffab     	cbnz	x11, 0x46199dc <_ChromeMain+0x4614740>
 46199ec: aa0903e1     	mov	x1, x9
 46199f0: 17ffffe8     	b	0x4619990 <_ChromeMain+0x46146f4>
 46199f4: 9343fd4a     	asr	x10, x10, #3
 46199f8: 91000549     	add	x9, x10, #0x1
 46199fc: eb0902bf     	cmp	x21, x9
 4619a00: 9a8a86aa     	csinc	x10, x21, x10, hi
 4619a04: eb15013f     	cmp	x9, x21
 4619a08: 54000102     	b.hs	0x4619a28 <_ChromeMain+0x461478c>
 4619a0c: f869790b     	ldr	x11, [x8, x9, lsl #3]
 4619a10: eb0b02df     	cmp	x22, x11
 4619a14: 54001600     	b.eq	0x4619cd4 <_ChromeMain+0x4614a38>
 4619a18: f9401d6b     	ldr	x11, [x11, #0x38]
 4619a1c: b5ffffab     	cbnz	x11, 0x4619a10 <_ChromeMain+0x4614774>
 4619a20: aa0903f5     	mov	x21, x9
 4619a24: 14000002     	b	0x4619a2c <_ChromeMain+0x4614790>
 4619a28: aa0a03f5     	mov	x21, x10
 4619a2c: aa1603f4     	mov	x20, x22
 4619a30: b0052cda     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4619a34: 17ffff85     	b	0x4619848 <_ChromeMain+0x46145ac>
 4619a38: 37f8110c     	tbnz	w12, #0x1f, 0x4619c58 <_ChromeMain+0x46149bc>
 4619a3c: 6b0c033f     	cmp	w25, w12
 4619a40: 7a4cd304     	ccmp	w24, w12, #0x4, le
 4619a44: 54000340     	b.eq	0x4619aac <_ChromeMain+0x4614810>
 4619a48: 9344fd2a     	asr	x10, x9, #4
 4619a4c: 14000003     	b	0x4619a58 <_ChromeMain+0x46147bc>
 4619a50: f9401ed6     	ldr	x22, [x22, #0x38]
 4619a54: b4ff9cb6     	cbz	x22, 0x4618de8 <_ChromeMain+0x4613b4c>
 4619a58: aa0803ec     	mov	x12, x8
 4619a5c: b4000189     	cbz	x9, 0x4619a8c <_ChromeMain+0x46147f0>
 4619a60: aa0803ec     	mov	x12, x8
 4619a64: aa0a03ed     	mov	x13, x10
 4619a68: d341fdae     	lsr	x14, x13, #1
 4619a6c: 8b0e118f     	add	x15, x12, x14, lsl #4
 4619a70: f84105f0     	ldr	x16, [x15], #0x10
 4619a74: aa6d07f1     	mvn	x17, x13, lsr #1
 4619a78: 8b1101ad     	add	x13, x13, x17
 4619a7c: eb16021f     	cmp	x16, x22
 4619a80: 9a8e31ad     	csel	x13, x13, x14, lo
 4619a84: 9a8c31ec     	csel	x12, x15, x12, lo
 4619a88: b5ffff0d     	cbnz	x13, 0x4619a68 <_ChromeMain+0x46147cc>
 4619a8c: eb0b019f     	cmp	x12, x11
 4619a90: 54fffe00     	b.eq	0x4619a50 <_ChromeMain+0x46147b4>
 4619a94: f940018d     	ldr	x13, [x12]
 4619a98: eb0d02df     	cmp	x22, x13
 4619a9c: 54fffda3     	b.lo	0x4619a50 <_ChromeMain+0x46147b4>
 4619aa0: b940098c     	ldr	w12, [x12, #0x8]
 4619aa4: 6b18019f     	cmp	w12, w24
 4619aa8: 54fffd41     	b.ne	0x4619a50 <_ChromeMain+0x46147b4>
 4619aac: f9401ed4     	ldr	x20, [x22, #0x38]
 4619ab0: b4ff99d4     	cbz	x20, 0x4618de8 <_ChromeMain+0x4613b4c>
 4619ab4: a9442688     	ldp	x8, x9, [x20, #0x40]
 4619ab8: aa0803ea     	mov	x10, x8
 4619abc: d37df12b     	lsl	x11, x9, #3
 4619ac0: b400010b     	cbz	x11, 0x4619ae0 <_ChromeMain+0x4614844>
 4619ac4: f940014c     	ldr	x12, [x10]
 4619ac8: eb16019f     	cmp	x12, x22
 4619acc: 540000a0     	b.eq	0x4619ae0 <_ChromeMain+0x4614844>
 4619ad0: 9100214a     	add	x10, x10, #0x8
 4619ad4: f100216b     	subs	x11, x11, #0x8
 4619ad8: 54ff9880     	b.eq	0x4618de8 <_ChromeMain+0x4613b4c>
 4619adc: 17fffffa     	b	0x4619ac4 <_ChromeMain+0x4614828>
 4619ae0: 8b090d09     	add	x9, x8, x9, lsl #3
 4619ae4: eb09015f     	cmp	x10, x9
 4619ae8: 54ff9800     	b.eq	0x4618de8 <_ChromeMain+0x4613b4c>
 4619aec: cb080148     	sub	x8, x10, x8
 4619af0: 9343fd08     	asr	x8, x8, #3
 4619af4: 91000517     	add	x23, x8, #0x1
 4619af8: d37df2a9     	lsl	x9, x21, #3
 4619afc: b4fff9a9     	cbz	x9, 0x4619a30 <_ChromeMain+0x4614794>
 4619b00: d280000a     	mov	x10, #0x0               ; =0
 4619b04: f9430268     	ldr	x8, [x19, #0x600]
 4619b08: f86a690b     	ldr	x11, [x8, x10]
 4619b0c: eb16017f     	cmp	x11, x22
 4619b10: 54000820     	b.eq	0x4619c14 <_ChromeMain+0x4614978>
 4619b14: 9100214a     	add	x10, x10, #0x8
 4619b18: eb0a013f     	cmp	x9, x10
 4619b1c: 54ffff61     	b.ne	0x4619b08 <_ChromeMain+0x461486c>
 4619b20: 17ffffc4     	b	0x4619a30 <_ChromeMain+0x4614794>
 4619b24: f9001bff     	str	xzr, [sp, #0x30]
 4619b28: 2f06e400     	movi	d0, #0xffff000000000000
 4619b2c: fd001fe0     	str	d0, [sp, #0x38]
 4619b30: 52800028     	mov	w8, #0x1                ; =1
 4619b34: 390103e8     	strb	w8, [sp, #0x40]
 4619b38: f90027ff     	str	xzr, [sp, #0x48]
 4619b3c: 390143ff     	strb	wzr, [sp, #0x50]
 4619b40: 17fffd89     	b	0x4619164 <_ChromeMain+0x4613ec8>
 4619b44: 52800028     	mov	w8, #0x1                ; =1
 4619b48: 39112688     	strb	w8, [x20, #0x449]
 4619b4c: f9401294     	ldr	x20, [x20, #0x20]
 4619b50: b4ffb694     	cbz	x20, 0x4619220 <_ChromeMain+0x4613f84>
 4619b54: f940b280     	ldr	x0, [x20, #0x160]
 4619b58: b4000080     	cbz	x0, 0x4619b68 <_ChromeMain+0x46148cc>
 4619b5c: 6f00e400     	movi.2d	v0, #0000000000000000
 4619b60: 97536bf6     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 4619b64: 17fffdaf     	b	0x4619220 <_ChromeMain+0x4613f84>
 4619b68: 52802400     	mov	w0, #0x120              ; =288
 4619b6c: 96e7d5ff     	bl	0xf368 <_ChromeMain+0xa0cc>
 4619b70: aa0003f5     	mov	x21, x0
 4619b74: d2800001     	mov	x1, #0x0                ; =0
 4619b78: 972981d8     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 4619b7c: b40000a0     	cbz	x0, 0x4619b90 <_ChromeMain+0x46148f4>
 4619b80: b9400aa8     	ldr	w8, [x21, #0x8]
 4619b84: 31000508     	adds	w8, w8, #0x1
 4619b88: b9000aa8     	str	w8, [x21, #0x8]
 4619b8c: 54000ac2     	b.hs	0x4619ce4 <_ChromeMain+0x4614a48>
 4619b90: aa1403e0     	mov	x0, x20
 4619b94: aa1503e1     	mov	x1, x21
 4619b98: 97318999     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 4619b9c: f940b280     	ldr	x0, [x20, #0x160]
 4619ba0: 17ffffef     	b	0x4619b5c <_ChromeMain+0x46148c0>
 4619ba4: 52802400     	mov	w0, #0x120              ; =288
 4619ba8: 96e7d5f0     	bl	0xf368 <_ChromeMain+0xa0cc>
 4619bac: aa0003f9     	mov	x25, x0
 4619bb0: d2800001     	mov	x1, #0x0                ; =0
 4619bb4: 972981c9     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 4619bb8: b40000a0     	cbz	x0, 0x4619bcc <_ChromeMain+0x4614930>
 4619bbc: b9400b28     	ldr	w8, [x25, #0x8]
 4619bc0: 31000508     	adds	w8, w8, #0x1
 4619bc4: b9000b28     	str	w8, [x25, #0x8]
 4619bc8: 54000722     	b.hs	0x4619cac <_ChromeMain+0x4614a10>
 4619bcc: aa1803e0     	mov	x0, x24
 4619bd0: aa1903e1     	mov	x1, x25
 4619bd4: 9731898a     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 4619bd8: f940b300     	ldr	x0, [x24, #0x160]
 4619bdc: 17fffd13     	b	0x4619028 <_ChromeMain+0x4613d8c>
 4619be0: f9400b08     	ldr	x8, [x24, #0x10]
 4619be4: aa1803e0     	mov	x0, x24
 4619be8: d63f0100     	blr	x8
 4619bec: 17fffd29     	b	0x4619090 <_ChromeMain+0x4613df4>
 4619bf0: 8b150d4c     	add	x12, x10, x21, lsl #3
 4619bf4: eb0c017f     	cmp	x11, x12
 4619bf8: b0052cda     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4619bfc: 54ff8f60     	b.eq	0x4618de8 <_ChromeMain+0x4613b4c>
 4619c00: cb080128     	sub	x8, x9, x8
 4619c04: 9343fd17     	asr	x23, x8, #3
 4619c08: cb0a0168     	sub	x8, x11, x10
 4619c0c: 9343fd15     	asr	x21, x8, #3
 4619c10: 17ffff0e     	b	0x4619848 <_ChromeMain+0x46145ac>
 4619c14: 9343fd4a     	asr	x10, x10, #3
 4619c18: 91000549     	add	x9, x10, #0x1
 4619c1c: eb0902bf     	cmp	x21, x9
 4619c20: 9a8a86aa     	csinc	x10, x21, x10, hi
 4619c24: eb15013f     	cmp	x9, x21
 4619c28: 54000063     	b.lo	0x4619c34 <_ChromeMain+0x4614998>
 4619c2c: aa0a03f5     	mov	x21, x10
 4619c30: 17ffff80     	b	0x4619a30 <_ChromeMain+0x4614794>
 4619c34: f869790b     	ldr	x11, [x8, x9, lsl #3]
 4619c38: eb0b02df     	cmp	x22, x11
 4619c3c: 540005a0     	b.eq	0x4619cf0 <_ChromeMain+0x4614a54>
 4619c40: f9401d6b     	ldr	x11, [x11, #0x38]
 4619c44: b5ffffab     	cbnz	x11, 0x4619c38 <_ChromeMain+0x461499c>
 4619c48: aa0903f5     	mov	x21, x9
 4619c4c: 17ffff79     	b	0x4619a30 <_ChromeMain+0x4614794>
 4619c50: d4200000     	brk	#0
 4619c54: d4400000     	hlt	#0
 4619c58: d4200020     	brk	#0x1
 4619c5c: d4200000     	brk	#0
 4619c60: d4400000     	hlt	#0
 4619c64: d4200020     	brk	#0x1
 4619c68: d4200000     	brk	#0
 4619c6c: d4400000     	hlt	#0
 4619c70: d4200020     	brk	#0x1
 4619c74: d4200000     	brk	#0
 4619c78: d4400000     	hlt	#0
 4619c7c: d4200020     	brk	#0x1
 4619c80: d4200000     	brk	#0
 4619c84: d4400000     	hlt	#0
 4619c88: d4200020     	brk	#0x1
 4619c8c: eb09011f     	cmp	x8, x9
 4619c90: 54ffe301     	b.ne	0x46198f0 <_ChromeMain+0x4614654>
 4619c94: 17fffea9     	b	0x4619738 <_ChromeMain+0x461449c>
 4619c98: eb09011f     	cmp	x8, x9
 4619c9c: 54ffe381     	b.ne	0x461990c <_ChromeMain+0x4614670>
 4619ca0: aa1303e0     	mov	x0, x19
 4619ca4: 940006e4     	bl	0x461b834 <_ChromeMain+0x4616598>
 4619ca8: 17ffff3c     	b	0x4619998 <_ChromeMain+0x46146fc>
 4619cac: d4200000     	brk	#0
 4619cb0: d4400000     	hlt	#0
 4619cb4: d4200020     	brk	#0x1
 4619cb8: eb09011f     	cmp	x8, x9
 4619cbc: 54ff8960     	b.eq	0x4618de8 <_ChromeMain+0x4613b4c>
 4619cc0: 17fffeeb     	b	0x461986c <_ChromeMain+0x46145d0>
 4619cc4: 91000529     	add	x9, x9, #0x1
 4619cc8: eb01013f     	cmp	x9, x1
 4619ccc: 54ffe861     	b.ne	0x46199d8 <_ChromeMain+0x461473c>
 4619cd0: 17ffff40     	b	0x46199d0 <_ChromeMain+0x4614734>
 4619cd4: 91000529     	add	x9, x9, #0x1
 4619cd8: eb15013f     	cmp	x9, x21
 4619cdc: 54ffe981     	b.ne	0x4619a0c <_ChromeMain+0x4614770>
 4619ce0: 17ffff52     	b	0x4619a28 <_ChromeMain+0x461478c>
 4619ce4: d4200000     	brk	#0
 4619ce8: d4400000     	hlt	#0
 4619cec: d4200020     	brk	#0x1
 4619cf0: 91000529     	add	x9, x9, #0x1
 4619cf4: eb15013f     	cmp	x9, x21
 4619cf8: 54fff9e1     	b.ne	0x4619c34 <_ChromeMain+0x4614998>
 4619cfc: 17ffffcc     	b	0x4619c2c <_ChromeMain+0x4614990>
 4619d00: d102c3ff     	sub	sp, sp, #0xb0
 4619d04: a9056ffc     	stp	x28, x27, [sp, #0x50]
 4619d08: a90667fa     	stp	x26, x25, [sp, #0x60]
 4619d0c: a9075ff8     	stp	x24, x23, [sp, #0x70]
 4619d10: a90857f6     	stp	x22, x21, [sp, #0x80]
 4619d14: a9094ff4     	stp	x20, x19, [sp, #0x90]
 4619d18: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 4619d1c: 910283fd     	add	x29, sp, #0xa0
 4619d20: b40000c1     	cbz	x1, 0x4619d38 <_ChromeMain+0x4614a9c>
 4619d24: aa0103f6     	mov	x22, x1
 4619d28: aa0003f3     	mov	x19, x0
 4619d2c: f9438008     	ldr	x8, [x0, #0x700]
 4619d30: eb01011f     	cmp	x8, x1
 4619d34: 54000140     	b.eq	0x4619d5c <_ChromeMain+0x4614ac0>
 4619d38: 52800000     	mov	w0, #0x0                ; =0
 4619d3c: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 4619d40: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 4619d44: a94857f6     	ldp	x22, x21, [sp, #0x80]
 4619d48: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 4619d4c: a94667fa     	ldp	x26, x25, [sp, #0x60]
 4619d50: a9456ffc     	ldp	x28, x27, [sp, #0x50]
 4619d54: 9102c3ff     	add	sp, sp, #0xb0
 4619d58: d65f03c0     	ret
 4619d5c: f9437e74     	ldr	x20, [x19, #0x6f8]
 4619d60: b4fffed4     	cbz	x20, 0x4619d38 <_ChromeMain+0x4614a9c>
 4619d64: aa0203f7     	mov	x23, x2
 4619d68: 395d0279     	ldrb	w25, [x19, #0x740]
 4619d6c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4619d70: b0052cda     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4619d74: f9404749     	ldr	x9, [x26, #0x88]
 4619d78: aa1603e0     	mov	x0, x22
 4619d7c: eb09011f     	cmp	x8, x9
 4619d80: 54000081     	b.ne	0x4619d90 <_ChromeMain+0x4614af4>
 4619d84: aa1403e0     	mov	x0, x20
 4619d88: 96e8232d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4619d8c: f9438260     	ldr	x0, [x19, #0x700]
 4619d90: f9037e7f     	str	xzr, [x19, #0x6f8]
 4619d94: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4619d98: f9404749     	ldr	x9, [x26, #0x88]
 4619d9c: eb09011f     	cmp	x8, x9
 4619da0: 54000041     	b.ne	0x4619da8 <_ChromeMain+0x4614b0c>
 4619da4: 96e82326     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4619da8: 5280001c     	mov	w28, #0x0               ; =0
 4619dac: f903827f     	str	xzr, [x19, #0x700]
 4619db0: 391d027f     	strb	wzr, [x19, #0x740]
 4619db4: f943d675     	ldr	x21, [x19, #0x7a8]
 4619db8: f943e278     	ldr	x24, [x19, #0x7c0]
 4619dbc: 39618268     	ldrb	w8, [x19, #0x860]
 4619dc0: 34000048     	cbz	w8, 0x4619dc8 <_ChromeMain+0x4614b2c>
 4619dc4: 3961867c     	ldrb	w28, [x19, #0x861]
 4619dc8: 395ee268     	ldrb	w8, [x19, #0x7b8]
 4619dcc: b9000fe8     	str	w8, [sp, #0xc]
 4619dd0: 911ea27b     	add	x27, x19, #0x7a8
 4619dd4: f943da68     	ldr	x8, [x19, #0x7b0]
 4619dd8: f90003e8     	str	x8, [sp]
 4619ddc: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4619de0: f9404749     	ldr	x9, [x26, #0x88]
 4619de4: aa1803e0     	mov	x0, x24
 4619de8: eb09011f     	cmp	x8, x9
 4619dec: 54000081     	b.ne	0x4619dfc <_ChromeMain+0x4614b60>
 4619df0: aa1503e0     	mov	x0, x21
 4619df4: 96e82312     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4619df8: f943e260     	ldr	x0, [x19, #0x7c0]
 4619dfc: a9007f7f     	stp	xzr, xzr, [x27]
 4619e00: 3900437f     	strb	wzr, [x27, #0x10]
 4619e04: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4619e08: f9404749     	ldr	x9, [x26, #0x88]
 4619e0c: eb09011f     	cmp	x8, x9
 4619e10: 54000041     	b.ne	0x4619e18 <_ChromeMain+0x4614b7c>
 4619e14: 96e8230a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4619e18: f903e27f     	str	xzr, [x19, #0x7c0]
 4619e1c: f942ee68     	ldr	x8, [x19, #0x5d8]
 4619e20: d37ced1a     	lsl	x26, x8, #4
 4619e24: b40004da     	cbz	x26, 0x4619ebc <_ChromeMain+0x4614c20>
 4619e28: f942ea68     	ldr	x8, [x19, #0x5d0]
 4619e2c: 9100211b     	add	x27, x8, #0x8
 4619e30: 14000005     	b	0x4619e44 <_ChromeMain+0x4614ba8>
 4619e34: b904541f     	str	wzr, [x0, #0x454]
 4619e38: 96fe1cd1     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4619e3c: f100435a     	subs	x26, x26, #0x10
 4619e40: 540003e0     	b.eq	0x4619ebc <_ChromeMain+0x4614c20>
 4619e44: f8410760     	ldr	x0, [x27], #0x10
 4619e48: b9445408     	ldr	w8, [x0, #0x454]
 4619e4c: 34ffff88     	cbz	w8, 0x4619e3c <_ChromeMain+0x4614ba0>
 4619e50: 17fffff9     	b	0x4619e34 <_ChromeMain+0x4614b98>
 4619e54: f94013e0     	ldr	x0, [sp, #0x20]
 4619e58: f9401be8     	ldr	x8, [sp, #0x30]
 4619e5c: d37ff901     	lsl	x1, x8, #1
 4619e60: 96e7bc16     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4619e64: 37000459     	tbnz	w25, #0x0, 0x4619eec <_ChromeMain+0x4614c50>
 4619e68: 52800035     	mov	w21, #0x1               ; =1
 4619e6c: aa1303e0     	mov	x0, x19
 4619e70: 52800021     	mov	w1, #0x1                ; =1
 4619e74: 97ffedd3     	bl	0x46155c0 <_ChromeMain+0x4610324>
 4619e78: f9437274     	ldr	x20, [x19, #0x6e0]
 4619e7c: b4fff5f4     	cbz	x20, 0x4619d38 <_ChromeMain+0x4614a9c>
 4619e80: b8350288     	ldadd	w21, w8, [x20]
 4619e84: 7100011f     	cmp	w8, #0x0
 4619e88: 54001f6d     	b.le	0x461a274 <_ChromeMain+0x4614fd8>
 4619e8c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4619e90: 6b09011f     	cmp	w8, w9
 4619e94: 54001f60     	b.eq	0x461a280 <_ChromeMain+0x4614fe4>
 4619e98: f9437268     	ldr	x8, [x19, #0x6e0]
 4619e9c: f9400508     	ldr	x8, [x8, #0x8]
 4619ea0: aa1403e0     	mov	x0, x20
 4619ea4: d63f0100     	blr	x8
 4619ea8: 12800008     	mov	w8, #-0x1               ; =-1
 4619eac: b8e80288     	ldaddal	w8, w8, [x20]
 4619eb0: 7100051f     	cmp	w8, #0x1
 4619eb4: 54fff421     	b.ne	0x4619d38 <_ChromeMain+0x4614a9c>
 4619eb8: 140000d1     	b	0x461a1fc <_ChromeMain+0x4614f60>
 4619ebc: f9000bff     	str	xzr, [sp, #0x10]
 4619ec0: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4619ec4: f9001bff     	str	xzr, [sp, #0x30]
 4619ec8: 910043e2     	add	x2, sp, #0x10
 4619ecc: 910083e3     	add	x3, sp, #0x20
 4619ed0: aa1303e0     	mov	x0, x19
 4619ed4: 52800001     	mov	w1, #0x0                ; =0
 4619ed8: 52800004     	mov	w4, #0x0                ; =0
 4619edc: 9400074c     	bl	0x461bc0c <_ChromeMain+0x4616970>
 4619ee0: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4619ee4: 37fffb88     	tbnz	w8, #0x1f, 0x4619e54 <_ChromeMain+0x4614bb8>
 4619ee8: 3607fc19     	tbz	w25, #0x0, 0x4619e68 <_ChromeMain+0x4614bcc>
 4619eec: f9429a68     	ldr	x8, [x19, #0x530]
 4619ef0: b4fffbc8     	cbz	x8, 0x4619e68 <_ChromeMain+0x4614bcc>
 4619ef4: f9401e88     	ldr	x8, [x20, #0x38]
 4619ef8: b4fffb88     	cbz	x8, 0x4619e68 <_ChromeMain+0x4614bcc>
 4619efc: f9429e61     	ldr	x1, [x19, #0x538]
 4619f00: aa1603e0     	mov	x0, x22
 4619f04: aa1703e2     	mov	x2, x23
 4619f08: 940006a9     	bl	0x461b9ac <_ChromeMain+0x4616710>
 4619f0c: aa0003f9     	mov	x25, x0
 4619f10: aa1603e0     	mov	x0, x22
 4619f14: aa1303e1     	mov	x1, x19
 4619f18: aa1703e2     	mov	x2, x23
 4619f1c: 940006a4     	bl	0x461b9ac <_ChromeMain+0x4616710>
 4619f20: aa0003fa     	mov	x26, x0
 4619f24: aa1603e0     	mov	x0, x22
 4619f28: aa1703e1     	mov	x1, x23
 4619f2c: 940006f0     	bl	0x461baec <_ChromeMain+0x4616850>
 4619f30: f90027e0     	str	x0, [sp, #0x48]
 4619f34: b940fa88     	ldr	w8, [x20, #0xf8]
 4619f38: 34000a08     	cbz	w8, 0x461a078 <_ChromeMain+0x4614ddc>
 4619f3c: 52800017     	mov	w23, #0x0               ; =0
 4619f40: b940fa88     	ldr	w8, [x20, #0xf8]
 4619f44: 34000e68     	cbz	w8, 0x461a110 <_ChromeMain+0x4614e74>
 4619f48: f9437276     	ldr	x22, [x19, #0x6e0]
 4619f4c: b4000216     	cbz	x22, 0x4619f8c <_ChromeMain+0x4614cf0>
 4619f50: 52800028     	mov	w8, #0x1                ; =1
 4619f54: b82802c8     	ldadd	w8, w8, [x22]
 4619f58: 7100011f     	cmp	w8, #0x0
 4619f5c: 5400198d     	b.le	0x461a28c <_ChromeMain+0x4614ff0>
 4619f60: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4619f64: 6b09011f     	cmp	w8, w9
 4619f68: 54001980     	b.eq	0x461a298 <_ChromeMain+0x4614ffc>
 4619f6c: f9437268     	ldr	x8, [x19, #0x6e0]
 4619f70: f9400508     	ldr	x8, [x8, #0x8]
 4619f74: aa1603e0     	mov	x0, x22
 4619f78: d63f0100     	blr	x8
 4619f7c: 12800008     	mov	w8, #-0x1               ; =-1
 4619f80: b8e802c8     	ldaddal	w8, w8, [x22]
 4619f84: 7100051f     	cmp	w8, #0x1
 4619f88: 540016c0     	b.eq	0x461a260 <_ChromeMain+0x4614fc4>
 4619f8c: 3700017c     	tbnz	w28, #0x0, 0x4619fb8 <_ChromeMain+0x4614d1c>
 4619f90: d360ff28     	lsr	x8, x25, #32
 4619f94: b9473e69     	ldr	w9, [x19, #0x73c]
 4619f98: 11004929     	add	w9, w9, #0x12
 4619f9c: 6b08013f     	cmp	w9, w8
 4619fa0: 5400010a     	b.ge	0x4619fc0 <_ChromeMain+0x4614d24>
 4619fa4: d360ff48     	lsr	x8, x26, #32
 4619fa8: b941c669     	ldr	w9, [x19, #0x1c4]
 4619fac: 11004929     	add	w9, w9, #0x12
 4619fb0: 6b08013f     	cmp	w9, w8
 4619fb4: 5400006a     	b.ge	0x4619fc0 <_ChromeMain+0x4614d24>
 4619fb8: b940fa88     	ldr	w8, [x20, #0xf8]
 4619fbc: 34000388     	cbz	w8, 0x461a02c <_ChromeMain+0x4614d90>
 4619fc0: b40002d5     	cbz	x21, 0x461a018 <_ChromeMain+0x4614d7c>
 4619fc4: b9400fe8     	ldr	w8, [sp, #0xc]
 4619fc8: 34000288     	cbz	w8, 0x461a018 <_ChromeMain+0x4614d7c>
 4619fcc: eb15029f     	cmp	x20, x21
 4619fd0: 54000240     	b.eq	0x461a018 <_ChromeMain+0x4614d7c>
 4619fd4: aa1503e8     	mov	x8, x21
 4619fd8: eb08029f     	cmp	x20, x8
 4619fdc: 540001e0     	b.eq	0x461a018 <_ChromeMain+0x4614d7c>
 4619fe0: f9401d08     	ldr	x8, [x8, #0x38]
 4619fe4: b5ffffa8     	cbnz	x8, 0x4619fd8 <_ChromeMain+0x4614d3c>
 4619fe8: f9401e88     	ldr	x8, [x20, #0x38]
 4619fec: f9402509     	ldr	x9, [x8, #0x48]
 4619ff0: d37df12a     	lsl	x10, x9, #3
 4619ff4: b400012a     	cbz	x10, 0x461a018 <_ChromeMain+0x4614d7c>
 4619ff8: d2800009     	mov	x9, #0x0                ; =0
 4619ffc: f940210b     	ldr	x11, [x8, #0x40]
 461a000: f869696c     	ldr	x12, [x11, x9]
 461a004: eb14019f     	cmp	x12, x20
 461a008: 54001020     	b.eq	0x461a20c <_ChromeMain+0x4614f70>
 461a00c: 91002129     	add	x9, x9, #0x8
 461a010: eb09015f     	cmp	x10, x9
 461a014: 54ffff61     	b.ne	0x461a000 <_ChromeMain+0x4614d64>
 461a018: aa1303e0     	mov	x0, x19
 461a01c: 52800021     	mov	w1, #0x1                ; =1
 461a020: 97ffed68     	bl	0x46155c0 <_ChromeMain+0x4610324>
 461a024: 52800020     	mov	w0, #0x1                ; =1
 461a028: 17ffff45     	b	0x4619d3c <_ChromeMain+0x4614aa0>
 461a02c: 3944e288     	ldrb	w8, [x20, #0x138]
 461a030: 3707fc88     	tbnz	w8, #0x0, 0x4619fc0 <_ChromeMain+0x4614d24>
 461a034: aa1303e0     	mov	x0, x19
 461a038: 52800001     	mov	w1, #0x0                ; =0
 461a03c: 97ffed61     	bl	0x46155c0 <_ChromeMain+0x4610324>
 461a040: f9429a73     	ldr	x19, [x19, #0x530]
 461a044: b004c580     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 461a048: 911d2c00     	add	x0, x0, #0x74b
 461a04c: b004c581     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 461a050: 911c2021     	add	x1, x1, #0x708
 461a054: 910083e8     	add	x8, sp, #0x20
 461a058: 52818982     	mov	w2, #0xc4c              ; =3148
 461a05c: 96e8db09     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 461a060: 910083e3     	add	x3, sp, #0x20
 461a064: aa1303e0     	mov	x0, x19
 461a068: aa1403e1     	mov	x1, x20
 461a06c: 52800002     	mov	w2, #0x0                ; =0
 461a070: 957ce0d9     	bl	0xa5523d4 <_ChromeMain+0xa54d138>
 461a074: 17ffffec     	b	0x461a024 <_ChromeMain+0x4614d88>
 461a078: f9436a68     	ldr	x8, [x19, #0x6d0]
 461a07c: b4fff608     	cbz	x8, 0x4619f3c <_ChromeMain+0x4614ca0>
 461a080: f94212c8     	ldr	x8, [x22, #0x420]
 461a084: b4000ac8     	cbz	x8, 0x461a1dc <_ChromeMain+0x4614f40>
 461a088: 910083e0     	add	x0, sp, #0x20
 461a08c: 910d2101     	add	x1, x8, #0x348
 461a090: 97029333     	bl	0x6bed5c <_ChromeMain+0x6b9ac0>
 461a094: aa1603e0     	mov	x0, x22
 461a098: 97383537     	bl	0x1427574 <_ChromeMain+0x14222d8>
 461a09c: a90107e0     	stp	x0, x1, [sp, #0x10]
 461a0a0: f9436a76     	ldr	x22, [x19, #0x6d0]
 461a0a4: b4001016     	cbz	x22, 0x461a2a4 <_ChromeMain+0x4615008>
 461a0a8: 52800028     	mov	w8, #0x1                ; =1
 461a0ac: b82802c8     	ldadd	w8, w8, [x22]
 461a0b0: 7100011f     	cmp	w8, #0x0
 461a0b4: 54000fed     	b.le	0x461a2b0 <_ChromeMain+0x4615014>
 461a0b8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461a0bc: 6b09011f     	cmp	w8, w9
 461a0c0: 54000fe0     	b.eq	0x461a2bc <_ChromeMain+0x4615020>
 461a0c4: f9436a68     	ldr	x8, [x19, #0x6d0]
 461a0c8: f9400508     	ldr	x8, [x8, #0x8]
 461a0cc: 910083e2     	add	x2, sp, #0x20
 461a0d0: 910043e3     	add	x3, sp, #0x10
 461a0d4: 910123e4     	add	x4, sp, #0x48
 461a0d8: aa1603e0     	mov	x0, x22
 461a0dc: aa1403e1     	mov	x1, x20
 461a0e0: d63f0100     	blr	x8
 461a0e4: aa0003f7     	mov	x23, x0
 461a0e8: 12800008     	mov	w8, #-0x1               ; =-1
 461a0ec: b8e802c8     	ldaddal	w8, w8, [x22]
 461a0f0: 7100051f     	cmp	w8, #0x1
 461a0f4: 54000081     	b.ne	0x461a104 <_ChromeMain+0x4614e68>
 461a0f8: f9400ac8     	ldr	x8, [x22, #0x10]
 461a0fc: aa1603e0     	mov	x0, x22
 461a100: d63f0100     	blr	x8
 461a104: 910083e0     	add	x0, sp, #0x20
 461a108: 9708b1ce     	bl	0x846840 <_ChromeMain+0x8415a4>
 461a10c: 17ffff8d     	b	0x4619f40 <_ChromeMain+0x4614ca4>
 461a110: eb14031f     	cmp	x24, x20
 461a114: 520002e8     	eor	w8, w23, #0x1
 461a118: 1a8803e8     	csel	w8, wzr, w8, eq
 461a11c: 3707f168     	tbnz	w8, #0x0, 0x4619f48 <_ChromeMain+0x4614cac>
 461a120: f9436e68     	ldr	x8, [x19, #0x6d8]
 461a124: b4fff128     	cbz	x8, 0x4619f48 <_ChromeMain+0x4614cac>
 461a128: 52800036     	mov	w22, #0x1               ; =1
 461a12c: aa1303e0     	mov	x0, x19
 461a130: 52800021     	mov	w1, #0x1                ; =1
 461a134: 97ffed23     	bl	0x46155c0 <_ChromeMain+0x4610324>
 461a138: f9436e75     	ldr	x21, [x19, #0x6d8]
 461a13c: b4000c75     	cbz	x21, 0x461a2c8 <_ChromeMain+0x461502c>
 461a140: b83602a8     	ldadd	w22, w8, [x21]
 461a144: 7100011f     	cmp	w8, #0x0
 461a148: 54000c6d     	b.le	0x461a2d4 <_ChromeMain+0x4615038>
 461a14c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461a150: 6b09011f     	cmp	w8, w9
 461a154: 54000c60     	b.eq	0x461a2e0 <_ChromeMain+0x4615044>
 461a158: f9436e68     	ldr	x8, [x19, #0x6d8]
 461a15c: f9400508     	ldr	x8, [x8, #0x8]
 461a160: aa1503e0     	mov	x0, x21
 461a164: aa1403e1     	mov	x1, x20
 461a168: d63f0100     	blr	x8
 461a16c: 12800008     	mov	w8, #-0x1               ; =-1
 461a170: b8e802a8     	ldaddal	w8, w8, [x21]
 461a174: 7100051f     	cmp	w8, #0x1
 461a178: 54000081     	b.ne	0x461a188 <_ChromeMain+0x4614eec>
 461a17c: f9400aa8     	ldr	x8, [x21, #0x10]
 461a180: aa1503e0     	mov	x0, x21
 461a184: d63f0100     	blr	x8
 461a188: f9437274     	ldr	x20, [x19, #0x6e0]
 461a18c: b4fff4d4     	cbz	x20, 0x461a024 <_ChromeMain+0x4614d88>
 461a190: 52800028     	mov	w8, #0x1                ; =1
 461a194: b8280288     	ldadd	w8, w8, [x20]
 461a198: 7100011f     	cmp	w8, #0x0
 461a19c: 54000a8d     	b.le	0x461a2ec <_ChromeMain+0x4615050>
 461a1a0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461a1a4: 6b09011f     	cmp	w8, w9
 461a1a8: 54000a80     	b.eq	0x461a2f8 <_ChromeMain+0x461505c>
 461a1ac: f9437268     	ldr	x8, [x19, #0x6e0]
 461a1b0: f9400508     	ldr	x8, [x8, #0x8]
 461a1b4: aa1403e0     	mov	x0, x20
 461a1b8: d63f0100     	blr	x8
 461a1bc: 12800008     	mov	w8, #-0x1               ; =-1
 461a1c0: b8e80288     	ldaddal	w8, w8, [x20]
 461a1c4: 7100051f     	cmp	w8, #0x1
 461a1c8: 54fff2e1     	b.ne	0x461a024 <_ChromeMain+0x4614d88>
 461a1cc: f9400a88     	ldr	x8, [x20, #0x10]
 461a1d0: aa1403e0     	mov	x0, x20
 461a1d4: d63f0100     	blr	x8
 461a1d8: 17ffff93     	b	0x461a024 <_ChromeMain+0x4614d88>
 461a1dc: f90013ff     	str	xzr, [sp, #0x20]
 461a1e0: 2f06e400     	movi	d0, #0xffff000000000000
 461a1e4: fd0017e0     	str	d0, [sp, #0x28]
 461a1e8: 52800028     	mov	w8, #0x1                ; =1
 461a1ec: 3900c3e8     	strb	w8, [sp, #0x30]
 461a1f0: f9001fff     	str	xzr, [sp, #0x38]
 461a1f4: 390103ff     	strb	wzr, [sp, #0x40]
 461a1f8: 17ffffa7     	b	0x461a094 <_ChromeMain+0x4614df8>
 461a1fc: f9400a88     	ldr	x8, [x20, #0x10]
 461a200: aa1403e0     	mov	x0, x20
 461a204: d63f0100     	blr	x8
 461a208: 17fffecc     	b	0x4619d38 <_ChromeMain+0x4614a9c>
 461a20c: f94026aa     	ldr	x10, [x21, #0x48]
 461a210: f94003eb     	ldr	x11, [sp]
 461a214: eb0b015f     	cmp	x10, x11
 461a218: 9a8b3156     	csel	x22, x10, x11, lo
 461a21c: eb15011f     	cmp	x8, x21
 461a220: 54000140     	b.eq	0x461a248 <_ChromeMain+0x4614fac>
 461a224: aa1303e0     	mov	x0, x19
 461a228: 52800001     	mov	w1, #0x0                ; =0
 461a22c: 97ffece5     	bl	0x46155c0 <_ChromeMain+0x4610324>
 461a230: f9429a60     	ldr	x0, [x19, #0x530]
 461a234: aa1403e1     	mov	x1, x20
 461a238: aa1503e2     	mov	x2, x21
 461a23c: aa1603e3     	mov	x3, x22
 461a240: 957ce376     	bl	0xa553018 <_ChromeMain+0xa54dd7c>
 461a244: 17ffff78     	b	0x461a024 <_ChromeMain+0x4614d88>
 461a248: 9343fd28     	asr	x8, x9, #3
 461a24c: 91000509     	add	x9, x8, #0x1
 461a250: eb0902df     	cmp	x22, x9
 461a254: fa4812c4     	ccmp	x22, x8, #0x4, ne
 461a258: 54ffee00     	b.eq	0x461a018 <_ChromeMain+0x4614d7c>
 461a25c: 17fffff2     	b	0x461a224 <_ChromeMain+0x4614f88>
 461a260: f9400ac8     	ldr	x8, [x22, #0x10]
 461a264: aa1603e0     	mov	x0, x22
 461a268: d63f0100     	blr	x8
 461a26c: 3607e93c     	tbz	w28, #0x0, 0x4619f90 <_ChromeMain+0x4614cf4>
 461a270: 17ffff52     	b	0x4619fb8 <_ChromeMain+0x4614d1c>
 461a274: d4200000     	brk	#0
 461a278: d4400000     	hlt	#0
 461a27c: d4200020     	brk	#0x1
 461a280: d4200000     	brk	#0
 461a284: d4400000     	hlt	#0
 461a288: d4200020     	brk	#0x1
 461a28c: d4200000     	brk	#0
 461a290: d4400000     	hlt	#0
 461a294: d4200020     	brk	#0x1
 461a298: d4200000     	brk	#0
 461a29c: d4400000     	hlt	#0
 461a2a0: d4200020     	brk	#0x1
 461a2a4: d4200000     	brk	#0
 461a2a8: d4400000     	hlt	#0
 461a2ac: d4200020     	brk	#0x1
 461a2b0: d4200000     	brk	#0
 461a2b4: d4400000     	hlt	#0
 461a2b8: d4200020     	brk	#0x1
 461a2bc: d4200000     	brk	#0
 461a2c0: d4400000     	hlt	#0
 461a2c4: d4200020     	brk	#0x1
 461a2c8: d4200000     	brk	#0
 461a2cc: d4400000     	hlt	#0
 461a2d0: d4200020     	brk	#0x1
 461a2d4: d4200000     	brk	#0
 461a2d8: d4400000     	hlt	#0
 461a2dc: d4200020     	brk	#0x1
 461a2e0: d4200000     	brk	#0
 461a2e4: d4400000     	hlt	#0
 461a2e8: d4200020     	brk	#0x1
 461a2ec: d4200000     	brk	#0
 461a2f0: d4400000     	hlt	#0
 461a2f4: d4200020     	brk	#0x1
 461a2f8: d4200000     	brk	#0
 461a2fc: d4400000     	hlt	#0
 461a300: d4200020     	brk	#0x1
 461a304: d10383ff     	sub	sp, sp, #0xe0
 461a308: a9086ffc     	stp	x28, x27, [sp, #0x80]
 461a30c: a90967fa     	stp	x26, x25, [sp, #0x90]
 461a310: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 461a314: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 461a318: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 461a31c: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 461a320: 910343fd     	add	x29, sp, #0xd0
 461a324: b4002281     	cbz	x1, 0x461a774 <_ChromeMain+0x46154d8>
 461a328: aa0103f4     	mov	x20, x1
 461a32c: f941f028     	ldr	x8, [x1, #0x3e0]
 461a330: b4002228     	cbz	x8, 0x461a774 <_ChromeMain+0x46154d8>
 461a334: aa0203f5     	mov	x21, x2
 461a338: aa0003f3     	mov	x19, x0
 461a33c: b940f908     	ldr	w8, [x8, #0xf8]
 461a340: 340022e8     	cbz	w8, 0x461a79c <_ChromeMain+0x4615500>
 461a344: f9400268     	ldr	x8, [x19]
 461a348: f9403508     	ldr	x8, [x8, #0x68]
 461a34c: aa1303e0     	mov	x0, x19
 461a350: d63f0100     	blr	x8
 461a354: b40020c0     	cbz	x0, 0x461a76c <_ChromeMain+0x46154d0>
 461a358: f941f296     	ldr	x22, [x20, #0x3e0]
 461a35c: 3944e2c8     	ldrb	w8, [x22, #0x138]
 461a360: 37002068     	tbnz	w8, #0x0, 0x461a76c <_ChromeMain+0x46154d0>
 461a364: f944da68     	ldr	x8, [x19, #0x9b0]
 461a368: 91000508     	add	x8, x8, #0x1
 461a36c: f904da68     	str	x8, [x19, #0x9b0]
 461a370: f9435260     	ldr	x0, [x19, #0x6a0]
 461a374: f903527f     	str	xzr, [x19, #0x6a0]
 461a378: b4000080     	cbz	x0, 0x461a388 <_ChromeMain+0x46150ec>
 461a37c: 978a82e8     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 461a380: 52800301     	mov	w1, #0x18               ; =24
 461a384: 96e7bacd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461a388: f9434e60     	ldr	x0, [x19, #0x698]
 461a38c: f9034e7f     	str	xzr, [x19, #0x698]
 461a390: b4000080     	cbz	x0, 0x461a3a0 <_ChromeMain+0x4615104>
 461a394: f9400008     	ldr	x8, [x0]
 461a398: f9400508     	ldr	x8, [x8, #0x8]
 461a39c: d63f0100     	blr	x8
 461a3a0: 39666268     	ldrb	w8, [x19, #0x998]
 461a3a4: 34000048     	cbz	w8, 0x461a3ac <_ChromeMain+0x4615110>
 461a3a8: 3926627f     	strb	wzr, [x19, #0x998]
 461a3ac: b909c27f     	str	wzr, [x19, #0x9c0]
 461a3b0: f94032c8     	ldr	x8, [x22, #0x60]
 461a3b4: f904ca68     	str	x8, [x19, #0x990]
 461a3b8: 52800028     	mov	w8, #0x1                ; =1
 461a3bc: 39266268     	strb	w8, [x19, #0x998]
 461a3c0: 52800800     	mov	w0, #0x40               ; =64
 461a3c4: 96e7d3e9     	bl	0xf368 <_ChromeMain+0xa0cc>
 461a3c8: aa0003f6     	mov	x22, x0
 461a3cc: 91140268     	add	x8, x19, #0x500
 461a3d0: f100027f     	cmp	x19, #0x0
 461a3d4: 9a8803f7     	csel	x23, xzr, x8, eq
 461a3d8: d004e668     	adrp	x8, 0xe2e8000 <dyld_stub_binder+0xe2e8000>
 461a3dc: 912da108     	add	x8, x8, #0xb68
 461a3e0: a9007c08     	stp	x8, xzr, [x0]
 461a3e4: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 461a3e8: f900081f     	str	xzr, [x0, #0x10]
 461a3ec: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 461a3f0: 90052cd9     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461a3f4: f9404729     	ldr	x9, [x25, #0x88]
 461a3f8: eb09011f     	cmp	x8, x9
 461a3fc: 54000061     	b.ne	0x461a408 <_ChromeMain+0x461516c>
 461a400: aa1703e0     	mov	x0, x23
 461a404: 96e7e7be     	bl	0x142fc <_ChromeMain+0xf060>
 461a408: f90016d7     	str	x23, [x22, #0x28]
 461a40c: 52800100     	mov	w0, #0x8                ; =8
 461a410: 96e7d3d6     	bl	0xf368 <_ChromeMain+0xa0cc>
 461a414: b900001f     	str	wzr, [x0]
 461a418: 3900101f     	strb	wzr, [x0, #0x4]
 461a41c: b40000c0     	cbz	x0, 0x461a434 <_ChromeMain+0x4615198>
 461a420: 52800028     	mov	w8, #0x1                ; =1
 461a424: b8280008     	ldadd	w8, w8, [x0]
 461a428: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461a42c: 6b09011f     	cmp	w8, w9
 461a430: 540058a0     	b.eq	0x461af44 <_ChromeMain+0x4615ca8>
 461a434: a9035ac0     	stp	x0, x22, [x22, #0x30]
 461a438: f9434e60     	ldr	x0, [x19, #0x698]
 461a43c: f9034e76     	str	x22, [x19, #0x698]
 461a440: b40000a0     	cbz	x0, 0x461a454 <_ChromeMain+0x46151b8>
 461a444: f9400008     	ldr	x8, [x0]
 461a448: f9400508     	ldr	x8, [x8, #0x8]
 461a44c: d63f0100     	blr	x8
 461a450: f9434e76     	ldr	x22, [x19, #0x698]
 461a454: 528000c8     	mov	w8, #0x6                ; =6
 461a458: 3900ffe8     	strb	w8, [sp, #0x3f]
 461a45c: 9100a3e9     	add	x9, sp, #0x28
 461a460: 9100312a     	add	x10, x9, #0xc
 461a464: b004cb68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461a468: 911c3108     	add	x8, x8, #0x70c
 461a46c: eb08015f     	cmp	x10, x8
 461a470: fa488122     	ccmp	x9, x8, #0x2, hi
 461a474: 540049a9     	b.ls	0x461ada8 <_ChromeMain+0x4615b0c>
 461a478: 52800da9     	mov	w9, #0x6d               ; =109
 461a47c: 72a00ca9     	movk	w9, #0x65, lsl #16
 461a480: b90033e9     	str	w9, [sp, #0x30]
 461a484: f9400108     	ldr	x8, [x8]
 461a488: f90017e8     	str	x8, [sp, #0x28]
 461a48c: 79006bff     	strh	wzr, [sp, #0x34]
 461a490: 9100a3f7     	add	x23, sp, #0x28
 461a494: 9100a3e2     	add	x2, sp, #0x28
 461a498: aa1603e0     	mov	x0, x22
 461a49c: 52800021     	mov	w1, #0x1                ; =1
 461a4a0: 97462c9a     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 461a4a4: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461a4a8: 36f800a8     	tbz	w8, #0x1f, 0x461a4bc <_ChromeMain+0x4615220>
 461a4ac: f94017e0     	ldr	x0, [sp, #0x28]
 461a4b0: f9401fe8     	ldr	x8, [sp, #0x38]
 461a4b4: d37ff901     	lsl	x1, x8, #1
 461a4b8: 96e7ba80     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461a4bc: f9434e60     	ldr	x0, [x19, #0x698]
 461a4c0: 528000c8     	mov	w8, #0x6                ; =6
 461a4c4: 3900ffe8     	strb	w8, [sp, #0x3f]
 461a4c8: 910032e9     	add	x9, x23, #0xc
 461a4cc: b004cb68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461a4d0: 911c6908     	add	x8, x8, #0x71a
 461a4d4: eb08013f     	cmp	x9, x8
 461a4d8: fa4882e2     	ccmp	x23, x8, #0x2, hi
 461a4dc: 54004669     	b.ls	0x461ada8 <_ChromeMain+0x4615b0c>
 461a4e0: 52800e89     	mov	w9, #0x74               ; =116
 461a4e4: 72a00ca9     	movk	w9, #0x65, lsl #16
 461a4e8: b90033e9     	str	w9, [sp, #0x30]
 461a4ec: f9400108     	ldr	x8, [x8]
 461a4f0: f90017e8     	str	x8, [sp, #0x28]
 461a4f4: 79006bff     	strh	wzr, [sp, #0x34]
 461a4f8: 9100a3e2     	add	x2, sp, #0x28
 461a4fc: 52800041     	mov	w1, #0x2                ; =2
 461a500: 97462c82     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 461a504: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461a508: 36f800a8     	tbz	w8, #0x1f, 0x461a51c <_ChromeMain+0x4615280>
 461a50c: f94017e0     	ldr	x0, [sp, #0x28]
 461a510: f9401fe8     	ldr	x8, [sp, #0x38]
 461a514: d37ff901     	lsl	x1, x8, #1
 461a518: 96e7ba68     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461a51c: f9434e60     	ldr	x0, [x19, #0x698]
 461a520: 52800001     	mov	w1, #0x0                ; =0
 461a524: 979e7024     	bl	0x2db65b4 <_ChromeMain+0x2db1318>
 461a528: f9434e76     	ldr	x22, [x19, #0x698]
 461a52c: 52800600     	mov	w0, #0x30               ; =48
 461a530: 96e7d38e     	bl	0xf368 <_ChromeMain+0xa0cc>
 461a534: f90017e0     	str	x0, [sp, #0x28]
 461a538: d004c928     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 461a53c: 3dc00900     	ldr	q0, [x8, #0x20]
 461a540: 3c8303e0     	stur	q0, [sp, #0x30]
 461a544: 91008009     	add	x9, x0, #0x20
 461a548: eb00013f     	cmp	x9, x0
 461a54c: 540042e3     	b.lo	0x461ada8 <_ChromeMain+0x4615b0c>
 461a550: b004cb68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461a554: 911ca108     	add	x8, x8, #0x728
 461a558: eb08013f     	cmp	x9, x8
 461a55c: fa488002     	ccmp	x0, x8, #0x2, hi
 461a560: 54004249     	b.ls	0x461ada8 <_ChromeMain+0x4615b0c>
 461a564: ad400500     	ldp	q0, q1, [x8]
 461a568: ad000400     	stp	q0, q1, [x0]
 461a56c: 7900401f     	strh	wzr, [x0, #0x20]
 461a570: 9100a3e2     	add	x2, sp, #0x28
 461a574: aa1603e0     	mov	x0, x22
 461a578: 52800061     	mov	w1, #0x3                ; =3
 461a57c: 97462c63     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 461a580: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461a584: 36f800a8     	tbz	w8, #0x1f, 0x461a598 <_ChromeMain+0x46152fc>
 461a588: f94017e0     	ldr	x0, [sp, #0x28]
 461a58c: f9401fe8     	ldr	x8, [sp, #0x38]
 461a590: d37ff901     	lsl	x1, x8, #1
 461a594: 96e7ba49     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461a598: f944da77     	ldr	x23, [x19, #0x9b0]
 461a59c: f9434e76     	ldr	x22, [x19, #0x698]
 461a5a0: f9451a7a     	ldr	x26, [x19, #0xa30]
 461a5a4: b40000da     	cbz	x26, 0x461a5bc <_ChromeMain+0x4615320>
 461a5a8: 52800028     	mov	w8, #0x1                ; =1
 461a5ac: b8280348     	ldadd	w8, w8, [x26]
 461a5b0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461a5b4: 6b09011f     	cmp	w8, w9
 461a5b8: 54004cc0     	b.eq	0x461af50 <_ChromeMain+0x4615cb4>
 461a5bc: f9451e7b     	ldr	x27, [x19, #0xa38]
 461a5c0: 52800900     	mov	w0, #0x48               ; =72
 461a5c4: 96e7d369     	bl	0xf368 <_ChromeMain+0xa0cc>
 461a5c8: aa0003f8     	mov	x24, x0
 461a5cc: 52800028     	mov	w8, #0x1                ; =1
 461a5d0: b9000008     	str	w8, [x0]
 461a5d4: b0ffcc28     	adrp	x8, 0x3f9f000 <_ChromeMain+0x3f99d64>
 461a5d8: 91050108     	add	x8, x8, #0x140
 461a5dc: d0ffca89     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 461a5e0: 91250129     	add	x9, x9, #0x940
 461a5e4: a900a408     	stp	x8, x9, [x0, #0x8]
 461a5e8: 90ffd4a8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 461a5ec: 911b0108     	add	x8, x8, #0x6c0
 461a5f0: 1000d649     	adr	x9, 0x461c0b8 <_ChromeMain+0x4616e1c>
 461a5f4: d503201f     	nop
 461a5f8: a901a408     	stp	x8, x9, [x0, #0x18]
 461a5fc: a902e81f     	stp	xzr, x26, [x0, #0x28]
 461a600: a903dc1b     	stp	x27, x23, [x0, #0x38]
 461a604: 52800300     	mov	w0, #0x18               ; =24
 461a608: 96e7d358     	bl	0xf368 <_ChromeMain+0xa0cc>
 461a60c: aa0003f7     	mov	x23, x0
 461a610: 52800128     	mov	w8, #0x9                ; =9
 461a614: b9000008     	str	w8, [x0]
 461a618: aa1603e0     	mov	x0, x22
 461a61c: 52800121     	mov	w1, #0x9                ; =9
 461a620: aa1803e2     	mov	x2, x24
 461a624: 97add7b7     	bl	0x3190500 <_ChromeMain+0x318b264>
 461a628: aa0003f6     	mov	x22, x0
 461a62c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461a630: f9404729     	ldr	x9, [x25, #0x88]
 461a634: eb09011f     	cmp	x8, x9
 461a638: 54000061     	b.ne	0x461a644 <_ChromeMain+0x46153a8>
 461a63c: aa1603e0     	mov	x0, x22
 461a640: 96e7e72f     	bl	0x142fc <_ChromeMain+0xf060>
 461a644: a900fef6     	stp	x22, xzr, [x23, #0x8]
 461a648: f9435260     	ldr	x0, [x19, #0x6a0]
 461a64c: f9035277     	str	x23, [x19, #0x6a0]
 461a650: b4000080     	cbz	x0, 0x461a660 <_ChromeMain+0x46153c4>
 461a654: 978a8232     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 461a658: 52800301     	mov	w1, #0x18               ; =24
 461a65c: 96e7ba17     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461a660: 2d5106a0     	ldp	s0, s1, [x21, #0x88]
 461a664: 1e254000     	frintm	s0, s0
 461a668: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 461a66c: 1e222000     	fcmp	s0, s2
 461a670: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 461a674: 1a88b3e9     	csel	w9, wzr, w8, lt
 461a678: 1e226803     	fmaxnm	s3, s0, s2
 461a67c: 1e38006a     	fcvtzs	w10, s3
 461a680: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 461a684: 1e270163     	fmov	s3, w11
 461a688: 1e232000     	fcmp	s0, s3
 461a68c: 1a899149     	csel	w9, w10, w9, ls
 461a690: 1e254020     	frintm	s0, s1
 461a694: 1e222000     	fcmp	s0, s2
 461a698: 1a88b3e8     	csel	w8, wzr, w8, lt
 461a69c: 1e226801     	fmaxnm	s1, s0, s2
 461a6a0: 1e38002a     	fcvtzs	w10, s1
 461a6a4: 1e232000     	fcmp	s0, s3
 461a6a8: 1a889148     	csel	w8, w10, w8, ls
 461a6ac: aa088128     	orr	x8, x9, x8, lsl #32
 461a6b0: f81a83a8     	stur	x8, [x29, #-0x58]
 461a6b4: d10163a1     	sub	x1, x29, #0x58
 461a6b8: aa1403e0     	mov	x0, x20
 461a6bc: 977424be     	bl	0x23239b4 <_ChromeMain+0x231e718>
 461a6c0: f9435274     	ldr	x20, [x19, #0x6a0]
 461a6c4: f9400268     	ldr	x8, [x19]
 461a6c8: f9403508     	ldr	x8, [x8, #0x68]
 461a6cc: aa1303e0     	mov	x0, x19
 461a6d0: d63f0100     	blr	x8
 461a6d4: aa0003f3     	mov	x19, x0
 461a6d8: f85a83a8     	ldur	x8, [x29, #-0x58]
 461a6dc: a906ffe8     	stp	x8, xzr, [sp, #0x68]
 461a6e0: 52800100     	mov	w0, #0x8                ; =8
 461a6e4: 96e7d321     	bl	0xf368 <_ChromeMain+0xa0cc>
 461a6e8: f900001f     	str	xzr, [x0]
 461a6ec: f90033e0     	str	x0, [sp, #0x60]
 461a6f0: 390133ff     	strb	wzr, [sp, #0x4c]
 461a6f4: 390173ff     	strb	wzr, [sp, #0x5c]
 461a6f8: 3900a3ff     	strb	wzr, [sp, #0x28]
 461a6fc: 390103ff     	strb	wzr, [sp, #0x40]
 461a700: 9100a3e8     	add	x8, sp, #0x28
 461a704: f90003e8     	str	x8, [sp]
 461a708: 9101a3e3     	add	x3, sp, #0x68
 461a70c: 910183e6     	add	x6, sp, #0x60
 461a710: 910133e7     	add	x7, sp, #0x4c
 461a714: aa1403e0     	mov	x0, x20
 461a718: aa1303e1     	mov	x1, x19
 461a71c: d2800002     	mov	x2, #0x0                ; =0
 461a720: 52800004     	mov	w4, #0x0                ; =0
 461a724: 52800025     	mov	w5, #0x1                ; =1
 461a728: 9581ffbc     	bl	0xa69a618 <_ChromeMain+0xa69537c>
 461a72c: 394103e8     	ldrb	w8, [sp, #0x40]
 461a730: 340000e8     	cbz	w8, 0x461a74c <_ChromeMain+0x46154b0>
 461a734: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461a738: 36f800a8     	tbz	w8, #0x1f, 0x461a74c <_ChromeMain+0x46154b0>
 461a73c: f94017e0     	ldr	x0, [sp, #0x28]
 461a740: f9401fe8     	ldr	x8, [sp, #0x38]
 461a744: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461a748: 96e7b9dc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461a74c: f94033f3     	ldr	x19, [sp, #0x60]
 461a750: f90033ff     	str	xzr, [sp, #0x60]
 461a754: b40000d3     	cbz	x19, 0x461a76c <_ChromeMain+0x46154d0>
 461a758: aa1303e0     	mov	x0, x19
 461a75c: 9501466f     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 461a760: aa1303e0     	mov	x0, x19
 461a764: 52800101     	mov	w1, #0x8                ; =8
 461a768: 96e7b9d4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461a76c: 52800037     	mov	w23, #0x1               ; =1
 461a770: 14000002     	b	0x461a778 <_ChromeMain+0x46154dc>
 461a774: 52800017     	mov	w23, #0x0               ; =0
 461a778: aa1703e0     	mov	x0, x23
 461a77c: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 461a780: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 461a784: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 461a788: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 461a78c: a94967fa     	ldp	x26, x25, [sp, #0x90]
 461a790: a9486ffc     	ldp	x28, x27, [sp, #0x80]
 461a794: 910383ff     	add	sp, sp, #0xe0
 461a798: d65f03c0     	ret
 461a79c: f9400268     	ldr	x8, [x19]
 461a7a0: f9403508     	ldr	x8, [x8, #0x68]
 461a7a4: aa1303e0     	mov	x0, x19
 461a7a8: d63f0100     	blr	x8
 461a7ac: b4fffe40     	cbz	x0, 0x461a774 <_ChromeMain+0x46154d8>
 461a7b0: f9428e68     	ldr	x8, [x19, #0x518]
 461a7b4: b4fffe08     	cbz	x8, 0x461a774 <_ChromeMain+0x46154d8>
 461a7b8: f9429268     	ldr	x8, [x19, #0x520]
 461a7bc: b4000388     	cbz	x8, 0x461a82c <_ChromeMain+0x4615590>
 461a7c0: f9434668     	ldr	x8, [x19, #0x688]
 461a7c4: b4000348     	cbz	x8, 0x461a82c <_ChromeMain+0x4615590>
 461a7c8: f941f288     	ldr	x8, [x20, #0x3e0]
 461a7cc: f9403101     	ldr	x1, [x8, #0x60]
 461a7d0: aa1303e0     	mov	x0, x19
 461a7d4: 97ffec27     	bl	0x4615870 <_ChromeMain+0x46105d4>
 461a7d8: d360fc08     	lsr	x8, x0, #32
 461a7dc: b4000288     	cbz	x8, 0x461a82c <_ChromeMain+0x4615590>
 461a7e0: aa0003f6     	mov	x22, x0
 461a7e4: f9400268     	ldr	x8, [x19]
 461a7e8: f9403508     	ldr	x8, [x8, #0x68]
 461a7ec: aa1303e0     	mov	x0, x19
 461a7f0: d63f0100     	blr	x8
 461a7f4: b4fffbc0     	cbz	x0, 0x461a76c <_ChromeMain+0x46154d0>
 461a7f8: f9434668     	ldr	x8, [x19, #0x688]
 461a7fc: b4fffb88     	cbz	x8, 0x461a76c <_ChromeMain+0x46154d0>
 461a800: f9429268     	ldr	x8, [x19, #0x520]
 461a804: b4fffb48     	cbz	x8, 0x461a76c <_ChromeMain+0x46154d0>
 461a808: 52800037     	mov	w23, #0x1               ; =1
 461a80c: 37fffb76     	tbnz	w22, #0x1f, 0x461a778 <_ChromeMain+0x46154dc>
 461a810: f9428e69     	ldr	x9, [x19, #0x518]
 461a814: b4fffb29     	cbz	x9, 0x461a778 <_ChromeMain+0x46154dc>
 461a818: f9400100     	ldr	x0, [x8]
 461a81c: b9401808     	ldr	w8, [x0, #0x18]
 461a820: 6b0802df     	cmp	w22, w8
 461a824: 54fffaaa     	b.ge	0x461a778 <_ChromeMain+0x46154dc>
 461a828: 14000166     	b	0x461adc0 <_ChromeMain+0x4615b24>
 461a82c: f941f288     	ldr	x8, [x20, #0x3e0]
 461a830: b4fff9e8     	cbz	x8, 0x461a76c <_ChromeMain+0x46154d0>
 461a834: b940f908     	ldr	w8, [x8, #0xf8]
 461a838: 35fff9a8     	cbnz	w8, 0x461a76c <_ChromeMain+0x46154d0>
 461a83c: f9400268     	ldr	x8, [x19]
 461a840: f9403508     	ldr	x8, [x8, #0x68]
 461a844: aa1303e0     	mov	x0, x19
 461a848: d63f0100     	blr	x8
 461a84c: b4fff900     	cbz	x0, 0x461a76c <_ChromeMain+0x46154d0>
 461a850: f941f296     	ldr	x22, [x20, #0x3e0]
 461a854: f944de68     	ldr	x8, [x19, #0x9b8]
 461a858: 91000508     	add	x8, x8, #0x1
 461a85c: f904de68     	str	x8, [x19, #0x9b8]
 461a860: f9435a60     	ldr	x0, [x19, #0x6b0]
 461a864: f9035a7f     	str	xzr, [x19, #0x6b0]
 461a868: b4000080     	cbz	x0, 0x461a878 <_ChromeMain+0x46155dc>
 461a86c: 978a81ac     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 461a870: 52800301     	mov	w1, #0x18               ; =24
 461a874: 96e7b991     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461a878: f9435660     	ldr	x0, [x19, #0x6a8]
 461a87c: f903567f     	str	xzr, [x19, #0x6a8]
 461a880: b4000080     	cbz	x0, 0x461a890 <_ChromeMain+0x46155f4>
 461a884: f9400008     	ldr	x8, [x0]
 461a888: f9400508     	ldr	x8, [x8, #0x8]
 461a88c: d63f0100     	blr	x8
 461a890: 3966a268     	ldrb	w8, [x19, #0x9a8]
 461a894: 34000048     	cbz	w8, 0x461a89c <_ChromeMain+0x4615600>
 461a898: 3926a27f     	strb	wzr, [x19, #0x9a8]
 461a89c: b909c67f     	str	wzr, [x19, #0x9c4]
 461a8a0: f94032c8     	ldr	x8, [x22, #0x60]
 461a8a4: f904d268     	str	x8, [x19, #0x9a0]
 461a8a8: 52800028     	mov	w8, #0x1                ; =1
 461a8ac: 3926a268     	strb	w8, [x19, #0x9a8]
 461a8b0: 52800800     	mov	w0, #0x40               ; =64
 461a8b4: 96e7d2ad     	bl	0xf368 <_ChromeMain+0xa0cc>
 461a8b8: aa0003f6     	mov	x22, x0
 461a8bc: 91140268     	add	x8, x19, #0x500
 461a8c0: f100027f     	cmp	x19, #0x0
 461a8c4: 9a8803f7     	csel	x23, xzr, x8, eq
 461a8c8: d004e668     	adrp	x8, 0xe2e8000 <dyld_stub_binder+0xe2e8000>
 461a8cc: 912da108     	add	x8, x8, #0xb68
 461a8d0: a9007c08     	stp	x8, xzr, [x0]
 461a8d4: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 461a8d8: f900081f     	str	xzr, [x0, #0x10]
 461a8dc: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 461a8e0: 90052cd9     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461a8e4: f9404729     	ldr	x9, [x25, #0x88]
 461a8e8: eb09011f     	cmp	x8, x9
 461a8ec: 54000061     	b.ne	0x461a8f8 <_ChromeMain+0x461565c>
 461a8f0: aa1703e0     	mov	x0, x23
 461a8f4: 96e7e682     	bl	0x142fc <_ChromeMain+0xf060>
 461a8f8: f90016d7     	str	x23, [x22, #0x28]
 461a8fc: 52800100     	mov	w0, #0x8                ; =8
 461a900: 96e7d29a     	bl	0xf368 <_ChromeMain+0xa0cc>
 461a904: b900001f     	str	wzr, [x0]
 461a908: 3900101f     	strb	wzr, [x0, #0x4]
 461a90c: b40000c0     	cbz	x0, 0x461a924 <_ChromeMain+0x4615688>
 461a910: 52800028     	mov	w8, #0x1                ; =1
 461a914: b8280008     	ldadd	w8, w8, [x0]
 461a918: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461a91c: 6b09011f     	cmp	w8, w9
 461a920: 540031e0     	b.eq	0x461af5c <_ChromeMain+0x4615cc0>
 461a924: a9035ac0     	stp	x0, x22, [x22, #0x30]
 461a928: f9435660     	ldr	x0, [x19, #0x6a8]
 461a92c: f9035676     	str	x22, [x19, #0x6a8]
 461a930: b40000a0     	cbz	x0, 0x461a944 <_ChromeMain+0x46156a8>
 461a934: f9400008     	ldr	x8, [x0]
 461a938: f9400508     	ldr	x8, [x8, #0x8]
 461a93c: d63f0100     	blr	x8
 461a940: f9435676     	ldr	x22, [x19, #0x6a8]
 461a944: 52800088     	mov	w8, #0x4                ; =4
 461a948: 3900ffe8     	strb	w8, [sp, #0x3f]
 461a94c: 9100a3e8     	add	x8, sp, #0x28
 461a950: 91002109     	add	x9, x8, #0x8
 461a954: b004cb6a     	adrp	x10, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461a958: 911d294a     	add	x10, x10, #0x74a
 461a95c: eb0a013f     	cmp	x9, x10
 461a960: fa4a8102     	ccmp	x8, x10, #0x2, hi
 461a964: 54002229     	b.ls	0x461ada8 <_ChromeMain+0x4615b0c>
 461a968: d28008a8     	mov	x8, #0x45               ; =69
 461a96c: f2a00c88     	movk	x8, #0x64, lsl #16
 461a970: f2c00d28     	movk	x8, #0x69, lsl #32
 461a974: f2e00e88     	movk	x8, #0x74, lsl #48
 461a978: f90017e8     	str	x8, [sp, #0x28]
 461a97c: 790063ff     	strh	wzr, [sp, #0x30]
 461a980: 9100a3f7     	add	x23, sp, #0x28
 461a984: 9100a3e2     	add	x2, sp, #0x28
 461a988: aa1603e0     	mov	x0, x22
 461a98c: 52800c81     	mov	w1, #0x64               ; =100
 461a990: 97462b5e     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 461a994: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461a998: 36f800a8     	tbz	w8, #0x1f, 0x461a9ac <_ChromeMain+0x4615710>
 461a99c: f94017e0     	ldr	x0, [sp, #0x28]
 461a9a0: f9401fe8     	ldr	x8, [sp, #0x38]
 461a9a4: d37ff901     	lsl	x1, x8, #1
 461a9a8: 96e7b944     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461a9ac: f9435660     	ldr	x0, [x19, #0x6a8]
 461a9b0: 528000c8     	mov	w8, #0x6                ; =6
 461a9b4: 3900ffe8     	strb	w8, [sp, #0x3f]
 461a9b8: 910032e9     	add	x9, x23, #0xc
 461a9bc: b004cb68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461a9c0: 911c6908     	add	x8, x8, #0x71a
 461a9c4: eb08013f     	cmp	x9, x8
 461a9c8: fa4882e2     	ccmp	x23, x8, #0x2, hi
 461a9cc: 54001ee9     	b.ls	0x461ada8 <_ChromeMain+0x4615b0c>
 461a9d0: 52800e89     	mov	w9, #0x74               ; =116
 461a9d4: 72a00ca9     	movk	w9, #0x65, lsl #16
 461a9d8: b90033e9     	str	w9, [sp, #0x30]
 461a9dc: f9400108     	ldr	x8, [x8]
 461a9e0: f90017e8     	str	x8, [sp, #0x28]
 461a9e4: 79006bff     	strh	wzr, [sp, #0x34]
 461a9e8: 9100a3e2     	add	x2, sp, #0x28
 461a9ec: 52800ca1     	mov	w1, #0x65               ; =101
 461a9f0: 97462b46     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 461a9f4: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461a9f8: 36f800a8     	tbz	w8, #0x1f, 0x461aa0c <_ChromeMain+0x4615770>
 461a9fc: f94017e0     	ldr	x0, [sp, #0x28]
 461aa00: f9401fe8     	ldr	x8, [sp, #0x38]
 461aa04: d37ff901     	lsl	x1, x8, #1
 461aa08: 96e7b92c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461aa0c: f9435660     	ldr	x0, [x19, #0x6a8]
 461aa10: 52800001     	mov	w1, #0x0                ; =0
 461aa14: 979e6ee8     	bl	0x2db65b4 <_ChromeMain+0x2db1318>
 461aa18: f9435676     	ldr	x22, [x19, #0x6a8]
 461aa1c: 52800800     	mov	w0, #0x40               ; =64
 461aa20: 96e7d252     	bl	0xf368 <_ChromeMain+0xa0cc>
 461aa24: f90017e0     	str	x0, [sp, #0x28]
 461aa28: b004c908     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 461aa2c: 3dc11900     	ldr	q0, [x8, #0x460]
 461aa30: 3c8303e0     	stur	q0, [sp, #0x30]
 461aa34: 9100c009     	add	x9, x0, #0x30
 461aa38: eb00013f     	cmp	x9, x0
 461aa3c: 54001b63     	b.lo	0x461ada8 <_ChromeMain+0x4615b0c>
 461aa40: b004cb68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461aa44: 911d5108     	add	x8, x8, #0x754
 461aa48: eb08013f     	cmp	x9, x8
 461aa4c: fa488002     	ccmp	x0, x8, #0x2, hi
 461aa50: 54001ac9     	b.ls	0x461ada8 <_ChromeMain+0x4615b0c>
 461aa54: ad400500     	ldp	q0, q1, [x8]
 461aa58: ad000400     	stp	q0, q1, [x0]
 461aa5c: 3dc00900     	ldr	q0, [x8, #0x20]
 461aa60: 3d800800     	str	q0, [x0, #0x20]
 461aa64: 7900601f     	strh	wzr, [x0, #0x30]
 461aa68: 9100a3e2     	add	x2, sp, #0x28
 461aa6c: aa1603e0     	mov	x0, x22
 461aa70: 52800cc1     	mov	w1, #0x66               ; =102
 461aa74: 97462b25     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 461aa78: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461aa7c: 36f800a8     	tbz	w8, #0x1f, 0x461aa90 <_ChromeMain+0x46157f4>
 461aa80: f94017e0     	ldr	x0, [sp, #0x28]
 461aa84: f9401fe8     	ldr	x8, [sp, #0x38]
 461aa88: d37ff901     	lsl	x1, x8, #1
 461aa8c: 96e7b90b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461aa90: f9435676     	ldr	x22, [x19, #0x6a8]
 461aa94: 52800600     	mov	w0, #0x30               ; =48
 461aa98: 96e7d234     	bl	0xf368 <_ChromeMain+0xa0cc>
 461aa9c: f90017e0     	str	x0, [sp, #0x28]
 461aaa0: b004c928     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 461aaa4: 3dc16d00     	ldr	q0, [x8, #0x5b0]
 461aaa8: 3c8303e0     	stur	q0, [sp, #0x30]
 461aaac: 9100a809     	add	x9, x0, #0x2a
 461aab0: eb00013f     	cmp	x9, x0
 461aab4: 540017a3     	b.lo	0x461ada8 <_ChromeMain+0x4615b0c>
 461aab8: b004cb68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461aabc: 911e1908     	add	x8, x8, #0x786
 461aac0: eb08013f     	cmp	x9, x8
 461aac4: fa488002     	ccmp	x0, x8, #0x2, hi
 461aac8: 54001709     	b.ls	0x461ada8 <_ChromeMain+0x4615b0c>
 461aacc: ad400500     	ldp	q0, q1, [x8]
 461aad0: ad000400     	stp	q0, q1, [x0]
 461aad4: 3cc1a100     	ldur	q0, [x8, #0x1a]
 461aad8: 3c81a000     	stur	q0, [x0, #0x1a]
 461aadc: 7900541f     	strh	wzr, [x0, #0x2a]
 461aae0: 9100a3e2     	add	x2, sp, #0x28
 461aae4: aa1603e0     	mov	x0, x22
 461aae8: 52800ce1     	mov	w1, #0x67               ; =103
 461aaec: 97462b07     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 461aaf0: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461aaf4: 36f800a8     	tbz	w8, #0x1f, 0x461ab08 <_ChromeMain+0x461586c>
 461aaf8: f94017e0     	ldr	x0, [sp, #0x28]
 461aafc: f9401fe8     	ldr	x8, [sp, #0x38]
 461ab00: d37ff901     	lsl	x1, x8, #1
 461ab04: 96e7b8ed     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461ab08: f9435676     	ldr	x22, [x19, #0x6a8]
 461ab0c: 52800400     	mov	w0, #0x20               ; =32
 461ab10: 96e7d216     	bl	0xf368 <_ChromeMain+0xa0cc>
 461ab14: f90017e0     	str	x0, [sp, #0x28]
 461ab18: b004c928     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 461ab1c: 3dc04100     	ldr	q0, [x8, #0x100]
 461ab20: 3c8303e0     	stur	q0, [sp, #0x30]
 461ab24: 91007809     	add	x9, x0, #0x1e
 461ab28: eb00013f     	cmp	x9, x0
 461ab2c: 540013e3     	b.lo	0x461ada8 <_ChromeMain+0x4615b0c>
 461ab30: b004cb68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461ab34: 911ec908     	add	x8, x8, #0x7b2
 461ab38: eb08013f     	cmp	x9, x8
 461ab3c: fa488002     	ccmp	x0, x8, #0x2, hi
 461ab40: 54001349     	b.ls	0x461ada8 <_ChromeMain+0x4615b0c>
 461ab44: 3dc00100     	ldr	q0, [x8]
 461ab48: 3d800000     	str	q0, [x0]
 461ab4c: 3cc0e100     	ldur	q0, [x8, #0xe]
 461ab50: 3c80e000     	stur	q0, [x0, #0xe]
 461ab54: 79003c1f     	strh	wzr, [x0, #0x1e]
 461ab58: 9100a3e2     	add	x2, sp, #0x28
 461ab5c: aa1603e0     	mov	x0, x22
 461ab60: 52800d01     	mov	w1, #0x68               ; =104
 461ab64: 97462ae9     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 461ab68: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461ab6c: 36f800a8     	tbz	w8, #0x1f, 0x461ab80 <_ChromeMain+0x46158e4>
 461ab70: f94017e0     	ldr	x0, [sp, #0x28]
 461ab74: f9401fe8     	ldr	x8, [sp, #0x38]
 461ab78: d37ff901     	lsl	x1, x8, #1
 461ab7c: 96e7b8cf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461ab80: f9435676     	ldr	x22, [x19, #0x6a8]
 461ab84: 52800600     	mov	w0, #0x30               ; =48
 461ab88: 96e7d1f8     	bl	0xf368 <_ChromeMain+0xa0cc>
 461ab8c: f90017e0     	str	x0, [sp, #0x28]
 461ab90: b004c928     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 461ab94: 3dc08100     	ldr	q0, [x8, #0x200]
 461ab98: 3c8303e0     	stur	q0, [sp, #0x30]
 461ab9c: 91009009     	add	x9, x0, #0x24
 461aba0: eb00013f     	cmp	x9, x0
 461aba4: 54001023     	b.lo	0x461ada8 <_ChromeMain+0x4615b0c>
 461aba8: 3d8007e0     	str	q0, [sp, #0x10]
 461abac: b004cb68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461abb0: 911f4908     	add	x8, x8, #0x7d2
 461abb4: eb08013f     	cmp	x9, x8
 461abb8: fa488002     	ccmp	x0, x8, #0x2, hi
 461abbc: 54000f69     	b.ls	0x461ada8 <_ChromeMain+0x4615b0c>
 461abc0: 52800de9     	mov	w9, #0x6f               ; =111
 461abc4: 72a00ee9     	movk	w9, #0x77, lsl #16
 461abc8: b9002009     	str	w9, [x0, #0x20]
 461abcc: ad400500     	ldp	q0, q1, [x8]
 461abd0: ad000400     	stp	q0, q1, [x0]
 461abd4: 7900481f     	strh	wzr, [x0, #0x24]
 461abd8: 9100a3e2     	add	x2, sp, #0x28
 461abdc: aa1603e0     	mov	x0, x22
 461abe0: 52800d21     	mov	w1, #0x69               ; =105
 461abe4: 97462ac9     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 461abe8: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461abec: 36f800a8     	tbz	w8, #0x1f, 0x461ac00 <_ChromeMain+0x4615964>
 461abf0: f94017e0     	ldr	x0, [sp, #0x28]
 461abf4: f9401fe8     	ldr	x8, [sp, #0x38]
 461abf8: d37ff901     	lsl	x1, x8, #1
 461abfc: 96e7b8af     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461ac00: f9435676     	ldr	x22, [x19, #0x6a8]
 461ac04: 52800600     	mov	w0, #0x30               ; =48
 461ac08: 96e7d1d8     	bl	0xf368 <_ChromeMain+0xa0cc>
 461ac0c: f90017e0     	str	x0, [sp, #0x28]
 461ac10: 3dc007e0     	ldr	q0, [sp, #0x10]
 461ac14: 3c8303e0     	stur	q0, [sp, #0x30]
 461ac18: 91009009     	add	x9, x0, #0x24
 461ac1c: eb00013f     	cmp	x9, x0
 461ac20: 54000c43     	b.lo	0x461ada8 <_ChromeMain+0x4615b0c>
 461ac24: b004cb68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461ac28: 911fe108     	add	x8, x8, #0x7f8
 461ac2c: eb08013f     	cmp	x9, x8
 461ac30: fa488002     	ccmp	x0, x8, #0x2, hi
 461ac34: 54000ba9     	b.ls	0x461ada8 <_ChromeMain+0x4615b0c>
 461ac38: 52800ca9     	mov	w9, #0x65               ; =101
 461ac3c: 72a00ee9     	movk	w9, #0x77, lsl #16
 461ac40: b9002009     	str	w9, [x0, #0x20]
 461ac44: ad400500     	ldp	q0, q1, [x8]
 461ac48: ad000400     	stp	q0, q1, [x0]
 461ac4c: 7900481f     	strh	wzr, [x0, #0x24]
 461ac50: 9100a3e2     	add	x2, sp, #0x28
 461ac54: aa1603e0     	mov	x0, x22
 461ac58: 52800d41     	mov	w1, #0x6a               ; =106
 461ac5c: 97462aab     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 461ac60: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 461ac64: 36f800a8     	tbz	w8, #0x1f, 0x461ac78 <_ChromeMain+0x46159dc>
 461ac68: f94017e0     	ldr	x0, [sp, #0x28]
 461ac6c: f9401fe8     	ldr	x8, [sp, #0x38]
 461ac70: d37ff901     	lsl	x1, x8, #1
 461ac74: 96e7b891     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461ac78: f944de77     	ldr	x23, [x19, #0x9b8]
 461ac7c: f9435676     	ldr	x22, [x19, #0x6a8]
 461ac80: f9451a7a     	ldr	x26, [x19, #0xa30]
 461ac84: b40000da     	cbz	x26, 0x461ac9c <_ChromeMain+0x4615a00>
 461ac88: 52800028     	mov	w8, #0x1                ; =1
 461ac8c: b8280348     	ldadd	w8, w8, [x26]
 461ac90: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461ac94: 6b09011f     	cmp	w8, w9
 461ac98: 54001680     	b.eq	0x461af68 <_ChromeMain+0x4615ccc>
 461ac9c: f9451e7b     	ldr	x27, [x19, #0xa38]
 461aca0: 52800900     	mov	w0, #0x48               ; =72
 461aca4: 96e7d1b1     	bl	0xf368 <_ChromeMain+0xa0cc>
 461aca8: aa0003f8     	mov	x24, x0
 461acac: 52800028     	mov	w8, #0x1                ; =1
 461acb0: b9000008     	str	w8, [x0]
 461acb4: b0ffcc28     	adrp	x8, 0x3f9f000 <_ChromeMain+0x3f99d64>
 461acb8: 91050108     	add	x8, x8, #0x140
 461acbc: d0ffca89     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 461acc0: 91250129     	add	x9, x9, #0x940
 461acc4: a900a408     	stp	x8, x9, [x0, #0x8]
 461acc8: 90ffd4a8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 461accc: 911b0108     	add	x8, x8, #0x6c0
 461acd0: 1000a7a9     	adr	x9, 0x461c1c4 <_ChromeMain+0x4616f28>
 461acd4: d503201f     	nop
 461acd8: a901a408     	stp	x8, x9, [x0, #0x18]
 461acdc: a902e81f     	stp	xzr, x26, [x0, #0x28]
 461ace0: a903dc1b     	stp	x27, x23, [x0, #0x38]
 461ace4: 52800300     	mov	w0, #0x18               ; =24
 461ace8: 96e7d1a0     	bl	0xf368 <_ChromeMain+0xa0cc>
 461acec: aa0003f7     	mov	x23, x0
 461acf0: 52800128     	mov	w8, #0x9                ; =9
 461acf4: b9000008     	str	w8, [x0]
 461acf8: aa1603e0     	mov	x0, x22
 461acfc: 52800121     	mov	w1, #0x9                ; =9
 461ad00: aa1803e2     	mov	x2, x24
 461ad04: 97add5ff     	bl	0x3190500 <_ChromeMain+0x318b264>
 461ad08: aa0003f6     	mov	x22, x0
 461ad0c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461ad10: f9404729     	ldr	x9, [x25, #0x88]
 461ad14: eb09011f     	cmp	x8, x9
 461ad18: 54000061     	b.ne	0x461ad24 <_ChromeMain+0x4615a88>
 461ad1c: aa1603e0     	mov	x0, x22
 461ad20: 96e7e577     	bl	0x142fc <_ChromeMain+0xf060>
 461ad24: a900fef6     	stp	x22, xzr, [x23, #0x8]
 461ad28: f9435a60     	ldr	x0, [x19, #0x6b0]
 461ad2c: f9035a77     	str	x23, [x19, #0x6b0]
 461ad30: b4000080     	cbz	x0, 0x461ad40 <_ChromeMain+0x4615aa4>
 461ad34: 978a807a     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 461ad38: 52800301     	mov	w1, #0x18               ; =24
 461ad3c: 96e7b85f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461ad40: 2d5106a0     	ldp	s0, s1, [x21, #0x88]
 461ad44: 1e254000     	frintm	s0, s0
 461ad48: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 461ad4c: 1e222000     	fcmp	s0, s2
 461ad50: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 461ad54: 1a88b3e9     	csel	w9, wzr, w8, lt
 461ad58: 1e226803     	fmaxnm	s3, s0, s2
 461ad5c: 1e38006a     	fcvtzs	w10, s3
 461ad60: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 461ad64: 1e270163     	fmov	s3, w11
 461ad68: 1e232000     	fcmp	s0, s3
 461ad6c: 1a899149     	csel	w9, w10, w9, ls
 461ad70: 1e254020     	frintm	s0, s1
 461ad74: 1e222000     	fcmp	s0, s2
 461ad78: 1a88b3e8     	csel	w8, wzr, w8, lt
 461ad7c: 1e226801     	fmaxnm	s1, s0, s2
 461ad80: 1e38002a     	fcvtzs	w10, s1
 461ad84: 1e232000     	fcmp	s0, s3
 461ad88: 1a889148     	csel	w8, w10, w8, ls
 461ad8c: aa088128     	orr	x8, x9, x8, lsl #32
 461ad90: f81a83a8     	stur	x8, [x29, #-0x58]
 461ad94: d10163a1     	sub	x1, x29, #0x58
 461ad98: aa1403e0     	mov	x0, x20
 461ad9c: 97742306     	bl	0x23239b4 <_ChromeMain+0x231e718>
 461ada0: f9435a74     	ldr	x20, [x19, #0x6b0]
 461ada4: 17fffe48     	b	0x461a6c4 <_ChromeMain+0x4615428>
 461ada8: d4200020     	brk	#0x1
 461adac: 94d273ba     	bl	0x7ab7c94 <_ChromeMain+0x7ab29f8>
 461adb0: 52800601     	mov	w1, #0x30               ; =48
 461adb4: 96e7b841     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461adb8: f9434a77     	ldr	x23, [x19, #0x690]
 461adbc: 1400001a     	b	0x461ae24 <_ChromeMain+0x4615b88>
 461adc0: 92407ac1     	and	x1, x22, #0x7fffffff
 461adc4: 97290d4d     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 461adc8: b9401019     	ldr	w25, [x0, #0x10]
 461adcc: 52800600     	mov	w0, #0x30               ; =48
 461add0: 96e7d166     	bl	0xf368 <_ChromeMain+0xa0cc>
 461add4: aa0003f7     	mov	x23, x0
 461add8: 91144268     	add	x8, x19, #0x510
 461addc: f100027f     	cmp	x19, #0x0
 461ade0: 9a8803f8     	csel	x24, xzr, x8, eq
 461ade4: 9004de88     	adrp	x8, 0xe1ea000 <dyld_stub_binder+0xe1ea000>
 461ade8: 912ac108     	add	x8, x8, #0xab0
 461adec: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 461adf0: f9000008     	str	x8, [x0]
 461adf4: b9001819     	str	w25, [x0, #0x18]
 461adf8: 925e7708     	and	x8, x24, #0xfffffffc00000000
 461adfc: 90052cc9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461ae00: f9404529     	ldr	x9, [x9, #0x88]
 461ae04: eb09011f     	cmp	x8, x9
 461ae08: 54000061     	b.ne	0x461ae14 <_ChromeMain+0x4615b78>
 461ae0c: aa1803e0     	mov	x0, x24
 461ae10: 96e7e53b     	bl	0x142fc <_ChromeMain+0xf060>
 461ae14: a9027ef8     	stp	x24, xzr, [x23, #0x20]
 461ae18: f9434a60     	ldr	x0, [x19, #0x690]
 461ae1c: f9034a77     	str	x23, [x19, #0x690]
 461ae20: b5fffc60     	cbnz	x0, 0x461adac <_ChromeMain+0x4615b10>
 461ae24: f9428e68     	ldr	x8, [x19, #0x518]
 461ae28: f940bd08     	ldr	x8, [x8, #0x178]
 461ae2c: f9412118     	ldr	x24, [x8, #0x240]
 461ae30: f9429279     	ldr	x25, [x19, #0x520]
 461ae34: 52801700     	mov	w0, #0xb8               ; =184
 461ae38: 96e7d14c     	bl	0xf368 <_ChromeMain+0xa0cc>
 461ae3c: aa0003fa     	mov	x26, x0
 461ae40: aa1703e1     	mov	x1, x23
 461ae44: aa1803e2     	mov	x2, x24
 461ae48: aa1903e3     	mov	x3, x25
 461ae4c: aa1603e4     	mov	x4, x22
 461ae50: 94dcb51c     	bl	0x7d482c0 <_ChromeMain+0x7d43024>
 461ae54: f9434a76     	ldr	x22, [x19, #0x690]
 461ae58: 52800500     	mov	w0, #0x28               ; =40
 461ae5c: 96e7d143     	bl	0xf368 <_ChromeMain+0xa0cc>
 461ae60: aa0003e3     	mov	x3, x0
 461ae64: 52800028     	mov	w8, #0x1                ; =1
 461ae68: 90fdcfc9     	adrp	x9, 0x12000 <_ChromeMain+0xcd64>
 461ae6c: 91370129     	add	x9, x9, #0xdc0
 461ae70: b0fe502a     	adrp	x10, 0x101f000 <_ChromeMain+0x1019d64>
 461ae74: 9118014a     	add	x10, x10, #0x600
 461ae78: b9000008     	str	w8, [x0]
 461ae7c: a900a809     	stp	x9, x10, [x0, #0x8]
 461ae80: f0fefa08     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 461ae84: 912c0108     	add	x8, x8, #0xb00
 461ae88: f9000c08     	str	x8, [x0, #0x18]
 461ae8c: aa1603e0     	mov	x0, x22
 461ae90: aa1a03e1     	mov	x1, x26
 461ae94: d2800002     	mov	x2, #0x0                ; =0
 461ae98: 94d273ac     	bl	0x7ab7d48 <_ChromeMain+0x7ab2aac>
 461ae9c: 2d5106a0     	ldp	s0, s1, [x21, #0x88]
 461aea0: 1e254000     	frintm	s0, s0
 461aea4: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 461aea8: 1e222000     	fcmp	s0, s2
 461aeac: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 461aeb0: 1a88b3e9     	csel	w9, wzr, w8, lt
 461aeb4: 1e226803     	fmaxnm	s3, s0, s2
 461aeb8: 1e38006a     	fcvtzs	w10, s3
 461aebc: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 461aec0: 1e270163     	fmov	s3, w11
 461aec4: 1e232000     	fcmp	s0, s3
 461aec8: 1a899149     	csel	w9, w10, w9, ls
 461aecc: 1e254020     	frintm	s0, s1
 461aed0: 1e222000     	fcmp	s0, s2
 461aed4: 1a88b3e8     	csel	w8, wzr, w8, lt
 461aed8: 1e226801     	fmaxnm	s1, s0, s2
 461aedc: 1e38002a     	fcvtzs	w10, s1
 461aee0: 1e232000     	fcmp	s0, s3
 461aee4: 1a889148     	csel	w8, w10, w8, ls
 461aee8: aa088128     	orr	x8, x9, x8, lsl #32
 461aeec: f90017e8     	str	x8, [sp, #0x28]
 461aef0: f9400268     	ldr	x8, [x19]
 461aef4: f9403508     	ldr	x8, [x8, #0x68]
 461aef8: aa1303e0     	mov	x0, x19
 461aefc: d63f0100     	blr	x8
 461af00: f940c801     	ldr	x1, [x0, #0x190]
 461af04: b4000081     	cbz	x1, 0x461af14 <_ChromeMain+0x4615c78>
 461af08: 9100a3e2     	add	x2, sp, #0x28
 461af0c: aa1403e0     	mov	x0, x20
 461af10: 9582fed0     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 461af14: f9434a74     	ldr	x20, [x19, #0x690]
 461af18: f9400268     	ldr	x8, [x19]
 461af1c: f9403508     	ldr	x8, [x8, #0x68]
 461af20: aa1303e0     	mov	x0, x19
 461af24: d63f0100     	blr	x8
 461af28: aa0003e3     	mov	x3, x0
 461af2c: 52800037     	mov	w23, #0x1               ; =1
 461af30: 9100a3e1     	add	x1, sp, #0x28
 461af34: aa1403e0     	mov	x0, x20
 461af38: 52800022     	mov	w2, #0x1                ; =1
 461af3c: 94d273c4     	bl	0x7ab7e4c <_ChromeMain+0x7ab2bb0>
 461af40: 17fffe0e     	b	0x461a778 <_ChromeMain+0x46154dc>
 461af44: d4200000     	brk	#0
 461af48: d4400000     	hlt	#0
 461af4c: 17ffff97     	b	0x461ada8 <_ChromeMain+0x4615b0c>
 461af50: d4200000     	brk	#0
 461af54: d4400000     	hlt	#0
 461af58: d4200020     	brk	#0x1
 461af5c: d4200000     	brk	#0
 461af60: d4400000     	hlt	#0
 461af64: d4200020     	brk	#0x1
 461af68: d4200000     	brk	#0
 461af6c: d4400000     	hlt	#0
 461af70: d4200020     	brk	#0x1
