
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465e674:      	stp	x22, x21, [sp, #-0x30]!
 465e678:      	stp	x20, x19, [sp, #0x10]
 465e67c:      	stp	x29, x30, [sp, #0x20]
 465e680:      	add	x29, sp, #0x20
 465e684:      	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 465e688:      	ldr	x19, [x21, #0x848]
 465e68c:      	cbnz	x19, 0x465e754 <_ChromeMain+0x46594b8>
 465e690:      	mov	w0, #0x68               ; =104
 465e694:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465e698:      	mov	x19, x0
 465e69c:      	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 465e6a0:      	add	x1, x1, #0xb1e
 465e6a4:      	mov	w2, #0x45               ; =69
 465e6a8:      	mov	w3, #0x125c             ; =4700
 465e6ac:      	bl	0x527578 <_ChromeMain+0x5222dc>
 465e6b0:      	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 465e6b4:      	add	x8, x8, #0xed0
 465e6b8:      	adrp	x9, 0xdecb000 <dyld_stub_binder+0xdecb000>
 465e6bc:      	add	x9, x9, #0xfce
 465e6c0:      	stp	x8, x9, [x0]
 465e6c4:      	mov	w8, #0x1f               ; =31
 465e6c8:      	str	x8, [x0, #0x10]
 465e6cc:      	adrp	x22, 0xefae000 <dyld_stub_binder+0xefae000>
 465e6d0:      	ldr	x20, [x22, #0xed0]
 465e6d4:      	cbnz	x20, 0x465e714 <_ChromeMain+0x4659478>
 465e6d8:      	mov	w0, #0x68               ; =104
 465e6dc:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465e6e0:      	mov	x20, x0
 465e6e4:      	adrp	x1, 0xdd43000 <dyld_stub_binder+0xdd43000>
 465e6e8:      	add	x1, x1, #0x8d6
 465e6ec:      	mov	w2, #0x27               ; =39
 465e6f0:      	mov	w3, #0x33               ; =51
 465e6f4:      	bl	0x527578 <_ChromeMain+0x5222dc>
 465e6f8:      	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 465e6fc:      	add	x8, x8, #0x670
 465e700:      	str	x8, [x0]
 465e704:      	bl	0x33f67c0 <_ChromeMain+0x33f1524>
 465e708:      	mov	x0, x20
 465e70c:      	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 465e710:      	str	x20, [x22, #0xed0]
 465e714:      	and	x8, x20, #0xfffffffc00000000
 465e718:      	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465e71c:      	ldr	x9, [x22, #0x88]
 465e720:      	cmp	x8, x9
 465e724:      	b.ne	0x465e730 <_ChromeMain+0x4659494>
 465e728:      	mov	x0, x20
 465e72c:      	bl	0x142fc <_ChromeMain+0xf060>
 465e730:      	ldr	x0, [x19, #0x48]
 465e734:      	and	x8, x0, #0xfffffffc00000000
 465e738:      	ldr	x9, [x22, #0x88]
 465e73c:      	cmp	x8, x9
 465e740:      	b.eq	0x465e768 <_ChromeMain+0x46594cc>
 465e744:      	str	x20, [x19, #0x48]
 465e748:      	mov	x0, x19
 465e74c:      	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 465e750:      	str	x19, [x21, #0x848]
 465e754:      	mov	x0, x19
 465e758:      	ldp	x29, x30, [sp, #0x20]
 465e75c:      	ldp	x20, x19, [sp, #0x10]
 465e760:      	ldp	x22, x21, [sp], #0x30
 465e764:      	ret
 465e768:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465e76c:      	b	0x465e744 <_ChromeMain+0x46594a8>
 465e770:      	nop
 465e774:      	nop
 465e778:      	nop
 465e77c:      	nop
 465e780:      	sub	sp, sp, #0x30
 465e784:      	stp	x20, x19, [sp, #0x10]
 465e788:      	stp	x29, x30, [sp, #0x20]
 465e78c:      	add	x29, sp, #0x20
 465e790:      	add	x20, x0, #0x550
 465e794:      	ldrb	w8, [x0, #0x558]
 465e798:      	cbnz	w8, 0x465e808 <_ChromeMain+0x465956c>
 465e79c:      	mov	x19, x0
 465e7a0:      	ldr	x8, [x0, #0x560]
 465e7a4:      	add	x8, x8, #0x1
 465e7a8:      	str	x8, [x0, #0x560]
 465e7ac:      	strb	wzr, [sp]
 465e7b0:      	strb	wzr, [sp, #0x4]
 465e7b4:      	strb	wzr, [sp, #0x8]
 465e7b8:      	strb	wzr, [sp, #0xc]
 465e7bc:      	mov	x1, sp
 465e7c0:      	bl	0x3b295d8 <_ChromeMain+0x3b2433c>
 465e7c4:      	ldrb	w8, [x19, #0x53c]
 465e7c8:      	cbz	w8, 0x465e7dc <_ChromeMain+0x4659540>
 465e7cc:      	ldr	w8, [x19, #0x538]
 465e7d0:      	cmp	w8, w0
 465e7d4:      	csel	w8, w8, w0, lt
 465e7d8:      	bic	w0, w8, w8, asr #31
 465e7dc:      	mov	w8, w0
 465e7e0:      	orr	x0, x8, #0x2000000000
 465e7e4:      	ldrb	w8, [x19, #0x558]
 465e7e8:      	cbnz	w8, 0x465e800 <_ChromeMain+0x4659564>
 465e7ec:      	cbz	x20, 0x465e81c <_ChromeMain+0x4659580>
 465e7f0:      	str	x0, [x19, #0x550]
 465e7f4:      	mov	w8, #0x1                ; =1
 465e7f8:      	strb	w8, [x19, #0x558]
 465e7fc:      	b	0x465e80c <_ChromeMain+0x4659570>
 465e800:      	str	x0, [x20]
 465e804:      	b	0x465e80c <_ChromeMain+0x4659570>
 465e808:      	ldr	x0, [x20]
 465e80c:      	ldp	x29, x30, [sp, #0x20]
 465e810:      	ldp	x20, x19, [sp, #0x10]
 465e814:      	add	sp, sp, #0x30
 465e818:      	ret
 465e81c:      	brk	#0x1
 465e820:      	stp	x20, x19, [sp, #-0x20]!
 465e824:      	stp	x29, x30, [sp, #0x10]
 465e828:      	add	x29, sp, #0x10
 465e82c:      	mov	x19, x0
 465e830:      	ldrb	w8, [x0, #0x558]
 465e834:      	cbz	w8, 0x465e83c <_ChromeMain+0x46595a0>
 465e838:      	strb	wzr, [x19, #0x558]
 465e83c:      	ldr	x8, [x19]
 465e840:      	ldr	x8, [x8, #0x308]
 465e844:      	mov	x0, x19
 465e848:      	blr	x8
 465e84c:      	mov	x0, x19
 465e850:      	mov	w1, #0x0                ; =0
 465e854:      	ldp	x29, x30, [sp, #0x10]
 465e858:      	ldp	x20, x19, [sp], #0x20
 465e85c:      	b	0x630474 <_ChromeMain+0x62b1d8>
 465e860:      	stp	x20, x19, [sp, #-0x20]!
 465e864:      	stp	x29, x30, [sp, #0x10]
 465e868:      	add	x29, sp, #0x10
 465e86c:      	mov	x19, x0
 465e870:      	ldr	x8, [x1, #0x8]
 465e874:      	cmp	x8, x0
 465e878:      	b.eq	0x465e894 <_ChromeMain+0x46595f8>
 465e87c:      	ldr	x9, [x19, #0x500]
 465e880:      	cmp	x8, x9
 465e884:      	b.eq	0x465e894 <_ChromeMain+0x46595f8>
 465e888:      	ldp	x29, x30, [sp, #0x10]
 465e88c:      	ldp	x20, x19, [sp], #0x20
 465e890:      	ret
 465e894:      	ldrb	w8, [x19, #0x558]
 465e898:      	cbz	w8, 0x465e8a0 <_ChromeMain+0x4659604>
 465e89c:      	strb	wzr, [x19, #0x558]
 465e8a0:      	ldr	x8, [x19]
 465e8a4:      	ldr	x8, [x8, #0x308]
 465e8a8:      	mov	x0, x19
 465e8ac:      	blr	x8
 465e8b0:      	mov	x0, x19
 465e8b4:      	mov	w1, #0x0                ; =0
 465e8b8:      	ldp	x29, x30, [sp, #0x10]
 465e8bc:      	ldp	x20, x19, [sp], #0x20
 465e8c0:      	b	0x630474 <_ChromeMain+0x62b1d8>
 465e8c4:      	stp	x20, x19, [sp, #-0x20]!
 465e8c8:      	stp	x29, x30, [sp, #0x10]
 465e8cc:      	add	x29, sp, #0x10
 465e8d0:      	mov	x19, x0
 465e8d4:      	bl	0x465dab8 <_ChromeMain+0x465881c>
 465e8d8:      	mov	x0, x19
 465e8dc:      	ldp	x29, x30, [sp, #0x10]
 465e8e0:      	ldp	x20, x19, [sp], #0x20
 465e8e4:      	b	0x465f620 <_ChromeMain+0x465a384>
 465e8e8:      	sub	sp, sp, #0x30
 465e8ec:      	stp	x20, x19, [sp, #0x10]
 465e8f0:      	stp	x29, x30, [sp, #0x20]
 465e8f4:      	add	x29, sp, #0x20
 465e8f8:      	mov	x19, x0
 465e8fc:      	bl	0x465f620 <_ChromeMain+0x465a384>
 465e900:      	ldr	w8, [x19, #0x3bc]
 465e904:      	sub	w8, w8, #0x1
 465e908:      	cmp	w8, #0x1
 465e90c:      	b.ls	0x465e930 <_ChromeMain+0x4659694>
 465e910:      	mov	w0, #0x10               ; =16
 465e914:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465e918:      	mov	x1, x0
 465e91c:      	adrp	x8, 0xe34b000 <dyld_stub_binder+0xe34b000>
 465e920:      	add	x8, x8, #0xf00
 465e924:      	mov	x9, #0x100000000        ; =4294967296
 465e928:      	stp	x8, x9, [x0]
 465e92c:      	b	0x465e950 <_ChromeMain+0x46596b4>
 465e930:      	mov	w8, #0xf7               ; =247
 465e934:      	str	w8, [sp, #0x8]
 465e938:      	strb	wzr, [sp, #0xc]
 465e93c:      	add	x0, sp, #0x8
 465e940:      	fmov	s0, #8.00000000
 465e944:      	mov	w1, #0x0                ; =0
 465e948:      	bl	0x275f0c0 <_ChromeMain+0x2759e24>
 465e94c:      	mov	x1, x0
 465e950:      	mov	x0, x19
 465e954:      	bl	0xf27a00 <_ChromeMain+0xf22764>
 465e958:      	ldp	x29, x30, [sp, #0x20]
 465e95c:      	ldp	x20, x19, [sp, #0x10]
 465e960:      	add	sp, sp, #0x30
 465e964:      	ret
 465e968:      	sub	sp, sp, #0x30
 465e96c:      	stp	x20, x19, [sp, #0x10]
 465e970:      	stp	x29, x30, [sp, #0x20]
 465e974:      	add	x29, sp, #0x20
 465e978:      	mov	x19, x0
 465e97c:      	ldr	w8, [x0, #0x3bc]
 465e980:      	sub	w8, w8, #0x1
 465e984:      	cmp	w8, #0x1
 465e988:      	b.ls	0x465e9ac <_ChromeMain+0x4659710>
 465e98c:      	mov	w0, #0x10               ; =16
 465e990:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465e994:      	mov	x1, x0
 465e998:      	adrp	x8, 0xe34b000 <dyld_stub_binder+0xe34b000>
 465e99c:      	add	x8, x8, #0xf00
 465e9a0:      	mov	x9, #0x100000000        ; =4294967296
 465e9a4:      	stp	x8, x9, [x0]
 465e9a8:      	b	0x465e9cc <_ChromeMain+0x4659730>
 465e9ac:      	mov	w8, #0xf7               ; =247
 465e9b0:      	str	w8, [sp, #0x8]
 465e9b4:      	strb	wzr, [sp, #0xc]
 465e9b8:      	add	x0, sp, #0x8
 465e9bc:      	fmov	s0, #8.00000000
 465e9c0:      	mov	w1, #0x0                ; =0
 465e9c4:      	bl	0x275f0c0 <_ChromeMain+0x2759e24>
 465e9c8:      	mov	x1, x0
 465e9cc:      	mov	x0, x19
 465e9d0:      	bl	0xf27a00 <_ChromeMain+0xf22764>
 465e9d4:      	ldp	x29, x30, [sp, #0x20]
 465e9d8:      	ldp	x20, x19, [sp, #0x10]
 465e9dc:      	add	sp, sp, #0x30
 465e9e0:      	ret
