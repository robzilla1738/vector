
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4243d10: d10443ff     	sub	sp, sp, #0x110
 4243d14: 6d0d23e9     	stp	d9, d8, [sp, #0xd0]
 4243d18: a90e57f6     	stp	x22, x21, [sp, #0xe0]
 4243d1c: a90f4ff4     	stp	x20, x19, [sp, #0xf0]
 4243d20: a9107bfd     	stp	x29, x30, [sp, #0x100]
 4243d24: 910403fd     	add	x29, sp, #0x100
 4243d28: b004ef28     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4243d2c: f940f908     	ldr	x8, [x8, #0x1f0]
 4243d30: f9400108     	ldr	x8, [x8]
 4243d34: f81c83a8     	stur	x8, [x29, #-0x38]
 4243d38: b943bc08     	ldr	w8, [x0, #0x3bc]
 4243d3c: 51000508     	sub	w8, w8, #0x1
 4243d40: 7100051f     	cmp	w8, #0x1
 4243d44: 54000988     	b.hi	0x4243e74 <_ChromeMain+0x423ebd8>
 4243d48: aa0103f4     	mov	x20, x1
 4243d4c: aa0003f3     	mov	x19, x0
 4243d50: 970d74a8     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4243d54: b4000900     	cbz	x0, 0x4243e74 <_ChromeMain+0x423ebd8>
 4243d58: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 4243d5c: 6f00e400     	movi.2d	v0, #0000000000000000
 4243d60: ad0303e0     	stp	q0, q0, [sp, #0x60]
 4243d64: f90043ff     	str	xzr, [sp, #0x80]
 4243d68: d2806029     	mov	x9, #0x301              ; =769
 4243d6c: f2f7f009     	movk	x9, #0xbf80, lsl #48
 4243d70: a90527e8     	stp	x8, x9, [sp, #0x50]
 4243d74: 52801ee1     	mov	w1, #0xf7               ; =247
 4243d78: 97339114     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 4243d7c: 1e270000     	fmov	s0, w0
 4243d80: 0e003800     	zip1.8b	v0, v0, v0
 4243d84: 2f07b7e0     	bic.4h	v0, #0xff, lsl #8
 4243d88: 2f10a400     	ushll.4s	v0, v0, #0x0
 4243d8c: 6e21d800     	ucvtf.4s	v0, v0
 4243d90: 52901028     	mov	w8, #0x8081             ; =32897
 4243d94: 72a77008     	movk	w8, #0x3b80, lsl #16
 4243d98: 4e040d01     	dup.4s	v1, w8
 4243d9c: 6e21dc00     	fmul.4s	v0, v0, v1
 4243da0: 4ea00800     	rev64.4s	v0, v0
 4243da4: 6e006000     	ext.16b	v0, v0, v0, #0xc
 4243da8: 3d8013e0     	str	q0, [sp, #0x40]
 4243dac: b9463675     	ldr	w21, [x19, #0x634]
 4243db0: 71000ebf     	cmp	w21, #0x3
 4243db4: 54000ba2     	b.hs	0x4243f28 <_ChromeMain+0x423ec8c>
 4243db8: f0046608     	adrp	x8, 0xcf06000 <dyld_stub_binder+0xcf06000>
 4243dbc: 9118e108     	add	x8, x8, #0x638
 4243dc0: bc757908     	ldr	s8, [x8, x21, lsl #2]
 4243dc4: f0046608     	adrp	x8, 0xcf06000 <dyld_stub_binder+0xcf06000>
 4243dc8: 91191108     	add	x8, x8, #0x644
 4243dcc: f9406294     	ldr	x20, [x20, #0xc0]
 4243dd0: bc757909     	ldr	s9, [x8, x21, lsl #2]
 4243dd4: f940e268     	ldr	x8, [x19, #0x1c0]
 4243dd8: a90023ff     	stp	xzr, x8, [sp]
 4243ddc: 910003e0     	mov	x0, sp
 4243de0: 97b78e98     	bl	0x3027840 <_ChromeMain+0x30225a4>
 4243de4: 6f00e404     	movi.2d	v4, #0000000000000000
 4243de8: 1e242800     	fadd	s0, s0, s4
 4243dec: 1e242821     	fadd	s1, s1, s4
 4243df0: 2d3207a0     	stp	s0, s1, [x29, #-0x70]
 4243df4: 2d330fa2     	stp	s2, s3, [x29, #-0x68]
 4243df8: 720002bf     	tst	w21, #0x1
 4243dfc: 1e240d20     	fcsel	s0, s9, s4, eq
 4243e00: 4e040400     	dup.4s	v0, v0[0]
 4243e04: 71000abf     	cmp	w21, #0x2
 4243e08: 1e280c81     	fcsel	s1, s4, s8, eq
 4243e0c: 4e040421     	dup.4s	v1, v1[0]
 4243e10: ad3d07a0     	stp	q0, q1, [x29, #-0x60]
 4243e14: 6f00e400     	movi.2d	v0, #0000000000000000
 4243e18: ad0003e0     	stp	q0, q0, [sp]
 4243e1c: 3d800be0     	str	q0, [sp, #0x20]
 4243e20: b90033ff     	str	wzr, [sp, #0x30]
 4243e24: 910003e0     	mov	x0, sp
 4243e28: d101c3a1     	sub	x1, x29, #0x70
 4243e2c: d10183a2     	sub	x2, x29, #0x60
 4243e30: 97043fe4     	bl	0x353dc0 <_ChromeMain+0x34eb24>
 4243e34: f9400288     	ldr	x8, [x20]
 4243e38: f9407d08     	ldr	x8, [x8, #0xf8]
 4243e3c: 910003e1     	mov	x1, sp
 4243e40: 910103e2     	add	x2, sp, #0x40
 4243e44: aa1403e0     	mov	x0, x20
 4243e48: d63f0100     	blr	x8
 4243e4c: f94043e0     	ldr	x0, [sp, #0x80]
 4243e50: b5000580     	cbnz	x0, 0x4243f00 <_ChromeMain+0x423ec64>
 4243e54: f9403fe0     	ldr	x0, [sp, #0x78]
 4243e58: b5000420     	cbnz	x0, 0x4243edc <_ChromeMain+0x423ec40>
 4243e5c: f9403be0     	ldr	x0, [sp, #0x70]
 4243e60: b5000780     	cbnz	x0, 0x4243f50 <_ChromeMain+0x423ecb4>
 4243e64: f94037e0     	ldr	x0, [sp, #0x68]
 4243e68: b50001e0     	cbnz	x0, 0x4243ea4 <_ChromeMain+0x423ec08>
 4243e6c: f94033e0     	ldr	x0, [sp, #0x60]
 4243e70: b50005e0     	cbnz	x0, 0x4243f2c <_ChromeMain+0x423ec90>
 4243e74: f85c83a8     	ldur	x8, [x29, #-0x38]
 4243e78: b004ef29     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4243e7c: f940f929     	ldr	x9, [x9, #0x1f0]
 4243e80: f9400129     	ldr	x9, [x9]
 4243e84: eb08013f     	cmp	x9, x8
 4243e88: 540004e1     	b.ne	0x4243f24 <_ChromeMain+0x423ec88>
 4243e8c: a9507bfd     	ldp	x29, x30, [sp, #0x100]
 4243e90: a94f4ff4     	ldp	x20, x19, [sp, #0xf0]
 4243e94: a94e57f6     	ldp	x22, x21, [sp, #0xe0]
 4243e98: 6d4d23e9     	ldp	d9, d8, [sp, #0xd0]
 4243e9c: 910443ff     	add	sp, sp, #0x110
 4243ea0: d65f03c0     	ret
 4243ea4: 91002008     	add	x8, x0, #0x8
 4243ea8: 12800009     	mov	w9, #-0x1               ; =-1
 4243eac: b8e90108     	ldaddal	w9, w8, [x8]
 4243eb0: 7100051f     	cmp	w8, #0x1
 4243eb4: 54fffdc1     	b.ne	0x4243e6c <_ChromeMain+0x423ebd0>
 4243eb8: f9400009     	ldr	x9, [x0]
 4243ebc: f9400928     	ldr	x8, [x9, #0x10]
 4243ec0: d0fdef0a     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 4243ec4: 9106014a     	add	x10, x10, #0x180
 4243ec8: eb0a011f     	cmp	x8, x10
 4243ecc: 54000041     	b.ne	0x4243ed4 <_ChromeMain+0x423ec38>
 4243ed0: f9400528     	ldr	x8, [x9, #0x8]
 4243ed4: d63f0100     	blr	x8
 4243ed8: 17ffffe5     	b	0x4243e6c <_ChromeMain+0x423ebd0>
 4243edc: 91002008     	add	x8, x0, #0x8
 4243ee0: 12800009     	mov	w9, #-0x1               ; =-1
 4243ee4: b8e90108     	ldaddal	w9, w8, [x8]
 4243ee8: 7100051f     	cmp	w8, #0x1
 4243eec: 54fffb81     	b.ne	0x4243e5c <_ChromeMain+0x423ebc0>
 4243ef0: f9400008     	ldr	x8, [x0]
 4243ef4: f9400908     	ldr	x8, [x8, #0x10]
 4243ef8: d63f0100     	blr	x8
 4243efc: 17ffffd8     	b	0x4243e5c <_ChromeMain+0x423ebc0>
 4243f00: 91002008     	add	x8, x0, #0x8
 4243f04: 12800009     	mov	w9, #-0x1               ; =-1
 4243f08: b8e90108     	ldaddal	w9, w8, [x8]
 4243f0c: 7100051f     	cmp	w8, #0x1
 4243f10: 54fffa21     	b.ne	0x4243e54 <_ChromeMain+0x423ebb8>
 4243f14: f9400008     	ldr	x8, [x0]
 4243f18: f9400908     	ldr	x8, [x8, #0x10]
 4243f1c: d63f0100     	blr	x8
 4243f20: 17ffffcd     	b	0x4243e54 <_ChromeMain+0x423ebb8>
 4243f24: 94f7010f     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4243f28: d42aa160     	brk	#0x550b
 4243f2c: 91002008     	add	x8, x0, #0x8
 4243f30: 12800009     	mov	w9, #-0x1               ; =-1
 4243f34: b8e90108     	ldaddal	w9, w8, [x8]
 4243f38: 7100051f     	cmp	w8, #0x1
 4243f3c: 54fff9c1     	b.ne	0x4243e74 <_ChromeMain+0x423ebd8>
 4243f40: f9400008     	ldr	x8, [x0]
 4243f44: f9400908     	ldr	x8, [x8, #0x10]
 4243f48: d63f0100     	blr	x8
 4243f4c: 17ffffca     	b	0x4243e74 <_ChromeMain+0x423ebd8>
 4243f50: 91002008     	add	x8, x0, #0x8
 4243f54: 12800009     	mov	w9, #-0x1               ; =-1
 4243f58: b8e90108     	ldaddal	w9, w8, [x8]
 4243f5c: 7100051f     	cmp	w8, #0x1
 4243f60: 54fff821     	b.ne	0x4243e64 <_ChromeMain+0x423ebc8>
 4243f64: f9400008     	ldr	x8, [x0]
 4243f68: f9400908     	ldr	x8, [x8, #0x10]
 4243f6c: d63f0100     	blr	x8
 4243f70: 17ffffbd     	b	0x4243e64 <_ChromeMain+0x423ebc8>
 4243f74: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4243f78: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4243f7c: 910043fd     	add	x29, sp, #0x10
 4243f80: aa0003f3     	mov	x19, x0
 4243f84: 979fa14e     	bl	0x2a2c4bc <_ChromeMain+0x2a27220>
 4243f88: f9431e60     	ldr	x0, [x19, #0x638]
 4243f8c: b40000a0     	cbz	x0, 0x4243fa0 <_ChromeMain+0x423ed04>
 4243f90: 3958c268     	ldrb	w8, [x19, #0x630]
 4243f94: 340000c8     	cbz	w8, 0x4243fac <_ChromeMain+0x423ed10>
 4243f98: 39472008     	ldrb	w8, [x0, #0x1c8]
 4243f9c: 37000228     	tbnz	w8, #0x0, 0x4243fe0 <_ChromeMain+0x423ed44>
 4243fa0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4243fa4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4243fa8: d65f03c0     	ret
 4243fac: b943be68     	ldr	w8, [x19, #0x3bc]
 4243fb0: 7100051f     	cmp	w8, #0x1
 4243fb4: 540000a1     	b.ne	0x4243fc8 <_ChromeMain+0x423ed2c>
 4243fb8: 39472008     	ldrb	w8, [x0, #0x1c8]
 4243fbc: 3707ff28     	tbnz	w8, #0x0, 0x4243fa0 <_ChromeMain+0x423ed04>
 4243fc0: 52800021     	mov	w1, #0x1                ; =1
 4243fc4: 14000008     	b	0x4243fe4 <_ChromeMain+0x423ed48>
 4243fc8: 7100091f     	cmp	w8, #0x2
 4243fcc: 1a9f17e1     	cset	w1, eq
 4243fd0: 39472008     	ldrb	w8, [x0, #0x1c8]
 4243fd4: 6b08003f     	cmp	w1, w8
 4243fd8: 54fffe40     	b.eq	0x4243fa0 <_ChromeMain+0x423ed04>
 4243fdc: 14000002     	b	0x4243fe4 <_ChromeMain+0x423ed48>
 4243fe0: 52800001     	mov	w1, #0x0                ; =0
 4243fe4: f9400008     	ldr	x8, [x0]
 4243fe8: f9405108     	ldr	x8, [x8, #0xa0]
 4243fec: d63f0100     	blr	x8
 4243ff0: aa1303e0     	mov	x0, x19
 4243ff4: 52800001     	mov	w1, #0x0                ; =0
 4243ff8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4243ffc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4244000: 170fb11d     	b	0x630474 <_ChromeMain+0x62b1d8>
 4244004: d10343ff     	sub	sp, sp, #0xd0
 4244008: 6d0823e9     	stp	d9, d8, [sp, #0x80]
 424400c: a9095ff8     	stp	x24, x23, [sp, #0x90]
 4244010: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 4244014: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 4244018: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 424401c: 910303fd     	add	x29, sp, #0xc0
 4244020: 9004ef28     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4244024: f940f908     	ldr	x8, [x8, #0x1f0]
 4244028: f9400108     	ldr	x8, [x8]
 424402c: f81b83a8     	stur	x8, [x29, #-0x48]
 4244030: b9463414     	ldr	w20, [x0, #0x634]
 4244034: 71000e9f     	cmp	w20, #0x3
 4244038: 54000a62     	b.hs	0x4244184 <_ChromeMain+0x423eee8>
 424403c: aa0103f3     	mov	x19, x1
 4244040: d0046608     	adrp	x8, 0xcf06000 <dyld_stub_binder+0xcf06000>
 4244044: 9118e108     	add	x8, x8, #0x638
 4244048: bc747908     	ldr	s8, [x8, x20, lsl #2]
 424404c: d0046608     	adrp	x8, 0xcf06000 <dyld_stub_binder+0xcf06000>
 4244050: 91191108     	add	x8, x8, #0x644
 4244054: bc747909     	ldr	s9, [x8, x20, lsl #2]
 4244058: f940e008     	ldr	x8, [x0, #0x1c0]
 424405c: a90023ff     	stp	xzr, x8, [sp]
 4244060: 910003e0     	mov	x0, sp
 4244064: 97b78df7     	bl	0x3027840 <_ChromeMain+0x30225a4>
 4244068: 6f00e404     	movi.2d	v4, #0000000000000000
 424406c: 1e242800     	fadd	s0, s0, s4
 4244070: 1e242821     	fadd	s1, s1, s4
 4244074: 2d0807e0     	stp	s0, s1, [sp, #0x40]
 4244078: 7200029f     	tst	w20, #0x1
 424407c: 1e240d20     	fcsel	s0, s9, s4, eq
 4244080: 4e040400     	dup.4s	v0, v0[0]
 4244084: 2d090fe2     	stp	s2, s3, [sp, #0x48]
 4244088: 71000a9f     	cmp	w20, #0x2
 424408c: 1e280c81     	fcsel	s1, s4, s8, eq
 4244090: 4e040421     	dup.4s	v1, v1[0]
 4244094: ad0287e0     	stp	q0, q1, [sp, #0x50]
 4244098: 6f00e400     	movi.2d	v0, #0000000000000000
 424409c: ad0003e0     	stp	q0, q0, [sp]
 42440a0: 3d800be0     	str	q0, [sp, #0x20]
 42440a4: b90033ff     	str	wzr, [sp, #0x30]
 42440a8: 910003e0     	mov	x0, sp
 42440ac: 910103e1     	add	x1, sp, #0x40
 42440b0: 910143e2     	add	x2, sp, #0x50
 42440b4: 97043f43     	bl	0x353dc0 <_ChromeMain+0x34eb24>
 42440b8: 910143e8     	add	x8, sp, #0x50
 42440bc: 910003e0     	mov	x0, sp
 42440c0: 52800001     	mov	w1, #0x0                ; =0
 42440c4: 9719e903     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 42440c8: f9402be8     	ldr	x8, [sp, #0x50]
 42440cc: f9002bff     	str	xzr, [sp, #0x50]
 42440d0: f9400260     	ldr	x0, [x19]
 42440d4: f9000268     	str	x8, [x19]
 42440d8: b40005a0     	cbz	x0, 0x424418c <_ChromeMain+0x423eef0>
 42440dc: 12800008     	mov	w8, #-0x1               ; =-1
 42440e0: b8e80008     	ldaddal	w8, w8, [x0]
 42440e4: 7100051f     	cmp	w8, #0x1
 42440e8: 540003e0     	b.eq	0x4244164 <_ChromeMain+0x423eec8>
 42440ec: f9402be0     	ldr	x0, [sp, #0x50]
 42440f0: 7940b3e8     	ldrh	w8, [sp, #0x58]
 42440f4: 79001268     	strh	w8, [x19, #0x8]
 42440f8: b40000a0     	cbz	x0, 0x424410c <_ChromeMain+0x423ee70>
 42440fc: 12800008     	mov	w8, #-0x1               ; =-1
 4244100: b8e80008     	ldaddal	w8, w8, [x0]
 4244104: 7100051f     	cmp	w8, #0x1
 4244108: 540001e0     	b.eq	0x4244144 <_ChromeMain+0x423eea8>
 424410c: f85b83a8     	ldur	x8, [x29, #-0x48]
 4244110: 9004ef29     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4244114: f940f929     	ldr	x9, [x9, #0x1f0]
 4244118: f9400129     	ldr	x9, [x9]
 424411c: eb08013f     	cmp	x9, x8
 4244120: 54000341     	b.ne	0x4244188 <_ChromeMain+0x423eeec>
 4244124: 52800020     	mov	w0, #0x1                ; =1
 4244128: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 424412c: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4244130: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4244134: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 4244138: 6d4823e9     	ldp	d9, d8, [sp, #0x80]
 424413c: 910343ff     	add	sp, sp, #0xd0
 4244140: d65f03c0     	ret
 4244144: b9802808     	ldrsw	x8, [x0, #0x28]
 4244148: 35000288     	cbnz	w8, 0x4244198 <_ChromeMain+0x423eefc>
 424414c: 3940b008     	ldrb	w8, [x0, #0x2c]
 4244150: 37000688     	tbnz	w8, #0x0, 0x4244220 <_ChromeMain+0x423ef84>
 4244154: f9400813     	ldr	x19, [x0, #0x10]
 4244158: b5000713     	cbnz	x19, 0x4244238 <_ChromeMain+0x423ef9c>
 424415c: 96f74143     	bl	0x14668 <_ChromeMain+0xf3cc>
 4244160: 17ffffeb     	b	0x424410c <_ChromeMain+0x423ee70>
 4244164: b9802808     	ldrsw	x8, [x0, #0x28]
 4244168: 350007a8     	cbnz	w8, 0x424425c <_ChromeMain+0x423efc0>
 424416c: 3940b008     	ldrb	w8, [x0, #0x2c]
 4244170: 37000ba8     	tbnz	w8, #0x0, 0x42442e4 <_ChromeMain+0x423f048>
 4244174: f9400814     	ldr	x20, [x0, #0x10]
 4244178: b5000c34     	cbnz	x20, 0x42442fc <_ChromeMain+0x423f060>
 424417c: 96f7413b     	bl	0x14668 <_ChromeMain+0xf3cc>
 4244180: 17ffffdb     	b	0x42440ec <_ChromeMain+0x423ee50>
 4244184: d42aa160     	brk	#0x550b
 4244188: 94f70076     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 424418c: 7940b3e8     	ldrh	w8, [sp, #0x58]
 4244190: 79001268     	strh	w8, [x19, #0x8]
 4244194: 17ffffde     	b	0x424410c <_ChromeMain+0x423ee70>
 4244198: aa0003f3     	mov	x19, x0
 424419c: f9401014     	ldr	x20, [x0, #0x20]
 42441a0: d37df115     	lsl	x21, x8, #3
 42441a4: f9400288     	ldr	x8, [x20]
 42441a8: 1940c108     	ldapurb	w8, [x8, #0xc]
 42441ac: 370000a8     	tbnz	w8, #0x0, 0x42441c0 <_ChromeMain+0x423ef24>
 42441b0: f9400280     	ldr	x0, [x20]
 42441b4: f9400008     	ldr	x8, [x0]
 42441b8: f9400d08     	ldr	x8, [x8, #0x18]
 42441bc: d63f0100     	blr	x8
 42441c0: 91002294     	add	x20, x20, #0x8
 42441c4: f10022b5     	subs	x21, x21, #0x8
 42441c8: 54fffee1     	b.ne	0x42441a4 <_ChromeMain+0x423ef08>
 42441cc: aa1303e0     	mov	x0, x19
 42441d0: b9802a68     	ldrsw	x8, [x19, #0x28]
 42441d4: 34fffbc8     	cbz	w8, 0x424414c <_ChromeMain+0x423eeb0>
 42441d8: f9401014     	ldr	x20, [x0, #0x20]
 42441dc: 8b080e95     	add	x21, x20, x8, lsl #3
 42441e0: 12800016     	mov	w22, #-0x1              ; =-1
 42441e4: 14000008     	b	0x4244204 <_ChromeMain+0x423ef68>
 42441e8: f9400008     	ldr	x8, [x0]
 42441ec: f9400908     	ldr	x8, [x8, #0x10]
 42441f0: d63f0100     	blr	x8
 42441f4: 91002294     	add	x20, x20, #0x8
 42441f8: eb15029f     	cmp	x20, x21
 42441fc: aa1303e0     	mov	x0, x19
 4244200: 54fffa62     	b.hs	0x424414c <_ChromeMain+0x423eeb0>
 4244204: f9400280     	ldr	x0, [x20]
 4244208: b4ffff60     	cbz	x0, 0x42441f4 <_ChromeMain+0x423ef58>
 424420c: 91002008     	add	x8, x0, #0x8
 4244210: b8f60108     	ldaddal	w22, w8, [x8]
 4244214: 7100051f     	cmp	w8, #0x1
 4244218: 54fffee1     	b.ne	0x42441f4 <_ChromeMain+0x423ef58>
 424421c: 17fffff3     	b	0x42441e8 <_ChromeMain+0x423ef4c>
 4244220: f9401008     	ldr	x8, [x0, #0x20]
 4244224: aa0003f3     	mov	x19, x0
 4244228: aa0803e0     	mov	x0, x8
 424422c: 96f97972     	bl	0xa27f4 <_ChromeMain+0x9d558>
 4244230: aa1303e0     	mov	x0, x19
 4244234: 17ffffc8     	b	0x4244154 <_ChromeMain+0x423eeb8>
 4244238: f9400268     	ldr	x8, [x19]
 424423c: aa0003f4     	mov	x20, x0
 4244240: aa0803e0     	mov	x0, x8
 4244244: 94f7a0df     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 4244248: aa1303e0     	mov	x0, x19
 424424c: 52800101     	mov	w1, #0x8                ; =8
 4244250: 96f7131a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4244254: aa1403e0     	mov	x0, x20
 4244258: 17ffffc1     	b	0x424415c <_ChromeMain+0x423eec0>
 424425c: aa0003f4     	mov	x20, x0
 4244260: f9401015     	ldr	x21, [x0, #0x20]
 4244264: d37df116     	lsl	x22, x8, #3
 4244268: f94002a8     	ldr	x8, [x21]
 424426c: 1940c108     	ldapurb	w8, [x8, #0xc]
 4244270: 370000a8     	tbnz	w8, #0x0, 0x4244284 <_ChromeMain+0x423efe8>
 4244274: f94002a0     	ldr	x0, [x21]
 4244278: f9400008     	ldr	x8, [x0]
 424427c: f9400d08     	ldr	x8, [x8, #0x18]
 4244280: d63f0100     	blr	x8
 4244284: 910022b5     	add	x21, x21, #0x8
 4244288: f10022d6     	subs	x22, x22, #0x8
 424428c: 54fffee1     	b.ne	0x4244268 <_ChromeMain+0x423efcc>
 4244290: aa1403e0     	mov	x0, x20
 4244294: b9802a88     	ldrsw	x8, [x20, #0x28]
 4244298: 34fff6a8     	cbz	w8, 0x424416c <_ChromeMain+0x423eed0>
 424429c: f9401015     	ldr	x21, [x0, #0x20]
 42442a0: 8b080eb6     	add	x22, x21, x8, lsl #3
 42442a4: 12800017     	mov	w23, #-0x1              ; =-1
 42442a8: 14000008     	b	0x42442c8 <_ChromeMain+0x423f02c>
 42442ac: f9400008     	ldr	x8, [x0]
 42442b0: f9400908     	ldr	x8, [x8, #0x10]
 42442b4: d63f0100     	blr	x8
 42442b8: 910022b5     	add	x21, x21, #0x8
 42442bc: eb1602bf     	cmp	x21, x22
 42442c0: aa1403e0     	mov	x0, x20
 42442c4: 54fff542     	b.hs	0x424416c <_ChromeMain+0x423eed0>
 42442c8: f94002a0     	ldr	x0, [x21]
 42442cc: b4ffff60     	cbz	x0, 0x42442b8 <_ChromeMain+0x423f01c>
 42442d0: 91002008     	add	x8, x0, #0x8
 42442d4: b8f70108     	ldaddal	w23, w8, [x8]
 42442d8: 7100051f     	cmp	w8, #0x1
 42442dc: 54fffee1     	b.ne	0x42442b8 <_ChromeMain+0x423f01c>
 42442e0: 17fffff3     	b	0x42442ac <_ChromeMain+0x423f010>
 42442e4: f9401008     	ldr	x8, [x0, #0x20]
 42442e8: aa0003f4     	mov	x20, x0
 42442ec: aa0803e0     	mov	x0, x8
 42442f0: 96f97941     	bl	0xa27f4 <_ChromeMain+0x9d558>
 42442f4: aa1403e0     	mov	x0, x20
 42442f8: 17ffff9f     	b	0x4244174 <_ChromeMain+0x423eed8>
 42442fc: f9400288     	ldr	x8, [x20]
 4244300: aa0003f5     	mov	x21, x0
 4244304: aa0803e0     	mov	x0, x8
 4244308: 94f7a0ae     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 424430c: aa1403e0     	mov	x0, x20
 4244310: 52800101     	mov	w1, #0x8                ; =8
 4244314: 96f712e9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4244318: aa1503e0     	mov	x0, x21
 424431c: 17ffff98     	b	0x424417c <_ChromeMain+0x423eee0>
 4244320: d10343ff     	sub	sp, sp, #0xd0
 4244324: 6d0823e9     	stp	d9, d8, [sp, #0x80]
 4244328: a9095ff8     	stp	x24, x23, [sp, #0x90]
 424432c: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 4244330: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 4244334: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 4244338: 910303fd     	add	x29, sp, #0xc0
 424433c: 9004ef28     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4244340: f940f908     	ldr	x8, [x8, #0x1f0]
 4244344: f9400108     	ldr	x8, [x8]
 4244348: f81b83a8     	stur	x8, [x29, #-0x48]
 424434c: b9400c14     	ldr	w20, [x0, #0xc]
 4244350: 71000e9f     	cmp	w20, #0x3
 4244354: 54000a82     	b.hs	0x42444a4 <_ChromeMain+0x423f208>
 4244358: aa0103f3     	mov	x19, x1
 424435c: d0046608     	adrp	x8, 0xcf06000 <dyld_stub_binder+0xcf06000>
 4244360: 9118e108     	add	x8, x8, #0x638
 4244364: bc747908     	ldr	s8, [x8, x20, lsl #2]
 4244368: d0046608     	adrp	x8, 0xcf06000 <dyld_stub_binder+0xcf06000>
 424436c: 91191108     	add	x8, x8, #0x644
 4244370: bc747909     	ldr	s9, [x8, x20, lsl #2]
 4244374: d111a008     	sub	x8, x0, #0x468
 4244378: f9400108     	ldr	x8, [x8]
 424437c: a90023ff     	stp	xzr, x8, [sp]
 4244380: 910003e0     	mov	x0, sp
 4244384: 97b78d2f     	bl	0x3027840 <_ChromeMain+0x30225a4>
 4244388: 6f00e404     	movi.2d	v4, #0000000000000000
 424438c: 1e242800     	fadd	s0, s0, s4
 4244390: 1e242821     	fadd	s1, s1, s4
 4244394: 2d0807e0     	stp	s0, s1, [sp, #0x40]
 4244398: 7200029f     	tst	w20, #0x1
 424439c: 1e240d20     	fcsel	s0, s9, s4, eq
 42443a0: 4e040400     	dup.4s	v0, v0[0]
 42443a4: 2d090fe2     	stp	s2, s3, [sp, #0x48]
 42443a8: 71000a9f     	cmp	w20, #0x2
 42443ac: 1e280c81     	fcsel	s1, s4, s8, eq
 42443b0: 4e040421     	dup.4s	v1, v1[0]
 42443b4: ad0287e0     	stp	q0, q1, [sp, #0x50]
 42443b8: 6f00e400     	movi.2d	v0, #0000000000000000
 42443bc: ad0003e0     	stp	q0, q0, [sp]
 42443c0: 3d800be0     	str	q0, [sp, #0x20]
 42443c4: b90033ff     	str	wzr, [sp, #0x30]
 42443c8: 910003e0     	mov	x0, sp
 42443cc: 910103e1     	add	x1, sp, #0x40
 42443d0: 910143e2     	add	x2, sp, #0x50
 42443d4: 97043e7b     	bl	0x353dc0 <_ChromeMain+0x34eb24>
 42443d8: 910143e8     	add	x8, sp, #0x50
 42443dc: 910003e0     	mov	x0, sp
 42443e0: 52800001     	mov	w1, #0x0                ; =0
 42443e4: 9719e83b     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 42443e8: f9402be8     	ldr	x8, [sp, #0x50]
 42443ec: f9002bff     	str	xzr, [sp, #0x50]
 42443f0: f9400260     	ldr	x0, [x19]
 42443f4: f9000268     	str	x8, [x19]
 42443f8: b40005a0     	cbz	x0, 0x42444ac <_ChromeMain+0x423f210>
 42443fc: 12800008     	mov	w8, #-0x1               ; =-1
 4244400: b8e80008     	ldaddal	w8, w8, [x0]
 4244404: 7100051f     	cmp	w8, #0x1
 4244408: 540003e0     	b.eq	0x4244484 <_ChromeMain+0x423f1e8>
 424440c: f9402be0     	ldr	x0, [sp, #0x50]
 4244410: 7940b3e8     	ldrh	w8, [sp, #0x58]
 4244414: 79001268     	strh	w8, [x19, #0x8]
 4244418: b40000a0     	cbz	x0, 0x424442c <_ChromeMain+0x423f190>
 424441c: 12800008     	mov	w8, #-0x1               ; =-1
 4244420: b8e80008     	ldaddal	w8, w8, [x0]
 4244424: 7100051f     	cmp	w8, #0x1
 4244428: 540001e0     	b.eq	0x4244464 <_ChromeMain+0x423f1c8>
 424442c: f85b83a8     	ldur	x8, [x29, #-0x48]
 4244430: 9004ef29     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4244434: f940f929     	ldr	x9, [x9, #0x1f0]
 4244438: f9400129     	ldr	x9, [x9]
 424443c: eb08013f     	cmp	x9, x8
 4244440: 54000341     	b.ne	0x42444a8 <_ChromeMain+0x423f20c>
 4244444: 52800020     	mov	w0, #0x1                ; =1
 4244448: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 424444c: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4244450: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4244454: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 4244458: 6d4823e9     	ldp	d9, d8, [sp, #0x80]
 424445c: 910343ff     	add	sp, sp, #0xd0
 4244460: d65f03c0     	ret
 4244464: b9802808     	ldrsw	x8, [x0, #0x28]
 4244468: 35000288     	cbnz	w8, 0x42444b8 <_ChromeMain+0x423f21c>
 424446c: 3940b008     	ldrb	w8, [x0, #0x2c]
 4244470: 37000688     	tbnz	w8, #0x0, 0x4244540 <_ChromeMain+0x423f2a4>
 4244474: f9400813     	ldr	x19, [x0, #0x10]
 4244478: b5000713     	cbnz	x19, 0x4244558 <_ChromeMain+0x423f2bc>
 424447c: 96f7407b     	bl	0x14668 <_ChromeMain+0xf3cc>
 4244480: 17ffffeb     	b	0x424442c <_ChromeMain+0x423f190>
 4244484: b9802808     	ldrsw	x8, [x0, #0x28]
 4244488: 350007a8     	cbnz	w8, 0x424457c <_ChromeMain+0x423f2e0>
 424448c: 3940b008     	ldrb	w8, [x0, #0x2c]
 4244490: 37000ba8     	tbnz	w8, #0x0, 0x4244604 <_ChromeMain+0x423f368>
 4244494: f9400814     	ldr	x20, [x0, #0x10]
 4244498: b5000c34     	cbnz	x20, 0x424461c <_ChromeMain+0x423f380>
 424449c: 96f74073     	bl	0x14668 <_ChromeMain+0xf3cc>
 42444a0: 17ffffdb     	b	0x424440c <_ChromeMain+0x423f170>
 42444a4: d42aa160     	brk	#0x550b
 42444a8: 94f6ffae     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 42444ac: 7940b3e8     	ldrh	w8, [sp, #0x58]
 42444b0: 79001268     	strh	w8, [x19, #0x8]
 42444b4: 17ffffde     	b	0x424442c <_ChromeMain+0x423f190>
 42444b8: aa0003f3     	mov	x19, x0
 42444bc: f9401014     	ldr	x20, [x0, #0x20]
 42444c0: d37df115     	lsl	x21, x8, #3
 42444c4: f9400288     	ldr	x8, [x20]
 42444c8: 1940c108     	ldapurb	w8, [x8, #0xc]
 42444cc: 370000a8     	tbnz	w8, #0x0, 0x42444e0 <_ChromeMain+0x423f244>
 42444d0: f9400280     	ldr	x0, [x20]
 42444d4: f9400008     	ldr	x8, [x0]
 42444d8: f9400d08     	ldr	x8, [x8, #0x18]
 42444dc: d63f0100     	blr	x8
 42444e0: 91002294     	add	x20, x20, #0x8
 42444e4: f10022b5     	subs	x21, x21, #0x8
 42444e8: 54fffee1     	b.ne	0x42444c4 <_ChromeMain+0x423f228>
 42444ec: aa1303e0     	mov	x0, x19
 42444f0: b9802a68     	ldrsw	x8, [x19, #0x28]
 42444f4: 34fffbc8     	cbz	w8, 0x424446c <_ChromeMain+0x423f1d0>
 42444f8: f9401014     	ldr	x20, [x0, #0x20]
 42444fc: 8b080e95     	add	x21, x20, x8, lsl #3
 4244500: 12800016     	mov	w22, #-0x1              ; =-1
 4244504: 14000008     	b	0x4244524 <_ChromeMain+0x423f288>
 4244508: f9400008     	ldr	x8, [x0]
 424450c: f9400908     	ldr	x8, [x8, #0x10]
 4244510: d63f0100     	blr	x8
 4244514: 91002294     	add	x20, x20, #0x8
 4244518: eb15029f     	cmp	x20, x21
 424451c: aa1303e0     	mov	x0, x19
 4244520: 54fffa62     	b.hs	0x424446c <_ChromeMain+0x423f1d0>
 4244524: f9400280     	ldr	x0, [x20]
 4244528: b4ffff60     	cbz	x0, 0x4244514 <_ChromeMain+0x423f278>
 424452c: 91002008     	add	x8, x0, #0x8
 4244530: b8f60108     	ldaddal	w22, w8, [x8]
 4244534: 7100051f     	cmp	w8, #0x1
 4244538: 54fffee1     	b.ne	0x4244514 <_ChromeMain+0x423f278>
 424453c: 17fffff3     	b	0x4244508 <_ChromeMain+0x423f26c>
 4244540: f9401008     	ldr	x8, [x0, #0x20]
 4244544: aa0003f3     	mov	x19, x0
 4244548: aa0803e0     	mov	x0, x8
 424454c: 96f978aa     	bl	0xa27f4 <_ChromeMain+0x9d558>
 4244550: aa1303e0     	mov	x0, x19
 4244554: 17ffffc8     	b	0x4244474 <_ChromeMain+0x423f1d8>
 4244558: f9400268     	ldr	x8, [x19]
 424455c: aa0003f4     	mov	x20, x0
 4244560: aa0803e0     	mov	x0, x8
 4244564: 94f7a017     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 4244568: aa1303e0     	mov	x0, x19
 424456c: 52800101     	mov	w1, #0x8                ; =8
 4244570: 96f71252     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4244574: aa1403e0     	mov	x0, x20
 4244578: 17ffffc1     	b	0x424447c <_ChromeMain+0x423f1e0>
 424457c: aa0003f4     	mov	x20, x0
 4244580: f9401015     	ldr	x21, [x0, #0x20]
 4244584: d37df116     	lsl	x22, x8, #3
 4244588: f94002a8     	ldr	x8, [x21]
 424458c: 1940c108     	ldapurb	w8, [x8, #0xc]
 4244590: 370000a8     	tbnz	w8, #0x0, 0x42445a4 <_ChromeMain+0x423f308>
 4244594: f94002a0     	ldr	x0, [x21]
 4244598: f9400008     	ldr	x8, [x0]
 424459c: f9400d08     	ldr	x8, [x8, #0x18]
 42445a0: d63f0100     	blr	x8
 42445a4: 910022b5     	add	x21, x21, #0x8
 42445a8: f10022d6     	subs	x22, x22, #0x8
 42445ac: 54fffee1     	b.ne	0x4244588 <_ChromeMain+0x423f2ec>
 42445b0: aa1403e0     	mov	x0, x20
 42445b4: b9802a88     	ldrsw	x8, [x20, #0x28]
 42445b8: 34fff6a8     	cbz	w8, 0x424448c <_ChromeMain+0x423f1f0>
 42445bc: f9401015     	ldr	x21, [x0, #0x20]
 42445c0: 8b080eb6     	add	x22, x21, x8, lsl #3
 42445c4: 12800017     	mov	w23, #-0x1              ; =-1
 42445c8: 14000008     	b	0x42445e8 <_ChromeMain+0x423f34c>
 42445cc: f9400008     	ldr	x8, [x0]
 42445d0: f9400908     	ldr	x8, [x8, #0x10]
 42445d4: d63f0100     	blr	x8
 42445d8: 910022b5     	add	x21, x21, #0x8
 42445dc: eb1602bf     	cmp	x21, x22
 42445e0: aa1403e0     	mov	x0, x20
 42445e4: 54fff542     	b.hs	0x424448c <_ChromeMain+0x423f1f0>
 42445e8: f94002a0     	ldr	x0, [x21]
 42445ec: b4ffff60     	cbz	x0, 0x42445d8 <_ChromeMain+0x423f33c>
 42445f0: 91002008     	add	x8, x0, #0x8
 42445f4: b8f70108     	ldaddal	w23, w8, [x8]
 42445f8: 7100051f     	cmp	w8, #0x1
 42445fc: 54fffee1     	b.ne	0x42445d8 <_ChromeMain+0x423f33c>
 4244600: 17fffff3     	b	0x42445cc <_ChromeMain+0x423f330>
 4244604: f9401008     	ldr	x8, [x0, #0x20]
 4244608: aa0003f4     	mov	x20, x0
 424460c: aa0803e0     	mov	x0, x8
 4244610: 96f97879     	bl	0xa27f4 <_ChromeMain+0x9d558>
 4244614: aa1403e0     	mov	x0, x20
 4244618: 17ffff9f     	b	0x4244494 <_ChromeMain+0x423f1f8>
 424461c: f9400288     	ldr	x8, [x20]
 4244620: aa0003f5     	mov	x21, x0
 4244624: aa0803e0     	mov	x0, x8
 4244628: 94f79fe6     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 424462c: aa1403e0     	mov	x0, x20
 4244630: 52800101     	mov	w1, #0x8                ; =8
 4244634: 96f71221     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4244638: aa1503e0     	mov	x0, x21
 424463c: 17ffff98     	b	0x424449c <_ChromeMain+0x423f200>
 4244640: 3958c008     	ldrb	w8, [x0, #0x630]
 4244644: 6b01011f     	cmp	w8, w1
 4244648: 54000f20     	b.eq	0x424482c <_ChromeMain+0x423f590>
