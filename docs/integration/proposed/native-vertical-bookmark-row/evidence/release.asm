
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4620830:      	sub	sp, sp, #0x50
 4620834:      	stp	x24, x23, [sp, #0x10]
 4620838:      	stp	x22, x21, [sp, #0x20]
 462083c:      	stp	x20, x19, [sp, #0x30]
 4620840:      	stp	x29, x30, [sp, #0x40]
 4620844:      	add	x29, sp, #0x40
 4620848:      	ldrb	w8, [x0, #0x444]
 462084c:      	cbz	w8, 0x4620920 <_ChromeMain+0x461b684>
 4620850:      	mov	x21, x1
 4620854:      	mov	x22, x0
 4620858:      	ldr	x19, [x0, #0x400]
 462085c:      	cbnz	x19, 0x4620978 <_ChromeMain+0x461b6dc>
 4620860:      	ldr	x20, [x22, #0x458]
 4620864:      	cbz	x20, 0x462087c <_ChromeMain+0x461b5e0>
 4620868:      	mov	w8, #0x1                ; =1
 462086c:      	ldadd	w8, w8, [x20]
 4620870:      	mov	w9, #0x7fffffff         ; =2147483647
 4620874:      	cmp	w8, w9
 4620878:      	b.eq	0x4620a90 <_ChromeMain+0x461b7f4>
 462087c:      	ldr	x24, [x22, #0x460]
 4620880:      	strb	wzr, [x22, #0x444]
 4620884:      	ldr	x8, [x22]
 4620888:      	ldr	x8, [x8, #0x68]
 462088c:      	mov	x0, x22
 4620890:      	blr	x8
 4620894:      	cbnz	x0, 0x4620998 <_ChromeMain+0x461b6fc>
 4620898:      	cbz	x20, 0x462091c <_ChromeMain+0x461b680>
 462089c:      	ldapurb	w8, [x20, #0x4]
 46208a0:      	cmp	w8, #0x0
 46208a4:      	ccmp	x24, #0x0, #0x4, eq
 46208a8:      	b.eq	0x462090c <_ChromeMain+0x461b670>
 46208ac:      	cbz	x19, 0x4620904 <_ChromeMain+0x461b668>
 46208b0:      	mov	w8, #0x1                ; =1
 46208b4:      	ldadd	w8, w8, [x19]
 46208b8:      	cmp	w8, #0x0
 46208bc:      	b.le	0x4620a9c <_ChromeMain+0x461b800>
 46208c0:      	mov	w9, #0x7fffffff         ; =2147483647
 46208c4:      	cmp	w8, w9
 46208c8:      	b.eq	0x4620aa8 <_ChromeMain+0x461b80c>
 46208cc:      	ldr	x8, [x19, #0x8]
 46208d0:      	mov	x0, x19
 46208d4:      	mov	x1, x22
 46208d8:      	mov	x2, x21
 46208dc:      	blr	x8
 46208e0:      	mov	x23, x0
 46208e4:      	mov	w8, #-0x1               ; =-1
 46208e8:      	ldaddal	w8, w8, [x19]
 46208ec:      	cmp	w8, #0x1
 46208f0:      	b.ne	0x4620900 <_ChromeMain+0x461b664>
 46208f4:      	ldr	x8, [x19, #0x10]
 46208f8:      	mov	x0, x19
 46208fc:      	blr	x8
 4620900:      	tbnz	w23, #0x0, 0x462090c <_ChromeMain+0x461b670>
 4620904:      	ldapurb	w8, [x20, #0x4]
 4620908:      	cbz	w8, 0x46209b0 <_ChromeMain+0x461b714>
 462090c:      	mov	w8, #-0x1               ; =-1
 4620910:      	ldaddal	w8, w8, [x20]
 4620914:      	cmp	w8, #0x1
 4620918:      	b.eq	0x4620938 <_ChromeMain+0x461b69c>
 462091c:      	cbnz	x19, 0x4620948 <_ChromeMain+0x461b6ac>
 4620920:      	ldp	x29, x30, [sp, #0x40]
 4620924:      	ldp	x20, x19, [sp, #0x30]
 4620928:      	ldp	x22, x21, [sp, #0x20]
 462092c:      	ldp	x24, x23, [sp, #0x10]
 4620930:      	add	sp, sp, #0x50
 4620934:      	ret
 4620938:      	mov	x0, x20
 462093c:      	mov	w1, #0x8                ; =8
 4620940:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4620944:      	cbz	x19, 0x4620920 <_ChromeMain+0x461b684>
 4620948:      	mov	w8, #-0x1               ; =-1
 462094c:      	ldaddal	w8, w8, [x19]
 4620950:      	cmp	w8, #0x1
 4620954:      	b.ne	0x4620920 <_ChromeMain+0x461b684>
 4620958:      	ldr	x1, [x19, #0x10]
 462095c:      	mov	x0, x19
 4620960:      	ldp	x29, x30, [sp, #0x40]
 4620964:      	ldp	x20, x19, [sp, #0x30]
 4620968:      	ldp	x22, x21, [sp, #0x20]
 462096c:      	ldp	x24, x23, [sp, #0x10]
 4620970:      	add	sp, sp, #0x50
 4620974:      	br	x1
 4620978:      	mov	w8, #0x1                ; =1
 462097c:      	ldadd	w8, w8, [x19]
 4620980:      	cmp	w8, #0x0
 4620984:      	b.le	0x4620ab4 <_ChromeMain+0x461b818>
 4620988:      	mov	w9, #0x7fffffff         ; =2147483647
 462098c:      	cmp	w8, w9
 4620990:      	b.eq	0x4620ac0 <_ChromeMain+0x461b824>
 4620994:      	b	0x4620860 <_ChromeMain+0x461b5c4>
 4620998:      	mov	x23, x0
 462099c:      	bl	0xa6e3b9c <_ChromeMain+0xa6de900>
 46209a0:      	cbz	w0, 0x4620898 <_ChromeMain+0x461b5fc>
 46209a4:      	mov	x0, x23
 46209a8:      	bl	0xa6e3b00 <_ChromeMain+0xa6de864>
 46209ac:      	b	0x4620898 <_ChromeMain+0x461b5fc>
 46209b0:      	ldp	s0, s1, [x21, #0x88]
 46209b4:      	frintm	s0, s0
 46209b8:      	movi.2s	v2, #0xcf, lsl #24
 46209bc:      	fcmp	s0, s2
 46209c0:      	mov	w8, #0x7fffffff         ; =2147483647
 46209c4:      	csel	w9, wzr, w8, lt
 46209c8:      	fmaxnm	s3, s0, s2
 46209cc:      	fcvtzs	w10, s3
 46209d0:      	mov	w11, #0x4effffff        ; =1325400063
 46209d4:      	fmov	s3, w11
 46209d8:      	fcmp	s0, s3
 46209dc:      	csel	w9, w10, w9, ls
 46209e0:      	frintm	s0, s1
 46209e4:      	fcmp	s0, s2
 46209e8:      	csel	w8, wzr, w8, lt
 46209ec:      	fmaxnm	s1, s0, s2
 46209f0:      	fcvtzs	w10, s1
 46209f4:      	fcmp	s0, s3
 46209f8:      	csel	w8, w10, w8, ls
 46209fc:      	orr	x8, x9, x8, lsl #32
 4620a00:      	str	x8, [sp, #0x8]
 4620a04:      	add	x1, sp, #0x8
 4620a08:      	mov	x0, x22
 4620a0c:      	bl	0xa6dadec <_ChromeMain+0xa6d5b50>
 4620a10:      	cbz	w0, 0x462090c <_ChromeMain+0x461b670>
 4620a14:      	ldr	w8, [x21, #0x50]
 4620a18:      	and	w8, w8, #0xf800
 4620a1c:      	ldr	x1, [x22, #0x3e0]
 4620a20:      	cmp	w8, #0x800
 4620a24:      	b.eq	0x4620a38 <_ChromeMain+0x461b79c>
 4620a28:      	cmp	w8, #0x1, lsl #12       ; =0x1000
 4620a2c:      	b.ne	0x462090c <_ChromeMain+0x461b670>
 4620a30:      	ldr	w8, [x1, #0xf8]
 4620a34:      	cbnz	w8, 0x462090c <_ChromeMain+0x461b670>
 4620a38:      	ldr	x23, [x22, #0x410]
 4620a3c:      	cbz	x23, 0x4620acc <_ChromeMain+0x461b830>
 4620a40:      	mov	w8, #0x1                ; =1
 4620a44:      	ldadd	w8, w8, [x23]
 4620a48:      	cmp	w8, #0x0
 4620a4c:      	b.le	0x4620ad8 <_ChromeMain+0x461b83c>
 4620a50:      	mov	w9, #0x7fffffff         ; =2147483647
 4620a54:      	cmp	w8, w9
 4620a58:      	b.eq	0x4620ae4 <_ChromeMain+0x461b848>
 4620a5c:      	ldr	x8, [x22, #0x410]
 4620a60:      	ldr	x8, [x8, #0x8]
 4620a64:      	mov	x0, x23
 4620a68:      	mov	x2, x21
 4620a6c:      	blr	x8
 4620a70:      	mov	w8, #-0x1               ; =-1
 4620a74:      	ldaddal	w8, w8, [x23]
 4620a78:      	cmp	w8, #0x1
 4620a7c:      	b.ne	0x462090c <_ChromeMain+0x461b670>
 4620a80:      	ldr	x8, [x23, #0x10]
 4620a84:      	mov	x0, x23
 4620a88:      	blr	x8
 4620a8c:      	b	0x462090c <_ChromeMain+0x461b670>
 4620a90:      	brk	#0
 4620a94:      	hlt	#0
 4620a98:      	brk	#0x1
 4620a9c:      	brk	#0
 4620aa0:      	hlt	#0
 4620aa4:      	brk	#0x1
 4620aa8:      	brk	#0
 4620aac:      	hlt	#0
 4620ab0:      	brk	#0x1
 4620ab4:      	brk	#0
 4620ab8:      	hlt	#0
 4620abc:      	brk	#0x1
 4620ac0:      	brk	#0
 4620ac4:      	hlt	#0
 4620ac8:      	brk	#0x1
 4620acc:      	brk	#0
 4620ad0:      	hlt	#0
 4620ad4:      	brk	#0x1
 4620ad8:      	brk	#0
 4620adc:      	hlt	#0
 4620ae0:      	brk	#0x1
 4620ae4:      	brk	#0
 4620ae8:      	hlt	#0
 4620aec:      	brk	#0x1
