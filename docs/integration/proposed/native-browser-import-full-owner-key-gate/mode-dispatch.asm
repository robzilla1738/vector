
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42534e8: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 42534ec: a90167fa     	stp	x26, x25, [sp, #0x10]
 42534f0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 42534f4: a90357f6     	stp	x22, x21, [sp, #0x30]
 42534f8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 42534fc: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4253500: 910143fd     	add	x29, sp, #0x50
 4253504: d10703ff     	sub	sp, sp, #0x1c0
 4253508: aa0203f4     	mov	x20, x2
 425350c: aa0103f5     	mov	x21, x1
 4253510: aa0003f3     	mov	x19, x0
 4253514: b9401c08     	ldr	w8, [x0, #0x1c]
 4253518: 7100051f     	cmp	w8, #0x1
 425351c: 54000d41     	b.ne	0x42536c4 <_ChromeMain+0x424e428>
 4253520: f9400268     	ldr	x8, [x19]
 4253524: b4000d88     	cbz	x8, 0x42536d4 <_ChromeMain+0x424e438>
 4253528: 19404108     	ldapurb	w8, [x8, #0x4]
 425352c: 35000d48     	cbnz	w8, 0x42536d4 <_ChromeMain+0x424e438>
 4253530: f9400668     	ldr	x8, [x19, #0x8]
 4253534: b4000d08     	cbz	x8, 0x42536d4 <_ChromeMain+0x424e438>
 4253538: f9400268     	ldr	x8, [x19]
 425353c: b4002e88     	cbz	x8, 0x4253b0c <_ChromeMain+0x424e870>
 4253540: 19404108     	ldapurb	w8, [x8, #0x4]
 4253544: 35002e48     	cbnz	w8, 0x4253b0c <_ChromeMain+0x424e870>
 4253548: f9400668     	ldr	x8, [x19, #0x8]
 425354c: f9413918     	ldr	x24, [x8, #0x270]
 4253550: b4000c38     	cbz	x24, 0x42536d4 <_ChromeMain+0x424e438>
 4253554: f9403a76     	ldr	x22, [x19, #0x70]
 4253558: 9004c660     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425355c: 91093000     	add	x0, x0, #0x24c
 4253560: 9004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253564: 91080821     	add	x1, x1, #0x202
 4253568: 9103c3e8     	add	x8, sp, #0xf0
 425356c: 52810be2     	mov	w2, #0x85f              ; =2143
 4253570: 96f7f5c4     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4253574: 52800e00     	mov	w0, #0x70               ; =112
 4253578: 96f6ef7c     	bl	0xf368 <_ChromeMain+0xa0cc>
 425357c: aa0003f7     	mov	x23, x0
 4253580: 52800028     	mov	w8, #0x1                ; =1
 4253584: 100318a9     	adr	x9, 0x4259898 <_ChromeMain+0x42545fc>
 4253588: d503201f     	nop
 425358c: 10031caa     	adr	x10, 0x4259920 <_ChromeMain+0x4254684>
 4253590: d503201f     	nop
 4253594: b9000008     	str	w8, [x0]
 4253598: d0ff1848     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 425359c: 912c0108     	add	x8, x8, #0xb00
 42535a0: 100045cb     	adr	x11, 0x4253e58 <_ChromeMain+0x424ebbc>
 42535a4: d503201f     	nop
 42535a8: a900a809     	stp	x9, x10, [x0, #0x8]
 42535ac: a901ac08     	stp	x8, x11, [x0, #0x18]
 42535b0: b9401a68     	ldr	w8, [x19, #0x18]
 42535b4: b9002808     	str	w8, [x0, #0x28]
 42535b8: 39c07ea8     	ldrsb	w8, [x21, #0x1f]
 42535bc: 37f809e8     	tbnz	w8, #0x1f, 0x42536f8 <_ChromeMain+0x424e45c>
 42535c0: 3cc082a0     	ldur	q0, [x21, #0x8]
 42535c4: 3c8302e0     	stur	q0, [x23, #0x30]
 42535c8: f84182a8     	ldur	x8, [x21, #0x18]
 42535cc: f80402e8     	stur	x8, [x23, #0x40]
 42535d0: 39405269     	ldrb	w9, [x19, #0x14]
 42535d4: aa1703e8     	mov	x8, x23
 42535d8: 38050d1f     	strb	wzr, [x8, #0x50]!
 42535dc: 381f8109     	sturb	w9, [x8, #-0x8]
 42535e0: 3900611f     	strb	wzr, [x8, #0x18]
 42535e4: 39406289     	ldrb	w9, [x20, #0x18]
 42535e8: 34000129     	cbz	w9, 0x425360c <_ChromeMain+0x424e370>
 42535ec: 3dc00280     	ldr	q0, [x20]
 42535f0: 3d800100     	str	q0, [x8]
 42535f4: f9400a89     	ldr	x9, [x20, #0x10]
 42535f8: f9000909     	str	x9, [x8, #0x10]
 42535fc: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 4253600: f900029f     	str	xzr, [x20]
 4253604: 52800028     	mov	w8, #0x1                ; =1
 4253608: 3901a2e8     	strb	w8, [x23, #0x68]
 425360c: f9404274     	ldr	x20, [x19, #0x80]
 4253610: b40000d4     	cbz	x20, 0x4253628 <_ChromeMain+0x424e38c>
 4253614: 52800028     	mov	w8, #0x1                ; =1
 4253618: b8280288     	ldadd	w8, w8, [x20]
 425361c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4253620: 6b09011f     	cmp	w8, w9
 4253624: 540027a0     	b.eq	0x4253b18 <_ChromeMain+0x424e87c>
 4253628: f9404675     	ldr	x21, [x19, #0x88]
 425362c: f9406313     	ldr	x19, [x24, #0xc0]
 4253630: b40000d3     	cbz	x19, 0x4253648 <_ChromeMain+0x424e3ac>
 4253634: 52800028     	mov	w8, #0x1                ; =1
 4253638: b8280268     	ldadd	w8, w8, [x19]
 425363c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4253640: 6b09011f     	cmp	w8, w9
 4253644: 54002700     	b.eq	0x4253b24 <_ChromeMain+0x424e888>
 4253648: f9406718     	ldr	x24, [x24, #0xc8]
 425364c: 52800a00     	mov	w0, #0x50               ; =80
 4253650: 96f6ef46     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253654: aa0003e3     	mov	x3, x0
 4253658: 52800028     	mov	w8, #0x1                ; =1
 425365c: b9000008     	str	w8, [x0]
 4253660: 1004d888     	adr	x8, 0x425d170 <_ChromeMain+0x4257ed4>
 4253664: d503201f     	nop
 4253668: 90ffef49     	adrp	x9, 0x403b000 <_ChromeMain+0x4035d64>
 425366c: 91178129     	add	x9, x9, #0x5e0
 4253670: a900a408     	stp	x8, x9, [x0, #0x8]
 4253674: f0fff2c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4253678: 911b0108     	add	x8, x8, #0x6c0
 425367c: 1000ff29     	adr	x9, 0x4255660 <_ChromeMain+0x42503c4>
 4253680: d503201f     	nop
 4253684: a901a408     	stp	x8, x9, [x0, #0x18]
 4253688: a902d01f     	stp	xzr, x20, [x0, #0x28]
 425368c: a903cc15     	stp	x21, x19, [x0, #0x38]
 4253690: f9002418     	str	x24, [x0, #0x48]
 4253694: 9103c3e1     	add	x1, sp, #0xf0
 4253698: aa1603e0     	mov	x0, x22
 425369c: aa1703e2     	mov	x2, x23
 42536a0: 940001b2     	bl	0x4253d68 <_ChromeMain+0x424eacc>
 42536a4: 910703ff     	add	sp, sp, #0x1c0
 42536a8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42536ac: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42536b0: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42536b4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42536b8: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42536bc: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42536c0: d65f03c0     	ret
 42536c4: f0056488     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 42536c8: f9467d00     	ldr	x0, [x8, #0xcf8]
 42536cc: 975f312b     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 42536d0: b5000360     	cbnz	x0, 0x425373c <_ChromeMain+0x424e4a0>
 42536d4: aa1303e0     	mov	x0, x19
 42536d8: 910703ff     	add	sp, sp, #0x1c0
 42536dc: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42536e0: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42536e4: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42536e8: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42536ec: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42536f0: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42536f4: 14000112     	b	0x4253b3c <_ChromeMain+0x424e8a0>
