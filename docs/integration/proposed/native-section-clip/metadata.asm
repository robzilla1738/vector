
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46666a0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 46666a4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 46666a8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 46666ac: 910083fd     	add	x29, sp, #0x20
 46666b0: b00543b5     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 46666b4: f9442eb3     	ldr	x19, [x21, #0x858]
 46666b8: b5000473     	cbnz	x19, 0x4666744 <_ChromeMain+0x46614a8>
 46666bc: 52800d00     	mov	w0, #0x68               ; =104
 46666c0: 96e6a32a     	bl	0xf368 <_ChromeMain+0xa0cc>
 46666c4: aa0003f3     	mov	x19, x0
 46666c8: b004c321     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 46666cc: 912c7821     	add	x1, x1, #0xb1e
 46666d0: 528008a2     	mov	w2, #0x45               ; =69
 46666d4: 5280ea63     	mov	w3, #0x753              ; =1875
 46666d8: 96fb03a8     	bl	0x527578 <_ChromeMain+0x5222dc>
 46666dc: d004f508     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 46666e0: 913f8108     	add	x8, x8, #0xfe0
 46666e4: d004c329     	adrp	x9, 0xdecc000 <dyld_stub_binder+0xdecc000>
 46666e8: 91001d29     	add	x9, x9, #0x7
 46666ec: a9002408     	stp	x8, x9, [x0]
 46666f0: 52800288     	mov	w8, #0x14               ; =20
 46666f4: f9000808     	str	x8, [x0, #0x10]
 46666f8: b0054a56     	adrp	x22, 0xefaf000 <dyld_stub_binder+0xefaf000>
 46666fc: f94062d4     	ldr	x20, [x22, #0xc0]
 4666700: b40002d4     	cbz	x20, 0x4666758 <_ChromeMain+0x46614bc>
 4666704: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4666708: 90052a76     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 466670c: f94046c9     	ldr	x9, [x22, #0x88]
 4666710: eb09011f     	cmp	x8, x9
 4666714: 54000061     	b.ne	0x4666720 <_ChromeMain+0x4661484>
 4666718: aa1403e0     	mov	x0, x20
 466671c: 96e6b6f8     	bl	0x142fc <_ChromeMain+0xf060>
 4666720: f9402660     	ldr	x0, [x19, #0x48]
 4666724: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4666728: f94046c9     	ldr	x9, [x22, #0x88]
 466672c: eb09011f     	cmp	x8, x9
 4666730: 54000340     	b.eq	0x4666798 <_ChromeMain+0x46614fc>
 4666734: f9002674     	str	x20, [x19, #0x48]
 4666738: aa1303e0     	mov	x0, x19
 466673c: 9745002a     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4666740: f9042eb3     	str	x19, [x21, #0x858]
 4666744: aa1303e0     	mov	x0, x19
 4666748: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 466674c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4666750: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4666754: d65f03c0     	ret
 4666758: 52800d00     	mov	w0, #0x68               ; =104
 466675c: 96e6a303     	bl	0xf368 <_ChromeMain+0xa0cc>
 4666760: aa0003f4     	mov	x20, x0
 4666764: f004b6e1     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 4666768: 91242c21     	add	x1, x1, #0x90b
 466676c: 528002a2     	mov	w2, #0x15               ; =21
 4666770: 528029e3     	mov	w3, #0x14f              ; =335
 4666774: 96fb0381     	bl	0x527578 <_ChromeMain+0x5222dc>
 4666778: d004e768     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 466677c: 9120e108     	add	x8, x8, #0x838
 4666780: f9000008     	str	x8, [x0]
 4666784: 97743ca5     	bl	0x2375a18 <_ChromeMain+0x237077c>
 4666788: aa1403e0     	mov	x0, x20
 466678c: 97450016     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4666790: f90062d4     	str	x20, [x22, #0xc0]
 4666794: 17ffffdc     	b	0x4666704 <_ChromeMain+0x4661468>
 4666798: 96e6f0a9     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 466679c: 17ffffe6     	b	0x4666734 <_ChromeMain+0x4661498>
