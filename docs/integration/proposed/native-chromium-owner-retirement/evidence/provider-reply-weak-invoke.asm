
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41b06c8: f9401808     	ldr	x8, [x0, #0x30]
 41b06cc: b4000068     	cbz	x8, 0x41b06d8 <_ChromeMain+0x41ab43c>
 41b06d0: 19404108     	ldapurb	w8, [x8, #0x4]
 41b06d4: 34000048     	cbz	w8, 0x41b06dc <_ChromeMain+0x41ab440>
 41b06d8: d65f03c0     	ret
 41b06dc: f9401c08     	ldr	x8, [x0, #0x38]
 41b06e0: b4ffffc8     	cbz	x8, 0x41b06d8 <_ChromeMain+0x41ab43c>
 41b06e4: f9401808     	ldr	x8, [x0, #0x30]
 41b06e8: b40004e8     	cbz	x8, 0x41b0784 <_ChromeMain+0x41ab4e8>
 41b06ec: a9422809     	ldp	x9, x10, [x0, #0x20]
 41b06f0: 19404108     	ldapurb	w8, [x8, #0x4]
 41b06f4: 35000488     	cbnz	w8, 0x41b0784 <_ChromeMain+0x41ab4e8>
 41b06f8: f9401c08     	ldr	x8, [x0, #0x38]
 41b06fc: 8b8a0508     	add	x8, x8, x10, asr #1
 41b0700: 3600006a     	tbz	w10, #0x0, 0x41b070c <_ChromeMain+0x41ab470>
 41b0704: f940010a     	ldr	x10, [x8]
 41b0708: f8694949     	ldr	x9, [x10, w9, uxtw]
 41b070c: d100c3ff     	sub	sp, sp, #0x30
 41b0710: a9027bfd     	stp	x29, x30, [sp, #0x20]
 41b0714: 910083fd     	add	x29, sp, #0x20
 41b0718: 390003ff     	strb	wzr, [sp]
 41b071c: 390063ff     	strb	wzr, [sp, #0x18]
 41b0720: 3940602a     	ldrb	w10, [x1, #0x18]
 41b0724: 3400012a     	cbz	w10, 0x41b0748 <_ChromeMain+0x41ab4ac>
 41b0728: 3dc00020     	ldr	q0, [x1]
 41b072c: 3d8003e0     	str	q0, [sp]
 41b0730: f940082a     	ldr	x10, [x1, #0x10]
 41b0734: f9000bea     	str	x10, [sp, #0x10]
 41b0738: a900fc3f     	stp	xzr, xzr, [x1, #0x8]
 41b073c: f900003f     	str	xzr, [x1]
 41b0740: 5280002a     	mov	w10, #0x1               ; =1
 41b0744: 390063ea     	strb	w10, [sp, #0x18]
 41b0748: 91010001     	add	x1, x0, #0x40
 41b074c: 910003e2     	mov	x2, sp
 41b0750: aa0803e0     	mov	x0, x8
 41b0754: d63f0120     	blr	x9
 41b0758: 394063e8     	ldrb	w8, [sp, #0x18]
 41b075c: 340000e8     	cbz	w8, 0x41b0778 <_ChromeMain+0x41ab4dc>
 41b0760: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41b0764: 36f800a8     	tbz	w8, #0x1f, 0x41b0778 <_ChromeMain+0x41ab4dc>
 41b0768: f94003e0     	ldr	x0, [sp]
 41b076c: f9400be8     	ldr	x8, [sp, #0x10]
 41b0770: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41b0774: 96f961d1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41b0778: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 41b077c: 9100c3ff     	add	sp, sp, #0x30
 41b0780: d65f03c0     	ret
 41b0784: d4200000     	brk	#0
 41b0788: d4400000     	hlt	#0
