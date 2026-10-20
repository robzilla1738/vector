
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c73c674: d100c3ff     	sub	sp, sp, #0x30
 c73c678: a9014ff4     	stp	x20, x19, [sp, #0x10]
 c73c67c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 c73c680: 910083fd     	add	x29, sp, #0x20
 c73c684: aa0103f3     	mov	x19, x1
 c73c688: f9402800     	ldr	x0, [x0, #0x50]
 c73c68c: f9400008     	ldr	x8, [x0]
 c73c690: f9401109     	ldr	x9, [x8, #0x20]
 c73c694: 910003e8     	mov	x8, sp
 c73c698: d63f0120     	blr	x9
 c73c69c: 910003e1     	mov	x1, sp
 c73c6a0: aa1303e0     	mov	x0, x19
 c73c6a4: 97fc1b6b     	bl	0xc643450 <_ChromeMain+0xc63e1b4>
 c73c6a8: aa0003f3     	mov	x19, x0
 c73c6ac: 910003e0     	mov	x0, sp
 c73c6b0: 9411a92c     	bl	0xcba6b60 <_ChromeMain+0xcba18c4>
 c73c6b4: aa1303e0     	mov	x0, x19
 c73c6b8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 c73c6bc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 c73c6c0: 9100c3ff     	add	sp, sp, #0x30
 c73c6c4: d65f03c0     	ret
