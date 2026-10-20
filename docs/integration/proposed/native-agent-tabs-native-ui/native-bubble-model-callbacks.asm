
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4688360: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4688364: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4688368: 910043fd     	add	x29, sp, #0x10
 468836c: aa0003f3     	mov	x19, x0
 4688370: f0050548     	adrp	x8, 0xe733000 <dyld_stub_binder+0xe733000>
 4688374: 911fc108     	add	x8, x8, #0x7f0
 4688378: 91110109     	add	x9, x8, #0x440
 468837c: a9002408     	stp	x8, x9, [x0]
 4688380: 9111a109     	add	x9, x8, #0x468
 4688384: f9000809     	str	x9, [x0, #0x10]
 4688388: 91128109     	add	x9, x8, #0x4a0
 468838c: 9113410a     	add	x10, x8, #0x4d0
 4688390: a906a809     	stp	x9, x10, [x0, #0x68]
 4688394: 91148109     	add	x9, x8, #0x520
 4688398: f9005809     	str	x9, [x0, #0xb0]
 468839c: 91160109     	add	x9, x8, #0x580
 46883a0: f9006c09     	str	x9, [x0, #0xd8]
 46883a4: 9116c109     	add	x9, x8, #0x5b0
 46883a8: f9007c09     	str	x9, [x0, #0xf8]
 46883ac: 91176109     	add	x9, x8, #0x5d8
 46883b0: f9018809     	str	x9, [x0, #0x310]
 46883b4: 911f4109     	add	x9, x8, #0x7d0
 46883b8: f903b009     	str	x9, [x0, #0x760]
 46883bc: 912f4108     	add	x8, x8, #0xbd0
 46883c0: f903d008     	str	x8, [x0, #0x7a0]
 46883c4: f943e400     	ldr	x0, [x0, #0x7c8]
 46883c8: b4000060     	cbz	x0, 0x46883d4 <_ChromeMain+0x4683138>
 46883cc: 911e8261     	add	x1, x19, #0x7a0
 46883d0: 9759f044     	bl	0x1d044e0 <_ChromeMain+0x1cff244>
 46883d4: f943f260     	ldr	x0, [x19, #0x7e0]
 46883d8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46883dc: d0052954     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46883e0: f9404689     	ldr	x9, [x20, #0x88]
 46883e4: eb09011f     	cmp	x8, x9
 46883e8: 54000041     	b.ne	0x46883f0 <_ChromeMain+0x4683154>
 46883ec: 96e66994     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46883f0: f903f27f     	str	xzr, [x19, #0x7e0]
 46883f4: f943e660     	ldr	x0, [x19, #0x7c8]
 46883f8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46883fc: f9404689     	ldr	x9, [x20, #0x88]
 4688400: eb09011f     	cmp	x8, x9
 4688404: 54000041     	b.ne	0x468840c <_ChromeMain+0x4683170>
 4688408: 96e6698d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 468840c: f903e67f     	str	xzr, [x19, #0x7c8]
 4688410: f943e260     	ldr	x0, [x19, #0x7c0]
 4688414: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4688418: f9404689     	ldr	x9, [x20, #0x88]
 468841c: eb09011f     	cmp	x8, x9
 4688420: 54000041     	b.ne	0x4688428 <_ChromeMain+0x468318c>
 4688424: 96e66986     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4688428: f903e27f     	str	xzr, [x19, #0x7c0]
 468842c: 911e8260     	add	x0, x19, #0x7a0
 4688430: 9759ef98     	bl	0x1d04290 <_ChromeMain+0x1cfeff4>
 4688434: aa1303e0     	mov	x0, x19
 4688438: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 468843c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4688440: 14d3f96e     	b	0x7b869f8 <_ChromeMain+0x7b8175c>
 4688444: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4688448: a9017bfd     	stp	x29, x30, [sp, #0x10]
 468844c: 910043fd     	add	x29, sp, #0x10
 4688450: aa0003f3     	mov	x19, x0
 4688454: 97ffffc3     	bl	0x4688360 <_ChromeMain+0x46830c4>
 4688458: d0054408     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 468845c: 91120108     	add	x8, x8, #0x480
 4688460: f8bfc100     	ldapr	x0, [x8]
 4688464: b40000a0     	cbz	x0, 0x4688478 <_ChromeMain+0x46831dc>
 4688468: aa1303e1     	mov	x1, x19
 468846c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4688470: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4688474: 172351ab     	b	0xf5cb20 <_ChromeMain+0xf57884>
 4688478: 97f12ca0     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 468847c: 17fffffb     	b	0x4688468 <_ChromeMain+0x46831cc>
 4688480: 14000656     	b	0x4689dd8 <_ChromeMain+0x4684b3c>
 4688484: 00000000     	udf	#0x0
 4688488: 17fffc65     	b	0x468761c <_ChromeMain+0x4682380>
		...
 46884c0: f943e808     	ldr	x8, [x0, #0x7d0]
 46884c4: a9402829     	ldp	x9, x10, [x1]
 46884c8: f943ec0b     	ldr	x11, [x0, #0x7d8]
 46884cc: eb08013f     	cmp	x9, x8
 46884d0: fa4b0140     	ccmp	x10, x11, #0x0, eq
 46884d4: 54000040     	b.eq	0x46884dc <_ChromeMain+0x4683240>
 46884d8: d65f03c0     	ret
 46884dc: 17fffc50     	b	0x468761c <_ChromeMain+0x4682380>
 46884e0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46884e4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46884e8: 910043fd     	add	x29, sp, #0x10
 46884ec: f943e808     	ldr	x8, [x0, #0x7d0]
 46884f0: a9402829     	ldp	x9, x10, [x1]
 46884f4: f943ec0b     	ldr	x11, [x0, #0x7d8]
 46884f8: eb08013f     	cmp	x9, x8
 46884fc: fa4b0140     	ccmp	x10, x11, #0x0, eq
 4688500: 54000080     	b.eq	0x4688510 <_ChromeMain+0x4683274>
 4688504: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4688508: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 468850c: d65f03c0     	ret
 4688510: aa0003f3     	mov	x19, x0
 4688514: f9400008     	ldr	x8, [x0]
 4688518: f9403108     	ldr	x8, [x8, #0x60]
 468851c: 90fdff34     	adrp	x20, 0x66c000 <_ChromeMain+0x666d64>
 4688520: 91394294     	add	x20, x20, #0xe50
 4688524: eb14011f     	cmp	x8, x20
 4688528: 54000181     	b.ne	0x4688558 <_ChromeMain+0x46832bc>
 468852c: f940c260     	ldr	x0, [x19, #0x180]
 4688530: b4fffea0     	cbz	x0, 0x4688504 <_ChromeMain+0x4683268>
 4688534: f9400268     	ldr	x8, [x19]
 4688538: f9403108     	ldr	x8, [x8, #0x60]
 468853c: eb14011f     	cmp	x8, x20
 4688540: 540001c1     	b.ne	0x4688578 <_ChromeMain+0x46832dc>
 4688544: f940c260     	ldr	x0, [x19, #0x180]
 4688548: 52800001     	mov	w1, #0x0                ; =0
 468854c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4688550: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4688554: 1796538d     	b	0x2c1d388 <_ChromeMain+0x2c180ec>
 4688558: 90fdfd49     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 468855c: 9120c129     	add	x9, x9, #0x830
 4688560: eb09011f     	cmp	x8, x9
 4688564: 54fffe40     	b.eq	0x468852c <_ChromeMain+0x4683290>
 4688568: aa1303e0     	mov	x0, x19
 468856c: d63f0100     	blr	x8
 4688570: b4fffca0     	cbz	x0, 0x4688504 <_ChromeMain+0x4683268>
 4688574: 17fffff0     	b	0x4688534 <_ChromeMain+0x4683298>
 4688578: 90fdfd49     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 468857c: 9120c129     	add	x9, x9, #0x830
 4688580: eb09011f     	cmp	x8, x9
 4688584: 54fffe00     	b.eq	0x4688544 <_ChromeMain+0x46832a8>
 4688588: aa1303e0     	mov	x0, x19
 468858c: d63f0100     	blr	x8
 4688590: 17ffffee     	b	0x4688548 <_ChromeMain+0x46832ac>
 4688594: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4688598: a9017bfd     	stp	x29, x30, [sp, #0x10]
 468859c: 910043fd     	add	x29, sp, #0x10
 46885a0: aa0003f3     	mov	x19, x0
 46885a4: f943e400     	ldr	x0, [x0, #0x7c8]
 46885a8: 911e8261     	add	x1, x19, #0x7a0
 46885ac: 9759efcd     	bl	0x1d044e0 <_ChromeMain+0x1cff244>
 46885b0: f943e660     	ldr	x0, [x19, #0x7c8]
 46885b4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46885b8: d0052949     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46885bc: f9404529     	ldr	x9, [x9, #0x88]
 46885c0: eb09011f     	cmp	x8, x9
 46885c4: 54000041     	b.ne	0x46885cc <_ChromeMain+0x4683330>
 46885c8: 96e6691d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46885cc: f903e67f     	str	xzr, [x19, #0x7c8]
 46885d0: f9400268     	ldr	x8, [x19]
 46885d4: f9403108     	ldr	x8, [x8, #0x60]
 46885d8: 90fdff34     	adrp	x20, 0x66c000 <_ChromeMain+0x666d64>
 46885dc: 91394294     	add	x20, x20, #0xe50
 46885e0: eb14011f     	cmp	x8, x20
 46885e4: 54000181     	b.ne	0x4688614 <_ChromeMain+0x4683378>
 46885e8: f940c260     	ldr	x0, [x19, #0x180]
 46885ec: b4000220     	cbz	x0, 0x4688630 <_ChromeMain+0x4683394>
 46885f0: f9400268     	ldr	x8, [x19]
 46885f4: f9403108     	ldr	x8, [x8, #0x60]
 46885f8: eb14011f     	cmp	x8, x20
 46885fc: 54000201     	b.ne	0x468863c <_ChromeMain+0x46833a0>
 4688600: f940c260     	ldr	x0, [x19, #0x180]
 4688604: 52800001     	mov	w1, #0x0                ; =0
 4688608: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 468860c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
