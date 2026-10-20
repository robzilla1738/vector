
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465c5f0:      	sub	sp, sp, #0xf0
 465c5f4:      	stp	x28, x27, [sp, #0x90]
 465c5f8:      	stp	x26, x25, [sp, #0xa0]
 465c5fc:      	stp	x24, x23, [sp, #0xb0]
 465c600:      	stp	x22, x21, [sp, #0xc0]
 465c604:      	stp	x20, x19, [sp, #0xd0]
 465c608:      	stp	x29, x30, [sp, #0xe0]
 465c60c:      	add	x29, sp, #0xe0
 465c610:      	mov	x23, x2
 465c614:      	mov	x22, x1
 465c618:      	mov	x19, x0
 465c61c:      	adrp	x28, 0xe723000 <dyld_stub_binder+0xe723000>
 465c620:      	add	x28, x28, #0xeb0
 465c624:      	add	x8, x28, #0x498
 465c628:      	stp	x28, x8, [x0]
 465c62c:      	add	x8, x28, #0x4c0
 465c630:      	str	x8, [x0, #0x10]
 465c634:      	add	x8, x28, #0x4f8
 465c638:      	add	x9, x28, #0x528
 465c63c:      	stp	x8, x9, [x0, #0x68]
 465c640:      	add	x8, x28, #0x578
 465c644:      	str	x8, [x0, #0xb0]
 465c648:      	add	x8, x28, #0x5d8
 465c64c:      	mov	x20, x0
 465c650:      	str	x8, [x20, #0xd8]!
 465c654:      	add	x8, x28, #0x608
 465c658:      	mov	x21, x0
 465c65c:      	str	x8, [x21, #0xf8]!
 465c660:      	add	x8, x28, #0x630
 465c664:      	str	x8, [x0, #0x310]
 465c668:      	add	x8, x28, #0x6b0
 465c66c:      	str	x8, [x0, #0x318]
 465c670:      	add	x8, x28, #0x770
 465c674:      	str	x8, [x0, #0x320]
 465c678:      	add	x26, x0, #0x4b0
 465c67c:      	add	x8, x28, #0x7a8
 465c680:      	str	x8, [x0, #0x4b0]
 465c684:      	add	x8, x28, #0x800
 465c688:      	str	x8, [x0, #0x4c8]
 465c68c:      	and	x8, x0, #0xfffffffc00000000
 465c690:      	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465c694:      	ldr	x9, [x24, #0x88]
 465c698:      	cmp	x8, x9
 465c69c:      	b.ne	0x465c6a8 <_ChromeMain+0x465740c>
 465c6a0:      	mov	x0, x19
 465c6a4:      	bl	0x142fc <_ChromeMain+0xf060>
 465c6a8:      	mov	w0, #0x38               ; =56
 465c6ac:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465c6b0:      	mov	w8, #0x1                ; =1
 465c6b4:      	str	w8, [x0]
 465c6b8:      	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 465c6bc:      	add	x8, x8, #0xc00
 465c6c0:      	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 465c6c4:      	add	x9, x9, #0xb40
 465c6c8:      	stp	x8, x9, [x0, #0x8]
 465c6cc:      	adrp	x25, 0x255d000 <_ChromeMain+0x2557d64>
 465c6d0:      	add	x25, x25, #0xb00
 465c6d4:      	adr	x8, 0x465d7e0 <_ChromeMain+0x4658544>
 465c6d8:      	nop
 465c6dc:      	stp	x25, x8, [x0, #0x18]
 465c6e0:      	stp	xzr, x19, [x0, #0x28]
 465c6e4:      	stur	x0, [x29, #-0x60]
 465c6e8:      	mov	w8, #0x2                ; =2
 465c6ec:      	sturb	w8, [x29, #-0x58]
 465c6f0:      	sub	x1, x29, #0x60
 465c6f4:      	mov	x0, x19
 465c6f8:      	bl	0x136e480 <_ChromeMain+0x13691e4>
 465c6fc:      	ldurb	w8, [x29, #-0x58]
 465c700:      	cmp	w8, #0xff
 465c704:      	b.eq	0x465c710 <_ChromeMain+0x4657474>
 465c708:      	ldur	x0, [x29, #-0x60]
 465c70c:      	cbnz	x0, 0x465d5b0 <_ChromeMain+0x4658314>
 465c710:      	mov	w8, #0xff               ; =255
 465c714:      	sturb	w8, [x29, #-0x58]
 465c718:      	adrp	x27, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 465c71c:      	add	x27, x27, #0xf08
 465c720:      	str	x27, [x26]
 465c724:      	mov	w0, #0x8                ; =8
 465c728:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465c72c:      	str	wzr, [x0]
 465c730:      	strb	wzr, [x0, #0x4]
 465c734:      	cbz	x0, 0x465c74c <_ChromeMain+0x46574b0>
 465c738:      	mov	w8, #0x1                ; =1
 465c73c:      	ldadd	w8, w8, [x0]
 465c740:      	mov	w9, #0x7fffffff         ; =2147483647
 465c744:      	cmp	w8, w9
 465c748:      	b.eq	0x465d760 <_ChromeMain+0x46584c4>
 465c74c:      	str	x0, [x19, #0x4b8]
 465c750:      	str	x26, [x19, #0x4c0]
 465c754:      	add	x8, x28, #0x498
 465c758:      	stp	x28, x8, [x19]
 465c75c:      	add	x8, x28, #0x4c0
 465c760:      	str	x8, [x19, #0x10]
 465c764:      	add	x8, x28, #0x4f8
 465c768:      	add	x9, x28, #0x528
 465c76c:      	stp	x8, x9, [x19, #0x68]
 465c770:      	add	x8, x28, #0x578
 465c774:      	str	x8, [x19, #0xb0]
 465c778:      	add	x8, x28, #0x5d8
 465c77c:      	str	x8, [x19, #0xd8]
 465c780:      	add	x8, x28, #0x608
 465c784:      	str	x8, [x19, #0xf8]
 465c788:      	add	x8, x28, #0x630
 465c78c:      	str	x8, [x19, #0x310]
 465c790:      	add	x8, x28, #0x6b0
 465c794:      	str	x8, [x19, #0x318]
 465c798:      	add	x8, x28, #0x770
 465c79c:      	str	x8, [x19, #0x320]
 465c7a0:      	add	x8, x28, #0x7a8
 465c7a4:      	str	x8, [x19, #0x4b0]
 465c7a8:      	add	x8, x28, #0x800
 465c7ac:      	str	x8, [x19, #0x4c8]
 465c7b0:      	and	x8, x22, #0xfffffffc00000000
 465c7b4:      	ldr	x9, [x24, #0x88]
 465c7b8:      	cmp	x8, x9
 465c7bc:      	b.ne	0x465c7c8 <_ChromeMain+0x465752c>
 465c7c0:      	mov	x0, x22
 465c7c4:      	bl	0x142fc <_ChromeMain+0xf060>
 465c7c8:      	str	x22, [x19, #0x4d0]
 465c7cc:      	and	x8, x23, #0xfffffffc00000000
 465c7d0:      	ldr	x9, [x24, #0x88]
 465c7d4:      	cmp	x8, x9
 465c7d8:      	b.ne	0x465c7e4 <_ChromeMain+0x4657548>
 465c7dc:      	mov	x0, x23
 465c7e0:      	bl	0x142fc <_ChromeMain+0xf060>
 465c7e4:      	str	x23, [x19, #0x4d8]
 465c7e8:      	ldr	x22, [x22, #0x538]
 465c7ec:      	mov	w0, #0x198              ; =408
 465c7f0:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465c7f4:      	mov	x1, x22
 465c7f8:      	bl	0x456db84 <_ChromeMain+0x45688e8>
 465c7fc:      	str	x0, [x19, #0x4e0]
 465c800:      	add	x8, x19, #0x4e8
 465c804:      	strb	wzr, [x19, #0x538]
 465c808:      	strb	wzr, [x19, #0x53c]
 465c80c:      	strb	wzr, [x19, #0x558]
 465c810:      	str	xzr, [x19, #0x560]
 465c814:      	and	x9, x26, #0xfffffffc00000000
 465c818:      	movi.2d	v0, #0000000000000000
 465c81c:      	stp	q0, q0, [x8]
 465c820:      	stp	q0, q0, [x8, #0x20]
 465c824:      	stur	q0, [x8, #0x3f]
 465c828:      	str	q0, [x19, #0x540]
 465c82c:      	strb	wzr, [x19, #0x550]
 465c830:      	ldr	x8, [x24, #0x88]
 465c834:      	cmp	x9, x8
 465c838:      	b.ne	0x465c848 <_ChromeMain+0x46575ac>
 465c83c:      	add	x0, x19, #0x4b0
 465c840:      	bl	0x142fc <_ChromeMain+0xf060>
 465c844:      	ldr	x8, [x24, #0x88]
 465c848:      	str	x26, [x19, #0x568]
 465c84c:      	str	xzr, [x19, #0x570]
 465c850:      	add	x22, x19, #0x578
 465c854:      	adrp	x9, 0xe508000 <dyld_stub_binder+0xe508000>
 465c858:      	add	x9, x9, #0xe10
 465c85c:      	str	x9, [x19, #0x578]
 465c860:      	and	x9, x19, #0xfffffffc00000000
 465c864:      	cmp	x9, x8
 465c868:      	b.ne	0x465c878 <_ChromeMain+0x46575dc>
 465c86c:      	mov	x0, x19
 465c870:      	bl	0x142fc <_ChromeMain+0xf060>
 465c874:      	ldr	x8, [x24, #0x88]
 465c878:      	add	x23, x19, #0x4c8
 465c87c:      	str	x19, [x19, #0x580]
 465c880:      	and	x9, x22, #0xfffffffc00000000
 465c884:      	cmp	x9, x8
 465c888:      	b.ne	0x465c898 <_ChromeMain+0x46575fc>
 465c88c:      	add	x0, x19, #0x578
 465c890:      	bl	0x142fc <_ChromeMain+0xf060>
 465c894:      	ldr	x8, [x24, #0x88]
 465c898:      	str	x22, [x19, #0x588]
 465c89c:      	str	xzr, [x19, #0x590]
 465c8a0:      	and	x9, x23, #0xfffffffc00000000
 465c8a4:      	cmp	x9, x8
 465c8a8:      	b.ne	0x465c8b4 <_ChromeMain+0x4657618>
 465c8ac:      	add	x0, x19, #0x4c8
 465c8b0:      	bl	0x142fc <_ChromeMain+0xf060>
 465c8b4:      	str	x23, [x19, #0x598]
 465c8b8:      	str	xzr, [x19, #0x5a0]
 465c8bc:      	str	x27, [x19, #0x5a8]
 465c8c0:      	mov	w0, #0x8                ; =8
 465c8c4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465c8c8:      	str	wzr, [x0]
 465c8cc:      	strb	wzr, [x0, #0x4]
 465c8d0:      	cbz	x0, 0x465c8e8 <_ChromeMain+0x465764c>
 465c8d4:      	mov	w8, #0x1                ; =1
 465c8d8:      	ldadd	w8, w8, [x0]
 465c8dc:      	mov	w9, #0x7fffffff         ; =2147483647
 465c8e0:      	cmp	w8, w9
 465c8e4:      	b.eq	0x465d76c <_ChromeMain+0x46584d0>
 465c8e8:      	add	x8, x19, #0x5a8
 465c8ec:      	str	x0, [x19, #0x5b0]
 465c8f0:      	str	x8, [x19, #0x5b8]
 465c8f4:      	adrp	x8, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 465c8f8:      	add	x8, x8, #0x490
 465c8fc:      	str	x8, [x19, #0x5a8]
 465c900:      	str	xzr, [x19, #0x5c0]
 465c904:      	str	xzr, [x19, #0x5d0]
 465c908:      	mov	w0, #0x8                ; =8
 465c90c:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465c910:      	mov	x22, x0
 465c914:      	str	wzr, [x0]
 465c918:      	strb	wzr, [x0, #0x4]
 465c91c:      	cbz	x0, 0x465c934 <_ChromeMain+0x4657698>
 465c920:      	mov	w8, #0x1                ; =1
 465c924:      	ldadd	w8, w8, [x22]
 465c928:      	mov	w9, #0x7fffffff         ; =2147483647
 465c92c:      	cmp	w8, w9
 465c930:      	b.eq	0x465d778 <_ChromeMain+0x46584dc>
 465c934:      	str	x22, [x19, #0x5d8]
 465c938:      	str	x19, [x19, #0x5e0]
 465c93c:      	ldrb	w8, [x19, #0x460]
 465c940:      	cbz	w8, 0x465c958 <_ChromeMain+0x46576bc>
 465c944:      	strb	wzr, [x19, #0x460]
 465c948:      	add	x1, x19, #0x460
 465c94c:      	mov	x0, x21
 465c950:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465c954:      	ldr	x22, [x19, #0x5d8]
 465c958:      	ldr	x23, [x19, #0x4e0]
 465c95c:      	cbz	x22, 0x465c974 <_ChromeMain+0x46576d8>
 465c960:      	mov	w8, #0x1                ; =1
 465c964:      	ldadd	w8, w8, [x22]
 465c968:      	mov	w9, #0x7fffffff         ; =2147483647
 465c96c:      	cmp	w8, w9
 465c970:      	b.eq	0x465d754 <_ChromeMain+0x46584b8>
 465c974:      	ldr	x26, [x19, #0x5e0]
 465c978:      	mov	w0, #0x40               ; =64
 465c97c:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465c980:      	mov	w8, #0x1                ; =1
 465c984:      	str	w8, [x0]
 465c988:      	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 465c98c:      	add	x8, x8, #0x700
 465c990:      	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 465c994:      	add	x9, x9, #0x440
 465c998:      	stp	x8, x9, [x0, #0x8]
 465c99c:      	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 465c9a0:      	add	x8, x8, #0x280
 465c9a4:      	adr	x9, 0x465da60 <_ChromeMain+0x46587c4>
 465c9a8:      	nop
 465c9ac:      	stp	x8, x9, [x0, #0x18]
 465c9b0:      	stp	xzr, x22, [x0, #0x28]
 465c9b4:      	str	x26, [x0, #0x38]
 465c9b8:      	ldr	x22, [x23, #0x178]
 465c9bc:      	str	x0, [x23, #0x178]
 465c9c0:      	cbnz	x22, 0x465d624 <_ChromeMain+0x4658388>
 465c9c4:      	ldr	x8, [x19, #0x480]
 465c9c8:      	str	wzr, [x8, #0x18]
 465c9cc:      	ldr	w8, [x19, #0x464]
 465c9d0:      	cmp	w8, #0x800
 465c9d4:      	b.eq	0x465c9f0 <_ChromeMain+0x4657754>
 465c9d8:      	add	x8, x19, #0x464
 465c9dc:      	mov	w9, #0x800              ; =2048
 465c9e0:      	str	w9, [x8]
 465c9e4:      	add	x1, x19, #0x464
 465c9e8:      	mov	x0, x21
 465c9ec:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465c9f0:      	mov	w8, #0x1                ; =1
 465c9f4:      	strb	w8, [x19, #0x1cb]
 465c9f8:      	stp	xzr, xzr, [sp, #0x40]
 465c9fc:      	str	xzr, [sp, #0x50]
 465ca00:      	add	x1, sp, #0x40
 465ca04:      	mov	x0, x19
 465ca08:      	bl	0x846944 <_ChromeMain+0x8416a8>
 465ca0c:      	ldrsb	w8, [sp, #0x57]
 465ca10:      	tbz	w8, #0x1f, 0x465ca24 <_ChromeMain+0x4657788>
 465ca14:      	ldr	x0, [sp, #0x40]
 465ca18:      	ldr	x8, [sp, #0x50]
 465ca1c:      	lsl	x1, x8, #1
 465ca20:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465ca24:      	mov	w0, #0x140              ; =320
 465ca28:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465ca2c:      	mov	x21, x0
 465ca30:      	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 465ca34:      	mov	x0, x19
 465ca38:      	mov	x1, x21
 465ca3c:      	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 465ca40:      	ldr	w8, [x21, #0xf0]
 465ca44:      	cbnz	w8, 0x465d578 <_ChromeMain+0x46582dc>
 465ca48:      	mov	w8, #0x1                ; =1
 465ca4c:      	str	w8, [sp, #0x40]
 465ca50:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465ca54:      	add	x1, x1, #0x568
 465ca58:      	add	x0, x21, #0x118
 465ca5c:      	add	x2, sp, #0x40
 465ca60:      	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 465ca64:      	adrp	x26, 0xef0a000 <dyld_stub_binder+0xef0a000>
 465ca68:      	add	x26, x26, #0x480
 465ca6c:      	ldapr	x0, [x26]
 465ca70:      	cbz	x0, 0x465d6ac <_ChromeMain+0x4658410>
 465ca74:      	mov	w1, #0x310              ; =784
 465ca78:      	mov	x2, #0x0                ; =0
 465ca7c:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 465ca80:      	mov	x21, x0
 465ca84:      	bl	0x136f140 <_ChromeMain+0x1369ea4>
 465ca88:      	ldrb	w8, [x0, #0x169]
 465ca8c:      	cbnz	w8, 0x465d6dc <_ChromeMain+0x4658440>
 465ca90:      	ldr	x2, [x19, #0x198]
 465ca94:      	mov	x0, x19
 465ca98:      	mov	x1, x21
 465ca9c:      	bl	0x7793fc <_ChromeMain+0x774160>
 465caa0:      	and	x8, x21, #0xfffffffc00000000
 465caa4:      	ldr	x9, [x24, #0x88]
 465caa8:      	cmp	x8, x9
 465caac:      	b.ne	0x465cab8 <_ChromeMain+0x465781c>
 465cab0:      	mov	x0, x21
 465cab4:      	bl	0x142fc <_ChromeMain+0xf060>
 465cab8:      	ldr	x0, [x19, #0x500]
 465cabc:      	and	x8, x0, #0xfffffffc00000000
 465cac0:      	ldr	x9, [x24, #0x88]
 465cac4:      	cmp	x8, x9
 465cac8:      	b.ne	0x465cad0 <_ChromeMain+0x4657834>
 465cacc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465cad0:      	str	x21, [x19, #0x500]
 465cad4:      	ldrb	w8, [x21, #0x1a9]
 465cad8:      	cbz	w8, 0x465caf0 <_ChromeMain+0x4657854>
 465cadc:      	strb	wzr, [x21, #0x1a9]
 465cae0:      	add	x0, x21, #0xf8
 465cae4:      	add	x1, x21, #0x1a9
 465cae8:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465caec:      	ldr	x21, [x19, #0x500]
 465caf0:      	mov	w0, #0xf8               ; =248
 465caf4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465caf8:      	mov	x22, x0
 465cafc:      	bl	0x14856e0 <_ChromeMain+0x1480444>
 465cb00:      	adrp	x8, 0xe352000 <dyld_stub_binder+0xe352000>
 465cb04:      	add	x8, x8, #0xd98
 465cb08:      	str	x8, [x0]
 465cb0c:      	add	x8, x8, #0xd8
 465cb10:      	str	x8, [x0, #0x28]
 465cb14:      	mov	w8, #0x100              ; =256
 465cb18:      	strh	w8, [x0, #0xf0]
 465cb1c:      	mov	x0, x21
 465cb20:      	mov	x1, x22
 465cb24:      	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 465cb28:      	ldr	x0, [x19, #0x500]
 465cb2c:      	mov	w28, #0x1               ; =1
 465cb30:      	mov	x1, #0x14               ; =20
 465cb34:      	movk	x1, #0x14, lsl #32
 465cb38:      	mov	w2, #0x1                ; =1
 465cb3c:      	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 465cb40:      	ldr	x8, [x19, #0x500]
 465cb44:      	adrp	x9, 0xdf40000 <dyld_stub_binder+0xdf40000>
 465cb48:      	ldr	q0, [x9, #0xa90]
 465cb4c:      	str	q0, [sp, #0x40]
 465cb50:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465cb54:      	add	x1, x1, #0x488
 465cb58:      	add	x0, x8, #0xd8
 465cb5c:      	add	x2, sp, #0x40
 465cb60:      	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 465cb64:      	ldr	x22, [x19, #0x500]
 465cb68:      	ldapr	x0, [x26]
 465cb6c:      	cbz	x0, 0x465d6b4 <_ChromeMain+0x4658418>
 465cb70:      	mov	w1, #0x380              ; =896
 465cb74:      	mov	x2, #0x0                ; =0
 465cb78:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 465cb7c:      	mov	x21, x0
 465cb80:      	bl	0x242d238 <_ChromeMain+0x2427f9c>
 465cb84:      	adrp	x27, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 465cb88:      	add	x27, x27, #0xbd0
 465cb8c:      	add	x8, x27, #0x3f0
 465cb90:      	stp	x27, x8, [x0]
 465cb94:      	add	x8, x27, #0x418
 465cb98:      	str	x8, [x0, #0x10]
 465cb9c:      	add	x8, x27, #0x450
 465cba0:      	add	x9, x27, #0x480
 465cba4:      	stp	x8, x9, [x0, #0x68]
 465cba8:      	add	x8, x27, #0x4d0
 465cbac:      	str	x8, [x0, #0xb0]
 465cbb0:      	add	x8, x27, #0x530
 465cbb4:      	str	x8, [x0, #0xd8]
 465cbb8:      	add	x8, x27, #0x560
 465cbbc:      	mov	x23, x0
 465cbc0:      	str	x8, [x23, #0xf8]!
 465cbc4:      	str	xzr, [x0, #0x348]
 465cbc8:      	movi	d0, #0xffff000000000000
 465cbcc:      	str	d0, [x0, #0x350]
 465cbd0:      	strb	w28, [x0, #0x358]
 465cbd4:      	str	xzr, [x0, #0x360]
 465cbd8:      	strb	wzr, [x0, #0x368]
 465cbdc:      	str	xzr, [x0, #0x370]
 465cbe0:      	str	wzr, [x0, #0x378]
 465cbe4:      	strb	wzr, [x0, #0x37c]
 465cbe8:      	ldrb	w8, [x0, #0x169]
 465cbec:      	cbnz	w8, 0x465d6a0 <_ChromeMain+0x4658404>
 465cbf0:      	ldr	x2, [x22, #0x198]
 465cbf4:      	mov	x0, x22
 465cbf8:      	mov	x1, x21
 465cbfc:      	bl	0x7793fc <_ChromeMain+0x774160>
 465cc00:      	and	x8, x21, #0xfffffffc00000000
 465cc04:      	ldr	x9, [x24, #0x88]
 465cc08:      	cmp	x8, x9
 465cc0c:      	b.ne	0x465cc18 <_ChromeMain+0x465797c>
 465cc10:      	mov	x0, x21
 465cc14:      	bl	0x142fc <_ChromeMain+0xf060>
 465cc18:      	ldr	x0, [x19, #0x508]
 465cc1c:      	and	x8, x0, #0xfffffffc00000000
 465cc20:      	ldr	x9, [x24, #0x88]
 465cc24:      	cmp	x8, x9
 465cc28:      	b.ne	0x465cc30 <_ChromeMain+0x4657994>
 465cc2c:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465cc30:      	str	x21, [x19, #0x508]
 465cc34:      	ldrb	w8, [x21, #0x1a9]
 465cc38:      	cbz	w8, 0x465cc50 <_ChromeMain+0x46579b4>
 465cc3c:      	strb	wzr, [x21, #0x1a9]
 465cc40:      	add	x1, x21, #0x1a9
 465cc44:      	mov	x0, x23
 465cc48:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465cc4c:      	ldr	x21, [x19, #0x508]
 465cc50:      	add	x8, x21, #0x310
 465cc54:      	ldrb	w9, [x21, #0x318]
 465cc58:      	cbnz	w9, 0x465d78c <_ChromeMain+0x46584f0>
 465cc5c:      	cbz	x8, 0x465d6a8 <_ChromeMain+0x465840c>
 465cc60:      	mov	x8, #0x14               ; =20
 465cc64:      	movk	x8, #0x14, lsl #32
 465cc68:      	str	x8, [x21, #0x310]
 465cc6c:      	mov	w8, #0x1                ; =1
 465cc70:      	strb	w8, [x21, #0x318]
 465cc74:      	ldr	x0, [x21, #0x188]
 465cc78:      	cbz	x0, 0x465cc8c <_ChromeMain+0x46579f0>
 465cc7c:      	ldr	x8, [x0]
 465cc80:      	ldr	x8, [x8, #0x2f8]
 465cc84:      	mov	x1, x21
 465cc88:      	blr	x8
 465cc8c:      	mov	x0, x21
 465cc90:      	mov	w1, #0x0                ; =0
 465cc94:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 465cc98:      	str	x21, [sp, #0x40]
 465cc9c:      	add	x0, x21, #0x130
 465cca0:      	add	x3, sp, #0x40
 465cca4:      	mov	w1, #0x18               ; =24
 465cca8:      	mov	w2, #0x1                ; =1
 465ccac:      	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 465ccb0:      	mov	x0, x21
 465ccb4:      	bl	0x1256ae8 <_ChromeMain+0x125184c>
 465ccb8:      	ldr	x0, [x19, #0x508]
 465ccbc:      	mov	x1, #0x14               ; =20
 465ccc0:      	movk	x1, #0x14, lsl #32
 465ccc4:      	mov	w2, #0x1                ; =1
 465ccc8:      	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 465cccc:      	ldr	x22, [x19, #0x500]
 465ccd0:      	ldapr	x0, [x26]
 465ccd4:      	cbz	x0, 0x465d6bc <_ChromeMain+0x4658420>
 465ccd8:      	mov	w1, #0x340              ; =832
 465ccdc:      	mov	x2, #0x0                ; =0
 465cce0:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 465cce4:      	mov	x21, x0
 465cce8:      	stp	xzr, xzr, [sp, #0x48]
 465ccec:      	str	xzr, [sp, #0x40]
 465ccf0:      	bl	0x136f140 <_ChromeMain+0x1369ea4>
 465ccf4:      	adrp	x8, 0xe6db000 <dyld_stub_binder+0xe6db000>
 465ccf8:      	add	x8, x8, #0x90
 465ccfc:      	add	x9, x8, #0x3e8
 465cd00:      	stp	x8, x9, [x0]
 465cd04:      	add	x9, x8, #0x410
 465cd08:      	str	x9, [x0, #0x10]
 465cd0c:      	add	x9, x8, #0x448
 465cd10:      	add	x10, x8, #0x478
 465cd14:      	stp	x9, x10, [x0, #0x68]
 465cd18:      	add	x9, x8, #0x4c8
 465cd1c:      	str	x9, [x0, #0xb0]
 465cd20:      	add	x9, x8, #0x528
 465cd24:      	str	x9, [x0, #0xd8]
 465cd28:      	add	x8, x8, #0x558
 465cd2c:      	mov	x23, x0
 465cd30:      	str	x8, [x23, #0xf8]!
 465cd34:      	add	x8, x0, #0x310
 465cd38:      	add	x0, sp, #0x40
 465cd3c:      	bl	0x4587780 <_ChromeMain+0x45824e4>
 465cd40:      	mov	x8, #0x14               ; =20
 465cd44:      	movk	x8, #0xc, lsl #32
 465cd48:      	str	x8, [x21, #0x328]
 465cd4c:      	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 465cd50:      	ldr	q0, [x8, #0x8b0]
 465cd54:      	str	q0, [x21, #0x330]
 465cd58:      	ldrb	w8, [x21, #0x1a9]
 465cd5c:      	cbz	w8, 0x465cd70 <_ChromeMain+0x4657ad4>
 465cd60:      	strb	wzr, [x21, #0x1a9]
 465cd64:      	add	x1, x21, #0x1a9
 465cd68:      	mov	x0, x23
 465cd6c:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465cd70:      	ldrsb	w8, [sp, #0x57]
 465cd74:      	tbz	w8, #0x1f, 0x465cd88 <_ChromeMain+0x4657aec>
 465cd78:      	ldr	x0, [sp, #0x40]
 465cd7c:      	ldr	x8, [sp, #0x50]
 465cd80:      	lsl	x1, x8, #1
 465cd84:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465cd88:      	ldrb	w8, [x21, #0x169]
 465cd8c:      	cbnz	w8, 0x465d6e8 <_ChromeMain+0x465844c>
 465cd90:      	ldr	x2, [x22, #0x198]
 465cd94:      	mov	x0, x22
 465cd98:      	mov	x1, x21
 465cd9c:      	bl	0x7793fc <_ChromeMain+0x774160>
 465cda0:      	and	x8, x21, #0xfffffffc00000000
 465cda4:      	ldr	x9, [x24, #0x88]
 465cda8:      	cmp	x8, x9
 465cdac:      	b.ne	0x465cdb8 <_ChromeMain+0x4657b1c>
 465cdb0:      	mov	x0, x21
 465cdb4:      	bl	0x142fc <_ChromeMain+0xf060>
 465cdb8:      	ldr	x0, [x19, #0x510]
 465cdbc:      	and	x8, x0, #0xfffffffc00000000
 465cdc0:      	ldr	x9, [x24, #0x88]
 465cdc4:      	cmp	x8, x9
 465cdc8:      	b.ne	0x465cdd0 <_ChromeMain+0x4657b34>
 465cdcc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465cdd0:      	str	x21, [x19, #0x510]
 465cdd4:      	ldr	x8, [x21]
 465cdd8:      	ldr	x8, [x8, #0xa0]
 465cddc:      	mov	x0, x21
 465cde0:      	mov	w1, #0x0                ; =0
 465cde4:      	blr	x8
 465cde8:      	ldapr	x0, [x26]
 465cdec:      	cbz	x0, 0x465d6c4 <_ChromeMain+0x4658428>
 465cdf0:      	mov	w1, #0x460              ; =1120
 465cdf4:      	mov	x2, #0x0                ; =0
 465cdf8:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 465cdfc:      	mov	x21, x0
 465ce00:      	mov	x1, #0x0                ; =0
 465ce04:      	mov	x2, #0x0                ; =0
 465ce08:      	mov	w3, #0x5                ; =5
 465ce0c:      	mov	w4, #0x1000             ; =4096
 465ce10:      	mov	w5, #0x0                ; =0
 465ce14:      	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 465ce18:      	ldrb	w8, [x0, #0x169]
 465ce1c:      	cbnz	w8, 0x465d6f4 <_ChromeMain+0x4658458>
 465ce20:      	ldr	x2, [x19, #0x198]
 465ce24:      	mov	x0, x19
 465ce28:      	mov	x1, x21
 465ce2c:      	bl	0x7793fc <_ChromeMain+0x774160>
 465ce30:      	and	x8, x21, #0xfffffffc00000000
 465ce34:      	ldr	x9, [x24, #0x88]
 465ce38:      	cmp	x8, x9
 465ce3c:      	b.ne	0x465ce48 <_ChromeMain+0x4657bac>
 465ce40:      	mov	x0, x21
 465ce44:      	bl	0x142fc <_ChromeMain+0xf060>
 465ce48:      	ldr	x0, [x19, #0x518]
 465ce4c:      	and	x8, x0, #0xfffffffc00000000
 465ce50:      	ldr	x9, [x24, #0x88]
 465ce54:      	cmp	x8, x9
 465ce58:      	b.ne	0x465ce60 <_ChromeMain+0x4657bc4>
 465ce5c:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465ce60:      	str	x21, [x19, #0x518]
 465ce64:      	ldrb	w8, [x21, #0x1a9]
 465ce68:      	cbz	w8, 0x465ce80 <_ChromeMain+0x4657be4>
 465ce6c:      	strb	wzr, [x21, #0x1a9]
 465ce70:      	add	x0, x21, #0xf8
 465ce74:      	add	x1, x21, #0x1a9
 465ce78:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465ce7c:      	ldr	x21, [x19, #0x518]
 465ce80:      	mov	x0, x21
 465ce84:      	mov	w1, #0x3                ; =3
 465ce88:      	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 465ce8c:      	ldr	x0, [x19, #0x518]
 465ce90:      	mov	w1, #0x6                ; =6
 465ce94:      	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 465ce98:      	ldr	x21, [x19, #0x518]
 465ce9c:      	ldrb	w8, [x21, #0x3d8]
 465cea0:      	cbz	w8, 0x465cec0 <_ChromeMain+0x4657c24>
 465cea4:      	strb	wzr, [x21, #0x3d8]
 465cea8:      	mov	x0, x21
 465ceac:      	bl	0x5a383c <_ChromeMain+0x59e5a0>
 465ceb0:      	add	x0, x21, #0xf8
 465ceb4:      	add	x1, x21, #0x3d8
 465ceb8:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465cebc:      	ldr	x21, [x19, #0x518]
 465cec0:      	ldrb	w8, [x21, #0x3b6]
 465cec4:      	cbnz	w8, 0x465d5cc <_ChromeMain+0x4658330>
 465cec8:      	mov	x0, x21
 465cecc:      	mov	w1, #0x0                ; =0
 465ced0:      	bl	0x273f370 <_ChromeMain+0x273a0d4>
 465ced4:      	ldr	x0, [x19, #0x518]
 465ced8:      	stur	wzr, [x29, #-0x68]
 465cedc:      	mov	w8, #0x1                ; =1
 465cee0:      	sturb	w8, [x29, #-0x64]
 465cee4:      	sub	x1, x29, #0x68
 465cee8:      	bl	0x8486f0 <_ChromeMain+0x843454>
 465ceec:      	ldr	x21, [x19, #0x518]
 465cef0:      	ldr	x23, [x21, #0x358]
 465cef4:      	ldr	x22, [x23, #0x48]
 465cef8:      	ldr	w8, [x22, #0x44]
 465cefc:      	cmn	w8, #0x1
 465cf00:      	b.eq	0x465d7ac <_ChromeMain+0x4658510>
 465cf04:      	mov	w9, #0xe                ; =14
 465cf08:      	sub	w1, w9, w8
 465cf0c:      	mov	x0, x22
 465cf10:      	mov	w2, #0x0                ; =0
 465cf14:      	mov	w3, #0x1f4              ; =500
 465cf18:      	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 465cf1c:      	str	x0, [sp, #0x40]
 465cf20:      	cbz	x0, 0x465cf34 <_ChromeMain+0x4657c98>
 465cf24:      	ldr	w8, [x0]
 465cf28:      	adds	w8, w8, #0x1
 465cf2c:      	str	w8, [x0]
 465cf30:      	b.hs	0x465d700 <_ChromeMain+0x4658464>
 465cf34:      	ldr	x8, [x21]
 465cf38:      	ldr	x8, [x8, #0x3d8]
 465cf3c:      	add	x22, sp, #0x40
 465cf40:      	add	x1, sp, #0x40
 465cf44:      	mov	x0, x21
 465cf48:      	blr	x8
 465cf4c:      	ldr	x0, [sp, #0x40]
 465cf50:      	cbz	x0, 0x465cf68 <_ChromeMain+0x4657ccc>
 465cf54:      	ldr	w9, [x0]
 465cf58:      	sub	w8, w9, #0x1
 465cf5c:      	str	w8, [x0]
 465cf60:      	cbz	w9, 0x465d70c <_ChromeMain+0x4658470>
 465cf64:      	cbz	w8, 0x465d568 <_ChromeMain+0x46582cc>
 465cf68:      	ldr	x21, [x19, #0x518]
 465cf6c:      	mov	w0, #0x40               ; =64
 465cf70:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465cf74:      	mov	w8, #0x1                ; =1
 465cf78:      	str	w8, [x0]
 465cf7c:      	adrp	x9, 0x1027000 <_ChromeMain+0x1021d64>
 465cf80:      	add	x9, x9, #0x980
 465cf84:      	adrp	x10, 0x2f2000 <_ChromeMain+0x2ecd64>
 465cf88:      	add	x10, x10, #0x880
 465cf8c:      	stp	x9, x10, [x0, #0x8]
 465cf90:      	adrp	x9, 0x3b26000 <_ChromeMain+0x3b20d64>
 465cf94:      	add	x9, x9, #0xc40
 465cf98:      	stp	x25, x9, [x0, #0x18]
 465cf9c:      	stp	xzr, xzr, [x0, #0x28]
 465cfa0:      	strb	wzr, [x0, #0x38]
 465cfa4:      	str	x0, [sp, #0x10]
 465cfa8:      	movi.2s	v0, #0x1
 465cfac:      	str	d0, [sp, #0x18]
 465cfb0:      	mov	w9, #0x3                ; =3
 465cfb4:      	str	w9, [sp, #0x20]
 465cfb8:      	stp	xzr, xzr, [sp, #0x30]
 465cfbc:      	str	xzr, [sp, #0x28]
 465cfc0:      	str	xzr, [sp, #0x50]
 465cfc4:      	str	x0, [sp, #0x40]
 465cfc8:      	cbnz	x0, 0x465d58c <_ChromeMain+0x46582f0>
 465cfcc:      	add	x8, sp, #0x10
 465cfd0:      	ldur	x9, [x8, #0x8]
 465cfd4:      	stur	x9, [x22, #0x8]
 465cfd8:      	ldur	w8, [x8, #0x10]
 465cfdc:      	stur	w8, [x22, #0x10]
 465cfe0:      	stp	xzr, xzr, [sp, #0x60]
 465cfe4:      	str	xzr, [sp, #0x58]
 465cfe8:      	mov	w8, #0x2                ; =2
 465cfec:      	str	w8, [sp, #0x48]
 465cff0:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465cff4:      	add	x1, x1, #0x548
 465cff8:      	add	x0, x21, #0xd8
 465cffc:      	add	x2, sp, #0x40
 465d000:      	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 465d004:      	add	x0, sp, #0x40
 465d008:      	bl	0x174ad24 <_ChromeMain+0x1745a88>
 465d00c:      	add	x0, sp, #0x10
 465d010:      	bl	0x174ad24 <_ChromeMain+0x1745a88>
 465d014:      	ldr	x8, [x19, #0x518]
 465d018:      	adrp	x9, 0xdf44000 <dyld_stub_binder+0xdf44000>
 465d01c:      	ldr	q0, [x9, #0x7f0]
 465d020:      	str	q0, [sp]
 465d024:      	str	q0, [sp, #0x40]
 465d028:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465d02c:      	add	x1, x1, #0x488
 465d030:      	add	x0, x8, #0xd8
 465d034:      	add	x2, sp, #0x40
 465d038:      	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 465d03c:      	ldapr	x0, [x26]
 465d040:      	cbz	x0, 0x465d6cc <_ChromeMain+0x4658430>
 465d044:      	mov	w1, #0x460              ; =1120
 465d048:      	mov	x2, #0x0                ; =0
 465d04c:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 465d050:      	mov	x21, x0
 465d054:      	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 465d058:      	add	x1, x1, #0xea4
 465d05c:      	mov	w2, #0x6                ; =6
 465d060:      	mov	w3, #0x5                ; =5
 465d064:      	mov	w4, #0x1000             ; =4096
 465d068:      	mov	w5, #0x0                ; =0
 465d06c:      	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 465d070:      	ldrb	w8, [x0, #0x169]
 465d074:      	cbnz	w8, 0x465d718 <_ChromeMain+0x465847c>
 465d078:      	ldr	x2, [x19, #0x198]
 465d07c:      	mov	x0, x19
 465d080:      	mov	x1, x21
 465d084:      	bl	0x7793fc <_ChromeMain+0x774160>
 465d088:      	and	x8, x21, #0xfffffffc00000000
 465d08c:      	ldr	x9, [x24, #0x88]
 465d090:      	cmp	x8, x9
 465d094:      	b.ne	0x465d0a0 <_ChromeMain+0x4657e04>
 465d098:      	mov	x0, x21
 465d09c:      	bl	0x142fc <_ChromeMain+0xf060>
 465d0a0:      	ldr	x0, [x19, #0x520]
 465d0a4:      	and	x8, x0, #0xfffffffc00000000
 465d0a8:      	ldr	x9, [x24, #0x88]
 465d0ac:      	cmp	x8, x9
 465d0b0:      	b.ne	0x465d0b8 <_ChromeMain+0x4657e1c>
 465d0b4:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465d0b8:      	str	x21, [x19, #0x520]
 465d0bc:      	ldrb	w8, [x21, #0x1a9]
 465d0c0:      	cbz	w8, 0x465d0d8 <_ChromeMain+0x4657e3c>
 465d0c4:      	strb	wzr, [x21, #0x1a9]
 465d0c8:      	add	x0, x21, #0xf8
 465d0cc:      	add	x1, x21, #0x1a9
 465d0d0:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465d0d4:      	ldr	x21, [x19, #0x520]
 465d0d8:      	mov	x0, x21
 465d0dc:      	mov	w1, #0x1                ; =1
 465d0e0:      	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 465d0e4:      	ldr	x0, [x19, #0x520]
 465d0e8:      	mov	w1, #0x0                ; =0
 465d0ec:      	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 465d0f0:      	ldr	x21, [x19, #0x520]
 465d0f4:      	ldrb	w8, [x21, #0x3b6]
 465d0f8:      	cbnz	w8, 0x465d5f8 <_ChromeMain+0x465835c>
 465d0fc:      	mov	x0, x21
 465d100:      	mov	w1, #0x0                ; =0
 465d104:      	bl	0x273f370 <_ChromeMain+0x273a0d4>
 465d108:      	ldr	x21, [x19, #0x520]
 465d10c:      	ldr	x23, [x21, #0x358]
 465d110:      	ldr	x22, [x23, #0x48]
 465d114:      	ldr	w8, [x22, #0x44]
 465d118:      	cmn	w8, #0x1
 465d11c:      	b.eq	0x465d7c0 <_ChromeMain+0x4658524>
 465d120:      	mov	w9, #0xa                ; =10
 465d124:      	sub	w1, w9, w8
 465d128:      	mov	x0, x22
 465d12c:      	mov	w2, #0x0                ; =0
 465d130:      	mov	w3, #0x1f4              ; =500
 465d134:      	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 465d138:      	str	x0, [sp, #0x40]
 465d13c:      	cbz	x0, 0x465d150 <_ChromeMain+0x4657eb4>
 465d140:      	ldr	w8, [x0]
 465d144:      	adds	w8, w8, #0x1
 465d148:      	str	w8, [x0]
 465d14c:      	b.hs	0x465d724 <_ChromeMain+0x4658488>
 465d150:      	ldr	x8, [x21]
 465d154:      	ldr	x8, [x8, #0x3d8]
 465d158:      	add	x1, sp, #0x40
 465d15c:      	mov	x0, x21
 465d160:      	blr	x8
 465d164:      	ldr	x0, [sp, #0x40]
 465d168:      	cbz	x0, 0x465d180 <_ChromeMain+0x4657ee4>
 465d16c:      	ldr	w9, [x0]
 465d170:      	sub	w8, w9, #0x1
 465d174:      	str	w8, [x0]
 465d178:      	cbz	w9, 0x465d730 <_ChromeMain+0x4658494>
 465d17c:      	cbz	w8, 0x465d558 <_ChromeMain+0x46582bc>
 465d180:      	ldr	x21, [x19, #0x520]
 465d184:      	mov	w0, #0x20               ; =32
 465d188:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465d18c:      	mov	x1, x0
 465d190:      	mov	w8, #-0x10000           ; =-65536
 465d194:      	str	w8, [x0, #0x8]
 465d198:      	mov	w23, #0x1               ; =1
 465d19c:      	strb	w23, [x0, #0xc]
 465d1a0:      	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 465d1a4:      	add	x8, x8, #0x110
 465d1a8:      	str	x8, [x0]
 465d1ac:      	mov	x8, #0x500000000        ; =21474836480
 465d1b0:      	dup.2d	v0, x8
 465d1b4:      	str	q0, [x0, #0x10]
 465d1b8:      	ldr	x8, [x21]
 465d1bc:      	ldr	x8, [x8, #0x110]
 465d1c0:      	mov	x0, x21
 465d1c4:      	blr	x8
 465d1c8:      	ldr	x21, [x19, #0x520]
 465d1cc:      	mov	w8, #0xd7               ; =215
 465d1d0:      	str	w8, [sp, #0x10]
 465d1d4:      	strb	wzr, [sp, #0x14]
 465d1d8:      	add	x0, sp, #0x10
 465d1dc:      	fmov	s0, #6.00000000
 465d1e0:      	mov	w1, #0x0                ; =0
 465d1e4:      	bl	0x275f0c0 <_ChromeMain+0x2759e24>
 465d1e8:      	mov	x1, x0
 465d1ec:      	mov	x0, x21
 465d1f0:      	bl	0xf27a00 <_ChromeMain+0xf22764>
 465d1f4:      	ldr	x8, [x19, #0x520]
 465d1f8:      	ldr	q0, [sp]
 465d1fc:      	str	q0, [sp, #0x40]
 465d200:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465d204:      	add	x1, x1, #0x488
 465d208:      	add	x0, x8, #0xd8
 465d20c:      	add	x2, sp, #0x40
 465d210:      	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 465d214:      	ldr	x0, [x19, #0x520]
 465d218:      	ldr	x8, [x0]
 465d21c:      	ldr	x8, [x8, #0xa0]
 465d220:      	mov	w1, #0x0                ; =0
 465d224:      	blr	x8
 465d228:      	ldapr	x0, [x26]
 465d22c:      	cbz	x0, 0x465d6d4 <_ChromeMain+0x4658438>
 465d230:      	mov	w1, #0x380              ; =896
 465d234:      	mov	x2, #0x0                ; =0
 465d238:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 465d23c:      	mov	x21, x0
 465d240:      	bl	0x242d238 <_ChromeMain+0x2427f9c>
 465d244:      	add	x8, x27, #0x3f0
 465d248:      	stp	x27, x8, [x0]
 465d24c:      	add	x8, x27, #0x418
 465d250:      	str	x8, [x0, #0x10]
 465d254:      	add	x8, x27, #0x450
 465d258:      	add	x9, x27, #0x480
 465d25c:      	stp	x8, x9, [x0, #0x68]
 465d260:      	add	x8, x27, #0x4d0
 465d264:      	str	x8, [x0, #0xb0]
 465d268:      	add	x8, x27, #0x530
 465d26c:      	str	x8, [x0, #0xd8]
 465d270:      	add	x8, x27, #0x560
 465d274:      	mov	x22, x0
 465d278:      	str	x8, [x22, #0xf8]!
 465d27c:      	str	xzr, [x0, #0x348]
 465d280:      	movi	d0, #0xffff000000000000
 465d284:      	str	d0, [x0, #0x350]
 465d288:      	strb	w23, [x0, #0x358]
 465d28c:      	str	xzr, [x0, #0x360]
 465d290:      	strb	wzr, [x0, #0x368]
 465d294:      	str	xzr, [x0, #0x370]
 465d298:      	str	wzr, [x0, #0x378]
 465d29c:      	strb	wzr, [x0, #0x37c]
 465d2a0:      	ldrb	w8, [x0, #0x169]
 465d2a4:      	cbnz	w8, 0x465d73c <_ChromeMain+0x46584a0>
 465d2a8:      	ldr	x2, [x19, #0x198]
 465d2ac:      	mov	x0, x19
 465d2b0:      	mov	x1, x21
 465d2b4:      	bl	0x7793fc <_ChromeMain+0x774160>
 465d2b8:      	and	x8, x21, #0xfffffffc00000000
 465d2bc:      	ldr	x9, [x24, #0x88]
 465d2c0:      	cmp	x8, x9
 465d2c4:      	b.ne	0x465d2d0 <_ChromeMain+0x4658034>
 465d2c8:      	mov	x0, x21
 465d2cc:      	bl	0x142fc <_ChromeMain+0xf060>
 465d2d0:      	ldr	x0, [x19, #0x528]
 465d2d4:      	and	x8, x0, #0xfffffffc00000000
 465d2d8:      	ldr	x9, [x24, #0x88]
 465d2dc:      	cmp	x8, x9
 465d2e0:      	b.ne	0x465d2e8 <_ChromeMain+0x465804c>
 465d2e4:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465d2e8:      	str	x21, [x19, #0x528]
 465d2ec:      	ldrb	w8, [x21, #0x1a9]
 465d2f0:      	cbz	w8, 0x465d308 <_ChromeMain+0x465806c>
 465d2f4:      	strb	wzr, [x21, #0x1a9]
 465d2f8:      	add	x1, x21, #0x1a9
 465d2fc:      	mov	x0, x22
 465d300:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465d304:      	ldr	x21, [x19, #0x528]
 465d308:      	add	x8, x21, #0x310
 465d30c:      	ldrb	w9, [x21, #0x318]
 465d310:      	cbnz	w9, 0x465d748 <_ChromeMain+0x46584ac>
 465d314:      	cbz	x8, 0x465d6a8 <_ChromeMain+0x465840c>
 465d318:      	mov	x8, #0xc0000000c        ; =51539607564
 465d31c:      	str	x8, [x21, #0x310]
 465d320:      	mov	w8, #0x1                ; =1
 465d324:      	strb	w8, [x21, #0x318]
 465d328:      	ldr	x0, [x21, #0x188]
 465d32c:      	cbz	x0, 0x465d340 <_ChromeMain+0x46580a4>
 465d330:      	ldr	x8, [x0]
 465d334:      	ldr	x8, [x8, #0x2f8]
 465d338:      	mov	x1, x21
 465d33c:      	blr	x8
 465d340:      	mov	x0, x21
 465d344:      	mov	w1, #0x0                ; =0
 465d348:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 465d34c:      	str	x21, [sp, #0x40]
 465d350:      	add	x0, x21, #0x130
 465d354:      	add	x3, sp, #0x40
 465d358:      	mov	w1, #0x18               ; =24
 465d35c:      	mov	w2, #0x1                ; =1
 465d360:      	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 465d364:      	mov	x0, x21
 465d368:      	bl	0x1256ae8 <_ChromeMain+0x125184c>
 465d36c:      	ldr	x0, [x19, #0x528]
 465d370:      	mov	x1, #0xc0000000c        ; =51539607564
 465d374:      	mov	w2, #0x1                ; =1
 465d378:      	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 465d37c:      	mov	w0, #0x30               ; =48
 465d380:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465d384:      	mov	x4, x0
 465d388:      	stp	xzr, xzr, [x0, #0x8]
 465d38c:      	strh	wzr, [x0, #0x18]
 465d390:      	adrp	x21, 0xe34e000 <dyld_stub_binder+0xe34e000>
 465d394:      	add	x21, x21, #0xd88
 465d398:      	str	x21, [x0]
 465d39c:      	movi.4s	v0, #0x41, lsl #24
 465d3a0:      	stur	q0, [x0, #0x1c]
 465d3a4:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465d3a8:      	add	x1, x1, #0x528
 465d3ac:      	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 465d3b0:      	add	x2, x2, #0x992
 465d3b4:      	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 465d3b8:      	add	x3, x3, #0xf00
 465d3bc:      	mov	x0, x20
 465d3c0:      	mov	x5, #0x0                ; =0
 465d3c4:      	bl	0xb6a19c <_ChromeMain+0xb64f00>
 465d3c8:      	cbnz	x0, 0x465d548 <_ChromeMain+0x46582ac>
 465d3cc:      	mov	x0, x19
 465d3d0:      	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 465d3d4:      	mov	x9, x19
 465d3d8:      	ldr	x8, [x9, #0xe8]!
 465d3dc:      	cbz	x8, 0x465d400 <_ChromeMain+0x4658164>
 465d3e0:      	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 465d3e4:      	add	x10, x10, #0xcb0
 465d3e8:      	ldr	x11, [x8, #0x20]
 465d3ec:      	cmp	x11, x10
 465d3f0:      	b.hi	0x465d494 <_ChromeMain+0x46581f8>
 465d3f4:      	b.hs	0x465d484 <_ChromeMain+0x46581e8>
 465d3f8:      	ldr	x8, [x8, #0x8]
 465d3fc:      	cbnz	x8, 0x465d3e8 <_ChromeMain+0x465814c>
 465d400:      	mov	x20, #0x0               ; =0
 465d404:      	mov	w0, #0x30               ; =48
 465d408:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465d40c:      	mov	x8, x0
 465d410:      	stp	xzr, xzr, [x0, #0x8]
 465d414:      	strh	wzr, [x0, #0x18]
 465d418:      	str	x21, [x0]
 465d41c:      	movi.4s	v0, #0x41, lsl #24
 465d420:      	stur	q0, [x0, #0x1c]
 465d424:      	ldr	x0, [x20, #0x318]
 465d428:      	str	x8, [x20, #0x318]
 465d42c:      	cbnz	x0, 0x465d79c <_ChromeMain+0x4658500>
 465d430:      	mov	x0, x20
 465d434:      	mov	w1, #0x0                ; =0
 465d438:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 465d43c:      	mov	x0, x20
 465d440:      	bl	0x5a117c <_ChromeMain+0x59bee0>
 465d444:      	mov	x0, x19
 465d448:      	bl	0x465dab8 <_ChromeMain+0x465881c>
 465d44c:      	mov	x0, x19
 465d450:      	bl	0x465de00 <_ChromeMain+0x4658b64>
 465d454:      	ldr	w8, [x19, #0x3bc]
 465d458:      	sub	w8, w8, #0x1
 465d45c:      	cmp	w8, #0x1
 465d460:      	b.ls	0x465d4a0 <_ChromeMain+0x4658204>
 465d464:      	mov	w0, #0x10               ; =16
 465d468:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465d46c:      	mov	x1, x0
 465d470:      	adrp	x8, 0xe34b000 <dyld_stub_binder+0xe34b000>
 465d474:      	add	x8, x8, #0xf00
 465d478:      	mov	x9, #0x100000000        ; =4294967296
 465d47c:      	stp	x8, x9, [x0]
 465d480:      	b	0x465d4c0 <_ChromeMain+0x4658224>
 465d484:      	cmp	x8, x9
 465d488:      	b.eq	0x465d400 <_ChromeMain+0x4658164>
 465d48c:      	ldr	x20, [x8, #0x30]
 465d490:      	b	0x465d404 <_ChromeMain+0x4658168>
 465d494:      	ldr	x8, [x8]
 465d498:      	cbnz	x8, 0x465d3e8 <_ChromeMain+0x465814c>
 465d49c:      	b	0x465d400 <_ChromeMain+0x4658164>
 465d4a0:      	mov	w8, #0xf7               ; =247
 465d4a4:      	str	w8, [sp, #0x40]
 465d4a8:      	strb	wzr, [sp, #0x44]
 465d4ac:      	add	x0, sp, #0x40
 465d4b0:      	fmov	s0, #8.00000000
 465d4b4:      	mov	w1, #0x0                ; =0
 465d4b8:      	bl	0x275f0c0 <_ChromeMain+0x2759e24>
 465d4bc:      	mov	x1, x0
 465d4c0:      	mov	x0, x19
 465d4c4:      	bl	0xf27a00 <_ChromeMain+0xf22764>
 465d4c8:      	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 465d4cc:      	ldr	x0, [x8, #0xcf8]
 465d4d0:      	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 465d4d4:      	cbz	x0, 0x465d51c <_ChromeMain+0x4658280>
 465d4d8:      	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 465d4dc:      	mov	x20, x0
 465d4e0:      	and	x8, x0, #0xfffffffc00000000
 465d4e4:      	ldr	x9, [x24, #0x88]
 465d4e8:      	cmp	x8, x9
 465d4ec:      	b.ne	0x465d4f8 <_ChromeMain+0x465825c>
 465d4f0:      	mov	x0, x20
 465d4f4:      	bl	0x142fc <_ChromeMain+0xf060>
 465d4f8:      	ldr	x0, [x19, #0x5a0]
 465d4fc:      	and	x8, x0, #0xfffffffc00000000
 465d500:      	ldr	x9, [x24, #0x88]
 465d504:      	cmp	x8, x9
 465d508:      	b.eq	0x465d784 <_ChromeMain+0x46584e8>
 465d50c:      	str	x20, [x19, #0x5a0]
 465d510:      	ldr	x1, [x19, #0x598]
 465d514:      	add	x0, x20, #0x18
 465d518:      	bl	0x14c3a90 <_ChromeMain+0x14be7f4>
 465d51c:      	mov	x0, x19
 465d520:      	bl	0x465df60 <_ChromeMain+0x4658cc4>
 465d524:      	mov	x0, x19
 465d528:      	ldp	x29, x30, [sp, #0xe0]
 465d52c:      	ldp	x20, x19, [sp, #0xd0]
 465d530:      	ldp	x22, x21, [sp, #0xc0]
 465d534:      	ldp	x24, x23, [sp, #0xb0]
 465d538:      	ldp	x26, x25, [sp, #0xa0]
 465d53c:      	ldp	x28, x27, [sp, #0x90]
 465d540:      	add	sp, sp, #0xf0
 465d544:      	ret
 465d548:      	ldr	x8, [x0]
 465d54c:      	ldr	x8, [x8, #0x8]
 465d550:      	blr	x8
 465d554:      	b	0x465d3cc <_ChromeMain+0x4658130>
 465d558:      	bl	0x114c7c4 <_ChromeMain+0x1147528>
 465d55c:      	mov	w1, #0x50               ; =80
 465d560:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d564:      	b	0x465d180 <_ChromeMain+0x4657ee4>
 465d568:      	bl	0x114c7c4 <_ChromeMain+0x1147528>
 465d56c:      	mov	w1, #0x50               ; =80
 465d570:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d574:      	b	0x465cf68 <_ChromeMain+0x4657ccc>
 465d578:      	str	wzr, [x21, #0xf0]
 465d57c:      	mov	x0, x21
 465d580:      	mov	w1, #0x1                ; =1
 465d584:      	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 465d588:      	b	0x465ca48 <_ChromeMain+0x46577ac>
 465d58c:      	ldadd	w8, w8, [x0]
 465d590:      	cmp	w8, #0x0
 465d594:      	b.le	0x465d7d4 <_ChromeMain+0x4658538>
 465d598:      	mov	w9, #0x7fffffff         ; =2147483647
 465d59c:      	cmp	w8, w9
 465d5a0:      	b.ne	0x465cfcc <_ChromeMain+0x4657d30>
 465d5a4:      	brk	#0
 465d5a8:      	hlt	#0
 465d5ac:      	brk	#0x1
 465d5b0:      	mov	w8, #-0x1               ; =-1
 465d5b4:      	ldaddal	w8, w8, [x0]
 465d5b8:      	cmp	w8, #0x1
 465d5bc:      	b.ne	0x465c710 <_ChromeMain+0x4657474>
 465d5c0:      	ldr	x8, [x0, #0x10]
 465d5c4:      	blr	x8
 465d5c8:      	b	0x465c710 <_ChromeMain+0x4657474>
 465d5cc:      	strb	wzr, [x21, #0x3b6]
 465d5d0:      	mov	x0, x21
 465d5d4:      	bl	0xf28308 <_ChromeMain+0xf2306c>
 465d5d8:      	mov	x0, x21
 465d5dc:      	mov	w1, #0x2                ; =2
 465d5e0:      	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 465d5e4:      	add	x0, x21, #0xf8
 465d5e8:      	add	x1, x21, #0x3b6
 465d5ec:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465d5f0:      	ldr	x21, [x19, #0x518]
 465d5f4:      	b	0x465cec8 <_ChromeMain+0x4657c2c>
 465d5f8:      	strb	wzr, [x21, #0x3b6]
 465d5fc:      	mov	x0, x21
 465d600:      	bl	0xf28308 <_ChromeMain+0xf2306c>
 465d604:      	mov	x0, x21
 465d608:      	mov	w1, #0x2                ; =2
 465d60c:      	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 465d610:      	add	x0, x21, #0xf8
 465d614:      	add	x1, x21, #0x3b6
 465d618:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 465d61c:      	ldr	x21, [x19, #0x520]
 465d620:      	b	0x465d0fc <_ChromeMain+0x4657e60>
 465d624:      	mov	w8, #-0x1               ; =-1
 465d628:      	ldaddal	w8, w8, [x22]
 465d62c:      	cmp	w8, #0x1
 465d630:      	b.ne	0x465c9c4 <_ChromeMain+0x4657728>
 465d634:      	ldr	x8, [x22, #0x10]
 465d638:      	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 465d63c:      	add	x9, x9, #0x640
 465d640:      	cmp	x8, x9
 465d644:      	b.eq	0x465d66c <_ChromeMain+0x46583d0>
 465d648:      	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 465d64c:      	add	x9, x9, #0x600
 465d650:      	mov	x0, x22
 465d654:      	cmp	x8, x9
 465d658:      	b.eq	0x465d664 <_ChromeMain+0x46583c8>
 465d65c:      	blr	x8
 465d660:      	b	0x465c9c4 <_ChromeMain+0x4657728>
 465d664:      	mov	w1, #0x38               ; =56
 465d668:      	b	0x465d67c <_ChromeMain+0x46583e0>
 465d66c:      	ldr	x0, [x22, #0x30]
 465d670:      	cbnz	x0, 0x465d684 <_ChromeMain+0x46583e8>
 465d674:      	mov	x0, x22
 465d678:      	mov	w1, #0x48               ; =72
 465d67c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d680:      	b	0x465c9c4 <_ChromeMain+0x4657728>
 465d684:      	mov	w8, #-0x1               ; =-1
 465d688:      	ldaddal	w8, w8, [x0]
 465d68c:      	cmp	w8, #0x1
 465d690:      	b.ne	0x465d674 <_ChromeMain+0x46583d8>
 465d694:      	mov	w1, #0x8                ; =8
 465d698:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d69c:      	b	0x465d674 <_ChromeMain+0x46583d8>
 465d6a0:      	brk	#0
 465d6a4:      	hlt	#0
 465d6a8:      	brk	#0x1
 465d6ac:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6b0:      	b	0x465ca74 <_ChromeMain+0x46577d8>
 465d6b4:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6b8:      	b	0x465cb70 <_ChromeMain+0x46578d4>
 465d6bc:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6c0:      	b	0x465ccd8 <_ChromeMain+0x4657a3c>
 465d6c4:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6c8:      	b	0x465cdf0 <_ChromeMain+0x4657b54>
 465d6cc:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6d0:      	b	0x465d044 <_ChromeMain+0x4657da8>
 465d6d4:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465d6d8:      	b	0x465d230 <_ChromeMain+0x4657f94>
 465d6dc:      	brk	#0
 465d6e0:      	hlt	#0
 465d6e4:      	brk	#0x1
 465d6e8:      	brk	#0
 465d6ec:      	hlt	#0
 465d6f0:      	brk	#0x1
 465d6f4:      	brk	#0
 465d6f8:      	hlt	#0
 465d6fc:      	brk	#0x1
 465d700:      	brk	#0
 465d704:      	hlt	#0
 465d708:      	brk	#0x1
 465d70c:      	brk	#0
 465d710:      	hlt	#0
 465d714:      	brk	#0x1
 465d718:      	brk	#0
 465d71c:      	hlt	#0
 465d720:      	brk	#0x1
 465d724:      	brk	#0
 465d728:      	hlt	#0
 465d72c:      	brk	#0x1
 465d730:      	brk	#0
 465d734:      	hlt	#0
 465d738:      	brk	#0x1
 465d73c:      	brk	#0
 465d740:      	hlt	#0
 465d744:      	brk	#0x1
 465d748:      	mov	x9, #0xc0000000c        ; =51539607564
 465d74c:      	str	x9, [x8]
 465d750:      	b	0x465d328 <_ChromeMain+0x465808c>
 465d754:      	brk	#0
 465d758:      	hlt	#0
 465d75c:      	brk	#0x1
 465d760:      	brk	#0
 465d764:      	hlt	#0
 465d768:      	brk	#0x1
 465d76c:      	brk	#0
 465d770:      	hlt	#0
 465d774:      	brk	#0x1
 465d778:      	brk	#0
 465d77c:      	hlt	#0
 465d780:      	brk	#0x1
 465d784:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465d788:      	b	0x465d50c <_ChromeMain+0x4658270>
 465d78c:      	mov	x9, #0x14               ; =20
 465d790:      	movk	x9, #0x14, lsl #32
 465d794:      	str	x9, [x8]
 465d798:      	b	0x465cc74 <_ChromeMain+0x46579d8>
 465d79c:      	ldr	x8, [x0]
 465d7a0:      	ldr	x8, [x8, #0x8]
 465d7a4:      	blr	x8
 465d7a8:      	b	0x465d430 <_ChromeMain+0x4658194>
 465d7ac:      	mov	x0, x22
 465d7b0:      	bl	0x2226140 <_ChromeMain+0x2220ea4>
 465d7b4:      	ldr	w8, [x22, #0x44]
 465d7b8:      	ldr	x22, [x23, #0x48]
 465d7bc:      	b	0x465cf04 <_ChromeMain+0x4657c68>
 465d7c0:      	mov	x0, x22
 465d7c4:      	bl	0x2226140 <_ChromeMain+0x2220ea4>
 465d7c8:      	ldr	w8, [x22, #0x44]
 465d7cc:      	ldr	x22, [x23, #0x48]
 465d7d0:      	b	0x465d120 <_ChromeMain+0x4657e84>
 465d7d4:      	brk	#0
 465d7d8:      	hlt	#0
 465d7dc:      	brk	#0x1
