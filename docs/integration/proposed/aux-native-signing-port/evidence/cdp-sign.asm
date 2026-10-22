/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift10cmdCdpSignSSyF:
   40160:	fc 6f ba a9	stp	x28, x27, [sp, #-0x60]!
   40164:	fa 67 01 a9	stp	x26, x25, [sp, #0x10]
   40168:	f8 5f 02 a9	stp	x24, x23, [sp, #0x20]
   4016c:	f6 57 03 a9	stp	x22, x21, [sp, #0x30]
   40170:	f4 4f 04 a9	stp	x20, x19, [sp, #0x40]
   40174:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   40178:	fd 43 01 91	add	x29, sp, #0x50
   4017c:	ff c3 0c d1	sub	sp, sp, #0x330
   40180:	f3 03 00 91	mov	x19, sp
   40184:	28 37 00 90	adrp	x8, 1764 ; 0x724000
   40188:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   4018c:	08 01 40 f9	ldr	x8, [x8]
   40190:	a8 83 19 f8	stur	x8, [x29, #-0x68]
   40194:	74 90 ff 97	bl	_$s16AsideNativeSwift16nativeInputLinesSaySSGvg
   40198:	14 08 40 f9	ldr	x20, [x0, #0x10]
   4019c:	10 56 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   401a0:	14 15 00 b4	cbz	x20, 0x40440
   401a4:	70 90 ff 97	bl	_$s16AsideNativeSwift16nativeInputLinesSaySSGvg
   401a8:	14 08 40 f9	ldr	x20, [x0, #0x10]
   401ac:	94 8d 00 b4	cbz	x20, 0x4135c
   401b0:	f6 03 00 aa	mov	x22, x0
   401b4:	17 54 42 a9	ldp	x23, x21, [x0, #0x20]
   401b8:	e0 03 15 aa	mov	x0, x21
   401bc:	0e 56 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   401c0:	e0 03 16 aa	mov	x0, x22
   401c4:	36 56 13 94	bl	0x515a9c ; symbol stub for: _swift_isUniquelyReferenced_nonNull_native
   401c8:	b6 83 12 f8	stur	x22, [x29, #-0xd8]
   401cc:	a0 00 00 34	cbz	w0, 0x401e0
   401d0:	88 06 00 d1	sub	x8, x20, #0x1
   401d4:	c9 0e 40 f9	ldr	x9, [x22, #0x18]
   401d8:	1f 05 49 eb	cmp	x8, x9, lsr #1
   401dc:	e9 00 00 54	b.ls	0x401f8
   401e0:	e1 03 14 aa	mov	x1, x20
   401e4:	22 00 80 52	mov	w2, #0x1
   401e8:	e3 03 16 aa	mov	x3, x22
   401ec:	c2 2b 00 94	bl	_$ss12_ArrayBufferV20_consumeAndCreateNew14bufferIsUnique15minimumCapacity13growForAppendAByxGSb_SiSbtFSS_Tg5
   401f0:	f6 03 00 aa	mov	x22, x0
   401f4:	a0 83 12 f8	stur	x0, [x29, #-0xd8]
   401f8:	b4 63 03 d1	sub	x20, x29, #0xd8
   401fc:	00 00 80 d2	mov	x0, #0x0
   40200:	21 00 80 52	mov	w1, #0x1
   40204:	02 00 80 d2	mov	x2, #0x0
   40208:	e5 34 00 94	bl	_$ss20_ArrayBufferProtocolPsE15replaceSubrange_4with10elementsOfySnySiG_Siqd__ntSlRd__7ElementQyd__AGRtzlFs01_aB0VySSG_s15EmptyCollectionVySSGTg5Tf4nndn_n
   4020c:	e0 03 16 aa	mov	x0, x22
   40210:	bb 90 ff 97	bl	_$s16AsideNativeSwift16nativeInputLinesSaySSGvs
   40214:	e8 be 40 92	and	x8, x23, #0xffffffffffff
   40218:	a9 ee 78 d3	ubfx	x9, x21, #56, #4
   4021c:	bf 02 43 f2	tst	x21, #0x2000000000000000
   40220:	08 01 89 9a	csel	x8, x8, x9, eq
   40224:	a8 10 00 b4	cbz	x8, 0x40438
   40228:	b7 d7 32 a9	stp	x23, x21, [x29, #-0xd8]
   4022c:	00 00 80 d2	mov	x0, #0x0
   40230:	c6 50 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   40234:	fa 03 00 aa	mov	x26, x0
   40238:	fc 03 00 91	mov	x28, sp
   4023c:	17 80 5f f8	ldur	x23, [x0, #-0x8]
   40240:	f8 22 40 f9	ldr	x24, [x23, #0x40]
   40244:	e9 03 18 aa	mov	x9, x24
   40248:	30 37 00 90	adrp	x16, 1764 ; 0x724000
   4024c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   40250:	00 02 3f d6	blr	x16
   40254:	e8 03 00 91	mov	x8, sp
   40258:	09 3f 00 91	add	x9, x24, #0xf
   4025c:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   40260:	1b 01 09 cb	sub	x27, x8, x9
   40264:	7f 03 00 91	mov	sp, x27
   40268:	e8 03 1b aa	mov	x8, x27
   4026c:	b4 50 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   40270:	fa 34 00 94	bl	_$sS2SSysWl
   40274:	e3 03 00 aa	mov	x3, x0
   40278:	39 37 00 90	adrp	x25, 1764 ; 0x724000
   4027c:	39 27 41 f9	ldr	x25, [x25, #0x248] ; literal pool symbol address: _$sSSN
   40280:	e0 03 1b aa	mov	x0, x27
   40284:	01 00 80 52	mov	w1, #0x0
   40288:	e2 03 19 aa	mov	x2, x25
   4028c:	ee 50 13 94	bl	0x514644 ; symbol stub for: _$sSy10FoundationE4data5using20allowLossyConversionAA4DataVSgSSAAE8EncodingV_SbtF
   40290:	f4 03 00 aa	mov	x20, x0
   40294:	f6 03 01 aa	mov	x22, x1
   40298:	e8 06 40 f9	ldr	x8, [x23, #0x8]
   4029c:	e0 03 1b aa	mov	x0, x27
   402a0:	e1 03 1a aa	mov	x1, x26
   402a4:	00 01 3f d6	blr	x8
   402a8:	e0 03 15 aa	mov	x0, x21
   402ac:	cc 55 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   402b0:	9f 03 00 91	mov	sp, x28
   402b4:	c8 fe 7c d3	lsr	x8, x22, #60
   402b8:	1a 38 00 b0	adrp	x26, 1793 ; 0x741000
   402bc:	37 37 00 90	adrp	x23, 1764 ; 0x724000
   402c0:	f7 6a 41 f9	ldr	x23, [x23, #0x2d0] ; literal pool symbol address: _$sypN
   402c4:	1f 39 00 f1	cmp	x8, #0xe
   402c8:	29 1d 00 54	b.ls	0x4066c
   402cc:	bb 04 80 d2	mov	x27, #0x25
   402d0:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   402d4:	c8 26 00 d0	adrp	x8, 1242 ; 0x51a000
   402d8:	08 41 00 91	add	x8, x8, #0x10 ; literal pool for: "Invalid UTF-8 input"
   402dc:	08 81 00 d1	sub	x8, x8, #0x20
   402e0:	16 01 41 b2	orr	x22, x8, #0x8000000000000000
   402e4:	00 38 00 b0	adrp	x0, 1793 ; 0x741000
   402e8:	00 c0 12 91	add	x0, x0, #0x4b0
   402ec:	41 27 00 d0	adrp	x1, 1258 ; 0x52a000
   402f0:	21 a0 1c 91	add	x1, x1, #0x728
   402f4:	6e 90 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   402f8:	a1 e3 02 d1	sub	x1, x29, #0xb8
   402fc:	e2 55 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   40300:	f4 03 00 aa	mov	x20, x0
   40304:	48 27 00 d0	adrp	x8, 1258 ; 0x52a000
   40308:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   4030c:	00 04 80 3d	str	q0, [x0, #0x10]
   40310:	a8 4c 8e d2	mov	x8, #0x7265
   40314:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   40318:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   4031c:	f5 03 00 aa	mov	x21, x0
   40320:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   40324:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   40328:	19 24 00 f9	str	x25, [x0, #0x48]
   4032c:	69 4b 00 d1	sub	x9, x27, #0x12
   40330:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   40334:	16 1c 00 f9	str	x22, [x0, #0x38]
   40338:	f7 34 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   4033c:	f6 03 00 aa	mov	x22, x0
   40340:	e0 03 14 aa	mov	x0, x20
   40344:	e5 55 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   40348:	01 38 00 b0	adrp	x1, 1793 ; 0x741000
   4034c:	21 e0 12 91	add	x1, x1, #0x4b8
   40350:	42 27 00 d0	adrp	x2, 1258 ; 0x52a000
   40354:	42 c0 1c 91	add	x2, x2, #0x730
   40358:	e0 03 15 aa	mov	x0, x21
   4035c:	ad 3d 00 94	bl	_$sypSgWOhTm
   40360:	40 ef 41 f9	ldr	x0, [x26, #0x3d8]
   40364:	fc 54 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   40368:	f4 03 00 aa	mov	x20, x0
   4036c:	23 37 00 90	adrp	x3, 1764 ; 0x724000
   40370:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   40374:	e2 22 00 91	add	x2, x23, #0x8
   40378:	e0 03 16 aa	mov	x0, x22
   4037c:	e1 03 19 aa	mov	x1, x25
   40380:	5a 50 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   40384:	f5 03 00 aa	mov	x21, x0
   40388:	bf 83 12 f8	stur	xzr, [x29, #-0xd8]
   4038c:	a4 63 03 d1	sub	x4, x29, #0xd8
   40390:	e0 03 14 aa	mov	x0, x20
   40394:	e2 03 15 aa	mov	x2, x21
   40398:	03 00 80 d2	mov	x3, #0x0
   4039c:	41 5c 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   403a0:	fd 03 1d aa	mov	x29, x29
   403a4:	f5 54 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   403a8:	f4 03 00 aa	mov	x20, x0
   403ac:	e0 03 15 aa	mov	x0, x21
   403b0:	ec 54 13 94	bl	0x515760 ; symbol stub for: _objc_release
   403b4:	a0 83 52 f8	ldur	x0, [x29, #-0xd8]
   403b8:	ed 54 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   403bc:	b4 11 00 b4	cbz	x20, 0x405f0
   403c0:	e0 03 14 aa	mov	x0, x20
   403c4:	68 4f 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   403c8:	f7 03 00 aa	mov	x23, x0
   403cc:	f9 03 01 aa	mov	x25, x1
   403d0:	e0 03 14 aa	mov	x0, x20
   403d4:	e3 54 13 94	bl	0x515760 ; symbol stub for: _objc_release
   403d8:	fa 03 00 91	mov	x26, sp
   403dc:	e9 03 18 aa	mov	x9, x24
   403e0:	30 37 00 90	adrp	x16, 1764 ; 0x724000
   403e4:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   403e8:	00 02 3f d6	blr	x16
   403ec:	e8 03 00 91	mov	x8, sp
   403f0:	09 3f 00 91	add	x9, x24, #0xf
   403f4:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   403f8:	14 01 09 cb	sub	x20, x8, x9
   403fc:	9f 02 00 91	mov	sp, x20
   40400:	e8 03 14 aa	mov	x8, x20
   40404:	4e 50 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   40408:	e0 03 17 aa	mov	x0, x23
   4040c:	e1 03 19 aa	mov	x1, x25
   40410:	e2 03 14 aa	mov	x2, x20
   40414:	47 50 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   40418:	f5 03 00 aa	mov	x21, x0
   4041c:	f4 03 01 aa	mov	x20, x1
   40420:	e0 03 17 aa	mov	x0, x23
   40424:	e1 03 19 aa	mov	x1, x25
   40428:	9c 34 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   4042c:	5f 03 00 91	mov	sp, x26
   40430:	94 0d 00 b5	cbnz	x20, 0x405e0
   40434:	78 00 00 14	b	0x40614
   40438:	e0 03 15 aa	mov	x0, x21
   4043c:	68 55 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   40440:	bb 04 80 d2	mov	x27, #0x25
   40444:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   40448:	c8 26 00 d0	adrp	x8, 1242 ; 0x51a000
   4044c:	08 c1 01 91	add	x8, x8, #0x70 ; literal pool for: "No input provided on stdin"
   40450:	08 81 00 d1	sub	x8, x8, #0x20
   40454:	16 01 41 b2	orr	x22, x8, #0x8000000000000000
   40458:	00 38 00 b0	adrp	x0, 1793 ; 0x741000
   4045c:	00 c0 12 91	add	x0, x0, #0x4b0
   40460:	41 27 00 d0	adrp	x1, 1258 ; 0x52a000
   40464:	21 a0 1c 91	add	x1, x1, #0x728
   40468:	11 90 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   4046c:	01 0a 80 52	mov	w1, #0x50
   40470:	e2 00 80 52	mov	w2, #0x7
   40474:	4e 55 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   40478:	f4 03 00 aa	mov	x20, x0
   4047c:	48 27 00 d0	adrp	x8, 1258 ; 0x52a000
   40480:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   40484:	00 04 80 3d	str	q0, [x0, #0x10]
   40488:	a8 4c 8e d2	mov	x8, #0x7265
   4048c:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   40490:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   40494:	f5 03 00 aa	mov	x21, x0
   40498:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   4049c:	37 37 00 90	adrp	x23, 1764 ; 0x724000
   404a0:	f7 26 41 f9	ldr	x23, [x23, #0x248] ; literal pool symbol address: _$sSSN
   404a4:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   404a8:	17 24 00 f9	str	x23, [x0, #0x48]
   404ac:	69 2f 00 d1	sub	x9, x27, #0xb
   404b0:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   404b4:	16 1c 00 f9	str	x22, [x0, #0x38]
   404b8:	97 34 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   404bc:	f6 03 00 aa	mov	x22, x0
   404c0:	e0 03 14 aa	mov	x0, x20
   404c4:	85 55 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   404c8:	01 38 00 b0	adrp	x1, 1793 ; 0x741000
   404cc:	21 e0 12 91	add	x1, x1, #0x4b8
   404d0:	42 27 00 d0	adrp	x2, 1258 ; 0x52a000
   404d4:	42 c0 1c 91	add	x2, x2, #0x730
   404d8:	e0 03 15 aa	mov	x0, x21
   404dc:	4d 3d 00 94	bl	_$sypSgWOhTm
   404e0:	e0 03 14 aa	mov	x0, x20
   404e4:	01 04 80 52	mov	w1, #0x20
   404e8:	e2 00 80 52	mov	w2, #0x7
   404ec:	48 55 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   404f0:	08 38 00 b0	adrp	x8, 1793 ; 0x741000
   404f4:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   404f8:	97 54 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   404fc:	f4 03 00 aa	mov	x20, x0
   40500:	28 37 00 90	adrp	x8, 1764 ; 0x724000
   40504:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   40508:	23 37 00 90	adrp	x3, 1764 ; 0x724000
   4050c:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   40510:	02 21 00 91	add	x2, x8, #0x8
   40514:	e0 03 16 aa	mov	x0, x22
   40518:	e1 03 17 aa	mov	x1, x23
   4051c:	f3 4f 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   40520:	f5 03 00 aa	mov	x21, x0
   40524:	bf 83 12 f8	stur	xzr, [x29, #-0xd8]
   40528:	a4 63 03 d1	sub	x4, x29, #0xd8
   4052c:	e0 03 14 aa	mov	x0, x20
   40530:	e2 03 15 aa	mov	x2, x21
   40534:	03 00 80 d2	mov	x3, #0x0
   40538:	da 5b 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   4053c:	fd 03 1d aa	mov	x29, x29
   40540:	8e 54 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   40544:	f4 03 00 aa	mov	x20, x0
   40548:	e0 03 15 aa	mov	x0, x21
   4054c:	85 54 13 94	bl	0x515760 ; symbol stub for: _objc_release
   40550:	a0 83 52 f8	ldur	x0, [x29, #-0xd8]
   40554:	86 54 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   40558:	d4 04 00 b4	cbz	x20, 0x405f0
   4055c:	e0 03 14 aa	mov	x0, x20
   40560:	01 4f 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   40564:	f7 03 00 aa	mov	x23, x0
   40568:	f8 03 01 aa	mov	x24, x1
   4056c:	e0 03 14 aa	mov	x0, x20
   40570:	7c 54 13 94	bl	0x515760 ; symbol stub for: _objc_release
   40574:	00 00 80 d2	mov	x0, #0x0
   40578:	f4 4f 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   4057c:	f9 03 00 91	mov	x25, sp
   40580:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   40584:	08 21 40 f9	ldr	x8, [x8, #0x40]
   40588:	e9 03 08 aa	mov	x9, x8
   4058c:	30 37 00 90	adrp	x16, 1764 ; 0x724000
   40590:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   40594:	00 02 3f d6	blr	x16
   40598:	e9 03 00 91	mov	x9, sp
   4059c:	08 3d 00 91	add	x8, x8, #0xf
   405a0:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   405a4:	34 01 08 cb	sub	x20, x9, x8
   405a8:	9f 02 00 91	mov	sp, x20
   405ac:	e8 03 14 aa	mov	x8, x20
   405b0:	e3 4f 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   405b4:	e0 03 17 aa	mov	x0, x23
   405b8:	e1 03 18 aa	mov	x1, x24
   405bc:	e2 03 14 aa	mov	x2, x20
   405c0:	dc 4f 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   405c4:	f5 03 00 aa	mov	x21, x0
   405c8:	f4 03 01 aa	mov	x20, x1
   405cc:	e0 03 17 aa	mov	x0, x23
   405d0:	e1 03 18 aa	mov	x1, x24
   405d4:	31 34 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   405d8:	3f 03 00 91	mov	sp, x25
   405dc:	d4 01 00 b4	cbz	x20, 0x40614
   405e0:	e0 03 16 aa	mov	x0, x22
   405e4:	fe 54 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   405e8:	fb 03 15 aa	mov	x27, x21
   405ec:	10 00 00 14	b	0x4062c
   405f0:	f4 03 00 aa	mov	x20, x0
   405f4:	a0 4e 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   405f8:	f7 03 00 aa	mov	x23, x0
   405fc:	e0 03 14 aa	mov	x0, x20
   40600:	58 54 13 94	bl	0x515760 ; symbol stub for: _objc_release
   40604:	f5 03 17 aa	mov	x21, x23
   40608:	3d 55 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   4060c:	e0 03 17 aa	mov	x0, x23
   40610:	08 55 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   40614:	e0 03 16 aa	mov	x0, x22
   40618:	f1 54 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   4061c:	c8 26 00 b0	adrp	x8, 1241 ; 0x519000
   40620:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   40624:	08 81 00 d1	sub	x8, x8, #0x20
   40628:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   4062c:	a8 83 59 f8	ldur	x8, [x29, #-0x68]
   40630:	29 37 00 90	adrp	x9, 1764 ; 0x724000
   40634:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   40638:	29 01 40 f9	ldr	x9, [x9]
   4063c:	3f 01 08 eb	cmp	x9, x8
   40640:	c1 93 00 54	b.ne	0x418b8
   40644:	e0 03 1b aa	mov	x0, x27
   40648:	e1 03 14 aa	mov	x1, x20
   4064c:	bf 43 01 d1	sub	sp, x29, #0x50
   40650:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   40654:	f4 4f 44 a9	ldp	x20, x19, [sp, #0x40]
   40658:	f6 57 43 a9	ldp	x22, x21, [sp, #0x30]
   4065c:	f8 5f 42 a9	ldp	x24, x23, [sp, #0x20]
   40660:	fa 67 41 a9	ldp	x26, x25, [sp, #0x10]
   40664:	fc 6f c6 a8	ldp	x28, x27, [sp], #0x60
   40668:	c0 03 5f d6	ret
   4066c:	40 ef 41 f9	ldr	x0, [x26, #0x3d8]
   40670:	39 54 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   40674:	fc 03 00 aa	mov	x28, x0
   40678:	74 32 00 f9	str	x20, [x19, #0x60]
   4067c:	e0 03 14 aa	mov	x0, x20
   40680:	e1 03 16 aa	mov	x1, x22
   40684:	b2 4e 13 94	bl	0x51414c ; symbol stub for: _$s10Foundation4DataV19_bridgeToObjectiveCSo6NSDataCyF
   40688:	f5 03 00 aa	mov	x21, x0
   4068c:	7f 46 00 f9	str	xzr, [x19, #0x88]
   40690:	64 22 02 91	add	x4, x19, #0x88
   40694:	e0 03 1c aa	mov	x0, x28
   40698:	e2 03 15 aa	mov	x2, x21
   4069c:	03 00 80 d2	mov	x3, #0x0
   406a0:	10 5b 13 94	bl	"_objc_msgSend$JSONObjectWithData:options:error:"
   406a4:	fd 03 1d aa	mov	x29, x29
   406a8:	34 54 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   406ac:	f4 03 00 aa	mov	x20, x0
   406b0:	e0 03 15 aa	mov	x0, x21
   406b4:	2b 54 13 94	bl	0x515760 ; symbol stub for: _objc_release
   406b8:	60 46 40 f9	ldr	x0, [x19, #0x88]
   406bc:	2c 54 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   406c0:	b4 05 00 b4	cbz	x20, 0x40774
   406c4:	a8 03 04 d1	sub	x8, x29, #0x100
   406c8:	e0 03 14 aa	mov	x0, x20
   406cc:	e1 4f 13 94	bl	0x514650 ; symbol stub for: _$ss018_bridgeAnyObjectToB0yypyXlSgF
   406d0:	e0 03 14 aa	mov	x0, x20
   406d4:	04 55 13 94	bl	0x515ae4 ; symbol stub for: _swift_unknownObjectRelease
   406d8:	a0 03 04 d1	sub	x0, x29, #0x100
   406dc:	a1 63 03 d1	sub	x1, x29, #0xd8
   406e0:	5d 34 00 94	bl	_$sypWOb
   406e4:	a0 63 03 d1	sub	x0, x29, #0xd8
   406e8:	a1 03 04 d1	sub	x1, x29, #0x100
   406ec:	fb 33 00 94	bl	_$sypWOc
   406f0:	00 38 00 b0	adrp	x0, 1793 ; 0x741000
   406f4:	00 a0 12 91	add	x0, x0, #0x4a8
   406f8:	41 27 00 d0	adrp	x1, 1258 ; 0x52a000
   406fc:	21 80 1c 91	add	x1, x1, #0x720
   40700:	6b 8f ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   40704:	e3 03 00 aa	mov	x3, x0
   40708:	60 22 02 91	add	x0, x19, #0x88
   4070c:	a1 03 04 d1	sub	x1, x29, #0x100
   40710:	e2 22 00 91	add	x2, x23, #0x8
   40714:	c4 00 80 52	mov	w4, #0x6
   40718:	c3 54 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   4071c:	60 07 00 36	tbz	w0, #0x0, 0x40808
   40720:	b5 03 04 d1	sub	x21, x29, #0x100
   40724:	74 46 40 f9	ldr	x20, [x19, #0x88]
   40728:	88 0a 40 f9	ldr	x8, [x20, #0x10]
   4072c:	c8 03 00 b4	cbz	x8, 0x407a4
   40730:	e0 03 14 aa	mov	x0, x20
   40734:	b0 54 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   40738:	60 0c 8d d2	mov	x0, #0x6863
   4073c:	20 8c ad f2	movk	x0, #0x6c61, lsl #16
   40740:	80 ad cc f2	movk	x0, #0x656c, lsl #32
   40744:	c0 ed ec f2	movk	x0, #0x676e, lsl #48
   40748:	a1 0c 80 d2	mov	x1, #0x65
   4074c:	01 20 fd f2	movk	x1, #0xe900, lsl #48
   40750:	08 26 00 94	bl	_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5
   40754:	41 02 00 36	tbz	w1, #0x0, 0x4079c
   40758:	88 1e 40 f9	ldr	x8, [x20, #0x38]
   4075c:	00 15 00 8b	add	x0, x8, x0, lsl #5
   40760:	a1 03 04 d1	sub	x1, x29, #0x100
   40764:	dd 33 00 94	bl	_$sypWOc
   40768:	e0 03 14 aa	mov	x0, x20
   4076c:	9c 54 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   40770:	0f 00 00 14	b	0x407ac
   40774:	f4 03 00 aa	mov	x20, x0
   40778:	3f 4e 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   4077c:	fa 03 00 aa	mov	x26, x0
   40780:	e0 03 14 aa	mov	x0, x20
   40784:	f7 53 13 94	bl	0x515760 ; symbol stub for: _objc_release
   40788:	f5 03 1a aa	mov	x21, x26
   4078c:	dc 54 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   40790:	e0 03 1a aa	mov	x0, x26
   40794:	a7 54 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   40798:	27 00 00 14	b	0x40834
   4079c:	e0 03 14 aa	mov	x0, x20
   407a0:	8f 54 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   407a4:	00 e4 00 6f	movi.2d	v0, #0000000000000000
   407a8:	a0 02 00 ad	stp	q0, q0, [x21]
   407ac:	e0 03 14 aa	mov	x0, x20
   407b0:	8b 54 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   407b4:	a8 83 51 f8	ldur	x8, [x29, #-0xe8]
   407b8:	e8 02 00 b4	cbz	x8, 0x40814
   407bc:	23 37 00 90	adrp	x3, 1764 ; 0x724000
   407c0:	63 24 41 f9	ldr	x3, [x3, #0x248] ; literal pool symbol address: _$sSSN
   407c4:	60 22 02 91	add	x0, x19, #0x88
   407c8:	a1 03 04 d1	sub	x1, x29, #0x100
   407cc:	e2 22 00 91	add	x2, x23, #0x8
   407d0:	c4 00 80 52	mov	w4, #0x6
   407d4:	94 54 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   407d8:	80 01 00 36	tbz	w0, #0x0, 0x40808
   407dc:	60 d2 48 a9	ldp	x0, x20, [x19, #0x88]
   407e0:	e1 03 14 aa	mov	x1, x20
   407e4:	02 00 80 d2	mov	x2, #0x0
   407e8:	4a 4e 13 94	bl	0x514110 ; symbol stub for: _$s10Foundation4DataV13base64Encoded7optionsACSgSSh_So27NSDataBase64DecodingOptionsVtcfC
   407ec:	f7 03 00 aa	mov	x23, x0
   407f0:	fa 03 01 aa	mov	x26, x1
   407f4:	e0 03 14 aa	mov	x0, x20
   407f8:	79 54 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   407fc:	48 ff 7c d3	lsr	x8, x26, #60
   40800:	1f 3d 00 f1	cmp	x8, #0xf
   40804:	a3 0f 00 54	b.lo	0x409f8
   40808:	a0 63 03 d1	sub	x0, x29, #0xd8
   4080c:	1a 38 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   40810:	09 00 00 14	b	0x40834
   40814:	a0 63 03 d1	sub	x0, x29, #0xd8
   40818:	17 38 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   4081c:	01 38 00 b0	adrp	x1, 1793 ; 0x741000
   40820:	21 40 12 91	add	x1, x1, #0x490
   40824:	42 27 00 d0	adrp	x2, 1258 ; 0x52a000
   40828:	42 40 1c 91	add	x2, x2, #0x710
   4082c:	a0 03 04 d1	sub	x0, x29, #0x100
   40830:	78 3c 00 94	bl	_$sypSgWOhTm
   40834:	bb 04 80 d2	mov	x27, #0x25
   40838:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   4083c:	c8 26 00 d0	adrp	x8, 1242 ; 0x51a000
   40840:	08 c1 00 91	add	x8, x8, #0x30 ; literal pool for: "Invalid input JSON"
   40844:	08 81 00 d1	sub	x8, x8, #0x20
   40848:	17 01 41 b2	orr	x23, x8, #0x8000000000000000
   4084c:	00 38 00 b0	adrp	x0, 1793 ; 0x741000
   40850:	00 c0 12 91	add	x0, x0, #0x4b0
   40854:	41 27 00 d0	adrp	x1, 1258 ; 0x52a000
   40858:	21 a0 1c 91	add	x1, x1, #0x728
   4085c:	14 8f ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   40860:	61 c2 08 91	add	x1, x19, #0x230
   40864:	88 54 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   40868:	f4 03 00 aa	mov	x20, x0
   4086c:	48 27 00 d0	adrp	x8, 1258 ; 0x52a000
   40870:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   40874:	00 04 80 3d	str	q0, [x0, #0x10]
   40878:	a8 4c 8e d2	mov	x8, #0x7265
   4087c:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   40880:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   40884:	f5 03 00 aa	mov	x21, x0
   40888:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   4088c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   40890:	19 24 00 f9	str	x25, [x0, #0x48]
   40894:	69 4f 00 d1	sub	x9, x27, #0x13
   40898:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   4089c:	17 1c 00 f9	str	x23, [x0, #0x38]
   408a0:	9d 33 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   408a4:	fa 03 00 aa	mov	x26, x0
   408a8:	e0 03 14 aa	mov	x0, x20
   408ac:	8b 54 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   408b0:	01 38 00 b0	adrp	x1, 1793 ; 0x741000
   408b4:	21 e0 12 91	add	x1, x1, #0x4b8
   408b8:	42 27 00 d0	adrp	x2, 1258 ; 0x52a000
   408bc:	42 c0 1c 91	add	x2, x2, #0x730
   408c0:	e0 03 15 aa	mov	x0, x21
   408c4:	53 3c 00 94	bl	_$sypSgWOhTm
   408c8:	23 37 00 90	adrp	x3, 1764 ; 0x724000
   408cc:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   408d0:	28 37 00 90	adrp	x8, 1764 ; 0x724000
   408d4:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   408d8:	02 21 00 91	add	x2, x8, #0x8
   408dc:	e0 03 1a aa	mov	x0, x26
   408e0:	e1 03 19 aa	mov	x1, x25
   408e4:	01 4f 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   408e8:	f5 03 00 aa	mov	x21, x0
   408ec:	bf 83 12 f8	stur	xzr, [x29, #-0xd8]
   408f0:	a4 63 03 d1	sub	x4, x29, #0xd8
   408f4:	e0 03 1c aa	mov	x0, x28
   408f8:	e2 03 15 aa	mov	x2, x21
   408fc:	03 00 80 d2	mov	x3, #0x0
   40900:	e8 5a 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   40904:	fd 03 1d aa	mov	x29, x29
   40908:	9c 53 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   4090c:	f4 03 00 aa	mov	x20, x0
   40910:	e0 03 15 aa	mov	x0, x21
   40914:	93 53 13 94	bl	0x515760 ; symbol stub for: _objc_release
   40918:	a0 83 52 f8	ldur	x0, [x29, #-0xd8]
   4091c:	94 53 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   40920:	74 04 00 b4	cbz	x20, 0x409ac
   40924:	e0 03 14 aa	mov	x0, x20
   40928:	0f 4e 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   4092c:	f9 03 00 aa	mov	x25, x0
   40930:	fc 03 01 aa	mov	x28, x1
   40934:	e0 03 14 aa	mov	x0, x20
   40938:	8a 53 13 94	bl	0x515760 ; symbol stub for: _objc_release
   4093c:	f7 03 00 91	mov	x23, sp
   40940:	e9 03 18 aa	mov	x9, x24
   40944:	30 37 00 90	adrp	x16, 1764 ; 0x724000
   40948:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   4094c:	00 02 3f d6	blr	x16
   40950:	e8 03 00 91	mov	x8, sp
   40954:	09 3f 00 91	add	x9, x24, #0xf
   40958:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   4095c:	14 01 09 cb	sub	x20, x8, x9
   40960:	9f 02 00 91	mov	sp, x20
   40964:	e8 03 14 aa	mov	x8, x20
   40968:	f5 4e 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   4096c:	e0 03 19 aa	mov	x0, x25
   40970:	e1 03 1c aa	mov	x1, x28
   40974:	e2 03 14 aa	mov	x2, x20
   40978:	ee 4e 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   4097c:	f5 03 00 aa	mov	x21, x0
   40980:	f4 03 01 aa	mov	x20, x1
   40984:	e0 03 19 aa	mov	x0, x25
   40988:	e1 03 1c aa	mov	x1, x28
   4098c:	43 33 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   40990:	ff 02 00 91	mov	sp, x23
   40994:	f4 01 00 b4	cbz	x20, 0x409d0
   40998:	60 32 40 f9	ldr	x0, [x19, #0x60]
   4099c:	e1 03 16 aa	mov	x1, x22
   409a0:	32 3c 00 94	bl	0x4fa68
   409a4:	e0 03 1a aa	mov	x0, x26
   409a8:	0f ff ff 17	b	0x405e4
   409ac:	f4 03 00 aa	mov	x20, x0
   409b0:	b1 4d 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   409b4:	f8 03 00 aa	mov	x24, x0
   409b8:	e0 03 14 aa	mov	x0, x20
   409bc:	69 53 13 94	bl	0x515760 ; symbol stub for: _objc_release
   409c0:	f5 03 18 aa	mov	x21, x24
   409c4:	4e 54 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   409c8:	e0 03 18 aa	mov	x0, x24
   409cc:	19 54 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   409d0:	c8 26 00 b0	adrp	x8, 1241 ; 0x519000
   409d4:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   409d8:	08 81 00 d1	sub	x8, x8, #0x20
   409dc:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   409e0:	60 32 40 f9	ldr	x0, [x19, #0x60]
   409e4:	e1 03 16 aa	mov	x1, x22
   409e8:	20 3c 00 94	bl	0x4fa68
   409ec:	e0 03 1a aa	mov	x0, x26
   409f0:	fb 53 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   409f4:	0e ff ff 17	b	0x4062c
   409f8:	15 00 80 d2	mov	x21, #0x0
   409fc:	07 cc ff 97	bl	_$s16AsideNativeSwift18requireInstallMetaAA0eF0VyKF
   40a00:	77 2e 00 f9	str	x23, [x19, #0x58]
   40a04:	55 0f 00 b4	cbz	x21, 0x40bec
   40a08:	7a 2a 00 f9	str	x26, [x19, #0x50]
   40a0c:	bb 04 80 d2	mov	x27, #0x25
   40a10:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   40a14:	08 00 fc d2	mov	x8, #-0x2000000000000000
   40a18:	bf 23 30 a9	stp	xzr, x8, [x29, #-0x100]
   40a1c:	b4 03 04 d1	sub	x20, x29, #0x100
   40a20:	60 02 80 52	mov	w0, #0x13
   40a24:	17 4f 13 94	bl	0x514680 ; symbol stub for: _$ss11_StringGutsV4growyySiF
   40a28:	a0 83 50 f8	ldur	x0, [x29, #-0xf8]
   40a2c:	ec 53 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   40a30:	c8 26 00 d0	adrp	x8, 1242 ; 0x51a000
   40a34:	08 41 01 91	add	x8, x8, #0x50 ; literal pool for: "cdp-sign failed: "
   40a38:	08 81 00 d1	sub	x8, x8, #0x20
   40a3c:	08 01 41 b2	orr	x8, x8, #0x8000000000000000
   40a40:	69 53 00 d1	sub	x9, x27, #0x14
   40a44:	a9 23 30 a9	stp	x9, x8, [x29, #-0x100]
   40a48:	61 02 02 91	add	x1, x19, #0x80
   40a4c:	62 a2 01 91	add	x2, x19, #0x68
   40a50:	75 26 00 f9	str	x21, [x19, #0x48]
   40a54:	e0 03 15 aa	mov	x0, x21
   40a58:	fc 53 13 94	bl	0x515a48 ; symbol stub for: _swift_getErrorValue
   40a5c:	74 82 46 a9	ldp	x20, x0, [x19, #0x68]
   40a60:	61 3e 40 f9	ldr	x1, [x19, #0x78]
   40a64:	49 4f 13 94	bl	0x514788 ; symbol stub for: _$ss5ErrorP10FoundationE20localizedDescriptionSSvg
   40a68:	f5 03 01 aa	mov	x21, x1
   40a6c:	b4 03 04 d1	sub	x20, x29, #0x100
   40a70:	bf 4e 13 94	bl	0x51456c ; symbol stub for: _$sSS6appendyySSF
   40a74:	e0 03 15 aa	mov	x0, x21
   40a78:	d9 53 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   40a7c:	b7 6b 70 a9	ldp	x23, x26, [x29, #-0x100]
   40a80:	00 38 00 b0	adrp	x0, 1793 ; 0x741000
   40a84:	00 c0 12 91	add	x0, x0, #0x4b0
   40a88:	41 27 00 d0	adrp	x1, 1258 ; 0x52a000
   40a8c:	21 a0 1c 91	add	x1, x1, #0x728
   40a90:	87 8e ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   40a94:	61 82 07 91	add	x1, x19, #0x1e0
   40a98:	fb 53 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   40a9c:	f4 03 00 aa	mov	x20, x0
   40aa0:	48 27 00 d0	adrp	x8, 1258 ; 0x52a000
   40aa4:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   40aa8:	a8 4c 8e d2	mov	x8, #0x7265
   40aac:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   40ab0:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   40ab4:	f5 03 00 aa	mov	x21, x0
   40ab8:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   40abc:	00 04 80 3d	str	q0, [x0, #0x10]
   40ac0:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   40ac4:	39 37 00 90	adrp	x25, 1764 ; 0x724000
   40ac8:	39 27 41 f9	ldr	x25, [x25, #0x248] ; literal pool symbol address: _$sSSN
   40acc:	19 24 00 f9	str	x25, [x0, #0x48]
   40ad0:	08 dc 02 a9	stp	x8, x23, [x0, #0x28]
   40ad4:	1a 1c 00 f9	str	x26, [x0, #0x38]
   40ad8:	e0 03 1a aa	mov	x0, x26
   40adc:	c6 53 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   40ae0:	e0 03 14 aa	mov	x0, x20
   40ae4:	0c 33 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   40ae8:	f7 03 00 aa	mov	x23, x0
   40aec:	e0 03 14 aa	mov	x0, x20
   40af0:	fa 53 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   40af4:	01 38 00 b0	adrp	x1, 1793 ; 0x741000
   40af8:	21 e0 12 91	add	x1, x1, #0x4b8
   40afc:	42 27 00 d0	adrp	x2, 1258 ; 0x52a000
   40b00:	42 c0 1c 91	add	x2, x2, #0x730
   40b04:	e0 03 15 aa	mov	x0, x21
   40b08:	c2 3b 00 94	bl	_$sypSgWOhTm
   40b0c:	23 37 00 90	adrp	x3, 1764 ; 0x724000
   40b10:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   40b14:	28 37 00 90	adrp	x8, 1764 ; 0x724000
   40b18:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   40b1c:	02 21 00 91	add	x2, x8, #0x8
   40b20:	77 22 00 f9	str	x23, [x19, #0x40]
   40b24:	e0 03 17 aa	mov	x0, x23
   40b28:	e1 03 19 aa	mov	x1, x25
   40b2c:	6f 4e 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   40b30:	f5 03 00 aa	mov	x21, x0
   40b34:	bf 03 10 f8	stur	xzr, [x29, #-0x100]
   40b38:	a4 03 04 d1	sub	x4, x29, #0x100
   40b3c:	e0 03 1c aa	mov	x0, x28
   40b40:	e2 03 15 aa	mov	x2, x21
   40b44:	03 00 80 d2	mov	x3, #0x0
   40b48:	56 5a 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   40b4c:	fd 03 1d aa	mov	x29, x29
   40b50:	0a 53 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   40b54:	f4 03 00 aa	mov	x20, x0
   40b58:	e0 03 15 aa	mov	x0, x21
   40b5c:	01 53 13 94	bl	0x515760 ; symbol stub for: _objc_release
   40b60:	a0 03 50 f8	ldur	x0, [x29, #-0x100]
   40b64:	02 53 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   40b68:	94 11 00 b4	cbz	x20, 0x40d98
   40b6c:	e0 03 14 aa	mov	x0, x20
   40b70:	7d 4d 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   40b74:	fc 03 00 aa	mov	x28, x0
   40b78:	f9 03 01 aa	mov	x25, x1
   40b7c:	e0 03 14 aa	mov	x0, x20
   40b80:	f8 52 13 94	bl	0x515760 ; symbol stub for: _objc_release
   40b84:	f7 03 00 91	mov	x23, sp
   40b88:	e9 03 18 aa	mov	x9, x24
   40b8c:	30 37 00 90	adrp	x16, 1764 ; 0x724000
   40b90:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   40b94:	00 02 3f d6	blr	x16
   40b98:	e8 03 00 91	mov	x8, sp
   40b9c:	09 3f 00 91	add	x9, x24, #0xf
   40ba0:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   40ba4:	14 01 09 cb	sub	x20, x8, x9
   40ba8:	9f 02 00 91	mov	sp, x20
   40bac:	e8 03 14 aa	mov	x8, x20
   40bb0:	63 4e 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   40bb4:	e0 03 1c aa	mov	x0, x28
   40bb8:	e1 03 19 aa	mov	x1, x25
   40bbc:	e2 03 14 aa	mov	x2, x20
   40bc0:	5c 4e 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   40bc4:	f5 03 00 aa	mov	x21, x0
   40bc8:	f4 03 01 aa	mov	x20, x1
   40bcc:	e0 03 1c aa	mov	x0, x28
   40bd0:	e1 03 19 aa	mov	x1, x25
   40bd4:	b1 32 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   40bd8:	ff 02 00 91	mov	sp, x23
   40bdc:	77 2e 40 f9	ldr	x23, [x19, #0x58]
   40be0:	14 0f 00 b4	cbz	x20, 0x40dc0
   40be4:	fb 03 15 aa	mov	x27, x21
   40be8:	7a 00 00 14	b	0x40dd0
   40bec:	f4 03 00 aa	mov	x20, x0
   40bf0:	28 38 00 b0	adrp	x8, 1797 ; 0x745000
   40bf4:	08 f9 40 f9	ldr	x8, [x8, #0x1f0]
   40bf8:	1f 05 00 b1	cmn	x8, #0x1
   40bfc:	21 65 00 54	b.ne	0x418a0
   40c00:	28 38 00 90	adrp	x8, 1796 ; 0x744000
   40c04:	08 61 39 91	add	x8, x8, #0xe58
   40c08:	00 05 40 a9	ldp	x0, x1, [x8]
   40c0c:	70 c9 ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   40c10:	28 fc 7c d3	lsr	x8, x1, #60
   40c14:	1f 39 00 f1	cmp	x8, #0xe
   40c18:	49 0f 00 54	b.ls	0x40e00
   40c1c:	bb 04 80 d2	mov	x27, #0x25
   40c20:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   40c24:	c8 26 00 b0	adrp	x8, 1241 ; 0x519000
   40c28:	08 81 36 91	add	x8, x8, #0xda0 ; literal pool for: "Install signing key not found"
   40c2c:	08 81 00 d1	sub	x8, x8, #0x20
   40c30:	17 01 41 b2	orr	x23, x8, #0x8000000000000000
   40c34:	00 38 00 b0	adrp	x0, 1793 ; 0x741000
   40c38:	00 c0 12 91	add	x0, x0, #0x4b0
   40c3c:	41 27 00 d0	adrp	x1, 1258 ; 0x52a000
   40c40:	21 a0 1c 91	add	x1, x1, #0x728
   40c44:	1a 8e ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   40c48:	61 42 06 91	add	x1, x19, #0x190
   40c4c:	8e 53 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   40c50:	f4 03 00 aa	mov	x20, x0
   40c54:	48 27 00 d0	adrp	x8, 1258 ; 0x52a000
   40c58:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   40c5c:	00 04 80 3d	str	q0, [x0, #0x10]
   40c60:	a8 4c 8e d2	mov	x8, #0x7265
   40c64:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   40c68:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   40c6c:	f5 03 00 aa	mov	x21, x0
   40c70:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   40c74:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   40c78:	19 24 00 f9	str	x25, [x0, #0x48]
   40c7c:	69 23 00 d1	sub	x9, x27, #0x8
   40c80:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   40c84:	17 1c 00 f9	str	x23, [x0, #0x38]
   40c88:	a3 32 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   40c8c:	f7 03 00 aa	mov	x23, x0
   40c90:	e0 03 14 aa	mov	x0, x20
   40c94:	91 53 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   40c98:	01 38 00 b0	adrp	x1, 1793 ; 0x741000
   40c9c:	21 e0 12 91	add	x1, x1, #0x4b8
   40ca0:	42 27 00 d0	adrp	x2, 1258 ; 0x52a000
   40ca4:	42 c0 1c 91	add	x2, x2, #0x730
   40ca8:	e0 03 15 aa	mov	x0, x21
   40cac:	59 3b 00 94	bl	_$sypSgWOhTm
   40cb0:	23 37 00 90	adrp	x3, 1764 ; 0x724000
   40cb4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   40cb8:	28 37 00 90	adrp	x8, 1764 ; 0x724000
   40cbc:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   40cc0:	02 21 00 91	add	x2, x8, #0x8
   40cc4:	77 26 00 f9	str	x23, [x19, #0x48]
   40cc8:	e0 03 17 aa	mov	x0, x23
   40ccc:	e1 03 19 aa	mov	x1, x25
   40cd0:	06 4e 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   40cd4:	f5 03 00 aa	mov	x21, x0
   40cd8:	bf 03 10 f8	stur	xzr, [x29, #-0x100]
   40cdc:	a4 03 04 d1	sub	x4, x29, #0x100
   40ce0:	e0 03 1c aa	mov	x0, x28
   40ce4:	e2 03 15 aa	mov	x2, x21
   40ce8:	03 00 80 d2	mov	x3, #0x0
   40cec:	ed 59 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   40cf0:	fd 03 1d aa	mov	x29, x29
   40cf4:	a1 52 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   40cf8:	f4 03 00 aa	mov	x20, x0
   40cfc:	e0 03 15 aa	mov	x0, x21
   40d00:	98 52 13 94	bl	0x515760 ; symbol stub for: _objc_release
   40d04:	a0 03 50 f8	ldur	x0, [x29, #-0x100]
   40d08:	99 52 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   40d0c:	f4 1e 00 b4	cbz	x20, 0x410e8
   40d10:	e0 03 14 aa	mov	x0, x20
   40d14:	14 4d 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   40d18:	f9 03 1a aa	mov	x25, x26
   40d1c:	fa 03 00 aa	mov	x26, x0
   40d20:	fc 03 01 aa	mov	x28, x1
   40d24:	e0 03 14 aa	mov	x0, x20
   40d28:	8e 52 13 94	bl	0x515760 ; symbol stub for: _objc_release
   40d2c:	f7 03 00 91	mov	x23, sp
   40d30:	e9 03 18 aa	mov	x9, x24
   40d34:	30 37 00 90	adrp	x16, 1764 ; 0x724000
   40d38:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   40d3c:	00 02 3f d6	blr	x16
   40d40:	e8 03 00 91	mov	x8, sp
   40d44:	09 3f 00 91	add	x9, x24, #0xf
   40d48:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   40d4c:	14 01 09 cb	sub	x20, x8, x9
   40d50:	9f 02 00 91	mov	sp, x20
   40d54:	e8 03 14 aa	mov	x8, x20
   40d58:	f9 4d 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   40d5c:	e0 03 1a aa	mov	x0, x26
   40d60:	e1 03 1c aa	mov	x1, x28
   40d64:	e2 03 14 aa	mov	x2, x20
   40d68:	f2 4d 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   40d6c:	f5 03 00 aa	mov	x21, x0
   40d70:	f4 03 01 aa	mov	x20, x1
   40d74:	e0 03 1a aa	mov	x0, x26
   40d78:	fa 03 19 aa	mov	x26, x25
   40d7c:	e1 03 1c aa	mov	x1, x28
   40d80:	46 32 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   40d84:	ff 02 00 91	mov	sp, x23
   40d88:	77 2e 40 f9	ldr	x23, [x19, #0x58]
   40d8c:	34 1c 00 b4	cbz	x20, 0x41110
   40d90:	fb 03 15 aa	mov	x27, x21
   40d94:	e3 00 00 14	b	0x41120
   40d98:	f4 03 00 aa	mov	x20, x0
   40d9c:	b6 4c 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   40da0:	f8 03 00 aa	mov	x24, x0
   40da4:	e0 03 14 aa	mov	x0, x20
   40da8:	6e 52 13 94	bl	0x515760 ; symbol stub for: _objc_release
   40dac:	f5 03 18 aa	mov	x21, x24
   40db0:	53 53 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   40db4:	e0 03 18 aa	mov	x0, x24
   40db8:	1e 53 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   40dbc:	77 2e 40 f9	ldr	x23, [x19, #0x58]
   40dc0:	c8 26 00 b0	adrp	x8, 1241 ; 0x519000
   40dc4:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   40dc8:	08 81 00 d1	sub	x8, x8, #0x20
   40dcc:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   40dd0:	60 32 40 f9	ldr	x0, [x19, #0x60]
   40dd4:	e1 03 16 aa	mov	x1, x22
   40dd8:	24 3b 00 94	bl	0x4fa68
   40ddc:	e0 03 17 aa	mov	x0, x23
   40de0:	61 2a 40 f9	ldr	x1, [x19, #0x50]
   40de4:	21 3b 00 94	bl	0x4fa68
   40de8:	60 22 40 f9	ldr	x0, [x19, #0x40]
   40dec:	fc 52 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   40df0:	60 26 40 f9	ldr	x0, [x19, #0x48]
   40df4:	0f 53 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   40df8:	e0 03 1a aa	mov	x0, x26
   40dfc:	d1 00 00 14	b	0x41140
   40e00:	f9 03 00 aa	mov	x25, x0
   40e04:	fb 03 01 aa	mov	x27, x1
   40e08:	88 1e 00 12	and	w8, w20, #0xff
   40e0c:	1f 05 00 71	cmp	w8, #0x1
   40e10:	81 06 00 54	b.ne	0x40ee0
   40e14:	40 03 80 52	mov	w0, #0x1a
   40e18:	01 00 80 d2	mov	x1, #0x0
   40e1c:	02 00 80 d2	mov	x2, #0x0
   40e20:	4b 4e 13 94	bl	0x51474c ; symbol stub for: _$ss26_stdlib_isOSVersionAtLeastyBi1_Bw_BwBwtF
   40e24:	60 19 00 36	tbz	w0, #0x0, 0x41150
   40e28:	7a 2a 00 f9	str	x26, [x19, #0x50]
   40e2c:	00 00 80 d2	mov	x0, #0x0
   40e30:	3f 4d 13 94	bl	0x51432c ; symbol stub for: _$s9CryptoKit13SecureEnclaveO7MLDSA65O10PrivateKeyVMa
   40e34:	e8 03 00 91	mov	x8, sp
   40e38:	60 22 03 a9	stp	x0, x8, [x19, #0x30]
   40e3c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   40e40:	68 16 00 f9	str	x8, [x19, #0x28]
   40e44:	08 21 40 f9	ldr	x8, [x8, #0x40]
   40e48:	e9 03 08 aa	mov	x9, x8
   40e4c:	30 37 00 90	adrp	x16, 1764 ; 0x724000
   40e50:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   40e54:	00 02 3f d6	blr	x16
   40e58:	e9 03 00 91	mov	x9, sp
   40e5c:	08 3d 00 91	add	x8, x8, #0xf
   40e60:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   40e64:	34 01 08 cb	sub	x20, x9, x8
   40e68:	9f 02 00 91	mov	sp, x20
   40e6c:	b9 6f 30 a9	stp	x25, x27, [x29, #-0x100]
   40e70:	e0 03 19 aa	mov	x0, x25
   40e74:	e1 03 1b aa	mov	x1, x27
   40e78:	d5 32 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   40e7c:	6e 36 00 94	bl	_$s10Foundation4DataVAcA0B8ProtocolAAWl
   40e80:	fa 03 00 aa	mov	x26, x0
   40e84:	22 37 00 90	adrp	x2, 1764 ; 0x724000
   40e88:	42 18 40 f9	ldr	x2, [x2, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   40e8c:	a0 03 04 d1	sub	x0, x29, #0x100
   40e90:	e8 03 14 aa	mov	x8, x20
   40e94:	01 00 80 d2	mov	x1, #0x0
   40e98:	e3 03 1a aa	mov	x3, x26
   40e9c:	1e 4d 13 94	bl	0x514314 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO7MLDSA65O10PrivateKeyV18dataRepresentation21authenticationContextAGx_So9LAContextCSgtKc10Foundation12DataProtocolRzlufC
   40ea0:	35 25 00 b5	cbnz	x21, 0x41344
   40ea4:	79 22 00 f9	str	x25, [x19, #0x40]
   40ea8:	68 2a 40 f9	ldr	x8, [x19, #0x50]
   40eac:	b7 23 30 a9	stp	x23, x8, [x29, #-0x100]
   40eb0:	21 37 00 90	adrp	x1, 1764 ; 0x724000
   40eb4:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   40eb8:	a0 03 04 d1	sub	x0, x29, #0x100
   40ebc:	e2 03 1a aa	mov	x2, x26
   40ec0:	18 4d 13 94	bl	0x514320 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO7MLDSA65O10PrivateKeyV9signature3for10Foundation4DataVx_tKAJ0K8ProtocolRzlF
   40ec4:	d5 2c 00 b4	cbz	x21, 0x4145c
   40ec8:	68 86 42 a9	ldp	x8, x1, [x19, #0x28]
   40ecc:	08 05 40 f9	ldr	x8, [x8, #0x8]
   40ed0:	e0 03 14 aa	mov	x0, x20
   40ed4:	00 01 3f d6	blr	x8
   40ed8:	60 22 40 f9	ldr	x0, [x19, #0x40]
   40edc:	1b 01 00 14	b	0x41348
   40ee0:	88 1e 18 12	and	w8, w20, #0xff00
   40ee4:	1f 01 04 71	cmp	w8, #0x100
   40ee8:	7a 2a 00 f9	str	x26, [x19, #0x50]
   40eec:	00 00 80 d2	mov	x0, #0x0
   40ef0:	a1 1f 00 54	b.ne	0x412e4
   40ef4:	5c 4d 13 94	bl	0x514464 ; symbol stub for: _$s9CryptoKit4P256O7SigningO10PrivateKeyVMa
   40ef8:	e8 03 00 91	mov	x8, sp
   40efc:	60 22 03 a9	stp	x0, x8, [x19, #0x30]
   40f00:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   40f04:	68 16 00 f9	str	x8, [x19, #0x28]
   40f08:	08 21 40 f9	ldr	x8, [x8, #0x40]
   40f0c:	e9 03 08 aa	mov	x9, x8
   40f10:	30 37 00 90	adrp	x16, 1764 ; 0x724000
   40f14:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   40f18:	00 02 3f d6	blr	x16
   40f1c:	e9 03 00 91	mov	x9, sp
   40f20:	08 3d 00 91	add	x8, x8, #0xf
   40f24:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   40f28:	34 01 08 cb	sub	x20, x9, x8
   40f2c:	9f 02 00 91	mov	sp, x20
   40f30:	b9 6f 30 a9	stp	x25, x27, [x29, #-0x100]
   40f34:	e0 03 19 aa	mov	x0, x25
   40f38:	e1 03 1b aa	mov	x1, x27
   40f3c:	a4 32 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   40f40:	21 37 00 90	adrp	x1, 1764 ; 0x724000
   40f44:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   40f48:	22 37 00 90	adrp	x2, 1764 ; 0x724000
   40f4c:	42 14 40 f9	ldr	x2, [x2, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   40f50:	a0 03 04 d1	sub	x0, x29, #0x100
   40f54:	e8 03 14 aa	mov	x8, x20
   40f58:	3a 4d 13 94	bl	0x514440 ; symbol stub for: _$s9CryptoKit4P256O7SigningO10PrivateKeyV17rawRepresentationAGx_tKc10Foundation15ContiguousBytesRzlufC
   40f5c:	55 1f 00 b5	cbnz	x21, 0x41344
   40f60:	00 00 80 d2	mov	x0, #0x0
   40f64:	46 4d 13 94	bl	0x51447c ; symbol stub for: _$s9CryptoKit4P256O7SigningO14ECDSASignatureVMa
   40f68:	e8 03 00 91	mov	x8, sp
   40f6c:	60 22 01 a9	stp	x0, x8, [x19, #0x10]
   40f70:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   40f74:	68 06 00 f9	str	x8, [x19, #0x8]
   40f78:	08 21 40 f9	ldr	x8, [x8, #0x40]
   40f7c:	e9 03 08 aa	mov	x9, x8
   40f80:	30 37 00 90	adrp	x16, 1764 ; 0x724000
   40f84:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   40f88:	00 02 3f d6	blr	x16
   40f8c:	e9 03 00 91	mov	x9, sp
   40f90:	08 3d 00 91	add	x8, x8, #0xf
   40f94:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   40f98:	28 01 08 cb	sub	x8, x9, x8
   40f9c:	68 12 00 f9	str	x8, [x19, #0x20]
   40fa0:	1f 01 00 91	mov	sp, x8
   40fa4:	b7 6b 30 a9	stp	x23, x26, [x29, #-0x100]
   40fa8:	23 36 00 94	bl	_$s10Foundation4DataVAcA0B8ProtocolAAWl
   40fac:	e2 03 00 aa	mov	x2, x0
   40fb0:	21 37 00 90	adrp	x1, 1764 ; 0x724000
   40fb4:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   40fb8:	a0 03 04 d1	sub	x0, x29, #0x100
   40fbc:	68 12 40 f9	ldr	x8, [x19, #0x20]
   40fc0:	26 4d 13 94	bl	0x514458 ; symbol stub for: _$s9CryptoKit4P256O7SigningO10PrivateKeyV9signature3forAE14ECDSASignatureVx_tK10Foundation12DataProtocolRzlF
   40fc4:	95 23 00 b5	cbnz	x21, 0x41434
   40fc8:	74 02 00 f9	str	x20, [x19]
   40fcc:	79 6e 04 a9	stp	x25, x27, [x19, #0x40]
   40fd0:	00 38 00 b0	adrp	x0, 1793 ; 0x741000
   40fd4:	00 c0 12 91	add	x0, x0, #0x4b0
   40fd8:	41 27 00 d0	adrp	x1, 1258 ; 0x52a000
   40fdc:	21 a0 1c 91	add	x1, x1, #0x728
   40fe0:	33 8d ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   40fe4:	01 0a 80 52	mov	w1, #0x50
   40fe8:	e2 00 80 52	mov	w2, #0x7
   40fec:	70 52 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   40ff0:	f5 03 00 aa	mov	x21, x0
   40ff4:	48 27 00 d0	adrp	x8, 1258 ; 0x52a000
   40ff8:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   40ffc:	00 04 80 3d	str	q0, [x0, #0x10]
   41000:	68 2e 8d d2	mov	x8, #0x6973
   41004:	e8 cc ad f2	movk	x8, #0x6e67, lsl #16
   41008:	28 8c ce f2	movk	x8, #0x7461, lsl #32
   4100c:	a8 4e ee f2	movk	x8, #0x7275, lsl #48
   41010:	fa 03 00 aa	mov	x26, x0
   41014:	48 0f 02 f8	str	x8, [x26, #0x20]!
   41018:	a8 0c 80 d2	mov	x8, #0x65
   4101c:	08 20 fd f2	movk	x8, #0xe900, lsl #48
   41020:	08 14 00 f9	str	x8, [x0, #0x28]
   41024:	74 12 40 f9	ldr	x20, [x19, #0x20]
   41028:	12 4d 13 94	bl	0x514470 ; symbol stub for: _$s9CryptoKit4P256O7SigningO14ECDSASignatureV17derRepresentation10Foundation4DataVvg
   4102c:	f4 03 00 aa	mov	x20, x0
   41030:	f9 03 01 aa	mov	x25, x1
   41034:	00 00 80 d2	mov	x0, #0x0
   41038:	e1 03 14 aa	mov	x1, x20
   4103c:	e2 03 19 aa	mov	x2, x25
   41040:	46 4c 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   41044:	fb 03 00 aa	mov	x27, x0
   41048:	f7 03 01 aa	mov	x23, x1
   4104c:	e0 03 14 aa	mov	x0, x20
   41050:	e1 03 19 aa	mov	x1, x25
   41054:	91 31 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   41058:	14 37 00 f0	adrp	x20, 1763 ; 0x724000
   4105c:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   41060:	b4 26 00 f9	str	x20, [x21, #0x48]
   41064:	bb 5e 03 a9	stp	x27, x23, [x21, #0x30]
   41068:	e0 03 15 aa	mov	x0, x21
   4106c:	aa 31 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   41070:	f9 03 00 aa	mov	x25, x0
   41074:	e0 03 15 aa	mov	x0, x21
   41078:	98 52 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   4107c:	01 38 00 90	adrp	x1, 1792 ; 0x741000
   41080:	21 e0 12 91	add	x1, x1, #0x4b8
   41084:	42 27 00 b0	adrp	x2, 1257 ; 0x52a000
   41088:	42 c0 1c 91	add	x2, x2, #0x730
   4108c:	e0 03 1a aa	mov	x0, x26
   41090:	60 3a 00 94	bl	_$sypSgWOhTm
   41094:	e0 03 15 aa	mov	x0, x21
   41098:	01 04 80 52	mov	w1, #0x20
   4109c:	e2 00 80 52	mov	w2, #0x7
   410a0:	5b 52 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   410a4:	03 37 00 f0	adrp	x3, 1763 ; 0x724000
   410a8:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   410ac:	08 37 00 f0	adrp	x8, 1763 ; 0x724000
   410b0:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   410b4:	02 21 00 91	add	x2, x8, #0x8
   410b8:	e0 03 19 aa	mov	x0, x25
   410bc:	e1 03 14 aa	mov	x1, x20
   410c0:	0a 4d 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   410c4:	f5 03 00 aa	mov	x21, x0
   410c8:	bf 03 10 f8	stur	xzr, [x29, #-0x100]
   410cc:	a4 03 04 d1	sub	x4, x29, #0x100
   410d0:	e0 03 1c aa	mov	x0, x28
   410d4:	e2 03 15 aa	mov	x2, x21
   410d8:	03 00 80 d2	mov	x3, #0x0
   410dc:	f1 58 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   410e0:	fd 03 1d aa	mov	x29, x29
   410e4:	81 01 00 14	b	0x416e8
   410e8:	f4 03 00 aa	mov	x20, x0
   410ec:	e2 4b 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   410f0:	f8 03 00 aa	mov	x24, x0
   410f4:	e0 03 14 aa	mov	x0, x20
   410f8:	9a 51 13 94	bl	0x515760 ; symbol stub for: _objc_release
   410fc:	f5 03 18 aa	mov	x21, x24
   41100:	7f 52 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   41104:	e0 03 18 aa	mov	x0, x24
   41108:	4a 52 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   4110c:	77 2e 40 f9	ldr	x23, [x19, #0x58]
   41110:	c8 26 00 90	adrp	x8, 1240 ; 0x519000
   41114:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   41118:	08 81 00 d1	sub	x8, x8, #0x20
   4111c:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   41120:	75 26 40 f9	ldr	x21, [x19, #0x48]
   41124:	60 32 40 f9	ldr	x0, [x19, #0x60]
   41128:	e1 03 16 aa	mov	x1, x22
   4112c:	4f 3a 00 94	bl	0x4fa68
   41130:	e0 03 17 aa	mov	x0, x23
   41134:	e1 03 1a aa	mov	x1, x26
   41138:	4c 3a 00 94	bl	0x4fa68
   4113c:	e0 03 15 aa	mov	x0, x21
   41140:	27 52 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   41144:	a0 63 03 d1	sub	x0, x29, #0xd8
   41148:	cb 35 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   4114c:	38 fd ff 17	b	0x4062c
   41150:	7b 26 00 f9	str	x27, [x19, #0x48]
   41154:	bb 04 80 d2	mov	x27, #0x25
   41158:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   4115c:	c8 26 00 90	adrp	x8, 1240 ; 0x519000
   41160:	08 c1 35 91	add	x8, x8, #0xd70 ; literal pool for: "pq_v1 installation requires macOS 26 or newer"
   41164:	08 81 00 d1	sub	x8, x8, #0x20
   41168:	17 01 41 b2	orr	x23, x8, #0x8000000000000000
   4116c:	00 38 00 90	adrp	x0, 1792 ; 0x741000
   41170:	00 c0 12 91	add	x0, x0, #0x4b0
   41174:	41 27 00 b0	adrp	x1, 1257 ; 0x52a000
   41178:	21 a0 1c 91	add	x1, x1, #0x728
   4117c:	cc 8c ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   41180:	61 02 05 91	add	x1, x19, #0x140
   41184:	40 52 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   41188:	f4 03 00 aa	mov	x20, x0
   4118c:	48 27 00 b0	adrp	x8, 1257 ; 0x52a000
   41190:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   41194:	00 04 80 3d	str	q0, [x0, #0x10]
   41198:	a8 4c 8e d2	mov	x8, #0x7265
   4119c:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   411a0:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   411a4:	f5 03 00 aa	mov	x21, x0
   411a8:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   411ac:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   411b0:	09 37 00 f0	adrp	x9, 1763 ; 0x724000
   411b4:	29 25 41 f9	ldr	x9, [x9, #0x248] ; literal pool symbol address: _$sSSN
   411b8:	09 24 00 f9	str	x9, [x0, #0x48]
   411bc:	69 03 7d b2	orr	x9, x27, #0x8
   411c0:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   411c4:	17 1c 00 f9	str	x23, [x0, #0x38]
   411c8:	53 31 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   411cc:	f7 03 00 aa	mov	x23, x0
   411d0:	e0 03 14 aa	mov	x0, x20
   411d4:	41 52 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   411d8:	01 38 00 90	adrp	x1, 1792 ; 0x741000
   411dc:	21 e0 12 91	add	x1, x1, #0x4b8
   411e0:	42 27 00 b0	adrp	x2, 1257 ; 0x52a000
   411e4:	42 c0 1c 91	add	x2, x2, #0x730
   411e8:	e0 03 15 aa	mov	x0, x21
   411ec:	09 3a 00 94	bl	_$sypSgWOhTm
   411f0:	03 37 00 f0	adrp	x3, 1763 ; 0x724000
   411f4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   411f8:	08 37 00 f0	adrp	x8, 1763 ; 0x724000
   411fc:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   41200:	02 21 00 91	add	x2, x8, #0x8
   41204:	77 1e 00 f9	str	x23, [x19, #0x38]
   41208:	e0 03 17 aa	mov	x0, x23
   4120c:	01 37 00 f0	adrp	x1, 1763 ; 0x724000
   41210:	21 24 41 f9	ldr	x1, [x1, #0x248] ; literal pool symbol address: _$sSSN
   41214:	b5 4c 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   41218:	f5 03 00 aa	mov	x21, x0
   4121c:	bf 03 10 f8	stur	xzr, [x29, #-0x100]
   41220:	a4 03 04 d1	sub	x4, x29, #0x100
   41224:	e0 03 1c aa	mov	x0, x28
   41228:	e2 03 15 aa	mov	x2, x21
   4122c:	03 00 80 d2	mov	x3, #0x0
   41230:	9c 58 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   41234:	fd 03 1d aa	mov	x29, x29
   41238:	50 51 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   4123c:	f4 03 00 aa	mov	x20, x0
   41240:	e0 03 15 aa	mov	x0, x21
   41244:	47 51 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41248:	a0 03 50 f8	ldur	x0, [x29, #-0x100]
   4124c:	48 51 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   41250:	94 08 00 b4	cbz	x20, 0x41360
   41254:	e0 03 14 aa	mov	x0, x20
   41258:	c3 4b 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   4125c:	79 22 00 f9	str	x25, [x19, #0x40]
   41260:	f9 03 1a aa	mov	x25, x26
   41264:	fa 03 00 aa	mov	x26, x0
   41268:	fc 03 01 aa	mov	x28, x1
   4126c:	e0 03 14 aa	mov	x0, x20
   41270:	3c 51 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41274:	f7 03 00 91	mov	x23, sp
   41278:	e9 03 18 aa	mov	x9, x24
   4127c:	10 37 00 f0	adrp	x16, 1763 ; 0x724000
   41280:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   41284:	00 02 3f d6	blr	x16
   41288:	e8 03 00 91	mov	x8, sp
   4128c:	09 3f 00 91	add	x9, x24, #0xf
   41290:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   41294:	14 01 09 cb	sub	x20, x8, x9
   41298:	9f 02 00 91	mov	sp, x20
   4129c:	e8 03 14 aa	mov	x8, x20
   412a0:	a7 4c 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   412a4:	e0 03 1a aa	mov	x0, x26
   412a8:	e1 03 1c aa	mov	x1, x28
   412ac:	e2 03 14 aa	mov	x2, x20
   412b0:	a0 4c 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   412b4:	f5 03 00 aa	mov	x21, x0
   412b8:	f4 03 01 aa	mov	x20, x1
   412bc:	e0 03 1a aa	mov	x0, x26
   412c0:	fa 03 19 aa	mov	x26, x25
   412c4:	79 22 40 f9	ldr	x25, [x19, #0x40]
   412c8:	e1 03 1c aa	mov	x1, x28
   412cc:	f3 30 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   412d0:	ff 02 00 91	mov	sp, x23
   412d4:	77 2e 40 f9	ldr	x23, [x19, #0x58]
   412d8:	94 05 00 b4	cbz	x20, 0x41388
   412dc:	fb 03 15 aa	mov	x27, x21
   412e0:	2e 00 00 14	b	0x41398
   412e4:	00 4c 13 94	bl	0x5142e4 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O7SigningO10PrivateKeyVMa
   412e8:	e8 03 00 91	mov	x8, sp
   412ec:	60 22 03 a9	stp	x0, x8, [x19, #0x30]
   412f0:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   412f4:	68 16 00 f9	str	x8, [x19, #0x28]
   412f8:	08 21 40 f9	ldr	x8, [x8, #0x40]
   412fc:	e9 03 08 aa	mov	x9, x8
   41300:	10 37 00 f0	adrp	x16, 1763 ; 0x724000
   41304:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   41308:	00 02 3f d6	blr	x16
   4130c:	e9 03 00 91	mov	x9, sp
   41310:	08 3d 00 91	add	x8, x8, #0xf
   41314:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   41318:	34 01 08 cb	sub	x20, x9, x8
   4131c:	9f 02 00 91	mov	sp, x20
   41320:	e0 03 19 aa	mov	x0, x25
   41324:	e1 03 1b aa	mov	x1, x27
   41328:	a9 31 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   4132c:	e8 03 14 aa	mov	x8, x20
   41330:	e0 03 19 aa	mov	x0, x25
   41334:	e1 03 1b aa	mov	x1, x27
   41338:	02 00 80 d2	mov	x2, #0x0
   4133c:	e1 4b 13 94	bl	0x5142c0 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O7SigningO10PrivateKeyV18dataRepresentation21authenticationContextAI10Foundation4DataV_So9LAContextCSgtKcfC
   41340:	75 04 00 b4	cbz	x21, 0x413cc
   41344:	e0 03 19 aa	mov	x0, x25
   41348:	e1 03 1b aa	mov	x1, x27
   4134c:	c7 39 00 94	bl	0x4fa68
   41350:	68 1e 40 f9	ldr	x8, [x19, #0x38]
   41354:	1f 01 00 91	mov	sp, x8
   41358:	ad fd ff 17	b	0x40a0c
   4135c:	20 00 20 d4	brk	#0x1
   41360:	f4 03 00 aa	mov	x20, x0
   41364:	44 4b 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   41368:	f8 03 00 aa	mov	x24, x0
   4136c:	e0 03 14 aa	mov	x0, x20
   41370:	fc 50 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41374:	f5 03 18 aa	mov	x21, x24
   41378:	e1 51 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   4137c:	e0 03 18 aa	mov	x0, x24
   41380:	ac 51 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   41384:	77 2e 40 f9	ldr	x23, [x19, #0x58]
   41388:	c8 26 00 90	adrp	x8, 1240 ; 0x519000
   4138c:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   41390:	08 81 00 d1	sub	x8, x8, #0x20
   41394:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   41398:	75 1e 40 f9	ldr	x21, [x19, #0x38]
   4139c:	60 32 40 f9	ldr	x0, [x19, #0x60]
   413a0:	e1 03 16 aa	mov	x1, x22
   413a4:	b1 39 00 94	bl	0x4fa68
   413a8:	e0 03 17 aa	mov	x0, x23
   413ac:	e1 03 1a aa	mov	x1, x26
   413b0:	ae 39 00 94	bl	0x4fa68
   413b4:	e0 03 15 aa	mov	x0, x21
   413b8:	89 51 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   413bc:	e0 03 19 aa	mov	x0, x25
   413c0:	61 26 40 f9	ldr	x1, [x19, #0x48]
   413c4:	a9 39 00 94	bl	0x4fa68
   413c8:	5f ff ff 17	b	0x41144
   413cc:	00 00 80 d2	mov	x0, #0x0
   413d0:	2b 4c 13 94	bl	0x51447c ; symbol stub for: _$s9CryptoKit4P256O7SigningO14ECDSASignatureVMa
   413d4:	e8 03 00 91	mov	x8, sp
   413d8:	60 22 01 a9	stp	x0, x8, [x19, #0x10]
   413dc:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   413e0:	68 06 00 f9	str	x8, [x19, #0x8]
   413e4:	08 21 40 f9	ldr	x8, [x8, #0x40]
   413e8:	e9 03 08 aa	mov	x9, x8
   413ec:	10 37 00 f0	adrp	x16, 1763 ; 0x724000
   413f0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   413f4:	00 02 3f d6	blr	x16
   413f8:	e9 03 00 91	mov	x9, sp
   413fc:	08 3d 00 91	add	x8, x8, #0xf
   41400:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   41404:	28 01 08 cb	sub	x8, x9, x8
   41408:	68 12 00 f9	str	x8, [x19, #0x20]
   4140c:	1f 01 00 91	mov	sp, x8
   41410:	b7 6b 30 a9	stp	x23, x26, [x29, #-0x100]
   41414:	08 35 00 94	bl	_$s10Foundation4DataVAcA0B8ProtocolAAWl
   41418:	e2 03 00 aa	mov	x2, x0
   4141c:	01 37 00 f0	adrp	x1, 1763 ; 0x724000
   41420:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   41424:	a0 03 04 d1	sub	x0, x29, #0x100
   41428:	68 12 40 f9	ldr	x8, [x19, #0x20]
   4142c:	ab 4b 13 94	bl	0x5142d8 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O7SigningO10PrivateKeyV9signature3forAaDOAFO14ECDSASignatureVx_tK10Foundation12DataProtocolRzlF
   41430:	95 0d 00 b4	cbz	x21, 0x415e0
   41434:	68 86 42 a9	ldp	x8, x1, [x19, #0x28]
   41438:	08 05 40 f9	ldr	x8, [x8, #0x8]
   4143c:	e0 03 14 aa	mov	x0, x20
   41440:	00 01 3f d6	blr	x8
   41444:	e0 03 19 aa	mov	x0, x25
   41448:	e1 03 1b aa	mov	x1, x27
   4144c:	87 39 00 94	bl	0x4fa68
   41450:	68 0e 40 f9	ldr	x8, [x19, #0x18]
   41454:	1f 01 00 91	mov	sp, x8
   41458:	be ff ff 17	b	0x41350
   4145c:	fa 03 00 aa	mov	x26, x0
   41460:	f9 03 01 aa	mov	x25, x1
   41464:	74 12 00 f9	str	x20, [x19, #0x20]
   41468:	7b 26 00 f9	str	x27, [x19, #0x48]
   4146c:	00 38 00 90	adrp	x0, 1792 ; 0x741000
   41470:	00 c0 12 91	add	x0, x0, #0x4b0
   41474:	41 27 00 b0	adrp	x1, 1257 ; 0x52a000
   41478:	21 a0 1c 91	add	x1, x1, #0x728
   4147c:	0c 8c ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   41480:	61 c2 03 91	add	x1, x19, #0xf0
   41484:	80 51 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   41488:	f4 03 00 aa	mov	x20, x0
   4148c:	48 27 00 b0	adrp	x8, 1257 ; 0x52a000
   41490:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   41494:	00 04 80 3d	str	q0, [x0, #0x10]
   41498:	68 2e 8d d2	mov	x8, #0x6973
   4149c:	e8 cc ad f2	movk	x8, #0x6e67, lsl #16
   414a0:	28 8c ce f2	movk	x8, #0x7461, lsl #32
   414a4:	a8 4e ee f2	movk	x8, #0x7275, lsl #48
   414a8:	f5 03 00 aa	mov	x21, x0
   414ac:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   414b0:	a8 0c 80 d2	mov	x8, #0x65
   414b4:	08 20 fd f2	movk	x8, #0xe900, lsl #48
   414b8:	08 14 00 f9	str	x8, [x0, #0x28]
   414bc:	00 00 80 d2	mov	x0, #0x0
   414c0:	e1 03 1a aa	mov	x1, x26
   414c4:	79 0e 00 f9	str	x25, [x19, #0x18]
   414c8:	e2 03 19 aa	mov	x2, x25
   414cc:	23 4b 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   414d0:	17 37 00 f0	adrp	x23, 1763 ; 0x724000
   414d4:	f7 26 41 f9	ldr	x23, [x23, #0x248] ; literal pool symbol address: _$sSSN
   414d8:	97 26 00 f9	str	x23, [x20, #0x48]
   414dc:	80 06 03 a9	stp	x0, x1, [x20, #0x30]
   414e0:	e0 03 14 aa	mov	x0, x20
   414e4:	8c 30 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   414e8:	f9 03 00 aa	mov	x25, x0
   414ec:	e0 03 14 aa	mov	x0, x20
   414f0:	7a 51 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   414f4:	01 38 00 90	adrp	x1, 1792 ; 0x741000
   414f8:	21 e0 12 91	add	x1, x1, #0x4b8
   414fc:	42 27 00 b0	adrp	x2, 1257 ; 0x52a000
   41500:	42 c0 1c 91	add	x2, x2, #0x730
   41504:	e0 03 15 aa	mov	x0, x21
   41508:	42 39 00 94	bl	_$sypSgWOhTm
   4150c:	03 37 00 f0	adrp	x3, 1763 ; 0x724000
   41510:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   41514:	08 37 00 f0	adrp	x8, 1763 ; 0x724000
   41518:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   4151c:	02 21 00 91	add	x2, x8, #0x8
   41520:	e0 03 19 aa	mov	x0, x25
   41524:	e1 03 17 aa	mov	x1, x23
   41528:	f0 4b 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   4152c:	f5 03 00 aa	mov	x21, x0
   41530:	bf 03 10 f8	stur	xzr, [x29, #-0x100]
   41534:	a4 03 04 d1	sub	x4, x29, #0x100
   41538:	e0 03 1c aa	mov	x0, x28
   4153c:	e2 03 15 aa	mov	x2, x21
   41540:	03 00 80 d2	mov	x3, #0x0
   41544:	d7 57 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   41548:	fd 03 1d aa	mov	x29, x29
   4154c:	8b 50 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   41550:	f4 03 00 aa	mov	x20, x0
   41554:	e0 03 15 aa	mov	x0, x21
   41558:	82 50 13 94	bl	0x515760 ; symbol stub for: _objc_release
   4155c:	a0 03 50 f8	ldur	x0, [x29, #-0x100]
   41560:	83 50 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   41564:	74 15 00 b4	cbz	x20, 0x41810
   41568:	e0 03 14 aa	mov	x0, x20
   4156c:	fe 4a 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   41570:	f5 03 00 aa	mov	x21, x0
   41574:	fc 03 01 aa	mov	x28, x1
   41578:	e0 03 14 aa	mov	x0, x20
   4157c:	79 50 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41580:	f7 03 00 91	mov	x23, sp
   41584:	e9 03 18 aa	mov	x9, x24
   41588:	10 37 00 f0	adrp	x16, 1763 ; 0x724000
   4158c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   41590:	00 02 3f d6	blr	x16
   41594:	e8 03 00 91	mov	x8, sp
   41598:	09 3f 00 91	add	x9, x24, #0xf
   4159c:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   415a0:	14 01 09 cb	sub	x20, x8, x9
   415a4:	9f 02 00 91	mov	sp, x20
   415a8:	e8 03 14 aa	mov	x8, x20
   415ac:	e4 4b 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   415b0:	e0 03 15 aa	mov	x0, x21
   415b4:	e1 03 1c aa	mov	x1, x28
   415b8:	e2 03 14 aa	mov	x2, x20
   415bc:	dd 4b 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   415c0:	fb 03 00 aa	mov	x27, x0
   415c4:	f4 03 01 aa	mov	x20, x1
   415c8:	e0 03 15 aa	mov	x0, x21
   415cc:	e1 03 1c aa	mov	x1, x28
   415d0:	32 30 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   415d4:	ff 02 00 91	mov	sp, x23
   415d8:	b4 13 00 b5	cbnz	x20, 0x4184c
   415dc:	96 00 00 14	b	0x41834
   415e0:	74 02 00 f9	str	x20, [x19]
   415e4:	79 6e 04 a9	stp	x25, x27, [x19, #0x40]
   415e8:	00 38 00 90	adrp	x0, 1792 ; 0x741000
   415ec:	00 c0 12 91	add	x0, x0, #0x4b0
   415f0:	41 27 00 b0	adrp	x1, 1257 ; 0x52a000
   415f4:	21 a0 1c 91	add	x1, x1, #0x728
   415f8:	ad 8b ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   415fc:	61 82 02 91	add	x1, x19, #0xa0
   41600:	21 51 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   41604:	f5 03 00 aa	mov	x21, x0
   41608:	48 27 00 b0	adrp	x8, 1257 ; 0x52a000
   4160c:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   41610:	00 04 80 3d	str	q0, [x0, #0x10]
   41614:	68 2e 8d d2	mov	x8, #0x6973
   41618:	e8 cc ad f2	movk	x8, #0x6e67, lsl #16
   4161c:	28 8c ce f2	movk	x8, #0x7461, lsl #32
   41620:	a8 4e ee f2	movk	x8, #0x7275, lsl #48
   41624:	fa 03 00 aa	mov	x26, x0
   41628:	48 0f 02 f8	str	x8, [x26, #0x20]!
   4162c:	a8 0c 80 d2	mov	x8, #0x65
   41630:	08 20 fd f2	movk	x8, #0xe900, lsl #48
   41634:	08 14 00 f9	str	x8, [x0, #0x28]
   41638:	74 12 40 f9	ldr	x20, [x19, #0x20]
   4163c:	8d 4b 13 94	bl	0x514470 ; symbol stub for: _$s9CryptoKit4P256O7SigningO14ECDSASignatureV17derRepresentation10Foundation4DataVvg
   41640:	f4 03 00 aa	mov	x20, x0
   41644:	f9 03 01 aa	mov	x25, x1
   41648:	00 00 80 d2	mov	x0, #0x0
   4164c:	e1 03 14 aa	mov	x1, x20
   41650:	e2 03 19 aa	mov	x2, x25
   41654:	c1 4a 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   41658:	fb 03 00 aa	mov	x27, x0
   4165c:	f7 03 01 aa	mov	x23, x1
   41660:	e0 03 14 aa	mov	x0, x20
   41664:	e1 03 19 aa	mov	x1, x25
   41668:	0c 30 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   4166c:	14 37 00 f0	adrp	x20, 1763 ; 0x724000
   41670:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   41674:	b4 26 00 f9	str	x20, [x21, #0x48]
   41678:	bb 5e 03 a9	stp	x27, x23, [x21, #0x30]
   4167c:	e0 03 15 aa	mov	x0, x21
   41680:	25 30 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   41684:	f9 03 00 aa	mov	x25, x0
   41688:	e0 03 15 aa	mov	x0, x21
   4168c:	13 51 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   41690:	01 38 00 90	adrp	x1, 1792 ; 0x741000
   41694:	21 e0 12 91	add	x1, x1, #0x4b8
   41698:	42 27 00 b0	adrp	x2, 1257 ; 0x52a000
   4169c:	42 c0 1c 91	add	x2, x2, #0x730
   416a0:	e0 03 1a aa	mov	x0, x26
   416a4:	db 38 00 94	bl	_$sypSgWOhTm
   416a8:	03 37 00 f0	adrp	x3, 1763 ; 0x724000
   416ac:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   416b0:	08 37 00 f0	adrp	x8, 1763 ; 0x724000
   416b4:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   416b8:	02 21 00 91	add	x2, x8, #0x8
   416bc:	e0 03 19 aa	mov	x0, x25
   416c0:	e1 03 14 aa	mov	x1, x20
   416c4:	89 4b 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   416c8:	f5 03 00 aa	mov	x21, x0
   416cc:	bf 03 10 f8	stur	xzr, [x29, #-0x100]
   416d0:	a4 03 04 d1	sub	x4, x29, #0x100
   416d4:	e0 03 1c aa	mov	x0, x28
   416d8:	e2 03 15 aa	mov	x2, x21
   416dc:	03 00 80 d2	mov	x3, #0x0
   416e0:	70 57 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   416e4:	fd 03 1d aa	mov	x29, x29
   416e8:	24 50 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   416ec:	f4 03 00 aa	mov	x20, x0
   416f0:	e0 03 15 aa	mov	x0, x21
   416f4:	1b 50 13 94	bl	0x515760 ; symbol stub for: _objc_release
   416f8:	a0 03 50 f8	ldur	x0, [x29, #-0x100]
   416fc:	1c 50 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   41700:	f4 03 00 b4	cbz	x20, 0x4177c
   41704:	e0 03 14 aa	mov	x0, x20
   41708:	97 4a 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   4170c:	f5 03 00 aa	mov	x21, x0
   41710:	fa 03 01 aa	mov	x26, x1
   41714:	e0 03 14 aa	mov	x0, x20
   41718:	12 50 13 94	bl	0x515760 ; symbol stub for: _objc_release
   4171c:	f7 03 00 91	mov	x23, sp
   41720:	e9 03 18 aa	mov	x9, x24
   41724:	10 37 00 f0	adrp	x16, 1763 ; 0x724000
   41728:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   4172c:	00 02 3f d6	blr	x16
   41730:	e8 03 00 91	mov	x8, sp
   41734:	09 3f 00 91	add	x9, x24, #0xf
   41738:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   4173c:	14 01 09 cb	sub	x20, x8, x9
   41740:	9f 02 00 91	mov	sp, x20
   41744:	e8 03 14 aa	mov	x8, x20
   41748:	7d 4b 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   4174c:	e0 03 15 aa	mov	x0, x21
   41750:	e1 03 1a aa	mov	x1, x26
   41754:	e2 03 14 aa	mov	x2, x20
   41758:	76 4b 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   4175c:	fb 03 00 aa	mov	x27, x0
   41760:	f4 03 01 aa	mov	x20, x1
   41764:	e0 03 15 aa	mov	x0, x21
   41768:	e1 03 1a aa	mov	x1, x26
   4176c:	cb 2f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   41770:	ff 02 00 91	mov	sp, x23
   41774:	34 02 00 b5	cbnz	x20, 0x417b8
   41778:	0a 00 00 14	b	0x417a0
   4177c:	f5 03 00 aa	mov	x21, x0
   41780:	3d 4a 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   41784:	f4 03 00 aa	mov	x20, x0
   41788:	e0 03 15 aa	mov	x0, x21
   4178c:	f5 4f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41790:	f5 03 14 aa	mov	x21, x20
   41794:	da 50 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   41798:	e0 03 14 aa	mov	x0, x20
   4179c:	a5 50 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   417a0:	bb 04 80 d2	mov	x27, #0x25
   417a4:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   417a8:	c8 26 00 90	adrp	x8, 1240 ; 0x519000
   417ac:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   417b0:	08 81 00 d1	sub	x8, x8, #0x20
   417b4:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   417b8:	60 32 40 f9	ldr	x0, [x19, #0x60]
   417bc:	e1 03 16 aa	mov	x1, x22
   417c0:	aa 38 00 94	bl	0x4fa68
   417c4:	61 02 45 a9	ldp	x1, x0, [x19, #0x50]
   417c8:	a8 38 00 94	bl	0x4fa68
   417cc:	e0 03 19 aa	mov	x0, x25
   417d0:	83 50 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   417d4:	60 06 44 a9	ldp	x0, x1, [x19, #0x40]
   417d8:	a4 38 00 94	bl	0x4fa68
   417dc:	68 86 40 a9	ldp	x8, x1, [x19, #0x8]
   417e0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   417e4:	60 12 40 f9	ldr	x0, [x19, #0x20]
   417e8:	00 01 3f d6	blr	x8
   417ec:	68 86 42 a9	ldp	x8, x1, [x19, #0x28]
   417f0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   417f4:	60 02 40 f9	ldr	x0, [x19]
   417f8:	00 01 3f d6	blr	x8
   417fc:	a0 63 03 d1	sub	x0, x29, #0xd8
   41800:	1d 34 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   41804:	68 0e 40 f9	ldr	x8, [x19, #0x18]
   41808:	1f 01 00 91	mov	sp, x8
   4180c:	22 00 00 14	b	0x41894
   41810:	f5 03 00 aa	mov	x21, x0
   41814:	18 4a 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   41818:	f4 03 00 aa	mov	x20, x0
   4181c:	e0 03 15 aa	mov	x0, x21
   41820:	d0 4f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41824:	f5 03 14 aa	mov	x21, x20
   41828:	b5 50 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   4182c:	e0 03 14 aa	mov	x0, x20
   41830:	80 50 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   41834:	bb 04 80 d2	mov	x27, #0x25
   41838:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   4183c:	c8 26 00 90	adrp	x8, 1240 ; 0x519000
   41840:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   41844:	08 81 00 d1	sub	x8, x8, #0x20
   41848:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   4184c:	60 32 40 f9	ldr	x0, [x19, #0x60]
   41850:	e1 03 16 aa	mov	x1, x22
   41854:	85 38 00 94	bl	0x4fa68
   41858:	61 02 45 a9	ldp	x1, x0, [x19, #0x50]
   4185c:	83 38 00 94	bl	0x4fa68
   41860:	e0 03 1a aa	mov	x0, x26
   41864:	61 0e 40 f9	ldr	x1, [x19, #0x18]
   41868:	8c 2f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   4186c:	e0 03 19 aa	mov	x0, x25
   41870:	5b 50 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   41874:	60 06 44 a9	ldp	x0, x1, [x19, #0x40]
   41878:	7c 38 00 94	bl	0x4fa68
   4187c:	60 22 42 a9	ldp	x0, x8, [x19, #0x20]
   41880:	08 05 40 f9	ldr	x8, [x8, #0x8]
   41884:	61 1a 40 f9	ldr	x1, [x19, #0x30]
   41888:	00 01 3f d6	blr	x8
   4188c:	a0 63 03 d1	sub	x0, x29, #0xd8
   41890:	f9 33 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   41894:	68 1e 40 f9	ldr	x8, [x19, #0x38]
   41898:	1f 01 00 91	mov	sp, x8
   4189c:	64 fb ff 17	b	0x4062c
   418a0:	20 38 00 90	adrp	x0, 1796 ; 0x745000
   418a4:	00 c0 07 91	add	x0, x0, #0x1f0
   418a8:	61 ff ff f0	adrp	x1, -17 ; 0x30000
   418ac:	21 90 21 91	add	x1, x1, #0x864
   418b0:	7e 50 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   418b4:	d3 fc ff 17	b	0x40c00
   418b8:	93 4e 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
