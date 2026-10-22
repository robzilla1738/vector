/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_15SplitEP10napi_env__P12napi_value__:
   238c8:	fc 6f be a9	stp	x28, x27, [sp, #-0x20]!
   238cc:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
   238d0:	fd 43 00 91	add	x29, sp, #0x10
   238d4:	ff 03 0d d1	sub	sp, sp, #0x340
   238d8:	08 38 00 b0	adrp	x8, 1793 ; 0x724000
   238dc:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   238e0:	08 01 40 f9	ldr	x8, [x8]
   238e4:	a8 83 1e f8	stur	x8, [x29, #-0x18]
   238e8:	a0 03 1c f8	stur	x0, [x29, #-0x40]
   238ec:	a1 83 1b f8	stur	x1, [x29, #-0x48]
   238f0:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   238f4:	a1 83 5b f8	ldur	x1, [x29, #-0x48]
   238f8:	a8 83 01 d1	sub	x8, x29, #0x60
   238fc:	a2 27 00 b0	adrp	x2, 1269 ; 0x518000
   23900:	42 78 3c 91	add	x2, x2, #0xf1e ; literal pool for: "filePath"
   23904:	bc 7f ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
   23908:	01 00 00 14	b	0x2390c
   2390c:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   23910:	a1 83 5b f8	ldur	x1, [x29, #-0x48]
   23914:	a8 e3 01 d1	sub	x8, x29, #0x78
   23918:	a2 27 00 d0	adrp	x2, 1270 ; 0x519000
   2391c:	42 ac 11 91	add	x2, x2, #0x46b ; literal pool for: "outputDir"
   23920:	b5 7f ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
   23924:	01 00 00 14	b	0x23928
   23928:	e0 23 06 91	add	x0, sp, #0x188
   2392c:	a1 83 01 d1	sub	x1, x29, #0x60
   23930:	4f 80 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentC1ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE
   23934:	01 00 00 14	b	0x23938
   23938:	e0 23 06 91	add	x0, sp, #0x188
   2393c:	59 80 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
   23940:	27 8d 05 94	bl	_FPDF_GetPageCount
   23944:	e0 87 00 b9	str	w0, [sp, #0x84]
   23948:	01 00 00 14	b	0x2394c
   2394c:	e8 87 40 b9	ldr	w8, [sp, #0x84]
   23950:	e8 87 01 b9	str	w8, [sp, #0x184]
   23954:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   23958:	a1 83 5b f8	ldur	x1, [x29, #-0x48]
   2395c:	e2 87 41 b9	ldr	w2, [sp, #0x184]
   23960:	e8 a3 05 91	add	x8, sp, #0x168
   23964:	55 80 ff 97	bl	__ZN12_GLOBAL__N_115ReadPageNumbersEP10napi_env__P12napi_value__i
   23968:	01 00 00 14	b	0x2396c
   2396c:	e8 43 05 91	add	x8, sp, #0x150
   23970:	a0 e3 01 d1	sub	x0, x29, #0x78
   23974:	d7 84 ff 97	bl	__ZN12_GLOBAL__N_112PathFromUtf8ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
   23978:	01 00 00 14	b	0x2397c
   2397c:	e0 43 05 91	add	x0, sp, #0x150
   23980:	5f c6 ff 97	bl	__ZNSt3__14__fs10filesystem18create_directoriesB9nqe210106ERKNS1_4pathE
   23984:	01 00 00 14	b	0x23988
   23988:	a8 03 5c f8	ldur	x8, [x29, #-0x40]
   2398c:	e8 3b 00 f9	str	x8, [sp, #0x70]
   23990:	e0 a3 05 91	add	x0, sp, #0x168
   23994:	3b 81 ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE4sizeB9nqe210106Ev
   23998:	e1 03 00 aa	mov	x1, x0
   2399c:	e0 3b 40 f9	ldr	x0, [sp, #0x70]
   239a0:	2b 81 ff 97	bl	__ZN12_GLOBAL__N_15ArrayEP10napi_env__m
   239a4:	e0 3f 00 f9	str	x0, [sp, #0x78]
   239a8:	01 00 00 14	b	0x239ac
   239ac:	e8 3f 40 f9	ldr	x8, [sp, #0x78]
   239b0:	e8 a7 00 f9	str	x8, [sp, #0x148]
   239b4:	ff a3 00 f9	str	xzr, [sp, #0x140]
   239b8:	01 00 00 14	b	0x239bc
   239bc:	e8 a3 40 f9	ldr	x8, [sp, #0x140]
   239c0:	e8 37 00 f9	str	x8, [sp, #0x68]
   239c4:	e0 a3 05 91	add	x0, sp, #0x168
   239c8:	2e 81 ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE4sizeB9nqe210106Ev
   239cc:	e8 37 40 f9	ldr	x8, [sp, #0x68]
   239d0:	08 01 00 eb	subs	x8, x8, x0
   239d4:	22 1b 00 54	b.hs	0x23d38
   239d8:	01 00 00 14	b	0x239dc
   239dc:	e1 a3 40 f9	ldr	x1, [sp, #0x140]
   239e0:	e0 a3 05 91	add	x0, sp, #0x168
   239e4:	31 81 ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEEixB9nqe210106Em
   239e8:	08 00 40 b9	ldr	w8, [x0]
   239ec:	e8 3f 01 b9	str	w8, [sp, #0x13c]
   239f0:	e8 3f 41 b9	ldr	w8, [sp, #0x13c]
   239f4:	08 05 00 71	subs	w8, w8, #0x1
   239f8:	e8 3b 01 b9	str	w8, [sp, #0x138]
   239fc:	e0 c3 04 91	add	x0, sp, #0x130
   23a00:	27 e5 ff 97	bl	__ZN12_GLOBAL__N_114NewPdfDocumentC1Ev
   23a04:	01 00 00 14	b	0x23a08
   23a08:	e0 c3 04 91	add	x0, sp, #0x130
   23a0c:	a2 e5 ff 97	bl	__ZNK12_GLOBAL__N_114NewPdfDocument3getEv
   23a10:	e0 2f 00 f9	str	x0, [sp, #0x58]
   23a14:	e0 23 06 91	add	x0, sp, #0x188
   23a18:	22 80 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
   23a1c:	e1 03 00 aa	mov	x1, x0
   23a20:	e0 2f 40 f9	ldr	x0, [sp, #0x58]
   23a24:	e2 e3 04 91	add	x2, sp, #0x138
   23a28:	23 00 80 d2	mov	x3, #0x1
   23a2c:	04 00 80 52	mov	w4, #0x0
   23a30:	71 82 05 94	bl	_FPDF_ImportPagesByIndex
   23a34:	e0 67 00 b9	str	w0, [sp, #0x64]
   23a38:	01 00 00 14	b	0x23a3c
   23a3c:	e8 67 40 b9	ldr	w8, [sp, #0x64]
   23a40:	48 0a 00 35	cbnz	w8, 0x23b88
   23a44:	01 00 00 14	b	0x23a48
   23a48:	28 00 80 52	mov	w8, #0x1
   23a4c:	08 01 00 12	and	w8, w8, #0x1
   23a50:	08 01 00 12	and	w8, w8, #0x1
   23a54:	e8 ff 03 39	strb	w8, [sp, #0xff]
   23a58:	00 02 80 d2	mov	x0, #0x10
   23a5c:	ee c5 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   23a60:	e0 2b 00 f9	str	x0, [sp, #0x50]
   23a64:	e0 3f 41 b9	ldr	w0, [sp, #0x13c]
   23a68:	e8 03 04 91	add	x8, sp, #0x100
   23a6c:	b1 c5 13 94	bl	0x515130 ; symbol stub for: __ZNSt3__19to_stringEi
   23a70:	01 00 00 14	b	0x23a74
   23a74:	e8 63 04 91	add	x8, sp, #0x118
   23a78:	a0 27 00 d0	adrp	x0, 1270 ; 0x519000
   23a7c:	00 0c 18 91	add	x0, x0, #0x603 ; literal pool for: "Failed to split PDF page "
   23a80:	e1 03 04 91	add	x1, sp, #0x100
   23a84:	27 81 ff 97	bl	__ZNSt3__1plB9nqe210106IcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_OS9_
   23a88:	01 00 00 14	b	0x23a8c
   23a8c:	e0 2b 40 f9	ldr	x0, [sp, #0x50]
   23a90:	e1 63 04 91	add	x1, sp, #0x118
   23a94:	f7 c3 13 94	bl	0x514a70 ; symbol stub for: __ZNSt13runtime_errorC1ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
   23a98:	01 00 00 14	b	0x23a9c
   23a9c:	e0 2b 40 f9	ldr	x0, [sp, #0x50]
   23aa0:	08 00 80 52	mov	w8, #0x0
   23aa4:	08 01 00 12	and	w8, w8, #0x1
   23aa8:	08 01 00 12	and	w8, w8, #0x1
   23aac:	e8 ff 03 39	strb	w8, [sp, #0xff]
   23ab0:	01 38 00 b0	adrp	x1, 1793 ; 0x724000
   23ab4:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   23ab8:	02 38 00 b0	adrp	x2, 1793 ; 0x724000
   23abc:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   23ac0:	f0 c5 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   23ac4:	dc 00 00 14	b	0x23e34
   23ac8:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23acc:	e8 03 01 aa	mov	x8, x1
   23ad0:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23ad4:	d2 00 00 14	b	0x23e1c
   23ad8:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23adc:	e8 03 01 aa	mov	x8, x1
   23ae0:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23ae4:	cb 00 00 14	b	0x23e10
   23ae8:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23aec:	e8 03 01 aa	mov	x8, x1
   23af0:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23af4:	c4 00 00 14	b	0x23e04
   23af8:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23afc:	e8 03 01 aa	mov	x8, x1
   23b00:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23b04:	bd 00 00 14	b	0x23df8
   23b08:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23b0c:	e8 03 01 aa	mov	x8, x1
   23b10:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23b14:	b6 00 00 14	b	0x23dec
   23b18:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23b1c:	e8 03 01 aa	mov	x8, x1
   23b20:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23b24:	82 00 00 14	b	0x23d2c
   23b28:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23b2c:	e8 03 01 aa	mov	x8, x1
   23b30:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23b34:	0e 00 00 14	b	0x23b6c
   23b38:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23b3c:	e8 03 01 aa	mov	x8, x1
   23b40:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23b44:	07 00 00 14	b	0x23b60
   23b48:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23b4c:	e8 03 01 aa	mov	x8, x1
   23b50:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23b54:	e0 63 04 91	add	x0, sp, #0x118
   23b58:	3e c4 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23b5c:	01 00 00 14	b	0x23b60
   23b60:	e0 03 04 91	add	x0, sp, #0x100
   23b64:	3b c4 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23b68:	01 00 00 14	b	0x23b6c
   23b6c:	e8 ff 43 39	ldrb	w8, [sp, #0xff]
   23b70:	a8 00 00 36	tbz	w8, #0x0, 0x23b84
   23b74:	01 00 00 14	b	0x23b78
   23b78:	e0 2b 40 f9	ldr	x0, [sp, #0x50]
   23b7c:	b5 c5 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   23b80:	01 00 00 14	b	0x23b84
   23b84:	6a 00 00 14	b	0x23d2c
   23b88:	e8 3f 41 b9	ldr	w8, [sp, #0x13c]
   23b8c:	e9 03 00 91	mov	x9, sp
   23b90:	28 01 00 f9	str	x8, [x9]
   23b94:	a0 e3 00 d1	sub	x0, x29, #0x38
   23b98:	e0 27 00 f9	str	x0, [sp, #0x48]
   23b9c:	01 04 80 d2	mov	x1, #0x20
   23ba0:	a2 27 00 d0	adrp	x2, 1270 ; 0x519000
   23ba4:	42 74 18 91	add	x2, x2, #0x61d ; literal pool for: "page_%03d.pdf"
   23ba8:	54 c7 13 94	bl	0x5158f8 ; symbol stub for: _snprintf
   23bac:	e1 27 40 f9	ldr	x1, [sp, #0x48]
   23bb0:	e0 23 03 91	add	x0, sp, #0xc8
   23bb4:	02 00 80 52	mov	w2, #0x0
   23bb8:	b0 e8 ff 97	bl	__ZNSt3__14__fs10filesystem4pathC1B9nqe210106IA32_cvEERKT_NS2_6formatE
   23bbc:	01 00 00 14	b	0x23bc0
   23bc0:	e8 83 03 91	add	x8, sp, #0xe0
   23bc4:	e0 43 05 91	add	x0, sp, #0x150
   23bc8:	e1 23 03 91	add	x1, sp, #0xc8
   23bcc:	81 e8 ff 97	bl	__ZNSt3__14__fs10filesystemdvB9nqe210106ERKNS1_4pathES4_
   23bd0:	01 00 00 14	b	0x23bd4
   23bd4:	e0 23 03 91	add	x0, sp, #0xc8
   23bd8:	5f 84 ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   23bdc:	e0 c3 04 91	add	x0, sp, #0x130
   23be0:	2d e5 ff 97	bl	__ZNK12_GLOBAL__N_114NewPdfDocument3getEv
   23be4:	e0 23 00 f9	str	x0, [sp, #0x40]
   23be8:	e8 c3 02 91	add	x8, sp, #0xb0
   23bec:	e0 83 03 91	add	x0, sp, #0xe0
   23bf0:	5e ea ff 97	bl	__ZN12_GLOBAL__N_110PathToUtf8ERKNSt3__14__fs10filesystem4pathE
   23bf4:	01 00 00 14	b	0x23bf8
   23bf8:	e0 23 40 f9	ldr	x0, [sp, #0x40]
   23bfc:	e1 c3 02 91	add	x1, sp, #0xb0
   23c00:	a0 a0 ff 97	bl	__ZN12_GLOBAL__N_112SaveDocumentEP17fpdf_document_t__RKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE
   23c04:	01 00 00 14	b	0x23c08
   23c08:	e0 c3 02 91	add	x0, sp, #0xb0
   23c0c:	11 c4 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23c10:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   23c14:	44 79 ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
   23c18:	e0 1f 00 f9	str	x0, [sp, #0x38]
   23c1c:	01 00 00 14	b	0x23c20
   23c20:	e8 1f 40 f9	ldr	x8, [sp, #0x38]
   23c24:	e8 57 00 f9	str	x8, [sp, #0xa8]
   23c28:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   23c2c:	e1 57 40 f9	ldr	x1, [sp, #0xa8]
   23c30:	e3 3f 41 b9	ldr	w3, [sp, #0x13c]
   23c34:	a2 27 00 b0	adrp	x2, 1269 ; 0x518000
   23c38:	42 84 3d 91	add	x2, x2, #0xf61 ; literal pool for: "page"
   23c3c:	33 81 ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
   23c40:	01 00 00 14	b	0x23c44
   23c44:	a8 03 5c f8	ldur	x8, [x29, #-0x40]
   23c48:	e8 17 00 f9	str	x8, [sp, #0x28]
   23c4c:	e8 57 40 f9	ldr	x8, [sp, #0xa8]
   23c50:	e8 1b 00 f9	str	x8, [sp, #0x30]
   23c54:	e8 43 02 91	add	x8, sp, #0x90
   23c58:	e0 83 03 91	add	x0, sp, #0xe0
   23c5c:	43 ea ff 97	bl	__ZN12_GLOBAL__N_110PathToUtf8ERKNSt3__14__fs10filesystem4pathE
   23c60:	01 00 00 14	b	0x23c64
   23c64:	e1 1b 40 f9	ldr	x1, [sp, #0x30]
   23c68:	e0 17 40 f9	ldr	x0, [sp, #0x28]
   23c6c:	a2 27 00 d0	adrp	x2, 1270 ; 0x519000
   23c70:	42 50 14 91	add	x2, x2, #0x514 ; literal pool for: "path"
   23c74:	e3 43 02 91	add	x3, sp, #0x90
   23c78:	37 81 ff 97	bl	__ZN12_GLOBAL__N_19SetStringEP10napi_env__P12napi_value__PKcRKNSt3__112basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEE
   23c7c:	01 00 00 14	b	0x23c80
   23c80:	e0 43 02 91	add	x0, sp, #0x90
   23c84:	f3 c3 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23c88:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   23c8c:	e1 a7 40 f9	ldr	x1, [sp, #0x148]
   23c90:	e8 a3 40 f9	ldr	x8, [sp, #0x140]
   23c94:	e2 03 08 aa	mov	x2, x8
   23c98:	e3 57 40 f9	ldr	x3, [sp, #0xa8]
   23c9c:	9c c6 13 94	bl	0x51570c ; symbol stub for: _napi_set_element
   23ca0:	01 00 00 14	b	0x23ca4
   23ca4:	e0 83 03 91	add	x0, sp, #0xe0
   23ca8:	2b 84 ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   23cac:	e0 c3 04 91	add	x0, sp, #0x130
   23cb0:	09 e5 ff 97	bl	__ZN12_GLOBAL__N_114NewPdfDocumentD1Ev
   23cb4:	01 00 00 14	b	0x23cb8
   23cb8:	e8 a3 40 f9	ldr	x8, [sp, #0x140]
   23cbc:	08 05 00 91	add	x8, x8, #0x1
   23cc0:	e8 a3 00 f9	str	x8, [sp, #0x140]
   23cc4:	3e ff ff 17	b	0x239bc
   23cc8:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23ccc:	e8 03 01 aa	mov	x8, x1
   23cd0:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23cd4:	e0 23 03 91	add	x0, sp, #0xc8
   23cd8:	1f 84 ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   23cdc:	14 00 00 14	b	0x23d2c
   23ce0:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23ce4:	e8 03 01 aa	mov	x8, x1
   23ce8:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23cec:	0d 00 00 14	b	0x23d20
   23cf0:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23cf4:	e8 03 01 aa	mov	x8, x1
   23cf8:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23cfc:	e0 c3 02 91	add	x0, sp, #0xb0
   23d00:	d4 c3 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23d04:	07 00 00 14	b	0x23d20
   23d08:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   23d0c:	e8 03 01 aa	mov	x8, x1
   23d10:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   23d14:	e0 43 02 91	add	x0, sp, #0x90
   23d18:	ce c3 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23d1c:	01 00 00 14	b	0x23d20
   23d20:	e0 83 03 91	add	x0, sp, #0xe0
   23d24:	0c 84 ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   23d28:	01 00 00 14	b	0x23d2c
   23d2c:	e0 c3 04 91	add	x0, sp, #0x130
   23d30:	e9 e4 ff 97	bl	__ZN12_GLOBAL__N_114NewPdfDocumentD1Ev
   23d34:	2e 00 00 14	b	0x23dec
   23d38:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   23d3c:	fa 78 ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
   23d40:	e0 13 00 f9	str	x0, [sp, #0x20]
   23d44:	01 00 00 14	b	0x23d48
   23d48:	e8 13 40 f9	ldr	x8, [sp, #0x20]
   23d4c:	e8 47 00 f9	str	x8, [sp, #0x88]
   23d50:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   23d54:	e1 47 40 f9	ldr	x1, [sp, #0x88]
   23d58:	e3 87 41 b9	ldr	w3, [sp, #0x184]
   23d5c:	a2 27 00 b0	adrp	x2, 1269 ; 0x518000
   23d60:	42 ac 3d 91	add	x2, x2, #0xf6b ; literal pool for: "pageCount"
   23d64:	e9 80 ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
   23d68:	01 00 00 14	b	0x23d6c
   23d6c:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   23d70:	e1 47 40 f9	ldr	x1, [sp, #0x88]
   23d74:	e3 a7 40 f9	ldr	x3, [sp, #0x148]
   23d78:	a2 27 00 b0	adrp	x2, 1269 ; 0x518000
   23d7c:	42 d4 3d 91	add	x2, x2, #0xf75 ; literal pool for: "pages"
   23d80:	2e 81 ff 97	bl	__ZN12_GLOBAL__N_13SetEP10napi_env__P12napi_value__PKcS3_
   23d84:	01 00 00 14	b	0x23d88
   23d88:	e8 47 40 f9	ldr	x8, [sp, #0x88]
   23d8c:	e8 0f 00 f9	str	x8, [sp, #0x18]
   23d90:	e0 43 05 91	add	x0, sp, #0x150
   23d94:	f0 83 ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   23d98:	e0 a3 05 91	add	x0, sp, #0x168
   23d9c:	36 81 ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
   23da0:	e0 23 06 91	add	x0, sp, #0x188
   23da4:	3f 81 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
   23da8:	a0 e3 01 d1	sub	x0, x29, #0x78
   23dac:	a9 c3 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23db0:	a0 83 01 d1	sub	x0, x29, #0x60
   23db4:	a7 c3 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23db8:	a9 83 5e f8	ldur	x9, [x29, #-0x18]
   23dbc:	08 38 00 b0	adrp	x8, 1793 ; 0x724000
   23dc0:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   23dc4:	08 01 40 f9	ldr	x8, [x8]
   23dc8:	08 01 09 eb	subs	x8, x8, x9
   23dcc:	60 00 00 54	b.eq	0x23dd8
   23dd0:	01 00 00 14	b	0x23dd4
   23dd4:	4c c5 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
   23dd8:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
   23ddc:	ff 03 0d 91	add	sp, sp, #0x340
   23de0:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
   23de4:	fc 6f c2 a8	ldp	x28, x27, [sp], #0x20
   23de8:	c0 03 5f d6	ret
   23dec:	e0 43 05 91	add	x0, sp, #0x150
   23df0:	d9 83 ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   23df4:	01 00 00 14	b	0x23df8
   23df8:	e0 a3 05 91	add	x0, sp, #0x168
   23dfc:	1e 81 ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
   23e00:	01 00 00 14	b	0x23e04
   23e04:	e0 23 06 91	add	x0, sp, #0x188
   23e08:	26 81 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
   23e0c:	01 00 00 14	b	0x23e10
   23e10:	a0 e3 01 d1	sub	x0, x29, #0x78
   23e14:	8f c3 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23e18:	01 00 00 14	b	0x23e1c
   23e1c:	a0 83 01 d1	sub	x0, x29, #0x60
   23e20:	8c c3 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23e24:	01 00 00 14	b	0x23e28
   23e28:	a0 03 58 f8	ldur	x0, [x29, #-0x80]
   23e2c:	e0 0b 00 f9	str	x0, [sp, #0x10]
   23e30:	04 00 00 14	b	0x23e40
   23e34:	20 00 20 d4	brk	#0x1
   23e38:	e0 0b 00 f9	str	x0, [sp, #0x10]
   23e3c:	01 00 00 14	b	0x23e40
   23e40:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
   23e44:	e4 c2 13 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
