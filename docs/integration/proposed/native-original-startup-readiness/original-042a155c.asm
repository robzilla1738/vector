
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42a155c:      	sub	sp, sp, #0x80
 42a1560:      	stp	x24, x23, [sp, #0x40]
 42a1564:      	stp	x22, x21, [sp, #0x50]
 42a1568:      	stp	x20, x19, [sp, #0x60]
 42a156c:      	stp	x29, x30, [sp, #0x70]
 42a1570:      	add	x29, sp, #0x70
 42a1574:      	mov	x19, x1
 42a1578:      	mov	x20, x0
 42a157c:      	adrp	x23, 0xef08000 <dyld_stub_binder+0xef08000>
 42a1580:      	ldr	x0, [x23, #0x30]
 42a1584:      	adrp	x1, 0xcda5000 <dyld_stub_binder+0xcda5000>
 42a1588:      	add	x1, x1, #0x96e
 42a158c:      	bl	0x1f557c <_ChromeMain+0x1f02e0>
 42a1590:      	tbnz	w0, #0x0, 0x42a15dc <_ChromeMain+0x429c340>
 42a1594:      	adrp	x0, 0xeb30000 <dyld_stub_binder+0xeb30000>
 42a1598:      	add	x0, x0, #0x118
 42a159c:      	adrp	x1, 0xeb30000 <dyld_stub_binder+0xeb30000>
 42a15a0:      	add	x1, x1, #0x138
 42a15a4:      	bl	0x9b1ceb4 <_ChromeMain+0x9b17c18>
 42a15a8:      	cbz	x0, 0x42a1608 <_ChromeMain+0x429c36c>
 42a15ac:      	mov	x21, x0
 42a15b0:      	bl	0x8b5ecf4 <_ChromeMain+0x8b59a58>
 42a15b4:      	mov	x22, x0
 42a15b8:      	bl	0xa067dd4 <_ChromeMain+0xa062b38>
 42a15bc:      	cmp	x22, x0
 42a15c0:      	b.ne	0x42a1600 <_ChromeMain+0x429c364>
 42a15c4:      	mov	x0, x21
 42a15c8:      	bl	0xa067f60 <_ChromeMain+0xa062cc4>
 42a15cc:      	mov	x22, x0
 42a15d0:      	mov	x0, x21
 42a15d4:      	bl	0x864b6fc <_ChromeMain+0x8646460>
 42a15d8:      	cbz	w22, 0x42a1608 <_ChromeMain+0x429c36c>
 42a15dc:      	cbnz	x19, 0x42a163c <_ChromeMain+0x429c3a0>
 42a15e0:      	mov	w22, #0x0               ; =0
 42a15e4:      	mov	x0, x22
 42a15e8:      	ldp	x29, x30, [sp, #0x70]
 42a15ec:      	ldp	x20, x19, [sp, #0x60]
 42a15f0:      	ldp	x22, x21, [sp, #0x50]
 42a15f4:      	ldp	x24, x23, [sp, #0x40]
 42a15f8:      	add	sp, sp, #0x80
 42a15fc:      	ret
 42a1600:      	mov	x0, x21
 42a1604:      	bl	0x864b6fc <_ChromeMain+0x8646460>
 42a1608:      	adrp	x8, 0xef06000 <dyld_stub_binder+0xef06000>
 42a160c:      	add	x8, x8, #0x190
 42a1610:      	ldaprb	w8, [x8]
 42a1614:      	adrp	x22, 0xef06000 <dyld_stub_binder+0xef06000>
 42a1618:      	tbz	w8, #0x0, 0x42a1900 <_ChromeMain+0x429c664>
 42a161c:      	ldr	x21, [x22, #0x188]
 42a1620:      	cbz	x21, 0x42a15dc <_ChromeMain+0x429c340>
 42a1624:      	str	x19, [sp, #0x30]
 42a1628:      	ldrb	w8, [x21, #0x49]
 42a162c:      	tbz	w8, #0x0, 0x42a165c <_ChromeMain+0x429c3c0>
 42a1630:      	mov	w22, #0x0               ; =0
 42a1634:      	cbz	x19, 0x42a15e4 <_ChromeMain+0x429c348>
 42a1638:      	b	0x42a16e4 <_ChromeMain+0x429c448>
 42a163c:      	mov	w8, #-0x1               ; =-1
 42a1640:      	ldaddal	w8, w8, [x19]
 42a1644:      	cmp	w8, #0x1
 42a1648:      	b.ne	0x42a15e0 <_ChromeMain+0x429c344>
 42a164c:      	ldr	x8, [x19, #0x10]
 42a1650:      	mov	x0, x19
 42a1654:      	blr	x8
 42a1658:      	b	0x42a15e0 <_ChromeMain+0x429c344>
 42a165c:      	ldr	x0, [x23, #0x30]
 42a1660:      	adrp	x1, 0xcda5000 <dyld_stub_binder+0xcda5000>
 42a1664:      	add	x1, x1, #0x96e
 42a1668:      	bl	0x1f557c <_ChromeMain+0x1f02e0>
 42a166c:      	tbnz	w0, #0x0, 0x42a16d8 <_ChromeMain+0x429c43c>
 42a1670:      	adrp	x0, 0xeb30000 <dyld_stub_binder+0xeb30000>
 42a1674:      	add	x0, x0, #0x118
 42a1678:      	adrp	x1, 0xeb30000 <dyld_stub_binder+0xeb30000>
 42a167c:      	add	x1, x1, #0x138
 42a1680:      	bl	0x9b1ceb4 <_ChromeMain+0x9b17c18>
 42a1684:      	cbz	x0, 0x42a1704 <_ChromeMain+0x429c468>
 42a1688:      	mov	x22, x0
 42a168c:      	bl	0x8b5ecf4 <_ChromeMain+0x8b59a58>
 42a1690:      	mov	x23, x0
 42a1694:      	bl	0xa067dd4 <_ChromeMain+0xa062b38>
 42a1698:      	cmp	x23, x0
 42a169c:      	b.eq	0x42a16a8 <_ChromeMain+0x429c40c>
 42a16a0:      	mov	w23, #0x0               ; =0
 42a16a4:      	b	0x42a16b8 <_ChromeMain+0x429c41c>
 42a16a8:      	mov	x0, x22
 42a16ac:      	bl	0xa067f60 <_ChromeMain+0xa062cc4>
 42a16b0:      	cmp	w0, #0x0
 42a16b4:      	cset	w23, ne
 42a16b8:      	mov	x0, x22
 42a16bc:      	bl	0x864b6fc <_ChromeMain+0x8646460>
 42a16c0:      	mov	w22, #0x0               ; =0
 42a16c4:      	cbz	x20, 0x42a16dc <_ChromeMain+0x429c440>
 42a16c8:      	tbnz	w23, #0x0, 0x42a16dc <_ChromeMain+0x429c440>
 42a16cc:      	mov	x0, x20
 42a16d0:      	bl	0xf15110 <_ChromeMain+0xf0fe74>
 42a16d4:      	cbnz	w0, 0x42a170c <_ChromeMain+0x429c470>
 42a16d8:      	mov	w22, #0x0               ; =0
 42a16dc:      	ldr	x19, [sp, #0x30]
 42a16e0:      	cbz	x19, 0x42a15e4 <_ChromeMain+0x429c348>
 42a16e4:      	mov	w8, #-0x1               ; =-1
 42a16e8:      	ldaddal	w8, w8, [x19]
 42a16ec:      	cmp	w8, #0x1
 42a16f0:      	b.ne	0x42a15e4 <_ChromeMain+0x429c348>
 42a16f4:      	ldr	x8, [x19, #0x10]
 42a16f8:      	mov	x0, x19
 42a16fc:      	blr	x8
 42a1700:      	b	0x42a15e4 <_ChromeMain+0x429c348>
 42a1704:      	mov	w23, #0x0               ; =0
 42a1708:      	b	0x42a16c0 <_ChromeMain+0x429c424>
 42a170c:      	ldr	w8, [x21, #0x390]
 42a1710:      	cmp	w8, #0x1
 42a1714:      	b.le	0x42a17c8 <_ChromeMain+0x429c52c>
 42a1718:      	cmp	w8, #0x2
 42a171c:      	b.eq	0x42a16d8 <_ChromeMain+0x429c43c>
 42a1720:      	cmp	w8, #0x3
 42a1724:      	b.ne	0x42a1838 <_ChromeMain+0x429c59c>
 42a1728:      	mov	w22, #0x1               ; =1
 42a172c:      	cbz	x19, 0x42a16dc <_ChromeMain+0x429c440>
 42a1730:      	adrp	x0, 0xcf0c000 <dyld_stub_binder+0xcf0c000>
 42a1734:      	add	x0, x0, #0xb50
 42a1738:      	bl	0xbdc494 <_ChromeMain+0xbd71f8>
 42a173c:      	mov	x20, x0
 42a1740:      	adrp	x0, 0xdb2c000 <dyld_stub_binder+0xdb2c000>
 42a1744:      	add	x0, x0, #0x35b
 42a1748:      	adrp	x1, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a174c:      	add	x1, x1, #0x193
 42a1750:      	add	x8, sp, #0x10
 42a1754:      	mov	w2, #0x32a              ; =810
 42a1758:      	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42a175c:      	mov	w0, #0x30               ; =48
 42a1760:      	bl	0xf368 <_ChromeMain+0xa0cc>
 42a1764:      	mov	x2, x0
 42a1768:      	str	w22, [x0]
 42a176c:      	adrp	x8, 0x3f72000 <_ChromeMain+0x3f6cd64>
 42a1770:      	add	x8, x8, #0x990
 42a1774:      	adrp	x9, 0x3895000 <_ChromeMain+0x388fd64>
 42a1778:      	add	x9, x9, #0xc10
 42a177c:      	stp	x8, x9, [x0, #0x8]
 42a1780:      	adrp	x8, 0x3f72000 <_ChromeMain+0x3f6cd64>
 42a1784:      	add	x8, x8, #0xa00
 42a1788:      	stp	x8, x19, [x0, #0x18]
 42a178c:      	str	xzr, [sp, #0x30]
 42a1790:      	strb	wzr, [x0, #0x28]
 42a1794:      	ldr	x8, [x20]
 42a1798:      	ldr	x8, [x8]
 42a179c:      	add	x1, sp, #0x10
 42a17a0:      	mov	x0, x20
 42a17a4:      	mov	x3, #0x0                ; =0
 42a17a8:      	blr	x8
 42a17ac:      	cbz	x20, 0x42a16dc <_ChromeMain+0x429c440>
 42a17b0:      	add	x8, x20, #0x8
 42a17b4:      	mov	w9, #-0x1               ; =-1
 42a17b8:      	ldaddal	w9, w8, [x8]
 42a17bc:      	cmp	w8, #0x1
 42a17c0:      	b.ne	0x42a16dc <_ChromeMain+0x429c440>
 42a17c4:      	b	0x42a18d8 <_ChromeMain+0x429c63c>
 42a17c8:      	cbz	w8, 0x42a1800 <_ChromeMain+0x429c564>
 42a17cc:      	cmp	w8, #0x1
 42a17d0:      	b.ne	0x42a1838 <_ChromeMain+0x429c59c>
 42a17d4:      	ldr	x8, [x21, #0x398]
 42a17d8:      	cbz	x8, 0x42a17e4 <_ChromeMain+0x429c548>
 42a17dc:      	ldapurb	w8, [x8, #0x4]
 42a17e0:      	cbz	w8, 0x42a17f4 <_ChromeMain+0x429c558>
 42a17e4:      	mov	x0, x21
 42a17e8:      	mov	x1, x20
 42a17ec:      	bl	0x42ac4bc <_ChromeMain+0x42a7220>
 42a17f0:      	b	0x42a1838 <_ChromeMain+0x429c59c>
 42a17f4:      	ldr	x8, [x21, #0x3a0]
 42a17f8:      	cbz	x8, 0x42a17e4 <_ChromeMain+0x429c548>
 42a17fc:      	b	0x42a1838 <_ChromeMain+0x429c59c>
 42a1800:      	mov	w8, #0x1                ; =1
 42a1804:      	str	w8, [x21, #0x390]
 42a1808:      	mov	x0, x21
 42a180c:      	mov	x1, x20
 42a1810:      	bl	0x42ac4bc <_ChromeMain+0x42a7220>
 42a1814:      	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 42a1818:      	ldr	x8, [x8, #0xd18]
 42a181c:      	blr	x8
 42a1820:      	mov	w8, #0x9680             ; =38528
 42a1824:      	movk	w8, #0x98, lsl #16
 42a1828:      	adds	x8, x0, x8
 42a182c:      	mov	x9, #0x7fffffffffffffff ; =9223372036854775807
 42a1830:      	csel	x8, x9, x8, vs
 42a1834:      	str	x8, [x21, #0x388]
 42a1838:      	cbz	x19, 0x42a188c <_ChromeMain+0x429c5f0>
 42a183c:      	add	x9, x21, #0x3c0
 42a1840:      	ldr	x8, [x21, #0x3c0]
 42a1844:      	ldr	x10, [x21, #0x3c8]
 42a1848:      	add	x8, x8, x10, lsl #3
 42a184c:      	str	x8, [sp, #0x38]
 42a1850:      	ldr	x11, [x21, #0x3d0]
 42a1854:      	add	x12, sp, #0x38
 42a1858:      	add	x13, sp, #0x30
 42a185c:      	stp	x12, x13, [sp, #0x10]
 42a1860:      	str	x9, [sp, #0x20]
 42a1864:      	cmp	x10, x11
 42a1868:      	b.ne	0x42a1978 <_ChromeMain+0x429c6dc>
 42a186c:      	add	x0, sp, #0x10
 42a1870:      	bl	0x2d21900 <_ChromeMain+0x2d1c664>
 42a1874:      	ldr	x8, [sp, #0x38]
 42a1878:      	ldr	x9, [x21, #0x3c0]
 42a187c:      	subs	x8, x8, x9
 42a1880:      	asr	x8, x8, #3
 42a1884:      	str	x8, [x21, #0x3c8]
 42a1888:      	b.eq	0x42a1988 <_ChromeMain+0x429c6ec>
 42a188c:      	mov	x0, x21
 42a1890:      	bl	0x42a430c <_ChromeMain+0x429f070>
 42a1894:      	mov	x0, x21
 42a1898:      	mov	x1, x20
 42a189c:      	bl	0x42a4148 <_ChromeMain+0x429eeac>
 42a18a0:      	ldrb	w8, [x21, #0x3a9]
 42a18a4:      	tbnz	w8, #0x0, 0x42a18c8 <_ChromeMain+0x429c62c>
 42a18a8:      	ldrsb	x8, [x21, #0xc7]
 42a18ac:      	tbz	x8, #0x3f, 0x42a18b4 <_ChromeMain+0x429c618>
 42a18b0:      	ldr	x8, [x21, #0xb8]
 42a18b4:      	cbz	x8, 0x42a18c8 <_ChromeMain+0x429c62c>
 42a18b8:      	mov	w8, #0x1                ; =1
 42a18bc:      	strb	w8, [x21, #0x3a9]
 42a18c0:      	mov	x0, x21
 42a18c4:      	bl	0x42a6c10 <_ChromeMain+0x42a1974>
 42a18c8:      	mov	x0, x21
 42a18cc:      	bl	0x42a5a28 <_ChromeMain+0x42a078c>
 42a18d0:      	mov	w22, #0x1               ; =1
 42a18d4:      	b	0x42a16dc <_ChromeMain+0x429c440>
 42a18d8:      	ldr	x9, [x20]
 42a18dc:      	ldr	x8, [x9, #0x18]
 42a18e0:      	adr	x10, 0x42caa8c <_ChromeMain+0x42c57f0>
 42a18e4:      	nop
 42a18e8:      	cmp	x8, x10
 42a18ec:      	b.ne	0x42a18f4 <_ChromeMain+0x429c658>
 42a18f0:      	ldr	x8, [x9, #0x10]
 42a18f4:      	mov	x0, x20
 42a18f8:      	blr	x8
 42a18fc:      	b	0x42a16dc <_ChromeMain+0x429c440>
 42a1900:      	adrp	x21, 0xef06000 <dyld_stub_binder+0xef06000>
 42a1904:      	add	x21, x21, #0x190
 42a1908:      	mov	x0, x21
 42a190c:      	bl	0x80048c0 <_ChromeMain+0x7fff624>
 42a1910:      	cbz	w0, 0x42a161c <_ChromeMain+0x429c380>
 42a1914:      	str	xzr, [x22, #0x188]
 42a1918:      	mov	w24, #0x1               ; =1
 42a191c:      	stlrb	w24, [x21]
 42a1920:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 42a1924:      	add	x0, x0, #0x9f0
 42a1928:      	bl	0x80048cc <_ChromeMain+0x7fff630>
 42a192c:      	cbnz	w0, 0x42a19ac <_ChromeMain+0x429c710>
 42a1930:      	adrp	x8, 0xef06000 <dyld_stub_binder+0xef06000>
 42a1934:      	ldrb	w21, [x8, #0x191]
 42a1938:      	strb	w24, [x8, #0x191]
 42a193c:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 42a1940:      	add	x0, x0, #0x9f0
 42a1944:      	bl	0x8004904 <_ChromeMain+0x7fff668>
 42a1948:      	cbnz	w0, 0x42a198c <_ChromeMain+0x429c6f0>
 42a194c:      	tbz	w21, #0x2, 0x42a161c <_ChromeMain+0x429c380>
 42a1950:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 42a1954:      	add	x0, x0, #0xa30
 42a1958:      	bl	0x8004910 <_ChromeMain+0x7fff674>
 42a195c:      	cbz	w0, 0x42a161c <_ChromeMain+0x429c380>
 42a1960:      	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42a1964:      	add	x8, x8, #0x713
 42a1968:      	str	x8, [sp]
 42a196c:      	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42a1970:      	add	x0, x0, #0x727
 42a1974:      	bl	0x800491c <_ChromeMain+0x7fff680>
 42a1978:      	cbz	x8, 0x42a1988 <_ChromeMain+0x429c6ec>
 42a197c:      	str	x19, [x8], #0x8
 42a1980:      	stp	xzr, x8, [sp, #0x30]
 42a1984:      	b	0x42a1874 <_ChromeMain+0x429c5d8>
 42a1988:      	brk	#0x1
 42a198c:      	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42a1990:      	add	x8, x8, #0x713
 42a1994:      	str	x8, [sp]
 42a1998:      	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42a199c:      	add	x0, x0, #0x6f8
 42a19a0:      	bl	0x800491c <_ChromeMain+0x7fff680>
 42a19a4:      	b	0x42a1988 <_ChromeMain+0x429c6ec>
 42a19a8:      	bl	0x8004ac4 <_ChromeMain+0x7fff828>
 42a19ac:      	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42a19b0:      	add	x8, x8, #0x713
 42a19b4:      	str	x8, [sp]
 42a19b8:      	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
