
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 427b814: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 427b818: a9017bfd     	stp	x29, x30, [sp, #0x10]
 427b81c: 910043fd     	add	x29, sp, #0x10
 427b820: aa0003f3     	mov	x19, x0
 427b824: f9407408     	ldr	x8, [x0, #0xe8]
 427b828: 52800034     	mov	w20, #0x1               ; =1
 427b82c: 19004114     	stlurb	w20, [x8, #0x4]
 427b830: 52800100     	mov	w0, #0x8                ; =8
 427b834: 96f64ecd     	bl	0xf368 <_ChromeMain+0xa0cc>
 427b838: b900001f     	str	wzr, [x0]
 427b83c: 3900101f     	strb	wzr, [x0, #0x4]
 427b840: b40000a0     	cbz	x0, 0x427b854 <_ChromeMain+0x42765b8>
 427b844: b8340008     	ldadd	w20, w8, [x0]
 427b848: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 427b84c: 6b09011f     	cmp	w8, w9
 427b850: 540001e0     	b.eq	0x427b88c <_ChromeMain+0x42765f0>
 427b854: f9407668     	ldr	x8, [x19, #0xe8]
 427b858: f9007660     	str	x0, [x19, #0xe8]
 427b85c: b4000108     	cbz	x8, 0x427b87c <_ChromeMain+0x42765e0>
 427b860: 12800009     	mov	w9, #-0x1               ; =-1
 427b864: b8e90109     	ldaddal	w9, w9, [x8]
 427b868: 7100053f     	cmp	w9, #0x1
 427b86c: 54000081     	b.ne	0x427b87c <_ChromeMain+0x42765e0>
 427b870: aa0803e0     	mov	x0, x8
 427b874: 52800101     	mov	w1, #0x8                ; =8
 427b878: 96f63590     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427b87c: aa1303e0     	mov	x0, x19
 427b880: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 427b884: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 427b888: 17fff7c2     	b	0x4279790 <_ChromeMain+0x42744f4>
 427b88c: d4200000     	brk	#0
 427b890: d4400000     	hlt	#0
 427b894: d4200020     	brk	#0x1
