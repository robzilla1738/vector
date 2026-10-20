
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464c540: 39472008     	ldrb	w8, [x0, #0x1c8]
 464c544: 34000548     	cbz	w8, 0x464c5ec <_ChromeMain+0x4647350>
 464c548: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 464c54c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 464c550: a9027bfd     	stp	x29, x30, [sp, #0x20]
 464c554: 910083fd     	add	x29, sp, #0x20
 464c558: aa0003f4     	mov	x20, x0
 464c55c: f940c400     	ldr	x0, [x0, #0x188]
 464c560: b40003e0     	cbz	x0, 0x464c5dc <_ChromeMain+0x4647340>
 464c564: aa0103f3     	mov	x19, x1
 464c568: f9400008     	ldr	x8, [x0]
 464c56c: f9405508     	ldr	x8, [x8, #0xa8]
 464c570: d63f0100     	blr	x8
 464c574: 34000340     	cbz	w0, 0x464c5dc <_ChromeMain+0x4647340>
 464c578: f9442695     	ldr	x21, [x20, #0x848]
 464c57c: d0052ae0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 464c580: 9118e000     	add	x0, x0, #0x638
 464c584: 96eb333f     	bl	0x119280 <_ChromeMain+0x113fe4>
 464c588: 370000a0     	tbnz	w0, #0x0, 0x464c59c <_ChromeMain+0x4647300>
 464c58c: d0052ae0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 464c590: 91192000     	add	x0, x0, #0x648
 464c594: 96eb333b     	bl	0x119280 <_ChromeMain+0x113fe4>
 464c598: 34000220     	cbz	w0, 0x464c5dc <_ChromeMain+0x4647340>
 464c59c: 394782a8     	ldrb	w8, [x21, #0x1e0]
 464c5a0: 340001c8     	cbz	w8, 0x464c5d8 <_ChromeMain+0x464733c>
 464c5a4: f9422e88     	ldr	x8, [x20, #0x458]
 464c5a8: b4000188     	cbz	x8, 0x464c5d8 <_ChromeMain+0x464733c>
 464c5ac: f9429d08     	ldr	x8, [x8, #0x538]
 464c5b0: b4000148     	cbz	x8, 0x464c5d8 <_ChromeMain+0x464733c>
 464c5b4: f9403508     	ldr	x8, [x8, #0x68]
 464c5b8: b4000108     	cbz	x8, 0x464c5d8 <_ChromeMain+0x464733c>
 464c5bc: 52800000     	mov	w0, #0x0                ; =0
 464c5c0: b40000f3     	cbz	x19, 0x464c5dc <_ChromeMain+0x4647340>
 464c5c4: 39412108     	ldrb	w8, [x8, #0x48]
 464c5c8: 370000a8     	tbnz	w8, #0x0, 0x464c5dc <_ChromeMain+0x4647340>
 464c5cc: b9400a68     	ldr	w8, [x19, #0x8]
 464c5d0: 71008d1f     	cmp	w8, #0x23
 464c5d4: 54000100     	b.eq	0x464c5f4 <_ChromeMain+0x4647358>
 464c5d8: 52800000     	mov	w0, #0x0                ; =0
 464c5dc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 464c5e0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 464c5e4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 464c5e8: d65f03c0     	ret
 464c5ec: 52800000     	mov	w0, #0x0                ; =0
 464c5f0: d65f03c0     	ret
 464c5f4: f9442688     	ldr	x8, [x20, #0x848]
 464c5f8: 39424108     	ldrb	w8, [x8, #0x90]
 464c5fc: 340000a8     	cbz	w8, 0x464c610 <_ChromeMain+0x4647374>
 464c600: 39682289     	ldrb	w9, [x20, #0xa08]
 464c604: 37000269     	tbnz	w9, #0x0, 0x464c650 <_ChromeMain+0x46473b4>
 464c608: 39683289     	ldrb	w9, [x20, #0xa0c]
 464c60c: 37000229     	tbnz	w9, #0x0, 0x464c650 <_ChromeMain+0x46473b4>
 464c610: 3973828a     	ldrb	w10, [x20, #0xce0]
 464c614: 397de289     	ldrb	w9, [x20, #0xf78]
 464c618: 3700008a     	tbnz	w10, #0x0, 0x464c628 <_ChromeMain+0x464738c>
 464c61c: 37000089     	tbnz	w9, #0x0, 0x464c62c <_ChromeMain+0x4647390>
 464c620: 3707fdc8     	tbnz	w8, #0x0, 0x464c5d8 <_ChromeMain+0x464733c>
 464c624: 1400000b     	b	0x464c650 <_ChromeMain+0x46473b4>
 464c628: 34000729     	cbz	w9, 0x464c70c <_ChromeMain+0x4647470>
 464c62c: b941c288     	ldr	w8, [x20, #0x1c0]
 464c630: aa0803e9     	mov	x9, x8
 464c634: 6b08013f     	cmp	w9, w8
 464c638: 1a88b12a     	csel	w10, w9, w8, lt
 464c63c: d503201f     	nop
 464c640: 7100011f     	cmp	w8, #0x0
 464c644: 1a89c148     	csel	w8, w10, w9, gt
 464c648: 71025d1f     	cmp	w8, #0x97
 464c64c: 54fffc6b     	b.lt	0x464c5d8 <_ChromeMain+0x464733c>
 464c650: 39686288     	ldrb	w8, [x20, #0xa18]
 464c654: 37000068     	tbnz	w8, #0x0, 0x464c660 <_ChromeMain+0x46473c4>
 464c658: 39686688     	ldrb	w8, [x20, #0xa19]
 464c65c: 36000068     	tbz	w8, #0x0, 0x464c668 <_ChromeMain+0x46473cc>
 464c660: 52800020     	mov	w0, #0x1                ; =1
 464c664: 17ffffde     	b	0x464c5dc <_ChromeMain+0x4647340>
 464c668: f942da88     	ldr	x8, [x20, #0x5b0]
 464c66c: b40001a8     	cbz	x8, 0x464c6a0 <_ChromeMain+0x4647404>
 464c670: 3952b109     	ldrb	w9, [x8, #0x4ac]
 464c674: 34000169     	cbz	w9, 0x464c6a0 <_ChromeMain+0x4647404>
 464c678: b944a108     	ldr	w8, [x8, #0x4a0]
 464c67c: 7100051f     	cmp	w8, #0x1
 464c680: 54000101     	b.ne	0x464c6a0 <_ChromeMain+0x4647404>
 464c684: b940fa68     	ldr	w8, [x19, #0xf8]
 464c688: 7100051f     	cmp	w8, #0x1
 464c68c: 540000a0     	b.eq	0x464c6a0 <_ChromeMain+0x4647404>
 464c690: 35fffa48     	cbnz	w8, 0x464c5d8 <_ChromeMain+0x464733c>
 464c694: b940f668     	ldr	w8, [x19, #0xf4]
 464c698: 7100091f     	cmp	w8, #0x2
 464c69c: 54fff9e1     	b.ne	0x464c5d8 <_ChromeMain+0x464733c>
