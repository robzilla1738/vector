Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4100b88: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4100b8c: a90167fa     	stp	x26, x25, [sp, #0x10]
 4100b90: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4100b94: a90357f6     	stp	x22, x21, [sp, #0x30]
 4100b98: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4100b9c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4100ba0: 910143fd     	add	x29, sp, #0x50
 4100ba4: d10a03ff     	sub	sp, sp, #0x280
 4100ba8: aa0803f4     	mov	x20, x8
 4100bac: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 4100bb0: f81783bf     	stur	xzr, [x29, #-0x88]
 4100bb4: d10263a8     	sub	x8, x29, #0x98
 4100bb8: 97ffffc9     	bl	0x4100adc <_ChromeMain+0x40fb840>
 4100bbc: 3857f3a9     	ldurb	w9, [x29, #-0x81]
 4100bc0: 13001d28     	sxtb	w8, w9
 4100bc4: f85703aa     	ldur	x10, [x29, #-0x90]
 4100bc8: 7100011f     	cmp	w8, #0x0
 4100bcc: 9a894149     	csel	x9, x10, x9, mi
 4100bd0: b4000ba9     	cbz	x9, 0x4100d44 <_ChromeMain+0x40fbaa8>
 4100bd4: a9357fbf     	stp	xzr, xzr, [x29, #-0xb0]
 4100bd8: f81603bf     	stur	xzr, [x29, #-0xa0]
 4100bdc: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 4100be0: d004cc80     	adrp	x0, 0xda92000 <dyld_stub_binder+0xda92000>
 4100be4: 910a0c00     	add	x0, x0, #0x283
 4100be8: d004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 4100bec: 910ac821     	add	x1, x1, #0x2b2
 4100bf0: 910483e8     	add	x8, sp, #0x120
 4100bf4: 52800242     	mov	w2, #0x12               ; =18
 4100bf8: 96fd4022     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4100bfc: 910143e0     	add	x0, sp, #0x50
 4100c00: 910483e1     	add	x1, sp, #0x120
 4100c04: 97902228     	bl	0x25094a4 <_ChromeMain+0x2504208>
 4100c08: d102c3b3     	sub	x19, x29, #0xb0
 4100c0c: d10263a0     	sub	x0, x29, #0x98
 4100c10: d102c3a1     	sub	x1, x29, #0xb0
 4100c14: 92800002     	mov	x2, #-0x1               ; =-1
 4100c18: 977a47dc     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 4100c1c: 36000a40     	tbz	w0, #0x0, 0x4100d64 <_ChromeMain+0x40fbac8>
 4100c20: 910143e0     	add	x0, sp, #0x50
 4100c24: 979021fc     	bl	0x2509414 <_ChromeMain+0x2504178>
 4100c28: f81403bf     	stur	xzr, [x29, #-0xc0]
 4100c2c: 6f00e400     	movi.2d	v0, #0000000000000000
 4100c30: ad3903a0     	stp	q0, q0, [x29, #-0xe0]
 4100c34: 389673a8     	ldursb	x8, [x29, #-0x99]
 4100c38: a9752ba9     	ldp	x9, x10, [x29, #-0xb0]
 4100c3c: f100011f     	cmp	x8, #0x0
 4100c40: 9a934120     	csel	x0, x9, x19, mi
 4100c44: 7100011f     	cmp	w8, #0x0
 4100c48: 9a884141     	csel	x1, x10, x8, mi
 4100c4c: d10383a8     	sub	x8, x29, #0xe0
 4100c50: 52800002     	mov	w2, #0x0                ; =0
 4100c54: 52801903     	mov	w3, #0xc8               ; =200
 4100c58: 976b04f4     	bl	0x1bc2028 <_ChromeMain+0x1bbcd8c>
 4100c5c: 385403a9     	ldurb	w9, [x29, #-0xc0]
 4100c60: 385383a8     	ldurb	w8, [x29, #-0xc8]
 4100c64: 7100191f     	cmp	w8, #0x6
 4100c68: 1a9f17ea     	cset	w10, eq
 4100c6c: 6a0a013f     	tst	w9, w10
 4100c70: 540000a1     	b.ne	0x4100c84 <_ChromeMain+0x40fb9e8>
 4100c74: 3900029f     	strb	wzr, [x20]
 4100c78: 3903229f     	strb	wzr, [x20, #0xc8]
 4100c7c: 370015a9     	tbnz	w9, #0x0, 0x4100f30 <_ChromeMain+0x40fbc94>
 4100c80: 1400003d     	b	0x4100d74 <_ChromeMain+0x40fbad8>
 4100c84: f90017f4     	str	x20, [sp, #0x28]
 4100c88: 910483f3     	add	x19, sp, #0x120
 4100c8c: d004c361     	adrp	x1, 0xd96e000 <dyld_stub_binder+0xd96e000>
 4100c90: 910b1c21     	add	x1, x1, #0x2c7
 4100c94: d10383a0     	sub	x0, x29, #0xe0
 4100c98: 52800102     	mov	w2, #0x8                ; =8
 4100c9c: 972176e9     	bl	0x95e840 <_ChromeMain+0x9595a4>
 4100ca0: aa0003f4     	mov	x20, x0
 4100ca4: 910483f9     	add	x25, sp, #0x120
 4100ca8: 91004329     	add	x9, x25, #0x10
 4100cac: 6f00e401     	movi.2d	v1, #0000000000000000
 4100cb0: ad0b07e1     	stp	q1, q1, [sp, #0x160]
 4100cb4: 9100a328     	add	x8, x25, #0x28
 4100cb8: a901a3e9     	stp	x9, x8, [sp, #0x18]
 4100cbc: 91012328     	add	x8, x25, #0x48
 4100cc0: f9001be8     	str	x8, [sp, #0x30]
 4100cc4: ad0a07e1     	stp	q1, q1, [sp, #0x140]
 4100cc8: ad0907e1     	stp	q1, q1, [sp, #0x120]
 4100ccc: 6f07e7e0     	movi.2d	v0, #0xffffffffffffffff
 4100cd0: fd00c3e0     	str	d0, [sp, #0x180]
 4100cd4: 3c868261     	stur	q1, [x19, #0x68]
 4100cd8: 3c878261     	stur	q1, [x19, #0x78]
 4100cdc: 3c888261     	stur	q1, [x19, #0x88]
 4100ce0: 3c898261     	stur	q1, [x19, #0x98]
 4100ce4: 3c8a8261     	stur	q1, [x19, #0xa8]
 4100ce8: 3c8b8261     	stur	q1, [x19, #0xb8]
 4100cec: d004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 4100cf0: 91074c21     	add	x1, x1, #0x1d3
 4100cf4: d10383a0     	sub	x0, x29, #0xe0
 4100cf8: 52800202     	mov	w2, #0x10               ; =16
 4100cfc: 972177e1     	bl	0x95ec80 <_ChromeMain+0x9599e4>
 4100d00: f260001f     	tst	x0, #0x100000000
 4100d04: 1a8003e8     	csel	w8, wzr, w0, eq
 4100d08: b90123e8     	str	w8, [sp, #0x120]
 4100d0c: f9001ff4     	str	x20, [sp, #0x38]
 4100d10: b4001914     	cbz	x20, 0x4101030 <_ChromeMain+0x40fbd94>
 4100d14: f9401fe8     	ldr	x8, [sp, #0x38]
 4100d18: f9400508     	ldr	x8, [x8, #0x8]
 4100d1c: d37be913     	lsl	x19, x8, #5
 4100d20: b4001893     	cbz	x19, 0x4101030 <_ChromeMain+0x40fbd94>
 4100d24: f9401fe8     	ldr	x8, [sp, #0x38]
 4100d28: f9400108     	ldr	x8, [x8]
 4100d2c: 91006118     	add	x24, x8, #0x18
 4100d30: 9004ca74     	adrp	x20, 0xda4c000 <dyld_stub_binder+0xda4c000>
 4100d34: 910afa94     	add	x20, x20, #0x2be
 4100d38: d004cc96     	adrp	x22, 0xda92000 <dyld_stub_binder+0xda92000>
 4100d3c: 910bbed6     	add	x22, x22, #0x2ef
 4100d40: 140000a1     	b	0x4100fc4 <_ChromeMain+0x40fbd28>
 4100d44: 3900029f     	strb	wzr, [x20]
 4100d48: 3903229f     	strb	wzr, [x20, #0xc8]
 4100d4c: 36380248     	tbz	w8, #0x7, 0x4100d94 <_ChromeMain+0x40fbaf8>
 4100d50: f85683a0     	ldur	x0, [x29, #-0x98]
 4100d54: f85783a8     	ldur	x8, [x29, #-0x88]
 4100d58: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4100d5c: 96fc2057     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4100d60: 1400000d     	b	0x4100d94 <_ChromeMain+0x40fbaf8>
 4100d64: 3900029f     	strb	wzr, [x20]
 4100d68: 3903229f     	strb	wzr, [x20, #0xc8]
 4100d6c: 910143e0     	add	x0, sp, #0x50
 4100d70: 979021a9     	bl	0x2509414 <_ChromeMain+0x2504178>
 4100d74: 38d673a8     	ldursb	w8, [x29, #-0x99]
 4100d78: 36f800a8     	tbz	w8, #0x1f, 0x4100d8c <_ChromeMain+0x40fbaf0>
 4100d7c: f85503a0     	ldur	x0, [x29, #-0xb0]
 4100d80: f85603a8     	ldur	x8, [x29, #-0xa0]
 4100d84: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4100d88: 96fc204c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4100d8c: 3857f3a8     	ldurb	w8, [x29, #-0x81]
 4100d90: 373ffe08     	tbnz	w8, #0x7, 0x4100d50 <_ChromeMain+0x40fbab4>
 4100d94: 910a03ff     	add	sp, sp, #0x280
 4100d98: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4100d9c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4100da0: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4100da4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4100da8: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4100dac: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4100db0: d65f03c0     	ret
 4100db4: aa1303f4     	mov	x20, x19
 4100db8: 3944a3e9     	ldrb	w9, [sp, #0x128]
 4100dbc: 37000069     	tbnz	w9, #0x0, 0x4100dc8 <_ChromeMain+0x40fbb2c>
 4100dc0: f940c3e9     	ldr	x9, [sp, #0x180]
 4100dc4: 14000022     	b	0x4100e4c <_ChromeMain+0x40fbbb0>
 4100dc8: 52800037     	mov	w23, #0x1               ; =1
 4100dcc: 52800036     	mov	w22, #0x1               ; =1
 4100dd0: 91012328     	add	x8, x25, #0x48
 4100dd4: 91018333     	add	x19, x25, #0x60
 4100dd8: f9401be9     	ldr	x9, [sp, #0x30]
 4100ddc: eb08013f     	cmp	x9, x8
 4100de0: 54000240     	b.eq	0x4100e28 <_ChromeMain+0x40fbb8c>
 4100de4: 910483ea     	add	x10, sp, #0x120
 4100de8: 91017d49     	add	x9, x10, #0x5f
 4100dec: 39c5ffeb     	ldrsb	w11, [sp, #0x17f]
 4100df0: 710002df     	cmp	w22, #0x0
 4100df4: 52800aec     	mov	w12, #0x57              ; =87
 4100df8: 9a8c1129     	csel	x9, x9, x12, ne
 4100dfc: 91015e8c     	add	x12, x20, #0x57
 4100e00: 710002ff     	cmp	w23, #0x0
 4100e04: 9a8c1129     	csel	x9, x9, x12, ne
 4100e08: 39400129     	ldrb	w9, [x9]
 4100e0c: 37f8b2ab     	tbnz	w11, #0x1f, 0x4102460 <_ChromeMain+0x40fd1c4>
 4100e10: 37380aa9     	tbnz	w9, #0x7, 0x4100f64 <_ChromeMain+0x40fbcc8>
 4100e14: 3dc00100     	ldr	q0, [x8]
 4100e18: f9400908     	ldr	x8, [x8, #0x10]
 4100e1c: f9401be9     	ldr	x9, [sp, #0x30]
 4100e20: f9000928     	str	x8, [x9, #0x10]
 4100e24: 3d800120     	str	q0, [x9]
 4100e28: 710002df     	cmp	w22, #0x0
 4100e2c: 52800b08     	mov	w8, #0x58               ; =88
 4100e30: 9a881268     	csel	x8, x19, x8, ne
 4100e34: 91016289     	add	x9, x20, #0x58
 4100e38: 710002ff     	cmp	w23, #0x0
 4100e3c: 9a891108     	csel	x8, x8, x9, ne
 4100e40: f9400109     	ldr	x9, [x8]
 4100e44: f900c3e9     	str	x9, [sp, #0x180]
 4100e48: a95a23f3     	ldp	x19, x8, [sp, #0x1a0]
 4100e4c: b94123ea     	ldr	w10, [sp, #0x120]
 4100e50: b900030a     	str	w10, [x24]
 4100e54: 394493ea     	ldrb	w10, [sp, #0x124]
 4100e58: 3900130a     	strb	w10, [x24, #0x4]
 4100e5c: 794253ea     	ldrh	w10, [sp, #0x128]
 4100e60: 7900130a     	strh	w10, [x24, #0x8]
 4100e64: f9400feb     	ldr	x11, [sp, #0x18]
 4100e68: 3dc00160     	ldr	q0, [x11]
 4100e6c: 3d800700     	str	q0, [x24, #0x10]
 4100e70: f940096a     	ldr	x10, [x11, #0x10]
 4100e74: f900130a     	str	x10, [x24, #0x20]
 4100e78: a9007d7f     	stp	xzr, xzr, [x11]
 4100e7c: f900097f     	str	xzr, [x11, #0x10]
 4100e80: f94013eb     	ldr	x11, [sp, #0x20]
 4100e84: 3dc00160     	ldr	q0, [x11]
 4100e88: 3c828300     	stur	q0, [x24, #0x28]
 4100e8c: f940096a     	ldr	x10, [x11, #0x10]
 4100e90: f9001f0a     	str	x10, [x24, #0x38]
 4100e94: a9007d7f     	stp	xzr, xzr, [x11]
 4100e98: f900097f     	str	xzr, [x11, #0x10]
 4100e9c: 7942c3ea     	ldrh	w10, [sp, #0x160]
 4100ea0: 7900830a     	strh	w10, [x24, #0x40]
 4100ea4: f9401beb     	ldr	x11, [sp, #0x30]
 4100ea8: 3dc00160     	ldr	q0, [x11]
 4100eac: f940096a     	ldr	x10, [x11, #0x10]
 4100eb0: 3c848300     	stur	q0, [x24, #0x48]
 4100eb4: a9007d7f     	stp	xzr, xzr, [x11]
 4100eb8: f900097f     	str	xzr, [x11, #0x10]
 4100ebc: a905a70a     	stp	x10, x9, [x24, #0x58]
 4100ec0: f940c7e9     	ldr	x9, [sp, #0x188]
 4100ec4: f9003709     	str	x9, [x24, #0x68]
 4100ec8: 3dc067e0     	ldr	q0, [sp, #0x190]
 4100ecc: a918ffff     	stp	xzr, xzr, [sp, #0x188]
 4100ed0: 3d801f00     	str	q0, [x24, #0x70]
 4100ed4: a919ffff     	stp	xzr, xzr, [sp, #0x198]
 4100ed8: f900d7ff     	str	xzr, [sp, #0x1a8]
 4100edc: a9082313     	stp	x19, x8, [x24, #0x80]
 4100ee0: a95b27e8     	ldp	x8, x9, [sp, #0x1b0]
 4100ee4: 6f00e400     	movi.2d	v0, #0000000000000000
 4100ee8: a9092708     	stp	x8, x9, [x24, #0x90]
 4100eec: 3dc073e1     	ldr	q1, [sp, #0x1c0]
 4100ef0: ad0d83e0     	stp	q0, q0, [sp, #0x1b0]
 4100ef4: 3d802b01     	str	q1, [x24, #0xa0]
 4100ef8: f940ebe8     	ldr	x8, [sp, #0x1d0]
 4100efc: f900ebff     	str	xzr, [sp, #0x1d0]
 4100f00: f9005b08     	str	x8, [x24, #0xb0]
 4100f04: 910483e8     	add	x8, sp, #0x120
 4100f08: 3ccb8101     	ldur	q1, [x8, #0xb8]
 4100f0c: 3c8b8100     	stur	q0, [x8, #0xb8]
 4100f10: 3c8b8301     	stur	q1, [x24, #0xb8]
 4100f14: 52800028     	mov	w8, #0x1                ; =1
 4100f18: 39032308     	strb	w8, [x24, #0xc8]
 4100f1c: 910483e0     	add	x0, sp, #0x120
 4100f20: 97fff979     	bl	0x40ff504 <_ChromeMain+0x40fa268>
 4100f24: 385403a8     	ldurb	w8, [x29, #-0xc0]
 4100f28: 3607f268     	tbz	w8, #0x0, 0x4100d74 <_ChromeMain+0x40fbad8>
 4100f2c: 385383a8     	ldurb	w8, [x29, #-0xc8]
 4100f30: 7103fd1f     	cmp	w8, #0xff
 4100f34: 54fff200     	b.eq	0x4100d74 <_ChromeMain+0x40fbad8>
 4100f38: 721e791f     	tst	w8, #0xfffffffd
 4100f3c: 54fff1c0     	b.eq	0x4100d74 <_ChromeMain+0x40fbad8>
 4100f40: 7100111f     	cmp	w8, #0x4
 4100f44: 540002a0     	b.eq	0x4100f98 <_ChromeMain+0x40fbcfc>
 4100f48: b0053e09     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4100f4c: 9121e129     	add	x9, x9, #0x878
 4100f50: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 4100f54: 910483e0     	add	x0, sp, #0x120
 4100f58: d10383a1     	sub	x1, x29, #0xe0
 4100f5c: d63f0100     	blr	x8
 4100f60: 17ffff85     	b	0x4100d74 <_ChromeMain+0x40fbad8>
 4100f64: f9400101     	ldr	x1, [x8]
 4100f68: 910483e8     	add	x8, sp, #0x120
 4100f6c: 91014108     	add	x8, x8, #0x50
 4100f70: 710002df     	cmp	w22, #0x0
 4100f74: 52800909     	mov	w9, #0x48               ; =72
 4100f78: 9a891108     	csel	x8, x8, x9, ne
 4100f7c: 91012289     	add	x9, x20, #0x48
 4100f80: 710002ff     	cmp	w23, #0x0
 4100f84: 9a891108     	csel	x8, x8, x9, ne
 4100f88: f9400102     	ldr	x2, [x8]
 4100f8c: f9401be0     	ldr	x0, [sp, #0x30]
 4100f90: 970e9ec9     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4100f94: 17ffffa5     	b	0x4100e28 <_ChromeMain+0x40fbb8c>
 4100f98: 38d373a8     	ldursb	w8, [x29, #-0xc9]
 4100f9c: 36ffeec8     	tbz	w8, #0x1f, 0x4100d74 <_ChromeMain+0x40fbad8>
 4100fa0: f85203a0     	ldur	x0, [x29, #-0xe0]
 4100fa4: f85303a8     	ldur	x8, [x29, #-0xd0]
 4100fa8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4100fac: 96fc1fc3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4100fb0: 17ffff71     	b	0x4100d74 <_ChromeMain+0x40fbad8>
 4100fb4: f9400408     	ldr	x8, [x0, #0x8]
 4100fb8: b5000388     	cbnz	x8, 0x4101028 <_ChromeMain+0x40fbd8c>
 4100fbc: f1008273     	subs	x19, x19, #0x20
 4100fc0: 54000380     	b.eq	0x4101030 <_ChromeMain+0x40fbd94>
 4100fc4: f8420715     	ldr	x21, [x24], #0x20
 4100fc8: b4ffffb5     	cbz	x21, 0x4100fbc <_ChromeMain+0x40fbd20>
 4100fcc: 394062a8     	ldrb	w8, [x21, #0x18]
 4100fd0: 7100191f     	cmp	w8, #0x6
 4100fd4: 54ffff41     	b.ne	0x4100fbc <_ChromeMain+0x40fbd20>
 4100fd8: aa1503e0     	mov	x0, x21
 4100fdc: aa1403e1     	mov	x1, x20
 4100fe0: 52800162     	mov	w2, #0xb                ; =11
 4100fe4: 977ca2a7     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4100fe8: aa0003f7     	mov	x23, x0
 4100fec: aa1503e0     	mov	x0, x21
 4100ff0: aa1603e1     	mov	x1, x22
 4100ff4: 52800182     	mov	w2, #0xc                ; =12
 4100ff8: 977ca2a2     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4100ffc: b4fffe17     	cbz	x23, 0x4100fbc <_ChromeMain+0x40fbd20>
 4101000: 39805ee8     	ldrsb	x8, [x23, #0x17]
 4101004: b7f800c8     	tbnz	x8, #0x3f, 0x410101c <_ChromeMain+0x40fbd80>
 4101008: b4fffda0     	cbz	x0, 0x4100fbc <_ChromeMain+0x40fbd20>
 410100c: b4fffd88     	cbz	x8, 0x4100fbc <_ChromeMain+0x40fbd20>
 4101010: 39805c08     	ldrsb	x8, [x0, #0x17]
 4101014: b6fffd28     	tbz	x8, #0x3f, 0x4100fb8 <_ChromeMain+0x40fbd1c>
 4101018: 17ffffe7     	b	0x4100fb4 <_ChromeMain+0x40fbd18>
 410101c: f94006e8     	ldr	x8, [x23, #0x8]
 4101020: b4fffce0     	cbz	x0, 0x4100fbc <_ChromeMain+0x40fbd20>
 4101024: 17fffffa     	b	0x410100c <_ChromeMain+0x40fbd70>
 4101028: 52800028     	mov	w8, #0x1                ; =1
 410102c: 390493e8     	strb	w8, [sp, #0x124]
 4101030: b004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 4101034: 91079021     	add	x1, x1, #0x1e4
 4101038: d10383a0     	sub	x0, x29, #0xe0
 410103c: 528001c2     	mov	w2, #0xe                ; =14
 4101040: 97217600     	bl	0x95e840 <_ChromeMain+0x9595a4>
 4101044: b40005a0     	cbz	x0, 0x41010f8 <_ChromeMain+0x40fbe5c>
 4101048: 910143f3     	add	x19, sp, #0x50
 410104c: 910143e8     	add	x8, sp, #0x50
 4101050: 52800001     	mov	w1, #0x0                ; =0
 4101054: 94000585     	bl	0x4102668 <_ChromeMain+0x40fd3cc>
 4101058: 7940a3e8     	ldrh	w8, [sp, #0x50]
 410105c: 790253e8     	strh	w8, [sp, #0x128]
 4101060: 39c51fe8     	ldrsb	w8, [sp, #0x147]
 4101064: 37f88d08     	tbnz	w8, #0x1f, 0x4102204 <_ChromeMain+0x40fcf68>
 4101068: 3cc08260     	ldur	q0, [x19, #0x8]
 410106c: 9100432a     	add	x10, x25, #0x10
 4101070: 3d800140     	str	q0, [x10]
 4101074: f8418268     	ldur	x8, [x19, #0x18]
 4101078: f9000948     	str	x8, [x10, #0x10]
 410107c: 3901bfff     	strb	wzr, [sp, #0x6f]
 4101080: 390163ff     	strb	wzr, [sp, #0x58]
 4101084: 39c57fe8     	ldrsb	w8, [sp, #0x15f]
 4101088: 37f88c88     	tbnz	w8, #0x1f, 0x4102218 <_ChromeMain+0x40fcf7c>
 410108c: 3cc20260     	ldur	q0, [x19, #0x20]
 4101090: 9100a32a     	add	x10, x25, #0x28
 4101094: 3d800140     	str	q0, [x10]
 4101098: f8430268     	ldur	x8, [x19, #0x30]
 410109c: f9000948     	str	x8, [x10, #0x10]
 41010a0: 39021fff     	strb	wzr, [sp, #0x87]
 41010a4: 3901c3ff     	strb	wzr, [sp, #0x70]
 41010a8: 794113e8     	ldrh	w8, [sp, #0x88]
 41010ac: 7902c3e8     	strh	w8, [sp, #0x160]
 41010b0: 910143f3     	add	x19, sp, #0x50
 41010b4: 39c5ffe8     	ldrsb	w8, [sp, #0x17f]
 41010b8: 37f89648     	tbnz	w8, #0x1f, 0x4102380 <_ChromeMain+0x40fd0e4>
 41010bc: 3cc40260     	ldur	q0, [x19, #0x40]
 41010c0: 9101232a     	add	x10, x25, #0x48
 41010c4: 3d800140     	str	q0, [x10]
 41010c8: f8450268     	ldur	x8, [x19, #0x50]
 41010cc: f9000948     	str	x8, [x10, #0x10]
 41010d0: 39029fff     	strb	wzr, [sp, #0xa7]
 41010d4: 390243ff     	strb	wzr, [sp, #0x90]
 41010d8: f94057e8     	ldr	x8, [sp, #0xa8]
 41010dc: f900c3e8     	str	x8, [sp, #0x180]
 41010e0: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 41010e4: 36f800a8     	tbz	w8, #0x1f, 0x41010f8 <_ChromeMain+0x40fbe5c>
 41010e8: f9402fe0     	ldr	x0, [sp, #0x58]
 41010ec: f94037e8     	ldr	x8, [sp, #0x68]
 41010f0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41010f4: 96fc1f71     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41010f8: b004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 41010fc: 9107cc21     	add	x1, x1, #0x1f3
 4101100: d10383a0     	sub	x0, x29, #0xe0
 4101104: 528001e2     	mov	w2, #0xf                ; =15
 4101108: 972175ce     	bl	0x95e840 <_ChromeMain+0x9595a4>
 410110c: b40002c0     	cbz	x0, 0x4101164 <_ChromeMain+0x40fbec8>
 4101110: f9400408     	ldr	x8, [x0, #0x8]
 4101114: d37be913     	lsl	x19, x8, #5
 4101118: b4000273     	cbz	x19, 0x4101164 <_ChromeMain+0x40fbec8>
 410111c: 5280001b     	mov	w27, #0x0               ; =0
 4101120: 910143e8     	add	x8, sp, #0x50
 4101124: f9400015     	ldr	x21, [x0]
 4101128: 91002116     	add	x22, x8, #0x8
 410112c: 91008117     	add	x23, x8, #0x20
 4101130: 91010118     	add	x24, x8, #0x40
 4101134: 12800019     	mov	w25, #-0x1              ; =-1
 4101138: 52800c1a     	mov	w26, #0x60              ; =96
 410113c: b201f3fc     	mov	x28, #-0x5555555555555556 ; =-6148914691236517206
 4101140: f295557c     	movk	x28, #0xaaab
 4101144: 140000a2     	b	0x41013cc <_ChromeMain+0x40fc130>
 4101148: a9548be1     	ldp	x1, x2, [sp, #0x148]
 410114c: 91008260     	add	x0, x19, #0x20
 4101150: 96fc5c32     	bl	0x18218 <_ChromeMain+0x12f7c>
 4101154: 14000022     	b	0x41011dc <_ChromeMain+0x40fbf40>
 4101158: a9530be1     	ldp	x1, x2, [sp, #0x130]
 410115c: 96fc5c2f     	bl	0x18218 <_ChromeMain+0x12f7c>
 4101160: 14000018     	b	0x41011c0 <_ChromeMain+0x40fbf24>
 4101164: 5280001b     	mov	w27, #0x0               ; =0
 4101168: 3944a3e8     	ldrb	w8, [sp, #0x128]
 410116c: 2a280368     	orn	w8, w27, w8
 4101170: f94017f8     	ldr	x24, [sp, #0x28]
 4101174: 910483f4     	add	x20, sp, #0x120
 4101178: 370005a8     	tbnz	w8, #0x0, 0x410122c <_ChromeMain+0x40fbf90>
 410117c: a95aa7e8     	ldp	x8, x9, [sp, #0x1a8]
 4101180: eb09011f     	cmp	x8, x9
 4101184: 5400a200     	b.eq	0x41025c4 <_ChromeMain+0x40fd328>
 4101188: f940d3e9     	ldr	x9, [sp, #0x1a0]
 410118c: 52800c0a     	mov	w10, #0x60              ; =96
 4101190: 9b0a2513     	madd	x19, x8, x10, x9
 4101194: b4001f13     	cbz	x19, 0x4101574 <_ChromeMain+0x40fc2d8>
 4101198: 794253e8     	ldrh	w8, [sp, #0x128]
 410119c: aa1303e0     	mov	x0, x19
 41011a0: 78008408     	strh	w8, [x0], #0x8
 41011a4: 39c51fe8     	ldrsb	w8, [sp, #0x147]
 41011a8: 37fffd88     	tbnz	w8, #0x1f, 0x4101158 <_ChromeMain+0x40fbebc>
 41011ac: 91004289     	add	x9, x20, #0x10
 41011b0: 3dc00120     	ldr	q0, [x9]
 41011b4: f9400928     	ldr	x8, [x9, #0x10]
 41011b8: f9000808     	str	x8, [x0, #0x10]
 41011bc: 3d800000     	str	q0, [x0]
 41011c0: 39c57fe8     	ldrsb	w8, [sp, #0x15f]
 41011c4: 37fffc28     	tbnz	w8, #0x1f, 0x4101148 <_ChromeMain+0x40fbeac>
 41011c8: 9100a289     	add	x9, x20, #0x28
 41011cc: 3dc00120     	ldr	q0, [x9]
 41011d0: f9400928     	ldr	x8, [x9, #0x10]
 41011d4: f8030268     	stur	x8, [x19, #0x30]
 41011d8: 3c820260     	stur	q0, [x19, #0x20]
 41011dc: 7942c3e8     	ldrh	w8, [sp, #0x160]
 41011e0: 79007268     	strh	w8, [x19, #0x38]
 41011e4: 39c5ffe8     	ldrsb	w8, [sp, #0x17f]
 41011e8: 37f805e8     	tbnz	w8, #0x1f, 0x41012a4 <_ChromeMain+0x40fc008>
 41011ec: 91012289     	add	x9, x20, #0x48
 41011f0: 3dc00120     	ldr	q0, [x9]
 41011f4: f9400928     	ldr	x8, [x9, #0x10]
 41011f8: f8050268     	stur	x8, [x19, #0x50]
 41011fc: 3c840260     	stur	q0, [x19, #0x40]
 4101200: f940c3e8     	ldr	x8, [sp, #0x180]
 4101204: f9002e68     	str	x8, [x19, #0x58]
 4101208: 91018260     	add	x0, x19, #0x60
 410120c: f940d3e8     	ldr	x8, [sp, #0x1a0]
 4101210: eb080008     	subs	x8, x0, x8
 4101214: 9345fd08     	asr	x8, x8, #5
 4101218: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 410121c: f2955569     	movk	x9, #0xaaab
 4101220: 9b097d08     	mul	x8, x8, x9
 4101224: f900d7e8     	str	x8, [sp, #0x1a8]
 4101228: 54001a60     	b.eq	0x4101574 <_ChromeMain+0x40fc2d8>
 410122c: f004c341     	adrp	x1, 0xd96c000 <dyld_stub_binder+0xd96c000>
 4101230: 912a5821     	add	x1, x1, #0xa96
 4101234: d10383a0     	sub	x0, x29, #0xe0
 4101238: 52800102     	mov	w2, #0x8                ; =8
 410123c: 9760ae11     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 4101240: b40003a0     	cbz	x0, 0x41012b4 <_ChromeMain+0x40fc018>
 4101244: a9402016     	ldp	x22, x8, [x0]
 4101248: 8b0816c9     	add	x9, x22, x8, lsl #5
 410124c: eb0902df     	cmp	x22, x9
 4101250: 5400a068     	b.hi	0x410265c <_ChromeMain+0x40fd3c0>
 4101254: d37be917     	lsl	x23, x8, #5
 4101258: b4004497     	cbz	x23, 0x4101ae8 <_ChromeMain+0x40fc84c>
 410125c: 910143e8     	add	x8, sp, #0x50
 4101260: 9100210a     	add	x10, x8, #0x8
 4101264: 91008109     	add	x9, x8, #0x20
 4101268: a9042be9     	stp	x9, x10, [sp, #0x40]
 410126c: 9100e113     	add	x19, x8, #0x38
 4101270: 91014118     	add	x24, x8, #0x50
 4101274: 9101a11b     	add	x27, x8, #0x68
 4101278: 9102011c     	add	x28, x8, #0x80
 410127c: 91028114     	add	x20, x8, #0xa0
 4101280: d004b775     	adrp	x21, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 4101284: 9109e6b5     	add	x21, x21, #0x279
 4101288: b004cc99     	adrp	x25, 0xda92000 <dyld_stub_binder+0xda92000>
 410128c: 91080f39     	add	x25, x25, #0x203
 4101290: b004cc9a     	adrp	x26, 0xda92000 <dyld_stub_binder+0xda92000>
 4101294: 9108675a     	add	x26, x26, #0x219
 4101298: a900d3fc     	stp	x28, x20, [sp, #0x8]
 410129c: f90003f8     	str	x24, [sp]
 41012a0: 14000190     	b	0x41018e0 <_ChromeMain+0x40fc644>
 41012a4: a9568be1     	ldp	x1, x2, [sp, #0x168]
 41012a8: 91010260     	add	x0, x19, #0x40
 41012ac: 96fc5bdb     	bl	0x18218 <_ChromeMain+0x12f7c>
 41012b0: 17ffffd4     	b	0x4101200 <_ChromeMain+0x40fbf64>
 41012b4: 39457fe8     	ldrb	w8, [sp, #0x15f]
 41012b8: f940abe9     	ldr	x9, [sp, #0x150]
 41012bc: 7219011f     	tst	w8, #0x80
 41012c0: 9a881128     	csel	x8, x9, x8, ne
 41012c4: b4000068     	cbz	x8, 0x41012d0 <_ChromeMain+0x40fc034>
 41012c8: 52800028     	mov	w8, #0x1                ; =1
 41012cc: 390583e8     	strb	w8, [sp, #0x160]
 41012d0: b94123e8     	ldr	w8, [sp, #0x120]
 41012d4: b9000308     	str	w8, [x24]
 41012d8: 394493e8     	ldrb	w8, [sp, #0x124]
 41012dc: 39001308     	strb	w8, [x24, #0x4]
 41012e0: 794253e8     	ldrh	w8, [sp, #0x128]
 41012e4: 79001308     	strh	w8, [x24, #0x8]
 41012e8: a941a7ea     	ldp	x10, x9, [sp, #0x18]
 41012ec: 3dc00140     	ldr	q0, [x10]
 41012f0: 3d800700     	str	q0, [x24, #0x10]
 41012f4: f9400948     	ldr	x8, [x10, #0x10]
 41012f8: f9001308     	str	x8, [x24, #0x20]
 41012fc: a9007d5f     	stp	xzr, xzr, [x10]
 4101300: f900095f     	str	xzr, [x10, #0x10]
 4101304: 3dc00120     	ldr	q0, [x9]
 4101308: 3c828300     	stur	q0, [x24, #0x28]
 410130c: f9400928     	ldr	x8, [x9, #0x10]
 4101310: f9001f08     	str	x8, [x24, #0x38]
 4101314: a9007d3f     	stp	xzr, xzr, [x9]
 4101318: f900093f     	str	xzr, [x9, #0x10]
 410131c: 7942c3e8     	ldrh	w8, [sp, #0x160]
 4101320: 79008308     	strh	w8, [x24, #0x40]
 4101324: f9401be9     	ldr	x9, [sp, #0x30]
 4101328: 3dc00120     	ldr	q0, [x9]
 410132c: f9400928     	ldr	x8, [x9, #0x10]
 4101330: 3c848300     	stur	q0, [x24, #0x48]
 4101334: a9007d3f     	stp	xzr, xzr, [x9]
 4101338: f900093f     	str	xzr, [x9, #0x10]
 410133c: a9582be9     	ldp	x9, x10, [sp, #0x180]
 4101340: a905a708     	stp	x8, x9, [x24, #0x58]
 4101344: f900370a     	str	x10, [x24, #0x68]
 4101348: 3dc067e0     	ldr	q0, [sp, #0x190]
 410134c: a918ffff     	stp	xzr, xzr, [sp, #0x188]
 4101350: 3d801f00     	str	q0, [x24, #0x70]
 4101354: a95a27e8     	ldp	x8, x9, [sp, #0x1a0]
 4101358: a919ffff     	stp	xzr, xzr, [sp, #0x198]
 410135c: f900d7ff     	str	xzr, [sp, #0x1a8]
 4101360: a9082708     	stp	x8, x9, [x24, #0x80]
 4101364: 17fffedf     	b	0x4100ee0 <_ChromeMain+0x40fbc44>
 4101368: a9458be1     	ldp	x1, x2, [sp, #0x58]
 410136c: 91004280     	add	x0, x20, #0x10
 4101370: 970e9dd1     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101374: 14000039     	b	0x4101458 <_ChromeMain+0x40fc1bc>
 4101378: a94006a0     	ldp	x0, x1, [x21]
 410137c: 14000019     	b	0x41013e0 <_ChromeMain+0x40fc144>
 4101380: f9404be0     	ldr	x0, [sp, #0x90]
 4101384: f94053e8     	ldr	x8, [sp, #0xa0]
 4101388: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 410138c: 96fc1ecb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4101390: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4101394: 36f800a8     	tbz	w8, #0x1f, 0x41013a8 <_ChromeMain+0x40fc10c>
 4101398: f9403be0     	ldr	x0, [sp, #0x70]
 410139c: f94043e8     	ldr	x8, [sp, #0x80]
 41013a0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41013a4: 96fc1ec5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41013a8: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 41013ac: 36f800a8     	tbz	w8, #0x1f, 0x41013c0 <_ChromeMain+0x40fc124>
 41013b0: f9402fe0     	ldr	x0, [sp, #0x58]
 41013b4: f94037e8     	ldr	x8, [sp, #0x68]
 41013b8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41013bc: 96fc1ebf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41013c0: 910082b5     	add	x21, x21, #0x20
 41013c4: f1008273     	subs	x19, x19, #0x20
 41013c8: 54ffed00     	b.eq	0x4101168 <_ChromeMain+0x40fbecc>
 41013cc: f9400eb4     	ldr	x20, [x21, #0x18]
 41013d0: b9011ff9     	str	w25, [sp, #0x11c]
 41013d4: 39805ea1     	ldrsb	x1, [x21, #0x17]
 41013d8: b7fffd01     	tbnz	x1, #0x3f, 0x4101378 <_ChromeMain+0x40fc0dc>
 41013dc: aa1503e0     	mov	x0, x21
 41013e0: 910473e2     	add	x2, sp, #0x11c
 41013e4: 975efac0     	bl	0x18bfee4 <_ChromeMain+0x18bac48>
 41013e8: 34fffec0     	cbz	w0, 0x41013c0 <_ChromeMain+0x40fc124>
 41013ec: b9411fe1     	ldr	w1, [sp, #0x11c]
 41013f0: 37fffe81     	tbnz	w1, #0x1f, 0x41013c0 <_ChromeMain+0x40fc124>
 41013f4: b4fffe74     	cbz	x20, 0x41013c0 <_ChromeMain+0x40fc124>
 41013f8: 39406288     	ldrb	w8, [x20, #0x18]
 41013fc: 7100191f     	cmp	w8, #0x6
 4101400: 54fffe01     	b.ne	0x41013c0 <_ChromeMain+0x40fc124>
 4101404: 6f00e400     	movi.2d	v0, #0000000000000000
 4101408: ad0483e0     	stp	q0, q0, [sp, #0x90]
 410140c: ad0383e0     	stp	q0, q0, [sp, #0x70]
 4101410: ad0283e0     	stp	q0, q0, [sp, #0x50]
 4101414: 910143e8     	add	x8, sp, #0x50
 4101418: aa1403e0     	mov	x0, x20
 410141c: 94000493     	bl	0x4102668 <_ChromeMain+0x40fd3cc>
 4101420: b9411fe8     	ldr	w8, [sp, #0x11c]
 4101424: 35000488     	cbnz	w8, 0x41014b4 <_ChromeMain+0x40fc218>
 4101428: 7940a3e8     	ldrh	w8, [sp, #0x50]
 410142c: 790253e8     	strh	w8, [sp, #0x128]
 4101430: 39c51fe9     	ldrsb	w9, [sp, #0x147]
 4101434: 3941bfe8     	ldrb	w8, [sp, #0x6f]
 4101438: 37f87929     	tbnz	w9, #0x1f, 0x410235c <_ChromeMain+0x40fd0c0>
 410143c: 910483f4     	add	x20, sp, #0x120
 4101440: 373ff948     	tbnz	w8, #0x7, 0x4101368 <_ChromeMain+0x40fc0cc>
 4101444: 3dc002c0     	ldr	q0, [x22]
 4101448: 9100428a     	add	x10, x20, #0x10
 410144c: 3d800140     	str	q0, [x10]
 4101450: f9400ac8     	ldr	x8, [x22, #0x10]
 4101454: f9000948     	str	x8, [x10, #0x10]
 4101458: 39c57fe9     	ldrsb	w9, [sp, #0x15f]
 410145c: 39421fe8     	ldrb	w8, [sp, #0x87]
 4101460: 37f875e9     	tbnz	w9, #0x1f, 0x410231c <_ChromeMain+0x40fd080>
 4101464: 37380808     	tbnz	w8, #0x7, 0x4101564 <_ChromeMain+0x40fc2c8>
 4101468: 3dc002e0     	ldr	q0, [x23]
 410146c: 9100a28a     	add	x10, x20, #0x28
 4101470: 3d800140     	str	q0, [x10]
 4101474: f9400ae8     	ldr	x8, [x23, #0x10]
 4101478: f9000948     	str	x8, [x10, #0x10]
 410147c: 794113e8     	ldrh	w8, [sp, #0x88]
 4101480: 7902c3e8     	strh	w8, [sp, #0x160]
 4101484: 39c5ffe9     	ldrsb	w9, [sp, #0x17f]
 4101488: 39429fe8     	ldrb	w8, [sp, #0xa7]
 410148c: 37f87589     	tbnz	w9, #0x1f, 0x410233c <_ChromeMain+0x40fd0a0>
 4101490: 37380628     	tbnz	w8, #0x7, 0x4101554 <_ChromeMain+0x40fc2b8>
 4101494: 3dc00300     	ldr	q0, [x24]
 4101498: 9101228a     	add	x10, x20, #0x48
 410149c: 3d800140     	str	q0, [x10]
 41014a0: f9400b08     	ldr	x8, [x24, #0x10]
 41014a4: f9000948     	str	x8, [x10, #0x10]
 41014a8: f94057e8     	ldr	x8, [sp, #0xa8]
 41014ac: f900c3e8     	str	x8, [sp, #0x180]
 41014b0: 5280003b     	mov	w27, #0x1               ; =1
 41014b4: a95aa3f4     	ldp	x20, x8, [sp, #0x1a8]
 41014b8: eb08029f     	cmp	x20, x8
 41014bc: 54007f60     	b.eq	0x41024a8 <_ChromeMain+0x40fd20c>
 41014c0: f940d3e8     	ldr	x8, [sp, #0x1a0]
 41014c4: 9b1a2288     	madd	x8, x20, x26, x8
 41014c8: b4000568     	cbz	x8, 0x4101574 <_ChromeMain+0x40fc2d8>
 41014cc: 7940a3e9     	ldrh	w9, [sp, #0x50]
 41014d0: 79000109     	strh	w9, [x8]
 41014d4: 3dc002c0     	ldr	q0, [x22]
 41014d8: f9400ac9     	ldr	x9, [x22, #0x10]
 41014dc: f9000d09     	str	x9, [x8, #0x18]
 41014e0: 3c808100     	stur	q0, [x8, #0x8]
 41014e4: a900fedf     	stp	xzr, xzr, [x22, #0x8]
 41014e8: f90002df     	str	xzr, [x22]
 41014ec: 3dc002e0     	ldr	q0, [x23]
 41014f0: f9400ae9     	ldr	x9, [x23, #0x10]
 41014f4: f9001909     	str	x9, [x8, #0x30]
 41014f8: 3d800900     	str	q0, [x8, #0x20]
 41014fc: a900feff     	stp	xzr, xzr, [x23, #0x8]
 4101500: f90002ff     	str	xzr, [x23]
 4101504: 794113e9     	ldrh	w9, [sp, #0x88]
 4101508: 79007109     	strh	w9, [x8, #0x38]
 410150c: 3dc00300     	ldr	q0, [x24]
 4101510: f9400b09     	ldr	x9, [x24, #0x10]
 4101514: f9002909     	str	x9, [x8, #0x50]
 4101518: 3d801100     	str	q0, [x8, #0x40]
 410151c: a900ff1f     	stp	xzr, xzr, [x24, #0x8]
 4101520: f900031f     	str	xzr, [x24]
 4101524: f94057e9     	ldr	x9, [sp, #0xa8]
 4101528: f9002d09     	str	x9, [x8, #0x58]
 410152c: 91018114     	add	x20, x8, #0x60
 4101530: f940d3e8     	ldr	x8, [sp, #0x1a0]
 4101534: eb080288     	subs	x8, x20, x8
 4101538: 9345fd08     	asr	x8, x8, #5
 410153c: 9b1c7d08     	mul	x8, x8, x28
 4101540: f900d7e8     	str	x8, [sp, #0x1a8]
 4101544: 54000180     	b.eq	0x4101574 <_ChromeMain+0x40fc2d8>
 4101548: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 410154c: 36fff228     	tbz	w8, #0x1f, 0x4101390 <_ChromeMain+0x40fc0f4>
 4101550: 17ffff8c     	b	0x4101380 <_ChromeMain+0x40fc0e4>
 4101554: a9490be1     	ldp	x1, x2, [sp, #0x90]
 4101558: 91012280     	add	x0, x20, #0x48
 410155c: 970e9d56     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101560: 17ffffd2     	b	0x41014a8 <_ChromeMain+0x40fc20c>
 4101564: a9470be1     	ldp	x1, x2, [sp, #0x70]
 4101568: 9100a280     	add	x0, x20, #0x28
 410156c: 970e9d52     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101570: 17ffffc3     	b	0x410147c <_ChromeMain+0x40fc1e0>
 4101574: d4200020     	brk	#0x1
 4101578: a9400801     	ldp	x1, x2, [x0]
 410157c: f94027e0     	ldr	x0, [sp, #0x48]
 4101580: 970e9d4d     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101584: 1400003f     	b	0x4101680 <_ChromeMain+0x40fc3e4>
 4101588: a9400801     	ldp	x1, x2, [x0]
 410158c: f94023e0     	ldr	x0, [sp, #0x40]
 4101590: 970e9d49     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101594: 1400004d     	b	0x41016c8 <_ChromeMain+0x40fc42c>
 4101598: a9400801     	ldp	x1, x2, [x0]
 410159c: aa1803e0     	mov	x0, x24
 41015a0: 970e9d45     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 41015a4: 14000069     	b	0x4101748 <_ChromeMain+0x40fc4ac>
 41015a8: a9400801     	ldp	x1, x2, [x0]
 41015ac: aa1303e0     	mov	x0, x19
 41015b0: 970e9d41     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 41015b4: 14000055     	b	0x4101708 <_ChromeMain+0x40fc46c>
 41015b8: a9400801     	ldp	x1, x2, [x0]
 41015bc: aa1403e0     	mov	x0, x20
 41015c0: 970e9d3d     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 41015c4: 1400001d     	b	0x4101638 <_ChromeMain+0x40fc39c>
 41015c8: f9400009     	ldr	x9, [x0]
 41015cc: 7100011f     	cmp	w8, #0x0
 41015d0: 9a804128     	csel	x8, x9, x0, mi
 41015d4: b9400109     	ldr	w9, [x8]
 41015d8: 79400908     	ldrh	w8, [x8, #0x4]
 41015dc: 528c2e0a     	mov	w10, #0x6170            ; =24944
 41015e0: 72ae6eaa     	movk	w10, #0x7375, lsl #16
 41015e4: 6b0a013f     	cmp	w9, w10
 41015e8: 528c8ca9     	mov	w9, #0x6465             ; =25701
 41015ec: 7a490100     	ccmp	w8, w9, #0x0, eq
 41015f0: 1a9f17e8     	cset	w8, eq
 41015f4: 3903a7e8     	strb	w8, [sp, #0xe9]
 41015f8: aa1603e0     	mov	x0, x22
 41015fc: b004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 4101600: 91089021     	add	x1, x1, #0x224
 4101604: 52800202     	mov	w2, #0x10               ; =16
 4101608: 977ca11e     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 410160c: eb00029f     	cmp	x20, x0
 4101610: fa401804     	ccmp	x0, #0x0, #0x4, ne
 4101614: 54000120     	b.eq	0x4101638 <_ChromeMain+0x40fc39c>
 4101618: 39c41fe9     	ldrsb	w9, [sp, #0x107]
 410161c: 39405c08     	ldrb	w8, [x0, #0x17]
 4101620: 37f86069     	tbnz	w9, #0x1f, 0x410222c <_ChromeMain+0x40fcf90>
 4101624: 373ffca8     	tbnz	w8, #0x7, 0x41015b8 <_ChromeMain+0x40fc31c>
 4101628: 3dc00000     	ldr	q0, [x0]
 410162c: f9400808     	ldr	x8, [x0, #0x10]
 4101630: f9000a88     	str	x8, [x20, #0x10]
 4101634: 3d800280     	str	q0, [x20]
 4101638: aa1603e0     	mov	x0, x22
 410163c: b004b781     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 4101640: 9138dc21     	add	x1, x1, #0xe37
 4101644: 52800082     	mov	w2, #0x4                ; =4
 4101648: 977ca10e     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 410164c: f94027e8     	ldr	x8, [sp, #0x48]
 4101650: eb00011f     	cmp	x8, x0
 4101654: fa401804     	ccmp	x0, #0x0, #0x4, ne
 4101658: 54000140     	b.eq	0x4101680 <_ChromeMain+0x40fc3e4>
 410165c: 39c1bfe9     	ldrsb	w9, [sp, #0x6f]
 4101660: 39405c08     	ldrb	w8, [x0, #0x17]
 4101664: 37f85f49     	tbnz	w9, #0x1f, 0x410224c <_ChromeMain+0x40fcfb0>
 4101668: 373ff888     	tbnz	w8, #0x7, 0x4101578 <_ChromeMain+0x40fc2dc>
 410166c: 3dc00000     	ldr	q0, [x0]
 4101670: f9400808     	ldr	x8, [x0, #0x10]
 4101674: f94027e9     	ldr	x9, [sp, #0x48]
 4101678: f9000928     	str	x8, [x9, #0x10]
 410167c: 3d800120     	str	q0, [x9]
 4101680: aa1603e0     	mov	x0, x22
 4101684: b004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 4101688: 9108d421     	add	x1, x1, #0x235
 410168c: 52800102     	mov	w2, #0x8                ; =8
 4101690: 977ca0fc     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4101694: f94023e8     	ldr	x8, [sp, #0x40]
 4101698: eb00011f     	cmp	x8, x0
 410169c: fa401804     	ccmp	x0, #0x0, #0x4, ne
 41016a0: 54000140     	b.eq	0x41016c8 <_ChromeMain+0x40fc42c>
 41016a4: 39c21fe9     	ldrsb	w9, [sp, #0x87]
 41016a8: 39405c08     	ldrb	w8, [x0, #0x17]
 41016ac: 37f85e09     	tbnz	w9, #0x1f, 0x410226c <_ChromeMain+0x40fcfd0>
 41016b0: 373ff6c8     	tbnz	w8, #0x7, 0x4101588 <_ChromeMain+0x40fc2ec>
 41016b4: 3dc00000     	ldr	q0, [x0]
 41016b8: f9400808     	ldr	x8, [x0, #0x10]
 41016bc: f94023e9     	ldr	x9, [sp, #0x40]
 41016c0: f9000928     	str	x8, [x9, #0x10]
 41016c4: 3d800120     	str	q0, [x9]
 41016c8: aa1603e0     	mov	x0, x22
 41016cc: 9004b7e1     	adrp	x1, 0xd7fd000 <dyld_stub_binder+0xd7fd000>
 41016d0: 912a3c21     	add	x1, x1, #0xa8f
 41016d4: 52800082     	mov	w2, #0x4                ; =4
 41016d8: 977ca0ea     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 41016dc: eb00027f     	cmp	x19, x0
 41016e0: fa401804     	ccmp	x0, #0x0, #0x4, ne
 41016e4: 54000120     	b.eq	0x4101708 <_ChromeMain+0x40fc46c>
 41016e8: 39c27fe9     	ldrsb	w9, [sp, #0x9f]
 41016ec: 39405c08     	ldrb	w8, [x0, #0x17]
 41016f0: 37f85ce9     	tbnz	w9, #0x1f, 0x410228c <_ChromeMain+0x40fcff0>
 41016f4: 373ff5a8     	tbnz	w8, #0x7, 0x41015a8 <_ChromeMain+0x40fc30c>
 41016f8: 3dc00000     	ldr	q0, [x0]
 41016fc: f9400808     	ldr	x8, [x0, #0x10]
 4101700: f9000a68     	str	x8, [x19, #0x10]
 4101704: 3d800260     	str	q0, [x19]
 4101708: aa1603e0     	mov	x0, x22
 410170c: b004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 4101710: 9108f821     	add	x1, x1, #0x23e
 4101714: 528000c2     	mov	w2, #0x6                ; =6
 4101718: 977ca0da     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 410171c: eb00031f     	cmp	x24, x0
 4101720: fa401804     	ccmp	x0, #0x0, #0x4, ne
 4101724: 54000120     	b.eq	0x4101748 <_ChromeMain+0x40fc4ac>
 4101728: 39c2dfe9     	ldrsb	w9, [sp, #0xb7]
 410172c: 39405c08     	ldrb	w8, [x0, #0x17]
 4101730: 37f85be9     	tbnz	w9, #0x1f, 0x41022ac <_ChromeMain+0x40fd010>
 4101734: 373ff328     	tbnz	w8, #0x7, 0x4101598 <_ChromeMain+0x40fc2fc>
 4101738: 3dc00000     	ldr	q0, [x0]
 410173c: f9400808     	ldr	x8, [x0, #0x10]
 4101740: f9000b08     	str	x8, [x24, #0x10]
 4101744: 3d800300     	str	q0, [x24]
 4101748: aa1603e0     	mov	x0, x22
 410174c: f004be81     	adrp	x1, 0xd8d4000 <dyld_stub_binder+0xd8d4000>
 4101750: 91343821     	add	x1, x1, #0xd0e
 4101754: 528000a2     	mov	w2, #0x5                ; =5
 4101758: 977ca0ca     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 410175c: eb00037f     	cmp	x27, x0
 4101760: fa401804     	ccmp	x0, #0x0, #0x4, ne
 4101764: 54000120     	b.eq	0x4101788 <_ChromeMain+0x40fc4ec>
 4101768: 39c33fe9     	ldrsb	w9, [sp, #0xcf]
 410176c: 39405c08     	ldrb	w8, [x0, #0x17]
 4101770: 37f85ae9     	tbnz	w9, #0x1f, 0x41022cc <_ChromeMain+0x40fd030>
 4101774: 37380f48     	tbnz	w8, #0x7, 0x410195c <_ChromeMain+0x40fc6c0>
 4101778: 3dc00000     	ldr	q0, [x0]
 410177c: f9400808     	ldr	x8, [x0, #0x10]
 4101780: f9000b68     	str	x8, [x27, #0x10]
 4101784: 3d800360     	str	q0, [x27]
 4101788: aa1603e0     	mov	x0, x22
 410178c: b004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 4101790: 91091421     	add	x1, x1, #0x245
 4101794: 52800142     	mov	w2, #0xa                ; =10
 4101798: 977ca0ba     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 410179c: eb00039f     	cmp	x28, x0
 41017a0: fa401804     	ccmp	x0, #0x0, #0x4, ne
 41017a4: 54000120     	b.eq	0x41017c8 <_ChromeMain+0x40fc52c>
 41017a8: 39c39fe9     	ldrsb	w9, [sp, #0xe7]
 41017ac: 39405c08     	ldrb	w8, [x0, #0x17]
 41017b0: 37f859e9     	tbnz	w9, #0x1f, 0x41022ec <_ChromeMain+0x40fd050>
 41017b4: 37380cc8     	tbnz	w8, #0x7, 0x410194c <_ChromeMain+0x40fc6b0>
 41017b8: 3dc00000     	ldr	q0, [x0]
 41017bc: f9400808     	ldr	x8, [x0, #0x10]
 41017c0: f9000b88     	str	x8, [x28, #0x10]
 41017c4: 3d800380     	str	q0, [x28]
 41017c8: a95927e8     	ldp	x8, x9, [sp, #0x190]
 41017cc: eb09011f     	cmp	x8, x9
 41017d0: 54006200     	b.eq	0x4102410 <_ChromeMain+0x40fd174>
 41017d4: f940c7e9     	ldr	x9, [sp, #0x188]
 41017d8: 5280180a     	mov	w10, #0xc0              ; =192
 41017dc: 9b0a2508     	madd	x8, x8, x10, x9
 41017e0: b4ffeca8     	cbz	x8, 0x4101574 <_ChromeMain+0x40fc2d8>
 41017e4: b94053e9     	ldr	w9, [sp, #0x50]
 41017e8: b9000109     	str	w9, [x8]
 41017ec: a9442fea     	ldp	x10, x11, [sp, #0x40]
 41017f0: 3dc00160     	ldr	q0, [x11]
 41017f4: f9400969     	ldr	x9, [x11, #0x10]
 41017f8: f9000d09     	str	x9, [x8, #0x18]
 41017fc: 3c808100     	stur	q0, [x8, #0x8]
 4101800: a900fd7f     	stp	xzr, xzr, [x11, #0x8]
 4101804: f900017f     	str	xzr, [x11]
 4101808: 3dc00140     	ldr	q0, [x10]
 410180c: f9400949     	ldr	x9, [x10, #0x10]
 4101810: f9001909     	str	x9, [x8, #0x30]
 4101814: 3d800900     	str	q0, [x8, #0x20]
 4101818: a900fd5f     	stp	xzr, xzr, [x10, #0x8]
 410181c: f900015f     	str	xzr, [x10]
 4101820: 3dc00260     	ldr	q0, [x19]
 4101824: f9400a69     	ldr	x9, [x19, #0x10]
 4101828: f9002509     	str	x9, [x8, #0x48]
 410182c: 3c838100     	stur	q0, [x8, #0x38]
 4101830: a900fe7f     	stp	xzr, xzr, [x19, #0x8]
 4101834: f900027f     	str	xzr, [x19]
 4101838: 3dc00300     	ldr	q0, [x24]
 410183c: f9400b09     	ldr	x9, [x24, #0x10]
 4101840: f9003109     	str	x9, [x8, #0x60]
 4101844: 3d801500     	str	q0, [x8, #0x50]
 4101848: a9007f1f     	stp	xzr, xzr, [x24]
 410184c: f9000b1f     	str	xzr, [x24, #0x10]
 4101850: 3dc00360     	ldr	q0, [x27]
 4101854: f9400b69     	ldr	x9, [x27, #0x10]
 4101858: f9003d09     	str	x9, [x8, #0x78]
 410185c: 3c868100     	stur	q0, [x8, #0x68]
 4101860: a9007f7f     	stp	xzr, xzr, [x27]
 4101864: f9000b7f     	str	xzr, [x27, #0x10]
 4101868: 3dc00380     	ldr	q0, [x28]
 410186c: f9400b89     	ldr	x9, [x28, #0x10]
 4101870: f9004909     	str	x9, [x8, #0x90]
 4101874: 3d802100     	str	q0, [x8, #0x80]
 4101878: a9007f9f     	stp	xzr, xzr, [x28]
 410187c: f9000b9f     	str	xzr, [x28, #0x10]
 4101880: 7941d3e9     	ldrh	w9, [sp, #0xe8]
 4101884: 79013109     	strh	w9, [x8, #0x98]
 4101888: 3dc00280     	ldr	q0, [x20]
 410188c: f9400a89     	ldr	x9, [x20, #0x10]
 4101890: f9005909     	str	x9, [x8, #0xb0]
 4101894: 3d802900     	str	q0, [x8, #0xa0]
 4101898: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 410189c: f900029f     	str	xzr, [x20]
 41018a0: 794213e9     	ldrh	w9, [sp, #0x108]
 41018a4: 79017109     	strh	w9, [x8, #0xb8]
 41018a8: 91030100     	add	x0, x8, #0xc0
 41018ac: f940c7e8     	ldr	x8, [sp, #0x188]
 41018b0: eb080008     	subs	x8, x0, x8
 41018b4: 9346fd08     	asr	x8, x8, #6
 41018b8: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 41018bc: f2955569     	movk	x9, #0xaaab
 41018c0: 9b097d08     	mul	x8, x8, x9
 41018c4: f900cbe8     	str	x8, [sp, #0x190]
 41018c8: 54ffe560     	b.eq	0x4101574 <_ChromeMain+0x40fc2d8>
 41018cc: 910143e0     	add	x0, sp, #0x50
 41018d0: 97fff69a     	bl	0x40ff338 <_ChromeMain+0x40fa09c>
 41018d4: 910082d6     	add	x22, x22, #0x20
 41018d8: f10082f7     	subs	x23, x23, #0x20
 41018dc: 54001060     	b.eq	0x4101ae8 <_ChromeMain+0x40fc84c>
 41018e0: b4ffffb6     	cbz	x22, 0x41018d4 <_ChromeMain+0x40fc638>
 41018e4: 394062c8     	ldrb	w8, [x22, #0x18]
 41018e8: 7100191f     	cmp	w8, #0x6
 41018ec: 54ffff41     	b.ne	0x41018d4 <_ChromeMain+0x40fc638>
 41018f0: aa1603e0     	mov	x0, x22
 41018f4: aa1503e1     	mov	x1, x21
 41018f8: 52800042     	mov	w2, #0x2                ; =2
 41018fc: 972174e1     	bl	0x95ec80 <_ChromeMain+0x9599e4>
 4101900: b607fea0     	tbz	x0, #0x20, 0x41018d4 <_ChromeMain+0x40fc638>
 4101904: 6f00e400     	movi.2d	v0, #0000000000000000
 4101908: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 410190c: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 4101910: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 4101914: ad0483e0     	stp	q0, q0, [sp, #0x90]
 4101918: ad0383e0     	stp	q0, q0, [sp, #0x70]
 410191c: ad0283e0     	stp	q0, q0, [sp, #0x50]
 4101920: b90053e0     	str	w0, [sp, #0x50]
 4101924: aa1603e0     	mov	x0, x22
 4101928: aa1903e1     	mov	x1, x25
 410192c: 528002a2     	mov	w2, #0x15               ; =21
 4101930: 97397c24     	bl	0xf609c0 <_ChromeMain+0xf5b724>
 4101934: b40002c0     	cbz	x0, 0x410198c <_ChromeMain+0x40fc6f0>
 4101938: 39406008     	ldrb	w8, [x0, #0x18]
 410193c: 7100111f     	cmp	w8, #0x4
 4101940: 54000160     	b.eq	0x410196c <_ChromeMain+0x40fc6d0>
 4101944: 52800008     	mov	w8, #0x0                ; =0
 4101948: 1400000f     	b	0x4101984 <_ChromeMain+0x40fc6e8>
 410194c: a9400801     	ldp	x1, x2, [x0]
 4101950: aa1c03e0     	mov	x0, x28
 4101954: 970e9c58     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101958: 17ffff9c     	b	0x41017c8 <_ChromeMain+0x40fc52c>
 410195c: a9400801     	ldp	x1, x2, [x0]
 4101960: aa1b03e0     	mov	x0, x27
 4101964: 970e9c54     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101968: 17ffff88     	b	0x4101788 <_ChromeMain+0x40fc4ec>
 410196c: 39405c08     	ldrb	w8, [x0, #0x17]
 4101970: f9400409     	ldr	x9, [x0, #0x8]
 4101974: 7219011f     	tst	w8, #0x80
 4101978: 9a881128     	csel	x8, x9, x8, ne
 410197c: f100011f     	cmp	x8, #0x0
 4101980: 1a9f07e8     	cset	w8, ne
 4101984: 32180108     	orr	w8, w8, #0x100
 4101988: 790213e8     	strh	w8, [sp, #0x108]
 410198c: 52800008     	mov	w8, #0x0                ; =0
 4101990: f9401fe9     	ldr	x9, [sp, #0x38]
 4101994: b4000869     	cbz	x9, 0x4101aa0 <_ChromeMain+0x40fc804>
 4101998: b94053e0     	ldr	w0, [sp, #0x50]
 410199c: 37f80820     	tbnz	w0, #0x1f, 0x4101aa0 <_ChromeMain+0x40fc804>
 41019a0: aa1903fa     	mov	x26, x25
 41019a4: aa1503f9     	mov	x25, x21
 41019a8: d10203a8     	sub	x8, x29, #0x80
 41019ac: 9740be25     	bl	0x1131240 <_ChromeMain+0x112bfa4>
 41019b0: 389973a8     	ldursb	x8, [x29, #-0x69]
 41019b4: a9782ba9     	ldp	x9, x10, [x29, #-0x80]
 41019b8: f100011f     	cmp	x8, #0x0
 41019bc: d10203ab     	sub	x11, x29, #0x80
 41019c0: 9a8b4121     	csel	x1, x9, x11, mi
 41019c4: 7100011f     	cmp	w8, #0x0
 41019c8: 9a884142     	csel	x2, x10, x8, mi
 41019cc: f9401fe0     	ldr	x0, [sp, #0x38]
 41019d0: 9721739c     	bl	0x95e840 <_ChromeMain+0x9595a4>
 41019d4: aa0003f5     	mov	x21, x0
 41019d8: 38d973a8     	ldursb	w8, [x29, #-0x69]
 41019dc: 37f804e8     	tbnz	w8, #0x1f, 0x4101a78 <_ChromeMain+0x40fc7dc>
 41019e0: b4000575     	cbz	x21, 0x4101a8c <_ChromeMain+0x40fc7f0>
 41019e4: aa1303fc     	mov	x28, x19
 41019e8: aa1503e0     	mov	x0, x21
 41019ec: f004ca41     	adrp	x1, 0xda4c000 <dyld_stub_binder+0xda4c000>
 41019f0: 910af821     	add	x1, x1, #0x2be
 41019f4: 52800162     	mov	w2, #0xb                ; =11
 41019f8: 977ca022     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 41019fc: aa0003f3     	mov	x19, x0
 4101a00: aa1503e0     	mov	x0, x21
 4101a04: b004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 4101a08: 910bbc21     	add	x1, x1, #0x2ef
 4101a0c: 52800182     	mov	w2, #0xc                ; =12
 4101a10: 977ca01c     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4101a14: b4000293     	cbz	x19, 0x4101a64 <_ChromeMain+0x40fc7c8>
 4101a18: 39805e69     	ldrsb	x9, [x19, #0x17]
 4101a1c: aa1903f5     	mov	x21, x25
 4101a20: b6f80049     	tbz	x9, #0x3f, 0x4101a28 <_ChromeMain+0x40fc78c>
 4101a24: f9400669     	ldr	x9, [x19, #0x8]
 4101a28: aa1a03f9     	mov	x25, x26
 4101a2c: 52800008     	mov	w8, #0x0                ; =0
 4101a30: b004cc9a     	adrp	x26, 0xda92000 <dyld_stub_binder+0xda92000>
 4101a34: 9108675a     	add	x26, x26, #0x219
 4101a38: aa1c03f3     	mov	x19, x28
 4101a3c: b4000500     	cbz	x0, 0x4101adc <_ChromeMain+0x40fc840>
 4101a40: a94073f8     	ldp	x24, x28, [sp]
 4101a44: f9400bf4     	ldr	x20, [sp, #0x10]
 4101a48: b40002c9     	cbz	x9, 0x4101aa0 <_ChromeMain+0x40fc804>
 4101a4c: 39805c08     	ldrsb	x8, [x0, #0x17]
 4101a50: b6f80048     	tbz	x8, #0x3f, 0x4101a58 <_ChromeMain+0x40fc7bc>
 4101a54: f9400408     	ldr	x8, [x0, #0x8]
 4101a58: f100011f     	cmp	x8, #0x0
 4101a5c: 1a9f07e8     	cset	w8, ne
 4101a60: 14000010     	b	0x4101aa0 <_ChromeMain+0x40fc804>
 4101a64: 52800008     	mov	w8, #0x0                ; =0
 4101a68: aa1c03f3     	mov	x19, x28
 4101a6c: a94073f8     	ldp	x24, x28, [sp]
 4101a70: f9400bf4     	ldr	x20, [sp, #0x10]
 4101a74: 14000007     	b	0x4101a90 <_ChromeMain+0x40fc7f4>
 4101a78: f85803a0     	ldur	x0, [x29, #-0x80]
 4101a7c: f85903a8     	ldur	x8, [x29, #-0x70]
 4101a80: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4101a84: 96fc1d0d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4101a88: b5fffaf5     	cbnz	x21, 0x41019e4 <_ChromeMain+0x40fc748>
 4101a8c: 52800008     	mov	w8, #0x0                ; =0
 4101a90: aa1903f5     	mov	x21, x25
 4101a94: aa1a03f9     	mov	x25, x26
 4101a98: b004cc9a     	adrp	x26, 0xda92000 <dyld_stub_binder+0xda92000>
 4101a9c: 9108675a     	add	x26, x26, #0x219
 4101aa0: 3903a3e8     	strb	w8, [sp, #0xe8]
 4101aa4: aa1603e0     	mov	x0, x22
 4101aa8: aa1a03e1     	mov	x1, x26
 4101aac: 52800142     	mov	w2, #0xa                ; =10
 4101ab0: 977c9ff4     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4101ab4: b4ffda20     	cbz	x0, 0x41015f8 <_ChromeMain+0x40fc35c>
 4101ab8: 39405c09     	ldrb	w9, [x0, #0x17]
 4101abc: 13001d28     	sxtb	w8, w9
 4101ac0: f940040a     	ldr	x10, [x0, #0x8]
 4101ac4: 7100011f     	cmp	w8, #0x0
 4101ac8: 9a894149     	csel	x9, x10, x9, mi
 4101acc: f100193f     	cmp	x9, #0x6
 4101ad0: 54ffd7c0     	b.eq	0x41015c8 <_ChromeMain+0x40fc32c>
 4101ad4: 52800008     	mov	w8, #0x0                ; =0
 4101ad8: 17fffec7     	b	0x41015f4 <_ChromeMain+0x40fc358>
 4101adc: a94073f8     	ldp	x24, x28, [sp]
 4101ae0: f9400bf4     	ldr	x20, [sp, #0x10]
 4101ae4: 17ffffef     	b	0x4101aa0 <_ChromeMain+0x40fc804>
 4101ae8: b004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 4101aec: 91094021     	add	x1, x1, #0x250
 4101af0: d10383a0     	sub	x0, x29, #0xe0
 4101af4: 528001e2     	mov	w2, #0xf                ; =15
 4101af8: 97217352     	bl	0x95e840 <_ChromeMain+0x9595a4>
 4101afc: b40001e0     	cbz	x0, 0x4101b38 <_ChromeMain+0x40fc89c>
 4101b00: f9400408     	ldr	x8, [x0, #0x8]
 4101b04: d37be913     	lsl	x19, x8, #5
 4101b08: b4000193     	cbz	x19, 0x4101b38 <_ChromeMain+0x40fc89c>
 4101b0c: 910143f9     	add	x25, sp, #0x50
 4101b10: 9100633a     	add	x26, x25, #0x18
 4101b14: f940001b     	ldr	x27, [x0]
 4101b18: 9100e33c     	add	x28, x25, #0x38
 4101b1c: b004cc94     	adrp	x20, 0xda92000 <dyld_stub_binder+0xda92000>
 4101b20: 9108fa94     	add	x20, x20, #0x23e
 4101b24: b202e7f5     	mov	x21, #-0x3333333333333334 ; =-3689348814741910324
 4101b28: f29999b5     	movk	x21, #0xcccd
 4101b2c: b004cc96     	adrp	x22, 0xda92000 <dyld_stub_binder+0xda92000>
 4101b30: 910982d6     	add	x22, x22, #0x260
 4101b34: 14000024     	b	0x4101bc4 <_ChromeMain+0x40fc928>
 4101b38: b004cc81     	adrp	x1, 0xda92000 <dyld_stub_binder+0xda92000>
 4101b3c: 9109b021     	add	x1, x1, #0x26c
 4101b40: d10383a0     	sub	x0, x29, #0xe0
 4101b44: 528002c2     	mov	w2, #0x16               ; =22
 4101b48: 9721733e     	bl	0x95e840 <_ChromeMain+0x9595a4>
 4101b4c: b4002160     	cbz	x0, 0x4101f78 <_ChromeMain+0x40fccdc>
 4101b50: f9400408     	ldr	x8, [x0, #0x8]
 4101b54: d37be913     	lsl	x19, x8, #5
 4101b58: b4002113     	cbz	x19, 0x4101f78 <_ChromeMain+0x40fccdc>
 4101b5c: 910143f8     	add	x24, sp, #0x50
 4101b60: f9400019     	ldr	x25, [x0]
 4101b64: 9100831a     	add	x26, x24, #0x20
 4101b68: f004c354     	adrp	x20, 0xd96c000 <dyld_stub_binder+0xd96c000>
 4101b6c: 91287294     	add	x20, x20, #0xa1c
 4101b70: 5280071c     	mov	w28, #0x38              ; =56
 4101b74: d28db6fb     	mov	x27, #0x6db7            ; =28087
 4101b78: f2b6db7b     	movk	x27, #0xb6db, lsl #16
 4101b7c: f2db6dbb     	movk	x27, #0xdb6d, lsl #32
 4101b80: f2edb6db     	movk	x27, #0x6db6, lsl #48
 4101b84: b004cc95     	adrp	x21, 0xda92000 <dyld_stub_binder+0xda92000>
 4101b88: 910982b5     	add	x21, x21, #0x260
 4101b8c: 140000b9     	b	0x4101e70 <_ChromeMain+0x40fcbd4>
 4101b90: a9400b01     	ldp	x1, x2, [x24]
 4101b94: 91006320     	add	x0, x25, #0x18
 4101b98: 970e9bc7     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101b9c: 14000037     	b	0x4101c78 <_ChromeMain+0x40fc9dc>
 4101ba0: a9400b61     	ldp	x1, x2, [x27]
 4101ba4: 910143e0     	add	x0, sp, #0x50
 4101ba8: 970e9bc3     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101bac: 14000029     	b	0x4101c50 <_ChromeMain+0x40fc9b4>
 4101bb0: f9400708     	ldr	x8, [x24, #0x8]
 4101bb4: b50002e8     	cbnz	x8, 0x4101c10 <_ChromeMain+0x40fc974>
 4101bb8: 9100837b     	add	x27, x27, #0x20
 4101bbc: f1008273     	subs	x19, x19, #0x20
 4101bc0: 54fffbc0     	b.eq	0x4101b38 <_ChromeMain+0x40fc89c>
 4101bc4: 39805f68     	ldrsb	x8, [x27, #0x17]
 4101bc8: b6f80048     	tbz	x8, #0x3f, 0x4101bd0 <_ChromeMain+0x40fc934>
 4101bcc: f9400768     	ldr	x8, [x27, #0x8]
 4101bd0: f9400f77     	ldr	x23, [x27, #0x18]
 4101bd4: f100011f     	cmp	x8, #0x0
 4101bd8: fa401ae4     	ccmp	x23, #0x0, #0x4, ne
 4101bdc: 54fffee0     	b.eq	0x4101bb8 <_ChromeMain+0x40fc91c>
 4101be0: 394062e8     	ldrb	w8, [x23, #0x18]
 4101be4: 7100191f     	cmp	w8, #0x6
 4101be8: 54fffe81     	b.ne	0x4101bb8 <_ChromeMain+0x40fc91c>
 4101bec: aa1703e0     	mov	x0, x23
 4101bf0: aa1403e1     	mov	x1, x20
 4101bf4: 528000c2     	mov	w2, #0x6                ; =6
 4101bf8: 977c9fa2     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4101bfc: b4fffde0     	cbz	x0, 0x4101bb8 <_ChromeMain+0x40fc91c>
 4101c00: aa0003f8     	mov	x24, x0
 4101c04: 39805c08     	ldrsb	x8, [x0, #0x17]
 4101c08: b7fffd48     	tbnz	x8, #0x3f, 0x4101bb0 <_ChromeMain+0x40fc914>
 4101c0c: b4fffd68     	cbz	x8, 0x4101bb8 <_ChromeMain+0x40fc91c>
 4101c10: f90043ff     	str	xzr, [sp, #0x80]
 4101c14: 6f00e400     	movi.2d	v0, #0000000000000000
 4101c18: ad0303e0     	stp	q0, q0, [sp, #0x60]
 4101c1c: 3d8017e0     	str	q0, [sp, #0x50]
 4101c20: 12800008     	mov	w8, #-0x1               ; =-1
 4101c24: b90083e8     	str	w8, [sp, #0x80]
 4101c28: a900ff9f     	stp	xzr, xzr, [x28, #0x8]
 4101c2c: f900039f     	str	xzr, [x28]
 4101c30: eb19037f     	cmp	x27, x25
 4101c34: 540000e0     	b.eq	0x4101c50 <_ChromeMain+0x40fc9b4>
 4101c38: 39c05f68     	ldrsb	w8, [x27, #0x17]
 4101c3c: 37fffb28     	tbnz	w8, #0x1f, 0x4101ba0 <_ChromeMain+0x40fc904>
 4101c40: 3dc00360     	ldr	q0, [x27]
 4101c44: f9400b68     	ldr	x8, [x27, #0x10]
 4101c48: f90033e8     	str	x8, [sp, #0x60]
 4101c4c: 3d8017e0     	str	q0, [sp, #0x50]
 4101c50: eb18035f     	cmp	x26, x24
 4101c54: 54000120     	b.eq	0x4101c78 <_ChromeMain+0x40fc9dc>
 4101c58: 39c1ffe9     	ldrsb	w9, [sp, #0x7f]
 4101c5c: 39405f08     	ldrb	w8, [x24, #0x17]
 4101c60: 37f83b89     	tbnz	w9, #0x1f, 0x41023d0 <_ChromeMain+0x40fd134>
 4101c64: 373ff968     	tbnz	w8, #0x7, 0x4101b90 <_ChromeMain+0x40fc8f4>
 4101c68: 3dc00300     	ldr	q0, [x24]
 4101c6c: f9400b08     	ldr	x8, [x24, #0x10]
 4101c70: f9000b48     	str	x8, [x26, #0x10]
 4101c74: 3d800340     	str	q0, [x26]
 4101c78: aa1703e0     	mov	x0, x23
 4101c7c: f004c341     	adrp	x1, 0xd96c000 <dyld_stub_binder+0xd96c000>
 4101c80: 91287021     	add	x1, x1, #0xa1c
 4101c84: 52800122     	mov	w2, #0x9                ; =9
 4101c88: 972173fe     	bl	0x95ec80 <_ChromeMain+0x9599e4>
 4101c8c: f260001f     	tst	x0, #0x100000000
 4101c90: 5a9f1008     	csinv	w8, w0, wzr, ne
 4101c94: b90083e8     	str	w8, [sp, #0x80]
 4101c98: aa1703e0     	mov	x0, x23
 4101c9c: aa1603e1     	mov	x1, x22
 4101ca0: 52800162     	mov	w2, #0xb                ; =11
 4101ca4: 977c9f77     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4101ca8: eb00039f     	cmp	x28, x0
 4101cac: fa401804     	ccmp	x0, #0x0, #0x4, ne
 4101cb0: 54000120     	b.eq	0x4101cd4 <_ChromeMain+0x40fca38>
 4101cb4: 39c27fe9     	ldrsb	w9, [sp, #0x9f]
 4101cb8: 39405c08     	ldrb	w8, [x0, #0x17]
 4101cbc: 37f839a9     	tbnz	w9, #0x1f, 0x41023f0 <_ChromeMain+0x40fd154>
 4101cc0: 37380748     	tbnz	w8, #0x7, 0x4101da8 <_ChromeMain+0x40fcb0c>
 4101cc4: 3dc00000     	ldr	q0, [x0]
 4101cc8: f9400808     	ldr	x8, [x0, #0x10]
 4101ccc: f9000b88     	str	x8, [x28, #0x10]
 4101cd0: 3d800380     	str	q0, [x28]
 4101cd4: a95c27e8     	ldp	x8, x9, [sp, #0x1c0]
 4101cd8: eb09011f     	cmp	x8, x9
 4101cdc: 540046a0     	b.eq	0x41025b0 <_ChromeMain+0x40fd314>
 4101ce0: f940dfe9     	ldr	x9, [sp, #0x1b8]
 4101ce4: 52800a0a     	mov	w10, #0x50              ; =80
 4101ce8: 9b0a2508     	madd	x8, x8, x10, x9
 4101cec: b4ffc448     	cbz	x8, 0x4101574 <_ChromeMain+0x40fc2d8>
 4101cf0: 3dc017e0     	ldr	q0, [sp, #0x50]
 4101cf4: f94033e9     	ldr	x9, [sp, #0x60]
 4101cf8: f9000909     	str	x9, [x8, #0x10]
 4101cfc: 3d800100     	str	q0, [x8]
 4101d00: a905ffff     	stp	xzr, xzr, [sp, #0x58]
 4101d04: f9002bff     	str	xzr, [sp, #0x50]
 4101d08: 3dc00340     	ldr	q0, [x26]
 4101d0c: f9400b49     	ldr	x9, [x26, #0x10]
 4101d10: f9001509     	str	x9, [x8, #0x28]
 4101d14: 3c818100     	stur	q0, [x8, #0x18]
 4101d18: a900ff5f     	stp	xzr, xzr, [x26, #0x8]
 4101d1c: f900035f     	str	xzr, [x26]
 4101d20: b94083e9     	ldr	w9, [sp, #0x80]
 4101d24: b9003109     	str	w9, [x8, #0x30]
 4101d28: 3dc00380     	ldr	q0, [x28]
 4101d2c: f9400b89     	ldr	x9, [x28, #0x10]
 4101d30: f9002509     	str	x9, [x8, #0x48]
 4101d34: 3c838100     	stur	q0, [x8, #0x38]
 4101d38: a900ff9f     	stp	xzr, xzr, [x28, #0x8]
 4101d3c: f900039f     	str	xzr, [x28]
 4101d40: 91014100     	add	x0, x8, #0x50
 4101d44: f940dfe8     	ldr	x8, [sp, #0x1b8]
 4101d48: eb080008     	subs	x8, x0, x8
 4101d4c: 9344fd08     	asr	x8, x8, #4
 4101d50: 9b157d08     	mul	x8, x8, x21
 4101d54: f900e3e8     	str	x8, [sp, #0x1c0]
 4101d58: 54ffc0e0     	b.eq	0x4101574 <_ChromeMain+0x40fc2d8>
 4101d5c: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 4101d60: 36f800a8     	tbz	w8, #0x1f, 0x4101d74 <_ChromeMain+0x40fcad8>
 4101d64: f94047e0     	ldr	x0, [sp, #0x88]
 4101d68: f9404fe8     	ldr	x8, [sp, #0x98]
 4101d6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4101d70: 96fc1c52     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4101d74: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 4101d78: 36f800a8     	tbz	w8, #0x1f, 0x4101d8c <_ChromeMain+0x40fcaf0>
 4101d7c: f94037e0     	ldr	x0, [sp, #0x68]
 4101d80: f9403fe8     	ldr	x8, [sp, #0x78]
 4101d84: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4101d88: 96fc1c4c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4101d8c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4101d90: 36fff148     	tbz	w8, #0x1f, 0x4101bb8 <_ChromeMain+0x40fc91c>
 4101d94: f9402be0     	ldr	x0, [sp, #0x50]
 4101d98: f94033e8     	ldr	x8, [sp, #0x60]
 4101d9c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4101da0: 96fc1c46     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4101da4: 17ffff85     	b	0x4101bb8 <_ChromeMain+0x40fc91c>
 4101da8: a9400801     	ldp	x1, x2, [x0]
 4101dac: 9100e320     	add	x0, x25, #0x38
 4101db0: 970e9b41     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101db4: 17ffffc8     	b	0x4101cd4 <_ChromeMain+0x40fca38>
 4101db8: 3dc00000     	ldr	q0, [x0]
 4101dbc: f9400808     	ldr	x8, [x0, #0x10]
 4101dc0: f9000b48     	str	x8, [x26, #0x10]
 4101dc4: 3d800340     	str	q0, [x26]
 4101dc8: a95da7e8     	ldp	x8, x9, [sp, #0x1d8]
 4101dcc: eb09011f     	cmp	x8, x9
 4101dd0: 54004020     	b.eq	0x41025d4 <_ChromeMain+0x40fd338>
 4101dd4: f940ebe9     	ldr	x9, [sp, #0x1d0]
 4101dd8: 9b1c2508     	madd	x8, x8, x28, x9
 4101ddc: b4ffbcc8     	cbz	x8, 0x4101574 <_ChromeMain+0x40fc2d8>
 4101de0: 3dc017e0     	ldr	q0, [sp, #0x50]
 4101de4: f94033e9     	ldr	x9, [sp, #0x60]
 4101de8: f9000909     	str	x9, [x8, #0x10]
 4101dec: 3d800100     	str	q0, [x8]
 4101df0: a905ffff     	stp	xzr, xzr, [sp, #0x58]
 4101df4: f9002bff     	str	xzr, [sp, #0x50]
 4101df8: b9406be9     	ldr	w9, [sp, #0x68]
 4101dfc: b9001909     	str	w9, [x8, #0x18]
 4101e00: 3dc00340     	ldr	q0, [x26]
 4101e04: f9400b49     	ldr	x9, [x26, #0x10]
 4101e08: f9001909     	str	x9, [x8, #0x30]
 4101e0c: 3d800900     	str	q0, [x8, #0x20]
 4101e10: a900ff5f     	stp	xzr, xzr, [x26, #0x8]
 4101e14: f900035f     	str	xzr, [x26]
 4101e18: 9100e100     	add	x0, x8, #0x38
 4101e1c: f940ebe8     	ldr	x8, [sp, #0x1d0]
 4101e20: eb080008     	subs	x8, x0, x8
 4101e24: 9343fd08     	asr	x8, x8, #3
 4101e28: 9b1b7d08     	mul	x8, x8, x27
 4101e2c: f900efe8     	str	x8, [sp, #0x1d8]
 4101e30: 54ffba20     	b.eq	0x4101574 <_ChromeMain+0x40fc2d8>
 4101e34: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4101e38: 36f800a8     	tbz	w8, #0x1f, 0x4101e4c <_ChromeMain+0x40fcbb0>
 4101e3c: f9403be0     	ldr	x0, [sp, #0x70]
 4101e40: f94043e8     	ldr	x8, [sp, #0x80]
 4101e44: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4101e48: 96fc1c1c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4101e4c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4101e50: 36f800a8     	tbz	w8, #0x1f, 0x4101e64 <_ChromeMain+0x40fcbc8>
 4101e54: f9402be0     	ldr	x0, [sp, #0x50]
 4101e58: f94033e8     	ldr	x8, [sp, #0x60]
 4101e5c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4101e60: 96fc1c16     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4101e64: 91008339     	add	x25, x25, #0x20
 4101e68: f1008273     	subs	x19, x19, #0x20
 4101e6c: 54000860     	b.eq	0x4101f78 <_ChromeMain+0x40fccdc>
 4101e70: 39805f28     	ldrsb	x8, [x25, #0x17]
 4101e74: b6f80048     	tbz	x8, #0x3f, 0x4101e7c <_ChromeMain+0x40fcbe0>
 4101e78: f9400728     	ldr	x8, [x25, #0x8]
 4101e7c: f9400f36     	ldr	x22, [x25, #0x18]
 4101e80: f100011f     	cmp	x8, #0x0
 4101e84: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
 4101e88: 54fffee0     	b.eq	0x4101e64 <_ChromeMain+0x40fcbc8>
 4101e8c: 394062c8     	ldrb	w8, [x22, #0x18]
 4101e90: 7100191f     	cmp	w8, #0x6
 4101e94: 54fffe81     	b.ne	0x4101e64 <_ChromeMain+0x40fcbc8>
 4101e98: aa1603e0     	mov	x0, x22
 4101e9c: aa1403e1     	mov	x1, x20
 4101ea0: 52800122     	mov	w2, #0x9                ; =9
 4101ea4: 97217377     	bl	0x95ec80 <_ChromeMain+0x9599e4>
 4101ea8: b607fde0     	tbz	x0, #0x20, 0x4101e64 <_ChromeMain+0x40fcbc8>
 4101eac: aa0003f7     	mov	x23, x0
 4101eb0: 37fffdb7     	tbnz	w23, #0x1f, 0x4101e64 <_ChromeMain+0x40fcbc8>
 4101eb4: 6f00e400     	movi.2d	v0, #0000000000000000
 4101eb8: ad0283e0     	stp	q0, q0, [sp, #0x50]
 4101ebc: 12800008     	mov	w8, #-0x1               ; =-1
 4101ec0: b9006be8     	str	w8, [sp, #0x68]
 4101ec4: a900ff5f     	stp	xzr, xzr, [x26, #0x8]
 4101ec8: f900035f     	str	xzr, [x26]
 4101ecc: eb18033f     	cmp	x25, x24
 4101ed0: 540000e0     	b.eq	0x4101eec <_ChromeMain+0x40fcc50>
 4101ed4: 39c05f28     	ldrsb	w8, [x25, #0x17]
 4101ed8: 37f802a8     	tbnz	w8, #0x1f, 0x4101f2c <_ChromeMain+0x40fcc90>
 4101edc: 3dc00320     	ldr	q0, [x25]
 4101ee0: f9400b28     	ldr	x8, [x25, #0x10]
 4101ee4: f90033e8     	str	x8, [sp, #0x60]
 4101ee8: 3d8017e0     	str	q0, [sp, #0x50]
 4101eec: b9006bf7     	str	w23, [sp, #0x68]
 4101ef0: aa1603e0     	mov	x0, x22
 4101ef4: aa1503e1     	mov	x1, x21
 4101ef8: 52800162     	mov	w2, #0xb                ; =11
 4101efc: 977c9ee1     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4101f00: eb00035f     	cmp	x26, x0
 4101f04: fa401804     	ccmp	x0, #0x0, #0x4, ne
 4101f08: 54fff600     	b.eq	0x4101dc8 <_ChromeMain+0x40fcb2c>
 4101f0c: 39c21fe9     	ldrsb	w9, [sp, #0x87]
 4101f10: 39405c08     	ldrb	w8, [x0, #0x17]
 4101f14: 37f82969     	tbnz	w9, #0x1f, 0x4102440 <_ChromeMain+0x40fd1a4>
 4101f18: 363ff508     	tbz	w8, #0x7, 0x4101db8 <_ChromeMain+0x40fcb1c>
 4101f1c: a9400801     	ldp	x1, x2, [x0]
 4101f20: 91008300     	add	x0, x24, #0x20
 4101f24: 970e9ae4     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101f28: 17ffffa8     	b	0x4101dc8 <_ChromeMain+0x40fcb2c>
 4101f2c: a9400b21     	ldp	x1, x2, [x25]
 4101f30: 910143e0     	add	x0, sp, #0x50
 4101f34: 970e9ae0     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4101f38: 17ffffed     	b	0x4101eec <_ChromeMain+0x40fcc50>
 4101f3c: b94187ea     	ldr	w10, [sp, #0x184]
 4101f40: 37f802ca     	tbnz	w10, #0x1f, 0x4101f98 <_ChromeMain+0x40fccfc>
 4101f44: f940cbe9     	ldr	x9, [sp, #0x190]
 4101f48: 8b090529     	add	x9, x9, x9, lsl #1
 4101f4c: d37ae52b     	lsl	x11, x9, #6
 4101f50: b400024b     	cbz	x11, 0x4101f98 <_ChromeMain+0x40fccfc>
 4101f54: f940c7e9     	ldr	x9, [sp, #0x188]
 4101f58: 91014129     	add	x9, x9, #0x50
 4101f5c: b85b012c     	ldur	w12, [x9, #-0x50]
 4101f60: 6b0a019f     	cmp	w12, w10
 4101f64: 54001120     	b.eq	0x4102188 <_ChromeMain+0x40fceec>
 4101f68: 91030129     	add	x9, x9, #0xc0
 4101f6c: f103016b     	subs	x11, x11, #0xc0
 4101f70: 54ffff61     	b.ne	0x4101f5c <_ChromeMain+0x40fccc0>
 4101f74: 14000009     	b	0x4101f98 <_ChromeMain+0x40fccfc>
 4101f78: 39457fe9     	ldrb	w9, [sp, #0x15f]
 4101f7c: 13001d28     	sxtb	w8, w9
 4101f80: f940abea     	ldr	x10, [sp, #0x150]
 4101f84: 7100011f     	cmp	w8, #0x0
 4101f88: 9a894149     	csel	x9, x10, x9, mi
 4101f8c: f94017f8     	ldr	x24, [sp, #0x28]
 4101f90: 910483f9     	add	x25, sp, #0x120
 4101f94: b4fffd49     	cbz	x9, 0x4101f3c <_ChromeMain+0x40fcca0>
 4101f98: 39457fe8     	ldrb	w8, [sp, #0x15f]
 4101f9c: f940abe9     	ldr	x9, [sp, #0x150]
 4101fa0: 7219011f     	tst	w8, #0x80
 4101fa4: 9a881128     	csel	x8, x9, x8, ne
 4101fa8: b4000068     	cbz	x8, 0x4101fb4 <_ChromeMain+0x40fcd18>
 4101fac: 52800028     	mov	w8, #0x1                ; =1
 4101fb0: 390583e8     	strb	w8, [sp, #0x160]
 4101fb4: a95a23f3     	ldp	x19, x8, [sp, #0x1a0]
 4101fb8: 8b080509     	add	x9, x8, x8, lsl #1
 4101fbc: d37be92a     	lsl	x10, x9, #5
 4101fc0: b4ff6faa     	cbz	x10, 0x4100db4 <_ChromeMain+0x40fbb18>
 4101fc4: 8b091674     	add	x20, x19, x9, lsl #5
 4101fc8: 52800035     	mov	w21, #0x1               ; =1
 4101fcc: 14000013     	b	0x4102018 <_ChromeMain+0x40fcd7c>
 4101fd0: a95a23f3     	ldp	x19, x8, [sp, #0x1a0]
 4101fd4: 8b08050a     	add	x10, x8, x8, lsl #1
 4101fd8: d37be949     	lsl	x9, x10, #5
 4101fdc: b4ff6ec9     	cbz	x9, 0x4100db4 <_ChromeMain+0x40fbb18>
 4101fe0: d2800015     	mov	x21, #0x0               ; =0
 4101fe4: 8b0a1674     	add	x20, x19, x10, lsl #5
 4101fe8: 8b15026a     	add	x10, x19, x21
 4101fec: b940594a     	ldr	w10, [x10, #0x58]
 4101ff0: 3400076a     	cbz	w10, 0x41020dc <_ChromeMain+0x40fce40>
 4101ff4: 910182b5     	add	x21, x21, #0x60
 4101ff8: eb15013f     	cmp	x9, x21
 4101ffc: 54ffff61     	b.ne	0x4101fe8 <_ChromeMain+0x40fcd4c>
 4102000: 17fffb6e     	b	0x4100db8 <_ChromeMain+0x40fbb1c>
 4102004: b4000048     	cbz	x8, 0x410200c <_ChromeMain+0x40fcd70>
 4102008: 3900e275     	strb	w21, [x19, #0x38]
 410200c: 91018273     	add	x19, x19, #0x60
 4102010: eb14027f     	cmp	x19, x20
 4102014: 54fffde0     	b.eq	0x4101fd0 <_ChromeMain+0x40fcd34>
 4102018: 3940de69     	ldrb	w9, [x19, #0x37]
 410201c: 13001d28     	sxtb	w8, w9
 4102020: f940166a     	ldr	x10, [x19, #0x28]
 4102024: 7100011f     	cmp	w8, #0x0
 4102028: 9a894149     	csel	x9, x10, x9, mi
 410202c: b40000c9     	cbz	x9, 0x4102044 <_ChromeMain+0x40fcda8>
 4102030: 3980de68     	ldrsb	x8, [x19, #0x37]
 4102034: b6fffe88     	tbz	x8, #0x3f, 0x4102004 <_ChromeMain+0x40fcd68>
 4102038: f9401668     	ldr	x8, [x19, #0x28]
 410203c: b5fffe68     	cbnz	x8, 0x4102008 <_ChromeMain+0x40fcd6c>
 4102040: 17fffff3     	b	0x410200c <_ChromeMain+0x40fcd70>
 4102044: b9405e6b     	ldr	w11, [x19, #0x5c]
 4102048: 37ffff4b     	tbnz	w11, #0x1f, 0x4102030 <_ChromeMain+0x40fcd94>
 410204c: f940cbe9     	ldr	x9, [sp, #0x190]
 4102050: 8b090529     	add	x9, x9, x9, lsl #1
 4102054: d37ae52c     	lsl	x12, x9, #6
 4102058: b4fffecc     	cbz	x12, 0x4102030 <_ChromeMain+0x40fcd94>
 410205c: 9100826a     	add	x10, x19, #0x20
 4102060: f940c7e9     	ldr	x9, [sp, #0x188]
 4102064: 91014129     	add	x9, x9, #0x50
 4102068: b85b012d     	ldur	w13, [x9, #-0x50]
 410206c: 6b0b01bf     	cmp	w13, w11
 4102070: 540000a0     	b.eq	0x4102084 <_ChromeMain+0x40fcde8>
 4102074: 91030129     	add	x9, x9, #0xc0
 4102078: f103018c     	subs	x12, x12, #0xc0
 410207c: 54ffff61     	b.ne	0x4102068 <_ChromeMain+0x40fcdcc>
 4102080: 17ffffec     	b	0x4102030 <_ChromeMain+0x40fcd94>
 4102084: f101413f     	cmp	x9, #0x50
 4102088: 54fffd40     	b.eq	0x4102030 <_ChromeMain+0x40fcd94>
 410208c: 39805d2b     	ldrsb	x11, [x9, #0x17]
 4102090: b7f8018b     	tbnz	x11, #0x3f, 0x41020c0 <_ChromeMain+0x40fce24>
 4102094: aa0b03ec     	mov	x12, x11
 4102098: b4fffccc     	cbz	x12, 0x4102030 <_ChromeMain+0x40fcd94>
 410209c: eb0a013f     	cmp	x9, x10
 41020a0: 54fffc80     	b.eq	0x4102030 <_ChromeMain+0x40fcd94>
 41020a4: 37f81c08     	tbnz	w8, #0x1f, 0x4102424 <_ChromeMain+0x40fd188>
 41020a8: 37f8012b     	tbnz	w11, #0x1f, 0x41020cc <_ChromeMain+0x40fce30>
 41020ac: 3dc00120     	ldr	q0, [x9]
 41020b0: f9400928     	ldr	x8, [x9, #0x10]
 41020b4: f9000948     	str	x8, [x10, #0x10]
 41020b8: 3d800140     	str	q0, [x10]
 41020bc: 17ffffdd     	b	0x4102030 <_ChromeMain+0x40fcd94>
 41020c0: f940052c     	ldr	x12, [x9, #0x8]
 41020c4: b4fffb6c     	cbz	x12, 0x4102030 <_ChromeMain+0x40fcd94>
 41020c8: 17fffff5     	b	0x410209c <_ChromeMain+0x40fce00>
 41020cc: a9400921     	ldp	x1, x2, [x9]
 41020d0: 91008260     	add	x0, x19, #0x20
 41020d4: 970e9a78     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 41020d8: 17ffffd6     	b	0x4102030 <_ChromeMain+0x40fcd94>
 41020dc: ab150274     	adds	x20, x19, x21
 41020e0: 54ff6700     	b.eq	0x4100dc0 <_ChromeMain+0x40fbb24>
 41020e4: 3944a3f6     	ldrb	w22, [sp, #0x128]
 41020e8: 8b150277     	add	x23, x19, x21
 41020ec: 8b150268     	add	x8, x19, x21
 41020f0: 78408509     	ldrh	w9, [x8], #0x8
 41020f4: 790253e9     	strh	w9, [sp, #0x128]
 41020f8: 91004329     	add	x9, x25, #0x10
 41020fc: eb09011f     	cmp	x8, x9
 4102100: 54000140     	b.eq	0x4102128 <_ChromeMain+0x40fce8c>
 4102104: 39c51fea     	ldrsb	w10, [sp, #0x147]
 4102108: 39407ee9     	ldrb	w9, [x23, #0x1f]
 410210c: 37f826ea     	tbnz	w10, #0x1f, 0x41025e8 <_ChromeMain+0x40fd34c>
 4102110: 373805e9     	tbnz	w9, #0x7, 0x41021cc <_ChromeMain+0x40fcf30>
 4102114: 3dc00100     	ldr	q0, [x8]
 4102118: f9400908     	ldr	x8, [x8, #0x10]
 410211c: 91004329     	add	x9, x25, #0x10
 4102120: f9000928     	str	x8, [x9, #0x10]
 4102124: 3d800120     	str	q0, [x9]
 4102128: 910082e8     	add	x8, x23, #0x20
 410212c: 9100a329     	add	x9, x25, #0x28
 4102130: eb09011f     	cmp	x8, x9
 4102134: 54000160     	b.eq	0x4102160 <_ChromeMain+0x40fcec4>
 4102138: 39c57feb     	ldrsb	w11, [sp, #0x15f]
 410213c: 8b15026a     	add	x10, x19, x21
 4102140: 3940dd49     	ldrb	w9, [x10, #0x37]
 4102144: 37f8266b     	tbnz	w11, #0x1f, 0x4102610 <_ChromeMain+0x40fd374>
 4102148: 37380529     	tbnz	w9, #0x7, 0x41021ec <_ChromeMain+0x40fcf50>
 410214c: 3dc00100     	ldr	q0, [x8]
 4102150: f9400908     	ldr	x8, [x8, #0x10]
 4102154: 9100a329     	add	x9, x25, #0x28
 4102158: f9000928     	str	x8, [x9, #0x10]
 410215c: 3d800120     	str	q0, [x9]
 4102160: 36000076     	tbz	w22, #0x0, 0x410216c <_ChromeMain+0x40fced0>
 4102164: 52800036     	mov	w22, #0x1               ; =1
 4102168: 14000002     	b	0x4102170 <_ChromeMain+0x40fced4>
 410216c: 52800016     	mov	w22, #0x0               ; =0
 4102170: 52800017     	mov	w23, #0x0               ; =0
 4102174: 8b150268     	add	x8, x19, x21
 4102178: 79407109     	ldrh	w9, [x8, #0x38]
 410217c: 7902c3e9     	strh	w9, [sp, #0x160]
 4102180: 91010108     	add	x8, x8, #0x40
 4102184: 17fffb14     	b	0x4100dd4 <_ChromeMain+0x40fbb38>
 4102188: f101413f     	cmp	x9, #0x50
 410218c: 54fff060     	b.eq	0x4101f98 <_ChromeMain+0x40fccfc>
 4102190: 39805d2a     	ldrsb	x10, [x9, #0x17]
 4102194: b7f8028a     	tbnz	x10, #0x3f, 0x41021e4 <_ChromeMain+0x40fcf48>
 4102198: aa0a03eb     	mov	x11, x10
 410219c: 9100a32c     	add	x12, x25, #0x28
 41021a0: eb0c013f     	cmp	x9, x12
 41021a4: 54ffefa0     	b.eq	0x4101f98 <_ChromeMain+0x40fccfc>
 41021a8: b4ffef8b     	cbz	x11, 0x4101f98 <_ChromeMain+0x40fccfc>
 41021ac: 37f82468     	tbnz	w8, #0x1f, 0x4102638 <_ChromeMain+0x40fd39c>
 41021b0: 37f80aea     	tbnz	w10, #0x1f, 0x410230c <_ChromeMain+0x40fd070>
 41021b4: 3dc00120     	ldr	q0, [x9]
 41021b8: f9400928     	ldr	x8, [x9, #0x10]
 41021bc: 9100a329     	add	x9, x25, #0x28
 41021c0: f9000928     	str	x8, [x9, #0x10]
 41021c4: 3d800120     	str	q0, [x9]
 41021c8: 17ffff74     	b	0x4101f98 <_ChromeMain+0x40fccfc>
 41021cc: f9400101     	ldr	x1, [x8]
 41021d0: 8b150268     	add	x8, x19, x21
 41021d4: f9400902     	ldr	x2, [x8, #0x10]
 41021d8: 91004320     	add	x0, x25, #0x10
 41021dc: 970e9a36     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 41021e0: 17ffffd2     	b	0x4102128 <_ChromeMain+0x40fce8c>
 41021e4: f940052b     	ldr	x11, [x9, #0x8]
 41021e8: 17ffffed     	b	0x410219c <_ChromeMain+0x40fcf00>
 41021ec: f9400101     	ldr	x1, [x8]
 41021f0: 8b150268     	add	x8, x19, x21
 41021f4: f9401502     	ldr	x2, [x8, #0x28]
 41021f8: 9100a320     	add	x0, x25, #0x28
 41021fc: 970e9a2e     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4102200: 17ffffd8     	b	0x4102160 <_ChromeMain+0x40fcec4>
 4102204: f9409be0     	ldr	x0, [sp, #0x130]
 4102208: f940a3e8     	ldr	x8, [sp, #0x140]
 410220c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4102210: 96fc1b2a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4102214: 17fffb95     	b	0x4101068 <_ChromeMain+0x40fbdcc>
 4102218: f940a7e0     	ldr	x0, [sp, #0x148]
 410221c: f940afe8     	ldr	x8, [sp, #0x158]
 4102220: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4102224: 96fc1b25     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4102228: 17fffb99     	b	0x410108c <_ChromeMain+0x40fbdf0>
 410222c: 13001d09     	sxtb	w9, w8
 4102230: 7100013f     	cmp	w9, #0x0
 4102234: a9402809     	ldp	x9, x10, [x0]
 4102238: 9a804121     	csel	x1, x9, x0, mi
 410223c: 9a884142     	csel	x2, x10, x8, mi
 4102240: aa1403e0     	mov	x0, x20
 4102244: 970e9a6f     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4102248: 17fffcfc     	b	0x4101638 <_ChromeMain+0x40fc39c>
 410224c: 13001d09     	sxtb	w9, w8
 4102250: 7100013f     	cmp	w9, #0x0
 4102254: a9402809     	ldp	x9, x10, [x0]
 4102258: 9a804121     	csel	x1, x9, x0, mi
 410225c: 9a884142     	csel	x2, x10, x8, mi
 4102260: f94027e0     	ldr	x0, [sp, #0x48]
 4102264: 970e9a67     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4102268: 17fffd06     	b	0x4101680 <_ChromeMain+0x40fc3e4>
 410226c: 13001d09     	sxtb	w9, w8
 4102270: 7100013f     	cmp	w9, #0x0
 4102274: a9402809     	ldp	x9, x10, [x0]
 4102278: 9a804121     	csel	x1, x9, x0, mi
 410227c: 9a884142     	csel	x2, x10, x8, mi
 4102280: f94023e0     	ldr	x0, [sp, #0x40]
 4102284: 970e9a5f     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4102288: 17fffd10     	b	0x41016c8 <_ChromeMain+0x40fc42c>
 410228c: 13001d09     	sxtb	w9, w8
 4102290: 7100013f     	cmp	w9, #0x0
 4102294: a9402809     	ldp	x9, x10, [x0]
 4102298: 9a804121     	csel	x1, x9, x0, mi
 410229c: 9a884142     	csel	x2, x10, x8, mi
 41022a0: aa1303e0     	mov	x0, x19
 41022a4: 970e9a57     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 41022a8: 17fffd18     	b	0x4101708 <_ChromeMain+0x40fc46c>
 41022ac: 13001d09     	sxtb	w9, w8
 41022b0: 7100013f     	cmp	w9, #0x0
 41022b4: a9402809     	ldp	x9, x10, [x0]
 41022b8: 9a804121     	csel	x1, x9, x0, mi
 41022bc: 9a884142     	csel	x2, x10, x8, mi
 41022c0: aa1803e0     	mov	x0, x24
 41022c4: 970e9a4f     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 41022c8: 17fffd20     	b	0x4101748 <_ChromeMain+0x40fc4ac>
 41022cc: 13001d09     	sxtb	w9, w8
 41022d0: 7100013f     	cmp	w9, #0x0
 41022d4: a9402809     	ldp	x9, x10, [x0]
 41022d8: 9a804121     	csel	x1, x9, x0, mi
 41022dc: 9a884142     	csel	x2, x10, x8, mi
 41022e0: aa1b03e0     	mov	x0, x27
 41022e4: 970e9a47     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 41022e8: 17fffd28     	b	0x4101788 <_ChromeMain+0x40fc4ec>
 41022ec: 13001d09     	sxtb	w9, w8
 41022f0: 7100013f     	cmp	w9, #0x0
 41022f4: a9402809     	ldp	x9, x10, [x0]
 41022f8: 9a804121     	csel	x1, x9, x0, mi
 41022fc: 9a884142     	csel	x2, x10, x8, mi
 4102300: aa1c03e0     	mov	x0, x28
 4102304: 970e9a3f     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4102308: 17fffd30     	b	0x41017c8 <_ChromeMain+0x40fc52c>
 410230c: a9400921     	ldp	x1, x2, [x9]
 4102310: 9100a320     	add	x0, x25, #0x28
 4102314: 970e99e8     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4102318: 17ffff20     	b	0x4101f98 <_ChromeMain+0x40fccfc>
 410231c: 13001d09     	sxtb	w9, w8
 4102320: 7100013f     	cmp	w9, #0x0
 4102324: a9472be9     	ldp	x9, x10, [sp, #0x70]
 4102328: 9a974121     	csel	x1, x9, x23, mi
 410232c: 9a884142     	csel	x2, x10, x8, mi
 4102330: 9100a280     	add	x0, x20, #0x28
 4102334: 970e9a33     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4102338: 17fffc51     	b	0x410147c <_ChromeMain+0x40fc1e0>
 410233c: 13001d09     	sxtb	w9, w8
 4102340: 7100013f     	cmp	w9, #0x0
 4102344: a9492be9     	ldp	x9, x10, [sp, #0x90]
 4102348: 9a984121     	csel	x1, x9, x24, mi
 410234c: 9a884142     	csel	x2, x10, x8, mi
 4102350: 91012280     	add	x0, x20, #0x48
 4102354: 970e9a2b     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4102358: 17fffc54     	b	0x41014a8 <_ChromeMain+0x40fc20c>
 410235c: 13001d09     	sxtb	w9, w8
 4102360: 7100013f     	cmp	w9, #0x0
 4102364: a945abe9     	ldp	x9, x10, [sp, #0x58]
 4102368: 9a964121     	csel	x1, x9, x22, mi
 410236c: 9a884142     	csel	x2, x10, x8, mi
 4102370: 910483f4     	add	x20, sp, #0x120
 4102374: 91004280     	add	x0, x20, #0x10
 4102378: 970e9a22     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 410237c: 17fffc37     	b	0x4101458 <_ChromeMain+0x40fc1bc>
 4102380: f940b7e0     	ldr	x0, [sp, #0x168]
 4102384: f940bfe8     	ldr	x8, [sp, #0x178]
 4102388: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 410238c: 96fc1acb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4102390: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4102394: 3cc40260     	ldur	q0, [x19, #0x40]
 4102398: 9101232b     	add	x11, x25, #0x48
 410239c: 3d800160     	str	q0, [x11]
 41023a0: f8450269     	ldur	x9, [x19, #0x50]
 41023a4: f9000969     	str	x9, [x11, #0x10]
 41023a8: 39029fff     	strb	wzr, [sp, #0xa7]
 41023ac: 390243ff     	strb	wzr, [sp, #0x90]
 41023b0: f94057e9     	ldr	x9, [sp, #0xa8]
 41023b4: f900c3e9     	str	x9, [sp, #0x180]
 41023b8: 36ff6948     	tbz	w8, #0x1f, 0x41010e0 <_ChromeMain+0x40fbe44>
 41023bc: f9403be0     	ldr	x0, [sp, #0x70]
 41023c0: f94043e8     	ldr	x8, [sp, #0x80]
 41023c4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41023c8: 96fc1abc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41023cc: 17fffb45     	b	0x41010e0 <_ChromeMain+0x40fbe44>
 41023d0: 13001d09     	sxtb	w9, w8
 41023d4: 7100013f     	cmp	w9, #0x0
 41023d8: a9402b09     	ldp	x9, x10, [x24]
 41023dc: 9a984121     	csel	x1, x9, x24, mi
 41023e0: 9a884142     	csel	x2, x10, x8, mi
 41023e4: 91006320     	add	x0, x25, #0x18
 41023e8: 970e9a06     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 41023ec: 17fffe23     	b	0x4101c78 <_ChromeMain+0x40fc9dc>
 41023f0: 13001d09     	sxtb	w9, w8
 41023f4: 7100013f     	cmp	w9, #0x0
 41023f8: a9402809     	ldp	x9, x10, [x0]
 41023fc: 9a804121     	csel	x1, x9, x0, mi
 4102400: 9a884142     	csel	x2, x10, x8, mi
 4102404: 9100e320     	add	x0, x25, #0x38
 4102408: 970e99fe     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 410240c: 17fffe32     	b	0x4101cd4 <_ChromeMain+0x40fca38>
 4102410: 910483e8     	add	x8, sp, #0x120
 4102414: 9101a100     	add	x0, x8, #0x68
 4102418: 910143e1     	add	x1, sp, #0x50
 410241c: 94000225     	bl	0x4102cb0 <_ChromeMain+0x40fda14>
 4102420: 17fffd23     	b	0x41018ac <_ChromeMain+0x40fc610>
 4102424: 7100017f     	cmp	w11, #0x0
 4102428: a9402928     	ldp	x8, x10, [x9]
 410242c: 9a894101     	csel	x1, x8, x9, mi
 4102430: 9a8b4142     	csel	x2, x10, x11, mi
 4102434: 91008260     	add	x0, x19, #0x20
 4102438: 970e99f2     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 410243c: 17fffefd     	b	0x4102030 <_ChromeMain+0x40fcd94>
 4102440: 13001d09     	sxtb	w9, w8
 4102444: 7100013f     	cmp	w9, #0x0
 4102448: a9402809     	ldp	x9, x10, [x0]
 410244c: 9a804121     	csel	x1, x9, x0, mi
 4102450: 9a884142     	csel	x2, x10, x8, mi
 4102454: 91008300     	add	x0, x24, #0x20
 4102458: 970e99ea     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 410245c: 17fffe5b     	b	0x4101dc8 <_ChromeMain+0x40fcb2c>
 4102460: 13001d2b     	sxtb	w11, w9
 4102464: f940010c     	ldr	x12, [x8]
 4102468: 9101414a     	add	x10, x10, #0x50
 410246c: 710002df     	cmp	w22, #0x0
 4102470: 5280090d     	mov	w13, #0x48              ; =72
 4102474: 9a8d114a     	csel	x10, x10, x13, ne
 4102478: 9101228d     	add	x13, x20, #0x48
 410247c: 710002ff     	cmp	w23, #0x0
 4102480: 9a8d114a     	csel	x10, x10, x13, ne
 4102484: 7100017f     	cmp	w11, #0x0
 4102488: 9a884181     	csel	x1, x12, x8, mi
 410248c: f9400148     	ldr	x8, [x10]
 4102490: 9a894102     	csel	x2, x8, x9, mi
 4102494: f9401be0     	ldr	x0, [sp, #0x30]
 4102498: 970e99da     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 410249c: 17fffa63     	b	0x4100e28 <_ChromeMain+0x40fbb8c>
 41024a0: d2800000     	mov	x0, #0x0                ; =0
 41024a4: 14000018     	b	0x4102504 <_ChromeMain+0x40fd268>
 41024a8: 91000688     	add	x8, x20, #0x1
 41024ac: b201f3ea     	mov	x10, #-0x5555555555555556 ; =-6148914691236517206
 41024b0: f2e0554a     	movk	x10, #0x2aa, lsl #48
 41024b4: eb0a011f     	cmp	x8, x10
 41024b8: 54000ce8     	b.hi	0x4102654 <_ChromeMain+0x40fd3b8>
 41024bc: d37ffa89     	lsl	x9, x20, #1
 41024c0: eb08013f     	cmp	x9, x8
 41024c4: 9a888128     	csel	x8, x9, x8, hi
 41024c8: b200f3e9     	mov	x9, #0x5555555555555555 ; =6148914691236517205
 41024cc: f2e02aa9     	movk	x9, #0x155, lsl #48
 41024d0: eb09029f     	cmp	x20, x9
 41024d4: 9a8a3109     	csel	x9, x8, x10, lo
 41024d8: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 41024dc: f81903bf     	stur	xzr, [x29, #-0x70]
 41024e0: b4fffe09     	cbz	x9, 0x41024a0 <_ChromeMain+0x40fd204>
 41024e4: eb0a013f     	cmp	x9, x10
 41024e8: 54000b88     	b.hi	0x4102658 <_ChromeMain+0x40fd3bc>
 41024ec: 8b090528     	add	x8, x9, x9, lsl #1
 41024f0: d37be900     	lsl	x0, x8, #5
 41024f4: f90027e9     	str	x9, [sp, #0x48]
 41024f8: 96fc339c     	bl	0xf368 <_ChromeMain+0xa0cc>
 41024fc: f94027e9     	ldr	x9, [sp, #0x48]
 4102500: f81803a0     	stur	x0, [x29, #-0x80]
 4102504: 9b1a0288     	madd	x8, x20, x26, x0
 4102508: f81883a8     	stur	x8, [x29, #-0x78]
 410250c: f81983a9     	stur	x9, [x29, #-0x68]
 4102510: b4ff8328     	cbz	x8, 0x4101574 <_ChromeMain+0x40fc2d8>
 4102514: 7940a3e9     	ldrh	w9, [sp, #0x50]
 4102518: 79000109     	strh	w9, [x8]
 410251c: 3dc002c0     	ldr	q0, [x22]
 4102520: f9400ac9     	ldr	x9, [x22, #0x10]
 4102524: f9000d09     	str	x9, [x8, #0x18]
 4102528: 3c808100     	stur	q0, [x8, #0x8]
 410252c: a900fedf     	stp	xzr, xzr, [x22, #0x8]
 4102530: f90002df     	str	xzr, [x22]
 4102534: 3dc002e0     	ldr	q0, [x23]
 4102538: f9400ae9     	ldr	x9, [x23, #0x10]
 410253c: f9001909     	str	x9, [x8, #0x30]
 4102540: 3d800900     	str	q0, [x8, #0x20]
 4102544: a900feff     	stp	xzr, xzr, [x23, #0x8]
 4102548: f90002ff     	str	xzr, [x23]
 410254c: 794113e9     	ldrh	w9, [sp, #0x88]
 4102550: 79007109     	strh	w9, [x8, #0x38]
 4102554: 3dc00300     	ldr	q0, [x24]
 4102558: f9400b09     	ldr	x9, [x24, #0x10]
 410255c: f9002909     	str	x9, [x8, #0x50]
 4102560: 3d801100     	str	q0, [x8, #0x40]
 4102564: a900ff1f     	stp	xzr, xzr, [x24, #0x8]
 4102568: f900031f     	str	xzr, [x24]
 410256c: f94057e9     	ldr	x9, [sp, #0xa8]
 4102570: f9002d09     	str	x9, [x8, #0x58]
 4102574: 91018114     	add	x20, x8, #0x60
 4102578: f85883a8     	ldur	x8, [x29, #-0x78]
 410257c: cb080288     	sub	x8, x20, x8
 4102580: 9345fd08     	asr	x8, x8, #5
 4102584: 9b1c7d08     	mul	x8, x8, x28
 4102588: f81903a8     	stur	x8, [x29, #-0x70]
 410258c: d10203a0     	sub	x0, x29, #0x80
 4102590: 910483e8     	add	x8, sp, #0x120
 4102594: 91020101     	add	x1, x8, #0x80
 4102598: 91022102     	add	x2, x8, #0x88
 410259c: 91024103     	add	x3, x8, #0x90
 41025a0: 940000ba     	bl	0x4102888 <_ChromeMain+0x40fd5ec>
 41025a4: d10203a0     	sub	x0, x29, #0x80
 41025a8: 94000123     	bl	0x4102a34 <_ChromeMain+0x40fd798>
 41025ac: 17fffbe1     	b	0x4101530 <_ChromeMain+0x40fc294>
 41025b0: 910483e8     	add	x8, sp, #0x120
 41025b4: 91026100     	add	x0, x8, #0x98
 41025b8: 910143e1     	add	x1, sp, #0x50
 41025bc: 94000268     	bl	0x4102f5c <_ChromeMain+0x40fdcc0>
 41025c0: 17fffde1     	b	0x4101d44 <_ChromeMain+0x40fcaa8>
 41025c4: 91020280     	add	x0, x20, #0x80
 41025c8: b27d0281     	orr	x1, x20, #0x8
 41025cc: 94000154     	bl	0x4102b1c <_ChromeMain+0x40fd880>
 41025d0: 17fffb0f     	b	0x410120c <_ChromeMain+0x40fbf70>
 41025d4: 910483e8     	add	x8, sp, #0x120
 41025d8: 9102c100     	add	x0, x8, #0xb0
 41025dc: 910143e1     	add	x1, sp, #0x50
 41025e0: 940002e8     	bl	0x4103180 <_ChromeMain+0x40fdee4>
 41025e4: 17fffe0e     	b	0x4101e1c <_ChromeMain+0x40fcb80>
 41025e8: 13001d2a     	sxtb	w10, w9
 41025ec: f940010b     	ldr	x11, [x8]
 41025f0: 7100015f     	cmp	w10, #0x0
 41025f4: 9a884161     	csel	x1, x11, x8, mi
 41025f8: 8b150268     	add	x8, x19, x21
 41025fc: f9400908     	ldr	x8, [x8, #0x10]
 4102600: 9a894102     	csel	x2, x8, x9, mi
 4102604: 91004320     	add	x0, x25, #0x10
 4102608: 970e997e     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 410260c: 17fffec7     	b	0x4102128 <_ChromeMain+0x40fce8c>
 4102610: 13001d2b     	sxtb	w11, w9
 4102614: f940010c     	ldr	x12, [x8]
 4102618: 7100017f     	cmp	w11, #0x0
 410261c: 9a884181     	csel	x1, x12, x8, mi
 4102620: f9401548     	ldr	x8, [x10, #0x28]
 4102624: 9a894102     	csel	x2, x8, x9, mi
 4102628: 9100a320     	add	x0, x25, #0x28
 410262c: 970e9975     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4102630: 3707d9b6     	tbnz	w22, #0x0, 0x4102164 <_ChromeMain+0x40fcec8>
 4102634: 17fffece     	b	0x410216c <_ChromeMain+0x40fced0>
 4102638: 7100015f     	cmp	w10, #0x0
 410263c: a9402d28     	ldp	x8, x11, [x9]
 4102640: 9a894101     	csel	x1, x8, x9, mi
 4102644: 9a8a4162     	csel	x2, x11, x10, mi
 4102648: 9100a320     	add	x0, x25, #0x28
 410264c: 970e996d     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4102650: 17fffe52     	b	0x4101f98 <_ChromeMain+0x40fccfc>
 4102654: 977845cb     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 4102658: 942c0e72     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 410265c: d4200000     	brk	#0
