
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465d7e0: d10303ff     	sub	sp, sp, #0xc0
 465d7e4: a90957f6     	stp	x22, x21, [sp, #0x90]
 465d7e8: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 465d7ec: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 465d7f0: 9102c3fd     	add	x29, sp, #0xb0
 465d7f4: aa0003f3     	mov	x19, x0
 465d7f8: 94000600     	bl	0x465eff8 <_ChromeMain+0x4659d5c>
 465d7fc: f9427260     	ldr	x0, [x19, #0x4e0]
 465d800: f9400808     	ldr	x8, [x0, #0x10]
 465d804: b40002a8     	cbz	x8, 0x465d858 <_ChromeMain+0x46585bc>
 465d808: f9401008     	ldr	x8, [x0, #0x20]
 465d80c: b4000268     	cbz	x8, 0x465d858 <_ChromeMain+0x46585bc>
 465d810: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 465d814: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 465d818: a94957f6     	ldp	x22, x21, [sp, #0x90]
 465d81c: 910303ff     	add	sp, sp, #0xc0
 465d820: 17fc426a     	b	0x456e1c8 <_ChromeMain+0x4568f2c>
 465d824: f9426e68     	ldr	x8, [x19, #0x4d8]
 465d828: b4000368     	cbz	x8, 0x465d894 <_ChromeMain+0x46585f8>
 465d82c: f9425114     	ldr	x20, [x8, #0x4a0]
 465d830: b4000334     	cbz	x20, 0x465d894 <_ChromeMain+0x46585f8>
 465d834: 52800100     	mov	w0, #0x8                ; =8
 465d838: 96e6c6cc     	bl	0xf368 <_ChromeMain+0xa0cc>
 465d83c: aa0003f5     	mov	x21, x0
 465d840: aa1403e1     	mov	x1, x20
 465d844: 95ba6d97     	bl	0xb4f8ea0 <_ChromeMain+0xb4f3c04>
 465d848: f9427660     	ldr	x0, [x19, #0x4e8]
 465d84c: f9027675     	str	x21, [x19, #0x4e8]
 465d850: b4000220     	cbz	x0, 0x465d894 <_ChromeMain+0x46585f8>
 465d854: 1400007a     	b	0x465da3c <_ChromeMain+0x46587a0>
 465d858: f9426a68     	ldr	x8, [x19, #0x4d0]
 465d85c: f9429d08     	ldr	x8, [x8, #0x538]
 465d860: 9100a109     	add	x9, x8, #0x28
 465d864: f100011f     	cmp	x8, #0x0
 465d868: 9a8903e0     	csel	x0, xzr, x9, eq
 465d86c: 96eadb8a     	bl	0x114694 <_ChromeMain+0x10f3f8>
 465d870: b40000e0     	cbz	x0, 0x465d88c <_ChromeMain+0x46585f0>
 465d874: 39424008     	ldrb	w8, [x0, #0x90]
 465d878: 340000a8     	cbz	w8, 0x465d88c <_ChromeMain+0x46585f0>
 465d87c: f9427a68     	ldr	x8, [x19, #0x4f0]
 465d880: b5000068     	cbnz	x8, 0x465d88c <_ChromeMain+0x46585f0>
 465d884: f9426e75     	ldr	x21, [x19, #0x4d8]
 465d888: b5000bd5     	cbnz	x21, 0x465da00 <_ChromeMain+0x4658764>
 465d88c: f9427668     	ldr	x8, [x19, #0x4e8]
 465d890: b4fffca8     	cbz	x8, 0x465d824 <_ChromeMain+0x4658588>
 465d894: f9427274     	ldr	x20, [x19, #0x4e0]
 465d898: 6f00e400     	movi.2d	v0, #0000000000000000
 465d89c: ad0003e0     	stp	q0, q0, [sp]
 465d8a0: ad0103e0     	stp	q0, q0, [sp, #0x20]
 465d8a4: f90023ff     	str	xzr, [sp, #0x40]
 465d8a8: 910003f5     	mov	x21, sp
 465d8ac: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 465d8b0: b9000fe8     	str	w8, [sp, #0xc]
 465d8b4: 52800028     	mov	w8, #0x1                ; =1
 465d8b8: 390043e8     	strb	w8, [sp, #0x10]
 465d8bc: 390083ff     	strb	wzr, [sp, #0x20]
 465d8c0: f9428a68     	ldr	x8, [x19, #0x510]
 465d8c4: 39472116     	ldrb	w22, [x8, #0x1c8]
 465d8c8: 3900a3f6     	strb	w22, [sp, #0x28]
 465d8cc: 9100c2a8     	add	x8, x21, #0x30
 465d8d0: aa1303e0     	mov	x0, x19
 465d8d4: 94000681     	bl	0x465f2d8 <_ChromeMain+0x465a03c>
 465d8d8: 370001f6     	tbnz	w22, #0x0, 0x465d914 <_ChromeMain+0x4658678>
 465d8dc: f9428668     	ldr	x8, [x19, #0x508]
 465d8e0: 39472109     	ldrb	w9, [x8, #0x1c8]
 465d8e4: 34000189     	cbz	w9, 0x465d914 <_ChromeMain+0x4658678>
 465d8e8: 390123ff     	strb	wzr, [sp, #0x48]
 465d8ec: 52801fe9     	mov	w9, #0xff               ; =255
 465d8f0: 3901a3e9     	strb	w9, [sp, #0x68]
 465d8f4: 910123e0     	add	x0, sp, #0x48
 465d8f8: 910d2101     	add	x1, x8, #0x348
 465d8fc: 97018524     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 465d900: 910003e0     	mov	x0, sp
 465d904: 910123e1     	add	x1, sp, #0x48
 465d908: 970f7050     	bl	0xa39a48 <_ChromeMain+0xa347ac>
 465d90c: 910123e0     	add	x0, sp, #0x48
 465d910: 9707a3cc     	bl	0x846840 <_ChromeMain+0x8415a4>
 465d914: 390123ff     	strb	wzr, [sp, #0x48]
 465d918: 52801fe8     	mov	w8, #0xff               ; =255
 465d91c: 3901a3e8     	strb	w8, [sp, #0x68]
 465d920: 910123e0     	add	x0, sp, #0x48
 465d924: 910003e1     	mov	x1, sp
 465d928: 97141685     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 465d92c: 3940a3e8     	ldrb	w8, [sp, #0x28]
 465d930: 3901c3e8     	strb	w8, [sp, #0x70]
 465d934: 3cc302a0     	ldur	q0, [x21, #0x30]
 465d938: 3c8783e0     	stur	q0, [sp, #0x78]
 465d93c: f84402a8     	ldur	x8, [x21, #0x40]
 465d940: f90047e8     	str	x8, [sp, #0x88]
 465d944: a9037ebf     	stp	xzr, xzr, [x21, #0x30]
 465d948: f80402bf     	stur	xzr, [x21, #0x40]
 465d94c: 910123e2     	add	x2, sp, #0x48
 465d950: aa1403e0     	mov	x0, x20
 465d954: aa1303e1     	mov	x1, x19
 465d958: 52800003     	mov	w3, #0x0                ; =0
 465d95c: 97fc4349     	bl	0x456e680 <_ChromeMain+0x45693e4>
 465d960: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 465d964: 36f800a8     	tbz	w8, #0x1f, 0x465d978 <_ChromeMain+0x46586dc>
 465d968: f9403fe0     	ldr	x0, [sp, #0x78]
 465d96c: f94047e8     	ldr	x8, [sp, #0x88]
 465d970: d37ff901     	lsl	x1, x8, #1
 465d974: 96e6ad51     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d978: 910123e0     	add	x0, sp, #0x48
 465d97c: 9707a3b1     	bl	0x846840 <_ChromeMain+0x8415a4>
 465d980: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 465d984: 36f800a8     	tbz	w8, #0x1f, 0x465d998 <_ChromeMain+0x46586fc>
 465d988: f9401be0     	ldr	x0, [sp, #0x30]
 465d98c: f94023e8     	ldr	x8, [sp, #0x40]
 465d990: d37ff901     	lsl	x1, x8, #1
 465d994: 96e6ad49     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d998: 910003e0     	mov	x0, sp
 465d99c: 9707a3a9     	bl	0x846840 <_ChromeMain+0x8415a4>
 465d9a0: f9427268     	ldr	x8, [x19, #0x4e0]
 465d9a4: f9400909     	ldr	x9, [x8, #0x10]
 465d9a8: b4000069     	cbz	x9, 0x465d9b4 <_ChromeMain+0x4658718>
 465d9ac: f9401108     	ldr	x8, [x8, #0x20]
 465d9b0: b50000e8     	cbnz	x8, 0x465d9cc <_ChromeMain+0x4658730>
 465d9b4: f9427660     	ldr	x0, [x19, #0x4e8]
 465d9b8: f902767f     	str	xzr, [x19, #0x4e8]
 465d9bc: b50001a0     	cbnz	x0, 0x465d9f0 <_ChromeMain+0x4658754>
 465d9c0: f9427a60     	ldr	x0, [x19, #0x4f0]
 465d9c4: f9027a7f     	str	xzr, [x19, #0x4f0]
 465d9c8: b50000c0     	cbnz	x0, 0x465d9e0 <_ChromeMain+0x4658744>
 465d9cc: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 465d9d0: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 465d9d4: a94957f6     	ldp	x22, x21, [sp, #0x90]
 465d9d8: 910303ff     	add	sp, sp, #0xc0
 465d9dc: d65f03c0     	ret
 465d9e0: 94e5629e     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 465d9e4: 52800301     	mov	w1, #0x18               ; =24
 465d9e8: 96e6ad34     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d9ec: 17fffff8     	b	0x465d9cc <_ChromeMain+0x4658730>
 465d9f0: 959cd74f     	bl	0xad9372c <_ChromeMain+0xad8e490>
 465d9f4: 52800101     	mov	w1, #0x8                ; =8
 465d9f8: 96e6ad30     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465d9fc: 17fffff1     	b	0x465d9c0 <_ChromeMain+0x4658724>
 465da00: 397e42b6     	ldrb	w22, [x21, #0xf90]
 465da04: 52800300     	mov	w0, #0x18               ; =24
 465da08: 96e6c658     	bl	0xf368 <_ChromeMain+0xa0cc>
 465da0c: aa0003f4     	mov	x20, x0
 465da10: 710002df     	cmp	w22, #0x0
 465da14: 9a9513e1     	csel	x1, xzr, x21, ne
 465da18: 52800042     	mov	w2, #0x2                ; =2
 465da1c: 94e56276     	bl	0x7fb63f4 <_ChromeMain+0x7fb1158>
 465da20: f9427a60     	ldr	x0, [x19, #0x4f0]
 465da24: f9027a74     	str	x20, [x19, #0x4f0]
 465da28: b4fff320     	cbz	x0, 0x465d88c <_ChromeMain+0x46585f0>
 465da2c: 94e5628b     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 465da30: 52800301     	mov	w1, #0x18               ; =24
 465da34: 96e6ad21     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465da38: 17ffff95     	b	0x465d88c <_ChromeMain+0x46585f0>
 465da3c: 959cd73c     	bl	0xad9372c <_ChromeMain+0xad8e490>
 465da40: 52800101     	mov	w1, #0x8                ; =8
 465da44: 96e6ad1d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465da48: 17ffff93     	b	0x465d894 <_ChromeMain+0x46585f8>
		...
 465da60: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 465da64: a9017bfd     	stp	x29, x30, [sp, #0x10]
 465da68: 910043fd     	add	x29, sp, #0x10
 465da6c: aa0003f3     	mov	x19, x0
 465da70: f9427400     	ldr	x0, [x0, #0x4e8]
 465da74: f902767f     	str	xzr, [x19, #0x4e8]
 465da78: b50000e0     	cbnz	x0, 0x465da94 <_ChromeMain+0x46587f8>
 465da7c: f9427a60     	ldr	x0, [x19, #0x4f0]
 465da80: f9027a7f     	str	xzr, [x19, #0x4f0]
 465da84: b5000100     	cbnz	x0, 0x465daa4 <_ChromeMain+0x4658808>
 465da88: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465da8c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465da90: d65f03c0     	ret
 465da94: 959cd726     	bl	0xad9372c <_ChromeMain+0xad8e490>
 465da98: 52800101     	mov	w1, #0x8                ; =8
 465da9c: 96e6ad07     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465daa0: 17fffff7     	b	0x465da7c <_ChromeMain+0x46587e0>
 465daa4: 94e5626d     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 465daa8: 52800301     	mov	w1, #0x18               ; =24
 465daac: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465dab0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465dab4: 16e6ad01     	b	0x8eb8 <_ChromeMain+0x3c1c>
