
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4689968: 39472008     	ldrb	w8, [x0, #0x1c8]
 468996c: 35000068     	cbnz	w8, 0x4689978 <_ChromeMain+0x46846dc>
 4689970: 52800000     	mov	w0, #0x0                ; =0
 4689974: d65f03c0     	ret
 4689978: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 468997c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4689980: 910043fd     	add	x29, sp, #0x10
 4689984: aa0003f3     	mov	x19, x0
 4689988: 9726597a     	bl	0x101ff70 <_ChromeMain+0x101acd4>
 468998c: f8418c08     	ldr	x8, [x0, #0x18]!
 4689990: b4000208     	cbz	x8, 0x46899d0 <_ChromeMain+0x4684734>
 4689994: b9458269     	ldr	w9, [x19, #0x580]
 4689998: b940210a     	ldr	w10, [x8, #0x20]
 468999c: 6b0a013f     	cmp	w9, w10
 46899a0: 5400014b     	b.lt	0x46899c8 <_ChromeMain+0x468472c>
 46899a4: 540001ac     	b.gt	0x46899d8 <_ChromeMain+0x468473c>
 46899a8: eb00011f     	cmp	x8, x0
 46899ac: 54000120     	b.eq	0x46899d0 <_ChromeMain+0x4684734>
 46899b0: f9401508     	ldr	x8, [x8, #0x28]
 46899b4: f100011f     	cmp	x8, #0x0
 46899b8: 1a9f07e0     	cset	w0, ne
 46899bc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46899c0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46899c4: d65f03c0     	ret
 46899c8: f9400108     	ldr	x8, [x8]
 46899cc: b5fffe68     	cbnz	x8, 0x4689998 <_ChromeMain+0x46846fc>
 46899d0: 52800000     	mov	w0, #0x0                ; =0
 46899d4: 17fffffa     	b	0x46899bc <_ChromeMain+0x4684720>
 46899d8: f9400508     	ldr	x8, [x8, #0x8]
 46899dc: b4ffffa8     	cbz	x8, 0x46899d0 <_ChromeMain+0x4684734>
 46899e0: 17ffffee     	b	0x4689998 <_ChromeMain+0x46846fc>
 46899e4: 00000000     	udf	#0x0
 46899e8: d1002000     	sub	x0, x0, #0x8
 46899ec: 17fffd50     	b	0x4688f2c <_ChromeMain+0x4683c90>
		...
 4689a00: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4689a04: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4689a08: 910043fd     	add	x29, sp, #0x10
 4689a0c: d1002013     	sub	x19, x0, #0x8
 4689a10: aa1303e0     	mov	x0, x19
 4689a14: 97fffd46     	bl	0x4688f2c <_ChromeMain+0x4683c90>
 4689a18: b0054408     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4689a1c: 91120108     	add	x8, x8, #0x480
 4689a20: f8bfc100     	ldapr	x0, [x8]
 4689a24: b40000a0     	cbz	x0, 0x4689a38 <_ChromeMain+0x468479c>
 4689a28: aa1303e1     	mov	x1, x19
 4689a2c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4689a30: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4689a34: 17234c3b     	b	0xf5cb20 <_ChromeMain+0xf57884>
 4689a38: 97f12730     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4689a3c: 17fffffb     	b	0x4689a28 <_ChromeMain+0x468478c>
 4689a40: d1004000     	sub	x0, x0, #0x10
 4689a44: 17fffd3a     	b	0x4688f2c <_ChromeMain+0x4683c90>
 4689a48: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4689a4c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4689a50: 910043fd     	add	x29, sp, #0x10
 4689a54: d1004013     	sub	x19, x0, #0x10
 4689a58: aa1303e0     	mov	x0, x19
 4689a5c: 97fffd34     	bl	0x4688f2c <_ChromeMain+0x4683c90>
 4689a60: b0054408     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4689a64: 91120108     	add	x8, x8, #0x480
 4689a68: f8bfc100     	ldapr	x0, [x8]
 4689a6c: b40000a0     	cbz	x0, 0x4689a80 <_ChromeMain+0x46847e4>
 4689a70: aa1303e1     	mov	x1, x19
 4689a74: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4689a78: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4689a7c: 17234c29     	b	0xf5cb20 <_ChromeMain+0xf57884>
 4689a80: 97f1271e     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
