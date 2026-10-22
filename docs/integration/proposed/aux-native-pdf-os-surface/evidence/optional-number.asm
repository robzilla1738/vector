/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_114OptionalNumberEP10napi_env__P12napi_value__PKcd:
   1db78:	ff 83 02 d1	sub	sp, sp, #0xa0
   1db7c:	fd 7b 09 a9	stp	x29, x30, [sp, #0x90]
   1db80:	fd 43 02 91	add	x29, sp, #0x90
   1db84:	a0 03 1f f8	stur	x0, [x29, #-0x10]
   1db88:	a1 83 1e f8	stur	x1, [x29, #-0x18]
   1db8c:	a2 03 1e f8	stur	x2, [x29, #-0x20]
   1db90:	a0 83 1d fc	stur	d0, [x29, #-0x28]
   1db94:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   1db98:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
   1db9c:	a2 03 5e f8	ldur	x2, [x29, #-0x20]
   1dba0:	cb 99 ff 97	bl	__ZN12_GLOBAL__N_13HasEP10napi_env__P12napi_value__PKc
   1dba4:	a0 00 00 37	tbnz	w0, #0x0, 0x1dbb8
   1dba8:	01 00 00 14	b	0x1dbac
   1dbac:	a0 83 5d fc	ldur	d0, [x29, #-0x28]
   1dbb0:	a0 83 1f fc	stur	d0, [x29, #-0x8]
   1dbb4:	55 00 00 14	b	0x1dd08
   1dbb8:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   1dbbc:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
   1dbc0:	a2 03 5e f8	ldur	x2, [x29, #-0x20]
   1dbc4:	e3 99 ff 97	bl	__ZN12_GLOBAL__N_13GetEP10napi_env__P12napi_value__PKc
   1dbc8:	a0 03 1d f8	stur	x0, [x29, #-0x30]
   1dbcc:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   1dbd0:	a1 03 5d f8	ldur	x1, [x29, #-0x30]
   1dbd4:	a2 d3 00 d1	sub	x2, x29, #0x34
   1dbd8:	d9 de 13 94	bl	0x51573c ; symbol stub for: _napi_typeof
   1dbdc:	00 e4 00 6f	movi.2d	v0, #0000000000000000
   1dbe0:	a0 03 1c fc	stur	d0, [x29, #-0x40]
   1dbe4:	a8 c3 5c b8	ldur	w8, [x29, #-0x34]
   1dbe8:	08 0d 00 71	subs	w8, w8, #0x3
   1dbec:	81 01 00 54	b.ne	0x1dc1c
   1dbf0:	01 00 00 14	b	0x1dbf4
   1dbf4:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   1dbf8:	a1 03 5d f8	ldur	x1, [x29, #-0x30]
   1dbfc:	a2 03 01 d1	sub	x2, x29, #0x40
   1dc00:	b7 de 13 94	bl	0x5156dc ; symbol stub for: _napi_get_value_double
   1dc04:	c0 00 00 35	cbnz	w0, 0x1dc1c
   1dc08:	01 00 00 14	b	0x1dc0c
   1dc0c:	a0 03 5c fc	ldur	d0, [x29, #-0x40]
   1dc10:	83 02 00 94	bl	__ZNSt3__16__math8isfiniteB9nqe210106Ed
   1dc14:	40 07 00 37	tbnz	w0, #0x0, 0x1dcfc
   1dc18:	01 00 00 14	b	0x1dc1c
   1dc1c:	28 00 80 52	mov	w8, #0x1
   1dc20:	08 01 00 12	and	w8, w8, #0x1
   1dc24:	08 01 00 12	and	w8, w8, #0x1
   1dc28:	e8 4f 00 39	strb	w8, [sp, #0x13]
   1dc2c:	00 02 80 d2	mov	x0, #0x10
   1dc30:	79 dd 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1dc34:	e0 07 00 f9	str	x0, [sp, #0x8]
   1dc38:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   1dc3c:	e0 83 00 91	add	x0, sp, #0x20
   1dc40:	bd 8f ff 97	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106ILi0EEEPKc
   1dc44:	01 00 00 14	b	0x1dc48
   1dc48:	e8 e3 00 91	add	x8, sp, #0x38
   1dc4c:	e0 83 00 91	add	x0, sp, #0x20
   1dc50:	e1 27 00 90	adrp	x1, 1276 ; 0x519000
   1dc54:	21 64 14 91	add	x1, x1, #0x519 ; literal pool for: " must be a finite number"
   1dc58:	ae 99 ff 97	bl	__ZNSt3__1plB9nqe210106IcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEOS9_PKS6_
   1dc5c:	01 00 00 14	b	0x1dc60
   1dc60:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   1dc64:	e1 e3 00 91	add	x1, sp, #0x38
   1dc68:	82 db 13 94	bl	0x514a70 ; symbol stub for: __ZNSt13runtime_errorC1ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
   1dc6c:	01 00 00 14	b	0x1dc70
   1dc70:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   1dc74:	08 00 80 52	mov	w8, #0x0
   1dc78:	08 01 00 12	and	w8, w8, #0x1
   1dc7c:	08 01 00 12	and	w8, w8, #0x1
   1dc80:	e8 4f 00 39	strb	w8, [sp, #0x13]
   1dc84:	21 38 00 f0	adrp	x1, 1799 ; 0x724000
   1dc88:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1dc8c:	22 38 00 f0	adrp	x2, 1799 ; 0x724000
   1dc90:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1dc94:	7b dd 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1dc98:	22 00 00 14	b	0x1dd20
   1dc9c:	e0 0f 00 f9	str	x0, [sp, #0x18]
   1dca0:	e8 03 01 aa	mov	x8, x1
   1dca4:	e8 17 00 b9	str	w8, [sp, #0x14]
   1dca8:	0e 00 00 14	b	0x1dce0
   1dcac:	e0 0f 00 f9	str	x0, [sp, #0x18]
   1dcb0:	e8 03 01 aa	mov	x8, x1
   1dcb4:	e8 17 00 b9	str	w8, [sp, #0x14]
   1dcb8:	07 00 00 14	b	0x1dcd4
   1dcbc:	e0 0f 00 f9	str	x0, [sp, #0x18]
   1dcc0:	e8 03 01 aa	mov	x8, x1
   1dcc4:	e8 17 00 b9	str	w8, [sp, #0x14]
   1dcc8:	e0 e3 00 91	add	x0, sp, #0x38
   1dccc:	e1 db 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1dcd0:	01 00 00 14	b	0x1dcd4
   1dcd4:	e0 83 00 91	add	x0, sp, #0x20
   1dcd8:	de db 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1dcdc:	01 00 00 14	b	0x1dce0
   1dce0:	e8 4f 40 39	ldrb	w8, [sp, #0x13]
   1dce4:	a8 00 00 36	tbz	w8, #0x0, 0x1dcf8
   1dce8:	01 00 00 14	b	0x1dcec
   1dcec:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   1dcf0:	58 dd 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1dcf4:	01 00 00 14	b	0x1dcf8
   1dcf8:	08 00 00 14	b	0x1dd18
   1dcfc:	a0 03 5c fc	ldur	d0, [x29, #-0x40]
   1dd00:	a0 83 1f fc	stur	d0, [x29, #-0x8]
   1dd04:	01 00 00 14	b	0x1dd08
   1dd08:	a0 83 5f fc	ldur	d0, [x29, #-0x8]
   1dd0c:	fd 7b 49 a9	ldp	x29, x30, [sp, #0x90]
   1dd10:	ff 83 02 91	add	sp, sp, #0xa0
   1dd14:	c0 03 5f d6	ret
   1dd18:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
   1dd1c:	2e db 13 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
   1dd20:	20 00 20 d4	brk	#0x1
