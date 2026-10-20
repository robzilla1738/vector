
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4257640: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4257644: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4257648: a9027bfd     	stp	x29, x30, [sp, #0x20]
 425764c: 910083fd     	add	x29, sp, #0x20
 4257650: aa0103f4     	mov	x20, x1
 4257654: aa0003f3     	mov	x19, x0
 4257658: 39400028     	ldrb	w8, [x1]
 425765c: 370001c8     	tbnz	w8, #0x0, 0x4257694 <_ChromeMain+0x42523f8>
 4257660: 39c19e68     	ldrsb	w8, [x19, #0x67]
 4257664: 37f80f68     	tbnz	w8, #0x1f, 0x4257850 <_ChromeMain+0x42525b4>
 4257668: 3cc08280     	ldur	q0, [x20, #0x8]
 425766c: f8418288     	ldur	x8, [x20, #0x18]
 4257670: f8060268     	stur	x8, [x19, #0x60]
 4257674: 3c850260     	stur	q0, [x19, #0x50]
 4257678: 39007e9f     	strb	wzr, [x20, #0x1f]
 425767c: 3900229f     	strb	wzr, [x20, #0x8]
 4257680: aa1303e0     	mov	x0, x19
 4257684: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4257688: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 425768c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4257690: 17fff12b     	b	0x4253b3c <_ChromeMain+0x424e8a0>
 4257694: 52802000     	mov	w0, #0x100              ; =256
 4257698: 96f6df34     	bl	0xf368 <_ChromeMain+0xa0cc>
 425769c: 52800028     	mov	w8, #0x1                ; =1
 42576a0: 39000008     	strb	w8, [x0]
 42576a4: 3cc08280     	ldur	q0, [x20, #0x8]
 42576a8: 3c808000     	stur	q0, [x0, #0x8]
 42576ac: f9400e89     	ldr	x9, [x20, #0x18]
 42576b0: f9000c09     	str	x9, [x0, #0x18]
 42576b4: 6f00e400     	movi.2d	v0, #0000000000000000
 42576b8: 3c808280     	stur	q0, [x20, #0x8]
 42576bc: f9000e9f     	str	xzr, [x20, #0x18]
 42576c0: 3dc00a81     	ldr	q1, [x20, #0x20]
 42576c4: 3d800801     	str	q1, [x0, #0x20]
 42576c8: f9401a89     	ldr	x9, [x20, #0x30]
 42576cc: f9001809     	str	x9, [x0, #0x30]
 42576d0: 3d800a80     	str	q0, [x20, #0x20]
 42576d4: f9001a9f     	str	xzr, [x20, #0x30]
 42576d8: 3cc38281     	ldur	q1, [x20, #0x38]
 42576dc: 3c838001     	stur	q1, [x0, #0x38]
 42576e0: 3c838280     	stur	q0, [x20, #0x38]
 42576e4: a944aa89     	ldp	x9, x10, [x20, #0x48]
 42576e8: a904fe9f     	stp	xzr, xzr, [x20, #0x48]
 42576ec: a904a809     	stp	x9, x10, [x0, #0x48]
 42576f0: 3cc58281     	ldur	q1, [x20, #0x58]
 42576f4: 3c858280     	stur	q0, [x20, #0x58]
 42576f8: 3c858001     	stur	q1, [x0, #0x58]
 42576fc: f9403689     	ldr	x9, [x20, #0x68]
 4257700: f900369f     	str	xzr, [x20, #0x68]
 4257704: f9003409     	str	x9, [x0, #0x68]
 4257708: 3dc01e81     	ldr	q1, [x20, #0x70]
 425770c: 3d801e80     	str	q0, [x20, #0x70]
 4257710: 3d801c01     	str	q1, [x0, #0x70]
 4257714: f9404289     	ldr	x9, [x20, #0x80]
 4257718: f900429f     	str	xzr, [x20, #0x80]
 425771c: f9004009     	str	x9, [x0, #0x80]
 4257720: 3cc88281     	ldur	q1, [x20, #0x88]
 4257724: 3c888280     	stur	q0, [x20, #0x88]
 4257728: 3c888001     	stur	q1, [x0, #0x88]
 425772c: f9404e89     	ldr	x9, [x20, #0x98]
 4257730: f9004e9f     	str	xzr, [x20, #0x98]
 4257734: f9004c09     	str	x9, [x0, #0x98]
 4257738: 3dc02a81     	ldr	q1, [x20, #0xa0]
 425773c: 3d802a80     	str	q0, [x20, #0xa0]
 4257740: 3d802801     	str	q1, [x0, #0xa0]
 4257744: f9405a89     	ldr	x9, [x20, #0xb0]
 4257748: f9005a9f     	str	xzr, [x20, #0xb0]
 425774c: f9005809     	str	x9, [x0, #0xb0]
 4257750: 3ccb8281     	ldur	q1, [x20, #0xb8]
 4257754: 3c8b8280     	stur	q0, [x20, #0xb8]
 4257758: 3c8b8001     	stur	q1, [x0, #0xb8]
 425775c: aa0003e9     	mov	x9, x0
 4257760: 380c8d3f     	strb	wzr, [x9, #0xc8]!
 4257764: 3903e01f     	strb	wzr, [x0, #0xf8]
 4257768: 3943e28a     	ldrb	w10, [x20, #0xf8]
 425776c: 340001aa     	cbz	w10, 0x42577a0 <_ChromeMain+0x4252504>
 4257770: 3ccc8280     	ldur	q0, [x20, #0xc8]
 4257774: 3d800120     	str	q0, [x9]
 4257778: f9406e8a     	ldr	x10, [x20, #0xd8]
 425777c: f900092a     	str	x10, [x9, #0x10]
 4257780: a90cfe9f     	stp	xzr, xzr, [x20, #0xc8]
 4257784: 3dc03a80     	ldr	q0, [x20, #0xe0]
 4257788: a90dfe9f     	stp	xzr, xzr, [x20, #0xd8]
 425778c: 3d803800     	str	q0, [x0, #0xe0]
 4257790: f9407a89     	ldr	x9, [x20, #0xf0]
 4257794: f9007809     	str	x9, [x0, #0xf0]
 4257798: a90efe9f     	stp	xzr, xzr, [x20, #0xe8]
 425779c: 3903e008     	strb	w8, [x0, #0xf8]
 42577a0: f9403674     	ldr	x20, [x19, #0x68]
 42577a4: f9003660     	str	x0, [x19, #0x68]
 42577a8: b40000b4     	cbz	x20, 0x42577bc <_ChromeMain+0x4252520>
 42577ac: aa1403e0     	mov	x0, x20
 42577b0: 9400068d     	bl	0x42591e4 <_ChromeMain+0x4253f48>
 42577b4: 52802001     	mov	w1, #0x100              ; =256
 42577b8: 96f6c5c0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42577bc: f0056468     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 42577c0: f9467d00     	ldr	x0, [x8, #0xcf8]
 42577c4: 975f20ed     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 42577c8: b4fff5c0     	cbz	x0, 0x4257680 <_ChromeMain+0x42523e4>
 42577cc: aa0003f4     	mov	x20, x0
 42577d0: f9404275     	ldr	x21, [x19, #0x80]
 42577d4: b40000d5     	cbz	x21, 0x42577ec <_ChromeMain+0x4252550>
 42577d8: 52800028     	mov	w8, #0x1                ; =1
 42577dc: b82802a8     	ldadd	w8, w8, [x21]
 42577e0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 42577e4: 6b09011f     	cmp	w8, w9
 42577e8: 54000420     	b.eq	0x425786c <_ChromeMain+0x42525d0>
 42577ec: f9404676     	ldr	x22, [x19, #0x88]
 42577f0: 52800800     	mov	w0, #0x40               ; =64
 42577f4: 96f6dedd     	bl	0xf368 <_ChromeMain+0xa0cc>
 42577f8: aa0003e2     	mov	x2, x0
 42577fc: 52800028     	mov	w8, #0x1                ; =1
 4257800: d0ff3909     	adrp	x9, 0x2979000 <_ChromeMain+0x2973d64>
 4257804: 91340129     	add	x9, x9, #0xd00
 4257808: b9000008     	str	w8, [x0]
 425780c: b0ffe8a8     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4257810: 912b0108     	add	x8, x8, #0xac0
 4257814: f0fff2aa     	adrp	x10, 0x40ae000 <_ChromeMain+0x40a8d64>
 4257818: 911b014a     	add	x10, x10, #0x6c0
 425781c: a900a009     	stp	x9, x8, [x0, #0x8]
 4257820: 100002c8     	adr	x8, 0x4257878 <_ChromeMain+0x42525dc>
 4257824: d503201f     	nop
 4257828: a901a00a     	stp	x10, x8, [x0, #0x18]
 425782c: 91008261     	add	x1, x19, #0x20
 4257830: a902d41f     	stp	xzr, x21, [x0, #0x28]
 4257834: f9001c16     	str	x22, [x0, #0x38]
 4257838: aa1403e0     	mov	x0, x20
 425783c: d2800003     	mov	x3, #0x0                ; =0
 4257840: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4257844: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4257848: a8c357f6     	ldp	x22, x21, [sp], #0x30
 425784c: 14e1bca8     	b	0x7ac6aec <_ChromeMain+0x7ac1850>
 4257850: f9402a60     	ldr	x0, [x19, #0x50]
 4257854: f9403268     	ldr	x8, [x19, #0x60]
 4257858: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425785c: 96f6c597     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257860: a9057e7f     	stp	xzr, xzr, [x19, #0x50]
 4257864: f806027f     	stur	xzr, [x19, #0x60]
 4257868: 17ffff80     	b	0x4257668 <_ChromeMain+0x42523cc>
 425786c: d4200000     	brk	#0
 4257870: d4400000     	hlt	#0
 4257874: d4200020     	brk	#0x1
