/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_112SetTextFieldEP10napi_env__P20fpdf_form_handle_t__P13fpdf_page_t__P19fpdf_annotation_t__RKNSt3__17variantIJDnbdNS8_12basic_stringIcNS8_11char_traitsIcEENS8_9allocatorIcEEEEEEE:
   119b8:	ff 43 03 d1	sub	sp, sp, #0xd0
   119bc:	fd 7b 0c a9	stp	x29, x30, [sp, #0xc0]
   119c0:	fd 03 03 91	add	x29, sp, #0xc0
   119c4:	a0 03 1f f8	stur	x0, [x29, #-0x10]
   119c8:	a1 83 1e f8	stur	x1, [x29, #-0x18]
   119cc:	a2 03 1e f8	stur	x2, [x29, #-0x20]
   119d0:	a3 83 1d f8	stur	x3, [x29, #-0x28]
   119d4:	a4 03 1d f8	stur	x4, [x29, #-0x30]
   119d8:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   119dc:	a1 03 5d f8	ldur	x1, [x29, #-0x30]
   119e0:	a8 23 01 d1	sub	x8, x29, #0x48
   119e4:	e8 1b 00 f9	str	x8, [sp, #0x30]
   119e8:	4b 02 00 94	bl	__ZN12_GLOBAL__N_19TextValueEP10napi_env__RKNSt3__17variantIJDnbdNS2_12basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEEEE
   119ec:	e0 1b 40 f9	ldr	x0, [sp, #0x30]
   119f0:	e8 83 01 91	add	x8, sp, #0x60
   119f4:	89 02 00 94	bl	__ZN12_GLOBAL__N_17ToUtf16ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
   119f8:	01 00 00 14	b	0x119fc
   119fc:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11a00:	a1 83 5d f8	ldur	x1, [x29, #-0x28]
   11a04:	0e c8 05 94	bl	_FORM_SetFocusedAnnot
   11a08:	e0 2f 00 b9	str	w0, [sp, #0x2c]
   11a0c:	01 00 00 14	b	0x11a10
   11a10:	e8 2f 40 b9	ldr	w8, [sp, #0x2c]
   11a14:	48 01 00 34	cbz	w8, 0x11a3c
   11a18:	01 00 00 14	b	0x11a1c
   11a1c:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11a20:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   11a24:	5e c7 05 94	bl	_FORM_SelectAllText
   11a28:	e0 2b 00 b9	str	w0, [sp, #0x28]
   11a2c:	01 00 00 14	b	0x11a30
   11a30:	e8 2b 40 b9	ldr	w8, [sp, #0x28]
   11a34:	68 02 00 35	cbnz	w8, 0x11a80
   11a38:	01 00 00 14	b	0x11a3c
   11a3c:	09 00 80 52	mov	w9, #0x0
   11a40:	28 00 80 52	mov	w8, #0x1
   11a44:	29 01 00 12	and	w9, w9, #0x1
   11a48:	29 01 08 0a	and	w9, w9, w8
   11a4c:	a9 f3 1f 38	sturb	w9, [x29, #-0x1]
   11a50:	e8 53 00 b9	str	w8, [sp, #0x50]
   11a54:	2c 00 00 14	b	0x11b04
   11a58:	e0 2f 00 f9	str	x0, [sp, #0x58]
   11a5c:	e8 03 01 aa	mov	x8, x1
   11a60:	e8 57 00 b9	str	w8, [sp, #0x54]
   11a64:	31 00 00 14	b	0x11b28
   11a68:	e0 2f 00 f9	str	x0, [sp, #0x58]
   11a6c:	e8 03 01 aa	mov	x8, x1
   11a70:	e8 57 00 b9	str	w8, [sp, #0x54]
   11a74:	e0 83 01 91	add	x0, sp, #0x60
   11a78:	9e e2 ff 97	bl	__ZNSt3__112basic_stringIDsNS_11char_traitsIDsEENS_9allocatorIDsEEED1Ev
   11a7c:	2b 00 00 14	b	0x11b28
   11a80:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   11a84:	e8 13 00 f9	str	x8, [sp, #0x20]
   11a88:	a8 03 5e f8	ldur	x8, [x29, #-0x20]
   11a8c:	e8 0f 00 f9	str	x8, [sp, #0x18]
   11a90:	e0 83 01 91	add	x0, sp, #0x60
   11a94:	8f 02 00 94	bl	__ZNKSt3__112basic_stringIDsNS_11char_traitsIDsEENS_9allocatorIDsEEE5c_strB9nqe210106Ev
   11a98:	e1 0f 40 f9	ldr	x1, [sp, #0x18]
   11a9c:	e2 03 00 aa	mov	x2, x0
   11aa0:	e0 13 40 f9	ldr	x0, [sp, #0x20]
   11aa4:	21 c7 05 94	bl	_FORM_ReplaceSelection
   11aa8:	01 00 00 14	b	0x11aac
   11aac:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11ab0:	90 c7 05 94	bl	_FORM_ForceToKillFocus
   11ab4:	01 00 00 14	b	0x11ab8
   11ab8:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   11abc:	a1 83 5d f8	ldur	x1, [x29, #-0x28]
   11ac0:	e8 e3 00 91	add	x8, sp, #0x38
   11ac4:	03 02 00 94	bl	__ZN12_GLOBAL__N_114FormFieldValueEP20fpdf_form_handle_t__P19fpdf_annotation_t__
   11ac8:	01 00 00 14	b	0x11acc
   11acc:	e0 e3 00 91	add	x0, sp, #0x38
   11ad0:	e0 07 00 f9	str	x0, [sp, #0x8]
   11ad4:	a1 23 01 d1	sub	x1, x29, #0x48
   11ad8:	da 01 00 94	bl	__ZNSt3__1eqB9nqe210106IcNS_11char_traitsIcEENS_9allocatorIcEEEEbRKNS_12basic_stringIT_T0_T1_EESB_
   11adc:	e8 03 00 aa	mov	x8, x0
   11ae0:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   11ae4:	29 00 80 52	mov	w9, #0x1
   11ae8:	e9 17 00 b9	str	w9, [sp, #0x14]
   11aec:	08 01 09 0a	and	w8, w8, w9
   11af0:	a8 f3 1f 38	sturb	w8, [x29, #-0x1]
   11af4:	57 0c 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   11af8:	e8 17 40 b9	ldr	w8, [sp, #0x14]
   11afc:	e8 53 00 b9	str	w8, [sp, #0x50]
   11b00:	01 00 00 14	b	0x11b04
   11b04:	e0 83 01 91	add	x0, sp, #0x60
   11b08:	7a e2 ff 97	bl	__ZNSt3__112basic_stringIDsNS_11char_traitsIDsEENS_9allocatorIDsEEED1Ev
   11b0c:	a0 23 01 d1	sub	x0, x29, #0x48
   11b10:	50 0c 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   11b14:	a8 f3 5f 38	ldurb	w8, [x29, #-0x1]
   11b18:	00 01 00 12	and	w0, w8, #0x1
   11b1c:	fd 7b 4c a9	ldp	x29, x30, [sp, #0xc0]
   11b20:	ff 43 03 91	add	sp, sp, #0xd0
   11b24:	c0 03 5f d6	ret
   11b28:	a0 23 01 d1	sub	x0, x29, #0x48
   11b2c:	49 0c 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   11b30:	01 00 00 14	b	0x11b34
   11b34:	e0 2f 40 f9	ldr	x0, [sp, #0x58]
   11b38:	a7 0b 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
