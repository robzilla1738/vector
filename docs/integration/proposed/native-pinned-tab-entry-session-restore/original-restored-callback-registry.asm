
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 415b254: 90055f48     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 415b258: 9117c108     	add	x8, x8, #0x5f0
 415b25c: 38bfc108     	ldaprb	w8, [x8]
 415b260: 37000288     	tbnz	w8, #0x0, 0x415b2b0 <_ChromeMain+0x4156014>
 415b264: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 415b268: 910003fd     	mov	x29, sp
 415b26c: 90055f40     	adrp	x0, 0xed43000 <dyld_stub_binder+0xed43000>
 415b270: 9117c000     	add	x0, x0, #0x5f0
 415b274: 94faa593     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 415b278: 340001a0     	cbz	w0, 0x415b2ac <_ChromeMain+0x4156010>
 415b27c: 90055f41     	adrp	x1, 0xed43000 <dyld_stub_binder+0xed43000>
 415b280: 9116e021     	add	x1, x1, #0x5b8
 415b284: 6f00e400     	movi.2d	v0, #0000000000000000
 415b288: 3c818020     	stur	q0, [x1, #0x18]
 415b28c: aa0103e0     	mov	x0, x1
 415b290: 3c828c00     	str	q0, [x0, #0x28]!
 415b294: a9000421     	stp	x1, x1, [x1]
 415b298: f900083f     	str	xzr, [x1, #0x10]
 415b29c: 97477445     	bl	0x13383b0 <_ChromeMain+0x1333114>
 415b2a0: 90055f40     	adrp	x0, 0xed43000 <dyld_stub_binder+0xed43000>
 415b2a4: 9117c000     	add	x0, x0, #0x5f0
 415b2a8: 94facac3     	bl	0x800ddb4 <_ChromeMain+0x8008b18>
 415b2ac: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 415b2b0: 90055f40     	adrp	x0, 0xed43000 <dyld_stub_binder+0xed43000>
 415b2b4: 9116e000     	add	x0, x0, #0x5b8
 415b2b8: d65f03c0     	ret
 415b2bc: 00000000     	udf	#0x0
