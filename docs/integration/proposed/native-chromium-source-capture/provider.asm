
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426abd0: d102c3ff     	sub	sp, sp, #0xb0
 426abd4: a90857f6     	stp	x22, x21, [sp, #0x80]
 426abd8: a9094ff4     	stp	x20, x19, [sp, #0x90]
 426abdc: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 426abe0: 910283fd     	add	x29, sp, #0xa0
 426abe4: aa0803f3     	mov	x19, x8
 426abe8: a93c7fbf     	stp	xzr, xzr, [x29, #-0x40]
 426abec: f81d03bf     	stur	xzr, [x29, #-0x30]
 426abf0: 71000c1f     	cmp	w0, #0x3
 426abf4: 5400082c     	b.gt	0x426acf8 <_ChromeMain+0x4265a5c>
 426abf8: 34001000     	cbz	w0, 0x426adf8 <_ChromeMain+0x4265b5c>
 426abfc: 7100041f     	cmp	w0, #0x1
 426ac00: 54000420     	b.eq	0x426ac84 <_ChromeMain+0x42659e8>
 426ac04: 71000c1f     	cmp	w0, #0x3
 426ac08: 54000f21     	b.ne	0x426adec <_ChromeMain+0x4265b50>
 426ac0c: 52800268     	mov	w8, #0x13               ; =19
 426ac10: 381d73a8     	sturb	w8, [x29, #-0x29]
 426ac14: d10103a9     	sub	x9, x29, #0x40
 426ac18: 91004d2a     	add	x10, x9, #0x13
 426ac1c: d00464e8     	adrp	x8, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426ac20: 91063508     	add	x8, x8, #0x18d
 426ac24: eb08015f     	cmp	x10, x8
 426ac28: fa488122     	ccmp	x9, x8, #0x2, hi
 426ac2c: 54002189     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426ac30: 528c2e49     	mov	w9, #0x6172             ; =24946
 426ac34: 72acace9     	movk	w9, #0x6567, lsl #16
 426ac38: b81cf3a9     	stur	w9, [x29, #-0x31]
 426ac3c: 3dc00100     	ldr	q0, [x8]
 426ac40: 3c9c03a0     	stur	q0, [x29, #-0x40]
 426ac44: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 426ac48: f90027ff     	str	xzr, [sp, #0x48]
 426ac4c: 528000c8     	mov	w8, #0x6                ; =6
 426ac50: 39017fe8     	strb	w8, [sp, #0x5f]
 426ac54: 910123e8     	add	x8, sp, #0x48
 426ac58: b27f0509     	orr	x9, x8, #0x6
 426ac5c: d00464ea     	adrp	x10, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426ac60: 9107894a     	add	x10, x10, #0x1e2
 426ac64: eb0a013f     	cmp	x9, x10
 426ac68: fa4a8102     	ccmp	x8, x10, #0x2, hi
 426ac6c: 54001f89     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426ac70: 528cada8     	mov	w8, #0x656d             ; =25965
 426ac74: 79009be8     	strh	w8, [sp, #0x4c]
 426ac78: 528d0868     	mov	w8, #0x6843             ; =26691
 426ac7c: 72adee48     	movk	w8, #0x6f72, lsl #16
 426ac80: 14000095     	b	0x426aed4 <_ChromeMain+0x4265c38>
 426ac84: 52800248     	mov	w8, #0x12               ; =18
 426ac88: 381d73a8     	sturb	w8, [x29, #-0x29]
 426ac8c: d10103a9     	sub	x9, x29, #0x40
 426ac90: 9100492a     	add	x10, x9, #0x12
 426ac94: d00464e8     	adrp	x8, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426ac98: 9105e908     	add	x8, x8, #0x17a
 426ac9c: eb08015f     	cmp	x10, x8
 426aca0: fa488122     	ccmp	x9, x8, #0x2, hi
 426aca4: 54001dc9     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426aca8: 528cace9     	mov	w9, #0x6567             ; =25959
 426acac: 781d03a9     	sturh	w9, [x29, #-0x30]
 426acb0: 3dc00100     	ldr	q0, [x8]
 426acb4: 3c9c03a0     	stur	q0, [x29, #-0x40]
 426acb8: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 426acbc: f90027ff     	str	xzr, [sp, #0x48]
 426acc0: 528000a8     	mov	w8, #0x5                ; =5
 426acc4: 39017fe8     	strb	w8, [sp, #0x5f]
 426acc8: 910123e9     	add	x9, sp, #0x48
 426accc: aa080128     	orr	x8, x9, x8
 426acd0: d00464ea     	adrp	x10, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426acd4: 9107714a     	add	x10, x10, #0x1dc
 426acd8: eb0a011f     	cmp	x8, x10
 426acdc: fa4a8122     	ccmp	x9, x10, #0x2, hi
 426ace0: 54001be9     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426ace4: 52800ca8     	mov	w8, #0x65               ; =101
 426ace8: 390133e8     	strb	w8, [sp, #0x4c]
 426acec: 528e4848     	mov	w8, #0x7242             ; =29250
 426acf0: 72aecc28     	movk	w8, #0x7661, lsl #16
 426acf4: 14000078     	b	0x426aed4 <_ChromeMain+0x4265c38>
 426acf8: 7100101f     	cmp	w0, #0x4
 426acfc: 54000b40     	b.eq	0x426ae64 <_ChromeMain+0x4265bc8>
 426ad00: 7100141f     	cmp	w0, #0x5
 426ad04: 54000400     	b.eq	0x426ad84 <_ChromeMain+0x4265ae8>
 426ad08: 71001c1f     	cmp	w0, #0x7
 426ad0c: 54000701     	b.ne	0x426adec <_ChromeMain+0x4265b50>
 426ad10: 52800248     	mov	w8, #0x12               ; =18
 426ad14: 381d73a8     	sturb	w8, [x29, #-0x29]
 426ad18: d10103a9     	sub	x9, x29, #0x40
 426ad1c: 9100492a     	add	x10, x9, #0x12
 426ad20: d00464e8     	adrp	x8, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426ad24: 91071508     	add	x8, x8, #0x1c5
 426ad28: eb08015f     	cmp	x10, x8
 426ad2c: fa488122     	ccmp	x9, x8, #0x2, hi
 426ad30: 54001969     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426ad34: 528f2ca9     	mov	w9, #0x7965             ; =31077
 426ad38: 781d03a9     	sturh	w9, [x29, #-0x30]
 426ad3c: 3dc00100     	ldr	q0, [x8]
 426ad40: 3c9c03a0     	stur	q0, [x29, #-0x40]
 426ad44: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 426ad48: f90027ff     	str	xzr, [sp, #0x48]
 426ad4c: 528000c8     	mov	w8, #0x6                ; =6
 426ad50: 39017fe8     	strb	w8, [sp, #0x5f]
 426ad54: 910123e8     	add	x8, sp, #0x48
 426ad58: b27f0509     	orr	x9, x8, #0x6
 426ad5c: d00464ea     	adrp	x10, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426ad60: 9107cd4a     	add	x10, x10, #0x1f3
 426ad64: eb0a013f     	cmp	x9, x10
 426ad68: fa4a8102     	ccmp	x8, x10, #0x2, hi
 426ad6c: 54001789     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426ad70: 528daea8     	mov	w8, #0x6d75             ; =28021
 426ad74: 79009be8     	strh	w8, [sp, #0x4c]
 426ad78: 528ca908     	mov	w8, #0x6548             ; =25928
 426ad7c: 72ad2d88     	movk	w8, #0x696c, lsl #16
 426ad80: 14000055     	b	0x426aed4 <_ChromeMain+0x4265c38>
 426ad84: 52800208     	mov	w8, #0x10               ; =16
 426ad88: 381d73a8     	sturb	w8, [x29, #-0x29]
 426ad8c: d10103a9     	sub	x9, x29, #0x40
 426ad90: 9100412a     	add	x10, x9, #0x10
 426ad94: d00464e8     	adrp	x8, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426ad98: 9106d108     	add	x8, x8, #0x1b4
 426ad9c: eb08015f     	cmp	x10, x8
 426ada0: fa488122     	ccmp	x9, x8, #0x2, hi
 426ada4: 540015c9     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426ada8: 3dc00100     	ldr	q0, [x8]
 426adac: 3c9c03a0     	stur	q0, [x29, #-0x40]
 426adb0: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 426adb4: f90027ff     	str	xzr, [sp, #0x48]
 426adb8: 52800068     	mov	w8, #0x3                ; =3
 426adbc: 39017fe8     	strb	w8, [sp, #0x5f]
 426adc0: 910123e8     	add	x8, sp, #0x48
 426adc4: b2400509     	orr	x9, x8, #0x3
 426adc8: d00464ea     	adrp	x10, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426adcc: 9107bd4a     	add	x10, x10, #0x1ef
 426add0: eb0a013f     	cmp	x9, x10
 426add4: fa4a8102     	ccmp	x8, x10, #0x2, hi
 426add8: 54001429     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426addc: 52800c28     	mov	w8, #0x61               ; =97
 426ade0: 39012be8     	strb	w8, [sp, #0x4a]
 426ade4: 528d2888     	mov	w8, #0x6944             ; =26948
 426ade8: 1400001d     	b	0x426ae5c <_ChromeMain+0x4265bc0>
 426adec: 3900027f     	strb	wzr, [x19]
 426adf0: 3900627f     	strb	wzr, [x19, #0x18]
 426adf4: 1400005f     	b	0x426af70 <_ChromeMain+0x4265cd4>
 426adf8: 52800208     	mov	w8, #0x10               ; =16
 426adfc: 381d73a8     	sturb	w8, [x29, #-0x29]
 426ae00: d10103a9     	sub	x9, x29, #0x40
 426ae04: 9100412a     	add	x10, x9, #0x10
 426ae08: d00464e8     	adrp	x8, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426ae0c: 9105a508     	add	x8, x8, #0x169
 426ae10: eb08015f     	cmp	x10, x8
 426ae14: fa488122     	ccmp	x9, x8, #0x2, hi
 426ae18: 54001229     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426ae1c: 3dc00100     	ldr	q0, [x8]
 426ae20: 3c9c03a0     	stur	q0, [x29, #-0x40]
 426ae24: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 426ae28: f90027ff     	str	xzr, [sp, #0x48]
 426ae2c: 52800068     	mov	w8, #0x3                ; =3
 426ae30: 39017fe8     	strb	w8, [sp, #0x5f]
 426ae34: 910123e8     	add	x8, sp, #0x48
 426ae38: b2400509     	orr	x9, x8, #0x3
 426ae3c: d00464ea     	adrp	x10, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426ae40: 9107614a     	add	x10, x10, #0x1d8
 426ae44: eb0a013f     	cmp	x9, x10
 426ae48: fa4a8102     	ccmp	x8, x10, #0x2, hi
 426ae4c: 54001089     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426ae50: 52800c68     	mov	w8, #0x63               ; =99
 426ae54: 39012be8     	strb	w8, [sp, #0x4a]
 426ae58: 528e4828     	mov	w8, #0x7241             ; =29249
 426ae5c: 790093e8     	strh	w8, [sp, #0x48]
 426ae60: 1400001e     	b	0x426aed8 <_ChromeMain+0x4265c3c>
 426ae64: 52800248     	mov	w8, #0x12               ; =18
 426ae68: 381d73a8     	sturb	w8, [x29, #-0x29]
 426ae6c: d10103a9     	sub	x9, x29, #0x40
 426ae70: 9100492a     	add	x10, x9, #0x12
 426ae74: d00464e8     	adrp	x8, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426ae78: 91068508     	add	x8, x8, #0x1a1
 426ae7c: eb08015f     	cmp	x10, x8
 426ae80: fa488122     	ccmp	x9, x8, #0x2, hi
 426ae84: 54000ec9     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426ae88: 528cace9     	mov	w9, #0x6567             ; =25959
 426ae8c: 781d03a9     	sturh	w9, [x29, #-0x30]
 426ae90: 3dc00100     	ldr	q0, [x8]
 426ae94: 3c9c03a0     	stur	q0, [x29, #-0x40]
 426ae98: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 426ae9c: f90027ff     	str	xzr, [sp, #0x48]
 426aea0: 528000a8     	mov	w8, #0x5                ; =5
 426aea4: 39017fe8     	strb	w8, [sp, #0x5f]
 426aea8: 910123e9     	add	x9, sp, #0x48
 426aeac: aa080128     	orr	x8, x9, x8
 426aeb0: d00464ea     	adrp	x10, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426aeb4: 9107a54a     	add	x10, x10, #0x1e9
 426aeb8: eb0a011f     	cmp	x8, x10
 426aebc: fa4a8122     	ccmp	x9, x10, #0x2, hi
 426aec0: 54000ce9     	b.ls	0x426b05c <_ChromeMain+0x4265dc0>
 426aec4: 52800e88     	mov	w8, #0x74               ; =116
 426aec8: 390133e8     	strb	w8, [sp, #0x4c]
 426aecc: 528de868     	mov	w8, #0x6f43             ; =28483
 426aed0: 72acada8     	movk	w8, #0x656d, lsl #16
 426aed4: b9004be8     	str	w8, [sp, #0x48]
 426aed8: 6f00e400     	movi.2d	v0, #0000000000000000
 426aedc: ad0103e0     	stp	q0, q0, [sp, #0x20]
 426aee0: 90056528     	adrp	x8, 0xef0e000 <dyld_stub_binder+0xef0e000>
 426aee4: 91124108     	add	x8, x8, #0x490
 426aee8: 38bfc108     	ldaprb	w8, [x8]
 426aeec: 36000588     	tbz	w8, #0x0, 0x426af9c <_ChromeMain+0x4265d00>
 426aef0: 389d73a8     	ldursb	x8, [x29, #-0x29]
 426aef4: d10103a9     	sub	x9, x29, #0x40
 426aef8: a97c2faa     	ldp	x10, x11, [x29, #-0x40]
 426aefc: f100011f     	cmp	x8, #0x0
 426af00: 9a894141     	csel	x1, x10, x9, mi
 426af04: 7100011f     	cmp	w8, #0x0
 426af08: 9a884162     	csel	x2, x11, x8, mi
 426af0c: 39817fe8     	ldrsb	x8, [sp, #0x5f]
 426af10: 910123e9     	add	x9, sp, #0x48
 426af14: a944afea     	ldp	x10, x11, [sp, #0x48]
 426af18: f100011f     	cmp	x8, #0x0
 426af1c: 9a894143     	csel	x3, x10, x9, mi
 426af20: 7100011f     	cmp	w8, #0x0
 426af24: 9a884164     	csel	x4, x11, x8, mi
 426af28: 90056520     	adrp	x0, 0xef0e000 <dyld_stub_binder+0xef0e000>
 426af2c: 91122000     	add	x0, x0, #0x488
 426af30: f9400008     	ldr	x8, [x0]
 426af34: f9402d09     	ldr	x9, [x8, #0x58]
 426af38: 910083e8     	add	x8, sp, #0x20
 426af3c: d63f0120     	blr	x9
 426af40: 394083e8     	ldrb	w8, [sp, #0x20]
 426af44: 7100091f     	cmp	w8, #0x2
 426af48: 54000ce2     	b.hs	0x426b0e4 <_ChromeMain+0x4265e48>
 426af4c: 34000408     	cbz	w8, 0x426afcc <_ChromeMain+0x4265d30>
 426af50: 3900027f     	strb	wzr, [x19]
 426af54: 3900627f     	strb	wzr, [x19, #0x18]
 426af58: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 426af5c: 36f800a8     	tbz	w8, #0x1f, 0x426af70 <_ChromeMain+0x4265cd4>
 426af60: f94027e0     	ldr	x0, [sp, #0x48]
 426af64: f9402fe8     	ldr	x8, [sp, #0x58]
 426af68: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426af6c: 96f677d3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426af70: 38dd73a8     	ldursb	w8, [x29, #-0x29]
 426af74: 36f800a8     	tbz	w8, #0x1f, 0x426af88 <_ChromeMain+0x4265cec>
 426af78: f85c03a0     	ldur	x0, [x29, #-0x40]
 426af7c: f85d03a8     	ldur	x8, [x29, #-0x30]
 426af80: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426af84: 96f677cd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426af88: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 426af8c: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 426af90: a94857f6     	ldp	x22, x21, [sp, #0x80]
 426af94: 9102c3ff     	add	sp, sp, #0xb0
 426af98: d65f03c0     	ret
 426af9c: 90056520     	adrp	x0, 0xef0e000 <dyld_stub_binder+0xef0e000>
 426afa0: 91124000     	add	x0, x0, #0x490
 426afa4: 94f66647     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 426afa8: 34fffa40     	cbz	w0, 0x426aef0 <_ChromeMain+0x4265c54>
 426afac: f0050288     	adrp	x8, 0xe2bd000 <dyld_stub_binder+0xe2bd000>
 426afb0: 911e0108     	add	x8, x8, #0x780
 426afb4: 90056529     	adrp	x9, 0xef0e000 <dyld_stub_binder+0xef0e000>
 426afb8: f9024528     	str	x8, [x9, #0x488]
 426afbc: 90056520     	adrp	x0, 0xef0e000 <dyld_stub_binder+0xef0e000>
 426afc0: 91124000     	add	x0, x0, #0x490
 426afc4: 94f68b7c     	bl	0x800ddb4 <_ChromeMain+0x8008b18>
 426afc8: 17ffffca     	b	0x426aef0 <_ChromeMain+0x4265c54>
 426afcc: f9401bf6     	ldr	x22, [sp, #0x30]
 426afd0: 92800208     	mov	x8, #-0x11              ; =-17
 426afd4: f2efffe8     	movk	x8, #0x7fff, lsl #48
 426afd8: eb0802df     	cmp	x22, x8
 426afdc: 540004c2     	b.hs	0x426b074 <_ChromeMain+0x4265dd8>
 426afe0: f94017f4     	ldr	x20, [sp, #0x28]
 426afe4: f1005edf     	cmp	x22, #0x17
 426afe8: 540000a2     	b.hs	0x426affc <_ChromeMain+0x4265d60>
 426afec: 39007ff6     	strb	w22, [sp, #0x1f]
 426aff0: 910023e0     	add	x0, sp, #0x8
 426aff4: b5000136     	cbnz	x22, 0x426b018 <_ChromeMain+0x4265d7c>
 426aff8: 1400000e     	b	0x426b030 <_ChromeMain+0x4265d94>
 426affc: 927ceac8     	and	x8, x22, #0x7ffffffffffffff0
 426b000: 91004115     	add	x21, x8, #0x10
 426b004: aa1503e0     	mov	x0, x21
 426b008: 96f690d8     	bl	0xf368 <_ChromeMain+0xa0cc>
 426b00c: b24102a8     	orr	x8, x21, #0x8000000000000000
 426b010: a900dbe0     	stp	x0, x22, [sp, #0x8]
 426b014: f9000fe8     	str	x8, [sp, #0x18]
 426b018: aa1603e8     	mov	x8, x22
 426b01c: aa1403e9     	mov	x9, x20
 426b020: 3840152a     	ldrb	w10, [x9], #0x1
 426b024: 3800140a     	strb	w10, [x0], #0x1
 426b028: f1000508     	subs	x8, x8, #0x1
 426b02c: 54ffffa1     	b.ne	0x426b020 <_ChromeMain+0x4265d84>
 426b030: 3900001f     	strb	wzr, [x0]
 426b034: 3cc083e0     	ldur	q0, [sp, #0x8]
 426b038: 3d800260     	str	q0, [x19]
 426b03c: f9400fe8     	ldr	x8, [sp, #0x18]
 426b040: f9000a68     	str	x8, [x19, #0x10]
 426b044: 52800028     	mov	w8, #0x1                ; =1
 426b048: 39006268     	strb	w8, [x19, #0x18]
 426b04c: b4fff874     	cbz	x20, 0x426af58 <_ChromeMain+0x4265cbc>
 426b050: cb1403e8     	neg	x8, x20
 426b054: eb0802df     	cmp	x22, x8
 426b058: 54000049     	b.ls	0x426b060 <_ChromeMain+0x4265dc4>
 426b05c: d4200020     	brk	#0x1
 426b060: f9001bff     	str	xzr, [sp, #0x30]
 426b064: f9401fe1     	ldr	x1, [sp, #0x38]
 426b068: aa1403e0     	mov	x0, x20
 426b06c: 96f67793     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426b070: 17ffffba     	b	0x426af58 <_ChromeMain+0x4265cbc>
 426b074: 942654c6     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 426b078: 17fffff9     	b	0x426b05c <_ChromeMain+0x4265dc0>
 426b07c: aa0003f3     	mov	x19, x0
 426b080: 394083e8     	ldrb	w8, [sp, #0x20]
 426b084: 721e791f     	tst	w8, #0xfffffffd
 426b088: 54000121     	b.ne	0x426b0ac <_ChromeMain+0x4265e10>
 426b08c: f94017e0     	ldr	x0, [sp, #0x28]
 426b090: b40000e0     	cbz	x0, 0x426b0ac <_ChromeMain+0x4265e10>
 426b094: f9401be8     	ldr	x8, [sp, #0x30]
 426b098: cb0003e9     	neg	x9, x0
 426b09c: eb09011f     	cmp	x8, x9
 426b0a0: 54fffde8     	b.hi	0x426b05c <_ChromeMain+0x4265dc0>
 426b0a4: 14000013     	b	0x426b0f0 <_ChromeMain+0x4265e54>
 426b0a8: aa0003f3     	mov	x19, x0
 426b0ac: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 426b0b0: 36f800a8     	tbz	w8, #0x1f, 0x426b0c4 <_ChromeMain+0x4265e28>
 426b0b4: f94027e0     	ldr	x0, [sp, #0x48]
 426b0b8: f9402fe8     	ldr	x8, [sp, #0x58]
 426b0bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426b0c0: 96f6777e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426b0c4: 38dd73a8     	ldursb	w8, [x29, #-0x29]
 426b0c8: 36f800a8     	tbz	w8, #0x1f, 0x426b0dc <_ChromeMain+0x4265e40>
 426b0cc: f85c03a0     	ldur	x0, [x29, #-0x40]
 426b0d0: f85d03a8     	ldur	x8, [x29, #-0x30]
 426b0d4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426b0d8: 96f67778     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426b0dc: aa1303e0     	mov	x0, x19
 426b0e0: 94f66109     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 426b0e4: d4200000     	brk	#0
 426b0e8: d4400000     	hlt	#0
 426b0ec: d4200020     	brk	#0x1
 426b0f0: f9001bff     	str	xzr, [sp, #0x30]
 426b0f4: f9401fe1     	ldr	x1, [sp, #0x38]
 426b0f8: 96f67770     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426b0fc: 17ffffec     	b	0x426b0ac <_ChromeMain+0x4265e10>
