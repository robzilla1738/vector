
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4245240: 3947a408     	ldrb	w8, [x0, #0x1e9]
 4245244: 360003c8     	tbz	w8, #0x0, 0x42452bc <_ChromeMain+0x4240020>
 4245248: d100c3ff     	sub	sp, sp, #0x30
 424524c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4245250: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4245254: 910083fd     	add	x29, sp, #0x20
 4245258: aa0003f3     	mov	x19, x0
 424525c: 91003fe1     	add	x1, sp, #0xf
 4245260: 97478d3d     	bl	0x1428754 <_ChromeMain+0x14234b8>
 4245264: f941ee68     	ldr	x8, [x19, #0x3d8]
 4245268: b4000228     	cbz	x8, 0x42452ac <_ChromeMain+0x4240010>
 424526c: f941c669     	ldr	x9, [x19, #0x388]
 4245270: b40001e9     	cbz	x9, 0x42452ac <_ChromeMain+0x4240010>
 4245274: f940e129     	ldr	x9, [x9, #0x1c0]
 4245278: d360fd2a     	lsr	x10, x9, #32
 424527c: 0b497d2b     	add	w11, w9, w9, lsr #31
 4245280: 13017d6b     	asr	w11, w11, #1
 4245284: 8b49fd49     	add	x9, x10, x9, lsr #63
 4245288: 13017d2a     	asr	w10, w9, #1
 424528c: 6b89057f     	cmp	w11, w9, asr #1
 4245290: 1a8ab169     	csel	w9, w11, w10, lt
 4245294: 0aa97d29     	bic	w9, w9, w9, asr #31
 4245298: 5280018a     	mov	w10, #0xc               ; =12
 424529c: 7100313f     	cmp	w9, #0xc
 42452a0: 1a8ab121     	csel	w1, w9, w10, lt
 42452a4: f9400d00     	ldr	x0, [x8, #0x18]
 42452a8: 94aeefaf     	bl	0x6e01164 <_ChromeMain+0x6dfbec8>
 42452ac: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 42452b0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 42452b4: 9100c3ff     	add	sp, sp, #0x30
 42452b8: d65f03c0     	ret
 42452bc: d4200000     	brk	#0
 42452c0: d4400000     	hlt	#0
 42452c4: d4200020     	brk	#0x1
