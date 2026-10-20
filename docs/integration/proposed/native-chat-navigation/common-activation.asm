
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45645a8: 12185a96     	and	w22, w20, #0x7fffff00
 45645ac: aa1403f3     	mov	x19, x20
 45645b0: 12001e74     	and	w20, w19, #0xff
 45645b4: f94046b3     	ldr	x19, [x21, #0x88]
 45645b8: b0053268     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 45645bc: f9468d08     	ldr	x8, [x8, #0xd18]
 45645c0: d63f0100     	blr	x8
 45645c4: aa0003e3     	mov	x3, x0
 45645c8: 2a1402c1     	orr	w1, w22, w20
 45645cc: aa1303e0     	mov	x0, x19
 45645d0: 528000c2     	mov	w2, #0x6                ; =6
 45645d4: 94dfad45     	bl	0x7d4fae8 <_ChromeMain+0x7d4a84c>
 45645d8: 17fff9de     	b	0x4562d50 <_ChromeMain+0x455dab4>
 45645dc: aa1403e0     	mov	x0, x20
 45645e0: 972be77c     	bl	0x105e3d0 <_ChromeMain+0x1059134>
