
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4561c04: f9401e73     	ldr	x19, [x19, #0x38]
 4561c08: b40154d3     	cbz	x19, 0x45646a0 <_ChromeMain+0x455f404>
 4561c0c: 9100a260     	add	x0, x19, #0x28
 4561c10: 97089312     	bl	0x786858 <_ChromeMain+0x7815bc>
 4561c14: b40147a0     	cbz	x0, 0x4564508 <_ChromeMain+0x455f26c>
 4561c18: f9400008     	ldr	x8, [x0]
 4561c1c: f9416501     	ldr	x1, [x8, #0x2c8]
 4561c20: 911703ff     	add	sp, sp, #0x5c0
 4561c24: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561c28: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561c2c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561c30: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561c34: d61f0020     	br	x1
