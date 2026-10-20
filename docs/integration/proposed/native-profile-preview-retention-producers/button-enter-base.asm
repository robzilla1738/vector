
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41fbd60: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 41fbd64: a9017bfd     	stp	x29, x30, [sp, #0x10]
 41fbd68: 910043fd     	add	x29, sp, #0x10
 41fbd6c: aa0003f3     	mov	x19, x0
 41fbd70: f9424000     	ldr	x0, [x0, #0x480]
 41fbd74: f9400008     	ldr	x8, [x0]
 41fbd78: f9401508     	ldr	x8, [x8, #0x28]
 41fbd7c: d63f0100     	blr	x8
 41fbd80: f943ea60     	ldr	x0, [x19, #0x7d0]
 41fbd84: b40000a0     	cbz	x0, 0x41fbd98 <_ChromeMain+0x41f6afc>
 41fbd88: 52800021     	mov	w1, #0x1                ; =1
 41fbd8c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 41fbd90: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 41fbd94: 140ec02b     	b	0x45abe40 <_ChromeMain+0x45a6ba4>
