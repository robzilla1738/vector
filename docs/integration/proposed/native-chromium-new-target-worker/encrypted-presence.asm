
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
 42597f4: b4000200     	cbz	x0, 0x4259834 <_ChromeMain+0x4254598>
 42597f8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 42597fc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4259800: 910043fd     	add	x29, sp, #0x10
 4259804: aa0003f3     	mov	x19, x0
 4259808: 39c11c08     	ldrsb	w8, [x0, #0x47]
 425980c: 36f800a8     	tbz	w8, #0x1f, 0x4259820 <_ChromeMain+0x4254584>
 4259810: f9401a60     	ldr	x0, [x19, #0x30]
 4259814: f9402268     	ldr	x8, [x19, #0x40]
 4259818: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425981c: 96f6bda7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259820: aa1303e0     	mov	x0, x19
 4259824: 52800a01     	mov	w1, #0x50               ; =80
 4259828: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 425982c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4259830: 16f6bda2     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4259834: d65f03c0     	ret
		...
 4259840: b40001c0     	cbz	x0, 0x4259878 <_ChromeMain+0x42545dc>
 4259844: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4259848: a9017bfd     	stp	x29, x30, [sp, #0x10]
 425984c: 910043fd     	add	x29, sp, #0x10
 4259850: aa0003f3     	mov	x19, x0
 4259854: 91010000     	add	x0, x0, #0x40
 4259858: 97ffd1ff     	bl	0x424e054 <_ChromeMain+0x4248db8>
 425985c: f9401a60     	ldr	x0, [x19, #0x30]
 4259860: b50000e0     	cbnz	x0, 0x425987c <_ChromeMain+0x42545e0>
 4259864: aa1303e0     	mov	x0, x19
 4259868: 52801201     	mov	w1, #0x90               ; =144
 425986c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4259870: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4259874: 16f6bd91     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4259878: d65f03c0     	ret
 425987c: 12800008     	mov	w8, #-0x1               ; =-1
 4259880: b8e80008     	ldaddal	w8, w8, [x0]
 4259884: 7100051f     	cmp	w8, #0x1
 4259888: 54fffee1     	b.ne	0x4259864 <_ChromeMain+0x42545c8>
 425988c: 52800101     	mov	w1, #0x8                ; =8
 4259890: 96f6bd8a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259894: 17fffff4     	b	0x4259864 <_ChromeMain+0x42545c8>
 4259898: d100c3ff     	sub	sp, sp, #0x30
 425989c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 42598a0: 910083fd     	add	x29, sp, #0x20
 42598a4: aa0003e9     	mov	x9, x0
 42598a8: f940100a     	ldr	x10, [x0, #0x20]
 42598ac: b9402800     	ldr	w0, [x0, #0x28]
 42598b0: 39412122     	ldrb	w2, [x9, #0x48]
 42598b4: 390003ff     	strb	wzr, [sp]
 42598b8: 390063ff     	strb	wzr, [sp, #0x18]
 42598bc: 3941a12b     	ldrb	w11, [x9, #0x68]
 42598c0: 3400012b     	cbz	w11, 0x42598e4 <_ChromeMain+0x4254648>
 42598c4: 3dc01520     	ldr	q0, [x9, #0x50]
 42598c8: 3d8003e0     	str	q0, [sp]
 42598cc: f940312b     	ldr	x11, [x9, #0x60]
 42598d0: f9000beb     	str	x11, [sp, #0x10]
 42598d4: a905fd3f     	stp	xzr, xzr, [x9, #0x58]
 42598d8: f900293f     	str	xzr, [x9, #0x50]
 42598dc: 5280002b     	mov	w11, #0x1               ; =1
 42598e0: 390063eb     	strb	w11, [sp, #0x18]
 42598e4: 9100c121     	add	x1, x9, #0x30
 42598e8: 910003e3     	mov	x3, sp
 42598ec: d63f0140     	blr	x10
 42598f0: 394063e8     	ldrb	w8, [sp, #0x18]
 42598f4: 340000e8     	cbz	w8, 0x4259910 <_ChromeMain+0x4254674>
 42598f8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 42598fc: 36f800a8     	tbz	w8, #0x1f, 0x4259910 <_ChromeMain+0x4254674>
 4259900: f94003e0     	ldr	x0, [sp]
 4259904: f9400be8     	ldr	x8, [sp, #0x10]
 4259908: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425990c: 96f6bd6b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259910: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4259914: 9100c3ff     	add	sp, sp, #0x30
 4259918: d65f03c0     	ret
 425991c: 00000000     	udf	#0x0
 4259920: b4000300     	cbz	x0, 0x4259980 <_ChromeMain+0x42546e4>
 4259924: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4259928: a9017bfd     	stp	x29, x30, [sp, #0x10]
 425992c: 910043fd     	add	x29, sp, #0x10
 4259930: aa0003f3     	mov	x19, x0
 4259934: 3941a008     	ldrb	w8, [x0, #0x68]
 4259938: 340000e8     	cbz	w8, 0x4259954 <_ChromeMain+0x42546b8>
 425993c: 39c19e68     	ldrsb	w8, [x19, #0x67]
 4259940: 36f800a8     	tbz	w8, #0x1f, 0x4259954 <_ChromeMain+0x42546b8>
 4259944: f9402a60     	ldr	x0, [x19, #0x50]
 4259948: f9403268     	ldr	x8, [x19, #0x60]
 425994c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259950: 96f6bd5a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259954: 39c11e68     	ldrsb	w8, [x19, #0x47]
 4259958: 36f800a8     	tbz	w8, #0x1f, 0x425996c <_ChromeMain+0x42546d0>
 425995c: f9401a60     	ldr	x0, [x19, #0x30]
 4259960: f9402268     	ldr	x8, [x19, #0x40]
 4259964: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259968: 96f6bd54     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425996c: aa1303e0     	mov	x0, x19
 4259970: 52800e01     	mov	w1, #0x70               ; =112
 4259974: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4259978: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 425997c: 16f6bd4f     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4259980: d65f03c0     	ret
