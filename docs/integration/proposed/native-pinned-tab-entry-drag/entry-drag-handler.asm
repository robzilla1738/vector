
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460aec0: 6db82beb     	stp	d11, d10, [sp, #-0x80]!
 460aec4: 6d0123e9     	stp	d9, d8, [sp, #0x10]
 460aec8: a9026ffc     	stp	x28, x27, [sp, #0x20]
 460aecc: a90367fa     	stp	x26, x25, [sp, #0x30]
 460aed0: a9045ff8     	stp	x24, x23, [sp, #0x40]
 460aed4: a90557f6     	stp	x22, x21, [sp, #0x50]
 460aed8: a9064ff4     	stp	x20, x19, [sp, #0x60]
 460aedc: a9077bfd     	stp	x29, x30, [sp, #0x70]
 460aee0: 9101c3fd     	add	x29, sp, #0x70
 460aee4: d10ec3ff     	sub	sp, sp, #0x3b0
 460aee8: 394fe408     	ldrb	w8, [x0, #0x3f9]
 460aeec: 340000a8     	cbz	w8, 0x460af00 <_ChromeMain+0x4605c64>
 460aef0: b9405028     	ldr	w8, [x1, #0x50]
 460aef4: 12151108     	and	w8, w8, #0xf800
 460aef8: 7120011f     	cmp	w8, #0x800
 460aefc: 54000180     	b.eq	0x460af2c <_ChromeMain+0x4605c90>
 460af00: 52800000     	mov	w0, #0x0                ; =0
 460af04: 910ec3ff     	add	sp, sp, #0x3b0
 460af08: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 460af0c: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 460af10: a94557f6     	ldp	x22, x21, [sp, #0x50]
 460af14: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 460af18: a94367fa     	ldp	x26, x25, [sp, #0x30]
 460af1c: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 460af20: 6d4123e9     	ldp	d9, d8, [sp, #0x10]
 460af24: 6cc82beb     	ldp	d11, d10, [sp], #0x80
 460af28: d65f03c0     	ret
 460af2c: aa0003f4     	mov	x20, x0
 460af30: 2d510420     	ldp	s0, s1, [x1, #0x88]
 460af34: 1e254000     	frintm	s0, s0
 460af38: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 460af3c: 1e222000     	fcmp	s0, s2
 460af40: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 460af44: 1a88b3e9     	csel	w9, wzr, w8, lt
 460af48: 1e226803     	fmaxnm	s3, s0, s2
 460af4c: 1e38006a     	fcvtzs	w10, s3
 460af50: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 460af54: 1e270163     	fmov	s3, w11
 460af58: 1e232000     	fcmp	s0, s3
 460af5c: 1a899149     	csel	w9, w10, w9, ls
 460af60: 1e254020     	frintm	s0, s1
 460af64: 1e222000     	fcmp	s0, s2
 460af68: 1e226801     	fmaxnm	s1, s0, s2
 460af6c: 1e38002a     	fcvtzs	w10, s1
 460af70: 1a88b3e8     	csel	w8, wzr, w8, lt
 460af74: 1e232000     	fcmp	s0, s3
 460af78: 1a889148     	csel	w8, w10, w8, ls
 460af7c: aa088128     	orr	x8, x9, x8, lsl #32
 460af80: f90027e8     	str	x8, [sp, #0x48]
 460af84: f941e801     	ldr	x1, [x0, #0x3d0]
 460af88: 910123e2     	add	x2, sp, #0x48
 460af8c: 95833eb1     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 460af90: 394fea88     	ldrb	w8, [x20, #0x3fa]
 460af94: 37000348     	tbnz	w8, #0x0, 0x460affc <_ChromeMain+0x4605d60>
 460af98: fd4027e0     	ldr	d0, [sp, #0x48]
 460af9c: fd41f681     	ldr	d1, [x20, #0x3e8]
 460afa0: 0ea12c00     	sqsub.2s	v0, v0, v1
 460afa4: 0ea0b800     	abs.2s	v0, v0
 460afa8: 0f000501     	movi.2s	v1, #0x8
 460afac: 0ea13400     	cmgt.2s	v0, v0, v1
 460afb0: 9e660008     	fmov	x8, d0
 460afb4: b4fffa68     	cbz	x8, 0x460af00 <_ChromeMain+0x4605c64>
 460afb8: f941ea93     	ldr	x19, [x20, #0x3d0]
 460afbc: f940ce68     	ldr	x8, [x19, #0x198]
 460afc0: d37df108     	lsl	x8, x8, #3
 460afc4: b40001c8     	cbz	x8, 0x460affc <_ChromeMain+0x4605d60>
 460afc8: d2800009     	mov	x9, #0x0                ; =0
 460afcc: f940ca6a     	ldr	x10, [x19, #0x190]
 460afd0: f869694b     	ldr	x11, [x10, x9]
 460afd4: eb14017f     	cmp	x11, x20
 460afd8: 540000a0     	b.eq	0x460afec <_ChromeMain+0x4605d50>
 460afdc: 91002129     	add	x9, x9, #0x8
 460afe0: eb09011f     	cmp	x8, x9
 460afe4: 54ffff61     	b.ne	0x460afd0 <_ChromeMain+0x4605d34>
 460afe8: 14000005     	b	0x460affc <_ChromeMain+0x4605d60>
 460afec: 9343fd35     	asr	x21, x9, #3
 460aff0: f941b668     	ldr	x8, [x19, #0x368]
 460aff4: eb0802bf     	cmp	x21, x8
 460aff8: 54000383     	b.lo	0x460b068 <_ChromeMain+0x4605dcc>
 460affc: 52800020     	mov	w0, #0x1                ; =1
 460b000: 390fea80     	strb	w0, [x20, #0x3fa]
 460b004: b4fff814     	cbz	x20, 0x460af04 <_ChromeMain+0x4605c68>
 460b008: f941ea93     	ldr	x19, [x20, #0x3d0]
 460b00c: 39544268     	ldrb	w8, [x19, #0x510]
 460b010: 34fff7a8     	cbz	w8, 0x460af04 <_ChromeMain+0x4605c68>
 460b014: f940ce68     	ldr	x8, [x19, #0x198]
 460b018: d37df108     	lsl	x8, x8, #3
 460b01c: b40001e8     	cbz	x8, 0x460b058 <_ChromeMain+0x4605dbc>
 460b020: d2800017     	mov	x23, #0x0               ; =0
 460b024: 910483f8     	add	x24, sp, #0x120
 460b028: f940ca69     	ldr	x9, [x19, #0x190]
 460b02c: f877692a     	ldr	x10, [x9, x23]
 460b030: eb14015f     	cmp	x10, x20
 460b034: 540000a0     	b.eq	0x460b048 <_ChromeMain+0x4605dac>
 460b038: 910022f7     	add	x23, x23, #0x8
 460b03c: eb17011f     	cmp	x8, x23
 460b040: 54ffff61     	b.ne	0x460b02c <_ChromeMain+0x4605d90>
 460b044: 14000005     	b	0x460b058 <_ChromeMain+0x4605dbc>
 460b048: 9343fefa     	asr	x26, x23, #3
 460b04c: f941b668     	ldr	x8, [x19, #0x368]
 460b050: eb08035f     	cmp	x26, x8
 460b054: 54000823     	b.lo	0x460b158 <_ChromeMain+0x4605ebc>
 460b058: aa1303e0     	mov	x0, x19
 460b05c: 97fff8da     	bl	0x46093c4 <_ChromeMain+0x4604128>
 460b060: 52800020     	mov	w0, #0x1                ; =1
 460b064: 17ffffa8     	b	0x460af04 <_ChromeMain+0x4605c68>
 460b068: aa1303e0     	mov	x0, x19
 460b06c: 95fffceb     	bl	0xc60a418 <_ChromeMain+0xc60517c>
 460b070: f9028675     	str	x21, [x19, #0x508]
 460b074: 52800028     	mov	w8, #0x1                ; =1
 460b078: 39144268     	strb	w8, [x19, #0x510]
 460b07c: 3914627f     	strb	wzr, [x19, #0x518]
 460b080: f941aa60     	ldr	x0, [x19, #0x350]
 460b084: b4000080     	cbz	x0, 0x460b094 <_ChromeMain+0x4605df8>
 460b088: d2800001     	mov	x1, #0x0                ; =0
 460b08c: 528000c2     	mov	w2, #0x6                ; =6
 460b090: 978564cc     	bl	0x27643c0 <_ChromeMain+0x275f124>
 460b094: f940ce68     	ldr	x8, [x19, #0x198]
 460b098: d37df109     	lsl	x9, x8, #3
 460b09c: b4fffb09     	cbz	x9, 0x460affc <_ChromeMain+0x4605d60>
 460b0a0: f940ca76     	ldr	x22, [x19, #0x190]
 460b0a4: 8b080ed7     	add	x23, x22, x8, lsl #3
 460b0a8: 1400000d     	b	0x460b0dc <_ChromeMain+0x4605e40>
 460b0ac: aa1503e0     	mov	x0, x21
 460b0b0: 97f79894     	bl	0x43f1300 <_ChromeMain+0x43ec064>
 460b0b4: f9400400     	ldr	x0, [x0, #0x8]
 460b0b8: f9400008     	ldr	x8, [x0]
 460b0bc: f940a108     	ldr	x8, [x8, #0x140]
 460b0c0: d63f0100     	blr	x8
 460b0c4: 9103e260     	add	x0, x19, #0xf8
 460b0c8: 91046261     	add	x1, x19, #0x118
 460b0cc: 972473c1     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 460b0d0: 910022d6     	add	x22, x22, #0x8
 460b0d4: eb1702df     	cmp	x22, x23
 460b0d8: 54fff920     	b.eq	0x460affc <_ChromeMain+0x4605d60>
 460b0dc: f94002d3     	ldr	x19, [x22]
 460b0e0: b4ffff93     	cbz	x19, 0x460b0d0 <_ChromeMain+0x4605e34>
 460b0e4: f9400268     	ldr	x8, [x19]
 460b0e8: f9402d08     	ldr	x8, [x8, #0x58]
 460b0ec: aa1303e0     	mov	x0, x19
 460b0f0: d63f0100     	blr	x8
 460b0f4: aa0003f5     	mov	x21, x0
 460b0f8: 97ffe702     	bl	0x4604d00 <_ChromeMain+0x45ffa64>
 460b0fc: f10002bf     	cmp	x21, #0x0
 460b100: 1a9f07e8     	cset	w8, ne
 460b104: eb0002bf     	cmp	x21, x0
 460b108: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 460b10c: 540000c0     	b.eq	0x460b124 <_ChromeMain+0x4605e88>
 460b110: f94026b5     	ldr	x21, [x21, #0x48]
 460b114: f10002bf     	cmp	x21, #0x0
 460b118: 1a9f07e8     	cset	w8, ne
 460b11c: fa4012a4     	ccmp	x21, x0, #0x4, ne
 460b120: 54ffff81     	b.ne	0x460b110 <_ChromeMain+0x4605e74>
 460b124: 34fffd68     	cbz	w8, 0x460b0d0 <_ChromeMain+0x4605e34>
 460b128: f9400268     	ldr	x8, [x19]
 460b12c: f9403508     	ldr	x8, [x8, #0x68]
 460b130: aa1303e0     	mov	x0, x19
 460b134: d63f0100     	blr	x8
 460b138: b4fffc60     	cbz	x0, 0x460b0c4 <_ChromeMain+0x4605e28>
 460b13c: aa0003f5     	mov	x21, x0
 460b140: 3948a008     	ldrb	w8, [x0, #0x228]
 460b144: 3707fc08     	tbnz	w8, #0x0, 0x460b0c4 <_ChromeMain+0x4605e28>
 460b148: aa1503e0     	mov	x0, x21
 460b14c: 97f7986d     	bl	0x43f1300 <_ChromeMain+0x43ec064>
 460b150: b4fffba0     	cbz	x0, 0x460b0c4 <_ChromeMain+0x4605e28>
 460b154: 17ffffd6     	b	0x460b0ac <_ChromeMain+0x4605e10>
 460b158: f902867a     	str	x26, [x19, #0x508]
 460b15c: 52800028     	mov	w8, #0x1                ; =1
 460b160: 39144268     	strb	w8, [x19, #0x510]
 460b164: f94027e8     	ldr	x8, [sp, #0x48]
 460b168: 4e080d00     	dup.2d	v0, x8
 460b16c: f004c969     	adrp	x9, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 460b170: 3dc01121     	ldr	q1, [x9, #0x40]
 460b174: 3d800fe1     	str	q1, [sp, #0x30]
 460b178: 6ee14400     	ushl.2d	v0, v0, v1
 460b17c: 0ea12800     	xtn.2s	v0, v0
 460b180: fd41fa81     	ldr	d1, [x20, #0x3f0]
 460b184: 0ea12c00     	sqsub.2s	v0, v0, v1
 460b188: fd40e281     	ldr	d1, [x20, #0x1c0]
 460b18c: 0ea10c01     	sqadd.2s	v1, v0, v1
 460b190: 0ea02c22     	sqsub.2s	v2, v1, v0
 460b194: 6f00e401     	movi.2d	v1, #0000000000000000
 460b198: 0ea16442     	smax.2s	v2, v2, v1
 460b19c: 6d070be0     	stp	d0, d2, [sp, #0x70]
 460b1a0: f9423e69     	ldr	x9, [x19, #0x478]
 460b1a4: b5000369     	cbnz	x9, 0x460b210 <_ChromeMain+0x4605f74>
 460b1a8: ad000701     	stp	q1, q1, [x24]
 460b1ac: f900d3ff     	str	xzr, [sp, #0x1a0]
 460b1b0: ad030701     	stp	q1, q1, [x24, #0x60]
 460b1b4: ad020701     	stp	q1, q1, [x24, #0x40]
 460b1b8: ad010701     	stp	q1, q1, [x24, #0x20]
 460b1bc: fd40de81     	ldr	d1, [x20, #0x1b8]
 460b1c0: 0ea12c00     	sqsub.2s	v0, v0, v1
 460b1c4: 0f03f601     	fmov.2s	v1, #1.00000000
 460b1c8: 0e21d800     	scvtf.2s	v0, v0
 460b1cc: 6d1283e1     	stp	d1, d0, [sp, #0x128]
 460b1d0: 910223e8     	add	x8, sp, #0x88
 460b1d4: aa1403e0     	mov	x0, x20
 460b1d8: 97f79252     	bl	0x43efb20 <_ChromeMain+0x43ea884>
 460b1dc: 910223e0     	add	x0, sp, #0x88
 460b1e0: 910483e1     	add	x1, sp, #0x120
 460b1e4: 971b9c9f     	bl	0xcf2460 <_ChromeMain+0xced1c4>
 460b1e8: 37000080     	tbnz	w0, #0x0, 0x460b1f8 <_ChromeMain+0x4605f5c>
 460b1ec: 910483e1     	add	x1, sp, #0x120
 460b1f0: aa1403e0     	mov	x0, x20
 460b1f4: 95833bc2     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
 460b1f8: f940c680     	ldr	x0, [x20, #0x188]
 460b1fc: b4000040     	cbz	x0, 0x460b204 <_ChromeMain+0x4605f68>
 460b200: 96fe57df     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460b204: aa1403e0     	mov	x0, x20
 460b208: 96fe57dd     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460b20c: f94027e8     	ldr	x8, [sp, #0x48]
 460b210: f90037e8     	str	x8, [sp, #0x68]
 460b214: 9101a3e1     	add	x1, sp, #0x68
 460b218: aa1303e0     	mov	x0, x19
 460b21c: 977461e6     	bl	0x23239b4 <_ChromeMain+0x231e718>
 460b220: 3dc01fe0     	ldr	q0, [sp, #0x70]
 460b224: 3d8017e0     	str	q0, [sp, #0x50]
 460b228: 910143e1     	add	x1, sp, #0x50
 460b22c: aa1303e0     	mov	x0, x19
 460b230: 95833e76     	bl	0xa6dac08 <_ChromeMain+0xa6d596c>
 460b234: f9429a68     	ldr	x8, [x19, #0x530]
 460b238: b4000788     	cbz	x8, 0x460b328 <_ChromeMain+0x460608c>
 460b23c: f941b668     	ldr	x8, [x19, #0x368]
 460b240: eb08035f     	cmp	x26, x8
 460b244: 54000722     	b.hs	0x460b328 <_ChromeMain+0x460608c>
 460b248: f941b268     	ldr	x8, [x19, #0x360]
 460b24c: 52804d09     	mov	w9, #0x268              ; =616
 460b250: 9b092355     	madd	x21, x26, x9, x8
 460b254: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 460b258: b81783bf     	stur	wzr, [x29, #-0x88]
 460b25c: 910223e8     	add	x8, sp, #0x88
 460b260: aa1503e0     	mov	x0, x21
 460b264: 97fff901     	bl	0x4609668 <_ChromeMain+0x46043cc>
 460b268: f941ee88     	ldr	x8, [x20, #0x3d8]
 460b26c: b4007808     	cbz	x8, 0x460c16c <_ChromeMain+0x4606ed0>
 460b270: 390483ff     	strb	wzr, [sp, #0x120]
 460b274: 52801fe9     	mov	w9, #0xff               ; =255
 460b278: 390503e9     	strb	w9, [sp, #0x140]
 460b27c: 910483e0     	add	x0, sp, #0x120
 460b280: 910d2101     	add	x1, x8, #0x348
 460b284: 9702cec2     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 460b288: aa1503f9     	mov	x25, x21
 460b28c: f8498f28     	ldr	x8, [x25, #0x98]!
 460b290: f9008be8     	str	x8, [sp, #0x110]
 460b294: f9429a76     	ldr	x22, [x19, #0x530]
 460b298: b4008d36     	cbz	x22, 0x460c43c <_ChromeMain+0x46071a0>
 460b29c: 52800028     	mov	w8, #0x1                ; =1
 460b2a0: b82802c8     	ldadd	w8, w8, [x22]
 460b2a4: 7100011f     	cmp	w8, #0x0
 460b2a8: 54008d0d     	b.le	0x460c448 <_ChromeMain+0x46071ac>
 460b2ac: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460b2b0: 6b09011f     	cmp	w8, w9
 460b2b4: 54008d00     	b.eq	0x460c454 <_ChromeMain+0x46071b8>
 460b2b8: f9429a68     	ldr	x8, [x19, #0x530]
 460b2bc: f9400509     	ldr	x9, [x8, #0x8]
 460b2c0: d10263a8     	sub	x8, x29, #0x98
 460b2c4: 910223e2     	add	x2, sp, #0x88
 460b2c8: 910483e3     	add	x3, sp, #0x120
 460b2cc: 910443e4     	add	x4, sp, #0x110
 460b2d0: 910143e5     	add	x5, sp, #0x50
 460b2d4: 9101a3e6     	add	x6, sp, #0x68
 460b2d8: aa1603e0     	mov	x0, x22
 460b2dc: aa1503e1     	mov	x1, x21
 460b2e0: d63f0120     	blr	x9
 460b2e4: 12800008     	mov	w8, #-0x1               ; =-1
 460b2e8: b8e802c8     	ldaddal	w8, w8, [x22]
 460b2ec: 7100051f     	cmp	w8, #0x1
 460b2f0: 54000081     	b.ne	0x460b300 <_ChromeMain+0x4606064>
 460b2f4: f9400ac8     	ldr	x8, [x22, #0x10]
 460b2f8: aa1603e0     	mov	x0, x22
 460b2fc: d63f0100     	blr	x8
 460b300: 910483e0     	add	x0, sp, #0x120
 460b304: 9708ed4f     	bl	0x846840 <_ChromeMain+0x8415a4>
 460b308: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 460b30c: 36f800a8     	tbz	w8, #0x1f, 0x460b320 <_ChromeMain+0x4606084>
 460b310: f94047e0     	ldr	x0, [sp, #0x88]
 460b314: f9404fe8     	ldr	x8, [sp, #0x98]
 460b318: d37ff901     	lsl	x1, x8, #1
 460b31c: 96e7f6e7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460b320: 385783a8     	ldurb	w8, [x29, #-0x88]
 460b324: 37006888     	tbnz	w8, #0x0, 0x460c034 <_ChromeMain+0x4606d98>
 460b328: 39578279     	ldrb	w25, [x19, #0x5e0]
 460b32c: 340001b9     	cbz	w25, 0x460b360 <_ChromeMain+0x46060c4>
 460b330: 91176260     	add	x0, x19, #0x5d8
 460b334: d2800001     	mov	x1, #0x0                ; =0
 460b338: 96e87260     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460b33c: 91162260     	add	x0, x19, #0x588
 460b340: 96e8724e     	bl	0x27c78 <_ChromeMain+0x229dc>
 460b344: 39d5fe68     	ldrsb	w8, [x19, #0x57f]
 460b348: 36f800a8     	tbz	w8, #0x1f, 0x460b35c <_ChromeMain+0x46060c0>
 460b34c: f942b660     	ldr	x0, [x19, #0x568]
 460b350: f942be68     	ldr	x8, [x19, #0x578]
 460b354: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460b358: 96e7f6d8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460b35c: 3917827f     	strb	wzr, [x19, #0x5e0]
 460b360: 39d7fe68     	ldrsb	w8, [x19, #0x5ff]
 460b364: 37f80b08     	tbnz	w8, #0x1f, 0x460b4c4 <_ChromeMain+0x4606228>
 460b368: 790bd27f     	strh	wzr, [x19, #0x5e8]
 460b36c: 3917fe7f     	strb	wzr, [x19, #0x5ff]
 460b370: 39581268     	ldrb	w8, [x19, #0x604]
 460b374: 34000048     	cbz	w8, 0x460b37c <_ChromeMain+0x46060e0>
 460b378: 3918127f     	strb	wzr, [x19, #0x604]
 460b37c: 9101c3e2     	add	x2, sp, #0x70
 460b380: aa1303e0     	mov	x0, x19
 460b384: aa1403e1     	mov	x1, x20
 460b388: 97fff6fa     	bl	0x4608f70 <_ChromeMain+0x4603cd4>
 460b38c: 394fee88     	ldrb	w8, [x20, #0x3fb]
 460b390: 6b00011f     	cmp	w8, w0
 460b394: 540001c0     	b.eq	0x460b3cc <_ChromeMain+0x4606130>
 460b398: 390fee80     	strb	w0, [x20, #0x3fb]
 460b39c: f9401295     	ldr	x21, [x20, #0x20]
 460b3a0: b4000115     	cbz	x21, 0x460b3c0 <_ChromeMain+0x4606124>
 460b3a4: 7100001f     	cmp	w0, #0x0
 460b3a8: 1e2e1000     	fmov	s0, #1.00000000
 460b3ac: 6f00e401     	movi.2d	v1, #0000000000000000
 460b3b0: 1e201c20     	fcsel	s0, s1, s0, ne
 460b3b4: f940b2a0     	ldr	x0, [x21, #0x160]
 460b3b8: b4007360     	cbz	x0, 0x460c224 <_ChromeMain+0x4606f88>
 460b3bc: 9753a5df     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 460b3c0: f940c680     	ldr	x0, [x20, #0x188]
 460b3c4: b4000040     	cbz	x0, 0x460b3cc <_ChromeMain+0x4606130>
 460b3c8: 96fe576d     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460b3cc: 34000259     	cbz	w25, 0x460b414 <_ChromeMain+0x4606178>
 460b3d0: f942a274     	ldr	x20, [x19, #0x540]
 460b3d4: b4000214     	cbz	x20, 0x460b414 <_ChromeMain+0x4606178>
 460b3d8: 52800028     	mov	w8, #0x1                ; =1
 460b3dc: b8280288     	ldadd	w8, w8, [x20]
 460b3e0: 7100011f     	cmp	w8, #0x0
 460b3e4: 540083ed     	b.le	0x460c460 <_ChromeMain+0x46071c4>
 460b3e8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460b3ec: 6b09011f     	cmp	w8, w9
 460b3f0: 540083e0     	b.eq	0x460c46c <_ChromeMain+0x46071d0>
 460b3f4: f942a268     	ldr	x8, [x19, #0x540]
 460b3f8: f9400508     	ldr	x8, [x8, #0x8]
 460b3fc: aa1403e0     	mov	x0, x20
 460b400: d63f0100     	blr	x8
 460b404: 12800008     	mov	w8, #-0x1               ; =-1
 460b408: b8e80288     	ldaddal	w8, w8, [x20]
 460b40c: 7100051f     	cmp	w8, #0x1
 460b410: 540072e0     	b.eq	0x460c26c <_ChromeMain+0x4606fd0>
 460b414: f941b668     	ldr	x8, [x19, #0x368]
 460b418: b4ffe248     	cbz	x8, 0x460b060 <_ChromeMain+0x4605dc4>
 460b41c: f940ce68     	ldr	x8, [x19, #0x198]
 460b420: b4ffe208     	cbz	x8, 0x460b060 <_ChromeMain+0x4605dc4>
 460b424: d2800015     	mov	x21, #0x0               ; =0
 460b428: d2800014     	mov	x20, #0x0               ; =0
 460b42c: 6d4703e8     	ldp	d8, d0, [sp, #0x70]
 460b430: 2f211400     	usra.2s	v0, v0, #0x1f
 460b434: 0f3f1408     	ssra.2s	v8, v0, #0x1
 460b438: 12b00016     	mov	w22, #0x7fffffff        ; =2147483647
 460b43c: aa1303e0     	mov	x0, x19
 460b440: aa1503e1     	mov	x1, x21
 460b444: 97fff37b     	bl	0x4608230 <_ChromeMain+0x4602f94>
 460b448: 4e080c00     	dup.2d	v0, x0
 460b44c: 3dc00fe2     	ldr	q2, [sp, #0x30]
 460b450: 6ee24400     	ushl.2d	v0, v0, v2
 460b454: 0ea12800     	xtn.2s	v0, v0
 460b458: 4e080c21     	dup.2d	v1, x1
 460b45c: 6ee24421     	ushl.2d	v1, v1, v2
 460b460: 0ea12821     	xtn.2s	v1, v1
 460b464: 2f211421     	usra.2s	v1, v1, #0x1f
 460b468: 0f3f0421     	sshr.2s	v1, v1, #0x1
 460b46c: 2ea08500     	sub.2s	v0, v8, v0
 460b470: 2ea18400     	sub.2s	v0, v0, v1
 460b474: 0ea0b800     	abs.2s	v0, v0
 460b478: 0ea0bc00     	addp.2s	v0, v0, v0
 460b47c: 1e260008     	fmov	w8, s0
 460b480: 6b16011f     	cmp	w8, w22
 460b484: 1a96b116     	csel	w22, w8, w22, lt
 460b488: 9a94b2b4     	csel	x20, x21, x20, lt
 460b48c: 910006b5     	add	x21, x21, #0x1
 460b490: f940ce68     	ldr	x8, [x19, #0x198]
 460b494: eb0802bf     	cmp	x21, x8
 460b498: 54fffd23     	b.lo	0x460b43c <_ChromeMain+0x46061a0>
 460b49c: eb1a029f     	cmp	x20, x26
 460b4a0: 54ffde00     	b.eq	0x460b060 <_ChromeMain+0x4605dc4>
 460b4a4: f941b669     	ldr	x9, [x19, #0x368]
 460b4a8: eb09035f     	cmp	x26, x9
 460b4ac: 54ffdda2     	b.hs	0x460b060 <_ChromeMain+0x4605dc4>
 460b4b0: eb09029f     	cmp	x20, x9
 460b4b4: fa483342     	ccmp	x26, x8, #0x2, lo
 460b4b8: fa483282     	ccmp	x20, x8, #0x2, lo
 460b4bc: 54ffdd22     	b.hs	0x460b060 <_ChromeMain+0x4605dc4>
 460b4c0: 14000065     	b	0x460b654 <_ChromeMain+0x46063b8>
 460b4c4: f942f668     	ldr	x8, [x19, #0x5e8]
 460b4c8: 7900011f     	strh	wzr, [x8]
 460b4cc: f902fa7f     	str	xzr, [x19, #0x5f0]
 460b4d0: 17ffffa8     	b	0x460b370 <_ChromeMain+0x46060d4>
 460b4d4: aa1703fb     	mov	x27, x23
 460b4d8: 14000027     	b	0x460b574 <_ChromeMain+0x46062d8>
 460b4dc: f94002e8     	ldr	x8, [x23]
 460b4e0: aa1703f5     	mov	x21, x23
 460b4e4: b4000148     	cbz	x8, 0x460b50c <_ChromeMain+0x4606270>
 460b4e8: aa0803f7     	mov	x23, x8
 460b4ec: f9401108     	ldr	x8, [x8, #0x20]
 460b4f0: eb0802df     	cmp	x22, x8
 460b4f4: 54ffff43     	b.lo	0x460b4dc <_ChromeMain+0x4606240>
 460b4f8: eb16011f     	cmp	x8, x22
 460b4fc: 54fffec2     	b.hs	0x460b4d4 <_ChromeMain+0x4606238>
 460b500: f94006e8     	ldr	x8, [x23, #0x8]
 460b504: b5ffff28     	cbnz	x8, 0x460b4e8 <_ChromeMain+0x460624c>
 460b508: 910022f5     	add	x21, x23, #0x8
 460b50c: aa0903f8     	mov	x24, x9
 460b510: 52800700     	mov	w0, #0x38               ; =56
 460b514: 96e80f95     	bl	0xf368 <_ChromeMain+0xa0cc>
 460b518: b4005820     	cbz	x0, 0x460c01c <_ChromeMain+0x4606d80>
 460b51c: aa0003fb     	mov	x27, x0
 460b520: b100801f     	cmn	x0, #0x20
 460b524: 540057c0     	b.eq	0x460c01c <_ChromeMain+0x4606d80>
 460b528: a9007f7f     	stp	xzr, xzr, [x27]
 460b52c: a902ff7f     	stp	xzr, xzr, [x27, #0x28]
 460b530: f9001376     	str	x22, [x27, #0x20]
 460b534: f9000b77     	str	x23, [x27, #0x10]
 460b538: f90002bb     	str	x27, [x21]
 460b53c: f85683a8     	ldur	x8, [x29, #-0x98]
 460b540: f9400108     	ldr	x8, [x8]
 460b544: aa1b03e1     	mov	x1, x27
 460b548: b4000068     	cbz	x8, 0x460b554 <_ChromeMain+0x46062b8>
 460b54c: f81683a8     	stur	x8, [x29, #-0x98]
 460b550: f94002a1     	ldr	x1, [x21]
 460b554: f85703a0     	ldur	x0, [x29, #-0x90]
 460b558: 96e94142     	bl	0x5ba60 <_ChromeMain+0x567c4>
 460b55c: f85783a8     	ldur	x8, [x29, #-0x88]
 460b560: 91000508     	add	x8, x8, #0x1
 460b564: f81783a8     	stur	x8, [x29, #-0x88]
 460b568: 3dc00fe1     	ldr	q1, [sp, #0x30]
 460b56c: aa1803e9     	mov	x9, x24
 460b570: 910483f8     	add	x24, sp, #0x120
 460b574: a902a77c     	stp	x28, x9, [x27, #0x28]
 460b578: f9400fe8     	ldr	x8, [sp, #0x18]
 460b57c: eb0802df     	cmp	x22, x8
 460b580: 540000c0     	b.eq	0x460b598 <_ChromeMain+0x46062fc>
 460b584: aa1303e0     	mov	x0, x19
 460b588: aa1603e1     	mov	x1, x22
 460b58c: 52800002     	mov	w2, #0x0                ; =0
 460b590: 97fff86e     	bl	0x4609748 <_ChromeMain+0x46044ac>
 460b594: 3dc00fe1     	ldr	q1, [sp, #0x30]
 460b598: 91002339     	add	x25, x25, #0x8
 460b59c: f94007e8     	ldr	x8, [sp, #0x8]
 460b5a0: eb08033f     	cmp	x25, x8
 460b5a4: 54000780     	b.eq	0x460b694 <_ChromeMain+0x46063f8>
 460b5a8: f9400336     	ldr	x22, [x25]
 460b5ac: b40004f6     	cbz	x22, 0x460b648 <_ChromeMain+0x46063ac>
 460b5b0: 9106e2c8     	add	x8, x22, #0x1b8
 460b5b4: 910702c9     	add	x9, x22, #0x1c0
 460b5b8: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 460b5bc: 6ee14400     	ushl.2d	v0, v0, v1
 460b5c0: 0ea1280b     	xtn.2s	v11, v0
 460b5c4: 4d40cd20     	ld1r.2d	{ v0 }, [x9]
 460b5c8: 3d800be0     	str	q0, [sp, #0x20]
 460b5cc: 910483e8     	add	x8, sp, #0x120
 460b5d0: aa1603e0     	mov	x0, x22
 460b5d4: 97f79153     	bl	0x43efb20 <_ChromeMain+0x43ea884>
 460b5d8: 910483e0     	add	x0, sp, #0x120
 460b5dc: 96f8ca34     	bl	0x43deac <_ChromeMain+0x438c10>
 460b5e0: 6e0c0420     	mov.s	v0[1], v1[0]
 460b5e4: 0e28d400     	fadd.2s	v0, v0, v8
 460b5e8: 0e219800     	frintm.2s	v0, v0
 460b5ec: 2e20e541     	fcmge.2s	v1, v10, v0
 460b5f0: 2e29e402     	fcmge.2s	v2, v0, v9
 460b5f4: 2f047402     	bic.2s	v2, #0x80, lsl #24
 460b5f8: 2ea9e403     	fcmgt.2s	v3, v0, v9
 460b5fc: 2ee31d20     	bif.8b	v0, v9, v3
 460b600: 0ea1b800     	fcvtzs.2s	v0, v0
 460b604: 2ee11c40     	bif.8b	v0, v2, v1
 460b608: 0ea00d60     	sqadd.2s	v0, v11, v0
 460b60c: ad4107e2     	ldp	q2, q1, [sp, #0x20]
 460b610: 6ee14441     	ushl.2d	v1, v2, v1
 460b614: 0ea12821     	xtn.2s	v1, v1
 460b618: 0ea10c01     	sqadd.2s	v1, v0, v1
 460b61c: 0ea02c21     	sqsub.2s	v1, v1, v0
 460b620: 0e0c3c28     	mov.s	w8, v1[1]
 460b624: 1e260029     	fmov	w9, s1
 460b628: 3dc00fe1     	ldr	q1, [sp, #0x30]
 460b62c: 0aa97d29     	bic	w9, w9, w9, asr #31
 460b630: 0aa87d08     	bic	w8, w8, w8, asr #31
 460b634: aa088129     	orr	x9, x9, x8, lsl #32
 460b638: 9e66001c     	fmov	x28, d0
 460b63c: f85703a8     	ldur	x8, [x29, #-0x90]
 460b640: f9400bf7     	ldr	x23, [sp, #0x10]
 460b644: 17ffffa7     	b	0x460b4e0 <_ChromeMain+0x4606244>
 460b648: d2800009     	mov	x9, #0x0                ; =0
 460b64c: d280001c     	mov	x28, #0x0               ; =0
 460b650: 17fffffb     	b	0x460b63c <_ChromeMain+0x46063a0>
 460b654: f940ca79     	ldr	x25, [x19, #0x190]
 460b658: f8776b2a     	ldr	x10, [x25, x23]
 460b65c: d10263a9     	sub	x9, x29, #0x98
 460b660: 91002129     	add	x9, x9, #0x8
 460b664: a9377fbf     	stp	xzr, xzr, [x29, #-0x90]
 460b668: a9012be9     	stp	x9, x10, [sp, #0x10]
 460b66c: f81683a9     	stur	x9, [x29, #-0x98]
 460b670: d37df109     	lsl	x9, x8, #3
 460b674: 3dc00fe1     	ldr	q1, [sp, #0x30]
 460b678: b40000e9     	cbz	x9, 0x460b694 <_ChromeMain+0x46063f8>
 460b67c: 8b080f28     	add	x8, x25, x8, lsl #3
 460b680: f90007e8     	str	x8, [sp, #0x8]
 460b684: 0f0167e8     	movi.2s	v8, #0x3f, lsl #24
 460b688: 0f0665e9     	movi.2s	v9, #0xcf, lsl #24
 460b68c: 2f05662a     	mvni.2s	v10, #0xb1, lsl #24
 460b690: 17ffffc6     	b	0x460b5a8 <_ChromeMain+0x460630c>
 460b694: aa1303e0     	mov	x0, x19
 460b698: f9400fe1     	ldr	x1, [sp, #0x18]
 460b69c: 52800002     	mov	w2, #0x0                ; =0
 460b6a0: 97fff82a     	bl	0x4609748 <_ChromeMain+0x46044ac>
 460b6a4: 910483f9     	add	x25, sp, #0x120
 460b6a8: 910483e0     	add	x0, sp, #0x120
 460b6ac: 52804d01     	mov	w1, #0x268              ; =616
 460b6b0: 94e7f858     	bl	0x8009810 <_ChromeMain+0x8004574>
 460b6b4: f941b668     	ldr	x8, [x19, #0x368]
 460b6b8: eb08035f     	cmp	x26, x8
 460b6bc: 54004b02     	b.hs	0x460c01c <_ChromeMain+0x4606d80>
 460b6c0: f941b268     	ldr	x8, [x19, #0x360]
 460b6c4: 52804d15     	mov	w21, #0x268             ; =616
 460b6c8: 9b157f57     	mul	x23, x26, x21
 460b6cc: 8b170116     	add	x22, x8, x23
 460b6d0: 910483e0     	add	x0, sp, #0x120
 460b6d4: aa1603e1     	mov	x1, x22
 460b6d8: 96ef3ddb     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 460b6dc: 3cc782c0     	ldur	q0, [x22, #0x78]
 460b6e0: f94046c8     	ldr	x8, [x22, #0x88]
 460b6e4: f900d7e8     	str	x8, [sp, #0x1a8]
 460b6e8: 3c878300     	stur	q0, [x24, #0x78]
 460b6ec: a907fedf     	stp	xzr, xzr, [x22, #0x78]
 460b6f0: f90046df     	str	xzr, [x22, #0x88]
 460b6f4: f9404ac8     	ldr	x8, [x22, #0x90]
 460b6f8: f84952c9     	ldur	x9, [x22, #0x95]
 460b6fc: f8095309     	stur	x9, [x24, #0x95]
 460b700: f900dbe8     	str	x8, [sp, #0x1b0]
 460b704: 91028320     	add	x0, x25, #0xa0
 460b708: 910282c1     	add	x1, x22, #0xa0
 460b70c: 97d02fcf     	bl	0x3a17648 <_ChromeMain+0x3a123ac>
 460b710: 390d43ff     	strb	wzr, [sp, #0x350]
 460b714: 52801fe8     	mov	w8, #0xff               ; =255
 460b718: 390dc3e8     	strb	w8, [sp, #0x370]
 460b71c: 9108c320     	add	x0, x25, #0x230
 460b720: 9108c2c1     	add	x1, x22, #0x230
 460b724: 97155f06     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 460b728: f9412ec8     	ldr	x8, [x22, #0x258]
 460b72c: 394982c9     	ldrb	w9, [x22, #0x260]
 460b730: 390e03e9     	strb	w9, [sp, #0x380]
 460b734: f901bfe8     	str	x8, [sp, #0x378]
 460b738: f941b668     	ldr	x8, [x19, #0x368]
 460b73c: 9b157d09     	mul	x9, x8, x21
 460b740: eb0902ff     	cmp	x23, x9
 460b744: 540046c0     	b.eq	0x460c01c <_ChromeMain+0x4606d80>
 460b748: f941b27a     	ldr	x26, [x19, #0x360]
 460b74c: 9109a2ea     	add	x10, x23, #0x268
 460b750: eb09015f     	cmp	x10, x9
 460b754: 540004c1     	b.ne	0x460b7ec <_ChromeMain+0x4606550>
 460b758: 8b170358     	add	x24, x26, x23
 460b75c: 14000029     	b	0x460b800 <_ChromeMain+0x4606564>
 460b760: f84782c0     	ldur	x0, [x22, #0x78]
 460b764: f94046c8     	ldr	x8, [x22, #0x88]
 460b768: d37ff901     	lsl	x1, x8, #1
 460b76c: 96e7f5d3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460b770: 3dc0bac0     	ldr	q0, [x22, #0x2e0]
 460b774: 3c8782c0     	stur	q0, [x22, #0x78]
 460b778: f9417ac8     	ldr	x8, [x22, #0x2f0]
 460b77c: 390bdedf     	strb	wzr, [x22, #0x2f7]
 460b780: 7905c2df     	strh	wzr, [x22, #0x2e0]
 460b784: 910be2c9     	add	x9, x22, #0x2f8
 460b788: f9417eca     	ldr	x10, [x22, #0x2f8]
 460b78c: a908aac8     	stp	x8, x10, [x22, #0x88]
 460b790: f8405128     	ldur	x8, [x9, #0x5]
 460b794: f80952c8     	stur	x8, [x22, #0x95]
 460b798: 910282c0     	add	x0, x22, #0xa0
 460b79c: 910c22c1     	add	x1, x22, #0x308
 460b7a0: 97ef3740     	bl	0x41d94a0 <_ChromeMain+0x41d4204>
 460b7a4: 9108c2c0     	add	x0, x22, #0x230
 460b7a8: 911262c1     	add	x1, x22, #0x498
 460b7ac: 9710b8a7     	bl	0xa39a48 <_ChromeMain+0xa347ac>
 460b7b0: f94262c8     	ldr	x8, [x22, #0x4c0]
 460b7b4: f9012ec8     	str	x8, [x22, #0x258]
 460b7b8: 395322c8     	ldrb	w8, [x22, #0x4c8]
 460b7bc: 390982c8     	strb	w8, [x22, #0x260]
 460b7c0: 9109a35a     	add	x26, x26, #0x268
 460b7c4: d109a2b5     	sub	x21, x21, #0x268
 460b7c8: eb1502ff     	cmp	x23, x21
 460b7cc: 54000140     	b.eq	0x460b7f4 <_ChromeMain+0x4606558>
 460b7d0: 8b170356     	add	x22, x26, x23
 460b7d4: 8b170340     	add	x0, x26, x23
 460b7d8: 9109a2c1     	add	x1, x22, #0x268
 460b7dc: 96ffb8c1     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 460b7e0: 39c23ec8     	ldrsb	w8, [x22, #0x8f]
 460b7e4: 37fffbe8     	tbnz	w8, #0x1f, 0x460b760 <_ChromeMain+0x46064c4>
 460b7e8: 17ffffe2     	b	0x460b770 <_ChromeMain+0x46064d4>
 460b7ec: d109a135     	sub	x21, x9, #0x268
 460b7f0: 17fffff8     	b	0x460b7d0 <_ChromeMain+0x4606534>
 460b7f4: 8b170358     	add	x24, x26, x23
 460b7f8: f941b27a     	ldr	x26, [x19, #0x360]
 460b7fc: f941b668     	ldr	x8, [x19, #0x368]
 460b800: 52804d09     	mov	w9, #0x268              ; =616
 460b804: 9b096909     	madd	x9, x8, x9, x26
 460b808: eb18013f     	cmp	x9, x24
 460b80c: 54000400     	b.eq	0x460b88c <_ChromeMain+0x46065f0>
 460b810: 52804d09     	mov	w9, #0x268              ; =616
 460b814: 9b096908     	madd	x8, x8, x9, x26
 460b818: d109a115     	sub	x21, x8, #0x268
 460b81c: 14000013     	b	0x460b868 <_ChromeMain+0x46065cc>
 460b820: f9403ea0     	ldr	x0, [x21, #0x78]
 460b824: f94046a8     	ldr	x8, [x21, #0x88]
 460b828: d37ff901     	lsl	x1, x8, #1
 460b82c: 96e7f5a3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460b830: 9101c2a0     	add	x0, x21, #0x70
 460b834: d2800001     	mov	x1, #0x0                ; =0
 460b838: 96e87120     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460b83c: 910082a0     	add	x0, x21, #0x20
 460b840: 96e8710e     	bl	0x27c78 <_ChromeMain+0x229dc>
 460b844: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 460b848: 36f800a8     	tbz	w8, #0x1f, 0x460b85c <_ChromeMain+0x46065c0>
 460b84c: f94002a0     	ldr	x0, [x21]
 460b850: f9400aa8     	ldr	x8, [x21, #0x10]
 460b854: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460b858: 96e7f598     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460b85c: eb1802bf     	cmp	x21, x24
 460b860: d109a2b5     	sub	x21, x21, #0x268
 460b864: 54000120     	b.eq	0x460b888 <_ChromeMain+0x46065ec>
 460b868: b4003db5     	cbz	x21, 0x460c01c <_ChromeMain+0x4606d80>
 460b86c: 9108c2a0     	add	x0, x21, #0x230
 460b870: 9708ebf4     	bl	0x846840 <_ChromeMain+0x8415a4>
 460b874: 910282a0     	add	x0, x21, #0xa0
 460b878: 972b8382     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 460b87c: 39c23ea8     	ldrsb	w8, [x21, #0x8f]
 460b880: 36fffd88     	tbz	w8, #0x1f, 0x460b830 <_ChromeMain+0x4606594>
 460b884: 17ffffe7     	b	0x460b820 <_ChromeMain+0x4606584>
 460b888: f941b27a     	ldr	x26, [x19, #0x360]
 460b88c: cb1a0315     	sub	x21, x24, x26
 460b890: 9343fea8     	asr	x8, x21, #3
 460b894: d28710a9     	mov	x9, #0x3885             ; =14469
 460b898: f2a7e569     	movk	x9, #0x3f2b, lsl #16
 460b89c: f2d9c429     	movk	x9, #0xce21, lsl #32
 460b8a0: f2e9f949     	movk	x9, #0x4fca, lsl #48
 460b8a4: 9b097d08     	mul	x8, x8, x9
 460b8a8: f901b668     	str	x8, [x19, #0x368]
 460b8ac: 52804d09     	mov	w9, #0x268              ; =616
 460b8b0: 9b097e9c     	mul	x28, x20, x9
 460b8b4: 8b1a0396     	add	x22, x28, x26
 460b8b8: f941ba69     	ldr	x9, [x19, #0x370]
 460b8bc: eb09011f     	cmp	x8, x9
 460b8c0: 54000541     	b.ne	0x460b968 <_ChromeMain+0x46066cc>
 460b8c4: d291dec9     	mov	x9, #0x8ef6             ; =36598
 460b8c8: f2b03529     	movk	x9, #0x81a9, lsl #16
 460b8cc: f2cc77a9     	movk	x9, #0x63bd, lsl #32
 460b8d0: f2e00d49     	movk	x9, #0x6a, lsl #48
 460b8d4: 9100050a     	add	x10, x8, #0x1
 460b8d8: eb09015f     	cmp	x10, x9
 460b8dc: 54005ac8     	b.hi	0x460c434 <_ChromeMain+0x4607198>
 460b8e0: d37ff90b     	lsl	x11, x8, #1
 460b8e4: eb0a017f     	cmp	x11, x10
 460b8e8: 9a8a816b     	csel	x11, x11, x10, hi
 460b8ec: d298ef6a     	mov	x10, #0xc77b            ; =51067
 460b8f0: f2b81a8a     	movk	x10, #0xc0d4, lsl #16
 460b8f4: f2c63bca     	movk	x10, #0x31de, lsl #32
 460b8f8: f2e006aa     	movk	x10, #0x35, lsl #48
 460b8fc: eb0a011f     	cmp	x8, x10
 460b900: f90013eb     	str	x11, [sp, #0x20]
 460b904: 9a893175     	csel	x21, x11, x9, lo
 460b908: b40048b5     	cbz	x21, 0x460c21c <_ChromeMain+0x4606f80>
 460b90c: eb0902bf     	cmp	x21, x9
 460b910: 54005948     	b.hi	0x460c438 <_ChromeMain+0x460719c>
 460b914: 52804d08     	mov	w8, #0x268              ; =616
 460b918: 9b087ea0     	mul	x0, x21, x8
 460b91c: 96e80e93     	bl	0xf368 <_ChromeMain+0xa0cc>
 460b920: aa0003f8     	mov	x24, x0
 460b924: 8b1c0317     	add	x23, x24, x28
 460b928: 9343ff88     	asr	x8, x28, #3
 460b92c: d28710a9     	mov	x9, #0x3885             ; =14469
 460b930: f2a7e569     	movk	x9, #0x3f2b, lsl #16
 460b934: f2d9c429     	movk	x9, #0xce21, lsl #32
 460b938: f2e9f949     	movk	x9, #0x4fca, lsl #48
 460b93c: 9b097d08     	mul	x8, x8, x9
 460b940: eb0802bf     	cmp	x21, x8
 460b944: 54000b01     	b.ne	0x460baa4 <_ChromeMain+0x4606808>
 460b948: eb16035f     	cmp	x26, x22
 460b94c: 54004980     	b.eq	0x460c27c <_ChromeMain+0x4606fe0>
 460b950: 910006a8     	add	x8, x21, #0x1
 460b954: d341fd08     	lsr	x8, x8, #1
 460b958: 52804d09     	mov	w9, #0x268              ; =616
 460b95c: 9b09fd08     	mneg	x8, x8, x9
 460b960: 8b0802f7     	add	x23, x23, x8
 460b964: 14000051     	b	0x460baa8 <_ChromeMain+0x460680c>
 460b968: 8b150357     	add	x23, x26, x21
 460b96c: eb16031f     	cmp	x24, x22
 460b970: 54004a60     	b.eq	0x460c2bc <_ChromeMain+0x4607020>
 460b974: d109a2e9     	sub	x9, x23, #0x268
 460b978: eb18013f     	cmp	x9, x24
 460b97c: 54000542     	b.hs	0x460ba24 <_ChromeMain+0x4606788>
 460b980: 52801ff9     	mov	w25, #0xff              ; =255
 460b984: aa1803f7     	mov	x23, x24
 460b988: b40034b7     	cbz	x23, 0x460c01c <_ChromeMain+0x4606d80>
 460b98c: d109a2e1     	sub	x1, x23, #0x268
 460b990: aa1703e0     	mov	x0, x23
 460b994: 96ef3d2c     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 460b998: d107c2e8     	sub	x8, x23, #0x1f0
 460b99c: 3dc00100     	ldr	q0, [x8]
 460b9a0: 3c8782e0     	stur	q0, [x23, #0x78]
 460b9a4: f9400909     	ldr	x9, [x8, #0x10]
 460b9a8: a900fd1f     	stp	xzr, xzr, [x8, #0x8]
 460b9ac: f900011f     	str	xzr, [x8]
 460b9b0: d10762e8     	sub	x8, x23, #0x1d8
 460b9b4: f940010a     	ldr	x10, [x8]
 460b9b8: a908aae9     	stp	x9, x10, [x23, #0x88]
 460b9bc: f8405108     	ldur	x8, [x8, #0x5]
 460b9c0: f80952e8     	stur	x8, [x23, #0x95]
 460b9c4: 910282e0     	add	x0, x23, #0xa0
 460b9c8: d10722e1     	sub	x1, x23, #0x1c8
 460b9cc: 97d02f1f     	bl	0x3a17648 <_ChromeMain+0x3a123ac>
 460b9d0: 3908c2ff     	strb	wzr, [x23, #0x230]
 460b9d4: 390942f9     	strb	w25, [x23, #0x250]
 460b9d8: 9108c2e0     	add	x0, x23, #0x230
 460b9dc: d100e2e1     	sub	x1, x23, #0x38
 460b9e0: 97155e57     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 460b9e4: f85f02e8     	ldur	x8, [x23, #-0x10]
 460b9e8: f9012ee8     	str	x8, [x23, #0x258]
 460b9ec: 385f82e8     	ldurb	w8, [x23, #-0x8]
 460b9f0: 390982e8     	strb	w8, [x23, #0x260]
 460b9f4: 9109a2e8     	add	x8, x23, #0x268
 460b9f8: eb1802ff     	cmp	x23, x24
 460b9fc: aa0803f7     	mov	x23, x8
 460ba00: 54fffc43     	b.lo	0x460b988 <_ChromeMain+0x46066ec>
 460ba04: f941b269     	ldr	x9, [x19, #0x360]
 460ba08: cb090108     	sub	x8, x8, x9
 460ba0c: 9343fd08     	asr	x8, x8, #3
 460ba10: d28710a9     	mov	x9, #0x3885             ; =14469
 460ba14: f2a7e569     	movk	x9, #0x3f2b, lsl #16
 460ba18: f2d9c429     	movk	x9, #0xce21, lsl #32
 460ba1c: f2e9f949     	movk	x9, #0x4fca, lsl #48
 460ba20: 9b097d08     	mul	x8, x8, x9
 460ba24: f901b668     	str	x8, [x19, #0x368]
 460ba28: 9109a388     	add	x8, x28, #0x268
 460ba2c: eb0802bf     	cmp	x21, x8
 460ba30: 54003f21     	b.ne	0x460c214 <_ChromeMain+0x4606f78>
 460ba34: 910483e1     	add	x1, sp, #0x120
 460ba38: aa1603e0     	mov	x0, x22
 460ba3c: 96ffb829     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 460ba40: 39c23ec8     	ldrsb	w8, [x22, #0x8f]
 460ba44: 37f848c8     	tbnz	w8, #0x1f, 0x460c35c <_ChromeMain+0x46070c0>
 460ba48: 910483f9     	add	x25, sp, #0x120
 460ba4c: 3cc78320     	ldur	q0, [x25, #0x78]
 460ba50: f8488328     	ldur	x8, [x25, #0x88]
 460ba54: f80882c8     	stur	x8, [x22, #0x88]
 460ba58: 3c8782c0     	stur	q0, [x22, #0x78]
 460ba5c: 3906bfff     	strb	wzr, [sp, #0x1af]
 460ba60: 790333ff     	strh	wzr, [sp, #0x198]
 460ba64: f8490328     	ldur	x8, [x25, #0x90]
 460ba68: f8495329     	ldur	x9, [x25, #0x95]
 460ba6c: f80952c9     	stur	x9, [x22, #0x95]
 460ba70: f9004ac8     	str	x8, [x22, #0x90]
 460ba74: 910282c0     	add	x0, x22, #0xa0
 460ba78: 91028321     	add	x1, x25, #0xa0
 460ba7c: 97ef3689     	bl	0x41d94a0 <_ChromeMain+0x41d4204>
 460ba80: 9108c2c0     	add	x0, x22, #0x230
 460ba84: 9108c321     	add	x1, x25, #0x230
 460ba88: 9710b7f0     	bl	0xa39a48 <_ChromeMain+0xa347ac>
 460ba8c: 91096328     	add	x8, x25, #0x258
 460ba90: f9400109     	ldr	x9, [x8]
 460ba94: 39402108     	ldrb	w8, [x8, #0x8]
 460ba98: 390982c8     	strb	w8, [x22, #0x260]
 460ba9c: f9012ec9     	str	x9, [x22, #0x258]
 460baa0: 140000d9     	b	0x460be04 <_ChromeMain+0x4606b68>
 460baa4: f90013f5     	str	x21, [sp, #0x20]
 460baa8: f9001bf7     	str	x23, [sp, #0x30]
 460baac: b4002b97     	cbz	x23, 0x460c01c <_ChromeMain+0x4606d80>
 460bab0: 910483e1     	add	x1, sp, #0x120
 460bab4: aa1703e0     	mov	x0, x23
 460bab8: 96ef3ce3     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 460babc: 910483f8     	add	x24, sp, #0x120
 460bac0: 3cc78300     	ldur	q0, [x24, #0x78]
 460bac4: f8488308     	ldur	x8, [x24, #0x88]
 460bac8: f90046e8     	str	x8, [x23, #0x88]
 460bacc: 3c8782e0     	stur	q0, [x23, #0x78]
 460bad0: a907ff1f     	stp	xzr, xzr, [x24, #0x78]
 460bad4: f808831f     	stur	xzr, [x24, #0x88]
 460bad8: f8495308     	ldur	x8, [x24, #0x95]
 460badc: f8490309     	ldur	x9, [x24, #0x90]
 460bae0: f9004ae9     	str	x9, [x23, #0x90]
 460bae4: f80952e8     	stur	x8, [x23, #0x95]
 460bae8: 910282e0     	add	x0, x23, #0xa0
 460baec: 91028301     	add	x1, x24, #0xa0
 460baf0: 97d02ed6     	bl	0x3a17648 <_ChromeMain+0x3a123ac>
 460baf4: 3908c2ff     	strb	wzr, [x23, #0x230]
 460baf8: 52801ff5     	mov	w21, #0xff              ; =255
 460bafc: 390942f5     	strb	w21, [x23, #0x250]
 460bb00: 9108c2e0     	add	x0, x23, #0x230
 460bb04: 9108c301     	add	x1, x24, #0x230
 460bb08: 97155e0d     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 460bb0c: 91096308     	add	x8, x24, #0x258
 460bb10: f9400109     	ldr	x9, [x8]
 460bb14: 39402108     	ldrb	w8, [x8, #0x8]
 460bb18: 390982e8     	strb	w8, [x23, #0x260]
 460bb1c: f9012ee9     	str	x9, [x23, #0x258]
 460bb20: f9401be8     	ldr	x8, [sp, #0x30]
 460bb24: cb0802e8     	sub	x8, x23, x8
 460bb28: 9109a10a     	add	x10, x8, #0x268
 460bb2c: f941b278     	ldr	x24, [x19, #0x360]
 460bb30: f941b668     	ldr	x8, [x19, #0x368]
 460bb34: 52804d09     	mov	w9, #0x268              ; =616
 460bb38: 9b09611b     	madd	x27, x8, x9, x24
 460bb3c: eb160369     	subs	x9, x27, x22
 460bb40: a9002be9     	stp	x9, x10, [sp]
 460bb44: 540008a0     	b.eq	0x460bc58 <_ChromeMain+0x46069bc>
 460bb48: d2800018     	mov	x24, #0x0               ; =0
 460bb4c: f94007e8     	ldr	x8, [sp, #0x8]
 460bb50: f9401be9     	ldr	x9, [sp, #0x30]
 460bb54: 8b080139     	add	x25, x9, x8
 460bb58: 8b1802fc     	add	x28, x23, x24
 460bb5c: b109a380     	adds	x0, x28, #0x268
 460bb60: 540025e0     	b.eq	0x460c01c <_ChromeMain+0x4606d80>
 460bb64: 8b1802da     	add	x26, x22, x24
 460bb68: 8b1802c1     	add	x1, x22, x24
 460bb6c: 96ef3cb6     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 460bb70: 3cc78340     	ldur	q0, [x26, #0x78]
 460bb74: f9404748     	ldr	x8, [x26, #0x88]
 460bb78: f9004728     	str	x8, [x25, #0x88]
 460bb7c: 3c878320     	stur	q0, [x25, #0x78]
 460bb80: a907ff5f     	stp	xzr, xzr, [x26, #0x78]
 460bb84: f900475f     	str	xzr, [x26, #0x88]
 460bb88: f9404b48     	ldr	x8, [x26, #0x90]
 460bb8c: f8495349     	ldur	x9, [x26, #0x95]
 460bb90: f8095329     	stur	x9, [x25, #0x95]
 460bb94: f9004b28     	str	x8, [x25, #0x90]
 460bb98: 910c2380     	add	x0, x28, #0x308
 460bb9c: 91028341     	add	x1, x26, #0xa0
 460bba0: 97d02eaa     	bl	0x3a17648 <_ChromeMain+0x3a123ac>
 460bba4: 3908c33f     	strb	wzr, [x25, #0x230]
 460bba8: 39094335     	strb	w21, [x25, #0x250]
 460bbac: 9108c320     	add	x0, x25, #0x230
 460bbb0: 9108c341     	add	x1, x26, #0x230
 460bbb4: 97155de2     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 460bbb8: f9412f48     	ldr	x8, [x26, #0x258]
 460bbbc: 39498349     	ldrb	w9, [x26, #0x260]
 460bbc0: 39098329     	strb	w9, [x25, #0x260]
 460bbc4: f9012f28     	str	x8, [x25, #0x258]
 460bbc8: 9109a339     	add	x25, x25, #0x268
 460bbcc: 9109a318     	add	x24, x24, #0x268
 460bbd0: 8b1802c8     	add	x8, x22, x24
 460bbd4: eb1b011f     	cmp	x8, x27
 460bbd8: 54fffc01     	b.ne	0x460bb58 <_ChromeMain+0x46068bc>
 460bbdc: b4002216     	cbz	x22, 0x460c01c <_ChromeMain+0x4606d80>
 460bbe0: aa1603f5     	mov	x21, x22
 460bbe4: 14000014     	b	0x460bc34 <_ChromeMain+0x4606998>
 460bbe8: f9403ea0     	ldr	x0, [x21, #0x78]
 460bbec: f94046a8     	ldr	x8, [x21, #0x88]
 460bbf0: d37ff901     	lsl	x1, x8, #1
 460bbf4: 96e7f4b1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460bbf8: 9101c2a0     	add	x0, x21, #0x70
 460bbfc: d2800001     	mov	x1, #0x0                ; =0
 460bc00: 96e8702e     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460bc04: 910082a0     	add	x0, x21, #0x20
 460bc08: 96e8701c     	bl	0x27c78 <_ChromeMain+0x229dc>
 460bc0c: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 460bc10: 36f800a8     	tbz	w8, #0x1f, 0x460bc24 <_ChromeMain+0x4606988>
 460bc14: f94002a0     	ldr	x0, [x21]
 460bc18: f9400aa8     	ldr	x8, [x21, #0x10]
 460bc1c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460bc20: 96e7f4a6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460bc24: 9109a2b5     	add	x21, x21, #0x268
 460bc28: eb1b02bf     	cmp	x21, x27
 460bc2c: 54000120     	b.eq	0x460bc50 <_ChromeMain+0x46069b4>
 460bc30: b4001f75     	cbz	x21, 0x460c01c <_ChromeMain+0x4606d80>
 460bc34: 9108c2a0     	add	x0, x21, #0x230
 460bc38: 9708eb02     	bl	0x846840 <_ChromeMain+0x8415a4>
 460bc3c: 910282a0     	add	x0, x21, #0xa0
 460bc40: 972b8290     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 460bc44: 39c23ea8     	ldrsb	w8, [x21, #0x8f]
 460bc48: 36fffd88     	tbz	w8, #0x1f, 0x460bbf8 <_ChromeMain+0x460695c>
 460bc4c: 17ffffe7     	b	0x460bbe8 <_ChromeMain+0x460694c>
 460bc50: f941b668     	ldr	x8, [x19, #0x368]
 460bc54: f941b278     	ldr	x24, [x19, #0x360]
 460bc58: f94003e9     	ldr	x9, [sp]
 460bc5c: 9343fd29     	asr	x9, x9, #3
 460bc60: d28710aa     	mov	x10, #0x3885            ; =14469
 460bc64: f2a7e56a     	movk	x10, #0x3f2b, lsl #16
 460bc68: f2d9c42a     	movk	x10, #0xce21, lsl #32
 460bc6c: f2e9f94a     	movk	x10, #0x4fca, lsl #48
 460bc70: 9b0a7d3c     	mul	x28, x9, x10
 460bc74: cb1c0108     	sub	x8, x8, x28
 460bc78: f901b668     	str	x8, [x19, #0x368]
 460bc7c: 52804d09     	mov	w9, #0x268              ; =616
 460bc80: 9b09fd09     	mneg	x9, x8, x9
 460bc84: f9401bea     	ldr	x10, [sp, #0x30]
 460bc88: 8b09015a     	add	x26, x10, x9
 460bc8c: eb16031f     	cmp	x24, x22
 460bc90: 54000920     	b.eq	0x460bdb4 <_ChromeMain+0x4606b18>
 460bc94: d2800015     	mov	x21, #0x0               ; =0
 460bc98: 52801ff9     	mov	w25, #0xff              ; =255
 460bc9c: ab150357     	adds	x23, x26, x21
 460bca0: 54001be0     	b.eq	0x460c01c <_ChromeMain+0x4606d80>
 460bca4: 8b15031b     	add	x27, x24, x21
 460bca8: 8b150301     	add	x1, x24, x21
 460bcac: aa1703e0     	mov	x0, x23
 460bcb0: 96ef3c65     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 460bcb4: 3cc78360     	ldur	q0, [x27, #0x78]
 460bcb8: f9404768     	ldr	x8, [x27, #0x88]
 460bcbc: f90046e8     	str	x8, [x23, #0x88]
 460bcc0: 3c8782e0     	stur	q0, [x23, #0x78]
 460bcc4: a907ff7f     	stp	xzr, xzr, [x27, #0x78]
 460bcc8: f900477f     	str	xzr, [x27, #0x88]
 460bccc: f9404b68     	ldr	x8, [x27, #0x90]
 460bcd0: f8495369     	ldur	x9, [x27, #0x95]
 460bcd4: f80952e9     	stur	x9, [x23, #0x95]
 460bcd8: f9004ae8     	str	x8, [x23, #0x90]
 460bcdc: 8b150348     	add	x8, x26, x21
 460bce0: 91028100     	add	x0, x8, #0xa0
 460bce4: 91028361     	add	x1, x27, #0xa0
 460bce8: 97d02e58     	bl	0x3a17648 <_ChromeMain+0x3a123ac>
 460bcec: 3908c2ff     	strb	wzr, [x23, #0x230]
 460bcf0: 390942f9     	strb	w25, [x23, #0x250]
 460bcf4: 9108c2e0     	add	x0, x23, #0x230
 460bcf8: 9108c361     	add	x1, x27, #0x230
 460bcfc: 97155d90     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 460bd00: f9412f68     	ldr	x8, [x27, #0x258]
 460bd04: 39498369     	ldrb	w9, [x27, #0x260]
 460bd08: 390982e9     	strb	w9, [x23, #0x260]
 460bd0c: f9012ee8     	str	x8, [x23, #0x258]
 460bd10: 9109a2b5     	add	x21, x21, #0x268
 460bd14: 8b150308     	add	x8, x24, x21
 460bd18: eb16011f     	cmp	x8, x22
 460bd1c: 54fffc01     	b.ne	0x460bc9c <_ChromeMain+0x4606a00>
 460bd20: 9108c317     	add	x23, x24, #0x230
 460bd24: 14000018     	b	0x460bd84 <_ChromeMain+0x4606ae8>
 460bd28: d106e2e8     	sub	x8, x23, #0x1b8
 460bd2c: f9400100     	ldr	x0, [x8]
 460bd30: d106a2e8     	sub	x8, x23, #0x1a8
 460bd34: f9400108     	ldr	x8, [x8]
 460bd38: d37ff901     	lsl	x1, x8, #1
 460bd3c: 96e7f45f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460bd40: d10702e0     	sub	x0, x23, #0x1c0
 460bd44: d2800001     	mov	x1, #0x0                ; =0
 460bd48: 96e86fdc     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460bd4c: d10842e0     	sub	x0, x23, #0x210
 460bd50: 96e86fca     	bl	0x27c78 <_ChromeMain+0x229dc>
 460bd54: d10866e8     	sub	x8, x23, #0x219
 460bd58: 39c00108     	ldrsb	w8, [x8]
 460bd5c: 36f800c8     	tbz	w8, #0x1f, 0x460bd74 <_ChromeMain+0x4606ad8>
 460bd60: f94002a0     	ldr	x0, [x21]
 460bd64: d10882e8     	sub	x8, x23, #0x220
 460bd68: f9400108     	ldr	x8, [x8]
 460bd6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460bd70: 96e7f452     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460bd74: 9100e2e8     	add	x8, x23, #0x38
 460bd78: 9109a2f7     	add	x23, x23, #0x268
 460bd7c: eb16011f     	cmp	x8, x22
 460bd80: 54000160     	b.eq	0x460bdac <_ChromeMain+0x4606b10>
 460bd84: f108c2f5     	subs	x21, x23, #0x230
 460bd88: 540014a0     	b.eq	0x460c01c <_ChromeMain+0x4606d80>
 460bd8c: aa1703e0     	mov	x0, x23
 460bd90: 9708eaac     	bl	0x846840 <_ChromeMain+0x8415a4>
 460bd94: d10642e0     	sub	x0, x23, #0x190
 460bd98: 972b823a     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 460bd9c: d10686e8     	sub	x8, x23, #0x1a1
 460bda0: 39c00108     	ldrsb	w8, [x8]
 460bda4: 36fffce8     	tbz	w8, #0x1f, 0x460bd40 <_ChromeMain+0x4606aa4>
 460bda8: 17ffffe0     	b	0x460bd28 <_ChromeMain+0x4606a8c>
 460bdac: f941b278     	ldr	x24, [x19, #0x360]
 460bdb0: f941b668     	ldr	x8, [x19, #0x368]
 460bdb4: f94007e9     	ldr	x9, [sp, #0x8]
 460bdb8: 9343fd29     	asr	x9, x9, #3
 460bdbc: d28710aa     	mov	x10, #0x3885            ; =14469
 460bdc0: f2a7e56a     	movk	x10, #0x3f2b, lsl #16
 460bdc4: f2d9c42a     	movk	x10, #0xce21, lsl #32
 460bdc8: f2e9f94a     	movk	x10, #0x4fca, lsl #48
 460bdcc: 9b0a7d29     	mul	x9, x9, x10
 460bdd0: 8b090389     	add	x9, x28, x9
 460bdd4: 8b080128     	add	x8, x9, x8
 460bdd8: f901b27a     	str	x26, [x19, #0x360]
 460bddc: f901b668     	str	x8, [x19, #0x368]
 460bde0: f941ba68     	ldr	x8, [x19, #0x370]
 460bde4: f94013e9     	ldr	x9, [sp, #0x20]
 460bde8: f901ba69     	str	x9, [x19, #0x370]
 460bdec: 910483f9     	add	x25, sp, #0x120
 460bdf0: b40000b8     	cbz	x24, 0x460be04 <_ChromeMain+0x4606b68>
 460bdf4: 52804d09     	mov	w9, #0x268              ; =616
 460bdf8: 9b097d01     	mul	x1, x8, x9
 460bdfc: aa1803e0     	mov	x0, x24
 460be00: 96e7f42e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460be04: aa1303e0     	mov	x0, x19
 460be08: f9400fe1     	ldr	x1, [sp, #0x18]
 460be0c: aa1403e2     	mov	x2, x20
 460be10: 97c10dda     	bl	0x364f578 <_ChromeMain+0x364a2dc>
 460be14: f9028674     	str	x20, [x19, #0x508]
 460be18: 52800028     	mov	w8, #0x1                ; =1
 460be1c: 39144268     	strb	w8, [x19, #0x510]
 460be20: 39146268     	strb	w8, [x19, #0x518]
 460be24: f940ce68     	ldr	x8, [x19, #0x198]
 460be28: f9400bf6     	ldr	x22, [sp, #0x10]
 460be2c: b4000068     	cbz	x8, 0x460be38 <_ChromeMain+0x4606b9c>
 460be30: d2800017     	mov	x23, #0x0               ; =0
 460be34: 1400000f     	b	0x460be70 <_ChromeMain+0x4606bd4>
 460be38: 97eca8f8     	bl	0x4136218 <_ChromeMain+0x4130f7c>
 460be3c: f940ce68     	ldr	x8, [x19, #0x198]
 460be40: b4000b28     	cbz	x8, 0x460bfa4 <_ChromeMain+0x4606d08>
 460be44: d2800014     	mov	x20, #0x0               ; =0
 460be48: f004c968     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 460be4c: 3dc1b500     	ldr	q0, [x8, #0x6d0]
 460be50: 3d800fe0     	str	q0, [sp, #0x30]
 460be54: 14000045     	b	0x460bf68 <_ChromeMain+0x4606ccc>
 460be58: 34000048     	cbz	w8, 0x460be60 <_ChromeMain+0x4606bc4>
 460be5c: f901f297     	str	x23, [x20, #0x3e0]
 460be60: 910006f7     	add	x23, x23, #0x1
 460be64: f940ce68     	ldr	x8, [x19, #0x198]
 460be68: eb0802ff     	cmp	x23, x8
 460be6c: 54fffe62     	b.hs	0x460be38 <_ChromeMain+0x4606b9c>
 460be70: f940ca68     	ldr	x8, [x19, #0x190]
 460be74: f8777914     	ldr	x20, [x8, x23, lsl #3]
 460be78: b4ffff54     	cbz	x20, 0x460be60 <_ChromeMain+0x4606bc4>
 460be7c: f9400288     	ldr	x8, [x20]
 460be80: f9402d08     	ldr	x8, [x8, #0x58]
 460be84: aa1403e0     	mov	x0, x20
 460be88: d63f0100     	blr	x8
 460be8c: aa0003f5     	mov	x21, x0
 460be90: 97ffe39c     	bl	0x4604d00 <_ChromeMain+0x45ffa64>
 460be94: f10002bf     	cmp	x21, #0x0
 460be98: 1a9f07e8     	cset	w8, ne
 460be9c: eb0002bf     	cmp	x21, x0
 460bea0: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 460bea4: 54fffda0     	b.eq	0x460be58 <_ChromeMain+0x4606bbc>
 460bea8: f94026b5     	ldr	x21, [x21, #0x48]
 460beac: f10002bf     	cmp	x21, #0x0
 460beb0: 1a9f07e8     	cset	w8, ne
 460beb4: fa4012a4     	ccmp	x21, x0, #0x4, ne
 460beb8: 54ffff81     	b.ne	0x460bea8 <_ChromeMain+0x4606c0c>
 460bebc: 17ffffe7     	b	0x460be58 <_ChromeMain+0x4606bbc>
 460bec0: f94002f7     	ldr	x23, [x23]
 460bec4: b4000117     	cbz	x23, 0x460bee4 <_ChromeMain+0x4606c48>
 460bec8: f94012e8     	ldr	x8, [x23, #0x20]
 460becc: eb0802bf     	cmp	x21, x8
 460bed0: 54ffff83     	b.lo	0x460bec0 <_ChromeMain+0x4606c24>
 460bed4: eb15011f     	cmp	x8, x21
 460bed8: 54000062     	b.hs	0x460bee4 <_ChromeMain+0x4606c48>
 460bedc: f94006f7     	ldr	x23, [x23, #0x8]
 460bee0: b5ffff57     	cbnz	x23, 0x460bec8 <_ChromeMain+0x4606c2c>
 460bee4: 910443e1     	add	x1, sp, #0x110
 460bee8: aa1503e0     	mov	x0, x21
 460beec: 970a6329     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 460bef0: eb1602ff     	cmp	x23, x22
 460bef4: fa401ae4     	ccmp	x23, #0x0, #0x4, ne
 460bef8: 54000240     	b.eq	0x460bf40 <_ChromeMain+0x4606ca4>
 460befc: f90043ff     	str	xzr, [sp, #0x80]
 460bf00: 294522ea     	ldp	w10, w8, [x23, #0x28]
 460bf04: b94113eb     	ldr	w11, [sp, #0x110]
 460bf08: b94117e9     	ldr	w9, [sp, #0x114]
 460bf0c: 6b09010c     	subs	w12, w8, w9
 460bf10: 131f7d8d     	asr	w13, w12, #31
 460bf14: 520101ad     	eor	w13, w13, #0x80000000
 460bf18: 1a8c61ac     	csel	w12, w13, w12, vs
 460bf1c: 6b0b014a     	subs	w10, w10, w11
 460bf20: 131f7d4b     	asr	w11, w10, #31
 460bf24: 5201016b     	eor	w11, w11, #0x80000000
 460bf28: 1a8a616a     	csel	w10, w11, w10, vs
 460bf2c: aa0c814a     	orr	x10, x10, x12, lsl #32
 460bf30: f90043ea     	str	x10, [sp, #0x80]
 460bf34: 540002e1     	b.ne	0x460bf90 <_ChromeMain+0x4606cf4>
 460bf38: 6b09011f     	cmp	w8, w9
 460bf3c: 540002a1     	b.ne	0x460bf90 <_ChromeMain+0x4606cf4>
 460bf40: 390223ff     	strb	wzr, [sp, #0x88]
 460bf44: 3dc00fe0     	ldr	q0, [sp, #0x30]
 460bf48: 3c8903e0     	stur	q0, [sp, #0x90]
 460bf4c: 910223e1     	add	x1, sp, #0x88
 460bf50: aa1503e0     	mov	x0, x21
 460bf54: 9583386a     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
 460bf58: 91000694     	add	x20, x20, #0x1
 460bf5c: f940ce68     	ldr	x8, [x19, #0x198]
 460bf60: eb08029f     	cmp	x20, x8
 460bf64: 54000202     	b.hs	0x460bfa4 <_ChromeMain+0x4606d08>
 460bf68: f940ca68     	ldr	x8, [x19, #0x190]
 460bf6c: f8747915     	ldr	x21, [x8, x20, lsl #3]
 460bf70: a9117fff     	stp	xzr, xzr, [sp, #0x110]
 460bf74: aa1303e0     	mov	x0, x19
 460bf78: aa1403e1     	mov	x1, x20
 460bf7c: 97fff0ad     	bl	0x4608230 <_ChromeMain+0x4602f94>
 460bf80: a91107e0     	stp	x0, x1, [sp, #0x110]
 460bf84: f85703b7     	ldur	x23, [x29, #-0x90]
 460bf88: b4fffaf7     	cbz	x23, 0x460bee4 <_ChromeMain+0x4606c48>
 460bf8c: 17ffffcf     	b	0x460bec8 <_ChromeMain+0x4606c2c>
 460bf90: 910203e2     	add	x2, sp, #0x80
 460bf94: aa1303e0     	mov	x0, x19
 460bf98: aa1503e1     	mov	x1, x21
 460bf9c: 97fff640     	bl	0x460989c <_ChromeMain+0x4604600>
 460bfa0: 17ffffee     	b	0x460bf58 <_ChromeMain+0x4606cbc>
 460bfa4: aa1303e0     	mov	x0, x19
 460bfa8: 96fe5475     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460bfac: 9108c320     	add	x0, x25, #0x230
 460bfb0: 9708ea24     	bl	0x846840 <_ChromeMain+0x8415a4>
 460bfb4: 91028320     	add	x0, x25, #0xa0
 460bfb8: 972b81b2     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 460bfbc: 39c6bfe8     	ldrsb	w8, [sp, #0x1af]
 460bfc0: 36f800a8     	tbz	w8, #0x1f, 0x460bfd4 <_ChromeMain+0x4606d38>
 460bfc4: f940cfe0     	ldr	x0, [sp, #0x198]
 460bfc8: f940d7e8     	ldr	x8, [sp, #0x1a8]
 460bfcc: d37ff901     	lsl	x1, x8, #1
 460bfd0: 96e7f3ba     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460bfd4: 910483f3     	add	x19, sp, #0x120
 460bfd8: 9101c260     	add	x0, x19, #0x70
 460bfdc: d2800001     	mov	x1, #0x0                ; =0
 460bfe0: 96e86f36     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460bfe4: 91008260     	add	x0, x19, #0x20
 460bfe8: 96e86f24     	bl	0x27c78 <_ChromeMain+0x229dc>
 460bfec: 39c4dfe8     	ldrsb	w8, [sp, #0x137]
 460bff0: 36f800a8     	tbz	w8, #0x1f, 0x460c004 <_ChromeMain+0x4606d68>
 460bff4: f94093e0     	ldr	x0, [sp, #0x120]
 460bff8: f9409be8     	ldr	x8, [sp, #0x130]
 460bffc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460c000: 96e7f3ae     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460c004: f85703a1     	ldur	x1, [x29, #-0x90]
 460c008: d10263a8     	sub	x8, x29, #0x98
 460c00c: f90093e8     	str	x8, [sp, #0x120]
 460c010: 910483e0     	add	x0, sp, #0x120
 460c014: 97a266cb     	bl	0x2ea5b40 <_ChromeMain+0x2ea08a4>
 460c018: 17fffc12     	b	0x460b060 <_ChromeMain+0x4605dc4>
 460c01c: d4200020     	brk	#0x1
 460c020: f942f660     	ldr	x0, [x19, #0x5e8]
 460c024: f942fe68     	ldr	x8, [x19, #0x5f8]
 460c028: d37ff901     	lsl	x1, x8, #1
 460c02c: 96e7f3a3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460c030: 14000014     	b	0x460c080 <_ChromeMain+0x4606de4>
 460c034: 9115a268     	add	x8, x19, #0x568
 460c038: 39578269     	ldrb	w9, [x19, #0x5e0]
 460c03c: 35000109     	cbnz	w9, 0x460c05c <_ChromeMain+0x4606dc0>
 460c040: b4fffee8     	cbz	x8, 0x460c01c <_ChromeMain+0x4606d80>
 460c044: 9115a260     	add	x0, x19, #0x568
 460c048: aa1503e1     	mov	x1, x21
 460c04c: 96ecb7d2     	bl	0x139f94 <_ChromeMain+0x134cf8>
 460c050: 52800028     	mov	w8, #0x1                ; =1
 460c054: 39178268     	strb	w8, [x19, #0x5e0]
 460c058: 14000004     	b	0x460c068 <_ChromeMain+0x4606dcc>
 460c05c: 9115a260     	add	x0, x19, #0x568
 460c060: aa1503e1     	mov	x1, x21
 460c064: 96fafe2a     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 460c068: 910483e8     	add	x8, sp, #0x120
 460c06c: aa1503e0     	mov	x0, x21
 460c070: 97fff57e     	bl	0x4609668 <_ChromeMain+0x46043cc>
 460c074: 9117a275     	add	x21, x19, #0x5e8
 460c078: 39d7fe68     	ldrsb	w8, [x19, #0x5ff]
 460c07c: 37fffd28     	tbnz	w8, #0x1f, 0x460c020 <_ChromeMain+0x4606d84>
 460c080: 3dc00300     	ldr	q0, [x24]
 460c084: f9409be8     	ldr	x8, [sp, #0x130]
 460c088: f9000aa8     	str	x8, [x21, #0x10]
 460c08c: 3d8002a0     	str	q0, [x21]
 460c090: 39401328     	ldrb	w8, [x25, #0x4]
 460c094: b9400329     	ldr	w9, [x25]
 460c098: b9060269     	str	w9, [x19, #0x600]
 460c09c: 39181268     	strb	w8, [x19, #0x604]
 460c0a0: 385783a8     	ldurb	w8, [x29, #-0x88]
 460c0a4: 3607fbc8     	tbz	w8, #0x0, 0x460c01c <_ChromeMain+0x4606d80>
 460c0a8: b85703a8     	ldur	w8, [x29, #-0x90]
 460c0ac: 34000368     	cbz	w8, 0x460c118 <_ChromeMain+0x4606e7c>
 460c0b0: b85743a8     	ldur	w8, [x29, #-0x8c]
 460c0b4: 34000328     	cbz	w8, 0x460c118 <_ChromeMain+0x4606e7c>
 460c0b8: f9424668     	ldr	x8, [x19, #0x488]
 460c0bc: b40001a8     	cbz	x8, 0x460c0f0 <_ChromeMain+0x4606e54>
 460c0c0: f9401113     	ldr	x19, [x8, #0x20]
 460c0c4: b4000173     	cbz	x19, 0x460c0f0 <_ChromeMain+0x4606e54>
 460c0c8: f940b668     	ldr	x8, [x19, #0x168]
 460c0cc: f9401108     	ldr	x8, [x8, #0x20]
 460c0d0: b4000088     	cbz	x8, 0x460c0e0 <_ChromeMain+0x4606e44>
 460c0d4: bd401900     	ldr	s0, [x8, #0x18]
 460c0d8: 1e202008     	fcmp	s0, #0.0
 460c0dc: 540000a0     	b.eq	0x460c0f0 <_ChromeMain+0x4606e54>
 460c0e0: f940b260     	ldr	x0, [x19, #0x160]
 460c0e4: b40014a0     	cbz	x0, 0x460c378 <_ChromeMain+0x46070dc>
 460c0e8: 6f00e400     	movi.2d	v0, #0000000000000000
 460c0ec: 9753a293     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 460c0f0: 394fee88     	ldrb	w8, [x20, #0x3fb]
 460c0f4: 37077b68     	tbnz	w8, #0x0, 0x460b060 <_ChromeMain+0x4605dc4>
 460c0f8: 52800028     	mov	w8, #0x1                ; =1
 460c0fc: 390fee88     	strb	w8, [x20, #0x3fb]
 460c100: f9401293     	ldr	x19, [x20, #0x20]
 460c104: b40002d3     	cbz	x19, 0x460c15c <_ChromeMain+0x4606ec0>
 460c108: f940b260     	ldr	x0, [x19, #0x160]
 460c10c: b4001760     	cbz	x0, 0x460c3f8 <_ChromeMain+0x460715c>
 460c110: 6f00e400     	movi.2d	v0, #0000000000000000
 460c114: 14000011     	b	0x460c158 <_ChromeMain+0x4606ebc>
 460c118: 9101c3e2     	add	x2, sp, #0x70
 460c11c: aa1303e0     	mov	x0, x19
 460c120: aa1403e1     	mov	x1, x20
 460c124: 97fff393     	bl	0x4608f70 <_ChromeMain+0x4603cd4>
 460c128: 394fee88     	ldrb	w8, [x20, #0x3fb]
 460c12c: 6b00011f     	cmp	w8, w0
 460c130: 54ff7980     	b.eq	0x460b060 <_ChromeMain+0x4605dc4>
 460c134: 390fee80     	strb	w0, [x20, #0x3fb]
 460c138: f9401293     	ldr	x19, [x20, #0x20]
 460c13c: b4000113     	cbz	x19, 0x460c15c <_ChromeMain+0x4606ec0>
 460c140: 7100001f     	cmp	w0, #0x0
 460c144: 1e2e1000     	fmov	s0, #1.00000000
 460c148: 6f00e401     	movi.2d	v1, #0000000000000000
 460c14c: 1e201c20     	fcsel	s0, s1, s0, ne
 460c150: f940b260     	ldr	x0, [x19, #0x160]
 460c154: b4001300     	cbz	x0, 0x460c3b4 <_ChromeMain+0x4607118>
 460c158: 9753a278     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 460c15c: f940c680     	ldr	x0, [x20, #0x188]
 460c160: b4ff7800     	cbz	x0, 0x460b060 <_ChromeMain+0x4605dc4>
 460c164: 96fe5406     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460c168: 17fffbbe     	b	0x460b060 <_ChromeMain+0x4605dc4>
 460c16c: f90093ff     	str	xzr, [sp, #0x120]
 460c170: 2f06e400     	movi	d0, #0xffff000000000000
 460c174: fd0097e0     	str	d0, [sp, #0x128]
 460c178: 52800028     	mov	w8, #0x1                ; =1
 460c17c: 3904c3e8     	strb	w8, [sp, #0x130]
 460c180: f9009fff     	str	xzr, [sp, #0x138]
 460c184: 390503ff     	strb	wzr, [sp, #0x140]
 460c188: 17fffc40     	b	0x460b288 <_ChromeMain+0x4605fec>
 460c18c: f94172e0     	ldr	x0, [x23, #0x2e0]
 460c190: f9417ae8     	ldr	x8, [x23, #0x2f0]
 460c194: d37ff901     	lsl	x1, x8, #1
 460c198: 96e7f348     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460c19c: 910b82e8     	add	x8, x23, #0x2e0
 460c1a0: 3cc782e0     	ldur	q0, [x23, #0x78]
 460c1a4: 3d800100     	str	q0, [x8]
 460c1a8: a948aae9     	ldp	x9, x10, [x23, #0x88]
 460c1ac: f9000909     	str	x9, [x8, #0x10]
 460c1b0: 39023eff     	strb	wzr, [x23, #0x8f]
 460c1b4: 7900f2ff     	strh	wzr, [x23, #0x78]
 460c1b8: 910be2e8     	add	x8, x23, #0x2f8
 460c1bc: f9017eea     	str	x10, [x23, #0x2f8]
 460c1c0: f84952e9     	ldur	x9, [x23, #0x95]
 460c1c4: f8005109     	stur	x9, [x8, #0x5]
 460c1c8: 910c22e0     	add	x0, x23, #0x308
 460c1cc: 910282e1     	add	x1, x23, #0xa0
 460c1d0: 97ef34b4     	bl	0x41d94a0 <_ChromeMain+0x41d4204>
 460c1d4: 911262e0     	add	x0, x23, #0x498
 460c1d8: 9108c2e1     	add	x1, x23, #0x230
 460c1dc: 9710b61b     	bl	0xa39a48 <_ChromeMain+0xa347ac>
 460c1e0: f9412ee8     	ldr	x8, [x23, #0x258]
 460c1e4: f90262e8     	str	x8, [x23, #0x4c0]
 460c1e8: 394982e8     	ldrb	w8, [x23, #0x260]
 460c1ec: 391322e8     	strb	w8, [x23, #0x4c8]
 460c1f0: eb1602ff     	cmp	x23, x22
 460c1f4: d109a2f7     	sub	x23, x23, #0x268
 460c1f8: 54ffc1e0     	b.eq	0x460ba34 <_ChromeMain+0x4606798>
 460c1fc: 9109a2e0     	add	x0, x23, #0x268
 460c200: aa1703e1     	mov	x1, x23
 460c204: 96ffb637     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 460c208: 39cbdee8     	ldrsb	w8, [x23, #0x2f7]
 460c20c: 37fffc08     	tbnz	w8, #0x1f, 0x460c18c <_ChromeMain+0x4606ef0>
 460c210: 17ffffe3     	b	0x460c19c <_ChromeMain+0x4606f00>
 460c214: d1134317     	sub	x23, x24, #0x4d0
 460c218: 17fffff9     	b	0x460c1fc <_ChromeMain+0x4606f60>
 460c21c: d2800018     	mov	x24, #0x0               ; =0
 460c220: 17fffdc1     	b	0x460b924 <_ChromeMain+0x4606688>
 460c224: 4ea01c08     	mov.16b	v8, v0
 460c228: 52802400     	mov	w0, #0x120              ; =288
 460c22c: 96e80c4f     	bl	0xf368 <_ChromeMain+0xa0cc>
 460c230: aa0003f6     	mov	x22, x0
 460c234: d2800001     	mov	x1, #0x0                ; =0
 460c238: 9729b828     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460c23c: b40000a0     	cbz	x0, 0x460c250 <_ChromeMain+0x4606fb4>
 460c240: b9400ac8     	ldr	w8, [x22, #0x8]
 460c244: 31000508     	adds	w8, w8, #0x1
 460c248: b9000ac8     	str	w8, [x22, #0x8]
 460c24c: 54001162     	b.hs	0x460c478 <_ChromeMain+0x46071dc>
 460c250: aa1503e0     	mov	x0, x21
 460c254: aa1603e1     	mov	x1, x22
 460c258: 9731bfe9     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460c25c: f940b2a0     	ldr	x0, [x21, #0x160]
 460c260: 4ea81d00     	mov.16b	v0, v8
 460c264: 910483f8     	add	x24, sp, #0x120
 460c268: 17fffc55     	b	0x460b3bc <_ChromeMain+0x4606120>
 460c26c: f9400a88     	ldr	x8, [x20, #0x10]
 460c270: aa1403e0     	mov	x0, x20
 460c274: d63f0100     	blr	x8
 460c278: 17fffc67     	b	0x460b414 <_ChromeMain+0x4606178>
 460c27c: d37ffaa8     	lsl	x8, x21, #1
 460c280: f100051f     	cmp	x8, #0x1
 460c284: 9a9f8508     	csinc	x8, x8, xzr, hi
 460c288: d342fd19     	lsr	x25, x8, #2
 460c28c: 52804d1a     	mov	w26, #0x268             ; =616
 460c290: f90013e8     	str	x8, [sp, #0x20]
 460c294: 9b1a7d00     	mul	x0, x8, x26
 460c298: 96e80c34     	bl	0xf368 <_ChromeMain+0xa0cc>
 460c29c: 9b1a0328     	madd	x8, x25, x26, x0
 460c2a0: f9001be8     	str	x8, [sp, #0x30]
 460c2a4: b4ffc058     	cbz	x24, 0x460baac <_ChromeMain+0x4606810>
 460c2a8: 52804d08     	mov	w8, #0x268              ; =616
 460c2ac: 9b087ea1     	mul	x1, x21, x8
 460c2b0: aa1803e0     	mov	x0, x24
 460c2b4: 96e7f301     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460c2b8: 17fffdfd     	b	0x460baac <_ChromeMain+0x4606810>
 460c2bc: b4ffeb16     	cbz	x22, 0x460c01c <_ChromeMain+0x4606d80>
 460c2c0: 910483e1     	add	x1, sp, #0x120
 460c2c4: aa1703e0     	mov	x0, x23
 460c2c8: 96ef3adf     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 460c2cc: 910483f9     	add	x25, sp, #0x120
 460c2d0: 3cc78320     	ldur	q0, [x25, #0x78]
 460c2d4: f8488328     	ldur	x8, [x25, #0x88]
 460c2d8: f90046e8     	str	x8, [x23, #0x88]
 460c2dc: 3c8782e0     	stur	q0, [x23, #0x78]
 460c2e0: a907ff3f     	stp	xzr, xzr, [x25, #0x78]
 460c2e4: f808833f     	stur	xzr, [x25, #0x88]
 460c2e8: f8490328     	ldur	x8, [x25, #0x90]
 460c2ec: f8495329     	ldur	x9, [x25, #0x95]
 460c2f0: f80952e9     	stur	x9, [x23, #0x95]
 460c2f4: f9004ae8     	str	x8, [x23, #0x90]
 460c2f8: 910282e0     	add	x0, x23, #0xa0
 460c2fc: 91028321     	add	x1, x25, #0xa0
 460c300: 97d02cd2     	bl	0x3a17648 <_ChromeMain+0x3a123ac>
 460c304: 3908c2ff     	strb	wzr, [x23, #0x230]
 460c308: 52801fe8     	mov	w8, #0xff               ; =255
 460c30c: 390942e8     	strb	w8, [x23, #0x250]
 460c310: 9108c2e0     	add	x0, x23, #0x230
 460c314: 9108c321     	add	x1, x25, #0x230
 460c318: 97155c09     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 460c31c: 91096328     	add	x8, x25, #0x258
 460c320: f9400109     	ldr	x9, [x8]
 460c324: 39402108     	ldrb	w8, [x8, #0x8]
 460c328: 390982e8     	strb	w8, [x23, #0x260]
 460c32c: f9012ee9     	str	x9, [x23, #0x258]
 460c330: f941b268     	ldr	x8, [x19, #0x360]
 460c334: cb0802e8     	sub	x8, x23, x8
 460c338: 9109a108     	add	x8, x8, #0x268
 460c33c: 9343fd08     	asr	x8, x8, #3
 460c340: d28710a9     	mov	x9, #0x3885             ; =14469
 460c344: f2a7e569     	movk	x9, #0x3f2b, lsl #16
 460c348: f2d9c429     	movk	x9, #0xce21, lsl #32
 460c34c: f2e9f949     	movk	x9, #0x4fca, lsl #48
 460c350: 9b097d08     	mul	x8, x8, x9
 460c354: f901b668     	str	x8, [x19, #0x368]
 460c358: 17fffeab     	b	0x460be04 <_ChromeMain+0x4606b68>
 460c35c: f9403ec0     	ldr	x0, [x22, #0x78]
 460c360: f94046c8     	ldr	x8, [x22, #0x88]
 460c364: d37ff901     	lsl	x1, x8, #1
 460c368: 96e7f2d4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460c36c: a907fedf     	stp	xzr, xzr, [x22, #0x78]
 460c370: f80882df     	stur	xzr, [x22, #0x88]
 460c374: 17fffdb5     	b	0x460ba48 <_ChromeMain+0x46067ac>
 460c378: 52802400     	mov	w0, #0x120              ; =288
 460c37c: 96e80bfb     	bl	0xf368 <_ChromeMain+0xa0cc>
 460c380: aa0003f5     	mov	x21, x0
 460c384: d2800001     	mov	x1, #0x0                ; =0
 460c388: 9729b7d4     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460c38c: b40000a0     	cbz	x0, 0x460c3a0 <_ChromeMain+0x4607104>
 460c390: b9400aa8     	ldr	w8, [x21, #0x8]
 460c394: 31000508     	adds	w8, w8, #0x1
 460c398: b9000aa8     	str	w8, [x21, #0x8]
 460c39c: 540007a2     	b.hs	0x460c490 <_ChromeMain+0x46071f4>
 460c3a0: aa1303e0     	mov	x0, x19
 460c3a4: aa1503e1     	mov	x1, x21
 460c3a8: 9731bf95     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460c3ac: f940b260     	ldr	x0, [x19, #0x160]
 460c3b0: 17ffff4e     	b	0x460c0e8 <_ChromeMain+0x4606e4c>
 460c3b4: 4ea01c08     	mov.16b	v8, v0
 460c3b8: 52802400     	mov	w0, #0x120              ; =288
 460c3bc: 96e80beb     	bl	0xf368 <_ChromeMain+0xa0cc>
 460c3c0: aa0003f5     	mov	x21, x0
 460c3c4: d2800001     	mov	x1, #0x0                ; =0
 460c3c8: 9729b7c4     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460c3cc: b40000a0     	cbz	x0, 0x460c3e0 <_ChromeMain+0x4607144>
 460c3d0: b9400aa8     	ldr	w8, [x21, #0x8]
 460c3d4: 31000508     	adds	w8, w8, #0x1
 460c3d8: b9000aa8     	str	w8, [x21, #0x8]
 460c3dc: 54000542     	b.hs	0x460c484 <_ChromeMain+0x46071e8>
 460c3e0: aa1303e0     	mov	x0, x19
 460c3e4: aa1503e1     	mov	x1, x21
 460c3e8: 9731bf85     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460c3ec: f940b260     	ldr	x0, [x19, #0x160]
 460c3f0: 4ea81d00     	mov.16b	v0, v8
 460c3f4: 17ffff59     	b	0x460c158 <_ChromeMain+0x4606ebc>
 460c3f8: 52802400     	mov	w0, #0x120              ; =288
 460c3fc: 96e80bdb     	bl	0xf368 <_ChromeMain+0xa0cc>
 460c400: aa0003f5     	mov	x21, x0
 460c404: d2800001     	mov	x1, #0x0                ; =0
 460c408: 9729b7b4     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460c40c: b40000a0     	cbz	x0, 0x460c420 <_ChromeMain+0x4607184>
 460c410: b9400aa8     	ldr	w8, [x21, #0x8]
 460c414: 31000508     	adds	w8, w8, #0x1
 460c418: b9000aa8     	str	w8, [x21, #0x8]
 460c41c: 54000402     	b.hs	0x460c49c <_ChromeMain+0x4607200>
 460c420: aa1303e0     	mov	x0, x19
 460c424: aa1503e1     	mov	x1, x21
 460c428: 9731bf75     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460c42c: f940b260     	ldr	x0, [x19, #0x160]
 460c430: 17ffff38     	b	0x460c110 <_ChromeMain+0x4606e74>
 460c434: 97641e53     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 460c438: 9417e6fa     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 460c43c: d4200000     	brk	#0
 460c440: d4400000     	hlt	#0
 460c444: d4200020     	brk	#0x1
 460c448: d4200000     	brk	#0
 460c44c: d4400000     	hlt	#0
 460c450: d4200020     	brk	#0x1
 460c454: d4200000     	brk	#0
 460c458: d4400000     	hlt	#0
 460c45c: d4200020     	brk	#0x1
 460c460: d4200000     	brk	#0
 460c464: d4400000     	hlt	#0
 460c468: d4200020     	brk	#0x1
 460c46c: d4200000     	brk	#0
 460c470: d4400000     	hlt	#0
 460c474: d4200020     	brk	#0x1
 460c478: d4200000     	brk	#0
 460c47c: d4400000     	hlt	#0
 460c480: d4200020     	brk	#0x1
 460c484: d4200000     	brk	#0
 460c488: d4400000     	hlt	#0
 460c48c: d4200020     	brk	#0x1
 460c490: d4200000     	brk	#0
 460c494: d4400000     	hlt	#0
 460c498: d4200020     	brk	#0x1
 460c49c: d4200000     	brk	#0
 460c4a0: d4400000     	hlt	#0
 460c4a4: d4200020     	brk	#0x1
