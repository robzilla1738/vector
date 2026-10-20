
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 424464c: d10103ff     	sub	sp, sp, #0x40
 4244650: a90157f6     	stp	x22, x21, [sp, #0x10]
 4244654: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4244658: a9037bfd     	stp	x29, x30, [sp, #0x30]
 424465c: 9100c3fd     	add	x29, sp, #0x30
 4244660: aa0103f4     	mov	x20, x1
 4244664: aa0003f3     	mov	x19, x0
 4244668: 3918c001     	strb	w1, [x0, #0x630]
 424466c: f9426400     	ldr	x0, [x0, #0x4c8]
 4244670: f9400008     	ldr	x8, [x0]
 4244674: f9405108     	ldr	x8, [x8, #0xa0]
 4244678: 52000021     	eor	w1, w1, #0x1
 424467c: d63f0100     	blr	x8
 4244680: f9431e60     	ldr	x0, [x19, #0x638]
 4244684: b4000320     	cbz	x0, 0x42446e8 <_ChromeMain+0x423f44c>
 4244688: 3958c268     	ldrb	w8, [x19, #0x630]
 424468c: 350001c8     	cbnz	w8, 0x42446c4 <_ChromeMain+0x423f428>
 4244690: b943be68     	ldr	w8, [x19, #0x3bc]
 4244694: 7100051f     	cmp	w8, #0x1
 4244698: 540000e0     	b.eq	0x42446b4 <_ChromeMain+0x423f418>
 424469c: 7100091f     	cmp	w8, #0x2
 42446a0: 1a9f17e1     	cset	w1, eq
 42446a4: 39472008     	ldrb	w8, [x0, #0x1c8]
 42446a8: 6b08003f     	cmp	w1, w8
 42446ac: 540001e0     	b.eq	0x42446e8 <_ChromeMain+0x423f44c>
 42446b0: 14000008     	b	0x42446d0 <_ChromeMain+0x423f434>
 42446b4: 39472008     	ldrb	w8, [x0, #0x1c8]
 42446b8: 37000188     	tbnz	w8, #0x0, 0x42446e8 <_ChromeMain+0x423f44c>
 42446bc: 52800021     	mov	w1, #0x1                ; =1
 42446c0: 14000004     	b	0x42446d0 <_ChromeMain+0x423f434>
 42446c4: 39472008     	ldrb	w8, [x0, #0x1c8]
 42446c8: 36000108     	tbz	w8, #0x0, 0x42446e8 <_ChromeMain+0x423f44c>
 42446cc: 52800001     	mov	w1, #0x0                ; =0
 42446d0: f9400008     	ldr	x8, [x0]
 42446d4: f9405108     	ldr	x8, [x8, #0xa0]
 42446d8: d63f0100     	blr	x8
 42446dc: aa1303e0     	mov	x0, x19
 42446e0: 52800001     	mov	w1, #0x0                ; =0
 42446e4: 970faf64     	bl	0x630474 <_ChromeMain+0x62b1d8>
 42446e8: f9410260     	ldr	x0, [x19, #0x200]
 42446ec: b9410808     	ldr	w8, [x0, #0x108]
 42446f0: 6b14011f     	cmp	w8, w20
 42446f4: 54000080     	b.eq	0x4244704 <_ChromeMain+0x423f468>
 42446f8: b9010814     	str	w20, [x0, #0x108]
 42446fc: 52800021     	mov	w1, #0x1                ; =1
 4244700: 976082ec     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4244704: f9426260     	ldr	x0, [x19, #0x4c0]
 4244708: f9400008     	ldr	x8, [x0]
 424470c: f9400d08     	ldr	x8, [x8, #0x18]
 4244710: d63f0100     	blr	x8
 4244714: 370002b4     	tbnz	w20, #0x0, 0x4244768 <_ChromeMain+0x423f4cc>
 4244718: 9004e7e8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 424471c: 3dc02500     	ldr	q0, [x8, #0x90]
 4244720: 3d8003e0     	str	q0, [sp]
 4244724: b0053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4244728: 91122021     	add	x1, x1, #0x488
 424472c: 91036000     	add	x0, x0, #0xd8
 4244730: 910003e2     	mov	x2, sp
 4244734: 9762a5cb     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4244738: 3957be68     	ldrb	w8, [x19, #0x5ef]
 424473c: 52800115     	mov	w21, #0x8               ; =8
 4244740: 37000788     	tbnz	w8, #0x0, 0x4244830 <_ChromeMain+0x423f594>
 4244744: 14000012     	b	0x424478c <_ChromeMain+0x423f4f0>
 4244748: b905f674     	str	w20, [x19, #0x5f4]
 424474c: aa1303e0     	mov	x0, x19
 4244750: 52800021     	mov	w1, #0x1                ; =1
 4244754: 97167484     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4244758: 9103e260     	add	x0, x19, #0xf8
 424475c: 9117d261     	add	x1, x19, #0x5f4
 4244760: 97338e1c     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4244764: 1400000d     	b	0x4244798 <_ChromeMain+0x423f4fc>
 4244768: a9007fff     	stp	xzr, xzr, [sp]
 424476c: b0053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4244770: 91122021     	add	x1, x1, #0x488
 4244774: 91036000     	add	x0, x0, #0xd8
 4244778: 910003e2     	mov	x2, sp
 424477c: 9762a5b9     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4244780: 52800015     	mov	w21, #0x0               ; =0
 4244784: 3957be68     	ldrb	w8, [x19, #0x5ef]
 4244788: 36000548     	tbz	w8, #0x0, 0x4244830 <_ChromeMain+0x423f594>
 424478c: b945f668     	ldr	w8, [x19, #0x5f4]
 4244790: 6b14011f     	cmp	w8, w20
 4244794: 54fffda1     	b.ne	0x4244748 <_ChromeMain+0x423f4ac>
 4244798: b945f268     	ldr	w8, [x19, #0x5f0]
 424479c: 6b15011f     	cmp	w8, w21
 42447a0: 54000100     	b.eq	0x42447c0 <_ChromeMain+0x423f524>
 42447a4: b905f275     	str	w21, [x19, #0x5f0]
 42447a8: aa1303e0     	mov	x0, x19
 42447ac: 52800061     	mov	w1, #0x3                ; =3
 42447b0: 9716746d     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 42447b4: 9103e260     	add	x0, x19, #0xf8
 42447b8: 9117c261     	add	x1, x19, #0x5f0
 42447bc: 97338e05     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 42447c0: 52800400     	mov	w0, #0x20               ; =32
 42447c4: 96f72ae9     	bl	0xf368 <_ChromeMain+0xa0cc>
 42447c8: aa0003e1     	mov	x1, x0
 42447cc: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 42447d0: b9000808     	str	w8, [x0, #0x8]
 42447d4: 52800028     	mov	w8, #0x1                ; =1
 42447d8: 39003008     	strb	w8, [x0, #0xc]
 42447dc: 90050848     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 42447e0: 91044108     	add	x8, x8, #0x110
 42447e4: f9000008     	str	x8, [x0]
 42447e8: d28000c8     	mov	x8, #0x6                ; =6
 42447ec: f2c00108     	movk	x8, #0x8, lsl #32
 42447f0: 4e080d00     	dup.2d	v0, x8
 42447f4: 3d800400     	str	q0, [x0, #0x10]
 42447f8: f9400268     	ldr	x8, [x19]
 42447fc: f9408908     	ldr	x8, [x8, #0x110]
 4244800: aa1303e0     	mov	x0, x19
 4244804: d63f0100     	blr	x8
 4244808: aa1303e0     	mov	x0, x19
 424480c: 52800001     	mov	w1, #0x0                ; =0
 4244810: 970faf19     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4244814: aa1303e0     	mov	x0, x19
 4244818: 970d7259     	bl	0x5a117c <_ChromeMain+0x59bee0>
 424481c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4244820: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4244824: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4244828: 910103ff     	add	sp, sp, #0x40
 424482c: d65f03c0     	ret
 4244830: 3917be74     	strb	w20, [x19, #0x5ef]
 4244834: aa1303e0     	mov	x0, x19
 4244838: 52800021     	mov	w1, #0x1                ; =1
 424483c: 9716744a     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4244840: 9103e260     	add	x0, x19, #0xf8
 4244844: 9117be61     	add	x1, x19, #0x5ef
 4244848: 97338de2     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 424484c: 17ffffd0     	b	0x424478c <_ChromeMain+0x423f4f0>
 4244850: d10143ff     	sub	sp, sp, #0x50
 4244854: a90257f6     	stp	x22, x21, [sp, #0x20]
 4244858: a9034ff4     	stp	x20, x19, [sp, #0x30]
 424485c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4244860: 910103fd     	add	x29, sp, #0x40
 4244864: b4000c82     	cbz	x2, 0x42449f4 <_ChromeMain+0x423f758>
 4244868: aa0203f5     	mov	x21, x2
 424486c: aa0103f6     	mov	x22, x1
 4244870: aa0003f3     	mov	x19, x0
 4244874: f9431c00     	ldr	x0, [x0, #0x638]
 4244878: b40001e0     	cbz	x0, 0x42448b4 <_ChromeMain+0x423f618>
 424487c: f9400008     	ldr	x8, [x0]
 4244880: f941f103     	ldr	x3, [x8, #0x3e0]
 4244884: aa1603e1     	mov	x1, x22
 4244888: aa1503e2     	mov	x2, x21
 424488c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4244890: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4244894: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4244898: 910143ff     	add	sp, sp, #0x50
 424489c: d61f0060     	br	x3
 42448a0: 52800008     	mov	w8, #0x0                ; =0
 42448a4: 52801c49     	mov	w9, #0xe2               ; =226
 42448a8: b90013e9     	str	w9, [sp, #0x10]
 42448ac: 910043e1     	add	x1, sp, #0x10
 42448b0: 1400001f     	b	0x424492c <_ChromeMain+0x423f690>
 42448b4: d0056628     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 42448b8: 91120108     	add	x8, x8, #0x480
 42448bc: f8bfc100     	ldapr	x0, [x8]
 42448c0: b4000b80     	cbz	x0, 0x4244a30 <_ChromeMain+0x423f794>
 42448c4: 52808c01     	mov	w1, #0x460              ; =1120
 42448c8: d2800002     	mov	x2, #0x0                ; =0
 42448cc: 96f99b39     	bl	0xab5b0 <_ChromeMain+0xa6314>
 42448d0: aa0003f4     	mov	x20, x0
 42448d4: aa1603e1     	mov	x1, x22
 42448d8: aa1503e2     	mov	x2, x21
 42448dc: 528000a3     	mov	w3, #0x5                ; =5
 42448e0: 52820004     	mov	w4, #0x1000             ; =4096
 42448e4: 52800005     	mov	w5, #0x0                ; =0
 42448e8: 976517fe     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 42448ec: 3946a408     	ldrb	w8, [x0, #0x1a9]
 42448f0: 340000a8     	cbz	w8, 0x4244904 <_ChromeMain+0x423f668>
 42448f4: 3906a69f     	strb	wzr, [x20, #0x1a9]
 42448f8: 9103e280     	add	x0, x20, #0xf8
 42448fc: 9106a681     	add	x1, x20, #0x1a9
 4244900: 97338db4     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4244904: aa1303e0     	mov	x0, x19
 4244908: 970d71ba     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 424490c: b4fffca0     	cbz	x0, 0x42448a0 <_ChromeMain+0x423f604>
 4244910: 52801c41     	mov	w1, #0xe2               ; =226
 4244914: 97338e2d     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 4244918: 52b32008     	mov	w8, #-0x67000000        ; =-1728053248
 424491c: 33005c08     	bfxil	w8, w0, #0, #24
 4244920: b9001be8     	str	w8, [sp, #0x18]
 4244924: 52800028     	mov	w8, #0x1                ; =1
 4244928: 910063e1     	add	x1, sp, #0x18
 424492c: 39001028     	strb	w8, [x1, #0x4]
 4244930: f9400288     	ldr	x8, [x20]
 4244934: f941f508     	ldr	x8, [x8, #0x3e8]
 4244938: aa1403e0     	mov	x0, x20
 424493c: d63f0100     	blr	x8
 4244940: 394eda88     	ldrb	w8, [x20, #0x3b6]
 4244944: 35000628     	cbnz	w8, 0x4244a08 <_ChromeMain+0x423f76c>
 4244948: aa1403e0     	mov	x0, x20
 424494c: 52800001     	mov	w1, #0x0                ; =0
 4244950: 9793ea88     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 4244954: f9426668     	ldr	x8, [x19, #0x4c8]
 4244958: f941ad08     	ldr	x8, [x8, #0x358]
 424495c: f9400289     	ldr	x9, [x20]
 4244960: f941ed29     	ldr	x9, [x9, #0x3d8]
 4244964: 91012101     	add	x1, x8, #0x48
 4244968: aa1403e0     	mov	x0, x20
 424496c: d63f0120     	blr	x9
 4244970: 9004e7e8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4244974: 3dc31900     	ldr	q0, [x8, #0xc60]
 4244978: 3d8003e0     	str	q0, [sp]
 424497c: b0053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4244980: 91122021     	add	x1, x1, #0x488
 4244984: 91036280     	add	x0, x20, #0xd8
 4244988: 910003e2     	mov	x2, sp
 424498c: 9762a535     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4244990: f9400288     	ldr	x8, [x20]
 4244994: f9405108     	ldr	x8, [x8, #0xa0]
 4244998: aa1403e0     	mov	x0, x20
 424499c: 52800001     	mov	w1, #0x0                ; =0
 42449a0: d63f0100     	blr	x8
 42449a4: 3945a688     	ldrb	w8, [x20, #0x169]
 42449a8: 35000488     	cbnz	w8, 0x4244a38 <_ChromeMain+0x423f79c>
 42449ac: f940ce62     	ldr	x2, [x19, #0x198]
 42449b0: aa1303e0     	mov	x0, x19
 42449b4: aa1403e1     	mov	x1, x20
 42449b8: 9714d291     	bl	0x7793fc <_ChromeMain+0x774160>
 42449bc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 42449c0: d0054b75     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 42449c4: f94046a9     	ldr	x9, [x21, #0x88]
 42449c8: eb09011f     	cmp	x8, x9
 42449cc: 54000061     	b.ne	0x42449d8 <_ChromeMain+0x423f73c>
 42449d0: aa1403e0     	mov	x0, x20
 42449d4: 96f73e4a     	bl	0x142fc <_ChromeMain+0xf060>
 42449d8: f9431e60     	ldr	x0, [x19, #0x638]
 42449dc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 42449e0: f94046a9     	ldr	x9, [x21, #0x88]
 42449e4: eb09011f     	cmp	x8, x9
 42449e8: 54000041     	b.ne	0x42449f0 <_ChromeMain+0x423f754>
 42449ec: 96f77814     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 42449f0: f9031e74     	str	x20, [x19, #0x638]
 42449f4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 42449f8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 42449fc: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4244a00: 910143ff     	add	sp, sp, #0x50
 4244a04: d65f03c0     	ret
 4244a08: 390eda9f     	strb	wzr, [x20, #0x3b6]
 4244a0c: aa1403e0     	mov	x0, x20
 4244a10: 97338e3e     	bl	0xf28308 <_ChromeMain+0xf2306c>
 4244a14: aa1403e0     	mov	x0, x20
 4244a18: 52800041     	mov	w1, #0x2                ; =2
 4244a1c: 971673d2     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4244a20: 9103e280     	add	x0, x20, #0xf8
 4244a24: 910eda81     	add	x1, x20, #0x3b6
 4244a28: 97338d6a     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4244a2c: 17ffffc7     	b	0x4244948 <_ChromeMain+0x423f6ac>
 4244a30: 94023b32     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4244a34: 17ffffa4     	b	0x42448c4 <_ChromeMain+0x423f628>
 4244a38: d4200000     	brk	#0
 4244a3c: d4400000     	hlt	#0
 4244a40: d4200020     	brk	#0x1
