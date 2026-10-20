
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425957c: d101c3ff     	sub	sp, sp, #0x70
 4259580: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4259584: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4259588: 910183fd     	add	x29, sp, #0x60
 425958c: aa0803f3     	mov	x19, x8
 4259590: b9402814     	ldr	w20, [x0, #0x28]
 4259594: 3dc00c00     	ldr	q0, [x0, #0x30]
 4259598: 3d8003e0     	str	q0, [sp]
 425959c: f9402008     	ldr	x8, [x0, #0x40]
 42595a0: f9000be8     	str	x8, [sp, #0x10]
 42595a4: a9037c1f     	stp	xzr, xzr, [x0, #0x30]
 42595a8: f900201f     	str	xzr, [x0, #0x40]
 42595ac: 71000a9f     	cmp	w20, #0x2
 42595b0: 540004e0     	b.eq	0x425964c <_ChromeMain+0x42543b0>
 42595b4: 39412008     	ldrb	w8, [x0, #0x48]
 42595b8: 370004a8     	tbnz	w8, #0x0, 0x425964c <_ChromeMain+0x42543b0>
 42595bc: a93dffbf     	stp	xzr, xzr, [x29, #-0x28]
 42595c0: f81e83bf     	stur	xzr, [x29, #-0x18]
 42595c4: 910083e8     	add	x8, sp, #0x20
 42595c8: aa1403e0     	mov	x0, x20
 42595cc: 94001acc     	bl	0x42600fc <_ChromeMain+0x425ae60>
 42595d0: 39805fe8     	ldrsb	x8, [sp, #0x17]
 42595d4: 910003e9     	mov	x9, sp
 42595d8: a9402fea     	ldp	x10, x11, [sp]
 42595dc: f100011f     	cmp	x8, #0x0
 42595e0: 9a894141     	csel	x1, x10, x9, mi
 42595e4: 7100011f     	cmp	w8, #0x0
 42595e8: 9a884162     	csel	x2, x11, x8, mi
 42595ec: d100a3a8     	sub	x8, x29, #0x28
 42595f0: 910083e0     	add	x0, sp, #0x20
 42595f4: 9750ff88     	bl	0x1699414 <_ChromeMain+0x1694178>
 42595f8: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 42595fc: 37f80408     	tbnz	w8, #0x1f, 0x425967c <_ChromeMain+0x42543e0>
 4259600: d100a3a0     	sub	x0, x29, #0x28
 4259604: 977b28ef     	bl	0x21239c0 <_ChromeMain+0x211e724>
 4259608: 34000100     	cbz	w0, 0x4259628 <_ChromeMain+0x425438c>
 425960c: d100a3a0     	sub	x0, x29, #0x28
 4259610: 94000020     	bl	0x4259690 <_ChromeMain+0x42543f4>
 4259614: 360000a0     	tbz	w0, #0x0, 0x4259628 <_ChromeMain+0x425438c>
 4259618: aa1303e8     	mov	x8, x19
 425961c: aa1403e0     	mov	x0, x20
 4259620: 9400456c     	bl	0x426abd0 <_ChromeMain+0x4265934>
 4259624: 14000003     	b	0x4259630 <_ChromeMain+0x4254394>
 4259628: 3900027f     	strb	wzr, [x19]
 425962c: 3900627f     	strb	wzr, [x19, #0x18]
 4259630: 38def3a8     	ldursb	w8, [x29, #-0x11]
 4259634: 36f80108     	tbz	w8, #0x1f, 0x4259654 <_ChromeMain+0x42543b8>
 4259638: f85d83a0     	ldur	x0, [x29, #-0x28]
 425963c: f85e83a8     	ldur	x8, [x29, #-0x18]
 4259640: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259644: 96f6be1d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259648: 14000003     	b	0x4259654 <_ChromeMain+0x42543b8>
 425964c: 3900027f     	strb	wzr, [x19]
 4259650: 3900627f     	strb	wzr, [x19, #0x18]
 4259654: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4259658: 36f800a8     	tbz	w8, #0x1f, 0x425966c <_ChromeMain+0x42543d0>
 425965c: f94003e0     	ldr	x0, [sp]
 4259660: f9400be8     	ldr	x8, [sp, #0x10]
 4259664: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259668: 96f6be14     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425966c: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4259670: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4259674: 9101c3ff     	add	sp, sp, #0x70
 4259678: d65f03c0     	ret
 425967c: f94013e0     	ldr	x0, [sp, #0x20]
 4259680: f9401be8     	ldr	x8, [sp, #0x30]
 4259684: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259688: 96f6be0c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425968c: 17ffffdd     	b	0x4259600 <_ChromeMain+0x4254364>
 4259690: d10283ff     	sub	sp, sp, #0xa0
 4259694: a9084ff4     	stp	x20, x19, [sp, #0x80]
 4259698: a9097bfd     	stp	x29, x30, [sp, #0x90]
 425969c: 910243fd     	add	x29, sp, #0x90
 42596a0: aa0003f3     	mov	x19, x0
 42596a4: d004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42596a8: 910afc21     	add	x1, x1, #0x2bf
 42596ac: d100a3a8     	sub	x8, x29, #0x28
 42596b0: 52800142     	mov	w2, #0xa                ; =10
 42596b4: 9750ff58     	bl	0x1699414 <_ChromeMain+0x1694178>
 42596b8: d100a3a0     	sub	x0, x29, #0x28
 42596bc: 977f2b61     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 42596c0: 37000460     	tbnz	w0, #0x0, 0x425974c <_ChromeMain+0x42544b0>
 42596c4: d004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42596c8: 910b2821     	add	x1, x1, #0x2ca
 42596cc: d10103a8     	sub	x8, x29, #0x40
 42596d0: aa1303e0     	mov	x0, x19
 42596d4: 528002c2     	mov	w2, #0x16               ; =22
 42596d8: 9750ff4f     	bl	0x1699414 <_ChromeMain+0x1694178>
 42596dc: d10103a0     	sub	x0, x29, #0x40
 42596e0: 977f2b58     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 42596e4: 37000240     	tbnz	w0, #0x0, 0x425972c <_ChromeMain+0x4254490>
 42596e8: f004c321     	adrp	x1, 0xdac0000 <dyld_stub_binder+0xdac0000>
 42596ec: 91047021     	add	x1, x1, #0x11c
 42596f0: 9100e3e8     	add	x8, sp, #0x38
 42596f4: aa1303e0     	mov	x0, x19
 42596f8: 528000e2     	mov	w2, #0x7                ; =7
 42596fc: 9750ff46     	bl	0x1699414 <_ChromeMain+0x1694178>
 4259700: 9100e3e0     	add	x0, sp, #0x38
 4259704: 977f2b4f     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 4259708: 360003c0     	tbz	w0, #0x0, 0x4259780 <_ChromeMain+0x42544e4>
 425970c: 52800033     	mov	w19, #0x1               ; =1
 4259710: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 4259714: 36f800e8     	tbz	w8, #0x1f, 0x4259730 <_ChromeMain+0x4254494>
 4259718: f9401fe0     	ldr	x0, [sp, #0x38]
 425971c: f94027e8     	ldr	x8, [sp, #0x48]
 4259720: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259724: 96f6bde5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259728: 14000002     	b	0x4259730 <_ChromeMain+0x4254494>
 425972c: 52800033     	mov	w19, #0x1               ; =1
 4259730: 38dd73a8     	ldursb	w8, [x29, #-0x29]
 4259734: 36f800e8     	tbz	w8, #0x1f, 0x4259750 <_ChromeMain+0x42544b4>
 4259738: f85c03a0     	ldur	x0, [x29, #-0x40]
 425973c: f85d03a8     	ldur	x8, [x29, #-0x30]
 4259740: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259744: 96f6bddd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259748: 14000002     	b	0x4259750 <_ChromeMain+0x42544b4>
 425974c: 52800033     	mov	w19, #0x1               ; =1
 4259750: 38def3a8     	ldursb	w8, [x29, #-0x11]
 4259754: 37f800c8     	tbnz	w8, #0x1f, 0x425976c <_ChromeMain+0x42544d0>
 4259758: aa1303e0     	mov	x0, x19
 425975c: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 4259760: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 4259764: 910283ff     	add	sp, sp, #0xa0
 4259768: d65f03c0     	ret
 425976c: f85d83a0     	ldur	x0, [x29, #-0x28]
 4259770: f85e83a8     	ldur	x8, [x29, #-0x18]
 4259774: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259778: 96f6bdd0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425977c: 17fffff7     	b	0x4259758 <_ChromeMain+0x42544bc>
 4259780: f004b341     	adrp	x1, 0xd8c4000 <dyld_stub_binder+0xd8c4000>
 4259784: 911ee821     	add	x1, x1, #0x7ba
 4259788: 910023e8     	add	x8, sp, #0x8
 425978c: aa1303e0     	mov	x0, x19
 4259790: 528000e2     	mov	w2, #0x7                ; =7
 4259794: 9750ff20     	bl	0x1699414 <_ChromeMain+0x1694178>
 4259798: f004c321     	adrp	x1, 0xdac0000 <dyld_stub_binder+0xdac0000>
 425979c: 91047021     	add	x1, x1, #0x11c
 42597a0: 910083e8     	add	x8, sp, #0x20
 42597a4: 910023e0     	add	x0, sp, #0x8
 42597a8: 528000e2     	mov	w2, #0x7                ; =7
 42597ac: 9750ff1a     	bl	0x1699414 <_ChromeMain+0x1694178>
 42597b0: 910083e0     	add	x0, sp, #0x20
 42597b4: 977f2b23     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 42597b8: aa0003f3     	mov	x19, x0
 42597bc: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 42597c0: 37f80108     	tbnz	w8, #0x1f, 0x42597e0 <_ChromeMain+0x4254544>
 42597c4: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 42597c8: 36fffa48     	tbz	w8, #0x1f, 0x4259710 <_ChromeMain+0x4254474>
 42597cc: f94007e0     	ldr	x0, [sp, #0x8]
 42597d0: f9400fe8     	ldr	x8, [sp, #0x18]
 42597d4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42597d8: 96f6bdb8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42597dc: 17ffffcd     	b	0x4259710 <_ChromeMain+0x4254474>
 42597e0: f94013e0     	ldr	x0, [sp, #0x20]
 42597e4: f9401be8     	ldr	x8, [sp, #0x30]
 42597e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42597ec: 96f6bdb3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42597f0: 17fffff5     	b	0x42597c4 <_ChromeMain+0x4254528>
