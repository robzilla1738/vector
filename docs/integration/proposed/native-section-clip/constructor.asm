
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4666440: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4666444: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4666448: a9027bfd     	stp	x29, x30, [sp, #0x20]
 466644c: 910083fd     	add	x29, sp, #0x20
 4666450: aa0103f4     	mov	x20, x1
 4666454: aa0003f3     	mov	x19, x0
 4666458: 9734233a     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 466645c: 90050608     	adrp	x8, 0xe726000 <dyld_stub_binder+0xe726000>
 4666460: 9114c108     	add	x8, x8, #0x530
 4666464: 910fa109     	add	x9, x8, #0x3e8
 4666468: a9002408     	stp	x8, x9, [x0]
 466646c: 91104109     	add	x9, x8, #0x410
 4666470: f9000809     	str	x9, [x0, #0x10]
 4666474: 91112109     	add	x9, x8, #0x448
 4666478: 9111e10a     	add	x10, x8, #0x478
 466647c: a906a809     	stp	x9, x10, [x0, #0x68]
 4666480: 91132109     	add	x9, x8, #0x4c8
 4666484: f9005809     	str	x9, [x0, #0xb0]
 4666488: 9114a109     	add	x9, x8, #0x528
 466648c: f9006c09     	str	x9, [x0, #0xd8]
 4666490: 91156108     	add	x8, x8, #0x558
 4666494: f9007c08     	str	x8, [x0, #0xf8]
 4666498: f901881f     	str	xzr, [x0, #0x310]
 466649c: 390c601f     	strb	wzr, [x0, #0x318]
 46664a0: 390c701f     	strb	wzr, [x0, #0x31c]
 46664a4: 390c801f     	strb	wzr, [x0, #0x320]
 46664a8: 390c901f     	strb	wzr, [x0, #0x324]
 46664ac: 390ca01f     	strb	wzr, [x0, #0x328]
 46664b0: 390cc01f     	strb	wzr, [x0, #0x330]
 46664b4: f9019c1f     	str	xzr, [x0, #0x338]
 46664b8: 390d001f     	strb	wzr, [x0, #0x340]
 46664bc: 390d201f     	strb	wzr, [x0, #0x348]
 46664c0: f901a81f     	str	xzr, [x0, #0x350]
 46664c4: 52800021     	mov	w1, #0x1                ; =1
 46664c8: 9756bcf1     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 46664cc: f9401268     	ldr	x8, [x19, #0x20]
 46664d0: b9400909     	ldr	w9, [x8, #0x8]
 46664d4: 7100093f     	cmp	w9, #0x2
 46664d8: 54000480     	b.eq	0x4666568 <_ChromeMain+0x46612cc>
 46664dc: 39422909     	ldrb	w9, [x8, #0x8a]
 46664e0: 340000c9     	cbz	w9, 0x46664f8 <_ChromeMain+0x466125c>
 46664e4: 3902291f     	strb	wzr, [x8, #0x8a]
 46664e8: f940b500     	ldr	x0, [x8, #0x168]
 46664ec: 52800001     	mov	w1, #0x0                ; =0
 46664f0: 971d9d94     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 46664f4: f9401268     	ldr	x8, [x19, #0x20]
 46664f8: f940b500     	ldr	x0, [x8, #0x168]
 46664fc: 52800021     	mov	w1, #0x1                ; =1
 4666500: 976ec8d1     	bl	0x2218844 <_ChromeMain+0x22135a8>
 4666504: 3945a688     	ldrb	w8, [x20, #0x169]
 4666508: 35000368     	cbnz	w8, 0x4666574 <_ChromeMain+0x46612d8>
 466650c: f940ce62     	ldr	x2, [x19, #0x198]
 4666510: aa1303e0     	mov	x0, x19
 4666514: aa1403e1     	mov	x1, x20
 4666518: 97044bb9     	bl	0x7793fc <_ChromeMain+0x774160>
 466651c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4666520: 90052a75     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4666524: f94046a9     	ldr	x9, [x21, #0x88]
 4666528: eb09011f     	cmp	x8, x9
 466652c: 54000061     	b.ne	0x4666538 <_ChromeMain+0x466129c>
 4666530: aa1403e0     	mov	x0, x20
 4666534: 96e6b772     	bl	0x142fc <_ChromeMain+0xf060>
 4666538: f9418a60     	ldr	x0, [x19, #0x310]
 466653c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4666540: f94046a9     	ldr	x9, [x21, #0x88]
 4666544: eb09011f     	cmp	x8, x9
 4666548: 54000041     	b.ne	0x4666550 <_ChromeMain+0x46612b4>
 466654c: 96e6f13c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4666550: f9018a74     	str	x20, [x19, #0x310]
 4666554: aa1303e0     	mov	x0, x19
 4666558: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 466655c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4666560: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4666564: d65f03c0     	ret
 4666568: d4200000     	brk	#0
 466656c: d4400000     	hlt	#0
 4666570: d4200020     	brk	#0x1
 4666574: d4200000     	brk	#0
 4666578: d4400000     	hlt	#0
 466657c: d4200020     	brk	#0x1
