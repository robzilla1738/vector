
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 28539a0: d10183ff     	sub	sp, sp, #0x60
 28539a4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 28539a8: a90357f6     	stp	x22, x21, [sp, #0x30]
 28539ac: a9044ff4     	stp	x20, x19, [sp, #0x40]
 28539b0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 28539b4: 910143fd     	add	x29, sp, #0x50
 28539b8: aa0103f4     	mov	x20, x1
 28539bc: aa0003f3     	mov	x19, x0
 28539c0: 9400003e     	bl	0x2853ab8 <_ChromeMain+0x284e81c>
 28539c4: 3983fe96     	ldrsb	x22, [x20, #0xff]
 28539c8: b6f80616     	tbz	x22, #0x3f, 0x2853a88 <_ChromeMain+0x284e7ec>
 28539cc: f9407a96     	ldr	x22, [x20, #0xf0]
 28539d0: 92800208     	mov	x8, #-0x11              ; =-17
 28539d4: f2efffe8     	movk	x8, #0x7fff, lsl #48
 28539d8: eb0802df     	cmp	x22, x8
 28539dc: 540006c2     	b.hs	0x2853ab4 <_ChromeMain+0x284e818>
 28539e0: f9407694     	ldr	x20, [x20, #0xe8]
 28539e4: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 28539e8: f9000fff     	str	xzr, [sp, #0x18]
 28539ec: f1002adf     	cmp	x22, #0xa
 28539f0: 54000509     	b.ls	0x2853a90 <_ChromeMain+0x284e7f4>
 28539f4: 927deed7     	and	x23, x22, #0x7ffffffffffffff8
 28539f8: d37ffae8     	lsl	x8, x23, #1
 28539fc: 91004100     	add	x0, x8, #0x10
 2853a00: 975eee5a     	bl	0xf368 <_ChromeMain+0xa0cc>
 2853a04: aa0003f5     	mov	x21, x0
 2853a08: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 2853a0c: cb0802e8     	sub	x8, x23, x8
 2853a10: a900dbe0     	stp	x0, x22, [sp, #0x8]
 2853a14: f9000fe8     	str	x8, [sp, #0x18]
 2853a18: 8b1606a8     	add	x8, x21, x22, lsl #1
 2853a1c: eb15011f     	cmp	x8, x21
 2853a20: 54000483     	b.lo	0x2853ab0 <_ChromeMain+0x284e814>
 2853a24: eb1402bf     	cmp	x21, x20
 2853a28: fa549100     	ccmp	x8, x20, #0x0, ls
 2853a2c: 54000428     	b.hi	0x2853ab0 <_ChromeMain+0x284e814>
 2853a30: d37ffac2     	lsl	x2, x22, #1
 2853a34: aa1503e0     	mov	x0, x21
 2853a38: aa1403e1     	mov	x1, x20
 2853a3c: 955eee24     	bl	0x800f2cc <_ChromeMain+0x800a030>
 2853a40: 78367abf     	strh	wzr, [x21, x22, lsl #1]
 2853a44: 39407fe9     	ldrb	w9, [sp, #0x1f]
 2853a48: 13001d28     	sxtb	w8, w9
 2853a4c: f9400bea     	ldr	x10, [sp, #0x10]
 2853a50: 7100011f     	cmp	w8, #0x0
 2853a54: 9a894149     	csel	x9, x10, x9, mi
 2853a58: b40000a9     	cbz	x9, 0x2853a6c <_ChromeMain+0x284e7d0>
 2853a5c: f9400a60     	ldr	x0, [x19, #0x10]
 2853a60: 910023e1     	add	x1, sp, #0x8
 2853a64: 977fcbb8     	bl	0x846944 <_ChromeMain+0x8416a8>
 2853a68: 39407fe8     	ldrb	w8, [sp, #0x1f]
 2853a6c: 37380188     	tbnz	w8, #0x7, 0x2853a9c <_ChromeMain+0x284e800>
 2853a70: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 2853a74: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 2853a78: a94357f6     	ldp	x22, x21, [sp, #0x30]
 2853a7c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 2853a80: 910183ff     	add	sp, sp, #0x60
 2853a84: d65f03c0     	ret
 2853a88: 9103a294     	add	x20, x20, #0xe8
 2853a8c: 17ffffd6     	b	0x28539e4 <_ChromeMain+0x284e748>
 2853a90: 39007ff6     	strb	w22, [sp, #0x1f]
 2853a94: 910023f5     	add	x21, sp, #0x8
 2853a98: 17ffffe0     	b	0x2853a18 <_ChromeMain+0x284e77c>
 2853a9c: f94007e0     	ldr	x0, [sp, #0x8]
 2853aa0: f9400fe8     	ldr	x8, [sp, #0x18]
 2853aa4: d37ff901     	lsl	x1, x8, #1
 2853aa8: 975ed504     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2853aac: 17fffff1     	b	0x2853a70 <_ChromeMain+0x284e7d4>
 2853ab0: d4200020     	brk	#0x1
 2853ab4: 949341bd     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
