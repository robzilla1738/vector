
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4129e00:      	sub	sp, sp, #0x100
 4129e04:      	stp	x28, x27, [sp, #0xa0]
 4129e08:      	stp	x26, x25, [sp, #0xb0]
 4129e0c:      	stp	x24, x23, [sp, #0xc0]
 4129e10:      	stp	x22, x21, [sp, #0xd0]
 4129e14:      	stp	x20, x19, [sp, #0xe0]
 4129e18:      	stp	x29, x30, [sp, #0xf0]
 4129e1c:      	add	x29, sp, #0xf0
 4129e20:      	mov	x19, x8
 4129e24:      	movi.2d	v0, #0000000000000000
 4129e28:      	stp	q0, q0, [x8]
 4129e2c:      	ldr	x23, [x0, #0x330]
 4129e30:      	ldr	x20, [x0, #0x358]
 4129e34:      	stp	x20, x23, [x29, #-0x68]
 4129e38:      	ldr	x8, [x0, #0x350]
 4129e3c:      	stur	x8, [x29, #-0x70]
 4129e40:      	ldrb	w8, [x1, #0x4]
 4129e44:      	cbnz	w8, 0x4129e68 <_ChromeMain+0x4124bcc>
 4129e48:      	ldp	x29, x30, [sp, #0xf0]
 4129e4c:      	ldp	x20, x19, [sp, #0xe0]
 4129e50:      	ldp	x22, x21, [sp, #0xd0]
 4129e54:      	ldp	x24, x23, [sp, #0xc0]
 4129e58:      	ldp	x26, x25, [sp, #0xb0]
 4129e5c:      	ldp	x28, x27, [sp, #0xa0]
 4129e60:      	add	sp, sp, #0x100
 4129e64:      	ret
 4129e68:      	mov	x21, x1
 4129e6c:      	mov	x22, x0
 4129e70:      	ldrb	w28, [x0, #0x368]
 4129e74:      	ldrb	w8, [x0, #0x369]
 4129e78:      	cbnz	w8, 0x4129f3c <_ChromeMain+0x4124ca0>
 4129e7c:      	mov	w0, #0x3d               ; =61
 4129e80:      	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4129e84:      	mov	x25, x0
 4129e88:      	mov	w0, #0x3f               ; =63
 4129e8c:      	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4129e90:      	mov	x27, x0
 4129e94:      	ldr	q0, [x21]
 4129e98:      	str	q0, [sp, #0x70]
 4129e9c:      	add	x0, sp, #0x70
 4129ea0:      	neg	w1, w25
 4129ea4:      	mov	w2, #0x0                ; =0
 4129ea8:      	bl	0x43ef360 <_ChromeMain+0x43ea0c4>
 4129eac:      	add	x1, sp, #0x70
 4129eb0:      	mov	x0, x23
 4129eb4:      	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4129eb8:      	lsr	x24, x0, #32
 4129ebc:      	mov	x0, x20
 4129ec0:      	mov	x1, x21
 4129ec4:      	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4129ec8:      	lsr	x8, x0, #32
 4129ecc:      	cmp	x24, #0x0
 4129ed0:      	mov	x26, x8
 4129ed4:      	ccmp	x8, #0x0, #0x4, ne
 4129ed8:      	cset	w8, ne
 4129edc:      	csel	w28, wzr, w28, eq
 4129ee0:      	strb	w28, [sp, #0x6f]
 4129ee4:      	ldrb	w9, [x21, #0xc]
 4129ee8:      	str	x27, [sp, #0x28]
 4129eec:      	cbz	w9, 0x412a270 <_ChromeMain+0x4124fd4>
 4129ef0:      	ldr	w9, [x21, #0x8]
 4129ef4:      	cmp	w8, #0x0
 4129ef8:      	csel	w8, w27, wzr, ne
 4129efc:      	mov	x10, x28
 4129f00:      	sub	w28, w9, w8
 4129f04:      	str	w10, [sp, #0x10]
 4129f08:      	tbz	w10, #0x0, 0x412a1f4 <_ChromeMain+0x4124f58>
 4129f0c:      	ldur	x0, [x29, #-0x70]
 4129f10:      	adrp	x1, 0xceec000 <dyld_stub_binder+0xceec000>
 4129f14:      	add	x1, x1, #0x334
 4129f18:      	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4129f1c:      	add	x8, x27, x0, lsr #32
 4129f20:      	sub	w8, w28, w8
 4129f24:      	ldrb	w9, [x21, #0xc]
 4129f28:      	bic	w10, w8, w8, asr #31
 4129f2c:      	cbnz	w9, 0x412a1f8 <_ChromeMain+0x4124f5c>
 4129f30:      	mov	x27, x26
 4129f34:      	ldr	w28, [sp, #0x10]
 4129f38:      	b	0x412a278 <_ChromeMain+0x4124fdc>
 4129f3c:      	ldr	w26, [x21]
 4129f40:      	ldr	x21, [x22, #0x360]
 4129f44:      	str	x21, [sp, #0x48]
 4129f48:      	ldr	x22, [x22, #0x338]
 4129f4c:      	cbz	x21, 0x4129f6c <_ChromeMain+0x4124cd0>
 4129f50:      	orr	x8, x26, #0x100000000
 4129f54:      	stp	x8, xzr, [sp, #0x70]
 4129f58:      	add	x1, sp, #0x70
 4129f5c:      	mov	x0, x21
 4129f60:      	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4129f64:      	lsr	x25, x0, #32
 4129f68:      	b	0x4129f70 <_ChromeMain+0x4124cd4>
 4129f6c:      	mov	w25, #0x0               ; =0
 4129f70:      	cbz	x22, 0x4129f98 <_ChromeMain+0x4124cfc>
 4129f74:      	adrp	x1, 0xceec000 <dyld_stub_binder+0xceec000>
 4129f78:      	add	x1, x1, #0x314
 4129f7c:      	mov	x0, x22
 4129f80:      	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4129f84:      	tst	x0, #0xffffffff00000000
 4129f88:      	ccmp	w0, #0x0, #0x4, ne
 4129f8c:      	ccmp	w25, #0x0, #0x4, ne
 4129f90:      	csel	w8, wzr, w28, le
 4129f94:      	b	0x4129f9c <_ChromeMain+0x4124d00>
 4129f98:      	mov	w8, #0x0                ; =0
 4129f9c:      	strb	w8, [sp, #0x38]
 4129fa0:      	mov	w0, #0x3f               ; =63
 4129fa4:      	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4129fa8:      	mov	x24, x0
 4129fac:      	strb	wzr, [sp, #0x58]
 4129fb0:      	mov	x22, x19
 4129fb4:      	ldp	x8, x9, [x22, #0x8]!
 4129fb8:      	stp	xzr, xzr, [sp, #0x70]
 4129fbc:      	ldr	x10, [x22, #0x10]
 4129fc0:      	adrp	x27, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4129fc4:      	cmp	x9, x10
 4129fc8:      	b.eq	0x412a458 <_ChromeMain+0x41251bc>
 4129fcc:      	mov	w10, #0x30              ; =48
 4129fd0:      	madd	x28, x9, x10, x8
 4129fd4:      	cbz	x28, 0x412a454 <_ChromeMain+0x41251b8>
 4129fd8:      	and	x8, x23, #0xfffffffc00000000
 4129fdc:      	ldr	x9, [x27, #0x88]
 4129fe0:      	cmp	x8, x9
 4129fe4:      	b.ne	0x4129ff0 <_ChromeMain+0x4124d54>
 4129fe8:      	mov	x0, x23
 4129fec:      	bl	0x142fc <_ChromeMain+0xf060>
 4129ff0:      	str	x23, [x28]
 4129ff4:      	strb	wzr, [x28, #0x8]
 4129ff8:      	strb	wzr, [x28, #0x20]
 4129ffc:      	strb	wzr, [x28, #0x24]
 412a000:      	strb	wzr, [x28, #0x28]
 412a004:      	add	x0, x28, #0x30
 412a008:      	stur	xzr, [x28, #0x14]
 412a00c:      	stur	xzr, [x28, #0xc]
 412a010:      	strb	wzr, [x28, #0x1c]
 412a014:      	ldr	x8, [x19, #0x8]
 412a018:      	subs	x8, x0, x8
 412a01c:      	asr	x8, x8, #4
 412a020:      	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 412a024:      	movk	x9, #0xaaab
 412a028:      	mul	x8, x8, x9
 412a02c:      	str	x8, [x19, #0x10]
 412a030:      	b.eq	0x412a454 <_ChromeMain+0x41251b8>
 412a034:      	stp	xzr, xzr, [sp, #0x70]
 412a038:      	ldrb	w8, [sp, #0x38]
 412a03c:      	cbz	w8, 0x412a094 <_ChromeMain+0x4124df8>
 412a040:      	sub	w8, w26, w24, lsl #1
 412a044:      	bic	w23, w8, w8, asr #31
 412a048:      	ldur	x0, [x29, #-0x70]
 412a04c:      	adrp	x1, 0xceec000 <dyld_stub_binder+0xceec000>
 412a050:      	add	x1, x1, #0x324
 412a054:      	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 412a058:      	lsr	x8, x0, #32
 412a05c:      	adds	w9, w24, w23
 412a060:      	mov	w10, #0x7fffffff        ; =2147483647
 412a064:      	csel	w9, w10, w9, vs
 412a068:      	subs	w9, w9, w24
 412a06c:      	asr	w10, w9, #31
 412a070:      	eor	w10, w10, #0x80000000
 412a074:      	csel	w9, w10, w9, vs
 412a078:      	bic	w9, w9, w9, asr #31
 412a07c:      	asr	x10, x0, #63
 412a080:      	stp	w24, wzr, [sp, #0x70]
 412a084:      	bic	w8, w8, w10
 412a088:      	stp	w9, w8, [sp, #0x78]
 412a08c:      	add	w23, w8, w24
 412a090:      	b	0x412a098 <_ChromeMain+0x4124dfc>
 412a094:      	mov	w23, #0x0               ; =0
 412a098:      	sub	x1, x29, #0x70
 412a09c:      	add	x2, sp, #0x38
 412a0a0:      	add	x3, sp, #0x70
 412a0a4:      	mov	x0, x22
 412a0a8:      	bl	0x74ecf40 <_ChromeMain+0x74e7ca4>
 412a0ac:      	strb	wzr, [sp, #0x6f]
 412a0b0:      	stp	xzr, xzr, [sp, #0x58]
 412a0b4:      	ldp	x8, x9, [x19, #0x10]
 412a0b8:      	cmp	x8, x9
 412a0bc:      	b.eq	0x412a470 <_ChromeMain+0x41251d4>
 412a0c0:      	ldr	x9, [x19, #0x8]
 412a0c4:      	mov	w10, #0x30              ; =48
 412a0c8:      	madd	x24, x8, x10, x9
 412a0cc:      	cbz	x24, 0x412a454 <_ChromeMain+0x41251b8>
 412a0d0:      	and	x8, x20, #0xfffffffc00000000
 412a0d4:      	ldr	x9, [x27, #0x88]
 412a0d8:      	cmp	x8, x9
 412a0dc:      	b.ne	0x412a0e8 <_ChromeMain+0x4124e4c>
 412a0e0:      	mov	x0, x20
 412a0e4:      	bl	0x142fc <_ChromeMain+0xf060>
 412a0e8:      	str	x20, [x24]
 412a0ec:      	strb	wzr, [x24, #0x8]
 412a0f0:      	strb	wzr, [x24, #0x20]
 412a0f4:      	strb	wzr, [x24, #0x24]
 412a0f8:      	strb	wzr, [x24, #0x28]
 412a0fc:      	add	x0, x24, #0x30
 412a100:      	stur	xzr, [x24, #0x14]
 412a104:      	stur	xzr, [x24, #0xc]
 412a108:      	strb	wzr, [x24, #0x1c]
 412a10c:      	ldr	x8, [x19, #0x8]
 412a110:      	subs	x9, x0, x8
 412a114:      	asr	x10, x9, #4
 412a118:      	mov	x11, #-0x5555555555555556 ; =-6148914691236517206
 412a11c:      	movk	x11, #0xaaab
 412a120:      	mul	x10, x10, x11
 412a124:      	str	x10, [x19, #0x10]
 412a128:      	b.eq	0x412a454 <_ChromeMain+0x41251b8>
 412a12c:      	cbz	x21, 0x412a1ec <_ChromeMain+0x4124f50>
 412a130:      	ldrb	w24, [x21, #0x1c8]
 412a134:      	strb	w24, [sp, #0x6f]
 412a138:      	stp	wzr, w23, [sp, #0x58]
 412a13c:      	adds	w11, w23, w25
 412a140:      	asr	w12, w11, #31
 412a144:      	eor	w12, w12, #0x80000000
 412a148:      	csel	w11, w12, w11, vs
 412a14c:      	subs	w11, w11, w23
 412a150:      	asr	w12, w11, #31
 412a154:      	eor	w12, w12, #0x80000000
 412a158:      	csel	w11, w12, w11, vs
 412a15c:      	bic	w20, w26, w26, asr #31
 412a160:      	bic	w11, w11, w11, asr #31
 412a164:      	stp	w20, w11, [sp, #0x60]
 412a168:      	ldr	x11, [x19, #0x18]
 412a16c:      	cmp	x10, x11
 412a170:      	b.eq	0x412a488 <_ChromeMain+0x41251ec>
 412a174:      	cbz	x0, 0x412a454 <_ChromeMain+0x41251b8>
 412a178:      	add	x22, x8, x9
 412a17c:      	and	x8, x21, #0xfffffffc00000000
 412a180:      	ldr	x9, [x27, #0x88]
 412a184:      	cmp	x8, x9
 412a188:      	b.ne	0x412a194 <_ChromeMain+0x4124ef8>
 412a18c:      	mov	x0, x21
 412a190:      	bl	0x142fc <_ChromeMain+0xf060>
 412a194:      	str	x21, [x22]
 412a198:      	strb	w24, [x22, #0x8]
 412a19c:      	ldur	q0, [sp, #0x58]
 412a1a0:      	stur	q0, [x22, #0xc]
 412a1a4:      	strb	wzr, [x22, #0x1c]
 412a1a8:      	strb	wzr, [x22, #0x20]
 412a1ac:      	strb	wzr, [x22, #0x24]
 412a1b0:      	strb	wzr, [x22, #0x28]
 412a1b4:      	add	x0, x22, #0x30
 412a1b8:      	ldr	x8, [x19, #0x8]
 412a1bc:      	subs	x8, x0, x8
 412a1c0:      	asr	x8, x8, #4
 412a1c4:      	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 412a1c8:      	movk	x9, #0xaaab
 412a1cc:      	mul	x8, x8, x9
 412a1d0:      	str	x8, [x19, #0x10]
 412a1d4:      	b.eq	0x412a454 <_ChromeMain+0x41251b8>
 412a1d8:      	add	w23, w23, w25
 412a1dc:      	bic	w8, w23, w23, asr #31
 412a1e0:      	mov	w9, w20
 412a1e4:      	orr	x8, x9, x8, lsl #32
 412a1e8:      	b	0x412a44c <_ChromeMain+0x41251b0>
 412a1ec:      	bic	w20, w26, w26, asr #31
 412a1f0:      	b	0x412a1dc <_ChromeMain+0x4124f40>
 412a1f4:      	bic	w10, w28, w28, asr #31
 412a1f8:      	str	w10, [sp]
 412a1fc:      	ldr	x0, [x22, #0x338]
 412a200:      	mov	x27, x26
 412a204:      	ldr	w28, [sp, #0x10]
 412a208:      	cbz	x0, 0x412a218 <_ChromeMain+0x4124f7c>
 412a20c:      	bl	0x4111c00 <_ChromeMain+0x410c964>
 412a210:      	lsr	x26, x0, #32
 412a214:      	b	0x412a21c <_ChromeMain+0x4124f80>
 412a218:      	mov	w26, #0x0               ; =0
 412a21c:      	cbz	x24, 0x412a264 <_ChromeMain+0x4124fc8>
 412a220:      	bl	0x270cfc0 <_ChromeMain+0x2707d24>
 412a224:      	mov	w8, #0x7                ; =7
 412a228:      	cmp	w27, #0x7
 412a22c:      	csel	w8, w27, w8, gt
 412a230:      	sub	w8, w8, #0x7
 412a234:      	cmp	w27, #0x0
 412a238:      	csel	w8, w8, wzr, gt
 412a23c:      	ldr	w10, [sp]
 412a240:      	sub	w8, w10, w8
 412a244:      	lsr	w9, w10, #1
 412a248:      	cmp	w8, w10, lsr #1
 412a24c:      	csel	w8, w8, w9, gt
 412a250:      	cmp	w8, w24
 412a254:      	csel	w8, w8, w24, lt
 412a258:      	cmp	w8, w26
 412a25c:      	csel	w24, w8, w26, gt
 412a260:      	b	0x412a268 <_ChromeMain+0x4124fcc>
 412a264:      	ldr	w10, [sp]
 412a268:      	sub	w10, w10, w24
 412a26c:      	b	0x412a278 <_ChromeMain+0x4124fdc>
 412a270:      	mov	w10, #0x0               ; =0
 412a274:      	mov	x27, x26
 412a278:      	ldrb	w8, [sp, #0x74]
 412a27c:      	tbz	w8, #0x0, 0x412a454 <_ChromeMain+0x41251b8>
 412a280:      	mov	x26, x10
 412a284:      	ldr	w8, [sp, #0x70]
 412a288:      	stp	w25, wzr, [sp, #0x58]
 412a28c:      	adds	w8, w25, w8
 412a290:      	asr	w9, w8, #31
 412a294:      	eor	w9, w9, #0x80000000
 412a298:      	csel	w8, w9, w8, vs
 412a29c:      	subs	w8, w8, w25
 412a2a0:      	asr	w9, w8, #31
 412a2a4:      	eor	w9, w9, #0x80000000
 412a2a8:      	csel	w8, w9, w8, vs
 412a2ac:      	bic	w8, w8, w8, asr #31
 412a2b0:      	bic	w9, w24, w24, asr #31
 412a2b4:      	stp	w8, w9, [sp, #0x60]
 412a2b8:      	ldrb	w8, [x23, #0x1c8]
 412a2bc:      	strb	w8, [sp, #0x48]
 412a2c0:      	add	x0, x19, #0x8
 412a2c4:      	sub	x1, x29, #0x60
 412a2c8:      	add	x2, sp, #0x48
 412a2cc:      	add	x3, sp, #0x58
 412a2d0:      	bl	0x74ecf40 <_ChromeMain+0x74e7ca4>
 412a2d4:      	ldr	w8, [sp, #0x64]
 412a2d8:      	cmp	x27, #0x0
 412a2dc:      	ldr	x24, [sp, #0x28]
 412a2e0:      	csel	w9, w24, wzr, ne
 412a2e4:      	add	w9, w8, w9
 412a2e8:      	cmp	w8, #0x0
 412a2ec:      	csel	w23, wzr, w9, eq
 412a2f0:      	stp	xzr, xzr, [sp, #0x48]
 412a2f4:      	cbz	w28, 0x412a35c <_ChromeMain+0x41250c0>
 412a2f8:      	ldrb	w8, [x21, #0x4]
 412a2fc:      	tbz	w8, #0x0, 0x412a454 <_ChromeMain+0x41251b8>
 412a300:      	ldr	w8, [x21]
 412a304:      	fmov	s0, w25
 412a308:      	str	q0, [sp]
 412a30c:      	sub	w8, w8, w25, lsl #1
 412a310:      	fmov	s0, w8
 412a314:      	str	q0, [sp, #0x10]
 412a318:      	ldur	x0, [x29, #-0x70]
 412a31c:      	adrp	x1, 0xceec000 <dyld_stub_binder+0xceec000>
 412a320:      	add	x1, x1, #0x344
 412a324:      	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 412a328:      	lsr	x8, x0, #32
 412a32c:      	ldp	q1, q0, [sp]
 412a330:      	mov.s	v1[1], w23
 412a334:      	stp	w25, w23, [sp, #0x48]
 412a338:      	mov.s	v0[1], w8
 412a33c:      	sqadd.2s	v0, v1, v0
 412a340:      	sqsub.2s	v0, v0, v1
 412a344:      	movi.2d	v1, #0000000000000000
 412a348:      	smax.2s	v0, v0, v1
 412a34c:      	str	d0, [sp, #0x50]
 412a350:      	mov.s	w8, v0[1]
 412a354:      	add	w9, w23, w24
 412a358:      	add	w23, w9, w8
 412a35c:      	add	x0, x19, #0x8
 412a360:      	sub	x1, x29, #0x70
 412a364:      	add	x2, sp, #0x6f
 412a368:      	add	x3, sp, #0x48
 412a36c:      	bl	0x74ecf40 <_ChromeMain+0x74e7ca4>
 412a370:      	ldrb	w8, [x21, #0x4]
 412a374:      	tbz	w8, #0x0, 0x412a454 <_ChromeMain+0x41251b8>
 412a378:      	ldr	w8, [x21]
 412a37c:      	stp	wzr, w23, [sp, #0x38]
 412a380:      	adds	w9, w23, w27
 412a384:      	asr	w10, w9, #31
 412a388:      	eor	w10, w10, #0x80000000
 412a38c:      	csel	w9, w10, w9, vs
 412a390:      	subs	w9, w9, w23
 412a394:      	asr	w10, w9, #31
 412a398:      	eor	w10, w10, #0x80000000
 412a39c:      	csel	w9, w10, w9, vs
 412a3a0:      	bic	w8, w8, w8, asr #31
 412a3a4:      	bic	w24, w9, w9, asr #31
 412a3a8:      	stp	w8, w24, [sp, #0x40]
 412a3ac:      	ldrb	w8, [x21, #0xc]
 412a3b0:      	cbz	w8, 0x412a40c <_ChromeMain+0x4125170>
 412a3b4:      	ldr	x0, [x22, #0x360]
 412a3b8:      	cbz	x0, 0x412a3d0 <_ChromeMain+0x4125134>
 412a3bc:      	ldr	x8, [x0]
 412a3c0:      	ldr	x8, [x8, #0x88]
 412a3c4:      	blr	x8
 412a3c8:      	lsr	x8, x0, #32
 412a3cc:      	b	0x412a3d4 <_ChromeMain+0x4125138>
 412a3d0:      	mov	w8, #0x0                ; =0
 412a3d4:      	cmp	w26, w24
 412a3d8:      	csel	w9, w26, w24, lt
 412a3dc:      	cmp	w9, w8
 412a3e0:      	csel	w8, w9, w8, gt
 412a3e4:      	adds	w8, w23, w8
 412a3e8:      	asr	w9, w8, #31
 412a3ec:      	eor	w9, w9, #0x80000000
 412a3f0:      	csel	w8, w9, w8, vs
 412a3f4:      	subs	w8, w8, w23
 412a3f8:      	asr	w9, w8, #31
 412a3fc:      	eor	w9, w9, #0x80000000
 412a400:      	csel	w8, w9, w8, vs
 412a404:      	bic	w8, w8, w8, asr #31
 412a408:      	str	w8, [sp, #0x44]
 412a40c:      	ldrb	w8, [x20, #0x1c8]
 412a410:      	strb	w8, [sp, #0x37]
 412a414:      	add	x0, x19, #0x8
 412a418:      	sub	x1, x29, #0x68
 412a41c:      	add	x2, sp, #0x37
 412a420:      	add	x3, sp, #0x38
 412a424:      	bl	0x74ecf40 <_ChromeMain+0x74e7ca4>
 412a428:      	ldrb	w8, [x21, #0x4]
 412a42c:      	tbz	w8, #0x0, 0x412a454 <_ChromeMain+0x41251b8>
 412a430:      	ldr	w8, [x21]
 412a434:      	ldr	w9, [sp, #0x3c]
 412a438:      	ldr	w10, [sp, #0x44]
 412a43c:      	add	w9, w10, w9
 412a440:      	bic	w8, w8, w8, asr #31
 412a444:      	bic	w9, w9, w9, asr #31
 412a448:      	orr	x8, x8, x9, lsl #32
 412a44c:      	str	x8, [x19]
 412a450:      	b	0x4129e48 <_ChromeMain+0x4124bac>
 412a454:      	brk	#0x1
 412a458:      	sub	x1, x29, #0x60
 412a45c:      	add	x2, sp, #0x58
 412a460:      	add	x3, sp, #0x70
 412a464:      	mov	x0, x22
 412a468:      	bl	0x412a4c0 <_ChromeMain+0x4125224>
 412a46c:      	b	0x412a014 <_ChromeMain+0x4124d78>
 412a470:      	sub	x1, x29, #0x68
 412a474:      	add	x2, sp, #0x6f
 412a478:      	add	x3, sp, #0x58
 412a47c:      	mov	x0, x22
 412a480:      	bl	0x412a4c0 <_ChromeMain+0x4125224>
 412a484:      	b	0x412a10c <_ChromeMain+0x4124e70>
 412a488:      	add	x1, sp, #0x48
 412a48c:      	add	x2, sp, #0x6f
 412a490:      	add	x3, sp, #0x58
 412a494:      	mov	x0, x22
 412a498:      	bl	0x412a4c0 <_ChromeMain+0x4125224>
 412a49c:      	b	0x412a1b8 <_ChromeMain+0x4124f1c>
		...
 412a4c0:      	sub	sp, sp, #0x60
 412a4c4:      	stp	x26, x25, [sp, #0x10]
 412a4c8:      	stp	x24, x23, [sp, #0x20]
 412a4cc:      	stp	x22, x21, [sp, #0x30]
 412a4d0:      	stp	x20, x19, [sp, #0x40]
 412a4d4:      	stp	x29, x30, [sp, #0x50]
 412a4d8:      	add	x29, sp, #0x50
 412a4dc:      	mov	x8, #0x5555555555555555 ; =6148914691236517205
 412a4e0:      	movk	x8, #0x555, lsl #48
 412a4e4:      	ldr	x24, [x0, #0x8]
 412a4e8:      	add	x9, x24, #0x1
 412a4ec:      	cmp	x9, x8
 412a4f0:      	b.hi	0x412a67c <_ChromeMain+0x41253e0>
 412a4f4:      	mov	x20, x3
 412a4f8:      	mov	x21, x2
 412a4fc:      	mov	x22, x1
 412a500:      	mov	x19, x0
 412a504:      	ldr	x10, [x0, #0x10]
 412a508:      	lsl	x11, x10, #1
 412a50c:      	cmp	x11, x9
 412a510:      	csel	x9, x11, x9, hi
 412a514:      	mov	x11, #-0x5555555555555556 ; =-6148914691236517206
 412a518:      	movk	x11, #0x2aa, lsl #48
 412a51c:      	cmp	x10, x11
 412a520:      	csel	x23, x9, x8, lo
 412a524:      	cbz	x23, 0x412a670 <_ChromeMain+0x41253d4>
 412a528:      	cmp	x23, x8
 412a52c:      	b.hi	0x412a680 <_ChromeMain+0x41253e4>
 412a530:      	add	x8, x23, x23, lsl #1
 412a534:      	lsl	x0, x8, #4
 412a538:      	bl	0xf368 <_ChromeMain+0xa0cc>
 412a53c:      	mov	w8, #0x30               ; =48
 412a540:      	madd	x24, x24, x8, x0
 412a544:      	cbz	x24, 0x412a678 <_ChromeMain+0x41253dc>
 412a548:      	ldr	x22, [x22]
 412a54c:      	and	x8, x22, #0xfffffffc00000000
 412a550:      	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 412a554:      	ldr	x9, [x25, #0x88]
 412a558:      	cmp	x8, x9
 412a55c:      	b.ne	0x412a568 <_ChromeMain+0x41252cc>
 412a560:      	mov	x0, x22
 412a564:      	bl	0x142fc <_ChromeMain+0xf060>
 412a568:      	str	x22, [x24]
 412a56c:      	ldrb	w8, [x21]
 412a570:      	strb	w8, [x24, #0x8]
 412a574:      	ldr	q0, [x20]
 412a578:      	stur	q0, [x24, #0xc]
 412a57c:      	strb	wzr, [x24, #0x1c]
 412a580:      	strb	wzr, [x24, #0x20]
 412a584:      	strb	wzr, [x24, #0x24]
 412a588:      	strb	wzr, [x24, #0x28]
 412a58c:      	ldp	x0, x8, [x19]
 412a590:      	lsl	x9, x8, #4
 412a594:      	sub	x21, x9, x8, lsl #6
 412a598:      	add	x20, x24, x21
 412a59c:      	add	x8, x8, x8, lsl #1
 412a5a0:      	lsl	x22, x8, #4
 412a5a4:      	cbz	x22, 0x412a61c <_ChromeMain+0x4125380>
 412a5a8:      	add	x8, x0, x8, lsl #4
 412a5ac:      	mov	x9, x0
 412a5b0:      	add	x10, x24, x21
 412a5b4:      	cbz	x10, 0x412a678 <_ChromeMain+0x41253dc>
 412a5b8:      	ldr	x11, [x9]
 412a5bc:      	str	x11, [x10]
 412a5c0:      	str	xzr, [x9]
 412a5c4:      	ldur	q0, [x9, #0x8]
 412a5c8:      	ldr	w11, [x9, #0x18]
 412a5cc:      	str	w11, [x10, #0x18]
 412a5d0:      	stur	q0, [x10, #0x8]
 412a5d4:      	ldur	x11, [x9, #0x1c]
 412a5d8:      	stur	x11, [x10, #0x1c]
 412a5dc:      	ldur	x11, [x9, #0x24]
 412a5e0:      	stur	x11, [x10, #0x24]
 412a5e4:      	add	x9, x9, #0x30
 412a5e8:      	add	x10, x10, #0x30
 412a5ec:      	cmp	x9, x8
 412a5f0:      	b.ne	0x412a5b4 <_ChromeMain+0x4125318>
 412a5f4:      	cbz	x0, 0x412a678 <_ChromeMain+0x41253dc>
 412a5f8:      	ldr	x8, [x0]
 412a5fc:      	and	x9, x8, #0xfffffffc00000000
 412a600:      	ldr	x10, [x25, #0x88]
 412a604:      	cmp	x9, x10
 412a608:      	b.eq	0x412a684 <_ChromeMain+0x41253e8>
 412a60c:      	str	xzr, [x0], #0x30
 412a610:      	subs	x22, x22, #0x30
 412a614:      	b.ne	0x412a5f4 <_ChromeMain+0x4125358>
 412a618:      	ldr	x0, [x19]
 412a61c:      	mov	w8, #0x30               ; =48
 412a620:      	sub	x8, x8, x21
 412a624:      	asr	x8, x8, #4
 412a628:      	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 412a62c:      	movk	x9, #0xaaab
 412a630:      	mul	x8, x8, x9
 412a634:      	stp	x20, x8, [x19]
 412a638:      	ldr	x8, [x19, #0x10]
 412a63c:      	str	x23, [x19, #0x10]
 412a640:      	cbz	x0, 0x412a650 <_ChromeMain+0x41253b4>
 412a644:      	add	x8, x8, x8, lsl #1
 412a648:      	lsl	x1, x8, #4
 412a64c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 412a650:      	add	x0, x24, #0x30
 412a654:      	ldp	x29, x30, [sp, #0x50]
 412a658:      	ldp	x20, x19, [sp, #0x40]
 412a65c:      	ldp	x22, x21, [sp, #0x30]
 412a660:      	ldp	x24, x23, [sp, #0x20]
 412a664:      	ldp	x26, x25, [sp, #0x10]
 412a668:      	add	sp, sp, #0x60
 412a66c:      	ret
 412a670:      	mov	x0, #0x0                ; =0
 412a674:      	b	0x412a53c <_ChromeMain+0x41252a0>
 412a678:      	brk	#0x1
 412a67c:      	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 412a680:      	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 412a684:      	str	x0, [sp, #0x8]
 412a688:      	mov	x0, x8
 412a68c:      	bl	0x26a44 <_ChromeMain+0x217a8>
 412a690:      	ldr	x0, [sp, #0x8]
 412a694:      	b	0x412a60c <_ChromeMain+0x4125370>
		...
