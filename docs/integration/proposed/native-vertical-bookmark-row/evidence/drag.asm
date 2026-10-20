
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4620780:      	stp	x20, x19, [sp, #-0x20]!
 4620784:      	stp	x29, x30, [sp, #0x10]
 4620788:      	add	x29, sp, #0x10
 462078c:      	ldrb	w8, [x0, #0x444]
 4620790:      	cbz	w8, 0x46207a8 <_ChromeMain+0x461b50c>
 4620794:      	mov	x2, x1
 4620798:      	ldr	w8, [x1, #0x50]
 462079c:      	and	w8, w8, #0xf800
 46207a0:      	cmp	w8, #0x800
 46207a4:      	b.eq	0x46207bc <_ChromeMain+0x461b520>
 46207a8:      	mov	w20, #0x0               ; =0
 46207ac:      	mov	x0, x20
 46207b0:      	ldp	x29, x30, [sp, #0x10]
 46207b4:      	ldp	x20, x19, [sp], #0x20
 46207b8:      	ret
 46207bc:      	mov	x1, x0
 46207c0:      	ldr	x19, [x0, #0x3f8]
 46207c4:      	cbz	x19, 0x46207a8 <_ChromeMain+0x461b50c>
 46207c8:      	mov	w8, #0x1                ; =1
 46207cc:      	ldadd	w8, w8, [x19]
 46207d0:      	cmp	w8, #0x0
 46207d4:      	b.le	0x4620818 <_ChromeMain+0x461b57c>
 46207d8:      	mov	w9, #0x7fffffff         ; =2147483647
 46207dc:      	cmp	w8, w9
 46207e0:      	b.eq	0x4620824 <_ChromeMain+0x461b588>
 46207e4:      	ldr	x8, [x1, #0x3f8]
 46207e8:      	ldr	x8, [x8, #0x8]
 46207ec:      	mov	x0, x19
 46207f0:      	blr	x8
 46207f4:      	mov	x20, x0
 46207f8:      	mov	w8, #-0x1               ; =-1
 46207fc:      	ldaddal	w8, w8, [x19]
 4620800:      	cmp	w8, #0x1
 4620804:      	b.ne	0x46207ac <_ChromeMain+0x461b510>
 4620808:      	ldr	x8, [x19, #0x10]
 462080c:      	mov	x0, x19
 4620810:      	blr	x8
 4620814:      	b	0x46207ac <_ChromeMain+0x461b510>
 4620818:      	brk	#0
 462081c:      	hlt	#0
 4620820:      	brk	#0x1
 4620824:      	brk	#0
 4620828:      	hlt	#0
 462082c:      	brk	#0x1
