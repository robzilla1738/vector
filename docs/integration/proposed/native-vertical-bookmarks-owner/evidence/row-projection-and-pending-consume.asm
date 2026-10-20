
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4612858: 9b110043     	madd	x3, x2, x17, x0
 461285c: f8418464     	ldr	x4, [x3], #0x18
 4612860: aa6107e5     	mvn	x5, x1, lsr #1
 4612864: 8b050021     	add	x1, x1, x5
 4612868: eb15009f     	cmp	x4, x21
 461286c: 9a823021     	csel	x1, x1, x2, lo
 4612870: 9a803060     	csel	x0, x3, x0, lo
 4612874: b5ffff01     	cbnz	x1, 0x4612854 <_ChromeMain+0x460d5b8>
 4612878: eb0f001f     	cmp	x0, x15
 461287c: 54fffdc0     	b.eq	0x4612834 <_ChromeMain+0x460d598>
 4612880: f9400001     	ldr	x1, [x0]
 4612884: f10002bf     	cmp	x21, #0x0
 4612888: fa4112a0     	ccmp	x21, x1, #0x0, ne
 461288c: 54fffd43     	b.lo	0x4612834 <_ChromeMain+0x460d598>
 4612890: eb0802df     	cmp	x22, x8
 4612894: 54fffb01     	b.ne	0x46127f4 <_ChromeMain+0x460d558>
 4612898: 17ffffd1     	b	0x46127dc <_ChromeMain+0x460d540>
 461289c: eb0802df     	cmp	x22, x8
 46128a0: 54000262     	b.hs	0x46128ec <_ChromeMain+0x460d650>
 46128a4: f876792a     	ldr	x10, [x9, x22, lsl #3]
 46128a8: b400022a     	cbz	x10, 0x46128ec <_ChromeMain+0x460d650>
 46128ac: f9401d55     	ldr	x21, [x10, #0x38]
 46128b0: b40001f5     	cbz	x21, 0x46128ec <_ChromeMain+0x460d650>
 46128b4: f94026b7     	ldr	x23, [x21, #0x48]
 46128b8: d37df2e8     	lsl	x8, x23, #3
 46128bc: b4ffdce8     	cbz	x8, 0x4612458 <_ChromeMain+0x460d1bc>
 46128c0: d2800009     	mov	x9, #0x0                ; =0
 46128c4: f94022ab     	ldr	x11, [x21, #0x40]
 46128c8: f869696c     	ldr	x12, [x11, x9]
 46128cc: eb0a019f     	cmp	x12, x10
 46128d0: 540000a0     	b.eq	0x46128e4 <_ChromeMain+0x460d648>
 46128d4: 91002129     	add	x9, x9, #0x8
 46128d8: eb09011f     	cmp	x8, x9
 46128dc: 54ffff61     	b.ne	0x46128c8 <_ChromeMain+0x460d62c>
 46128e0: 17fffede     	b	0x4612458 <_ChromeMain+0x460d1bc>
 46128e4: 9343fd37     	asr	x23, x9, #3
 46128e8: 17fffedc     	b	0x4612458 <_ChromeMain+0x460d1bc>
 46128ec: 8b080d28     	add	x8, x9, x8, lsl #3
 46128f0: f85f8109     	ldur	x9, [x8, #-0x8]
 46128f4: b4ffda89     	cbz	x9, 0x4612444 <_ChromeMain+0x460d1a8>
 46128f8: f9401d35     	ldr	x21, [x9, #0x38]
 46128fc: b4ffda55     	cbz	x21, 0x4612444 <_ChromeMain+0x460d1a8>
 4612900: f94026a8     	ldr	x8, [x21, #0x48]
 4612904: d37df10a     	lsl	x10, x8, #3
 4612908: b400016a     	cbz	x10, 0x4612934 <_ChromeMain+0x460d698>
 461290c: d280000b     	mov	x11, #0x0               ; =0
 4612910: f94022ac     	ldr	x12, [x21, #0x40]
 4612914: f86b698d     	ldr	x13, [x12, x11]
 4612918: eb0901bf     	cmp	x13, x9
 461291c: 540000a0     	b.eq	0x4612930 <_ChromeMain+0x460d694>
 4612920: 9100216b     	add	x11, x11, #0x8
 4612924: eb0b015f     	cmp	x10, x11
 4612928: 54ffff61     	b.ne	0x4612914 <_ChromeMain+0x460d678>
 461292c: 14000002     	b	0x4612934 <_ChromeMain+0x460d698>
 4612930: 9343fd68     	asr	x8, x11, #3
 4612934: 91000517     	add	x23, x8, #0x1
 4612938: 17fffec8     	b	0x4612458 <_ChromeMain+0x460d1bc>
 461293c: aa0803e9     	mov	x9, x8
 4612940: 14000011     	b	0x4612984 <_ChromeMain+0x460d6e8>
 4612944: 91000556     	add	x22, x10, #0x1
 4612948: f942ea88     	ldr	x8, [x20, #0x5d0]
 461294c: f942ee8a     	ldr	x10, [x20, #0x5d8]
 4612950: d37ced49     	lsl	x9, x10, #4
 4612954: b4ffff49     	cbz	x9, 0x461293c <_ChromeMain+0x460d6a0>
 4612958: 9344fd2b     	asr	x11, x9, #4
 461295c: aa0803e9     	mov	x9, x8
 4612960: d341fd6c     	lsr	x12, x11, #1
 4612964: 8b0c112d     	add	x13, x9, x12, lsl #4
 4612968: f84105ae     	ldr	x14, [x13], #0x10
 461296c: aa6b07ef     	mvn	x15, x11, lsr #1
 4612970: 8b0f016b     	add	x11, x11, x15
 4612974: eb1501df     	cmp	x14, x21
 4612978: 9a8c316b     	csel	x11, x11, x12, lo
 461297c: 9a8931a9     	csel	x9, x13, x9, lo
 4612980: b5ffff0b     	cbnz	x11, 0x4612960 <_ChromeMain+0x460d6c4>
 4612984: 8b0a1108     	add	x8, x8, x10, lsl #4
 4612988: eb08013f     	cmp	x9, x8
 461298c: 54000080     	b.eq	0x461299c <_ChromeMain+0x460d700>
 4612990: f9400128     	ldr	x8, [x9]
 4612994: eb0802bf     	cmp	x21, x8
 4612998: 54001682     	b.hs	0x4612c68 <_ChromeMain+0x460d9cc>
 461299c: d2800017     	mov	x23, #0x0               ; =0
 46129a0: 17fffeae     	b	0x4612458 <_ChromeMain+0x460d1bc>
 46129a4: aa0a03e8     	mov	x8, x10
 46129a8: 14000029     	b	0x4612a4c <_ChromeMain+0x460d7b0>
 46129ac: 6d4107e0     	ldp	d0, d1, [sp, #0x10]
 46129b0: b94017e9     	ldr	w9, [sp, #0x14]
 46129b4: 31009129     	adds	w9, w9, #0x24
 46129b8: 1a896369     	csel	w9, w27, w9, vs
 46129bc: b90017e9     	str	w9, [sp, #0x14]
 46129c0: 4e0c1d20     	mov.s	v0[1], w9
 46129c4: 0ea10c01     	sqadd.2s	v1, v0, v1
 46129c8: 0ea02c20     	sqsub.2s	v0, v1, v0
 46129cc: 6f00e401     	movi.2d	v1, #0000000000000000
 46129d0: 0ea16400     	smax.2s	v0, v0, v1
 46129d4: fd000fe0     	str	d0, [sp, #0x18]
 46129d8: f942a280     	ldr	x0, [x20, #0x540]
 46129dc: f9400508     	ldr	x8, [x8, #0x8]
 46129e0: b5001740     	cbnz	x0, 0x4612cc8 <_ChromeMain+0x460da2c>
 46129e4: 910043e1     	add	x1, sp, #0x10
 46129e8: aa0803e0     	mov	x0, x8
 46129ec: 970a4869     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 46129f0: 91000718     	add	x24, x24, #0x1
 46129f4: eb19031f     	cmp	x24, x25
 46129f8: 54001b60     	b.eq	0x4612d64 <_ChromeMain+0x460dac8>
 46129fc: f9430688     	ldr	x8, [x20, #0x608]
 4612a00: eb08031f     	cmp	x24, x8
 4612a04: 540016a2     	b.hs	0x4612cd8 <_ChromeMain+0x460da3c>
 4612a08: f9430288     	ldr	x8, [x20, #0x600]
 4612a0c: f8787909     	ldr	x9, [x8, x24, lsl #3]
 4612a10: f942ea8a     	ldr	x10, [x20, #0x5d0]
 4612a14: f942ee8b     	ldr	x11, [x20, #0x5d8]
 4612a18: d37ced68     	lsl	x8, x11, #4
 4612a1c: b4fffc48     	cbz	x8, 0x46129a4 <_ChromeMain+0x460d708>
 4612a20: 9344fd0c     	asr	x12, x8, #4
 4612a24: aa0a03e8     	mov	x8, x10
 4612a28: d341fd8d     	lsr	x13, x12, #1
 4612a2c: 8b0d110e     	add	x14, x8, x13, lsl #4
 4612a30: f84105cf     	ldr	x15, [x14], #0x10
 4612a34: aa6c07f0     	mvn	x16, x12, lsr #1
 4612a38: 8b10018c     	add	x12, x12, x16
 4612a3c: eb0901ff     	cmp	x15, x9
 4612a40: 9a8d318c     	csel	x12, x12, x13, lo
 4612a44: 9a8831c8     	csel	x8, x14, x8, lo
 4612a48: b5ffff0c     	cbnz	x12, 0x4612a28 <_ChromeMain+0x460d78c>
 4612a4c: 8b0b114a     	add	x10, x10, x11, lsl #4
 4612a50: eb0a011f     	cmp	x8, x10
 4612a54: 54000080     	b.eq	0x4612a64 <_ChromeMain+0x460d7c8>
 4612a58: f940010b     	ldr	x11, [x8]
 4612a5c: eb0b013f     	cmp	x9, x11
 4612a60: 54000042     	b.hs	0x4612a68 <_ChromeMain+0x460d7cc>
 4612a64: aa0a03e8     	mov	x8, x10
 4612a68: f943a68c     	ldr	x12, [x20, #0x748]
 4612a6c: f943aa8d     	ldr	x13, [x20, #0x750]
 4612a70: 8b0d05ab     	add	x11, x13, x13, lsl #1
 4612a74: d37df16b     	lsl	x11, x11, #3
 4612a78: b400040b     	cbz	x11, 0x4612af8 <_ChromeMain+0x460d85c>
 4612a7c: 9343fd6b     	asr	x11, x11, #3
 4612a80: 9b1c7d6e     	mul	x14, x11, x28
 4612a84: aa0c03eb     	mov	x11, x12
 4612a88: d341fdcf     	lsr	x15, x14, #1
 4612a8c: 9b1a2df0     	madd	x16, x15, x26, x11
 4612a90: f8418611     	ldr	x17, [x16], #0x18
 4612a94: aa6e07e0     	mvn	x0, x14, lsr #1
 4612a98: 8b0001ce     	add	x14, x14, x0
 4612a9c: eb09023f     	cmp	x17, x9
 4612aa0: 9a8f31ce     	csel	x14, x14, x15, lo
 4612aa4: 9a8b320b     	csel	x11, x16, x11, lo
 4612aa8: b5ffff0e     	cbnz	x14, 0x4612a88 <_ChromeMain+0x460d7ec>
 4612aac: 9b1a31ac     	madd	x12, x13, x26, x12
 4612ab0: eb0c017f     	cmp	x11, x12
 4612ab4: 54000080     	b.eq	0x4612ac4 <_ChromeMain+0x460d828>
 4612ab8: f940016d     	ldr	x13, [x11]
 4612abc: eb0d013f     	cmp	x9, x13
 4612ac0: 54000042     	b.hs	0x4612ac8 <_ChromeMain+0x460d82c>
 4612ac4: aa0c03eb     	mov	x11, x12
 4612ac8: eb0a011f     	cmp	x8, x10
 4612acc: 54fff920     	b.eq	0x46129f0 <_ChromeMain+0x460d754>
 4612ad0: f9400509     	ldr	x9, [x8, #0x8]
 4612ad4: eb0c017f     	cmp	x11, x12
 4612ad8: fa401924     	ccmp	x9, #0x0, #0x4, ne
 4612adc: 54fff8a0     	b.eq	0x46129f0 <_ChromeMain+0x460d754>
 4612ae0: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4612ae4: 3cc08160     	ldur	q0, [x11, #0x8]
 4612ae8: 3d8007e0     	str	q0, [sp, #0x10]
 4612aec: eb17031f     	cmp	x24, x23
 4612af0: 54fff743     	b.lo	0x46129d8 <_ChromeMain+0x460d73c>
 4612af4: 17ffffae     	b	0x46129ac <_ChromeMain+0x460d710>
 4612af8: aa0c03eb     	mov	x11, x12
 4612afc: 17ffffec     	b	0x4612aac <_ChromeMain+0x460d810>
 4612b00: 5280030e     	mov	w14, #0x18              ; =24
 4612b04: 9b0e212e     	madd	x14, x9, x14, x8
 4612b08: eb0e01bf     	cmp	x13, x14
 4612b0c: 540001c0     	b.eq	0x4612b44 <_ChromeMain+0x460d8a8>
 4612b10: f94001ae     	ldr	x14, [x13]
 4612b14: f876796f     	ldr	x15, [x11, x22, lsl #3]
 4612b18: eb0e01ff     	cmp	x15, x14
 4612b1c: 54000143     	b.lo	0x4612b44 <_ChromeMain+0x460d8a8>
 4612b20: a940a5a8     	ldp	x8, x9, [x13, #0x8]
 4612b24: d360fd0a     	lsr	x10, x8, #32
 4612b28: 14000027     	b	0x4612bc4 <_ChromeMain+0x460d928>
 4612b2c: b400042a     	cbz	x10, 0x4612bb0 <_ChromeMain+0x460d914>
 4612b30: f943028b     	ldr	x11, [x20, #0x600]
 4612b34: f943a688     	ldr	x8, [x20, #0x748]
 4612b38: f943aa89     	ldr	x9, [x20, #0x750]
 4612b3c: 8b09052c     	add	x12, x9, x9, lsl #1
 4612b40: d37df18c     	lsl	x12, x12, #3
 4612b44: 8b0a0d6a     	add	x10, x11, x10, lsl #3
 4612b48: aa0803eb     	mov	x11, x8
 4612b4c: b400022c     	cbz	x12, 0x4612b90 <_ChromeMain+0x460d8f4>
 4612b50: 9343fd8b     	asr	x11, x12, #3
 4612b54: b201f3ec     	mov	x12, #-0x5555555555555556 ; =-6148914691236517206
 4612b58: f295556c     	movk	x12, #0xaaab
 4612b5c: 9b0c7d6d     	mul	x13, x11, x12
 4612b60: f85f814c     	ldur	x12, [x10, #-0x8]
 4612b64: 5280030e     	mov	w14, #0x18              ; =24
 4612b68: aa0803eb     	mov	x11, x8
 4612b6c: d341fdaf     	lsr	x15, x13, #1
 4612b70: 9b0e2df0     	madd	x16, x15, x14, x11
 4612b74: f8418611     	ldr	x17, [x16], #0x18
 4612b78: aa6d07e0     	mvn	x0, x13, lsr #1
 4612b7c: 8b0001ad     	add	x13, x13, x0
 4612b80: eb0c023f     	cmp	x17, x12
 4612b84: 9a8f31ad     	csel	x13, x13, x15, lo
 4612b88: 9a8b320b     	csel	x11, x16, x11, lo
 4612b8c: b5ffff0d     	cbnz	x13, 0x4612b6c <_ChromeMain+0x460d8d0>
 4612b90: 5280030c     	mov	w12, #0x18              ; =24
 4612b94: 9b0c2128     	madd	x8, x9, x12, x8
 4612b98: eb08017f     	cmp	x11, x8
 4612b9c: 540000a0     	b.eq	0x4612bb0 <_ChromeMain+0x460d914>
 4612ba0: f9400168     	ldr	x8, [x11]
 4612ba4: f85f8149     	ldur	x9, [x10, #-0x8]
 4612ba8: eb08013f     	cmp	x9, x8
 4612bac: 54000ee2     	b.hs	0x4612d88 <_ChromeMain+0x460daec>
 4612bb0: f9429e88     	ldr	x8, [x20, #0x538]
 4612bb4: b5000948     	cbnz	x8, 0x4612cdc <_ChromeMain+0x460da40>
 4612bb8: d2c00409     	mov	x9, #0x2000000000       ; =137438953472
 4612bbc: 52800108     	mov	w8, #0x8                ; =8
 4612bc0: 5280002a     	mov	w10, #0x1               ; =1
 4612bc4: b3607d48     	bfi	x8, x10, #32, #32
 4612bc8: a90127e8     	stp	x8, x9, [sp, #0x10]
 4612bcc: f942f689     	ldr	x9, [x20, #0x5e8]
 4612bd0: f942fa8a     	ldr	x10, [x20, #0x5f0]
 4612bd4: d37ced48     	lsl	x8, x10, #4
 4612bd8: b40001a8     	cbz	x8, 0x4612c0c <_ChromeMain+0x460d970>
 4612bdc: 9344fd0b     	asr	x11, x8, #4
 4612be0: aa0903e8     	mov	x8, x9
 4612be4: d341fd6c     	lsr	x12, x11, #1
 4612be8: 8b0c110d     	add	x13, x8, x12, lsl #4
 4612bec: f84105ae     	ldr	x14, [x13], #0x10
 4612bf0: aa6b07ef     	mvn	x15, x11, lsr #1
 4612bf4: 8b0f016b     	add	x11, x11, x15
 4612bf8: eb1501df     	cmp	x14, x21
 4612bfc: 9a8c316b     	csel	x11, x11, x12, lo
 4612c00: 9a8831a8     	csel	x8, x13, x8, lo
 4612c04: b5ffff0b     	cbnz	x11, 0x4612be4 <_ChromeMain+0x460d948>
 4612c08: 14000002     	b	0x4612c10 <_ChromeMain+0x460d974>
 4612c0c: aa0903e8     	mov	x8, x9
 4612c10: 8b0a1129     	add	x9, x9, x10, lsl #4
 4612c14: eb09011f     	cmp	x8, x9
 4612c18: 54000180     	b.eq	0x4612c48 <_ChromeMain+0x460d9ac>
 4612c1c: f9400109     	ldr	x9, [x8]
 4612c20: eb0902bf     	cmp	x21, x9
 4612c24: 54000123     	b.lo	0x4612c48 <_ChromeMain+0x460d9ac>
 4612c28: b9400908     	ldr	w8, [x8, #0x8]
 4612c2c: 528001c9     	mov	w9, #0xe                ; =14
 4612c30: 1b092508     	madd	w8, w8, w9, w9
 4612c34: d3607d08     	lsl	x8, x8, #32
 4612c38: a9007fe8     	stp	x8, xzr, [sp]
 4612c3c: 910043e0     	add	x0, sp, #0x10
 4612c40: 910003e1     	mov	x1, sp
 4612c44: 96f6e91d     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 4612c48: f9429e80     	ldr	x0, [x20, #0x538]
 4612c4c: 910043e1     	add	x1, sp, #0x10
 4612c50: 95831fee     	bl	0xa6dac08 <_ChromeMain+0xa6d596c>
 4612c54: 3dc007e0     	ldr	q0, [sp, #0x10]
 4612c58: 3d800260     	str	q0, [x19]
 4612c5c: 52800028     	mov	w8, #0x1                ; =1
 4612c60: 39004268     	strb	w8, [x19, #0x10]
 4612c64: 17fffdef     	b	0x4612420 <_ChromeMain+0x460d184>
 4612c68: f9400520     	ldr	x0, [x9, #0x8]
 4612c6c: b4ffe980     	cbz	x0, 0x461299c <_ChromeMain+0x460d700>
 4612c70: b9445408     	ldr	w8, [x0, #0x454]
 4612c74: 7100051f     	cmp	w8, #0x1
 4612c78: 54000080     	b.eq	0x4612c88 <_ChromeMain+0x460d9ec>
 4612c7c: 52800028     	mov	w8, #0x1                ; =1
 4612c80: b9045408     	str	w8, [x0, #0x454]
 4612c84: 96fe393e     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4612c88: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4612c8c: 90052d17     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4612c90: f94046e9     	ldr	x9, [x23, #0x88]
 4612c94: eb09011f     	cmp	x8, x9
 4612c98: 54000061     	b.ne	0x4612ca4 <_ChromeMain+0x460da08>
 4612c9c: aa1503e0     	mov	x0, x21
 4612ca0: 96e80597     	bl	0x142fc <_ChromeMain+0xf060>
 4612ca4: f943c280     	ldr	x0, [x20, #0x780]
 4612ca8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4612cac: f94046e9     	ldr	x9, [x23, #0x88]
 4612cb0: eb09011f     	cmp	x8, x9
 4612cb4: 54000041     	b.ne	0x4612cbc <_ChromeMain+0x460da20>
 4612cb8: 96e83f61     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4612cbc: d2800017     	mov	x23, #0x0               ; =0
 4612cc0: f903c295     	str	x21, [x20, #0x780]
 4612cc4: 17fffde5     	b	0x4612458 <_ChromeMain+0x460d1bc>
 4612cc8: 910043e2     	add	x2, sp, #0x10
 4612ccc: aa0803e1     	mov	x1, x8
 4612cd0: 95812a6d     	bl	0xa65d684 <_ChromeMain+0xa6583e8>
 4612cd4: 17ffff47     	b	0x46129f0 <_ChromeMain+0x460d754>
 4612cd8: d4200020     	brk	#0x1
 4612cdc: b941c108     	ldr	w8, [x8, #0x1c0]
 4612ce0: 51004108     	sub	w8, w8, #0x10
 4612ce4: 0aa87d08     	bic	w8, w8, w8, asr #31
 4612ce8: 31002108     	adds	w8, w8, #0x8
 4612cec: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4612cf0: 1a886128     	csel	w8, w9, w8, vs
 4612cf4: 51002108     	sub	w8, w8, #0x8
 4612cf8: b25b0109     	orr	x9, x8, #0x2000000000
 4612cfc: 17ffffb0     	b	0x4612bbc <_ChromeMain+0x460d920>
 4612d00: f9430688     	ldr	x8, [x20, #0x608]
 4612d04: eb16011f     	cmp	x8, x22
 4612d08: 9a963117     	csel	x23, x8, x22, lo
 4612d0c: 395dc289     	ldrb	w9, [x20, #0x770]
 4612d10: f943b68a     	ldr	x10, [x20, #0x768]
 4612d14: 34000069     	cbz	w9, 0x4612d20 <_ChromeMain+0x460da84>
 4612d18: eb17015f     	cmp	x10, x23
 4612d1c: 54ffbce0     	b.eq	0x46124b8 <_ChromeMain+0x460d21c>
 4612d20: f903b697     	str	x23, [x20, #0x768]
 4612d24: 5280002b     	mov	w11, #0x1               ; =1
 4612d28: 391dc28b     	strb	w11, [x20, #0x770]
 4612d2c: eb0a02ff     	cmp	x23, x10
 4612d30: 9a8a32eb     	csel	x11, x23, x10, lo
 4612d34: eb17015f     	cmp	x10, x23
 4612d38: 9a97814a     	csel	x10, x10, x23, hi
 4612d3c: 7100013f     	cmp	w9, #0x0
 4612d40: 9a971178     	csel	x24, x11, x23, ne
 4612d44: 9a881159     	csel	x25, x10, x8, ne
 4612d48: eb19031f     	cmp	x24, x25
 4612d4c: 540000c2     	b.hs	0x4612d64 <_ChromeMain+0x460dac8>
 4612d50: 5280031a     	mov	w26, #0x18              ; =24
 4612d54: 12b0001b     	mov	w27, #0x7fffffff        ; =2147483647
 4612d58: b201f3fc     	mov	x28, #-0x5555555555555556 ; =-6148914691236517206
 4612d5c: f295557c     	movk	x28, #0xaaab
 4612d60: 17ffff27     	b	0x46129fc <_ChromeMain+0x460d760>
 4612d64: f942a288     	ldr	x8, [x20, #0x540]
 4612d68: b4000088     	cbz	x8, 0x4612d78 <_ChromeMain+0x460dadc>
 4612d6c: f9406108     	ldr	x8, [x8, #0xc0]
 4612d70: f100011f     	cmp	x8, #0x0
 4612d74: 1a9f07e8     	cset	w8, ne
 4612d78: 39218a88     	strb	w8, [x20, #0x862]
 4612d7c: f9429e80     	ldr	x0, [x20, #0x538]
 4612d80: 96fe38ff     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4612d84: 17fffdcd     	b	0x46124b8 <_ChromeMain+0x460d21c>
 4612d88: a940a568     	ldp	x8, x9, [x11, #0x8]
 4612d8c: d360fd0a     	lsr	x10, x8, #32
 4612d90: d360fd2b     	lsr	x11, x9, #32
 4612d94: 8b49814a     	add	x10, x10, x9, lsr #32
 4612d98: 1100114a     	add	w10, w10, #0x4
 4612d9c: 2b0b014b     	adds	w11, w10, w11
 4612da0: 131f7d6c     	asr	w12, w11, #31
 4612da4: 5201018c     	eor	w12, w12, #0x80000000
 4612da8: 1a8b618b     	csel	w11, w12, w11, vs
 4612dac: 6b0a016b     	subs	w11, w11, w10
 4612db0: 131f7d6c     	asr	w12, w11, #31
 4612db4: 5201018c     	eor	w12, w12, #0x80000000
 4612db8: 1a8b618b     	csel	w11, w12, w11, vs
 4612dbc: 0aab7d6b     	bic	w11, w11, w11, asr #31
 4612dc0: b3607d69     	bfi	x9, x11, #32, #32
 4612dc4: 17ffff80     	b	0x4612bc4 <_ChromeMain+0x460d928>
 4612dc8: f9405ac8     	ldr	x8, [x22, #0xb0]
 4612dcc: f9402500     	ldr	x0, [x8, #0x48]
 4612dd0: 95271f9d     	bl	0x8fdac44 <_ChromeMain+0x8fd59a8>
 4612dd4: f94062c8     	ldr	x8, [x22, #0xc0]
 4612dd8: b5ffff88     	cbnz	x8, 0x4612dc8 <_ChromeMain+0x460db2c>
 4612ddc: aa1603e0     	mov	x0, x22
 4612de0: f94056c1     	ldr	x1, [x22, #0xa8]
 4612de4: 95812b31     	bl	0xa65daa8 <_ChromeMain+0xa65880c>
 4612de8: 17fffdd7     	b	0x4612544 <_ChromeMain+0x460d2a8>
 4612dec: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4612df0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4612df4: 910043fd     	add	x29, sp, #0x10
 4612df8: f9429808     	ldr	x8, [x0, #0x530]
 4612dfc: b40005e8     	cbz	x8, 0x4612eb8 <_ChromeMain+0x460dc1c>
 4612e00: aa0003f3     	mov	x19, x0
 4612e04: f9401d14     	ldr	x20, [x8, #0x38]
 4612e08: b40000f4     	cbz	x20, 0x4612e24 <_ChromeMain+0x460db88>
 4612e0c: f9400288     	ldr	x8, [x20]
 4612e10: f9401508     	ldr	x8, [x8, #0x28]
 4612e14: aa1403e0     	mov	x0, x20
 4612e18: d63f0100     	blr	x8
 4612e1c: 37000500     	tbnz	w0, #0x0, 0x4612ebc <_ChromeMain+0x460dc20>
 4612e20: f9429a68     	ldr	x8, [x19, #0x530]
 4612e24: f9402114     	ldr	x20, [x8, #0x40]
 4612e28: b40000f4     	cbz	x20, 0x4612e44 <_ChromeMain+0x460dba8>
 4612e2c: f9400288     	ldr	x8, [x20]
 4612e30: f9401508     	ldr	x8, [x8, #0x28]
 4612e34: aa1403e0     	mov	x0, x20
 4612e38: d63f0100     	blr	x8
 4612e3c: 37000400     	tbnz	w0, #0x0, 0x4612ebc <_ChromeMain+0x460dc20>
 4612e40: f9429a68     	ldr	x8, [x19, #0x530]
 4612e44: f9402514     	ldr	x20, [x8, #0x48]
 4612e48: b40000f4     	cbz	x20, 0x4612e64 <_ChromeMain+0x460dbc8>
 4612e4c: f9400288     	ldr	x8, [x20]
 4612e50: f9401508     	ldr	x8, [x8, #0x28]
 4612e54: aa1403e0     	mov	x0, x20
 4612e58: d63f0100     	blr	x8
 4612e5c: 37000300     	tbnz	w0, #0x0, 0x4612ebc <_ChromeMain+0x460dc20>
 4612e60: f9429a68     	ldr	x8, [x19, #0x530]
 4612e64: f9402909     	ldr	x9, [x8, #0x50]
 4612e68: b5000629     	cbnz	x9, 0x4612f2c <_ChromeMain+0x460dc90>
 4612e6c: f9429a74     	ldr	x20, [x19, #0x530]
 4612e70: f9402e88     	ldr	x8, [x20, #0x58]
 4612e74: b50002c8     	cbnz	x8, 0x4612ecc <_ChromeMain+0x460dc30>
 4612e78: f9429a74     	ldr	x20, [x19, #0x530]
 4612e7c: f9403288     	ldr	x8, [x20, #0x60]
 4612e80: b50003e8     	cbnz	x8, 0x4612efc <_ChromeMain+0x460dc60>
 4612e84: f9429a68     	ldr	x8, [x19, #0x530]
 4612e88: f9401d14     	ldr	x20, [x8, #0x38]
 4612e8c: b5000194     	cbnz	x20, 0x4612ebc <_ChromeMain+0x460dc20>
 4612e90: f9402114     	ldr	x20, [x8, #0x40]
 4612e94: b5000154     	cbnz	x20, 0x4612ebc <_ChromeMain+0x460dc20>
 4612e98: f9402514     	ldr	x20, [x8, #0x48]
 4612e9c: b5000114     	cbnz	x20, 0x4612ebc <_ChromeMain+0x460dc20>
 4612ea0: f9402909     	ldr	x9, [x8, #0x50]
 4612ea4: b50006c9     	cbnz	x9, 0x4612f7c <_ChromeMain+0x460dce0>
 4612ea8: f9402d09     	ldr	x9, [x8, #0x58]
 4612eac: b5000829     	cbnz	x9, 0x4612fb0 <_ChromeMain+0x460dd14>
 4612eb0: f9403109     	ldr	x9, [x8, #0x60]
 4612eb4: b5000569     	cbnz	x9, 0x4612f60 <_ChromeMain+0x460dcc4>
 4612eb8: d2800014     	mov	x20, #0x0               ; =0
 4612ebc: aa1403e0     	mov	x0, x20
 4612ec0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4612ec4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4612ec8: d65f03c0     	ret
 4612ecc: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612ed0: 910a2000     	add	x0, x0, #0x288
 4612ed4: 96ec18eb     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612ed8: 36000a40     	tbz	w0, #0x0, 0x4613020 <_ChromeMain+0x460dd84>
 4612edc: f9402e94     	ldr	x20, [x20, #0x58]
 4612ee0: b4fffcd4     	cbz	x20, 0x4612e78 <_ChromeMain+0x460dbdc>
 4612ee4: f9400288     	ldr	x8, [x20]
 4612ee8: f9401508     	ldr	x8, [x8, #0x28]
 4612eec: aa1403e0     	mov	x0, x20
 4612ef0: d63f0100     	blr	x8
 4612ef4: 3607fc20     	tbz	w0, #0x0, 0x4612e78 <_ChromeMain+0x460dbdc>
 4612ef8: 17fffff1     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4612efc: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612f00: 910a2000     	add	x0, x0, #0x288
 4612f04: 96ec18df     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612f08: 36000920     	tbz	w0, #0x0, 0x461302c <_ChromeMain+0x460dd90>
 4612f0c: f9403294     	ldr	x20, [x20, #0x60]
 4612f10: b4fffbb4     	cbz	x20, 0x4612e84 <_ChromeMain+0x460dbe8>
 4612f14: f9400288     	ldr	x8, [x20]
 4612f18: f9401508     	ldr	x8, [x8, #0x28]
 4612f1c: aa1403e0     	mov	x0, x20
 4612f20: d63f0100     	blr	x8
 4612f24: 3607fb00     	tbz	w0, #0x0, 0x4612e84 <_ChromeMain+0x460dbe8>
 4612f28: 17ffffe5     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4612f2c: aa0803f4     	mov	x20, x8
 4612f30: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612f34: 910a2000     	add	x0, x0, #0x288
 4612f38: 96ec18d2     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612f3c: 360006c0     	tbz	w0, #0x0, 0x4613014 <_ChromeMain+0x460dd78>
 4612f40: f9402a94     	ldr	x20, [x20, #0x50]
 4612f44: b4fff954     	cbz	x20, 0x4612e6c <_ChromeMain+0x460dbd0>
 4612f48: f9400288     	ldr	x8, [x20]
 4612f4c: f9401508     	ldr	x8, [x8, #0x28]
 4612f50: aa1403e0     	mov	x0, x20
 4612f54: d63f0100     	blr	x8
 4612f58: 3607f8a0     	tbz	w0, #0x0, 0x4612e6c <_ChromeMain+0x460dbd0>
 4612f5c: 17ffffd8     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4612f60: aa0803f3     	mov	x19, x8
 4612f64: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612f68: 910a2000     	add	x0, x0, #0x288
 4612f6c: 96ec18c5     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612f70: 340007c0     	cbz	w0, 0x4613068 <_ChromeMain+0x460ddcc>
 4612f74: f9403274     	ldr	x20, [x19, #0x60]
 4612f78: 17ffffd1     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4612f7c: aa0803f4     	mov	x20, x8
 4612f80: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612f84: 910a2000     	add	x0, x0, #0x288
 4612f88: 96ec18be     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612f8c: 36000560     	tbz	w0, #0x0, 0x4613038 <_ChromeMain+0x460dd9c>
 4612f90: f9402a88     	ldr	x8, [x20, #0x50]
 4612f94: f9429a74     	ldr	x20, [x19, #0x530]
 4612f98: b4000088     	cbz	x8, 0x4612fa8 <_ChromeMain+0x460dd0c>
 4612f9c: f9402a88     	ldr	x8, [x20, #0x50]
 4612fa0: b4fff8c8     	cbz	x8, 0x4612eb8 <_ChromeMain+0x460dc1c>
 4612fa4: 14000010     	b	0x4612fe4 <_ChromeMain+0x460dd48>
 4612fa8: aa1403e8     	mov	x8, x20
 4612fac: 17ffffbf     	b	0x4612ea8 <_ChromeMain+0x460dc0c>
 4612fb0: aa0803f4     	mov	x20, x8
 4612fb4: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612fb8: 910a2000     	add	x0, x0, #0x288
 4612fbc: 96ec18b1     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612fc0: 36000480     	tbz	w0, #0x0, 0x4613050 <_ChromeMain+0x460ddb4>
 4612fc4: f9402e88     	ldr	x8, [x20, #0x58]
 4612fc8: f9429a73     	ldr	x19, [x19, #0x530]
 4612fcc: b4000088     	cbz	x8, 0x4612fdc <_ChromeMain+0x460dd40>
 4612fd0: f9402e68     	ldr	x8, [x19, #0x58]
 4612fd4: b4fff728     	cbz	x8, 0x4612eb8 <_ChromeMain+0x460dc1c>
 4612fd8: 14000009     	b	0x4612ffc <_ChromeMain+0x460dd60>
 4612fdc: aa1303e8     	mov	x8, x19
 4612fe0: 17ffffb4     	b	0x4612eb0 <_ChromeMain+0x460dc14>
 4612fe4: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612fe8: 910a2000     	add	x0, x0, #0x288
 4612fec: 96ec18a5     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612ff0: 340002a0     	cbz	w0, 0x4613044 <_ChromeMain+0x460dda8>
 4612ff4: f9402a94     	ldr	x20, [x20, #0x50]
 4612ff8: 17ffffb1     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4612ffc: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4613000: 910a2000     	add	x0, x0, #0x288
 4613004: 96ec189f     	bl	0x119280 <_ChromeMain+0x113fe4>
 4613008: 340002a0     	cbz	w0, 0x461305c <_ChromeMain+0x460ddc0>
 461300c: f9402e74     	ldr	x20, [x19, #0x58]
 4613010: 17ffffab     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4613014: d4200000     	brk	#0
 4613018: d4400000     	hlt	#0
 461301c: d4200020     	brk	#0x1
 4613020: d4200000     	brk	#0
 4613024: d4400000     	hlt	#0
 4613028: d4200020     	brk	#0x1
 461302c: d4200000     	brk	#0
 4613030: d4400000     	hlt	#0
 4613034: d4200020     	brk	#0x1
 4613038: d4200000     	brk	#0
 461303c: d4400000     	hlt	#0
 4613040: d4200020     	brk	#0x1
 4613044: d4200000     	brk	#0
 4613048: d4400000     	hlt	#0
 461304c: d4200020     	brk	#0x1
 4613050: d4200000     	brk	#0
 4613054: d4400000     	hlt	#0
 4613058: d4200020     	brk	#0x1
 461305c: d4200000     	brk	#0
 4613060: d4400000     	hlt	#0
 4613064: d4200020     	brk	#0x1
 4613068: d4200000     	brk	#0
 461306c: d4400000     	hlt	#0
 4613070: d4200020     	brk	#0x1
 4613074: d10183ff     	sub	sp, sp, #0x60
 4613078: a9025ff8     	stp	x24, x23, [sp, #0x20]
 461307c: a90357f6     	stp	x22, x21, [sp, #0x30]
 4613080: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4613084: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4613088: 910143fd     	add	x29, sp, #0x50
 461308c: aa0203f5     	mov	x21, x2
 4613090: aa0103f3     	mov	x19, x1
 4613094: aa0003f4     	mov	x20, x0
 4613098: f943bc16     	ldr	x22, [x0, #0x778]
 461309c: b4000276     	cbz	x22, 0x46130e8 <_ChromeMain+0x460de4c>
 46130a0: 395d0e88     	ldrb	w8, [x20, #0x743]
 46130a4: 36000228     	tbz	w8, #0x0, 0x46130e8 <_ChromeMain+0x460de4c>
 46130a8: f943c697     	ldr	x23, [x20, #0x788]
 46130ac: b940fad8     	ldr	w24, [x22, #0xf8]
 46130b0: aa1403e0     	mov	x0, x20
 46130b4: 52800001     	mov	w1, #0x0                ; =0
 46130b8: 9400002a     	bl	0x4613160 <_ChromeMain+0x460dec4>
 46130bc: 3dc002a0     	ldr	q0, [x21]
 46130c0: 3d8003e0     	str	q0, [sp]
 46130c4: f9400aa8     	ldr	x8, [x21, #0x10]
 46130c8: f9000be8     	str	x8, [sp, #0x10]
 46130cc: a900febf     	stp	xzr, xzr, [x21, #0x8]
 46130d0: f90002bf     	str	xzr, [x21]
 46130d4: 7100031f     	cmp	w24, #0x0
 46130d8: 9a9703e4     	csel	x4, xzr, x23, eq
 46130dc: 9a9f07e5     	cset	x5, ne
 46130e0: 9a9603e3     	csel	x3, xzr, x22, eq
 46130e4: 1400000d     	b	0x4613118 <_ChromeMain+0x460de7c>
 46130e8: aa1403e0     	mov	x0, x20
 46130ec: 52800001     	mov	w1, #0x0                ; =0
 46130f0: 9400001c     	bl	0x4613160 <_ChromeMain+0x460dec4>
 46130f4: d2800004     	mov	x4, #0x0                ; =0
 46130f8: d2800005     	mov	x5, #0x0                ; =0
 46130fc: d2800003     	mov	x3, #0x0                ; =0
 4613100: 3dc002a0     	ldr	q0, [x21]
 4613104: 3d8003e0     	str	q0, [sp]
 4613108: f9400aa8     	ldr	x8, [x21, #0x10]
 461310c: f9000be8     	str	x8, [sp, #0x10]
 4613110: a900febf     	stp	xzr, xzr, [x21, #0x8]
 4613114: f90002bf     	str	xzr, [x21]
 4613118: 910003e2     	mov	x2, sp
 461311c: aa1403e0     	mov	x0, x20
 4613120: aa1303e1     	mov	x1, x19
 4613124: 9400008c     	bl	0x4613354 <_ChromeMain+0x460e0b8>
 4613128: aa0003f3     	mov	x19, x0
 461312c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4613130: 36f800a8     	tbz	w8, #0x1f, 0x4613144 <_ChromeMain+0x460dea8>
 4613134: f94003e0     	ldr	x0, [sp]
 4613138: f9400be8     	ldr	x8, [sp, #0x10]
 461313c: d37ff901     	lsl	x1, x8, #1
 4613140: 96e7d75e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613144: aa1303e0     	mov	x0, x19
 4613148: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 461314c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4613150: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4613154: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4613158: 910183ff     	add	sp, sp, #0x60
 461315c: d65f03c0     	ret
 4613160: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4613164: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4613168: a9027bfd     	stp	x29, x30, [sp, #0x20]
 461316c: 910083fd     	add	x29, sp, #0x20
 4613170: 395d0c08     	ldrb	w8, [x0, #0x743]
 4613174: 350000a8     	cbnz	w8, 0x4613188 <_ChromeMain+0x460deec>
 4613178: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 461317c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4613180: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4613184: d65f03c0     	ret
 4613188: aa0103f4     	mov	x20, x1
 461318c: aa0003f3     	mov	x19, x0
 4613190: 391d0c1f     	strb	wzr, [x0, #0x743]
 4613194: 395dc008     	ldrb	w8, [x0, #0x770]
 4613198: 34000048     	cbz	w8, 0x46131a0 <_ChromeMain+0x460df04>
 461319c: 391dc27f     	strb	wzr, [x19, #0x770]
 46131a0: f943be60     	ldr	x0, [x19, #0x778]
 46131a4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46131a8: f0052cf5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46131ac: f94046a9     	ldr	x9, [x21, #0x88]
 46131b0: eb09011f     	cmp	x8, x9
 46131b4: 54000041     	b.ne	0x46131bc <_ChromeMain+0x460df20>
 46131b8: 96e83e21     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46131bc: f903be7f     	str	xzr, [x19, #0x778]
 46131c0: 911e0276     	add	x22, x19, #0x780
 46131c4: f943c260     	ldr	x0, [x19, #0x780]
 46131c8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46131cc: f94046a9     	ldr	x9, [x21, #0x88]
 46131d0: eb09011f     	cmp	x8, x9
 46131d4: 54000041     	b.ne	0x46131dc <_ChromeMain+0x460df40>
 46131d8: 96e83e19     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46131dc: a9007edf     	stp	xzr, xzr, [x22]
 46131e0: f942ee68     	ldr	x8, [x19, #0x5d8]
 46131e4: d37ced15     	lsl	x21, x8, #4
 46131e8: b4000195     	cbz	x21, 0x4613218 <_ChromeMain+0x460df7c>
 46131ec: f942ea68     	ldr	x8, [x19, #0x5d0]
 46131f0: 91002116     	add	x22, x8, #0x8
 46131f4: 14000005     	b	0x4613208 <_ChromeMain+0x460df6c>
 46131f8: b904541f     	str	wzr, [x0, #0x454]
 46131fc: 96fe37e0     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4613200: f10042b5     	subs	x21, x21, #0x10
 4613204: 540000a0     	b.eq	0x4613218 <_ChromeMain+0x460df7c>
 4613208: f84106c0     	ldr	x0, [x22], #0x10
 461320c: b9445408     	ldr	w8, [x0, #0x454]
 4613210: 34ffff88     	cbz	w8, 0x4613200 <_ChromeMain+0x460df64>
 4613214: 17fffff9     	b	0x46131f8 <_ChromeMain+0x460df5c>
 4613218: f943aa68     	ldr	x8, [x19, #0x750]
 461321c: 8b080508     	add	x8, x8, x8, lsl #1
 4613220: d37df109     	lsl	x9, x8, #3
 4613224: b4000529     	cbz	x9, 0x46132c8 <_ChromeMain+0x460e02c>
 4613228: f943a675     	ldr	x21, [x19, #0x748]
 461322c: 8b080eb6     	add	x22, x21, x8, lsl #3
 4613230: 14000009     	b	0x4613254 <_ChromeMain+0x460dfb8>
 4613234: aa0903e8     	mov	x8, x9
 4613238: 14000017     	b	0x4613294 <_ChromeMain+0x460dff8>
 461323c: 910022a1     	add	x1, x21, #0x8
 4613240: aa0803e0     	mov	x0, x8
 4613244: 970a4653     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 4613248: 910062b5     	add	x21, x21, #0x18
 461324c: eb1602bf     	cmp	x21, x22
 4613250: 540003c0     	b.eq	0x46132c8 <_ChromeMain+0x460e02c>
 4613254: f942ea69     	ldr	x9, [x19, #0x5d0]
 4613258: f942ee6a     	ldr	x10, [x19, #0x5d8]
 461325c: d37ced48     	lsl	x8, x10, #4
 4613260: b4fffea8     	cbz	x8, 0x4613234 <_ChromeMain+0x460df98>
 4613264: 9344fd0c     	asr	x12, x8, #4
 4613268: f94002ab     	ldr	x11, [x21]
 461326c: aa0903e8     	mov	x8, x9
 4613270: d341fd8d     	lsr	x13, x12, #1
 4613274: 8b0d110e     	add	x14, x8, x13, lsl #4
 4613278: f84105cf     	ldr	x15, [x14], #0x10
 461327c: aa6c07f0     	mvn	x16, x12, lsr #1
 4613280: 8b10018c     	add	x12, x12, x16
 4613284: eb0b01ff     	cmp	x15, x11
 4613288: 9a8d318c     	csel	x12, x12, x13, lo
 461328c: 9a8831c8     	csel	x8, x14, x8, lo
 4613290: b5ffff0c     	cbnz	x12, 0x4613270 <_ChromeMain+0x460dfd4>
 4613294: 8b0a1129     	add	x9, x9, x10, lsl #4
 4613298: eb09011f     	cmp	x8, x9
 461329c: 54fffd60     	b.eq	0x4613248 <_ChromeMain+0x460dfac>
 46132a0: f94002a9     	ldr	x9, [x21]
 46132a4: f940010a     	ldr	x10, [x8]
 46132a8: eb0a013f     	cmp	x9, x10
 46132ac: 54fffce3     	b.lo	0x4613248 <_ChromeMain+0x460dfac>
 46132b0: f9400508     	ldr	x8, [x8, #0x8]
 46132b4: b4fffca8     	cbz	x8, 0x4613248 <_ChromeMain+0x460dfac>
 46132b8: 34fffc34     	cbz	w20, 0x461323c <_ChromeMain+0x460dfa0>
 46132bc: f942a260     	ldr	x0, [x19, #0x540]
 46132c0: b5000400     	cbnz	x0, 0x4613340 <_ChromeMain+0x460e0a4>
 46132c4: 17ffffde     	b	0x461323c <_ChromeMain+0x460dfa0>
 46132c8: 360000f4     	tbz	w20, #0x0, 0x46132e4 <_ChromeMain+0x460e048>
 46132cc: f942a268     	ldr	x8, [x19, #0x540]
 46132d0: b40000c8     	cbz	x8, 0x46132e8 <_ChromeMain+0x460e04c>
 46132d4: f9406108     	ldr	x8, [x8, #0xc0]
 46132d8: f100011f     	cmp	x8, #0x0
 46132dc: 1a9f07e8     	cset	w8, ne
 46132e0: 14000002     	b	0x46132e8 <_ChromeMain+0x460e04c>
 46132e4: 52800008     	mov	w8, #0x0                ; =0
 46132e8: 39218a68     	strb	w8, [x19, #0x862]
 46132ec: f943aa68     	ldr	x8, [x19, #0x750]
 46132f0: 8b080509     	add	x9, x8, x8, lsl #1
 46132f4: d37df129     	lsl	x9, x9, #3
 46132f8: b4000149     	cbz	x9, 0x4613320 <_ChromeMain+0x460e084>
 46132fc: f943a66a     	ldr	x10, [x19, #0x748]
 4613300: d37df10b     	lsl	x11, x8, #3
 4613304: cb081568     	sub	x8, x11, x8, lsl #5
 4613308: 8b0a0129     	add	x9, x9, x10
 461330c: d1006129     	sub	x9, x9, #0x18
 4613310: b4000209     	cbz	x9, 0x4613350 <_ChromeMain+0x460e0b4>
 4613314: d1006129     	sub	x9, x9, #0x18
 4613318: 91006108     	add	x8, x8, #0x18
 461331c: b5ffffa8     	cbnz	x8, 0x4613310 <_ChromeMain+0x460e074>
 4613320: f903aa7f     	str	xzr, [x19, #0x750]
 4613324: b907627f     	str	wzr, [x19, #0x760]
 4613328: f9429e60     	ldr	x0, [x19, #0x538]
 461332c: b4fff260     	cbz	x0, 0x4613178 <_ChromeMain+0x460dedc>
 4613330: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4613334: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4613338: a8c357f6     	ldp	x22, x21, [sp], #0x30
 461333c: 16fe3790     	b	0x5a117c <_ChromeMain+0x59bee0>
 4613340: 910022a2     	add	x2, x21, #0x8
 4613344: aa0803e1     	mov	x1, x8
 4613348: 958128cf     	bl	0xa65d684 <_ChromeMain+0xa6583e8>
 461334c: 17ffffbf     	b	0x4613248 <_ChromeMain+0x460dfac>
 4613350: d4200020     	brk	#0x1
 4613354: d101c3ff     	sub	sp, sp, #0x70
 4613358: a90267fa     	stp	x26, x25, [sp, #0x20]
 461335c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4613360: a90457f6     	stp	x22, x21, [sp, #0x40]
 4613364: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4613368: a9067bfd     	stp	x29, x30, [sp, #0x60]
 461336c: 910183fd     	add	x29, sp, #0x60
 4613370: f9429808     	ldr	x8, [x0, #0x530]
 4613374: b40006a8     	cbz	x8, 0x4613448 <_ChromeMain+0x460e1ac>
 4613378: d2800019     	mov	x25, #0x0               ; =0
 461337c: 39408508     	ldrb	w8, [x8, #0x21]
 4613380: 34000668     	cbz	w8, 0x461344c <_ChromeMain+0x460e1b0>
 4613384: aa0103f4     	mov	x20, x1
 4613388: 39406028     	ldrb	w8, [x1, #0x18]
 461338c: 36000608     	tbz	w8, #0x0, 0x461344c <_ChromeMain+0x460e1b0>
 4613390: aa0503f6     	mov	x22, x5
 4613394: aa0403f8     	mov	x24, x4
 4613398: aa0303f7     	mov	x23, x3
 461339c: aa0203f5     	mov	x21, x2
 46133a0: aa0003f3     	mov	x19, x0
 46133a4: b4000643     	cbz	x3, 0x461346c <_ChromeMain+0x460e1d0>
 46133a8: b940fae8     	ldr	w8, [x23, #0xf8]
 46133ac: 34000608     	cbz	w8, 0x461346c <_ChromeMain+0x460e1d0>
 46133b0: 52800039     	mov	w25, #0x1               ; =1
 46133b4: 39805ea8     	ldrsb	x8, [x21, #0x17]
 46133b8: b7f806a8     	tbnz	x8, #0x3f, 0x461348c <_ChromeMain+0x460e1f0>
 46133bc: b40006c8     	cbz	x8, 0x4613494 <_ChromeMain+0x460e1f8>
 46133c0: f94026e8     	ldr	x8, [x23, #0x48]
 46133c4: eb18011f     	cmp	x8, x24
 46133c8: 9a983109     	csel	x9, x8, x24, lo
 46133cc: 6a16033f     	tst	w25, w22
 46133d0: 9a881122     	csel	x2, x9, x8, ne
 46133d4: f9429a60     	ldr	x0, [x19, #0x530]
 46133d8: aa1703e1     	mov	x1, x23
 46133dc: aa1503e3     	mov	x3, x21
 46133e0: aa1403e4     	mov	x4, x20
 46133e4: d2800005     	mov	x5, #0x0                ; =0
 46133e8: 957d07ac     	bl	0xa555298 <_ChromeMain+0xa54fffc>
 46133ec: aa0003f9     	mov	x25, x0
 46133f0: b40002e0     	cbz	x0, 0x461344c <_ChromeMain+0x460e1b0>
 46133f4: aa1303e0     	mov	x0, x19
 46133f8: aa1903e1     	mov	x1, x25
 46133fc: 940022b4     	bl	0x461becc <_ChromeMain+0x4616c30>
 4613400: f9436274     	ldr	x20, [x19, #0x6c0]
 4613404: b4000254     	cbz	x20, 0x461344c <_ChromeMain+0x460e1b0>
 4613408: 52800028     	mov	w8, #0x1                ; =1
 461340c: b8280288     	ldadd	w8, w8, [x20]
 4613410: 7100011f     	cmp	w8, #0x0
 4613414: 540009ad     	b.le	0x4613548 <_ChromeMain+0x460e2ac>
 4613418: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461341c: 6b09011f     	cmp	w8, w9
 4613420: 540009a0     	b.eq	0x4613554 <_ChromeMain+0x460e2b8>
 4613424: f9436268     	ldr	x8, [x19, #0x6c0]
 4613428: f9400508     	ldr	x8, [x8, #0x8]
 461342c: aa1403e0     	mov	x0, x20
 4613430: d63f0100     	blr	x8
 4613434: 12800008     	mov	w8, #-0x1               ; =-1
 4613438: b8e80288     	ldaddal	w8, w8, [x20]
 461343c: 7100051f     	cmp	w8, #0x1
 4613440: 54000061     	b.ne	0x461344c <_ChromeMain+0x460e1b0>
 4613444: 1400003d     	b	0x4613538 <_ChromeMain+0x460e29c>
 4613448: d2800019     	mov	x25, #0x0               ; =0
 461344c: aa1903e0     	mov	x0, x25
 4613450: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4613454: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4613458: a94457f6     	ldp	x22, x21, [sp, #0x40]
 461345c: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4613460: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4613464: 9101c3ff     	add	sp, sp, #0x70
 4613468: d65f03c0     	ret
 461346c: aa1303e0     	mov	x0, x19
 4613470: 97fffe5f     	bl	0x4612dec <_ChromeMain+0x460db50>
 4613474: b4fffea0     	cbz	x0, 0x4613448 <_ChromeMain+0x460e1ac>
 4613478: aa0003f7     	mov	x23, x0
 461347c: b940f808     	ldr	w8, [x0, #0xf8]
 4613480: 34fffe48     	cbz	w8, 0x4613448 <_ChromeMain+0x460e1ac>
 4613484: 52800019     	mov	w25, #0x0               ; =0
 4613488: 17ffffcb     	b	0x46133b4 <_ChromeMain+0x460e118>
 461348c: f94006a8     	ldr	x8, [x21, #0x8]
 4613490: b5fff988     	cbnz	x8, 0x46133c0 <_ChromeMain+0x460e124>
 4613494: b9403e88     	ldr	w8, [x20, #0x3c]
 4613498: 7100051f     	cmp	w8, #0x1
 461349c: 5400014b     	b.lt	0x46134c4 <_ChromeMain+0x460e228>
 46134a0: 39405e8a     	ldrb	w10, [x20, #0x17]
 46134a4: 13001d49     	sxtb	w9, w10
 46134a8: f940068b     	ldr	x11, [x20, #0x8]
 46134ac: 7100013f     	cmp	w9, #0x0
 46134b0: 9a8a416b     	csel	x11, x11, x10, mi
 46134b4: b9803a8a     	ldrsw	x10, [x20, #0x38]
 46134b8: eb0a016b     	subs	x11, x11, x10
 46134bc: 54000523     	b.lo	0x4613560 <_ChromeMain+0x460e2c4>
 46134c0: 54000241     	b.ne	0x4613508 <_ChromeMain+0x460e26c>
 46134c4: aa1403e0     	mov	x0, x20
 46134c8: 97016570     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 46134cc: 39805c08     	ldrsb	x8, [x0, #0x17]
 46134d0: a9402809     	ldp	x9, x10, [x0]
 46134d4: f100011f     	cmp	x8, #0x0
 46134d8: 9a804120     	csel	x0, x9, x0, mi
 46134dc: 7100011f     	cmp	w8, #0x0
 46134e0: 9a884141     	csel	x1, x10, x8, mi
 46134e4: 910023e8     	add	x8, sp, #0x8
 46134e8: 970b3b8a     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 46134ec: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 46134f0: 37f801a8     	tbnz	w8, #0x1f, 0x4613524 <_ChromeMain+0x460e288>
 46134f4: 3cc083e0     	ldur	q0, [sp, #0x8]
 46134f8: 3d8002a0     	str	q0, [x21]
 46134fc: f9400fe8     	ldr	x8, [sp, #0x18]
 4613500: f9000aa8     	str	x8, [x21, #0x10]
 4613504: 17ffffaf     	b	0x46133c0 <_ChromeMain+0x460e124>
 4613508: eb08017f     	cmp	x11, x8
 461350c: 9a883161     	csel	x1, x11, x8, lo
 4613510: f9400288     	ldr	x8, [x20]
 4613514: 7100013f     	cmp	w9, #0x0
 4613518: 9a944108     	csel	x8, x8, x20, mi
 461351c: 8b0a0100     	add	x0, x8, x10
 4613520: 17fffff1     	b	0x46134e4 <_ChromeMain+0x460e248>
 4613524: f94002a0     	ldr	x0, [x21]
 4613528: f9400aa8     	ldr	x8, [x21, #0x10]
 461352c: d37ff901     	lsl	x1, x8, #1
 4613530: 96e7d662     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613534: 17fffff0     	b	0x46134f4 <_ChromeMain+0x460e258>
 4613538: f9400a88     	ldr	x8, [x20, #0x10]
 461353c: aa1403e0     	mov	x0, x20
 4613540: d63f0100     	blr	x8
 4613544: 17ffffc2     	b	0x461344c <_ChromeMain+0x460e1b0>
 4613548: d4200000     	brk	#0
 461354c: d4400000     	hlt	#0
 4613550: d4200020     	brk	#0x1
 4613554: d4200000     	brk	#0
 4613558: d4400000     	hlt	#0
 461355c: d4200020     	brk	#0x1
 4613560: b0048e80     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4613564: 91376000     	add	x0, x0, #0xdd8
 4613568: 9417b35b     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
 461356c: f9445008     	ldr	x8, [x0, #0x8a0]
 4613570: f944540a     	ldr	x10, [x0, #0x8a8]
 4613574: d37ced49     	lsl	x9, x10, #4
 4613578: b4000289     	cbz	x9, 0x46135c8 <_ChromeMain+0x460e32c>
 461357c: 9344fd2b     	asr	x11, x9, #4
 4613580: aa0803e9     	mov	x9, x8
 4613584: d341fd6c     	lsr	x12, x11, #1
 4613588: 8b0c112d     	add	x13, x9, x12, lsl #4
 461358c: f84105ae     	ldr	x14, [x13], #0x10
 4613590: aa6b07ef     	mvn	x15, x11, lsr #1
 4613594: 8b0f016b     	add	x11, x11, x15
 4613598: eb0101df     	cmp	x14, x1
 461359c: 9a8cb16b     	csel	x11, x11, x12, lt
 46135a0: 9a89b1a9     	csel	x9, x13, x9, lt
 46135a4: b5ffff0b     	cbnz	x11, 0x4613584 <_ChromeMain+0x460e2e8>
 46135a8: 8b0a1108     	add	x8, x8, x10, lsl #4
 46135ac: eb08013f     	cmp	x9, x8
 46135b0: 54000080     	b.eq	0x46135c0 <_ChromeMain+0x460e324>
 46135b4: f9400128     	ldr	x8, [x9]
 46135b8: eb08003f     	cmp	x1, x8
 46135bc: 540000aa     	b.ge	0x46135d0 <_ChromeMain+0x460e334>
 46135c0: d2800000     	mov	x0, #0x0                ; =0
 46135c4: d65f03c0     	ret
 46135c8: aa0803e9     	mov	x9, x8
 46135cc: 17fffff7     	b	0x46135a8 <_ChromeMain+0x460e30c>
 46135d0: b9400928     	ldr	w8, [x9, #0x8]
 46135d4: b2600100     	orr	x0, x8, #0x100000000
 46135d8: d65f03c0     	ret
 46135dc: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 46135e0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 46135e4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 46135e8: 910083fd     	add	x29, sp, #0x20
 46135ec: aa0003f4     	mov	x20, x0
 46135f0: 395bc408     	ldrb	w8, [x0, #0x6f1]
 46135f4: 34000188     	cbz	w8, 0x4613624 <_ChromeMain+0x460e388>
 46135f8: f9429a88     	ldr	x8, [x20, #0x530]
 46135fc: b4000148     	cbz	x8, 0x4613624 <_ChromeMain+0x460e388>
 4613600: 39408508     	ldrb	w8, [x8, #0x21]
 4613604: 34000108     	cbz	w8, 0x4613624 <_ChromeMain+0x460e388>
 4613608: 39630288     	ldrb	w8, [x20, #0x8c0]
 461360c: 340000c8     	cbz	w8, 0x4613624 <_ChromeMain+0x460e388>
 4613610: f9445e81     	ldr	x1, [x20, #0x8b8]
 4613614: aa1403e0     	mov	x0, x20
 4613618: 940003c8     	bl	0x4614538 <_ChromeMain+0x460f29c>
 461361c: aa0003f3     	mov	x19, x0
 4613620: 14000002     	b	0x4613628 <_ChromeMain+0x460e38c>
 4613624: d2800013     	mov	x19, #0x0               ; =0
 4613628: f942ee88     	ldr	x8, [x20, #0x5d8]
 461362c: d37ced09     	lsl	x9, x8, #4
 4613630: b4000089     	cbz	x9, 0x4613640 <_ChromeMain+0x460e3a4>
 4613634: f942ea95     	ldr	x21, [x20, #0x5d0]
 4613638: 8b0812b6     	add	x22, x21, x8, lsl #4
 461363c: 1400000b     	b	0x4613668 <_ChromeMain+0x460e3cc>
 4613640: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4613644: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4613648: a8c357f6     	ldp	x22, x21, [sp], #0x30
 461364c: d65f03c0     	ret
 4613650: 96fe36cb     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4613654: aa1403e0     	mov	x0, x20
 4613658: 96fe36c9     	bl	0x5a117c <_ChromeMain+0x59bee0>
 461365c: 910042b5     	add	x21, x21, #0x10
 4613660: eb1602bf     	cmp	x21, x22
 4613664: 54fffee0     	b.eq	0x4613640 <_ChromeMain+0x460e3a4>
 4613668: f100027f     	cmp	x19, #0x0
 461366c: a94052a8     	ldp	x8, x20, [x21]
 4613670: fa531100     	ccmp	x8, x19, #0x0, ne
 4613674: 1a9f17e8     	cset	w8, eq
 4613678: 39510289     	ldrb	w9, [x20, #0x440]
 461367c: 6b08013f     	cmp	w9, w8
 4613680: 54fffee0     	b.eq	0x461365c <_ChromeMain+0x460e3c0>
 4613684: 39110288     	strb	w8, [x20, #0x440]
 4613688: aa1403e0     	mov	x0, x20
 461368c: 94003c45     	bl	0x46227a0 <_ChromeMain+0x461d504>
 4613690: aa1403e0     	mov	x0, x20
 4613694: 940041ab     	bl	0x4623d40 <_ChromeMain+0x461eaa4>
 4613698: aa1403e0     	mov	x0, x20
 461369c: 94004209     	bl	0x4623ec0 <_ChromeMain+0x461ec24>
 46136a0: f940c680     	ldr	x0, [x20, #0x188]
 46136a4: b4fffd80     	cbz	x0, 0x4613654 <_ChromeMain+0x460e3b8>
 46136a8: 17ffffea     	b	0x4613650 <_ChromeMain+0x460e3b4>
 46136ac: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 46136b0: a90167fa     	stp	x26, x25, [sp, #0x10]
 46136b4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 46136b8: a90357f6     	stp	x22, x21, [sp, #0x30]
 46136bc: a9044ff4     	stp	x20, x19, [sp, #0x40]
 46136c0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 46136c4: 910143fd     	add	x29, sp, #0x50
 46136c8: aa0103f4     	mov	x20, x1
 46136cc: aa0003f3     	mov	x19, x0
 46136d0: f9446817     	ldr	x23, [x0, #0x8d0]
 46136d4: f9400428     	ldr	x8, [x1, #0x8]
 46136d8: f9446415     	ldr	x21, [x0, #0x8c8]
 46136dc: eb0802ff     	cmp	x23, x8
 46136e0: 540004c1     	b.ne	0x4613778 <_ChromeMain+0x460e4dc>
 46136e4: d379e2e8     	lsl	x8, x23, #7
 46136e8: eb170d16     	subs	x22, x8, x23, lsl #3
 46136ec: 54000380     	b.eq	0x461375c <_ChromeMain+0x460e4c0>
 46136f0: d2800018     	mov	x24, #0x0               ; =0
 46136f4: f9400299     	ldr	x25, [x20]
 46136f8: 8b1802a9     	add	x9, x21, x24
 46136fc: 8b180328     	add	x8, x25, x24
 4613700: 39405d2b     	ldrb	w11, [x9, #0x17]
 4613704: 13001d6a     	sxtb	w10, w11
 4613708: f940052c     	ldr	x12, [x9, #0x8]
 461370c: 7100015f     	cmp	w10, #0x0
 4613710: 9a8b4182     	csel	x2, x12, x11, mi
 4613714: 39405d0c     	ldrb	w12, [x8, #0x17]
 4613718: 13001d8b     	sxtb	w11, w12
 461371c: f940050d     	ldr	x13, [x8, #0x8]
 4613720: 7100017f     	cmp	w11, #0x0
 4613724: 9a8c41ac     	csel	x12, x13, x12, mi
 4613728: eb0c005f     	cmp	x2, x12
 461372c: 54000261     	b.ne	0x4613778 <_ChromeMain+0x460e4dc>
 4613730: f940012c     	ldr	x12, [x9]
 4613734: 7100015f     	cmp	w10, #0x0
 4613738: 9a894180     	csel	x0, x12, x9, mi
 461373c: f9400109     	ldr	x9, [x8]
 4613740: 7100017f     	cmp	w11, #0x0
 4613744: 9a884121     	csel	x1, x9, x8, mi
 4613748: 94e7d846     	bl	0x8009860 <_ChromeMain+0x80045c4>
 461374c: 35000160     	cbnz	w0, 0x4613778 <_ChromeMain+0x460e4dc>
 4613750: 9101e318     	add	x24, x24, #0x78
 4613754: eb1802df     	cmp	x22, x24
 4613758: 54fffd01     	b.ne	0x46136f8 <_ChromeMain+0x460e45c>
 461375c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4613760: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4613764: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4613768: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 461376c: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4613770: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4613774: d65f03c0     	ret
 4613778: b5000235     	cbnz	x21, 0x46137bc <_ChromeMain+0x460e520>
 461377c: f9400288     	ldr	x8, [x20]
 4613780: f9046668     	str	x8, [x19, #0x8c8]
 4613784: f9400688     	ldr	x8, [x20, #0x8]
 4613788: f9046a68     	str	x8, [x19, #0x8d0]
 461378c: f9400a88     	ldr	x8, [x20, #0x10]
 4613790: f9046e68     	str	x8, [x19, #0x8d8]
 4613794: a9007e9f     	stp	xzr, xzr, [x20]
 4613798: f9000a9f     	str	xzr, [x20, #0x10]
 461379c: aa1303e0     	mov	x0, x19
 46137a0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 46137a4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 46137a8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 46137ac: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 46137b0: a94167fa     	ldp	x26, x25, [sp, #0x10]
 46137b4: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 46137b8: 1400002b     	b	0x4613864 <_ChromeMain+0x460e5c8>
 46137bc: 91232276     	add	x22, x19, #0x8c8
 46137c0: d379e2e8     	lsl	x8, x23, #7
 46137c4: eb170d17     	subs	x23, x8, x23, lsl #3
 46137c8: 54000480     	b.eq	0x4613858 <_ChromeMain+0x460e5bc>
 46137cc: d2800018     	mov	x24, #0x0               ; =0
 46137d0: aa1503f9     	mov	x25, x21
 46137d4: 8b17033b     	add	x27, x25, x23
 46137d8: f101e37a     	subs	x26, x27, #0x78
 46137dc: 54000420     	b.eq	0x4613860 <_ChromeMain+0x460e5c4>
 46137e0: d1002360     	sub	x0, x27, #0x8
 46137e4: d2800001     	mov	x1, #0x0                ; =0
 46137e8: 96e85134     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46137ec: d1016360     	sub	x0, x27, #0x58
 46137f0: 96e85122     	bl	0x27c78 <_ChromeMain+0x229dc>
 46137f4: 38d9f368     	ldursb	w8, [x27, #-0x61]
 46137f8: 36f800c8     	tbz	w8, #0x1f, 0x4613810 <_ChromeMain+0x460e574>
 46137fc: f9400340     	ldr	x0, [x26]
 4613800: 8b170328     	add	x8, x25, x23
 4613804: f8598108     	ldur	x8, [x8, #-0x68]
 4613808: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461380c: 96e7d5ab     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613810: d101e339     	sub	x25, x25, #0x78
 4613814: 9101e318     	add	x24, x24, #0x78
 4613818: eb1802ff     	cmp	x23, x24
 461381c: 54fffdc1     	b.ne	0x46137d4 <_ChromeMain+0x460e538>
 4613820: f94002c0     	ldr	x0, [x22]
 4613824: cb0002a8     	sub	x8, x21, x0
 4613828: 9343fd08     	asr	x8, x8, #3
 461382c: b203ebe9     	mov	x9, #-0x1111111111111112 ; =-1229782938247303442
 4613830: f29ddde9     	movk	x9, #0xeeef
 4613834: 9b097d08     	mul	x8, x8, x9
 4613838: f9046a68     	str	x8, [x19, #0x8d0]
 461383c: f9446e68     	ldr	x8, [x19, #0x8d8]
 4613840: d379e109     	lsl	x9, x8, #7
 4613844: cb080d21     	sub	x1, x9, x8, lsl #3
 4613848: 96e7d59c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461384c: a9007edf     	stp	xzr, xzr, [x22]
 4613850: f9000adf     	str	xzr, [x22, #0x10]
 4613854: 17ffffca     	b	0x461377c <_ChromeMain+0x460e4e0>
 4613858: aa1503e0     	mov	x0, x21
 461385c: 17fffff2     	b	0x4613824 <_ChromeMain+0x460e588>
 4613860: d4200020     	brk	#0x1
 4613864: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4613868: a90167fa     	stp	x26, x25, [sp, #0x10]
 461386c: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4613870: a90357f6     	stp	x22, x21, [sp, #0x30]
 4613874: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4613878: a9057bfd     	stp	x29, x30, [sp, #0x50]
 461387c: 910143fd     	add	x29, sp, #0x50
 4613880: d10883ff     	sub	sp, sp, #0x220
 4613884: f942ec08     	ldr	x8, [x0, #0x5d8]
 4613888: d37ced09     	lsl	x9, x8, #4
 461388c: b40002c9     	cbz	x9, 0x46138e4 <_ChromeMain+0x460e648>
 4613890: aa0003f3     	mov	x19, x0
 4613894: f942e818     	ldr	x24, [x0, #0x5d0]
 4613898: 8b081319     	add	x25, x24, x8, lsl #4
 461389c: 910083fb     	add	x27, sp, #0x20
 46138a0: 14000064     	b	0x4613a30 <_ChromeMain+0x460e794>
 46138a4: 97234a17     	bl	0xee6100 <_ChromeMain+0xee0e64>
 46138a8: 35003bc0     	cbnz	w0, 0x4614020 <_ChromeMain+0x460ed84>
 46138ac: aa1403e0     	mov	x0, x20
 46138b0: 97332b69     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 46138b4: aa0003f5     	mov	x21, x0
 46138b8: f9416680     	ldr	x0, [x20, #0x2c8]
 46138bc: f9016695     	str	x21, [x20, #0x2c8]
 46138c0: b4000320     	cbz	x0, 0x4613924 <_ChromeMain+0x460e688>
 46138c4: 140001d2     	b	0x461400c <_ChromeMain+0x460ed70>
 46138c8: f940111a     	ldr	x26, [x8, #0x20]
 46138cc: 92800209     	mov	x9, #-0x11              ; =-17
 46138d0: f2efffe9     	movk	x9, #0x7fff, lsl #48
 46138d4: eb09035f     	cmp	x26, x9
 46138d8: 540035e2     	b.hs	0x4613f94 <_ChromeMain+0x460ecf8>
 46138dc: f9400d16     	ldr	x22, [x8, #0x18]
 46138e0: 14000016     	b	0x4613938 <_ChromeMain+0x460e69c>
 46138e4: 910883ff     	add	sp, sp, #0x220
 46138e8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 46138ec: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 46138f0: a94357f6     	ldp	x22, x21, [sp, #0x30]
 46138f4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 46138f8: a94167fa     	ldp	x26, x25, [sp, #0x10]
 46138fc: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4613900: d65f03c0     	ret
 4613904: 39025ffa     	strb	w26, [sp, #0x97]
 4613908: 910203f7     	add	x23, sp, #0x80
 461390c: 14000016     	b	0x4613964 <_ChromeMain+0x460e6c8>
 4613910: f9400008     	ldr	x8, [x0]
 4613914: f941f108     	ldr	x8, [x8, #0x3e0]
 4613918: d63f0100     	blr	x8
 461391c: f9416695     	ldr	x21, [x20, #0x2c8]
 4613920: b4fffc35     	cbz	x21, 0x46138a4 <_ChromeMain+0x460e608>
 4613924: f9421688     	ldr	x8, [x20, #0x428]
 4613928: f941ad08     	ldr	x8, [x8, #0x358]
 461392c: 3980bd1a     	ldrsb	x26, [x8, #0x2f]
 4613930: b7fffcda     	tbnz	x26, #0x3f, 0x46138c8 <_ChromeMain+0x460e62c>
 4613934: 91006116     	add	x22, x8, #0x18
 4613938: f1002b5f     	cmp	x26, #0xa
 461393c: 54fffe49     	b.ls	0x4613904 <_ChromeMain+0x460e668>
 4613940: 927def5c     	and	x28, x26, #0x7ffffffffffffff8
 4613944: d37ffb88     	lsl	x8, x28, #1
 4613948: 91004100     	add	x0, x8, #0x10
 461394c: 96e7ee87     	bl	0xf368 <_ChromeMain+0xa0cc>
 4613950: aa0003f7     	mov	x23, x0
 4613954: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 4613958: cb080388     	sub	x8, x28, x8
 461395c: a9086be0     	stp	x0, x26, [sp, #0x80]
 4613960: f9004be8     	str	x8, [sp, #0x90]
 4613964: 8b1a06e8     	add	x8, x23, x26, lsl #1
 4613968: eb17011f     	cmp	x8, x23
 461396c: 54002da3     	b.lo	0x4613f20 <_ChromeMain+0x460ec84>
 4613970: eb1602ff     	cmp	x23, x22
 4613974: fa569100     	ccmp	x8, x22, #0x0, ls
 4613978: 54002d48     	b.hi	0x4613f20 <_ChromeMain+0x460ec84>
 461397c: d37ffb42     	lsl	x2, x26, #1
 4613980: aa1703e0     	mov	x0, x23
 4613984: aa1603e1     	mov	x1, x22
 4613988: 94e7ee51     	bl	0x800f2cc <_ChromeMain+0x800a030>
 461398c: 783a7aff     	strh	wzr, [x23, x26, lsl #1]
 4613990: 910203e1     	add	x1, sp, #0x80
 4613994: aa1503e0     	mov	x0, x21
 4613998: 972d67d0     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 461399c: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 46139a0: 36f800a8     	tbz	w8, #0x1f, 0x46139b4 <_ChromeMain+0x460e718>
 46139a4: f94043e0     	ldr	x0, [sp, #0x80]
 46139a8: f9404be8     	ldr	x8, [sp, #0x90]
 46139ac: d37ff901     	lsl	x1, x8, #1
 46139b0: 96e7d542     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46139b4: aa1403e0     	mov	x0, x20
 46139b8: 52800001     	mov	w1, #0x0                ; =0
 46139bc: 970072ae     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46139c0: aa1403e0     	mov	x0, x20
 46139c4: 96fe35ee     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46139c8: f9429660     	ldr	x0, [x19, #0x528]
 46139cc: b4000200     	cbz	x0, 0x4613a0c <_ChromeMain+0x460e770>
 46139d0: 910c4281     	add	x1, x20, #0x310
 46139d4: 9768b42b     	bl	0x2040a80 <_ChromeMain+0x203b7e4>
 46139d8: 340001a0     	cbz	w0, 0x4613a0c <_ChromeMain+0x460e770>
 46139dc: f941ea80     	ldr	x0, [x20, #0x3d0]
 46139e0: b40000e0     	cbz	x0, 0x46139fc <_ChromeMain+0x460e760>
 46139e4: 39511e88     	ldrb	w8, [x20, #0x447]
 46139e8: 370000a8     	tbnz	w8, #0x0, 0x46139fc <_ChromeMain+0x460e760>
 46139ec: f941f288     	ldr	x8, [x20, #0x3e0]
 46139f0: b4000068     	cbz	x8, 0x46139fc <_ChromeMain+0x460e760>
 46139f4: b940f909     	ldr	w9, [x8, #0xf8]
 46139f8: 34001069     	cbz	w9, 0x4613c04 <_ChromeMain+0x460e968>
 46139fc: f9429660     	ldr	x0, [x19, #0x528]
 4613a00: d2800001     	mov	x1, #0x0                ; =0
 4613a04: 52800082     	mov	w2, #0x4                ; =4
 4613a08: 9785426e     	bl	0x27643c0 <_ChromeMain+0x275f124>
 4613a0c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4613a10: 36f800a8     	tbz	w8, #0x1f, 0x4613a24 <_ChromeMain+0x460e788>
 4613a14: f94013e0     	ldr	x0, [sp, #0x20]
 4613a18: f9401be8     	ldr	x8, [sp, #0x30]
 4613a1c: d37ff901     	lsl	x1, x8, #1
 4613a20: 96e7d526     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613a24: 91004318     	add	x24, x24, #0x10
 4613a28: eb19031f     	cmp	x24, x25
 4613a2c: 54fff5c0     	b.eq	0x46138e4 <_ChromeMain+0x460e648>
 4613a30: a9405316     	ldp	x22, x20, [x24]
 4613a34: f10002df     	cmp	x22, #0x0
 4613a38: fa401a84     	ccmp	x20, #0x0, #0x4, ne
 4613a3c: 54ffff40     	b.eq	0x4613a24 <_ChromeMain+0x460e788>
 4613a40: b940fac8     	ldr	w8, [x22, #0xf8]
 4613a44: 34000128     	cbz	w8, 0x4613a68 <_ChromeMain+0x460e7cc>
 4613a48: 39510688     	ldrb	w8, [x20, #0x441]
 4613a4c: 34fffec8     	cbz	w8, 0x4613a24 <_ChromeMain+0x460e788>
 4613a50: 3911069f     	strb	wzr, [x20, #0x441]
 4613a54: aa1403e0     	mov	x0, x20
 4613a58: 940040ba     	bl	0x4623d40 <_ChromeMain+0x461eaa4>
 4613a5c: aa1403e0     	mov	x0, x20
 4613a60: 94004118     	bl	0x4623ec0 <_ChromeMain+0x461ec24>
 4613a64: 17fffff0     	b	0x4613a24 <_ChromeMain+0x460e788>
 4613a68: f94032c1     	ldr	x1, [x22, #0x60]
 4613a6c: aa1303e0     	mov	x0, x19
 4613a70: 94000780     	bl	0x4615870 <_ChromeMain+0x46105d4>
 4613a74: aa0003f5     	mov	x21, x0
 4613a78: d360fc17     	lsr	x23, x0, #32
 4613a7c: 39510688     	ldrb	w8, [x20, #0x441]
 4613a80: 6b17011f     	cmp	w8, w23
 4613a84: 540000c0     	b.eq	0x4613a9c <_ChromeMain+0x460e800>
 4613a88: 39110697     	strb	w23, [x20, #0x441]
 4613a8c: aa1403e0     	mov	x0, x20
 4613a90: 940040ac     	bl	0x4623d40 <_ChromeMain+0x461eaa4>
 4613a94: aa1403e0     	mov	x0, x20
 4613a98: 9400410a     	bl	0x4623ec0 <_ChromeMain+0x461ec24>
 4613a9c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4613aa0: f9001bff     	str	xzr, [sp, #0x30]
 4613aa4: 910083e8     	add	x8, sp, #0x20
 4613aa8: aa1603e0     	mov	x0, x22
 4613aac: 940020bd     	bl	0x461bda0 <_ChromeMain+0x4616b04>
 4613ab0: 34000697     	cbz	w23, 0x4613b80 <_ChromeMain+0x460e8e4>
 4613ab4: f9429268     	ldr	x8, [x19, #0x520]
 4613ab8: b4000648     	cbz	x8, 0x4613b80 <_ChromeMain+0x460e8e4>
 4613abc: 37f80635     	tbnz	w21, #0x1f, 0x4613b80 <_ChromeMain+0x460e8e4>
 4613ac0: f9400100     	ldr	x0, [x8]
 4613ac4: b9401808     	ldr	w8, [x0, #0x18]
 4613ac8: 6b0802bf     	cmp	w21, w8
 4613acc: 540005aa     	b.ge	0x4613b80 <_ChromeMain+0x460e8e4>
 4613ad0: 92407aa1     	and	x1, x21, #0x7fffffff
 4613ad4: 97292a09     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4613ad8: f9402015     	ldr	x21, [x0, #0x40]
 4613adc: b4000535     	cbz	x21, 0x4613b80 <_ChromeMain+0x460e8e4>
 4613ae0: a9007fff     	stp	xzr, xzr, [sp]
 4613ae4: f9000bff     	str	xzr, [sp, #0x10]
 4613ae8: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 4613aec: f9003bff     	str	xzr, [sp, #0x70]
 4613af0: aa1503e0     	mov	x0, x21
 4613af4: 973a527a     	bl	0x14a84dc <_ChromeMain+0x14a3240>
 4613af8: 39c05c08     	ldrsb	w8, [x0, #0x17]
 4613afc: 37f80748     	tbnz	w8, #0x1f, 0x4613be4 <_ChromeMain+0x460e948>
 4613b00: 3dc00000     	ldr	q0, [x0]
 4613b04: f9400808     	ldr	x8, [x0, #0x10]
 4613b08: f9003be8     	str	x8, [sp, #0x70]
 4613b0c: 3d801be0     	str	q0, [sp, #0x60]
 4613b10: 3941dfe8     	ldrb	w8, [sp, #0x77]
 4613b14: f94037e9     	ldr	x9, [sp, #0x68]
 4613b18: 7219011f     	tst	w8, #0x80
 4613b1c: 9a881128     	csel	x8, x9, x8, ne
 4613b20: b4000cc8     	cbz	x8, 0x4613cb8 <_ChromeMain+0x460ea1c>
 4613b24: 3dc01be0     	ldr	q0, [sp, #0x60]
 4613b28: 3d8003e0     	str	q0, [sp]
 4613b2c: f9403be8     	ldr	x8, [sp, #0x70]
 4613b30: f9000be8     	str	x8, [sp, #0x10]
 4613b34: 39405fe8     	ldrb	w8, [sp, #0x17]
 4613b38: 13001d09     	sxtb	w9, w8
 4613b3c: f94007e2     	ldr	x2, [sp, #0x8]
 4613b40: 7100013f     	cmp	w9, #0x0
 4613b44: 9a884048     	csel	x8, x2, x8, mi
 4613b48: b4000108     	cbz	x8, 0x4613b68 <_ChromeMain+0x460e8cc>
 4613b4c: 39c0dfea     	ldrsb	w10, [sp, #0x37]
 4613b50: 37f81d8a     	tbnz	w10, #0x1f, 0x4613f00 <_ChromeMain+0x460ec64>
 4613b54: 37f80509     	tbnz	w9, #0x1f, 0x4613bf4 <_ChromeMain+0x460e958>
 4613b58: 3dc003e0     	ldr	q0, [sp]
 4613b5c: 3d800be0     	str	q0, [sp, #0x20]
 4613b60: f9400be8     	ldr	x8, [sp, #0x10]
 4613b64: f9001be8     	str	x8, [sp, #0x30]
 4613b68: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4613b6c: 36f800a8     	tbz	w8, #0x1f, 0x4613b80 <_ChromeMain+0x460e8e4>
 4613b70: f94003e0     	ldr	x0, [sp]
 4613b74: f9400be8     	ldr	x8, [sp, #0x10]
 4613b78: d37ff901     	lsl	x1, x8, #1
 4613b7c: 96e7d4cf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613b80: f9421680     	ldr	x0, [x20, #0x428]
 4613b84: b4fff220     	cbz	x0, 0x46139c8 <_ChromeMain+0x460e72c>
 4613b88: f941ac0a     	ldr	x10, [x0, #0x358]
 4613b8c: 3980bd48     	ldrsb	x8, [x10, #0x2f]
 4613b90: b7f80268     	tbnz	x8, #0x3f, 0x4613bdc <_ChromeMain+0x460e940>
 4613b94: 91006149     	add	x9, x10, #0x18
 4613b98: 3940dfea     	ldrb	w10, [sp, #0x37]
 4613b9c: 13001d4b     	sxtb	w11, w10
 4613ba0: a94237ec     	ldp	x12, x13, [sp, #0x20]
 4613ba4: 7100017f     	cmp	w11, #0x0
 4613ba8: 9a8a41a2     	csel	x2, x13, x10, mi
 4613bac: 9a9b4181     	csel	x1, x12, x27, mi
 4613bb0: eb02011f     	cmp	x8, x2
 4613bb4: 54ffeae1     	b.ne	0x4613910 <_ChromeMain+0x460e674>
 4613bb8: b4fff088     	cbz	x8, 0x46139c8 <_ChromeMain+0x460e72c>
 4613bbc: aa0103ea     	mov	x10, x1
 4613bc0: 7840252b     	ldrh	w11, [x9], #0x2
 4613bc4: 7840254c     	ldrh	w12, [x10], #0x2
 4613bc8: 6b0b019f     	cmp	w12, w11
 4613bcc: 54ffea21     	b.ne	0x4613910 <_ChromeMain+0x460e674>
 4613bd0: f1000508     	subs	x8, x8, #0x1
 4613bd4: 54ffff61     	b.ne	0x4613bc0 <_ChromeMain+0x460e924>
 4613bd8: 17ffff7c     	b	0x46139c8 <_ChromeMain+0x460e72c>
 4613bdc: a941a149     	ldp	x9, x8, [x10, #0x18]
 4613be0: 17ffffee     	b	0x4613b98 <_ChromeMain+0x460e8fc>
 4613be4: a9400801     	ldp	x1, x2, [x0]
 4613be8: 910183e0     	add	x0, sp, #0x60
 4613bec: 96e8cbf9     	bl	0x46bd0 <_ChromeMain+0x41934>
 4613bf0: 17ffffc8     	b	0x4613b10 <_ChromeMain+0x460e874>
 4613bf4: f94003e1     	ldr	x1, [sp]
 4613bf8: 910083e0     	add	x0, sp, #0x20
 4613bfc: 970aeabc     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 4613c00: 17ffffda     	b	0x4613b68 <_ChromeMain+0x460e8cc>
 4613c04: f9403101     	ldr	x1, [x8, #0x60]
 4613c08: 9400071a     	bl	0x4615870 <_ChromeMain+0x46105d4>
 4613c0c: d360fc08     	lsr	x8, x0, #32
 4613c10: b4ffef68     	cbz	x8, 0x46139fc <_ChromeMain+0x460e760>
 4613c14: f941ea88     	ldr	x8, [x20, #0x3d0]
 4613c18: b4ffef28     	cbz	x8, 0x46139fc <_ChromeMain+0x460e760>
 4613c1c: 6f00e400     	movi.2d	v0, #0000000000000000
 4613c20: ad0f83e0     	stp	q0, q0, [sp, #0x1f0]
 4613c24: ad0e83e0     	stp	q0, q0, [sp, #0x1d0]
 4613c28: ad0d83e0     	stp	q0, q0, [sp, #0x1b0]
 4613c2c: ad0c83e0     	stp	q0, q0, [sp, #0x190]
 4613c30: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 4613c34: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 4613c38: ad0983e0     	stp	q0, q0, [sp, #0x130]
 4613c3c: ad0883e0     	stp	q0, q0, [sp, #0x110]
 4613c40: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 4613c44: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 4613c48: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 4613c4c: ad0483e0     	stp	q0, q0, [sp, #0x90]
 4613c50: 3d8023e0     	str	q0, [sp, #0x80]
 4613c54: 910203e0     	add	x0, sp, #0x80
 4613c58: 97ef15e9     	bl	0x41d93fc <_ChromeMain+0x41d4160>
 4613c5c: f941ea80     	ldr	x0, [x20, #0x3d0]
 4613c60: f941f281     	ldr	x1, [x20, #0x3e0]
 4613c64: 910203e2     	add	x2, sp, #0x80
 4613c68: 94000765     	bl	0x46159fc <_ChromeMain+0x4610760>
 4613c6c: 37000080     	tbnz	w0, #0x0, 0x4613c7c <_ChromeMain+0x460e9e0>
 4613c70: 910203e0     	add	x0, sp, #0x80
 4613c74: 972b6283     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 4613c78: 17ffff61     	b	0x46139fc <_ChromeMain+0x460e760>
 4613c7c: 910c4280     	add	x0, x20, #0x310
 4613c80: 910203e1     	add	x1, sp, #0x80
 4613c84: 978815dd     	bl	0x28193f8 <_ChromeMain+0x281415c>
 4613c88: 910203e0     	add	x0, sp, #0x80
 4613c8c: 972b627d     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 4613c90: f9429660     	ldr	x0, [x19, #0x528]
 4613c94: 910c4281     	add	x1, x20, #0x310
 4613c98: 52800042     	mov	w2, #0x2                ; =2
 4613c9c: 17ffff5b     	b	0x4613a08 <_ChromeMain+0x460e76c>
 4613ca0: b942baa9     	ldr	w9, [x21, #0x2b8]
 4613ca4: 3100053f     	cmn	w9, #0x1
 4613ca8: 540016c1     	b.ne	0x4613f80 <_ChromeMain+0x460ece4>
 4613cac: 394d2109     	ldrb	w9, [x8, #0x348]
 4613cb0: 34000329     	cbz	w9, 0x4613d14 <_ChromeMain+0x460ea78>
 4613cb4: 140000a1     	b	0x4613f38 <_ChromeMain+0x460ec9c>
 4613cb8: f9007bff     	str	xzr, [sp, #0xf0]
 4613cbc: 6f00e400     	movi.2d	v0, #0000000000000000
 4613cc0: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 4613cc4: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 4613cc8: ad0483e0     	stp	q0, q0, [sp, #0x90]
 4613ccc: 3d8023e0     	str	q0, [sp, #0x80]
 4613cd0: f9414aa8     	ldr	x8, [x21, #0x290]
 4613cd4: b5fffe68     	cbnz	x8, 0x4613ca0 <_ChromeMain+0x460ea04>
 4613cd8: f94132a8     	ldr	x8, [x21, #0x260]
 4613cdc: f9401d09     	ldr	x9, [x8, #0x38]
 4613ce0: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 4613ce4: d0ffd18a     	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 4613ce8: 913c814a     	add	x10, x10, #0xf20
 4613cec: eb0a013f     	cmp	x9, x10
 4613cf0: 540011a1     	b.ne	0x4613f24 <_ChromeMain+0x460ec88>
 4613cf4: 3100051f     	cmn	w8, #0x1
 4613cf8: 54001500     	b.eq	0x4613f98 <_ChromeMain+0x460ecfc>
 4613cfc: f94142a9     	ldr	x9, [x21, #0x280]
 4613d00: eb08013f     	cmp	x9, x8
 4613d04: 540010e9     	b.ls	0x4613f20 <_ChromeMain+0x460ec84>
 4613d08: f9413ea9     	ldr	x9, [x21, #0x278]
 4613d0c: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4613d10: b40016a8     	cbz	x8, 0x4613fe4 <_ChromeMain+0x460ed48>
 4613d14: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 4613d18: b7f815e9     	tbnz	x9, #0x3f, 0x4613fd4 <_ChromeMain+0x460ed38>
 4613d1c: b5001609     	cbnz	x9, 0x4613fdc <_ChromeMain+0x460ed40>
 4613d20: f9400d08     	ldr	x8, [x8, #0x18]
 4613d24: f9400508     	ldr	x8, [x8, #0x8]
 4613d28: 91018101     	add	x1, x8, #0x60
 4613d2c: 910203e0     	add	x0, sp, #0x80
 4613d30: 96ec9899     	bl	0x139f94 <_ChromeMain+0x134cf8>
 4613d34: 394263e8     	ldrb	w8, [sp, #0x98]
 4613d38: 370002e8     	tbnz	w8, #0x0, 0x4613d94 <_ChromeMain+0x460eaf8>
 4613d3c: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 4613d40: 3100051f     	cmn	w8, #0x1
 4613d44: 54001300     	b.eq	0x4613fa4 <_ChromeMain+0x460ed08>
 4613d48: f94142a9     	ldr	x9, [x21, #0x280]
 4613d4c: eb08013f     	cmp	x9, x8
 4613d50: 54000e89     	b.ls	0x4613f20 <_ChromeMain+0x460ec84>
 4613d54: f9413ea9     	ldr	x9, [x21, #0x278]
 4613d58: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4613d5c: b4001528     	cbz	x8, 0x4614000 <_ChromeMain+0x460ed64>
 4613d60: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 4613d64: b7f81469     	tbnz	x9, #0x3f, 0x4613ff0 <_ChromeMain+0x460ed54>
 4613d68: b5001489     	cbnz	x9, 0x4613ff8 <_ChromeMain+0x460ed5c>
 4613d6c: f9400d08     	ldr	x8, [x8, #0x18]
 4613d70: f9400508     	ldr	x8, [x8, #0x8]
 4613d74: 91018101     	add	x1, x8, #0x60
 4613d78: 910203e0     	add	x0, sp, #0x80
 4613d7c: 96fadee4     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 4613d80: 394263e8     	ldrb	w8, [sp, #0x98]
 4613d84: 37000088     	tbnz	w8, #0x0, 0x4613d94 <_ChromeMain+0x460eaf8>
 4613d88: a9007fff     	stp	xzr, xzr, [sp]
 4613d8c: f9000bff     	str	xzr, [sp, #0x10]
 4613d90: 14000049     	b	0x4613eb4 <_ChromeMain+0x460ec18>
 4613d94: b940bfe8     	ldr	w8, [sp, #0xbc]
 4613d98: 7100011f     	cmp	w8, #0x0
 4613d9c: 540005ed     	b.le	0x4613e58 <_ChromeMain+0x460ebbc>
 4613da0: 39425fe9     	ldrb	w9, [sp, #0x97]
 4613da4: 13001d2a     	sxtb	w10, w9
 4613da8: f94047eb     	ldr	x11, [sp, #0x88]
 4613dac: 7100015f     	cmp	w10, #0x0
 4613db0: 9a894169     	csel	x9, x11, x9, mi
 4613db4: b980bbf7     	ldrsw	x23, [sp, #0xb8]
 4613db8: eb17012b     	subs	x11, x9, x23
 4613dbc: 54000fa3     	b.lo	0x4613fb0 <_ChromeMain+0x460ed14>
 4613dc0: 7100015f     	cmp	w10, #0x0
 4613dc4: f94043ea     	ldr	x10, [sp, #0x80]
 4613dc8: 910203ec     	add	x12, sp, #0x80
 4613dcc: 9a8c415a     	csel	x26, x10, x12, mi
 4613dd0: eb08017f     	cmp	x11, x8
 4613dd4: 9a883175     	csel	x21, x11, x8, lo
 4613dd8: eb17013f     	cmp	x9, x23
 4613ddc: 540003e0     	b.eq	0x4613e58 <_ChromeMain+0x460ebbc>
 4613de0: f1005abf     	cmp	x21, #0x16
 4613de4: 54000149     	b.ls	0x4613e0c <_ChromeMain+0x460eb70>
 4613de8: 927c6abc     	and	x28, x21, #0x7ffffff0
 4613dec: 91004380     	add	x0, x28, #0x10
 4613df0: 96e7ed5e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4613df4: aa0003f6     	mov	x22, x0
 4613df8: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 4613dfc: cb080388     	sub	x8, x28, x8
 4613e00: a90457e0     	stp	x0, x21, [sp, #0x40]
 4613e04: f9002be8     	str	x8, [sp, #0x50]
 4613e08: 14000003     	b	0x4613e14 <_ChromeMain+0x460eb78>
 4613e0c: 39015ff5     	strb	w21, [sp, #0x57]
 4613e10: 910103f6     	add	x22, sp, #0x40
 4613e14: 8b1502c8     	add	x8, x22, x21
 4613e18: eb16011f     	cmp	x8, x22
 4613e1c: 54000823     	b.lo	0x4613f20 <_ChromeMain+0x460ec84>
 4613e20: 8b170341     	add	x1, x26, x23
 4613e24: eb0102df     	cmp	x22, x1
 4613e28: 54000068     	b.hi	0x4613e34 <_ChromeMain+0x460eb98>
 4613e2c: eb01011f     	cmp	x8, x1
 4613e30: 54000788     	b.hi	0x4613f20 <_ChromeMain+0x460ec84>
 4613e34: aa1603e0     	mov	x0, x22
 4613e38: aa1503e2     	mov	x2, x21
 4613e3c: 94e7ed24     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4613e40: 38356adf     	strb	wzr, [x22, x21]
 4613e44: 1400000d     	b	0x4613e78 <_ChromeMain+0x460ebdc>
 4613e48: a9400801     	ldp	x1, x2, [x0]
 4613e4c: 910103e0     	add	x0, sp, #0x40
 4613e50: 96e810f2     	bl	0x18218 <_ChromeMain+0x12f7c>
 4613e54: 14000009     	b	0x4613e78 <_ChromeMain+0x460ebdc>
 4613e58: 910203e0     	add	x0, sp, #0x80
 4613e5c: 9701630b     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 4613e60: 39c05c08     	ldrsb	w8, [x0, #0x17]
 4613e64: 37ffff28     	tbnz	w8, #0x1f, 0x4613e48 <_ChromeMain+0x460ebac>
 4613e68: 3dc00000     	ldr	q0, [x0]
 4613e6c: f9400808     	ldr	x8, [x0, #0x10]
 4613e70: f9002be8     	str	x8, [sp, #0x50]
 4613e74: 3d8013e0     	str	q0, [sp, #0x40]
 4613e78: 39815fe8     	ldrsb	x8, [sp, #0x57]
 4613e7c: a9442be9     	ldp	x9, x10, [sp, #0x40]
 4613e80: f100011f     	cmp	x8, #0x0
 4613e84: 910103eb     	add	x11, sp, #0x40
 4613e88: 9a8b4120     	csel	x0, x9, x11, mi
 4613e8c: 7100011f     	cmp	w8, #0x0
 4613e90: 9a884141     	csel	x1, x10, x8, mi
 4613e94: 910003e8     	mov	x8, sp
 4613e98: 970b391e     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 4613e9c: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 4613ea0: 36f800a8     	tbz	w8, #0x1f, 0x4613eb4 <_ChromeMain+0x460ec18>
 4613ea4: f94023e0     	ldr	x0, [sp, #0x40]
 4613ea8: f9402be8     	ldr	x8, [sp, #0x50]
 4613eac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4613eb0: 96e7d402     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613eb4: 910203f5     	add	x21, sp, #0x80
 4613eb8: 9101c2a0     	add	x0, x21, #0x70
 4613ebc: d2800001     	mov	x1, #0x0                ; =0
 4613ec0: 96e84f7e     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4613ec4: 910082a0     	add	x0, x21, #0x20
 4613ec8: 96e84f6c     	bl	0x27c78 <_ChromeMain+0x229dc>
 4613ecc: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 4613ed0: 36f800a8     	tbz	w8, #0x1f, 0x4613ee4 <_ChromeMain+0x460ec48>
 4613ed4: f94043e0     	ldr	x0, [sp, #0x80]
 4613ed8: f9404be8     	ldr	x8, [sp, #0x90]
 4613edc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4613ee0: 96e7d3f6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613ee4: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 4613ee8: 36ffe268     	tbz	w8, #0x1f, 0x4613b34 <_ChromeMain+0x460e898>
 4613eec: f94033e0     	ldr	x0, [sp, #0x60]
 4613ef0: f9403be8     	ldr	x8, [sp, #0x70]
 4613ef4: d37ff901     	lsl	x1, x8, #1
 4613ef8: 96e7d3f0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613efc: 17ffff0e     	b	0x4613b34 <_ChromeMain+0x460e898>
 4613f00: f94003ea     	ldr	x10, [sp]
 4613f04: 7100013f     	cmp	w9, #0x0
 4613f08: 910003e9     	mov	x9, sp
 4613f0c: 9a894141     	csel	x1, x10, x9, mi
 4613f10: 910083e0     	add	x0, sp, #0x20
 4613f14: aa0803e2     	mov	x2, x8
 4613f18: 970aea47     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 4613f1c: 17ffff13     	b	0x4613b68 <_ChromeMain+0x460e8cc>
 4613f20: d4200020     	brk	#0x1
 4613f24: 3100051f     	cmn	w8, #0x1
 4613f28: 54ffeea1     	b.ne	0x4613cfc <_ChromeMain+0x460ea60>
 4613f2c: d4200000     	brk	#0
 4613f30: d4400000     	hlt	#0
 4613f34: d4200020     	brk	#0x1
 4613f38: 394ba2a9     	ldrb	w9, [x21, #0x2e8]
 4613f3c: 34ffece9     	cbz	w9, 0x4613cd8 <_ChromeMain+0x460ea3c>
 4613f40: b982b6a9     	ldrsw	x9, [x21, #0x2b4]
 4613f44: 3100053f     	cmn	w9, #0x1
 4613f48: 540003a0     	b.eq	0x4613fbc <_ChromeMain+0x460ed20>
 4613f4c: f94142aa     	ldr	x10, [x21, #0x280]
 4613f50: eb09015f     	cmp	x10, x9
 4613f54: 54fffe69     	b.ls	0x4613f20 <_ChromeMain+0x460ec84>
 4613f58: f9413eaa     	ldr	x10, [x21, #0x278]
 4613f5c: f8697949     	ldr	x9, [x10, x9, lsl #3]
 4613f60: b9443129     	ldr	w9, [x9, #0x430]
 4613f64: 7100093f     	cmp	w9, #0x2
 4613f68: 54ffeb80     	b.eq	0x4613cd8 <_ChromeMain+0x460ea3c>
 4613f6c: f94136a9     	ldr	x9, [x21, #0x268]
 4613f70: b40002c9     	cbz	x9, 0x4613fc8 <_ChromeMain+0x460ed2c>
 4613f74: 39458129     	ldrb	w9, [x9, #0x160]
 4613f78: 3707eb09     	tbnz	w9, #0x0, 0x4613cd8 <_ChromeMain+0x460ea3c>
 4613f7c: 17ffff66     	b	0x4613d14 <_ChromeMain+0x460ea78>
 4613f80: 394ba2a9     	ldrb	w9, [x21, #0x2e8]
 4613f84: 34ffeaa9     	cbz	w9, 0x4613cd8 <_ChromeMain+0x460ea3c>
 4613f88: 394d2109     	ldrb	w9, [x8, #0x348]
 4613f8c: 35ffea69     	cbnz	w9, 0x4613cd8 <_ChromeMain+0x460ea3c>
 4613f90: 17ffff61     	b	0x4613d14 <_ChromeMain+0x460ea78>
 4613f94: 941c4085     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 4613f98: d4200000     	brk	#0
 4613f9c: d4400000     	hlt	#0
 4613fa0: d4200020     	brk	#0x1
 4613fa4: d4200000     	brk	#0
 4613fa8: d4400000     	hlt	#0
 4613fac: d4200020     	brk	#0x1
 4613fb0: b0048e80     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4613fb4: 91376000     	add	x0, x0, #0xdd8
 4613fb8: 9417b0c7     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
 4613fbc: d4200000     	brk	#0
 4613fc0: d4400000     	hlt	#0
 4613fc4: d4200020     	brk	#0x1
 4613fc8: d4200000     	brk	#0
 4613fcc: d4400000     	hlt	#0
 4613fd0: d4200020     	brk	#0x1
 4613fd4: f9401909     	ldr	x9, [x8, #0x30]
 4613fd8: b4ffea49     	cbz	x9, 0x4613d20 <_ChromeMain+0x460ea84>
 4613fdc: 9100a101     	add	x1, x8, #0x28
 4613fe0: 17ffff53     	b	0x4613d2c <_ChromeMain+0x460ea90>
 4613fe4: 97d15aa5     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 4613fe8: aa0003e1     	mov	x1, x0
 4613fec: 17ffff50     	b	0x4613d2c <_ChromeMain+0x460ea90>
 4613ff0: f9401909     	ldr	x9, [x8, #0x30]
 4613ff4: b4ffebc9     	cbz	x9, 0x4613d6c <_ChromeMain+0x460ead0>
 4613ff8: 9100a101     	add	x1, x8, #0x28
 4613ffc: 17ffff5f     	b	0x4613d78 <_ChromeMain+0x460eadc>
 4614000: 97d15a9e     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 4614004: aa0003e1     	mov	x1, x0
 4614008: 17ffff5c     	b	0x4613d78 <_ChromeMain+0x460eadc>
 461400c: f9400008     	ldr	x8, [x0]
 4614010: f9400508     	ldr	x8, [x8, #0x8]
 4614014: d63f0100     	blr	x8
 4614018: f9416695     	ldr	x21, [x20, #0x2c8]
 461401c: 17fffe42     	b	0x4613924 <_ChromeMain+0x460e688>
 4614020: 52803600     	mov	w0, #0x1b0              ; =432
 4614024: 96e7ecd1     	bl	0xf368 <_ChromeMain+0xa0cc>
 4614028: aa0003f5     	mov	x21, x0
 461402c: aa1403e1     	mov	x1, x20
 4614030: 972346d4     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4614034: 17fffe21     	b	0x46138b8 <_ChromeMain+0x460e61c>
 4614038: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461403c: a90157f6     	stp	x22, x21, [sp, #0x10]
 4614040: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4614044: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4614048: 9100c3fd     	add	x29, sp, #0x30
 461404c: aa0103f4     	mov	x20, x1
 4614050: aa0003f3     	mov	x19, x0
 4614054: f9445408     	ldr	x8, [x0, #0x8a8]
 4614058: f9400429     	ldr	x9, [x1, #0x8]
 461405c: f9445000     	ldr	x0, [x0, #0x8a0]
 4614060: eb09011f     	cmp	x8, x9
 4614064: 540002c1     	b.ne	0x46140bc <_ChromeMain+0x460ee20>
 4614068: d37ced09     	lsl	x9, x8, #4
 461406c: b40001e9     	cbz	x9, 0x46140a8 <_ChromeMain+0x460ee0c>
 4614070: 8b081009     	add	x9, x0, x8, lsl #4
 4614074: f940028a     	ldr	x10, [x20]
 4614078: aa0003eb     	mov	x11, x0
 461407c: f940016c     	ldr	x12, [x11]
 4614080: f940014d     	ldr	x13, [x10]
 4614084: b940096e     	ldr	w14, [x11, #0x8]
 4614088: b940094f     	ldr	w15, [x10, #0x8]
 461408c: eb0d019f     	cmp	x12, x13
 4614090: 7a4f01c0     	ccmp	w14, w15, #0x0, eq
 4614094: 54000141     	b.ne	0x46140bc <_ChromeMain+0x460ee20>
 4614098: 9100416b     	add	x11, x11, #0x10
 461409c: 9100414a     	add	x10, x10, #0x10
 46140a0: eb09017f     	cmp	x11, x9
 46140a4: 54fffec1     	b.ne	0x461407c <_ChromeMain+0x460ede0>
 46140a8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 46140ac: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 46140b0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 46140b4: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 46140b8: d65f03c0     	ret
 46140bc: b4000220     	cbz	x0, 0x4614100 <_ChromeMain+0x460ee64>
 46140c0: d37ced09     	lsl	x9, x8, #4
 46140c4: b4000109     	cbz	x9, 0x46140e4 <_ChromeMain+0x460ee48>
 46140c8: cb0813e8     	neg	x8, x8, lsl #4
 46140cc: 8b000129     	add	x9, x9, x0
 46140d0: d1004129     	sub	x9, x9, #0x10
 46140d4: b40007a9     	cbz	x9, 0x46141c8 <_ChromeMain+0x460ef2c>
 46140d8: d1004129     	sub	x9, x9, #0x10
 46140dc: 91004108     	add	x8, x8, #0x10
 46140e0: b5ffffa8     	cbnz	x8, 0x46140d4 <_ChromeMain+0x460ee38>
 46140e4: 91228275     	add	x21, x19, #0x8a0
 46140e8: f904567f     	str	xzr, [x19, #0x8a8]
 46140ec: f9445a68     	ldr	x8, [x19, #0x8b0]
 46140f0: d37ced01     	lsl	x1, x8, #4
 46140f4: 96e7d371     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46140f8: a9007ebf     	stp	xzr, xzr, [x21]
 46140fc: f9000abf     	str	xzr, [x21, #0x10]
 4614100: f9400288     	ldr	x8, [x20]
 4614104: f9045268     	str	x8, [x19, #0x8a0]
 4614108: f9400688     	ldr	x8, [x20, #0x8]
 461410c: f9045668     	str	x8, [x19, #0x8a8]
 4614110: f9400a88     	ldr	x8, [x20, #0x10]
 4614114: f9045a68     	str	x8, [x19, #0x8b0]
 4614118: a9007e9f     	stp	xzr, xzr, [x20]
 461411c: f9000a9f     	str	xzr, [x20, #0x10]
 4614120: 395bca68     	ldrb	w8, [x19, #0x6f2]
 4614124: 370000a8     	tbnz	w8, #0x0, 0x4614138 <_ChromeMain+0x460ee9c>
 4614128: 395bce68     	ldrb	w8, [x19, #0x6f3]
 461412c: 34000168     	cbz	w8, 0x4614158 <_ChromeMain+0x460eebc>
 4614130: 52800028     	mov	w8, #0x1                ; =1
 4614134: 790dea68     	strh	w8, [x19, #0x6f4]
 4614138: aa1303e0     	mov	x0, x19
 461413c: 97fffdca     	bl	0x4613864 <_ChromeMain+0x460e5c8>
 4614140: aa1303e0     	mov	x0, x19
 4614144: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4614148: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461414c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4614150: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4614154: 17fffd22     	b	0x46135dc <_ChromeMain+0x460e340>
 4614158: 911bce74     	add	x20, x19, #0x6f3
 461415c: 925e7695     	and	x21, x20, #0xfffffffc00000000
 4614160: d0052cf6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4614164: f94046c8     	ldr	x8, [x22, #0x88]
 4614168: eb0802bf     	cmp	x21, x8
 461416c: 54000060     	b.eq	0x4614178 <_ChromeMain+0x460eedc>
 4614170: 52800017     	mov	w23, #0x0               ; =0
 4614174: 14000004     	b	0x4614184 <_ChromeMain+0x460eee8>
 4614178: 911bce60     	add	x0, x19, #0x6f3
 461417c: 96e80060     	bl	0x142fc <_ChromeMain+0xf060>
 4614180: 39400297     	ldrb	w23, [x20]
 4614184: 52800008     	mov	w8, #0x0                ; =0
 4614188: 52800029     	mov	w9, #0x1                ; =1
 461418c: 391bce69     	strb	w9, [x19, #0x6f3]
 4614190: 391bd27f     	strb	wzr, [x19, #0x6f4]
 4614194: 12000101     	and	w1, w8, #0x1
 4614198: aa1303e0     	mov	x0, x19
 461419c: 94000699     	bl	0x4615c00 <_ChromeMain+0x4610964>
 46141a0: 395bd668     	ldrb	w8, [x19, #0x6f5]
 46141a4: 395bd269     	ldrb	w9, [x19, #0x6f4]
 46141a8: 3707ff49     	tbnz	w9, #0x0, 0x4614190 <_ChromeMain+0x460eef4>
 46141ac: 39000297     	strb	w23, [x20]
 46141b0: f94046c8     	ldr	x8, [x22, #0x88]
 46141b4: eb0802bf     	cmp	x21, x8
 46141b8: 54fffc01     	b.ne	0x4614138 <_ChromeMain+0x460ee9c>
 46141bc: 911bce60     	add	x0, x19, #0x6f3
 46141c0: 96e83a1f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46141c4: 17ffffdd     	b	0x4614138 <_ChromeMain+0x460ee9c>
 46141c8: d4200020     	brk	#0x1
 46141cc: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 46141d0: a90157f6     	stp	x22, x21, [sp, #0x10]
 46141d4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 46141d8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 46141dc: 9100c3fd     	add	x29, sp, #0x30
 46141e0: aa0003f3     	mov	x19, x0
 46141e4: 39630009     	ldrb	w9, [x0, #0x8c0]
 46141e8: 12001c48     	and	w8, w2, #0xff
 46141ec: 6a08013f     	tst	w9, w8
 46141f0: 54000140     	b.eq	0x4614218 <_ChromeMain+0x460ef7c>
 46141f4: 360006a2     	tbz	w2, #0x0, 0x46142c8 <_ChromeMain+0x460f02c>
 46141f8: f9445e69     	ldr	x9, [x19, #0x8b8]
 46141fc: eb01013f     	cmp	x9, x1
 4614200: 54000101     	b.ne	0x4614220 <_ChromeMain+0x460ef84>
 4614204: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4614208: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461420c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4614210: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4614214: d65f03c0     	ret
 4614218: 6b08013f     	cmp	w9, w8
 461421c: 54ffff40     	b.eq	0x4614204 <_ChromeMain+0x460ef68>
 4614220: f9045e61     	str	x1, [x19, #0x8b8]
 4614224: 39230268     	strb	w8, [x19, #0x8c0]
 4614228: 395bca68     	ldrb	w8, [x19, #0x6f2]
 461422c: 370000a8     	tbnz	w8, #0x0, 0x4614240 <_ChromeMain+0x460efa4>
 4614230: 395bce68     	ldrb	w8, [x19, #0x6f3]
 4614234: 34000128     	cbz	w8, 0x4614258 <_ChromeMain+0x460efbc>
 4614238: 52800028     	mov	w8, #0x1                ; =1
 461423c: 790dea68     	strh	w8, [x19, #0x6f4]
 4614240: aa1303e0     	mov	x0, x19
 4614244: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4614248: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461424c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4614250: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4614254: 17fffce2     	b	0x46135dc <_ChromeMain+0x460e340>
 4614258: 911bce74     	add	x20, x19, #0x6f3
 461425c: 925e7695     	and	x21, x20, #0xfffffffc00000000
 4614260: d0052cf6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4614264: f94046c8     	ldr	x8, [x22, #0x88]
 4614268: eb0802bf     	cmp	x21, x8
 461426c: 54000060     	b.eq	0x4614278 <_ChromeMain+0x460efdc>
 4614270: 52800017     	mov	w23, #0x0               ; =0
 4614274: 14000004     	b	0x4614284 <_ChromeMain+0x460efe8>
 4614278: 911bce60     	add	x0, x19, #0x6f3
 461427c: 96e80020     	bl	0x142fc <_ChromeMain+0xf060>
 4614280: 39400297     	ldrb	w23, [x20]
 4614284: 52800008     	mov	w8, #0x0                ; =0
 4614288: 52800029     	mov	w9, #0x1                ; =1
 461428c: 391bce69     	strb	w9, [x19, #0x6f3]
 4614290: 391bd27f     	strb	wzr, [x19, #0x6f4]
 4614294: 12000101     	and	w1, w8, #0x1
 4614298: aa1303e0     	mov	x0, x19
 461429c: 94000659     	bl	0x4615c00 <_ChromeMain+0x4610964>
 46142a0: 395bd668     	ldrb	w8, [x19, #0x6f5]
 46142a4: 395bd269     	ldrb	w9, [x19, #0x6f4]
 46142a8: 3707ff49     	tbnz	w9, #0x0, 0x4614290 <_ChromeMain+0x460eff4>
 46142ac: 39000297     	strb	w23, [x20]
 46142b0: f94046c8     	ldr	x8, [x22, #0x88]
 46142b4: eb0802bf     	cmp	x21, x8
 46142b8: 54fffc41     	b.ne	0x4614240 <_ChromeMain+0x460efa4>
 46142bc: 911bce60     	add	x0, x19, #0x6f3
 46142c0: 96e839df     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46142c4: 17ffffdf     	b	0x4614240 <_ChromeMain+0x460efa4>
 46142c8: d4200020     	brk	#0x1
 46142cc: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 46142d0: a9015ff8     	stp	x24, x23, [sp, #0x10]
 46142d4: a90257f6     	stp	x22, x21, [sp, #0x20]
 46142d8: a9034ff4     	stp	x20, x19, [sp, #0x30]
 46142dc: a9047bfd     	stp	x29, x30, [sp, #0x40]
 46142e0: 910103fd     	add	x29, sp, #0x40
 46142e4: 39406028     	ldrb	w8, [x1, #0x18]
 46142e8: 35000108     	cbnz	w8, 0x4614308 <_ChromeMain+0x460f06c>
 46142ec: 52800000     	mov	w0, #0x0                ; =0
 46142f0: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 46142f4: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 46142f8: a94257f6     	ldp	x22, x21, [sp, #0x20]
 46142fc: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4614300: a8c567fa     	ldp	x26, x25, [sp], #0x50
 4614304: d65f03c0     	ret
 4614308: aa0003f3     	mov	x19, x0
 461430c: f9444408     	ldr	x8, [x0, #0x888]
 4614310: 52801309     	mov	w9, #0x98               ; =152
 4614314: 9b097d09     	mul	x9, x8, x9
 4614318: b4fffea9     	cbz	x9, 0x46142ec <_ChromeMain+0x460f050>
 461431c: aa0303f4     	mov	x20, x3
 4614320: aa0203f5     	mov	x21, x2
 4614324: aa0103f6     	mov	x22, x1
 4614328: 928012e9     	mov	x9, #-0x98              ; =-152
 461432c: f9444277     	ldr	x23, [x19, #0x880]
 4614330: cb170138     	sub	x24, x9, x23
 4614334: 5280131a     	mov	w26, #0x98              ; =152
 4614338: aa1703f9     	mov	x25, x23
 461433c: aa1703e9     	mov	x9, x23
 4614340: 14000014     	b	0x4614390 <_ChromeMain+0x460f0f4>
 4614344: f9444274     	ldr	x20, [x19, #0x880]
 4614348: cb1402e8     	sub	x8, x23, x20
 461434c: 9343fd08     	asr	x8, x8, #3
 4614350: d2994369     	mov	x9, #0xca1b             ; =51739
 4614354: f2a50d69     	movk	x9, #0x286b, lsl #16
 4614358: f2d435e9     	movk	x9, #0xa1af, lsl #32
 461435c: f2f0d789     	movk	x9, #0x86bc, lsl #48
 4614360: 9b097d08     	mul	x8, x8, x9
 4614364: f9044668     	str	x8, [x19, #0x888]
 4614368: 52800020     	mov	w0, #0x1                ; =1
 461436c: 17ffffe1     	b	0x46142f0 <_ChromeMain+0x460f054>
 4614370: f9444269     	ldr	x9, [x19, #0x880]
 4614374: f9444668     	ldr	x8, [x19, #0x888]
 4614378: 910262f7     	add	x23, x23, #0x98
 461437c: 9b1a250a     	madd	x10, x8, x26, x9
 4614380: d1026318     	sub	x24, x24, #0x98
 4614384: 91026339     	add	x25, x25, #0x98
 4614388: eb0a02ff     	cmp	x23, x10
 461438c: 54fffb00     	b.eq	0x46142ec <_ChromeMain+0x460f050>
 4614390: 394082ea     	ldrb	w10, [x23, #0x20]
 4614394: 34ffff2a     	cbz	w10, 0x4614378 <_ChromeMain+0x460f0dc>
 4614398: 910022e0     	add	x0, x23, #0x8
 461439c: aa1603e1     	mov	x1, x22
 46143a0: 9750b99f     	bl	0x1a42a1c <_ChromeMain+0x1a3d780>
 46143a4: 3607fe60     	tbz	w0, #0x0, 0x4614370 <_ChromeMain+0x460f0d4>
 46143a8: b4000075     	cbz	x21, 0x46143b4 <_ChromeMain+0x460f118>
 46143ac: f94002e8     	ldr	x8, [x23]
 46143b0: f90002a8     	str	x8, [x21]
 46143b4: b4000194     	cbz	x20, 0x46143e4 <_ChromeMain+0x460f148>
 46143b8: 910202e8     	add	x8, x23, #0x80
 46143bc: eb14011f     	cmp	x8, x20
 46143c0: 54000120     	b.eq	0x46143e4 <_ChromeMain+0x460f148>
 46143c4: 39c05e8a     	ldrsb	w10, [x20, #0x17]
 46143c8: 39425ee9     	ldrb	w9, [x23, #0x97]
 46143cc: 37f80a6a     	tbnz	w10, #0x1f, 0x4614518 <_ChromeMain+0x460f27c>
 46143d0: 37380629     	tbnz	w9, #0x7, 0x4614494 <_ChromeMain+0x460f1f8>
 46143d4: 3dc00100     	ldr	q0, [x8]
 46143d8: f9400908     	ldr	x8, [x8, #0x10]
 46143dc: f9000a88     	str	x8, [x20, #0x10]
 46143e0: 3d800280     	str	q0, [x20]
 46143e4: f9444274     	ldr	x20, [x19, #0x880]
 46143e8: f9444668     	ldr	x8, [x19, #0x888]
 46143ec: 52801309     	mov	w9, #0x98               ; =152
 46143f0: 9b097d09     	mul	x9, x8, x9
 46143f4: 8b09028a     	add	x10, x20, x9
 46143f8: eb0a02ff     	cmp	x23, x10
 46143fc: 540008c0     	b.eq	0x4614514 <_ChromeMain+0x460f278>
 4614400: cb1402ea     	sub	x10, x23, x20
 4614404: 9102614a     	add	x10, x10, #0x98
 4614408: eb09015f     	cmp	x10, x9
 461440c: 54000340     	b.eq	0x4614474 <_ChromeMain+0x460f1d8>
 4614410: cb1403f6     	neg	x22, x20
 4614414: 8b180137     	add	x23, x9, x24
 4614418: 8b190295     	add	x21, x20, x25
 461441c: 8b1602b8     	add	x24, x21, x22
 4614420: f9404f08     	ldr	x8, [x24, #0x98]
 4614424: f9000308     	str	x8, [x24]
 4614428: 91002300     	add	x0, x24, #0x8
 461442c: 91028301     	add	x1, x24, #0xa0
 4614430: 96ff95ac     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 4614434: 39c25f08     	ldrsb	w8, [x24, #0x97]
 4614438: 37f80368     	tbnz	w8, #0x1f, 0x46144a4 <_ChromeMain+0x460f208>
 461443c: 91046308     	add	x8, x24, #0x118
 4614440: 3dc00100     	ldr	q0, [x8]
 4614444: 3c880300     	stur	q0, [x24, #0x80]
 4614448: f9400909     	ldr	x9, [x8, #0x10]
 461444c: f8090309     	stur	x9, [x24, #0x90]
 4614450: 3904bf1f     	strb	wzr, [x24, #0x12f]
 4614454: 3900011f     	strb	wzr, [x8]
 4614458: d10262f7     	sub	x23, x23, #0x98
 461445c: 910262b5     	add	x21, x21, #0x98
 4614460: eb1702df     	cmp	x22, x23
 4614464: 54fffdc1     	b.ne	0x461441c <_ChromeMain+0x460f180>
 4614468: cb1402b7     	sub	x23, x21, x20
 461446c: f9444274     	ldr	x20, [x19, #0x880]
 4614470: f9444668     	ldr	x8, [x19, #0x888]
 4614474: 52801309     	mov	w9, #0x98               ; =152
 4614478: 9b095109     	madd	x9, x8, x9, x20
 461447c: eb0902ff     	cmp	x23, x9
 4614480: 54fff640     	b.eq	0x4614348 <_ChromeMain+0x460f0ac>
 4614484: 52801309     	mov	w9, #0x98               ; =152
 4614488: 9b095108     	madd	x8, x8, x9, x20
 461448c: d1008114     	sub	x20, x8, #0x20
 4614490: 1400001c     	b	0x4614500 <_ChromeMain+0x460f264>
 4614494: a9480ae1     	ldp	x1, x2, [x23, #0x80]
 4614498: aa1403e0     	mov	x0, x20
 461449c: 96fa5186     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46144a0: 17ffffd1     	b	0x46143e4 <_ChromeMain+0x460f148>
 46144a4: f8480300     	ldur	x0, [x24, #0x80]
 46144a8: f9404b08     	ldr	x8, [x24, #0x90]
 46144ac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46144b0: 96e7d282     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46144b4: 17ffffe2     	b	0x461443c <_ChromeMain+0x460f1a0>
 46144b8: f9400680     	ldr	x0, [x20, #0x8]
 46144bc: f9400e88     	ldr	x8, [x20, #0x18]
 46144c0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46144c4: 96e7d27d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46144c8: aa1403e0     	mov	x0, x20
 46144cc: d2800001     	mov	x1, #0x0                ; =0
 46144d0: 96e84dfa     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46144d4: d1014280     	sub	x0, x20, #0x50
 46144d8: 96e84de8     	bl	0x27c78 <_ChromeMain+0x229dc>
 46144dc: 38da7288     	ldursb	w8, [x20, #-0x59]
 46144e0: 36f800a8     	tbz	w8, #0x1f, 0x46144f4 <_ChromeMain+0x460f258>
 46144e4: f8590280     	ldur	x0, [x20, #-0x70]
 46144e8: f85a0288     	ldur	x8, [x20, #-0x60]
 46144ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46144f0: 96e7d272     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46144f4: d1026294     	sub	x20, x20, #0x98
 46144f8: eb1702bf     	cmp	x21, x23
 46144fc: 54fff240     	b.eq	0x4614344 <_ChromeMain+0x460f0a8>
 4614500: f101e295     	subs	x21, x20, #0x78
 4614504: 54000080     	b.eq	0x4614514 <_ChromeMain+0x460f278>
 4614508: 39c07e88     	ldrsb	w8, [x20, #0x1f]
 461450c: 36fffde8     	tbz	w8, #0x1f, 0x46144c8 <_ChromeMain+0x460f22c>
 4614510: 17ffffea     	b	0x46144b8 <_ChromeMain+0x460f21c>
 4614514: d4200020     	brk	#0x1
 4614518: 13001d2a     	sxtb	w10, w9
 461451c: 7100015f     	cmp	w10, #0x0
 4614520: a9482eea     	ldp	x10, x11, [x23, #0x80]
 4614524: 9a884141     	csel	x1, x10, x8, mi
 4614528: 9a894162     	csel	x2, x11, x9, mi
 461452c: aa1403e0     	mov	x0, x20
 4614530: 96fa51b4     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4614534: 17ffffac     	b	0x46143e4 <_ChromeMain+0x460f148>
