
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45e7000: b4000088     	cbz	x8, 0x45e7010 <_ChromeMain+0x45e1d74>
 45e7004: f943ad00     	ldr	x0, [x8, #0x758]
 45e7008: b50000a0     	cbnz	x0, 0x45e701c <_ChromeMain+0x45e1d80>
 45e700c: d65f03c0     	ret
 45e7010: d4200000     	brk	#0
 45e7014: d4400000     	hlt	#0
 45e7018: d4200020     	brk	#0x1
 45e701c: f9400008     	ldr	x8, [x0]
 45e7020: f9400901     	ldr	x1, [x8, #0x10]
 45e7024: d61f0020     	br	x1
 45e7028: f9400408     	ldr	x8, [x0, #0x8]
 45e702c: b40000e8     	cbz	x8, 0x45e7048 <_ChromeMain+0x45e1dac>
 45e7030: f9429d08     	ldr	x8, [x8, #0x538]
 45e7034: f940d108     	ldr	x8, [x8, #0x1a0]
 45e7038: f9409108     	ldr	x8, [x8, #0x120]
 45e703c: f100011f     	cmp	x8, #0x0
 45e7040: 1a9f07e0     	cset	w0, ne
 45e7044: d65f03c0     	ret
 45e7048: d4200000     	brk	#0
 45e704c: d4400000     	hlt	#0
 45e7050: d4200020     	brk	#0x1
		...
 45e7060: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45e7064: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45e7068: 910043fd     	add	x29, sp, #0x10
 45e706c: aa0003f3     	mov	x19, x0
 45e7070: f9401400     	ldr	x0, [x0, #0x28]
 45e7074: 9703649e     	bl	0x6c02ec <_ChromeMain+0x6bb050>
 45e7078: f9400260     	ldr	x0, [x19]
 45e707c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45e7080: f0052e49     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45e7084: f9404529     	ldr	x9, [x9, #0x88]
 45e7088: eb09011f     	cmp	x8, x9
 45e708c: 54000041     	b.ne	0x45e7094 <_ChromeMain+0x45e1df8>
 45e7090: 96e8fe6d     	bl	0x26a44 <_ChromeMain+0x217a8>
 45e7094: f900027f     	str	xzr, [x19]
 45e7098: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45e709c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45e70a0: d65f03c0     	ret
		...
 45e70c0: d10343ff     	sub	sp, sp, #0xd0
 45e70c4: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 45e70c8: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 45e70cc: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 45e70d0: 910303fd     	add	x29, sp, #0xc0
 45e70d4: aa0103f5     	mov	x21, x1
 45e70d8: aa0003f4     	mov	x20, x0
 45e70dc: aa0803f3     	mov	x19, x8
 45e70e0: 6f00e400     	movi.2d	v0, #0000000000000000
 45e70e4: ad000100     	stp	q0, q0, [x8]
 45e70e8: 3c820d00     	str	q0, [x8, #0x20]!
 45e70ec: f9000e68     	str	x8, [x19, #0x18]
 45e70f0: f9401c01     	ldr	x1, [x0, #0x38]
 45e70f4: b40000a1     	cbz	x1, 0x45e7108 <_ChromeMain+0x45e1e6c>
 45e70f8: aa1303e0     	mov	x0, x19
 45e70fc: aa1503e2     	mov	x2, x21
 45e7100: d2800003     	mov	x3, #0x0                ; =0
 45e7104: 97036414     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7108: f9402681     	ldr	x1, [x20, #0x48]
 45e710c: b40000c1     	cbz	x1, 0x45e7124 <_ChromeMain+0x45e1e88>
 45e7110: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 45e7114: 910183e2     	add	x2, sp, #0x60
 45e7118: aa1303e0     	mov	x0, x19
 45e711c: 52802003     	mov	w3, #0x100              ; =256
 45e7120: 9703640d     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7124: f9405e81     	ldr	x1, [x20, #0xb8]
 45e7128: f9401a88     	ldr	x8, [x20, #0x30]
 45e712c: f100003f     	cmp	x1, #0x0
 45e7130: fa401904     	ccmp	x8, #0x0, #0x4, ne
 45e7134: 54000140     	b.eq	0x45e715c <_ChromeMain+0x45e1ec0>
 45e7138: f940c429     	ldr	x9, [x1, #0x188]
 45e713c: eb08013f     	cmp	x9, x8
 45e7140: 540000e1     	b.ne	0x45e715c <_ChromeMain+0x45e1ec0>
 45e7144: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 45e7148: 910183e2     	add	x2, sp, #0x60
 45e714c: aa1303e0     	mov	x0, x19
 45e7150: 52802003     	mov	w3, #0x100              ; =256
 45e7154: 97036400     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7158: f9401a88     	ldr	x8, [x20, #0x30]
 45e715c: ad4006a0     	ldp	q0, q1, [x21]
 45e7160: ad0307e0     	stp	q0, q1, [sp, #0x60]
 45e7164: 3dc00aa0     	ldr	q0, [x21, #0x20]
 45e7168: 3d8023e0     	str	q0, [sp, #0x80]
 45e716c: f9402e81     	ldr	x1, [x20, #0x58]
 45e7170: b40000a1     	cbz	x1, 0x45e7184 <_ChromeMain+0x45e1ee8>
 45e7174: b4000088     	cbz	x8, 0x45e7184 <_ChromeMain+0x45e1ee8>
 45e7178: f940c429     	ldr	x9, [x1, #0x188]
 45e717c: eb08013f     	cmp	x9, x8
 45e7180: 54000d60     	b.eq	0x45e732c <_ChromeMain+0x45e2090>
 45e7184: f9405689     	ldr	x9, [x20, #0xa8]
 45e7188: b4000809     	cbz	x9, 0x45e7288 <_ChromeMain+0x45e1fec>
 45e718c: b40007e8     	cbz	x8, 0x45e7288 <_ChromeMain+0x45e1fec>
 45e7190: f940c529     	ldr	x9, [x9, #0x188]
 45e7194: eb08013f     	cmp	x9, x8
 45e7198: 54000781     	b.ne	0x45e7288 <_ChromeMain+0x45e1fec>
 45e719c: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 45e71a0: f9401696     	ldr	x22, [x20, #0x28]
 45e71a4: f94006c8     	ldr	x8, [x22, #0x8]
 45e71a8: b40012e8     	cbz	x8, 0x45e7404 <_ChromeMain+0x45e2168>
 45e71ac: f9432115     	ldr	x21, [x8, #0x640]
 45e71b0: b4000bb5     	cbz	x21, 0x45e7324 <_ChromeMain+0x45e2088>
 45e71b4: b0044941     	adrp	x1, 0xcf10000 <dyld_stub_binder+0xcf10000>
 45e71b8: 91288021     	add	x1, x1, #0xa20
 45e71bc: aa1503e0     	mov	x0, x21
 45e71c0: 9707bab0     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 45e71c4: d360fc08     	lsr	x8, x0, #32
 45e71c8: b4000ae8     	cbz	x8, 0x45e7324 <_ChromeMain+0x45e2088>
 45e71cc: f94006c8     	ldr	x8, [x22, #0x8]
 45e71d0: b4001208     	cbz	x8, 0x45e7410 <_ChromeMain+0x45e2174>
 45e71d4: f940f909     	ldr	x9, [x8, #0x1f0]
 45e71d8: f9403129     	ldr	x9, [x9, #0x60]
 45e71dc: b0fe042a     	adrp	x10, 0x66c000 <_ChromeMain+0x666d64>
 45e71e0: 9139414a     	add	x10, x10, #0xe50
 45e71e4: eb0a013f     	cmp	x9, x10
 45e71e8: 54000901     	b.ne	0x45e7308 <_ChromeMain+0x45e206c>
 45e71ec: f941b900     	ldr	x0, [x8, #0x370]
 45e71f0: 972ff83c     	bl	0x11e52e0 <_ChromeMain+0x11e0044>
 45e71f4: 35001140     	cbnz	w0, 0x45e741c <_ChromeMain+0x45e2180>
 45e71f8: 294c5bf5     	ldp	w21, w22, [sp, #0x60]
 45e71fc: 1e2702a0     	fmov	s0, w21
 45e7200: 3d8007e0     	str	q0, [sp, #0x10]
 45e7204: f9401680     	ldr	x0, [x20, #0x28]
 45e7208: 97db01d9     	bl	0x3ca796c <_ChromeMain+0x3ca26d0>
 45e720c: 0b160016     	add	w22, w0, w22
 45e7210: fd4037e0     	ldr	d0, [sp, #0x68]
 45e7214: 3d8003e0     	str	q0, [sp]
 45e7218: f9405680     	ldr	x0, [x20, #0xa8]
 45e721c: b00487e1     	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 45e7220: 91382021     	add	x1, x1, #0xe08
 45e7224: 9707ba97     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 45e7228: d360fc08     	lsr	x8, x0, #32
 45e722c: 290a5bf5     	stp	w21, w22, [sp, #0x50]
 45e7230: ad4007e0     	ldp	q0, q1, [sp]
 45e7234: 4e0c1ec1     	mov.s	v1[1], w22
 45e7238: 4e0c1d00     	mov.s	v0[1], w8
 45e723c: 0ea00c20     	sqadd.2s	v0, v1, v0
 45e7240: 0ea12c00     	sqsub.2s	v0, v0, v1
 45e7244: 6f00e401     	movi.2d	v1, #0000000000000000
 45e7248: 0ea16400     	smax.2s	v0, v0, v1
 45e724c: 0e0c3c08     	mov.s	w8, v0[1]
 45e7250: fd002fe0     	str	d0, [sp, #0x58]
 45e7254: b94067e9     	ldr	w9, [sp, #0x64]
 45e7258: 0b160108     	add	w8, w8, w22
 45e725c: 4b090108     	sub	w8, w8, w9
 45e7260: a93d7fa8     	stp	x8, xzr, [x29, #-0x30]
 45e7264: 910183e0     	add	x0, sp, #0x60
 45e7268: d100c3a1     	sub	x1, x29, #0x30
 45e726c: 96f7974f     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e7270: 52802023     	mov	w3, #0x101              ; =257
 45e7274: f9405681     	ldr	x1, [x20, #0xa8]
 45e7278: 910143e2     	add	x2, sp, #0x50
 45e727c: aa1303e0     	mov	x0, x19
 45e7280: 970363b5     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7284: f9401a88     	ldr	x8, [x20, #0x30]
 45e7288: f9405a81     	ldr	x1, [x20, #0xb0]
 45e728c: b4000b61     	cbz	x1, 0x45e73f8 <_ChromeMain+0x45e215c>
 45e7290: b4000b48     	cbz	x8, 0x45e73f8 <_ChromeMain+0x45e215c>
 45e7294: f940c429     	ldr	x9, [x1, #0x188]
 45e7298: eb08013f     	cmp	x9, x8
 45e729c: 54000ae1     	b.ne	0x45e73f8 <_ChromeMain+0x45e215c>
 45e72a0: 39472028     	ldrb	w8, [x1, #0x1c8]
 45e72a4: 36000aa8     	tbz	w8, #0x0, 0x45e73f8 <_ChromeMain+0x45e215c>
 45e72a8: 3dc01be0     	ldr	q0, [sp, #0x60]
 45e72ac: 3c9d03a0     	stur	q0, [x29, #-0x30]
 45e72b0: b85dc3a8     	ldur	w8, [x29, #-0x24]
 45e72b4: b85d43a9     	ldur	w9, [x29, #-0x2c]
 45e72b8: 7100051f     	cmp	w8, #0x1
 45e72bc: 1a9fc508     	csinc	w8, w8, wzr, gt
 45e72c0: 2b080128     	adds	w8, w9, w8
 45e72c4: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 45e72c8: 1a886148     	csel	w8, w10, w8, vs
 45e72cc: 6b090108     	subs	w8, w8, w9
 45e72d0: 131f7d09     	asr	w9, w8, #31
 45e72d4: 52010129     	eor	w9, w9, #0x80000000
 45e72d8: 1a886128     	csel	w8, w9, w8, vs
 45e72dc: 0aa87d08     	bic	w8, w8, w8, asr #31
 45e72e0: b81dc3a8     	stur	w8, [x29, #-0x24]
 45e72e4: d100c3a2     	sub	x2, x29, #0x30
 45e72e8: aa1303e0     	mov	x0, x19
 45e72ec: d2800003     	mov	x3, #0x0                ; =0
 45e72f0: 97036399     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e72f4: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 45e72f8: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 45e72fc: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 45e7300: 910343ff     	add	sp, sp, #0xd0
 45e7304: d65f03c0     	ret
 45e7308: b0fe024a     	adrp	x10, 0x630000 <_ChromeMain+0x62ad64>
 45e730c: 9120c14a     	add	x10, x10, #0x830
 45e7310: eb0a013f     	cmp	x9, x10
 45e7314: 54fff6c0     	b.eq	0x45e71ec <_ChromeMain+0x45e1f50>
 45e7318: 9107c100     	add	x0, x8, #0x1f0
 45e731c: d63f0120     	blr	x9
 45e7320: 17ffffb4     	b	0x45e71f0 <_ChromeMain+0x45e1f54>
 45e7324: 52802003     	mov	w3, #0x100              ; =256
 45e7328: 17ffffd3     	b	0x45e7274 <_ChromeMain+0x45e1fd8>
 45e732c: a93d7fbf     	stp	xzr, xzr, [x29, #-0x30]
 45e7330: d100c3a2     	sub	x2, x29, #0x30
 45e7334: aa1303e0     	mov	x0, x19
 45e7338: d2800003     	mov	x3, #0x0                ; =0
 45e733c: 97036386     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7340: aa0003f5     	mov	x21, x0
 45e7344: 6f00e400     	movi.2d	v0, #0000000000000000
 45e7348: ad0103e0     	stp	q0, q0, [sp, #0x20]
 45e734c: 3d8013e0     	str	q0, [sp, #0x40]
 45e7350: 910183e0     	add	x0, sp, #0x60
 45e7354: 910183e1     	add	x1, sp, #0x60
 45e7358: 9739001b     	bl	0x14273c4 <_ChromeMain+0x1422128>
 45e735c: 36000680     	tbz	w0, #0x0, 0x45e742c <_ChromeMain+0x45e2190>
 45e7360: 910183e0     	add	x0, sp, #0x60
 45e7364: 910183e1     	add	x1, sp, #0x60
 45e7368: 96f79701     	bl	0x3ccf6c <_ChromeMain+0x3c7cd0>
 45e736c: a93d07a0     	stp	x0, x1, [x29, #-0x30]
 45e7370: ad4307e0     	ldp	q0, q1, [sp, #0x60]
 45e7374: ad0107e0     	stp	q0, q1, [sp, #0x20]
 45e7378: 3dc023e0     	ldr	q0, [sp, #0x80]
 45e737c: 3d8013e0     	str	q0, [sp, #0x40]
 45e7380: 910083e0     	add	x0, sp, #0x20
 45e7384: d100c3a1     	sub	x1, x29, #0x30
 45e7388: 96f79708     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e738c: f90013ff     	str	xzr, [sp, #0x20]
 45e7390: fd4017e0     	ldr	d0, [sp, #0x28]
 45e7394: 6f00e401     	movi.2d	v1, #0000000000000000
 45e7398: 0ea16400     	smax.2s	v0, v0, v1
 45e739c: fd0017e0     	str	d0, [sp, #0x28]
 45e73a0: 910083e2     	add	x2, sp, #0x20
 45e73a4: aa1403e0     	mov	x0, x20
 45e73a8: aa1503e1     	mov	x1, x21
 45e73ac: 95fff9e7     	bl	0xc5e5b48 <_ChromeMain+0xc5e08ac>
 45e73b0: a90507e0     	stp	x0, x1, [sp, #0x50]
 45e73b4: 910143e1     	add	x1, sp, #0x50
 45e73b8: 910183e2     	add	x2, sp, #0x60
 45e73bc: aa1403e0     	mov	x0, x20
 45e73c0: 97db01e6     	bl	0x3ca7b58 <_ChromeMain+0x3ca28bc>
 45e73c4: a90006a0     	stp	x0, x1, [x21]
 45e73c8: b94067e8     	ldr	w8, [sp, #0x64]
 45e73cc: d360fc29     	lsr	x9, x1, #32
 45e73d0: 8b408129     	add	x9, x9, x0, lsr #32
 45e73d4: 6b09011f     	cmp	w8, w9
 45e73d8: 1a89c109     	csel	w9, w8, w9, gt
 45e73dc: 4b080128     	sub	w8, w9, w8
 45e73e0: a93d7fa8     	stp	x8, xzr, [x29, #-0x30]
 45e73e4: 910183e0     	add	x0, sp, #0x60
 45e73e8: d100c3a1     	sub	x1, x29, #0x30
 45e73ec: 96f796ef     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e73f0: f9401a88     	ldr	x8, [x20, #0x30]
 45e73f4: 17ffff64     	b	0x45e7184 <_ChromeMain+0x45e1ee8>
 45e73f8: d4200000     	brk	#0
 45e73fc: d4400000     	hlt	#0
 45e7400: d4200020     	brk	#0x1
 45e7404: d4200000     	brk	#0
 45e7408: d4400000     	hlt	#0
 45e740c: d4200020     	brk	#0x1
 45e7410: d4200000     	brk	#0
 45e7414: d4400000     	hlt	#0
 45e7418: d4200020     	brk	#0x1
 45e741c: 9110c2a0     	add	x0, x21, #0x430
 45e7420: 957bbe38     	bl	0xa4d6d00 <_ChromeMain+0xa4d1a64>
 45e7424: 3607eea0     	tbz	w0, #0x0, 0x45e71f8 <_ChromeMain+0x45e1f5c>
 45e7428: 17ffffbf     	b	0x45e7324 <_ChromeMain+0x45e2088>
 45e742c: d4200000     	brk	#0
 45e7430: d4400000     	hlt	#0
 45e7434: d4200020     	brk	#0x1
 45e7438: d503201f     	nop
 45e743c: d503201f     	nop
 45e7440: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 45e7444: a9015ff8     	stp	x24, x23, [sp, #0x10]
 45e7448: a90257f6     	stp	x22, x21, [sp, #0x20]
 45e744c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 45e7450: a9047bfd     	stp	x29, x30, [sp, #0x40]
 45e7454: 910103fd     	add	x29, sp, #0x40
 45e7458: aa0103f5     	mov	x21, x1
 45e745c: aa0003f4     	mov	x20, x0
 45e7460: f9405000     	ldr	x0, [x0, #0xa0]
 45e7464: f9400008     	ldr	x8, [x0]
 45e7468: f9404508     	ldr	x8, [x8, #0x88]
 45e746c: d63f0100     	blr	x8
 45e7470: aa0003f3     	mov	x19, x0
 45e7474: d360fc18     	lsr	x24, x0, #32
 45e7478: f9401680     	ldr	x0, [x20, #0x28]
 45e747c: 972ff549     	bl	0x11e49a0 <_ChromeMain+0x11df704>
 45e7480: 37000080     	tbnz	w0, #0x0, 0x45e7490 <_ChromeMain+0x45e21f4>
 45e7484: f9401680     	ldr	x0, [x20, #0x28]
 45e7488: 972ff605     	bl	0x11e4c9c <_ChromeMain+0x11dfa00>
 45e748c: 14000019     	b	0x45e74f0 <_ChromeMain+0x45e2254>
 45e7490: bd4012a0     	ldr	s0, [x21, #0x10]
 45e7494: bd4022a1     	ldr	s1, [x21, #0x20]
 45e7498: 1e212800     	fadd	s0, s0, s1
 45e749c: bd401aa1     	ldr	s1, [x21, #0x18]
 45e74a0: bd402aa2     	ldr	s2, [x21, #0x28]
 45e74a4: 1e222821     	fadd	s1, s1, s2
 45e74a8: 1e212800     	fadd	s0, s0, s1
 45e74ac: 1e24c000     	frintp	s0, s0
 45e74b0: 0f0665e1     	movi.2s	v1, #0xcf, lsl #24
 45e74b4: 1e212000     	fcmp	s0, s1
 45e74b8: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 45e74bc: 1a88b3e8     	csel	w8, wzr, w8, lt
 45e74c0: 1e216801     	fmaxnm	s1, s0, s1
 45e74c4: 1e380029     	fcvtzs	w9, s1
 45e74c8: 12b6200a     	mov	w10, #0x4effffff        ; =1325400063
 45e74cc: 1e270141     	fmov	s1, w10
 45e74d0: 1e212000     	fcmp	s0, s1
 45e74d4: 1a889128     	csel	w8, w9, w8, ls
 45e74d8: 2b080268     	adds	w8, w19, w8
 45e74dc: 131f7d09     	asr	w9, w8, #31
 45e74e0: 52010129     	eor	w9, w9, #0x80000000
 45e74e4: 1a886128     	csel	w8, w9, w8, vs
 45e74e8: 0aa87d13     	bic	w19, w8, w8, asr #31
 45e74ec: 0ab87f18     	bic	w24, w24, w24, asr #31
 45e74f0: f9407680     	ldr	x0, [x20, #0xe8]
 45e74f4: b4000060     	cbz	x0, 0x45e7500 <_ChromeMain+0x45e2264>
 45e74f8: 39472008     	ldrb	w8, [x0, #0x1c8]
 45e74fc: 35000508     	cbnz	w8, 0x45e759c <_ChromeMain+0x45e2300>
 45e7500: 52800015     	mov	w21, #0x0               ; =0
 45e7504: 52800019     	mov	w25, #0x0               ; =0
 45e7508: f9405680     	ldr	x0, [x20, #0xa8]
 45e750c: f9400008     	ldr	x8, [x0]
 45e7510: f9404508     	ldr	x8, [x8, #0x88]
 45e7514: d63f0100     	blr	x8
 45e7518: aa0003f6     	mov	x22, x0
 45e751c: f9405a80     	ldr	x0, [x20, #0xb0]
 45e7520: f9400008     	ldr	x8, [x0]
 45e7524: f9404508     	ldr	x8, [x8, #0x88]
 45e7528: d63f0100     	blr	x8
 45e752c: aa0003f7     	mov	x23, x0
 45e7530: f9406680     	ldr	x0, [x20, #0xc8]
 45e7534: b40000c0     	cbz	x0, 0x45e754c <_ChromeMain+0x45e22b0>
 45e7538: 39472008     	ldrb	w8, [x0, #0x1c8]
 45e753c: 34000088     	cbz	w8, 0x45e754c <_ChromeMain+0x45e22b0>
 45e7540: 972ff5b4     	bl	0x11e4c10 <_ChromeMain+0x11df974>
 45e7544: 11032008     	add	w8, w0, #0xc8
 45e7548: 14000002     	b	0x45e7550 <_ChromeMain+0x45e22b4>
 45e754c: 52801908     	mov	w8, #0xc8               ; =200
 45e7550: 6b15027f     	cmp	w19, w21
 45e7554: 1a95c269     	csel	w9, w19, w21, gt
 45e7558: 6b16013f     	cmp	w9, w22
 45e755c: 1a96c129     	csel	w9, w9, w22, gt
 45e7560: d360feea     	lsr	x10, x23, #32
 45e7564: 6b08013f     	cmp	w9, w8
 45e7568: 1a88c128     	csel	w8, w9, w8, gt
 45e756c: 0aaa7d49     	bic	w9, w10, w10, asr #31
 45e7570: 0b18032a     	add	w10, w25, w24
 45e7574: 8b56814a     	add	x10, x10, x22, lsr #32
 45e7578: 0b090149     	add	w9, w10, w9
 45e757c: 0aa97d29     	bic	w9, w9, w9, asr #31
 45e7580: aa098100     	orr	x0, x8, x9, lsl #32
 45e7584: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 45e7588: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 45e758c: a94257f6     	ldp	x22, x21, [sp, #0x20]
 45e7590: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 45e7594: a8c567fa     	ldp	x26, x25, [sp], #0x50
 45e7598: d65f03c0     	ret
 45e759c: 94e37d01     	bl	0x7ec69a0 <_ChromeMain+0x7ec1704>
 45e75a0: aa0003f5     	mov	x21, x0
 45e75a4: d360fc19     	lsr	x25, x0, #32
 45e75a8: 17ffffd8     	b	0x45e7508 <_ChromeMain+0x45e226c>
 45e75ac: d503201f     	nop
 45e75b0: d503201f     	nop
 45e75b4: d503201f     	nop
 45e75b8: d503201f     	nop
 45e75bc: d503201f     	nop
 45e75c0: d10243ff     	sub	sp, sp, #0x90
 45e75c4: a90467fa     	stp	x26, x25, [sp, #0x40]
 45e75c8: a9055ff8     	stp	x24, x23, [sp, #0x50]
 45e75cc: a90657f6     	stp	x22, x21, [sp, #0x60]
 45e75d0: a9074ff4     	stp	x20, x19, [sp, #0x70]
 45e75d4: a9087bfd     	stp	x29, x30, [sp, #0x80]
 45e75d8: 910203fd     	add	x29, sp, #0x80
 45e75dc: aa0003f3     	mov	x19, x0
 45e75e0: 6f00e400     	movi.2d	v0, #0000000000000000
 45e75e4: ad0083e0     	stp	q0, q0, [sp, #0x10]
 45e75e8: 3d8003e0     	str	q0, [sp]
 45e75ec: f9401400     	ldr	x0, [x0, #0x28]
 45e75f0: 910003e8     	mov	x8, sp
 45e75f4: 52800021     	mov	w1, #0x1                ; =1
 45e75f8: 9738ff22     	bl	0x1427280 <_ChromeMain+0x1421fe4>
 45e75fc: f9401660     	ldr	x0, [x19, #0x28]
 45e7600: 972ff4e8     	bl	0x11e49a0 <_ChromeMain+0x11df704>
 45e7604: 37001140     	tbnz	w0, #0x0, 0x45e782c <_ChromeMain+0x45e2590>
 45e7608: f9401660     	ldr	x0, [x19, #0x28]
 45e760c: 972ff5a4     	bl	0x11e4c9c <_ChromeMain+0x11dfa00>
 45e7610: 34001020     	cbz	w0, 0x45e7814 <_ChromeMain+0x45e2578>
 45e7614: f9403a60     	ldr	x0, [x19, #0x70]
 45e7618: f9400008     	ldr	x8, [x0]
 45e761c: f9404508     	ldr	x8, [x8, #0x88]
 45e7620: d63f0100     	blr	x8
 45e7624: d2800016     	mov	x22, #0x0               ; =0
 45e7628: bd4013e0     	ldr	s0, [sp, #0x10]
 45e762c: bd401be1     	ldr	s1, [sp, #0x18]
 45e7630: bd4023e2     	ldr	s2, [sp, #0x20]
 45e7634: bd402be3     	ldr	s3, [sp, #0x28]
 45e7638: 1e222800     	fadd	s0, s0, s2
 45e763c: d360fc08     	lsr	x8, x0, #32
 45e7640: 1e232821     	fadd	s1, s1, s3
 45e7644: 1e212800     	fadd	s0, s0, s1
 45e7648: 1e24c000     	frintp	s0, s0
 45e764c: 0f0665e1     	movi.2s	v1, #0xcf, lsl #24
 45e7650: 1e212000     	fcmp	s0, s1
 45e7654: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45e7658: 1a89b3e9     	csel	w9, wzr, w9, lt
 45e765c: 1e216801     	fmaxnm	s1, s0, s1
 45e7660: 12b6200a     	mov	w10, #0x4effffff        ; =1325400063
 45e7664: 1e270142     	fmov	s2, w10
 45e7668: 1e38002a     	fcvtzs	w10, s1
 45e766c: 1e222000     	fcmp	s0, s2
 45e7670: 1a899149     	csel	w9, w10, w9, ls
 45e7674: 2b090009     	adds	w9, w0, w9
 45e7678: 131f7d2a     	asr	w10, w9, #31
 45e767c: 5201014a     	eor	w10, w10, #0x80000000
 45e7680: 1a896149     	csel	w9, w10, w9, vs
 45e7684: 0aa97d29     	bic	w9, w9, w9, asr #31
 45e7688: 0aa87d08     	bic	w8, w8, w8, asr #31
 45e768c: aa088137     	orr	x23, x9, x8, lsl #32
 45e7690: d360fed8     	lsr	x24, x22, #32
 45e7694: 340003d6     	cbz	w22, 0x45e770c <_ChromeMain+0x45e2470>
 45e7698: b40003b8     	cbz	x24, 0x45e770c <_ChromeMain+0x45e2470>
 45e769c: f9401660     	ldr	x0, [x19, #0x28]
 45e76a0: 972ff511     	bl	0x11e4ae4 <_ChromeMain+0x11df848>
 45e76a4: 7100081f     	cmp	w0, #0x2
 45e76a8: 54000320     	b.eq	0x45e770c <_ChromeMain+0x45e2470>
 45e76ac: f9401660     	ldr	x0, [x19, #0x28]
 45e76b0: 972ff4bc     	bl	0x11e49a0 <_ChromeMain+0x11df704>
 45e76b4: 340000e0     	cbz	w0, 0x45e76d0 <_ChromeMain+0x45e2434>
 45e76b8: f9401668     	ldr	x8, [x19, #0x28]
 45e76bc: f9400500     	ldr	x0, [x8, #0x8]
 45e76c0: b4001c60     	cbz	x0, 0x45e7a4c <_ChromeMain+0x45e27b0>
 45e76c4: 952fec96     	bl	0x91e291c <_ChromeMain+0x91dd680>
 45e76c8: 6f00e400     	movi.2d	v0, #0000000000000000
 45e76cc: 370000c0     	tbnz	w0, #0x0, 0x45e76e4 <_ChromeMain+0x45e2448>
 45e76d0: 52800160     	mov	w0, #0xb                ; =11
 45e76d4: 96ecc92b     	bl	0x119b80 <_ChromeMain+0x1148e4>
 45e76d8: 52800508     	mov	w8, #0x28               ; =40
 45e76dc: cb418108     	sub	x8, x8, x1, lsr #32
 45e76e0: 1e220100     	scvtf	s0, w8
 45e76e4: bd4023e1     	ldr	s1, [sp, #0x20]
 45e76e8: 1e202028     	fcmp	s1, #0.0
 45e76ec: 52800308     	mov	w8, #0x18               ; =24
 45e76f0: 52800509     	mov	w9, #0x28               ; =40
 45e76f4: 9a88c128     	csel	x8, x9, x8, gt
 45e76f8: 910003e9     	mov	x9, sp
 45e76fc: bc686921     	ldr	s1, [x9, x8]
 45e7700: 1e202020     	fcmp	s1, s0
 45e7704: 1e214c00     	fcsel	s0, s0, s1, mi
 45e7708: bc286920     	str	s0, [x9, x8]
 45e770c: b9400be8     	ldr	w8, [sp, #0x8]
 45e7710: 6b16011f     	cmp	w8, w22
 45e7714: 1a96b108     	csel	w8, w8, w22, lt
 45e7718: d3607d08     	lsl	x8, x8, #32
 45e771c: a9037fe8     	stp	x8, xzr, [sp, #0x30]
 45e7720: 910003e0     	mov	x0, sp
 45e7724: 9100c3e1     	add	x1, sp, #0x30
 45e7728: 96f79620     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e772c: f9406260     	ldr	x0, [x19, #0xc0]
 45e7730: b40000c0     	cbz	x0, 0x45e7748 <_ChromeMain+0x45e24ac>
 45e7734: 39472008     	ldrb	w8, [x0, #0x1c8]
 45e7738: 34000088     	cbz	w8, 0x45e7748 <_ChromeMain+0x45e24ac>
 45e773c: 972ff535     	bl	0x11e4c10 <_ChromeMain+0x11df974>
 45e7740: aa0003f4     	mov	x20, x0
 45e7744: 14000002     	b	0x45e774c <_ChromeMain+0x45e24b0>
 45e7748: 52800014     	mov	w20, #0x0               ; =0
 45e774c: 910003e1     	mov	x1, sp
 45e7750: aa1303e0     	mov	x0, x19
 45e7754: 97ffff3b     	bl	0x45e7440 <_ChromeMain+0x45e21a4>
 45e7758: aa0003f5     	mov	x21, x0
 45e775c: d360fc19     	lsr	x25, x0, #32
 45e7760: f9401a68     	ldr	x8, [x19, #0x30]
 45e7764: d107c109     	sub	x9, x8, #0x1f0
 45e7768: f100011f     	cmp	x8, #0x0
 45e776c: 9a8903e0     	csel	x0, xzr, x9, eq
 45e7770: 97ff1285     	bl	0x45ac184 <_ChromeMain+0x45a6ee8>
 45e7774: 52800108     	mov	w8, #0x8                ; =8
 45e7778: 7100001f     	cmp	w0, #0x0
 45e777c: 1a9f1108     	csel	w8, w8, wzr, ne
 45e7780: 6b18033f     	cmp	w25, w24
 45e7784: 1a98c329     	csel	w9, w25, w24, gt
 45e7788: 0b15028a     	add	w10, w20, w21
 45e778c: 0b08014a     	add	w10, w10, w8
 45e7790: 52803e8b     	mov	w11, #0x1f4             ; =500
 45e7794: 2a0b010b     	orr	w11, w8, w11
 45e7798: 6b17015f     	cmp	w10, w23
 45e779c: 1a97c14a     	csel	w10, w10, w23, gt
 45e77a0: 8b578108     	add	x8, x8, x23, lsr #32
 45e77a4: 0b090115     	add	w21, w8, w9
 45e77a8: 6b0b015f     	cmp	w10, w11
 45e77ac: 1a8bc148     	csel	w8, w10, w11, gt
 45e77b0: 0b160116     	add	w22, w8, w22
 45e77b4: 340001d4     	cbz	w20, 0x45e77ec <_ChromeMain+0x45e2550>
 45e77b8: f9401668     	ldr	x8, [x19, #0x28]
 45e77bc: f9400508     	ldr	x8, [x8, #0x8]
 45e77c0: b4000308     	cbz	x8, 0x45e7820 <_ChromeMain+0x45e2584>
 45e77c4: f9429d08     	ldr	x8, [x8, #0x538]
 45e77c8: f9404508     	ldr	x8, [x8, #0x88]
 45e77cc: f9404908     	ldr	x8, [x8, #0x90]
 45e77d0: b4000068     	cbz	x8, 0x45e77dc <_ChromeMain+0x45e2540>
 45e77d4: 3941e108     	ldrb	w8, [x8, #0x78]
 45e77d8: 370000a8     	tbnz	w8, #0x0, 0x45e77ec <_ChromeMain+0x45e2550>
 45e77dc: 528006e0     	mov	w0, #0x37               ; =55
 45e77e0: 96fc7038     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 45e77e4: 0b0006b5     	add	w21, w21, w0, lsl #1
 45e77e8: 0b160016     	add	w22, w0, w22
 45e77ec: 0ab67ec8     	bic	w8, w22, w22, asr #31
 45e77f0: 0ab57ea9     	bic	w9, w21, w21, asr #31
 45e77f4: aa098100     	orr	x0, x8, x9, lsl #32
 45e77f8: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 45e77fc: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 45e7800: a94657f6     	ldp	x22, x21, [sp, #0x60]
 45e7804: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 45e7808: a94467fa     	ldp	x26, x25, [sp, #0x40]
 45e780c: 910243ff     	add	sp, sp, #0x90
 45e7810: d65f03c0     	ret
 45e7814: d2800016     	mov	x22, #0x0               ; =0
 45e7818: d2800017     	mov	x23, #0x0               ; =0
 45e781c: 17ffff9d     	b	0x45e7690 <_ChromeMain+0x45e23f4>
 45e7820: d4200000     	brk	#0
 45e7824: d4400000     	hlt	#0
 45e7828: d4200020     	brk	#0x1
 45e782c: f9403e75     	ldr	x21, [x19, #0x78]
 45e7830: aa1503e0     	mov	x0, x21
 45e7834: 974b35f7     	bl	0x18b5010 <_ChromeMain+0x18afd74>
 45e7838: aa0003f4     	mov	x20, x0
 45e783c: f94426a8     	ldr	x8, [x21, #0x848]
 45e7840: 39424108     	ldrb	w8, [x8, #0x90]
 45e7844: 37000108     	tbnz	w8, #0x0, 0x45e7864 <_ChromeMain+0x45e25c8>
 45e7848: 397382a8     	ldrb	w8, [x21, #0xce0]
 45e784c: 370000c8     	tbnz	w8, #0x0, 0x45e7864 <_ChromeMain+0x45e25c8>
 45e7850: 397de2a8     	ldrb	w8, [x21, #0xf78]
 45e7854: 52800fc9     	mov	w9, #0x7e               ; =126
 45e7858: 7100011f     	cmp	w8, #0x0
 45e785c: 1a8913f6     	csel	w22, wzr, w9, ne
 45e7860: 14000002     	b	0x45e7868 <_ChromeMain+0x45e25cc>
 45e7864: 52800016     	mov	w22, #0x0               ; =0
 45e7868: f9403e68     	ldr	x8, [x19, #0x78]
 45e786c: b4000808     	cbz	x8, 0x45e796c <_ChromeMain+0x45e26d0>
 45e7870: f9401668     	ldr	x8, [x19, #0x28]
 45e7874: f9400508     	ldr	x8, [x8, #0x8]
 45e7878: b4000f08     	cbz	x8, 0x45e7a58 <_ChromeMain+0x45e27bc>
 45e787c: f9429d08     	ldr	x8, [x8, #0x538]
 45e7880: 9100a109     	add	x9, x8, #0x28
 45e7884: f100011f     	cmp	x8, #0x0
 45e7888: 9a8903e9     	csel	x9, xzr, x9, eq
 45e788c: f940b128     	ldr	x8, [x9, #0x160]
 45e7890: f0052e57     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45e7894: b40002e8     	cbz	x8, 0x45e78f0 <_ChromeMain+0x45e2654>
 45e7898: 91058129     	add	x9, x9, #0x160
 45e789c: 900514aa     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45e78a0: 9108614a     	add	x10, x10, #0x218
 45e78a4: 1400000d     	b	0x45e78d8 <_ChromeMain+0x45e263c>
 45e78a8: eb09011f     	cmp	x8, x9
 45e78ac: 54000220     	b.eq	0x45e78f0 <_ChromeMain+0x45e2654>
 45e78b0: f9401515     	ldr	x21, [x8, #0x28]
 45e78b4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45e78b8: f94046e9     	ldr	x9, [x23, #0x88]
 45e78bc: eb09011f     	cmp	x8, x9
 45e78c0: 540001a1     	b.ne	0x45e78f4 <_ChromeMain+0x45e2658>
 45e78c4: aa1503e0     	mov	x0, x21
 45e78c8: 96e8b28d     	bl	0x142fc <_ChromeMain+0xf060>
 45e78cc: 1400000a     	b	0x45e78f4 <_ChromeMain+0x45e2658>
 45e78d0: f9400108     	ldr	x8, [x8]
 45e78d4: b40000e8     	cbz	x8, 0x45e78f0 <_ChromeMain+0x45e2654>
 45e78d8: f940110b     	ldr	x11, [x8, #0x20]
 45e78dc: eb0a017f     	cmp	x11, x10
 45e78e0: 54ffff88     	b.hi	0x45e78d0 <_ChromeMain+0x45e2634>
 45e78e4: 54fffe20     	b.eq	0x45e78a8 <_ChromeMain+0x45e260c>
 45e78e8: f9400508     	ldr	x8, [x8, #0x8]
 45e78ec: b5ffff68     	cbnz	x8, 0x45e78d8 <_ChromeMain+0x45e263c>
 45e78f0: d2800015     	mov	x21, #0x0               ; =0
 45e78f4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45e78f8: f94046e9     	ldr	x9, [x23, #0x88]
 45e78fc: eb09011f     	cmp	x8, x9
 45e7900: 54000061     	b.ne	0x45e790c <_ChromeMain+0x45e2670>
 45e7904: aa1503e0     	mov	x0, x21
 45e7908: 96e8ec4d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45e790c: 900514a1     	adrp	x1, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45e7910: 910a4021     	add	x1, x1, #0x290
 45e7914: aa1503e0     	mov	x0, x21
 45e7918: 972ff390     	bl	0x11e4758 <_ChromeMain+0x11df4bc>
 45e791c: f9401c08     	ldr	x8, [x0, #0x38]
 45e7920: 900514a9     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45e7924: 910a8129     	add	x9, x9, #0x2a0
 45e7928: eb09011f     	cmp	x8, x9
 45e792c: 54000200     	b.eq	0x45e796c <_ChromeMain+0x45e26d0>
 45e7930: 900514a9     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45e7934: 910a6129     	add	x9, x9, #0x298
 45e7938: 900514aa     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45e793c: 910aa14a     	add	x10, x10, #0x2a8
 45e7940: eb0a011f     	cmp	x8, x10
 45e7944: fa491104     	ccmp	x8, x9, #0x4, ne
 45e7948: 900514a9     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45e794c: 910ac129     	add	x9, x9, #0x2b0
 45e7950: fa491104     	ccmp	x8, x9, #0x4, ne
 45e7954: 540000c0     	b.eq	0x45e796c <_ChromeMain+0x45e26d0>
 45e7958: f9403e68     	ldr	x8, [x19, #0x78]
 45e795c: 39682109     	ldrb	w9, [x8, #0xa08]
 45e7960: 37000069     	tbnz	w9, #0x0, 0x45e796c <_ChromeMain+0x45e26d0>
 45e7964: 39683109     	ldrb	w9, [x8, #0xa0c]
 45e7968: 36000369     	tbz	w9, #0x0, 0x45e79d4 <_ChromeMain+0x45e2738>
 45e796c: d360fe88     	lsr	x8, x20, #32
 45e7970: bd4013e0     	ldr	s0, [sp, #0x10]
 45e7974: bd401be1     	ldr	s1, [sp, #0x18]
 45e7978: 1e212800     	fadd	s0, s0, s1
 45e797c: 1e24c001     	frintp	s1, s0
 45e7980: 52a6b009     	mov	w9, #0x35800000         ; =897581056
 45e7984: 1e270122     	fmov	s2, w9
 45e7988: 6f00e403     	movi.2d	v3, #0000000000000000
 45e798c: 1e222000     	fcmp	s0, s2
 45e7990: 1e23cc20     	fcsel	s0, s1, s3, gt
 45e7994: 0f0665e1     	movi.2s	v1, #0xcf, lsl #24
 45e7998: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45e799c: 1e212000     	fcmp	s0, s1
 45e79a0: 1e21cc01     	fcsel	s1, s0, s1, gt
 45e79a4: 1a89b3e9     	csel	w9, wzr, w9, lt
 45e79a8: 1e38002a     	fcvtzs	w10, s1
 45e79ac: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 45e79b0: 1e270161     	fmov	s1, w11
 45e79b4: 1e212000     	fcmp	s0, s1
 45e79b8: 1a899149     	csel	w9, w10, w9, ls
 45e79bc: d503201f     	nop
 45e79c0: 6b16013f     	cmp	w9, w22
 45e79c4: 1a96c129     	csel	w9, w9, w22, gt
 45e79c8: d2800017     	mov	x23, #0x0               ; =0
 45e79cc: aa088136     	orr	x22, x9, x8, lsl #32
 45e79d0: 17ffff30     	b	0x45e7690 <_ChromeMain+0x45e23f4>
 45e79d4: f9401669     	ldr	x9, [x19, #0x28]
 45e79d8: f9400520     	ldr	x0, [x9, #0x8]
 45e79dc: b4000440     	cbz	x0, 0x45e7a64 <_ChromeMain+0x45e27c8>
 45e79e0: 39738115     	ldrb	w21, [x8, #0xce0]
 45e79e4: 952febce     	bl	0x91e291c <_ChromeMain+0x91dd680>
 45e79e8: 3707fc35     	tbnz	w21, #0x0, 0x45e796c <_ChromeMain+0x45e26d0>
 45e79ec: 34fffc00     	cbz	w0, 0x45e796c <_ChromeMain+0x45e26d0>
 45e79f0: bd4017e0     	ldr	s0, [sp, #0x14]
 45e79f4: bd401fe1     	ldr	s1, [sp, #0x1c]
 45e79f8: 1e212800     	fadd	s0, s0, s1
 45e79fc: 1e24c001     	frintp	s1, s0
 45e7a00: 52a6b008     	mov	w8, #0x35800000         ; =897581056
 45e7a04: 1e270102     	fmov	s2, w8
 45e7a08: 6f00e403     	movi.2d	v3, #0000000000000000
 45e7a0c: 1e222000     	fcmp	s0, s2
 45e7a10: 1e23cc20     	fcsel	s0, s1, s3, gt
 45e7a14: 0f0665e1     	movi.2s	v1, #0xcf, lsl #24
 45e7a18: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 45e7a1c: 1e212000     	fcmp	s0, s1
 45e7a20: 1e21cc01     	fcsel	s1, s0, s1, gt
 45e7a24: 1a88b3e8     	csel	w8, wzr, w8, lt
 45e7a28: 1e380029     	fcvtzs	w9, s1
 45e7a2c: 12b6200a     	mov	w10, #0x4effffff        ; =1325400063
 45e7a30: 1e270141     	fmov	s1, w10
 45e7a34: 1e212000     	fcmp	s0, s1
 45e7a38: 1a889128     	csel	w8, w9, w8, ls
 45e7a3c: 8b548108     	add	x8, x8, x20, lsr #32
 45e7a40: 0aa87d08     	bic	w8, w8, w8, asr #31
 45e7a44: 52800fc9     	mov	w9, #0x7e               ; =126
 45e7a48: 17ffffe0     	b	0x45e79c8 <_ChromeMain+0x45e272c>
 45e7a4c: d4200000     	brk	#0
 45e7a50: d4400000     	hlt	#0
 45e7a54: d4200020     	brk	#0x1
 45e7a58: d4200000     	brk	#0
 45e7a5c: d4400000     	hlt	#0
 45e7a60: d4200020     	brk	#0x1
 45e7a64: d4200000     	brk	#0
 45e7a68: d4400000     	hlt	#0
 45e7a6c: d4200020     	brk	#0x1
 45e7a70: d503201f     	nop
 45e7a74: d503201f     	nop
 45e7a78: d503201f     	nop
 45e7a7c: d503201f     	nop
 45e7a80: 6db923e9     	stp	d9, d8, [sp, #-0x70]!
 45e7a84: a9016ffc     	stp	x28, x27, [sp, #0x10]
 45e7a88: a90267fa     	stp	x26, x25, [sp, #0x20]
 45e7a8c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 45e7a90: a90457f6     	stp	x22, x21, [sp, #0x40]
 45e7a94: a9054ff4     	stp	x20, x19, [sp, #0x50]
 45e7a98: a9067bfd     	stp	x29, x30, [sp, #0x60]
 45e7a9c: 910183fd     	add	x29, sp, #0x60
 45e7aa0: d10843ff     	sub	sp, sp, #0x210
 45e7aa4: aa0103f4     	mov	x20, x1
 45e7aa8: aa0003f3     	mov	x19, x0
 45e7aac: aa0803f5     	mov	x21, x8
 45e7ab0: 9102c3fb     	add	x27, sp, #0xb0
 45e7ab4: b004d208     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 45e7ab8: f940f908     	ldr	x8, [x8, #0x1f0]
 45e7abc: f9400108     	ldr	x8, [x8]
 45e7ac0: f81883a8     	stur	x8, [x29, #-0x78]
 45e7ac4: 52801348     	mov	w8, #0x9a               ; =154
 45e7ac8: f9001b68     	str	x8, [x27, #0x30]
 45e7acc: d0054908     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 45e7ad0: 39580900     	ldrb	w0, [x8, #0x602]
 45e7ad4: 3500f280     	cbnz	w0, 0x45e9924 <_ChromeMain+0x45e4688>
 45e7ad8: 6f00e400     	movi.2d	v0, #0000000000000000
 45e7adc: ad0002a0     	stp	q0, q0, [x21]
 45e7ae0: aa1503e8     	mov	x8, x21
 45e7ae4: 3c820d00     	str	q0, [x8, #0x20]!
 45e7ae8: f9000ea8     	str	x8, [x21, #0x18]
 45e7aec: f9401e61     	ldr	x1, [x19, #0x38]
 45e7af0: b40000a1     	cbz	x1, 0x45e7b04 <_ChromeMain+0x45e2868>
 45e7af4: aa1503e0     	mov	x0, x21
 45e7af8: aa1403e2     	mov	x2, x20
 45e7afc: d2800003     	mov	x3, #0x0                ; =0
 45e7b00: 97036195     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7b04: f9402661     	ldr	x1, [x19, #0x48]
 45e7b08: b40000a1     	cbz	x1, 0x45e7b1c <_ChromeMain+0x45e2880>
 45e7b0c: aa1503e0     	mov	x0, x21
 45e7b10: aa1403e2     	mov	x2, x20
 45e7b14: 52802023     	mov	w3, #0x101              ; =257
 45e7b18: 9703618f     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7b1c: f9001bf4     	str	x20, [sp, #0x30]
 45e7b20: f9409e7c     	ldr	x28, [x19, #0x138]
 45e7b24: ad408381     	ldp	q1, q0, [x28, #0x10]
 45e7b28: 3dc00382     	ldr	q2, [x28]
 45e7b2c: ad080762     	stp	q2, q1, [x27, #0x100]
 45e7b30: 3d804b60     	str	q0, [x27, #0x120]
 45e7b34: b9404388     	ldr	w8, [x28, #0x40]
 45e7b38: 7100051f     	cmp	w8, #0x1
 45e7b3c: 540002cb     	b.lt	0x45e7b94 <_ChromeMain+0x45e28f8>
 45e7b40: f9401a68     	ldr	x8, [x19, #0x30]
 45e7b44: d107c109     	sub	x9, x8, #0x1f0
 45e7b48: f100011f     	cmp	x8, #0x0
 45e7b4c: 9a8903e8     	csel	x8, xzr, x9, eq
 45e7b50: f9429d08     	ldr	x8, [x8, #0x538]
 45e7b54: b4000208     	cbz	x8, 0x45e7b94 <_ChromeMain+0x45e28f8>
 45e7b58: f940d108     	ldr	x8, [x8, #0x1a0]
 45e7b5c: f941c909     	ldr	x9, [x8, #0x390]
 45e7b60: b40001a9     	cbz	x9, 0x45e7b94 <_ChromeMain+0x45e28f8>
 45e7b64: f940b128     	ldr	x8, [x9, #0x160]
 45e7b68: b4008648     	cbz	x8, 0x45e8c30 <_ChromeMain+0x45e3994>
 45e7b6c: 91058129     	add	x9, x9, #0x160
 45e7b70: d00513aa     	adrp	x10, 0xe85d000 <dyld_stub_binder+0xe85d000>
 45e7b74: 911f414a     	add	x10, x10, #0x7d0
 45e7b78: 14000428     	b	0x45e8c18 <_ChromeMain+0x45e397c>
 45e7b7c: b9002bff     	str	wzr, [sp, #0x28]
 45e7b80: 5280002a     	mov	w10, #0x1               ; =1
 45e7b84: 14000012     	b	0x45e7bcc <_ChromeMain+0x45e2930>
 45e7b88: aa1603e0     	mov	x0, x22
 45e7b8c: 96e8ebac     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45e7b90: b50085f6     	cbnz	x22, 0x45e8c4c <_ChromeMain+0x45e39b0>
 45e7b94: 52800019     	mov	w25, #0x0               ; =0
 45e7b98: f9402e69     	ldr	x9, [x19, #0x58]
 45e7b9c: f9401a68     	ldr	x8, [x19, #0x30]
 45e7ba0: b40000a9     	cbz	x9, 0x45e7bb4 <_ChromeMain+0x45e2918>
 45e7ba4: b4000088     	cbz	x8, 0x45e7bb4 <_ChromeMain+0x45e2918>
 45e7ba8: f940c529     	ldr	x9, [x9, #0x188]
 45e7bac: eb08013f     	cmp	x9, x8
 45e7bb0: 54fffe60     	b.eq	0x45e7b7c <_ChromeMain+0x45e28e0>
 45e7bb4: 5280000a     	mov	w10, #0x0               ; =0
 45e7bb8: f9409e69     	ldr	x9, [x19, #0x138]
 45e7bbc: b9403129     	ldr	w9, [x9, #0x30]
 45e7bc0: 7100093f     	cmp	w9, #0x2
 45e7bc4: 1a9f07e9     	cset	w9, ne
 45e7bc8: b9002be9     	str	w9, [sp, #0x28]
 45e7bcc: 5280001a     	mov	w26, #0x0               ; =0
 45e7bd0: 39414396     	ldrb	w22, [x28, #0x50]
 45e7bd4: d10303a9     	sub	x9, x29, #0xc0
 45e7bd8: f803f13f     	stur	xzr, [x9, #0x3f]
 45e7bdc: f9001d3f     	str	xzr, [x9, #0x38]
 45e7be0: b90017ea     	str	w10, [sp, #0x14]
 45e7be4: b400e8a8     	cbz	x8, 0x45e98f8 <_ChromeMain+0x45e465c>
 45e7be8: f9403a69     	ldr	x9, [x19, #0x70]
 45e7bec: b400e869     	cbz	x9, 0x45e98f8 <_ChromeMain+0x45e465c>
 45e7bf0: f940c529     	ldr	x9, [x9, #0x188]
 45e7bf4: eb08013f     	cmp	x9, x8
 45e7bf8: 54009cc0     	b.eq	0x45e8f90 <_ChromeMain+0x45e3cf4>
 45e7bfc: 5280001a     	mov	w26, #0x0               ; =0
 45e7c00: b9001bff     	str	wzr, [sp, #0x18]
 45e7c04: 52800029     	mov	w9, #0x1                ; =1
 45e7c08: b90027e9     	str	w9, [sp, #0x24]
 45e7c0c: 52800018     	mov	w24, #0x0               ; =0
 45e7c10: d10303a9     	sub	x9, x29, #0xc0
 45e7c14: 3dc00120     	ldr	q0, [x9]
 45e7c18: 3d803f60     	str	q0, [x27, #0xf0]
 45e7c1c: f9409e69     	ldr	x9, [x19, #0x138]
 45e7c20: f9001fe9     	str	x9, [sp, #0x38]
 45e7c24: a90e7f7f     	stp	xzr, xzr, [x27, #0xe0]
 45e7c28: f9403e61     	ldr	x1, [x19, #0x78]
 45e7c2c: b400e3c1     	cbz	x1, 0x45e98a4 <_ChromeMain+0x45e4608>
 45e7c30: b400e3a8     	cbz	x8, 0x45e98a4 <_ChromeMain+0x45e4608>
 45e7c34: f940c429     	ldr	x9, [x1, #0x188]
 45e7c38: eb08013f     	cmp	x9, x8
 45e7c3c: 5400b360     	b.eq	0x45e92a8 <_ChromeMain+0x45e400c>
 45e7c40: 52800018     	mov	w24, #0x0               ; =0
 45e7c44: b9002fff     	str	wzr, [sp, #0x2c]
 45e7c48: f9404277     	ldr	x23, [x19, #0x80]
 45e7c4c: b40003d7     	cbz	x23, 0x45e7cc4 <_ChromeMain+0x45e2a28>
 45e7c50: b40003a8     	cbz	x8, 0x45e7cc4 <_ChromeMain+0x45e2a28>
 45e7c54: f940c6e9     	ldr	x9, [x23, #0x188]
 45e7c58: eb08013f     	cmp	x9, x8
 45e7c5c: 54000341     	b.ne	0x45e7cc4 <_ChromeMain+0x45e2a28>
 45e7c60: 39448268     	ldrb	w8, [x19, #0x120]
 45e7c64: 34000248     	cbz	w8, 0x45e7cac <_ChromeMain+0x45e2a10>
 45e7c68: 96f6c056     	bl	0x397dc0 <_ChromeMain+0x392b24>
 45e7c6c: 3400c5c0     	cbz	w0, 0x45e9524 <_ChromeMain+0x45e4288>
 45e7c70: b0052ec8     	adrp	x8, 0xebc0000 <dyld_stub_binder+0xebc0000>
 45e7c74: b9414d08     	ldr	w8, [x8, #0x14c]
 45e7c78: 3790c568     	tbnz	w8, #0x12, 0x45e9524 <_ChromeMain+0x45e4288>
 45e7c7c: f0051880     	adrp	x0, 0xe8fa000 <dyld_stub_binder+0xe8fa000>
 45e7c80: 91180000     	add	x0, x0, #0x600
 45e7c84: 97d23665     	bl	0x3a75618 <_ChromeMain+0x3a7037c>
 45e7c88: 1e6e1001     	fmov	d1, #1.00000000
 45e7c8c: 1e612000     	fcmp	d0, d1
 45e7c90: 540000e5     	b.pl	0x45e7cac <_ChromeMain+0x45e2a10>
 45e7c94: f9409e68     	ldr	x8, [x19, #0x138]
 45e7c98: fd403d00     	ldr	d0, [x8, #0x78]
 45e7c9c: 1e602008     	fcmp	d0, #0.0
 45e7ca0: 52802008     	mov	w8, #0x100              ; =256
 45e7ca4: 9a88d503     	cinc	x3, x8, gt
 45e7ca8: 14000002     	b	0x45e7cb0 <_ChromeMain+0x45e2a14>
 45e7cac: 52802003     	mov	w3, #0x100              ; =256
 45e7cb0: d10383a2     	sub	x2, x29, #0xe0
 45e7cb4: aa1503e0     	mov	x0, x21
 45e7cb8: aa1703e1     	mov	x1, x23
 45e7cbc: 97036126     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7cc0: f9401a68     	ldr	x8, [x19, #0x30]
 45e7cc4: f9404a61     	ldr	x1, [x19, #0x90]
 45e7cc8: b4000161     	cbz	x1, 0x45e7cf4 <_ChromeMain+0x45e2a58>
 45e7ccc: b4000148     	cbz	x8, 0x45e7cf4 <_ChromeMain+0x45e2a58>
 45e7cd0: f940c429     	ldr	x9, [x1, #0x188]
 45e7cd4: eb08013f     	cmp	x9, x8
 45e7cd8: 540000e1     	b.ne	0x45e7cf4 <_ChromeMain+0x45e2a58>
 45e7cdc: a9037f7f     	stp	xzr, xzr, [x27, #0x30]
 45e7ce0: 910383e2     	add	x2, sp, #0xe0
 45e7ce4: aa1503e0     	mov	x0, x21
 45e7ce8: 52802003     	mov	w3, #0x100              ; =256
 45e7cec: 9703611a     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7cf0: f9401a68     	ldr	x8, [x19, #0x30]
 45e7cf4: f9404661     	ldr	x1, [x19, #0x88]
 45e7cf8: b4000161     	cbz	x1, 0x45e7d24 <_ChromeMain+0x45e2a88>
 45e7cfc: b4000148     	cbz	x8, 0x45e7d24 <_ChromeMain+0x45e2a88>
 45e7d00: f940c429     	ldr	x9, [x1, #0x188]
 45e7d04: eb08013f     	cmp	x9, x8
 45e7d08: 540000e1     	b.ne	0x45e7d24 <_ChromeMain+0x45e2a88>
 45e7d0c: a9037f7f     	stp	xzr, xzr, [x27, #0x30]
 45e7d10: 910383e2     	add	x2, sp, #0xe0
 45e7d14: aa1503e0     	mov	x0, x21
 45e7d18: 52802003     	mov	w3, #0x100              ; =256
 45e7d1c: 9703610e     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7d20: f9401a68     	ldr	x8, [x19, #0x30]
 45e7d24: f9404e60     	ldr	x0, [x19, #0x98]
 45e7d28: b4000760     	cbz	x0, 0x45e7e14 <_ChromeMain+0x45e2b78>
 45e7d2c: b4000748     	cbz	x8, 0x45e7e14 <_ChromeMain+0x45e2b78>
 45e7d30: f940c409     	ldr	x9, [x0, #0x188]
 45e7d34: eb08013f     	cmp	x9, x8
 45e7d38: 540006e1     	b.ne	0x45e7e14 <_ChromeMain+0x45e2b78>
 45e7d3c: 39472009     	ldrb	w9, [x0, #0x1c8]
 45e7d40: 340006a9     	cbz	w9, 0x45e7e14 <_ChromeMain+0x45e2b78>
 45e7d44: f9409e68     	ldr	x8, [x19, #0x138]
 45e7d48: b9403508     	ldr	w8, [x8, #0x34]
 45e7d4c: 52801e14     	mov	w20, #0xf0              ; =240
 45e7d50: 7100051f     	cmp	w8, #0x1
 45e7d54: 54000060     	b.eq	0x45e7d60 <_ChromeMain+0x45e2ac4>
 45e7d58: 52800037     	mov	w23, #0x1               ; =1
 45e7d5c: 14000006     	b	0x45e7d74 <_ChromeMain+0x45e2ad8>
 45e7d60: b9403f88     	ldr	w8, [x28, #0x3c]
 45e7d64: 51000509     	sub	w9, w8, #0x1
 45e7d68: 7103c11f     	cmp	w8, #0xf0
 45e7d6c: 1a89b294     	csel	w20, w20, w9, lt
 45e7d70: 1a9fa7f7     	cset	w23, lt
 45e7d74: b9441808     	ldr	w8, [x0, #0x418]
 45e7d78: 6b14011f     	cmp	w8, w20
 45e7d7c: 540000a0     	b.eq	0x45e7d90 <_ChromeMain+0x45e2af4>
 45e7d80: b9041814     	str	w20, [x0, #0x418]
 45e7d84: 52800001     	mov	w1, #0x0                ; =0
 45e7d88: 970121bb     	bl	0x630474 <_ChromeMain+0x62b1d8>
 45e7d8c: f9404e60     	ldr	x0, [x19, #0x98]
 45e7d90: aa1703e1     	mov	x1, x23
 45e7d94: 94f5789b     	bl	0x8346000 <_ChromeMain+0x8340d64>
 45e7d98: f9404e61     	ldr	x1, [x19, #0x98]
 45e7d9c: fd41ec20     	ldr	d0, [x1, #0x3d8]
 45e7da0: 1e630281     	ucvtf	d1, w20
 45e7da4: 1e610800     	fmul	d0, d0, d1
 45e7da8: 1e654000     	frintm	d0, d0
 45e7dac: d2f83c08     	mov	x8, #-0x3e20000000000000 ; =-4476578029606273024
 45e7db0: 9e670101     	fmov	d1, x8
 45e7db4: 1e612000     	fcmp	d0, d1
 45e7db8: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 45e7dbc: 1a88b3e8     	csel	w8, wzr, w8, lt
 45e7dc0: 1e616801     	fmaxnm	d1, d0, d1
 45e7dc4: 1e780029     	fcvtzs	w9, d1
 45e7dc8: 9004cb2a     	adrp	x10, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 45e7dcc: fd466541     	ldr	d1, [x10, #0xcc8]
 45e7dd0: 1e612000     	fcmp	d0, d1
 45e7dd4: 1a889128     	csel	w8, w9, w8, ls
 45e7dd8: 1e270100     	fmov	s0, w8
 45e7ddc: f9401be9     	ldr	x9, [sp, #0x30]
 45e7de0: 91003128     	add	x8, x9, #0xc
 45e7de4: fd400121     	ldr	d1, [x9]
 45e7de8: 0d409100     	ld1.s	{ v0 }[1], [x8]
 45e7dec: 0ea00c20     	sqadd.2s	v0, v1, v0
 45e7df0: 0ea12c00     	sqsub.2s	v0, v0, v1
 45e7df4: 6f00e402     	movi.2d	v2, #0000000000000000
 45e7df8: 0ea26400     	smax.2s	v0, v0, v2
 45e7dfc: 6d030361     	stp	d1, d0, [x27, #0x30]
 45e7e00: 910383e2     	add	x2, sp, #0xe0
 45e7e04: aa1503e0     	mov	x0, x21
 45e7e08: d2800003     	mov	x3, #0x0                ; =0
 45e7e0c: 970360d2     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7e10: f9401a68     	ldr	x8, [x19, #0x30]
 45e7e14: 52800009     	mov	w9, #0x0                ; =0
 45e7e18: f9405e61     	ldr	x1, [x19, #0xb8]
 45e7e1c: b400d481     	cbz	x1, 0x45e98ac <_ChromeMain+0x45e4610>
 45e7e20: b400d468     	cbz	x8, 0x45e98ac <_ChromeMain+0x45e4610>
 45e7e24: f940c429     	ldr	x9, [x1, #0x188]
 45e7e28: eb08013f     	cmp	x9, x8
 45e7e2c: 54009ec0     	b.eq	0x45e9204 <_ChromeMain+0x45e3f68>
 45e7e30: b90013ff     	str	wzr, [sp, #0x10]
 45e7e34: 52000329     	eor	w9, w25, #0x1
 45e7e38: 0a160136     	and	w22, w9, w22
 45e7e3c: 34000976     	cbz	w22, 0x45e7f68 <_ChromeMain+0x45e2ccc>
 45e7e40: f9402e61     	ldr	x1, [x19, #0x58]
 45e7e44: b4000921     	cbz	x1, 0x45e7f68 <_ChromeMain+0x45e2ccc>
 45e7e48: b4000908     	cbz	x8, 0x45e7f68 <_ChromeMain+0x45e2ccc>
 45e7e4c: f940c429     	ldr	x9, [x1, #0x188]
 45e7e50: eb08013f     	cmp	x9, x8
 45e7e54: 540008a1     	b.ne	0x45e7f68 <_ChromeMain+0x45e2ccc>
 45e7e58: a9037f7f     	stp	xzr, xzr, [x27, #0x30]
 45e7e5c: 910383e2     	add	x2, sp, #0xe0
 45e7e60: aa1503e0     	mov	x0, x21
 45e7e64: d2800003     	mov	x3, #0x0                ; =0
 45e7e68: 970360bb     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e7e6c: aa0003f7     	mov	x23, x0
 45e7e70: 6f00e400     	movi.2d	v0, #0000000000000000
 45e7e74: ad020360     	stp	q0, q0, [x27, #0x40]
 45e7e78: 3d800f60     	str	q0, [x27, #0x30]
 45e7e7c: d10303a0     	sub	x0, x29, #0xc0
 45e7e80: d10303a1     	sub	x1, x29, #0xc0
 45e7e84: 9738fd50     	bl	0x14273c4 <_ChromeMain+0x1422128>
 45e7e88: 3600dea0     	tbz	w0, #0x0, 0x45e9a5c <_ChromeMain+0x45e47c0>
 45e7e8c: d10303a0     	sub	x0, x29, #0xc0
 45e7e90: d10303a1     	sub	x1, x29, #0xc0
 45e7e94: 96f79436     	bl	0x3ccf6c <_ChromeMain+0x3c7cd0>
 45e7e98: a9080760     	stp	x0, x1, [x27, #0x80]
 45e7e9c: d10303a8     	sub	x8, x29, #0xc0
 45e7ea0: ad400500     	ldp	q0, q1, [x8]
 45e7ea4: ad018760     	stp	q0, q1, [x27, #0x30]
 45e7ea8: 3dc00900     	ldr	q0, [x8, #0x20]
 45e7eac: 3d801760     	str	q0, [x27, #0x50]
 45e7eb0: 910383e0     	add	x0, sp, #0xe0
 45e7eb4: 9104c3e1     	add	x1, sp, #0x130
 45e7eb8: 96f7943c     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e7ebc: f9001b7f     	str	xzr, [x27, #0x30]
 45e7ec0: fd401f60     	ldr	d0, [x27, #0x38]
 45e7ec4: 6f00e401     	movi.2d	v1, #0000000000000000
 45e7ec8: 0ea16400     	smax.2s	v0, v0, v1
 45e7ecc: fd001f60     	str	d0, [x27, #0x38]
 45e7ed0: ad420b60     	ldp	q0, q2, [x27, #0x40]
 45e7ed4: 3d800b62     	str	q2, [x27, #0x20]
 45e7ed8: 3dc00f61     	ldr	q1, [x27, #0x30]
 45e7edc: ad0583e1     	stp	q1, q0, [sp, #0xb0]
 45e7ee0: 9102c3e2     	add	x2, sp, #0xb0
 45e7ee4: aa1303e0     	mov	x0, x19
 45e7ee8: aa1703e1     	mov	x1, x23
 45e7eec: b94027e3     	ldr	w3, [sp, #0x24]
 45e7ef0: 94000774     	bl	0x45e9cc0 <_ChromeMain+0x45e4a24>
 45e7ef4: a90a8760     	stp	x0, x1, [x27, #0xa8]
 45e7ef8: 910563e1     	add	x1, sp, #0x158
 45e7efc: d10303a2     	sub	x2, x29, #0xc0
 45e7f00: aa1303e0     	mov	x0, x19
 45e7f04: 97daff15     	bl	0x3ca7b58 <_ChromeMain+0x3ca28bc>
 45e7f08: a90006e0     	stp	x0, x1, [x23]
 45e7f0c: d360fc28     	lsr	x8, x1, #32
 45e7f10: 8b408108     	add	x8, x8, x0, lsr #32
 45e7f14: b85443a9     	ldur	w9, [x29, #-0xbc]
 45e7f18: 4b090108     	sub	w8, w8, w9
 45e7f1c: a9087f68     	stp	x8, xzr, [x27, #0x80]
 45e7f20: d10303a0     	sub	x0, x29, #0xc0
 45e7f24: 9104c3e1     	add	x1, sp, #0x130
 45e7f28: 96f79420     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e7f2c: 7100071f     	cmp	w24, #0x1
 45e7f30: 540001ab     	b.lt	0x45e7f64 <_ChromeMain+0x45e2cc8>
 45e7f34: 4b1803e8     	neg	w8, w24
 45e7f38: d3607d08     	lsl	x8, x8, #32
 45e7f3c: a9087f68     	stp	x8, xzr, [x27, #0x80]
 45e7f40: 9104c3e1     	add	x1, sp, #0x130
 45e7f44: aa1703e0     	mov	x0, x23
 45e7f48: 96f7945c     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e7f4c: f9400ee9     	ldr	x9, [x23, #0x18]
 45e7f50: 910082e8     	add	x8, x23, #0x20
 45e7f54: eb08013f     	cmp	x9, x8
 45e7f58: 54000060     	b.eq	0x45e7f64 <_ChromeMain+0x45e2cc8>
 45e7f5c: 6f00e400     	movi.2d	v0, #0000000000000000
 45e7f60: 14000306     	b	0x45e8b78 <_ChromeMain+0x45e38dc>
 45e7f64: f9401a68     	ldr	x8, [x19, #0x30]
 45e7f68: f9402277     	ldr	x23, [x19, #0x40]
 45e7f6c: f10002ff     	cmp	x23, #0x0
 45e7f70: fa401904     	ccmp	x8, #0x0, #0x4, ne
 45e7f74: 54000080     	b.eq	0x45e7f84 <_ChromeMain+0x45e2ce8>
 45e7f78: f940c6e9     	ldr	x9, [x23, #0x188]
 45e7f7c: eb08013f     	cmp	x9, x8
 45e7f80: 54006b40     	b.eq	0x45e8ce8 <_ChromeMain+0x45e3a4c>
 45e7f84: f9000fff     	str	xzr, [sp, #0x18]
 45e7f88: b9404388     	ldr	w8, [x28, #0x40]
 45e7f8c: 6f00e408     	movi.2d	v8, #0000000000000000
 45e7f90: 7100051f     	cmp	w8, #0x1
 45e7f94: 540002ca     	b.ge	0x45e7fec <_ChromeMain+0x45e2d50>
 45e7f98: 37000339     	tbnz	w25, #0x0, 0x45e7ffc <_ChromeMain+0x45e2d60>
 45e7f9c: f9409e68     	ldr	x8, [x19, #0x138]
 45e7fa0: b9403508     	ldr	w8, [x8, #0x34]
 45e7fa4: 7100051f     	cmp	w8, #0x1
 45e7fa8: 54000060     	b.eq	0x45e7fb4 <_ChromeMain+0x45e2d18>
 45e7fac: 52800038     	mov	w24, #0x1               ; =1
 45e7fb0: 14000014     	b	0x45e8000 <_ChromeMain+0x45e2d64>
 45e7fb4: f9401668     	ldr	x8, [x19, #0x28]
 45e7fb8: f9400508     	ldr	x8, [x8, #0x8]
 45e7fbc: b400d3e8     	cbz	x8, 0x45e9a38 <_ChromeMain+0x45e479c>
 45e7fc0: f9429d08     	ldr	x8, [x8, #0x538]
 45e7fc4: 9100a109     	add	x9, x8, #0x28
 45e7fc8: f100011f     	cmp	x8, #0x0
 45e7fcc: 9a8903e9     	csel	x9, xzr, x9, eq
 45e7fd0: f940b128     	ldr	x8, [x9, #0x160]
 45e7fd4: f0052e54     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45e7fd8: b40066e8     	cbz	x8, 0x45e8cb4 <_ChromeMain+0x45e3a18>
 45e7fdc: 91058129     	add	x9, x9, #0x160
 45e7fe0: b005140a     	adrp	x10, 0xe868000 <dyld_stub_binder+0xe868000>
 45e7fe4: 9112214a     	add	x10, x10, #0x488
 45e7fe8: 1400032d     	b	0x45e8c9c <_ChromeMain+0x45e3a00>
 45e7fec: f9406260     	ldr	x0, [x19, #0xc0]
 45e7ff0: 94c427f3     	bl	0x76f1fbc <_ChromeMain+0x76ecd20>
 45e7ff4: 4ea01c08     	mov.16b	v8, v0
 45e7ff8: 3607fd39     	tbz	w25, #0x0, 0x45e7f9c <_ChromeMain+0x45e2d00>
 45e7ffc: 52800018     	mov	w24, #0x0               ; =0
 45e8000: b9404397     	ldr	w23, [x28, #0x40]
 45e8004: 710006ff     	cmp	w23, #0x1
 45e8008: 5400100b     	b.lt	0x45e8208 <_ChromeMain+0x45e2f6c>
 45e800c: f9406268     	ldr	x8, [x19, #0xc0]
 45e8010: b9449114     	ldr	w20, [x8, #0x490]
 45e8014: d005493a     	adrp	x26, 0xef0e000 <dyld_stub_binder+0xef0e000>
 45e8018: b947ab40     	ldr	w0, [x26, #0x7a8]
 45e801c: 3400c940     	cbz	w0, 0x45e9944 <_ChromeMain+0x45e46a8>
 45e8020: 52800008     	mov	w8, #0x0                ; =0
 45e8024: 7100069f     	cmp	w20, #0x1
 45e8028: 1a9f17e9     	cset	w9, eq
 45e802c: 7100041f     	cmp	w0, #0x1
 45e8030: 1a9f17ea     	cset	w10, eq
 45e8034: 4a0a0134     	eor	w20, w9, w10
 45e8038: 1e6e1000     	fmov	d0, #1.00000000
 45e803c: 1e602100     	fcmp	d8, d0
 45e8040: 1a9f57ea     	cset	w10, mi
 45e8044: b9402fe9     	ldr	w9, [sp, #0x2c]
 45e8048: 1a9f5529     	csinc	w9, w9, wzr, pl
 45e804c: 290527ea     	stp	w10, w9, [sp, #0x28]
 45e8050: 1e6202e0     	scvtf	d0, w23
 45e8054: 1e600900     	fmul	d0, d8, d0
 45e8058: 1e654000     	frintm	d0, d0
 45e805c: d2f83c09     	mov	x9, #-0x3e20000000000000 ; =-4476578029606273024
 45e8060: 9e670121     	fmov	d1, x9
 45e8064: 1e612000     	fcmp	d0, d1
 45e8068: 1e616801     	fmaxnm	d1, d0, d1
 45e806c: 1e780029     	fcvtzs	w9, d1
 45e8070: f004cb0a     	adrp	x10, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 45e8074: fd466541     	ldr	d1, [x10, #0xcc8]
 45e8078: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 45e807c: 1a8ab3ea     	csel	w10, wzr, w10, lt
 45e8080: 1e612000     	fcmp	d0, d1
 45e8084: 1a8a913a     	csel	w26, w9, w10, ls
 45e8088: b85443a9     	ldur	w9, [x29, #-0xbc]
 45e808c: 34000058     	cbz	w24, 0x45e8094 <_ChromeMain+0x45e2df8>
 45e8090: b9404f88     	ldr	w8, [x28, #0x4c]
 45e8094: 0b090109     	add	w9, w8, w9
 45e8098: b85403aa     	ldur	w10, [x29, #-0xc0]
 45e809c: 37000094     	tbnz	w20, #0x0, 0x45e80ac <_ChromeMain+0x45e2e10>
 45e80a0: 4b17034b     	sub	w11, w26, w23
 45e80a4: 0b0a016a     	add	w10, w11, w10
 45e80a8: 14000004     	b	0x45e80b8 <_ChromeMain+0x45e2e1c>
 45e80ac: b85483ab     	ldur	w11, [x29, #-0xb8]
 45e80b0: 4b1a014a     	sub	w10, w10, w26
 45e80b4: 0b0b014a     	add	w10, w10, w11
 45e80b8: b854c3ab     	ldur	w11, [x29, #-0xb4]
 45e80bc: 4b080168     	sub	w8, w11, w8
 45e80c0: 1e270140     	fmov	s0, w10
 45e80c4: b90133ea     	str	w10, [sp, #0x130]
 45e80c8: b90137e9     	str	w9, [sp, #0x134]
 45e80cc: 4e0c1d20     	mov.s	v0[1], w9
 45e80d0: 1e2702e1     	fmov	s1, w23
 45e80d4: 3d8003e1     	str	q1, [sp]
 45e80d8: 4e0c1d01     	mov.s	v1[1], w8
 45e80dc: 0ea10c01     	sqadd.2s	v1, v0, v1
 45e80e0: 0ea02c20     	sqsub.2s	v0, v1, v0
 45e80e4: 6f00e401     	movi.2d	v1, #0000000000000000
 45e80e8: 0ea16400     	smax.2s	v0, v0, v1
 45e80ec: fd004760     	str	d0, [x27, #0x88]
 45e80f0: f9406261     	ldr	x1, [x19, #0xc0]
 45e80f4: 9104c3e2     	add	x2, sp, #0x130
 45e80f8: aa1503e0     	mov	x0, x21
 45e80fc: d2800003     	mov	x3, #0x0                ; =0
 45e8100: 97036015     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e8104: f9406a68     	ldr	x8, [x19, #0xd0]
 45e8108: b4000488     	cbz	x8, 0x45e8198 <_ChromeMain+0x45e2efc>
 45e810c: f9401a69     	ldr	x9, [x19, #0x30]
 45e8110: b4000449     	cbz	x9, 0x45e8198 <_ChromeMain+0x45e2efc>
 45e8114: f940c50a     	ldr	x10, [x8, #0x188]
 45e8118: eb09015f     	cmp	x10, x9
 45e811c: 540003e1     	b.ne	0x45e8198 <_ChromeMain+0x45e2efc>
 45e8120: 39472108     	ldrb	w8, [x8, #0x1c8]
 45e8124: 340003a8     	cbz	w8, 0x45e8198 <_ChromeMain+0x45e2efc>
 45e8128: b85403a8     	ldur	w8, [x29, #-0xc0]
 45e812c: b85483a9     	ldur	w9, [x29, #-0xb8]
 45e8130: 4b17010a     	sub	w10, w8, w23
 45e8134: 0b090149     	add	w9, w10, w9
 45e8138: 7100029f     	cmp	w20, #0x0
 45e813c: 1a881128     	csel	w8, w9, w8, ne
 45e8140: 1e270100     	fmov	s0, w8
 45e8144: b94137e9     	ldr	w9, [sp, #0x134]
 45e8148: 9104c3ea     	add	x10, sp, #0x130
 45e814c: 9100314a     	add	x10, x10, #0xc
 45e8150: 291c27e8     	stp	w8, w9, [sp, #0xe0]
 45e8154: 4e0c1d20     	mov.s	v0[1], w9
 45e8158: 3dc003e1     	ldr	q1, [sp]
 45e815c: 0d409141     	ld1.s	{ v1 }[1], [x10]
 45e8160: 0ea10c01     	sqadd.2s	v1, v0, v1
 45e8164: 0ea02c20     	sqsub.2s	v0, v1, v0
 45e8168: 6f00e401     	movi.2d	v1, #0000000000000000
 45e816c: 0ea16400     	smax.2s	v0, v0, v1
 45e8170: fd001f60     	str	d0, [x27, #0x38]
 45e8174: f9406260     	ldr	x0, [x19, #0xc0]
 45e8178: 910383e1     	add	x1, sp, #0xe0
 45e817c: 94c4268f     	bl	0x76f1bb8 <_ChromeMain+0x76ec91c>
 45e8180: a90a8760     	stp	x0, x1, [x27, #0xa8]
 45e8184: f9406a61     	ldr	x1, [x19, #0xd0]
 45e8188: 910563e2     	add	x2, sp, #0x158
 45e818c: aa1503e0     	mov	x0, x21
 45e8190: d2800003     	mov	x3, #0x0                ; =0
 45e8194: 97035ff0     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e8198: 52000297     	eor	w23, w20, #0x1
 45e819c: b85483a8     	ldur	w8, [x29, #-0xb8]
 45e81a0: 6b1a011f     	cmp	w8, w26
 45e81a4: 1a9ab108     	csel	w8, w8, w26, lt
 45e81a8: d3607d08     	lsl	x8, x8, #32
 45e81ac: 7100029f     	cmp	w20, #0x0
 45e81b0: 9a8813e9     	csel	x9, xzr, x8, ne
 45e81b4: 9a9f1108     	csel	x8, x8, xzr, ne
 45e81b8: a9032369     	stp	x9, x8, [x27, #0x30]
 45e81bc: d10303a0     	sub	x0, x29, #0xc0
 45e81c0: 910383e1     	add	x1, sp, #0xe0
 45e81c4: 96f79379     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e81c8: 1e6e1000     	fmov	d0, #1.00000000
 45e81cc: 1e602100     	fcmp	d8, d0
 45e81d0: 54000201     	b.ne	0x45e8210 <_ChromeMain+0x45e2f74>
 45e81d4: 7100029f     	cmp	w20, #0x0
 45e81d8: 1a9a13e8     	csel	w8, wzr, w26, ne
 45e81dc: 6b080349     	subs	w9, w26, w8
 45e81e0: 131f7d2a     	asr	w10, w9, #31
 45e81e4: 5201014a     	eor	w10, w10, #0x80000000
 45e81e8: 1a896149     	csel	w9, w10, w9, vs
 45e81ec: d3607d29     	lsl	x9, x9, #32
 45e81f0: d3607d08     	lsl	x8, x8, #32
 45e81f4: a9032768     	stp	x8, x9, [x27, #0x30]
 45e81f8: d10343a0     	sub	x0, x29, #0xd0
 45e81fc: 910383e1     	add	x1, sp, #0xe0
 45e8200: 96f793ae     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e8204: 14000003     	b	0x45e8210 <_ChromeMain+0x45e2f74>
 45e8208: b9002bff     	str	wzr, [sp, #0x28]
 45e820c: 52800017     	mov	w23, #0x0               ; =0
 45e8210: a90aff7f     	stp	xzr, xzr, [x27, #0xa8]
 45e8214: f9409e68     	ldr	x8, [x19, #0x138]
 45e8218: 39424908     	ldrb	w8, [x8, #0x92]
 45e821c: 34000308     	cbz	w8, 0x45e827c <_ChromeMain+0x45e2fe0>
 45e8220: b9404388     	ldr	w8, [x28, #0x40]
 45e8224: 7100051f     	cmp	w8, #0x1
 45e8228: 1a9fa728     	csinc	w8, w25, wzr, ge
 45e822c: 37000288     	tbnz	w8, #0x0, 0x45e827c <_ChromeMain+0x45e2fe0>
 45e8230: f9401668     	ldr	x8, [x19, #0x28]
 45e8234: f9400519     	ldr	x25, [x8, #0x8]
 45e8238: b400c079     	cbz	x25, 0x45e9a44 <_ChromeMain+0x45e47a8>
 45e823c: f9429f28     	ldr	x8, [x25, #0x538]
 45e8240: f9404508     	ldr	x8, [x8, #0x88]
 45e8244: f9404908     	ldr	x8, [x8, #0x90]
 45e8248: b400b2a8     	cbz	x8, 0x45e989c <_ChromeMain+0x45e4600>
 45e824c: f940211a     	ldr	x26, [x8, #0x40]
 45e8250: aa1a03e0     	mov	x0, x26
 45e8254: 972ff59f     	bl	0x11e58d0 <_ChromeMain+0x11e0634>
 45e8258: 370000a0     	tbnz	w0, #0x0, 0x45e826c <_ChromeMain+0x45e2fd0>
 45e825c: aa1903e0     	mov	x0, x25
 45e8260: aa1a03e1     	mov	x1, x26
 45e8264: 972ff769     	bl	0x11e6008 <_ChromeMain+0x11e0d6c>
 45e8268: 3400a420     	cbz	w0, 0x45e96ec <_ChromeMain+0x45e4450>
 45e826c: 9107c320     	add	x0, x25, #0x1f0
 45e8270: 96fee360     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 45e8274: 52801e41     	mov	w1, #0xf2               ; =242
 45e8278: 9724ffd4     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 45e827c: 52802003     	mov	w3, #0x100              ; =256
 45e8280: f9402a61     	ldr	x1, [x19, #0x50]
 45e8284: d10303a2     	sub	x2, x29, #0xc0
 45e8288: aa1503e0     	mov	x0, x21
 45e828c: 97035fb2     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e8290: 37000736     	tbnz	w22, #0x0, 0x45e8374 <_ChromeMain+0x45e30d8>
 45e8294: f9402e61     	ldr	x1, [x19, #0x58]
 45e8298: b40006e1     	cbz	x1, 0x45e8374 <_ChromeMain+0x45e30d8>
 45e829c: f9401a68     	ldr	x8, [x19, #0x30]
 45e82a0: b40006a8     	cbz	x8, 0x45e8374 <_ChromeMain+0x45e30d8>
 45e82a4: f940c429     	ldr	x9, [x1, #0x188]
 45e82a8: eb08013f     	cmp	x9, x8
 45e82ac: 54000641     	b.ne	0x45e8374 <_ChromeMain+0x45e30d8>
 45e82b0: a9037f7f     	stp	xzr, xzr, [x27, #0x30]
 45e82b4: 910383e2     	add	x2, sp, #0xe0
 45e82b8: aa1503e0     	mov	x0, x21
 45e82bc: d2800003     	mov	x3, #0x0                ; =0
 45e82c0: 97035fa5     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e82c4: aa0003f8     	mov	x24, x0
 45e82c8: 6f00e400     	movi.2d	v0, #0000000000000000
 45e82cc: ad0403e0     	stp	q0, q0, [sp, #0x80]
 45e82d0: 3d802be0     	str	q0, [sp, #0xa0]
 45e82d4: d10303a0     	sub	x0, x29, #0xc0
 45e82d8: d10303a1     	sub	x1, x29, #0xc0
 45e82dc: 9738fc3a     	bl	0x14273c4 <_ChromeMain+0x1422128>
 45e82e0: 3600bc40     	tbz	w0, #0x0, 0x45e9a68 <_ChromeMain+0x45e47cc>
 45e82e4: d10303a0     	sub	x0, x29, #0xc0
 45e82e8: d10303a1     	sub	x1, x29, #0xc0
 45e82ec: 96f79320     	bl	0x3ccf6c <_ChromeMain+0x3c7cd0>
 45e82f0: a9030760     	stp	x0, x1, [x27, #0x30]
 45e82f4: d10303a8     	sub	x8, x29, #0xc0
 45e82f8: ad400500     	ldp	q0, q1, [x8]
 45e82fc: ad0407e0     	stp	q0, q1, [sp, #0x80]
 45e8300: 3dc00900     	ldr	q0, [x8, #0x20]
 45e8304: 3d802be0     	str	q0, [sp, #0xa0]
 45e8308: 910203e0     	add	x0, sp, #0x80
 45e830c: 910383e1     	add	x1, sp, #0xe0
 45e8310: 96f79326     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e8314: f90043ff     	str	xzr, [sp, #0x80]
 45e8318: fd4047e0     	ldr	d0, [sp, #0x88]
 45e831c: 6f00e401     	movi.2d	v1, #0000000000000000
 45e8320: 0ea16400     	smax.2s	v0, v0, v1
 45e8324: fd0047e0     	str	d0, [sp, #0x88]
 45e8328: 910203e2     	add	x2, sp, #0x80
 45e832c: aa1303e0     	mov	x0, x19
 45e8330: aa1803e1     	mov	x1, x24
 45e8334: b94027e3     	ldr	w3, [sp, #0x24]
 45e8338: 94000662     	bl	0x45e9cc0 <_ChromeMain+0x45e4a24>
 45e833c: a9080760     	stp	x0, x1, [x27, #0x80]
 45e8340: 9104c3e1     	add	x1, sp, #0x130
 45e8344: d10303a2     	sub	x2, x29, #0xc0
 45e8348: aa1303e0     	mov	x0, x19
 45e834c: 97dafe03     	bl	0x3ca7b58 <_ChromeMain+0x3ca28bc>
 45e8350: a9000700     	stp	x0, x1, [x24]
 45e8354: d360fc28     	lsr	x8, x1, #32
 45e8358: 8b408108     	add	x8, x8, x0, lsr #32
 45e835c: b85443a9     	ldur	w9, [x29, #-0xbc]
 45e8360: 4b090108     	sub	w8, w8, w9
 45e8364: a9037f68     	stp	x8, xzr, [x27, #0x30]
 45e8368: d10303a0     	sub	x0, x29, #0xc0
 45e836c: 910383e1     	add	x1, sp, #0xe0
 45e8370: 96f7930e     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e8374: f9401674     	ldr	x20, [x19, #0x28]
 45e8378: f9400688     	ldr	x8, [x20, #0x8]
 45e837c: b400b4a8     	cbz	x8, 0x45e9a10 <_ChromeMain+0x45e4774>
 45e8380: f9432116     	ldr	x22, [x8, #0x640]
 45e8384: b4008cd6     	cbz	x22, 0x45e951c <_ChromeMain+0x45e4280>
 45e8388: 90044941     	adrp	x1, 0xcf10000 <dyld_stub_binder+0xcf10000>
 45e838c: 91288021     	add	x1, x1, #0xa20
 45e8390: aa1603e0     	mov	x0, x22
 45e8394: 9707b63b     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 45e8398: d360fc08     	lsr	x8, x0, #32
 45e839c: b4008c08     	cbz	x8, 0x45e951c <_ChromeMain+0x45e4280>
 45e83a0: f9400688     	ldr	x8, [x20, #0x8]
 45e83a4: b400b3c8     	cbz	x8, 0x45e9a1c <_ChromeMain+0x45e4780>
 45e83a8: f940f909     	ldr	x9, [x8, #0x1f0]
 45e83ac: f9403129     	ldr	x9, [x9, #0x60]
 45e83b0: 90fe042a     	adrp	x10, 0x66c000 <_ChromeMain+0x666d64>
 45e83b4: 9139414a     	add	x10, x10, #0xe50
 45e83b8: eb0a013f     	cmp	x9, x10
 45e83bc: 54005bc1     	b.ne	0x45e8f34 <_ChromeMain+0x45e3c98>
 45e83c0: f941b900     	ldr	x0, [x8, #0x370]
 45e83c4: 972ff3c7     	bl	0x11e52e0 <_ChromeMain+0x11e0044>
 45e83c8: 3500b300     	cbnz	w0, 0x45e9a28 <_ChromeMain+0x45e478c>
 45e83cc: 52800038     	mov	w24, #0x1               ; =1
 45e83d0: f9405661     	ldr	x1, [x19, #0xa8]
 45e83d4: b40005e1     	cbz	x1, 0x45e8490 <_ChromeMain+0x45e31f4>
 45e83d8: f9401a68     	ldr	x8, [x19, #0x30]
 45e83dc: b40005a8     	cbz	x8, 0x45e8490 <_ChromeMain+0x45e31f4>
 45e83e0: f940c429     	ldr	x9, [x1, #0x188]
 45e83e4: eb08013f     	cmp	x9, x8
 45e83e8: 54000541     	b.ne	0x45e8490 <_ChromeMain+0x45e31f4>
 45e83ec: a9087f7f     	stp	xzr, xzr, [x27, #0x80]
 45e83f0: 34000478     	cbz	w24, 0x45e847c <_ChromeMain+0x45e31e0>
 45e83f4: f9409e68     	ldr	x8, [x19, #0x138]
 45e83f8: 39424908     	ldrb	w8, [x8, #0x92]
 45e83fc: 370000c8     	tbnz	w8, #0x0, 0x45e8414 <_ChromeMain+0x45e3178>
 45e8400: f9401660     	ldr	x0, [x19, #0x28]
 45e8404: 97dafd5a     	bl	0x3ca796c <_ChromeMain+0x3ca26d0>
 45e8408: aa0003f6     	mov	x22, x0
 45e840c: f9405661     	ldr	x1, [x19, #0xa8]
 45e8410: 14000002     	b	0x45e8418 <_ChromeMain+0x45e317c>
 45e8414: 52800016     	mov	w22, #0x0               ; =0
 45e8418: 900487e8     	adrp	x8, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 45e841c: 91396108     	add	x8, x8, #0xe58
 45e8420: aa0103e0     	mov	x0, x1
 45e8424: aa0803e1     	mov	x1, x8
 45e8428: 9707b616     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 45e842c: d360fc08     	lsr	x8, x0, #32
 45e8430: 29682ba9     	ldp	w9, w10, [x29, #-0xc0]
 45e8434: 1e270120     	fmov	s0, w9
 45e8438: 0b16014a     	add	w10, w10, w22
 45e843c: d10303ab     	sub	x11, x29, #0xc0
 45e8440: fd400561     	ldr	d1, [x11, #0x8]
 45e8444: b90133e9     	str	w9, [sp, #0x130]
 45e8448: b90137ea     	str	w10, [sp, #0x134]
 45e844c: 4e0c1d40     	mov.s	v0[1], w10
 45e8450: 4e0c1d01     	mov.s	v1[1], w8
 45e8454: 0ea10c01     	sqadd.2s	v1, v0, v1
 45e8458: 0ea02c20     	sqsub.2s	v0, v1, v0
 45e845c: 6f00e401     	movi.2d	v1, #0000000000000000
 45e8460: 0ea16400     	smax.2s	v0, v0, v1
 45e8464: fd004760     	str	d0, [x27, #0x88]
 45e8468: a9037f68     	stp	x8, xzr, [x27, #0x30]
 45e846c: d10303a0     	sub	x0, x29, #0xc0
 45e8470: 910383e1     	add	x1, sp, #0xe0
 45e8474: 96f792cd     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e8478: f9405661     	ldr	x1, [x19, #0xa8]
 45e847c: 2a1803e8     	mov	w8, w24
 45e8480: 9104c3e2     	add	x2, sp, #0x130
 45e8484: b2780103     	orr	x3, x8, #0x100
 45e8488: aa1503e0     	mov	x0, x21
 45e848c: 97035f32     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e8490: b85443b4     	ldur	w20, [x29, #-0xbc]
 45e8494: f9402e61     	ldr	x1, [x19, #0x58]
 45e8498: aa1503e0     	mov	x0, x21
 45e849c: 9738f907     	bl	0x14268b8 <_ChromeMain+0x142161c>
 45e84a0: b4001820     	cbz	x0, 0x45e87a4 <_ChromeMain+0x45e3508>
 45e84a4: b9400416     	ldr	w22, [x0, #0x4]
 45e84a8: f9406e61     	ldr	x1, [x19, #0xd8]
 45e84ac: aa1503e0     	mov	x0, x21
 45e84b0: 9738f902     	bl	0x14268b8 <_ChromeMain+0x142161c>
 45e84b4: b40001a0     	cbz	x0, 0x45e84e8 <_ChromeMain+0x45e324c>
 45e84b8: 39404408     	ldrb	w8, [x0, #0x11]
 45e84bc: 34000168     	cbz	w8, 0x45e84e8 <_ChromeMain+0x45e324c>
 45e84c0: 39404008     	ldrb	w8, [x0, #0x10]
 45e84c4: 34000128     	cbz	w8, 0x45e84e8 <_ChromeMain+0x45e324c>
 45e84c8: b9400808     	ldr	w8, [x0, #0x8]
 45e84cc: 340000e8     	cbz	w8, 0x45e84e8 <_ChromeMain+0x45e324c>
 45e84d0: b9400c08     	ldr	w8, [x0, #0xc]
 45e84d4: 340000a8     	cbz	w8, 0x45e84e8 <_ChromeMain+0x45e324c>
 45e84d8: b9400408     	ldr	w8, [x0, #0x4]
 45e84dc: 0b160108     	add	w8, w8, w22
 45e84e0: 6b14011f     	cmp	w8, w20
 45e84e4: 1a94b114     	csel	w20, w8, w20, lt
 45e84e8: f9407261     	ldr	x1, [x19, #0xe0]
 45e84ec: aa1503e0     	mov	x0, x21
 45e84f0: 9738f8f2     	bl	0x14268b8 <_ChromeMain+0x142161c>
 45e84f4: b40001a0     	cbz	x0, 0x45e8528 <_ChromeMain+0x45e328c>
 45e84f8: 39404408     	ldrb	w8, [x0, #0x11]
 45e84fc: 34000168     	cbz	w8, 0x45e8528 <_ChromeMain+0x45e328c>
 45e8500: 39404008     	ldrb	w8, [x0, #0x10]
 45e8504: 34000128     	cbz	w8, 0x45e8528 <_ChromeMain+0x45e328c>
 45e8508: b9400808     	ldr	w8, [x0, #0x8]
 45e850c: 340000e8     	cbz	w8, 0x45e8528 <_ChromeMain+0x45e328c>
 45e8510: b9400c08     	ldr	w8, [x0, #0xc]
 45e8514: 340000a8     	cbz	w8, 0x45e8528 <_ChromeMain+0x45e328c>
 45e8518: b9400408     	ldr	w8, [x0, #0x4]
 45e851c: 0b160108     	add	w8, w8, w22
 45e8520: 6b14011f     	cmp	w8, w20
 45e8524: 1a94b114     	csel	w20, w8, w20, lt
 45e8528: 52800019     	mov	w25, #0x0               ; =0
 45e852c: f9406676     	ldr	x22, [x19, #0xc8]
 45e8530: b4009c36     	cbz	x22, 0x45e98b4 <_ChromeMain+0x45e4618>
 45e8534: f9401a68     	ldr	x8, [x19, #0x30]
 45e8538: b4009be8     	cbz	x8, 0x45e98b4 <_ChromeMain+0x45e4618>
 45e853c: f940c6c9     	ldr	x9, [x22, #0x188]
 45e8540: eb08013f     	cmp	x9, x8
 45e8544: 54007fe0     	b.eq	0x45e9540 <_ChromeMain+0x45e42a4>
 45e8548: 52800019     	mov	w25, #0x0               ; =0
 45e854c: 5280001a     	mov	w26, #0x0               ; =0
 45e8550: f9405a60     	ldr	x0, [x19, #0xb0]
 45e8554: 39504408     	ldrb	w8, [x0, #0x411]
 45e8558: 6b19011f     	cmp	w8, w25
 45e855c: 540000a0     	b.eq	0x45e8570 <_ChromeMain+0x45e32d4>
 45e8560: 39104419     	strb	w25, [x0, #0x411]
 45e8564: 52800021     	mov	w1, #0x1                ; =1
 45e8568: 97011fc3     	bl	0x630474 <_ChromeMain+0x62b1d8>
 45e856c: f9405a60     	ldr	x0, [x19, #0xb0]
 45e8570: 39504808     	ldrb	w8, [x0, #0x412]
 45e8574: 6b1a011f     	cmp	w8, w26
 45e8578: 54000080     	b.eq	0x45e8588 <_ChromeMain+0x45e32ec>
 45e857c: 3910481a     	strb	w26, [x0, #0x412]
 45e8580: 52800021     	mov	w1, #0x1                ; =1
 45e8584: 97011fbc     	bl	0x630474 <_ChromeMain+0x62b1d8>
 45e8588: f9409e74     	ldr	x20, [x19, #0x138]
 45e858c: f9407261     	ldr	x1, [x19, #0xe0]
 45e8590: aa1503e0     	mov	x0, x21
 45e8594: 9738f8c9     	bl	0x14268b8 <_ChromeMain+0x142161c>
 45e8598: b4000100     	cbz	x0, 0x45e85b8 <_ChromeMain+0x45e331c>
 45e859c: 39404408     	ldrb	w8, [x0, #0x11]
 45e85a0: 360000c8     	tbz	w8, #0x0, 0x45e85b8 <_ChromeMain+0x45e331c>
 45e85a4: 39404008     	ldrb	w8, [x0, #0x10]
 45e85a8: 39424689     	ldrb	w9, [x20, #0x91]
 45e85ac: 7100011f     	cmp	w8, #0x0
 45e85b0: 1a8913e9     	csel	w9, wzr, w9, ne
 45e85b4: 14000002     	b	0x45e85bc <_ChromeMain+0x45e3320>
 45e85b8: 39424689     	ldrb	w9, [x20, #0x91]
 45e85bc: f9405a68     	ldr	x8, [x19, #0xb0]
 45e85c0: 3950410a     	ldrb	w10, [x8, #0x410]
 45e85c4: 6b29015f     	cmp	w10, w9, uxtb
 45e85c8: 54008ea1     	b.ne	0x45e979c <_ChromeMain+0x45e4500>
 45e85cc: 39414789     	ldrb	w9, [x28, #0x51]
 45e85d0: 35008749     	cbnz	w9, 0x45e96b8 <_ChromeMain+0x45e441c>
 45e85d4: f9401fe9     	ldr	x9, [sp, #0x38]
 45e85d8: b9402bea     	ldr	w10, [sp, #0x28]
 45e85dc: 3600006a     	tbz	w10, #0x0, 0x45e85e8 <_ChromeMain+0x45e334c>
 45e85e0: 52800036     	mov	w22, #0x1               ; =1
 45e85e4: 14000004     	b	0x45e85f4 <_ChromeMain+0x45e3358>
 45e85e8: f9402d29     	ldr	x9, [x9, #0x58]
 45e85ec: f100013f     	cmp	x9, #0x0
 45e85f0: 1a9f07f6     	cset	w22, ne
 45e85f4: f941d909     	ldr	x9, [x8, #0x3b0]
 45e85f8: d37df134     	lsl	x20, x9, #3
 45e85fc: b4000134     	cbz	x20, 0x45e8620 <_ChromeMain+0x45e3384>
 45e8600: f941d517     	ldr	x23, [x8, #0x3a8]
 45e8604: f84086e8     	ldr	x8, [x23], #0x8
 45e8608: f941b900     	ldr	x0, [x8, #0x370]
 45e860c: aa1603e1     	mov	x1, x22
 45e8610: 9730c428     	bl	0x12196b0 <_ChromeMain+0x1214414>
 45e8614: f1002294     	subs	x20, x20, #0x8
 45e8618: 54ffff61     	b.ne	0x45e8604 <_ChromeMain+0x45e3368>
 45e861c: f9405a68     	ldr	x8, [x19, #0xb0]
 45e8620: f9401a69     	ldr	x9, [x19, #0x30]
 45e8624: f100011f     	cmp	x8, #0x0
 45e8628: fa401924     	ccmp	x9, #0x0, #0x4, ne
 45e862c: 54009da0     	b.eq	0x45e99e0 <_ChromeMain+0x45e4744>
 45e8630: f940c50a     	ldr	x10, [x8, #0x188]
 45e8634: eb09015f     	cmp	x10, x9
 45e8638: 54009d41     	b.ne	0x45e99e0 <_ChromeMain+0x45e4744>
 45e863c: 39472109     	ldrb	w9, [x8, #0x1c8]
 45e8640: 36009d09     	tbz	w9, #0x0, 0x45e99e0 <_ChromeMain+0x45e4744>
 45e8644: b85403a9     	ldur	w9, [x29, #-0xc0]
 45e8648: b85483ab     	ldur	w11, [x29, #-0xb8]
 45e864c: 0b09016a     	add	w10, w11, w9
 45e8650: b9404b8c     	ldr	w12, [x28, #0x48]
 45e8654: 4b0b018b     	sub	w11, w12, w11
 45e8658: 7100057f     	cmp	w11, #0x1
 45e865c: 54000a0b     	b.lt	0x45e879c <_ChromeMain+0x45e3500>
 45e8660: f9401bf7     	ldr	x23, [sp, #0x30]
 45e8664: b94002eb     	ldr	w11, [x23]
 45e8668: 6b0b013f     	cmp	w9, w11
 45e866c: 1a8bc129     	csel	w9, w9, w11, gt
 45e8670: b9400aec     	ldr	w12, [x23, #0x8]
 45e8674: 0b0b018b     	add	w11, w12, w11
 45e8678: 6b0a017f     	cmp	w11, w10
 45e867c: 1a8ab16a     	csel	w10, w11, w10, lt
 45e8680: b85443ab     	ldur	w11, [x29, #-0xbc]
 45e8684: 4b09014a     	sub	w10, w10, w9
 45e8688: 1e270140     	fmov	s0, w10
 45e868c: 1e270121     	fmov	s1, w9
 45e8690: d10303aa     	sub	x10, x29, #0xc0
 45e8694: b27e054a     	orr	x10, x10, #0xc
 45e8698: 4e0c1d61     	mov.s	v1[1], w11
 45e869c: 0d409140     	ld1.s	{ v0 }[1], [x10]
 45e86a0: 291c2fe9     	stp	w9, w11, [sp, #0xe0]
 45e86a4: 0ea00c20     	sqadd.2s	v0, v1, v0
 45e86a8: 0ea12c00     	sqsub.2s	v0, v0, v1
 45e86ac: 6f00e401     	movi.2d	v1, #0000000000000000
 45e86b0: 0ea16400     	smax.2s	v0, v0, v1
 45e86b4: fd001f60     	str	d0, [x27, #0x38]
 45e86b8: 910383e2     	add	x2, sp, #0xe0
 45e86bc: aa1503e0     	mov	x0, x21
 45e86c0: aa0803e1     	mov	x1, x8
 45e86c4: d2800003     	mov	x3, #0x0                ; =0
 45e86c8: 97035ea3     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e86cc: aa0003f6     	mov	x22, x0
 45e86d0: d0052e00     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 45e86d4: 91106000     	add	x0, x0, #0x418
 45e86d8: 96ecc2ea     	bl	0x119280 <_ChromeMain+0x113fe4>
 45e86dc: 35001700     	cbnz	w0, 0x45e89bc <_ChromeMain+0x45e3720>
 45e86e0: 39448268     	ldrb	w8, [x19, #0x120]
 45e86e4: 340002c8     	cbz	w8, 0x45e873c <_ChromeMain+0x45e34a0>
 45e86e8: a9087f7f     	stp	xzr, xzr, [x27, #0x80]
 45e86ec: f9409e68     	ldr	x8, [x19, #0x138]
 45e86f0: b9403509     	ldr	w9, [x8, #0x34]
 45e86f4: 7100053f     	cmp	w9, #0x1
 45e86f8: 540001c1     	b.ne	0x45e8730 <_ChromeMain+0x45e3494>
 45e86fc: b9403108     	ldr	w8, [x8, #0x30]
 45e8700: 121f7908     	and	w8, w8, #0xfffffffe
 45e8704: 7100091f     	cmp	w8, #0x2
 45e8708: 54000140     	b.eq	0x45e8730 <_ChromeMain+0x45e3494>
 45e870c: 96f6bdad     	bl	0x397dc0 <_ChromeMain+0x392b24>
 45e8710: 34008520     	cbz	w0, 0x45e97b4 <_ChromeMain+0x45e4518>
 45e8714: 90052ec8     	adrp	x8, 0xebc0000 <dyld_stub_binder+0xebc0000>
 45e8718: b9414d08     	ldr	w8, [x8, #0x14c]
 45e871c: 379084c8     	tbnz	w8, #0x12, 0x45e97b4 <_ChromeMain+0x45e4518>
 45e8720: d0051880     	adrp	x0, 0xe8fa000 <dyld_stub_binder+0xe8fa000>
 45e8724: 91190000     	add	x0, x0, #0x640
 45e8728: 972ff770     	bl	0x11e64e8 <_ChromeMain+0x11e124c>
 45e872c: 35008840     	cbnz	w0, 0x45e9834 <_ChromeMain+0x45e4598>
 45e8730: f9405a60     	ldr	x0, [x19, #0xb0]
 45e8734: 9104c3e1     	add	x1, sp, #0x130
 45e8738: 940028b5     	bl	0x45f2a0c <_ChromeMain+0x45ed770>
 45e873c: f9409e68     	ldr	x8, [x19, #0x138]
 45e8740: b9403508     	ldr	w8, [x8, #0x34]
 45e8744: 7100051f     	cmp	w8, #0x1
 45e8748: 54000320     	b.eq	0x45e87ac <_ChromeMain+0x45e3510>
 45e874c: 52801348     	mov	w8, #0x9a               ; =154
 45e8750: f9001b68     	str	x8, [x27, #0x30]
 45e8754: b0054908     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 45e8758: 39580900     	ldrb	w0, [x8, #0x602]
 45e875c: 35008d60     	cbnz	w0, 0x45e9908 <_ChromeMain+0x45e466c>
 45e8760: f85883a8     	ldur	x8, [x29, #-0x78]
 45e8764: 9004d209     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 45e8768: f940f929     	ldr	x9, [x9, #0x1f0]
 45e876c: f9400129     	ldr	x9, [x9]
 45e8770: eb08013f     	cmp	x9, x8
 45e8774: 540090e1     	b.ne	0x45e9990 <_ChromeMain+0x45e46f4>
 45e8778: 910843ff     	add	sp, sp, #0x210
 45e877c: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 45e8780: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 45e8784: a94457f6     	ldp	x22, x21, [sp, #0x40]
 45e8788: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 45e878c: a94267fa     	ldp	x26, x25, [sp, #0x20]
 45e8790: a9416ffc     	ldp	x28, x27, [sp, #0x10]
 45e8794: 6cc723e9     	ldp	d9, d8, [sp], #0x70
 45e8798: d65f03c0     	ret
 45e879c: f9401bf7     	ldr	x23, [sp, #0x30]
 45e87a0: 17ffffb8     	b	0x45e8680 <_ChromeMain+0x45e33e4>
 45e87a4: 52800016     	mov	w22, #0x0               ; =0
 45e87a8: 17ffff40     	b	0x45e84a8 <_ChromeMain+0x45e320c>
 45e87ac: a9037f7f     	stp	xzr, xzr, [x27, #0x30]
 45e87b0: b900f3ff     	str	wzr, [sp, #0xf0]
 45e87b4: f9405261     	ldr	x1, [x19, #0xa0]
 45e87b8: f9401a62     	ldr	x2, [x19, #0x30]
 45e87bc: 910383e8     	add	x8, sp, #0xe0
 45e87c0: aa1503e0     	mov	x0, x21
 45e87c4: 95fffcdc     	bl	0xc5e7b34 <_ChromeMain+0xc5e2898>
 45e87c8: a9087f7f     	stp	xzr, xzr, [x27, #0x80]
 45e87cc: b90143ff     	str	wzr, [sp, #0x140]
 45e87d0: f9403e61     	ldr	x1, [x19, #0x78]
 45e87d4: f9401a62     	ldr	x2, [x19, #0x30]
 45e87d8: 9104c3e8     	add	x8, sp, #0x130
 45e87dc: aa1503e0     	mov	x0, x21
 45e87e0: 95fffcd5     	bl	0xc5e7b34 <_ChromeMain+0xc5e2898>
 45e87e4: 394503e8     	ldrb	w8, [sp, #0x140]
 45e87e8: 360095e8     	tbz	w8, #0x0, 0x45e9aa4 <_ChromeMain+0x45e4808>
 45e87ec: 3943c3e8     	ldrb	w8, [sp, #0xf0]
 45e87f0: b94017e9     	ldr	w9, [sp, #0x14]
 45e87f4: 6a08013f     	tst	w9, w8
 45e87f8: 54000081     	b.ne	0x45e8808 <_ChromeMain+0x45e356c>
 45e87fc: 52800008     	mov	w8, #0x0                ; =0
 45e8800: 52800009     	mov	w9, #0x0                ; =0
 45e8804: 14000016     	b	0x45e885c <_ChromeMain+0x45e35c0>
 45e8808: b940e7e8     	ldr	w8, [sp, #0xe4]
 45e880c: b940efe9     	ldr	w9, [sp, #0xec]
 45e8810: 0b090108     	add	w8, w8, w9
 45e8814: b94137e9     	ldr	w9, [sp, #0x134]
 45e8818: b94133ea     	ldr	w10, [sp, #0x130]
 45e881c: b94013eb     	ldr	w11, [sp, #0x10]
 45e8820: 0b090169     	add	w9, w11, w9
 45e8824: 4b090108     	sub	w8, w8, w9
 45e8828: bd4012e0     	ldr	s0, [x23, #0x10]
 45e882c: 1e24c000     	frintp	s0, s0
 45e8830: 0f0665e1     	movi.2s	v1, #0xcf, lsl #24
 45e8834: 1e212000     	fcmp	s0, s1
 45e8838: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45e883c: 1e216801     	fmaxnm	s1, s0, s1
 45e8840: 1e38002b     	fcvtzs	w11, s1
 45e8844: 1a89b3e9     	csel	w9, wzr, w9, lt
 45e8848: 12b6200c     	mov	w12, #0x4effffff        ; =1325400063
 45e884c: 1e270181     	fmov	s1, w12
 45e8850: 1e212000     	fcmp	s0, s1
 45e8854: 1a899169     	csel	w9, w11, w9, ls
 45e8858: 4b0a0129     	sub	w9, w9, w10
 45e885c: f9403e60     	ldr	x0, [x19, #0x78]
 45e8860: 39683018     	ldrb	w24, [x0, #0xa0c]
 45e8864: 7100031f     	cmp	w24, #0x0
 45e8868: 1a8813f6     	csel	w22, wzr, w8, ne
 45e886c: 1a8913f7     	csel	w23, wzr, w9, ne
 45e8870: 0ab67ec1     	bic	w1, w22, w22, asr #31
 45e8874: 94018e13     	bl	0x464c0c0 <_ChromeMain+0x4646e24>
 45e8878: f9403e75     	ldr	x21, [x19, #0x78]
 45e887c: 0ab77ee8     	bic	w8, w23, w23, asr #31
 45e8880: 396832a9     	ldrb	w9, [x21, #0xa0c]
 45e8884: 7100013f     	cmp	w9, #0x0
 45e8888: 1a8813e8     	csel	w8, wzr, w8, ne
 45e888c: b908c2a8     	str	w8, [x21, #0x8c0]
 45e8890: f942cab4     	ldr	x20, [x21, #0x590]
 45e8894: b943ae89     	ldr	w9, [x20, #0x3ac]
 45e8898: 6b08013f     	cmp	w9, w8
 45e889c: 540000c0     	b.eq	0x45e88b4 <_ChromeMain+0x45e3618>
 45e88a0: b903ae88     	str	w8, [x20, #0x3ac]
 45e88a4: aa1403e0     	mov	x0, x20
 45e88a8: 52800021     	mov	w1, #0x1                ; =1
 45e88ac: 97011ef2     	bl	0x630474 <_ChromeMain+0x62b1d8>
 45e88b0: f942cab4     	ldr	x20, [x21, #0x590]
 45e88b4: aa1503e0     	mov	x0, x21
 45e88b8: 9401a112     	bl	0x4650d00 <_ChromeMain+0x464ba64>
 45e88bc: 394ee288     	ldrb	w8, [x20, #0x3b8]
 45e88c0: 6b00011f     	cmp	w8, w0
 45e88c4: 540000a0     	b.eq	0x45e88d8 <_ChromeMain+0x45e363c>
 45e88c8: 390ee280     	strb	w0, [x20, #0x3b8]
 45e88cc: aa1403e0     	mov	x0, x20
 45e88d0: 52800001     	mov	w1, #0x0                ; =0
 45e88d4: 97011ee8     	bl	0x630474 <_ChromeMain+0x62b1d8>
 45e88d8: 528007a0     	mov	w0, #0x3d               ; =61
 45e88dc: 96fc6bf9     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 45e88e0: f9403e68     	ldr	x8, [x19, #0x78]
 45e88e4: 35000078     	cbnz	w24, 0x45e88f0 <_ChromeMain+0x45e3654>
 45e88e8: b948c909     	ldr	w9, [x8, #0x8c8]
 45e88ec: 14000006     	b	0x45e8904 <_ChromeMain+0x45e3668>
 45e88f0: f9442509     	ldr	x9, [x8, #0x848]
 45e88f4: b9409529     	ldr	w9, [x9, #0x94]
 45e88f8: 5280230a     	mov	w10, #0x118             ; =280
 45e88fc: 7104613f     	cmp	w9, #0x118
 45e8900: 1a8ac129     	csel	w9, w9, w10, gt
 45e8904: 4b000521     	sub	w1, w9, w0, lsl #1
 45e8908: f942c900     	ldr	x0, [x8, #0x590]
 45e890c: 94e73a3f     	bl	0x7fb7208 <_ChromeMain+0x7fb1f6c>
 45e8910: aa0003f4     	mov	x20, x0
 45e8914: f9403e68     	ldr	x8, [x19, #0x78]
 45e8918: f9401ff5     	ldr	x21, [sp, #0x38]
 45e891c: f9402ea9     	ldr	x9, [x21, #0x58]
 45e8920: b4000109     	cbz	x9, 0x45e8940 <_ChromeMain+0x45e36a4>
 45e8924: fd403ea0     	ldr	d0, [x21, #0x78]
 45e8928: 1e602008     	fcmp	d0, #0.0
 45e892c: 540000ad     	b.le	0x45e8940 <_ChromeMain+0x45e36a4>
 45e8930: b94062a9     	ldr	w9, [x21, #0x60]
 45e8934: 7100013f     	cmp	w9, #0x0
 45e8938: 1a9fd7e1     	cset	w1, gt
 45e893c: 14000002     	b	0x45e8944 <_ChromeMain+0x45e36a8>
 45e8940: 52800001     	mov	w1, #0x0                ; =0
 45e8944: f942c900     	ldr	x0, [x8, #0x590]
 45e8948: 94e73b37     	bl	0x7fb7624 <_ChromeMain+0x7fb2388>
 45e894c: 710006df     	cmp	w22, #0x1
 45e8950: 7a41aae8     	ccmp	w23, #0x1, #0x8, ge
 45e8954: 1a9fa688     	csinc	w8, w20, wzr, ge
 45e8958: 1e2e1000     	fmov	s0, #1.00000000
 45e895c: 370002a8     	tbnz	w8, #0x0, 0x45e89b0 <_ChromeMain+0x45e3714>
 45e8960: f9402ea8     	ldr	x8, [x21, #0x58]
 45e8964: f0051489     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45e8968: 910a6129     	add	x9, x9, #0x298
 45e896c: eb09011f     	cmp	x8, x9
 45e8970: 540000a0     	b.eq	0x45e8984 <_ChromeMain+0x45e36e8>
 45e8974: f0051489     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45e8978: 910a8129     	add	x9, x9, #0x2a0
 45e897c: eb09011f     	cmp	x8, x9
 45e8980: 54000181     	b.ne	0x45e89b0 <_ChromeMain+0x45e3714>
 45e8984: fd4046a1     	ldr	d1, [x21, #0x88]
 45e8988: 9004cb28     	adrp	x8, 0xdf4c000 <dyld_stub_binder+0xdf4c000>
 45e898c: fd412d00     	ldr	d0, [x8, #0x258]
 45e8990: 1e602020     	fcmp	d1, d0
 45e8994: 540076c5     	b.pl	0x45e986c <_ChromeMain+0x45e45d0>
 45e8998: f004cb28     	adrp	x8, 0xdf4f000 <dyld_stub_binder+0xdf4f000>
 45e899c: fd436500     	ldr	d0, [x8, #0x6c8]
 45e89a0: 1e601820     	fdiv	d0, d1, d0
 45e89a4: 1e6e1001     	fmov	d1, #1.00000000
 45e89a8: 1e612800     	fadd	d0, d0, d1
 45e89ac: 1e624000     	fcvt	s0, d0
 45e89b0: f9403e60     	ldr	x0, [x19, #0x78]
 45e89b4: 95fffc96     	bl	0xc5e7c0c <_ChromeMain+0xc5e2970>
 45e89b8: 17ffff65     	b	0x45e874c <_ChromeMain+0x45e34b0>
 45e89bc: f9409e68     	ldr	x8, [x19, #0x138]
 45e89c0: b9403109     	ldr	w9, [x8, #0x30]
 45e89c4: 7100093f     	cmp	w9, #0x2
 45e89c8: 54000201     	b.ne	0x45e8a08 <_ChromeMain+0x45e376c>
 45e89cc: f9401669     	ldr	x9, [x19, #0x28]
 45e89d0: f9400529     	ldr	x9, [x9, #0x8]
 45e89d4: b4008629     	cbz	x9, 0x45e9a98 <_ChromeMain+0x45e47fc>
 45e89d8: f9429d29     	ldr	x9, [x9, #0x538]
 45e89dc: f9404529     	ldr	x9, [x9, #0x88]
 45e89e0: f9404929     	ldr	x9, [x9, #0x90]
 45e89e4: b4000149     	cbz	x9, 0x45e8a0c <_ChromeMain+0x45e3770>
 45e89e8: 3941e129     	ldrb	w9, [x9, #0x78]
 45e89ec: 14000008     	b	0x45e8a0c <_ChromeMain+0x45e3770>
 45e89f0: f9405a60     	ldr	x0, [x19, #0xb0]
 45e89f4: 390113ff     	strb	wzr, [sp, #0x44]
 45e89f8: 390173ff     	strb	wzr, [sp, #0x5c]
 45e89fc: 910113e1     	add	x1, sp, #0x44
 45e8a00: 95fffc86     	bl	0xc5e7c18 <_ChromeMain+0xc5e297c>
 45e8a04: 17ffff37     	b	0x45e86e0 <_ChromeMain+0x45e3444>
 45e8a08: 52800009     	mov	w9, #0x0                ; =0
 45e8a0c: 3707ff29     	tbnz	w9, #0x0, 0x45e89f0 <_ChromeMain+0x45e3754>
 45e8a10: b9402fe9     	ldr	w9, [sp, #0x2c]
 45e8a14: 52000129     	eor	w9, w9, #0x1
 45e8a18: 3707fec9     	tbnz	w9, #0x0, 0x45e89f0 <_ChromeMain+0x45e3754>
 45e8a1c: b94006c9     	ldr	w9, [x22, #0x4]
 45e8a20: b9400eca     	ldr	w10, [x22, #0xc]
 45e8a24: 2b0a012a     	adds	w10, w9, w10
 45e8a28: 131f7d4b     	asr	w11, w10, #31
 45e8a2c: 5201016b     	eor	w11, w11, #0x80000000
 45e8a30: 1a8a616a     	csel	w10, w11, w10, vs
 45e8a34: 6b09014a     	subs	w10, w10, w9
 45e8a38: 131f7d4b     	asr	w11, w10, #31
 45e8a3c: 5201016b     	eor	w11, w11, #0x80000000
 45e8a40: 1a8a616a     	csel	w10, w11, w10, vs
 45e8a44: 0aaa7d4a     	bic	w10, w10, w10, asr #31
 45e8a48: b81343a9     	stur	w9, [x29, #-0xcc]
 45e8a4c: b813c3aa     	stur	w10, [x29, #-0xc4]
 45e8a50: b9402be9     	ldr	w9, [sp, #0x28]
 45e8a54: 340004e9     	cbz	w9, 0x45e8af0 <_ChromeMain+0x45e3854>
 45e8a58: 39424d08     	ldrb	w8, [x8, #0x93]
 45e8a5c: b9415be9     	ldr	w9, [sp, #0x158]
 45e8a60: b94163ea     	ldr	w10, [sp, #0x160]
 45e8a64: 5100052b     	sub	w11, w9, #0x1
 45e8a68: 0aab7d6b     	bic	w11, w11, w11, asr #31
 45e8a6c: 7100011f     	cmp	w8, #0x0
 45e8a70: 1a891168     	csel	w8, w11, w9, ne
 45e8a74: 2b0a0109     	adds	w9, w8, w10
 45e8a78: 131f7d2a     	asr	w10, w9, #31
 45e8a7c: 5201014a     	eor	w10, w10, #0x80000000
 45e8a80: 1a896149     	csel	w9, w10, w9, vs
 45e8a84: 6b080129     	subs	w9, w9, w8
 45e8a88: 131f7d2a     	asr	w10, w9, #31
 45e8a8c: 5201014a     	eor	w10, w10, #0x80000000
 45e8a90: 1a896149     	csel	w9, w10, w9, vs
 45e8a94: 4b0803e8     	neg	w8, w8
 45e8a98: 4b0903e9     	neg	w9, w9
 45e8a9c: 2b090109     	adds	w9, w8, w9
 45e8aa0: 131f7d2a     	asr	w10, w9, #31
 45e8aa4: 5201014a     	eor	w10, w10, #0x80000000
 45e8aa8: 1a896149     	csel	w9, w10, w9, vs
 45e8aac: 6b080129     	subs	w9, w9, w8
 45e8ab0: 131f7d2a     	asr	w10, w9, #31
 45e8ab4: 5201014a     	eor	w10, w10, #0x80000000
 45e8ab8: 1a896149     	csel	w9, w10, w9, vs
 45e8abc: a9032768     	stp	x8, x9, [x27, #0x30]
 45e8ac0: d10343a0     	sub	x0, x29, #0xd0
 45e8ac4: 910383e1     	add	x1, sp, #0xe0
 45e8ac8: 96f7917c     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e8acc: 34000159     	cbz	w25, 0x45e8af4 <_ChromeMain+0x45e3858>
 45e8ad0: d004ca88     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45e8ad4: 3dc39d00     	ldr	q0, [x8, #0xe70]
 45e8ad8: 3d800f60     	str	q0, [x27, #0x30]
 45e8adc: d10343a0     	sub	x0, x29, #0xd0
 45e8ae0: 910383e1     	add	x1, sp, #0xe0
 45e8ae4: 96f79175     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e8ae8: 3500009a     	cbnz	w26, 0x45e8af8 <_ChromeMain+0x45e385c>
 45e8aec: 14000009     	b	0x45e8b10 <_ChromeMain+0x45e3874>
 45e8af0: 35ffff19     	cbnz	w25, 0x45e8ad0 <_ChromeMain+0x45e3834>
 45e8af4: 340000fa     	cbz	w26, 0x45e8b10 <_ChromeMain+0x45e3874>
 45e8af8: d004ca88     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45e8afc: 3dc37900     	ldr	q0, [x8, #0xde0]
 45e8b00: 3d800f60     	str	q0, [x27, #0x30]
 45e8b04: d10343a0     	sub	x0, x29, #0xd0
 45e8b08: 910383e1     	add	x1, sp, #0xe0
 45e8b0c: 96f7916b     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e8b10: d10343a1     	sub	x1, x29, #0xd0
 45e8b14: aa1603e0     	mov	x0, x22
 45e8b18: 9707a0da     	bl	0x7d0e80 <_ChromeMain+0x7cbbe4>
 45e8b1c: d10343a0     	sub	x0, x29, #0xd0
 45e8b20: aa1603e1     	mov	x1, x22
 45e8b24: 96f79112     	bl	0x3ccf6c <_ChromeMain+0x3c7cd0>
 45e8b28: f9405a68     	ldr	x8, [x19, #0xb0]
 45e8b2c: f9407f69     	ldr	x9, [x27, #0xf8]
 45e8b30: a90603e9     	stp	x9, x0, [sp, #0x60]
 45e8b34: f9003be1     	str	x1, [sp, #0x70]
 45e8b38: 52800029     	mov	w9, #0x1                ; =1
 45e8b3c: 3901e3e9     	strb	w9, [sp, #0x78]
 45e8b40: 910183e1     	add	x1, sp, #0x60
 45e8b44: aa0803e0     	mov	x0, x8
 45e8b48: 95fffc34     	bl	0xc5e7c18 <_ChromeMain+0xc5e297c>
 45e8b4c: f9400fe8     	ldr	x8, [sp, #0x18]
 45e8b50: b4ffdc88     	cbz	x8, 0x45e86e0 <_ChromeMain+0x45e3444>
 45e8b54: 52802028     	mov	w8, #0x101              ; =257
 45e8b58: f9400fe9     	ldr	x9, [sp, #0x18]
 45e8b5c: 79002128     	strh	w8, [x9, #0x10]
 45e8b60: 17fffee0     	b	0x45e86e0 <_ChromeMain+0x45e3444>
 45e8b64: aa0a03e9     	mov	x9, x10
 45e8b68: f940014a     	ldr	x10, [x10]
 45e8b6c: b5ffffca     	cbnz	x10, 0x45e8b64 <_ChromeMain+0x45e38c8>
 45e8b70: eb08013f     	cmp	x9, x8
 45e8b74: 54ff9f80     	b.eq	0x45e7f64 <_ChromeMain+0x45e2cc8>
 45e8b78: b940312a     	ldr	w10, [x9, #0x30]
 45e8b7c: 3400024a     	cbz	w10, 0x45e8bc4 <_ChromeMain+0x45e3928>
 45e8b80: b940352b     	ldr	w11, [x9, #0x34]
 45e8b84: 3400020b     	cbz	w11, 0x45e8bc4 <_ChromeMain+0x45e3928>
 45e8b88: b940292c     	ldr	w12, [x9, #0x28]
 45e8b8c: 2b18018c     	adds	w12, w12, w24
 45e8b90: 131f7d8d     	asr	w13, w12, #31
 45e8b94: 520101ad     	eor	w13, w13, #0x80000000
 45e8b98: 1a8c61ac     	csel	w12, w13, w12, vs
 45e8b9c: b900292c     	str	w12, [x9, #0x28]
 45e8ba0: 1e270181     	fmov	s1, w12
 45e8ba4: 9100b12c     	add	x12, x9, #0x2c
 45e8ba8: 0d409181     	ld1.s	{ v1 }[1], [x12]
 45e8bac: 1e270142     	fmov	s2, w10
 45e8bb0: 4e0c1d62     	mov.s	v2[1], w11
 45e8bb4: 0ea20c22     	sqadd.2s	v2, v1, v2
 45e8bb8: 0ea12c41     	sqsub.2s	v1, v2, v1
 45e8bbc: 0ea06421     	smax.2s	v1, v1, v0
 45e8bc0: fd001921     	str	d1, [x9, #0x30]
 45e8bc4: f940052a     	ldr	x10, [x9, #0x8]
 45e8bc8: b5fffcea     	cbnz	x10, 0x45e8b64 <_ChromeMain+0x45e38c8>
 45e8bcc: aa0903ea     	mov	x10, x9
 45e8bd0: f9400929     	ldr	x9, [x9, #0x10]
 45e8bd4: f940012b     	ldr	x11, [x9]
 45e8bd8: eb0b015f     	cmp	x10, x11
 45e8bdc: 54ffff81     	b.ne	0x45e8bcc <_ChromeMain+0x45e3930>
 45e8be0: 17ffffe4     	b	0x45e8b70 <_ChromeMain+0x45e38d4>
 45e8be4: eb09011f     	cmp	x8, x9
 45e8be8: 54000240     	b.eq	0x45e8c30 <_ChromeMain+0x45e3994>
 45e8bec: f9401516     	ldr	x22, [x8, #0x28]
 45e8bf0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45e8bf4: d0052e49     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45e8bf8: f9404529     	ldr	x9, [x9, #0x88]
 45e8bfc: eb09011f     	cmp	x8, x9
 45e8c00: 540001a1     	b.ne	0x45e8c34 <_ChromeMain+0x45e3998>
 45e8c04: aa1603e0     	mov	x0, x22
 45e8c08: 96e8adbd     	bl	0x142fc <_ChromeMain+0xf060>
 45e8c0c: 1400000a     	b	0x45e8c34 <_ChromeMain+0x45e3998>
 45e8c10: f9400108     	ldr	x8, [x8]
 45e8c14: b40000e8     	cbz	x8, 0x45e8c30 <_ChromeMain+0x45e3994>
 45e8c18: f940110b     	ldr	x11, [x8, #0x20]
 45e8c1c: eb0a017f     	cmp	x11, x10
 45e8c20: 54ffff88     	b.hi	0x45e8c10 <_ChromeMain+0x45e3974>
 45e8c24: 54fffe00     	b.eq	0x45e8be4 <_ChromeMain+0x45e3948>
 45e8c28: f9400508     	ldr	x8, [x8, #0x8]
 45e8c2c: b5ffff68     	cbnz	x8, 0x45e8c18 <_ChromeMain+0x45e397c>
 45e8c30: d2800016     	mov	x22, #0x0               ; =0
 45e8c34: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45e8c38: d0052e49     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45e8c3c: f9404529     	ldr	x9, [x9, #0x88]
 45e8c40: eb09011f     	cmp	x8, x9
 45e8c44: 54ff7a20     	b.eq	0x45e7b88 <_ChromeMain+0x45e28ec>
 45e8c48: b4ff7a76     	cbz	x22, 0x45e7b94 <_ChromeMain+0x45e28f8>
 45e8c4c: aa1603e0     	mov	x0, x22
 45e8c50: 52800021     	mov	w1, #0x1                ; =1
 45e8c54: 972ff4a9     	bl	0x11e5ef8 <_ChromeMain+0x11e0c5c>
 45e8c58: d28002e8     	mov	x8, #0x17               ; =23
 45e8c5c: f2c00028     	movk	x8, #0x1, lsl #32
 45e8c60: eb08001f     	cmp	x0, x8
 45e8c64: 1a9f17f9     	cset	w25, eq
 45e8c68: 17fffbcc     	b	0x45e7b98 <_ChromeMain+0x45e28fc>
 45e8c6c: eb09011f     	cmp	x8, x9
 45e8c70: 54000220     	b.eq	0x45e8cb4 <_ChromeMain+0x45e3a18>
 45e8c74: f9401518     	ldr	x24, [x8, #0x28]
 45e8c78: 925e7708     	and	x8, x24, #0xfffffffc00000000
 45e8c7c: f9404689     	ldr	x9, [x20, #0x88]
 45e8c80: eb09011f     	cmp	x8, x9
 45e8c84: 540001a1     	b.ne	0x45e8cb8 <_ChromeMain+0x45e3a1c>
 45e8c88: aa1803e0     	mov	x0, x24
 45e8c8c: 96e8ad9c     	bl	0x142fc <_ChromeMain+0xf060>
 45e8c90: 1400000a     	b	0x45e8cb8 <_ChromeMain+0x45e3a1c>
 45e8c94: f9400108     	ldr	x8, [x8]
 45e8c98: b40000e8     	cbz	x8, 0x45e8cb4 <_ChromeMain+0x45e3a18>
 45e8c9c: f940110b     	ldr	x11, [x8, #0x20]
 45e8ca0: eb0a017f     	cmp	x11, x10
 45e8ca4: 54ffff88     	b.hi	0x45e8c94 <_ChromeMain+0x45e39f8>
 45e8ca8: 54fffe20     	b.eq	0x45e8c6c <_ChromeMain+0x45e39d0>
 45e8cac: f9400508     	ldr	x8, [x8, #0x8]
 45e8cb0: b5ffff68     	cbnz	x8, 0x45e8c9c <_ChromeMain+0x45e3a00>
 45e8cb4: d2800018     	mov	x24, #0x0               ; =0
 45e8cb8: 925e7708     	and	x8, x24, #0xfffffffc00000000
 45e8cbc: f9404689     	ldr	x9, [x20, #0x88]
 45e8cc0: eb09011f     	cmp	x8, x9
 45e8cc4: 54000061     	b.ne	0x45e8cd0 <_ChromeMain+0x45e3a34>
 45e8cc8: aa1803e0     	mov	x0, x24
 45e8ccc: 96e8e75c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45e8cd0: f9400308     	ldr	x8, [x24]
 45e8cd4: f9401108     	ldr	x8, [x8, #0x20]
 45e8cd8: aa1803e0     	mov	x0, x24
 45e8cdc: d63f0100     	blr	x8
 45e8ce0: aa0003f8     	mov	x24, x0
 45e8ce4: 17fffcc7     	b	0x45e8000 <_ChromeMain+0x45e2d64>
 45e8ce8: f94002e8     	ldr	x8, [x23]
 45e8cec: f9402d08     	ldr	x8, [x8, #0x58]
 45e8cf0: aa1703e0     	mov	x0, x23
 45e8cf4: d63f0100     	blr	x8
 45e8cf8: aa0003f8     	mov	x24, x0
 45e8cfc: 979fbed5     	bl	0x2dd8850 <_ChromeMain+0x2dd35b4>
 45e8d00: f100031f     	cmp	x24, #0x0
 45e8d04: 1a9f07e8     	cset	w8, ne
 45e8d08: eb00031f     	cmp	x24, x0
 45e8d0c: fa401b04     	ccmp	x24, #0x0, #0x4, ne
 45e8d10: 540000c0     	b.eq	0x45e8d28 <_ChromeMain+0x45e3a8c>
 45e8d14: f9402718     	ldr	x24, [x24, #0x48]
 45e8d18: f100031f     	cmp	x24, #0x0
 45e8d1c: 1a9f07e8     	cset	w8, ne
 45e8d20: fa401304     	ccmp	x24, x0, #0x4, ne
 45e8d24: 54ffff81     	b.ne	0x45e8d14 <_ChromeMain+0x45e3a78>
 45e8d28: 34000988     	cbz	w8, 0x45e8e58 <_ChromeMain+0x45e3bbc>
 45e8d2c: 394c6ae8     	ldrb	w8, [x23, #0x31a]
 45e8d30: 6b1a011f     	cmp	w8, w26
 45e8d34: 540002e0     	b.eq	0x45e8d90 <_ChromeMain+0x45e3af4>
 45e8d38: 390c6afa     	strb	w26, [x23, #0x31a]
 45e8d3c: f9418ae0     	ldr	x0, [x23, #0x310]
 45e8d40: b4000280     	cbz	x0, 0x45e8d90 <_ChromeMain+0x45e3af4>
 45e8d44: 394c62e8     	ldrb	w8, [x23, #0x318]
 45e8d48: 7100011f     	cmp	w8, #0x0
 45e8d4c: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 45e8d50: 9a8813e1     	csel	x1, xzr, x8, ne
 45e8d54: 52a7f002     	mov	w2, #0x3f800000         ; =1065353216
 45e8d58: 97ffa128     	bl	0x45d11f8 <_ChromeMain+0x45cbf5c>
 45e8d5c: f9418ae8     	ldr	x8, [x23, #0x310]
 45e8d60: 394c66e9     	ldrb	w9, [x23, #0x319]
 45e8d64: 37000089     	tbnz	w9, #0x0, 0x45e8d74 <_ChromeMain+0x45e3ad8>
 45e8d68: 394c6ae9     	ldrb	w9, [x23, #0x31a]
 45e8d6c: 52000129     	eor	w9, w9, #0x1
 45e8d70: 14000002     	b	0x45e8d78 <_ChromeMain+0x45e3adc>
 45e8d74: 52800009     	mov	w9, #0x0                ; =0
 45e8d78: 3941210a     	ldrb	w10, [x8, #0x48]
 45e8d7c: 12000129     	and	w9, w9, #0x1
 45e8d80: 6b09015f     	cmp	w10, w9
 45e8d84: 54005a61     	b.ne	0x45e98d0 <_ChromeMain+0x45e4634>
 45e8d88: aa1703e0     	mov	x0, x23
 45e8d8c: 96fee0fc     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45e8d90: b9402be8     	ldr	w8, [sp, #0x28]
 45e8d94: 2a080328     	orr	w8, w25, w8
 45e8d98: 52000349     	eor	w9, w26, #0x1
 45e8d9c: 0a080128     	and	w8, w9, w8
 45e8da0: 394c66e9     	ldrb	w9, [x23, #0x319]
 45e8da4: 6b08013f     	cmp	w9, w8
 45e8da8: 540002e0     	b.eq	0x45e8e04 <_ChromeMain+0x45e3b68>
 45e8dac: 390c66e8     	strb	w8, [x23, #0x319]
 45e8db0: f9418ae0     	ldr	x0, [x23, #0x310]
 45e8db4: b4000280     	cbz	x0, 0x45e8e04 <_ChromeMain+0x45e3b68>
 45e8db8: 394c62e8     	ldrb	w8, [x23, #0x318]
 45e8dbc: 7100011f     	cmp	w8, #0x0
 45e8dc0: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 45e8dc4: 9a8813e1     	csel	x1, xzr, x8, ne
 45e8dc8: 52a7f002     	mov	w2, #0x3f800000         ; =1065353216
 45e8dcc: 97ffa10b     	bl	0x45d11f8 <_ChromeMain+0x45cbf5c>
 45e8dd0: f9418ae8     	ldr	x8, [x23, #0x310]
 45e8dd4: 394c66e9     	ldrb	w9, [x23, #0x319]
 45e8dd8: 37000089     	tbnz	w9, #0x0, 0x45e8de8 <_ChromeMain+0x45e3b4c>
 45e8ddc: 394c6ae9     	ldrb	w9, [x23, #0x31a]
 45e8de0: 52000129     	eor	w9, w9, #0x1
 45e8de4: 14000002     	b	0x45e8dec <_ChromeMain+0x45e3b50>
 45e8de8: 52800009     	mov	w9, #0x0                ; =0
 45e8dec: 3941210a     	ldrb	w10, [x8, #0x48]
 45e8df0: 12000129     	and	w9, w9, #0x1
 45e8df4: 6b09015f     	cmp	w10, w9
 45e8df8: 54005761     	b.ne	0x45e98e4 <_ChromeMain+0x45e4648>
 45e8dfc: aa1703e0     	mov	x0, x23
 45e8e00: 96fee0df     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45e8e04: 394c62e8     	ldrb	w8, [x23, #0x318]
 45e8e08: 34000288     	cbz	w8, 0x45e8e58 <_ChromeMain+0x45e3bbc>
 45e8e0c: 390c62ff     	strb	wzr, [x23, #0x318]
 45e8e10: f9418ae0     	ldr	x0, [x23, #0x310]
 45e8e14: b4000220     	cbz	x0, 0x45e8e58 <_ChromeMain+0x45e3bbc>
 45e8e18: d2c00021     	mov	x1, #0x100000000        ; =4294967296
 45e8e1c: 52a7f002     	mov	w2, #0x3f800000         ; =1065353216
 45e8e20: 97ffa0f6     	bl	0x45d11f8 <_ChromeMain+0x45cbf5c>
 45e8e24: f9418ae8     	ldr	x8, [x23, #0x310]
 45e8e28: 394c66e9     	ldrb	w9, [x23, #0x319]
 45e8e2c: 37000089     	tbnz	w9, #0x0, 0x45e8e3c <_ChromeMain+0x45e3ba0>
 45e8e30: 394c6ae9     	ldrb	w9, [x23, #0x31a]
 45e8e34: 52000129     	eor	w9, w9, #0x1
 45e8e38: 14000002     	b	0x45e8e40 <_ChromeMain+0x45e3ba4>
 45e8e3c: 52800009     	mov	w9, #0x0                ; =0
 45e8e40: 3941210a     	ldrb	w10, [x8, #0x48]
 45e8e44: 12000129     	and	w9, w9, #0x1
 45e8e48: 6b09015f     	cmp	w10, w9
 45e8e4c: 54005381     	b.ne	0x45e98bc <_ChromeMain+0x45e4620>
 45e8e50: aa1703e0     	mov	x0, x23
 45e8e54: 96fee0ca     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45e8e58: a9087f7f     	stp	xzr, xzr, [x27, #0x80]
 45e8e5c: 370003ba     	tbnz	w26, #0x0, 0x45e8ed0 <_ChromeMain+0x45e3c34>
 45e8e60: f9409e68     	ldr	x8, [x19, #0x138]
 45e8e64: 39424d08     	ldrb	w8, [x8, #0x93]
 45e8e68: 350000a8     	cbnz	w8, 0x45e8e7c <_ChromeMain+0x45e3be0>
 45e8e6c: d10303a8     	sub	x8, x29, #0xc0
 45e8e70: 3dc00100     	ldr	q0, [x8]
 45e8e74: 3d802360     	str	q0, [x27, #0x80]
 45e8e78: 14000011     	b	0x45e8ebc <_ChromeMain+0x45e3c20>
 45e8e7c: f9401beb     	ldr	x11, [sp, #0x30]
 45e8e80: b9400168     	ldr	w8, [x11]
 45e8e84: 1e270100     	fmov	s0, w8
 45e8e88: b85443a9     	ldur	w9, [x29, #-0xbc]
 45e8e8c: d10303aa     	sub	x10, x29, #0xc0
 45e8e90: b27e054a     	orr	x10, x10, #0xc
 45e8e94: 4e0c1d20     	mov.s	v0[1], w9
 45e8e98: bd400961     	ldr	s1, [x11, #0x8]
 45e8e9c: 0d409141     	ld1.s	{ v1 }[1], [x10]
 45e8ea0: b90133e8     	str	w8, [sp, #0x130]
 45e8ea4: b90137e9     	str	w9, [sp, #0x134]
 45e8ea8: 0ea10c01     	sqadd.2s	v1, v0, v1
 45e8eac: 0ea02c20     	sqsub.2s	v0, v1, v0
 45e8eb0: 6f00e401     	movi.2d	v1, #0000000000000000
 45e8eb4: 0ea16400     	smax.2s	v0, v0, v1
 45e8eb8: fd004760     	str	d0, [x27, #0x88]
 45e8ebc: b9404388     	ldr	w8, [x28, #0x40]
 45e8ec0: 7100011f     	cmp	w8, #0x0
 45e8ec4: 52802008     	mov	w8, #0x100              ; =256
 45e8ec8: 9a88d503     	cinc	x3, x8, gt
 45e8ecc: 14000014     	b	0x45e8f1c <_ChromeMain+0x45e3c80>
 45e8ed0: b9401be8     	ldr	w8, [sp, #0x18]
 45e8ed4: 3904c3e8     	strb	w8, [sp, #0x130]
 45e8ed8: d10303a9     	sub	x9, x29, #0xc0
 45e8edc: f9401d28     	ldr	x8, [x9, #0x38]
 45e8ee0: f8081368     	stur	x8, [x27, #0x81]
 45e8ee4: f843f128     	ldur	x8, [x9, #0x3f]
 45e8ee8: f9004768     	str	x8, [x27, #0x88]
 45e8eec: b94137e8     	ldr	w8, [sp, #0x134]
 45e8ef0: f9401be9     	ldr	x9, [sp, #0x30]
 45e8ef4: b9400529     	ldr	w9, [x9, #0x4]
 45e8ef8: 6b09011f     	cmp	w8, w9
 45e8efc: 540000ed     	b.le	0x45e8f18 <_ChromeMain+0x45e3c7c>
 45e8f00: d004ca88     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45e8f04: 3dc3b900     	ldr	q0, [x8, #0xee0]
 45e8f08: 3d800f60     	str	q0, [x27, #0x30]
 45e8f0c: 9104c3e0     	add	x0, sp, #0x130
 45e8f10: 910383e1     	add	x1, sp, #0xe0
 45e8f14: 96f79069     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e8f18: 52802023     	mov	w3, #0x101              ; =257
 45e8f1c: f9402261     	ldr	x1, [x19, #0x40]
 45e8f20: 9104c3e2     	add	x2, sp, #0x130
 45e8f24: aa1503e0     	mov	x0, x21
 45e8f28: 97035c8b     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e8f2c: f9000fe0     	str	x0, [sp, #0x18]
 45e8f30: 17fffc16     	b	0x45e7f88 <_ChromeMain+0x45e2cec>
 45e8f34: 90fe024a     	adrp	x10, 0x630000 <_ChromeMain+0x62ad64>
 45e8f38: 9120c14a     	add	x10, x10, #0x830
 45e8f3c: eb0a013f     	cmp	x9, x10
 45e8f40: 54ffa400     	b.eq	0x45e83c0 <_ChromeMain+0x45e3124>
 45e8f44: 9107c100     	add	x0, x8, #0x1f0
 45e8f48: d63f0120     	blr	x9
 45e8f4c: 17fffd1e     	b	0x45e83c4 <_ChromeMain+0x45e3128>
 45e8f50: eb09011f     	cmp	x8, x9
 45e8f54: 54000460     	b.eq	0x45e8fe0 <_ChromeMain+0x45e3d44>
 45e8f58: f9401908     	ldr	x8, [x8, #0x30]
 45e8f5c: b4000428     	cbz	x8, 0x45e8fe0 <_ChromeMain+0x45e3d44>
 45e8f60: bc5583a0     	ldur	s0, [x29, #-0xa8]
 45e8f64: bd400501     	ldr	s1, [x8, #0x4]
 45e8f68: 5e21d821     	scvtf	s1, s1
 45e8f6c: 1e213800     	fsub	s0, s0, s1
 45e8f70: 1e202008     	fcmp	s0, #0.0
 45e8f74: 6f00e401     	movi.2d	v1, #0000000000000000
 45e8f78: 1e21cc00     	fcsel	s0, s0, s1, gt
 45e8f7c: 1e380002     	fcvtzs	w2, s0
 45e8f80: 14000019     	b	0x45e8fe4 <_ChromeMain+0x45e3d48>
 45e8f84: f9400108     	ldr	x8, [x8]
 45e8f88: b5000208     	cbnz	x8, 0x45e8fc8 <_ChromeMain+0x45e3d2c>
 45e8f8c: 14000015     	b	0x45e8fe0 <_ChromeMain+0x45e3d44>
 45e8f90: a9087f7f     	stp	xzr, xzr, [x27, #0x80]
 45e8f94: f9409e68     	ldr	x8, [x19, #0x138]
 45e8f98: b9403508     	ldr	w8, [x8, #0x34]
 45e8f9c: 7100091f     	cmp	w8, #0x2
 45e8fa0: 1a9f07e8     	cset	w8, ne
 45e8fa4: b90027e8     	str	w8, [sp, #0x24]
 45e8fa8: 540005e1     	b.ne	0x45e9064 <_ChromeMain+0x45e3dc8>
 45e8fac: 97849005     	bl	0x270cfc0 <_ChromeMain+0x2707d24>
 45e8fb0: f9403a61     	ldr	x1, [x19, #0x70]
 45e8fb4: aa0103e9     	mov	x9, x1
 45e8fb8: f84e8d28     	ldr	x8, [x9, #0xe8]!
 45e8fbc: b4000128     	cbz	x8, 0x45e8fe0 <_ChromeMain+0x45e3d44>
 45e8fc0: b00520ea     	adrp	x10, 0xea05000 <dyld_stub_binder+0xea05000>
 45e8fc4: 9112a14a     	add	x10, x10, #0x4a8
 45e8fc8: f940110b     	ldr	x11, [x8, #0x20]
 45e8fcc: eb0a017f     	cmp	x11, x10
 45e8fd0: 54fffda8     	b.hi	0x45e8f84 <_ChromeMain+0x45e3ce8>
 45e8fd4: 54fffbe2     	b.hs	0x45e8f50 <_ChromeMain+0x45e3cb4>
 45e8fd8: f9400508     	ldr	x8, [x8, #0x8]
 45e8fdc: b5ffff68     	cbnz	x8, 0x45e8fc8 <_ChromeMain+0x45e3d2c>
 45e8fe0: 528001e2     	mov	w2, #0xf                ; =15
 45e8fe4: d10303a0     	sub	x0, x29, #0xc0
 45e8fe8: 52800003     	mov	w3, #0x0                ; =0
 45e8fec: 972ff1d5     	bl	0x11e5740 <_ChromeMain+0x11e04a4>
 45e8ff0: a9080760     	stp	x0, x1, [x27, #0x80]
 45e8ff4: f9401660     	ldr	x0, [x19, #0x28]
 45e8ff8: 972feebb     	bl	0x11e4ae4 <_ChromeMain+0x11df848>
 45e8ffc: 7100081f     	cmp	w0, #0x2
