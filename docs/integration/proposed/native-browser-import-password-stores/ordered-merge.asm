
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425b5a4: a947ebf4     	ldp	x20, x26, [sp, #0x78]
 425b5a8: 910c83f5     	add	x21, sp, #0x320
 425b5ac: b50045fa     	cbnz	x26, 0x425be68 <_ChromeMain+0x4256bcc>
 425b5b0: 91006294     	add	x20, x20, #0x18
 425b5b4: f94037e8     	ldr	x8, [sp, #0x68]
 425b5b8: eb08029f     	cmp	x20, x8
 425b5bc: 54000e80     	b.eq	0x425b78c <_ChromeMain+0x42564f0>
 425b5c0: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 425b5c4: f9004bff     	str	xzr, [sp, #0x90]
 425b5c8: aa1403e0     	mov	x0, x20
 425b5cc: 977f239d     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 425b5d0: 35fff100     	cbnz	w0, 0x425b3f0 <_ChromeMain+0x4256154>
 425b5d4: a94823fa     	ldp	x26, x8, [sp, #0x80]
 425b5d8: 52810609     	mov	w9, #0x830              ; =2096
 425b5dc: 9b097d1b     	mul	x27, x8, x9
 425b5e0: b4fffe7b     	cbz	x27, 0x425b5ac <_ChromeMain+0x4256310>
 425b5e4: f9003ff4     	str	x20, [sp, #0x78]
 425b5e8: d2800013     	mov	x19, #0x0               ; =0
 425b5ec: 52827d08     	mov	w8, #0x13e8             ; =5096
 425b5f0: 8b080355     	add	x21, x26, x8
 425b5f4: 528210e8     	mov	w8, #0x1087             ; =4231
 425b5f8: 8b080354     	add	x20, x26, x8
 425b5fc: 14000017     	b	0x425b658 <_ChromeMain+0x42563bc>
 425b600: 8b130341     	add	x1, x26, x19
 425b604: f9403be0     	ldr	x0, [sp, #0x70]
 425b608: 94ac449c     	bl	0x6d6c878 <_ChromeMain+0x6d675dc>
 425b60c: 1400000a     	b	0x425b634 <_ChromeMain+0x4256398>
 425b610: f94077e0     	ldr	x0, [sp, #0xe8]
 425b614: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b618: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b61c: 96f6b627     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b620: 910263e0     	add	x0, sp, #0x98
 425b624: 910263e1     	add	x1, sp, #0x98
 425b628: 9106c3e2     	add	x2, sp, #0x1b0
 425b62c: 9732cbd5     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 425b630: 3707fe81     	tbnz	w1, #0x0, 0x425b600 <_ChromeMain+0x4256364>
 425b634: 39c71fe8     	ldrsb	w8, [sp, #0x1c7]
 425b638: 36f800a8     	tbz	w8, #0x1f, 0x425b64c <_ChromeMain+0x42563b0>
 425b63c: f940dbe0     	ldr	x0, [sp, #0x1b0]
 425b640: f940e3e8     	ldr	x8, [sp, #0x1c0]
 425b644: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b648: 96f6b61c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b64c: 9120c273     	add	x19, x19, #0x830
 425b650: eb13037f     	cmp	x27, x19
 425b654: 54fffa80     	b.eq	0x425b5a4 <_ChromeMain+0x4256308>
 425b658: 8b13034b     	add	x11, x26, x19
 425b65c: 8b130288     	add	x8, x20, x19
 425b660: a91b7fff     	stp	xzr, xzr, [sp, #0x1b0]
 425b664: f900e3ff     	str	xzr, [sp, #0x1c0]
 425b668: 91004169     	add	x9, x11, #0x10
 425b66c: f9800100     	prfm	pldl1keep, [x8]
 425b670: 39809d6a     	ldrsb	x10, [x11, #0x27]
 425b674: b6f8006a     	tbz	x10, #0x3f, 0x425b680 <_ChromeMain+0x42563e4>
 425b678: f9400129     	ldr	x9, [x9]
 425b67c: f9400d6a     	ldr	x10, [x11, #0x18]
 425b680: 9109810b     	add	x11, x8, #0x260
 425b684: f90193e9     	str	x9, [sp, #0x320]
 425b688: f90197ea     	str	x10, [sp, #0x328]
 425b68c: 8b130348     	add	x8, x26, x19
 425b690: 9109c100     	add	x0, x8, #0x270
 425b694: f9800160     	prfm	pldl1keep, [x11]
 425b698: 398a1d01     	ldrsb	x1, [x8, #0x287]
 425b69c: b6f80061     	tbz	x1, #0x3f, 0x425b6a8 <_ChromeMain+0x425640c>
 425b6a0: f9400000     	ldr	x0, [x0]
 425b6a4: f9413d01     	ldr	x1, [x8, #0x278]
 425b6a8: 8b1302b8     	add	x24, x21, x19
 425b6ac: d102471c     	sub	x28, x24, #0x91
 425b6b0: 9103a3e8     	add	x8, sp, #0xe8
 425b6b4: 97351d95     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 425b6b8: 3983ffe8     	ldrsb	x8, [sp, #0xff]
 425b6bc: a94eabe9     	ldp	x9, x10, [sp, #0xe8]
 425b6c0: f100011f     	cmp	x8, #0x0
 425b6c4: 9a964129     	csel	x9, x9, x22, mi
 425b6c8: 7100011f     	cmp	w8, #0x0
 425b6cc: 9a884148     	csel	x8, x10, x8, mi
 425b6d0: f9019be9     	str	x9, [sp, #0x330]
 425b6d4: f9019fe8     	str	x8, [sp, #0x338]
 425b6d8: 8b130348     	add	x8, x26, x19
 425b6dc: 910b8100     	add	x0, x8, #0x2e0
 425b6e0: f9800380     	prfm	pldl1keep, [x28]
 425b6e4: 398bdd01     	ldrsb	x1, [x8, #0x2f7]
 425b6e8: b6f80061     	tbz	x1, #0x3f, 0x425b6f4 <_ChromeMain+0x4256458>
 425b6ec: f9400000     	ldr	x0, [x0]
 425b6f0: f9417501     	ldr	x1, [x8, #0x2e8]
 425b6f4: 9102c3fc     	add	x28, sp, #0xb0
 425b6f8: 9102c3e8     	add	x8, sp, #0xb0
 425b6fc: 97351d83     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 425b700: 39831fe8     	ldrsb	x8, [sp, #0xc7]
 425b704: a94b2be9     	ldp	x9, x10, [sp, #0xb0]
 425b708: f100011f     	cmp	x8, #0x0
 425b70c: 9a9c4129     	csel	x9, x9, x28, mi
 425b710: 7100011f     	cmp	w8, #0x0
 425b714: 9a884148     	csel	x8, x10, x8, mi
 425b718: f901a3e9     	str	x9, [sp, #0x340]
 425b71c: f901a7e8     	str	x8, [sp, #0x348]
 425b720: 8b130348     	add	x8, x26, x19
 425b724: f9800300     	prfm	pldl1keep, [x24]
 425b728: 394e2108     	ldrb	w8, [x8, #0x388]
 425b72c: 7100011f     	cmp	w8, #0x0
 425b730: b004ac68     	adrp	x8, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 425b734: 9118d108     	add	x8, x8, #0x634
 425b738: 9a8812e8     	csel	x8, x23, x8, ne
 425b73c: f901abe8     	str	x8, [sp, #0x350]
 425b740: 52800028     	mov	w8, #0x1                ; =1
 425b744: f901afe8     	str	x8, [sp, #0x358]
 425b748: 9106c3e8     	add	x8, sp, #0x1b0
 425b74c: 910c83e0     	add	x0, sp, #0x320
 425b750: 52800081     	mov	w1, #0x4                ; =4
 425b754: aa1903e2     	mov	x2, x25
 425b758: 52800023     	mov	w3, #0x1                ; =1
 425b75c: 977879b3     	bl	0x2079e28 <_ChromeMain+0x2074b8c>
 425b760: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 425b764: 36f800a8     	tbz	w8, #0x1f, 0x425b778 <_ChromeMain+0x42564dc>
 425b768: f9405be0     	ldr	x0, [sp, #0xb0]
 425b76c: f94063e8     	ldr	x8, [sp, #0xc0]
 425b770: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b774: 96f6b5d1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b778: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425b77c: 36fff528     	tbz	w8, #0x1f, 0x425b620 <_ChromeMain+0x4256384>
 425b780: 17ffffa4     	b	0x425b610 <_ChromeMain+0x4256374>
 425b784: 52800013     	mov	w19, #0x0               ; =0
 425b788: 1400000f     	b	0x425b7c4 <_ChromeMain+0x4256528>
 425b78c: f94033e8     	ldr	x8, [sp, #0x60]
 425b790: f100011f     	cmp	x8, #0x0
 425b794: f9402be8     	ldr	x8, [sp, #0x50]
 425b798: fa401900     	ccmp	x8, #0x0, #0x0, ne
 425b79c: 1a9f07f3     	cset	w19, ne
 425b7a0: 39cc7fe8     	ldrsb	w8, [sp, #0x31f]
 425b7a4: 37f83328     	tbnz	w8, #0x1f, 0x425be08 <_ChromeMain+0x4256b6c>
 425b7a8: 39cc1fe8     	ldrsb	w8, [sp, #0x307]
 425b7ac: 37f83388     	tbnz	w8, #0x1f, 0x425be1c <_ChromeMain+0x4256b80>
 425b7b0: f94053e1     	ldr	x1, [sp, #0xa0]
 425b7b4: 910263e8     	add	x8, sp, #0x98
 425b7b8: f90193e8     	str	x8, [sp, #0x320]
 425b7bc: 910c83e0     	add	x0, sp, #0x320
 425b7c0: 971314bb     	bl	0x720aac <_ChromeMain+0x71b810>
 425b7c4: f85a03a8     	ldur	x8, [x29, #-0x60]
 425b7c8: b004ee69     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 425b7cc: f940f929     	ldr	x9, [x9, #0x1f0]
 425b7d0: f9400129     	ldr	x9, [x9]
 425b7d4: eb08013f     	cmp	x9, x8
