/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_14FillEP10napi_env__P12napi_value__:
    aba8:	fc 6f be a9	stp	x28, x27, [sp, #-0x20]!
    abac:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
    abb0:	fd 43 00 91	add	x29, sp, #0x10
    abb4:	ff 43 0f d1	sub	sp, sp, #0x3d0
    abb8:	a0 83 1e f8	stur	x0, [x29, #-0x18]
    abbc:	a1 03 1e f8	stur	x1, [x29, #-0x20]
    abc0:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    abc4:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
    abc8:	a8 e3 00 d1	sub	x8, x29, #0x38
    abcc:	62 28 00 d0	adrp	x2, 1294 ; 0x518000
    abd0:	42 78 3c 91	add	x2, x2, #0xf1e ; literal pool for: "filePath"
    abd4:	08 e3 ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
    abd8:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    abdc:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
    abe0:	a8 43 01 d1	sub	x8, x29, #0x50
    abe4:	62 28 00 f0	adrp	x2, 1295 ; 0x519000
    abe8:	42 ac 02 91	add	x2, x2, #0xab ; literal pool for: "outputPath"
    abec:	02 e3 ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
    abf0:	01 00 00 14	b	0xabf4
    abf4:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    abf8:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
    abfc:	a8 e3 01 d1	sub	x8, x29, #0x78
    ac00:	ff 01 00 94	bl	__ZN12_GLOBAL__N_114ReadFillStatesEP10napi_env__P12napi_value__
    ac04:	01 00 00 14	b	0xac08
    ac08:	e0 a3 08 91	add	x0, sp, #0x228
    ac0c:	a1 e3 00 d1	sub	x1, x29, #0x38
    ac10:	97 e3 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentC1ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE
    ac14:	01 00 00 14	b	0xac18
    ac18:	e0 a3 08 91	add	x0, sp, #0x228
    ac1c:	a1 e3 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
    ac20:	0d ef 05 94	bl	_FPDF_GetFormType
    ac24:	e0 47 01 b9	str	w0, [sp, #0x144]
    ac28:	01 00 00 14	b	0xac2c
    ac2c:	e8 47 41 b9	ldr	w8, [sp, #0x144]
    ac30:	e8 27 02 b9	str	w8, [sp, #0x224]
    ac34:	e8 27 42 b9	ldr	w8, [sp, #0x224]
    ac38:	08 09 00 71	subs	w8, w8, #0x2
    ac3c:	c0 00 00 54	b.eq	0xac54
    ac40:	01 00 00 14	b	0xac44
    ac44:	e8 27 42 b9	ldr	w8, [sp, #0x224]
    ac48:	08 0d 00 71	subs	w8, w8, #0x3
    ac4c:	e1 04 00 54	b.ne	0xace8
    ac50:	01 00 00 14	b	0xac54
    ac54:	00 02 80 d2	mov	x0, #0x10
    ac58:	6f 29 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    ac5c:	e0 9f 00 f9	str	x0, [sp, #0x138]
    ac60:	61 28 00 f0	adrp	x1, 1295 ; 0x519000
    ac64:	21 d8 02 91	add	x1, x1, #0xb6 ; literal pool for: "XFA forms are not supported"
    ac68:	7f 27 14 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
    ac6c:	01 00 00 14	b	0xac70
    ac70:	e0 9f 40 f9	ldr	x0, [sp, #0x138]
    ac74:	c1 38 00 d0	adrp	x1, 1818 ; 0x724000
    ac78:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    ac7c:	c2 38 00 d0	adrp	x2, 1818 ; 0x724000
    ac80:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    ac84:	7f 29 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    ac88:	dc 01 00 14	b	0xb3f8
    ac8c:	a0 83 1a f8	stur	x0, [x29, #-0x58]
    ac90:	e8 03 01 aa	mov	x8, x1
    ac94:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
    ac98:	d3 01 00 14	b	0xb3e4
    ac9c:	a0 83 1a f8	stur	x0, [x29, #-0x58]
    aca0:	e8 03 01 aa	mov	x8, x1
    aca4:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
    aca8:	cc 01 00 14	b	0xb3d8
    acac:	a0 83 1a f8	stur	x0, [x29, #-0x58]
    acb0:	e8 03 01 aa	mov	x8, x1
    acb4:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
    acb8:	c5 01 00 14	b	0xb3cc
    acbc:	a0 83 1a f8	stur	x0, [x29, #-0x58]
    acc0:	e8 03 01 aa	mov	x8, x1
    acc4:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
    acc8:	be 01 00 14	b	0xb3c0
    accc:	e8 03 00 aa	mov	x8, x0
    acd0:	e0 9f 40 f9	ldr	x0, [sp, #0x138]
    acd4:	a8 83 1a f8	stur	x8, [x29, #-0x58]
    acd8:	e8 03 01 aa	mov	x8, x1
    acdc:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
    ace0:	5c 29 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    ace4:	b7 01 00 14	b	0xb3c0
    ace8:	e0 a3 08 91	add	x0, sp, #0x228
    acec:	6d e3 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
    acf0:	3b f0 05 94	bl	_FPDF_GetPageCount
    acf4:	e0 37 01 b9	str	w0, [sp, #0x134]
    acf8:	01 00 00 14	b	0xacfc
    acfc:	e8 37 41 b9	ldr	w8, [sp, #0x134]
    ad00:	e8 23 02 b9	str	w8, [sp, #0x220]
    ad04:	ff 1f 02 b9	str	wzr, [sp, #0x21c]
    ad08:	01 00 00 14	b	0xad0c
    ad0c:	e8 1f 42 b9	ldr	w8, [sp, #0x21c]
    ad10:	e9 23 42 b9	ldr	w9, [sp, #0x220]
    ad14:	08 01 09 6b	subs	w8, w8, w9
    ad18:	0a 16 00 54	b.ge	0xafd8
    ad1c:	01 00 00 14	b	0xad20
    ad20:	e2 1f 42 b9	ldr	w2, [sp, #0x21c]
    ad24:	e0 23 08 91	add	x0, sp, #0x208
    ad28:	e1 a3 08 91	add	x1, sp, #0x228
    ad2c:	68 e4 ff 97	bl	__ZN12_GLOBAL__N_17PdfPageC1ERKNS_11PdfDocumentEi
    ad30:	01 00 00 14	b	0xad34
    ad34:	e0 23 08 91	add	x0, sp, #0x208
    ad38:	74 e4 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
    ad3c:	a0 00 00 b5	cbnz	x0, 0xad50
    ad40:	01 00 00 14	b	0xad44
    ad44:	88 00 80 52	mov	w8, #0x4
    ad48:	e8 07 02 b9	str	w8, [sp, #0x204]
    ad4c:	95 00 00 14	b	0xafa0
    ad50:	e0 23 08 91	add	x0, sp, #0x208
    ad54:	6d e4 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
    ad58:	6e b5 05 94	bl	_FPDFPage_GetAnnotCount
    ad5c:	e0 33 01 b9	str	w0, [sp, #0x130]
    ad60:	01 00 00 14	b	0xad64
    ad64:	e8 33 41 b9	ldr	w8, [sp, #0x130]
    ad68:	e8 03 02 b9	str	w8, [sp, #0x200]
    ad6c:	ff ff 01 b9	str	wzr, [sp, #0x1fc]
    ad70:	01 00 00 14	b	0xad74
    ad74:	e8 ff 41 b9	ldr	w8, [sp, #0x1fc]
    ad78:	e9 03 42 b9	ldr	w9, [sp, #0x200]
    ad7c:	08 01 09 6b	subs	w8, w8, w9
    ad80:	ca 10 00 54	b.ge	0xaf98
    ad84:	01 00 00 14	b	0xad88
    ad88:	e0 23 08 91	add	x0, sp, #0x208
    ad8c:	5f e4 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
    ad90:	e1 ff 41 b9	ldr	w1, [sp, #0x1fc]
    ad94:	85 b5 05 94	bl	_FPDFPage_GetAnnot
    ad98:	e0 97 00 f9	str	x0, [sp, #0x128]
    ad9c:	01 00 00 14	b	0xada0
    ada0:	e1 97 40 f9	ldr	x1, [sp, #0x128]
    ada4:	e0 c3 07 91	add	x0, sp, #0x1f0
    ada8:	a6 02 00 94	bl	__ZN12_GLOBAL__N_113PdfAnnotationC1EP19fpdf_annotation_t__
    adac:	01 00 00 14	b	0xadb0
    adb0:	e0 c3 07 91	add	x0, sp, #0x1f0
    adb4:	b0 02 00 94	bl	__ZNK12_GLOBAL__N_113PdfAnnotation3getEv
    adb8:	e0 93 00 f9	str	x0, [sp, #0x120]
    adbc:	01 00 00 14	b	0xadc0
    adc0:	e8 93 40 f9	ldr	x8, [sp, #0x120]
    adc4:	c8 01 00 b4	cbz	x8, 0xadfc
    adc8:	01 00 00 14	b	0xadcc
    adcc:	e0 c3 07 91	add	x0, sp, #0x1f0
    add0:	a9 02 00 94	bl	__ZNK12_GLOBAL__N_113PdfAnnotation3getEv
    add4:	e0 8f 00 f9	str	x0, [sp, #0x118]
    add8:	01 00 00 14	b	0xaddc
    addc:	e0 8f 40 f9	ldr	x0, [sp, #0x118]
    ade0:	82 b6 05 94	bl	_FPDFAnnot_GetSubtype
    ade4:	e0 17 01 b9	str	w0, [sp, #0x114]
    ade8:	01 00 00 14	b	0xadec
    adec:	e8 17 41 b9	ldr	w8, [sp, #0x114]
    adf0:	08 51 00 71	subs	w8, w8, #0x14
    adf4:	a0 01 00 54	b.eq	0xae28
    adf8:	01 00 00 14	b	0xadfc
    adfc:	e8 00 80 52	mov	w8, #0x7
    ae00:	e8 07 02 b9	str	w8, [sp, #0x204]
    ae04:	57 00 00 14	b	0xaf60
    ae08:	a0 83 1a f8	stur	x0, [x29, #-0x58]
    ae0c:	e8 03 01 aa	mov	x8, x1
    ae10:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
    ae14:	6e 00 00 14	b	0xafcc
    ae18:	a0 83 1a f8	stur	x0, [x29, #-0x58]
    ae1c:	e8 03 01 aa	mov	x8, x1
    ae20:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
    ae24:	5a 00 00 14	b	0xaf8c
    ae28:	e0 a3 08 91	add	x0, sp, #0x228
    ae2c:	b1 f6 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument4formEv
    ae30:	e0 83 00 f9	str	x0, [sp, #0x100]
    ae34:	e0 c3 07 91	add	x0, sp, #0x1f0
    ae38:	8f 02 00 94	bl	__ZNK12_GLOBAL__N_113PdfAnnotation3getEv
    ae3c:	e0 87 00 f9	str	x0, [sp, #0x108]
    ae40:	01 00 00 14	b	0xae44
    ae44:	e1 87 40 f9	ldr	x1, [sp, #0x108]
    ae48:	e0 83 40 f9	ldr	x0, [sp, #0x100]
    ae4c:	e8 63 07 91	add	x8, sp, #0x1d8
    ae50:	8f 02 00 94	bl	__ZN12_GLOBAL__N_113FormFieldNameEP20fpdf_form_handle_t__P19fpdf_annotation_t__
    ae54:	01 00 00 14	b	0xae58
    ae58:	a0 e3 01 d1	sub	x0, x29, #0x78
    ae5c:	e1 63 07 91	add	x1, sp, #0x1d8
    ae60:	9c 02 00 94	bl	__ZNSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEE4findB9nqe210106ERSC_
    ae64:	e0 7f 00 f9	str	x0, [sp, #0xf8]
    ae68:	01 00 00 14	b	0xae6c
    ae6c:	e8 7f 40 f9	ldr	x8, [sp, #0xf8]
    ae70:	e9 43 07 91	add	x9, sp, #0x1d0
    ae74:	e9 77 00 f9	str	x9, [sp, #0xe8]
    ae78:	e8 eb 00 f9	str	x8, [sp, #0x1d0]
    ae7c:	a0 e3 01 d1	sub	x0, x29, #0x78
    ae80:	af 02 00 94	bl	__ZNSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEE3endB9nqe210106Ev
    ae84:	e8 03 00 aa	mov	x8, x0
    ae88:	e0 77 40 f9	ldr	x0, [sp, #0xe8]
    ae8c:	e1 23 07 91	add	x1, sp, #0x1c8
    ae90:	e8 e7 00 f9	str	x8, [sp, #0x1c8]
    ae94:	9f 02 00 94	bl	__ZNSt3__1neB9nqe210106ERKNS_14__map_iteratorINS_15__tree_iteratorINS_12__value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateEEEPNS_11__tree_nodeISB_PvEElEEEESJ_
    ae98:	e0 f7 00 b9	str	w0, [sp, #0xf4]
    ae9c:	01 00 00 14	b	0xaea0
    aea0:	e8 f7 40 b9	ldr	w8, [sp, #0xf4]
    aea4:	68 05 00 36	tbz	w8, #0x0, 0xaf50
    aea8:	01 00 00 14	b	0xaeac
    aeac:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
    aeb0:	e8 6b 00 f9	str	x8, [sp, #0xd0]
    aeb4:	e0 23 08 91	add	x0, sp, #0x208
    aeb8:	14 e4 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
    aebc:	e0 6f 00 f9	str	x0, [sp, #0xd8]
    aec0:	e0 c3 07 91	add	x0, sp, #0x1f0
    aec4:	6c 02 00 94	bl	__ZNK12_GLOBAL__N_113PdfAnnotation3getEv
    aec8:	e0 73 00 f9	str	x0, [sp, #0xe0]
    aecc:	01 00 00 14	b	0xaed0
    aed0:	e0 a3 08 91	add	x0, sp, #0x228
    aed4:	87 f6 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument4formEv
    aed8:	e0 63 00 f9	str	x0, [sp, #0xc0]
    aedc:	e0 c3 07 91	add	x0, sp, #0x1f0
    aee0:	65 02 00 94	bl	__ZNK12_GLOBAL__N_113PdfAnnotation3getEv
    aee4:	e0 67 00 f9	str	x0, [sp, #0xc8]
    aee8:	01 00 00 14	b	0xaeec
    aeec:	e1 67 40 f9	ldr	x1, [sp, #0xc8]
    aef0:	e0 63 40 f9	ldr	x0, [sp, #0xc0]
    aef4:	92 c8 05 94	bl	_FPDFAnnot_GetFormFieldType
    aef8:	e0 bf 00 b9	str	w0, [sp, #0xbc]
    aefc:	01 00 00 14	b	0xaf00
    af00:	e0 43 07 91	add	x0, sp, #0x1d0
    af04:	ca 03 00 94	bl	__ZNKSt3__114__map_iteratorINS_15__tree_iteratorINS_12__value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateEEEPNS_11__tree_nodeISB_PvEElEEEptB9nqe210106Ev
    af08:	e0 5b 00 f9	str	x0, [sp, #0xb0]
    af0c:	01 00 00 14	b	0xaf10
    af10:	e4 bf 40 b9	ldr	w4, [sp, #0xbc]
    af14:	e3 73 40 f9	ldr	x3, [sp, #0xe0]
    af18:	e2 6f 40 f9	ldr	x2, [sp, #0xd8]
    af1c:	e0 6b 40 f9	ldr	x0, [sp, #0xd0]
    af20:	e8 5b 40 f9	ldr	x8, [sp, #0xb0]
    af24:	05 61 00 91	add	x5, x8, #0x18
    af28:	e1 a3 08 91	add	x1, sp, #0x228
    af2c:	92 02 00 94	bl	__ZN12_GLOBAL__N_110FillWidgetEP10napi_env__RKNS_11PdfDocumentEP13fpdf_page_t__P19fpdf_annotation_t__iPNS_9FillStateE
    af30:	01 00 00 14	b	0xaf34
    af34:	07 00 00 14	b	0xaf50
    af38:	a0 83 1a f8	stur	x0, [x29, #-0x58]
    af3c:	e8 03 01 aa	mov	x8, x1
    af40:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
    af44:	e0 63 07 91	add	x0, sp, #0x1d8
    af48:	42 27 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    af4c:	10 00 00 14	b	0xaf8c
    af50:	e0 63 07 91	add	x0, sp, #0x1d8
    af54:	3f 27 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    af58:	ff 07 02 b9	str	wzr, [sp, #0x204]
    af5c:	01 00 00 14	b	0xaf60
    af60:	e0 c3 07 91	add	x0, sp, #0x1f0
    af64:	bc 03 00 94	bl	__ZN12_GLOBAL__N_113PdfAnnotationD1Ev
    af68:	e8 07 42 b9	ldr	w8, [sp, #0x204]
    af6c:	68 00 00 34	cbz	w8, 0xaf78
    af70:	01 00 00 14	b	0xaf74
    af74:	02 00 00 14	b	0xaf7c
    af78:	01 00 00 14	b	0xaf7c
    af7c:	e8 ff 41 b9	ldr	w8, [sp, #0x1fc]
    af80:	08 05 00 11	add	w8, w8, #0x1
    af84:	e8 ff 01 b9	str	w8, [sp, #0x1fc]
    af88:	7b ff ff 17	b	0xad74
    af8c:	e0 c3 07 91	add	x0, sp, #0x1f0
    af90:	b1 03 00 94	bl	__ZN12_GLOBAL__N_113PdfAnnotationD1Ev
    af94:	0e 00 00 14	b	0xafcc
    af98:	ff 07 02 b9	str	wzr, [sp, #0x204]
    af9c:	01 00 00 14	b	0xafa0
    afa0:	e0 23 08 91	add	x0, sp, #0x208
    afa4:	9a e4 ff 97	bl	__ZN12_GLOBAL__N_17PdfPageD1Ev
    afa8:	e8 07 42 b9	ldr	w8, [sp, #0x204]
    afac:	68 00 00 34	cbz	w8, 0xafb8
    afb0:	01 00 00 14	b	0xafb4
    afb4:	02 00 00 14	b	0xafbc
    afb8:	01 00 00 14	b	0xafbc
    afbc:	e8 1f 42 b9	ldr	w8, [sp, #0x21c]
    afc0:	08 05 00 11	add	w8, w8, #0x1
    afc4:	e8 1f 02 b9	str	w8, [sp, #0x21c]
    afc8:	51 ff ff 17	b	0xad0c
    afcc:	e0 23 08 91	add	x0, sp, #0x208
    afd0:	8f e4 ff 97	bl	__ZN12_GLOBAL__N_17PdfPageD1Ev
    afd4:	fb 00 00 14	b	0xb3c0
    afd8:	e0 a3 08 91	add	x0, sp, #0x228
    afdc:	b1 e2 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
    afe0:	a1 43 01 d1	sub	x1, x29, #0x50
    afe4:	a7 03 00 94	bl	__ZN12_GLOBAL__N_112SaveDocumentEP17fpdf_document_t__RKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE
    afe8:	01 00 00 14	b	0xafec
    afec:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    aff0:	01 00 80 d2	mov	x1, #0x0
    aff4:	96 e3 ff 97	bl	__ZN12_GLOBAL__N_15ArrayEP10napi_env__m
    aff8:	e0 57 00 f9	str	x0, [sp, #0xa8]
    affc:	01 00 00 14	b	0xb000
    b000:	e8 57 40 f9	ldr	x8, [sp, #0xa8]
    b004:	e8 e3 00 f9	str	x8, [sp, #0x1c0]
    b008:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b00c:	01 00 80 d2	mov	x1, #0x0
    b010:	8f e3 ff 97	bl	__ZN12_GLOBAL__N_15ArrayEP10napi_env__m
    b014:	e0 53 00 f9	str	x0, [sp, #0xa0]
    b018:	01 00 00 14	b	0xb01c
    b01c:	e8 53 40 f9	ldr	x8, [sp, #0xa0]
    b020:	e8 df 00 f9	str	x8, [sp, #0x1b8]
    b024:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b028:	01 00 80 d2	mov	x1, #0x0
    b02c:	88 e3 ff 97	bl	__ZN12_GLOBAL__N_15ArrayEP10napi_env__m
    b030:	e0 4f 00 f9	str	x0, [sp, #0x98]
    b034:	01 00 00 14	b	0xb038
    b038:	e8 4f 40 f9	ldr	x8, [sp, #0x98]
    b03c:	e8 db 00 f9	str	x8, [sp, #0x1b0]
    b040:	ff af 01 b9	str	wzr, [sp, #0x1ac]
    b044:	ff ab 01 b9	str	wzr, [sp, #0x1a8]
    b048:	ff a7 01 b9	str	wzr, [sp, #0x1a4]
    b04c:	a8 e3 01 d1	sub	x8, x29, #0x78
    b050:	e8 cf 00 f9	str	x8, [sp, #0x198]
    b054:	e0 cf 40 f9	ldr	x0, [sp, #0x198]
    b058:	fe 03 00 94	bl	__ZNSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEE5beginB9nqe210106Ev
    b05c:	e0 cb 00 f9	str	x0, [sp, #0x190]
    b060:	e0 cf 40 f9	ldr	x0, [sp, #0x198]
    b064:	36 02 00 94	bl	__ZNSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEE3endB9nqe210106Ev
    b068:	e0 c7 00 f9	str	x0, [sp, #0x188]
    b06c:	01 00 00 14	b	0xb070
    b070:	e0 43 06 91	add	x0, sp, #0x190
    b074:	e1 23 06 91	add	x1, sp, #0x188
    b078:	26 02 00 94	bl	__ZNSt3__1neB9nqe210106ERKNS_14__map_iteratorINS_15__tree_iteratorINS_12__value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateEEEPNS_11__tree_nodeISB_PvEElEEEESJ_
    b07c:	e0 97 00 b9	str	w0, [sp, #0x94]
    b080:	01 00 00 14	b	0xb084
    b084:	e8 97 40 b9	ldr	w8, [sp, #0x94]
    b088:	c8 0f 00 36	tbz	w8, #0x0, 0xb280
    b08c:	01 00 00 14	b	0xb090
    b090:	e0 43 06 91	add	x0, sp, #0x190
    b094:	fd 03 00 94	bl	__ZNKSt3__114__map_iteratorINS_15__tree_iteratorINS_12__value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateEEEPNS_11__tree_nodeISB_PvEElEEEdeB9nqe210106Ev
    b098:	e0 47 00 f9	str	x0, [sp, #0x88]
    b09c:	01 00 00 14	b	0xb0a0
    b0a0:	e8 47 40 f9	ldr	x8, [sp, #0x88]
    b0a4:	e8 c3 00 f9	str	x8, [sp, #0x180]
    b0a8:	e0 c3 40 f9	ldr	x0, [sp, #0x180]
    b0ac:	00 04 00 94	bl	__ZNSt3__13getB9nqe210106ILm0EKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateEEERKNS_13tuple_elementIXT_ENS_4pairIT0_T1_EEE4typeERKSE_
    b0b0:	e0 bf 00 f9	str	x0, [sp, #0x178]
    b0b4:	e0 c3 40 f9	ldr	x0, [sp, #0x180]
    b0b8:	06 04 00 94	bl	__ZNSt3__13getB9nqe210106ILm1EKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateEEERKNS_13tuple_elementIXT_ENS_4pairIT0_T1_EEE4typeERKSE_
    b0bc:	e0 bb 00 f9	str	x0, [sp, #0x170]
    b0c0:	e8 bb 40 f9	ldr	x8, [sp, #0x170]
    b0c4:	08 85 40 39	ldrb	w8, [x8, #0x21]
    b0c8:	c8 02 00 36	tbz	w8, #0x0, 0xb120
    b0cc:	01 00 00 14	b	0xb0d0
    b0d0:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
    b0d4:	e8 37 00 f9	str	x8, [sp, #0x68]
    b0d8:	e8 e3 40 f9	ldr	x8, [sp, #0x1c0]
    b0dc:	e8 3b 00 f9	str	x8, [sp, #0x70]
    b0e0:	e8 af 41 b9	ldr	w8, [sp, #0x1ac]
    b0e4:	e8 7f 00 b9	str	w8, [sp, #0x7c]
    b0e8:	08 05 00 11	add	w8, w8, #0x1
    b0ec:	e8 af 01 b9	str	w8, [sp, #0x1ac]
    b0f0:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b0f4:	e1 bf 40 f9	ldr	x1, [sp, #0x178]
    b0f8:	b0 fd ff 97	bl	__ZN12_GLOBAL__N_16StringEP10napi_env__RKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE
    b0fc:	e0 43 00 f9	str	x0, [sp, #0x80]
    b100:	01 00 00 14	b	0xb104
    b104:	e3 43 40 f9	ldr	x3, [sp, #0x80]
    b108:	e2 7f 40 b9	ldr	w2, [sp, #0x7c]
    b10c:	e1 3b 40 f9	ldr	x1, [sp, #0x70]
    b110:	e0 37 40 f9	ldr	x0, [sp, #0x68]
    b114:	7e 29 14 94	bl	0x51570c ; symbol stub for: _napi_set_element
    b118:	01 00 00 14	b	0xb11c
    b11c:	54 00 00 14	b	0xb26c
    b120:	e8 bb 40 f9	ldr	x8, [sp, #0x170]
    b124:	08 81 40 39	ldrb	w8, [x8, #0x20]
    b128:	c8 02 00 37	tbnz	w8, #0x0, 0xb180
    b12c:	01 00 00 14	b	0xb130
    b130:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
    b134:	e8 27 00 f9	str	x8, [sp, #0x48]
    b138:	e8 df 40 f9	ldr	x8, [sp, #0x1b8]
    b13c:	e8 2b 00 f9	str	x8, [sp, #0x50]
    b140:	e8 ab 41 b9	ldr	w8, [sp, #0x1a8]
    b144:	e8 5f 00 b9	str	w8, [sp, #0x5c]
    b148:	08 05 00 11	add	w8, w8, #0x1
    b14c:	e8 ab 01 b9	str	w8, [sp, #0x1a8]
    b150:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b154:	e1 bf 40 f9	ldr	x1, [sp, #0x178]
    b158:	98 fd ff 97	bl	__ZN12_GLOBAL__N_16StringEP10napi_env__RKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE
    b15c:	e0 33 00 f9	str	x0, [sp, #0x60]
    b160:	01 00 00 14	b	0xb164
    b164:	e3 33 40 f9	ldr	x3, [sp, #0x60]
    b168:	e2 5f 40 b9	ldr	w2, [sp, #0x5c]
    b16c:	e1 2b 40 f9	ldr	x1, [sp, #0x50]
    b170:	e0 27 40 f9	ldr	x0, [sp, #0x48]
    b174:	66 29 14 94	bl	0x51570c ; symbol stub for: _napi_set_element
    b178:	01 00 00 14	b	0xb17c
    b17c:	3b 00 00 14	b	0xb268
    b180:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b184:	e8 db ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
    b188:	e0 23 00 f9	str	x0, [sp, #0x40]
    b18c:	01 00 00 14	b	0xb190
    b190:	e8 23 40 f9	ldr	x8, [sp, #0x40]
    b194:	e8 b7 00 f9	str	x8, [sp, #0x168]
    b198:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b19c:	e1 b7 40 f9	ldr	x1, [sp, #0x168]
    b1a0:	e3 bf 40 f9	ldr	x3, [sp, #0x178]
    b1a4:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b1a8:	42 48 03 91	add	x2, x2, #0xd2 ; literal pool for: "field_id"
    b1ac:	ea e3 ff 97	bl	__ZN12_GLOBAL__N_19SetStringEP10napi_env__P12napi_value__PKcRKNSt3__112basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEE
    b1b0:	01 00 00 14	b	0xb1b4
    b1b4:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
    b1b8:	e8 1b 00 f9	str	x8, [sp, #0x30]
    b1bc:	e8 b7 40 f9	ldr	x8, [sp, #0x168]
    b1c0:	e8 1f 00 f9	str	x8, [sp, #0x38]
    b1c4:	e8 bb 40 f9	ldr	x8, [sp, #0x170]
    b1c8:	00 a1 00 91	add	x0, x8, #0x28
    b1cc:	6d fc ff 97	bl	__ZNKSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE5emptyB9nqe210106Ev
    b1d0:	00 01 00 36	tbz	w0, #0x0, 0xb1f0
    b1d4:	01 00 00 14	b	0xb1d8
    b1d8:	e0 43 05 91	add	x0, sp, #0x150
    b1dc:	61 28 00 d0	adrp	x1, 1294 ; 0x519000
    b1e0:	21 8c 03 91	add	x1, x1, #0xe3 ; literal pool for: "No matching field option"
    b1e4:	54 da ff 97	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106ILi0EEEPKc
    b1e8:	01 00 00 14	b	0xb1ec
    b1ec:	07 00 00 14	b	0xb208
    b1f0:	e8 bb 40 f9	ldr	x8, [sp, #0x170]
    b1f4:	01 a1 00 91	add	x1, x8, #0x28
    b1f8:	e0 43 05 91	add	x0, sp, #0x150
    b1fc:	92 26 14 94	bl	0x514c44 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_
    b200:	01 00 00 14	b	0xb204
    b204:	01 00 00 14	b	0xb208
    b208:	e1 1f 40 f9	ldr	x1, [sp, #0x38]
    b20c:	e0 1b 40 f9	ldr	x0, [sp, #0x30]
    b210:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b214:	42 6c 03 91	add	x2, x2, #0xdb ; literal pool for: "message"
    b218:	e3 43 05 91	add	x3, sp, #0x150
    b21c:	ce e3 ff 97	bl	__ZN12_GLOBAL__N_19SetStringEP10napi_env__P12napi_value__PKcRKNSt3__112basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEE
    b220:	01 00 00 14	b	0xb224
    b224:	e0 43 05 91	add	x0, sp, #0x150
    b228:	8a 26 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    b22c:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b230:	e1 db 40 f9	ldr	x1, [sp, #0x1b0]
    b234:	e2 a7 41 b9	ldr	w2, [sp, #0x1a4]
    b238:	48 04 00 11	add	w8, w2, #0x1
    b23c:	e8 a7 01 b9	str	w8, [sp, #0x1a4]
    b240:	e3 b7 40 f9	ldr	x3, [sp, #0x168]
    b244:	32 29 14 94	bl	0x51570c ; symbol stub for: _napi_set_element
    b248:	01 00 00 14	b	0xb24c
    b24c:	07 00 00 14	b	0xb268
    b250:	a0 83 1a f8	stur	x0, [x29, #-0x58]
    b254:	e8 03 01 aa	mov	x8, x1
    b258:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
    b25c:	e0 43 05 91	add	x0, sp, #0x150
    b260:	7c 26 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    b264:	57 00 00 14	b	0xb3c0
    b268:	01 00 00 14	b	0xb26c
    b26c:	01 00 00 14	b	0xb270
    b270:	e0 43 06 91	add	x0, sp, #0x190
    b274:	a0 03 00 94	bl	__ZNSt3__114__map_iteratorINS_15__tree_iteratorINS_12__value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateEEEPNS_11__tree_nodeISB_PvEElEEEppB9nqe210106Ev
    b278:	01 00 00 14	b	0xb27c
    b27c:	7d ff ff 17	b	0xb070
    b280:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b284:	a8 db ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
    b288:	e0 17 00 f9	str	x0, [sp, #0x28]
    b28c:	01 00 00 14	b	0xb290
    b290:	e8 17 40 f9	ldr	x8, [sp, #0x28]
    b294:	e8 a7 00 f9	str	x8, [sp, #0x148]
    b298:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
    b29c:	e8 0b 00 f9	str	x8, [sp, #0x10]
    b2a0:	e8 a7 40 f9	ldr	x8, [sp, #0x148]
    b2a4:	e8 0f 00 f9	str	x8, [sp, #0x18]
    b2a8:	e8 ab 41 b9	ldr	w8, [sp, #0x1a8]
    b2ac:	09 00 80 52	mov	w9, #0x0
    b2b0:	e9 27 00 b9	str	w9, [sp, #0x24]
    b2b4:	e8 00 00 35	cbnz	w8, 0xb2d0
    b2b8:	01 00 00 14	b	0xb2bc
    b2bc:	e8 a7 41 b9	ldr	w8, [sp, #0x1a4]
    b2c0:	08 01 00 71	subs	w8, w8, #0x0
    b2c4:	e8 17 9f 1a	cset	w8, eq
    b2c8:	e8 27 00 b9	str	w8, [sp, #0x24]
    b2cc:	01 00 00 14	b	0xb2d0
    b2d0:	e1 0f 40 f9	ldr	x1, [sp, #0x18]
    b2d4:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
    b2d8:	e8 27 40 b9	ldr	w8, [sp, #0x24]
    b2dc:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b2e0:	42 f0 03 91	add	x2, x2, #0xfc ; literal pool for: "success"
    b2e4:	03 01 00 12	and	w3, w8, #0x1
    b2e8:	8e 03 00 94	bl	__ZN12_GLOBAL__N_17SetBoolEP10napi_env__P12napi_value__PKcb
    b2ec:	01 00 00 14	b	0xb2f0
    b2f0:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b2f4:	e1 a7 40 f9	ldr	x1, [sp, #0x148]
    b2f8:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b2fc:	42 ac 02 91	add	x2, x2, #0xab ; literal pool for: "outputPath"
    b300:	a3 43 01 d1	sub	x3, x29, #0x50
    b304:	94 e3 ff 97	bl	__ZN12_GLOBAL__N_19SetStringEP10napi_env__P12napi_value__PKcRKNSt3__112basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEE
    b308:	01 00 00 14	b	0xb30c
    b30c:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b310:	e1 a7 40 f9	ldr	x1, [sp, #0x148]
    b314:	e3 af 41 b9	ldr	w3, [sp, #0x1ac]
    b318:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b31c:	42 10 04 91	add	x2, x2, #0x104 ; literal pool for: "filledCount"
    b320:	7a e3 ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
    b324:	01 00 00 14	b	0xb328
    b328:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b32c:	e1 a7 40 f9	ldr	x1, [sp, #0x148]
    b330:	e3 e3 40 f9	ldr	x3, [sp, #0x1c0]
    b334:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b338:	42 40 04 91	add	x2, x2, #0x110 ; literal pool for: "filledFields"
    b33c:	bf e3 ff 97	bl	__ZN12_GLOBAL__N_13SetEP10napi_env__P12napi_value__PKcS3_
    b340:	01 00 00 14	b	0xb344
    b344:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b348:	e1 a7 40 f9	ldr	x1, [sp, #0x148]
    b34c:	e3 df 40 f9	ldr	x3, [sp, #0x1b8]
    b350:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b354:	42 74 04 91	add	x2, x2, #0x11d ; literal pool for: "missingFields"
    b358:	b8 e3 ff 97	bl	__ZN12_GLOBAL__N_13SetEP10napi_env__P12napi_value__PKcS3_
    b35c:	01 00 00 14	b	0xb360
    b360:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    b364:	e1 a7 40 f9	ldr	x1, [sp, #0x148]
    b368:	e3 db 40 f9	ldr	x3, [sp, #0x1b0]
    b36c:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b370:	42 ac 04 91	add	x2, x2, #0x12b ; literal pool for: "invalidFields"
    b374:	b1 e3 ff 97	bl	__ZN12_GLOBAL__N_13SetEP10napi_env__P12napi_value__PKcS3_
    b378:	01 00 00 14	b	0xb37c
    b37c:	e8 a7 40 f9	ldr	x8, [sp, #0x148]
    b380:	e8 07 00 f9	str	x8, [sp, #0x8]
    b384:	28 00 80 52	mov	w8, #0x1
    b388:	e8 07 02 b9	str	w8, [sp, #0x204]
    b38c:	e0 a3 08 91	add	x0, sp, #0x228
    b390:	c4 e3 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
    b394:	a0 e3 01 d1	sub	x0, x29, #0x78
    b398:	76 03 00 94	bl	__ZNSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEED1B9nqe210106Ev
    b39c:	a0 43 01 d1	sub	x0, x29, #0x50
    b3a0:	2c 26 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    b3a4:	a0 e3 00 d1	sub	x0, x29, #0x38
    b3a8:	2a 26 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    b3ac:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    b3b0:	ff 43 0f 91	add	sp, sp, #0x3d0
    b3b4:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
    b3b8:	fc 6f c2 a8	ldp	x28, x27, [sp], #0x20
    b3bc:	c0 03 5f d6	ret
    b3c0:	e0 a3 08 91	add	x0, sp, #0x228
    b3c4:	b7 e3 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
    b3c8:	01 00 00 14	b	0xb3cc
    b3cc:	a0 e3 01 d1	sub	x0, x29, #0x78
    b3d0:	68 03 00 94	bl	__ZNSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEED1B9nqe210106Ev
    b3d4:	01 00 00 14	b	0xb3d8
    b3d8:	a0 43 01 d1	sub	x0, x29, #0x50
    b3dc:	1d 26 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    b3e0:	01 00 00 14	b	0xb3e4
    b3e4:	a0 e3 00 d1	sub	x0, x29, #0x38
    b3e8:	1a 26 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    b3ec:	01 00 00 14	b	0xb3f0
    b3f0:	a0 83 5a f8	ldur	x0, [x29, #-0x58]
    b3f4:	78 25 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
    b3f8:	20 00 20 d4	brk	#0x1
