
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c785524: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 c785528: a9014ff4     	stp	x20, x19, [sp, #0x10]
 c78552c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 c785530: 910083fd     	add	x29, sp, #0x20
 c785534: aa0003f3     	mov	x19, x0
 c785538: 97fffefd     	bl	0xc78512c <_ChromeMain+0xc77fe90>
 c78553c: aa1303e0     	mov	x0, x19
 c785540: 94102123     	bl	0xcb8d9cc <_ChromeMain+0xcb88730>
 c785544: f941b668     	ldr	x8, [x19, #0x368]
 c785548: b4000488     	cbz	x8, 0xc7855d8 <_ChromeMain+0xc78033c>
 c78554c: d2800014     	mov	x20, #0x0               ; =0
 c785550: b0013c36     	adrp	x22, 0xef0a000 <dyld_stub_binder+0xef0a000>
 c785554: 911202d6     	add	x22, x22, #0x480
 c785558: f8bfc2c0     	ldapr	x0, [x22]
 c78555c: b4000460     	cbz	x0, 0xc7855e8 <_ChromeMain+0xc78034c>
 c785560: 52808001     	mov	w1, #0x400              ; =1024
 c785564: d2800002     	mov	x2, #0x0                ; =0
 c785568: 940ff857     	bl	0xcb836c4 <_ChromeMain+0xcb7e428>
 c78556c: aa0003f5     	mov	x21, x0
 c785570: aa1303e1     	mov	x1, x19
 c785574: aa1403e2     	mov	x2, x20
 c785578: 9410a9d7     	bl	0xcbafcd4 <_ChromeMain+0xcbaaa38>
 c78557c: 9410a9d9     	bl	0xcbafce0 <_ChromeMain+0xcbaaa44>
 c785580: 3945a6a8     	ldrb	w8, [x21, #0x169]
 c785584: 35000368     	cbnz	w8, 0xc7855f0 <_ChromeMain+0xc780354>
 c785588: f940ce62     	ldr	x2, [x19, #0x198]
 c78558c: aa1303e0     	mov	x0, x19
 c785590: aa1503e1     	mov	x1, x21
 c785594: 94102120     	bl	0xcb8da14 <_ChromeMain+0xcb88778>
 c785598: 91000694     	add	x20, x20, #0x1
 c78559c: f941b668     	ldr	x8, [x19, #0x368]
 c7855a0: eb08029f     	cmp	x20, x8
 c7855a4: 54fffda3     	b.lo	0xc785558 <_ChromeMain+0xc7802bc>
 c7855a8: b4000188     	cbz	x8, 0xc7855d8 <_ChromeMain+0xc78033c>
 c7855ac: aa1303e0     	mov	x0, x19
 c7855b0: d2800001     	mov	x1, #0x0                ; =0
 c7855b4: 9410a9ce     	bl	0xcbafcec <_ChromeMain+0xcbaaa50>
 c7855b8: f9424668     	ldr	x8, [x19, #0x488]
 c7855bc: b40000e8     	cbz	x8, 0xc7855d8 <_ChromeMain+0xc78033c>
 c7855c0: f901f11f     	str	xzr, [x8, #0x3e0]
 c7855c4: f9424660     	ldr	x0, [x19, #0x488]
 c7855c8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 c7855cc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 c7855d0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 c7855d4: 1410a9c3     	b	0xcbafce0 <_ChromeMain+0xcbaaa44>
 c7855d8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 c7855dc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 c7855e0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 c7855e4: d65f03c0     	ret
 c7855e8: 94109df1     	bl	0xcbacdac <_ChromeMain+0xcba7b10>
 c7855ec: 17ffffdd     	b	0xc785560 <_ChromeMain+0xc7802c4>
 c7855f0: d4200000     	brk	#0
 c7855f4: d4400000     	hlt	#0
 c7855f8: d4200020     	brk	#0x1
