
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46227a0:      	sub	sp, sp, #0xb0
 46227a4:      	stp	x24, x23, [sp, #0x70]
 46227a8:      	stp	x22, x21, [sp, #0x80]
 46227ac:      	stp	x20, x19, [sp, #0x90]
 46227b0:      	stp	x29, x30, [sp, #0xa0]
 46227b4:      	add	x29, sp, #0xa0
 46227b8:      	ldr	x8, [x0, #0x20]
 46227bc:      	cbnz	x8, 0x46227d8 <_ChromeMain+0x461d53c>
 46227c0:      	ldp	x29, x30, [sp, #0xa0]
 46227c4:      	ldp	x20, x19, [sp, #0x90]
 46227c8:      	ldp	x22, x21, [sp, #0x80]
 46227cc:      	ldp	x24, x23, [sp, #0x70]
 46227d0:      	add	sp, sp, #0xb0
 46227d4:      	ret
 46227d8:      	mov	x19, x0
 46227dc:      	ldr	x8, [x0, #0x1c0]
 46227e0:      	ldrb	w9, [x0, #0x440]
 46227e4:      	tbnz	w9, #0x0, 0x46227f0 <_ChromeMain+0x461d554>
 46227e8:      	ldrb	w9, [x19, #0x448]
 46227ec:      	cbz	w9, 0x46228cc <_ChromeMain+0x461d630>
 46227f0:      	scvtf	s0, w8
 46227f4:      	lsr	x8, x8, #32
 46227f8:      	scvtf	s1, w8
 46227fc:      	str	xzr, [sp, #0x10]
 4622800:      	stp	s0, s1, [sp, #0x18]
 4622804:      	movi.2d	v0, #0000000000000000
 4622808:      	stp	q0, q0, [sp, #0x20]
 462280c:      	str	q0, [sp, #0x40]
 4622810:      	str	wzr, [sp, #0x50]
 4622814:      	add	x0, sp, #0x20
 4622818:      	add	x1, sp, #0x10
 462281c:      	fmov	s0, #10.00000000
 4622820:      	fmov	s1, #10.00000000
 4622824:      	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 4622828:      	sub	x8, x29, #0x40
 462282c:      	add	x0, sp, #0x20
 4622830:      	mov	w1, #0x0                ; =0
 4622834:      	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 4622838:      	add	x0, x19, #0x1d8
 462283c:      	sub	x1, x29, #0x40
 4622840:      	bl	0x1082920 <_ChromeMain+0x107d684>
 4622844:      	ldr	x8, [x19, #0x20]
 4622848:      	cbnz	x8, 0x46229d4 <_ChromeMain+0x461d738>
 462284c:      	ldur	x0, [x29, #-0x40]
 4622850:      	cbz	x0, 0x4622864 <_ChromeMain+0x461d5c8>
 4622854:      	mov	w8, #-0x1               ; =-1
 4622858:      	ldaddal	w8, w8, [x0]
 462285c:      	cmp	w8, #0x1
 4622860:      	b.eq	0x46228ac <_ChromeMain+0x461d610>
 4622864:      	ldr	x0, [x19, #0x20]
 4622868:      	str	wzr, [x0, #0xa8]
 462286c:      	bl	0xa243478 <_ChromeMain+0xa23e1dc>
 4622870:      	ldr	x8, [x19, #0x20]
 4622874:      	ldr	s0, [x8, #0x170]
 4622878:      	movi.2d	v1, #0000000000000000
 462287c:      	fdiv	s0, s1, s0
 4622880:      	str	s0, [x8, #0x180]
 4622884:      	ldr	x0, [x8, #0x168]
 4622888:      	bl	0x979c068 <_ChromeMain+0x9796dcc>
 462288c:      	ldr	x19, [x19, #0x20]
 4622890:      	fmov.4s	v0, #10.00000000
 4622894:      	str	q0, [sp, #0x20]
 4622898:      	ldr	x0, [x19, #0x160]
 462289c:      	cbz	x0, 0x4622af0 <_ChromeMain+0x461d854>
 46228a0:      	add	x1, sp, #0x20
 46228a4:      	bl	0x2359bcc <_ChromeMain+0x2354930>
 46228a8:      	b	0x46227c0 <_ChromeMain+0x461d524>
 46228ac:      	ldrsw	x8, [x0, #0x28]
 46228b0:      	cbnz	w8, 0x4622b2c <_ChromeMain+0x461d890>
 46228b4:      	ldrb	w8, [x0, #0x2c]
 46228b8:      	tbnz	w8, #0x0, 0x4622b7c <_ChromeMain+0x461d8e0>
 46228bc:      	ldr	x20, [x0, #0x10]
 46228c0:      	cbnz	x20, 0x4622b94 <_ChromeMain+0x461d8f8>
 46228c4:      	bl	0x14668 <_ChromeMain+0xf3cc>
 46228c8:      	b	0x4622864 <_ChromeMain+0x461d5c8>
 46228cc:      	stur	xzr, [x29, #-0x40]
 46228d0:      	dup.2d	v0, x8
 46228d4:      	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 46228d8:      	ldr	q1, [x8, #0x40]
 46228dc:      	ushl.2d	v0, v0, v1
 46228e0:      	xtn.2s	v0, v0
 46228e4:      	movi.2d	v1, #0000000000000000
 46228e8:      	smax.2s	v0, v0, v1
 46228ec:      	ucvtf.2s	v0, v0
 46228f0:      	stur	d0, [x29, #-0x38]
 46228f4:      	movi.4s	v0, #0x80, lsl #24
 46228f8:      	str	q0, [sp, #0x20]
 46228fc:      	sub	x0, x29, #0x40
 4622900:      	add	x1, sp, #0x20
 4622904:      	bl	0x1c100 <_ChromeMain+0x16e64>
 4622908:      	sub	x0, x29, #0x40
 462290c:      	bl	0x174a474 <_ChromeMain+0x17451d8>
 4622910:      	stp	s0, s1, [sp, #0x10]
 4622914:      	stp	s2, s3, [sp, #0x18]
 4622918:      	movi.2d	v0, #0000000000000000
 462291c:      	stp	q0, q0, [sp, #0x20]
 4622920:      	str	q0, [sp, #0x40]
 4622924:      	str	wzr, [sp, #0x50]
 4622928:      	add	x0, sp, #0x20
 462292c:      	add	x1, sp, #0x10
 4622930:      	fmov	s0, #10.00000000
 4622934:      	fmov	s1, #10.00000000
 4622938:      	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 462293c:      	mov	x8, sp
 4622940:      	add	x0, sp, #0x20
 4622944:      	mov	w1, #0x0                ; =0
 4622948:      	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 462294c:      	add	x0, x19, #0x1d8
 4622950:      	mov	x1, sp
 4622954:      	bl	0x1082920 <_ChromeMain+0x107d684>
 4622958:      	ldr	x8, [x19, #0x20]
 462295c:      	cbnz	x8, 0x4622a14 <_ChromeMain+0x461d778>
 4622960:      	ldr	x0, [sp]
 4622964:      	cbz	x0, 0x4622978 <_ChromeMain+0x461d6dc>
 4622968:      	mov	w8, #-0x1               ; =-1
 462296c:      	ldaddal	w8, w8, [x0]
 4622970:      	cmp	w8, #0x1
 4622974:      	b.eq	0x46229b4 <_ChromeMain+0x461d718>
 4622978:      	ldr	x0, [x19, #0x20]
 462297c:      	str	wzr, [x0, #0xa8]
 4622980:      	bl	0xa243478 <_ChromeMain+0xa23e1dc>
 4622984:      	ldr	x8, [x19, #0x20]
 4622988:      	ldr	s0, [x8, #0x170]
 462298c:      	movi.2d	v1, #0000000000000000
 4622990:      	fdiv	s0, s1, s0
 4622994:      	str	s0, [x8, #0x180]
 4622998:      	ldr	x0, [x8, #0x168]
 462299c:      	bl	0x979c068 <_ChromeMain+0x9796dcc>
 46229a0:      	ldr	x19, [x19, #0x20]
 46229a4:      	stp	xzr, xzr, [sp, #0x20]
 46229a8:      	ldr	x0, [x19, #0x160]
 46229ac:      	cbz	x0, 0x4622ac4 <_ChromeMain+0x461d828>
 46229b0:      	b	0x46228a0 <_ChromeMain+0x461d604>
 46229b4:      	ldrsw	x8, [x0, #0x28]
 46229b8:      	cbnz	w8, 0x4622bb8 <_ChromeMain+0x461d91c>
 46229bc:      	ldrb	w8, [x0, #0x2c]
 46229c0:      	tbnz	w8, #0x0, 0x4622c08 <_ChromeMain+0x461d96c>
 46229c4:      	ldr	x20, [x0, #0x10]
 46229c8:      	cbnz	x20, 0x4622c20 <_ChromeMain+0x461d984>
 46229cc:      	bl	0x14668 <_ChromeMain+0xf3cc>
 46229d0:      	b	0x4622978 <_ChromeMain+0x461d6dc>
 46229d4:      	mov	w0, #0x350              ; =848
 46229d8:      	bl	0xf368 <_ChromeMain+0xa0cc>
 46229dc:      	add	x1, x19, #0x1d8
 46229e0:      	mov	x2, x19
 46229e4:      	bl	0x254523c <_ChromeMain+0x253ffa0>
 46229e8:      	ldr	x8, [x19, #0x278]
 46229ec:      	str	x0, [x19, #0x278]
 46229f0:      	cbz	x8, 0x4622a00 <_ChromeMain+0x461d764>
 46229f4:      	mov	x0, x8
 46229f8:      	bl	0x25450cc <_ChromeMain+0x253fe30>
 46229fc:      	ldr	x0, [x19, #0x278]
 4622a00:      	ldr	x8, [x19, #0x20]
 4622a04:      	add	x1, x0, #0x30
 4622a08:      	mov	x0, x8
 4622a0c:      	bl	0x2544f78 <_ChromeMain+0x253fcdc>
 4622a10:      	b	0x462284c <_ChromeMain+0x461d5b0>
 4622a14:      	mov	w0, #0x350              ; =848
 4622a18:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4622a1c:      	add	x1, x19, #0x1d8
 4622a20:      	mov	x2, x19
 4622a24:      	bl	0x254523c <_ChromeMain+0x253ffa0>
 4622a28:      	ldr	x8, [x19, #0x278]
 4622a2c:      	str	x0, [x19, #0x278]
 4622a30:      	cbz	x8, 0x4622a40 <_ChromeMain+0x461d7a4>
 4622a34:      	mov	x0, x8
 4622a38:      	bl	0x25450cc <_ChromeMain+0x253fe30>
 4622a3c:      	ldr	x0, [x19, #0x278]
 4622a40:      	ldr	x8, [x19, #0x20]
 4622a44:      	add	x1, x0, #0x30
 4622a48:      	mov	x0, x8
 4622a4c:      	bl	0x2544f78 <_ChromeMain+0x253fcdc>
 4622a50:      	b	0x4622960 <_ChromeMain+0x461d6c4>
 4622a54:      	ldr	x8, [x0]
 4622a58:      	ldr	x8, [x8, #0x10]
 4622a5c:      	blr	x8
 4622a60:      	add	x21, x21, #0x8
 4622a64:      	cmp	x21, x22
 4622a68:      	mov	x0, x20
 4622a6c:      	b.hs	0x46228b4 <_ChromeMain+0x461d618>
 4622a70:      	ldr	x0, [x21]
 4622a74:      	cbz	x0, 0x4622a60 <_ChromeMain+0x461d7c4>
 4622a78:      	add	x8, x0, #0x8
 4622a7c:      	ldaddal	w23, w8, [x8]
 4622a80:      	cmp	w8, #0x1
 4622a84:      	b.ne	0x4622a60 <_ChromeMain+0x461d7c4>
 4622a88:      	b	0x4622a54 <_ChromeMain+0x461d7b8>
 4622a8c:      	ldr	x8, [x0]
 4622a90:      	ldr	x8, [x8, #0x10]
 4622a94:      	blr	x8
 4622a98:      	add	x21, x21, #0x8
 4622a9c:      	cmp	x21, x22
 4622aa0:      	mov	x0, x20
 4622aa4:      	b.hs	0x46229bc <_ChromeMain+0x461d720>
 4622aa8:      	ldr	x0, [x21]
 4622aac:      	cbz	x0, 0x4622a98 <_ChromeMain+0x461d7fc>
 4622ab0:      	add	x8, x0, #0x8
 4622ab4:      	ldaddal	w23, w8, [x8]
 4622ab8:      	cmp	w8, #0x1
 4622abc:      	b.ne	0x4622a98 <_ChromeMain+0x461d7fc>
 4622ac0:      	b	0x4622a8c <_ChromeMain+0x461d7f0>
 4622ac4:      	mov	w0, #0x120              ; =288
 4622ac8:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4622acc:      	mov	x20, x0
 4622ad0:      	mov	x1, #0x0                ; =0
 4622ad4:      	bl	0x107a2d8 <_ChromeMain+0x107503c>
 4622ad8:      	cbz	x0, 0x4622b18 <_ChromeMain+0x461d87c>
 4622adc:      	ldr	w8, [x20, #0x8]
 4622ae0:      	adds	w8, w8, #0x1
 4622ae4:      	str	w8, [x20, #0x8]
 4622ae8:      	b.hs	0x4622c50 <_ChromeMain+0x461d9b4>
 4622aec:      	b	0x4622b18 <_ChromeMain+0x461d87c>
 4622af0:      	mov	w0, #0x120              ; =288
 4622af4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4622af8:      	mov	x20, x0
 4622afc:      	mov	x1, #0x0                ; =0
 4622b00:      	bl	0x107a2d8 <_ChromeMain+0x107503c>
 4622b04:      	cbz	x0, 0x4622b18 <_ChromeMain+0x461d87c>
 4622b08:      	ldr	w8, [x20, #0x8]
 4622b0c:      	adds	w8, w8, #0x1
