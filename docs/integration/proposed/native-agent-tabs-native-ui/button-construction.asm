
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4684340: d10303ff     	sub	sp, sp, #0xc0
 4684344: a90767fa     	stp	x26, x25, [sp, #0x70]
 4684348: a9085ff8     	stp	x24, x23, [sp, #0x80]
 468434c: a90957f6     	stp	x22, x21, [sp, #0x90]
 4684350: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 4684354: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 4684358: 9102c3fd     	add	x29, sp, #0xb0
 468435c: aa0303f6     	mov	x22, x3
 4684360: aa0203f5     	mov	x21, x2
 4684364: aa0103f7     	mov	x23, x1
 4684368: aa0003f3     	mov	x19, x0
 468436c: d0050579     	adrp	x25, 0xe732000 <dyld_stub_binder+0xe732000>
 4684370: 913bc339     	add	x25, x25, #0xef0
 4684374: 9112a328     	add	x8, x25, #0x4a8
 4684378: a9002019     	stp	x25, x8, [x0]
 468437c: 91134328     	add	x8, x25, #0x4d0
 4684380: f9000808     	str	x8, [x0, #0x10]
 4684384: 91142328     	add	x8, x25, #0x508
 4684388: 9114e329     	add	x9, x25, #0x538
 468438c: a906a408     	stp	x8, x9, [x0, #0x68]
 4684390: 91162328     	add	x8, x25, #0x588
 4684394: f9005808     	str	x8, [x0, #0xb0]
 4684398: 9117a328     	add	x8, x25, #0x5e8
 468439c: aa0003f4     	mov	x20, x0
 46843a0: f80d8e88     	str	x8, [x20, #0xd8]!
 46843a4: 91186328     	add	x8, x25, #0x618
 46843a8: f9007c08     	str	x8, [x0, #0xf8]
 46843ac: 91190328     	add	x8, x25, #0x640
 46843b0: f9018808     	str	x8, [x0, #0x310]
 46843b4: 911b0328     	add	x8, x25, #0x6c0
 46843b8: f9018c08     	str	x8, [x0, #0x318]
 46843bc: 911e0328     	add	x8, x25, #0x780
 46843c0: f9019008     	str	x8, [x0, #0x320]
 46843c4: 911ee328     	add	x8, x25, #0x7b8
 46843c8: f9025808     	str	x8, [x0, #0x4b0]
 46843cc: 911f8328     	add	x8, x25, #0x7e0
 46843d0: f9026808     	str	x8, [x0, #0x4d0]
 46843d4: 91218328     	add	x8, x25, #0x860
 46843d8: f9026c08     	str	x8, [x0, #0x4d8]
 46843dc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46843e0: d0052978     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46843e4: f9404709     	ldr	x9, [x24, #0x88]
 46843e8: eb09011f     	cmp	x8, x9
 46843ec: 54000061     	b.ne	0x46843f8 <_ChromeMain+0x467f15c>
 46843f0: aa1303e0     	mov	x0, x19
 46843f4: 96e63fc2     	bl	0x142fc <_ChromeMain+0xf060>
 46843f8: 52800700     	mov	w0, #0x38               ; =56
 46843fc: 96e62bdb     	bl	0xf368 <_ChromeMain+0xa0cc>
 4684400: 52800028     	mov	w8, #0x1                ; =1
 4684404: b9000008     	str	w8, [x0]
 4684408: b0ffc748     	adrp	x8, 0x3f6d000 <_ChromeMain+0x3f67d64>
 468440c: 91050108     	add	x8, x8, #0x140
 4684410: 90fea209     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 4684414: 91180129     	add	x9, x9, #0x600
 4684418: a900a408     	stp	x8, x9, [x0, #0x8]
 468441c: b0fef6c8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4684420: 912c0108     	add	x8, x8, #0xb00
 4684424: 10003fa9     	adr	x9, 0x4684c18 <_ChromeMain+0x467f97c>
 4684428: d503201f     	nop
 468442c: a901a408     	stp	x8, x9, [x0, #0x18]
 4684430: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4684434: f90013e0     	str	x0, [sp, #0x20]
 4684438: 52800048     	mov	w8, #0x2                ; =2
 468443c: 3900a3e8     	strb	w8, [sp, #0x28]
 4684440: 910083e1     	add	x1, sp, #0x20
 4684444: aa1303e0     	mov	x0, x19
 4684448: 9733a80e     	bl	0x136e480 <_ChromeMain+0x13691e4>
 468444c: 3940a3e8     	ldrb	w8, [sp, #0x28]
 4684450: 7103fd1f     	cmp	w8, #0xff
 4684454: 54000060     	b.eq	0x4684460 <_ChromeMain+0x467f1c4>
 4684458: f94013e0     	ldr	x0, [sp, #0x20]
 468445c: b50011a0     	cbnz	x0, 0x4684690 <_ChromeMain+0x467f3f4>
 4684460: 52801fe8     	mov	w8, #0xff               ; =255
 4684464: 3900a3e8     	strb	w8, [sp, #0x28]
 4684468: b004e648     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 468446c: 91094108     	add	x8, x8, #0x250
 4684470: f9025a68     	str	x8, [x19, #0x4b0]
 4684474: 3912e27f     	strb	wzr, [x19, #0x4b8]
 4684478: 52800100     	mov	w0, #0x8                ; =8
 468447c: 96e62bbb     	bl	0xf368 <_ChromeMain+0xa0cc>
 4684480: b900001f     	str	wzr, [x0]
 4684484: 3900101f     	strb	wzr, [x0, #0x4]
 4684488: b40000c0     	cbz	x0, 0x46844a0 <_ChromeMain+0x467f204>
 468448c: 52800028     	mov	w8, #0x1                ; =1
 4684490: b8280008     	ldadd	w8, w8, [x0]
 4684494: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4684498: 6b09011f     	cmp	w8, w9
 468449c: 54003980     	b.eq	0x4684bcc <_ChromeMain+0x467f930>
 46844a0: 9112c268     	add	x8, x19, #0x4b0
 46844a4: f9026260     	str	x0, [x19, #0x4c0]
 46844a8: f9026668     	str	x8, [x19, #0x4c8]
 46844ac: 9113a268     	add	x8, x19, #0x4e8
 46844b0: 6f00e400     	movi.2d	v0, #0000000000000000
 46844b4: 3d800100     	str	q0, [x8]
 46844b8: f9027268     	str	x8, [x19, #0x4e0]
 46844bc: 9112a328     	add	x8, x25, #0x4a8
 46844c0: a9002279     	stp	x25, x8, [x19]
 46844c4: 91134328     	add	x8, x25, #0x4d0
 46844c8: f9000a68     	str	x8, [x19, #0x10]
 46844cc: 91142328     	add	x8, x25, #0x508
 46844d0: 9114e329     	add	x9, x25, #0x538
 46844d4: a906a668     	stp	x8, x9, [x19, #0x68]
 46844d8: 91162328     	add	x8, x25, #0x588
 46844dc: f9005a68     	str	x8, [x19, #0xb0]
 46844e0: 9117a328     	add	x8, x25, #0x5e8
 46844e4: f9006e68     	str	x8, [x19, #0xd8]
 46844e8: 91186328     	add	x8, x25, #0x618
 46844ec: f9007e68     	str	x8, [x19, #0xf8]
 46844f0: 91190328     	add	x8, x25, #0x640
 46844f4: f9018a68     	str	x8, [x19, #0x310]
 46844f8: 911b0328     	add	x8, x25, #0x6c0
 46844fc: f9018e68     	str	x8, [x19, #0x318]
 4684500: 911e0328     	add	x8, x25, #0x780
 4684504: f9019268     	str	x8, [x19, #0x320]
 4684508: 911ee328     	add	x8, x25, #0x7b8
 468450c: f9025a68     	str	x8, [x19, #0x4b0]
 4684510: 911f8328     	add	x8, x25, #0x7e0
 4684514: f9026a68     	str	x8, [x19, #0x4d0]
 4684518: 91218328     	add	x8, x25, #0x860
 468451c: f9026e68     	str	x8, [x19, #0x4d8]
 4684520: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 4684524: f9404709     	ldr	x9, [x24, #0x88]
 4684528: eb09011f     	cmp	x8, x9
 468452c: 54000061     	b.ne	0x4684538 <_ChromeMain+0x467f29c>
 4684530: aa1703e0     	mov	x0, x23
 4684534: 96e63f72     	bl	0x142fc <_ChromeMain+0xf060>
 4684538: f9027e77     	str	x23, [x19, #0x4f8]
 468453c: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4684540: f9404709     	ldr	x9, [x24, #0x88]
 4684544: eb09011f     	cmp	x8, x9
 4684548: 54000061     	b.ne	0x4684554 <_ChromeMain+0x467f2b8>
 468454c: aa1603e0     	mov	x0, x22
 4684550: 96e63f6b     	bl	0x142fc <_ChromeMain+0xf060>
 4684554: f9028276     	str	x22, [x19, #0x500]
 4684558: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 468455c: f9404709     	ldr	x9, [x24, #0x88]
 4684560: eb09011f     	cmp	x8, x9
 4684564: 54000061     	b.ne	0x4684570 <_ChromeMain+0x467f2d4>
 4684568: aa1503e0     	mov	x0, x21
 468456c: 96e63f64     	bl	0x142fc <_ChromeMain+0xf060>
 4684570: f9028675     	str	x21, [x19, #0x508]
 4684574: 3914e27f     	strb	wzr, [x19, #0x538]
 4684578: b905427f     	str	wzr, [x19, #0x540]
 468457c: f9028a7f     	str	xzr, [x19, #0x510]
 4684580: f902927f     	str	xzr, [x19, #0x520]
 4684584: f9028e7f     	str	xzr, [x19, #0x518]
 4684588: 3914a27f     	strb	wzr, [x19, #0x528]
 468458c: f902a67f     	str	xzr, [x19, #0x548]
 4684590: f902ae7f     	str	xzr, [x19, #0x558]
 4684594: f902aa7f     	str	xzr, [x19, #0x550]
 4684598: 52800100     	mov	w0, #0x8                ; =8
 468459c: 96e62b73     	bl	0xf368 <_ChromeMain+0xa0cc>
 46845a0: b900001f     	str	wzr, [x0]
 46845a4: 3900101f     	strb	wzr, [x0, #0x4]
 46845a8: b40000c0     	cbz	x0, 0x46845c0 <_ChromeMain+0x467f324>
 46845ac: 52800028     	mov	w8, #0x1                ; =1
 46845b0: b8280008     	ldadd	w8, w8, [x0]
 46845b4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 46845b8: 6b09011f     	cmp	w8, w9
 46845bc: 540030e0     	b.eq	0x4684bd8 <_ChromeMain+0x467f93c>
 46845c0: f902b260     	str	x0, [x19, #0x560]
 46845c4: f902b673     	str	x19, [x19, #0x568]
 46845c8: b0051c01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46845cc: 911a2021     	add	x1, x1, #0x688
 46845d0: b0052282     	adrp	x2, 0xead5000 <dyld_stub_binder+0xead5000>
 46845d4: 91218042     	add	x2, x2, #0x860
 46845d8: aa1403e0     	mov	x0, x20
 46845dc: 97564189     	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 46845e0: 9112c261     	add	x1, x19, #0x4b0
 46845e4: aa1303e0     	mov	x0, x19
 46845e8: 97541ab4     	bl	0x1b8b0b8 <_ChromeMain+0x1b85e1c>
 46845ec: 52800034     	mov	w20, #0x1               ; =1
 46845f0: aa1303e0     	mov	x0, x19
 46845f4: 52800021     	mov	w1, #0x1                ; =1
 46845f8: 973acc79     	bl	0x15377dc <_ChromeMain+0x1532540>
 46845fc: 52800400     	mov	w0, #0x20               ; =32
 4684600: 96e62b5a     	bl	0xf368 <_ChromeMain+0xa0cc>
 4684604: aa0003e1     	mov	x1, x0
 4684608: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 468460c: b9000808     	str	w8, [x0, #0x8]
 4684610: 39003014     	strb	w20, [x0, #0xc]
 4684614: 9004e648     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 4684618: 91044108     	add	x8, x8, #0x110
 468461c: f9000008     	str	x8, [x0]
 4684620: d2c000c8     	mov	x8, #0x600000000        ; =25769803776
 4684624: 4e080d00     	dup.2d	v0, x8
 4684628: 3d800400     	str	q0, [x0, #0x10]
 468462c: f9400268     	ldr	x8, [x19]
 4684630: f9408908     	ldr	x8, [x8, #0x110]
 4684634: aa1303e0     	mov	x0, x19
 4684638: d63f0100     	blr	x8
 468463c: 39072e74     	strb	w20, [x19, #0x1cb]
 4684640: f9400268     	ldr	x8, [x19]
 4684644: f9405108     	ldr	x8, [x8, #0xa0]
 4684648: aa1303e0     	mov	x0, x19
 468464c: 52800001     	mov	w1, #0x0                ; =0
 4684650: d63f0100     	blr	x8
 4684654: aa1303e9     	mov	x9, x19
 4684658: f84e8d28     	ldr	x8, [x9, #0xe8]!
 468465c: b4000408     	cbz	x8, 0x46846dc <_ChromeMain+0x467f440>
 4684660: 90051c0a     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 4684664: 9123414a     	add	x10, x10, #0x8d0
 4684668: f940110b     	ldr	x11, [x8, #0x20]
 468466c: eb0a017f     	cmp	x11, x10
 4684670: 540000a8     	b.hi	0x4684684 <_ChromeMain+0x467f3e8>
 4684674: 540002e2     	b.hs	0x46846d0 <_ChromeMain+0x467f434>
 4684678: f9400508     	ldr	x8, [x8, #0x8]
 468467c: b5ffff68     	cbnz	x8, 0x4684668 <_ChromeMain+0x467f3cc>
 4684680: 14000017     	b	0x46846dc <_ChromeMain+0x467f440>
 4684684: f9400108     	ldr	x8, [x8]
 4684688: b5ffff08     	cbnz	x8, 0x4684668 <_ChromeMain+0x467f3cc>
 468468c: 14000014     	b	0x46846dc <_ChromeMain+0x467f440>
 4684690: 12800008     	mov	w8, #-0x1               ; =-1
 4684694: b8e80008     	ldaddal	w8, w8, [x0]
 4684698: 7100051f     	cmp	w8, #0x1
 468469c: 54ffee21     	b.ne	0x4684460 <_ChromeMain+0x467f1c4>
 46846a0: f9400808     	ldr	x8, [x0, #0x10]
 46846a4: d63f0100     	blr	x8
 46846a8: 17ffff6e     	b	0x4684460 <_ChromeMain+0x467f1c4>
 46846ac: f9400008     	ldr	x8, [x0]
 46846b0: f9400508     	ldr	x8, [x8, #0x8]
 46846b4: d63f0100     	blr	x8
 46846b8: 1400000d     	b	0x46846ec <_ChromeMain+0x467f450>
 46846bc: b900f29f     	str	wzr, [x20, #0xf0]
 46846c0: aa1403e0     	mov	x0, x20
 46846c4: 52800021     	mov	w1, #0x1                ; =1
 46846c8: 974f82fa     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 46846cc: 14000016     	b	0x4684724 <_ChromeMain+0x467f488>
 46846d0: eb09011f     	cmp	x8, x9
 46846d4: 54002880     	b.eq	0x4684be4 <_ChromeMain+0x467f948>
 46846d8: f9401908     	ldr	x8, [x8, #0x30]
 46846dc: b900111f     	str	wzr, [x8, #0x10]
 46846e0: f9401d00     	ldr	x0, [x8, #0x38]
 46846e4: f9001d1f     	str	xzr, [x8, #0x38]
 46846e8: b5fffe20     	cbnz	x0, 0x46846ac <_ChromeMain+0x467f410>
 46846ec: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 46846f0: 910103e1     	add	x1, sp, #0x40
 46846f4: aa1303e0     	mov	x0, x19
 46846f8: 52800142     	mov	w2, #0xa                ; =10
 46846fc: 97aa9d17     	bl	0x312bb58 <_ChromeMain+0x31268bc>
 4684700: 52802800     	mov	w0, #0x140              ; =320
 4684704: 96e62b19     	bl	0xf368 <_ChromeMain+0xa0cc>
 4684708: aa0003f4     	mov	x20, x0
 468470c: 978e2fb1     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4684710: aa1303e0     	mov	x0, x19
 4684714: aa1403e1     	mov	x1, x20
 4684718: 97541448     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 468471c: b940f288     	ldr	w8, [x20, #0xf0]
 4684720: 35fffce8     	cbnz	w8, 0x46846bc <_ChromeMain+0x467f420>
 4684724: 52800035     	mov	w21, #0x1               ; =1
 4684728: b90043f5     	str	w21, [sp, #0x40]
 468472c: b0051c01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4684730: 9115a021     	add	x1, x1, #0x568
 4684734: 91046280     	add	x0, x20, #0x118
 4684738: 910103e2     	add	x2, sp, #0x40
 468473c: 974f829a     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 4684740: 3943d288     	ldrb	w8, [x20, #0xf4]
 4684744: 370000a8     	tbnz	w8, #0x0, 0x4684758 <_ChromeMain+0x467f4bc>
 4684748: 3903d295     	strb	w21, [x20, #0xf4]
 468474c: aa1403e0     	mov	x0, x20
 4684750: 52800021     	mov	w1, #0x1                ; =1
 4684754: 974f82d7     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4684758: 9004c5e8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 468475c: 3dc29d00     	ldr	q0, [x8, #0xa70]
 4684760: 3d8013e0     	str	q0, [sp, #0x40]
 4684764: b0051c01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4684768: 91122021     	add	x1, x1, #0x488
 468476c: 91046280     	add	x0, x20, #0x118
 4684770: 910103e2     	add	x2, sp, #0x40
 4684774: 9751a5bb     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4684778: d0054436     	adrp	x22, 0xef0a000 <dyld_stub_binder+0xef0a000>
 468477c: 911202d6     	add	x22, x22, #0x480
 4684780: f8bfc2c0     	ldapr	x0, [x22]
 4684784: b4002060     	cbz	x0, 0x4684b90 <_ChromeMain+0x467f8f4>
 4684788: 52807001     	mov	w1, #0x380              ; =896
 468478c: d2800002     	mov	x2, #0x0                ; =0
 4684790: 96e89b88     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4684794: aa0003f4     	mov	x20, x0
 4684798: 9776a2a8     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 468479c: d0050168     	adrp	x8, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 46847a0: 912f4108     	add	x8, x8, #0xbd0
 46847a4: 910fc109     	add	x9, x8, #0x3f0
 46847a8: a9002408     	stp	x8, x9, [x0]
 46847ac: 91106109     	add	x9, x8, #0x418
 46847b0: f9000809     	str	x9, [x0, #0x10]
 46847b4: 91114109     	add	x9, x8, #0x450
 46847b8: 9112010a     	add	x10, x8, #0x480
 46847bc: a906a809     	stp	x9, x10, [x0, #0x68]
 46847c0: 91134109     	add	x9, x8, #0x4d0
 46847c4: f9005809     	str	x9, [x0, #0xb0]
 46847c8: 9114c109     	add	x9, x8, #0x530
 46847cc: f9006c09     	str	x9, [x0, #0xd8]
 46847d0: 91158108     	add	x8, x8, #0x560
 46847d4: f9007c08     	str	x8, [x0, #0xf8]
 46847d8: f901a41f     	str	xzr, [x0, #0x348]
 46847dc: 2f06e400     	movi	d0, #0xffff000000000000
 46847e0: fd01a800     	str	d0, [x0, #0x350]
 46847e4: 52800028     	mov	w8, #0x1                ; =1
 46847e8: 390d6008     	strb	w8, [x0, #0x358]
 46847ec: f901b01f     	str	xzr, [x0, #0x360]
 46847f0: 390da01f     	strb	wzr, [x0, #0x368]
 46847f4: f901b81f     	str	xzr, [x0, #0x370]
 46847f8: b903781f     	str	wzr, [x0, #0x378]
 46847fc: 390df01f     	strb	wzr, [x0, #0x37c]
 4684800: 3945a408     	ldrb	w8, [x0, #0x169]
 4684804: 35001d88     	cbnz	w8, 0x4684bb4 <_ChromeMain+0x467f918>
 4684808: 91144275     	add	x21, x19, #0x510
 468480c: f940ce62     	ldr	x2, [x19, #0x198]
 4684810: aa1303e0     	mov	x0, x19
 4684814: aa1403e1     	mov	x1, x20
 4684818: 9703d2f9     	bl	0x7793fc <_ChromeMain+0x774160>
 468481c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4684820: f9404709     	ldr	x9, [x24, #0x88]
 4684824: eb09011f     	cmp	x8, x9
 4684828: 54000061     	b.ne	0x4684834 <_ChromeMain+0x467f598>
 468482c: aa1403e0     	mov	x0, x20
 4684830: 96e63eb3     	bl	0x142fc <_ChromeMain+0xf060>
 4684834: f94002a0     	ldr	x0, [x21]
 4684838: 925e7408     	and	x8, x0, #0xfffffffc00000000
 468483c: f9404709     	ldr	x9, [x24, #0x88]
 4684840: eb09011f     	cmp	x8, x9
 4684844: 54000041     	b.ne	0x468484c <_ChromeMain+0x467f5b0>
 4684848: 96e6787d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 468484c: f90002b4     	str	x20, [x21]
 4684850: aa1403e0     	mov	x0, x20
 4684854: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 4684858: 52800022     	mov	w2, #0x1                ; =1
 468485c: 97853481     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4684860: f8bfc2c0     	ldapr	x0, [x22]
 4684864: b40019a0     	cbz	x0, 0x4684b98 <_ChromeMain+0x467f8fc>
 4684868: 52808c01     	mov	w1, #0x460              ; =1120
 468486c: d2800002     	mov	x2, #0x0                ; =0
 4684870: 96e89b50     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4684874: aa0003f5     	mov	x21, x0
 4684878: b0048314     	adrp	x20, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 468487c: 910b8294     	add	x20, x20, #0x2e0
 4684880: aa1403e1     	mov	x1, x20
 4684884: 52800142     	mov	w2, #0xa                ; =10
 4684888: 528000a3     	mov	w3, #0x5                ; =5
 468488c: 52820004     	mov	w4, #0x1000             ; =4096
 4684890: 52800005     	mov	w5, #0x0                ; =0
 4684894: 97541813     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4684898: 3945a408     	ldrb	w8, [x0, #0x169]
 468489c: 35001928     	cbnz	w8, 0x4684bc0 <_ChromeMain+0x467f924>
 46848a0: f940ce62     	ldr	x2, [x19, #0x198]
 46848a4: aa1303e0     	mov	x0, x19
 46848a8: aa1503e1     	mov	x1, x21
 46848ac: 9703d2d4     	bl	0x7793fc <_ChromeMain+0x774160>
 46848b0: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 46848b4: f9404709     	ldr	x9, [x24, #0x88]
 46848b8: eb09011f     	cmp	x8, x9
 46848bc: 54000061     	b.ne	0x46848c8 <_ChromeMain+0x467f62c>
 46848c0: aa1503e0     	mov	x0, x21
 46848c4: 96e63e8e     	bl	0x142fc <_ChromeMain+0xf060>
 46848c8: f9428e60     	ldr	x0, [x19, #0x518]
 46848cc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46848d0: f9404709     	ldr	x9, [x24, #0x88]
 46848d4: eb09011f     	cmp	x8, x9
 46848d8: 54000041     	b.ne	0x46848e0 <_ChromeMain+0x467f644>
 46848dc: 96e67858     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46848e0: f9028e75     	str	x21, [x19, #0x518]
 46848e4: aa1503e0     	mov	x0, x21
 46848e8: 52801bc1     	mov	w1, #0xde               ; =222
 46848ec: 528001c2     	mov	w2, #0xe                ; =14
 46848f0: 52803e83     	mov	w3, #0x1f4              ; =500
 46848f4: 52800284     	mov	w4, #0x14               ; =20
 46848f8: 94000452     	bl	0x4685a40 <_ChromeMain+0x46807a4>
 46848fc: f8bfc2c0     	ldapr	x0, [x22]
 4684900: b4001500     	cbz	x0, 0x4684ba0 <_ChromeMain+0x467f904>
 4684904: 52808c01     	mov	w1, #0x460              ; =1120
 4684908: d2800002     	mov	x2, #0x0                ; =0
 468490c: 96e89b29     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4684910: aa0003f5     	mov	x21, x0
 4684914: d2800001     	mov	x1, #0x0                ; =0
 4684918: d2800002     	mov	x2, #0x0                ; =0
 468491c: 528000a3     	mov	w3, #0x5                ; =5
 4684920: 52820004     	mov	w4, #0x1000             ; =4096
 4684924: 52800005     	mov	w5, #0x0                ; =0
 4684928: 975417ee     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 468492c: 3945a408     	ldrb	w8, [x0, #0x169]
 4684930: 350013c8     	cbnz	w8, 0x4684ba8 <_ChromeMain+0x467f90c>
 4684934: f940ce62     	ldr	x2, [x19, #0x198]
 4684938: aa1303e0     	mov	x0, x19
 468493c: aa1503e1     	mov	x1, x21
 4684940: 9703d2af     	bl	0x7793fc <_ChromeMain+0x774160>
 4684944: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4684948: f9404709     	ldr	x9, [x24, #0x88]
 468494c: eb09011f     	cmp	x8, x9
 4684950: 54000061     	b.ne	0x468495c <_ChromeMain+0x467f6c0>
 4684954: aa1503e0     	mov	x0, x21
 4684958: 96e63e69     	bl	0x142fc <_ChromeMain+0xf060>
 468495c: f9429260     	ldr	x0, [x19, #0x520]
 4684960: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4684964: f9404709     	ldr	x9, [x24, #0x88]
 4684968: eb09011f     	cmp	x8, x9
 468496c: 54000041     	b.ne	0x4684974 <_ChromeMain+0x467f6d8>
 4684970: 96e67833     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4684974: f9029275     	str	x21, [x19, #0x520]
 4684978: aa1503e0     	mov	x0, x21
 468497c: 52801c41     	mov	w1, #0xe2               ; =226
 4684980: 52800182     	mov	w2, #0xc                ; =12
 4684984: 52803e83     	mov	w3, #0x1f4              ; =500
 4684988: 52800244     	mov	w4, #0x12               ; =18
 468498c: 9400042d     	bl	0x4685a40 <_ChromeMain+0x46807a4>
 4684990: f9429260     	ldr	x0, [x19, #0x520]
 4684994: 52800021     	mov	w1, #0x1                ; =1
 4684998: 975414da     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 468499c: f9429260     	ldr	x0, [x19, #0x520]
 46849a0: d28001c1     	mov	x1, #0xe                ; =14
 46849a4: f2c00241     	movk	x1, #0x12, lsl #32
 46849a8: 52800022     	mov	w2, #0x1                ; =1
 46849ac: 9785342d     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 46849b0: f9429268     	ldr	x8, [x19, #0x520]
 46849b4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 46849b8: b0051c01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46849bc: 91122021     	add	x1, x1, #0x488
 46849c0: 91036100     	add	x0, x8, #0xd8
 46849c4: 910103e2     	add	x2, sp, #0x40
 46849c8: 9751a526     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 46849cc: f9416660     	ldr	x0, [x19, #0x2c8]
 46849d0: b4000ce0     	cbz	x0, 0x4684b6c <_ChromeMain+0x467f8d0>
 46849d4: 52800148     	mov	w8, #0xa                ; =10
 46849d8: 39005fe8     	strb	w8, [sp, #0x17]
 46849dc: 910003e8     	mov	x8, sp
 46849e0: 91005109     	add	x9, x8, #0x14
 46849e4: eb14013f     	cmp	x9, x20
 46849e8: fa548102     	ccmp	x8, x20, #0x2, hi
 46849ec: 54000d09     	b.ls	0x4684b8c <_ChromeMain+0x467f8f0>
 46849f0: 52800c48     	mov	w8, #0x62               ; =98
 46849f4: 72a00e68     	movk	w8, #0x73, lsl #16
 46849f8: b90013e8     	str	w8, [sp, #0x10]
 46849fc: 3dc00280     	ldr	q0, [x20]
 4684a00: 3d8003e0     	str	q0, [sp]
 4684a04: 79002bff     	strh	wzr, [sp, #0x14]
 4684a08: 910003e1     	mov	x1, sp
 4684a0c: 972ba3b3     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 4684a10: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4684a14: 36f800a8     	tbz	w8, #0x1f, 0x4684a28 <_ChromeMain+0x467f78c>
 4684a18: f94003e0     	ldr	x0, [sp]
 4684a1c: f9400be8     	ldr	x8, [sp, #0x10]
 4684a20: d37ff901     	lsl	x1, x8, #1
 4684a24: 96e61125     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4684a28: 52800800     	mov	w0, #0x40               ; =64
 4684a2c: 96e62a4f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4684a30: f90023e0     	str	x0, [sp, #0x40]
 4684a34: f004c5a8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4684a38: 3dc0f500     	ldr	q0, [x8, #0x3d0]
 4684a3c: 3c8483e0     	stur	q0, [sp, #0x48]
 4684a40: 9100e009     	add	x9, x0, #0x38
 4684a44: eb00013f     	cmp	x9, x0
 4684a48: 54000a23     	b.lo	0x4684b8c <_ChromeMain+0x467f8f0>
 4684a4c: b0048308     	adrp	x8, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4684a50: 910bd908     	add	x8, x8, #0x2f6
 4684a54: eb08013f     	cmp	x9, x8
 4684a58: fa488002     	ccmp	x0, x8, #0x2, hi
 4684a5c: 54000989     	b.ls	0x4684b8c <_ChromeMain+0x467f8f0>
 4684a60: ad400500     	ldp	q0, q1, [x8]
 4684a64: ad000400     	stp	q0, q1, [x0]
 4684a68: 3dc00900     	ldr	q0, [x8, #0x20]
 4684a6c: 3d800800     	str	q0, [x0, #0x20]
 4684a70: f9401908     	ldr	x8, [x8, #0x30]
 4684a74: f9001808     	str	x8, [x0, #0x30]
 4684a78: 7900701f     	strh	wzr, [x0, #0x38]
 4684a7c: 910103e1     	add	x1, sp, #0x40
 4684a80: aa1303e0     	mov	x0, x19
 4684a84: 970707b0     	bl	0x846944 <_ChromeMain+0x8416a8>
 4684a88: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 4684a8c: 36f800a8     	tbz	w8, #0x1f, 0x4684aa0 <_ChromeMain+0x467f804>
 4684a90: f94023e0     	ldr	x0, [sp, #0x40]
 4684a94: f9402be8     	ldr	x8, [sp, #0x50]
 4684a98: d37ff901     	lsl	x1, x8, #1
 4684a9c: 96e61107     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4684aa0: f9428a74     	ldr	x20, [x19, #0x510]
 4684aa4: 52801bd5     	mov	w21, #0xde              ; =222
 4684aa8: b9003bf5     	str	w21, [sp, #0x38]
 4684aac: 3900f3ff     	strb	wzr, [sp, #0x3c]
 4684ab0: b0051a80     	adrp	x0, 0xe9d5000 <dyld_stub_binder+0xe9d5000>
 4684ab4: 91212000     	add	x0, x0, #0x848
 4684ab8: 910103e8     	add	x8, sp, #0x40
 4684abc: 9100e3e1     	add	x1, sp, #0x38
 4684ac0: 52800202     	mov	w2, #0x10               ; =16
 4684ac4: d2800003     	mov	x3, #0x0                ; =0
 4684ac8: 971dbf96     	bl	0xdf4920 <_ChromeMain+0xdef684>
 4684acc: 910103e1     	add	x1, sp, #0x40
 4684ad0: aa1403e0     	mov	x0, x20
 4684ad4: 96fc7173     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4684ad8: 910103e0     	add	x0, sp, #0x40
 4684adc: 97070759     	bl	0x846840 <_ChromeMain+0x8415a4>
 4684ae0: f9428e60     	ldr	x0, [x19, #0x518]
 4684ae4: b90043f5     	str	w21, [sp, #0x40]
 4684ae8: 390113ff     	strb	wzr, [sp, #0x44]
 4684aec: f9400008     	ldr	x8, [x0]
 4684af0: f941f508     	ldr	x8, [x8, #0x3e8]
 4684af4: 910103e1     	add	x1, sp, #0x40
 4684af8: d63f0100     	blr	x8
 4684afc: f9429260     	ldr	x0, [x19, #0x520]
 4684b00: 52801c48     	mov	w8, #0xe2               ; =226
 4684b04: b90033e8     	str	w8, [sp, #0x30]
 4684b08: 3900d3ff     	strb	wzr, [sp, #0x34]
 4684b0c: f9400008     	ldr	x8, [x0]
 4684b10: f941f508     	ldr	x8, [x8, #0x3e8]
 4684b14: 9100c3e1     	add	x1, sp, #0x30
 4684b18: d63f0100     	blr	x8
 4684b1c: aa1303e0     	mov	x0, x19
 4684b20: 96fc7197     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4684b24: f9428674     	ldr	x20, [x19, #0x508]
 4684b28: b40000f4     	cbz	x20, 0x4684b44 <_ChromeMain+0x467f8a8>
 4684b2c: 91008280     	add	x0, x20, #0x20
 4684b30: 91136261     	add	x1, x19, #0x4d8
 4684b34: 974fa0b7     	bl	0x1a6ce10 <_ChromeMain+0x1a67b74>
 4684b38: 91136260     	add	x0, x19, #0x4d8
 4684b3c: aa1403e1     	mov	x1, x20
 4684b40: 974fa104     	bl	0x1a6cf50 <_ChromeMain+0x1a67cb4>
 4684b44: aa1303e0     	mov	x0, x19
 4684b48: 9400041f     	bl	0x4685bc4 <_ChromeMain+0x4680928>
 4684b4c: aa1303e0     	mov	x0, x19
 4684b50: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 4684b54: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 4684b58: a94957f6     	ldp	x22, x21, [sp, #0x90]
 4684b5c: a9485ff8     	ldp	x24, x23, [sp, #0x80]
 4684b60: a94767fa     	ldp	x26, x25, [sp, #0x70]
 4684b64: 910303ff     	add	sp, sp, #0xc0
 4684b68: d65f03c0     	ret
 4684b6c: 97218565     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4684b70: 350003e0     	cbnz	w0, 0x4684bec <_ChromeMain+0x467f950>
 4684b74: aa1303e0     	mov	x0, x19
 4684b78: 973166b7     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4684b7c: f9416668     	ldr	x8, [x19, #0x2c8]
 4684b80: f9016660     	str	x0, [x19, #0x2c8]
 4684b84: b4fff288     	cbz	x8, 0x46849d4 <_ChromeMain+0x467f738>
 4684b88: 1400001e     	b	0x4684c00 <_ChromeMain+0x467f964>
 4684b8c: d4200020     	brk	#0x1
 4684b90: 97f13ada     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4684b94: 17fffefd     	b	0x4684788 <_ChromeMain+0x467f4ec>
 4684b98: 97f13ad8     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4684b9c: 17ffff33     	b	0x4684868 <_ChromeMain+0x467f5cc>
 4684ba0: 97f13ad6     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4684ba4: 17ffff58     	b	0x4684904 <_ChromeMain+0x467f668>
 4684ba8: d4200000     	brk	#0
 4684bac: d4400000     	hlt	#0
 4684bb0: 17fffff7     	b	0x4684b8c <_ChromeMain+0x467f8f0>
 4684bb4: d4200000     	brk	#0
 4684bb8: d4400000     	hlt	#0
 4684bbc: d4200020     	brk	#0x1
 4684bc0: d4200000     	brk	#0
 4684bc4: d4400000     	hlt	#0
 4684bc8: d4200020     	brk	#0x1
 4684bcc: d4200000     	brk	#0
 4684bd0: d4400000     	hlt	#0
 4684bd4: d4200020     	brk	#0x1
 4684bd8: d4200000     	brk	#0
 4684bdc: d4400000     	hlt	#0
 4684be0: d4200020     	brk	#0x1
 4684be4: d2800008     	mov	x8, #0x0                ; =0
 4684be8: 17fffebd     	b	0x46846dc <_ChromeMain+0x467f440>
 4684bec: 52803600     	mov	w0, #0x1b0              ; =432
 4684bf0: 96e629de     	bl	0xf368 <_ChromeMain+0xa0cc>
 4684bf4: aa1303e1     	mov	x1, x19
 4684bf8: 972183e2     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4684bfc: 17ffffe0     	b	0x4684b7c <_ChromeMain+0x467f8e0>
 4684c00: f9400109     	ldr	x9, [x8]
 4684c04: f9400529     	ldr	x9, [x9, #0x8]
 4684c08: aa0803e0     	mov	x0, x8
 4684c0c: d63f0120     	blr	x9
 4684c10: f9416660     	ldr	x0, [x19, #0x2c8]
 4684c14: 17ffff70     	b	0x46849d4 <_ChromeMain+0x467f738>
