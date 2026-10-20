
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4609b08: 7100043f     	cmp	w1, #0x1
 4609b0c: 54000060     	b.eq	0x4609b18 <_ChromeMain+0x460487c>
 4609b10: 52800008     	mov	w8, #0x0                ; =0
 4609b14: 14000002     	b	0x4609b1c <_ChromeMain+0x4604880>
 4609b18: 3945c008     	ldrb	w8, [x0, #0x170]
 4609b1c: 12000100     	and	w0, w8, #0x1
 4609b20: d65f03c0     	ret
 4609b24: 7100043f     	cmp	w1, #0x1
 4609b28: 54000521     	b.ne	0x4609bcc <_ChromeMain+0x4604930>
 4609b2c: d10283ff     	sub	sp, sp, #0xa0
 4609b30: a9084ff4     	stp	x20, x19, [sp, #0x80]
 4609b34: a9097bfd     	stp	x29, x30, [sp, #0x90]
 4609b38: 910243fd     	add	x29, sp, #0x90
 4609b3c: aa0003f3     	mov	x19, x0
 4609b40: f941a008     	ldr	x8, [x0, #0x340]
 4609b44: b40003e8     	cbz	x8, 0x4609bc0 <_ChromeMain+0x4604924>
 4609b48: 3952a269     	ldrb	w9, [x19, #0x4a8]
 4609b4c: 340003a9     	cbz	w9, 0x4609bc0 <_ChromeMain+0x4604924>
 4609b50: f9403500     	ldr	x0, [x8, #0x68]
 4609b54: 91124261     	add	x1, x19, #0x490
 4609b58: 97ef2cf2     	bl	0x41d4f20 <_ChromeMain+0x41cfc84>
 4609b5c: 910023f4     	add	x20, sp, #0x8
 4609b60: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4609b64: b801f3ff     	stur	wzr, [sp, #0x1f]
 4609b68: f9000fff     	str	xzr, [sp, #0x18]
 4609b6c: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 4609b70: 3c8283e0     	stur	q0, [sp, #0x28]
 4609b74: 3c8383e0     	stur	q0, [sp, #0x38]
 4609b78: 3c8483e0     	stur	q0, [sp, #0x48]
 4609b7c: 3c8583e0     	stur	q0, [sp, #0x58]
 4609b80: 7900d3ff     	strh	wzr, [sp, #0x68]
 4609b84: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 4609b88: 91124260     	add	x0, x19, #0x490
 4609b8c: 910023e1     	add	x1, sp, #0x8
 4609b90: 96ffbfd4     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 4609b94: 9101c280     	add	x0, x20, #0x70
 4609b98: d2800001     	mov	x1, #0x0                ; =0
 4609b9c: 96e87847     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4609ba0: 91008280     	add	x0, x20, #0x20
 4609ba4: 96e87835     	bl	0x27c78 <_ChromeMain+0x229dc>
 4609ba8: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4609bac: 36f800a8     	tbz	w8, #0x1f, 0x4609bc0 <_ChromeMain+0x4604924>
 4609bb0: f94007e0     	ldr	x0, [sp, #0x8]
 4609bb4: f9400fe8     	ldr	x8, [sp, #0x18]
 4609bb8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4609bbc: 96e7fcbf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4609bc0: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 4609bc4: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 4609bc8: 910283ff     	add	sp, sp, #0xa0
 4609bcc: d65f03c0     	ret
 4609bd0: 7100043f     	cmp	w1, #0x1
 4609bd4: 54000521     	b.ne	0x4609c78 <_ChromeMain+0x46049dc>
 4609bd8: d10283ff     	sub	sp, sp, #0xa0
 4609bdc: a9084ff4     	stp	x20, x19, [sp, #0x80]
 4609be0: a9097bfd     	stp	x29, x30, [sp, #0x90]
 4609be4: 910243fd     	add	x29, sp, #0x90
 4609be8: aa0003f3     	mov	x19, x0
 4609bec: f9400408     	ldr	x8, [x0, #0x8]
 4609bf0: b40003e8     	cbz	x8, 0x4609c6c <_ChromeMain+0x46049d0>
 4609bf4: 3945c269     	ldrb	w9, [x19, #0x170]
 4609bf8: 340003a9     	cbz	w9, 0x4609c6c <_ChromeMain+0x46049d0>
 4609bfc: f9403500     	ldr	x0, [x8, #0x68]
 4609c00: 91056261     	add	x1, x19, #0x158
 4609c04: 97ef2cc7     	bl	0x41d4f20 <_ChromeMain+0x41cfc84>
 4609c08: 910023f4     	add	x20, sp, #0x8
 4609c0c: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4609c10: b801f3ff     	stur	wzr, [sp, #0x1f]
 4609c14: f9000fff     	str	xzr, [sp, #0x18]
 4609c18: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 4609c1c: 3c8283e0     	stur	q0, [sp, #0x28]
 4609c20: 3c8383e0     	stur	q0, [sp, #0x38]
 4609c24: 3c8483e0     	stur	q0, [sp, #0x48]
 4609c28: 3c8583e0     	stur	q0, [sp, #0x58]
 4609c2c: 7900d3ff     	strh	wzr, [sp, #0x68]
 4609c30: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 4609c34: 91056260     	add	x0, x19, #0x158
 4609c38: 910023e1     	add	x1, sp, #0x8
 4609c3c: 96ffbfa9     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 4609c40: 9101c280     	add	x0, x20, #0x70
 4609c44: d2800001     	mov	x1, #0x0                ; =0
 4609c48: 96e8781c     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4609c4c: 91008280     	add	x0, x20, #0x20
 4609c50: 96e8780a     	bl	0x27c78 <_ChromeMain+0x229dc>
 4609c54: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4609c58: 36f800a8     	tbz	w8, #0x1f, 0x4609c6c <_ChromeMain+0x46049d0>
 4609c5c: f94007e0     	ldr	x0, [sp, #0x8]
 4609c60: f9400fe8     	ldr	x8, [sp, #0x18]
 4609c64: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4609c68: 96e7fc94     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4609c6c: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 4609c70: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 4609c74: 910283ff     	add	sp, sp, #0xa0
 4609c78: d65f03c0     	ret
 4609c7c: d10283ff     	sub	sp, sp, #0xa0
 4609c80: a9084ff4     	stp	x20, x19, [sp, #0x80]
 4609c84: a9097bfd     	stp	x29, x30, [sp, #0x90]
 4609c88: 910243fd     	add	x29, sp, #0x90
 4609c8c: aa0003f3     	mov	x19, x0
 4609c90: f9423400     	ldr	x0, [x0, #0x468]
 4609c94: eb00003f     	cmp	x1, x0
 4609c98: 540000a0     	b.eq	0x4609cac <_ChromeMain+0x4604a10>
 4609c9c: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 4609ca0: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 4609ca4: 910283ff     	add	sp, sp, #0xa0
 4609ca8: d65f03c0     	ret
 4609cac: f9423a74     	ldr	x20, [x19, #0x470]
 4609cb0: f9023a7f     	str	xzr, [x19, #0x470]
 4609cb4: b40000d4     	cbz	x20, 0x4609ccc <_ChromeMain+0x4604a30>
 4609cb8: aa1403e0     	mov	x0, x20
 4609cbc: 978ac498     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 4609cc0: 52800301     	mov	w1, #0x18               ; =24
 4609cc4: 96e7fc7d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4609cc8: f9423660     	ldr	x0, [x19, #0x468]
 4609ccc: f902367f     	str	xzr, [x19, #0x468]
 4609cd0: b4000080     	cbz	x0, 0x4609ce0 <_ChromeMain+0x4604a44>
 4609cd4: f9400008     	ldr	x8, [x0]
 4609cd8: f9400508     	ldr	x8, [x8, #0x8]
 4609cdc: d63f0100     	blr	x8
 4609ce0: 910023f4     	add	x20, sp, #0x8
 4609ce4: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4609ce8: b801f3ff     	stur	wzr, [sp, #0x1f]
 4609cec: f9000fff     	str	xzr, [sp, #0x18]
 4609cf0: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 4609cf4: 3c8283e0     	stur	q0, [sp, #0x28]
 4609cf8: 3c8383e0     	stur	q0, [sp, #0x38]
 4609cfc: 3c8483e0     	stur	q0, [sp, #0x48]
 4609d00: 3c8583e0     	stur	q0, [sp, #0x58]
 4609d04: 7900d3ff     	strh	wzr, [sp, #0x68]
 4609d08: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 4609d0c: 91124260     	add	x0, x19, #0x490
 4609d10: 910023e1     	add	x1, sp, #0x8
 4609d14: 96ffbf73     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 4609d18: 9101c280     	add	x0, x20, #0x70
 4609d1c: d2800001     	mov	x1, #0x0                ; =0
 4609d20: 96e877e6     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4609d24: 91008280     	add	x0, x20, #0x20
 4609d28: 96e877d4     	bl	0x27c78 <_ChromeMain+0x229dc>
 4609d2c: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4609d30: 36fffb68     	tbz	w8, #0x1f, 0x4609c9c <_ChromeMain+0x4604a00>
 4609d34: f94007e0     	ldr	x0, [sp, #0x8]
 4609d38: f9400fe8     	ldr	x8, [sp, #0x18]
 4609d3c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4609d40: 96e7fc5e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4609d44: 17ffffd6     	b	0x4609c9c <_ChromeMain+0x4604a00>
 4609d48: d10ce000     	sub	x0, x0, #0x338
 4609d4c: 17ffffcc     	b	0x4609c7c <_ChromeMain+0x46049e0>
 4609d50: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
