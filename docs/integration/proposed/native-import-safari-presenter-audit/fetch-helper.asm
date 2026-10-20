
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2d63df4: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 2d63df8: a90157f6     	stp	x22, x21, [sp, #0x10]
 2d63dfc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 2d63e00: a9037bfd     	stp	x29, x30, [sp, #0x30]
 2d63e04: 9100c3fd     	add	x29, sp, #0x30
 2d63e08: aa0103f3     	mov	x19, x1
 2d63e0c: f9400c16     	ldr	x22, [x0, #0x18]
 2d63e10: b40014b6     	cbz	x22, 0x2d640a4 <_ChromeMain+0x2d5ee08>
 2d63e14: aa0203f7     	mov	x23, x2
 2d63e18: aa0003f4     	mov	x20, x0
 2d63e1c: f9403818     	ldr	x24, [x0, #0x70]
 2d63e20: 52800900     	mov	w0, #0x48               ; =72
 2d63e24: 974aad51     	bl	0xf368 <_ChromeMain+0xa0cc>
 2d63e28: aa0003f5     	mov	x21, x0
 2d63e2c: 52800028     	mov	w8, #0x1                ; =1
 2d63e30: b9000008     	str	w8, [x0]
 2d63e34: b5000e78     	cbnz	x24, 0x2d64000 <_ChromeMain+0x2d5ed64>
 2d63e38: d0ffcf48     	adrp	x8, 0x274d000 <_ChromeMain+0x2747d64>
 2d63e3c: 912fa108     	add	x8, x8, #0xbe8
 2d63e40: b00061a9     	adrp	x9, 0x3998000 <_ChromeMain+0x3992d64>
 2d63e44: 91266129     	add	x9, x9, #0x998
 2d63e48: a900a6a8     	stp	x8, x9, [x21, #0x8]
 2d63e4c: d0ffbfc8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 2d63e50: 912c0108     	add	x8, x8, #0xb00
 2d63e54: d0ffcf49     	adrp	x9, 0x274d000 <_ChromeMain+0x2747d64>
 2d63e58: 91350129     	add	x9, x9, #0xd40
 2d63e5c: a901a6a8     	stp	x8, x9, [x21, #0x18]
 2d63e60: a902d2bf     	stp	xzr, x20, [x21, #0x28]
 2d63e64: b40000f4     	cbz	x20, 0x2d63e80 <_ChromeMain+0x2d5ebe4>
 2d63e68: 91002288     	add	x8, x20, #0x8
 2d63e6c: 52800029     	mov	w9, #0x1                ; =1
 2d63e70: b8290108     	ldadd	w9, w8, [x8]
 2d63e74: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d63e78: 6b09011f     	cmp	w8, w9
 2d63e7c: 540013e0     	b.eq	0x2d640f8 <_ChromeMain+0x2d5ee5c>
 2d63e80: f9001eb3     	str	x19, [x21, #0x38]
 2d63e84: b40000d3     	cbz	x19, 0x2d63e9c <_ChromeMain+0x2d5ec00>
 2d63e88: 52800028     	mov	w8, #0x1                ; =1
 2d63e8c: b8280268     	ldadd	w8, w8, [x19]
 2d63e90: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d63e94: 6b09011f     	cmp	w8, w9
 2d63e98: 540014e0     	b.eq	0x2d64134 <_ChromeMain+0x2d5ee98>
 2d63e9c: f90022b7     	str	x23, [x21, #0x40]
 2d63ea0: f94016c8     	ldr	x8, [x22, #0x28]
 2d63ea4: b4001308     	cbz	x8, 0x2d64104 <_ChromeMain+0x2d5ee68>
 2d63ea8: f9403ed7     	ldr	x23, [x22, #0x78]
 2d63eac: b40000d7     	cbz	x23, 0x2d63ec4 <_ChromeMain+0x2d5ec28>
 2d63eb0: 52800028     	mov	w8, #0x1                ; =1
 2d63eb4: b82802e8     	ldadd	w8, w8, [x23]
 2d63eb8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d63ebc: 6b09011f     	cmp	w8, w9
 2d63ec0: 54001340     	b.eq	0x2d64128 <_ChromeMain+0x2d5ee8c>
 2d63ec4: f94042d8     	ldr	x24, [x22, #0x80]
 2d63ec8: 52800900     	mov	w0, #0x48               ; =72
 2d63ecc: 974aad27     	bl	0xf368 <_ChromeMain+0xa0cc>
 2d63ed0: aa0003e1     	mov	x1, x0
 2d63ed4: 52800028     	mov	w8, #0x1                ; =1
 2d63ed8: b9000008     	str	w8, [x0]
 2d63edc: 10c36328     	adr	x8, 0x2ceab40 <_ChromeMain+0x2ce58a4>
