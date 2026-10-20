
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 452a8f4: d10583ff     	sub	sp, sp, #0x160
 452a8f8: a9106ffc     	stp	x28, x27, [sp, #0x100]
 452a8fc: a91167fa     	stp	x26, x25, [sp, #0x110]
 452a900: a9125ff8     	stp	x24, x23, [sp, #0x120]
 452a904: a91357f6     	stp	x22, x21, [sp, #0x130]
 452a908: a9144ff4     	stp	x20, x19, [sp, #0x140]
 452a90c: a9157bfd     	stp	x29, x30, [sp, #0x150]
 452a910: 910543fd     	add	x29, sp, #0x150
 452a914: aa0303f5     	mov	x21, x3
 452a918: aa0203f6     	mov	x22, x2
 452a91c: aa0103f8     	mov	x24, x1
 452a920: aa0003f7     	mov	x23, x0
 452a924: aa0803f3     	mov	x19, x8
 452a928: 39403448     	ldrb	w8, [x2, #0xd]
 452a92c: 34000168     	cbz	w8, 0x452a958 <_ChromeMain+0x45256bc>
 452a930: 394212c8     	ldrb	w8, [x22, #0x84]
 452a934: 34000128     	cbz	w8, 0x452a958 <_ChromeMain+0x45256bc>
 452a938: b004c920     	adrp	x0, 0xde4f000 <dyld_stub_binder+0xde4f000>
 452a93c: 913f9c00     	add	x0, x0, #0xfe7
 452a940: 52800061     	mov	w1, #0x3                ; =3
 452a944: 52800162     	mov	w2, #0xb                ; =11
 452a948: 970fcaf6     	bl	0x91d520 <_ChromeMain+0x918284>
 452a94c: b004c921     	adrp	x1, 0xde4f000 <dyld_stub_binder+0xde4f000>
 452a950: 912e2421     	add	x1, x1, #0xb89
 452a954: 1400000e     	b	0x452a98c <_ChromeMain+0x45256f0>
 452a958: 3941a2c8     	ldrb	w8, [x22, #0x68]
 452a95c: 34000868     	cbz	w8, 0x452aa68 <_ChromeMain+0x45257cc>
 452a960: f94046c8     	ldr	x8, [x22, #0x88]
 452a964: b4000068     	cbz	x8, 0x452a970 <_ChromeMain+0x45256d4>
 452a968: b9400508     	ldr	w8, [x8, #0x4]
 452a96c: 350007e8     	cbnz	w8, 0x452aa68 <_ChromeMain+0x45257cc>
 452a970: b004c920     	adrp	x0, 0xde4f000 <dyld_stub_binder+0xde4f000>
 452a974: 913f9c00     	add	x0, x0, #0xfe7
 452a978: 52800081     	mov	w1, #0x4                ; =4
 452a97c: 52800162     	mov	w2, #0xb                ; =11
 452a980: 970fcae8     	bl	0x91d520 <_ChromeMain+0x918284>
 452a984: b004c921     	adrp	x1, 0xde4f000 <dyld_stub_binder+0xde4f000>
 452a988: 912f0c21     	add	x1, x1, #0xbc3
 452a98c: aa1503e0     	mov	x0, x21
 452a990: 95adeb9b     	bl	0xb0a57fc <_ChromeMain+0xb0a0560>
 452a994: f900027f     	str	xzr, [x19]
 452a998: a9557bfd     	ldp	x29, x30, [sp, #0x150]
 452a99c: a9544ff4     	ldp	x20, x19, [sp, #0x140]
 452a9a0: a95357f6     	ldp	x22, x21, [sp, #0x130]
 452a9a4: a9525ff8     	ldp	x24, x23, [sp, #0x120]
 452a9a8: a95167fa     	ldp	x26, x25, [sp, #0x110]
 452a9ac: a9506ffc     	ldp	x28, x27, [sp, #0x100]
 452a9b0: 910583ff     	add	sp, sp, #0x160
 452a9b4: d65f03c0     	ret
 452a9b8: b9400808     	ldr	w8, [x0, #0x8]
 452a9bc: 37080c48     	tbnz	w8, #0x1, 0x452ab44 <_ChromeMain+0x45258a8>
 452a9c0: b9400008     	ldr	w8, [x0]
 452a9c4: 71000509     	subs	w9, w8, #0x1
 452a9c8: 54005ce0     	b.eq	0x452b564 <_ChromeMain+0x45262c8>
 452a9cc: aa0803ea     	mov	x10, x8
 452a9d0: 88aafc09     	casl	w10, w9, [x0]
 452a9d4: 6b08015f     	cmp	w10, w8
 452a9d8: aa0a03e8     	mov	x8, x10
 452a9dc: 54ffff41     	b.ne	0x452a9c4 <_ChromeMain+0x4525728>
 452a9e0: 14000059     	b	0x452ab44 <_ChromeMain+0x45258a8>
 452a9e4: b9400808     	ldr	w8, [x0, #0x8]
 452a9e8: 37080988     	tbnz	w8, #0x1, 0x452ab18 <_ChromeMain+0x452587c>
 452a9ec: b9400008     	ldr	w8, [x0]
 452a9f0: 71000509     	subs	w9, w8, #0x1
 452a9f4: 54005b40     	b.eq	0x452b55c <_ChromeMain+0x45262c0>
 452a9f8: aa0803ea     	mov	x10, x8
 452a9fc: 88aafc09     	casl	w10, w9, [x0]
 452aa00: 6b08015f     	cmp	w10, w8
 452aa04: aa0a03e8     	mov	x8, x10
 452aa08: 54ffff41     	b.ne	0x452a9f0 <_ChromeMain+0x4525754>
 452aa0c: 14000043     	b	0x452ab18 <_ChromeMain+0x452587c>
 452aa10: b9400808     	ldr	w8, [x0, #0x8]
 452aa14: 370806c8     	tbnz	w8, #0x1, 0x452aaec <_ChromeMain+0x4525850>
 452aa18: b9400008     	ldr	w8, [x0]
 452aa1c: 71000509     	subs	w9, w8, #0x1
 452aa20: 540059a0     	b.eq	0x452b554 <_ChromeMain+0x45262b8>
 452aa24: aa0803ea     	mov	x10, x8
 452aa28: 88aafc09     	casl	w10, w9, [x0]
 452aa2c: 6b08015f     	cmp	w10, w8
 452aa30: aa0a03e8     	mov	x8, x10
 452aa34: 54ffff41     	b.ne	0x452aa1c <_ChromeMain+0x4525780>
 452aa38: 1400002d     	b	0x452aaec <_ChromeMain+0x4525850>
 452aa3c: b9400808     	ldr	w8, [x0, #0x8]
 452aa40: 37080328     	tbnz	w8, #0x1, 0x452aaa4 <_ChromeMain+0x4525808>
 452aa44: b9400008     	ldr	w8, [x0]
 452aa48: 71000509     	subs	w9, w8, #0x1
 452aa4c: 54005800     	b.eq	0x452b54c <_ChromeMain+0x45262b0>
 452aa50: aa0803ea     	mov	x10, x8
 452aa54: 88aafc09     	casl	w10, w9, [x0]
 452aa58: 6b08015f     	cmp	w10, w8
 452aa5c: aa0a03e8     	mov	x8, x10
 452aa60: 54ffff41     	b.ne	0x452aa48 <_ChromeMain+0x45257ac>
 452aa64: 14000010     	b	0x452aaa4 <_ChromeMain+0x4525808>
 452aa68: 52803e00     	mov	w0, #0x1f0              ; =496
 452aa6c: 96eb923f     	bl	0xf368 <_ChromeMain+0xa0cc>
 452aa70: aa0003f4     	mov	x20, x0
 452aa74: 94a74fd7     	bl	0x6efe9d0 <_ChromeMain+0x6ef9734>
 452aa78: f9400308     	ldr	x8, [x24]
 452aa7c: b40000e8     	cbz	x8, 0x452aa98 <_ChromeMain+0x45257fc>
 452aa80: b9400909     	ldr	w9, [x8, #0x8]
 452aa84: 370800a9     	tbnz	w9, #0x1, 0x452aa98 <_ChromeMain+0x45257fc>
 452aa88: 52800029     	mov	w9, #0x1                ; =1
 452aa8c: b8290109     	ldadd	w9, w9, [x8]
 452aa90: 3100053f     	cmn	w9, #0x1
 452aa94: 54005ec0     	b.eq	0x452b66c <_ChromeMain+0x45263d0>
 452aa98: f9400280     	ldr	x0, [x20]
 452aa9c: f9000288     	str	x8, [x20]
 452aaa0: b5fffce0     	cbnz	x0, 0x452aa3c <_ChromeMain+0x45257a0>
 452aaa4: f94022c8     	ldr	x8, [x22, #0x40]
 452aaa8: f1000d1f     	cmp	x8, #0x3
 452aaac: 54005ca2     	b.hs	0x452b640 <_ChromeMain+0x45263a4>
 452aab0: 900488c9     	adrp	x9, 0xd642000 <dyld_stub_binder+0xd642000>
 452aab4: 911a7129     	add	x9, x9, #0x69c
 452aab8: 38686928     	ldrb	w8, [x9, x8]
 452aabc: b9000a88     	str	w8, [x20, #0x8]
 452aac0: f94032c8     	ldr	x8, [x22, #0x60]
 452aac4: b40000e8     	cbz	x8, 0x452aae0 <_ChromeMain+0x4525844>
 452aac8: b9400909     	ldr	w9, [x8, #0x8]
 452aacc: 370800a9     	tbnz	w9, #0x1, 0x452aae0 <_ChromeMain+0x4525844>
 452aad0: 52800029     	mov	w9, #0x1                ; =1
 452aad4: b8290109     	ldadd	w9, w9, [x8]
 452aad8: 3100053f     	cmn	w9, #0x1
 452aadc: 54005ce0     	b.eq	0x452b678 <_ChromeMain+0x45263dc>
 452aae0: f9400a80     	ldr	x0, [x20, #0x10]
 452aae4: f9000a88     	str	x8, [x20, #0x10]
 452aae8: b5fff940     	cbnz	x0, 0x452aa10 <_ChromeMain+0x4525774>
 452aaec: f94016c8     	ldr	x8, [x22, #0x28]
 452aaf0: b40000e8     	cbz	x8, 0x452ab0c <_ChromeMain+0x4525870>
 452aaf4: b9400909     	ldr	w9, [x8, #0x8]
 452aaf8: 370800a9     	tbnz	w9, #0x1, 0x452ab0c <_ChromeMain+0x4525870>
 452aafc: 52800029     	mov	w9, #0x1                ; =1
 452ab00: b8290109     	ldadd	w9, w9, [x8]
 452ab04: 3100053f     	cmn	w9, #0x1
 452ab08: 54005be0     	b.eq	0x452b684 <_ChromeMain+0x45263e8>
 452ab0c: f9400e80     	ldr	x0, [x20, #0x18]
 452ab10: f9000e88     	str	x8, [x20, #0x18]
 452ab14: b5fff680     	cbnz	x0, 0x452a9e4 <_ChromeMain+0x4525748>
 452ab18: f94046c8     	ldr	x8, [x22, #0x88]
 452ab1c: b40000e8     	cbz	x8, 0x452ab38 <_ChromeMain+0x452589c>
 452ab20: b9400909     	ldr	w9, [x8, #0x8]
 452ab24: 370800a9     	tbnz	w9, #0x1, 0x452ab38 <_ChromeMain+0x452589c>
 452ab28: 52800029     	mov	w9, #0x1                ; =1
 452ab2c: b8290109     	ldadd	w9, w9, [x8]
 452ab30: 3100053f     	cmn	w9, #0x1
 452ab34: 54005360     	b.eq	0x452b5a0 <_ChromeMain+0x4526304>
 452ab38: f9401280     	ldr	x0, [x20, #0x20]
 452ab3c: f9001288     	str	x8, [x20, #0x20]
 452ab40: b5fff3c0     	cbnz	x0, 0x452a9b8 <_ChromeMain+0x452571c>
 452ab44: 39402ac8     	ldrb	w8, [x22, #0xa]
 452ab48: 340001c8     	cbz	w8, 0x452ab80 <_ChromeMain+0x45258e4>
 452ab4c: aa1603e1     	mov	x1, x22
 452ab50: f8458c28     	ldr	x8, [x1, #0x58]!
 452ab54: b4000168     	cbz	x8, 0x452ab80 <_ChromeMain+0x45258e4>
 452ab58: b9400508     	ldr	w8, [x8, #0x4]
 452ab5c: 34000128     	cbz	w8, 0x452ab80 <_ChromeMain+0x45258e4>
 452ab60: 910123e8     	add	x8, sp, #0x48
 452ab64: aa1703e0     	mov	x0, x23
 452ab68: 95e61d4c     	bl	0xbeb2098 <_ChromeMain+0xbeacdfc>
 452ab6c: 9100a280     	add	x0, x20, #0x28
 452ab70: 910123e1     	add	x1, sp, #0x48
 452ab74: 970119c7     	bl	0x571290 <_ChromeMain+0x56bff4>
 452ab78: 910123e0     	add	x0, sp, #0x48
 452ab7c: 96ebd271     	bl	0x1f540 <_ChromeMain+0x1a2a4>
 452ab80: 394026c8     	ldrb	w8, [x22, #0x9]
 452ab84: 340001c8     	cbz	w8, 0x452abbc <_ChromeMain+0x4525920>
 452ab88: aa1603e1     	mov	x1, x22
 452ab8c: f8450c28     	ldr	x8, [x1, #0x50]!
 452ab90: b4000168     	cbz	x8, 0x452abbc <_ChromeMain+0x4525920>
 452ab94: b9400508     	ldr	w8, [x8, #0x4]
 452ab98: 34000128     	cbz	w8, 0x452abbc <_ChromeMain+0x4525920>
 452ab9c: 910123e8     	add	x8, sp, #0x48
 452aba0: aa1703e0     	mov	x0, x23
 452aba4: 95e61d3d     	bl	0xbeb2098 <_ChromeMain+0xbeacdfc>
 452aba8: 91026280     	add	x0, x20, #0x98
 452abac: 910123e1     	add	x1, sp, #0x48
 452abb0: 970119b8     	bl	0x571290 <_ChromeMain+0x56bff4>
 452abb4: 910123e0     	add	x0, sp, #0x48
 452abb8: 96ebd262     	bl	0x1f540 <_ChromeMain+0x1a2a4>
 452abbc: 394022c8     	ldrb	w8, [x22, #0x8]
 452abc0: 340001c8     	cbz	w8, 0x452abf8 <_ChromeMain+0x452595c>
 452abc4: aa1603e1     	mov	x1, x22
 452abc8: f8420c28     	ldr	x8, [x1, #0x20]!
 452abcc: b4000168     	cbz	x8, 0x452abf8 <_ChromeMain+0x452595c>
 452abd0: b9400508     	ldr	w8, [x8, #0x4]
 452abd4: 34000128     	cbz	w8, 0x452abf8 <_ChromeMain+0x452595c>
 452abd8: 910123e8     	add	x8, sp, #0x48
 452abdc: aa1703e0     	mov	x0, x23
 452abe0: 95e61d2e     	bl	0xbeb2098 <_ChromeMain+0xbeacdfc>
 452abe4: 91042280     	add	x0, x20, #0x108
 452abe8: 910123e1     	add	x1, sp, #0x48
 452abec: 970119a9     	bl	0x571290 <_ChromeMain+0x56bff4>
 452abf0: 910123e0     	add	x0, sp, #0x48
 452abf4: 96ebd253     	bl	0x1f540 <_ChromeMain+0x1a2a4>
 452abf8: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 452abfc: 394036c8     	ldrb	w8, [x22, #0xd]
 452ac00: 34000188     	cbz	w8, 0x452ac30 <_ChromeMain+0x4525994>
 452ac04: b9809ac8     	ldrsw	x8, [x22, #0x98]
 452ac08: 900533e9     	adrp	x9, 0xeba6000 <dyld_stub_binder+0xeba6000>
 452ac0c: f944e129     	ldr	x9, [x9, #0x9c0]
 452ac10: 8a080d20     	and	x0, x9, x8, lsl #3
 452ac14: 910123e8     	add	x8, sp, #0x48
 452ac18: 95e63206     	bl	0xbeb7430 <_ChromeMain+0xbeb2194>
 452ac1c: 9100e3e0     	add	x0, sp, #0x38
 452ac20: 910123e1     	add	x1, sp, #0x48
 452ac24: 94a82dbf     	bl	0x6f36320 <_ChromeMain+0x6f31084>
 452ac28: f94027e1     	ldr	x1, [sp, #0x48]
 452ac2c: b5004de1     	cbnz	x1, 0x452b5e8 <_ChromeMain+0x452634c>
 452ac30: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 452ac34: 9105e280     	add	x0, x20, #0x178
 452ac38: 910123e1     	add	x1, sp, #0x48
 452ac3c: 95e61d34     	bl	0xbeb210c <_ChromeMain+0xbeace70>
 452ac40: f94027e1     	ldr	x1, [sp, #0x48]
 452ac44: b5004b41     	cbnz	x1, 0x452b5ac <_ChromeMain+0x4526310>
 452ac48: 39462288     	ldrb	w8, [x20, #0x188]
 452ac4c: 36004ae8     	tbz	w8, #0x0, 0x452b5a8 <_ChromeMain+0x452630c>
 452ac50: f9401fe1     	ldr	x1, [sp, #0x38]
 452ac54: b94047e2     	ldr	w2, [sp, #0x44]
 452ac58: 9105e280     	add	x0, x20, #0x178
 452ac5c: 95e61d74     	bl	0xbeb222c <_ChromeMain+0xbeacf90>
 452ac60: 394032c8     	ldrb	w8, [x22, #0xc]
 452ac64: 35000908     	cbnz	w8, 0x452ad84 <_ChromeMain+0x4525ae8>
 452ac68: f0053428     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 452ac6c: f9468508     	ldr	x8, [x8, #0xd08]
 452ac70: b0ffed29     	adrp	x9, 0x42cf000 <_ChromeMain+0x42c9d64>
 452ac74: 9138c129     	add	x9, x9, #0xe30
 452ac78: eb09011f     	cmp	x8, x9
 452ac7c: 54004601     	b.ne	0x452b53c <_ChromeMain+0x45262a0>
 452ac80: 94ec1b44     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 452ac84: 1e602008     	fcmp	d0, #0.0
 452ac88: 54004ee0     	b.eq	0x452b664 <_ChromeMain+0x45263c8>
 452ac8c: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 452ac90: 9e670101     	fmov	d1, x8
 452ac94: 1e612000     	fcmp	d0, d1
 452ac98: 540007a0     	b.eq	0x452ad8c <_ChromeMain+0x4525af0>
 452ac9c: d004d7e8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 452aca0: f9444908     	ldr	x8, [x8, #0x890]
 452aca4: fd400101     	ldr	d1, [x8]
 452aca8: 1e612800     	fadd	d0, d0, d1
 452acac: b004d108     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 452acb0: fd45ad01     	ldr	d1, [x8, #0xb58]
 452acb4: 1e610800     	fmul	d0, d0, d1
 452acb8: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 452acbc: 9e670101     	fmov	d1, x8
 452acc0: 1e612000     	fcmp	d0, d1
 452acc4: 92f00008     	mov	x8, #0x7fffffffffffffff ; =9223372036854775807
 452acc8: 9a88b3e9     	csel	x9, xzr, x8, lt
 452accc: 1e616801     	fmaxnm	d1, d0, d1
 452acd0: 9e78002a     	fcvtzs	x10, d1
 452acd4: 92f7840b     	mov	x11, #0x43dfffffffffffff ; =4890909195324358655
 452acd8: 9e670161     	fmov	d1, x11
 452acdc: 1e612000     	fcmp	d0, d1
 452ace0: 9a899140     	csel	x0, x10, x9, ls
 452ace4: b24107e9     	mov	x9, #-0x7fffffffffffffff ; =-9223372036854775807
 452ace8: 8b090009     	add	x9, x0, x9
 452acec: f100093f     	cmp	x9, #0x2
 452acf0: 54000123     	b.lo	0x452ad14 <_ChromeMain+0x4525a78>
 452acf4: d2880009     	mov	x9, #0x4000             ; =16384
 452acf8: f2a910c9     	movk	x9, #0x4886, lsl #16
 452acfc: f2cbd2c9     	movk	x9, #0x5e96, lsl #32
 452ad00: f2e00529     	movk	x9, #0x29, lsl #48
 452ad04: ab090009     	adds	x9, x0, x9
 452ad08: 9a896100     	csel	x0, x8, x9, vs
 452ad0c: 6f00e401     	movi.2d	v1, #0000000000000000
 452ad10: b40003e0     	cbz	x0, 0x452ad8c <_ChromeMain+0x4525af0>
 452ad14: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 452ad18: 8b080008     	add	x8, x0, x8
 452ad1c: f100091f     	cmp	x8, #0x2
 452ad20: 54000243     	b.lo	0x452ad68 <_ChromeMain+0x4525acc>
 452ad24: d2980008     	mov	x8, #0xc000             ; =49152
 452ad28: f2b6ef28     	movk	x8, #0xb779, lsl #16
 452ad2c: f2d42d28     	movk	x8, #0xa169, lsl #32
 452ad30: f2fffac8     	movk	x8, #0xffd6, lsl #48
 452ad34: ab080008     	adds	x8, x0, x8
 452ad38: d2f00009     	mov	x9, #-0x8000000000000000 ; =-9223372036854775808
 452ad3c: 9a886128     	csel	x8, x9, x8, vs
 452ad40: eb09011f     	cmp	x8, x9
 452ad44: 540000c0     	b.eq	0x452ad5c <_ChromeMain+0x4525ac0>
 452ad48: 9e620100     	scvtf	d0, x8
 452ad4c: b004d108     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 452ad50: fd462501     	ldr	d1, [x8, #0xc48]
 452ad54: 1e611801     	fdiv	d1, d0, d1
 452ad58: 1400000d     	b	0x452ad8c <_ChromeMain+0x4525af0>
 452ad5c: d2fffe08     	mov	x8, #-0x10000000000000  ; =-4503599627370496
 452ad60: 9e670101     	fmov	d1, x8
 452ad64: 1400000a     	b	0x452ad8c <_ChromeMain+0x4525af0>
 452ad68: f100001f     	cmp	x0, #0x0
 452ad6c: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 452ad70: 9e670100     	fmov	d0, x8
 452ad74: d2fffe08     	mov	x8, #-0x10000000000000  ; =-4503599627370496
 452ad78: 9e670101     	fmov	d1, x8
 452ad7c: 1e604c21     	fcsel	d1, d1, d0, mi
 452ad80: 14000003     	b	0x452ad8c <_ChromeMain+0x4525af0>
 452ad84: fd404ac0     	ldr	d0, [x22, #0x90]
 452ad88: 7e61d801     	ucvtf	d1, d0
 452ad8c: fd00ca81     	str	d1, [x20, #0x190]
 452ad90: 3941a2c8     	ldrb	w8, [x22, #0x68]
 452ad94: 39066288     	strb	w8, [x20, #0x198]
 452ad98: 394212c8     	ldrb	w8, [x22, #0x84]
 452ad9c: 39066688     	strb	w8, [x20, #0x199]
 452ada0: 3941a6c8     	ldrb	w8, [x22, #0x69]
 452ada4: 39066a88     	strb	w8, [x20, #0x19a]
 452ada8: 9100c2c0     	add	x0, x22, #0x30
 452adac: 958bdafa     	bl	0xa821994 <_ChromeMain+0xa81c6f8>
 452adb0: 37001a20     	tbnz	w0, #0x0, 0x452b0f4 <_ChromeMain+0x4525e58>
 452adb4: b9803ac8     	ldrsw	x8, [x22, #0x38]
 452adb8: 900533e9     	adrp	x9, 0xeba6000 <dyld_stub_binder+0xeba6000>
 452adbc: f944e129     	ldr	x9, [x9, #0x9c0]
 452adc0: 8a080d28     	and	x8, x9, x8, lsl #3
 452adc4: f9400918     	ldr	x24, [x8, #0x10]
 452adc8: 6f00e400     	movi.2d	v0, #0000000000000000
 452adcc: ad0083e0     	stp	q0, q0, [sp, #0x10]
 452add0: 0f000420     	movi.2s	v0, #0x1
 452add4: fd0013e0     	str	d0, [sp, #0x20]
 452add8: 9100c2c0     	add	x0, x22, #0x30
 452addc: 9703ac0c     	bl	0x615e0c <_ChromeMain+0x610b70>
 452ade0: aa0003e2     	mov	x2, x0
 452ade4: b0055428     	adrp	x8, 0xefaf000 <dyld_stub_binder+0xefaf000>
 452ade8: f942f100     	ldr	x0, [x8, #0x5e0]
 452adec: b4004300     	cbz	x0, 0x452b64c <_ChromeMain+0x45263b0>
 452adf0: 910043e3     	add	x3, sp, #0x10
 452adf4: aa1803e1     	mov	x1, x24
 452adf8: aa1503e4     	mov	x4, x21
 452adfc: 97393dbc     	bl	0x137a4ec <_ChromeMain+0x1375250>
 452ae00: aa0003f8     	mov	x24, x0
 452ae04: 394082bb     	ldrb	w27, [x21, #0x20]
 452ae08: 3400057b     	cbz	w27, 0x452aeb4 <_ChromeMain+0x4525c18>
 452ae0c: b004c920     	adrp	x0, 0xde4f000 <dyld_stub_binder+0xde4f000>
 452ae10: 913f9c00     	add	x0, x0, #0xfe7
 452ae14: 528000a1     	mov	w1, #0x5                ; =5
 452ae18: 52800162     	mov	w2, #0xb                ; =11
 452ae1c: 970fc9c1     	bl	0x91d520 <_ChromeMain+0x918284>
 452ae20: f900027f     	str	xzr, [x19]
 452ae24: b4000118     	cbz	x24, 0x452ae44 <_ChromeMain+0x4525ba8>
 452ae28: 12800008     	mov	w8, #-0x1               ; =-1
 452ae2c: b8e80308     	ldaddal	w8, w8, [x24]
 452ae30: 7100051f     	cmp	w8, #0x1
 452ae34: 54000081     	b.ne	0x452ae44 <_ChromeMain+0x4525ba8>
 452ae38: aa1803e0     	mov	x0, x24
 452ae3c: 974bd991     	bl	0x1821480 <_ChromeMain+0x181c1e4>
 452ae40: 94eb7341     	bl	0x8007b44 <_ChromeMain+0x80028a8>
 452ae44: 3600159b     	tbz	w27, #0x0, 0x452b0f4 <_ChromeMain+0x4525e58>
 452ae48: f9401fe1     	ldr	x1, [sp, #0x38]
 452ae4c: b5003be1     	cbnz	x1, 0x452b5c8 <_ChromeMain+0x452632c>
 452ae50: b4ffda54     	cbz	x20, 0x452a998 <_ChromeMain+0x45256fc>
 452ae54: aa1403e0     	mov	x0, x20
 452ae58: 97ed4d2a     	bl	0x407e300 <_ChromeMain+0x4079064>
 452ae5c: 52803e01     	mov	w1, #0x1f0              ; =496
 452ae60: 96eb7816     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 452ae64: 17fffecd     	b	0x452a998 <_ChromeMain+0x45256fc>
 452ae68: 96ecf156     	bl	0x673c0 <_ChromeMain+0x62124>
 452ae6c: 17ffffee     	b	0x452ae24 <_ChromeMain+0x4525b88>
 452ae70: d280001c     	mov	x28, #0x0               ; =0
 452ae74: 910123e0     	add	x0, sp, #0x48
 452ae78: 96ee3452     	bl	0xb7fc0 <_ChromeMain+0xb2d24>
 452ae7c: f940f680     	ldr	x0, [x20, #0x1e8]
 452ae80: f900f69c     	str	x28, [x20, #0x1e8]
 452ae84: b4fffd00     	cbz	x0, 0x452ae24 <_ChromeMain+0x4525b88>
 452ae88: b9400808     	ldr	w8, [x0, #0x8]
 452ae8c: 370ffcc8     	tbnz	w8, #0x1, 0x452ae24 <_ChromeMain+0x4525b88>
 452ae90: b9400008     	ldr	w8, [x0]
 452ae94: 71000509     	subs	w9, w8, #0x1
 452ae98: 54fffe80     	b.eq	0x452ae68 <_ChromeMain+0x4525bcc>
 452ae9c: aa0803ea     	mov	x10, x8
 452aea0: 88aafc09     	casl	w10, w9, [x0]
 452aea4: 6b08015f     	cmp	w10, w8
 452aea8: aa0a03e8     	mov	x8, x10
 452aeac: 54ffff41     	b.ne	0x452ae94 <_ChromeMain+0x4525bf8>
 452aeb0: 17ffffdd     	b	0x452ae24 <_ChromeMain+0x4525b88>
 452aeb4: 9106829c     	add	x28, x20, #0x1a0
 452aeb8: 3946c288     	ldrb	w8, [x20, #0x1b0]
 452aebc: 35003f08     	cbnz	w8, 0x452b69c <_ChromeMain+0x4526400>
 452aec0: b400375c     	cbz	x28, 0x452b5a8 <_ChromeMain+0x452630c>
 452aec4: f900d29f     	str	xzr, [x20, #0x1a0]
 452aec8: f900d69f     	str	xzr, [x20, #0x1a8]
 452aecc: 52800028     	mov	w8, #0x1                ; =1
 452aed0: 3906c288     	strb	w8, [x20, #0x1b0]
 452aed4: 3946c288     	ldrb	w8, [x20, #0x1b0]
 452aed8: 36003688     	tbz	w8, #0x0, 0x452b5a8 <_ChromeMain+0x452630c>
 452aedc: f9400b19     	ldr	x25, [x24, #0x10]
 452aee0: d360ff28     	lsr	x8, x25, #32
 452aee4: b5003628     	cbnz	x8, 0x452b5a8 <_ChromeMain+0x452630c>
 452aee8: f9400702     	ldr	x2, [x24, #0x8]
 452aeec: b941ae88     	ldr	w8, [x20, #0x1ac]
 452aef0: b941aa89     	ldr	w9, [x20, #0x1a8]
 452aef4: 0b19011a     	add	w26, w8, w25
 452aef8: 6b09035f     	cmp	w26, w9
 452aefc: 54003428     	b.hi	0x452b580 <_ChromeMain+0x45262e4>
 452af00: 6b08035f     	cmp	w26, w8
 452af04: 54003c63     	b.lo	0x452b690 <_ChromeMain+0x45263f4>
 452af08: b941aa89     	ldr	w9, [x20, #0x1a8]
 452af0c: 6b09011f     	cmp	w8, w9
 452af10: 54003a48     	b.hi	0x452b658 <_ChromeMain+0x45263bc>
 452af14: cb284129     	sub	x9, x9, w8, uxtw
 452af18: eb19013f     	cmp	x9, x25
 452af1c: 540039e3     	b.lo	0x452b658 <_ChromeMain+0x45263bc>
 452af20: b4000279     	cbz	x25, 0x452af6c <_ChromeMain+0x4525cd0>
 452af24: b4000242     	cbz	x2, 0x452af6c <_ChromeMain+0x4525cd0>
 452af28: 2a0803e8     	mov	w8, w8
 452af2c: f9400389     	ldr	x9, [x28]
 452af30: 8b080120     	add	x0, x9, x8
 452af34: b40001c0     	cbz	x0, 0x452af6c <_ChromeMain+0x4525cd0>
 452af38: 7100133f     	cmp	w25, #0x4
 452af3c: 54000140     	b.eq	0x452af64 <_ChromeMain+0x4525cc8>
 452af40: 7100233f     	cmp	w25, #0x8
 452af44: 54000081     	b.ne	0x452af54 <_ChromeMain+0x4525cb8>
 452af48: f9400048     	ldr	x8, [x2]
 452af4c: f9000008     	str	x8, [x0]
 452af50: 14000007     	b	0x452af6c <_ChromeMain+0x4525cd0>
 452af54: aa0203e1     	mov	x1, x2
 452af58: aa1903e2     	mov	x2, x25
 452af5c: 94eb7b67     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 452af60: 14000003     	b	0x452af6c <_ChromeMain+0x4525cd0>
 452af64: b9400048     	ldr	w8, [x2]
 452af68: b9000008     	str	w8, [x0]
 452af6c: 529fffbc     	mov	w28, #0xfffd            ; =65533
 452af70: 72a0005c     	movk	w28, #0x2, lsl #16
 452af74: b901ae9a     	str	w26, [x20, #0x1ac]
 452af78: b9803ac8     	ldrsw	x8, [x22, #0x38]
 452af7c: 900533e9     	adrp	x9, 0xeba6000 <dyld_stub_binder+0xeba6000>
 452af80: f944e129     	ldr	x9, [x9, #0x9c0]
 452af84: 8a080d28     	and	x8, x9, x8, lsl #3
 452af88: f9400919     	ldr	x25, [x8, #0x10]
 452af8c: f9003bff     	str	xzr, [sp, #0x70]
 452af90: f90027f9     	str	x25, [sp, #0x48]
 452af94: f940d728     	ldr	x8, [x25, #0x1a8]
 452af98: 528000c9     	mov	w9, #0x6                ; =6
 452af9c: 3901c3e9     	strb	w9, [sp, #0x70]
 452afa0: b0054de9     	adrp	x9, 0xeee7000 <dyld_stub_binder+0xeee7000>
 452afa4: f946a129     	ldr	x9, [x9, #0xd40]
 452afa8: aa1c0129     	orr	x9, x9, x28
 452afac: a90527e8     	stp	x8, x9, [sp, #0x50]
 452afb0: f90033e9     	str	x9, [sp, #0x60]
 452afb4: 96ec1322     	bl	0x2fc3c <_ChromeMain+0x2a9a0>
 452afb8: f90037e0     	str	x0, [sp, #0x68]
 452afbc: f94027e8     	ldr	x8, [sp, #0x48]
 452afc0: 910123e9     	add	x9, sp, #0x48
 452afc4: f900d509     	str	x9, [x8, #0x1a8]
 452afc8: aa1903e0     	mov	x0, x25
 452afcc: 96fdda29     	bl	0x4a1870 <_ChromeMain+0x49c5d4>
 452afd0: aa0003fa     	mov	x26, x0
 452afd4: 9100c2c0     	add	x0, x22, #0x30
 452afd8: 9703ab8d     	bl	0x615e0c <_ChromeMain+0x610b70>
 452afdc: aa0003e1     	mov	x1, x0
 452afe0: aa1a03e0     	mov	x0, x26
 452afe4: d2800002     	mov	x2, #0x0                ; =0
 452afe8: 94571eb6     	bl	0x5af2ac0 <_ChromeMain+0x5aed824>
 452afec: b40001c0     	cbz	x0, 0x452b024 <_ChromeMain+0x4525d88>
 452aff0: aa0003e2     	mov	x2, x0
 452aff4: d10263a0     	sub	x0, x29, #0x98
 452aff8: aa1903e1     	mov	x1, x25
 452affc: 9784ba49     	bl	0x2659920 <_ChromeMain+0x2654684>
 452b000: f85683b9     	ldur	x25, [x29, #-0x98]
 452b004: b4fff379     	cbz	x25, 0x452ae70 <_ChromeMain+0x4525bd4>
 452b008: f85703a1     	ldur	x1, [x29, #-0x90]
 452b00c: f144003f     	cmp	x1, #0x100, lsl #12     ; =0x100000
 452b010: 54000289     	b.ls	0x452b060 <_ChromeMain+0x4525dc4>
 452b014: d280001c     	mov	x28, #0x0               ; =0
 452b018: aa1903e0     	mov	x0, x25
 452b01c: 96eba593     	bl	0x14668 <_ChromeMain+0xf3cc>
 452b020: 17ffff95     	b	0x452ae74 <_ChromeMain+0x4525bd8>
 452b024: b9405be8     	ldr	w8, [sp, #0x58]
 452b028: b26e0789     	orr	x9, x28, #0xc0000
 452b02c: eb09011f     	cmp	x8, x9
 452b030: 54fff201     	b.ne	0x452ae70 <_ChromeMain+0x4525bd4>
 452b034: d280001c     	mov	x28, #0x0               ; =0
 452b038: 3941c3e8     	ldrb	w8, [sp, #0x70]
 452b03c: 321d0108     	orr	w8, w8, #0x8
 452b040: 3901c3e8     	strb	w8, [sp, #0x70]
 452b044: 17ffff8c     	b	0x452ae74 <_ChromeMain+0x4525bd8>
 452b048: d2800008     	mov	x8, #0x0                ; =0
 452b04c: b81a03bf     	stur	wzr, [x29, #-0x60]
 452b050: b00536e9     	adrp	x9, 0xec08000 <dyld_stub_binder+0xec08000>
 452b054: f9472129     	ldr	x9, [x9, #0xe40]
 452b058: f81903a9     	stur	x9, [x29, #-0x70]
 452b05c: 1400000c     	b	0x452b08c <_ChromeMain+0x4525df0>
 452b060: aa1903e0     	mov	x0, x25
 452b064: 9743c643     	bl	0x161c970 <_ChromeMain+0x16176d4>
 452b068: aa0003fa     	mov	x26, x0
 452b06c: b4fffee0     	cbz	x0, 0x452b048 <_ChromeMain+0x4525dac>
 452b070: f81903ba     	stur	x26, [x29, #-0x70]
 452b074: b9400748     	ldr	w8, [x26, #0x4]
 452b078: b81a03a8     	stur	w8, [x29, #-0x60]
 452b07c: 91003348     	add	x8, x26, #0xc
 452b080: b9400b5f     	ldr	wzr, [x26, #0x8]
 452b084: b00536e9     	adrp	x9, 0xec08000 <dyld_stub_binder+0xec08000>
 452b088: f9472129     	ldr	x9, [x9, #0xe40]
 452b08c: f81983a8     	stur	x8, [x29, #-0x68]
 452b090: f0049708     	adrp	x8, 0xd80e000 <dyld_stub_binder+0xd80e000>
 452b094: 91021d08     	add	x8, x8, #0x87
 452b098: a937a3a9     	stp	x9, x8, [x29, #-0x88]
 452b09c: 52800128     	mov	w8, #0x9                ; =9
 452b0a0: b81883a8     	stur	w8, [x29, #-0x78]
 452b0a4: d101c3a0     	sub	x0, x29, #0x70
 452b0a8: d10223a1     	sub	x1, x29, #0x88
 452b0ac: 96f50174     	bl	0x26b67c <_ChromeMain+0x2663e0>
 452b0b0: 52000008     	eor	w8, w0, #0x1
 452b0b4: 7100001f     	cmp	w0, #0x0
 452b0b8: 9a9a13fc     	csel	x28, xzr, x26, ne
 452b0bc: f100035f     	cmp	x26, #0x0
 452b0c0: 1a9f1508     	csinc	w8, w8, wzr, ne
 452b0c4: 3707faa8     	tbnz	w8, #0x0, 0x452b018 <_ChromeMain+0x4525d7c>
 452b0c8: b9400b48     	ldr	w8, [x26, #0x8]
 452b0cc: 370ffa68     	tbnz	w8, #0x1, 0x452b018 <_ChromeMain+0x4525d7c>
 452b0d0: b9400348     	ldr	w8, [x26]
 452b0d4: 71000509     	subs	w9, w8, #0x1
 452b0d8: 540022c0     	b.eq	0x452b530 <_ChromeMain+0x4526294>
 452b0dc: aa0803ea     	mov	x10, x8
 452b0e0: 88aaff49     	casl	w10, w9, [x26]
 452b0e4: 6b08015f     	cmp	w10, w8
 452b0e8: aa0a03e8     	mov	x8, x10
 452b0ec: 54ffff41     	b.ne	0x452b0d4 <_ChromeMain+0x4525e38>
 452b0f0: 17ffffca     	b	0x452b018 <_ChromeMain+0x4525d7c>
 452b0f4: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 452b0f8: b9401ec8     	ldr	w8, [x22, #0x1c]
 452b0fc: f9400269     	ldr	x9, [x19]
 452b100: a90027f7     	stp	x23, x9, [sp]
 452b104: 340000a8     	cbz	w8, 0x452b118 <_ChromeMain+0x4525e7c>
 452b108: f9400ad9     	ldr	x25, [x22, #0x10]
 452b10c: 8b080b3c     	add	x28, x25, x8, lsl #2
 452b110: 52800038     	mov	w24, #0x1               ; =1
 452b114: 14000098     	b	0x452b374 <_ChromeMain+0x45260d8>
 452b118: f94007e8     	ldr	x8, [sp, #0x8]
 452b11c: f9000268     	str	x8, [x19]
 452b120: 9106e280     	add	x0, x20, #0x1b8
 452b124: 910043e1     	add	x1, sp, #0x10
 452b128: 95e61c16     	bl	0xbeb2180 <_ChromeMain+0xbeacee4>
 452b12c: 39402ec8     	ldrb	w8, [x22, #0xb]
 452b130: 34000aa8     	cbz	w8, 0x452b284 <_ChromeMain+0x4525fe8>
 452b134: f94003e0     	ldr	x0, [sp]
 452b138: b40000a0     	cbz	x0, 0x452b14c <_ChromeMain+0x4525eb0>
 452b13c: f8480c08     	ldr	x8, [x0, #0x80]!
 452b140: f9400d08     	ldr	x8, [x8, #0x18]
 452b144: 52817921     	mov	w1, #0xbc9              ; =3017
 452b148: d63f0100     	blr	x8
 452b14c: b98082c8     	ldrsw	x8, [x22, #0x80]
 452b150: f00533c9     	adrp	x9, 0xeba6000 <dyld_stub_binder+0xeba6000>
 452b154: f944e129     	ldr	x9, [x9, #0x9c0]
 452b158: 8a080d28     	and	x8, x9, x8, lsl #3
 452b15c: f9400908     	ldr	x8, [x8, #0x10]
 452b160: b7f82248     	tbnz	x8, #0x3f, 0x452b5a8 <_ChromeMain+0x452630c>
 452b164: 52807d09     	mov	w9, #0x3e8              ; =1000
 452b168: 9b097d0a     	mul	x10, x8, x9
 452b16c: 9b497d08     	smulh	x8, x8, x9
 452b170: eb8afd1f     	cmp	x8, x10, asr #63
 452b174: 92f00008     	mov	x8, #0x7fffffffffffffff ; =9223372036854775807
 452b178: 9a8a1109     	csel	x9, x8, x10, ne
 452b17c: b24107ea     	mov	x10, #-0x7fffffffffffffff ; =-9223372036854775807
 452b180: 8b0a012a     	add	x10, x9, x10
 452b184: d2880018     	mov	x24, #0x4000            ; =16384
 452b188: f2a910d8     	movk	x24, #0x4886, lsl #16
 452b18c: f2cbd2d8     	movk	x24, #0x5e96, lsl #32
 452b190: f2e00538     	movk	x24, #0x29, lsl #48
 452b194: ab18012b     	adds	x11, x9, x24
 452b198: 9a8b6108     	csel	x8, x8, x11, vs
 452b19c: f100095f     	cmp	x10, #0x2
 452b1a0: 9a883137     	csel	x23, x9, x8, lo
 452b1a4: d0053428     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 452b1a8: f9468508     	ldr	x8, [x8, #0xd08]
 452b1ac: 90ffed29     	adrp	x9, 0x42cf000 <_ChromeMain+0x42c9d64>
 452b1b0: 9138c129     	add	x9, x9, #0xe30
 452b1b4: eb09011f     	cmp	x8, x9
 452b1b8: 54001f01     	b.ne	0x452b598 <_ChromeMain+0x45262fc>
 452b1bc: 94ec19f5     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 452b1c0: 1e602008     	fcmp	d0, #0.0
 452b1c4: 54002800     	b.eq	0x452b6c4 <_ChromeMain+0x4526428>
 452b1c8: 92f00000     	mov	x0, #0x7fffffffffffffff ; =9223372036854775807
 452b1cc: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 452b1d0: 9e670101     	fmov	d1, x8
 452b1d4: 1e612000     	fcmp	d0, d1
 452b1d8: 54000320     	b.eq	0x452b23c <_ChromeMain+0x4525fa0>
 452b1dc: b004d7e8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 452b1e0: f9444908     	ldr	x8, [x8, #0x890]
 452b1e4: fd400101     	ldr	d1, [x8]
 452b1e8: 1e612800     	fadd	d0, d0, d1
 452b1ec: 9004d108     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 452b1f0: fd45ad01     	ldr	d1, [x8, #0xb58]
 452b1f4: 1e610800     	fmul	d0, d0, d1
 452b1f8: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 452b1fc: 9e670101     	fmov	d1, x8
 452b200: 1e612000     	fcmp	d0, d1
 452b204: 9a80b3e8     	csel	x8, xzr, x0, lt
 452b208: 1e616801     	fmaxnm	d1, d0, d1
 452b20c: 9e780029     	fcvtzs	x9, d1
 452b210: 92f7840a     	mov	x10, #0x43dfffffffffffff ; =4890909195324358655
 452b214: 9e670141     	fmov	d1, x10
 452b218: 1e612000     	fcmp	d0, d1
 452b21c: 9a889120     	csel	x0, x9, x8, ls
 452b220: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 452b224: 8b080008     	add	x8, x0, x8
 452b228: f100091f     	cmp	x8, #0x2
 452b22c: 54000083     	b.lo	0x452b23c <_ChromeMain+0x4525fa0>
 452b230: ab180008     	adds	x8, x0, x24
 452b234: 92f00009     	mov	x9, #0x7fffffffffffffff ; =9223372036854775807
 452b238: 9a886120     	csel	x0, x9, x8, vs
 452b23c: eb0002e8     	subs	x8, x23, x0
 452b240: 937ffd09     	asr	x9, x8, #63
 452b244: d2410129     	eor	x9, x9, #0x8000000000000000
 452b248: 9a886128     	csel	x8, x9, x8, vs
 452b24c: d2940009     	mov	x9, #0xa000             ; =40960
 452b250: f2b8f849     	movk	x9, #0xc7c2, lsl #16
 452b254: f2c39ac9     	movk	x9, #0x1cd6, lsl #32
 452b258: eb09011f     	cmp	x8, x9
 452b25c: 540002ac     	b.gt	0x452b2b0 <_ChromeMain+0x4526014>
 452b260: 91074288     	add	x8, x20, #0x1d0
 452b264: 39476289     	ldrb	w9, [x20, #0x1d8]
 452b268: 350000c9     	cbnz	w9, 0x452b280 <_ChromeMain+0x4525fe4>
 452b26c: b40019e8     	cbz	x8, 0x452b5a8 <_ChromeMain+0x452630c>
 452b270: f900ea97     	str	x23, [x20, #0x1d0]
 452b274: 52800028     	mov	w8, #0x1                ; =1
 452b278: 39076288     	strb	w8, [x20, #0x1d8]
 452b27c: 14000002     	b	0x452b284 <_ChromeMain+0x4525fe8>
 452b280: f9000117     	str	x23, [x8]
 452b284: f9403ac8     	ldr	x8, [x22, #0x70]
 452b288: b4000068     	cbz	x8, 0x452b294 <_ChromeMain+0x4525ff8>
 452b28c: f100051f     	cmp	x8, #0x1
 452b290: 540021e1     	b.ne	0x452b6cc <_ChromeMain+0x4526430>
 452b294: b901e288     	str	w8, [x20, #0x1e0]
 452b298: aa1403e8     	mov	x8, x20
 452b29c: d2800014     	mov	x20, #0x0               ; =0
 452b2a0: f9000268     	str	x8, [x19]
 452b2a4: 910043e0     	add	x0, sp, #0x10
 452b2a8: 94a74f3b     	bl	0x6efef94 <_ChromeMain+0x6ef9cf8>
 452b2ac: 17fffee7     	b	0x452ae48 <_ChromeMain+0x4525bac>
 452b2b0: 9004c920     	adrp	x0, 0xde4f000 <dyld_stub_binder+0xde4f000>
 452b2b4: 913f9c00     	add	x0, x0, #0xfe7
 452b2b8: 528000e1     	mov	w1, #0x7                ; =7
 452b2bc: 52800162     	mov	w2, #0xb                ; =11
 452b2c0: 970fc898     	bl	0x91d520 <_ChromeMain+0x918284>
 452b2c4: 9004c921     	adrp	x1, 0xde4f000 <dyld_stub_binder+0xde4f000>
 452b2c8: 91312021     	add	x1, x1, #0xc48
 452b2cc: aa1503e0     	mov	x0, x21
 452b2d0: 95ade94b     	bl	0xb0a57fc <_ChromeMain+0xb0a0560>
 452b2d4: d2800008     	mov	x8, #0x0                ; =0
 452b2d8: 17fffff2     	b	0x452b2a0 <_ChromeMain+0x4526004>
 452b2dc: b9400808     	ldr	w8, [x0, #0x8]
 452b2e0: 37080248     	tbnz	w8, #0x1, 0x452b328 <_ChromeMain+0x452608c>
 452b2e4: b9400008     	ldr	w8, [x0]
 452b2e8: 71000509     	subs	w9, w8, #0x1
 452b2ec: 540011e0     	b.eq	0x452b528 <_ChromeMain+0x452628c>
 452b2f0: aa0803ea     	mov	x10, x8
 452b2f4: 88aafc09     	casl	w10, w9, [x0]
 452b2f8: 6b08015f     	cmp	w10, w8
 452b2fc: aa0a03e8     	mov	x8, x10
 452b300: 54ffff41     	b.ne	0x452b2e8 <_ChromeMain+0x452604c>
 452b304: 14000009     	b	0x452b328 <_ChromeMain+0x452608c>
 452b308: b940090a     	ldr	w10, [x8, #0x8]
 452b30c: 3708008a     	tbnz	w10, #0x1, 0x452b31c <_ChromeMain+0x4526080>
 452b310: b838010a     	ldadd	w24, w10, [x8]
 452b314: 3100055f     	cmn	w10, #0x1
 452b318: 540018a0     	b.eq	0x452b62c <_ChromeMain+0x4526390>
 452b31c: f9404520     	ldr	x0, [x9, #0x88]
 452b320: f9004528     	str	x8, [x9, #0x88]
 452b324: b5fffdc0     	cbnz	x0, 0x452b2dc <_ChromeMain+0x4526040>
 452b328: 39402348     	ldrb	w8, [x26, #0x8]
 452b32c: 340000a8     	cbz	w8, 0x452b340 <_ChromeMain+0x45260a4>
 452b330: f8418f48     	ldr	x8, [x26, #0x18]!
 452b334: b4000068     	cbz	x8, 0x452b340 <_ChromeMain+0x45260a4>
 452b338: b9400508     	ldr	w8, [x8, #0x4]
 452b33c: 35000e08     	cbnz	w8, 0x452b4fc <_ChromeMain+0x4526260>
 452b340: 294323e9     	ldp	w9, w8, [sp, #0x18]
 452b344: 6b09011f     	cmp	w8, w9
 452b348: 54001120     	b.eq	0x452b56c <_ChromeMain+0x45262d0>
 452b34c: f9400be9     	ldr	x9, [sp, #0x10]
 452b350: f828793f     	str	xzr, [x9, x8, lsl #3]
 452b354: f85903aa     	ldur	x10, [x29, #-0x70]
 452b358: f828792a     	str	x10, [x9, x8, lsl #3]
 452b35c: b9401fe8     	ldr	w8, [sp, #0x1c]
 452b360: 11000508     	add	w8, w8, #0x1
 452b364: b9001fe8     	str	w8, [sp, #0x1c]
 452b368: 91001339     	add	x25, x25, #0x4
 452b36c: eb1c033f     	cmp	x25, x28
 452b370: 54ffed40     	b.eq	0x452b118 <_ChromeMain+0x4525e7c>
 452b374: b9401fe8     	ldr	w8, [sp, #0x1c]
 452b378: 7100051f     	cmp	w8, #0x1
 452b37c: 54ffece8     	b.hi	0x452b118 <_ChromeMain+0x4525e7c>
 452b380: b9800328     	ldrsw	x8, [x25]
 452b384: f00533c9     	adrp	x9, 0xeba6000 <dyld_stub_binder+0xeba6000>
 452b388: f944e129     	ldr	x9, [x9, #0x9c0]
 452b38c: 8a080d3a     	and	x26, x9, x8, lsl #3
 452b390: f81903bf     	stur	xzr, [x29, #-0x70]
 452b394: 52801200     	mov	w0, #0x90               ; =144
 452b398: 96eb8ff4     	bl	0xf368 <_ChromeMain+0xa0cc>
 452b39c: aa0003fb     	mov	x27, x0
 452b3a0: b900001f     	str	wzr, [x0]
 452b3a4: aa0003f7     	mov	x23, x0
 452b3a8: f8008eff     	str	xzr, [x23, #0x8]!
 452b3ac: f900081f     	str	xzr, [x0, #0x10]
 452b3b0: 91006000     	add	x0, x0, #0x18
 452b3b4: 96f512a1     	bl	0x26fe38 <_ChromeMain+0x26ab9c>
 452b3b8: f900477f     	str	xzr, [x27, #0x88]
 452b3bc: f81903bb     	stur	x27, [x29, #-0x70]
 452b3c0: f9400b48     	ldr	x8, [x26, #0x10]
 452b3c4: b40000c8     	cbz	x8, 0x452b3dc <_ChromeMain+0x4526140>
 452b3c8: b9400909     	ldr	w9, [x8, #0x8]
 452b3cc: 37080089     	tbnz	w9, #0x1, 0x452b3dc <_ChromeMain+0x4526140>
 452b3d0: b8380109     	ldadd	w24, w9, [x8]
 452b3d4: 3100053f     	cmn	w9, #0x1
 452b3d8: 54001160     	b.eq	0x452b604 <_ChromeMain+0x4526368>
 452b3dc: f94002e0     	ldr	x0, [x23]
 452b3e0: f90002e8     	str	x8, [x23]
 452b3e4: b50004e0     	cbnz	x0, 0x452b480 <_ChromeMain+0x45261e4>
 452b3e8: f85903a8     	ldur	x8, [x29, #-0x70]
 452b3ec: f9401749     	ldr	x9, [x26, #0x28]
 452b3f0: b40000c9     	cbz	x9, 0x452b408 <_ChromeMain+0x452616c>
 452b3f4: b940092a     	ldr	w10, [x9, #0x8]
 452b3f8: 3708008a     	tbnz	w10, #0x1, 0x452b408 <_ChromeMain+0x452616c>
 452b3fc: b838012a     	ldadd	w24, w10, [x9]
 452b400: 3100055f     	cmn	w10, #0x1
 452b404: 540010a0     	b.eq	0x452b618 <_ChromeMain+0x452637c>
 452b408: f9400900     	ldr	x0, [x8, #0x10]
 452b40c: f9000909     	str	x9, [x8, #0x10]
 452b410: b50004e0     	cbnz	x0, 0x452b4ac <_ChromeMain+0x4526210>
 452b414: f9401b48     	ldr	x8, [x26, #0x30]
 452b418: b4000068     	cbz	x8, 0x452b424 <_ChromeMain+0x4526188>
 452b41c: f100051f     	cmp	x8, #0x1
 452b420: 54000061     	b.ne	0x452b42c <_ChromeMain+0x4526190>
 452b424: f85903a9     	ldur	x9, [x29, #-0x70]
 452b428: b9000128     	str	w8, [x9]
 452b42c: f9401348     	ldr	x8, [x26, #0x20]
 452b430: f85903a9     	ldur	x9, [x29, #-0x70]
 452b434: b4fff748     	cbz	x8, 0x452b31c <_ChromeMain+0x4526080>
 452b438: b940012a     	ldr	w10, [x9]
 452b43c: 35fff66a     	cbnz	w10, 0x452b308 <_ChromeMain+0x452606c>
 452b440: 9004c920     	adrp	x0, 0xde4f000 <dyld_stub_binder+0xde4f000>
 452b444: 913f9c00     	add	x0, x0, #0xfe7
 452b448: 528000c1     	mov	w1, #0x6                ; =6
 452b44c: 52800162     	mov	w2, #0xb                ; =11
 452b450: 970fc834     	bl	0x91d520 <_ChromeMain+0x918284>
 452b454: aa1503e0     	mov	x0, x21
 452b458: 9004c921     	adrp	x1, 0xde4f000 <dyld_stub_binder+0xde4f000>
 452b45c: 91302c21     	add	x1, x1, #0xc0b
 452b460: 95ade8e7     	bl	0xb0a57fc <_ChromeMain+0xb0a0560>
 452b464: f90007ff     	str	xzr, [sp, #0x8]
 452b468: 5280001a     	mov	w26, #0x0               ; =0
 452b46c: f85903a0     	ldur	x0, [x29, #-0x70]
 452b470: f81903bf     	stur	xzr, [x29, #-0x70]
 452b474: b5000320     	cbnz	x0, 0x452b4d8 <_ChromeMain+0x452623c>
 452b478: 3400067a     	cbz	w26, 0x452b544 <_ChromeMain+0x45262a8>
 452b47c: 17ffffbb     	b	0x452b368 <_ChromeMain+0x45260cc>
 452b480: b9400808     	ldr	w8, [x0, #0x8]
 452b484: 370ffb28     	tbnz	w8, #0x1, 0x452b3e8 <_ChromeMain+0x452614c>
 452b488: b9400008     	ldr	w8, [x0]
 452b48c: 71000509     	subs	w9, w8, #0x1
 452b490: 54000320     	b.eq	0x452b4f4 <_ChromeMain+0x4526258>
 452b494: aa0803ea     	mov	x10, x8
 452b498: 88aafc09     	casl	w10, w9, [x0]
 452b49c: 6b08015f     	cmp	w10, w8
 452b4a0: aa0a03e8     	mov	x8, x10
 452b4a4: 54ffff41     	b.ne	0x452b48c <_ChromeMain+0x45261f0>
 452b4a8: 17ffffd0     	b	0x452b3e8 <_ChromeMain+0x452614c>
 452b4ac: b9400808     	ldr	w8, [x0, #0x8]
 452b4b0: 370ffb28     	tbnz	w8, #0x1, 0x452b414 <_ChromeMain+0x4526178>
 452b4b4: b9400008     	ldr	w8, [x0]
 452b4b8: 71000509     	subs	w9, w8, #0x1
 452b4bc: 54000180     	b.eq	0x452b4ec <_ChromeMain+0x4526250>
 452b4c0: aa0803ea     	mov	x10, x8
 452b4c4: 88aafc09     	casl	w10, w9, [x0]
 452b4c8: 6b08015f     	cmp	w10, w8
 452b4cc: aa0a03e8     	mov	x8, x10
 452b4d0: 54ffff41     	b.ne	0x452b4b8 <_ChromeMain+0x452621c>
 452b4d4: 17ffffd0     	b	0x452b414 <_ChromeMain+0x4526178>
 452b4d8: 94a74d09     	bl	0x6efe8fc <_ChromeMain+0x6ef9660>
 452b4dc: 52801201     	mov	w1, #0x90               ; =144
 452b4e0: 96eb7676     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 452b4e4: 3400031a     	cbz	w26, 0x452b544 <_ChromeMain+0x45262a8>
 452b4e8: 17ffffa0     	b	0x452b368 <_ChromeMain+0x45260cc>
 452b4ec: 96ecefb5     	bl	0x673c0 <_ChromeMain+0x62124>
 452b4f0: 17ffffc9     	b	0x452b414 <_ChromeMain+0x4526178>
 452b4f4: 96ecefb3     	bl	0x673c0 <_ChromeMain+0x62124>
 452b4f8: 17ffffbc     	b	0x452b3e8 <_ChromeMain+0x452614c>
 452b4fc: 910123e8     	add	x8, sp, #0x48
 452b500: f94003e0     	ldr	x0, [sp]
 452b504: aa1a03e1     	mov	x1, x26
 452b508: 95e61ae4     	bl	0xbeb2098 <_ChromeMain+0xbeacdfc>
 452b50c: f85903a8     	ldur	x8, [x29, #-0x70]
 452b510: 91006100     	add	x0, x8, #0x18
 452b514: 910123e1     	add	x1, sp, #0x48
 452b518: 9701175e     	bl	0x571290 <_ChromeMain+0x56bff4>
 452b51c: 910123e0     	add	x0, sp, #0x48
 452b520: 96ebd008     	bl	0x1f540 <_ChromeMain+0x1a2a4>
 452b524: 17ffff87     	b	0x452b340 <_ChromeMain+0x45260a4>
 452b528: 96ecefa6     	bl	0x673c0 <_ChromeMain+0x62124>
 452b52c: 17ffff7f     	b	0x452b328 <_ChromeMain+0x452608c>
 452b530: aa1a03e0     	mov	x0, x26
 452b534: 96ecefa3     	bl	0x673c0 <_ChromeMain+0x62124>
 452b538: 17fffeb8     	b	0x452b018 <_ChromeMain+0x4525d7c>
 452b53c: d63f0100     	blr	x8
 452b540: 17fffdf3     	b	0x452ad0c <_ChromeMain+0x4525a70>
 452b544: f94007e8     	ldr	x8, [sp, #0x8]
 452b548: 17ffff56     	b	0x452b2a0 <_ChromeMain+0x4526004>
 452b54c: 96ecef9d     	bl	0x673c0 <_ChromeMain+0x62124>
 452b550: 17fffd55     	b	0x452aaa4 <_ChromeMain+0x4525808>
 452b554: 96ecef9b     	bl	0x673c0 <_ChromeMain+0x62124>
 452b558: 17fffd65     	b	0x452aaec <_ChromeMain+0x4525850>
 452b55c: 96ecef99     	bl	0x673c0 <_ChromeMain+0x62124>
 452b560: 17fffd6e     	b	0x452ab18 <_ChromeMain+0x452587c>
 452b564: 96ecef97     	bl	0x673c0 <_ChromeMain+0x62124>
 452b568: 17fffd77     	b	0x452ab44 <_ChromeMain+0x45258a8>
 452b56c: 910043e0     	add	x0, sp, #0x10
 452b570: d101c3a1     	sub	x1, x29, #0x70
 452b574: 95e619e9     	bl	0xbeb1d18 <_ChromeMain+0xbeaca7c>
 452b578: 5280003a     	mov	w26, #0x1               ; =1
 452b57c: 17ffffbc     	b	0x452b46c <_ChromeMain+0x45261d0>
 452b580: 91068280     	add	x0, x20, #0x1a0
 452b584: aa1a03e1     	mov	x1, x26
 452b588: 978a36ae     	bl	0x27b9040 <_ChromeMain+0x27b3da4>
 452b58c: aa0003e2     	mov	x2, x0
 452b590: b941ae88     	ldr	w8, [x20, #0x1ac]
 452b594: 17fffe5b     	b	0x452af00 <_ChromeMain+0x4525c64>
 452b598: d63f0100     	blr	x8
 452b59c: 17ffff28     	b	0x452b23c <_ChromeMain+0x4525fa0>
 452b5a0: d4200000     	brk	#0
 452b5a4: d4400000     	hlt	#0
 452b5a8: d4200020     	brk	#0x1
 452b5ac: b94057e8     	ldr	w8, [sp, #0x54]
 452b5b0: 34000048     	cbz	w8, 0x452b5b8 <_ChromeMain+0x452631c>
 452b5b4: b90057ff     	str	wzr, [sp, #0x54]
 452b5b8: 90055408     	adrp	x8, 0xefab000 <dyld_stub_binder+0xefab000>
 452b5bc: f9466900     	ldr	x0, [x8, #0xcd0]
 452b5c0: 96ebcdd4     	bl	0x1ed10 <_ChromeMain+0x19a74>
 452b5c4: 17fffda1     	b	0x452ac48 <_ChromeMain+0x45259ac>
 452b5c8: b94047e8     	ldr	w8, [sp, #0x44]
 452b5cc: 34000048     	cbz	w8, 0x452b5d4 <_ChromeMain+0x4526338>
 452b5d0: b90047ff     	str	wzr, [sp, #0x44]
 452b5d4: 90055408     	adrp	x8, 0xefab000 <dyld_stub_binder+0xefab000>
 452b5d8: f9466900     	ldr	x0, [x8, #0xcd0]
 452b5dc: 96ebcdcd     	bl	0x1ed10 <_ChromeMain+0x19a74>
 452b5e0: b4ff9dd4     	cbz	x20, 0x452a998 <_ChromeMain+0x45256fc>
 452b5e4: 17fffe1c     	b	0x452ae54 <_ChromeMain+0x4525bb8>
 452b5e8: b94057e8     	ldr	w8, [sp, #0x54]
 452b5ec: 34000048     	cbz	w8, 0x452b5f4 <_ChromeMain+0x4526358>
 452b5f0: b90057ff     	str	wzr, [sp, #0x54]
 452b5f4: 90055408     	adrp	x8, 0xefab000 <dyld_stub_binder+0xefab000>
 452b5f8: f9466900     	ldr	x0, [x8, #0xcd0]
 452b5fc: 96ebcdc5     	bl	0x1ed10 <_ChromeMain+0x19a74>
 452b600: 17fffd8c     	b	0x452ac30 <_ChromeMain+0x4525994>
 452b604: f94007e8     	ldr	x8, [sp, #0x8]
 452b608: f9000268     	str	x8, [x19]
 452b60c: d4200000     	brk	#0
 452b610: d4400000     	hlt	#0
 452b614: d4200020     	brk	#0x1
 452b618: f94007e8     	ldr	x8, [sp, #0x8]
 452b61c: f9000268     	str	x8, [x19]
 452b620: d4200000     	brk	#0
 452b624: d4400000     	hlt	#0
 452b628: d4200020     	brk	#0x1
 452b62c: f94007e8     	ldr	x8, [sp, #0x8]
 452b630: f9000268     	str	x8, [x19]
 452b634: d4200000     	brk	#0
 452b638: d4400000     	hlt	#0
 452b63c: d4200020     	brk	#0x1
 452b640: d4200000     	brk	#0
 452b644: d4400000     	hlt	#0
 452b648: d4200020     	brk	#0x1
 452b64c: d4200000     	brk	#0
 452b650: d4400000     	hlt	#0
 452b654: d4200020     	brk	#0x1
 452b658: d4200000     	brk	#0
 452b65c: d4400000     	hlt	#0
 452b660: d4200020     	brk	#0x1
 452b664: 6f00e401     	movi.2d	v1, #0000000000000000
 452b668: 17fffdc9     	b	0x452ad8c <_ChromeMain+0x4525af0>
 452b66c: d4200000     	brk	#0
 452b670: d4400000     	hlt	#0
 452b674: d4200020     	brk	#0x1
 452b678: d4200000     	brk	#0
 452b67c: d4400000     	hlt	#0
 452b680: d4200020     	brk	#0x1
 452b684: d4200000     	brk	#0
 452b688: d4400000     	hlt	#0
 452b68c: d4200020     	brk	#0x1
 452b690: d4200000     	brk	#0
 452b694: d4400000     	hlt	#0
 452b698: d4200020     	brk	#0x1
 452b69c: b941aa88     	ldr	w8, [x20, #0x1a8]
 452b6a0: 350001c8     	cbnz	w8, 0x452b6d8 <_ChromeMain+0x452643c>
 452b6a4: f940d281     	ldr	x1, [x20, #0x1a0]
 452b6a8: f900d29f     	str	xzr, [x20, #0x1a0]
 452b6ac: f900d69f     	str	xzr, [x20, #0x1a8]
