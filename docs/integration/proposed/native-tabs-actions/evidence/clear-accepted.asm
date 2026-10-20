
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4679580:      	sub	sp, sp, #0x90
 4679584:      	stp	x24, x23, [sp, #0x50]
 4679588:      	stp	x22, x21, [sp, #0x60]
 467958c:      	stp	x20, x19, [sp, #0x70]
 4679590:      	stp	x29, x30, [sp, #0x80]
 4679594:      	add	x29, sp, #0x80
 4679598:      	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 467959c:      	ldr	x8, [x8, #0x1f0]
 46795a0:      	ldr	x8, [x8]
 46795a4:      	stur	x8, [x29, #-0x38]
 46795a8:      	ldr	x19, [x0, #0x28]
 46795ac:      	str	xzr, [x0, #0x28]
 46795b0:      	cbz	x19, 0x4679624 <_ChromeMain+0x4674388>
 46795b4:      	ldr	x8, [x0, #0x30]
 46795b8:      	ldapurb	w9, [x19, #0x4]
 46795bc:      	cmp	w9, #0x0
 46795c0:      	ccmp	x8, #0x0, #0x4, eq
 46795c4:      	b.eq	0x4679614 <_ChromeMain+0x4674378>
 46795c8:      	ldapurb	w9, [x19, #0x4]
 46795cc:      	cbnz	w9, 0x4679888 <_ChromeMain+0x46745ec>
 46795d0:      	cmp	w1, #0x1
 46795d4:      	b.ne	0x4679614 <_ChromeMain+0x4674378>
 46795d8:      	ldr	x8, [x8, #0x458]
 46795dc:      	cbz	x8, 0x4679614 <_ChromeMain+0x4674378>
 46795e0:      	ldr	x8, [x8, #0x538]
 46795e4:      	cbz	x8, 0x4679614 <_ChromeMain+0x4674378>
 46795e8:      	ldr	x20, [x8, #0x88]
 46795ec:      	cbz	x20, 0x4679614 <_ChromeMain+0x4674378>
 46795f0:      	ldr	x8, [x20, #0x90]
 46795f4:      	cbz	x8, 0x4679614 <_ChromeMain+0x4674378>
 46795f8:      	ldr	x21, [x8, #0x40]
 46795fc:      	cbz	x21, 0x4679614 <_ChromeMain+0x4674378>
 4679600:      	mov	x0, x20
 4679604:      	mov	x1, x21
 4679608:      	bl	0x27900 <_ChromeMain+0x22664>
 467960c:      	cmn	w0, #0x1
 4679610:      	b.ne	0x4679664 <_ChromeMain+0x46743c8>
 4679614:      	mov	w8, #-0x1               ; =-1
 4679618:      	ldaddal	w8, w8, [x19]
 467961c:      	cmp	w8, #0x1
 4679620:      	b.eq	0x4679654 <_ChromeMain+0x46743b8>
 4679624:      	ldur	x8, [x29, #-0x38]
 4679628:      	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 467962c:      	ldr	x9, [x9, #0x1f0]
 4679630:      	ldr	x9, [x9]
 4679634:      	cmp	x9, x8
 4679638:      	b.ne	0x4679880 <_ChromeMain+0x46745e4>
 467963c:      	ldp	x29, x30, [sp, #0x80]
 4679640:      	ldp	x20, x19, [sp, #0x70]
 4679644:      	ldp	x22, x21, [sp, #0x60]
 4679648:      	ldp	x24, x23, [sp, #0x50]
 467964c:      	add	sp, sp, #0x90
 4679650:      	ret
 4679654:      	mov	x0, x19
 4679658:      	mov	w1, #0x8                ; =8
 467965c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4679660:      	b	0x4679624 <_ChromeMain+0x4674388>
 4679664:      	mov	x22, x0
 4679668:      	tbnz	w0, #0x1f, 0x4679894 <_ChromeMain+0x46745f8>
 467966c:      	ldr	x0, [x20]
 4679670:      	ldr	w8, [x0, #0x18]
 4679674:      	cmp	w22, w8
 4679678:      	b.ge	0x4679894 <_ChromeMain+0x46745f8>
 467967c:      	mov	w1, w22
 4679680:      	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4679684:      	ldrb	w8, [x0, #0x80]
 4679688:      	ldur	x9, [x0, #0x81]
 467968c:      	str	x9, [sp, #0x38]
 4679690:      	ldr	x9, [x0, #0x88]
 4679694:      	stur	x9, [sp, #0x3f]
 4679698:      	ldrb	w9, [x0, #0x90]
 467969c:      	ldur	w10, [x0, #0x91]
 46796a0:      	str	w10, [sp, #0x30]
 46796a4:      	ldr	w10, [x0, #0x94]
 46796a8:      	stur	w10, [sp, #0x33]
 46796ac:      	strb	w8, [sp, #0x18]
 46796b0:      	ldr	x8, [sp, #0x38]
 46796b4:      	stur	x8, [sp, #0x19]
 46796b8:      	ldur	x8, [sp, #0x3f]
 46796bc:      	str	x8, [sp, #0x20]
 46796c0:      	strb	w9, [sp, #0x28]
 46796c4:      	ldr	w8, [sp, #0x30]
 46796c8:      	stur	w8, [sp, #0x29]
 46796cc:      	mov	w8, w10
 46796d0:      	str	w8, [sp, #0x2c]
 46796d4:      	tbz	w9, #0x0, 0x4679710 <_ChromeMain+0x4674474>
 46796d8:      	ldr	x23, [x20, #0x8]
 46796dc:      	cbnz	x23, 0x4679834 <_ChromeMain+0x4674598>
 46796e0:      	mov	w0, #0x4                ; =4
 46796e4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 46796e8:      	str	x0, [sp]
 46796ec:      	str	w22, [x0]
 46796f0:      	mov	w8, #0x1                ; =1
 46796f4:      	dup.2d	v0, x8
 46796f8:      	stur	q0, [sp, #0x8]
 46796fc:      	mov	x1, sp
 4679700:      	mov	x0, x20
 4679704:      	bl	0x41e25dc <_ChromeMain+0x41dd340>
 4679708:      	ldr	x0, [sp]
 467970c:      	cbnz	x0, 0x46797c0 <_ChromeMain+0x4674524>
 4679710:      	ldr	x8, [x20]
 4679714:      	ldr	w8, [x8, #0x18]
 4679718:      	subs	w22, w8, #0x1
 467971c:      	b.mi	0x4679614 <_ChromeMain+0x4674378>
 4679720:      	b	0x4679740 <_ChromeMain+0x46744a4>
 4679724:      	mov	x0, x20
 4679728:      	mov	x1, x22
 467972c:      	mov	w2, #0x3                ; =3
 4679730:      	bl	0x7d51fb0 <_ChromeMain+0x7d4cd14>
 4679734:      	cmp	x22, #0x0
 4679738:      	sub	x22, x22, #0x1
 467973c:      	b.le	0x4679614 <_ChromeMain+0x4674378>
 4679740:      	ldr	x0, [x20]
 4679744:      	mov	x1, x22
 4679748:      	bl	0x105e2f8 <_ChromeMain+0x105905c>
 467974c:      	cbz	x0, 0x4679734 <_ChromeMain+0x4674498>
 4679750:      	mov	x1, x0
 4679754:      	ldr	x8, [x0, #0x40]
 4679758:      	cmp	x8, #0x0
 467975c:      	ccmp	x8, x21, #0x4, ne
 4679760:      	b.eq	0x4679734 <_ChromeMain+0x4674498>
 4679764:      	mov	x0, x20
 4679768:      	bl	0x41e5b74 <_ChromeMain+0x41e08d8>
 467976c:      	cbz	w0, 0x4679734 <_ChromeMain+0x4674498>
 4679770:      	ldr	x0, [x20]
 4679774:      	ldrsw	x8, [x0, #0x18]
 4679778:      	cmp	x22, x8
 467977c:      	b.ge	0x46798a0 <_ChromeMain+0x4674604>
 4679780:      	mov	x1, x22
 4679784:      	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4679788:      	ldr	q0, [x0, #0x80]
 467978c:      	ldr	x8, [x0, #0x90]
 4679790:      	str	x8, [sp, #0x10]
 4679794:      	str	q0, [sp]
 4679798:      	and	x8, x8, #0xff
 467979c:      	tbz	w8, #0x0, 0x4679724 <_ChromeMain+0x4674488>
 46797a0:      	ldr	x23, [x20, #0x8]
 46797a4:      	cbz	x23, 0x4679724 <_ChromeMain+0x4674488>
 46797a8:      	mov	x1, sp
 46797ac:      	mov	x0, x23
 46797b0:      	bl	0x6696a80 <_ChromeMain+0x66917e4>
 46797b4:      	ldr	x8, [x1]
 46797b8:      	cbz	x8, 0x4679724 <_ChromeMain+0x4674488>
 46797bc:      	b	0x46797fc <_ChromeMain+0x4674560>
 46797c0:      	ldr	x8, [sp, #0x8]
 46797c4:      	lsl	x9, x8, #2
 46797c8:      	cbz	x9, 0x46797e8 <_ChromeMain+0x467454c>
 46797cc:      	neg	x8, x8, lsl #2
 46797d0:      	add	x9, x9, x0
 46797d4:      	sub	x9, x9, #0x4
 46797d8:      	cbz	x9, 0x4679890 <_ChromeMain+0x46745f4>
 46797dc:      	sub	x9, x9, #0x4
 46797e0:      	add	x8, x8, #0x4
 46797e4:      	cbnz	x8, 0x46797d8 <_ChromeMain+0x467453c>
 46797e8:      	str	xzr, [sp, #0x8]
 46797ec:      	ldr	x8, [sp, #0x10]
 46797f0:      	lsl	x1, x8, #2
 46797f4:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46797f8:      	b	0x4679710 <_ChromeMain+0x4674474>
 46797fc:      	add	x9, x23, #0x8
 4679800:      	cmp	x8, x9
 4679804:      	b.eq	0x4679724 <_ChromeMain+0x4674488>
 4679808:      	ldrb	w8, [sp, #0x10]
 467980c:      	tbz	w8, #0x0, 0x4679884 <_ChromeMain+0x46745e8>
 4679810:      	ldr	x0, [x20, #0x8]
 4679814:      	mov	x1, sp
 4679818:      	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 467981c:      	cbz	x0, 0x4679724 <_ChromeMain+0x4674488>
 4679820:      	ldr	x8, [x0, #0xb8]
 4679824:      	cbz	x8, 0x4679724 <_ChromeMain+0x4674488>
 4679828:      	ldrb	w8, [x8, #0x11]
 467982c:      	tbnz	w8, #0x0, 0x4679734 <_ChromeMain+0x4674498>
 4679830:      	b	0x4679724 <_ChromeMain+0x4674488>
 4679834:      	add	x1, sp, #0x18
 4679838:      	mov	x0, x23
 467983c:      	bl	0x6696a80 <_ChromeMain+0x66917e4>
 4679840:      	ldr	x8, [x1]
 4679844:      	add	x9, x23, #0x8
 4679848:      	cmp	x8, #0x0
 467984c:      	ccmp	x8, x9, #0x4, ne
 4679850:      	b.eq	0x46796e0 <_ChromeMain+0x4674444>
 4679854:      	ldrb	w8, [sp, #0x28]
 4679858:      	tbz	w8, #0x0, 0x4679884 <_ChromeMain+0x46745e8>
 467985c:      	ldr	x0, [x20, #0x8]
 4679860:      	add	x1, sp, #0x18
 4679864:      	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 4679868:      	cbz	x0, 0x46796e0 <_ChromeMain+0x4674444>
 467986c:      	ldr	x8, [x0, #0xb8]
 4679870:      	cbz	x8, 0x46796e0 <_ChromeMain+0x4674444>
 4679874:      	ldrb	w8, [x8, #0x11]
 4679878:      	tbz	w8, #0x0, 0x46796e0 <_ChromeMain+0x4674444>
 467987c:      	b	0x4679710 <_ChromeMain+0x4674474>
 4679880:      	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4679884:      	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 4679888:      	brk	#0
 467988c:      	hlt	#0
 4679890:      	brk	#0x1
 4679894:      	stp	xzr, xzr, [sp, #0x18]
 4679898:      	str	xzr, [sp, #0x28]
 467989c:      	b	0x4679710 <_ChromeMain+0x4674474>
 46798a0:      	strb	wzr, [sp]
 46798a4:      	strb	wzr, [sp, #0x10]
 46798a8:      	b	0x4679724 <_ChromeMain+0x4674488>
