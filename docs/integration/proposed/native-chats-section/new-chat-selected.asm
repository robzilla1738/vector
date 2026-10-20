
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46695b0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46695b4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46695b8: 910043fd     	add	x29, sp, #0x10
 46695bc: f9426013     	ldr	x19, [x0, #0x4c0]
 46695c0: b4000213     	cbz	x19, 0x4669600 <_ChromeMain+0x4664364>
 46695c4: 52800028     	mov	w8, #0x1                ; =1
 46695c8: b8280268     	ldadd	w8, w8, [x19]
 46695cc: 7100011f     	cmp	w8, #0x0
 46695d0: 5400028d     	b.le	0x4669620 <_ChromeMain+0x4664384>
 46695d4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 46695d8: 6b09011f     	cmp	w8, w9
 46695dc: 54000280     	b.eq	0x466962c <_ChromeMain+0x4664390>
 46695e0: f9426008     	ldr	x8, [x0, #0x4c0]
 46695e4: f9400508     	ldr	x8, [x8, #0x8]
 46695e8: aa1303e0     	mov	x0, x19
 46695ec: d63f0100     	blr	x8
 46695f0: 12800008     	mov	w8, #-0x1               ; =-1
 46695f4: b8e80268     	ldaddal	w8, w8, [x19]
 46695f8: 7100051f     	cmp	w8, #0x1
 46695fc: 54000080     	b.eq	0x466960c <_ChromeMain+0x4664370>
 4669600: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4669604: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4669608: d65f03c0     	ret
 466960c: f9400a61     	ldr	x1, [x19, #0x10]
 4669610: aa1303e0     	mov	x0, x19
 4669614: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4669618: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 466961c: d61f0020     	br	x1
 4669620: d4200000     	brk	#0
 4669624: d4400000     	hlt	#0
 4669628: d4200020     	brk	#0x1
 466962c: d4200000     	brk	#0
 4669630: d4400000     	hlt	#0
 4669634: d4200020     	brk	#0x1
		...
 4669640: d101c3ff     	sub	sp, sp, #0x70
 4669644: a90457f6     	stp	x22, x21, [sp, #0x40]
 4669648: a9054ff4     	stp	x20, x19, [sp, #0x50]
 466964c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4669650: 910183fd     	add	x29, sp, #0x60
 4669654: aa0003f3     	mov	x19, x0
 4669658: f9426800     	ldr	x0, [x0, #0x4d0]
 466965c: 52801c35     	mov	w21, #0xe1              ; =225
 4669660: b81d83b5     	stur	w21, [x29, #-0x28]
 4669664: 381dc3bf     	sturb	wzr, [x29, #-0x24]
 4669668: f9400008     	ldr	x8, [x0]
 466966c: f941f508     	ldr	x8, [x8, #0x3e8]
 4669670: d100a3a1     	sub	x1, x29, #0x28
 4669674: d63f0100     	blr	x8
 4669678: f9426674     	ldr	x20, [x19, #0x4c8]
 466967c: b9000bf5     	str	w21, [sp, #0x8]
 4669680: 390033ff     	strb	wzr, [sp, #0xc]
 4669684: f0051b40     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4669688: 91398000     	add	x0, x0, #0xe60
 466968c: 910043e8     	add	x8, sp, #0x10
 4669690: 910023e1     	add	x1, sp, #0x8
 4669694: 52800202     	mov	w2, #0x10               ; =16
 4669698: d2800003     	mov	x3, #0x0                ; =0
 466969c: 971e2ca1     	bl	0xdf4920 <_ChromeMain+0xdef684>
 46696a0: 910043e1     	add	x1, sp, #0x10
 46696a4: aa1403e0     	mov	x0, x20
 46696a8: 96fcde7e     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 46696ac: 910043e0     	add	x0, sp, #0x10
 46696b0: 97077464     	bl	0x846840 <_ChromeMain+0x8415a4>
 46696b4: aa1303e0     	mov	x0, x19
 46696b8: 52800001     	mov	w1, #0x0                ; =0
 46696bc: 96ff1b6e     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46696c0: aa1303e0     	mov	x0, x19
 46696c4: 96fcdeae     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46696c8: f940c660     	ldr	x0, [x19, #0x188]
 46696cc: b4000040     	cbz	x0, 0x46696d4 <_ChromeMain+0x4664438>
 46696d0: 96fcdeab     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46696d4: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 46696d8: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 46696dc: a94457f6     	ldp	x22, x21, [sp, #0x40]
 46696e0: 9101c3ff     	add	sp, sp, #0x70
 46696e4: d65f03c0     	ret
 46696e8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46696ec: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46696f0: 910043fd     	add	x29, sp, #0x10
 46696f4: aa0003f3     	mov	x19, x0
 46696f8: f00505e8     	adrp	x8, 0xe728000 <dyld_stub_binder+0xe728000>
 46696fc: 91114108     	add	x8, x8, #0x450
 4669700: 91118109     	add	x9, x8, #0x460
 4669704: a9002408     	stp	x8, x9, [x0]
 4669708: 91122109     	add	x9, x8, #0x488
 466970c: f9000809     	str	x9, [x0, #0x10]
 4669710: 91130109     	add	x9, x8, #0x4c0
 4669714: 9113c10a     	add	x10, x8, #0x4f0
 4669718: a906a809     	stp	x9, x10, [x0, #0x68]
 466971c: 91150109     	add	x9, x8, #0x540
 4669720: f9005809     	str	x9, [x0, #0xb0]
 4669724: 91168109     	add	x9, x8, #0x5a0
 4669728: f9006c09     	str	x9, [x0, #0xd8]
 466972c: 91174109     	add	x9, x8, #0x5d0
 4669730: f9007c09     	str	x9, [x0, #0xf8]
 4669734: 9117e109     	add	x9, x8, #0x5f8
 4669738: f9018809     	str	x9, [x0, #0x310]
 466973c: 9119e109     	add	x9, x8, #0x678
 4669740: f9018c09     	str	x9, [x0, #0x318]
 4669744: 911ce108     	add	x8, x8, #0x738
 4669748: f9019008     	str	x8, [x0, #0x320]
 466974c: f9426800     	ldr	x0, [x0, #0x4d0]
 4669750: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4669754: b0052a54     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4669758: f9404689     	ldr	x9, [x20, #0x88]
 466975c: eb09011f     	cmp	x8, x9
 4669760: 54000041     	b.ne	0x4669768 <_ChromeMain+0x46644cc>
 4669764: 96e6e4b6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4669768: f9026a7f     	str	xzr, [x19, #0x4d0]
 466976c: f9426660     	ldr	x0, [x19, #0x4c8]
 4669770: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4669774: f9404689     	ldr	x9, [x20, #0x88]
 4669778: eb09011f     	cmp	x8, x9
 466977c: 54000041     	b.ne	0x4669784 <_ChromeMain+0x46644e8>
 4669780: 96e6e4af     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4669784: f902667f     	str	xzr, [x19, #0x4c8]
 4669788: f9426260     	ldr	x0, [x19, #0x4c0]
 466978c: b50000a0     	cbnz	x0, 0x46697a0 <_ChromeMain+0x4664504>
 4669790: aa1303e0     	mov	x0, x19
 4669794: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4669798: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 466979c: 176150e4     	b	0x1ebdb2c <_ChromeMain+0x1eb8890>
 46697a0: 12800008     	mov	w8, #-0x1               ; =-1
 46697a4: b8e80008     	ldaddal	w8, w8, [x0]
 46697a8: 7100051f     	cmp	w8, #0x1
 46697ac: 54ffff21     	b.ne	0x4669790 <_ChromeMain+0x46644f4>
 46697b0: f9400808     	ldr	x8, [x0, #0x10]
 46697b4: d63f0100     	blr	x8
 46697b8: 17fffff6     	b	0x4669790 <_ChromeMain+0x46644f4>
 46697bc: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46697c0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46697c4: 910043fd     	add	x29, sp, #0x10
 46697c8: aa0003f3     	mov	x19, x0
 46697cc: 97ffffc7     	bl	0x46696e8 <_ChromeMain+0x466444c>
 46697d0: b0054508     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 46697d4: 91120108     	add	x8, x8, #0x480
 46697d8: f8bfc100     	ldapr	x0, [x8]
 46697dc: b40000a0     	cbz	x0, 0x46697f0 <_ChromeMain+0x4664554>
 46697e0: aa1303e1     	mov	x1, x19
 46697e4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46697e8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46697ec: 1723cccd     	b	0xf5cb20 <_ChromeMain+0xf57884>
 46697f0: 97f1a7c2     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 46697f4: 17fffffb     	b	0x46697e0 <_ChromeMain+0x4664544>
 46697f8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 46697fc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4669800: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4669804: 910083fd     	add	x29, sp, #0x20
 4669808: d0054395     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 466980c: f9443eb3     	ldr	x19, [x21, #0x878]
 4669810: b5000653     	cbnz	x19, 0x46698d8 <_ChromeMain+0x466463c>
 4669814: 52800d00     	mov	w0, #0x68               ; =104
 4669818: 96e696d4     	bl	0xf368 <_ChromeMain+0xa0cc>
 466981c: aa0003f3     	mov	x19, x0
 4669820: d004c301     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4669824: 912c7821     	add	x1, x1, #0xb1e
 4669828: 528008a2     	mov	w2, #0x45               ; =69
 466982c: 5281b163     	mov	w3, #0xd8b              ; =3467
 4669830: 96faf752     	bl	0x527578 <_ChromeMain+0x5222dc>
 4669834: 9004f508     	adrp	x8, 0xe509000 <dyld_stub_binder+0xe509000>
 4669838: 91018108     	add	x8, x8, #0x60
 466983c: f004c309     	adrp	x9, 0xdecc000 <dyld_stub_binder+0xdecc000>
 4669840: 91018129     	add	x9, x9, #0x60
 4669844: a9002408     	stp	x8, x9, [x0]
 4669848: 528002a8     	mov	w8, #0x15               ; =21
 466984c: f9000808     	str	x8, [x0, #0x10]
 4669850: b0054a36     	adrp	x22, 0xefae000 <dyld_stub_binder+0xefae000>
 4669854: f9476ad4     	ldr	x20, [x22, #0xed0]
 4669858: b5000214     	cbnz	x20, 0x4669898 <_ChromeMain+0x46645fc>
 466985c: 52800d00     	mov	w0, #0x68               ; =104
 4669860: 96e696c2     	bl	0xf368 <_ChromeMain+0xa0cc>
 4669864: aa0003f4     	mov	x20, x0
 4669868: d004b6c1     	adrp	x1, 0xdd43000 <dyld_stub_binder+0xdd43000>
 466986c: 91235821     	add	x1, x1, #0x8d6
 4669870: 528004e2     	mov	w2, #0x27               ; =39
 4669874: 52800663     	mov	w3, #0x33               ; =51
 4669878: 96faf740     	bl	0x527578 <_ChromeMain+0x5222dc>
 466987c: 9004e728     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4669880: 9119c108     	add	x8, x8, #0x670
 4669884: f9000008     	str	x8, [x0]
 4669888: 97b633ce     	bl	0x33f67c0 <_ChromeMain+0x33f1524>
 466988c: aa1403e0     	mov	x0, x20
 4669890: 9744f3d5     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4669894: f9076ad4     	str	x20, [x22, #0xed0]
 4669898: 925e7688     	and	x8, x20, #0xfffffffc00000000
 466989c: b0052a56     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46698a0: f94046c9     	ldr	x9, [x22, #0x88]
 46698a4: eb09011f     	cmp	x8, x9
 46698a8: 54000061     	b.ne	0x46698b4 <_ChromeMain+0x4664618>
 46698ac: aa1403e0     	mov	x0, x20
 46698b0: 96e6aa93     	bl	0x142fc <_ChromeMain+0xf060>
 46698b4: f9402660     	ldr	x0, [x19, #0x48]
 46698b8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46698bc: f94046c9     	ldr	x9, [x22, #0x88]
 46698c0: eb09011f     	cmp	x8, x9
 46698c4: 54000140     	b.eq	0x46698ec <_ChromeMain+0x4664650>
 46698c8: f9002674     	str	x20, [x19, #0x48]
 46698cc: aa1303e0     	mov	x0, x19
 46698d0: 9744f3c5     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 46698d4: f9043eb3     	str	x19, [x21, #0x878]
 46698d8: aa1303e0     	mov	x0, x19
 46698dc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 46698e0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 46698e4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 46698e8: d65f03c0     	ret
 46698ec: 96e6e454     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46698f0: 17fffff6     	b	0x46698c8 <_ChromeMain+0x466462c>
 46698f4: d2c00400     	mov	x0, #0x2000000000       ; =137438953472
 46698f8: d65f03c0     	ret
 46698fc: 3952e008     	ldrb	w8, [x0, #0x4b8]
 4669900: 34000a48     	cbz	w8, 0x4669a48 <_ChromeMain+0x46647ac>
 4669904: d103c3ff     	sub	sp, sp, #0xf0
 4669908: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 466990c: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 4669910: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 4669914: 910383fd     	add	x29, sp, #0xe0
 4669918: aa0103f3     	mov	x19, x1
 466991c: aa0003f4     	mov	x20, x0
 4669920: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 4669924: 6f00e400     	movi.2d	v0, #0000000000000000
 4669928: 3c8383e0     	stur	q0, [sp, #0x38]
 466992c: 3c8483e0     	stur	q0, [sp, #0x48]
 4669930: f9002fff     	str	xzr, [sp, #0x58]
 4669934: d2806029     	mov	x9, #0x301              ; =769
 4669938: f2f7f009     	movk	x9, #0xbf80, lsl #48
 466993c: a902a7e8     	stp	x8, x9, [sp, #0x28]
 4669940: 96fcddac     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4669944: 52801ac1     	mov	w1, #0xd6               ; =214
 4669948: 9722fa20     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 466994c: 971d9507     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4669950: 2d0307e0     	stp	s0, s1, [sp, #0x18]
 4669954: 2d040fe2     	stp	s2, s3, [sp, #0x20]
 4669958: 91070288     	add	x8, x20, #0x1c0
 466995c: f81d03bf     	stur	xzr, [x29, #-0x30]
 4669960: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 4669964: b004c688     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4669968: 3dc01101     	ldr	q1, [x8, #0x40]
 466996c: 6ee14400     	ushl.2d	v0, v0, v1
 4669970: 0ea12800     	xtn.2s	v0, v0
 4669974: 6f00e401     	movi.2d	v1, #0000000000000000
 4669978: 0ea16400     	smax.2s	v0, v0, v1
 466997c: 2e21d800     	ucvtf.2s	v0, v0
 4669980: fc1d83a0     	stur	d0, [x29, #-0x28]
 4669984: 4f046400     	movi.4s	v0, #0x80, lsl #24
 4669988: 3d801fe0     	str	q0, [sp, #0x70]
 466998c: d100c3a0     	sub	x0, x29, #0x30
 4669990: 9101c3e1     	add	x1, sp, #0x70
 4669994: 96e6c9db     	bl	0x1c100 <_ChromeMain+0x16e64>
 4669998: d100c3a0     	sub	x0, x29, #0x30
 466999c: 974382b6     	bl	0x174a474 <_ChromeMain+0x17451d8>
 46699a0: 2d0c07e0     	stp	s0, s1, [sp, #0x60]
 46699a4: 2d0d0fe2     	stp	s2, s3, [sp, #0x68]
 46699a8: 6f00e400     	movi.2d	v0, #0000000000000000
 46699ac: ad0383e0     	stp	q0, q0, [sp, #0x70]
 46699b0: 3d8027e0     	str	q0, [sp, #0x90]
 46699b4: b900a3ff     	str	wzr, [sp, #0xa0]
 46699b8: 9101c3e0     	add	x0, sp, #0x70
 46699bc: 910183e1     	add	x1, sp, #0x60
 46699c0: 1e249000     	fmov	s0, #10.00000000
 46699c4: 1e249001     	fmov	s1, #10.00000000
 46699c8: 9709fe0e     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 46699cc: 910023e8     	add	x8, sp, #0x8
 46699d0: 9101c3e0     	add	x0, sp, #0x70
 46699d4: 52800001     	mov	w1, #0x0                ; =0
 46699d8: 970952be     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 46699dc: f9406260     	ldr	x0, [x19, #0xc0]
 46699e0: f9400008     	ldr	x8, [x0]
 46699e4: f9408908     	ldr	x8, [x8, #0x110]
 46699e8: 910023e1     	add	x1, sp, #0x8
 46699ec: 910063e2     	add	x2, sp, #0x18
 46699f0: 52800023     	mov	w3, #0x1                ; =1
 46699f4: d63f0100     	blr	x8
 46699f8: f94007e0     	ldr	x0, [sp, #0x8]
 46699fc: b40000a0     	cbz	x0, 0x4669a10 <_ChromeMain+0x4664774>
 4669a00: 12800008     	mov	w8, #-0x1               ; =-1
 4669a04: b8e80008     	ldaddal	w8, w8, [x0]
 4669a08: 7100051f     	cmp	w8, #0x1
 4669a0c: 54000200     	b.eq	0x4669a4c <_ChromeMain+0x46647b0>
 4669a10: f9402fe0     	ldr	x0, [sp, #0x58]
 4669a14: b50005a0     	cbnz	x0, 0x4669ac8 <_ChromeMain+0x466482c>
 4669a18: f9402be0     	ldr	x0, [sp, #0x50]
 4669a1c: b5000440     	cbnz	x0, 0x4669aa4 <_ChromeMain+0x4664808>
 4669a20: f94027e0     	ldr	x0, [sp, #0x48]
 4669a24: b5000760     	cbnz	x0, 0x4669b10 <_ChromeMain+0x4664874>
 4669a28: f94023e0     	ldr	x0, [sp, #0x40]
 4669a2c: b5000200     	cbnz	x0, 0x4669a6c <_ChromeMain+0x46647d0>
 4669a30: f9401fe0     	ldr	x0, [sp, #0x38]
 4669a34: b50005c0     	cbnz	x0, 0x4669aec <_ChromeMain+0x4664850>
 4669a38: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 4669a3c: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 4669a40: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 4669a44: 9103c3ff     	add	sp, sp, #0xf0
 4669a48: d65f03c0     	ret
 4669a4c: b9802808     	ldrsw	x8, [x0, #0x28]
 4669a50: 35000728     	cbnz	w8, 0x4669b34 <_ChromeMain+0x4664898>
 4669a54: 3940b008     	ldrb	w8, [x0, #0x2c]
 4669a58: 37000b28     	tbnz	w8, #0x0, 0x4669bbc <_ChromeMain+0x4664920>
 4669a5c: f9400813     	ldr	x19, [x0, #0x10]
 4669a60: b5000bb3     	cbnz	x19, 0x4669bd4 <_ChromeMain+0x4664938>
 4669a64: 96e6ab01     	bl	0x14668 <_ChromeMain+0xf3cc>
 4669a68: 17ffffea     	b	0x4669a10 <_ChromeMain+0x4664774>
 4669a6c: 91002008     	add	x8, x0, #0x8
 4669a70: 12800009     	mov	w9, #-0x1               ; =-1
 4669a74: b8e90108     	ldaddal	w9, w8, [x8]
 4669a78: 7100051f     	cmp	w8, #0x1
 4669a7c: 54fffda1     	b.ne	0x4669a30 <_ChromeMain+0x4664794>
 4669a80: f9400009     	ldr	x9, [x0]
 4669a84: f9400928     	ldr	x8, [x9, #0x10]
 4669a88: 90fdcdea     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 4669a8c: 9106014a     	add	x10, x10, #0x180
 4669a90: eb0a011f     	cmp	x8, x10
 4669a94: 54000041     	b.ne	0x4669a9c <_ChromeMain+0x4664800>
 4669a98: f9400528     	ldr	x8, [x9, #0x8]
 4669a9c: d63f0100     	blr	x8
 4669aa0: 17ffffe4     	b	0x4669a30 <_ChromeMain+0x4664794>
 4669aa4: 91002008     	add	x8, x0, #0x8
 4669aa8: 12800009     	mov	w9, #-0x1               ; =-1
 4669aac: b8e90108     	ldaddal	w9, w8, [x8]
 4669ab0: 7100051f     	cmp	w8, #0x1
 4669ab4: 54fffb61     	b.ne	0x4669a20 <_ChromeMain+0x4664784>
 4669ab8: f9400008     	ldr	x8, [x0]
 4669abc: f9400908     	ldr	x8, [x8, #0x10]
 4669ac0: d63f0100     	blr	x8
 4669ac4: 17ffffd7     	b	0x4669a20 <_ChromeMain+0x4664784>
 4669ac8: 91002008     	add	x8, x0, #0x8
 4669acc: 12800009     	mov	w9, #-0x1               ; =-1
 4669ad0: b8e90108     	ldaddal	w9, w8, [x8]
 4669ad4: 7100051f     	cmp	w8, #0x1
 4669ad8: 54fffa01     	b.ne	0x4669a18 <_ChromeMain+0x466477c>
 4669adc: f9400008     	ldr	x8, [x0]
 4669ae0: f9400908     	ldr	x8, [x8, #0x10]
 4669ae4: d63f0100     	blr	x8
 4669ae8: 17ffffcc     	b	0x4669a18 <_ChromeMain+0x466477c>
 4669aec: 91002008     	add	x8, x0, #0x8
 4669af0: 12800009     	mov	w9, #-0x1               ; =-1
 4669af4: b8e90108     	ldaddal	w9, w8, [x8]
 4669af8: 7100051f     	cmp	w8, #0x1
 4669afc: 54fff9e1     	b.ne	0x4669a38 <_ChromeMain+0x466479c>
 4669b00: f9400008     	ldr	x8, [x0]
 4669b04: f9400908     	ldr	x8, [x8, #0x10]
 4669b08: d63f0100     	blr	x8
 4669b0c: 17ffffcb     	b	0x4669a38 <_ChromeMain+0x466479c>
 4669b10: 91002008     	add	x8, x0, #0x8
 4669b14: 12800009     	mov	w9, #-0x1               ; =-1
 4669b18: b8e90108     	ldaddal	w9, w8, [x8]
 4669b1c: 7100051f     	cmp	w8, #0x1
 4669b20: 54fff841     	b.ne	0x4669a28 <_ChromeMain+0x466478c>
 4669b24: f9400008     	ldr	x8, [x0]
 4669b28: f9400908     	ldr	x8, [x8, #0x10]
 4669b2c: d63f0100     	blr	x8
 4669b30: 17ffffbe     	b	0x4669a28 <_ChromeMain+0x466478c>
 4669b34: aa0003f3     	mov	x19, x0
 4669b38: f9401014     	ldr	x20, [x0, #0x20]
 4669b3c: d37df115     	lsl	x21, x8, #3
 4669b40: f9400288     	ldr	x8, [x20]
 4669b44: 1940c108     	ldapurb	w8, [x8, #0xc]
 4669b48: 370000a8     	tbnz	w8, #0x0, 0x4669b5c <_ChromeMain+0x46648c0>
 4669b4c: f9400280     	ldr	x0, [x20]
 4669b50: f9400008     	ldr	x8, [x0]
 4669b54: f9400d08     	ldr	x8, [x8, #0x18]
 4669b58: d63f0100     	blr	x8
 4669b5c: 91002294     	add	x20, x20, #0x8
 4669b60: f10022b5     	subs	x21, x21, #0x8
 4669b64: 54fffee1     	b.ne	0x4669b40 <_ChromeMain+0x46648a4>
 4669b68: aa1303e0     	mov	x0, x19
 4669b6c: b9802a68     	ldrsw	x8, [x19, #0x28]
 4669b70: 34fff728     	cbz	w8, 0x4669a54 <_ChromeMain+0x46647b8>
 4669b74: f9401014     	ldr	x20, [x0, #0x20]
 4669b78: 8b080e95     	add	x21, x20, x8, lsl #3
 4669b7c: 12800016     	mov	w22, #-0x1              ; =-1
 4669b80: 14000008     	b	0x4669ba0 <_ChromeMain+0x4664904>
 4669b84: f9400008     	ldr	x8, [x0]
 4669b88: f9400908     	ldr	x8, [x8, #0x10]
 4669b8c: d63f0100     	blr	x8
 4669b90: 91002294     	add	x20, x20, #0x8
 4669b94: eb15029f     	cmp	x20, x21
 4669b98: aa1303e0     	mov	x0, x19
 4669b9c: 54fff5c2     	b.hs	0x4669a54 <_ChromeMain+0x46647b8>
 4669ba0: f9400280     	ldr	x0, [x20]
 4669ba4: b4ffff60     	cbz	x0, 0x4669b90 <_ChromeMain+0x46648f4>
 4669ba8: 91002008     	add	x8, x0, #0x8
 4669bac: b8f60108     	ldaddal	w22, w8, [x8]
 4669bb0: 7100051f     	cmp	w8, #0x1
 4669bb4: 54fffee1     	b.ne	0x4669b90 <_ChromeMain+0x46648f4>
 4669bb8: 17fffff3     	b	0x4669b84 <_ChromeMain+0x46648e8>
 4669bbc: f9401008     	ldr	x8, [x0, #0x20]
 4669bc0: aa0003f3     	mov	x19, x0
 4669bc4: aa0803e0     	mov	x0, x8
 4669bc8: 96e8e30b     	bl	0xa27f4 <_ChromeMain+0x9d558>
 4669bcc: aa1303e0     	mov	x0, x19
 4669bd0: 17ffffa3     	b	0x4669a5c <_ChromeMain+0x46647c0>
 4669bd4: f9400268     	ldr	x8, [x19]
 4669bd8: aa0003f4     	mov	x20, x0
 4669bdc: aa0803e0     	mov	x0, x8
 4669be0: 94e70a78     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 4669be4: aa1303e0     	mov	x0, x19
 4669be8: 52800101     	mov	w1, #0x8                ; =8
 4669bec: 96e67cb3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4669bf0: aa1403e0     	mov	x0, x20
 4669bf4: 17ffff9c     	b	0x4669a64 <_ChromeMain+0x46647c8>
 4669bf8: 17fffe92     	b	0x4669640 <_ChromeMain+0x46643a4>
