
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465ac84: d10103ff     	sub	sp, sp, #0x40
 465ac88: a90157f6     	stp	x22, x21, [sp, #0x10]
 465ac8c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 465ac90: a9037bfd     	stp	x29, x30, [sp, #0x30]
 465ac94: 9100c3fd     	add	x29, sp, #0x30
 465ac98: aa0103f4     	mov	x20, x1
 465ac9c: 397e4008     	ldrb	w8, [x0, #0xf90]
 465aca0: 340001c8     	cbz	w8, 0x465acd8 <_ChromeMain+0x4655a3c>
 465aca4: f9400a80     	ldr	x0, [x20, #0x10]
 465aca8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465acac: 90052ac9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465acb0: f9404529     	ldr	x9, [x9, #0x88]
 465acb4: eb09011f     	cmp	x8, x9
 465acb8: 54000041     	b.ne	0x465acc0 <_ChromeMain+0x4655a24>
 465acbc: 96e71f60     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465acc0: f9000a9f     	str	xzr, [x20, #0x10]
 465acc4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 465acc8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 465accc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 465acd0: 910103ff     	add	sp, sp, #0x40
 465acd4: d65f03c0     	ret
 465acd8: aa0003f3     	mov	x19, x0
 465acdc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465ace0: 90052ad5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465ace4: f94046a9     	ldr	x9, [x21, #0x88]
 465ace8: eb09011f     	cmp	x8, x9
 465acec: 54000061     	b.ne	0x465acf8 <_ChromeMain+0x4655a5c>
 465acf0: aa1403e0     	mov	x0, x20
 465acf4: 96e6e582     	bl	0x142fc <_ChromeMain+0xf060>
 465acf8: f90007f4     	str	x20, [sp, #0x8]
 465acfc: 9132a260     	add	x0, x19, #0xca8
 465ad00: 910023e1     	add	x1, sp, #0x8
 465ad04: 910023e2     	add	x2, sp, #0x8
 465ad08: 947f8572     	bl	0x663c2d0 <_ChromeMain+0x6637034>
 465ad0c: f94007e0     	ldr	x0, [sp, #0x8]
 465ad10: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465ad14: f94046a9     	ldr	x9, [x21, #0x88]
 465ad18: eb09011f     	cmp	x8, x9
 465ad1c: 54000041     	b.ne	0x465ad24 <_ChromeMain+0x4655a88>
 465ad20: 96e71f47     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465ad24: b9400a88     	ldr	w8, [x20, #0x8]
 465ad28: 7100091f     	cmp	w8, #0x2
 465ad2c: 54000100     	b.eq	0x465ad4c <_ChromeMain+0x4655ab0>
 465ad30: 7100051f     	cmp	w8, #0x1
 465ad34: 54000140     	b.eq	0x465ad5c <_ChromeMain+0x4655ac0>
 465ad38: 35000188     	cbnz	w8, 0x465ad68 <_ChromeMain+0x4655acc>
 465ad3c: b94c8668     	ldr	w8, [x19, #0xc84]
 465ad40: 11000508     	add	w8, w8, #0x1
 465ad44: b90c8668     	str	w8, [x19, #0xc84]
 465ad48: 14000008     	b	0x465ad68 <_ChromeMain+0x4655acc>
 465ad4c: b94c8e68     	ldr	w8, [x19, #0xc8c]
 465ad50: 11000508     	add	w8, w8, #0x1
 465ad54: b90c8e68     	str	w8, [x19, #0xc8c]
 465ad58: 14000004     	b	0x465ad68 <_ChromeMain+0x4655acc>
 465ad5c: b94c8a68     	ldr	w8, [x19, #0xc88]
 465ad60: 11000508     	add	w8, w8, #0x1
 465ad64: b90c8a68     	str	w8, [x19, #0xc88]
 465ad68: aa1303e0     	mov	x0, x19
 465ad6c: d2800001     	mov	x1, #0x0                ; =0
 465ad70: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 465ad74: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 465ad78: a94157f6     	ldp	x22, x21, [sp, #0x10]
 465ad7c: 910103ff     	add	sp, sp, #0x40
 465ad80: 17ba7a1a     	b	0x34f95e8 <_ChromeMain+0x34f434c>
