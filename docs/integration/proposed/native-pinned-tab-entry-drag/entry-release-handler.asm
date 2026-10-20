
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460c4a8: d10683ff     	sub	sp, sp, #0x1a0
 460c4ac: a91567fa     	stp	x26, x25, [sp, #0x150]
 460c4b0: a9165ff8     	stp	x24, x23, [sp, #0x160]
 460c4b4: a91757f6     	stp	x22, x21, [sp, #0x170]
 460c4b8: a9184ff4     	stp	x20, x19, [sp, #0x180]
 460c4bc: a9197bfd     	stp	x29, x30, [sp, #0x190]
 460c4c0: 910643fd     	add	x29, sp, #0x190
 460c4c4: 394fe409     	ldrb	w9, [x0, #0x3f9]
 460c4c8: f941e808     	ldr	x8, [x0, #0x3d0]
 460c4cc: 36000809     	tbz	w9, #0x0, 0x460c5cc <_ChromeMain+0x4607330>
 460c4d0: b4000708     	cbz	x8, 0x460c5b0 <_ChromeMain+0x4607314>
 460c4d4: aa0103f4     	mov	x20, x1
 460c4d8: aa0003f3     	mov	x19, x0
 460c4dc: 394fe816     	ldrb	w22, [x0, #0x3fa]
 460c4e0: 910fe408     	add	x8, x0, #0x3f9
 460c4e4: 7900011f     	strh	wzr, [x8]
 460c4e8: 910fa008     	add	x8, x0, #0x3e8
 460c4ec: 6f00e400     	movi.2d	v0, #0000000000000000
 460c4f0: 3d800100     	str	q0, [x8]
 460c4f4: f9400008     	ldr	x8, [x0]
 460c4f8: f9403508     	ldr	x8, [x8, #0x68]
 460c4fc: d63f0100     	blr	x8
 460c500: b5000900     	cbnz	x0, 0x460c620 <_ChromeMain+0x4607384>
 460c504: 34003256     	cbz	w22, 0x460cb4c <_ChromeMain+0x46078b0>
 460c508: 910243f7     	add	x23, sp, #0x90
 460c50c: f9008bff     	str	xzr, [sp, #0x110]
 460c510: 6f00e400     	movi.2d	v0, #0000000000000000
 460c514: ad0302e0     	stp	q0, q0, [x23, #0x60]
 460c518: ad0202e0     	stp	q0, q0, [x23, #0x40]
 460c51c: ad0102e0     	stp	q0, q0, [x23, #0x20]
 460c520: ad0002e0     	stp	q0, q0, [x23]
 460c524: 0f03f600     	fmov.2s	v0, #1.00000000
 460c528: fd004fe0     	str	d0, [sp, #0x98]
 460c52c: 910023e8     	add	x8, sp, #0x8
 460c530: aa1303e0     	mov	x0, x19
 460c534: 97f78d7b     	bl	0x43efb20 <_ChromeMain+0x43ea884>
 460c538: 910023e0     	add	x0, sp, #0x8
 460c53c: 910243e1     	add	x1, sp, #0x90
 460c540: 971b97c8     	bl	0xcf2460 <_ChromeMain+0xced1c4>
 460c544: 37000080     	tbnz	w0, #0x0, 0x460c554 <_ChromeMain+0x46072b8>
 460c548: 910243e1     	add	x1, sp, #0x90
 460c54c: aa1303e0     	mov	x0, x19
 460c550: 958336eb     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
 460c554: f940c660     	ldr	x0, [x19, #0x188]
 460c558: b4000040     	cbz	x0, 0x460c560 <_ChromeMain+0x46072c4>
 460c55c: 96fe5308     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460c560: aa1303e0     	mov	x0, x19
 460c564: 96fe5306     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460c568: 394fee68     	ldrb	w8, [x19, #0x3fb]
 460c56c: 34000168     	cbz	w8, 0x460c598 <_ChromeMain+0x46072fc>
 460c570: 390fee7f     	strb	wzr, [x19, #0x3fb]
 460c574: f9401274     	ldr	x20, [x19, #0x20]
 460c578: b40000b4     	cbz	x20, 0x460c58c <_ChromeMain+0x46072f0>
 460c57c: f940b280     	ldr	x0, [x20, #0x160]
 460c580: b4003b40     	cbz	x0, 0x460cce8 <_ChromeMain+0x4607a4c>
 460c584: 1e2e1000     	fmov	s0, #1.00000000
 460c588: 9753a16c     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 460c58c: f940c660     	ldr	x0, [x19, #0x188]
 460c590: b4000040     	cbz	x0, 0x460c598 <_ChromeMain+0x46072fc>
 460c594: 96fe52fa     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460c598: f941ea74     	ldr	x20, [x19, #0x3d0]
 460c59c: b4000073     	cbz	x19, 0x460c5a8 <_ChromeMain+0x460730c>
 460c5a0: 39544288     	ldrb	w8, [x20, #0x510]
 460c5a4: 37000748     	tbnz	w8, #0x0, 0x460c68c <_ChromeMain+0x46073f0>
 460c5a8: aa1403e0     	mov	x0, x20
 460c5ac: 97fff386     	bl	0x46093c4 <_ChromeMain+0x4604128>
 460c5b0: a9597bfd     	ldp	x29, x30, [sp, #0x190]
 460c5b4: a9584ff4     	ldp	x20, x19, [sp, #0x180]
 460c5b8: a95757f6     	ldp	x22, x21, [sp, #0x170]
 460c5bc: a9565ff8     	ldp	x24, x23, [sp, #0x160]
 460c5c0: a95567fa     	ldp	x26, x25, [sp, #0x150]
 460c5c4: 910683ff     	add	sp, sp, #0x1a0
 460c5c8: d65f03c0     	ret
 460c5cc: b4ffff28     	cbz	x8, 0x460c5b0 <_ChromeMain+0x4607314>
 460c5d0: 39555109     	ldrb	w9, [x8, #0x554]
 460c5d4: 34fffee9     	cbz	w9, 0x460c5b0 <_ChromeMain+0x4607314>
 460c5d8: f9429513     	ldr	x19, [x8, #0x528]
 460c5dc: b4fffeb3     	cbz	x19, 0x460c5b0 <_ChromeMain+0x4607314>
 460c5e0: 52800029     	mov	w9, #0x1                ; =1
 460c5e4: b8290269     	ldadd	w9, w9, [x19]
 460c5e8: 7100013f     	cmp	w9, #0x0
 460c5ec: 54003e6d     	b.le	0x460cdb8 <_ChromeMain+0x4607b1c>
 460c5f0: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 460c5f4: 6b0a013f     	cmp	w9, w10
 460c5f8: 54003e60     	b.eq	0x460cdc4 <_ChromeMain+0x4607b28>
 460c5fc: f9429508     	ldr	x8, [x8, #0x528]
 460c600: f9400508     	ldr	x8, [x8, #0x8]
 460c604: aa1303e0     	mov	x0, x19
 460c608: d63f0100     	blr	x8
 460c60c: 12800008     	mov	w8, #-0x1               ; =-1
 460c610: b8e80268     	ldaddal	w8, w8, [x19]
 460c614: 7100051f     	cmp	w8, #0x1
 460c618: 54fffcc1     	b.ne	0x460c5b0 <_ChromeMain+0x4607314>
 460c61c: 140001d1     	b	0x460cd60 <_ChromeMain+0x4607ac4>
 460c620: aa0003f5     	mov	x21, x0
 460c624: 95835d5e     	bl	0xa6e3b9c <_ChromeMain+0xa6de900>
 460c628: 34fff6e0     	cbz	w0, 0x460c504 <_ChromeMain+0x4607268>
 460c62c: aa1503e0     	mov	x0, x21
 460c630: 95835d34     	bl	0xa6e3b00 <_ChromeMain+0xa6de864>
 460c634: 17ffffb4     	b	0x460c504 <_ChromeMain+0x4607268>
 460c638: aa1403e0     	mov	x0, x20
 460c63c: 97fff362     	bl	0x46093c4 <_ChromeMain+0x4604128>
 460c640: 38db73a8     	ldursb	w8, [x29, #-0x49]
 460c644: 36f800a8     	tbz	w8, #0x1f, 0x460c658 <_ChromeMain+0x46073bc>
 460c648: f85a03a0     	ldur	x0, [x29, #-0x60]
 460c64c: f85b03a8     	ldur	x8, [x29, #-0x50]
 460c650: d37ff901     	lsl	x1, x8, #1
 460c654: 96e7f219     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460c658: 910243f3     	add	x19, sp, #0x90
 460c65c: 9101c260     	add	x0, x19, #0x70
 460c660: d2800001     	mov	x1, #0x0                ; =0
 460c664: 96e86d95     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460c668: 91008260     	add	x0, x19, #0x20
 460c66c: 96e86d83     	bl	0x27c78 <_ChromeMain+0x229dc>
 460c670: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 460c674: 36fff9e8     	tbz	w8, #0x1f, 0x460c5b0 <_ChromeMain+0x4607314>
 460c678: f9404be0     	ldr	x0, [sp, #0x90]
 460c67c: f94053e8     	ldr	x8, [sp, #0xa0]
 460c680: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460c684: 96e7f20d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460c688: 17ffffca     	b	0x460c5b0 <_ChromeMain+0x4607314>
 460c68c: 39578298     	ldrb	w24, [x20, #0x5e0]
 460c690: f90083ff     	str	xzr, [sp, #0x100]
 460c694: 6f00e400     	movi.2d	v0, #0000000000000000
 460c698: ad0282e0     	stp	q0, q0, [x23, #0x50]
 460c69c: ad0182e0     	stp	q0, q0, [x23, #0x30]
 460c6a0: ad0082e0     	stp	q0, q0, [x23, #0x10]
 460c6a4: 3d8002e0     	str	q0, [x23]
 460c6a8: 910023f5     	add	x21, sp, #0x8
 460c6ac: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 460c6b0: b801f3ff     	stur	wzr, [sp, #0x1f]
 460c6b4: f9000fff     	str	xzr, [sp, #0x18]
 460c6b8: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 460c6bc: 3c8283e0     	stur	q0, [sp, #0x28]
 460c6c0: 3c8383e0     	stur	q0, [sp, #0x38]
 460c6c4: 3c8483e0     	stur	q0, [sp, #0x48]
 460c6c8: 3c8583e0     	stur	q0, [sp, #0x58]
 460c6cc: 7900d3ff     	strh	wzr, [sp, #0x68]
 460c6d0: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 460c6d4: 910243e0     	add	x0, sp, #0x90
 460c6d8: 35000138     	cbnz	w24, 0x460c6fc <_ChromeMain+0x4607460>
 460c6dc: 910023e1     	add	x1, sp, #0x8
 460c6e0: 96ef39d9     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 460c6e4: 14000008     	b	0x460c704 <_ChromeMain+0x4607468>
 460c6e8: f942f681     	ldr	x1, [x20, #0x5e8]
 460c6ec: f942fa82     	ldr	x2, [x20, #0x5f0]
 460c6f0: d10183a0     	sub	x0, x29, #0x60
 460c6f4: 96e8e937     	bl	0x46bd0 <_ChromeMain+0x41934>
 460c6f8: 14000018     	b	0x460c758 <_ChromeMain+0x46074bc>
 460c6fc: 9115a281     	add	x1, x20, #0x568
 460c700: 96ecb625     	bl	0x139f94 <_ChromeMain+0x134cf8>
 460c704: 910023e8     	add	x8, sp, #0x8
 460c708: 9101c100     	add	x0, x8, #0x70
 460c70c: d2800001     	mov	x1, #0x0                ; =0
 460c710: 96e86d6a     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460c714: 910082a0     	add	x0, x21, #0x20
 460c718: 96e86d58     	bl	0x27c78 <_ChromeMain+0x229dc>
 460c71c: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 460c720: 36f800a8     	tbz	w8, #0x1f, 0x460c734 <_ChromeMain+0x4607498>
 460c724: f94007e0     	ldr	x0, [sp, #0x8]
 460c728: f9400fe8     	ldr	x8, [sp, #0x18]
 460c72c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460c730: 96e7f1e2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460c734: a93a7fbf     	stp	xzr, xzr, [x29, #-0x60]
 460c738: f81b03bf     	stur	xzr, [x29, #-0x50]
 460c73c: 39d7fe88     	ldrsb	w8, [x20, #0x5ff]
 460c740: 37fffd48     	tbnz	w8, #0x1f, 0x460c6e8 <_ChromeMain+0x460744c>
 460c744: 9117a288     	add	x8, x20, #0x5e8
 460c748: 3dc00100     	ldr	q0, [x8]
 460c74c: f9400908     	ldr	x8, [x8, #0x10]
 460c750: f81b03a8     	stur	x8, [x29, #-0x50]
 460c754: 3d802ae0     	str	q0, [x23, #0xa0]
 460c758: f9430299     	ldr	x25, [x20, #0x600]
 460c75c: 39578288     	ldrb	w8, [x20, #0x5e0]
 460c760: 340001a8     	cbz	w8, 0x460c794 <_ChromeMain+0x46074f8>
 460c764: 91176280     	add	x0, x20, #0x5d8
 460c768: d2800001     	mov	x1, #0x0                ; =0
 460c76c: 96e86d53     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460c770: 91162280     	add	x0, x20, #0x588
 460c774: 96e86d41     	bl	0x27c78 <_ChromeMain+0x229dc>
 460c778: 39d5fe88     	ldrsb	w8, [x20, #0x57f]
 460c77c: 36f800a8     	tbz	w8, #0x1f, 0x460c790 <_ChromeMain+0x46074f4>
 460c780: f942b680     	ldr	x0, [x20, #0x568]
 460c784: f942be88     	ldr	x8, [x20, #0x578]
 460c788: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460c78c: 96e7f1cb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460c790: 3917829f     	strb	wzr, [x20, #0x5e0]
 460c794: 39d7fe88     	ldrsb	w8, [x20, #0x5ff]
 460c798: 37f80848     	tbnz	w8, #0x1f, 0x460c8a0 <_ChromeMain+0x4607604>
 460c79c: 790bd29f     	strh	wzr, [x20, #0x5e8]
 460c7a0: 3917fe9f     	strb	wzr, [x20, #0x5ff]
 460c7a4: 39581288     	ldrb	w8, [x20, #0x604]
 460c7a8: 34000048     	cbz	w8, 0x460c7b0 <_ChromeMain+0x4607514>
 460c7ac: 3918129f     	strb	wzr, [x20, #0x604]
 460c7b0: 394fee68     	ldrb	w8, [x19, #0x3fb]
 460c7b4: 34000168     	cbz	w8, 0x460c7e0 <_ChromeMain+0x4607544>
 460c7b8: 390fee7f     	strb	wzr, [x19, #0x3fb]
 460c7bc: f9401275     	ldr	x21, [x19, #0x20]
 460c7c0: b40000b5     	cbz	x21, 0x460c7d4 <_ChromeMain+0x4607538>
 460c7c4: f940b2a0     	ldr	x0, [x21, #0x160]
 460c7c8: b4002ae0     	cbz	x0, 0x460cd24 <_ChromeMain+0x4607a88>
 460c7cc: 1e2e1000     	fmov	s0, #1.00000000
 460c7d0: 9753a0da     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 460c7d4: f940c660     	ldr	x0, [x19, #0x188]
 460c7d8: b4000040     	cbz	x0, 0x460c7e0 <_ChromeMain+0x4607544>
 460c7dc: 96fe5268     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460c7e0: 35000298     	cbnz	w24, 0x460c830 <_ChromeMain+0x4607594>
 460c7e4: 39546288     	ldrb	w8, [x20, #0x518]
 460c7e8: a938ffbf     	stp	xzr, xzr, [x29, #-0x78]
 460c7ec: f81983bf     	stur	xzr, [x29, #-0x68]
 460c7f0: 34fff248     	cbz	w8, 0x460c638 <_ChromeMain+0x460739c>
 460c7f4: f941b681     	ldr	x1, [x20, #0x368]
 460c7f8: d101e3a0     	sub	x0, x29, #0x78
 460c7fc: 97ff64d1     	bl	0x45e5b40 <_ChromeMain+0x45e08a4>
 460c800: f941b688     	ldr	x8, [x20, #0x368]
 460c804: 52804d09     	mov	w9, #0x268              ; =616
 460c808: 9b097d18     	mul	x24, x8, x9
 460c80c: d291c736     	mov	x22, #0x8e39            ; =36409
 460c810: f2a71c76     	movk	x22, #0x38e3, lsl #16
 460c814: f2dc71d6     	movk	x22, #0xe38e, lsl #32
 460c818: f2f1c716     	movk	x22, #0x8e38, lsl #48
 460c81c: b4000b18     	cbz	x24, 0x460c97c <_ChromeMain+0x46076e0>
 460c820: f941b293     	ldr	x19, [x20, #0x360]
 460c824: 52801219     	mov	w25, #0x90              ; =144
 460c828: a978a7a8     	ldp	x8, x9, [x29, #-0x78]
 460c82c: 14000045     	b	0x460c940 <_ChromeMain+0x46076a4>
 460c830: aa1403e0     	mov	x0, x20
 460c834: 97fff2e4     	bl	0x46093c4 <_ChromeMain+0x4604128>
 460c838: f9429e95     	ldr	x21, [x20, #0x538]
 460c83c: b40003b5     	cbz	x21, 0x460c8b0 <_ChromeMain+0x4607614>
 460c840: f90007f9     	str	x25, [sp, #0x8]
 460c844: 52800028     	mov	w8, #0x1                ; =1
 460c848: b82802a8     	ldadd	w8, w8, [x21]
 460c84c: 7100011f     	cmp	w8, #0x0
 460c850: 54002ccd     	b.le	0x460cde8 <_ChromeMain+0x4607b4c>
 460c854: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460c858: 6b09011f     	cmp	w8, w9
 460c85c: 54002cc0     	b.eq	0x460cdf4 <_ChromeMain+0x4607b58>
 460c860: f9429e88     	ldr	x8, [x20, #0x538]
 460c864: f9400508     	ldr	x8, [x8, #0x8]
 460c868: 910243e1     	add	x1, sp, #0x90
 460c86c: d10183a2     	sub	x2, x29, #0x60
 460c870: 910023e3     	add	x3, sp, #0x8
 460c874: aa1503e0     	mov	x0, x21
 460c878: d63f0100     	blr	x8
 460c87c: aa0003f3     	mov	x19, x0
 460c880: 12800008     	mov	w8, #-0x1               ; =-1
 460c884: b8e802a8     	ldaddal	w8, w8, [x21]
 460c888: 7100051f     	cmp	w8, #0x1
 460c88c: 54000141     	b.ne	0x460c8b4 <_ChromeMain+0x4607618>
 460c890: f9400aa8     	ldr	x8, [x21, #0x10]
 460c894: aa1503e0     	mov	x0, x21
 460c898: d63f0100     	blr	x8
 460c89c: 14000006     	b	0x460c8b4 <_ChromeMain+0x4607618>
 460c8a0: f942f688     	ldr	x8, [x20, #0x5e8]
 460c8a4: 7900011f     	strh	wzr, [x8]
 460c8a8: f902fa9f     	str	xzr, [x20, #0x5f0]
 460c8ac: 17ffffbe     	b	0x460c7a4 <_ChromeMain+0x4607508>
 460c8b0: 52800013     	mov	w19, #0x0               ; =0
 460c8b4: f942a295     	ldr	x21, [x20, #0x540]
 460c8b8: b4000215     	cbz	x21, 0x460c8f8 <_ChromeMain+0x460765c>
 460c8bc: 52800028     	mov	w8, #0x1                ; =1
 460c8c0: b82802a8     	ldadd	w8, w8, [x21]
 460c8c4: 7100011f     	cmp	w8, #0x0
 460c8c8: 540029cd     	b.le	0x460ce00 <_ChromeMain+0x4607b64>
 460c8cc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460c8d0: 6b09011f     	cmp	w8, w9
 460c8d4: 54002840     	b.eq	0x460cddc <_ChromeMain+0x4607b40>
 460c8d8: f942a288     	ldr	x8, [x20, #0x540]
 460c8dc: f9400508     	ldr	x8, [x8, #0x8]
 460c8e0: aa1503e0     	mov	x0, x21
 460c8e4: d63f0100     	blr	x8
 460c8e8: 12800008     	mov	w8, #-0x1               ; =-1
 460c8ec: b8e802a8     	ldaddal	w8, w8, [x21]
 460c8f0: 7100051f     	cmp	w8, #0x1
 460c8f4: 54002480     	b.eq	0x460cd84 <_ChromeMain+0x4607ae8>
 460c8f8: 3707ea53     	tbnz	w19, #0x0, 0x460c640 <_ChromeMain+0x46073a4>
 460c8fc: aa1403e0     	mov	x0, x20
 460c900: 97ffe239     	bl	0x46051e4 <_ChromeMain+0x45fff48>
 460c904: 17ffff4f     	b	0x460c640 <_ChromeMain+0x46073a4>
 460c908: 3cc78260     	ldur	q0, [x19, #0x78]
 460c90c: f8488268     	ldur	x8, [x19, #0x88]
 460c910: f80882a8     	stur	x8, [x21, #0x88]
 460c914: 3c8782a0     	stur	q0, [x21, #0x78]
 460c918: 910242a0     	add	x0, x21, #0x90
 460c91c: f85883a8     	ldur	x8, [x29, #-0x78]
 460c920: eb080009     	subs	x9, x0, x8
 460c924: 9344fd29     	asr	x9, x9, #4
 460c928: 9b167d29     	mul	x9, x9, x22
 460c92c: f81903a9     	stur	x9, [x29, #-0x70]
 460c930: 54000240     	b.eq	0x460c978 <_ChromeMain+0x46076dc>
 460c934: 9109a273     	add	x19, x19, #0x268
 460c938: f109a318     	subs	x24, x24, #0x268
 460c93c: 54000200     	b.eq	0x460c97c <_ChromeMain+0x46076e0>
 460c940: f85983aa     	ldur	x10, [x29, #-0x68]
 460c944: eb0a013f     	cmp	x9, x10
 460c948: 54002280     	b.eq	0x460cd98 <_ChromeMain+0x4607afc>
 460c94c: 9b192135     	madd	x21, x9, x25, x8
 460c950: b4000155     	cbz	x21, 0x460c978 <_ChromeMain+0x46076dc>
 460c954: aa1503e0     	mov	x0, x21
 460c958: aa1303e1     	mov	x1, x19
 460c95c: 96ecb58e     	bl	0x139f94 <_ChromeMain+0x134cf8>
 460c960: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 460c964: 36fffd28     	tbz	w8, #0x1f, 0x460c908 <_ChromeMain+0x460766c>
 460c968: a9478a61     	ldp	x1, x2, [x19, #0x78]
 460c96c: 9101e2a0     	add	x0, x21, #0x78
 460c970: 96e8e898     	bl	0x46bd0 <_ChromeMain+0x41934>
 460c974: 17ffffe9     	b	0x460c918 <_ChromeMain+0x460767c>
 460c978: d4200020     	brk	#0x1
 460c97c: aa1403e0     	mov	x0, x20
 460c980: 97fff291     	bl	0x46093c4 <_ChromeMain+0x4604128>
 460c984: f00537a0     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 460c988: 9135a000     	add	x0, x0, #0xd68
 460c98c: f9400008     	ldr	x8, [x0]
 460c990: d63f0100     	blr	x8
 460c994: f9400008     	ldr	x8, [x0]
 460c998: b40021c8     	cbz	x8, 0x460cdd0 <_ChromeMain+0x4607b34>
 460c99c: f9400113     	ldr	x19, [x8]
 460c9a0: b4002193     	cbz	x19, 0x460cdd0 <_ChromeMain+0x4607b34>
 460c9a4: d004c5e0     	adrp	x0, 0xdeca000 <dyld_stub_binder+0xdeca000>
 460c9a8: 91259400     	add	x0, x0, #0x965
 460c9ac: f004c5e1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 460c9b0: 91183021     	add	x1, x1, #0x60c
 460c9b4: 910023e8     	add	x8, sp, #0x8
 460c9b8: 5280d182     	mov	w2, #0x68c              ; =1676
 460c9bc: 96e910b1     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 460c9c0: f9430695     	ldr	x21, [x20, #0x608]
 460c9c4: b40000d5     	cbz	x21, 0x460c9dc <_ChromeMain+0x4607740>
 460c9c8: 52800028     	mov	w8, #0x1                ; =1
 460c9cc: b82802a8     	ldadd	w8, w8, [x21]
 460c9d0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460c9d4: 6b09011f     	cmp	w8, w9
 460c9d8: 540021a0     	b.eq	0x460ce0c <_ChromeMain+0x4607b70>
 460c9dc: f9430a94     	ldr	x20, [x20, #0x610]
 460c9e0: 52800b00     	mov	w0, #0x58               ; =88
 460c9e4: 96e80a61     	bl	0xf368 <_ChromeMain+0xa0cc>
 460c9e8: aa0003e2     	mov	x2, x0
 460c9ec: 52800028     	mov	w8, #0x1                ; =1
 460c9f0: b9000008     	str	w8, [x0]
 460c9f4: 10eca7e8     	adr	x8, 0x45e5ef0 <_ChromeMain+0x45e0c54>
 460c9f8: d503201f     	nop
 460c9fc: 10ecb329     	adr	x9, 0x45e6060 <_ChromeMain+0x45e0dc4>
 460ca00: d503201f     	nop
 460ca04: a900a408     	stp	x8, x9, [x0, #0x8]
 460ca08: d0ffd508     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 460ca0c: 911b0108     	add	x8, x8, #0x6c0
 460ca10: 10ec9609     	adr	x9, 0x45e5cd0 <_ChromeMain+0x45e0a34>
 460ca14: d503201f     	nop
 460ca18: a901a408     	stp	x8, x9, [x0, #0x18]
 460ca1c: a902d41f     	stp	xzr, x21, [x0, #0x28]
 460ca20: f85883a8     	ldur	x8, [x29, #-0x78]
 460ca24: a903a014     	stp	x20, x8, [x0, #0x38]
 460ca28: 3cc902e0     	ldur	q0, [x23, #0x90]
 460ca2c: a938ffbf     	stp	xzr, xzr, [x29, #-0x78]
 460ca30: f81983bf     	stur	xzr, [x29, #-0x68]
 460ca34: 3c848000     	stur	q0, [x0, #0x48]
 460ca38: f9400268     	ldr	x8, [x19]
 460ca3c: f9400108     	ldr	x8, [x8]
 460ca40: 910023e1     	add	x1, sp, #0x8
 460ca44: aa1303e0     	mov	x0, x19
 460ca48: d2800003     	mov	x3, #0x0                ; =0
 460ca4c: d63f0100     	blr	x8
 460ca50: f85883b3     	ldur	x19, [x29, #-0x78]
 460ca54: b4ffdf73     	cbz	x19, 0x460c640 <_ChromeMain+0x46073a4>
 460ca58: f85903a8     	ldur	x8, [x29, #-0x70]
 460ca5c: 8b080d08     	add	x8, x8, x8, lsl #3
 460ca60: d37ced14     	lsl	x20, x8, #4
 460ca64: b40003f4     	cbz	x20, 0x460cae0 <_ChromeMain+0x4607844>
 460ca68: d2800015     	mov	x21, #0x0               ; =0
 460ca6c: aa1303f7     	mov	x23, x19
 460ca70: 14000016     	b	0x460cac8 <_ChromeMain+0x460782c>
 460ca74: 8b1402e8     	add	x8, x23, x20
 460ca78: f85e8100     	ldur	x0, [x8, #-0x18]
 460ca7c: f85f8108     	ldur	x8, [x8, #-0x8]
 460ca80: d37ff901     	lsl	x1, x8, #1
 460ca84: 96e7f10d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460ca88: 8b1402f9     	add	x25, x23, x20
 460ca8c: d1008320     	sub	x0, x25, #0x20
 460ca90: d2800001     	mov	x1, #0x0                ; =0
 460ca94: 96e86c89     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460ca98: d101c320     	sub	x0, x25, #0x70
 460ca9c: 96e86c77     	bl	0x27c78 <_ChromeMain+0x229dc>
 460caa0: 38d87328     	ldursb	w8, [x25, #-0x79]
 460caa4: 36f800a8     	tbz	w8, #0x1f, 0x460cab8 <_ChromeMain+0x460781c>
 460caa8: f9400300     	ldr	x0, [x24]
 460caac: f8580328     	ldur	x8, [x25, #-0x80]
 460cab0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460cab4: 96e7f101     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460cab8: d10242f7     	sub	x23, x23, #0x90
 460cabc: 910242b5     	add	x21, x21, #0x90
 460cac0: eb15029f     	cmp	x20, x21
 460cac4: 54000120     	b.eq	0x460cae8 <_ChromeMain+0x460784c>
 460cac8: 8b1402e8     	add	x8, x23, x20
 460cacc: f1024118     	subs	x24, x8, #0x90
 460cad0: 54fff540     	b.eq	0x460c978 <_ChromeMain+0x46076dc>
 460cad4: 38dff108     	ldursb	w8, [x8, #-0x1]
 460cad8: 36fffd88     	tbz	w8, #0x1f, 0x460ca88 <_ChromeMain+0x46077ec>
 460cadc: 17ffffe6     	b	0x460ca74 <_ChromeMain+0x46077d8>
 460cae0: aa1303e0     	mov	x0, x19
 460cae4: 14000002     	b	0x460caec <_ChromeMain+0x4607850>
 460cae8: f85883a0     	ldur	x0, [x29, #-0x78]
 460caec: cb000268     	sub	x8, x19, x0
 460caf0: 9344fd08     	asr	x8, x8, #4
 460caf4: 9b167d08     	mul	x8, x8, x22
 460caf8: f81903a8     	stur	x8, [x29, #-0x70]
 460cafc: f85983a8     	ldur	x8, [x29, #-0x68]
 460cb00: 8b080d08     	add	x8, x8, x8, lsl #3
 460cb04: d37ced01     	lsl	x1, x8, #4
 460cb08: 96e7f0ec     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460cb0c: 17fffecd     	b	0x460c640 <_ChromeMain+0x46073a4>
 460cb10: 52802400     	mov	w0, #0x120              ; =288
 460cb14: 96e80a15     	bl	0xf368 <_ChromeMain+0xa0cc>
 460cb18: aa0003f6     	mov	x22, x0
 460cb1c: d2800001     	mov	x1, #0x0                ; =0
 460cb20: 9729b5ee     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460cb24: b40000a0     	cbz	x0, 0x460cb38 <_ChromeMain+0x460789c>
 460cb28: b9400ac8     	ldr	w8, [x22, #0x8]
 460cb2c: 31000508     	adds	w8, w8, #0x1
 460cb30: b9000ac8     	str	w8, [x22, #0x8]
 460cb34: 540018a2     	b.hs	0x460ce48 <_ChromeMain+0x4607bac>
 460cb38: aa1503e0     	mov	x0, x21
 460cb3c: aa1603e1     	mov	x1, x22
 460cb40: 9731bdaf     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460cb44: f940b2a0     	ldr	x0, [x21, #0x160]
 460cb48: 1400000e     	b	0x460cb80 <_ChromeMain+0x46078e4>
 460cb4c: f941ea77     	ldr	x23, [x19, #0x3d0]
 460cb50: f94246e8     	ldr	x8, [x23, #0x488]
 460cb54: b40001a8     	cbz	x8, 0x460cb88 <_ChromeMain+0x46078ec>
 460cb58: f9401115     	ldr	x21, [x8, #0x20]
 460cb5c: b4000175     	cbz	x21, 0x460cb88 <_ChromeMain+0x46078ec>
 460cb60: f940b6a8     	ldr	x8, [x21, #0x168]
 460cb64: f9401108     	ldr	x8, [x8, #0x20]
 460cb68: b4000088     	cbz	x8, 0x460cb78 <_ChromeMain+0x46078dc>
 460cb6c: bd401900     	ldr	s0, [x8, #0x18]
 460cb70: 1e202008     	fcmp	s0, #0.0
 460cb74: 540000a0     	b.eq	0x460cb88 <_ChromeMain+0x46078ec>
 460cb78: f940b2a0     	ldr	x0, [x21, #0x160]
 460cb7c: b4fffca0     	cbz	x0, 0x460cb10 <_ChromeMain+0x4607874>
 460cb80: 6f00e400     	movi.2d	v0, #0000000000000000
 460cb84: 97539fed     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 460cb88: f9423ee8     	ldr	x8, [x23, #0x478]
 460cb8c: b40004e8     	cbz	x8, 0x460cc28 <_ChromeMain+0x460798c>
 460cb90: f9407109     	ldr	x9, [x8, #0xe0]
 460cb94: b40004a9     	cbz	x9, 0x460cc28 <_ChromeMain+0x460798c>
 460cb98: 19404129     	ldapurb	w9, [x9, #0x4]
 460cb9c: 35000469     	cbnz	w9, 0x460cc28 <_ChromeMain+0x460798c>
 460cba0: f9407509     	ldr	x9, [x8, #0xe8]
 460cba4: b4000429     	cbz	x9, 0x460cc28 <_ChromeMain+0x460798c>
 460cba8: f9407109     	ldr	x9, [x8, #0xe0]
 460cbac: b4001369     	cbz	x9, 0x460ce18 <_ChromeMain+0x4607b7c>
 460cbb0: 19404129     	ldapurb	w9, [x9, #0x4]
 460cbb4: 35001329     	cbnz	w9, 0x460ce18 <_ChromeMain+0x4607b7c>
 460cbb8: f9407508     	ldr	x8, [x8, #0xe8]
 460cbbc: f9402508     	ldr	x8, [x8, #0x48]
 460cbc0: b4000348     	cbz	x8, 0x460cc28 <_ChromeMain+0x460798c>
 460cbc4: 3949a108     	ldrb	w8, [x8, #0x268]
 460cbc8: 34000308     	cbz	w8, 0x460cc28 <_ChromeMain+0x460798c>
 460cbcc: f9423ef5     	ldr	x21, [x23, #0x478]
 460cbd0: f94072a8     	ldr	x8, [x21, #0xe0]
 460cbd4: b40002a8     	cbz	x8, 0x460cc28 <_ChromeMain+0x460798c>
 460cbd8: 19404108     	ldapurb	w8, [x8, #0x4]
 460cbdc: 35000268     	cbnz	w8, 0x460cc28 <_ChromeMain+0x460798c>
 460cbe0: f94076a8     	ldr	x8, [x21, #0xe8]
 460cbe4: b4000228     	cbz	x8, 0x460cc28 <_ChromeMain+0x460798c>
 460cbe8: f94072a8     	ldr	x8, [x21, #0xe0]
 460cbec: b40011c8     	cbz	x8, 0x460ce24 <_ChromeMain+0x4607b88>
 460cbf0: 19404108     	ldapurb	w8, [x8, #0x4]
 460cbf4: 35001188     	cbnz	w8, 0x460ce24 <_ChromeMain+0x4607b88>
 460cbf8: f94076a8     	ldr	x8, [x21, #0xe8]
 460cbfc: f9402500     	ldr	x0, [x8, #0x48]
 460cc00: b4000060     	cbz	x0, 0x460cc0c <_ChromeMain+0x4607970>
 460cc04: 52800001     	mov	w1, #0x0                ; =0
 460cc08: 9794d67d     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 460cc0c: 9793a9ce     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 460cc10: f9004bf5     	str	x21, [sp, #0x90]
 460cc14: d0030681     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 460cc18: 91389021     	add	x1, x1, #0xe24
 460cc1c: 910243e3     	add	x3, sp, #0x90
 460cc20: d2800002     	mov	x2, #0x0                ; =0
 460cc24: 977034e8     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 460cc28: 2d510680     	ldp	s0, s1, [x20, #0x88]
 460cc2c: 1e254000     	frintm	s0, s0
 460cc30: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 460cc34: 1e222000     	fcmp	s0, s2
 460cc38: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 460cc3c: 1a88b3e9     	csel	w9, wzr, w8, lt
 460cc40: 1e226803     	fmaxnm	s3, s0, s2
 460cc44: 1e38006a     	fcvtzs	w10, s3
 460cc48: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 460cc4c: 1e270163     	fmov	s3, w11
 460cc50: 1e232000     	fcmp	s0, s3
 460cc54: 1a899149     	csel	w9, w10, w9, ls
 460cc58: 1e254020     	frintm	s0, s1
 460cc5c: 1e222000     	fcmp	s0, s2
 460cc60: 1a88b3e8     	csel	w8, wzr, w8, lt
 460cc64: 1e226801     	fmaxnm	s1, s0, s2
 460cc68: 1e38002a     	fcvtzs	w10, s1
 460cc6c: 1e232000     	fcmp	s0, s3
 460cc70: 1a889148     	csel	w8, w10, w8, ls
 460cc74: aa088128     	orr	x8, x9, x8, lsl #32
 460cc78: f9004be8     	str	x8, [sp, #0x90]
 460cc7c: 910243e1     	add	x1, sp, #0x90
 460cc80: aa1303e0     	mov	x0, x19
 460cc84: 9583385a     	bl	0xa6dadec <_ChromeMain+0xa6d5b50>
 460cc88: 34ffc940     	cbz	w0, 0x460c5b0 <_ChromeMain+0x4607314>
 460cc8c: b9405288     	ldr	w8, [x20, #0x50]
 460cc90: 12151108     	and	w8, w8, #0xf800
 460cc94: 7120011f     	cmp	w8, #0x800
 460cc98: 54000200     	b.eq	0x460ccd8 <_ChromeMain+0x4607a3c>
 460cc9c: 7140051f     	cmp	w8, #0x1, lsl #12       ; =0x1000
 460cca0: 54ffc881     	b.ne	0x460c5b0 <_ChromeMain+0x4607314>
 460cca4: f941ea68     	ldr	x8, [x19, #0x3d0]
 460cca8: f941a500     	ldr	x0, [x8, #0x348]
 460ccac: b4ffc820     	cbz	x0, 0x460c5b0 <_ChromeMain+0x4607314>
 460ccb0: f941f269     	ldr	x9, [x19, #0x3e0]
 460ccb4: f941b50a     	ldr	x10, [x8, #0x368]
 460ccb8: eb0a013f     	cmp	x9, x10
 460ccbc: 54ffc7a2     	b.hs	0x460c5b0 <_ChromeMain+0x4607314>
 460ccc0: f941b108     	ldr	x8, [x8, #0x360]
 460ccc4: 52804d0a     	mov	w10, #0x268             ; =616
 460ccc8: 9b0a2128     	madd	x8, x9, x10, x8
 460cccc: 39425109     	ldrb	w9, [x8, #0x94]
 460ccd0: 34ffc709     	cbz	w9, 0x460c5b0 <_ChromeMain+0x4607314>
 460ccd4: 14000035     	b	0x460cda8 <_ChromeMain+0x4607b0c>
 460ccd8: f941ea60     	ldr	x0, [x19, #0x3d0]
 460ccdc: f941f261     	ldr	x1, [x19, #0x3e0]
 460cce0: 97fff552     	bl	0x460a228 <_ChromeMain+0x4604f8c>
 460cce4: 17fffe33     	b	0x460c5b0 <_ChromeMain+0x4607314>
 460cce8: 52802400     	mov	w0, #0x120              ; =288
 460ccec: 96e8099f     	bl	0xf368 <_ChromeMain+0xa0cc>
 460ccf0: aa0003f5     	mov	x21, x0
 460ccf4: d2800001     	mov	x1, #0x0                ; =0
 460ccf8: 9729b578     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460ccfc: b40000a0     	cbz	x0, 0x460cd10 <_ChromeMain+0x4607a74>
 460cd00: b9400aa8     	ldr	w8, [x21, #0x8]
 460cd04: 31000508     	adds	w8, w8, #0x1
 460cd08: b9000aa8     	str	w8, [x21, #0x8]
 460cd0c: 54000922     	b.hs	0x460ce30 <_ChromeMain+0x4607b94>
 460cd10: aa1403e0     	mov	x0, x20
 460cd14: aa1503e1     	mov	x1, x21
 460cd18: 9731bd39     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460cd1c: f940b280     	ldr	x0, [x20, #0x160]
 460cd20: 17fffe19     	b	0x460c584 <_ChromeMain+0x46072e8>
 460cd24: 52802400     	mov	w0, #0x120              ; =288
 460cd28: 96e80990     	bl	0xf368 <_ChromeMain+0xa0cc>
 460cd2c: aa0003f6     	mov	x22, x0
 460cd30: d2800001     	mov	x1, #0x0                ; =0
 460cd34: 9729b569     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460cd38: b40000a0     	cbz	x0, 0x460cd4c <_ChromeMain+0x4607ab0>
 460cd3c: b9400ac8     	ldr	w8, [x22, #0x8]
 460cd40: 31000508     	adds	w8, w8, #0x1
 460cd44: b9000ac8     	str	w8, [x22, #0x8]
 460cd48: 540007a2     	b.hs	0x460ce3c <_ChromeMain+0x4607ba0>
 460cd4c: aa1503e0     	mov	x0, x21
 460cd50: aa1603e1     	mov	x1, x22
 460cd54: 9731bd2a     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460cd58: f940b2a0     	ldr	x0, [x21, #0x160]
 460cd5c: 17fffe9c     	b	0x460c7cc <_ChromeMain+0x4607530>
 460cd60: f9400a61     	ldr	x1, [x19, #0x10]
 460cd64: aa1303e0     	mov	x0, x19
 460cd68: a9597bfd     	ldp	x29, x30, [sp, #0x190]
 460cd6c: a9584ff4     	ldp	x20, x19, [sp, #0x180]
 460cd70: a95757f6     	ldp	x22, x21, [sp, #0x170]
 460cd74: a9565ff8     	ldp	x24, x23, [sp, #0x160]
 460cd78: a95567fa     	ldp	x26, x25, [sp, #0x150]
 460cd7c: 910683ff     	add	sp, sp, #0x1a0
 460cd80: d61f0020     	br	x1
 460cd84: f9400aa8     	ldr	x8, [x21, #0x10]
 460cd88: aa1503e0     	mov	x0, x21
 460cd8c: d63f0100     	blr	x8
 460cd90: 3607db73     	tbz	w19, #0x0, 0x460c8fc <_ChromeMain+0x4607660>
 460cd94: 17fffe2b     	b	0x460c640 <_ChromeMain+0x46073a4>
 460cd98: d101e3a0     	sub	x0, x29, #0x78
 460cd9c: aa1303e1     	mov	x1, x19
 460cda0: 97ff63d2     	bl	0x45e5ce8 <_ChromeMain+0x45e0a4c>
 460cda4: 17fffede     	b	0x460c91c <_ChromeMain+0x4607680>
 460cda8: b9409101     	ldr	w1, [x8, #0x90]
 460cdac: 52800022     	mov	w2, #0x1                ; =1
 460cdb0: 94dd1480     	bl	0x7d51fb0 <_ChromeMain+0x7d4cd14>
 460cdb4: 17fffdff     	b	0x460c5b0 <_ChromeMain+0x4607314>
 460cdb8: d4200000     	brk	#0
 460cdbc: d4400000     	hlt	#0
 460cdc0: d4200020     	brk	#0x1
 460cdc4: d4200000     	brk	#0
 460cdc8: d4400000     	hlt	#0
 460cdcc: d4200020     	brk	#0x1
 460cdd0: d4200000     	brk	#0
 460cdd4: d4400000     	hlt	#0
 460cdd8: d4200020     	brk	#0x1
 460cddc: d4200000     	brk	#0
 460cde0: d4400000     	hlt	#0
 460cde4: 17fffee5     	b	0x460c978 <_ChromeMain+0x46076dc>
 460cde8: d4200000     	brk	#0
 460cdec: d4400000     	hlt	#0
 460cdf0: d4200020     	brk	#0x1
 460cdf4: d4200000     	brk	#0
 460cdf8: d4400000     	hlt	#0
 460cdfc: d4200020     	brk	#0x1
 460ce00: d4200000     	brk	#0
 460ce04: d4400000     	hlt	#0
 460ce08: d4200020     	brk	#0x1
 460ce0c: d4200000     	brk	#0
 460ce10: d4400000     	hlt	#0
 460ce14: d4200020     	brk	#0x1
 460ce18: d4200000     	brk	#0
 460ce1c: d4400000     	hlt	#0
 460ce20: d4200020     	brk	#0x1
 460ce24: d4200000     	brk	#0
 460ce28: d4400000     	hlt	#0
 460ce2c: d4200020     	brk	#0x1
 460ce30: d4200000     	brk	#0
 460ce34: d4400000     	hlt	#0
 460ce38: d4200020     	brk	#0x1
 460ce3c: d4200000     	brk	#0
 460ce40: d4400000     	hlt	#0
 460ce44: d4200020     	brk	#0x1
 460ce48: d4200000     	brk	#0
 460ce4c: d4400000     	hlt	#0
 460ce50: d4200020     	brk	#0x1
