/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_17PdfPageD2Ev:
    a8a0:	ff c3 00 d1	sub	sp, sp, #0x30
    a8a4:	fd 7b 02 a9	stp	x29, x30, [sp, #0x20]
    a8a8:	fd 83 00 91	add	x29, sp, #0x20
    a8ac:	e0 0b 00 f9	str	x0, [sp, #0x10]
    a8b0:	e8 0b 40 f9	ldr	x8, [sp, #0x10]
    a8b4:	e8 07 00 f9	str	x8, [sp, #0x8]
    a8b8:	e9 03 08 aa	mov	x9, x8
    a8bc:	a9 83 1f f8	stur	x9, [x29, #-0x8]
    a8c0:	08 01 40 f9	ldr	x8, [x8]
    a8c4:	88 01 00 b4	cbz	x8, 0xa8f4
    a8c8:	01 00 00 14	b	0xa8cc
    a8cc:	e8 07 40 f9	ldr	x8, [sp, #0x8]
    a8d0:	00 01 40 f9	ldr	x0, [x8]
    a8d4:	01 05 40 f9	ldr	x1, [x8, #0x8]
    a8d8:	a4 e5 05 94	bl	_FORM_OnBeforeClosePage
    a8dc:	01 00 00 14	b	0xa8e0
    a8e0:	e8 07 40 f9	ldr	x8, [sp, #0x8]
    a8e4:	00 01 40 f9	ldr	x0, [x8]
    a8e8:	db f2 05 94	bl	_FPDF_ClosePage
    a8ec:	01 00 00 14	b	0xa8f0
    a8f0:	01 00 00 14	b	0xa8f4
    a8f4:	a0 83 5f f8	ldur	x0, [x29, #-0x8]
    a8f8:	fd 7b 42 a9	ldp	x29, x30, [sp, #0x20]
    a8fc:	ff c3 00 91	add	sp, sp, #0x30
    a900:	c0 03 5f d6	ret
    a904:	8b e3 ff 97	bl	___clang_call_terminate
