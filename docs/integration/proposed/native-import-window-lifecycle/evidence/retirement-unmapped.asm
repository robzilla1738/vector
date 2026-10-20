
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2959bb0: d10103ff     	sub	sp, sp, #0x40
 2959bb4: a90157f6     	stp	x22, x21, [sp, #0x10]
 2959bb8: a9024ff4     	stp	x20, x19, [sp, #0x20]
 2959bbc: a9037bfd     	stp	x29, x30, [sp, #0x30]
 2959bc0: 9100c3fd     	add	x29, sp, #0x30
 2959bc4: aa0003f3     	mov	x19, x0
 2959bc8: 52800028     	mov	w8, #0x1                ; =1
 2959bcc: 3908a008     	strb	w8, [x0, #0x228]
 2959bd0: f9415c14     	ldr	x20, [x0, #0x2b8]
 2959bd4: b00612d5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2959bd8: b4000174     	cbz	x20, 0x2959c04 <_ChromeMain+0x2954968>
 2959bdc: f9015e7f     	str	xzr, [x19, #0x2b8]
 2959be0: f9415a61     	ldr	x1, [x19, #0x2b0]
 2959be4: 91002280     	add	x0, x20, #0x8
 2959be8: 97bb4424     	bl	0x182ac78 <_ChromeMain+0x18259dc>
 2959bec: 925e7688     	and	x8, x20, #0xfffffffc00000000
 2959bf0: f94046a9     	ldr	x9, [x21, #0x88]
 2959bf4: eb09011f     	cmp	x8, x9
 2959bf8: 54000061     	b.ne	0x2959c04 <_ChromeMain+0x2954968>
 2959bfc: aa1403e0     	mov	x0, x20
 2959c00: 975b238f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 2959c04: 910a0668     	add	x8, x19, #0x281
 2959c08: 925e7514     	and	x20, x8, #0xfffffffc00000000
 2959c0c: f94046a8     	ldr	x8, [x21, #0x88]
 2959c10: eb08029f     	cmp	x20, x8
 2959c14: 54000061     	b.ne	0x2959c20 <_ChromeMain+0x2954984>
 2959c18: 910a0660     	add	x0, x19, #0x281
 2959c1c: 975ae9b8     	bl	0x142fc <_ChromeMain+0xf060>
 2959c20: 394a0676     	ldrb	w22, [x19, #0x281]
 2959c24: 52800028     	mov	w8, #0x1                ; =1
 2959c28: 390a0668     	strb	w8, [x19, #0x281]
 2959c2c: f90007f3     	str	x19, [sp, #0x8]
 2959c30: 9103e260     	add	x0, x19, #0xf8
 2959c34: 910023e3     	add	x3, sp, #0x8
 2959c38: 52800201     	mov	w1, #0x10               ; =16
 2959c3c: 52800022     	mov	w2, #0x1                ; =1
 2959c40: 97b9c154     	bl	0x17ca190 <_ChromeMain+0x17c4ef4>
 2959c44: 940675c0     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 2959c48: f90007f3     	str	x19, [sp, #0x8]
 2959c4c: b003ec21     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 2959c50: 9138d021     	add	x1, x1, #0xe34
 2959c54: 910023e3     	add	x3, sp, #0x8
 2959c58: d2800002     	mov	x2, #0x0                ; =0
 2959c5c: 97e300da     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 2959c60: 390a0676     	strb	w22, [x19, #0x281]
 2959c64: f94046a8     	ldr	x8, [x21, #0x88]
 2959c68: eb08029f     	cmp	x20, x8
 2959c6c: 54000061     	b.ne	0x2959c78 <_ChromeMain+0x29549dc>
 2959c70: 910a0660     	add	x0, x19, #0x281
 2959c74: 975b2372     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 2959c78: f9407268     	ldr	x8, [x19, #0xe0]
 2959c7c: b40001a8     	cbz	x8, 0x2959cb0 <_ChromeMain+0x2954a14>
 2959c80: 19404108     	ldapurb	w8, [x8, #0x4]
 2959c84: 35000168     	cbnz	w8, 0x2959cb0 <_ChromeMain+0x2954a14>
 2959c88: f9407668     	ldr	x8, [x19, #0xe8]
 2959c8c: b4000128     	cbz	x8, 0x2959cb0 <_ChromeMain+0x2954a14>
 2959c90: f9407268     	ldr	x8, [x19, #0xe0]
 2959c94: b4000188     	cbz	x8, 0x2959cc4 <_ChromeMain+0x2954a28>
 2959c98: 19404108     	ldapurb	w8, [x8, #0x4]
 2959c9c: 35000148     	cbnz	w8, 0x2959cc4 <_ChromeMain+0x2954a28>
 2959ca0: f9407668     	ldr	x8, [x19, #0xe8]
 2959ca4: f9402500     	ldr	x0, [x8, #0x48]
 2959ca8: b4000040     	cbz	x0, 0x2959cb0 <_ChromeMain+0x2954a14>
 2959cac: 97f70729     	bl	0x271b950 <_ChromeMain+0x27166b4>
 2959cb0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 2959cb4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 2959cb8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 2959cbc: 910103ff     	add	sp, sp, #0x40
 2959cc0: d65f03c0     	ret
