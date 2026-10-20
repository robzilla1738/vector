
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46835d8: b40002a1     	cbz	x1, 0x468362c <_ChromeMain+0x467e390>
 46835dc: d10143ff     	sub	sp, sp, #0x50
 46835e0: a90257f6     	stp	x22, x21, [sp, #0x20]
 46835e4: a9034ff4     	stp	x20, x19, [sp, #0x30]
 46835e8: a9047bfd     	stp	x29, x30, [sp, #0x40]
 46835ec: 910103fd     	add	x29, sp, #0x40
 46835f0: aa0103f4     	mov	x20, x1
 46835f4: f100a028     	subs	x8, x1, #0x28
 46835f8: 54000480     	b.eq	0x4683688 <_ChromeMain+0x467e3ec>
 46835fc: aa0003f3     	mov	x19, x0
 4683600: f9400009     	ldr	x9, [x0]
 4683604: f9400129     	ldr	x9, [x9]
 4683608: eb09011f     	cmp	x8, x9
 468360c: 540003e0     	b.eq	0x4683688 <_ChromeMain+0x467e3ec>
 4683610: f940b288     	ldr	x8, [x20, #0x160]
 4683614: f0052976     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4683618: b40001e8     	cbz	x8, 0x4683654 <_ChromeMain+0x467e3b8>
 468361c: 91058289     	add	x9, x20, #0x160
 4683620: b005228a     	adrp	x10, 0xead4000 <dyld_stub_binder+0xead4000>
 4683624: 9131414a     	add	x10, x10, #0xc50
 4683628: 14000005     	b	0x468363c <_ChromeMain+0x467e3a0>
 468362c: 52800020     	mov	w0, #0x1                ; =1
 4683630: d65f03c0     	ret
 4683634: f9400108     	ldr	x8, [x8]
 4683638: b40000e8     	cbz	x8, 0x4683654 <_ChromeMain+0x467e3b8>
 468363c: f940110b     	ldr	x11, [x8, #0x20]
 4683640: eb0a017f     	cmp	x11, x10
 4683644: 54ffff88     	b.hi	0x4683634 <_ChromeMain+0x467e398>
 4683648: 540002c0     	b.eq	0x46836a0 <_ChromeMain+0x467e404>
 468364c: f9400508     	ldr	x8, [x8, #0x8]
 4683650: b5ffff68     	cbnz	x8, 0x468363c <_ChromeMain+0x467e3a0>
 4683654: d2800015     	mov	x21, #0x0               ; =0
 4683658: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 468365c: f94046c9     	ldr	x9, [x22, #0x88]
 4683660: eb09011f     	cmp	x8, x9
 4683664: 54000061     	b.ne	0x4683670 <_ChromeMain+0x467e3d4>
 4683668: aa1503e0     	mov	x0, x21
 468366c: 96e67cf4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4683670: 394522a8     	ldrb	w8, [x21, #0x148]
 4683674: 370000a8     	tbnz	w8, #0x0, 0x4683688 <_ChromeMain+0x467e3ec>
 4683678: 39432288     	ldrb	w8, [x20, #0xc8]
 468367c: 37000068     	tbnz	w8, #0x0, 0x4683688 <_ChromeMain+0x467e3ec>
 4683680: b9403a88     	ldr	w8, [x20, #0x38]
 4683684: 34000228     	cbz	w8, 0x46836c8 <_ChromeMain+0x467e42c>
 4683688: 52800020     	mov	w0, #0x1                ; =1
 468368c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4683690: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4683694: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4683698: 910143ff     	add	sp, sp, #0x50
 468369c: d65f03c0     	ret
 46836a0: eb09011f     	cmp	x8, x9
 46836a4: 54fffd80     	b.eq	0x4683654 <_ChromeMain+0x467e3b8>
 46836a8: f9401515     	ldr	x21, [x8, #0x28]
 46836ac: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 46836b0: f94046c9     	ldr	x9, [x22, #0x88]
 46836b4: eb09011f     	cmp	x8, x9
 46836b8: 54fffd01     	b.ne	0x4683658 <_ChromeMain+0x467e3bc>
 46836bc: aa1503e0     	mov	x0, x21
 46836c0: 96e6430f     	bl	0x142fc <_ChromeMain+0xf060>
 46836c4: 17ffffe5     	b	0x4683658 <_ChromeMain+0x467e3bc>
 46836c8: f9402280     	ldr	x0, [x20, #0x40]
 46836cc: b4fffde0     	cbz	x0, 0x4683688 <_ChromeMain+0x467e3ec>
 46836d0: f9400008     	ldr	x8, [x0]
 46836d4: f940a508     	ldr	x8, [x8, #0x148]
 46836d8: d63f0100     	blr	x8
 46836dc: b4fffd60     	cbz	x0, 0x4683688 <_ChromeMain+0x467e3ec>
 46836e0: f9400008     	ldr	x8, [x0]
 46836e4: f9401909     	ldr	x9, [x8, #0x30]
 46836e8: 910023e8     	add	x8, sp, #0x8
 46836ec: d63f0120     	blr	x9
 46836f0: f9400661     	ldr	x1, [x19, #0x8]
 46836f4: 910023e0     	add	x0, sp, #0x8
 46836f8: 97292283     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 46836fc: aa0003f4     	mov	x20, x0
 4683700: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4683704: 37f800e8     	tbnz	w8, #0x1f, 0x4683720 <_ChromeMain+0x467e484>
 4683708: 52800020     	mov	w0, #0x1                ; =1
 468370c: 34fffc14     	cbz	w20, 0x468368c <_ChromeMain+0x467e3f0>
 4683710: f9400a68     	ldr	x8, [x19, #0x10]
 4683714: 39000100     	strb	w0, [x8]
 4683718: 52800000     	mov	w0, #0x0                ; =0
 468371c: 17ffffdc     	b	0x468368c <_ChromeMain+0x467e3f0>
 4683720: f94007e0     	ldr	x0, [sp, #0x8]
 4683724: f9400fe8     	ldr	x8, [sp, #0x18]
 4683728: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 468372c: 96e615e3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4683730: 17fffff6     	b	0x4683708 <_ChromeMain+0x467e46c>
