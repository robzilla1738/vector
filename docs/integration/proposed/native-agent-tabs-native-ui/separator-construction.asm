
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 468737c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4687380: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4687384: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4687388: 910083fd     	add	x29, sp, #0x20
 468738c: aa0003f4     	mov	x20, x0
 4687390: f0054408     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4687394: 91120108     	add	x8, x8, #0x480
 4687398: f8bfc100     	ldapr	x0, [x8]
 468739c: b40007e0     	cbz	x0, 0x4687498 <_ChromeMain+0x46821fc>
 46873a0: 52806401     	mov	w1, #0x320              ; =800
 46873a4: d2800002     	mov	x2, #0x0                ; =0
 46873a8: 96e89082     	bl	0xab5b0 <_ChromeMain+0xa6314>
 46873ac: aa0003f3     	mov	x19, x0
 46873b0: 97339f64     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 46873b4: b00501a8     	adrp	x8, 0xe6bc000 <dyld_stub_binder+0xe6bc000>
 46873b8: 9107c108     	add	x8, x8, #0x1f0
 46873bc: 910fa109     	add	x9, x8, #0x3e8
 46873c0: a9002408     	stp	x8, x9, [x0]
 46873c4: 91104109     	add	x9, x8, #0x410
 46873c8: f9000809     	str	x9, [x0, #0x10]
 46873cc: 91112109     	add	x9, x8, #0x448
 46873d0: 9111e10a     	add	x10, x8, #0x478
 46873d4: a906a809     	stp	x9, x10, [x0, #0x68]
 46873d8: 91132109     	add	x9, x8, #0x4c8
 46873dc: f9005809     	str	x9, [x0, #0xb0]
 46873e0: 9114a109     	add	x9, x8, #0x528
 46873e4: f9006c09     	str	x9, [x0, #0xd8]
 46873e8: 91156108     	add	x8, x8, #0x558
 46873ec: aa0003f5     	mov	x21, x0
 46873f0: f80f8ea8     	str	x8, [x21, #0xf8]!
 46873f4: b004c5c8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 46873f8: 3dc02d00     	ldr	q0, [x8, #0xb0]
 46873fc: 3d80c400     	str	q0, [x0, #0x310]
 4687400: 3945a408     	ldrb	w8, [x0, #0x169]
 4687404: 350004e8     	cbnz	w8, 0x46874a0 <_ChromeMain+0x4682204>
 4687408: f940ce82     	ldr	x2, [x20, #0x198]
 468740c: aa1403e0     	mov	x0, x20
 4687410: aa1303e1     	mov	x1, x19
 4687414: 9703c7fa     	bl	0x7793fc <_ChromeMain+0x774160>
 4687418: 52800034     	mov	w20, #0x1               ; =1
 468741c: b9031a74     	str	w20, [x19, #0x318]
 4687420: b9431668     	ldr	w8, [x19, #0x314]
 4687424: 71035d1f     	cmp	w8, #0xd7
 4687428: 54000120     	b.eq	0x468744c <_ChromeMain+0x46821b0>
 468742c: 52801ae8     	mov	w8, #0xd7               ; =215
 4687430: b9031668     	str	w8, [x19, #0x314]
 4687434: aa1303e0     	mov	x0, x19
 4687438: 52800041     	mov	w1, #0x2                ; =2
 468743c: 9705694a     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4687440: 910c5261     	add	x1, x19, #0x314
 4687444: aa1503e0     	mov	x0, x21
 4687448: 972282e2     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 468744c: 52800400     	mov	w0, #0x20               ; =32
 4687450: 96e61fc6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4687454: aa0003e1     	mov	x1, x0
 4687458: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 468745c: b9000808     	str	w8, [x0, #0x8]
 4687460: 39003014     	strb	w20, [x0, #0xc]
 4687464: b004e628     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 4687468: 91044108     	add	x8, x8, #0x110
 468746c: d2c00089     	mov	x9, #0x400000000        ; =17179869184
 4687470: 4e080d20     	dup.2d	v0, x9
 4687474: f9000008     	str	x8, [x0]
 4687478: 3d800400     	str	q0, [x0, #0x10]
 468747c: f9400268     	ldr	x8, [x19]
 4687480: f9408902     	ldr	x2, [x8, #0x110]
 4687484: aa1303e0     	mov	x0, x19
 4687488: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 468748c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4687490: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4687494: d61f0040     	br	x2
 4687498: 97f13098     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 468749c: 17ffffc1     	b	0x46873a0 <_ChromeMain+0x4682104>
 46874a0: d4200000     	brk	#0
 46874a4: d4400000     	hlt	#0
 46874a8: d4200020     	brk	#0x1
