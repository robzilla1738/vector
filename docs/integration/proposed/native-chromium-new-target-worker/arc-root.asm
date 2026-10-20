
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426dbbc: d101c3ff     	sub	sp, sp, #0x70
 426dbc0: a9035ff8     	stp	x24, x23, [sp, #0x30]
 426dbc4: a90457f6     	stp	x22, x21, [sp, #0x40]
 426dbc8: a9054ff4     	stp	x20, x19, [sp, #0x50]
 426dbcc: a9067bfd     	stp	x29, x30, [sp, #0x60]
 426dbd0: 910183fd     	add	x29, sp, #0x60
 426dbd4: aa0203f6     	mov	x22, x2
 426dbd8: aa0103f4     	mov	x20, x1
 426dbdc: aa0003f5     	mov	x21, x0
 426dbe0: aa0803f3     	mov	x19, x8
 426dbe4: 90054a28     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 426dbe8: f9468508     	ldr	x8, [x8, #0xd08]
 426dbec: 10311229     	adr	x9, 0x42cfe30 <_ChromeMain+0x42cab94>
 426dbf0: d503201f     	nop
 426dbf4: eb09011f     	cmp	x8, x9
 426dbf8: 54000fc1     	b.ne	0x426ddf0 <_ChromeMain+0x4268b54>
 426dbfc: 94f70f65     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 426dc00: 1e602008     	fcmp	d0, #0.0
 426dc04: 54000fa0     	b.eq	0x426ddf8 <_ChromeMain+0x4268b5c>
 426dc08: 92f00000     	mov	x0, #0x7fffffffffffffff ; =9223372036854775807
 426dc0c: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 426dc10: 9e670101     	fmov	d1, x8
 426dc14: 1e612000     	fcmp	d0, d1
 426dc18: 540003a0     	b.eq	0x426dc8c <_ChromeMain+0x42689f0>
 426dc1c: f004edc8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 426dc20: f9444908     	ldr	x8, [x8, #0x890]
 426dc24: fd400101     	ldr	d1, [x8]
 426dc28: 1e612800     	fadd	d0, d0, d1
 426dc2c: d004e6e8     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 426dc30: fd45ad01     	ldr	d1, [x8, #0xb58]
 426dc34: 1e610800     	fmul	d0, d0, d1
 426dc38: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 426dc3c: 9e670101     	fmov	d1, x8
 426dc40: 1e612000     	fcmp	d0, d1
 426dc44: 9a80b3e8     	csel	x8, xzr, x0, lt
 426dc48: 1e616801     	fmaxnm	d1, d0, d1
 426dc4c: 9e780029     	fcvtzs	x9, d1
 426dc50: 92f7840a     	mov	x10, #0x43dfffffffffffff ; =4890909195324358655
 426dc54: 9e670141     	fmov	d1, x10
 426dc58: 1e612000     	fcmp	d0, d1
 426dc5c: 9a889120     	csel	x0, x9, x8, ls
 426dc60: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 426dc64: 8b080008     	add	x8, x0, x8
 426dc68: f100091f     	cmp	x8, #0x2
 426dc6c: 54000103     	b.lo	0x426dc8c <_ChromeMain+0x42689f0>
 426dc70: d2880008     	mov	x8, #0x4000             ; =16384
 426dc74: f2a910c8     	movk	x8, #0x4886, lsl #16
 426dc78: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 426dc7c: f2e00528     	movk	x8, #0x29, lsl #48
 426dc80: ab080008     	adds	x8, x0, x8
 426dc84: 92f00009     	mov	x9, #0x7fffffffffffffff ; =9223372036854775807
 426dc88: 9a886120     	csel	x0, x9, x8, vs
 426dc8c: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 426dc90: f90017ff     	str	xzr, [sp, #0x28]
 426dc94: 910063f7     	add	x23, sp, #0x18
 426dc98: 910063e8     	add	x8, sp, #0x18
 426dc9c: 975a7e82     	bl	0x190d6a4 <_ChromeMain+0x1908408>
 426dca0: a9007e7f     	stp	xzr, xzr, [x19]
 426dca4: f9000a7f     	str	xzr, [x19, #0x10]
 426dca8: a9007fff     	stp	xzr, xzr, [sp]
 426dcac: f9000bff     	str	xzr, [sp, #0x10]
 426dcb0: d004b701     	adrp	x1, 0xd94f000 <dyld_stub_binder+0xd94f000>
 426dcb4: 9109c821     	add	x1, x1, #0x272
 426dcb8: 910003e3     	mov	x3, sp
 426dcbc: aa1303e0     	mov	x0, x19
 426dcc0: 52800102     	mov	w2, #0x8                ; =8
 426dcc4: 9722e45d     	bl	0xb26e38 <_ChromeMain+0xb21b9c>
 426dcc8: f94003e1     	ldr	x1, [sp]
 426dccc: b5000841     	cbnz	x1, 0x426ddd4 <_ChromeMain+0x4268b38>
 426dcd0: 3980bfe8     	ldrsb	x8, [sp, #0x2f]
 426dcd4: a941abe9     	ldp	x9, x10, [sp, #0x18]
 426dcd8: f100011f     	cmp	x8, #0x0
 426dcdc: 9a974123     	csel	x3, x9, x23, mi
 426dce0: 7100011f     	cmp	w8, #0x0
 426dce4: 9a884144     	csel	x4, x10, x8, mi
 426dce8: d004c581     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 426dcec: 91123421     	add	x1, x1, #0x48d
 426dcf0: aa1303e0     	mov	x0, x19
 426dcf4: 52800142     	mov	w2, #0xa                ; =10
 426dcf8: 9750ca34     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 426dcfc: 9004bc61     	adrp	x1, 0xd9f9000 <dyld_stub_binder+0xd9f9000>
 426dd00: 912e4c21     	add	x1, x1, #0xb93
 426dd04: f004abd7     	adrp	x23, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 426dd08: 9118d2f7     	add	x23, x23, #0x634
 426dd0c: aa1303e0     	mov	x0, x19
 426dd10: 528001c2     	mov	w2, #0xe                ; =14
 426dd14: aa1703e3     	mov	x3, x23
 426dd18: 9750ca76     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 426dd1c: f004c581     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426dd20: 9113b021     	add	x1, x1, #0x4ec
 426dd24: aa1303e0     	mov	x0, x19
 426dd28: 528001a2     	mov	w2, #0xd                ; =13
 426dd2c: aa1703e3     	mov	x3, x23
 426dd30: 9750ca70     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 426dd34: b004ac21     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 426dd38: 91102821     	add	x1, x1, #0x40a
 426dd3c: aa1303e0     	mov	x0, x19
 426dd40: 52800082     	mov	w2, #0x4                ; =4
 426dd44: aa1603e3     	mov	x3, x22
 426dd48: 9750ca6a     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 426dd4c: 39805ea4     	ldrsb	x4, [x21, #0x17]
 426dd50: b6f80044     	tbz	x4, #0x3f, 0x426dd58 <_ChromeMain+0x4268abc>
 426dd54: a94012b5     	ldp	x21, x4, [x21]
 426dd58: d004ac01     	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426dd5c: 9109e421     	add	x1, x1, #0x279
 426dd60: aa1303e0     	mov	x0, x19
 426dd64: 52800042     	mov	w2, #0x2                ; =2
 426dd68: aa1503e3     	mov	x3, x21
 426dd6c: 9750ca17     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 426dd70: b004ac21     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 426dd74: 9138dc21     	add	x1, x1, #0xe37
 426dd78: aa1303e0     	mov	x0, x19
 426dd7c: 52800082     	mov	w2, #0x4                ; =4
 426dd80: aa1403e3     	mov	x3, x20
 426dd84: 9750ca5b     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 426dd88: f004aba1     	adrp	x1, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 426dd8c: 911cdc21     	add	x1, x1, #0x737
 426dd90: f004c583     	adrp	x3, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426dd94: 9118e463     	add	x3, x3, #0x639
 426dd98: aa1303e0     	mov	x0, x19
 426dd9c: 52800082     	mov	w2, #0x4                ; =4
 426dda0: 9750ca54     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 426dda4: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 426dda8: 36f800a8     	tbz	w8, #0x1f, 0x426ddbc <_ChromeMain+0x4268b20>
 426ddac: f9400fe0     	ldr	x0, [sp, #0x18]
 426ddb0: f94017e8     	ldr	x8, [sp, #0x28]
 426ddb4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426ddb8: 96f66c40     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426ddbc: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 426ddc0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 426ddc4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 426ddc8: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 426ddcc: 9101c3ff     	add	sp, sp, #0x70
 426ddd0: d65f03c0     	ret
 426ddd4: 910003e0     	mov	x0, sp
 426ddd8: 9722e446     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 426dddc: f94003e0     	ldr	x0, [sp]
 426dde0: f9400be8     	ldr	x8, [sp, #0x10]
 426dde4: d37be901     	lsl	x1, x8, #5
 426dde8: 96f66c34     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426ddec: 17ffffb9     	b	0x426dcd0 <_ChromeMain+0x4268a34>
 426ddf0: d63f0100     	blr	x8
 426ddf4: 17ffffa6     	b	0x426dc8c <_ChromeMain+0x42689f0>
 426ddf8: d2800000     	mov	x0, #0x0                ; =0
 426ddfc: 17ffffa4     	b	0x426dc8c <_ChromeMain+0x42689f0>
