
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d4a24: d10483ff     	sub	sp, sp, #0x120
 41d4a28: a90d67fa     	stp	x26, x25, [sp, #0xd0]
 41d4a2c: a90e5ff8     	stp	x24, x23, [sp, #0xe0]
 41d4a30: a90f57f6     	stp	x22, x21, [sp, #0xf0]
 41d4a34: a9104ff4     	stp	x20, x19, [sp, #0x100]
 41d4a38: a9117bfd     	stp	x29, x30, [sp, #0x110]
 41d4a3c: 910443fd     	add	x29, sp, #0x110
 41d4a40: aa0103f4     	mov	x20, x1
 41d4a44: f9400008     	ldr	x8, [x0]
 41d4a48: f940b508     	ldr	x8, [x8, #0x168]
 41d4a4c: d63f0100     	blr	x8
 41d4a50: b4000580     	cbz	x0, 0x41d4b00 <_ChromeMain+0x41cf864>
 41d4a54: aa0003e1     	mov	x1, x0
 41d4a58: f90043ff     	str	xzr, [sp, #0x80]
 41d4a5c: 6f00e400     	movi.2d	v0, #0000000000000000
 41d4a60: ad0303e0     	stp	q0, q0, [sp, #0x60]
 41d4a64: ad0203e0     	stp	q0, q0, [sp, #0x40]
 41d4a68: 3d800fe0     	str	q0, [sp, #0x30]
 41d4a6c: 90046842     	adrp	x2, 0xcedc000 <dyld_stub_binder+0xcedc000>
 41d4a70: 911ad042     	add	x2, x2, #0x6b4
 41d4a74: 9100c3e0     	add	x0, sp, #0x30
 41d4a78: 52800163     	mov	w3, #0xb                ; =11
 41d4a7c: 97791069     	bl	0x2018c20 <_ChromeMain+0x2013984>
 41d4a80: d0050b48     	adrp	x8, 0xe33e000 <dyld_stub_binder+0xe33e000>
 41d4a84: 913cc108     	add	x8, x8, #0xf30
 41d4a88: f9001be8     	str	x8, [sp, #0x30]
 41d4a8c: 9100c3e0     	add	x0, sp, #0x30
 41d4a90: 528000e1     	mov	w1, #0x7                ; =7
 41d4a94: 9753112e     	bl	0x1698f4c <_ChromeMain+0x1693cb0>
 41d4a98: 39406008     	ldrb	w8, [x0, #0x18]
 41d4a9c: 71001d1f     	cmp	w8, #0x7
 41d4aa0: 54001061     	b.ne	0x41d4cac <_ChromeMain+0x41cfa10>
 41d4aa4: aa0003f3     	mov	x19, x0
 41d4aa8: f9400001     	ldr	x1, [x0]
 41d4aac: 97254911     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 41d4ab0: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 41d4ab4: f90017ff     	str	xzr, [sp, #0x28]
 41d4ab8: f9400688     	ldr	x8, [x20, #0x8]
 41d4abc: 8b080d08     	add	x8, x8, x8, lsl #3
 41d4ac0: d37ced16     	lsl	x22, x8, #4
 41d4ac4: b40001b6     	cbz	x22, 0x41d4af8 <_ChromeMain+0x41cf85c>
 41d4ac8: f9400288     	ldr	x8, [x20]
 41d4acc: b0046974     	adrp	x20, 0xcf01000 <dyld_stub_binder+0xcf01000>
 41d4ad0: 91273294     	add	x20, x20, #0x9cc
 41d4ad4: 9101e117     	add	x23, x8, #0x78
 41d4ad8: 52800098     	mov	w24, #0x4               ; =4
 41d4adc: b0046975     	adrp	x21, 0xcf01000 <dyld_stub_binder+0xcf01000>
 41d4ae0: 912742b5     	add	x21, x21, #0x9d0
 41d4ae4: b0053779     	adrp	x25, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 41d4ae8: 9121e339     	add	x25, x25, #0x878
 41d4aec: 14000032     	b	0x41d4bb4 <_ChromeMain+0x41cf918>
 41d4af0: f9400ff3     	ldr	x19, [sp, #0x18]
 41d4af4: b5000993     	cbnz	x19, 0x41d4c24 <_ChromeMain+0x41cf988>
 41d4af8: 9100c3e0     	add	x0, sp, #0x30
 41d4afc: 97790ffa     	bl	0x2018ae4 <_ChromeMain+0x2013848>
 41d4b00: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 41d4b04: a9504ff4     	ldp	x20, x19, [sp, #0x100]
 41d4b08: a94f57f6     	ldp	x22, x21, [sp, #0xf0]
 41d4b0c: a94e5ff8     	ldp	x24, x23, [sp, #0xe0]
 41d4b10: a94d67fa     	ldp	x26, x25, [sp, #0xd0]
 41d4b14: 910483ff     	add	sp, sp, #0x120
 41d4b18: d65f03c0     	ret
 41d4b1c: f94006e1     	ldr	x1, [x23, #0x8]
 41d4b20: b40003a1     	cbz	x1, 0x41d4b94 <_ChromeMain+0x41cf8f8>
 41d4b24: f94002e0     	ldr	x0, [x23]
 41d4b28: 910223e8     	add	x8, sp, #0x88
 41d4b2c: 97373877     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 41d4b30: 3cc883e0     	ldur	q0, [sp, #0x88]
 41d4b34: 3c9903a0     	stur	q0, [x29, #-0x70]
 41d4b38: f9404fe8     	ldr	x8, [sp, #0x98]
 41d4b3c: f81a03a8     	stur	x8, [x29, #-0x60]
 41d4b40: a908ffff     	stp	xzr, xzr, [sp, #0x88]
 41d4b44: f9004fff     	str	xzr, [sp, #0x98]
 41d4b48: 381a83b8     	sturb	w24, [x29, #-0x58]
 41d4b4c: 910003e0     	mov	x0, sp
 41d4b50: d101c3a3     	sub	x3, x29, #0x70
 41d4b54: aa1503e1     	mov	x1, x21
 41d4b58: 528000a2     	mov	w2, #0x5                ; =5
 41d4b5c: 970d98d9     	bl	0x53aec0 <_ChromeMain+0x535c24>
 41d4b60: 385a83a8     	ldurb	w8, [x29, #-0x58]
 41d4b64: f103fd1f     	cmp	x8, #0xff
 41d4b68: 540000a0     	b.eq	0x41d4b7c <_ChromeMain+0x41cf8e0>
 41d4b6c: f8687b28     	ldr	x8, [x25, x8, lsl #3]
 41d4b70: d10107a0     	sub	x0, x29, #0x41
 41d4b74: d101c3a1     	sub	x1, x29, #0x70
 41d4b78: d63f0100     	blr	x8
 41d4b7c: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 41d4b80: 36f800a8     	tbz	w8, #0x1f, 0x41d4b94 <_ChromeMain+0x41cf8f8>
 41d4b84: f94047e0     	ldr	x0, [sp, #0x88]
 41d4b88: f9404fe8     	ldr	x8, [sp, #0x98]
 41d4b8c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d4b90: 96f8d0ca     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d4b94: 910003e1     	mov	x1, sp
 41d4b98: aa1303e0     	mov	x0, x19
 41d4b9c: 97212582     	bl	0xa1e1a4 <_ChromeMain+0xa18f08>
 41d4ba0: 910003e0     	mov	x0, sp
 41d4ba4: 971e2637     	bl	0x95e480 <_ChromeMain+0x9591e4>
 41d4ba8: 910242f7     	add	x23, x23, #0x90
 41d4bac: f10242d6     	subs	x22, x22, #0x90
 41d4bb0: 54fffa00     	b.eq	0x41d4af0 <_ChromeMain+0x41cf854>
 41d4bb4: 385a02e8     	ldurb	w8, [x23, #-0x60]
 41d4bb8: 34ffff88     	cbz	w8, 0x41d4ba8 <_ChromeMain+0x41cf90c>
 41d4bbc: d101e2e0     	sub	x0, x23, #0x78
 41d4bc0: 97125fb2     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 41d4bc4: aa0003e1     	mov	x1, x0
 41d4bc8: 910063e0     	add	x0, sp, #0x18
 41d4bcc: aa0103e2     	mov	x2, x1
 41d4bd0: 977038cc     	bl	0x1de2f00 <_ChromeMain+0x1dddc64>
 41d4bd4: 3607fea1     	tbz	w1, #0x0, 0x41d4ba8 <_ChromeMain+0x41cf90c>
 41d4bd8: a9007fff     	stp	xzr, xzr, [sp]
 41d4bdc: f9000bff     	str	xzr, [sp, #0x10]
 41d4be0: d101e2e0     	sub	x0, x23, #0x78
 41d4be4: 97125fa9     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 41d4be8: 39805c08     	ldrsb	x8, [x0, #0x17]
 41d4bec: a9402809     	ldp	x9, x10, [x0]
 41d4bf0: f100011f     	cmp	x8, #0x0
 41d4bf4: 9a804123     	csel	x3, x9, x0, mi
 41d4bf8: 7100011f     	cmp	w8, #0x0
 41d4bfc: 9a884144     	csel	x4, x10, x8, mi
 41d4c00: 910003e0     	mov	x0, sp
 41d4c04: aa1403e1     	mov	x1, x20
 41d4c08: 52800062     	mov	w2, #0x3                ; =3
 41d4c0c: 97532e6f     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 41d4c10: 39805ee1     	ldrsb	x1, [x23, #0x17]
 41d4c14: b7fff841     	tbnz	x1, #0x3f, 0x41d4b1c <_ChromeMain+0x41cf880>
 41d4c18: 34fffbe1     	cbz	w1, 0x41d4b94 <_ChromeMain+0x41cf8f8>
 41d4c1c: aa1703e0     	mov	x0, x23
 41d4c20: 17ffffc2     	b	0x41d4b28 <_ChromeMain+0x41cf88c>
 41d4c24: f94013e8     	ldr	x8, [sp, #0x20]
 41d4c28: 8b080509     	add	x9, x8, x8, lsl #1
 41d4c2c: d37df129     	lsl	x9, x9, #3
 41d4c30: b4000389     	cbz	x9, 0x41d4ca0 <_ChromeMain+0x41cfa04>
 41d4c34: 8b130129     	add	x9, x9, x19
 41d4c38: d1006134     	sub	x20, x9, #0x18
 41d4c3c: d37df109     	lsl	x9, x8, #3
 41d4c40: cb081535     	sub	x21, x9, x8, lsl #5
 41d4c44: b4000334     	cbz	x20, 0x41d4ca8 <_ChromeMain+0x41cfa0c>
 41d4c48: 39c05e88     	ldrsb	w8, [x20, #0x17]
 41d4c4c: 37f80208     	tbnz	w8, #0x1f, 0x41d4c8c <_ChromeMain+0x41cf9f0>
 41d4c50: d1006294     	sub	x20, x20, #0x18
 41d4c54: b10062b5     	adds	x21, x21, #0x18
 41d4c58: 54ffff61     	b.ne	0x41d4c44 <_ChromeMain+0x41cf9a8>
 41d4c5c: f9400fe0     	ldr	x0, [sp, #0x18]
 41d4c60: cb000268     	sub	x8, x19, x0
 41d4c64: 9343fd08     	asr	x8, x8, #3
 41d4c68: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 41d4c6c: f2955569     	movk	x9, #0xaaab
 41d4c70: 9b097d08     	mul	x8, x8, x9
 41d4c74: f90013e8     	str	x8, [sp, #0x20]
 41d4c78: f94017e8     	ldr	x8, [sp, #0x28]
 41d4c7c: 8b080508     	add	x8, x8, x8, lsl #1
 41d4c80: d37df101     	lsl	x1, x8, #3
 41d4c84: 96f8d08d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d4c88: 17ffff9c     	b	0x41d4af8 <_ChromeMain+0x41cf85c>
 41d4c8c: f9400280     	ldr	x0, [x20]
 41d4c90: f9400a88     	ldr	x8, [x20, #0x10]
 41d4c94: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d4c98: 96f8d088     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d4c9c: 17ffffed     	b	0x41d4c50 <_ChromeMain+0x41cf9b4>
 41d4ca0: aa1303e0     	mov	x0, x19
 41d4ca4: 17ffffef     	b	0x41d4c60 <_ChromeMain+0x41cf9c4>
 41d4ca8: d4200020     	brk	#0x1
 41d4cac: 7103fd1f     	cmp	w8, #0xff
 41d4cb0: 54000081     	b.ne	0x41d4cc0 <_ChromeMain+0x41cfa24>
 41d4cb4: 9004b080     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 41d4cb8: 913be000     	add	x0, x0, #0xef8
 41d4cbc: 94294975     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 41d4cc0: 9004b080     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 41d4cc4: 913c6000     	add	x0, x0, #0xf18
 41d4cc8: 94294972     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 41d4ccc: d10283ff     	sub	sp, sp, #0xa0
 41d4cd0: a9046ffc     	stp	x28, x27, [sp, #0x40]
 41d4cd4: a90567fa     	stp	x26, x25, [sp, #0x50]
 41d4cd8: a9065ff8     	stp	x24, x23, [sp, #0x60]
 41d4cdc: a90757f6     	stp	x22, x21, [sp, #0x70]
 41d4ce0: a9084ff4     	stp	x20, x19, [sp, #0x80]
 41d4ce4: a9097bfd     	stp	x29, x30, [sp, #0x90]
