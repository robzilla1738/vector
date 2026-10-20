
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4276970: 900464a1     	adrp	x1, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276974: 910de821     	add	x1, x1, #0x37a
 4276978: aa1503e0     	mov	x0, x21
 427697c: 52800122     	mov	w2, #0x9                ; =9
 4276980: 9733a810     	bl	0xf609c0 <_ChromeMain+0xf5b724>
 4276984: b4000880     	cbz	x0, 0x4276a94 <_ChromeMain+0x42717f8>
 4276988: 39406008     	ldrb	w8, [x0, #0x18]
 427698c: 71001d1f     	cmp	w8, #0x7
 4276990: 54001ec1     	b.ne	0x4276d68 <_ChromeMain+0x4271acc>
 4276994: f9400408     	ldr	x8, [x0, #0x8]
 4276998: f100051f     	cmp	x8, #0x1
 427699c: 54000361     	b.ne	0x4276a08 <_ChromeMain+0x427176c>
 42769a0: f9400008     	ldr	x8, [x0]
 42769a4: 39406109     	ldrb	w9, [x8, #0x18]
 42769a8: 7100113f     	cmp	w9, #0x4
 42769ac: 540002e1     	b.ne	0x4276a08 <_ChromeMain+0x427176c>
 42769b0: 39405d0a     	ldrb	w10, [x8, #0x17]
 42769b4: 13001d49     	sxtb	w9, w10
 42769b8: f940050b     	ldr	x11, [x8, #0x8]
 42769bc: 7100013f     	cmp	w9, #0x0
 42769c0: 9a8a416a     	csel	x10, x11, x10, mi
 42769c4: f100255f     	cmp	x10, #0x9
 42769c8: 54000201     	b.ne	0x4276a08 <_ChromeMain+0x427176c>
 42769cc: f940010a     	ldr	x10, [x8]
 42769d0: 7100013f     	cmp	w9, #0x0
 42769d4: 9a884148     	csel	x8, x10, x8, mi
 42769d8: f9400109     	ldr	x9, [x8]
 42769dc: 39402108     	ldrb	w8, [x8, #0x8]
 42769e0: 7101cd1f     	cmp	w8, #0x73
 42769e4: d28dec48     	mov	x8, #0x6f62             ; =28514
 42769e8: f2ad6de8     	movk	x8, #0x6b6f, lsl #16
 42769ec: f2cc2da8     	movk	x8, #0x616d, lsl #32
 42769f0: f2ed6e48     	movk	x8, #0x6b72, lsl #48
 42769f4: fa480120     	ccmp	x9, x8, #0x0, eq
 42769f8: 54000081     	b.ne	0x4276a08 <_ChromeMain+0x427176c>
 42769fc: 52800028     	mov	w8, #0x1                ; =1
 4276a00: b90033e8     	str	w8, [sp, #0x30]
 4276a04: 14000025     	b	0x4276a98 <_ChromeMain+0x42717fc>
 4276a08: 528002c8     	mov	w8, #0x16               ; =22
 4276a0c: 39035fe8     	strb	w8, [sp, #0xd7]
 4276a10: 910303e9     	add	x9, sp, #0xc0
 4276a14: 9100592a     	add	x10, x9, #0x16
 4276a18: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276a1c: 910d1d08     	add	x8, x8, #0x347
 4276a20: eb08015f     	cmp	x10, x8
 4276a24: fa488122     	ccmp	x9, x8, #0x2, hi
 4276a28: 540053e9     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4276a2c: 3dc00100     	ldr	q0, [x8]
 4276a30: 3d800360     	str	q0, [x27]
 4276a34: f840e108     	ldur	x8, [x8, #0xe]
 4276a38: f800e368     	stur	x8, [x27, #0xe]
 4276a3c: 39035bff     	strb	wzr, [sp, #0xd6]
 4276a40: 910303e1     	add	x1, sp, #0xc0
 4276a44: aa1303e8     	mov	x8, x19
 4276a48: aa1403e0     	mov	x0, x20
 4276a4c: 94a80241     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4276a50: b0015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4276a54: 91397108     	add	x8, x8, #0xe5c
 4276a58: a90f7f68     	stp	x8, xzr, [x27, #0xf0]
 4276a5c: f9001354     	str	x20, [x26, #0x20]
 4276a60: f000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4276a64: 91120000     	add	x0, x0, #0x480
 4276a68: d10303a1     	sub	x1, x29, #0xc0
 4276a6c: d10203a2     	sub	x2, x29, #0x80
 4276a70: 94a8085a     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4276a74: f9000660     	str	x0, [x19, #0x8]
 4276a78: 52800028     	mov	w8, #0x1                ; =1
 4276a7c: 39004268     	strb	w8, [x19, #0x10]
 4276a80: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 4276a84: 36f82b88     	tbz	w8, #0x1f, 0x4276ff4 <_ChromeMain+0x4271d58>
 4276a88: f9400360     	ldr	x0, [x27]
 4276a8c: f9400b68     	ldr	x8, [x27, #0x10]
 4276a90: 14000157     	b	0x4276fec <_ChromeMain+0x4271d50>
 4276a94: b90033ff     	str	wzr, [sp, #0x30]
