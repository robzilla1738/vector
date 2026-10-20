
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4244ce8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4244cec: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4244cf0: 910043fd     	add	x29, sp, #0x10
 4244cf4: aa0103f4     	mov	x20, x1
 4244cf8: aa0003f3     	mov	x19, x0
 4244cfc: 97983b29     	bl	0x28539a0 <_ChromeMain+0x284e704>
 4244d00: f9401260     	ldr	x0, [x19, #0x20]
 4244d04: 39839e82     	ldrsb	x2, [x20, #0xe7]
 4244d08: b7f80142     	tbnz	x2, #0x3f, 0x4244d30 <_ChromeMain+0x423fa94>
 4244d0c: 91034281     	add	x1, x20, #0xd0
 4244d10: f9400008     	ldr	x8, [x0]
 4244d14: f9423108     	ldr	x8, [x8, #0x460]
 4244d18: d63f0100     	blr	x8
 4244d1c: f9401260     	ldr	x0, [x19, #0x20]
 4244d20: 52800021     	mov	w1, #0x1                ; =1
 4244d24: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4244d28: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4244d2c: 173aa2d6     	b	0x10ed884 <_ChromeMain+0x10e85e8>
 4244d30: a94d0a81     	ldp	x1, x2, [x20, #0xd0]
 4244d34: 17fffff7     	b	0x4244d10 <_ChromeMain+0x423fa74>
