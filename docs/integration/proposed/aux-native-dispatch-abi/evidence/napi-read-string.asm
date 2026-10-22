out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_110ReadStringEP10napi_env__P12napi_value__:
    1a2c:	ff c3 01 d1	sub	sp, sp, #0x70
    1a30:	fd 7b 06 a9	stp	x29, x30, [sp, #0x60]
    1a34:	fd 83 01 91	add	x29, sp, #0x60
    1a38:	e8 03 00 f9	str	x8, [sp]
    1a3c:	a8 83 1f f8	stur	x8, [x29, #-0x8]
    1a40:	a0 03 1f f8	stur	x0, [x29, #-0x10]
    1a44:	a1 83 1e f8	stur	x1, [x29, #-0x18]
    1a48:	a4 83 00 d1	sub	x4, x29, #0x20
    1a4c:	e4 0f 00 f9	str	x4, [sp, #0x18]
    1a50:	03 00 80 d2	mov	x3, #0x0
    1a54:	bf 03 1e f8	stur	xzr, [x29, #-0x20]
    1a58:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    1a5c:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
    1a60:	02 00 80 d2	mov	x2, #0x0
    1a64:	21 4f 14 94	bl	0x5156e8 ; symbol stub for: _napi_get_value_string_utf8
    1a68:	e0 03 40 f9	ldr	x0, [sp]
    1a6c:	02 00 80 52	mov	w2, #0x0
    1a70:	48 00 00 12	and	w8, w2, #0x1
    1a74:	08 01 00 12	and	w8, w8, #0x1
    1a78:	a8 f3 1d 38	sturb	w8, [x29, #-0x21]
    1a7c:	a8 03 5e f8	ldur	x8, [x29, #-0x20]
    1a80:	01 05 00 91	add	x1, x8, #0x1
    1a84:	5c 00 00 94	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106Emc
    1a88:	e0 03 40 f9	ldr	x0, [sp]
    1a8c:	a8 03 5f f8	ldur	x8, [x29, #-0x10]
    1a90:	e8 13 00 f9	str	x8, [sp, #0x20]
    1a94:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
    1a98:	e8 07 00 f9	str	x8, [sp, #0x8]
    1a9c:	65 00 00 94	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4dataB9nqe210106Ev
    1aa0:	e1 03 00 aa	mov	x1, x0
    1aa4:	e0 03 40 f9	ldr	x0, [sp]
    1aa8:	e1 0b 00 f9	str	x1, [sp, #0x10]
    1aac:	6b 00 00 94	bl	__ZNKSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4sizeB9nqe210106Ev
    1ab0:	e1 07 40 f9	ldr	x1, [sp, #0x8]
    1ab4:	e2 0b 40 f9	ldr	x2, [sp, #0x10]
    1ab8:	e4 0f 40 f9	ldr	x4, [sp, #0x18]
    1abc:	e3 03 00 aa	mov	x3, x0
    1ac0:	e0 13 40 f9	ldr	x0, [sp, #0x20]
    1ac4:	09 4f 14 94	bl	0x5156e8 ; symbol stub for: _napi_get_value_string_utf8
    1ac8:	01 00 00 14	b	0x1acc
    1acc:	e0 03 40 f9	ldr	x0, [sp]
    1ad0:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
    1ad4:	76 00 00 94	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeB9nqe210106Em
    1ad8:	01 00 00 14	b	0x1adc
    1adc:	28 00 80 52	mov	w8, #0x1
    1ae0:	08 01 00 12	and	w8, w8, #0x1
    1ae4:	08 01 00 12	and	w8, w8, #0x1
    1ae8:	a8 f3 1d 38	sturb	w8, [x29, #-0x21]
    1aec:	a8 f3 5d 38	ldurb	w8, [x29, #-0x21]
    1af0:	88 01 00 37	tbnz	w8, #0x0, 0x1b20
    1af4:	08 00 00 14	b	0x1b14
    1af8:	e8 03 00 aa	mov	x8, x0
    1afc:	e0 03 40 f9	ldr	x0, [sp]
    1b00:	e8 1b 00 f9	str	x8, [sp, #0x30]
    1b04:	e8 03 01 aa	mov	x8, x1
    1b08:	e8 2f 00 b9	str	w8, [sp, #0x2c]
    1b0c:	51 4c 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    1b10:	07 00 00 14	b	0x1b2c
    1b14:	e0 03 40 f9	ldr	x0, [sp]
    1b18:	4e 4c 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    1b1c:	01 00 00 14	b	0x1b20
    1b20:	fd 7b 46 a9	ldp	x29, x30, [sp, #0x60]
    1b24:	ff c3 01 91	add	sp, sp, #0x70
    1b28:	c0 03 5f d6	ret
    1b2c:	e0 1b 40 f9	ldr	x0, [sp, #0x30]
    1b30:	a9 4b 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
__ZN12_GLOBAL__N_110ReadStringEP10napi_env__P12napi_value__:
    438c:	ff c3 01 d1	sub	sp, sp, #0x70
    4390:	fd 7b 06 a9	stp	x29, x30, [sp, #0x60]
    4394:	fd 83 01 91	add	x29, sp, #0x60
    4398:	e8 03 00 f9	str	x8, [sp]
    439c:	a8 83 1f f8	stur	x8, [x29, #-0x8]
    43a0:	a0 03 1f f8	stur	x0, [x29, #-0x10]
    43a4:	a1 83 1e f8	stur	x1, [x29, #-0x18]
    43a8:	a4 83 00 d1	sub	x4, x29, #0x20
    43ac:	e4 0f 00 f9	str	x4, [sp, #0x18]
    43b0:	03 00 80 d2	mov	x3, #0x0
    43b4:	bf 03 1e f8	stur	xzr, [x29, #-0x20]
    43b8:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
    43bc:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
    43c0:	02 00 80 d2	mov	x2, #0x0
    43c4:	c9 44 14 94	bl	0x5156e8 ; symbol stub for: _napi_get_value_string_utf8
    43c8:	e0 03 40 f9	ldr	x0, [sp]
    43cc:	02 00 80 52	mov	w2, #0x0
    43d0:	48 00 00 12	and	w8, w2, #0x1
    43d4:	08 01 00 12	and	w8, w8, #0x1
    43d8:	a8 f3 1d 38	sturb	w8, [x29, #-0x21]
    43dc:	a8 03 5e f8	ldur	x8, [x29, #-0x20]
    43e0:	01 05 00 91	add	x1, x8, #0x1
    43e4:	04 f6 ff 97	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106Emc
    43e8:	e0 03 40 f9	ldr	x0, [sp]
    43ec:	a8 03 5f f8	ldur	x8, [x29, #-0x10]
    43f0:	e8 13 00 f9	str	x8, [sp, #0x20]
    43f4:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
    43f8:	e8 07 00 f9	str	x8, [sp, #0x8]
    43fc:	0d f6 ff 97	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4dataB9nqe210106Ev
    4400:	e1 03 00 aa	mov	x1, x0
    4404:	e0 03 40 f9	ldr	x0, [sp]
    4408:	e1 0b 00 f9	str	x1, [sp, #0x10]
    440c:	13 f6 ff 97	bl	__ZNKSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4sizeB9nqe210106Ev
    4410:	e1 07 40 f9	ldr	x1, [sp, #0x8]
    4414:	e2 0b 40 f9	ldr	x2, [sp, #0x10]
    4418:	e4 0f 40 f9	ldr	x4, [sp, #0x18]
    441c:	e3 03 00 aa	mov	x3, x0
    4420:	e0 13 40 f9	ldr	x0, [sp, #0x20]
    4424:	b1 44 14 94	bl	0x5156e8 ; symbol stub for: _napi_get_value_string_utf8
    4428:	01 00 00 14	b	0x442c
    442c:	e0 03 40 f9	ldr	x0, [sp]
    4430:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
    4434:	1e f6 ff 97	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeB9nqe210106Em
    4438:	01 00 00 14	b	0x443c
    443c:	28 00 80 52	mov	w8, #0x1
    4440:	08 01 00 12	and	w8, w8, #0x1
    4444:	08 01 00 12	and	w8, w8, #0x1
    4448:	a8 f3 1d 38	sturb	w8, [x29, #-0x21]
    444c:	a8 f3 5d 38	ldurb	w8, [x29, #-0x21]
    4450:	88 01 00 37	tbnz	w8, #0x0, 0x4480
    4454:	08 00 00 14	b	0x4474
    4458:	e8 03 00 aa	mov	x8, x0
    445c:	e0 03 40 f9	ldr	x0, [sp]
    4460:	e8 1b 00 f9	str	x8, [sp, #0x30]
    4464:	e8 03 01 aa	mov	x8, x1
    4468:	e8 2f 00 b9	str	w8, [sp, #0x2c]
    446c:	f9 41 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    4470:	07 00 00 14	b	0x448c
    4474:	e0 03 40 f9	ldr	x0, [sp]
    4478:	f6 41 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    447c:	01 00 00 14	b	0x4480
    4480:	fd 7b 46 a9	ldp	x29, x30, [sp, #0x60]
    4484:	ff c3 01 91	add	sp, sp, #0x70
    4488:	c0 03 5f d6	ret
    448c:	e0 1b 40 f9	ldr	x0, [sp, #0x30]
    4490:	51 41 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
