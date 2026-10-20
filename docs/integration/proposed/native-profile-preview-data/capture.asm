
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45589b0: d10183ff     	sub	sp, sp, #0x60
 45589b4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 45589b8: a90357f6     	stp	x22, x21, [sp, #0x30]
 45589bc: a9044ff4     	stp	x20, x19, [sp, #0x40]
 45589c0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 45589c4: 910143fd     	add	x29, sp, #0x50
 45589c8: 6f00e400     	movi.2d	v0, #0000000000000000
 45589cc: ad000100     	stp	q0, q0, [x8]
 45589d0: b40002a0     	cbz	x0, 0x4558a24 <_ChromeMain+0x4553788>
 45589d4: aa0003f3     	mov	x19, x0
 45589d8: aa0803f4     	mov	x20, x8
 45589dc: f9404801     	ldr	x1, [x0, #0x90]
 45589e0: b40001e1     	cbz	x1, 0x4558a1c <_ChromeMain+0x4553780>
 45589e4: f9400260     	ldr	x0, [x19]
 45589e8: 96f8c6d1     	bl	0x38a52c <_ChromeMain+0x385290>
 45589ec: 0aa07c08     	bic	w8, w0, w0, asr #31
 45589f0: 7200003f     	tst	w1, #0x1
 45589f4: 1a9f1108     	csel	w8, w8, wzr, ne
 45589f8: b9001a88     	str	w8, [x20, #0x18]
 45589fc: f9400260     	ldr	x0, [x19]
 4558a00: b9401808     	ldr	w8, [x0, #0x18]
 4558a04: 7100051f     	cmp	w8, #0x1
 4558a08: 540000eb     	b.lt	0x4558a24 <_ChromeMain+0x4553788>
 4558a0c: d2800018     	mov	x24, #0x0               ; =0
 4558a10: d2800017     	mov	x23, #0x0               ; =0
 4558a14: d2800015     	mov	x21, #0x0               ; =0
 4558a18: 14000012     	b	0x4558a60 <_ChromeMain+0x45537c4>
 4558a1c: 52800008     	mov	w8, #0x0                ; =0
 4558a20: 17fffff6     	b	0x45589f8 <_ChromeMain+0x455375c>
 4558a24: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4558a28: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4558a2c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4558a30: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4558a34: 910183ff     	add	sp, sp, #0x60
 4558a38: d65f03c0     	ret
 4558a3c: f94003e0     	ldr	x0, [sp]
 4558a40: f9400be8     	ldr	x8, [sp, #0x10]
 4558a44: d37ff901     	lsl	x1, x8, #1
 4558a48: 96eac11c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4558a4c: 910006b5     	add	x21, x21, #0x1
 4558a50: f9400260     	ldr	x0, [x19]
 4558a54: b9801808     	ldrsw	x8, [x0, #0x18]
 4558a58: eb0802bf     	cmp	x21, x8
 4558a5c: 54fffe4a     	b.ge	0x4558a24 <_ChromeMain+0x4553788>
 4558a60: aa1503e1     	mov	x1, x21
 4558a64: 972c1625     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4558a68: b4ffff20     	cbz	x0, 0x4558a4c <_ChromeMain+0x45537b0>
 4558a6c: aa0003f6     	mov	x22, x0
 4558a70: 910003e8     	mov	x8, sp
 4558a74: 94dfce9c     	bl	0x7d4c4e4 <_ChromeMain+0x7d47248>
 4558a78: b9401a88     	ldr	w8, [x20, #0x18]
 4558a7c: eb0802bf     	cmp	x21, x8
 4558a80: 1a9f17e8     	cset	w8, eq
 4558a84: 390063e8     	strb	w8, [sp, #0x18]
 4558a88: 394186c8     	ldrb	w8, [x22, #0x61]
 4558a8c: 390067e8     	strb	w8, [sp, #0x19]
 4558a90: f9400a88     	ldr	x8, [x20, #0x10]
 4558a94: eb08031f     	cmp	x24, x8
 4558a98: 540002a0     	b.eq	0x4558aec <_ChromeMain+0x4553850>
 4558a9c: 8b1816e8     	add	x8, x23, x24, lsl #5
 4558aa0: b4000248     	cbz	x8, 0x4558ae8 <_ChromeMain+0x455384c>
 4558aa4: 3dc003e0     	ldr	q0, [sp]
 4558aa8: f9400be9     	ldr	x9, [sp, #0x10]
 4558aac: f9000909     	str	x9, [x8, #0x10]
 4558ab0: 3d800100     	str	q0, [x8]
 4558ab4: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4558ab8: f90003ff     	str	xzr, [sp]
 4558abc: 794033e9     	ldrh	w9, [sp, #0x18]
 4558ac0: 79003109     	strh	w9, [x8, #0x18]
 4558ac4: 91008100     	add	x0, x8, #0x20
 4558ac8: f9400297     	ldr	x23, [x20]
 4558acc: eb170008     	subs	x8, x0, x23
 4558ad0: 9345fd18     	asr	x24, x8, #5
 4558ad4: f9000698     	str	x24, [x20, #0x8]
 4558ad8: 54000080     	b.eq	0x4558ae8 <_ChromeMain+0x455384c>
 4558adc: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4558ae0: 36fffb68     	tbz	w8, #0x1f, 0x4558a4c <_ChromeMain+0x45537b0>
 4558ae4: 17ffffd6     	b	0x4558a3c <_ChromeMain+0x45537a0>
 4558ae8: d4200020     	brk	#0x1
 4558aec: 910003e1     	mov	x1, sp
 4558af0: aa1403e0     	mov	x0, x20
 4558af4: 94001493     	bl	0x455dd40 <_ChromeMain+0x4558aa4>
 4558af8: 17fffff4     	b	0x4558ac8 <_ChromeMain+0x455382c>
