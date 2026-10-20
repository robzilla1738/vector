
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462ce28: d10283ff     	sub	sp, sp, #0xa0
 462ce2c: a9065ff8     	stp	x24, x23, [sp, #0x60]
 462ce30: a90757f6     	stp	x22, x21, [sp, #0x70]
 462ce34: a9084ff4     	stp	x20, x19, [sp, #0x80]
 462ce38: a9097bfd     	stp	x29, x30, [sp, #0x90]
 462ce3c: 910243fd     	add	x29, sp, #0x90
 462ce40: f9435016     	ldr	x22, [x0, #0x6a0]
 462ce44: b4000396     	cbz	x22, 0x462ceb4 <_ChromeMain+0x4627c18>
 462ce48: aa0003f3     	mov	x19, x0
 462ce4c: 396182c8     	ldrb	w8, [x22, #0x860]
 462ce50: 370004a8     	tbnz	w8, #0x0, 0x462cee4 <_ChromeMain+0x4627c48>
 462ce54: f9436e73     	ldr	x19, [x19, #0x6d8]
 462ce58: b40002f3     	cbz	x19, 0x462ceb4 <_ChromeMain+0x4627c18>
 462ce5c: f9407268     	ldr	x8, [x19, #0xe0]
 462ce60: b40002a8     	cbz	x8, 0x462ceb4 <_ChromeMain+0x4627c18>
 462ce64: 19404108     	ldapurb	w8, [x8, #0x4]
 462ce68: 35000268     	cbnz	w8, 0x462ceb4 <_ChromeMain+0x4627c18>
 462ce6c: f9407668     	ldr	x8, [x19, #0xe8]
 462ce70: b4000228     	cbz	x8, 0x462ceb4 <_ChromeMain+0x4627c18>
 462ce74: f9407268     	ldr	x8, [x19, #0xe0]
 462ce78: b40018e8     	cbz	x8, 0x462d194 <_ChromeMain+0x4627ef8>
 462ce7c: 19404108     	ldapurb	w8, [x8, #0x4]
 462ce80: 350018a8     	cbnz	w8, 0x462d194 <_ChromeMain+0x4627ef8>
 462ce84: f9407668     	ldr	x8, [x19, #0xe8]
 462ce88: f9402500     	ldr	x0, [x8, #0x48]
 462ce8c: b4000060     	cbz	x0, 0x462ce98 <_ChromeMain+0x4627bfc>
 462ce90: 52800001     	mov	w1, #0x0                ; =0
 462ce94: 979455da     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 462ce98: 9793292b     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 462ce9c: f90023f3     	str	x19, [sp, #0x40]
 462cea0: d0030581     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 462cea4: 91389021     	add	x1, x1, #0xe24
 462cea8: 910103e3     	add	x3, sp, #0x40
 462ceac: d2800002     	mov	x2, #0x0                ; =0
 462ceb0: 976fb445     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 462ceb4: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 462ceb8: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 462cebc: a94757f6     	ldp	x22, x21, [sp, #0x70]
 462cec0: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 462cec4: 910283ff     	add	sp, sp, #0xa0
 462cec8: d65f03c0     	ret
 462cecc: f944bec1     	ldr	x1, [x22, #0x978]
 462ced0: f944c2c2     	ldr	x2, [x22, #0x980]
 462ced4: 910103e0     	add	x0, sp, #0x40
 462ced8: 96e8673e     	bl	0x46bd0 <_ChromeMain+0x41934>
 462cedc: f9435276     	ldr	x22, [x19, #0x6a0]
 462cee0: 1400000a     	b	0x462cf08 <_ChromeMain+0x4627c6c>
 462cee4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 462cee8: f9002bff     	str	xzr, [sp, #0x50]
 462ceec: 39e63ec8     	ldrsb	w8, [x22, #0x98f]
 462cef0: 37fffee8     	tbnz	w8, #0x1f, 0x462cecc <_ChromeMain+0x4627c30>
 462cef4: 9125e2c8     	add	x8, x22, #0x978
 462cef8: 3dc00100     	ldr	q0, [x8]
 462cefc: f9400908     	ldr	x8, [x8, #0x10]
 462cf00: f9002be8     	str	x8, [sp, #0x50]
 462cf04: 3d8013e0     	str	q0, [sp, #0x40]
 462cf08: 396186c8     	ldrb	w8, [x22, #0x861]
 462cf0c: 35000ae8     	cbnz	w8, 0x462d068 <_ChromeMain+0x4627dcc>
 462cf10: 39415fe8     	ldrb	w8, [sp, #0x57]
 462cf14: 13001d0a     	sxtb	w10, w8
 462cf18: f94027e9     	ldr	x9, [sp, #0x48]
 462cf1c: 7100015f     	cmp	w10, #0x0
 462cf20: 9a88412b     	csel	x11, x9, x8, mi
 462cf24: b500010b     	cbnz	x11, 0x462cf44 <_ChromeMain+0x4627ca8>
 462cf28: f004cac1     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462cf2c: 91382821     	add	x1, x1, #0xe0a
 462cf30: 910103e0     	add	x0, sp, #0x40
 462cf34: 9732db04     	bl	0x12e3b44 <_ChromeMain+0x12de8a8>
 462cf38: 39415fe8     	ldrb	w8, [sp, #0x57]
 462cf3c: f94027e9     	ldr	x9, [sp, #0x48]
 462cf40: aa0803ea     	mov	x10, x8
 462cf44: 13001d4a     	sxtb	w10, w10
 462cf48: f94023eb     	ldr	x11, [sp, #0x40]
 462cf4c: 7100015f     	cmp	w10, #0x0
 462cf50: 910103ea     	add	x10, sp, #0x40
 462cf54: 9a8a4174     	csel	x20, x11, x10, mi
 462cf58: 9a884136     	csel	x22, x9, x8, mi
 462cf5c: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 462cf60: f90007ff     	str	xzr, [sp, #0x8]
 462cf64: 91004ad5     	add	x21, x22, #0x12
 462cf68: 92800228     	mov	x8, #-0x12              ; =-18
 462cf6c: f2efffe8     	movk	x8, #0x7fff, lsl #48
 462cf70: eb0802bf     	cmp	x21, x8
 462cf74: 54001168     	b.hi	0x462d1a0 <_ChromeMain+0x4627f04>
 462cf78: f1002abf     	cmp	x21, #0xa
 462cf7c: 54000709     	b.ls	0x462d05c <_ChromeMain+0x4627dc0>
 462cf80: 927deeb7     	and	x23, x21, #0x7ffffffffffffff8
 462cf84: d37ffae8     	lsl	x8, x23, #1
 462cf88: 91004100     	add	x0, x8, #0x10
 462cf8c: 96e788f7     	bl	0xf368 <_ChromeMain+0xa0cc>
 462cf90: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 462cf94: cb0802e8     	sub	x8, x23, x8
 462cf98: a900d7e0     	stp	x0, x21, [sp, #0x8]
 462cf9c: f9000fe8     	str	x8, [sp, #0x18]
 462cfa0: 91009015     	add	x21, x0, #0x24
 462cfa4: eb0002bf     	cmp	x21, x0
 462cfa8: 54000fa3     	b.lo	0x462d19c <_ChromeMain+0x4627f00>
 462cfac: f004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462cfb0: 91389108     	add	x8, x8, #0xe24
 462cfb4: eb0802bf     	cmp	x21, x8
 462cfb8: fa488002     	ccmp	x0, x8, #0x2, hi
 462cfbc: 54000f09     	b.ls	0x462d19c <_ChromeMain+0x4627f00>
 462cfc0: 52800749     	mov	w9, #0x3a               ; =58
 462cfc4: 72a00409     	movk	w9, #0x20, lsl #16
 462cfc8: b9002009     	str	w9, [x0, #0x20]
 462cfcc: ad400500     	ldp	q0, q1, [x8]
 462cfd0: ad000400     	stp	q0, q1, [x0]
 462cfd4: 8b1606a8     	add	x8, x21, x22, lsl #1
 462cfd8: eb15011f     	cmp	x8, x21
 462cfdc: 54000e03     	b.lo	0x462d19c <_ChromeMain+0x4627f00>
 462cfe0: eb1402bf     	cmp	x21, x20
 462cfe4: 54000068     	b.hi	0x462cff0 <_ChromeMain+0x4627d54>
 462cfe8: eb14011f     	cmp	x8, x20
 462cfec: 54000d88     	b.hi	0x462d19c <_ChromeMain+0x4627f00>
 462cff0: d37ffac2     	lsl	x2, x22, #1
 462cff4: aa1503e0     	mov	x0, x21
 462cff8: aa1403e1     	mov	x1, x20
 462cffc: 94e788b4     	bl	0x800f2cc <_ChromeMain+0x800a030>
 462d000: 78367abf     	strh	wzr, [x21, x22, lsl #1]
 462d004: f9435276     	ldr	x22, [x19, #0x6a0]
 462d008: 3cc083e0     	ldur	q0, [sp, #0x8]
 462d00c: 3d800be0     	str	q0, [sp, #0x20]
 462d010: f9400fe8     	ldr	x8, [sp, #0x18]
 462d014: f9001be8     	str	x8, [sp, #0x30]
 462d018: 910083e1     	add	x1, sp, #0x20
 462d01c: 9125c2c2     	add	x2, x22, #0x970
 462d020: aa1303e0     	mov	x0, x19
 462d024: 94008fa7     	bl	0x4650ec0 <_ChromeMain+0x464bc24>
 462d028: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 462d02c: 36f800a8     	tbz	w8, #0x1f, 0x462d040 <_ChromeMain+0x4627da4>
 462d030: f94013e0     	ldr	x0, [sp, #0x20]
 462d034: f9401be8     	ldr	x8, [sp, #0x30]
 462d038: d37ff901     	lsl	x1, x8, #1
 462d03c: 96e76f9f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462d040: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 462d044: 36fff388     	tbz	w8, #0x1f, 0x462ceb4 <_ChromeMain+0x4627c18>
 462d048: f94023e0     	ldr	x0, [sp, #0x40]
 462d04c: f9402be8     	ldr	x8, [sp, #0x50]
 462d050: d37ff901     	lsl	x1, x8, #1
 462d054: 96e76f99     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462d058: 17ffff97     	b	0x462ceb4 <_ChromeMain+0x4627c18>
 462d05c: 39007ff5     	strb	w21, [sp, #0x1f]
 462d060: 910023e0     	add	x0, sp, #0x8
 462d064: 17ffffcf     	b	0x462cfa0 <_ChromeMain+0x4627d04>
 462d068: 39415fe9     	ldrb	w9, [sp, #0x57]
 462d06c: 13001d28     	sxtb	w8, w9
 462d070: f94027ea     	ldr	x10, [sp, #0x48]
 462d074: 7100011f     	cmp	w8, #0x0
 462d078: 9a894157     	csel	x23, x10, x9, mi
 462d07c: b4000657     	cbz	x23, 0x462d144 <_ChromeMain+0x4627ea8>
 462d080: f94023e9     	ldr	x9, [sp, #0x40]
 462d084: 7100011f     	cmp	w8, #0x0
 462d088: 910103e8     	add	x8, sp, #0x40
 462d08c: 9a884134     	csel	x20, x9, x8, mi
 462d090: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 462d094: f90007ff     	str	xzr, [sp, #0x8]
 462d098: 910046f5     	add	x21, x23, #0x11
 462d09c: 92800228     	mov	x8, #-0x12              ; =-18
 462d0a0: f2efffe8     	movk	x8, #0x7fff, lsl #48
 462d0a4: eb0802bf     	cmp	x21, x8
 462d0a8: 540007c8     	b.hi	0x462d1a0 <_ChromeMain+0x4627f04>
 462d0ac: f1002abf     	cmp	x21, #0xa
 462d0b0: 54000449     	b.ls	0x462d138 <_ChromeMain+0x4627e9c>
 462d0b4: 927deeb8     	and	x24, x21, #0x7ffffffffffffff8
 462d0b8: d37ffb08     	lsl	x8, x24, #1
 462d0bc: 91004100     	add	x0, x8, #0x10
 462d0c0: 96e788aa     	bl	0xf368 <_ChromeMain+0xa0cc>
 462d0c4: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 462d0c8: cb080308     	sub	x8, x24, x8
 462d0cc: a900d7e0     	stp	x0, x21, [sp, #0x8]
 462d0d0: f9000fe8     	str	x8, [sp, #0x18]
 462d0d4: 91008815     	add	x21, x0, #0x22
 462d0d8: eb0002bf     	cmp	x21, x0
 462d0dc: 54000603     	b.lo	0x462d19c <_ChromeMain+0x4627f00>
 462d0e0: d004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462d0e4: 91379908     	add	x8, x8, #0xde6
 462d0e8: eb0802bf     	cmp	x21, x8
 462d0ec: fa488002     	ccmp	x0, x8, #0x2, hi
 462d0f0: 54000569     	b.ls	0x462d19c <_ChromeMain+0x4627f00>
 462d0f4: 52800409     	mov	w9, #0x20               ; =32
 462d0f8: 79004009     	strh	w9, [x0, #0x20]
 462d0fc: ad400500     	ldp	q0, q1, [x8]
 462d100: ad000400     	stp	q0, q1, [x0]
 462d104: 8b1706a8     	add	x8, x21, x23, lsl #1
 462d108: eb15011f     	cmp	x8, x21
 462d10c: 54000483     	b.lo	0x462d19c <_ChromeMain+0x4627f00>
 462d110: eb1402bf     	cmp	x21, x20
 462d114: 54000068     	b.hi	0x462d120 <_ChromeMain+0x4627e84>
 462d118: eb14011f     	cmp	x8, x20
 462d11c: 54000408     	b.hi	0x462d19c <_ChromeMain+0x4627f00>
 462d120: d37ffae2     	lsl	x2, x23, #1
 462d124: aa1503e0     	mov	x0, x21
 462d128: aa1403e1     	mov	x1, x20
 462d12c: 94e78868     	bl	0x800f2cc <_ChromeMain+0x800a030>
 462d130: 78377abf     	strh	wzr, [x21, x23, lsl #1]
 462d134: 17ffffb5     	b	0x462d008 <_ChromeMain+0x4627d6c>
 462d138: 39007ff5     	strb	w21, [sp, #0x1f]
 462d13c: 910023e0     	add	x0, sp, #0x8
 462d140: 17ffffe5     	b	0x462d0d4 <_ChromeMain+0x4627e38>
 462d144: 52800400     	mov	w0, #0x20               ; =32
 462d148: 96e78888     	bl	0xf368 <_ChromeMain+0xa0cc>
 462d14c: f90007e0     	str	x0, [sp, #0x8]
 462d150: d004c888     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 462d154: 3dc04100     	ldr	q0, [x8, #0x100]
 462d158: 3c8103e0     	stur	q0, [sp, #0x10]
 462d15c: 91007809     	add	x9, x0, #0x1e
 462d160: eb00013f     	cmp	x9, x0
 462d164: 540001c3     	b.lo	0x462d19c <_ChromeMain+0x4627f00>
 462d168: d004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462d16c: 91371908     	add	x8, x8, #0xdc6
 462d170: eb08013f     	cmp	x9, x8
 462d174: fa488002     	ccmp	x0, x8, #0x2, hi
 462d178: 54000129     	b.ls	0x462d19c <_ChromeMain+0x4627f00>
 462d17c: 3dc00100     	ldr	q0, [x8]
 462d180: 3d800000     	str	q0, [x0]
 462d184: 3cc0e100     	ldur	q0, [x8, #0xe]
 462d188: 3c80e000     	stur	q0, [x0, #0xe]
 462d18c: 79003c1f     	strh	wzr, [x0, #0x1e]
 462d190: 17ffff9e     	b	0x462d008 <_ChromeMain+0x4627d6c>
 462d194: d4200000     	brk	#0
 462d198: d4400000     	hlt	#0
 462d19c: d4200020     	brk	#0x1
 462d1a0: 941bdc02     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 462d1a4: d503201f     	nop
 462d1a8: d503201f     	nop
 462d1ac: d503201f     	nop
