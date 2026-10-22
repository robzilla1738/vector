/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_18WritePngERKNSt3__14__fs10filesystem4pathEP15fpdf_bitmap_t__ii:
   1deb4:	fc 6f be a9	stp	x28, x27, [sp, #-0x20]!
   1deb8:	fd 7b 01 a9	stp	x29, x30, [sp, #0x10]
   1debc:	fd 43 00 91	add	x29, sp, #0x10
   1dec0:	ff 43 11 d1	sub	sp, sp, #0x450
   1dec4:	28 38 00 f0	adrp	x8, 1799 ; 0x724000
   1dec8:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   1decc:	08 01 40 f9	ldr	x8, [x8]
   1ded0:	a8 83 1e f8	stur	x8, [x29, #-0x18]
   1ded4:	e0 03 01 f9	str	x0, [sp, #0x200]
   1ded8:	e1 ff 00 f9	str	x1, [sp, #0x1f8]
   1dedc:	e2 f7 01 b9	str	w2, [sp, #0x1f4]
   1dee0:	e3 f3 01 b9	str	w3, [sp, #0x1f0]
   1dee4:	e0 ff 40 f9	ldr	x0, [sp, #0x1f8]
   1dee8:	11 a8 05 94	bl	_FPDFBitmap_GetBuffer
   1deec:	e0 53 00 f9	str	x0, [sp, #0xa0]
   1def0:	01 00 00 14	b	0x1def4
   1def4:	e8 53 40 f9	ldr	x8, [sp, #0xa0]
   1def8:	e8 f7 00 f9	str	x8, [sp, #0x1e8]
   1defc:	e0 ff 40 f9	ldr	x0, [sp, #0x1f8]
   1df00:	5a a8 05 94	bl	_FPDFBitmap_GetStride
   1df04:	e0 9f 00 b9	str	w0, [sp, #0x9c]
   1df08:	01 00 00 14	b	0x1df0c
   1df0c:	e8 9f 40 b9	ldr	w8, [sp, #0x9c]
   1df10:	e8 e7 01 b9	str	w8, [sp, #0x1e4]
   1df14:	e8 f7 40 f9	ldr	x8, [sp, #0x1e8]
   1df18:	e8 00 00 b4	cbz	x8, 0x1df34
   1df1c:	01 00 00 14	b	0x1df20
   1df20:	e8 e7 41 b9	ldr	w8, [sp, #0x1e4]
   1df24:	e9 f7 41 b9	ldr	w9, [sp, #0x1f4]
   1df28:	08 09 09 6b	subs	w8, w8, w9, lsl #2
   1df2c:	0a 03 00 54	b.ge	0x1df8c
   1df30:	01 00 00 14	b	0x1df34
   1df34:	00 02 80 d2	mov	x0, #0x10
   1df38:	b7 dc 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1df3c:	e0 4b 00 f9	str	x0, [sp, #0x90]
   1df40:	e1 27 00 90	adrp	x1, 1276 ; 0x519000
   1df44:	21 c8 14 91	add	x1, x1, #0x532 ; literal pool for: "Failed to read rendered PDF bitmap"
   1df48:	c7 da 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   1df4c:	01 00 00 14	b	0x1df50
   1df50:	e0 4b 40 f9	ldr	x0, [sp, #0x90]
   1df54:	21 38 00 f0	adrp	x1, 1799 ; 0x724000
   1df58:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1df5c:	22 38 00 f0	adrp	x2, 1799 ; 0x724000
   1df60:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1df64:	c7 dc 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1df68:	01 00 00 14	b	0x1df6c
   1df6c:	20 00 20 d4	brk	#0x1
   1df70:	e8 03 00 aa	mov	x8, x0
   1df74:	e0 4b 40 f9	ldr	x0, [sp, #0x90]
   1df78:	e8 ef 00 f9	str	x8, [sp, #0x1d8]
   1df7c:	e8 03 01 aa	mov	x8, x1
   1df80:	e8 d7 01 b9	str	w8, [sp, #0x1d4]
   1df84:	b3 dc 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1df88:	70 01 00 14	b	0x1e548
   1df8c:	e8 f3 81 b9	ldrsw	x8, [sp, #0x1f0]
   1df90:	e9 f7 81 b9	ldrsw	x9, [sp, #0x1f4]
   1df94:	29 f5 7e d3	lsl	x9, x9, #2
   1df98:	29 05 00 91	add	x9, x9, #0x1
   1df9c:	01 7d 09 9b	mul	x1, x8, x9
   1dfa0:	e0 e3 06 91	add	x0, sp, #0x1b8
   1dfa4:	d9 02 00 94	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEEC1B9nqe210106Em
   1dfa8:	01 00 00 14	b	0x1dfac
   1dfac:	ff db 00 f9	str	xzr, [sp, #0x1b0]
   1dfb0:	ff af 01 b9	str	wzr, [sp, #0x1ac]
   1dfb4:	01 00 00 14	b	0x1dfb8
   1dfb8:	e8 af 41 b9	ldr	w8, [sp, #0x1ac]
   1dfbc:	e9 f3 41 b9	ldr	w9, [sp, #0x1f0]
   1dfc0:	08 01 09 6b	subs	w8, w8, w9
   1dfc4:	6a 0a 00 54	b.ge	0x1e110
   1dfc8:	01 00 00 14	b	0x1dfcc
   1dfcc:	e1 db 40 f9	ldr	x1, [sp, #0x1b0]
   1dfd0:	28 04 00 91	add	x8, x1, #0x1
   1dfd4:	e8 db 00 f9	str	x8, [sp, #0x1b0]
   1dfd8:	e0 e3 06 91	add	x0, sp, #0x1b8
   1dfdc:	d8 02 00 94	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEEixB9nqe210106Em
   1dfe0:	1f 00 00 39	strb	wzr, [x0]
   1dfe4:	e8 f7 40 f9	ldr	x8, [sp, #0x1e8]
   1dfe8:	e9 af 81 b9	ldrsw	x9, [sp, #0x1ac]
   1dfec:	ea e7 81 b9	ldrsw	x10, [sp, #0x1e4]
   1dff0:	29 7d 0a 9b	mul	x9, x9, x10
   1dff4:	08 01 09 8b	add	x8, x8, x9
   1dff8:	e8 d3 00 f9	str	x8, [sp, #0x1a0]
   1dffc:	ff 9f 01 b9	str	wzr, [sp, #0x19c]
   1e000:	01 00 00 14	b	0x1e004
   1e004:	e8 9f 41 b9	ldr	w8, [sp, #0x19c]
   1e008:	e9 f7 41 b9	ldr	w9, [sp, #0x1f4]
   1e00c:	08 01 09 6b	subs	w8, w8, w9
   1e010:	6a 07 00 54	b.ge	0x1e0fc
   1e014:	01 00 00 14	b	0x1e018
   1e018:	e8 d3 40 f9	ldr	x8, [sp, #0x1a0]
   1e01c:	e9 9f 41 b9	ldr	w9, [sp, #0x19c]
   1e020:	29 75 1e 53	lsl	w9, w9, #2
   1e024:	08 c1 29 8b	add	x8, x8, w9, sxtw
   1e028:	08 01 40 39	ldrb	w8, [x8]
   1e02c:	e8 7f 00 b9	str	w8, [sp, #0x7c]
   1e030:	e1 db 40 f9	ldr	x1, [sp, #0x1b0]
   1e034:	28 04 00 91	add	x8, x1, #0x1
   1e038:	e8 db 00 f9	str	x8, [sp, #0x1b0]
   1e03c:	e0 e3 06 91	add	x0, sp, #0x1b8
   1e040:	e0 47 00 f9	str	x0, [sp, #0x88]
   1e044:	be 02 00 94	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEEixB9nqe210106Em
   1e048:	e8 7f 40 b9	ldr	w8, [sp, #0x7c]
   1e04c:	e9 03 00 aa	mov	x9, x0
   1e050:	e0 47 40 f9	ldr	x0, [sp, #0x88]
   1e054:	28 01 00 39	strb	w8, [x9]
   1e058:	e8 d3 40 f9	ldr	x8, [sp, #0x1a0]
   1e05c:	e9 9f 41 b9	ldr	w9, [sp, #0x19c]
   1e060:	29 75 1e 53	lsl	w9, w9, #2
   1e064:	29 05 00 11	add	w9, w9, #0x1
   1e068:	08 c1 29 8b	add	x8, x8, w9, sxtw
   1e06c:	08 01 40 39	ldrb	w8, [x8]
   1e070:	e8 83 00 b9	str	w8, [sp, #0x80]
   1e074:	e1 db 40 f9	ldr	x1, [sp, #0x1b0]
   1e078:	28 04 00 91	add	x8, x1, #0x1
   1e07c:	e8 db 00 f9	str	x8, [sp, #0x1b0]
   1e080:	af 02 00 94	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEEixB9nqe210106Em
   1e084:	e8 83 40 b9	ldr	w8, [sp, #0x80]
   1e088:	e9 03 00 aa	mov	x9, x0
   1e08c:	e0 47 40 f9	ldr	x0, [sp, #0x88]
   1e090:	28 01 00 39	strb	w8, [x9]
   1e094:	e8 d3 40 f9	ldr	x8, [sp, #0x1a0]
   1e098:	e9 9f 41 b9	ldr	w9, [sp, #0x19c]
   1e09c:	29 75 1e 53	lsl	w9, w9, #2
   1e0a0:	29 09 00 11	add	w9, w9, #0x2
   1e0a4:	08 c1 29 8b	add	x8, x8, w9, sxtw
   1e0a8:	08 01 40 39	ldrb	w8, [x8]
   1e0ac:	e8 87 00 b9	str	w8, [sp, #0x84]
   1e0b0:	e1 db 40 f9	ldr	x1, [sp, #0x1b0]
   1e0b4:	28 04 00 91	add	x8, x1, #0x1
   1e0b8:	e8 db 00 f9	str	x8, [sp, #0x1b0]
   1e0bc:	a0 02 00 94	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEEixB9nqe210106Em
   1e0c0:	e8 87 40 b9	ldr	w8, [sp, #0x84]
   1e0c4:	e9 03 00 aa	mov	x9, x0
   1e0c8:	e0 47 40 f9	ldr	x0, [sp, #0x88]
   1e0cc:	28 01 00 39	strb	w8, [x9]
   1e0d0:	e1 db 40 f9	ldr	x1, [sp, #0x1b0]
   1e0d4:	28 04 00 91	add	x8, x1, #0x1
   1e0d8:	e8 db 00 f9	str	x8, [sp, #0x1b0]
   1e0dc:	98 02 00 94	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEEixB9nqe210106Em
   1e0e0:	e8 1f 80 52	mov	w8, #0xff
   1e0e4:	08 00 00 39	strb	w8, [x0]
   1e0e8:	01 00 00 14	b	0x1e0ec
   1e0ec:	e8 9f 41 b9	ldr	w8, [sp, #0x19c]
   1e0f0:	08 05 00 11	add	w8, w8, #0x1
   1e0f4:	e8 9f 01 b9	str	w8, [sp, #0x19c]
   1e0f8:	c3 ff ff 17	b	0x1e004
   1e0fc:	01 00 00 14	b	0x1e100
   1e100:	e8 af 41 b9	ldr	w8, [sp, #0x1ac]
   1e104:	08 05 00 11	add	w8, w8, #0x1
   1e108:	e8 af 01 b9	str	w8, [sp, #0x1ac]
   1e10c:	ab ff ff 17	b	0x1dfb8
   1e110:	e0 e3 06 91	add	x0, sp, #0x1b8
   1e114:	6e 9b ff 97	bl	__ZNKSt3__16vectorIhNS_9allocatorIhEEE4sizeB9nqe210106Ev
   1e118:	f7 29 0b 94	bl	_Cr_z_compressBound
   1e11c:	e0 3b 00 f9	str	x0, [sp, #0x70]
   1e120:	01 00 00 14	b	0x1e124
   1e124:	e8 3b 40 f9	ldr	x8, [sp, #0x70]
   1e128:	e8 cb 00 f9	str	x8, [sp, #0x190]
   1e12c:	e1 cb 40 f9	ldr	x1, [sp, #0x190]
   1e130:	e0 e3 05 91	add	x0, sp, #0x178
   1e134:	75 02 00 94	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEEC1B9nqe210106Em
   1e138:	01 00 00 14	b	0x1e13c
   1e13c:	e0 e3 05 91	add	x0, sp, #0x178
   1e140:	50 9b ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEE4dataB9nqe210106Ev
   1e144:	e0 33 00 f9	str	x0, [sp, #0x60]
   1e148:	e0 e3 06 91	add	x0, sp, #0x1b8
   1e14c:	e0 2b 00 f9	str	x0, [sp, #0x50]
   1e150:	4c 9b ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEE4dataB9nqe210106Ev
   1e154:	e1 03 00 aa	mov	x1, x0
   1e158:	e0 2b 40 f9	ldr	x0, [sp, #0x50]
   1e15c:	e1 2f 00 f9	str	x1, [sp, #0x58]
   1e160:	5b 9b ff 97	bl	__ZNKSt3__16vectorIhNS_9allocatorIhEEE4sizeB9nqe210106Ev
   1e164:	e2 2f 40 f9	ldr	x2, [sp, #0x58]
   1e168:	e3 03 00 aa	mov	x3, x0
   1e16c:	e0 33 40 f9	ldr	x0, [sp, #0x60]
   1e170:	e1 43 06 91	add	x1, sp, #0x190
   1e174:	24 00 80 52	mov	w4, #0x1
   1e178:	b6 29 0b 94	bl	_Cr_z_compress2
   1e17c:	e0 6f 00 b9	str	w0, [sp, #0x6c]
   1e180:	01 00 00 14	b	0x1e184
   1e184:	e8 6f 40 b9	ldr	w8, [sp, #0x6c]
   1e188:	e8 03 00 34	cbz	w8, 0x1e204
   1e18c:	01 00 00 14	b	0x1e190
   1e190:	00 02 80 d2	mov	x0, #0x10
   1e194:	20 dc 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1e198:	e0 27 00 f9	str	x0, [sp, #0x48]
   1e19c:	c1 27 00 f0	adrp	x1, 1275 ; 0x519000
   1e1a0:	21 54 15 91	add	x1, x1, #0x555 ; literal pool for: "Failed to encode rendered PDF page"
   1e1a4:	30 da 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   1e1a8:	01 00 00 14	b	0x1e1ac
   1e1ac:	e0 27 40 f9	ldr	x0, [sp, #0x48]
   1e1b0:	21 38 00 d0	adrp	x1, 1798 ; 0x724000
   1e1b4:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1e1b8:	22 38 00 d0	adrp	x2, 1798 ; 0x724000
   1e1bc:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1e1c0:	30 dc 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1e1c4:	e4 00 00 14	b	0x1e554
   1e1c8:	e0 ef 00 f9	str	x0, [sp, #0x1d8]
   1e1cc:	e8 03 01 aa	mov	x8, x1
   1e1d0:	e8 d7 01 b9	str	w8, [sp, #0x1d4]
   1e1d4:	da 00 00 14	b	0x1e53c
   1e1d8:	e0 ef 00 f9	str	x0, [sp, #0x1d8]
   1e1dc:	e8 03 01 aa	mov	x8, x1
   1e1e0:	e8 d7 01 b9	str	w8, [sp, #0x1d4]
   1e1e4:	d3 00 00 14	b	0x1e530
   1e1e8:	e8 03 00 aa	mov	x8, x0
   1e1ec:	e0 27 40 f9	ldr	x0, [sp, #0x48]
   1e1f0:	e8 ef 00 f9	str	x8, [sp, #0x1d8]
   1e1f4:	e8 03 01 aa	mov	x8, x1
   1e1f8:	e8 d7 01 b9	str	w8, [sp, #0x1d4]
   1e1fc:	15 dc 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1e200:	cc 00 00 14	b	0x1e530
   1e204:	e1 cb 40 f9	ldr	x1, [sp, #0x190]
   1e208:	e0 e3 05 91	add	x0, sp, #0x178
   1e20c:	ed 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEE6resizeEm
   1e210:	01 00 00 14	b	0x1e214
   1e214:	e0 83 05 91	add	x0, sp, #0x160
   1e218:	e0 23 00 f9	str	x0, [sp, #0x40]
   1e21c:	a2 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEEC1B9nqe210106Ev
   1e220:	e0 23 40 f9	ldr	x0, [sp, #0x40]
   1e224:	e1 f7 41 b9	ldr	w1, [sp, #0x1f4]
   1e228:	4e 02 00 94	bl	__ZN12_GLOBAL__N_112AppendUint32EPNSt3__16vectorIhNS0_9allocatorIhEEEEj
   1e22c:	01 00 00 14	b	0x1e230
   1e230:	e1 f3 41 b9	ldr	w1, [sp, #0x1f0]
   1e234:	e0 83 05 91	add	x0, sp, #0x160
   1e238:	4a 02 00 94	bl	__ZN12_GLOBAL__N_112AppendUint32EPNSt3__16vectorIhNS0_9allocatorIhEEEEj
   1e23c:	01 00 00 14	b	0x1e240
   1e240:	e0 83 05 91	add	x0, sp, #0x160
   1e244:	e0 1b 00 f9	str	x0, [sp, #0x30]
   1e248:	82 02 00 94	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEE3endB9nqe210106Ev
   1e24c:	e1 43 05 91	add	x1, sp, #0x150
   1e250:	e0 ab 00 f9	str	x0, [sp, #0x150]
   1e254:	e0 63 05 91	add	x0, sp, #0x158
   1e258:	8e 02 00 94	bl	__ZNSt3__111__wrap_iterIPKhEC1B9nqe210106IPhLi0EEERKNS0_IT_EE
   1e25c:	e0 1b 40 f9	ldr	x0, [sp, #0x30]
   1e260:	e8 ef 04 91	add	x8, sp, #0x13b
   1e264:	09 01 80 52	mov	w9, #0x8
   1e268:	e9 ef 04 39	strb	w9, [sp, #0x13b]
   1e26c:	c9 00 80 52	mov	w9, #0x6
   1e270:	e9 f3 04 39	strb	w9, [sp, #0x13c]
   1e274:	ff f7 04 39	strb	wzr, [sp, #0x13d]
   1e278:	ff fb 04 39	strb	wzr, [sp, #0x13e]
   1e27c:	ff ff 04 39	strb	wzr, [sp, #0x13f]
   1e280:	e8 a3 00 f9	str	x8, [sp, #0x140]
   1e284:	a8 00 80 d2	mov	x8, #0x5
   1e288:	e8 a7 00 f9	str	x8, [sp, #0x148]
   1e28c:	e1 af 40 f9	ldr	x1, [sp, #0x158]
   1e290:	e2 a3 40 f9	ldr	x2, [sp, #0x140]
   1e294:	e3 a7 40 f9	ldr	x3, [sp, #0x148]
   1e298:	51 02 00 94	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEE6insertB9nqe210106ENS_11__wrap_iterIPKhEESt16initializer_listIhE
   1e29c:	e0 1f 00 f9	str	x0, [sp, #0x38]
   1e2a0:	01 00 00 14	b	0x1e2a4
   1e2a4:	e8 1f 40 f9	ldr	x8, [sp, #0x38]
   1e2a8:	e8 9b 00 f9	str	x8, [sp, #0x130]
   1e2ac:	a8 83 00 d1	sub	x8, x29, #0x20
   1e2b0:	29 11 80 52	mov	w9, #0x89
   1e2b4:	a9 03 1e 38	sturb	w9, [x29, #-0x20]
   1e2b8:	09 0a 80 52	mov	w9, #0x50
   1e2bc:	a9 13 1e 38	sturb	w9, [x29, #-0x1f]
   1e2c0:	c9 09 80 52	mov	w9, #0x4e
   1e2c4:	a9 23 1e 38	sturb	w9, [x29, #-0x1e]
   1e2c8:	e9 08 80 52	mov	w9, #0x47
   1e2cc:	a9 33 1e 38	sturb	w9, [x29, #-0x1d]
   1e2d0:	a9 01 80 52	mov	w9, #0xd
   1e2d4:	a9 43 1e 38	sturb	w9, [x29, #-0x1c]
   1e2d8:	49 01 80 52	mov	w9, #0xa
   1e2dc:	a9 53 1e 38	sturb	w9, [x29, #-0x1b]
   1e2e0:	4a 03 80 52	mov	w10, #0x1a
   1e2e4:	aa 63 1e 38	sturb	w10, [x29, #-0x1a]
   1e2e8:	a9 73 1e 38	sturb	w9, [x29, #-0x19]
   1e2ec:	e8 87 00 f9	str	x8, [sp, #0x108]
   1e2f0:	08 01 80 d2	mov	x8, #0x8
   1e2f4:	e8 8b 00 f9	str	x8, [sp, #0x110]
   1e2f8:	e1 87 40 f9	ldr	x1, [sp, #0x108]
   1e2fc:	e2 8b 40 f9	ldr	x2, [sp, #0x110]
   1e300:	e0 63 04 91	add	x0, sp, #0x118
   1e304:	70 02 00 94	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEEC1B9nqe210106ESt16initializer_listIhE
   1e308:	01 00 00 14	b	0x1e30c
   1e30c:	e0 e3 03 91	add	x0, sp, #0xf8
   1e310:	c1 27 00 f0	adrp	x1, 1275 ; 0x519000
   1e314:	21 e0 15 91	add	x1, x1, #0x578 ; literal pool for: "IHDR"
   1e318:	df 02 00 94	bl	__ZNSt3__117basic_string_viewIcNS_11char_traitsIcEEEC1B9nqe210106EPKc
   1e31c:	01 00 00 14	b	0x1e320
   1e320:	e0 a3 03 91	add	x0, sp, #0xe8
   1e324:	e1 83 05 91	add	x1, sp, #0x160
   1e328:	e8 02 00 94	bl	__ZNSt3__14spanIKhLm18446744073709551615EEC1B9nqe210106IRNS_6vectorIhNS_9allocatorIhEEEEEEOT_
   1e32c:	01 00 00 14	b	0x1e330
   1e330:	e1 7f 40 f9	ldr	x1, [sp, #0xf8]
   1e334:	e2 83 40 f9	ldr	x2, [sp, #0x100]
   1e338:	e3 77 40 f9	ldr	x3, [sp, #0xe8]
   1e33c:	e4 7b 40 f9	ldr	x4, [sp, #0xf0]
   1e340:	e0 63 04 91	add	x0, sp, #0x118
   1e344:	6f 02 00 94	bl	__ZN12_GLOBAL__N_114AppendPngChunkEPNSt3__16vectorIhNS0_9allocatorIhEEEENS0_17basic_string_viewIcNS0_11char_traitsIcEEEENS0_4spanIKhLm18446744073709551615EEE
   1e348:	01 00 00 14	b	0x1e34c
   1e34c:	e0 63 03 91	add	x0, sp, #0xd8
   1e350:	c1 27 00 f0	adrp	x1, 1275 ; 0x519000
   1e354:	21 f4 15 91	add	x1, x1, #0x57d ; literal pool for: "IDAT"
   1e358:	cf 02 00 94	bl	__ZNSt3__117basic_string_viewIcNS_11char_traitsIcEEEC1B9nqe210106EPKc
   1e35c:	01 00 00 14	b	0x1e360
   1e360:	e0 23 03 91	add	x0, sp, #0xc8
   1e364:	e1 e3 05 91	add	x1, sp, #0x178
   1e368:	d8 02 00 94	bl	__ZNSt3__14spanIKhLm18446744073709551615EEC1B9nqe210106IRNS_6vectorIhNS_9allocatorIhEEEEEEOT_
   1e36c:	01 00 00 14	b	0x1e370
   1e370:	e1 6f 40 f9	ldr	x1, [sp, #0xd8]
   1e374:	e2 73 40 f9	ldr	x2, [sp, #0xe0]
   1e378:	e3 67 40 f9	ldr	x3, [sp, #0xc8]
   1e37c:	e4 6b 40 f9	ldr	x4, [sp, #0xd0]
   1e380:	e0 63 04 91	add	x0, sp, #0x118
   1e384:	5f 02 00 94	bl	__ZN12_GLOBAL__N_114AppendPngChunkEPNSt3__16vectorIhNS0_9allocatorIhEEEENS0_17basic_string_viewIcNS0_11char_traitsIcEEEENS0_4spanIKhLm18446744073709551615EEE
   1e388:	01 00 00 14	b	0x1e38c
   1e38c:	e0 e3 02 91	add	x0, sp, #0xb8
   1e390:	c1 27 00 f0	adrp	x1, 1275 ; 0x519000
   1e394:	21 08 16 91	add	x1, x1, #0x582 ; literal pool for: "IEND"
   1e398:	bf 02 00 94	bl	__ZNSt3__117basic_string_viewIcNS_11char_traitsIcEEEC1B9nqe210106EPKc
   1e39c:	01 00 00 14	b	0x1e3a0
   1e3a0:	e0 a3 02 91	add	x0, sp, #0xa8
   1e3a4:	d6 02 00 94	bl	__ZNSt3__14spanIKhLm18446744073709551615EEC1B9nqe210106Ev
   1e3a8:	e1 5f 40 f9	ldr	x1, [sp, #0xb8]
   1e3ac:	e2 63 40 f9	ldr	x2, [sp, #0xc0]
   1e3b0:	e3 57 40 f9	ldr	x3, [sp, #0xa8]
   1e3b4:	e4 5b 40 f9	ldr	x4, [sp, #0xb0]
   1e3b8:	e0 63 04 91	add	x0, sp, #0x118
   1e3bc:	51 02 00 94	bl	__ZN12_GLOBAL__N_114AppendPngChunkEPNSt3__16vectorIhNS0_9allocatorIhEEEENS0_17basic_string_viewIcNS0_11char_traitsIcEEEENS0_4spanIKhLm18446744073709551615EEE
   1e3c0:	01 00 00 14	b	0x1e3c4
   1e3c4:	e1 03 41 f9	ldr	x1, [sp, #0x200]
   1e3c8:	e0 23 08 91	add	x0, sp, #0x208
   1e3cc:	82 04 80 52	mov	w2, #0x24
   1e3d0:	6f dc ff 97	bl	__ZNSt3__114basic_ofstreamIcNS_11char_traitsIcEEEC1B9nqe210106INS_4__fs10filesystem4pathEvEERKT_j
   1e3d4:	01 00 00 14	b	0x1e3d8
   1e3d8:	e0 63 04 91	add	x0, sp, #0x118
   1e3dc:	e0 13 00 f9	str	x0, [sp, #0x20]
   1e3e0:	a8 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEE4dataB9nqe210106Ev
   1e3e4:	e1 03 00 aa	mov	x1, x0
   1e3e8:	e0 13 40 f9	ldr	x0, [sp, #0x20]
   1e3ec:	e1 17 00 f9	str	x1, [sp, #0x28]
   1e3f0:	b7 9a ff 97	bl	__ZNKSt3__16vectorIhNS_9allocatorIhEEE4sizeB9nqe210106Ev
   1e3f4:	e1 17 40 f9	ldr	x1, [sp, #0x28]
   1e3f8:	e2 03 00 aa	mov	x2, x0
   1e3fc:	e0 23 08 91	add	x0, sp, #0x208
   1e400:	32 da 13 94	bl	0x514cc8 ; symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5writeEPKcl
   1e404:	01 00 00 14	b	0x1e408
   1e408:	e8 23 08 91	add	x8, sp, #0x208
   1e40c:	e9 07 41 f9	ldr	x9, [sp, #0x208]
   1e410:	29 81 5e f8	ldur	x9, [x9, #-0x18]
   1e414:	00 01 09 8b	add	x0, x8, x9
   1e418:	f4 dc ff 97	bl	__ZNKSt3__19basic_iosIcNS_11char_traitsIcEEE4goodB9nqe210106Ev
   1e41c:	e0 1f 00 b9	str	w0, [sp, #0x1c]
   1e420:	01 00 00 14	b	0x1e424
   1e424:	e8 1f 40 b9	ldr	w8, [sp, #0x1c]
   1e428:	68 04 00 37	tbnz	w8, #0x0, 0x1e4b4
   1e42c:	01 00 00 14	b	0x1e430
   1e430:	00 02 80 d2	mov	x0, #0x10
   1e434:	78 db 13 94	bl	0x515214 ; symbol stub for: ___cxa_allocate_exception
   1e438:	e0 0b 00 f9	str	x0, [sp, #0x10]
   1e43c:	c1 27 00 f0	adrp	x1, 1275 ; 0x519000
   1e440:	21 1c 16 91	add	x1, x1, #0x587 ; literal pool for: "Failed to write rendered PDF page"
   1e444:	88 d9 13 94	bl	0x514a64 ; symbol stub for: __ZNSt13runtime_errorC1EPKc
   1e448:	01 00 00 14	b	0x1e44c
   1e44c:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
   1e450:	21 38 00 d0	adrp	x1, 1798 ; 0x724000
   1e454:	21 94 40 f9	ldr	x1, [x1, #0x128] ; literal pool symbol address: __ZTISt13runtime_error
   1e458:	22 38 00 d0	adrp	x2, 1798 ; 0x724000
   1e45c:	42 80 40 f9	ldr	x2, [x2, #0x100] ; literal pool symbol address: __ZNSt13runtime_errorD1Ev
   1e460:	88 db 13 94	bl	0x515280 ; symbol stub for: ___cxa_throw
   1e464:	3c 00 00 14	b	0x1e554
   1e468:	e0 ef 00 f9	str	x0, [sp, #0x1d8]
   1e46c:	e8 03 01 aa	mov	x8, x1
   1e470:	e8 d7 01 b9	str	w8, [sp, #0x1d4]
   1e474:	2c 00 00 14	b	0x1e524
   1e478:	e0 ef 00 f9	str	x0, [sp, #0x1d8]
   1e47c:	e8 03 01 aa	mov	x8, x1
   1e480:	e8 d7 01 b9	str	w8, [sp, #0x1d4]
   1e484:	25 00 00 14	b	0x1e518
   1e488:	e0 ef 00 f9	str	x0, [sp, #0x1d8]
   1e48c:	e8 03 01 aa	mov	x8, x1
   1e490:	e8 d7 01 b9	str	w8, [sp, #0x1d4]
   1e494:	1e 00 00 14	b	0x1e50c
   1e498:	e8 03 00 aa	mov	x8, x0
   1e49c:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
   1e4a0:	e8 ef 00 f9	str	x8, [sp, #0x1d8]
   1e4a4:	e8 03 01 aa	mov	x8, x1
   1e4a8:	e8 d7 01 b9	str	w8, [sp, #0x1d4]
   1e4ac:	69 db 13 94	bl	0x515250 ; symbol stub for: ___cxa_free_exception
   1e4b0:	17 00 00 14	b	0x1e50c
   1e4b4:	e0 23 08 91	add	x0, sp, #0x208
   1e4b8:	f3 dc ff 97	bl	__ZNSt3__114basic_ofstreamIcNS_11char_traitsIcEEED1Ev
   1e4bc:	e0 63 04 91	add	x0, sp, #0x118
   1e4c0:	9b 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEED1B9nqe210106Ev
   1e4c4:	e0 83 05 91	add	x0, sp, #0x160
   1e4c8:	99 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEED1B9nqe210106Ev
   1e4cc:	e0 e3 05 91	add	x0, sp, #0x178
   1e4d0:	97 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEED1B9nqe210106Ev
   1e4d4:	e0 e3 06 91	add	x0, sp, #0x1b8
   1e4d8:	95 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEED1B9nqe210106Ev
   1e4dc:	a9 83 5e f8	ldur	x9, [x29, #-0x18]
   1e4e0:	28 38 00 d0	adrp	x8, 1798 ; 0x724000
   1e4e4:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   1e4e8:	08 01 40 f9	ldr	x8, [x8]
   1e4ec:	08 01 09 eb	subs	x8, x8, x9
   1e4f0:	60 00 00 54	b.eq	0x1e4fc
   1e4f4:	01 00 00 14	b	0x1e4f8
   1e4f8:	83 db 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
   1e4fc:	ff 43 11 91	add	sp, sp, #0x450
   1e500:	fd 7b 41 a9	ldp	x29, x30, [sp, #0x10]
   1e504:	fc 6f c2 a8	ldp	x28, x27, [sp], #0x20
   1e508:	c0 03 5f d6	ret
   1e50c:	e0 23 08 91	add	x0, sp, #0x208
   1e510:	dd dc ff 97	bl	__ZNSt3__114basic_ofstreamIcNS_11char_traitsIcEEED1Ev
   1e514:	01 00 00 14	b	0x1e518
   1e518:	e0 63 04 91	add	x0, sp, #0x118
   1e51c:	84 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEED1B9nqe210106Ev
   1e520:	01 00 00 14	b	0x1e524
   1e524:	e0 83 05 91	add	x0, sp, #0x160
   1e528:	81 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEED1B9nqe210106Ev
   1e52c:	01 00 00 14	b	0x1e530
   1e530:	e0 e3 05 91	add	x0, sp, #0x178
   1e534:	7e 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEED1B9nqe210106Ev
   1e538:	01 00 00 14	b	0x1e53c
   1e53c:	e0 e3 06 91	add	x0, sp, #0x1b8
   1e540:	7b 9a ff 97	bl	__ZNSt3__16vectorIhNS_9allocatorIhEEED1B9nqe210106Ev
   1e544:	01 00 00 14	b	0x1e548
   1e548:	e0 ef 40 f9	ldr	x0, [sp, #0x1d8]
   1e54c:	e0 07 00 f9	str	x0, [sp, #0x8]
   1e550:	04 00 00 14	b	0x1e560
   1e554:	20 00 20 d4	brk	#0x1
   1e558:	e0 07 00 f9	str	x0, [sp, #0x8]
   1e55c:	01 00 00 14	b	0x1e560
   1e560:	e0 07 40 f9	ldr	x0, [sp, #0x8]
   1e564:	1c d9 13 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
