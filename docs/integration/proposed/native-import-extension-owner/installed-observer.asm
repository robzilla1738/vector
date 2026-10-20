
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425f2c0: d10203ff     	sub	sp, sp, #0x80
 425f2c4: a9026ffc     	stp	x28, x27, [sp, #0x20]
 425f2c8: a90367fa     	stp	x26, x25, [sp, #0x30]
 425f2cc: a9045ff8     	stp	x24, x23, [sp, #0x40]
 425f2d0: a90557f6     	stp	x22, x21, [sp, #0x50]
 425f2d4: a9064ff4     	stp	x20, x19, [sp, #0x60]
 425f2d8: a9077bfd     	stp	x29, x30, [sp, #0x70]
 425f2dc: 9101c3fd     	add	x29, sp, #0x70
 425f2e0: f9400416     	ldr	x22, [x0, #0x8]
 425f2e4: eb0102df     	cmp	x22, x1
 425f2e8: fa400844     	ccmp	x2, #0x0, #0x4, eq
 425f2ec: 540003c0     	b.eq	0x425f364 <_ChromeMain+0x425a0c8>
 425f2f0: aa0003f3     	mov	x19, x0
 425f2f4: aa0003f8     	mov	x24, x0
 425f2f8: f8418f14     	ldr	x20, [x24, #0x18]!
 425f2fc: b4000354     	cbz	x20, 0x425f364 <_ChromeMain+0x425a0c8>
 425f300: aa0203f5     	mov	x21, x2
 425f304: d1002319     	sub	x25, x24, #0x8
 425f308: f9411448     	ldr	x8, [x2, #0x228]
 425f30c: 39805d09     	ldrsb	x9, [x8, #0x17]
 425f310: a9402d0a     	ldp	x10, x11, [x8]
 425f314: f100013f     	cmp	x9, #0x0
 425f318: 9a884157     	csel	x23, x10, x8, mi
 425f31c: 7100013f     	cmp	w9, #0x0
 425f320: 9a89417b     	csel	x27, x11, x9, mi
 425f324: aa1403fa     	mov	x26, x20
 425f328: f8420f48     	ldr	x8, [x26, #0x20]!
 425f32c: 39805f49     	ldrsb	x9, [x26, #0x17]
 425f330: f100013f     	cmp	x9, #0x0
 425f334: 9a9a4101     	csel	x1, x8, x26, mi
 425f338: f9400748     	ldr	x8, [x26, #0x8]
 425f33c: 7100013f     	cmp	w9, #0x0
 425f340: 9a89411c     	csel	x28, x8, x9, mi
 425f344: eb1b039f     	cmp	x28, x27
 425f348: 9a9b3382     	csel	x2, x28, x27, lo
 425f34c: aa1703e0     	mov	x0, x23
 425f350: 94f6a944     	bl	0x8009860 <_ChromeMain+0x80045c4>
 425f354: 34000200     	cbz	w0, 0x425f394 <_ChromeMain+0x425a0f8>
 425f358: 37f80180     	tbnz	w0, #0x1f, 0x425f388 <_ChromeMain+0x425a0ec>
 425f35c: f9400694     	ldr	x20, [x20, #0x8]
 425f360: b5fffe34     	cbnz	x20, 0x425f324 <_ChromeMain+0x425a088>
 425f364: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 425f368: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 425f36c: a94557f6     	ldp	x22, x21, [sp, #0x50]
 425f370: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 425f374: a94367fa     	ldp	x26, x25, [sp, #0x30]
 425f378: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 425f37c: 910203ff     	add	sp, sp, #0x80
 425f380: d65f03c0     	ret
 425f384: 54fffec2     	b.hs	0x425f35c <_ChromeMain+0x425a0c0>
 425f388: f9400294     	ldr	x20, [x20]
 425f38c: b5fffcd4     	cbnz	x20, 0x425f324 <_ChromeMain+0x425a088>
 425f390: 17fffff5     	b	0x425f364 <_ChromeMain+0x425a0c8>
 425f394: eb1c037f     	cmp	x27, x28
 425f398: 54ffff61     	b.ne	0x425f384 <_ChromeMain+0x425a0e8>
 425f39c: eb18029f     	cmp	x20, x24
 425f3a0: 54fffe20     	b.eq	0x425f364 <_ChromeMain+0x425a0c8>
 425f3a4: 977ea5b4     	bl	0x2208a74 <_ChromeMain+0x22037d8>
 425f3a8: aa1603e1     	mov	x1, x22
 425f3ac: 52800022     	mov	w2, #0x1                ; =1
 425f3b0: 96f7ce79     	bl	0x52d94 <_ChromeMain+0x4daf8>
 425f3b4: b5000880     	cbnz	x0, 0x425f4c4 <_ChromeMain+0x425a228>
 425f3b8: f9400689     	ldr	x9, [x20, #0x8]
 425f3bc: b50007c9     	cbnz	x9, 0x425f4b4 <_ChromeMain+0x425a218>
 425f3c0: aa1403e8     	mov	x8, x20
 425f3c4: aa0803e9     	mov	x9, x8
 425f3c8: f9400908     	ldr	x8, [x8, #0x10]
 425f3cc: f940010a     	ldr	x10, [x8]
 425f3d0: eb0a013f     	cmp	x9, x10
 425f3d4: 54ffff81     	b.ne	0x425f3c4 <_ChromeMain+0x425a128>
 425f3d8: f9400329     	ldr	x9, [x25]
 425f3dc: eb14013f     	cmp	x9, x20
 425f3e0: 54000041     	b.ne	0x425f3e8 <_ChromeMain+0x425a14c>
 425f3e4: f9000328     	str	x8, [x25]
 425f3e8: a941a260     	ldp	x0, x8, [x19, #0x18]
 425f3ec: d1000508     	sub	x8, x8, #0x1
 425f3f0: f9001268     	str	x8, [x19, #0x20]
 425f3f4: aa1403e1     	mov	x1, x20
 425f3f8: 96fa9fb5     	bl	0x1072cc <_ChromeMain+0x102030>
 425f3fc: b4000cfa     	cbz	x26, 0x425f598 <_ChromeMain+0x425a2fc>
 425f400: 39c0de88     	ldrsb	w8, [x20, #0x37]
 425f404: 37f804e8     	tbnz	w8, #0x1f, 0x425f4a0 <_ChromeMain+0x425a204>
 425f408: aa1403e0     	mov	x0, x20
 425f40c: 52800701     	mov	w1, #0x38               ; =56
 425f410: 96f6a6aa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425f414: f9401268     	ldr	x8, [x19, #0x20]
 425f418: b5fffa68     	cbnz	x8, 0x425f364 <_ChromeMain+0x425a0c8>
 425f41c: f9401a74     	ldr	x20, [x19, #0x30]
 425f420: f0054a95     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 425f424: b4000174     	cbz	x20, 0x425f450 <_ChromeMain+0x425a1b4>
 425f428: f9001a7f     	str	xzr, [x19, #0x30]
 425f42c: f9401661     	ldr	x1, [x19, #0x28]
 425f430: 91026280     	add	x0, x20, #0x98
 425f434: 9756e8d1     	bl	0x1819778 <_ChromeMain+0x18144dc>
 425f438: 925e7688     	and	x8, x20, #0xfffffffc00000000
 425f43c: f94046a9     	ldr	x9, [x21, #0x88]
 425f440: eb09011f     	cmp	x8, x9
 425f444: 54000061     	b.ne	0x425f450 <_ChromeMain+0x425a1b4>
 425f448: aa1403e0     	mov	x0, x20
 425f44c: 96f70d7c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 425f450: b4fff8b3     	cbz	x19, 0x425f364 <_ChromeMain+0x425a0c8>
 425f454: f0050028     	adrp	x8, 0xe266000 <dyld_stub_binder+0xe266000>
 425f458: 9134a108     	add	x8, x8, #0xd28
 425f45c: f9000268     	str	x8, [x19]
 425f460: 9100a260     	add	x0, x19, #0x28
 425f464: 97570d59     	bl	0x18229c8 <_ChromeMain+0x181d72c>
 425f468: f9400e61     	ldr	x1, [x19, #0x18]
 425f46c: f90003f9     	str	x25, [sp]
 425f470: 910003e0     	mov	x0, sp
 425f474: 9713058e     	bl	0x720aac <_ChromeMain+0x71b810>
 425f478: f9400660     	ldr	x0, [x19, #0x8]
 425f47c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 425f480: f94046a9     	ldr	x9, [x21, #0x88]
 425f484: eb09011f     	cmp	x8, x9
 425f488: 54000041     	b.ne	0x425f490 <_ChromeMain+0x425a1f4>
 425f48c: 96f70d6c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 425f490: aa1303e0     	mov	x0, x19
 425f494: 52800701     	mov	w1, #0x38               ; =56
 425f498: 96f6a688     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425f49c: 17ffffb2     	b	0x425f364 <_ChromeMain+0x425a0c8>
 425f4a0: f9401280     	ldr	x0, [x20, #0x20]
 425f4a4: f9401a88     	ldr	x8, [x20, #0x30]
 425f4a8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425f4ac: 96f6a683     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425f4b0: 17ffffd6     	b	0x425f408 <_ChromeMain+0x425a16c>
 425f4b4: aa0903e8     	mov	x8, x9
 425f4b8: f9400129     	ldr	x9, [x9]
 425f4bc: b5ffffc9     	cbnz	x9, 0x425f4b4 <_ChromeMain+0x425a218>
 425f4c0: 17ffffc6     	b	0x425f3d8 <_ChromeMain+0x425a13c>
 425f4c4: aa0003f7     	mov	x23, x0
 425f4c8: 90055520     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 425f4cc: 9135a000     	add	x0, x0, #0xd68
 425f4d0: f9400008     	ldr	x8, [x0]
 425f4d4: d63f0100     	blr	x8
 425f4d8: f9400008     	ldr	x8, [x0]
 425f4dc: b4000608     	cbz	x8, 0x425f59c <_ChromeMain+0x425a300>
 425f4e0: f9400116     	ldr	x22, [x8]
 425f4e4: b40005d6     	cbz	x22, 0x425f59c <_ChromeMain+0x425a300>
 425f4e8: 9004c600     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425f4ec: 91292400     	add	x0, x0, #0xa49
 425f4f0: 9004c601     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425f4f4: 91080821     	add	x1, x1, #0x202
 425f4f8: 910003e8     	mov	x8, sp
 425f4fc: 5280dce2     	mov	w2, #0x6e7              ; =1767
 425f500: 96f7c5e0     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 425f504: 910522e0     	add	x0, x23, #0x148
 425f508: 942e4b7e     	bl	0x4df2300 <_ChromeMain+0x4ded064>
 425f50c: aa0003f7     	mov	x23, x0
 425f510: aa0103f8     	mov	x24, x1
 425f514: f94116bb     	ldr	x27, [x21, #0x228]
 425f518: 52800a00     	mov	w0, #0x50               ; =80
 425f51c: 96f6bf93     	bl	0xf368 <_ChromeMain+0xa0cc>
 425f520: aa0003f5     	mov	x21, x0
 425f524: 52800028     	mov	w8, #0x1                ; =1
 425f528: b9000008     	str	w8, [x0]
 425f52c: 10001288     	adr	x8, 0x425f77c <_ChromeMain+0x425a4e0>
 425f530: d503201f     	nop
 425f534: b0ffee49     	adrp	x9, 0x4028000 <_ChromeMain+0x4022d64>
 425f538: 91248129     	add	x9, x9, #0x920
 425f53c: a900a408     	stp	x8, x9, [x0, #0x8]
 425f540: d0ff17e8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 425f544: 912c0108     	add	x8, x8, #0xb00
 425f548: f9000c08     	str	x8, [x0, #0x18]
 425f54c: a902e017     	stp	x23, x24, [x0, #0x28]
 425f550: 39c05f68     	ldrsb	w8, [x27, #0x17]
 425f554: 37f801a8     	tbnz	w8, #0x1f, 0x425f588 <_ChromeMain+0x425a2ec>
 425f558: 3dc00360     	ldr	q0, [x27]
 425f55c: f9400b68     	ldr	x8, [x27, #0x10]
 425f560: f80482a8     	stur	x8, [x21, #0x48]
 425f564: 3c8382a0     	stur	q0, [x21, #0x38]
 425f568: f94002c8     	ldr	x8, [x22]
 425f56c: f9400108     	ldr	x8, [x8]
 425f570: 910003e1     	mov	x1, sp
 425f574: aa1603e0     	mov	x0, x22
 425f578: aa1503e2     	mov	x2, x21
 425f57c: d2800003     	mov	x3, #0x0                ; =0
 425f580: d63f0100     	blr	x8
 425f584: 17ffff8d     	b	0x425f3b8 <_ChromeMain+0x425a11c>
 425f588: a9400b61     	ldp	x1, x2, [x27]
 425f58c: 9100e2a0     	add	x0, x21, #0x38
 425f590: 96f6e322     	bl	0x18218 <_ChromeMain+0x12f7c>
 425f594: 17fffff5     	b	0x425f568 <_ChromeMain+0x425a2cc>
 425f598: d4200020     	brk	#0x1
 425f59c: d4200000     	brk	#0
 425f5a0: d4400000     	hlt	#0
 425f5a4: d4200020     	brk	#0x1
