
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 71f2958: d101c3ff     	sub	sp, sp, #0x70
 71f295c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 71f2960: a9067bfd     	stp	x29, x30, [sp, #0x60]
 71f2964: 910183fd     	add	x29, sp, #0x60
 71f2968: aa0803f3     	mov	x19, x8
 71f296c: a93dffbf     	stp	xzr, xzr, [x29, #-0x28]
 71f2970: f81e83bf     	stur	xzr, [x29, #-0x18]
 71f2974: d100a3a0     	sub	x0, x29, #0x28
 71f2978: 968b44a2     	bl	0x14c3c00 <_ChromeMain+0x14be964>
 71f297c: d100a3a1     	sub	x1, x29, #0x28
 71f2980: 52801920     	mov	w0, #0xc9               ; =201
 71f2984: 96b456fc     	bl	0x1f08574 <_ChromeMain+0x1f032d8>
 71f2988: 37000080     	tbnz	w0, #0x0, 0x71f2998 <_ChromeMain+0x71ed6fc>
 71f298c: aa1303e0     	mov	x0, x19
 71f2990: 968b449c     	bl	0x14c3c00 <_ChromeMain+0x14be964>
 71f2994: 1400001c     	b	0x71f2a04 <_ChromeMain+0x71ed768>
 71f2998: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 71f299c: f9001bff     	str	xzr, [sp, #0x30]
 71f29a0: f0034181     	adrp	x1, 0xda25000 <dyld_stub_binder+0xda25000>
 71f29a4: 91196821     	add	x1, x1, #0x65a
 71f29a8: 910023e8     	add	x8, sp, #0x8
 71f29ac: d100a3a0     	sub	x0, x29, #0x28
 71f29b0: 528000e2     	mov	w2, #0x7                ; =7
 71f29b4: 96929a98     	bl	0x1699414 <_ChromeMain+0x1694178>
 71f29b8: f0034181     	adrp	x1, 0xda25000 <dyld_stub_binder+0xda25000>
 71f29bc: 91198821     	add	x1, x1, #0x662
 71f29c0: 910083e8     	add	x8, sp, #0x20
 71f29c4: 910023e0     	add	x0, sp, #0x8
 71f29c8: 52800182     	mov	w2, #0xc                ; =12
 71f29cc: 96929a92     	bl	0x1699414 <_ChromeMain+0x1694178>
 71f29d0: 910023e0     	add	x0, sp, #0x8
 71f29d4: 9701ec54     	bl	0x326db24 <_ChromeMain+0x3268888>
 71f29d8: 910083e0     	add	x0, sp, #0x20
 71f29dc: 96c0c699     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 71f29e0: 37000080     	tbnz	w0, #0x0, 0x71f29f0 <_ChromeMain+0x71ed754>
 71f29e4: aa1303e0     	mov	x0, x19
 71f29e8: 968b4486     	bl	0x14c3c00 <_ChromeMain+0x14be964>
 71f29ec: 14000004     	b	0x71f29fc <_ChromeMain+0x71ed760>
 71f29f0: 910083e1     	add	x1, sp, #0x20
 71f29f4: aa1303e0     	mov	x0, x19
 71f29f8: 970b852a     	bl	0x34d3ea0 <_ChromeMain+0x34cec04>
 71f29fc: 910083e0     	add	x0, sp, #0x20
 71f2a00: 9701ec49     	bl	0x326db24 <_ChromeMain+0x3268888>
 71f2a04: d100a3a0     	sub	x0, x29, #0x28
 71f2a08: 9701ec47     	bl	0x326db24 <_ChromeMain+0x3268888>
 71f2a0c: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 71f2a10: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 71f2a14: 9101c3ff     	add	sp, sp, #0x70
 71f2a18: d65f03c0     	ret
 71f2a1c: aa0003f3     	mov	x19, x0
 71f2a20: 910023e0     	add	x0, sp, #0x8
