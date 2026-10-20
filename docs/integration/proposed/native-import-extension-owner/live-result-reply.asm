
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4255660: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4255664: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4255668: a9027bfd     	stp	x29, x30, [sp, #0x20]
 425566c: 910083fd     	add	x29, sp, #0x20
 4255670: aa0303f6     	mov	x22, x3
 4255674: aa0103f3     	mov	x19, x1
 4255678: aa0003f4     	mov	x20, x0
 425567c: 39400068     	ldrb	w8, [x3]
 4255680: 36000c88     	tbz	w8, #0x0, 0x4255810 <_ChromeMain+0x4250574>
 4255684: aa0203f5     	mov	x21, x2
 4255688: 52802000     	mov	w0, #0x100              ; =256
 425568c: 96f6e737     	bl	0xf368 <_ChromeMain+0xa0cc>
 4255690: 52800028     	mov	w8, #0x1                ; =1
 4255694: 39000008     	strb	w8, [x0]
 4255698: 3cc082c0     	ldur	q0, [x22, #0x8]
 425569c: 3c808000     	stur	q0, [x0, #0x8]
 42556a0: f9400ec9     	ldr	x9, [x22, #0x18]
 42556a4: f9000c09     	str	x9, [x0, #0x18]
 42556a8: 6f00e400     	movi.2d	v0, #0000000000000000
 42556ac: 3c8082c0     	stur	q0, [x22, #0x8]
 42556b0: f9000edf     	str	xzr, [x22, #0x18]
 42556b4: 3dc00ac1     	ldr	q1, [x22, #0x20]
 42556b8: 3d800801     	str	q1, [x0, #0x20]
 42556bc: f9401ac9     	ldr	x9, [x22, #0x30]
 42556c0: f9001809     	str	x9, [x0, #0x30]
 42556c4: 3d800ac0     	str	q0, [x22, #0x20]
 42556c8: f9001adf     	str	xzr, [x22, #0x30]
 42556cc: 3cc382c1     	ldur	q1, [x22, #0x38]
 42556d0: 3c838001     	stur	q1, [x0, #0x38]
 42556d4: 3c8382c0     	stur	q0, [x22, #0x38]
 42556d8: a944aac9     	ldp	x9, x10, [x22, #0x48]
 42556dc: a904fedf     	stp	xzr, xzr, [x22, #0x48]
 42556e0: a904a809     	stp	x9, x10, [x0, #0x48]
 42556e4: 3cc582c1     	ldur	q1, [x22, #0x58]
 42556e8: 3c8582c0     	stur	q0, [x22, #0x58]
 42556ec: 3c858001     	stur	q1, [x0, #0x58]
 42556f0: f94036c9     	ldr	x9, [x22, #0x68]
 42556f4: f90036df     	str	xzr, [x22, #0x68]
 42556f8: f9003409     	str	x9, [x0, #0x68]
 42556fc: 3dc01ec1     	ldr	q1, [x22, #0x70]
 4255700: 3d801ec0     	str	q0, [x22, #0x70]
 4255704: 3d801c01     	str	q1, [x0, #0x70]
 4255708: f94042c9     	ldr	x9, [x22, #0x80]
 425570c: f90042df     	str	xzr, [x22, #0x80]
 4255710: f9004009     	str	x9, [x0, #0x80]
 4255714: 3cc882c1     	ldur	q1, [x22, #0x88]
 4255718: 3c8882c0     	stur	q0, [x22, #0x88]
 425571c: 3c888001     	stur	q1, [x0, #0x88]
 4255720: f9404ec9     	ldr	x9, [x22, #0x98]
 4255724: f9004edf     	str	xzr, [x22, #0x98]
 4255728: f9004c09     	str	x9, [x0, #0x98]
 425572c: 3dc02ac1     	ldr	q1, [x22, #0xa0]
 4255730: 3d802ac0     	str	q0, [x22, #0xa0]
 4255734: 3d802801     	str	q1, [x0, #0xa0]
 4255738: f9405ac9     	ldr	x9, [x22, #0xb0]
 425573c: f9005adf     	str	xzr, [x22, #0xb0]
 4255740: f9005809     	str	x9, [x0, #0xb0]
 4255744: 3ccb82c1     	ldur	q1, [x22, #0xb8]
 4255748: 3c8b82c0     	stur	q0, [x22, #0xb8]
 425574c: 3c8b8001     	stur	q1, [x0, #0xb8]
 4255750: aa0003e9     	mov	x9, x0
 4255754: 380c8d3f     	strb	wzr, [x9, #0xc8]!
 4255758: 3903e01f     	strb	wzr, [x0, #0xf8]
 425575c: 3943e2ca     	ldrb	w10, [x22, #0xf8]
 4255760: 340001aa     	cbz	w10, 0x4255794 <_ChromeMain+0x42504f8>
 4255764: 3ccc82c0     	ldur	q0, [x22, #0xc8]
 4255768: 3d800120     	str	q0, [x9]
 425576c: f9406eca     	ldr	x10, [x22, #0xd8]
 4255770: f900092a     	str	x10, [x9, #0x10]
 4255774: a90cfedf     	stp	xzr, xzr, [x22, #0xc8]
 4255778: 3dc03ac0     	ldr	q0, [x22, #0xe0]
 425577c: a90dfedf     	stp	xzr, xzr, [x22, #0xd8]
 4255780: 3d803800     	str	q0, [x0, #0xe0]
 4255784: f9407ac9     	ldr	x9, [x22, #0xf0]
 4255788: f9007809     	str	x9, [x0, #0xf0]
 425578c: a90efedf     	stp	xzr, xzr, [x22, #0xe8]
 4255790: 3903e008     	strb	w8, [x0, #0xf8]
 4255794: f9403696     	ldr	x22, [x20, #0x68]
 4255798: f9003680     	str	x0, [x20, #0x68]
 425579c: b40000b6     	cbz	x22, 0x42557b0 <_ChromeMain+0x4250514>
 42557a0: aa1603e0     	mov	x0, x22
 42557a4: 94000e90     	bl	0x42591e4 <_ChromeMain+0x4253f48>
 42557a8: 52802001     	mov	w1, #0x100              ; =256
 42557ac: 96f6cdc3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42557b0: b4000413     	cbz	x19, 0x4255830 <_ChromeMain+0x4250594>
 42557b4: 19404268     	ldapurb	w8, [x19, #0x4]
 42557b8: 350003c8     	cbnz	w8, 0x4255830 <_ChromeMain+0x4250594>
 42557bc: b40003b5     	cbz	x21, 0x4255830 <_ChromeMain+0x4250594>
 42557c0: 19404268     	ldapurb	w8, [x19, #0x4]
 42557c4: 7100011f     	cmp	w8, #0x0
 42557c8: 9a9f02a1     	csel	x1, x21, xzr, eq
 42557cc: aa1403e0     	mov	x0, x20
 42557d0: 94000a4e     	bl	0x4258108 <_ChromeMain+0x4252e6c>
 42557d4: 19404268     	ldapurb	w8, [x19, #0x4]
 42557d8: 7100011f     	cmp	w8, #0x0
 42557dc: 9a9f02a1     	csel	x1, x21, xzr, eq
 42557e0: aa1403e0     	mov	x0, x20
 42557e4: 94000b8d     	bl	0x4258618 <_ChromeMain+0x425337c>
 42557e8: 12800008     	mov	w8, #-0x1               ; =-1
 42557ec: b8e80268     	ldaddal	w8, w8, [x19]
 42557f0: 7100051f     	cmp	w8, #0x1
 42557f4: 54000241     	b.ne	0x425583c <_ChromeMain+0x42505a0>
 42557f8: aa1303e0     	mov	x0, x19
 42557fc: 52800101     	mov	w1, #0x8                ; =8
 4255800: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4255804: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4255808: a8c357f6     	ldp	x22, x21, [sp], #0x30
 425580c: 16f6cdab     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4255810: 39c19e88     	ldrsb	w8, [x20, #0x67]
 4255814: 37f801c8     	tbnz	w8, #0x1f, 0x425584c <_ChromeMain+0x42505b0>
 4255818: 3cc082c0     	ldur	q0, [x22, #0x8]
 425581c: f84182c8     	ldur	x8, [x22, #0x18]
 4255820: f8060288     	stur	x8, [x20, #0x60]
 4255824: 3c850280     	stur	q0, [x20, #0x50]
 4255828: 39007edf     	strb	wzr, [x22, #0x1f]
 425582c: 390022df     	strb	wzr, [x22, #0x8]
 4255830: aa1403e0     	mov	x0, x20
 4255834: 97fff8c2     	bl	0x4253b3c <_ChromeMain+0x424e8a0>
 4255838: b5fffd93     	cbnz	x19, 0x42557e8 <_ChromeMain+0x425054c>
 425583c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4255840: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4255844: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4255848: d65f03c0     	ret
 425584c: f9402a80     	ldr	x0, [x20, #0x50]
 4255850: f9403288     	ldr	x8, [x20, #0x60]
 4255854: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255858: 96f6cd98     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425585c: a9057e9f     	stp	xzr, xzr, [x20, #0x50]
 4255860: f806029f     	stur	xzr, [x20, #0x60]
 4255864: 17ffffed     	b	0x4255818 <_ChromeMain+0x425057c>
