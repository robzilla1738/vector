/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_16RotateEP10napi_env__P12napi_value__:
   231a0:	fc 6f be a9	stp	x28, x27, [sp, #-0x20]!
   231a4:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
   231a8:	fd 43 00 91	add	x29, sp, #0x10
   231ac:	ff c3 0a d1	sub	sp, sp, #0x2b0
   231b0:	a0 83 1e f8	stur	x0, [x29, #-0x18]
   231b4:	a1 03 1e f8	stur	x1, [x29, #-0x20]
   231b8:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   231bc:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   231c0:	a8 e3 00 d1	sub	x8, x29, #0x38
   231c4:	a2 27 00 b0	adrp	x2, 1269 ; 0x518000
   231c8:	42 78 3c 91	add	x2, x2, #0xf1e ; literal pool for: "filePath"
   231cc:	8a 81 ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
   231d0:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   231d4:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   231d8:	a8 43 01 d1	sub	x8, x29, #0x50
   231dc:	a2 27 00 d0	adrp	x2, 1270 ; 0x519000
   231e0:	42 ac 02 91	add	x2, x2, #0xab ; literal pool for: "outputPath"
   231e4:	84 81 ff 97	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
   231e8:	01 00 00 14	b	0x231ec
   231ec:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   231f0:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   231f4:	a2 27 00 d0	adrp	x2, 1270 ; 0x519000
   231f8:	42 a4 16 91	add	x2, x2, #0x5a9 ; literal pool for: "degrees"
   231fc:	64 01 00 94	bl	__ZN12_GLOBAL__N_114RequiredNumberEP10napi_env__P12napi_value__PKc
   23200:	e0 33 00 fd	str	d0, [sp, #0x60]
   23204:	01 00 00 14	b	0x23208
   23208:	e0 33 40 fd	ldr	d0, [sp, #0x60]
   2320c:	a0 83 19 fc	stur	d0, [x29, #-0x68]
   23210:	a0 83 59 fc	ldur	d0, [x29, #-0x68]
   23214:	08 00 dc d2	mov	x8, #0xe00000000000
   23218:	08 0e f8 f2	movk	x8, #0xc070, lsl #48
   2321c:	01 01 67 9e	fmov	d1, x8
   23220:	00 20 61 1e	fcmp	d0, d1
   23224:	40 08 00 54	b.eq	0x2332c
   23228:	01 00 00 14	b	0x2322c
   2322c:	a0 83 59 fc	ldur	d0, [x29, #-0x68]
   23230:	08 00 d0 d2	mov	x8, #0x800000000000
   23234:	c8 0c f8 f2	movk	x8, #0xc066, lsl #48
   23238:	01 01 67 9e	fmov	d1, x8
   2323c:	00 20 61 1e	fcmp	d0, d1
   23240:	60 07 00 54	b.eq	0x2332c
   23244:	01 00 00 14	b	0x23248
   23248:	a0 83 59 fc	ldur	d0, [x29, #-0x68]
   2324c:	08 00 d0 d2	mov	x8, #0x800000000000
   23250:	c8 0a f8 f2	movk	x8, #0xc056, lsl #48
   23254:	01 01 67 9e	fmov	d1, x8
   23258:	00 20 61 1e	fcmp	d0, d1
   2325c:	80 06 00 54	b.eq	0x2332c
   23260:	01 00 00 14	b	0x23264
   23264:	a0 83 59 fc	ldur	d0, [x29, #-0x68]
   23268:	08 00 d0 d2	mov	x8, #0x800000000000
   2326c:	c8 0a e8 f2	movk	x8, #0x4056, lsl #48
   23270:	01 01 67 9e	fmov	d1, x8
   23274:	00 20 61 1e	fcmp	d0, d1
   23278:	a0 05 00 54	b.eq	0x2332c
   2327c:	01 00 00 14	b	0x23280
   23280:	a0 83 59 fc	ldur	d0, [x29, #-0x68]
   23284:	08 00 d0 d2	mov	x8, #0x800000000000
   23288:	c8 0c e8 f2	movk	x8, #0x4066, lsl #48
   2328c:	01 01 67 9e	fmov	d1, x8
   23290:	00 20 61 1e	fcmp	d0, d1
   23294:	c0 04 00 54	b.eq	0x2332c
   23298:	01 00 00 14	b	0x2329c
   2329c:	a0 83 59 fc	ldur	d0, [x29, #-0x68]
   232a0:	08 00 dc d2	mov	x8, #0xe00000000000
   232a4:	08 0e e8 f2	movk	x8, #0x4070, lsl #48
   232a8:	01 01 67 9e	fmov	d1, x8
   232ac:	00 20 61 1e	fcmp	d0, d1
   232b0:	e0 03 00 54	b.eq	0x2332c
   232b4:	01 00 00 14	b	0x232b8
   232b8:	00 02 80 d2	mov	x0, #0x10
   232bc:	d6 c7 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   232c0:	e0 2f 00 f9	str	x0, [sp, #0x58]
   232c4:	a1 27 00 d0	adrp	x1, 1270 ; 0x519000
   232c8:	21 c4 16 91	add	x1, x1, #0x5b1 ; literal pool for: "degrees must be -270, -180, -90, 90, 180, or 270"
   232cc:	e6 c5 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   232d0:	01 00 00 14	b	0x232d4
   232d4:	e0 2f 40 f9	ldr	x0, [sp, #0x58]
   232d8:	01 38 00 b0	adrp	x1, 1793 ; 0x724000
   232dc:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   232e0:	02 38 00 b0	adrp	x2, 1793 ; 0x724000
   232e4:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   232e8:	e6 c7 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   232ec:	27 01 00 14	b	0x23788
   232f0:	a0 83 1a f8	stur	x0, [x29, #-0x58]
   232f4:	e8 03 01 aa	mov	x8, x1
   232f8:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   232fc:	1e 01 00 14	b	0x23774
   23300:	a0 83 1a f8	stur	x0, [x29, #-0x58]
   23304:	e8 03 01 aa	mov	x8, x1
   23308:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   2330c:	17 01 00 14	b	0x23768
   23310:	e8 03 00 aa	mov	x8, x0
   23314:	e0 2f 40 f9	ldr	x0, [sp, #0x58]
   23318:	a8 83 1a f8	stur	x8, [x29, #-0x58]
   2331c:	e8 03 01 aa	mov	x8, x1
   23320:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   23324:	cb c7 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   23328:	10 01 00 14	b	0x23768
   2332c:	a0 83 59 fc	ldur	d0, [x29, #-0x68]
   23330:	08 00 78 1e	fcvtzs	w8, d0
   23334:	49 0b 80 52	mov	w9, #0x5a
   23338:	08 0d c9 1a	sdiv	w8, w8, w9
   2333c:	8a 00 80 52	mov	w10, #0x4
   23340:	08 11 00 11	add	w8, w8, #0x4
   23344:	09 0d ca 1a	sdiv	w9, w8, w10
   23348:	29 7d 0a 1b	mul	w9, w9, w10
   2334c:	08 01 09 6b	subs	w8, w8, w9
   23350:	a8 43 19 b8	stur	w8, [x29, #-0x6c]
   23354:	e0 43 04 91	add	x0, sp, #0x110
   23358:	a1 e3 00 d1	sub	x1, x29, #0x38
   2335c:	c4 81 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentC1ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE
   23360:	01 00 00 14	b	0x23364
   23364:	e0 43 04 91	add	x0, sp, #0x110
   23368:	ce 81 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
   2336c:	9c 8e 05 94	bl	_FPDF_GetPageCount
   23370:	e0 57 00 b9	str	w0, [sp, #0x54]
   23374:	01 00 00 14	b	0x23378
   23378:	e8 57 40 b9	ldr	w8, [sp, #0x54]
   2337c:	e8 0f 01 b9	str	w8, [sp, #0x10c]
   23380:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   23384:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   23388:	e2 0f 41 b9	ldr	w2, [sp, #0x10c]
   2338c:	e8 c3 03 91	add	x8, sp, #0xf0
   23390:	ca 81 ff 97	bl	__ZN12_GLOBAL__N_115ReadPageNumbersEP10napi_env__P12napi_value__i
   23394:	01 00 00 14	b	0x23398
   23398:	e8 c3 03 91	add	x8, sp, #0xf0
   2339c:	e8 77 00 f9	str	x8, [sp, #0xe8]
   233a0:	e0 77 40 f9	ldr	x0, [sp, #0xe8]
   233a4:	fd e6 ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE5beginB9nqe210106Ev
   233a8:	e0 73 00 f9	str	x0, [sp, #0xe0]
   233ac:	e0 77 40 f9	ldr	x0, [sp, #0xe8]
   233b0:	0a e7 ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE3endB9nqe210106Ev
   233b4:	e0 6f 00 f9	str	x0, [sp, #0xd8]
   233b8:	01 00 00 14	b	0x233bc
   233bc:	e0 83 03 91	add	x0, sp, #0xe0
   233c0:	e1 63 03 91	add	x1, sp, #0xd8
   233c4:	15 e7 ff 97	bl	__ZNSt3__1eqB9nqe210106IPKiEEbRKNS_11__wrap_iterIT_EES7_
   233c8:	e0 10 00 37	tbnz	w0, #0x0, 0x235e4
   233cc:	01 00 00 14	b	0x233d0
   233d0:	e0 83 03 91	add	x0, sp, #0xe0
   233d4:	22 e7 ff 97	bl	__ZNKSt3__111__wrap_iterIPKiEdeB9nqe210106Ev
   233d8:	08 00 40 b9	ldr	w8, [x0]
   233dc:	e8 d7 00 b9	str	w8, [sp, #0xd4]
   233e0:	e8 d7 40 b9	ldr	w8, [sp, #0xd4]
   233e4:	02 05 00 71	subs	w2, w8, #0x1
   233e8:	e0 03 03 91	add	x0, sp, #0xc0
   233ec:	e1 43 04 91	add	x1, sp, #0x110
   233f0:	b7 82 ff 97	bl	__ZN12_GLOBAL__N_17PdfPageC1ERKNS_11PdfDocumentEi
   233f4:	01 00 00 14	b	0x233f8
   233f8:	e0 03 03 91	add	x0, sp, #0xc0
   233fc:	c3 82 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   23400:	40 08 00 b5	cbnz	x0, 0x23508
   23404:	01 00 00 14	b	0x23408
   23408:	28 00 80 52	mov	w8, #0x1
   2340c:	08 01 00 12	and	w8, w8, #0x1
   23410:	08 01 00 12	and	w8, w8, #0x1
   23414:	e8 3f 02 39	strb	w8, [sp, #0x8f]
   23418:	00 02 80 d2	mov	x0, #0x10
   2341c:	7e c7 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   23420:	e0 27 00 f9	str	x0, [sp, #0x48]
   23424:	e0 d7 40 b9	ldr	w0, [sp, #0xd4]
   23428:	e8 43 02 91	add	x8, sp, #0x90
   2342c:	41 c7 13 94	bl	0x515130 ; symbol stub for: __ZNSt3__19to_stringEi
   23430:	01 00 00 14	b	0x23434
   23434:	e8 a3 02 91	add	x8, sp, #0xa8
   23438:	a0 27 00 d0	adrp	x0, 1270 ; 0x519000
   2343c:	00 b0 12 91	add	x0, x0, #0x4ac ; literal pool for: "Failed to load PDF page "
   23440:	e1 43 02 91	add	x1, sp, #0x90
   23444:	b7 82 ff 97	bl	__ZNSt3__1plB9nqe210106IcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_OS9_
   23448:	01 00 00 14	b	0x2344c
   2344c:	e0 27 40 f9	ldr	x0, [sp, #0x48]
   23450:	e1 a3 02 91	add	x1, sp, #0xa8
   23454:	87 c5 13 94	bl	0x514a70 ; symbol stub for: __ZNSt13runtime_errorC1ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
   23458:	01 00 00 14	b	0x2345c
   2345c:	e0 27 40 f9	ldr	x0, [sp, #0x48]
   23460:	08 00 80 52	mov	w8, #0x0
   23464:	08 01 00 12	and	w8, w8, #0x1
   23468:	08 01 00 12	and	w8, w8, #0x1
   2346c:	e8 3f 02 39	strb	w8, [sp, #0x8f]
   23470:	01 38 00 b0	adrp	x1, 1793 ; 0x724000
   23474:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   23478:	02 38 00 b0	adrp	x2, 1793 ; 0x724000
   2347c:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   23480:	80 c7 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   23484:	c1 00 00 14	b	0x23788
   23488:	a0 83 1a f8	stur	x0, [x29, #-0x58]
   2348c:	e8 03 01 aa	mov	x8, x1
   23490:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   23494:	b2 00 00 14	b	0x2375c
   23498:	a0 83 1a f8	stur	x0, [x29, #-0x58]
   2349c:	e8 03 01 aa	mov	x8, x1
   234a0:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   234a4:	ab 00 00 14	b	0x23750
   234a8:	a0 83 1a f8	stur	x0, [x29, #-0x58]
   234ac:	e8 03 01 aa	mov	x8, x1
   234b0:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   234b4:	0e 00 00 14	b	0x234ec
   234b8:	a0 83 1a f8	stur	x0, [x29, #-0x58]
   234bc:	e8 03 01 aa	mov	x8, x1
   234c0:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   234c4:	07 00 00 14	b	0x234e0
   234c8:	a0 83 1a f8	stur	x0, [x29, #-0x58]
   234cc:	e8 03 01 aa	mov	x8, x1
   234d0:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   234d4:	e0 a3 02 91	add	x0, sp, #0xa8
   234d8:	de c5 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   234dc:	01 00 00 14	b	0x234e0
   234e0:	e0 43 02 91	add	x0, sp, #0x90
   234e4:	db c5 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   234e8:	01 00 00 14	b	0x234ec
   234ec:	e8 3f 42 39	ldrb	w8, [sp, #0x8f]
   234f0:	a8 00 00 36	tbz	w8, #0x0, 0x23504
   234f4:	01 00 00 14	b	0x234f8
   234f8:	e0 27 40 f9	ldr	x0, [sp, #0x48]
   234fc:	55 c7 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   23500:	01 00 00 14	b	0x23504
   23504:	35 00 00 14	b	0x235d8
   23508:	e0 03 03 91	add	x0, sp, #0xc0
   2350c:	7f 82 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   23510:	b4 71 05 94	bl	_FPDFPage_GetRotation
   23514:	e0 47 00 b9	str	w0, [sp, #0x44]
   23518:	01 00 00 14	b	0x2351c
   2351c:	e8 47 40 b9	ldr	w8, [sp, #0x44]
   23520:	e8 8b 00 b9	str	w8, [sp, #0x88]
   23524:	e8 8b 40 b9	ldr	w8, [sp, #0x88]
   23528:	68 03 f8 36	tbz	w8, #0x1f, 0x23594
   2352c:	01 00 00 14	b	0x23530
   23530:	00 02 80 d2	mov	x0, #0x10
   23534:	38 c7 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   23538:	e0 1f 00 f9	str	x0, [sp, #0x38]
   2353c:	a1 27 00 d0	adrp	x1, 1270 ; 0x519000
   23540:	21 88 17 91	add	x1, x1, #0x5e2 ; literal pool for: "Failed to read PDF page rotation"
   23544:	48 c5 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   23548:	01 00 00 14	b	0x2354c
   2354c:	e0 1f 40 f9	ldr	x0, [sp, #0x38]
   23550:	01 38 00 b0	adrp	x1, 1793 ; 0x724000
   23554:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   23558:	02 38 00 b0	adrp	x2, 1793 ; 0x724000
   2355c:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   23560:	48 c7 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   23564:	89 00 00 14	b	0x23788
   23568:	a0 83 1a f8	stur	x0, [x29, #-0x58]
   2356c:	e8 03 01 aa	mov	x8, x1
   23570:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   23574:	19 00 00 14	b	0x235d8
   23578:	e8 03 00 aa	mov	x8, x0
   2357c:	e0 1f 40 f9	ldr	x0, [sp, #0x38]
   23580:	a8 83 1a f8	stur	x8, [x29, #-0x58]
   23584:	e8 03 01 aa	mov	x8, x1
   23588:	a8 43 1a b8	stur	w8, [x29, #-0x5c]
   2358c:	31 c7 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   23590:	12 00 00 14	b	0x235d8
   23594:	e0 03 03 91	add	x0, sp, #0xc0
   23598:	5c 82 ff 97	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
   2359c:	e8 8b 40 b9	ldr	w8, [sp, #0x88]
   235a0:	a9 43 59 b8	ldur	w9, [x29, #-0x6c]
   235a4:	08 01 09 0b	add	w8, w8, w9
   235a8:	8a 00 80 52	mov	w10, #0x4
   235ac:	09 0d ca 1a	sdiv	w9, w8, w10
   235b0:	29 7d 0a 1b	mul	w9, w9, w10
   235b4:	01 01 09 6b	subs	w1, w8, w9
   235b8:	6d 7a 05 94	bl	_FPDFPage_SetRotation
   235bc:	01 00 00 14	b	0x235c0
   235c0:	e0 03 03 91	add	x0, sp, #0xc0
   235c4:	12 83 ff 97	bl	__ZN12_GLOBAL__N_17PdfPageD1Ev
   235c8:	01 00 00 14	b	0x235cc
   235cc:	e0 83 03 91	add	x0, sp, #0xe0
   235d0:	a9 e6 ff 97	bl	__ZNSt3__111__wrap_iterIPKiEppB9nqe210106Ev
   235d4:	7a ff ff 17	b	0x233bc
   235d8:	e0 03 03 91	add	x0, sp, #0xc0
   235dc:	0c 83 ff 97	bl	__ZN12_GLOBAL__N_17PdfPageD1Ev
   235e0:	5c 00 00 14	b	0x23750
   235e4:	e0 43 04 91	add	x0, sp, #0x110
   235e8:	2e 81 ff 97	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
   235ec:	a1 43 01 d1	sub	x1, x29, #0x50
   235f0:	24 a2 ff 97	bl	__ZN12_GLOBAL__N_112SaveDocumentEP17fpdf_document_t__RKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE
   235f4:	01 00 00 14	b	0x235f8
   235f8:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   235fc:	e8 17 00 f9	str	x8, [sp, #0x28]
   23600:	e0 c3 03 91	add	x0, sp, #0xf0
   23604:	1f 82 ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE4sizeB9nqe210106Ev
   23608:	e1 03 00 aa	mov	x1, x0
   2360c:	e0 17 40 f9	ldr	x0, [sp, #0x28]
   23610:	0f 82 ff 97	bl	__ZN12_GLOBAL__N_15ArrayEP10napi_env__m
   23614:	e0 1b 00 f9	str	x0, [sp, #0x30]
   23618:	01 00 00 14	b	0x2361c
   2361c:	e8 1b 40 f9	ldr	x8, [sp, #0x30]
   23620:	e8 43 00 f9	str	x8, [sp, #0x80]
   23624:	ff 3f 00 f9	str	xzr, [sp, #0x78]
   23628:	01 00 00 14	b	0x2362c
   2362c:	e8 3f 40 f9	ldr	x8, [sp, #0x78]
   23630:	e8 13 00 f9	str	x8, [sp, #0x20]
   23634:	e0 c3 03 91	add	x0, sp, #0xf0
   23638:	12 82 ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE4sizeB9nqe210106Ev
   2363c:	e8 13 40 f9	ldr	x8, [sp, #0x20]
   23640:	08 01 00 eb	subs	x8, x8, x0
   23644:	22 03 00 54	b.hs	0x236a8
   23648:	01 00 00 14	b	0x2364c
   2364c:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
   23650:	e8 0f 00 f9	str	x8, [sp, #0x18]
   23654:	e1 3f 40 f9	ldr	x1, [sp, #0x78]
   23658:	e0 c3 03 91	add	x0, sp, #0xf0
   2365c:	13 82 ff 97	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEEixB9nqe210106Em
   23660:	e8 03 00 aa	mov	x8, x0
   23664:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
   23668:	01 01 40 b9	ldr	w1, [x8]
   2366c:	e2 c3 01 91	add	x2, sp, #0x70
   23670:	00 c8 13 94	bl	0x515670 ; symbol stub for: _napi_create_int32
   23674:	01 00 00 14	b	0x23678
   23678:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   2367c:	e1 43 40 f9	ldr	x1, [sp, #0x80]
   23680:	e8 3f 40 f9	ldr	x8, [sp, #0x78]
   23684:	e2 03 08 aa	mov	x2, x8
   23688:	e3 3b 40 f9	ldr	x3, [sp, #0x70]
   2368c:	20 c8 13 94	bl	0x51570c ; symbol stub for: _napi_set_element
   23690:	01 00 00 14	b	0x23694
   23694:	01 00 00 14	b	0x23698
   23698:	e8 3f 40 f9	ldr	x8, [sp, #0x78]
   2369c:	08 05 00 91	add	x8, x8, #0x1
   236a0:	e8 3f 00 f9	str	x8, [sp, #0x78]
   236a4:	e2 ff ff 17	b	0x2362c
   236a8:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   236ac:	9e 7a ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
   236b0:	e0 0b 00 f9	str	x0, [sp, #0x10]
   236b4:	01 00 00 14	b	0x236b8
   236b8:	e8 0b 40 f9	ldr	x8, [sp, #0x10]
   236bc:	e8 37 00 f9	str	x8, [sp, #0x68]
   236c0:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   236c4:	e1 37 40 f9	ldr	x1, [sp, #0x68]
   236c8:	a2 27 00 d0	adrp	x2, 1270 ; 0x519000
   236cc:	42 ac 02 91	add	x2, x2, #0xab ; literal pool for: "outputPath"
   236d0:	a3 43 01 d1	sub	x3, x29, #0x50
   236d4:	a0 82 ff 97	bl	__ZN12_GLOBAL__N_19SetStringEP10napi_env__P12napi_value__PKcRKNSt3__112basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEE
   236d8:	01 00 00 14	b	0x236dc
   236dc:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   236e0:	e1 37 40 f9	ldr	x1, [sp, #0x68]
   236e4:	e3 0f 41 b9	ldr	w3, [sp, #0x10c]
   236e8:	a2 27 00 b0	adrp	x2, 1269 ; 0x518000
   236ec:	42 ac 3d 91	add	x2, x2, #0xf6b ; literal pool for: "pageCount"
   236f0:	86 82 ff 97	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
   236f4:	01 00 00 14	b	0x236f8
   236f8:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
   236fc:	e1 37 40 f9	ldr	x1, [sp, #0x68]
   23700:	e3 43 40 f9	ldr	x3, [sp, #0x80]
   23704:	a2 27 00 b0	adrp	x2, 1269 ; 0x518000
   23708:	42 d4 3d 91	add	x2, x2, #0xf75 ; literal pool for: "pages"
   2370c:	cb 82 ff 97	bl	__ZN12_GLOBAL__N_13SetEP10napi_env__P12napi_value__PKcS3_
   23710:	01 00 00 14	b	0x23714
   23714:	e8 37 40 f9	ldr	x8, [sp, #0x68]
   23718:	e8 07 00 f9	str	x8, [sp, #0x8]
   2371c:	e0 c3 03 91	add	x0, sp, #0xf0
   23720:	d5 82 ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
   23724:	e0 43 04 91	add	x0, sp, #0x110
   23728:	de 82 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
   2372c:	a0 43 01 d1	sub	x0, x29, #0x50
   23730:	48 c5 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23734:	a0 e3 00 d1	sub	x0, x29, #0x38
   23738:	46 c5 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   2373c:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   23740:	ff c3 0a 91	add	sp, sp, #0x2b0
   23744:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
   23748:	fc 6f c2 a8	ldp	x28, x27, [sp], #0x20
   2374c:	c0 03 5f d6	ret
   23750:	e0 c3 03 91	add	x0, sp, #0xf0
   23754:	c8 82 ff 97	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
   23758:	01 00 00 14	b	0x2375c
   2375c:	e0 43 04 91	add	x0, sp, #0x110
   23760:	d0 82 ff 97	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
   23764:	01 00 00 14	b	0x23768
   23768:	a0 43 01 d1	sub	x0, x29, #0x50
   2376c:	39 c5 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   23770:	01 00 00 14	b	0x23774
   23774:	a0 e3 00 d1	sub	x0, x29, #0x38
   23778:	36 c5 13 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
   2377c:	01 00 00 14	b	0x23780
   23780:	a0 83 5a f8	ldur	x0, [x29, #-0x58]
   23784:	94 c4 13 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
   23788:	20 00 20 d4	brk	#0x1
