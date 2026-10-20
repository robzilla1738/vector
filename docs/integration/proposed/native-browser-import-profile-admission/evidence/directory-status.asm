
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426793c: d10603ff     	sub	sp, sp, #0x180
 4267940: a91557f6     	stp	x22, x21, [sp, #0x150]
 4267944: a9164ff4     	stp	x20, x19, [sp, #0x160]
 4267948: a9177bfd     	stp	x29, x30, [sp, #0x170]
 426794c: 9105c3fd     	add	x29, sp, #0x170
 4267950: aa0203f3     	mov	x19, x2
 4267954: aa0103f4     	mov	x20, x1
 4267958: f9002bff     	str	xzr, [sp, #0x50]
 426795c: 6f00e400     	movi.2d	v0, #0000000000000000
 4267960: ad0183e0     	stp	q0, q0, [sp, #0x30]
 4267964: 910003e8     	mov	x8, sp
 4267968: 97ffe1e5     	bl	0x42600fc <_ChromeMain+0x425ae60>
 426796c: 39805e82     	ldrsb	x2, [x20, #0x17]
 4267970: b6f80042     	tbz	x2, #0x3f, 0x4267978 <_ChromeMain+0x42626dc>
 4267974: a9400a94     	ldp	x20, x2, [x20]
 4267978: 910063f5     	add	x21, sp, #0x18
 426797c: 910063e8     	add	x8, sp, #0x18
 4267980: 910003e0     	mov	x0, sp
 4267984: aa1403e1     	mov	x1, x20
 4267988: 9750c6a3     	bl	0x1699414 <_ChromeMain+0x1694178>
 426798c: 6f00e400     	movi.2d	v0, #0000000000000000
 4267990: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 4267994: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 4267998: ad0483e0     	stp	q0, q0, [sp, #0x90]
 426799c: ad0383e0     	stp	q0, q0, [sp, #0x70]
 42679a0: 3d801be0     	str	q0, [sp, #0x60]
 42679a4: ad3e03a0     	stp	q0, q0, [x29, #-0x40]
 42679a8: ad3d03a0     	stp	q0, q0, [x29, #-0x60]
 42679ac: f004c800     	adrp	x0, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 42679b0: 91190800     	add	x0, x0, #0x642
 42679b4: f004c801     	adrp	x1, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 42679b8: 9116ac21     	add	x1, x1, #0x5ab
 42679bc: d10203a8     	sub	x8, x29, #0x80
 42679c0: 52805a22     	mov	w2, #0x2d1              ; =721
 42679c4: 96f7a4af     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42679c8: d10183a0     	sub	x0, x29, #0x60
 42679cc: d10203a1     	sub	x1, x29, #0x80
 42679d0: 52800002     	mov	w2, #0x0                ; =0
 42679d4: 9718a70c     	bl	0x891604 <_ChromeMain+0x88c368>
 42679d8: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 42679dc: f9400fe9     	ldr	x9, [sp, #0x18]
 42679e0: 7100011f     	cmp	w8, #0x0
 42679e4: 9a954120     	csel	x0, x9, x21, mi
 42679e8: 910183e1     	add	x1, sp, #0x60
 42679ec: 951218a6     	bl	0x86edc84 <_ChromeMain+0x86e89e8>
 42679f0: aa0003f4     	mov	x20, x0
 42679f4: d10183a0     	sub	x0, x29, #0x60
 42679f8: 97201c63     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 42679fc: 35000094     	cbnz	w20, 0x4267a0c <_ChromeMain+0x4262770>
 4267a00: 9100c3e0     	add	x0, sp, #0x30
 4267a04: 910183e1     	add	x1, sp, #0x60
 4267a08: 972d62a2     	bl	0xdc0490 <_ChromeMain+0xdbb1f4>
 4267a0c: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4267a10: 37f80328     	tbnz	w8, #0x1f, 0x4267a74 <_ChromeMain+0x42627d8>
 4267a14: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4267a18: 37f80208     	tbnz	w8, #0x1f, 0x4267a58 <_ChromeMain+0x42627bc>
 4267a1c: 34000294     	cbz	w20, 0x4267a6c <_ChromeMain+0x42627d0>
 4267a20: 94f684c5     	bl	0x8008d34 <_ChromeMain+0x8003a98>
 4267a24: 52800008     	mov	w8, #0x0                ; =0
 4267a28: b9400009     	ldr	w9, [x0]
 4267a2c: 7100053f     	cmp	w9, #0x1
 4267a30: 1a9f17e9     	cset	w9, eq
 4267a34: 3940026a     	ldrb	w10, [x19]
 4267a38: 2a090149     	orr	w9, w10, w9
 4267a3c: 39000269     	strb	w9, [x19]
 4267a40: 12000100     	and	w0, w8, #0x1
 4267a44: a9577bfd     	ldp	x29, x30, [sp, #0x170]
 4267a48: a9564ff4     	ldp	x20, x19, [sp, #0x160]
 4267a4c: a95557f6     	ldp	x22, x21, [sp, #0x150]
 4267a50: 910603ff     	add	sp, sp, #0x180
 4267a54: d65f03c0     	ret
 4267a58: f94003e0     	ldr	x0, [sp]
 4267a5c: f9400be8     	ldr	x8, [sp, #0x10]
 4267a60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4267a64: 96f68515     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267a68: 35fffdd4     	cbnz	w20, 0x4267a20 <_ChromeMain+0x4262784>
 4267a6c: 3940e3e8     	ldrb	w8, [sp, #0x38]
 4267a70: 17fffff4     	b	0x4267a40 <_ChromeMain+0x42627a4>
 4267a74: f9400fe0     	ldr	x0, [sp, #0x18]
 4267a78: f94017e8     	ldr	x8, [sp, #0x28]
 4267a7c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4267a80: 96f6850e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267a84: 17ffffe4     	b	0x4267a14 <_ChromeMain+0x4262778>
