/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_113GetFormFieldsEP10napi_env__P12napi_value__:
   15ad0:	fc 6f be a9	stp	x28, x27, [sp, #-0x20]!
   15ad4:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
   15ad8:	fd 43 00 91	add	x29, sp, #0x10
   15adc:	ff c3 09 d1	sub	sp, sp, #0x270
   15ae0:	a0 83 1e f8	stur	x0, [x29, #-0x18]
   15ae4:	a1 03 1e f8	stur	x1, [x29, #-0x20]
   15ae8:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   15aec:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   15af0:	a8 e3 00 d1	sub	x8, x29, #0x38
   15af4:	e8 57 00 f9	str	x8, [sp, #0xa8]
   15af8:	02 28 00 f0	adrp	x2, 1283 ; 0x518000
   15afc:	42 78 3c 91	add	x2, x2, #0xf1e ; literal pool for: "filePath"
   15b00:	3d b7 ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
   15b04:	e1 57 40 f9	ldr	x1, [sp, #0xa8]
   15b08:	e0 23 04 91	add	x0, sp, #0x108
   15b0c:	d8 b7 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentC1ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE
   15b10:	01 00 00 14	b	0x15b14
   15b14:	e8 83 03 91	add	x8, sp, #0xe0
   15b18:	e0 23 04 91	add	x0, sp, #0x108
   15b1c:	b7 00 00 94	bl	__ZN12_GLOBAL__N_113InspectFieldsERKNS_11PdfDocumentE
   15b20:	01 00 00 14	b	0x15b24
   15b24:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   15b28:	e8 4f 00 f9	str	x8, [sp, #0x98]
   15b2c:	e0 83 03 91	add	x0, sp, #0xe0
   15b30:	85 01 00 94	bl	__ZNKSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEE4sizeB9nqe210106Ev
   15b34:	e1 03 00 aa	mov	x1, x0
   15b38:	e0 4f 40 f9	ldr	x0, [sp, #0x98]
   15b3c:	c4 b8 ff 97	bl	__ZN12_GLOBAL__N_15ArrayEP10napi_env__m
   15b40:	e0 53 00 f9	str	x0, [sp, #0xa0]
   15b44:	01 00 00 14	b	0x15b48
   15b48:	e8 53 40 f9	ldr	x8, [sp, #0xa0]
   15b4c:	e8 6f 00 f9	str	x8, [sp, #0xd8]
   15b50:	ff 6b 00 f9	str	xzr, [sp, #0xd0]
   15b54:	01 00 00 14	b	0x15b58
   15b58:	e8 6b 40 f9	ldr	x8, [sp, #0xd0]
   15b5c:	e8 4b 00 f9	str	x8, [sp, #0x90]
   15b60:	e0 83 03 91	add	x0, sp, #0xe0
   15b64:	78 01 00 94	bl	__ZNKSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEE4sizeB9nqe210106Ev
   15b68:	e8 4b 40 f9	ldr	x8, [sp, #0x90]
   15b6c:	08 01 00 eb	subs	x8, x8, x0
   15b70:	22 05 00 54	b.hs	0x15c14
   15b74:	01 00 00 14	b	0x15b78
   15b78:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   15b7c:	e8 37 00 f9	str	x8, [sp, #0x68]
   15b80:	e8 6f 40 f9	ldr	x8, [sp, #0xd8]
   15b84:	e8 3b 00 f9	str	x8, [sp, #0x70]
   15b88:	e8 6b 40 f9	ldr	x8, [sp, #0xd0]
   15b8c:	e8 7f 00 b9	str	w8, [sp, #0x7c]
   15b90:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   15b94:	e8 43 00 f9	str	x8, [sp, #0x80]
   15b98:	e1 6b 40 f9	ldr	x1, [sp, #0xd0]
   15b9c:	e0 83 03 91	add	x0, sp, #0xe0
   15ba0:	39 02 00 94	bl	__ZNKSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEEixB9nqe210106Em
   15ba4:	e1 03 00 aa	mov	x1, x0
   15ba8:	e0 43 40 f9	ldr	x0, [sp, #0x80]
   15bac:	70 01 00 94	bl	__ZN12_GLOBAL__N_111FieldObjectEP10napi_env__RKNS_5FieldE
   15bb0:	e0 47 00 f9	str	x0, [sp, #0x88]
   15bb4:	01 00 00 14	b	0x15bb8
   15bb8:	e3 47 40 f9	ldr	x3, [sp, #0x88]
   15bbc:	e2 7f 40 b9	ldr	w2, [sp, #0x7c]
   15bc0:	e1 3b 40 f9	ldr	x1, [sp, #0x70]
   15bc4:	e0 37 40 f9	ldr	x0, [sp, #0x68]
   15bc8:	d1 fe 13 94	bl	0x51570c ; symbol stub for: _napi_set_element
   15bcc:	01 00 00 14	b	0x15bd0
   15bd0:	01 00 00 14	b	0x15bd4
   15bd4:	e8 6b 40 f9	ldr	x8, [sp, #0xd0]
   15bd8:	08 05 00 91	add	x8, x8, #0x1
   15bdc:	e8 6b 00 f9	str	x8, [sp, #0xd0]
   15be0:	de ff ff 17	b	0x15b58
   15be4:	e0 83 00 f9	str	x0, [sp, #0x100]
   15be8:	e8 03 01 aa	mov	x8, x1
   15bec:	e8 ff 00 b9	str	w8, [sp, #0xfc]
   15bf0:	7d 00 00 14	b	0x15de4
   15bf4:	e0 83 00 f9	str	x0, [sp, #0x100]
   15bf8:	e8 03 01 aa	mov	x8, x1
   15bfc:	e8 ff 00 b9	str	w8, [sp, #0xfc]
   15c00:	76 00 00 14	b	0x15dd8
   15c04:	e0 83 00 f9	str	x0, [sp, #0x100]
   15c08:	e8 03 01 aa	mov	x8, x1
   15c0c:	e8 ff 00 b9	str	w8, [sp, #0xfc]
   15c10:	6f 00 00 14	b	0x15dcc
   15c14:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   15c18:	43 b1 ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
   15c1c:	e0 33 00 f9	str	x0, [sp, #0x60]
   15c20:	01 00 00 14	b	0x15c24
   15c24:	e8 33 40 f9	ldr	x8, [sp, #0x60]
   15c28:	e8 67 00 f9	str	x8, [sp, #0xc8]
   15c2c:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   15c30:	e8 27 00 f9	str	x8, [sp, #0x48]
   15c34:	e8 67 40 f9	ldr	x8, [sp, #0xc8]
   15c38:	e8 2b 00 f9	str	x8, [sp, #0x50]
   15c3c:	e0 23 04 91	add	x0, sp, #0x108
   15c40:	98 b7 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
   15c44:	66 c4 05 94	bl	_FPDF_GetPageCount
   15c48:	e0 5f 00 b9	str	w0, [sp, #0x5c]
   15c4c:	01 00 00 14	b	0x15c50
   15c50:	e3 5f 40 b9	ldr	w3, [sp, #0x5c]
   15c54:	e1 2b 40 f9	ldr	x1, [sp, #0x50]
   15c58:	e0 27 40 f9	ldr	x0, [sp, #0x48]
   15c5c:	02 28 00 f0	adrp	x2, 1283 ; 0x518000
   15c60:	42 ac 3d 91	add	x2, x2, #0xf6b ; literal pool for: "pageCount"
   15c64:	29 b9 ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
   15c68:	01 00 00 14	b	0x15c6c
   15c6c:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   15c70:	e8 23 00 f9	str	x8, [sp, #0x40]
   15c74:	e8 67 40 f9	ldr	x8, [sp, #0xc8]
   15c78:	e8 1f 00 f9	str	x8, [sp, #0x38]
   15c7c:	e0 83 03 91	add	x0, sp, #0xe0
   15c80:	0c 02 00 94	bl	__ZNKSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEE5emptyB9nqe210106Ev
   15c84:	e1 1f 40 f9	ldr	x1, [sp, #0x38]
   15c88:	e8 03 00 aa	mov	x8, x0
   15c8c:	e0 23 40 f9	ldr	x0, [sp, #0x40]
   15c90:	03 01 00 52	eor	w3, w8, #0x1
   15c94:	22 28 00 90	adrp	x2, 1284 ; 0x519000
   15c98:	42 44 0c 91	add	x2, x2, #0x311 ; literal pool for: "hasFormFields"
   15c9c:	21 d9 ff 97	bl	__ZN12_GLOBAL__N_17SetBoolEP10napi_env__P12napi_value__PKcb
   15ca0:	01 00 00 14	b	0x15ca4
   15ca4:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   15ca8:	e8 1b 00 f9	str	x8, [sp, #0x30]
   15cac:	e8 67 40 f9	ldr	x8, [sp, #0xc8]
   15cb0:	e8 17 00 f9	str	x8, [sp, #0x28]
   15cb4:	e0 83 03 91	add	x0, sp, #0xe0
   15cb8:	23 01 00 94	bl	__ZNKSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEE4sizeB9nqe210106Ev
   15cbc:	e1 17 40 f9	ldr	x1, [sp, #0x28]
   15cc0:	e8 03 00 aa	mov	x8, x0
   15cc4:	e0 1b 40 f9	ldr	x0, [sp, #0x30]
   15cc8:	e3 03 08 aa	mov	x3, x8
   15ccc:	22 28 00 90	adrp	x2, 1284 ; 0x519000
   15cd0:	42 7c 0c 91	add	x2, x2, #0x31f ; literal pool for: "fieldCount"
   15cd4:	0d b9 ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
   15cd8:	01 00 00 14	b	0x15cdc
   15cdc:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   15ce0:	e8 0b 00 f9	str	x8, [sp, #0x10]
   15ce4:	e8 67 40 f9	ldr	x8, [sp, #0xc8]
   15ce8:	e8 0f 00 f9	str	x8, [sp, #0x18]
   15cec:	e0 23 04 91	add	x0, sp, #0x108
   15cf0:	6c b7 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
   15cf4:	d8 c2 05 94	bl	_FPDF_GetFormType
   15cf8:	e0 27 00 b9	str	w0, [sp, #0x24]
   15cfc:	01 00 00 14	b	0x15d00
   15d00:	e0 27 40 b9	ldr	w0, [sp, #0x24]
   15d04:	f4 01 00 94	bl	__ZN12_GLOBAL__N_112FormTypeNameEi
   15d08:	e0 07 00 f9	str	x0, [sp, #0x8]
   15d0c:	01 00 00 14	b	0x15d10
   15d10:	e1 07 40 f9	ldr	x1, [sp, #0x8]
   15d14:	e0 c3 02 91	add	x0, sp, #0xb0
   15d18:	87 af ff 97	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106ILi0EEEPKc
   15d1c:	01 00 00 14	b	0x15d20
   15d20:	e1 0f 40 f9	ldr	x1, [sp, #0x18]
   15d24:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
   15d28:	22 28 00 90	adrp	x2, 1284 ; 0x519000
   15d2c:	42 a8 0c 91	add	x2, x2, #0x32a ; literal pool for: "formType"
   15d30:	e3 c3 02 91	add	x3, sp, #0xb0
   15d34:	08 b9 ff 97	bl	__ZN12_GLOBAL__N_19SetStringEP10napi_env__P12napi_value__PKcRKNSt3__112basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEE
   15d38:	01 00 00 14	b	0x15d3c
   15d3c:	e0 c3 02 91	add	x0, sp, #0xb0
   15d40:	c4 fb 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   15d44:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   15d48:	e1 67 40 f9	ldr	x1, [sp, #0xc8]
   15d4c:	22 28 00 90	adrp	x2, 1284 ; 0x519000
   15d50:	42 cc 0c 91	add	x2, x2, #0x333 ; literal pool for: "supportsXfa"
   15d54:	08 00 80 52	mov	w8, #0x0
   15d58:	03 01 00 12	and	w3, w8, #0x1
   15d5c:	f1 d8 ff 97	bl	__ZN12_GLOBAL__N_17SetBoolEP10napi_env__P12napi_value__PKcb
   15d60:	01 00 00 14	b	0x15d64
   15d64:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   15d68:	e1 67 40 f9	ldr	x1, [sp, #0xc8]
   15d6c:	e3 6f 40 f9	ldr	x3, [sp, #0xd8]
   15d70:	22 28 00 90	adrp	x2, 1284 ; 0x519000
   15d74:	42 e4 04 91	add	x2, x2, #0x139 ; literal pool for: "fields"
   15d78:	30 b9 ff 97	bl	__ZN12_GLOBAL__N_13SetEP10napi_env__P12napi_value__PKcS3_
   15d7c:	01 00 00 14	b	0x15d80
   15d80:	e8 67 40 f9	ldr	x8, [sp, #0xc8]
   15d84:	e8 03 00 f9	str	x8, [sp]
   15d88:	e0 83 03 91	add	x0, sp, #0xe0
   15d8c:	f4 01 00 94	bl	__ZNSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEED1B9nqe210106Ev
   15d90:	e0 23 04 91	add	x0, sp, #0x108
   15d94:	43 b9 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
   15d98:	a0 e3 00 d1	sub	x0, x29, #0x38
   15d9c:	ad fb 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   15da0:	e0 03 40 f9	ldr	x0, [sp]
   15da4:	ff c3 09 91	add	sp, sp, #0x270
   15da8:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
   15dac:	fc 6f c2 a8	ldp	x28, x27, [sp], #0x20
   15db0:	c0 03 5f d6	ret
   15db4:	e0 83 00 f9	str	x0, [sp, #0x100]
   15db8:	e8 03 01 aa	mov	x8, x1
   15dbc:	e8 ff 00 b9	str	w8, [sp, #0xfc]
   15dc0:	e0 c3 02 91	add	x0, sp, #0xb0
   15dc4:	a3 fb 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   15dc8:	01 00 00 14	b	0x15dcc
   15dcc:	e0 83 03 91	add	x0, sp, #0xe0
   15dd0:	e3 01 00 94	bl	__ZNSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEED1B9nqe210106Ev
   15dd4:	01 00 00 14	b	0x15dd8
   15dd8:	e0 23 04 91	add	x0, sp, #0x108
   15ddc:	31 b9 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
   15de0:	01 00 00 14	b	0x15de4
   15de4:	a0 e3 00 d1	sub	x0, x29, #0x38
   15de8:	9a fb 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   15dec:	01 00 00 14	b	0x15df0
   15df0:	e0 83 40 f9	ldr	x0, [sp, #0x100]
   15df4:	f8 fa 13 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
