/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_19TextValueEP10napi_env__RKNSt3__17variantIJDnbdNS2_12basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEEEE:
   12314:	ff 83 01 d1	sub	sp, sp, #0x60
   12318:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   1231c:	fd 43 01 91	add	x29, sp, #0x50
   12320:	e8 0b 00 f9	str	x8, [sp, #0x10]
   12324:	a8 83 1f f8	stur	x8, [x29, #-0x8]
   12328:	a0 03 1f f8	stur	x0, [x29, #-0x10]
   1232c:	a1 83 1e f8	stur	x1, [x29, #-0x18]
   12330:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   12334:	70 00 00 94	bl	__ZNSt3__117holds_alternativeB9nqe210106IDnJDnbdNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEEEEbRKNS_7variantIJDpT0_EEE
   12338:	e0 00 00 36	tbz	w0, #0x0, 0x12354
   1233c:	01 00 00 14	b	0x12340
   12340:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
   12344:	21 28 00 f0	adrp	x1, 1287 ; 0x519000
   12348:	21 20 1a 91	add	x1, x1, #0x688 ; literal pool for: ""
   1234c:	fa bd ff 97	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106ILi0EEEPKc
   12350:	2f 00 00 14	b	0x1240c
   12354:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   12358:	70 00 00 94	bl	__ZNSt3__16get_ifB9nqe210106INS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEJDnbdS6_EEEu13__add_pointerIKT_EPKNS_7variantIJDpT0_EEE
   1235c:	a0 03 1e f8	stur	x0, [x29, #-0x20]
   12360:	a8 03 5e f8	ldur	x8, [x29, #-0x20]
   12364:	c8 00 00 b4	cbz	x8, 0x1237c
   12368:	01 00 00 14	b	0x1236c
   1236c:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
   12370:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   12374:	34 0a 14 94	bl	0x514c44 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_
   12378:	25 00 00 14	b	0x1240c
   1237c:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   12380:	6f 00 00 94	bl	__ZNSt3__16get_ifB9nqe210106IbJDnbdNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEEEEu13__add_pointerIKT_EPKNS_7variantIJDpT0_EEE
   12384:	e0 17 00 f9	str	x0, [sp, #0x28]
   12388:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   1238c:	c8 01 00 b4	cbz	x8, 0x123c4
   12390:	01 00 00 14	b	0x12394
   12394:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
   12398:	e8 17 40 f9	ldr	x8, [sp, #0x28]
   1239c:	0a 01 40 39	ldrb	w10, [x8]
   123a0:	29 28 00 f0	adrp	x9, 1287 ; 0x519000
   123a4:	29 55 0b 91	add	x9, x9, #0x2d5 ; literal pool for: "false"
   123a8:	28 28 00 f0	adrp	x8, 1287 ; 0x519000
   123ac:	08 41 0b 91	add	x8, x8, #0x2d0 ; literal pool for: "true"
   123b0:	4a 01 00 12	and	w10, w10, #0x1
   123b4:	4a 01 00 72	ands	w10, w10, #0x1
   123b8:	01 11 89 9a	csel	x1, x8, x9, ne
   123bc:	de bd ff 97	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106ILi0EEEPKc
   123c0:	13 00 00 14	b	0x1240c
   123c4:	a8 03 5f f8	ldur	x8, [x29, #-0x10]
   123c8:	e8 07 00 f9	str	x8, [sp, #0x8]
   123cc:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   123d0:	64 00 00 94	bl	__ZNSt3__13getB9nqe210106IdJDnbdNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEEEERKT_RKNS_7variantIJDpT0_EEE
   123d4:	e8 03 00 aa	mov	x8, x0
   123d8:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   123dc:	00 01 40 fd	ldr	d0, [x8]
   123e0:	e1 83 00 91	add	x1, sp, #0x20
   123e4:	9d 0c 14 94	bl	0x515658 ; symbol stub for: _napi_create_double
   123e8:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   123ec:	e1 13 40 f9	ldr	x1, [sp, #0x20]
   123f0:	e2 63 00 91	add	x2, sp, #0x18
   123f4:	93 0c 14 94	bl	0x515640 ; symbol stub for: _napi_coerce_to_string
   123f8:	e8 0b 40 f9	ldr	x8, [sp, #0x10]
   123fc:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   12400:	e1 0f 40 f9	ldr	x1, [sp, #0x18]
   12404:	e2 c7 ff 97	bl	__ZN12_GLOBAL__N_110ReadStringEP10napi_env__P12napi_value__
   12408:	01 00 00 14	b	0x1240c
   1240c:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   12410:	ff 83 01 91	add	sp, sp, #0x60
   12414:	c0 03 5f d6	ret
