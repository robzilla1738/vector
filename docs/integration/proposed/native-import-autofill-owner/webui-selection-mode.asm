
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 80cc654: f9400a95     	ldr	x21, [x20, #0x10]
 80cc658: b4000435     	cbz	x21, 0x80cc6dc <_ChromeMain+0x80c7440>
 80cc65c: b9402a96     	ldr	w22, [x20, #0x28]
 80cc660: f9401a97     	ldr	x23, [x20, #0x30]
 80cc664: b40000d7     	cbz	x23, 0x80cc67c <_ChromeMain+0x80c73e0>
 80cc668: 52800028     	mov	w8, #0x1                ; =1
 80cc66c: b82802e8     	ldadd	w8, w8, [x23]
 80cc670: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 80cc674: 6b09011f     	cmp	w8, w9
 80cc678: 54000900     	b.eq	0x80cc798 <_ChromeMain+0x80c74fc>
 80cc67c: f9401e94     	ldr	x20, [x20, #0x38]
 80cc680: 52800900     	mov	w0, #0x48               ; =72
 80cc684: 952ad86e     	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 80cc688: aa0003e3     	mov	x3, x0
 80cc68c: 52800028     	mov	w8, #0x1                ; =1
 80cc690: b9000008     	str	w8, [x0]
 80cc694: f0fdfba8     	adrp	x8, 0x4043000 <_ChromeMain+0x403dd64>
 80cc698: 913d0108     	add	x8, x8, #0xf40
 80cc69c: 90fdf509     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 80cc6a0: 91250129     	add	x9, x9, #0x940
 80cc6a4: a900a408     	stp	x8, x9, [x0, #0x8]
 80cc6a8: d0fdff08     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 80cc6ac: 911b0108     	add	x8, x8, #0x6c0
 80cc6b0: f0fe0c09     	adrp	x9, 0x424f000 <_ChromeMain+0x4249d64>
 80cc6b4: 912d8129     	add	x9, x9, #0xb60
 80cc6b8: a901a408     	stp	x8, x9, [x0, #0x18]
 80cc6bc: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 80cc6c0: f9001c14     	str	x20, [x0, #0x38]
 80cc6c4: b9400268     	ldr	w8, [x19]
 80cc6c8: b9004008     	str	w8, [x0, #0x40]
 80cc6cc: aa1503e0     	mov	x0, x21
 80cc6d0: aa1303e1     	mov	x1, x19
 80cc6d4: aa1603e2     	mov	x2, x22
 80cc6d8: 97061a7a     	bl	0x42530c0 <_ChromeMain+0x424de24>
