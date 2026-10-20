
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 456e680: d103c3ff     	sub	sp, sp, #0xf0
 456e684: a9096ffc     	stp	x28, x27, [sp, #0x90]
 456e688: a90a67fa     	stp	x26, x25, [sp, #0xa0]
 456e68c: a90b5ff8     	stp	x24, x23, [sp, #0xb0]
 456e690: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 456e694: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 456e698: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 456e69c: 910383fd     	add	x29, sp, #0xe0
 456e6a0: b40001c1     	cbz	x1, 0x456e6d8 <_ChromeMain+0x456943c>
 456e6a4: aa0303f5     	mov	x21, x3
 456e6a8: aa0203f6     	mov	x22, x2
 456e6ac: aa0103f4     	mov	x20, x1
 456e6b0: aa0003f3     	mov	x19, x0
 456e6b4: f9400028     	ldr	x8, [x1]
 456e6b8: f9403508     	ldr	x8, [x8, #0x68]
 456e6bc: aa0103e0     	mov	x0, x1
 456e6c0: d63f0100     	blr	x8
 456e6c4: b40000a0     	cbz	x0, 0x456e6d8 <_ChromeMain+0x456943c>
 456e6c8: f9400a68     	ldr	x8, [x19, #0x10]
 456e6cc: b4000288     	cbz	x8, 0x456e71c <_ChromeMain+0x4569480>
 456e6d0: f9401268     	ldr	x8, [x19, #0x20]
 456e6d4: b4000208     	cbz	x8, 0x456e714 <_ChromeMain+0x4569478>
 456e6d8: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 456e6dc: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 456e6e0: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 456e6e4: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 456e6e8: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 456e6ec: a9496ffc     	ldp	x28, x27, [sp, #0x90]
 456e6f0: 9103c3ff     	add	sp, sp, #0xf0
 456e6f4: d65f03c0     	ret
 456e6f8: f940b260     	ldr	x0, [x19, #0x160]
 456e6fc: f940ba68     	ldr	x8, [x19, #0x170]
 456e700: d37ff901     	lsl	x1, x8, #1
 456e704: 96ea69ed     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 456e708: a9167e7f     	stp	xzr, xzr, [x19, #0x160]
 456e70c: f900ba7f     	str	xzr, [x19, #0x170]
 456e710: 1400000a     	b	0x456e738 <_ChromeMain+0x456949c>
 456e714: aa1303e0     	mov	x0, x19
 456e718: 97fffeac     	bl	0x456e1c8 <_ChromeMain+0x4568f2c>
 456e71c: 9104c260     	add	x0, x19, #0x130
 456e720: aa1603e1     	mov	x1, x22
 456e724: 97132cc9     	bl	0xa39a48 <_ChromeMain+0xa347ac>
 456e728: 3940a2c8     	ldrb	w8, [x22, #0x28]
 456e72c: 39056268     	strb	w8, [x19, #0x158]
 456e730: 39c5de68     	ldrsb	w8, [x19, #0x177]
 456e734: 37fffe28     	tbnz	w8, #0x1f, 0x456e6f8 <_ChromeMain+0x456945c>
 456e738: 3cc302c0     	ldur	q0, [x22, #0x30]
 456e73c: f84402c8     	ldur	x8, [x22, #0x40]
 456e740: f900ba68     	str	x8, [x19, #0x170]
 456e744: 3d805a60     	str	q0, [x19, #0x160]
 456e748: 39011edf     	strb	wzr, [x22, #0x47]
 456e74c: 790062df     	strh	wzr, [x22, #0x30]
 456e750: 71000ebf     	cmp	w21, #0x3
 456e754: 1a9f02a8     	csel	w8, w21, wzr, eq
 456e758: 291f5668     	stp	w8, w21, [x19, #0xf8]
 456e75c: 71001ebf     	cmp	w21, #0x7
 456e760: 540001a1     	b.ne	0x456e794 <_ChromeMain+0x45694f8>
 456e764: 39c4be68     	ldrsb	w8, [x19, #0x12f]
 456e768: 36f800a8     	tbz	w8, #0x1f, 0x456e77c <_ChromeMain+0x45694e0>
 456e76c: a9518a61     	ldp	x1, x2, [x19, #0x118]
 456e770: 910003e0     	mov	x0, sp
 456e774: 96eaa6a9     	bl	0x18218 <_ChromeMain+0x12f7c>
 456e778: 14000009     	b	0x456e79c <_ChromeMain+0x4569500>
 456e77c: 91046268     	add	x8, x19, #0x118
 456e780: 3dc00100     	ldr	q0, [x8]
 456e784: 3d8003e0     	str	q0, [sp]
 456e788: f9400908     	ldr	x8, [x8, #0x10]
 456e78c: f9000be8     	str	x8, [sp, #0x10]
 456e790: 14000003     	b	0x456e79c <_ChromeMain+0x4569500>
 456e794: a9007fff     	stp	xzr, xzr, [sp]
 456e798: f9000bff     	str	xzr, [sp, #0x10]
 456e79c: 90054ce8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 456e7a0: 91120108     	add	x8, x8, #0x480
 456e7a4: f8bfc100     	ldapr	x0, [x8]
 456e7a8: b4003120     	cbz	x0, 0x456edcc <_ChromeMain+0x4569b30>
 456e7ac: 52807a01     	mov	w1, #0x3d0              ; =976
 456e7b0: d2800002     	mov	x2, #0x0                ; =0
 456e7b4: 96ecf37f     	bl	0xab5b0 <_ChromeMain+0xa6314>
 456e7b8: aa0003f6     	mov	x22, x0
 456e7bc: f9400277     	ldr	x23, [x19]
 456e7c0: 390103ff     	strb	wzr, [sp, #0x40]
 456e7c4: 52801fe8     	mov	w8, #0xff               ; =255
 456e7c8: 390183e8     	strb	w8, [sp, #0x60]
 456e7cc: 910103f8     	add	x24, sp, #0x40
 456e7d0: 910103e0     	add	x0, sp, #0x40
 456e7d4: 9104c261     	add	x1, x19, #0x130
 456e7d8: 9705416d     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 456e7dc: 39456268     	ldrb	w8, [x19, #0x158]
 456e7e0: 3901a3e8     	strb	w8, [sp, #0x68]
 456e7e4: 39c5de68     	ldrsb	w8, [x19, #0x177]
 456e7e8: 37f80188     	tbnz	w8, #0x1f, 0x456e818 <_ChromeMain+0x456957c>
 456e7ec: 3dc05a60     	ldr	q0, [x19, #0x160]
 456e7f0: 3c830300     	stur	q0, [x24, #0x30]
 456e7f4: f940ba68     	ldr	x8, [x19, #0x170]
 456e7f8: f8040308     	stur	x8, [x24, #0x40]
 456e7fc: 1400000a     	b	0x456e824 <_ChromeMain+0x4569588>
 456e800: 52800100     	mov	w0, #0x8                ; =8
 456e804: 96ea82d9     	bl	0xf368 <_ChromeMain+0xa0cc>
 456e808: aa0003f6     	mov	x22, x0
 456e80c: d2800019     	mov	x25, #0x0               ; =0
 456e810: f900001f     	str	xzr, [x0]
 456e814: 14000075     	b	0x456e9e8 <_ChromeMain+0x456974c>
 456e818: a9560a61     	ldp	x1, x2, [x19, #0x160]
 456e81c: 9100c300     	add	x0, x24, #0x30
 456e820: 96eb60ec     	bl	0x46bd0 <_ChromeMain+0x41934>
 456e824: 3dc003e0     	ldr	q0, [sp]
 456e828: 3d800be0     	str	q0, [sp, #0x20]
 456e82c: f9400be8     	ldr	x8, [sp, #0x10]
 456e830: f9001be8     	str	x8, [sp, #0x30]
 456e834: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 456e838: f90003ff     	str	xzr, [sp]
 456e83c: 910103e3     	add	x3, sp, #0x40
 456e840: 910083e5     	add	x5, sp, #0x20
 456e844: aa1603e0     	mov	x0, x22
 456e848: aa1703e1     	mov	x1, x23
 456e84c: aa1303e2     	mov	x2, x19
 456e850: aa1503e4     	mov	x4, x21
 456e854: 12800006     	mov	w6, #-0x1               ; =-1
 456e858: 94001165     	bl	0x4572dec <_ChromeMain+0x456db50>
