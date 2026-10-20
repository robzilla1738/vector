
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 424fb60: d10383ff     	sub	sp, sp, #0xe0
 424fb64: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 424fb68: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 424fb6c: 910343fd     	add	x29, sp, #0xd0
 424fb70: b004eec8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 424fb74: f940f908     	ldr	x8, [x8, #0x1f0]
 424fb78: f9400108     	ldr	x8, [x8]
 424fb7c: f81e83a8     	stur	x8, [x29, #-0x18]
 424fb80: 36000162     	tbz	w2, #0x0, 0x424fbac <_ChromeMain+0x424a910>
 424fb84: f85e83a8     	ldur	x8, [x29, #-0x18]
 424fb88: b004eec9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 424fb8c: f940f929     	ldr	x9, [x9, #0x1f0]
 424fb90: f9400129     	ldr	x9, [x9]
 424fb94: eb08013f     	cmp	x9, x8
 424fb98: 54000a01     	b.ne	0x424fcd8 <_ChromeMain+0x424aa3c>
 424fb9c: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 424fba0: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 424fba4: 910383ff     	add	sp, sp, #0xe0
 424fba8: d65f03c0     	ret
 424fbac: aa0103f3     	mov	x19, x1
 424fbb0: f9400414     	ldr	x20, [x0, #0x8]
 424fbb4: 9004c681     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424fbb8: 91059c21     	add	x1, x1, #0x167
 424fbbc: 910123e0     	add	x0, sp, #0x48
 424fbc0: 979c88c8     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 424fbc4: 9101a3e0     	add	x0, sp, #0x68
 424fbc8: 910123e1     	add	x1, sp, #0x48
 424fbcc: 97794019     	bl	0x209fc30 <_ChromeMain+0x209a994>
 424fbd0: 910023e8     	add	x8, sp, #0x8
 424fbd4: aa1303e0     	mov	x0, x19
 424fbd8: 97ffff60     	bl	0x424f958 <_ChromeMain+0x424a6bc>
 424fbdc: 3cc083e0     	ldur	q0, [sp, #0x8]
 424fbe0: 3d800be0     	str	q0, [sp, #0x20]
 424fbe4: f9400fe8     	ldr	x8, [sp, #0x18]
 424fbe8: f9001be8     	str	x8, [sp, #0x30]
 424fbec: 52800088     	mov	w8, #0x4                ; =4
 424fbf0: 3900e3e8     	strb	w8, [sp, #0x38]
 424fbf4: d10143a8     	sub	x8, x29, #0x50
 424fbf8: a93d7fbf     	stp	xzr, xzr, [x29, #-0x30]
 424fbfc: 3cc683e0     	ldur	q0, [sp, #0x68]
 424fc00: 3c9b03a0     	stur	q0, [x29, #-0x50]
 424fc04: f9403fe9     	ldr	x9, [sp, #0x78]
 424fc08: a93c7fa9     	stp	x9, xzr, [x29, #-0x40]
 424fc0c: 91006100     	add	x0, x8, #0x18
 424fc10: 910083e1     	add	x1, sp, #0x20
 424fc14: 97794007     	bl	0x209fc30 <_ChromeMain+0x209a994>
 424fc18: f004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 424fc1c: 911e5021     	add	x1, x1, #0x794
 424fc20: d10143a3     	sub	x3, x29, #0x50
 424fc24: aa1403e0     	mov	x0, x20
 424fc28: 52800302     	mov	w2, #0x18               ; =24
 424fc2c: 52800044     	mov	w4, #0x2                ; =2
 424fc30: 949d8ac9     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 424fc34: 3940e3e8     	ldrb	w8, [sp, #0x38]
 424fc38: d0053393     	adrp	x19, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 424fc3c: 9121e273     	add	x19, x19, #0x878
 424fc40: 7103fd1f     	cmp	w8, #0xff
 424fc44: 54000060     	b.eq	0x424fc50 <_ChromeMain+0x424a9b4>
 424fc48: 721e791f     	tst	w8, #0xfffffffd
 424fc4c: 540001a1     	b.ne	0x424fc80 <_ChromeMain+0x424a9e4>
 424fc50: 394183e8     	ldrb	w8, [sp, #0x60]
 424fc54: 7103fd1f     	cmp	w8, #0xff
 424fc58: 54fff960     	b.eq	0x424fb84 <_ChromeMain+0x424a8e8>
 424fc5c: 721e791f     	tst	w8, #0xfffffffd
 424fc60: 54fff920     	b.eq	0x424fb84 <_ChromeMain+0x424a8e8>
 424fc64: 7100111f     	cmp	w8, #0x4
 424fc68: 54000200     	b.eq	0x424fca8 <_ChromeMain+0x424aa0c>
 424fc6c: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 424fc70: d10143a0     	sub	x0, x29, #0x50
 424fc74: 910123e1     	add	x1, sp, #0x48
 424fc78: d63f0100     	blr	x8
 424fc7c: 17ffffc2     	b	0x424fb84 <_ChromeMain+0x424a8e8>
 424fc80: 7100111f     	cmp	w8, #0x4
 424fc84: 540000c0     	b.eq	0x424fc9c <_ChromeMain+0x424aa00>
 424fc88: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 424fc8c: d10143a0     	sub	x0, x29, #0x50
 424fc90: 910083e1     	add	x1, sp, #0x20
 424fc94: d63f0100     	blr	x8
 424fc98: 17ffffee     	b	0x424fc50 <_ChromeMain+0x424a9b4>
 424fc9c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 424fca0: 36fffd88     	tbz	w8, #0x1f, 0x424fc50 <_ChromeMain+0x424a9b4>
 424fca4: 14000008     	b	0x424fcc4 <_ChromeMain+0x424aa28>
 424fca8: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 424fcac: 36fff6c8     	tbz	w8, #0x1f, 0x424fb84 <_ChromeMain+0x424a8e8>
 424fcb0: f94027e0     	ldr	x0, [sp, #0x48]
 424fcb4: f9402fe8     	ldr	x8, [sp, #0x58]
 424fcb8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 424fcbc: 96f6e47f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424fcc0: 17ffffb1     	b	0x424fb84 <_ChromeMain+0x424a8e8>
 424fcc4: f94013e0     	ldr	x0, [sp, #0x20]
 424fcc8: f9401be8     	ldr	x8, [sp, #0x30]
 424fccc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 424fcd0: 96f6e47a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424fcd4: 17ffffdf     	b	0x424fc50 <_ChromeMain+0x424a9b4>
 424fcd8: 94f6d1a2     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
		...
 424fd00: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 424fd04: a9017bfd     	stp	x29, x30, [sp, #0x10]
 424fd08: 910043fd     	add	x29, sp, #0x10
 424fd0c: aa0103f3     	mov	x19, x1
 424fd10: 52800800     	mov	w0, #0x40               ; =64
 424fd14: 96f6fd95     	bl	0xf368 <_ChromeMain+0xa0cc>
 424fd18: aa1303e1     	mov	x1, x19
 424fd1c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 424fd20: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 424fd24: 17fff8e7     	b	0x424e0c0 <_ChromeMain+0x4248e24>
 424fd28: f9401003     	ldr	x3, [x0, #0x20]
 424fd2c: f9400048     	ldr	x8, [x2]
 424fd30: f900005f     	str	xzr, [x2]
 424fd34: 9100a000     	add	x0, x0, #0x28
 424fd38: aa0803e2     	mov	x2, x8
 424fd3c: d61f0060     	br	x3
 424fd40: d102c3ff     	sub	sp, sp, #0xb0
 424fd44: a9075ff8     	stp	x24, x23, [sp, #0x70]
 424fd48: a90857f6     	stp	x22, x21, [sp, #0x80]
 424fd4c: a9094ff4     	stp	x20, x19, [sp, #0x90]
 424fd50: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 424fd54: 910283fd     	add	x29, sp, #0xa0
 424fd58: aa0103f3     	mov	x19, x1
 424fd5c: aa0003e1     	mov	x1, x0
 424fd60: 90050428     	adrp	x8, 0xe2d3000 <dyld_stub_binder+0xe2d3000>
 424fd64: 91116108     	add	x8, x8, #0x458
 424fd68: f9000fe8     	str	x8, [sp, #0x18]
 424fd6c: 6f00e400     	movi.2d	v0, #0000000000000000
 424fd70: ad0103e0     	stp	q0, q0, [sp, #0x20]
 424fd74: 3c8403e0     	stur	q0, [sp, #0x40]
 424fd78: 910063e0     	add	x0, sp, #0x18
 424fd7c: 977b20f9     	bl	0x2118160 <_ChromeMain+0x2112ec4>
 424fd80: 35000160     	cbnz	w0, 0x424fdac <_ChromeMain+0x424ab10>
 424fd84: d2800015     	mov	x21, #0x0               ; =0
 424fd88: 910063e0     	add	x0, sp, #0x18
 424fd8c: 952bc9ee     	bl	0x8d42544 <_ChromeMain+0x8d3d2a8>
 424fd90: aa1503e0     	mov	x0, x21
 424fd94: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 424fd98: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 424fd9c: a94857f6     	ldp	x22, x21, [sp, #0x80]
 424fda0: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 424fda4: 9102c3ff     	add	sp, sp, #0xb0
 424fda8: d65f03c0     	ret
 424fdac: a9007fff     	stp	xzr, xzr, [sp]
 424fdb0: f9000bff     	str	xzr, [sp, #0x10]
 424fdb4: 910003e8     	mov	x8, sp
 424fdb8: 910063e0     	add	x0, sp, #0x18
 424fdbc: 12003e61     	and	w1, w19, #0xffff
 424fdc0: 97419376     	bl	0x12b4b98 <_ChromeMain+0x12af8fc>
 424fdc4: d2800015     	mov	x21, #0x0               ; =0
 424fdc8: 394043e8     	ldrb	w8, [sp, #0x10]
 424fdcc: 34fffde8     	cbz	w8, 0x424fd88 <_ChromeMain+0x424aaec>
 424fdd0: a9404ff5     	ldp	x21, x19, [sp]
 424fdd4: b81c83bf     	stur	wzr, [x29, #-0x38]
 424fdd8: 381cc3bf     	sturb	wzr, [x29, #-0x34]
 424fddc: 781ce3bf     	sturh	wzr, [x29, #-0x32]
 424fde0: d100e3a0     	sub	x0, x29, #0x38
 424fde4: 910143e3     	add	x3, sp, #0x50
 424fde8: aa1503e1     	mov	x1, x21
 424fdec: aa1303e2     	mov	x2, x19
 424fdf0: 975ba377     	bl	0x1938bcc <_ChromeMain+0x1933930>
 424fdf4: 7100041f     	cmp	w0, #0x1
 424fdf8: 540001c0     	b.eq	0x424fe30 <_ChromeMain+0x424ab94>
 424fdfc: f1002276     	subs	x22, x19, #0x8
