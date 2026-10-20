
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4135080: d10483ff     	sub	sp, sp, #0x120
 4135084: a90c6ffc     	stp	x28, x27, [sp, #0xc0]
 4135088: a90d67fa     	stp	x26, x25, [sp, #0xd0]
 413508c: a90e5ff8     	stp	x24, x23, [sp, #0xe0]
 4135090: a90f57f6     	stp	x22, x21, [sp, #0xf0]
 4135094: a9104ff4     	stp	x20, x19, [sp, #0x100]
 4135098: a9117bfd     	stp	x29, x30, [sp, #0x110]
 413509c: 910443fd     	add	x29, sp, #0x110
 41350a0: aa0003fb     	mov	x27, x0
 41350a4: 6f00e400     	movi.2d	v0, #0000000000000000
 41350a8: ad000100     	stp	q0, q0, [x8]
 41350ac: f942b020     	ldr	x0, [x1, #0x560]
 41350b0: b5000120     	cbnz	x0, 0x41350d4 <_ChromeMain+0x412fe38>
 41350b4: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 41350b8: a9504ff4     	ldp	x20, x19, [sp, #0x100]
 41350bc: a94f57f6     	ldp	x22, x21, [sp, #0xf0]
 41350c0: a94e5ff8     	ldp	x24, x23, [sp, #0xe0]
 41350c4: a94d67fa     	ldp	x26, x25, [sp, #0xd0]
 41350c8: a94c6ffc     	ldp	x28, x27, [sp, #0xc0]
 41350cc: 910483ff     	add	sp, sp, #0x120
 41350d0: d65f03c0     	ret
 41350d4: aa0203f4     	mov	x20, x2
 41350d8: aa0103f5     	mov	x21, x1
 41350dc: aa0803f3     	mov	x19, x8
 41350e0: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 41350e4: f81a03bf     	stur	xzr, [x29, #-0x60]
 41350e8: f940a408     	ldr	x8, [x0, #0x148]
 41350ec: b40000a8     	cbz	x8, 0x4135100 <_ChromeMain+0x412fe64>
 41350f0: f9401100     	ldr	x0, [x8, #0x20]
 41350f4: d101c3a8     	sub	x8, x29, #0x70
 41350f8: 97e38f24     	bl	0x3a18d88 <_ChromeMain+0x3a13aec>
 41350fc: f942b2a0     	ldr	x0, [x21, #0x560]
 4135100: a908ffff     	stp	xzr, xzr, [sp, #0x88]
 4135104: f9004fff     	str	xzr, [sp, #0x98]
 4135108: 910223e8     	add	x8, sp, #0x88
 413510c: 94ddba1b     	bl	0x78a3978 <_ChromeMain+0x789e6dc>
 4135110: f942bab8     	ldr	x24, [x21, #0x570]
 4135114: b40005b8     	cbz	x24, 0x41351c8 <_ChromeMain+0x412ff2c>
 4135118: a948dbf7     	ldp	x23, x22, [sp, #0x88]
 413511c: f9404fe8     	ldr	x8, [sp, #0x98]
 4135120: eb0802df     	cmp	x22, x8
 4135124: 54000180     	b.eq	0x4135154 <_ChromeMain+0x412feb8>
 4135128: d37df2c9     	lsl	x9, x22, #3
 413512c: 8b160ee8     	add	x8, x23, x22, lsl #3
 4135130: b50009c9     	cbnz	x9, 0x4135268 <_ChromeMain+0x412ffcc>
 4135134: b4002177     	cbz	x23, 0x4135560 <_ChromeMain+0x41302c4>
 4135138: f9000118     	str	x24, [x8]
 413513c: f94047e9     	ldr	x9, [sp, #0x88]
 4135140: cb090108     	sub	x8, x8, x9
 4135144: 91002108     	add	x8, x8, #0x8
 4135148: 9343fd08     	asr	x8, x8, #3
 413514c: f9004be8     	str	x8, [sp, #0x90]
 4135150: 1400001e     	b	0x41351c8 <_ChromeMain+0x412ff2c>
 4135154: 910006c8     	add	x8, x22, #0x1
 4135158: d37dfd09     	lsr	x9, x8, #61
 413515c: b5002049     	cbnz	x9, 0x4135564 <_ChromeMain+0x41302c8>
 4135160: d37ffac9     	lsl	x9, x22, #1
 4135164: eb08013f     	cmp	x9, x8
 4135168: 9a888128     	csel	x8, x9, x8, hi
 413516c: 92fe0009     	mov	x9, #0xfffffffffffffff  ; =1152921504606846975
 4135170: 92fc000a     	mov	x10, #0x1fffffffffffffff ; =2305843009213693951
 4135174: eb0902df     	cmp	x22, x9
 4135178: 9a8a311a     	csel	x26, x8, x10, lo
 413517c: b4001f3a     	cbz	x26, 0x4135560 <_ChromeMain+0x41302c4>
 4135180: d37dff48     	lsr	x8, x26, #61
 4135184: b5001f28     	cbnz	x8, 0x4135568 <_ChromeMain+0x41302cc>
 4135188: d37df340     	lsl	x0, x26, #3
 413518c: 96fb6877     	bl	0xf368 <_ChromeMain+0xa0cc>
 4135190: b4001e80     	cbz	x0, 0x4135560 <_ChromeMain+0x41302c4>
 4135194: aa0003f9     	mov	x25, x0
 4135198: f8008418     	str	x24, [x0], #0x8
 413519c: d37df2d8     	lsl	x24, x22, #3
 41351a0: aa1703e1     	mov	x1, x23
 41351a4: aa1803e2     	mov	x2, x24
 41351a8: 94fb52d4     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 41351ac: 910006c8     	add	x8, x22, #0x1
 41351b0: a908a3f9     	stp	x25, x8, [sp, #0x88]
 41351b4: f9004ffa     	str	x26, [sp, #0x98]
 41351b8: b4000097     	cbz	x23, 0x41351c8 <_ChromeMain+0x412ff2c>
 41351bc: aa1703e0     	mov	x0, x23
 41351c0: aa1803e1     	mov	x1, x24
 41351c4: 96fb4f3d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41351c8: f9418aa8     	ldr	x8, [x21, #0x310]
 41351cc: f9403d08     	ldr	x8, [x8, #0x78]
 41351d0: 910c42a0     	add	x0, x21, #0x310
 41351d4: d63f0100     	blr	x8
 41351d8: b9002be0     	str	w0, [sp, #0x28]
 41351dc: 528007a0     	mov	w0, #0x3d               ; =61
 41351e0: 970f39b8     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 41351e4: f9404be8     	ldr	x8, [sp, #0x90]
 41351e8: d37df109     	lsl	x9, x8, #3
 41351ec: b5000649     	cbnz	x9, 0x41352b4 <_ChromeMain+0x4130018>
 41351f0: d2800016     	mov	x22, #0x0               ; =0
 41351f4: 52800017     	mov	w23, #0x0               ; =0
 41351f8: 14000007     	b	0x4135214 <_ChromeMain+0x412ff78>
 41351fc: 11001388     	add	w8, w28, #0x4
 4135200: f9400fe9     	ldr	x9, [sp, #0x18]
 4135204: f100013f     	cmp	x9, #0x0
 4135208: 1a8803f7     	csel	w23, wzr, w8, eq
 413520c: b94027e8     	ldr	w8, [sp, #0x24]
 4135210: 0aa87d16     	bic	w22, w8, w8, asr #31
 4135214: f941b2a8     	ldr	x8, [x21, #0x360]
 4135218: b4000148     	cbz	x8, 0x4135240 <_ChromeMain+0x412ffa4>
 413521c: 910c42a0     	add	x0, x21, #0x310
 4135220: 94dd99d8     	bl	0x789b980 <_ChromeMain+0x78966e4>
 4135224: d360fc08     	lsr	x8, x0, #32
 4135228: 8b418108     	add	x8, x8, x1, lsr #32
 413522c: 39403289     	ldrb	w9, [x20, #0xc]
 4135230: 34000089     	cbz	w9, 0x4135240 <_ChromeMain+0x412ffa4>
 4135234: b9400a89     	ldr	w9, [x20, #0x8]
 4135238: 6b08013f     	cmp	w9, w8
 413523c: 1a88b128     	csel	w8, w9, w8, lt
 4135240: 6b0802ff     	cmp	w23, w8
 4135244: 1a88c2e8     	csel	w8, w23, w8, gt
 4135248: 0aa87d08     	bic	w8, w8, w8, asr #31
 413524c: aa0882c8     	orr	x8, x22, x8, lsl #32
 4135250: f9000268     	str	x8, [x19]
 4135254: 910223e8     	add	x8, sp, #0x88
 4135258: f9003be8     	str	x8, [sp, #0x70]
 413525c: 9101c3e0     	add	x0, sp, #0x70
 4135260: 97059c98     	bl	0x29c4c0 <_ChromeMain+0x297224>
 4135264: 17ffff94     	b	0x41350b4 <_ChromeMain+0x412fe18>
 4135268: d1002122     	sub	x2, x9, #0x8
 413526c: 8b0202e9     	add	x9, x23, x2
 4135270: eb08013f     	cmp	x9, x8
 4135274: 540000c2     	b.hs	0x413528c <_ChromeMain+0x412fff0>
 4135278: f940012a     	ldr	x10, [x9]
 413527c: aa0803e9     	mov	x9, x8
 4135280: f800852a     	str	x10, [x9], #0x8
 4135284: f94047ea     	ldr	x10, [sp, #0x88]
 4135288: 14000003     	b	0x4135294 <_ChromeMain+0x412fff8>
 413528c: aa1703ea     	mov	x10, x23
 4135290: aa0803e9     	mov	x9, x8
 4135294: cb0a0129     	sub	x9, x9, x10
 4135298: 9343fd29     	asr	x9, x9, #3
 413529c: f9004be9     	str	x9, [sp, #0x90]
 41352a0: cb020100     	sub	x0, x8, x2
 41352a4: aa1703e1     	mov	x1, x23
 41352a8: 94fb6809     	bl	0x800f2cc <_ChromeMain+0x800a030>
 41352ac: f90002f8     	str	x24, [x23]
 41352b0: 17ffffc6     	b	0x41351c8 <_ChromeMain+0x412ff2c>
 41352b4: aa0003f8     	mov	x24, x0
 41352b8: a9017ffb     	stp	x27, xzr, [sp, #0x10]
 41352bc: b90027ff     	str	wzr, [sp, #0x24]
 41352c0: f94047f7     	ldr	x23, [sp, #0x88]
 41352c4: 8b080ee8     	add	x8, x23, x8, lsl #3
 41352c8: f90007e8     	str	x8, [sp, #0x8]
 41352cc: 5280003c     	mov	w28, #0x1               ; =1
 41352d0: 14000037     	b	0x41353ac <_ChromeMain+0x4130110>
 41352d4: f260033f     	tst	x25, #0x100000000
 41352d8: 1a960388     	csel	w8, w28, w22, eq
 41352dc: b9406fe9     	ldr	w9, [sp, #0x6c]
 41352e0: 2b090109     	adds	w9, w8, w9
 41352e4: 131f7d2a     	asr	w10, w9, #31
 41352e8: 5201014a     	eor	w10, w10, #0x80000000
 41352ec: 1a896149     	csel	w9, w10, w9, vs
 41352f0: 6b080129     	subs	w9, w9, w8
 41352f4: 131f7d2a     	asr	w10, w9, #31
 41352f8: 5201014a     	eor	w10, w10, #0x80000000
 41352fc: 1a896149     	csel	w9, w10, w9, vs
 4135300: 0aa97d29     	bic	w9, w9, w9, asr #31
 4135304: b90067e8     	str	w8, [sp, #0x64]
 4135308: b9006fe9     	str	w9, [sp, #0x6c]
 413530c: 39401288     	ldrb	w8, [x20, #0x4]
 4135310: 340001e8     	cbz	w8, 0x413534c <_ChromeMain+0x41300b0>
 4135314: b9400288     	ldr	w8, [x20]
 4135318: b94063e9     	ldr	w9, [sp, #0x60]
 413531c: 0b09030a     	add	w10, w24, w9
 4135320: 4b0a0108     	sub	w8, w8, w10
 4135324: 2b080128     	adds	w8, w9, w8
 4135328: 131f7d0a     	asr	w10, w8, #31
 413532c: 5201014a     	eor	w10, w10, #0x80000000
 4135330: 1a886148     	csel	w8, w10, w8, vs
 4135334: 6b090108     	subs	w8, w8, w9
 4135338: 131f7d09     	asr	w9, w8, #31
 413533c: 52010129     	eor	w9, w9, #0x80000000
 4135340: 1a886128     	csel	w8, w9, w8, vs
 4135344: 0aa87d08     	bic	w8, w8, w8, asr #31
 4135348: b9006be8     	str	w8, [sp, #0x68]
 413534c: 52800028     	mov	w8, #0x1                ; =1
 4135350: 3900b3e8     	strb	w8, [sp, #0x2c]
 4135354: 91002260     	add	x0, x19, #0x8
 4135358: 910203e1     	add	x1, sp, #0x80
 413535c: 9100b3e2     	add	x2, sp, #0x2c
 4135360: 910183e3     	add	x3, sp, #0x60
 4135364: 94cedec7     	bl	0x74ece80 <_ChromeMain+0x74e7be4>
 4135368: b9406fe8     	ldr	w8, [sp, #0x6c]
 413536c: 0b080388     	add	w8, w28, w8
 4135370: 1100111c     	add	w28, w8, #0x4
 4135374: b9406be8     	ldr	w8, [sp, #0x68]
 4135378: b94063e9     	ldr	w9, [sp, #0x60]
 413537c: 0b080128     	add	w8, w9, w8
 4135380: b94027e9     	ldr	w9, [sp, #0x24]
 4135384: 6b08013f     	cmp	w9, w8
 4135388: 1a88c129     	csel	w9, w9, w8, gt
 413538c: b90027e9     	str	w9, [sp, #0x24]
 4135390: f9400fe8     	ldr	x8, [sp, #0x18]
 4135394: 91000508     	add	x8, x8, #0x1
 4135398: f9000fe8     	str	x8, [sp, #0x18]
 413539c: 910022f7     	add	x23, x23, #0x8
 41353a0: f94007e8     	ldr	x8, [sp, #0x8]
 41353a4: eb0802ff     	cmp	x23, x8
 41353a8: 54fff2a0     	b.eq	0x41351fc <_ChromeMain+0x412ff60>
 41353ac: f94002f9     	ldr	x25, [x23]
 41353b0: f90043f9     	str	x25, [sp, #0x80]
 41353b4: b40001b9     	cbz	x25, 0x41353e8 <_ChromeMain+0x413014c>
 41353b8: f9400328     	ldr	x8, [x25]
 41353bc: f9402d08     	ldr	x8, [x8, #0x58]
 41353c0: aa1903e0     	mov	x0, x25
 41353c4: d63f0100     	blr	x8
 41353c8: aa0003fa     	mov	x26, x0
 41353cc: 94ddc99e     	bl	0x78a7a44 <_ChromeMain+0x78a27a8>
 41353d0: f100035f     	cmp	x26, #0x0
 41353d4: 1a9f07e8     	cset	w8, ne
 41353d8: eb00035f     	cmp	x26, x0
 41353dc: fa401b44     	ccmp	x26, #0x0, #0x4, ne
 41353e0: 54000060     	b.eq	0x41353ec <_ChromeMain+0x4130150>
 41353e4: 14000059     	b	0x4135548 <_ChromeMain+0x41302ac>
 41353e8: 52800008     	mov	w8, #0x0                ; =0
 41353ec: b9402be9     	ldr	w9, [sp, #0x28]
 41353f0: 7100093f     	cmp	w9, #0x2
 41353f4: 1a9f07e9     	cset	w9, ne
 41353f8: f100033f     	cmp	x25, #0x0
 41353fc: 1a8803e8     	csel	w8, wzr, w8, eq
 4135400: 6a08013f     	tst	w9, w8
 4135404: 1a9813fa     	csel	w26, wzr, w24, ne
 4135408: f9400688     	ldr	x8, [x20, #0x8]
 413540c: 2a0803f9     	mov	w25, w8
 4135410: d360fd1b     	lsr	x27, x8, #32
 4135414: d368fd16     	lsr	x22, x8, #40
 4135418: 385a03a8     	ldurb	w8, [x29, #-0x60]
 413541c: 2a280368     	orn	w8, w27, w8
 4135420: 370000e8     	tbnz	w8, #0x0, 0x413543c <_ChromeMain+0x41301a0>
 4135424: aa1503e0     	mov	x0, x21
 4135428: 97c0b186     	bl	0x3161a40 <_ChromeMain+0x315c7a4>
 413542c: b4000080     	cbz	x0, 0x413543c <_ChromeMain+0x41301a0>
 4135430: d2800016     	mov	x22, #0x0               ; =0
 4135434: b941c419     	ldr	w25, [x0, #0x1c4]
 4135438: 5280003b     	mov	w27, #0x1               ; =1
 413543c: 39401288     	ldrb	w8, [x20, #0x4]
 4135440: 34000128     	cbz	w8, 0x4135464 <_ChromeMain+0x41301c8>
 4135444: 0b180348     	add	w8, w26, w24
 4135448: f9400289     	ldr	x9, [x20]
 413544c: f260013f     	tst	x9, #0x100000000
 4135450: 1a8803e8     	csel	w8, wzr, w8, eq
 4135454: 92607d2a     	and	x10, x9, #0xffffffff00000000
 4135458: 4b080128     	sub	w8, w9, w8
 413545c: aa080148     	orr	x8, x10, x8
 4135460: 14000002     	b	0x4135468 <_ChromeMain+0x41301cc>
 4135464: f9400288     	ldr	x8, [x20]
 4135468: d3601f69     	ubfiz	x9, x27, #32, #8
 413546c: aa16a129     	orr	x9, x9, x22, lsl #40
 4135470: aa190129     	orr	x9, x9, x25
 4135474: a90727e8     	stp	x8, x9, [sp, #0x70]
 4135478: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 413547c: f94043e0     	ldr	x0, [sp, #0x80]
 4135480: 9101c3e1     	add	x1, sp, #0x70
 4135484: 971a81ff     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4135488: f90037e0     	str	x0, [sp, #0x68]
 413548c: 290c7ffa     	stp	w26, wzr, [sp, #0x60]
 4135490: 2b000348     	adds	w8, w26, w0
 4135494: 131f7d09     	asr	w9, w8, #31
 4135498: 52010129     	eor	w9, w9, #0x80000000
 413549c: 1a886128     	csel	w8, w9, w8, vs
 41354a0: 6b1a0108     	subs	w8, w8, w26
 41354a4: 131f7d09     	asr	w9, w8, #31
 41354a8: 52010129     	eor	w9, w9, #0x80000000
 41354ac: 1a886128     	csel	w8, w9, w8, vs
 41354b0: 0aa87d08     	bic	w8, w8, w8, asr #31
 41354b4: b9006be8     	str	w8, [sp, #0x68]
 41354b8: f94043e1     	ldr	x1, [sp, #0x80]
 41354bc: 910c42a0     	add	x0, x21, #0x310
 41354c0: 94dd9944     	bl	0x789b9d0 <_ChromeMain+0x7896734>
 41354c4: aa0103f9     	mov	x25, x1
 41354c8: d360fc16     	lsr	x22, x0, #32
 41354cc: 3cd903a0     	ldur	q0, [x29, #-0x70]
 41354d0: 3d8013e0     	str	q0, [sp, #0x40]
 41354d4: f85a03a8     	ldur	x8, [x29, #-0x60]
 41354d8: f9002be8     	str	x8, [sp, #0x50]
 41354dc: f94043e3     	ldr	x3, [sp, #0x80]
 41354e0: 910103e2     	add	x2, sp, #0x40
 41354e4: f9400be0     	ldr	x0, [sp, #0x10]
 41354e8: aa1503e1     	mov	x1, x21
 41354ec: 94dde8da     	bl	0x78af854 <_ChromeMain+0x78aa5b8>
 41354f0: 3707ef20     	tbnz	w0, #0x0, 0x41352d4 <_ChromeMain+0x4130038>
 41354f4: 3900ffff     	strb	wzr, [sp, #0x3f]
 41354f8: f260033f     	tst	x25, #0x100000000
 41354fc: 1a960388     	csel	w8, w28, w22, eq
 4135500: b9406be9     	ldr	w9, [sp, #0x68]
 4135504: 2905a3fa     	stp	w26, w8, [sp, #0x2c]
 4135508: 2b090348     	adds	w8, w26, w9
 413550c: 131f7d09     	asr	w9, w8, #31
 4135510: 52010129     	eor	w9, w9, #0x80000000
 4135514: 1a886128     	csel	w8, w9, w8, vs
 4135518: 6b1a0108     	subs	w8, w8, w26
 413551c: 131f7d09     	asr	w9, w8, #31
 4135520: 52010129     	eor	w9, w9, #0x80000000
 4135524: 1a886128     	csel	w8, w9, w8, vs
 4135528: 0aa87d08     	bic	w8, w8, w8, asr #31
 413552c: 2906ffe8     	stp	w8, wzr, [sp, #0x34]
 4135530: 91002260     	add	x0, x19, #0x8
 4135534: 910203e1     	add	x1, sp, #0x80
 4135538: 9100ffe2     	add	x2, sp, #0x3f
 413553c: 9100b3e3     	add	x3, sp, #0x2c
 4135540: 94cede50     	bl	0x74ece80 <_ChromeMain+0x74e7be4>
 4135544: 17ffff96     	b	0x413539c <_ChromeMain+0x4130100>
 4135548: f940275a     	ldr	x26, [x26, #0x48]
 413554c: f100035f     	cmp	x26, #0x0
 4135550: 1a9f07e8     	cset	w8, ne
 4135554: fa401344     	ccmp	x26, x0, #0x4, ne
 4135558: 54ffff81     	b.ne	0x4135548 <_ChromeMain+0x41302ac>
 413555c: 17ffffa4     	b	0x41353ec <_ChromeMain+0x4130150>
 4135560: d4200020     	brk	#0x1
 4135564: 97777a07     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 4135568: 942b42ae     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 413556c: 00000000     	udf	#0x0
