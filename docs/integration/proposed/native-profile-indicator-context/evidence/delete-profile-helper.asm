
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7ac93d8: d10143ff     	sub	sp, sp, #0x50
 7ac93dc: a9015ff8     	stp	x24, x23, [sp, #0x10]
 7ac93e0: a90257f6     	stp	x22, x21, [sp, #0x20]
 7ac93e4: a9034ff4     	stp	x20, x19, [sp, #0x30]
 7ac93e8: a9047bfd     	stp	x29, x30, [sp, #0x40]
 7ac93ec: 910103fd     	add	x29, sp, #0x40
 7ac93f0: aa0303f5     	mov	x21, x3
 7ac93f4: aa0203f3     	mov	x19, x2
 7ac93f8: aa0103f7     	mov	x23, x1
 7ac93fc: aa0003f4     	mov	x20, x0
 7ac9400: aa0103e0     	mov	x0, x1
 7ac9404: 94000899     	bl	0x7acb668 <_ChromeMain+0x7ac63cc>
 7ac9408: 35000280     	cbnz	w0, 0x7ac9458 <_ChromeMain+0x7ac41bc>
 7ac940c: b50000f3     	cbnz	x19, 0x7ac9428 <_ChromeMain+0x7ac418c>
 7ac9410: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 7ac9414: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 7ac9418: a94257f6     	ldp	x22, x21, [sp, #0x20]
 7ac941c: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 7ac9420: 910143ff     	add	sp, sp, #0x50
 7ac9424: d65f03c0     	ret
 7ac9428: 12800008     	mov	w8, #-0x1               ; =-1
 7ac942c: b8e80268     	ldaddal	w8, w8, [x19]
 7ac9430: 7100051f     	cmp	w8, #0x1
 7ac9434: 54fffee1     	b.ne	0x7ac9410 <_ChromeMain+0x7ac4174>
 7ac9438: f9400a61     	ldr	x1, [x19, #0x10]
 7ac943c: aa1303e0     	mov	x0, x19
 7ac9440: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 7ac9444: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 7ac9448: a94257f6     	ldp	x22, x21, [sp, #0x20]
 7ac944c: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 7ac9450: 910143ff     	add	sp, sp, #0x50
 7ac9454: d61f0020     	br	x1
 7ac9458: f9400280     	ldr	x0, [x20]
 7ac945c: b4000d40     	cbz	x0, 0x7ac9604 <_ChromeMain+0x7ac4368>
 7ac9460: 967d59ec     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 7ac9464: aa0003f6     	mov	x22, x0
 7ac9468: aa1703e1     	mov	x1, x23
 7ac946c: 967d5a25     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 7ac9470: b4000080     	cbz	x0, 0x7ac9480 <_ChromeMain+0x7ac41e4>
 7ac9474: aa0003e1     	mov	x1, x0
 7ac9478: aa1603e0     	mov	x0, x22
 7ac947c: 94001619     	bl	0x7acece0 <_ChromeMain+0x7ac9a44>
 7ac9480: aa1503e0     	mov	x0, x21
 7ac9484: 97ffffbf     	bl	0x7ac9380 <_ChromeMain+0x7ac40e4>
 7ac9488: 52800100     	mov	w0, #0x8                ; =8
 7ac948c: 961517b7     	bl	0xf368 <_ChromeMain+0xa0cc>
 7ac9490: aa0003f6     	mov	x22, x0
 7ac9494: 52800381     	mov	w1, #0x1c               ; =28
 7ac9498: 52800002     	mov	w2, #0x0                ; =0
 7ac949c: 96b58fe2     	bl	0x282d424 <_ChromeMain+0x2828188>
 7ac94a0: f9400280     	ldr	x0, [x20]
 7ac94a4: b4000b60     	cbz	x0, 0x7ac9610 <_ChromeMain+0x7ac4374>
 7ac94a8: aa1703e1     	mov	x1, x23
 7ac94ac: 96b3707e     	bl	0x27a56a4 <_ChromeMain+0x27a0408>
 7ac94b0: b5000180     	cbnz	x0, 0x7ac94e0 <_ChromeMain+0x7ac4244>
 7ac94b4: aa1403e0     	mov	x0, x20
 7ac94b8: aa1603e1     	mov	x1, x22
 7ac94bc: d2800002     	mov	x2, #0x0                ; =0
 7ac94c0: aa1303e3     	mov	x3, x19
 7ac94c4: aa1703e4     	mov	x4, x23
 7ac94c8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 7ac94cc: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 7ac94d0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 7ac94d4: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 7ac94d8: 910143ff     	add	sp, sp, #0x50
 7ac94dc: 14000050     	b	0x7ac961c <_ChromeMain+0x7ac4380>
 7ac94e0: aa0003f5     	mov	x21, x0
 7ac94e4: 96c0e615     	bl	0x2b02d38 <_ChromeMain+0x2afda9c>
 7ac94e8: 52800021     	mov	w1, #0x1                ; =1
 7ac94ec: 9407c891     	bl	0x7cbb730 <_ChromeMain+0x7cb6494>
 7ac94f0: 52800300     	mov	w0, #0x18               ; =24
 7ac94f4: 9615179d     	bl	0xf368 <_ChromeMain+0xa0cc>
 7ac94f8: aa0003f7     	mov	x23, x0
 7ac94fc: aa1503e1     	mov	x1, x21
 7ac9500: 52800402     	mov	w2, #0x20               ; =32
 7ac9504: 96b9bc44     	bl	0x2938614 <_ChromeMain+0x2933378>
 7ac9508: 925e7688     	and	x8, x20, #0xfffffffc00000000
 7ac950c: b0038749     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 7ac9510: f9404529     	ldr	x9, [x9, #0x88]
 7ac9514: eb09011f     	cmp	x8, x9
 7ac9518: 54000061     	b.ne	0x7ac9524 <_ChromeMain+0x7ac4288>
 7ac951c: aa1403e0     	mov	x0, x20
 7ac9520: 96152b77     	bl	0x142fc <_ChromeMain+0xf060>
 7ac9524: 52800a00     	mov	w0, #0x50               ; =80
 7ac9528: 96151790     	bl	0xf368 <_ChromeMain+0xa0cc>
 7ac952c: aa0003f8     	mov	x24, x0
 7ac9530: b0fe3481     	adrp	x1, 0x415a000 <_ChromeMain+0x4154d64>
 7ac9534: 91192021     	add	x1, x1, #0x648
 7ac9538: b0fe3482     	adrp	x2, 0x415a000 <_ChromeMain+0x4154d64>
 7ac953c: 911af042     	add	x2, x2, #0x6bc
 7ac9540: 96aab7fc     	bl	0x2577530 <_ChromeMain+0x2572294>
 7ac9544: 100006c8     	adr	x8, 0x7ac961c <_ChromeMain+0x7ac4380>
 7ac9548: d503201f     	nop
 7ac954c: a9027c08     	stp	x8, xzr, [x0, #0x20]
 7ac9550: a9035814     	stp	x20, x22, [x0, #0x30]
 7ac9554: a9044c17     	stp	x23, x19, [x0, #0x40]
 7ac9558: 52800600     	mov	w0, #0x30               ; =48
 7ac955c: 96151783     	bl	0xf368 <_ChromeMain+0xa0cc>
 7ac9560: b0fe3481     	adrp	x1, 0x415a000 <_ChromeMain+0x4154d64>
 7ac9564: 911d9021     	add	x1, x1, #0x764
 7ac9568: b0fe2542     	adrp	x2, 0x3f72000 <_ChromeMain+0x3f6cd64>
 7ac956c: 91250042     	add	x2, x2, #0x940
 7ac9570: 96aab7f0     	bl	0x2577530 <_ChromeMain+0x2572294>
 7ac9574: f9001418     	str	x24, [x0, #0x28]
 7ac9578: f90007e0     	str	x0, [sp, #0x8]
 7ac957c: 52800600     	mov	w0, #0x30               ; =48
 7ac9580: 9615177a     	bl	0xf368 <_ChromeMain+0xa0cc>
 7ac9584: d0fd4ca1     	adrp	x1, 0x245f000 <_ChromeMain+0x2459d64>
 7ac9588: 91050021     	add	x1, x1, #0x140
 7ac958c: b0fd1b22     	adrp	x2, 0x1e2e000 <_ChromeMain+0x1e28d64>
 7ac9590: 913c0042     	add	x2, x2, #0xf00
 7ac9594: 96aab7e7     	bl	0x2577530 <_ChromeMain+0x2572294>
 7ac9598: 10010008     	adr	x8, 0x7acb598 <_ChromeMain+0x7ac62fc>
 7ac959c: d503201f     	nop
 7ac95a0: f9001008     	str	x8, [x0, #0x20]
 7ac95a4: f90003e0     	str	x0, [sp]
 7ac95a8: 910023e2     	add	x2, sp, #0x8
 7ac95ac: 910003e3     	mov	x3, sp
 7ac95b0: aa1503e0     	mov	x0, x21
 7ac95b4: 52800001     	mov	w1, #0x0                ; =0
 7ac95b8: 97fbba8a     	bl	0x79b7fe0 <_ChromeMain+0x79b2d44>
 7ac95bc: f94003e0     	ldr	x0, [sp]
 7ac95c0: b5000140     	cbnz	x0, 0x7ac95e8 <_ChromeMain+0x7ac434c>
 7ac95c4: f94007e0     	ldr	x0, [sp, #0x8]
 7ac95c8: b4fff240     	cbz	x0, 0x7ac9410 <_ChromeMain+0x7ac4174>
 7ac95cc: 12800008     	mov	w8, #-0x1               ; =-1
 7ac95d0: b8e80008     	ldaddal	w8, w8, [x0]
 7ac95d4: 7100051f     	cmp	w8, #0x1
 7ac95d8: 54fff1c1     	b.ne	0x7ac9410 <_ChromeMain+0x7ac4174>
 7ac95dc: f9400808     	ldr	x8, [x0, #0x10]
 7ac95e0: d63f0100     	blr	x8
 7ac95e4: 17ffff8b     	b	0x7ac9410 <_ChromeMain+0x7ac4174>
 7ac95e8: 12800008     	mov	w8, #-0x1               ; =-1
 7ac95ec: b8e80008     	ldaddal	w8, w8, [x0]
 7ac95f0: 7100051f     	cmp	w8, #0x1
 7ac95f4: 54fffe81     	b.ne	0x7ac95c4 <_ChromeMain+0x7ac4328>
 7ac95f8: f9400808     	ldr	x8, [x0, #0x10]
 7ac95fc: d63f0100     	blr	x8
 7ac9600: 17fffff1     	b	0x7ac95c4 <_ChromeMain+0x7ac4328>
 7ac9604: d4200000     	brk	#0
 7ac9608: d4400000     	hlt	#0
 7ac960c: d4200020     	brk	#0x1
 7ac9610: d4200000     	brk	#0
 7ac9614: d4400000     	hlt	#0
 7ac9618: d4200020     	brk	#0x1
