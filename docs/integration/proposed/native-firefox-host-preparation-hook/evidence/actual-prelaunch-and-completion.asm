
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4106480: d10103ff     	sub	sp, sp, #0x40
 4106484: a90157f6     	stp	x22, x21, [sp, #0x10]
 4106488: a9024ff4     	stp	x20, x19, [sp, #0x20]
 410648c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4106490: 9100c3fd     	add	x29, sp, #0x30
 4106494: f9402808     	ldr	x8, [x0, #0x50]
 4106498: b40000c8     	cbz	x8, 0x41064b0 <_ChromeMain+0x4101214>
 410649c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 41064a0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 41064a4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 41064a8: 910103ff     	add	sp, sp, #0x40
 41064ac: d65f03c0     	ret
 41064b0: aa0003f3     	mov	x19, x0
 41064b4: f9402c08     	ldr	x8, [x0, #0x58]
 41064b8: b5ffff28     	cbnz	x8, 0x410649c <_ChromeMain+0x4101200>
 41064bc: 39418268     	ldrb	w8, [x19, #0x60]
 41064c0: 34fffee8     	cbz	w8, 0x410649c <_ChromeMain+0x4101200>
 41064c4: 39444a68     	ldrb	w8, [x19, #0x112]
 41064c8: 3707fea8     	tbnz	w8, #0x0, 0x410649c <_ChromeMain+0x4101200>
 41064cc: f9404268     	ldr	x8, [x19, #0x80]
 41064d0: b5fffe68     	cbnz	x8, 0x410649c <_ChromeMain+0x4101200>
 41064d4: 3941c668     	ldrb	w8, [x19, #0x71]
 41064d8: 37000668     	tbnz	w8, #0x0, 0x41065a4 <_ChromeMain+0x4101308>
 41064dc: 3941c268     	ldrb	w8, [x19, #0x70]
 41064e0: 3707fde8     	tbnz	w8, #0x0, 0x410649c <_ChromeMain+0x4101200>
 41064e4: 52800035     	mov	w21, #0x1               ; =1
 41064e8: 3901c275     	strb	w21, [x19, #0x70]
 41064ec: f9403668     	ldr	x8, [x19, #0x68]
 41064f0: b4000588     	cbz	x8, 0x41065a0 <_ChromeMain+0x4101304>
 41064f4: 91048260     	add	x0, x19, #0x120
 41064f8: 9766a1c1     	bl	0x1aaebfc <_ChromeMain+0x1aa9960>
 41064fc: aa0003f4     	mov	x20, x0
 4106500: f9409676     	ldr	x22, [x19, #0x128]
 4106504: 52800800     	mov	w0, #0x40               ; =64
 4106508: 96fc2398     	bl	0xf368 <_ChromeMain+0xa0cc>
 410650c: b9000015     	str	w21, [x0]
 4106510: 900068c8     	adrp	x8, 0x4e1e000 <_ChromeMain+0x4e18d64>
 4106514: 911d0108     	add	x8, x8, #0x740
 4106518: d0fff329     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 410651c: 912b0129     	add	x9, x9, #0xac0
 4106520: a900a408     	stp	x8, x9, [x0, #0x8]
 4106524: 90006788     	adrp	x8, 0x4df6000 <_ChromeMain+0x4df0d64>
 4106528: 91140108     	add	x8, x8, #0x500
 410652c: 10000989     	adr	x9, 0x410665c <_ChromeMain+0x41013c0>
 4106530: d503201f     	nop
 4106534: a901a408     	stp	x8, x9, [x0, #0x18]
 4106538: a902d01f     	stp	xzr, x20, [x0, #0x28]
 410653c: f9001c16     	str	x22, [x0, #0x38]
 4106540: f90007e0     	str	x0, [sp, #0x8]
 4106544: f9403674     	ldr	x20, [x19, #0x68]
 4106548: b4000854     	cbz	x20, 0x4106650 <_ChromeMain+0x41013b4>
 410654c: f900367f     	str	xzr, [x19, #0x68]
 4106550: f9400688     	ldr	x8, [x20, #0x8]
 4106554: 910023e1     	add	x1, sp, #0x8
 4106558: aa1403e0     	mov	x0, x20
 410655c: d63f0100     	blr	x8
 4106560: 12800008     	mov	w8, #-0x1               ; =-1
 4106564: b8e80288     	ldaddal	w8, w8, [x20]
 4106568: 7100051f     	cmp	w8, #0x1
 410656c: 54000081     	b.ne	0x410657c <_ChromeMain+0x41012e0>
 4106570: f9400a88     	ldr	x8, [x20, #0x10]
 4106574: aa1403e0     	mov	x0, x20
 4106578: d63f0100     	blr	x8
 410657c: f94007e0     	ldr	x0, [sp, #0x8]
 4106580: b4fff8e0     	cbz	x0, 0x410649c <_ChromeMain+0x4101200>
 4106584: 12800008     	mov	w8, #-0x1               ; =-1
 4106588: b8e80008     	ldaddal	w8, w8, [x0]
 410658c: 7100051f     	cmp	w8, #0x1
 4106590: 54fff861     	b.ne	0x410649c <_ChromeMain+0x4101200>
 4106594: f9400808     	ldr	x8, [x0, #0x10]
 4106598: d63f0100     	blr	x8
 410659c: 17ffffc0     	b	0x410649c <_ChromeMain+0x4101200>
 41065a0: 3901c675     	strb	w21, [x19, #0x71]
 41065a4: 52800500     	mov	w0, #0x28               ; =40
 41065a8: 96fc2370     	bl	0xf368 <_ChromeMain+0xa0cc>
 41065ac: aa0003f5     	mov	x21, x0
 41065b0: f9403e74     	ldr	x20, [x19, #0x78]
 41065b4: 91048260     	add	x0, x19, #0x120
 41065b8: 9766a191     	bl	0x1aaebfc <_ChromeMain+0x1aa9960>
 41065bc: aa0003e2     	mov	x2, x0
 41065c0: f9409663     	ldr	x3, [x19, #0x128]
 41065c4: aa1503e0     	mov	x0, x21
 41065c8: aa1403e1     	mov	x1, x20
 41065cc: 94dc6e0f     	bl	0x7821e08 <_ChromeMain+0x781cb6c>
 41065d0: 52803f00     	mov	w0, #0x1f8              ; =504
 41065d4: 96fc2365     	bl	0xf368 <_ChromeMain+0xa0cc>
 41065d8: aa0003f4     	mov	x20, x0
 41065dc: 91048260     	add	x0, x19, #0x120
 41065e0: 9766a187     	bl	0x1aaebfc <_ChromeMain+0x1aa9960>
 41065e4: aa0003e1     	mov	x1, x0
 41065e8: f9409662     	ldr	x2, [x19, #0x128]
 41065ec: 79422264     	ldrh	w4, [x19, #0x110]
 41065f0: 91022263     	add	x3, x19, #0x88
 41065f4: aa1403e0     	mov	x0, x20
 41065f8: aa1503e5     	mov	x5, x21
 41065fc: 94dc5bd8     	bl	0x781d55c <_ChromeMain+0x78182c0>
 4106600: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4106604: 90055575     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4106608: f94046a9     	ldr	x9, [x21, #0x88]
 410660c: eb09011f     	cmp	x8, x9
 4106610: 54000061     	b.ne	0x410661c <_ChromeMain+0x4101380>
 4106614: aa1403e0     	mov	x0, x20
 4106618: 96fc3739     	bl	0x142fc <_ChromeMain+0xf060>
 410661c: f9404260     	ldr	x0, [x19, #0x80]
 4106620: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4106624: f94046a9     	ldr	x9, [x21, #0x88]
 4106628: eb09011f     	cmp	x8, x9
 410662c: 54000041     	b.ne	0x4106634 <_ChromeMain+0x4101398>
 4106630: 96fc8105     	bl	0x26a44 <_ChromeMain+0x217a8>
 4106634: f9004274     	str	x20, [x19, #0x80]
 4106638: aa1403e0     	mov	x0, x20
 410663c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4106640: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4106644: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4106648: 910103ff     	add	sp, sp, #0x40
 410664c: 14dc5c15     	b	0x781d6a0 <_ChromeMain+0x7818404>
 4106650: d4200000     	brk	#0
 4106654: d4400000     	hlt	#0
 4106658: d4200020     	brk	#0x1
 410665c: 39444808     	ldrb	w8, [x0, #0x112]
 4106660: 36000048     	tbz	w8, #0x0, 0x4106668 <_ChromeMain+0x41013cc>
 4106664: d65f03c0     	ret
 4106668: 36000081     	tbz	w1, #0x0, 0x4106678 <_ChromeMain+0x41013dc>
 410666c: 52800028     	mov	w8, #0x1                ; =1
 4106670: 3901c408     	strb	w8, [x0, #0x71]
 4106674: 17ffff83     	b	0x4106480 <_ChromeMain+0x41011e4>
 4106678: 14dc67de     	b	0x78205f0 <_ChromeMain+0x781b354>
