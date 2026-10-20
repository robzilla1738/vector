
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4594700: d101c3ff     	sub	sp, sp, #0x70
 4594704: a9016ffc     	stp	x28, x27, [sp, #0x10]
 4594708: a90267fa     	stp	x26, x25, [sp, #0x20]
 459470c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4594710: a90457f6     	stp	x22, x21, [sp, #0x40]
 4594714: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4594718: a9067bfd     	stp	x29, x30, [sp, #0x60]
 459471c: 910183fd     	add	x29, sp, #0x60
 4594720: f0054a28     	adrp	x8, 0xeedb000 <dyld_stub_binder+0xeedb000>
 4594724: 91198108     	add	x8, x8, #0x660
 4594728: 38bfc108     	ldaprb	w8, [x8]
 459472c: 36000128     	tbz	w8, #0x0, 0x4594750 <_ChromeMain+0x458f4b4>
 4594730: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4594734: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4594738: a94457f6     	ldp	x22, x21, [sp, #0x40]
 459473c: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4594740: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4594744: a9416ffc     	ldp	x28, x27, [sp, #0x10]
 4594748: 9101c3ff     	add	sp, sp, #0x70
 459474c: d65f03c0     	ret
 4594750: f0054a33     	adrp	x19, 0xeedb000 <dyld_stub_binder+0xeedb000>
 4594754: 91198273     	add	x19, x19, #0x660
 4594758: aa1303e0     	mov	x0, x19
 459475c: 94e9c059     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 4594760: 34fffe80     	cbz	w0, 0x4594730 <_ChromeMain+0x458f494>
 4594764: d0055135     	adrp	x21, 0xefba000 <dyld_stub_binder+0xefba000>
 4594768: 913d82b5     	add	x21, x21, #0xf60
 459476c: 9004fb88     	adrp	x8, 0xe504000 <dyld_stub_binder+0xe504000>
 4594770: 911b4108     	add	x8, x8, #0x6d0
 4594774: f004e914     	adrp	x20, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 4594778: 913c2294     	add	x20, x20, #0xf08
 459477c: a90052a8     	stp	x8, x20, [x21]
 4594780: 52800100     	mov	w0, #0x8                ; =8
 4594784: 96e9eaf9     	bl	0xf368 <_ChromeMain+0xa0cc>
 4594788: b900001f     	str	wzr, [x0]
 459478c: 3900101f     	strb	wzr, [x0, #0x4]
 4594790: b40000c0     	cbz	x0, 0x45947a8 <_ChromeMain+0x458f50c>
 4594794: 52800028     	mov	w8, #0x1                ; =1
 4594798: b8280008     	ldadd	w8, w8, [x0]
 459479c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45947a0: 6b09011f     	cmp	w8, w9
 45947a4: 54001820     	b.eq	0x4594aa8 <_ChromeMain+0x458f80c>
 45947a8: 9004fb88     	adrp	x8, 0xe504000 <dyld_stub_binder+0xe504000>
 45947ac: 91194108     	add	x8, x8, #0x650
 45947b0: 9100e109     	add	x9, x8, #0x38
 45947b4: aa1503ea     	mov	x10, x21
 45947b8: f8008d49     	str	x9, [x10, #0x8]!
 45947bc: a9012aa0     	stp	x0, x10, [x21, #0x10]
 45947c0: f90002a8     	str	x8, [x21]
 45947c4: 390082bf     	strb	wzr, [x21, #0x20]
 45947c8: 790052bf     	strh	wzr, [x21, #0x28]
 45947cc: 2905febf     	stp	wzr, wzr, [x21, #0x2c]
 45947d0: f9001ebf     	str	xzr, [x21, #0x38]
 45947d4: 390102bf     	strb	wzr, [x21, #0x40]
 45947d8: 12800008     	mov	w8, #-0x1               ; =-1
 45947dc: b90046a8     	str	w8, [x21, #0x44]
 45947e0: 925e7548     	and	x8, x10, #0xfffffffc00000000
 45947e4: a904febf     	stp	xzr, xzr, [x21, #0x48]
 45947e8: d00530f6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45947ec: f94046c9     	ldr	x9, [x22, #0x88]
 45947f0: eb09011f     	cmp	x8, x9
 45947f4: 54000081     	b.ne	0x4594804 <_ChromeMain+0x458f568>
 45947f8: d0055120     	adrp	x0, 0xefba000 <dyld_stub_binder+0xefba000>
 45947fc: 913da000     	add	x0, x0, #0xf68
 4594800: 96e9febf     	bl	0x142fc <_ChromeMain+0xf060>
 4594804: d0055128     	adrp	x8, 0xefba000 <dyld_stub_binder+0xefba000>
 4594808: 913da108     	add	x8, x8, #0xf68
 459480c: a9057d08     	stp	x8, xzr, [x8, #0x50]
 4594810: f9003114     	str	x20, [x8, #0x60]
 4594814: 52800100     	mov	w0, #0x8                ; =8
 4594818: 96e9ead4     	bl	0xf368 <_ChromeMain+0xa0cc>
 459481c: b900001f     	str	wzr, [x0]
 4594820: 3900101f     	strb	wzr, [x0, #0x4]
 4594824: b40000c0     	cbz	x0, 0x459483c <_ChromeMain+0x458f5a0>
 4594828: 52800028     	mov	w8, #0x1                ; =1
 459482c: b8280008     	ldadd	w8, w8, [x0]
 4594830: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4594834: 6b09011f     	cmp	w8, w9
 4594838: 540013e0     	b.eq	0x4594ab4 <_ChromeMain+0x458f818>
 459483c: f004ea88     	adrp	x8, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 4594840: 91124108     	add	x8, x8, #0x490
 4594844: aa1503e9     	mov	x9, x21
 4594848: f8068d28     	str	x8, [x9, #0x68]!
 459484c: a90726a0     	stp	x0, x9, [x21, #0x70]
 4594850: f90042bf     	str	xzr, [x21, #0x80]
 4594854: f9004abf     	str	xzr, [x21, #0x90]
 4594858: 925e76b9     	and	x25, x21, #0xfffffffc00000000
 459485c: f94046c8     	ldr	x8, [x22, #0x88]
 4594860: eb08033f     	cmp	x25, x8
 4594864: 54000081     	b.ne	0x4594874 <_ChromeMain+0x458f5d8>
 4594868: d0055120     	adrp	x0, 0xefba000 <dyld_stub_binder+0xefba000>
 459486c: 913d8000     	add	x0, x0, #0xf60
 4594870: 96e9fea3     	bl	0x142fc <_ChromeMain+0xf060>
 4594874: 52800700     	mov	w0, #0x38               ; =56
 4594878: 96e9eabc     	bl	0xf368 <_ChromeMain+0xa0cc>
 459487c: 52800037     	mov	w23, #0x1               ; =1
 4594880: b9000017     	str	w23, [x0]
 4594884: f0ffd0e8     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 4594888: 91300108     	add	x8, x8, #0xc00
 459488c: b0ff9829     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 4594890: 912d0129     	add	x9, x9, #0xb40
 4594894: a900a408     	stp	x8, x9, [x0, #0x8]
 4594898: b0fefe58     	adrp	x24, 0x255d000 <_ChromeMain+0x2557d64>
 459489c: 912c0318     	add	x24, x24, #0xb00
 45948a0: 10026b68     	adr	x8, 0x459960c <_ChromeMain+0x4594370>
 45948a4: d503201f     	nop
 45948a8: a901a018     	stp	x24, x8, [x0, #0x18]
 45948ac: a902d41f     	stp	xzr, x21, [x0, #0x28]
 45948b0: 910262a8     	add	x8, x21, #0x98
 45948b4: 97ab13be     	bl	0x30597ac <_ChromeMain+0x3054510>
 45948b8: d0054a88     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 45948bc: f9467d08     	ldr	x8, [x8, #0xcf8]
 45948c0: b4000ae8     	cbz	x8, 0x4594a1c <_ChromeMain+0x458f780>
 45948c4: f9401d14     	ldr	x20, [x8, #0x38]
 45948c8: b4000ab4     	cbz	x20, 0x4594a1c <_ChromeMain+0x458f780>
 45948cc: 925e7689     	and	x9, x20, #0xfffffffc00000000
 45948d0: f94046c8     	ldr	x8, [x22, #0x88]
 45948d4: eb08013f     	cmp	x9, x8
 45948d8: 54000081     	b.ne	0x45948e8 <_ChromeMain+0x458f64c>
 45948dc: aa1403e0     	mov	x0, x20
 45948e0: 96e9fe87     	bl	0x142fc <_ChromeMain+0xf060>
 45948e4: f94046c8     	ldr	x8, [x22, #0x88]
 45948e8: d005513a     	adrp	x26, 0xefba000 <dyld_stub_binder+0xefba000>
 45948ec: f947fb40     	ldr	x0, [x26, #0xff0]
 45948f0: 925e7409     	and	x9, x0, #0xfffffffc00000000
 45948f4: eb08013f     	cmp	x9, x8
 45948f8: 54000c20     	b.eq	0x4594a7c <_ChromeMain+0x458f7e0>
 45948fc: f907fb54     	str	x20, [x26, #0xff0]
 4594900: eb08033f     	cmp	x25, x8
 4594904: 54000081     	b.ne	0x4594914 <_ChromeMain+0x458f678>
 4594908: d0055120     	adrp	x0, 0xefba000 <dyld_stub_binder+0xefba000>
 459490c: 913d8000     	add	x0, x0, #0xf60
 4594910: 96e9fe7b     	bl	0x142fc <_ChromeMain+0xf060>
 4594914: 52800700     	mov	w0, #0x38               ; =56
 4594918: 96e9ea94     	bl	0xf368 <_ChromeMain+0xa0cc>
 459491c: 5280003b     	mov	w27, #0x1               ; =1
 4594920: b900001b     	str	w27, [x0]
 4594924: b0ffcd3c     	adrp	x28, 0x3f39000 <_ChromeMain+0x3f33d64>
 4594928: 913a039c     	add	x28, x28, #0xe80
 459492c: b0ff983a     	adrp	x26, 0x3899000 <_ChromeMain+0x3893d64>
 4594930: 912d035a     	add	x26, x26, #0xb40
 4594934: a900e81c     	stp	x28, x26, [x0, #0x8]
 4594938: 10026ba8     	adr	x8, 0x45996ac <_ChromeMain+0x4594410>
 459493c: d503201f     	nop
 4594940: a901a018     	stp	x24, x8, [x0, #0x18]
 4594944: a902d41f     	stp	xzr, x21, [x0, #0x28]
 4594948: b4000ca0     	cbz	x0, 0x4594adc <_ChromeMain+0x458f840>
 459494c: aa0003f4     	mov	x20, x0
 4594950: 52800600     	mov	w0, #0x30               ; =48
 4594954: 96e9ea85     	bl	0xf368 <_ChromeMain+0xa0cc>
 4594958: aa0003e3     	mov	x3, x0
 459495c: b900001b     	str	w27, [x0]
 4594960: 90fefb88     	adrp	x8, 0x2504000 <_ChromeMain+0x24fed64>
 4594964: 91117109     	add	x9, x8, #0x45c
 4594968: 90ff9828     	adrp	x8, 0x3898000 <_ChromeMain+0x3892d64>
 459496c: 91070108     	add	x8, x8, #0x1c0
 4594970: a900a009     	stp	x9, x8, [x0, #0x8]
 4594974: f9000c18     	str	x24, [x0, #0x18]
 4594978: f9001414     	str	x20, [x0, #0x28]
 459497c: d0055120     	adrp	x0, 0xefba000 <dyld_stub_binder+0xefba000>
 4594980: 913f2000     	add	x0, x0, #0xfc8
 4594984: 90044b01     	adrp	x1, 0xcef4000 <dyld_stub_binder+0xcef4000>
 4594988: 91354421     	add	x1, x1, #0xd51
 459498c: 52800322     	mov	w2, #0x19               ; =25
 4594990: 972d58a8     	bl	0x10eac30 <_ChromeMain+0x10e5994>
 4594994: f94046c8     	ldr	x8, [x22, #0x88]
 4594998: eb08033f     	cmp	x25, x8
 459499c: 54000081     	b.ne	0x45949ac <_ChromeMain+0x458f710>
 45949a0: d0055120     	adrp	x0, 0xefba000 <dyld_stub_binder+0xefba000>
 45949a4: 913d8000     	add	x0, x0, #0xf60
 45949a8: 96e9fe55     	bl	0x142fc <_ChromeMain+0xf060>
 45949ac: 52800700     	mov	w0, #0x38               ; =56
 45949b0: 96e9ea6e     	bl	0xf368 <_ChromeMain+0xa0cc>
 45949b4: 52800036     	mov	w22, #0x1               ; =1
 45949b8: b9000016     	str	w22, [x0]
 45949bc: a900e81c     	stp	x28, x26, [x0, #0x8]
 45949c0: 10026b48     	adr	x8, 0x4599728 <_ChromeMain+0x459448c>
 45949c4: d503201f     	nop
 45949c8: a901a018     	stp	x24, x8, [x0, #0x18]
 45949cc: a902d41f     	stp	xzr, x21, [x0, #0x28]
 45949d0: b40008a0     	cbz	x0, 0x4594ae4 <_ChromeMain+0x458f848>
 45949d4: aa0003f4     	mov	x20, x0
 45949d8: 52800600     	mov	w0, #0x30               ; =48
 45949dc: 96e9ea63     	bl	0xf368 <_ChromeMain+0xa0cc>
 45949e0: aa0003e3     	mov	x3, x0
 45949e4: b9000016     	str	w22, [x0]
 45949e8: 90fefb88     	adrp	x8, 0x2504000 <_ChromeMain+0x24fed64>
 45949ec: 91117109     	add	x9, x8, #0x45c
 45949f0: 90ff9828     	adrp	x8, 0x3898000 <_ChromeMain+0x3892d64>
 45949f4: 91070108     	add	x8, x8, #0x1c0
 45949f8: a900a009     	stp	x9, x8, [x0, #0x8]
 45949fc: f9000c18     	str	x24, [x0, #0x18]
 4594a00: f9001414     	str	x20, [x0, #0x28]
 4594a04: d0055120     	adrp	x0, 0xefba000 <dyld_stub_binder+0xefba000>
 4594a08: 913f2000     	add	x0, x0, #0xfc8
 4594a0c: 90044b01     	adrp	x1, 0xcef4000 <dyld_stub_binder+0xcef4000>
 4594a10: 9135ac21     	add	x1, x1, #0xd6b
 4594a14: 52800302     	mov	w2, #0x18               ; =24
 4594a18: 972d5886     	bl	0x10eac30 <_ChromeMain+0x10e5994>
 4594a1c: 089ffe77     	stlrb	w23, [x19]
 4594a20: f0053aa0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 4594a24: 9127c000     	add	x0, x0, #0x9f0
 4594a28: 94e9bfa9     	bl	0x80048cc <_ChromeMain+0x7fff630>
 4594a2c: 350004c0     	cbnz	w0, 0x4594ac4 <_ChromeMain+0x458f828>
 4594a30: f0054a28     	adrp	x8, 0xeedb000 <dyld_stub_binder+0xeedb000>
 4594a34: 39598513     	ldrb	w19, [x8, #0x661]
 4594a38: 52800029     	mov	w9, #0x1                ; =1
 4594a3c: 39198509     	strb	w9, [x8, #0x661]
 4594a40: f0053aa0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 4594a44: 9127c000     	add	x0, x0, #0x9f0
 4594a48: 94e9bfaf     	bl	0x8004904 <_ChromeMain+0x7fff668>
 4594a4c: 350001e0     	cbnz	w0, 0x4594a88 <_ChromeMain+0x458f7ec>
 4594a50: 3617e713     	tbz	w19, #0x2, 0x4594730 <_ChromeMain+0x458f494>
 4594a54: f0053aa0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 4594a58: 9128c000     	add	x0, x0, #0xa30
 4594a5c: 94e9bfad     	bl	0x8004910 <_ChromeMain+0x7fff674>
 4594a60: 34ffe680     	cbz	w0, 0x4594730 <_ChromeMain+0x458f494>
 4594a64: 9004cb08     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4594a68: 911c4d08     	add	x8, x8, #0x713
 4594a6c: f90003e8     	str	x8, [sp]
 4594a70: 9004cb00     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4594a74: 911c9c00     	add	x0, x0, #0x727
 4594a78: 94e9bfa9     	bl	0x800491c <_ChromeMain+0x7fff680>
 4594a7c: 96ea47f2     	bl	0x26a44 <_ChromeMain+0x217a8>
 4594a80: f94046c8     	ldr	x8, [x22, #0x88]
 4594a84: 17ffff9e     	b	0x45948fc <_ChromeMain+0x458f660>
 4594a88: 9004cb08     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4594a8c: 911c4d08     	add	x8, x8, #0x713
 4594a90: f90003e8     	str	x8, [sp]
 4594a94: 9004cb00     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4594a98: 911be000     	add	x0, x0, #0x6f8
 4594a9c: 94e9bfa0     	bl	0x800491c <_ChromeMain+0x7fff680>
 4594aa0: 14000008     	b	0x4594ac0 <_ChromeMain+0x458f824>
 4594aa4: 94e9c008     	bl	0x8004ac4 <_ChromeMain+0x7fff828>
 4594aa8: d4200000     	brk	#0
 4594aac: d4400000     	hlt	#0
 4594ab0: d4200020     	brk	#0x1
 4594ab4: d4200000     	brk	#0
 4594ab8: d4400000     	hlt	#0
 4594abc: d4200020     	brk	#0x1
 4594ac0: d4200020     	brk	#0x1
 4594ac4: 9004cb08     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4594ac8: 911c4d08     	add	x8, x8, #0x713
 4594acc: f90003e8     	str	x8, [sp]
