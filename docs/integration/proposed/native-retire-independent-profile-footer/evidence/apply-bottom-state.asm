
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464b238: f9437a68     	ldr	x8, [x19, #0x6f0]
 464b23c: b94027e9     	ldr	w9, [sp, #0x24]
 464b240: 2a0903e9     	mov	w9, w9
 464b244: aa090389     	orr	x9, x28, x9
 464b248: f9001be9     	str	x9, [sp, #0x30]
 464b24c: f9400fe9     	ldr	x9, [sp, #0x18]
 464b250: f9001fe9     	str	x9, [sp, #0x38]
 464b254: d0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464b258: 91122021     	add	x1, x1, #0x488
 464b25c: 91036100     	add	x0, x8, #0xd8
 464b260: 9100c3e2     	add	x2, sp, #0x30
 464b264: 97528aff     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464b268: f9437a60     	ldr	x0, [x19, #0x6f0]
 464b26c: aa1403e1     	mov	x1, x20
 464b270: 97efe877     	bl	0x424544c <_ChromeMain+0x42401b0>
