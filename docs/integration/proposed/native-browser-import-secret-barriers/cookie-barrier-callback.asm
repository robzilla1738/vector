
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425f838: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 425f83c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 425f840: 910043fd     	add	x29, sp, #0x10
 425f844: f9401413     	ldr	x19, [x0, #0x28]
 425f848: f900141f     	str	xzr, [x0, #0x28]
 425f84c: b40003d3     	cbz	x19, 0x425f8c4 <_ChromeMain+0x425a628>
 425f850: 52800028     	mov	w8, #0x1                ; =1
 425f854: b8280268     	ldadd	w8, w8, [x19]
 425f858: 7100011f     	cmp	w8, #0x0
 425f85c: 540003ad     	b.le	0x425f8d0 <_ChromeMain+0x425a634>
 425f860: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 425f864: 6b09011f     	cmp	w8, w9
 425f868: 540003a0     	b.eq	0x425f8dc <_ChromeMain+0x425a640>
 425f86c: f9400668     	ldr	x8, [x19, #0x8]
 425f870: aa1303e0     	mov	x0, x19
 425f874: d63f0100     	blr	x8
 425f878: 12800014     	mov	w20, #-0x1              ; =-1
 425f87c: b8f40268     	ldaddal	w20, w8, [x19]
 425f880: 7100051f     	cmp	w8, #0x1
 425f884: 54000180     	b.eq	0x425f8b4 <_ChromeMain+0x425a618>
 425f888: b8f40268     	ldaddal	w20, w8, [x19]
 425f88c: 7100051f     	cmp	w8, #0x1
 425f890: 540000c1     	b.ne	0x425f8a8 <_ChromeMain+0x425a60c>
 425f894: f9400a61     	ldr	x1, [x19, #0x10]
 425f898: aa1303e0     	mov	x0, x19
 425f89c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 425f8a0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 425f8a4: d61f0020     	br	x1
 425f8a8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 425f8ac: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 425f8b0: d65f03c0     	ret
 425f8b4: f9400a68     	ldr	x8, [x19, #0x10]
 425f8b8: aa1303e0     	mov	x0, x19
 425f8bc: d63f0100     	blr	x8
 425f8c0: 17fffff2     	b	0x425f888 <_ChromeMain+0x425a5ec>
 425f8c4: d4200000     	brk	#0
 425f8c8: d4400000     	hlt	#0
 425f8cc: d4200020     	brk	#0x1
 425f8d0: d4200000     	brk	#0
 425f8d4: d4400000     	hlt	#0
 425f8d8: d4200020     	brk	#0x1
 425f8dc: d4200000     	brk	#0
 425f8e0: d4400000     	hlt	#0
 425f8e4: d4200020     	brk	#0x1
