
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2c0f298: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 2c0f29c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 2c0f2a0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 2c0f2a4: 910083fd     	add	x29, sp, #0x20
 2c0f2a8: 90061675     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 2c0f2ac: f943c2b3     	ldr	x19, [x21, #0x780]
 2c0f2b0: b5000453     	cbnz	x19, 0x2c0f338 <_ChromeMain+0x2c0a09c>
 2c0f2b4: 52800d00     	mov	w0, #0x68               ; =104
 2c0f2b8: 9750002c     	bl	0xf368 <_ChromeMain+0xa0cc>
 2c0f2bc: aa0003f3     	mov	x19, x0
 2c0f2c0: f00595c1     	adrp	x1, 0xdeca000 <dyld_stub_binder+0xdeca000>
 2c0f2c4: 9125d421     	add	x1, x1, #0x975
 2c0f2c8: 528008c2     	mov	w2, #0x46               ; =70
 2c0f2cc: 528007c3     	mov	w3, #0x3e               ; =62
 2c0f2d0: 976460aa     	bl	0x527578 <_ChromeMain+0x5222dc>
 2c0f2d4: f005c7a8     	adrp	x8, 0xe506000 <dyld_stub_binder+0xe506000>
 2c0f2d8: 91308108     	add	x8, x8, #0xc20
 2c0f2dc: f00595c9     	adrp	x9, 0xdeca000 <dyld_stub_binder+0xdeca000>
 2c0f2e0: 91233529     	add	x9, x9, #0x8cd
 2c0f2e4: a9002408     	stp	x8, x9, [x0]
 2c0f2e8: 528003e8     	mov	w8, #0x1f               ; =31
 2c0f2ec: f9000808     	str	x8, [x0, #0x10]
 2c0f2f0: 97f6b38b     	bl	0x29bc11c <_ChromeMain+0x29b6e80>
 2c0f2f4: aa0003f4     	mov	x20, x0
 2c0f2f8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2c0f2fc: f005fd16     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2c0f300: f94046c9     	ldr	x9, [x22, #0x88]
 2c0f304: eb09011f     	cmp	x8, x9
 2c0f308: 54000061     	b.ne	0x2c0f314 <_ChromeMain+0x2c0a078>
 2c0f30c: aa1403e0     	mov	x0, x20
 2c0f310: 975013fb     	bl	0x142fc <_ChromeMain+0xf060>
 2c0f314: f9402660     	ldr	x0, [x19, #0x48]
 2c0f318: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2c0f31c: f94046c9     	ldr	x9, [x22, #0x88]
 2c0f320: eb09011f     	cmp	x8, x9
 2c0f324: 54000140     	b.eq	0x2c0f34c <_ChromeMain+0x2c0a0b0>
 2c0f328: f9002674     	str	x20, [x19, #0x48]
 2c0f32c: aa1303e0     	mov	x0, x19
 2c0f330: 97ae5d2d     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 2c0f334: f903c2b3     	str	x19, [x21, #0x780]
 2c0f338: aa1303e0     	mov	x0, x19
 2c0f33c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 2c0f340: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 2c0f344: a8c357f6     	ldp	x22, x21, [sp], #0x30
 2c0f348: d65f03c0     	ret
 2c0f34c: 97504dbc     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 2c0f350: 17fffff6     	b	0x2c0f328 <_ChromeMain+0x2c0a08c>
 2c0f354: 00000000     	udf	#0x0
 2c0f358: 14000002     	b	0x2c0f360 <_ChromeMain+0x2c0a0c4>
 2c0f35c: 00000000     	udf	#0x0
