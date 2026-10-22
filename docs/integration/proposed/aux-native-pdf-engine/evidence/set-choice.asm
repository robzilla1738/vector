/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_114SetChoiceFieldEP10napi_env__P20fpdf_form_handle_t__P13fpdf_page_t__P19fpdf_annotation_t__RKNSt3__17variantIJDnbdNS8_12basic_stringIcNS8_11char_traitsIcEENS8_9allocatorIcEEEEEEE:
   11b68:	ff c3 03 d1	sub	sp, sp, #0xf0
   11b6c:	fd 7b 0e a9	stp	x29, x30, [sp, #0xe0]
   11b70:	fd 83 03 91	add	x29, sp, #0xe0
   11b74:	a0 03 1f f8	stur	x0, [x29, #-0x10]
   11b78:	a1 83 1e f8	stur	x1, [x29, #-0x18]
   11b7c:	a2 03 1e f8	stur	x2, [x29, #-0x20]
   11b80:	a3 83 1d f8	stur	x3, [x29, #-0x28]
   11b84:	a4 03 1d f8	stur	x4, [x29, #-0x30]
   11b88:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   11b8c:	a1 03 5d f8	ldur	x1, [x29, #-0x30]
   11b90:	a8 23 01 d1	sub	x8, x29, #0x48
   11b94:	e0 01 00 94	bl	__ZN12_GLOBAL__N_19TextValueEP10napi_env__RKNSt3__17variantIJDnbdNS2_12basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEEEE
   11b98:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11b9c:	a1 83 5d f8	ldur	x1, [x29, #-0x28]
   11ba0:	06 ae 05 94	bl	_FPDFAnnot_GetOptionCount
   11ba4:	e0 1f 00 b9	str	w0, [sp, #0x1c]
   11ba8:	01 00 00 14	b	0x11bac
   11bac:	e8 1f 40 b9	ldr	w8, [sp, #0x1c]
   11bb0:	a8 43 1b b8	stur	w8, [x29, #-0x4c]
   11bb4:	08 00 80 12	mov	w8, #-0x1
   11bb8:	a8 03 1a b8	stur	w8, [x29, #-0x60]
   11bbc:	a8 c3 19 b8	stur	w8, [x29, #-0x64]
   11bc0:	bf 83 19 b8	stur	wzr, [x29, #-0x68]
   11bc4:	01 00 00 14	b	0x11bc8
   11bc8:	a8 83 59 b8	ldur	w8, [x29, #-0x68]
   11bcc:	a9 43 5b b8	ldur	w9, [x29, #-0x4c]
   11bd0:	08 01 09 6b	subs	w8, w8, w9
   11bd4:	2a 06 00 54	b.ge	0x11c98
   11bd8:	01 00 00 14	b	0x11bdc
   11bdc:	e0 23 01 91	add	x0, sp, #0x48
   11be0:	a8 63 00 d1	sub	x8, x29, #0x18
   11be4:	e8 27 00 f9	str	x8, [sp, #0x48]
   11be8:	a8 a3 00 d1	sub	x8, x29, #0x28
   11bec:	e8 2b 00 f9	str	x8, [sp, #0x50]
   11bf0:	a8 a3 01 d1	sub	x8, x29, #0x68
   11bf4:	e8 2f 00 f9	str	x8, [sp, #0x58]
   11bf8:	e8 83 01 91	add	x8, sp, #0x60
   11bfc:	d6 0b 00 94	bl	__ZN12_GLOBAL__N_18ReadWideIZNS_14SetChoiceFieldEP10napi_env__P20fpdf_form_handle_t__P13fpdf_page_t__P19fpdf_annotation_t__RKNSt3__17variantIJDnbdNS9_12basic_stringIcNS9_11char_traitsIcEENS9_9allocatorIcEEEEEEEE3$_0EESG_T_
   11c00:	01 00 00 14	b	0x11c04
   11c04:	e0 83 01 91	add	x0, sp, #0x60
   11c08:	a1 23 01 d1	sub	x1, x29, #0x48
   11c0c:	8d 01 00 94	bl	__ZNSt3__1eqB9nqe210106IcNS_11char_traitsIcEENS_9allocatorIcEEEEbRKNS_12basic_stringIT_T0_T1_EESB_
   11c10:	20 01 00 36	tbz	w0, #0x0, 0x11c34
   11c14:	01 00 00 14	b	0x11c18
   11c18:	a8 83 59 b8	ldur	w8, [x29, #-0x68]
   11c1c:	a8 03 1a b8	stur	w8, [x29, #-0x60]
   11c20:	05 00 00 14	b	0x11c34
   11c24:	a0 83 1a f8	stur	x0, [x29, #-0x58]
   11c28:	e8 03 01 aa	mov	x8, x1
   11c2c:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   11c30:	71 00 00 14	b	0x11df4
   11c34:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11c38:	a1 83 5d f8	ldur	x1, [x29, #-0x28]
   11c3c:	a2 83 59 b8	ldur	w2, [x29, #-0x68]
   11c40:	2a ae 05 94	bl	_FPDFAnnot_IsOptionSelected
   11c44:	e0 1b 00 b9	str	w0, [sp, #0x18]
   11c48:	01 00 00 14	b	0x11c4c
   11c4c:	e8 1b 40 b9	ldr	w8, [sp, #0x18]
   11c50:	68 01 00 34	cbz	w8, 0x11c7c
   11c54:	01 00 00 14	b	0x11c58
   11c58:	a8 83 59 b8	ldur	w8, [x29, #-0x68]
   11c5c:	a8 c3 19 b8	stur	w8, [x29, #-0x64]
   11c60:	07 00 00 14	b	0x11c7c
   11c64:	a0 83 1a f8	stur	x0, [x29, #-0x58]
   11c68:	e8 03 01 aa	mov	x8, x1
   11c6c:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   11c70:	e0 83 01 91	add	x0, sp, #0x60
   11c74:	f7 0b 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   11c78:	5f 00 00 14	b	0x11df4
   11c7c:	e0 83 01 91	add	x0, sp, #0x60
   11c80:	f4 0b 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   11c84:	01 00 00 14	b	0x11c88
   11c88:	a8 83 59 b8	ldur	w8, [x29, #-0x68]
   11c8c:	08 05 00 11	add	w8, w8, #0x1
   11c90:	a8 83 19 b8	stur	w8, [x29, #-0x68]
   11c94:	cd ff ff 17	b	0x11bc8
   11c98:	a8 03 5a b8	ldur	w8, [x29, #-0x60]
   11c9c:	48 01 f8 37	tbnz	w8, #0x1f, 0x11cc4
   11ca0:	01 00 00 14	b	0x11ca4
   11ca4:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11ca8:	a1 83 5d f8	ldur	x1, [x29, #-0x28]
   11cac:	64 c7 05 94	bl	_FORM_SetFocusedAnnot
   11cb0:	e0 17 00 b9	str	w0, [sp, #0x14]
   11cb4:	01 00 00 14	b	0x11cb8
   11cb8:	e8 17 40 b9	ldr	w8, [sp, #0x14]
   11cbc:	28 01 00 35	cbnz	w8, 0x11ce0
   11cc0:	01 00 00 14	b	0x11cc4
   11cc4:	09 00 80 52	mov	w9, #0x0
   11cc8:	28 00 80 52	mov	w8, #0x1
   11ccc:	29 01 00 12	and	w9, w9, #0x1
   11cd0:	29 01 08 0a	and	w9, w9, w8
   11cd4:	a9 f3 1f 38	sturb	w9, [x29, #-0x1]
   11cd8:	e8 47 00 b9	str	w8, [sp, #0x44]
   11cdc:	3f 00 00 14	b	0x11dd8
   11ce0:	a8 c3 59 b8	ldur	w8, [x29, #-0x64]
   11ce4:	48 01 f8 36	tbz	w8, #0x1f, 0x11d0c
   11ce8:	01 00 00 14	b	0x11cec
   11cec:	03 00 80 52	mov	w3, #0x0
   11cf0:	bf c3 19 b8	stur	wzr, [x29, #-0x64]
   11cf4:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11cf8:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   11cfc:	82 04 80 52	mov	w2, #0x24
   11d00:	eb c5 05 94	bl	_FORM_OnKeyDown
   11d04:	01 00 00 14	b	0x11d08
   11d08:	01 00 00 14	b	0x11d0c
   11d0c:	aa c3 59 b8	ldur	w10, [x29, #-0x64]
   11d10:	ab 03 5a b8	ldur	w11, [x29, #-0x60]
   11d14:	c9 04 80 52	mov	w9, #0x26
   11d18:	08 05 80 52	mov	w8, #0x28
   11d1c:	4a 01 0b 6b	subs	w10, w10, w11
   11d20:	08 b1 89 1a	csel	w8, w8, w9, lt
   11d24:	e8 43 00 b9	str	w8, [sp, #0x40]
   11d28:	ff 3f 00 b9	str	wzr, [sp, #0x3c]
   11d2c:	01 00 00 14	b	0x11d30
   11d30:	e8 3f 40 b9	ldr	w8, [sp, #0x3c]
   11d34:	a9 03 5a b8	ldur	w9, [x29, #-0x60]
   11d38:	aa c3 59 b8	ldur	w10, [x29, #-0x64]
   11d3c:	29 01 0a 6b	subs	w9, w9, w10
   11d40:	2a 01 00 71	subs	w10, w9, #0x0
   11d44:	29 c5 89 5a	cneg	w9, w9, le
   11d48:	08 01 09 6b	subs	w8, w8, w9
   11d4c:	aa 01 00 54	b.ge	0x11d80
   11d50:	01 00 00 14	b	0x11d54
   11d54:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11d58:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   11d5c:	e2 43 40 b9	ldr	w2, [sp, #0x40]
   11d60:	03 00 80 52	mov	w3, #0x0
   11d64:	d2 c5 05 94	bl	_FORM_OnKeyDown
   11d68:	01 00 00 14	b	0x11d6c
   11d6c:	01 00 00 14	b	0x11d70
   11d70:	e8 3f 40 b9	ldr	w8, [sp, #0x3c]
   11d74:	08 05 00 11	add	w8, w8, #0x1
   11d78:	e8 3f 00 b9	str	w8, [sp, #0x3c]
   11d7c:	ed ff ff 17	b	0x11d30
   11d80:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11d84:	db c6 05 94	bl	_FORM_ForceToKillFocus
   11d88:	01 00 00 14	b	0x11d8c
   11d8c:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11d90:	a1 83 5d f8	ldur	x1, [x29, #-0x28]
   11d94:	e8 83 00 91	add	x8, sp, #0x20
   11d98:	4e 01 00 94	bl	__ZN12_GLOBAL__N_114FormFieldValueEP20fpdf_form_handle_t__P19fpdf_annotation_t__
   11d9c:	01 00 00 14	b	0x11da0
   11da0:	e0 83 00 91	add	x0, sp, #0x20
   11da4:	e0 07 00 f9	str	x0, [sp, #0x8]
   11da8:	a1 23 01 d1	sub	x1, x29, #0x48
   11dac:	25 01 00 94	bl	__ZNSt3__1eqB9nqe210106IcNS_11char_traitsIcEENS_9allocatorIcEEEEbRKNS_12basic_stringIT_T0_T1_EESB_
   11db0:	e8 03 00 aa	mov	x8, x0
   11db4:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   11db8:	29 00 80 52	mov	w9, #0x1
   11dbc:	e9 13 00 b9	str	w9, [sp, #0x10]
   11dc0:	08 01 09 0a	and	w8, w8, w9
   11dc4:	a8 f3 1f 38	sturb	w8, [x29, #-0x1]
   11dc8:	a2 0b 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   11dcc:	e8 13 40 b9	ldr	w8, [sp, #0x10]
   11dd0:	e8 47 00 b9	str	w8, [sp, #0x44]
   11dd4:	01 00 00 14	b	0x11dd8
   11dd8:	a0 23 01 d1	sub	x0, x29, #0x48
   11ddc:	9d 0b 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   11de0:	a8 f3 5f 38	ldurb	w8, [x29, #-0x1]
   11de4:	00 01 00 12	and	w0, w8, #0x1
   11de8:	fd 7b 4e a9	ldp	x29, x30, [sp, #0xe0]
   11dec:	ff c3 03 91	add	sp, sp, #0xf0
   11df0:	c0 03 5f d6	ret
   11df4:	a0 23 01 d1	sub	x0, x29, #0x48
   11df8:	96 0b 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   11dfc:	01 00 00 14	b	0x11e00
   11e00:	a0 83 5a f8	ldur	x0, [x29, #-0x58]
   11e04:	f4 0a 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
