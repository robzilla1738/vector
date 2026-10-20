
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462ce28:      	sub	sp, sp, #0xa0
 462ce2c:      	stp	x24, x23, [sp, #0x60]
 462ce30:      	stp	x22, x21, [sp, #0x70]
 462ce34:      	stp	x20, x19, [sp, #0x80]
 462ce38:      	stp	x29, x30, [sp, #0x90]
 462ce3c:      	add	x29, sp, #0x90
 462ce40:      	ldr	x22, [x0, #0x6a0]
 462ce44:      	cbz	x22, 0x462ceb4 <_ChromeMain+0x4627c18>
 462ce48:      	mov	x19, x0
 462ce4c:      	ldrb	w8, [x22, #0x860]
 462ce50:      	tbnz	w8, #0x0, 0x462cee4 <_ChromeMain+0x4627c48>
 462ce54:      	ldr	x19, [x19, #0x6d8]
 462ce58:      	cbz	x19, 0x462ceb4 <_ChromeMain+0x4627c18>
 462ce5c:      	ldr	x8, [x19, #0xe0]
 462ce60:      	cbz	x8, 0x462ceb4 <_ChromeMain+0x4627c18>
 462ce64:      	ldapurb	w8, [x8, #0x4]
 462ce68:      	cbnz	w8, 0x462ceb4 <_ChromeMain+0x4627c18>
 462ce6c:      	ldr	x8, [x19, #0xe8]
 462ce70:      	cbz	x8, 0x462ceb4 <_ChromeMain+0x4627c18>
 462ce74:      	ldr	x8, [x19, #0xe0]
 462ce78:      	cbz	x8, 0x462d194 <_ChromeMain+0x4627ef8>
 462ce7c:      	ldapurb	w8, [x8, #0x4]
 462ce80:      	cbnz	w8, 0x462d194 <_ChromeMain+0x4627ef8>
 462ce84:      	ldr	x8, [x19, #0xe8]
 462ce88:      	ldr	x0, [x8, #0x48]
 462ce8c:      	cbz	x0, 0x462ce98 <_ChromeMain+0x4627bfc>
 462ce90:      	mov	w1, #0x0                ; =0
 462ce94:      	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 462ce98:      	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 462ce9c:      	str	x19, [sp, #0x40]
 462cea0:      	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 462cea4:      	add	x1, x1, #0xe24
 462cea8:      	add	x3, sp, #0x40
 462ceac:      	mov	x2, #0x0                ; =0
 462ceb0:      	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 462ceb4:      	ldp	x29, x30, [sp, #0x90]
 462ceb8:      	ldp	x20, x19, [sp, #0x80]
 462cebc:      	ldp	x22, x21, [sp, #0x70]
 462cec0:      	ldp	x24, x23, [sp, #0x60]
 462cec4:      	add	sp, sp, #0xa0
 462cec8:      	ret
 462cecc:      	ldr	x1, [x22, #0x978]
 462ced0:      	ldr	x2, [x22, #0x980]
 462ced4:      	add	x0, sp, #0x40
 462ced8:      	bl	0x46bd0 <_ChromeMain+0x41934>
 462cedc:      	ldr	x22, [x19, #0x6a0]
 462cee0:      	b	0x462cf08 <_ChromeMain+0x4627c6c>
 462cee4:      	stp	xzr, xzr, [sp, #0x40]
 462cee8:      	str	xzr, [sp, #0x50]
 462ceec:      	ldrsb	w8, [x22, #0x98f]
 462cef0:      	tbnz	w8, #0x1f, 0x462cecc <_ChromeMain+0x4627c30>
 462cef4:      	add	x8, x22, #0x978
 462cef8:      	ldr	q0, [x8]
 462cefc:      	ldr	x8, [x8, #0x10]
 462cf00:      	str	x8, [sp, #0x50]
 462cf04:      	str	q0, [sp, #0x40]
 462cf08:      	ldrb	w8, [x22, #0x861]
 462cf0c:      	cbnz	w8, 0x462d068 <_ChromeMain+0x4627dcc>
 462cf10:      	ldrb	w8, [sp, #0x57]
 462cf14:      	sxtb	w10, w8
 462cf18:      	ldr	x9, [sp, #0x48]
 462cf1c:      	cmp	w10, #0x0
 462cf20:      	csel	x11, x9, x8, mi
 462cf24:      	cbnz	x11, 0x462cf44 <_ChromeMain+0x4627ca8>
 462cf28:      	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462cf2c:      	add	x1, x1, #0xe0a
 462cf30:      	add	x0, sp, #0x40
 462cf34:      	bl	0x12e3b44 <_ChromeMain+0x12de8a8>
 462cf38:      	ldrb	w8, [sp, #0x57]
 462cf3c:      	ldr	x9, [sp, #0x48]
 462cf40:      	mov	x10, x8
 462cf44:      	sxtb	w10, w10
 462cf48:      	ldr	x11, [sp, #0x40]
 462cf4c:      	cmp	w10, #0x0
 462cf50:      	add	x10, sp, #0x40
 462cf54:      	csel	x20, x11, x10, mi
 462cf58:      	csel	x22, x9, x8, mi
 462cf5c:      	stp	xzr, xzr, [sp, #0x10]
 462cf60:      	str	xzr, [sp, #0x8]
 462cf64:      	add	x21, x22, #0x12
 462cf68:      	mov	x8, #-0x12              ; =-18
 462cf6c:      	movk	x8, #0x7fff, lsl #48
 462cf70:      	cmp	x21, x8
 462cf74:      	b.hi	0x462d1a0 <_ChromeMain+0x4627f04>
 462cf78:      	cmp	x21, #0xa
 462cf7c:      	b.ls	0x462d05c <_ChromeMain+0x4627dc0>
 462cf80:      	and	x23, x21, #0x7ffffffffffffff8
 462cf84:      	lsl	x8, x23, #1
 462cf88:      	add	x0, x8, #0x10
 462cf8c:      	bl	0xf368 <_ChromeMain+0xa0cc>
 462cf90:      	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 462cf94:      	sub	x8, x23, x8
 462cf98:      	stp	x0, x21, [sp, #0x8]
 462cf9c:      	str	x8, [sp, #0x18]
 462cfa0:      	add	x21, x0, #0x24
 462cfa4:      	cmp	x21, x0
 462cfa8:      	b.lo	0x462d19c <_ChromeMain+0x4627f00>
 462cfac:      	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462cfb0:      	add	x8, x8, #0xe24
 462cfb4:      	cmp	x21, x8
 462cfb8:      	ccmp	x0, x8, #0x2, hi
 462cfbc:      	b.ls	0x462d19c <_ChromeMain+0x4627f00>
 462cfc0:      	mov	w9, #0x3a               ; =58
 462cfc4:      	movk	w9, #0x20, lsl #16
 462cfc8:      	str	w9, [x0, #0x20]
 462cfcc:      	ldp	q0, q1, [x8]
 462cfd0:      	stp	q0, q1, [x0]
 462cfd4:      	add	x8, x21, x22, lsl #1
 462cfd8:      	cmp	x8, x21
 462cfdc:      	b.lo	0x462d19c <_ChromeMain+0x4627f00>
 462cfe0:      	cmp	x21, x20
 462cfe4:      	b.hi	0x462cff0 <_ChromeMain+0x4627d54>
 462cfe8:      	cmp	x8, x20
 462cfec:      	b.hi	0x462d19c <_ChromeMain+0x4627f00>
 462cff0:      	lsl	x2, x22, #1
 462cff4:      	mov	x0, x21
 462cff8:      	mov	x1, x20
 462cffc:      	bl	0x800f2cc <_ChromeMain+0x800a030>
 462d000:      	strh	wzr, [x21, x22, lsl #1]
 462d004:      	ldr	x22, [x19, #0x6a0]
 462d008:      	ldur	q0, [sp, #0x8]
 462d00c:      	str	q0, [sp, #0x20]
 462d010:      	ldr	x8, [sp, #0x18]
 462d014:      	str	x8, [sp, #0x30]
 462d018:      	add	x1, sp, #0x20
 462d01c:      	add	x2, x22, #0x970
 462d020:      	mov	x0, x19
 462d024:      	bl	0x4650ec0 <_ChromeMain+0x464bc24>
 462d028:      	ldrsb	w8, [sp, #0x37]
 462d02c:      	tbz	w8, #0x1f, 0x462d040 <_ChromeMain+0x4627da4>
 462d030:      	ldr	x0, [sp, #0x20]
 462d034:      	ldr	x8, [sp, #0x30]
 462d038:      	lsl	x1, x8, #1
 462d03c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462d040:      	ldrsb	w8, [sp, #0x57]
 462d044:      	tbz	w8, #0x1f, 0x462ceb4 <_ChromeMain+0x4627c18>
 462d048:      	ldr	x0, [sp, #0x40]
 462d04c:      	ldr	x8, [sp, #0x50]
 462d050:      	lsl	x1, x8, #1
 462d054:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462d058:      	b	0x462ceb4 <_ChromeMain+0x4627c18>
 462d05c:      	strb	w21, [sp, #0x1f]
 462d060:      	add	x0, sp, #0x8
 462d064:      	b	0x462cfa0 <_ChromeMain+0x4627d04>
 462d068:      	ldrb	w9, [sp, #0x57]
 462d06c:      	sxtb	w8, w9
 462d070:      	ldr	x10, [sp, #0x48]
 462d074:      	cmp	w8, #0x0
 462d078:      	csel	x23, x10, x9, mi
 462d07c:      	cbz	x23, 0x462d144 <_ChromeMain+0x4627ea8>
 462d080:      	ldr	x9, [sp, #0x40]
 462d084:      	cmp	w8, #0x0
 462d088:      	add	x8, sp, #0x40
 462d08c:      	csel	x20, x9, x8, mi
 462d090:      	stp	xzr, xzr, [sp, #0x10]
 462d094:      	str	xzr, [sp, #0x8]
 462d098:      	add	x21, x23, #0x11
 462d09c:      	mov	x8, #-0x12              ; =-18
 462d0a0:      	movk	x8, #0x7fff, lsl #48
 462d0a4:      	cmp	x21, x8
 462d0a8:      	b.hi	0x462d1a0 <_ChromeMain+0x4627f04>
 462d0ac:      	cmp	x21, #0xa
 462d0b0:      	b.ls	0x462d138 <_ChromeMain+0x4627e9c>
 462d0b4:      	and	x24, x21, #0x7ffffffffffffff8
 462d0b8:      	lsl	x8, x24, #1
 462d0bc:      	add	x0, x8, #0x10
 462d0c0:      	bl	0xf368 <_ChromeMain+0xa0cc>
 462d0c4:      	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 462d0c8:      	sub	x8, x24, x8
 462d0cc:      	stp	x0, x21, [sp, #0x8]
 462d0d0:      	str	x8, [sp, #0x18]
 462d0d4:      	add	x21, x0, #0x22
 462d0d8:      	cmp	x21, x0
 462d0dc:      	b.lo	0x462d19c <_ChromeMain+0x4627f00>
 462d0e0:      	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462d0e4:      	add	x8, x8, #0xde6
 462d0e8:      	cmp	x21, x8
 462d0ec:      	ccmp	x0, x8, #0x2, hi
 462d0f0:      	b.ls	0x462d19c <_ChromeMain+0x4627f00>
 462d0f4:      	mov	w9, #0x20               ; =32
 462d0f8:      	strh	w9, [x0, #0x20]
 462d0fc:      	ldp	q0, q1, [x8]
 462d100:      	stp	q0, q1, [x0]
 462d104:      	add	x8, x21, x23, lsl #1
 462d108:      	cmp	x8, x21
 462d10c:      	b.lo	0x462d19c <_ChromeMain+0x4627f00>
 462d110:      	cmp	x21, x20
 462d114:      	b.hi	0x462d120 <_ChromeMain+0x4627e84>
 462d118:      	cmp	x8, x20
 462d11c:      	b.hi	0x462d19c <_ChromeMain+0x4627f00>
 462d120:      	lsl	x2, x23, #1
 462d124:      	mov	x0, x21
 462d128:      	mov	x1, x20
 462d12c:      	bl	0x800f2cc <_ChromeMain+0x800a030>
 462d130:      	strh	wzr, [x21, x23, lsl #1]
 462d134:      	b	0x462d008 <_ChromeMain+0x4627d6c>
 462d138:      	strb	w21, [sp, #0x1f]
 462d13c:      	add	x0, sp, #0x8
 462d140:      	b	0x462d0d4 <_ChromeMain+0x4627e38>
 462d144:      	mov	w0, #0x20               ; =32
 462d148:      	bl	0xf368 <_ChromeMain+0xa0cc>
 462d14c:      	str	x0, [sp, #0x8]
 462d150:      	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 462d154:      	ldr	q0, [x8, #0x100]
 462d158:      	stur	q0, [sp, #0x10]
 462d15c:      	add	x9, x0, #0x1e
 462d160:      	cmp	x9, x0
 462d164:      	b.lo	0x462d19c <_ChromeMain+0x4627f00>
 462d168:      	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462d16c:      	add	x8, x8, #0xdc6
 462d170:      	cmp	x9, x8
 462d174:      	ccmp	x0, x8, #0x2, hi
 462d178:      	b.ls	0x462d19c <_ChromeMain+0x4627f00>
 462d17c:      	ldr	q0, [x8]
 462d180:      	str	q0, [x0]
 462d184:      	ldur	q0, [x8, #0xe]
 462d188:      	stur	q0, [x0, #0xe]
 462d18c:      	strh	wzr, [x0, #0x1e]
 462d190:      	b	0x462d008 <_ChromeMain+0x4627d6c>
 462d194:      	brk	#0
 462d198:      	hlt	#0
 462d19c:      	brk	#0x1
 462d1a0:      	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 462d1a4:      	nop
 462d1a8:      	nop
 462d1ac:      	nop
 462d1b0:      	nop
 462d1b4:      	nop
 462d1b8:      	nop
 462d1bc:      	nop
 462d1c0:      	sub	sp, sp, #0xa0
 462d1c4:      	stp	x26, x25, [sp, #0x50]
 462d1c8:      	stp	x24, x23, [sp, #0x60]
 462d1cc:      	stp	x22, x21, [sp, #0x70]
 462d1d0:      	stp	x20, x19, [sp, #0x80]
 462d1d4:      	stp	x29, x30, [sp, #0x90]
 462d1d8:      	add	x29, sp, #0x90
 462d1dc:      	mov	x19, x0
 462d1e0:      	cbz	x1, 0x462d1f8 <_ChromeMain+0x4627f5c>
 462d1e4:      	ldr	x0, [x19, #0x6a8]
 462d1e8:      	cbz	x0, 0x462d1f8 <_ChromeMain+0x4627f5c>
 462d1ec:      	mov	x22, x1
 462d1f0:      	ldr	w8, [x1, #0xf8]
 462d1f4:      	cbz	w8, 0x462d23c <_ChromeMain+0x4627fa0>
 462d1f8:      	ldr	x0, [x19, #0x6c8]
 462d1fc:      	and	x8, x0, #0xfffffffc00000000
 462d200:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d204:      	ldr	x9, [x9, #0x88]
 462d208:      	cmp	x8, x9
 462d20c:      	b.ne	0x462d214 <_ChromeMain+0x4627f78>
 462d210:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d214:      	mov	w23, #0x0               ; =0
 462d218:      	str	xzr, [x19, #0x6c8]
 462d21c:      	mov	x0, x23
 462d220:      	ldp	x29, x30, [sp, #0x90]
 462d224:      	ldp	x20, x19, [sp, #0x80]
 462d228:      	ldp	x22, x21, [sp, #0x70]
 462d22c:      	ldp	x24, x23, [sp, #0x60]
 462d230:      	ldp	x26, x25, [sp, #0x50]
 462d234:      	add	sp, sp, #0xa0
 462d238:      	ret
 462d23c:      	mov	x23, x4
 462d240:      	mov	x20, x3
 462d244:      	mov	x21, x2
 462d248:      	ldr	x8, [x19, #0x848]
 462d24c:      	ldrb	w8, [x8, #0x90]
 462d250:      	cbz	w8, 0x462d264 <_ChromeMain+0x4627fc8>
 462d254:      	ldrb	w9, [x19, #0xa08]
 462d258:      	tbnz	w9, #0x0, 0x462d33c <_ChromeMain+0x46280a0>
 462d25c:      	ldrb	w9, [x19, #0xa0c]
 462d260:      	tbnz	w9, #0x0, 0x462d33c <_ChromeMain+0x46280a0>
 462d264:      	ldrb	w10, [x19, #0xce0]
 462d268:      	ldrb	w9, [x19, #0xf78]
 462d26c:      	tbz	w10, #0x0, 0x462d2d4 <_ChromeMain+0x4628038>
 462d270:      	cbnz	w9, 0x462d2e0 <_ChromeMain+0x4628044>
 462d274:      	ldrb	w8, [x19, #0xd28]
 462d278:      	cbnz	w8, 0x462d290 <_ChromeMain+0x4627ff4>
 462d27c:      	ldr	d0, [x19, #0xd40]
 462d280:      	fmov	d1, #1.00000000
 462d284:      	fcmp	d0, d1
 462d288:      	cset	w8, eq
 462d28c:      	b	0x462d2a0 <_ChromeMain+0x4628004>
 462d290:      	ldr	w8, [x19, #0xd24]
 462d294:      	cmp	w8, #0x0
 462d298:      	cset	w8, eq
 462d29c:      	ldr	d0, [x19, #0xd40]
 462d2a0:      	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 462d2a4:      	add	x9, x9, #0xb6c
 462d2a8:      	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 462d2ac:      	add	x10, x10, #0xd4
 462d2b0:      	cmp	w8, #0x0
 462d2b4:      	csel	x8, x10, x9, ne
 462d2b8:      	ldr	w9, [x19, #0x8c8]
 462d2bc:      	scvtf	d1, w9
 462d2c0:      	fmul	d0, d0, d1
 462d2c4:      	blr	x8
 462d2c8:      	fcvtzs	w9, d0
 462d2cc:      	ldr	w8, [x19, #0x1c0]
 462d2d0:      	b	0x462d2e8 <_ChromeMain+0x462804c>
 462d2d4:      	tbnz	w9, #0x0, 0x462d2e0 <_ChromeMain+0x4628044>
 462d2d8:      	cbnz	w8, 0x462d300 <_ChromeMain+0x4628064>
 462d2dc:      	b	0x462d33c <_ChromeMain+0x46280a0>
 462d2e0:      	ldr	w8, [x19, #0x1c0]
 462d2e4:      	mov	x9, x8
 462d2e8:      	cmp	w9, w8
 462d2ec:      	csel	w10, w9, w8, lt
 462d2f0:      	cmp	w8, #0x0
 462d2f4:      	csel	w8, w10, w9, gt
 462d2f8:      	cmp	w8, #0x97
 462d2fc:      	b.ge	0x462d338 <_ChromeMain+0x462809c>
 462d300:      	ldr	x0, [x19, #0x6c8]
 462d304:      	and	x8, x0, #0xfffffffc00000000
 462d308:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d30c:      	ldr	x9, [x9, #0x88]
 462d310:      	cmp	x8, x9
 462d314:      	b.ne	0x462d31c <_ChromeMain+0x4628080>
 462d318:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d31c:      	str	xzr, [x19, #0x6c8]
 462d320:      	ldr	x0, [x19, #0x6a8]
 462d324:      	mov	x1, #0x0                ; =0
 462d328:      	mov	x2, #0x0                ; =0
 462d32c:      	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d330:      	mov	w23, #0x0               ; =0
 462d334:      	b	0x462d21c <_ChromeMain+0x4627f80>
 462d338:      	ldr	x0, [x19, #0x6a8]
 462d33c:      	ldrb	w8, [x0, #0x1c8]
 462d340:      	cbz	w8, 0x462d384 <_ChromeMain+0x46280e8>
 462d344:      	bl	0x1427574 <_ChromeMain+0x14222d8>
 462d348:      	mov	w24, #0x0               ; =0
 462d34c:      	ldr	w8, [x23]
 462d350:      	cmp	w8, w0
 462d354:      	b.lt	0x462d388 <_ChromeMain+0x46280ec>
 462d358:      	add	w9, w1, w0
 462d35c:      	cmp	w8, w9
 462d360:      	b.ge	0x462d388 <_ChromeMain+0x46280ec>
 462d364:      	ldr	w8, [x23, #0x4]
 462d368:      	lsr	x9, x0, #32
 462d36c:      	cmp	w8, w9
 462d370:      	b.lt	0x462d384 <_ChromeMain+0x46280e8>
 462d374:      	add	x9, x9, x1, lsr #32
 462d378:      	cmp	w8, w9
 462d37c:      	cset	w24, lt
 462d380:      	b	0x462d388 <_ChromeMain+0x46280ec>
 462d384:      	mov	w24, #0x0               ; =0
 462d388:      	ldr	x0, [x19, #0x6a8]
 462d38c:      	ldr	x8, [x0, #0x368]
 462d390:      	cbz	x8, 0x462d3bc <_ChromeMain+0x4628120>
 462d394:      	stp	xzr, xzr, [sp, #0x30]
 462d398:      	str	wzr, [sp, #0x40]
 462d39c:      	tbnz	w24, #0x0, 0x462d40c <_ChromeMain+0x4628170>
 462d3a0:      	mov	x24, #0x0               ; =0
 462d3a4:      	mov	w23, #0x0               ; =0
 462d3a8:      	mov	x1, #0x0                ; =0
 462d3ac:      	mov	x2, #0x0                ; =0
 462d3b0:      	b	0x462d4dc <_ChromeMain+0x4628240>
 462d3b4:      	mov	w8, #0x0                ; =0
 462d3b8:      	b	0x462d3fc <_ChromeMain+0x4628160>
 462d3bc:      	mov	x0, x19
 462d3c0:      	bl	0x464d3f0 <_ChromeMain+0x4648154>
 462d3c4:      	mov	w8, #0x0                ; =0
 462d3c8:      	ldr	w9, [x23]
 462d3cc:      	cmp	w9, w0
 462d3d0:      	b.lt	0x462d3fc <_ChromeMain+0x4628160>
 462d3d4:      	add	w10, w1, w0
 462d3d8:      	cmp	w9, w10
 462d3dc:      	b.ge	0x462d3fc <_ChromeMain+0x4628160>
 462d3e0:      	ldr	w8, [x23, #0x4]
 462d3e4:      	lsr	x9, x0, #32
 462d3e8:      	cmp	w8, w9
 462d3ec:      	b.lt	0x462d3b4 <_ChromeMain+0x4628118>
 462d3f0:      	add	x9, x9, x1, lsr #32
 462d3f4:      	cmp	w8, w9
 462d3f8:      	cset	w8, lt
 462d3fc:      	stp	xzr, xzr, [sp, #0x30]
 462d400:      	str	wzr, [sp, #0x40]
 462d404:      	ldr	x0, [x19, #0x6a8]
 462d408:      	tbz	w24, #0x0, 0x462d444 <_ChromeMain+0x46281a8>
 462d40c:      	add	x8, sp, #0x18
 462d410:      	mov	x1, x23
 462d414:      	bl	0x4606940 <_ChromeMain+0x46016a4>
 462d418:      	ldrb	w8, [sp, #0x28]
 462d41c:      	strb	w8, [sp, #0x40]
 462d420:      	ldur	q0, [sp, #0x18]
 462d424:      	str	q0, [sp, #0x30]
 462d428:      	ldr	x0, [x19, #0x6a8]
 462d42c:      	tbnz	w8, #0x0, 0x462d4b8 <_ChromeMain+0x462821c>
 462d430:      	mov	w23, #0x0               ; =0
 462d434:      	mov	x1, #0x0                ; =0
 462d438:      	mov	x2, #0x0                ; =0
 462d43c:      	mov	x24, x22
 462d440:      	b	0x462d4dc <_ChromeMain+0x4628240>
 462d444:      	cbnz	w8, 0x462d460 <_ChromeMain+0x46281c4>
 462d448:      	mov	x1, #0x0                ; =0
 462d44c:      	mov	x2, #0x0                ; =0
 462d450:      	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d454:      	mov	w23, #0x0               ; =0
 462d458:      	mov	x24, #0x0               ; =0
 462d45c:      	b	0x462d4e0 <_ChromeMain+0x4628244>
 462d460:      	ldrb	w8, [x0, #0x560]
 462d464:      	cmp	w8, #0x0
 462d468:      	mov	w8, #0x368              ; =872
 462d46c:      	mov	w9, #0x558              ; =1368
 462d470:      	csel	x8, x9, x8, ne
 462d474:      	ldr	x1, [x0, x8]
 462d478:      	mov	w23, #0x1               ; =1
 462d47c:      	mov	w2, #0x1                ; =1
 462d480:      	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d484:      	mov	x0, x19
 462d488:      	bl	0x464d3f0 <_ChromeMain+0x4648154>
 462d48c:      	stp	x0, x1, [sp, #0x18]
 462d490:      	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 462d494:      	ldr	q0, [x8, #0xa50]
 462d498:      	str	q0, [sp]
 462d49c:      	add	x0, sp, #0x18
 462d4a0:      	mov	x1, sp
 462d4a4:      	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 462d4a8:      	ldur	q0, [sp, #0x18]
 462d4ac:      	str	q0, [sp, #0x30]
 462d4b0:      	strb	w23, [sp, #0x40]
 462d4b4:      	ldr	x0, [x19, #0x6a8]
 462d4b8:      	ldrb	w8, [x0, #0x560]
 462d4bc:      	cmp	w8, #0x0
 462d4c0:      	mov	w8, #0x368              ; =872
 462d4c4:      	mov	w9, #0x558              ; =1368
 462d4c8:      	csel	x8, x9, x8, ne
 462d4cc:      	ldr	x1, [x0, x8]
 462d4d0:      	mov	w23, #0x1               ; =1
 462d4d4:      	mov	x24, x22
 462d4d8:      	mov	w2, #0x1                ; =1
 462d4dc:      	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d4e0:      	and	x8, x24, #0xfffffffc00000000
 462d4e4:      	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d4e8:      	ldr	x9, [x25, #0x88]
 462d4ec:      	cmp	x8, x9
 462d4f0:      	b.ne	0x462d4fc <_ChromeMain+0x4628260>
 462d4f4:      	mov	x0, x24
 462d4f8:      	bl	0x142fc <_ChromeMain+0xf060>
 462d4fc:      	ldr	x0, [x19, #0x6c8]
 462d500:      	and	x8, x0, #0xfffffffc00000000
 462d504:      	ldr	x9, [x25, #0x88]
 462d508:      	cmp	x8, x9
 462d50c:      	b.ne	0x462d514 <_ChromeMain+0x4628278>
 462d510:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d514:      	str	x24, [x19, #0x6c8]
 462d518:      	cbz	w23, 0x462d53c <_ChromeMain+0x46282a0>
 462d51c:      	add	x1, x22, #0x8
 462d520:      	add	x4, sp, #0x30
 462d524:      	mov	x0, x19
 462d528:      	mov	x2, x21
 462d52c:      	mov	x3, x20
 462d530:      	mov	w5, #0x1                ; =1
 462d534:      	bl	0x4651140 <_ChromeMain+0x464bea4>
 462d538:      	b	0x462d21c <_ChromeMain+0x4627f80>
 462d53c:      	ldr	x20, [x19, #0x6b8]
 462d540:      	cbz	x20, 0x462d560 <_ChromeMain+0x46282c4>
 462d544:      	ldrb	w8, [x20, #0x338]
 462d548:      	cbnz	w8, 0x462d57c <_ChromeMain+0x46282e0>
 462d54c:      	ldr	x8, [x20]
 462d550:      	ldr	x8, [x8, #0xa0]
 462d554:      	mov	x0, x20
 462d558:      	mov	w1, #0x0                ; =0
 462d55c:      	blr	x8
 462d560:      	ldr	x0, [x19, #0xca0]
 462d564:      	str	xzr, [x19, #0xca0]
 462d568:      	cbz	x0, 0x462d21c <_ChromeMain+0x4627f80>
 462d56c:      	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462d570:      	mov	w1, #0x18               ; =24
 462d574:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462d578:      	b	0x462d21c <_ChromeMain+0x4627f80>
 462d57c:      	strb	wzr, [x20, #0x338]
 462d580:      	ldr	x0, [x20, #0x348]
 462d584:      	add	x1, x20, #0x328
 462d588:      	bl	0x2109700 <_ChromeMain+0x2104464>
 462d58c:      	ldr	x8, [x20, #0x328]
 462d590:      	ldr	x8, [x8, #0x38]
 462d594:      	add	x0, x20, #0x328
 462d598:      	blr	x8
 462d59c:      	ldr	x8, [x20, #0x340]
 462d5a0:      	cbz	x8, 0x462d54c <_ChromeMain+0x46282b0>
 462d5a4:      	ldr	x8, [x20, #0x328]
 462d5a8:      	ldr	x8, [x8, #0x40]
 462d5ac:      	add	x0, x20, #0x328
 462d5b0:      	blr	x8
 462d5b4:      	ldr	x8, [x20, #0x340]
 462d5b8:      	ldr	x9, [x8]
 462d5bc:      	cmp	w0, #0x0
 462d5c0:      	mov	w10, #0x10              ; =16
 462d5c4:      	mov	w11, #0x20              ; =32
 462d5c8:      	csel	x10, x11, x10, ne
 462d5cc:      	ldr	x9, [x9, x10]
 462d5d0:      	add	x1, x20, #0x328
 462d5d4:      	mov	x0, x8
 462d5d8:      	blr	x9
 462d5dc:      	b	0x462d54c <_ChromeMain+0x46282b0>
 462d5e0:      	cbz	x1, 0x462d6ac <_ChromeMain+0x4628410>
 462d5e4:      	sub	sp, sp, #0x50
 462d5e8:      	stp	x22, x21, [sp, #0x20]
 462d5ec:      	stp	x20, x19, [sp, #0x30]
 462d5f0:      	stp	x29, x30, [sp, #0x40]
 462d5f4:      	add	x29, sp, #0x40
 462d5f8:      	mov	x19, x0
 462d5fc:      	ldr	x8, [x0, #0x6a8]
 462d600:      	cbz	x8, 0x462d69c <_ChromeMain+0x4628400>
 462d604:      	mov	x20, x1
 462d608:      	ldr	w8, [x1, #0xf8]
 462d60c:      	cbnz	w8, 0x462d69c <_ChromeMain+0x4628400>
 462d610:      	ldr	x0, [x19, #0x6a0]
 462d614:      	cbz	x0, 0x462d624 <_ChromeMain+0x4628388>
 462d618:      	ldr	x1, [x20, #0x60]
 462d61c:      	bl	0x461356c <_ChromeMain+0x460e2d0>
 462d620:      	tbnz	x0, #0x20, 0x462d6b0 <_ChromeMain+0x4628414>
 462d624:      	ldr	x0, [x19, #0x6a8]
 462d628:      	ldr	x8, [x0, #0x340]
 462d62c:      	cbz	x8, 0x462d638 <_ChromeMain+0x462839c>
 462d630:      	ldr	w8, [x20, #0xf8]
 462d634:      	cbz	w8, 0x462d6e4 <_ChromeMain+0x4628448>
 462d638:      	ldr	x0, [x19, #0x6c8]
 462d63c:      	and	x8, x0, #0xfffffffc00000000
 462d640:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d644:      	ldr	x9, [x9, #0x88]
 462d648:      	cmp	x8, x9
 462d64c:      	b.ne	0x462d654 <_ChromeMain+0x46283b8>
 462d650:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d654:      	str	xzr, [x19, #0x6c8]
 462d658:      	ldr	x20, [x19, #0x6b8]
 462d65c:      	cbz	x20, 0x462d67c <_ChromeMain+0x46283e0>
 462d660:      	ldrb	w8, [x20, #0x338]
 462d664:      	cbnz	w8, 0x462d840 <_ChromeMain+0x46285a4>
 462d668:      	ldr	x8, [x20]
 462d66c:      	ldr	x8, [x8, #0xa0]
 462d670:      	mov	x0, x20
 462d674:      	mov	w1, #0x0                ; =0
 462d678:      	blr	x8
 462d67c:      	ldr	x0, [x19, #0xca0]
 462d680:      	str	xzr, [x19, #0xca0]
 462d684:      	cbnz	x0, 0x462d6d4 <_ChromeMain+0x4628438>
 462d688:      	mov	x0, x19
 462d68c:      	bl	0x4645400 <_ChromeMain+0x4640164>
 462d690:      	mov	x0, x19
 462d694:      	mov	w1, #0x0                ; =0
 462d698:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 462d69c:      	ldp	x29, x30, [sp, #0x40]
 462d6a0:      	ldp	x20, x19, [sp, #0x30]
 462d6a4:      	ldp	x22, x21, [sp, #0x20]
 462d6a8:      	add	sp, sp, #0x50
 462d6ac:      	ret
 462d6b0:      	ldr	x8, [x19, #0x468]
 462d6b4:      	cbz	x8, 0x462d624 <_ChromeMain+0x4628388>
 462d6b8:      	mov	x21, x0
 462d6bc:      	ldr	x0, [x8]
 462d6c0:      	ldr	w8, [x0, #0x18]
 462d6c4:      	cmp	w8, #0x1
 462d6c8:      	b.lt	0x462d624 <_ChromeMain+0x4628388>
 462d6cc:      	mov	x22, #0x0               ; =0
 462d6d0:      	b	0x462d740 <_ChromeMain+0x46284a4>
 462d6d4:      	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462d6d8:      	mov	w1, #0x18               ; =24
 462d6dc:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462d6e0:      	b	0x462d688 <_ChromeMain+0x46283ec>
 462d6e4:      	add	x1, x20, #0x80
 462d6e8:      	add	x2, x20, #0x8
 462d6ec:      	bl	0x46070b8 <_ChromeMain+0x4601e1c>
 462d6f0:      	tbz	w0, #0x0, 0x462d638 <_ChromeMain+0x462839c>
 462d6f4:      	ldr	x8, [x19, #0x458]
 462d6f8:      	cbz	x8, 0x462d638 <_ChromeMain+0x462839c>
 462d6fc:      	ldr	x8, [x8, #0x538]
 462d700:      	cbz	x8, 0x462d638 <_ChromeMain+0x462839c>
 462d704:      	ldr	x0, [x8, #0x68]
 462d708:      	bl	0xbfb87c <_ChromeMain+0xbf65e0>
 462d70c:      	cbz	x0, 0x462d638 <_ChromeMain+0x462839c>
 462d710:      	mov	x21, x0
 462d714:      	ldrb	w8, [x0, #0x21]
 462d718:      	cbz	w8, 0x462d638 <_ChromeMain+0x462839c>
 462d71c:      	ldr	x8, [x20, #0x38]
 462d720:      	cbz	x8, 0x462d638 <_ChromeMain+0x462839c>
 462d724:      	b	0x462d80c <_ChromeMain+0x4628570>
 462d728:      	add	x22, x22, #0x1
 462d72c:      	ldr	x8, [x19, #0x468]
 462d730:      	ldr	x0, [x8]
 462d734:      	ldrsw	x8, [x0, #0x18]
 462d738:      	cmp	x22, x8
 462d73c:      	b.ge	0x462d624 <_ChromeMain+0x4628388>
 462d740:      	mov	x1, x22
 462d744:      	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462d748:      	cbz	x0, 0x462d728 <_ChromeMain+0x462848c>
 462d74c:      	ldr	w8, [x0, #0x10]
 462d750:      	cmp	w8, w21
 462d754:      	b.ne	0x462d728 <_ChromeMain+0x462848c>
 462d758:      	ldr	x8, [x19, #0x468]
 462d75c:      	ldr	x0, [x8]
 462d760:      	mov	x1, x22
 462d764:      	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462d768:      	ldrb	w8, [x0, #0x61]
 462d76c:      	cbnz	w8, 0x462d624 <_ChromeMain+0x4628388>
 462d770:      	ldr	x0, [x19, #0x468]
 462d774:      	mov	x1, x22
 462d778:      	mov	w2, #0x1                ; =1
 462d77c:      	bl	0x7d524cc <_ChromeMain+0x7d4d230>
 462d780:      	ldr	x0, [x19, #0x6a8]
 462d784:      	ldr	x8, [x0, #0x340]
 462d788:      	cbz	x8, 0x462d794 <_ChromeMain+0x46284f8>
 462d78c:      	ldr	w8, [x20, #0xf8]
 462d790:      	cbz	w8, 0x462d7f8 <_ChromeMain+0x462855c>
 462d794:      	ldr	x8, [x19, #0x468]
 462d798:      	cbz	x8, 0x462d638 <_ChromeMain+0x462839c>
 462d79c:      	ldr	x0, [x8]
 462d7a0:      	ldr	w8, [x0, #0x18]
 462d7a4:      	cmp	w8, #0x1
 462d7a8:      	b.lt	0x462d638 <_ChromeMain+0x462839c>
 462d7ac:      	mov	x20, #0x0               ; =0
 462d7b0:      	b	0x462d7cc <_ChromeMain+0x4628530>
 462d7b4:      	add	x20, x20, #0x1
 462d7b8:      	ldr	x8, [x19, #0x468]
 462d7bc:      	ldr	x0, [x8]
 462d7c0:      	ldrsw	x8, [x0, #0x18]
 462d7c4:      	cmp	x20, x8
 462d7c8:      	b.ge	0x462d638 <_ChromeMain+0x462839c>
 462d7cc:      	mov	x1, x20
 462d7d0:      	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462d7d4:      	cbz	x0, 0x462d7b4 <_ChromeMain+0x4628518>
 462d7d8:      	ldr	w8, [x0, #0x10]
 462d7dc:      	cmp	w8, w21
 462d7e0:      	b.ne	0x462d7b4 <_ChromeMain+0x4628518>
 462d7e4:      	ldr	x0, [x19, #0x468]
 462d7e8:      	mov	x1, x20
 462d7ec:      	mov	w2, #0x0                ; =0
 462d7f0:      	bl	0x7d524cc <_ChromeMain+0x7d4d230>
 462d7f4:      	b	0x462d638 <_ChromeMain+0x462839c>
 462d7f8:      	add	x1, x20, #0x80
 462d7fc:      	add	x2, x20, #0x8
 462d800:      	bl	0x46070b8 <_ChromeMain+0x4601e1c>
 462d804:      	tbnz	w0, #0x0, 0x462d6f4 <_ChromeMain+0x4628458>
 462d808:      	b	0x462d794 <_ChromeMain+0x46284f8>
 462d80c:      	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 462d810:      	add	x0, x0, #0xdb3
 462d814:      	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 462d818:      	add	x1, x1, #0xb1e
 462d81c:      	mov	x8, sp
 462d820:      	mov	w2, #0x328e             ; =12942
 462d824:      	bl	0x50c80 <_ChromeMain+0x4b9e4>
 462d828:      	mov	x3, sp
 462d82c:      	mov	x0, x21
 462d830:      	mov	x1, x20
 462d834:      	mov	w2, #0x0                ; =0
 462d838:      	bl	0xa5523d4 <_ChromeMain+0xa54d138>
 462d83c:      	b	0x462d638 <_ChromeMain+0x462839c>
 462d840:      	strb	wzr, [x20, #0x338]
 462d844:      	ldr	x0, [x20, #0x348]
 462d848:      	add	x1, x20, #0x328
 462d84c:      	bl	0x2109700 <_ChromeMain+0x2104464>
 462d850:      	ldr	x8, [x20, #0x328]
 462d854:      	ldr	x8, [x8, #0x38]
 462d858:      	add	x0, x20, #0x328
 462d85c:      	blr	x8
 462d860:      	ldr	x8, [x20, #0x340]
 462d864:      	cbz	x8, 0x462d668 <_ChromeMain+0x46283cc>
 462d868:      	ldr	x8, [x20, #0x328]
 462d86c:      	ldr	x8, [x8, #0x40]
 462d870:      	add	x0, x20, #0x328
 462d874:      	blr	x8
 462d878:      	ldr	x8, [x20, #0x340]
 462d87c:      	ldr	x9, [x8]
 462d880:      	cmp	w0, #0x0
 462d884:      	mov	w10, #0x10              ; =16
 462d888:      	mov	w11, #0x20              ; =32
 462d88c:      	csel	x10, x11, x10, ne
 462d890:      	ldr	x9, [x9, x10]
 462d894:      	add	x1, x20, #0x328
 462d898:      	mov	x0, x8
 462d89c:      	blr	x9
 462d8a0:      	b	0x462d668 <_ChromeMain+0x46283cc>
 462d8a4:      	stp	x20, x19, [sp, #-0x20]!
 462d8a8:      	stp	x29, x30, [sp, #0x10]
 462d8ac:      	add	x29, sp, #0x10
 462d8b0:      	mov	x19, x0
 462d8b4:      	ldr	x0, [x0, #0x6c8]
 462d8b8:      	and	x8, x0, #0xfffffffc00000000
 462d8bc:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d8c0:      	ldr	x9, [x9, #0x88]
 462d8c4:      	cmp	x8, x9
 462d8c8:      	b.ne	0x462d8d0 <_ChromeMain+0x4628634>
 462d8cc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d8d0:      	str	xzr, [x19, #0x6c8]
 462d8d4:      	ldr	x0, [x19, #0x6a8]
 462d8d8:      	cbz	x0, 0x462d8e8 <_ChromeMain+0x462864c>
 462d8dc:      	mov	x1, #0x0                ; =0
 462d8e0:      	mov	x2, #0x0                ; =0
 462d8e4:      	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d8e8:      	ldr	x20, [x19, #0x6b8]
 462d8ec:      	cbz	x20, 0x462d90c <_ChromeMain+0x4628670>
 462d8f0:      	ldrb	w8, [x20, #0x338]
 462d8f4:      	cbnz	w8, 0x462d938 <_ChromeMain+0x462869c>
 462d8f8:      	ldr	x8, [x20]
 462d8fc:      	ldr	x8, [x8, #0xa0]
 462d900:      	mov	x0, x20
 462d904:      	mov	w1, #0x0                ; =0
 462d908:      	blr	x8
 462d90c:      	ldr	x0, [x19, #0xca0]
 462d910:      	str	xzr, [x19, #0xca0]
 462d914:      	cbnz	x0, 0x462d924 <_ChromeMain+0x4628688>
 462d918:      	ldp	x29, x30, [sp, #0x10]
 462d91c:      	ldp	x20, x19, [sp], #0x20
 462d920:      	ret
 462d924:      	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462d928:      	mov	w1, #0x18               ; =24
 462d92c:      	ldp	x29, x30, [sp, #0x10]
 462d930:      	ldp	x20, x19, [sp], #0x20
 462d934:      	b	0x8eb8 <_ChromeMain+0x3c1c>
 462d938:      	strb	wzr, [x20, #0x338]
 462d93c:      	ldr	x0, [x20, #0x348]
 462d940:      	add	x1, x20, #0x328
 462d944:      	bl	0x2109700 <_ChromeMain+0x2104464>
 462d948:      	ldr	x8, [x20, #0x328]
 462d94c:      	ldr	x8, [x8, #0x38]
 462d950:      	add	x0, x20, #0x328
 462d954:      	blr	x8
 462d958:      	ldr	x8, [x20, #0x340]
 462d95c:      	cbz	x8, 0x462d8f8 <_ChromeMain+0x462865c>
 462d960:      	ldr	x8, [x20, #0x328]
 462d964:      	ldr	x8, [x8, #0x40]
 462d968:      	add	x0, x20, #0x328
 462d96c:      	blr	x8
 462d970:      	ldr	x8, [x20, #0x340]
 462d974:      	ldr	x9, [x8]
 462d978:      	cmp	w0, #0x0
 462d97c:      	mov	w10, #0x10              ; =16
 462d980:      	mov	w11, #0x20              ; =32
 462d984:      	csel	x10, x11, x10, ne
 462d988:      	ldr	x9, [x9, x10]
 462d98c:      	add	x1, x20, #0x328
 462d990:      	mov	x0, x8
 462d994:      	blr	x9
 462d998:      	b	0x462d8f8 <_ChromeMain+0x462865c>
