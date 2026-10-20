
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  8e2310: d10183ff     	sub	sp, sp, #0x60
  8e2314: a90167fa     	stp	x26, x25, [sp, #0x10]
  8e2318: a9025ff8     	stp	x24, x23, [sp, #0x20]
  8e231c: a90357f6     	stp	x22, x21, [sp, #0x30]
  8e2320: a9044ff4     	stp	x20, x19, [sp, #0x40]
  8e2324: a9057bfd     	stp	x29, x30, [sp, #0x50]
  8e2328: 910143fd     	add	x29, sp, #0x50
  8e232c: a9007d1f     	stp	xzr, xzr, [x8]
  8e2330: f900091f     	str	xzr, [x8, #0x10]
  8e2334: b7f820a1     	tbnz	x1, #0x3f, 0x8e2748 <_ChromeMain+0x8dd4ac>
  8e2338: aa0103f4     	mov	x20, x1
  8e233c: aa0003f5     	mov	x21, x0
  8e2340: aa0803f3     	mov	x19, x8
  8e2344: b5000040     	cbnz	x0, 0x8e234c <_ChromeMain+0x8dd0b0>
  8e2348: b5002014     	cbnz	x20, 0x8e2748 <_ChromeMain+0x8dd4ac>
  8e234c: f0073128     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
  8e2350: 3944c108     	ldrb	w8, [x8, #0x130]
  8e2354: 34001fe8     	cbz	w8, 0x8e2750 <_ChromeMain+0x8dd4b4>
  8e2358: b4000894     	cbz	x20, 0x8e2468 <_ChromeMain+0x8dd1cc>
  8e235c: 8b1402b6     	add	x22, x21, x20
  8e2360: aa1503e8     	mov	x8, x21
  8e2364: f2400abf     	tst	x21, #0x7
  8e2368: 540001e0     	b.eq	0x8e23a4 <_ChromeMain+0x8dd108>
  8e236c: eb1502df     	cmp	x22, x21
  8e2370: 540001a9     	b.ls	0x8e23a4 <_ChromeMain+0x8dd108>
  8e2374: d2800009     	mov	x9, #0x0                ; =0
  8e2378: 910006aa     	add	x10, x21, #0x1
  8e237c: aa1503e8     	mov	x8, x21
  8e2380: 3880150b     	ldrsb	x11, [x8], #0x1
  8e2384: aa0b0129     	orr	x9, x9, x11
  8e2388: eb16011f     	cmp	x8, x22
  8e238c: 54000082     	b.hs	0x8e239c <_ChromeMain+0x8dd100>
  8e2390: 9240094b     	and	x11, x10, #0x7
  8e2394: 9100054a     	add	x10, x10, #0x1
  8e2398: b5ffff4b     	cbnz	x11, 0x8e2380 <_ChromeMain+0x8dd0e4>
  8e239c: f201c13f     	tst	x9, #0x8080808080808080
  8e23a0: 54000681     	b.ne	0x8e2470 <_ChromeMain+0x8dd1d4>
  8e23a4: cb0802c9     	sub	x9, x22, x8
  8e23a8: 14000003     	b	0x8e23b4 <_ChromeMain+0x8dd118>
  8e23ac: 91020108     	add	x8, x8, #0x80
  8e23b0: d1020129     	sub	x9, x9, #0x80
  8e23b4: f102013f     	cmp	x9, #0x80
  8e23b8: 540002a3     	b.lo	0x8e240c <_ChromeMain+0x8dd170>
  8e23bc: ad420500     	ldp	q0, q1, [x8, #0x40]
  8e23c0: ad400d02     	ldp	q2, q3, [x8]
  8e23c4: ad431504     	ldp	q4, q5, [x8, #0x60]
  8e23c8: ad411d06     	ldp	q6, q7, [x8, #0x20]
  8e23cc: 4ea51ce5     	orr.16b	v5, v7, v5
  8e23d0: 4ea11c61     	orr.16b	v1, v3, v1
  8e23d4: 4ea51c21     	orr.16b	v1, v1, v5
  8e23d8: 4ea41cc3     	orr.16b	v3, v6, v4
  8e23dc: 4ea01c40     	orr.16b	v0, v2, v0
  8e23e0: 4ea31c00     	orr.16b	v0, v0, v3
  8e23e4: 4ea11c00     	orr.16b	v0, v0, v1
  8e23e8: 5e180401     	mov	d1, v0[1]
  8e23ec: 0ea11c00     	orr.8b	v0, v0, v1
  8e23f0: 9e66000a     	fmov	x10, d0
  8e23f4: f201c15f     	tst	x10, #0x8080808080808080
  8e23f8: 54fffda0     	b.eq	0x8e23ac <_ChromeMain+0x8dd110>
  8e23fc: d1000508     	sub	x8, x8, #0x1
  8e2400: 38c01d09     	ldrsb	w9, [x8, #0x1]!
  8e2404: 36ffffe9     	tbz	w9, #0x1f, 0x8e2400 <_ChromeMain+0x8dd164>
  8e2408: 1400001d     	b	0x8e247c <_ChromeMain+0x8dd1e0>
  8e240c: f100213f     	cmp	x9, #0x8
  8e2410: 54001963     	b.lo	0x8e273c <_ChromeMain+0x8dd4a0>
  8e2414: d2800009     	mov	x9, #0x0                ; =0
  8e2418: 8b15028a     	add	x10, x20, x21
  8e241c: cb08014b     	sub	x11, x10, x8
  8e2420: aa0803ea     	mov	x10, x8
  8e2424: f840854c     	ldr	x12, [x10], #0x8
  8e2428: aa090189     	orr	x9, x12, x9
  8e242c: d100216b     	sub	x11, x11, #0x8
  8e2430: f1001d7f     	cmp	x11, #0x7
  8e2434: 54ffff88     	b.hi	0x8e2424 <_ChromeMain+0x8dd188>
  8e2438: eb16015f     	cmp	x10, x22
  8e243c: 540000e2     	b.hs	0x8e2458 <_ChromeMain+0x8dd1bc>
  8e2440: 8b15028b     	add	x11, x20, x21
  8e2444: cb0a016b     	sub	x11, x11, x10
  8e2448: 3880154c     	ldrsb	x12, [x10], #0x1
  8e244c: aa0c0129     	orr	x9, x9, x12
  8e2450: f100056b     	subs	x11, x11, #0x1
  8e2454: 54ffffa1     	b.ne	0x8e2448 <_ChromeMain+0x8dd1ac>
  8e2458: f201c13f     	tst	x9, #0x8080808080808080
  8e245c: 54000a01     	b.ne	0x8e259c <_ChromeMain+0x8dd300>
  8e2460: 91005e78     	add	x24, x19, #0x17
  8e2464: 1400000b     	b	0x8e2490 <_ChromeMain+0x8dd1f4>
  8e2468: 91005e78     	add	x24, x19, #0x17
  8e246c: 14000008     	b	0x8e248c <_ChromeMain+0x8dd1f0>
  8e2470: d10006a8     	sub	x8, x21, #0x1
  8e2474: 38c01d09     	ldrsb	w9, [x8, #0x1]!
  8e2478: 36ffffe9     	tbz	w9, #0x1f, 0x8e2474 <_ChromeMain+0x8dd1d8>
  8e247c: 91005e78     	add	x24, x19, #0x17
  8e2480: cb150119     	sub	x25, x8, x21
  8e2484: eb190296     	subs	x22, x20, x25
  8e2488: 54000b21     	b.ne	0x8e25ec <_ChromeMain+0x8dd350>
  8e248c: 8b1402b6     	add	x22, x21, x20
  8e2490: f1002e9f     	cmp	x20, #0xb
  8e2494: 54000082     	b.hs	0x8e24a4 <_ChromeMain+0x8dd208>
  8e2498: aa1303e0     	mov	x0, x19
  8e249c: b5000234     	cbnz	x20, 0x8e24e0 <_ChromeMain+0x8dd244>
  8e24a0: 1400002b     	b	0x8e254c <_ChromeMain+0x8dd2b0>
  8e24a4: 92800208     	mov	x8, #-0x11              ; =-17
  8e24a8: f2efffe8     	movk	x8, #0x7fff, lsl #48
  8e24ac: eb08029f     	cmp	x20, x8
  8e24b0: 540014e2     	b.hs	0x8e274c <_ChromeMain+0x8dd4b0>
  8e24b4: 52800288     	mov	w8, #0x14               ; =20
  8e24b8: f100529f     	cmp	x20, #0x14
  8e24bc: 9a888288     	csel	x8, x20, x8, hi
  8e24c0: 927ded17     	and	x23, x8, #0x7ffffffffffffff8
  8e24c4: d37ffae8     	lsl	x8, x23, #1
  8e24c8: 91004100     	add	x0, x8, #0x10
  8e24cc: 97dcb3a7     	bl	0xf368 <_ChromeMain+0xa0cc>
  8e24d0: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
  8e24d4: cb0802e8     	sub	x8, x23, x8
  8e24d8: a900a27f     	stp	xzr, x8, [x19, #0x8]
  8e24dc: f9000260     	str	x0, [x19]
  8e24e0: 4b1502c8     	sub	w8, w22, w21
  8e24e4: f2400909     	ands	x9, x8, #0x7
  8e24e8: 540004e1     	b.ne	0x8e2584 <_ChromeMain+0x8dd2e8>
  8e24ec: aa1503e8     	mov	x8, x21
  8e24f0: cb1602a9     	sub	x9, x21, x22
  8e24f4: b100213f     	cmn	x9, #0x8
  8e24f8: 540002a8     	b.hi	0x8e254c <_ChromeMain+0x8dd2b0>
  8e24fc: 39c00109     	ldrsb	w9, [x8]
  8e2500: 79000009     	strh	w9, [x0]
  8e2504: 39c00509     	ldrsb	w9, [x8, #0x1]
  8e2508: 79000409     	strh	w9, [x0, #0x2]
  8e250c: 39c00909     	ldrsb	w9, [x8, #0x2]
  8e2510: 79000809     	strh	w9, [x0, #0x4]
  8e2514: 39c00d09     	ldrsb	w9, [x8, #0x3]
  8e2518: 79000c09     	strh	w9, [x0, #0x6]
  8e251c: 39c01109     	ldrsb	w9, [x8, #0x4]
  8e2520: 79001009     	strh	w9, [x0, #0x8]
  8e2524: 39c01509     	ldrsb	w9, [x8, #0x5]
  8e2528: 79001409     	strh	w9, [x0, #0xa]
  8e252c: 39c01909     	ldrsb	w9, [x8, #0x6]
  8e2530: 79001809     	strh	w9, [x0, #0xc]
  8e2534: 39c01d09     	ldrsb	w9, [x8, #0x7]
  8e2538: 79001c09     	strh	w9, [x0, #0xe]
  8e253c: 91004000     	add	x0, x0, #0x10
  8e2540: 91002108     	add	x8, x8, #0x8
  8e2544: eb16011f     	cmp	x8, x22
  8e2548: 54fffda1     	b.ne	0x8e24fc <_ChromeMain+0x8dd260>
  8e254c: 7900001f     	strh	wzr, [x0]
  8e2550: 39c05e68     	ldrsb	w8, [x19, #0x17]
  8e2554: 37f80148     	tbnz	w8, #0x1f, 0x8e257c <_ChromeMain+0x8dd2e0>
  8e2558: 12001a88     	and	w8, w20, #0x7f
  8e255c: 39000308     	strb	w8, [x24]
  8e2560: a9457bfd     	ldp	x29, x30, [sp, #0x50]
  8e2564: a9444ff4     	ldp	x20, x19, [sp, #0x40]
  8e2568: a94357f6     	ldp	x22, x21, [sp, #0x30]
  8e256c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
  8e2570: a94167fa     	ldp	x26, x25, [sp, #0x10]
  8e2574: 910183ff     	add	sp, sp, #0x60
  8e2578: d65f03c0     	ret
  8e257c: f9000674     	str	x20, [x19, #0x8]
  8e2580: 17fffff8     	b	0x8e2560 <_ChromeMain+0x8dd2c4>
  8e2584: aa1503e8     	mov	x8, x21
  8e2588: 38c0150a     	ldrsb	w10, [x8], #0x1
  8e258c: 7800240a     	strh	w10, [x0], #0x2
  8e2590: f1000529     	subs	x9, x9, #0x1
  8e2594: 54ffffa1     	b.ne	0x8e2588 <_ChromeMain+0x8dd2ec>
  8e2598: 17ffffd6     	b	0x8e24f0 <_ChromeMain+0x8dd254>
  8e259c: d1000508     	sub	x8, x8, #0x1
  8e25a0: 38c01d09     	ldrsb	w9, [x8, #0x1]!
  8e25a4: 36ffffe9     	tbz	w9, #0x1f, 0x8e25a0 <_ChromeMain+0x8dd304>
  8e25a8: 17ffffb5     	b	0x8e247c <_ChromeMain+0x8dd1e0>
  8e25ac: d1002a82     	sub	x2, x20, #0xa
  8e25b0: aa1303e0     	mov	x0, x19
  8e25b4: 52800141     	mov	w1, #0xa                ; =10
  8e25b8: d2800003     	mov	x3, #0x0                ; =0
  8e25bc: d2800004     	mov	x4, #0x0                ; =0
  8e25c0: d2800005     	mov	x5, #0x0                ; =0
  8e25c4: d2800006     	mov	x6, #0x0                ; =0
  8e25c8: 940d9351     	bl	0xc4730c <_ChromeMain+0xc42070>
  8e25cc: f900067f     	str	xzr, [x19, #0x8]
  8e25d0: 39c05e68     	ldrsb	w8, [x19, #0x17]
  8e25d4: f9400269     	ldr	x9, [x19]
  8e25d8: 7100011f     	cmp	w8, #0x0
  8e25dc: 9a934137     	csel	x23, x9, x19, mi
  8e25e0: 14000006     	b	0x8e25f8 <_ChromeMain+0x8dd35c>
  8e25e4: f9000674     	str	x20, [x19, #0x8]
  8e25e8: 1400000b     	b	0x8e2614 <_ChromeMain+0x8dd378>
  8e25ec: aa1303f7     	mov	x23, x19
  8e25f0: f1002e9f     	cmp	x20, #0xb
  8e25f4: 54fffdc2     	b.hs	0x8e25ac <_ChromeMain+0x8dd310>
  8e25f8: d37ffa81     	lsl	x1, x20, #1
  8e25fc: aa1703e0     	mov	x0, x23
  8e2600: 95dc9c84     	bl	0x8009810 <_ChromeMain+0x8004574>
  8e2604: 39c05e68     	ldrsb	w8, [x19, #0x17]
  8e2608: 37fffee8     	tbnz	w8, #0x1f, 0x8e25e4 <_ChromeMain+0x8dd348>
  8e260c: 12001a88     	and	w8, w20, #0x7f
  8e2610: 39000308     	strb	w8, [x24]
  8e2614: 78347aff     	strh	wzr, [x23, x20, lsl #1]
  8e2618: 39c00308     	ldrsb	w8, [x24]
  8e261c: f100073f     	cmp	x25, #0x1
  8e2620: 5400016b     	b.lt	0x8e264c <_ChromeMain+0x8dd3b0>
  8e2624: f9400269     	ldr	x9, [x19]
  8e2628: 7100011f     	cmp	w8, #0x0
  8e262c: 9a934128     	csel	x8, x9, x19, mi
  8e2630: aa1903e9     	mov	x9, x25
  8e2634: aa1503ea     	mov	x10, x21
  8e2638: 38c0154b     	ldrsb	w11, [x10], #0x1
  8e263c: 7800250b     	strh	w11, [x8], #0x2
  8e2640: f1000529     	subs	x9, x9, #0x1
  8e2644: 54ffffa1     	b.ne	0x8e2638 <_ChromeMain+0x8dd39c>
  8e2648: 39400308     	ldrb	w8, [x24]
  8e264c: f9400269     	ldr	x9, [x19]
  8e2650: 7219011f     	tst	w8, #0x80
  8e2654: 9a931128     	csel	x8, x9, x19, ne
  8e2658: 8b190502     	add	x2, x8, x25, lsl #1
  8e265c: f90007ff     	str	xzr, [sp, #0x8]
  8e2660: 8b1902a0     	add	x0, x21, x25
  8e2664: 910023e3     	add	x3, sp, #0x8
  8e2668: aa1603e1     	mov	x1, x22
  8e266c: 52800024     	mov	w4, #0x1                ; =1
  8e2670: 94000c44     	bl	0x8e5780 <_ChromeMain+0x8e04e4>
  8e2674: f94007e8     	ldr	x8, [sp, #0x8]
  8e2678: 8b190115     	add	x21, x8, x25
  8e267c: 39805e74     	ldrsb	x20, [x19, #0x17]
  8e2680: b7f80354     	tbnz	x20, #0x3f, 0x8e26e8 <_ChromeMain+0x8dd44c>
  8e2684: eb1402bf     	cmp	x21, x20
  8e2688: 540000e8     	b.hi	0x8e26a4 <_ChromeMain+0x8dd408>
  8e268c: 39000315     	strb	w21, [x24]
  8e2690: aa1303f6     	mov	x22, x19
  8e2694: 78357adf     	strh	wzr, [x22, x21, lsl #1]
  8e2698: aa1303e0     	mov	x0, x19
  8e269c: 94000be9     	bl	0x8e5640 <_ChromeMain+0x8e03a4>
  8e26a0: 17ffffb0     	b	0x8e2560 <_ChromeMain+0x8dd2c4>
  8e26a4: 52800141     	mov	w1, #0xa                ; =10
  8e26a8: aa1403e8     	mov	x8, x20
  8e26ac: cb1402b7     	sub	x23, x21, x20
  8e26b0: cb140029     	sub	x9, x1, x20
  8e26b4: eb17013f     	cmp	x9, x23
  8e26b8: 540002e3     	b.lo	0x8e2714 <_ChromeMain+0x8dd478>
  8e26bc: f9400269     	ldr	x9, [x19]
  8e26c0: 7219011f     	tst	w8, #0x80
  8e26c4: 9a931136     	csel	x22, x9, x19, ne
  8e26c8: 8b1406c0     	add	x0, x22, x20, lsl #1
  8e26cc: d37ffae1     	lsl	x1, x23, #1
  8e26d0: 95dc9c50     	bl	0x8009810 <_ChromeMain+0x8004574>
  8e26d4: 39c05e68     	ldrsb	w8, [x19, #0x17]
  8e26d8: 37f80108     	tbnz	w8, #0x1f, 0x8e26f8 <_ChromeMain+0x8dd45c>
  8e26dc: 12001aa8     	and	w8, w21, #0x7f
  8e26e0: 39000308     	strb	w8, [x24]
  8e26e4: 17ffffec     	b	0x8e2694 <_ChromeMain+0x8dd3f8>
  8e26e8: f9400674     	ldr	x20, [x19, #0x8]
  8e26ec: eb1402bf     	cmp	x21, x20
  8e26f0: 54000088     	b.hi	0x8e2700 <_ChromeMain+0x8dd464>
  8e26f4: f9400276     	ldr	x22, [x19]
  8e26f8: f9000675     	str	x21, [x19, #0x8]
  8e26fc: 17ffffe6     	b	0x8e2694 <_ChromeMain+0x8dd3f8>
  8e2700: f9400a68     	ldr	x8, [x19, #0x10]
  8e2704: 9240f909     	and	x9, x8, #0x7fffffffffffffff
  8e2708: d1000521     	sub	x1, x9, #0x1
  8e270c: d378fd08     	lsr	x8, x8, #56
  8e2710: 17ffffe7     	b	0x8e26ac <_ChromeMain+0x8dd410>
  8e2714: cb0102a2     	sub	x2, x21, x1
  8e2718: aa1303e0     	mov	x0, x19
  8e271c: aa1403e3     	mov	x3, x20
  8e2720: aa1403e4     	mov	x4, x20
  8e2724: d2800005     	mov	x5, #0x0                ; =0
  8e2728: d2800006     	mov	x6, #0x0                ; =0
  8e272c: 940d92f8     	bl	0xc4730c <_ChromeMain+0xc42070>
  8e2730: f9000674     	str	x20, [x19, #0x8]
  8e2734: 39405e68     	ldrb	w8, [x19, #0x17]
  8e2738: 17ffffe1     	b	0x8e26bc <_ChromeMain+0x8dd420>
  8e273c: d2800009     	mov	x9, #0x0                ; =0
  8e2740: aa0803ea     	mov	x10, x8
  8e2744: 17ffff3d     	b	0x8e2438 <_ChromeMain+0x8dd19c>
  8e2748: d4200020     	brk	#0x1
  8e274c: 95110697     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
  8e2750: aa1503e0     	mov	x0, x21
  8e2754: aa1403e1     	mov	x1, x20
  8e2758: 941d7101     	bl	0x103eb5c <_ChromeMain+0x10398c0>
  8e275c: 34000180     	cbz	w0, 0x8e278c <_ChromeMain+0x8dd4f0>
  8e2760: 8b1402a2     	add	x2, x21, x20
  8e2764: aa1303e0     	mov	x0, x19
  8e2768: aa1503e1     	mov	x1, x21
  8e276c: aa1403e3     	mov	x3, x20
  8e2770: a9457bfd     	ldp	x29, x30, [sp, #0x50]
  8e2774: a9444ff4     	ldp	x20, x19, [sp, #0x40]
  8e2778: a94357f6     	ldp	x22, x21, [sp, #0x30]
  8e277c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
  8e2780: a94167fa     	ldp	x26, x25, [sp, #0x10]
  8e2784: 910183ff     	add	sp, sp, #0x60
  8e2788: 14e78f60     	b	0x42c6508 <_ChromeMain+0x42c126c>
  8e278c: aa1303e0     	mov	x0, x19
  8e2790: aa1403e1     	mov	x1, x20
  8e2794: 52800002     	mov	w2, #0x0                ; =0
  8e2798: 940d925e     	bl	0xc47110 <_ChromeMain+0xc41e74>
  8e279c: 39c05e68     	ldrsb	w8, [x19, #0x17]
  8e27a0: f9400269     	ldr	x9, [x19]
  8e27a4: 7100011f     	cmp	w8, #0x0
  8e27a8: 9a934122     	csel	x2, x9, x19, mi
  8e27ac: f90007ff     	str	xzr, [sp, #0x8]
  8e27b0: 910023e3     	add	x3, sp, #0x8
  8e27b4: aa1503e0     	mov	x0, x21
  8e27b8: aa1403e1     	mov	x1, x20
  8e27bc: 52800004     	mov	w4, #0x0                ; =0
  8e27c0: 94000bf0     	bl	0x8e5780 <_ChromeMain+0x8e04e4>
  8e27c4: f94007e1     	ldr	x1, [sp, #0x8]
  8e27c8: aa1303e0     	mov	x0, x19
  8e27cc: 52800002     	mov	w2, #0x0                ; =0
  8e27d0: 940d9250     	bl	0xc47110 <_ChromeMain+0xc41e74>
  8e27d4: 17ffffb1     	b	0x8e2698 <_ChromeMain+0x8dd3fc>
  8e27d8: d104c3ff     	sub	sp, sp, #0x130
  8e27dc: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
  8e27e0: a90e67fa     	stp	x26, x25, [sp, #0xe0]
  8e27e4: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
  8e27e8: a91057f6     	stp	x22, x21, [sp, #0x100]
  8e27ec: a9114ff4     	stp	x20, x19, [sp, #0x110]
  8e27f0: a9127bfd     	stp	x29, x30, [sp, #0x120]
  8e27f4: 910483fd     	add	x29, sp, #0x120
  8e27f8: aa0103f3     	mov	x19, x1
  8e27fc: aa0003f6     	mov	x22, x0
  8e2800: b006ceb9     	adrp	x25, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
  8e2804: 913d2339     	add	x25, x25, #0xf48
  8e2808: f90003f9     	str	x25, [sp]
  8e280c: f90013ff     	str	xzr, [sp, #0x20]
  8e2810: f006b2c8     	adrp	x8, 0xdf3d000 <dyld_stub_binder+0xdf3d000>
  8e2814: 3dc2a100     	ldr	q0, [x8, #0xa80]
  8e2818: 3d8007e0     	str	q0, [sp, #0x10]
  8e281c: 52800880     	mov	w0, #0x44               ; =68
  8e2820: 95dc9098     	bl	0x8006a80 <_ChromeMain+0x80017e4>
  8e2824: b4001fa0     	cbz	x0, 0x8e2c18 <_ChromeMain+0x8dd97c>
  8e2828: f90017ff     	str	xzr, [sp, #0x28]
  8e282c: f90007e0     	str	x0, [sp, #0x8]
