/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_111ExtractTextEP10napi_env__P12napi_value__:
    3040:	fc 6f be a9	stp	x28, x27, [sp, #-0x20]!
    3044:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
    3048:	fd 43 00 91	add	x29, sp, #0x10
    304c:	ff 43 0d d1	sub	sp, sp, #0x350
    3050:	a0 83 1e f8	stur	x0, [x29, #-0x18]
    3054:	a1 03 1e f8	stur	x1, [x29, #-0x20]
    3058:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    305c:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
    3060:	a8 e3 00 d1	sub	x8, x29, #0x38
    3064:	e8 4f 00 f9	str	x8, [sp, #0x98]
    3068:	a2 28 00 b0	adrp	x2, 1301 ; 0x518000
    306c:	42 78 3c 91	add	x2, x2, #0xf1e ; literal pool for: "filePath"
    3070:	e1 01 00 94	bl	__ZN12_GLOBAL__N_114RequiredStringEP10napi_env__P12napi_value__PKc
    3074:	e1 4f 40 f9	ldr	x1, [sp, #0x98]
    3078:	e0 a3 07 91	add	x0, sp, #0x1e8
    307c:	7c 02 00 94	bl	__ZN12_GLOBAL__N_111PdfDocumentC1ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE
    3080:	01 00 00 14	b	0x3084
    3084:	e0 a3 07 91	add	x0, sp, #0x1e8
    3088:	86 02 00 94	bl	__ZNK12_GLOBAL__N_111PdfDocument8documentEv
    308c:	e0 4b 00 f9	str	x0, [sp, #0x90]
    3090:	01 00 00 14	b	0x3094
    3094:	e0 4b 40 f9	ldr	x0, [sp, #0x90]
    3098:	51 0f 06 94	bl	_FPDF_GetPageCount
    309c:	e0 8f 00 b9	str	w0, [sp, #0x8c]
    30a0:	01 00 00 14	b	0x30a4
    30a4:	e8 8f 40 b9	ldr	w8, [sp, #0x8c]
    30a8:	e8 db 01 b9	str	w8, [sp, #0x1d8]
    30ac:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    30b0:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
    30b4:	e2 db 41 b9	ldr	w2, [sp, #0x1d8]
    30b8:	e8 03 07 91	add	x8, sp, #0x1c0
    30bc:	7f 02 00 94	bl	__ZN12_GLOBAL__N_115ReadPageNumbersEP10napi_env__P12napi_value__i
    30c0:	01 00 00 14	b	0x30c4
    30c4:	a8 83 5e f8	ldur	x8, [x29, #-0x18]
    30c8:	e8 3f 00 f9	str	x8, [sp, #0x78]
    30cc:	e0 03 07 91	add	x0, sp, #0x1c0
    30d0:	6c 03 00 94	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE4sizeB9nqe210106Ev
    30d4:	e1 03 00 aa	mov	x1, x0
    30d8:	e0 3f 40 f9	ldr	x0, [sp, #0x78]
    30dc:	5c 03 00 94	bl	__ZN12_GLOBAL__N_15ArrayEP10napi_env__m
    30e0:	e0 43 00 f9	str	x0, [sp, #0x80]
    30e4:	01 00 00 14	b	0x30e8
    30e8:	e8 43 40 f9	ldr	x8, [sp, #0x80]
    30ec:	e8 df 00 f9	str	x8, [sp, #0x1b8]
    30f0:	ff db 00 f9	str	xzr, [sp, #0x1b0]
    30f4:	01 00 00 14	b	0x30f8
    30f8:	e8 db 40 f9	ldr	x8, [sp, #0x1b0]
    30fc:	e8 3b 00 f9	str	x8, [sp, #0x70]
    3100:	e0 03 07 91	add	x0, sp, #0x1c0
    3104:	5f 03 00 94	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEE4sizeB9nqe210106Ev
    3108:	e8 3b 40 f9	ldr	x8, [sp, #0x70]
    310c:	08 01 00 eb	subs	x8, x8, x0
    3110:	02 2a 00 54	b.hs	0x3650
    3114:	01 00 00 14	b	0x3118
    3118:	e1 db 40 f9	ldr	x1, [sp, #0x1b0]
    311c:	e0 03 07 91	add	x0, sp, #0x1c0
    3120:	62 03 00 94	bl	__ZNKSt3__16vectorIiNS_9allocatorIiEEEixB9nqe210106Em
    3124:	08 00 40 b9	ldr	w8, [x0]
    3128:	e8 af 01 b9	str	w8, [sp, #0x1ac]
    312c:	e8 af 41 b9	ldr	w8, [sp, #0x1ac]
    3130:	02 05 00 71	subs	w2, w8, #0x1
    3134:	e0 63 06 91	add	x0, sp, #0x198
    3138:	e1 a3 07 91	add	x1, sp, #0x1e8
    313c:	64 03 00 94	bl	__ZN12_GLOBAL__N_17PdfPageC1ERKNS_11PdfDocumentEi
    3140:	01 00 00 14	b	0x3144
    3144:	e0 63 06 91	add	x0, sp, #0x198
    3148:	70 03 00 94	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
    314c:	e0 37 00 f9	str	x0, [sp, #0x68]
    3150:	01 00 00 14	b	0x3154
    3154:	e8 37 40 f9	ldr	x8, [sp, #0x68]
    3158:	48 09 00 b5	cbnz	x8, 0x3280
    315c:	01 00 00 14	b	0x3160
    3160:	28 00 80 52	mov	w8, #0x1
    3164:	08 01 00 12	and	w8, w8, #0x1
    3168:	08 01 00 12	and	w8, w8, #0x1
    316c:	e8 9f 05 39	strb	w8, [sp, #0x167]
    3170:	00 02 80 d2	mov	x0, #0x10
    3174:	28 48 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    3178:	e0 33 00 f9	str	x0, [sp, #0x60]
    317c:	e0 af 41 b9	ldr	w0, [sp, #0x1ac]
    3180:	e8 a3 05 91	add	x8, sp, #0x168
    3184:	eb 47 14 94	bl	0x515130 ; symbol stub for: __ZNSt3__19to_stringEi
    3188:	01 00 00 14	b	0x318c
    318c:	e8 03 06 91	add	x8, sp, #0x180
    3190:	a0 28 00 b0	adrp	x0, 1301 ; 0x518000
    3194:	00 9c 3c 91	add	x0, x0, #0xf27 ; literal pool for: "Failed to read PDF page "
    3198:	e1 a3 05 91	add	x1, sp, #0x168
    319c:	61 03 00 94	bl	__ZNSt3__1plB9nqe210106IcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_OS9_
    31a0:	01 00 00 14	b	0x31a4
    31a4:	e0 33 40 f9	ldr	x0, [sp, #0x60]
    31a8:	e1 03 06 91	add	x1, sp, #0x180
    31ac:	31 46 14 94	bl	0x514a70 ; symbol stub for: __ZNSt13runtime_errorC1ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
    31b0:	01 00 00 14	b	0x31b4
    31b4:	e0 33 40 f9	ldr	x0, [sp, #0x60]
    31b8:	08 00 80 52	mov	w8, #0x0
    31bc:	08 01 00 12	and	w8, w8, #0x1
    31c0:	08 01 00 12	and	w8, w8, #0x1
    31c4:	e8 9f 05 39	strb	w8, [sp, #0x167]
    31c8:	01 39 00 b0	adrp	x1, 1825 ; 0x724000
    31cc:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    31d0:	02 39 00 b0	adrp	x2, 1825 ; 0x724000
    31d4:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    31d8:	2a 48 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    31dc:	49 01 00 14	b	0x3700
    31e0:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    31e4:	e8 03 01 aa	mov	x8, x1
    31e8:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    31ec:	40 01 00 14	b	0x36ec
    31f0:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    31f4:	e8 03 01 aa	mov	x8, x1
    31f8:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    31fc:	39 01 00 14	b	0x36e0
    3200:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3204:	e8 03 01 aa	mov	x8, x1
    3208:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    320c:	32 01 00 14	b	0x36d4
    3210:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3214:	e8 03 01 aa	mov	x8, x1
    3218:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    321c:	0a 01 00 14	b	0x3644
    3220:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3224:	e8 03 01 aa	mov	x8, x1
    3228:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    322c:	0e 00 00 14	b	0x3264
    3230:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3234:	e8 03 01 aa	mov	x8, x1
    3238:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    323c:	07 00 00 14	b	0x3258
    3240:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3244:	e8 03 01 aa	mov	x8, x1
    3248:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    324c:	e0 03 06 91	add	x0, sp, #0x180
    3250:	80 46 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    3254:	01 00 00 14	b	0x3258
    3258:	e0 a3 05 91	add	x0, sp, #0x168
    325c:	7d 46 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    3260:	01 00 00 14	b	0x3264
    3264:	e8 9f 45 39	ldrb	w8, [sp, #0x167]
    3268:	a8 00 00 36	tbz	w8, #0x0, 0x327c
    326c:	01 00 00 14	b	0x3270
    3270:	e0 33 40 f9	ldr	x0, [sp, #0x60]
    3274:	f7 47 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    3278:	01 00 00 14	b	0x327c
    327c:	f2 00 00 14	b	0x3644
    3280:	e0 63 06 91	add	x0, sp, #0x198
    3284:	21 03 00 94	bl	__ZNK12_GLOBAL__N_17PdfPage3getEv
    3288:	e0 2f 00 f9	str	x0, [sp, #0x58]
    328c:	01 00 00 14	b	0x3290
    3290:	e1 2f 40 f9	ldr	x1, [sp, #0x58]
    3294:	e0 63 05 91	add	x0, sp, #0x158
    3298:	33 03 00 94	bl	__ZN12_GLOBAL__N_111PdfTextPageC1EP13fpdf_page_t__
    329c:	01 00 00 14	b	0x32a0
    32a0:	e0 63 05 91	add	x0, sp, #0x158
    32a4:	3d 03 00 94	bl	__ZNK12_GLOBAL__N_111PdfTextPage3getEv
    32a8:	e0 2b 00 f9	str	x0, [sp, #0x50]
    32ac:	01 00 00 14	b	0x32b0
    32b0:	e8 2b 40 f9	ldr	x8, [sp, #0x50]
    32b4:	c8 07 00 b5	cbnz	x8, 0x33ac
    32b8:	01 00 00 14	b	0x32bc
    32bc:	28 00 80 52	mov	w8, #0x1
    32c0:	08 01 00 12	and	w8, w8, #0x1
    32c4:	08 01 00 12	and	w8, w8, #0x1
    32c8:	e8 9f 04 39	strb	w8, [sp, #0x127]
    32cc:	00 02 80 d2	mov	x0, #0x10
    32d0:	d1 47 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    32d4:	e0 27 00 f9	str	x0, [sp, #0x48]
    32d8:	e0 af 41 b9	ldr	w0, [sp, #0x1ac]
    32dc:	e8 a3 04 91	add	x8, sp, #0x128
    32e0:	94 47 14 94	bl	0x515130 ; symbol stub for: __ZNSt3__19to_stringEi
    32e4:	01 00 00 14	b	0x32e8
    32e8:	e8 03 05 91	add	x8, sp, #0x140
    32ec:	a0 28 00 b0	adrp	x0, 1301 ; 0x518000
    32f0:	00 00 3d 91	add	x0, x0, #0xf40 ; literal pool for: "Failed to read PDF text on page "
    32f4:	e1 a3 04 91	add	x1, sp, #0x128
    32f8:	0a 03 00 94	bl	__ZNSt3__1plB9nqe210106IcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_OS9_
    32fc:	01 00 00 14	b	0x3300
    3300:	e0 27 40 f9	ldr	x0, [sp, #0x48]
    3304:	e1 03 05 91	add	x1, sp, #0x140
    3308:	da 45 14 94	bl	0x514a70 ; symbol stub for: __ZNSt13runtime_errorC1ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
    330c:	01 00 00 14	b	0x3310
    3310:	e0 27 40 f9	ldr	x0, [sp, #0x48]
    3314:	08 00 80 52	mov	w8, #0x0
    3318:	08 01 00 12	and	w8, w8, #0x1
    331c:	08 01 00 12	and	w8, w8, #0x1
    3320:	e8 9f 04 39	strb	w8, [sp, #0x127]
    3324:	01 39 00 b0	adrp	x1, 1825 ; 0x724000
    3328:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    332c:	02 39 00 b0	adrp	x2, 1825 ; 0x724000
    3330:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    3334:	d3 47 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    3338:	f2 00 00 14	b	0x3700
    333c:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3340:	e8 03 01 aa	mov	x8, x1
    3344:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    3348:	bc 00 00 14	b	0x3638
    334c:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3350:	e8 03 01 aa	mov	x8, x1
    3354:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    3358:	0e 00 00 14	b	0x3390
    335c:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3360:	e8 03 01 aa	mov	x8, x1
    3364:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    3368:	07 00 00 14	b	0x3384
    336c:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3370:	e8 03 01 aa	mov	x8, x1
    3374:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    3378:	e0 03 05 91	add	x0, sp, #0x140
    337c:	35 46 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    3380:	01 00 00 14	b	0x3384
    3384:	e0 a3 04 91	add	x0, sp, #0x128
    3388:	32 46 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    338c:	01 00 00 14	b	0x3390
    3390:	e8 9f 44 39	ldrb	w8, [sp, #0x127]
    3394:	a8 00 00 36	tbz	w8, #0x0, 0x33a8
    3398:	01 00 00 14	b	0x339c
    339c:	e0 27 40 f9	ldr	x0, [sp, #0x48]
    33a0:	ac 47 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    33a4:	01 00 00 14	b	0x33a8
    33a8:	a4 00 00 14	b	0x3638
    33ac:	e0 63 05 91	add	x0, sp, #0x158
    33b0:	fa 02 00 94	bl	__ZNK12_GLOBAL__N_111PdfTextPage3getEv
    33b4:	e0 23 00 f9	str	x0, [sp, #0x40]
    33b8:	01 00 00 14	b	0x33bc
    33bc:	e0 23 40 f9	ldr	x0, [sp, #0x40]
    33c0:	e9 07 06 94	bl	_FPDFText_CountChars
    33c4:	e0 3f 00 b9	str	w0, [sp, #0x3c]
    33c8:	01 00 00 14	b	0x33cc
    33cc:	e8 3f 40 b9	ldr	w8, [sp, #0x3c]
    33d0:	e8 23 01 b9	str	w8, [sp, #0x120]
    33d4:	e8 23 41 b9	ldr	w8, [sp, #0x120]
    33d8:	48 07 f8 36	tbz	w8, #0x1f, 0x34c0
    33dc:	01 00 00 14	b	0x33e0
    33e0:	28 00 80 52	mov	w8, #0x1
    33e4:	08 01 00 12	and	w8, w8, #0x1
    33e8:	08 01 00 12	and	w8, w8, #0x1
    33ec:	e8 bf 03 39	strb	w8, [sp, #0xef]
    33f0:	00 02 80 d2	mov	x0, #0x10
    33f4:	88 47 14 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
    33f8:	e0 1b 00 f9	str	x0, [sp, #0x30]
    33fc:	e0 af 41 b9	ldr	w0, [sp, #0x1ac]
    3400:	e8 c3 03 91	add	x8, sp, #0xf0
    3404:	4b 47 14 94	bl	0x515130 ; symbol stub for: __ZNSt3__19to_stringEi
    3408:	01 00 00 14	b	0x340c
    340c:	e8 23 04 91	add	x8, sp, #0x108
    3410:	a0 28 00 b0	adrp	x0, 1301 ; 0x518000
    3414:	00 00 3d 91	add	x0, x0, #0xf40 ; literal pool for: "Failed to read PDF text on page "
    3418:	e1 c3 03 91	add	x1, sp, #0xf0
    341c:	c1 02 00 94	bl	__ZNSt3__1plB9nqe210106IcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_OS9_
    3420:	01 00 00 14	b	0x3424
    3424:	e0 1b 40 f9	ldr	x0, [sp, #0x30]
    3428:	e1 23 04 91	add	x1, sp, #0x108
    342c:	91 45 14 94	bl	0x514a70 ; symbol stub for: __ZNSt13runtime_errorC1ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE
    3430:	01 00 00 14	b	0x3434
    3434:	e0 1b 40 f9	ldr	x0, [sp, #0x30]
    3438:	08 00 80 52	mov	w8, #0x0
    343c:	08 01 00 12	and	w8, w8, #0x1
    3440:	08 01 00 12	and	w8, w8, #0x1
    3444:	e8 bf 03 39	strb	w8, [sp, #0xef]
    3448:	01 39 00 b0	adrp	x1, 1825 ; 0x724000
    344c:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
    3450:	02 39 00 b0	adrp	x2, 1825 ; 0x724000
    3454:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
    3458:	8a 47 14 94	bl	0x515280 ; symbol stub for: ___cxa_throw
    345c:	a9 00 00 14	b	0x3700
    3460:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3464:	e8 03 01 aa	mov	x8, x1
    3468:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    346c:	0e 00 00 14	b	0x34a4
    3470:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3474:	e8 03 01 aa	mov	x8, x1
    3478:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    347c:	07 00 00 14	b	0x3498
    3480:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3484:	e8 03 01 aa	mov	x8, x1
    3488:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    348c:	e0 23 04 91	add	x0, sp, #0x108
    3490:	f0 45 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    3494:	01 00 00 14	b	0x3498
    3498:	e0 c3 03 91	add	x0, sp, #0xf0
    349c:	ed 45 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    34a0:	01 00 00 14	b	0x34a4
    34a4:	e8 bf 43 39	ldrb	w8, [sp, #0xef]
    34a8:	a8 00 00 36	tbz	w8, #0x0, 0x34bc
    34ac:	01 00 00 14	b	0x34b0
    34b0:	e0 1b 40 f9	ldr	x0, [sp, #0x30]
    34b4:	67 47 14 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
    34b8:	01 00 00 14	b	0x34bc
    34bc:	5f 00 00 14	b	0x3638
    34c0:	e8 23 41 b9	ldr	w8, [sp, #0x120]
    34c4:	09 05 00 11	add	w9, w8, #0x1
    34c8:	e8 03 09 aa	mov	x8, x9
    34cc:	01 7d 40 93	sxtw	x1, w8
    34d0:	e0 43 03 91	add	x0, sp, #0xd0
    34d4:	b7 02 00 94	bl	__ZNSt3__16vectorItNS_9allocatorItEEEC1B9nqe210106Em
    34d8:	01 00 00 14	b	0x34dc
    34dc:	e0 63 05 91	add	x0, sp, #0x158
    34e0:	ae 02 00 94	bl	__ZNK12_GLOBAL__N_111PdfTextPage3getEv
    34e4:	e0 17 00 f9	str	x0, [sp, #0x28]
    34e8:	01 00 00 14	b	0x34ec
    34ec:	e8 23 41 b9	ldr	w8, [sp, #0x120]
    34f0:	e8 23 00 b9	str	w8, [sp, #0x20]
    34f4:	e0 43 03 91	add	x0, sp, #0xd0
    34f8:	bb 02 00 94	bl	__ZNSt3__16vectorItNS_9allocatorItEEE4dataB9nqe210106Ev
    34fc:	e2 23 40 b9	ldr	w2, [sp, #0x20]
    3500:	e3 03 00 aa	mov	x3, x0
    3504:	e0 17 40 f9	ldr	x0, [sp, #0x28]
    3508:	01 00 80 52	mov	w1, #0x0
    350c:	ed 09 06 94	bl	_FPDFText_GetText
    3510:	e0 27 00 b9	str	w0, [sp, #0x24]
    3514:	01 00 00 14	b	0x3518
    3518:	e8 27 40 b9	ldr	w8, [sp, #0x24]
    351c:	e8 cf 00 b9	str	w8, [sp, #0xcc]
    3520:	e8 cf 40 b9	ldr	w8, [sp, #0xcc]
    3524:	08 01 00 71	subs	w8, w8, #0x0
    3528:	8d 01 00 54	b.le	0x3558
    352c:	01 00 00 14	b	0x3530
    3530:	e0 43 03 91	add	x0, sp, #0xd0
    3534:	ac 02 00 94	bl	__ZNSt3__16vectorItNS_9allocatorItEEE4dataB9nqe210106Ev
    3538:	e8 cf 40 b9	ldr	w8, [sp, #0xcc]
    353c:	09 05 00 71	subs	w9, w8, #0x1
    3540:	e8 03 09 aa	mov	x8, x9
    3544:	01 7d 40 93	sxtw	x1, w8
    3548:	e8 c3 02 91	add	x8, sp, #0xb0
    354c:	b0 02 00 94	bl	__ZN12_GLOBAL__N_19FromUtf16EPKtm
    3550:	01 00 00 14	b	0x3554
    3554:	04 00 00 14	b	0x3564
    3558:	e0 c3 02 91	add	x0, sp, #0xb0
    355c:	e0 02 00 94	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106Ev
    3560:	01 00 00 14	b	0x3564
    3564:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    3568:	ef fa ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
    356c:	e0 0f 00 f9	str	x0, [sp, #0x18]
    3570:	01 00 00 14	b	0x3574
    3574:	e8 0f 40 f9	ldr	x8, [sp, #0x18]
    3578:	e8 57 00 f9	str	x8, [sp, #0xa8]
    357c:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    3580:	e1 57 40 f9	ldr	x1, [sp, #0xa8]
    3584:	e3 af 41 b9	ldr	w3, [sp, #0x1ac]
    3588:	a2 28 00 b0	adrp	x2, 1301 ; 0x518000
    358c:	42 84 3d 91	add	x2, x2, #0xf61 ; literal pool for: "page"
    3590:	de 02 00 94	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
    3594:	01 00 00 14	b	0x3598
    3598:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    359c:	e1 57 40 f9	ldr	x1, [sp, #0xa8]
    35a0:	a2 28 00 b0	adrp	x2, 1301 ; 0x518000
    35a4:	42 98 3d 91	add	x2, x2, #0xf66 ; literal pool for: "text"
    35a8:	e3 c3 02 91	add	x3, sp, #0xb0
    35ac:	ea 02 00 94	bl	__ZN12_GLOBAL__N_19SetStringEP10napi_env__P12napi_value__PKcRKNSt3__112basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEE
    35b0:	01 00 00 14	b	0x35b4
    35b4:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    35b8:	e1 df 40 f9	ldr	x1, [sp, #0x1b8]
    35bc:	e8 db 40 f9	ldr	x8, [sp, #0x1b0]
    35c0:	e2 03 08 aa	mov	x2, x8
    35c4:	e3 57 40 f9	ldr	x3, [sp, #0xa8]
    35c8:	51 48 14 94	bl	0x51570c ; symbol stub for: _napi_set_element
    35cc:	01 00 00 14	b	0x35d0
    35d0:	e0 c3 02 91	add	x0, sp, #0xb0
    35d4:	9f 45 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    35d8:	e0 43 03 91	add	x0, sp, #0xd0
    35dc:	f6 02 00 94	bl	__ZNSt3__16vectorItNS_9allocatorItEEED1B9nqe210106Ev
    35e0:	e0 63 05 91	add	x0, sp, #0x158
    35e4:	ff 02 00 94	bl	__ZN12_GLOBAL__N_111PdfTextPageD1Ev
    35e8:	e0 63 06 91	add	x0, sp, #0x198
    35ec:	08 03 00 94	bl	__ZN12_GLOBAL__N_17PdfPageD1Ev
    35f0:	01 00 00 14	b	0x35f4
    35f4:	e8 db 40 f9	ldr	x8, [sp, #0x1b0]
    35f8:	08 05 00 91	add	x8, x8, #0x1
    35fc:	e8 db 00 f9	str	x8, [sp, #0x1b0]
    3600:	be fe ff 17	b	0x30f8
    3604:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3608:	e8 03 01 aa	mov	x8, x1
    360c:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    3610:	07 00 00 14	b	0x362c
    3614:	e0 f3 00 f9	str	x0, [sp, #0x1e0]
    3618:	e8 03 01 aa	mov	x8, x1
    361c:	e8 df 01 b9	str	w8, [sp, #0x1dc]
    3620:	e0 c3 02 91	add	x0, sp, #0xb0
    3624:	8b 45 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    3628:	01 00 00 14	b	0x362c
    362c:	e0 43 03 91	add	x0, sp, #0xd0
    3630:	e1 02 00 94	bl	__ZNSt3__16vectorItNS_9allocatorItEEED1B9nqe210106Ev
    3634:	01 00 00 14	b	0x3638
    3638:	e0 63 05 91	add	x0, sp, #0x158
    363c:	e9 02 00 94	bl	__ZN12_GLOBAL__N_111PdfTextPageD1Ev
    3640:	01 00 00 14	b	0x3644
    3644:	e0 63 06 91	add	x0, sp, #0x198
    3648:	f1 02 00 94	bl	__ZN12_GLOBAL__N_17PdfPageD1Ev
    364c:	22 00 00 14	b	0x36d4
    3650:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    3654:	b4 fa ff 97	bl	__ZN12_GLOBAL__N_16ObjectEP10napi_env__
    3658:	e0 0b 00 f9	str	x0, [sp, #0x10]
    365c:	01 00 00 14	b	0x3660
    3660:	e8 0b 40 f9	ldr	x8, [sp, #0x10]
    3664:	e8 53 00 f9	str	x8, [sp, #0xa0]
    3668:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    366c:	e1 53 40 f9	ldr	x1, [sp, #0xa0]
    3670:	e3 db 41 b9	ldr	w3, [sp, #0x1d8]
    3674:	a2 28 00 b0	adrp	x2, 1301 ; 0x518000
    3678:	42 ac 3d 91	add	x2, x2, #0xf6b ; literal pool for: "pageCount"
    367c:	a3 02 00 94	bl	__ZN12_GLOBAL__N_16SetIntEP10napi_env__P12napi_value__PKci
    3680:	01 00 00 14	b	0x3684
    3684:	a0 83 5e f8	ldur	x0, [x29, #-0x18]
    3688:	e1 53 40 f9	ldr	x1, [sp, #0xa0]
    368c:	e3 df 40 f9	ldr	x3, [sp, #0x1b8]
    3690:	a2 28 00 b0	adrp	x2, 1301 ; 0x518000
    3694:	42 d4 3d 91	add	x2, x2, #0xf75 ; literal pool for: "pages"
    3698:	e8 02 00 94	bl	__ZN12_GLOBAL__N_13SetEP10napi_env__P12napi_value__PKcS3_
    369c:	01 00 00 14	b	0x36a0
    36a0:	e8 53 40 f9	ldr	x8, [sp, #0xa0]
    36a4:	e8 07 00 f9	str	x8, [sp, #0x8]
    36a8:	e0 03 07 91	add	x0, sp, #0x1c0
    36ac:	f2 02 00 94	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
    36b0:	e0 a3 07 91	add	x0, sp, #0x1e8
    36b4:	fb 02 00 94	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
    36b8:	a0 e3 00 d1	sub	x0, x29, #0x38
    36bc:	65 45 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    36c0:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    36c4:	ff 43 0d 91	add	sp, sp, #0x350
    36c8:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
    36cc:	fc 6f c2 a8	ldp	x28, x27, [sp], #0x20
    36d0:	c0 03 5f d6	ret
    36d4:	e0 03 07 91	add	x0, sp, #0x1c0
    36d8:	e7 02 00 94	bl	__ZNSt3__16vectorIiNS_9allocatorIiEEED1B9nqe210106Ev
    36dc:	01 00 00 14	b	0x36e0
    36e0:	e0 a3 07 91	add	x0, sp, #0x1e8
    36e4:	ef 02 00 94	bl	__ZN12_GLOBAL__N_111PdfDocumentD1Ev
    36e8:	01 00 00 14	b	0x36ec
    36ec:	a0 e3 00 d1	sub	x0, x29, #0x38
    36f0:	58 45 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    36f4:	01 00 00 14	b	0x36f8
    36f8:	e0 f3 40 f9	ldr	x0, [sp, #0x1e0]
    36fc:	b6 44 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
    3700:	20 00 20 d4	brk	#0x1
