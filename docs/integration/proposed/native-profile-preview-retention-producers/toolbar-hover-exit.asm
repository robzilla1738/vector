
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7d89b78: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7d89b7c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7d89b80: 910043fd     	add	x29, sp, #0x10
 7d89b84: aa0003f3     	mov	x19, x0
 7d89b88: 97ffddd8     	bl	0x7d812e8 <_ChromeMain+0x7d7c04c>
 7d89b8c: f943ea60     	ldr	x0, [x19, #0x7d0]
 7d89b90: b40000a0     	cbz	x0, 0x7d89ba4 <_ChromeMain+0x7d84908>
 7d89b94: 52800001     	mov	w1, #0x0                ; =0
 7d89b98: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7d89b9c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7d89ba0: 172088a8     	b	0x45abe40 <_ChromeMain+0x45a6ba4>
 7d89ba4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7d89ba8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7d89bac: d65f03c0     	ret
