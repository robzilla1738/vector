
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461baec:      	sub	sp, sp, #0x30
 461baf0:      	stp	x20, x19, [sp, #0x10]
 461baf4:      	stp	x29, x30, [sp, #0x20]
 461baf8:      	add	x29, sp, #0x20
 461bafc:      	mov	x20, x1
 461bb00:      	mov	x19, x0
 461bb04:      	ldr	x8, [x0]
 461bb08:      	ldr	x8, [x8, #0x68]
 461bb0c:      	blr	x8
 461bb10:      	cbz	x0, 0x461bb98 <_ChromeMain+0x46168fc>
 461bb14:      	ldr	x8, [x19]
 461bb18:      	ldr	x8, [x8, #0x68]
 461bb1c:      	mov	x0, x19
 461bb20:      	blr	x8
 461bb24:      	ldr	x8, [x0, #0x190]
 461bb28:      	cbz	x8, 0x461bb98 <_ChromeMain+0x46168fc>
 461bb2c:      	ldp	s0, s1, [x20, #0x90]
 461bb30:      	frintm	s0, s0
 461bb34:      	movi.2s	v2, #0xcf, lsl #24
 461bb38:      	fcmp	s0, s2
 461bb3c:      	mov	w8, #0x7fffffff         ; =2147483647
 461bb40:      	csel	w9, wzr, w8, lt
 461bb44:      	fmaxnm	s3, s0, s2
 461bb48:      	fcvtzs	w10, s3
 461bb4c:      	mov	w11, #0x4effffff        ; =1325400063
 461bb50:      	fmov	s3, w11
 461bb54:      	fcmp	s0, s3
 461bb58:      	csel	w9, w10, w9, ls
 461bb5c:      	frintm	s0, s1
 461bb60:      	fcmp	s0, s2
 461bb64:      	csel	w8, wzr, w8, lt
 461bb68:      	fmaxnm	s1, s0, s2
 461bb6c:      	fcvtzs	w10, s1
 461bb70:      	fcmp	s0, s3
 461bb74:      	csel	w8, w10, w8, ls
 461bb78:      	orr	x8, x9, x8, lsl #32
 461bb7c:      	str	x8, [sp, #0x8]
 461bb80:      	ldr	x8, [x19]
 461bb84:      	ldr	x8, [x8, #0x68]
 461bb88:      	mov	x0, x19
 461bb8c:      	blr	x8
 461bb90:      	ldr	x19, [x0, #0x190]
 461bb94:      	b	0x461bbec <_ChromeMain+0x4616950>
 461bb98:      	ldp	s0, s1, [x20, #0x88]
 461bb9c:      	frintm	s0, s0
 461bba0:      	movi.2s	v2, #0xcf, lsl #24
 461bba4:      	fcmp	s0, s2
 461bba8:      	mov	w8, #0x7fffffff         ; =2147483647
 461bbac:      	csel	w9, wzr, w8, lt
 461bbb0:      	fmaxnm	s3, s0, s2
 461bbb4:      	fcvtzs	w10, s3
 461bbb8:      	mov	w11, #0x4effffff        ; =1325400063
 461bbbc:      	fmov	s3, w11
 461bbc0:      	fcmp	s0, s3
 461bbc4:      	csel	w9, w10, w9, ls
 461bbc8:      	frintm	s0, s1
 461bbcc:      	fcmp	s0, s2
 461bbd0:      	csel	w8, wzr, w8, lt
 461bbd4:      	fmaxnm	s1, s0, s2
 461bbd8:      	fcvtzs	w10, s1
 461bbdc:      	fcmp	s0, s3
 461bbe0:      	csel	w8, w10, w8, ls
 461bbe4:      	orr	x8, x9, x8, lsl #32
 461bbe8:      	str	x8, [sp, #0x8]
 461bbec:      	add	x1, sp, #0x8
 461bbf0:      	mov	x0, x19
 461bbf4:      	bl	0x23239b4 <_ChromeMain+0x231e718>
 461bbf8:      	ldr	x0, [sp, #0x8]
 461bbfc:      	ldp	x29, x30, [sp, #0x20]
 461bc00:      	ldp	x20, x19, [sp, #0x10]
 461bc04:      	add	sp, sp, #0x30
 461bc08:      	ret
