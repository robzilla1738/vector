/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_19FromUtf16EPKtm:
    400c:	ff c3 04 d1	sub	sp, sp, #0x130
    4010:	fc 6f 11 a9	stp	x28, x27, [sp, #0x110]
    4014:	fd 7b 12 a9	stp	x29, x30, [sp, #0x120]
    4018:	fd 83 04 91	add	x29, sp, #0x120
    401c:	e8 0b 00 f9	str	x8, [sp, #0x10]
    4020:	09 39 00 90	adrp	x9, 1824 ; 0x724000
    4024:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
    4028:	29 01 40 f9	ldr	x9, [x9]
    402c:	a9 83 1e f8	stur	x9, [x29, #-0x18]
    4030:	e8 23 00 f9	str	x8, [sp, #0x40]
    4034:	e0 1f 00 f9	str	x0, [sp, #0x38]
    4038:	e1 1b 00 f9	str	x1, [sp, #0x30]
    403c:	e8 1f 40 f9	ldr	x8, [sp, #0x38]
    4040:	e8 17 00 f9	str	x8, [sp, #0x28]
    4044:	e0 23 01 91	add	x0, sp, #0x48
    4048:	68 15 00 94	bl	__ZNSt3__115wstring_convertINS_18codecvt_utf8_utf16IDsLm1114111ELNS_12codecvt_modeE0EEEDsNS_9allocatorIDsEENS4_IcEEEC1B9nqe210106Ev
    404c:	01 00 00 14	b	0x4050
    4050:	e8 0b 40 f9	ldr	x8, [sp, #0x10]
    4054:	e1 17 40 f9	ldr	x1, [sp, #0x28]
    4058:	e9 17 40 f9	ldr	x9, [sp, #0x28]
    405c:	ea 1b 40 f9	ldr	x10, [sp, #0x30]
    4060:	22 05 0a 8b	add	x2, x9, x10, lsl #1
    4064:	e0 23 01 91	add	x0, sp, #0x48
    4068:	7c 15 00 94	bl	__ZNSt3__115wstring_convertINS_18codecvt_utf8_utf16IDsLm1114111ELNS_12codecvt_modeE0EEEDsNS_9allocatorIDsEENS4_IcEEE8to_bytesEPKDsS9_
    406c:	01 00 00 14	b	0x4070
    4070:	e0 23 01 91	add	x0, sp, #0x48
    4074:	f7 16 00 94	bl	__ZNSt3__115wstring_convertINS_18codecvt_utf8_utf16IDsLm1114111ELNS_12codecvt_modeE0EEEDsNS_9allocatorIDsEENS4_IcEEED1Ev
    4078:	a9 83 5e f8	ldur	x9, [x29, #-0x18]
    407c:	08 39 00 90	adrp	x8, 1824 ; 0x724000
    4080:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
    4084:	08 01 40 f9	ldr	x8, [x8]
    4088:	08 01 09 eb	subs	x8, x8, x9
    408c:	60 00 00 54	b.eq	0x4098
    4090:	01 00 00 14	b	0x4094
    4094:	9c 44 14 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
    4098:	fd 7b 52 a9	ldp	x29, x30, [sp, #0x120]
    409c:	fc 6f 51 a9	ldp	x28, x27, [sp, #0x110]
    40a0:	ff c3 04 91	add	sp, sp, #0x130
    40a4:	c0 03 5f d6	ret
    40a8:	e0 13 00 f9	str	x0, [sp, #0x20]
    40ac:	e8 03 01 aa	mov	x8, x1
    40b0:	e8 1f 00 b9	str	w8, [sp, #0x1c]
    40b4:	e0 23 01 91	add	x0, sp, #0x48
    40b8:	e6 16 00 94	bl	__ZNSt3__115wstring_convertINS_18codecvt_utf8_utf16IDsLm1114111ELNS_12codecvt_modeE0EEEDsNS_9allocatorIDsEENS4_IcEEED1Ev
    40bc:	01 00 00 14	b	0x40c0
    40c0:	e0 13 40 f9	ldr	x0, [sp, #0x20]
    40c4:	e0 07 00 f9	str	x0, [sp, #0x8]
    40c8:	03 00 00 14	b	0x40d4
    40cc:	e0 07 00 f9	str	x0, [sp, #0x8]
    40d0:	01 00 00 14	b	0x40d4
    40d4:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    40d8:	3f 42 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
