
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4557788:      	sub	sp, sp, #0xb0
 455778c:      	stp	x24, x23, [sp, #0x70]
 4557790:      	stp	x22, x21, [sp, #0x80]
 4557794:      	stp	x20, x19, [sp, #0x90]
 4557798:      	stp	x29, x30, [sp, #0xa0]
 455779c:      	add	x29, sp, #0xa0
 45577a0:      	cbz	x1, 0x45579b0 <_ChromeMain+0x4552714>
 45577a4:      	mov	w8, #0x1                ; =1
 45577a8:      	str	x8, [sp, #0x38]
 45577ac:      	cbz	x0, 0x45579b0 <_ChromeMain+0x4552714>
 45577b0:      	mov	x19, x1
 45577b4:      	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 45577b8:      	add	x1, x1, #0x9a8
 45577bc:      	add	x0, x0, #0x8
 45577c0:      	bl	0x53170 <_ChromeMain+0x4ded4>
 45577c4:      	cbz	x0, 0x45579b0 <_ChromeMain+0x4552714>
 45577c8:      	mov	x8, x0
 45577cc:      	add	x9, sp, #0x50
 45577d0:      	add	x20, x9, #0x8
 45577d4:      	stp	xzr, xzr, [sp, #0x58]
 45577d8:      	str	xzr, [sp, #0x68]
 45577dc:      	ldr	x0, [x0, #0x8]
 45577e0:      	str	x0, [sp, #0x50]
 45577e4:      	add	x9, x8, #0x10
 45577e8:      	cmp	x20, x9
 45577ec:      	b.eq	0x4557808 <_ChromeMain+0x455256c>
 45577f0:      	ldrsb	w10, [x8, #0x27]
 45577f4:      	tbnz	w10, #0x1f, 0x45579d4 <_ChromeMain+0x4552738>
 45577f8:      	ldr	q0, [x9]
 45577fc:      	ldr	x8, [x9, #0x10]
 4557800:      	str	x8, [x20, #0x10]
 4557804:      	str	q0, [x20]
 4557808:      	str	x0, [sp, #0x18]
 455780c:      	ldr	x8, [x20, #0x10]
 4557810:      	str	x8, [sp, #0x30]
 4557814:      	ldr	q0, [x20]
 4557818:      	stur	q0, [sp, #0x20]
 455781c:      	lsr	x8, x8, #56
 4557820:      	sxtb	w23, w8
 4557824:      	ldr	x20, [sp, #0x28]
 4557828:      	cmp	w23, #0x0
 455782c:      	csel	x21, x20, x8, mi
 4557830:      	cbz	x21, 0x45579c8 <_ChromeMain+0x455272c>
 4557834:      	add	x8, sp, #0x50
 4557838:      	bl	0x190d6a4 <_ChromeMain+0x1908408>
 455783c:      	mov	w0, #0x30               ; =48
 4557840:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4557844:      	str	x0, [sp]
 4557848:      	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 455784c:      	ldr	q0, [x8, #0xb90]
 4557850:      	stur	q0, [sp, #0x8]
 4557854:      	add	x9, x0, #0x23
 4557858:      	cmp	x9, x0
 455785c:      	b.lo	0x4557a58 <_ChromeMain+0x45527bc>
 4557860:      	adrp	x8, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4557864:      	add	x8, x8, #0x7ac
 4557868:      	cmp	x9, x8
 455786c:      	ccmp	x0, x8, #0x2, hi
 4557870:      	b.ls	0x4557a58 <_ChromeMain+0x45527bc>
 4557874:      	mov	w9, #0x5f65             ; =24421
 4557878:      	movk	w9, #0x6469, lsl #16
 455787c:      	stur	w9, [x0, #0x1f]
 4557880:      	ldp	q0, q1, [x8]
 4557884:      	stp	q0, q1, [x0]
 4557888:      	strb	wzr, [x0, #0x23]
 455788c:      	mov	x8, sp
 4557890:      	str	x8, [sp, #0x48]
 4557894:      	adrp	x2, 0xcbd8000 <dyld_stub_binder+0xcbd8000>
 4557898:      	add	x2, x2, #0xe48
 455789c:      	add	x3, sp, #0x48
 45578a0:      	add	x4, sp, #0x47
 45578a4:      	mov	x0, x19
 45578a8:      	mov	x1, x19
 45578ac:      	bl	0x224600c <_ChromeMain+0x2240d70>
 45578b0:      	mov	x22, x0
 45578b4:      	ldrsb	w8, [x0, #0x4f]
 45578b8:      	tbnz	w8, #0x1f, 0x4557a24 <_ChromeMain+0x4552788>
 45578bc:      	ldr	q0, [sp, #0x50]
 45578c0:      	ldr	x8, [sp, #0x60]
 45578c4:      	stur	x8, [x22, #0x48]
 45578c8:      	stur	q0, [x22, #0x38]
 45578cc:      	strb	wzr, [sp, #0x67]
 45578d0:      	strb	wzr, [sp, #0x50]
 45578d4:      	ldrsb	w8, [sp, #0x17]
 45578d8:      	tbnz	w8, #0x1f, 0x45579f8 <_ChromeMain+0x455275c>
 45578dc:      	mov	w0, #0x30               ; =48
 45578e0:      	bl	0xf368 <_ChromeMain+0xa0cc>
 45578e4:      	str	x0, [sp, #0x50]
 45578e8:      	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 45578ec:      	ldr	q0, [x8, #0x3e0]
 45578f0:      	stur	q0, [sp, #0x58]
 45578f4:      	add	x9, x0, #0x20
 45578f8:      	cmp	x9, x0
 45578fc:      	b.lo	0x4557a58 <_ChromeMain+0x45527bc>
 4557900:      	adrp	x8, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4557904:      	add	x8, x8, #0x7d0
 4557908:      	cmp	x9, x8
 455790c:      	ccmp	x0, x8, #0x2, hi
 4557910:      	b.ls	0x4557a58 <_ChromeMain+0x45527bc>
 4557914:      	add	x9, sp, #0x18
 4557918:      	add	x22, x9, #0x8
 455791c:      	ldp	q0, q1, [x8]
 4557920:      	stp	q0, q1, [x0]
 4557924:      	strb	wzr, [x0, #0x20]
 4557928:      	add	x8, sp, #0x50
 455792c:      	str	x8, [sp]
 4557930:      	adrp	x2, 0xcbd8000 <dyld_stub_binder+0xcbd8000>
 4557934:      	add	x2, x2, #0xe48
 4557938:      	mov	x3, sp
 455793c:      	add	x4, sp, #0x48
 4557940:      	mov	x0, x19
 4557944:      	mov	x1, x19
 4557948:      	bl	0x224600c <_ChromeMain+0x2240d70>
 455794c:      	mov	x8, x0
 4557950:      	add	x0, x0, #0x38
 4557954:      	cmp	x0, x22
 4557958:      	b.eq	0x4557978 <_ChromeMain+0x45526dc>
 455795c:      	ldrsb	w8, [x8, #0x4f]
 4557960:      	tbnz	w8, #0x1f, 0x4557a40 <_ChromeMain+0x45527a4>
 4557964:      	tbnz	w23, #0x1f, 0x45579e8 <_ChromeMain+0x455274c>
 4557968:      	ldr	q0, [x22]
 455796c:      	ldr	x8, [x22, #0x10]
 4557970:      	str	x8, [x0, #0x10]
 4557974:      	str	q0, [x0]
 4557978:      	ldrsb	w8, [sp, #0x67]
 455797c:      	tbz	w8, #0x1f, 0x4557990 <_ChromeMain+0x45526f4>
 4557980:      	ldr	x0, [sp, #0x50]
 4557984:      	ldr	x8, [sp, #0x60]
 4557988:      	and	x1, x8, #0x7fffffffffffffff
 455798c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4557990:      	ldrb	w8, [sp, #0x38]
 4557994:      	ldrb	w23, [sp, #0x37]
 4557998:      	tbz	w8, #0x0, 0x45579b0 <_ChromeMain+0x4552714>
 455799c:      	tbz	w23, #0x7, 0x45579b0 <_ChromeMain+0x4552714>
 45579a0:      	ldr	x0, [sp, #0x20]
 45579a4:      	ldr	x8, [sp, #0x30]
 45579a8:      	and	x1, x8, #0x7fffffffffffffff
 45579ac:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45579b0:      	ldp	x29, x30, [sp, #0xa0]
 45579b4:      	ldp	x20, x19, [sp, #0x90]
 45579b8:      	ldp	x22, x21, [sp, #0x80]
 45579bc:      	ldp	x24, x23, [sp, #0x70]
 45579c0:      	add	sp, sp, #0xb0
 45579c4:      	ret
 45579c8:      	mov	w8, #0x1                ; =1
 45579cc:      	tbnz	w8, #0x0, 0x455799c <_ChromeMain+0x4552700>
 45579d0:      	b	0x45579b0 <_ChromeMain+0x4552714>
 45579d4:      	ldp	x1, x2, [x8, #0x10]
 45579d8:      	mov	x0, x20
 45579dc:      	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 45579e0:      	ldr	x0, [sp, #0x50]
 45579e4:      	b	0x4557808 <_ChromeMain+0x455256c>
 45579e8:      	ldr	x1, [sp, #0x20]
 45579ec:      	mov	x2, x20
 45579f0:      	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 45579f4:      	b	0x4557978 <_ChromeMain+0x45526dc>
 45579f8:      	ldr	x0, [sp]
 45579fc:      	ldr	x8, [sp, #0x10]
 4557a00:      	and	x1, x8, #0x7fffffffffffffff
 4557a04:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4557a08:      	ldrsb	w8, [sp, #0x67]
 4557a0c:      	tbz	w8, #0x1f, 0x45578dc <_ChromeMain+0x4552640>
 4557a10:      	ldr	x0, [sp, #0x50]
 4557a14:      	ldr	x8, [sp, #0x60]
 4557a18:      	and	x1, x8, #0x7fffffffffffffff
 4557a1c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4557a20:      	b	0x45578dc <_ChromeMain+0x4552640>
 4557a24:      	ldr	x0, [x22, #0x38]
 4557a28:      	ldr	x8, [x22, #0x48]
 4557a2c:      	and	x1, x8, #0x7fffffffffffffff
 4557a30:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4557a34:      	stp	xzr, xzr, [x22, #0x38]
 4557a38:      	stur	xzr, [x22, #0x48]
 4557a3c:      	b	0x45578bc <_ChromeMain+0x4552620>
 4557a40:      	ldr	x8, [sp, #0x20]
 4557a44:      	cmp	w23, #0x0
 4557a48:      	csel	x1, x8, x22, mi
 4557a4c:      	mov	x2, x21
 4557a50:      	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4557a54:      	b	0x4557978 <_ChromeMain+0x45526dc>
 4557a58:      	brk	#0x1
