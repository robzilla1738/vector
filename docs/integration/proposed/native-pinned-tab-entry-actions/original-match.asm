
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4606510: d104c3ff     	sub	sp, sp, #0x130
 4606514: a9106ffc     	stp	x28, x27, [sp, #0x100]
 4606518: a9114ff4     	stp	x20, x19, [sp, #0x110]
 460651c: a9127bfd     	stp	x29, x30, [sp, #0x120]
 4606520: 910483fd     	add	x29, sp, #0x120
 4606524: aa0103f4     	mov	x20, x1
 4606528: b40000e1     	cbz	x1, 0x4606544 <_ChromeMain+0x46012a8>
 460652c: 39418688     	ldrb	w8, [x20, #0x61]
 4606530: 34000088     	cbz	w8, 0x4606540 <_ChromeMain+0x46012a4>
 4606534: aa0203f3     	mov	x19, x2
 4606538: 39406048     	ldrb	w8, [x2, #0x18]
 460653c: 35000108     	cbnz	w8, 0x460655c <_ChromeMain+0x46012c0>
 4606540: 52800014     	mov	w20, #0x0               ; =0
 4606544: aa1403e0     	mov	x0, x20
 4606548: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 460654c: a9514ff4     	ldp	x20, x19, [sp, #0x110]
 4606550: a9506ffc     	ldp	x28, x27, [sp, #0x100]
 4606554: 9104c3ff     	add	sp, sp, #0x130
 4606558: d65f03c0     	ret
 460655c: f9402288     	ldr	x8, [x20, #0x40]
 4606560: b4ffff08     	cbz	x8, 0x4606540 <_ChromeMain+0x46012a4>
 4606564: 6f00e400     	movi.2d	v0, #0000000000000000
 4606568: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 460656c: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 4606570: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 4606574: ad0403e0     	stp	q0, q0, [sp, #0x80]
 4606578: d0052661     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 460657c: 9126c021     	add	x1, x1, #0x9b0
 4606580: 91002100     	add	x0, x8, #0x8
 4606584: 96e932fb     	bl	0x53170 <_ChromeMain+0x4ded4>
 4606588: b4000080     	cbz	x0, 0x4606598 <_ChromeMain+0x46012fc>
 460658c: aa0003e8     	mov	x8, x0
 4606590: 39408009     	ldrb	w9, [x0, #0x20]
 4606594: 35000f89     	cbnz	w9, 0x4606784 <_ChromeMain+0x46014e8>
 4606598: 390203ff     	strb	wzr, [sp, #0x80]
 460659c: 3903e3ff     	strb	wzr, [sp, #0xf8]
 46065a0: f9402288     	ldr	x8, [x20, #0x40]
 46065a4: b4000a88     	cbz	x8, 0x46066f4 <_ChromeMain+0x4601458>
 46065a8: f9003bff     	str	xzr, [sp, #0x70]
 46065ac: 6f00e400     	movi.2d	v0, #0000000000000000
 46065b0: ad0283e0     	stp	q0, q0, [sp, #0x50]
 46065b4: ad0183e0     	stp	q0, q0, [sp, #0x30]
 46065b8: ad0083e0     	stp	q0, q0, [sp, #0x10]
 46065bc: 3d8003e0     	str	q0, [sp]
 46065c0: f9414909     	ldr	x9, [x8, #0x290]
 46065c4: b5001269     	cbnz	x9, 0x4606810 <_ChromeMain+0x4601574>
 46065c8: f9413109     	ldr	x9, [x8, #0x260]
 46065cc: f9401d2a     	ldr	x10, [x9, #0x38]
 46065d0: f0ffd1eb     	adrp	x11, 0x4045000 <_ChromeMain+0x403fd64>
 46065d4: 913c816b     	add	x11, x11, #0xf20
 46065d8: b982b509     	ldrsw	x9, [x8, #0x2b4]
 46065dc: eb0b015f     	cmp	x10, x11
 46065e0: 54001461     	b.ne	0x460686c <_ChromeMain+0x46015d0>
 46065e4: 3100053f     	cmn	w9, #0x1
 46065e8: 54001660     	b.eq	0x46068b4 <_ChromeMain+0x4601618>
 46065ec: f941410a     	ldr	x10, [x8, #0x280]
 46065f0: eb09015f     	cmp	x10, x9
 46065f4: 54001509     	b.ls	0x4606894 <_ChromeMain+0x46015f8>
 46065f8: f9413d08     	ldr	x8, [x8, #0x278]
 46065fc: f8697909     	ldr	x9, [x8, x9, lsl #3]
 4606600: b4001549     	cbz	x9, 0x46068a8 <_ChromeMain+0x460160c>
 4606604: 3980fd28     	ldrsb	x8, [x9, #0x3f]
 4606608: b7f81488     	tbnz	x8, #0x3f, 0x4606898 <_ChromeMain+0x46015fc>
 460660c: b50014a8     	cbnz	x8, 0x46068a0 <_ChromeMain+0x4601604>
 4606610: f9400d28     	ldr	x8, [x9, #0x18]
 4606614: f9400508     	ldr	x8, [x8, #0x8]
 4606618: 91018101     	add	x1, x8, #0x60
 460661c: 910003e0     	mov	x0, sp
 4606620: 96ecce5d     	bl	0x139f94 <_ChromeMain+0x134cf8>
 4606624: 394063e8     	ldrb	w8, [sp, #0x18]
 4606628: 370002a8     	tbnz	w8, #0x0, 0x460667c <_ChromeMain+0x46013e0>
 460662c: f9402288     	ldr	x8, [x20, #0x40]
 4606630: b982b509     	ldrsw	x9, [x8, #0x2b4]
 4606634: 3100053f     	cmn	w9, #0x1
 4606638: 540014c0     	b.eq	0x46068d0 <_ChromeMain+0x4601634>
 460663c: f941410a     	ldr	x10, [x8, #0x280]
 4606640: eb09015f     	cmp	x10, x9
 4606644: 54001289     	b.ls	0x4606894 <_ChromeMain+0x46015f8>
 4606648: f9413d08     	ldr	x8, [x8, #0x278]
 460664c: f8697908     	ldr	x8, [x8, x9, lsl #3]
 4606650: b4001468     	cbz	x8, 0x46068dc <_ChromeMain+0x4601640>
 4606654: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 4606658: b7f81349     	tbnz	x9, #0x3f, 0x46068c0 <_ChromeMain+0x4601624>
 460665c: b5001369     	cbnz	x9, 0x46068c8 <_ChromeMain+0x460162c>
 4606660: f9400d08     	ldr	x8, [x8, #0x18]
 4606664: f9400508     	ldr	x8, [x8, #0x8]
 4606668: 91018101     	add	x1, x8, #0x60
 460666c: 910003e0     	mov	x0, sp
 4606670: 96fb14a7     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 4606674: 394063e8     	ldrb	w8, [sp, #0x18]
 4606678: 14000002     	b	0x4606680 <_ChromeMain+0x46013e4>
 460667c: 52800028     	mov	w8, #0x1                ; =1
 4606680: 52800014     	mov	w20, #0x0               ; =0
 4606684: 360004a8     	tbz	w8, #0x0, 0x4606718 <_ChromeMain+0x460147c>
 4606688: 39406268     	ldrb	w8, [x19, #0x18]
 460668c: 36000468     	tbz	w8, #0x0, 0x4606718 <_ChromeMain+0x460147c>
 4606690: 39405fe9     	ldrb	w9, [sp, #0x17]
 4606694: 13001d28     	sxtb	w8, w9
 4606698: f94007ea     	ldr	x10, [sp, #0x8]
 460669c: 7100011f     	cmp	w8, #0x0
 46066a0: 9a894142     	csel	x2, x10, x9, mi
 46066a4: 39405e6a     	ldrb	w10, [x19, #0x17]
 46066a8: 13001d49     	sxtb	w9, w10
 46066ac: f940066b     	ldr	x11, [x19, #0x8]
 46066b0: 7100013f     	cmp	w9, #0x0
 46066b4: 9a8a416a     	csel	x10, x11, x10, mi
 46066b8: eb0a005f     	cmp	x2, x10
 46066bc: 54000181     	b.ne	0x46066ec <_ChromeMain+0x4601450>
 46066c0: f94003ea     	ldr	x10, [sp]
 46066c4: 7100011f     	cmp	w8, #0x0
 46066c8: 910003e8     	mov	x8, sp
 46066cc: 9a884140     	csel	x0, x10, x8, mi
 46066d0: f9400268     	ldr	x8, [x19]
 46066d4: 7100013f     	cmp	w9, #0x0
 46066d8: 9a934101     	csel	x1, x8, x19, mi
 46066dc: 94e80c61     	bl	0x8009860 <_ChromeMain+0x80045c4>
 46066e0: 7100001f     	cmp	w0, #0x0
 46066e4: 1a9f17f4     	cset	w20, eq
 46066e8: 1400000c     	b	0x4606718 <_ChromeMain+0x460147c>
 46066ec: 52800014     	mov	w20, #0x0               ; =0
 46066f0: 1400000a     	b	0x4606718 <_ChromeMain+0x460147c>
 46066f4: 52800014     	mov	w20, #0x0               ; =0
 46066f8: a9007fff     	stp	xzr, xzr, [sp]
 46066fc: b80173ff     	stur	wzr, [sp, #0x17]
 4606700: f9000bff     	str	xzr, [sp, #0x10]
 4606704: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 4606708: ad0103e0     	stp	q0, q0, [sp, #0x20]
 460670c: ad0203e0     	stp	q0, q0, [sp, #0x40]
 4606710: 7900c3ff     	strh	wzr, [sp, #0x60]
 4606714: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 4606718: 910003f3     	mov	x19, sp
 460671c: 9101c260     	add	x0, x19, #0x70
 4606720: d2800001     	mov	x1, #0x0                ; =0
 4606724: 96e88565     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4606728: 91008260     	add	x0, x19, #0x20
 460672c: 96e88553     	bl	0x27c78 <_ChromeMain+0x229dc>
 4606730: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4606734: 36f800a8     	tbz	w8, #0x1f, 0x4606748 <_ChromeMain+0x46014ac>
 4606738: f94003e0     	ldr	x0, [sp]
 460673c: f9400be8     	ldr	x8, [sp, #0x10]
 4606740: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4606744: 96e809dd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4606748: 3943e3e8     	ldrb	w8, [sp, #0xf8]
 460674c: 34ffefc8     	cbz	w8, 0x4606544 <_ChromeMain+0x46012a8>
 4606750: 910203f3     	add	x19, sp, #0x80
 4606754: 9101c260     	add	x0, x19, #0x70
 4606758: d2800001     	mov	x1, #0x0                ; =0
 460675c: 96e88557     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4606760: 91008260     	add	x0, x19, #0x20
 4606764: 96e88545     	bl	0x27c78 <_ChromeMain+0x229dc>
 4606768: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 460676c: 36ffeec8     	tbz	w8, #0x1f, 0x4606544 <_ChromeMain+0x46012a8>
 4606770: f94043e0     	ldr	x0, [sp, #0x80]
 4606774: f9404be8     	ldr	x8, [sp, #0x90]
 4606778: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460677c: 96e809cf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4606780: 17ffff71     	b	0x4606544 <_ChromeMain+0x46012a8>
 4606784: 910203e0     	add	x0, sp, #0x80
 4606788: 91002101     	add	x1, x8, #0x8
 460678c: 96ecce02     	bl	0x139f94 <_ChromeMain+0x134cf8>
 4606790: 52800014     	mov	w20, #0x0               ; =0
 4606794: 52800028     	mov	w8, #0x1                ; =1
 4606798: 3903e3e8     	strb	w8, [sp, #0xf8]
 460679c: 394263e8     	ldrb	w8, [sp, #0x98]
 46067a0: 34fffd88     	cbz	w8, 0x4606750 <_ChromeMain+0x46014b4>
 46067a4: 39406268     	ldrb	w8, [x19, #0x18]
 46067a8: 3607fd48     	tbz	w8, #0x0, 0x4606750 <_ChromeMain+0x46014b4>
 46067ac: 39425fe9     	ldrb	w9, [sp, #0x97]
 46067b0: 13001d28     	sxtb	w8, w9
 46067b4: f94047ea     	ldr	x10, [sp, #0x88]
 46067b8: 7100011f     	cmp	w8, #0x0
 46067bc: 9a894142     	csel	x2, x10, x9, mi
 46067c0: 39405e6a     	ldrb	w10, [x19, #0x17]
 46067c4: 13001d49     	sxtb	w9, w10
 46067c8: f940066b     	ldr	x11, [x19, #0x8]
 46067cc: 7100013f     	cmp	w9, #0x0
 46067d0: 9a8a416a     	csel	x10, x11, x10, mi
 46067d4: eb0a005f     	cmp	x2, x10
 46067d8: 54000181     	b.ne	0x4606808 <_ChromeMain+0x460156c>
 46067dc: f94043ea     	ldr	x10, [sp, #0x80]
 46067e0: 7100011f     	cmp	w8, #0x0
 46067e4: 910203e8     	add	x8, sp, #0x80
 46067e8: 9a884140     	csel	x0, x10, x8, mi
 46067ec: f9400268     	ldr	x8, [x19]
 46067f0: 7100013f     	cmp	w9, #0x0
 46067f4: 9a934101     	csel	x1, x8, x19, mi
 46067f8: 94e80c1a     	bl	0x8009860 <_ChromeMain+0x80045c4>
 46067fc: 7100001f     	cmp	w0, #0x0
 4606800: 1a9f17f4     	cset	w20, eq
 4606804: 17ffffd3     	b	0x4606750 <_ChromeMain+0x46014b4>
 4606808: 52800014     	mov	w20, #0x0               ; =0
 460680c: 17ffffd1     	b	0x4606750 <_ChromeMain+0x46014b4>
 4606810: b942b90a     	ldr	w10, [x8, #0x2b8]
 4606814: 3100055f     	cmn	w10, #0x1
 4606818: 54000341     	b.ne	0x4606880 <_ChromeMain+0x46015e4>
 460681c: 394d212a     	ldrb	w10, [x9, #0x348]
 4606820: 34ffef2a     	cbz	w10, 0x4606604 <_ChromeMain+0x4601368>
 4606824: 394ba10a     	ldrb	w10, [x8, #0x2e8]
 4606828: 34ffed0a     	cbz	w10, 0x46065c8 <_ChromeMain+0x460132c>
 460682c: b982b50a     	ldrsw	x10, [x8, #0x2b4]
 4606830: 3100055f     	cmn	w10, #0x1
 4606834: 540005a0     	b.eq	0x46068e8 <_ChromeMain+0x460164c>
 4606838: f941410b     	ldr	x11, [x8, #0x280]
 460683c: eb0a017f     	cmp	x11, x10
 4606840: 540002a9     	b.ls	0x4606894 <_ChromeMain+0x46015f8>
 4606844: f9413d0b     	ldr	x11, [x8, #0x278]
 4606848: f86a796a     	ldr	x10, [x11, x10, lsl #3]
 460684c: b944314a     	ldr	w10, [x10, #0x430]
 4606850: 7100095f     	cmp	w10, #0x2
 4606854: 54ffeba0     	b.eq	0x46065c8 <_ChromeMain+0x460132c>
 4606858: f941350a     	ldr	x10, [x8, #0x268]
 460685c: b40004ca     	cbz	x10, 0x46068f4 <_ChromeMain+0x4601658>
 4606860: 3945814a     	ldrb	w10, [x10, #0x160]
 4606864: 3707eb2a     	tbnz	w10, #0x0, 0x46065c8 <_ChromeMain+0x460132c>
 4606868: 17ffff67     	b	0x4606604 <_ChromeMain+0x4601368>
 460686c: 3100053f     	cmn	w9, #0x1
 4606870: 54ffebe1     	b.ne	0x46065ec <_ChromeMain+0x4601350>
 4606874: d4200000     	brk	#0
 4606878: d4400000     	hlt	#0
 460687c: d4200020     	brk	#0x1
 4606880: 394ba10a     	ldrb	w10, [x8, #0x2e8]
 4606884: 34ffea2a     	cbz	w10, 0x46065c8 <_ChromeMain+0x460132c>
 4606888: 394d212a     	ldrb	w10, [x9, #0x348]
 460688c: 35ffe9ea     	cbnz	w10, 0x46065c8 <_ChromeMain+0x460132c>
 4606890: 17ffff5d     	b	0x4606604 <_ChromeMain+0x4601368>
 4606894: d4200020     	brk	#0x1
 4606898: f9401928     	ldr	x8, [x9, #0x30]
 460689c: b4ffeba8     	cbz	x8, 0x4606610 <_ChromeMain+0x4601374>
 46068a0: 9100a121     	add	x1, x9, #0x28
 46068a4: 17ffff5e     	b	0x460661c <_ChromeMain+0x4601380>
 46068a8: 97d19074     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 46068ac: aa0003e1     	mov	x1, x0
 46068b0: 17ffff5b     	b	0x460661c <_ChromeMain+0x4601380>
 46068b4: d4200000     	brk	#0
 46068b8: d4400000     	hlt	#0
 46068bc: d4200020     	brk	#0x1
 46068c0: f9401909     	ldr	x9, [x8, #0x30]
 46068c4: b4ffece9     	cbz	x9, 0x4606660 <_ChromeMain+0x46013c4>
 46068c8: 9100a101     	add	x1, x8, #0x28
 46068cc: 17ffff68     	b	0x460666c <_ChromeMain+0x46013d0>
 46068d0: d4200000     	brk	#0
 46068d4: d4400000     	hlt	#0
 46068d8: d4200020     	brk	#0x1
 46068dc: 97d19067     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 46068e0: aa0003e1     	mov	x1, x0
 46068e4: 17ffff62     	b	0x460666c <_ChromeMain+0x46013d0>
 46068e8: d4200000     	brk	#0
 46068ec: d4400000     	hlt	#0
 46068f0: d4200020     	brk	#0x1
 46068f4: d4200000     	brk	#0
 46068f8: d4400000     	hlt	#0
 46068fc: d4200020     	brk	#0x1
 4606900: d503201f     	nop
 4606904: d503201f     	nop
 4606908: d503201f     	nop
 460690c: d503201f     	nop
 4606910: d503201f     	nop
 4606914: d503201f     	nop
 4606918: d503201f     	nop
 460691c: d503201f     	nop
 4606920: d503201f     	nop
 4606924: d503201f     	nop
 4606928: d503201f     	nop
 460692c: d503201f     	nop
 4606930: d503201f     	nop
 4606934: d503201f     	nop
		...
 4606940: d101c3ff     	sub	sp, sp, #0x70
 4606944: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4606948: a90457f6     	stp	x22, x21, [sp, #0x40]
 460694c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4606950: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4606954: 910183fd     	add	x29, sp, #0x60
 4606958: aa0003f4     	mov	x20, x0
 460695c: aa0803f3     	mov	x19, x8
 4606960: f9400028     	ldr	x8, [x1]
 4606964: f90017e8     	str	x8, [sp, #0x28]
 4606968: 9100a3e1     	add	x1, sp, #0x28
 460696c: 9743a5dd     	bl	0x16f00e0 <_ChromeMain+0x16eae44>
 4606970: 39558289     	ldrb	w9, [x20, #0x560]
 4606974: f941b688     	ldr	x8, [x20, #0x368]
 4606978: 360004a9     	tbz	w9, #0x0, 0x4606a0c <_ChromeMain+0x4601770>
 460697c: b100051f     	cmn	x8, #0x1
 4606980: 54000420     	b.eq	0x4606a04 <_ChromeMain+0x4601768>
 4606984: d2800015     	mov	x21, #0x0               ; =0
 4606988: d2800016     	mov	x22, #0x0               ; =0
 460698c: 91000517     	add	x23, x8, #0x1
 4606990: 9004c9a8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4606994: 3dc01100     	ldr	q0, [x8, #0x40]
 4606998: 3d8003e0     	str	q0, [sp]
 460699c: 12b00018     	mov	w24, #0x7fffffff        ; =2147483647
 46069a0: aa1403e0     	mov	x0, x20
 46069a4: aa1603e1     	mov	x1, x22
 46069a8: 94000622     	bl	0x4608230 <_ChromeMain+0x4602f94>
 46069ac: 4e080c00     	dup.2d	v0, x0
