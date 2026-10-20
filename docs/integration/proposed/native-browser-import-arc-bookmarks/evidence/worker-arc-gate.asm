
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42543c8: 96f6d2bc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42543cc: 394163e8     	ldrb	w8, [sp, #0x58]
 42543d0: 34000068     	cbz	w8, 0x42543dc <_ChromeMain+0x424f140>
 42543d4: 910103e0     	add	x0, sp, #0x40
 42543d8: 971c282a     	bl	0x95e480 <_ChromeMain+0x9591e4>
 42543dc: 38d773a8     	ldursb	w8, [x29, #-0x89]
 42543e0: 36f800a8     	tbz	w8, #0x1f, 0x42543f4 <_ChromeMain+0x424f158>
 42543e4: f85603a0     	ldur	x0, [x29, #-0xa0]
 42543e8: f85703a8     	ldur	x8, [x29, #-0x90]
 42543ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42543f0: 96f6d2b2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42543f4: 39c6dfe8     	ldrsb	w8, [sp, #0x1b7]
 42543f8: 37f80268     	tbnz	w8, #0x1f, 0x4254444 <_ChromeMain+0x424f1a8>
 42543fc: 910122a0     	add	x0, x21, #0x48
 4254400: 94d3eb9e     	bl	0x774f278 <_ChromeMain+0x7749fdc>
 4254404: f9411fe8     	ldr	x8, [sp, #0x238]
 4254408: f9004e68     	str	x8, [x19, #0x98]
 425440c: 3ccb8340     	ldur	q0, [x26, #0xb8]
 4254410: 3d802a60     	str	q0, [x19, #0xa0]
 4254414: f90127ff     	str	xzr, [sp, #0x248]
 4254418: f90123ff     	str	xzr, [sp, #0x240]
 425441c: f9011fff     	str	xzr, [sp, #0x238]
 4254420: 9108e3e8     	add	x8, sp, #0x238
 4254424: f90023e8     	str	x8, [sp, #0x40]
 4254428: 910103e0     	add	x0, sp, #0x40
 425442c: 94d3cdf3     	bl	0x7747bf8 <_ChromeMain+0x774295c>
 4254430: 34000154     	cbz	w20, 0x4254458 <_ChromeMain+0x424f1bc>
 4254434: 34000677     	cbz	w23, 0x4254500 <_ChromeMain+0x424f264>
 4254438: 52800028     	mov	w8, #0x1                ; =1
 425443c: 39000268     	strb	w8, [x19]
 4254440: 17ffff08     	b	0x4254060 <_ChromeMain+0x424edc4>
 4254444: f940d3e0     	ldr	x0, [sp, #0x1a0]
 4254448: f940dbe8     	ldr	x8, [sp, #0x1b0]
 425444c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254450: 96f6d29a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254454: 17ffffea     	b	0x42543fc <_ChromeMain+0x424f160>
 4254458: 910103e8     	add	x8, sp, #0x40
 425445c: aa1803e0     	mov	x0, x24
 4254460: 94001549     	bl	0x4259984 <_ChromeMain+0x42546e8>
 4254464: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 4254468: f9001fff     	str	xzr, [sp, #0x38]
 425446c: 910103e0     	add	x0, sp, #0x40
 4254470: 9100a3e1     	add	x1, sp, #0x28
 4254474: 910122a2     	add	x2, x21, #0x48
 4254478: 94005e7a     	bl	0x426be60 <_ChromeMain+0x4266bc4>
 425447c: f94017f8     	ldr	x24, [sp, #0x28]
 4254480: b5008518     	cbnz	x24, 0x4255520 <_ChromeMain+0x4250284>
 4254484: f94023f8     	ldr	x24, [sp, #0x40]
 4254488: b4fffd78     	cbz	x24, 0x4254434 <_ChromeMain+0x424f198>
 425448c: f94027e8     	ldr	x8, [sp, #0x48]
 4254490: 52801609     	mov	w9, #0xb0               ; =176
 4254494: 9b097d09     	mul	x9, x8, x9
