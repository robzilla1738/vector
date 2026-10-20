
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4129628: 394da408     	ldrb	w8, [x0, #0x369]
 412962c: 6b01011f     	cmp	w8, w1
 4129630: 54000041     	b.ne	0x4129638 <_ChromeMain+0x412439c>
 4129634: d65f03c0     	ret
 4129638: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 412963c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4129640: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4129644: 910083fd     	add	x29, sp, #0x20
 4129648: aa0003f3     	mov	x19, x0
 412964c: 390da401     	strb	w1, [x0, #0x369]
 4129650: f9419814     	ldr	x20, [x0, #0x330]
 4129654: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4129658: b0055456     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 412965c: f94046c9     	ldr	x9, [x22, #0x88]
 4129660: eb09011f     	cmp	x8, x9
 4129664: 54000061     	b.ne	0x4129670 <_ChromeMain+0x41243d4>
 4129668: aa1403e0     	mov	x0, x20
 412966c: 96fbab24     	bl	0x142fc <_ChromeMain+0xf060>
 4129670: f941ae75     	ldr	x21, [x19, #0x358]
 4129674: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4129678: f94046c9     	ldr	x9, [x22, #0x88]
 412967c: eb09011f     	cmp	x8, x9
 4129680: 54000201     	b.ne	0x41296c0 <_ChromeMain+0x4124424>
 4129684: aa1503e0     	mov	x0, x21
 4129688: 96fbab1d     	bl	0x142fc <_ChromeMain+0xf060>
 412968c: b40001d4     	cbz	x20, 0x41296c4 <_ChromeMain+0x4124428>
 4129690: 394da668     	ldrb	w8, [x19, #0x369]
 4129694: 350003e8     	cbnz	w8, 0x4129710 <_ChromeMain+0x4124474>
 4129698: f9400288     	ldr	x8, [x20]
 412969c: f9405108     	ldr	x8, [x8, #0xa0]
 41296a0: aa1403e0     	mov	x0, x20
 41296a4: 52800021     	mov	w1, #0x1                ; =1
 41296a8: d63f0100     	blr	x8
 41296ac: aa1303e0     	mov	x0, x19
 41296b0: aa1403e1     	mov	x1, x20
 41296b4: 94de05e2     	bl	0x78aae3c <_ChromeMain+0x78a5ba0>
 41296b8: b4000095     	cbz	x21, 0x41296c8 <_ChromeMain+0x412442c>
 41296bc: 14000021     	b	0x4129740 <_ChromeMain+0x41244a4>
 41296c0: b5fffe94     	cbnz	x20, 0x4129690 <_ChromeMain+0x41243f4>
 41296c4: b50003f5     	cbnz	x21, 0x4129740 <_ChromeMain+0x41244a4>
 41296c8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 41296cc: f94046c9     	ldr	x9, [x22, #0x88]
 41296d0: eb09011f     	cmp	x8, x9
 41296d4: 54000061     	b.ne	0x41296e0 <_ChromeMain+0x4124444>
 41296d8: aa1503e0     	mov	x0, x21
 41296dc: 96fbe4d8     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41296e0: 925e7688     	and	x8, x20, #0xfffffffc00000000
 41296e4: f94046c9     	ldr	x9, [x22, #0x88]
 41296e8: eb09011f     	cmp	x8, x9
 41296ec: 54000061     	b.ne	0x41296f8 <_ChromeMain+0x412445c>
 41296f0: aa1403e0     	mov	x0, x20
 41296f4: 96fbe4d2     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41296f8: aa1303e0     	mov	x0, x19
 41296fc: 52800001     	mov	w1, #0x0                ; =0
 4129700: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4129704: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4129708: a8c357f6     	ldp	x22, x21, [sp], #0x30
 412970c: 17141b5a     	b	0x630474 <_ChromeMain+0x62b1d8>
 4129710: aa1403e0     	mov	x0, x20
 4129714: 52800001     	mov	w1, #0x0                ; =0
 4129718: 9595f277     	bl	0xa6a60f4 <_ChromeMain+0xa6a0e58>
 412971c: aa1403e0     	mov	x0, x20
 4129720: 52800001     	mov	w1, #0x0                ; =0
 4129724: 9595f248     	bl	0xa6a6044 <_ChromeMain+0xa6a0da8>
 4129728: f9400288     	ldr	x8, [x20]
 412972c: f9405108     	ldr	x8, [x8, #0xa0]
 4129730: aa1403e0     	mov	x0, x20
 4129734: 52800001     	mov	w1, #0x0                ; =0
 4129738: d63f0100     	blr	x8
 412973c: b4fffc75     	cbz	x21, 0x41296c8 <_ChromeMain+0x412442c>
 4129740: 394da668     	ldrb	w8, [x19, #0x369]
 4129744: 37000148     	tbnz	w8, #0x0, 0x412976c <_ChromeMain+0x41244d0>
 4129748: f94002a8     	ldr	x8, [x21]
 412974c: f9405108     	ldr	x8, [x8, #0xa0]
 4129750: aa1503e0     	mov	x0, x21
 4129754: 52800021     	mov	w1, #0x1                ; =1
 4129758: d63f0100     	blr	x8
 412975c: aa1303e0     	mov	x0, x19
 4129760: aa1503e1     	mov	x1, x21
 4129764: 94de05b6     	bl	0x78aae3c <_ChromeMain+0x78a5ba0>
 4129768: 17ffffd8     	b	0x41296c8 <_ChromeMain+0x412442c>
 412976c: aa1503e0     	mov	x0, x21
 4129770: 52800001     	mov	w1, #0x0                ; =0
 4129774: 9595f260     	bl	0xa6a60f4 <_ChromeMain+0xa6a0e58>
 4129778: aa1503e0     	mov	x0, x21
 412977c: 52800001     	mov	w1, #0x0                ; =0
 4129780: 9595f231     	bl	0xa6a6044 <_ChromeMain+0xa6a0da8>
 4129784: f94002a8     	ldr	x8, [x21]
 4129788: f9405108     	ldr	x8, [x8, #0xa0]
 412978c: aa1503e0     	mov	x0, x21
 4129790: 52800001     	mov	w1, #0x0                ; =0
 4129794: d63f0100     	blr	x8
 4129798: 17ffffcc     	b	0x41296c8 <_ChromeMain+0x412442c>
 412979c: 00000000     	udf	#0x0
 41297a0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 41297a4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 41297a8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 41297ac: 910083fd     	add	x29, sp, #0x20
 41297b0: aa0203f4     	mov	x20, x2
 41297b4: aa0103f5     	mov	x21, x1
 41297b8: aa0003f3     	mov	x19, x0
 41297bc: 925e7428     	and	x8, x1, #0xfffffffc00000000
 41297c0: b0055456     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41297c4: f94046c9     	ldr	x9, [x22, #0x88]
 41297c8: eb09011f     	cmp	x8, x9
 41297cc: 54000061     	b.ne	0x41297d8 <_ChromeMain+0x412453c>
 41297d0: aa1503e0     	mov	x0, x21
 41297d4: 96fbaaca     	bl	0x142fc <_ChromeMain+0xf060>
 41297d8: f941a260     	ldr	x0, [x19, #0x340]
 41297dc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41297e0: f94046c9     	ldr	x9, [x22, #0x88]
 41297e4: eb09011f     	cmp	x8, x9
 41297e8: 54000041     	b.ne	0x41297f0 <_ChromeMain+0x4124554>
 41297ec: 96fbe494     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41297f0: f901a275     	str	x21, [x19, #0x340]
 41297f4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 41297f8: f94046c9     	ldr	x9, [x22, #0x88]
 41297fc: eb09011f     	cmp	x8, x9
 4129800: 54000061     	b.ne	0x412980c <_ChromeMain+0x4124570>
 4129804: aa1403e0     	mov	x0, x20
 4129808: 96fbaabd     	bl	0x142fc <_ChromeMain+0xf060>
 412980c: f941a660     	ldr	x0, [x19, #0x348]
 4129810: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4129814: f94046c9     	ldr	x9, [x22, #0x88]
 4129818: eb09011f     	cmp	x8, x9
 412981c: 54000041     	b.ne	0x4129824 <_ChromeMain+0x4124588>
 4129820: 96fbe487     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4129824: f901a674     	str	x20, [x19, #0x348]
 4129828: f9419e61     	ldr	x1, [x19, #0x338]
 412982c: b40002c1     	cbz	x1, 0x4129884 <_ChromeMain+0x41245e8>
 4129830: 394da668     	ldrb	w8, [x19, #0x369]
 4129834: 34000288     	cbz	w8, 0x4129884 <_ChromeMain+0x41245e8>
 4129838: f941a260     	ldr	x0, [x19, #0x340]
 412983c: f100001f     	cmp	x0, #0x0
 4129840: 9a800274     	csel	x20, x19, x0, eq
 4129844: f940c428     	ldr	x8, [x1, #0x188]
 4129848: eb14011f     	cmp	x8, x20
 412984c: 540000a0     	b.eq	0x4129860 <_ChromeMain+0x41245c4>
 4129850: f940ce82     	ldr	x2, [x20, #0x198]
 4129854: aa1403e0     	mov	x0, x20
 4129858: 97193ee9     	bl	0x7793fc <_ChromeMain+0x774160>
 412985c: f941a260     	ldr	x0, [x19, #0x340]
 4129860: b40000c0     	cbz	x0, 0x4129878 <_ChromeMain+0x41245dc>
 4129864: f9419e61     	ldr	x1, [x19, #0x338]
 4129868: b4000081     	cbz	x1, 0x4129878 <_ChromeMain+0x41245dc>
 412986c: f940c428     	ldr	x8, [x1, #0x188]
 4129870: eb08001f     	cmp	x0, x8
 4129874: 54000140     	b.eq	0x412989c <_ChromeMain+0x4124600>
 4129878: aa1403e0     	mov	x0, x20
 412987c: 52800001     	mov	w1, #0x0                ; =0
 4129880: 97141afd     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4129884: aa1303e0     	mov	x0, x19
 4129888: 52800001     	mov	w1, #0x0                ; =0
 412988c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4129890: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4129894: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4129898: 17141af7     	b	0x630474 <_ChromeMain+0x62b1d8>
 412989c: f941a668     	ldr	x8, [x19, #0x348]
 41298a0: b4fffec8     	cbz	x8, 0x4129878 <_ChromeMain+0x41245dc>
 41298a4: f940c509     	ldr	x9, [x8, #0x188]
 41298a8: eb09001f     	cmp	x0, x9
 41298ac: 54fffe61     	b.ne	0x4129878 <_ChromeMain+0x41245dc>
