
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7ac69b4: d105c3ff     	sub	sp, sp, #0x170
 7ac69b8: a9135ff8     	stp	x24, x23, [sp, #0x130]
 7ac69bc: a91457f6     	stp	x22, x21, [sp, #0x140]
 7ac69c0: a9154ff4     	stp	x20, x19, [sp, #0x150]
 7ac69c4: a9167bfd     	stp	x29, x30, [sp, #0x160]
 7ac69c8: 910583fd     	add	x29, sp, #0x160
 7ac69cc: aa0303f4     	mov	x20, x3
 7ac69d0: aa0203f7     	mov	x23, x2
 7ac69d4: aa0103f5     	mov	x21, x1
 7ac69d8: aa0003f6     	mov	x22, x0
 7ac69dc: 967d648d     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 7ac69e0: aa1503e1     	mov	x1, x21
 7ac69e4: 967d64c7     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 7ac69e8: aa0003f3     	mov	x19, x0
 7ac69ec: b50004e0     	cbnz	x0, 0x7ac6a88 <_ChromeMain+0x7ac17ec>
 7ac69f0: b4000794     	cbz	x20, 0x7ac6ae0 <_ChromeMain+0x7ac1844>
 7ac69f4: f9400688     	ldr	x8, [x20, #0x8]
 7ac69f8: aa1403e0     	mov	x0, x20
 7ac69fc: d2800001     	mov	x1, #0x0                ; =0
 7ac6a00: d63f0100     	blr	x8
 7ac6a04: 12800008     	mov	w8, #-0x1               ; =-1
 7ac6a08: b8e80288     	ldaddal	w8, w8, [x20]
 7ac6a0c: 7100051f     	cmp	w8, #0x1
 7ac6a10: 54000081     	b.ne	0x7ac6a20 <_ChromeMain+0x7ac1784>
 7ac6a14: f9400a88     	ldr	x8, [x20, #0x10]
 7ac6a18: aa1403e0     	mov	x0, x20
 7ac6a1c: d63f0100     	blr	x8
 7ac6a20: d003a208     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 7ac6a24: b940b108     	ldr	w8, [x8, #0xb0]
 7ac6a28: 7100091f     	cmp	w8, #0x2
 7ac6a2c: 540001ec     	b.gt	0x7ac6a68 <_ChromeMain+0x7ac17cc>
 7ac6a30: b002ffc1     	adrp	x1, 0xdabf000 <dyld_stub_binder+0xdabf000>
 7ac6a34: 912e7021     	add	x1, x1, #0xb9c
 7ac6a38: 910003f4     	mov	x20, sp
 7ac6a3c: 910003e0     	mov	x0, sp
 7ac6a40: 52806922     	mov	w2, #0x349              ; =841
 7ac6a44: 52800043     	mov	w3, #0x2                ; =2
 7ac6a48: 962d09c1     	bl	0x60914c <_ChromeMain+0x603eb0>
 7ac6a4c: b002ffc1     	adrp	x1, 0xdabf000 <dyld_stub_binder+0xdabf000>
 7ac6a50: 91309c21     	add	x1, x1, #0xc27
 7ac6a54: 91004280     	add	x0, x20, #0x10
 7ac6a58: 52800542     	mov	w2, #0x2a               ; =42
 7ac6a5c: 96157a98     	bl	0x254bc <_ChromeMain+0x20220>
 7ac6a60: 910003e0     	mov	x0, sp
 7ac6a64: 962d0987     	bl	0x609080 <_ChromeMain+0x603de4>
 7ac6a68: f100027f     	cmp	x19, #0x0
 7ac6a6c: 1a9f07e0     	cset	w0, ne
 7ac6a70: a9567bfd     	ldp	x29, x30, [sp, #0x160]
 7ac6a74: a9554ff4     	ldp	x20, x19, [sp, #0x150]
 7ac6a78: a95457f6     	ldp	x22, x21, [sp, #0x140]
 7ac6a7c: a9535ff8     	ldp	x24, x23, [sp, #0x130]
 7ac6a80: 9105c3ff     	add	sp, sp, #0x170
 7ac6a84: d65f03c0     	ret
 7ac6a88: 52800700     	mov	w0, #0x38               ; =56
 7ac6a8c: 96152237     	bl	0xf368 <_ChromeMain+0xa0cc>
 7ac6a90: aa0003e2     	mov	x2, x0
 7ac6a94: 52800028     	mov	w8, #0x1                ; =1
 7ac6a98: b9000008     	str	w8, [x0]
 7ac6a9c: 1000f548     	adr	x8, 0x7ac8944 <_ChromeMain+0x7ac36a8>
 7ac6aa0: d503201f     	nop
 7ac6aa4: f0ff6c49     	adrp	x9, 0x6851000 <_ChromeMain+0x684bd64>
 7ac6aa8: 913d0129     	add	x9, x9, #0xf40
 7ac6aac: a900a408     	stp	x8, x9, [x0, #0x8]
 7ac6ab0: f0fd54a8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 7ac6ab4: 912c0108     	add	x8, x8, #0xb00
 7ac6ab8: 10002549     	adr	x9, 0x7ac6f60 <_ChromeMain+0x7ac1cc4>
 7ac6abc: d503201f     	nop
 7ac6ac0: a901a408     	stp	x8, x9, [x0, #0x18]
 7ac6ac4: f9001414     	str	x20, [x0, #0x28]
 7ac6ac8: 3900c017     	strb	w23, [x0, #0x30]
 7ac6acc: aa1603e0     	mov	x0, x22
 7ac6ad0: aa1503e1     	mov	x1, x21
 7ac6ad4: d2800003     	mov	x3, #0x0                ; =0
 7ac6ad8: 94000005     	bl	0x7ac6aec <_ChromeMain+0x7ac1850>
 7ac6adc: 17ffffe3     	b	0x7ac6a68 <_ChromeMain+0x7ac17cc>
 7ac6ae0: d4200000     	brk	#0
 7ac6ae4: d4400000     	hlt	#0
 7ac6ae8: d4200020     	brk	#0x1
