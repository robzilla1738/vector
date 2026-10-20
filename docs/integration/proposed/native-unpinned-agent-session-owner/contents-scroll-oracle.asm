
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3161a40: f940c408     	ldr	x8, [x0, #0x188]
 3161a44: b4000548     	cbz	x8, 0x3161aec <_ChromeMain+0x315c850>
 3161a48: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 3161a4c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 3161a50: a9027bfd     	stp	x29, x30, [sp, #0x20]
 3161a54: 910083fd     	add	x29, sp, #0x20
 3161a58: f940c513     	ldr	x19, [x8, #0x188]
 3161a5c: b40004d3     	cbz	x19, 0x3161af4 <_ChromeMain+0x315c858>
 3161a60: f9400268     	ldr	x8, [x19]
 3161a64: f9402d08     	ldr	x8, [x8, #0x58]
 3161a68: aa1303e0     	mov	x0, x19
 3161a6c: d63f0100     	blr	x8
 3161a70: aa0003f4     	mov	x20, x0
 3161a74: b005f276     	adrp	x22, 0xefae000 <dyld_stub_binder+0xefae000>
 3161a78: f947fed5     	ldr	x21, [x22, #0xff8]
 3161a7c: b5000255     	cbnz	x21, 0x3161ac4 <_ChromeMain+0x315c828>
 3161a80: 52800d00     	mov	w0, #0x68               ; =104
 3161a84: 973ab639     	bl	0xf368 <_ChromeMain+0xa0cc>
 3161a88: aa0003f5     	mov	x21, x0
 3161a8c: f0055f01     	adrp	x1, 0xdd44000 <dyld_stub_binder+0xdd44000>
 3161a90: 9123d821     	add	x1, x1, #0x8f6
 3161a94: 528004a2     	mov	w2, #0x25               ; =37
 3161a98: 528006a3     	mov	w3, #0x35               ; =53
 3161a9c: 974f16b7     	bl	0x527578 <_ChromeMain+0x5222dc>
 3161aa0: f0058f68     	adrp	x8, 0xe350000 <dyld_stub_binder+0xe350000>
 3161aa4: 912a2108     	add	x8, x8, #0xa88
 3161aa8: f9000008     	str	x8, [x0]
 3161aac: 94000526     	bl	0x3162f44 <_ChromeMain+0x315dca8>
 3161ab0: aa1503e0     	mov	x0, x21
 3161ab4: 9799134c     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 3161ab8: f907fed5     	str	x21, [x22, #0xff8]
 3161abc: 14000002     	b	0x3161ac4 <_ChromeMain+0x315c828>
 3161ac0: f9402694     	ldr	x20, [x20, #0x48]
 3161ac4: f100029f     	cmp	x20, #0x0
 3161ac8: 1a9f07e8     	cset	w8, ne
 3161acc: fa551284     	ccmp	x20, x21, #0x4, ne
 3161ad0: 54ffff81     	b.ne	0x3161ac0 <_ChromeMain+0x315c824>
 3161ad4: 7100011f     	cmp	w8, #0x0
 3161ad8: 9a9f1260     	csel	x0, x19, xzr, ne
 3161adc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 3161ae0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 3161ae4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 3161ae8: d65f03c0     	ret
 3161aec: d2800000     	mov	x0, #0x0                ; =0
 3161af0: d65f03c0     	ret
 3161af4: d2800000     	mov	x0, #0x0                ; =0
 3161af8: 17fffff9     	b	0x3161adc <_ChromeMain+0x315c840>
