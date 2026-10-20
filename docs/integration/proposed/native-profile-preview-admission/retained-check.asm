
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4650640: 39683008     	ldrb	w8, [x0, #0xa0c]
 4650644: 34000848     	cbz	w8, 0x465074c <_ChromeMain+0x464b4b0>
 4650648: d10103ff     	sub	sp, sp, #0x40
 465064c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4650650: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4650654: 9100c3fd     	add	x29, sp, #0x30
 4650658: aa0003f3     	mov	x19, x0
 465065c: f944e800     	ldr	x0, [x0, #0x9d0]
 4650660: b40001a0     	cbz	x0, 0x4650694 <_ChromeMain+0x464b3f8>
 4650664: f9400008     	ldr	x8, [x0]
 4650668: f9400908     	ldr	x8, [x8, #0x10]
 465066c: 90ffe3c9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 4650670: 9123b129     	add	x9, x9, #0x8ec
 4650674: eb09011f     	cmp	x8, x9
 4650678: 540006c1     	b.ne	0x4650750 <_ChromeMain+0x464b4b4>
 465067c: f9401008     	ldr	x8, [x0, #0x20]
 4650680: b40000a8     	cbz	x8, 0x4650694 <_ChromeMain+0x464b3f8>
 4650684: f9400c08     	ldr	x8, [x0, #0x18]
 4650688: b8bfc108     	ldapr	w8, [x8]
 465068c: 7100051f     	cmp	w8, #0x1
 4650690: 54000581     	b.ne	0x4650740 <_ChromeMain+0x464b4a4>
 4650694: f004c3c0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4650698: 9135cc00     	add	x0, x0, #0xd73
 465069c: f004c3c1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 46506a0: 912c7821     	add	x1, x1, #0xb1e
 46506a4: 910003e8     	mov	x8, sp
 46506a8: 52860e82     	mov	w2, #0x3074             ; =12404
 46506ac: 96e80175     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 46506b0: 925e7668     	and	x8, x19, #0xfffffffc00000000
 46506b4: d0052b09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46506b8: f9404529     	ldr	x9, [x9, #0x88]
 46506bc: eb09011f     	cmp	x8, x9
 46506c0: 54000061     	b.ne	0x46506cc <_ChromeMain+0x464b430>
 46506c4: aa1303e0     	mov	x0, x19
 46506c8: 96e70f0d     	bl	0x142fc <_ChromeMain+0xf060>
 46506cc: 52800700     	mov	w0, #0x38               ; =56
 46506d0: 96e6fb26     	bl	0xf368 <_ChromeMain+0xa0cc>
 46506d4: 52800028     	mov	w8, #0x1                ; =1
 46506d8: b9000008     	str	w8, [x0]
 46506dc: b0ffc748     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 46506e0: 913a0108     	add	x8, x8, #0xe80
 46506e4: b0ff9249     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 46506e8: 912d0129     	add	x9, x9, #0xb40
 46506ec: a900a408     	stp	x8, x9, [x0, #0x8]
 46506f0: b0fef868     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 46506f4: 912c0108     	add	x8, x8, #0xb00
 46506f8: 10001569     	adr	x9, 0x46509a4 <_ChromeMain+0x464b708>
 46506fc: d503201f     	nop
 4650700: a901a408     	stp	x8, x9, [x0, #0x18]
 4650704: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4650708: f944fe74     	ldr	x20, [x19, #0x9f8]
 465070c: f904fe60     	str	x0, [x19, #0x9f8]
 4650710: b5000274     	cbnz	x20, 0x465075c <_ChromeMain+0x464b4c0>
 4650714: 3dc003e0     	ldr	q0, [sp]
 4650718: 3d826e60     	str	q0, [x19, #0x9b0]
 465071c: b94013e8     	ldr	w8, [sp, #0x10]
 4650720: b909c268     	str	w8, [x19, #0x9c0]
 4650724: f9400fe8     	ldr	x8, [sp, #0x18]
 4650728: f904e668     	str	x8, [x19, #0x9c8]
 465072c: 5290d408     	mov	w8, #0x86a0             ; =34464
 4650730: 72a00028     	movk	w8, #0x1, lsl #16
 4650734: f904f268     	str	x8, [x19, #0x9e0]
 4650738: 91268260     	add	x0, x19, #0x9a0
 465073c: 970bfb5c     	bl	0x94f4ac <_ChromeMain+0x94a210>
 4650740: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4650744: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4650748: 910103ff     	add	sp, sp, #0x40
 465074c: d65f03c0     	ret
 4650750: d63f0100     	blr	x8
 4650754: 3707ff60     	tbnz	w0, #0x0, 0x4650740 <_ChromeMain+0x464b4a4>
 4650758: 17ffffcf     	b	0x4650694 <_ChromeMain+0x464b3f8>
 465075c: 12800008     	mov	w8, #-0x1               ; =-1
 4650760: b8e80288     	ldaddal	w8, w8, [x20]
 4650764: 7100051f     	cmp	w8, #0x1
 4650768: 54fffd61     	b.ne	0x4650714 <_ChromeMain+0x464b478>
 465076c: f9400a88     	ldr	x8, [x20, #0x10]
 4650770: b0fe4aa9     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 4650774: 91190129     	add	x9, x9, #0x640
 4650778: eb09011f     	cmp	x8, x9
 465077c: 54000140     	b.eq	0x46507a4 <_ChromeMain+0x464b508>
 4650780: 90ff98e9     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 4650784: 91180129     	add	x9, x9, #0x600
 4650788: aa1403e0     	mov	x0, x20
 465078c: eb09011f     	cmp	x8, x9
 4650790: 54000060     	b.eq	0x465079c <_ChromeMain+0x464b500>
 4650794: d63f0100     	blr	x8
 4650798: 17ffffdf     	b	0x4650714 <_ChromeMain+0x464b478>
 465079c: 52800701     	mov	w1, #0x38               ; =56
 46507a0: 14000005     	b	0x46507b4 <_ChromeMain+0x464b518>
 46507a4: f9401a80     	ldr	x0, [x20, #0x30]
 46507a8: b50000a0     	cbnz	x0, 0x46507bc <_ChromeMain+0x464b520>
 46507ac: aa1403e0     	mov	x0, x20
 46507b0: 52800901     	mov	w1, #0x48               ; =72
 46507b4: 96e6e1c1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46507b8: 17ffffd7     	b	0x4650714 <_ChromeMain+0x464b478>
 46507bc: 12800008     	mov	w8, #-0x1               ; =-1
 46507c0: b8e80008     	ldaddal	w8, w8, [x0]
 46507c4: 7100051f     	cmp	w8, #0x1
 46507c8: 54ffff21     	b.ne	0x46507ac <_ChromeMain+0x464b510>
 46507cc: 52800101     	mov	w1, #0x8                ; =8
 46507d0: 96e6e1ba     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46507d4: 17fffff6     	b	0x46507ac <_ChromeMain+0x464b510>
