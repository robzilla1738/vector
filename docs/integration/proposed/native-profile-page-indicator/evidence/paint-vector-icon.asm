Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 23d6ef8: d10083ff     	sub	sp, sp, #0x20
 23d6efc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 23d6f00: 910043fd     	add	x29, sp, #0x10
 23d6f04: f940042c     	ldr	x12, [x1, #0x8]
 23d6f08: b400090c     	cbz	x12, 0x23d7028 <_ChromeMain+0x23d1d8c>
 23d6f0c: f9400028     	ldr	x8, [x1]
 23d6f10: d37ced89     	lsl	x9, x12, #4
 23d6f14: b40000e9     	cbz	x9, 0x23d6f30 <_ChromeMain+0x23d1c94>
 23d6f18: 9100210a     	add	x10, x8, #0x8
 23d6f1c: aa0903eb     	mov	x11, x9
 23d6f20: f841054d     	ldr	x13, [x10], #0x10
 23d6f24: b400088d     	cbz	x13, 0x23d7034 <_ChromeMain+0x23d1d98>
 23d6f28: f100416b     	subs	x11, x11, #0x10
 23d6f2c: 54ffffa1     	b.ne	0x23d6f20 <_ChromeMain+0x23d1c84>
 23d6f30: bd400800     	ldr	s0, [x0, #0x8]
 23d6f34: 1e220041     	scvtf	s1, w2
 23d6f38: 1e210800     	fmul	s0, s0, s1
 23d6f3c: 1e24c000     	frintp	s0, s0
 23d6f40: 0f0665e1     	movi.2s	v1, #0xcf, lsl #24
 23d6f44: 1e212000     	fcmp	s0, s1
 23d6f48: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 23d6f4c: 1a8ab3ea     	csel	w10, wzr, w10, lt
 23d6f50: 1e216801     	fmaxnm	s1, s0, s1
 23d6f54: 1e38002b     	fcvtzs	w11, s1
 23d6f58: 12b6200d     	mov	w13, #0x4effffff        ; =1325400063
 23d6f5c: 1e2701a1     	fmov	s1, w13
 23d6f60: 1e212000     	fcmp	s0, s1
 23d6f64: 1a8a916b     	csel	w11, w11, w10, ls
 23d6f68: d280000a     	mov	x10, #0x0               ; =0
 23d6f6c: b40004a9     	cbz	x9, 0x23d7000 <_ChromeMain+0x23d1d64>
 23d6f70: 8b080129     	add	x9, x9, x8
 23d6f74: d1004129     	sub	x9, x9, #0x10
 23d6f78: cb0c13ec     	neg	x12, x12, lsl #4
 23d6f7c: 5280020d     	mov	w13, #0x10              ; =16
 23d6f80: b40004ed     	cbz	x13, 0x23d701c <_ChromeMain+0x23d1d80>
 23d6f84: f940052f     	ldr	x15, [x9, #0x8]
 23d6f88: b400042f     	cbz	x15, 0x23d700c <_ChromeMain+0x23d1d70>
 23d6f8c: f940012e     	ldr	x14, [x9]
 23d6f90: b94001d0     	ldr	w16, [x14]
 23d6f94: 7100721f     	cmp	w16, #0x1c
 23d6f98: 540003e1     	b.ne	0x23d7014 <_ChromeMain+0x23d1d78>
 23d6f9c: f10005ff     	cmp	x15, #0x1
 23d6fa0: 54000500     	b.eq	0x23d7040 <_ChromeMain+0x23d1da4>
 23d6fa4: bd4005c0     	ldr	s0, [x14, #0x4]
 23d6fa8: 1e38000e     	fcvtzs	w14, s0
 23d6fac: 6b0b01df     	cmp	w14, w11
 23d6fb0: 54000120     	b.eq	0x23d6fd4 <_ChromeMain+0x23d1d38>
 23d6fb4: 1ace0d6f     	sdiv	w15, w11, w14
 23d6fb8: 1b0eadef     	msub	w15, w15, w14, w11
 23d6fbc: 710001ff     	cmp	w15, #0x0
 23d6fc0: 9a8a012a     	csel	x10, x9, x10, eq
 23d6fc4: 6b0b01df     	cmp	w14, w11
 23d6fc8: 5400014d     	b.le	0x23d6ff0 <_ChromeMain+0x23d1d54>
 23d6fcc: f100015f     	cmp	x10, #0x0
 23d6fd0: 9a8a0129     	csel	x9, x9, x10, eq
 23d6fd4: a9402528     	ldp	x8, x9, [x9]
 23d6fd8: a90027e8     	stp	x8, x9, [sp]
 23d6fdc: 910003e1     	mov	x1, sp
 23d6fe0: 94000028     	bl	0x23d7080 <_ChromeMain+0x23d1de4>
 23d6fe4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 23d6fe8: 910083ff     	add	sp, sp, #0x20
 23d6fec: d65f03c0     	ret
 23d6ff0: d1004129     	sub	x9, x9, #0x10
 23d6ff4: 910041ad     	add	x13, x13, #0x10
 23d6ff8: b100418c     	adds	x12, x12, #0x10
 23d6ffc: 54fffc21     	b.ne	0x23d6f80 <_ChromeMain+0x23d1ce4>
 23d7000: f100015f     	cmp	x10, #0x0
 23d7004: 9a8a0109     	csel	x9, x8, x10, eq
 23d7008: 17fffff3     	b	0x23d6fd4 <_ChromeMain+0x23d1d38>
 23d700c: 1280000e     	mov	w14, #-0x1              ; =-1
 23d7010: 17ffffe7     	b	0x23d6fac <_ChromeMain+0x23d1d10>
 23d7014: 5280060e     	mov	w14, #0x30              ; =48
 23d7018: 17ffffe5     	b	0x23d6fac <_ChromeMain+0x23d1d10>
 23d701c: d4200000     	brk	#0
 23d7020: d4400000     	hlt	#0
 23d7024: d4200020     	brk	#0x1
 23d7028: d4200000     	brk	#0
 23d702c: d4400000     	hlt	#0
 23d7030: d4200020     	brk	#0x1
 23d7034: d4200000     	brk	#0
 23d7038: d4400000     	hlt	#0
 23d703c: d4200020     	brk	#0x1
 23d7040: d4200000     	brk	#0
 23d7044: d4400000     	hlt	#0
 23d7048: d4200020     	brk	#0x1
 23d704c: d503201f     	nop
 23d7050: d503201f     	nop
 23d7054: d503201f     	nop
 23d7058: d503201f     	nop
 23d705c: d503201f     	nop
 23d7060: d503201f     	nop
 23d7064: d503201f     	nop
 23d7068: d503201f     	nop
 23d706c: d503201f     	nop
 23d7070: d503201f     	nop
 23d7074: d503201f     	nop
 23d7078: d503201f     	nop
 23d707c: 00000000     	udf	#0x0
 23d7080: d10583ff     	sub	sp, sp, #0x160
 23d7084: 6d0e2beb     	stp	d11, d10, [sp, #0xe0]
 23d7088: 6d0f23e9     	stp	d9, d8, [sp, #0xf0]
 23d708c: a9106ffc     	stp	x28, x27, [sp, #0x100]
 23d7090: a91167fa     	stp	x26, x25, [sp, #0x110]
 23d7094: a9125ff8     	stp	x24, x23, [sp, #0x120]
 23d7098: a91357f6     	stp	x22, x21, [sp, #0x130]
 23d709c: a9144ff4     	stp	x20, x19, [sp, #0x140]
