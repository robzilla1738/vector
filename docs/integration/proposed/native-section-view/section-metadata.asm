
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4663164: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4663168: a9014ff4     	stp	x20, x19, [sp, #0x10]
 466316c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4663170: 910083fd     	add	x29, sp, #0x20
 4663174: 900543d5     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 4663178: f94432b3     	ldr	x19, [x21, #0x860]
 466317c: b5000473     	cbnz	x19, 0x4663208 <_ChromeMain+0x465df6c>
 4663180: 52800d00     	mov	w0, #0x68               ; =104
 4663184: 96e6b079     	bl	0xf368 <_ChromeMain+0xa0cc>
 4663188: aa0003f3     	mov	x19, x0
 466318c: 9004c341     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4663190: 912c7821     	add	x1, x1, #0xb1e
 4663194: 528008a2     	mov	w2, #0x45               ; =69
 4663198: 52813a03     	mov	w3, #0x9d0              ; =2512
 466319c: 96fb10f7     	bl	0x527578 <_ChromeMain+0x5222dc>
 46631a0: d004f528     	adrp	x8, 0xe509000 <dyld_stub_binder+0xe509000>
 46631a4: 91000108     	add	x8, x8, #0x0
 46631a8: b004c349     	adrp	x9, 0xdecc000 <dyld_stub_binder+0xdecc000>
 46631ac: 91007129     	add	x9, x9, #0x1c
 46631b0: a9002408     	stp	x8, x9, [x0]
 46631b4: 52800208     	mov	w8, #0x10               ; =16
 46631b8: f9000808     	str	x8, [x0, #0x10]
 46631bc: 90054a76     	adrp	x22, 0xefaf000 <dyld_stub_binder+0xefaf000>
 46631c0: f94062d4     	ldr	x20, [x22, #0xc0]
 46631c4: b40002d4     	cbz	x20, 0x466321c <_ChromeMain+0x465df80>
 46631c8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 46631cc: f0052a76     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46631d0: f94046c9     	ldr	x9, [x22, #0x88]
 46631d4: eb09011f     	cmp	x8, x9
 46631d8: 54000061     	b.ne	0x46631e4 <_ChromeMain+0x465df48>
 46631dc: aa1403e0     	mov	x0, x20
 46631e0: 96e6c447     	bl	0x142fc <_ChromeMain+0xf060>
 46631e4: f9402660     	ldr	x0, [x19, #0x48]
 46631e8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46631ec: f94046c9     	ldr	x9, [x22, #0x88]
 46631f0: eb09011f     	cmp	x8, x9
 46631f4: 54000340     	b.eq	0x466325c <_ChromeMain+0x465dfc0>
 46631f8: f9002674     	str	x20, [x19, #0x48]
 46631fc: aa1303e0     	mov	x0, x19
 4663200: 97450d79     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4663204: f90432b3     	str	x19, [x21, #0x860]
 4663208: aa1303e0     	mov	x0, x19
 466320c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4663210: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4663214: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4663218: d65f03c0     	ret
 466321c: 52800d00     	mov	w0, #0x68               ; =104
 4663220: 96e6b052     	bl	0xf368 <_ChromeMain+0xa0cc>
 4663224: aa0003f4     	mov	x20, x0
 4663228: d004b701     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 466322c: 91242c21     	add	x1, x1, #0x90b
 4663230: 528002a2     	mov	w2, #0x15               ; =21
 4663234: 528029e3     	mov	w3, #0x14f              ; =335
 4663238: 96fb10d0     	bl	0x527578 <_ChromeMain+0x5222dc>
 466323c: b004e788     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 4663240: 9120e108     	add	x8, x8, #0x838
 4663244: f9000008     	str	x8, [x0]
 4663248: 977449f4     	bl	0x2375a18 <_ChromeMain+0x237077c>
 466324c: aa1403e0     	mov	x0, x20
 4663250: 97450d65     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4663254: f90062d4     	str	x20, [x22, #0xc0]
 4663258: 17ffffdc     	b	0x46631c8 <_ChromeMain+0x465df2c>
 466325c: 96e6fdf8     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4663260: 17ffffe6     	b	0x46631f8 <_ChromeMain+0x465df5c>
