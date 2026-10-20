
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464eafc: 913e6260     	add	x0, x19, #0xf98
 464eb00: 9100a022     	add	x2, x1, #0x28
 464eb04: 9400cf16     	bl	0x468275c <_ChromeMain+0x467d4c0>
 464eb08: f9400fe8     	ldr	x8, [sp, #0x18]
 464eb0c: b40000a8     	cbz	x8, 0x464eb20 <_ChromeMain+0x4649884>
 464eb10: d0052421     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 464eb14: 9126a021     	add	x1, x1, #0x9a8
 464eb18: 91002100     	add	x0, x8, #0x8
 464eb1c: 97305060     	bl	0x1262c9c <_ChromeMain+0x125da00>
 464eb20: aa1303e0     	mov	x0, x19
 464eb24: aa1503e1     	mov	x1, x21
 464eb28: 94000117     	bl	0x464ef84 <_ChromeMain+0x4649ce8>
