
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4645400: f9423c08     	ldr	x8, [x0, #0x478]
 4645404: b4001488     	cbz	x8, 0x4645694 <_ChromeMain+0x46403f8>
 4645408: d102c3ff     	sub	sp, sp, #0xb0
 464540c: a90667fa     	stp	x26, x25, [sp, #0x60]
 4645410: a9075ff8     	stp	x24, x23, [sp, #0x70]
 4645414: a90857f6     	stp	x22, x21, [sp, #0x80]
 4645418: a9094ff4     	stp	x20, x19, [sp, #0x90]
 464541c: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 4645420: 910283fd     	add	x29, sp, #0xa0
 4645424: f9419d13     	ldr	x19, [x8, #0x338]
 4645428: b40012b3     	cbz	x19, 0x464567c <_ChromeMain+0x46403e0>
 464542c: aa0003f4     	mov	x20, x0
 4645430: f9435408     	ldr	x8, [x0, #0x6a8]
 4645434: b4000368     	cbz	x8, 0x46454a0 <_ChromeMain+0x4640204>
 4645438: f941b508     	ldr	x8, [x8, #0x368]
 464543c: f100011f     	cmp	x8, #0x0
 4645440: 1a9f17f7     	cset	w23, eq
 4645444: f940ce78     	ldr	x24, [x19, #0x198]
 4645448: f9423695     	ldr	x21, [x20, #0x468]
 464544c: b4000655     	cbz	x21, 0x4645514 <_ChromeMain+0x4640278>
 4645450: f90013ff     	str	xzr, [sp, #0x20]
 4645454: 6f00e400     	movi.2d	v0, #0000000000000000
 4645458: ad0003e0     	stp	q0, q0, [sp]
 464545c: f94002a1     	ldr	x1, [x21]
 4645460: 910003e0     	mov	x0, sp
 4645464: 52800002     	mov	w2, #0x0                ; =0
 4645468: 970f85bc     	bl	0xa26b58 <_ChromeMain+0xa218bc>
 464546c: f9002bff     	str	xzr, [sp, #0x50]
 4645470: 6f00e400     	movi.2d	v0, #0000000000000000
 4645474: ad0183e0     	stp	q0, q0, [sp, #0x30]
 4645478: f94002a1     	ldr	x1, [x21]
 464547c: 9100c3e0     	add	x0, sp, #0x30
 4645480: 52800022     	mov	w2, #0x1                ; =1
 4645484: 970f85b5     	bl	0xa26b58 <_ChromeMain+0xa218bc>
 4645488: f94003f5     	ldr	x21, [sp]
 464548c: f9401be8     	ldr	x8, [sp, #0x30]
 4645490: eb0802bf     	cmp	x21, x8
 4645494: 54000380     	b.eq	0x4645504 <_ChromeMain+0x4640268>
 4645498: 52804d19     	mov	w25, #0x268             ; =616
 464549c: 14000009     	b	0x46454c0 <_ChromeMain+0x4640224>
 46454a0: 52800037     	mov	w23, #0x1               ; =1
 46454a4: 17ffffe8     	b	0x4645444 <_ChromeMain+0x46401a8>
 46454a8: 910003e0     	mov	x0, sp
 46454ac: 970f85f6     	bl	0xa26c84 <_ChromeMain+0xa219e8>
 46454b0: f94003f5     	ldr	x21, [sp]
 46454b4: f9401be8     	ldr	x8, [sp, #0x30]
 46454b8: eb0802bf     	cmp	x21, x8
 46454bc: 54000240     	b.eq	0x4645504 <_ChromeMain+0x4640268>
 46454c0: b4ffff55     	cbz	x21, 0x46454a8 <_ChromeMain+0x464020c>
 46454c4: 394186a8     	ldrb	w8, [x21, #0x61]
 46454c8: 34ffff08     	cbz	w8, 0x46454a8 <_ChromeMain+0x464020c>
 46454cc: f9435688     	ldr	x8, [x20, #0x6a8]
 46454d0: b4000188     	cbz	x8, 0x4645500 <_ChromeMain+0x4640264>
 46454d4: f941b509     	ldr	x9, [x8, #0x368]
 46454d8: 9b197d3a     	mul	x26, x9, x25
 46454dc: b400013a     	cbz	x26, 0x4645500 <_ChromeMain+0x4640264>
 46454e0: f941b116     	ldr	x22, [x8, #0x360]
 46454e4: aa1503e1     	mov	x1, x21
 46454e8: aa1603e2     	mov	x2, x22
 46454ec: 97ff0409     	bl	0x4606510 <_ChromeMain+0x4601274>
 46454f0: 35fffdc0     	cbnz	w0, 0x46454a8 <_ChromeMain+0x464020c>
 46454f4: 9109a2d6     	add	x22, x22, #0x268
 46454f8: f109a35a     	subs	x26, x26, #0x268
 46454fc: 54ffff41     	b.ne	0x46454e4 <_ChromeMain+0x4640248>
 4645500: 52800037     	mov	w23, #0x1               ; =1
 4645504: 9100c3e0     	add	x0, sp, #0x30
 4645508: 96fd17b5     	bl	0x58b3dc <_ChromeMain+0x586140>
 464550c: 910003e0     	mov	x0, sp
 4645510: 96fd17b3     	bl	0x58b3dc <_ChromeMain+0x586140>
 4645514: f9442688     	ldr	x8, [x20, #0x848]
 4645518: 39424108     	ldrb	w8, [x8, #0x90]
 464551c: 340000a8     	cbz	w8, 0x4645530 <_ChromeMain+0x4640294>
 4645520: 39682289     	ldrb	w9, [x20, #0xa08]
 4645524: 37000289     	tbnz	w9, #0x0, 0x4645574 <_ChromeMain+0x46402d8>
 4645528: 39683289     	ldrb	w9, [x20, #0xa0c]
 464552c: 37000249     	tbnz	w9, #0x0, 0x4645574 <_ChromeMain+0x46402d8>
 4645530: 3973828a     	ldrb	w10, [x20, #0xce0]
 4645534: 397de289     	ldrb	w9, [x20, #0xf78]
 4645538: 370000ca     	tbnz	w10, #0x0, 0x4645550 <_ChromeMain+0x46402b4>
 464553c: 370000c9     	tbnz	w9, #0x0, 0x4645554 <_ChromeMain+0x46402b8>
 4645540: 360001a8     	tbz	w8, #0x0, 0x4645574 <_ChromeMain+0x46402d8>
 4645544: 52800015     	mov	w21, #0x0               ; =0
 4645548: 52800008     	mov	w8, #0x0                ; =0
 464554c: 14000010     	b	0x464558c <_ChromeMain+0x46402f0>
 4645550: 34000a49     	cbz	w9, 0x4645698 <_ChromeMain+0x46403fc>
 4645554: b941c288     	ldr	w8, [x20, #0x1c0]
 4645558: aa0803e9     	mov	x9, x8
 464555c: 6b08013f     	cmp	w9, w8
 4645560: 1a88b12a     	csel	w10, w9, w8, lt
 4645564: 7100011f     	cmp	w8, #0x0
 4645568: 1a89c148     	csel	w8, w10, w9, gt
 464556c: 71025d1f     	cmp	w8, #0x97
 4645570: 54fffeab     	b.lt	0x4645544 <_ChromeMain+0x46402a8>
 4645574: f100031f     	cmp	x24, #0x0
 4645578: 1a9f17e8     	cset	w8, eq
 464557c: 1a9703e9     	csel	w9, wzr, w23, eq
 4645580: 3960e68a     	ldrb	w10, [x20, #0x839]
 4645584: 0a080148     	and	w8, w10, w8
 4645588: 2a0a0135     	orr	w21, w9, w10
 464558c: 39560269     	ldrb	w9, [x19, #0x580]
 4645590: 6b08013f     	cmp	w9, w8
 4645594: 54000120     	b.eq	0x46455b8 <_ChromeMain+0x464031c>
 4645598: 39160268     	strb	w8, [x19, #0x580]
 464559c: aa1303e0     	mov	x0, x19
 46455a0: 52800001     	mov	w1, #0x0                ; =0
 46455a4: 96ffabb4     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46455a8: f9400268     	ldr	x8, [x19]
 46455ac: f9418508     	ldr	x8, [x8, #0x308]
 46455b0: aa1303e0     	mov	x0, x19
 46455b4: d63f0100     	blr	x8
 46455b8: aa1303f4     	mov	x20, x19
 46455bc: f84d8688     	ldr	x8, [x20], #0xd8
 46455c0: f9405108     	ldr	x8, [x8, #0xa0]
 46455c4: 120002a1     	and	w1, w21, #0x1
 46455c8: aa1303e0     	mov	x0, x19
 46455cc: d63f0100     	blr	x8
 46455d0: 52800800     	mov	w0, #0x40               ; =64
 46455d4: 96e72765     	bl	0xf368 <_ChromeMain+0xa0cc>
 46455d8: 52800028     	mov	w8, #0x1                ; =1
 46455dc: b9000008     	str	w8, [x0]
 46455e0: d0fe4f08     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 46455e4: 91260108     	add	x8, x8, #0x980
 46455e8: b0fde569     	adrp	x9, 0x2f2000 <_ChromeMain+0x2ecd64>
 46455ec: 91220129     	add	x9, x9, #0x880
 46455f0: a900a408     	stp	x8, x9, [x0, #0x8]
 46455f4: 90fef8c8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 46455f8: 912c0108     	add	x8, x8, #0xb00
 46455fc: b0ffa709     	adrp	x9, 0x3b26000 <_ChromeMain+0x3b20d64>
 4645600: 91310129     	add	x9, x9, #0xc40
 4645604: a901a408     	stp	x8, x9, [x0, #0x18]
 4645608: f004c7c8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 464560c: 3dc01900     	ldr	q0, [x8, #0x60]
 4645610: 3c828000     	stur	q0, [x0, #0x28]
 4645614: 3900e01f     	strb	wzr, [x0, #0x38]
 4645618: f90003e0     	str	x0, [sp]
 464561c: 0f000420     	movi.2s	v0, #0x1
 4645620: fd0007e0     	str	d0, [sp, #0x8]
 4645624: 52800068     	mov	w8, #0x3                ; =3
 4645628: b90013e8     	str	w8, [sp, #0x10]
 464562c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4645630: f9000fff     	str	xzr, [sp, #0x18]
 4645634: 90051e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4645638: 91152021     	add	x1, x1, #0x548
 464563c: 910003e2     	mov	x2, sp
 4645640: aa1403e0     	mov	x0, x20
 4645644: 97573b52     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 4645648: 910003e0     	mov	x0, sp
 464564c: 974415b6     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 4645650: 37000075     	tbnz	w21, #0x0, 0x464565c <_ChromeMain+0x46403c0>
 4645654: a9007fff     	stp	xzr, xzr, [sp]
 4645658: 14000004     	b	0x4645668 <_ChromeMain+0x46403cc>
 464565c: d004c808     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 4645660: 3dc29500     	ldr	q0, [x8, #0xa50]
 4645664: 3d8003e0     	str	q0, [sp]
 4645668: 90051e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464566c: 91122021     	add	x1, x1, #0x488
 4645670: 910003e2     	mov	x2, sp
 4645674: aa1403e0     	mov	x0, x20
 4645678: 9752a1fa     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464567c: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 4645680: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 4645684: a94857f6     	ldp	x22, x21, [sp, #0x80]
 4645688: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 464568c: a94667fa     	ldp	x26, x25, [sp, #0x60]
 4645690: 9102c3ff     	add	sp, sp, #0xb0
 4645694: d65f03c0     	ret
 4645698: 3974a288     	ldrb	w8, [x20, #0xd28]
 464569c: 350000c8     	cbnz	w8, 0x46456b4 <_ChromeMain+0x4640418>
 46456a0: fd46a280     	ldr	d0, [x20, #0xd40]
 46456a4: 1e6e1001     	fmov	d1, #1.00000000
 46456a8: 1e612000     	fcmp	d0, d1
 46456ac: 1a9f17e8     	cset	w8, eq
 46456b0: 14000005     	b	0x46456c4 <_ChromeMain+0x4640428>
 46456b4: b94d2688     	ldr	w8, [x20, #0xd24]
 46456b8: 7100011f     	cmp	w8, #0x0
 46456bc: 1a9f17e8     	cset	w8, eq
 46456c0: fd46a280     	ldr	d0, [x20, #0xd40]
 46456c4: 90021de9     	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 46456c8: 912db129     	add	x9, x9, #0xb6c
 46456cc: f0ff7baa     	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 46456d0: 9103514a     	add	x10, x10, #0xd4
 46456d4: 7100011f     	cmp	w8, #0x0
 46456d8: 9a891148     	csel	x8, x10, x9, ne
 46456dc: b948ca89     	ldr	w9, [x20, #0x8c8]
 46456e0: 1e620121     	scvtf	d1, w9
 46456e4: 1e610800     	fmul	d0, d0, d1
 46456e8: d63f0100     	blr	x8
 46456ec: 1e780009     	fcvtzs	w9, d0
