
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45512e8: 528001e8     	mov	w8, #0xf                ; =15
 45512ec: f9000448     	str	x8, [x2, #0x8]
 45512f0: f9406408     	ldr	x8, [x0, #0xc8]
 45512f4: b4002288     	cbz	x8, 0x4551744 <_ChromeMain+0x454c4a8>
 45512f8: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 45512fc: a90157f6     	stp	x22, x21, [sp, #0x10]
 4551300: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4551304: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4551308: 9100c3fd     	add	x29, sp, #0x30
 455130c: aa0203f3     	mov	x19, x2
 4551310: aa0003f4     	mov	x20, x0
 4551314: f9429d09     	ldr	x9, [x8, #0x538]
 4551318: f0052c17     	adrp	x23, 0xead4000 <dyld_stub_binder+0xead4000>
 455131c: 912b42f7     	add	x23, x23, #0xad0
 4551320: b0053316     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4551324: b4000649     	cbz	x9, 0x45513ec <_ChromeMain+0x454c150>
 4551328: f940c528     	ldr	x8, [x9, #0x188]
 455132c: b40002a8     	cbz	x8, 0x4551380 <_ChromeMain+0x454c0e4>
 4551330: 91062129     	add	x9, x9, #0x188
 4551334: 1400000d     	b	0x4551368 <_ChromeMain+0x454c0cc>
 4551338: eb09011f     	cmp	x8, x9
 455133c: 54000220     	b.eq	0x4551380 <_ChromeMain+0x454c0e4>
 4551340: f9401515     	ldr	x21, [x8, #0x28]
 4551344: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551348: f94046c9     	ldr	x9, [x22, #0x88]
 455134c: eb09011f     	cmp	x8, x9
 4551350: 540001a1     	b.ne	0x4551384 <_ChromeMain+0x454c0e8>
 4551354: aa1503e0     	mov	x0, x21
 4551358: 96eb0be9     	bl	0x142fc <_ChromeMain+0xf060>
 455135c: 1400000a     	b	0x4551384 <_ChromeMain+0x454c0e8>
 4551360: f9400108     	ldr	x8, [x8]
 4551364: b40000e8     	cbz	x8, 0x4551380 <_ChromeMain+0x454c0e4>
 4551368: f940110a     	ldr	x10, [x8, #0x20]
 455136c: eb17015f     	cmp	x10, x23
 4551370: 54ffff88     	b.hi	0x4551360 <_ChromeMain+0x454c0c4>
 4551374: 54fffe20     	b.eq	0x4551338 <_ChromeMain+0x454c09c>
 4551378: f9400508     	ldr	x8, [x8, #0x8]
 455137c: b5ffff68     	cbnz	x8, 0x4551368 <_ChromeMain+0x454c0cc>
 4551380: d2800015     	mov	x21, #0x0               ; =0
 4551384: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551388: f94046c9     	ldr	x9, [x22, #0x88]
 455138c: eb09011f     	cmp	x8, x9
 4551390: 54000061     	b.ne	0x455139c <_ChromeMain+0x454c100>
 4551394: aa1503e0     	mov	x0, x21
 4551398: 96eb45a9     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 455139c: 3940fea9     	ldrb	w9, [x21, #0x3f]
 45513a0: 13001d28     	sxtb	w8, w9
 45513a4: f9401aaa     	ldr	x10, [x21, #0x30]
 45513a8: 7100011f     	cmp	w8, #0x0
 45513ac: 9a894149     	csel	x9, x10, x9, mi
 45513b0: f100453f     	cmp	x9, #0x11
 45513b4: 540001c1     	b.ne	0x45513ec <_ChromeMain+0x454c150>
 45513b8: f8428ea9     	ldr	x9, [x21, #0x28]!
 45513bc: 7100011f     	cmp	w8, #0x0
 45513c0: 9a954128     	csel	x8, x9, x21, mi
 45513c4: b0044d89     	adrp	x9, 0xcf02000 <dyld_stub_binder+0xcf02000>
 45513c8: 91249129     	add	x9, x9, #0x924
 45513cc: a9402d0a     	ldp	x10, x11, [x8]
 45513d0: a940352c     	ldp	x12, x13, [x9]
 45513d4: 39404108     	ldrb	w8, [x8, #0x10]
 45513d8: 39404129     	ldrb	w9, [x9, #0x10]
 45513dc: eb0c015f     	cmp	x10, x12
 45513e0: fa4d0160     	ccmp	x11, x13, #0x0, eq
 45513e4: fa490100     	ccmp	x8, x9, #0x0, eq
 45513e8: 54001980     	b.eq	0x4551718 <_ChromeMain+0x454c47c>
 45513ec: f9406688     	ldr	x8, [x20, #0xc8]
 45513f0: f9429d08     	ldr	x8, [x8, #0x538]
 45513f4: b4000d08     	cbz	x8, 0x4551594 <_ChromeMain+0x454c2f8>
 45513f8: 91062118     	add	x24, x8, #0x188
 45513fc: f940c508     	ldr	x8, [x8, #0x188]
 4551400: b4000288     	cbz	x8, 0x4551450 <_ChromeMain+0x454c1b4>
 4551404: 1400000d     	b	0x4551438 <_ChromeMain+0x454c19c>
 4551408: eb18011f     	cmp	x8, x24
 455140c: 54000220     	b.eq	0x4551450 <_ChromeMain+0x454c1b4>
 4551410: f9401515     	ldr	x21, [x8, #0x28]
 4551414: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551418: f94046c9     	ldr	x9, [x22, #0x88]
 455141c: eb09011f     	cmp	x8, x9
 4551420: 540001a1     	b.ne	0x4551454 <_ChromeMain+0x454c1b8>
 4551424: aa1503e0     	mov	x0, x21
 4551428: 96eb0bb5     	bl	0x142fc <_ChromeMain+0xf060>
 455142c: 1400000a     	b	0x4551454 <_ChromeMain+0x454c1b8>
 4551430: f9400108     	ldr	x8, [x8]
 4551434: b40000e8     	cbz	x8, 0x4551450 <_ChromeMain+0x454c1b4>
 4551438: f9401109     	ldr	x9, [x8, #0x20]
 455143c: eb17013f     	cmp	x9, x23
 4551440: 54ffff88     	b.hi	0x4551430 <_ChromeMain+0x454c194>
 4551444: 54fffe20     	b.eq	0x4551408 <_ChromeMain+0x454c16c>
 4551448: f9400508     	ldr	x8, [x8, #0x8]
 455144c: b5ffff68     	cbnz	x8, 0x4551438 <_ChromeMain+0x454c19c>
 4551450: d2800015     	mov	x21, #0x0               ; =0
 4551454: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551458: f94046c9     	ldr	x9, [x22, #0x88]
 455145c: eb09011f     	cmp	x8, x9
 4551460: 54000061     	b.ne	0x455146c <_ChromeMain+0x454c1d0>
 4551464: aa1503e0     	mov	x0, x21
 4551468: 96eb4575     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 455146c: 39c0fea8     	ldrsb	w8, [x21, #0x3f]
 4551470: 37f80088     	tbnz	w8, #0x1f, 0x4551480 <_ChromeMain+0x454c1e4>
 4551474: f9400308     	ldr	x8, [x24]
 4551478: b4000588     	cbz	x8, 0x4551528 <_ChromeMain+0x454c28c>
 455147c: 14000025     	b	0x4551510 <_ChromeMain+0x454c274>
 4551480: f9401aa8     	ldr	x8, [x21, #0x30]
 4551484: f100711f     	cmp	x8, #0x1c
 4551488: 54ffff61     	b.ne	0x4551474 <_ChromeMain+0x454c1d8>
 455148c: f94016a8     	ldr	x8, [x21, #0x28]
 4551490: d0044c29     	adrp	x9, 0xced7000 <dyld_stub_binder+0xced7000>
 4551494: 910e6529     	add	x9, x9, #0x399
 4551498: a9402d0a     	ldp	x10, x11, [x8]
 455149c: a940352c     	ldp	x12, x13, [x9]
 45514a0: f940090e     	ldr	x14, [x8, #0x10]
 45514a4: f940092f     	ldr	x15, [x9, #0x10]
 45514a8: b9401908     	ldr	w8, [x8, #0x18]
 45514ac: b9401929     	ldr	w9, [x9, #0x18]
 45514b0: eb0c015f     	cmp	x10, x12
 45514b4: fa4d0160     	ccmp	x11, x13, #0x0, eq
 45514b8: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 45514bc: fa490100     	ccmp	x8, x9, #0x0, eq
 45514c0: 54fffda1     	b.ne	0x4551474 <_ChromeMain+0x454c1d8>
 45514c4: 52800028     	mov	w8, #0x1                ; =1
 45514c8: b9000268     	str	w8, [x19]
 45514cc: 52900068     	mov	w8, #0x8003             ; =32771
 45514d0: f9000668     	str	x8, [x19, #0x8]
 45514d4: 52802028     	mov	w8, #0x101              ; =257
 45514d8: 79002268     	strh	w8, [x19, #0x10]
 45514dc: 1400007e     	b	0x45516d4 <_ChromeMain+0x454c438>
 45514e0: eb18011f     	cmp	x8, x24
 45514e4: 54000220     	b.eq	0x4551528 <_ChromeMain+0x454c28c>
 45514e8: f9401515     	ldr	x21, [x8, #0x28]
 45514ec: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45514f0: f94046c9     	ldr	x9, [x22, #0x88]
 45514f4: eb09011f     	cmp	x8, x9
 45514f8: 540001a1     	b.ne	0x455152c <_ChromeMain+0x454c290>
 45514fc: aa1503e0     	mov	x0, x21
 4551500: 96eb0b7f     	bl	0x142fc <_ChromeMain+0xf060>
 4551504: 1400000a     	b	0x455152c <_ChromeMain+0x454c290>
 4551508: f9400108     	ldr	x8, [x8]
 455150c: b40000e8     	cbz	x8, 0x4551528 <_ChromeMain+0x454c28c>
 4551510: f9401109     	ldr	x9, [x8, #0x20]
 4551514: eb17013f     	cmp	x9, x23
 4551518: 54ffff88     	b.hi	0x4551508 <_ChromeMain+0x454c26c>
 455151c: 54fffe20     	b.eq	0x45514e0 <_ChromeMain+0x454c244>
 4551520: f9400508     	ldr	x8, [x8, #0x8]
 4551524: b5ffff68     	cbnz	x8, 0x4551510 <_ChromeMain+0x454c274>
 4551528: d2800015     	mov	x21, #0x0               ; =0
 455152c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551530: f94046c9     	ldr	x9, [x22, #0x88]
 4551534: eb09011f     	cmp	x8, x9
 4551538: 54000061     	b.ne	0x4551544 <_ChromeMain+0x454c2a8>
 455153c: aa1503e0     	mov	x0, x21
 4551540: 96eb453f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4551544: 3940fea9     	ldrb	w9, [x21, #0x3f]
 4551548: 13001d28     	sxtb	w8, w9
 455154c: f9401aaa     	ldr	x10, [x21, #0x30]
 4551550: 7100011f     	cmp	w8, #0x0
 4551554: 9a894149     	csel	x9, x10, x9, mi
 4551558: f100553f     	cmp	x9, #0x15
 455155c: 540001c1     	b.ne	0x4551594 <_ChromeMain+0x454c2f8>
 4551560: f8428ea9     	ldr	x9, [x21, #0x28]!
 4551564: 7100011f     	cmp	w8, #0x0
 4551568: 9a954128     	csel	x8, x9, x21, mi
 455156c: 90044d69     	adrp	x9, 0xcefd000 <dyld_stub_binder+0xcefd000>
 4551570: 911fd929     	add	x9, x9, #0x7f6
 4551574: a9402d0a     	ldp	x10, x11, [x8]
 4551578: a940352c     	ldp	x12, x13, [x9]
 455157c: f840d108     	ldur	x8, [x8, #0xd]
 4551580: f840d129     	ldur	x9, [x9, #0xd]
 4551584: eb0c015f     	cmp	x10, x12
 4551588: fa4d0160     	ccmp	x11, x13, #0x0, eq
 455158c: fa490100     	ccmp	x8, x9, #0x0, eq
 4551590: 54fff9a0     	b.eq	0x45514c4 <_ChromeMain+0x454c228>
 4551594: f9406688     	ldr	x8, [x20, #0xc8]
 4551598: f9429d09     	ldr	x9, [x8, #0x538]
 455159c: b9406128     	ldr	w8, [x9, #0x60]
 45515a0: 340004e8     	cbz	w8, 0x455163c <_ChromeMain+0x454c3a0>
 45515a4: 7100151f     	cmp	w8, #0x5
 45515a8: 540000c1     	b.ne	0x45515c0 <_ChromeMain+0x454c324>
 45515ac: 52800048     	mov	w8, #0x2                ; =2
 45515b0: b9000268     	str	w8, [x19]
 45515b4: 52900128     	mov	w8, #0x8009             ; =32777
 45515b8: f9000668     	str	x8, [x19, #0x8]
 45515bc: 14000044     	b	0x45516cc <_ChromeMain+0x454c430>
 45515c0: b4000629     	cbz	x9, 0x4551684 <_ChromeMain+0x454c3e8>
 45515c4: f940c528     	ldr	x8, [x9, #0x188]
 45515c8: b40002e8     	cbz	x8, 0x4551624 <_ChromeMain+0x454c388>
 45515cc: 91062129     	add	x9, x9, #0x188
 45515d0: 90051a2a     	adrp	x10, 0xe895000 <dyld_stub_binder+0xe895000>
 45515d4: 911ec14a     	add	x10, x10, #0x7b0
 45515d8: 1400000d     	b	0x455160c <_ChromeMain+0x454c370>
 45515dc: eb09011f     	cmp	x8, x9
 45515e0: 54000220     	b.eq	0x4551624 <_ChromeMain+0x454c388>
 45515e4: f9401515     	ldr	x21, [x8, #0x28]
 45515e8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45515ec: f94046c9     	ldr	x9, [x22, #0x88]
 45515f0: eb09011f     	cmp	x8, x9
 45515f4: 540001a1     	b.ne	0x4551628 <_ChromeMain+0x454c38c>
 45515f8: aa1503e0     	mov	x0, x21
 45515fc: 96eb0b40     	bl	0x142fc <_ChromeMain+0xf060>
 4551600: 1400000a     	b	0x4551628 <_ChromeMain+0x454c38c>
 4551604: f9400108     	ldr	x8, [x8]
 4551608: b40000e8     	cbz	x8, 0x4551624 <_ChromeMain+0x454c388>
 455160c: f940110b     	ldr	x11, [x8, #0x20]
 4551610: eb0a017f     	cmp	x11, x10
 4551614: 54ffff88     	b.hi	0x4551604 <_ChromeMain+0x454c368>
 4551618: 54fffe20     	b.eq	0x45515dc <_ChromeMain+0x454c340>
 455161c: f9400508     	ldr	x8, [x8, #0x8]
 4551620: b5ffff68     	cbnz	x8, 0x455160c <_ChromeMain+0x454c370>
 4551624: d2800015     	mov	x21, #0x0               ; =0
 4551628: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 455162c: f94046c9     	ldr	x9, [x22, #0x88]
 4551630: eb09011f     	cmp	x8, x9
 4551634: 54000220     	b.eq	0x4551678 <_ChromeMain+0x454c3dc>
 4551638: b4000275     	cbz	x21, 0x4551684 <_ChromeMain+0x454c3e8>
 455163c: 52800028     	mov	w8, #0x1                ; =1
 4551640: b9000268     	str	w8, [x19]
 4551644: f9400669     	ldr	x9, [x19, #0x8]
 4551648: b2710129     	orr	x9, x9, #0x8000
 455164c: f9000669     	str	x9, [x19, #0x8]
 4551650: 39004268     	strb	w8, [x19, #0x10]
 4551654: f9406688     	ldr	x8, [x20, #0xc8]
 4551658: f9429d09     	ldr	x9, [x8, #0x538]
 455165c: b40003c9     	cbz	x9, 0x45516d4 <_ChromeMain+0x454c438>
 4551660: f940c528     	ldr	x8, [x9, #0x188]
 4551664: b4000248     	cbz	x8, 0x45516ac <_ChromeMain+0x454c410>
 4551668: 91062129     	add	x9, x9, #0x188
 455166c: 90051a2a     	adrp	x10, 0xe895000 <dyld_stub_binder+0xe895000>
 4551670: 911ec14a     	add	x10, x10, #0x7b0
 4551674: 14000008     	b	0x4551694 <_ChromeMain+0x454c3f8>
 4551678: aa1503e0     	mov	x0, x21
 455167c: 96eb44f0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4551680: b5fffdf5     	cbnz	x21, 0x455163c <_ChromeMain+0x454c3a0>
 4551684: b900027f     	str	wzr, [x19]
 4551688: 14000013     	b	0x45516d4 <_ChromeMain+0x454c438>
 455168c: f9400108     	ldr	x8, [x8]
 4551690: b40000e8     	cbz	x8, 0x45516ac <_ChromeMain+0x454c410>
 4551694: f940110b     	ldr	x11, [x8, #0x20]
 4551698: eb0a017f     	cmp	x11, x10
 455169c: 54ffff88     	b.hi	0x455168c <_ChromeMain+0x454c3f0>
 45516a0: 54000280     	b.eq	0x45516f0 <_ChromeMain+0x454c454>
 45516a4: f9400508     	ldr	x8, [x8, #0x8]
 45516a8: b5ffff68     	cbnz	x8, 0x4551694 <_ChromeMain+0x454c3f8>
 45516ac: d2800014     	mov	x20, #0x0               ; =0
 45516b0: 925e7688     	and	x8, x20, #0xfffffffc00000000
 45516b4: f94046c9     	ldr	x9, [x22, #0x88]
 45516b8: eb09011f     	cmp	x8, x9
 45516bc: 54000061     	b.ne	0x45516c8 <_ChromeMain+0x454c42c>
 45516c0: aa1403e0     	mov	x0, x20
 45516c4: 96eb44de     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45516c8: b4000074     	cbz	x20, 0x45516d4 <_ChromeMain+0x454c438>
 45516cc: 52800028     	mov	w8, #0x1                ; =1
 45516d0: 39004668     	strb	w8, [x19, #0x11]
 45516d4: 52800028     	mov	w8, #0x1                ; =1
 45516d8: 39004a68     	strb	w8, [x19, #0x12]
 45516dc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45516e0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45516e4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45516e8: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 45516ec: d65f03c0     	ret
 45516f0: eb09011f     	cmp	x8, x9
 45516f4: 54fffdc0     	b.eq	0x45516ac <_ChromeMain+0x454c410>
 45516f8: f9401514     	ldr	x20, [x8, #0x28]
 45516fc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4551700: f94046c9     	ldr	x9, [x22, #0x88]
 4551704: eb09011f     	cmp	x8, x9
 4551708: 54fffd41     	b.ne	0x45516b0 <_ChromeMain+0x454c414>
 455170c: aa1403e0     	mov	x0, x20
 4551710: 96eb0afb     	bl	0x142fc <_ChromeMain+0xf060>
 4551714: 17ffffe7     	b	0x45516b0 <_ChromeMain+0x454c414>
 4551718: b900027f     	str	wzr, [x19]
 455171c: 52900068     	mov	w8, #0x8003             ; =32771
 4551720: f9000668     	str	x8, [x19, #0x8]
 4551724: 52802028     	mov	w8, #0x101              ; =257
 4551728: 79002268     	strh	w8, [x19, #0x10]
 455172c: 52830368     	mov	w8, #0x181b             ; =6171
 4551730: 72bfe308     	movk	w8, #0xff18, lsl #16
 4551734: b9001668     	str	w8, [x19, #0x14]
 4551738: 52800028     	mov	w8, #0x1                ; =1
 455173c: 39006268     	strb	w8, [x19, #0x18]
 4551740: 17ffffe5     	b	0x45516d4 <_ChromeMain+0x454c438>
 4551744: d4200000     	brk	#0
 4551748: d4400000     	hlt	#0
 455174c: d4200020     	brk	#0x1
