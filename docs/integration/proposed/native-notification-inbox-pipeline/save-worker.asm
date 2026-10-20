
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40f8478: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 40f847c: a9015ff8     	stp	x24, x23, [sp, #0x10]
 40f8480: a90257f6     	stp	x22, x21, [sp, #0x20]
 40f8484: a9034ff4     	stp	x20, x19, [sp, #0x30]
 40f8488: a9047bfd     	stp	x29, x30, [sp, #0x40]
 40f848c: 910103fd     	add	x29, sp, #0x40
 40f8490: d10b83ff     	sub	sp, sp, #0x2e0
 40f8494: aa0303f4     	mov	x20, x3
 40f8498: aa0103f5     	mov	x21, x1
 40f849c: aa0003f6     	mov	x22, x0
 40f84a0: aa0803f3     	mov	x19, x8
 40f84a4: 6f00e400     	movi.2d	v0, #0000000000000000
 40f84a8: ad3c03a0     	stp	q0, q0, [x29, #-0x80]
 40f84ac: f9400048     	ldr	x8, [x2]
 40f84b0: b40009e8     	cbz	x8, 0x40f85ec <_ChromeMain+0x40f3350>
 40f84b4: aa0203f7     	mov	x23, x2
 40f84b8: 29452448     	ldp	w8, w9, [x2, #0x28]
 40f84bc: 7100051f     	cmp	w8, #0x1
 40f84c0: 7a40a924     	ccmp	w9, #0x0, #0x4, ge
 40f84c4: 5400094d     	b.le	0x40f85ec <_ChromeMain+0x40f3350>
 40f84c8: ad0103e0     	stp	q0, q0, [sp, #0x20]
 40f84cc: aa1703e8     	mov	x8, x23
 40f84d0: f8408d09     	ldr	x9, [x8, #0x8]!
 40f84d4: a9187fff     	stp	xzr, xzr, [sp, #0x180]
 40f84d8: f900cbff     	str	xzr, [sp, #0x190]
 40f84dc: b40019a9     	cbz	x9, 0x40f8810 <_ChromeMain+0x40f3574>
 40f84e0: 9105c3e9     	add	x9, sp, #0x170
 40f84e4: 3dc00100     	ldr	q0, [x8]
 40f84e8: 3d805fe0     	str	q0, [sp, #0x170]
 40f84ec: 91004120     	add	x0, x9, #0x10
 40f84f0: 910062e1     	add	x1, x23, #0x18
 40f84f4: 978b7437     	bl	0x23d55d0 <_ChromeMain+0x23d0334>
 40f84f8: f94016e8     	ldr	x8, [x23, #0x28]
 40f84fc: f900cbe8     	str	x8, [sp, #0x190]
 40f8500: a93affbf     	stp	xzr, xzr, [x29, #-0x58]
 40f8504: f81b83bf     	stur	xzr, [x29, #-0x48]
 40f8508: 910083e8     	add	x8, sp, #0x20
 40f850c: 9105c3e0     	add	x0, sp, #0x170
 40f8510: d10163a2     	sub	x2, x29, #0x58
 40f8514: 52800001     	mov	w1, #0x0                ; =0
 40f8518: 52800023     	mov	w3, #0x1                ; =1
 40f851c: 97c1ffd9     	bl	0x3178480 <_ChromeMain+0x31731e4>
 40f8520: f940c3e0     	ldr	x0, [sp, #0x180]
 40f8524: b40000a0     	cbz	x0, 0x40f8538 <_ChromeMain+0x40f329c>
 40f8528: 12800008     	mov	w8, #-0x1               ; =-1
 40f852c: b8e80008     	ldaddal	w8, w8, [x0]
 40f8530: 7100051f     	cmp	w8, #0x1
 40f8534: 54001680     	b.eq	0x40f8804 <_ChromeMain+0x40f3568>
 40f8538: 3940e3e8     	ldrb	w8, [sp, #0x38]
 40f853c: 34000528     	cbz	w8, 0x40f85e0 <_ChromeMain+0x40f3344>
 40f8540: a94263f7     	ldp	x23, x24, [sp, #0x20]
 40f8544: a917ffff     	stp	xzr, xzr, [sp, #0x178]
 40f8548: f900bbff     	str	xzr, [sp, #0x170]
 40f854c: 9105c3e2     	add	x2, sp, #0x170
 40f8550: aa1703e0     	mov	x0, x23
 40f8554: aa1803e1     	mov	x1, x24
 40f8558: 977aa6c8     	bl	0x1fa2078 <_ChromeMain+0x1f9cddc>
 40f855c: 3dc05fe0     	ldr	q0, [sp, #0x170]
 40f8560: 3c9803a0     	stur	q0, [x29, #-0x80]
 40f8564: f940c3e8     	ldr	x8, [sp, #0x180]
 40f8568: f81903a8     	stur	x8, [x29, #-0x70]
 40f856c: 52800028     	mov	w8, #0x1                ; =1
 40f8570: 381983a8     	sturb	w8, [x29, #-0x68]
 40f8574: b40000b7     	cbz	x23, 0x40f8588 <_ChromeMain+0x40f32ec>
 40f8578: cb1703e8     	neg	x8, x23
 40f857c: eb08031f     	cmp	x24, x8
 40f8580: 540013a9     	b.ls	0x40f87f4 <_ChromeMain+0x40f3558>
 40f8584: d4200020     	brk	#0x1
 40f8588: 389973a8     	ldursb	x8, [x29, #-0x69]
 40f858c: d10203a9     	sub	x9, x29, #0x80
 40f8590: a9782faa     	ldp	x10, x11, [x29, #-0x80]
 40f8594: f100011f     	cmp	x8, #0x0
 40f8598: 9a894143     	csel	x3, x10, x9, mi
 40f859c: 7100011f     	cmp	w8, #0x0
 40f85a0: 9a884164     	csel	x4, x11, x8, mi
 40f85a4: f004cca1     	adrp	x1, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40f85a8: 91034421     	add	x1, x1, #0xd1
 40f85ac: aa1503e0     	mov	x0, x21
 40f85b0: 52800202     	mov	w2, #0x10               ; =16
 40f85b4: 9756a005     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 40f85b8: 1400000c     	b	0x40f85e8 <_ChromeMain+0x40f334c>
 40f85bc: f940abe0     	ldr	x0, [sp, #0x150]
 40f85c0: f940b3e8     	ldr	x8, [sp, #0x160]
 40f85c4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f85c8: 96fc423c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f85cc: 14000026     	b	0x40f8664 <_ChromeMain+0x40f33c8>
 40f85d0: a9400ac1     	ldp	x1, x2, [x22]
 40f85d4: 910543e0     	add	x0, sp, #0x150
 40f85d8: 96fc7f10     	bl	0x18218 <_ChromeMain+0x12f7c>
 40f85dc: 14000014     	b	0x40f862c <_ChromeMain+0x40f3390>
 40f85e0: 381803bf     	sturb	wzr, [x29, #-0x80]
 40f85e4: 381983bf     	sturb	wzr, [x29, #-0x68]
 40f85e8: 6f00e400     	movi.2d	v0, #0000000000000000
 40f85ec: ad1403e0     	stp	q0, q0, [sp, #0x280]
 40f85f0: ad1303e0     	stp	q0, q0, [sp, #0x260]
 40f85f4: ad1203e0     	stp	q0, q0, [sp, #0x240]
 40f85f8: ad1103e0     	stp	q0, q0, [sp, #0x220]
 40f85fc: ad1003e0     	stp	q0, q0, [sp, #0x200]
 40f8600: ad0f03e0     	stp	q0, q0, [sp, #0x1e0]
 40f8604: ad0e03e0     	stp	q0, q0, [sp, #0x1c0]
 40f8608: ad0d03e0     	stp	q0, q0, [sp, #0x1a0]
 40f860c: ad0c03e0     	stp	q0, q0, [sp, #0x180]
 40f8610: 3d805fe0     	str	q0, [sp, #0x170]
 40f8614: 39c05ec8     	ldrsb	w8, [x22, #0x17]
 40f8618: 37fffdc8     	tbnz	w8, #0x1f, 0x40f85d0 <_ChromeMain+0x40f3334>
 40f861c: 3dc002c0     	ldr	q0, [x22]
 40f8620: 3d8057e0     	str	q0, [sp, #0x150]
 40f8624: f9400ac8     	ldr	x8, [x22, #0x10]
 40f8628: f900b3e8     	str	x8, [sp, #0x160]
 40f862c: d004cca1     	adrp	x1, 0xda8e000 <dyld_stub_binder+0xda8e000>
 40f8630: 913cf421     	add	x1, x1, #0xf3d
 40f8634: 9105c3f9     	add	x25, sp, #0x170
 40f8638: 9105c3e8     	add	x8, sp, #0x170
 40f863c: 910543e0     	add	x0, sp, #0x150
 40f8640: 52800142     	mov	w2, #0xa                ; =10
 40f8644: 97568374     	bl	0x1699414 <_ChromeMain+0x1694178>
 40f8648: d004cca1     	adrp	x1, 0xda8e000 <dyld_stub_binder+0xda8e000>
 40f864c: 913d2021     	add	x1, x1, #0xf48
 40f8650: 91006320     	add	x0, x25, #0x18
 40f8654: 97bc5cbd     	bl	0x300f948 <_ChromeMain+0x300a6ac>
 40f8658: 390a63ff     	strb	wzr, [sp, #0x298]
 40f865c: 39c59fe8     	ldrsb	w8, [sp, #0x167]
 40f8660: 37fffae8     	tbnz	w8, #0x1f, 0x40f85bc <_ChromeMain+0x40f3320>
 40f8664: 9105c3e0     	add	x0, sp, #0x170
 40f8668: aa1503e1     	mov	x1, x21
 40f866c: aa1403e2     	mov	x2, x20
 40f8670: 97fffdf2     	bl	0x40f7e38 <_ChromeMain+0x40f2b9c>
 40f8674: aa0103f8     	mov	x24, x1
 40f8678: 37000718     	tbnz	w24, #0x0, 0x40f8758 <_ChromeMain+0x40f34bc>
 40f867c: 6f00e400     	movi.2d	v0, #0000000000000000
 40f8680: ad0983e0     	stp	q0, q0, [sp, #0x130]
 40f8684: ad0883e0     	stp	q0, q0, [sp, #0x110]
 40f8688: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 40f868c: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 40f8690: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 40f8694: ad0483e0     	stp	q0, q0, [sp, #0x90]
 40f8698: ad0383e0     	stp	q0, q0, [sp, #0x70]
 40f869c: ad0283e0     	stp	q0, q0, [sp, #0x50]
 40f86a0: ad0183e0     	stp	q0, q0, [sp, #0x30]
 40f86a4: 3d800be0     	str	q0, [sp, #0x20]
 40f86a8: 3dc002c0     	ldr	q0, [x22]
 40f86ac: 3d8003e0     	str	q0, [sp]
 40f86b0: f9400ac8     	ldr	x8, [x22, #0x10]
 40f86b4: f9000be8     	str	x8, [sp, #0x10]
 40f86b8: a900fedf     	stp	xzr, xzr, [x22, #0x8]
 40f86bc: f90002df     	str	xzr, [x22]
 40f86c0: d004cca1     	adrp	x1, 0xda8e000 <dyld_stub_binder+0xda8e000>
 40f86c4: 913cf421     	add	x1, x1, #0xf3d
 40f86c8: 910083f6     	add	x22, sp, #0x20
 40f86cc: 910083e8     	add	x8, sp, #0x20
 40f86d0: 910003e0     	mov	x0, sp
 40f86d4: 52800142     	mov	w2, #0xa                ; =10
 40f86d8: 9756834f     	bl	0x1699414 <_ChromeMain+0x1694178>
 40f86dc: d004cca1     	adrp	x1, 0xda8e000 <dyld_stub_binder+0xda8e000>
 40f86e0: 913d2021     	add	x1, x1, #0xf48
 40f86e4: 910062c0     	add	x0, x22, #0x18
 40f86e8: 97bc5c98     	bl	0x300f948 <_ChromeMain+0x300a6ac>
 40f86ec: 390523ff     	strb	wzr, [sp, #0x148]
 40f86f0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40f86f4: 37f80208     	tbnz	w8, #0x1f, 0x40f8734 <_ChromeMain+0x40f3498>
 40f86f8: 910083e0     	add	x0, sp, #0x20
 40f86fc: aa1503e1     	mov	x1, x21
 40f8700: aa1403e2     	mov	x2, x20
 40f8704: 97fffdcd     	bl	0x40f7e38 <_ChromeMain+0x40f2b9c>
 40f8708: aa0003f7     	mov	x23, x0
 40f870c: aa0103f8     	mov	x24, x1
 40f8710: 910062c0     	add	x0, x22, #0x18
 40f8714: 976ddab4     	bl	0x1c6f1e4 <_ChromeMain+0x1c69f48>
 40f8718: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 40f871c: 36f80208     	tbz	w8, #0x1f, 0x40f875c <_ChromeMain+0x40f34c0>
 40f8720: f94013e0     	ldr	x0, [sp, #0x20]
 40f8724: f9401be8     	ldr	x8, [sp, #0x30]
 40f8728: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f872c: 96fc41e3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8730: 1400000b     	b	0x40f875c <_ChromeMain+0x40f34c0>
 40f8734: f94003e0     	ldr	x0, [sp]
 40f8738: f9400be8     	ldr	x8, [sp, #0x10]
 40f873c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8740: 96fc41de     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8744: 17ffffed     	b	0x40f86f8 <_ChromeMain+0x40f345c>
 40f8748: a9780ba1     	ldp	x1, x2, [x29, #-0x80]
 40f874c: 91004260     	add	x0, x19, #0x10
 40f8750: 96fc7eb2     	bl	0x18218 <_ChromeMain+0x12f7c>
 40f8754: 1400000e     	b	0x40f878c <_ChromeMain+0x40f34f0>
 40f8758: aa0003f7     	mov	x23, x0
 40f875c: f9000277     	str	x23, [x19]
 40f8760: 39002278     	strb	w24, [x19, #0x8]
 40f8764: 3900a27f     	strb	wzr, [x19, #0x28]
 40f8768: f800927f     	stur	xzr, [x19, #0x9]
 40f876c: 385983a8     	ldurb	w8, [x29, #-0x68]
 40f8770: 34000128     	cbz	w8, 0x40f8794 <_ChromeMain+0x40f34f8>
 40f8774: 38d973a8     	ldursb	w8, [x29, #-0x69]
 40f8778: 37fffe88     	tbnz	w8, #0x1f, 0x40f8748 <_ChromeMain+0x40f34ac>
 40f877c: 3cd803a0     	ldur	q0, [x29, #-0x80]
 40f8780: 3c810260     	stur	q0, [x19, #0x10]
 40f8784: f85903a8     	ldur	x8, [x29, #-0x70]
 40f8788: f8020268     	stur	x8, [x19, #0x20]
 40f878c: 52800028     	mov	w8, #0x1                ; =1
 40f8790: 3900a268     	strb	w8, [x19, #0x28]
 40f8794: 91006320     	add	x0, x25, #0x18
 40f8798: 976dda93     	bl	0x1c6f1e4 <_ChromeMain+0x1c69f48>
 40f879c: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 40f87a0: 37f80208     	tbnz	w8, #0x1f, 0x40f87e0 <_ChromeMain+0x40f3544>
 40f87a4: 385983a8     	ldurb	w8, [x29, #-0x68]
 40f87a8: 340000e8     	cbz	w8, 0x40f87c4 <_ChromeMain+0x40f3528>
 40f87ac: 38d973a8     	ldursb	w8, [x29, #-0x69]
 40f87b0: 36f800a8     	tbz	w8, #0x1f, 0x40f87c4 <_ChromeMain+0x40f3528>
 40f87b4: f85803a0     	ldur	x0, [x29, #-0x80]
 40f87b8: f85903a8     	ldur	x8, [x29, #-0x70]
 40f87bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f87c0: 96fc41be     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f87c4: 910b83ff     	add	sp, sp, #0x2e0
 40f87c8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 40f87cc: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 40f87d0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 40f87d4: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 40f87d8: a8c567fa     	ldp	x26, x25, [sp], #0x50
 40f87dc: d65f03c0     	ret
 40f87e0: f940bbe0     	ldr	x0, [sp, #0x170]
 40f87e4: f940c3e8     	ldr	x8, [sp, #0x180]
 40f87e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f87ec: 96fc41b3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f87f0: 17ffffed     	b	0x40f87a4 <_ChromeMain+0x40f3508>
 40f87f4: f9401be1     	ldr	x1, [sp, #0x30]
 40f87f8: aa1703e0     	mov	x0, x23
 40f87fc: 96fc41af     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8800: 17ffff62     	b	0x40f8588 <_ChromeMain+0x40f32ec>
 40f8804: 52801201     	mov	w1, #0x90               ; =144
 40f8808: 96fc41ac     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f880c: 17ffff4b     	b	0x40f8538 <_ChromeMain+0x40f329c>
 40f8810: 390083ff     	strb	wzr, [sp, #0x20]
 40f8814: 3900e3ff     	strb	wzr, [sp, #0x38]
 40f8818: 17ffff48     	b	0x40f8538 <_ChromeMain+0x40f329c>
 40f881c: d10103ff     	sub	sp, sp, #0x40
 40f8820: a9024ff4     	stp	x20, x19, [sp, #0x20]
 40f8824: a9037bfd     	stp	x29, x30, [sp, #0x30]
 40f8828: 9100c3fd     	add	x29, sp, #0x30
 40f882c: aa0003f3     	mov	x19, x0
 40f8830: f9400c00     	ldr	x0, [x0, #0x18]
 40f8834: b40001a0     	cbz	x0, 0x40f8868 <_ChromeMain+0x40f35cc>
 40f8838: 910003f4     	mov	x20, sp
 40f883c: 910003e8     	mov	x8, sp
 40f8840: 940003d3     	bl	0x40f978c <_ChromeMain+0x40f44f0>
 40f8844: b0046f82     	adrp	x2, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f8848: 912b3c42     	add	x2, x2, #0xacf
 40f884c: 910003e1     	mov	x1, sp
 40f8850: aa1303e0     	mov	x0, x19
 40f8854: 94000167     	bl	0x40f8df0 <_ChromeMain+0x40f3b54>
 40f8858: f94007e1     	ldr	x1, [sp, #0x8]
 40f885c: f9000ff4     	str	x20, [sp, #0x18]
 40f8860: 910063e0     	add	x0, sp, #0x18
 40f8864: 9718a092     	bl	0x720aac <_ChromeMain+0x71b810>
 40f8868: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 40f886c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 40f8870: 910103ff     	add	sp, sp, #0x40
 40f8874: d65f03c0     	ret
