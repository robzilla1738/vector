
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464646c: d10143ff     	sub	sp, sp, #0x50
 4646470: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4646474: a90257f6     	stp	x22, x21, [sp, #0x20]
 4646478: a9034ff4     	stp	x20, x19, [sp, #0x30]
 464647c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4646480: 910103fd     	add	x29, sp, #0x40
 4646484: aa0003f3     	mov	x19, x0
 4646488: 91400417     	add	x23, x0, #0x1, lsl #12  ; =0x1000
 464648c: f9423408     	ldr	x8, [x0, #0x468]
 4646490: b4000bc8     	cbz	x8, 0x4646608 <_ChromeMain+0x464136c>
 4646494: f9404914     	ldr	x20, [x8, #0x90]
 4646498: f90007f3     	str	x19, [sp, #0x8]
 464649c: 910023e0     	add	x0, sp, #0x8
 46464a0: aa1403e1     	mov	x1, x20
 46464a4: 94001e9a     	bl	0x464df0c <_ChromeMain+0x4648c70>
 46464a8: aa1403f5     	mov	x21, x20
 46464ac: 370006c0     	tbnz	w0, #0x0, 0x4646584 <_ChromeMain+0x46412e8>
 46464b0: 394092e8     	ldrb	w8, [x23, #0x24]
 46464b4: 340004c8     	cbz	w8, 0x464654c <_ChromeMain+0x46412b0>
 46464b8: f9423668     	ldr	x8, [x19, #0x468]
 46464bc: b4000488     	cbz	x8, 0x464654c <_ChromeMain+0x46412b0>
 46464c0: f9400100     	ldr	x0, [x8]
 46464c4: b9401808     	ldr	w8, [x0, #0x18]
 46464c8: 7100051f     	cmp	w8, #0x1
 46464cc: 5400040b     	b.lt	0x464654c <_ChromeMain+0x46412b0>
 46464d0: d2800015     	mov	x21, #0x0               ; =0
 46464d4: b9502276     	ldr	w22, [x19, #0x1020]
 46464d8: 1400000e     	b	0x4646510 <_ChromeMain+0x4641274>
 46464dc: 52820408     	mov	w8, #0x1020             ; =4128
 46464e0: 8b080275     	add	x21, x19, x8
 46464e4: b910227f     	str	wzr, [x19, #0x1020]
 46464e8: 3842cee8     	ldrb	w8, [x23, #0x2c]!
 46464ec: 381f82ff     	sturb	wzr, [x23, #-0x8]
 46464f0: 360006c8     	tbz	w8, #0x0, 0x46465c8 <_ChromeMain+0x464132c>
 46464f4: 1400002f     	b	0x46465b0 <_ChromeMain+0x4641314>
 46464f8: 910006b5     	add	x21, x21, #0x1
 46464fc: f9423668     	ldr	x8, [x19, #0x468]
 4646500: f9400100     	ldr	x0, [x8]
 4646504: b9801808     	ldrsw	x8, [x0, #0x18]
 4646508: eb0802bf     	cmp	x21, x8
 464650c: 5400020a     	b.ge	0x464654c <_ChromeMain+0x46412b0>
 4646510: aa1503e1     	mov	x1, x21
 4646514: 97285f79     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4646518: b4ffff00     	cbz	x0, 0x46464f8 <_ChromeMain+0x464125c>
 464651c: b9401008     	ldr	w8, [x0, #0x10]
 4646520: 6b16011f     	cmp	w8, w22
 4646524: 54fffea1     	b.ne	0x46464f8 <_ChromeMain+0x464125c>
 4646528: f9423668     	ldr	x8, [x19, #0x468]
 464652c: f9400100     	ldr	x0, [x8]
 4646530: aa1503e1     	mov	x1, x21
 4646534: 97285f71     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4646538: aa0003f5     	mov	x21, x0
 464653c: 910023e0     	add	x0, sp, #0x8
 4646540: aa1503e1     	mov	x1, x21
 4646544: 94001e72     	bl	0x464df0c <_ChromeMain+0x4648c70>
 4646548: 370001e0     	tbnz	w0, #0x0, 0x4646584 <_ChromeMain+0x46412e8>
 464654c: d2800016     	mov	x22, #0x0               ; =0
 4646550: f9423668     	ldr	x8, [x19, #0x468]
 4646554: f9400100     	ldr	x0, [x8]
 4646558: b9801808     	ldrsw	x8, [x0, #0x18]
 464655c: eb0802df     	cmp	x22, x8
 4646560: 54fffbea     	b.ge	0x46464dc <_ChromeMain+0x4641240>
 4646564: aa1603e1     	mov	x1, x22
 4646568: 97285f64     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 464656c: aa0003f5     	mov	x21, x0
 4646570: 910023e0     	add	x0, sp, #0x8
 4646574: aa1503e1     	mov	x1, x21
 4646578: 94001e65     	bl	0x464df0c <_ChromeMain+0x4648c70>
 464657c: 910006d6     	add	x22, x22, #0x1
 4646580: 3607fe80     	tbz	w0, #0x0, 0x4646550 <_ChromeMain+0x46412b4>
 4646584: b94012a8     	ldr	w8, [x21, #0x10]
 4646588: 52820409     	mov	w9, #0x1020             ; =4128
 464658c: 8b090275     	add	x21, x19, x9
 4646590: b9102268     	str	w8, [x19, #0x1020]
 4646594: 3842cee9     	ldrb	w9, [x23, #0x2c]!
 4646598: 5280002a     	mov	w10, #0x1               ; =1
 464659c: 381f82ea     	sturb	w10, [x23, #-0x8]
 46465a0: 34000149     	cbz	w9, 0x46465c8 <_ChromeMain+0x464132c>
 46465a4: b9502a69     	ldr	w9, [x19, #0x1028]
 46465a8: 6b08013f     	cmp	w9, w8
 46465ac: 540000e0     	b.eq	0x46465c8 <_ChromeMain+0x464132c>
 46465b0: 52820608     	mov	w8, #0x1030             ; =4144
 46465b4: 8b080260     	add	x0, x19, x8
 46465b8: 9703a058     	bl	0x72e718 <_ChromeMain+0x72947c>
 46465bc: 394002e8     	ldrb	w8, [x23]
 46465c0: 34000048     	cbz	w8, 0x46465c8 <_ChromeMain+0x464132c>
 46465c4: 390002ff     	strb	wzr, [x23]
 46465c8: f942e660     	ldr	x0, [x19, #0x5c8]
 46465cc: b4000120     	cbz	x0, 0x46465f0 <_ChromeMain+0x4641354>
 46465d0: 52800002     	mov	w2, #0x0                ; =0
 46465d4: f94002a1     	ldr	x1, [x21]
 46465d8: b40000b4     	cbz	x20, 0x46465ec <_ChromeMain+0x4641350>
 46465dc: b6000081     	tbz	x1, #0x20, 0x46465ec <_ChromeMain+0x4641350>
 46465e0: b9401288     	ldr	w8, [x20, #0x10]
 46465e4: 6b01011f     	cmp	w8, w1
 46465e8: 1a9f17e2     	cset	w2, eq
 46465ec: 97fff369     	bl	0x4643390 <_ChromeMain+0x463e0f4>
 46465f0: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 46465f4: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 46465f8: a94257f6     	ldp	x22, x21, [sp, #0x20]
 46465fc: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4646600: 910143ff     	add	sp, sp, #0x50
 4646604: d65f03c0     	ret
 4646608: 52820608     	mov	w8, #0x1030             ; =4144
 464660c: 8b080260     	add	x0, x19, x8
 4646610: 9703a042     	bl	0x72e718 <_ChromeMain+0x72947c>
 4646614: 3940b2e8     	ldrb	w8, [x23, #0x2c]
 4646618: 34000048     	cbz	w8, 0x4646620 <_ChromeMain+0x4641384>
 464661c: 3900b2ff     	strb	wzr, [x23, #0x2c]
 4646620: 394092e8     	ldrb	w8, [x23, #0x24]
 4646624: 34000048     	cbz	w8, 0x464662c <_ChromeMain+0x4641390>
 4646628: 390092ff     	strb	wzr, [x23, #0x24]
 464662c: f942e660     	ldr	x0, [x19, #0x5c8]
 4646630: b4fffe00     	cbz	x0, 0x46465f0 <_ChromeMain+0x4641354>
 4646634: d2800001     	mov	x1, #0x0                ; =0
 4646638: 52800002     	mov	w2, #0x0                ; =0
 464663c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4646640: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4646644: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4646648: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 464664c: 910143ff     	add	sp, sp, #0x50
 4646650: 17fff350     	b	0x4643390 <_ChromeMain+0x463e0f4>
