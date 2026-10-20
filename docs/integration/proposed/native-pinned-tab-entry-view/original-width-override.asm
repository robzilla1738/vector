
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4606480: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4606484: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4606488: a9027bfd     	stp	x29, x30, [sp, #0x20]
 460648c: 910083fd     	add	x29, sp, #0x20
 4606490: aa0103f4     	mov	x20, x1
 4606494: aa0003f3     	mov	x19, x0
 4606498: d360fc35     	lsr	x21, x1, #32
 460649c: b60001c1     	tbz	x1, #0x20, 0x46064d4 <_ChromeMain+0x4601238>
 46064a0: 52800760     	mov	w0, #0x3b               ; =59
 46064a4: 96fbf507     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 46064a8: 6b14001f     	cmp	w0, w20
 46064ac: 1a94c014     	csel	w20, w0, w20, gt
 46064b0: 39554268     	ldrb	w8, [x19, #0x550]
 46064b4: 34000168     	cbz	w8, 0x46064e0 <_ChromeMain+0x4601244>
 46064b8: b9454e68     	ldr	w8, [x19, #0x54c]
 46064bc: 6b14011f     	cmp	w8, w20
 46064c0: 54000101     	b.ne	0x46064e0 <_ChromeMain+0x4601244>
 46064c4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 46064c8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 46064cc: a8c357f6     	ldp	x22, x21, [sp], #0x30
 46064d0: d65f03c0     	ret
 46064d4: 39554268     	ldrb	w8, [x19, #0x550]
 46064d8: 6b35011f     	cmp	w8, w21, uxtb
 46064dc: 54ffff40     	b.eq	0x46064c4 <_ChromeMain+0x4601228>
 46064e0: b9054e74     	str	w20, [x19, #0x54c]
 46064e4: 39154275     	strb	w21, [x19, #0x550]
 46064e8: aa1303e0     	mov	x0, x19
 46064ec: 52800001     	mov	w1, #0x0                ; =0
 46064f0: 9700a7e1     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46064f4: f9400268     	ldr	x8, [x19]
 46064f8: f9418501     	ldr	x1, [x8, #0x308]
 46064fc: aa1303e0     	mov	x0, x19
 4606500: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4606504: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4606508: a8c357f6     	ldp	x22, x21, [sp], #0x30
 460650c: d61f0020     	br	x1
