Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464b3cc: f943f275     	ldr	x21, [x19, #0x7e0]
 464b3d0: 911fa274     	add	x20, x19, #0x7e8
 464b3d4: eb1402bf     	cmp	x21, x20
 464b3d8: 54000440     	b.eq	0x464b460 <_ChromeMain+0x46461c4>
 464b3dc: f004c768     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 464b3e0: 3dc1b500     	ldr	q0, [x8, #0x6d0]
 464b3e4: 3d8003e0     	str	q0, [sp]
 464b3e8: 1400012c     	b	0x464b898 <_ChromeMain+0x46465fc>
 464b3ec: aa1303e0     	mov	x0, x19
 464b3f0: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 464b3f4: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 464b3f8: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 464b3fc: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 464b400: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 464b404: 9103c3ff     	add	sp, sp, #0xf0
 464b408: 14000141     	b	0x464b90c <_ChromeMain+0x4646670>
 464b40c: 1e2e1000     	fmov	s0, #1.00000000
 464b410: 97fe0f8c     	bl	0x45cf240 <_ChromeMain+0x45c9fa4>
 464b414: 910022b5     	add	x21, x21, #0x8
 464b418: f1002294     	subs	x20, x20, #0x8
 464b41c: 540000c0     	b.eq	0x464b434 <_ChromeMain+0x4646198>
 464b420: f94002a8     	ldr	x8, [x21]
 464b424: b4ffff88     	cbz	x8, 0x464b414 <_ChromeMain+0x4646178>
 464b428: f941b900     	ldr	x0, [x8, #0x370]
 464b42c: b4ffff40     	cbz	x0, 0x464b414 <_ChromeMain+0x4646178>
 464b430: 17fffff7     	b	0x464b40c <_ChromeMain+0x4646170>
 464b434: f9422e68     	ldr	x8, [x19, #0x458]
 464b438: b4000108     	cbz	x8, 0x464b458 <_ChromeMain+0x46461bc>
 464b43c: f9432508     	ldr	x8, [x8, #0x648]
 464b440: b40000c8     	cbz	x8, 0x464b458 <_ChromeMain+0x46461bc>
 464b444: f941d909     	ldr	x9, [x8, #0x3b0]
 464b448: d37df134     	lsl	x20, x9, #3
 464b44c: b4000074     	cbz	x20, 0x464b458 <_ChromeMain+0x46461bc>
 464b450: f941d515     	ldr	x21, [x8, #0x3a8]
 464b454: 14000021     	b	0x464b4d8 <_ChromeMain+0x464623c>
 464b458: 39286a7f     	strb	wzr, [x19, #0xa1a]
 464b45c: 14000006     	b	0x464b474 <_ChromeMain+0x46461d8>
 464b460: f943f660     	ldr	x0, [x19, #0x7e8]
 464b464: 96e76f87     	bl	0x27280 <_ChromeMain+0x21fe4>
 464b468: f903f274     	str	x20, [x19, #0x7e0]
 464b46c: 6f00e400     	movi.2d	v0, #0000000000000000
 464b470: 3d800280     	str	q0, [x20]
 464b474: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 464b478: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 464b47c: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 464b480: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 464b484: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 464b488: 9103c3ff     	add	sp, sp, #0xf0
 464b48c: d65f03c0     	ret
