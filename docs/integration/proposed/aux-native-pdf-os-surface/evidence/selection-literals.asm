/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_115ReadPageNumbersEP10napi_env__P12napi_value__i:
    3ab8:	ff c3 02 d1	sub	sp, sp, #0xb0
    3abc:	fd 7b 0a a9	stp	x29, x30, [sp, #0xa0]
    3ac0:	fd 83 02 91	add	x29, sp, #0xa0
    3ac4:	e8 17 00 f9	str	x8, [sp, #0x28]
    3ac8:	e8 03 00 aa	mov	x8, x0
    3acc:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    3ad0:	e9 03 00 aa	mov	x9, x0
    3ad4:	a9 83 1f f8	stur	x9, [x29, #-0x8]
    3ad8:	a8 03 1f f8	stur	x8, [x29, #-0x10]
    3adc:	a1 83 1e f8	stur	x1, [x29, #-0x18]
    3ae0:	a2 43 1e b8	stur	w2, [x29, #-0x1c]
    3ae4:	08 00 80 52	mov	w8, #0x0
    3ae8:	08 01 00 12	and	w8, w8, #0x1
    3aec:	08 01 00 12	and	w8, w8, #0x1
    3af0:	a8 33 1e 38	sturb	w8, [x29, #-0x1d]
    3af4:	ef 0e 00 94	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEEC1B9nqe210106Ev
    3af8:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    3afc:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
    3b00:	a2 28 00 b0	adrp	x2, 1301 ; 0x518000
    3b04:	42 d4 3d 91	add	x2, x2, #0xf75 ; literal pool for: "pages"
    3b08:	f1 01 00 94	bl	__ZN12_GLOBAL__N_13HasEP10napi_env__P12napi_value__PKc
    3b0c:	e0 33 00 b9	str	w0, [sp, #0x30]
    3b10:	01 00 00 14	b	0x3b14
    3b14:	e8 33 40 b9	ldr	w8, [sp, #0x30]
    3b18:	a8 03 00 37	tbnz	w8, #0x0, 0x3b8c
    3b1c:	01 00 00 14	b	0x3b20
    3b20:	28 00 80 52	mov	w8, #0x1
    3b24:	a8 03 1d b8	stur	w8, [x29, #-0x30]
    3b28:	01 00 00 14	b	0x3b2c
    3b2c:	a8 03 5d b8	ldur	w8, [x29, #-0x30]
    3b30:	a9 43 5e b8	ldur	w9, [x29, #-0x1c]
    3b34:	08 01 09 6b	subs	w8, w8, w9
    3b38:	ec 01 00 54	b.gt	0x3b74
    3b3c:	01 00 00 14	b	0x3b40
    3b40:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    3b44:	a1 c3 00 d1	sub	x1, x29, #0x30
    3b48:	e5 0e 00 94	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEE9push_backB9nqe210106ERKi
    3b4c:	01 00 00 14	b	0x3b50
    3b50:	01 00 00 14	b	0x3b54
    3b54:	a8 03 5d b8	ldur	w8, [x29, #-0x30]
    3b58:	08 05 00 11	add	w8, w8, #0x1
    3b5c:	a8 03 1d b8	stur	w8, [x29, #-0x30]
    3b60:	f3 ff ff 17	b	0x3b2c
    3b64:	a0 83 1d f8	stur	x0, [x29, #-0x28]
    3b68:	e8 03 01 aa	mov	x8, x1
    3b6c:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
    3b70:	b1 00 00 14	b	0x3e34
    3b74:	28 00 80 52	mov	w8, #0x1
    3b78:	09 01 00 12	and	w9, w8, #0x1
    3b7c:	29 01 08 0a	and	w9, w9, w8
    3b80:	a9 33 1e 38	sturb	w9, [x29, #-0x1d]
    3b84:	a8 c3 1c b8	stur	w8, [x29, #-0x34]
    3b88:	a2 00 00 14	b	0x3e10
    3b8c:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    3b90:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
    3b94:	a2 28 00 b0	adrp	x2, 1301 ; 0x518000
    3b98:	42 d4 3d 91	add	x2, x2, #0xf75 ; literal pool for: "pages"
    3b9c:	ed 01 00 94	bl	__ZN12_GLOBAL__N_13GetEP10napi_env__P12napi_value__PKc
    3ba0:	e0 13 00 f9	str	x0, [sp, #0x20]
    3ba4:	01 00 00 14	b	0x3ba8
    3ba8:	e8 13 40 f9	ldr	x8, [sp, #0x20]
    3bac:	a8 03 1c f8	stur	x8, [x29, #-0x40]
    3bb0:	a2 07 01 d1	sub	x2, x29, #0x41
    3bb4:	bf f3 1b 38	sturb	wzr, [x29, #-0x41]
    3bb8:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    3bbc:	a1 03 5c f8	ldur	x1, [x29, #-0x40]
    3bc0:	d0 46 14 94	bl	0x515700 ; symbol stub for: _napi_is_array
    3bc4:	01 00 00 14	b	0x3bc8
    3bc8:	a8 f3 5b 38	ldurb	w8, [x29, #-0x41]
    3bcc:	e8 02 00 37	tbnz	w8, #0x0, 0x3c28
    3bd0:	01 00 00 14	b	0x3bd4
    3bd4:	00 02 80 d2	mov	x0, #0x10
    3bd8:	8f 45 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    3bdc:	e0 0f 00 f9	str	x0, [sp, #0x18]
    3be0:	a1 28 00 d0	adrp	x1, 1302 ; 0x519000
    3be4:	21 d8 00 91	add	x1, x1, #0x36 ; literal pool for: "pages must be an array"
    3be8:	9f 43 14 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
    3bec:	01 00 00 14	b	0x3bf0
    3bf0:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
    3bf4:	01 39 00 b0	adrp	x1, 1825 ; 0x724000
    3bf8:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    3bfc:	02 39 00 b0	adrp	x2, 1825 ; 0x724000
    3c00:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    3c04:	9f 45 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    3c08:	90 00 00 14	b	0x3e48
    3c0c:	e8 03 00 aa	mov	x8, x0
    3c10:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
    3c14:	a8 83 1d f8	stur	x8, [x29, #-0x28]
    3c18:	e8 03 01 aa	mov	x8, x1
    3c1c:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
    3c20:	8c 45 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    3c24:	84 00 00 14	b	0x3e34
    3c28:	a2 23 01 d1	sub	x2, x29, #0x48
    3c2c:	bf 83 1b b8	stur	wzr, [x29, #-0x48]
    3c30:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    3c34:	a1 03 5c f8	ldur	x1, [x29, #-0x40]
    3c38:	97 46 14 94	bl	0x515694 ; symbol stub for: _napi_get_array_length
    3c3c:	01 00 00 14	b	0x3c40
    3c40:	bf 43 1b b8	stur	wzr, [x29, #-0x4c]
    3c44:	01 00 00 14	b	0x3c48
    3c48:	a8 43 5b b8	ldur	w8, [x29, #-0x4c]
    3c4c:	a9 83 5b b8	ldur	w9, [x29, #-0x48]
    3c50:	08 01 09 6b	subs	w8, w8, w9
    3c54:	02 0a 00 54	b.hs	0x3d94
    3c58:	01 00 00 14	b	0x3c5c
    3c5c:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    3c60:	a1 03 5c f8	ldur	x1, [x29, #-0x40]
    3c64:	a2 43 5b b8	ldur	w2, [x29, #-0x4c]
    3c68:	e3 23 01 91	add	x3, sp, #0x48
    3c6c:	93 46 14 94	bl	0x5156b8 ; symbol stub for: _napi_get_element
    3c70:	01 00 00 14	b	0x3c74
    3c74:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    3c78:	e1 27 40 f9	ldr	x1, [sp, #0x48]
    3c7c:	e2 13 01 91	add	x2, sp, #0x44
    3c80:	af 46 14 94	bl	0x51573c ; symbol stub for: _napi_typeof
    3c84:	01 00 00 14	b	0x3c88
    3c88:	00 e4 00 6f	movi.2d	v0, #0000000000000000
    3c8c:	e0 1f 00 fd	str	d0, [sp, #0x38]
    3c90:	e8 47 40 b9	ldr	w8, [sp, #0x44]
    3c94:	08 0d 00 71	subs	w8, w8, #0x3
    3c98:	c1 03 00 54	b.ne	0x3d10
    3c9c:	01 00 00 14	b	0x3ca0
    3ca0:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    3ca4:	e1 27 40 f9	ldr	x1, [sp, #0x48]
    3ca8:	e2 e3 00 91	add	x2, sp, #0x38
    3cac:	8c 46 14 94	bl	0x5156dc ; symbol stub for: _napi_get_value_double
    3cb0:	e0 17 00 b9	str	w0, [sp, #0x14]
    3cb4:	01 00 00 14	b	0x3cb8
    3cb8:	e8 17 40 b9	ldr	w8, [sp, #0x14]
    3cbc:	a8 02 00 35	cbnz	w8, 0x3d10
    3cc0:	01 00 00 14	b	0x3cc4
    3cc4:	e0 1f 40 fd	ldr	d0, [sp, #0x38]
    3cc8:	e1 1f 40 fd	ldr	d1, [sp, #0x38]
    3ccc:	21 40 65 1e	frintm	d1, d1
    3cd0:	00 20 61 1e	fcmp	d0, d1
    3cd4:	e1 01 00 54	b.ne	0x3d10
    3cd8:	01 00 00 14	b	0x3cdc
    3cdc:	e0 1f 40 fd	ldr	d0, [sp, #0x38]
    3ce0:	01 10 6e 1e	fmov	d1, #1.00000000
    3ce4:	00 20 61 1e	fcmp	d0, d1
    3ce8:	44 01 00 54	b.mi	0x3d10
    3cec:	01 00 00 14	b	0x3cf0
    3cf0:	e0 1f 40 fd	ldr	d0, [sp, #0x38]
    3cf4:	a2 43 5e bc	ldur	s2, [x29, #-0x1c]
    3cf8:	41 1c a2 4e	mov.16b	v1, v2
    3cfc:	21 a4 20 0f	sshll.2d	v1, v1, #0x0
    3d00:	21 d8 61 5e	scvtf	d1, d1
    3d04:	00 20 61 1e	fcmp	d0, d1
    3d08:	ed 02 00 54	b.le	0x3d64
    3d0c:	01 00 00 14	b	0x3d10
    3d10:	00 02 80 d2	mov	x0, #0x10
    3d14:	40 45 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    3d18:	e0 07 00 f9	str	x0, [sp, #0x8]
    3d1c:	a1 28 00 d0	adrp	x1, 1302 ; 0x519000
    3d20:	21 34 01 91	add	x1, x1, #0x4d ; literal pool for: "pages contains an invalid page number"
    3d24:	50 43 14 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
    3d28:	01 00 00 14	b	0x3d2c
    3d2c:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    3d30:	01 39 00 b0	adrp	x1, 1825 ; 0x724000
    3d34:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    3d38:	02 39 00 b0	adrp	x2, 1825 ; 0x724000
    3d3c:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    3d40:	50 45 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    3d44:	41 00 00 14	b	0x3e48
    3d48:	e8 03 00 aa	mov	x8, x0
    3d4c:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    3d50:	a8 83 1d f8	stur	x8, [x29, #-0x28]
    3d54:	e8 03 01 aa	mov	x8, x1
    3d58:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
    3d5c:	3d 45 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    3d60:	35 00 00 14	b	0x3e34
    3d64:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    3d68:	e0 1f 40 fd	ldr	d0, [sp, #0x38]
    3d6c:	08 00 78 1e	fcvtzs	w8, d0
    3d70:	e1 d3 00 91	add	x1, sp, #0x34
    3d74:	e8 37 00 b9	str	w8, [sp, #0x34]
    3d78:	64 0e 00 94	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEE9push_backB9nqe210106EOi
    3d7c:	01 00 00 14	b	0x3d80
    3d80:	01 00 00 14	b	0x3d84
    3d84:	a8 43 5b b8	ldur	w8, [x29, #-0x4c]
    3d88:	08 05 00 11	add	w8, w8, #0x1
    3d8c:	a8 43 1b b8	stur	w8, [x29, #-0x4c]
    3d90:	ae ff ff 17	b	0x3c48
    3d94:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    3d98:	67 0e 00 94	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE5emptyB9nqe210106Ev
    3d9c:	e0 02 00 36	tbz	w0, #0x0, 0x3df8
    3da0:	01 00 00 14	b	0x3da4
    3da4:	00 02 80 d2	mov	x0, #0x10
    3da8:	1b 45 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    3dac:	e0 03 00 f9	str	x0, [sp]
    3db0:	a1 28 00 d0	adrp	x1, 1302 ; 0x519000
    3db4:	21 cc 01 91	add	x1, x1, #0x73 ; literal pool for: "pages must not be empty"
    3db8:	2b 43 14 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
    3dbc:	01 00 00 14	b	0x3dc0
    3dc0:	e0 03 40 f9	ldr	x0, [sp]
    3dc4:	01 39 00 b0	adrp	x1, 1825 ; 0x724000
    3dc8:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    3dcc:	02 39 00 b0	adrp	x2, 1825 ; 0x724000
    3dd0:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    3dd4:	2b 45 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    3dd8:	1c 00 00 14	b	0x3e48
    3ddc:	e8 03 00 aa	mov	x8, x0
    3de0:	e0 03 40 f9	ldr	x0, [sp]
    3de4:	a8 83 1d f8	stur	x8, [x29, #-0x28]
    3de8:	e8 03 01 aa	mov	x8, x1
    3dec:	a8 43 1d b8	stur	w8, [x29, #-0x2c]
    3df0:	18 45 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    3df4:	10 00 00 14	b	0x3e34
    3df8:	28 00 80 52	mov	w8, #0x1
    3dfc:	09 01 00 12	and	w9, w8, #0x1
    3e00:	29 01 08 0a	and	w9, w9, w8
    3e04:	a9 33 1e 38	sturb	w9, [x29, #-0x1d]
    3e08:	a8 c3 1c b8	stur	w8, [x29, #-0x34]
    3e0c:	01 00 00 14	b	0x3e10
    3e10:	a8 33 5e 38	ldurb	w8, [x29, #-0x1d]
    3e14:	a8 00 00 37	tbnz	w8, #0x0, 0x3e28
    3e18:	01 00 00 14	b	0x3e1c
    3e1c:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    3e20:	15 01 00 94	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
    3e24:	01 00 00 14	b	0x3e28
    3e28:	fd 7b 4a a9	ldp	x29, x30, [sp, #0xa0]
    3e2c:	ff c3 02 91	add	sp, sp, #0xb0
    3e30:	c0 03 5f d6	ret
    3e34:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    3e38:	0f 01 00 94	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
    3e3c:	01 00 00 14	b	0x3e40
    3e40:	a0 83 5d f8	ldur	x0, [x29, #-0x28]
    3e44:	e4 42 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
    3e48:	20 00 20 d4	brk	#0x1
