
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 427682c: f94002d6     	ldr	x22, [x22]
 4276830: f10016ff     	cmp	x23, #0x5
 4276834: 540002e1     	b.ne	0x4276890 <_ChromeMain+0x42715f4>
 4276838: b94002c8     	ldr	w8, [x22]
 427683c: 394012c9     	ldrb	w9, [x22, #0x4]
 4276840: 7101cd3f     	cmp	w9, #0x73
 4276844: 528e8c29     	mov	w9, #0x7461             ; =29793
 4276848: 72ac2d89     	movk	w9, #0x616c, lsl #16
 427684c: 7a490100     	ccmp	w8, w9, #0x0, eq
 4276850: 540003e1     	b.ne	0x42768cc <_ChromeMain+0x4271630>
 4276854: 528001a8     	mov	w8, #0xd                ; =13
 4276858: 3904ffe8     	strb	w8, [sp, #0x13f]
 427685c: 9104a3e9     	add	x9, sp, #0x128
 4276860: 9100352a     	add	x10, x9, #0xd
 4276864: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276868: 910fd508     	add	x8, x8, #0x3f5
 427686c: eb08015f     	cmp	x10, x8
 4276870: fa488122     	ccmp	x9, x8, #0x2, hi
 4276874: 54006189     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4276878: f9400109     	ldr	x9, [x8]
 427687c: f9003769     	str	x9, [x27, #0x68]
 4276880: f8405108     	ldur	x8, [x8, #0x5]
 4276884: f806d368     	stur	x8, [x27, #0x6d]
 4276888: 3904d7ff     	strb	wzr, [sp, #0x135]
 427688c: 1400001e     	b	0x4276904 <_ChromeMain+0x4271668>
 4276890: 92800228     	mov	x8, #-0x12              ; =-18
 4276894: f2efffe8     	movk	x8, #0x7fff, lsl #48
 4276898: eb0802ff     	cmp	x23, x8
 427689c: 54001c28     	b.hi	0x4276c20 <_ChromeMain+0x4271984>
 42768a0: f1005aff     	cmp	x23, #0x16
 42768a4: 54000149     	b.ls	0x42768cc <_ChromeMain+0x4271630>
 42768a8: 927ceaf9     	and	x25, x23, #0x7ffffffffffffff0
 42768ac: 91004320     	add	x0, x25, #0x10
 42768b0: 96f662ae     	bl	0xf368 <_ChromeMain+0xa0cc>
 42768b4: aa0003f8     	mov	x24, x0
 42768b8: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 42768bc: cb080328     	sub	x8, x25, x8
 42768c0: a906df60     	stp	x0, x23, [x27, #0x68]
 42768c4: f9003f68     	str	x8, [x27, #0x78]
 42768c8: 14000003     	b	0x42768d4 <_ChromeMain+0x4271638>
 42768cc: 3904fff7     	strb	w23, [sp, #0x13f]
 42768d0: 9104a3f8     	add	x24, sp, #0x128
 42768d4: 8b170308     	add	x8, x24, x23
 42768d8: eb18011f     	cmp	x8, x24
 42768dc: 54005e43     	b.lo	0x42774a4 <_ChromeMain+0x4272208>
 42768e0: eb16031f     	cmp	x24, x22
 42768e4: 54000068     	b.hi	0x42768f0 <_ChromeMain+0x4271654>
 42768e8: eb16011f     	cmp	x8, x22
 42768ec: 54005dc8     	b.hi	0x42774a4 <_ChromeMain+0x4272208>
 42768f0: aa1803e0     	mov	x0, x24
 42768f4: aa1603e1     	mov	x1, x22
 42768f8: aa1703e2     	mov	x2, x23
 42768fc: 94f66274     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4276900: 38376b1f     	strb	wzr, [x24, x23]
