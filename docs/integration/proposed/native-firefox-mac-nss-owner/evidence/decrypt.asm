
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46beb2c: d10283ff     	sub	sp, sp, #0xa0
 46beb30: a9065ff8     	stp	x24, x23, [sp, #0x60]
 46beb34: a90757f6     	stp	x22, x21, [sp, #0x70]
 46beb38: a9084ff4     	stp	x20, x19, [sp, #0x80]
 46beb3c: a9097bfd     	stp	x29, x30, [sp, #0x90]
 46beb40: 910243fd     	add	x29, sp, #0x90
 46beb44: aa0803f3     	mov	x19, x8
 46beb48: 3941a008     	ldrb	w8, [x0, #0x68]
 46beb4c: 37000128     	tbnz	w8, #0x0, 0x46beb70 <_ChromeMain+0x46b98d4>
 46beb50: a9007e7f     	stp	xzr, xzr, [x19]
 46beb54: f9000a7f     	str	xzr, [x19, #0x10]
 46beb58: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 46beb5c: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 46beb60: a94757f6     	ldp	x22, x21, [sp, #0x70]
 46beb64: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 46beb68: 910283ff     	add	sp, sp, #0xa0
 46beb6c: d65f03c0     	ret
 46beb70: aa0103f5     	mov	x21, x1
 46beb74: 39405c21     	ldrb	w1, [x1, #0x17]
 46beb78: f94006a9     	ldr	x9, [x21, #0x8]
 46beb7c: 7219003f     	tst	w1, #0x80
 46beb80: 9a811128     	csel	x8, x9, x1, ne
 46beb84: b4fffe68     	cbz	x8, 0x46beb50 <_ChromeMain+0x46b98b4>
 46beb88: aa0003f4     	mov	x20, x0
 46beb8c: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 46beb90: f9002fff     	str	xzr, [sp, #0x58]
 46beb94: 373808e1     	tbnz	w1, #0x7, 0x46becb0 <_ChromeMain+0x46b9a14>
 46beb98: 394002a9     	ldrb	w9, [x21]
 46beb9c: 7101f93f     	cmp	w9, #0x7e
 46beba0: 54000921     	b.ne	0x46becc4 <_ChromeMain+0x46b9a28>
 46beba4: d1000514     	sub	x20, x8, #0x1
 46beba8: 92800209     	mov	x9, #-0x11              ; =-17
 46bebac: f2efffe9     	movk	x9, #0x7fff, lsl #48
 46bebb0: eb09029f     	cmp	x20, x9
 46bebb4: 540011c2     	b.hs	0x46bedec <_ChromeMain+0x46b9b50>
 46bebb8: f1005d1f     	cmp	x8, #0x17
 46bebbc: 54000688     	b.hi	0x46bec8c <_ChromeMain+0x46b99f0>
 46bebc0: 39011ff4     	strb	w20, [sp, #0x47]
 46bebc4: 9100c3f6     	add	x22, sp, #0x30
 46bebc8: 8b1402c8     	add	x8, x22, x20
 46bebcc: eb16011f     	cmp	x8, x22
 46bebd0: 540010c3     	b.lo	0x46bede8 <_ChromeMain+0x46b9b4c>
 46bebd4: 910006a1     	add	x1, x21, #0x1
 46bebd8: eb08003f     	cmp	x1, x8
 46bebdc: fa563020     	ccmp	x1, x22, #0x0, lo
 46bebe0: 54001042     	b.hs	0x46bede8 <_ChromeMain+0x46b9b4c>
 46bebe4: aa1603e0     	mov	x0, x22
 46bebe8: aa1403e2     	mov	x2, x20
 46bebec: 94e541b8     	bl	0x800f2cc <_ChromeMain+0x800a030>
 46bebf0: 38346adf     	strb	wzr, [x22, x20]
 46bebf4: 39811fe8     	ldrsb	x8, [sp, #0x47]
 46bebf8: 9100c3e9     	add	x9, sp, #0x30
 46bebfc: a9432fea     	ldp	x10, x11, [sp, #0x30]
 46bec00: f100011f     	cmp	x8, #0x0
 46bec04: 9a894140     	csel	x0, x10, x9, mi
 46bec08: 7100011f     	cmp	w8, #0x0
 46bec0c: 9a884161     	csel	x1, x11, x8, mi
 46bec10: 910123e2     	add	x2, sp, #0x48
 46bec14: 52800003     	mov	w3, #0x0                ; =0
 46bec18: 9787ab48     	bl	0x28a9938 <_ChromeMain+0x28a469c>
 46bec1c: aa0003f4     	mov	x20, x0
 46bec20: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 46bec24: 37f80248     	tbnz	w8, #0x1f, 0x46bec6c <_ChromeMain+0x46b99d0>
 46bec28: 360002d4     	tbz	w20, #0x0, 0x46bec80 <_ChromeMain+0x46b99e4>
 46bec2c: 39817fe8     	ldrsb	x8, [sp, #0x5f]
 46bec30: 910123e9     	add	x9, sp, #0x48
 46bec34: a944afea     	ldp	x10, x11, [sp, #0x48]
 46bec38: f100011f     	cmp	x8, #0x0
 46bec3c: 9a894140     	csel	x0, x10, x9, mi
 46bec40: 7100011f     	cmp	w8, #0x0
 46bec44: 9a884161     	csel	x1, x11, x8, mi
 46bec48: aa1303e8     	mov	x8, x19
 46bec4c: 97088db1     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 46bec50: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 46bec54: 36fff828     	tbz	w8, #0x1f, 0x46beb58 <_ChromeMain+0x46b98bc>
 46bec58: f94027e0     	ldr	x0, [sp, #0x48]
 46bec5c: f9402fe8     	ldr	x8, [sp, #0x58]
 46bec60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bec64: 96e52895     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bec68: 17ffffbc     	b	0x46beb58 <_ChromeMain+0x46b98bc>
 46bec6c: f9401be0     	ldr	x0, [sp, #0x30]
 46bec70: f94023e8     	ldr	x8, [sp, #0x40]
 46bec74: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bec78: 96e52890     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bec7c: 3707fd94     	tbnz	w20, #0x0, 0x46bec2c <_ChromeMain+0x46b9990>
 46bec80: a9007e7f     	stp	xzr, xzr, [x19]
 46bec84: f9000a7f     	str	xzr, [x19, #0x10]
 46bec88: 17fffff2     	b	0x46bec50 <_ChromeMain+0x46b99b4>
 46bec8c: 927cea97     	and	x23, x20, #0x7ffffffffffffff0
 46bec90: 910042e0     	add	x0, x23, #0x10
 46bec94: 96e541b5     	bl	0xf368 <_ChromeMain+0xa0cc>
 46bec98: aa0003f6     	mov	x22, x0
 46bec9c: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 46beca0: cb0802e8     	sub	x8, x23, x8
 46beca4: a90353e0     	stp	x0, x20, [sp, #0x30]
 46beca8: f90023e8     	str	x8, [sp, #0x40]
 46becac: 17ffffc7     	b	0x46bebc8 <_ChromeMain+0x46b992c>
 46becb0: f94002b5     	ldr	x21, [x21]
 46becb4: 394002aa     	ldrb	w10, [x21]
 46becb8: aa0903e1     	mov	x1, x9
 46becbc: 7101f95f     	cmp	w10, #0x7e
 46becc0: 54fff720     	b.eq	0x46beba4 <_ChromeMain+0x46b9908>
 46becc4: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 46becc8: f90023ff     	str	xzr, [sp, #0x40]
 46beccc: 9100c3e2     	add	x2, sp, #0x30
 46becd0: aa1503e0     	mov	x0, x21
 46becd4: 52800003     	mov	w3, #0x0                ; =0
 46becd8: 9787ab18     	bl	0x28a9938 <_ChromeMain+0x28a469c>
 46becdc: 35000140     	cbnz	w0, 0x46bed04 <_ChromeMain+0x46b9a68>
 46bece0: a9007e7f     	stp	xzr, xzr, [x19]
 46bece4: f9000a7f     	str	xzr, [x19, #0x10]
 46bece8: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 46becec: 36fffb28     	tbz	w8, #0x1f, 0x46bec50 <_ChromeMain+0x46b99b4>
 46becf0: f9401be0     	ldr	x0, [sp, #0x30]
 46becf4: f94023e8     	ldr	x8, [sp, #0x40]
 46becf8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46becfc: 96e5286f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bed00: 17ffffd4     	b	0x46bec50 <_ChromeMain+0x46b99b4>
 46bed04: f9400a88     	ldr	x8, [x20, #0x10]
 46bed08: b4fffec8     	cbz	x8, 0x46bece0 <_ChromeMain+0x46b9a44>
 46bed0c: d63f0100     	blr	x8
 46bed10: b4fffe80     	cbz	x0, 0x46bece0 <_ChromeMain+0x46b9a44>
 46bed14: aa0003f6     	mov	x22, x0
 46bed18: f9401288     	ldr	x8, [x20, #0x20]
 46bed1c: 52800021     	mov	w1, #0x1                ; =1
 46bed20: d2800002     	mov	x2, #0x0                ; =0
 46bed24: d63f0100     	blr	x8
 46bed28: aa0003f5     	mov	x21, x0
 46bed2c: 340001e0     	cbz	w0, 0x46bed68 <_ChromeMain+0x46b9acc>
 46bed30: f9400e88     	ldr	x8, [x20, #0x18]
 46bed34: b4000068     	cbz	x8, 0x46bed40 <_ChromeMain+0x46b9aa4>
 46bed38: aa1603e0     	mov	x0, x22
 46bed3c: d63f0100     	blr	x8
 46bed40: a9007e7f     	stp	xzr, xzr, [x19]
 46bed44: f9000a7f     	str	xzr, [x19, #0x10]
 46bed48: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 46bed4c: 36f800a8     	tbz	w8, #0x1f, 0x46bed60 <_ChromeMain+0x46b9ac4>
 46bed50: f9401be0     	ldr	x0, [sp, #0x30]
 46bed54: f94023e8     	ldr	x8, [sp, #0x40]
 46bed58: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bed5c: 96e52857     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bed60: 35fff795     	cbnz	w21, 0x46bec50 <_ChromeMain+0x46b99b4>
 46bed64: 17ffffb2     	b	0x46bec2c <_ChromeMain+0x46b9990>
 46bed68: 39811fe8     	ldrsb	x8, [sp, #0x47]
 46bed6c: 9100c3e9     	add	x9, sp, #0x30
 46bed70: a9432fea     	ldp	x10, x11, [sp, #0x30]
 46bed74: f100011f     	cmp	x8, #0x0
 46bed78: 9a894149     	csel	x9, x10, x9, mi
 46bed7c: a9027fe9     	stp	x9, xzr, [sp, #0x20]
 46bed80: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 46bed84: 7100011f     	cmp	w8, #0x0
 46bed88: 9a884168     	csel	x8, x11, x8, mi
 46bed8c: b9002be8     	str	w8, [sp, #0x28]
 46bed90: a9007fff     	stp	xzr, xzr, [sp]
 46bed94: f9401688     	ldr	x8, [x20, #0x28]
 46bed98: 910063e0     	add	x0, sp, #0x18
 46bed9c: 910003e1     	mov	x1, sp
 46beda0: d2800002     	mov	x2, #0x0                ; =0
 46beda4: d63f0100     	blr	x8
 46beda8: 350000e0     	cbnz	w0, 0x46bedc4 <_ChromeMain+0x46b9b28>
 46bedac: f94007e1     	ldr	x1, [sp, #0x8]
 46bedb0: b94013e2     	ldr	w2, [sp, #0x10]
 46bedb4: b5000041     	cbnz	x1, 0x46bedbc <_ChromeMain+0x46b9b20>
 46bedb8: 35000182     	cbnz	w2, 0x46bede8 <_ChromeMain+0x46b9b4c>
 46bedbc: 910123e0     	add	x0, sp, #0x48
 46bedc0: 96f861c0     	bl	0x4d74c0 <_ChromeMain+0x4d2224>
 46bedc4: f9401a88     	ldr	x8, [x20, #0x30]
 46bedc8: 910003e0     	mov	x0, sp
 46bedcc: 52800001     	mov	w1, #0x0                ; =0
 46bedd0: d63f0100     	blr	x8
 46bedd4: f9400e88     	ldr	x8, [x20, #0x18]
 46bedd8: b4fffb88     	cbz	x8, 0x46bed48 <_ChromeMain+0x46b9aac>
 46beddc: aa1603e0     	mov	x0, x22
 46bede0: d63f0100     	blr	x8
 46bede4: 17ffffd9     	b	0x46bed48 <_ChromeMain+0x46b9aac>
 46bede8: d4200020     	brk	#0x1
 46bedec: 94150568     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
