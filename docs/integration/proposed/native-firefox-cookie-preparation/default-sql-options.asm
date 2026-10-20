
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 300f948: d10103ff     	sub	sp, sp, #0x40
 300f94c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 300f950: 9100c3fd     	add	x29, sp, #0x30
 300f954: aa0103e2     	mov	x2, x1
 300f958: 0f008420     	movi.4h	v0, #0x1
 300f95c: bd0003e0     	str	s0, [sp]
 300f960: 390013ff     	strb	wzr, [sp, #0x4]
 300f964: 52820008     	mov	w8, #0x1000             ; =4096
 300f968: f90007e8     	str	x8, [sp, #0x8]
 300f96c: 790023ff     	strh	wzr, [sp, #0x10]
 300f970: f9000fff     	str	xzr, [sp, #0x18]
 300f974: 0f000420     	movi.2s	v0, #0x1
 300f978: bd0023e0     	str	s0, [sp, #0x20]
 300f97c: f90017ff     	str	xzr, [sp, #0x28]
 300f980: 910003e1     	mov	x1, sp
 300f984: 97c78789     	bl	0x21f17a8 <_ChromeMain+0x21ec50c>
 300f988: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 300f98c: 910103ff     	add	sp, sp, #0x40
 300f990: d65f03c0     	ret
		...
 300f9c0: d10083ff     	sub	sp, sp, #0x20
 300f9c4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 300f9c8: 910043fd     	add	x29, sp, #0x10
 300f9cc: f9400008     	ldr	x8, [x0]
 300f9d0: b9400109     	ldr	w9, [x8]
 300f9d4: 11000529     	add	w9, w9, #0x1
 300f9d8: b9000109     	str	w9, [x8]
 300f9dc: f9400408     	ldr	x8, [x0, #0x8]
 300f9e0: b9400109     	ldr	w9, [x8]
 300f9e4: 11000529     	add	w9, w9, #0x1
 300f9e8: b9000109     	str	w9, [x8]
 300f9ec: f9400808     	ldr	x8, [x0, #0x10]
 300f9f0: b9400109     	ldr	w9, [x8]
 300f9f4: 11000529     	add	w9, w9, #0x1
 300f9f8: b9000109     	str	w9, [x8]
 300f9fc: f9400c08     	ldr	x8, [x0, #0x18]
 300fa00: b9400109     	ldr	w9, [x8]
 300fa04: 11000529     	add	w9, w9, #0x1
 300fa08: b9000109     	str	w9, [x8]
 300fa0c: f9400c08     	ldr	x8, [x0, #0x18]
 300fa10: 925e750a     	and	x10, x8, #0xfffffffc00000000
 300fa14: f005dd09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 300fa18: f940452b     	ldr	x11, [x9, #0x88]
 300fa1c: eb0b015f     	cmp	x10, x11
 300fa20: 54000320     	b.eq	0x300fa84 <_ChromeMain+0x300a7e8>
 300fa24: f9000c1f     	str	xzr, [x0, #0x18]
 300fa28: f9400808     	ldr	x8, [x0, #0x10]
 300fa2c: 925e750a     	and	x10, x8, #0xfffffffc00000000
 300fa30: f940452b     	ldr	x11, [x9, #0x88]
 300fa34: eb0b015f     	cmp	x10, x11
 300fa38: 54000320     	b.eq	0x300fa9c <_ChromeMain+0x300a800>
 300fa3c: f900081f     	str	xzr, [x0, #0x10]
 300fa40: f9400408     	ldr	x8, [x0, #0x8]
 300fa44: 925e750a     	and	x10, x8, #0xfffffffc00000000
 300fa48: f940452b     	ldr	x11, [x9, #0x88]
 300fa4c: eb0b015f     	cmp	x10, x11
 300fa50: 54000320     	b.eq	0x300fab4 <_ChromeMain+0x300a818>
 300fa54: f900041f     	str	xzr, [x0, #0x8]
 300fa58: f9400000     	ldr	x0, [x0]
 300fa5c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 300fa60: f9404529     	ldr	x9, [x9, #0x88]
 300fa64: eb09011f     	cmp	x8, x9
 300fa68: 54000080     	b.eq	0x300fa78 <_ChromeMain+0x300a7dc>
 300fa6c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 300fa70: 910083ff     	add	sp, sp, #0x20
 300fa74: d65f03c0     	ret
 300fa78: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 300fa7c: 910083ff     	add	sp, sp, #0x20
 300fa80: 17404bef     	b	0x22a3c <_ChromeMain+0x1d7a0>
 300fa84: f90007e0     	str	x0, [sp, #0x8]
 300fa88: aa0803e0     	mov	x0, x8
 300fa8c: 97404bec     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 300fa90: f005dd09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 300fa94: f94007e0     	ldr	x0, [sp, #0x8]
 300fa98: 17ffffe3     	b	0x300fa24 <_ChromeMain+0x300a788>
 300fa9c: f90007e0     	str	x0, [sp, #0x8]
 300faa0: aa0803e0     	mov	x0, x8
 300faa4: 97404be6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 300faa8: f005dd09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 300faac: f94007e0     	ldr	x0, [sp, #0x8]
 300fab0: 17ffffe3     	b	0x300fa3c <_ChromeMain+0x300a7a0>
 300fab4: f90007e0     	str	x0, [sp, #0x8]
 300fab8: aa0803e0     	mov	x0, x8
 300fabc: 97404be0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 300fac0: f005dd09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 300fac4: f94007e0     	ldr	x0, [sp, #0x8]
 300fac8: 17ffffe3     	b	0x300fa54 <_ChromeMain+0x300a7b8>
 300facc: d10103ff     	sub	sp, sp, #0x40
 300fad0: a9024ff4     	stp	x20, x19, [sp, #0x20]
 300fad4: a9037bfd     	stp	x29, x30, [sp, #0x30]
 300fad8: 9100c3fd     	add	x29, sp, #0x30
 300fadc: f90007e1     	str	x1, [sp, #0x8]
 300fae0: 34000602     	cbz	w2, 0x300fba0 <_ChromeMain+0x300a904>
 300fae4: aa0103f3     	mov	x19, x1
 300fae8: aa0003f4     	mov	x20, x0
 300faec: aa0303e0     	mov	x0, x3
 300faf0: 9400003b     	bl	0x300fbdc <_ChromeMain+0x300a940>
 300faf4: 52800028     	mov	w8, #0x1                ; =1
 300faf8: 39004288     	strb	w8, [x20, #0x10]
 300fafc: f9000be0     	str	x0, [sp, #0x10]
 300fb00: b40003d3     	cbz	x19, 0x300fb78 <_ChromeMain+0x300a8dc>
 300fb04: f90007ff     	str	xzr, [sp, #0x8]
 300fb08: f9400668     	ldr	x8, [x19, #0x8]
 300fb0c: 910043e2     	add	x2, sp, #0x10
 300fb10: aa1303e0     	mov	x0, x19
 300fb14: 52800021     	mov	w1, #0x1                ; =1
 300fb18: d63f0100     	blr	x8
 300fb1c: 12800008     	mov	w8, #-0x1               ; =-1
 300fb20: b8e80268     	ldaddal	w8, w8, [x19]
 300fb24: 7100051f     	cmp	w8, #0x1
 300fb28: 54000081     	b.ne	0x300fb38 <_ChromeMain+0x300a89c>
 300fb2c: f9400a68     	ldr	x8, [x19, #0x10]
 300fb30: aa1303e0     	mov	x0, x19
 300fb34: d63f0100     	blr	x8
 300fb38: f9400bf3     	ldr	x19, [sp, #0x10]
 300fb3c: f9000bff     	str	xzr, [sp, #0x10]
 300fb40: b5000233     	cbnz	x19, 0x300fb84 <_ChromeMain+0x300a8e8>
 300fb44: f94007e0     	ldr	x0, [sp, #0x8]
 300fb48: b50000a0     	cbnz	x0, 0x300fb5c <_ChromeMain+0x300a8c0>
 300fb4c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 300fb50: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 300fb54: 910103ff     	add	sp, sp, #0x40
 300fb58: d65f03c0     	ret
 300fb5c: 12800008     	mov	w8, #-0x1               ; =-1
 300fb60: b8e80008     	ldaddal	w8, w8, [x0]
 300fb64: 7100051f     	cmp	w8, #0x1
 300fb68: 54ffff21     	b.ne	0x300fb4c <_ChromeMain+0x300a8b0>
 300fb6c: f9400808     	ldr	x8, [x0, #0x10]
 300fb70: d63f0100     	blr	x8
 300fb74: 17fffff6     	b	0x300fb4c <_ChromeMain+0x300a8b0>
 300fb78: d4200000     	brk	#0
 300fb7c: d4400000     	hlt	#0
 300fb80: d4200020     	brk	#0x1
 300fb84: f9000ff3     	str	x19, [sp, #0x18]
 300fb88: 910063e0     	add	x0, sp, #0x18
 300fb8c: 94437171     	bl	0x40ec150 <_ChromeMain+0x40e6eb4>
 300fb90: aa1303e0     	mov	x0, x19
 300fb94: 52800301     	mov	w1, #0x18               ; =24
 300fb98: 973fe4c8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 300fb9c: 17ffffea     	b	0x300fb44 <_ChromeMain+0x300a8a8>
 300fba0: 52800300     	mov	w0, #0x18               ; =24
 300fba4: aa0303f4     	mov	x20, x3
 300fba8: 973ffdf0     	bl	0xf368 <_ChromeMain+0xa0cc>
 300fbac: aa0003e2     	mov	x2, x0
 300fbb0: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 300fbb4: f900001f     	str	xzr, [x0]
 300fbb8: 910023e0     	add	x0, sp, #0x8
 300fbbc: 52800001     	mov	w1, #0x0                ; =0
 300fbc0: 94437140     	bl	0x40ec0c0 <_ChromeMain+0x40e6e24>
 300fbc4: b4fffc14     	cbz	x20, 0x300fb44 <_ChromeMain+0x300a8a8>
 300fbc8: aa1403f3     	mov	x19, x20
 300fbcc: f9000ff4     	str	x20, [sp, #0x18]
 300fbd0: 910063e0     	add	x0, sp, #0x18
 300fbd4: 9443705f     	bl	0x40ebd50 <_ChromeMain+0x40e6ab4>
 300fbd8: 17ffffee     	b	0x300fb90 <_ChromeMain+0x300a8f4>
 300fbdc: a9bc6ffc     	stp	x28, x27, [sp, #-0x40]!
 300fbe0: a90157f6     	stp	x22, x21, [sp, #0x10]
 300fbe4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 300fbe8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 300fbec: 9100c3fd     	add	x29, sp, #0x30
 300fbf0: d10803ff     	sub	sp, sp, #0x200
 300fbf4: aa0003f3     	mov	x19, x0
 300fbf8: 52800300     	mov	w0, #0x18               ; =24
 300fbfc: 973ffddb     	bl	0xf368 <_ChromeMain+0xa0cc>
 300fc00: aa0003f4     	mov	x20, x0
 300fc04: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 300fc08: f900001f     	str	xzr, [x0]
 300fc0c: f9400668     	ldr	x8, [x19, #0x8]
 300fc10: 52801509     	mov	w9, #0xa8               ; =168
 300fc14: 9b097d08     	mul	x8, x8, x9
 300fc18: b5000568     	cbnz	x8, 0x300fcc4 <_ChromeMain+0x300aa28>
 300fc1c: b40000d3     	cbz	x19, 0x300fc34 <_ChromeMain+0x300a998>
 300fc20: f9400275     	ldr	x21, [x19]
 300fc24: b50001b5     	cbnz	x21, 0x300fc58 <_ChromeMain+0x300a9bc>
 300fc28: aa1303e0     	mov	x0, x19
 300fc2c: 52800301     	mov	w1, #0x18               ; =24
 300fc30: 973fe4a2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 300fc34: aa1403e0     	mov	x0, x20
 300fc38: 910803ff     	add	sp, sp, #0x200
 300fc3c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 300fc40: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 300fc44: a94157f6     	ldp	x22, x21, [sp, #0x10]
