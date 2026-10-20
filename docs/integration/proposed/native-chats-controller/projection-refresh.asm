
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462c2c0: d10503ff     	sub	sp, sp, #0x140
 462c2c4: a90e6ffc     	stp	x28, x27, [sp, #0xe0]
 462c2c8: a90f67fa     	stp	x26, x25, [sp, #0xf0]
 462c2cc: a9105ff8     	stp	x24, x23, [sp, #0x100]
 462c2d0: a91157f6     	stp	x22, x21, [sp, #0x110]
 462c2d4: a9124ff4     	stp	x20, x19, [sp, #0x120]
 462c2d8: a9137bfd     	stp	x29, x30, [sp, #0x130]
 462c2dc: 9104c3fd     	add	x29, sp, #0x130
 462c2e0: 397e4008     	ldrb	w8, [x0, #0xf90]
 462c2e4: 37000aa8     	tbnz	w8, #0x0, 0x462c438 <_ChromeMain+0x462719c>
 462c2e8: aa0003f3     	mov	x19, x0
 462c2ec: f9423408     	ldr	x8, [x0, #0x468]
 462c2f0: b4000a48     	cbz	x8, 0x462c438 <_ChromeMain+0x462719c>
 462c2f4: f9424e68     	ldr	x8, [x19, #0x498]
 462c2f8: b4000a08     	cbz	x8, 0x462c438 <_ChromeMain+0x462719c>
 462c2fc: f9435268     	ldr	x8, [x19, #0x6a0]
 462c300: b40009c8     	cbz	x8, 0x462c438 <_ChromeMain+0x462719c>
 462c304: b0052c28     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 462c308: f9468d08     	ldr	x8, [x8, #0xd18]
 462c30c: d63f0100     	blr	x8
 462c310: aa0003e1     	mov	x1, x0
 462c314: aa1303e0     	mov	x0, x19
 462c318: 94004234     	bl	0x463cbe8 <_ChromeMain+0x463794c>
 462c31c: aa1303e0     	mov	x0, x19
 462c320: 94006853     	bl	0x464646c <_ChromeMain+0x46411d0>
 462c324: f9435268     	ldr	x8, [x19, #0x6a0]
 462c328: f9444508     	ldr	x8, [x8, #0x888]
 462c32c: b4000bc8     	cbz	x8, 0x462c4a4 <_ChromeMain+0x4627208>
 462c330: f9423668     	ldr	x8, [x19, #0x468]
 462c334: f9404901     	ldr	x1, [x8, #0x90]
 462c338: b40000c1     	cbz	x1, 0x462c350 <_ChromeMain+0x46270b4>
 462c33c: aa1303e0     	mov	x0, x19
 462c340: 940068c5     	bl	0x4646654 <_ChromeMain+0x46413b8>
 462c344: f9435268     	ldr	x8, [x19, #0x6a0]
 462c348: f9444508     	ldr	x8, [x8, #0x888]
 462c34c: b4000ac8     	cbz	x8, 0x462c4a4 <_ChromeMain+0x4627208>
 462c350: f9423668     	ldr	x8, [x19, #0x468]
 462c354: f9400100     	ldr	x0, [x8]
 462c358: b9401808     	ldr	w8, [x0, #0x18]
 462c35c: 7100051f     	cmp	w8, #0x1
 462c360: 54000bab     	b.lt	0x462c4d4 <_ChromeMain+0x4627238>
 462c364: d2800014     	mov	x20, #0x0               ; =0
 462c368: 14000045     	b	0x462c47c <_ChromeMain+0x46271e0>
 462c36c: 3941e3f6     	ldrb	w22, [sp, #0x78]
 462c370: 360000f6     	tbz	w22, #0x0, 0x462c38c <_ChromeMain+0x46270f0>
 462c374: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 462c378: 36f800a8     	tbz	w8, #0x1f, 0x462c38c <_ChromeMain+0x46270f0>
 462c37c: f94033e0     	ldr	x0, [sp, #0x60]
 462c380: f9403be8     	ldr	x8, [sp, #0x70]
 462c384: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462c388: 96e772cc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462c38c: aa1303e0     	mov	x0, x19
 462c390: 94003170     	bl	0x4638950 <_ChromeMain+0x46336b4>
 462c394: 39017fff     	strb	wzr, [sp, #0x5f]
 462c398: f9424e61     	ldr	x1, [x19, #0x498]
 462c39c: 91017fe2     	add	x2, sp, #0x5f
 462c3a0: aa1303e0     	mov	x0, x19
 462c3a4: 940058b3     	bl	0x4642670 <_ChromeMain+0x463d3d4>
 462c3a8: 39417fe8     	ldrb	w8, [sp, #0x5f]
 462c3ac: 34000368     	cbz	w8, 0x462c418 <_ChromeMain+0x462717c>
 462c3b0: f942e274     	ldr	x20, [x19, #0x5c0]
 462c3b4: b4000214     	cbz	x20, 0x462c3f4 <_ChromeMain+0x4627158>
 462c3b8: f9423e60     	ldr	x0, [x19, #0x478]
 462c3bc: b4000080     	cbz	x0, 0x462c3cc <_ChromeMain+0x4627130>
 462c3c0: 52800001     	mov	w1, #0x0                ; =0
 462c3c4: 9700102c     	bl	0x630474 <_ChromeMain+0x62b1d8>
 462c3c8: f942e274     	ldr	x20, [x19, #0x5c0]
 462c3cc: 910c8295     	add	x21, x20, #0x320
 462c3d0: f9419280     	ldr	x0, [x20, #0x320]
 462c3d4: 9400d658     	bl	0x4661d34 <_ChromeMain+0x465ca98>
 462c3d8: f9018e95     	str	x21, [x20, #0x318]
 462c3dc: 6f00e400     	movi.2d	v0, #0000000000000000
 462c3e0: 3d80ca80     	str	q0, [x20, #0x320]
 462c3e4: f9400288     	ldr	x8, [x20]
 462c3e8: f9418508     	ldr	x8, [x8, #0x308]
 462c3ec: aa1403e0     	mov	x0, x20
 462c3f0: d63f0100     	blr	x8
 462c3f4: f9423e60     	ldr	x0, [x19, #0x478]
 462c3f8: b4000060     	cbz	x0, 0x462c404 <_ChromeMain+0x4627168>
 462c3fc: 52800001     	mov	w1, #0x0                ; =0
 462c400: 9700101d     	bl	0x630474 <_ChromeMain+0x62b1d8>
 462c404: aa1303e0     	mov	x0, x19
 462c408: 940063fe     	bl	0x4645400 <_ChromeMain+0x4640164>
 462c40c: aa1303e0     	mov	x0, x19
 462c410: 52800001     	mov	w1, #0x0                ; =0
 462c414: 97001018     	bl	0x630474 <_ChromeMain+0x62b1d8>
 462c418: 385983a8     	ldurb	w8, [x29, #-0x68]
 462c41c: 340000e8     	cbz	w8, 0x462c438 <_ChromeMain+0x462719c>
 462c420: 38d973a8     	ldursb	w8, [x29, #-0x69]
 462c424: 36f800a8     	tbz	w8, #0x1f, 0x462c438 <_ChromeMain+0x462719c>
 462c428: f85803a0     	ldur	x0, [x29, #-0x80]
 462c42c: f85903a8     	ldur	x8, [x29, #-0x70]
 462c430: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462c434: 96e772a1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462c438: a9537bfd     	ldp	x29, x30, [sp, #0x130]
 462c43c: a9524ff4     	ldp	x20, x19, [sp, #0x120]
 462c440: a95157f6     	ldp	x22, x21, [sp, #0x110]
 462c444: a9505ff8     	ldp	x24, x23, [sp, #0x100]
 462c448: a94f67fa     	ldp	x26, x25, [sp, #0xf0]
 462c44c: a94e6ffc     	ldp	x28, x27, [sp, #0xe0]
 462c450: 910503ff     	add	sp, sp, #0x140
 462c454: d65f03c0     	ret
 462c458: aa0003e1     	mov	x1, x0
 462c45c: aa1303e0     	mov	x0, x19
 462c460: 9400687d     	bl	0x4646654 <_ChromeMain+0x46413b8>
 462c464: 91000694     	add	x20, x20, #0x1
 462c468: f9423668     	ldr	x8, [x19, #0x468]
 462c46c: f9400100     	ldr	x0, [x8]
 462c470: b9801808     	ldrsw	x8, [x0, #0x18]
 462c474: eb08029f     	cmp	x20, x8
 462c478: 5400010a     	b.ge	0x462c498 <_ChromeMain+0x46271fc>
 462c47c: f9435268     	ldr	x8, [x19, #0x6a0]
 462c480: f9444508     	ldr	x8, [x8, #0x888]
 462c484: b4000108     	cbz	x8, 0x462c4a4 <_ChromeMain+0x4627208>
 462c488: aa1403e1     	mov	x1, x20
 462c48c: 9728c79b     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462c490: b4fffea0     	cbz	x0, 0x462c464 <_ChromeMain+0x46271c8>
 462c494: 17fffff1     	b	0x462c458 <_ChromeMain+0x46271bc>
 462c498: f9435268     	ldr	x8, [x19, #0x6a0]
 462c49c: f9444508     	ldr	x8, [x8, #0x888]
 462c4a0: b50001a8     	cbnz	x8, 0x462c4d4 <_ChromeMain+0x4627238>
 462c4a4: f947de68     	ldr	x8, [x19, #0xfb8]
 462c4a8: d37ef509     	lsl	x9, x8, #2
 462c4ac: b4000129     	cbz	x9, 0x462c4d0 <_ChromeMain+0x4627234>
 462c4b0: f947da6a     	ldr	x10, [x19, #0xfb0]
 462c4b4: cb080be8     	neg	x8, x8, lsl #2
 462c4b8: 8b0a0129     	add	x9, x9, x10
 462c4bc: d1001129     	sub	x9, x9, #0x4
 462c4c0: b4000449     	cbz	x9, 0x462c548 <_ChromeMain+0x46272ac>
 462c4c4: d1001129     	sub	x9, x9, #0x4
 462c4c8: 91001108     	add	x8, x8, #0x4
 462c4cc: b5ffffa8     	cbnz	x8, 0x462c4c0 <_ChromeMain+0x4627224>
 462c4d0: f907de7f     	str	xzr, [x19, #0xfb8]
 462c4d4: f9423668     	ldr	x8, [x19, #0x468]
 462c4d8: f9404916     	ldr	x22, [x8, #0x90]
 462c4dc: b4000276     	cbz	x22, 0x462c528 <_ChromeMain+0x462728c>
 462c4e0: b94012c9     	ldr	w9, [x22, #0x10]
 462c4e4: b90037e9     	str	w9, [sp, #0x34]
 462c4e8: 6f00e400     	movi.2d	v0, #0000000000000000
 462c4ec: ad3c03a0     	stp	q0, q0, [x29, #-0x80]
 462c4f0: f9400100     	ldr	x0, [x8]
 462c4f4: b9401808     	ldr	w8, [x0, #0x18]
 462c4f8: 7100051f     	cmp	w8, #0x1
 462c4fc: 540001ab     	b.lt	0x462c530 <_ChromeMain+0x4627294>
 462c500: d2800017     	mov	x23, #0x0               ; =0
 462c504: 5280001c     	mov	w28, #0x0               ; =0
 462c508: d280001b     	mov	x27, #0x0               ; =0
 462c50c: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 462c510: d280001a     	mov	x26, #0x0               ; =0
 462c514: d2800019     	mov	x25, #0x0               ; =0
 462c518: 91400674     	add	x20, x19, #0x1, lsl #12 ; =0x1000
 462c51c: 52800515     	mov	w21, #0x28              ; =40
 462c520: f9001ff6     	str	x22, [sp, #0x38]
 462c524: 14000121     	b	0x462c9a8 <_ChromeMain+0x462770c>
 462c528: b90037ff     	str	wzr, [sp, #0x34]
 462c52c: 17ffffef     	b	0x462c4e8 <_ChromeMain+0x462724c>
 462c530: d2800019     	mov	x25, #0x0               ; =0
 462c534: f9002bff     	str	xzr, [sp, #0x50]
 462c538: d280001a     	mov	x26, #0x0               ; =0
 462c53c: d280001b     	mov	x27, #0x0               ; =0
 462c540: d280001c     	mov	x28, #0x0               ; =0
 462c544: 1400002b     	b	0x462c5f0 <_ChromeMain+0x4627354>
 462c548: d4200020     	brk	#0x1
 462c54c: f90027fa     	str	x26, [sp, #0x48]
 462c550: f94053e8     	ldr	x8, [sp, #0xa0]
 462c554: d379e109     	lsl	x9, x8, #7
 462c558: eb080d35     	subs	x21, x9, x8, lsl #3
 462c55c: 540045e0     	b.eq	0x462ce18 <_ChromeMain+0x4627b7c>
 462c560: d2800016     	mov	x22, #0x0               ; =0
 462c564: aa1403f7     	mov	x23, x20
 462c568: 8b1502fa     	add	x26, x23, x21
 462c56c: f101e358     	subs	x24, x26, #0x78
 462c570: 54fffec0     	b.eq	0x462c548 <_ChromeMain+0x46272ac>
 462c574: d1002340     	sub	x0, x26, #0x8
 462c578: d2800001     	mov	x1, #0x0                ; =0
 462c57c: 96e7edcf     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 462c580: d1016340     	sub	x0, x26, #0x58
 462c584: 96e7edbd     	bl	0x27c78 <_ChromeMain+0x229dc>
 462c588: 38d9f348     	ldursb	w8, [x26, #-0x61]
 462c58c: 36f800c8     	tbz	w8, #0x1f, 0x462c5a4 <_ChromeMain+0x4627308>
 462c590: f9400300     	ldr	x0, [x24]
 462c594: 8b1502e8     	add	x8, x23, x21
 462c598: f8598108     	ldur	x8, [x8, #-0x68]
 462c59c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462c5a0: 96e77246     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462c5a4: d101e2f7     	sub	x23, x23, #0x78
 462c5a8: 9101e2d6     	add	x22, x22, #0x78
 462c5ac: eb1602bf     	cmp	x21, x22
 462c5b0: 54fffdc1     	b.ne	0x462c568 <_ChromeMain+0x46272cc>
 462c5b4: f9404fe0     	ldr	x0, [sp, #0x98]
 462c5b8: cb000288     	sub	x8, x20, x0
 462c5bc: 9343fd08     	asr	x8, x8, #3
 462c5c0: b203ebe9     	mov	x9, #-0x1111111111111112 ; =-1229782938247303442
 462c5c4: f29ddde9     	movk	x9, #0xeeef
 462c5c8: 9b097d08     	mul	x8, x8, x9
 462c5cc: f90053e8     	str	x8, [sp, #0xa0]
 462c5d0: f94057e8     	ldr	x8, [sp, #0xa8]
 462c5d4: d379e109     	lsl	x9, x8, #7
 462c5d8: cb080d21     	sub	x1, x9, x8, lsl #3
 462c5dc: 96e77237     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462c5e0: f94027fa     	ldr	x26, [sp, #0x48]
 462c5e4: 1400000c     	b	0x462c614 <_ChromeMain+0x4627378>
 462c5e8: b378df7c     	bfi	x28, x27, #8, #56
 462c5ec: f94027fb     	ldr	x27, [sp, #0x48]
 462c5f0: aa1303e0     	mov	x0, x19
 462c5f4: 9400679e     	bl	0x464646c <_ChromeMain+0x46411d0>
 462c5f8: f9435260     	ldr	x0, [x19, #0x6a0]
 462c5fc: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 462c600: f9004fff     	str	xzr, [sp, #0x98]
 462c604: 910263e1     	add	x1, sp, #0x98
 462c608: 97ff9c29     	bl	0x46136ac <_ChromeMain+0x460e410>
 462c60c: f9404ff4     	ldr	x20, [sp, #0x98]
 462c610: b5fff9f4     	cbnz	x20, 0x462c54c <_ChromeMain+0x46272b0>
 462c614: f9435260     	ldr	x0, [x19, #0x6a0]
 462c618: a90867fa     	stp	x26, x25, [sp, #0x80]
 462c61c: f9402be8     	ldr	x8, [sp, #0x50]
 462c620: f9004be8     	str	x8, [sp, #0x90]
 462c624: 910203e1     	add	x1, sp, #0x80
 462c628: 97ff9e84     	bl	0x4614038 <_ChromeMain+0x460ed9c>
 462c62c: f94043e0     	ldr	x0, [sp, #0x80]
 462c630: b40001e0     	cbz	x0, 0x462c66c <_ChromeMain+0x46273d0>
 462c634: f94047e8     	ldr	x8, [sp, #0x88]
 462c638: d37ced09     	lsl	x9, x8, #4
 462c63c: b4000109     	cbz	x9, 0x462c65c <_ChromeMain+0x46273c0>
 462c640: cb0813e8     	neg	x8, x8, lsl #4
 462c644: 8b000129     	add	x9, x9, x0
 462c648: d1004129     	sub	x9, x9, #0x10
 462c64c: b4fff7e9     	cbz	x9, 0x462c548 <_ChromeMain+0x46272ac>
 462c650: d1004129     	sub	x9, x9, #0x10
 462c654: 91004108     	add	x8, x8, #0x10
 462c658: b5ffffa8     	cbnz	x8, 0x462c64c <_ChromeMain+0x46273b0>
 462c65c: f90047ff     	str	xzr, [sp, #0x88]
 462c660: f9404be8     	ldr	x8, [sp, #0x90]
 462c664: d37ced01     	lsl	x1, x8, #4
 462c668: 96e77214     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462c66c: f9435260     	ldr	x0, [x19, #0x6a0]
 462c670: aa1c03e1     	mov	x1, x28
 462c674: aa1b03e2     	mov	x2, x27
 462c678: 97ff9ed5     	bl	0x46141cc <_ChromeMain+0x460ef30>
 462c67c: f9435260     	ldr	x0, [x19, #0x6a0]
 462c680: 395bc408     	ldrb	w8, [x0, #0x6f1]
 462c684: 6b3b011f     	cmp	w8, w27, uxtb
 462c688: 54000060     	b.eq	0x462c694 <_ChromeMain+0x46273f8>
 462c68c: 391bc41b     	strb	w27, [x0, #0x6f1]
 462c690: 97ff9bd3     	bl	0x46135dc <_ChromeMain+0x460e340>
 462c694: f942e674     	ldr	x20, [x19, #0x5c8]
 462c698: b4ffe7b4     	cbz	x20, 0x462c38c <_ChromeMain+0x46270f0>
 462c69c: 390183ff     	strb	wzr, [sp, #0x60]
 462c6a0: 3901e3ff     	strb	wzr, [sp, #0x78]
 462c6a4: 385983b6     	ldurb	w22, [x29, #-0x68]
 462c6a8: 34000136     	cbz	w22, 0x462c6cc <_ChromeMain+0x4627430>
 462c6ac: 38d973a8     	ldursb	w8, [x29, #-0x69]
 462c6b0: 37f801a8     	tbnz	w8, #0x1f, 0x462c6e4 <_ChromeMain+0x4627448>
 462c6b4: 3cd803a0     	ldur	q0, [x29, #-0x80]
 462c6b8: 3d801be0     	str	q0, [sp, #0x60]
 462c6bc: f85903a8     	ldur	x8, [x29, #-0x70]
 462c6c0: f9003be8     	str	x8, [sp, #0x70]
 462c6c4: 52800028     	mov	w8, #0x1                ; =1
 462c6c8: 3901e3e8     	strb	w8, [sp, #0x78]
 462c6cc: f941d288     	ldr	x8, [x20, #0x3a0]
 462c6d0: d37df115     	lsl	x21, x8, #3
 462c6d4: b4ffe4f5     	cbz	x21, 0x462c370 <_ChromeMain+0x46270d4>
 462c6d8: f941ce96     	ldr	x22, [x20, #0x398]
 462c6dc: 910183f7     	add	x23, sp, #0x60
 462c6e0: 14000012     	b	0x462c728 <_ChromeMain+0x462748c>
 462c6e4: a9780ba1     	ldp	x1, x2, [x29, #-0x80]
 462c6e8: 910183e0     	add	x0, sp, #0x60
 462c6ec: 96e7aecb     	bl	0x18218 <_ChromeMain+0x12f7c>
 462c6f0: 17fffff5     	b	0x462c6c4 <_ChromeMain+0x4627428>
 462c6f4: 52800008     	mov	w8, #0x0                ; =0
 462c6f8: 3955aa89     	ldrb	w9, [x20, #0x56a]
 462c6fc: 6b08013f     	cmp	w9, w8
 462c700: 540000e0     	b.eq	0x462c71c <_ChromeMain+0x4627480>
 462c704: 3915aa88     	strb	w8, [x20, #0x56a]
 462c708: aa1403e0     	mov	x0, x20
 462c70c: 940116ad     	bl	0x46721c0 <_ChromeMain+0x466cf24>
 462c710: f940c680     	ldr	x0, [x20, #0x188]
 462c714: b4000040     	cbz	x0, 0x462c71c <_ChromeMain+0x4627480>
 462c718: 96fdd299     	bl	0x5a117c <_ChromeMain+0x59bee0>
 462c71c: 910022d6     	add	x22, x22, #0x8
 462c720: f10022b5     	subs	x21, x21, #0x8
 462c724: 54ffe240     	b.eq	0x462c36c <_ChromeMain+0x46270d0>
 462c728: f94002d4     	ldr	x20, [x22]
 462c72c: 3941e3e8     	ldrb	w8, [sp, #0x78]
 462c730: 34fffe48     	cbz	w8, 0x462c6f8 <_ChromeMain+0x462745c>
 462c734: 39531e89     	ldrb	w9, [x20, #0x4c7]
 462c738: 13001d28     	sxtb	w8, w9
 462c73c: f9425e8a     	ldr	x10, [x20, #0x4b8]
 462c740: 7100011f     	cmp	w8, #0x0
 462c744: 9a894142     	csel	x2, x10, x9, mi
 462c748: 3941dfea     	ldrb	w10, [sp, #0x77]
 462c74c: 13001d49     	sxtb	w9, w10
 462c750: f94037eb     	ldr	x11, [sp, #0x68]
 462c754: 7100013f     	cmp	w9, #0x0
 462c758: 9a8a416a     	csel	x10, x11, x10, mi
 462c75c: eb0a005f     	cmp	x2, x10
 462c760: 54fffca1     	b.ne	0x462c6f4 <_ChromeMain+0x4627458>
 462c764: 9112c28a     	add	x10, x20, #0x4b0
 462c768: f9425a8b     	ldr	x11, [x20, #0x4b0]
 462c76c: 7100011f     	cmp	w8, #0x0
 462c770: 9a8a4160     	csel	x0, x11, x10, mi
 462c774: f94033e8     	ldr	x8, [sp, #0x60]
 462c778: 7100013f     	cmp	w9, #0x0
 462c77c: 9a974101     	csel	x1, x8, x23, mi
 462c780: 94e77438     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462c784: 7100001f     	cmp	w0, #0x0
 462c788: 1a9f17e8     	cset	w8, eq
 462c78c: 17ffffdb     	b	0x462c6f8 <_ChromeMain+0x462745c>
 462c790: aa0903eb     	mov	x11, x9
 462c794: 14000028     	b	0x462c834 <_ChromeMain+0x4627598>
 462c798: aa0903eb     	mov	x11, x9
 462c79c: 14000011     	b	0x462c7e0 <_ChromeMain+0x4627544>
 462c7a0: b9401308     	ldr	w8, [x24, #0x10]
 462c7a4: f9486e69     	ldr	x9, [x19, #0x10d8]
 462c7a8: f948726a     	ldr	x10, [x19, #0x10e0]
 462c7ac: d37ef54b     	lsl	x11, x10, #2
 462c7b0: b4ffff4b     	cbz	x11, 0x462c798 <_ChromeMain+0x46274fc>
 462c7b4: 9342fd6c     	asr	x12, x11, #2
 462c7b8: aa0903eb     	mov	x11, x9
 462c7bc: d341fd8d     	lsr	x13, x12, #1
 462c7c0: 8b0d096e     	add	x14, x11, x13, lsl #2
 462c7c4: b84045cf     	ldr	w15, [x14], #0x4
 462c7c8: aa6c07f0     	mvn	x16, x12, lsr #1
 462c7cc: 8b10018c     	add	x12, x12, x16
 462c7d0: 6b0801ff     	cmp	w15, w8
 462c7d4: 9a8db18c     	csel	x12, x12, x13, lt
 462c7d8: 9a8bb1cb     	csel	x11, x14, x11, lt
 462c7dc: b5ffff0c     	cbnz	x12, 0x462c7bc <_ChromeMain+0x4627520>
 462c7e0: 8b0a0929     	add	x9, x9, x10, lsl #2
 462c7e4: eb09017f     	cmp	x11, x9
 462c7e8: 54000080     	b.eq	0x462c7f8 <_ChromeMain+0x462755c>
 462c7ec: b9400169     	ldr	w9, [x11]
 462c7f0: 6b09011f     	cmp	w8, w9
 462c7f4: 5400090a     	b.ge	0x462c914 <_ChromeMain+0x4627678>
 462c7f8: f9484a69     	ldr	x9, [x19, #0x1090]
 462c7fc: f9484e6a     	ldr	x10, [x19, #0x1098]
 462c800: d37ef54b     	lsl	x11, x10, #2
 462c804: b4fffc6b     	cbz	x11, 0x462c790 <_ChromeMain+0x46274f4>
 462c808: 9342fd6c     	asr	x12, x11, #2
 462c80c: aa0903eb     	mov	x11, x9
 462c810: d341fd8d     	lsr	x13, x12, #1
 462c814: 8b0d096e     	add	x14, x11, x13, lsl #2
 462c818: b84045cf     	ldr	w15, [x14], #0x4
 462c81c: aa6c07f0     	mvn	x16, x12, lsr #1
 462c820: 8b10018c     	add	x12, x12, x16
 462c824: 6b0801ff     	cmp	w15, w8
 462c828: 9a8db18c     	csel	x12, x12, x13, lt
 462c82c: 9a8bb1cb     	csel	x11, x14, x11, lt
 462c830: b5ffff0c     	cbnz	x12, 0x462c810 <_ChromeMain+0x4627574>
 462c834: 8b0a0929     	add	x9, x9, x10, lsl #2
 462c838: eb09017f     	cmp	x11, x9
 462c83c: 54000080     	b.eq	0x462c84c <_ChromeMain+0x46275b0>
 462c840: b9400169     	ldr	w9, [x11]
 462c844: 6b09011f     	cmp	w8, w9
 462c848: 5400066a     	b.ge	0x462c914 <_ChromeMain+0x4627678>
 462c84c: f947e669     	ldr	x9, [x19, #0xfc8]
 462c850: f947ea6b     	ldr	x11, [x19, #0xfd0]
 462c854: d37be96a     	lsl	x10, x11, #5
 462c858: aa0903ec     	mov	x12, x9
 462c85c: b400018a     	cbz	x10, 0x462c88c <_ChromeMain+0x46275f0>
 462c860: 9345fd4d     	asr	x13, x10, #5
 462c864: aa0903ec     	mov	x12, x9
 462c868: d341fdae     	lsr	x14, x13, #1
 462c86c: 8b0e158f     	add	x15, x12, x14, lsl #5
 462c870: b84205f0     	ldr	w16, [x15], #0x20
 462c874: aa6d07f1     	mvn	x17, x13, lsr #1
 462c878: 8b1101ad     	add	x13, x13, x17
 462c87c: 6b08021f     	cmp	w16, w8
 462c880: 9a8eb1ad     	csel	x13, x13, x14, lt
 462c884: 9a8cb1ec     	csel	x12, x15, x12, lt
 462c888: b5ffff0d     	cbnz	x13, 0x462c868 <_ChromeMain+0x46275cc>
 462c88c: 8b0b152b     	add	x11, x9, x11, lsl #5
 462c890: eb0b019f     	cmp	x12, x11
 462c894: 54000400     	b.eq	0x462c914 <_ChromeMain+0x4627678>
 462c898: b940018c     	ldr	w12, [x12]
 462c89c: 6b0c011f     	cmp	w8, w12
 462c8a0: 540003ab     	b.lt	0x462c914 <_ChromeMain+0x4627678>
 462c8a4: b400016a     	cbz	x10, 0x462c8d0 <_ChromeMain+0x4627634>
 462c8a8: 9345fd4a     	asr	x10, x10, #5
 462c8ac: d341fd4c     	lsr	x12, x10, #1
 462c8b0: 8b0c152d     	add	x13, x9, x12, lsl #5
 462c8b4: b84205ae     	ldr	w14, [x13], #0x20
 462c8b8: aa6a07ef     	mvn	x15, x10, lsr #1
 462c8bc: 8b0f014a     	add	x10, x10, x15
 462c8c0: 6b0801df     	cmp	w14, w8
 462c8c4: 9a8cb14a     	csel	x10, x10, x12, lt
 462c8c8: 9a89b1a9     	csel	x9, x13, x9, lt
 462c8cc: b5ffff0a     	cbnz	x10, 0x462c8ac <_ChromeMain+0x4627610>
 462c8d0: eb0b013f     	cmp	x9, x11
 462c8d4: 540005e0     	b.eq	0x462c990 <_ChromeMain+0x46276f4>
 462c8d8: b940012a     	ldr	w10, [x9]
 462c8dc: 6b0a011f     	cmp	w8, w10
 462c8e0: fa40aac4     	ccmp	x22, #0x0, #0x4, ge
 462c8e4: b94037ea     	ldr	w10, [sp, #0x34]
 462c8e8: 7a4a1100     	ccmp	w8, w10, #0x0, ne
 462c8ec: 54000521     	b.ne	0x462c990 <_ChromeMain+0x46276f4>
 462c8f0: 14000122     	b	0x462cd78 <_ChromeMain+0x4627adc>
 462c8f4: aa0803ea     	mov	x10, x8
 462c8f8: 1400001f     	b	0x462c974 <_ChromeMain+0x46276d8>
 462c8fc: 39418708     	ldrb	w8, [x24, #0x61]
 462c900: 370000a8     	tbnz	w8, #0x0, 0x462c914 <_ChromeMain+0x4627678>
 462c904: 3941e308     	ldrb	w8, [x24, #0x78]
 462c908: 37000068     	tbnz	w8, #0x0, 0x462c914 <_ChromeMain+0x4627678>
 462c90c: 39624268     	ldrb	w8, [x19, #0x890]
 462c910: 35fff488     	cbnz	w8, 0x462c7a0 <_ChromeMain+0x4627504>
 462c914: aa1303e0     	mov	x0, x19
 462c918: aa1803e1     	mov	x1, x24
 462c91c: 940055da     	bl	0x4642084 <_ChromeMain+0x463cde8>
 462c920: 34000380     	cbz	w0, 0x462c990 <_ChromeMain+0x46276f4>
 462c924: b9401314     	ldr	w20, [x24, #0x10]
 462c928: f947ce68     	ldr	x8, [x19, #0xf98]
 462c92c: f947d269     	ldr	x9, [x19, #0xfa0]
 462c930: 8b09092a     	add	x10, x9, x9, lsl #2
 462c934: d37df14a     	lsl	x10, x10, #3
 462c938: b4fffdea     	cbz	x10, 0x462c8f4 <_ChromeMain+0x4627658>
 462c93c: 9343fd4a     	asr	x10, x10, #3
 462c940: b202e7eb     	mov	x11, #-0x3333333333333334 ; =-3689348814741910324
 462c944: f29999ab     	movk	x11, #0xcccd
 462c948: 9b0b7d4b     	mul	x11, x10, x11
 462c94c: aa0803ea     	mov	x10, x8
 462c950: d341fd6c     	lsr	x12, x11, #1
 462c954: 9b15298d     	madd	x13, x12, x21, x10
 462c958: b84285ae     	ldr	w14, [x13], #0x28
 462c95c: aa6b07ef     	mvn	x15, x11, lsr #1
 462c960: 8b0f016b     	add	x11, x11, x15
 462c964: 6b1401df     	cmp	w14, w20
 462c968: 9a8cb16b     	csel	x11, x11, x12, lt
 462c96c: 9a8ab1aa     	csel	x10, x13, x10, lt
 462c970: b5ffff0b     	cbnz	x11, 0x462c950 <_ChromeMain+0x46276b4>
 462c974: 9b152128     	madd	x8, x9, x21, x8
 462c978: eb08015f     	cmp	x10, x8
 462c97c: 54000080     	b.eq	0x462c98c <_ChromeMain+0x46276f0>
 462c980: b9400148     	ldr	w8, [x10]
 462c984: 6b08029f     	cmp	w20, w8
 462c988: 54000a0a     	b.ge	0x462cac8 <_ChromeMain+0x462782c>
 462c98c: 91400674     	add	x20, x19, #0x1, lsl #12 ; =0x1000
 462c990: 910006f7     	add	x23, x23, #0x1
 462c994: f9423668     	ldr	x8, [x19, #0x468]
 462c998: f9400100     	ldr	x0, [x8]
 462c99c: b9801808     	ldrsw	x8, [x0, #0x18]
 462c9a0: eb0802ff     	cmp	x23, x8
 462c9a4: 54ffe22a     	b.ge	0x462c5e8 <_ChromeMain+0x462734c>
 462c9a8: aa1703e1     	mov	x1, x23
 462c9ac: 9728c653     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462c9b0: b4ffff00     	cbz	x0, 0x462c990 <_ChromeMain+0x46276f4>
 462c9b4: aa0003f8     	mov	x24, x0
 462c9b8: aa1303e0     	mov	x0, x19
 462c9bc: aa1803e1     	mov	x1, x24
 462c9c0: 94006534     	bl	0x4645e90 <_ChromeMain+0x4640bf4>
 462c9c4: aa1303e0     	mov	x0, x19
 462c9c8: aa1803e1     	mov	x1, x24
 462c9cc: 94006963     	bl	0x4646f58 <_ChromeMain+0x4641cbc>
 462c9d0: aa1303e0     	mov	x0, x19
 462c9d4: aa1803e1     	mov	x1, x24
 462c9d8: 9400472a     	bl	0x463e680 <_ChromeMain+0x46393e4>
 462c9dc: 39409288     	ldrb	w8, [x20, #0x24]
 462c9e0: 34fff8e8     	cbz	w8, 0x462c8fc <_ChromeMain+0x4627660>
 462c9e4: b9401308     	ldr	w8, [x24, #0x10]
 462c9e8: b9502269     	ldr	w9, [x19, #0x1020]
 462c9ec: 6b09011f     	cmp	w8, w9
 462c9f0: 54fff861     	b.ne	0x462c8fc <_ChromeMain+0x4627660>
 462c9f4: f947e669     	ldr	x9, [x19, #0xfc8]
 462c9f8: f947ea6a     	ldr	x10, [x19, #0xfd0]
 462c9fc: d37be94b     	lsl	x11, x10, #5
 462ca00: b40003ab     	cbz	x11, 0x462ca74 <_ChromeMain+0x46277d8>
 462ca04: 9345fd6c     	asr	x12, x11, #5
 462ca08: aa0903eb     	mov	x11, x9
 462ca0c: d341fd8d     	lsr	x13, x12, #1
 462ca10: 8b0d156e     	add	x14, x11, x13, lsl #5
 462ca14: b84205cf     	ldr	w15, [x14], #0x20
 462ca18: aa6c07f0     	mvn	x16, x12, lsr #1
 462ca1c: 8b10018c     	add	x12, x12, x16
 462ca20: 6b0801ff     	cmp	w15, w8
 462ca24: 9a8db18c     	csel	x12, x12, x13, lt
 462ca28: 9a8bb1cb     	csel	x11, x14, x11, lt
 462ca2c: b5ffff0c     	cbnz	x12, 0x462ca0c <_ChromeMain+0x4627770>
 462ca30: 8b0a1529     	add	x9, x9, x10, lsl #5
 462ca34: eb09017f     	cmp	x11, x9
 462ca38: 54000080     	b.eq	0x462ca48 <_ChromeMain+0x46277ac>
 462ca3c: b9400169     	ldr	w9, [x11]
 462ca40: 6b09011f     	cmp	w8, w9
 462ca44: 54fff5ca     	b.ge	0x462c8fc <_ChromeMain+0x4627660>
 462ca48: aa1303e0     	mov	x0, x19
 462ca4c: aa1803e1     	mov	x1, x24
 462ca50: 94008332     	bl	0x464d718 <_ChromeMain+0x464847c>
 462ca54: 3707f9e0     	tbnz	w0, #0x0, 0x462c990 <_ChromeMain+0x46276f4>
 462ca58: 3940b288     	ldrb	w8, [x20, #0x2c]
 462ca5c: 34fff508     	cbz	w8, 0x462c8fc <_ChromeMain+0x4627660>
 462ca60: b9401308     	ldr	w8, [x24, #0x10]
 462ca64: b9502a69     	ldr	w9, [x19, #0x1028]
 462ca68: 6b08013f     	cmp	w9, w8
 462ca6c: 54fff920     	b.eq	0x462c990 <_ChromeMain+0x46276f4>
 462ca70: 17ffffa3     	b	0x462c8fc <_ChromeMain+0x4627660>
 462ca74: aa0903eb     	mov	x11, x9
 462ca78: 17ffffee     	b	0x462ca30 <_ChromeMain+0x4627794>
 462ca7c: aa1c03fa     	mov	x26, x28
 462ca80: f9401ff6     	ldr	x22, [sp, #0x38]
 462ca84: aa1003fc     	mov	x28, x16
 462ca88: f94023fb     	ldr	x27, [sp, #0x40]
 462ca8c: 17ffffc0     	b	0x462c98c <_ChromeMain+0x46276f0>
 462ca90: b9000b14     	str	w20, [x24, #0x8]
 462ca94: aa1c03fa     	mov	x26, x28
 462ca98: f9401ff6     	ldr	x22, [sp, #0x38]
 462ca9c: aa1003fc     	mov	x28, x16
 462caa0: b4ffff56     	cbz	x22, 0x462ca88 <_ChromeMain+0x46277ec>
 462caa4: d348ff68     	lsr	x8, x27, #8
 462caa8: b94037e9     	ldr	w9, [sp, #0x34]
 462caac: 6b09029f     	cmp	w20, w9
 462cab0: 1a9b139c     	csel	w28, w28, w27, ne
 462cab4: a94427fb     	ldp	x27, x9, [sp, #0x40]
 462cab8: 9a9f1529     	csinc	x9, x9, xzr, ne
 462cabc: f90027e9     	str	x9, [sp, #0x48]
 462cac0: 9a88137b     	csel	x27, x27, x8, ne
 462cac4: 17ffffb2     	b	0x462c98c <_ChromeMain+0x46276f0>
 462cac8: f90023fb     	str	x27, [sp, #0x40]
 462cacc: aa1c03f0     	mov	x16, x28
 462cad0: f940055b     	ldr	x27, [x10, #0x8]
 462cad4: d37cef28     	lsl	x8, x25, #4
 462cad8: 9340ef29     	sbfx	x9, x25, #0, #60
 462cadc: aa1a03ea     	mov	x10, x26
 462cae0: b4000188     	cbz	x8, 0x462cb10 <_ChromeMain+0x4627874>
 462cae4: aa1a03ea     	mov	x10, x26
 462cae8: aa0903eb     	mov	x11, x9
 462caec: d341fd6c     	lsr	x12, x11, #1
 462caf0: 8b0c114d     	add	x13, x10, x12, lsl #4
 462caf4: f84105ae     	ldr	x14, [x13], #0x10
 462caf8: aa6b07ef     	mvn	x15, x11, lsr #1
 462cafc: 8b0f016b     	add	x11, x11, x15
 462cb00: eb1b01df     	cmp	x14, x27
 462cb04: 9a8cb16b     	csel	x11, x11, x12, lt
 462cb08: 9a8ab1aa     	csel	x10, x13, x10, lt
 462cb0c: b5ffff0b     	cbnz	x11, 0x462caec <_ChromeMain+0x4627850>
 462cb10: aa1a03fc     	mov	x28, x26
 462cb14: 8b191356     	add	x22, x26, x25, lsl #4
 462cb18: eb16015f     	cmp	x10, x22
 462cb1c: 54000120     	b.eq	0x462cb40 <_ChromeMain+0x46278a4>
 462cb20: f940014a     	ldr	x10, [x10]
 462cb24: eb0a037f     	cmp	x27, x10
 462cb28: 540000cb     	b.lt	0x462cb40 <_ChromeMain+0x46278a4>
 462cb2c: f9401fea     	ldr	x10, [sp, #0x38]
 462cb30: b4fffa6a     	cbz	x10, 0x462ca7c <_ChromeMain+0x46277e0>
 462cb34: b94037ea     	ldr	w10, [sp, #0x34]
 462cb38: 6b0a029f     	cmp	w20, w10
 462cb3c: 54fffac1     	b.ne	0x462ca94 <_ChromeMain+0x46277f8>
 462cb40: aa1c03f8     	mov	x24, x28
 462cb44: b4000168     	cbz	x8, 0x462cb70 <_ChromeMain+0x46278d4>
 462cb48: aa1c03f8     	mov	x24, x28
 462cb4c: d341fd2a     	lsr	x10, x9, #1
 462cb50: 8b0a130b     	add	x11, x24, x10, lsl #4
 462cb54: f841056c     	ldr	x12, [x11], #0x10
 462cb58: aa6907ed     	mvn	x13, x9, lsr #1
 462cb5c: 8b0d0129     	add	x9, x9, x13
 462cb60: eb1b019f     	cmp	x12, x27
 462cb64: 9a8ab129     	csel	x9, x9, x10, lt
 462cb68: 9a98b178     	csel	x24, x11, x24, lt
 462cb6c: b5ffff09     	cbnz	x9, 0x462cb4c <_ChromeMain+0x46278b0>
 462cb70: eb16031f     	cmp	x24, x22
 462cb74: 54000080     	b.eq	0x462cb84 <_ChromeMain+0x46278e8>
 462cb78: f9400309     	ldr	x9, [x24]
 462cb7c: eb09037f     	cmp	x27, x9
 462cb80: 54fff88a     	b.ge	0x462ca90 <_ChromeMain+0x46277f4>
 462cb84: f9402bea     	ldr	x10, [sp, #0x50]
 462cb88: eb0a033f     	cmp	x25, x10
 462cb8c: 54000560     	b.eq	0x462cc38 <_ChromeMain+0x462799c>
 462cb90: aa1c03fa     	mov	x26, x28
 462cb94: 8b08038a     	add	x10, x28, x8
 462cb98: eb0a031f     	cmp	x24, x10
 462cb9c: 540003a0     	b.eq	0x462cc10 <_ChromeMain+0x4627974>
 462cba0: d1004149     	sub	x9, x10, #0x10
 462cba4: aa0a03e8     	mov	x8, x10
 462cba8: eb0a013f     	cmp	x9, x10
 462cbac: f9401ff6     	ldr	x22, [sp, #0x38]
 462cbb0: aa1003fc     	mov	x28, x16
 462cbb4: 54000102     	b.hs	0x462cbd4 <_ChromeMain+0x4627938>
 462cbb8: b4ffcc88     	cbz	x8, 0x462c548 <_ChromeMain+0x46272ac>
 462cbbc: d100410b     	sub	x11, x8, #0x10
 462cbc0: 3dc00160     	ldr	q0, [x11]
 462cbc4: 3d800100     	str	q0, [x8]
 462cbc8: eb0a011f     	cmp	x8, x10
 462cbcc: 91004108     	add	x8, x8, #0x10
 462cbd0: 54ffff43     	b.lo	0x462cbb8 <_ChromeMain+0x462791c>
 462cbd4: eb09031f     	cmp	x24, x9
 462cbd8: 54000120     	b.eq	0x462cbfc <_ChromeMain+0x4627960>
 462cbdc: aa0903ea     	mov	x10, x9
 462cbe0: f85f0d4b     	ldr	x11, [x10, #-0x10]!
 462cbe4: f900012b     	str	x11, [x9]
 462cbe8: b85f812b     	ldur	w11, [x9, #-0x8]
 462cbec: b900092b     	str	w11, [x9, #0x8]
 462cbf0: aa0a03e9     	mov	x9, x10
 462cbf4: eb18015f     	cmp	x10, x24
 462cbf8: 54ffff41     	b.ne	0x462cbe0 <_ChromeMain+0x4627944>
 462cbfc: cb1a0108     	sub	x8, x8, x26
 462cc00: 9344fd19     	asr	x25, x8, #4
 462cc04: f900031b     	str	x27, [x24]
 462cc08: b9000b14     	str	w20, [x24, #0x8]
 462cc0c: 17ffffa5     	b	0x462caa0 <_ChromeMain+0x4627804>
 462cc10: f9401ff6     	ldr	x22, [sp, #0x38]
 462cc14: b4ffc9b8     	cbz	x24, 0x462c548 <_ChromeMain+0x46272ac>
 462cc18: aa1003fc     	mov	x28, x16
 462cc1c: f900015b     	str	x27, [x10]
 462cc20: b9000954     	str	w20, [x10, #0x8]
 462cc24: 91004108     	add	x8, x8, #0x10
 462cc28: 9344fd19     	asr	x25, x8, #4
 462cc2c: 17ffff9d     	b	0x462caa0 <_ChromeMain+0x4627804>
 462cc30: d2800000     	mov	x0, #0x0                ; =0
 462cc34: 14000013     	b	0x462cc80 <_ChromeMain+0x46279e4>
 462cc38: 91000548     	add	x8, x10, #0x1
 462cc3c: d37cfd09     	lsr	x9, x8, #60
 462cc40: b5000f09     	cbnz	x9, 0x462ce20 <_ChromeMain+0x4627b84>
 462cc44: d37ff949     	lsl	x9, x10, #1
 462cc48: eb08013f     	cmp	x9, x8
 462cc4c: 9a88812b     	csel	x11, x9, x8, hi
 462cc50: 92ff0008     	mov	x8, #0x7ffffffffffffff  ; =576460752303423487
 462cc54: eb08015f     	cmp	x10, x8
 462cc58: 92fe0008     	mov	x8, #0xfffffffffffffff  ; =1152921504606846975
 462cc5c: 9a883179     	csel	x25, x11, x8, lo
 462cc60: f90013f0     	str	x16, [sp, #0x20]
 462cc64: b4fffe79     	cbz	x25, 0x462cc30 <_ChromeMain+0x4627994>
 462cc68: d37cff28     	lsr	x8, x25, #60
 462cc6c: b5000dc8     	cbnz	x8, 0x462ce24 <_ChromeMain+0x4627b88>
 462cc70: aa0b03fa     	mov	x26, x11
 462cc74: d37cef20     	lsl	x0, x25, #4
 462cc78: 96e789bc     	bl	0xf368 <_ChromeMain+0xa0cc>
 462cc7c: aa1a03eb     	mov	x11, x26
 462cc80: cb1c0309     	sub	x9, x24, x28
 462cc84: 8b09001a     	add	x26, x0, x9
 462cc88: eb89133f     	cmp	x25, x9, asr #4
 462cc8c: f9000fe9     	str	x9, [sp, #0x18]
 462cc90: 54000121     	b.ne	0x462ccb4 <_ChromeMain+0x4627a18>
 462cc94: eb1c031f     	cmp	x24, x28
 462cc98: 540004c0     	b.eq	0x462cd30 <_ChromeMain+0x4627a94>
 462cc9c: d37df328     	lsl	x8, x25, #3
 462cca0: 91002108     	add	x8, x8, #0x8
 462cca4: 927ced08     	and	x8, x8, #0xfffffffffffffff0
 462cca8: cb08035a     	sub	x26, x26, x8
 462ccac: f90017eb     	str	x11, [sp, #0x28]
 462ccb0: 14000002     	b	0x462ccb8 <_ChromeMain+0x4627a1c>
 462ccb4: f90017f9     	str	x25, [sp, #0x28]
 462ccb8: aa1a03f9     	mov	x25, x26
 462ccbc: b4ffc47a     	cbz	x26, 0x462c548 <_ChromeMain+0x46272ac>
 462ccc0: f900035b     	str	x27, [x26]
 462ccc4: b9000b54     	str	w20, [x26, #0x8]
 462ccc8: 91004340     	add	x0, x26, #0x10
 462cccc: cb190008     	sub	x8, x0, x25
 462ccd0: f9000be8     	str	x8, [sp, #0x10]
 462ccd4: cb1802da     	sub	x26, x22, x24
 462ccd8: aa1803e1     	mov	x1, x24
 462ccdc: aa1a03e2     	mov	x2, x26
 462cce0: 94e77406     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 462cce4: d344ff48     	lsr	x8, x26, #4
 462cce8: f9402bfa     	ldr	x26, [sp, #0x50]
 462ccec: cb1a0108     	sub	x8, x8, x26
 462ccf0: 8b081338     	add	x24, x25, x8, lsl #4
 462ccf4: aa1803e0     	mov	x0, x24
 462ccf8: aa1c03e1     	mov	x1, x28
 462ccfc: f9400fe2     	ldr	x2, [sp, #0x18]
 462cd00: 94e773fe     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 462cd04: f9400be8     	ldr	x8, [sp, #0x10]
 462cd08: 8b881359     	add	x25, x26, x8, asr #4
 462cd0c: b400009c     	cbz	x28, 0x462cd1c <_ChromeMain+0x4627a80>
 462cd10: d37cef41     	lsl	x1, x26, #4
 462cd14: aa1c03e0     	mov	x0, x28
 462cd18: 96e77068     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462cd1c: a94223fc     	ldp	x28, x8, [sp, #0x20]
 462cd20: f9002be8     	str	x8, [sp, #0x50]
 462cd24: aa1803fa     	mov	x26, x24
 462cd28: f9401ff6     	ldr	x22, [sp, #0x38]
 462cd2c: 17ffff5d     	b	0x462caa0 <_ChromeMain+0x4627804>
 462cd30: f9000be0     	str	x0, [sp, #0x10]
 462cd34: f90017f9     	str	x25, [sp, #0x28]
 462cd38: d37ffb28     	lsl	x8, x25, #1
 462cd3c: f100051f     	cmp	x8, #0x1
 462cd40: 9a9f8519     	csinc	x25, x8, xzr, hi
 462cd44: d37cef20     	lsl	x0, x25, #4
 462cd48: 96e78988     	bl	0xf368 <_ChromeMain+0xa0cc>
 462cd4c: b4ffbffa     	cbz	x26, 0x462c548 <_ChromeMain+0x46272ac>
 462cd50: d342ff28     	lsr	x8, x25, #2
 462cd54: f90007f9     	str	x25, [sp, #0x8]
 462cd58: 8b081019     	add	x25, x0, x8, lsl #4
 462cd5c: f94017e8     	ldr	x8, [sp, #0x28]
 462cd60: d37ced01     	lsl	x1, x8, #4
 462cd64: f9400be0     	ldr	x0, [sp, #0x10]
 462cd68: 96e77054     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462cd6c: f94007e8     	ldr	x8, [sp, #0x8]
 462cd70: f90017e8     	str	x8, [sp, #0x28]
 462cd74: 17ffffd3     	b	0x462ccc0 <_ChromeMain+0x4627a24>
 462cd78: 91002128     	add	x8, x9, #0x8
 462cd7c: 385983aa     	ldurb	w10, [x29, #-0x68]
 462cd80: 350001ca     	cbnz	w10, 0x462cdb8 <_ChromeMain+0x4627b1c>
 462cd84: 39c07d2a     	ldrsb	w10, [x9, #0x1f]
 462cd88: 37f800ca     	tbnz	w10, #0x1f, 0x462cda0 <_ChromeMain+0x4627b04>
 462cd8c: 3dc00100     	ldr	q0, [x8]
 462cd90: f9400908     	ldr	x8, [x8, #0x10]
 462cd94: f81903a8     	stur	x8, [x29, #-0x70]
 462cd98: 3c9803a0     	stur	q0, [x29, #-0x80]
 462cd9c: 14000004     	b	0x462cdac <_ChromeMain+0x4627b10>
 462cda0: a9408921     	ldp	x1, x2, [x9, #0x8]
 462cda4: d10203a0     	sub	x0, x29, #0x80
 462cda8: 96e7ad1c     	bl	0x18218 <_ChromeMain+0x12f7c>
 462cdac: 52800028     	mov	w8, #0x1                ; =1
 462cdb0: 381983a8     	sturb	w8, [x29, #-0x68]
 462cdb4: 17fffef7     	b	0x462c990 <_ChromeMain+0x46276f4>
 462cdb8: d10203aa     	sub	x10, x29, #0x80
 462cdbc: eb08015f     	cmp	x10, x8
 462cdc0: 54ffde80     	b.eq	0x462c990 <_ChromeMain+0x46276f4>
 462cdc4: 38d973ab     	ldursb	w11, [x29, #-0x69]
 462cdc8: 39407d2a     	ldrb	w10, [x9, #0x1f]
 462cdcc: 37f8016b     	tbnz	w11, #0x1f, 0x462cdf8 <_ChromeMain+0x4627b5c>
 462cdd0: 373800ca     	tbnz	w10, #0x7, 0x462cde8 <_ChromeMain+0x4627b4c>
 462cdd4: 3dc00100     	ldr	q0, [x8]
 462cdd8: f9400908     	ldr	x8, [x8, #0x10]
 462cddc: f81903a8     	stur	x8, [x29, #-0x70]
 462cde0: 3c9803a0     	stur	q0, [x29, #-0x80]
 462cde4: 17fffeeb     	b	0x462c990 <_ChromeMain+0x46276f4>
 462cde8: a9408921     	ldp	x1, x2, [x9, #0x8]
 462cdec: d10203a0     	sub	x0, x29, #0x80
 462cdf0: 96f9ef31     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 462cdf4: 17fffee7     	b	0x462c990 <_ChromeMain+0x46276f4>
 462cdf8: 13001d4b     	sxtb	w11, w10
 462cdfc: 7100017f     	cmp	w11, #0x0
 462ce00: a940a52b     	ldp	x11, x9, [x9, #0x8]
 462ce04: 9a884161     	csel	x1, x11, x8, mi
 462ce08: 9a8a4122     	csel	x2, x9, x10, mi
 462ce0c: d10203a0     	sub	x0, x29, #0x80
 462ce10: 96f9ef7c     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 462ce14: 17fffedf     	b	0x462c990 <_ChromeMain+0x46276f4>
 462ce18: aa1403e0     	mov	x0, x20
 462ce1c: 17fffde7     	b	0x462c5b8 <_ChromeMain+0x462731c>
 462ce20: 94164478     	bl	0x4bbe000 <_ChromeMain+0x4bb8d64>
 462ce24: 9417647f     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
