
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2ff6600: 3940a008     	ldrb	w8, [x0, #0x28]
 2ff6604: 35000048     	cbnz	w8, 0x2ff660c <_ChromeMain+0x2ff1370>
 2ff6608: d65f03c0     	ret
 2ff660c: d10183ff     	sub	sp, sp, #0x60
 2ff6610: a9044ff4     	stp	x20, x19, [sp, #0x40]
 2ff6614: a9057bfd     	stp	x29, x30, [sp, #0x50]
 2ff6618: 910143fd     	add	x29, sp, #0x50
 2ff661c: aa0103f3     	mov	x19, x1
 2ff6620: 6f00e400     	movi.2d	v0, #0000000000000000
 2ff6624: ad0103e0     	stp	q0, q0, [sp, #0x20]
 2ff6628: f90003e0     	str	x0, [sp]
 2ff662c: f9403800     	ldr	x0, [x0, #0x70]
 2ff6630: b5000340     	cbnz	x0, 0x2ff6698 <_ChromeMain+0x2ff13fc>
 2ff6634: f94003e0     	ldr	x0, [sp]
 2ff6638: 951296b6     	bl	0x749c110 <_ChromeMain+0x7496e74>
 2ff663c: 350000f3     	cbnz	w19, 0x2ff6658 <_ChromeMain+0x2ff13bc>
 2ff6640: 3940e3e8     	ldrb	w8, [sp, #0x38]
 2ff6644: 35000128     	cbnz	w8, 0x2ff6668 <_ChromeMain+0x2ff13cc>
 2ff6648: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 2ff664c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 2ff6650: 910183ff     	add	sp, sp, #0x60
 2ff6654: 17ffffed     	b	0x2ff6608 <_ChromeMain+0x2ff136c>
 2ff6658: f94003e8     	ldr	x8, [sp]
 2ff665c: f9401900     	ldr	x0, [x8, #0x30]
 2ff6660: 9512a1ad     	bl	0x749ed14 <_ChromeMain+0x7499a78>
 2ff6664: 17fffff7     	b	0x2ff6640 <_ChromeMain+0x2ff13a4>
 2ff6668: 910083e1     	add	x1, sp, #0x20
 2ff666c: f94003e0     	ldr	x0, [sp]
 2ff6670: 95129467     	bl	0x749b80c <_ChromeMain+0x7496570>
 2ff6674: 3940e3e8     	ldrb	w8, [sp, #0x38]
 2ff6678: 34fffe88     	cbz	w8, 0x2ff6648 <_ChromeMain+0x2ff13ac>
 2ff667c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 2ff6680: 36fffe48     	tbz	w8, #0x1f, 0x2ff6648 <_ChromeMain+0x2ff13ac>
 2ff6684: f94013e0     	ldr	x0, [sp, #0x20]
 2ff6688: f9401be8     	ldr	x8, [sp, #0x30]
 2ff668c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2ff6690: 97404a0a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2ff6694: 17ffffed     	b	0x2ff6648 <_ChromeMain+0x2ff13ac>
 2ff6698: b9400c08     	ldr	w8, [x0, #0xc]
 2ff669c: 34000188     	cbz	w8, 0x2ff66cc <_ChromeMain+0x2ff1430>
 2ff66a0: f94003e8     	ldr	x8, [sp]
 2ff66a4: f900391f     	str	xzr, [x8, #0x70]
 2ff66a8: 91002008     	add	x8, x0, #0x8
 2ff66ac: 12800009     	mov	w9, #-0x1               ; =-1
 2ff66b0: b8e90108     	ldaddal	w9, w8, [x8]
 2ff66b4: 7100051f     	cmp	w8, #0x1
 2ff66b8: 54fffbe1     	b.ne	0x2ff6634 <_ChromeMain+0x2ff1398>
 2ff66bc: f9400008     	ldr	x8, [x0]
 2ff66c0: f9400908     	ldr	x8, [x8, #0x10]
 2ff66c4: d63f0100     	blr	x8
 2ff66c8: 17ffffdb     	b	0x2ff6634 <_ChromeMain+0x2ff1398>
 2ff66cc: 910023e8     	add	x8, sp, #0x8
 2ff66d0: f94003f4     	ldr	x20, [sp]
 2ff66d4: aa1403e0     	mov	x0, x20
 2ff66d8: 9427487e     	bl	0x39c88d0 <_ChromeMain+0x39c3634>
 2ff66dc: 3cc083e0     	ldur	q0, [sp, #0x8]
 2ff66e0: 3d800be0     	str	q0, [sp, #0x20]
 2ff66e4: f9400fe8     	ldr	x8, [sp, #0x18]
 2ff66e8: f9001be8     	str	x8, [sp, #0x30]
 2ff66ec: 52800028     	mov	w8, #0x1                ; =1
 2ff66f0: 3900e3e8     	strb	w8, [sp, #0x38]
 2ff66f4: f9403a80     	ldr	x0, [x20, #0x70]
 2ff66f8: f9003a9f     	str	xzr, [x20, #0x70]
 2ff66fc: b4fff9c0     	cbz	x0, 0x2ff6634 <_ChromeMain+0x2ff1398>
 2ff6700: 17ffffea     	b	0x2ff66a8 <_ChromeMain+0x2ff140c>
 2ff6704: 00000000     	udf	#0x0
 2ff6708: d10203ff     	sub	sp, sp, #0x80
 2ff670c: a9064ff4     	stp	x20, x19, [sp, #0x60]
 2ff6710: a9077bfd     	stp	x29, x30, [sp, #0x70]
 2ff6714: 9101c3fd     	add	x29, sp, #0x70
 2ff6718: 3940a009     	ldrb	w9, [x0, #0x28]
 2ff671c: 350000a9     	cbnz	w9, 0x2ff6730 <_ChromeMain+0x2ff1494>
 2ff6720: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 2ff6724: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 2ff6728: 910203ff     	add	sp, sp, #0x80
 2ff672c: d65f03c0     	ret
 2ff6730: aa0003e8     	mov	x8, x0
 2ff6734: 39425009     	ldrb	w9, [x0, #0x94]
 2ff6738: 3707ff49     	tbnz	w9, #0x0, 0x2ff6720 <_ChromeMain+0x2ff1484>
 2ff673c: f9002bff     	str	xzr, [sp, #0x50]
 2ff6740: 6f00e400     	movi.2d	v0, #0000000000000000
 2ff6744: ad0183e0     	stp	q0, q0, [sp, #0x30]
 2ff6748: f9406109     	ldr	x9, [x8, #0xc0]
 2ff674c: b5000929     	cbnz	x9, 0x2ff6870 <_ChromeMain+0x2ff15d4>
 2ff6750: 9100c3e0     	add	x0, sp, #0x30
 2ff6754: 97eb240b     	bl	0x2abf780 <_ChromeMain+0x2aba4e4>
 2ff6758: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 2ff675c: f9002bff     	str	xzr, [sp, #0x50]
 2ff6760: f90013ff     	str	xzr, [sp, #0x20]
 2ff6764: 6f00e400     	movi.2d	v0, #0000000000000000
 2ff6768: ad0003e0     	stp	q0, q0, [sp]
 2ff676c: 910003e0     	mov	x0, sp
 2ff6770: 97eb2404     	bl	0x2abf780 <_ChromeMain+0x2aba4e4>
 2ff6774: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 2ff6778: f90013ff     	str	xzr, [sp, #0x20]
 2ff677c: f94023e8     	ldr	x8, [sp, #0x40]
 2ff6780: b4000148     	cbz	x8, 0x2ff67a8 <_ChromeMain+0x2ff150c>
 2ff6784: f9400509     	ldr	x9, [x8, #0x8]
 2ff6788: a944afea     	ldp	x10, x11, [sp, #0x48]
 2ff678c: eb0b013f     	cmp	x9, x11
 2ff6790: 9a8b312b     	csel	x11, x9, x11, lo
 2ff6794: f9400be9     	ldr	x9, [sp, #0x10]
 2ff6798: eb0b015f     	cmp	x10, x11
 2ff679c: 54000080     	b.eq	0x2ff67ac <_ChromeMain+0x2ff1510>
 2ff67a0: f9400feb     	ldr	x11, [sp, #0x18]
 2ff67a4: 1400000a     	b	0x2ff67cc <_ChromeMain+0x2ff1530>
 2ff67a8: f9400be9     	ldr	x9, [sp, #0x10]
 2ff67ac: b40006a9     	cbz	x9, 0x2ff6880 <_ChromeMain+0x2ff15e4>
 2ff67b0: f940052a     	ldr	x10, [x9, #0x8]
 2ff67b4: a941b3eb     	ldp	x11, x12, [sp, #0x18]
 2ff67b8: eb0c015f     	cmp	x10, x12
 2ff67bc: 9a8c314a     	csel	x10, x10, x12, lo
 2ff67c0: eb0a017f     	cmp	x11, x10
 2ff67c4: 540005e0     	b.eq	0x2ff6880 <_ChromeMain+0x2ff15e4>
 2ff67c8: f94027ea     	ldr	x10, [sp, #0x48]
 2ff67cc: eb0b015f     	cmp	x10, x11
 2ff67d0: fa490100     	ccmp	x8, x9, #0x0, eq
 2ff67d4: 54000560     	b.eq	0x2ff6880 <_ChromeMain+0x2ff15e4>
 2ff67d8: f9400509     	ldr	x9, [x8, #0x8]
 2ff67dc: eb09015f     	cmp	x10, x9
 2ff67e0: 54000462     	b.hs	0x2ff686c <_ChromeMain+0x2ff15d0>
 2ff67e4: f9400108     	ldr	x8, [x8]
 2ff67e8: 8b0a1108     	add	x8, x8, x10, lsl #4
 2ff67ec: f9400109     	ldr	x9, [x8]
 2ff67f0: b4000069     	cbz	x9, 0x2ff67fc <_ChromeMain+0x2ff1560>
 2ff67f4: 19404129     	ldapurb	w9, [x9, #0x4]
 2ff67f8: 34000369     	cbz	w9, 0x2ff6864 <_ChromeMain+0x2ff15c8>
 2ff67fc: d2800000     	mov	x0, #0x0                ; =0
 2ff6800: f9400008     	ldr	x8, [x0]
 2ff6804: f9400908     	ldr	x8, [x8, #0x10]
 2ff6808: d63f0100     	blr	x8
 2ff680c: f94023e9     	ldr	x9, [sp, #0x40]
 2ff6810: b4fffb69     	cbz	x9, 0x2ff677c <_ChromeMain+0x2ff14e0>
 2ff6814: a944abe8     	ldp	x8, x10, [sp, #0x48]
 2ff6818: 91000508     	add	x8, x8, #0x1
 2ff681c: f90027e8     	str	x8, [sp, #0x48]
 2ff6820: f9400529     	ldr	x9, [x9, #0x8]
 2ff6824: eb0a013f     	cmp	x9, x10
 2ff6828: 9a8a3133     	csel	x19, x9, x10, lo
 2ff682c: eb13011f     	cmp	x8, x19
 2ff6830: 54fffa62     	b.hs	0x2ff677c <_ChromeMain+0x2ff14e0>
 2ff6834: f94023e9     	ldr	x9, [sp, #0x40]
 2ff6838: f940052a     	ldr	x10, [x9, #0x8]
 2ff683c: eb0a011f     	cmp	x8, x10
 2ff6840: 54000162     	b.hs	0x2ff686c <_ChromeMain+0x2ff15d0>
 2ff6844: f9400129     	ldr	x9, [x9]
 2ff6848: 8b081120     	add	x0, x9, x8, lsl #4
 2ff684c: 97d6e9a3     	bl	0x25b0ed8 <_ChromeMain+0x25abc3c>
 2ff6850: 34fff960     	cbz	w0, 0x2ff677c <_ChromeMain+0x2ff14e0>
 2ff6854: f94027e8     	ldr	x8, [sp, #0x48]
 2ff6858: 91000508     	add	x8, x8, #0x1
 2ff685c: f90027e8     	str	x8, [sp, #0x48]
 2ff6860: 17fffff3     	b	0x2ff682c <_ChromeMain+0x2ff1590>
 2ff6864: f9400500     	ldr	x0, [x8, #0x8]
 2ff6868: 17ffffe6     	b	0x2ff6800 <_ChromeMain+0x2ff1564>
 2ff686c: d4200020     	brk	#0x1
 2ff6870: 9100c3e0     	add	x0, sp, #0x30
 2ff6874: 91026101     	add	x1, x8, #0x98
 2ff6878: 94d17ee2     	bl	0x6456400 <_ChromeMain+0x6451164>
 2ff687c: 17ffffb9     	b	0x2ff6760 <_ChromeMain+0x2ff14c4>
 2ff6880: 910003e0     	mov	x0, sp
 2ff6884: 94d17f0f     	bl	0x64564c0 <_ChromeMain+0x6451224>
 2ff6888: 9100c3e0     	add	x0, sp, #0x30
 2ff688c: 94d17f0d     	bl	0x64564c0 <_ChromeMain+0x6451224>
 2ff6890: 17ffffa4     	b	0x2ff6720 <_ChromeMain+0x2ff1484>
