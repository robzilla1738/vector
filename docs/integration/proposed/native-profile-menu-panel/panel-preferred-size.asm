
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4579608: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 457960c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4579610: 910043fd     	add	x29, sp, #0x10
 4579614: aa0003f3     	mov	x19, x0
 4579618: 97d6bff0     	bl	0x3b295d8 <_ChromeMain+0x3b2433c>
 457961c: 92607c08     	and	x8, x0, #0xffffffff00000000
 4579620: b9431269     	ldr	w9, [x19, #0x310]
 4579624: 0aa97d29     	bic	w9, w9, w9, asr #31
 4579628: aa090100     	orr	x0, x8, x9
 457962c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4579630: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4579634: d65f03c0     	ret
