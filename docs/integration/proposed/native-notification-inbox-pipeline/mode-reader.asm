
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40fa608: b4000600     	cbz	x0, 0x40fa6c8 <_ChromeMain+0x40f542c>
 40fa60c: d102c3ff     	sub	sp, sp, #0xb0
 40fa610: a90857f6     	stp	x22, x21, [sp, #0x80]
 40fa614: a9094ff4     	stp	x20, x19, [sp, #0x90]
 40fa618: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 40fa61c: 910283fd     	add	x29, sp, #0xa0
 40fa620: aa0103f3     	mov	x19, x1
 40fa624: f9400008     	ldr	x8, [x0]
 40fa628: f940b508     	ldr	x8, [x8, #0x168]
 40fa62c: d63f0100     	blr	x8
 40fa630: f0046f61     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40fa634: 9128a021     	add	x1, x1, #0xa28
 40fa638: 52800662     	mov	w2, #0x33               ; =51
 40fa63c: 96fea733     	bl	0xa4308 <_ChromeMain+0x9f06c>
 40fa640: aa0003f4     	mov	x20, x0
 40fa644: 910023f5     	add	x21, sp, #0x8
 40fa648: 910023e8     	add	x8, sp, #0x8
 40fa64c: aa1303e0     	mov	x0, x19
 40fa650: 97288a95     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 40fa654: 910023e0     	add	x0, sp, #0x8
 40fa658: 9715c90c     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 40fa65c: 39805c08     	ldrsb	x8, [x0, #0x17]
 40fa660: a9402809     	ldp	x9, x10, [x0]
 40fa664: f100011f     	cmp	x8, #0x0
 40fa668: 9a804121     	csel	x1, x9, x0, mi
 40fa66c: 7100011f     	cmp	w8, #0x0
 40fa670: 9a884142     	csel	x2, x10, x8, mi
 40fa674: aa1403e0     	mov	x0, x20
 40fa678: 97219182     	bl	0x95ec80 <_ChromeMain+0x9599e4>
 40fa67c: aa0003f3     	mov	x19, x0
 40fa680: 9101c2a0     	add	x0, x21, #0x70
 40fa684: d2800001     	mov	x1, #0x0                ; =0
 40fa688: 96fcb58c     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40fa68c: 910082a0     	add	x0, x21, #0x20
 40fa690: 96fcb57a     	bl	0x27c78 <_ChromeMain+0x229dc>
 40fa694: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 40fa698: 36f800a8     	tbz	w8, #0x1f, 0x40fa6ac <_ChromeMain+0x40f5410>
 40fa69c: f94007e0     	ldr	x0, [sp, #0x8]
 40fa6a0: f9400fe8     	ldr	x8, [sp, #0x18]
 40fa6a4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fa6a8: 96fc3a04     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fa6ac: b20103e8     	mov	x8, #-0x7fffffff80000000 ; =-9223372034707292160
 40fa6b0: eb137d1f     	cmp	x8, x19, lsl #31
 40fa6b4: 1a9f17e0     	cset	w0, eq
 40fa6b8: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 40fa6bc: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 40fa6c0: a94857f6     	ldp	x22, x21, [sp, #0x80]
 40fa6c4: 9102c3ff     	add	sp, sp, #0xb0
 40fa6c8: d65f03c0     	ret
