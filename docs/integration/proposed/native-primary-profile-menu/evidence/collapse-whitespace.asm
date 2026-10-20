
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  8dfdec: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
  8dfdf0: a90157f6     	stp	x22, x21, [sp, #0x10]
  8dfdf4: a9024ff4     	stp	x20, x19, [sp, #0x20]
  8dfdf8: a9037bfd     	stp	x29, x30, [sp, #0x30]
  8dfdfc: 9100c3fd     	add	x29, sp, #0x30
  8dfe00: aa0803f3     	mov	x19, x8
  8dfe04: d2800017     	mov	x23, #0x0               ; =0
  8dfe08: a9007d1f     	stp	xzr, xzr, [x8]
  8dfe0c: f900091f     	str	xzr, [x8, #0x10]
  8dfe10: b5000101     	cbnz	x1, 0x8dfe30 <_ChromeMain+0x8dab94>
  8dfe14: 39005e77     	strb	w23, [x19, #0x17]
  8dfe18: 78377a7f     	strh	wzr, [x19, x23, lsl #1]
  8dfe1c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
  8dfe20: a9424ff4     	ldp	x20, x19, [sp, #0x20]
  8dfe24: a94157f6     	ldp	x22, x21, [sp, #0x10]
  8dfe28: a8c45ff8     	ldp	x24, x23, [sp], #0x40
  8dfe2c: d65f03c0     	ret
  8dfe30: aa0203f5     	mov	x21, x2
  8dfe34: aa0103f6     	mov	x22, x1
  8dfe38: aa0003f4     	mov	x20, x0
  8dfe3c: aa1303f7     	mov	x23, x19
  8dfe40: f1002c3f     	cmp	x1, #0xb
  8dfe44: 54000c62     	b.hs	0x8dffd0 <_ChromeMain+0x8dad34>
  8dfe48: d37ffad8     	lsl	x24, x22, #1
  8dfe4c: aa1703e0     	mov	x0, x23
  8dfe50: aa1803e1     	mov	x1, x24
  8dfe54: 95dca66f     	bl	0x8009810 <_ChromeMain+0x8004574>
  8dfe58: 39c05e68     	ldrsb	w8, [x19, #0x17]
  8dfe5c: 37f801a8     	tbnz	w8, #0x1f, 0x8dfe90 <_ChromeMain+0x8dabf4>
  8dfe60: 12001ac8     	and	w8, w22, #0x7f
  8dfe64: 39005e68     	strb	w8, [x19, #0x17]
  8dfe68: d2800008     	mov	x8, #0x0                ; =0
  8dfe6c: 78367aff     	strh	wzr, [x23, x22, lsl #1]
  8dfe70: 8b180289     	add	x9, x20, x24
  8dfe74: 520002aa     	eor	w10, w21, #0x1
  8dfe78: 52800031     	mov	w17, #0x1               ; =1
  8dfe7c: 5280040b     	mov	w11, #0x20              ; =32
  8dfe80: 5280002e     	mov	w14, #0x1               ; =1
  8dfe84: f006304c     	adrp	x12, 0xceea000 <dyld_stub_binder+0xceea000>
  8dfe88: 912bb18c     	add	x12, x12, #0xaec
  8dfe8c: 14000014     	b	0x8dfedc <_ChromeMain+0x8dac40>
  8dfe90: f9000676     	str	x22, [x19, #0x8]
  8dfe94: 17fffff5     	b	0x8dfe68 <_ChromeMain+0x8dabcc>
  8dfe98: 39405e6e     	ldrb	w14, [x19, #0x17]
  8dfe9c: 13001dd1     	sxtb	w17, w14
  8dfea0: f9400660     	ldr	x0, [x19, #0x8]
  8dfea4: 7100023f     	cmp	w17, #0x0
  8dfea8: 9a8e400e     	csel	x14, x0, x14, mi
  8dfeac: eb0e011f     	cmp	x8, x14
  8dfeb0: 54000dc8     	b.hi	0x8e0068 <_ChromeMain+0x8dadcc>
  8dfeb4: 5280000e     	mov	w14, #0x0               ; =0
  8dfeb8: f9400260     	ldr	x0, [x19]
  8dfebc: 7100023f     	cmp	w17, #0x0
  8dfec0: 9a934011     	csel	x17, x0, x19, mi
  8dfec4: 78287a30     	strh	w16, [x17, x8, lsl #1]
  8dfec8: 91000508     	add	x8, x8, #0x1
  8dfecc: 91000a94     	add	x20, x20, #0x2
  8dfed0: aa0f03f1     	mov	x17, x15
  8dfed4: eb09029f     	cmp	x20, x9
  8dfed8: 54000340     	b.eq	0x8dff40 <_ChromeMain+0x8daca4>
  8dfedc: 79400290     	ldrh	w16, [x20]
  8dfee0: aa0c03e0     	mov	x0, x12
  8dfee4: b840440d     	ldr	w13, [x0], #0x4
  8dfee8: 710001bf     	cmp	w13, #0x0
  8dfeec: 1a9f07ef     	cset	w15, ne
  8dfef0: 6b1001bf     	cmp	w13, w16
  8dfef4: 7a4019a4     	ccmp	w13, #0x0, #0x4, ne
  8dfef8: 54ffff61     	b.ne	0x8dfee4 <_ChromeMain+0x8dac48>
  8dfefc: 34fffced     	cbz	w13, 0x8dfe98 <_ChromeMain+0x8dabfc>
  8dff00: 370001b1     	tbnz	w17, #0x0, 0x8dff34 <_ChromeMain+0x8dac98>
  8dff04: 39405e60     	ldrb	w0, [x19, #0x17]
  8dff08: 13001c11     	sxtb	w17, w0
  8dff0c: f9400661     	ldr	x1, [x19, #0x8]
  8dff10: 7100023f     	cmp	w17, #0x0
  8dff14: 9a804020     	csel	x0, x1, x0, mi
  8dff18: eb00011f     	cmp	x8, x0
  8dff1c: 54000a68     	b.hi	0x8e0068 <_ChromeMain+0x8dadcc>
  8dff20: f9400260     	ldr	x0, [x19]
  8dff24: 7100023f     	cmp	w17, #0x0
  8dff28: 9a934011     	csel	x17, x0, x19, mi
  8dff2c: 78287a2b     	strh	w11, [x17, x8, lsl #1]
  8dff30: 91000508     	add	x8, x8, #0x1
  8dff34: 2a0e0151     	orr	w17, w10, w14
  8dff38: 360008d1     	tbz	w17, #0x0, 0x8e0050 <_ChromeMain+0x8dadb4>
  8dff3c: 17ffffe4     	b	0x8dfecc <_ChromeMain+0x8dac30>
  8dff40: 710001bf     	cmp	w13, #0x0
  8dff44: 1a9f07e9     	cset	w9, ne
  8dff48: 520001ca     	eor	w10, w14, #0x1
  8dff4c: 0a0a0129     	and	w9, w9, w10
  8dff50: cb090117     	sub	x23, x8, x9
  8dff54: 39805e74     	ldrsb	x20, [x19, #0x17]
  8dff58: b7f80314     	tbnz	x20, #0x3f, 0x8dffb8 <_ChromeMain+0x8dad1c>
  8dff5c: eb1402ff     	cmp	x23, x20
  8dff60: 54fff5a9     	b.ls	0x8dfe14 <_ChromeMain+0x8dab78>
  8dff64: 52800141     	mov	w1, #0xa                ; =10
  8dff68: aa1403e8     	mov	x8, x20
  8dff6c: cb1402f5     	sub	x21, x23, x20
  8dff70: cb140029     	sub	x9, x1, x20
  8dff74: eb15013f     	cmp	x9, x21
  8dff78: 54000583     	b.lo	0x8e0028 <_ChromeMain+0x8dad8c>
  8dff7c: f9400269     	ldr	x9, [x19]
  8dff80: 7219011f     	tst	w8, #0x80
  8dff84: 9a931136     	csel	x22, x9, x19, ne
  8dff88: 8b1406c0     	add	x0, x22, x20, lsl #1
  8dff8c: d37ffaa1     	lsl	x1, x21, #1
  8dff90: 95dca620     	bl	0x8009810 <_ChromeMain+0x8004574>
  8dff94: 39c05e68     	ldrsb	w8, [x19, #0x17]
  8dff98: 37f800a8     	tbnz	w8, #0x1f, 0x8dffac <_ChromeMain+0x8dad10>
  8dff9c: 12001ae8     	and	w8, w23, #0x7f
  8dffa0: 39005e68     	strb	w8, [x19, #0x17]
  8dffa4: aa1603f3     	mov	x19, x22
  8dffa8: 17ffff9c     	b	0x8dfe18 <_ChromeMain+0x8dab7c>
  8dffac: f9000677     	str	x23, [x19, #0x8]
  8dffb0: aa1603f3     	mov	x19, x22
  8dffb4: 17ffff99     	b	0x8dfe18 <_ChromeMain+0x8dab7c>
  8dffb8: f9400674     	ldr	x20, [x19, #0x8]
  8dffbc: eb1402ff     	cmp	x23, x20
  8dffc0: 540002a8     	b.hi	0x8e0014 <_ChromeMain+0x8dad78>
  8dffc4: f9000677     	str	x23, [x19, #0x8]
  8dffc8: f9400273     	ldr	x19, [x19]
  8dffcc: 17ffff93     	b	0x8dfe18 <_ChromeMain+0x8dab7c>
  8dffd0: 92800208     	mov	x8, #-0x11              ; =-17
  8dffd4: f2efffe8     	movk	x8, #0x7fff, lsl #48
  8dffd8: eb0802df     	cmp	x22, x8
  8dffdc: 54000482     	b.hs	0x8e006c <_ChromeMain+0x8dadd0>
  8dffe0: 52800288     	mov	w8, #0x14               ; =20
  8dffe4: f10052df     	cmp	x22, #0x14
  8dffe8: 9a8882c8     	csel	x8, x22, x8, hi
  8dffec: 927ded18     	and	x24, x8, #0x7ffffffffffffff8
  8dfff0: d37ffb08     	lsl	x8, x24, #1
  8dfff4: 91004100     	add	x0, x8, #0x10
  8dfff8: 97dcbcdc     	bl	0xf368 <_ChromeMain+0xa0cc>
  8dfffc: aa0003f7     	mov	x23, x0
  8e0000: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
  8e0004: cb080308     	sub	x8, x24, x8
  8e0008: a900a27f     	stp	xzr, x8, [x19, #0x8]
  8e000c: f9000260     	str	x0, [x19]
  8e0010: 17ffff8e     	b	0x8dfe48 <_ChromeMain+0x8dabac>
  8e0014: f9400a68     	ldr	x8, [x19, #0x10]
  8e0018: 9240f909     	and	x9, x8, #0x7fffffffffffffff
  8e001c: d1000521     	sub	x1, x9, #0x1
  8e0020: d378fd08     	lsr	x8, x8, #56
  8e0024: 17ffffd2     	b	0x8dff6c <_ChromeMain+0x8dacd0>
  8e0028: cb0102e2     	sub	x2, x23, x1
  8e002c: aa1303e0     	mov	x0, x19
  8e0030: aa1403e3     	mov	x3, x20
  8e0034: aa1403e4     	mov	x4, x20
  8e0038: d2800005     	mov	x5, #0x0                ; =0
  8e003c: d2800006     	mov	x6, #0x0                ; =0
  8e0040: 940d9cb3     	bl	0xc4730c <_ChromeMain+0xc42070>
  8e0044: f9000674     	str	x20, [x19, #0x8]
  8e0048: 39405e68     	ldrb	w8, [x19, #0x17]
  8e004c: 17ffffcc     	b	0x8dff7c <_ChromeMain+0x8dace0>
  8e0050: 7100361f     	cmp	w16, #0xd
  8e0054: 540000e0     	b.eq	0x8e0070 <_ChromeMain+0x8dadd4>
  8e0058: 71002a1f     	cmp	w16, #0xa
  8e005c: 540000a0     	b.eq	0x8e0070 <_ChromeMain+0x8dadd4>
  8e0060: 5280000e     	mov	w14, #0x0               ; =0
  8e0064: 17ffff9a     	b	0x8dfecc <_ChromeMain+0x8dac30>
  8e0068: d4200020     	brk	#0x1
  8e006c: 9511104f     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
  8e0070: d1000508     	sub	x8, x8, #0x1
  8e0074: 5280002e     	mov	w14, #0x1               ; =1
  8e0078: 17ffff95     	b	0x8dfecc <_ChromeMain+0x8dac30>
  8e007c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
