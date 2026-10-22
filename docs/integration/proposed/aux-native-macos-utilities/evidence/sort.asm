/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift15cmdListOpenAppsSSyFSbSDySSypG_ACtXEfU0_:
   46a14:	ff c3 01 d1	sub	sp, sp, #0x70
   46a18:	f8 5f 03 a9	stp	x24, x23, [sp, #0x30]
   46a1c:	f6 57 04 a9	stp	x22, x21, [sp, #0x40]
   46a20:	f4 4f 05 a9	stp	x20, x19, [sp, #0x50]
   46a24:	fd 7b 06 a9	stp	x29, x30, [sp, #0x60]
   46a28:	fd 83 01 91	add	x29, sp, #0x60
   46a2c:	96 ac 8c d2	mov	x22, #0x6564
   46a30:	d6 2c ac f2	movk	x22, #0x6166, lsl #16
   46a34:	b6 8e cd f2	movk	x22, #0x6c75, lsl #32
   46a38:	96 0e e0 f2	movk	x22, #0x74, lsl #48
   46a3c:	15 00 40 f9	ldr	x21, [x0]
   46a40:	33 00 40 f9	ldr	x19, [x1]
   46a44:	a8 0a 40 f9	ldr	x8, [x21, #0x10]
   46a48:	c8 03 00 b4	cbz	x8, 0x46ac0
   46a4c:	e0 03 15 aa	mov	x0, x21
   46a50:	e9 3b 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   46a54:	e0 03 16 aa	mov	x0, x22
   46a58:	01 e0 fc d2	mov	x1, #-0x1900000000000000
   46a5c:	f4 03 15 aa	mov	x20, x21
   46a60:	44 0d 00 94	bl	_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5
   46a64:	a1 02 00 36	tbz	w1, #0x0, 0x46ab8
   46a68:	a8 1e 40 f9	ldr	x8, [x21, #0x38]
   46a6c:	00 15 00 8b	add	x0, x8, x0, lsl #5
   46a70:	e1 43 00 91	add	x1, sp, #0x10
   46a74:	19 1b 00 94	bl	_$sypWOc
   46a78:	e0 03 15 aa	mov	x0, x21
   46a7c:	d8 3b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   46a80:	e8 36 00 d0	adrp	x8, 1758 ; 0x724000
   46a84:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   46a88:	e3 36 00 d0	adrp	x3, 1758 ; 0x724000
   46a8c:	63 34 41 f9	ldr	x3, [x3, #0x268] ; literal pool symbol address: _$sSbN
   46a90:	e0 03 00 91	mov	x0, sp
   46a94:	e1 43 00 91	add	x1, sp, #0x10
   46a98:	02 21 00 91	add	x2, x8, #0x8
   46a9c:	c4 00 80 52	mov	w4, #0x6
   46aa0:	e1 3b 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   46aa4:	e0 00 00 36	tbz	w0, #0x0, 0x46ac0
   46aa8:	f7 03 40 39	ldrb	w23, [sp]
   46aac:	68 0a 40 f9	ldr	x8, [x19, #0x10]
   46ab0:	e8 00 00 b5	cbnz	x8, 0x46acc
   46ab4:	23 00 00 14	b	0x46b40
   46ab8:	e0 03 15 aa	mov	x0, x21
   46abc:	c8 3b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   46ac0:	17 00 80 52	mov	w23, #0x0
   46ac4:	68 0a 40 f9	ldr	x8, [x19, #0x10]
   46ac8:	c8 03 00 b4	cbz	x8, 0x46b40
   46acc:	e0 03 13 aa	mov	x0, x19
   46ad0:	c9 3b 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   46ad4:	e0 03 16 aa	mov	x0, x22
   46ad8:	01 e0 fc d2	mov	x1, #-0x1900000000000000
   46adc:	f4 03 13 aa	mov	x20, x19
   46ae0:	24 0d 00 94	bl	_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5
   46ae4:	a1 02 00 36	tbz	w1, #0x0, 0x46b38
   46ae8:	68 1e 40 f9	ldr	x8, [x19, #0x38]
   46aec:	00 15 00 8b	add	x0, x8, x0, lsl #5
   46af0:	e1 43 00 91	add	x1, sp, #0x10
   46af4:	f9 1a 00 94	bl	_$sypWOc
   46af8:	e0 03 13 aa	mov	x0, x19
   46afc:	b8 3b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   46b00:	e8 36 00 d0	adrp	x8, 1758 ; 0x724000
   46b04:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   46b08:	e3 36 00 d0	adrp	x3, 1758 ; 0x724000
   46b0c:	63 34 41 f9	ldr	x3, [x3, #0x268] ; literal pool symbol address: _$sSbN
   46b10:	e0 03 00 91	mov	x0, sp
   46b14:	e1 43 00 91	add	x1, sp, #0x10
   46b18:	02 21 00 91	add	x2, x8, #0x8
   46b1c:	c4 00 80 52	mov	w4, #0x6
   46b20:	c1 3b 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   46b24:	e0 00 00 36	tbz	w0, #0x0, 0x46b40
   46b28:	e8 03 40 39	ldrb	w8, [sp]
   46b2c:	ff 02 08 6b	cmp	w23, w8
   46b30:	e0 00 00 54	b.eq	0x46b4c
   46b34:	5c 00 00 14	b	0x46ca4
   46b38:	e0 03 13 aa	mov	x0, x19
   46b3c:	a8 3b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   46b40:	77 00 00 36	tbz	w23, #0x0, 0x46b4c
   46b44:	37 00 80 52	mov	w23, #0x1
   46b48:	57 00 00 14	b	0x46ca4
   46b4c:	36 0c 8e d2	mov	x22, #0x7061
   46b50:	16 ce a9 f2	movk	x22, #0x4e70, lsl #16
   46b54:	36 ac cd f2	movk	x22, #0x6d61, lsl #32
   46b58:	b6 0c e0 f2	movk	x22, #0x65, lsl #48
   46b5c:	a8 0a 40 f9	ldr	x8, [x21, #0x10]
   46b60:	c8 03 00 b4	cbz	x8, 0x46bd8
   46b64:	e0 03 15 aa	mov	x0, x21
   46b68:	a3 3b 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   46b6c:	e0 03 16 aa	mov	x0, x22
   46b70:	01 e0 fc d2	mov	x1, #-0x1900000000000000
   46b74:	f4 03 15 aa	mov	x20, x21
   46b78:	fe 0c 00 94	bl	_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5
   46b7c:	a1 02 00 36	tbz	w1, #0x0, 0x46bd0
   46b80:	a8 1e 40 f9	ldr	x8, [x21, #0x38]
   46b84:	00 15 00 8b	add	x0, x8, x0, lsl #5
   46b88:	e1 43 00 91	add	x1, sp, #0x10
   46b8c:	d3 1a 00 94	bl	_$sypWOc
   46b90:	e0 03 15 aa	mov	x0, x21
   46b94:	92 3b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   46b98:	e8 36 00 d0	adrp	x8, 1758 ; 0x724000
   46b9c:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   46ba0:	e3 36 00 d0	adrp	x3, 1758 ; 0x724000
   46ba4:	63 24 41 f9	ldr	x3, [x3, #0x248] ; literal pool symbol address: _$sSSN
   46ba8:	e0 03 00 91	mov	x0, sp
   46bac:	e1 43 00 91	add	x1, sp, #0x10
   46bb0:	02 21 00 91	add	x2, x8, #0x8
   46bb4:	c4 00 80 52	mov	w4, #0x6
   46bb8:	9b 3b 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   46bbc:	e0 00 00 36	tbz	w0, #0x0, 0x46bd8
   46bc0:	f7 57 40 a9	ldp	x23, x21, [sp]
   46bc4:	68 0a 40 f9	ldr	x8, [x19, #0x10]
   46bc8:	08 01 00 b5	cbnz	x8, 0x46be8
   46bcc:	23 00 00 14	b	0x46c58
   46bd0:	e0 03 15 aa	mov	x0, x21
   46bd4:	82 3b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   46bd8:	17 00 80 d2	mov	x23, #0x0
   46bdc:	15 00 fc d2	mov	x21, #-0x2000000000000000
   46be0:	68 0a 40 f9	ldr	x8, [x19, #0x10]
   46be4:	a8 03 00 b4	cbz	x8, 0x46c58
   46be8:	e0 03 13 aa	mov	x0, x19
   46bec:	82 3b 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   46bf0:	e0 03 16 aa	mov	x0, x22
   46bf4:	01 e0 fc d2	mov	x1, #-0x1900000000000000
   46bf8:	f4 03 13 aa	mov	x20, x19
   46bfc:	dd 0c 00 94	bl	_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5
   46c00:	61 02 00 36	tbz	w1, #0x0, 0x46c4c
   46c04:	68 1e 40 f9	ldr	x8, [x19, #0x38]
   46c08:	00 15 00 8b	add	x0, x8, x0, lsl #5
   46c0c:	e1 43 00 91	add	x1, sp, #0x10
   46c10:	b2 1a 00 94	bl	_$sypWOc
   46c14:	e0 03 13 aa	mov	x0, x19
   46c18:	71 3b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   46c1c:	e8 36 00 d0	adrp	x8, 1758 ; 0x724000
   46c20:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   46c24:	e3 36 00 d0	adrp	x3, 1758 ; 0x724000
   46c28:	63 24 41 f9	ldr	x3, [x3, #0x248] ; literal pool symbol address: _$sSSN
   46c2c:	e0 03 00 91	mov	x0, sp
   46c30:	e1 43 00 91	add	x1, sp, #0x10
   46c34:	02 21 00 91	add	x2, x8, #0x8
   46c38:	c4 00 80 52	mov	w4, #0x6
   46c3c:	7a 3b 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   46c40:	a0 00 00 36	tbz	w0, #0x0, 0x46c54
   46c44:	e8 4f 40 a9	ldp	x8, x19, [sp]
   46c48:	05 00 00 14	b	0x46c5c
   46c4c:	e0 03 13 aa	mov	x0, x19
   46c50:	63 3b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   46c54:	08 00 80 d2	mov	x8, #0x0
   46c58:	13 00 fc d2	mov	x19, #-0x2000000000000000
   46c5c:	f7 57 01 a9	stp	x23, x21, [sp, #0x10]
   46c60:	e8 4f 00 a9	stp	x8, x19, [sp]
   46c64:	7d 1a 00 94	bl	_$sS2SSysWl
   46c68:	e3 03 00 aa	mov	x3, x0
   46c6c:	e1 36 00 d0	adrp	x1, 1758 ; 0x724000
   46c70:	21 24 41 f9	ldr	x1, [x1, #0x248] ; literal pool symbol address: _$sSSN
   46c74:	e0 03 00 91	mov	x0, sp
   46c78:	f4 43 00 91	add	x20, sp, #0x10
   46c7c:	e2 03 01 aa	mov	x2, x1
   46c80:	e4 03 03 aa	mov	x4, x3
   46c84:	6d 36 13 94	bl	0x514638 ; symbol stub for: _$sSy10FoundationE31localizedCaseInsensitiveCompareySo18NSComparisonResultVqd__SyRd__lF
   46c88:	f4 03 00 aa	mov	x20, x0
   46c8c:	e0 03 15 aa	mov	x0, x21
   46c90:	53 3b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   46c94:	e0 03 13 aa	mov	x0, x19
   46c98:	51 3b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   46c9c:	9f 06 00 b1	cmn	x20, #0x1
   46ca0:	f7 17 9f 1a	cset	w23, eq
   46ca4:	e0 03 17 aa	mov	x0, x23
   46ca8:	fd 7b 46 a9	ldp	x29, x30, [sp, #0x60]
   46cac:	f4 4f 45 a9	ldp	x20, x19, [sp, #0x50]
   46cb0:	f6 57 44 a9	ldp	x22, x21, [sp, #0x40]
   46cb4:	f8 5f 43 a9	ldp	x24, x23, [sp, #0x30]
   46cb8:	ff c3 01 91	add	sp, sp, #0x70
   46cbc:	c0 03 5f d6	ret
