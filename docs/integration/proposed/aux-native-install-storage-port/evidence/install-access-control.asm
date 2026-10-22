/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift26createInstallAccessControlSo03SecfG3RefayKF:
   33614:	ff 03 03 d1	sub	sp, sp, #0xc0
   33618:	fa 3b 00 f9	str	x26, [sp, #0x70]
   3361c:	f9 63 08 a9	stp	x25, x24, [sp, #0x80]
   33620:	f7 5b 09 a9	stp	x23, x22, [sp, #0x90]
   33624:	f4 4f 0a a9	stp	x20, x19, [sp, #0xa0]
   33628:	fd 7b 0b a9	stp	x29, x30, [sp, #0xb0]
   3362c:	fd c3 02 91	add	x29, sp, #0xb0
   33630:	f3 03 15 aa	mov	x19, x21
   33634:	88 37 00 b0	adrp	x8, 1777 ; 0x724000
   33638:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   3363c:	08 01 40 f9	ldr	x8, [x8]
   33640:	a8 83 1b f8	stur	x8, [x29, #-0x48]
   33644:	bf 03 1b f8	stur	xzr, [x29, #-0x50]
   33648:	88 37 00 b0	adrp	x8, 1777 ; 0x724000
   3364c:	08 41 40 f9	ldr	x8, [x8, #0x80] ; literal pool symbol address: _kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
   33650:	01 01 40 f9	ldr	x1, [x8]
   33654:	a3 43 01 d1	sub	x3, x29, #0x50
   33658:	00 00 80 d2	mov	x0, #0x0
   3365c:	02 00 a8 52	mov	w2, #0x40000000
   33660:	c2 84 13 94	bl	0x514968 ; symbol stub for: _SecAccessControlCreateWithFlags
   33664:	80 0c 00 b5	cbnz	x0, 0x337f4
   33668:	f9 03 00 aa	mov	x25, x0
   3366c:	88 02 80 d2	mov	x8, #0x14
   33670:	08 00 fa f2	movk	x8, #0xd000, lsl #48
   33674:	b6 03 5b f8	ldur	x22, [x29, #-0x50]
   33678:	b6 02 00 b4	cbz	x22, 0x336cc
   3367c:	f6 07 00 f9	str	x22, [sp, #0x8]
   33680:	00 00 80 d2	mov	x0, #0x0
   33684:	78 68 00 94	bl	_$sSo10CFErrorRefaMa
   33688:	f3 03 00 aa	mov	x19, x0
   3368c:	c1 00 00 d0	adrp	x1, 26 ; 0x4d000
   33690:	21 90 21 91	add	x1, x1, #0x864
   33694:	60 38 00 d0	adrp	x0, 1806 ; 0x741000
   33698:	00 00 13 91	add	x0, x0, #0x4c0
   3369c:	82 37 00 b0	adrp	x2, 1777 ; 0x724000
   336a0:	42 20 40 f9	ldr	x2, [x2, #0x40] ; literal pool symbol address: _$sSo10CFErrorRefas5Error10FoundationMc
   336a4:	a5 6c 00 94	bl	_$sSo10CFErrorRefaABs5Error10FoundationWlTm
   336a8:	e1 03 00 aa	mov	x1, x0
   336ac:	f4 23 00 91	add	x20, sp, #0x8
   336b0:	e0 03 13 aa	mov	x0, x19
   336b4:	35 84 13 94	bl	0x514788 ; symbol stub for: _$ss5ErrorP10FoundationE20localizedDescriptionSSvg
   336b8:	f4 03 00 aa	mov	x20, x0
   336bc:	f3 03 01 aa	mov	x19, x1
   336c0:	e0 03 16 aa	mov	x0, x22
   336c4:	27 88 13 94	bl	0x515760 ; symbol stub for: _objc_release
   336c8:	06 00 00 14	b	0x336e0
   336cc:	29 27 00 d0	adrp	x9, 1254 ; 0x519000
   336d0:	29 41 35 91	add	x9, x9, #0xd50 ; literal pool for: "failed to create access control"
   336d4:	29 81 00 d1	sub	x9, x9, #0x20
   336d8:	33 01 41 b2	orr	x19, x9, #0x8000000000000000
   336dc:	14 2d 00 91	add	x20, x8, #0xb
   336e0:	28 27 00 d0	adrp	x8, 1254 ; 0x519000
   336e4:	08 c1 34 91	add	x8, x8, #0xd30 ; literal pool for: "AsideBiometricHelper"
   336e8:	1a 81 00 d1	sub	x26, x8, #0x20
   336ec:	60 38 00 d0	adrp	x0, 1806 ; 0x741000
   336f0:	00 c0 12 91	add	x0, x0, #0x4b0
   336f4:	a1 27 00 f0	adrp	x1, 1271 ; 0x52a000
   336f8:	21 a0 1c 91	add	x1, x1, #0x728
   336fc:	6c c3 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   33700:	e1 43 00 91	add	x1, sp, #0x10
   33704:	e0 88 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   33708:	f6 03 00 aa	mov	x22, x0
   3370c:	a8 27 00 f0	adrp	x8, 1271 ; 0x52a000
   33710:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   33714:	00 04 80 3d	str	q0, [x0, #0x10]
   33718:	88 37 00 b0	adrp	x8, 1777 ; 0x724000
   3371c:	08 25 40 f9	ldr	x8, [x8, #0x48] ; literal pool symbol address: _NSLocalizedDescriptionKey
   33720:	00 01 40 f9	ldr	x0, [x8]
   33724:	80 83 13 94	bl	0x514524 ; symbol stub for: _$sSS10FoundationE36_unconditionallyBridgeFromObjectiveCySSSo8NSStringCSgFZ
   33728:	f7 03 16 aa	mov	x23, x22
   3372c:	e0 0e 02 f8	str	x0, [x23, #0x20]!
   33730:	98 37 00 b0	adrp	x24, 1777 ; 0x724000
   33734:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   33738:	d8 26 00 f9	str	x24, [x22, #0x48]
   3373c:	c1 d2 02 a9	stp	x1, x20, [x22, #0x28]
   33740:	d3 1e 00 f9	str	x19, [x22, #0x38]
   33744:	e0 03 16 aa	mov	x0, x22
   33748:	f3 67 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3374c:	f3 03 00 aa	mov	x19, x0
   33750:	e0 03 16 aa	mov	x0, x22
   33754:	e1 88 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   33758:	61 38 00 d0	adrp	x1, 1806 ; 0x741000
   3375c:	21 e0 12 91	add	x1, x1, #0x4b8
   33760:	a2 27 00 f0	adrp	x2, 1271 ; 0x52a000
   33764:	42 c0 1c 91	add	x2, x2, #0x730
   33768:	e0 03 17 aa	mov	x0, x23
   3376c:	a9 70 00 94	bl	_$sypSgWOhTm
   33770:	68 38 00 d0	adrp	x8, 1806 ; 0x741000
   33774:	00 fd 41 f9	ldr	x0, [x8, #0x3f8] ; Objc class ref: _OBJC_CLASS_$_NSError
   33778:	f4 87 13 94	bl	0x515748 ; symbol stub for: _objc_allocWithZone
   3377c:	f4 03 00 aa	mov	x20, x0
   33780:	41 03 41 b2	orr	x1, x26, #0x8000000000000000
   33784:	80 02 80 d2	mov	x0, #0x14
   33788:	00 00 fa f2	movk	x0, #0xd000, lsl #48
   3378c:	5d 83 13 94	bl	0x514500 ; symbol stub for: _$sSS10FoundationE19_bridgeToObjectiveCSo8NSStringCyF
   33790:	f6 03 00 aa	mov	x22, x0
   33794:	88 37 00 b0	adrp	x8, 1777 ; 0x724000
   33798:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3379c:	83 37 00 b0	adrp	x3, 1777 ; 0x724000
   337a0:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   337a4:	02 21 00 91	add	x2, x8, #0x8
   337a8:	e0 03 13 aa	mov	x0, x19
   337ac:	e1 03 18 aa	mov	x1, x24
   337b0:	4e 83 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   337b4:	f7 03 00 aa	mov	x23, x0
   337b8:	e0 03 13 aa	mov	x0, x19
   337bc:	88 88 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   337c0:	e0 03 14 aa	mov	x0, x20
   337c4:	e2 03 16 aa	mov	x2, x22
   337c8:	03 00 80 92	mov	x3, #-0x1
   337cc:	e4 03 17 aa	mov	x4, x23
   337d0:	9c 8f 13 94	bl	"_objc_msgSend$initWithDomain:code:userInfo:"
   337d4:	f3 03 00 aa	mov	x19, x0
   337d8:	e0 03 16 aa	mov	x0, x22
   337dc:	e1 87 13 94	bl	0x515760 ; symbol stub for: _objc_release
   337e0:	e0 03 17 aa	mov	x0, x23
   337e4:	df 87 13 94	bl	0x515760 ; symbol stub for: _objc_release
   337e8:	f5 03 13 aa	mov	x21, x19
   337ec:	c4 88 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   337f0:	e0 03 19 aa	mov	x0, x25
   337f4:	a8 83 5b f8	ldur	x8, [x29, #-0x48]
   337f8:	89 37 00 b0	adrp	x9, 1777 ; 0x724000
   337fc:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   33800:	29 01 40 f9	ldr	x9, [x9]
   33804:	3f 01 08 eb	cmp	x9, x8
   33808:	21 01 00 54	b.ne	0x3382c
   3380c:	f5 03 13 aa	mov	x21, x19
   33810:	fd 7b 4b a9	ldp	x29, x30, [sp, #0xb0]
   33814:	f4 4f 4a a9	ldp	x20, x19, [sp, #0xa0]
   33818:	f7 5b 49 a9	ldp	x23, x22, [sp, #0x90]
   3381c:	f9 63 48 a9	ldp	x25, x24, [sp, #0x80]
   33820:	fa 3b 40 f9	ldr	x26, [sp, #0x70]
   33824:	ff 03 03 91	add	sp, sp, #0xc0
   33828:	c0 03 5f d6	ret
   3382c:	b6 86 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
