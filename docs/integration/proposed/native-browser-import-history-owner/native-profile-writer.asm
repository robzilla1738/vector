
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7822c94: f9400428     	ldr	x8, [x1, #0x8]
 7822c98: b40001c8     	cbz	x8, 0x7822cd0 <_ChromeMain+0x781da34>
 7822c9c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7822ca0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7822ca4: 910043fd     	add	x29, sp, #0x10
 7822ca8: aa0203f3     	mov	x19, x2
 7822cac: aa0103f4     	mov	x20, x1
 7822cb0: f9400800     	ldr	x0, [x0, #0x10]
 7822cb4: 52800001     	mov	w1, #0x0                ; =0
 7822cb8: 96951d71     	bl	0x1d6a27c <_ChromeMain+0x1d64fe0>
 7822cbc: aa1403e1     	mov	x1, x20
 7822cc0: aa1303e2     	mov	x2, x19
 7822cc4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7822cc8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7822ccc: 14b180c5     	b	0xa482fe0 <_ChromeMain+0xa47dd44>
 7822cd0: d65f03c0     	ret
