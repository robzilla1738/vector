
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 a6ddb24: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 a6ddb28: a90157f6     	stp	x22, x21, [sp, #0x10]
 a6ddb2c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 a6ddb30: a9037bfd     	stp	x29, x30, [sp, #0x30]
 a6ddb34: 9100c3fd     	add	x29, sp, #0x30
 a6ddb38: aa0203f4     	mov	x20, x2
 a6ddb3c: aa0103f6     	mov	x22, x1
 a6ddb40: aa0003f3     	mov	x19, x0
 a6ddb44: f001e3a8     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 a6ddb48: 91216108     	add	x8, x8, #0x858
 a6ddb4c: 91032109     	add	x9, x8, #0xc8
 a6ddb50: aa0003f5     	mov	x21, x0
 a6ddb54: f8008ea9     	str	x9, [x21, #0x8]!
 a6ddb58: f9000008     	str	x8, [x0]
 a6ddb5c: 925e7428     	and	x8, x1, #0xfffffffc00000000
 a6ddb60: b00226b7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 a6ddb64: f94046e9     	ldr	x9, [x23, #0x88]
 a6ddb68: eb09011f     	cmp	x8, x9
 a6ddb6c: 54000061     	b.ne	0xa6ddb78 <_ChromeMain+0xa6d88dc>
 a6ddb70: aa1603e0     	mov	x0, x22
 a6ddb74: 94929335     	bl	0xcb82848 <_ChromeMain+0xcb7d5ac>
 a6ddb78: f9000a76     	str	x22, [x19, #0x10]
 a6ddb7c: 52803d00     	mov	w0, #0x1e8              ; =488
 a6ddb80: 9492932f     	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 a6ddb84: 971c8b4a     	bl	0x6e008ac <_ChromeMain+0x6dfb610>
 a6ddb88: f9000e60     	str	x0, [x19, #0x18]
 a6ddb8c: f94046e8     	ldr	x8, [x23, #0x88]
 a6ddb90: 925e7669     	and	x9, x19, #0xfffffffc00000000
 a6ddb94: eb08013f     	cmp	x9, x8
 a6ddb98: 54000081     	b.ne	0xa6ddba8 <_ChromeMain+0xa6d890c>
 a6ddb9c: aa1303e0     	mov	x0, x19
 a6ddba0: 9492932a     	bl	0xcb82848 <_ChromeMain+0xcb7d5ac>
 a6ddba4: f94046e8     	ldr	x8, [x23, #0x88]
 a6ddba8: a9027e73     	stp	x19, xzr, [x19, #0x20]
 a6ddbac: 925e76a9     	and	x9, x21, #0xfffffffc00000000
 a6ddbb0: eb08013f     	cmp	x9, x8
 a6ddbb4: 54000061     	b.ne	0xa6ddbc0 <_ChromeMain+0xa6d8924>
 a6ddbb8: aa1503e0     	mov	x0, x21
 a6ddbbc: 94929323     	bl	0xcb82848 <_ChromeMain+0xcb7d5ac>
 a6ddbc0: a9037e75     	stp	x21, xzr, [x19, #0x30]
 a6ddbc4: f9400a60     	ldr	x0, [x19, #0x10]
 a6ddbc8: f9401008     	ldr	x8, [x0, #0x20]
 a6ddbcc: b5000068     	cbnz	x8, 0xa6ddbd8 <_ChromeMain+0xa6d893c>
 a6ddbd0: 52800021     	mov	w1, #0x1                ; =1
 a6ddbd4: 9492bf48     	bl	0xcb8d8f4 <_ChromeMain+0xcb88658>
 a6ddbd8: f9400e60     	ldr	x0, [x19, #0x18]
 a6ddbdc: aa1403e1     	mov	x1, x20
 a6ddbe0: 971c8b64     	bl	0x6e00970 <_ChromeMain+0x6dfb6d4>
 a6ddbe4: a9412260     	ldp	x0, x8, [x19, #0x10]
 a6ddbe8: f9403501     	ldr	x1, [x8, #0x68]
 a6ddbec: f9400008     	ldr	x8, [x0]
 a6ddbf0: f9405d08     	ldr	x8, [x8, #0xb8]
 a6ddbf4: 52800022     	mov	w2, #0x1                ; =1
 a6ddbf8: d63f0100     	blr	x8
 a6ddbfc: a9410268     	ldp	x8, x0, [x19, #0x10]
 a6ddc00: f9401108     	ldr	x8, [x8, #0x20]
 a6ddc04: 9101b101     	add	x1, x8, #0x6c
 a6ddc08: 971c8bba     	bl	0x6e00af0 <_ChromeMain+0x6dfb854>
 a6ddc0c: f9400a61     	ldr	x1, [x19, #0x10]
 a6ddc10: 91008260     	add	x0, x19, #0x20
 a6ddc14: 964bbcce     	bl	0x39ccf4c <_ChromeMain+0x39c7cb0>
 a6ddc18: f9400e61     	ldr	x1, [x19, #0x18]
 a6ddc1c: 9100c260     	add	x0, x19, #0x30
 a6ddc20: 94000007     	bl	0xa6ddc3c <_ChromeMain+0xa6d89a0>
 a6ddc24: aa1303e0     	mov	x0, x19
 a6ddc28: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 a6ddc2c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 a6ddc30: a94157f6     	ldp	x22, x21, [sp, #0x10]
 a6ddc34: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 a6ddc38: d65f03c0     	ret
