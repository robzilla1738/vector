
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4634874:      	sub	sp, sp, #0x60
 4634878:      	stp	x26, x25, [sp, #0x10]
 463487c:      	stp	x24, x23, [sp, #0x20]
 4634880:      	stp	x22, x21, [sp, #0x30]
 4634884:      	stp	x20, x19, [sp, #0x40]
 4634888:      	stp	x29, x30, [sp, #0x50]
 463488c:      	add	x29, sp, #0x50
 4634890:      	ldr	x8, [x0, #0x6b8]
 4634894:      	cbnz	x8, 0x4634cf4 <_ChromeMain+0x462fa58>
 4634898:      	mov	x19, x0
 463489c:      	adrp	x24, 0xef0a000 <dyld_stub_binder+0xef0a000>
 46348a0:      	add	x24, x24, #0x480
 46348a4:      	ldapr	x0, [x24]
 46348a8:      	cbz	x0, 0x4634d60 <_ChromeMain+0x462fac4>
 46348ac:      	mov	w1, #0x3f0              ; =1008
 46348b0:      	mov	x2, #0x0                ; =0
 46348b4:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 46348b8:      	mov	x20, x0
 46348bc:      	bl	0x136f140 <_ChromeMain+0x1369ea4>
 46348c0:      	add	x26, x0, #0x310
 46348c4:      	adrp	x8, 0xe723000 <dyld_stub_binder+0xe723000>
 46348c8:      	add	x8, x8, #0x8d0
 46348cc:      	add	x9, x8, #0x400
 46348d0:      	stp	x8, x9, [x0]
 46348d4:      	add	x9, x8, #0x428
 46348d8:      	str	x9, [x0, #0x10]
 46348dc:      	add	x9, x8, #0x460
 46348e0:      	add	x10, x8, #0x540
 46348e4:      	mov	x21, x0
 46348e8:      	str	x10, [x21, #0xd8]!
 46348ec:      	add	x10, x8, #0x490
 46348f0:      	stp	x9, x10, [x0, #0x68]
 46348f4:      	add	x9, x8, #0x570
 46348f8:      	mov	x22, x0
 46348fc:      	str	x9, [x22, #0xf8]!
 4634900:      	add	x9, x8, #0x4e0
 4634904:      	str	x9, [x0, #0xb0]
 4634908:      	add	x8, x8, #0x598
 463490c:      	str	x8, [x0, #0x310]
 4634910:      	add	x25, x0, #0x318
 4634914:      	movi.2d	v0, #0000000000000000
 4634918:      	str	q0, [x25]
 463491c:      	add	x0, x0, #0x328
 4634920:      	add	x1, x20, #0x310
 4634924:      	mov	w2, #0x3c               ; =60
 4634928:      	bl	0x136ec00 <_ChromeMain+0x1369964>
 463492c:      	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 4634930:      	add	x8, x8, #0x900
 4634934:      	str	x8, [x20, #0x328]
 4634938:      	and	x8, x26, #0xfffffffc00000000
 463493c:      	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4634940:      	ldr	x9, [x23, #0x88]
 4634944:      	cmp	x8, x9
 4634948:      	b.ne	0x4634954 <_ChromeMain+0x462f6b8>
 463494c:      	add	x0, x20, #0x310
 4634950:      	bl	0x142fc <_ChromeMain+0xf060>
 4634954:      	str	x26, [x20, #0x370]
 4634958:      	mov	w8, #0x1                ; =1
 463495c:      	str	w8, [x20, #0x378]
 4634960:      	strb	wzr, [x20, #0x37c]
 4634964:      	strb	wzr, [x20, #0x380]
 4634968:      	str	xzr, [x20, #0x388]
 463496c:      	str	xzr, [x20, #0x398]
 4634970:      	str	xzr, [x20, #0x390]
 4634974:      	mov	w8, #0xd4c0             ; =54464
 4634978:      	movk	w8, #0x1, lsl #16
 463497c:      	str	x8, [x20, #0x3a0]
 4634980:      	mov	x8, #0x3ff0000000000000 ; =4607182418800017408
 4634984:      	str	x8, [x20, #0x3a8]
 4634988:      	movi.2d	v0, #0000000000000000
 463498c:      	stp	q0, q0, [x20, #0x3b0]
 4634990:      	stp	q0, q0, [x20, #0x3d0]
 4634994:      	mov	x0, x20
 4634998:      	mov	w1, #0x1                ; =1
 463499c:      	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 46349a0:      	ldr	x8, [x20, #0x20]
 46349a4:      	ldr	w9, [x8, #0x8]
 46349a8:      	cmp	w9, #0x2
 46349ac:      	b.eq	0x4634d78 <_ChromeMain+0x462fadc>
 46349b0:      	ldrb	w9, [x8, #0x8a]
 46349b4:      	cbz	w9, 0x46349c8 <_ChromeMain+0x462f72c>
 46349b8:      	strb	wzr, [x8, #0x8a]
 46349bc:      	ldr	x0, [x8, #0x168]
 46349c0:      	mov	w1, #0x0                ; =0
 46349c4:      	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 46349c8:      	ldrb	w8, [x20, #0x1a9]
 46349cc:      	cbz	w8, 0x46349e0 <_ChromeMain+0x462f744>
 46349d0:      	strb	wzr, [x20, #0x1a9]
 46349d4:      	add	x1, x20, #0x1a9
 46349d8:      	mov	x0, x22
 46349dc:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46349e0:      	ldapr	x0, [x24]
 46349e4:      	cbz	x0, 0x4634d68 <_ChromeMain+0x462facc>
 46349e8:      	mov	w1, #0x380              ; =896
 46349ec:      	mov	x2, #0x0                ; =0
 46349f0:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 46349f4:      	mov	x22, x0
 46349f8:      	bl	0x242d238 <_ChromeMain+0x2427f9c>
 46349fc:      	adrp	x8, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 4634a00:      	add	x8, x8, #0xbd0
 4634a04:      	add	x9, x8, #0x3f0
 4634a08:      	stp	x8, x9, [x0]
 4634a0c:      	add	x9, x8, #0x418
 4634a10:      	str	x9, [x0, #0x10]
 4634a14:      	add	x9, x8, #0x450
 4634a18:      	add	x10, x8, #0x480
 4634a1c:      	stp	x9, x10, [x0, #0x68]
 4634a20:      	add	x9, x8, #0x4d0
 4634a24:      	str	x9, [x0, #0xb0]
 4634a28:      	add	x9, x8, #0x530
 4634a2c:      	str	x9, [x0, #0xd8]
 4634a30:      	add	x8, x8, #0x560
 4634a34:      	str	x8, [x0, #0xf8]
 4634a38:      	str	xzr, [x0, #0x348]
 4634a3c:      	movi	d0, #0xffff000000000000
 4634a40:      	str	d0, [x0, #0x350]
 4634a44:      	mov	w8, #0x1                ; =1
 4634a48:      	strb	w8, [x0, #0x358]
 4634a4c:      	str	xzr, [x0, #0x360]
 4634a50:      	strb	wzr, [x0, #0x368]
 4634a54:      	str	xzr, [x0, #0x370]
 4634a58:      	str	wzr, [x0, #0x378]
 4634a5c:      	strb	wzr, [x0, #0x37c]
 4634a60:      	ldrb	w8, [x0, #0x169]
 4634a64:      	cbnz	w8, 0x4634d4c <_ChromeMain+0x462fab0>
 4634a68:      	ldr	x2, [x20, #0x198]
 4634a6c:      	mov	x0, x20
 4634a70:      	mov	x1, x22
 4634a74:      	bl	0x7793fc <_ChromeMain+0x774160>
 4634a78:      	and	x8, x22, #0xfffffffc00000000
 4634a7c:      	ldr	x9, [x23, #0x88]
 4634a80:      	cmp	x8, x9
 4634a84:      	b.ne	0x4634a90 <_ChromeMain+0x462f7f4>
 4634a88:      	mov	x0, x22
 4634a8c:      	bl	0x142fc <_ChromeMain+0xf060>
 4634a90:      	ldr	x0, [x25]
 4634a94:      	and	x8, x0, #0xfffffffc00000000
 4634a98:      	ldr	x9, [x23, #0x88]
 4634a9c:      	cmp	x8, x9
 4634aa0:      	b.ne	0x4634aa8 <_ChromeMain+0x462f80c>
 4634aa4:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4634aa8:      	str	x22, [x25]
 4634aac:      	add	x8, x22, #0x310
 4634ab0:      	ldrb	w9, [x22, #0x318]
 4634ab4:      	cbnz	w9, 0x4634d84 <_ChromeMain+0x462fae8>
 4634ab8:      	cbz	x8, 0x4634d54 <_ChromeMain+0x462fab8>
 4634abc:      	mov	x8, #0x1000000010       ; =68719476752
 4634ac0:      	str	x8, [x22, #0x310]
 4634ac4:      	mov	w8, #0x1                ; =1
 4634ac8:      	strb	w8, [x22, #0x318]
 4634acc:      	ldr	x0, [x22, #0x188]
 4634ad0:      	cbz	x0, 0x4634ae4 <_ChromeMain+0x462f848>
 4634ad4:      	ldr	x8, [x0]
 4634ad8:      	ldr	x8, [x8, #0x2f8]
 4634adc:      	mov	x1, x22
 4634ae0:      	blr	x8
 4634ae4:      	mov	x0, x22
 4634ae8:      	mov	w1, #0x0                ; =0
 4634aec:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 4634af0:      	str	x22, [sp, #0x8]
 4634af4:      	add	x0, x22, #0x130
 4634af8:      	add	x3, sp, #0x8
 4634afc:      	mov	w1, #0x18               ; =24
 4634b00:      	mov	w2, #0x1                ; =1
 4634b04:      	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 4634b08:      	mov	x0, x22
 4634b0c:      	bl	0x1256ae8 <_ChromeMain+0x125184c>
 4634b10:      	ldapr	x0, [x24]
 4634b14:      	cbz	x0, 0x4634d70 <_ChromeMain+0x462fad4>
 4634b18:      	mov	w1, #0x460              ; =1120
 4634b1c:      	mov	x2, #0x0                ; =0
 4634b20:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 4634b24:      	mov	x22, x0
 4634b28:      	mov	x1, #0x0                ; =0
 4634b2c:      	mov	x2, #0x0                ; =0
 4634b30:      	mov	w3, #0x5                ; =5
 4634b34:      	mov	w4, #0x1000             ; =4096
 4634b38:      	mov	w5, #0x0                ; =0
 4634b3c:      	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4634b40:      	ldrb	w8, [x0, #0x169]
 4634b44:      	cbnz	w8, 0x4634d90 <_ChromeMain+0x462faf4>
 4634b48:      	ldr	x2, [x20, #0x198]
 4634b4c:      	mov	x0, x20
 4634b50:      	mov	x1, x22
 4634b54:      	bl	0x7793fc <_ChromeMain+0x774160>
 4634b58:      	and	x8, x22, #0xfffffffc00000000
 4634b5c:      	ldr	x9, [x23, #0x88]
 4634b60:      	cmp	x8, x9
 4634b64:      	b.ne	0x4634b70 <_ChromeMain+0x462f8d4>
 4634b68:      	mov	x0, x22
 4634b6c:      	bl	0x142fc <_ChromeMain+0xf060>
 4634b70:      	ldr	x0, [x20, #0x320]
 4634b74:      	and	x8, x0, #0xfffffffc00000000
 4634b78:      	ldr	x9, [x23, #0x88]
 4634b7c:      	cmp	x8, x9
 4634b80:      	b.ne	0x4634b88 <_ChromeMain+0x462f8ec>
 4634b84:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4634b88:      	str	x22, [x20, #0x320]
 4634b8c:      	mov	x0, x22
 4634b90:      	mov	w1, #0x3                ; =3
 4634b94:      	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 4634b98:      	ldr	x0, [x20, #0x320]
 4634b9c:      	mov	w1, #0x6                ; =6
 4634ba0:      	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 4634ba4:      	ldr	x22, [x20, #0x320]
 4634ba8:      	ldrb	w8, [x22, #0x3b6]
 4634bac:      	cbnz	w8, 0x4634d10 <_ChromeMain+0x462fa74>
 4634bb0:      	mov	w8, #0xe1               ; =225
 4634bb4:      	str	w8, [sp, #0x8]
 4634bb8:      	strb	wzr, [sp, #0xc]
 4634bbc:      	ldr	x8, [x22]
 4634bc0:      	ldr	x8, [x8, #0x3e8]
 4634bc4:      	add	x1, sp, #0x8
 4634bc8:      	mov	x0, x22
 4634bcc:      	blr	x8
 4634bd0:      	ldr	x0, [x20, #0x320]
 4634bd4:      	mov	w1, #0x0                ; =0
 4634bd8:      	bl	0x273f370 <_ChromeMain+0x273a0d4>
 4634bdc:      	ldr	x0, [x20, #0x320]
 4634be0:      	mov	w1, #0x1                ; =1
 4634be4:      	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 4634be8:      	ldr	x8, [x20, #0x320]
 4634bec:      	ldr	x8, [x8, #0x20]
 4634bf0:      	ldr	w9, [x8, #0x8]
 4634bf4:      	cmp	w9, #0x2
 4634bf8:      	b.eq	0x4634d9c <_ChromeMain+0x462fb00>
 4634bfc:      	ldrb	w9, [x8, #0x8a]
 4634c00:      	cbz	w9, 0x4634c14 <_ChromeMain+0x462f978>
 4634c04:      	strb	wzr, [x8, #0x8a]
 4634c08:      	ldr	x0, [x8, #0x168]
 4634c0c:      	mov	w1, #0x0                ; =0
 4634c10:      	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 4634c14:      	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4634c18:      	ldr	x22, [x8, #0x30]
 4634c1c:      	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 4634c20:      	add	x1, x1, #0x293
 4634c24:      	mov	x0, x22
 4634c28:      	bl	0x1f557c <_ChromeMain+0x1f02e0>
 4634c2c:      	tbnz	w0, #0x0, 0x4634d58 <_ChromeMain+0x462fabc>
 4634c30:      	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 4634c34:      	add	x1, x1, #0x2b0
 4634c38:      	mov	x0, x22
 4634c3c:      	bl	0x1f557c <_ChromeMain+0x1f02e0>
 4634c40:      	tbnz	w0, #0x0, 0x4634c5c <_ChromeMain+0x462f9c0>
 4634c44:      	adrp	x22, 0xef10000 <dyld_stub_binder+0xef10000>
 4634c48:      	ldrb	w8, [x22, #0x329]
 4634c4c:      	tbz	w8, #0x0, 0x4634d3c <_ChromeMain+0x462faa0>
 4634c50:      	adrp	x8, 0xef10000 <dyld_stub_binder+0xef10000>
 4634c54:      	ldrb	w8, [x8, #0x328]
 4634c58:      	tbnz	w8, #0x0, 0x4634d58 <_ChromeMain+0x462fabc>
 4634c5c:      	mov	w8, #0x9810             ; =38928
 4634c60:      	movk	w8, #0x2, lsl #16
 4634c64:      	str	x8, [x20, #0x3a0]
 4634c68:      	mov	w8, #0xb                ; =11
 4634c6c:      	str	w8, [x20, #0x378]
 4634c70:      	ldr	x8, [x20]
 4634c74:      	ldr	x8, [x8, #0xa0]
 4634c78:      	mov	x0, x20
 4634c7c:      	mov	w1, #0x0                ; =0
 4634c80:      	blr	x8
 4634c84:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4634c88:      	add	x1, x1, #0x5e8
 4634c8c:      	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 4634c90:      	add	x2, x2, #0xa13
 4634c94:      	mov	x0, x21
 4634c98:      	mov	x3, #0x0                ; =0
 4634c9c:      	mov	w4, #0x1                ; =1
 4634ca0:      	mov	x5, #0x0                ; =0
 4634ca4:      	bl	0xb6a19c <_ChromeMain+0xb64f00>
 4634ca8:      	ldrb	w8, [x20, #0x169]
 4634cac:      	cbnz	w8, 0x4634da8 <_ChromeMain+0x462fb0c>
 4634cb0:      	ldr	x2, [x19, #0x198]
 4634cb4:      	mov	x0, x19
 4634cb8:      	mov	x1, x20
 4634cbc:      	bl	0x7793fc <_ChromeMain+0x774160>
 4634cc0:      	and	x8, x20, #0xfffffffc00000000
 4634cc4:      	ldr	x9, [x23, #0x88]
 4634cc8:      	cmp	x8, x9
 4634ccc:      	b.ne	0x4634cd8 <_ChromeMain+0x462fa3c>
 4634cd0:      	mov	x0, x20
 4634cd4:      	bl	0x142fc <_ChromeMain+0xf060>
 4634cd8:      	ldr	x0, [x19, #0x6b8]
 4634cdc:      	and	x8, x0, #0xfffffffc00000000
 4634ce0:      	ldr	x9, [x23, #0x88]
 4634ce4:      	cmp	x8, x9
 4634ce8:      	b.ne	0x4634cf0 <_ChromeMain+0x462fa54>
 4634cec:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4634cf0:      	str	x20, [x19, #0x6b8]
 4634cf4:      	ldp	x29, x30, [sp, #0x50]
 4634cf8:      	ldp	x20, x19, [sp, #0x40]
 4634cfc:      	ldp	x22, x21, [sp, #0x30]
 4634d00:      	ldp	x24, x23, [sp, #0x20]
 4634d04:      	ldp	x26, x25, [sp, #0x10]
 4634d08:      	add	sp, sp, #0x60
 4634d0c:      	ret
 4634d10:      	strb	wzr, [x22, #0x3b6]
 4634d14:      	mov	x0, x22
 4634d18:      	bl	0xf28308 <_ChromeMain+0xf2306c>
 4634d1c:      	mov	x0, x22
 4634d20:      	mov	w1, #0x2                ; =2
 4634d24:      	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4634d28:      	add	x0, x22, #0xf8
 4634d2c:      	add	x1, x22, #0x3b6
 4634d30:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4634d34:      	ldr	x22, [x20, #0x320]
 4634d38:      	b	0x4634bb0 <_ChromeMain+0x462f914>
 4634d3c:      	bl	0x293e4a4 <_ChromeMain+0x2939208>
 4634d40:      	ldrb	w8, [x22, #0x329]
 4634d44:      	tbnz	w8, #0x0, 0x4634c50 <_ChromeMain+0x462f9b4>
 4634d48:      	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 4634d4c:      	brk	#0
 4634d50:      	hlt	#0
 4634d54:      	brk	#0x1
 4634d58:      	mov	x8, #0x0                ; =0
 4634d5c:      	b	0x4634c64 <_ChromeMain+0x462f9c8>
 4634d60:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4634d64:      	b	0x46348ac <_ChromeMain+0x462f610>
 4634d68:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4634d6c:      	b	0x46349e8 <_ChromeMain+0x462f74c>
 4634d70:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4634d74:      	b	0x4634b18 <_ChromeMain+0x462f87c>
 4634d78:      	brk	#0
 4634d7c:      	hlt	#0
 4634d80:      	brk	#0x1
 4634d84:      	mov	x9, #0x1000000010       ; =68719476752
 4634d88:      	str	x9, [x8]
 4634d8c:      	b	0x4634acc <_ChromeMain+0x462f830>
 4634d90:      	brk	#0
 4634d94:      	hlt	#0
 4634d98:      	brk	#0x1
 4634d9c:      	brk	#0
 4634da0:      	hlt	#0
 4634da4:      	brk	#0x1
 4634da8:      	brk	#0
 4634dac:      	hlt	#0
 4634db0:      	brk	#0x1
