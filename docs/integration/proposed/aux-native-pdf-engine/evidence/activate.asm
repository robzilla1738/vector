/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_114ActivateWidgetEP20fpdf_form_handle_t__P13fpdf_page_t__P19fpdf_annotation_t__:
   120dc:	ff 83 01 d1	sub	sp, sp, #0x60
   120e0:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   120e4:	fd 43 01 91	add	x29, sp, #0x50
   120e8:	a0 03 1f f8	stur	x0, [x29, #-0x10]
   120ec:	a1 83 1e f8	stur	x1, [x29, #-0x18]
   120f0:	a2 03 1e f8	stur	x2, [x29, #-0x20]
   120f4:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   120f8:	a1 03 5e f8	ldur	x1, [x29, #-0x20]
   120fc:	50 c6 05 94	bl	_FORM_SetFocusedAnnot
   12100:	00 02 00 34	cbz	w0, 0x12140
   12104:	01 00 00 14	b	0x12108
   12108:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   1210c:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
   12110:	02 04 80 52	mov	w2, #0x20
   12114:	03 00 80 52	mov	w3, #0x0
   12118:	fe c4 05 94	bl	_FORM_OnChar
   1211c:	20 01 00 34	cbz	w0, 0x12140
   12120:	01 00 00 14	b	0x12124
   12124:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   12128:	f2 c5 05 94	bl	_FORM_ForceToKillFocus
   1212c:	28 00 80 52	mov	w8, #0x1
   12130:	08 01 00 12	and	w8, w8, #0x1
   12134:	08 01 00 12	and	w8, w8, #0x1
   12138:	a8 f3 1f 38	sturb	w8, [x29, #-0x1]
   1213c:	33 00 00 14	b	0x12208
   12140:	e1 83 00 91	add	x1, sp, #0x20
   12144:	ff 13 00 f9	str	xzr, [sp, #0x20]
   12148:	ff 17 00 f9	str	xzr, [sp, #0x28]
   1214c:	a0 03 5e f8	ldur	x0, [x29, #-0x20]
   12150:	bc a3 05 94	bl	_FPDFAnnot_GetRect
   12154:	e0 00 00 35	cbnz	w0, 0x12170
   12158:	01 00 00 14	b	0x1215c
   1215c:	08 00 80 52	mov	w8, #0x0
   12160:	08 01 00 12	and	w8, w8, #0x1
   12164:	08 01 00 12	and	w8, w8, #0x1
   12168:	a8 f3 1f 38	sturb	w8, [x29, #-0x1]
   1216c:	27 00 00 14	b	0x12208
   12170:	e0 23 40 bd	ldr	s0, [sp, #0x20]
   12174:	e1 2b 40 bd	ldr	s1, [sp, #0x28]
   12178:	00 28 21 1e	fadd	s0, s0, s1
   1217c:	01 10 20 1e	fmov	s1, #2.00000000
   12180:	00 18 21 1e	fdiv	s0, s0, s1
   12184:	00 c0 22 1e	fcvt	d0, s0
   12188:	e0 0f 00 fd	str	d0, [sp, #0x18]
   1218c:	e0 2f 40 bd	ldr	s0, [sp, #0x2c]
   12190:	e2 27 40 bd	ldr	s2, [sp, #0x24]
   12194:	00 28 22 1e	fadd	s0, s0, s2
   12198:	00 18 21 1e	fdiv	s0, s0, s1
   1219c:	00 c0 22 1e	fcvt	d0, s0
   121a0:	e0 0b 00 fd	str	d0, [sp, #0x10]
   121a4:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   121a8:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
   121ac:	e0 0f 40 fd	ldr	d0, [sp, #0x18]
   121b0:	e1 0b 40 fd	ldr	d1, [sp, #0x10]
   121b4:	02 00 80 52	mov	w2, #0x0
   121b8:	27 c4 05 94	bl	_FORM_OnLButtonDown
   121bc:	08 00 80 52	mov	w8, #0x0
   121c0:	e8 0f 00 b9	str	w8, [sp, #0xc]
   121c4:	80 01 00 34	cbz	w0, 0x121f4
   121c8:	01 00 00 14	b	0x121cc
   121cc:	a0 03 5f f8	ldur	x0, [x29, #-0x10]
   121d0:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
   121d4:	e0 0f 40 fd	ldr	d0, [sp, #0x18]
   121d8:	e1 0b 40 fd	ldr	d1, [sp, #0x10]
   121dc:	02 00 80 52	mov	w2, #0x0
   121e0:	3b c4 05 94	bl	_FORM_OnLButtonUp
   121e4:	08 00 00 71	subs	w8, w0, #0x0
   121e8:	e8 07 9f 1a	cset	w8, ne
   121ec:	e8 0f 00 b9	str	w8, [sp, #0xc]
   121f0:	01 00 00 14	b	0x121f4
   121f4:	e8 0f 40 b9	ldr	w8, [sp, #0xc]
   121f8:	08 01 00 12	and	w8, w8, #0x1
   121fc:	08 01 00 12	and	w8, w8, #0x1
   12200:	a8 f3 1f 38	sturb	w8, [x29, #-0x1]
   12204:	01 00 00 14	b	0x12208
   12208:	a8 f3 5f 38	ldurb	w8, [x29, #-0x1]
   1220c:	00 01 00 12	and	w0, w8, #0x1
   12210:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   12214:	ff 83 01 91	add	sp, sp, #0x60
   12218:	c0 03 5f d6	ret
