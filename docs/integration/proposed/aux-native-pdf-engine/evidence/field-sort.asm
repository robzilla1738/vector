/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZZN12_GLOBAL__N_113InspectFieldsERKNS_11PdfDocumentEENK3$_0clERKNS_5FieldES6_:
   19cac:	ff 83 00 d1	sub	sp, sp, #0x20
   19cb0:	e0 0b 00 f9	str	x0, [sp, #0x10]
   19cb4:	e1 07 00 f9	str	x1, [sp, #0x8]
   19cb8:	e2 03 00 f9	str	x2, [sp]
   19cbc:	e8 07 40 f9	ldr	x8, [sp, #0x8]
   19cc0:	08 01 40 b9	ldr	w8, [x8]
   19cc4:	e9 03 40 f9	ldr	x9, [sp]
   19cc8:	29 01 40 b9	ldr	w9, [x9]
   19ccc:	08 01 09 6b	subs	w8, w8, w9
   19cd0:	60 01 00 54	b.eq	0x19cfc
   19cd4:	01 00 00 14	b	0x19cd8
   19cd8:	e8 07 40 f9	ldr	x8, [sp, #0x8]
   19cdc:	08 01 40 b9	ldr	w8, [x8]
   19ce0:	e9 03 40 f9	ldr	x9, [sp]
   19ce4:	29 01 40 b9	ldr	w9, [x9]
   19ce8:	08 01 09 6b	subs	w8, w8, w9
   19cec:	e8 a7 9f 1a	cset	w8, lt
   19cf0:	08 01 00 12	and	w8, w8, #0x1
   19cf4:	e8 7f 00 39	strb	w8, [sp, #0x1f]
   19cf8:	1a 00 00 14	b	0x19d60
   19cfc:	e8 07 40 f9	ldr	x8, [sp, #0x8]
   19d00:	00 a9 40 bd	ldr	s0, [x8, #0xa8]
   19d04:	e8 03 40 f9	ldr	x8, [sp]
   19d08:	01 a9 40 bd	ldr	s1, [x8, #0xa8]
   19d0c:	00 20 21 1e	fcmp	s0, s1
   19d10:	60 01 00 54	b.eq	0x19d3c
   19d14:	01 00 00 14	b	0x19d18
   19d18:	e8 07 40 f9	ldr	x8, [sp, #0x8]
   19d1c:	00 a9 40 bd	ldr	s0, [x8, #0xa8]
   19d20:	e8 03 40 f9	ldr	x8, [sp]
   19d24:	01 a9 40 bd	ldr	s1, [x8, #0xa8]
   19d28:	00 20 21 1e	fcmp	s0, s1
   19d2c:	e8 d7 9f 1a	cset	w8, gt
   19d30:	08 01 00 12	and	w8, w8, #0x1
   19d34:	e8 7f 00 39	strb	w8, [sp, #0x1f]
   19d38:	0a 00 00 14	b	0x19d60
   19d3c:	e8 07 40 f9	ldr	x8, [sp, #0x8]
   19d40:	00 9d 40 bd	ldr	s0, [x8, #0x9c]
   19d44:	e8 03 40 f9	ldr	x8, [sp]
   19d48:	01 9d 40 bd	ldr	s1, [x8, #0x9c]
   19d4c:	00 20 21 1e	fcmp	s0, s1
   19d50:	e8 57 9f 1a	cset	w8, mi
   19d54:	08 01 00 12	and	w8, w8, #0x1
   19d58:	e8 7f 00 39	strb	w8, [sp, #0x1f]
   19d5c:	01 00 00 14	b	0x19d60
   19d60:	e8 7f 40 39	ldrb	w8, [sp, #0x1f]
   19d64:	00 01 00 12	and	w0, w8, #0x1
   19d68:	ff 83 00 91	add	sp, sp, #0x20
   19d6c:	c0 03 5f d6	ret
