
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4671570: d10383ff     	sub	sp, sp, #0xe0
 4671574: a9086ffc     	stp	x28, x27, [sp, #0x80]
 4671578: a90967fa     	stp	x26, x25, [sp, #0x90]
 467157c: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 4671580: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 4671584: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 4671588: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 467158c: 910343fd     	add	x29, sp, #0xd0
 4671590: aa0603fb     	mov	x27, x6
 4671594: aa0503f7     	mov	x23, x5
 4671598: aa0403f8     	mov	x24, x4
 467159c: aa0303f9     	mov	x25, x3
 46715a0: aa0203fa     	mov	x26, x2
 46715a4: aa0103fc     	mov	x28, x1
 46715a8: aa0003f3     	mov	x19, x0
 46715ac: b00505d5     	adrp	x21, 0xe72a000 <dyld_stub_binder+0xe72a000>
 46715b0: 911742b5     	add	x21, x21, #0x5d0
 46715b4: 911182a8     	add	x8, x21, #0x460
 46715b8: a9002015     	stp	x21, x8, [x0]
 46715bc: 911222a8     	add	x8, x21, #0x488
 46715c0: f9000808     	str	x8, [x0, #0x10]
 46715c4: 911302a8     	add	x8, x21, #0x4c0
 46715c8: 9113c2a9     	add	x9, x21, #0x4f0
 46715cc: a906a408     	stp	x8, x9, [x0, #0x68]
 46715d0: 911502a8     	add	x8, x21, #0x540
 46715d4: f9005808     	str	x8, [x0, #0xb0]
 46715d8: 911682a8     	add	x8, x21, #0x5a0
 46715dc: aa0003e9     	mov	x9, x0
 46715e0: f80d8d28     	str	x8, [x9, #0xd8]!
 46715e4: f90007e9     	str	x9, [sp, #0x8]
 46715e8: 911742a8     	add	x8, x21, #0x5d0
 46715ec: aa0003f6     	mov	x22, x0
 46715f0: f80f8ec8     	str	x8, [x22, #0xf8]!
 46715f4: 9117e2a8     	add	x8, x21, #0x5f8
 46715f8: f9018808     	str	x8, [x0, #0x310]
 46715fc: 9119e2a8     	add	x8, x21, #0x678
 4671600: f9018c08     	str	x8, [x0, #0x318]
 4671604: 911ce2a8     	add	x8, x21, #0x738
 4671608: f9019008     	str	x8, [x0, #0x320]
 467160c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4671610: b0052a14     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4671614: f9404689     	ldr	x9, [x20, #0x88]
 4671618: eb09011f     	cmp	x8, x9
 467161c: 54000061     	b.ne	0x4671628 <_ChromeMain+0x466c38c>
 4671620: aa1303e0     	mov	x0, x19
 4671624: 96e68b36     	bl	0x142fc <_ChromeMain+0xf060>
 4671628: 52800700     	mov	w0, #0x38               ; =56
 467162c: 96e6774f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4671630: 52800028     	mov	w8, #0x1                ; =1
 4671634: b9000008     	str	w8, [x0]
 4671638: d0ffca08     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 467163c: 91300108     	add	x8, x8, #0xc00
 4671640: 90ff9149     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 4671644: 912d0129     	add	x9, x9, #0xb40
 4671648: a900a408     	stp	x8, x9, [x0, #0x8]
 467164c: 90fef769     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 4671650: 912c0129     	add	x9, x9, #0xb00
 4671654: 10005368     	adr	x8, 0x46720c0 <_ChromeMain+0x466ce24>
 4671658: d503201f     	nop
 467165c: a901a009     	stp	x9, x8, [x0, #0x18]
 4671660: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4671664: f81a03a0     	stur	x0, [x29, #-0x60]
 4671668: 52800048     	mov	w8, #0x2                ; =2
 467166c: 381a83a8     	sturb	w8, [x29, #-0x58]
 4671670: d10183a1     	sub	x1, x29, #0x60
 4671674: aa1303e0     	mov	x0, x19
 4671678: 9733f382     	bl	0x136e480 <_ChromeMain+0x13691e4>
 467167c: 385a83a8     	ldurb	w8, [x29, #-0x58]
 4671680: 7103fd1f     	cmp	w8, #0xff
 4671684: 54000060     	b.eq	0x4671690 <_ChromeMain+0x466c3f4>
 4671688: f85a03a0     	ldur	x0, [x29, #-0x60]
 467168c: b5004800     	cbnz	x0, 0x4671f8c <_ChromeMain+0x466ccf0>
 4671690: 52801fe8     	mov	w8, #0xff               ; =255
 4671694: 381a83a8     	sturb	w8, [x29, #-0x58]
 4671698: 911182a8     	add	x8, x21, #0x460
 467169c: a9002275     	stp	x21, x8, [x19]
 46716a0: 911222a8     	add	x8, x21, #0x488
 46716a4: f9000a68     	str	x8, [x19, #0x10]
 46716a8: 911302a8     	add	x8, x21, #0x4c0
 46716ac: 9113c2a9     	add	x9, x21, #0x4f0
 46716b0: a906a668     	stp	x8, x9, [x19, #0x68]
 46716b4: 911502a8     	add	x8, x21, #0x540
 46716b8: f9005a68     	str	x8, [x19, #0xb0]
 46716bc: 911682a8     	add	x8, x21, #0x5a0
 46716c0: f9006e68     	str	x8, [x19, #0xd8]
 46716c4: 911742a8     	add	x8, x21, #0x5d0
 46716c8: f9007e68     	str	x8, [x19, #0xf8]
 46716cc: 9117e2a8     	add	x8, x21, #0x5f8
 46716d0: f9018a68     	str	x8, [x19, #0x310]
 46716d4: 9119e2a8     	add	x8, x21, #0x678
 46716d8: f9018e68     	str	x8, [x19, #0x318]
 46716dc: 911ce2a8     	add	x8, x21, #0x738
 46716e0: f9019268     	str	x8, [x19, #0x320]
 46716e4: f9400b88     	ldr	x8, [x28, #0x10]
 46716e8: 3dc00380     	ldr	q0, [x28]
 46716ec: 3d812e60     	str	q0, [x19, #0x4b0]
 46716f0: f9026268     	str	x8, [x19, #0x4c0]
 46716f4: a900ff9f     	stp	xzr, xzr, [x28, #0x8]
 46716f8: f900039f     	str	xzr, [x28]
 46716fc: 91132275     	add	x21, x19, #0x4c8
 4671700: f9401788     	ldr	x8, [x28, #0x28]
 4671704: 3cc18380     	ldur	q0, [x28, #0x18]
 4671708: 3d8002a0     	str	q0, [x21]
 467170c: f9026e68     	str	x8, [x19, #0x4d8]
 4671710: a9027f9f     	stp	xzr, xzr, [x28, #0x20]
 4671714: f9000f9f     	str	xzr, [x28, #0x18]
 4671718: 79406b88     	ldrh	w8, [x28, #0x34]
 467171c: b9403389     	ldr	w9, [x28, #0x30]
 4671720: b904e269     	str	w9, [x19, #0x4e0]
 4671724: 7909ca68     	strh	w8, [x19, #0x4e4]
 4671728: 3913a27f     	strb	wzr, [x19, #0x4e8]
 467172c: 3915827f     	strb	wzr, [x19, #0x560]
 4671730: 3942c388     	ldrb	w8, [x28, #0xb0]
 4671734: 340004a8     	cbz	w8, 0x46717c8 <_ChromeMain+0x466c52c>
 4671738: 9113a268     	add	x8, x19, #0x4e8
 467173c: 3cc38380     	ldur	q0, [x28, #0x38]
 4671740: f9402789     	ldr	x9, [x28, #0x48]
 4671744: f9000909     	str	x9, [x8, #0x10]
 4671748: 3d800100     	str	q0, [x8]
 467174c: a9047f9f     	stp	xzr, xzr, [x28, #0x40]
 4671750: f9001f9f     	str	xzr, [x28, #0x38]
 4671754: 3dc01780     	ldr	q0, [x28, #0x50]
 4671758: f9403388     	ldr	x8, [x28, #0x60]
 467175c: f9028a68     	str	x8, [x19, #0x510]
 4671760: 3d814260     	str	q0, [x19, #0x500]
 4671764: a905ff9f     	stp	xzr, xzr, [x28, #0x58]
 4671768: f9002b9f     	str	xzr, [x28, #0x50]
 467176c: 91146268     	add	x8, x19, #0x518
 4671770: 3cc68380     	ldur	q0, [x28, #0x68]
 4671774: f9403f89     	ldr	x9, [x28, #0x78]
 4671778: f9029669     	str	x9, [x19, #0x528]
 467177c: 3d800100     	str	q0, [x8]
 4671780: a9077f9f     	stp	xzr, xzr, [x28, #0x70]
 4671784: f900379f     	str	xzr, [x28, #0x68]
 4671788: 3dc02380     	ldr	q0, [x28, #0x80]
 467178c: f9404b88     	ldr	x8, [x28, #0x90]
 4671790: f902a268     	str	x8, [x19, #0x540]
 4671794: 3d814e60     	str	q0, [x19, #0x530]
 4671798: a9087f9f     	stp	xzr, xzr, [x28, #0x80]
 467179c: f9404f88     	ldr	x8, [x28, #0x98]
 46717a0: a9097f9f     	stp	xzr, xzr, [x28, #0x90]
 46717a4: f902a668     	str	x8, [x19, #0x548]
 46717a8: f9405388     	ldr	x8, [x28, #0xa0]
 46717ac: f900539f     	str	xzr, [x28, #0xa0]
 46717b0: f902aa68     	str	x8, [x19, #0x550]
 46717b4: f9405788     	ldr	x8, [x28, #0xa8]
 46717b8: f900579f     	str	xzr, [x28, #0xa8]
 46717bc: f902ae68     	str	x8, [x19, #0x558]
 46717c0: 52800028     	mov	w8, #0x1                ; =1
 46717c4: 39158268     	strb	w8, [x19, #0x560]
 46717c8: 3915a27b     	strb	w27, [x19, #0x568]
 46717cc: 9115a668     	add	x8, x19, #0x569
 46717d0: 7900011f     	strh	wzr, [x8]
 46717d4: b9056e7f     	str	wzr, [x19, #0x56c]
 46717d8: f902ba7a     	str	x26, [x19, #0x570]
 46717dc: f902be79     	str	x25, [x19, #0x578]
 46717e0: f902c278     	str	x24, [x19, #0x580]
 46717e4: f902c677     	str	x23, [x19, #0x588]
 46717e8: 91164277     	add	x23, x19, #0x590
 46717ec: 3917827f     	strb	wzr, [x19, #0x5e0]
 46717f0: f902f67f     	str	xzr, [x19, #0x5e8]
 46717f4: 6f00e400     	movi.2d	v0, #0000000000000000
 46717f8: 3d816660     	str	q0, [x19, #0x590]
 46717fc: 3d816a60     	str	q0, [x19, #0x5a0]
 4671800: 3d816e60     	str	q0, [x19, #0x5b0]
 4671804: 3d817260     	str	q0, [x19, #0x5c0]
 4671808: 3c8392e0     	stur	q0, [x23, #0x39]
 467180c: 39518268     	ldrb	w8, [x19, #0x460]
 4671810: 340000a8     	cbz	w8, 0x4671824 <_ChromeMain+0x466c588>
 4671814: 3911827f     	strb	wzr, [x19, #0x460]
 4671818: 91118261     	add	x1, x19, #0x460
 467181c: aa1603e0     	mov	x0, x22
 4671820: 9722d9ec     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4671824: f9424268     	ldr	x8, [x19, #0x480]
 4671828: 52800038     	mov	w24, #0x1               ; =1
 467182c: b9001918     	str	w24, [x8, #0x18]
 4671830: b9446668     	ldr	w8, [x19, #0x464]
 4671834: 7120011f     	cmp	w8, #0x800
 4671838: 540000e0     	b.eq	0x4671854 <_ChromeMain+0x466c5b8>
 467183c: 91119268     	add	x8, x19, #0x464
 4671840: 52810009     	mov	w9, #0x800              ; =2048
 4671844: b9000109     	str	w9, [x8]
 4671848: 91119261     	add	x1, x19, #0x464
 467184c: aa1603e0     	mov	x0, x22
 4671850: 9722d9e0     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4671854: 39072e78     	strb	w24, [x19, #0x1cb]
 4671858: 91132261     	add	x1, x19, #0x4c8
 467185c: aa1303e0     	mov	x0, x19
 4671860: 97075439     	bl	0x846944 <_ChromeMain+0x8416a8>
 4671864: f9416676     	ldr	x22, [x19, #0x2c8]
 4671868: b4003af6     	cbz	x22, 0x4671fc4 <_ChromeMain+0x466cd28>
 467186c: 39d37e68     	ldrsb	w8, [x19, #0x4df]
 4671870: 37f837a8     	tbnz	w8, #0x1f, 0x4671f64 <_ChromeMain+0x466ccc8>
 4671874: 3dc002a0     	ldr	q0, [x21]
 4671878: 3d8017e0     	str	q0, [sp, #0x50]
 467187c: f9400aa8     	ldr	x8, [x21, #0x10]
 4671880: f90033e8     	str	x8, [sp, #0x60]
 4671884: 910143e1     	add	x1, sp, #0x50
 4671888: aa1603e0     	mov	x0, x22
 467188c: 972bf013     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 4671890: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4671894: 36f800a8     	tbz	w8, #0x1f, 0x46718a8 <_ChromeMain+0x466c60c>
 4671898: f9402be0     	ldr	x0, [sp, #0x50]
 467189c: f94033e8     	ldr	x8, [sp, #0x60]
 46718a0: d37ff901     	lsl	x1, x8, #1
 46718a4: 96e65d85     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46718a8: aa1303e0     	mov	x0, x19
 46718ac: 52800021     	mov	w1, #0x1                ; =1
 46718b0: 973b17cb     	bl	0x15377dc <_ChromeMain+0x1532540>
 46718b4: 52802800     	mov	w0, #0x140              ; =320
 46718b8: 96e676ac     	bl	0xf368 <_ChromeMain+0xa0cc>
 46718bc: aa0003f6     	mov	x22, x0
 46718c0: 978e7b44     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 46718c4: aa1303e0     	mov	x0, x19
 46718c8: aa1603e1     	mov	x1, x22
 46718cc: 97545fdb     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 46718d0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 46718d4: f9404689     	ldr	x9, [x20, #0x88]
 46718d8: eb09011f     	cmp	x8, x9
 46718dc: 54000061     	b.ne	0x46718e8 <_ChromeMain+0x466c64c>
 46718e0: aa1603e0     	mov	x0, x22
 46718e4: 96e68a86     	bl	0x142fc <_ChromeMain+0xf060>
 46718e8: f94002e0     	ldr	x0, [x23]
 46718ec: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46718f0: f9404689     	ldr	x9, [x20, #0x88]
 46718f4: eb09011f     	cmp	x8, x9
 46718f8: 54000041     	b.ne	0x4671900 <_ChromeMain+0x466c664>
 46718fc: 96e6c450     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4671900: f90002f6     	str	x22, [x23]
 4671904: b940f2c8     	ldr	w8, [x22, #0xf0]
 4671908: 35003388     	cbnz	w8, 0x4671f78 <_ChromeMain+0x466ccdc>
 467190c: b90013f8     	str	w24, [sp, #0x10]
 4671910: 90051ca1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4671914: 9115a021     	add	x1, x1, #0x568
 4671918: 910462c0     	add	x0, x22, #0x118
 467191c: 910043e2     	add	x2, sp, #0x10
 4671920: 974fce21     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 4671924: 3943d2c8     	ldrb	w8, [x22, #0xf4]
 4671928: 370000a8     	tbnz	w8, #0x0, 0x467193c <_ChromeMain+0x466c6a0>
 467192c: 3903d2d8     	strb	w24, [x22, #0xf4]
 4671930: aa1603e0     	mov	x0, x22
 4671934: 52800021     	mov	w1, #0x1                ; =1
 4671938: 974fce5e     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 467193c: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4671940: 90051ca1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4671944: 91122021     	add	x1, x1, #0x488
 4671948: 910462c0     	add	x0, x22, #0x118
 467194c: 910043e2     	add	x2, sp, #0x10
 4671950: 9751f144     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4671954: f94002e0     	ldr	x0, [x23]
 4671958: b940f808     	ldr	w8, [x0, #0xf8]
 467195c: 7100191f     	cmp	w8, #0x6
 4671960: 54003241     	b.ne	0x4671fa8 <_ChromeMain+0x466cd0c>
 4671964: b940fc08     	ldr	w8, [x0, #0xfc]
 4671968: 7100211f     	cmp	w8, #0x8
 467196c: 540031e1     	b.ne	0x4671fa8 <_ChromeMain+0x466cd0c>
 4671970: b9410008     	ldr	w8, [x0, #0x100]
 4671974: 7100191f     	cmp	w8, #0x6
 4671978: 54003181     	b.ne	0x4671fa8 <_ChromeMain+0x466cd0c>
 467197c: b9410408     	ldr	w8, [x0, #0x104]
 4671980: 7100211f     	cmp	w8, #0x8
 4671984: 54003121     	b.ne	0x4671fa8 <_ChromeMain+0x466cd0c>
 4671988: 39539268     	ldrb	w8, [x19, #0x4e4]
 467198c: b00544d9     	adrp	x25, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4671990: 91120339     	add	x25, x25, #0x480
 4671994: 34000c68     	cbz	w8, 0x4671b20 <_ChromeMain+0x466c884>
 4671998: f8bfc320     	ldapr	x0, [x25]
 467199c: b40035c0     	cbz	x0, 0x4672054 <_ChromeMain+0x466cdb8>
 46719a0: 52807001     	mov	w1, #0x380              ; =896
 46719a4: d2800002     	mov	x2, #0x0                ; =0
 46719a8: 96e8e702     	bl	0xab5b0 <_ChromeMain+0xa6314>
 46719ac: aa0003f6     	mov	x22, x0
 46719b0: 9776ee22     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 46719b4: b0050208     	adrp	x8, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 46719b8: 912f4108     	add	x8, x8, #0xbd0
 46719bc: 910fc109     	add	x9, x8, #0x3f0
 46719c0: a9002408     	stp	x8, x9, [x0]
 46719c4: 91106109     	add	x9, x8, #0x418
 46719c8: f9000809     	str	x9, [x0, #0x10]
 46719cc: 9114c109     	add	x9, x8, #0x530
 46719d0: aa0003f7     	mov	x23, x0
 46719d4: f80d8ee9     	str	x9, [x23, #0xd8]!
 46719d8: 91114109     	add	x9, x8, #0x450
 46719dc: 9112010a     	add	x10, x8, #0x480
 46719e0: a906a809     	stp	x9, x10, [x0, #0x68]
 46719e4: 91158109     	add	x9, x8, #0x560
 46719e8: aa0003f8     	mov	x24, x0
 46719ec: f80f8f09     	str	x9, [x24, #0xf8]!
 46719f0: 91134108     	add	x8, x8, #0x4d0
 46719f4: f9005808     	str	x8, [x0, #0xb0]
 46719f8: f901a41f     	str	xzr, [x0, #0x348]
 46719fc: 2f06e400     	movi	d0, #0xffff000000000000
 4671a00: fd01a800     	str	d0, [x0, #0x350]
 4671a04: 52800028     	mov	w8, #0x1                ; =1
 4671a08: 390d6008     	strb	w8, [x0, #0x358]
 4671a0c: f901b01f     	str	xzr, [x0, #0x360]
 4671a10: 390da01f     	strb	wzr, [x0, #0x368]
 4671a14: f901b81f     	str	xzr, [x0, #0x370]
 4671a18: b903781f     	str	wzr, [x0, #0x378]
 4671a1c: 390df01f     	strb	wzr, [x0, #0x37c]
 4671a20: 3945a408     	ldrb	w8, [x0, #0x169]
 4671a24: 35002f28     	cbnz	w8, 0x4672008 <_ChromeMain+0x466cd6c>
 4671a28: f940ce62     	ldr	x2, [x19, #0x198]
 4671a2c: aa1303e0     	mov	x0, x19
 4671a30: aa1603e1     	mov	x1, x22
 4671a34: 97041e72     	bl	0x7793fc <_ChromeMain+0x774160>
 4671a38: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 4671a3c: 340000a8     	cbz	w8, 0x4671a50 <_ChromeMain+0x466c7b4>
 4671a40: 3906a6df     	strb	wzr, [x22, #0x1a9]
 4671a44: 9106a6c1     	add	x1, x22, #0x1a9
 4671a48: aa1803e0     	mov	x0, x24
 4671a4c: 9722d961     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4671a50: 910c42c8     	add	x8, x22, #0x310
 4671a54: 394c62c9     	ldrb	w9, [x22, #0x318]
 4671a58: 350030c9     	cbnz	w9, 0x4672070 <_ChromeMain+0x466cdd4>
 4671a5c: b4002da8     	cbz	x8, 0x4672010 <_ChromeMain+0x466cd74>
 4671a60: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 4671a64: f9018ac8     	str	x8, [x22, #0x310]
 4671a68: 52800028     	mov	w8, #0x1                ; =1
 4671a6c: 390c62c8     	strb	w8, [x22, #0x318]
 4671a70: f940c6c0     	ldr	x0, [x22, #0x188]
 4671a74: b40000a0     	cbz	x0, 0x4671a88 <_ChromeMain+0x466c7ec>
 4671a78: f9400008     	ldr	x8, [x0]
 4671a7c: f9417d08     	ldr	x8, [x8, #0x2f8]
 4671a80: aa1603e1     	mov	x1, x22
 4671a84: d63f0100     	blr	x8
 4671a88: aa1603e0     	mov	x0, x22
 4671a8c: 52800001     	mov	w1, #0x0                ; =0
 4671a90: 96fefa79     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4671a94: f9000bf6     	str	x22, [sp, #0x10]
 4671a98: 9104c2c0     	add	x0, x22, #0x130
 4671a9c: 910043e3     	add	x3, sp, #0x10
 4671aa0: 52800301     	mov	w1, #0x18               ; =24
 4671aa4: 52800022     	mov	w2, #0x1                ; =1
 4671aa8: 9708d5ca     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 4671aac: aa1603e0     	mov	x0, x22
 4671ab0: 972f940e     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 4671ab4: aa1603e0     	mov	x0, x22
 4671ab8: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 4671abc: 52800022     	mov	w2, #0x1                ; =1
 4671ac0: 97857fe8     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4671ac4: 52801d88     	mov	w8, #0xec               ; =236
 4671ac8: b9004be8     	str	w8, [sp, #0x48]
 4671acc: 390133ff     	strb	wzr, [sp, #0x4c]
 4671ad0: 90051b20     	adrp	x0, 0xe9d5000 <dyld_stub_binder+0xe9d5000>
 4671ad4: 91122000     	add	x0, x0, #0x488
 4671ad8: 910043e8     	add	x8, sp, #0x10
 4671adc: 910123e1     	add	x1, sp, #0x48
 4671ae0: 52800202     	mov	w2, #0x10               ; =16
 4671ae4: d2800003     	mov	x3, #0x0                ; =0
 4671ae8: 971e0b8e     	bl	0xdf4920 <_ChromeMain+0xdef684>
 4671aec: 910043e1     	add	x1, sp, #0x10
 4671af0: aa1603e0     	mov	x0, x22
 4671af4: 96fcbd6b     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4671af8: 910043e0     	add	x0, sp, #0x10
 4671afc: 97075351     	bl	0x846840 <_ChromeMain+0x8415a4>
 4671b00: f004c668     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4671b04: 3dc2a500     	ldr	q0, [x8, #0xa90]
 4671b08: 3d8007e0     	str	q0, [sp, #0x10]
 4671b0c: 90051ca1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4671b10: 91122021     	add	x1, x1, #0x488
 4671b14: 910043e2     	add	x2, sp, #0x10
 4671b18: aa1703e0     	mov	x0, x23
 4671b1c: 9751f0d1     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4671b20: f8bfc320     	ldapr	x0, [x25]
 4671b24: b40026a0     	cbz	x0, 0x4671ff8 <_ChromeMain+0x466cd5c>
 4671b28: 52808c01     	mov	w1, #0x460              ; =1120
 4671b2c: d2800002     	mov	x2, #0x0                ; =0
 4671b30: 96e8e6a0     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4671b34: aa0003f6     	mov	x22, x0
 4671b38: 39937e62     	ldrsb	x2, [x19, #0x4df]
 4671b3c: b6f80062     	tbz	x2, #0x3f, 0x4671b48 <_ChromeMain+0x466c8ac>
 4671b40: f9426675     	ldr	x21, [x19, #0x4c8]
 4671b44: f9426a62     	ldr	x2, [x19, #0x4d0]
 4671b48: aa1603e0     	mov	x0, x22
 4671b4c: aa1503e1     	mov	x1, x21
 4671b50: 528000a3     	mov	w3, #0x5                ; =5
 4671b54: 52820004     	mov	w4, #0x1000             ; =4096
 4671b58: 52800005     	mov	w5, #0x0                ; =0
 4671b5c: 97546361     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4671b60: 3945a6c8     	ldrb	w8, [x22, #0x169]
 4671b64: 35002588     	cbnz	w8, 0x4672014 <_ChromeMain+0x466cd78>
 4671b68: f940ce62     	ldr	x2, [x19, #0x198]
 4671b6c: aa1303e0     	mov	x0, x19
 4671b70: aa1603e1     	mov	x1, x22
 4671b74: 97041e22     	bl	0x7793fc <_ChromeMain+0x774160>
 4671b78: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4671b7c: f9404689     	ldr	x9, [x20, #0x88]
 4671b80: eb09011f     	cmp	x8, x9
 4671b84: 54000061     	b.ne	0x4671b90 <_ChromeMain+0x466c8f4>
 4671b88: aa1603e0     	mov	x0, x22
 4671b8c: 96e689dc     	bl	0x142fc <_ChromeMain+0xf060>
 4671b90: f942ce60     	ldr	x0, [x19, #0x598]
 4671b94: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4671b98: f9404689     	ldr	x9, [x20, #0x88]
 4671b9c: eb09011f     	cmp	x8, x9
 4671ba0: 54000041     	b.ne	0x4671ba8 <_ChromeMain+0x466c90c>
 4671ba4: 96e6c3a6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4671ba8: f902ce76     	str	x22, [x19, #0x598]
 4671bac: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 4671bb0: 340000c8     	cbz	w8, 0x4671bc8 <_ChromeMain+0x466c92c>
 4671bb4: 3906a6df     	strb	wzr, [x22, #0x1a9]
 4671bb8: 9103e2c0     	add	x0, x22, #0xf8
 4671bbc: 9106a6c1     	add	x1, x22, #0x1a9
 4671bc0: 9722d904     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4671bc4: f942ce76     	ldr	x22, [x19, #0x598]
 4671bc8: aa1603e0     	mov	x0, x22
 4671bcc: 52800061     	mov	w1, #0x3                ; =3
 4671bd0: 9754604c     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 4671bd4: f942ce60     	ldr	x0, [x19, #0x598]
 4671bd8: 528000c1     	mov	w1, #0x6                ; =6
 4671bdc: 96fcbc59     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 4671be0: f942ce75     	ldr	x21, [x19, #0x598]
 4671be4: 394edaa8     	ldrb	w8, [x21, #0x3b6]
 4671be8: 35001a88     	cbnz	w8, 0x4671f38 <_ChromeMain+0x466cc9c>
 4671bec: aa1503e0     	mov	x0, x21
 4671bf0: 52800001     	mov	w1, #0x0                ; =0
 4671bf4: 978335df     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 4671bf8: f942ce60     	ldr	x0, [x19, #0x598]
 4671bfc: b90043ff     	str	wzr, [sp, #0x40]
 4671c00: 52800028     	mov	w8, #0x1                ; =1
 4671c04: 390113e8     	strb	w8, [sp, #0x44]
 4671c08: 910103e1     	add	x1, sp, #0x40
 4671c0c: 97075ab9     	bl	0x8486f0 <_ChromeMain+0x843454>
 4671c10: f942ce75     	ldr	x21, [x19, #0x598]
 4671c14: f941aeb7     	ldr	x23, [x21, #0x358]
 4671c18: f94026f6     	ldr	x22, [x23, #0x48]
 4671c1c: b94046c8     	ldr	w8, [x22, #0x44]
 4671c20: 3100051f     	cmn	w8, #0x1
 4671c24: 540021c0     	b.eq	0x467205c <_ChromeMain+0x466cdc0>
 4671c28: 528001c9     	mov	w9, #0xe                ; =14
 4671c2c: 4b080121     	sub	w1, w9, w8
 4671c30: aa1603e0     	mov	x0, x22
 4671c34: 52800002     	mov	w2, #0x0                ; =0
 4671c38: 52803203     	mov	w3, #0x190              ; =400
 4671c3c: 9758d691     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 4671c40: f9000be0     	str	x0, [sp, #0x10]
 4671c44: b40000a0     	cbz	x0, 0x4671c58 <_ChromeMain+0x466c9bc>
 4671c48: b9400008     	ldr	w8, [x0]
 4671c4c: 31000508     	adds	w8, w8, #0x1
 4671c50: b9000008     	str	w8, [x0]
 4671c54: 54001e62     	b.hs	0x4672020 <_ChromeMain+0x466cd84>
 4671c58: f94002a8     	ldr	x8, [x21]
 4671c5c: f941ed08     	ldr	x8, [x8, #0x3d8]
 4671c60: 910043e1     	add	x1, sp, #0x10
 4671c64: aa1503e0     	mov	x0, x21
 4671c68: d63f0100     	blr	x8
 4671c6c: f9400be0     	ldr	x0, [sp, #0x10]
 4671c70: b40000c0     	cbz	x0, 0x4671c88 <_ChromeMain+0x466c9ec>
 4671c74: b9400009     	ldr	w9, [x0]
 4671c78: 51000528     	sub	w8, w9, #0x1
 4671c7c: b9000008     	str	w8, [x0]
 4671c80: 34001d69     	cbz	w9, 0x467202c <_ChromeMain+0x466cd90>
 4671c84: 340014a8     	cbz	w8, 0x4671f18 <_ChromeMain+0x466cc7c>
 4671c88: f942ce75     	ldr	x21, [x19, #0x598]
 4671c8c: 52800800     	mov	w0, #0x40               ; =64
 4671c90: 96e675b6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4671c94: 52800028     	mov	w8, #0x1                ; =1
 4671c98: b9000008     	str	w8, [x0]
 4671c9c: d0fe4da8     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 4671ca0: 91260108     	add	x8, x8, #0x980
 4671ca4: b0fde409     	adrp	x9, 0x2f2000 <_ChromeMain+0x2ecd64>
 4671ca8: 91220129     	add	x9, x9, #0x880
 4671cac: a900a408     	stp	x8, x9, [x0, #0x8]
 4671cb0: b0ffa5a8     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 4671cb4: 91310108     	add	x8, x8, #0xc40
 4671cb8: 90fef769     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 4671cbc: 912c0129     	add	x9, x9, #0xb00
 4671cc0: a901a009     	stp	x9, x8, [x0, #0x18]
 4671cc4: d004c668     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4671cc8: 3dc3d900     	ldr	q0, [x8, #0xf60]
 4671ccc: 3c828000     	stur	q0, [x0, #0x28]
 4671cd0: 3900e01f     	strb	wzr, [x0, #0x38]
 4671cd4: f9000be0     	str	x0, [sp, #0x10]
 4671cd8: 0f000420     	movi.2s	v0, #0x1
 4671cdc: fd000fe0     	str	d0, [sp, #0x18]
 4671ce0: 52800068     	mov	w8, #0x3                ; =3
 4671ce4: b90023e8     	str	w8, [sp, #0x20]
 4671ce8: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 4671cec: f90017ff     	str	xzr, [sp, #0x28]
 4671cf0: 90051ca1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4671cf4: 91152021     	add	x1, x1, #0x548
 4671cf8: 910362a0     	add	x0, x21, #0xd8
 4671cfc: 910043e2     	add	x2, sp, #0x10
 4671d00: 975689a3     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 4671d04: 910043e0     	add	x0, sp, #0x10
 4671d08: 97436407     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 4671d0c: f8bfc320     	ldapr	x0, [x25]
 4671d10: b4001780     	cbz	x0, 0x4672000 <_ChromeMain+0x466cd64>
 4671d14: 52806201     	mov	w1, #0x310              ; =784
 4671d18: d2800002     	mov	x2, #0x0                ; =0
 4671d1c: 96e8e625     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4671d20: aa0003f5     	mov	x21, x0
 4671d24: 9733f507     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4671d28: 3945a408     	ldrb	w8, [x0, #0x169]
 4671d2c: 35001868     	cbnz	w8, 0x4672038 <_ChromeMain+0x466cd9c>
 4671d30: f940ce62     	ldr	x2, [x19, #0x198]
 4671d34: aa1303e0     	mov	x0, x19
 4671d38: aa1503e1     	mov	x1, x21
 4671d3c: 97041db0     	bl	0x7793fc <_ChromeMain+0x774160>
 4671d40: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4671d44: f9404689     	ldr	x9, [x20, #0x88]
 4671d48: eb09011f     	cmp	x8, x9
 4671d4c: 54000061     	b.ne	0x4671d58 <_ChromeMain+0x466cabc>
 4671d50: aa1503e0     	mov	x0, x21
 4671d54: 96e6896a     	bl	0x142fc <_ChromeMain+0xf060>
 4671d58: f942d260     	ldr	x0, [x19, #0x5a0]
 4671d5c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4671d60: f9404689     	ldr	x9, [x20, #0x88]
 4671d64: eb09011f     	cmp	x8, x9
 4671d68: 54000041     	b.ne	0x4671d70 <_ChromeMain+0x466cad4>
 4671d6c: 96e6c334     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4671d70: f902d275     	str	x21, [x19, #0x5a0]
 4671d74: 52802800     	mov	w0, #0x140              ; =320
 4671d78: 96e6757c     	bl	0xf368 <_ChromeMain+0xa0cc>
 4671d7c: aa0003f6     	mov	x22, x0
 4671d80: 978e7a14     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4671d84: aa1503e0     	mov	x0, x21
 4671d88: aa1603e1     	mov	x1, x22
 4671d8c: 97545eab     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4671d90: b940f2c8     	ldr	w8, [x22, #0xf0]
 4671d94: 35000b88     	cbnz	w8, 0x4671f04 <_ChromeMain+0x466cc68>
 4671d98: 52800034     	mov	w20, #0x1               ; =1
 4671d9c: b90013f4     	str	w20, [sp, #0x10]
 4671da0: 90051ca1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4671da4: 9115a021     	add	x1, x1, #0x568
 4671da8: 910462c0     	add	x0, x22, #0x118
 4671dac: 910043e2     	add	x2, sp, #0x10
 4671db0: 974fccfd     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 4671db4: 3943d2c8     	ldrb	w8, [x22, #0xf4]
 4671db8: 370000a8     	tbnz	w8, #0x0, 0x4671dcc <_ChromeMain+0x466cb30>
 4671dbc: 3903d2d4     	strb	w20, [x22, #0xf4]
 4671dc0: aa1603e0     	mov	x0, x22
 4671dc4: 52800021     	mov	w1, #0x1                ; =1
 4671dc8: 974fcd3a     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4671dcc: 52800700     	mov	w0, #0x38               ; =56
 4671dd0: 96fa46bc     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4671dd4: aa0003f5     	mov	x21, x0
 4671dd8: 52800600     	mov	w0, #0x30               ; =48
 4671ddc: 96e67563     	bl	0xf368 <_ChromeMain+0xa0cc>
 4671de0: aa0003e4     	mov	x4, x0
 4671de4: 0ab57ea8     	bic	w8, w21, w21, asr #31
 4671de8: 1e230100     	ucvtf	s0, w8
 4671dec: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4671df0: b004e6f6     	adrp	x22, 0xe34e000 <dyld_stub_binder+0xe34e000>
 4671df4: 913622d6     	add	x22, x22, #0xd88
 4671df8: 7900301f     	strh	wzr, [x0, #0x18]
 4671dfc: f9000016     	str	x22, [x0]
 4671e00: 4e040400     	dup.4s	v0, v0[0]
 4671e04: 3c81c000     	stur	q0, [x0, #0x1c]
 4671e08: 90051ca1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4671e0c: 9114a021     	add	x1, x1, #0x528
 4671e10: 9004b6a2     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 4671e14: 91264842     	add	x2, x2, #0x992
 4671e18: f0ff3fc3     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 4671e1c: 913c0063     	add	x3, x3, #0xf00
 4671e20: f94007e0     	ldr	x0, [sp, #0x8]
 4671e24: d2800005     	mov	x5, #0x0                ; =0
 4671e28: 9713e0dd     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 4671e2c: b50007e0     	cbnz	x0, 0x4671f28 <_ChromeMain+0x466cc8c>
 4671e30: aa1303e0     	mov	x0, x19
 4671e34: 9733f403     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 4671e38: aa1303e9     	mov	x9, x19
 4671e3c: f84e8d28     	ldr	x8, [x9, #0xe8]!
 4671e40: b4000128     	cbz	x8, 0x4671e64 <_ChromeMain+0x466cbc8>
 4671e44: f0051c8a     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 4671e48: 9132c14a     	add	x10, x10, #0xcb0
 4671e4c: f940110b     	ldr	x11, [x8, #0x20]
 4671e50: eb0a017f     	cmp	x11, x10
 4671e54: 54000528     	b.hi	0x4671ef8 <_ChromeMain+0x466cc5c>
 4671e58: 54000482     	b.hs	0x4671ee8 <_ChromeMain+0x466cc4c>
 4671e5c: f9400508     	ldr	x8, [x8, #0x8]
 4671e60: b5ffff68     	cbnz	x8, 0x4671e4c <_ChromeMain+0x466cbb0>
 4671e64: d2800014     	mov	x20, #0x0               ; =0
 4671e68: 52800700     	mov	w0, #0x38               ; =56
 4671e6c: 96fa4695     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4671e70: aa0003f5     	mov	x21, x0
 4671e74: 52800600     	mov	w0, #0x30               ; =48
 4671e78: 96e6753c     	bl	0xf368 <_ChromeMain+0xa0cc>
 4671e7c: aa0003e8     	mov	x8, x0
 4671e80: 0ab57ea9     	bic	w9, w21, w21, asr #31
 4671e84: 1e230120     	ucvtf	s0, w9
 4671e88: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4671e8c: 7900301f     	strh	wzr, [x0, #0x18]
 4671e90: f9000016     	str	x22, [x0]
 4671e94: 4e040400     	dup.4s	v0, v0[0]
 4671e98: 3c81c000     	stur	q0, [x0, #0x1c]
 4671e9c: f9418e80     	ldr	x0, [x20, #0x318]
 4671ea0: f9018e88     	str	x8, [x20, #0x318]
 4671ea4: b5000d00     	cbnz	x0, 0x4672044 <_ChromeMain+0x466cda8>
 4671ea8: aa1403e0     	mov	x0, x20
 4671eac: 52800001     	mov	w1, #0x0                ; =0
 4671eb0: 96fef971     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4671eb4: aa1403e0     	mov	x0, x20
 4671eb8: 96fcbcb1     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4671ebc: aa1303e0     	mov	x0, x19
 4671ec0: 940000c0     	bl	0x46721c0 <_ChromeMain+0x466cf24>
 4671ec4: aa1303e0     	mov	x0, x19
 4671ec8: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 4671ecc: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 4671ed0: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 4671ed4: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 4671ed8: a94967fa     	ldp	x26, x25, [sp, #0x90]
 4671edc: a9486ffc     	ldp	x28, x27, [sp, #0x80]
 4671ee0: 910383ff     	add	sp, sp, #0xe0
 4671ee4: d65f03c0     	ret
 4671ee8: eb09011f     	cmp	x8, x9
 4671eec: 54fffbc0     	b.eq	0x4671e64 <_ChromeMain+0x466cbc8>
 4671ef0: f9401914     	ldr	x20, [x8, #0x30]
 4671ef4: 17ffffdd     	b	0x4671e68 <_ChromeMain+0x466cbcc>
 4671ef8: f9400108     	ldr	x8, [x8]
 4671efc: b5fffa88     	cbnz	x8, 0x4671e4c <_ChromeMain+0x466cbb0>
 4671f00: 17ffffd9     	b	0x4671e64 <_ChromeMain+0x466cbc8>
 4671f04: b900f2df     	str	wzr, [x22, #0xf0]
 4671f08: aa1603e0     	mov	x0, x22
 4671f0c: 52800021     	mov	w1, #0x1                ; =1
 4671f10: 974fcce8     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4671f14: 17ffffa1     	b	0x4671d98 <_ChromeMain+0x466cafc>
 4671f18: 972b6a2b     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4671f1c: 52800a01     	mov	w1, #0x50               ; =80
 4671f20: 96e65be6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4671f24: 17ffff59     	b	0x4671c88 <_ChromeMain+0x466c9ec>
 4671f28: f9400008     	ldr	x8, [x0]
 4671f2c: f9400508     	ldr	x8, [x8, #0x8]
 4671f30: d63f0100     	blr	x8
 4671f34: 17ffffbf     	b	0x4671e30 <_ChromeMain+0x466cb94>
 4671f38: 390edabf     	strb	wzr, [x21, #0x3b6]
 4671f3c: aa1503e0     	mov	x0, x21
 4671f40: 9722d8f2     	bl	0xf28308 <_ChromeMain+0xf2306c>
 4671f44: aa1503e0     	mov	x0, x21
 4671f48: 52800041     	mov	w1, #0x2                ; =2
 4671f4c: 9705be86     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4671f50: 9103e2a0     	add	x0, x21, #0xf8
 4671f54: 910edaa1     	add	x1, x21, #0x3b6
 4671f58: 9722d81e     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4671f5c: f942ce75     	ldr	x21, [x19, #0x598]
 4671f60: 17ffff23     	b	0x4671bec <_ChromeMain+0x466c950>
 4671f64: f9426661     	ldr	x1, [x19, #0x4c8]
 4671f68: f9426a62     	ldr	x2, [x19, #0x4d0]
 4671f6c: 910143e0     	add	x0, sp, #0x50
 4671f70: 96e75318     	bl	0x46bd0 <_ChromeMain+0x41934>
 4671f74: 17fffe44     	b	0x4671884 <_ChromeMain+0x466c5e8>
 4671f78: b900f2df     	str	wzr, [x22, #0xf0]
 4671f7c: aa1603e0     	mov	x0, x22
 4671f80: 52800021     	mov	w1, #0x1                ; =1
 4671f84: 974fcccb     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4671f88: 17fffe61     	b	0x467190c <_ChromeMain+0x466c670>
 4671f8c: 12800008     	mov	w8, #-0x1               ; =-1
 4671f90: b8e80008     	ldaddal	w8, w8, [x0]
 4671f94: 7100051f     	cmp	w8, #0x1
 4671f98: 54ffb7c1     	b.ne	0x4671690 <_ChromeMain+0x466c3f4>
 4671f9c: f9400808     	ldr	x8, [x0, #0x10]
 4671fa0: d63f0100     	blr	x8
 4671fa4: 17fffdbb     	b	0x4671690 <_ChromeMain+0x466c3f4>
 4671fa8: d28000c8     	mov	x8, #0x6                ; =6
 4671fac: f2c00108     	movk	x8, #0x8, lsl #32
 4671fb0: 4e080d00     	dup.2d	v0, x8
 4671fb4: 3c8f8000     	stur	q0, [x0, #0xf8]
 4671fb8: 52800021     	mov	w1, #0x1                ; =1
 4671fbc: 974fccbd     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4671fc0: 17fffe72     	b	0x4671988 <_ChromeMain+0x466c6ec>
 4671fc4: 9721d04f     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4671fc8: 350005a0     	cbnz	w0, 0x467207c <_ChromeMain+0x466cde0>
 4671fcc: aa1303e0     	mov	x0, x19
 4671fd0: 9731b1a1     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4671fd4: aa0003f6     	mov	x22, x0
 4671fd8: f9416660     	ldr	x0, [x19, #0x2c8]
 4671fdc: f9016676     	str	x22, [x19, #0x2c8]
 4671fe0: b4ffc460     	cbz	x0, 0x467186c <_ChromeMain+0x466c5d0>
 4671fe4: f9400008     	ldr	x8, [x0]
 4671fe8: f9400508     	ldr	x8, [x8, #0x8]
 4671fec: d63f0100     	blr	x8
 4671ff0: f9416676     	ldr	x22, [x19, #0x2c8]
 4671ff4: 17fffe1e     	b	0x467186c <_ChromeMain+0x466c5d0>
 4671ff8: 97f185c0     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4671ffc: 17fffecb     	b	0x4671b28 <_ChromeMain+0x466c88c>
 4672000: 97f185be     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4672004: 17ffff44     	b	0x4671d14 <_ChromeMain+0x466ca78>
 4672008: d4200000     	brk	#0
 467200c: d4400000     	hlt	#0
 4672010: d4200020     	brk	#0x1
 4672014: d4200000     	brk	#0
 4672018: d4400000     	hlt	#0
 467201c: d4200020     	brk	#0x1
 4672020: d4200000     	brk	#0
 4672024: d4400000     	hlt	#0
 4672028: d4200020     	brk	#0x1
 467202c: d4200000     	brk	#0
 4672030: d4400000     	hlt	#0
 4672034: d4200020     	brk	#0x1
 4672038: d4200000     	brk	#0
 467203c: d4400000     	hlt	#0
 4672040: d4200020     	brk	#0x1
 4672044: f9400008     	ldr	x8, [x0]
 4672048: f9400508     	ldr	x8, [x8, #0x8]
 467204c: d63f0100     	blr	x8
 4672050: 17ffff96     	b	0x4671ea8 <_ChromeMain+0x466cc0c>
 4672054: 97f185a9     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4672058: 17fffe52     	b	0x46719a0 <_ChromeMain+0x466c704>
 467205c: aa1603e0     	mov	x0, x22
 4672060: 976ed038     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4672064: b94046c8     	ldr	w8, [x22, #0x44]
 4672068: f94026f6     	ldr	x22, [x23, #0x48]
 467206c: 17fffeef     	b	0x4671c28 <_ChromeMain+0x466c98c>
 4672070: b21c03e9     	mov	x9, #0x1000000010       ; =68719476752
 4672074: f9000109     	str	x9, [x8]
 4672078: 17fffe7e     	b	0x4671a70 <_ChromeMain+0x466c7d4>
 467207c: 52803600     	mov	w0, #0x1b0              ; =432
 4672080: 96e674ba     	bl	0xf368 <_ChromeMain+0xa0cc>
 4672084: aa0003f6     	mov	x22, x0
 4672088: aa1303e1     	mov	x1, x19
 467208c: 9721cebd     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4672090: 17ffffd2     	b	0x4671fd8 <_ChromeMain+0x466cd3c>
		...
 46720c0: d10183ff     	sub	sp, sp, #0x60
 46720c4: a9044ff4     	stp	x20, x19, [sp, #0x40]
 46720c8: a9057bfd     	stp	x29, x30, [sp, #0x50]
 46720cc: 910143fd     	add	x29, sp, #0x50
 46720d0: aa0003f3     	mov	x19, x0
 46720d4: 3955a008     	ldrb	w8, [x0, #0x568]
 46720d8: 37000248     	tbnz	w8, #0x0, 0x4672120 <_ChromeMain+0x466ce84>
 46720dc: b9400828     	ldr	w8, [x1, #0x8]
 46720e0: 321f0108     	orr	w8, w8, #0x2
 46720e4: 71000d1f     	cmp	w8, #0x3
 46720e8: 540001c1     	b.ne	0x4672120 <_ChromeMain+0x466ce84>
 46720ec: 39414828     	ldrb	w8, [x1, #0x52]
 46720f0: 7200051f     	tst	w8, #0x3
 46720f4: 54000160     	b.eq	0x4672120 <_ChromeMain+0x466ce84>
 46720f8: f942be68     	ldr	x8, [x19, #0x578]
 46720fc: b4000168     	cbz	x8, 0x4672128 <_ChromeMain+0x466ce8c>
 4672100: 39d31e68     	ldrsb	w8, [x19, #0x4c7]
 4672104: 37f80488     	tbnz	w8, #0x1f, 0x4672194 <_ChromeMain+0x466cef8>
 4672108: 9112c268     	add	x8, x19, #0x4b0
 467210c: 3dc00100     	ldr	q0, [x8]
 4672110: 3d800be0     	str	q0, [sp, #0x20]
 4672114: f9400908     	ldr	x8, [x8, #0x10]
 4672118: f9001be8     	str	x8, [sp, #0x30]
 467211c: 14000022     	b	0x46721a4 <_ChromeMain+0x466cf08>
 4672120: f942ba68     	ldr	x8, [x19, #0x570]
 4672124: b50000a8     	cbnz	x8, 0x4672138 <_ChromeMain+0x466ce9c>
 4672128: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 467212c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4672130: 910183ff     	add	sp, sp, #0x60
 4672134: d65f03c0     	ret
 4672138: 39d31e68     	ldrsb	w8, [x19, #0x4c7]
 467213c: 37f800e8     	tbnz	w8, #0x1f, 0x4672158 <_ChromeMain+0x466cebc>
 4672140: 9112c268     	add	x8, x19, #0x4b0
 4672144: 3dc00100     	ldr	q0, [x8]
 4672148: 3d8003e0     	str	q0, [sp]
 467214c: f9400908     	ldr	x8, [x8, #0x10]
 4672150: f9000be8     	str	x8, [sp, #0x10]
 4672154: 14000005     	b	0x4672168 <_ChromeMain+0x466cecc>
 4672158: f9425a61     	ldr	x1, [x19, #0x4b0]
 467215c: f9425e62     	ldr	x2, [x19, #0x4b8]
 4672160: 910003e0     	mov	x0, sp
 4672164: 96e6982d     	bl	0x18218 <_ChromeMain+0x12f7c>
 4672168: 910003f4     	mov	x20, sp
 467216c: 9115c260     	add	x0, x19, #0x570
 4672170: 910003e1     	mov	x1, sp
 4672174: 97c98193     	bl	0x38d27c0 <_ChromeMain+0x38cd524>
 4672178: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 467217c: 36fffd68     	tbz	w8, #0x1f, 0x4672128 <_ChromeMain+0x466ce8c>
 4672180: f9400280     	ldr	x0, [x20]
 4672184: f9400a88     	ldr	x8, [x20, #0x10]
 4672188: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 467218c: 96e65b4b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4672190: 17ffffe6     	b	0x4672128 <_ChromeMain+0x466ce8c>
 4672194: f9425a61     	ldr	x1, [x19, #0x4b0]
 4672198: f9425e62     	ldr	x2, [x19, #0x4b8]
 467219c: 910083e0     	add	x0, sp, #0x20
 46721a0: 96e6981e     	bl	0x18218 <_ChromeMain+0x12f7c>
 46721a4: 910083f4     	add	x20, sp, #0x20
 46721a8: 9115e260     	add	x0, x19, #0x578
 46721ac: 910083e1     	add	x1, sp, #0x20
 46721b0: 97c98184     	bl	0x38d27c0 <_ChromeMain+0x38cd524>
 46721b4: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 46721b8: 36fffb88     	tbz	w8, #0x1f, 0x4672128 <_ChromeMain+0x466ce8c>
 46721bc: 17fffff1     	b	0x4672180 <_ChromeMain+0x466cee4>
 46721c0: d10343ff     	sub	sp, sp, #0xd0
 46721c4: a9076ffc     	stp	x28, x27, [sp, #0x70]
 46721c8: a90867fa     	stp	x26, x25, [sp, #0x80]
 46721cc: a9095ff8     	stp	x24, x23, [sp, #0x90]
 46721d0: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 46721d4: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 46721d8: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 46721dc: 910303fd     	add	x29, sp, #0xc0
 46721e0: aa0003f3     	mov	x19, x0
 46721e4: f942c800     	ldr	x0, [x0, #0x590]
 46721e8: b940f808     	ldr	w8, [x0, #0xf8]
 46721ec: 7100191f     	cmp	w8, #0x6
 46721f0: 54000481     	b.ne	0x4672280 <_ChromeMain+0x466cfe4>
 46721f4: b940fc08     	ldr	w8, [x0, #0xfc]
 46721f8: 7100211f     	cmp	w8, #0x8
 46721fc: 54000421     	b.ne	0x4672280 <_ChromeMain+0x466cfe4>
 4672200: b9410008     	ldr	w8, [x0, #0x100]
 4672204: 7100191f     	cmp	w8, #0x6
 4672208: 540003c1     	b.ne	0x4672280 <_ChromeMain+0x466cfe4>
 467220c: b9410408     	ldr	w8, [x0, #0x104]
 4672210: 7100211f     	cmp	w8, #0x8
 4672214: 54000361     	b.ne	0x4672280 <_ChromeMain+0x466cfe4>
 4672218: f942ce60     	ldr	x0, [x19, #0x598]
 467221c: f941ac0a     	ldr	x10, [x0, #0x358]
 4672220: 3980bd48     	ldrsb	x8, [x10, #0x2f]
 4672224: b7f802a8     	tbnz	x8, #0x3f, 0x4672278 <_ChromeMain+0x466cfdc>
 4672228: 91006149     	add	x9, x10, #0x18
 467222c: 91132261     	add	x1, x19, #0x4c8
 4672230: 39937e62     	ldrsb	x2, [x19, #0x4df]
 4672234: b7f801c2     	tbnz	x2, #0x3f, 0x467226c <_ChromeMain+0x466cfd0>
 4672238: 9113226a     	add	x10, x19, #0x4c8
 467223c: aa0203eb     	mov	x11, x2
 4672240: eb0b011f     	cmp	x8, x11
 4672244: 540002c1     	b.ne	0x467229c <_ChromeMain+0x466d000>
 4672248: b40000e8     	cbz	x8, 0x4672264 <_ChromeMain+0x466cfc8>
 467224c: 7840252b     	ldrh	w11, [x9], #0x2
 4672250: 7840254c     	ldrh	w12, [x10], #0x2
 4672254: 6b0b019f     	cmp	w12, w11
 4672258: 54000221     	b.ne	0x467229c <_ChromeMain+0x466d000>
 467225c: f1000508     	subs	x8, x8, #0x1
 4672260: 54ffff61     	b.ne	0x467224c <_ChromeMain+0x466cfb0>
 4672264: 5280003a     	mov	w26, #0x1               ; =1
 4672268: 14000015     	b	0x46722bc <_ChromeMain+0x466d020>
 467226c: f942666a     	ldr	x10, [x19, #0x4c8]
 4672270: f9426a6b     	ldr	x11, [x19, #0x4d0]
 4672274: 17fffff3     	b	0x4672240 <_ChromeMain+0x466cfa4>
 4672278: a941a149     	ldp	x9, x8, [x10, #0x18]
 467227c: 17ffffec     	b	0x467222c <_ChromeMain+0x466cf90>
 4672280: d28000c8     	mov	x8, #0x6                ; =6
 4672284: f2c00108     	movk	x8, #0x8, lsl #32
 4672288: 4e080d00     	dup.2d	v0, x8
 467228c: 3c8f8000     	stur	q0, [x0, #0xf8]
 4672290: 52800021     	mov	w1, #0x1                ; =1
 4672294: 974fcc07     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4672298: 17ffffe0     	b	0x4672218 <_ChromeMain+0x466cf7c>
 467229c: 36f80062     	tbz	w2, #0x1f, 0x46722a8 <_ChromeMain+0x466d00c>
 46722a0: f9426661     	ldr	x1, [x19, #0x4c8]
 46722a4: f9426a62     	ldr	x2, [x19, #0x4d0]
 46722a8: f9400008     	ldr	x8, [x0]
 46722ac: f941f108     	ldr	x8, [x8, #0x3e0]
 46722b0: d63f0100     	blr	x8
 46722b4: 5280001a     	mov	w26, #0x0               ; =0
 46722b8: f942ce60     	ldr	x0, [x19, #0x598]
 46722bc: 3955a268     	ldrb	w8, [x19, #0x568]
 46722c0: 370000e8     	tbnz	w8, #0x0, 0x46722dc <_ChromeMain+0x466d040>
 46722c4: 3955aa68     	ldrb	w8, [x19, #0x56a]
 46722c8: 52801c29     	mov	w9, #0xe1               ; =225
 46722cc: 52801baa     	mov	w10, #0xdd              ; =221
 46722d0: 7100011f     	cmp	w8, #0x0
 46722d4: 1a891148     	csel	w8, w10, w9, ne
 46722d8: 14000002     	b	0x46722e0 <_ChromeMain+0x466d044>
 46722dc: 52801bc8     	mov	w8, #0xde               ; =222
 46722e0: b90023e8     	str	w8, [sp, #0x20]
 46722e4: 390093ff     	strb	wzr, [sp, #0x24]
 46722e8: f9400008     	ldr	x8, [x0]
 46722ec: f941f508     	ldr	x8, [x8, #0x3e8]
 46722f0: 910083e1     	add	x1, sp, #0x20
 46722f4: d63f0100     	blr	x8
 46722f8: 3955a268     	ldrb	w8, [x19, #0x568]
 46722fc: 37000428     	tbnz	w8, #0x0, 0x4672380 <_ChromeMain+0x466d0e4>
 4672300: b943be68     	ldr	w8, [x19, #0x3bc]
 4672304: 34000188     	cbz	w8, 0x4672334 <_ChromeMain+0x466d098>
 4672308: f942d668     	ldr	x8, [x19, #0x5a8]
 467230c: b40013c8     	cbz	x8, 0x4672584 <_ChromeMain+0x466d2e8>
 4672310: 52800014     	mov	w20, #0x0               ; =0
 4672314: 52800016     	mov	w22, #0x0               ; =0
 4672318: 52800017     	mov	w23, #0x0               ; =0
 467231c: 52800018     	mov	w24, #0x0               ; =0
 4672320: 52800019     	mov	w25, #0x0               ; =0
 4672324: 5280003b     	mov	w27, #0x1               ; =1
 4672328: 52800035     	mov	w21, #0x1               ; =1
 467232c: 52800021     	mov	w1, #0x1                ; =1
 4672330: 1400001c     	b	0x46723a0 <_ChromeMain+0x466d104>
 4672334: 5280001b     	mov	w27, #0x0               ; =0
 4672338: b944e268     	ldr	w8, [x19, #0x4e0]
 467233c: 7100091f     	cmp	w8, #0x2
 4672340: 54000d0d     	b.le	0x46724e0 <_ChromeMain+0x466d244>
 4672344: 7100111f     	cmp	w8, #0x4
 4672348: 5400496c     	b.gt	0x4672c74 <_ChromeMain+0x466d9d8>
 467234c: 71000d1f     	cmp	w8, #0x3
 4672350: 54003f21     	b.ne	0x4672b34 <_ChromeMain+0x466d898>
 4672354: f942e268     	ldr	x8, [x19, #0x5c0]
 4672358: b40036a8     	cbz	x8, 0x4672a2c <_ChromeMain+0x466d790>
 467235c: 52800014     	mov	w20, #0x0               ; =0
 4672360: 52800016     	mov	w22, #0x0               ; =0
 4672364: 52800018     	mov	w24, #0x0               ; =0
 4672368: 52800019     	mov	w25, #0x0               ; =0
 467236c: 52800001     	mov	w1, #0x0                ; =0
 4672370: 52800035     	mov	w21, #0x1               ; =1
 4672374: 5280009b     	mov	w27, #0x4               ; =4
 4672378: 52800037     	mov	w23, #0x1               ; =1
 467237c: 14000009     	b	0x46723a0 <_ChromeMain+0x466d104>
 4672380: 5280001b     	mov	w27, #0x0               ; =0
 4672384: 52800015     	mov	w21, #0x0               ; =0
 4672388: 52800014     	mov	w20, #0x0               ; =0
 467238c: 52800016     	mov	w22, #0x0               ; =0
 4672390: 52800017     	mov	w23, #0x0               ; =0
 4672394: 52800018     	mov	w24, #0x0               ; =0
 4672398: 52800019     	mov	w25, #0x0               ; =0
 467239c: 52800001     	mov	w1, #0x0                ; =0
 46723a0: f942d660     	ldr	x0, [x19, #0x5a8]
 46723a4: b40000e0     	cbz	x0, 0x46723c0 <_ChromeMain+0x466d124>
 46723a8: 39472008     	ldrb	w8, [x0, #0x1c8]
 46723ac: 6b08003f     	cmp	w1, w8
 46723b0: 54000080     	b.eq	0x46723c0 <_ChromeMain+0x466d124>
 46723b4: f9400008     	ldr	x8, [x0]
 46723b8: f9405108     	ldr	x8, [x8, #0xa0]
 46723bc: d63f0100     	blr	x8
 46723c0: f942da60     	ldr	x0, [x19, #0x5b0]
 46723c4: b4000100     	cbz	x0, 0x46723e4 <_ChromeMain+0x466d148>
 46723c8: 39472008     	ldrb	w8, [x0, #0x1c8]
 46723cc: 6b08033f     	cmp	w25, w8
 46723d0: 540000a0     	b.eq	0x46723e4 <_ChromeMain+0x466d148>
 46723d4: f9400008     	ldr	x8, [x0]
 46723d8: f9405108     	ldr	x8, [x8, #0xa0]
 46723dc: aa1903e1     	mov	x1, x25
 46723e0: d63f0100     	blr	x8
 46723e4: f942de60     	ldr	x0, [x19, #0x5b8]
 46723e8: b4000100     	cbz	x0, 0x4672408 <_ChromeMain+0x466d16c>
 46723ec: 39472008     	ldrb	w8, [x0, #0x1c8]
 46723f0: 6b08031f     	cmp	w24, w8
 46723f4: 540000a0     	b.eq	0x4672408 <_ChromeMain+0x466d16c>
 46723f8: f9400008     	ldr	x8, [x0]
 46723fc: f9405108     	ldr	x8, [x8, #0xa0]
 4672400: aa1803e1     	mov	x1, x24
 4672404: d63f0100     	blr	x8
 4672408: f942e260     	ldr	x0, [x19, #0x5c0]
 467240c: b4000100     	cbz	x0, 0x467242c <_ChromeMain+0x466d190>
 4672410: 39472008     	ldrb	w8, [x0, #0x1c8]
 4672414: 6b0802ff     	cmp	w23, w8
 4672418: 540000a0     	b.eq	0x467242c <_ChromeMain+0x466d190>
 467241c: f9400008     	ldr	x8, [x0]
 4672420: f9405108     	ldr	x8, [x8, #0xa0]
 4672424: aa1703e1     	mov	x1, x23
 4672428: d63f0100     	blr	x8
 467242c: f942e660     	ldr	x0, [x19, #0x5c8]
 4672430: b4000100     	cbz	x0, 0x4672450 <_ChromeMain+0x466d1b4>
 4672434: 39472008     	ldrb	w8, [x0, #0x1c8]
 4672438: 6b0802df     	cmp	w22, w8
 467243c: 540000a0     	b.eq	0x4672450 <_ChromeMain+0x466d1b4>
 4672440: f9400008     	ldr	x8, [x0]
 4672444: f9405108     	ldr	x8, [x8, #0xa0]
 4672448: aa1603e1     	mov	x1, x22
 467244c: d63f0100     	blr	x8
 4672450: f942ea60     	ldr	x0, [x19, #0x5d0]
 4672454: b4000100     	cbz	x0, 0x4672474 <_ChromeMain+0x466d1d8>
 4672458: 39472008     	ldrb	w8, [x0, #0x1c8]
 467245c: 6b08029f     	cmp	w20, w8
 4672460: 540000a0     	b.eq	0x4672474 <_ChromeMain+0x466d1d8>
 4672464: f9400008     	ldr	x8, [x0]
 4672468: f9405108     	ldr	x8, [x8, #0xa0]
 467246c: aa1403e1     	mov	x1, x20
 4672470: d63f0100     	blr	x8
 4672474: f942d260     	ldr	x0, [x19, #0x5a0]
 4672478: b4000100     	cbz	x0, 0x4672498 <_ChromeMain+0x466d1fc>
 467247c: 39472008     	ldrb	w8, [x0, #0x1c8]
 4672480: 6b0802bf     	cmp	w21, w8
 4672484: 540000a0     	b.eq	0x4672498 <_ChromeMain+0x466d1fc>
 4672488: f9400008     	ldr	x8, [x0]
 467248c: f9405108     	ldr	x8, [x8, #0xa0]
 4672490: aa1503e1     	mov	x1, x21
 4672494: d63f0100     	blr	x8
 4672498: b9456e68     	ldr	w8, [x19, #0x56c]
 467249c: b9056e7b     	str	w27, [x19, #0x56c]
 46724a0: 6b1b011f     	cmp	w8, w27
 46724a4: 1a9a13e8     	csel	w8, wzr, w26, ne
 46724a8: 37000088     	tbnz	w8, #0x0, 0x46724b8 <_ChromeMain+0x466d21c>
 46724ac: aa1303e0     	mov	x0, x19
 46724b0: 52800001     	mov	w1, #0x0                ; =0
 46724b4: 96fef7f0     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46724b8: aa1303e0     	mov	x0, x19
 46724bc: 96fcbb30     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46724c0: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 46724c4: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 46724c8: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 46724cc: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 46724d0: a94867fa     	ldp	x26, x25, [sp, #0x80]
 46724d4: a9476ffc     	ldp	x28, x27, [sp, #0x70]
 46724d8: 910343ff     	add	sp, sp, #0xd0
 46724dc: d65f03c0     	ret
 46724e0: aa1b03f5     	mov	x21, x27
 46724e4: aa1b03f4     	mov	x20, x27
 46724e8: aa1b03f6     	mov	x22, x27
 46724ec: aa1b03f7     	mov	x23, x27
 46724f0: aa1b03f8     	mov	x24, x27
 46724f4: aa1b03f9     	mov	x25, x27
 46724f8: aa1b03e1     	mov	x1, x27
 46724fc: 34fff528     	cbz	w8, 0x46723a0 <_ChromeMain+0x466d104>
 4672500: 7100051f     	cmp	w8, #0x1
 4672504: 54000181     	b.ne	0x4672534 <_ChromeMain+0x466d298>
 4672508: f942da68     	ldr	x8, [x19, #0x5b0]
 467250c: b40053e8     	cbz	x8, 0x4672f88 <_ChromeMain+0x466dcec>
 4672510: 52800014     	mov	w20, #0x0               ; =0
 4672514: 52800016     	mov	w22, #0x0               ; =0
 4672518: 52800017     	mov	w23, #0x0               ; =0
 467251c: 52800018     	mov	w24, #0x0               ; =0
 4672520: 52800001     	mov	w1, #0x0                ; =0
 4672524: 52800035     	mov	w21, #0x1               ; =1
 4672528: 5280005b     	mov	w27, #0x2               ; =2
 467252c: 52800039     	mov	w25, #0x1               ; =1
 4672530: 17ffff9c     	b	0x46723a0 <_ChromeMain+0x466d104>
 4672534: 7100091f     	cmp	w8, #0x2
 4672538: 54005de1     	b.ne	0x46730f4 <_ChromeMain+0x466de58>
 467253c: f942de68     	ldr	x8, [x19, #0x5b8]
 4672540: b40049e8     	cbz	x8, 0x4672e7c <_ChromeMain+0x466dbe0>
 4672544: 52800014     	mov	w20, #0x0               ; =0
 4672548: 52800016     	mov	w22, #0x0               ; =0
 467254c: 52800017     	mov	w23, #0x0               ; =0
 4672550: 52800019     	mov	w25, #0x0               ; =0
 4672554: 52800001     	mov	w1, #0x0                ; =0
 4672558: 52800035     	mov	w21, #0x1               ; =1
 467255c: 5280007b     	mov	w27, #0x3               ; =3
 4672560: 52800038     	mov	w24, #0x1               ; =1
 4672564: 17ffff8f     	b	0x46723a0 <_ChromeMain+0x466d104>
 4672568: 12800008     	mov	w8, #-0x1               ; =-1
 467256c: b8e80008     	ldaddal	w8, w8, [x0]
 4672570: 7100051f     	cmp	w8, #0x1
 4672574: 540005a1     	b.ne	0x4672628 <_ChromeMain+0x466d38c>
 4672578: f9400808     	ldr	x8, [x0, #0x10]
 467257c: d63f0100     	blr	x8
 4672580: 1400002a     	b	0x4672628 <_ChromeMain+0x466d38c>
 4672584: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4672588: 90052a17     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 467258c: f94046e9     	ldr	x9, [x23, #0x88]
 4672590: eb09011f     	cmp	x8, x9
 4672594: 54000061     	b.ne	0x46725a0 <_ChromeMain+0x466d304>
 4672598: aa1303e0     	mov	x0, x19
 467259c: 96e68758     	bl	0x142fc <_ChromeMain+0xf060>
 46725a0: 52800700     	mov	w0, #0x38               ; =56
 46725a4: 96e67371     	bl	0xf368 <_ChromeMain+0xa0cc>
 46725a8: aa0003f5     	mov	x21, x0
 46725ac: 52800028     	mov	w8, #0x1                ; =1
 46725b0: b9000008     	str	w8, [x0]
 46725b4: b0ffca08     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 46725b8: 91300108     	add	x8, x8, #0xc00
 46725bc: f0ff9129     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 46725c0: 912d0129     	add	x9, x9, #0xb40
 46725c4: a900a408     	stp	x8, x9, [x0, #0x8]
 46725c8: f0fef748     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 46725cc: 912c0108     	add	x8, x8, #0xb00
 46725d0: 1000b989     	adr	x9, 0x4673d00 <_ChromeMain+0x466ea64>
 46725d4: d503201f     	nop
 46725d8: a901a408     	stp	x8, x9, [x0, #0x18]
 46725dc: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 46725e0: 900544d6     	adrp	x22, 0xef0a000 <dyld_stub_binder+0xef0a000>
 46725e4: 911202d6     	add	x22, x22, #0x480
 46725e8: f8bfc2c0     	ldapr	x0, [x22]
 46725ec: b40056a0     	cbz	x0, 0x46730c0 <_ChromeMain+0x466de24>
 46725f0: 52809601     	mov	w1, #0x4b0              ; =1200
 46725f4: d2800002     	mov	x2, #0x0                ; =0
 46725f8: 96e8e3ee     	bl	0xab5b0 <_ChromeMain+0xa6314>
 46725fc: aa0003f4     	mov	x20, x0
 4672600: f90027f5     	str	x21, [sp, #0x48]
 4672604: 52800048     	mov	w8, #0x2                ; =2
 4672608: 390143e8     	strb	w8, [sp, #0x50]
 467260c: 910123e1     	add	x1, sp, #0x48
 4672610: 9733ef9c     	bl	0x136e480 <_ChromeMain+0x13691e4>
 4672614: 394143e8     	ldrb	w8, [sp, #0x50]
 4672618: 7103fd1f     	cmp	w8, #0xff
 467261c: 54000060     	b.eq	0x4672628 <_ChromeMain+0x466d38c>
 4672620: f94027e0     	ldr	x0, [sp, #0x48]
 4672624: b5fffa20     	cbnz	x0, 0x4672568 <_ChromeMain+0x466d2cc>
 4672628: 52801fe8     	mov	w8, #0xff               ; =255
 467262c: 390143e8     	strb	w8, [sp, #0x50]
 4672630: 900505c8     	adrp	x8, 0xe72a000 <dyld_stub_binder+0xe72a000>
 4672634: 91354108     	add	x8, x8, #0xd50
 4672638: 91118109     	add	x9, x8, #0x460
 467263c: a9002688     	stp	x8, x9, [x20]
 4672640: 91122109     	add	x9, x8, #0x488
 4672644: f9000a89     	str	x9, [x20, #0x10]
 4672648: 91130109     	add	x9, x8, #0x4c0
 467264c: 9113c10a     	add	x10, x8, #0x4f0
 4672650: a906aa89     	stp	x9, x10, [x20, #0x68]
 4672654: 91150109     	add	x9, x8, #0x540
 4672658: f9005a89     	str	x9, [x20, #0xb0]
 467265c: 91168109     	add	x9, x8, #0x5a0
 4672660: f9006e89     	str	x9, [x20, #0xd8]
 4672664: 91174109     	add	x9, x8, #0x5d0
 4672668: aa1403f5     	mov	x21, x20
 467266c: f80f8ea9     	str	x9, [x21, #0xf8]!
 4672670: 9117e109     	add	x9, x8, #0x5f8
 4672674: f9018a89     	str	x9, [x20, #0x310]
 4672678: 9119e109     	add	x9, x8, #0x678
 467267c: f9018e89     	str	x9, [x20, #0x318]
 4672680: 911ce108     	add	x8, x8, #0x738
 4672684: f9019288     	str	x8, [x20, #0x320]
 4672688: 39518288     	ldrb	w8, [x20, #0x460]
 467268c: 340000a8     	cbz	w8, 0x46726a0 <_ChromeMain+0x466d404>
 4672690: 3911829f     	strb	wzr, [x20, #0x460]
 4672694: 91118281     	add	x1, x20, #0x460
 4672698: aa1503e0     	mov	x0, x21
 467269c: 9722d64d     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46726a0: f9424288     	ldr	x8, [x20, #0x480]
 46726a4: 52800029     	mov	w9, #0x1                ; =1
 46726a8: b9001909     	str	w9, [x8, #0x18]
 46726ac: b9446688     	ldr	w8, [x20, #0x464]
 46726b0: 7120011f     	cmp	w8, #0x800
 46726b4: 540000e0     	b.eq	0x46726d0 <_ChromeMain+0x466d434>
 46726b8: 91119288     	add	x8, x20, #0x464
 46726bc: 52810009     	mov	w9, #0x800              ; =2048
 46726c0: b9000109     	str	w9, [x8]
 46726c4: 91119281     	add	x1, x20, #0x464
 46726c8: aa1503e0     	mov	x0, x21
 46726cc: 9722d641     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46726d0: aa1403e0     	mov	x0, x20
 46726d4: 52800041     	mov	w1, #0x2                ; =2
 46726d8: 973b1441     	bl	0x15377dc <_ChromeMain+0x1532540>
 46726dc: 52800400     	mov	w0, #0x20               ; =32
 46726e0: 96e67322     	bl	0xf368 <_ChromeMain+0xa0cc>
 46726e4: f90027e0     	str	x0, [sp, #0x48]
 46726e8: b004c668     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 46726ec: 3dc18d00     	ldr	q0, [x8, #0x630]
 46726f0: 3c8503e0     	stur	q0, [sp, #0x50]
 46726f4: 91006008     	add	x8, x0, #0x18
 46726f8: eb00011f     	cmp	x8, x0
 46726fc: 54001963     	b.lo	0x4672a28 <_ChromeMain+0x466d78c>
 4672700: 3d8007e0     	str	q0, [sp, #0x10]
 4672704: b004c8b8     	adrp	x24, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4672708: 912a3318     	add	x24, x24, #0xa8c
 467270c: eb18011f     	cmp	x8, x24
 4672710: fa588002     	ccmp	x0, x24, #0x2, hi
 4672714: 540018a9     	b.ls	0x4672a28 <_ChromeMain+0x466d78c>
 4672718: 3dc00300     	ldr	q0, [x24]
 467271c: 3d8003e0     	str	q0, [sp]
 4672720: 3d800000     	str	q0, [x0]
 4672724: f9400b19     	ldr	x25, [x24, #0x10]
 4672728: f9000819     	str	x25, [x0, #0x10]
 467272c: 7900301f     	strh	wzr, [x0, #0x18]
 4672730: 910123e1     	add	x1, sp, #0x48
 4672734: aa1403e0     	mov	x0, x20
 4672738: 97075083     	bl	0x846944 <_ChromeMain+0x8416a8>
 467273c: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 4672740: 36f800a8     	tbz	w8, #0x1f, 0x4672754 <_ChromeMain+0x466d4b8>
 4672744: f94027e0     	ldr	x0, [sp, #0x48]
 4672748: f9402fe8     	ldr	x8, [sp, #0x58]
 467274c: d37ff901     	lsl	x1, x8, #1
 4672750: 96e659da     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4672754: f9416695     	ldr	x21, [x20, #0x2c8]
 4672758: b4001575     	cbz	x21, 0x4672a04 <_ChromeMain+0x466d768>
 467275c: 52800400     	mov	w0, #0x20               ; =32
 4672760: 96e67302     	bl	0xf368 <_ChromeMain+0xa0cc>
 4672764: f9001be0     	str	x0, [sp, #0x30]
 4672768: 3dc007e0     	ldr	q0, [sp, #0x10]
 467276c: 3c8383e0     	stur	q0, [sp, #0x38]
 4672770: 91006008     	add	x8, x0, #0x18
 4672774: eb00011f     	cmp	x8, x0
 4672778: 54001583     	b.lo	0x4672a28 <_ChromeMain+0x466d78c>
 467277c: eb18011f     	cmp	x8, x24
 4672780: fa588002     	ccmp	x0, x24, #0x2, hi
 4672784: 54001529     	b.ls	0x4672a28 <_ChromeMain+0x466d78c>
 4672788: 3dc003e0     	ldr	q0, [sp]
 467278c: 3d800000     	str	q0, [x0]
 4672790: f9000819     	str	x25, [x0, #0x10]
 4672794: 7900301f     	strh	wzr, [x0, #0x18]
 4672798: 9100c3e1     	add	x1, sp, #0x30
 467279c: aa1503e0     	mov	x0, x21
 46727a0: 972bec4e     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 46727a4: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 46727a8: 36f800a8     	tbz	w8, #0x1f, 0x46727bc <_ChromeMain+0x466d520>
 46727ac: f9401be0     	ldr	x0, [sp, #0x30]
 46727b0: f94023e8     	ldr	x8, [sp, #0x40]
 46727b4: d37ff901     	lsl	x1, x8, #1
 46727b8: 96e659c0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46727bc: aa1403e0     	mov	x0, x20
 46727c0: b21d07e1     	mov	x1, #0x1800000018       ; =103079215128
 46727c4: 52800022     	mov	w2, #0x1                ; =1
 46727c8: 97857ca6     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 46727cc: 52802800     	mov	w0, #0x140              ; =320
 46727d0: 96e672e6     	bl	0xf368 <_ChromeMain+0xa0cc>
 46727d4: aa0003f5     	mov	x21, x0
 46727d8: 978e777e     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 46727dc: aa1403e0     	mov	x0, x20
 46727e0: aa1503e1     	mov	x1, x21
 46727e4: 97545c15     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 46727e8: b940f2a8     	ldr	w8, [x21, #0xf0]
 46727ec: 35001028     	cbnz	w8, 0x46729f0 <_ChromeMain+0x466d754>
 46727f0: b9410aa8     	ldr	w8, [x21, #0x108]
 46727f4: 7100051f     	cmp	w8, #0x1
 46727f8: 540000c0     	b.eq	0x4672810 <_ChromeMain+0x466d574>
 46727fc: 52800028     	mov	w8, #0x1                ; =1
 4672800: b9010aa8     	str	w8, [x21, #0x108]
 4672804: aa1503e0     	mov	x0, x21
 4672808: 52800021     	mov	w1, #0x1                ; =1
 467280c: 974fcaa9     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4672810: 52800038     	mov	w24, #0x1               ; =1
 4672814: b9004bf8     	str	w24, [sp, #0x48]
 4672818: f0051c81     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 467281c: 9115a021     	add	x1, x1, #0x568
 4672820: 910462a0     	add	x0, x21, #0x118
 4672824: 910123e2     	add	x2, sp, #0x48
 4672828: 974fca5f     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 467282c: f8bfc2c0     	ldapr	x0, [x22]
 4672830: b40044c0     	cbz	x0, 0x46730c8 <_ChromeMain+0x466de2c>
 4672834: 52807001     	mov	w1, #0x380              ; =896
 4672838: d2800002     	mov	x2, #0x0                ; =0
 467283c: 96e8e35d     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4672840: aa0003f5     	mov	x21, x0
 4672844: 9776ea7d     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 4672848: 90050208     	adrp	x8, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 467284c: 912f4108     	add	x8, x8, #0xbd0
 4672850: 910fc109     	add	x9, x8, #0x3f0
 4672854: a9002408     	stp	x8, x9, [x0]
 4672858: 91106109     	add	x9, x8, #0x418
 467285c: f9000809     	str	x9, [x0, #0x10]
 4672860: 91114109     	add	x9, x8, #0x450
 4672864: 9112010a     	add	x10, x8, #0x480
 4672868: a906a809     	stp	x9, x10, [x0, #0x68]
 467286c: 91134109     	add	x9, x8, #0x4d0
 4672870: f9005809     	str	x9, [x0, #0xb0]
 4672874: 9114c109     	add	x9, x8, #0x530
 4672878: f9006c09     	str	x9, [x0, #0xd8]
 467287c: 91158108     	add	x8, x8, #0x560
 4672880: aa0003f6     	mov	x22, x0
 4672884: f80f8ec8     	str	x8, [x22, #0xf8]!
 4672888: f901a41f     	str	xzr, [x0, #0x348]
 467288c: 2f06e400     	movi	d0, #0xffff000000000000
 4672890: fd01a800     	str	d0, [x0, #0x350]
 4672894: 390d6018     	strb	w24, [x0, #0x358]
 4672898: f901b01f     	str	xzr, [x0, #0x360]
 467289c: 390da01f     	strb	wzr, [x0, #0x368]
 46728a0: f901b81f     	str	xzr, [x0, #0x370]
 46728a4: b903781f     	str	wzr, [x0, #0x378]
 46728a8: 390df01f     	strb	wzr, [x0, #0x37c]
 46728ac: 3945a408     	ldrb	w8, [x0, #0x169]
 46728b0: 35004108     	cbnz	w8, 0x46730d0 <_ChromeMain+0x466de34>
 46728b4: f940ce82     	ldr	x2, [x20, #0x198]
 46728b8: aa1403e0     	mov	x0, x20
 46728bc: aa1503e1     	mov	x1, x21
 46728c0: 97041acf     	bl	0x7793fc <_ChromeMain+0x774160>
 46728c4: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 46728c8: 340000a8     	cbz	w8, 0x46728dc <_ChromeMain+0x466d640>
 46728cc: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 46728d0: 9106a6a1     	add	x1, x21, #0x1a9
 46728d4: aa1603e0     	mov	x0, x22
 46728d8: 9722d5be     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46728dc: 910c42a8     	add	x8, x21, #0x310
 46728e0: 394c62a9     	ldrb	w9, [x21, #0x318]
 46728e4: 35003fc9     	cbnz	w9, 0x46730dc <_ChromeMain+0x466de40>
 46728e8: b4000a08     	cbz	x8, 0x4672a28 <_ChromeMain+0x466d78c>
 46728ec: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 46728f0: f9018aa8     	str	x8, [x21, #0x310]
 46728f4: 52800028     	mov	w8, #0x1                ; =1
 46728f8: 390c62a8     	strb	w8, [x21, #0x318]
 46728fc: f940c6a0     	ldr	x0, [x21, #0x188]
 4672900: b40000a0     	cbz	x0, 0x4672914 <_ChromeMain+0x466d678>
 4672904: f9400008     	ldr	x8, [x0]
 4672908: f9417d08     	ldr	x8, [x8, #0x2f8]
 467290c: aa1503e1     	mov	x1, x21
 4672910: d63f0100     	blr	x8
 4672914: aa1503e0     	mov	x0, x21
 4672918: 52800001     	mov	w1, #0x0                ; =0
 467291c: 96fef6d6     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4672920: f90027f5     	str	x21, [sp, #0x48]
 4672924: 9104c2a0     	add	x0, x21, #0x130
 4672928: 910123e3     	add	x3, sp, #0x48
 467292c: 52800301     	mov	w1, #0x18               ; =24
 4672930: 52800022     	mov	w2, #0x1                ; =1
 4672934: 9708d227     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 4672938: aa1503e0     	mov	x0, x21
 467293c: 972f906b     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 4672940: aa1503e0     	mov	x0, x21
 4672944: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 4672948: 52800022     	mov	w2, #0x1                ; =1
 467294c: 97857c45     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4672950: 52801c48     	mov	w8, #0xe2               ; =226
 4672954: b9002be8     	str	w8, [sp, #0x28]
 4672958: 3900b3ff     	strb	wzr, [sp, #0x2c]
 467295c: d0051b00     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4672960: 9126c000     	add	x0, x0, #0x9b0
 4672964: 910123e8     	add	x8, sp, #0x48
 4672968: 9100a3e1     	add	x1, sp, #0x28
 467296c: 52800202     	mov	w2, #0x10               ; =16
 4672970: d2800003     	mov	x3, #0x0                ; =0
 4672974: 971e07eb     	bl	0xdf4920 <_ChromeMain+0xdef684>
 4672978: 910123e1     	add	x1, sp, #0x48
 467297c: aa1503e0     	mov	x0, x21
 4672980: 96fcb9c8     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4672984: 910123e0     	add	x0, sp, #0x48
 4672988: 97074fae     	bl	0x846840 <_ChromeMain+0x8415a4>
 467298c: f9400288     	ldr	x8, [x20]
 4672990: f9405108     	ldr	x8, [x8, #0xa0]
 4672994: aa1403e0     	mov	x0, x20
 4672998: 52800001     	mov	w1, #0x0                ; =0
 467299c: d63f0100     	blr	x8
 46729a0: 3945a688     	ldrb	w8, [x20, #0x169]
 46729a4: 35003a28     	cbnz	w8, 0x46730e8 <_ChromeMain+0x466de4c>
 46729a8: f942d260     	ldr	x0, [x19, #0x5a0]
 46729ac: f940cc02     	ldr	x2, [x0, #0x198]
 46729b0: aa1403e1     	mov	x1, x20
 46729b4: 97041a92     	bl	0x7793fc <_ChromeMain+0x774160>
 46729b8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 46729bc: f94046e9     	ldr	x9, [x23, #0x88]
 46729c0: eb09011f     	cmp	x8, x9
 46729c4: 54000061     	b.ne	0x46729d0 <_ChromeMain+0x466d734>
 46729c8: aa1403e0     	mov	x0, x20
 46729cc: 96e6864c     	bl	0x142fc <_ChromeMain+0xf060>
 46729d0: f942d660     	ldr	x0, [x19, #0x5a8]
 46729d4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46729d8: f94046e9     	ldr	x9, [x23, #0x88]
 46729dc: eb09011f     	cmp	x8, x9
 46729e0: 54000041     	b.ne	0x46729e8 <_ChromeMain+0x466d74c>
 46729e4: 96e6c016     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46729e8: f902d674     	str	x20, [x19, #0x5a8]
 46729ec: 17fffe49     	b	0x4672310 <_ChromeMain+0x466d074>
 46729f0: b900f2bf     	str	wzr, [x21, #0xf0]
 46729f4: aa1503e0     	mov	x0, x21
 46729f8: 52800021     	mov	w1, #0x1                ; =1
 46729fc: 974fca2d     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4672a00: 17ffff7c     	b	0x46727f0 <_ChromeMain+0x466d554>
 4672a04: 9721cdbf     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4672a08: 35003be0     	cbnz	w0, 0x4673184 <_ChromeMain+0x466dee8>
 4672a0c: aa1403e0     	mov	x0, x20
 4672a10: 9731af11     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4672a14: aa0003f5     	mov	x21, x0
 4672a18: f9416680     	ldr	x0, [x20, #0x2c8]
 4672a1c: f9016695     	str	x21, [x20, #0x2c8]
 4672a20: b4ffe9e0     	cbz	x0, 0x467275c <_ChromeMain+0x466d4c0>
 4672a24: 140001d3     	b	0x4673170 <_ChromeMain+0x466ded4>
 4672a28: d4200020     	brk	#0x1
 4672a2c: 900544c8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4672a30: 91120108     	add	x8, x8, #0x480
 4672a34: f8bfc100     	ldapr	x0, [x8]
 4672a38: b40036c0     	cbz	x0, 0x4673110 <_ChromeMain+0x466de74>
 4672a3c: 52808c01     	mov	w1, #0x460              ; =1120
 4672a40: d2800002     	mov	x2, #0x0                ; =0
 4672a44: 96e8e2db     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4672a48: aa0003f5     	mov	x21, x0
 4672a4c: 52800600     	mov	w0, #0x30               ; =48
 4672a50: 96e67246     	bl	0xf368 <_ChromeMain+0xa0cc>
 4672a54: f90027e0     	str	x0, [sp, #0x48]
 4672a58: d004c668     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4672a5c: 3dc00d00     	ldr	q0, [x8, #0x30]
 4672a60: 3c8503e0     	stur	q0, [sp, #0x50]
 4672a64: 91008809     	add	x9, x0, #0x22
 4672a68: eb00013f     	cmp	x9, x0
 4672a6c: 54fffde3     	b.lo	0x4672a28 <_ChromeMain+0x466d78c>
 4672a70: b004c8a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4672a74: 913ea908     	add	x8, x8, #0xfaa
 4672a78: eb08013f     	cmp	x9, x8
 4672a7c: fa488002     	ccmp	x0, x8, #0x2, hi
 4672a80: 54fffd49     	b.ls	0x4672a28 <_ChromeMain+0x466d78c>
 4672a84: 52800d89     	mov	w9, #0x6c               ; =108
 4672a88: b9002009     	str	w9, [x0, #0x20]
 4672a8c: ad400500     	ldp	q0, q1, [x8]
 4672a90: ad000400     	stp	q0, q1, [x0]
 4672a94: 910123e1     	add	x1, sp, #0x48
 4672a98: aa1503e0     	mov	x0, x21
 4672a9c: 94000959     	bl	0x4675000 <_ChromeMain+0x466fd64>
 4672aa0: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 4672aa4: 36f800a8     	tbz	w8, #0x1f, 0x4672ab8 <_ChromeMain+0x466d81c>
 4672aa8: f94027e0     	ldr	x0, [sp, #0x48]
 4672aac: f9402fe8     	ldr	x8, [sp, #0x58]
 4672ab0: d37ff901     	lsl	x1, x8, #1
 4672ab4: 96e65901     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4672ab8: f94002a8     	ldr	x8, [x21]
 4672abc: f9405108     	ldr	x8, [x8, #0xa0]
 4672ac0: aa1503e0     	mov	x0, x21
 4672ac4: 52800001     	mov	w1, #0x0                ; =0
 4672ac8: d63f0100     	blr	x8
 4672acc: 3945a6a8     	ldrb	w8, [x21, #0x169]
 4672ad0: 35003448     	cbnz	w8, 0x4673158 <_ChromeMain+0x466debc>
 4672ad4: f942d260     	ldr	x0, [x19, #0x5a0]
 4672ad8: f940cc02     	ldr	x2, [x0, #0x198]
 4672adc: aa1503e1     	mov	x1, x21
 4672ae0: 97041a47     	bl	0x7793fc <_ChromeMain+0x774160>
 4672ae4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4672ae8: 90052a14     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4672aec: f9404689     	ldr	x9, [x20, #0x88]
 4672af0: eb09011f     	cmp	x8, x9
 4672af4: 54000061     	b.ne	0x4672b00 <_ChromeMain+0x466d864>
 4672af8: aa1503e0     	mov	x0, x21
 4672afc: 96e68600     	bl	0x142fc <_ChromeMain+0xf060>
 4672b00: f942e260     	ldr	x0, [x19, #0x5c0]
 4672b04: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4672b08: f9404689     	ldr	x9, [x20, #0x88]
 4672b0c: eb09011f     	cmp	x8, x9
 4672b10: 54000041     	b.ne	0x4672b18 <_ChromeMain+0x466d87c>
 4672b14: 96e6bfca     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4672b18: 52800014     	mov	w20, #0x0               ; =0
 4672b1c: 52800016     	mov	w22, #0x0               ; =0
 4672b20: 52800018     	mov	w24, #0x0               ; =0
 4672b24: 52800019     	mov	w25, #0x0               ; =0
 4672b28: 52800001     	mov	w1, #0x0                ; =0
 4672b2c: f902e275     	str	x21, [x19, #0x5c0]
 4672b30: 17fffe10     	b	0x4672370 <_ChromeMain+0x466d0d4>
 4672b34: 7100111f     	cmp	w8, #0x4
 4672b38: 54002de1     	b.ne	0x46730f4 <_ChromeMain+0x466de58>
 4672b3c: f942e668     	ldr	x8, [x19, #0x5c8]
 4672b40: b4000148     	cbz	x8, 0x4672b68 <_ChromeMain+0x466d8cc>
 4672b44: 52800014     	mov	w20, #0x0               ; =0
 4672b48: 52800017     	mov	w23, #0x0               ; =0
 4672b4c: 52800018     	mov	w24, #0x0               ; =0
 4672b50: 52800019     	mov	w25, #0x0               ; =0
 4672b54: 52800001     	mov	w1, #0x0                ; =0
 4672b58: 52800035     	mov	w21, #0x1               ; =1
 4672b5c: 528000bb     	mov	w27, #0x5               ; =5
 4672b60: 52800036     	mov	w22, #0x1               ; =1
 4672b64: 17fffe0f     	b	0x46723a0 <_ChromeMain+0x466d104>
 4672b68: 900544c8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4672b6c: 91120108     	add	x8, x8, #0x480
 4672b70: f8bfc100     	ldapr	x0, [x8]
 4672b74: b4002d60     	cbz	x0, 0x4673120 <_ChromeMain+0x466de84>
 4672b78: 52808c01     	mov	w1, #0x460              ; =1120
 4672b7c: d2800002     	mov	x2, #0x0                ; =0
 4672b80: 96e8e28c     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4672b84: aa0003f5     	mov	x21, x0
 4672b88: 52800400     	mov	w0, #0x20               ; =32
 4672b8c: 96e671f7     	bl	0xf368 <_ChromeMain+0xa0cc>
 4672b90: f90027e0     	str	x0, [sp, #0x48]
 4672b94: b004c668     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4672b98: 3dc04100     	ldr	q0, [x8, #0x100]
 4672b9c: 3c8503e0     	stur	q0, [sp, #0x50]
 4672ba0: 91007809     	add	x9, x0, #0x1e
 4672ba4: eb00013f     	cmp	x9, x0
 4672ba8: 54fff403     	b.lo	0x4672a28 <_ChromeMain+0x466d78c>
 4672bac: b004c8a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4672bb0: 913f3908     	add	x8, x8, #0xfce
 4672bb4: eb08013f     	cmp	x9, x8
 4672bb8: fa488002     	ccmp	x0, x8, #0x2, hi
 4672bbc: 54fff369     	b.ls	0x4672a28 <_ChromeMain+0x466d78c>
 4672bc0: 3dc00100     	ldr	q0, [x8]
 4672bc4: 3d800000     	str	q0, [x0]
 4672bc8: 3cc0e100     	ldur	q0, [x8, #0xe]
 4672bcc: 3c80e000     	stur	q0, [x0, #0xe]
 4672bd0: 79003c1f     	strh	wzr, [x0, #0x1e]
 4672bd4: 910123e1     	add	x1, sp, #0x48
 4672bd8: aa1503e0     	mov	x0, x21
 4672bdc: 94000909     	bl	0x4675000 <_ChromeMain+0x466fd64>
 4672be0: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 4672be4: 36f800a8     	tbz	w8, #0x1f, 0x4672bf8 <_ChromeMain+0x466d95c>
 4672be8: f94027e0     	ldr	x0, [sp, #0x48]
 4672bec: f9402fe8     	ldr	x8, [sp, #0x58]
 4672bf0: d37ff901     	lsl	x1, x8, #1
 4672bf4: 96e658b1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4672bf8: f94002a8     	ldr	x8, [x21]
 4672bfc: f9405108     	ldr	x8, [x8, #0xa0]
 4672c00: aa1503e0     	mov	x0, x21
 4672c04: 52800001     	mov	w1, #0x0                ; =0
 4672c08: d63f0100     	blr	x8
 4672c0c: 3945a6a8     	ldrb	w8, [x21, #0x169]
 4672c10: 35002aa8     	cbnz	w8, 0x4673164 <_ChromeMain+0x466dec8>
 4672c14: f942d260     	ldr	x0, [x19, #0x5a0]
 4672c18: f940cc02     	ldr	x2, [x0, #0x198]
 4672c1c: aa1503e1     	mov	x1, x21
 4672c20: 970419f7     	bl	0x7793fc <_ChromeMain+0x774160>
 4672c24: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4672c28: 90052a14     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4672c2c: f9404689     	ldr	x9, [x20, #0x88]
 4672c30: eb09011f     	cmp	x8, x9
 4672c34: 54000061     	b.ne	0x4672c40 <_ChromeMain+0x466d9a4>
 4672c38: aa1503e0     	mov	x0, x21
 4672c3c: 96e685b0     	bl	0x142fc <_ChromeMain+0xf060>
 4672c40: f942e660     	ldr	x0, [x19, #0x5c8]
 4672c44: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4672c48: f9404689     	ldr	x9, [x20, #0x88]
 4672c4c: eb09011f     	cmp	x8, x9
 4672c50: 54000041     	b.ne	0x4672c58 <_ChromeMain+0x466d9bc>
 4672c54: 96e6bf7a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4672c58: 52800014     	mov	w20, #0x0               ; =0
 4672c5c: 52800017     	mov	w23, #0x0               ; =0
 4672c60: 52800018     	mov	w24, #0x0               ; =0
 4672c64: 52800019     	mov	w25, #0x0               ; =0
 4672c68: 52800001     	mov	w1, #0x0                ; =0
 4672c6c: f902e675     	str	x21, [x19, #0x5c8]
 4672c70: 17ffffba     	b	0x4672b58 <_ChromeMain+0x466d8bc>
 4672c74: aa1b03f5     	mov	x21, x27
 4672c78: aa1b03f4     	mov	x20, x27
 4672c7c: aa1b03f6     	mov	x22, x27
 4672c80: aa1b03f7     	mov	x23, x27
 4672c84: aa1b03f8     	mov	x24, x27
 4672c88: aa1b03f9     	mov	x25, x27
 4672c8c: aa1b03e1     	mov	x1, x27
 4672c90: 7100151f     	cmp	w8, #0x5
 4672c94: 54ffb860     	b.eq	0x46723a0 <_ChromeMain+0x466d104>
 4672c98: 7100191f     	cmp	w8, #0x6
 4672c9c: 540022c1     	b.ne	0x46730f4 <_ChromeMain+0x466de58>
 4672ca0: f942ea68     	ldr	x8, [x19, #0x5d0]
 4672ca4: b5000da8     	cbnz	x8, 0x4672e58 <_ChromeMain+0x466dbbc>
 4672ca8: 900544c8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4672cac: 91120108     	add	x8, x8, #0x480
 4672cb0: f8bfc100     	ldapr	x0, [x8]
 4672cb4: b4002260     	cbz	x0, 0x4673100 <_ChromeMain+0x466de64>
 4672cb8: 52807001     	mov	w1, #0x380              ; =896
 4672cbc: d2800002     	mov	x2, #0x0                ; =0
 4672cc0: 96e8e23c     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4672cc4: aa0003f4     	mov	x20, x0
 4672cc8: 9776e95c     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 4672ccc: 90050208     	adrp	x8, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 4672cd0: 912f4108     	add	x8, x8, #0xbd0
 4672cd4: 910fc109     	add	x9, x8, #0x3f0
 4672cd8: a9002408     	stp	x8, x9, [x0]
 4672cdc: 91106109     	add	x9, x8, #0x418
 4672ce0: f9000809     	str	x9, [x0, #0x10]
 4672ce4: 91114109     	add	x9, x8, #0x450
 4672ce8: 9112010a     	add	x10, x8, #0x480
 4672cec: a906a809     	stp	x9, x10, [x0, #0x68]
 4672cf0: 91134109     	add	x9, x8, #0x4d0
 4672cf4: f9005809     	str	x9, [x0, #0xb0]
 4672cf8: 91158109     	add	x9, x8, #0x560
 4672cfc: f80f8c09     	str	x9, [x0, #0xf8]!
 4672d00: 9114c108     	add	x8, x8, #0x530
 4672d04: f9006e88     	str	x8, [x20, #0xd8]
 4672d08: f901a69f     	str	xzr, [x20, #0x348]
 4672d0c: 2f06e400     	movi	d0, #0xffff000000000000
 4672d10: fd01aa80     	str	d0, [x20, #0x350]
 4672d14: 52800028     	mov	w8, #0x1                ; =1
 4672d18: 390d6288     	strb	w8, [x20, #0x358]
 4672d1c: f901b29f     	str	xzr, [x20, #0x360]
 4672d20: 390da29f     	strb	wzr, [x20, #0x368]
 4672d24: f901ba9f     	str	xzr, [x20, #0x370]
 4672d28: b9037a9f     	str	wzr, [x20, #0x378]
 4672d2c: 390df29f     	strb	wzr, [x20, #0x37c]
 4672d30: 3946a688     	ldrb	w8, [x20, #0x1a9]
 4672d34: 34000088     	cbz	w8, 0x4672d44 <_ChromeMain+0x466daa8>
 4672d38: 3906a69f     	strb	wzr, [x20, #0x1a9]
 4672d3c: 9106a681     	add	x1, x20, #0x1a9
 4672d40: 9722d4a4     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4672d44: 910c4288     	add	x8, x20, #0x310
 4672d48: 394c6289     	ldrb	w9, [x20, #0x318]
 4672d4c: 35001ee9     	cbnz	w9, 0x4673128 <_ChromeMain+0x466de8c>
 4672d50: b4ffe6c8     	cbz	x8, 0x4672a28 <_ChromeMain+0x466d78c>
 4672d54: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 4672d58: f9018a88     	str	x8, [x20, #0x310]
 4672d5c: 52800028     	mov	w8, #0x1                ; =1
 4672d60: 390c6288     	strb	w8, [x20, #0x318]
 4672d64: f940c680     	ldr	x0, [x20, #0x188]
 4672d68: b40000a0     	cbz	x0, 0x4672d7c <_ChromeMain+0x466dae0>
 4672d6c: f9400008     	ldr	x8, [x0]
 4672d70: f9417d08     	ldr	x8, [x8, #0x2f8]
 4672d74: aa1403e1     	mov	x1, x20
 4672d78: d63f0100     	blr	x8
 4672d7c: aa1403e0     	mov	x0, x20
 4672d80: 52800001     	mov	w1, #0x0                ; =0
 4672d84: 96fef5bc     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4672d88: f90027f4     	str	x20, [sp, #0x48]
 4672d8c: 9104c280     	add	x0, x20, #0x130
 4672d90: 910123e3     	add	x3, sp, #0x48
 4672d94: 52800301     	mov	w1, #0x18               ; =24
 4672d98: 52800022     	mov	w2, #0x1                ; =1
 4672d9c: 9708d10d     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 4672da0: aa1403e0     	mov	x0, x20
 4672da4: 972f8f51     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 4672da8: aa1403e0     	mov	x0, x20
 4672dac: b21d07e1     	mov	x1, #0x1800000018       ; =103079215128
 4672db0: 52800022     	mov	w2, #0x1                ; =1
 4672db4: 97857b2b     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4672db8: 52802248     	mov	w8, #0x112              ; =274
 4672dbc: b90033e8     	str	w8, [sp, #0x30]
 4672dc0: 3900d3ff     	strb	wzr, [sp, #0x34]
 4672dc4: d0051b00     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4672dc8: 913c0000     	add	x0, x0, #0xf00
 4672dcc: 910123e8     	add	x8, sp, #0x48
 4672dd0: 9100c3e1     	add	x1, sp, #0x30
 4672dd4: 52800202     	mov	w2, #0x10               ; =16
 4672dd8: d2800003     	mov	x3, #0x0                ; =0
 4672ddc: 971e06d1     	bl	0xdf4920 <_ChromeMain+0xdef684>
 4672de0: 910123e1     	add	x1, sp, #0x48
 4672de4: aa1403e0     	mov	x0, x20
 4672de8: 96fcb8ae     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4672dec: 910123e0     	add	x0, sp, #0x48
 4672df0: 97074e94     	bl	0x846840 <_ChromeMain+0x8415a4>
 4672df4: f9400288     	ldr	x8, [x20]
 4672df8: f9405108     	ldr	x8, [x8, #0xa0]
 4672dfc: aa1403e0     	mov	x0, x20
 4672e00: 52800001     	mov	w1, #0x0                ; =0
 4672e04: d63f0100     	blr	x8
 4672e08: 3945a688     	ldrb	w8, [x20, #0x169]
 4672e0c: 35001948     	cbnz	w8, 0x4673134 <_ChromeMain+0x466de98>
 4672e10: f942d260     	ldr	x0, [x19, #0x5a0]
 4672e14: f940cc02     	ldr	x2, [x0, #0x198]
 4672e18: aa1403e1     	mov	x1, x20
 4672e1c: 97041978     	bl	0x7793fc <_ChromeMain+0x774160>
 4672e20: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4672e24: 90052a15     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4672e28: f94046a9     	ldr	x9, [x21, #0x88]
 4672e2c: eb09011f     	cmp	x8, x9
 4672e30: 54000061     	b.ne	0x4672e3c <_ChromeMain+0x466dba0>
 4672e34: aa1403e0     	mov	x0, x20
 4672e38: 96e68531     	bl	0x142fc <_ChromeMain+0xf060>
 4672e3c: f942ea60     	ldr	x0, [x19, #0x5d0]
 4672e40: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4672e44: f94046a9     	ldr	x9, [x21, #0x88]
 4672e48: eb09011f     	cmp	x8, x9
 4672e4c: 54000041     	b.ne	0x4672e54 <_ChromeMain+0x466dbb8>
 4672e50: 96e6befb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4672e54: f902ea74     	str	x20, [x19, #0x5d0]
 4672e58: 52800016     	mov	w22, #0x0               ; =0
 4672e5c: 52800017     	mov	w23, #0x0               ; =0
 4672e60: 52800018     	mov	w24, #0x0               ; =0
 4672e64: 52800019     	mov	w25, #0x0               ; =0
 4672e68: 52800001     	mov	w1, #0x0                ; =0
 4672e6c: 52800035     	mov	w21, #0x1               ; =1
 4672e70: 528000db     	mov	w27, #0x6               ; =6
 4672e74: 52800034     	mov	w20, #0x1               ; =1
 4672e78: 17fffd4a     	b	0x46723a0 <_ChromeMain+0x466d104>
 4672e7c: 900544c8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4672e80: 91120108     	add	x8, x8, #0x480
 4672e84: f8bfc100     	ldapr	x0, [x8]
 4672e88: b4001480     	cbz	x0, 0x4673118 <_ChromeMain+0x466de7c>
 4672e8c: 52806301     	mov	w1, #0x318              ; =792
 4672e90: d2800002     	mov	x2, #0x0                ; =0
 4672e94: 96e8e1c7     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4672e98: aa0003f5     	mov	x21, x0
 4672e9c: 9733f0a9     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4672ea0: b00505c8     	adrp	x8, 0xe72b000 <dyld_stub_binder+0xe72b000>
 4672ea4: 91294108     	add	x8, x8, #0xa50
 4672ea8: 910fa109     	add	x9, x8, #0x3e8
 4672eac: a9002408     	stp	x8, x9, [x0]
 4672eb0: 91104109     	add	x9, x8, #0x410
 4672eb4: f9000809     	str	x9, [x0, #0x10]
 4672eb8: 91112109     	add	x9, x8, #0x448
 4672ebc: 9111e10a     	add	x10, x8, #0x478
 4672ec0: a906a809     	stp	x9, x10, [x0, #0x68]
 4672ec4: 91132109     	add	x9, x8, #0x4c8
 4672ec8: f9005809     	str	x9, [x0, #0xb0]
 4672ecc: 9114a109     	add	x9, x8, #0x528
 4672ed0: f9006c09     	str	x9, [x0, #0xd8]
 4672ed4: 91156108     	add	x8, x8, #0x558
 4672ed8: aa0003f4     	mov	x20, x0
 4672edc: f80f8e88     	str	x8, [x20, #0xf8]!
 4672ee0: 528022e8     	mov	w8, #0x117              ; =279
 4672ee4: b9031008     	str	w8, [x0, #0x310]
 4672ee8: b21d07e1     	mov	x1, #0x1800000018       ; =103079215128
 4672eec: 52800022     	mov	w2, #0x1                ; =1
 4672ef0: 97857adc     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4672ef4: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 4672ef8: 340000a8     	cbz	w8, 0x4672f0c <_ChromeMain+0x466dc70>
 4672efc: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 4672f00: 9106a6a1     	add	x1, x21, #0x1a9
 4672f04: aa1403e0     	mov	x0, x20
 4672f08: 9722d432     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4672f0c: f94002a8     	ldr	x8, [x21]
 4672f10: f9405108     	ldr	x8, [x8, #0xa0]
 4672f14: aa1503e0     	mov	x0, x21
 4672f18: 52800001     	mov	w1, #0x0                ; =0
 4672f1c: d63f0100     	blr	x8
 4672f20: 3945a6a8     	ldrb	w8, [x21, #0x169]
 4672f24: 35001148     	cbnz	w8, 0x467314c <_ChromeMain+0x466deb0>
 4672f28: f942d260     	ldr	x0, [x19, #0x5a0]
 4672f2c: f940cc02     	ldr	x2, [x0, #0x198]
 4672f30: aa1503e1     	mov	x1, x21
 4672f34: 97041932     	bl	0x7793fc <_ChromeMain+0x774160>
 4672f38: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4672f3c: 90052a14     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4672f40: f9404689     	ldr	x9, [x20, #0x88]
 4672f44: eb09011f     	cmp	x8, x9
 4672f48: 54000061     	b.ne	0x4672f54 <_ChromeMain+0x466dcb8>
 4672f4c: aa1503e0     	mov	x0, x21
 4672f50: 96e684eb     	bl	0x142fc <_ChromeMain+0xf060>
 4672f54: f942de60     	ldr	x0, [x19, #0x5b8]
 4672f58: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4672f5c: f9404689     	ldr	x9, [x20, #0x88]
 4672f60: eb09011f     	cmp	x8, x9
 4672f64: 54000041     	b.ne	0x4672f6c <_ChromeMain+0x466dcd0>
 4672f68: 96e6beb5     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4672f6c: 52800014     	mov	w20, #0x0               ; =0
 4672f70: 52800016     	mov	w22, #0x0               ; =0
 4672f74: 52800017     	mov	w23, #0x0               ; =0
 4672f78: 52800019     	mov	w25, #0x0               ; =0
 4672f7c: 52800001     	mov	w1, #0x0                ; =0
 4672f80: f902de75     	str	x21, [x19, #0x5b8]
 4672f84: 17fffd75     	b	0x4672558 <_ChromeMain+0x466d2bc>
 4672f88: 900544c8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4672f8c: 91120108     	add	x8, x8, #0x480
 4672f90: f8bfc100     	ldapr	x0, [x8]
 4672f94: b4000ba0     	cbz	x0, 0x4673108 <_ChromeMain+0x466de6c>
 4672f98: 52806f01     	mov	w1, #0x378              ; =888
 4672f9c: d2800002     	mov	x2, #0x0                ; =0
 4672fa0: 96e8e184     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4672fa4: aa0003f5     	mov	x21, x0
 4672fa8: 9733f066     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4672fac: b00505c8     	adrp	x8, 0xe72b000 <dyld_stub_binder+0xe72b000>
 4672fb0: 91134108     	add	x8, x8, #0x4d0
 4672fb4: 910fa109     	add	x9, x8, #0x3e8
 4672fb8: a9002408     	stp	x8, x9, [x0]
 4672fbc: 91104109     	add	x9, x8, #0x410
 4672fc0: f9000809     	str	x9, [x0, #0x10]
 4672fc4: 91112109     	add	x9, x8, #0x448
 4672fc8: 9111e10a     	add	x10, x8, #0x478
 4672fcc: a906a809     	stp	x9, x10, [x0, #0x68]
 4672fd0: 91132109     	add	x9, x8, #0x4c8
 4672fd4: f9005809     	str	x9, [x0, #0xb0]
 4672fd8: 9114a109     	add	x9, x8, #0x528
 4672fdc: f9006c09     	str	x9, [x0, #0xd8]
 4672fe0: 91156108     	add	x8, x8, #0x558
 4672fe4: aa0003f4     	mov	x20, x0
 4672fe8: f80f8e88     	str	x8, [x20, #0xf8]!
 4672fec: f901881f     	str	xzr, [x0, #0x310]
 4672ff0: f901901f     	str	xzr, [x0, #0x320]
 4672ff4: f901981f     	str	xzr, [x0, #0x330]
 4672ff8: f901941f     	str	xzr, [x0, #0x328]
 4672ffc: 12800008     	mov	w8, #-0x1               ; =-1
 4673000: b9033808     	str	w8, [x0, #0x338]
 4673004: 6f00e400     	movi.2d	v0, #0000000000000000
 4673008: ad1a0000     	stp	q0, q0, [x0, #0x340]
 467300c: 3d80d800     	str	q0, [x0, #0x360]
 4673010: d004e228     	adrp	x8, 0xe2b9000 <dyld_stub_binder+0xe2b9000>
 4673014: 91160108     	add	x8, x8, #0x580
 4673018: f9018c08     	str	x8, [x0, #0x318]
 467301c: f901b81f     	str	xzr, [x0, #0x370]
 4673020: b21d07e1     	mov	x1, #0x1800000018       ; =103079215128
 4673024: 52800022     	mov	w2, #0x1                ; =1
 4673028: 97857a8e     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 467302c: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 4673030: 340000a8     	cbz	w8, 0x4673044 <_ChromeMain+0x466dda8>
 4673034: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 4673038: 9106a6a1     	add	x1, x21, #0x1a9
 467303c: aa1403e0     	mov	x0, x20
 4673040: 9722d3e4     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4673044: f94002a8     	ldr	x8, [x21]
 4673048: f9405108     	ldr	x8, [x8, #0xa0]
 467304c: aa1503e0     	mov	x0, x21
 4673050: 52800001     	mov	w1, #0x0                ; =0
 4673054: d63f0100     	blr	x8
 4673058: 3945a6a8     	ldrb	w8, [x21, #0x169]
 467305c: 35000728     	cbnz	w8, 0x4673140 <_ChromeMain+0x466dea4>
 4673060: f942d260     	ldr	x0, [x19, #0x5a0]
 4673064: f940cc02     	ldr	x2, [x0, #0x198]
 4673068: aa1503e1     	mov	x1, x21
 467306c: 970418e4     	bl	0x7793fc <_ChromeMain+0x774160>
 4673070: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4673074: f00529f4     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4673078: f9404689     	ldr	x9, [x20, #0x88]
 467307c: eb09011f     	cmp	x8, x9
 4673080: 54000061     	b.ne	0x467308c <_ChromeMain+0x466ddf0>
 4673084: aa1503e0     	mov	x0, x21
 4673088: 96e6849d     	bl	0x142fc <_ChromeMain+0xf060>
 467308c: f942da60     	ldr	x0, [x19, #0x5b0]
 4673090: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4673094: f9404689     	ldr	x9, [x20, #0x88]
 4673098: eb09011f     	cmp	x8, x9
 467309c: 54000041     	b.ne	0x46730a4 <_ChromeMain+0x466de08>
 46730a0: 96e6be67     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46730a4: 52800014     	mov	w20, #0x0               ; =0
 46730a8: 52800016     	mov	w22, #0x0               ; =0
 46730ac: 52800017     	mov	w23, #0x0               ; =0
 46730b0: 52800018     	mov	w24, #0x0               ; =0
 46730b4: 52800001     	mov	w1, #0x0                ; =0
 46730b8: f902da75     	str	x21, [x19, #0x5b0]
 46730bc: 17fffd1a     	b	0x4672524 <_ChromeMain+0x466d288>
 46730c0: 97f1818e     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 46730c4: 17fffd4b     	b	0x46725f0 <_ChromeMain+0x466d354>
 46730c8: 97f1818c     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 46730cc: 17fffdda     	b	0x4672834 <_ChromeMain+0x466d598>
 46730d0: d4200000     	brk	#0
 46730d4: d4400000     	hlt	#0
 46730d8: d4200020     	brk	#0x1
 46730dc: b21c03e9     	mov	x9, #0x1000000010       ; =68719476752
 46730e0: f9000109     	str	x9, [x8]
 46730e4: 17fffe06     	b	0x46728fc <_ChromeMain+0x466d660>
 46730e8: d4200000     	brk	#0
 46730ec: d4400000     	hlt	#0
 46730f0: d4200020     	brk	#0x1
 46730f4: d4200000     	brk	#0
 46730f8: d4400000     	hlt	#0
 46730fc: d4200020     	brk	#0x1
 4673100: 97f1817e     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4673104: 17fffeed     	b	0x4672cb8 <_ChromeMain+0x466da1c>
 4673108: 97f1817c     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 467310c: 17ffffa3     	b	0x4672f98 <_ChromeMain+0x466dcfc>
 4673110: 97f1817a     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4673114: 17fffe4a     	b	0x4672a3c <_ChromeMain+0x466d7a0>
 4673118: 97f18178     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 467311c: 17ffff5c     	b	0x4672e8c <_ChromeMain+0x466dbf0>
 4673120: 97f18176     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4673124: 17fffe95     	b	0x4672b78 <_ChromeMain+0x466d8dc>
 4673128: b21c03e9     	mov	x9, #0x1000000010       ; =68719476752
 467312c: f9000109     	str	x9, [x8]
 4673130: 17ffff0d     	b	0x4672d64 <_ChromeMain+0x466dac8>
 4673134: d4200000     	brk	#0
 4673138: d4400000     	hlt	#0
 467313c: d4200020     	brk	#0x1
 4673140: d4200000     	brk	#0
 4673144: d4400000     	hlt	#0
 4673148: d4200020     	brk	#0x1
 467314c: d4200000     	brk	#0
 4673150: d4400000     	hlt	#0
 4673154: d4200020     	brk	#0x1
 4673158: d4200000     	brk	#0
 467315c: d4400000     	hlt	#0
 4673160: d4200020     	brk	#0x1
 4673164: d4200000     	brk	#0
 4673168: d4400000     	hlt	#0
 467316c: d4200020     	brk	#0x1
 4673170: f9400008     	ldr	x8, [x0]
 4673174: f9400508     	ldr	x8, [x8, #0x8]
 4673178: d63f0100     	blr	x8
 467317c: f9416695     	ldr	x21, [x20, #0x2c8]
 4673180: 17fffd77     	b	0x467275c <_ChromeMain+0x466d4c0>
 4673184: 52803600     	mov	w0, #0x1b0              ; =432
 4673188: 96e67078     	bl	0xf368 <_ChromeMain+0xa0cc>
 467318c: aa0003f5     	mov	x21, x0
 4673190: aa1403e1     	mov	x1, x20
 4673194: 9721ca7b     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4673198: 17fffe20     	b	0x4672a18 <_ChromeMain+0x466d77c>
 467319c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46731a0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46731a4: 910043fd     	add	x29, sp, #0x10
 46731a8: aa0003f3     	mov	x19, x0
 46731ac: f00505a8     	adrp	x8, 0xe72a000 <dyld_stub_binder+0xe72a000>
 46731b0: 91174108     	add	x8, x8, #0x5d0
 46731b4: 91118109     	add	x9, x8, #0x460
 46731b8: a9002408     	stp	x8, x9, [x0]
 46731bc: 91122109     	add	x9, x8, #0x488
 46731c0: f9000809     	str	x9, [x0, #0x10]
 46731c4: 91130109     	add	x9, x8, #0x4c0
 46731c8: 9113c10a     	add	x10, x8, #0x4f0
 46731cc: a906a809     	stp	x9, x10, [x0, #0x68]
 46731d0: 91150109     	add	x9, x8, #0x540
 46731d4: f9005809     	str	x9, [x0, #0xb0]
 46731d8: 91168109     	add	x9, x8, #0x5a0
 46731dc: f9006c09     	str	x9, [x0, #0xd8]
 46731e0: 91174109     	add	x9, x8, #0x5d0
 46731e4: f9007c09     	str	x9, [x0, #0xf8]
 46731e8: 9117e109     	add	x9, x8, #0x5f8
 46731ec: f9018809     	str	x9, [x0, #0x310]
 46731f0: 9119e109     	add	x9, x8, #0x678
 46731f4: f9018c09     	str	x9, [x0, #0x318]
 46731f8: 911ce108     	add	x8, x8, #0x738
 46731fc: f9019008     	str	x8, [x0, #0x320]
 4673200: f942e800     	ldr	x0, [x0, #0x5d0]
 4673204: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4673208: f00529f4     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 467320c: f9404689     	ldr	x9, [x20, #0x88]
 4673210: eb09011f     	cmp	x8, x9
 4673214: 54000041     	b.ne	0x467321c <_ChromeMain+0x466df80>
 4673218: 96e6be09     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 467321c: f902ea7f     	str	xzr, [x19, #0x5d0]
 4673220: f942e660     	ldr	x0, [x19, #0x5c8]
 4673224: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4673228: f9404689     	ldr	x9, [x20, #0x88]
 467322c: eb09011f     	cmp	x8, x9
 4673230: 54000041     	b.ne	0x4673238 <_ChromeMain+0x466df9c>
 4673234: 96e6be02     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4673238: f902e67f     	str	xzr, [x19, #0x5c8]
 467323c: f942e260     	ldr	x0, [x19, #0x5c0]
 4673240: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4673244: f9404689     	ldr	x9, [x20, #0x88]
 4673248: eb09011f     	cmp	x8, x9
 467324c: 54000041     	b.ne	0x4673254 <_ChromeMain+0x466dfb8>
 4673250: 96e6bdfb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4673254: f902e27f     	str	xzr, [x19, #0x5c0]
 4673258: f942de60     	ldr	x0, [x19, #0x5b8]
 467325c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4673260: f9404689     	ldr	x9, [x20, #0x88]
 4673264: eb09011f     	cmp	x8, x9
 4673268: 54000041     	b.ne	0x4673270 <_ChromeMain+0x466dfd4>
 467326c: 96e6bdf4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4673270: f902de7f     	str	xzr, [x19, #0x5b8]
 4673274: f942da60     	ldr	x0, [x19, #0x5b0]
 4673278: 925e7408     	and	x8, x0, #0xfffffffc00000000
 467327c: f9404689     	ldr	x9, [x20, #0x88]
 4673280: eb09011f     	cmp	x8, x9
 4673284: 54000041     	b.ne	0x467328c <_ChromeMain+0x466dff0>
 4673288: 96e6bded     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 467328c: f902da7f     	str	xzr, [x19, #0x5b0]
 4673290: f942d660     	ldr	x0, [x19, #0x5a8]
 4673294: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4673298: f9404689     	ldr	x9, [x20, #0x88]
 467329c: eb09011f     	cmp	x8, x9
 46732a0: 54000041     	b.ne	0x46732a8 <_ChromeMain+0x466e00c>
 46732a4: 96e6bde6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46732a8: f902d67f     	str	xzr, [x19, #0x5a8]
 46732ac: f942d260     	ldr	x0, [x19, #0x5a0]
 46732b0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46732b4: f9404689     	ldr	x9, [x20, #0x88]
 46732b8: eb09011f     	cmp	x8, x9
 46732bc: 54000041     	b.ne	0x46732c4 <_ChromeMain+0x466e028>
 46732c0: 96e6bddf     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46732c4: f902d27f     	str	xzr, [x19, #0x5a0]
 46732c8: f942ce60     	ldr	x0, [x19, #0x598]
 46732cc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46732d0: f9404689     	ldr	x9, [x20, #0x88]
 46732d4: eb09011f     	cmp	x8, x9
 46732d8: 54000041     	b.ne	0x46732e0 <_ChromeMain+0x466e044>
 46732dc: 96e6bdd8     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46732e0: f902ce7f     	str	xzr, [x19, #0x598]
 46732e4: f942ca60     	ldr	x0, [x19, #0x590]
 46732e8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46732ec: f9404689     	ldr	x9, [x20, #0x88]
 46732f0: eb09011f     	cmp	x8, x9
 46732f4: 54000041     	b.ne	0x46732fc <_ChromeMain+0x466e060>
 46732f8: 96e6bdd1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46732fc: f902ca7f     	str	xzr, [x19, #0x590]
 4673300: f942c660     	ldr	x0, [x19, #0x588]
 4673304: b5000600     	cbnz	x0, 0x46733c4 <_ChromeMain+0x466e128>
 4673308: f942c260     	ldr	x0, [x19, #0x580]
 467330c: b5000320     	cbnz	x0, 0x4673370 <_ChromeMain+0x466e0d4>
 4673310: f942be60     	ldr	x0, [x19, #0x578]
 4673314: b50004a0     	cbnz	x0, 0x46733a8 <_ChromeMain+0x466e10c>
 4673318: f942ba60     	ldr	x0, [x19, #0x570]
 467331c: b5000380     	cbnz	x0, 0x467338c <_ChromeMain+0x466e0f0>
 4673320: 39558268     	ldrb	w8, [x19, #0x560]
 4673324: 34000068     	cbz	w8, 0x4673330 <_ChromeMain+0x466e094>
 4673328: 9113a260     	add	x0, x19, #0x4e8
 467332c: 97fedf5d     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 4673330: 39d37e68     	ldrsb	w8, [x19, #0x4df]
 4673334: 36f800a8     	tbz	w8, #0x1f, 0x4673348 <_ChromeMain+0x466e0ac>
 4673338: f9426660     	ldr	x0, [x19, #0x4c8]
 467333c: f9426e68     	ldr	x8, [x19, #0x4d8]
 4673340: d37ff901     	lsl	x1, x8, #1
 4673344: 96e656dd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4673348: 39d31e68     	ldrsb	w8, [x19, #0x4c7]
 467334c: 36f800a8     	tbz	w8, #0x1f, 0x4673360 <_ChromeMain+0x466e0c4>
 4673350: f9425a60     	ldr	x0, [x19, #0x4b0]
 4673354: f9426268     	ldr	x8, [x19, #0x4c0]
 4673358: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 467335c: 96e656d7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4673360: aa1303e0     	mov	x0, x19
 4673364: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4673368: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 467336c: 176129f0     	b	0x1ebdb2c <_ChromeMain+0x1eb8890>
 4673370: 12800008     	mov	w8, #-0x1               ; =-1
 4673374: b8e80008     	ldaddal	w8, w8, [x0]
 4673378: 7100051f     	cmp	w8, #0x1
 467337c: 54fffca1     	b.ne	0x4673310 <_ChromeMain+0x466e074>
 4673380: f9400808     	ldr	x8, [x0, #0x10]
 4673384: d63f0100     	blr	x8
 4673388: 17ffffe2     	b	0x4673310 <_ChromeMain+0x466e074>
 467338c: 12800008     	mov	w8, #-0x1               ; =-1
 4673390: b8e80008     	ldaddal	w8, w8, [x0]
 4673394: 7100051f     	cmp	w8, #0x1
 4673398: 54fffc41     	b.ne	0x4673320 <_ChromeMain+0x466e084>
 467339c: f9400808     	ldr	x8, [x0, #0x10]
 46733a0: d63f0100     	blr	x8
 46733a4: 17ffffdf     	b	0x4673320 <_ChromeMain+0x466e084>
 46733a8: 12800008     	mov	w8, #-0x1               ; =-1
 46733ac: b8e80008     	ldaddal	w8, w8, [x0]
 46733b0: 7100051f     	cmp	w8, #0x1
 46733b4: 54fffb21     	b.ne	0x4673318 <_ChromeMain+0x466e07c>
 46733b8: f9400808     	ldr	x8, [x0, #0x10]
 46733bc: d63f0100     	blr	x8
 46733c0: 17ffffd6     	b	0x4673318 <_ChromeMain+0x466e07c>
 46733c4: 12800008     	mov	w8, #-0x1               ; =-1
 46733c8: b8e80008     	ldaddal	w8, w8, [x0]
 46733cc: 7100051f     	cmp	w8, #0x1
 46733d0: 54fff9c1     	b.ne	0x4673308 <_ChromeMain+0x466e06c>
 46733d4: f9400808     	ldr	x8, [x0, #0x10]
 46733d8: d63f0100     	blr	x8
 46733dc: 17ffffcb     	b	0x4673308 <_ChromeMain+0x466e06c>
 46733e0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46733e4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46733e8: 910043fd     	add	x29, sp, #0x10
 46733ec: aa0003f3     	mov	x19, x0
 46733f0: 97ffff6b     	bl	0x467319c <_ChromeMain+0x466df00>
 46733f4: f00544a8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 46733f8: 91120108     	add	x8, x8, #0x480
 46733fc: f8bfc100     	ldapr	x0, [x8]
 4673400: b40000a0     	cbz	x0, 0x4673414 <_ChromeMain+0x466e178>
 4673404: aa1303e1     	mov	x1, x19
 4673408: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 467340c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4673410: 1723a5c4     	b	0xf5cb20 <_ChromeMain+0xf57884>
 4673414: 97f180b9     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4673418: 17fffffb     	b	0x4673404 <_ChromeMain+0x466e168>
 467341c: 00000000     	udf	#0x0
 4673420: 17ffde1a     	b	0x466ac88 <_ChromeMain+0x46659ec>
		...
 4673440: d103c3ff     	sub	sp, sp, #0xf0
 4673444: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 4673448: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 467344c: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 4673450: 910383fd     	add	x29, sp, #0xe0
 4673454: aa0103f3     	mov	x19, x1
 4673458: aa0003f4     	mov	x20, x0
 467345c: b9405028     	ldr	w8, [x1, #0x50]
 4673460: 12151108     	and	w8, w8, #0xf800
 4673464: 7140091f     	cmp	w8, #0x2, lsl #12       ; =0x2000
 4673468: 54000061     	b.ne	0x4673474 <_ChromeMain+0x466e1d8>
 467346c: 3955a288     	ldrb	w8, [x20, #0x568]
 4673470: 36000288     	tbz	w8, #0x0, 0x46734c0 <_ChromeMain+0x466e224>
 4673474: f9424280     	ldr	x0, [x20, #0x480]
 4673478: f9400008     	ldr	x8, [x0]
 467347c: f9400902     	ldr	x2, [x8, #0x10]
 4673480: aa1303e1     	mov	x1, x19
 4673484: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 4673488: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 467348c: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 4673490: 9103c3ff     	add	sp, sp, #0xf0
 4673494: d61f0040     	br	x2
 4673498: f9425a81     	ldr	x1, [x20, #0x4b0]
 467349c: f9425e82     	ldr	x2, [x20, #0x4b8]
 46734a0: 910003e0     	mov	x0, sp
 46734a4: 96e6935d     	bl	0x18218 <_ChromeMain+0x12f7c>
 46734a8: 1400000f     	b	0x46734e4 <_ChromeMain+0x466e248>
 46734ac: f9426681     	ldr	x1, [x20, #0x4c8]
 46734b0: f9426a82     	ldr	x2, [x20, #0x4d0]
 46734b4: 91006100     	add	x0, x8, #0x18
 46734b8: 96e74dc6     	bl	0x46bd0 <_ChromeMain+0x41934>
 46734bc: 14000012     	b	0x4673504 <_ChromeMain+0x466e268>
 46734c0: f942c688     	ldr	x8, [x20, #0x588]
 46734c4: b4fffd88     	cbz	x8, 0x4673474 <_ChromeMain+0x466e1d8>
 46734c8: 39d31e88     	ldrsb	w8, [x20, #0x4c7]
 46734cc: 37fffe68     	tbnz	w8, #0x1f, 0x4673498 <_ChromeMain+0x466e1fc>
 46734d0: 9112c288     	add	x8, x20, #0x4b0
 46734d4: 3dc00100     	ldr	q0, [x8]
 46734d8: 3d8003e0     	str	q0, [sp]
 46734dc: f9400908     	ldr	x8, [x8, #0x10]
 46734e0: f9000be8     	str	x8, [sp, #0x10]
 46734e4: 910003e8     	mov	x8, sp
 46734e8: 39d37e89     	ldrsb	w9, [x20, #0x4df]
 46734ec: 37fffe09     	tbnz	w9, #0x1f, 0x46734ac <_ChromeMain+0x466e210>
 46734f0: 91132289     	add	x9, x20, #0x4c8
 46734f4: 3dc00120     	ldr	q0, [x9]
 46734f8: 3c818100     	stur	q0, [x8, #0x18]
 46734fc: f9400929     	ldr	x9, [x9, #0x10]
 4673500: f8028109     	stur	x9, [x8, #0x28]
 4673504: b944e288     	ldr	w8, [x20, #0x4e0]
 4673508: b90033e8     	str	w8, [sp, #0x30]
 467350c: 7949ca88     	ldrh	w8, [x20, #0x4e4]
 4673510: 79006be8     	strh	w8, [sp, #0x34]
 4673514: 910003f6     	mov	x22, sp
 4673518: 3900e3ff     	strb	wzr, [sp, #0x38]
 467351c: 3902c3ff     	strb	wzr, [sp, #0xb0]
 4673520: 39558288     	ldrb	w8, [x20, #0x560]
 4673524: 340000c8     	cbz	w8, 0x467353c <_ChromeMain+0x466e2a0>
 4673528: 9100e2c0     	add	x0, x22, #0x38
 467352c: 9113a281     	add	x1, x20, #0x4e8
 4673530: 97fede14     	bl	0x462ad80 <_ChromeMain+0x4625ae4>
 4673534: 52800028     	mov	w8, #0x1                ; =1
 4673538: 3902c3e8     	strb	w8, [sp, #0xb0]
 467353c: f942c695     	ldr	x21, [x20, #0x588]
 4673540: b4000595     	cbz	x21, 0x46735f0 <_ChromeMain+0x466e354>
 4673544: 52800028     	mov	w8, #0x1                ; =1
 4673548: b82802a8     	ldadd	w8, w8, [x21]
 467354c: 7100011f     	cmp	w8, #0x0
 4673550: 5400056d     	b.le	0x46735fc <_ChromeMain+0x466e360>
 4673554: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4673558: 6b09011f     	cmp	w8, w9
 467355c: 54000560     	b.eq	0x4673608 <_ChromeMain+0x466e36c>
 4673560: f942c688     	ldr	x8, [x20, #0x588]
 4673564: f9400508     	ldr	x8, [x8, #0x8]
 4673568: 910003e2     	mov	x2, sp
 467356c: aa1503e0     	mov	x0, x21
 4673570: aa1403e1     	mov	x1, x20
 4673574: aa1303e3     	mov	x3, x19
 4673578: d63f0100     	blr	x8
 467357c: 12800008     	mov	w8, #-0x1               ; =-1
 4673580: b8e802a8     	ldaddal	w8, w8, [x21]
 4673584: 7100051f     	cmp	w8, #0x1
 4673588: 54000081     	b.ne	0x4673598 <_ChromeMain+0x466e2fc>
 467358c: f9400aa8     	ldr	x8, [x21, #0x10]
 4673590: aa1503e0     	mov	x0, x21
 4673594: d63f0100     	blr	x8
 4673598: 3942c3e8     	ldrb	w8, [sp, #0xb0]
 467359c: 36000068     	tbz	w8, #0x0, 0x46735a8 <_ChromeMain+0x466e30c>
 46735a0: 9100e2c0     	add	x0, x22, #0x38
 46735a4: 97fedebf     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 46735a8: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 46735ac: 36f800a8     	tbz	w8, #0x1f, 0x46735c0 <_ChromeMain+0x466e324>
 46735b0: f9400fe0     	ldr	x0, [sp, #0x18]
 46735b4: f94017e8     	ldr	x8, [sp, #0x28]
 46735b8: d37ff901     	lsl	x1, x8, #1
 46735bc: 96e6563f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46735c0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 46735c4: 36f800a8     	tbz	w8, #0x1f, 0x46735d8 <_ChromeMain+0x466e33c>
 46735c8: f94003e0     	ldr	x0, [sp]
 46735cc: f9400be8     	ldr	x8, [sp, #0x10]
 46735d0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46735d4: 96e65639     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46735d8: 52800020     	mov	w0, #0x1                ; =1
 46735dc: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 46735e0: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 46735e4: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 46735e8: 9103c3ff     	add	sp, sp, #0xf0
 46735ec: d65f03c0     	ret
 46735f0: d4200000     	brk	#0
 46735f4: d4400000     	hlt	#0
 46735f8: d4200020     	brk	#0x1
 46735fc: d4200000     	brk	#0
 4673600: d4400000     	hlt	#0
 4673604: d4200020     	brk	#0x1
 4673608: d4200000     	brk	#0
 467360c: d4400000     	hlt	#0
 4673610: d4200020     	brk	#0x1
 4673614: d100c3ff     	sub	sp, sp, #0x30
 4673618: a9014ff4     	stp	x20, x19, [sp, #0x10]
 467361c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4673620: 910083fd     	add	x29, sp, #0x20
 4673624: 91176014     	add	x20, x0, #0x5d8
 4673628: 39578008     	ldrb	w8, [x0, #0x5e0]
 467362c: 350002e8     	cbnz	w8, 0x4673688 <_ChromeMain+0x466e3ec>
 4673630: aa0003f3     	mov	x19, x0
 4673634: f942f408     	ldr	x8, [x0, #0x5e8]
 4673638: 91000508     	add	x8, x8, #0x1
 467363c: f902f408     	str	x8, [x0, #0x5e8]
 4673640: 390003ff     	strb	wzr, [sp]
 4673644: 390013ff     	strb	wzr, [sp, #0x4]
 4673648: 390023ff     	strb	wzr, [sp, #0x8]
 467364c: 390033ff     	strb	wzr, [sp, #0xc]
 4673650: 910003e1     	mov	x1, sp
 4673654: 97d2d7e1     	bl	0x3b295d8 <_ChromeMain+0x3b2433c>
 4673658: aa0003e8     	mov	x8, x0
 467365c: d2c00400     	mov	x0, #0x2000000000       ; =137438953472
 4673660: b3407d00     	bfxil	x0, x8, #0, #32
 4673664: 39578268     	ldrb	w8, [x19, #0x5e0]
 4673668: 350000c8     	cbnz	w8, 0x4673680 <_ChromeMain+0x466e3e4>
 467366c: b4000194     	cbz	x20, 0x467369c <_ChromeMain+0x466e400>
 4673670: f902ee60     	str	x0, [x19, #0x5d8]
 4673674: 52800028     	mov	w8, #0x1                ; =1
 4673678: 39178268     	strb	w8, [x19, #0x5e0]
 467367c: 14000004     	b	0x467368c <_ChromeMain+0x466e3f0>
 4673680: f9000280     	str	x0, [x20]
 4673684: 14000002     	b	0x467368c <_ChromeMain+0x466e3f0>
 4673688: f9400280     	ldr	x0, [x20]
 467368c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4673690: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4673694: 9100c3ff     	add	sp, sp, #0x30
 4673698: d65f03c0     	ret
 467369c: d4200020     	brk	#0x1
 46736a0: 39578008     	ldrb	w8, [x0, #0x5e0]
 46736a4: 34000048     	cbz	w8, 0x46736ac <_ChromeMain+0x466e410>
 46736a8: 3917801f     	strb	wzr, [x0, #0x5e0]
 46736ac: f9400008     	ldr	x8, [x0]
 46736b0: f9418501     	ldr	x1, [x8, #0x308]
 46736b4: d61f0020     	br	x1
		...
 46736c0: f9400428     	ldr	x8, [x1, #0x8]
 46736c4: eb00011f     	cmp	x8, x0
 46736c8: 540000a0     	b.eq	0x46736dc <_ChromeMain+0x466e440>
 46736cc: f942d009     	ldr	x9, [x0, #0x5a0]
 46736d0: eb09011f     	cmp	x8, x9
 46736d4: 54000040     	b.eq	0x46736dc <_ChromeMain+0x466e440>
 46736d8: d65f03c0     	ret
 46736dc: 39578008     	ldrb	w8, [x0, #0x5e0]
 46736e0: 34000048     	cbz	w8, 0x46736e8 <_ChromeMain+0x466e44c>
 46736e4: 3917801f     	strb	wzr, [x0, #0x5e0]
 46736e8: f9400008     	ldr	x8, [x0]
 46736ec: f9418501     	ldr	x1, [x8, #0x308]
 46736f0: d61f0020     	br	x1
 46736f4: d503201f     	nop
 46736f8: d503201f     	nop
 46736fc: d503201f     	nop
 4673700: d103c3ff     	sub	sp, sp, #0xf0
 4673704: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 4673708: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 467370c: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 4673710: 910383fd     	add	x29, sp, #0xe0
 4673714: aa0103f3     	mov	x19, x1
 4673718: aa0003f4     	mov	x20, x0
 467371c: b943bc08     	ldr	w8, [x0, #0x3bc]
 4673720: 35000068     	cbnz	w8, 0x467372c <_ChromeMain+0x466e490>
 4673724: 3955aa88     	ldrb	w8, [x20, #0x56a]
 4673728: 36000988     	tbz	w8, #0x0, 0x4673858 <_ChromeMain+0x466e5bc>
 467372c: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 4673730: 6f00e400     	movi.2d	v0, #0000000000000000
 4673734: 3c8383e0     	stur	q0, [sp, #0x38]
 4673738: 3c8483e0     	stur	q0, [sp, #0x48]
 467373c: f9002fff     	str	xzr, [sp, #0x58]
 4673740: d2806029     	mov	x9, #0x301              ; =769
 4673744: f2f7f009     	movk	x9, #0xbf80, lsl #48
 4673748: a902a7e8     	stp	x8, x9, [sp, #0x28]
 467374c: aa1403e0     	mov	x0, x20
 4673750: 96fcb628     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4673754: 3955aa88     	ldrb	w8, [x20, #0x56a]
 4673758: 52801ee9     	mov	w9, #0xf7               ; =247
 467375c: 52801aca     	mov	w10, #0xd6              ; =214
 4673760: 7100011f     	cmp	w8, #0x0
 4673764: 1a891141     	csel	w1, w10, w9, ne
 4673768: 9722d298     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 467376c: 971d6d7f     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4673770: 2d0307e0     	stp	s0, s1, [sp, #0x18]
 4673774: 2d040fe2     	stp	s2, s3, [sp, #0x20]
 4673778: 91070288     	add	x8, x20, #0x1c0
 467377c: f81d03bf     	stur	xzr, [x29, #-0x30]
 4673780: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 4673784: f004c628     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4673788: 3dc01101     	ldr	q1, [x8, #0x40]
 467378c: 6ee14400     	ushl.2d	v0, v0, v1
 4673790: 0ea12800     	xtn.2s	v0, v0
 4673794: 6f00e401     	movi.2d	v1, #0000000000000000
 4673798: 0ea16400     	smax.2s	v0, v0, v1
 467379c: 2e21d800     	ucvtf.2s	v0, v0
 46737a0: fc1d83a0     	stur	d0, [x29, #-0x28]
 46737a4: 4f046400     	movi.4s	v0, #0x80, lsl #24
 46737a8: 3d801fe0     	str	q0, [sp, #0x70]
 46737ac: d100c3a0     	sub	x0, x29, #0x30
 46737b0: 9101c3e1     	add	x1, sp, #0x70
 46737b4: 96e6a253     	bl	0x1c100 <_ChromeMain+0x16e64>
 46737b8: d100c3a0     	sub	x0, x29, #0x30
 46737bc: 97435b2e     	bl	0x174a474 <_ChromeMain+0x17451d8>
 46737c0: 2d0c07e0     	stp	s0, s1, [sp, #0x60]
 46737c4: 2d0d0fe2     	stp	s2, s3, [sp, #0x68]
 46737c8: 6f00e400     	movi.2d	v0, #0000000000000000
 46737cc: ad0383e0     	stp	q0, q0, [sp, #0x70]
 46737d0: 3d8027e0     	str	q0, [sp, #0x90]
 46737d4: b900a3ff     	str	wzr, [sp, #0xa0]
 46737d8: 9101c3e0     	add	x0, sp, #0x70
 46737dc: 910183e1     	add	x1, sp, #0x60
 46737e0: 1e249000     	fmov	s0, #10.00000000
 46737e4: 1e249001     	fmov	s1, #10.00000000
 46737e8: 9709d686     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 46737ec: 910023e8     	add	x8, sp, #0x8
 46737f0: 9101c3e0     	add	x0, sp, #0x70
 46737f4: 52800001     	mov	w1, #0x0                ; =0
 46737f8: 97092b36     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 46737fc: f9406260     	ldr	x0, [x19, #0xc0]
 4673800: f9400008     	ldr	x8, [x0]
 4673804: f9408908     	ldr	x8, [x8, #0x110]
 4673808: 910023e1     	add	x1, sp, #0x8
 467380c: 910063e2     	add	x2, sp, #0x18
 4673810: 52800023     	mov	w3, #0x1                ; =1
 4673814: d63f0100     	blr	x8
 4673818: f94007e0     	ldr	x0, [sp, #0x8]
 467381c: b40000a0     	cbz	x0, 0x4673830 <_ChromeMain+0x466e594>
 4673820: 12800008     	mov	w8, #-0x1               ; =-1
 4673824: b8e80008     	ldaddal	w8, w8, [x0]
 4673828: 7100051f     	cmp	w8, #0x1
 467382c: 54000200     	b.eq	0x467386c <_ChromeMain+0x466e5d0>
 4673830: f9402fe0     	ldr	x0, [sp, #0x58]
 4673834: b50005a0     	cbnz	x0, 0x46738e8 <_ChromeMain+0x466e64c>
 4673838: f9402be0     	ldr	x0, [sp, #0x50]
 467383c: b5000440     	cbnz	x0, 0x46738c4 <_ChromeMain+0x466e628>
 4673840: f94027e0     	ldr	x0, [sp, #0x48]
 4673844: b5000760     	cbnz	x0, 0x4673930 <_ChromeMain+0x466e694>
 4673848: f94023e0     	ldr	x0, [sp, #0x40]
 467384c: b5000200     	cbnz	x0, 0x467388c <_ChromeMain+0x466e5f0>
 4673850: f9401fe0     	ldr	x0, [sp, #0x38]
 4673854: b50005c0     	cbnz	x0, 0x467390c <_ChromeMain+0x466e670>
 4673858: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 467385c: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 4673860: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 4673864: 9103c3ff     	add	sp, sp, #0xf0
 4673868: d65f03c0     	ret
 467386c: b9802808     	ldrsw	x8, [x0, #0x28]
 4673870: 35000728     	cbnz	w8, 0x4673954 <_ChromeMain+0x466e6b8>
 4673874: 3940b008     	ldrb	w8, [x0, #0x2c]
 4673878: 37000b28     	tbnz	w8, #0x0, 0x46739dc <_ChromeMain+0x466e740>
 467387c: f9400813     	ldr	x19, [x0, #0x10]
 4673880: b5000bb3     	cbnz	x19, 0x46739f4 <_ChromeMain+0x466e758>
 4673884: 96e68379     	bl	0x14668 <_ChromeMain+0xf3cc>
 4673888: 17ffffea     	b	0x4673830 <_ChromeMain+0x466e594>
 467388c: 91002008     	add	x8, x0, #0x8
 4673890: 12800009     	mov	w9, #-0x1               ; =-1
 4673894: b8e90108     	ldaddal	w9, w8, [x8]
 4673898: 7100051f     	cmp	w8, #0x1
 467389c: 54fffda1     	b.ne	0x4673850 <_ChromeMain+0x466e5b4>
 46738a0: f9400009     	ldr	x9, [x0]
 46738a4: f9400928     	ldr	x8, [x9, #0x10]
 46738a8: d0fdcd8a     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 46738ac: 9106014a     	add	x10, x10, #0x180
 46738b0: eb0a011f     	cmp	x8, x10
 46738b4: 54000041     	b.ne	0x46738bc <_ChromeMain+0x466e620>
 46738b8: f9400528     	ldr	x8, [x9, #0x8]
 46738bc: d63f0100     	blr	x8
 46738c0: 17ffffe4     	b	0x4673850 <_ChromeMain+0x466e5b4>
 46738c4: 91002008     	add	x8, x0, #0x8
 46738c8: 12800009     	mov	w9, #-0x1               ; =-1
 46738cc: b8e90108     	ldaddal	w9, w8, [x8]
 46738d0: 7100051f     	cmp	w8, #0x1
 46738d4: 54fffb61     	b.ne	0x4673840 <_ChromeMain+0x466e5a4>
 46738d8: f9400008     	ldr	x8, [x0]
 46738dc: f9400908     	ldr	x8, [x8, #0x10]
 46738e0: d63f0100     	blr	x8
 46738e4: 17ffffd7     	b	0x4673840 <_ChromeMain+0x466e5a4>
 46738e8: 91002008     	add	x8, x0, #0x8
 46738ec: 12800009     	mov	w9, #-0x1               ; =-1
 46738f0: b8e90108     	ldaddal	w9, w8, [x8]
 46738f4: 7100051f     	cmp	w8, #0x1
 46738f8: 54fffa01     	b.ne	0x4673838 <_ChromeMain+0x466e59c>
 46738fc: f9400008     	ldr	x8, [x0]
 4673900: f9400908     	ldr	x8, [x8, #0x10]
 4673904: d63f0100     	blr	x8
 4673908: 17ffffcc     	b	0x4673838 <_ChromeMain+0x466e59c>
 467390c: 91002008     	add	x8, x0, #0x8
 4673910: 12800009     	mov	w9, #-0x1               ; =-1
 4673914: b8e90108     	ldaddal	w9, w8, [x8]
 4673918: 7100051f     	cmp	w8, #0x1
 467391c: 54fff9e1     	b.ne	0x4673858 <_ChromeMain+0x466e5bc>
 4673920: f9400008     	ldr	x8, [x0]
 4673924: f9400908     	ldr	x8, [x8, #0x10]
 4673928: d63f0100     	blr	x8
 467392c: 17ffffcb     	b	0x4673858 <_ChromeMain+0x466e5bc>
 4673930: 91002008     	add	x8, x0, #0x8
 4673934: 12800009     	mov	w9, #-0x1               ; =-1
 4673938: b8e90108     	ldaddal	w9, w8, [x8]
 467393c: 7100051f     	cmp	w8, #0x1
 4673940: 54fff841     	b.ne	0x4673848 <_ChromeMain+0x466e5ac>
 4673944: f9400008     	ldr	x8, [x0]
 4673948: f9400908     	ldr	x8, [x8, #0x10]
 467394c: d63f0100     	blr	x8
 4673950: 17ffffbe     	b	0x4673848 <_ChromeMain+0x466e5ac>
 4673954: aa0003f3     	mov	x19, x0
 4673958: f9401014     	ldr	x20, [x0, #0x20]
 467395c: d37df115     	lsl	x21, x8, #3
 4673960: f9400288     	ldr	x8, [x20]
 4673964: 1940c108     	ldapurb	w8, [x8, #0xc]
 4673968: 370000a8     	tbnz	w8, #0x0, 0x467397c <_ChromeMain+0x466e6e0>
 467396c: f9400280     	ldr	x0, [x20]
 4673970: f9400008     	ldr	x8, [x0]
 4673974: f9400d08     	ldr	x8, [x8, #0x18]
 4673978: d63f0100     	blr	x8
 467397c: 91002294     	add	x20, x20, #0x8
 4673980: f10022b5     	subs	x21, x21, #0x8
 4673984: 54fffee1     	b.ne	0x4673960 <_ChromeMain+0x466e6c4>
 4673988: aa1303e0     	mov	x0, x19
 467398c: b9802a68     	ldrsw	x8, [x19, #0x28]
 4673990: 34fff728     	cbz	w8, 0x4673874 <_ChromeMain+0x466e5d8>
 4673994: f9401014     	ldr	x20, [x0, #0x20]
 4673998: 8b080e95     	add	x21, x20, x8, lsl #3
 467399c: 12800016     	mov	w22, #-0x1              ; =-1
 46739a0: 14000008     	b	0x46739c0 <_ChromeMain+0x466e724>
 46739a4: f9400008     	ldr	x8, [x0]
 46739a8: f9400908     	ldr	x8, [x8, #0x10]
 46739ac: d63f0100     	blr	x8
 46739b0: 91002294     	add	x20, x20, #0x8
 46739b4: eb15029f     	cmp	x20, x21
 46739b8: aa1303e0     	mov	x0, x19
 46739bc: 54fff5c2     	b.hs	0x4673874 <_ChromeMain+0x466e5d8>
 46739c0: f9400280     	ldr	x0, [x20]
 46739c4: b4ffff60     	cbz	x0, 0x46739b0 <_ChromeMain+0x466e714>
 46739c8: 91002008     	add	x8, x0, #0x8
 46739cc: b8f60108     	ldaddal	w22, w8, [x8]
 46739d0: 7100051f     	cmp	w8, #0x1
 46739d4: 54fffee1     	b.ne	0x46739b0 <_ChromeMain+0x466e714>
 46739d8: 17fffff3     	b	0x46739a4 <_ChromeMain+0x466e708>
 46739dc: f9401008     	ldr	x8, [x0, #0x20]
 46739e0: aa0003f3     	mov	x19, x0
 46739e4: aa0803e0     	mov	x0, x8
 46739e8: 96e8bb83     	bl	0xa27f4 <_ChromeMain+0x9d558>
 46739ec: aa1303e0     	mov	x0, x19
 46739f0: 17ffffa3     	b	0x467387c <_ChromeMain+0x466e5e0>
 46739f4: f9400268     	ldr	x8, [x19]
 46739f8: aa0003f4     	mov	x20, x0
 46739fc: aa0803e0     	mov	x0, x8
 4673a00: 94e6e2f0     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 4673a04: aa1303e0     	mov	x0, x19
 4673a08: 52800101     	mov	w1, #0x8                ; =8
 4673a0c: 96e6552b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4673a10: aa1403e0     	mov	x0, x20
 4673a14: 17ffff9c     	b	0x4673884 <_ChromeMain+0x466e5e8>
 4673a18: 17fff9ea     	b	0x46721c0 <_ChromeMain+0x466cf24>
 4673a1c: 00000000     	udf	#0x0
 4673a20: d1002000     	sub	x0, x0, #0x8
 4673a24: 17fffdde     	b	0x467319c <_ChromeMain+0x466df00>
 4673a28: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4673a2c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4673a30: 910043fd     	add	x29, sp, #0x10
 4673a34: d1002013     	sub	x19, x0, #0x8
 4673a38: aa1303e0     	mov	x0, x19
 4673a3c: 97fffdd8     	bl	0x467319c <_ChromeMain+0x466df00>
