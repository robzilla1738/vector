/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_17PdfPageC2ERKNS_11PdfDocumentEi:
    886c:	ff 03 01 d1	sub	sp, sp, #0x40
    8870:	fd 7b 03 a9	stp	x29, x30, [sp, #0x30]
    8874:	fd c3 00 91	add	x29, sp, #0x30
    8878:	a0 03 1f f8	stur	x0, [x29, #-0x10]
    887c:	e1 0f 00 f9	str	x1, [sp, #0x18]
    8880:	e2 17 00 b9	str	w2, [sp, #0x14]
    8884:	a8 03 5f f8	ldur	x8, [x29, #-0x10]
    8888:	e8 07 00 f9	str	x8, [sp, #0x8]
    888c:	e9 03 08 aa	mov	x9, x8
    8890:	a9 83 1f f8	stur	x9, [x29, #-0x8]
    8894:	1f 01 00 f9	str	xzr, [x8]
    8898:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
    889c:	15 00 00 94	bl	__ZNK12_GLOBAL__N_111PdfDocument4formEv
    88a0:	e8 07 40 f9	ldr	x8, [sp, #0x8]
    88a4:	00 05 00 f9	str	x0, [x8, #0x8]
    88a8:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
    88ac:	7d ec ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
    88b0:	e1 17 40 b9	ldr	w1, [sp, #0x14]
    88b4:	59 f9 05 94	bl	_FPDF_LoadPage
    88b8:	e8 07 40 f9	ldr	x8, [sp, #0x8]
    88bc:	00 01 00 f9	str	x0, [x8]
    88c0:	08 01 40 f9	ldr	x8, [x8]
    88c4:	e8 00 00 b4	cbz	x8, 0x88e0
    88c8:	01 00 00 14	b	0x88cc
    88cc:	e8 07 40 f9	ldr	x8, [sp, #0x8]
    88d0:	00 01 40 f9	ldr	x0, [x8]
    88d4:	01 05 40 f9	ldr	x1, [x8, #0x8]
    88d8:	94 ed 05 94	bl	_FORM_OnAfterLoadPage
    88dc:	01 00 00 14	b	0x88e0
    88e0:	a0 83 5f f8	ldur	x0, [x29, #-0x8]
    88e4:	fd 7b 43 a9	ldp	x29, x30, [sp, #0x30]
    88e8:	ff 03 01 91	add	sp, sp, #0x40
    88ec:	c0 03 5f d6	ret
