
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465f738:      	stp	x20, x19, [sp, #-0x20]!
 465f73c:      	stp	x29, x30, [sp, #0x10]
 465f740:      	add	x29, sp, #0x10
 465f744:      	strb	wzr, [x0, #0x535]
 465f748:      	ldrb	w8, [x0, #0x536]
 465f74c:      	tbz	w8, #0x0, 0x465f75c <_ChromeMain+0x465a4c0>
 465f750:      	ldp	x29, x30, [sp, #0x10]
 465f754:      	ldp	x20, x19, [sp], #0x20
 465f758:      	ret
 465f75c:      	mov	x19, x0
 465f760:      	ldr	x8, [x0]
 465f764:      	ldr	x8, [x8, #0x68]
 465f768:      	blr	x8
 465f76c:      	cbz	x0, 0x465f750 <_ChromeMain+0x465a4b4>
 465f770:      	mov	x0, x19
 465f774:      	ldp	x29, x30, [sp, #0x10]
 465f778:      	ldp	x20, x19, [sp], #0x20
 465f77c:      	b	0x465f780 <_ChromeMain+0x465a4e4>
 465f780:      	sub	sp, sp, #0xb0
 465f784:      	stp	x24, x23, [sp, #0x70]
 465f788:      	stp	x22, x21, [sp, #0x80]
 465f78c:      	stp	x20, x19, [sp, #0x90]
 465f790:      	stp	x29, x30, [sp, #0xa0]
 465f794:      	add	x29, sp, #0xa0
 465f798:      	ldrb	w8, [x0, #0x536]
 465f79c:      	tbnz	w8, #0x0, 0x465f8f8 <_ChromeMain+0x465a65c>
 465f7a0:      	mov	x19, x0
 465f7a4:      	bl	0x465eff8 <_ChromeMain+0x4659d5c>
 465f7a8:      	mov	x0, x19
 465f7ac:      	bl	0x465dab8 <_ChromeMain+0x465881c>
 465f7b0:      	ldr	x23, [x19, #0x4f8]
 465f7b4:      	cbz	x23, 0x465f7c0 <_ChromeMain+0x465a524>
 465f7b8:      	ldrb	w8, [x23, #0x510]
 465f7bc:      	cbnz	w8, 0x465f910 <_ChromeMain+0x465a674>
 465f7c0:      	strh	wzr, [x19, #0x532]
 465f7c4:      	strb	wzr, [x19, #0x534]
 465f7c8:      	mov	x0, x19
 465f7cc:      	mov	w1, #0x16               ; =22
 465f7d0:      	bl	0x465fbc0 <_ChromeMain+0x465a924>
 465f7d4:      	ldr	x8, [x19, #0x4d0]
 465f7d8:      	ldr	x8, [x8, #0x538]
 465f7dc:      	ldr	x21, [x8, #0x68]
 465f7e0:      	adrp	x20, 0xe82b000 <dyld_stub_binder+0xe82b000>
 465f7e4:      	add	x20, x20, #0xa10
 465f7e8:      	cbz	x21, 0x465f81c <_ChromeMain+0x465a580>
 465f7ec:      	mov	x0, x21
 465f7f0:      	bl	0x529c24 <_ChromeMain+0x524988>
 465f7f4:      	cmp	w0, #0x2
 465f7f8:      	b.eq	0x465f814 <_ChromeMain+0x465a578>
 465f7fc:      	ldrb	w8, [x21, #0x48]
 465f800:      	adrp	x9, 0xe82b000 <dyld_stub_binder+0xe82b000>
 465f804:      	add	x9, x9, #0xf08
 465f808:      	cmp	w8, #0x0
 465f80c:      	csel	x20, x9, x20, ne
 465f810:      	b	0x465f81c <_ChromeMain+0x465a580>
 465f814:      	adrp	x20, 0xe82b000 <dyld_stub_binder+0xe82b000>
 465f818:      	add	x20, x20, #0x948
 465f81c:      	mov	w8, #0xdd               ; =221
 465f820:      	str	w8, [sp, #0x20]
 465f824:      	strb	wzr, [sp, #0x24]
 465f828:      	add	x8, sp, #0x40
 465f82c:      	add	x1, sp, #0x20
 465f830:      	mov	x0, x20
 465f834:      	mov	w2, #0x16               ; =22
 465f838:      	mov	x3, #0x0                ; =0
 465f83c:      	bl	0xdf4920 <_ChromeMain+0xdef684>
 465f840:      	ldr	x0, [x19, #0x508]
 465f844:      	ldr	x8, [x0]
 465f848:      	ldr	x8, [x8, #0xa0]
 465f84c:      	mov	w1, #0x1                ; =1
 465f850:      	blr	x8
 465f854:      	ldr	x0, [x19, #0x510]
 465f858:      	ldr	x8, [x0]
 465f85c:      	ldr	x8, [x8, #0xa0]
 465f860:      	mov	w1, #0x0                ; =0
 465f864:      	blr	x8
 465f868:      	ldr	x0, [x19, #0x508]
 465f86c:      	add	x1, sp, #0x40
 465f870:      	bl	0x5a10a0 <_ChromeMain+0x59be04>
 465f874:      	add	x0, sp, #0x40
 465f878:      	bl	0x846840 <_ChromeMain+0x8415a4>
 465f87c:      	mov	x0, x19
 465f880:      	bl	0x465de00 <_ChromeMain+0x4658b64>
 465f884:      	ldr	x0, [x19, #0x518]
 465f888:      	mov	w20, #0xdd              ; =221
 465f88c:      	str	x20, [sp, #0x10]
 465f890:      	ldr	x8, [x0]
 465f894:      	ldr	x8, [x8, #0x3e8]
 465f898:      	add	x1, sp, #0x10
 465f89c:      	blr	x8
 465f8a0:      	ldr	x0, [x19, #0x520]
 465f8a4:      	str	x20, [sp, #0x8]
 465f8a8:      	ldr	x8, [x0]
 465f8ac:      	ldr	x8, [x8, #0x3e8]
 465f8b0:      	add	x1, sp, #0x8
 465f8b4:      	blr	x8
 465f8b8:      	ldr	x19, [x19, #0x528]
 465f8bc:      	mov	w8, #0xde               ; =222
 465f8c0:      	str	w8, [sp]
 465f8c4:      	strb	wzr, [sp, #0x4]
 465f8c8:      	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 465f8cc:      	add	x0, x0, #0xf50
 465f8d0:      	add	x8, sp, #0x40
 465f8d4:      	mov	x1, sp
 465f8d8:      	mov	w2, #0x7                ; =7
 465f8dc:      	mov	x3, #0x0                ; =0
 465f8e0:      	bl	0xdf4920 <_ChromeMain+0xdef684>
 465f8e4:      	add	x1, sp, #0x40
 465f8e8:      	mov	x0, x19
 465f8ec:      	bl	0x5a10a0 <_ChromeMain+0x59be04>
 465f8f0:      	add	x0, sp, #0x40
 465f8f4:      	bl	0x846840 <_ChromeMain+0x8415a4>
 465f8f8:      	ldp	x29, x30, [sp, #0xa0]
 465f8fc:      	ldp	x20, x19, [sp, #0x90]
 465f900:      	ldp	x22, x21, [sp, #0x80]
 465f904:      	ldp	x24, x23, [sp, #0x70]
 465f908:      	add	sp, sp, #0xb0
 465f90c:      	ret
 465f910:      	add	x20, x23, #0x4e8
 465f914:      	ldrb	w8, [x23, #0x508]
 465f918:      	cmp	w8, #0x1
 465f91c:      	b.ne	0x465fae0 <_ChromeMain+0x465a844>
 465f920:      	ldr	x8, [x20]
 465f924:      	cbz	x8, 0x465f7c0 <_ChromeMain+0x465a524>
 465f928:      	ldr	x8, [x8, #0x18]
 465f92c:      	cbz	x8, 0x465f7c0 <_ChromeMain+0x465a524>
 465f930:      	mov	w8, #0x1                ; =1
 465f934:      	strb	w8, [x19, #0x532]
 465f938:      	ldr	x8, [x19, #0x4d0]
 465f93c:      	ldr	x8, [x8, #0x538]
 465f940:      	ldr	x21, [x8, #0x68]
 465f944:      	adrp	x24, 0xeee6000 <dyld_stub_binder+0xeee6000>
 465f948:      	cbz	x21, 0x465f9a8 <_ChromeMain+0x465a70c>
 465f94c:      	ldr	x0, [x24, #0xcf8]
 465f950:      	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 465f954:      	cbz	x0, 0x465f9a8 <_ChromeMain+0x465a70c>
 465f958:      	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 465f95c:      	mov	x22, x0
 465f960:      	ldr	x8, [x21]
 465f964:      	ldr	x8, [x8, #0x150]
 465f968:      	mov	x0, x21
 465f96c:      	blr	x8
 465f970:      	ldr	x8, [x0]
 465f974:      	ldr	x9, [x8, #0x30]
 465f978:      	add	x8, sp, #0x40
 465f97c:      	blr	x9
 465f980:      	add	x1, sp, #0x40
 465f984:      	mov	x0, x22
 465f988:      	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 465f98c:      	mov	x21, x0
 465f990:      	ldrsb	w8, [sp, #0x57]
 465f994:      	tbnz	w8, #0x1f, 0x465fab0 <_ChromeMain+0x465a814>
 465f998:      	cbz	x21, 0x465f9a8 <_ChromeMain+0x465a70c>
 465f99c:      	mov	x0, x21
 465f9a0:      	bl	0x2743648 <_ChromeMain+0x273e3ac>
 465f9a4:      	tbnz	w0, #0x0, 0x465fa20 <_ChromeMain+0x465a784>
 465f9a8:      	strb	wzr, [x19, #0x533]
 465f9ac:      	ldr	x8, [x19, #0x4d0]
 465f9b0:      	ldr	x8, [x8, #0x538]
 465f9b4:      	ldr	x21, [x8, #0x68]
 465f9b8:      	cbz	x21, 0x465fa38 <_ChromeMain+0x465a79c>
 465f9bc:      	ldr	x0, [x24, #0xcf8]
 465f9c0:      	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 465f9c4:      	cbz	x0, 0x465fa38 <_ChromeMain+0x465a79c>
 465f9c8:      	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 465f9cc:      	mov	x22, x0
 465f9d0:      	ldr	x8, [x21]
 465f9d4:      	ldr	x8, [x8, #0x150]
 465f9d8:      	mov	x0, x21
 465f9dc:      	blr	x8
 465f9e0:      	ldr	x8, [x0]
 465f9e4:      	ldr	x9, [x8, #0x30]
 465f9e8:      	add	x8, sp, #0x40
 465f9ec:      	blr	x9
 465f9f0:      	add	x1, sp, #0x40
 465f9f4:      	mov	x0, x22
 465f9f8:      	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 465f9fc:      	mov	x21, x0
 465fa00:      	ldrsb	w8, [sp, #0x57]
 465fa04:      	tbnz	w8, #0x1f, 0x465fac8 <_ChromeMain+0x465a82c>
 465fa08:      	cbz	x21, 0x465fa38 <_ChromeMain+0x465a79c>
 465fa0c:      	mov	x0, x21
 465fa10:      	bl	0x415aa38 <_ChromeMain+0x415579c>
 465fa14:      	cmp	x0, #0x1a
 465fa18:      	cset	w8, eq
 465fa1c:      	b	0x465fa3c <_ChromeMain+0x465a7a0>
 465fa20:      	mov	x0, x21
 465fa24:      	bl	0x2743740 <_ChromeMain+0x273e4a4>
 465fa28:      	cmp	x0, #0x0
 465fa2c:      	cset	w8, ne
 465fa30:      	strb	w8, [x19, #0x533]
 465fa34:      	cbz	x0, 0x465f9ac <_ChromeMain+0x465a710>
 465fa38:      	mov	w8, #0x0                ; =0
 465fa3c:      	strb	w8, [x19, #0x534]
 465fa40:      	mov	x0, x19
 465fa44:      	mov	w1, #0x14               ; =20
 465fa48:      	bl	0x465fbc0 <_ChromeMain+0x465a924>
 465fa4c:      	ldrb	w8, [x19, #0x533]
 465fa50:      	cbnz	w8, 0x465fa68 <_ChromeMain+0x465a7cc>
 465fa54:      	ldrb	w8, [x19, #0x534]
 465fa58:      	cbnz	w8, 0x465fa84 <_ChromeMain+0x465a7e8>
 465fa5c:      	str	xzr, [sp, #0x60]
 465fa60:      	movi.2d	v0, #0000000000000000
 465fa64:      	stp	q0, q0, [sp, #0x40]
 465fa68:      	ldrb	w8, [x23, #0x510]
 465fa6c:      	tbz	w8, #0x0, 0x465fbb4 <_ChromeMain+0x465a918>
 465fa70:      	add	x8, sp, #0x40
 465fa74:      	mov	x0, x20
 465fa78:      	mov	w1, #0x14               ; =20
 465fa7c:      	bl	0x7ad3088 <_ChromeMain+0x7acddec>
 465fa80:      	b	0x465f840 <_ChromeMain+0x465a5a4>
 465fa84:      	ldr	x0, [x19, #0x508]
 465fa88:      	ldr	x8, [x0]
 465fa8c:      	ldr	x8, [x8, #0xa0]
 465fa90:      	mov	w1, #0x0                ; =0
 465fa94:      	blr	x8
 465fa98:      	ldr	x0, [x19, #0x510]
 465fa9c:      	ldr	x8, [x0]
 465faa0:      	ldr	x8, [x8, #0xa0]
 465faa4:      	mov	w1, #0x1                ; =1
 465faa8:      	blr	x8
 465faac:      	b	0x465f87c <_ChromeMain+0x465a5e0>
 465fab0:      	ldr	x0, [sp, #0x40]
 465fab4:      	ldr	x8, [sp, #0x50]
 465fab8:      	and	x1, x8, #0x7fffffffffffffff
 465fabc:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465fac0:      	cbnz	x21, 0x465f99c <_ChromeMain+0x465a700>
 465fac4:      	b	0x465f9a8 <_ChromeMain+0x465a70c>
 465fac8:      	ldr	x0, [sp, #0x40]
 465facc:      	ldr	x8, [sp, #0x50]
 465fad0:      	and	x1, x8, #0x7fffffffffffffff
 465fad4:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465fad8:      	cbnz	x21, 0x465fa0c <_ChromeMain+0x465a770>
 465fadc:      	b	0x465fa38 <_ChromeMain+0x465a79c>
 465fae0:      	cbnz	w8, 0x465f7c0 <_ChromeMain+0x465a524>
 465fae4:      	ldr	x8, [x20]
 465fae8:      	cbz	x8, 0x465f7c0 <_ChromeMain+0x465a524>
 465faec:      	strh	wzr, [x19, #0x532]
 465faf0:      	strb	wzr, [x19, #0x534]
 465faf4:      	mov	x0, x19
 465faf8:      	mov	w1, #0x16               ; =22
 465fafc:      	bl	0x465fbc0 <_ChromeMain+0x465a924>
 465fb00:      	movi.2d	v0, #0000000000000000
 465fb04:      	stp	q0, q0, [sp, #0x20]
 465fb08:      	ldrb	w8, [x23, #0x510]
 465fb0c:      	tbz	w8, #0x0, 0x465fbb4 <_ChromeMain+0x465a918>
 465fb10:      	add	x8, sp, #0x20
 465fb14:      	mov	x0, x20
 465fb18:      	bl	0x847b54 <_ChromeMain+0x8428b8>
 465fb1c:      	ldr	x0, [sp, #0x20]
 465fb20:      	mov	w8, #0xdd               ; =221
 465fb24:      	str	w8, [sp, #0x18]
 465fb28:      	strb	wzr, [sp, #0x1c]
 465fb2c:      	add	x8, sp, #0x40
 465fb30:      	add	x1, sp, #0x18
 465fb34:      	mov	w2, #0x16               ; =22
 465fb38:      	mov	x3, #0x0                ; =0
 465fb3c:      	bl	0xdf4920 <_ChromeMain+0xdef684>
 465fb40:      	ldr	x0, [x19, #0x508]
 465fb44:      	ldr	x8, [x0]
 465fb48:      	ldr	x8, [x8, #0xa0]
 465fb4c:      	mov	w1, #0x1                ; =1
 465fb50:      	blr	x8
 465fb54:      	ldr	x0, [x19, #0x510]
 465fb58:      	ldr	x8, [x0]
 465fb5c:      	ldr	x8, [x8, #0xa0]
 465fb60:      	mov	w1, #0x0                ; =0
 465fb64:      	blr	x8
 465fb68:      	ldr	x0, [x19, #0x508]
 465fb6c:      	add	x1, sp, #0x40
 465fb70:      	bl	0x5a10a0 <_ChromeMain+0x59be04>
 465fb74:      	add	x0, sp, #0x40
 465fb78:      	bl	0x846840 <_ChromeMain+0x8415a4>
 465fb7c:      	ldr	x0, [sp, #0x38]
 465fb80:      	and	x8, x0, #0xfffffffc00000000
 465fb84:      	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465fb88:      	ldr	x9, [x20, #0x88]
 465fb8c:      	cmp	x8, x9
 465fb90:      	b.eq	0x465fbb8 <_ChromeMain+0x465a91c>
 465fb94:      	str	xzr, [sp, #0x38]
 465fb98:      	ldr	x0, [sp, #0x20]
 465fb9c:      	and	x8, x0, #0xfffffffc00000000
 465fba0:      	ldr	x9, [x20, #0x88]
 465fba4:      	cmp	x8, x9
 465fba8:      	b.ne	0x465f87c <_ChromeMain+0x465a5e0>
 465fbac:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465fbb0:      	b	0x465f87c <_ChromeMain+0x465a5e0>
 465fbb4:      	brk	#0x1
 465fbb8:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465fbbc:      	b	0x465fb94 <_ChromeMain+0x465a8f8>
 465fbc0:      	sub	sp, sp, #0x40
 465fbc4:      	stp	x22, x21, [sp, #0x10]
 465fbc8:      	stp	x20, x19, [sp, #0x20]
 465fbcc:      	stp	x29, x30, [sp, #0x30]
 465fbd0:      	add	x29, sp, #0x30
 465fbd4:      	mov	x20, x1
 465fbd8:      	mov	x19, x0
 465fbdc:      	ldr	x0, [x0, #0x500]
 465fbe0:      	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 465fbe4:      	add	x1, x1, #0x10c
 465fbe8:      	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 465fbec:      	lsr	x8, x0, #32
 465fbf0:      	cmp	w20, w8
 465fbf4:      	ccmp	w20, w0, #0x0, eq
 465fbf8:      	b.eq	0x465fcdc <_ChromeMain+0x465aa40>
 465fbfc:      	ldr	x0, [x19, #0x500]
 465fc00:      	mov	w8, w20
 465fc04:      	orr	x21, x8, x8, lsl #32
 465fc08:      	mov	x1, x21
 465fc0c:      	mov	w2, #0x1                ; =1
 465fc10:      	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 465fc14:      	ldr	x22, [x19, #0x508]
 465fc18:      	add	x8, x22, #0x310
 465fc1c:      	ldrb	w9, [x22, #0x318]
 465fc20:      	cbnz	w9, 0x465fcf4 <_ChromeMain+0x465aa58>
 465fc24:      	cbz	x8, 0x465fcf0 <_ChromeMain+0x465aa54>
 465fc28:      	str	x21, [x22, #0x310]
 465fc2c:      	mov	w8, #0x1                ; =1
 465fc30:      	strb	w8, [x22, #0x318]
 465fc34:      	ldr	x0, [x22, #0x188]
 465fc38:      	cbz	x0, 0x465fc4c <_ChromeMain+0x465a9b0>
 465fc3c:      	ldr	x8, [x0]
 465fc40:      	ldr	x8, [x8, #0x2f8]
 465fc44:      	mov	x1, x22
 465fc48:      	blr	x8
 465fc4c:      	mov	x0, x22
 465fc50:      	mov	w1, #0x0                ; =0
 465fc54:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 465fc58:      	str	x22, [sp, #0x8]
 465fc5c:      	add	x0, x22, #0x130
