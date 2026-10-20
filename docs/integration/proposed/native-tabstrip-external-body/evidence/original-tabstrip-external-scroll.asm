
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4129628:      	ldrb	w8, [x0, #0x369]
 412962c:      	cmp	w8, w1
 4129630:      	b.ne	0x4129638 <_ChromeMain+0x412439c>
 4129634:      	ret
 4129638:      	stp	x22, x21, [sp, #-0x30]!
 412963c:      	stp	x20, x19, [sp, #0x10]
 4129640:      	stp	x29, x30, [sp, #0x20]
 4129644:      	add	x29, sp, #0x20
 4129648:      	mov	x19, x0
 412964c:      	strb	w1, [x0, #0x369]
 4129650:      	ldr	x20, [x0, #0x330]
 4129654:      	and	x8, x20, #0xfffffffc00000000
 4129658:      	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 412965c:      	ldr	x9, [x22, #0x88]
 4129660:      	cmp	x8, x9
 4129664:      	b.ne	0x4129670 <_ChromeMain+0x41243d4>
 4129668:      	mov	x0, x20
 412966c:      	bl	0x142fc <_ChromeMain+0xf060>
 4129670:      	ldr	x21, [x19, #0x358]
 4129674:      	and	x8, x21, #0xfffffffc00000000
 4129678:      	ldr	x9, [x22, #0x88]
 412967c:      	cmp	x8, x9
 4129680:      	b.ne	0x41296c0 <_ChromeMain+0x4124424>
 4129684:      	mov	x0, x21
 4129688:      	bl	0x142fc <_ChromeMain+0xf060>
 412968c:      	cbz	x20, 0x41296c4 <_ChromeMain+0x4124428>
 4129690:      	ldrb	w8, [x19, #0x369]
 4129694:      	cbnz	w8, 0x4129710 <_ChromeMain+0x4124474>
 4129698:      	ldr	x8, [x20]
 412969c:      	ldr	x8, [x8, #0xa0]
 41296a0:      	mov	x0, x20
 41296a4:      	mov	w1, #0x1                ; =1
 41296a8:      	blr	x8
 41296ac:      	mov	x0, x19
 41296b0:      	mov	x1, x20
 41296b4:      	bl	0x78aae3c <_ChromeMain+0x78a5ba0>
 41296b8:      	cbz	x21, 0x41296c8 <_ChromeMain+0x412442c>
 41296bc:      	b	0x4129740 <_ChromeMain+0x41244a4>
 41296c0:      	cbnz	x20, 0x4129690 <_ChromeMain+0x41243f4>
 41296c4:      	cbnz	x21, 0x4129740 <_ChromeMain+0x41244a4>
 41296c8:      	and	x8, x21, #0xfffffffc00000000
 41296cc:      	ldr	x9, [x22, #0x88]
 41296d0:      	cmp	x8, x9
 41296d4:      	b.ne	0x41296e0 <_ChromeMain+0x4124444>
 41296d8:      	mov	x0, x21
 41296dc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41296e0:      	and	x8, x20, #0xfffffffc00000000
 41296e4:      	ldr	x9, [x22, #0x88]
 41296e8:      	cmp	x8, x9
 41296ec:      	b.ne	0x41296f8 <_ChromeMain+0x412445c>
 41296f0:      	mov	x0, x20
 41296f4:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41296f8:      	mov	x0, x19
 41296fc:      	mov	w1, #0x0                ; =0
 4129700:      	ldp	x29, x30, [sp, #0x20]
 4129704:      	ldp	x20, x19, [sp, #0x10]
 4129708:      	ldp	x22, x21, [sp], #0x30
 412970c:      	b	0x630474 <_ChromeMain+0x62b1d8>
 4129710:      	mov	x0, x20
 4129714:      	mov	w1, #0x0                ; =0
 4129718:      	bl	0xa6a60f4 <_ChromeMain+0xa6a0e58>
 412971c:      	mov	x0, x20
 4129720:      	mov	w1, #0x0                ; =0
 4129724:      	bl	0xa6a6044 <_ChromeMain+0xa6a0da8>
 4129728:      	ldr	x8, [x20]
 412972c:      	ldr	x8, [x8, #0xa0]
 4129730:      	mov	x0, x20
 4129734:      	mov	w1, #0x0                ; =0
 4129738:      	blr	x8
 412973c:      	cbz	x21, 0x41296c8 <_ChromeMain+0x412442c>
 4129740:      	ldrb	w8, [x19, #0x369]
 4129744:      	tbnz	w8, #0x0, 0x412976c <_ChromeMain+0x41244d0>
 4129748:      	ldr	x8, [x21]
 412974c:      	ldr	x8, [x8, #0xa0]
 4129750:      	mov	x0, x21
 4129754:      	mov	w1, #0x1                ; =1
 4129758:      	blr	x8
 412975c:      	mov	x0, x19
 4129760:      	mov	x1, x21
 4129764:      	bl	0x78aae3c <_ChromeMain+0x78a5ba0>
 4129768:      	b	0x41296c8 <_ChromeMain+0x412442c>
 412976c:      	mov	x0, x21
 4129770:      	mov	w1, #0x0                ; =0
 4129774:      	bl	0xa6a60f4 <_ChromeMain+0xa6a0e58>
 4129778:      	mov	x0, x21
 412977c:      	mov	w1, #0x0                ; =0
 4129780:      	bl	0xa6a6044 <_ChromeMain+0xa6a0da8>
 4129784:      	ldr	x8, [x21]
 4129788:      	ldr	x8, [x8, #0xa0]
 412978c:      	mov	x0, x21
 4129790:      	mov	w1, #0x0                ; =0
 4129794:      	blr	x8
 4129798:      	b	0x41296c8 <_ChromeMain+0x412442c>
 412979c:      	udf	#0x0
 41297a0:      	stp	x22, x21, [sp, #-0x30]!
 41297a4:      	stp	x20, x19, [sp, #0x10]
 41297a8:      	stp	x29, x30, [sp, #0x20]
 41297ac:      	add	x29, sp, #0x20
 41297b0:      	mov	x20, x2
 41297b4:      	mov	x21, x1
 41297b8:      	mov	x19, x0
 41297bc:      	and	x8, x1, #0xfffffffc00000000
 41297c0:      	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41297c4:      	ldr	x9, [x22, #0x88]
 41297c8:      	cmp	x8, x9
 41297cc:      	b.ne	0x41297d8 <_ChromeMain+0x412453c>
 41297d0:      	mov	x0, x21
 41297d4:      	bl	0x142fc <_ChromeMain+0xf060>
 41297d8:      	ldr	x0, [x19, #0x340]
 41297dc:      	and	x8, x0, #0xfffffffc00000000
 41297e0:      	ldr	x9, [x22, #0x88]
 41297e4:      	cmp	x8, x9
 41297e8:      	b.ne	0x41297f0 <_ChromeMain+0x4124554>
 41297ec:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41297f0:      	str	x21, [x19, #0x340]
 41297f4:      	and	x8, x20, #0xfffffffc00000000
 41297f8:      	ldr	x9, [x22, #0x88]
 41297fc:      	cmp	x8, x9
 4129800:      	b.ne	0x412980c <_ChromeMain+0x4124570>
 4129804:      	mov	x0, x20
 4129808:      	bl	0x142fc <_ChromeMain+0xf060>
 412980c:      	ldr	x0, [x19, #0x348]
 4129810:      	and	x8, x0, #0xfffffffc00000000
 4129814:      	ldr	x9, [x22, #0x88]
 4129818:      	cmp	x8, x9
 412981c:      	b.ne	0x4129824 <_ChromeMain+0x4124588>
 4129820:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4129824:      	str	x20, [x19, #0x348]
 4129828:      	ldr	x1, [x19, #0x338]
 412982c:      	cbz	x1, 0x4129884 <_ChromeMain+0x41245e8>
 4129830:      	ldrb	w8, [x19, #0x369]
 4129834:      	cbz	w8, 0x4129884 <_ChromeMain+0x41245e8>
 4129838:      	ldr	x0, [x19, #0x340]
 412983c:      	cmp	x0, #0x0
 4129840:      	csel	x20, x19, x0, eq
 4129844:      	ldr	x8, [x1, #0x188]
 4129848:      	cmp	x8, x20
 412984c:      	b.eq	0x4129860 <_ChromeMain+0x41245c4>
 4129850:      	ldr	x2, [x20, #0x198]
 4129854:      	mov	x0, x20
 4129858:      	bl	0x7793fc <_ChromeMain+0x774160>
 412985c:      	ldr	x0, [x19, #0x340]
 4129860:      	cbz	x0, 0x4129878 <_ChromeMain+0x41245dc>
 4129864:      	ldr	x1, [x19, #0x338]
 4129868:      	cbz	x1, 0x4129878 <_ChromeMain+0x41245dc>
 412986c:      	ldr	x8, [x1, #0x188]
 4129870:      	cmp	x0, x8
 4129874:      	b.eq	0x412989c <_ChromeMain+0x4124600>
 4129878:      	mov	x0, x20
 412987c:      	mov	w1, #0x0                ; =0
 4129880:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 4129884:      	mov	x0, x19
 4129888:      	mov	w1, #0x0                ; =0
 412988c:      	ldp	x29, x30, [sp, #0x20]
 4129890:      	ldp	x20, x19, [sp, #0x10]
 4129894:      	ldp	x22, x21, [sp], #0x30
 4129898:      	b	0x630474 <_ChromeMain+0x62b1d8>
 412989c:      	ldr	x8, [x19, #0x348]
 41298a0:      	cbz	x8, 0x4129878 <_ChromeMain+0x41245dc>
 41298a4:      	ldr	x9, [x8, #0x188]
 41298a8:      	cmp	x0, x9
 41298ac:      	b.ne	0x4129878 <_ChromeMain+0x41245dc>
 41298b0:      	ldr	x9, [x0, #0x198]
 41298b4:      	lsl	x9, x9, #3
 41298b8:      	cbz	x9, 0x4129878 <_ChromeMain+0x41245dc>
 41298bc:      	mov	x12, #0x0               ; =0
 41298c0:      	ldr	x10, [x0, #0x190]
 41298c4:      	ldr	x11, [x10, x12]
 41298c8:      	cmp	x11, x8
 41298cc:      	b.eq	0x41298e0 <_ChromeMain+0x4124644>
 41298d0:      	add	x12, x12, #0x8
 41298d4:      	cmp	x9, x12
 41298d8:      	b.ne	0x41298c4 <_ChromeMain+0x4124628>
 41298dc:      	b	0x412991c <_ChromeMain+0x4124680>
 41298e0:      	asr	x2, x12, #3
 41298e4:      	mov	x12, #0x0               ; =0
 41298e8:      	ldr	x13, [x10, x12]
 41298ec:      	cmp	x13, x1
 41298f0:      	b.eq	0x4129904 <_ChromeMain+0x4124668>
 41298f4:      	add	x12, x12, #0x8
 41298f8:      	cmp	x9, x12
 41298fc:      	b.ne	0x41298e8 <_ChromeMain+0x412464c>
 4129900:      	b	0x4129878 <_ChromeMain+0x41245dc>
 4129904:      	asr	x9, x12, #3
 4129908:      	cmp	x9, x2
 412990c:      	ccmp	x11, x8, #0x0, hs
 4129910:      	b.ne	0x4129878 <_ChromeMain+0x41245dc>
 4129914:      	bl	0x364f578 <_ChromeMain+0x364a2dc>
 4129918:      	b	0x4129878 <_ChromeMain+0x41245dc>
 412991c:      	mov	x2, #0x0                ; =0
 4129920:      	b	0x41298e4 <_ChromeMain+0x4124648>
		...
 4129930:      	ldr	x0, [x1, #0xc0]
 4129934:      	ldr	x8, [x0]
 4129938:      	ldr	x2, [x8, #0xc0]
 412993c:      	movi.2d	v0, #0000000000000000
 4129940:      	movi.2d	v1, #0000000000000000
 4129944:      	movi.2d	v2, #0000000000000000
 4129948:      	movi.2d	v3, #0000000000000000
 412994c:      	mov	w1, #0x1                ; =1
 4129950:      	br	x2
 4129954:      	stp	x20, x19, [sp, #-0x20]!
 4129958:      	stp	x29, x30, [sp, #0x10]
 412995c:      	add	x29, sp, #0x10
 4129960:      	ldr	x8, [x0, #0x328]
 4129964:      	cbz	x8, 0x41299ac <_ChromeMain+0x4124710>
 4129968:      	mov	x19, x0
 412996c:      	ldr	x8, [x0]
 4129970:      	ldr	x8, [x8, #0x60]
 4129974:      	adrp	x9, 0x66c000 <_ChromeMain+0x666d64>
 4129978:      	add	x9, x9, #0xe50
 412997c:      	cmp	x8, x9
 4129980:      	b.ne	0x41299b8 <_ChromeMain+0x412471c>
 4129984:      	ldr	x0, [x19, #0x180]
 4129988:      	cbz	x0, 0x4129990 <_ChromeMain+0x41246f4>
 412998c:      	bl	0xa6e3c54 <_ChromeMain+0xa6de9b8>
 4129990:      	ldr	x8, [x19, #0x328]
 4129994:      	ldr	x8, [x8, #0x148]
 4129998:      	ldr	x19, [x8, #0x38]
 412999c:      	cbz	x19, 0x41299ac <_ChromeMain+0x4124710>
 41299a0:      	mov	x0, x19
 41299a4:      	bl	0x46995f8 <_ChromeMain+0x469435c>
 41299a8:      	cbnz	w0, 0x41299d8 <_ChromeMain+0x412473c>
 41299ac:      	ldp	x29, x30, [sp, #0x10]
 41299b0:      	ldp	x20, x19, [sp], #0x20
 41299b4:      	ret
 41299b8:      	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 41299bc:      	add	x9, x9, #0x830
