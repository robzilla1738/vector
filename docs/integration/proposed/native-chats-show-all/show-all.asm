
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462f3d8: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 462f3dc: a90167fa     	stp	x26, x25, [sp, #0x10]
 462f3e0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 462f3e4: a90357f6     	stp	x22, x21, [sp, #0x30]
 462f3e8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 462f3ec: a9057bfd     	stp	x29, x30, [sp, #0x50]
 462f3f0: 910143fd     	add	x29, sp, #0x50
 462f3f4: d10f03ff     	sub	sp, sp, #0x3c0
 462f3f8: f9423408     	ldr	x8, [x0, #0x468]
 462f3fc: b4000ae8     	cbz	x8, 0x462f558 <_ChromeMain+0x462a2bc>
 462f400: aa0003f3     	mov	x19, x0
 462f404: f9003bff     	str	xzr, [sp, #0x70]
 462f408: 6f00e400     	movi.2d	v0, #0000000000000000
 462f40c: ad0283e0     	stp	q0, q0, [sp, #0x50]
 462f410: ad0183e0     	stp	q0, q0, [sp, #0x30]
 462f414: ad0083e0     	stp	q0, q0, [sp, #0x10]
 462f418: 3d8003e0     	str	q0, [sp]
 462f41c: f9422c08     	ldr	x8, [x0, #0x458]
 462f420: b40003a8     	cbz	x8, 0x462f494 <_ChromeMain+0x462a1f8>
 462f424: f9429d08     	ldr	x8, [x8, #0x538]
 462f428: f9403514     	ldr	x20, [x8, #0x68]
 462f42c: b4000374     	cbz	x20, 0x462f498 <_ChromeMain+0x462a1fc>
 462f430: 39412288     	ldrb	w8, [x20, #0x48]
 462f434: 37000328     	tbnz	w8, #0x0, 0x462f498 <_ChromeMain+0x462a1fc>
 462f438: f9400288     	ldr	x8, [x20]
 462f43c: f940b508     	ldr	x8, [x8, #0x168]
 462f440: aa1403e0     	mov	x0, x20
 462f444: d63f0100     	blr	x8
 462f448: b4000280     	cbz	x0, 0x462f498 <_ChromeMain+0x462a1fc>
 462f44c: aa0003f5     	mov	x21, x0
 462f450: b0044561     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 462f454: 91018021     	add	x1, x1, #0x60
 462f458: 52800202     	mov	w2, #0x10               ; =16
 462f45c: 96fa35fc     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 462f460: b40001c0     	cbz	x0, 0x462f498 <_ChromeMain+0x462a1fc>
 462f464: b0044561     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 462f468: 91018021     	add	x1, x1, #0x60
 462f46c: aa1503e0     	mov	x0, x21
 462f470: 52800202     	mov	w2, #0x10               ; =16
 462f474: 96f23d6d     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 462f478: 3100041f     	cmn	w0, #0x1
 462f47c: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 462f480: 9a9fc109     	csel	x9, x8, xzr, gt
 462f484: 37f800a0     	tbnz	w0, #0x1f, 0x462f498 <_ChromeMain+0x462a1fc>
 462f488: 0aa07c0a     	bic	w10, w0, w0, asr #31
 462f48c: aa0a0120     	orr	x0, x9, x10
 462f490: 14000005     	b	0x462f4a4 <_ChromeMain+0x462a208>
 462f494: d2800014     	mov	x20, #0x0               ; =0
 462f498: aa1403e0     	mov	x0, x20
 462f49c: 97eb5049     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 462f4a0: 92600008     	and	x8, x0, #0x100000000
 462f4a4: 2a0003e9     	mov	w9, w0
 462f4a8: aa090108     	orr	x8, x8, x9
 462f4ac: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 462f4b0: eb09011f     	cmp	x8, x9
 462f4b4: 9a898102     	csel	x2, x8, x9, hi
 462f4b8: d00485a0     	adrp	x0, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 462f4bc: 9105b800     	add	x0, x0, #0x16e
 462f4c0: d00485a3     	adrp	x3, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 462f4c4: 91060c63     	add	x3, x3, #0x183
 462f4c8: 910003e8     	mov	x8, sp
 462f4cc: 52800121     	mov	w1, #0x9                ; =9
 462f4d0: 528004c4     	mov	w4, #0x26               ; =38
 462f4d4: 97fcd70b     	bl	0x4565100 <_ChromeMain+0x455fe64>
 462f4d8: f9423668     	ldr	x8, [x19, #0x468]
 462f4dc: b40001a8     	cbz	x8, 0x462f510 <_ChromeMain+0x462a274>
 462f4e0: 394063e9     	ldrb	w9, [sp, #0x18]
 462f4e4: 36000169     	tbz	w9, #0x0, 0x462f510 <_ChromeMain+0x462a274>
 462f4e8: f9400100     	ldr	x0, [x8]
 462f4ec: f9400c08     	ldr	x8, [x0, #0x18]
 462f4f0: 7100051f     	cmp	w8, #0x1
 462f4f4: 540000eb     	b.lt	0x462f510 <_ChromeMain+0x462a274>
 462f4f8: d2800014     	mov	x20, #0x0               ; =0
 462f4fc: 910403f6     	add	x22, sp, #0x100
 462f500: 910003f7     	mov	x23, sp
 462f504: d0ffd0b8     	adrp	x24, 0x4045000 <_ChromeMain+0x403fd64>
 462f508: 913c8318     	add	x24, x24, #0xf20
 462f50c: 1400009f     	b	0x462f788 <_ChromeMain+0x462a4ec>
 462f510: f9422e68     	ldr	x8, [x19, #0x458]
 462f514: b40000a8     	cbz	x8, 0x462f528 <_ChromeMain+0x462a28c>
 462f518: f9429d14     	ldr	x20, [x8, #0x538]
 462f51c: b4000074     	cbz	x20, 0x462f528 <_ChromeMain+0x462a28c>
 462f520: 39624268     	ldrb	w8, [x19, #0x890]
 462f524: 35002068     	cbnz	w8, 0x462f930 <_ChromeMain+0x462a694>
 462f528: 910003f3     	mov	x19, sp
 462f52c: 9101c260     	add	x0, x19, #0x70
 462f530: d2800001     	mov	x1, #0x0                ; =0
 462f534: 96e7e1e1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 462f538: 91008260     	add	x0, x19, #0x20
 462f53c: 96e7e1cf     	bl	0x27c78 <_ChromeMain+0x229dc>
 462f540: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 462f544: 36f800a8     	tbz	w8, #0x1f, 0x462f558 <_ChromeMain+0x462a2bc>
 462f548: f94003e0     	ldr	x0, [sp]
 462f54c: f9400be8     	ldr	x8, [sp, #0x10]
 462f550: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462f554: 96e76659     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f558: 910f03ff     	add	sp, sp, #0x3c0
 462f55c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 462f560: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 462f564: a94357f6     	ldp	x22, x21, [sp, #0x30]
 462f568: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 462f56c: a94167fa     	ldp	x26, x25, [sp, #0x10]
 462f570: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 462f574: d65f03c0     	ret
 462f578: 3100051f     	cmn	w8, #0x1
 462f57c: 54002d80     	b.eq	0x462fb2c <_ChromeMain+0x462a890>
 462f580: 14000015     	b	0x462f5d4 <_ChromeMain+0x462a338>
 462f584: b942bb28     	ldr	w8, [x25, #0x2b8]
 462f588: 3100051f     	cmn	w8, #0x1
 462f58c: 54002701     	b.ne	0x462fa6c <_ChromeMain+0x462a7d0>
 462f590: 394d2348     	ldrb	w8, [x26, #0x348]
 462f594: 340002c8     	cbz	w8, 0x462f5ec <_ChromeMain+0x462a350>
 462f598: 1400011e     	b	0x462fa10 <_ChromeMain+0x462a774>
 462f59c: f94083e0     	ldr	x0, [sp, #0x100]
 462f5a0: f9408be8     	ldr	x8, [sp, #0x110]
 462f5a4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462f5a8: 96e76644     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f5ac: 37001af5     	tbnz	w21, #0x0, 0x462f908 <_ChromeMain+0x462a66c>
 462f5b0: f9414b3a     	ldr	x26, [x25, #0x290]
 462f5b4: b5fffe9a     	cbnz	x26, 0x462f584 <_ChromeMain+0x462a2e8>
 462f5b8: f9413328     	ldr	x8, [x25, #0x260]
 462f5bc: f9401d09     	ldr	x9, [x8, #0x38]
 462f5c0: b982b728     	ldrsw	x8, [x25, #0x2b4]
 462f5c4: eb18013f     	cmp	x9, x24
 462f5c8: 54fffd81     	b.ne	0x462f578 <_ChromeMain+0x462a2dc>
 462f5cc: 3100051f     	cmn	w8, #0x1
 462f5d0: 540027c0     	b.eq	0x462fac8 <_ChromeMain+0x462a82c>
 462f5d4: f9414329     	ldr	x9, [x25, #0x280]
 462f5d8: eb08013f     	cmp	x9, x8
 462f5dc: 54002529     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462f5e0: f9413f29     	ldr	x9, [x25, #0x278]
 462f5e4: f868793a     	ldr	x26, [x9, x8, lsl #3]
 462f5e8: b40005ba     	cbz	x26, 0x462f69c <_ChromeMain+0x462a400>
 462f5ec: f9400f48     	ldr	x8, [x26, #0x18]
 462f5f0: f9400509     	ldr	x9, [x8, #0x8]
 462f5f4: 9101813c     	add	x28, x9, #0x60
 462f5f8: 3941dd2a     	ldrb	w10, [x9, #0x77]
 462f5fc: 13001d48     	sxtb	w8, w10
 462f600: f9403529     	ldr	x9, [x9, #0x68]
 462f604: 7100011f     	cmp	w8, #0x0
 462f608: 9a8a4122     	csel	x2, x9, x10, mi
 462f60c: 39405fe9     	ldrb	w9, [sp, #0x17]
 462f610: 13001d3b     	sxtb	w27, w9
 462f614: f94007ea     	ldr	x10, [sp, #0x8]
 462f618: 7100037f     	cmp	w27, #0x0
 462f61c: 9a894155     	csel	x21, x10, x9, mi
 462f620: eb15005f     	cmp	x2, x21
 462f624: 54000121     	b.ne	0x462f648 <_ChromeMain+0x462a3ac>
 462f628: f9400389     	ldr	x9, [x28]
 462f62c: 7100011f     	cmp	w8, #0x0
 462f630: 9a9c4120     	csel	x0, x9, x28, mi
 462f634: f94003e8     	ldr	x8, [sp]
 462f638: 7100037f     	cmp	w27, #0x0
 462f63c: 9a974101     	csel	x1, x8, x23, mi
 462f640: 94e76888     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462f644: 34001620     	cbz	w0, 0x462f908 <_ChromeMain+0x462a66c>
 462f648: 3980ff48     	ldrsb	x8, [x26, #0x3f]
 462f64c: b7f822a8     	tbnz	x8, #0x3f, 0x462faa0 <_ChromeMain+0x462a804>
 462f650: 9100a349     	add	x9, x26, #0x28
 462f654: f100011f     	cmp	x8, #0x0
 462f658: 9a890388     	csel	x8, x28, x9, eq
 462f65c: 39405d0a     	ldrb	w10, [x8, #0x17]
 462f660: 13001d49     	sxtb	w9, w10
 462f664: f940050b     	ldr	x11, [x8, #0x8]
 462f668: 7100013f     	cmp	w9, #0x0
 462f66c: 9a8a416a     	csel	x10, x11, x10, mi
 462f670: eb15015f     	cmp	x10, x21
 462f674: 54000141     	b.ne	0x462f69c <_ChromeMain+0x462a400>
 462f678: f940010a     	ldr	x10, [x8]
 462f67c: 7100013f     	cmp	w9, #0x0
 462f680: 9a884140     	csel	x0, x10, x8, mi
 462f684: f94003e8     	ldr	x8, [sp]
 462f688: 7100037f     	cmp	w27, #0x0
 462f68c: 9a974101     	csel	x1, x8, x23, mi
 462f690: aa1503e2     	mov	x2, x21
 462f694: 94e76873     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462f698: 34001380     	cbz	w0, 0x462f908 <_ChromeMain+0x462a66c>
 462f69c: b982b728     	ldrsw	x8, [x25, #0x2b4]
 462f6a0: 3100051f     	cmn	w8, #0x1
 462f6a4: 54001f80     	b.eq	0x462fa94 <_ChromeMain+0x462a7f8>
 462f6a8: f9414329     	ldr	x9, [x25, #0x280]
 462f6ac: eb08013f     	cmp	x9, x8
 462f6b0: 54001e89     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462f6b4: f9413f29     	ldr	x9, [x25, #0x278]
 462f6b8: f868793a     	ldr	x26, [x9, x8, lsl #3]
 462f6bc: b40005ba     	cbz	x26, 0x462f770 <_ChromeMain+0x462a4d4>
 462f6c0: f9400f48     	ldr	x8, [x26, #0x18]
 462f6c4: f9400509     	ldr	x9, [x8, #0x8]
 462f6c8: 9101813b     	add	x27, x9, #0x60
 462f6cc: 3941dd2a     	ldrb	w10, [x9, #0x77]
 462f6d0: 13001d48     	sxtb	w8, w10
 462f6d4: f9403529     	ldr	x9, [x9, #0x68]
 462f6d8: 7100011f     	cmp	w8, #0x0
 462f6dc: 9a8a4122     	csel	x2, x9, x10, mi
 462f6e0: 39405fe9     	ldrb	w9, [sp, #0x17]
 462f6e4: 13001d39     	sxtb	w25, w9
 462f6e8: f94007ea     	ldr	x10, [sp, #0x8]
 462f6ec: 7100033f     	cmp	w25, #0x0
 462f6f0: 9a894155     	csel	x21, x10, x9, mi
 462f6f4: eb15005f     	cmp	x2, x21
 462f6f8: 54000121     	b.ne	0x462f71c <_ChromeMain+0x462a480>
 462f6fc: f9400369     	ldr	x9, [x27]
 462f700: 7100011f     	cmp	w8, #0x0
 462f704: 9a9b4120     	csel	x0, x9, x27, mi
 462f708: f94003e8     	ldr	x8, [sp]
 462f70c: 7100033f     	cmp	w25, #0x0
 462f710: 9a974101     	csel	x1, x8, x23, mi
 462f714: 94e76853     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462f718: 34000f80     	cbz	w0, 0x462f908 <_ChromeMain+0x462a66c>
 462f71c: 3980ff48     	ldrsb	x8, [x26, #0x3f]
 462f720: b7f81ca8     	tbnz	x8, #0x3f, 0x462fab4 <_ChromeMain+0x462a818>
 462f724: 9100a349     	add	x9, x26, #0x28
 462f728: f100011f     	cmp	x8, #0x0
 462f72c: 9a890368     	csel	x8, x27, x9, eq
 462f730: 39405d0a     	ldrb	w10, [x8, #0x17]
 462f734: 13001d49     	sxtb	w9, w10
 462f738: f940050b     	ldr	x11, [x8, #0x8]
 462f73c: 7100013f     	cmp	w9, #0x0
 462f740: 9a8a416a     	csel	x10, x11, x10, mi
 462f744: eb15015f     	cmp	x10, x21
 462f748: 54000141     	b.ne	0x462f770 <_ChromeMain+0x462a4d4>
 462f74c: f940010a     	ldr	x10, [x8]
 462f750: 7100013f     	cmp	w9, #0x0
 462f754: 9a884140     	csel	x0, x10, x8, mi
 462f758: f94003e8     	ldr	x8, [sp]
 462f75c: 7100033f     	cmp	w25, #0x0
 462f760: 9a974101     	csel	x1, x8, x23, mi
 462f764: aa1503e2     	mov	x2, x21
 462f768: 94e7683e     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462f76c: 34000ce0     	cbz	w0, 0x462f908 <_ChromeMain+0x462a66c>
 462f770: 91000694     	add	x20, x20, #0x1
 462f774: f9423668     	ldr	x8, [x19, #0x468]
 462f778: f9400100     	ldr	x0, [x8]
 462f77c: f9400c08     	ldr	x8, [x0, #0x18]
 462f780: eb28c29f     	cmp	x20, w8, sxtw
 462f784: 54ffec6a     	b.ge	0x462f510 <_ChromeMain+0x462a274>
 462f788: eb28c29f     	cmp	x20, w8, sxtw
 462f78c: 54ffff2a     	b.ge	0x462f770 <_ChromeMain+0x462a4d4>
 462f790: aa1403e1     	mov	x1, x20
 462f794: 9728bad9     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462f798: f9402019     	ldr	x25, [x0, #0x40]
 462f79c: b4fffeb9     	cbz	x25, 0x462f770 <_ChromeMain+0x462a4d4>
 462f7a0: f900bbff     	str	xzr, [sp, #0x170]
 462f7a4: 6f00e400     	movi.2d	v0, #0000000000000000
 462f7a8: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 462f7ac: ad0983e0     	stp	q0, q0, [sp, #0x130]
 462f7b0: ad0883e0     	stp	q0, q0, [sp, #0x110]
 462f7b4: 3d8043e0     	str	q0, [sp, #0x100]
 462f7b8: f9414b28     	ldr	x8, [x25, #0x290]
 462f7bc: b5000908     	cbnz	x8, 0x462f8dc <_ChromeMain+0x462a640>
 462f7c0: f9413328     	ldr	x8, [x25, #0x260]
 462f7c4: f9401d09     	ldr	x9, [x8, #0x38]
 462f7c8: b982b728     	ldrsw	x8, [x25, #0x2b4]
 462f7cc: eb18013f     	cmp	x9, x24
 462f7d0: 54000921     	b.ne	0x462f8f4 <_ChromeMain+0x462a658>
 462f7d4: 3100051f     	cmn	w8, #0x1
 462f7d8: 54001720     	b.eq	0x462fabc <_ChromeMain+0x462a820>
 462f7dc: f9414329     	ldr	x9, [x25, #0x280]
 462f7e0: eb08013f     	cmp	x9, x8
 462f7e4: 540014e9     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462f7e8: f9413f29     	ldr	x9, [x25, #0x278]
 462f7ec: f8687928     	ldr	x8, [x9, x8, lsl #3]
 462f7f0: b40015c8     	cbz	x8, 0x462faa8 <_ChromeMain+0x462a80c>
 462f7f4: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 462f7f8: b7f81469     	tbnz	x9, #0x3f, 0x462fa84 <_ChromeMain+0x462a7e8>
 462f7fc: b5001489     	cbnz	x9, 0x462fa8c <_ChromeMain+0x462a7f0>
 462f800: f9400d08     	ldr	x8, [x8, #0x18]
 462f804: f9400508     	ldr	x8, [x8, #0x8]
 462f808: 91018101     	add	x1, x8, #0x60
 462f80c: 910403e0     	add	x0, sp, #0x100
 462f810: 96ec29e1     	bl	0x139f94 <_ChromeMain+0x134cf8>
 462f814: 394463e8     	ldrb	w8, [sp, #0x118]
 462f818: 37000248     	tbnz	w8, #0x0, 0x462f860 <_ChromeMain+0x462a5c4>
 462f81c: b982b728     	ldrsw	x8, [x25, #0x2b4]
 462f820: 3100051f     	cmn	w8, #0x1
 462f824: 54001600     	b.eq	0x462fae4 <_ChromeMain+0x462a848>
 462f828: f9414329     	ldr	x9, [x25, #0x280]
 462f82c: eb08013f     	cmp	x9, x8
 462f830: 54001289     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462f834: f9413f29     	ldr	x9, [x25, #0x278]
 462f838: f8687928     	ldr	x8, [x9, x8, lsl #3]
 462f83c: b40015a8     	cbz	x8, 0x462faf0 <_ChromeMain+0x462a854>
 462f840: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 462f844: b7f81489     	tbnz	x9, #0x3f, 0x462fad4 <_ChromeMain+0x462a838>
 462f848: b50014a9     	cbnz	x9, 0x462fadc <_ChromeMain+0x462a840>
 462f84c: f9400d08     	ldr	x8, [x8, #0x18]
 462f850: f9400508     	ldr	x8, [x8, #0x8]
 462f854: 91018101     	add	x1, x8, #0x60
 462f858: 910403e0     	add	x0, sp, #0x100
 462f85c: 96fa702c     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 462f860: 39445fe9     	ldrb	w9, [sp, #0x117]
 462f864: 13001d28     	sxtb	w8, w9
 462f868: f94087ea     	ldr	x10, [sp, #0x108]
 462f86c: 7100011f     	cmp	w8, #0x0
 462f870: 9a894142     	csel	x2, x10, x9, mi
 462f874: 39405fea     	ldrb	w10, [sp, #0x17]
 462f878: 13001d49     	sxtb	w9, w10
 462f87c: f94007eb     	ldr	x11, [sp, #0x8]
 462f880: 7100013f     	cmp	w9, #0x0
 462f884: 9a8a416a     	csel	x10, x11, x10, mi
 462f888: eb0a005f     	cmp	x2, x10
 462f88c: 54000241     	b.ne	0x462f8d4 <_ChromeMain+0x462a638>
 462f890: f94083ea     	ldr	x10, [sp, #0x100]
 462f894: 7100011f     	cmp	w8, #0x0
 462f898: 9a964140     	csel	x0, x10, x22, mi
 462f89c: f94003e8     	ldr	x8, [sp]
 462f8a0: 7100013f     	cmp	w9, #0x0
 462f8a4: 9a974101     	csel	x1, x8, x23, mi
 462f8a8: 94e767ee     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462f8ac: 7100001f     	cmp	w0, #0x0
 462f8b0: 1a9f17f5     	cset	w21, eq
 462f8b4: 9101c2c0     	add	x0, x22, #0x70
 462f8b8: d2800001     	mov	x1, #0x0                ; =0
 462f8bc: 96e7e0ff     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 462f8c0: 910082c0     	add	x0, x22, #0x20
 462f8c4: 96e7e0ed     	bl	0x27c78 <_ChromeMain+0x229dc>
 462f8c8: 39c45fe8     	ldrsb	w8, [sp, #0x117]
 462f8cc: 36ffe708     	tbz	w8, #0x1f, 0x462f5ac <_ChromeMain+0x462a310>
 462f8d0: 17ffff33     	b	0x462f59c <_ChromeMain+0x462a300>
 462f8d4: 52800015     	mov	w21, #0x0               ; =0
 462f8d8: 17fffff7     	b	0x462f8b4 <_ChromeMain+0x462a618>
 462f8dc: b942bb29     	ldr	w9, [x25, #0x2b8]
 462f8e0: 3100053f     	cmn	w9, #0x1
 462f8e4: 54000ba1     	b.ne	0x462fa58 <_ChromeMain+0x462a7bc>
 462f8e8: 394d2109     	ldrb	w9, [x8, #0x348]
 462f8ec: 34fff849     	cbz	w9, 0x462f7f4 <_ChromeMain+0x462a558>
 462f8f0: 14000036     	b	0x462f9c8 <_ChromeMain+0x462a72c>
 462f8f4: 3100051f     	cmn	w8, #0x1
 462f8f8: 54fff721     	b.ne	0x462f7dc <_ChromeMain+0x462a540>
 462f8fc: d4200000     	brk	#0
 462f900: d4400000     	hlt	#0
 462f904: d4200020     	brk	#0x1
 462f908: f9423673     	ldr	x19, [x19, #0x468]
 462f90c: d0052c08     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 462f910: f9468d08     	ldr	x8, [x8, #0xd18]
 462f914: d63f0100     	blr	x8
 462f918: aa0003e3     	mov	x3, x0
 462f91c: aa1303e0     	mov	x0, x19
 462f920: aa1403e1     	mov	x1, x20
 462f924: 528000c2     	mov	w2, #0x6                ; =6
 462f928: 94dc8070     	bl	0x7d4fae8 <_ChromeMain+0x7d4a84c>
 462f92c: 17fffeff     	b	0x462f528 <_ChromeMain+0x462a28c>
 462f930: 910203f3     	add	x19, sp, #0x80
 462f934: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 462f938: b80973ff     	stur	wzr, [sp, #0x97]
 462f93c: f9004bff     	str	xzr, [sp, #0x90]
 462f940: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 462f944: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 462f948: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 462f94c: 7901c3ff     	strh	wzr, [sp, #0xe0]
 462f950: a90effff     	stp	xzr, xzr, [sp, #0xe8]
 462f954: 52800028     	mov	w8, #0x1                ; =1
 462f958: b900fbe8     	str	w8, [sp, #0xf8]
 462f95c: 910403e0     	add	x0, sp, #0x100
 462f960: 910003e1     	mov	x1, sp
 462f964: 910203e2     	add	x2, sp, #0x80
 462f968: 52800063     	mov	w3, #0x3                ; =3
 462f96c: 52800004     	mov	w4, #0x0                ; =0
 462f970: 52800005     	mov	w5, #0x0                ; =0
 462f974: 944e19d1     	bl	0x59b60b8 <_ChromeMain+0x59b0e1c>
 462f978: 9100a280     	add	x0, x20, #0x28
 462f97c: 97cf6c8d     	bl	0x3a0abb0 <_ChromeMain+0x3a05914>
 462f980: 910403e2     	add	x2, sp, #0x100
 462f984: d2800001     	mov	x1, #0x0                ; =0
 462f988: d2800003     	mov	x3, #0x0                ; =0
 462f98c: 97ecd607     	bl	0x41651a8 <_ChromeMain+0x415ff0c>
 462f990: 910403e0     	add	x0, sp, #0x100
 462f994: 977782c6     	bl	0x24104ac <_ChromeMain+0x240b210>
 462f998: 9101c260     	add	x0, x19, #0x70
 462f99c: d2800001     	mov	x1, #0x0                ; =0
 462f9a0: 96e7e0c6     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 462f9a4: 91008260     	add	x0, x19, #0x20
 462f9a8: 96e7e0b4     	bl	0x27c78 <_ChromeMain+0x229dc>
 462f9ac: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 462f9b0: 36ffdbc8     	tbz	w8, #0x1f, 0x462f528 <_ChromeMain+0x462a28c>
 462f9b4: f94043e0     	ldr	x0, [sp, #0x80]
 462f9b8: f9404be8     	ldr	x8, [sp, #0x90]
 462f9bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462f9c0: 96e7653e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f9c4: 17fffed9     	b	0x462f528 <_ChromeMain+0x462a28c>
 462f9c8: 394ba329     	ldrb	w9, [x25, #0x2e8]
 462f9cc: 34ffefa9     	cbz	w9, 0x462f7c0 <_ChromeMain+0x462a524>
 462f9d0: b982b729     	ldrsw	x9, [x25, #0x2b4]
 462f9d4: 3100053f     	cmn	w9, #0x1
 462f9d8: 54000920     	b.eq	0x462fafc <_ChromeMain+0x462a860>
 462f9dc: f941432a     	ldr	x10, [x25, #0x280]
 462f9e0: eb09015f     	cmp	x10, x9
 462f9e4: 540004e9     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462f9e8: f9413f2a     	ldr	x10, [x25, #0x278]
 462f9ec: f8697949     	ldr	x9, [x10, x9, lsl #3]
 462f9f0: b9443129     	ldr	w9, [x9, #0x430]
 462f9f4: 7100093f     	cmp	w9, #0x2
 462f9f8: 54ffee40     	b.eq	0x462f7c0 <_ChromeMain+0x462a524>
 462f9fc: f9413729     	ldr	x9, [x25, #0x268]
 462fa00: b4000849     	cbz	x9, 0x462fb08 <_ChromeMain+0x462a86c>
 462fa04: 39458129     	ldrb	w9, [x9, #0x160]
 462fa08: 3707edc9     	tbnz	w9, #0x0, 0x462f7c0 <_ChromeMain+0x462a524>
 462fa0c: 17ffff7a     	b	0x462f7f4 <_ChromeMain+0x462a558>
 462fa10: 394ba328     	ldrb	w8, [x25, #0x2e8]
 462fa14: 34ffdd28     	cbz	w8, 0x462f5b8 <_ChromeMain+0x462a31c>
 462fa18: b982b728     	ldrsw	x8, [x25, #0x2b4]
 462fa1c: 3100051f     	cmn	w8, #0x1
 462fa20: 540007a0     	b.eq	0x462fb14 <_ChromeMain+0x462a878>
 462fa24: f9414329     	ldr	x9, [x25, #0x280]
 462fa28: eb08013f     	cmp	x9, x8
 462fa2c: 540002a9     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462fa30: f9413f29     	ldr	x9, [x25, #0x278]
 462fa34: f8687928     	ldr	x8, [x9, x8, lsl #3]
 462fa38: b9443108     	ldr	w8, [x8, #0x430]
 462fa3c: 7100091f     	cmp	w8, #0x2
 462fa40: 54ffdbc0     	b.eq	0x462f5b8 <_ChromeMain+0x462a31c>
 462fa44: f9413728     	ldr	x8, [x25, #0x268]
 462fa48: b40006c8     	cbz	x8, 0x462fb20 <_ChromeMain+0x462a884>
 462fa4c: 39458108     	ldrb	w8, [x8, #0x160]
 462fa50: 3707db48     	tbnz	w8, #0x0, 0x462f5b8 <_ChromeMain+0x462a31c>
 462fa54: 17fffee6     	b	0x462f5ec <_ChromeMain+0x462a350>
 462fa58: 394ba329     	ldrb	w9, [x25, #0x2e8]
 462fa5c: 34ffeb29     	cbz	w9, 0x462f7c0 <_ChromeMain+0x462a524>
 462fa60: 394d2109     	ldrb	w9, [x8, #0x348]
 462fa64: 35ffeae9     	cbnz	w9, 0x462f7c0 <_ChromeMain+0x462a524>
 462fa68: 17ffff63     	b	0x462f7f4 <_ChromeMain+0x462a558>
 462fa6c: 394ba328     	ldrb	w8, [x25, #0x2e8]
 462fa70: 34ffda48     	cbz	w8, 0x462f5b8 <_ChromeMain+0x462a31c>
 462fa74: 394d2348     	ldrb	w8, [x26, #0x348]
 462fa78: 35ffda08     	cbnz	w8, 0x462f5b8 <_ChromeMain+0x462a31c>
 462fa7c: 17fffedc     	b	0x462f5ec <_ChromeMain+0x462a350>
 462fa80: d4200020     	brk	#0x1
 462fa84: f9401909     	ldr	x9, [x8, #0x30]
 462fa88: b4ffebc9     	cbz	x9, 0x462f800 <_ChromeMain+0x462a564>
 462fa8c: 9100a101     	add	x1, x8, #0x28
 462fa90: 17ffff5f     	b	0x462f80c <_ChromeMain+0x462a570>
 462fa94: d4200000     	brk	#0
 462fa98: d4400000     	hlt	#0
 462fa9c: d4200020     	brk	#0x1
 462faa0: f9401b48     	ldr	x8, [x26, #0x30]
 462faa4: 17fffeeb     	b	0x462f650 <_ChromeMain+0x462a3b4>
 462faa8: 97d0ebf4     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 462faac: aa0003e1     	mov	x1, x0
 462fab0: 17ffff57     	b	0x462f80c <_ChromeMain+0x462a570>
 462fab4: f9401b48     	ldr	x8, [x26, #0x30]
 462fab8: 17ffff1b     	b	0x462f724 <_ChromeMain+0x462a488>
 462fabc: d4200000     	brk	#0
 462fac0: d4400000     	hlt	#0
 462fac4: d4200020     	brk	#0x1
 462fac8: d4200000     	brk	#0
 462facc: d4400000     	hlt	#0
 462fad0: d4200020     	brk	#0x1
 462fad4: f9401909     	ldr	x9, [x8, #0x30]
 462fad8: b4ffeba9     	cbz	x9, 0x462f84c <_ChromeMain+0x462a5b0>
 462fadc: 9100a101     	add	x1, x8, #0x28
 462fae0: 17ffff5e     	b	0x462f858 <_ChromeMain+0x462a5bc>
 462fae4: d4200000     	brk	#0
 462fae8: d4400000     	hlt	#0
 462faec: d4200020     	brk	#0x1
 462faf0: 97d0ebe2     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 462faf4: aa0003e1     	mov	x1, x0
 462faf8: 17ffff58     	b	0x462f858 <_ChromeMain+0x462a5bc>
 462fafc: d4200000     	brk	#0
 462fb00: d4400000     	hlt	#0
 462fb04: d4200020     	brk	#0x1
 462fb08: d4200000     	brk	#0
 462fb0c: d4400000     	hlt	#0
 462fb10: d4200020     	brk	#0x1
 462fb14: d4200000     	brk	#0
 462fb18: d4400000     	hlt	#0
 462fb1c: d4200020     	brk	#0x1
 462fb20: d4200000     	brk	#0
 462fb24: d4400000     	hlt	#0
 462fb28: d4200020     	brk	#0x1
 462fb2c: d4200000     	brk	#0
 462fb30: d4400000     	hlt	#0
 462fb34: d4200020     	brk	#0x1
