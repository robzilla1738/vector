
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 427c570: d102c3ff     	sub	sp, sp, #0xb0
 427c574: a9075ff8     	stp	x24, x23, [sp, #0x70]
 427c578: a90857f6     	stp	x22, x21, [sp, #0x80]
 427c57c: a9094ff4     	stp	x20, x19, [sp, #0x90]
 427c580: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 427c584: 910283fd     	add	x29, sp, #0xa0
 427c588: aa0003f3     	mov	x19, x0
 427c58c: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 427c590: f90033ff     	str	xzr, [sp, #0x60]
 427c594: 37000221     	tbnz	w1, #0x0, 0x427c5d8 <_ChromeMain+0x427733c>
 427c598: f9407268     	ldr	x8, [x19, #0xe0]
 427c59c: b40004a8     	cbz	x8, 0x427c630 <_ChromeMain+0x4277394>
 427c5a0: 39c19d09     	ldrsb	w9, [x8, #0x67]
 427c5a4: 37f800e9     	tbnz	w9, #0x1f, 0x427c5c0 <_ChromeMain+0x4277324>
 427c5a8: 34000449     	cbz	w9, 0x427c630 <_ChromeMain+0x4277394>
 427c5ac: 3dc01500     	ldr	q0, [x8, #0x50]
 427c5b0: f9403108     	ldr	x8, [x8, #0x60]
 427c5b4: f90023e8     	str	x8, [sp, #0x40]
 427c5b8: 3d800fe0     	str	q0, [sp, #0x30]
 427c5bc: 14000030     	b	0x427c67c <_ChromeMain+0x42773e0>
 427c5c0: f9402d02     	ldr	x2, [x8, #0x58]
 427c5c4: b4000362     	cbz	x2, 0x427c630 <_ChromeMain+0x4277394>
 427c5c8: f9402901     	ldr	x1, [x8, #0x50]
 427c5cc: 9100c3e0     	add	x0, sp, #0x30
 427c5d0: 96f66f12     	bl	0x18218 <_ChromeMain+0x12f7c>
 427c5d4: 1400002a     	b	0x427c67c <_ChromeMain+0x42773e0>
 427c5d8: d0046474     	adrp	x20, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427c5dc: 91106a94     	add	x20, x20, #0x41a
 427c5e0: 1400002f     	b	0x427c69c <_ChromeMain+0x4277400>
 427c5e4: a9430be1     	ldp	x1, x2, [sp, #0x30]
 427c5e8: 910143e0     	add	x0, sp, #0x50
 427c5ec: 9708b132     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 427c5f0: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 427c5f4: 36f80508     	tbz	w8, #0x1f, 0x427c694 <_ChromeMain+0x42773f8>
 427c5f8: f9401be0     	ldr	x0, [sp, #0x30]
 427c5fc: f94023e8     	ldr	x8, [sp, #0x40]
 427c600: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427c604: 96f6322d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427c608: 14000023     	b	0x427c694 <_ChromeMain+0x42773f8>
 427c60c: 927ceab7     	and	x23, x21, #0x7ffffffffffffff0
 427c610: 910042e0     	add	x0, x23, #0x10
 427c614: 96f64b55     	bl	0xf368 <_ChromeMain+0xa0cc>
 427c618: aa0003f6     	mov	x22, x0
 427c61c: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 427c620: cb0802e8     	sub	x8, x23, x8
 427c624: a901d7e0     	stp	x0, x21, [sp, #0x18]
 427c628: f90017e8     	str	x8, [sp, #0x28]
 427c62c: 14000027     	b	0x427c6c8 <_ChromeMain+0x427742c>
 427c630: 52800400     	mov	w0, #0x20               ; =32
 427c634: 96f64b4d     	bl	0xf368 <_ChromeMain+0xa0cc>
 427c638: f9001be0     	str	x0, [sp, #0x30]
 427c63c: f004e5e8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 427c640: 3dc10500     	ldr	q0, [x8, #0x410]
 427c644: 3c8383e0     	stur	q0, [sp, #0x38]
 427c648: 91007809     	add	x9, x0, #0x1e
 427c64c: eb00013f     	cmp	x9, x0
 427c650: 54000e63     	b.lo	0x427c81c <_ChromeMain+0x4277580>
 427c654: f004c528     	adrp	x8, 0xdb23000 <dyld_stub_binder+0xdb23000>
 427c658: 91131908     	add	x8, x8, #0x4c6
 427c65c: eb08013f     	cmp	x9, x8
 427c660: fa488002     	ccmp	x0, x8, #0x2, hi
 427c664: 54000dc9     	b.ls	0x427c81c <_ChromeMain+0x4277580>
 427c668: 3dc00100     	ldr	q0, [x8]
 427c66c: 3d800000     	str	q0, [x0]
 427c670: 3cc0e100     	ldur	q0, [x8, #0xe]
 427c674: 3c80e000     	stur	q0, [x0, #0xe]
 427c678: 3900781f     	strb	wzr, [x0, #0x1e]
 427c67c: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 427c680: 37fffb28     	tbnz	w8, #0x1f, 0x427c5e4 <_ChromeMain+0x4277348>
 427c684: 3dc00fe0     	ldr	q0, [sp, #0x30]
 427c688: 3d8017e0     	str	q0, [sp, #0x50]
 427c68c: f94023e8     	ldr	x8, [sp, #0x40]
 427c690: f90033e8     	str	x8, [sp, #0x60]
 427c694: d0046474     	adrp	x20, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427c698: 9110c294     	add	x20, x20, #0x430
 427c69c: aa1403e0     	mov	x0, x20
 427c6a0: 94f61b3f     	bl	0x800339c <_ChromeMain+0x7ffe100>
 427c6a4: 92800208     	mov	x8, #-0x11              ; =-17
 427c6a8: f2efffe8     	movk	x8, #0x7fff, lsl #48
 427c6ac: eb08001f     	cmp	x0, x8
 427c6b0: 54000b82     	b.hs	0x427c820 <_ChromeMain+0x4277584>
 427c6b4: aa0003f5     	mov	x21, x0
 427c6b8: f100581f     	cmp	x0, #0x16
 427c6bc: 54fffa88     	b.hi	0x427c60c <_ChromeMain+0x4277370>
 427c6c0: 3900bff5     	strb	w21, [sp, #0x2f]
 427c6c4: 910063f6     	add	x22, sp, #0x18
 427c6c8: 8b1502c8     	add	x8, x22, x21
 427c6cc: eb16011f     	cmp	x8, x22
 427c6d0: 54000a63     	b.lo	0x427c81c <_ChromeMain+0x4277580>
 427c6d4: eb08029f     	cmp	x20, x8
 427c6d8: fa563280     	ccmp	x20, x22, #0x0, lo
 427c6dc: 54000a02     	b.hs	0x427c81c <_ChromeMain+0x4277580>
 427c6e0: aa1603e0     	mov	x0, x22
 427c6e4: aa1403e1     	mov	x1, x20
 427c6e8: aa1503e2     	mov	x2, x21
 427c6ec: 94f63583     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 427c6f0: 38356adf     	strb	wzr, [x22, x21]
 427c6f4: f9402bf5     	ldr	x21, [sp, #0x50]
 427c6f8: 3cc583e1     	ldur	q1, [sp, #0x58]
 427c6fc: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 427c700: f90033ff     	str	xzr, [sp, #0x60]
 427c704: 91016274     	add	x20, x19, #0x58
 427c708: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427c70c: 37f807a8     	tbnz	w8, #0x1f, 0x427c800 <_ChromeMain+0x4277564>
 427c710: 3cc183e0     	ldur	q0, [sp, #0x18]
 427c714: 3d800280     	str	q0, [x20]
 427c718: f94017e8     	ldr	x8, [sp, #0x28]
 427c71c: f9000a88     	str	x8, [x20, #0x10]
 427c720: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 427c724: 37f80608     	tbnz	w8, #0x1f, 0x427c7e4 <_ChromeMain+0x4277548>
 427c728: f9004a75     	str	x21, [x19, #0x90]
 427c72c: 3c898261     	stur	q1, [x19, #0x98]
 427c730: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 427c734: 37f804c8     	tbnz	w8, #0x1f, 0x427c7cc <_ChromeMain+0x4277530>
 427c738: 3901e27f     	strb	wzr, [x19, #0x78]
 427c73c: 39023e7f     	strb	wzr, [x19, #0x8f]
 427c740: 3941be69     	ldrb	w9, [x19, #0x6f]
 427c744: 13001d28     	sxtb	w8, w9
 427c748: f940326a     	ldr	x10, [x19, #0x60]
 427c74c: 7100011f     	cmp	w8, #0x0
 427c750: 9a894149     	csel	x9, x10, x9, mi
 427c754: f100253f     	cmp	x9, #0x9
 427c758: 540001a1     	b.ne	0x427c78c <_ChromeMain+0x42774f0>
 427c75c: f9400289     	ldr	x9, [x20]
 427c760: 7100011f     	cmp	w8, #0x0
 427c764: 9a944128     	csel	x8, x9, x20, mi
 427c768: f9400109     	ldr	x9, [x8]
 427c76c: 39402108     	ldrb	w8, [x8, #0x8]
 427c770: 7101911f     	cmp	w8, #0x64
 427c774: d28eae68     	mov	x8, #0x7573             ; =30067
 427c778: f2ac6c68     	movk	x8, #0x6363, lsl #16
 427c77c: f2ccaca8     	movk	x8, #0x6565, lsl #32
 427c780: f2ecac88     	movk	x8, #0x6564, lsl #48
 427c784: fa480120     	ccmp	x9, x8, #0x0, eq
 427c788: 540002a0     	b.eq	0x427c7dc <_ChromeMain+0x4277540>
 427c78c: fd403a60     	ldr	d0, [x19, #0x70]
 427c790: fd003a60     	str	d0, [x19, #0x70]
 427c794: aa1303e0     	mov	x0, x19
 427c798: 97fff44b     	bl	0x42798c4 <_ChromeMain+0x4274628>
 427c79c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 427c7a0: 36f800a8     	tbz	w8, #0x1f, 0x427c7b4 <_ChromeMain+0x4277518>
 427c7a4: f9402be0     	ldr	x0, [sp, #0x50]
 427c7a8: f94033e8     	ldr	x8, [sp, #0x60]
 427c7ac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427c7b0: 96f631c2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427c7b4: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 427c7b8: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 427c7bc: a94857f6     	ldp	x22, x21, [sp, #0x80]
 427c7c0: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 427c7c4: 9102c3ff     	add	sp, sp, #0xb0
 427c7c8: d65f03c0     	ret
 427c7cc: f9403e68     	ldr	x8, [x19, #0x78]
 427c7d0: 3900011f     	strb	wzr, [x8]
 427c7d4: f900427f     	str	xzr, [x19, #0x80]
 427c7d8: 17ffffda     	b	0x427c740 <_ChromeMain+0x42774a4>
 427c7dc: 1e6e1000     	fmov	d0, #1.00000000
 427c7e0: 17ffffec     	b	0x427c790 <_ChromeMain+0x42774f4>
 427c7e4: f9404a60     	ldr	x0, [x19, #0x90]
 427c7e8: f9405268     	ldr	x8, [x19, #0xa0]
 427c7ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427c7f0: 3d8003e1     	str	q1, [sp]
 427c7f4: 96f631b1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427c7f8: 3dc003e1     	ldr	q1, [sp]
 427c7fc: 17ffffcb     	b	0x427c728 <_ChromeMain+0x427748c>
 427c800: f9402e60     	ldr	x0, [x19, #0x58]
 427c804: f9403668     	ldr	x8, [x19, #0x68]
 427c808: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427c80c: 3d8003e1     	str	q1, [sp]
 427c810: 96f631aa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427c814: 3dc003e1     	ldr	q1, [sp]
 427c818: 17ffffbe     	b	0x427c710 <_ChromeMain+0x4277474>
 427c81c: d4200020     	brk	#0x1
 427c820: 94260edb     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
