
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
