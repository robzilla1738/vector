
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46080e0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 46080e4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 46080e8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 46080ec: 910083fd     	add	x29, sp, #0x20
 46080f0: b9436808     	ldr	w8, [x0, #0x368]
 46080f4: 39555009     	ldrb	w9, [x0, #0x554]
 46080f8: 2b080134     	adds	w20, w9, w8
 46080fc: 54000320     	b.eq	0x4608160 <_ChromeMain+0x4602ec4>
 4608100: aa0103f3     	mov	x19, x1
 4608104: 940002ff     	bl	0x4608d00 <_ChromeMain+0x4603a64>
 4608108: 0b000288     	add	w8, w20, w0
 460810c: 51000508     	sub	w8, w8, #0x1
 4608110: 1ac00d15     	sdiv	w21, w8, w0
 4608114: 34000275     	cbz	w21, 0x4608160 <_ChromeMain+0x4602ec4>
 4608118: 52800760     	mov	w0, #0x3b               ; =59
 460811c: 96fbede9     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4608120: 39401268     	ldrb	w8, [x19, #0x4]
 4608124: 35000068     	cbnz	w8, 0x4608130 <_ChromeMain+0x4602e94>
 4608128: aa0003f4     	mov	x20, x0
 460812c: 14000002     	b	0x4608134 <_ChromeMain+0x4602e98>
 4608130: b9400274     	ldr	w20, [x19]
 4608134: 52800740     	mov	w0, #0x3a               ; =58
 4608138: 96fbede2     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 460813c: 510006a8     	sub	w8, w21, #0x1
 4608140: 0aa87d08     	bic	w8, w8, w8, asr #31
 4608144: 528000c9     	mov	w9, #0x6                ; =6
 4608148: 1b097d08     	mul	w8, w8, w9
 460814c: 1b152008     	madd	w8, w0, w21, w8
 4608150: 0ab47e89     	bic	w9, w20, w20, asr #31
 4608154: 0aa87d08     	bic	w8, w8, w8, asr #31
 4608158: aa088120     	orr	x0, x9, x8, lsl #32
 460815c: 14000002     	b	0x4608164 <_ChromeMain+0x4602ec8>
 4608160: d2800000     	mov	x0, #0x0                ; =0
 4608164: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4608168: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 460816c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4608170: d65f03c0     	ret
