
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e1790: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e1794: f9404789     	ldr	x9, [x28, #0x88]
 37e1798: eb09011f     	cmp	x8, x9
 37e179c: 54000061     	b.ne	0x37e17a8 <_ChromeMain+0x37dc50c>
 37e17a0: aa1303e0     	mov	x0, x19
 37e17a4: 9720cad6     	bl	0x142fc <_ChromeMain+0xf060>
 37e17a8: 52800700     	mov	w0, #0x38               ; =56
 37e17ac: 9720b6ef     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e17b0: 52800028     	mov	w8, #0x1                ; =1
 37e17b4: b9000008     	str	w8, [x0]
 37e17b8: 90003ac8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e17bc: 913a0109     	add	x9, x8, #0xe80
 37e17c0: 105c1c08     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e17c4: d503201f     	nop
 37e17c8: a900a009     	stp	x9, x8, [x0, #0x8]
 37e17cc: f0007248     	adrp	x8, 0x462c000 <_ChromeMain+0x4626d64>
 37e17d0: 910b0108     	add	x8, x8, #0x2c0
 37e17d4: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e17d8: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e17dc: f9444eb4     	ldr	x20, [x21, #0x898]
 37e17e0: f9044ea0     	str	x0, [x21, #0x898]
 37e17e4: b501b954     	cbnz	x20, 0x37e4f0c <_ChromeMain+0x37dfc70>
 37e17e8: f9435274     	ldr	x20, [x19, #0x6a0]
 37e17ec: 925e7675     	and	x21, x19, #0xfffffffc00000000
 37e17f0: f9404788     	ldr	x8, [x28, #0x88]
 37e17f4: eb0802bf     	cmp	x21, x8
 37e17f8: 54000061     	b.ne	0x37e1804 <_ChromeMain+0x37dc568>
 37e17fc: aa1303e0     	mov	x0, x19
 37e1800: 9720cabf     	bl	0x142fc <_ChromeMain+0xf060>
 37e1804: 52800700     	mov	w0, #0x38               ; =56
 37e1808: 9720b6d8     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e180c: aa0003e1     	mov	x1, x0
 37e1810: b9000016     	str	w22, [x0]
 37e1814: 90003ac8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e1818: 913a0109     	add	x9, x8, #0xe80
 37e181c: 105c1928     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1820: d503201f     	nop
 37e1824: a900a009     	stp	x9, x8, [x0, #0x8]
 37e1828: f0007248     	adrp	x8, 0x462c000 <_ChromeMain+0x4626d64>
 37e182c: 9138a108     	add	x8, x8, #0xe28
 37e1830: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e1834: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1838: aa1403e0     	mov	x0, x20
 37e183c: 9438c211     	bl	0x4612080 <_ChromeMain+0x460cde4>
 37e1840: f9435274     	ldr	x20, [x19, #0x6a0]
 37e1844: f9404788     	ldr	x8, [x28, #0x88]
 37e1848: eb0802bf     	cmp	x21, x8
 37e184c: 54000061     	b.ne	0x37e1858 <_ChromeMain+0x37dc5bc>
 37e1850: aa1303e0     	mov	x0, x19
 37e1854: 9720caaa     	bl	0x142fc <_ChromeMain+0xf060>
 37e1858: 52800700     	mov	w0, #0x38               ; =56
 37e185c: 9720b6c3     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1860: aa0003f5     	mov	x21, x0
 37e1864: d0007428     	adrp	x8, 0x4667000 <_ChromeMain+0x4661d64>
 37e1868: 9107c108     	add	x8, x8, #0x1f0
 37e186c: 105c16a9     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1870: d503201f     	nop
 37e1874: b9000016     	str	w22, [x0]
 37e1878: a900a408     	stp	x8, x9, [x0, #0x8]
 37e187c: 90007268     	adrp	x8, 0x462d000 <_ChromeMain+0x4627d64>
 37e1880: 91070108     	add	x8, x8, #0x1c0
 37e1884: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e1888: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e188c: 925e7677     	and	x23, x19, #0xfffffffc00000000
 37e1890: f9404788     	ldr	x8, [x28, #0x88]
 37e1894: eb0802ff     	cmp	x23, x8
 37e1898: 54000061     	b.ne	0x37e18a4 <_ChromeMain+0x37dc608>
 37e189c: aa1303e0     	mov	x0, x19
 37e18a0: 9720ca97     	bl	0x142fc <_ChromeMain+0xf060>
 37e18a4: 52800700     	mov	w0, #0x38               ; =56
 37e18a8: 9720b6b0     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e18ac: aa0003f6     	mov	x22, x0
 37e18b0: 5280003a     	mov	w26, #0x1               ; =1
 37e18b4: b900001a     	str	w26, [x0]
 37e18b8: d0003e88     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 37e18bc: 91300108     	add	x8, x8, #0xc00
 37e18c0: 105c1409     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e18c4: d503201f     	nop
 37e18c8: a900a408     	stp	x8, x9, [x0, #0x8]
 37e18cc: 90007268     	adrp	x8, 0x462d000 <_ChromeMain+0x4627d64>
 37e18d0: 91178108     	add	x8, x8, #0x5e0
 37e18d4: 90ff6be9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e18d8: 912c0129     	add	x9, x9, #0xb00
 37e18dc: a901a009     	stp	x9, x8, [x0, #0x18]
 37e18e0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e18e4: f9404788     	ldr	x8, [x28, #0x88]
 37e18e8: eb0802ff     	cmp	x23, x8
 37e18ec: 54000061     	b.ne	0x37e18f8 <_ChromeMain+0x37dc65c>
 37e18f0: aa1303e0     	mov	x0, x19
 37e18f4: 9720ca82     	bl	0x142fc <_ChromeMain+0xf060>
 37e18f8: 52800700     	mov	w0, #0x38               ; =56
 37e18fc: 9720b69b     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1900: aa0003e3     	mov	x3, x0
 37e1904: b900001a     	str	w26, [x0]
 37e1908: 90003ac8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e190c: 913a0109     	add	x9, x8, #0xe80
 37e1910: 105c1188     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1914: d503201f     	nop
 37e1918: a900a009     	stp	x9, x8, [x0, #0x8]
 37e191c: 90007268     	adrp	x8, 0x462d000 <_ChromeMain+0x4627d64>
 37e1920: 91229108     	add	x8, x8, #0x8a4
 37e1924: 90ff6bfa     	adrp	x26, 0x255d000 <_ChromeMain+0x2557d64>
 37e1928: 912c035a     	add	x26, x26, #0xb00
 37e192c: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e1930: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1934: aa1403e0     	mov	x0, x20
 37e1938: aa1503e1     	mov	x1, x21
 37e193c: aa1603e2     	mov	x2, x22
 37e1940: 9438c21b     	bl	0x46121ac <_ChromeMain+0x460cf10>
