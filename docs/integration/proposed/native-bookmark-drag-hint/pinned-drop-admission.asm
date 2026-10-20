
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462d1c0: d10283ff     	sub	sp, sp, #0xa0
 462d1c4: a90567fa     	stp	x26, x25, [sp, #0x50]
 462d1c8: a9065ff8     	stp	x24, x23, [sp, #0x60]
 462d1cc: a90757f6     	stp	x22, x21, [sp, #0x70]
 462d1d0: a9084ff4     	stp	x20, x19, [sp, #0x80]
 462d1d4: a9097bfd     	stp	x29, x30, [sp, #0x90]
 462d1d8: 910243fd     	add	x29, sp, #0x90
 462d1dc: aa0003f3     	mov	x19, x0
 462d1e0: b40000c1     	cbz	x1, 0x462d1f8 <_ChromeMain+0x4627f5c>
 462d1e4: f9435660     	ldr	x0, [x19, #0x6a8]
 462d1e8: b4000080     	cbz	x0, 0x462d1f8 <_ChromeMain+0x4627f5c>
 462d1ec: aa0103f6     	mov	x22, x1
 462d1f0: b940f828     	ldr	w8, [x1, #0xf8]
 462d1f4: 34000248     	cbz	w8, 0x462d23c <_ChromeMain+0x4627fa0>
 462d1f8: f9436660     	ldr	x0, [x19, #0x6c8]
 462d1fc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 462d200: b0052c29     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d204: f9404529     	ldr	x9, [x9, #0x88]
 462d208: eb09011f     	cmp	x8, x9
 462d20c: 54000041     	b.ne	0x462d214 <_ChromeMain+0x4627f78>
 462d210: 96e7d60b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d214: 52800017     	mov	w23, #0x0               ; =0
 462d218: f903667f     	str	xzr, [x19, #0x6c8]
 462d21c: aa1703e0     	mov	x0, x23
 462d220: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 462d224: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 462d228: a94757f6     	ldp	x22, x21, [sp, #0x70]
 462d22c: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 462d230: a94567fa     	ldp	x26, x25, [sp, #0x50]
 462d234: 910283ff     	add	sp, sp, #0xa0
 462d238: d65f03c0     	ret
 462d23c: aa0403f7     	mov	x23, x4
 462d240: aa0303f4     	mov	x20, x3
 462d244: aa0203f5     	mov	x21, x2
 462d248: f9442668     	ldr	x8, [x19, #0x848]
 462d24c: 39424108     	ldrb	w8, [x8, #0x90]
 462d250: 340000a8     	cbz	w8, 0x462d264 <_ChromeMain+0x4627fc8>
 462d254: 39682269     	ldrb	w9, [x19, #0xa08]
 462d258: 37000729     	tbnz	w9, #0x0, 0x462d33c <_ChromeMain+0x46280a0>
 462d25c: 39683269     	ldrb	w9, [x19, #0xa0c]
 462d260: 370006e9     	tbnz	w9, #0x0, 0x462d33c <_ChromeMain+0x46280a0>
 462d264: 3973826a     	ldrb	w10, [x19, #0xce0]
 462d268: 397de269     	ldrb	w9, [x19, #0xf78]
 462d26c: 3600034a     	tbz	w10, #0x0, 0x462d2d4 <_ChromeMain+0x4628038>
 462d270: 35000389     	cbnz	w9, 0x462d2e0 <_ChromeMain+0x4628044>
 462d274: 3974a268     	ldrb	w8, [x19, #0xd28]
 462d278: 350000c8     	cbnz	w8, 0x462d290 <_ChromeMain+0x4627ff4>
 462d27c: fd46a260     	ldr	d0, [x19, #0xd40]
 462d280: 1e6e1001     	fmov	d1, #1.00000000
 462d284: 1e612000     	fcmp	d0, d1
 462d288: 1a9f17e8     	cset	w8, eq
 462d28c: 14000005     	b	0x462d2a0 <_ChromeMain+0x4628004>
 462d290: b94d2668     	ldr	w8, [x19, #0xd24]
 462d294: 7100011f     	cmp	w8, #0x0
 462d298: 1a9f17e8     	cset	w8, eq
 462d29c: fd46a260     	ldr	d0, [x19, #0xd40]
 462d2a0: 90021ea9     	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 462d2a4: 912db129     	add	x9, x9, #0xb6c
 462d2a8: f0ff7c6a     	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 462d2ac: 9103514a     	add	x10, x10, #0xd4
 462d2b0: 7100011f     	cmp	w8, #0x0
 462d2b4: 9a891148     	csel	x8, x10, x9, ne
 462d2b8: b948ca69     	ldr	w9, [x19, #0x8c8]
 462d2bc: 1e620121     	scvtf	d1, w9
 462d2c0: 1e610800     	fmul	d0, d0, d1
 462d2c4: d63f0100     	blr	x8
 462d2c8: 1e780009     	fcvtzs	w9, d0
 462d2cc: b941c268     	ldr	w8, [x19, #0x1c0]
 462d2d0: 14000006     	b	0x462d2e8 <_ChromeMain+0x462804c>
 462d2d4: 37000069     	tbnz	w9, #0x0, 0x462d2e0 <_ChromeMain+0x4628044>
 462d2d8: 35000148     	cbnz	w8, 0x462d300 <_ChromeMain+0x4628064>
 462d2dc: 14000018     	b	0x462d33c <_ChromeMain+0x46280a0>
 462d2e0: b941c268     	ldr	w8, [x19, #0x1c0]
 462d2e4: aa0803e9     	mov	x9, x8
 462d2e8: 6b08013f     	cmp	w9, w8
 462d2ec: 1a88b12a     	csel	w10, w9, w8, lt
 462d2f0: 7100011f     	cmp	w8, #0x0
 462d2f4: 1a89c148     	csel	w8, w10, w9, gt
 462d2f8: 71025d1f     	cmp	w8, #0x97
 462d2fc: 540001ea     	b.ge	0x462d338 <_ChromeMain+0x462809c>
 462d300: f9436660     	ldr	x0, [x19, #0x6c8]
 462d304: 925e7408     	and	x8, x0, #0xfffffffc00000000
 462d308: b0052c29     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d30c: f9404529     	ldr	x9, [x9, #0x88]
 462d310: eb09011f     	cmp	x8, x9
 462d314: 54000041     	b.ne	0x462d31c <_ChromeMain+0x4628080>
 462d318: 96e7d5c9     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d31c: f903667f     	str	xzr, [x19, #0x6c8]
 462d320: f9435660     	ldr	x0, [x19, #0x6a8]
 462d324: d2800001     	mov	x1, #0x0                ; =0
 462d328: d2800002     	mov	x2, #0x0                ; =0
 462d32c: 97ff65fd     	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d330: 52800017     	mov	w23, #0x0               ; =0
 462d334: 17ffffba     	b	0x462d21c <_ChromeMain+0x4627f80>
 462d338: f9435660     	ldr	x0, [x19, #0x6a8]
 462d33c: 39472008     	ldrb	w8, [x0, #0x1c8]
 462d340: 34000228     	cbz	w8, 0x462d384 <_ChromeMain+0x46280e8>
 462d344: 9737e88c     	bl	0x1427574 <_ChromeMain+0x14222d8>
 462d348: 52800018     	mov	w24, #0x0               ; =0
 462d34c: b94002e8     	ldr	w8, [x23]
 462d350: 6b00011f     	cmp	w8, w0
 462d354: 540001ab     	b.lt	0x462d388 <_ChromeMain+0x46280ec>
 462d358: 0b000029     	add	w9, w1, w0
 462d35c: 6b09011f     	cmp	w8, w9
 462d360: 5400014a     	b.ge	0x462d388 <_ChromeMain+0x46280ec>
 462d364: b94006e8     	ldr	w8, [x23, #0x4]
 462d368: d360fc09     	lsr	x9, x0, #32
 462d36c: 6b09011f     	cmp	w8, w9
 462d370: 540000ab     	b.lt	0x462d384 <_ChromeMain+0x46280e8>
 462d374: 8b418129     	add	x9, x9, x1, lsr #32
 462d378: 6b09011f     	cmp	w8, w9
 462d37c: 1a9fa7f8     	cset	w24, lt
 462d380: 14000002     	b	0x462d388 <_ChromeMain+0x46280ec>
 462d384: 52800018     	mov	w24, #0x0               ; =0
 462d388: f9435660     	ldr	x0, [x19, #0x6a8]
 462d38c: f941b408     	ldr	x8, [x0, #0x368]
 462d390: b4000168     	cbz	x8, 0x462d3bc <_ChromeMain+0x4628120>
 462d394: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 462d398: b90043ff     	str	wzr, [sp, #0x40]
 462d39c: 37000398     	tbnz	w24, #0x0, 0x462d40c <_ChromeMain+0x4628170>
 462d3a0: d2800018     	mov	x24, #0x0               ; =0
 462d3a4: 52800017     	mov	w23, #0x0               ; =0
 462d3a8: d2800001     	mov	x1, #0x0                ; =0
 462d3ac: d2800002     	mov	x2, #0x0                ; =0
 462d3b0: 1400004b     	b	0x462d4dc <_ChromeMain+0x4628240>
 462d3b4: 52800008     	mov	w8, #0x0                ; =0
 462d3b8: 14000011     	b	0x462d3fc <_ChromeMain+0x4628160>
 462d3bc: aa1303e0     	mov	x0, x19
 462d3c0: 9400800c     	bl	0x464d3f0 <_ChromeMain+0x4648154>
 462d3c4: 52800008     	mov	w8, #0x0                ; =0
 462d3c8: b94002e9     	ldr	w9, [x23]
 462d3cc: 6b00013f     	cmp	w9, w0
 462d3d0: 5400016b     	b.lt	0x462d3fc <_ChromeMain+0x4628160>
 462d3d4: 0b00002a     	add	w10, w1, w0
 462d3d8: 6b0a013f     	cmp	w9, w10
 462d3dc: 5400010a     	b.ge	0x462d3fc <_ChromeMain+0x4628160>
 462d3e0: b94006e8     	ldr	w8, [x23, #0x4]
 462d3e4: d360fc09     	lsr	x9, x0, #32
 462d3e8: 6b09011f     	cmp	w8, w9
 462d3ec: 54fffe4b     	b.lt	0x462d3b4 <_ChromeMain+0x4628118>
 462d3f0: 8b418129     	add	x9, x9, x1, lsr #32
 462d3f4: 6b09011f     	cmp	w8, w9
 462d3f8: 1a9fa7e8     	cset	w8, lt
 462d3fc: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 462d400: b90043ff     	str	wzr, [sp, #0x40]
 462d404: f9435660     	ldr	x0, [x19, #0x6a8]
 462d408: 360001f8     	tbz	w24, #0x0, 0x462d444 <_ChromeMain+0x46281a8>
 462d40c: 910063e8     	add	x8, sp, #0x18
 462d410: aa1703e1     	mov	x1, x23
 462d414: 97ff654b     	bl	0x4606940 <_ChromeMain+0x46016a4>
 462d418: 3940a3e8     	ldrb	w8, [sp, #0x28]
 462d41c: 390103e8     	strb	w8, [sp, #0x40]
 462d420: 3cc183e0     	ldur	q0, [sp, #0x18]
 462d424: 3d800fe0     	str	q0, [sp, #0x30]
 462d428: f9435660     	ldr	x0, [x19, #0x6a8]
 462d42c: 37000468     	tbnz	w8, #0x0, 0x462d4b8 <_ChromeMain+0x462821c>
 462d430: 52800017     	mov	w23, #0x0               ; =0
 462d434: d2800001     	mov	x1, #0x0                ; =0
 462d438: d2800002     	mov	x2, #0x0                ; =0
 462d43c: aa1603f8     	mov	x24, x22
 462d440: 14000027     	b	0x462d4dc <_ChromeMain+0x4628240>
 462d444: 350000e8     	cbnz	w8, 0x462d460 <_ChromeMain+0x46281c4>
 462d448: d2800001     	mov	x1, #0x0                ; =0
 462d44c: d2800002     	mov	x2, #0x0                ; =0
 462d450: 97ff65b4     	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d454: 52800017     	mov	w23, #0x0               ; =0
 462d458: d2800018     	mov	x24, #0x0               ; =0
 462d45c: 14000021     	b	0x462d4e0 <_ChromeMain+0x4628244>
 462d460: 39558008     	ldrb	w8, [x0, #0x560]
 462d464: 7100011f     	cmp	w8, #0x0
 462d468: 52806d08     	mov	w8, #0x368              ; =872
 462d46c: 5280ab09     	mov	w9, #0x558              ; =1368
 462d470: 9a881128     	csel	x8, x9, x8, ne
 462d474: f8686801     	ldr	x1, [x0, x8]
 462d478: 52800037     	mov	w23, #0x1               ; =1
 462d47c: 52800022     	mov	w2, #0x1                ; =1
 462d480: 97ff65a8     	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d484: aa1303e0     	mov	x0, x19
 462d488: 94007fda     	bl	0x464d3f0 <_ChromeMain+0x4648154>
 462d48c: a90187e0     	stp	x0, x1, [sp, #0x18]
 462d490: d004c8c8     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 462d494: 3dc29500     	ldr	q0, [x8, #0xa50]
 462d498: 3d8003e0     	str	q0, [sp]
 462d49c: 910063e0     	add	x0, sp, #0x18
 462d4a0: 910003e1     	mov	x1, sp
 462d4a4: 96f67f05     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 462d4a8: 3cc183e0     	ldur	q0, [sp, #0x18]
 462d4ac: 3d800fe0     	str	q0, [sp, #0x30]
 462d4b0: 390103f7     	strb	w23, [sp, #0x40]
 462d4b4: f9435660     	ldr	x0, [x19, #0x6a8]
 462d4b8: 39558008     	ldrb	w8, [x0, #0x560]
 462d4bc: 7100011f     	cmp	w8, #0x0
 462d4c0: 52806d08     	mov	w8, #0x368              ; =872
 462d4c4: 5280ab09     	mov	w9, #0x558              ; =1368
 462d4c8: 9a881128     	csel	x8, x9, x8, ne
 462d4cc: f8686801     	ldr	x1, [x0, x8]
 462d4d0: 52800037     	mov	w23, #0x1               ; =1
 462d4d4: aa1603f8     	mov	x24, x22
 462d4d8: 52800022     	mov	w2, #0x1                ; =1
 462d4dc: 97ff6591     	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d4e0: 925e7708     	and	x8, x24, #0xfffffffc00000000
 462d4e4: b0052c39     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d4e8: f9404729     	ldr	x9, [x25, #0x88]
 462d4ec: eb09011f     	cmp	x8, x9
 462d4f0: 54000061     	b.ne	0x462d4fc <_ChromeMain+0x4628260>
 462d4f4: aa1803e0     	mov	x0, x24
 462d4f8: 96e79b81     	bl	0x142fc <_ChromeMain+0xf060>
 462d4fc: f9436660     	ldr	x0, [x19, #0x6c8]
 462d500: 925e7408     	and	x8, x0, #0xfffffffc00000000
 462d504: f9404729     	ldr	x9, [x25, #0x88]
 462d508: eb09011f     	cmp	x8, x9
 462d50c: 54000041     	b.ne	0x462d514 <_ChromeMain+0x4628278>
 462d510: 96e7d54b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d514: f9036678     	str	x24, [x19, #0x6c8]
 462d518: 34000137     	cbz	w23, 0x462d53c <_ChromeMain+0x46282a0>
 462d51c: 910022c1     	add	x1, x22, #0x8
 462d520: 9100c3e4     	add	x4, sp, #0x30
 462d524: aa1303e0     	mov	x0, x19
 462d528: aa1503e2     	mov	x2, x21
 462d52c: aa1403e3     	mov	x3, x20
 462d530: 52800025     	mov	w5, #0x1                ; =1
 462d534: 94008f03     	bl	0x4651140 <_ChromeMain+0x464bea4>
 462d538: 17ffff39     	b	0x462d21c <_ChromeMain+0x4627f80>
 462d53c: f9435e74     	ldr	x20, [x19, #0x6b8]
 462d540: b4000114     	cbz	x20, 0x462d560 <_ChromeMain+0x46282c4>
 462d544: 394ce288     	ldrb	w8, [x20, #0x338]
 462d548: 350001a8     	cbnz	w8, 0x462d57c <_ChromeMain+0x46282e0>
 462d54c: f9400288     	ldr	x8, [x20]
 462d550: f9405108     	ldr	x8, [x8, #0xa0]
 462d554: aa1403e0     	mov	x0, x20
 462d558: 52800001     	mov	w1, #0x0                ; =0
 462d55c: d63f0100     	blr	x8
 462d560: f9465260     	ldr	x0, [x19, #0xca0]
 462d564: f906527f     	str	xzr, [x19, #0xca0]
 462d568: b4ffe5a0     	cbz	x0, 0x462d21c <_ChromeMain+0x4627f80>
 462d56c: 94e623bb     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462d570: 52800301     	mov	w1, #0x18               ; =24
 462d574: 96e76e51     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462d578: 17ffff29     	b	0x462d21c <_ChromeMain+0x4627f80>
 462d57c: 390ce29f     	strb	wzr, [x20, #0x338]
 462d580: f941a680     	ldr	x0, [x20, #0x348]
 462d584: 910ca281     	add	x1, x20, #0x328
 462d588: 976b705e     	bl	0x2109700 <_ChromeMain+0x2104464>
 462d58c: f9419688     	ldr	x8, [x20, #0x328]
 462d590: f9401d08     	ldr	x8, [x8, #0x38]
 462d594: 910ca280     	add	x0, x20, #0x328
 462d598: d63f0100     	blr	x8
 462d59c: f941a288     	ldr	x8, [x20, #0x340]
 462d5a0: b4fffd68     	cbz	x8, 0x462d54c <_ChromeMain+0x46282b0>
 462d5a4: f9419688     	ldr	x8, [x20, #0x328]
 462d5a8: f9402108     	ldr	x8, [x8, #0x40]
 462d5ac: 910ca280     	add	x0, x20, #0x328
 462d5b0: d63f0100     	blr	x8
 462d5b4: f941a288     	ldr	x8, [x20, #0x340]
 462d5b8: f9400109     	ldr	x9, [x8]
 462d5bc: 7100001f     	cmp	w0, #0x0
 462d5c0: 5280020a     	mov	w10, #0x10              ; =16
 462d5c4: 5280040b     	mov	w11, #0x20              ; =32
 462d5c8: 9a8a116a     	csel	x10, x11, x10, ne
 462d5cc: f86a6929     	ldr	x9, [x9, x10]
 462d5d0: 910ca281     	add	x1, x20, #0x328
 462d5d4: aa0803e0     	mov	x0, x8
 462d5d8: d63f0120     	blr	x9
 462d5dc: 17ffffdc     	b	0x462d54c <_ChromeMain+0x46282b0>
