out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift0aB3RunySpys4Int8VGSgSPyADGSg_AHtF:
   49afc:	f8 5f bc a9	stp	x24, x23, [sp, #-0x40]!
   49b00:	f6 57 01 a9	stp	x22, x21, [sp, #0x10]
   49b04:	f4 4f 02 a9	stp	x20, x19, [sp, #0x20]
   49b08:	fd 7b 03 a9	stp	x29, x30, [sp, #0x30]
   49b0c:	fd c3 00 91	add	x29, sp, #0x30
   49b10:	f6 03 01 aa	mov	x22, x1
   49b14:	f4 03 00 aa	mov	x20, x0
   49b18:	0a 2e 13 94	bl	0x515340 ; symbol stub for: __objc_autoreleasePoolPush
   49b1c:	f3 03 00 aa	mov	x19, x0
   49b20:	74 01 00 b4	cbz	x20, 0x49b4c
   49b24:	e0 03 14 aa	mov	x0, x20
   49b28:	94 2a 13 94	bl	0x514578 ; symbol stub for: _$sSS7cStringSSSPys4Int8VG_tcfC
   49b2c:	f5 03 00 aa	mov	x21, x0
   49b30:	f4 03 01 aa	mov	x20, x1
   49b34:	36 01 00 b4	cbz	x22, 0x49b58
   49b38:	e0 03 16 aa	mov	x0, x22
   49b3c:	8f 2a 13 94	bl	0x514578 ; symbol stub for: _$sSS7cStringSSSPys4Int8VG_tcfC
   49b40:	e2 03 00 aa	mov	x2, x0
   49b44:	f6 03 01 aa	mov	x22, x1
   49b48:	06 00 00 14	b	0x49b60
   49b4c:	15 00 80 d2	mov	x21, #0x0
   49b50:	14 00 fc d2	mov	x20, #-0x2000000000000000
   49b54:	36 ff ff b5	cbnz	x22, 0x49b38
   49b58:	02 00 80 d2	mov	x2, #0x0
   49b5c:	16 00 fc d2	mov	x22, #-0x2000000000000000
   49b60:	e0 03 15 aa	mov	x0, x21
   49b64:	e1 03 14 aa	mov	x1, x20
   49b68:	e3 03 16 aa	mov	x3, x22
   49b6c:	d2 fc ff 97	bl	_$s16AsideNativeSwift10runCommand7command5inputS2S_SStF
   49b70:	f5 03 00 aa	mov	x21, x0
   49b74:	f7 03 01 aa	mov	x23, x1
   49b78:	e0 03 14 aa	mov	x0, x20
   49b7c:	98 2f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   49b80:	e0 03 16 aa	mov	x0, x22
   49b84:	96 2f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   49b88:	e0 03 15 aa	mov	x0, x21
   49b8c:	e1 03 17 aa	mov	x1, x23
   49b90:	71 2a 13 94	bl	0x514554 ; symbol stub for: _$sSS11utf8CStrings15ContiguousArrayVys4Int8VGvg
   49b94:	f4 03 00 aa	mov	x20, x0
   49b98:	e0 03 17 aa	mov	x0, x23
   49b9c:	90 2f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   49ba0:	80 82 00 91	add	x0, x20, #0x20
   49ba4:	67 2f 13 94	bl	0x515940 ; symbol stub for: _strdup
   49ba8:	f5 03 00 aa	mov	x21, x0
   49bac:	e0 03 14 aa	mov	x0, x20
   49bb0:	c1 2f 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   49bb4:	e0 03 13 aa	mov	x0, x19
   49bb8:	df 2d 13 94	bl	0x515334 ; symbol stub for: __objc_autoreleasePoolPop
   49bbc:	e0 03 15 aa	mov	x0, x21
   49bc0:	fd 7b 43 a9	ldp	x29, x30, [sp, #0x30]
   49bc4:	f4 4f 42 a9	ldp	x20, x19, [sp, #0x20]
   49bc8:	f6 57 41 a9	ldp	x22, x21, [sp, #0x10]
   49bcc:	f8 5f c4 a8	ldp	x24, x23, [sp], #0x40
   49bd0:	c0 03 5f d6	ret
