
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4649960: d103c3ff     	sub	sp, sp, #0xf0
 4649964: 6d0933ed     	stp	d13, d12, [sp, #0x90]
 4649968: 6d0a2beb     	stp	d11, d10, [sp, #0xa0]
 464996c: 6d0b23e9     	stp	d9, d8, [sp, #0xb0]
 4649970: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 4649974: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 4649978: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 464997c: 910383fd     	add	x29, sp, #0xe0
 4649980: aa0003f3     	mov	x19, x0
 4649984: 9139a008     	add	x8, x0, #0xe68
 4649988: eb08003f     	cmp	x1, x8
 464998c: 54000400     	b.eq	0x4649a0c <_ChromeMain+0x4644770>
 4649990: 913bc268     	add	x8, x19, #0xef0
 4649994: eb08003f     	cmp	x1, x8
 4649998: 54000620     	b.eq	0x4649a5c <_ChromeMain+0x46447c0>
 464999c: 91356268     	add	x8, x19, #0xd58
 46499a0: eb08003f     	cmp	x1, x8
 46499a4: 54000c60     	b.eq	0x4649b30 <_ChromeMain+0x4644894>
 46499a8: 91378268     	add	x8, x19, #0xde0
 46499ac: eb08003f     	cmp	x1, x8
 46499b0: 54000400     	b.eq	0x4649a30 <_ChromeMain+0x4644794>
 46499b4: 393de27f     	strb	wzr, [x19, #0xf78]
 46499b8: f9423e60     	ldr	x0, [x19, #0x478]
 46499bc: b4000060     	cbz	x0, 0x46499c8 <_ChromeMain+0x464472c>
 46499c0: 52800021     	mov	w1, #0x1                ; =1
 46499c4: 94c9860d     	bl	0x78ab1f8 <_ChromeMain+0x78a5f5c>
 46499c8: f942da68     	ldr	x8, [x19, #0x5b0]
 46499cc: b4000068     	cbz	x8, 0x46499d8 <_ChromeMain+0x464473c>
 46499d0: f941a114     	ldr	x20, [x8, #0x340]
 46499d4: b50010d4     	cbnz	x20, 0x4649bec <_ChromeMain+0x4644950>
 46499d8: aa1303e0     	mov	x0, x19
 46499dc: 52800001     	mov	w1, #0x0                ; =0
 46499e0: 940003b8     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 46499e4: aa1303e0     	mov	x0, x19
 46499e8: 52800001     	mov	w1, #0x0                ; =0
 46499ec: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 46499f0: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 46499f4: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 46499f8: 6d4b23e9     	ldp	d9, d8, [sp, #0xb0]
 46499fc: 6d4a2beb     	ldp	d11, d10, [sp, #0xa0]
 4649a00: 6d4933ed     	ldp	d13, d12, [sp, #0x90]
 4649a04: 9103c3ff     	add	sp, sp, #0xf0
 4649a08: 16ff9a9b     	b	0x630474 <_ChromeMain+0x62b1d8>
