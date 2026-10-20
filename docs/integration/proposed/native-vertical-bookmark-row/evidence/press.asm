
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462059c:      	stp	x22, x21, [sp, #-0x30]!
 46205a0:      	stp	x20, x19, [sp, #0x10]
 46205a4:      	stp	x29, x30, [sp, #0x20]
 46205a8:      	add	x29, sp, #0x20
 46205ac:      	mov	x19, x1
 46205b0:      	mov	x20, x0
 46205b4:      	ldr	w8, [x1, #0x50]
 46205b8:      	and	w8, w8, #0xf800
 46205bc:      	cmp	w8, #0x2, lsl #12       ; =0x2000
 46205c0:      	b.ne	0x462062c <_ChromeMain+0x461b390>
 46205c4:      	ldr	x21, [x20, #0x408]
 46205c8:      	cbz	x21, 0x4620648 <_ChromeMain+0x461b3ac>
 46205cc:      	mov	w8, #0x1                ; =1
 46205d0:      	ldadd	w8, w8, [x21]
 46205d4:      	cmp	w8, #0x0
 46205d8:      	b.le	0x4620740 <_ChromeMain+0x461b4a4>
 46205dc:      	mov	w9, #0x7fffffff         ; =2147483647
 46205e0:      	cmp	w8, w9
 46205e4:      	b.eq	0x462074c <_ChromeMain+0x461b4b0>
 46205e8:      	ldr	x8, [x20, #0x408]
 46205ec:      	ldr	x8, [x8, #0x8]
 46205f0:      	mov	x0, x21
 46205f4:      	mov	x1, x20
 46205f8:      	mov	x2, x19
 46205fc:      	blr	x8
 4620600:      	mov	x22, x0
 4620604:      	mov	w8, #-0x1               ; =-1
 4620608:      	ldaddal	w8, w8, [x21]
 462060c:      	cmp	w8, #0x1
 4620610:      	b.ne	0x4620620 <_ChromeMain+0x461b384>
 4620614:      	ldr	x8, [x21, #0x10]
 4620618:      	mov	x0, x21
 462061c:      	blr	x8
 4620620:      	tbnz	w22, #0x0, 0x462072c <_ChromeMain+0x461b490>
 4620624:      	ldr	w8, [x19, #0x50]
 4620628:      	and	w8, w8, #0xf800
 462062c:      	cmp	w8, #0x800
 4620630:      	b.eq	0x4620650 <_ChromeMain+0x461b3b4>
 4620634:      	ldr	x9, [x20, #0x3e0]
 4620638:      	ldr	w9, [x9, #0xf8]
 462063c:      	cmp	w8, #0x1, lsl #12       ; =0x1000
 4620640:      	ccmp	w9, #0x0, #0x0, eq
 4620644:      	b.eq	0x4620650 <_ChromeMain+0x461b3b4>
 4620648:      	mov	w0, #0x0                ; =0
 462064c:      	b	0x4620730 <_ChromeMain+0x461b494>
 4620650:      	ldr	x8, [x20, #0x3d0]
 4620654:      	cbz	x8, 0x462066c <_ChromeMain+0x461b3d0>
 4620658:      	ldr	x0, [x8, #0x528]
 462065c:      	cbz	x0, 0x462066c <_ChromeMain+0x461b3d0>
 4620660:      	mov	x1, #0x0                ; =0
 4620664:      	mov	w2, #0x6                ; =6
 4620668:      	bl	0x27643c0 <_ChromeMain+0x275f124>
 462066c:      	mov	w8, #0x1                ; =1
 4620670:      	strb	w8, [x20, #0x444]
 4620674:      	ldr	w8, [x19, #0x50]
 4620678:      	and	w8, w8, #0xf800
 462067c:      	cmp	w8, #0x800
 4620680:      	b.ne	0x46206c4 <_ChromeMain+0x461b428>
 4620684:      	ldr	x8, [x20]
 4620688:      	ldr	x8, [x8, #0x168]
 462068c:      	mov	x0, x20
 4620690:      	mov	x1, x20
 4620694:      	blr	x8
 4620698:      	ldr	x8, [x20]
 462069c:      	ldr	x8, [x8, #0x68]
 46206a0:      	mov	x0, x20
 46206a4:      	blr	x8
 46206a8:      	cbz	x0, 0x46206c4 <_ChromeMain+0x461b428>
 46206ac:      	ldr	x8, [x20]
 46206b0:      	ldr	x8, [x8, #0x68]
 46206b4:      	mov	x0, x20
 46206b8:      	blr	x8
 46206bc:      	mov	x1, x20
 46206c0:      	bl	0xa6e3980 <_ChromeMain+0xa6de6e4>
 46206c4:      	ldr	w8, [x19, #0x50]
 46206c8:      	and	w8, w8, #0xf800
 46206cc:      	cmp	w8, #0x800
 46206d0:      	b.ne	0x462072c <_ChromeMain+0x461b490>
 46206d4:      	ldr	x21, [x20, #0x3f0]
 46206d8:      	mov	w0, #0x1                ; =1
 46206dc:      	cbz	x21, 0x4620730 <_ChromeMain+0x461b494>
 46206e0:      	ldadd	w0, w8, [x21]
 46206e4:      	cmp	w8, #0x0
 46206e8:      	b.le	0x4620758 <_ChromeMain+0x461b4bc>
 46206ec:      	mov	w9, #0x7fffffff         ; =2147483647
 46206f0:      	cmp	w8, w9
 46206f4:      	b.eq	0x4620764 <_ChromeMain+0x461b4c8>
 46206f8:      	ldr	x8, [x20, #0x3f0]
 46206fc:      	ldr	x8, [x8, #0x8]
 4620700:      	mov	x0, x21
 4620704:      	mov	x1, x20
 4620708:      	mov	x2, x19
 462070c:      	blr	x8
 4620710:      	mov	w8, #-0x1               ; =-1
 4620714:      	ldaddal	w8, w8, [x21]
 4620718:      	cmp	w8, #0x1
 462071c:      	b.ne	0x462072c <_ChromeMain+0x461b490>
 4620720:      	ldr	x8, [x21, #0x10]
 4620724:      	mov	x0, x21
 4620728:      	blr	x8
 462072c:      	mov	w0, #0x1                ; =1
 4620730:      	ldp	x29, x30, [sp, #0x20]
 4620734:      	ldp	x20, x19, [sp, #0x10]
 4620738:      	ldp	x22, x21, [sp], #0x30
 462073c:      	ret
 4620740:      	brk	#0
 4620744:      	hlt	#0
 4620748:      	brk	#0x1
 462074c:      	brk	#0
 4620750:      	hlt	#0
 4620754:      	brk	#0x1
 4620758:      	brk	#0
 462075c:      	hlt	#0
 4620760:      	brk	#0x1
 4620764:      	brk	#0
 4620768:      	hlt	#0
 462076c:      	brk	#0x1
		...
