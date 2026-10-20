
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4620f64:      	stp	x20, x19, [sp, #-0x20]!
 4620f68:      	stp	x29, x30, [sp, #0x10]
 4620f6c:      	add	x29, sp, #0x10
 4620f70:      	mov	x19, x0
 4620f74:      	bl	0x46227a0 <_ChromeMain+0x461d504>
 4620f78:      	ldr	x0, [x19, #0x188]
 4620f7c:      	cbz	x0, 0x4620f8c <_ChromeMain+0x461bcf0>
 4620f80:      	ldp	x29, x30, [sp, #0x10]
 4620f84:      	ldp	x20, x19, [sp], #0x20
 4620f88:      	b	0x5a117c <_ChromeMain+0x59bee0>
 4620f8c:      	ldp	x29, x30, [sp, #0x10]
 4620f90:      	ldp	x20, x19, [sp], #0x20
 4620f94:      	ret
