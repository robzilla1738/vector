
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 792bcf0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 792bcf4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 792bcf8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 792bcfc: 910083fd     	add	x29, sp, #0x20
 792bd00: aa0103f3     	mov	x19, x1
 792bd04: aa0003f4     	mov	x20, x0
 792bd08: 925e7428     	and	x8, x1, #0xfffffffc00000000
 792bd0c: f0039435     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 792bd10: f94046a9     	ldr	x9, [x21, #0x88]
 792bd14: eb09011f     	cmp	x8, x9
 792bd18: 54000061     	b.ne	0x792bd24 <_ChromeMain+0x7926a88>
 792bd1c: aa1303e0     	mov	x0, x19
 792bd20: 961ba177     	bl	0x142fc <_ChromeMain+0xf060>
 792bd24: f9401a80     	ldr	x0, [x20, #0x30]
 792bd28: 925e7408     	and	x8, x0, #0xfffffffc00000000
 792bd2c: f94046a9     	ldr	x9, [x21, #0x88]
 792bd30: eb09011f     	cmp	x8, x9
 792bd34: 54000041     	b.ne	0x792bd3c <_ChromeMain+0x7926aa0>
 792bd38: 961beb43     	bl	0x26a44 <_ChromeMain+0x217a8>
 792bd3c: f9001a93     	str	x19, [x20, #0x30]
 792bd40: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 792bd44: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 792bd48: a8c357f6     	ldp	x22, x21, [sp], #0x30
 792bd4c: d65f03c0     	ret
