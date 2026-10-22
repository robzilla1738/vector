/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_15MergeEP10napi_env__P12napi_value__:
   1c8e8:	fc 6f be a9	stp	x28, x27, [sp, #-0x20]!
   1c8ec:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
   1c8f0:	fd 43 00 91	add	x29, sp, #0x10
   1c8f4:	ff c3 0b d1	sub	sp, sp, #0x2f0
   1c8f8:	a0 83 1e f8	stur	x0, [x29, #-0x18]
   1c8fc:	a1 03 1e f8	stur	x1, [x29, #-0x20]
   1c900:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   1c904:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   1c908:	e2 27 00 b0	adrp	x2, 1277 ; 0x519000
   1c90c:	42 f8 0f 91	add	x2, x2, #0x3fe ; literal pool for: "files"
   1c910:	6f 9e ff 97	bl	__ZN12_GLOBAL__N_13HasEP10napi_env__P12napi_value__PKc
   1c914:	c0 02 00 37	tbnz	w0, #0x0, 0x1c96c
   1c918:	01 00 00 14	b	0x1c91c
   1c91c:	00 02 80 d2	mov	x0, #0x10
   1c920:	3d e2 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1c924:	e0 5b 00 f9	str	x0, [sp, #0xb0]
   1c928:	e1 27 00 b0	adrp	x1, 1277 ; 0x519000
   1c92c:	21 10 10 91	add	x1, x1, #0x404 ; literal pool for: "Missing files"
   1c930:	4d e0 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   1c934:	01 00 00 14	b	0x1c938
   1c938:	e0 5b 40 f9	ldr	x0, [sp, #0xb0]
   1c93c:	41 38 00 90	adrp	x1, 1800 ; 0x724000
   1c940:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1c944:	42 38 00 90	adrp	x2, 1800 ; 0x724000
   1c948:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1c94c:	4d e2 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1c950:	e8 03 00 aa	mov	x8, x0
   1c954:	e0 5b 40 f9	ldr	x0, [sp, #0xb0]
   1c958:	a8 83 1d f8	stur	x8, [x29, #-0x28]
   1c95c:	e8 03 01 aa	mov	x8, x1
   1c960:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
   1c964:	3b e2 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1c968:	4a 01 00 14	b	0x1ce90
   1c96c:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   1c970:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   1c974:	e2 27 00 b0	adrp	x2, 1277 ; 0x519000
   1c978:	42 f8 0f 91	add	x2, x2, #0x3fe ; literal pool for: "files"
   1c97c:	75 9e ff 97	bl	__ZN12_GLOBAL__N_13GetEP10napi_env__P12napi_value__PKc
   1c980:	a0 83 1c f8	stur	x0, [x29, #-0x38]
   1c984:	a2 e7 00 d1	sub	x2, x29, #0x39
   1c988:	bf 73 1c 38	sturb	wzr, [x29, #-0x39]
   1c98c:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   1c990:	a1 83 5c f8	ldur	x1, [x29, #-0x38]
   1c994:	5b e3 13 94	bl	0x515700 ; symbol stub for: _napi_is_array
   1c998:	a8 73 5c 38	ldurb	w8, [x29, #-0x39]
   1c99c:	c8 02 00 37	tbnz	w8, #0x0, 0x1c9f4
   1c9a0:	01 00 00 14	b	0x1c9a4
   1c9a4:	00 02 80 d2	mov	x0, #0x10
   1c9a8:	1b e2 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1c9ac:	e0 57 00 f9	str	x0, [sp, #0xa8]
   1c9b0:	e1 27 00 b0	adrp	x1, 1277 ; 0x519000
   1c9b4:	21 48 10 91	add	x1, x1, #0x412 ; literal pool for: "files must be an array"
   1c9b8:	2b e0 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   1c9bc:	01 00 00 14	b	0x1c9c0
   1c9c0:	e0 57 40 f9	ldr	x0, [sp, #0xa8]
   1c9c4:	41 38 00 90	adrp	x1, 1800 ; 0x724000
   1c9c8:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1c9cc:	42 38 00 90	adrp	x2, 1800 ; 0x724000
   1c9d0:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1c9d4:	2b e2 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1c9d8:	e8 03 00 aa	mov	x8, x0
   1c9dc:	e0 57 40 f9	ldr	x0, [sp, #0xa8]
   1c9e0:	a8 83 1d f8	stur	x8, [x29, #-0x28]
   1c9e4:	e8 03 01 aa	mov	x8, x1
   1c9e8:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
   1c9ec:	19 e2 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1c9f0:	28 01 00 14	b	0x1ce90
   1c9f4:	a2 03 01 d1	sub	x2, x29, #0x40
   1c9f8:	bf 03 1c b8	stur	wzr, [x29, #-0x40]
   1c9fc:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   1ca00:	a1 83 5c f8	ldur	x1, [x29, #-0x38]
   1ca04:	24 e3 13 94	bl	0x515694 ; symbol stub for: _napi_get_array_length
   1ca08:	a8 03 5c b8	ldur	w8, [x29, #-0x40]
   1ca0c:	c8 02 00 35	cbnz	w8, 0x1ca64
   1ca10:	01 00 00 14	b	0x1ca14
   1ca14:	00 02 80 d2	mov	x0, #0x10
   1ca18:	ff e1 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1ca1c:	e0 53 00 f9	str	x0, [sp, #0xa0]
   1ca20:	e1 27 00 b0	adrp	x1, 1277 ; 0x519000
   1ca24:	21 a4 10 91	add	x1, x1, #0x429 ; literal pool for: "files must not be empty"
   1ca28:	0f e0 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   1ca2c:	01 00 00 14	b	0x1ca30
   1ca30:	e0 53 40 f9	ldr	x0, [sp, #0xa0]
   1ca34:	41 38 00 90	adrp	x1, 1800 ; 0x724000
   1ca38:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1ca3c:	42 38 00 90	adrp	x2, 1800 ; 0x724000
   1ca40:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1ca44:	0f e2 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1ca48:	e8 03 00 aa	mov	x8, x0
   1ca4c:	e0 53 40 f9	ldr	x0, [sp, #0xa0]
   1ca50:	a8 83 1d f8	stur	x8, [x29, #-0x28]
   1ca54:	e8 03 01 aa	mov	x8, x1
   1ca58:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
   1ca5c:	fd e1 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1ca60:	0c 01 00 14	b	0x1ce90
   1ca64:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   1ca68:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   1ca6c:	a8 63 01 d1	sub	x8, x29, #0x58
   1ca70:	e2 27 00 b0	adrp	x2, 1277 ; 0x519000
   1ca74:	42 ac 02 91	add	x2, x2, #0xab ; literal pool for: "outputPath"
   1ca78:	5f 9b ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
   1ca7c:	a0 83 01 d1	sub	x0, x29, #0x60
   1ca80:	07 01 00 94	bl	__ZN12_GLOBAL__N_114NewPdfDocumentC1Ev
   1ca84:	01 00 00 14	b	0x1ca88
   1ca88:	bf c3 19 b8	stur	wzr, [x29, #-0x64]
   1ca8c:	01 00 00 14	b	0x1ca90
   1ca90:	a8 c3 59 b8	ldur	w8, [x29, #-0x64]
   1ca94:	a9 03 5c b8	ldur	w9, [x29, #-0x40]
   1ca98:	08 01 09 6b	subs	w8, w8, w9
   1ca9c:	82 18 00 54	b.hs	0x1cdac
   1caa0:	01 00 00 14	b	0x1caa4
   1caa4:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   1caa8:	a1 83 5c f8	ldur	x1, [x29, #-0x38]
   1caac:	a2 c3 59 b8	ldur	w2, [x29, #-0x64]
   1cab0:	a3 c3 01 d1	sub	x3, x29, #0x70
   1cab4:	01 e3 13 94	bl	0x5156b8 ; symbol stub for: _napi_get_element
   1cab8:	01 00 00 14	b	0x1cabc
   1cabc:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   1cac0:	a1 03 59 f8	ldur	x1, [x29, #-0x70]
   1cac4:	a8 23 02 d1	sub	x8, x29, #0x88
   1cac8:	e2 27 00 90	adrp	x2, 1276 ; 0x518000
   1cacc:	42 78 3c 91	add	x2, x2, #0xf1e ; literal pool for: "filePath"
   1cad0:	49 9b ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
   1cad4:	01 00 00 14	b	0x1cad8
   1cad8:	e0 e3 04 91	add	x0, sp, #0x138
   1cadc:	a1 23 02 d1	sub	x1, x29, #0x88
   1cae0:	e3 9b ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentC1ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE
   1cae4:	01 00 00 14	b	0x1cae8
   1cae8:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   1caec:	e8 47 00 f9	str	x8, [sp, #0x88]
   1caf0:	a8 03 59 f8	ldur	x8, [x29, #-0x70]
   1caf4:	e8 4b 00 f9	str	x8, [sp, #0x90]
   1caf8:	e0 e3 04 91	add	x0, sp, #0x138
   1cafc:	e9 9b ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
   1cb00:	b7 a8 05 94	bl	_FPDF_GetPageCount
   1cb04:	e0 9f 00 b9	str	w0, [sp, #0x9c]
   1cb08:	01 00 00 14	b	0x1cb0c
   1cb0c:	e2 9f 40 b9	ldr	w2, [sp, #0x9c]
   1cb10:	e1 4b 40 f9	ldr	x1, [sp, #0x90]
   1cb14:	e0 47 40 f9	ldr	x0, [sp, #0x88]
   1cb18:	e8 83 04 91	add	x8, sp, #0x120
   1cb1c:	e7 9b ff 97	bl	__ZN12_GLOBAL__N_115ReadPageNumbersEP10napi_env__P12napi_value__i
   1cb20:	01 00 00 14	b	0x1cb24
   1cb24:	e0 23 04 91	add	x0, sp, #0x108
   1cb28:	e0 43 00 f9	str	x0, [sp, #0x80]
   1cb2c:	e1 aa ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEEC1B9nqe210106Ev
   1cb30:	e0 83 04 91	add	x0, sp, #0x120
   1cb34:	d3 9c ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE4sizeB9nqe210106Ev
   1cb38:	e1 03 00 aa	mov	x1, x0
   1cb3c:	e0 43 40 f9	ldr	x0, [sp, #0x80]
   1cb40:	e2 00 00 94	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEE7reserveEm
   1cb44:	01 00 00 14	b	0x1cb48
   1cb48:	e8 83 04 91	add	x8, sp, #0x120
   1cb4c:	e8 83 00 f9	str	x8, [sp, #0x100]
   1cb50:	e0 83 40 f9	ldr	x0, [sp, #0x100]
   1cb54:	11 01 00 94	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE5beginB9nqe210106Ev
   1cb58:	e0 7f 00 f9	str	x0, [sp, #0xf8]
   1cb5c:	e0 83 40 f9	ldr	x0, [sp, #0x100]
   1cb60:	1e 01 00 94	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE3endB9nqe210106Ev
   1cb64:	e0 7b 00 f9	str	x0, [sp, #0xf0]
   1cb68:	01 00 00 14	b	0x1cb6c
   1cb6c:	e0 e3 03 91	add	x0, sp, #0xf8
   1cb70:	e1 c3 03 91	add	x1, sp, #0xf0
   1cb74:	29 01 00 94	bl	__ZNSt3__1eqB9nqe210106IPKiEEbRKNS_11__wrap_iterIT_EES7_
   1cb78:	a0 04 00 37	tbnz	w0, #0x0, 0x1cc0c
   1cb7c:	01 00 00 14	b	0x1cb80
   1cb80:	e0 e3 03 91	add	x0, sp, #0xf8
   1cb84:	36 01 00 94	bl	__ZNKSt3__111__wrap_iterIPKiEdeB9nqe210106Ev
   1cb88:	08 00 40 b9	ldr	w8, [x0]
   1cb8c:	e8 ef 00 b9	str	w8, [sp, #0xec]
   1cb90:	e8 ef 40 b9	ldr	w8, [sp, #0xec]
   1cb94:	08 05 00 71	subs	w8, w8, #0x1
   1cb98:	e1 a3 03 91	add	x1, sp, #0xe8
   1cb9c:	e8 eb 00 b9	str	w8, [sp, #0xe8]
   1cba0:	e0 23 04 91	add	x0, sp, #0x108
   1cba4:	d9 aa ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEE9push_backB9nqe210106EOi
   1cba8:	01 00 00 14	b	0x1cbac
   1cbac:	01 00 00 14	b	0x1cbb0
   1cbb0:	e0 e3 03 91	add	x0, sp, #0xf8
   1cbb4:	30 01 00 94	bl	__ZNSt3__111__wrap_iterIPKiEppB9nqe210106Ev
   1cbb8:	ed ff ff 17	b	0x1cb6c
   1cbbc:	a0 83 1d f8	stur	x0, [x29, #-0x28]
   1cbc0:	e8 03 01 aa	mov	x8, x1
   1cbc4:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
   1cbc8:	af 00 00 14	b	0x1ce84
   1cbcc:	a0 83 1d f8	stur	x0, [x29, #-0x28]
   1cbd0:	e8 03 01 aa	mov	x8, x1
   1cbd4:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
   1cbd8:	a8 00 00 14	b	0x1ce78
   1cbdc:	a0 83 1d f8	stur	x0, [x29, #-0x28]
   1cbe0:	e8 03 01 aa	mov	x8, x1
   1cbe4:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
   1cbe8:	6e 00 00 14	b	0x1cda0
   1cbec:	a0 83 1d f8	stur	x0, [x29, #-0x28]
   1cbf0:	e8 03 01 aa	mov	x8, x1
   1cbf4:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
   1cbf8:	67 00 00 14	b	0x1cd94
   1cbfc:	a0 83 1d f8	stur	x0, [x29, #-0x28]
   1cc00:	e8 03 01 aa	mov	x8, x1
   1cc04:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
   1cc08:	5e 00 00 14	b	0x1cd80
   1cc0c:	a0 83 01 d1	sub	x0, x29, #0x60
   1cc10:	21 01 00 94	bl	__ZNK12_GLOBAL__N_114NewPdfDocument3getEv
   1cc14:	e0 3f 00 f9	str	x0, [sp, #0x78]
   1cc18:	01 00 00 14	b	0x1cc1c
   1cc1c:	e0 3f 40 f9	ldr	x0, [sp, #0x78]
   1cc20:	6f a8 05 94	bl	_FPDF_GetPageCount
   1cc24:	e0 77 00 b9	str	w0, [sp, #0x74]
   1cc28:	01 00 00 14	b	0x1cc2c
   1cc2c:	e8 77 40 b9	ldr	w8, [sp, #0x74]
   1cc30:	e8 e7 00 b9	str	w8, [sp, #0xe4]
   1cc34:	a0 83 01 d1	sub	x0, x29, #0x60
   1cc38:	17 01 00 94	bl	__ZNK12_GLOBAL__N_114NewPdfDocument3getEv
   1cc3c:	e0 37 00 f9	str	x0, [sp, #0x68]
   1cc40:	01 00 00 14	b	0x1cc44
   1cc44:	e0 e3 04 91	add	x0, sp, #0x138
   1cc48:	96 9b ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
   1cc4c:	e0 2b 00 f9	str	x0, [sp, #0x50]
   1cc50:	e0 23 04 91	add	x0, sp, #0x108
   1cc54:	e0 27 00 f9	str	x0, [sp, #0x48]
   1cc58:	15 01 00 94	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEE4dataB9nqe210106Ev
   1cc5c:	e1 03 00 aa	mov	x1, x0
   1cc60:	e0 27 40 f9	ldr	x0, [sp, #0x48]
   1cc64:	e1 2f 00 f9	str	x1, [sp, #0x58]
   1cc68:	86 9c ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE4sizeB9nqe210106Ev
   1cc6c:	e1 2b 40 f9	ldr	x1, [sp, #0x50]
   1cc70:	e2 2f 40 f9	ldr	x2, [sp, #0x58]
   1cc74:	e3 03 00 aa	mov	x3, x0
   1cc78:	e0 37 40 f9	ldr	x0, [sp, #0x68]
   1cc7c:	e4 e7 40 b9	ldr	w4, [sp, #0xe4]
   1cc80:	dd 9d 05 94	bl	_FPDF_ImportPagesByIndex
   1cc84:	e0 67 00 b9	str	w0, [sp, #0x64]
   1cc88:	01 00 00 14	b	0x1cc8c
   1cc8c:	e8 67 40 b9	ldr	w8, [sp, #0x64]
   1cc90:	e8 05 00 35	cbnz	w8, 0x1cd4c
   1cc94:	01 00 00 14	b	0x1cc98
   1cc98:	28 00 80 52	mov	w8, #0x1
   1cc9c:	08 01 00 12	and	w8, w8, #0x1
   1cca0:	08 01 00 12	and	w8, w8, #0x1
   1cca4:	e8 1f 03 39	strb	w8, [sp, #0xc7]
   1cca8:	00 02 80 d2	mov	x0, #0x10
   1ccac:	5a e1 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1ccb0:	e0 23 00 f9	str	x0, [sp, #0x40]
   1ccb4:	e8 23 03 91	add	x8, sp, #0xc8
   1ccb8:	e0 27 00 b0	adrp	x0, 1277 ; 0x519000
   1ccbc:	00 04 11 91	add	x0, x0, #0x441 ; literal pool for: "Failed to merge PDF "
   1ccc0:	a1 23 02 d1	sub	x1, x29, #0x88
   1ccc4:	21 e1 13 94	bl	0x515148 ; symbol stub for: __ZNSt3__1plIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_RKS9_
   1ccc8:	01 00 00 14	b	0x1cccc
   1cccc:	e0 23 40 f9	ldr	x0, [sp, #0x40]
   1ccd0:	e1 23 03 91	add	x1, sp, #0xc8
   1ccd4:	67 df 13 94	bl	0x514a70 ; symbol stub for: __ZNSt13runtime_errorC1ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
   1ccd8:	01 00 00 14	b	0x1ccdc
   1ccdc:	e0 23 40 f9	ldr	x0, [sp, #0x40]
   1cce0:	08 00 80 52	mov	w8, #0x0
   1cce4:	08 01 00 12	and	w8, w8, #0x1
   1cce8:	08 01 00 12	and	w8, w8, #0x1
   1ccec:	e8 1f 03 39	strb	w8, [sp, #0xc7]
   1ccf0:	41 38 00 90	adrp	x1, 1800 ; 0x724000
   1ccf4:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1ccf8:	42 38 00 90	adrp	x2, 1800 ; 0x724000
   1ccfc:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1cd00:	60 e1 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1cd04:	65 00 00 14	b	0x1ce98
   1cd08:	a0 83 1d f8	stur	x0, [x29, #-0x28]
   1cd0c:	e8 03 01 aa	mov	x8, x1
   1cd10:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
   1cd14:	07 00 00 14	b	0x1cd30
   1cd18:	a0 83 1d f8	stur	x0, [x29, #-0x28]
   1cd1c:	e8 03 01 aa	mov	x8, x1
   1cd20:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
   1cd24:	e0 23 03 91	add	x0, sp, #0xc8
   1cd28:	ca df 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1cd2c:	01 00 00 14	b	0x1cd30
   1cd30:	e8 1f 43 39	ldrb	w8, [sp, #0xc7]
   1cd34:	a8 00 00 36	tbz	w8, #0x0, 0x1cd48
   1cd38:	01 00 00 14	b	0x1cd3c
   1cd3c:	e0 23 40 f9	ldr	x0, [sp, #0x40]
   1cd40:	44 e1 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1cd44:	01 00 00 14	b	0x1cd48
   1cd48:	0e 00 00 14	b	0x1cd80
   1cd4c:	e0 23 04 91	add	x0, sp, #0x108
   1cd50:	49 9d ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
   1cd54:	e0 83 04 91	add	x0, sp, #0x120
   1cd58:	47 9d ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
   1cd5c:	e0 e3 04 91	add	x0, sp, #0x138
   1cd60:	50 9d ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
   1cd64:	a0 23 02 d1	sub	x0, x29, #0x88
   1cd68:	ba df 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1cd6c:	01 00 00 14	b	0x1cd70
   1cd70:	a8 c3 59 b8	ldur	w8, [x29, #-0x64]
   1cd74:	08 05 00 11	add	w8, w8, #0x1
   1cd78:	a8 c3 19 b8	stur	w8, [x29, #-0x64]
   1cd7c:	45 ff ff 17	b	0x1ca90
   1cd80:	e0 23 04 91	add	x0, sp, #0x108
   1cd84:	3c 9d ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
   1cd88:	e0 83 04 91	add	x0, sp, #0x120
   1cd8c:	3a 9d ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
   1cd90:	01 00 00 14	b	0x1cd94
   1cd94:	e0 e3 04 91	add	x0, sp, #0x138
   1cd98:	42 9d ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
   1cd9c:	01 00 00 14	b	0x1cda0
   1cda0:	a0 23 02 d1	sub	x0, x29, #0x88
   1cda4:	ab df 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1cda8:	34 00 00 14	b	0x1ce78
   1cdac:	a0 83 01 d1	sub	x0, x29, #0x60
   1cdb0:	b9 00 00 94	bl	__ZNK12_GLOBAL__N_114NewPdfDocument3getEv
   1cdb4:	e0 1f 00 f9	str	x0, [sp, #0x38]
   1cdb8:	01 00 00 14	b	0x1cdbc
   1cdbc:	e0 1f 40 f9	ldr	x0, [sp, #0x38]
   1cdc0:	a1 63 01 d1	sub	x1, x29, #0x58
   1cdc4:	2f bc ff 97	bl	__ZN12_GLOBAL__N_112SaveDocumentEP17fpdf_document_t__RKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE
   1cdc8:	01 00 00 14	b	0x1cdcc
   1cdcc:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   1cdd0:	d5 94 ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
   1cdd4:	e0 1b 00 f9	str	x0, [sp, #0x30]
   1cdd8:	01 00 00 14	b	0x1cddc
   1cddc:	e8 1b 40 f9	ldr	x8, [sp, #0x30]
   1cde0:	e8 5f 00 f9	str	x8, [sp, #0xb8]
   1cde4:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   1cde8:	e1 5f 40 f9	ldr	x1, [sp, #0xb8]
   1cdec:	e2 27 00 b0	adrp	x2, 1277 ; 0x519000
   1cdf0:	42 ac 02 91	add	x2, x2, #0xab ; literal pool for: "outputPath"
   1cdf4:	a3 63 01 d1	sub	x3, x29, #0x58
   1cdf8:	d7 9c ff 97	bl	__ZN12_GLOBAL__N_19SetStringEP10napi_env__P12napi_value__PKcRKNSt3__112basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEE
   1cdfc:	01 00 00 14	b	0x1ce00
   1ce00:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   1ce04:	e8 0f 00 f9	str	x8, [sp, #0x18]
   1ce08:	e8 5f 40 f9	ldr	x8, [sp, #0xb8]
   1ce0c:	e8 13 00 f9	str	x8, [sp, #0x20]
   1ce10:	a0 83 01 d1	sub	x0, x29, #0x60
   1ce14:	a0 00 00 94	bl	__ZNK12_GLOBAL__N_114NewPdfDocument3getEv
   1ce18:	e0 17 00 f9	str	x0, [sp, #0x28]
   1ce1c:	01 00 00 14	b	0x1ce20
   1ce20:	e0 17 40 f9	ldr	x0, [sp, #0x28]
   1ce24:	ee a7 05 94	bl	_FPDF_GetPageCount
   1ce28:	e0 17 00 b9	str	w0, [sp, #0x14]
   1ce2c:	01 00 00 14	b	0x1ce30
   1ce30:	e3 17 40 b9	ldr	w3, [sp, #0x14]
   1ce34:	e1 13 40 f9	ldr	x1, [sp, #0x20]
   1ce38:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
   1ce3c:	e2 27 00 90	adrp	x2, 1276 ; 0x518000
   1ce40:	42 ac 3d 91	add	x2, x2, #0xf6b ; literal pool for: "pageCount"
   1ce44:	b1 9c ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
   1ce48:	01 00 00 14	b	0x1ce4c
   1ce4c:	e8 5f 40 f9	ldr	x8, [sp, #0xb8]
   1ce50:	e8 07 00 f9	str	x8, [sp, #0x8]
   1ce54:	a0 83 01 d1	sub	x0, x29, #0x60
   1ce58:	9f 00 00 94	bl	__ZN12_GLOBAL__N_114NewPdfDocumentD1Ev
   1ce5c:	a0 63 01 d1	sub	x0, x29, #0x58
   1ce60:	7c df 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1ce64:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   1ce68:	ff c3 0b 91	add	sp, sp, #0x2f0
   1ce6c:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
   1ce70:	fc 6f c2 a8	ldp	x28, x27, [sp], #0x20
   1ce74:	c0 03 5f d6	ret
   1ce78:	a0 83 01 d1	sub	x0, x29, #0x60
   1ce7c:	96 00 00 94	bl	__ZN12_GLOBAL__N_114NewPdfDocumentD1Ev
   1ce80:	01 00 00 14	b	0x1ce84
   1ce84:	a0 63 01 d1	sub	x0, x29, #0x58
   1ce88:	72 df 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1ce8c:	01 00 00 14	b	0x1ce90
   1ce90:	a0 83 5d f8	ldur	x0, [x29, #-0x28]
   1ce94:	d0 de 13 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
   1ce98:	20 00 20 d4	brk	#0x1
