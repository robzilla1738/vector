
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2b3cee0: d10203ff     	sub	sp, sp, #0x80
 2b3cee4: a9026ffc     	stp	x28, x27, [sp, #0x20]
 2b3cee8: a90367fa     	stp	x26, x25, [sp, #0x30]
 2b3ceec: a9045ff8     	stp	x24, x23, [sp, #0x40]
 2b3cef0: a90557f6     	stp	x22, x21, [sp, #0x50]
 2b3cef4: a9064ff4     	stp	x20, x19, [sp, #0x60]
 2b3cef8: a9077bfd     	stp	x29, x30, [sp, #0x70]
 2b3cefc: 9101c3fd     	add	x29, sp, #0x70
 2b3cf00: aa0003f4     	mov	x20, x0
 2b3cf04: aa0803f3     	mov	x19, x8
 2b3cf08: a9007d1f     	stp	xzr, xzr, [x8]
 2b3cf0c: f900091f     	str	xzr, [x8, #0x10]
 2b3cf10: f9400000     	ldr	x0, [x0]
 2b3cf14: f0051de1     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 2b3cf18: 911cfc21     	add	x1, x1, #0x73f
 2b3cf1c: 528002c2     	mov	w2, #0x16               ; =22
 2b3cf20: 97651140     	bl	0x481420 <_ChromeMain+0x47c184>
 2b3cf24: aa0003f5     	mov	x21, x0
 2b3cf28: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 2b3cf2c: f9000fff     	str	xzr, [sp, #0x18]
 2b3cf30: 910023e8     	add	x8, sp, #0x8
 2b3cf34: aa1403e0     	mov	x0, x20
 2b3cf38: 94000078     	bl	0x2b3d118 <_ChromeMain+0x2b37e7c>
 2b3cf3c: a94022b4     	ldp	x20, x8, [x21]
 2b3cf40: 8b081689     	add	x9, x20, x8, lsl #5
 2b3cf44: eb09029f     	cmp	x20, x9
 2b3cf48: 54000c28     	b.hi	0x2b3d0cc <_ChromeMain+0x2b37e30>
 2b3cf4c: d37be918     	lsl	x24, x8, #5
 2b3cf50: b40006f8     	cbz	x24, 0x2b3d02c <_ChromeMain+0x2b37d90>
 2b3cf54: d2800019     	mov	x25, #0x0               ; =0
 2b3cf58: d2800015     	mov	x21, #0x0               ; =0
 2b3cf5c: 92fe001a     	mov	x26, #0xfffffffffffffff ; =1152921504606846975
 2b3cf60: 92fc001b     	mov	x27, #0x1fffffffffffffff ; =2305843009213693951
 2b3cf64: 39406288     	ldrb	w8, [x20, #0x18]
 2b3cf68: 7100111f     	cmp	w8, #0x4
 2b3cf6c: 54000bc1     	b.ne	0x2b3d0e4 <_ChromeMain+0x2b37e48>
 2b3cf70: 910023e0     	add	x0, sp, #0x8
 2b3cf74: aa1403e1     	mov	x1, x20
 2b3cf78: 94000102     	bl	0x2b3d380 <_ChromeMain+0x2b380e4>
 2b3cf7c: f9400016     	ldr	x22, [x0]
 2b3cf80: f9400a68     	ldr	x8, [x19, #0x10]
 2b3cf84: eb08033f     	cmp	x25, x8
 2b3cf88: 54000941     	b.ne	0x2b3d0b0 <_ChromeMain+0x2b37e14>
 2b3cf8c: 91000728     	add	x8, x25, #0x1
 2b3cf90: d37dfd09     	lsr	x9, x8, #61
 2b3cf94: b50008a9     	cbnz	x9, 0x2b3d0a8 <_ChromeMain+0x2b37e0c>
 2b3cf98: d37ffb29     	lsl	x9, x25, #1
 2b3cf9c: eb08013f     	cmp	x9, x8
 2b3cfa0: 9a888128     	csel	x8, x9, x8, hi
 2b3cfa4: eb1a033f     	cmp	x25, x26
 2b3cfa8: 9a9b311c     	csel	x28, x8, x27, lo
 2b3cfac: b40008dc     	cbz	x28, 0x2b3d0c4 <_ChromeMain+0x2b37e28>
 2b3cfb0: d37dff88     	lsr	x8, x28, #61
 2b3cfb4: b50007c8     	cbnz	x8, 0x2b3d0ac <_ChromeMain+0x2b37e10>
 2b3cfb8: d37df380     	lsl	x0, x28, #3
 2b3cfbc: 975348eb     	bl	0xf368 <_ChromeMain+0xa0cc>
 2b3cfc0: aa0003f5     	mov	x21, x0
 2b3cfc4: ab190ea8     	adds	x8, x21, x25, lsl #3
 2b3cfc8: 540007c0     	b.eq	0x2b3d0c0 <_ChromeMain+0x2b37e24>
 2b3cfcc: f9000116     	str	x22, [x8]
 2b3cfd0: a9402661     	ldp	x1, x9, [x19]
 2b3cfd4: cb090d16     	sub	x22, x8, x9, lsl #3
 2b3cfd8: d37df137     	lsl	x23, x9, #3
 2b3cfdc: aa1603e0     	mov	x0, x22
 2b3cfe0: aa1703e2     	mov	x2, x23
 2b3cfe4: 95533345     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 2b3cfe8: 910022e8     	add	x8, x23, #0x8
 2b3cfec: 9343fd08     	asr	x8, x8, #3
 2b3cff0: f9400260     	ldr	x0, [x19]
 2b3cff4: a9002276     	stp	x22, x8, [x19]
 2b3cff8: f9400a68     	ldr	x8, [x19, #0x10]
 2b3cffc: f9000a7c     	str	x28, [x19, #0x10]
 2b3d000: b50006c0     	cbnz	x0, 0x2b3d0d8 <_ChromeMain+0x2b37e3c>
 2b3d004: 8b190ea8     	add	x8, x21, x25, lsl #3
 2b3d008: 91002108     	add	x8, x8, #0x8
 2b3d00c: f9400275     	ldr	x21, [x19]
 2b3d010: eb150108     	subs	x8, x8, x21
 2b3d014: 9343fd19     	asr	x25, x8, #3
 2b3d018: f9000679     	str	x25, [x19, #0x8]
 2b3d01c: 54000520     	b.eq	0x2b3d0c0 <_ChromeMain+0x2b37e24>
 2b3d020: 91008294     	add	x20, x20, #0x20
 2b3d024: f1008318     	subs	x24, x24, #0x20
 2b3d028: 54fff9e1     	b.ne	0x2b3cf64 <_ChromeMain+0x2b37cc8>
 2b3d02c: f94007f3     	ldr	x19, [sp, #0x8]
 2b3d030: b4000293     	cbz	x19, 0x2b3d080 <_ChromeMain+0x2b37de4>
 2b3d034: f9400be8     	ldr	x8, [sp, #0x10]
 2b3d038: d37be909     	lsl	x9, x8, #5
 2b3d03c: b4000329     	cbz	x9, 0x2b3d0a0 <_ChromeMain+0x2b37e04>
 2b3d040: 8b130129     	add	x9, x9, x19
 2b3d044: d1008134     	sub	x20, x9, #0x20
 2b3d048: cb0817f5     	neg	x21, x8, lsl #5
 2b3d04c: b40003b4     	cbz	x20, 0x2b3d0c0 <_ChromeMain+0x2b37e24>
 2b3d050: 39c05e88     	ldrsb	w8, [x20, #0x17]
 2b3d054: 37f80588     	tbnz	w8, #0x1f, 0x2b3d104 <_ChromeMain+0x2b37e68>
 2b3d058: d1008294     	sub	x20, x20, #0x20
 2b3d05c: b10082b5     	adds	x21, x21, #0x20
 2b3d060: 54ffff61     	b.ne	0x2b3d04c <_ChromeMain+0x2b37db0>
 2b3d064: f94007e0     	ldr	x0, [sp, #0x8]
 2b3d068: cb000268     	sub	x8, x19, x0
 2b3d06c: 9345fd08     	asr	x8, x8, #5
 2b3d070: f9000be8     	str	x8, [sp, #0x10]
 2b3d074: f9400fe8     	ldr	x8, [sp, #0x18]
 2b3d078: d37be901     	lsl	x1, x8, #5
 2b3d07c: 97532f8f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2b3d080: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 2b3d084: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 2b3d088: a94557f6     	ldp	x22, x21, [sp, #0x50]
 2b3d08c: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 2b3d090: a94367fa     	ldp	x26, x25, [sp, #0x30]
 2b3d094: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 2b3d098: 910203ff     	add	sp, sp, #0x80
 2b3d09c: d65f03c0     	ret
 2b3d0a0: aa1303e0     	mov	x0, x19
 2b3d0a4: 17fffff1     	b	0x2b3d068 <_ChromeMain+0x2b37dcc>
 2b3d0a8: 97cf5b36     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 2b3d0ac: 948323dd     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 2b3d0b0: 8b190ea8     	add	x8, x21, x25, lsl #3
 2b3d0b4: b4000068     	cbz	x8, 0x2b3d0c0 <_ChromeMain+0x2b37e24>
 2b3d0b8: f9000116     	str	x22, [x8]
 2b3d0bc: 17ffffd2     	b	0x2b3d004 <_ChromeMain+0x2b37d68>
 2b3d0c0: d4200020     	brk	#0x1
 2b3d0c4: d2800015     	mov	x21, #0x0               ; =0
 2b3d0c8: 17ffffbf     	b	0x2b3cfc4 <_ChromeMain+0x2b37d28>
 2b3d0cc: d4200000     	brk	#0
 2b3d0d0: d4400000     	hlt	#0
 2b3d0d4: d4200020     	brk	#0x1
 2b3d0d8: d37df101     	lsl	x1, x8, #3
 2b3d0dc: 97532f77     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2b3d0e0: 17ffffc9     	b	0x2b3d004 <_ChromeMain+0x2b37d68>
 2b3d0e4: 7103fd1f     	cmp	w8, #0xff
 2b3d0e8: 54000081     	b.ne	0x2b3d0f8 <_ChromeMain+0x2b37e5c>
 2b3d0ec: f0056520     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 2b3d0f0: 913be000     	add	x0, x0, #0xef8
 2b3d0f4: 9483a867     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 2b3d0f8: f0056520     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 2b3d0fc: 913c6000     	add	x0, x0, #0xf18
 2b3d100: 9483a864     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 2b3d104: f9400280     	ldr	x0, [x20]
 2b3d108: f9400a88     	ldr	x8, [x20, #0x10]
 2b3d10c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2b3d110: 97532f6a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2b3d114: 17ffffd1     	b	0x2b3d058 <_ChromeMain+0x2b37dbc>
 2b3d118: d102c3ff     	sub	sp, sp, #0xb0
 2b3d11c: a9075ff8     	stp	x24, x23, [sp, #0x70]
 2b3d120: a90857f6     	stp	x22, x21, [sp, #0x80]
 2b3d124: a9094ff4     	stp	x20, x19, [sp, #0x90]
 2b3d128: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 2b3d12c: 910283fd     	add	x29, sp, #0xa0
 2b3d130: aa0803f3     	mov	x19, x8
 2b3d134: a9007d1f     	stp	xzr, xzr, [x8]
 2b3d138: f900091f     	str	xzr, [x8, #0x10]
 2b3d13c: f9400409     	ldr	x9, [x0, #0x8]
 2b3d140: f144013f     	cmp	x9, #0x100, lsl #12     ; =0x100000
 2b3d144: 54000803     	b.lo	0x2b3d244 <_ChromeMain+0x2b37fa8>
 2b3d148: f9400808     	ldr	x8, [x0, #0x10]
 2b3d14c: f27f193f     	tst	x9, #0xfe
