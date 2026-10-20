
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4252ec0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4252ec4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4252ec8: 910043fd     	add	x29, sp, #0x10
 4252ecc: aa0003f3     	mov	x19, x0
 4252ed0: b4000481     	cbz	x1, 0x4252f60 <_ChromeMain+0x424dcc4>
 4252ed4: f9496828     	ldr	x8, [x1, #0x12d0]
 4252ed8: b40000c8     	cbz	x8, 0x4252ef0 <_ChromeMain+0x424dc54>
 4252edc: 52800029     	mov	w9, #0x1                ; =1
 4252ee0: b8290109     	ldadd	w9, w9, [x8]
 4252ee4: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4252ee8: 6b0a013f     	cmp	w9, w10
 4252eec: 54000460     	b.eq	0x4252f78 <_ChromeMain+0x424dcdc>
 4252ef0: f9496c29     	ldr	x9, [x1, #0x12d8]
 4252ef4: a9002668     	stp	x8, x9, [x19]
 4252ef8: 0f006420     	movi.2s	v0, #0x1, lsl #24
 4252efc: bd001260     	str	s0, [x19, #0x10]
 4252f00: 39005262     	strb	w2, [x19, #0x14]
 4252f04: 6f00e400     	movi.2d	v0, #0000000000000000
 4252f08: 3c818260     	stur	q0, [x19, #0x18]
 4252f0c: 3c828260     	stur	q0, [x19, #0x28]
 4252f10: 3c838260     	stur	q0, [x19, #0x38]
 4252f14: 3c848260     	stur	q0, [x19, #0x48]
 4252f18: 3c858260     	stur	q0, [x19, #0x58]
 4252f1c: 3c868260     	stur	q0, [x19, #0x68]
 4252f20: f9003e7f     	str	xzr, [x19, #0x78]
 4252f24: 52800100     	mov	w0, #0x8                ; =8
 4252f28: 96f6f110     	bl	0xf368 <_ChromeMain+0xa0cc>
 4252f2c: b900001f     	str	wzr, [x0]
 4252f30: 3900101f     	strb	wzr, [x0, #0x4]
 4252f34: b40000c0     	cbz	x0, 0x4252f4c <_ChromeMain+0x424dcb0>
 4252f38: 52800028     	mov	w8, #0x1                ; =1
 4252f3c: b8280008     	ldadd	w8, w8, [x0]
 4252f40: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4252f44: 6b09011f     	cmp	w8, w9
 4252f48: 54000120     	b.eq	0x4252f6c <_ChromeMain+0x424dcd0>
 4252f4c: a9084e60     	stp	x0, x19, [x19, #0x80]
 4252f50: aa1303e0     	mov	x0, x19
 4252f54: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4252f58: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4252f5c: d65f03c0     	ret
 4252f60: d2800008     	mov	x8, #0x0                ; =0
 4252f64: d2800009     	mov	x9, #0x0                ; =0
 4252f68: 17ffffe3     	b	0x4252ef4 <_ChromeMain+0x424dc58>
 4252f6c: d4200000     	brk	#0
 4252f70: d4400000     	hlt	#0
 4252f74: d4200020     	brk	#0x1
 4252f78: d4200000     	brk	#0
 4252f7c: d4400000     	hlt	#0
 4252f80: d4200020     	brk	#0x1
 4252f84: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4252f88: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4252f8c: 910043fd     	add	x29, sp, #0x10
 4252f90: aa0003f3     	mov	x19, x0
 4252f94: f900441f     	str	xzr, [x0, #0x88]
 4252f98: f9404008     	ldr	x8, [x0, #0x80]
 4252f9c: b4000168     	cbz	x8, 0x4252fc8 <_ChromeMain+0x424dd2c>
 4252fa0: 52800029     	mov	w9, #0x1                ; =1
 4252fa4: 19004109     	stlurb	w9, [x8, #0x4]
 4252fa8: f9404260     	ldr	x0, [x19, #0x80]
 4252fac: b40000e0     	cbz	x0, 0x4252fc8 <_ChromeMain+0x424dd2c>
 4252fb0: 12800008     	mov	w8, #-0x1               ; =-1
 4252fb4: b8e80008     	ldaddal	w8, w8, [x0]
 4252fb8: 7100051f     	cmp	w8, #0x1
 4252fbc: 54000061     	b.ne	0x4252fc8 <_ChromeMain+0x424dd2c>
 4252fc0: 52800101     	mov	w1, #0x8                ; =8
 4252fc4: 96f6d7bd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4252fc8: f9403e60     	ldr	x0, [x19, #0x78]
 4252fcc: b50006c0     	cbnz	x0, 0x42530a4 <_ChromeMain+0x424de08>
 4252fd0: f9403a60     	ldr	x0, [x19, #0x70]
 4252fd4: b40001c0     	cbz	x0, 0x425300c <_ChromeMain+0x424dd70>
 4252fd8: 91002008     	add	x8, x0, #0x8
 4252fdc: 12800009     	mov	w9, #-0x1               ; =-1
 4252fe0: b8e90108     	ldaddal	w9, w8, [x8]
 4252fe4: 7100051f     	cmp	w8, #0x1
 4252fe8: 54000121     	b.ne	0x425300c <_ChromeMain+0x424dd70>
 4252fec: f9400009     	ldr	x9, [x0]
 4252ff0: f9400d28     	ldr	x8, [x9, #0x18]
 4252ff4: 103bd4ca     	adr	x10, 0x42caa8c <_ChromeMain+0x42c57f0>
 4252ff8: d503201f     	nop
 4252ffc: eb0a011f     	cmp	x8, x10
 4253000: 54000041     	b.ne	0x4253008 <_ChromeMain+0x424dd6c>
 4253004: f9400928     	ldr	x8, [x9, #0x10]
 4253008: d63f0100     	blr	x8
 425300c: f9403660     	ldr	x0, [x19, #0x68]
 4253010: f900367f     	str	xzr, [x19, #0x68]
 4253014: b4000080     	cbz	x0, 0x4253024 <_ChromeMain+0x424dd88>
 4253018: 94001873     	bl	0x42591e4 <_ChromeMain+0x4253f48>
 425301c: 52802001     	mov	w1, #0x100              ; =256
 4253020: 96f6d7a6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4253024: 39c19e68     	ldrsb	w8, [x19, #0x67]
 4253028: 36f800a8     	tbz	w8, #0x1f, 0x425303c <_ChromeMain+0x424dda0>
 425302c: f9402a60     	ldr	x0, [x19, #0x50]
 4253030: f9403268     	ldr	x8, [x19, #0x60]
 4253034: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4253038: 96f6d7a0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425303c: 39c13e68     	ldrsb	w8, [x19, #0x4f]
 4253040: 36f800a8     	tbz	w8, #0x1f, 0x4253054 <_ChromeMain+0x424ddb8>
 4253044: f9401e60     	ldr	x0, [x19, #0x38]
 4253048: f9402668     	ldr	x8, [x19, #0x48]
 425304c: d37ff901     	lsl	x1, x8, #1
 4253050: 96f6d79a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4253054: 39c0de68     	ldrsb	w8, [x19, #0x37]
 4253058: 37f801c8     	tbnz	w8, #0x1f, 0x4253090 <_ChromeMain+0x424ddf4>
 425305c: f9400260     	ldr	x0, [x19]
 4253060: b50000a0     	cbnz	x0, 0x4253074 <_ChromeMain+0x424ddd8>
 4253064: aa1303e0     	mov	x0, x19
 4253068: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 425306c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4253070: d65f03c0     	ret
 4253074: 12800008     	mov	w8, #-0x1               ; =-1
 4253078: b8e80008     	ldaddal	w8, w8, [x0]
 425307c: 7100051f     	cmp	w8, #0x1
 4253080: 54ffff21     	b.ne	0x4253064 <_ChromeMain+0x424ddc8>
 4253084: 52800101     	mov	w1, #0x8                ; =8
 4253088: 96f6d78c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425308c: 17fffff6     	b	0x4253064 <_ChromeMain+0x424ddc8>
 4253090: f9401260     	ldr	x0, [x19, #0x20]
 4253094: f9401a68     	ldr	x8, [x19, #0x30]
 4253098: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425309c: 96f6d787     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42530a0: 17ffffef     	b	0x425305c <_ChromeMain+0x424ddc0>
 42530a4: 12800008     	mov	w8, #-0x1               ; =-1
 42530a8: b8e80008     	ldaddal	w8, w8, [x0]
 42530ac: 7100051f     	cmp	w8, #0x1
 42530b0: 54fff901     	b.ne	0x4252fd0 <_ChromeMain+0x424dd34>
 42530b4: f9400808     	ldr	x8, [x0, #0x10]
 42530b8: d63f0100     	blr	x8
 42530bc: 17ffffc5     	b	0x4252fd0 <_ChromeMain+0x424dd34>
