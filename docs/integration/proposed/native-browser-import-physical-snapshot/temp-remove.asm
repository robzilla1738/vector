
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 326df28: d10283ff     	sub	sp, sp, #0xa0
 326df2c: a9084ff4     	stp	x20, x19, [sp, #0x80]
 326df30: a9097bfd     	stp	x29, x30, [sp, #0x90]
 326df34: 910243fd     	add	x29, sp, #0x90
 326df38: aa0003f3     	mov	x19, x0
 326df3c: 6f00e400     	movi.2d	v0, #0000000000000000
 326df40: ad0203e0     	stp	q0, q0, [sp, #0x40]
 326df44: ad0103e0     	stp	q0, q0, [sp, #0x20]
 326df48: b00547e0     	adrp	x0, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 326df4c: 91384400     	add	x0, x0, #0xe11
 326df50: b00547e1     	adrp	x1, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 326df54: 91311421     	add	x1, x1, #0xc45
 326df58: 910003f4     	mov	x20, sp
 326df5c: 910003e8     	mov	x8, sp
 326df60: 52802f62     	mov	w2, #0x17b              ; =379
 326df64: 97378b47     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 326df68: 910083e0     	add	x0, sp, #0x20
 326df6c: 52800001     	mov	w1, #0x0                ; =0
 326df70: 52800002     	mov	w2, #0x0                ; =0
 326df74: 977918ec     	bl	0x10b4324 <_ChromeMain+0x10af088>
 326df78: 52800148     	mov	w8, #0xa                ; =10
 326df7c: f81d83a8     	stur	x8, [x29, #-0x28]
 326df80: 9005e4e8     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 326df84: 3955c900     	ldrb	w0, [x8, #0x572]
 326df88: 35000200     	cbnz	w0, 0x326dfc8 <_ChromeMain+0x3268d2c>
 326df8c: 39c05e68     	ldrsb	w8, [x19, #0x17]
 326df90: 36f80048     	tbz	w8, #0x1f, 0x326df98 <_ChromeMain+0x3268cfc>
 326df94: f9400273     	ldr	x19, [x19]
 326df98: 12800020     	mov	w0, #-0x2               ; =-2
 326df9c: aa1303e1     	mov	x1, x19
 326dfa0: 52800022     	mov	w2, #0x1                ; =1
 326dfa4: 979aae19     	bl	0x1919808 <_ChromeMain+0x191456c>
 326dfa8: aa0003f3     	mov	x19, x0
 326dfac: 910083e0     	add	x0, sp, #0x20
 326dfb0: 976002f5     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 326dfb4: aa1303e0     	mov	x0, x19
 326dfb8: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 326dfbc: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 326dfc0: 910283ff     	add	sp, sp, #0xa0
 326dfc4: d65f03c0     	ret
 326dfc8: b00547e8     	adrp	x8, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 326dfcc: 910a4d08     	add	x8, x8, #0x293
 326dfd0: a93e23b4     	stp	x20, x8, [x29, #-0x20]
 326dfd4: d100a3a1     	sub	x1, x29, #0x28
 326dfd8: d10063a2     	sub	x2, x29, #0x18
 326dfdc: d10083a3     	sub	x3, x29, #0x20
 326dfe0: 975891a3     	bl	0x89266c <_ChromeMain+0x88d3d0>
 326dfe4: 17ffffea     	b	0x326df8c <_ChromeMain+0x3268cf0>
