
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463f960: f9450260     	ldr	x0, [x19, #0xa00]
 463f964: f905027f     	str	xzr, [x19, #0xa00]
 463f968: b4000080     	cbz	x0, 0x463f978 <_ChromeMain+0x463a6dc>
 463f96c: f9400008     	ldr	x8, [x0]
 463f970: f9400508     	ldr	x8, [x8, #0x8]
 463f974: d63f0100     	blr	x8
 463f978: 39282e7f     	strb	wzr, [x19, #0xa0b]
