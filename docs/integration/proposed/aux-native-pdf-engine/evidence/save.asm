/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_112SaveDocumentEP17fpdf_document_t__RKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE:
    be80:	fc 6f be a9	stp	x28, x27, [sp, #-0x20]!
    be84:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
    be88:	fd 43 00 91	add	x29, sp, #0x10
    be8c:	ff 03 0b d1	sub	sp, sp, #0x2c0
    be90:	c8 38 00 b0	adrp	x8, 1817 ; 0x724000
    be94:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
    be98:	08 01 40 f9	ldr	x8, [x8]
    be9c:	a8 83 1e f8	stur	x8, [x29, #-0x18]
    bea0:	e0 37 00 f9	str	x0, [sp, #0x68]
    bea4:	e1 33 00 f9	str	x1, [sp, #0x60]
    bea8:	e0 33 40 f9	ldr	x0, [sp, #0x60]
    beac:	e8 23 01 91	add	x8, sp, #0x48
    beb0:	88 e3 ff 97	bl	__ZN12_GLOBAL__N_112PathFromUtf8ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
    beb4:	01 00 00 14	b	0xbeb8
    beb8:	e0 23 01 91	add	x0, sp, #0x48
    bebc:	01 25 00 94	bl	__ZNKSt3__14__fs10filesystem4path15has_parent_pathB9nqe210106Ev
    bec0:	e0 1f 00 b9	str	w0, [sp, #0x1c]
    bec4:	01 00 00 14	b	0xbec8
    bec8:	e8 1f 40 b9	ldr	w8, [sp, #0x1c]
    becc:	c8 02 00 36	tbz	w8, #0x0, 0xbf24
    bed0:	01 00 00 14	b	0xbed4
    bed4:	e8 83 00 91	add	x8, sp, #0x20
    bed8:	e0 23 01 91	add	x0, sp, #0x48
    bedc:	12 25 00 94	bl	__ZNKSt3__14__fs10filesystem4path11parent_pathB9nqe210106Ev
    bee0:	01 00 00 14	b	0xbee4
    bee4:	e0 83 00 91	add	x0, sp, #0x20
    bee8:	05 25 00 94	bl	__ZNSt3__14__fs10filesystem18create_directoriesB9nqe210106ERKNS1_4pathE
    beec:	01 00 00 14	b	0xbef0
    bef0:	e0 83 00 91	add	x0, sp, #0x20
    bef4:	98 e3 ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
    bef8:	0b 00 00 14	b	0xbf24
    befc:	e0 23 00 f9	str	x0, [sp, #0x40]
    bf00:	e8 03 01 aa	mov	x8, x1
    bf04:	e8 3f 00 b9	str	w8, [sp, #0x3c]
    bf08:	47 00 00 14	b	0xc024
    bf0c:	e0 23 00 f9	str	x0, [sp, #0x40]
    bf10:	e8 03 01 aa	mov	x8, x1
    bf14:	e8 3f 00 b9	str	w8, [sp, #0x3c]
    bf18:	e0 83 00 91	add	x0, sp, #0x20
    bf1c:	8e e3 ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
    bf20:	41 00 00 14	b	0xc024
    bf24:	e0 c3 01 91	add	x0, sp, #0x70
    bf28:	e1 23 01 91	add	x1, sp, #0x48
    bf2c:	16 25 00 94	bl	__ZN12_GLOBAL__N_19PdfWriterC1ERKNSt3__14__fs10filesystem4pathE
    bf30:	01 00 00 14	b	0xbf34
    bf34:	e0 c3 01 91	add	x0, sp, #0x70
    bf38:	20 25 00 94	bl	__ZNK12_GLOBAL__N_19PdfWriter7is_openEv
    bf3c:	e0 1b 00 b9	str	w0, [sp, #0x18]
    bf40:	01 00 00 14	b	0xbf44
    bf44:	e8 1b 40 b9	ldr	w8, [sp, #0x18]
    bf48:	68 01 00 36	tbz	w8, #0x0, 0xbf74
    bf4c:	01 00 00 14	b	0xbf50
    bf50:	e0 37 40 f9	ldr	x0, [sp, #0x68]
    bf54:	e1 c3 01 91	add	x1, sp, #0x70
    bf58:	42 00 80 d2	mov	x2, #0x2
    bf5c:	81 e4 05 94	bl	_FPDF_SaveAsCopy
    bf60:	e0 17 00 b9	str	w0, [sp, #0x14]
    bf64:	01 00 00 14	b	0xbf68
    bf68:	e8 17 40 b9	ldr	w8, [sp, #0x14]
    bf6c:	68 03 00 35	cbnz	w8, 0xbfd8
    bf70:	01 00 00 14	b	0xbf74
    bf74:	00 02 80 d2	mov	x0, #0x10
    bf78:	a7 24 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    bf7c:	e0 07 00 f9	str	x0, [sp, #0x8]
    bf80:	61 28 00 d0	adrp	x1, 1294 ; 0x519000
    bf84:	21 f4 0b 91	add	x1, x1, #0x2fd ; literal pool for: "Failed to write PDF"
    bf88:	b7 22 14 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
    bf8c:	01 00 00 14	b	0xbf90
    bf90:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    bf94:	c1 38 00 b0	adrp	x1, 1817 ; 0x724000
    bf98:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    bf9c:	c2 38 00 b0	adrp	x2, 1817 ; 0x724000
    bfa0:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    bfa4:	b7 24 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    bfa8:	25 00 00 14	b	0xc03c
    bfac:	e0 23 00 f9	str	x0, [sp, #0x40]
    bfb0:	e8 03 01 aa	mov	x8, x1
    bfb4:	e8 3f 00 b9	str	w8, [sp, #0x3c]
    bfb8:	18 00 00 14	b	0xc018
    bfbc:	e8 03 00 aa	mov	x8, x0
    bfc0:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    bfc4:	e8 23 00 f9	str	x8, [sp, #0x40]
    bfc8:	e8 03 01 aa	mov	x8, x1
    bfcc:	e8 3f 00 b9	str	w8, [sp, #0x3c]
    bfd0:	a0 24 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    bfd4:	11 00 00 14	b	0xc018
    bfd8:	e0 c3 01 91	add	x0, sp, #0x70
    bfdc:	01 25 00 94	bl	__ZN12_GLOBAL__N_19PdfWriterD1Ev
    bfe0:	e0 23 01 91	add	x0, sp, #0x48
    bfe4:	5c e3 ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
    bfe8:	a9 83 5e f8	ldur	x9, [x29, #-0x18]
    bfec:	c8 38 00 b0	adrp	x8, 1817 ; 0x724000
    bff0:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
    bff4:	08 01 40 f9	ldr	x8, [x8]
    bff8:	08 01 09 eb	subs	x8, x8, x9
    bffc:	60 00 00 54	b.eq	0xc008
    c000:	01 00 00 14	b	0xc004
    c004:	c0 24 14 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
    c008:	ff 03 0b 91	add	sp, sp, #0x2c0
    c00c:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
    c010:	fc 6f c2 a8	ldp	x28, x27, [sp], #0x20
    c014:	c0 03 5f d6	ret
    c018:	e0 c3 01 91	add	x0, sp, #0x70
    c01c:	f1 24 00 94	bl	__ZN12_GLOBAL__N_19PdfWriterD1Ev
    c020:	01 00 00 14	b	0xc024
    c024:	e0 23 01 91	add	x0, sp, #0x48
    c028:	4b e3 ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
    c02c:	01 00 00 14	b	0xc030
    c030:	e0 23 40 f9	ldr	x0, [sp, #0x40]
    c034:	e0 03 00 f9	str	x0, [sp]
    c038:	04 00 00 14	b	0xc048
    c03c:	20 00 20 d4	brk	#0x1
    c040:	e0 03 00 f9	str	x0, [sp]
    c044:	01 00 00 14	b	0xc048
    c048:	e0 03 40 f9	ldr	x0, [sp]
    c04c:	62 22 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
