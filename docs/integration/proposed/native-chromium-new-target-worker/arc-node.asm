
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426cd6c: d10483ff     	sub	sp, sp, #0x120
 426cd70: 6d0933ed     	stp	d13, d12, [sp, #0x90]
 426cd74: 6d0a2beb     	stp	d11, d10, [sp, #0xa0]
 426cd78: 6d0b23e9     	stp	d9, d8, [sp, #0xb0]
 426cd7c: a90c6ffc     	stp	x28, x27, [sp, #0xc0]
 426cd80: a90d67fa     	stp	x26, x25, [sp, #0xd0]
 426cd84: a90e5ff8     	stp	x24, x23, [sp, #0xe0]
 426cd88: a90f57f6     	stp	x22, x21, [sp, #0xf0]
 426cd8c: a9104ff4     	stp	x20, x19, [sp, #0x100]
 426cd90: a9117bfd     	stp	x29, x30, [sp, #0x110]
 426cd94: 910443fd     	add	x29, sp, #0x110
 426cd98: b4002f01     	cbz	x1, 0x426d378 <_ChromeMain+0x42680dc>
 426cd9c: aa0203f3     	mov	x19, x2
 426cda0: b4002d62     	cbz	x2, 0x426d34c <_ChromeMain+0x42680b0>
 426cda4: f9400408     	ldr	x8, [x0, #0x8]
 426cda8: 52801609     	mov	w9, #0xb0               ; =176
 426cdac: 9b097d15     	mul	x21, x8, x9
 426cdb0: b4000315     	cbz	x21, 0x426ce10 <_ChromeMain+0x4267b74>
 426cdb4: aa0103f4     	mov	x20, x1
 426cdb8: 9004ede8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 426cdbc: f9444908     	ldr	x8, [x8, #0x890]
 426cdc0: f9400016     	ldr	x22, [x0]
 426cdc4: d2effe09     	mov	x9, #0x7ff0000000000000 ; =9218868437227405312
 426cdc8: 9e670128     	fmov	d8, x9
 426cdcc: fd400109     	ldr	d9, [x8]
 426cdd0: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 426cdd4: f004e6e9     	adrp	x9, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 426cdd8: fd45ad2a     	ldr	d10, [x9, #0xb58]
 426cddc: 9e67010b     	fmov	d11, x8
 426cde0: 92f00017     	mov	x23, #0x7fffffffffffffff ; =9223372036854775807
 426cde4: 92f78408     	mov	x8, #0x43dfffffffffffff ; =4890909195324358655
 426cde8: 9e67010c     	fmov	d12, x8
 426cdec: 52800098     	mov	w24, #0x4               ; =4
 426cdf0: 910183fa     	add	x26, sp, #0x60
 426cdf4: 9004abdb     	adrp	x27, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 426cdf8: 911cdf7b     	add	x27, x27, #0x737
 426cdfc: b004ac9c     	adrp	x28, 0xd7fd000 <dyld_stub_binder+0xd7fd000>
 426ce00: 911c5b9c     	add	x28, x28, #0x716
 426ce04: b00532b9     	adrp	x25, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 426ce08: 9121e339     	add	x25, x25, #0x878
 426ce0c: 140000a7     	b	0x426d0a8 <_ChromeMain+0x4267e0c>
 426ce10: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 426ce14: a9504ff4     	ldp	x20, x19, [sp, #0x100]
 426ce18: a94f57f6     	ldp	x22, x21, [sp, #0xf0]
 426ce1c: a94e5ff8     	ldp	x24, x23, [sp, #0xe0]
 426ce20: a94d67fa     	ldp	x26, x25, [sp, #0xd0]
 426ce24: a94c6ffc     	ldp	x28, x27, [sp, #0xc0]
 426ce28: 6d4b23e9     	ldp	d9, d8, [sp, #0xb0]
 426ce2c: 6d4a2beb     	ldp	d11, d10, [sp, #0xa0]
 426ce30: 6d4933ed     	ldp	d13, d12, [sp, #0x90]
 426ce34: 910483ff     	add	sp, sp, #0x120
 426ce38: d65f03c0     	ret
 426ce3c: d63f0100     	blr	x8
 426ce40: 14000022     	b	0x426cec8 <_ChromeMain+0x4267c2c>
 426ce44: a94012c3     	ldp	x3, x4, [x22]
 426ce48: 14000078     	b	0x426d028 <_ChromeMain+0x4267d8c>
 426ce4c: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 426ce50: f9002fff     	str	xzr, [sp, #0x58]
 426ce54: b0054a28     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 426ce58: f9468508     	ldr	x8, [x8, #0xd08]
 426ce5c: 10317ea9     	adr	x9, 0x42cfe30 <_ChromeMain+0x42cab94>
 426ce60: d503201f     	nop
 426ce64: eb09011f     	cmp	x8, x9
 426ce68: 54fffea1     	b.ne	0x426ce3c <_ChromeMain+0x4267ba0>
 426ce6c: 94f712c9     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 426ce70: 1e602008     	fcmp	d0, #0.0
 426ce74: 54002720     	b.eq	0x426d358 <_ChromeMain+0x42680bc>
 426ce78: 1e682000     	fcmp	d0, d8
 426ce7c: 54002720     	b.eq	0x426d360 <_ChromeMain+0x42680c4>
 426ce80: 1e692800     	fadd	d0, d0, d9
 426ce84: 1e6a0800     	fmul	d0, d0, d10
 426ce88: 1e6b2000     	fcmp	d0, d11
 426ce8c: 9a97b3e8     	csel	x8, xzr, x23, lt
 426ce90: 1e6b6801     	fmaxnm	d1, d0, d11
 426ce94: 9e780029     	fcvtzs	x9, d1
 426ce98: 1e6c2000     	fcmp	d0, d12
 426ce9c: 9a889120     	csel	x0, x9, x8, ls
 426cea0: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 426cea4: 8b080008     	add	x8, x0, x8
 426cea8: f100091f     	cmp	x8, #0x2
 426ceac: 540000e3     	b.lo	0x426cec8 <_ChromeMain+0x4267c2c>
 426ceb0: d2880008     	mov	x8, #0x4000             ; =16384
 426ceb4: f2a910c8     	movk	x8, #0x4886, lsl #16
 426ceb8: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 426cebc: f2e00528     	movk	x8, #0x29, lsl #48
 426cec0: ab080008     	adds	x8, x0, x8
 426cec4: 9a8862e0     	csel	x0, x23, x8, vs
 426cec8: 9100c3e8     	add	x8, sp, #0x30
 426cecc: 975a81f6     	bl	0x190d6a4 <_ChromeMain+0x1908408>
 426ced0: 3dc00fe0     	ldr	q0, [sp, #0x30]
 426ced4: 3d801be0     	str	q0, [sp, #0x60]
 426ced8: f94023e8     	ldr	x8, [sp, #0x40]
 426cedc: f9003be8     	str	x8, [sp, #0x70]
 426cee0: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 426cee4: f90023ff     	str	xzr, [sp, #0x40]
 426cee8: 3901e3f8     	strb	w24, [sp, #0x78]
 426ceec: 910123e0     	add	x0, sp, #0x48
 426cef0: 910183e3     	add	x3, sp, #0x60
 426cef4: f004c581     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 426cef8: 91123421     	add	x1, x1, #0x48d
 426cefc: 52800142     	mov	w2, #0xa                ; =10
 426cf00: 970b37f0     	bl	0x53aec0 <_ChromeMain+0x535c24>
 426cf04: 3941e3e8     	ldrb	w8, [sp, #0x78]
 426cf08: f103fd1f     	cmp	x8, #0xff
 426cf0c: 540000a0     	b.eq	0x426cf20 <_ChromeMain+0x4267c84>
 426cf10: f8687b28     	ldr	x8, [x25, x8, lsl #3]
 426cf14: 910063e0     	add	x0, sp, #0x18
 426cf18: 910183e1     	add	x1, sp, #0x60
 426cf1c: d63f0100     	blr	x8
 426cf20: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 426cf24: 36f800a8     	tbz	w8, #0x1f, 0x426cf38 <_ChromeMain+0x4267c9c>
 426cf28: f9401be0     	ldr	x0, [sp, #0x30]
 426cf2c: f94023e8     	ldr	x8, [sp, #0x40]
 426cf30: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426cf34: 96f66fe1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426cf38: 910123e0     	add	x0, sp, #0x48
 426cf3c: b004bc61     	adrp	x1, 0xd9f9000 <dyld_stub_binder+0xd9f9000>
 426cf40: 912e4c21     	add	x1, x1, #0xb93
 426cf44: 528001c2     	mov	w2, #0xe                ; =14
 426cf48: 9004abe3     	adrp	x3, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 426cf4c: 9118d063     	add	x3, x3, #0x634
 426cf50: 9750cde8     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 426cf54: 910183e8     	add	x8, sp, #0x60
 426cf58: 9760beeb     	bl	0x1a9cb04 <_ChromeMain+0x1a97868>
 426cf5c: 3981dfe8     	ldrsb	x8, [sp, #0x77]
 426cf60: a9462be9     	ldp	x9, x10, [sp, #0x60]
 426cf64: f100011f     	cmp	x8, #0x0
 426cf68: 9a9a4123     	csel	x3, x9, x26, mi
 426cf6c: 7100011f     	cmp	w8, #0x0
 426cf70: 9a884144     	csel	x4, x10, x8, mi
 426cf74: 910123e0     	add	x0, sp, #0x48
 426cf78: d004ac21     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 426cf7c: 91102821     	add	x1, x1, #0x40a
 426cf80: 52800082     	mov	w2, #0x4                ; =4
 426cf84: 9750cd91     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 426cf88: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 426cf8c: 36f800a8     	tbz	w8, #0x1f, 0x426cfa0 <_ChromeMain+0x4267d04>
 426cf90: f94033e0     	ldr	x0, [sp, #0x60]
 426cf94: f9403be8     	ldr	x8, [sp, #0x70]
 426cf98: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426cf9c: 96f66fc7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426cfa0: b9400280     	ldr	w0, [x20]
 426cfa4: 11000408     	add	w8, w0, #0x1
 426cfa8: b9000288     	str	w8, [x20]
 426cfac: 9100c3e8     	add	x8, sp, #0x30
 426cfb0: 973b10a4     	bl	0x1131240 <_ChromeMain+0x112bfa4>
 426cfb4: 3dc00fe0     	ldr	q0, [sp, #0x30]
 426cfb8: 3d801be0     	str	q0, [sp, #0x60]
 426cfbc: f94023e8     	ldr	x8, [sp, #0x40]
 426cfc0: f9003be8     	str	x8, [sp, #0x70]
 426cfc4: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 426cfc8: f90023ff     	str	xzr, [sp, #0x40]
 426cfcc: 3901e3f8     	strb	w24, [sp, #0x78]
 426cfd0: 910123e0     	add	x0, sp, #0x48
 426cfd4: 910183e3     	add	x3, sp, #0x60
 426cfd8: f004ac01     	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426cfdc: 9109e421     	add	x1, x1, #0x279
 426cfe0: 52800042     	mov	w2, #0x2                ; =2
 426cfe4: 970b37b7     	bl	0x53aec0 <_ChromeMain+0x535c24>
 426cfe8: 3941e3e8     	ldrb	w8, [sp, #0x78]
 426cfec: f103fd1f     	cmp	x8, #0xff
 426cff0: 540000a0     	b.eq	0x426d004 <_ChromeMain+0x4267d68>
 426cff4: f8687b28     	ldr	x8, [x25, x8, lsl #3]
 426cff8: 910063e0     	add	x0, sp, #0x18
 426cffc: 910183e1     	add	x1, sp, #0x60
 426d000: d63f0100     	blr	x8
 426d004: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 426d008: 36f800a8     	tbz	w8, #0x1f, 0x426d01c <_ChromeMain+0x4267d80>
 426d00c: f9401be0     	ldr	x0, [sp, #0x30]
 426d010: f94023e8     	ldr	x8, [sp, #0x40]
 426d014: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426d018: 96f66fa8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426d01c: 39805ec4     	ldrsb	x4, [x22, #0x17]
 426d020: b7fff124     	tbnz	x4, #0x3f, 0x426ce44 <_ChromeMain+0x4267ba8>
 426d024: aa1603e3     	mov	x3, x22
 426d028: 910123e0     	add	x0, sp, #0x48
 426d02c: b004ac21     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 426d030: 9138dc21     	add	x1, x1, #0xe37
 426d034: 52800082     	mov	w2, #0x4                ; =4
 426d038: 9750cd64     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 426d03c: 910123e0     	add	x0, sp, #0x48
 426d040: aa1b03e1     	mov	x1, x27
 426d044: 52800082     	mov	w2, #0x4                ; =4
 426d048: aa1c03e3     	mov	x3, x28
 426d04c: 9750cda9     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 426d050: 394242c8     	ldrb	w8, [x22, #0x90]
 426d054: 36001808     	tbz	w8, #0x0, 0x426d354 <_ChromeMain+0x42680b8>
 426d058: 910062c0     	add	x0, x22, #0x18
 426d05c: 970ffe8b     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 426d060: 39805c08     	ldrsb	x8, [x0, #0x17]
 426d064: a9402809     	ldp	x9, x10, [x0]
 426d068: f100011f     	cmp	x8, #0x0
 426d06c: 9a804123     	csel	x3, x9, x0, mi
 426d070: 7100011f     	cmp	w8, #0x0
 426d074: 9a884144     	csel	x4, x10, x8, mi
 426d078: 910123e0     	add	x0, sp, #0x48
 426d07c: aa1c03e1     	mov	x1, x28
 426d080: 52800062     	mov	w2, #0x3                ; =3
 426d084: 9750cd51     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 426d088: 910123e1     	add	x1, sp, #0x48
 426d08c: aa1303e0     	mov	x0, x19
 426d090: 971ec445     	bl	0xa1e1a4 <_ChromeMain+0xa18f08>
 426d094: 910123e0     	add	x0, sp, #0x48
 426d098: 971bc4fa     	bl	0x95e480 <_ChromeMain+0x9591e4>
 426d09c: 9102c2d6     	add	x22, x22, #0xb0
 426d0a0: f102c2b5     	subs	x21, x21, #0xb0
 426d0a4: 54ffeb60     	b.eq	0x426ce10 <_ChromeMain+0x4267b74>
 426d0a8: 394242c8     	ldrb	w8, [x22, #0x90]
 426d0ac: 35ffed08     	cbnz	w8, 0x426ce4c <_ChromeMain+0x4267bb0>
 426d0b0: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 426d0b4: f9002fff     	str	xzr, [sp, #0x58]
 426d0b8: 90054a28     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 426d0bc: f9468508     	ldr	x8, [x8, #0xd08]
 426d0c0: 10316b89     	adr	x9, 0x42cfe30 <_ChromeMain+0x42cab94>
 426d0c4: d503201f     	nop
 426d0c8: eb09011f     	cmp	x8, x9
 426d0cc: 540013c1     	b.ne	0x426d344 <_ChromeMain+0x42680a8>
 426d0d0: 94f71230     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 426d0d4: 1e602008     	fcmp	d0, #0.0
 426d0d8: 54001480     	b.eq	0x426d368 <_ChromeMain+0x42680cc>
 426d0dc: 1e682000     	fcmp	d0, d8
 426d0e0: 54001480     	b.eq	0x426d370 <_ChromeMain+0x42680d4>
 426d0e4: 1e692800     	fadd	d0, d0, d9
 426d0e8: 1e6a0800     	fmul	d0, d0, d10
 426d0ec: 1e6b2000     	fcmp	d0, d11
 426d0f0: 9a97b3e8     	csel	x8, xzr, x23, lt
 426d0f4: 1e6b6801     	fmaxnm	d1, d0, d11
 426d0f8: 9e780029     	fcvtzs	x9, d1
 426d0fc: 1e6c2000     	fcmp	d0, d12
 426d100: 9a889120     	csel	x0, x9, x8, ls
 426d104: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 426d108: 8b080008     	add	x8, x0, x8
 426d10c: f100091f     	cmp	x8, #0x2
 426d110: 540000e3     	b.lo	0x426d12c <_ChromeMain+0x4267e90>
 426d114: d2880008     	mov	x8, #0x4000             ; =16384
 426d118: f2a910c8     	movk	x8, #0x4886, lsl #16
 426d11c: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 426d120: f2e00528     	movk	x8, #0x29, lsl #48
 426d124: ab080008     	adds	x8, x0, x8
 426d128: 9a8862e0     	csel	x0, x23, x8, vs
 426d12c: 910123e8     	add	x8, sp, #0x48
 426d130: 975a815d     	bl	0x190d6a4 <_ChromeMain+0x1908408>
 426d134: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 426d138: f90023ff     	str	xzr, [sp, #0x40]
 426d13c: 910262c0     	add	x0, x22, #0x98
 426d140: 9100c3e2     	add	x2, sp, #0x30
 426d144: aa1403e1     	mov	x1, x20
 426d148: 97ffff09     	bl	0x426cd6c <_ChromeMain+0x4267ad0>
 426d14c: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 426d150: f90017ff     	str	xzr, [sp, #0x28]
 426d154: 910063e0     	add	x0, sp, #0x18
 426d158: 9100c3e3     	add	x3, sp, #0x30
 426d15c: d004b701     	adrp	x1, 0xd94f000 <dyld_stub_binder+0xd94f000>
 426d160: 9109c821     	add	x1, x1, #0x272
 426d164: 52800102     	mov	w2, #0x8                ; =8
 426d168: 9722e734     	bl	0xb26e38 <_ChromeMain+0xb21b9c>
 426d16c: 39817fe8     	ldrsb	x8, [sp, #0x5f]
 426d170: a944abe9     	ldp	x9, x10, [sp, #0x48]
 426d174: f100011f     	cmp	x8, #0x0
 426d178: 910123fa     	add	x26, sp, #0x48
 426d17c: 9a9a4123     	csel	x3, x9, x26, mi
 426d180: 7100011f     	cmp	w8, #0x0
 426d184: 9a884144     	csel	x4, x10, x8, mi
 426d188: 910063e0     	add	x0, sp, #0x18
 426d18c: d004c581     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 426d190: 91123421     	add	x1, x1, #0x48d
 426d194: 52800142     	mov	w2, #0xa                ; =10
 426d198: 9750cd0c     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 426d19c: 910063e0     	add	x0, sp, #0x18
 426d1a0: 9004bc61     	adrp	x1, 0xd9f9000 <dyld_stub_binder+0xd9f9000>
 426d1a4: 912e4c21     	add	x1, x1, #0xb93
 426d1a8: 528001c2     	mov	w2, #0xe                ; =14
 426d1ac: f004abc3     	adrp	x3, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 426d1b0: 9118d063     	add	x3, x3, #0x634
 426d1b4: 9750cd4f     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 426d1b8: 39817fe8     	ldrsb	x8, [sp, #0x5f]
 426d1bc: a944abe9     	ldp	x9, x10, [sp, #0x48]
 426d1c0: f100011f     	cmp	x8, #0x0
 426d1c4: 9a9a4123     	csel	x3, x9, x26, mi
 426d1c8: 7100011f     	cmp	w8, #0x0
 426d1cc: 9a884144     	csel	x4, x10, x8, mi
 426d1d0: 910063e0     	add	x0, sp, #0x18
 426d1d4: f004c581     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426d1d8: 9113b021     	add	x1, x1, #0x4ec
 426d1dc: 528001a2     	mov	w2, #0xd                ; =13
 426d1e0: 9750ccfa     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 426d1e4: 910183e8     	add	x8, sp, #0x60
 426d1e8: 9760be47     	bl	0x1a9cb04 <_ChromeMain+0x1a97868>
 426d1ec: 3981dfe8     	ldrsb	x8, [sp, #0x77]
 426d1f0: a9462be9     	ldp	x9, x10, [sp, #0x60]
 426d1f4: f100011f     	cmp	x8, #0x0
 426d1f8: 910183fa     	add	x26, sp, #0x60
 426d1fc: 9a9a4123     	csel	x3, x9, x26, mi
 426d200: 7100011f     	cmp	w8, #0x0
 426d204: 9a884144     	csel	x4, x10, x8, mi
 426d208: 910063e0     	add	x0, sp, #0x18
 426d20c: b004ac21     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 426d210: 91102821     	add	x1, x1, #0x40a
 426d214: 52800082     	mov	w2, #0x4                ; =4
 426d218: 9750ccec     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 426d21c: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 426d220: 36f800a8     	tbz	w8, #0x1f, 0x426d234 <_ChromeMain+0x4267f98>
 426d224: f94033e0     	ldr	x0, [sp, #0x60]
 426d228: f9403be8     	ldr	x8, [sp, #0x70]
 426d22c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426d230: 96f66f22     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426d234: b9400280     	ldr	w0, [x20]
 426d238: 11000408     	add	w8, w0, #0x1
 426d23c: b9000288     	str	w8, [x20]
 426d240: 910003e8     	mov	x8, sp
 426d244: 973b0fff     	bl	0x1131240 <_ChromeMain+0x112bfa4>
 426d248: 3dc003e0     	ldr	q0, [sp]
 426d24c: 3d801be0     	str	q0, [sp, #0x60]
 426d250: f9400be8     	ldr	x8, [sp, #0x10]
 426d254: f9003be8     	str	x8, [sp, #0x70]
 426d258: a9007fff     	stp	xzr, xzr, [sp]
 426d25c: f9000bff     	str	xzr, [sp, #0x10]
 426d260: 3901e3f8     	strb	w24, [sp, #0x78]
 426d264: 910063e0     	add	x0, sp, #0x18
 426d268: 910183e3     	add	x3, sp, #0x60
 426d26c: d004ac01     	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426d270: 9109e421     	add	x1, x1, #0x279
 426d274: 52800042     	mov	w2, #0x2                ; =2
 426d278: 970b3712     	bl	0x53aec0 <_ChromeMain+0x535c24>
 426d27c: 3941e3e8     	ldrb	w8, [sp, #0x78]
 426d280: f103fd1f     	cmp	x8, #0xff
 426d284: 540000a0     	b.eq	0x426d298 <_ChromeMain+0x4267ffc>
 426d288: f8687b28     	ldr	x8, [x25, x8, lsl #3]
 426d28c: 91021fe0     	add	x0, sp, #0x87
 426d290: 910183e1     	add	x1, sp, #0x60
 426d294: d63f0100     	blr	x8
 426d298: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 426d29c: 36f800a8     	tbz	w8, #0x1f, 0x426d2b0 <_ChromeMain+0x4268014>
 426d2a0: f94003e0     	ldr	x0, [sp]
 426d2a4: f9400be8     	ldr	x8, [sp, #0x10]
 426d2a8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426d2ac: 96f66f03     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426d2b0: 39805ec4     	ldrsb	x4, [x22, #0x17]
 426d2b4: b7f80364     	tbnz	x4, #0x3f, 0x426d320 <_ChromeMain+0x4268084>
 426d2b8: aa1603e3     	mov	x3, x22
 426d2bc: 910063e0     	add	x0, sp, #0x18
 426d2c0: b004ac21     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 426d2c4: 9138dc21     	add	x1, x1, #0xe37
 426d2c8: 52800082     	mov	w2, #0x4                ; =4
 426d2cc: 9750ccbf     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 426d2d0: 910063e0     	add	x0, sp, #0x18
 426d2d4: aa1b03e1     	mov	x1, x27
 426d2d8: 52800082     	mov	w2, #0x4                ; =4
 426d2dc: f004c583     	adrp	x3, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426d2e0: 9118e463     	add	x3, x3, #0x639
 426d2e4: 9750cd03     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 426d2e8: 910063e1     	add	x1, sp, #0x18
 426d2ec: aa1303e0     	mov	x0, x19
 426d2f0: 971ec3ad     	bl	0xa1e1a4 <_ChromeMain+0xa18f08>
 426d2f4: 910063e0     	add	x0, sp, #0x18
 426d2f8: 971bc462     	bl	0x95e480 <_ChromeMain+0x9591e4>
 426d2fc: f9401be1     	ldr	x1, [sp, #0x30]
 426d300: b5000141     	cbnz	x1, 0x426d328 <_ChromeMain+0x426808c>
 426d304: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 426d308: 36ffeca8     	tbz	w8, #0x1f, 0x426d09c <_ChromeMain+0x4267e00>
 426d30c: f94027e0     	ldr	x0, [sp, #0x48]
 426d310: f9402fe8     	ldr	x8, [sp, #0x58]
 426d314: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426d318: 96f66ee8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426d31c: 17ffff60     	b	0x426d09c <_ChromeMain+0x4267e00>
 426d320: a94012c3     	ldp	x3, x4, [x22]
 426d324: 17ffffe6     	b	0x426d2bc <_ChromeMain+0x4268020>
 426d328: 9100c3e0     	add	x0, sp, #0x30
 426d32c: 9722e6f1     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 426d330: f9401be0     	ldr	x0, [sp, #0x30]
 426d334: f94023e8     	ldr	x8, [sp, #0x40]
 426d338: d37be901     	lsl	x1, x8, #5
 426d33c: 96f66edf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426d340: 17fffff1     	b	0x426d304 <_ChromeMain+0x4268068>
 426d344: d63f0100     	blr	x8
 426d348: 17ffff79     	b	0x426d12c <_ChromeMain+0x4267e90>
 426d34c: d4200000     	brk	#0
 426d350: d4400000     	hlt	#0
 426d354: d4200020     	brk	#0x1
 426d358: d2800000     	mov	x0, #0x0                ; =0
 426d35c: 17fffedb     	b	0x426cec8 <_ChromeMain+0x4267c2c>
 426d360: 92f00000     	mov	x0, #0x7fffffffffffffff ; =9223372036854775807
 426d364: 17fffed9     	b	0x426cec8 <_ChromeMain+0x4267c2c>
 426d368: d2800000     	mov	x0, #0x0                ; =0
 426d36c: 17ffff70     	b	0x426d12c <_ChromeMain+0x4267e90>
 426d370: 92f00000     	mov	x0, #0x7fffffffffffffff ; =9223372036854775807
 426d374: 17ffff6e     	b	0x426d12c <_ChromeMain+0x4267e90>
 426d378: d4200000     	brk	#0
 426d37c: d4400000     	hlt	#0
 426d380: d4200020     	brk	#0x1
 426d384: 00000000     	udf	#0x0
