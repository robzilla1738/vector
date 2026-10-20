
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1131240: d10103ff     	sub	sp, sp, #0x40
 1131244: a9024ff4     	stp	x20, x19, [sp, #0x20]
 1131248: a9037bfd     	stp	x29, x30, [sp, #0x30]
 113124c: 9100c3fd     	add	x29, sp, #0x30
 1131250: aa0803f3     	mov	x19, x8
 1131254: d2800008     	mov	x8, #0x0                ; =0
 1131258: f00677a9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 113125c: f940f929     	ldr	x9, [x9, #0x1f0]
 1131260: f9400129     	ldr	x9, [x9]
 1131264: f9000fe9     	str	x9, [sp, #0x18]
 1131268: 7100001f     	cmp	w0, #0x0
 113126c: f800d3ff     	stur	xzr, [sp, #0xd]
 1131270: f90007ff     	str	xzr, [sp, #0x8]
 1131274: 5a80540a     	cneg	w10, w0, mi
 1131278: 529999a9     	mov	w9, #0xcccd             ; =52429
 113127c: 72b99989     	movk	w9, #0xcccc, lsl #16
 1131280: 5280014b     	mov	w11, #0xa               ; =10
 1131284: 910023ec     	add	x12, sp, #0x8
 1131288: aa0a03ed     	mov	x13, x10
 113128c: 9ba97d4a     	umull	x10, w10, w9
 1131290: d363fd4a     	lsr	x10, x10, #35
 1131294: 1b0bb54e     	msub	w14, w10, w11, w13
 1131298: 321c05ce     	orr	w14, w14, #0x30
 113129c: 8b08018f     	add	x15, x12, x8
 11312a0: 390031ee     	strb	w14, [x15, #0xc]
 11312a4: 710025bf     	cmp	w13, #0x9
 11312a8: 540000c9     	b.ls	0x11312c0 <_ChromeMain+0x112c024>
 11312ac: 91002d0d     	add	x13, x8, #0xb
 11312b0: d1000508     	sub	x8, x8, #0x1
 11312b4: f10035bf     	cmp	x13, #0xd
 11312b8: 54fffe83     	b.lo	0x1131288 <_ChromeMain+0x112bfec>
 11312bc: 14000025     	b	0x1131350 <_ChromeMain+0x112c0b4>
 11312c0: 37f80360     	tbnz	w0, #0x1f, 0x113132c <_ChromeMain+0x112c090>
 11312c4: 91003109     	add	x9, x8, #0xc
 11312c8: 528001a8     	mov	w8, #0xd                ; =13
 11312cc: cb090114     	sub	x20, x8, x9
 11312d0: 8b140268     	add	x8, x19, x20
 11312d4: 39005e74     	strb	w20, [x19, #0x17]
 11312d8: eb13011f     	cmp	x8, x19
 11312dc: 540003a3     	b.lo	0x1131350 <_ChromeMain+0x112c0b4>
 11312e0: 910023ea     	add	x10, sp, #0x8
 11312e4: 8b090141     	add	x1, x10, x9
 11312e8: eb08003f     	cmp	x1, x8
 11312ec: fa533020     	ccmp	x1, x19, #0x0, lo
 11312f0: 54000302     	b.hs	0x1131350 <_ChromeMain+0x112c0b4>
 11312f4: aa1303e0     	mov	x0, x19
 11312f8: aa1403e2     	mov	x2, x20
 11312fc: 95bb627f     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 1131300: 38346a7f     	strb	wzr, [x19, x20]
 1131304: f9400fe8     	ldr	x8, [sp, #0x18]
 1131308: f00677a9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 113130c: f940f929     	ldr	x9, [x9, #0x1f0]
 1131310: f9400129     	ldr	x9, [x9]
 1131314: eb08013f     	cmp	x9, x8
 1131318: 540001a1     	b.ne	0x113134c <_ChromeMain+0x112c0b0>
 113131c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 1131320: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 1131324: 910103ff     	add	sp, sp, #0x40
 1131328: d65f03c0     	ret
 113132c: 91002d09     	add	x9, x8, #0xb
 1131330: f100353f     	cmp	x9, #0xd
 1131334: 540000e2     	b.hs	0x1131350 <_ChromeMain+0x112c0b4>
 1131338: 910023ea     	add	x10, sp, #0x8
 113133c: 8b080148     	add	x8, x10, x8
 1131340: 528005aa     	mov	w10, #0x2d              ; =45
 1131344: 39002d0a     	strb	w10, [x8, #0xb]
 1131348: 17ffffe0     	b	0x11312c8 <_ChromeMain+0x112c02c>
 113134c: 95bb4c05     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
