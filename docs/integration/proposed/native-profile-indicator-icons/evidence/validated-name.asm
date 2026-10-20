Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 456da74: d101c3ff     	sub	sp, sp, #0x70
 456da78: a90267fa     	stp	x26, x25, [sp, #0x20]
 456da7c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 456da80: a90457f6     	stp	x22, x21, [sp, #0x40]
 456da84: a9054ff4     	stp	x20, x19, [sp, #0x50]
 456da88: a9067bfd     	stp	x29, x30, [sp, #0x60]
 456da8c: 910183fd     	add	x29, sp, #0x60
 456da90: aa0803f3     	mov	x19, x8
 456da94: b4000580     	cbz	x0, 0x456db44 <_ChromeMain+0x45688a8>
 456da98: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 456da9c: f9000fff     	str	xzr, [sp, #0x18]
 456daa0: d0044c61     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 456daa4: 91124821     	add	x1, x1, #0x492
 456daa8: 910023f6     	add	x22, sp, #0x8
 456daac: 910023e8     	add	x8, sp, #0x8
 456dab0: 9752ce41     	bl	0x1a213b4 <_ChromeMain+0x1a1c118>
 456dab4: 39807ff8     	ldrsb	x24, [sp, #0x1f]
 456dab8: a940d7f4     	ldp	x20, x21, [sp, #0x8]
 456dabc: f100031f     	cmp	x24, #0x0
 456dac0: 9a964296     	csel	x22, x20, x22, mi
 456dac4: 7100031f     	cmp	w24, #0x0
 456dac8: 9a9842b7     	csel	x23, x21, x24, mi
 456dacc: f0052b39     	adrp	x25, 0xead4000 <dyld_stub_binder+0xead4000>
 456dad0: 91316339     	add	x25, x25, #0xc58
 456dad4: 5280f01a     	mov	w26, #0x780             ; =1920
 456dad8: 14000004     	b	0x456dae8 <_ChromeMain+0x456884c>
 456dadc: 9100a339     	add	x25, x25, #0x28
 456dae0: f100a35a     	subs	x26, x26, #0x28
 456dae4: 54000200     	b.eq	0x456db24 <_ChromeMain+0x4568888>
 456dae8: f9400728     	ldr	x8, [x25, #0x8]
 456daec: eb17011f     	cmp	x8, x23
 456daf0: 54ffff61     	b.ne	0x456dadc <_ChromeMain+0x4568840>
 456daf4: f9400320     	ldr	x0, [x25]
 456daf8: aa1603e1     	mov	x1, x22
 456dafc: aa1703e2     	mov	x2, x23
 456db00: 94ea6f58     	bl	0x8009860 <_ChromeMain+0x80045c4>
 456db04: 35fffec0     	cbnz	w0, 0x456dadc <_ChromeMain+0x4568840>
 456db08: b40000f9     	cbz	x25, 0x456db24 <_ChromeMain+0x4568888>
 456db0c: 37f802f8     	tbnz	w24, #0x1f, 0x456db68 <_ChromeMain+0x45688cc>
 456db10: 3cc083e0     	ldur	q0, [sp, #0x8]
 456db14: 3d800260     	str	q0, [x19]
 456db18: f9400fe8     	ldr	x8, [sp, #0x18]
 456db1c: f9000a68     	str	x8, [x19, #0x10]
 456db20: 1400000b     	b	0x456db4c <_ChromeMain+0x45688b0>
 456db24: a9007e7f     	stp	xzr, xzr, [x19]
 456db28: f9000a7f     	str	xzr, [x19, #0x10]
 456db2c: 36380118     	tbz	w24, #0x7, 0x456db4c <_ChromeMain+0x45688b0>
 456db30: f94007e0     	ldr	x0, [sp, #0x8]
 456db34: f9400fe8     	ldr	x8, [sp, #0x18]
 456db38: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 456db3c: 96ea6cdf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 456db40: 14000003     	b	0x456db4c <_ChromeMain+0x45688b0>
 456db44: a9007e7f     	stp	xzr, xzr, [x19]
 456db48: f9000a7f     	str	xzr, [x19, #0x10]
 456db4c: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 456db50: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 456db54: a94457f6     	ldp	x22, x21, [sp, #0x40]
 456db58: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 456db5c: a94267fa     	ldp	x26, x25, [sp, #0x20]
 456db60: 9101c3ff     	add	sp, sp, #0x70
 456db64: d65f03c0     	ret
 456db68: aa1303e0     	mov	x0, x19
 456db6c: aa1403e1     	mov	x1, x20
 456db70: aa1503e2     	mov	x2, x21
 456db74: 96eaa9a9     	bl	0x18218 <_ChromeMain+0x12f7c>
 456db78: 39407ff8     	ldrb	w24, [sp, #0x1f]
 456db7c: 373ffdb8     	tbnz	w24, #0x7, 0x456db30 <_ChromeMain+0x4568894>
 456db80: 17fffff3     	b	0x456db4c <_ChromeMain+0x45688b0>
