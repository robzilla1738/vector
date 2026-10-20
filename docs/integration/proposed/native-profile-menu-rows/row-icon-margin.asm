
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4579d48: d2c00108     	mov	x8, #0x800000000        ; =34359738368
 4579d4c: a93323bf     	stp	xzr, x8, [x29, #-0xd0]
 4579d50: 90052461     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4579d54: 91122021     	add	x1, x1, #0x488
 4579d58: d10343a2     	sub	x2, x29, #0xd0
 4579d5c: aa1603e0     	mov	x0, x22
 4579d60: 97a22a88     	bl	0x2e04780 <_ChromeMain+0x2dff4e4>
