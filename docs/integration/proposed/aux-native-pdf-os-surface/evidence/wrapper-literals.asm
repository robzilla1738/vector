/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_19RunPdfiumIXadL_ZNS_11ExtractTextEP10napi_env__P12napi_value__EEEES4_S2_P20napi_callback_info__:
    21a8:	ff 43 02 d1	sub	sp, sp, #0x90
    21ac:	fd 7b 08 a9	stp	x29, x30, [sp, #0x80]
    21b0:	fd 03 02 91	add	x29, sp, #0x80
    21b4:	08 39 00 d0	adrp	x8, 1826 ; 0x724000
    21b8:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
    21bc:	08 01 40 f9	ldr	x8, [x8]
    21c0:	a8 83 1f f8	stur	x8, [x29, #-0x8]
    21c4:	a0 03 1e f8	stur	x0, [x29, #-0x20]
    21c8:	a1 83 1d f8	stur	x1, [x29, #-0x28]
    21cc:	a2 c3 00 d1	sub	x2, x29, #0x30
    21d0:	28 00 80 d2	mov	x8, #0x1
    21d4:	a8 03 1d f8	stur	x8, [x29, #-0x30]
    21d8:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    21dc:	a1 83 5d f8	ldur	x1, [x29, #-0x28]
    21e0:	a3 43 00 d1	sub	x3, x29, #0x10
    21e4:	05 00 80 d2	mov	x5, #0x0
    21e8:	e4 03 05 aa	mov	x4, x5
    21ec:	30 4d 14 94	bl	0x5156ac ; symbol stub for: _napi_get_cb_info
    21f0:	01 00 00 14	b	0x21f4
    21f4:	a8 03 5d f8	ldur	x8, [x29, #-0x30]
    21f8:	08 05 00 f1	subs	x8, x8, #0x1
    21fc:	42 01 00 54	b.hs	0x2224
    2200:	01 00 00 14	b	0x2204
    2204:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    2208:	01 00 80 d2	mov	x1, #0x0
    220c:	a2 28 00 d0	adrp	x2, 1302 ; 0x518000
    2210:	42 dc 3b 91	add	x2, x2, #0xef7 ; literal pool for: "PDF operation requires an input object"
    2214:	47 4d 14 94	bl	0x515730 ; symbol stub for: _napi_throw_type_error
    2218:	01 00 00 14	b	0x221c
    221c:	bf 83 1e f8	stur	xzr, [x29, #-0x18]
    2220:	43 00 00 14	b	0x232c
    2224:	a0 e3 00 d1	sub	x0, x29, #0x38
    2228:	e1 39 00 f0	adrp	x1, 1855 ; 0x741000
    222c:	21 40 11 91	add	x1, x1, #0x450
    2230:	6c 03 00 94	bl	__ZNSt3__110lock_guardINS_5mutexEEC1B9nqe210106ERS1_
    2234:	01 00 00 14	b	0x2238
    2238:	a0 e7 00 d1	sub	x0, x29, #0x39
    223c:	76 03 00 94	bl	__ZN12_GLOBAL__N_113PdfiumLibraryC1Ev
    2240:	01 00 00 14	b	0x2244
    2244:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
    2248:	a1 03 5f f8	ldur	x1, [x29, #-0x10]
    224c:	7d 03 00 94	bl	__ZN12_GLOBAL__N_111ExtractTextEP10napi_env__P12napi_value__
    2250:	e0 13 00 f9	str	x0, [sp, #0x20]
    2254:	01 00 00 14	b	0x2258
    2258:	e8 13 40 f9	ldr	x8, [sp, #0x20]
    225c:	a8 83 1e f8	stur	x8, [x29, #-0x18]
    2260:	28 00 80 52	mov	w8, #0x1
    2264:	e8 33 00 b9	str	w8, [sp, #0x30]
    2268:	a0 e7 00 d1	sub	x0, x29, #0x39
    226c:	26 05 00 94	bl	__ZN12_GLOBAL__N_113PdfiumLibraryD1Ev
    2270:	2d 00 00 14	b	0x2324
    2274:	e0 1f 00 f9	str	x0, [sp, #0x38]
    2278:	e8 03 01 aa	mov	x8, x1
    227c:	e8 37 00 b9	str	w8, [sp, #0x34]
    2280:	07 00 00 14	b	0x229c
    2284:	e0 1f 00 f9	str	x0, [sp, #0x38]
    2288:	e8 03 01 aa	mov	x8, x1
    228c:	e8 37 00 b9	str	w8, [sp, #0x34]
    2290:	a0 e7 00 d1	sub	x0, x29, #0x39
    2294:	1c 05 00 94	bl	__ZN12_GLOBAL__N_113PdfiumLibraryD1Ev
    2298:	01 00 00 14	b	0x229c
    229c:	e8 37 40 b9	ldr	w8, [sp, #0x34]
    22a0:	08 05 00 71	subs	w8, w8, #0x1
    22a4:	01 06 00 54	b.ne	0x2364
    22a8:	01 00 00 14	b	0x22ac
    22ac:	e0 1f 40 f9	ldr	x0, [sp, #0x38]
    22b0:	e2 4b 14 94	bl	0x515238 ; symbol stub for: ___cxa_begin_catch
    22b4:	e0 17 00 f9	str	x0, [sp, #0x28]
    22b8:	a8 03 5e f8	ldur	x8, [x29, #-0x20]
    22bc:	e8 0f 00 f9	str	x8, [sp, #0x18]
    22c0:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    22c4:	08 00 40 f9	ldr	x8, [x0]
    22c8:	08 09 40 f9	ldr	x8, [x8, #0x10]
    22cc:	00 01 3f d6	blr	x8
    22d0:	e2 03 00 aa	mov	x2, x0
    22d4:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
    22d8:	01 00 80 d2	mov	x1, #0x0
    22dc:	12 4d 14 94	bl	0x515724 ; symbol stub for: _napi_throw_error
    22e0:	01 00 00 14	b	0x22e4
    22e4:	bf 83 1e f8	stur	xzr, [x29, #-0x18]
    22e8:	28 00 80 52	mov	w8, #0x1
    22ec:	e8 33 00 b9	str	w8, [sp, #0x30]
    22f0:	d5 4b 14 94	bl	0x515244 ; symbol stub for: ___cxa_end_catch
    22f4:	06 00 00 14	b	0x230c
    22f8:	e0 1f 00 f9	str	x0, [sp, #0x38]
    22fc:	e8 03 01 aa	mov	x8, x1
    2300:	e8 37 00 b9	str	w8, [sp, #0x34]
    2304:	d0 4b 14 94	bl	0x515244 ; symbol stub for: ___cxa_end_catch
    2308:	06 00 00 14	b	0x2320
    230c:	06 00 00 14	b	0x2324
    2310:	e0 1f 00 f9	str	x0, [sp, #0x38]
    2314:	e8 03 01 aa	mov	x8, x1
    2318:	e8 37 00 b9	str	w8, [sp, #0x34]
    231c:	12 00 00 14	b	0x2364
    2320:	11 00 00 14	b	0x2364
    2324:	a0 e3 00 d1	sub	x0, x29, #0x38
    2328:	06 05 00 94	bl	__ZNSt3__110lock_guardINS_5mutexEED1B9nqe210106Ev
    232c:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
    2330:	e8 0b 00 f9	str	x8, [sp, #0x10]
    2334:	a9 83 5f f8	ldur	x9, [x29, #-0x8]
    2338:	08 39 00 d0	adrp	x8, 1826 ; 0x724000
    233c:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
    2340:	08 01 40 f9	ldr	x8, [x8]
    2344:	08 01 09 eb	subs	x8, x8, x9
    2348:	60 00 00 54	b.eq	0x2354
    234c:	01 00 00 14	b	0x2350
    2350:	ed 4b 14 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
    2354:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
    2358:	fd 7b 48 a9	ldp	x29, x30, [sp, #0x80]
    235c:	ff 43 02 91	add	sp, sp, #0x90
    2360:	c0 03 5f d6	ret
    2364:	a0 e3 00 d1	sub	x0, x29, #0x38
    2368:	f6 04 00 94	bl	__ZNSt3__110lock_guardINS_5mutexEED1B9nqe210106Ev
    236c:	01 00 00 14	b	0x2370
    2370:	e0 1f 40 f9	ldr	x0, [sp, #0x38]
    2374:	e0 07 00 f9	str	x0, [sp, #0x8]
    2378:	0c 00 00 14	b	0x23a8
    237c:	e0 03 00 f9	str	x0, [sp]
    2380:	e8 03 01 aa	mov	x8, x1
    2384:	88 00 00 34	cbz	w8, 0x2394
    2388:	01 00 00 14	b	0x238c
    238c:	e0 03 40 f9	ldr	x0, [sp]
    2390:	e8 04 00 94	bl	___clang_call_terminate
    2394:	e0 03 40 f9	ldr	x0, [sp]
    2398:	e0 07 00 f9	str	x0, [sp, #0x8]
    239c:	03 00 00 14	b	0x23a8
    23a0:	e0 07 00 f9	str	x0, [sp, #0x8]
    23a4:	01 00 00 14	b	0x23a8
    23a8:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    23ac:	8a 49 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
