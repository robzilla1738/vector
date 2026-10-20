
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425b820: 910c83e0     	add	x0, sp, #0x320
 425b824: 52810601     	mov	w1, #0x830              ; =2096
 425b828: 94f6b7fa     	bl	0x8009810 <_ChromeMain+0x8004574>
 425b82c: 910c83e0     	add	x0, sp, #0x320
 425b830: 94ac3449     	bl	0x6d68954 <_ChromeMain+0x6d636b8>
 425b834: 910643e0     	add	x0, sp, #0x190
 425b838: 52800001     	mov	w1, #0x0                ; =0
 425b83c: 9711e9e9     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b840: aa0003e2     	mov	x2, x0
 425b844: aa0103e3     	mov	x3, x1
 425b848: 9103a3e0     	add	x0, sp, #0xe8
 425b84c: aa0203e1     	mov	x1, x2
 425b850: aa0303e2     	mov	x2, x3
 425b854: 97045260     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425b858: 9100a2a0     	add	x0, x21, #0x28
 425b85c: 9103a3e1     	add	x1, sp, #0xe8
 425b860: 970e78a0     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425b864: 9101c2c0     	add	x0, x22, #0x70
 425b868: d2800001     	mov	x1, #0x0                ; =0
 425b86c: 96f73113     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425b870: 910082c0     	add	x0, x22, #0x20
 425b874: 96f73101     	bl	0x27c78 <_ChromeMain+0x229dc>
 425b878: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425b87c: 36f800a8     	tbz	w8, #0x1f, 0x425b890 <_ChromeMain+0x42565f4>
 425b880: f94077e0     	ldr	x0, [sp, #0xe8]
 425b884: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b888: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b88c: 96f6b58b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b890: 910643e0     	add	x0, sp, #0x190
 425b894: 52800021     	mov	w1, #0x1                ; =1
 425b898: 9711e9d2     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b89c: aa0003e2     	mov	x2, x0
 425b8a0: aa0103e3     	mov	x3, x1
 425b8a4: 9103a3e0     	add	x0, sp, #0xe8
 425b8a8: aa0203e1     	mov	x1, x2
 425b8ac: aa0303e2     	mov	x2, x3
 425b8b0: 97045249     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425b8b4: 910282a0     	add	x0, x21, #0xa0
 425b8b8: 9103a3e1     	add	x1, sp, #0xe8
 425b8bc: 970e7889     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425b8c0: 9101c2c0     	add	x0, x22, #0x70
 425b8c4: d2800001     	mov	x1, #0x0                ; =0
 425b8c8: 96f730fc     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425b8cc: 910082c0     	add	x0, x22, #0x20
 425b8d0: 96f730ea     	bl	0x27c78 <_ChromeMain+0x229dc>
 425b8d4: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425b8d8: 36f800a8     	tbz	w8, #0x1f, 0x425b8ec <_ChromeMain+0x4256650>
 425b8dc: f94077e0     	ldr	x0, [sp, #0xe8]
 425b8e0: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b8e4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b8e8: 96f6b574     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b8ec: 910643e0     	add	x0, sp, #0x190
 425b8f0: 52800041     	mov	w1, #0x2                ; =2
 425b8f4: 9711e9bb     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b8f8: 9103a3e8     	add	x8, sp, #0xe8
 425b8fc: 971a1a85     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425b900: 39d61fe8     	ldrsb	w8, [sp, #0x587]
 425b904: 36f800a8     	tbz	w8, #0x1f, 0x425b918 <_ChromeMain+0x425667c>
 425b908: f942bbe0     	ldr	x0, [sp, #0x570]
 425b90c: f942c3e8     	ldr	x8, [sp, #0x580]
 425b910: d37ff901     	lsl	x1, x8, #1
 425b914: 96f6b569     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b918: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425b91c: f94027e9     	ldr	x9, [sp, #0x48]
 425b920: 3d800120     	str	q0, [x9]
 425b924: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b928: f9000928     	str	x8, [x9, #0x10]
 425b92c: 910643e0     	add	x0, sp, #0x190
 425b930: 52800061     	mov	w1, #0x3                ; =3
 425b934: 9711e9ab     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b938: 9103a3e8     	add	x8, sp, #0xe8
 425b93c: 971a1a75     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425b940: 39d69fe8     	ldrsb	w8, [sp, #0x5a7]
 425b944: 36f800a8     	tbz	w8, #0x1f, 0x425b958 <_ChromeMain+0x42566bc>
 425b948: f942cbe0     	ldr	x0, [sp, #0x590]
 425b94c: f942d3e8     	ldr	x8, [sp, #0x5a0]
 425b950: d37ff901     	lsl	x1, x8, #1
 425b954: 96f6b559     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b958: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425b95c: f94023e9     	ldr	x9, [sp, #0x40]
 425b960: 3d800120     	str	q0, [x9]
 425b964: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b968: f9000928     	str	x8, [x9, #0x10]
 425b96c: 910643e0     	add	x0, sp, #0x190
 425b970: 52800081     	mov	w1, #0x4                ; =4
 425b974: 9711e99b     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b978: 9103a3e8     	add	x8, sp, #0xe8
 425b97c: 971a1a65     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425b980: 39d7dfe8     	ldrsb	w8, [sp, #0x5f7]
 425b984: 36f800a8     	tbz	w8, #0x1f, 0x425b998 <_ChromeMain+0x42566fc>
 425b988: f942f3e0     	ldr	x0, [sp, #0x5e0]
 425b98c: f942fbe8     	ldr	x8, [sp, #0x5f0]
 425b990: d37ff901     	lsl	x1, x8, #1
 425b994: 96f6b549     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b998: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425b99c: f9401fe9     	ldr	x9, [sp, #0x38]
 425b9a0: 3d800120     	str	q0, [x9]
 425b9a4: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b9a8: f9000928     	str	x8, [x9, #0x10]
 425b9ac: 370002ba     	tbnz	w26, #0x0, 0x425ba00 <_ChromeMain+0x4256764>
 425b9b0: 3985dfe8     	ldrsb	x8, [sp, #0x177]
 425b9b4: a9562be9     	ldp	x9, x10, [sp, #0x160]
 425b9b8: f100011f     	cmp	x8, #0x0
 425b9bc: 910583eb     	add	x11, sp, #0x160
 425b9c0: 9a8b4120     	csel	x0, x9, x11, mi
 425b9c4: 7100011f     	cmp	w8, #0x0
 425b9c8: 9a884141     	csel	x1, x10, x8, mi
 425b9cc: 9103a3e8     	add	x8, sp, #0xe8
 425b9d0: 971a1a50     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425b9d4: 39d85fe8     	ldrsb	w8, [sp, #0x617]
 425b9d8: 36f800a8     	tbz	w8, #0x1f, 0x425b9ec <_ChromeMain+0x4256750>
 425b9dc: f94303e0     	ldr	x0, [sp, #0x600]
 425b9e0: f9430be8     	ldr	x8, [sp, #0x610]
 425b9e4: d37ff901     	lsl	x1, x8, #1
 425b9e8: 96f6b534     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b9ec: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425b9f0: f94003e9     	ldr	x9, [sp]
 425b9f4: 3d800120     	str	q0, [x9]
 425b9f8: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b9fc: f9000928     	str	x8, [x9, #0x10]
 425ba00: 910643e0     	add	x0, sp, #0x190
 425ba04: 528000c1     	mov	w1, #0x6                ; =6
 425ba08: 9711e976     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425ba0c: 9103a3e8     	add	x8, sp, #0xe8
 425ba10: 971a1a40     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425ba14: 39d5bfe8     	ldrsb	w8, [sp, #0x56f]
 425ba18: 36f800a8     	tbz	w8, #0x1f, 0x425ba2c <_ChromeMain+0x4256790>
 425ba1c: f942afe0     	ldr	x0, [sp, #0x558]
 425ba20: f942b7e8     	ldr	x8, [sp, #0x568]
 425ba24: d37ff901     	lsl	x1, x8, #1
 425ba28: 96f6b524     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ba2c: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425ba30: f9401be9     	ldr	x9, [sp, #0x30]
 425ba34: 3d800120     	str	q0, [x9]
 425ba38: f9407fe8     	ldr	x8, [sp, #0xf8]
 425ba3c: f9000928     	str	x8, [x9, #0x10]
 425ba40: 9103a3e8     	add	x8, sp, #0xe8
 425ba44: 910643e0     	add	x0, sp, #0x190
 425ba48: 528000e1     	mov	w1, #0x7                ; =7
 425ba4c: 9711ea5b     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425ba50: 39cd1fe8     	ldrsb	w8, [sp, #0x347]
 425ba54: 36f800a8     	tbz	w8, #0x1f, 0x425ba68 <_ChromeMain+0x42567cc>
 425ba58: f9419be0     	ldr	x0, [sp, #0x330]
 425ba5c: f941a3e8     	ldr	x8, [sp, #0x340]
 425ba60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ba64: 96f6b515     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ba68: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425ba6c: 3c8102a0     	stur	q0, [x21, #0x10]
 425ba70: f9407fe8     	ldr	x8, [sp, #0xf8]
 425ba74: f80202a8     	stur	x8, [x21, #0x20]
 425ba78: 910643e0     	add	x0, sp, #0x190
 425ba7c: 52800101     	mov	w1, #0x8                ; =8
 425ba80: 9711e86c     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ba84: f90353e0     	str	x0, [sp, #0x6a0]
 425ba88: 391aa3fa     	strb	w26, [sp, #0x6a8]
 425ba8c: 910643e0     	add	x0, sp, #0x190
 425ba90: 52800141     	mov	w1, #0xa                ; =10
 425ba94: 9711e867     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ba98: b9032be0     	str	w0, [sp, #0x328]
 425ba9c: 910643e0     	add	x0, sp, #0x190
 425baa0: 52800161     	mov	w1, #0xb                ; =11
 425baa4: 9711e863     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425baa8: b906afe0     	str	w0, [sp, #0x6ac]
 425baac: 910643e0     	add	x0, sp, #0x190
 425bab0: 52800181     	mov	w1, #0xc                ; =12
 425bab4: 9711e85f     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bab8: b906b3e0     	str	w0, [sp, #0x6b0]
 425babc: 910643e0     	add	x0, sp, #0x190
 425bac0: 528001a1     	mov	w1, #0xd                ; =13
 425bac4: 9711e947     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bac8: 9103a3e8     	add	x8, sp, #0xe8
 425bacc: 971a1a11     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425bad0: 39e5bfe8     	ldrsb	w8, [sp, #0x96f]
 425bad4: 36f800a8     	tbz	w8, #0x1f, 0x425bae8 <_ChromeMain+0x425684c>
 425bad8: f944afe0     	ldr	x0, [sp, #0x958]
 425badc: f944b7e8     	ldr	x8, [sp, #0x968]
 425bae0: d37ff901     	lsl	x1, x8, #1
 425bae4: 96f6b4f5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bae8: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425baec: f94017e9     	ldr	x9, [sp, #0x28]
 425baf0: 3d800120     	str	q0, [x9]
 425baf4: f9407fe8     	ldr	x8, [sp, #0xf8]
 425baf8: f9000928     	str	x8, [x9, #0x10]
 425bafc: 910643e0     	add	x0, sp, #0x190
 425bb00: 528001c1     	mov	w1, #0xe                ; =14
 425bb04: 9711e937     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bb08: aa0003e2     	mov	x2, x0
 425bb0c: aa0103e3     	mov	x3, x1
 425bb10: 9103a3e0     	add	x0, sp, #0xe8
 425bb14: aa0203e1     	mov	x1, x2
 425bb18: aa0303e2     	mov	x2, x3
 425bb1c: 970451ae     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425bb20: 911942a0     	add	x0, x21, #0x650
 425bb24: 9103a3e1     	add	x1, sp, #0xe8
 425bb28: 970e77ee     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425bb2c: 9101c2c0     	add	x0, x22, #0x70
 425bb30: d2800001     	mov	x1, #0x0                ; =0
 425bb34: 96f73061     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425bb38: 910082c0     	add	x0, x22, #0x20
 425bb3c: 96f7304f     	bl	0x27c78 <_ChromeMain+0x229dc>
 425bb40: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425bb44: 36f800a8     	tbz	w8, #0x1f, 0x425bb58 <_ChromeMain+0x42568bc>
 425bb48: f94077e0     	ldr	x0, [sp, #0xe8]
 425bb4c: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bb50: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bb54: 96f6b4d9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bb58: 910643e0     	add	x0, sp, #0x190
 425bb5c: 528001e1     	mov	w1, #0xf                ; =15
 425bb60: 9711e920     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bb64: aa0003e2     	mov	x2, x0
 425bb68: aa0103e3     	mov	x3, x1
 425bb6c: 9103a3e0     	add	x0, sp, #0xe8
 425bb70: aa0203e1     	mov	x1, x2
 425bb74: aa0303e2     	mov	x2, x3
 425bb78: 97045197     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425bb7c: 9102c3e0     	add	x0, sp, #0xb0
 425bb80: 9103a3e1     	add	x1, sp, #0xe8
 425bb84: 972d6c91     	bl	0xdb6dc8 <_ChromeMain+0xdb1b2c>
 425bb88: 794163e8     	ldrh	w8, [sp, #0xb0]
 425bb8c: 7913d3e8     	strh	w8, [sp, #0x9e8]
 425bb90: 39e81fe8     	ldrsb	w8, [sp, #0xa07]
 425bb94: 36f800a8     	tbz	w8, #0x1f, 0x425bba8 <_ChromeMain+0x425690c>
 425bb98: f944fbe0     	ldr	x0, [sp, #0x9f0]
 425bb9c: f94503e8     	ldr	x8, [sp, #0xa00]
 425bba0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bba4: 96f6b4c5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bba8: 3cc08380     	ldur	q0, [x28, #0x8]
 425bbac: f94013e9     	ldr	x9, [sp, #0x20]
 425bbb0: 3d800120     	str	q0, [x9]
 425bbb4: f8418388     	ldur	x8, [x28, #0x18]
 425bbb8: f9000928     	str	x8, [x9, #0x10]
 425bbbc: 39033fff     	strb	wzr, [sp, #0xcf]
 425bbc0: 3902e3ff     	strb	wzr, [sp, #0xb8]
 425bbc4: 39e87fe8     	ldrsb	w8, [sp, #0xa1f]
 425bbc8: 36f801e8     	tbz	w8, #0x1f, 0x425bc04 <_ChromeMain+0x4256968>
 425bbcc: f94507e0     	ldr	x0, [sp, #0xa08]
 425bbd0: f9450fe8     	ldr	x8, [sp, #0xa18]
 425bbd4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bbd8: 96f6b4b8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bbdc: 39c33fe8     	ldrsb	w8, [sp, #0xcf]
 425bbe0: 3cc20380     	ldur	q0, [x28, #0x20]
 425bbe4: f9400fea     	ldr	x10, [sp, #0x18]
 425bbe8: 3d800140     	str	q0, [x10]
 425bbec: f8430389     	ldur	x9, [x28, #0x30]
 425bbf0: f9000949     	str	x9, [x10, #0x10]
 425bbf4: 39039fff     	strb	wzr, [sp, #0xe7]
 425bbf8: 390343ff     	strb	wzr, [sp, #0xd0]
 425bbfc: 36f80128     	tbz	w8, #0x1f, 0x425bc20 <_ChromeMain+0x4256984>
 425bc00: 140000d7     	b	0x425bf5c <_ChromeMain+0x4256cc0>
 425bc04: 3cc20380     	ldur	q0, [x28, #0x20]
 425bc08: f9400fe9     	ldr	x9, [sp, #0x18]
 425bc0c: 3d800120     	str	q0, [x9]
 425bc10: f8430388     	ldur	x8, [x28, #0x30]
 425bc14: f9000928     	str	x8, [x9, #0x10]
 425bc18: 39039fff     	strb	wzr, [sp, #0xe7]
 425bc1c: 390343ff     	strb	wzr, [sp, #0xd0]
 425bc20: 9101c2c0     	add	x0, x22, #0x70
 425bc24: d2800001     	mov	x1, #0x0                ; =0
 425bc28: 96f73024     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425bc2c: 910082c0     	add	x0, x22, #0x20
 425bc30: 96f73012     	bl	0x27c78 <_ChromeMain+0x229dc>
 425bc34: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425bc38: 36f800a8     	tbz	w8, #0x1f, 0x425bc4c <_ChromeMain+0x42569b0>
 425bc3c: f94077e0     	ldr	x0, [sp, #0xe8]
 425bc40: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bc44: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bc48: 96f6b49c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bc4c: 910643e0     	add	x0, sp, #0x190
 425bc50: 52800201     	mov	w1, #0x10               ; =16
 425bc54: 9711e917     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425bc58: 392883e0     	strb	w0, [sp, #0xa20]
 425bc5c: 910643e0     	add	x0, sp, #0x190
 425bc60: 52800221     	mov	w1, #0x11               ; =17
 425bc64: 9711e7f3     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bc68: b90953e0     	str	w0, [sp, #0x950]
 425bc6c: 910643e0     	add	x0, sp, #0x190
 425bc70: 52800241     	mov	w1, #0x12               ; =18
 425bc74: 9711e7ef     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bc78: f90347e0     	str	x0, [sp, #0x688]
 425bc7c: 910643e0     	add	x0, sp, #0x190
 425bc80: 52800261     	mov	w1, #0x13               ; =19
 425bc84: 9711e7eb     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bc88: f9034fe0     	str	x0, [sp, #0x698]
 425bc8c: 910643e0     	add	x0, sp, #0x190
 425bc90: 52800281     	mov	w1, #0x14               ; =20
 425bc94: 9711e8d3     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bc98: 9103a3e8     	add	x8, sp, #0xe8
 425bc9c: 971a199d     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425bca0: 39eabfe8     	ldrsb	w8, [sp, #0xaaf]
 425bca4: 36f800a8     	tbz	w8, #0x1f, 0x425bcb8 <_ChromeMain+0x4256a1c>
 425bca8: f9454fe0     	ldr	x0, [sp, #0xa98]
 425bcac: f94557e8     	ldr	x8, [sp, #0xaa8]
 425bcb0: d37ff901     	lsl	x1, x8, #1
 425bcb4: 96f6b481     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bcb8: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425bcbc: f9400be9     	ldr	x9, [sp, #0x10]
 425bcc0: 3d800120     	str	q0, [x9]
 425bcc4: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bcc8: f9000928     	str	x8, [x9, #0x10]
 425bccc: 910643e0     	add	x0, sp, #0x190
 425bcd0: 528002a1     	mov	w1, #0x15               ; =21
 425bcd4: 9711e8c3     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bcd8: 9103a3e8     	add	x8, sp, #0xe8
 425bcdc: 971a198d     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425bce0: 39eb1fe8     	ldrsb	w8, [sp, #0xac7]
 425bce4: 36f800a8     	tbz	w8, #0x1f, 0x425bcf8 <_ChromeMain+0x4256a5c>
 425bce8: f9455be0     	ldr	x0, [sp, #0xab0]
 425bcec: f94563e8     	ldr	x8, [sp, #0xac0]
 425bcf0: d37ff901     	lsl	x1, x8, #1
 425bcf4: 96f6b471     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bcf8: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425bcfc: f94007e9     	ldr	x9, [sp, #0x8]
 425bd00: 3d800120     	str	q0, [x9]
 425bd04: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bd08: f9000928     	str	x8, [x9, #0x10]
 425bd0c: 910643e0     	add	x0, sp, #0x190
 425bd10: 528002c1     	mov	w1, #0x16               ; =22
 425bd14: 9711e7c7     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bd18: f905a3e0     	str	x0, [sp, #0xb40]
 425bd1c: 910643e0     	add	x0, sp, #0x190
 425bd20: 528002e1     	mov	w1, #0x17               ; =23
 425bd24: 9711e8e3     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425bd28: 392d23e0     	strb	w0, [sp, #0xb48]
 425bd2c: 910643e0     	add	x0, sp, #0x190
 425bd30: 52800301     	mov	w1, #0x18               ; =24
 425bd34: 9711e8ab     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bd38: aa0003e2     	mov	x2, x0
 425bd3c: aa0103e3     	mov	x3, x1
 425bd40: 9103a3e0     	add	x0, sp, #0xe8
 425bd44: aa0203e1     	mov	x1, x2
 425bd48: aa0303e2     	mov	x2, x3
 425bd4c: 97045122     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425bd50: 911ea2a0     	add	x0, x21, #0x7a8
 425bd54: 9103a3e1     	add	x1, sp, #0xe8
 425bd58: 970e7762     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425bd5c: 9101c2c0     	add	x0, x22, #0x70
 425bd60: d2800001     	mov	x1, #0x0                ; =0
 425bd64: 96f72fd5     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425bd68: 910082c0     	add	x0, x22, #0x20
 425bd6c: 96f72fc3     	bl	0x27c78 <_ChromeMain+0x229dc>
 425bd70: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425bd74: 36f800a8     	tbz	w8, #0x1f, 0x425bd88 <_ChromeMain+0x4256aec>
 425bd78: f94077e0     	ldr	x0, [sp, #0xe8]
 425bd7c: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bd80: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bd84: 96f6b44d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bd88: 910643e0     	add	x0, sp, #0x190
 425bd8c: 52800321     	mov	w1, #0x19               ; =25
 425bd90: 9711e7a8     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bd94: f9034be0     	str	x0, [sp, #0x690]
 425bd98: 910643e0     	add	x0, sp, #0x190
 425bd9c: 52800341     	mov	w1, #0x1a               ; =26
 425bda0: 9711e8c4     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425bda4: 392d27e0     	strb	w0, [sp, #0xb49]
 425bda8: 395aa3e8     	ldrb	w8, [sp, #0x6a8]
 425bdac: 34000228     	cbz	w8, 0x425bdf0 <_ChromeMain+0x4256b54>
 425bdb0: 39d69fe8     	ldrsb	w8, [sp, #0x5a7]
 425bdb4: 37f80088     	tbnz	w8, #0x1f, 0x425bdc4 <_ChromeMain+0x4256b28>
 425bdb8: 790b23ff     	strh	wzr, [sp, #0x590]
 425bdbc: 39169fff     	strb	wzr, [sp, #0x5a7]
 425bdc0: 14000004     	b	0x425bdd0 <_ChromeMain+0x4256b34>
 425bdc4: f942cbe8     	ldr	x8, [sp, #0x590]
 425bdc8: 7900011f     	strh	wzr, [x8]
 425bdcc: f902cfff     	str	xzr, [sp, #0x598]
 425bdd0: 39d85fe8     	ldrsb	w8, [sp, #0x617]
 425bdd4: 37f80088     	tbnz	w8, #0x1f, 0x425bde4 <_ChromeMain+0x4256b48>
 425bdd8: 790c03ff     	strh	wzr, [sp, #0x600]
 425bddc: 39185fff     	strb	wzr, [sp, #0x617]
 425bde0: 14000004     	b	0x425bdf0 <_ChromeMain+0x4256b54>
 425bde4: f94303e8     	ldr	x8, [sp, #0x600]
 425bde8: 7900011f     	strh	wzr, [x8]
 425bdec: f90307ff     	str	xzr, [sp, #0x608]
 425bdf0: 910203e0     	add	x0, sp, #0x80
 425bdf4: 910c83e1     	add	x1, sp, #0x320
 425bdf8: 94ac42a0     	bl	0x6d6c878 <_ChromeMain+0x6d675dc>
 425bdfc: 910c83e0     	add	x0, sp, #0x320
 425be00: 94ac3547     	bl	0x6d6931c <_ChromeMain+0x6d64080>
 425be04: 17fffd5d     	b	0x425b378 <_ChromeMain+0x42560dc>
 425be08: f94187e0     	ldr	x0, [sp, #0x308]
 425be0c: f9418fe8     	ldr	x8, [sp, #0x318]
 425be10: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425be14: 96f6b429     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425be18: 17fffe64     	b	0x425b7a8 <_ChromeMain+0x425650c>
 425be1c: f9417be0     	ldr	x0, [sp, #0x2f0]
 425be20: f94183e8     	ldr	x8, [sp, #0x300]
 425be24: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425be28: 96f6b424     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425be2c: 17fffe61     	b	0x425b7b0 <_ChromeMain+0x4256514>
 425be30: 34ffa428     	cbz	w8, 0x425b2b4 <_ChromeMain+0x4256018>
 425be34: 17fffd23     	b	0x425b2c0 <_ChromeMain+0x4256024>
 425be38: 13001d09     	sxtb	w9, w8
 425be3c: 7100013f     	cmp	w9, #0x0
 425be40: f94193e9     	ldr	x9, [sp, #0x320]
 425be44: f94197ea     	ldr	x10, [sp, #0x328]
 425be48: 9a954121     	csel	x1, x9, x21, mi
 425be4c: 9a884142     	csel	x2, x10, x8, mi
 425be50: 910b03e0     	add	x0, sp, #0x2c0
 425be54: 9709336b     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 425be58: 17fffd9d     	b	0x425b4cc <_ChromeMain+0x4256230>
 425be5c: 94f6a141     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
