
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 880a9c0: d10203ff     	sub	sp, sp, #0x80
 880a9c4: a9064ff4     	stp	x20, x19, [sp, #0x60]
 880a9c8: a9077bfd     	stp	x29, x30, [sp, #0x70]
 880a9cc: 9101c3fd     	add	x29, sp, #0x70
 880a9d0: aa0103f3     	mov	x19, x1
 880a9d4: aa0003f4     	mov	x20, x0
 880a9d8: 6f00e400     	movi.2d	v0, #0000000000000000
 880a9dc: ad0203e0     	stp	q0, q0, [sp, #0x40]
 880a9e0: ad0103e0     	stp	q0, q0, [sp, #0x20]
 880a9e4: f0029300     	adrp	x0, 0xda6d000 <dyld_stub_binder+0xda6d000>
 880a9e8: 913ea800     	add	x0, x0, #0xfaa
 880a9ec: b0029b01     	adrp	x1, 0xdb6b000 <dyld_stub_binder+0xdb6b000>
 880a9f0: 91339c21     	add	x1, x1, #0xce7
 880a9f4: 910003e8     	mov	x8, sp
 880a9f8: 528002a2     	mov	w2, #0x15               ; =21
 880a9fc: 950ddfb7     	bl	0xcb828d8 <_ChromeMain+0xcb7d63c>
 880aa00: 910083e0     	add	x0, sp, #0x20
 880aa04: 910003e1     	mov	x1, sp
 880aa08: 52800002     	mov	w2, #0x0                ; =0
 880aa0c: 96021afe     	bl	0x891604 <_ChromeMain+0x88c368>
 880aa10: aa1403e0     	mov	x0, x20
 880aa14: 96270f41     	bl	0x11ce718 <_ChromeMain+0x11c947c>
 880aa18: 37000080     	tbnz	w0, #0x0, 0x880aa28 <_ChromeMain+0x880578c>
 880aa1c: aa1303e0     	mov	x0, x19
 880aa20: 96270f3e     	bl	0x11ce718 <_ChromeMain+0x11c947c>
 880aa24: 36000120     	tbz	w0, #0x0, 0x880aa48 <_ChromeMain+0x88057ac>
 880aa28: 52800013     	mov	w19, #0x0               ; =0
 880aa2c: 910083e0     	add	x0, sp, #0x20
 880aa30: 96099055     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 880aa34: aa1303e0     	mov	x0, x19
 880aa38: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 880aa3c: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 880aa40: 910203ff     	add	sp, sp, #0x80
 880aa44: d65f03c0     	ret
 880aa48: 39c05e88     	ldrsb	w8, [x20, #0x17]
 880aa4c: 36f80048     	tbz	w8, #0x1f, 0x880aa54 <_ChromeMain+0x88057b8>
 880aa50: f9400294     	ldr	x20, [x20]
 880aa54: 39c05e68     	ldrsb	w8, [x19, #0x17]
 880aa58: 36f80048     	tbz	w8, #0x1f, 0x880aa60 <_ChromeMain+0x88057c4>
 880aa5c: f9400273     	ldr	x19, [x19]
 880aa60: aa1403e0     	mov	x0, x20
 880aa64: aa1303e1     	mov	x1, x19
 880aa68: d2800002     	mov	x2, #0x0                ; =0
 880aa6c: 52800103     	mov	w3, #0x8                ; =8
 880aa70: 950eb581     	bl	0xcbb8074 <dyld_stub_binder+0xcbb8074>
 880aa74: 7100001f     	cmp	w0, #0x0
 880aa78: 1a9f17f3     	cset	w19, eq
 880aa7c: 17ffffec     	b	0x880aa2c <_ChromeMain+0x8805790>
