
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460a9e8: d10243ff     	sub	sp, sp, #0x90
 460a9ec: a90657f6     	stp	x22, x21, [sp, #0x60]
 460a9f0: a9074ff4     	stp	x20, x19, [sp, #0x70]
 460a9f4: a9087bfd     	stp	x29, x30, [sp, #0x80]
 460a9f8: 910203fd     	add	x29, sp, #0x80
 460a9fc: f941e808     	ldr	x8, [x0, #0x3d0]
 460aa00: b4000208     	cbz	x8, 0x460aa40 <_ChromeMain+0x46057a4>
 460aa04: aa0103f5     	mov	x21, x1
 460aa08: aa0003f4     	mov	x20, x0
 460aa0c: f941a900     	ldr	x0, [x8, #0x350]
 460aa10: b4000080     	cbz	x0, 0x460aa20 <_ChromeMain+0x4605784>
 460aa14: d2800001     	mov	x1, #0x0                ; =0
 460aa18: 528000c2     	mov	w2, #0x6                ; =6
 460aa1c: 97856669     	bl	0x27643c0 <_ChromeMain+0x275f124>
 460aa20: b94052a8     	ldr	w8, [x21, #0x50]
 460aa24: 12151108     	and	w8, w8, #0xf800
 460aa28: 7120011f     	cmp	w8, #0x800
 460aa2c: 54000160     	b.eq	0x460aa58 <_ChromeMain+0x46057bc>
 460aa30: 7140051f     	cmp	w8, #0x1, lsl #12       ; =0x1000
 460aa34: 54000120     	b.eq	0x460aa58 <_ChromeMain+0x46057bc>
 460aa38: 7140091f     	cmp	w8, #0x2, lsl #12       ; =0x2000
 460aa3c: 54000980     	b.eq	0x460ab6c <_ChromeMain+0x46058d0>
 460aa40: 52800000     	mov	w0, #0x0                ; =0
 460aa44: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 460aa48: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 460aa4c: a94657f6     	ldp	x22, x21, [sp, #0x60]
 460aa50: 910243ff     	add	sp, sp, #0x90
 460aa54: d65f03c0     	ret
 460aa58: 52800020     	mov	w0, #0x1                ; =1
 460aa5c: 390fe680     	strb	w0, [x20, #0x3f9]
 460aa60: b94052a8     	ldr	w8, [x21, #0x50]
 460aa64: 12151108     	and	w8, w8, #0xf800
 460aa68: 7120011f     	cmp	w8, #0x800
 460aa6c: 54fffec1     	b.ne	0x460aa44 <_ChromeMain+0x46057a8>
 460aa70: f941ea80     	ldr	x0, [x20, #0x3d0]
 460aa74: f941f281     	ldr	x1, [x20, #0x3e0]
 460aa78: 97fff8fa     	bl	0x4608e60 <_ChromeMain+0x4603bc4>
 460aa7c: f9400288     	ldr	x8, [x20]
 460aa80: f940b508     	ldr	x8, [x8, #0x168]
 460aa84: aa1403e0     	mov	x0, x20
 460aa88: aa1403e1     	mov	x1, x20
 460aa8c: d63f0100     	blr	x8
 460aa90: f9400288     	ldr	x8, [x20]
 460aa94: f9403508     	ldr	x8, [x8, #0x68]
 460aa98: aa1403e0     	mov	x0, x20
 460aa9c: d63f0100     	blr	x8
 460aaa0: b40000e0     	cbz	x0, 0x460aabc <_ChromeMain+0x4605820>
 460aaa4: f9400288     	ldr	x8, [x20]
 460aaa8: f9403508     	ldr	x8, [x8, #0x68]
 460aaac: aa1403e0     	mov	x0, x20
 460aab0: d63f0100     	blr	x8
 460aab4: aa1403e1     	mov	x1, x20
 460aab8: 958363b2     	bl	0xa6e3980 <_ChromeMain+0xa6de6e4>
 460aabc: 2d5106a0     	ldp	s0, s1, [x21, #0x88]
 460aac0: 1e254000     	frintm	s0, s0
 460aac4: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 460aac8: 1e222000     	fcmp	s0, s2
 460aacc: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 460aad0: 1e226803     	fmaxnm	s3, s0, s2
 460aad4: 1e380069     	fcvtzs	w9, s3
 460aad8: 1a88b3ea     	csel	w10, wzr, w8, lt
 460aadc: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 460aae0: 1e270163     	fmov	s3, w11
 460aae4: 1e232000     	fcmp	s0, s3
 460aae8: 1a8a9129     	csel	w9, w9, w10, ls
 460aaec: 1e254020     	frintm	s0, s1
 460aaf0: 1e222000     	fcmp	s0, s2
 460aaf4: 1a88b3ea     	csel	w10, wzr, w8, lt
 460aaf8: 1e226801     	fmaxnm	s1, s0, s2
 460aafc: 1e38002b     	fcvtzs	w11, s1
 460ab00: 1e232000     	fcmp	s0, s3
 460ab04: 1a8a916a     	csel	w10, w11, w10, ls
 460ab08: aa0a8129     	orr	x9, x9, x10, lsl #32
 460ab0c: f901f689     	str	x9, [x20, #0x3e8]
 460ab10: 2d5106a0     	ldp	s0, s1, [x21, #0x88]
 460ab14: 1e254000     	frintm	s0, s0
 460ab18: 1e226804     	fmaxnm	s4, s0, s2
 460ab1c: 1e380089     	fcvtzs	w9, s4
 460ab20: 1e222000     	fcmp	s0, s2
 460ab24: 1a88b3ea     	csel	w10, wzr, w8, lt
 460ab28: 1e232000     	fcmp	s0, s3
 460ab2c: 1a8a9129     	csel	w9, w9, w10, ls
 460ab30: 1e254020     	frintm	s0, s1
 460ab34: 1e222000     	fcmp	s0, s2
 460ab38: 1e226801     	fmaxnm	s1, s0, s2
 460ab3c: 1e38002a     	fcvtzs	w10, s1
 460ab40: 1a88b3e8     	csel	w8, wzr, w8, lt
 460ab44: 1e232000     	fcmp	s0, s3
 460ab48: 1a889148     	csel	w8, w10, w8, ls
 460ab4c: aa088128     	orr	x8, x9, x8, lsl #32
 460ab50: f901fa88     	str	x8, [x20, #0x3f0]
 460ab54: f941ea81     	ldr	x1, [x20, #0x3d0]
 460ab58: 910fa282     	add	x2, x20, #0x3e8
 460ab5c: aa1403e0     	mov	x0, x20
 460ab60: 95833fbc     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 460ab64: 52800020     	mov	w0, #0x1                ; =1
 460ab68: 17ffffb7     	b	0x460aa44 <_ChromeMain+0x46057a8>
