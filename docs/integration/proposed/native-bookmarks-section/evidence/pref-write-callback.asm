
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462c0a8: d10143ff     	sub	sp, sp, #0x50
 462c0ac: a9034ff4     	stp	x20, x19, [sp, #0x30]
 462c0b0: a9047bfd     	stp	x29, x30, [sp, #0x40]
 462c0b4: 910103fd     	add	x29, sp, #0x40
 462c0b8: f9422c08     	ldr	x8, [x0, #0x458]
 462c0bc: b40003e8     	cbz	x8, 0x462c138 <_ChromeMain+0x4626e9c>
 462c0c0: aa0003f3     	mov	x19, x0
 462c0c4: f9429d08     	ldr	x8, [x8, #0x538]
 462c0c8: f9403500     	ldr	x0, [x8, #0x68]
 462c0cc: b4000360     	cbz	x0, 0x462c138 <_ChromeMain+0x4626e9c>
 462c0d0: aa0103f4     	mov	x20, x1
 462c0d4: f9400008     	ldr	x8, [x0]
 462c0d8: f940a508     	ldr	x8, [x8, #0x148]
 462c0dc: d63f0100     	blr	x8
 462c0e0: f9400008     	ldr	x8, [x0]
 462c0e4: f940b508     	ldr	x8, [x8, #0x168]
 462c0e8: d63f0100     	blr	x8
 462c0ec: 390023f4     	strb	w20, [sp, #0x8]
 462c0f0: 52800028     	mov	w8, #0x1                ; =1
 462c0f4: 390083e8     	strb	w8, [sp, #0x20]
 462c0f8: d00445e1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 462c0fc: 9117b421     	add	x1, x1, #0x5ed
 462c100: 910023e3     	add	x3, sp, #0x8
 462c104: 528005c2     	mov	w2, #0x2e               ; =46
 462c108: 973b75e8     	bl	0x15098a8 <_ChromeMain+0x150460c>
 462c10c: 394083e8     	ldrb	w8, [sp, #0x20]
 462c110: 7103fd1f     	cmp	w8, #0xff
 462c114: 54000060     	b.eq	0x462c120 <_ChromeMain+0x4626e84>
 462c118: 721e791f     	tst	w8, #0xfffffffd
 462c11c: 54000241     	b.ne	0x462c164 <_ChromeMain+0x4626ec8>
 462c120: aa1303e0     	mov	x0, x19
 462c124: 52800001     	mov	w1, #0x0                ; =0
 462c128: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 462c12c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 462c130: 910143ff     	add	sp, sp, #0x50
 462c134: 170010d0     	b	0x630474 <_ChromeMain+0x62b1d8>
 462c138: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 462c13c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 462c140: 910143ff     	add	sp, sp, #0x50
 462c144: d65f03c0     	ret
 462c148: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 462c14c: 36fffea8     	tbz	w8, #0x1f, 0x462c120 <_ChromeMain+0x4626e84>
 462c150: f94007e0     	ldr	x0, [sp, #0x8]
 462c154: f9400fe8     	ldr	x8, [sp, #0x18]
 462c158: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462c15c: 96e77357     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462c160: 17fffff0     	b	0x462c120 <_ChromeMain+0x4626e84>
 462c164: 7100111f     	cmp	w8, #0x4
 462c168: 54ffff00     	b.eq	0x462c148 <_ChromeMain+0x4626eac>
 462c16c: b00514a9     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 462c170: 9121e129     	add	x9, x9, #0x878
 462c174: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 462c178: d10047a0     	sub	x0, x29, #0x11
 462c17c: 910023e1     	add	x1, sp, #0x8
 462c180: d63f0100     	blr	x8
 462c184: 17ffffe7     	b	0x462c120 <_ChromeMain+0x4626e84>
