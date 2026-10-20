
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41ef70c: d10203ff     	sub	sp, sp, #0x80
 41ef710: a90557f6     	stp	x22, x21, [sp, #0x50]
 41ef714: a9064ff4     	stp	x20, x19, [sp, #0x60]
 41ef718: a9077bfd     	stp	x29, x30, [sp, #0x70]
 41ef71c: 9101c3fd     	add	x29, sp, #0x70
 41ef720: aa0103f5     	mov	x21, x1
 41ef724: aa0003f4     	mov	x20, x0
 41ef728: f9400c00     	ldr	x0, [x0, #0x18]
 41ef72c: f9400008     	ldr	x8, [x0]
 41ef730: f9423508     	ldr	x8, [x8, #0x468]
 41ef734: d63f0100     	blr	x8
 41ef738: aa0003f3     	mov	x19, x0
 41ef73c: f9401280     	ldr	x0, [x20, #0x20]
 41ef740: f942fc08     	ldr	x8, [x0, #0x5f8]
 41ef744: b4000048     	cbz	x8, 0x41ef74c <_ChromeMain+0x41ea4b0>
 41ef748: f9400d08     	ldr	x8, [x8, #0x18]
 41ef74c: eb15011f     	cmp	x8, x21
 41ef750: 54000060     	b.eq	0x41ef75c <_ChromeMain+0x41ea4c0>
 41ef754: 6f00e400     	movi.2d	v0, #0000000000000000
 41ef758: 94ee3d43     	bl	0x7d7ec64 <_ChromeMain+0x7d799c8>
 41ef75c: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 41ef760: f90027ff     	str	xzr, [sp, #0x48]
 41ef764: f9431ea0     	ldr	x0, [x21, #0x638]
 41ef768: 9100e3e8     	add	x8, sp, #0x38
 41ef76c: 94e8eeb5     	bl	0x7c2b240 <_ChromeMain+0x7c25fa4>
 41ef770: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 41ef774: f9001bff     	str	xzr, [sp, #0x30]
 41ef778: f9431ea0     	ldr	x0, [x21, #0x638]
 41ef77c: 910083e8     	add	x8, sp, #0x20
 41ef780: aa1303e1     	mov	x1, x19
 41ef784: 97fe776f     	bl	0x418d540 <_ChromeMain+0x41882a4>
 41ef788: f9431ea8     	ldr	x8, [x21, #0x638]
 41ef78c: 39c0dd09     	ldrsb	w9, [x8, #0x37]
 41ef790: 36f800a9     	tbz	w9, #0x1f, 0x41ef7a4 <_ChromeMain+0x41ea508>
 41ef794: a9420901     	ldp	x1, x2, [x8, #0x20]
 41ef798: 910003e0     	mov	x0, sp
 41ef79c: 96f8a29f     	bl	0x18218 <_ChromeMain+0x12f7c>
 41ef7a0: 14000005     	b	0x41ef7b4 <_ChromeMain+0x41ea518>
 41ef7a4: 3cc20100     	ldur	q0, [x8, #0x20]
 41ef7a8: f8430108     	ldur	x8, [x8, #0x30]
 41ef7ac: f9000be8     	str	x8, [sp, #0x10]
 41ef7b0: 3d8003e0     	str	q0, [sp]
 41ef7b4: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41ef7b8: 36f80588     	tbz	w8, #0x1f, 0x41ef868 <_ChromeMain+0x41ea5cc>
 41ef7bc: f94007e9     	ldr	x9, [sp, #0x8]
 41ef7c0: f100813f     	cmp	x9, #0x20
 41ef7c4: 54000521     	b.ne	0x41ef868 <_ChromeMain+0x41ea5cc>
 41ef7c8: b00462c8     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 41ef7cc: 91252508     	add	x8, x8, #0x949
 41ef7d0: f94003e0     	ldr	x0, [sp]
 41ef7d4: f9400be9     	ldr	x9, [sp, #0x10]
 41ef7d8: a9402c0a     	ldp	x10, x11, [x0]
 41ef7dc: a940350c     	ldp	x12, x13, [x8]
 41ef7e0: a9413c0e     	ldp	x14, x15, [x0, #0x10]
 41ef7e4: eb0c015f     	cmp	x10, x12
 41ef7e8: a941210a     	ldp	x10, x8, [x8, #0x10]
 41ef7ec: fa4d0160     	ccmp	x11, x13, #0x0, eq
 41ef7f0: fa4a01c0     	ccmp	x14, x10, #0x0, eq
 41ef7f4: fa4801e0     	ccmp	x15, x8, #0x0, eq
 41ef7f8: 1a9f07f6     	cset	w22, ne
 41ef7fc: 9240f921     	and	x1, x9, #0x7fffffffffffffff
 41ef800: 96f865ae     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41ef804: 350003d6     	cbnz	w22, 0x41ef87c <_ChromeMain+0x41ea5e0>
 41ef808: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 41ef80c: 37f800a8     	tbnz	w8, #0x1f, 0x41ef820 <_ChromeMain+0x41ea584>
 41ef810: 52800128     	mov	w8, #0x9                ; =9
 41ef814: 39013fe8     	strb	w8, [sp, #0x4f]
 41ef818: 9100e3e8     	add	x8, sp, #0x38
 41ef81c: 14000004     	b	0x41ef82c <_ChromeMain+0x41ea590>
 41ef820: 52800128     	mov	w8, #0x9                ; =9
 41ef824: f90023e8     	str	x8, [sp, #0x40]
 41ef828: f9401fe8     	ldr	x8, [sp, #0x38]
 41ef82c: 52800ca9     	mov	w9, #0x65               ; =101
 41ef830: b9001109     	str	w9, [x8, #0x10]
 41ef834: d004ec49     	adrp	x9, 0xdf79000 <dyld_stub_binder+0xdf79000>
 41ef838: 912f7929     	add	x9, x9, #0xbde
 41ef83c: 3dc00120     	ldr	q0, [x9]
 41ef840: 3d800100     	str	q0, [x8]
 41ef844: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 41ef848: 36f800a8     	tbz	w8, #0x1f, 0x41ef85c <_ChromeMain+0x41ea5c0>
 41ef84c: f94013e0     	ldr	x0, [sp, #0x20]
 41ef850: f9401be8     	ldr	x8, [sp, #0x30]
 41ef854: d37ff901     	lsl	x1, x8, #1
 41ef858: 96f86598     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41ef85c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 41ef860: f9001bff     	str	xzr, [sp, #0x30]
 41ef864: 14000033     	b	0x41ef930 <_ChromeMain+0x41ea694>
 41ef868: 36f800a8     	tbz	w8, #0x1f, 0x41ef87c <_ChromeMain+0x41ea5e0>
 41ef86c: f94003e0     	ldr	x0, [sp]
 41ef870: f9400be8     	ldr	x8, [sp, #0x10]
 41ef874: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41ef878: 96f86590     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41ef87c: 39413fe8     	ldrb	w8, [sp, #0x4f]
 41ef880: 13001d0b     	sxtb	w11, w8
 41ef884: f94023e9     	ldr	x9, [sp, #0x40]
 41ef888: 7100017f     	cmp	w11, #0x0
 41ef88c: 9a884129     	csel	x9, x9, x8, mi
 41ef890: 3940dfea     	ldrb	w10, [sp, #0x37]
 41ef894: 13001d48     	sxtb	w8, w10
 41ef898: f94017e2     	ldr	x2, [sp, #0x28]
 41ef89c: 7100011f     	cmp	w8, #0x0
 41ef8a0: 9a8a404a     	csel	x10, x2, x10, mi
 41ef8a4: eb0a013f     	cmp	x9, x10
 41ef8a8: 54000100     	b.eq	0x41ef8c8 <_ChromeMain+0x41ea62c>
 41ef8ac: 36f80228     	tbz	w8, #0x1f, 0x41ef8f0 <_ChromeMain+0x41ea654>
 41ef8b0: f94013e1     	ldr	x1, [sp, #0x20]
 41ef8b4: 910003e0     	mov	x0, sp
 41ef8b8: 96f95cc6     	bl	0x46bd0 <_ChromeMain+0x41934>
 41ef8bc: 3940dfe8     	ldrb	w8, [sp, #0x37]
 41ef8c0: 36380308     	tbz	w8, #0x7, 0x41ef920 <_ChromeMain+0x41ea684>
 41ef8c4: 14000013     	b	0x41ef910 <_ChromeMain+0x41ea674>
 41ef8c8: b40001e9     	cbz	x9, 0x41ef904 <_ChromeMain+0x41ea668>
 41ef8cc: f94013ea     	ldr	x10, [sp, #0x20]
 41ef8d0: 7100011f     	cmp	w8, #0x0
 41ef8d4: 910083ec     	add	x12, sp, #0x20
 41ef8d8: 9a8c414a     	csel	x10, x10, x12, mi
 41ef8dc: f9401fec     	ldr	x12, [sp, #0x38]
 41ef8e0: 7100017f     	cmp	w11, #0x0
 41ef8e4: 9100e3eb     	add	x11, sp, #0x38
 41ef8e8: 9a8b418b     	csel	x11, x12, x11, mi
 41ef8ec: 1400002b     	b	0x41ef998 <_ChromeMain+0x41ea6fc>
 41ef8f0: 3dc00be0     	ldr	q0, [sp, #0x20]
 41ef8f4: 3d8003e0     	str	q0, [sp]
 41ef8f8: f9401be8     	ldr	x8, [sp, #0x30]
 41ef8fc: f9000be8     	str	x8, [sp, #0x10]
 41ef900: 14000008     	b	0x41ef920 <_ChromeMain+0x41ea684>
 41ef904: a9007fff     	stp	xzr, xzr, [sp]
 41ef908: f9000bff     	str	xzr, [sp, #0x10]
 41ef90c: 363800a8     	tbz	w8, #0x7, 0x41ef920 <_ChromeMain+0x41ea684>
 41ef910: f94013e0     	ldr	x0, [sp, #0x20]
 41ef914: f9401be8     	ldr	x8, [sp, #0x30]
 41ef918: d37ff901     	lsl	x1, x8, #1
 41ef91c: 96f86567     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41ef920: 3dc003e0     	ldr	q0, [sp]
 41ef924: 3d800be0     	str	q0, [sp, #0x20]
 41ef928: f9400be8     	ldr	x8, [sp, #0x10]
 41ef92c: f9001be8     	str	x8, [sp, #0x30]
 41ef930: f9431ea0     	ldr	x0, [x21, #0x638]
 41ef934: aa1303e1     	mov	x1, x19
 41ef938: 94e8f0ae     	bl	0x7c2bbf0 <_ChromeMain+0x7c26954>
 41ef93c: aa0003e3     	mov	x3, x0
 41ef940: f9401280     	ldr	x0, [x20, #0x20]
 41ef944: 9100e3e1     	add	x1, sp, #0x38
 41ef948: 910083e2     	add	x2, sp, #0x20
 41ef94c: aa1303e4     	mov	x4, x19
 41ef950: 94ee3cdd     	bl	0x7d7ecc4 <_ChromeMain+0x7d79a28>
 41ef954: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 41ef958: 36f800a8     	tbz	w8, #0x1f, 0x41ef96c <_ChromeMain+0x41ea6d0>
 41ef95c: f94013e0     	ldr	x0, [sp, #0x20]
 41ef960: f9401be8     	ldr	x8, [sp, #0x30]
 41ef964: d37ff901     	lsl	x1, x8, #1
 41ef968: 96f86554     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41ef96c: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 41ef970: 36f800a8     	tbz	w8, #0x1f, 0x41ef984 <_ChromeMain+0x41ea6e8>
 41ef974: f9401fe0     	ldr	x0, [sp, #0x38]
 41ef978: f94027e8     	ldr	x8, [sp, #0x48]
 41ef97c: d37ff901     	lsl	x1, x8, #1
 41ef980: 96f8654e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41ef984: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 41ef988: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 41ef98c: a94557f6     	ldp	x22, x21, [sp, #0x50]
 41ef990: 910203ff     	add	sp, sp, #0x80
 41ef994: d65f03c0     	ret
 41ef998: 7840256c     	ldrh	w12, [x11], #0x2
 41ef99c: 7840254d     	ldrh	w13, [x10], #0x2
 41ef9a0: 6b0c01bf     	cmp	w13, w12
 41ef9a4: 54fff841     	b.ne	0x41ef8ac <_ChromeMain+0x41ea610>
 41ef9a8: f1000529     	subs	x9, x9, #0x1
 41ef9ac: 54ffff61     	b.ne	0x41ef998 <_ChromeMain+0x41ea6fc>
 41ef9b0: 17ffffd5     	b	0x41ef904 <_ChromeMain+0x41ea668>
