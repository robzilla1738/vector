
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 6947b54: d10103ff     	sub	sp, sp, #0x40
 6947b58: a9024ff4     	stp	x20, x19, [sp, #0x20]
 6947b5c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 6947b60: 9100c3fd     	add	x29, sp, #0x30
 6947b64: aa0003f3     	mov	x19, x0
 6947b68: 528004a8     	mov	w8, #0x25               ; =37
 6947b6c: f90003e8     	str	x8, [sp]
 6947b70: d0042e14     	adrp	x20, 0xef09000 <dyld_stub_binder+0xef09000>
 6947b74: 39563680     	ldrb	w0, [x20, #0x58d]
 6947b78: 35000340     	cbnz	w0, 0x6947be0 <_ChromeMain+0x6942944>
 6947b7c: f9407660     	ldr	x0, [x19, #0xe8]
 6947b80: f9400008     	ldr	x8, [x0]
 6947b84: f9405d08     	ldr	x8, [x8, #0xb8]
 6947b88: d63f0100     	blr	x8
 6947b8c: 370000e0     	tbnz	w0, #0x0, 0x6947ba8 <_ChromeMain+0x694290c>
 6947b90: f9407260     	ldr	x0, [x19, #0xe0]
 6947b94: b40000a0     	cbz	x0, 0x6947ba8 <_ChromeMain+0x694290c>
 6947b98: f9400008     	ldr	x8, [x0]
 6947b9c: f9402508     	ldr	x8, [x8, #0x48]
 6947ba0: aa1303e1     	mov	x1, x19
 6947ba4: d63f0100     	blr	x8
 6947ba8: 528004a8     	mov	w8, #0x25               ; =37
 6947bac: f9000be8     	str	x8, [sp, #0x10]
 6947bb0: 39563680     	ldrb	w0, [x20, #0x58d]
 6947bb4: 350000a0     	cbnz	w0, 0x6947bc8 <_ChromeMain+0x694292c>
 6947bb8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 6947bbc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 6947bc0: 910103ff     	add	sp, sp, #0x40
 6947bc4: d65f03c0     	ret
 6947bc8: f9000fff     	str	xzr, [sp, #0x18]
 6947bcc: 910043e1     	add	x1, sp, #0x10
 6947bd0: 910063e2     	add	x2, sp, #0x18
 6947bd4: 52800043     	mov	w3, #0x2                ; =2
 6947bd8: 9664b02c     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 6947bdc: 17fffff7     	b	0x6947bb8 <_ChromeMain+0x694291c>
 6947be0: f9447e69     	ldr	x9, [x19, #0x8f8]
 6947be4: b0038328     	adrp	x8, 0xd9ac000 <dyld_stub_binder+0xd9ac000>
 6947be8: 9113dd08     	add	x8, x8, #0x4f7
 6947bec: f9000fe8     	str	x8, [sp, #0x18]
 6947bf0: f00381c8     	adrp	x8, 0xd982000 <dyld_stub_binder+0xd982000>
 6947bf4: 910e1d08     	add	x8, x8, #0x387
 6947bf8: a900a3e9     	stp	x9, x8, [sp, #0x8]
 6947bfc: 910003e1     	mov	x1, sp
 6947c00: 910063e2     	add	x2, sp, #0x18
 6947c04: 910043e4     	add	x4, sp, #0x10
 6947c08: 910023e5     	add	x5, sp, #0x8
 6947c0c: 52800023     	mov	w3, #0x1                ; =1
 6947c10: 96df54c6     	bl	0x211cf28 <_ChromeMain+0x2117c8c>
 6947c14: 17ffffda     	b	0x6947b7c <_ChromeMain+0x69428e0>
