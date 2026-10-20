
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46874ac: d10343ff     	sub	sp, sp, #0xd0
 46874b0: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 46874b4: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 46874b8: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 46874bc: 910303fd     	add	x29, sp, #0xc0
 46874c0: f943e415     	ldr	x21, [x0, #0x7c8]
 46874c4: b4000075     	cbz	x21, 0x46874d0 <_ChromeMain+0x4682234>
 46874c8: f94006b4     	ldr	x20, [x21, #0x8]
 46874cc: b50000d4     	cbnz	x20, 0x46874e4 <_ChromeMain+0x4682248>
 46874d0: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 46874d4: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 46874d8: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 46874dc: 910343ff     	add	sp, sp, #0xd0
 46874e0: d65f03c0     	ret
 46874e4: aa0003f3     	mov	x19, x0
 46874e8: 911f4001     	add	x1, x0, #0x7d0
 46874ec: aa1403e0     	mov	x0, x20
 46874f0: 94803d64     	bl	0x6696a80 <_ChromeMain+0x66917e4>
 46874f4: f9400028     	ldr	x8, [x1]
 46874f8: 91002289     	add	x9, x20, #0x8
 46874fc: f100011f     	cmp	x8, #0x0
 4687500: fa491104     	ccmp	x8, x9, #0x4, ne
 4687504: 54fffe60     	b.eq	0x46874d0 <_ChromeMain+0x4682234>
 4687508: f94006a0     	ldr	x0, [x21, #0x8]
 468750c: 911f4261     	add	x1, x19, #0x7d0
 4687510: 94daff7a     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 4687514: b4fffde0     	cbz	x0, 0x46874d0 <_ChromeMain+0x4682234>
 4687518: f943e668     	ldr	x8, [x19, #0x7c8]
 468751c: b4000068     	cbz	x8, 0x4687528 <_ChromeMain+0x468228c>
 4687520: f9400514     	ldr	x20, [x8, #0x8]
 4687524: b50000b4     	cbnz	x20, 0x4687538 <_ChromeMain+0x468229c>
 4687528: f943e660     	ldr	x0, [x19, #0x7c8]
 468752c: 911f4261     	add	x1, x19, #0x7d0
 4687530: 94db2948     	bl	0x7d51a50 <_ChromeMain+0x7d4c7b4>
 4687534: 17ffffe7     	b	0x46874d0 <_ChromeMain+0x4682234>
 4687538: 911f4261     	add	x1, x19, #0x7d0
 468753c: aa1403e0     	mov	x0, x20
 4687540: f90007e8     	str	x8, [sp, #0x8]
 4687544: 94803d4f     	bl	0x6696a80 <_ChromeMain+0x66917e4>
 4687548: f94007e8     	ldr	x8, [sp, #0x8]
 468754c: f9400029     	ldr	x9, [x1]
 4687550: 9100228a     	add	x10, x20, #0x8
 4687554: f100013f     	cmp	x9, #0x0
 4687558: fa4a1124     	ccmp	x9, x10, #0x4, ne
 468755c: 54fffe60     	b.eq	0x4687528 <_ChromeMain+0x468228c>
 4687560: f9400500     	ldr	x0, [x8, #0x8]
 4687564: 911f4261     	add	x1, x19, #0x7d0
 4687568: 94daff64     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 468756c: b4fffde0     	cbz	x0, 0x4687528 <_ChromeMain+0x468228c>
 4687570: 949dd4b1     	bl	0x6dfc834 <_ChromeMain+0x6df7598>
 4687574: f94007e8     	ldr	x8, [sp, #0x8]
 4687578: d360fc09     	lsr	x9, x0, #32
 468757c: 6b090009     	subs	w9, w0, w9
 4687580: 5a898529     	cneg	w9, w9, ls
 4687584: f940010a     	ldr	x10, [x8]
 4687588: b940194a     	ldr	w10, [x10, #0x18]
 468758c: 6b0a013f     	cmp	w9, w10
 4687590: 54fffcc1     	b.ne	0x4687528 <_ChromeMain+0x468228c>
 4687594: f9400908     	ldr	x8, [x8, #0x10]
 4687598: 910043f4     	add	x20, sp, #0x10
 468759c: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 46875a0: b80273ff     	stur	wzr, [sp, #0x27]
 46875a4: f90013ff     	str	xzr, [sp, #0x20]
 46875a8: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 46875ac: ad0183e0     	stp	q0, q0, [sp, #0x30]
 46875b0: ad0283e0     	stp	q0, q0, [sp, #0x50]
 46875b4: 7900e3ff     	strh	wzr, [sp, #0x70]
 46875b8: a907ffff     	stp	xzr, xzr, [sp, #0x78]
 46875bc: f9400508     	ldr	x8, [x8, #0x8]
 46875c0: 9100a109     	add	x9, x8, #0x28
 46875c4: f100011f     	cmp	x8, #0x0
 46875c8: 9a8903e0     	csel	x0, xzr, x9, eq
 46875cc: 381c83bf     	sturb	wzr, [x29, #-0x38]
 46875d0: 381d83bf     	sturb	wzr, [x29, #-0x28]
 46875d4: 910043e1     	add	x1, sp, #0x10
 46875d8: d100e3a4     	sub	x4, x29, #0x38
 46875dc: 12800002     	mov	w2, #-0x1               ; =-1
 46875e0: 52800023     	mov	w3, #0x1                ; =1
 46875e4: 52800005     	mov	w5, #0x0                ; =0
 46875e8: 95ed6fa3     	bl	0xc1e3474 <_ChromeMain+0xc1de1d8>
 46875ec: 9101c280     	add	x0, x20, #0x70
 46875f0: d2800001     	mov	x1, #0x0                ; =0
 46875f4: 96e681b1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46875f8: 91008280     	add	x0, x20, #0x20
 46875fc: 96e6819f     	bl	0x27c78 <_ChromeMain+0x229dc>
 4687600: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 4687604: 36fff928     	tbz	w8, #0x1f, 0x4687528 <_ChromeMain+0x468228c>
 4687608: f9400be0     	ldr	x0, [sp, #0x10]
 468760c: f94013e8     	ldr	x8, [sp, #0x20]
 4687610: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4687614: 96e60629     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4687618: 17ffffc4     	b	0x4687528 <_ChromeMain+0x468228c>
