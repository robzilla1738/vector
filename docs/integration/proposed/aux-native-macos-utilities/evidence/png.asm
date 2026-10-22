/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift23writeArtifactPreviewPNG33_4DF3DD086191C68B6697891E23221139LL_2to10outputSizeySo7NSImageC_10Foundation3URLVSo6CGSizeVtKF:
   43670:	ff 83 04 d1	sub	sp, sp, #0x120
   43674:	e9 23 0c 6d	stp	d9, d8, [sp, #0xc0]
   43678:	fc 6b 0d a9	stp	x28, x26, [sp, #0xd0]
   4367c:	f9 63 0e a9	stp	x25, x24, [sp, #0xe0]
   43680:	f7 5b 0f a9	stp	x23, x22, [sp, #0xf0]
   43684:	f4 4f 10 a9	stp	x20, x19, [sp, #0x100]
   43688:	fd 7b 11 a9	stp	x29, x30, [sp, #0x110]
   4368c:	fd 43 04 91	add	x29, sp, #0x110
   43690:	28 1c a1 4e	mov.16b	v8, v1
   43694:	09 1c a0 4e	mov.16b	v9, v0
   43698:	f4 03 01 aa	mov	x20, x1
   4369c:	f7 03 00 aa	mov	x23, x0
   436a0:	e0 03 01 aa	mov	x0, x1
   436a4:	a1 ff ff 97	bl	_$s16AsideNativeSwift36createArtifactPreviewOutputDirectory33_4DF3DD086191C68B6697891E23221139LL3fory10Foundation3URLV_tKF
   436a8:	b5 24 00 b5	cbnz	x21, 0x43b3c
   436ac:	20 29 69 1e	fadd	d0, d9, d9
   436b0:	28 00 80 d2	mov	x8, #0x1
   436b4:	08 7c f8 f2	movk	x8, #0xc3e0, lsl #48
   436b8:	01 01 67 9e	fmov	d1, x8
   436bc:	00 20 61 1e	fcmp	d0, d1
   436c0:	ed 24 00 54	b.le	0x43b5c
   436c4:	08 7c e8 d2	mov	x8, #0x43e0000000000000
   436c8:	01 01 67 9e	fmov	d1, x8
   436cc:	00 20 61 1e	fcmp	d0, d1
   436d0:	85 24 00 54	b.pl	0x43b60
   436d4:	08 00 66 9e	fmov	x8, d0
   436d8:	09 f9 40 92	and	x9, x8, #0x7fffffffffffffff
   436dc:	01 29 68 1e	fadd	d1, d8, d8
   436e0:	28 00 66 9e	fmov	x8, d1
   436e4:	08 f9 40 92	and	x8, x8, #0x7fffffffffffffff
   436e8:	0a 02 f0 92	mov	x10, #0x7fefffffffffffff
   436ec:	1f 01 0a eb	cmp	x8, x10
   436f0:	e8 d7 9f 1a	cset	w8, gt
   436f4:	3f 01 0a eb	cmp	x9, x10
   436f8:	6c 23 00 54	b.gt	0x43b64
   436fc:	48 23 00 37	tbnz	w8, #0x0, 0x43b64
   43700:	28 00 80 d2	mov	x8, #0x1
   43704:	08 7c f8 f2	movk	x8, #0xc3e0, lsl #48
   43708:	02 01 67 9e	fmov	d2, x8
   4370c:	20 20 62 1e	fcmp	d1, d2
   43710:	cd 22 00 54	b.le	0x43b68
   43714:	08 7c e8 d2	mov	x8, #0x43e0000000000000
   43718:	02 01 67 9e	fmov	d2, x8
   4371c:	20 20 62 1e	fcmp	d1, d2
   43720:	65 22 00 54	b.pl	0x43b6c
   43724:	f6 03 15 aa	mov	x22, x21
   43728:	13 00 78 9e	fcvtzs	x19, d0
   4372c:	38 00 78 9e	fcvtzs	x24, d1
   43730:	08 37 00 b0	adrp	x8, 1761 ; 0x724000
   43734:	08 01 40 f9	ldr	x8, [x8] ; literal pool symbol address: _NSDeviceRGBColorSpace
   43738:	19 01 40 f9	ldr	x25, [x8]
   4373c:	e8 37 00 d0	adrp	x8, 1790 ; 0x741000
   43740:	00 15 42 f9	ldr	x0, [x8, #0x428] ; Objc class ref: _OBJC_CLASS_$_NSBitmapImageRep
   43744:	01 48 13 94	bl	0x515748 ; symbol stub for: _objc_allocWithZone
   43748:	ff 7f 01 a9	stp	xzr, xzr, [sp, #0x10]
   4374c:	f9 07 00 f9	str	x25, [sp, #0x8]
   43750:	ff 03 00 39	strb	wzr, [sp]
   43754:	02 00 80 d2	mov	x2, #0x0
   43758:	e3 03 13 aa	mov	x3, x19
   4375c:	e4 03 18 aa	mov	x4, x24
   43760:	05 01 80 52	mov	w5, #0x8
   43764:	86 00 80 52	mov	w6, #0x4
   43768:	27 00 80 52	mov	w7, #0x1
   4376c:	ad 4f 13 94	bl	"_objc_msgSend$initWithBitmapDataPlanes:pixelsWide:pixelsHigh:bitsPerSample:samplesPerPixel:hasAlpha:isPlanar:colorSpaceName:bytesPerRow:bitsPerPixel:"
   43770:	40 0b 00 b4	cbz	x0, 0x438d8
   43774:	f3 03 00 aa	mov	x19, x0
   43778:	20 1d a9 4e	mov.16b	v0, v9
   4377c:	01 1d a8 4e	mov.16b	v1, v8
   43780:	30 50 13 94	bl	"_objc_msgSend$setSize:"
   43784:	e8 37 00 d0	adrp	x8, 1790 ; 0x741000
   43788:	00 19 42 f9	ldr	x0, [x8, #0x430] ; Objc class ref: _OBJC_CLASS_$_NSGraphicsContext
   4378c:	f2 47 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   43790:	f8 03 00 aa	mov	x24, x0
   43794:	fb 4f 13 94	bl	_objc_msgSend$saveGraphicsState
   43798:	e0 03 18 aa	mov	x0, x24
   4379c:	e2 03 13 aa	mov	x2, x19
   437a0:	88 4f 13 94	bl	"_objc_msgSend$graphicsContextWithBitmapImageRep:"
   437a4:	fd 03 1d aa	mov	x29, x29
   437a8:	f4 47 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   437ac:	f9 03 00 aa	mov	x25, x0
   437b0:	e0 03 18 aa	mov	x0, x24
   437b4:	e2 03 19 aa	mov	x2, x25
   437b8:	fa 4f 13 94	bl	"_objc_msgSend$setCurrentContext:"
   437bc:	e0 03 19 aa	mov	x0, x25
   437c0:	e8 47 13 94	bl	0x515760 ; symbol stub for: _objc_release
   437c4:	e0 03 18 aa	mov	x0, x24
   437c8:	26 4f 13 94	bl	_objc_msgSend$currentContext
   437cc:	fd 03 1d aa	mov	x29, x29
   437d0:	ea 47 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   437d4:	c0 00 00 b4	cbz	x0, 0x437ec
   437d8:	f9 03 00 aa	mov	x25, x0
   437dc:	62 00 80 52	mov	w2, #0x3
   437e0:	00 50 13 94	bl	"_objc_msgSend$setImageInterpolation:"
   437e4:	e0 03 19 aa	mov	x0, x25
   437e8:	de 47 13 94	bl	0x515760 ; symbol stub for: _objc_release
   437ec:	00 e4 00 6f	movi.2d	v0, #0000000000000000
   437f0:	01 e4 00 6f	movi.2d	v1, #0000000000000000
   437f4:	e0 03 17 aa	mov	x0, x23
   437f8:	22 1d a9 4e	mov.16b	v2, v9
   437fc:	03 1d a8 4e	mov.16b	v3, v8
   43800:	38 4f 13 94	bl	"_objc_msgSend$drawInRect:"
   43804:	e0 03 18 aa	mov	x0, x24
   43808:	d6 4f 13 94	bl	_objc_msgSend$restoreGraphicsState
   4380c:	00 37 00 b0	adrp	x0, 1761 ; 0x724000
   43810:	00 6c 41 f9	ldr	x0, [x0, #0x2d8] ; literal pool symbol address: __swiftEmptyArrayStorage
   43814:	c7 28 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSo27NSBitmapImageRepPropertyKeya_ypTt0g5Tf4g_n
   43818:	f7 03 00 aa	mov	x23, x0
   4381c:	00 00 80 d2	mov	x0, #0x0
   43820:	f9 2f 00 94	bl	_$sSo27NSBitmapImageRepPropertyKeyaMa
   43824:	f8 03 00 aa	mov	x24, x0
   43828:	61 00 00 90	adrp	x1, 12 ; 0x4f000
   4382c:	21 10 20 91	add	x1, x1, #0x804
   43830:	e0 37 00 d0	adrp	x0, 1790 ; 0x741000
   43834:	00 00 22 91	add	x0, x0, #0x880
   43838:	42 27 00 90	adrp	x2, 1256 ; 0x52b000
   4383c:	42 60 04 91	add	x2, x2, #0x118
   43840:	3e 2c 00 94	bl	_$sSo10CFErrorRefaABs5Error10FoundationWlTm
   43844:	e3 03 00 aa	mov	x3, x0
   43848:	19 37 00 b0	adrp	x25, 1761 ; 0x724000
   4384c:	39 6b 41 f9	ldr	x25, [x25, #0x2d0] ; literal pool symbol address: _$sypN
   43850:	22 23 00 91	add	x2, x25, #0x8
   43854:	e0 03 17 aa	mov	x0, x23
   43858:	e1 03 18 aa	mov	x1, x24
   4385c:	23 43 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   43860:	f8 03 00 aa	mov	x24, x0
   43864:	e0 03 17 aa	mov	x0, x23
   43868:	5d 48 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   4386c:	e0 03 13 aa	mov	x0, x19
   43870:	82 00 80 52	mov	w2, #0x4
   43874:	e3 03 18 aa	mov	x3, x24
   43878:	b2 4f 13 94	bl	"_objc_msgSend$representationUsingType:properties:"
   4387c:	fd 03 1d aa	mov	x29, x29
   43880:	be 47 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   43884:	f7 03 00 aa	mov	x23, x0
   43888:	e0 03 18 aa	mov	x0, x24
   4388c:	b5 47 13 94	bl	0x515760 ; symbol stub for: _objc_release
   43890:	f7 0b 00 b4	cbz	x23, 0x43a0c
   43894:	e0 03 17 aa	mov	x0, x23
   43898:	33 42 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   4389c:	f8 03 00 aa	mov	x24, x0
   438a0:	f9 03 01 aa	mov	x25, x1
   438a4:	e0 03 17 aa	mov	x0, x23
   438a8:	ae 47 13 94	bl	0x515760 ; symbol stub for: _objc_release
   438ac:	e0 03 14 aa	mov	x0, x20
   438b0:	01 00 80 d2	mov	x1, #0x0
   438b4:	e2 03 18 aa	mov	x2, x24
   438b8:	e3 03 19 aa	mov	x3, x25
   438bc:	f5 03 16 aa	mov	x21, x22
   438c0:	2c 42 13 94	bl	0x514170 ; symbol stub for: _$s10Foundation4DataV5write2to7optionsyAA3URLV_So20NSDataWritingOptionsVtKF
   438c4:	f4 03 15 aa	mov	x20, x21
   438c8:	e0 03 18 aa	mov	x0, x24
   438cc:	e1 03 19 aa	mov	x1, x25
   438d0:	72 27 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   438d4:	97 00 00 14	b	0x43b30
   438d8:	a8 26 00 f0	adrp	x8, 1239 ; 0x51a000
   438dc:	08 41 0b 91	add	x8, x8, #0x2d0 ; literal pool for: "aside-native-artifact-preview"
   438e0:	18 81 00 d1	sub	x24, x8, #0x20
   438e4:	e0 37 00 d0	adrp	x0, 1790 ; 0x741000
   438e8:	00 c0 12 91	add	x0, x0, #0x4b0
   438ec:	21 27 00 f0	adrp	x1, 1255 ; 0x52a000
   438f0:	21 a0 1c 91	add	x1, x1, #0x728
   438f4:	ee 82 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   438f8:	e1 c3 01 91	add	x1, sp, #0x70
   438fc:	62 48 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   43900:	f3 03 00 aa	mov	x19, x0
   43904:	28 27 00 f0	adrp	x8, 1255 ; 0x52a000
   43908:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   4390c:	00 04 80 3d	str	q0, [x0, #0x10]
   43910:	08 37 00 b0	adrp	x8, 1761 ; 0x724000
   43914:	08 25 40 f9	ldr	x8, [x8, #0x48] ; literal pool symbol address: _NSLocalizedDescriptionKey
   43918:	00 01 40 f9	ldr	x0, [x8]
   4391c:	02 43 13 94	bl	0x514524 ; symbol stub for: _$sSS10FoundationE36_unconditionallyBridgeFromObjectiveCySSSo8NSStringCSgFZ
   43920:	f4 03 13 aa	mov	x20, x19
   43924:	80 0e 02 f8	str	x0, [x20, #0x20]!
   43928:	a8 26 00 f0	adrp	x8, 1239 ; 0x51a000
   4392c:	08 c1 0b 91	add	x8, x8, #0x2f0 ; literal pool for: "Failed to create fallback icon bitmap"
   43930:	08 81 00 d1	sub	x8, x8, #0x20
   43934:	08 01 41 b2	orr	x8, x8, #0x8000000000000000
   43938:	16 37 00 b0	adrp	x22, 1761 ; 0x724000
   4393c:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   43940:	76 26 00 f9	str	x22, [x19, #0x48]
   43944:	a9 03 80 d2	mov	x9, #0x1d
   43948:	09 00 fa f2	movk	x9, #0xd000, lsl #48
   4394c:	29 21 00 91	add	x9, x9, #0x8
   43950:	61 a6 02 a9	stp	x1, x9, [x19, #0x28]
   43954:	68 1e 00 f9	str	x8, [x19, #0x38]
   43958:	e0 03 13 aa	mov	x0, x19
   4395c:	6e 27 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   43960:	f7 03 00 aa	mov	x23, x0
   43964:	e0 03 13 aa	mov	x0, x19
   43968:	5c 48 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   4396c:	e1 37 00 d0	adrp	x1, 1790 ; 0x741000
   43970:	21 e0 12 91	add	x1, x1, #0x4b8
   43974:	22 27 00 f0	adrp	x2, 1255 ; 0x52a000
   43978:	42 c0 1c 91	add	x2, x2, #0x730
   4397c:	e0 03 14 aa	mov	x0, x20
   43980:	24 30 00 94	bl	_$sypSgWOhTm
   43984:	e8 37 00 d0	adrp	x8, 1790 ; 0x741000
   43988:	00 fd 41 f9	ldr	x0, [x8, #0x3f8] ; Objc class ref: _OBJC_CLASS_$_NSError
   4398c:	6f 47 13 94	bl	0x515748 ; symbol stub for: _objc_allocWithZone
   43990:	f3 03 00 aa	mov	x19, x0
   43994:	01 03 41 b2	orr	x1, x24, #0x8000000000000000
   43998:	a0 03 80 d2	mov	x0, #0x1d
   4399c:	00 00 fa f2	movk	x0, #0xd000, lsl #48
   439a0:	d8 42 13 94	bl	0x514500 ; symbol stub for: _$sSS10FoundationE19_bridgeToObjectiveCSo8NSStringCyF
   439a4:	f4 03 00 aa	mov	x20, x0
   439a8:	08 37 00 b0	adrp	x8, 1761 ; 0x724000
   439ac:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   439b0:	03 37 00 b0	adrp	x3, 1761 ; 0x724000
   439b4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   439b8:	02 21 00 91	add	x2, x8, #0x8
   439bc:	e0 03 17 aa	mov	x0, x23
   439c0:	e1 03 16 aa	mov	x1, x22
   439c4:	c9 42 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   439c8:	f6 03 00 aa	mov	x22, x0
   439cc:	e0 03 17 aa	mov	x0, x23
   439d0:	03 48 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   439d4:	e0 03 13 aa	mov	x0, x19
   439d8:	e2 03 14 aa	mov	x2, x20
   439dc:	63 00 80 52	mov	w3, #0x3
   439e0:	e4 03 16 aa	mov	x4, x22
   439e4:	17 4f 13 94	bl	"_objc_msgSend$initWithDomain:code:userInfo:"
   439e8:	f3 03 00 aa	mov	x19, x0
   439ec:	e0 03 14 aa	mov	x0, x20
   439f0:	5c 47 13 94	bl	0x515760 ; symbol stub for: _objc_release
   439f4:	e0 03 16 aa	mov	x0, x22
   439f8:	5a 47 13 94	bl	0x515760 ; symbol stub for: _objc_release
   439fc:	f5 03 13 aa	mov	x21, x19
   43a00:	3f 48 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   43a04:	f5 03 13 aa	mov	x21, x19
   43a08:	4d 00 00 14	b	0x43b3c
   43a0c:	a8 26 00 f0	adrp	x8, 1239 ; 0x51a000
   43a10:	08 41 0b 91	add	x8, x8, #0x2d0 ; literal pool for: "aside-native-artifact-preview"
   43a14:	1a 81 00 d1	sub	x26, x8, #0x20
   43a18:	e0 37 00 d0	adrp	x0, 1790 ; 0x741000
   43a1c:	00 c0 12 91	add	x0, x0, #0x4b0
   43a20:	21 27 00 f0	adrp	x1, 1255 ; 0x52a000
   43a24:	21 a0 1c 91	add	x1, x1, #0x728
   43a28:	a1 82 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   43a2c:	e1 83 00 91	add	x1, sp, #0x20
   43a30:	15 48 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   43a34:	f4 03 00 aa	mov	x20, x0
   43a38:	28 27 00 f0	adrp	x8, 1255 ; 0x52a000
   43a3c:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   43a40:	00 04 80 3d	str	q0, [x0, #0x10]
   43a44:	08 37 00 b0	adrp	x8, 1761 ; 0x724000
   43a48:	08 25 40 f9	ldr	x8, [x8, #0x48] ; literal pool symbol address: _NSLocalizedDescriptionKey
   43a4c:	00 01 40 f9	ldr	x0, [x8]
   43a50:	b5 42 13 94	bl	0x514524 ; symbol stub for: _$sSS10FoundationE36_unconditionallyBridgeFromObjectiveCySSSo8NSStringCSgFZ
   43a54:	f6 03 14 aa	mov	x22, x20
   43a58:	c0 0e 02 f8	str	x0, [x22, #0x20]!
   43a5c:	a8 26 00 f0	adrp	x8, 1239 ; 0x51a000
   43a60:	08 81 0c 91	add	x8, x8, #0x320 ; literal pool for: "Failed to encode fallback icon as PNG"
   43a64:	08 81 00 d1	sub	x8, x8, #0x20
   43a68:	08 01 41 b2	orr	x8, x8, #0x8000000000000000
   43a6c:	17 37 00 b0	adrp	x23, 1761 ; 0x724000
   43a70:	f7 26 41 f9	ldr	x23, [x23, #0x248] ; literal pool symbol address: _$sSSN
   43a74:	97 26 00 f9	str	x23, [x20, #0x48]
   43a78:	a9 03 80 d2	mov	x9, #0x1d
   43a7c:	09 00 fa f2	movk	x9, #0xd000, lsl #48
   43a80:	29 21 00 91	add	x9, x9, #0x8
   43a84:	81 a6 02 a9	stp	x1, x9, [x20, #0x28]
   43a88:	88 1e 00 f9	str	x8, [x20, #0x38]
   43a8c:	e0 03 14 aa	mov	x0, x20
   43a90:	21 27 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   43a94:	f8 03 00 aa	mov	x24, x0
   43a98:	e0 03 14 aa	mov	x0, x20
   43a9c:	0f 48 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   43aa0:	e1 37 00 d0	adrp	x1, 1790 ; 0x741000
   43aa4:	21 e0 12 91	add	x1, x1, #0x4b8
   43aa8:	22 27 00 f0	adrp	x2, 1255 ; 0x52a000
   43aac:	42 c0 1c 91	add	x2, x2, #0x730
   43ab0:	e0 03 16 aa	mov	x0, x22
   43ab4:	d7 2f 00 94	bl	_$sypSgWOhTm
   43ab8:	e8 37 00 d0	adrp	x8, 1790 ; 0x741000
   43abc:	00 fd 41 f9	ldr	x0, [x8, #0x3f8] ; Objc class ref: _OBJC_CLASS_$_NSError
   43ac0:	22 47 13 94	bl	0x515748 ; symbol stub for: _objc_allocWithZone
   43ac4:	f4 03 00 aa	mov	x20, x0
   43ac8:	41 03 41 b2	orr	x1, x26, #0x8000000000000000
   43acc:	a0 03 80 d2	mov	x0, #0x1d
   43ad0:	00 00 fa f2	movk	x0, #0xd000, lsl #48
   43ad4:	8b 42 13 94	bl	0x514500 ; symbol stub for: _$sSS10FoundationE19_bridgeToObjectiveCSo8NSStringCyF
   43ad8:	f6 03 00 aa	mov	x22, x0
   43adc:	03 37 00 b0	adrp	x3, 1761 ; 0x724000
   43ae0:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   43ae4:	22 23 00 91	add	x2, x25, #0x8
   43ae8:	e0 03 18 aa	mov	x0, x24
   43aec:	e1 03 17 aa	mov	x1, x23
   43af0:	7e 42 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   43af4:	f7 03 00 aa	mov	x23, x0
   43af8:	e0 03 18 aa	mov	x0, x24
   43afc:	b8 47 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   43b00:	e0 03 14 aa	mov	x0, x20
   43b04:	e2 03 16 aa	mov	x2, x22
   43b08:	83 00 80 52	mov	w3, #0x4
   43b0c:	e4 03 17 aa	mov	x4, x23
   43b10:	cc 4e 13 94	bl	"_objc_msgSend$initWithDomain:code:userInfo:"
   43b14:	f4 03 00 aa	mov	x20, x0
   43b18:	e0 03 16 aa	mov	x0, x22
   43b1c:	11 47 13 94	bl	0x515760 ; symbol stub for: _objc_release
   43b20:	e0 03 17 aa	mov	x0, x23
   43b24:	0f 47 13 94	bl	0x515760 ; symbol stub for: _objc_release
   43b28:	f5 03 14 aa	mov	x21, x20
   43b2c:	f4 47 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   43b30:	e0 03 13 aa	mov	x0, x19
   43b34:	0b 47 13 94	bl	0x515760 ; symbol stub for: _objc_release
   43b38:	f5 03 14 aa	mov	x21, x20
   43b3c:	fd 7b 51 a9	ldp	x29, x30, [sp, #0x110]
   43b40:	f4 4f 50 a9	ldp	x20, x19, [sp, #0x100]
   43b44:	f7 5b 4f a9	ldp	x23, x22, [sp, #0xf0]
   43b48:	f9 63 4e a9	ldp	x25, x24, [sp, #0xe0]
   43b4c:	fc 6b 4d a9	ldp	x28, x26, [sp, #0xd0]
   43b50:	e9 23 4c 6d	ldp	d9, d8, [sp, #0xc0]
   43b54:	ff 83 04 91	add	sp, sp, #0x120
   43b58:	c0 03 5f d6	ret
   43b5c:	20 00 20 d4	brk	#0x1
   43b60:	20 00 20 d4	brk	#0x1
   43b64:	20 00 20 d4	brk	#0x1
   43b68:	20 00 20 d4	brk	#0x1
   43b6c:	20 00 20 d4	brk	#0x1
