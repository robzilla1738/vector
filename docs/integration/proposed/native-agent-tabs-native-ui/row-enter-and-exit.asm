
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4689200: d10743ff     	sub	sp, sp, #0x1d0
 4689204: a9196ffc     	stp	x28, x27, [sp, #0x190]
 4689208: a91a57f6     	stp	x22, x21, [sp, #0x1a0]
 468920c: a91b4ff4     	stp	x20, x19, [sp, #0x1b0]
 4689210: a91c7bfd     	stp	x29, x30, [sp, #0x1c0]
 4689214: 910703fd     	add	x29, sp, #0x1c0
 4689218: aa0003f3     	mov	x19, x0
 468921c: f9424000     	ldr	x0, [x0, #0x480]
 4689220: f9400008     	ldr	x8, [x0]
 4689224: f9401508     	ldr	x8, [x8, #0x28]
 4689228: d63f0100     	blr	x8
 468922c: f942ce74     	ldr	x20, [x19, #0x598]
 4689230: aa1303e0     	mov	x0, x19
 4689234: 974908af     	bl	0x18cb4f0 <_ChromeMain+0x18c6254>
 4689238: 370007c0     	tbnz	w0, #0x0, 0x4689330 <_ChromeMain+0x4684094>
 468923c: f9400268     	ldr	x8, [x19]
 4689240: f9403508     	ldr	x8, [x8, #0x68]
 4689244: aa1303e0     	mov	x0, x19
 4689248: d63f0100     	blr	x8
 468924c: aa1303f5     	mov	x21, x19
 4689250: f84e8ea8     	ldr	x8, [x21, #0xe8]!
 4689254: 90051bf6     	adrp	x22, 0xea05000 <dyld_stub_binder+0xea05000>
 4689258: 911922d6     	add	x22, x22, #0x648
 468925c: b4000248     	cbz	x8, 0x46892a4 <_ChromeMain+0x4684008>
 4689260: f9401109     	ldr	x9, [x8, #0x20]
 4689264: eb16013f     	cmp	x9, x22
 4689268: 540000a8     	b.hi	0x468927c <_ChromeMain+0x4683fe0>
 468926c: 54000142     	b.hs	0x4689294 <_ChromeMain+0x4683ff8>
 4689270: f9400508     	ldr	x8, [x8, #0x8]
 4689274: b5ffff68     	cbnz	x8, 0x4689260 <_ChromeMain+0x4683fc4>
 4689278: 1400000b     	b	0x46892a4 <_ChromeMain+0x4684008>
 468927c: f9400108     	ldr	x8, [x8]
 4689280: b5ffff08     	cbnz	x8, 0x4689260 <_ChromeMain+0x4683fc4>
 4689284: 14000008     	b	0x46892a4 <_ChromeMain+0x4684008>
 4689288: f9400108     	ldr	x8, [x8]
 468928c: b50001e8     	cbnz	x8, 0x46892c8 <_ChromeMain+0x468402c>
 4689290: 14000014     	b	0x46892e0 <_ChromeMain+0x4684044>
 4689294: eb15011f     	cmp	x8, x21
 4689298: 54000060     	b.eq	0x46892a4 <_ChromeMain+0x4684008>
 468929c: f9401908     	ldr	x8, [x8, #0x30]
 46892a0: b5000de8     	cbnz	x8, 0x468945c <_ChromeMain+0x46841c0>
 46892a4: b4000420     	cbz	x0, 0x4689328 <_ChromeMain+0x468408c>
 46892a8: 9706f98a     	bl	0x8478d0 <_ChromeMain+0x842634>
 46892ac: b40003e0     	cbz	x0, 0x4689328 <_ChromeMain+0x468408c>
 46892b0: f9400268     	ldr	x8, [x19]
 46892b4: f9403508     	ldr	x8, [x8, #0x68]
 46892b8: aa1303e0     	mov	x0, x19
 46892bc: d63f0100     	blr	x8
 46892c0: f9407668     	ldr	x8, [x19, #0xe8]
 46892c4: b40000e8     	cbz	x8, 0x46892e0 <_ChromeMain+0x4684044>
 46892c8: f9401109     	ldr	x9, [x8, #0x20]
 46892cc: eb16013f     	cmp	x9, x22
 46892d0: 54fffdc8     	b.hi	0x4689288 <_ChromeMain+0x4683fec>
 46892d4: 540001c2     	b.hs	0x468930c <_ChromeMain+0x4684070>
 46892d8: f9400508     	ldr	x8, [x8, #0x8]
 46892dc: b5ffff68     	cbnz	x8, 0x46892c8 <_ChromeMain+0x468402c>
 46892e0: b4000200     	cbz	x0, 0x4689320 <_ChromeMain+0x4684084>
 46892e4: 9706f97b     	bl	0x8478d0 <_ChromeMain+0x842634>
 46892e8: aa0003e8     	mov	x8, x0
 46892ec: f9400d08     	ldr	x8, [x8, #0x18]
 46892f0: f100011f     	cmp	x8, #0x0
 46892f4: 1a9f07e1     	cset	w1, ne
 46892f8: eb13011f     	cmp	x8, x19
 46892fc: fa401904     	ccmp	x8, #0x0, #0x4, ne
 4689300: 540001a0     	b.eq	0x4689334 <_ChromeMain+0x4684098>
 4689304: f940c508     	ldr	x8, [x8, #0x188]
 4689308: 17fffffa     	b	0x46892f0 <_ChromeMain+0x4684054>
 468930c: eb15011f     	cmp	x8, x21
 4689310: 54fffe80     	b.eq	0x46892e0 <_ChromeMain+0x4684044>
 4689314: f9401908     	ldr	x8, [x8, #0x30]
 4689318: b5000aa8     	cbnz	x8, 0x468946c <_ChromeMain+0x46841d0>
 468931c: b5fffe40     	cbnz	x0, 0x46892e4 <_ChromeMain+0x4684048>
 4689320: d2800008     	mov	x8, #0x0                ; =0
 4689324: 17fffff2     	b	0x46892ec <_ChromeMain+0x4684050>
 4689328: 52800001     	mov	w1, #0x0                ; =0
 468932c: 14000002     	b	0x4689334 <_ChromeMain+0x4684098>
 4689330: 52800021     	mov	w1, #0x1                ; =1
 4689334: f9400288     	ldr	x8, [x20]
 4689338: f9405108     	ldr	x8, [x8, #0xa0]
 468933c: aa1403e0     	mov	x0, x20
 4689340: d63f0100     	blr	x8
 4689344: aa1303e0     	mov	x0, x19
 4689348: 96fc5f8d     	bl	0x5a117c <_ChromeMain+0x59bee0>
 468934c: 97265b09     	bl	0x101ff70 <_ChromeMain+0x101acd4>
 4689350: f8418c08     	ldr	x8, [x0, #0x18]!
 4689354: b4000548     	cbz	x8, 0x46893fc <_ChromeMain+0x4684160>
 4689358: b9458269     	ldr	w9, [x19, #0x580]
 468935c: b940210a     	ldr	w10, [x8, #0x20]
 4689360: 6b0a013f     	cmp	w9, w10
 4689364: 5400058b     	b.lt	0x4689414 <_ChromeMain+0x4684178>
 4689368: 540005cc     	b.gt	0x4689420 <_ChromeMain+0x4684184>
 468936c: eb00011f     	cmp	x8, x0
 4689370: 54000460     	b.eq	0x46893fc <_ChromeMain+0x4684160>
 4689374: f9401500     	ldr	x0, [x8, #0x28]
 4689378: b4000420     	cbz	x0, 0x46893fc <_ChromeMain+0x4684160>
 468937c: f942ba68     	ldr	x8, [x19, #0x570]
 4689380: b40003e8     	cbz	x8, 0x46893fc <_ChromeMain+0x4684160>
 4689384: 9112c274     	add	x20, x19, #0x4b0
 4689388: 910003e8     	mov	x8, sp
 468938c: 972991bd     	bl	0x10eda80 <_ChromeMain+0x10e87e4>
 4689390: 9112c260     	add	x0, x19, #0x4b0
 4689394: 910003e1     	mov	x1, sp
 4689398: 97864018     	bl	0x28193f8 <_ChromeMain+0x281415c>
 468939c: 910003e0     	mov	x0, sp
 46893a0: 97298cb8     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 46893a4: f942ba68     	ldr	x8, [x19, #0x570]
 46893a8: f941b108     	ldr	x8, [x8, #0x360]
 46893ac: b4000288     	cbz	x8, 0x46893fc <_ChromeMain+0x4684160>
 46893b0: f941b109     	ldr	x9, [x8, #0x360]
 46893b4: b4000409     	cbz	x9, 0x4689434 <_ChromeMain+0x4684198>
 46893b8: f9401d2a     	ldr	x10, [x9, #0x38]
 46893bc: f942254a     	ldr	x10, [x10, #0x448]
 46893c0: b500036a     	cbnz	x10, 0x468942c <_ChromeMain+0x4684190>
 46893c4: f9401929     	ldr	x9, [x9, #0x30]
 46893c8: b40003c9     	cbz	x9, 0x4689440 <_ChromeMain+0x46841a4>
 46893cc: f942192a     	ldr	x10, [x9, #0x430]
 46893d0: b50003ea     	cbnz	x10, 0x468944c <_ChromeMain+0x46841b0>
 46893d4: f941f929     	ldr	x9, [x9, #0x3f0]
 46893d8: f100013f     	cmp	x9, #0x0
 46893dc: 1a9f07e9     	cset	w9, ne
 46893e0: f941b500     	ldr	x0, [x8, #0x368]
 46893e4: b40000c0     	cbz	x0, 0x46893fc <_ChromeMain+0x4684160>
 46893e8: 52800068     	mov	w8, #0x3                ; =3
 46893ec: 7100013f     	cmp	w9, #0x0
 46893f0: 1a9f1102     	csel	w2, w8, wzr, ne
 46893f4: 9a9413e1     	csel	x1, xzr, x20, ne
 46893f8: 97836bf2     	bl	0x27643c0 <_ChromeMain+0x275f124>
 46893fc: a95c7bfd     	ldp	x29, x30, [sp, #0x1c0]
 4689400: a95b4ff4     	ldp	x20, x19, [sp, #0x1b0]
 4689404: a95a57f6     	ldp	x22, x21, [sp, #0x1a0]
 4689408: a9596ffc     	ldp	x28, x27, [sp, #0x190]
 468940c: 910743ff     	add	sp, sp, #0x1d0
 4689410: d65f03c0     	ret
 4689414: f9400108     	ldr	x8, [x8]
 4689418: b5fffa28     	cbnz	x8, 0x468935c <_ChromeMain+0x46840c0>
 468941c: 17fffff8     	b	0x46893fc <_ChromeMain+0x4684160>
 4689420: f9400508     	ldr	x8, [x8, #0x8]
 4689424: b5fff9c8     	cbnz	x8, 0x468935c <_ChromeMain+0x46840c0>
 4689428: 17fffff5     	b	0x46893fc <_ChromeMain+0x4684160>
 468942c: 52800029     	mov	w9, #0x1                ; =1
 4689430: 17ffffec     	b	0x46893e0 <_ChromeMain+0x4684144>
 4689434: d4200000     	brk	#0
 4689438: d4400000     	hlt	#0
 468943c: d4200020     	brk	#0x1
 4689440: d4200000     	brk	#0
 4689444: d4400000     	hlt	#0
 4689448: d4200020     	brk	#0x1
 468944c: b9402149     	ldr	w9, [x10, #0x20]
 4689450: 7100193f     	cmp	w9, #0x6
 4689454: 1a9f17e9     	cset	w9, eq
 4689458: 17ffffe2     	b	0x46893e0 <_ChromeMain+0x4684144>
 468945c: b4fff2a0     	cbz	x0, 0x46892b0 <_ChromeMain+0x4684014>
 4689460: d4200000     	brk	#0
 4689464: d4400000     	hlt	#0
 4689468: d4200020     	brk	#0x1
 468946c: b4fff400     	cbz	x0, 0x46892ec <_ChromeMain+0x4684050>
 4689470: d4200000     	brk	#0
 4689474: d4400000     	hlt	#0
 4689478: d4200020     	brk	#0x1
 468947c: d503201f     	nop
 4689480: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4689484: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4689488: a9027bfd     	stp	x29, x30, [sp, #0x20]
 468948c: 910083fd     	add	x29, sp, #0x20
 4689490: aa0003f3     	mov	x19, x0
 4689494: f9424000     	ldr	x0, [x0, #0x480]
 4689498: f9400008     	ldr	x8, [x0]
 468949c: f9401908     	ldr	x8, [x8, #0x30]
 46894a0: d63f0100     	blr	x8
 46894a4: f942ce74     	ldr	x20, [x19, #0x598]
 46894a8: aa1303e0     	mov	x0, x19
 46894ac: 97490811     	bl	0x18cb4f0 <_ChromeMain+0x18c6254>
 46894b0: 370007c0     	tbnz	w0, #0x0, 0x46895a8 <_ChromeMain+0x468430c>
 46894b4: f9400268     	ldr	x8, [x19]
 46894b8: f9403508     	ldr	x8, [x8, #0x68]
 46894bc: aa1303e0     	mov	x0, x19
 46894c0: d63f0100     	blr	x8
 46894c4: aa1303f5     	mov	x21, x19
 46894c8: f84e8ea8     	ldr	x8, [x21, #0xe8]!
 46894cc: 90051bf6     	adrp	x22, 0xea05000 <dyld_stub_binder+0xea05000>
 46894d0: 911922d6     	add	x22, x22, #0x648
 46894d4: b4000248     	cbz	x8, 0x468951c <_ChromeMain+0x4684280>
 46894d8: f9401109     	ldr	x9, [x8, #0x20]
 46894dc: eb16013f     	cmp	x9, x22
 46894e0: 540000a8     	b.hi	0x46894f4 <_ChromeMain+0x4684258>
 46894e4: 54000142     	b.hs	0x468950c <_ChromeMain+0x4684270>
 46894e8: f9400508     	ldr	x8, [x8, #0x8]
 46894ec: b5ffff68     	cbnz	x8, 0x46894d8 <_ChromeMain+0x468423c>
 46894f0: 1400000b     	b	0x468951c <_ChromeMain+0x4684280>
 46894f4: f9400108     	ldr	x8, [x8]
 46894f8: b5ffff08     	cbnz	x8, 0x46894d8 <_ChromeMain+0x468423c>
 46894fc: 14000008     	b	0x468951c <_ChromeMain+0x4684280>
 4689500: f9400108     	ldr	x8, [x8]
 4689504: b50001e8     	cbnz	x8, 0x4689540 <_ChromeMain+0x46842a4>
 4689508: 14000014     	b	0x4689558 <_ChromeMain+0x46842bc>
 468950c: eb15011f     	cmp	x8, x21
 4689510: 54000060     	b.eq	0x468951c <_ChromeMain+0x4684280>
 4689514: f9401908     	ldr	x8, [x8, #0x30]
 4689518: b5000aa8     	cbnz	x8, 0x468966c <_ChromeMain+0x46843d0>
 468951c: b4000420     	cbz	x0, 0x46895a0 <_ChromeMain+0x4684304>
 4689520: 9706f8ec     	bl	0x8478d0 <_ChromeMain+0x842634>
 4689524: b40003e0     	cbz	x0, 0x46895a0 <_ChromeMain+0x4684304>
 4689528: f9400268     	ldr	x8, [x19]
 468952c: f9403508     	ldr	x8, [x8, #0x68]
 4689530: aa1303e0     	mov	x0, x19
 4689534: d63f0100     	blr	x8
 4689538: f9407668     	ldr	x8, [x19, #0xe8]
 468953c: b40000e8     	cbz	x8, 0x4689558 <_ChromeMain+0x46842bc>
 4689540: f9401109     	ldr	x9, [x8, #0x20]
 4689544: eb16013f     	cmp	x9, x22
 4689548: 54fffdc8     	b.hi	0x4689500 <_ChromeMain+0x4684264>
 468954c: 540001c2     	b.hs	0x4689584 <_ChromeMain+0x46842e8>
 4689550: f9400508     	ldr	x8, [x8, #0x8]
 4689554: b5ffff68     	cbnz	x8, 0x4689540 <_ChromeMain+0x46842a4>
 4689558: b4000200     	cbz	x0, 0x4689598 <_ChromeMain+0x46842fc>
 468955c: 9706f8dd     	bl	0x8478d0 <_ChromeMain+0x842634>
 4689560: aa0003e8     	mov	x8, x0
 4689564: f9400d08     	ldr	x8, [x8, #0x18]
 4689568: f100011f     	cmp	x8, #0x0
 468956c: 1a9f07e1     	cset	w1, ne
 4689570: eb13011f     	cmp	x8, x19
 4689574: fa401904     	ccmp	x8, #0x0, #0x4, ne
 4689578: 540001a0     	b.eq	0x46895ac <_ChromeMain+0x4684310>
 468957c: f940c508     	ldr	x8, [x8, #0x188]
 4689580: 17fffffa     	b	0x4689568 <_ChromeMain+0x46842cc>
 4689584: eb15011f     	cmp	x8, x21
 4689588: 54fffe80     	b.eq	0x4689558 <_ChromeMain+0x46842bc>
 468958c: f9401908     	ldr	x8, [x8, #0x30]
 4689590: b5000768     	cbnz	x8, 0x468967c <_ChromeMain+0x46843e0>
 4689594: b5fffe40     	cbnz	x0, 0x468955c <_ChromeMain+0x46842c0>
 4689598: d2800008     	mov	x8, #0x0                ; =0
 468959c: 17fffff2     	b	0x4689564 <_ChromeMain+0x46842c8>
 46895a0: 52800001     	mov	w1, #0x0                ; =0
 46895a4: 14000002     	b	0x46895ac <_ChromeMain+0x4684310>
 46895a8: 52800021     	mov	w1, #0x1                ; =1
 46895ac: f9400288     	ldr	x8, [x20]
 46895b0: f9405108     	ldr	x8, [x8, #0xa0]
 46895b4: aa1403e0     	mov	x0, x20
 46895b8: d63f0100     	blr	x8
 46895bc: aa1303e0     	mov	x0, x19
 46895c0: 96fc5eef     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46895c4: f942ba68     	ldr	x8, [x19, #0x570]
 46895c8: b4000328     	cbz	x8, 0x468962c <_ChromeMain+0x4684390>
 46895cc: f941b108     	ldr	x8, [x8, #0x360]
 46895d0: b40002e8     	cbz	x8, 0x468962c <_ChromeMain+0x4684390>
 46895d4: f941b109     	ldr	x9, [x8, #0x360]
 46895d8: b4000369     	cbz	x9, 0x4689644 <_ChromeMain+0x46843a8>
 46895dc: f9401d2a     	ldr	x10, [x9, #0x38]
 46895e0: f942254a     	ldr	x10, [x10, #0x448]
 46895e4: b50002ca     	cbnz	x10, 0x468963c <_ChromeMain+0x46843a0>
 46895e8: f9401929     	ldr	x9, [x9, #0x30]
 46895ec: b4000329     	cbz	x9, 0x4689650 <_ChromeMain+0x46843b4>
 46895f0: f942192a     	ldr	x10, [x9, #0x430]
 46895f4: b500034a     	cbnz	x10, 0x468965c <_ChromeMain+0x46843c0>
 46895f8: f941f929     	ldr	x9, [x9, #0x3f0]
 46895fc: f100013f     	cmp	x9, #0x0
 4689600: 1a9f07e9     	cset	w9, ne
 4689604: f941b500     	ldr	x0, [x8, #0x368]
 4689608: b4000120     	cbz	x0, 0x468962c <_ChromeMain+0x4684390>
 468960c: 52800068     	mov	w8, #0x3                ; =3
 4689610: 7100013f     	cmp	w9, #0x0
 4689614: 1a9f1102     	csel	w2, w8, wzr, ne
 4689618: d2800001     	mov	x1, #0x0                ; =0
 468961c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4689620: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4689624: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4689628: 17836b66     	b	0x27643c0 <_ChromeMain+0x275f124>
 468962c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4689630: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4689634: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4689638: d65f03c0     	ret
 468963c: 52800029     	mov	w9, #0x1                ; =1
 4689640: 17fffff1     	b	0x4689604 <_ChromeMain+0x4684368>
 4689644: d4200000     	brk	#0
 4689648: d4400000     	hlt	#0
 468964c: d4200020     	brk	#0x1
 4689650: d4200000     	brk	#0
 4689654: d4400000     	hlt	#0
 4689658: d4200020     	brk	#0x1
 468965c: b9402149     	ldr	w9, [x10, #0x20]
 4689660: 7100193f     	cmp	w9, #0x6
 4689664: 1a9f17e9     	cset	w9, eq
 4689668: 17ffffe7     	b	0x4689604 <_ChromeMain+0x4684368>
 468966c: b4fff5e0     	cbz	x0, 0x4689528 <_ChromeMain+0x468428c>
 4689670: d4200000     	brk	#0
 4689674: d4400000     	hlt	#0
 4689678: d4200020     	brk	#0x1
 468967c: b4fff740     	cbz	x0, 0x4689564 <_ChromeMain+0x46842c8>
 4689680: d4200000     	brk	#0
 4689684: d4400000     	hlt	#0
 4689688: d4200020     	brk	#0x1
 468968c: 00000000     	udf	#0x0
