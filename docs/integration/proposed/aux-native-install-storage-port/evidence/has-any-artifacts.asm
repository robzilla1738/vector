/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift22hasAnyInstallArtifactsSbyF:
   33904:	f4 4f be a9	stp	x20, x19, [sp, #-0x20]!
   33908:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
   3390c:	fd 43 00 91	add	x29, sp, #0x10
   33910:	88 38 00 d0	adrp	x8, 1810 ; 0x745000
   33914:	08 f9 40 f9	ldr	x8, [x8, #0x1f0]
   33918:	1f 05 00 b1	cmn	x8, #0x1
   3391c:	a1 05 00 54	b.ne	0x339d0
   33920:	88 38 00 b0	adrp	x8, 1809 ; 0x744000
   33924:	08 61 39 91	add	x8, x8, #0xe58
   33928:	00 05 40 a9	ldp	x0, x1, [x8]
   3392c:	28 fe ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   33930:	f3 03 01 aa	mov	x19, x1
   33934:	4d 70 00 94	bl	0x4fa68
   33938:	68 fe 7c d3	lsr	x8, x19, #60
   3393c:	1f 3d 00 f1	cmp	x8, #0xf
   33940:	63 03 00 54	b.lo	0x339ac
   33944:	88 38 00 d0	adrp	x8, 1810 ; 0x745000
   33948:	08 fd 40 f9	ldr	x8, [x8, #0x1f8]
   3394c:	1f 05 00 b1	cmn	x8, #0x1
   33950:	c1 04 00 54	b.ne	0x339e8
   33954:	88 38 00 b0	adrp	x8, 1809 ; 0x744000
   33958:	08 a1 39 91	add	x8, x8, #0xe68
   3395c:	00 05 40 a9	ldp	x0, x1, [x8]
   33960:	1b fe ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   33964:	f3 03 01 aa	mov	x19, x1
   33968:	40 70 00 94	bl	0x4fa68
   3396c:	68 fe 7c d3	lsr	x8, x19, #60
   33970:	1f 3d 00 f1	cmp	x8, #0xf
   33974:	c3 01 00 54	b.lo	0x339ac
   33978:	88 38 00 d0	adrp	x8, 1810 ; 0x745000
   3397c:	08 01 41 f9	ldr	x8, [x8, #0x200]
   33980:	1f 05 00 b1	cmn	x8, #0x1
   33984:	e1 03 00 54	b.ne	0x33a00
   33988:	88 38 00 b0	adrp	x8, 1809 ; 0x744000
   3398c:	08 e1 39 91	add	x8, x8, #0xe78
   33990:	00 05 40 a9	ldp	x0, x1, [x8]
   33994:	0e fe ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   33998:	f3 03 01 aa	mov	x19, x1
   3399c:	33 70 00 94	bl	0x4fa68
   339a0:	68 fe 7c d3	lsr	x8, x19, #60
   339a4:	1f 39 00 f1	cmp	x8, #0xe
   339a8:	08 01 00 54	b.hi	0x339c8
   339ac:	00 00 80 d2	mov	x0, #0x0
   339b0:	01 00 fe d2	mov	x1, #-0x1000000000000000
   339b4:	2d 70 00 94	bl	0x4fa68
   339b8:	20 00 80 52	mov	w0, #0x1
   339bc:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
   339c0:	f4 4f c2 a8	ldp	x20, x19, [sp], #0x20
   339c4:	c0 03 5f d6	ret
   339c8:	00 00 80 52	mov	w0, #0x0
   339cc:	fc ff ff 17	b	0x339bc
   339d0:	80 38 00 d0	adrp	x0, 1810 ; 0x745000
   339d4:	00 c0 07 91	add	x0, x0, #0x1f0
   339d8:	e1 ff ff b0	adrp	x1, -3 ; 0x30000
   339dc:	21 90 21 91	add	x1, x1, #0x864
   339e0:	32 88 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   339e4:	cf ff ff 17	b	0x33920
   339e8:	80 38 00 d0	adrp	x0, 1810 ; 0x745000
   339ec:	00 e0 07 91	add	x0, x0, #0x1f8
   339f0:	e1 ff ff b0	adrp	x1, -3 ; 0x30000
   339f4:	21 40 23 91	add	x1, x1, #0x8d0
   339f8:	2c 88 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   339fc:	d6 ff ff 17	b	0x33954
   33a00:	80 38 00 d0	adrp	x0, 1810 ; 0x745000
   33a04:	00 00 08 91	add	x0, x0, #0x200
   33a08:	e1 ff ff b0	adrp	x1, -3 ; 0x30000
   33a0c:	21 f0 24 91	add	x1, x1, #0x93c
   33a10:	26 88 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   33a14:	dd ff ff 17	b	0x33988
