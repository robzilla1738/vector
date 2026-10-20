
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 21239c0: d10483ff     	sub	sp, sp, #0x120
 21239c4: a90f6ffc     	stp	x28, x27, [sp, #0xf0]
 21239c8: a9104ff4     	stp	x20, x19, [sp, #0x100]
 21239cc: a9117bfd     	stp	x29, x30, [sp, #0x110]
 21239d0: 910443fd     	add	x29, sp, #0x110
 21239d4: aa0003f3     	mov	x19, x0
 21239d8: 6f00e400     	movi.2d	v0, #0000000000000000
 21239dc: ad3d03a0     	stp	q0, q0, [x29, #-0x60]
 21239e0: ad3c03a0     	stp	q0, q0, [x29, #-0x80]
 21239e4: b005c300     	adrp	x0, 0xd984000 <dyld_stub_binder+0xd984000>
 21239e8: 911ac400     	add	x0, x0, #0x6b1
 21239ec: f005d221     	adrp	x1, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 21239f0: 91311421     	add	x1, x1, #0xc45
 21239f4: 910003f4     	mov	x20, sp
 21239f8: 910003e8     	mov	x8, sp
 21239fc: 52805242     	mov	w2, #0x292              ; =658
 2123a00: 977cb4a0     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 2123a04: d10203a0     	sub	x0, x29, #0x80
 2123a08: 52800001     	mov	w1, #0x0                ; =0
 2123a0c: 52800002     	mov	w2, #0x0                ; =0
 2123a10: 97be4245     	bl	0x10b4324 <_ChromeMain+0x10af088>
 2123a14: 52800148     	mov	w8, #0xa                ; =10
 2123a18: f81c83a8     	stur	x8, [x29, #-0x38]
 2123a1c: d0066f28     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 2123a20: 3955c900     	ldrb	w0, [x8, #0x572]
 2123a24: 35000300     	cbnz	w0, 0x2123a84 <_ChromeMain+0x211e7e8>
 2123a28: 6f00e400     	movi.2d	v0, #0000000000000000
 2123a2c: ad0383e0     	stp	q0, q0, [sp, #0x70]
 2123a30: ad0283e0     	stp	q0, q0, [sp, #0x50]
 2123a34: ad0183e0     	stp	q0, q0, [sp, #0x30]
 2123a38: ad0083e0     	stp	q0, q0, [sp, #0x10]
 2123a3c: 3d8003e0     	str	q0, [sp]
 2123a40: 910003e1     	mov	x1, sp
 2123a44: aa1303e0     	mov	x0, x19
 2123a48: 97972bc9     	bl	0x6ee96c <_ChromeMain+0x6e96d0>
 2123a4c: 7100001f     	cmp	w0, #0x0
 2123a50: 79400be8     	ldrh	w8, [sp, #0x4]
 2123a54: 12140d08     	and	w8, w8, #0xf000
 2123a58: 52880009     	mov	w9, #0x4000             ; =16384
 2123a5c: 7a490100     	ccmp	w8, w9, #0x0, eq
 2123a60: 1a9f17f3     	cset	w19, eq
 2123a64: d10203a0     	sub	x0, x29, #0x80
 2123a68: 97a52c47     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 2123a6c: aa1303e0     	mov	x0, x19
 2123a70: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 2123a74: a9504ff4     	ldp	x20, x19, [sp, #0x100]
 2123a78: a94f6ffc     	ldp	x28, x27, [sp, #0xf0]
 2123a7c: 910483ff     	add	sp, sp, #0x120
 2123a80: d65f03c0     	ret
 2123a84: f005d228     	adrp	x8, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 2123a88: 910a4d08     	add	x8, x8, #0x293
 2123a8c: a93d23b4     	stp	x20, x8, [x29, #-0x30]
 2123a90: d100e3a1     	sub	x1, x29, #0x38
 2123a94: d100a3a2     	sub	x2, x29, #0x28
 2123a98: d100c3a3     	sub	x3, x29, #0x30
 2123a9c: 979dbaf4     	bl	0x89266c <_ChromeMain+0x88d3d0>
 2123aa0: 17ffffe2     	b	0x2123a28 <_ChromeMain+0x211e78c>
