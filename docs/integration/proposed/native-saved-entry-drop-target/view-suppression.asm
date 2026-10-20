
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4132e90: 6dbc23e9     	stp	d9, d8, [sp, #-0x40]!
 4132e94: a90157f6     	stp	x22, x21, [sp, #0x10]
 4132e98: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4132e9c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4132ea0: 9100c3fd     	add	x29, sp, #0x30
 4132ea4: 39586808     	ldrb	w8, [x0, #0x61a]
 4132ea8: 6b01011f     	cmp	w8, w1
 4132eac: 540000c1     	b.ne	0x4132ec4 <_ChromeMain+0x412dc28>
 4132eb0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4132eb4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4132eb8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4132ebc: 6cc423e9     	ldp	d9, d8, [sp], #0x40
 4132ec0: d65f03c0     	ret
 4132ec4: aa0003f3     	mov	x19, x0
 4132ec8: 39186801     	strb	w1, [x0, #0x61a]
 4132ecc: f9401014     	ldr	x20, [x0, #0x20]
 4132ed0: 350001e1     	cbnz	w1, 0x4132f0c <_ChromeMain+0x412dc70>
 4132ed4: b4000114     	cbz	x20, 0x4132ef4 <_ChromeMain+0x412dc58>
 4132ed8: 39588268     	ldrb	w8, [x19, #0x620]
 4132edc: 340000c8     	cbz	w8, 0x4132ef4 <_ChromeMain+0x412dc58>
 4132ee0: bd461e68     	ldr	s8, [x19, #0x61c]
 4132ee4: f940b280     	ldr	x0, [x20, #0x160]
 4132ee8: b40008c0     	cbz	x0, 0x4133000 <_ChromeMain+0x412dd64>
 4132eec: 4ea81d00     	mov.16b	v0, v8
 4132ef0: 97670712     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 4132ef4: 39588268     	ldrb	w8, [x19, #0x620]
 4132ef8: 34000228     	cbz	w8, 0x4132f3c <_ChromeMain+0x412dca0>
 4132efc: 3918827f     	strb	wzr, [x19, #0x620]
 4132f00: 1400000f     	b	0x4132f3c <_ChromeMain+0x412dca0>
 4132f04: 1e2e1000     	fmov	s0, #1.00000000
 4132f08: 14000006     	b	0x4132f20 <_ChromeMain+0x412dc84>
 4132f0c: b4000194     	cbz	x20, 0x4132f3c <_ChromeMain+0x412dca0>
 4132f10: f940b688     	ldr	x8, [x20, #0x168]
 4132f14: f9401108     	ldr	x8, [x8, #0x20]
 4132f18: b4ffff68     	cbz	x8, 0x4132f04 <_ChromeMain+0x412dc68>
 4132f1c: bd401900     	ldr	s0, [x8, #0x18]
 4132f20: bd061e60     	str	s0, [x19, #0x61c]
 4132f24: 52800028     	mov	w8, #0x1                ; =1
 4132f28: 39188268     	strb	w8, [x19, #0x620]
 4132f2c: f940b280     	ldr	x0, [x20, #0x160]
 4132f30: b40004a0     	cbz	x0, 0x4132fc4 <_ChromeMain+0x412dd28>
 4132f34: 6f00e400     	movi.2d	v0, #0000000000000000
 4132f38: 97670700     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 4132f3c: aa1303e0     	mov	x0, x19
 4132f40: 9711b88f     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4132f44: f940c673     	ldr	x19, [x19, #0x188]
 4132f48: b4fffb53     	cbz	x19, 0x4132eb0 <_ChromeMain+0x412dc14>
 4132f4c: aa1303e0     	mov	x0, x19
 4132f50: 9711b88b     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4132f54: f9400268     	ldr	x8, [x19]
 4132f58: f9402d08     	ldr	x8, [x8, #0x58]
 4132f5c: aa1303e0     	mov	x0, x19
 4132f60: d63f0100     	blr	x8
 4132f64: 94ddb566     	bl	0x78a04fc <_ChromeMain+0x789b260>
 4132f68: f9400268     	ldr	x8, [x19]
 4132f6c: f9402d08     	ldr	x8, [x8, #0x58]
 4132f70: aa1303e0     	mov	x0, x19
 4132f74: d63f0100     	blr	x8
 4132f78: aa0003f4     	mov	x20, x0
 4132f7c: 94dde367     	bl	0x78abd18 <_ChromeMain+0x78a6a7c>
 4132f80: f100029f     	cmp	x20, #0x0
 4132f84: 1a9f07e8     	cset	w8, ne
 4132f88: eb00029f     	cmp	x20, x0
 4132f8c: fa401a84     	ccmp	x20, #0x0, #0x4, ne
 4132f90: 540000c0     	b.eq	0x4132fa8 <_ChromeMain+0x412dd0c>
 4132f94: f9402694     	ldr	x20, [x20, #0x48]
 4132f98: f100029f     	cmp	x20, #0x0
 4132f9c: 1a9f07e8     	cset	w8, ne
 4132fa0: fa401284     	ccmp	x20, x0, #0x4, ne
 4132fa4: 54ffff81     	b.ne	0x4132f94 <_ChromeMain+0x412dcf8>
 4132fa8: 34fffce8     	cbz	w8, 0x4132f44 <_ChromeMain+0x412dca8>
 4132fac: aa1303e0     	mov	x0, x19
 4132fb0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4132fb4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4132fb8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4132fbc: 6cc423e9     	ldp	d9, d8, [sp], #0x40
 4132fc0: 140af272     	b	0x43ef988 <_ChromeMain+0x43ea6ec>
 4132fc4: 52802400     	mov	w0, #0x120              ; =288
 4132fc8: 96fb70e8     	bl	0xf368 <_ChromeMain+0xa0cc>
 4132fcc: aa0003f5     	mov	x21, x0
 4132fd0: d2800001     	mov	x1, #0x0                ; =0
 4132fd4: 973d1cc1     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 4132fd8: b40000a0     	cbz	x0, 0x4132fec <_ChromeMain+0x412dd50>
 4132fdc: b9400aa8     	ldr	w8, [x21, #0x8]
 4132fe0: 31000508     	adds	w8, w8, #0x1
 4132fe4: b9000aa8     	str	w8, [x21, #0x8]
 4132fe8: 540002a2     	b.hs	0x413303c <_ChromeMain+0x412dda0>
 4132fec: aa1403e0     	mov	x0, x20
 4132ff0: aa1503e1     	mov	x1, x21
 4132ff4: 97452482     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 4132ff8: f940b280     	ldr	x0, [x20, #0x160]
 4132ffc: 17ffffce     	b	0x4132f34 <_ChromeMain+0x412dc98>
