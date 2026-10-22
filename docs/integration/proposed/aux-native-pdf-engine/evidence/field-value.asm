/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_114ReadFieldValueEP10napi_env__P12napi_value__:
    c36c:	ff 83 02 d1	sub	sp, sp, #0xa0
    c370:	fd 7b 09 a9	stp	x29, x30, [sp, #0x90]
    c374:	fd 43 02 91	add	x29, sp, #0x90
    c378:	e8 17 00 f9	str	x8, [sp, #0x28]
    c37c:	a8 83 1f f8	stur	x8, [x29, #-0x8]
    c380:	a0 03 1f f8	stur	x0, [x29, #-0x10]
    c384:	a1 83 1e f8	stur	x1, [x29, #-0x18]
    c388:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    c38c:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
    c390:	a2 73 00 d1	sub	x2, x29, #0x1c
    c394:	ea 24 14 94	bl	0x51573c ; symbol stub for: _napi_typeof
    c398:	a8 43 5e b8	ldur	w8, [x29, #-0x1c]
    c39c:	08 05 00 71	subs	w8, w8, #0x1
    c3a0:	a0 00 00 54	b.eq	0xc3b4
    c3a4:	01 00 00 14	b	0xc3a8
    c3a8:	a8 43 5e b8	ldur	w8, [x29, #-0x1c]
    c3ac:	e8 00 00 35	cbnz	w8, 0xc3c8
    c3b0:	01 00 00 14	b	0xc3b4
    c3b4:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    c3b8:	a1 a3 00 d1	sub	x1, x29, #0x28
    c3bc:	bf 83 1d f8	stur	xzr, [x29, #-0x28]
    c3c0:	98 11 00 94	bl	__ZNSt3__17variantIJDnbdNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEEEC1B9nqe210106IDnLi0ELi0ELi0EDnLm0ELi0EEEOT_
    c3c4:	3e 00 00 14	b	0xc4bc
    c3c8:	a8 43 5e b8	ldur	w8, [x29, #-0x1c]
    c3cc:	08 09 00 71	subs	w8, w8, #0x2
    c3d0:	61 01 00 54	b.ne	0xc3fc
    c3d4:	01 00 00 14	b	0xc3d8
    c3d8:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    c3dc:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
    c3e0:	a2 a7 00 d1	sub	x2, x29, #0x29
    c3e4:	e2 13 00 f9	str	x2, [sp, #0x20]
    c3e8:	ba 24 14 94	bl	0x5156d0 ; symbol stub for: _napi_get_value_bool
    c3ec:	e1 13 40 f9	ldr	x1, [sp, #0x20]
    c3f0:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    c3f4:	98 11 00 94	bl	__ZNSt3__17variantIJDnbdNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEEEC1B9nqe210106IbLi0ELi0ELi0EbLm1ELi0EEEOT_
    c3f8:	31 00 00 14	b	0xc4bc
    c3fc:	a8 43 5e b8	ldur	w8, [x29, #-0x1c]
    c400:	08 0d 00 71	subs	w8, w8, #0x3
    c404:	61 01 00 54	b.ne	0xc430
    c408:	01 00 00 14	b	0xc40c
    c40c:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    c410:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
    c414:	a2 e3 00 d1	sub	x2, x29, #0x38
    c418:	e2 0f 00 f9	str	x2, [sp, #0x18]
    c41c:	b0 24 14 94	bl	0x5156dc ; symbol stub for: _napi_get_value_double
    c420:	e1 0f 40 f9	ldr	x1, [sp, #0x18]
    c424:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    c428:	98 11 00 94	bl	__ZNSt3__17variantIJDnbdNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEEEC1B9nqe210106IdLi0ELi0ELi0EdLm2ELi0EEEOT_
    c42c:	24 00 00 14	b	0xc4bc
    c430:	a8 43 5e b8	ldur	w8, [x29, #-0x1c]
    c434:	08 11 00 71	subs	w8, w8, #0x4
    c438:	a1 01 00 54	b.ne	0xc46c
    c43c:	01 00 00 14	b	0xc440
    c440:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    c444:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
    c448:	e8 03 01 91	add	x8, sp, #0x40
    c44c:	e8 0b 00 f9	str	x8, [sp, #0x10]
    c450:	cf df ff 97	bl	__ZN12_GLOBAL__N_110ReadStringEP10napi_env__P12napi_value__
    c454:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    c458:	e1 0b 40 f9	ldr	x1, [sp, #0x10]
    c45c:	98 11 00 94	bl	__ZNSt3__17variantIJDnbdNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEEEC1B9nqe210106IS6_Li0ELi0ELi0ES6_Lm3ELi0EEEOT_
    c460:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
    c464:	fb 21 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    c468:	15 00 00 14	b	0xc4bc
    c46c:	00 02 80 d2	mov	x0, #0x10
    c470:	69 23 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    c474:	e0 07 00 f9	str	x0, [sp, #0x8]
    c478:	61 28 00 b0	adrp	x1, 1293 ; 0x519000
    c47c:	21 90 06 91	add	x1, x1, #0x1a4 ; literal pool for: "Field value must be a string, number, boolean, or null"
    c480:	79 21 14 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
    c484:	01 00 00 14	b	0xc488
    c488:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    c48c:	c1 38 00 90	adrp	x1, 1816 ; 0x724000
    c490:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    c494:	c2 38 00 90	adrp	x2, 1816 ; 0x724000
    c498:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    c49c:	79 23 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    c4a0:	e8 03 00 aa	mov	x8, x0
    c4a4:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    c4a8:	e8 1f 00 f9	str	x8, [sp, #0x38]
    c4ac:	e8 03 01 aa	mov	x8, x1
    c4b0:	e8 37 00 b9	str	w8, [sp, #0x34]
    c4b4:	67 23 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    c4b8:	04 00 00 14	b	0xc4c8
    c4bc:	fd 7b 49 a9	ldp	x29, x30, [sp, #0x90]
    c4c0:	ff 83 02 91	add	sp, sp, #0xa0
    c4c4:	c0 03 5f d6	ret
    c4c8:	e0 1f 40 f9	ldr	x0, [sp, #0x38]
    c4cc:	42 21 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
