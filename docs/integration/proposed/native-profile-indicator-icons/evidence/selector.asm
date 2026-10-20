Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 456d980: d10143ff     	sub	sp, sp, #0x50
 456d984: a90257f6     	stp	x22, x21, [sp, #0x20]
 456d988: a9034ff4     	stp	x20, x19, [sp, #0x30]
 456d98c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 456d990: 910103fd     	add	x29, sp, #0x40
 456d994: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 456d998: f9000fff     	str	xzr, [sp, #0x18]
 456d99c: 910023f3     	add	x19, sp, #0x8
 456d9a0: 910023e8     	add	x8, sp, #0x8
 456d9a4: 94000034     	bl	0x456da74 <_ChromeMain+0x45687d8>
 456d9a8: 39807fe8     	ldrsb	x8, [sp, #0x1f]
 456d9ac: a940abe9     	ldp	x9, x10, [sp, #0x8]
 456d9b0: f100011f     	cmp	x8, #0x0
 456d9b4: 9a934133     	csel	x19, x9, x19, mi
 456d9b8: 7100011f     	cmp	w8, #0x0
 456d9bc: 9a884154     	csel	x20, x10, x8, mi
 456d9c0: f0052b35     	adrp	x21, 0xead4000 <dyld_stub_binder+0xead4000>
 456d9c4: 913162b5     	add	x21, x21, #0xc58
 456d9c8: 5280f016     	mov	w22, #0x780             ; =1920
 456d9cc: 14000004     	b	0x456d9dc <_ChromeMain+0x4568740>
 456d9d0: 9100a2b5     	add	x21, x21, #0x28
 456d9d4: f100a2d6     	subs	x22, x22, #0x28
 456d9d8: 54000260     	b.eq	0x456da24 <_ChromeMain+0x4568788>
 456d9dc: f94006a8     	ldr	x8, [x21, #0x8]
 456d9e0: eb14011f     	cmp	x8, x20
 456d9e4: 54ffff61     	b.ne	0x456d9d0 <_ChromeMain+0x4568734>
 456d9e8: f94002a0     	ldr	x0, [x21]
 456d9ec: aa1303e1     	mov	x1, x19
 456d9f0: aa1403e2     	mov	x2, x20
 456d9f4: 94ea6f9b     	bl	0x8009860 <_ChromeMain+0x80045c4>
 456d9f8: 35fffec0     	cbnz	w0, 0x456d9d0 <_ChromeMain+0x4568734>
 456d9fc: b4000155     	cbz	x21, 0x456da24 <_ChromeMain+0x4568788>
 456da00: f9400ab3     	ldr	x19, [x21, #0x10]
 456da04: 925e7668     	and	x8, x19, #0xfffffffc00000000
 456da08: b0053229     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 456da0c: f9404529     	ldr	x9, [x9, #0x88]
 456da10: eb09011f     	cmp	x8, x9
 456da14: 540000a1     	b.ne	0x456da28 <_ChromeMain+0x456878c>
 456da18: aa1303e0     	mov	x0, x19
 456da1c: 96ea9a38     	bl	0x142fc <_ChromeMain+0xf060>
 456da20: 14000002     	b	0x456da28 <_ChromeMain+0x456878c>
 456da24: d2800013     	mov	x19, #0x0               ; =0
 456da28: 925e7668     	and	x8, x19, #0xfffffffc00000000
 456da2c: b0053229     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 456da30: f9404529     	ldr	x9, [x9, #0x88]
 456da34: eb09011f     	cmp	x8, x9
 456da38: 54000061     	b.ne	0x456da44 <_ChromeMain+0x45687a8>
 456da3c: aa1303e0     	mov	x0, x19
 456da40: 96ead3ff     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 456da44: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 456da48: 36f800a8     	tbz	w8, #0x1f, 0x456da5c <_ChromeMain+0x45687c0>
 456da4c: f94007e0     	ldr	x0, [sp, #0x8]
 456da50: f9400fe8     	ldr	x8, [sp, #0x18]
 456da54: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 456da58: 96ea6d18     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 456da5c: aa1303e0     	mov	x0, x19
 456da60: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 456da64: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 456da68: a94257f6     	ldp	x22, x21, [sp, #0x20]
 456da6c: 910143ff     	add	sp, sp, #0x50
 456da70: d65f03c0     	ret
