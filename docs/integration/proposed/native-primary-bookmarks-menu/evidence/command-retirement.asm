
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4570ef8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4570efc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4570f00: 910043fd     	add	x29, sp, #0x10
 4570f04: aa0103f3     	mov	x19, x1
 4570f08: f9400014     	ldr	x20, [x0]
 4570f0c: 97fff4af     	bl	0x456e1c8 <_ChromeMain+0x4568f2c>
 4570f10: b5000094     	cbnz	x20, 0x4570f20 <_ChromeMain+0x456bc84>
 4570f14: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4570f18: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4570f1c: d65f03c0     	ret
 4570f20: b0053208     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4570f24: f9468d08     	ldr	x8, [x8, #0xd18]
 4570f28: d63f0100     	blr	x8
 4570f2c: aa0003e2     	mov	x2, x0
 4570f30: 9100a280     	add	x0, x20, #0x28
 4570f34: aa1303e1     	mov	x1, x19
 4570f38: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4570f3c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4570f40: 15f2f6d3     	b	0xc22ea8c <_ChromeMain+0xc2297f0>
