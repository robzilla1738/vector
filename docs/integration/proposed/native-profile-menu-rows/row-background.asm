
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 457b0f8: d100c3ff     	sub	sp, sp, #0x30
 457b0fc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 457b100: a9027bfd     	stp	x29, x30, [sp, #0x20]
 457b104: 910083fd     	add	x29, sp, #0x20
 457b108: aa0003f3     	mov	x19, x0
 457b10c: 39472408     	ldrb	w8, [x0, #0x1c9]
 457b110: 37000128     	tbnz	w8, #0x0, 0x457b134 <_ChromeMain+0x4575e98>
 457b114: aa1303e0     	mov	x0, x19
 457b118: d2800001     	mov	x1, #0x0                ; =0
 457b11c: 9726b239     	bl	0xf27a00 <_ChromeMain+0xf22764>
 457b120: aa1303e0     	mov	x0, x19
 457b124: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 457b128: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 457b12c: 9100c3ff     	add	sp, sp, #0x30
 457b130: 17009813     	b	0x5a117c <_ChromeMain+0x59bee0>
 457b134: 3952e268     	ldrb	w8, [x19, #0x4b8]
 457b138: 37000148     	tbnz	w8, #0x0, 0x457b160 <_ChromeMain+0x4575ec4>
 457b13c: 3952e668     	ldrb	w8, [x19, #0x4b9]
 457b140: 37000108     	tbnz	w8, #0x0, 0x457b160 <_ChromeMain+0x4575ec4>
 457b144: b943be68     	ldr	w8, [x19, #0x3bc]
 457b148: 51000508     	sub	w8, w8, #0x1
 457b14c: 7100051f     	cmp	w8, #0x1
 457b150: 54000089     	b.ls	0x457b160 <_ChromeMain+0x4575ec4>
 457b154: aa1303e0     	mov	x0, x19
 457b158: d2800001     	mov	x1, #0x0                ; =0
 457b15c: 1400000a     	b	0x457b184 <_ChromeMain+0x4575ee8>
 457b160: 52801f08     	mov	w8, #0xf8               ; =248
 457b164: b9000be8     	str	w8, [sp, #0x8]
 457b168: 390033ff     	strb	wzr, [sp, #0xc]
 457b16c: 910023e0     	add	x0, sp, #0x8
 457b170: 1e231000     	fmov	s0, #6.00000000
 457b174: 52800001     	mov	w1, #0x0                ; =0
 457b178: 97878fd2     	bl	0x275f0c0 <_ChromeMain+0x2759e24>
 457b17c: aa0003e1     	mov	x1, x0
 457b180: aa1303e0     	mov	x0, x19
 457b184: 9726b21f     	bl	0xf27a00 <_ChromeMain+0xf22764>
 457b188: aa1303e0     	mov	x0, x19
 457b18c: 970097fc     	bl	0x5a117c <_ChromeMain+0x59bee0>
 457b190: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 457b194: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 457b198: 9100c3ff     	add	sp, sp, #0x30
