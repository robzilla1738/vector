
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 411e8c0: aa0003f3     	mov	x19, x0
 411e8c4: f9425c00     	ldr	x0, [x0, #0x4b8]
 411e8c8: b4000ce0     	cbz	x0, 0x411ea64 <_ChromeMain+0x41197c8>
 411e8cc: f9400008     	ldr	x8, [x0]
 411e8d0: f9402508     	ldr	x8, [x8, #0x48]
 411e8d4: d63f0100     	blr	x8
 411e8d8: 34000120     	cbz	w0, 0x411e8fc <_ChromeMain+0x4119660>
 411e8dc: f9425e60     	ldr	x0, [x19, #0x4b8]
 411e8e0: b4000c80     	cbz	x0, 0x411ea70 <_ChromeMain+0x41197d4>
 411e8e4: f9400008     	ldr	x8, [x0]
 411e8e8: f9403508     	ldr	x8, [x8, #0x68]
 411e8ec: d63f0100     	blr	x8
 411e8f0: b4000060     	cbz	x0, 0x411e8fc <_ChromeMain+0x4119660>
 411e8f4: 39531268     	ldrb	w8, [x19, #0x4c4]
 411e8f8: 360000a8     	tbz	w8, #0x0, 0x411e90c <_ChromeMain+0x4119670>
 411e8fc: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 411e900: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 411e904: 910143ff     	add	sp, sp, #0x50
 411e908: d65f03c0     	ret
 411e90c: 52800028     	mov	w8, #0x1                ; =1
 411e910: 39162268     	strb	w8, [x19, #0x588]
 411e914: b944c268     	ldr	w8, [x19, #0x4c0]
 411e918: 7100051f     	cmp	w8, #0x1
 411e91c: 54000101     	b.ne	0x411e93c <_ChromeMain+0x41196a0>
 411e920: d2800088     	mov	x8, #0x4                ; =4
 411e924: f2c00108     	movk	x8, #0x8, lsl #32
 411e928: 4e080d00     	dup.2d	v0, x8
 411e92c: 3d800be0     	str	q0, [sp, #0x20]
 411e930: 910083e1     	add	x1, sp, #0x20
 411e934: aa1303e0     	mov	x0, x19
 411e938: 9596d39b     	bl	0xa6d37a4 <_ChromeMain+0xa6ce508>
 411e93c: f9423e60     	ldr	x0, [x19, #0x478]
