
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 424f720: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 424f724: a90157f6     	stp	x22, x21, [sp, #0x10]
 424f728: a9024ff4     	stp	x20, x19, [sp, #0x20]
 424f72c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 424f730: 9100c3fd     	add	x29, sp, #0x30
 424f734: f9400408     	ldr	x8, [x0, #0x8]
 424f738: f9403116     	ldr	x22, [x8, #0x60]
 424f73c: b40004d6     	cbz	x22, 0x424f7d4 <_ChromeMain+0x424a538>
 424f740: aa0303f3     	mov	x19, x3
 424f744: aa0203f4     	mov	x20, x2
 424f748: aa0103f5     	mov	x21, x1
 424f74c: f9401817     	ldr	x23, [x0, #0x30]
 424f750: b40000d7     	cbz	x23, 0x424f768 <_ChromeMain+0x424a4cc>
 424f754: 52800028     	mov	w8, #0x1                ; =1
 424f758: b82802e8     	ldadd	w8, w8, [x23]
 424f75c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 424f760: 6b09011f     	cmp	w8, w9
 424f764: 54000420     	b.eq	0x424f7e8 <_ChromeMain+0x424a54c>
 424f768: f9401c18     	ldr	x24, [x0, #0x38]
 424f76c: 52800800     	mov	w0, #0x40               ; =64
 424f770: 96f6fefe     	bl	0xf368 <_ChromeMain+0xa0cc>
 424f774: aa0003e4     	mov	x4, x0
 424f778: 52800028     	mov	w8, #0x1                ; =1
 424f77c: b9000008     	str	w8, [x0]
 424f780: 10019608     	adr	x8, 0x4252a40 <_ChromeMain+0x424d7a4>
 424f784: d503201f     	nop
 424f788: b0ffe8e9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 424f78c: 912b0129     	add	x9, x9, #0xac0
 424f790: a900a408     	stp	x8, x9, [x0, #0x8]
 424f794: f0fff2e8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 424f798: 911b0108     	add	x8, x8, #0x6c0
 424f79c: b001f3e9     	adrp	x9, 0x80cc000 <_ChromeMain+0x80c6d64>
 424f7a0: 91136129     	add	x9, x9, #0x4d8
 424f7a4: a901a408     	stp	x8, x9, [x0, #0x18]
 424f7a8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 424f7ac: f9001c18     	str	x24, [x0, #0x38]
 424f7b0: aa1603e0     	mov	x0, x22
 424f7b4: aa1503e1     	mov	x1, x21
 424f7b8: aa1403e2     	mov	x2, x20
 424f7bc: aa1303e3     	mov	x3, x19
 424f7c0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 424f7c4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 424f7c8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 424f7cc: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 424f7d0: 140061bc     	b	0x4267ec0 <_ChromeMain+0x4262c24>
