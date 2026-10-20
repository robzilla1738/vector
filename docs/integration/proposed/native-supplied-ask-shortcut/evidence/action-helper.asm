
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40df6a8: d102c3ff     	sub	sp, sp, #0xb0
 40df6ac: a90857f6     	stp	x22, x21, [sp, #0x80]
 40df6b0: a9094ff4     	stp	x20, x19, [sp, #0x90]
 40df6b4: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 40df6b8: 910283fd     	add	x29, sp, #0xa0
 40df6bc: aa0203f4     	mov	x20, x2
 40df6c0: aa0003f3     	mov	x19, x0
 40df6c4: b4000281     	cbz	x1, 0x40df714 <_ChromeMain+0x40da478>
 40df6c8: f9403260     	ldr	x0, [x19, #0x60]
 40df6cc: f9404808     	ldr	x8, [x0, #0x90]
 40df6d0: b4000228     	cbz	x8, 0x40df714 <_ChromeMain+0x40da478>
 40df6d4: f9402108     	ldr	x8, [x8, #0x40]
 40df6d8: eb01011f     	cmp	x8, x1
 40df6dc: 540001c0     	b.eq	0x40df714 <_ChromeMain+0x40da478>
 40df6e0: 96fd2088     	bl	0x27900 <_ChromeMain+0x22664>
 40df6e4: 3100041f     	cmn	w0, #0x1
 40df6e8: 54000160     	b.eq	0x40df714 <_ChromeMain+0x40da478>
 40df6ec: aa0003f5     	mov	x21, x0
 40df6f0: f9403276     	ldr	x22, [x19, #0x60]
 40df6f4: d0055688     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40df6f8: f9468d08     	ldr	x8, [x8, #0xd18]
 40df6fc: d63f0100     	blr	x8
 40df700: aa0003e3     	mov	x3, x0
 40df704: aa1603e0     	mov	x0, x22
 40df708: aa1503e1     	mov	x1, x21
 40df70c: 528000c2     	mov	w2, #0x6                ; =6
 40df710: 94f1c0f6     	bl	0x7d4fae8 <_ChromeMain+0x7d4a84c>
 40df714: f940be68     	ldr	x8, [x19, #0x178]
 40df718: f941c908     	ldr	x8, [x8, #0x390]
 40df71c: b4000668     	cbz	x8, 0x40df7e8 <_ChromeMain+0x40da54c>
 40df720: d0053be1     	adrp	x1, 0xe85d000 <dyld_stub_binder+0xe85d000>
 40df724: 911f4021     	add	x1, x1, #0x7d0
 40df728: 91056100     	add	x0, x8, #0x158
 40df72c: 9700d3e0     	bl	0x1146ac <_ChromeMain+0x10f410>
 40df730: aa0003f3     	mov	x19, x0
 40df734: f9003bff     	str	xzr, [sp, #0x70]
 40df738: 6f00e400     	movi.2d	v0, #0000000000000000
 40df73c: ad0283e0     	stp	q0, q0, [sp, #0x50]
 40df740: 39c05e88     	ldrsb	w8, [x20, #0x17]
 40df744: 37f800c8     	tbnz	w8, #0x1f, 0x40df75c <_ChromeMain+0x40da4c0>
 40df748: 3dc00280     	ldr	q0, [x20]
 40df74c: 3d800fe0     	str	q0, [sp, #0x30]
 40df750: f9400a88     	ldr	x8, [x20, #0x10]
 40df754: f90023e8     	str	x8, [sp, #0x40]
 40df758: 14000004     	b	0x40df768 <_ChromeMain+0x40da4cc>
 40df75c: a9400a81     	ldp	x1, x2, [x20]
 40df760: 9100c3e0     	add	x0, sp, #0x30
 40df764: 96fce2ad     	bl	0x18218 <_ChromeMain+0x12f7c>
 40df768: 910143f4     	add	x20, sp, #0x50
 40df76c: 910143e0     	add	x0, sp, #0x50
 40df770: 9100c3e2     	add	x2, sp, #0x30
 40df774: 528002e1     	mov	w1, #0x17               ; =23
 40df778: 94cf215f     	bl	0x74a7cf4 <_ChromeMain+0x74a2a58>
 40df77c: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 40df780: 36f800a8     	tbz	w8, #0x1f, 0x40df794 <_ChromeMain+0x40da4f8>
 40df784: f9401be0     	ldr	x0, [sp, #0x30]
 40df788: f94023e8     	ldr	x8, [sp, #0x40]
 40df78c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40df790: 96fca5ca     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40df794: b94053e8     	ldr	w8, [sp, #0x50]
 40df798: b9000be8     	str	w8, [sp, #0x8]
 40df79c: 390043ff     	strb	wzr, [sp, #0x10]
 40df7a0: 3900a3ff     	strb	wzr, [sp, #0x28]
 40df7a4: 3941c3e8     	ldrb	w8, [sp, #0x70]
 40df7a8: 37000248     	tbnz	w8, #0x0, 0x40df7f0 <_ChromeMain+0x40da554>
 40df7ac: f9400268     	ldr	x8, [x19]
 40df7b0: f9401d08     	ldr	x8, [x8, #0x38]
 40df7b4: 910023e1     	add	x1, sp, #0x8
 40df7b8: aa1303e0     	mov	x0, x19
 40df7bc: 52800242     	mov	w2, #0x12               ; =18
 40df7c0: d63f0100     	blr	x8
 40df7c4: 3940a3e8     	ldrb	w8, [sp, #0x28]
 40df7c8: 35000328     	cbnz	w8, 0x40df82c <_ChromeMain+0x40da590>
 40df7cc: 3941c3e8     	ldrb	w8, [sp, #0x70]
 40df7d0: 370003c8     	tbnz	w8, #0x0, 0x40df848 <_ChromeMain+0x40da5ac>
 40df7d4: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 40df7d8: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 40df7dc: a94857f6     	ldp	x22, x21, [sp, #0x80]
 40df7e0: 9102c3ff     	add	sp, sp, #0xb0
 40df7e4: d65f03c0     	ret
 40df7e8: d2800013     	mov	x19, #0x0               ; =0
 40df7ec: 17ffffd2     	b	0x40df734 <_ChromeMain+0x40da498>
 40df7f0: 910023e8     	add	x8, sp, #0x8
 40df7f4: 39c1bfe9     	ldrsb	w9, [sp, #0x6f]
 40df7f8: 37f80129     	tbnz	w9, #0x1f, 0x40df81c <_ChromeMain+0x40da580>
 40df7fc: b27d0289     	orr	x9, x20, #0x8
 40df800: 3dc00120     	ldr	q0, [x9]
 40df804: 3c808100     	stur	q0, [x8, #0x8]
 40df808: f9400929     	ldr	x9, [x9, #0x10]
 40df80c: f8018109     	stur	x9, [x8, #0x18]
 40df810: 52800028     	mov	w8, #0x1                ; =1
 40df814: 3900a3e8     	strb	w8, [sp, #0x28]
 40df818: 17ffffe5     	b	0x40df7ac <_ChromeMain+0x40da510>
 40df81c: a9458be1     	ldp	x1, x2, [sp, #0x58]
 40df820: 91002100     	add	x0, x8, #0x8
 40df824: 96fce27d     	bl	0x18218 <_ChromeMain+0x12f7c>
 40df828: 17fffffa     	b	0x40df810 <_ChromeMain+0x40da574>
 40df82c: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 40df830: 36fffce8     	tbz	w8, #0x1f, 0x40df7cc <_ChromeMain+0x40da530>
 40df834: f9400be0     	ldr	x0, [sp, #0x10]
 40df838: f94013e8     	ldr	x8, [sp, #0x20]
 40df83c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40df840: 96fca59e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40df844: 17ffffe2     	b	0x40df7cc <_ChromeMain+0x40da530>
 40df848: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 40df84c: 36fffc48     	tbz	w8, #0x1f, 0x40df7d4 <_ChromeMain+0x40da538>
 40df850: f9402fe0     	ldr	x0, [sp, #0x58]
 40df854: f94037e8     	ldr	x8, [sp, #0x68]
 40df858: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40df85c: 96fca597     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40df860: 17ffffdd     	b	0x40df7d4 <_ChromeMain+0x40da538>
 40df864: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 40df868: a9017bfd     	stp	x29, x30, [sp, #0x10]
 40df86c: 910043fd     	add	x29, sp, #0x10
 40df870: aa0003f3     	mov	x19, x0
 40df874: 900505e8     	adrp	x8, 0xe19b000 <dyld_stub_binder+0xe19b000>
 40df878: 9122e108     	add	x8, x8, #0x8b8
 40df87c: f9000008     	str	x8, [x0]
 40df880: f9400400     	ldr	x0, [x0, #0x8]
 40df884: b40002e0     	cbz	x0, 0x40df8e0 <_ChromeMain+0x40da644>
 40df888: f0053cc1     	adrp	x1, 0xe87a000 <dyld_stub_binder+0xe87a000>
 40df88c: 91370021     	add	x1, x1, #0xdc0
 40df890: 975ae1cc     	bl	0x1797fc0 <_ChromeMain+0x1792d24>
 40df894: f9400a60     	ldr	x0, [x19, #0x10]
 40df898: 925e7408     	and	x8, x0, #0xfffffffc00000000
 40df89c: f0055694     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40df8a0: f9404689     	ldr	x9, [x20, #0x88]
 40df8a4: eb09011f     	cmp	x8, x9
 40df8a8: 54000041     	b.ne	0x40df8b0 <_ChromeMain+0x40da614>
 40df8ac: 96fd0c64     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40df8b0: f9000a7f     	str	xzr, [x19, #0x10]
 40df8b4: f9400660     	ldr	x0, [x19, #0x8]
 40df8b8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 40df8bc: f9404689     	ldr	x9, [x20, #0x88]
 40df8c0: eb09011f     	cmp	x8, x9
 40df8c4: 54000041     	b.ne	0x40df8cc <_ChromeMain+0x40da630>
 40df8c8: 96fd0c5d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40df8cc: f900067f     	str	xzr, [x19, #0x8]
 40df8d0: aa1303e0     	mov	x0, x19
 40df8d4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 40df8d8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 40df8dc: d65f03c0     	ret
 40df8e0: d4200000     	brk	#0
 40df8e4: d4400000     	hlt	#0
 40df8e8: d4200020     	brk	#0x1
		...
 40df900: d10243ff     	sub	sp, sp, #0x90
 40df904: a9036ffc     	stp	x28, x27, [sp, #0x30]
 40df908: a90467fa     	stp	x26, x25, [sp, #0x40]
 40df90c: a9055ff8     	stp	x24, x23, [sp, #0x50]
 40df910: a90657f6     	stp	x22, x21, [sp, #0x60]
 40df914: a9074ff4     	stp	x20, x19, [sp, #0x70]
 40df918: a9087bfd     	stp	x29, x30, [sp, #0x80]
 40df91c: 910203fd     	add	x29, sp, #0x80
 40df920: aa0303f6     	mov	x22, x3
 40df924: aa0203f7     	mov	x23, x2
 40df928: aa0103f5     	mov	x21, x1
 40df92c: aa0003f3     	mov	x19, x0
 40df930: 97b72f17     	bl	0x2eab58c <_ChromeMain+0x2ea62f0>
 40df934: d0052588     	adrp	x8, 0xe591000 <dyld_stub_binder+0xe591000>
 40df938: 912dc108     	add	x8, x8, #0xb70
 40df93c: 9110c109     	add	x9, x8, #0x430
 40df940: a9002408     	stp	x8, x9, [x0]
 40df944: 91116109     	add	x9, x8, #0x458
 40df948: f9000809     	str	x9, [x0, #0x10]
 40df94c: 91124109     	add	x9, x8, #0x490
 40df950: 9113010a     	add	x10, x8, #0x4c0
 40df954: a906a809     	stp	x9, x10, [x0, #0x68]
 40df958: 91144109     	add	x9, x8, #0x510
 40df95c: f9005809     	str	x9, [x0, #0xb0]
 40df960: 9115c109     	add	x9, x8, #0x570
 40df964: aa0003fc     	mov	x28, x0
 40df968: f80d8f89     	str	x9, [x28, #0xd8]!
 40df96c: 91168109     	add	x9, x8, #0x5a0
 40df970: f9007c09     	str	x9, [x0, #0xf8]
 40df974: 91172109     	add	x9, x8, #0x5c8
 40df978: f9018809     	str	x9, [x0, #0x310]
 40df97c: 91180109     	add	x9, x8, #0x600
 40df980: f9018c09     	str	x9, [x0, #0x318]
 40df984: 9118e108     	add	x8, x8, #0x638
 40df988: f9021808     	str	x8, [x0, #0x430]
 40df98c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 40df990: f005569a     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40df994: f9404749     	ldr	x9, [x26, #0x88]
 40df998: eb09011f     	cmp	x8, x9
 40df99c: 54000061     	b.ne	0x40df9a8 <_ChromeMain+0x40da70c>
 40df9a0: aa1503e0     	mov	x0, x21
 40df9a4: 96fcd256     	bl	0x142fc <_ChromeMain+0xf060>
 40df9a8: f9021e75     	str	x21, [x19, #0x438]
 40df9ac: 39110276     	strb	w22, [x19, #0x440]
 40df9b0: b9044677     	str	w23, [x19, #0x444]
 40df9b4: f902267f     	str	xzr, [x19, #0x448]
 40df9b8: 6f00e400     	movi.2d	v0, #0000000000000000
 40df9bc: 3d811660     	str	q0, [x19, #0x450]
 40df9c0: 12800008     	mov	w8, #-0x1               ; =-1
 40df9c4: b9046268     	str	w8, [x19, #0x460]
 40df9c8: 7908ca7f     	strh	wzr, [x19, #0x464]
 40df9cc: 39119a7f     	strb	wzr, [x19, #0x466]
 40df9d0: 3911a27f     	strb	wzr, [x19, #0x468]
 40df9d4: 3911e27f     	strb	wzr, [x19, #0x478]
 40df9d8: 9111f268     	add	x8, x19, #0x47c
 40df9dc: 3912327f     	strb	wzr, [x19, #0x48c]
 40df9e0: 3d800100     	str	q0, [x8]
 40df9e4: 90050ec8     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 40df9e8: 913c2108     	add	x8, x8, #0xf08
 40df9ec: f9024e68     	str	x8, [x19, #0x498]
 40df9f0: 52800100     	mov	w0, #0x8                ; =8
 40df9f4: 96fcbe5d     	bl	0xf368 <_ChromeMain+0xa0cc>
 40df9f8: b900001f     	str	wzr, [x0]
 40df9fc: 3900101f     	strb	wzr, [x0, #0x4]
 40dfa00: b40000c0     	cbz	x0, 0x40dfa18 <_ChromeMain+0x40da77c>
 40dfa04: 52800028     	mov	w8, #0x1                ; =1
 40dfa08: b8280008     	ldadd	w8, w8, [x0]
 40dfa0c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40dfa10: 6b09011f     	cmp	w8, w9
 40dfa14: 54003ec0     	b.eq	0x40e01ec <_ChromeMain+0x40daf50>
 40dfa18: 91126268     	add	x8, x19, #0x498
 40dfa1c: d28002f4     	mov	x20, #0x17              ; =23
 40dfa20: f2c00034     	movk	x20, #0x1, lsl #32
 40dfa24: f9025260     	str	x0, [x19, #0x4a0]
 40dfa28: f9025668     	str	x8, [x19, #0x4a8]
 40dfa2c: 90051048     	adrp	x8, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 40dfa30: 91124108     	add	x8, x8, #0x490
 40dfa34: f9024e68     	str	x8, [x19, #0x498]
 40dfa38: f9025a7f     	str	xzr, [x19, #0x4b0]
 40dfa3c: f902627f     	str	xzr, [x19, #0x4c0]
 40dfa40: b904ca7f     	str	wzr, [x19, #0x4c8]
 40dfa44: 9113a268     	add	x8, x19, #0x4e8
 40dfa48: 6f00e400     	movi.2d	v0, #0000000000000000
 40dfa4c: 3d800100     	str	q0, [x8]
 40dfa50: 3d813660     	str	q0, [x19, #0x4d0]
 40dfa54: f9027268     	str	x8, [x19, #0x4e0]
 40dfa58: f9429ea8     	ldr	x8, [x21, #0x538]
 40dfa5c: f9403500     	ldr	x0, [x8, #0x68]
 40dfa60: f9400008     	ldr	x8, [x0]
 40dfa64: f940b508     	ldr	x8, [x8, #0x168]
 40dfa68: d63f0100     	blr	x8
 40dfa6c: aa0003f6     	mov	x22, x0
 40dfa70: b9444668     	ldr	w8, [x19, #0x444]
 40dfa74: 7100051f     	cmp	w8, #0x1
 40dfa78: 540001e1     	b.ne	0x40dfab4 <_ChromeMain+0x40da818>
 40dfa7c: f9429ea8     	ldr	x8, [x21, #0x538]
 40dfa80: f940d108     	ldr	x8, [x8, #0x1a0]
 40dfa84: f941c908     	ldr	x8, [x8, #0x390]
 40dfa88: b4000168     	cbz	x8, 0x40dfab4 <_ChromeMain+0x40da818>
 40dfa8c: d0053be1     	adrp	x1, 0xe85d000 <dyld_stub_binder+0xe85d000>
 40dfa90: 911f4021     	add	x1, x1, #0x7d0
 40dfa94: 91056100     	add	x0, x8, #0x158
 40dfa98: 9700d305     	bl	0x1146ac <_ChromeMain+0x10f410>
 40dfa9c: b40000c0     	cbz	x0, 0x40dfab4 <_ChromeMain+0x40da818>
 40dfaa0: 52800037     	mov	w23, #0x1               ; =1
 40dfaa4: 52800021     	mov	w1, #0x1                ; =1
 40dfaa8: 97441914     	bl	0x11e5ef8 <_ChromeMain+0x11e0c5c>
 40dfaac: eb14001f     	cmp	x0, x20
 40dfab0: 54000180     	b.eq	0x40dfae0 <_ChromeMain+0x40da844>
 40dfab4: 90047001     	adrp	x1, 0xcedf000 <dyld_stub_binder+0xcedf000>
 40dfab8: 91063c21     	add	x1, x1, #0x18f
 40dfabc: aa1603e0     	mov	x0, x22
 40dfac0: 528003c2     	mov	w2, #0x1e               ; =30
 40dfac4: 96ff1211     	bl	0xa4308 <_ChromeMain+0x9f06c>
 40dfac8: 90047001     	adrp	x1, 0xcedf000 <dyld_stub_binder+0xcedf000>
 40dfacc: 9104c021     	add	x1, x1, #0x130
 40dfad0: aa1603e0     	mov	x0, x22
 40dfad4: 52800362     	mov	w2, #0x1b               ; =27
 40dfad8: 97089a8a     	bl	0x306500 <_ChromeMain+0x301264>
 40dfadc: aa0003f7     	mov	x23, x0
 40dfae0: b9049277     	str	w23, [x19, #0x490]
 40dfae4: f005715b     	adrp	x27, 0xef0a000 <dyld_stub_binder+0xef0a000>
 40dfae8: 9112037b     	add	x27, x27, #0x480
 40dfaec: f8bfc360     	ldapr	x0, [x27]
 40dfaf0: b4003580     	cbz	x0, 0x40e01a0 <_ChromeMain+0x40daf04>
 40dfaf4: 52806801     	mov	w1, #0x340              ; =832
 40dfaf8: d2800002     	mov	x2, #0x0                ; =0
 40dfafc: 96ff2ead     	bl	0xab5b0 <_ChromeMain+0xa6314>
 40dfb00: aa0003f6     	mov	x22, x0
 40dfb04: 974a3d8f     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 40dfb08: 910c4019     	add	x25, x0, #0x310
 40dfb0c: f0052588     	adrp	x8, 0xe592000 <dyld_stub_binder+0xe592000>
 40dfb10: 91074108     	add	x8, x8, #0x1d0
 40dfb14: 910fe109     	add	x9, x8, #0x3f8
 40dfb18: a9002408     	stp	x8, x9, [x0]
 40dfb1c: 91108109     	add	x9, x8, #0x420
 40dfb20: f9000809     	str	x9, [x0, #0x10]
 40dfb24: 91116109     	add	x9, x8, #0x458
 40dfb28: 9114e10a     	add	x10, x8, #0x538
 40dfb2c: aa0003f7     	mov	x23, x0
 40dfb30: f80d8eea     	str	x10, [x23, #0xd8]!
 40dfb34: 9112210a     	add	x10, x8, #0x488
 40dfb38: a906a809     	stp	x9, x10, [x0, #0x68]
 40dfb3c: 9115a109     	add	x9, x8, #0x568
 40dfb40: aa0003f8     	mov	x24, x0
 40dfb44: f80f8f09     	str	x9, [x24, #0xf8]!
 40dfb48: 91136109     	add	x9, x8, #0x4d8
 40dfb4c: f9005809     	str	x9, [x0, #0xb0]
 40dfb50: 91164108     	add	x8, x8, #0x590
 40dfb54: f9018808     	str	x8, [x0, #0x310]
 40dfb58: f9404748     	ldr	x8, [x26, #0x88]
 40dfb5c: 925e76a9     	and	x9, x21, #0xfffffffc00000000
 40dfb60: eb08013f     	cmp	x9, x8
 40dfb64: 54000081     	b.ne	0x40dfb74 <_ChromeMain+0x40da8d8>
 40dfb68: aa1503e0     	mov	x0, x21
 40dfb6c: 96fcd1e4     	bl	0x142fc <_ChromeMain+0xf060>
 40dfb70: f9404748     	ldr	x8, [x26, #0x88]
 40dfb74: f9018ed5     	str	x21, [x22, #0x318]
 40dfb78: 790642df     	strh	wzr, [x22, #0x320]
 40dfb7c: 925e7729     	and	x9, x25, #0xfffffffc00000000
 40dfb80: eb08013f     	cmp	x9, x8
 40dfb84: 54000061     	b.ne	0x40dfb90 <_ChromeMain+0x40da8f4>
 40dfb88: 910c42c0     	add	x0, x22, #0x310
 40dfb8c: 96fcd1dc     	bl	0x142fc <_ChromeMain+0xf060>
 40dfb90: f90196d9     	str	x25, [x22, #0x328]
 40dfb94: 6f00e400     	movi.2d	v0, #0000000000000000
 40dfb98: 3d80cec0     	str	q0, [x22, #0x330]
 40dfb9c: 394822c8     	ldrb	w8, [x22, #0x208]
 40dfba0: 37000168     	tbnz	w8, #0x0, 0x40dfbcc <_ChromeMain+0x40da930>
 40dfba4: 52800028     	mov	w8, #0x1                ; =1
 40dfba8: 390822c8     	strb	w8, [x22, #0x208]
 40dfbac: aa1603e0     	mov	x0, x22
 40dfbb0: 97a3e084     	bl	0x29d7dc0 <_ChromeMain+0x29d2b24>
 40dfbb4: aa1603e0     	mov	x0, x22
 40dfbb8: 52800001     	mov	w1, #0x0                ; =0
 40dfbbc: 9715422e     	bl	0x630474 <_ChromeMain+0x62b1d8>
 40dfbc0: 910822c1     	add	x1, x22, #0x208
 40dfbc4: aa1803e0     	mov	x0, x24
 40dfbc8: 97392102     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 40dfbcc: 910cc2d9     	add	x25, x22, #0x330
 40dfbd0: 52800800     	mov	w0, #0x40               ; =64
 40dfbd4: 96fcbde5     	bl	0xf368 <_ChromeMain+0xa0cc>
 40dfbd8: 52800028     	mov	w8, #0x1                ; =1
 40dfbdc: b9000008     	str	w8, [x0]
 40dfbe0: 90fe7a48     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 40dfbe4: 91260108     	add	x8, x8, #0x980
 40dfbe8: f0fe1089     	adrp	x9, 0x2f2000 <_ChromeMain+0x2ecd64>
 40dfbec: 91220129     	add	x9, x9, #0x880
 40dfbf0: a900a408     	stp	x8, x9, [x0, #0x8]
 40dfbf4: d0ff23e9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 40dfbf8: 912c0129     	add	x9, x9, #0xb00
 40dfbfc: f0ffd228     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 40dfc00: 91310108     	add	x8, x8, #0xc40
 40dfc04: a901a009     	stp	x9, x8, [x0, #0x18]
 40dfc08: 9004f308     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 40dfc0c: 3dc3d900     	ldr	q0, [x8, #0xf60]
 40dfc10: 3c828000     	stur	q0, [x0, #0x28]
 40dfc14: 3900e01f     	strb	wzr, [x0, #0x38]
 40dfc18: f90003e0     	str	x0, [sp]
 40dfc1c: 0f000420     	movi.2s	v0, #0x1
 40dfc20: fd0007e0     	str	d0, [sp, #0x8]
 40dfc24: 52800068     	mov	w8, #0x3                ; =3
 40dfc28: b90013e8     	str	w8, [sp, #0x10]
 40dfc2c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 40dfc30: f9000fff     	str	xzr, [sp, #0x18]
 40dfc34: d0054921     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 40dfc38: 91152021     	add	x1, x1, #0x548
 40dfc3c: 910003e2     	mov	x2, sp
 40dfc40: aa1703e0     	mov	x0, x23
 40dfc44: 976cd1d2     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 40dfc48: 910003e0     	mov	x0, sp
 40dfc4c: 9759ac36     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 40dfc50: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 40dfc54: f9404749     	ldr	x9, [x26, #0x88]
 40dfc58: eb09011f     	cmp	x8, x9
 40dfc5c: 54000061     	b.ne	0x40dfc68 <_ChromeMain+0x40da9cc>
 40dfc60: aa1603e0     	mov	x0, x22
 40dfc64: 96fcd1a6     	bl	0x142fc <_ChromeMain+0xf060>
 40dfc68: f9400320     	ldr	x0, [x25]
 40dfc6c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 40dfc70: f9404749     	ldr	x9, [x26, #0x88]
 40dfc74: eb09011f     	cmp	x8, x9
 40dfc78: 54002980     	b.eq	0x40e01a8 <_ChromeMain+0x40daf0c>
 40dfc7c: f9019ad6     	str	x22, [x22, #0x330]
