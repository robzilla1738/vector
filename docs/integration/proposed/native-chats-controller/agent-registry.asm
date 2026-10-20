
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46331d4: d10143ff     	sub	sp, sp, #0x50
 46331d8: a90257f6     	stp	x22, x21, [sp, #0x20]
 46331dc: a9034ff4     	stp	x20, x19, [sp, #0x30]
 46331e0: a9047bfd     	stp	x29, x30, [sp, #0x40]
 46331e4: 910103fd     	add	x29, sp, #0x40
 46331e8: aa0003f3     	mov	x19, x0
 46331ec: f9445014     	ldr	x20, [x0, #0x8a0]
 46331f0: f0052bf5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46331f4: b4000174     	cbz	x20, 0x4633220 <_ChromeMain+0x462df84>
 46331f8: f904527f     	str	xzr, [x19, #0x8a0]
 46331fc: f9444e61     	ldr	x1, [x19, #0x898]
 4633200: 91026280     	add	x0, x20, #0x98
 4633204: 9747995d     	bl	0x1819778 <_ChromeMain+0x18144dc>
 4633208: 925e7688     	and	x8, x20, #0xfffffffc00000000
 463320c: f94046a9     	ldr	x9, [x21, #0x88]
 4633210: eb09011f     	cmp	x8, x9
 4633214: 54000061     	b.ne	0x4633220 <_ChromeMain+0x462df84>
 4633218: aa1403e0     	mov	x0, x20
 463321c: 96e7be08     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4633220: 3922427f     	strb	wzr, [x19, #0x890]
 4633224: f9422e68     	ldr	x8, [x19, #0x458]
 4633228: b4000668     	cbz	x8, 0x46332f4 <_ChromeMain+0x462e058>
 463322c: f9429d08     	ldr	x8, [x8, #0x538]
 4633230: f9403500     	ldr	x0, [x8, #0x68]
 4633234: 9741b98e     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 4633238: b40005e0     	cbz	x0, 0x46332f4 <_ChromeMain+0x462e058>
 463323c: aa0003f4     	mov	x20, x0
 4633240: 52800600     	mov	w0, #0x30               ; =48
 4633244: 96e77049     	bl	0xf368 <_ChromeMain+0xa0cc>
 4633248: f90007e0     	str	x0, [sp, #0x8]
 463324c: 9004c848     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4633250: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 4633254: 3c8103e0     	stur	q0, [sp, #0x10]
 4633258: 91008009     	add	x9, x0, #0x20
 463325c: eb00013f     	cmp	x9, x0
 4633260: 54000543     	b.lo	0x4633308 <_ChromeMain+0x462e06c>
 4633264: b00440a8     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 4633268: 91252508     	add	x8, x8, #0x949
 463326c: eb08013f     	cmp	x9, x8
 4633270: fa488002     	ccmp	x0, x8, #0x2, hi
 4633274: 540004a9     	b.ls	0x4633308 <_ChromeMain+0x462e06c>
 4633278: ad400500     	ldp	q0, q1, [x8]
 463327c: ad000400     	stp	q0, q1, [x0]
 4633280: 3900801f     	strb	wzr, [x0, #0x20]
 4633284: 910023e1     	add	x1, sp, #0x8
 4633288: aa1403e0     	mov	x0, x20
 463328c: 528003e2     	mov	w2, #0x1f               ; =31
 4633290: 976a49e3     	bl	0x20c5a1c <_ChromeMain+0x20c0780>
 4633294: f100001f     	cmp	x0, #0x0
 4633298: 1a9f07e8     	cset	w8, ne
 463329c: 39224268     	strb	w8, [x19, #0x890]
 46332a0: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 46332a4: 36f800a8     	tbz	w8, #0x1f, 0x46332b8 <_ChromeMain+0x462e01c>
 46332a8: f94007e0     	ldr	x0, [sp, #0x8]
 46332ac: f9400fe8     	ldr	x8, [sp, #0x18]
 46332b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46332b4: 96e75701     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46332b8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 46332bc: f94046a9     	ldr	x9, [x21, #0x88]
 46332c0: eb09011f     	cmp	x8, x9
 46332c4: 54000061     	b.ne	0x46332d0 <_ChromeMain+0x462e034>
 46332c8: aa1403e0     	mov	x0, x20
 46332cc: 96e7840c     	bl	0x142fc <_ChromeMain+0xf060>
 46332d0: f9445260     	ldr	x0, [x19, #0x8a0]
 46332d4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46332d8: f94046a9     	ldr	x9, [x21, #0x88]
 46332dc: eb09011f     	cmp	x8, x9
 46332e0: 54000160     	b.eq	0x463330c <_ChromeMain+0x462e070>
 46332e4: f9045274     	str	x20, [x19, #0x8a0]
 46332e8: f9444e61     	ldr	x1, [x19, #0x898]
 46332ec: 91026280     	add	x0, x20, #0x98
 46332f0: 97402a95     	bl	0x163dd44 <_ChromeMain+0x1638aa8>
 46332f4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 46332f8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 46332fc: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4633300: 910143ff     	add	sp, sp, #0x50
 4633304: d65f03c0     	ret
 4633308: d4200020     	brk	#0x1
 463330c: 96e7bdcc     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4633310: 17fffff5     	b	0x46332e4 <_ChromeMain+0x462e048>
 4633314: d503201f     	nop
 4633318: d503201f     	nop
 463331c: d503201f     	nop
 4633320: d503201f     	nop
 4633324: d503201f     	nop
 4633328: d503201f     	nop
 463332c: d503201f     	nop
 4633330: d503201f     	nop
 4633334: d503201f     	nop
 4633338: d503201f     	nop
 463333c: d503201f     	nop
 4633340: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4633344: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4633348: 910043fd     	add	x29, sp, #0x10
 463334c: aa0103f4     	mov	x20, x1
 4633350: aa0003f3     	mov	x19, x0
 4633354: 39631008     	ldrb	w8, [x0, #0x8c4]
