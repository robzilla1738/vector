
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41815c0:      	stp	x28, x27, [sp, #-0x60]!
 41815c4:      	stp	x26, x25, [sp, #0x10]
 41815c8:      	stp	x24, x23, [sp, #0x20]
 41815cc:      	stp	x22, x21, [sp, #0x30]
 41815d0:      	stp	x20, x19, [sp, #0x40]
 41815d4:      	stp	x29, x30, [sp, #0x50]
 41815d8:      	add	x29, sp, #0x50
 41815dc:      	sub	sp, sp, #0x310
 41815e0:      	mov	x22, x3
 41815e4:      	mov	x21, x2
 41815e8:      	mov	x23, x1
 41815ec:      	mov	x20, x0
 41815f0:      	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 41815f4:      	ldr	x8, [x8, #0x1f0]
 41815f8:      	ldr	x8, [x8]
 41815fc:      	stur	x8, [x29, #-0x68]
 4181600:      	and	x8, x1, #0xfffffffc00000000
 4181604:      	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4181608:      	ldr	x9, [x28, #0x88]
 418160c:      	cmp	x8, x9
 4181610:      	b.ne	0x418161c <_ChromeMain+0x417c380>
 4181614:      	mov	x0, x23
 4181618:      	bl	0x142fc <_ChromeMain+0xf060>
 418161c:      	ldr	x0, [x20, #0x20]
 4181620:      	and	x8, x0, #0xfffffffc00000000
 4181624:      	ldr	x9, [x28, #0x88]
 4181628:      	cmp	x8, x9
 418162c:      	b.ne	0x4181634 <_ChromeMain+0x417c398>
 4181630:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4181634:      	str	x23, [x20, #0x20]
 4181638:      	ldr	x19, [x23, #0xc0]
 418163c:      	cbz	x19, 0x41829fc <_ChromeMain+0x417d760>
 4181640:      	mov	w8, #0x1                ; =1
 4181644:      	ldadd	w8, w8, [x19]
 4181648:      	mov	w9, #0x7fffffff         ; =2147483647
 418164c:      	cmp	w8, w9
 4181650:      	b.eq	0x4182ad8 <_ChromeMain+0x417d83c>
 4181654:      	ldr	x23, [x23, #0xc8]
 4181658:      	ldr	x0, [x20, #0x20]
 418165c:      	adrp	x1, 0x42a1000 <_ChromeMain+0x429bd64>
 4181660:      	add	x1, x1, #0x11c
 4181664:      	bl	0x4183b1c <_ChromeMain+0x417e880>
 4181668:      	ldapurb	w8, [x19, #0x4]
 418166c:      	cmp	w8, #0x0
 4181670:      	ccmp	x23, #0x0, #0x4, eq
 4181674:      	b.eq	0x41816e8 <_ChromeMain+0x417c44c>
 4181678:      	ldapurb	w8, [x19, #0x4]
 418167c:      	cbnz	w8, 0x4182b74 <_ChromeMain+0x417d8d8>
 4181680:      	ldr	x8, [x23, #0x18]
 4181684:      	ldrb	w8, [x8, #0x30]
 4181688:      	tbnz	w8, #0x0, 0x41816e8 <_ChromeMain+0x417c44c>
 418168c:      	cbz	w0, 0x41816c8 <_ChromeMain+0x417c42c>
 4181690:      	cbz	w21, 0x4181770 <_ChromeMain+0x417c4d4>
 4181694:      	ldr	x0, [x20, #0x20]
 4181698:      	adrp	x1, 0x42a1000 <_ChromeMain+0x429bd64>
 418169c:      	add	x1, x1, #0x55c
 41816a0:      	bl	0x4183b1c <_ChromeMain+0x417e880>
 41816a4:      	ldapurb	w8, [x19, #0x4]
 41816a8:      	cbz	w8, 0x4181740 <_ChromeMain+0x417c4a4>
 41816ac:      	ldr	x0, [x20, #0x20]
 41816b0:      	and	x8, x0, #0xfffffffc00000000
 41816b4:      	ldr	x9, [x28, #0x88]
 41816b8:      	cmp	x8, x9
 41816bc:      	b.ne	0x41816c4 <_ChromeMain+0x417c428>
 41816c0:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41816c4:      	str	xzr, [x20, #0x20]
 41816c8:      	mov	w8, #-0x1               ; =-1
 41816cc:      	ldaddal	w8, w8, [x19]
 41816d0:      	cmp	w8, #0x1
 41816d4:      	b.ne	0x4181708 <_ChromeMain+0x417c46c>
 41816d8:      	mov	x0, x19
 41816dc:      	mov	w1, #0x8                ; =8
 41816e0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41816e4:      	b	0x4181708 <_ChromeMain+0x417c46c>
 41816e8:      	ldr	x0, [x20, #0x20]
 41816ec:      	and	x8, x0, #0xfffffffc00000000
 41816f0:      	ldr	x9, [x28, #0x88]
 41816f4:      	cmp	x8, x9
 41816f8:      	b.ne	0x4181700 <_ChromeMain+0x417c464>
 41816fc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4181700:      	str	xzr, [x20, #0x20]
 4181704:      	cbnz	x19, 0x41816c8 <_ChromeMain+0x417c42c>
 4181708:      	ldur	x8, [x29, #-0x68]
 418170c:      	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4181710:      	ldr	x9, [x9, #0x1f0]
 4181714:      	ldr	x9, [x9]
 4181718:      	cmp	x9, x8
 418171c:      	b.ne	0x4182a10 <_ChromeMain+0x417d774>
 4181720:      	add	sp, sp, #0x310
 4181724:      	ldp	x29, x30, [sp, #0x50]
 4181728:      	ldp	x20, x19, [sp, #0x40]
 418172c:      	ldp	x22, x21, [sp, #0x30]
 4181730:      	ldp	x24, x23, [sp, #0x20]
 4181734:      	ldp	x26, x25, [sp, #0x10]
 4181738:      	ldp	x28, x27, [sp], #0x60
 418173c:      	ret
 4181740:      	ldapurb	w8, [x19, #0x4]
 4181744:      	cbnz	w8, 0x4182b80 <_ChromeMain+0x417d8e4>
 4181748:      	ldr	x8, [x23, #0x18]
 418174c:      	ldrb	w8, [x8, #0x30]
 4181750:      	cbnz	w8, 0x41816ac <_ChromeMain+0x417c410>
 4181754:      	cbz	w0, 0x41816c8 <_ChromeMain+0x417c42c>
 4181758:      	ldr	x0, [x20, #0x20]
 418175c:      	bl	0x417ba04 <_ChromeMain+0x4176768>
 4181760:      	cbz	w0, 0x4181770 <_ChromeMain+0x417c4d4>
 4181764:      	ldr	x0, [x20, #0x20]
 4181768:      	bl	0x417bb1c <_ChromeMain+0x4176880>
 418176c:      	tbnz	w0, #0x0, 0x41816c8 <_ChromeMain+0x417c42c>
 4181770:      	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 4181774:      	add	x0, x0, #0x2d8
