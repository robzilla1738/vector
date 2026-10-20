
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4579508: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 457950c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4579510: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4579514: 910083fd     	add	x29, sp, #0x20
 4579518: d0054b15     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 457951c: f94212b3     	ldr	x19, [x21, #0x420]
 4579520: b5000473     	cbnz	x19, 0x45795ac <_ChromeMain+0x4574310>
 4579524: 52800d00     	mov	w0, #0x68               ; =104
 4579528: 96ea5790     	bl	0xf368 <_ChromeMain+0xa0cc>
 457952c: aa0003f3     	mov	x19, x0
 4579530: b004ca61     	adrp	x1, 0xdec6000 <dyld_stub_binder+0xdec6000>
 4579534: 91099821     	add	x1, x1, #0x266
 4579538: 52800822     	mov	w2, #0x41               ; =65
 457953c: 528085e3     	mov	w3, #0x42f              ; =1071
 4579540: 96feb80e     	bl	0x527578 <_ChromeMain+0x5222dc>
 4579544: 9004fc28     	adrp	x8, 0xe4fd000 <dyld_stub_binder+0xe4fd000>
 4579548: 9102a108     	add	x8, x8, #0xa8
 457954c: b004ca69     	adrp	x9, 0xdec6000 <dyld_stub_binder+0xdec6000>
 4579550: 910c1529     	add	x9, x9, #0x305
 4579554: a9002408     	stp	x8, x9, [x0]
 4579558: 528001c8     	mov	w8, #0xe                ; =14
 457955c: f9000808     	str	x8, [x0, #0x10]
 4579560: d00551b6     	adrp	x22, 0xefaf000 <dyld_stub_binder+0xefaf000>
 4579564: f94062d4     	ldr	x20, [x22, #0xc0]
 4579568: b40002d4     	cbz	x20, 0x45795c0 <_ChromeMain+0x4574324>
 457956c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4579570: b00531d6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4579574: f94046c9     	ldr	x9, [x22, #0x88]
 4579578: eb09011f     	cmp	x8, x9
 457957c: 54000061     	b.ne	0x4579588 <_ChromeMain+0x45742ec>
 4579580: aa1403e0     	mov	x0, x20
 4579584: 96ea6b5e     	bl	0x142fc <_ChromeMain+0xf060>
 4579588: f9402660     	ldr	x0, [x19, #0x48]
 457958c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4579590: f94046c9     	ldr	x9, [x22, #0x88]
 4579594: eb09011f     	cmp	x8, x9
 4579598: 54000340     	b.eq	0x4579600 <_ChromeMain+0x4574364>
 457959c: f9002674     	str	x20, [x19, #0x48]
 45795a0: aa1303e0     	mov	x0, x19
 45795a4: 9748b490     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 45795a8: f90212b3     	str	x19, [x21, #0x420]
 45795ac: aa1303e0     	mov	x0, x19
 45795b0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45795b4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45795b8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 45795bc: d65f03c0     	ret
 45795c0: 52800d00     	mov	w0, #0x68               ; =104
 45795c4: 96ea5769     	bl	0xf368 <_ChromeMain+0xa0cc>
 45795c8: aa0003f4     	mov	x20, x0
 45795cc: 9004be61     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 45795d0: 91242c21     	add	x1, x1, #0x90b
 45795d4: 528002a2     	mov	w2, #0x15               ; =21
 45795d8: 528029e3     	mov	w3, #0x14f              ; =335
 45795dc: 96feb7e7     	bl	0x527578 <_ChromeMain+0x5222dc>
 45795e0: f004eec8     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 45795e4: 9120e108     	add	x8, x8, #0x838
 45795e8: f9000008     	str	x8, [x0]
 45795ec: 9777f10b     	bl	0x2375a18 <_ChromeMain+0x237077c>
 45795f0: aa1403e0     	mov	x0, x20
 45795f4: 9748b47c     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 45795f8: f90062d4     	str	x20, [x22, #0xc0]
 45795fc: 17ffffdc     	b	0x457956c <_ChromeMain+0x45742d0>
 4579600: 96eaa50f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4579604: 17ffffe6     	b	0x457959c <_ChromeMain+0x4574300>
