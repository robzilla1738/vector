/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_114ReadFillStatesEP10napi_env__P12napi_value__:
    b3fc:	ff 83 05 d1	sub	sp, sp, #0x160
    b400:	fc 6f 14 a9	stp	x28, x27, [sp, #0x140]
    b404:	fd 7b 15 a9	stp	x29, x30, [sp, #0x150]
    b408:	fd 43 05 91	add	x29, sp, #0x150
    b40c:	e8 33 00 f9	str	x8, [sp, #0x60]
    b410:	a8 83 1e f8	stur	x8, [x29, #-0x18]
    b414:	a0 03 1e f8	stur	x0, [x29, #-0x20]
    b418:	a1 83 1d f8	stur	x1, [x29, #-0x28]
    b41c:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    b420:	a1 83 5d f8	ldur	x1, [x29, #-0x28]
    b424:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b428:	42 e4 04 91	add	x2, x2, #0x139 ; literal pool for: "fields"
    b42c:	a8 e3 ff 97	bl	__ZN12_GLOBAL__N_13HasEP10napi_env__P12napi_value__PKc
    b430:	c0 02 00 37	tbnz	w0, #0x0, 0xb488
    b434:	01 00 00 14	b	0xb438
    b438:	00 02 80 d2	mov	x0, #0x10
    b43c:	76 27 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    b440:	e0 2f 00 f9	str	x0, [sp, #0x58]
    b444:	61 28 00 d0	adrp	x1, 1294 ; 0x519000
    b448:	21 00 05 91	add	x1, x1, #0x140 ; literal pool for: "Missing fields"
    b44c:	86 25 14 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
    b450:	01 00 00 14	b	0xb454
    b454:	e0 2f 40 f9	ldr	x0, [sp, #0x58]
    b458:	c1 38 00 b0	adrp	x1, 1817 ; 0x724000
    b45c:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    b460:	c2 38 00 b0	adrp	x2, 1817 ; 0x724000
    b464:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    b468:	86 27 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    b46c:	e8 03 00 aa	mov	x8, x0
    b470:	e0 2f 40 f9	ldr	x0, [sp, #0x58]
    b474:	a8 03 1d f8	stur	x8, [x29, #-0x30]
    b478:	e8 03 01 aa	mov	x8, x1
    b47c:	a8 c3 1c b8	stur	w8, [x29, #-0x34]
    b480:	74 27 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    b484:	ec 00 00 14	b	0xb834
    b488:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    b48c:	a1 83 5d f8	ldur	x1, [x29, #-0x28]
    b490:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b494:	42 e4 04 91	add	x2, x2, #0x139 ; literal pool for: "fields"
    b498:	ae e3 ff 97	bl	__ZN12_GLOBAL__N_13GetEP10napi_env__P12napi_value__PKc
    b49c:	a0 03 1c f8	stur	x0, [x29, #-0x40]
    b4a0:	a2 07 01 d1	sub	x2, x29, #0x41
    b4a4:	bf f3 1b 38	sturb	wzr, [x29, #-0x41]
    b4a8:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    b4ac:	a1 03 5c f8	ldur	x1, [x29, #-0x40]
    b4b0:	94 28 14 94	bl	0x515700 ; symbol stub for: _napi_is_array
    b4b4:	a8 f3 5b 38	ldurb	w8, [x29, #-0x41]
    b4b8:	c8 02 00 37	tbnz	w8, #0x0, 0xb510
    b4bc:	01 00 00 14	b	0xb4c0
    b4c0:	00 02 80 d2	mov	x0, #0x10
    b4c4:	54 27 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    b4c8:	e0 2b 00 f9	str	x0, [sp, #0x50]
    b4cc:	61 28 00 d0	adrp	x1, 1294 ; 0x519000
    b4d0:	21 3c 05 91	add	x1, x1, #0x14f ; literal pool for: "fields must be an array"
    b4d4:	64 25 14 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
    b4d8:	01 00 00 14	b	0xb4dc
    b4dc:	e0 2b 40 f9	ldr	x0, [sp, #0x50]
    b4e0:	c1 38 00 b0	adrp	x1, 1817 ; 0x724000
    b4e4:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    b4e8:	c2 38 00 b0	adrp	x2, 1817 ; 0x724000
    b4ec:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    b4f0:	64 27 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    b4f4:	e8 03 00 aa	mov	x8, x0
    b4f8:	e0 2b 40 f9	ldr	x0, [sp, #0x50]
    b4fc:	a8 03 1d f8	stur	x8, [x29, #-0x30]
    b500:	e8 03 01 aa	mov	x8, x1
    b504:	a8 c3 1c b8	stur	w8, [x29, #-0x34]
    b508:	52 27 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    b50c:	ca 00 00 14	b	0xb834
    b510:	a2 23 01 d1	sub	x2, x29, #0x48
    b514:	08 00 80 52	mov	w8, #0x0
    b518:	e8 4f 00 b9	str	w8, [sp, #0x4c]
    b51c:	bf 83 1b b8	stur	wzr, [x29, #-0x48]
    b520:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    b524:	a1 03 5c f8	ldur	x1, [x29, #-0x40]
    b528:	5b 28 14 94	bl	0x515694 ; symbol stub for: _napi_get_array_length
    b52c:	e8 4f 40 b9	ldr	w8, [sp, #0x4c]
    b530:	e0 33 40 f9	ldr	x0, [sp, #0x60]
    b534:	08 01 00 12	and	w8, w8, #0x1
    b538:	08 01 00 12	and	w8, w8, #0x1
    b53c:	a8 73 1b 38	sturb	w8, [x29, #-0x49]
    b540:	17 03 00 94	bl	__ZNSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEEC1B9nqe210106Ev
    b544:	bf 03 1b b8	stur	wzr, [x29, #-0x50]
    b548:	01 00 00 14	b	0xb54c
    b54c:	a8 03 5b b8	ldur	w8, [x29, #-0x50]
    b550:	a9 83 5b b8	ldur	w9, [x29, #-0x48]
    b554:	08 01 09 6b	subs	w8, w8, w9
    b558:	a2 11 00 54	b.hs	0xb78c
    b55c:	01 00 00 14	b	0xb560
    b560:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    b564:	a1 03 5c f8	ldur	x1, [x29, #-0x40]
    b568:	a2 03 5b b8	ldur	w2, [x29, #-0x50]
    b56c:	a3 63 01 d1	sub	x3, x29, #0x58
    b570:	52 28 14 94	bl	0x5156b8 ; symbol stub for: _napi_get_element
    b574:	01 00 00 14	b	0xb578
    b578:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    b57c:	a1 83 5a f8	ldur	x1, [x29, #-0x58]
    b580:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b584:	42 48 03 91	add	x2, x2, #0xd2 ; literal pool for: "field_id"
    b588:	51 e3 ff 97	bl	__ZN12_GLOBAL__N_13HasEP10napi_env__P12napi_value__PKc
    b58c:	e0 4b 00 b9	str	w0, [sp, #0x48]
    b590:	01 00 00 14	b	0xb594
    b594:	ea 4b 40 b9	ldr	w10, [sp, #0x48]
    b598:	69 28 00 d0	adrp	x9, 1294 ; 0x519000
    b59c:	29 9d 05 91	add	x9, x9, #0x167 ; literal pool for: "name"
    b5a0:	68 28 00 d0	adrp	x8, 1294 ; 0x519000
    b5a4:	08 49 03 91	add	x8, x8, #0xd2 ; literal pool for: "field_id"
    b5a8:	4a 01 00 72	ands	w10, w10, #0x1
    b5ac:	08 11 89 9a	csel	x8, x8, x9, ne
    b5b0:	a8 03 1a f8	stur	x8, [x29, #-0x60]
    b5b4:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    b5b8:	a1 83 5a f8	ldur	x1, [x29, #-0x58]
    b5bc:	a2 03 5a f8	ldur	x2, [x29, #-0x60]
    b5c0:	a8 e3 01 d1	sub	x8, x29, #0x78
    b5c4:	8c e0 ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
    b5c8:	01 00 00 14	b	0xb5cc
    b5cc:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    b5d0:	a1 83 5a f8	ldur	x1, [x29, #-0x58]
    b5d4:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b5d8:	42 b0 05 91	add	x2, x2, #0x16c ; literal pool for: "value"
    b5dc:	3c e3 ff 97	bl	__ZN12_GLOBAL__N_13HasEP10napi_env__P12napi_value__PKc
    b5e0:	e0 47 00 b9	str	w0, [sp, #0x44]
    b5e4:	01 00 00 14	b	0xb5e8
    b5e8:	e8 47 40 b9	ldr	w8, [sp, #0x44]
    b5ec:	e8 06 00 37	tbnz	w8, #0x0, 0xb6c8
    b5f0:	01 00 00 14	b	0xb5f4
    b5f4:	28 00 80 52	mov	w8, #0x1
    b5f8:	08 01 00 12	and	w8, w8, #0x1
    b5fc:	08 01 00 12	and	w8, w8, #0x1
    b600:	a8 f3 16 38	sturb	w8, [x29, #-0x91]
    b604:	00 02 80 d2	mov	x0, #0x10
    b608:	03 27 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    b60c:	e0 1f 00 f9	str	x0, [sp, #0x38]
    b610:	a8 43 02 d1	sub	x8, x29, #0x90
    b614:	60 28 00 d0	adrp	x0, 1294 ; 0x519000
    b618:	00 c8 05 91	add	x0, x0, #0x172 ; literal pool for: "Missing value for field "
    b61c:	a1 e3 01 d1	sub	x1, x29, #0x78
    b620:	ca 26 14 94	bl	0x515148 ; symbol stub for: __ZNSt3__1plIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_RKS9_
    b624:	01 00 00 14	b	0xb628
    b628:	e0 1f 40 f9	ldr	x0, [sp, #0x38]
    b62c:	a1 43 02 d1	sub	x1, x29, #0x90
    b630:	10 25 14 94	bl	0x514a70 ; symbol stub for: __ZNSt13runtime_errorC1ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
    b634:	01 00 00 14	b	0xb638
    b638:	e0 1f 40 f9	ldr	x0, [sp, #0x38]
    b63c:	08 00 80 52	mov	w8, #0x0
    b640:	08 01 00 12	and	w8, w8, #0x1
    b644:	08 01 00 12	and	w8, w8, #0x1
    b648:	a8 f3 16 38	sturb	w8, [x29, #-0x91]
    b64c:	c1 38 00 b0	adrp	x1, 1817 ; 0x724000
    b650:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    b654:	c2 38 00 b0	adrp	x2, 1817 ; 0x724000
    b658:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    b65c:	09 27 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    b660:	77 00 00 14	b	0xb83c
    b664:	a0 03 1d f8	stur	x0, [x29, #-0x30]
    b668:	e8 03 01 aa	mov	x8, x1
    b66c:	a8 c3 1c b8	stur	w8, [x29, #-0x34]
    b670:	6e 00 00 14	b	0xb828
    b674:	a0 03 1d f8	stur	x0, [x29, #-0x30]
    b678:	e8 03 01 aa	mov	x8, x1
    b67c:	a8 c3 1c b8	stur	w8, [x29, #-0x34]
    b680:	40 00 00 14	b	0xb780
    b684:	a0 03 1d f8	stur	x0, [x29, #-0x30]
    b688:	e8 03 01 aa	mov	x8, x1
    b68c:	a8 c3 1c b8	stur	w8, [x29, #-0x34]
    b690:	07 00 00 14	b	0xb6ac
    b694:	a0 03 1d f8	stur	x0, [x29, #-0x30]
    b698:	e8 03 01 aa	mov	x8, x1
    b69c:	a8 c3 1c b8	stur	w8, [x29, #-0x34]
    b6a0:	a0 43 02 d1	sub	x0, x29, #0x90
    b6a4:	6b 25 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    b6a8:	01 00 00 14	b	0xb6ac
    b6ac:	a8 f3 56 38	ldurb	w8, [x29, #-0x91]
    b6b0:	a8 00 00 36	tbz	w8, #0x0, 0xb6c4
    b6b4:	01 00 00 14	b	0xb6b8
    b6b8:	e0 1f 40 f9	ldr	x0, [sp, #0x38]
    b6bc:	e5 26 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    b6c0:	01 00 00 14	b	0xb6c4
    b6c4:	2f 00 00 14	b	0xb780
    b6c8:	a8 03 5e f8	ldur	x8, [x29, #-0x20]
    b6cc:	e8 17 00 f9	str	x8, [sp, #0x28]
    b6d0:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    b6d4:	a1 83 5a f8	ldur	x1, [x29, #-0x58]
    b6d8:	62 28 00 d0	adrp	x2, 1294 ; 0x519000
    b6dc:	42 b0 05 91	add	x2, x2, #0x16c ; literal pool for: "value"
    b6e0:	1c e3 ff 97	bl	__ZN12_GLOBAL__N_13GetEP10napi_env__P12napi_value__PKc
    b6e4:	e0 1b 00 f9	str	x0, [sp, #0x30]
    b6e8:	01 00 00 14	b	0xb6ec
    b6ec:	e1 1b 40 f9	ldr	x1, [sp, #0x30]
    b6f0:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    b6f4:	e8 e3 01 91	add	x8, sp, #0x78
    b6f8:	1d 03 00 94	bl	__ZN12_GLOBAL__N_114ReadFieldValueEP10napi_env__P12napi_value__
    b6fc:	01 00 00 14	b	0xb700
    b700:	e8 e3 01 91	add	x8, sp, #0x78
    b704:	e8 0b 00 f9	str	x8, [sp, #0x10]
    b708:	ff 63 02 39	strb	wzr, [sp, #0x98]
    b70c:	ff 67 02 39	strb	wzr, [sp, #0x99]
    b710:	00 a1 00 91	add	x0, x8, #0x28
    b714:	72 e2 ff 97	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106Ev
    b718:	e0 33 40 f9	ldr	x0, [sp, #0x60]
    b71c:	e2 0b 40 f9	ldr	x2, [sp, #0x10]
    b720:	a1 e3 01 d1	sub	x1, x29, #0x78
    b724:	a9 02 00 94	bl	__ZNSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEE16insert_or_assignB9nqe210106IS8_EENSB_INS_14__map_iteratorINS_15__tree_iteratorINS_12__value_typeIS6_S8_EEPNS_11__tree_nodeISK_PvEElEEEEbEERSC_OT_
    b728:	e0 0f 00 f9	str	x0, [sp, #0x18]
    b72c:	e1 13 00 f9	str	x1, [sp, #0x20]
    b730:	01 00 00 14	b	0xb734
    b734:	e8 13 40 f9	ldr	x8, [sp, #0x20]
    b738:	e9 0f 40 f9	ldr	x9, [sp, #0x18]
    b73c:	e9 37 00 f9	str	x9, [sp, #0x68]
    b740:	e8 3b 00 f9	str	x8, [sp, #0x70]
    b744:	e0 e3 01 91	add	x0, sp, #0x78
    b748:	62 03 00 94	bl	__ZN12_GLOBAL__N_19FillStateD1Ev
    b74c:	a0 e3 01 d1	sub	x0, x29, #0x78
    b750:	40 25 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    b754:	01 00 00 14	b	0xb758
    b758:	a8 03 5b b8	ldur	w8, [x29, #-0x50]
    b75c:	08 05 00 11	add	w8, w8, #0x1
    b760:	a8 03 1b b8	stur	w8, [x29, #-0x50]
    b764:	7a ff ff 17	b	0xb54c
    b768:	a0 03 1d f8	stur	x0, [x29, #-0x30]
    b76c:	e8 03 01 aa	mov	x8, x1
    b770:	a8 c3 1c b8	stur	w8, [x29, #-0x34]
    b774:	e0 e3 01 91	add	x0, sp, #0x78
    b778:	56 03 00 94	bl	__ZN12_GLOBAL__N_19FillStateD1Ev
    b77c:	01 00 00 14	b	0xb780
    b780:	a0 e3 01 d1	sub	x0, x29, #0x78
    b784:	33 25 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    b788:	28 00 00 14	b	0xb828
    b78c:	e0 33 40 f9	ldr	x0, [sp, #0x60]
    b790:	5b 03 00 94	bl	__ZNKSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEE5emptyB9nqe210106Ev
    b794:	e0 02 00 36	tbz	w0, #0x0, 0xb7f0
    b798:	01 00 00 14	b	0xb79c
    b79c:	00 02 80 d2	mov	x0, #0x10
    b7a0:	9d 26 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    b7a4:	e0 07 00 f9	str	x0, [sp, #0x8]
    b7a8:	61 28 00 d0	adrp	x1, 1294 ; 0x519000
    b7ac:	21 2c 06 91	add	x1, x1, #0x18b ; literal pool for: "No field values provided"
    b7b0:	ad 24 14 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
    b7b4:	01 00 00 14	b	0xb7b8
    b7b8:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    b7bc:	c1 38 00 b0	adrp	x1, 1817 ; 0x724000
    b7c0:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    b7c4:	c2 38 00 b0	adrp	x2, 1817 ; 0x724000
    b7c8:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    b7cc:	ad 26 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    b7d0:	1b 00 00 14	b	0xb83c
    b7d4:	e8 03 00 aa	mov	x8, x0
    b7d8:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    b7dc:	a8 03 1d f8	stur	x8, [x29, #-0x30]
    b7e0:	e8 03 01 aa	mov	x8, x1
    b7e4:	a8 c3 1c b8	stur	w8, [x29, #-0x34]
    b7e8:	9a 26 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    b7ec:	0f 00 00 14	b	0xb828
    b7f0:	28 00 80 52	mov	w8, #0x1
    b7f4:	08 01 00 12	and	w8, w8, #0x1
    b7f8:	08 01 00 12	and	w8, w8, #0x1
    b7fc:	a8 73 1b 38	sturb	w8, [x29, #-0x49]
    b800:	a8 73 5b 38	ldurb	w8, [x29, #-0x49]
    b804:	a8 00 00 37	tbnz	w8, #0x0, 0xb818
    b808:	01 00 00 14	b	0xb80c
    b80c:	e0 33 40 f9	ldr	x0, [sp, #0x60]
    b810:	58 02 00 94	bl	__ZNSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEED1B9nqe210106Ev
    b814:	01 00 00 14	b	0xb818
    b818:	fd 7b 55 a9	ldp	x29, x30, [sp, #0x150]
    b81c:	fc 6f 54 a9	ldp	x28, x27, [sp, #0x140]
    b820:	ff 83 05 91	add	sp, sp, #0x160
    b824:	c0 03 5f d6	ret
    b828:	e0 33 40 f9	ldr	x0, [sp, #0x60]
    b82c:	51 02 00 94	bl	__ZNSt3__13mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN12_GLOBAL__N_19FillStateENS_4lessIS6_EENS4_INS_4pairIKS6_S8_EEEEED1B9nqe210106Ev
    b830:	01 00 00 14	b	0xb834
    b834:	a0 03 5d f8	ldur	x0, [x29, #-0x30]
    b838:	67 24 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
    b83c:	20 00 20 d4	brk	#0x1
