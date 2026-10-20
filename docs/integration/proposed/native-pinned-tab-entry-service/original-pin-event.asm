
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d79ec: b4000081     	cbz	x1, 0x41d79fc <_ChromeMain+0x41d2760>
 41d79f0: 39418428     	ldrb	w8, [x1, #0x61]
 41d79f4: 34000068     	cbz	w8, 0x41d7a00 <_ChromeMain+0x41d2764>
 41d79f8: 14000003     	b	0x41d7a04 <_ChromeMain+0x41d2768>
 41d79fc: d65f03c0     	ret
 41d7a00: 140000b8     	b	0x41d7ce0 <_ChromeMain+0x41d2a44>
 41d7a04: d10303ff     	sub	sp, sp, #0xc0
 41d7a08: a90957f6     	stp	x22, x21, [sp, #0x90]
 41d7a0c: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 41d7a10: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 41d7a14: 9102c3fd     	add	x29, sp, #0xb0
 41d7a18: f9402035     	ldr	x21, [x1, #0x40]
 41d7a1c: b4000e15     	cbz	x21, 0x41d7bdc <_ChromeMain+0x41d2940>
 41d7a20: aa0103f3     	mov	x19, x1
 41d7a24: aa0003f4     	mov	x20, x0
 41d7a28: f90043ff     	str	xzr, [sp, #0x80]
 41d7a2c: 6f00e400     	movi.2d	v0, #0000000000000000
 41d7a30: ad0303e0     	stp	q0, q0, [sp, #0x60]
 41d7a34: ad0203e0     	stp	q0, q0, [sp, #0x40]
 41d7a38: ad0103e0     	stp	q0, q0, [sp, #0x20]
 41d7a3c: 3d8007e0     	str	q0, [sp, #0x10]
 41d7a40: f9414aa8     	ldr	x8, [x21, #0x290]
 41d7a44: b5000d68     	cbnz	x8, 0x41d7bf0 <_ChromeMain+0x41d2954>
 41d7a48: f94132a8     	ldr	x8, [x21, #0x260]
 41d7a4c: f9401d09     	ldr	x9, [x8, #0x38]
 41d7a50: d0fff36a     	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 41d7a54: 913c814a     	add	x10, x10, #0xf20
 41d7a58: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 41d7a5c: eb0a013f     	cmp	x9, x10
 41d7a60: 54000f61     	b.ne	0x41d7c4c <_ChromeMain+0x41d29b0>
 41d7a64: 3100051f     	cmn	w8, #0x1
 41d7a68: 54001160     	b.eq	0x41d7c94 <_ChromeMain+0x41d29f8>
 41d7a6c: f94142a9     	ldr	x9, [x21, #0x280]
 41d7a70: eb08013f     	cmp	x9, x8
 41d7a74: 54001009     	b.ls	0x41d7c74 <_ChromeMain+0x41d29d8>
 41d7a78: f9413ea9     	ldr	x9, [x21, #0x278]
 41d7a7c: f8687928     	ldr	x8, [x9, x8, lsl #3]
 41d7a80: b4001048     	cbz	x8, 0x41d7c88 <_ChromeMain+0x41d29ec>
 41d7a84: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 41d7a88: b7f80f89     	tbnz	x9, #0x3f, 0x41d7c78 <_ChromeMain+0x41d29dc>
 41d7a8c: b5000fa9     	cbnz	x9, 0x41d7c80 <_ChromeMain+0x41d29e4>
 41d7a90: f9400d08     	ldr	x8, [x8, #0x18]
 41d7a94: f9400508     	ldr	x8, [x8, #0x8]
 41d7a98: 91018101     	add	x1, x8, #0x60
 41d7a9c: 910043e0     	add	x0, sp, #0x10
 41d7aa0: 96fd893d     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d7aa4: 3940a3e8     	ldrb	w8, [sp, #0x28]
 41d7aa8: 37000288     	tbnz	w8, #0x0, 0x41d7af8 <_ChromeMain+0x41d285c>
 41d7aac: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 41d7ab0: 3100051f     	cmn	w8, #0x1
 41d7ab4: 54000fe0     	b.eq	0x41d7cb0 <_ChromeMain+0x41d2a14>
 41d7ab8: f94142a9     	ldr	x9, [x21, #0x280]
 41d7abc: eb08013f     	cmp	x9, x8
 41d7ac0: 54000da9     	b.ls	0x41d7c74 <_ChromeMain+0x41d29d8>
 41d7ac4: f9413ea9     	ldr	x9, [x21, #0x278]
 41d7ac8: f8687928     	ldr	x8, [x9, x8, lsl #3]
 41d7acc: b4000f88     	cbz	x8, 0x41d7cbc <_ChromeMain+0x41d2a20>
 41d7ad0: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 41d7ad4: b7f80e69     	tbnz	x9, #0x3f, 0x41d7ca0 <_ChromeMain+0x41d2a04>
 41d7ad8: b5000e89     	cbnz	x9, 0x41d7ca8 <_ChromeMain+0x41d2a0c>
 41d7adc: f9400d08     	ldr	x8, [x8, #0x18]
 41d7ae0: f9400508     	ldr	x8, [x8, #0x8]
 41d7ae4: 91018101     	add	x1, x8, #0x60
 41d7ae8: 910043e0     	add	x0, sp, #0x10
 41d7aec: 970bcf88     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 41d7af0: 3940a3e8     	ldrb	w8, [sp, #0x28]
 41d7af4: 340005c8     	cbz	w8, 0x41d7bac <_ChromeMain+0x41d2910>
 41d7af8: aa1403e0     	mov	x0, x20
 41d7afc: a9c62809     	ldp	x9, x10, [x0, #0x60]!
 41d7b00: b9401268     	ldr	w8, [x19, #0x10]
 41d7b04: b9000fe8     	str	w8, [sp, #0xc]
 41d7b08: d379e14b     	lsl	x11, x10, #7
 41d7b0c: b40002cb     	cbz	x11, 0x41d7b64 <_ChromeMain+0x41d28c8>
 41d7b10: 9347fd6b     	asr	x11, x11, #7
 41d7b14: aa0903e1     	mov	x1, x9
 41d7b18: d341fd6c     	lsr	x12, x11, #1
 41d7b1c: 8b0c1c2d     	add	x13, x1, x12, lsl #7
 41d7b20: b84805ae     	ldr	w14, [x13], #0x80
 41d7b24: aa6b07ef     	mvn	x15, x11, lsr #1
 41d7b28: 8b0f016b     	add	x11, x11, x15
 41d7b2c: 6b0801df     	cmp	w14, w8
 41d7b30: 9a8cb16b     	csel	x11, x11, x12, lt
 41d7b34: 9a81b1a1     	csel	x1, x13, x1, lt
 41d7b38: b5ffff0b     	cbnz	x11, 0x41d7b18 <_ChromeMain+0x41d287c>
 41d7b3c: 8b0a1d29     	add	x9, x9, x10, lsl #7
 41d7b40: eb09003f     	cmp	x1, x9
 41d7b44: 54000140     	b.eq	0x41d7b6c <_ChromeMain+0x41d28d0>
 41d7b48: b9400029     	ldr	w9, [x1]
 41d7b4c: 6b09011f     	cmp	w8, w9
 41d7b50: 540000eb     	b.lt	0x41d7b6c <_ChromeMain+0x41d28d0>
 41d7b54: 91002020     	add	x0, x1, #0x8
 41d7b58: 910043e1     	add	x1, sp, #0x10
 41d7b5c: 970bcf6c     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 41d7b60: 14000006     	b	0x41d7b78 <_ChromeMain+0x41d28dc>
 41d7b64: aa0903e1     	mov	x1, x9
 41d7b68: 17fffff5     	b	0x41d7b3c <_ChromeMain+0x41d28a0>
 41d7b6c: 910033e2     	add	x2, sp, #0xc
 41d7b70: 910043e3     	add	x3, sp, #0x10
 41d7b74: 940003b9     	bl	0x41d8a58 <_ChromeMain+0x41d37bc>
 41d7b78: f9402260     	ldr	x0, [x19, #0x40]
 41d7b7c: 910043e1     	add	x1, sp, #0x10
 41d7b80: 940e004d     	bl	0x4557cb4 <_ChromeMain+0x4552a18>
 41d7b84: 910043e1     	add	x1, sp, #0x10
 41d7b88: aa1303e0     	mov	x0, x19
 41d7b8c: 94000191     	bl	0x41d81d0 <_ChromeMain+0x41d2f34>
 41d7b90: f9402294     	ldr	x20, [x20, #0x40]
 41d7b94: f9402260     	ldr	x0, [x19, #0x40]
 41d7b98: 974b4251     	bl	0x14a84dc <_ChromeMain+0x14a3240>
 41d7b9c: aa0003e2     	mov	x2, x0
 41d7ba0: 910043e1     	add	x1, sp, #0x10
 41d7ba4: aa1403e0     	mov	x0, x20
 41d7ba8: 97fff449     	bl	0x41d4ccc <_ChromeMain+0x41cfa30>
 41d7bac: 910043f3     	add	x19, sp, #0x10
 41d7bb0: 9101c260     	add	x0, x19, #0x70
 41d7bb4: d2800001     	mov	x1, #0x0                ; =0
 41d7bb8: 96f94040     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d7bbc: 91008260     	add	x0, x19, #0x20
 41d7bc0: 96f9402e     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d7bc4: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 41d7bc8: 36f800a8     	tbz	w8, #0x1f, 0x41d7bdc <_ChromeMain+0x41d2940>
 41d7bcc: f9400be0     	ldr	x0, [sp, #0x10]
 41d7bd0: f94013e8     	ldr	x8, [sp, #0x20]
 41d7bd4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d7bd8: 96f8c4b8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d7bdc: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 41d7be0: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 41d7be4: a94957f6     	ldp	x22, x21, [sp, #0x90]
 41d7be8: 910303ff     	add	sp, sp, #0xc0
 41d7bec: d65f03c0     	ret
 41d7bf0: b942baa9     	ldr	w9, [x21, #0x2b8]
 41d7bf4: 3100053f     	cmn	w9, #0x1
 41d7bf8: 54000341     	b.ne	0x41d7c60 <_ChromeMain+0x41d29c4>
 41d7bfc: 394d2109     	ldrb	w9, [x8, #0x348]
 41d7c00: 34fff429     	cbz	w9, 0x41d7a84 <_ChromeMain+0x41d27e8>
 41d7c04: 394ba2a9     	ldrb	w9, [x21, #0x2e8]
 41d7c08: 34fff209     	cbz	w9, 0x41d7a48 <_ChromeMain+0x41d27ac>
 41d7c0c: b982b6a9     	ldrsw	x9, [x21, #0x2b4]
 41d7c10: 3100053f     	cmn	w9, #0x1
 41d7c14: 540005a0     	b.eq	0x41d7cc8 <_ChromeMain+0x41d2a2c>
 41d7c18: f94142aa     	ldr	x10, [x21, #0x280]
 41d7c1c: eb09015f     	cmp	x10, x9
 41d7c20: 540002a9     	b.ls	0x41d7c74 <_ChromeMain+0x41d29d8>
 41d7c24: f9413eaa     	ldr	x10, [x21, #0x278]
 41d7c28: f8697949     	ldr	x9, [x10, x9, lsl #3]
 41d7c2c: b9443129     	ldr	w9, [x9, #0x430]
 41d7c30: 7100093f     	cmp	w9, #0x2
 41d7c34: 54fff0a0     	b.eq	0x41d7a48 <_ChromeMain+0x41d27ac>
 41d7c38: f94136a9     	ldr	x9, [x21, #0x268]
 41d7c3c: b40004c9     	cbz	x9, 0x41d7cd4 <_ChromeMain+0x41d2a38>
 41d7c40: 39458129     	ldrb	w9, [x9, #0x160]
 41d7c44: 3707f029     	tbnz	w9, #0x0, 0x41d7a48 <_ChromeMain+0x41d27ac>
 41d7c48: 17ffff8f     	b	0x41d7a84 <_ChromeMain+0x41d27e8>
 41d7c4c: 3100051f     	cmn	w8, #0x1
 41d7c50: 54fff0e1     	b.ne	0x41d7a6c <_ChromeMain+0x41d27d0>
 41d7c54: d4200000     	brk	#0
 41d7c58: d4400000     	hlt	#0
 41d7c5c: d4200020     	brk	#0x1
 41d7c60: 394ba2a9     	ldrb	w9, [x21, #0x2e8]
 41d7c64: 34ffef29     	cbz	w9, 0x41d7a48 <_ChromeMain+0x41d27ac>
 41d7c68: 394d2109     	ldrb	w9, [x8, #0x348]
 41d7c6c: 35ffeee9     	cbnz	w9, 0x41d7a48 <_ChromeMain+0x41d27ac>
 41d7c70: 17ffff85     	b	0x41d7a84 <_ChromeMain+0x41d27e8>
 41d7c74: d4200020     	brk	#0x1
 41d7c78: f9401909     	ldr	x9, [x8, #0x30]
 41d7c7c: b4fff0a9     	cbz	x9, 0x41d7a90 <_ChromeMain+0x41d27f4>
 41d7c80: 9100a101     	add	x1, x8, #0x28
 41d7c84: 17ffff86     	b	0x41d7a9c <_ChromeMain+0x41d2800>
 41d7c88: 97e24b7c     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 41d7c8c: aa0003e1     	mov	x1, x0
 41d7c90: 17ffff83     	b	0x41d7a9c <_ChromeMain+0x41d2800>
 41d7c94: d4200000     	brk	#0
 41d7c98: d4400000     	hlt	#0
 41d7c9c: d4200020     	brk	#0x1
 41d7ca0: f9401909     	ldr	x9, [x8, #0x30]
 41d7ca4: b4fff1c9     	cbz	x9, 0x41d7adc <_ChromeMain+0x41d2840>
 41d7ca8: 9100a101     	add	x1, x8, #0x28
 41d7cac: 17ffff8f     	b	0x41d7ae8 <_ChromeMain+0x41d284c>
 41d7cb0: d4200000     	brk	#0
 41d7cb4: d4400000     	hlt	#0
 41d7cb8: d4200020     	brk	#0x1
 41d7cbc: 97e24b6f     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 41d7cc0: aa0003e1     	mov	x1, x0
 41d7cc4: 17ffff89     	b	0x41d7ae8 <_ChromeMain+0x41d284c>
 41d7cc8: d4200000     	brk	#0
 41d7ccc: d4400000     	hlt	#0
 41d7cd0: d4200020     	brk	#0x1
 41d7cd4: d4200000     	brk	#0
 41d7cd8: d4400000     	hlt	#0
 41d7cdc: d4200020     	brk	#0x1
