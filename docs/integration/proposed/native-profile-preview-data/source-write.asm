
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 455b3d4: f9404660     	ldr	x0, [x19, #0x88]
 455b3d8: 910143e8     	add	x8, sp, #0x50
 455b3dc: 97fff575     	bl	0x45589b0 <_ChromeMain+0x4553714>
 455b3e0: 910343e8     	add	x8, sp, #0xd0
 455b3e4: f81483a8     	stur	x8, [x29, #-0xb8]
 455b3e8: 9102a260     	add	x0, x19, #0xa8
 455b3ec: d102e3a1     	sub	x1, x29, #0xb8
 455b3f0: 94000d0d     	bl	0x455e824 <_ChromeMain+0x4559588>
 455b3f4: aa0003f8     	mov	x24, x0
 455b3f8: f9401c15     	ldr	x21, [x0, #0x38]
 455b3fc: b4000395     	cbz	x21, 0x455b46c <_ChromeMain+0x45561d0>
 455b400: f9402308     	ldr	x8, [x24, #0x40]
 455b404: d37be909     	lsl	x9, x8, #5
 455b408: b4000209     	cbz	x9, 0x455b448 <_ChromeMain+0x45561ac>
 455b40c: 8b150129     	add	x9, x9, x21
 455b410: d1008139     	sub	x25, x9, #0x20
 455b414: cb0817fa     	neg	x26, x8, lsl #5
 455b418: 14000008     	b	0x455b438 <_ChromeMain+0x455619c>
 455b41c: f9400320     	ldr	x0, [x25]
 455b420: f9400b28     	ldr	x8, [x25, #0x10]
 455b424: d37ff901     	lsl	x1, x8, #1
 455b428: 96eab6a4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 455b42c: d1008339     	sub	x25, x25, #0x20
 455b430: b100835a     	adds	x26, x26, #0x20
 455b434: 540000e0     	b.eq	0x455b450 <_ChromeMain+0x45561b4>
 455b438: b4003659     	cbz	x25, 0x455bb00 <_ChromeMain+0x4556864>
 455b43c: 39c05f28     	ldrsb	w8, [x25, #0x17]
 455b440: 36ffff68     	tbz	w8, #0x1f, 0x455b42c <_ChromeMain+0x4556190>
 455b444: 17fffff6     	b	0x455b41c <_ChromeMain+0x4556180>
 455b448: aa1503e0     	mov	x0, x21
 455b44c: 14000002     	b	0x455b454 <_ChromeMain+0x45561b8>
 455b450: f9401f00     	ldr	x0, [x24, #0x38]
 455b454: cb0002a8     	sub	x8, x21, x0
 455b458: 9345fd08     	asr	x8, x8, #5
 455b45c: f9002308     	str	x8, [x24, #0x40]
 455b460: f9402708     	ldr	x8, [x24, #0x48]
 455b464: d37be901     	lsl	x1, x8, #5
 455b468: 96eab694     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 455b46c: f9402be8     	ldr	x8, [sp, #0x50]
 455b470: f9001f08     	str	x8, [x24, #0x38]
 455b474: 3cc583e0     	ldur	q0, [sp, #0x58]
 455b478: 3d801300     	str	q0, [x24, #0x40]
 455b47c: b9406be8     	ldr	w8, [sp, #0x68]
 455b480: b9005308     	str	w8, [x24, #0x50]
 455b484: aa1303f5     	mov	x21, x19
 455b488: f8498eb8     	ldr	x24, [x21, #0x98]!
 455b48c: f85f02a8     	ldur	x8, [x21, #-0x10]
 455b490: f9400108     	ldr	x8, [x8]
 455b494: f9400d08     	ldr	x8, [x8, #0x18]
 455b498: d10022b9     	sub	x25, x21, #0x8
 455b49c: b4000148     	cbz	x8, 0x455b4c4 <_ChromeMain+0x4556228>
 455b4a0: b4ffc038     	cbz	x24, 0x455aca4 <_ChromeMain+0x4555a08>
 455b4a4: 39839fe8     	ldrsb	x8, [sp, #0xe7]
 455b4a8: 910343e9     	add	x9, sp, #0xd0
 455b4ac: a94d2fea     	ldp	x10, x11, [sp, #0xd0]
