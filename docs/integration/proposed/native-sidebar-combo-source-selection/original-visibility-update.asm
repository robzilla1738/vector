
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4242480: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4242484: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4242488: a9027bfd     	stp	x29, x30, [sp, #0x20]
 424248c: 910083fd     	add	x29, sp, #0x20
 4242490: aa0003f3     	mov	x19, x0
 4242494: f941ac08     	ldr	x8, [x0, #0x358]
 4242498: b4000b28     	cbz	x8, 0x42425fc <_ChromeMain+0x423d360>
 424249c: b0053321     	adrp	x1, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 42424a0: 9125c021     	add	x1, x1, #0x970
 42424a4: 91056100     	add	x0, x8, #0x158
 42424a8: 96fb4881     	bl	0x1146ac <_ChromeMain+0x10f410>
 42424ac: b4000a80     	cbz	x0, 0x42425fc <_ChromeMain+0x423d360>
 42424b0: f941ae68     	ldr	x8, [x19, #0x358]
 42424b4: f9402100     	ldr	x0, [x8, #0x40]
 42424b8: f9400008     	ldr	x8, [x0]
 42424bc: f940b508     	ldr	x8, [x8, #0x168]
 42424c0: d63f0100     	blr	x8
 42424c4: aa0003f4     	mov	x20, x0
 42424c8: f941b668     	ldr	x8, [x19, #0x368]
 42424cc: b4000488     	cbz	x8, 0x424255c <_ChromeMain+0x423d2c0>
 42424d0: 9726e387     	bl	0xbfb2ec <_ChromeMain+0xbf6050>
 42424d4: aa0003f5     	mov	x21, x0
 42424d8: f941ae68     	ldr	x8, [x19, #0x358]
 42424dc: b0053321     	adrp	x1, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 42424e0: 9125c021     	add	x1, x1, #0x970
 42424e4: 91056100     	add	x0, x8, #0x158
 42424e8: 96fb4871     	bl	0x1146ac <_ChromeMain+0x10f410>
 42424ec: f9400002     	ldr	x2, [x0]
 42424f0: aa1503e0     	mov	x0, x21
 42424f4: 52802e61     	mov	w1, #0x173              ; =371
 42424f8: 9726e325     	bl	0xbfb18c <_ChromeMain+0xbf5ef0>
 42424fc: aa0003f5     	mov	x21, x0
 4242500: f0046501     	adrp	x1, 0xcee5000 <dyld_stub_binder+0xcee5000>
 4242504: 912c1021     	add	x1, x1, #0xb04
 4242508: aa1403e0     	mov	x0, x20
 424250c: 52800442     	mov	w2, #0x22               ; =34
 4242510: 97030ffc     	bl	0x306500 <_ChromeMain+0x301264>
 4242514: b4000255     	cbz	x21, 0x424255c <_ChromeMain+0x423d2c0>
 4242518: 35000060     	cbnz	w0, 0x4242524 <_ChromeMain+0x423d288>
 424251c: 52800c08     	mov	w8, #0x60               ; =96
 4242520: 14000004     	b	0x4242530 <_ChromeMain+0x423d294>
 4242524: 394332a8     	ldrb	w8, [x21, #0xcc]
 4242528: 36000a08     	tbz	w8, #0x0, 0x4242668 <_ChromeMain+0x423d3cc>
 424252c: 52800b08     	mov	w8, #0x58               ; =88
 4242530: f941be69     	ldr	x9, [x19, #0x378]
 4242534: f8686928     	ldr	x8, [x9, x8]
 4242538: 910de260     	add	x0, x19, #0x378
 424253c: d63f0100     	blr	x8
 4242540: 394e2268     	ldrb	w8, [x19, #0x388]
 4242544: 370000c8     	tbnz	w8, #0x0, 0x424255c <_ChromeMain+0x423d2c0>
 4242548: fd41f660     	ldr	d0, [x19, #0x3e8]
 424254c: 1e602008     	fcmp	d0, #0.0
 4242550: 54000061     	b.ne	0x424255c <_ChromeMain+0x423d2c0>
 4242554: 394332a8     	ldrb	w8, [x21, #0xcc]
 4242558: 35000ae8     	cbnz	w8, 0x42426b4 <_ChromeMain+0x423d418>
 424255c: f941ba68     	ldr	x8, [x19, #0x370]
 4242560: b40004e8     	cbz	x8, 0x42425fc <_ChromeMain+0x423d360>
 4242564: 9726e362     	bl	0xbfb2ec <_ChromeMain+0xbf6050>
 4242568: aa0003f5     	mov	x21, x0
 424256c: f941ae68     	ldr	x8, [x19, #0x358]
 4242570: b0053321     	adrp	x1, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 4242574: 9125c021     	add	x1, x1, #0x970
 4242578: 91056100     	add	x0, x8, #0x158
 424257c: 96fb484c     	bl	0x1146ac <_ChromeMain+0x10f410>
 4242580: f9400002     	ldr	x2, [x0]
 4242584: aa1503e0     	mov	x0, x21
 4242588: 52802e81     	mov	w1, #0x174              ; =372
 424258c: 9726e300     	bl	0xbfb18c <_ChromeMain+0xbf5ef0>
 4242590: aa0003f5     	mov	x21, x0
 4242594: f0046501     	adrp	x1, 0xcee5000 <dyld_stub_binder+0xcee5000>
 4242598: 912b0c21     	add	x1, x1, #0xac3
 424259c: aa1403e0     	mov	x0, x20
 42425a0: 528003a2     	mov	w2, #0x1d               ; =29
 42425a4: 97030fd7     	bl	0x306500 <_ChromeMain+0x301264>
 42425a8: 370000c0     	tbnz	w0, #0x0, 0x42425c0 <_ChromeMain+0x423d324>
 42425ac: b4000295     	cbz	x21, 0x42425fc <_ChromeMain+0x423d360>
 42425b0: 39523268     	ldrb	w8, [x19, #0x48c]
 42425b4: 35000088     	cbnz	w8, 0x42425c4 <_ChromeMain+0x423d328>
 42425b8: 52800c08     	mov	w8, #0x60               ; =96
 42425bc: 14000005     	b	0x42425d0 <_ChromeMain+0x423d334>
 42425c0: b40001f5     	cbz	x21, 0x42425fc <_ChromeMain+0x423d360>
 42425c4: 394332a8     	ldrb	w8, [x21, #0xcc]
 42425c8: 360003c8     	tbz	w8, #0x0, 0x4242640 <_ChromeMain+0x423d3a4>
 42425cc: 52800b08     	mov	w8, #0x58               ; =88
 42425d0: f9420269     	ldr	x9, [x19, #0x400]
 42425d4: f8686928     	ldr	x8, [x9, x8]
 42425d8: 91100260     	add	x0, x19, #0x400
 42425dc: d63f0100     	blr	x8
 42425e0: 39504268     	ldrb	w8, [x19, #0x410]
 42425e4: 370000c8     	tbnz	w8, #0x0, 0x42425fc <_ChromeMain+0x423d360>
 42425e8: fd423a60     	ldr	d0, [x19, #0x470]
 42425ec: 1e602008     	fcmp	d0, #0.0
 42425f0: 54000061     	b.ne	0x42425fc <_ChromeMain+0x423d360>
 42425f4: 394332a8     	ldrb	w8, [x21, #0xcc]
 42425f8: 350004c8     	cbnz	w8, 0x4242690 <_ChromeMain+0x423d3f4>
 42425fc: f941b668     	ldr	x8, [x19, #0x368]
 4242600: b40000a8     	cbz	x8, 0x4242614 <_ChromeMain+0x423d378>
 4242604: 39472108     	ldrb	w8, [x8, #0x1c8]
 4242608: 36000068     	tbz	w8, #0x0, 0x4242614 <_ChromeMain+0x423d378>
 424260c: 52800028     	mov	w8, #0x1                ; =1
 4242610: 14000004     	b	0x4242620 <_ChromeMain+0x423d384>
 4242614: f941ba68     	ldr	x8, [x19, #0x370]
 4242618: b4000048     	cbz	x8, 0x4242620 <_ChromeMain+0x423d384>
 424261c: 39472108     	ldrb	w8, [x8, #0x1c8]
 4242620: f9400269     	ldr	x9, [x19]
 4242624: f9405122     	ldr	x2, [x9, #0xa0]
 4242628: 12000101     	and	w1, w8, #0x1
 424262c: aa1303e0     	mov	x0, x19
 4242630: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4242634: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4242638: a8c357f6     	ldp	x22, x21, [sp], #0x30
 424263c: d61f0040     	br	x2
 4242640: 52800028     	mov	w8, #0x1                ; =1
 4242644: 390332a8     	strb	w8, [x21, #0xcc]
 4242648: b9407aa9     	ldr	w9, [x21, #0x78]
 424264c: 7100053f     	cmp	w9, #0x1
 4242650: 5400044a     	b.ge	0x42426d8 <_ChromeMain+0x423d43c>
 4242654: 3901f2bf     	strb	wzr, [x21, #0x7c]
 4242658: aa1503e0     	mov	x0, x21
 424265c: aa1503e1     	mov	x1, x21
 4242660: 9733965c     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4242664: 17ffffda     	b	0x42425cc <_ChromeMain+0x423d330>
 4242668: 52800028     	mov	w8, #0x1                ; =1
 424266c: 390332a8     	strb	w8, [x21, #0xcc]
 4242670: b9407aa9     	ldr	w9, [x21, #0x78]
 4242674: 7100053f     	cmp	w9, #0x1
 4242678: 5400034a     	b.ge	0x42426e0 <_ChromeMain+0x423d444>
 424267c: 3901f2bf     	strb	wzr, [x21, #0x7c]
 4242680: aa1503e0     	mov	x0, x21
 4242684: aa1503e1     	mov	x1, x21
 4242688: 97339652     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 424268c: 17ffffa8     	b	0x424252c <_ChromeMain+0x423d290>
 4242690: 390332bf     	strb	wzr, [x21, #0xcc]
 4242694: b9407aa8     	ldr	w8, [x21, #0x78]
 4242698: 7100051f     	cmp	w8, #0x1
 424269c: 540002ca     	b.ge	0x42426f4 <_ChromeMain+0x423d458>
 42426a0: 3901f2bf     	strb	wzr, [x21, #0x7c]
 42426a4: aa1503e0     	mov	x0, x21
 42426a8: aa1503e1     	mov	x1, x21
 42426ac: 97339649     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 42426b0: 17ffffd3     	b	0x42425fc <_ChromeMain+0x423d360>
 42426b4: 390332bf     	strb	wzr, [x21, #0xcc]
 42426b8: b9407aa8     	ldr	w8, [x21, #0x78]
 42426bc: 7100051f     	cmp	w8, #0x1
 42426c0: 5400014a     	b.ge	0x42426e8 <_ChromeMain+0x423d44c>
 42426c4: 3901f2bf     	strb	wzr, [x21, #0x7c]
 42426c8: aa1503e0     	mov	x0, x21
 42426cc: aa1503e1     	mov	x1, x21
 42426d0: 97339640     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 42426d4: 17ffffa2     	b	0x424255c <_ChromeMain+0x423d2c0>
 42426d8: 3901f2a8     	strb	w8, [x21, #0x7c]
 42426dc: 17ffffbc     	b	0x42425cc <_ChromeMain+0x423d330>
 42426e0: 3901f2a8     	strb	w8, [x21, #0x7c]
 42426e4: 17ffff92     	b	0x424252c <_ChromeMain+0x423d290>
 42426e8: 52800028     	mov	w8, #0x1                ; =1
 42426ec: 3901f2a8     	strb	w8, [x21, #0x7c]
 42426f0: 17ffff9b     	b	0x424255c <_ChromeMain+0x423d2c0>
 42426f4: 52800028     	mov	w8, #0x1                ; =1
 42426f8: 3901f2a8     	strb	w8, [x21, #0x7c]
 42426fc: 17ffffc0     	b	0x42425fc <_ChromeMain+0x423d360>
