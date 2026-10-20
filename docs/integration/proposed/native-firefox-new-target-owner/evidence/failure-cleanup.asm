
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4263840: d10183ff     	sub	sp, sp, #0x60
 4263844: a90357f6     	stp	x22, x21, [sp, #0x30]
 4263848: a9044ff4     	stp	x20, x19, [sp, #0x40]
 426384c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4263850: 910143fd     	add	x29, sp, #0x50
 4263854: aa0003f3     	mov	x19, x0
 4263858: f0056415     	adrp	x21, 0xeee6000 <dyld_stub_binder+0xeee6000>
 426385c: f9467ea0     	ldr	x0, [x21, #0xcf8]
 4263860: b4000180     	cbz	x0, 0x4263890 <_ChromeMain+0x425e5f4>
 4263864: 975ef0c5     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4263868: b4000140     	cbz	x0, 0x4263890 <_ChromeMain+0x425e5f4>
 426386c: 39823e68     	ldrsb	x8, [x19, #0x8f]
 4263870: b6f80048     	tbz	x8, #0x3f, 0x4263878 <_ChromeMain+0x425e5dc>
 4263874: f9404268     	ldr	x8, [x19, #0x80]
 4263878: b40000c8     	cbz	x8, 0x4263890 <_ChromeMain+0x425e5f4>
 426387c: f9467ea0     	ldr	x0, [x21, #0xcf8]
 4263880: 975ef0be     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4263884: 975ef0e3     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4263888: 9101e261     	add	x1, x19, #0x78
 426388c: 94e1a75d     	bl	0x7acd600 <_ChromeMain+0x7ac8364>
 4263890: 39823e68     	ldrsb	x8, [x19, #0x8f]
 4263894: b6f80048     	tbz	x8, #0x3f, 0x426389c <_ChromeMain+0x425e600>
 4263898: f9404268     	ldr	x8, [x19, #0x80]
 426389c: b40004a8     	cbz	x8, 0x4263930 <_ChromeMain+0x425e694>
 42638a0: 9004c5e0     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42638a4: 910ab400     	add	x0, x0, #0x2ad
 42638a8: 9004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42638ac: 91342021     	add	x1, x1, #0xd08
 42638b0: 910023e8     	add	x8, sp, #0x8
 42638b4: 52803982     	mov	w2, #0x1cc              ; =460
 42638b8: 96f7b4f2     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42638bc: 52800800     	mov	w0, #0x40               ; =64
 42638c0: 96f6aeaa     	bl	0xf368 <_ChromeMain+0xa0cc>
 42638c4: aa0003f4     	mov	x20, x0
 42638c8: 52800028     	mov	w8, #0x1                ; =1
 42638cc: f0fee969     	adrp	x9, 0x1f92000 <_ChromeMain+0x1f8cd64>
 42638d0: 91220129     	add	x9, x9, #0x880
 42638d4: b9000008     	str	w8, [x0]
 42638d8: 90ffb328     	adrp	x8, 0x38c7000 <_ChromeMain+0x38c1d64>
 42638dc: 91350108     	add	x8, x8, #0xd40
 42638e0: d0ff17ca     	adrp	x10, 0x255d000 <_ChromeMain+0x2557d64>
 42638e4: 912c014a     	add	x10, x10, #0xb00
 42638e8: a900a009     	stp	x9, x8, [x0, #0x8]
 42638ec: 100079e8     	adr	x8, 0x4264828 <_ChromeMain+0x425f58c>
 42638f0: d503201f     	nop
 42638f4: a901a00a     	stp	x10, x8, [x0, #0x18]
 42638f8: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 42638fc: 37f80a28     	tbnz	w8, #0x1f, 0x4263a40 <_ChromeMain+0x425e7a4>
 4263900: 3cc78260     	ldur	q0, [x19, #0x78]
 4263904: 3c828280     	stur	q0, [x20, #0x28]
 4263908: f8488268     	ldur	x8, [x19, #0x88]
 426390c: f8038288     	stur	x8, [x20, #0x38]
 4263910: d0056528     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 4263914: f940d500     	ldr	x0, [x8, #0x1a8]
 4263918: b0046522     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426391c: 91058c42     	add	x2, x2, #0x163
 4263920: 910023e1     	add	x1, sp, #0x8
 4263924: aa1403e3     	mov	x3, x20
 4263928: d2800004     	mov	x4, #0x0                ; =0
 426392c: 97096995     	bl	0x4bdf80 <_ChromeMain+0x4b8ce4>
 4263930: 3941c268     	ldrb	w8, [x19, #0x70]
 4263934: 34000488     	cbz	w8, 0x42639c4 <_ChromeMain+0x425e728>
 4263938: f9400660     	ldr	x0, [x19, #0x8]
 426393c: b4000400     	cbz	x0, 0x42639bc <_ChromeMain+0x425e720>
 4263940: f9467ea8     	ldr	x8, [x21, #0xcf8]
 4263944: f9414908     	ldr	x8, [x8, #0x290]
 4263948: f9400514     	ldr	x20, [x8, #0x8]
 426394c: 970cf2ea     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 4263950: b4000360     	cbz	x0, 0x42639bc <_ChromeMain+0x425e720>
 4263954: f9402808     	ldr	x8, [x0, #0x50]
 4263958: b5000068     	cbnz	x8, 0x4263964 <_ChromeMain+0x425e6c8>
 426395c: f9402409     	ldr	x9, [x0, #0x48]
 4263960: b4000809     	cbz	x9, 0x4263a60 <_ChromeMain+0x425e7c4>
 4263964: 52800a09     	mov	w9, #0x50               ; =80
 4263968: 5280090a     	mov	w10, #0x48              ; =72
 426396c: f100011f     	cmp	x8, #0x0
 4263970: 9a890148     	csel	x8, x10, x9, eq
 4263974: f8686808     	ldr	x8, [x0, x8]
 4263978: f9400908     	ldr	x8, [x8, #0x10]
 426397c: f9400515     	ldr	x21, [x8, #0x8]
 4263980: b4000715     	cbz	x21, 0x4263a60 <_ChromeMain+0x425e7c4>
 4263984: 9100a2a8     	add	x8, x21, #0x28
 4263988: 381df3bf     	sturb	wzr, [x29, #-0x21]
 426398c: d10087a9     	sub	x9, x29, #0x21
 4263990: a900a3e9     	stp	x9, x8, [sp, #0x8]
 4263994: d0fe5a62     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 4263998: 912dc042     	add	x2, x2, #0xb70
 426399c: 910023e1     	add	x1, sp, #0x8
 42639a0: aa1403e0     	mov	x0, x20
 42639a4: 52800003     	mov	w3, #0x0                ; =0
 42639a8: 52800004     	mov	w4, #0x0                ; =0
 42639ac: 972d37b1     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 42639b0: 385df3a8     	ldurb	w8, [x29, #-0x21]
 42639b4: 7100011f     	cmp	w8, #0x0
 42639b8: 9a9f12a0     	csel	x0, x21, xzr, ne
 42639bc: 52800021     	mov	w1, #0x1                ; =1
 42639c0: 940ca576     	bl	0x458cf98 <_ChromeMain+0x4587cfc>
 42639c4: 3900b27f     	strb	wzr, [x19, #0x2c]
 42639c8: f9401260     	ldr	x0, [x19, #0x20]
 42639cc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 42639d0: f0054a69     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 42639d4: f9404529     	ldr	x9, [x9, #0x88]
 42639d8: eb09011f     	cmp	x8, x9
 42639dc: 54000041     	b.ne	0x42639e4 <_ChromeMain+0x425e748>
 42639e0: 96f6fc17     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 42639e4: f900127f     	str	xzr, [x19, #0x20]
 42639e8: f9400a60     	ldr	x0, [x19, #0x10]
 42639ec: f9000a7f     	str	xzr, [x19, #0x10]
 42639f0: b5000300     	cbnz	x0, 0x4263a50 <_ChromeMain+0x425e7b4>
 42639f4: f9405674     	ldr	x20, [x19, #0xa8]
 42639f8: b40001b4     	cbz	x20, 0x4263a2c <_ChromeMain+0x425e790>
 42639fc: f900567f     	str	xzr, [x19, #0xa8]
 4263a00: f9400688     	ldr	x8, [x20, #0x8]
 4263a04: aa1403e0     	mov	x0, x20
 4263a08: 52800001     	mov	w1, #0x0                ; =0
 4263a0c: d63f0100     	blr	x8
 4263a10: 12800008     	mov	w8, #-0x1               ; =-1
 4263a14: b8e80288     	ldaddal	w8, w8, [x20]
 4263a18: 7100051f     	cmp	w8, #0x1
 4263a1c: 54000081     	b.ne	0x4263a2c <_ChromeMain+0x425e790>
 4263a20: f9400a88     	ldr	x8, [x20, #0x10]
 4263a24: aa1403e0     	mov	x0, x20
 4263a28: d63f0100     	blr	x8
 4263a2c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4263a30: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4263a34: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4263a38: 910183ff     	add	sp, sp, #0x60
 4263a3c: d65f03c0     	ret
 4263a40: a9478a61     	ldp	x1, x2, [x19, #0x78]
 4263a44: 9100a280     	add	x0, x20, #0x28
 4263a48: 96f6d1f4     	bl	0x18218 <_ChromeMain+0x12f7c>
 4263a4c: 17ffffb1     	b	0x4263910 <_ChromeMain+0x425e674>
 4263a50: 94d6f466     	bl	0x7820be8 <_ChromeMain+0x781b94c>
 4263a54: 52800501     	mov	w1, #0x28               ; =40
 4263a58: 96f69518     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4263a5c: 17ffffe6     	b	0x42639f4 <_ChromeMain+0x425e758>
 4263a60: d2800000     	mov	x0, #0x0                ; =0
 4263a64: 17ffffd6     	b	0x42639bc <_ChromeMain+0x425e720>
