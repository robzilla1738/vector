Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465669c: d106c3ff     	sub	sp, sp, #0x1b0
 46566a0: 6d132beb     	stp	d11, d10, [sp, #0x130]
 46566a4: 6d1423e9     	stp	d9, d8, [sp, #0x140]
 46566a8: a9156ffc     	stp	x28, x27, [sp, #0x150]
 46566ac: a91667fa     	stp	x26, x25, [sp, #0x160]
 46566b0: a9175ff8     	stp	x24, x23, [sp, #0x170]
 46566b4: a91857f6     	stp	x22, x21, [sp, #0x180]
 46566b8: a9194ff4     	stp	x20, x19, [sp, #0x190]
 46566bc: a91a7bfd     	stp	x29, x30, [sp, #0x1a0]
 46566c0: 910683fd     	add	x29, sp, #0x1a0
 46566c4: eb02003f     	cmp	x1, x2
 46566c8: 540001a0     	b.eq	0x46566fc <_ChromeMain+0x4651460>
 46566cc: aa0003f3     	mov	x19, x0
 46566d0: f942f008     	ldr	x8, [x0, #0x5e0]
 46566d4: b4000148     	cbz	x8, 0x46566fc <_ChromeMain+0x4651460>
 46566d8: aa0203f9     	mov	x25, x2
 46566dc: aa0103f6     	mov	x22, x1
 46566e0: f9438e68     	ldr	x8, [x19, #0x718]
 46566e4: eb08003f     	cmp	x1, x8
 46566e8: fa483042     	ccmp	x2, x8, #0x2, lo
 46566ec: 54000082     	b.hs	0x46566fc <_ChromeMain+0x4651460>
 46566f0: f9439a69     	ldr	x9, [x19, #0x730]
 46566f4: eb08013f     	cmp	x9, x8
 46566f8: 540004a0     	b.eq	0x465678c <_ChromeMain+0x46514f0>
 46566fc: a95a7bfd     	ldp	x29, x30, [sp, #0x1a0]
 4656700: a9594ff4     	ldp	x20, x19, [sp, #0x190]
 4656704: a95857f6     	ldp	x22, x21, [sp, #0x180]
 4656708: a9575ff8     	ldp	x24, x23, [sp, #0x170]
 465670c: a95667fa     	ldp	x26, x25, [sp, #0x160]
 4656710: a9556ffc     	ldp	x28, x27, [sp, #0x150]
 4656714: 6d5423e9     	ldp	d9, d8, [sp, #0x140]
 4656718: 6d532beb     	ldp	d11, d10, [sp, #0x130]
 465671c: 9106c3ff     	add	sp, sp, #0x1b0
 4656720: d65f03c0     	ret
 4656724: f943fa68     	ldr	x8, [x19, #0x7f0]
 4656728: b4000128     	cbz	x8, 0x465674c <_ChromeMain+0x46514b0>
 465672c: 397b0268     	ldrb	w8, [x19, #0xec0]
 4656730: 35006148     	cbnz	w8, 0x4657358 <_ChromeMain+0x46520bc>
 4656734: f9076e7f     	str	xzr, [x19, #0xed8]
 4656738: 3979e268     	ldrb	w8, [x19, #0xe78]
 465673c: 35005dc8     	cbnz	w8, 0x46572f4 <_ChromeMain+0x4652058>
 4656740: 9139a260     	add	x0, x19, #0xe68
 4656744: 52800001     	mov	w1, #0x0                ; =0
 4656748: 97752087     	bl	0x239e964 <_ChromeMain+0x23996c8>
 465674c: f9402be1     	ldr	x1, [sp, #0x50]
 4656750: 910123e8     	add	x8, sp, #0x48
 4656754: f9004be8     	str	x8, [sp, #0x90]
 4656758: 910243e0     	add	x0, sp, #0x90
 465675c: 97a13cf9     	bl	0x2ea5b40 <_ChromeMain+0x2ea08a4>
 4656760: 97eb7eae     	bl	0x4136218 <_ChromeMain+0x4130f7c>
 4656764: f942f260     	ldr	x0, [x19, #0x5e0]
 4656768: 96fd2a85     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465676c: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 4656770: 37f84cc8     	tbnz	w8, #0x1f, 0x4657108 <_ChromeMain+0x4651e6c>
 4656774: f94043e1     	ldr	x1, [sp, #0x80]
 4656778: 9101e3e8     	add	x8, sp, #0x78
 465677c: f9004be8     	str	x8, [sp, #0x90]
 4656780: 910243e0     	add	x0, sp, #0x90
 4656784: 97a13cef     	bl	0x2ea5b40 <_ChromeMain+0x2ea08a4>
 4656788: 17ffffdd     	b	0x46566fc <_ChromeMain+0x4651460>
 465678c: 911cc27b     	add	x27, x19, #0x730
 4656790: f9438a7a     	ldr	x26, [x19, #0x710]
 4656794: f8767b5c     	ldr	x28, [x26, x22, lsl #3]
 4656798: 9101e3e9     	add	x9, sp, #0x78
 465679c: 91002129     	add	x9, x9, #0x8
 46567a0: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 46567a4: a90127f9     	stp	x25, x9, [sp, #0x10]
 46567a8: f9003fe9     	str	x9, [sp, #0x78]
 46567ac: d37df109     	lsl	x9, x8, #3
 46567b0: f90007fc     	str	x28, [sp, #0x8]
 46567b4: b4000be9     	cbz	x9, 0x4656930 <_ChromeMain+0x4651694>
 46567b8: 8b080f5c     	add	x28, x26, x8, lsl #3
 46567bc: 9004c728     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 46567c0: 3dc01100     	ldr	q0, [x8, #0x40]
 46567c4: 3d800fe0     	str	q0, [sp, #0x30]
 46567c8: 0f0167e8     	movi.2s	v8, #0x3f, lsl #24
 46567cc: 0f0665e9     	movi.2s	v9, #0xcf, lsl #24
 46567d0: 2f05662a     	mvni.2s	v10, #0xb1, lsl #24
 46567d4: 14000029     	b	0x4656878 <_ChromeMain+0x46515dc>
 46567d8: aa1903f8     	mov	x24, x25
 46567dc: 14000023     	b	0x4656868 <_ChromeMain+0x46515cc>
 46567e0: f9400328     	ldr	x8, [x25]
 46567e4: aa1903f5     	mov	x21, x25
 46567e8: b4000148     	cbz	x8, 0x4656810 <_ChromeMain+0x4651574>
 46567ec: aa0803f9     	mov	x25, x8
 46567f0: f9401108     	ldr	x8, [x8, #0x20]
 46567f4: eb0802ff     	cmp	x23, x8
 46567f8: 54ffff43     	b.lo	0x46567e0 <_ChromeMain+0x4651544>
 46567fc: eb17011f     	cmp	x8, x23
 4656800: 54fffec2     	b.hs	0x46567d8 <_ChromeMain+0x465153c>
 4656804: f9400728     	ldr	x8, [x25, #0x8]
 4656808: b5ffff28     	cbnz	x8, 0x46567ec <_ChromeMain+0x4651550>
 465680c: 91002335     	add	x21, x25, #0x8
 4656810: 52800700     	mov	w0, #0x38               ; =56
 4656814: 96e6e2d5     	bl	0xf368 <_ChromeMain+0xa0cc>
 4656818: b4004460     	cbz	x0, 0x46570a4 <_ChromeMain+0x4651e08>
 465681c: aa0003f8     	mov	x24, x0
 4656820: b100801f     	cmn	x0, #0x20
 4656824: 54004400     	b.eq	0x46570a4 <_ChromeMain+0x4651e08>
 4656828: a9007f1f     	stp	xzr, xzr, [x24]
 465682c: a902ff1f     	stp	xzr, xzr, [x24, #0x28]
 4656830: f9001317     	str	x23, [x24, #0x20]
 4656834: f9000b19     	str	x25, [x24, #0x10]
 4656838: f90002b8     	str	x24, [x21]
 465683c: f9403fe8     	ldr	x8, [sp, #0x78]
 4656840: f9400108     	ldr	x8, [x8]
 4656844: aa1803e1     	mov	x1, x24
 4656848: b4000068     	cbz	x8, 0x4656854 <_ChromeMain+0x46515b8>
 465684c: f9003fe8     	str	x8, [sp, #0x78]
 4656850: f94002a1     	ldr	x1, [x21]
 4656854: f94043e0     	ldr	x0, [sp, #0x80]
 4656858: 96e81482     	bl	0x5ba60 <_ChromeMain+0x567c4>
 465685c: f94047e8     	ldr	x8, [sp, #0x88]
 4656860: 91000508     	add	x8, x8, #0x1
 4656864: f90047e8     	str	x8, [sp, #0x88]
 4656868: a902d31b     	stp	x27, x20, [x24, #0x28]
 465686c: 9100235a     	add	x26, x26, #0x8
 4656870: eb1c035f     	cmp	x26, x28
 4656874: 54000580     	b.eq	0x4656924 <_ChromeMain+0x4651688>
 4656878: f9400357     	ldr	x23, [x26]
 465687c: b40004f7     	cbz	x23, 0x4656918 <_ChromeMain+0x465167c>
 4656880: 9106e2e8     	add	x8, x23, #0x1b8
 4656884: 910702e9     	add	x9, x23, #0x1c0
 4656888: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 465688c: 3dc00fe1     	ldr	q1, [sp, #0x30]
 4656890: 6ee14400     	ushl.2d	v0, v0, v1
 4656894: 0ea1280b     	xtn.2s	v11, v0
 4656898: 4d40cd20     	ld1r.2d	{ v0 }, [x9]
 465689c: 3d800be0     	str	q0, [sp, #0x20]
 46568a0: 910243e8     	add	x8, sp, #0x90
 46568a4: aa1703e0     	mov	x0, x23
 46568a8: 97f6649e     	bl	0x43efb20 <_ChromeMain+0x43ea884>
 46568ac: 910243e0     	add	x0, sp, #0x90
 46568b0: 96f79d7f     	bl	0x43deac <_ChromeMain+0x438c10>
 46568b4: 6e0c0420     	mov.s	v0[1], v1[0]
 46568b8: 0e28d400     	fadd.2s	v0, v0, v8
 46568bc: 0e219800     	frintm.2s	v0, v0
 46568c0: 2e20e541     	fcmge.2s	v1, v10, v0
 46568c4: 2e29e402     	fcmge.2s	v2, v0, v9
 46568c8: 2f047402     	bic.2s	v2, #0x80, lsl #24
 46568cc: 2ea9e403     	fcmgt.2s	v3, v0, v9
 46568d0: 2ee31d20     	bif.8b	v0, v9, v3
 46568d4: 0ea1b800     	fcvtzs.2s	v0, v0
 46568d8: 2ee11c40     	bif.8b	v0, v2, v1
 46568dc: 0ea00d60     	sqadd.2s	v0, v11, v0
 46568e0: ad4107e2     	ldp	q2, q1, [sp, #0x20]
 46568e4: 6ee14441     	ushl.2d	v1, v2, v1
 46568e8: 0ea12821     	xtn.2s	v1, v1
 46568ec: 0ea10c01     	sqadd.2s	v1, v0, v1
 46568f0: 0ea02c21     	sqsub.2s	v1, v1, v0
 46568f4: 0e0c3c28     	mov.s	w8, v1[1]
 46568f8: 1e260029     	fmov	w9, s1
 46568fc: 0aa97d29     	bic	w9, w9, w9, asr #31
 4656900: 0aa87d08     	bic	w8, w8, w8, asr #31
 4656904: aa088134     	orr	x20, x9, x8, lsl #32
 4656908: 9e66001b     	fmov	x27, d0
 465690c: f94043e8     	ldr	x8, [sp, #0x80]
 4656910: f9400ff9     	ldr	x25, [sp, #0x18]
 4656914: 17ffffb4     	b	0x46567e4 <_ChromeMain+0x4651548>
 4656918: d2800014     	mov	x20, #0x0               ; =0
 465691c: d280001b     	mov	x27, #0x0               ; =0
 4656920: 17fffffb     	b	0x465690c <_ChromeMain+0x4651670>
 4656924: 911cc27b     	add	x27, x19, #0x730
 4656928: f9400368     	ldr	x8, [x27]
 465692c: a940e7fc     	ldp	x28, x25, [sp, #0x8]
 4656930: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 4656934: f9003bff     	str	xzr, [sp, #0x70]
 4656938: eb0802df     	cmp	x22, x8
 465693c: 54003b42     	b.hs	0x46570a4 <_ChromeMain+0x4651e08>
 4656940: 911ca27a     	add	x26, x19, #0x728
 4656944: f9400349     	ldr	x9, [x26]
 4656948: 5280030a     	mov	w10, #0x18              ; =24
 465694c: 9b0a26ca     	madd	x10, x22, x10, x9
 4656950: 39c05d4b     	ldrsb	w11, [x10, #0x17]
 4656954: 37f8408b     	tbnz	w11, #0x1f, 0x4657164 <_ChromeMain+0x4651ec8>
 4656958: 3dc00140     	ldr	q0, [x10]
 465695c: f940094a     	ldr	x10, [x10, #0x10]
 4656960: f9003bea     	str	x10, [sp, #0x70]
 4656964: 3d801be0     	str	q0, [sp, #0x60]
 4656968: 8b1606ca     	add	x10, x22, x22, lsl #1
 465696c: d37df14a     	lsl	x10, x10, #3
 4656970: 8b08050b     	add	x11, x8, x8, lsl #1
 4656974: eb0b0d5f     	cmp	x10, x11, lsl #3
 4656978: 54003960     	b.eq	0x46570a4 <_ChromeMain+0x4651e08>
 465697c: d37df16b     	lsl	x11, x11, #3
 4656980: 8b0a0134     	add	x20, x9, x10
 4656984: 9100614c     	add	x12, x10, #0x18
 4656988: eb0b019f     	cmp	x12, x11
 465698c: 540001e0     	b.eq	0x46569c8 <_ChromeMain+0x465172c>
 4656990: cb0a0168     	sub	x8, x11, x10
 4656994: d1006115     	sub	x21, x8, #0x18
 4656998: 39c05e88     	ldrsb	w8, [x20, #0x17]
 465699c: 37f80208     	tbnz	w8, #0x1f, 0x46569dc <_ChromeMain+0x4651740>
 46569a0: 3cc18280     	ldur	q0, [x20, #0x18]
 46569a4: 3d800280     	str	q0, [x20]
 46569a8: f8428288     	ldur	x8, [x20, #0x28]
 46569ac: f9000a88     	str	x8, [x20, #0x10]
 46569b0: 3900be9f     	strb	wzr, [x20, #0x2f]
 46569b4: 38018e9f     	strb	wzr, [x20, #0x18]!
 46569b8: f10062b5     	subs	x21, x21, #0x18
 46569bc: 54fffee1     	b.ne	0x4656998 <_ChromeMain+0x46516fc>
 46569c0: f9400349     	ldr	x9, [x26]
 46569c4: f9400368     	ldr	x8, [x27]
 46569c8: 5280030a     	mov	w10, #0x18              ; =24
 46569cc: 9b0a2508     	madd	x8, x8, x10, x9
 46569d0: eb08029f     	cmp	x20, x8
 46569d4: 54000280     	b.eq	0x4656a24 <_ChromeMain+0x4651788>
 46569d8: 1400000d     	b	0x4656a0c <_ChromeMain+0x4651770>
 46569dc: f9400280     	ldr	x0, [x20]
 46569e0: f9400a88     	ldr	x8, [x20, #0x10]
 46569e4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46569e8: 96e6c934     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46569ec: 17ffffed     	b	0x46569a0 <_ChromeMain+0x4651704>
 46569f0: f85e8100     	ldur	x0, [x8, #-0x18]
 46569f4: f85f8108     	ldur	x8, [x8, #-0x8]
 46569f8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46569fc: 96e6c92f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4656a00: aa1503e8     	mov	x8, x21
 4656a04: eb1402bf     	cmp	x21, x20
 4656a08: 540000c0     	b.eq	0x4656a20 <_ChromeMain+0x4651784>
 4656a0c: f1006115     	subs	x21, x8, #0x18
 4656a10: 540034a0     	b.eq	0x46570a4 <_ChromeMain+0x4651e08>
 4656a14: 38dff109     	ldursb	w9, [x8, #-0x1]
 4656a18: 37fffec9     	tbnz	w9, #0x1f, 0x46569f0 <_ChromeMain+0x4651754>
 4656a1c: 17fffff9     	b	0x4656a00 <_ChromeMain+0x4651764>
 4656a20: f9400349     	ldr	x9, [x26]
 4656a24: cb09028a     	sub	x10, x20, x9
 4656a28: 9343fd48     	asr	x8, x10, #3
 4656a2c: b201f3eb     	mov	x11, #-0x5555555555555556 ; =-6148914691236517206
 4656a30: f295556b     	movk	x11, #0xaaab
 4656a34: 9b0b7d08     	mul	x8, x8, x11
 4656a38: f9039a68     	str	x8, [x19, #0x730]
 4656a3c: 8b190735     	add	x21, x25, x25, lsl #1
 4656a40: 8b150d37     	add	x23, x9, x21, lsl #3
 4656a44: f9439e6b     	ldr	x11, [x19, #0x738]
 4656a48: eb0b011f     	cmp	x8, x11
 4656a4c: 54003980     	b.eq	0x465717c <_ChromeMain+0x4651ee0>
 4656a50: 8b0a0138     	add	x24, x9, x10
 4656a54: eb17029f     	cmp	x20, x23
 4656a58: 54003fc1     	b.ne	0x4657250 <_ChromeMain+0x4651fb4>
 4656a5c: b4003257     	cbz	x23, 0x46570a4 <_ChromeMain+0x4651e08>
 4656a60: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 4656a64: 37f835c8     	tbnz	w8, #0x1f, 0x465711c <_ChromeMain+0x4651e80>
 4656a68: 3dc01be0     	ldr	q0, [sp, #0x60]
 4656a6c: f9403be8     	ldr	x8, [sp, #0x70]
 4656a70: f9000b08     	str	x8, [x24, #0x10]
 4656a74: 3d800300     	str	q0, [x24]
 4656a78: f9400348     	ldr	x8, [x26]
 4656a7c: cb080308     	sub	x8, x24, x8
 4656a80: 91006108     	add	x8, x8, #0x18
 4656a84: 9343fd08     	asr	x8, x8, #3
 4656a88: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 4656a8c: f2955569     	movk	x9, #0xaaab
 4656a90: 9b097d08     	mul	x8, x8, x9
 4656a94: f9000368     	str	x8, [x27]
 4656a98: d37df2c9     	lsl	x9, x22, #3
 4656a9c: f9438e68     	ldr	x8, [x19, #0x718]
 4656aa0: eb080d3f     	cmp	x9, x8, lsl #3
 4656aa4: 54003000     	b.eq	0x46570a4 <_ChromeMain+0x4651e08>
 4656aa8: f9438a74     	ldr	x20, [x19, #0x710]
 4656aac: d37df10a     	lsl	x10, x8, #3
 4656ab0: 8b090296     	add	x22, x20, x9
 4656ab4: 9100212b     	add	x11, x9, #0x8
 4656ab8: 90052af7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4656abc: eb0a017f     	cmp	x11, x10
 4656ac0: 54000280     	b.eq	0x4656b10 <_ChromeMain+0x4651874>
 4656ac4: cb090148     	sub	x8, x10, x9
 4656ac8: d1002114     	sub	x20, x8, #0x8
 4656acc: 14000009     	b	0x4656af0 <_ChromeMain+0x4651854>
 4656ad0: 96e72fdb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4656ad4: aa1603e8     	mov	x8, x22
 4656ad8: f8408d09     	ldr	x9, [x8, #0x8]!
 4656adc: f90002c9     	str	x9, [x22]
 4656ae0: f900011f     	str	xzr, [x8]
 4656ae4: aa0803f6     	mov	x22, x8
 4656ae8: f1002294     	subs	x20, x20, #0x8
 4656aec: 540000e0     	b.eq	0x4656b08 <_ChromeMain+0x465186c>
 4656af0: f94002c0     	ldr	x0, [x22]
 4656af4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4656af8: f94046e9     	ldr	x9, [x23, #0x88]
 4656afc: eb09011f     	cmp	x8, x9
 4656b00: 54fffea1     	b.ne	0x4656ad4 <_ChromeMain+0x4651838>
 4656b04: 17fffff3     	b	0x4656ad0 <_ChromeMain+0x4651834>
 4656b08: f9438a74     	ldr	x20, [x19, #0x710]
 4656b0c: f9438e68     	ldr	x8, [x19, #0x718]
 4656b10: 8b080e88     	add	x8, x20, x8, lsl #3
 4656b14: eb0802df     	cmp	x22, x8
 4656b18: 54000240     	b.eq	0x4656b60 <_ChromeMain+0x46518c4>
 4656b1c: d1002114     	sub	x20, x8, #0x8
 4656b20: 14000007     	b	0x4656b3c <_ChromeMain+0x46518a0>
 4656b24: 96e72fc6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4656b28: f900029f     	str	xzr, [x20]
 4656b2c: 910022a8     	add	x8, x21, #0x8
 4656b30: aa1503f4     	mov	x20, x21
 4656b34: eb16011f     	cmp	x8, x22
 4656b38: 54000120     	b.eq	0x4656b5c <_ChromeMain+0x46518c0>
 4656b3c: b4002b54     	cbz	x20, 0x46570a4 <_ChromeMain+0x4651e08>
 4656b40: aa1403f5     	mov	x21, x20
 4656b44: f85f86a0     	ldr	x0, [x21], #-0x8
 4656b48: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4656b4c: f94046e9     	ldr	x9, [x23, #0x88]
 4656b50: eb09011f     	cmp	x8, x9
 4656b54: 54fffea1     	b.ne	0x4656b28 <_ChromeMain+0x465188c>
 4656b58: 17fffff3     	b	0x4656b24 <_ChromeMain+0x4651888>
 4656b5c: f9438a74     	ldr	x20, [x19, #0x710]
 4656b60: cb1402c8     	sub	x8, x22, x20
 4656b64: 9343fd08     	asr	x8, x8, #3
 4656b68: f9038e68     	str	x8, [x19, #0x718]
 4656b6c: 8b190e98     	add	x24, x20, x25, lsl #3
 4656b70: 925e7789     	and	x9, x28, #0xfffffffc00000000
 4656b74: f94046ea     	ldr	x10, [x23, #0x88]
 4656b78: eb0a013f     	cmp	x9, x10
 4656b7c: 540000a1     	b.ne	0x4656b90 <_ChromeMain+0x46518f4>
 4656b80: aa1c03e0     	mov	x0, x28
 4656b84: 96e6f5de     	bl	0x142fc <_ChromeMain+0xf060>
 4656b88: f9438a74     	ldr	x20, [x19, #0x710]
 4656b8c: f9438e68     	ldr	x8, [x19, #0x718]
 4656b90: cb14031a     	sub	x26, x24, x20
 4656b94: 8b1a029b     	add	x27, x20, x26
 4656b98: f9439269     	ldr	x9, [x19, #0x720]
 4656b9c: eb09011f     	cmp	x8, x9
 4656ba0: 540002a0     	b.eq	0x4656bf4 <_ChromeMain+0x4651958>
 4656ba4: 8b080e89     	add	x9, x20, x8, lsl #3
 4656ba8: eb18013f     	cmp	x9, x24
 4656bac: 54002820     	b.eq	0x46570b0 <_ChromeMain+0x4651e14>
 4656bb0: d37df108     	lsl	x8, x8, #3
 4656bb4: d1002136     	sub	x22, x9, #0x8
 4656bb8: eb0902df     	cmp	x22, x9
 4656bbc: 540000a2     	b.hs	0x4656bd0 <_ChromeMain+0x4651934>
 4656bc0: f85f812a     	ldur	x10, [x9, #-0x8]
 4656bc4: a93fa93f     	stp	xzr, x10, [x9, #-0x8]
 4656bc8: 91002129     	add	x9, x9, #0x8
 4656bcc: f9438a74     	ldr	x20, [x19, #0x710]
 4656bd0: cb140129     	sub	x9, x9, x20
 4656bd4: 9343fd29     	asr	x9, x9, #3
 4656bd8: f9038e69     	str	x9, [x19, #0x718]
 4656bdc: 91002349     	add	x9, x26, #0x8
 4656be0: eb09011f     	cmp	x8, x9
 4656be4: 911ca279     	add	x25, x19, #0x728
 4656be8: 54000e00     	b.eq	0x4656da8 <_ChromeMain+0x4651b0c>
 4656bec: aa1603f4     	mov	x20, x22
 4656bf0: 14000140     	b	0x46570f0 <_ChromeMain+0x4651e54>
 4656bf4: 91000509     	add	x9, x8, #0x1
 4656bf8: d37dfd2a     	lsr	x10, x9, #61
 4656bfc: b5003d2a     	cbnz	x10, 0x46573a0 <_ChromeMain+0x4652104>
 4656c00: d37ff90a     	lsl	x10, x8, #1
 4656c04: eb09015f     	cmp	x10, x9
 4656c08: 9a89814b     	csel	x11, x10, x9, hi
 4656c0c: 92fe0009     	mov	x9, #0xfffffffffffffff  ; =1152921504606846975
 4656c10: 92fc000a     	mov	x10, #0x1fffffffffffffff ; =2305843009213693951
 4656c14: eb09011f     	cmp	x8, x9
 4656c18: aa0b03f5     	mov	x21, x11
 4656c1c: 9a8a3179     	csel	x25, x11, x10, lo
 4656c20: b4000259     	cbz	x25, 0x4656c68 <_ChromeMain+0x46519cc>
 4656c24: d37dff28     	lsr	x8, x25, #61
 4656c28: b5003ba8     	cbnz	x8, 0x465739c <_ChromeMain+0x4652100>
 4656c2c: d37df320     	lsl	x0, x25, #3
 4656c30: 96e6e1ce     	bl	0xf368 <_ChromeMain+0xa0cc>
 4656c34: aa0003f6     	mov	x22, x0
 4656c38: 8b1a02dc     	add	x28, x22, x26
 4656c3c: eb9a0f3f     	cmp	x25, x26, asr #3
 4656c40: 54000181     	b.ne	0x4656c70 <_ChromeMain+0x46519d4>
 4656c44: eb18029f     	cmp	x20, x24
 4656c48: 54002720     	b.eq	0x465712c <_ChromeMain+0x4651e90>
 4656c4c: d37ef728     	lsl	x8, x25, #2
 4656c50: 91001108     	add	x8, x8, #0x4
 4656c54: 927df108     	and	x8, x8, #0xfffffffffffffff8
 4656c58: cb08039a     	sub	x26, x28, x8
 4656c5c: aa1a03fc     	mov	x28, x26
 4656c60: aa1503f9     	mov	x25, x21
 4656c64: 14000004     	b	0x4656c74 <_ChromeMain+0x46519d8>
 4656c68: d2800016     	mov	x22, #0x0               ; =0
 4656c6c: 17fffff3     	b	0x4656c38 <_ChromeMain+0x465199c>
 4656c70: aa1c03fa     	mov	x26, x28
 4656c74: b400219c     	cbz	x28, 0x46570a4 <_ChromeMain+0x4651e08>
 4656c78: f94007e8     	ldr	x8, [sp, #0x8]
 4656c7c: f9000388     	str	x8, [x28]
 4656c80: cb1a0388     	sub	x8, x28, x26
 4656c84: 91002115     	add	x21, x8, #0x8
 4656c88: f9438a76     	ldr	x22, [x19, #0x710]
 4656c8c: f9438e68     	ldr	x8, [x19, #0x718]
 4656c90: 8b080edc     	add	x28, x22, x8, lsl #3
 4656c94: eb180394     	subs	x20, x28, x24
 4656c98: 54002080     	b.eq	0x46570a8 <_ChromeMain+0x4651e0c>
 4656c9c: d2800008     	mov	x8, #0x0                ; =0
 4656ca0: 8b150349     	add	x9, x26, x21
 4656ca4: ab08012a     	adds	x10, x9, x8
 4656ca8: 54001fe0     	b.eq	0x46570a4 <_ChromeMain+0x4651e08>
 4656cac: f8686b6b     	ldr	x11, [x27, x8]
 4656cb0: f900014b     	str	x11, [x10]
 4656cb4: f8286b7f     	str	xzr, [x27, x8]
 4656cb8: 91002108     	add	x8, x8, #0x8
 4656cbc: 8b08036a     	add	x10, x27, x8
 4656cc0: eb1c015f     	cmp	x10, x28
 4656cc4: 54ffff01     	b.ne	0x4656ca4 <_ChromeMain+0x4651a08>
 4656cc8: 14000005     	b	0x4656cdc <_ChromeMain+0x4651a40>
 4656ccc: 96e72f5c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4656cd0: f800877f     	str	xzr, [x27], #0x8
 4656cd4: eb1c037f     	cmp	x27, x28
 4656cd8: 54000100     	b.eq	0x4656cf8 <_ChromeMain+0x4651a5c>
 4656cdc: b4001e5b     	cbz	x27, 0x46570a4 <_ChromeMain+0x4651e08>
 4656ce0: f9400360     	ldr	x0, [x27]
 4656ce4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4656ce8: f94046e9     	ldr	x9, [x23, #0x88]
 4656cec: eb09011f     	cmp	x8, x9
 4656cf0: 54ffff01     	b.ne	0x4656cd0 <_ChromeMain+0x4651a34>
 4656cf4: 17fffff6     	b	0x4656ccc <_ChromeMain+0x4651a30>
 4656cf8: aa1503fb     	mov	x27, x21
 4656cfc: f9438e68     	ldr	x8, [x19, #0x718]
 4656d00: f9438a76     	ldr	x22, [x19, #0x710]
 4656d04: cb940d08     	sub	x8, x8, x20, asr #3
 4656d08: f9038e68     	str	x8, [x19, #0x718]
 4656d0c: cb080f5a     	sub	x26, x26, x8, lsl #3
 4656d10: eb1802df     	cmp	x22, x24
 4656d14: a940d7fc     	ldp	x28, x21, [sp, #0x8]
 4656d18: 540002e0     	b.eq	0x4656d74 <_ChromeMain+0x4651ad8>
 4656d1c: aa1603e8     	mov	x8, x22
 4656d20: aa1a03e9     	mov	x9, x26
 4656d24: b4001c09     	cbz	x9, 0x46570a4 <_ChromeMain+0x4651e08>
 4656d28: f940010a     	ldr	x10, [x8]
 4656d2c: f800852a     	str	x10, [x9], #0x8
 4656d30: f800851f     	str	xzr, [x8], #0x8
 4656d34: eb18011f     	cmp	x8, x24
 4656d38: 54ffff61     	b.ne	0x4656d24 <_ChromeMain+0x4651a88>
 4656d3c: 14000005     	b	0x4656d50 <_ChromeMain+0x4651ab4>
 4656d40: 96e72f3f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4656d44: f80086df     	str	xzr, [x22], #0x8
 4656d48: eb1802df     	cmp	x22, x24
 4656d4c: 54000100     	b.eq	0x4656d6c <_ChromeMain+0x4651ad0>
 4656d50: b4001ab6     	cbz	x22, 0x46570a4 <_ChromeMain+0x4651e08>
 4656d54: f94002c0     	ldr	x0, [x22]
 4656d58: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4656d5c: f94046e9     	ldr	x9, [x23, #0x88]
 4656d60: eb09011f     	cmp	x8, x9
 4656d64: 54ffff01     	b.ne	0x4656d44 <_ChromeMain+0x4651aa8>
 4656d68: 17fffff6     	b	0x4656d40 <_ChromeMain+0x4651aa4>
 4656d6c: f9438a76     	ldr	x22, [x19, #0x710]
 4656d70: f9438e68     	ldr	x8, [x19, #0x718]
 4656d74: 9343ff69     	asr	x9, x27, #3
 4656d78: 8b940d29     	add	x9, x9, x20, asr #3
 4656d7c: 8b080128     	add	x8, x9, x8
 4656d80: f9038a7a     	str	x26, [x19, #0x710]
 4656d84: f9038e68     	str	x8, [x19, #0x718]
 4656d88: f9439268     	ldr	x8, [x19, #0x720]
 4656d8c: f9039279     	str	x25, [x19, #0x720]
 4656d90: 911ca279     	add	x25, x19, #0x728
 4656d94: b40001b6     	cbz	x22, 0x4656dc8 <_ChromeMain+0x4651b2c>
 4656d98: d37df101     	lsl	x1, x8, #3
 4656d9c: aa1603e0     	mov	x0, x22
 4656da0: 96e6c846     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4656da4: 14000009     	b	0x4656dc8 <_ChromeMain+0x4651b2c>
 4656da8: f9400360     	ldr	x0, [x27]
 4656dac: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4656db0: f94046e9     	ldr	x9, [x23, #0x88]
 4656db4: eb09011f     	cmp	x8, x9
 4656db8: 54000041     	b.ne	0x4656dc0 <_ChromeMain+0x4651b24>
 4656dbc: 96e72f20     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4656dc0: f900037c     	str	x28, [x27]
 4656dc4: f9400bf5     	ldr	x21, [sp, #0x10]
 4656dc8: f942f260     	ldr	x0, [x19, #0x5e0]
 4656dcc: aa1c03e1     	mov	x1, x28
 4656dd0: aa1503e2     	mov	x2, x21
 4656dd4: 97bfe1e9     	bl	0x364f578 <_ChromeMain+0x364a2dc>
 4656dd8: f903de75     	str	x21, [x19, #0x7b8]
 4656ddc: 52800028     	mov	w8, #0x1                ; =1
 4656de0: 391f0268     	strb	w8, [x19, #0x7c0]
 4656de4: f9439a69     	ldr	x9, [x19, #0x730]
 4656de8: f943ea6a     	ldr	x10, [x19, #0x7d0]
 4656dec: eb0a013f     	cmp	x9, x10
 4656df0: 54000221     	b.ne	0x4656e34 <_ChromeMain+0x4651b98>
 4656df4: 8b090528     	add	x8, x9, x9, lsl #1
 4656df8: d37df108     	lsl	x8, x8, #3
 4656dfc: b40001c8     	cbz	x8, 0x4656e34 <_ChromeMain+0x4651b98>
 4656e00: f9400335     	ldr	x21, [x25]
 4656e04: f943e676     	ldr	x22, [x19, #0x7c8]
 4656e08: d1006108     	sub	x8, x8, #0x18
 4656e0c: aa0803f4     	mov	x20, x8
 4656e10: aa1503e0     	mov	x0, x21
 4656e14: aa1603e1     	mov	x1, x22
 4656e18: 9729d4bb     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 4656e1c: 340000a0     	cbz	w0, 0x4656e30 <_ChromeMain+0x4651b94>
 4656e20: 910062b5     	add	x21, x21, #0x18
 4656e24: 910062d6     	add	x22, x22, #0x18
 4656e28: d1006288     	sub	x8, x20, #0x18
 4656e2c: b5ffff14     	cbnz	x20, 0x4656e0c <_ChromeMain+0x4651b70>
 4656e30: 52000008     	eor	w8, w0, #0x1
 4656e34: 39202268     	strb	w8, [x19, #0x808]
 4656e38: 910123e8     	add	x8, sp, #0x48
 4656e3c: 91002117     	add	x23, x8, #0x8
 4656e40: a947a3e9     	ldp	x9, x8, [sp, #0x78]
 4656e44: a904a3e9     	stp	x9, x8, [sp, #0x48]
 4656e48: f94047e9     	ldr	x9, [sp, #0x88]
 4656e4c: f9002fe9     	str	x9, [sp, #0x58]
 4656e50: b40001e9     	cbz	x9, 0x4656e8c <_ChromeMain+0x4651bf0>
 4656e54: f9000917     	str	x23, [x8, #0x10]
 4656e58: f9400fe8     	ldr	x8, [sp, #0x18]
 4656e5c: f9003fe8     	str	x8, [sp, #0x78]
 4656e60: a9007d1f     	stp	xzr, xzr, [x8]
 4656e64: aa1303e0     	mov	x0, x19
 4656e68: 97ffeb68     	bl	0x4651c08 <_ChromeMain+0x464c96c>
 4656e6c: f9438e68     	ldr	x8, [x19, #0x718]
 4656e70: b4ffc5a8     	cbz	x8, 0x4656724 <_ChromeMain+0x4651488>
 4656e74: 52800014     	mov	w20, #0x0               ; =0
 4656e78: d2800015     	mov	x21, #0x0               ; =0
 4656e7c: 910243f8     	add	x24, sp, #0x90
 4656e80: 128002f6     	mov	w22, #-0x18             ; =-24
 4656e84: 12b00019     	mov	w25, #0x7fffffff        ; =2147483647
 4656e88: 14000019     	b	0x4656eec <_ChromeMain+0x4651c50>
 4656e8c: f90027f7     	str	x23, [sp, #0x48]
 4656e90: 17fffff5     	b	0x4656e64 <_ChromeMain+0x4651bc8>
 4656e94: b941c129     	ldr	w9, [x9, #0x1c0]
 4656e98: 1b162508     	madd	w8, w8, w22, w9
 4656e9c: 0b487d08     	add	w8, w8, w8, lsr #31
 4656ea0: 0b880688     	add	w8, w20, w8, asr #1
 4656ea4: 31006109     	adds	w9, w8, #0x18
 4656ea8: 1a896329     	csel	w9, w25, w9, vs
 4656eac: 6b080129     	subs	w9, w9, w8
 4656eb0: 131f7d2a     	asr	w10, w9, #31
 4656eb4: 5201014a     	eor	w10, w10, #0x80000000
 4656eb8: 1a896149     	csel	w9, w10, w9, vs
 4656ebc: 0aa97d29     	bic	w9, w9, w9, asr #31
 4656ec0: b25d0529     	orr	x9, x9, #0x1800000000
 4656ec4: f9438a6a     	ldr	x10, [x19, #0x710]
 4656ec8: f8757940     	ldr	x0, [x10, x21, lsl #3]
 4656ecc: a90927e8     	stp	x8, x9, [sp, #0x90]
 4656ed0: 910243e1     	add	x1, sp, #0x90
 4656ed4: 9709372f     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 4656ed8: 910006b5     	add	x21, x21, #0x1
 4656edc: f9438e68     	ldr	x8, [x19, #0x718]
 4656ee0: 11006294     	add	w20, w20, #0x18
 4656ee4: eb0802bf     	cmp	x21, x8
 4656ee8: 540000a2     	b.hs	0x4656efc <_ChromeMain+0x4651c60>
 4656eec: f942f269     	ldr	x9, [x19, #0x5e0]
 4656ef0: b5fffd29     	cbnz	x9, 0x4656e94 <_ChromeMain+0x4651bf8>
 4656ef4: d2800008     	mov	x8, #0x0                ; =0
 4656ef8: 17fffff3     	b	0x4656ec4 <_ChromeMain+0x4651c28>
 4656efc: b4ffc148     	cbz	x8, 0x4656724 <_ChromeMain+0x4651488>
 4656f00: d2800019     	mov	x25, #0x0               ; =0
 4656f04: 0f03f608     	fmov.2s	v8, #1.00000000
 4656f08: 1400001c     	b	0x4656f78 <_ChromeMain+0x4651cdc>
 4656f0c: 6f00e400     	movi.2d	v0, #0000000000000000
 4656f10: ad0483e0     	stp	q0, q0, [sp, #0x90]
 4656f14: f9008bff     	str	xzr, [sp, #0x110]
 4656f18: ad030300     	stp	q0, q0, [x24, #0x60]
 4656f1c: ad020300     	stp	q0, q0, [x24, #0x40]
 4656f20: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 4656f24: fd004fe8     	str	d8, [sp, #0x98]
 4656f28: 1e220280     	scvtf	s0, w20
 4656f2c: 1e220361     	scvtf	s1, w27
 4656f30: 2d1407e0     	stp	s0, s1, [sp, #0xa0]
 4656f34: 910243e1     	add	x1, sp, #0x90
 4656f38: aa1503e0     	mov	x0, x21
 4656f3c: 95820c70     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
 4656f40: f9438e68     	ldr	x8, [x19, #0x718]
 4656f44: 1400000a     	b	0x4656f6c <_ChromeMain+0x4651cd0>
 4656f48: f9400129     	ldr	x9, [x9]
 4656f4c: b4000109     	cbz	x9, 0x4656f6c <_ChromeMain+0x4651cd0>
 4656f50: f940112a     	ldr	x10, [x9, #0x20]
 4656f54: eb0a02bf     	cmp	x21, x10
 4656f58: 54ffff83     	b.lo	0x4656f48 <_ChromeMain+0x4651cac>
 4656f5c: eb15015f     	cmp	x10, x21
 4656f60: 54000162     	b.hs	0x4656f8c <_ChromeMain+0x4651cf0>
 4656f64: f9400529     	ldr	x9, [x9, #0x8]
 4656f68: b5ffff49     	cbnz	x9, 0x4656f50 <_ChromeMain+0x4651cb4>
 4656f6c: 91000739     	add	x25, x25, #0x1
 4656f70: eb08033f     	cmp	x25, x8
 4656f74: 54ffbd82     	b.hs	0x4656724 <_ChromeMain+0x4651488>
 4656f78: f9402be9     	ldr	x9, [sp, #0x50]
 4656f7c: b4ffff89     	cbz	x9, 0x4656f6c <_ChromeMain+0x4651cd0>
 4656f80: f9438a6a     	ldr	x10, [x19, #0x710]
 4656f84: f8797955     	ldr	x21, [x10, x25, lsl #3]
 4656f88: 17fffff2     	b	0x4656f50 <_ChromeMain+0x4651cb4>
 4656f8c: eb17013f     	cmp	x9, x23
 4656f90: 54fffee0     	b.eq	0x4656f6c <_ChromeMain+0x4651cd0>
 4656f94: b941baa8     	ldr	w8, [x21, #0x1b8]
 4656f98: 2945252a     	ldp	w10, w9, [x9, #0x28]
 4656f9c: 6b08014b     	subs	w11, w10, w8
 4656fa0: 131f7d6c     	asr	w12, w11, #31
 4656fa4: 5201018c     	eor	w12, w12, #0x80000000
 4656fa8: 1a8b6194     	csel	w20, w12, w11, vs
 4656fac: b941beab     	ldr	w11, [x21, #0x1bc]
 4656fb0: 6b0b012c     	subs	w12, w9, w11
 4656fb4: 131f7d8d     	asr	w13, w12, #31
 4656fb8: 520101ad     	eor	w13, w13, #0x80000000
 4656fbc: 1a8c61bb     	csel	w27, w13, w12, vs
 4656fc0: eb1c02bf     	cmp	x21, x28
 4656fc4: 54fffa40     	b.eq	0x4656f0c <_ChromeMain+0x4651c70>
 4656fc8: 6b08015f     	cmp	w10, w8
 4656fcc: 54000061     	b.ne	0x4656fd8 <_ChromeMain+0x4651d3c>
 4656fd0: 6b0b013f     	cmp	w9, w11
 4656fd4: 54fffb60     	b.eq	0x4656f40 <_ChromeMain+0x4651ca4>
 4656fd8: aa1c03f8     	mov	x24, x28
 4656fdc: 911fa268     	add	x8, x19, #0x7e8
 4656fe0: f9400108     	ldr	x8, [x8]
 4656fe4: 911fa27a     	add	x26, x19, #0x7e8
 4656fe8: 911fa27c     	add	x28, x19, #0x7e8
 4656fec: b5000448     	cbnz	x8, 0x4657074 <_ChromeMain+0x4651dd8>
 4656ff0: 52800600     	mov	w0, #0x30               ; =48
 4656ff4: 96e6e0dd     	bl	0xf368 <_ChromeMain+0xa0cc>
 4656ff8: b4000560     	cbz	x0, 0x46570a4 <_ChromeMain+0x4651e08>
 4656ffc: aa0003f6     	mov	x22, x0
 4657000: b100801f     	cmn	x0, #0x20
 4657004: 54000500     	b.eq	0x46570a4 <_ChromeMain+0x4651e08>
 4657008: a9027ed5     	stp	x21, xzr, [x22, #0x20]
 465700c: a9007edf     	stp	xzr, xzr, [x22]
 4657010: f9000adc     	str	x28, [x22, #0x10]
 4657014: f9000356     	str	x22, [x26]
 4657018: f943f268     	ldr	x8, [x19, #0x7e0]
 465701c: f9400108     	ldr	x8, [x8]
 4657020: aa1603e1     	mov	x1, x22
 4657024: b4000068     	cbz	x8, 0x4657030 <_ChromeMain+0x4651d94>
 4657028: f903f268     	str	x8, [x19, #0x7e0]
 465702c: f9400341     	ldr	x1, [x26]
 4657030: f943f660     	ldr	x0, [x19, #0x7e8]
 4657034: 96e8128b     	bl	0x5ba60 <_ChromeMain+0x567c4>
 4657038: f943fa68     	ldr	x8, [x19, #0x7f0]
 465703c: 91000508     	add	x8, x8, #0x1
 4657040: f903fa68     	str	x8, [x19, #0x7f0]
 4657044: aa1803fc     	mov	x28, x24
 4657048: d3607f68     	lsl	x8, x27, #32
 465704c: aa140108     	orr	x8, x8, x20
 4657050: f90016c8     	str	x8, [x22, #0x28]
 4657054: 6f00e400     	movi.2d	v0, #0000000000000000
 4657058: ad0483e0     	stp	q0, q0, [sp, #0x90]
 465705c: f9008bff     	str	xzr, [sp, #0x110]
 4657060: 910243f8     	add	x24, sp, #0x90
 4657064: 17ffffad     	b	0x4656f18 <_ChromeMain+0x4651c7c>
 4657068: f9400388     	ldr	x8, [x28]
 465706c: aa1c03fa     	mov	x26, x28
 4657070: b4fffc08     	cbz	x8, 0x4656ff0 <_ChromeMain+0x4651d54>
 4657074: aa0803fc     	mov	x28, x8
 4657078: f9401108     	ldr	x8, [x8, #0x20]
 465707c: eb0802bf     	cmp	x21, x8
 4657080: 54ffff43     	b.lo	0x4657068 <_ChromeMain+0x4651dcc>
 4657084: eb15011f     	cmp	x8, x21
 4657088: 540000a2     	b.hs	0x465709c <_ChromeMain+0x4651e00>
 465708c: f9400788     	ldr	x8, [x28, #0x8]
 4657090: b5ffff28     	cbnz	x8, 0x4657074 <_ChromeMain+0x4651dd8>
 4657094: 9100239a     	add	x26, x28, #0x8
 4657098: 17ffffd6     	b	0x4656ff0 <_ChromeMain+0x4651d54>
 465709c: aa1c03f6     	mov	x22, x28
 46570a0: 17ffffe9     	b	0x4657044 <_ChromeMain+0x4651da8>
 46570a4: d4200020     	brk	#0x1
 46570a8: aa1503fb     	mov	x27, x21
 46570ac: 17ffff16     	b	0x4656d04 <_ChromeMain+0x4651a68>
 46570b0: b4ffffb8     	cbz	x24, 0x46570a4 <_ChromeMain+0x4651e08>
 46570b4: f900013c     	str	x28, [x9]
 46570b8: f9438a68     	ldr	x8, [x19, #0x710]
 46570bc: cb080128     	sub	x8, x9, x8
 46570c0: 91002108     	add	x8, x8, #0x8
 46570c4: 9343fd08     	asr	x8, x8, #3
 46570c8: f9038e68     	str	x8, [x19, #0x718]
 46570cc: f9400bf5     	ldr	x21, [sp, #0x10]
 46570d0: 911ca279     	add	x25, x19, #0x728
 46570d4: 17ffff3d     	b	0x4656dc8 <_ChromeMain+0x4651b2c>
 46570d8: 96e72e59     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46570dc: f85f82c8     	ldur	x8, [x22, #-0x8]
 46570e0: a93fa2df     	stp	xzr, x8, [x22, #-0x8]
 46570e4: aa1403f6     	mov	x22, x20
 46570e8: eb18029f     	cmp	x20, x24
 46570ec: 54ffe5e0     	b.eq	0x4656da8 <_ChromeMain+0x4651b0c>
 46570f0: f85f8680     	ldr	x0, [x20], #-0x8
 46570f4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46570f8: f94046e9     	ldr	x9, [x23, #0x88]
 46570fc: eb09011f     	cmp	x8, x9
 4657100: 54fffee1     	b.ne	0x46570dc <_ChromeMain+0x4651e40>
 4657104: 17fffff5     	b	0x46570d8 <_ChromeMain+0x4651e3c>
 4657108: f94033e0     	ldr	x0, [sp, #0x60]
 465710c: f9403be8     	ldr	x8, [sp, #0x70]
 4657110: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4657114: 96e6c769     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4657118: 17fffd97     	b	0x4656774 <_ChromeMain+0x46514d8>
 465711c: a9460be1     	ldp	x1, x2, [sp, #0x60]
 4657120: aa1803e0     	mov	x0, x24
 4657124: 96e7043d     	bl	0x18218 <_ChromeMain+0x12f7c>
 4657128: 17fffe54     	b	0x4656a78 <_ChromeMain+0x46517dc>
 465712c: d37ffb28     	lsl	x8, x25, #1
 4657130: f100051f     	cmp	x8, #0x1
 4657134: 9a9f8515     	csinc	x21, x8, xzr, hi
 4657138: d37df2a0     	lsl	x0, x21, #3
 465713c: 96e6e08b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4657140: aa1503f4     	mov	x20, x21
 4657144: d342fea8     	lsr	x8, x21, #2
 4657148: 8b080c1a     	add	x26, x0, x8, lsl #3
 465714c: b4000096     	cbz	x22, 0x465715c <_ChromeMain+0x4651ec0>
 4657150: d37df321     	lsl	x1, x25, #3
 4657154: aa1603e0     	mov	x0, x22
 4657158: 96e6c758     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465715c: aa1403f9     	mov	x25, x20
 4657160: 17fffec5     	b	0x4656c74 <_ChromeMain+0x46519d8>
 4657164: a9400941     	ldp	x1, x2, [x10]
 4657168: 910183e0     	add	x0, sp, #0x60
 465716c: 96e7042b     	bl	0x18218 <_ChromeMain+0x12f7c>
 4657170: f9400349     	ldr	x9, [x26]
 4657174: f9400368     	ldr	x8, [x27]
 4657178: 17fffdfc     	b	0x4656968 <_ChromeMain+0x46516cc>
 465717c: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 4657180: f2e15549     	movk	x9, #0xaaa, lsl #48
 4657184: 9100050a     	add	x10, x8, #0x1
 4657188: eb09015f     	cmp	x10, x9
 465718c: 54001068     	b.hi	0x4657398 <_ChromeMain+0x46520fc>
 4657190: d2800000     	mov	x0, #0x0                ; =0
 4657194: d37ff90b     	lsl	x11, x8, #1
 4657198: eb0a017f     	cmp	x11, x10
 465719c: 9a8a816a     	csel	x10, x11, x10, hi
 46571a0: b200f3eb     	mov	x11, #0x5555555555555555 ; =6148914691236517205
 46571a4: f2e0aaab     	movk	x11, #0x555, lsl #48
 46571a8: eb0b011f     	cmp	x8, x11
 46571ac: 9a893154     	csel	x20, x10, x9, lo
 46571b0: f9004bff     	str	xzr, [sp, #0x90]
 46571b4: b40000f4     	cbz	x20, 0x46571d0 <_ChromeMain+0x4651f34>
 46571b8: eb09029f     	cmp	x20, x9
 46571bc: 54000f08     	b.hi	0x465739c <_ChromeMain+0x4652100>
 46571c0: 8b140688     	add	x8, x20, x20, lsl #1
 46571c4: d37df100     	lsl	x0, x8, #3
 46571c8: 96e6e068     	bl	0xf368 <_ChromeMain+0xa0cc>
 46571cc: f9004be0     	str	x0, [sp, #0x90]
 46571d0: d37df2a8     	lsl	x8, x21, #3
 46571d4: 8b080008     	add	x8, x0, x8
 46571d8: a909ffe8     	stp	x8, xzr, [sp, #0x98]
 46571dc: f90057f4     	str	x20, [sp, #0xa8]
 46571e0: 910243e0     	add	x0, sp, #0x90
 46571e4: 910183e1     	add	x1, sp, #0x60
 46571e8: 94b677df     	bl	0x73f5164 <_ChromeMain+0x73efec8>
 46571ec: 910243e0     	add	x0, sp, #0x90
 46571f0: 911ca262     	add	x2, x19, #0x728
 46571f4: 911cc263     	add	x3, x19, #0x730
 46571f8: 911ce264     	add	x4, x19, #0x738
 46571fc: aa1703e1     	mov	x1, x23
 4657200: 94b07e3b     	bl	0x7276aec <_ChromeMain+0x7271850>
 4657204: a949a3f4     	ldp	x20, x8, [sp, #0x98]
 4657208: 8b080509     	add	x9, x8, x8, lsl #1
 465720c: d37df135     	lsl	x21, x9, #3
 4657210: b5000d75     	cbnz	x21, 0x46573bc <_ChromeMain+0x4652120>
 4657214: aa1403e8     	mov	x8, x20
 4657218: 8b090e94     	add	x20, x20, x9, lsl #3
 465721c: cb080288     	sub	x8, x20, x8
 4657220: 9343fd08     	asr	x8, x8, #3
 4657224: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 4657228: f2955569     	movk	x9, #0xaaab
 465722c: 9b097d08     	mul	x8, x8, x9
 4657230: f90053e8     	str	x8, [sp, #0xa0]
 4657234: f9404be0     	ldr	x0, [sp, #0x90]
 4657238: b4ffc300     	cbz	x0, 0x4656a98 <_ChromeMain+0x46517fc>
 465723c: f94057e8     	ldr	x8, [sp, #0xa8]
 4657240: 8b080508     	add	x8, x8, x8, lsl #1
 4657244: d37df101     	lsl	x1, x8, #3
 4657248: 96e6c71c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465724c: 17fffe13     	b	0x4656a98 <_ChromeMain+0x46517fc>
 4657250: 911ca260     	add	x0, x19, #0x728
 4657254: 910062e3     	add	x3, x23, #0x18
 4657258: aa1703e1     	mov	x1, x23
 465725c: aa1803e2     	mov	x2, x24
 4657260: 94b07ded     	bl	0x7276a14 <_ChromeMain+0x7271778>
 4657264: eb17029f     	cmp	x20, x23
 4657268: 54fff1e3     	b.lo	0x46570a4 <_ChromeMain+0x4651e08>
 465726c: 910183ea     	add	x10, sp, #0x60
 4657270: eb17015f     	cmp	x10, x23
 4657274: 1a9f37e8     	cset	w8, hs
 4657278: eb14015f     	cmp	x10, x20
 465727c: 1a9f27e9     	cset	w9, lo
 4657280: 6a090109     	ands	w9, w8, w9
 4657284: 52800308     	mov	w8, #0x18               ; =24
 4657288: 9a9f1108     	csel	x8, x8, xzr, ne
 465728c: 8b080148     	add	x8, x10, x8
 4657290: eb17011f     	cmp	x8, x23
 4657294: 54ffc020     	b.eq	0x4656a98 <_ChromeMain+0x46517fc>
 4657298: 39c05eeb     	ldrsb	w11, [x23, #0x17]
 465729c: 7200013f     	tst	w9, #0x1
 46572a0: 528002ec     	mov	w12, #0x17              ; =23
 46572a4: 528005ed     	mov	w13, #0x2f              ; =47
 46572a8: 9a8c11ac     	csel	x12, x13, x12, ne
 46572ac: 386c694a     	ldrb	w10, [x10, x12]
 46572b0: 37f8058b     	tbnz	w11, #0x1f, 0x4657360 <_ChromeMain+0x46520c4>
 46572b4: 373800ca     	tbnz	w10, #0x7, 0x46572cc <_ChromeMain+0x4652030>
 46572b8: 3dc00100     	ldr	q0, [x8]
 46572bc: f9400908     	ldr	x8, [x8, #0x10]
 46572c0: f9000ae8     	str	x8, [x23, #0x10]
 46572c4: 3d8002e0     	str	q0, [x23]
 46572c8: 17fffdf4     	b	0x4656a98 <_ChromeMain+0x46517fc>
 46572cc: f9400101     	ldr	x1, [x8]
 46572d0: 7200013f     	tst	w9, #0x1
 46572d4: 52800108     	mov	w8, #0x8                ; =8
 46572d8: 52800409     	mov	w9, #0x20               ; =32
 46572dc: 9a881128     	csel	x8, x9, x8, ne
 46572e0: 910183e9     	add	x9, sp, #0x60
 46572e4: f8686922     	ldr	x2, [x9, x8]
 46572e8: aa1703e0     	mov	x0, x23
 46572ec: 96f945f2     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46572f0: 17fffdea     	b	0x4656a98 <_ChromeMain+0x46517fc>
 46572f4: 3939e27f     	strb	wzr, [x19, #0xe78]
 46572f8: f9474660     	ldr	x0, [x19, #0xe88]
 46572fc: 9139a261     	add	x1, x19, #0xe68
 4657300: 976ac900     	bl	0x2109700 <_ChromeMain+0x2104464>
 4657304: f9473668     	ldr	x8, [x19, #0xe68]
 4657308: f9401d08     	ldr	x8, [x8, #0x38]
 465730c: 9139a260     	add	x0, x19, #0xe68
 4657310: d63f0100     	blr	x8
 4657314: f9474268     	ldr	x8, [x19, #0xe80]
 4657318: b4ffa148     	cbz	x8, 0x4656740 <_ChromeMain+0x46514a4>
 465731c: f9473668     	ldr	x8, [x19, #0xe68]
 4657320: f9402108     	ldr	x8, [x8, #0x40]
 4657324: 9139a260     	add	x0, x19, #0xe68
 4657328: d63f0100     	blr	x8
 465732c: f9474268     	ldr	x8, [x19, #0xe80]
 4657330: f9400109     	ldr	x9, [x8]
 4657334: 7100001f     	cmp	w0, #0x0
 4657338: 5280020a     	mov	w10, #0x10              ; =16
 465733c: 5280040b     	mov	w11, #0x20              ; =32
 4657340: 9a8a116a     	csel	x10, x11, x10, ne
 4657344: f86a6929     	ldr	x9, [x9, x10]
 4657348: 9139a261     	add	x1, x19, #0xe68
 465734c: aa0803e0     	mov	x0, x8
 4657350: d63f0120     	blr	x9
 4657354: 17fffcfb     	b	0x4656740 <_ChromeMain+0x46514a4>
 4657358: 393b027f     	strb	wzr, [x19, #0xec0]
 465735c: 17fffcf6     	b	0x4656734 <_ChromeMain+0x4651498>
 4657360: 13001d4b     	sxtb	w11, w10
 4657364: f940010c     	ldr	x12, [x8]
 4657368: 7200013f     	tst	w9, #0x1
 465736c: 52800109     	mov	w9, #0x8                ; =8
 4657370: 5280040d     	mov	w13, #0x20              ; =32
 4657374: 9a8911a9     	csel	x9, x13, x9, ne
 4657378: 7100017f     	cmp	w11, #0x0
 465737c: 9a884181     	csel	x1, x12, x8, mi
 4657380: 910183e8     	add	x8, sp, #0x60
 4657384: f8696908     	ldr	x8, [x8, x9]
 4657388: 9a8a4102     	csel	x2, x8, x10, mi
 465738c: aa1703e0     	mov	x0, x23
 4657390: 96f9461c     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4657394: 17fffdc1     	b	0x4656a98 <_ChromeMain+0x46517fc>
 4657398: 9762f27a     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 465739c: 9416bb21     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 46573a0: 94159b18     	bl	0x4bbe000 <_ChromeMain+0x4bb8d64>
 46573a4: f9400100     	ldr	x0, [x8]
 46573a8: 8b150288     	add	x8, x20, x21
 46573ac: f85f8108     	ldur	x8, [x8, #-0x8]
 46573b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46573b4: 96e6c6c1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46573b8: 14000006     	b	0x46573d0 <_ChromeMain+0x4652134>
 46573bc: 8b150289     	add	x9, x20, x21
 46573c0: f1006128     	subs	x8, x9, #0x18
 46573c4: 54ffe700     	b.eq	0x46570a4 <_ChromeMain+0x4651e08>
 46573c8: 38dff129     	ldursb	w9, [x9, #-0x1]
 46573cc: 37fffec9     	tbnz	w9, #0x1f, 0x46573a4 <_ChromeMain+0x4652108>
 46573d0: f10062b5     	subs	x21, x21, #0x18
 46573d4: 54ffff41     	b.ne	0x46573bc <_ChromeMain+0x4652120>
 46573d8: f9404fe8     	ldr	x8, [sp, #0x98]
 46573dc: f9400bf9     	ldr	x25, [sp, #0x10]
 46573e0: 17ffff8f     	b	0x465721c <_ChromeMain+0x4651f80>
