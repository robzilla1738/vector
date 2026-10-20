
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463a19c: 37ffff88     	tbnz	w8, #0x1f, 0x463a18c <_ChromeMain+0x4634ef0>
 463a1a0: 3dc05fe0     	ldr	q0, [sp, #0x170]
 463a1a4: 3d800fe0     	str	q0, [sp, #0x30]
 463a1a8: f940c3e8     	ldr	x8, [sp, #0x180]
 463a1ac: f90023e8     	str	x8, [sp, #0x40]
 463a1b0: 39411fe8     	ldrb	w8, [sp, #0x47]
 463a1b4: f9401fe9     	ldr	x9, [sp, #0x38]
 463a1b8: 7219011f     	tst	w8, #0x80
 463a1bc: 9a881128     	csel	x8, x9, x8, ne
 463a1c0: b4000408     	cbz	x8, 0x463a240 <_ChromeMain+0x4634fa4>
 463a1c4: f9423668     	ldr	x8, [x19, #0x468]
 463a1c8: b40003c8     	cbz	x8, 0x463a240 <_ChromeMain+0x4634fa4>
 463a1cc: 9100c3e1     	add	x1, sp, #0x30
 463a1d0: aa1303e0     	mov	x0, x19
 463a1d4: d2800002     	mov	x2, #0x0                ; =0
 463a1d8: 52800023     	mov	w3, #0x1                ; =1
 463a1dc: 97fff8fc     	bl	0x46385cc <_ChromeMain+0x4633330>
 463a1e0: d360fc08     	lsr	x8, x0, #32
 463a1e4: b50006e8     	cbnz	x8, 0x463a2c0 <_ChromeMain+0x4635024>
 463a1e8: 9108e3f5     	add	x21, sp, #0x238
 463a1ec: 9108e3e8     	add	x8, sp, #0x238
 463a1f0: 9100c3e1     	add	x1, sp, #0x30
 463a1f4: aa1303e0     	mov	x0, x19
 463a1f8: 97fff523     	bl	0x4637684 <_ChromeMain+0x46323e8>
 463a1fc: f9422e68     	ldr	x8, [x19, #0x458]
 463a200: b40000a8     	cbz	x8, 0x463a214 <_ChromeMain+0x4634f78>
 463a204: f9429d14     	ldr	x20, [x8, #0x538]
 463a208: b4000074     	cbz	x20, 0x463a214 <_ChromeMain+0x4634f78>
 463a20c: 39624268     	ldrb	w8, [x19, #0x890]
 463a210: 37005548     	tbnz	w8, #0x0, 0x463acb8 <_ChromeMain+0x4635a1c>
 463a214: 9101c2a0     	add	x0, x21, #0x70
 463a218: d2800001     	mov	x1, #0x0                ; =0
 463a21c: 96e7b6a7     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 463a220: 910082a0     	add	x0, x21, #0x20
 463a224: 96e7b695     	bl	0x27c78 <_ChromeMain+0x229dc>
 463a228: 39c93fe8     	ldrsb	w8, [sp, #0x24f]
 463a22c: 36f800a8     	tbz	w8, #0x1f, 0x463a240 <_ChromeMain+0x4634fa4>
 463a230: f9411fe0     	ldr	x0, [sp, #0x238]
 463a234: f94127e8     	ldr	x8, [sp, #0x248]
 463a238: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463a23c: 96e73b1f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463a240: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 463a244: 36ffbaa8     	tbz	w8, #0x1f, 0x4639998 <_ChromeMain+0x46346fc>
 463a248: f9401be0     	ldr	x0, [sp, #0x30]
 463a24c: f94023e8     	ldr	x8, [sp, #0x40]
 463a250: 17fffdd0     	b	0x4639990 <_ChromeMain+0x46346f4>
 463a254: aa0803e1     	mov	x1, x8
 463a258: 8b091508     	add	x8, x8, x9, lsl #5
 463a25c: aa0103e2     	mov	x2, x1
 463a260: eb08003f     	cmp	x1, x8
 463a264: 540000e0     	b.eq	0x463a280 <_ChromeMain+0x4634fe4>
 463a268: b942b3e8     	ldr	w8, [sp, #0x2b0]
 463a26c: b9400029     	ldr	w9, [x1]
 463a270: 6b09011f     	cmp	w8, w9
 463a274: 52800408     	mov	w8, #0x20               ; =32
 463a278: 9a88b3e8     	csel	x8, xzr, x8, lt
 463a27c: 8b080022     	add	x2, x1, x8
 463a280: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 463a284: 94011f74     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 463a288: f9423674     	ldr	x20, [x19, #0x468]
 463a28c: f0052ba8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 463a290: f9468d08     	ldr	x8, [x8, #0xd18]
 463a294: d63f0100     	blr	x8
 463a298: aa0003e3     	mov	x3, x0
 463a29c: aa1403e0     	mov	x0, x20
 463a2a0: f94017e1     	ldr	x1, [sp, #0x28]
 463a2a4: 528000c2     	mov	w2, #0x6                ; =6
 463a2a8: 94dc5610     	bl	0x7d4fae8 <_ChromeMain+0x7d4a84c>
 463a2ac: aa1303e0     	mov	x0, x19
 463a2b0: 97ffc7b6     	bl	0x462c188 <_ChromeMain+0x4626eec>
 463a2b4: aa1303e0     	mov	x0, x19
 463a2b8: 97fff9a6     	bl	0x4638950 <_ChromeMain+0x46336b4>
 463a2bc: 17ffffe1     	b	0x463a240 <_ChromeMain+0x4634fa4>
 463a2c0: f9423668     	ldr	x8, [x19, #0x468]
 463a2c4: f9400108     	ldr	x8, [x8]
 463a2c8: f90017e0     	str	x0, [sp, #0x28]
 463a2cc: 93407c01     	sxtw	x1, w0
 463a2d0: aa0803e0     	mov	x0, x8
 463a2d4: 97289009     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 463a2d8: b4fffd80     	cbz	x0, 0x463a288 <_ChromeMain+0x4634fec>
 463a2dc: b9401008     	ldr	w8, [x0, #0x10]
 463a2e0: b902b3e8     	str	w8, [sp, #0x2b0]
 463a2e4: 52821208     	mov	w8, #0x1090             ; =4240
 463a2e8: 8b080260     	add	x0, x19, x8
 463a2ec: 910ac3e1     	add	x1, sp, #0x2b0
 463a2f0: 910ac3e2     	add	x2, sp, #0x2b0
 463a2f4: 9499328b     	bl	0x6c86d20 <_ChromeMain+0x6c81a84>
 463a2f8: f947e668     	ldr	x8, [x19, #0xfc8]
 463a2fc: f947ea69     	ldr	x9, [x19, #0xfd0]
 463a300: d37be92a     	lsl	x10, x9, #5
 463a304: b40001ca     	cbz	x10, 0x463a33c <_ChromeMain+0x46350a0>
 463a308: 9345fd4b     	asr	x11, x10, #5
 463a30c: b942b3ea     	ldr	w10, [sp, #0x2b0]
 463a310: aa0803e1     	mov	x1, x8
 463a314: d341fd6c     	lsr	x12, x11, #1
 463a318: 8b0c142d     	add	x13, x1, x12, lsl #5
 463a31c: b84205ae     	ldr	w14, [x13], #0x20
 463a320: aa6b07ef     	mvn	x15, x11, lsr #1
 463a324: 8b0f016b     	add	x11, x11, x15
 463a328: 6b0a01df     	cmp	w14, w10
 463a32c: 9a8cb16b     	csel	x11, x11, x12, lt
 463a330: 9a81b1a1     	csel	x1, x13, x1, lt
 463a334: b5ffff0b     	cbnz	x11, 0x463a314 <_ChromeMain+0x4635078>
 463a338: 14000002     	b	0x463a340 <_ChromeMain+0x46350a4>
 463a33c: aa0803e1     	mov	x1, x8
 463a340: 8b091508     	add	x8, x8, x9, lsl #5
 463a344: aa0103e2     	mov	x2, x1
 463a348: eb08003f     	cmp	x1, x8
 463a34c: 540000e0     	b.eq	0x463a368 <_ChromeMain+0x46350cc>
 463a350: b942b3e8     	ldr	w8, [sp, #0x2b0]
 463a354: b9400029     	ldr	w9, [x1]
 463a358: 6b09011f     	cmp	w8, w9
 463a35c: 52800408     	mov	w8, #0x20               ; =32
 463a360: 9a88b3e8     	csel	x8, xzr, x8, lt
 463a364: 8b080022     	add	x2, x1, x8
 463a368: 913f2260     	add	x0, x19, #0xfc8
 463a36c: 94011f3a     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 463a370: f9485668     	ldr	x8, [x19, #0x10a8]
 463a374: f9485a6a     	ldr	x10, [x19, #0x10b0]
 463a378: d37ced4b     	lsl	x11, x10, #4
 463a37c: aa0803e9     	mov	x9, x8
 463a380: b40001ab     	cbz	x11, 0x463a3b4 <_ChromeMain+0x4635118>
 463a384: 9344fd6d     	asr	x13, x11, #4
 463a388: b942b3ec     	ldr	w12, [sp, #0x2b0]
 463a38c: aa0803e9     	mov	x9, x8
 463a390: d341fdae     	lsr	x14, x13, #1
 463a394: 8b0e112f     	add	x15, x9, x14, lsl #4
 463a398: b84105f0     	ldr	w16, [x15], #0x10
 463a39c: aa6d07f1     	mvn	x17, x13, lsr #1
 463a3a0: 8b1101ad     	add	x13, x13, x17
 463a3a4: 6b0c021f     	cmp	w16, w12
 463a3a8: 9a8eb1ad     	csel	x13, x13, x14, lt
 463a3ac: 9a89b1e9     	csel	x9, x15, x9, lt
 463a3b0: b5ffff0d     	cbnz	x13, 0x463a390 <_ChromeMain+0x46350f4>
 463a3b4: 8b0a110c     	add	x12, x8, x10, lsl #4
 463a3b8: aa0903ee     	mov	x14, x9
 463a3bc: eb0c013f     	cmp	x9, x12
 463a3c0: 540000c0     	b.eq	0x463a3d8 <_ChromeMain+0x463513c>
 463a3c4: b942b3ec     	ldr	w12, [sp, #0x2b0]
 463a3c8: b940012d     	ldr	w13, [x9]
 463a3cc: 6b0d019f     	cmp	w12, w13
 463a3d0: 9100412c     	add	x12, x9, #0x10
 463a3d4: 9a8cb12e     	csel	x14, x9, x12, lt
 463a3d8: eb0e013f     	cmp	x9, x14
 463a3dc: 540003c8     	b.hi	0x463a454 <_ChromeMain+0x46351b8>
 463a3e0: 54000420     	b.eq	0x463a464 <_ChromeMain+0x46351c8>
 463a3e4: cb0801cc     	sub	x12, x14, x8
 463a3e8: eb0b019f     	cmp	x12, x11
 463a3ec: 540002a0     	b.eq	0x463a440 <_ChromeMain+0x46351a4>
 463a3f0: cb0803ec     	neg	x12, x8
 463a3f4: 8b0e010d     	add	x13, x8, x14
 463a3f8: 8b09010a     	add	x10, x8, x9
 463a3fc: 8b0b012b     	add	x11, x9, x11
 463a400: cb0e016b     	sub	x11, x11, x14
 463a404: cb090169     	sub	x9, x11, x9
 463a408: 8b0c01ab     	add	x11, x13, x12
 463a40c: 8b0c014e     	add	x14, x10, x12
 463a410: b940016f     	ldr	w15, [x11]
 463a414: b90001cf     	str	w15, [x14]
 463a418: f940056b     	ldr	x11, [x11, #0x8]
 463a41c: f90005cb     	str	x11, [x14, #0x8]
 463a420: 910041ad     	add	x13, x13, #0x10
 463a424: 9100414a     	add	x10, x10, #0x10
 463a428: d1004129     	sub	x9, x9, #0x10
 463a42c: eb09019f     	cmp	x12, x9
 463a430: 54fffec1     	b.ne	0x463a408 <_ChromeMain+0x463516c>
 463a434: cb080149     	sub	x9, x10, x8
 463a438: f9485668     	ldr	x8, [x19, #0x10a8]
 463a43c: f9485a6a     	ldr	x10, [x19, #0x10b0]
 463a440: 8b0a110a     	add	x10, x8, x10, lsl #4
 463a444: eb09015f     	cmp	x10, x9
 463a448: 54000080     	b.eq	0x463a458 <_ChromeMain+0x46351bc>
 463a44c: f100414a     	subs	x10, x10, #0x10
 463a450: 54ffffa1     	b.ne	0x463a444 <_ChromeMain+0x46351a8>
 463a454: d4200020     	brk	#0x1
 463a458: cb080128     	sub	x8, x9, x8
 463a45c: 9344fd08     	asr	x8, x8, #4
 463a460: f9085a68     	str	x8, [x19, #0x10b0]
 463a464: f9480268     	ldr	x8, [x19, #0x1000]
