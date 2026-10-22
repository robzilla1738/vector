/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_111PdfDocumentD2Ev:
    aaf4:	ff 83 00 d1	sub	sp, sp, #0x20
    aaf8:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
    aafc:	fd 43 00 91	add	x29, sp, #0x10
    ab00:	e0 07 00 f9	str	x0, [sp, #0x8]
    ab04:	e8 07 40 f9	ldr	x8, [sp, #0x8]
    ab08:	e8 03 00 f9	str	x8, [sp]
    ab0c:	00 9d 40 f9	ldr	x0, [x8, #0x138]
    ab10:	65 e1 05 94	bl	_FPDFDOC_ExitFormFillEnvironment
    ab14:	01 00 00 14	b	0xab18
    ab18:	e8 03 40 f9	ldr	x8, [sp]
    ab1c:	00 0d 40 f9	ldr	x0, [x8, #0x18]
    ab20:	70 f2 05 94	bl	_FPDF_CloseDocument
    ab24:	01 00 00 14	b	0xab28
    ab28:	e0 03 40 f9	ldr	x0, [sp]
    ab2c:	00 e9 ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEED1B9nqe210106Ev
    ab30:	e0 03 40 f9	ldr	x0, [sp]
    ab34:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
    ab38:	ff 83 00 91	add	sp, sp, #0x20
    ab3c:	c0 03 5f d6	ret
    ab40:	fc e2 ff 97	bl	___clang_call_terminate
