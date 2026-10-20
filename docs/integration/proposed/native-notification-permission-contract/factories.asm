
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46ae71c: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 46ae720: 910003fd     	mov	x29, sp
 46ae724: 52804500     	mov	w0, #0x228              ; =552
 46ae728: 96e58310     	bl	0xf368 <_ChromeMain+0xa0cc>
 46ae72c: 94972123     	bl	0x6c76bb8 <_ChromeMain+0x6c7191c>
 46ae730: b004d808     	adrp	x8, 0xe1af000 <dyld_stub_binder+0xe1af000>
 46ae734: 91398108     	add	x8, x8, #0xe60
 46ae738: f9000008     	str	x8, [x0]
 46ae73c: b40000e0     	cbz	x0, 0x46ae758 <_ChromeMain+0x46a94bc>
 46ae740: 91002008     	add	x8, x0, #0x8
 46ae744: 52800029     	mov	w9, #0x1                ; =1
 46ae748: b8290108     	ldadd	w9, w8, [x8]
 46ae74c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 46ae750: 6b09011f     	cmp	w8, w9
 46ae754: 54000060     	b.eq	0x46ae760 <_ChromeMain+0x46a94c4>
 46ae758: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 46ae75c: d65f03c0     	ret
 46ae760: d4200000     	brk	#0
 46ae764: d4400000     	hlt	#0
 46ae768: d4200020     	brk	#0x1
 46ae76c: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 46ae770: 910003fd     	mov	x29, sp
 46ae774: 52804500     	mov	w0, #0x228              ; =552
 46ae778: 96e582fc     	bl	0xf368 <_ChromeMain+0xa0cc>
 46ae77c: 9497210f     	bl	0x6c76bb8 <_ChromeMain+0x6c7191c>
 46ae780: b004d808     	adrp	x8, 0xe1af000 <dyld_stub_binder+0xe1af000>
 46ae784: 913b4108     	add	x8, x8, #0xed0
 46ae788: f9000008     	str	x8, [x0]
 46ae78c: b40000e0     	cbz	x0, 0x46ae7a8 <_ChromeMain+0x46a950c>
 46ae790: 91002008     	add	x8, x0, #0x8
 46ae794: 52800029     	mov	w9, #0x1                ; =1
 46ae798: b8290108     	ldadd	w9, w8, [x8]
 46ae79c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 46ae7a0: 6b09011f     	cmp	w8, w9
 46ae7a4: 54000060     	b.eq	0x46ae7b0 <_ChromeMain+0x46a9514>
 46ae7a8: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 46ae7ac: d65f03c0     	ret
 46ae7b0: d4200000     	brk	#0
 46ae7b4: d4400000     	hlt	#0
 46ae7b8: d4200020     	brk	#0x1
