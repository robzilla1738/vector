
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4630edc: d100c3ff     	sub	sp, sp, #0x30
 4630ee0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4630ee4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4630ee8: 910083fd     	add	x29, sp, #0x20
 4630eec: aa0003f3     	mov	x19, x0
 4630ef0: b0052c08     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4630ef4: f9468d08     	ldr	x8, [x8, #0xd18]
 4630ef8: d63f0100     	blr	x8
 4630efc: 9113c268     	add	x8, x19, #0x4f0
 4630f00: 3953e269     	ldrb	w9, [x19, #0x4f8]
 4630f04: 350000c9     	cbnz	w9, 0x4630f1c <_ChromeMain+0x462bc80>
 4630f08: b40001e8     	cbz	x8, 0x4630f44 <_ChromeMain+0x462bca8>
 4630f0c: f9027a60     	str	x0, [x19, #0x4f0]
 4630f10: 52800028     	mov	w8, #0x1                ; =1
 4630f14: 3913e268     	strb	w8, [x19, #0x4f8]
 4630f18: 14000002     	b	0x4630f20 <_ChromeMain+0x462bc84>
 4630f1c: f9000100     	str	x0, [x8]
 4630f20: b004c4c8     	adrp	x8, 0xdec9000 <dyld_stub_binder+0xdec9000>
 4630f24: 911ff108     	add	x8, x8, #0x7fc
 4630f28: f90007e8     	str	x8, [sp, #0x8]
 4630f2c: 910023e0     	add	x0, sp, #0x8
 4630f30: 9752f60f     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4630f34: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4630f38: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4630f3c: 9100c3ff     	add	sp, sp, #0x30
 4630f40: d65f03c0     	ret
 4630f44: d4200020     	brk	#0x1
 4630f48: d503201f     	nop
 4630f4c: d503201f     	nop
 4630f50: d503201f     	nop
 4630f54: d503201f     	nop
 4630f58: d503201f     	nop
 4630f5c: d503201f     	nop
 4630f60: d503201f     	nop
 4630f64: d503201f     	nop
 4630f68: d503201f     	nop
 4630f6c: d503201f     	nop
