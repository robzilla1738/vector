/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_114NewPdfDocumentC2Ev:
   1d100:	ff 03 01 d1	sub	sp, sp, #0x40
   1d104:	fd 7b 03 a9	stp	x29, x30, [sp, #0x30]
   1d108:	fd c3 00 91	add	x29, sp, #0x30
   1d10c:	a0 83 1f f8	stur	x0, [x29, #-0x8]
   1d110:	a8 83 5f f8	ldur	x8, [x29, #-0x8]
   1d114:	e8 0b 00 f9	str	x8, [sp, #0x10]
   1d118:	ca 88 05 94	bl	_FPDF_CreateNewDocument
   1d11c:	e8 0b 40 f9	ldr	x8, [sp, #0x10]
   1d120:	00 01 00 f9	str	x0, [x8]
   1d124:	08 01 40 f9	ldr	x8, [x8]
   1d128:	c8 02 00 b5	cbnz	x8, 0x1d180
   1d12c:	01 00 00 14	b	0x1d130
   1d130:	00 02 80 d2	mov	x0, #0x10
   1d134:	38 e0 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1d138:	e0 07 00 f9	str	x0, [sp, #0x8]
   1d13c:	e1 27 00 90	adrp	x1, 1276 ; 0x519000
   1d140:	21 58 11 91	add	x1, x1, #0x456 ; literal pool for: "Failed to create PDF"
   1d144:	48 de 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   1d148:	01 00 00 14	b	0x1d14c
   1d14c:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   1d150:	21 38 00 f0	adrp	x1, 1799 ; 0x724000
   1d154:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1d158:	22 38 00 f0	adrp	x2, 1799 ; 0x724000
   1d15c:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1d160:	48 e0 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1d164:	e8 03 00 aa	mov	x8, x0
   1d168:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   1d16c:	a8 03 1f f8	stur	x8, [x29, #-0x10]
   1d170:	e8 03 01 aa	mov	x8, x1
   1d174:	a8 c3 1e b8	stur	w8, [x29, #-0x14]
   1d178:	36 e0 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1d17c:	05 00 00 14	b	0x1d190
   1d180:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
   1d184:	fd 7b 43 a9	ldp	x29, x30, [sp, #0x30]
   1d188:	ff 03 01 91	add	sp, sp, #0x40
   1d18c:	c0 03 5f d6	ret
   1d190:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   1d194:	10 de 13 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
