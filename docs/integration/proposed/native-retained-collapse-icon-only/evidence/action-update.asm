
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41fd4c0: d10243ff     	sub	sp, sp, #0x90
 41fd4c4: a90467fa     	stp	x26, x25, [sp, #0x40]
 41fd4c8: a9055ff8     	stp	x24, x23, [sp, #0x50]
 41fd4cc: a90657f6     	stp	x22, x21, [sp, #0x60]
 41fd4d0: a9074ff4     	stp	x20, x19, [sp, #0x70]
 41fd4d4: a9087bfd     	stp	x29, x30, [sp, #0x80]
 41fd4d8: 910203fd     	add	x29, sp, #0x80
 41fd4dc: aa0103f3     	mov	x19, x1
 41fd4e0: aa0003f4     	mov	x20, x0
 41fd4e4: 92800238     	mov	x24, #-0x12             ; =-18
 41fd4e8: f2effff8     	movk	x24, #0x7fff, lsl #48
 41fd4ec: 9799592d     	bl	0x28539a0 <_ChromeMain+0x284e704>
 41fd4f0: f9400e95     	ldr	x21, [x20, #0x18]
 41fd4f4: 3983fe79     	ldrsb	x25, [x19, #0xff]
 41fd4f8: b6f80f39     	tbz	x25, #0x3f, 0x41fd6dc <_ChromeMain+0x41f8440>
 41fd4fc: f9407a79     	ldr	x25, [x19, #0xf0]
 41fd500: eb18033f     	cmp	x25, x24
 41fd504: 540011e8     	b.hi	0x41fd740 <_ChromeMain+0x41f84a4>
 41fd508: f9407676     	ldr	x22, [x19, #0xe8]
 41fd50c: f1002b3f     	cmp	x25, #0xa
 41fd510: 54000f49     	b.ls	0x41fd6f8 <_ChromeMain+0x41f845c>
 41fd514: 927def3a     	and	x26, x25, #0x7ffffffffffffff8
 41fd518: d37ffb48     	lsl	x8, x26, #1
 41fd51c: 91004100     	add	x0, x8, #0x10
 41fd520: 96f84792     	bl	0xf368 <_ChromeMain+0xa0cc>
 41fd524: aa0003f7     	mov	x23, x0
 41fd528: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 41fd52c: cb080348     	sub	x8, x26, x8
 41fd530: a900e7e0     	stp	x0, x25, [sp, #0x8]
 41fd534: f9000fe8     	str	x8, [sp, #0x18]
 41fd538: 8b1906e8     	add	x8, x23, x25, lsl #1
 41fd53c: eb17011f     	cmp	x8, x23
 41fd540: 54000fe3     	b.lo	0x41fd73c <_ChromeMain+0x41f84a0>
 41fd544: eb1602ff     	cmp	x23, x22
 41fd548: fa569100     	ccmp	x8, x22, #0x0, ls
 41fd54c: 54000f88     	b.hi	0x41fd73c <_ChromeMain+0x41f84a0>
 41fd550: d37ffb22     	lsl	x2, x25, #1
 41fd554: aa1703e0     	mov	x0, x23
 41fd558: aa1603e1     	mov	x1, x22
 41fd55c: 94f8475c     	bl	0x800f2cc <_ChromeMain+0x800a030>
 41fd560: 78397aff     	strh	wzr, [x23, x25, lsl #1]
 41fd564: 910023e1     	add	x1, sp, #0x8
 41fd568: aa1503e0     	mov	x0, x21
 41fd56c: 971924f6     	bl	0x846944 <_ChromeMain+0x8416a8>
 41fd570: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 41fd574: 36f800a8     	tbz	w8, #0x1f, 0x41fd588 <_ChromeMain+0x41f82ec>
 41fd578: f94007e0     	ldr	x0, [sp, #0x8]
 41fd57c: f9400fe8     	ldr	x8, [sp, #0x18]
 41fd580: d37ff901     	lsl	x1, x8, #1
 41fd584: 96f82e4d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41fd588: f9400e96     	ldr	x22, [x20, #0x18]
 41fd58c: f94166d5     	ldr	x21, [x22, #0x2c8]
 41fd590: b4000c55     	cbz	x21, 0x41fd718 <_ChromeMain+0x41f847c>
 41fd594: 39839e79     	ldrsb	x25, [x19, #0xe7]
 41fd598: b7f80a79     	tbnz	x25, #0x3f, 0x41fd6e4 <_ChromeMain+0x41f8448>
 41fd59c: 91034276     	add	x22, x19, #0xd0
 41fd5a0: f1002b3f     	cmp	x25, #0xa
 41fd5a4: 54000b09     	b.ls	0x41fd704 <_ChromeMain+0x41f8468>
 41fd5a8: 927def38     	and	x24, x25, #0x7ffffffffffffff8
 41fd5ac: d37ffb08     	lsl	x8, x24, #1
 41fd5b0: 91004100     	add	x0, x8, #0x10
 41fd5b4: 96f8476d     	bl	0xf368 <_ChromeMain+0xa0cc>
 41fd5b8: aa0003f7     	mov	x23, x0
 41fd5bc: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 41fd5c0: cb080308     	sub	x8, x24, x8
 41fd5c4: a902e7e0     	stp	x0, x25, [sp, #0x28]
 41fd5c8: f9001fe8     	str	x8, [sp, #0x38]
 41fd5cc: 8b1906e8     	add	x8, x23, x25, lsl #1
 41fd5d0: eb17011f     	cmp	x8, x23
 41fd5d4: 54000b43     	b.lo	0x41fd73c <_ChromeMain+0x41f84a0>
 41fd5d8: eb1602ff     	cmp	x23, x22
 41fd5dc: 54000068     	b.hi	0x41fd5e8 <_ChromeMain+0x41f834c>
 41fd5e0: eb16011f     	cmp	x8, x22
 41fd5e4: 54000ac8     	b.hi	0x41fd73c <_ChromeMain+0x41f84a0>
 41fd5e8: d37ffb22     	lsl	x2, x25, #1
 41fd5ec: aa1703e0     	mov	x0, x23
 41fd5f0: aa1603e1     	mov	x1, x22
 41fd5f4: 94f84736     	bl	0x800f2cc <_ChromeMain+0x800a030>
 41fd5f8: 78397aff     	strh	wzr, [x23, x25, lsl #1]
 41fd5fc: 9100a3e1     	add	x1, sp, #0x28
 41fd600: aa1503e0     	mov	x0, x21
 41fd604: 973dc0b5     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 41fd608: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 41fd60c: 36f800a8     	tbz	w8, #0x1f, 0x41fd620 <_ChromeMain+0x41f8384>
 41fd610: f94017e0     	ldr	x0, [sp, #0x28]
 41fd614: f9401fe8     	ldr	x8, [sp, #0x38]
 41fd618: d37ff901     	lsl	x1, x8, #1
 41fd61c: 96f82e27     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41fd620: 39448268     	ldrb	w8, [x19, #0x120]
 41fd624: 350004e8     	cbnz	w8, 0x41fd6c0 <_ChromeMain+0x41f8424>
 41fd628: f9408268     	ldr	x8, [x19, #0x100]
 41fd62c: b40004a8     	cbz	x8, 0x41fd6c0 <_ChromeMain+0x41f8424>
 41fd630: f9400e94     	ldr	x20, [x20, #0x18]
 41fd634: 910023e8     	add	x8, sp, #0x8
 41fd638: 91040260     	add	x0, x19, #0x100
 41fd63c: 97192946     	bl	0x847b54 <_ChromeMain+0x8428b8>
 41fd640: b11b629f     	cmn	x20, #0x6d8
 41fd644: 540007c0     	b.eq	0x41fd73c <_ChromeMain+0x41f84a0>
 41fd648: f94007e8     	ldr	x8, [sp, #0x8]
 41fd64c: f9036e88     	str	x8, [x20, #0x6d8]
 41fd650: f9037288     	str	x8, [x20, #0x6e0]
 41fd654: 52800028     	mov	w8, #0x1                ; =1
 41fd658: 391ba288     	strb	w8, [x20, #0x6e8]
 41fd65c: f9400288     	ldr	x8, [x20]
 41fd660: f9403108     	ldr	x8, [x8, #0x60]
 41fd664: aa1403e0     	mov	x0, x20
 41fd668: d63f0100     	blr	x8
 41fd66c: b4000120     	cbz	x0, 0x41fd690 <_ChromeMain+0x41f83f4>
 41fd670: f9400008     	ldr	x8, [x0]
 41fd674: f940d508     	ldr	x8, [x8, #0x1a8]
 41fd678: d63f0100     	blr	x8
 41fd67c: b40000a0     	cbz	x0, 0x41fd690 <_ChromeMain+0x41f83f4>
 41fd680: f9400288     	ldr	x8, [x20]
 41fd684: f9426508     	ldr	x8, [x8, #0x4c8]
 41fd688: aa1403e0     	mov	x0, x20
 41fd68c: d63f0100     	blr	x8
 41fd690: f94013e0     	ldr	x0, [sp, #0x20]
 41fd694: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41fd698: b0054db3     	adrp	x19, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41fd69c: f9404669     	ldr	x9, [x19, #0x88]
 41fd6a0: eb09011f     	cmp	x8, x9
 41fd6a4: 54000500     	b.eq	0x41fd744 <_ChromeMain+0x41f84a8>
 41fd6a8: f90013ff     	str	xzr, [sp, #0x20]
 41fd6ac: f94007e0     	ldr	x0, [sp, #0x8]
 41fd6b0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41fd6b4: f9404669     	ldr	x9, [x19, #0x88]
 41fd6b8: eb09011f     	cmp	x8, x9
 41fd6bc: 540002a0     	b.eq	0x41fd710 <_ChromeMain+0x41f8474>
 41fd6c0: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 41fd6c4: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 41fd6c8: a94657f6     	ldp	x22, x21, [sp, #0x60]
 41fd6cc: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 41fd6d0: a94467fa     	ldp	x26, x25, [sp, #0x40]
 41fd6d4: 910243ff     	add	sp, sp, #0x90
 41fd6d8: d65f03c0     	ret
 41fd6dc: 9103a276     	add	x22, x19, #0xe8
 41fd6e0: 17ffff8b     	b	0x41fd50c <_ChromeMain+0x41f8270>
 41fd6e4: f9406e79     	ldr	x25, [x19, #0xd8]
 41fd6e8: eb18033f     	cmp	x25, x24
 41fd6ec: 540002a8     	b.hi	0x41fd740 <_ChromeMain+0x41f84a4>
 41fd6f0: f9406a76     	ldr	x22, [x19, #0xd0]
 41fd6f4: 17ffffab     	b	0x41fd5a0 <_ChromeMain+0x41f8304>
 41fd6f8: 39007ff9     	strb	w25, [sp, #0x1f]
 41fd6fc: 910023f7     	add	x23, sp, #0x8
 41fd700: 17ffff8e     	b	0x41fd538 <_ChromeMain+0x41f829c>
 41fd704: 3900fff9     	strb	w25, [sp, #0x3f]
 41fd708: 9100a3f7     	add	x23, sp, #0x28
 41fd70c: 17ffffb0     	b	0x41fd5cc <_ChromeMain+0x41f8330>
 41fd710: 96f894cb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41fd714: 17ffffeb     	b	0x41fd6c0 <_ChromeMain+0x41f8424>
 41fd718: 9733a27a     	bl	0xee6100 <_ChromeMain+0xee0e64>
 41fd71c: 35000220     	cbnz	w0, 0x41fd760 <_ChromeMain+0x41f84c4>
 41fd720: aa1603e0     	mov	x0, x22
 41fd724: 974383cc     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 41fd728: aa0003f5     	mov	x21, x0
 41fd72c: f94166c0     	ldr	x0, [x22, #0x2c8]
 41fd730: f90166d5     	str	x21, [x22, #0x2c8]
 41fd734: b4fff300     	cbz	x0, 0x41fd594 <_ChromeMain+0x41f82f8>
 41fd738: 14000005     	b	0x41fd74c <_ChromeMain+0x41f84b0>
 41fd73c: d4200020     	brk	#0x1
 41fd740: 942c9a9a     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 41fd744: 96f894be     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41fd748: 17ffffd8     	b	0x41fd6a8 <_ChromeMain+0x41f840c>
 41fd74c: f9400008     	ldr	x8, [x0]
 41fd750: f9400508     	ldr	x8, [x8, #0x8]
 41fd754: d63f0100     	blr	x8
 41fd758: f94166d5     	ldr	x21, [x22, #0x2c8]
 41fd75c: 17ffff8e     	b	0x41fd594 <_ChromeMain+0x41f82f8>
 41fd760: 52803600     	mov	w0, #0x1b0              ; =432
 41fd764: 96f84701     	bl	0xf368 <_ChromeMain+0xa0cc>
 41fd768: aa0003f5     	mov	x21, x0
 41fd76c: aa1603e1     	mov	x1, x22
 41fd770: 9733a104     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 41fd774: 17ffffee     	b	0x41fd72c <_ChromeMain+0x41f8490>
		...
 41fd780: f9400008     	ldr	x8, [x0]
 41fd784: f9400109     	ldr	x9, [x8]
 41fd788: b5000089     	cbnz	x9, 0x41fd798 <_ChromeMain+0x41f84fc>
 41fd78c: d65f03c0     	ret
 41fd790: f9400fe8     	ldr	x8, [sp, #0x18]
 41fd794: 14000017     	b	0x41fd7f0 <_ChromeMain+0x41f8554>
 41fd798: d10103ff     	sub	sp, sp, #0x40
 41fd79c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 41fd7a0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 41fd7a4: 9100c3fd     	add	x29, sp, #0x30
 41fd7a8: a90127e8     	stp	x8, x9, [sp, #0x10]
 41fd7ac: f90007e0     	str	x0, [sp, #0x8]
 41fd7b0: f9400508     	ldr	x8, [x8, #0x8]
 41fd7b4: 8b080509     	add	x9, x8, x8, lsl #1
 41fd7b8: d37be929     	lsl	x9, x9, #5
 41fd7bc: b4fffea9     	cbz	x9, 0x41fd790 <_ChromeMain+0x41f84f4>
