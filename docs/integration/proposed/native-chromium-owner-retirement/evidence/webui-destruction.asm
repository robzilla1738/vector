
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 424f238: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 424f23c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 424f240: 910043fd     	add	x29, sp, #0x10
 424f244: aa0003f3     	mov	x19, x0
 424f248: f00500a8     	adrp	x8, 0xe266000 <dyld_stub_binder+0xe266000>
 424f24c: 912f4108     	add	x8, x8, #0xbd0
 424f250: f9000008     	str	x8, [x0]
 424f254: f9001c1f     	str	xzr, [x0, #0x38]
 424f258: f9401808     	ldr	x8, [x0, #0x30]
 424f25c: b4000168     	cbz	x8, 0x424f288 <_ChromeMain+0x4249fec>
 424f260: 52800029     	mov	w9, #0x1                ; =1
 424f264: 19004109     	stlurb	w9, [x8, #0x4]
 424f268: f9401a60     	ldr	x0, [x19, #0x30]
 424f26c: b40000e0     	cbz	x0, 0x424f288 <_ChromeMain+0x4249fec>
 424f270: 12800008     	mov	w8, #-0x1               ; =-1
 424f274: b8e80008     	ldaddal	w8, w8, [x0]
 424f278: 7100051f     	cmp	w8, #0x1
 424f27c: 54000061     	b.ne	0x424f288 <_ChromeMain+0x4249fec>
 424f280: 52800101     	mov	w1, #0x8                ; =8
 424f284: 96f6e70d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f288: f9401260     	ldr	x0, [x19, #0x20]
 424f28c: f900127f     	str	xzr, [x19, #0x20]
 424f290: b4000080     	cbz	x0, 0x424f2a0 <_ChromeMain+0x424a004>
 424f294: 940009e4     	bl	0x4251a24 <_ChromeMain+0x424c788>
 424f298: 52801401     	mov	w1, #0xa0               ; =160
 424f29c: 96f6e707     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f2a0: f9400e60     	ldr	x0, [x19, #0x18]
 424f2a4: f9000e7f     	str	xzr, [x19, #0x18]
 424f2a8: b4000080     	cbz	x0, 0x424f2b8 <_ChromeMain+0x424a01c>
 424f2ac: 94004e82     	bl	0x4262cb4 <_ChromeMain+0x425da18>
 424f2b0: 52801801     	mov	w1, #0xc0               ; =192
 424f2b4: 96f6e701     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f2b8: f9400a60     	ldr	x0, [x19, #0x10]
 424f2bc: f9000a7f     	str	xzr, [x19, #0x10]
 424f2c0: b4000080     	cbz	x0, 0x424f2d0 <_ChromeMain+0x424a034>
 424f2c4: 94000f30     	bl	0x4252f84 <_ChromeMain+0x424dce8>
 424f2c8: 52801201     	mov	w1, #0x90               ; =144
 424f2cc: 96f6e6fb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f2d0: b004f1c8     	adrp	x8, 0xe088000 <dyld_stub_binder+0xe088000>
 424f2d4: 91100108     	add	x8, x8, #0x400
 424f2d8: f9000268     	str	x8, [x19]
 424f2dc: f9400668     	ldr	x8, [x19, #0x8]
 424f2e0: f9403509     	ldr	x9, [x8, #0x68]
 424f2e4: b4000149     	cbz	x9, 0x424f30c <_ChromeMain+0x424a070>
 424f2e8: 19404129     	ldapurb	w9, [x9, #0x4]
 424f2ec: 35000109     	cbnz	w9, 0x424f30c <_ChromeMain+0x424a070>
 424f2f0: f9403914     	ldr	x20, [x8, #0x70]
 424f2f4: b40000d4     	cbz	x20, 0x424f30c <_ChromeMain+0x424a070>
 424f2f8: 90045a61     	adrp	x1, 0xcd9b000 <dyld_stub_binder+0xcd9b000>
 424f2fc: 91050021     	add	x1, x1, #0x140
 424f300: aa1403e0     	mov	x0, x20
 424f304: 971ca843     	bl	0x979410 <_ChromeMain+0x974174>
 424f308: b50001a0     	cbnz	x0, 0x424f33c <_ChromeMain+0x424a0a0>
 424f30c: f9400660     	ldr	x0, [x19, #0x8]
 424f310: 925e7408     	and	x8, x0, #0xfffffffc00000000
 424f314: f0054b09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 424f318: f9404529     	ldr	x9, [x9, #0x88]
 424f31c: eb09011f     	cmp	x8, x9
 424f320: 54000041     	b.ne	0x424f328 <_ChromeMain+0x424a08c>
 424f324: 96f74dc6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 424f328: f900067f     	str	xzr, [x19, #0x8]
 424f32c: aa1303e0     	mov	x0, x19
 424f330: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 424f334: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 424f338: d65f03c0     	ret
 424f33c: 90045a61     	adrp	x1, 0xcd9b000 <dyld_stub_binder+0xcd9b000>
 424f340: 91050021     	add	x1, x1, #0x140
 424f344: aa1403e0     	mov	x0, x20
 424f348: 97da124d     	bl	0x38d3c7c <_ChromeMain+0x38ce9e0>
 424f34c: 17fffff0     	b	0x424f30c <_ChromeMain+0x424a070>
