
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 a6ea3c0: d100c3ff     	sub	sp, sp, #0x30
 a6ea3c4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 a6ea3c8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 a6ea3cc: 910083fd     	add	x29, sp, #0x20
 a6ea3d0: aa0003f3     	mov	x19, x0
 a6ea3d4: 97fffeff     	bl	0xa6e9fd0 <_ChromeMain+0xa6e4d34>
 a6ea3d8: b941b808     	ldr	w8, [x0, #0x1b8]
 a6ea3dc: 35000268     	cbnz	w8, 0xa6ea428 <_ChromeMain+0xa6e518c>
 a6ea3e0: aa1303e0     	mov	x0, x19
 a6ea3e4: 97fff63f     	bl	0xa6e7ce0 <_ChromeMain+0xa6e2a44>
 a6ea3e8: aa0003f4     	mov	x20, x0
 a6ea3ec: f941ae60     	ldr	x0, [x19, #0x358]
 a6ea3f0: f9400008     	ldr	x8, [x0]
 a6ea3f4: f9404508     	ldr	x8, [x8, #0x88]
 a6ea3f8: d63f0100     	blr	x8
 a6ea3fc: d360fc08     	lsr	x8, x0, #32
 a6ea400: 6b00029f     	cmp	w20, w0
 a6ea404: 1a80c289     	csel	w9, w20, w0, gt
 a6ea408: 8b548108     	add	x8, x8, x20, lsr #32
 a6ea40c: 0aa97d29     	bic	w9, w9, w9, asr #31
 a6ea410: 0aa87d08     	bic	w8, w8, w8, asr #31
 a6ea414: aa088120     	orr	x0, x9, x8, lsl #32
 a6ea418: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 a6ea41c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 a6ea420: 9100c3ff     	add	sp, sp, #0x30
 a6ea424: d65f03c0     	ret
 a6ea428: aa1303e0     	mov	x0, x19
 a6ea42c: 97fffee9     	bl	0xa6e9fd0 <_ChromeMain+0xa6e4d34>
 a6ea430: b941b808     	ldr	w8, [x0, #0x1b8]
 a6ea434: b2600108     	orr	x8, x8, #0x100000000
 a6ea438: a9007fe8     	stp	x8, xzr, [sp]
 a6ea43c: 910003e1     	mov	x1, sp
 a6ea440: aa1303e0     	mov	x0, x19
 a6ea444: 97ffff4f     	bl	0xa6ea180 <_ChromeMain+0xa6e4ee4>
 a6ea448: 17fffff4     	b	0xa6ea418 <_ChromeMain+0xa6e517c>
