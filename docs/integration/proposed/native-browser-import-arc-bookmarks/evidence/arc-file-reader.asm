
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4259984: d10203ff     	sub	sp, sp, #0x80
 4259988: a90557f6     	stp	x22, x21, [sp, #0x50]
 425998c: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4259990: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4259994: 9101c3fd     	add	x29, sp, #0x70
 4259998: aa0003f4     	mov	x20, x0
 425999c: aa0803f3     	mov	x19, x8
 42599a0: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 42599a4: f90027ff     	str	xzr, [sp, #0x48]
 42599a8: 910083e8     	add	x8, sp, #0x20
 42599ac: 52800000     	mov	w0, #0x0                ; =0
 42599b0: 940019d3     	bl	0x42600fc <_ChromeMain+0x425ae60>
 42599b4: 910003e8     	mov	x8, sp
 42599b8: 910083e0     	add	x0, sp, #0x20
 42599bc: 9739ccba     	bl	0x10ccca4 <_ChromeMain+0x10c7a08>
 42599c0: d004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42599c4: 91126021     	add	x1, x1, #0x498
 42599c8: 9100e3e8     	add	x8, sp, #0x38
 42599cc: 910003e0     	mov	x0, sp
 42599d0: 52800282     	mov	w2, #0x14               ; =20
 42599d4: 9750fe90     	bl	0x1699414 <_ChromeMain+0x1694178>
 42599d8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 42599dc: 37f804e8     	tbnz	w8, #0x1f, 0x4259a78 <_ChromeMain+0x42547dc>
 42599e0: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 42599e4: 37f80408     	tbnz	w8, #0x1f, 0x4259a64 <_ChromeMain+0x42547c8>
 42599e8: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 42599ec: f9001bff     	str	xzr, [sp, #0x30]
 42599f0: 910083f5     	add	x21, sp, #0x20
 42599f4: 9100e3e0     	add	x0, sp, #0x38
 42599f8: 910083e1     	add	x1, sp, #0x20
 42599fc: 92800002     	mov	x2, #-0x1               ; =-1
 4259a00: 9774e462     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 4259a04: 36000440     	tbz	w0, #0x0, 0x4259a8c <_ChromeMain+0x42547f0>
 4259a08: 6f00e400     	movi.2d	v0, #0000000000000000
 4259a0c: ad0003e0     	stp	q0, q0, [sp]
 4259a10: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 4259a14: a9422be9     	ldp	x9, x10, [sp, #0x20]
 4259a18: f100011f     	cmp	x8, #0x0
 4259a1c: 9a954120     	csel	x0, x9, x21, mi
 4259a20: 7100011f     	cmp	w8, #0x0
 4259a24: 9a884141     	csel	x1, x10, x8, mi
 4259a28: 910003e8     	mov	x8, sp
 4259a2c: 52800002     	mov	w2, #0x0                ; =0
 4259a30: 52801903     	mov	w3, #0xc8               ; =200
 4259a34: 9765a142     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 4259a38: 394063e8     	ldrb	w8, [sp, #0x18]
 4259a3c: 36000288     	tbz	w8, #0x0, 0x4259a8c <_ChromeMain+0x42547f0>
 4259a40: 910003e0     	mov	x0, sp
 4259a44: aa1303e8     	mov	x8, x19
 4259a48: aa1403e1     	mov	x1, x20
 4259a4c: 94004699     	bl	0x426b4b0 <_ChromeMain+0x4266214>
 4259a50: 394063e8     	ldrb	w8, [sp, #0x18]
 4259a54: 34000208     	cbz	w8, 0x4259a94 <_ChromeMain+0x42547f8>
 4259a58: 910003e0     	mov	x0, sp
 4259a5c: 971c1289     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4259a60: 1400000d     	b	0x4259a94 <_ChromeMain+0x42547f8>
 4259a64: f94013e0     	ldr	x0, [sp, #0x20]
 4259a68: f9401be8     	ldr	x8, [sp, #0x30]
 4259a6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259a70: 96f6bd12     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259a74: 17ffffdd     	b	0x42599e8 <_ChromeMain+0x425474c>
 4259a78: f94003e0     	ldr	x0, [sp]
 4259a7c: f9400be8     	ldr	x8, [sp, #0x10]
 4259a80: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259a84: 96f6bd0d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259a88: 17ffffd6     	b	0x42599e0 <_ChromeMain+0x4254744>
 4259a8c: a9007e7f     	stp	xzr, xzr, [x19]
 4259a90: f9000a7f     	str	xzr, [x19, #0x10]
 4259a94: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4259a98: 36f800a8     	tbz	w8, #0x1f, 0x4259aac <_ChromeMain+0x4254810>
 4259a9c: f94013e0     	ldr	x0, [sp, #0x20]
 4259aa0: f9401be8     	ldr	x8, [sp, #0x30]
 4259aa4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259aa8: 96f6bd04     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259aac: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 4259ab0: 37f800c8     	tbnz	w8, #0x1f, 0x4259ac8 <_ChromeMain+0x425482c>
 4259ab4: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4259ab8: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4259abc: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4259ac0: 910203ff     	add	sp, sp, #0x80
 4259ac4: d65f03c0     	ret
 4259ac8: f9401fe0     	ldr	x0, [sp, #0x38]
 4259acc: f94027e8     	ldr	x8, [sp, #0x48]
 4259ad0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259ad4: 96f6bcf9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259ad8: 17fffff7     	b	0x4259ab4 <_ChromeMain+0x4254818>
