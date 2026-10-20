
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  99d480: b9400809     	ldr	w9, [x0, #0x8]
  99d484: 34000749     	cbz	w9, 0x99d56c <_ChromeMain+0x9982d0>
  99d488: b9400c0b     	ldr	w11, [x0, #0xc]
  99d48c: 3400070b     	cbz	w11, 0x99d56c <_ChromeMain+0x9982d0>
  99d490: 2941342c     	ldp	w12, w13, [x1, #0x8]
  99d494: 7100019f     	cmp	w12, #0x0
  99d498: 7a4019a4     	ccmp	w13, #0x0, #0x4, ne
  99d49c: 54000660     	b.eq	0x99d568 <_ChromeMain+0x9982cc>
  99d4a0: 29403c0e     	ldp	w14, w15, [x0]
  99d4a4: 29404430     	ldp	w16, w17, [x1]
  99d4a8: 6b0e021f     	cmp	w16, w14
  99d4ac: 1a8eb20a     	csel	w10, w16, w14, lt
  99d4b0: 6b0f023f     	cmp	w17, w15
  99d4b4: 1a8fb228     	csel	w8, w17, w15, lt
  99d4b8: 0b0901c9     	add	w9, w14, w9
  99d4bc: 0b0c020c     	add	w12, w16, w12
  99d4c0: 6b0c013f     	cmp	w9, w12
  99d4c4: 1a8cc12c     	csel	w12, w9, w12, gt
  99d4c8: 0b0b01e9     	add	w9, w15, w11
  99d4cc: 0b0d022b     	add	w11, w17, w13
  99d4d0: 6b0b013f     	cmp	w9, w11
  99d4d4: 1a8bc129     	csel	w9, w9, w11, gt
  99d4d8: b900000a     	str	w10, [x0]
  99d4dc: 6b0a018b     	subs	w11, w12, w10
  99d4e0: 131f7d6d     	asr	w13, w11, #31
  99d4e4: 520101ad     	eor	w13, w13, #0x80000000
  99d4e8: 1a8b61ab     	csel	w11, w13, w11, vs
  99d4ec: 2b0b014d     	adds	w13, w10, w11
  99d4f0: 131f7dae     	asr	w14, w13, #31
  99d4f4: 520101ce     	eor	w14, w14, #0x80000000
  99d4f8: 1a8d61cd     	csel	w13, w14, w13, vs
  99d4fc: 6b0a01ad     	subs	w13, w13, w10
  99d500: 131f7dae     	asr	w14, w13, #31
  99d504: 520101ce     	eor	w14, w14, #0x80000000
  99d508: 1a8d61cd     	csel	w13, w14, w13, vs
  99d50c: 0aad7dad     	bic	w13, w13, w13, asr #31
  99d510: b900080d     	str	w13, [x0, #0x8]
  99d514: 0b0a01ad     	add	w13, w13, w10
  99d518: 6b0c01bf     	cmp	w13, w12
  99d51c: 54000661     	b.ne	0x99d5e8 <_ChromeMain+0x99834c>
  99d520: b9000408     	str	w8, [x0, #0x4]
  99d524: 6b08012a     	subs	w10, w9, w8
  99d528: 131f7d4b     	asr	w11, w10, #31
  99d52c: 5201016b     	eor	w11, w11, #0x80000000
  99d530: 1a8a616a     	csel	w10, w11, w10, vs
  99d534: 2b0a010b     	adds	w11, w8, w10
  99d538: 131f7d6c     	asr	w12, w11, #31
  99d53c: 5201018c     	eor	w12, w12, #0x80000000
  99d540: 1a8b618b     	csel	w11, w12, w11, vs
  99d544: 6b08016b     	subs	w11, w11, w8
  99d548: 131f7d6c     	asr	w12, w11, #31
  99d54c: 5201018c     	eor	w12, w12, #0x80000000
  99d550: 1a8b618b     	csel	w11, w12, w11, vs
  99d554: 0aab7d6b     	bic	w11, w11, w11, asr #31
  99d558: b9000c0b     	str	w11, [x0, #0xc]
  99d55c: 0b08016b     	add	w11, w11, w8
  99d560: 6b09017f     	cmp	w11, w9
  99d564: 540000a1     	b.ne	0x99d578 <_ChromeMain+0x9982dc>
  99d568: d65f03c0     	ret
  99d56c: 3dc00020     	ldr	q0, [x1]
  99d570: 3d800000     	str	q0, [x0]
  99d574: d65f03c0     	ret
  99d578: 6b08013f     	cmp	w9, w8
  99d57c: 540001cb     	b.lt	0x99d5b4 <_ChromeMain+0x998318>
  99d580: 0b08014b     	add	w11, w10, w8
  99d584: 6b0b012b     	subs	w11, w9, w11
  99d588: 131f7d6c     	asr	w12, w11, #31
  99d58c: 5201018c     	eor	w12, w12, #0x80000000
  99d590: 1a8b618b     	csel	w11, w12, w11, vs
  99d594: 54000120     	b.eq	0x99d5b8 <_ChromeMain+0x99831c>
  99d598: 7100013f     	cmp	w9, #0x0
  99d59c: 5a89552c     	cneg	w12, w9, mi
  99d5a0: 321f73ed     	mov	w13, #0x3ffffffe        ; =1073741822
  99d5a4: 6b0d019f     	cmp	w12, w13
  99d5a8: 54000108     	b.hi	0x99d5c8 <_ChromeMain+0x99832c>
  99d5ac: 4b0a0128     	sub	w8, w9, w10
  99d5b0: 14000002     	b	0x99d5b8 <_ChromeMain+0x99831c>
  99d5b4: 5280000a     	mov	w10, #0x0               ; =0
  99d5b8: b9000408     	str	w8, [x0, #0x4]
  99d5bc: 0aaa7d48     	bic	w8, w10, w10, asr #31
  99d5c0: b9000c08     	str	w8, [x0, #0xc]
  99d5c4: 17ffffe9     	b	0x99d568 <_ChromeMain+0x9982cc>
  99d5c8: 7100011f     	cmp	w8, #0x0
  99d5cc: 5a885509     	cneg	w9, w8, mi
  99d5d0: 12b8000c     	mov	w12, #0x3fffffff        ; =1073741823
  99d5d4: 6b0c013f     	cmp	w9, w12
  99d5d8: 54ffff03     	b.lo	0x99d5b8 <_ChromeMain+0x99831c>
  99d5dc: 0b4b7d69     	add	w9, w11, w11, lsr #31
  99d5e0: 0b890508     	add	w8, w8, w9, asr #1
  99d5e4: 17fffff5     	b	0x99d5b8 <_ChromeMain+0x99831c>
  99d5e8: 6b0a019f     	cmp	w12, w10
  99d5ec: 540001cb     	b.lt	0x99d624 <_ChromeMain+0x998388>
  99d5f0: 0b0a016d     	add	w13, w11, w10
  99d5f4: 6b0d018d     	subs	w13, w12, w13
  99d5f8: 131f7dae     	asr	w14, w13, #31
  99d5fc: 520101ce     	eor	w14, w14, #0x80000000
  99d600: 1a8d61cd     	csel	w13, w14, w13, vs
  99d604: 54000120     	b.eq	0x99d628 <_ChromeMain+0x99838c>
  99d608: 7100019f     	cmp	w12, #0x0
  99d60c: 5a8c558e     	cneg	w14, w12, mi
  99d610: 321f73ef     	mov	w15, #0x3ffffffe        ; =1073741822
  99d614: 6b0f01df     	cmp	w14, w15
  99d618: 54000108     	b.hi	0x99d638 <_ChromeMain+0x99839c>
  99d61c: 4b0b018a     	sub	w10, w12, w11
  99d620: 14000002     	b	0x99d628 <_ChromeMain+0x99838c>
  99d624: 5280000b     	mov	w11, #0x0               ; =0
  99d628: b900000a     	str	w10, [x0]
  99d62c: 0aab7d6a     	bic	w10, w11, w11, asr #31
  99d630: b900080a     	str	w10, [x0, #0x8]
  99d634: 17ffffbb     	b	0x99d520 <_ChromeMain+0x998284>
  99d638: 7100015f     	cmp	w10, #0x0
  99d63c: 5a8a554c     	cneg	w12, w10, mi
  99d640: 12b8000e     	mov	w14, #0x3fffffff        ; =1073741823
  99d644: 0b4d7dad     	add	w13, w13, w13, lsr #31
  99d648: 0b8d054d     	add	w13, w10, w13, asr #1
  99d64c: 6b0e019f     	cmp	w12, w14
  99d650: 1a8d314a     	csel	w10, w10, w13, lo
  99d654: 17fffff5     	b	0x99d628 <_ChromeMain+0x99838c>
  99d658: d503201f     	nop
  99d65c: d503201f     	nop
  99d660: d503201f     	nop
  99d664: d503201f     	nop
