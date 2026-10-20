
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 108d1d0:      	sub	sp, sp, #0x30
 108d1d4:      	stp	x20, x19, [sp, #0x10]
 108d1d8:      	stp	x29, x30, [sp, #0x20]
 108d1dc:      	add	x29, sp, #0x20
 108d1e0:      	adrp	x8, 0xef03000 <dyld_stub_binder+0xef03000>
 108d1e4:      	add	x8, x8, #0x548
 108d1e8:      	ldaprb	w8, [x8]
 108d1ec:      	tbz	w8, #0x0, 0x108d208 <_ChromeMain+0x1087f6c>
 108d1f0:      	adrp	x0, 0xef03000 <dyld_stub_binder+0xef03000>
 108d1f4:      	add	x0, x0, #0x500
 108d1f8:      	ldp	x29, x30, [sp, #0x20]
 108d1fc:      	ldp	x20, x19, [sp, #0x10]
 108d200:      	add	sp, sp, #0x30
 108d204:      	ret
 108d208:      	adrp	x19, 0xef03000 <dyld_stub_binder+0xef03000>
 108d20c:      	add	x19, x19, #0x548
 108d210:      	mov	x0, x19
 108d214:      	bl	0x80048c0 <_ChromeMain+0x7fff624>
 108d218:      	cbz	w0, 0x108d1f0 <_ChromeMain+0x1087f54>
 108d21c:      	adrp	x20, 0xef03000 <dyld_stub_binder+0xef03000>
 108d220:      	add	x20, x20, #0x500
 108d224:      	bl	0x53f1c <_ChromeMain+0x4ec80>
 108d228:      	mov	x2, x0
 108d22c:      	adrp	x1, 0xdac2000 <dyld_stub_binder+0xdac2000>
 108d230:      	add	x1, x1, #0xf02
 108d234:      	mov	x0, x20
 108d238:      	mov	w3, #0x0                ; =0
 108d23c:      	bl	0xa13fc8 <_ChromeMain+0xa0ed2c>
 108d240:      	stp	xzr, xzr, [x20, #0x20]
 108d244:      	str	xzr, [x20, #0x30]
 108d248:      	adrp	x8, 0xdf39000 <dyld_stub_binder+0xdf39000>
 108d24c:      	ldr	q0, [x8, #0xa30]
 108d250:      	stur	q0, [x20, #0x38]
 108d254:      	adrp	x8, 0xe1ec000 <dyld_stub_binder+0xe1ec000>
 108d258:      	add	x8, x8, #0xcf8
 108d25c:      	str	x8, [x20]
 108d260:      	bl	0x297b304 <_ChromeMain+0x2976068>
 108d264:      	cmp	x0, x20
 108d268:      	b.eq	0x108d2f4 <_ChromeMain+0x1088058>
