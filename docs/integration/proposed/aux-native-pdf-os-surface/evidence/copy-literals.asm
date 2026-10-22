/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift11cmdCopyFileSSyF:
   4765c:	fc 6f ba a9	stp	x28, x27, [sp, #-0x60]!
   47660:	fa 67 01 a9	stp	x26, x25, [sp, #0x10]
   47664:	f8 5f 02 a9	stp	x24, x23, [sp, #0x20]
   47668:	f6 57 03 a9	stp	x22, x21, [sp, #0x30]
   4766c:	f4 4f 04 a9	stp	x20, x19, [sp, #0x40]
   47670:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   47674:	fd 43 01 91	add	x29, sp, #0x50
   47678:	ff 83 06 d1	sub	sp, sp, #0x1a0
   4767c:	f3 03 00 91	mov	x19, sp
   47680:	e8 36 00 b0	adrp	x8, 1757 ; 0x724000
   47684:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   47688:	08 01 40 f9	ldr	x8, [x8]
   4768c:	a8 83 19 f8	stur	x8, [x29, #-0x68]
   47690:	00 00 80 d2	mov	x0, #0x0
   47694:	ad 33 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   47698:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   4769c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   476a0:	e9 03 08 aa	mov	x9, x8
   476a4:	f0 36 00 b0	adrp	x16, 1757 ; 0x724000
   476a8:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   476ac:	00 02 3f d6	blr	x16
   476b0:	e9 03 00 91	mov	x9, sp
   476b4:	08 3d 00 91	add	x8, x8, #0xf
   476b8:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   476bc:	35 01 08 cb	sub	x21, x9, x8
   476c0:	bf 02 00 91	mov	sp, x21
   476c4:	00 00 80 d2	mov	x0, #0x0
   476c8:	8c 32 13 94	bl	0x5140f8 ; symbol stub for: _$s10Foundation3URLVMa
   476cc:	f8 03 00 aa	mov	x24, x0
   476d0:	17 80 5f f8	ldur	x23, [x0, #-0x8]
   476d4:	e8 22 40 f9	ldr	x8, [x23, #0x40]
   476d8:	e9 03 08 aa	mov	x9, x8
   476dc:	f0 36 00 b0	adrp	x16, 1757 ; 0x724000
   476e0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   476e4:	00 02 3f d6	blr	x16
   476e8:	e9 03 00 91	mov	x9, sp
   476ec:	08 3d 00 91	add	x8, x8, #0xf
   476f0:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   476f4:	39 01 08 cb	sub	x25, x9, x8
   476f8:	3f 03 00 91	mov	sp, x25
   476fc:	e8 73 ff 97	bl	_$s16AsideNativeSwift13readStdinJsonSDySSypGSgyF
   47700:	fa 36 00 b0	adrp	x26, 1757 ; 0x724000
   47704:	5a 6b 41 f9	ldr	x26, [x26, #0x2d0] ; literal pool symbol address: _$sypN
   47708:	60 18 00 b4	cbz	x0, 0x47a14
   4770c:	f4 03 00 aa	mov	x20, x0
   47710:	08 08 40 f9	ldr	x8, [x0, #0x10]
   47714:	a8 16 00 b4	cbz	x8, 0x479e8
   47718:	c0 2c 8d d2	mov	x0, #0x6966
   4771c:	80 ad ac f2	movk	x0, #0x656c, lsl #16
   47720:	00 2a cc f2	movk	x0, #0x6150, lsl #32
   47724:	80 0e ed f2	movk	x0, #0x6874, lsl #48
   47728:	01 00 fd d2	mov	x1, #-0x1800000000000000
   4772c:	11 0a 00 94	bl	_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5
   47730:	c1 15 00 36	tbz	w1, #0x0, 0x479e8
   47734:	88 1e 40 f9	ldr	x8, [x20, #0x38]
   47738:	00 15 00 8b	add	x0, x8, x0, lsl #5
   4773c:	a1 83 03 d1	sub	x1, x29, #0xe0
   47740:	e6 17 00 94	bl	_$sypWOc
   47744:	e0 03 14 aa	mov	x0, x20
   47748:	a5 38 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   4774c:	a8 83 53 f8	ldur	x8, [x29, #-0xc8]
   47750:	68 15 00 b4	cbz	x8, 0x479fc
   47754:	e3 36 00 b0	adrp	x3, 1757 ; 0x724000
   47758:	63 24 41 f9	ldr	x3, [x3, #0x248] ; literal pool symbol address: _$sSSN
   4775c:	60 22 00 91	add	x0, x19, #0x8
   47760:	a1 83 03 d1	sub	x1, x29, #0xe0
   47764:	42 23 00 91	add	x2, x26, #0x8
   47768:	c4 00 80 52	mov	w4, #0x6
   4776c:	ae 38 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   47770:	20 15 00 36	tbz	w0, #0x0, 0x47a14
   47774:	7b d2 40 a9	ldp	x27, x20, [x19, #0x8]
   47778:	c8 37 00 d0	adrp	x8, 1786 ; 0x741000
   4777c:	00 01 42 f9	ldr	x0, [x8, #0x400] ; Objc class ref: _OBJC_CLASS_$_NSFileManager
   47780:	f5 37 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   47784:	4f 3f 13 94	bl	_objc_msgSend$defaultManager
   47788:	fd 03 1d aa	mov	x29, x29
   4778c:	fb 37 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   47790:	f6 03 00 aa	mov	x22, x0
   47794:	7b 02 00 f9	str	x27, [x19]
   47798:	e0 03 1b aa	mov	x0, x27
   4779c:	e1 03 14 aa	mov	x1, x20
   477a0:	58 33 13 94	bl	0x514500 ; symbol stub for: _$sSS10FoundationE19_bridgeToObjectiveCSo8NSStringCyF
   477a4:	fb 03 00 aa	mov	x27, x0
   477a8:	e0 03 16 aa	mov	x0, x22
   477ac:	e2 03 1b aa	mov	x2, x27
   477b0:	64 3f 13 94	bl	"_objc_msgSend$fileExistsAtPath:"
   477b4:	fc 03 00 aa	mov	x28, x0
   477b8:	e0 03 16 aa	mov	x0, x22
   477bc:	e9 37 13 94	bl	0x515760 ; symbol stub for: _objc_release
   477c0:	e0 03 1b aa	mov	x0, x27
   477c4:	e7 37 13 94	bl	0x515760 ; symbol stub for: _objc_release
   477c8:	1c 21 00 34	cbz	w28, 0x47be8
   477cc:	c8 37 00 d0	adrp	x8, 1786 ; 0x741000
   477d0:	00 09 42 f9	ldr	x0, [x8, #0x410] ; Objc class ref: _OBJC_CLASS_$_NSPasteboard
   477d4:	e0 37 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   477d8:	6a 3f 13 94	bl	_objc_msgSend$generalPasteboard
   477dc:	fd 03 1d aa	mov	x29, x29
   477e0:	e6 37 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   477e4:	f6 03 00 aa	mov	x22, x0
   477e8:	0e 3f 13 94	bl	_objc_msgSend$clearContents
   477ec:	c0 37 00 d0	adrp	x0, 1786 ; 0x741000
   477f0:	00 80 1f 91	add	x0, x0, #0x7e0
   477f4:	01 27 00 f0	adrp	x1, 1251 ; 0x52a000
   477f8:	21 40 1e 91	add	x1, x1, #0x790
   477fc:	2c 73 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   47800:	01 05 80 52	mov	w1, #0x28
   47804:	e2 00 80 52	mov	w2, #0x7
   47808:	69 38 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   4780c:	fb 03 00 aa	mov	x27, x0
   47810:	08 27 00 f0	adrp	x8, 1251 ; 0x52a000
   47814:	00 bd c1 3d	ldr	q0, [x8, #0x6f0]
   47818:	00 04 80 3d	str	q0, [x0, #0x10]
   4781c:	e8 03 19 aa	mov	x8, x25
   47820:	60 02 40 f9	ldr	x0, [x19]
   47824:	e1 03 14 aa	mov	x1, x20
   47828:	1c 32 13 94	bl	0x514098 ; symbol stub for: _$s10Foundation3URLV15fileURLWithPathACSSh_tcfC
   4782c:	e0 03 14 aa	mov	x0, x20
   47830:	6b 38 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   47834:	f4 03 19 aa	mov	x20, x25
   47838:	1e 32 13 94	bl	0x5140b0 ; symbol stub for: _$s10Foundation3URLV19_bridgeToObjectiveCSo5NSURLCyF
   4783c:	f4 03 00 aa	mov	x20, x0
   47840:	e8 06 40 f9	ldr	x8, [x23, #0x8]
   47844:	e0 03 19 aa	mov	x0, x25
   47848:	e1 03 18 aa	mov	x1, x24
   4784c:	00 01 3f d6	blr	x8
   47850:	74 13 00 f9	str	x20, [x27, #0x20]
   47854:	c0 37 00 d0	adrp	x0, 1786 ; 0x741000
   47858:	00 a0 1f 91	add	x0, x0, #0x7e8
   4785c:	01 27 00 f0	adrp	x1, 1251 ; 0x52a000
   47860:	21 60 1e 91	add	x1, x1, #0x798
   47864:	12 73 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   47868:	e1 03 00 aa	mov	x1, x0
   4786c:	e0 03 1b aa	mov	x0, x27
   47870:	5d 33 13 94	bl	0x5145e4 ; symbol stub for: _$sSa10FoundationE19_bridgeToObjectiveCSo7NSArrayCyF
   47874:	f4 03 00 aa	mov	x20, x0
   47878:	e0 03 1b aa	mov	x0, x27
   4787c:	8e 38 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   47880:	e0 03 16 aa	mov	x0, x22
   47884:	e2 03 14 aa	mov	x2, x20
   47888:	16 40 13 94	bl	"_objc_msgSend$writeObjects:"
   4788c:	f8 03 00 aa	mov	x24, x0
   47890:	e0 03 14 aa	mov	x0, x20
   47894:	b3 37 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47898:	98 25 00 34	cbz	w24, 0x47d48
   4789c:	c0 37 00 d0	adrp	x0, 1786 ; 0x741000
   478a0:	00 c0 12 91	add	x0, x0, #0x4b0
   478a4:	01 27 00 f0	adrp	x1, 1251 ; 0x52a000
   478a8:	21 a0 1c 91	add	x1, x1, #0x728
   478ac:	00 73 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   478b0:	61 82 00 91	add	x1, x19, #0x20
   478b4:	74 38 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   478b8:	f4 03 00 aa	mov	x20, x0
   478bc:	08 27 00 f0	adrp	x8, 1251 ; 0x52a000
   478c0:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   478c4:	00 04 80 3d	str	q0, [x0, #0x10]
   478c8:	68 ae 8e d2	mov	x8, #0x7573
   478cc:	68 6c ac f2	movk	x8, #0x6363, lsl #16
   478d0:	a8 6c ce f2	movk	x8, #0x7365, lsl #32
   478d4:	68 0e e0 f2	movk	x8, #0x73, lsl #48
   478d8:	f8 03 00 aa	mov	x24, x0
   478dc:	08 0f 02 f8	str	x8, [x24, #0x20]!
   478e0:	08 e0 fc d2	mov	x8, #-0x1900000000000000
   478e4:	08 14 00 f9	str	x8, [x0, #0x28]
   478e8:	e8 36 00 b0	adrp	x8, 1757 ; 0x724000
   478ec:	08 35 41 f9	ldr	x8, [x8, #0x268] ; literal pool symbol address: _$sSbN
   478f0:	08 24 00 f9	str	x8, [x0, #0x48]
   478f4:	28 00 80 52	mov	w8, #0x1
   478f8:	08 c0 00 39	strb	w8, [x0, #0x30]
   478fc:	86 17 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   47900:	f7 03 00 aa	mov	x23, x0
   47904:	e0 03 14 aa	mov	x0, x20
   47908:	74 38 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   4790c:	c1 37 00 d0	adrp	x1, 1786 ; 0x741000
   47910:	21 e0 12 91	add	x1, x1, #0x4b8
   47914:	02 27 00 f0	adrp	x2, 1251 ; 0x52a000
   47918:	42 c0 1c 91	add	x2, x2, #0x730
   4791c:	e0 03 18 aa	mov	x0, x24
   47920:	3c 20 00 94	bl	_$sypSgWOhTm
   47924:	c8 37 00 d0	adrp	x8, 1786 ; 0x741000
   47928:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   4792c:	8a 37 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   47930:	f4 03 00 aa	mov	x20, x0
   47934:	e1 36 00 b0	adrp	x1, 1757 ; 0x724000
   47938:	21 24 41 f9	ldr	x1, [x1, #0x248] ; literal pool symbol address: _$sSSN
   4793c:	e3 36 00 b0	adrp	x3, 1757 ; 0x724000
   47940:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   47944:	42 23 00 91	add	x2, x26, #0x8
   47948:	e0 03 17 aa	mov	x0, x23
   4794c:	e7 32 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   47950:	f8 03 00 aa	mov	x24, x0
   47954:	bf 03 12 f8	stur	xzr, [x29, #-0xe0]
   47958:	a4 83 03 d1	sub	x4, x29, #0xe0
   4795c:	e0 03 14 aa	mov	x0, x20
   47960:	e2 03 18 aa	mov	x2, x24
   47964:	03 00 80 d2	mov	x3, #0x0
   47968:	ce 3e 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   4796c:	fd 03 1d aa	mov	x29, x29
   47970:	82 37 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   47974:	f4 03 00 aa	mov	x20, x0
   47978:	e0 03 18 aa	mov	x0, x24
   4797c:	79 37 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47980:	a0 03 52 f8	ldur	x0, [x29, #-0xe0]
   47984:	7a 37 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   47988:	94 2a 00 b4	cbz	x20, 0x47ed8
   4798c:	e0 03 14 aa	mov	x0, x20
   47990:	f5 31 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   47994:	f8 03 00 aa	mov	x24, x0
   47998:	f9 03 01 aa	mov	x25, x1
   4799c:	e0 03 14 aa	mov	x0, x20
   479a0:	70 37 13 94	bl	0x515760 ; symbol stub for: _objc_release
   479a4:	e8 03 15 aa	mov	x8, x21
   479a8:	e5 32 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   479ac:	e0 03 18 aa	mov	x0, x24
   479b0:	e1 03 19 aa	mov	x1, x25
   479b4:	e2 03 15 aa	mov	x2, x21
   479b8:	de 32 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   479bc:	f4 03 00 aa	mov	x20, x0
   479c0:	f5 03 01 aa	mov	x21, x1
   479c4:	e0 03 18 aa	mov	x0, x24
   479c8:	e1 03 19 aa	mov	x1, x25
   479cc:	33 17 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   479d0:	75 29 00 b4	cbz	x21, 0x47efc
   479d4:	e0 03 16 aa	mov	x0, x22
   479d8:	62 37 13 94	bl	0x515760 ; symbol stub for: _objc_release
   479dc:	e0 03 17 aa	mov	x0, x23
   479e0:	ff 37 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   479e4:	71 00 00 14	b	0x47ba8
   479e8:	a8 83 03 d1	sub	x8, x29, #0xe0
   479ec:	00 e4 00 6f	movi.2d	v0, #0000000000000000
   479f0:	00 01 00 ad	stp	q0, q0, [x8]
   479f4:	e0 03 14 aa	mov	x0, x20
   479f8:	f9 37 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   479fc:	c1 37 00 d0	adrp	x1, 1786 ; 0x741000
   47a00:	21 40 12 91	add	x1, x1, #0x490
   47a04:	02 27 00 f0	adrp	x2, 1251 ; 0x52a000
   47a08:	42 40 1c 91	add	x2, x2, #0x710
   47a0c:	a0 83 03 d1	sub	x0, x29, #0xe0
   47a10:	00 20 00 94	bl	_$sypSgWOhTm
   47a14:	f7 36 00 b0	adrp	x23, 1757 ; 0x724000
   47a18:	f7 26 41 f9	ldr	x23, [x23, #0x248] ; literal pool symbol address: _$sSSN
   47a1c:	b4 04 80 d2	mov	x20, #0x25
   47a20:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   47a24:	88 26 00 f0	adrp	x8, 1235 ; 0x51a000
   47a28:	08 81 06 91	add	x8, x8, #0x1a0 ; literal pool for: "copy-file requires filePath"
   47a2c:	08 81 00 d1	sub	x8, x8, #0x20
   47a30:	16 01 41 b2	orr	x22, x8, #0x8000000000000000
   47a34:	c0 37 00 d0	adrp	x0, 1786 ; 0x741000
   47a38:	00 c0 12 91	add	x0, x0, #0x4b0
   47a3c:	01 27 00 f0	adrp	x1, 1251 ; 0x52a000
   47a40:	21 a0 1c 91	add	x1, x1, #0x728
   47a44:	9a 72 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   47a48:	a1 e3 02 d1	sub	x1, x29, #0xb8
   47a4c:	0e 38 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   47a50:	f8 03 00 aa	mov	x24, x0
   47a54:	08 27 00 f0	adrp	x8, 1251 ; 0x52a000
   47a58:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   47a5c:	00 04 80 3d	str	q0, [x0, #0x10]
   47a60:	a8 4c 8e d2	mov	x8, #0x7265
   47a64:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   47a68:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   47a6c:	f9 03 00 aa	mov	x25, x0
   47a70:	28 0f 02 f8	str	x8, [x25, #0x20]!
   47a74:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   47a78:	17 24 00 f9	str	x23, [x0, #0x48]
   47a7c:	89 2a 00 d1	sub	x9, x20, #0xa
   47a80:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   47a84:	16 1c 00 f9	str	x22, [x0, #0x38]
   47a88:	23 17 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   47a8c:	f6 03 00 aa	mov	x22, x0
   47a90:	e0 03 18 aa	mov	x0, x24
   47a94:	11 38 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   47a98:	c1 37 00 d0	adrp	x1, 1786 ; 0x741000
   47a9c:	21 e0 12 91	add	x1, x1, #0x4b8
   47aa0:	02 27 00 f0	adrp	x2, 1251 ; 0x52a000
   47aa4:	42 c0 1c 91	add	x2, x2, #0x730
   47aa8:	e0 03 19 aa	mov	x0, x25
   47aac:	d9 1f 00 94	bl	_$sypSgWOhTm
   47ab0:	c8 37 00 d0	adrp	x8, 1786 ; 0x741000
   47ab4:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   47ab8:	27 37 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   47abc:	f8 03 00 aa	mov	x24, x0
   47ac0:	e3 36 00 b0	adrp	x3, 1757 ; 0x724000
   47ac4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   47ac8:	42 23 00 91	add	x2, x26, #0x8
   47acc:	e0 03 16 aa	mov	x0, x22
   47ad0:	e1 03 17 aa	mov	x1, x23
   47ad4:	85 32 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   47ad8:	f9 03 00 aa	mov	x25, x0
   47adc:	bf 03 12 f8	stur	xzr, [x29, #-0xe0]
   47ae0:	a4 83 03 d1	sub	x4, x29, #0xe0
   47ae4:	e0 03 18 aa	mov	x0, x24
   47ae8:	e2 03 19 aa	mov	x2, x25
   47aec:	03 00 80 d2	mov	x3, #0x0
   47af0:	6c 3e 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   47af4:	fd 03 1d aa	mov	x29, x29
   47af8:	20 37 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   47afc:	f7 03 00 aa	mov	x23, x0
   47b00:	e0 03 19 aa	mov	x0, x25
   47b04:	17 37 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47b08:	a0 03 52 f8	ldur	x0, [x29, #-0xe0]
   47b0c:	18 37 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   47b10:	f7 02 00 b4	cbz	x23, 0x47b6c
   47b14:	e0 03 17 aa	mov	x0, x23
   47b18:	93 31 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   47b1c:	f8 03 00 aa	mov	x24, x0
   47b20:	f9 03 01 aa	mov	x25, x1
   47b24:	e0 03 17 aa	mov	x0, x23
   47b28:	0e 37 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47b2c:	e8 03 15 aa	mov	x8, x21
   47b30:	83 32 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   47b34:	e0 03 18 aa	mov	x0, x24
   47b38:	e1 03 19 aa	mov	x1, x25
   47b3c:	e2 03 15 aa	mov	x2, x21
   47b40:	7c 32 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   47b44:	f7 03 00 aa	mov	x23, x0
   47b48:	f5 03 01 aa	mov	x21, x1
   47b4c:	e0 03 18 aa	mov	x0, x24
   47b50:	e1 03 19 aa	mov	x1, x25
   47b54:	d1 16 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   47b58:	d5 01 00 b4	cbz	x21, 0x47b90
   47b5c:	e0 03 16 aa	mov	x0, x22
   47b60:	9f 37 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   47b64:	f4 03 17 aa	mov	x20, x23
   47b68:	10 00 00 14	b	0x47ba8
   47b6c:	f5 03 00 aa	mov	x21, x0
   47b70:	41 31 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   47b74:	f7 03 00 aa	mov	x23, x0
   47b78:	e0 03 15 aa	mov	x0, x21
   47b7c:	f9 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47b80:	f5 03 17 aa	mov	x21, x23
   47b84:	de 37 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   47b88:	e0 03 17 aa	mov	x0, x23
   47b8c:	a9 37 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   47b90:	e0 03 16 aa	mov	x0, x22
   47b94:	92 37 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   47b98:	88 26 00 d0	adrp	x8, 1234 ; 0x519000
   47b9c:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   47ba0:	08 81 00 d1	sub	x8, x8, #0x20
   47ba4:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   47ba8:	a8 83 59 f8	ldur	x8, [x29, #-0x68]
   47bac:	e9 36 00 b0	adrp	x9, 1757 ; 0x724000
   47bb0:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   47bb4:	29 01 40 f9	ldr	x9, [x9]
   47bb8:	3f 01 08 eb	cmp	x9, x8
   47bbc:	81 1c 00 54	b.ne	0x47f4c
   47bc0:	e0 03 14 aa	mov	x0, x20
   47bc4:	e1 03 15 aa	mov	x1, x21
   47bc8:	bf 43 01 d1	sub	sp, x29, #0x50
   47bcc:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   47bd0:	f4 4f 44 a9	ldp	x20, x19, [sp, #0x40]
   47bd4:	f6 57 43 a9	ldp	x22, x21, [sp, #0x30]
   47bd8:	f8 5f 42 a9	ldp	x24, x23, [sp, #0x20]
   47bdc:	fa 67 41 a9	ldp	x26, x25, [sp, #0x10]
   47be0:	fc 6f c6 a8	ldp	x28, x27, [sp], #0x60
   47be4:	c0 03 5f d6	ret
   47be8:	e0 03 14 aa	mov	x0, x20
   47bec:	7c 37 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   47bf0:	c0 37 00 d0	adrp	x0, 1786 ; 0x741000
   47bf4:	00 c0 12 91	add	x0, x0, #0x4b0
   47bf8:	01 27 00 f0	adrp	x1, 1251 ; 0x52a000
   47bfc:	21 a0 1c 91	add	x1, x1, #0x728
   47c00:	2b 72 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   47c04:	61 02 03 91	add	x1, x19, #0xc0
   47c08:	9f 37 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   47c0c:	f4 03 00 aa	mov	x20, x0
   47c10:	08 27 00 f0	adrp	x8, 1251 ; 0x52a000
   47c14:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   47c18:	00 04 80 3d	str	q0, [x0, #0x10]
   47c1c:	a8 4c 8e d2	mov	x8, #0x7265
   47c20:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   47c24:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   47c28:	f8 03 00 aa	mov	x24, x0
   47c2c:	08 0f 02 f8	str	x8, [x24, #0x20]!
   47c30:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   47c34:	f7 36 00 b0	adrp	x23, 1757 ; 0x724000
   47c38:	f7 26 41 f9	ldr	x23, [x23, #0x248] ; literal pool symbol address: _$sSSN
   47c3c:	17 24 00 f9	str	x23, [x0, #0x48]
   47c40:	c9 28 8d d2	mov	x9, #0x6946
   47c44:	89 ad ac f2	movk	x9, #0x656c, lsl #16
   47c48:	09 c4 cd f2	movk	x9, #0x6e20, lsl #32
   47c4c:	e9 8d ee f2	movk	x9, #0x746f, lsl #48
   47c50:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   47c54:	08 c4 8c d2	mov	x8, #0x6620
   47c58:	e8 ad ae f2	movk	x8, #0x756f, lsl #16
   47c5c:	c8 8d cc f2	movk	x8, #0x646e, lsl #32
   47c60:	08 c0 fd f2	movk	x8, #0xee00, lsl #48
   47c64:	08 1c 00 f9	str	x8, [x0, #0x38]
   47c68:	ab 16 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   47c6c:	f6 03 00 aa	mov	x22, x0
   47c70:	e0 03 14 aa	mov	x0, x20
   47c74:	99 37 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   47c78:	c1 37 00 d0	adrp	x1, 1786 ; 0x741000
   47c7c:	21 e0 12 91	add	x1, x1, #0x4b8
   47c80:	02 27 00 f0	adrp	x2, 1251 ; 0x52a000
   47c84:	42 c0 1c 91	add	x2, x2, #0x730
   47c88:	e0 03 18 aa	mov	x0, x24
   47c8c:	61 1f 00 94	bl	_$sypSgWOhTm
   47c90:	c8 37 00 d0	adrp	x8, 1786 ; 0x741000
   47c94:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   47c98:	af 36 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   47c9c:	f4 03 00 aa	mov	x20, x0
   47ca0:	e3 36 00 b0	adrp	x3, 1757 ; 0x724000
   47ca4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   47ca8:	42 23 00 91	add	x2, x26, #0x8
   47cac:	e0 03 16 aa	mov	x0, x22
   47cb0:	e1 03 17 aa	mov	x1, x23
   47cb4:	0d 32 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   47cb8:	f7 03 00 aa	mov	x23, x0
   47cbc:	bf 03 12 f8	stur	xzr, [x29, #-0xe0]
   47cc0:	a4 83 03 d1	sub	x4, x29, #0xe0
   47cc4:	e0 03 14 aa	mov	x0, x20
   47cc8:	e2 03 17 aa	mov	x2, x23
   47ccc:	03 00 80 d2	mov	x3, #0x0
   47cd0:	f4 3d 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   47cd4:	fd 03 1d aa	mov	x29, x29
   47cd8:	a8 36 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   47cdc:	f4 03 00 aa	mov	x20, x0
   47ce0:	e0 03 17 aa	mov	x0, x23
   47ce4:	9f 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47ce8:	a0 03 52 f8	ldur	x0, [x29, #-0xe0]
   47cec:	a0 36 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   47cf0:	d4 0d 00 b4	cbz	x20, 0x47ea8
   47cf4:	e0 03 14 aa	mov	x0, x20
   47cf8:	1b 31 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   47cfc:	f7 03 00 aa	mov	x23, x0
   47d00:	f8 03 01 aa	mov	x24, x1
   47d04:	e0 03 14 aa	mov	x0, x20
   47d08:	96 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47d0c:	e8 03 15 aa	mov	x8, x21
   47d10:	0b 32 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   47d14:	e0 03 17 aa	mov	x0, x23
   47d18:	e1 03 18 aa	mov	x1, x24
   47d1c:	e2 03 15 aa	mov	x2, x21
   47d20:	04 32 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   47d24:	f4 03 00 aa	mov	x20, x0
   47d28:	f5 03 01 aa	mov	x21, x1
   47d2c:	e0 03 17 aa	mov	x0, x23
   47d30:	e1 03 18 aa	mov	x1, x24
   47d34:	59 16 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   47d38:	b5 0c 00 b4	cbz	x21, 0x47ecc
   47d3c:	e0 03 16 aa	mov	x0, x22
   47d40:	27 37 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   47d44:	99 ff ff 17	b	0x47ba8
   47d48:	b4 04 80 d2	mov	x20, #0x25
   47d4c:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   47d50:	88 26 00 f0	adrp	x8, 1235 ; 0x51a000
   47d54:	08 01 07 91	add	x8, x8, #0x1c0 ; literal pool for: "Failed to copy file to clipboard"
   47d58:	08 81 00 d1	sub	x8, x8, #0x20
   47d5c:	18 01 41 b2	orr	x24, x8, #0x8000000000000000
   47d60:	c0 37 00 d0	adrp	x0, 1786 ; 0x741000
   47d64:	00 c0 12 91	add	x0, x0, #0x4b0
   47d68:	01 27 00 f0	adrp	x1, 1251 ; 0x52a000
   47d6c:	21 a0 1c 91	add	x1, x1, #0x728
   47d70:	cf 71 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   47d74:	61 c2 01 91	add	x1, x19, #0x70
   47d78:	43 37 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   47d7c:	f9 03 00 aa	mov	x25, x0
   47d80:	08 27 00 f0	adrp	x8, 1251 ; 0x52a000
   47d84:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   47d88:	00 04 80 3d	str	q0, [x0, #0x10]
   47d8c:	a8 4c 8e d2	mov	x8, #0x7265
   47d90:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   47d94:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   47d98:	f7 03 00 aa	mov	x23, x0
   47d9c:	e8 0e 02 f8	str	x8, [x23, #0x20]!
   47da0:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   47da4:	fb 36 00 b0	adrp	x27, 1757 ; 0x724000
   47da8:	7b 27 41 f9	ldr	x27, [x27, #0x248] ; literal pool symbol address: _$sSSN
   47dac:	1b 24 00 f9	str	x27, [x0, #0x48]
   47db0:	89 16 00 d1	sub	x9, x20, #0x5
   47db4:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   47db8:	18 1c 00 f9	str	x24, [x0, #0x38]
   47dbc:	56 16 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   47dc0:	f8 03 00 aa	mov	x24, x0
   47dc4:	e0 03 19 aa	mov	x0, x25
   47dc8:	44 37 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   47dcc:	c1 37 00 d0	adrp	x1, 1786 ; 0x741000
   47dd0:	21 e0 12 91	add	x1, x1, #0x4b8
   47dd4:	02 27 00 f0	adrp	x2, 1251 ; 0x52a000
   47dd8:	42 c0 1c 91	add	x2, x2, #0x730
   47ddc:	e0 03 17 aa	mov	x0, x23
   47de0:	0c 1f 00 94	bl	_$sypSgWOhTm
   47de4:	c8 37 00 d0	adrp	x8, 1786 ; 0x741000
   47de8:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   47dec:	5a 36 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   47df0:	f9 03 00 aa	mov	x25, x0
   47df4:	e3 36 00 b0	adrp	x3, 1757 ; 0x724000
   47df8:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   47dfc:	42 23 00 91	add	x2, x26, #0x8
   47e00:	e0 03 18 aa	mov	x0, x24
   47e04:	e1 03 1b aa	mov	x1, x27
   47e08:	b8 31 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   47e0c:	fa 03 00 aa	mov	x26, x0
   47e10:	bf 03 12 f8	stur	xzr, [x29, #-0xe0]
   47e14:	a4 83 03 d1	sub	x4, x29, #0xe0
   47e18:	e0 03 19 aa	mov	x0, x25
   47e1c:	e2 03 1a aa	mov	x2, x26
   47e20:	03 00 80 d2	mov	x3, #0x0
   47e24:	9f 3d 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   47e28:	fd 03 1d aa	mov	x29, x29
   47e2c:	53 36 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   47e30:	f7 03 00 aa	mov	x23, x0
   47e34:	e0 03 1a aa	mov	x0, x26
   47e38:	4a 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47e3c:	a0 03 52 f8	ldur	x0, [x29, #-0xe0]
   47e40:	4b 36 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   47e44:	97 06 00 b4	cbz	x23, 0x47f14
   47e48:	e0 03 17 aa	mov	x0, x23
   47e4c:	c6 30 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   47e50:	f9 03 00 aa	mov	x25, x0
   47e54:	fa 03 01 aa	mov	x26, x1
   47e58:	e0 03 17 aa	mov	x0, x23
   47e5c:	41 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47e60:	e8 03 15 aa	mov	x8, x21
   47e64:	b6 31 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   47e68:	e0 03 19 aa	mov	x0, x25
   47e6c:	e1 03 1a aa	mov	x1, x26
   47e70:	e2 03 15 aa	mov	x2, x21
   47e74:	af 31 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   47e78:	f7 03 00 aa	mov	x23, x0
   47e7c:	f5 03 01 aa	mov	x21, x1
   47e80:	e0 03 19 aa	mov	x0, x25
   47e84:	e1 03 1a aa	mov	x1, x26
   47e88:	04 16 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   47e8c:	75 05 00 b4	cbz	x21, 0x47f38
   47e90:	e0 03 18 aa	mov	x0, x24
   47e94:	d2 36 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   47e98:	e0 03 16 aa	mov	x0, x22
   47e9c:	31 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47ea0:	f4 03 17 aa	mov	x20, x23
   47ea4:	41 ff ff 17	b	0x47ba8
   47ea8:	f4 03 00 aa	mov	x20, x0
   47eac:	72 30 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   47eb0:	f7 03 00 aa	mov	x23, x0
   47eb4:	e0 03 14 aa	mov	x0, x20
   47eb8:	2a 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47ebc:	f5 03 17 aa	mov	x21, x23
   47ec0:	0f 37 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   47ec4:	e0 03 17 aa	mov	x0, x23
   47ec8:	da 36 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   47ecc:	b4 04 80 d2	mov	x20, #0x25
   47ed0:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   47ed4:	2f ff ff 17	b	0x47b90
   47ed8:	f4 03 00 aa	mov	x20, x0
   47edc:	66 30 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   47ee0:	f8 03 00 aa	mov	x24, x0
   47ee4:	e0 03 14 aa	mov	x0, x20
   47ee8:	1e 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47eec:	f5 03 18 aa	mov	x21, x24
   47ef0:	03 37 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   47ef4:	e0 03 18 aa	mov	x0, x24
   47ef8:	ce 36 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   47efc:	b4 04 80 d2	mov	x20, #0x25
   47f00:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   47f04:	e0 03 16 aa	mov	x0, x22
   47f08:	16 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47f0c:	e0 03 17 aa	mov	x0, x23
   47f10:	21 ff ff 17	b	0x47b94
   47f14:	f5 03 00 aa	mov	x21, x0
   47f18:	57 30 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   47f1c:	f7 03 00 aa	mov	x23, x0
   47f20:	e0 03 15 aa	mov	x0, x21
   47f24:	0f 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47f28:	f5 03 17 aa	mov	x21, x23
   47f2c:	f4 36 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   47f30:	e0 03 17 aa	mov	x0, x23
   47f34:	bf 36 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   47f38:	e0 03 18 aa	mov	x0, x24
   47f3c:	a8 36 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   47f40:	e0 03 16 aa	mov	x0, x22
   47f44:	07 36 13 94	bl	0x515760 ; symbol stub for: _objc_release
   47f48:	14 ff ff 17	b	0x47b98
   47f4c:	ee 34 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
