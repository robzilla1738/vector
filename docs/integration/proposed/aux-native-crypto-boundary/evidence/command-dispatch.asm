/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift10runCommand7command5inputS2S_SStF:
   48eb4:	fa 67 bb a9	stp	x26, x25, [sp, #-0x50]!
   48eb8:	f8 5f 01 a9	stp	x24, x23, [sp, #0x10]
   48ebc:	f6 57 02 a9	stp	x22, x21, [sp, #0x20]
   48ec0:	f4 4f 03 a9	stp	x20, x19, [sp, #0x30]
   48ec4:	fd 7b 04 a9	stp	x29, x30, [sp, #0x40]
   48ec8:	fd 03 01 91	add	x29, sp, #0x40
   48ecc:	ff 43 03 d1	sub	sp, sp, #0xd0
   48ed0:	f4 03 03 aa	mov	x20, x3
   48ed4:	f7 03 02 aa	mov	x23, x2
   48ed8:	f5 03 01 aa	mov	x21, x1
   48edc:	f6 03 00 aa	mov	x22, x0
   48ee0:	e8 36 00 90	adrp	x8, 1756 ; 0x724000
   48ee4:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   48ee8:	08 01 40 f9	ldr	x8, [x8]
   48eec:	a8 83 1b f8	stur	x8, [x29, #-0x48]
   48ef0:	00 00 80 d2	mov	x0, #0x0
   48ef4:	95 2d 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   48ef8:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   48efc:	08 21 40 f9	ldr	x8, [x8, #0x40]
   48f00:	e9 03 08 aa	mov	x9, x8
   48f04:	f0 36 00 90	adrp	x16, 1756 ; 0x724000
   48f08:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   48f0c:	00 02 3f d6	blr	x16
   48f10:	e9 03 00 91	mov	x9, sp
   48f14:	08 3d 00 91	add	x8, x8, #0xf
   48f18:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   48f1c:	33 01 08 cb	sub	x19, x9, x8
   48f20:	7f 02 00 91	mov	sp, x19
   48f24:	e8 be 40 92	and	x8, x23, #0xffffffffffff
   48f28:	89 ee 78 d3	ubfx	x9, x20, #56, #4
   48f2c:	9f 02 43 f2	tst	x20, #0x2000000000000000
   48f30:	08 01 89 9a	csel	x8, x8, x9, eq
   48f34:	28 02 00 b4	cbz	x8, 0x48f78
   48f38:	b7 d3 30 a9	stp	x23, x20, [x29, #-0xf8]
   48f3c:	48 01 80 52	mov	w8, #0xa
   48f40:	09 20 fc d2	mov	x9, #-0x1f00000000000000
   48f44:	aa 23 00 d1	sub	x10, x29, #0x8
   48f48:	48 01 10 f8	stur	x8, [x10, #-0x100]
   48f4c:	a9 03 10 f8	stur	x9, [x29, #-0x100]
   48f50:	c2 11 00 94	bl	_$sS2SSysWl
   48f54:	e3 03 00 aa	mov	x3, x0
   48f58:	e1 36 00 90	adrp	x1, 1756 ; 0x724000
   48f5c:	21 24 41 f9	ldr	x1, [x1, #0x248] ; literal pool symbol address: _$sSSN
   48f60:	a0 23 04 d1	sub	x0, x29, #0x108
   48f64:	b4 e3 03 d1	sub	x20, x29, #0xf8
   48f68:	e2 03 01 aa	mov	x2, x1
   48f6c:	e4 03 03 aa	mov	x4, x3
   48f70:	ac 2d 13 94	bl	0x514620 ; symbol stub for: _$sSy10FoundationE10components11separatedBySaySSGqd___tSyRd__lF
   48f74:	03 00 00 14	b	0x48f80
   48f78:	e0 36 00 90	adrp	x0, 1756 ; 0x724000
   48f7c:	00 6c 41 f9	ldr	x0, [x0, #0x2d8] ; literal pool symbol address: __swiftEmptyArrayStorage
   48f80:	74 8e 8e d2	mov	x20, #0x7473
   48f84:	34 8c ae f2	movk	x20, #0x7461, lsl #16
   48f88:	b4 6e ce f2	movk	x20, #0x7375, lsl #32
   48f8c:	5c 6d ff 97	bl	_$s16AsideNativeSwift16nativeInputLinesSaySSGvs
   48f90:	df 02 14 eb	cmp	x22, x20
   48f94:	81 00 00 54	b.ne	0x48fa4
   48f98:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   48f9c:	bf 02 08 eb	cmp	x21, x8
   48fa0:	00 01 00 54	b.eq	0x48fc0
   48fa4:	e0 03 14 aa	mov	x0, x20
   48fa8:	01 c0 fc d2	mov	x1, #-0x1a00000000000000
   48fac:	e2 03 16 aa	mov	x2, x22
   48fb0:	e3 03 15 aa	mov	x3, x21
   48fb4:	04 00 80 52	mov	w4, #0x0
   48fb8:	e8 2d 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   48fbc:	c0 02 00 36	tbz	w0, #0x0, 0x49014
   48fc0:	ee 78 ff 97	bl	_$s16AsideNativeSwift9cmdStatusSSyF
   48fc4:	f3 03 00 aa	mov	x19, x0
   48fc8:	f4 03 01 aa	mov	x20, x1
   48fcc:	e0 36 00 90	adrp	x0, 1756 ; 0x724000
   48fd0:	00 6c 41 f9	ldr	x0, [x0, #0x2d8] ; literal pool symbol address: __swiftEmptyArrayStorage
   48fd4:	4a 6d ff 97	bl	_$s16AsideNativeSwift16nativeInputLinesSaySSGvs
   48fd8:	a8 83 5b f8	ldur	x8, [x29, #-0x48]
   48fdc:	e9 36 00 90	adrp	x9, 1756 ; 0x724000
   48fe0:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   48fe4:	29 01 40 f9	ldr	x9, [x9]
   48fe8:	3f 01 08 eb	cmp	x9, x8
   48fec:	21 23 00 54	b.ne	0x49450
   48ff0:	e0 03 13 aa	mov	x0, x19
   48ff4:	e1 03 14 aa	mov	x1, x20
   48ff8:	bf 03 01 d1	sub	sp, x29, #0x40
   48ffc:	fd 7b 44 a9	ldp	x29, x30, [sp, #0x40]
   49000:	f4 4f 43 a9	ldp	x20, x19, [sp, #0x30]
   49004:	f6 57 42 a9	ldp	x22, x21, [sp, #0x20]
   49008:	f8 5f 41 a9	ldp	x24, x23, [sp, #0x10]
   4900c:	fa 67 c5 a8	ldp	x26, x25, [sp], #0x50
   49010:	c0 03 5f d6	ret
   49014:	a0 cc 8d d2	mov	x0, #0x6e65
   49018:	40 ee ad f2	movk	x0, #0x6f72, lsl #16
   4901c:	80 8d cd f2	movk	x0, #0x6c6c, lsl #32
   49020:	df 02 00 eb	cmp	x22, x0
   49024:	81 00 00 54	b.ne	0x49034
   49028:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   4902c:	bf 02 08 eb	cmp	x21, x8
   49030:	e0 00 00 54	b.eq	0x4904c
   49034:	01 c0 fc d2	mov	x1, #-0x1a00000000000000
   49038:	e2 03 16 aa	mov	x2, x22
   4903c:	e3 03 15 aa	mov	x3, x21
   49040:	04 00 80 52	mov	w4, #0x0
   49044:	c5 2d 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49048:	60 00 00 36	tbz	w0, #0x0, 0x49054
   4904c:	ca 79 ff 97	bl	_$s16AsideNativeSwift9cmdEnrollSSyF
   49050:	dd ff ff 17	b	0x48fc4
   49054:	a1 cc 8d d2	mov	x1, #0x6e65
   49058:	41 ee ad f2	movk	x1, #0x6f72, lsl #16
   4905c:	81 8d cd f2	movk	x1, #0x6c6c, lsl #32
   49060:	01 c0 fd f2	movk	x1, #0xee00, lsl #48
   49064:	a0 2d 8d d2	mov	x0, #0x696d
   49068:	e0 4c ae f2	movk	x0, #0x7267, lsl #16
   4906c:	20 8c ce f2	movk	x0, #0x7461, lsl #32
   49070:	a0 ac e5 f2	movk	x0, #0x2d65, lsl #48
   49074:	df 02 00 eb	cmp	x22, x0
   49078:	61 00 00 54	b.ne	0x49084
   4907c:	bf 02 01 eb	cmp	x21, x1
   49080:	c0 00 00 54	b.eq	0x49098
   49084:	e2 03 16 aa	mov	x2, x22
   49088:	e3 03 15 aa	mov	x3, x21
   4908c:	04 00 80 52	mov	w4, #0x0
   49090:	b2 2d 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49094:	60 00 00 36	tbz	w0, #0x0, 0x490a0
   49098:	42 85 ff 97	bl	_$s16AsideNativeSwift16cmdMigrateEnrollSSyF
   4909c:	ca ff ff 17	b	0x48fc4
   490a0:	a0 ce 8d d2	mov	x0, #0x6e75
   490a4:	80 ed ad f2	movk	x0, #0x6f6c, lsl #16
   490a8:	60 6c cd f2	movk	x0, #0x6b63, lsl #32
   490ac:	df 02 00 eb	cmp	x22, x0
   490b0:	81 00 00 54	b.ne	0x490c0
   490b4:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   490b8:	bf 02 08 eb	cmp	x21, x8
   490bc:	e0 00 00 54	b.eq	0x490d8
   490c0:	01 c0 fc d2	mov	x1, #-0x1a00000000000000
   490c4:	e2 03 16 aa	mov	x2, x22
   490c8:	e3 03 15 aa	mov	x3, x21
   490cc:	04 00 80 52	mov	w4, #0x0
   490d0:	a2 2d 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   490d4:	60 00 00 36	tbz	w0, #0x0, 0x490e0
   490d8:	f6 7d ff 97	bl	_$s16AsideNativeSwift9cmdUnlockSSyF
   490dc:	ba ff ff 17	b	0x48fc4
   490e0:	21 8c 8e d2	mov	x1, #0x7461
   490e4:	61 0c ad f2	movk	x1, #0x6863, lsl #16
   490e8:	01 80 fd f2	movk	x1, #0xec00, lsl #48
   490ec:	a0 ce 8d d2	mov	x0, #0x6e75
   490f0:	80 ed ad f2	movk	x0, #0x6f6c, lsl #16
   490f4:	60 6c cd f2	movk	x0, #0x6b63, lsl #32
   490f8:	a0 45 ec f2	movk	x0, #0x622d, lsl #48
   490fc:	df 02 00 eb	cmp	x22, x0
   49100:	61 00 00 54	b.ne	0x4910c
   49104:	bf 02 01 eb	cmp	x21, x1
   49108:	c0 00 00 54	b.eq	0x49120
   4910c:	e2 03 16 aa	mov	x2, x22
   49110:	e3 03 15 aa	mov	x3, x21
   49114:	04 00 80 52	mov	w4, #0x0
   49118:	90 2d 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   4911c:	60 00 00 36	tbz	w0, #0x0, 0x49128
   49120:	2b 7f ff 97	bl	_$s16AsideNativeSwift14cmdUnlockBatchSSyF
   49124:	a8 ff ff 17	b	0x48fc4
   49128:	c0 ae 8c d2	mov	x0, #0x6576
   4912c:	40 2e ad f2	movk	x0, #0x6972, lsl #16
   49130:	c0 2c cf f2	movk	x0, #0x7966, lsl #32
   49134:	df 02 00 eb	cmp	x22, x0
   49138:	81 00 00 54	b.ne	0x49148
   4913c:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   49140:	bf 02 08 eb	cmp	x21, x8
   49144:	e0 00 00 54	b.eq	0x49160
   49148:	01 c0 fc d2	mov	x1, #-0x1a00000000000000
   4914c:	e2 03 16 aa	mov	x2, x22
   49150:	e3 03 15 aa	mov	x3, x21
   49154:	04 00 80 52	mov	w4, #0x0
   49158:	80 2d 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   4915c:	60 00 00 36	tbz	w0, #0x0, 0x49168
   49160:	da 82 ff 97	bl	_$s16AsideNativeSwift9cmdVerifySSyF
   49164:	98 ff ff 17	b	0x48fc4
   49168:	40 ae 8c d2	mov	x0, #0x6572
   4916c:	a0 ed ad f2	movk	x0, #0x6f6d, lsl #16
   49170:	c0 ae cc f2	movk	x0, #0x6576, lsl #32
   49174:	df 02 00 eb	cmp	x22, x0
   49178:	81 00 00 54	b.ne	0x49188
   4917c:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   49180:	bf 02 08 eb	cmp	x21, x8
   49184:	e0 00 00 54	b.eq	0x491a0
   49188:	01 c0 fc d2	mov	x1, #-0x1a00000000000000
   4918c:	e2 03 16 aa	mov	x2, x22
   49190:	e3 03 15 aa	mov	x3, x21
   49194:	04 00 80 52	mov	w4, #0x0
   49198:	70 2d 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   4919c:	20 0d 00 36	tbz	w0, #0x0, 0x49340
   491a0:	e2 6d ff 97	bl	_$s16AsideNativeSwift13readAccountIdSiyF
   491a4:	01 73 ff 97	bl	_$s16AsideNativeSwift14keychainDelete9accountIdySi_tF
   491a8:	c0 37 00 90	adrp	x0, 1784 ; 0x741000
   491ac:	00 c0 12 91	add	x0, x0, #0x4b0
   491b0:	01 27 00 b0	adrp	x1, 1249 ; 0x52a000
   491b4:	21 a0 1c 91	add	x1, x1, #0x728
   491b8:	bd 6c ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   491bc:	a1 a3 03 d1	sub	x1, x29, #0xe8
   491c0:	31 32 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   491c4:	f4 03 00 aa	mov	x20, x0
   491c8:	08 27 00 b0	adrp	x8, 1249 ; 0x52a000
   491cc:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   491d0:	00 04 80 3d	str	q0, [x0, #0x10]
   491d4:	68 ae 8e d2	mov	x8, #0x7573
   491d8:	68 6c ac f2	movk	x8, #0x6363, lsl #16
   491dc:	a8 6c ce f2	movk	x8, #0x7365, lsl #32
   491e0:	68 0e e0 f2	movk	x8, #0x73, lsl #48
   491e4:	f5 03 00 aa	mov	x21, x0
   491e8:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   491ec:	08 e0 fc d2	mov	x8, #-0x1900000000000000
   491f0:	08 14 00 f9	str	x8, [x0, #0x28]
   491f4:	c8 36 00 f0	adrp	x8, 1755 ; 0x724000
   491f8:	08 35 41 f9	ldr	x8, [x8, #0x268] ; literal pool symbol address: _$sSbN
   491fc:	08 24 00 f9	str	x8, [x0, #0x48]
   49200:	28 00 80 52	mov	w8, #0x1
   49204:	08 c0 00 39	strb	w8, [x0, #0x30]
   49208:	43 11 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   4920c:	f6 03 00 aa	mov	x22, x0
   49210:	e0 03 14 aa	mov	x0, x20
   49214:	31 32 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   49218:	c1 37 00 90	adrp	x1, 1784 ; 0x741000
   4921c:	21 e0 12 91	add	x1, x1, #0x4b8
   49220:	02 27 00 b0	adrp	x2, 1249 ; 0x52a000
   49224:	42 c0 1c 91	add	x2, x2, #0x730
   49228:	e0 03 15 aa	mov	x0, x21
   4922c:	f9 19 00 94	bl	_$sypSgWOhTm
   49230:	c8 37 00 90	adrp	x8, 1784 ; 0x741000
   49234:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   49238:	47 31 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   4923c:	f4 03 00 aa	mov	x20, x0
   49240:	c8 36 00 f0	adrp	x8, 1755 ; 0x724000
   49244:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   49248:	c1 36 00 f0	adrp	x1, 1755 ; 0x724000
   4924c:	21 24 41 f9	ldr	x1, [x1, #0x248] ; literal pool symbol address: _$sSSN
   49250:	c3 36 00 f0	adrp	x3, 1755 ; 0x724000
   49254:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   49258:	02 21 00 91	add	x2, x8, #0x8
   4925c:	e0 03 16 aa	mov	x0, x22
   49260:	a2 2c 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   49264:	f5 03 00 aa	mov	x21, x0
   49268:	bf 83 10 f8	stur	xzr, [x29, #-0xf8]
   4926c:	a4 e3 03 d1	sub	x4, x29, #0xf8
   49270:	e0 03 14 aa	mov	x0, x20
   49274:	e2 03 15 aa	mov	x2, x21
   49278:	03 00 80 d2	mov	x3, #0x0
   4927c:	89 38 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   49280:	fd 03 1d aa	mov	x29, x29
   49284:	3d 31 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   49288:	f4 03 00 aa	mov	x20, x0
   4928c:	e0 03 15 aa	mov	x0, x21
   49290:	34 31 13 94	bl	0x515760 ; symbol stub for: _objc_release
   49294:	a0 83 50 f8	ldur	x0, [x29, #-0xf8]
   49298:	35 31 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   4929c:	d4 02 00 b4	cbz	x20, 0x492f4
   492a0:	e0 03 14 aa	mov	x0, x20
   492a4:	b0 2b 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   492a8:	f5 03 00 aa	mov	x21, x0
   492ac:	f7 03 01 aa	mov	x23, x1
   492b0:	e0 03 14 aa	mov	x0, x20
   492b4:	2b 31 13 94	bl	0x515760 ; symbol stub for: _objc_release
   492b8:	e8 03 13 aa	mov	x8, x19
   492bc:	a0 2c 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   492c0:	e0 03 15 aa	mov	x0, x21
   492c4:	e1 03 17 aa	mov	x1, x23
   492c8:	e2 03 13 aa	mov	x2, x19
   492cc:	99 2c 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   492d0:	f3 03 00 aa	mov	x19, x0
   492d4:	f4 03 01 aa	mov	x20, x1
   492d8:	e0 03 15 aa	mov	x0, x21
   492dc:	e1 03 17 aa	mov	x1, x23
   492e0:	ee 10 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   492e4:	b4 01 00 b4	cbz	x20, 0x49318
   492e8:	e0 03 16 aa	mov	x0, x22
   492ec:	bc 31 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   492f0:	37 ff ff 17	b	0x48fcc
   492f4:	f3 03 00 aa	mov	x19, x0
   492f8:	5f 2b 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   492fc:	f4 03 00 aa	mov	x20, x0
   49300:	e0 03 13 aa	mov	x0, x19
   49304:	17 31 13 94	bl	0x515760 ; symbol stub for: _objc_release
   49308:	f5 03 14 aa	mov	x21, x20
   4930c:	fc 31 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   49310:	e0 03 14 aa	mov	x0, x20
   49314:	c7 31 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   49318:	e0 03 16 aa	mov	x0, x22
   4931c:	b0 31 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   49320:	88 26 00 90	adrp	x8, 1232 ; 0x519000
   49324:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   49328:	08 81 00 d1	sub	x8, x8, #0x20
   4932c:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   49330:	28 02 80 d2	mov	x8, #0x11
   49334:	08 00 fa f2	movk	x8, #0xd000, lsl #48
   49338:	13 51 00 91	add	x19, x8, #0x14
   4933c:	24 ff ff 17	b	0x48fcc
   49340:	61 2e 8c d2	mov	x1, #0x6173
   49344:	c1 ae ac f2	movk	x1, #0x6576, lsl #16
   49348:	01 80 fd f2	movk	x1, #0xec00, lsl #48
   4934c:	74 ae 8c d2	mov	x20, #0x6573
   49350:	74 6e ae f2	movk	x20, #0x7373, lsl #16
   49354:	34 ed cd f2	movk	x20, #0x6f69, lsl #32
   49358:	d4 ad e5 f2	movk	x20, #0x2d6e, lsl #48
   4935c:	df 02 14 eb	cmp	x22, x20
   49360:	61 00 00 54	b.ne	0x4936c
   49364:	bf 02 01 eb	cmp	x21, x1
   49368:	e0 00 00 54	b.eq	0x49384
   4936c:	e0 03 14 aa	mov	x0, x20
   49370:	e2 03 16 aa	mov	x2, x22
   49374:	e3 03 15 aa	mov	x3, x21
   49378:	04 00 80 52	mov	w4, #0x0
   4937c:	f7 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49380:	60 00 00 36	tbz	w0, #0x0, 0x4938c
   49384:	79 91 ff 97	bl	_$s16AsideNativeSwift14cmdSessionSaveSSyF
   49388:	0f ff ff 17	b	0x48fc4
   4938c:	41 ae 8c d2	mov	x1, #0x6572
   49390:	21 8c ac f2	movk	x1, #0x6461, lsl #16
   49394:	01 80 fd f2	movk	x1, #0xec00, lsl #48
   49398:	df 02 14 eb	cmp	x22, x20
   4939c:	61 00 00 54	b.ne	0x493a8
   493a0:	bf 02 01 eb	cmp	x21, x1
   493a4:	e0 00 00 54	b.eq	0x493c0
   493a8:	e0 03 14 aa	mov	x0, x20
   493ac:	e2 03 16 aa	mov	x2, x22
   493b0:	e3 03 15 aa	mov	x3, x21
   493b4:	04 00 80 52	mov	w4, #0x0
   493b8:	e8 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   493bc:	60 00 00 36	tbz	w0, #0x0, 0x493c8
   493c0:	cb 94 ff 97	bl	_$s16AsideNativeSwift14cmdSessionReadSSyF
   493c4:	00 ff ff 17	b	0x48fc4
   493c8:	61 8c 8d d2	mov	x1, #0x6c63
   493cc:	a1 2c ac f2	movk	x1, #0x6165, lsl #16
   493d0:	41 0e c0 f2	movk	x1, #0x72, lsl #32
   493d4:	01 a0 fd f2	movk	x1, #0xed00, lsl #48
   493d8:	df 02 14 eb	cmp	x22, x20
   493dc:	61 00 00 54	b.ne	0x493e8
   493e0:	bf 02 01 eb	cmp	x21, x1
   493e4:	e0 00 00 54	b.eq	0x49400
   493e8:	e0 03 14 aa	mov	x0, x20
   493ec:	e2 03 16 aa	mov	x2, x22
   493f0:	e3 03 15 aa	mov	x3, x21
   493f4:	04 00 80 52	mov	w4, #0x0
   493f8:	d8 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   493fc:	60 00 00 36	tbz	w0, #0x0, 0x49408
   49400:	85 95 ff 97	bl	_$s16AsideNativeSwift15cmdSessionClearSSyF
   49404:	f0 fe ff 17	b	0x48fc4
   49408:	21 cc 8e d2	mov	x1, #0x7661
   4940c:	a1 0c a0 f2	movk	x1, #0x65, lsl #16
   49410:	01 60 fd f2	movk	x1, #0xeb00, lsl #48
   49414:	60 ae 8c d2	mov	x0, #0x6573
   49418:	60 ac ae f2	movk	x0, #0x7563, lsl #16
   4941c:	40 ae cc f2	movk	x0, #0x6572, lsl #32
   49420:	a0 65 ee f2	movk	x0, #0x732d, lsl #48
   49424:	df 02 00 eb	cmp	x22, x0
   49428:	61 00 00 54	b.ne	0x49434
   4942c:	bf 02 01 eb	cmp	x21, x1
   49430:	c0 00 00 54	b.eq	0x49448
   49434:	e2 03 16 aa	mov	x2, x22
   49438:	e3 03 15 aa	mov	x3, x21
   4943c:	04 00 80 52	mov	w4, #0x0
   49440:	c6 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49444:	80 00 00 36	tbz	w0, #0x0, 0x49454
   49448:	a9 98 ff 97	bl	_$s16AsideNativeSwift13cmdSecureSaveSSyF
   4944c:	de fe ff 17	b	0x48fc4
   49450:	ad 2f 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
   49454:	a1 2c 8c d2	mov	x1, #0x6165
   49458:	81 0c a0 f2	movk	x1, #0x64, lsl #16
   4945c:	01 60 fd f2	movk	x1, #0xeb00, lsl #48
   49460:	60 ae 8c d2	mov	x0, #0x6573
   49464:	60 ac ae f2	movk	x0, #0x7563, lsl #16
   49468:	40 ae cc f2	movk	x0, #0x6572, lsl #32
   4946c:	a0 45 ee f2	movk	x0, #0x722d, lsl #48
   49470:	df 02 00 eb	cmp	x22, x0
   49474:	61 00 00 54	b.ne	0x49480
   49478:	bf 02 01 eb	cmp	x21, x1
   4947c:	c0 00 00 54	b.eq	0x49494
   49480:	e2 03 16 aa	mov	x2, x22
   49484:	e3 03 15 aa	mov	x3, x21
   49488:	04 00 80 52	mov	w4, #0x0
   4948c:	b3 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49490:	60 00 00 36	tbz	w0, #0x0, 0x4949c
   49494:	1d 9a ff 97	bl	_$s16AsideNativeSwift13cmdSecureReadSSyF
   49498:	cb fe ff 17	b	0x48fc4
   4949c:	81 ad 8c d2	mov	x1, #0x656c
   494a0:	21 4c ae f2	movk	x1, #0x7261, lsl #16
   494a4:	01 80 fd f2	movk	x1, #0xec00, lsl #48
   494a8:	60 ae 8c d2	mov	x0, #0x6573
   494ac:	60 ac ae f2	movk	x0, #0x7563, lsl #16
   494b0:	40 ae cc f2	movk	x0, #0x6572, lsl #32
   494b4:	a0 65 ec f2	movk	x0, #0x632d, lsl #48
   494b8:	df 02 00 eb	cmp	x22, x0
   494bc:	61 00 00 54	b.ne	0x494c8
   494c0:	bf 02 01 eb	cmp	x21, x1
   494c4:	c0 00 00 54	b.eq	0x494dc
   494c8:	e2 03 16 aa	mov	x2, x22
   494cc:	e3 03 15 aa	mov	x3, x21
   494d0:	04 00 80 52	mov	w4, #0x0
   494d4:	a1 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   494d8:	60 00 00 36	tbz	w0, #0x0, 0x494e4
   494dc:	7c 9b ff 97	bl	_$s16AsideNativeSwift14cmdSecureClearSSyF
   494e0:	b9 fe ff 17	b	0x48fc4
   494e4:	21 cd 8d d2	mov	x1, #0x6e69
   494e8:	21 8d ae f2	movk	x1, #0x7469, lsl #16
   494ec:	01 80 fd f2	movk	x1, #0xec00, lsl #48
   494f0:	34 cd 8d d2	mov	x20, #0x6e69
   494f4:	74 8e ae f2	movk	x20, #0x7473, lsl #16
   494f8:	34 8c cd f2	movk	x20, #0x6c61, lsl #32
   494fc:	94 ad e5 f2	movk	x20, #0x2d6c, lsl #48
   49500:	df 02 14 eb	cmp	x22, x20
   49504:	61 00 00 54	b.ne	0x49510
   49508:	bf 02 01 eb	cmp	x21, x1
   4950c:	00 03 00 54	b.eq	0x4956c
   49510:	e0 03 14 aa	mov	x0, x20
   49514:	e2 03 16 aa	mov	x2, x22
   49518:	e3 03 15 aa	mov	x3, x21
   4951c:	04 00 80 52	mov	w4, #0x0
   49520:	8e 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49524:	40 02 00 37	tbnz	w0, #0x0, 0x4956c
   49528:	78 0e 80 d2	mov	x24, #0x73
   4952c:	18 20 fd f2	movk	x24, #0xe900, lsl #48
   49530:	20 cd 8d d2	mov	x0, #0x6e69
   49534:	20 8d ae f2	movk	x0, #0x7469, lsl #16
   49538:	a0 65 cd f2	movk	x0, #0x6b2d, lsl #32
   4953c:	a0 2c ef f2	movk	x0, #0x7965, lsl #48
   49540:	df 02 00 eb	cmp	x22, x0
   49544:	61 00 00 54	b.ne	0x49550
   49548:	bf 02 18 eb	cmp	x21, x24
   4954c:	00 01 00 54	b.eq	0x4956c
   49550:	61 0e 80 d2	mov	x1, #0x73
   49554:	01 20 fd f2	movk	x1, #0xe900, lsl #48
   49558:	e2 03 16 aa	mov	x2, x22
   4955c:	e3 03 15 aa	mov	x3, x21
   49560:	04 00 80 52	mov	w4, #0x0
   49564:	7d 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49568:	60 00 00 36	tbz	w0, #0x0, 0x49574
   4956c:	22 ae ff 97	bl	_$s16AsideNativeSwift14cmdInstallInitSSyF
   49570:	95 fe ff 17	b	0x48fc4
   49574:	61 8e 8e d2	mov	x1, #0x7473
   49578:	21 8c ae f2	movk	x1, #0x7461, lsl #16
   4957c:	a1 6e ce f2	movk	x1, #0x7375, lsl #32
   49580:	01 c0 fd f2	movk	x1, #0xee00, lsl #48
   49584:	df 02 14 eb	cmp	x22, x20
   49588:	61 00 00 54	b.ne	0x49594
   4958c:	bf 02 01 eb	cmp	x21, x1
   49590:	00 03 00 54	b.eq	0x495f0
   49594:	e0 03 14 aa	mov	x0, x20
   49598:	e2 03 16 aa	mov	x2, x22
   4959c:	e3 03 15 aa	mov	x3, x21
   495a0:	04 00 80 52	mov	w4, #0x0
   495a4:	6d 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   495a8:	40 02 00 37	tbnz	w0, #0x0, 0x495f0
   495ac:	97 ae 8e d2	mov	x23, #0x7574
   495b0:	77 0e a0 f2	movk	x23, #0x73, lsl #16
   495b4:	17 60 fd f2	movk	x23, #0xeb00, lsl #48
   495b8:	60 ad 8c d2	mov	x0, #0x656b
   495bc:	20 6f ae f2	movk	x0, #0x7379, lsl #16
   495c0:	a0 65 ce f2	movk	x0, #0x732d, lsl #32
   495c4:	80 2e ec f2	movk	x0, #0x6174, lsl #48
   495c8:	df 02 00 eb	cmp	x22, x0
   495cc:	61 00 00 54	b.ne	0x495d8
   495d0:	bf 02 17 eb	cmp	x21, x23
   495d4:	e0 00 00 54	b.eq	0x495f0
   495d8:	e1 03 17 aa	mov	x1, x23
   495dc:	e2 03 16 aa	mov	x2, x22
   495e0:	e3 03 15 aa	mov	x3, x21
   495e4:	04 00 80 52	mov	w4, #0x0
   495e8:	5c 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   495ec:	60 00 00 36	tbz	w0, #0x0, 0x495f8
   495f0:	e8 c4 ff 97	bl	_$s16AsideNativeSwift16cmdInstallStatusSSyF
   495f4:	74 fe ff 17	b	0x48fc4
   495f8:	39 02 80 d2	mov	x25, #0x11
   495fc:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   49600:	88 26 00 b0	adrp	x8, 1233 ; 0x51a000
   49604:	08 c1 09 91	add	x8, x8, #0x270 ; literal pool for: "install-meta-read"
   49608:	08 81 00 d1	sub	x8, x8, #0x20
   4960c:	01 01 41 b2	orr	x1, x8, #0x8000000000000000
   49610:	df 02 19 eb	cmp	x22, x25
   49614:	61 00 00 54	b.ne	0x49620
   49618:	3f 00 15 eb	cmp	x1, x21
   4961c:	00 01 00 54	b.eq	0x4963c
   49620:	20 02 80 d2	mov	x0, #0x11
   49624:	00 00 fa f2	movk	x0, #0xd000, lsl #48
   49628:	e2 03 16 aa	mov	x2, x22
   4962c:	e3 03 15 aa	mov	x3, x21
   49630:	04 00 80 52	mov	w4, #0x0
   49634:	49 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49638:	60 00 00 36	tbz	w0, #0x0, 0x49644
   4963c:	09 c8 ff 97	bl	_$s16AsideNativeSwift18cmdInstallMetaReadSSyF
   49640:	61 fe ff 17	b	0x48fc4
   49644:	80 6c 8d d2	mov	x0, #0x6b64
   49648:	a0 a5 ae f2	movk	x0, #0x752d, lsl #16
   4964c:	c0 ed ce f2	movk	x0, #0x776e, lsl #32
   49650:	40 2e ec f2	movk	x0, #0x6172, lsl #48
   49654:	01 0f 00 d1	sub	x1, x24, #0x3
   49658:	df 02 00 eb	cmp	x22, x0
   4965c:	61 00 00 54	b.ne	0x49668
   49660:	bf 02 01 eb	cmp	x21, x1
   49664:	c0 00 00 54	b.eq	0x4967c
   49668:	e2 03 16 aa	mov	x2, x22
   4966c:	e3 03 15 aa	mov	x3, x21
   49670:	04 00 80 52	mov	w4, #0x0
   49674:	39 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49678:	60 00 00 36	tbz	w0, #0x0, 0x49684
   4967c:	86 c9 ff 97	bl	_$s16AsideNativeSwift11cmdDkUnwrapSSyF
   49680:	51 fe ff 17	b	0x48fc4
   49684:	60 8c 8c d2	mov	x0, #0x6463
   49688:	00 ae a5 f2	movk	x0, #0x2d70, lsl #16
   4968c:	60 2e cd f2	movk	x0, #0x6973, lsl #32
   49690:	e0 cc ed f2	movk	x0, #0x6e67, lsl #48
   49694:	df 02 00 eb	cmp	x22, x0
   49698:	81 00 00 54	b.ne	0x496a8
   4969c:	08 00 fd d2	mov	x8, #-0x1800000000000000
   496a0:	bf 02 08 eb	cmp	x21, x8
   496a4:	e0 00 00 54	b.eq	0x496c0
   496a8:	01 00 fd d2	mov	x1, #-0x1800000000000000
   496ac:	e2 03 16 aa	mov	x2, x22
   496b0:	e3 03 15 aa	mov	x3, x21
   496b4:	04 00 80 52	mov	w4, #0x0
   496b8:	28 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   496bc:	60 00 00 36	tbz	w0, #0x0, 0x496c8
   496c0:	a8 da ff 97	bl	_$s16AsideNativeSwift10cmdCdpSignSSyF
   496c4:	40 fe ff 17	b	0x48fc4
   496c8:	21 6d 8c d2	mov	x1, #0x6369
   496cc:	a1 65 ad f2	movk	x1, #0x6b2d, lsl #16
   496d0:	a1 2c cf f2	movk	x1, #0x7965, lsl #32
   496d4:	61 ee fd f2	movk	x1, #0xef73, lsl #48
   496d8:	e0 ac 8c d2	mov	x0, #0x6567
   496dc:	80 ae a5 f2	movk	x0, #0x2d74, lsl #16
   496e0:	00 ae ce f2	movk	x0, #0x7570, lsl #32
   496e4:	40 8c ed f2	movk	x0, #0x6c62, lsl #48
   496e8:	df 02 00 eb	cmp	x22, x0
   496ec:	61 00 00 54	b.ne	0x496f8
   496f0:	bf 02 01 eb	cmp	x21, x1
   496f4:	80 02 00 54	b.eq	0x49744
   496f8:	e2 03 16 aa	mov	x2, x22
   496fc:	e3 03 15 aa	mov	x3, x21
   49700:	04 00 80 52	mov	w4, #0x0
   49704:	15 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49708:	e0 01 00 37	tbnz	w0, #0x0, 0x49744
   4970c:	00 ae 8e d2	mov	x0, #0x7570
   49710:	40 8c ad f2	movk	x0, #0x6c62, lsl #16
   49714:	20 6d cc f2	movk	x0, #0x6369, lsl #32
   49718:	a0 65 ed f2	movk	x0, #0x6b2d, lsl #48
   4971c:	e1 c6 0f 91	add	x1, x23, #0x3f1
   49720:	df 02 00 eb	cmp	x22, x0
   49724:	61 00 00 54	b.ne	0x49730
   49728:	bf 02 01 eb	cmp	x21, x1
   4972c:	c0 00 00 54	b.eq	0x49744
   49730:	e2 03 16 aa	mov	x2, x22
   49734:	e3 03 15 aa	mov	x3, x21
   49738:	04 00 80 52	mov	w4, #0x0
   4973c:	07 2c 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49740:	60 00 00 36	tbz	w0, #0x0, 0x4974c
   49744:	5e e0 ff 97	bl	_$s16AsideNativeSwift16cmdGetPublicKeysSSyF
   49748:	1f fe ff 17	b	0x48fc4
   4974c:	81 ac 8c d2	mov	x1, #0x6564
   49750:	61 8e ae f2	movk	x1, #0x7473, lsl #16
   49754:	41 ee cd f2	movk	x1, #0x6f72, lsl #32
   49758:	21 ef fd f2	movk	x1, #0xef79, lsl #48
   4975c:	df 02 14 eb	cmp	x22, x20
   49760:	61 00 00 54	b.ne	0x4976c
   49764:	bf 02 01 eb	cmp	x21, x1
   49768:	e0 02 00 54	b.eq	0x497c4
   4976c:	e0 03 14 aa	mov	x0, x20
   49770:	e2 03 16 aa	mov	x2, x22
   49774:	e3 03 15 aa	mov	x3, x21
   49778:	04 00 80 52	mov	w4, #0x0
   4977c:	f7 2b 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49780:	20 02 00 37	tbnz	w0, #0x0, 0x497c4
   49784:	61 ad 8c d2	mov	x1, #0x656b
   49788:	21 6f ae f2	movk	x1, #0x7379, lsl #16
   4978c:	01 80 fd f2	movk	x1, #0xec00, lsl #48
   49790:	80 ac 8c d2	mov	x0, #0x6564
   49794:	60 8e ae f2	movk	x0, #0x7473, lsl #16
   49798:	40 ee cd f2	movk	x0, #0x6f72, lsl #32
   4979c:	20 af e5 f2	movk	x0, #0x2d79, lsl #48
   497a0:	df 02 00 eb	cmp	x22, x0
   497a4:	61 00 00 54	b.ne	0x497b0
   497a8:	bf 02 01 eb	cmp	x21, x1
   497ac:	c0 00 00 54	b.eq	0x497c4
   497b0:	e2 03 16 aa	mov	x2, x22
   497b4:	e3 03 15 aa	mov	x3, x21
   497b8:	04 00 80 52	mov	w4, #0x0
   497bc:	e7 2b 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   497c0:	60 00 00 36	tbz	w0, #0x0, 0x497cc
   497c4:	53 e6 ff 97	bl	_$s16AsideNativeSwift17cmdInstallDestroySSyF
   497c8:	ff fd ff 17	b	0x48fc4
   497cc:	88 26 00 b0	adrp	x8, 1233 ; 0x51a000
   497d0:	08 41 0a 91	add	x8, x8, #0x290 ; literal pool for: "generate-thumbnail"
   497d4:	08 81 00 d1	sub	x8, x8, #0x20
   497d8:	01 01 41 b2	orr	x1, x8, #0x8000000000000000
   497dc:	20 07 00 91	add	x0, x25, #0x1
   497e0:	df 02 00 eb	cmp	x22, x0
   497e4:	61 00 00 54	b.ne	0x497f0
   497e8:	3f 00 15 eb	cmp	x1, x21
   497ec:	c0 00 00 54	b.eq	0x49804
   497f0:	e2 03 16 aa	mov	x2, x22
   497f4:	e3 03 15 aa	mov	x3, x21
   497f8:	04 00 80 52	mov	w4, #0x0
   497fc:	d7 2b 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49800:	60 00 00 36	tbz	w0, #0x0, 0x4980c
   49804:	49 ec ff 97	bl	_$s16AsideNativeSwift20cmdGenerateThumbnailSSyF
   49808:	ef fd ff 17	b	0x48fc4
   4980c:	c1 ad 85 d2	mov	x1, #0x2d6e
   49810:	21 0c ae f2	movk	x1, #0x7061, lsl #16
   49814:	01 6e ce f2	movk	x1, #0x7370, lsl #32
   49818:	01 c0 fd f2	movk	x1, #0xee00, lsl #48
   4981c:	80 2d 8d d2	mov	x0, #0x696c
   49820:	60 8e ae f2	movk	x0, #0x7473, lsl #16
   49824:	a0 e5 cd f2	movk	x0, #0x6f2d, lsl #32
   49828:	00 ae ec f2	movk	x0, #0x6570, lsl #48
   4982c:	df 02 00 eb	cmp	x22, x0
   49830:	61 00 00 54	b.ne	0x4983c
   49834:	bf 02 01 eb	cmp	x21, x1
   49838:	c0 00 00 54	b.eq	0x49850
   4983c:	e2 03 16 aa	mov	x2, x22
   49840:	e3 03 15 aa	mov	x3, x21
   49844:	04 00 80 52	mov	w4, #0x0
   49848:	c4 2b 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   4984c:	60 00 00 36	tbz	w0, #0x0, 0x49858
   49850:	28 ef ff 97	bl	_$s16AsideNativeSwift15cmdListOpenAppsSSyF
   49854:	dc fd ff 17	b	0x48fc4
   49858:	20 0c 8e d2	mov	x0, #0x7061
   4985c:	00 ae a5 f2	movk	x0, #0x2d70, lsl #16
   49860:	20 6d cc f2	movk	x0, #0x6369, lsl #32
   49864:	e0 cd ed f2	movk	x0, #0x6e6f, lsl #48
   49868:	df 02 00 eb	cmp	x22, x0
   4986c:	61 00 00 54	b.ne	0x49878
   49870:	bf 02 18 eb	cmp	x21, x24
   49874:	00 01 00 54	b.eq	0x49894
   49878:	61 0e 80 d2	mov	x1, #0x73
   4987c:	01 20 fd f2	movk	x1, #0xe900, lsl #48
   49880:	e2 03 16 aa	mov	x2, x22
   49884:	e3 03 15 aa	mov	x3, x21
   49888:	04 00 80 52	mov	w4, #0x0
   4988c:	b3 2b 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49890:	60 00 00 36	tbz	w0, #0x0, 0x4989c
   49894:	4f f5 ff 97	bl	_$s16AsideNativeSwift11cmdAppIconsSSyF
   49898:	cb fd ff 17	b	0x48fc4
   4989c:	60 ec 8d d2	mov	x0, #0x6f63
   498a0:	00 2e af f2	movk	x0, #0x7970, lsl #16
   498a4:	a0 c5 cc f2	movk	x0, #0x662d, lsl #32
   498a8:	20 8d ed f2	movk	x0, #0x6c69, lsl #48
   498ac:	01 3b 00 d1	sub	x1, x24, #0xe
   498b0:	df 02 00 eb	cmp	x22, x0
   498b4:	61 00 00 54	b.ne	0x498c0
   498b8:	bf 02 01 eb	cmp	x21, x1
   498bc:	c0 00 00 54	b.eq	0x498d4
   498c0:	e2 03 16 aa	mov	x2, x22
   498c4:	e3 03 15 aa	mov	x3, x21
   498c8:	04 00 80 52	mov	w4, #0x0
   498cc:	a3 2b 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   498d0:	60 00 00 36	tbz	w0, #0x0, 0x498dc
   498d4:	62 f7 ff 97	bl	_$s16AsideNativeSwift11cmdCopyFileSSyF
   498d8:	bb fd ff 17	b	0x48fc4
   498dc:	e0 0d 8e d2	mov	x0, #0x706f
   498e0:	a0 cc ad f2	movk	x0, #0x6e65, lsl #16
   498e4:	a0 e5 ce f2	movk	x0, #0x772d, lsl #32
   498e8:	20 8d ee f2	movk	x0, #0x7469, lsl #48
   498ec:	01 2f 00 d1	sub	x1, x24, #0xb
   498f0:	df 02 00 eb	cmp	x22, x0
   498f4:	61 00 00 54	b.ne	0x49900
   498f8:	bf 02 01 eb	cmp	x21, x1
   498fc:	c0 00 00 54	b.eq	0x49914
   49900:	e2 03 16 aa	mov	x2, x22
   49904:	e3 03 15 aa	mov	x3, x21
   49908:	04 00 80 52	mov	w4, #0x0
   4990c:	93 2b 13 94	bl	0x514758 ; symbol stub for: _$ss27_stringCompareWithSmolCheck__9expectingSbs11_StringGutsV_ADs01_G16ComparisonResultOtF
   49910:	60 00 00 36	tbz	w0, #0x0, 0x4991c
   49914:	8f f9 ff 97	bl	_$s16AsideNativeSwift11cmdOpenWithSSyF
   49918:	ab fd ff 17	b	0x48fc4
   4991c:	88 26 00 b0	adrp	x8, 1233 ; 0x51a000
   49920:	08 c1 0a 91	add	x8, x8, #0x2b0 ; literal pool for: "Unknown command: "
   49924:	08 81 00 d1	sub	x8, x8, #0x20
   49928:	08 01 41 b2	orr	x8, x8, #0x8000000000000000
   4992c:	b9 a3 30 a9	stp	x25, x8, [x29, #-0xf8]
   49930:	b4 e3 03 d1	sub	x20, x29, #0xf8
   49934:	e0 03 16 aa	mov	x0, x22
   49938:	e1 03 15 aa	mov	x1, x21
   4993c:	0c 2b 13 94	bl	0x51456c ; symbol stub for: _$sSS6appendyySSF
   49940:	b6 d3 70 a9	ldp	x22, x20, [x29, #-0xf8]
   49944:	c0 37 00 90	adrp	x0, 1784 ; 0x741000
   49948:	00 c0 12 91	add	x0, x0, #0x4b0
   4994c:	01 27 00 b0	adrp	x1, 1249 ; 0x52a000
   49950:	21 a0 1c 91	add	x1, x1, #0x728
   49954:	d6 6a ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   49958:	a1 63 02 d1	sub	x1, x29, #0x98
   4995c:	4a 30 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   49960:	f5 03 00 aa	mov	x21, x0
   49964:	08 27 00 b0	adrp	x8, 1249 ; 0x52a000
   49968:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   4996c:	00 04 80 3d	str	q0, [x0, #0x10]
   49970:	a8 4c 8e d2	mov	x8, #0x7265
   49974:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   49978:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   4997c:	f7 03 00 aa	mov	x23, x0
   49980:	e8 0e 02 f8	str	x8, [x23, #0x20]!
   49984:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   49988:	d8 36 00 f0	adrp	x24, 1755 ; 0x724000
   4998c:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   49990:	18 24 00 f9	str	x24, [x0, #0x48]
   49994:	08 d8 02 a9	stp	x8, x22, [x0, #0x28]
   49998:	14 1c 00 f9	str	x20, [x0, #0x38]
   4999c:	e0 03 14 aa	mov	x0, x20
   499a0:	15 30 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   499a4:	e0 03 15 aa	mov	x0, x21
   499a8:	5b 0f 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   499ac:	f6 03 00 aa	mov	x22, x0
   499b0:	e0 03 15 aa	mov	x0, x21
   499b4:	49 30 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   499b8:	c1 37 00 90	adrp	x1, 1784 ; 0x741000
   499bc:	21 e0 12 91	add	x1, x1, #0x4b8
   499c0:	02 27 00 b0	adrp	x2, 1249 ; 0x52a000
   499c4:	42 c0 1c 91	add	x2, x2, #0x730
   499c8:	e0 03 17 aa	mov	x0, x23
   499cc:	11 18 00 94	bl	_$sypSgWOhTm
   499d0:	c8 37 00 90	adrp	x8, 1784 ; 0x741000
   499d4:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   499d8:	5f 2f 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   499dc:	f5 03 00 aa	mov	x21, x0
   499e0:	c8 36 00 f0	adrp	x8, 1755 ; 0x724000
   499e4:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   499e8:	c3 36 00 f0	adrp	x3, 1755 ; 0x724000
   499ec:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   499f0:	02 21 00 91	add	x2, x8, #0x8
   499f4:	e0 03 16 aa	mov	x0, x22
   499f8:	e1 03 18 aa	mov	x1, x24
   499fc:	bb 2a 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   49a00:	f7 03 00 aa	mov	x23, x0
   49a04:	bf 83 10 f8	stur	xzr, [x29, #-0xf8]
   49a08:	a4 e3 03 d1	sub	x4, x29, #0xf8
   49a0c:	e0 03 15 aa	mov	x0, x21
   49a10:	e2 03 17 aa	mov	x2, x23
   49a14:	03 00 80 d2	mov	x3, #0x0
   49a18:	a2 36 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   49a1c:	fd 03 1d aa	mov	x29, x29
   49a20:	56 2f 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   49a24:	f5 03 00 aa	mov	x21, x0
   49a28:	e0 03 17 aa	mov	x0, x23
   49a2c:	4d 2f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   49a30:	a0 83 50 f8	ldur	x0, [x29, #-0xf8]
   49a34:	4e 2f 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   49a38:	35 03 00 b4	cbz	x21, 0x49a9c
   49a3c:	e0 03 15 aa	mov	x0, x21
   49a40:	c9 29 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   49a44:	f7 03 00 aa	mov	x23, x0
   49a48:	f8 03 01 aa	mov	x24, x1
   49a4c:	e0 03 15 aa	mov	x0, x21
   49a50:	44 2f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   49a54:	e8 03 13 aa	mov	x8, x19
   49a58:	b9 2a 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   49a5c:	e0 03 17 aa	mov	x0, x23
   49a60:	e1 03 18 aa	mov	x1, x24
   49a64:	e2 03 13 aa	mov	x2, x19
   49a68:	b2 2a 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   49a6c:	f3 03 00 aa	mov	x19, x0
   49a70:	f5 03 01 aa	mov	x21, x1
   49a74:	e0 03 17 aa	mov	x0, x23
   49a78:	e1 03 18 aa	mov	x1, x24
   49a7c:	07 0f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   49a80:	15 02 00 b4	cbz	x21, 0x49ac0
   49a84:	f7 03 15 aa	mov	x23, x21
   49a88:	e0 03 16 aa	mov	x0, x22
   49a8c:	d4 2f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   49a90:	e0 03 14 aa	mov	x0, x20
   49a94:	d2 2f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   49a98:	13 00 00 14	b	0x49ae4
   49a9c:	f7 03 00 aa	mov	x23, x0
   49aa0:	75 29 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   49aa4:	f3 03 00 aa	mov	x19, x0
   49aa8:	e0 03 17 aa	mov	x0, x23
   49aac:	2d 2f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   49ab0:	f5 03 13 aa	mov	x21, x19
   49ab4:	12 30 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   49ab8:	e0 03 13 aa	mov	x0, x19
   49abc:	dd 2f 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   49ac0:	e0 03 16 aa	mov	x0, x22
   49ac4:	c6 2f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   49ac8:	e0 03 14 aa	mov	x0, x20
   49acc:	c4 2f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   49ad0:	88 26 00 90	adrp	x8, 1232 ; 0x519000
   49ad4:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   49ad8:	08 81 00 d1	sub	x8, x8, #0x20
   49adc:	17 01 41 b2	orr	x23, x8, #0x8000000000000000
   49ae0:	33 53 00 91	add	x19, x25, #0x14
   49ae4:	c0 36 00 f0	adrp	x0, 1755 ; 0x724000
   49ae8:	00 6c 41 f9	ldr	x0, [x0, #0x2d8] ; literal pool symbol address: __swiftEmptyArrayStorage
   49aec:	84 6a ff 97	bl	_$s16AsideNativeSwift16nativeInputLinesSaySSGvs
   49af0:	f4 03 17 aa	mov	x20, x23
   49af4:	39 fd ff 17	b	0x48fd8
