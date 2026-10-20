
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
 4257878: d10203ff     	sub	sp, sp, #0x80
 425787c: a90557f6     	stp	x22, x21, [sp, #0x50]
 4257880: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4257884: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4257888: 9101c3fd     	add	x29, sp, #0x70
 425788c: aa0003f4     	mov	x20, x0
 4257890: b4000ac1     	cbz	x1, 0x42579e8 <_ChromeMain+0x425274c>
