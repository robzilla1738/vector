
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 a6ea180: d101c3ff     	sub	sp, sp, #0x70
 a6ea184: a90457f6     	stp	x22, x21, [sp, #0x40]
 a6ea188: a9054ff4     	stp	x20, x19, [sp, #0x50]
 a6ea18c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 a6ea190: 910183fd     	add	x29, sp, #0x60
 a6ea194: aa0103f4     	mov	x20, x1
 a6ea198: aa0003f3     	mov	x19, x0
 a6ea19c: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 a6ea1a0: f9001fff     	str	xzr, [sp, #0x38]
 a6ea1a4: f9400008     	ldr	x8, [x0]
 a6ea1a8: f9403108     	ldr	x8, [x8, #0x60]
 a6ea1ac: d63f0100     	blr	x8
 a6ea1b0: b4000100     	cbz	x0, 0xa6ea1d0 <_ChromeMain+0xa6e4f34>
 a6ea1b4: f9400268     	ldr	x8, [x19]
 a6ea1b8: f9403108     	ldr	x8, [x8, #0x60]
 a6ea1bc: aa1303e0     	mov	x0, x19
 a6ea1c0: d63f0100     	blr	x8
 a6ea1c4: 9100a3e8     	add	x8, sp, #0x28
 a6ea1c8: 97ffe706     	bl	0xa6e3de0 <_ChromeMain+0xa6deb44>
 a6ea1cc: 14000006     	b	0xa6ea1e4 <_ChromeMain+0xa6e4f48>
 a6ea1d0: d00187c1     	adrp	x1, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 a6ea1d4: 911d3021     	add	x1, x1, #0x74c
 a6ea1d8: 9100a3e0     	add	x0, sp, #0x28
 a6ea1dc: 910003e2     	mov	x2, sp
 a6ea1e0: 94926f35     	bl	0xcb85eb4 <_ChromeMain+0xcb80c18>
 a6ea1e4: f90013ff     	str	xzr, [sp, #0x20]
 a6ea1e8: b0024628     	adrp	x8, 0xefaf000 <dyld_stub_binder+0xefaf000>
 a6ea1ec: 9104a108     	add	x8, x8, #0x128
 a6ea1f0: 38bfc108     	ldaprb	w8, [x8]
 a6ea1f4: b0024635     	adrp	x21, 0xefaf000 <dyld_stub_binder+0xefaf000>
 a6ea1f8: 36000a68     	tbz	w8, #0x0, 0xa6ea344 <_ChromeMain+0xa6e50a8>
 a6ea1fc: f94092a1     	ldr	x1, [x21, #0x120]
 a6ea200: 3980ffe8     	ldrsb	x8, [sp, #0x3f]
 a6ea204: 9100a3e9     	add	x9, sp, #0x28
 a6ea208: a942afea     	ldp	x10, x11, [sp, #0x28]
 a6ea20c: f100011f     	cmp	x8, #0x0
 a6ea210: 9a894142     	csel	x2, x10, x9, mi
 a6ea214: 7100011f     	cmp	w8, #0x0
 a6ea218: 9a884163     	csel	x3, x11, x8, mi
 a6ea21c: 910083e0     	add	x0, sp, #0x20
 a6ea220: 949263d6     	bl	0xcb83178 <_ChromeMain+0xcb7dedc>
 a6ea224: aa1303e0     	mov	x0, x19
 a6ea228: 97ffff6a     	bl	0xa6e9fd0 <_ChromeMain+0xa6e4d34>
 a6ea22c: b4000a60     	cbz	x0, 0xa6ea378 <_ChromeMain+0xa6e50dc>
 a6ea230: aa1303e0     	mov	x0, x19
 a6ea234: 97ffff67     	bl	0xa6e9fd0 <_ChromeMain+0xa6e4d34>
 a6ea238: aa0003f5     	mov	x21, x0
 a6ea23c: aa1303e0     	mov	x0, x19
 a6ea240: 97ffff64     	bl	0xa6e9fd0 <_ChromeMain+0xa6e4d34>
 a6ea244: b941b808     	ldr	w8, [x0, #0x1b8]
 a6ea248: 340005c8     	cbz	w8, 0xa6ea300 <_ChromeMain+0xa6e5064>
 a6ea24c: b9418ea9     	ldr	w9, [x21, #0x18c]
 a6ea250: b94196aa     	ldr	w10, [x21, #0x194]
 a6ea254: 0b0a0129     	add	w9, w9, w10
 a6ea258: 4b090114     	sub	w20, w8, w9
 a6ea25c: b2600288     	orr	x8, x20, #0x100000000
 a6ea260: a9007fe8     	stp	x8, xzr, [sp]
 a6ea264: 910003e1     	mov	x1, sp
 a6ea268: aa1303e0     	mov	x0, x19
 a6ea26c: 97fff693     	bl	0xa6e7cb8 <_ChromeMain+0xa6e2a1c>
 a6ea270: f9000fe0     	str	x0, [sp, #0x18]
 a6ea274: 0ab47e88     	bic	w8, w20, w20, asr #31
 a6ea278: b9001be8     	str	w8, [sp, #0x18]
 a6ea27c: b9418ea8     	ldr	w8, [x21, #0x18c]
 a6ea280: b94196a9     	ldr	w9, [x21, #0x194]
 a6ea284: b9418aaa     	ldr	w10, [x21, #0x188]
 a6ea288: b94192ab     	ldr	w11, [x21, #0x190]
 a6ea28c: 910063e0     	add	x0, sp, #0x18
 a6ea290: 0b080121     	add	w1, w9, w8
 a6ea294: 0b0a0162     	add	w2, w11, w10
 a6ea298: 96702e28     	bl	0x42f5b38 <_ChromeMain+0x42f089c>
 a6ea29c: f941ae60     	ldr	x0, [x19, #0x358]
 a6ea2a0: d0016ec1     	adrp	x1, 0xd4c4000 <dyld_stub_binder+0xd4c4000>
 a6ea2a4: 910bd021     	add	x1, x1, #0x2f4
 a6ea2a8: 94928cfd     	bl	0xcb8d69c <_ChromeMain+0xcb88400>
 a6ea2ac: aa0003f3     	mov	x19, x0
 a6ea2b0: 294357f4     	ldp	w20, w21, [sp, #0x18]
 a6ea2b4: 910083e0     	add	x0, sp, #0x20
 a6ea2b8: 94927043     	bl	0xcb863c4 <_ChromeMain+0xcb81128>
 a6ea2bc: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 a6ea2c0: 36f800a8     	tbz	w8, #0x1f, 0xa6ea2d4 <_ChromeMain+0xa6e5038>
 a6ea2c4: f94017e0     	ldr	x0, [sp, #0x28]
 a6ea2c8: f9401fe8     	ldr	x8, [sp, #0x38]
 a6ea2cc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 a6ea2d0: 94926158     	bl	0xcb82830 <_ChromeMain+0xcb7d594>
 a6ea2d4: 8b5382a8     	add	x8, x21, x19, lsr #32
 a6ea2d8: 0aa87d08     	bic	w8, w8, w8, asr #31
 a6ea2dc: 6b13029f     	cmp	w20, w19
 a6ea2e0: 1a93c289     	csel	w9, w20, w19, gt
 a6ea2e4: 0aa97d29     	bic	w9, w9, w9, asr #31
 a6ea2e8: aa088120     	orr	x0, x9, x8, lsl #32
 a6ea2ec: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 a6ea2f0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 a6ea2f4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 a6ea2f8: 9101c3ff     	add	sp, sp, #0x70
 a6ea2fc: d65f03c0     	ret
 a6ea300: 3dc00280     	ldr	q0, [x20]
 a6ea304: 3d8003e0     	str	q0, [sp]
 a6ea308: b9418ea8     	ldr	w8, [x21, #0x18c]
 a6ea30c: b94196a9     	ldr	w9, [x21, #0x194]
 a6ea310: 0b090108     	add	w8, w8, w9
 a6ea314: 4b0803e1     	neg	w1, w8
 a6ea318: b9418aa8     	ldr	w8, [x21, #0x188]
 a6ea31c: b94192a9     	ldr	w9, [x21, #0x190]
 a6ea320: 0b090108     	add	w8, w8, w9
 a6ea324: 4b0803e2     	neg	w2, w8
 a6ea328: 910003e0     	mov	x0, sp
 a6ea32c: 9674140d     	bl	0x43ef360 <_ChromeMain+0x43ea0c4>
 a6ea330: 910003e1     	mov	x1, sp
 a6ea334: aa1303e0     	mov	x0, x19
 a6ea338: 97fff660     	bl	0xa6e7cb8 <_ChromeMain+0xa6e2a1c>
 a6ea33c: f9000fe0     	str	x0, [sp, #0x18]
 a6ea340: 17ffffcf     	b	0xa6ea27c <_ChromeMain+0xa6e4fe0>
 a6ea344: b0024620     	adrp	x0, 0xefaf000 <dyld_stub_binder+0xefaf000>
 a6ea348: 9104a000     	add	x0, x0, #0x128
 a6ea34c: 94912cb8     	bl	0xcb3562c <_ChromeMain+0xcb30390>
 a6ea350: 34fff560     	cbz	w0, 0xa6ea1fc <_ChromeMain+0xa6e4f60>
 a6ea354: f001b2c0     	adrp	x0, 0xdd45000 <dyld_stub_binder+0xdd45000>
 a6ea358: 913a5000     	add	x0, x0, #0xe94
 a6ea35c: 52800401     	mov	w1, #0x20               ; =32
 a6ea360: 94928330     	bl	0xcb8b020 <_ChromeMain+0xcb85d84>
 a6ea364: f90092a0     	str	x0, [x21, #0x120]
 a6ea368: b0024620     	adrp	x0, 0xefaf000 <dyld_stub_binder+0xefaf000>
 a6ea36c: 9104a000     	add	x0, x0, #0x128
 a6ea370: 94912d03     	bl	0xcb3577c <_ChromeMain+0xcb304e0>
 a6ea374: 17ffffa2     	b	0xa6ea1fc <_ChromeMain+0xa6e4f60>
 a6ea378: d4200000     	brk	#0
