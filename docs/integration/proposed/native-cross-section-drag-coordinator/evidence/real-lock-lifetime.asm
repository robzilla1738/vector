
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7fb63f4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7fb63f8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7fb63fc: 910043fd     	add	x29, sp, #0x10
 7fb6400: aa0103f4     	mov	x20, x1
 7fb6404: aa0003f3     	mov	x19, x0
 7fb6408: b00314c8     	adrp	x8, 0xe24f000 <dyld_stub_binder+0xe24f000>
 7fb640c: 913e2108     	add	x8, x8, #0xf88
 7fb6410: f9000008     	str	x8, [x0]
 7fb6414: b9000802     	str	w2, [x0, #0x8]
 7fb6418: 925e7428     	and	x8, x1, #0xfffffffc00000000
 7fb641c: 90035fe9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 7fb6420: f9404529     	ldr	x9, [x9, #0x88]
 7fb6424: eb09011f     	cmp	x8, x9
 7fb6428: 54000061     	b.ne	0x7fb6434 <_ChromeMain+0x7fb1198>
 7fb642c: aa1403e0     	mov	x0, x20
 7fb6430: 960177b3     	bl	0x142fc <_ChromeMain+0xf060>
 7fb6434: f9000a74     	str	x20, [x19, #0x10]
 7fb6438: b4000094     	cbz	x20, 0x7fb6448 <_ChromeMain+0x7fb11ac>
 7fb643c: aa1403e0     	mov	x0, x20
 7fb6440: aa1303e1     	mov	x1, x19
 7fb6444: 971a9210     	bl	0x465ac84 <_ChromeMain+0x46559e8>
 7fb6448: aa1303e0     	mov	x0, x19
 7fb644c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7fb6450: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7fb6454: d65f03c0     	ret
 7fb6458: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7fb645c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7fb6460: 910043fd     	add	x29, sp, #0x10
 7fb6464: aa0003f3     	mov	x19, x0
 7fb6468: b00314c8     	adrp	x8, 0xe24f000 <dyld_stub_binder+0xe24f000>
 7fb646c: 913e2108     	add	x8, x8, #0xf88
 7fb6470: f9000008     	str	x8, [x0]
 7fb6474: f9400800     	ldr	x0, [x0, #0x10]
 7fb6478: b4000080     	cbz	x0, 0x7fb6488 <_ChromeMain+0x7fb11ec>
 7fb647c: aa1303e1     	mov	x1, x19
 7fb6480: 951f41b0     	bl	0xc786b40 <_ChromeMain+0xc7818a4>
 7fb6484: f9400a60     	ldr	x0, [x19, #0x10]
 7fb6488: 925e7408     	and	x8, x0, #0xfffffffc00000000
 7fb648c: 90035fe9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 7fb6490: f9404529     	ldr	x9, [x9, #0x88]
 7fb6494: eb09011f     	cmp	x8, x9
 7fb6498: 54000041     	b.ne	0x7fb64a0 <_ChromeMain+0x7fb1204>
 7fb649c: 9601b168     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 7fb64a0: f9000a7f     	str	xzr, [x19, #0x10]
 7fb64a4: aa1303e0     	mov	x0, x19
 7fb64a8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7fb64ac: a8c24ff4     	ldp	x20, x19, [sp], #0x20
