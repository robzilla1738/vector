/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_113InspectFieldsERKNS_11PdfDocumentE:
   15df8:	ff 03 06 d1	sub	sp, sp, #0x180
   15dfc:	fc 6f 16 a9	stp	x28, x27, [sp, #0x160]
   15e00:	fd 7b 17 a9	stp	x29, x30, [sp, #0x170]
   15e04:	fd c3 05 91	add	x29, sp, #0x170
   15e08:	a9 53 01 d1	sub	x9, x29, #0x54
   15e0c:	e9 17 00 f9	str	x9, [sp, #0x28]
   15e10:	e8 13 00 f9	str	x8, [sp, #0x20]
   15e14:	e8 03 00 aa	mov	x8, x0
   15e18:	e0 13 40 f9	ldr	x0, [sp, #0x20]
   15e1c:	ea 03 00 aa	mov	x10, x0
   15e20:	2a c1 03 f8	stur	x10, [x9, #0x3c]
   15e24:	28 41 03 f8	stur	x8, [x9, #0x34]
   15e28:	08 00 80 52	mov	w8, #0x0
   15e2c:	08 01 00 12	and	w8, w8, #0x1
   15e30:	08 01 00 12	and	w8, w8, #0x1
   15e34:	a8 f3 1d 38	sturb	w8, [x29, #-0x21]
   15e38:	d4 01 00 94	bl	__ZNSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEEC1B9nqe210106Ev
   15e3c:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   15e40:	00 41 43 f8	ldur	x0, [x8, #0x34]
   15e44:	17 b7 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
   15e48:	e5 c3 05 94	bl	_FPDF_GetPageCount
   15e4c:	e0 33 00 b9	str	w0, [sp, #0x30]
   15e50:	01 00 00 14	b	0x15e54
   15e54:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   15e58:	e9 33 40 b9	ldr	w9, [sp, #0x30]
   15e5c:	09 2d 00 b9	str	w9, [x8, #0x2c]
   15e60:	1f 1d 00 b9	str	wzr, [x8, #0x1c]
   15e64:	01 00 00 14	b	0x15e68
   15e68:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   15e6c:	28 1d 40 b9	ldr	w8, [x9, #0x1c]
   15e70:	29 2d 40 b9	ldr	w9, [x9, #0x2c]
   15e74:	08 01 09 6b	subs	w8, w8, w9
   15e78:	4a 12 00 54	b.ge	0x160c0
   15e7c:	01 00 00 14	b	0x15e80
   15e80:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   15e84:	01 41 43 f8	ldur	x1, [x8, #0x34]
   15e88:	02 1d 40 b9	ldr	w2, [x8, #0x1c]
   15e8c:	a0 23 01 d1	sub	x0, x29, #0x48
   15e90:	0f b8 ff 97	bl	__ZN12_GLOBAL__N_17PdfPageC1ERKNS_11PdfDocumentEi
   15e94:	01 00 00 14	b	0x15e98
   15e98:	a0 23 01 d1	sub	x0, x29, #0x48
   15e9c:	1b b8 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   15ea0:	60 01 00 b5	cbnz	x0, 0x15ecc
   15ea4:	01 00 00 14	b	0x15ea8
   15ea8:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   15eac:	88 00 80 52	mov	w8, #0x4
   15eb0:	28 09 00 b9	str	w8, [x9, #0x8]
   15eb4:	73 00 00 14	b	0x16080
   15eb8:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   15ebc:	20 41 02 f8	stur	x0, [x9, #0x24]
   15ec0:	e8 03 01 aa	mov	x8, x1
   15ec4:	28 21 00 b9	str	w8, [x9, #0x20]
   15ec8:	99 00 00 14	b	0x1612c
   15ecc:	a0 23 01 d1	sub	x0, x29, #0x48
   15ed0:	0e b8 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   15ed4:	0f 89 05 94	bl	_FPDFPage_GetAnnotCount
   15ed8:	e0 1f 00 b9	str	w0, [sp, #0x1c]
   15edc:	01 00 00 14	b	0x15ee0
   15ee0:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   15ee4:	e9 1f 40 b9	ldr	w9, [sp, #0x1c]
   15ee8:	09 05 00 b9	str	w9, [x8, #0x4]
   15eec:	1f 01 00 b9	str	wzr, [x8]
   15ef0:	01 00 00 14	b	0x15ef4
   15ef4:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   15ef8:	28 01 40 b9	ldr	w8, [x9]
   15efc:	29 05 40 b9	ldr	w9, [x9, #0x4]
   15f00:	08 01 09 6b	subs	w8, w8, w9
   15f04:	8a 0b 00 54	b.ge	0x16074
   15f08:	01 00 00 14	b	0x15f0c
   15f0c:	a0 23 01 d1	sub	x0, x29, #0x48
   15f10:	fe b7 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   15f14:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   15f18:	01 01 40 b9	ldr	w1, [x8]
   15f1c:	23 89 05 94	bl	_FPDFPage_GetAnnot
   15f20:	e0 0b 00 f9	str	x0, [sp, #0x10]
   15f24:	01 00 00 14	b	0x15f28
   15f28:	e1 0b 40 f9	ldr	x1, [sp, #0x10]
   15f2c:	a0 83 01 d1	sub	x0, x29, #0x60
   15f30:	44 d6 ff 97	bl	__ZN12_GLOBAL__N_113PdfAnnotationC1EP19fpdf_annotation_t__
   15f34:	01 00 00 14	b	0x15f38
   15f38:	a0 83 01 d1	sub	x0, x29, #0x60
   15f3c:	4e d6 ff 97	bl	__ZNK12_GLOBAL__N_113PdfAnnotation3getEv
   15f40:	60 01 00 b4	cbz	x0, 0x15f6c
   15f44:	01 00 00 14	b	0x15f48
   15f48:	a0 83 01 d1	sub	x0, x29, #0x60
   15f4c:	4a d6 ff 97	bl	__ZNK12_GLOBAL__N_113PdfAnnotation3getEv
   15f50:	26 8a 05 94	bl	_FPDFAnnot_GetSubtype
   15f54:	e0 0f 00 b9	str	w0, [sp, #0xc]
   15f58:	01 00 00 14	b	0x15f5c
   15f5c:	e8 0f 40 b9	ldr	w8, [sp, #0xc]
   15f60:	08 51 00 71	subs	w8, w8, #0x14
   15f64:	00 02 00 54	b.eq	0x15fa4
   15f68:	01 00 00 14	b	0x15f6c
   15f6c:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   15f70:	e8 00 80 52	mov	w8, #0x7
   15f74:	28 09 00 b9	str	w8, [x9, #0x8]
   15f78:	2f 00 00 14	b	0x16034
   15f7c:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   15f80:	20 41 02 f8	stur	x0, [x9, #0x24]
   15f84:	e8 03 01 aa	mov	x8, x1
   15f88:	28 21 00 b9	str	w8, [x9, #0x20]
   15f8c:	4a 00 00 14	b	0x160b4
   15f90:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   15f94:	20 41 02 f8	stur	x0, [x9, #0x24]
   15f98:	e8 03 01 aa	mov	x8, x1
   15f9c:	28 21 00 b9	str	w8, [x9, #0x20]
   15fa0:	32 00 00 14	b	0x16068
   15fa4:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   15fa8:	00 41 43 f8	ldur	x0, [x8, #0x34]
   15fac:	51 ca ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument4formEv
   15fb0:	e0 03 00 f9	str	x0, [sp]
   15fb4:	a0 83 01 d1	sub	x0, x29, #0x60
   15fb8:	2f d6 ff 97	bl	__ZNK12_GLOBAL__N_113PdfAnnotation3getEv
   15fbc:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   15fc0:	e1 03 00 aa	mov	x1, x0
   15fc4:	e0 03 40 f9	ldr	x0, [sp]
   15fc8:	08 1d 40 b9	ldr	w8, [x8, #0x1c]
   15fcc:	02 05 00 11	add	w2, w8, #0x1
   15fd0:	e8 23 01 91	add	x8, sp, #0x48
   15fd4:	78 01 00 94	bl	__ZN12_GLOBAL__N_112InspectFieldEP20fpdf_form_handle_t__P19fpdf_annotation_t__i
   15fd8:	01 00 00 14	b	0x15fdc
   15fdc:	e8 23 01 91	add	x8, sp, #0x48
   15fe0:	00 21 00 91	add	x0, x8, #0x8
   15fe4:	e7 d0 ff 97	bl	__ZNKSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE5emptyB9nqe210106Ev
   15fe8:	c0 01 00 37	tbnz	w0, #0x0, 0x16020
   15fec:	01 00 00 14	b	0x15ff0
   15ff0:	e0 13 40 f9	ldr	x0, [sp, #0x20]
   15ff4:	e1 23 01 91	add	x1, sp, #0x48
   15ff8:	3a 02 00 94	bl	__ZNSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEE9push_backB9nqe210106EOS2_
   15ffc:	01 00 00 14	b	0x16000
   16000:	08 00 00 14	b	0x16020
   16004:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   16008:	20 41 02 f8	stur	x0, [x9, #0x24]
   1600c:	e8 03 01 aa	mov	x8, x1
   16010:	28 21 00 b9	str	w8, [x9, #0x20]
   16014:	e0 23 01 91	add	x0, sp, #0x48
   16018:	3d 02 00 94	bl	__ZN12_GLOBAL__N_15FieldD1Ev
   1601c:	13 00 00 14	b	0x16068
   16020:	e0 23 01 91	add	x0, sp, #0x48
   16024:	3a 02 00 94	bl	__ZN12_GLOBAL__N_15FieldD1Ev
   16028:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   1602c:	1f 09 00 b9	str	wzr, [x8, #0x8]
   16030:	01 00 00 14	b	0x16034
   16034:	a0 83 01 d1	sub	x0, x29, #0x60
   16038:	87 d7 ff 97	bl	__ZN12_GLOBAL__N_113PdfAnnotationD1Ev
   1603c:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   16040:	08 09 40 b9	ldr	w8, [x8, #0x8]
   16044:	68 00 00 34	cbz	w8, 0x16050
   16048:	01 00 00 14	b	0x1604c
   1604c:	02 00 00 14	b	0x16054
   16050:	01 00 00 14	b	0x16054
   16054:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   16058:	28 01 40 b9	ldr	w8, [x9]
   1605c:	08 05 00 11	add	w8, w8, #0x1
   16060:	28 01 00 b9	str	w8, [x9]
   16064:	a4 ff ff 17	b	0x15ef4
   16068:	a0 83 01 d1	sub	x0, x29, #0x60
   1606c:	7a d7 ff 97	bl	__ZN12_GLOBAL__N_113PdfAnnotationD1Ev
   16070:	11 00 00 14	b	0x160b4
   16074:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   16078:	1f 09 00 b9	str	wzr, [x8, #0x8]
   1607c:	01 00 00 14	b	0x16080
   16080:	a0 23 01 d1	sub	x0, x29, #0x48
   16084:	62 b8 ff 97	bl	__ZN12_GLOBAL__N_17PdfPageD1Ev
   16088:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   1608c:	08 09 40 b9	ldr	w8, [x8, #0x8]
   16090:	68 00 00 34	cbz	w8, 0x1609c
   16094:	01 00 00 14	b	0x16098
   16098:	02 00 00 14	b	0x160a0
   1609c:	01 00 00 14	b	0x160a0
   160a0:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   160a4:	28 1d 40 b9	ldr	w8, [x9, #0x1c]
   160a8:	08 05 00 11	add	w8, w8, #0x1
   160ac:	28 1d 00 b9	str	w8, [x9, #0x1c]
   160b0:	6e ff ff 17	b	0x15e68
   160b4:	a0 23 01 d1	sub	x0, x29, #0x48
   160b8:	55 b8 ff 97	bl	__ZN12_GLOBAL__N_17PdfPageD1Ev
   160bc:	1c 00 00 14	b	0x1612c
   160c0:	e0 13 40 f9	ldr	x0, [sp, #0x20]
   160c4:	2d 02 00 94	bl	__ZNSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEE5beginB9nqe210106Ev
   160c8:	e8 03 00 aa	mov	x8, x0
   160cc:	e0 13 40 f9	ldr	x0, [sp, #0x20]
   160d0:	e8 23 00 f9	str	x8, [sp, #0x40]
   160d4:	39 02 00 94	bl	__ZNSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEE3endB9nqe210106Ev
   160d8:	e0 1f 00 f9	str	x0, [sp, #0x38]
   160dc:	e0 23 40 f9	ldr	x0, [sp, #0x40]
   160e0:	e1 1f 40 f9	ldr	x1, [sp, #0x38]
   160e4:	15 02 00 94	bl	__ZNSt3__14sortB9nqe210106INS_11__wrap_iterIPN12_GLOBAL__N_15FieldEEEZNS2_13InspectFieldsERKNS2_11PdfDocumentEE3$_0EEvT_SA_T0_
   160e8:	01 00 00 14	b	0x160ec
   160ec:	e9 17 40 f9	ldr	x9, [sp, #0x28]
   160f0:	28 00 80 52	mov	w8, #0x1
   160f4:	0a 01 00 12	and	w10, w8, #0x1
   160f8:	4a 01 08 0a	and	w10, w10, w8
   160fc:	aa f3 1d 38	sturb	w10, [x29, #-0x21]
   16100:	28 09 00 b9	str	w8, [x9, #0x8]
   16104:	a8 f3 5d 38	ldurb	w8, [x29, #-0x21]
   16108:	a8 00 00 37	tbnz	w8, #0x0, 0x1611c
   1610c:	01 00 00 14	b	0x16110
   16110:	e0 13 40 f9	ldr	x0, [sp, #0x20]
   16114:	12 01 00 94	bl	__ZNSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEED1B9nqe210106Ev
   16118:	01 00 00 14	b	0x1611c
   1611c:	fd 7b 57 a9	ldp	x29, x30, [sp, #0x170]
   16120:	fc 6f 56 a9	ldp	x28, x27, [sp, #0x160]
   16124:	ff 03 06 91	add	sp, sp, #0x180
   16128:	c0 03 5f d6	ret
   1612c:	e0 13 40 f9	ldr	x0, [sp, #0x20]
   16130:	0b 01 00 94	bl	__ZNSt3__16vectorIN12_GLOBAL__N_15FieldENS_9allocatorIS2_EEED1B9nqe210106Ev
   16134:	01 00 00 14	b	0x16138
   16138:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   1613c:	00 41 42 f8	ldur	x0, [x8, #0x24]
   16140:	25 fa 13 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
