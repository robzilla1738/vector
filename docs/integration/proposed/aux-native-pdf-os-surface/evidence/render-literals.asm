/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_16RenderEP10napi_env__P12napi_value__:
   1d280:	fc 6f be a9	stp	x28, x27, [sp, #-0x20]!
   1d284:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
   1d288:	fd 43 00 91	add	x29, sp, #0x10
   1d28c:	ff 83 0f d1	sub	sp, sp, #0x3e0
   1d290:	28 38 00 f0	adrp	x8, 1799 ; 0x724000
   1d294:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   1d298:	08 01 40 f9	ldr	x8, [x8]
   1d29c:	a8 83 1e f8	stur	x8, [x29, #-0x18]
   1d2a0:	a0 03 1c f8	stur	x0, [x29, #-0x40]
   1d2a4:	a1 83 1b f8	stur	x1, [x29, #-0x48]
   1d2a8:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1d2ac:	a1 83 5b f8	ldur	x1, [x29, #-0x48]
   1d2b0:	a8 83 01 d1	sub	x8, x29, #0x60
   1d2b4:	c2 27 00 f0	adrp	x2, 1275 ; 0x518000
   1d2b8:	42 78 3c 91	add	x2, x2, #0xf1e ; literal pool for: "filePath"
   1d2bc:	4e 99 ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
   1d2c0:	01 00 00 14	b	0x1d2c4
   1d2c4:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1d2c8:	a1 83 5b f8	ldur	x1, [x29, #-0x48]
   1d2cc:	a8 e3 01 d1	sub	x8, x29, #0x78
   1d2d0:	e2 27 00 90	adrp	x2, 1276 ; 0x519000
   1d2d4:	42 ac 11 91	add	x2, x2, #0x46b ; literal pool for: "outputDir"
   1d2d8:	47 99 ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
   1d2dc:	01 00 00 14	b	0x1d2e0
   1d2e0:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1d2e4:	a1 83 5b f8	ldur	x1, [x29, #-0x48]
   1d2e8:	e2 27 00 90	adrp	x2, 1276 ; 0x519000
   1d2ec:	42 d4 11 91	add	x2, x2, #0x475 ; literal pool for: "maxDimension"
   1d2f0:	28 13 e8 d2	mov	x8, #0x4099000000000000
   1d2f4:	00 01 67 9e	fmov	d0, x8
   1d2f8:	20 02 00 94	bl	__ZN12_GLOBAL__N_114OptionalNumberEP10napi_env__P12napi_value__PKcd
   1d2fc:	e0 77 00 fd	str	d0, [sp, #0xe8]
   1d300:	01 00 00 14	b	0x1d304
   1d304:	e0 77 40 fd	ldr	d0, [sp, #0xe8]
   1d308:	a0 03 17 fc	stur	d0, [x29, #-0x90]
   1d30c:	a0 03 57 fc	ldur	d0, [x29, #-0x90]
   1d310:	08 0e e8 d2	mov	x8, #0x4070000000000000
   1d314:	01 01 67 9e	fmov	d1, x8
   1d318:	00 20 61 1e	fcmp	d0, d1
   1d31c:	04 01 00 54	b.mi	0x1d33c
   1d320:	01 00 00 14	b	0x1d324
   1d324:	a0 03 57 fc	ldur	d0, [x29, #-0x90]
   1d328:	08 16 e8 d2	mov	x8, #0x40b0000000000000
   1d32c:	01 01 67 9e	fmov	d1, x8
   1d330:	00 20 61 1e	fcmp	d0, d1
   1d334:	ed 03 00 54	b.le	0x1d3b0
   1d338:	01 00 00 14	b	0x1d33c
   1d33c:	00 02 80 d2	mov	x0, #0x10
   1d340:	b5 df 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1d344:	e0 73 00 f9	str	x0, [sp, #0xe0]
   1d348:	e1 27 00 90	adrp	x1, 1276 ; 0x519000
   1d34c:	21 08 12 91	add	x1, x1, #0x482 ; literal pool for: "maxDimension must be between 256 and 4096"
   1d350:	c5 dd 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   1d354:	01 00 00 14	b	0x1d358
   1d358:	e0 73 40 f9	ldr	x0, [sp, #0xe0]
   1d35c:	21 38 00 f0	adrp	x1, 1799 ; 0x724000
   1d360:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1d364:	22 38 00 f0	adrp	x2, 1799 ; 0x724000
   1d368:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1d36c:	c5 df 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1d370:	fd 01 00 14	b	0x1db64
   1d374:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1d378:	e8 03 01 aa	mov	x8, x1
   1d37c:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d380:	f3 01 00 14	b	0x1db4c
   1d384:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1d388:	e8 03 01 aa	mov	x8, x1
   1d38c:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d390:	ec 01 00 14	b	0x1db40
   1d394:	e8 03 00 aa	mov	x8, x0
   1d398:	e0 73 40 f9	ldr	x0, [sp, #0xe0]
   1d39c:	a8 03 18 f8	stur	x8, [x29, #-0x80]
   1d3a0:	e8 03 01 aa	mov	x8, x1
   1d3a4:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d3a8:	aa df 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1d3ac:	e5 01 00 14	b	0x1db40
   1d3b0:	e0 83 08 91	add	x0, sp, #0x220
   1d3b4:	a1 83 01 d1	sub	x1, x29, #0x60
   1d3b8:	ad 99 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentC1ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE
   1d3bc:	01 00 00 14	b	0x1d3c0
   1d3c0:	e0 83 08 91	add	x0, sp, #0x220
   1d3c4:	b7 99 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
   1d3c8:	85 a6 05 94	bl	_FPDF_GetPageCount
   1d3cc:	e0 df 00 b9	str	w0, [sp, #0xdc]
   1d3d0:	01 00 00 14	b	0x1d3d4
   1d3d4:	e8 df 40 b9	ldr	w8, [sp, #0xdc]
   1d3d8:	e8 1f 02 b9	str	w8, [sp, #0x21c]
   1d3dc:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1d3e0:	a1 83 5b f8	ldur	x1, [x29, #-0x48]
   1d3e4:	e2 1f 42 b9	ldr	w2, [sp, #0x21c]
   1d3e8:	e8 03 08 91	add	x8, sp, #0x200
   1d3ec:	b3 99 ff 97	bl	__ZN12_GLOBAL__N_115ReadPageNumbersEP10napi_env__P12napi_value__i
   1d3f0:	01 00 00 14	b	0x1d3f4
   1d3f4:	e8 a3 07 91	add	x8, sp, #0x1e8
   1d3f8:	a0 e3 01 d1	sub	x0, x29, #0x78
   1d3fc:	35 9e ff 97	bl	__ZN12_GLOBAL__N_112PathFromUtf8ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
   1d400:	01 00 00 14	b	0x1d404
   1d404:	e0 a3 07 91	add	x0, sp, #0x1e8
   1d408:	bd df ff 97	bl	__ZNSt3__14__fs10filesystem18create_directoriesB9nqe210106ERKNS1_4pathE
   1d40c:	01 00 00 14	b	0x1d410
   1d410:	a8 03 5c f8	ldur	x8, [x29, #-0x40]
   1d414:	e8 67 00 f9	str	x8, [sp, #0xc8]
   1d418:	e0 03 08 91	add	x0, sp, #0x200
   1d41c:	99 9a ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE4sizeB9nqe210106Ev
   1d420:	e1 03 00 aa	mov	x1, x0
   1d424:	e0 67 40 f9	ldr	x0, [sp, #0xc8]
   1d428:	89 9a ff 97	bl	__ZN12_GLOBAL__N_15ArrayEP10napi_env__m
   1d42c:	e0 6b 00 f9	str	x0, [sp, #0xd0]
   1d430:	01 00 00 14	b	0x1d434
   1d434:	e8 6b 40 f9	ldr	x8, [sp, #0xd0]
   1d438:	e8 f3 00 f9	str	x8, [sp, #0x1e0]
   1d43c:	ff ef 00 f9	str	xzr, [sp, #0x1d8]
   1d440:	01 00 00 14	b	0x1d444
   1d444:	e8 ef 40 f9	ldr	x8, [sp, #0x1d8]
   1d448:	e8 63 00 f9	str	x8, [sp, #0xc0]
   1d44c:	e0 03 08 91	add	x0, sp, #0x200
   1d450:	8c 9a ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE4sizeB9nqe210106Ev
   1d454:	e8 63 40 f9	ldr	x8, [sp, #0xc0]
   1d458:	08 01 00 eb	subs	x8, x8, x0
   1d45c:	62 30 00 54	b.hs	0x1da68
   1d460:	01 00 00 14	b	0x1d464
   1d464:	e1 ef 40 f9	ldr	x1, [sp, #0x1d8]
   1d468:	e0 03 08 91	add	x0, sp, #0x200
   1d46c:	8f 9a ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEEixB9nqe210106Em
   1d470:	08 00 40 b9	ldr	w8, [x0]
   1d474:	e8 d7 01 b9	str	w8, [sp, #0x1d4]
   1d478:	e8 d7 41 b9	ldr	w8, [sp, #0x1d4]
   1d47c:	02 05 00 71	subs	w2, w8, #0x1
   1d480:	e0 03 07 91	add	x0, sp, #0x1c0
   1d484:	e1 83 08 91	add	x1, sp, #0x220
   1d488:	91 9a ff 97	bl	__ZN12_GLOBAL__N_17PdfPageC1ERKNS_11PdfDocumentEi
   1d48c:	01 00 00 14	b	0x1d490
   1d490:	e0 03 07 91	add	x0, sp, #0x1c0
   1d494:	9d 9a ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   1d498:	c0 08 00 b5	cbnz	x0, 0x1d5b0
   1d49c:	01 00 00 14	b	0x1d4a0
   1d4a0:	28 00 80 52	mov	w8, #0x1
   1d4a4:	08 01 00 12	and	w8, w8, #0x1
   1d4a8:	08 01 00 12	and	w8, w8, #0x1
   1d4ac:	e8 3f 06 39	strb	w8, [sp, #0x18f]
   1d4b0:	00 02 80 d2	mov	x0, #0x10
   1d4b4:	58 df 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1d4b8:	e0 5f 00 f9	str	x0, [sp, #0xb8]
   1d4bc:	e0 d7 41 b9	ldr	w0, [sp, #0x1d4]
   1d4c0:	e8 43 06 91	add	x8, sp, #0x190
   1d4c4:	1b df 13 94	bl	0x515130 ; symbol stub for: __ZNSt3__19to_stringEi
   1d4c8:	01 00 00 14	b	0x1d4cc
   1d4cc:	e8 a3 06 91	add	x8, sp, #0x1a8
   1d4d0:	e0 27 00 90	adrp	x0, 1276 ; 0x519000
   1d4d4:	00 b0 12 91	add	x0, x0, #0x4ac ; literal pool for: "Failed to load PDF page "
   1d4d8:	e1 43 06 91	add	x1, sp, #0x190
   1d4dc:	91 9a ff 97	bl	__ZNSt3__1plB9nqe210106IcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_OS9_
   1d4e0:	01 00 00 14	b	0x1d4e4
   1d4e4:	e0 5f 40 f9	ldr	x0, [sp, #0xb8]
   1d4e8:	e1 a3 06 91	add	x1, sp, #0x1a8
   1d4ec:	61 dd 13 94	bl	0x514a70 ; symbol stub for: __ZNSt13runtime_errorC1ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
   1d4f0:	01 00 00 14	b	0x1d4f4
   1d4f4:	e0 5f 40 f9	ldr	x0, [sp, #0xb8]
   1d4f8:	08 00 80 52	mov	w8, #0x0
   1d4fc:	08 01 00 12	and	w8, w8, #0x1
   1d500:	08 01 00 12	and	w8, w8, #0x1
   1d504:	e8 3f 06 39	strb	w8, [sp, #0x18f]
   1d508:	21 38 00 f0	adrp	x1, 1799 ; 0x724000
   1d50c:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1d510:	22 38 00 f0	adrp	x2, 1799 ; 0x724000
   1d514:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1d518:	5a df 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1d51c:	92 01 00 14	b	0x1db64
   1d520:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1d524:	e8 03 01 aa	mov	x8, x1
   1d528:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d52c:	82 01 00 14	b	0x1db34
   1d530:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1d534:	e8 03 01 aa	mov	x8, x1
   1d538:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d53c:	7b 01 00 14	b	0x1db28
   1d540:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1d544:	e8 03 01 aa	mov	x8, x1
   1d548:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d54c:	74 01 00 14	b	0x1db1c
   1d550:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1d554:	e8 03 01 aa	mov	x8, x1
   1d558:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d55c:	0e 00 00 14	b	0x1d594
   1d560:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1d564:	e8 03 01 aa	mov	x8, x1
   1d568:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d56c:	07 00 00 14	b	0x1d588
   1d570:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1d574:	e8 03 01 aa	mov	x8, x1
   1d578:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d57c:	e0 a3 06 91	add	x0, sp, #0x1a8
   1d580:	b4 dd 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1d584:	01 00 00 14	b	0x1d588
   1d588:	e0 43 06 91	add	x0, sp, #0x190
   1d58c:	b1 dd 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1d590:	01 00 00 14	b	0x1d594
   1d594:	e8 3f 46 39	ldrb	w8, [sp, #0x18f]
   1d598:	a8 00 00 36	tbz	w8, #0x0, 0x1d5ac
   1d59c:	01 00 00 14	b	0x1d5a0
   1d5a0:	e0 5f 40 f9	ldr	x0, [sp, #0xb8]
   1d5a4:	2b df 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1d5a8:	01 00 00 14	b	0x1d5ac
   1d5ac:	2c 01 00 14	b	0x1da5c
   1d5b0:	e0 03 07 91	add	x0, sp, #0x1c0
   1d5b4:	55 9a ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   1d5b8:	78 a6 05 94	bl	_FPDF_GetPageWidthF
   1d5bc:	e0 b7 00 bd	str	s0, [sp, #0xb4]
   1d5c0:	01 00 00 14	b	0x1d5c4
   1d5c4:	e0 b7 40 bd	ldr	s0, [sp, #0xb4]
   1d5c8:	00 c0 22 1e	fcvt	d0, s0
   1d5cc:	e0 c3 00 fd	str	d0, [sp, #0x180]
   1d5d0:	e0 03 07 91	add	x0, sp, #0x1c0
   1d5d4:	4d 9a ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   1d5d8:	88 a6 05 94	bl	_FPDF_GetPageHeightF
   1d5dc:	e0 b3 00 bd	str	s0, [sp, #0xb0]
   1d5e0:	01 00 00 14	b	0x1d5e4
   1d5e4:	e0 b3 40 bd	ldr	s0, [sp, #0xb0]
   1d5e8:	00 c0 22 1e	fcvt	d0, s0
   1d5ec:	e0 bf 00 fd	str	d0, [sp, #0x178]
   1d5f0:	e0 c3 40 fd	ldr	d0, [sp, #0x180]
   1d5f4:	08 20 60 1e	fcmp	d0, #0.0
   1d5f8:	c9 00 00 54	b.ls	0x1d610
   1d5fc:	01 00 00 14	b	0x1d600
   1d600:	e0 bf 40 fd	ldr	d0, [sp, #0x178]
   1d604:	08 20 60 1e	fcmp	d0, #0.0
   1d608:	68 03 00 54	b.hi	0x1d674
   1d60c:	01 00 00 14	b	0x1d610
   1d610:	00 02 80 d2	mov	x0, #0x10
   1d614:	00 df 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1d618:	e0 57 00 f9	str	x0, [sp, #0xa8]
   1d61c:	e1 27 00 90	adrp	x1, 1276 ; 0x519000
   1d620:	21 14 13 91	add	x1, x1, #0x4c5 ; literal pool for: "PDF page has invalid dimensions"
   1d624:	10 dd 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   1d628:	01 00 00 14	b	0x1d62c
   1d62c:	e0 57 40 f9	ldr	x0, [sp, #0xa8]
   1d630:	21 38 00 f0	adrp	x1, 1799 ; 0x724000
   1d634:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1d638:	22 38 00 f0	adrp	x2, 1799 ; 0x724000
   1d63c:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1d640:	10 df 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1d644:	48 01 00 14	b	0x1db64
   1d648:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1d64c:	e8 03 01 aa	mov	x8, x1
   1d650:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d654:	02 01 00 14	b	0x1da5c
   1d658:	e8 03 00 aa	mov	x8, x0
   1d65c:	e0 57 40 f9	ldr	x0, [sp, #0xa8]
   1d660:	a8 03 18 f8	stur	x8, [x29, #-0x80]
   1d664:	e8 03 01 aa	mov	x8, x1
   1d668:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d66c:	f9 de 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1d670:	fb 00 00 14	b	0x1da5c
   1d674:	a0 03 57 fc	ldur	d0, [x29, #-0x90]
   1d678:	e0 4f 00 fd	str	d0, [sp, #0x98]
   1d67c:	e0 03 06 91	add	x0, sp, #0x180
   1d680:	e1 e3 05 91	add	x1, sp, #0x178
   1d684:	a8 01 00 94	bl	__ZNSt3__13maxB9nqe210106IdEERKT_S3_S3_
   1d688:	e0 53 00 f9	str	x0, [sp, #0xa0]
   1d68c:	01 00 00 14	b	0x1d690
   1d690:	e0 4f 40 fd	ldr	d0, [sp, #0x98]
   1d694:	e8 53 40 f9	ldr	x8, [sp, #0xa0]
   1d698:	01 01 40 fd	ldr	d1, [x8]
   1d69c:	00 18 61 1e	fdiv	d0, d0, d1
   1d6a0:	e0 bb 00 fd	str	d0, [sp, #0x170]
   1d6a4:	e0 a3 05 91	add	x0, sp, #0x168
   1d6a8:	28 00 80 52	mov	w8, #0x1
   1d6ac:	e8 6b 01 b9	str	w8, [sp, #0x168]
   1d6b0:	e0 c3 40 fd	ldr	d0, [sp, #0x180]
   1d6b4:	e1 bb 40 fd	ldr	d1, [sp, #0x170]
   1d6b8:	00 08 61 1e	fmul	d0, d0, d1
   1d6bc:	08 00 64 1e	fcvtas	w8, d0
   1d6c0:	e1 93 05 91	add	x1, sp, #0x164
   1d6c4:	e8 67 01 b9	str	w8, [sp, #0x164]
   1d6c8:	a2 01 00 94	bl	__ZNSt3__13maxB9nqe210106IiEERKT_S3_S3_
   1d6cc:	e0 4b 00 f9	str	x0, [sp, #0x90]
   1d6d0:	01 00 00 14	b	0x1d6d4
   1d6d4:	e8 4b 40 f9	ldr	x8, [sp, #0x90]
   1d6d8:	08 01 40 b9	ldr	w8, [x8]
   1d6dc:	e8 6f 01 b9	str	w8, [sp, #0x16c]
   1d6e0:	e0 73 05 91	add	x0, sp, #0x15c
   1d6e4:	28 00 80 52	mov	w8, #0x1
   1d6e8:	e8 5f 01 b9	str	w8, [sp, #0x15c]
   1d6ec:	e0 bf 40 fd	ldr	d0, [sp, #0x178]
   1d6f0:	e1 bb 40 fd	ldr	d1, [sp, #0x170]
   1d6f4:	00 08 61 1e	fmul	d0, d0, d1
   1d6f8:	08 00 64 1e	fcvtas	w8, d0
   1d6fc:	e1 63 05 91	add	x1, sp, #0x158
   1d700:	e8 5b 01 b9	str	w8, [sp, #0x158]
   1d704:	93 01 00 94	bl	__ZNSt3__13maxB9nqe210106IiEERKT_S3_S3_
   1d708:	e0 47 00 f9	str	x0, [sp, #0x88]
   1d70c:	01 00 00 14	b	0x1d710
   1d710:	e8 47 40 f9	ldr	x8, [sp, #0x88]
   1d714:	08 01 40 b9	ldr	w8, [x8]
   1d718:	e8 63 01 b9	str	w8, [sp, #0x160]
   1d71c:	e1 6f 41 b9	ldr	w1, [sp, #0x16c]
   1d720:	e2 63 41 b9	ldr	w2, [sp, #0x160]
   1d724:	e0 43 05 91	add	x0, sp, #0x150
   1d728:	95 01 00 94	bl	__ZN12_GLOBAL__N_19PdfBitmapC1Eii
   1d72c:	01 00 00 14	b	0x1d730
   1d730:	e0 43 05 91	add	x0, sp, #0x150
   1d734:	a1 01 00 94	bl	__ZNK12_GLOBAL__N_19PdfBitmap3getEv
   1d738:	e0 43 00 f9	str	x0, [sp, #0x80]
   1d73c:	01 00 00 14	b	0x1d740
   1d740:	e8 43 40 f9	ldr	x8, [sp, #0x80]
   1d744:	48 02 00 b4	cbz	x8, 0x1d78c
   1d748:	01 00 00 14	b	0x1d74c
   1d74c:	e0 43 05 91	add	x0, sp, #0x150
   1d750:	9a 01 00 94	bl	__ZNK12_GLOBAL__N_19PdfBitmap3getEv
   1d754:	e0 3f 00 f9	str	x0, [sp, #0x78]
   1d758:	01 00 00 14	b	0x1d75c
   1d75c:	e0 3f 40 f9	ldr	x0, [sp, #0x78]
   1d760:	e3 6f 41 b9	ldr	w3, [sp, #0x16c]
   1d764:	e4 63 41 b9	ldr	w4, [sp, #0x160]
   1d768:	02 00 80 52	mov	w2, #0x0
   1d76c:	e1 03 02 aa	mov	x1, x2
   1d770:	e5 7f 40 b2	mov	x5, #0xffffffff
   1d774:	8f a8 05 94	bl	_FPDFBitmap_FillRect
   1d778:	e0 77 00 b9	str	w0, [sp, #0x74]
   1d77c:	01 00 00 14	b	0x1d780
   1d780:	e8 77 40 b9	ldr	w8, [sp, #0x74]
   1d784:	68 03 00 35	cbnz	w8, 0x1d7f0
   1d788:	01 00 00 14	b	0x1d78c
   1d78c:	00 02 80 d2	mov	x0, #0x10
   1d790:	a1 de 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1d794:	e0 37 00 f9	str	x0, [sp, #0x68]
   1d798:	e1 27 00 90	adrp	x1, 1276 ; 0x519000
   1d79c:	21 94 13 91	add	x1, x1, #0x4e5 ; literal pool for: "Failed to create PDF page bitmap"
   1d7a0:	b1 dc 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   1d7a4:	01 00 00 14	b	0x1d7a8
   1d7a8:	e0 37 40 f9	ldr	x0, [sp, #0x68]
   1d7ac:	21 38 00 f0	adrp	x1, 1799 ; 0x724000
   1d7b0:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1d7b4:	22 38 00 f0	adrp	x2, 1799 ; 0x724000
   1d7b8:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1d7bc:	b1 de 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1d7c0:	e9 00 00 14	b	0x1db64
   1d7c4:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1d7c8:	e8 03 01 aa	mov	x8, x1
   1d7cc:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d7d0:	a0 00 00 14	b	0x1da50
   1d7d4:	e8 03 00 aa	mov	x8, x0
   1d7d8:	e0 37 40 f9	ldr	x0, [sp, #0x68]
   1d7dc:	a8 03 18 f8	stur	x8, [x29, #-0x80]
   1d7e0:	e8 03 01 aa	mov	x8, x1
   1d7e4:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1d7e8:	9a de 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1d7ec:	99 00 00 14	b	0x1da50
   1d7f0:	68 02 80 52	mov	w8, #0x13
   1d7f4:	e8 4f 01 b9	str	w8, [sp, #0x14c]
   1d7f8:	e0 43 05 91	add	x0, sp, #0x150
   1d7fc:	6f 01 00 94	bl	__ZNK12_GLOBAL__N_19PdfBitmap3getEv
   1d800:	e0 33 00 f9	str	x0, [sp, #0x60]
   1d804:	01 00 00 14	b	0x1d808
   1d808:	e0 03 07 91	add	x0, sp, #0x1c0
   1d80c:	bf 99 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   1d810:	e1 03 00 aa	mov	x1, x0
   1d814:	e0 33 40 f9	ldr	x0, [sp, #0x60]
   1d818:	e4 6f 41 b9	ldr	w4, [sp, #0x16c]
   1d81c:	e5 63 41 b9	ldr	w5, [sp, #0x160]
   1d820:	06 00 80 52	mov	w6, #0x0
   1d824:	e2 03 06 aa	mov	x2, x6
   1d828:	e3 03 06 aa	mov	x3, x6
   1d82c:	67 02 80 52	mov	w7, #0x13
   1d830:	1b a6 05 94	bl	_FPDF_RenderPageBitmap
   1d834:	01 00 00 14	b	0x1d838
   1d838:	e0 83 08 91	add	x0, sp, #0x220
   1d83c:	2d ac ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument4formEv
   1d840:	e0 2b 00 f9	str	x0, [sp, #0x50]
   1d844:	e0 43 05 91	add	x0, sp, #0x150
   1d848:	5c 01 00 94	bl	__ZNK12_GLOBAL__N_19PdfBitmap3getEv
   1d84c:	e0 2f 00 f9	str	x0, [sp, #0x58]
   1d850:	01 00 00 14	b	0x1d854
   1d854:	e0 03 07 91	add	x0, sp, #0x1c0
   1d858:	ac 99 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   1d85c:	e1 2f 40 f9	ldr	x1, [sp, #0x58]
   1d860:	e2 03 00 aa	mov	x2, x0
   1d864:	e0 2b 40 f9	ldr	x0, [sp, #0x50]
   1d868:	e5 6f 41 b9	ldr	w5, [sp, #0x16c]
   1d86c:	e6 63 41 b9	ldr	w6, [sp, #0x160]
   1d870:	e9 03 00 91	mov	x9, sp
   1d874:	68 02 80 52	mov	w8, #0x13
   1d878:	28 01 00 b9	str	w8, [x9]
   1d87c:	07 00 80 52	mov	w7, #0x0
   1d880:	e3 03 07 aa	mov	x3, x7
   1d884:	e4 03 07 aa	mov	x4, x7
   1d888:	b3 98 05 94	bl	_FPDF_FFLDraw
   1d88c:	01 00 00 14	b	0x1d890
   1d890:	e8 d7 41 b9	ldr	w8, [sp, #0x1d4]
   1d894:	e9 03 00 91	mov	x9, sp
   1d898:	28 01 00 f9	str	x8, [x9]
   1d89c:	a0 e3 00 d1	sub	x0, x29, #0x38
   1d8a0:	e0 27 00 f9	str	x0, [sp, #0x48]
   1d8a4:	01 04 80 d2	mov	x1, #0x20
   1d8a8:	e2 27 00 90	adrp	x2, 1276 ; 0x519000
   1d8ac:	42 18 14 91	add	x2, x2, #0x506 ; literal pool for: "page_%03d.png"
   1d8b0:	12 e0 13 94	bl	0x5158f8 ; symbol stub for: _snprintf
   1d8b4:	e1 27 40 f9	ldr	x1, [sp, #0x48]
   1d8b8:	e0 63 04 91	add	x0, sp, #0x118
   1d8bc:	02 00 80 52	mov	w2, #0x0
   1d8c0:	6e 01 00 94	bl	__ZNSt3__14__fs10filesystem4pathC1B9nqe210106IA32_cvEERKT_NS2_6formatE
   1d8c4:	01 00 00 14	b	0x1d8c8
   1d8c8:	e8 c3 04 91	add	x8, sp, #0x130
   1d8cc:	e0 a3 07 91	add	x0, sp, #0x1e8
   1d8d0:	e1 63 04 91	add	x1, sp, #0x118
   1d8d4:	3f 01 00 94	bl	__ZNSt3__14__fs10filesystemdvB9nqe210106ERKNS1_4pathES4_
   1d8d8:	01 00 00 14	b	0x1d8dc
   1d8dc:	e0 63 04 91	add	x0, sp, #0x118
   1d8e0:	1d 9d ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   1d8e4:	e0 43 05 91	add	x0, sp, #0x150
   1d8e8:	34 01 00 94	bl	__ZNK12_GLOBAL__N_19PdfBitmap3getEv
   1d8ec:	e0 23 00 f9	str	x0, [sp, #0x40]
   1d8f0:	01 00 00 14	b	0x1d8f4
   1d8f4:	e1 23 40 f9	ldr	x1, [sp, #0x40]
   1d8f8:	e2 6f 41 b9	ldr	w2, [sp, #0x16c]
   1d8fc:	e3 63 41 b9	ldr	w3, [sp, #0x160]
   1d900:	e0 c3 04 91	add	x0, sp, #0x130
   1d904:	6c 01 00 94	bl	__ZN12_GLOBAL__N_18WritePngERKNSt3__14__fs10filesystem4pathEP15fpdf_bitmap_t__ii
   1d908:	01 00 00 14	b	0x1d90c
   1d90c:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1d910:	05 92 ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
   1d914:	e0 1f 00 f9	str	x0, [sp, #0x38]
   1d918:	01 00 00 14	b	0x1d91c
   1d91c:	e8 1f 40 f9	ldr	x8, [sp, #0x38]
   1d920:	e8 8b 00 f9	str	x8, [sp, #0x110]
   1d924:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1d928:	e1 8b 40 f9	ldr	x1, [sp, #0x110]
   1d92c:	e3 d7 41 b9	ldr	w3, [sp, #0x1d4]
   1d930:	c2 27 00 f0	adrp	x2, 1275 ; 0x518000
   1d934:	42 84 3d 91	add	x2, x2, #0xf61 ; literal pool for: "page"
   1d938:	f4 99 ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
   1d93c:	01 00 00 14	b	0x1d940
   1d940:	a8 03 5c f8	ldur	x8, [x29, #-0x40]
   1d944:	e8 17 00 f9	str	x8, [sp, #0x28]
   1d948:	e8 8b 40 f9	ldr	x8, [sp, #0x110]
   1d94c:	e8 1b 00 f9	str	x8, [sp, #0x30]
   1d950:	e8 e3 03 91	add	x8, sp, #0xf8
   1d954:	e0 c3 04 91	add	x0, sp, #0x130
   1d958:	04 03 00 94	bl	__ZN12_GLOBAL__N_110PathToUtf8ERKNSt3__14__fs10filesystem4pathE
   1d95c:	01 00 00 14	b	0x1d960
   1d960:	e1 1b 40 f9	ldr	x1, [sp, #0x30]
   1d964:	e0 17 40 f9	ldr	x0, [sp, #0x28]
   1d968:	e2 27 00 90	adrp	x2, 1276 ; 0x519000
   1d96c:	42 50 14 91	add	x2, x2, #0x514 ; literal pool for: "path"
   1d970:	e3 e3 03 91	add	x3, sp, #0xf8
   1d974:	f8 99 ff 97	bl	__ZN12_GLOBAL__N_19SetStringEP10napi_env__P12napi_value__PKcRKNSt3__112basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEE
   1d978:	01 00 00 14	b	0x1d97c
   1d97c:	e0 e3 03 91	add	x0, sp, #0xf8
   1d980:	b4 dc 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1d984:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1d988:	e1 8b 40 f9	ldr	x1, [sp, #0x110]
   1d98c:	e3 6f 41 b9	ldr	w3, [sp, #0x16c]
   1d990:	e2 27 00 90	adrp	x2, 1276 ; 0x519000
   1d994:	42 10 0f 91	add	x2, x2, #0x3c4 ; literal pool for: "width"
   1d998:	dc 99 ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
   1d99c:	01 00 00 14	b	0x1d9a0
   1d9a0:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1d9a4:	e1 8b 40 f9	ldr	x1, [sp, #0x110]
   1d9a8:	e3 63 41 b9	ldr	w3, [sp, #0x160]
   1d9ac:	e2 27 00 90	adrp	x2, 1276 ; 0x519000
   1d9b0:	42 28 0f 91	add	x2, x2, #0x3ca ; literal pool for: "height"
   1d9b4:	d5 99 ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
   1d9b8:	01 00 00 14	b	0x1d9bc
   1d9bc:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1d9c0:	e1 f3 40 f9	ldr	x1, [sp, #0x1e0]
   1d9c4:	e8 ef 40 f9	ldr	x8, [sp, #0x1d8]
   1d9c8:	e2 03 08 aa	mov	x2, x8
   1d9cc:	e3 8b 40 f9	ldr	x3, [sp, #0x110]
   1d9d0:	4f df 13 94	bl	0x51570c ; symbol stub for: _napi_set_element
   1d9d4:	01 00 00 14	b	0x1d9d8
   1d9d8:	e0 c3 04 91	add	x0, sp, #0x130
   1d9dc:	de 9c ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   1d9e0:	e0 43 05 91	add	x0, sp, #0x150
   1d9e4:	03 03 00 94	bl	__ZN12_GLOBAL__N_19PdfBitmapD1Ev
   1d9e8:	e0 03 07 91	add	x0, sp, #0x1c0
   1d9ec:	08 9a ff 97	bl	__ZN12_GLOBAL__N_17PdfPageD1Ev
   1d9f0:	01 00 00 14	b	0x1d9f4
   1d9f4:	e8 ef 40 f9	ldr	x8, [sp, #0x1d8]
   1d9f8:	08 05 00 91	add	x8, x8, #0x1
   1d9fc:	e8 ef 00 f9	str	x8, [sp, #0x1d8]
   1da00:	91 fe ff 17	b	0x1d444
   1da04:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1da08:	e8 03 01 aa	mov	x8, x1
   1da0c:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1da10:	e0 63 04 91	add	x0, sp, #0x118
   1da14:	d0 9c ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   1da18:	0e 00 00 14	b	0x1da50
   1da1c:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1da20:	e8 03 01 aa	mov	x8, x1
   1da24:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1da28:	07 00 00 14	b	0x1da44
   1da2c:	a0 03 18 f8	stur	x0, [x29, #-0x80]
   1da30:	e8 03 01 aa	mov	x8, x1
   1da34:	a8 c3 17 b8	stur	w8, [x29, #-0x84]
   1da38:	e0 e3 03 91	add	x0, sp, #0xf8
   1da3c:	85 dc 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1da40:	01 00 00 14	b	0x1da44
   1da44:	e0 c3 04 91	add	x0, sp, #0x130
   1da48:	c3 9c ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   1da4c:	01 00 00 14	b	0x1da50
   1da50:	e0 43 05 91	add	x0, sp, #0x150
   1da54:	e7 02 00 94	bl	__ZN12_GLOBAL__N_19PdfBitmapD1Ev
   1da58:	01 00 00 14	b	0x1da5c
   1da5c:	e0 03 07 91	add	x0, sp, #0x1c0
   1da60:	eb 99 ff 97	bl	__ZN12_GLOBAL__N_17PdfPageD1Ev
   1da64:	2e 00 00 14	b	0x1db1c
   1da68:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1da6c:	ae 91 ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
   1da70:	e0 13 00 f9	str	x0, [sp, #0x20]
   1da74:	01 00 00 14	b	0x1da78
   1da78:	e8 13 40 f9	ldr	x8, [sp, #0x20]
   1da7c:	e8 7b 00 f9	str	x8, [sp, #0xf0]
   1da80:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1da84:	e1 7b 40 f9	ldr	x1, [sp, #0xf0]
   1da88:	e3 1f 42 b9	ldr	w3, [sp, #0x21c]
   1da8c:	c2 27 00 f0	adrp	x2, 1275 ; 0x518000
   1da90:	42 ac 3d 91	add	x2, x2, #0xf6b ; literal pool for: "pageCount"
   1da94:	9d 99 ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
   1da98:	01 00 00 14	b	0x1da9c
   1da9c:	a0 03 5c f8	ldur	x0, [x29, #-0x40]
   1daa0:	e1 7b 40 f9	ldr	x1, [sp, #0xf0]
   1daa4:	e3 f3 40 f9	ldr	x3, [sp, #0x1e0]
   1daa8:	c2 27 00 f0	adrp	x2, 1275 ; 0x518000
   1daac:	42 d4 3d 91	add	x2, x2, #0xf75 ; literal pool for: "pages"
   1dab0:	e2 99 ff 97	bl	__ZN12_GLOBAL__N_13SetEP10napi_env__P12napi_value__PKcS3_
   1dab4:	01 00 00 14	b	0x1dab8
   1dab8:	e8 7b 40 f9	ldr	x8, [sp, #0xf0]
   1dabc:	e8 0f 00 f9	str	x8, [sp, #0x18]
   1dac0:	e0 a3 07 91	add	x0, sp, #0x1e8
   1dac4:	a4 9c ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   1dac8:	e0 03 08 91	add	x0, sp, #0x200
   1dacc:	ea 99 ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
   1dad0:	e0 83 08 91	add	x0, sp, #0x220
   1dad4:	f3 99 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
   1dad8:	a0 e3 01 d1	sub	x0, x29, #0x78
   1dadc:	5d dc 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1dae0:	a0 83 01 d1	sub	x0, x29, #0x60
   1dae4:	5b dc 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1dae8:	a9 83 5e f8	ldur	x9, [x29, #-0x18]
   1daec:	28 38 00 f0	adrp	x8, 1799 ; 0x724000
   1daf0:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   1daf4:	08 01 40 f9	ldr	x8, [x8]
   1daf8:	08 01 09 eb	subs	x8, x8, x9
   1dafc:	60 00 00 54	b.eq	0x1db08
   1db00:	01 00 00 14	b	0x1db04
   1db04:	00 de 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
   1db08:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
   1db0c:	ff 83 0f 91	add	sp, sp, #0x3e0
   1db10:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
   1db14:	fc 6f c2 a8	ldp	x28, x27, [sp], #0x20
   1db18:	c0 03 5f d6	ret
   1db1c:	e0 a3 07 91	add	x0, sp, #0x1e8
   1db20:	8d 9c ff 97	bl	__ZNSt3__14__fs10filesystem4pathD1B9nqe210106Ev
   1db24:	01 00 00 14	b	0x1db28
   1db28:	e0 03 08 91	add	x0, sp, #0x200
   1db2c:	d2 99 ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
   1db30:	01 00 00 14	b	0x1db34
   1db34:	e0 83 08 91	add	x0, sp, #0x220
   1db38:	da 99 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
   1db3c:	01 00 00 14	b	0x1db40
   1db40:	a0 e3 01 d1	sub	x0, x29, #0x78
   1db44:	43 dc 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1db48:	01 00 00 14	b	0x1db4c
   1db4c:	a0 83 01 d1	sub	x0, x29, #0x60
   1db50:	40 dc 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   1db54:	01 00 00 14	b	0x1db58
   1db58:	a0 03 58 f8	ldur	x0, [x29, #-0x80]
   1db5c:	e0 0b 00 f9	str	x0, [sp, #0x10]
   1db60:	04 00 00 14	b	0x1db70
   1db64:	20 00 20 d4	brk	#0x1
   1db68:	e0 0b 00 f9	str	x0, [sp, #0x10]
   1db6c:	01 00 00 14	b	0x1db70
   1db70:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
   1db74:	98 db 13 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
