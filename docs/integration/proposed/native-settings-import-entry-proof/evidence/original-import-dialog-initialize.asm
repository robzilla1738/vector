
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7dc3794: d10183ff     	sub	sp, sp, #0x60
 7dc3798: a9025ff8     	stp	x24, x23, [sp, #0x20]
 7dc379c: a90357f6     	stp	x22, x21, [sp, #0x30]
 7dc37a0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 7dc37a4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 7dc37a8: 910143fd     	add	x29, sp, #0x50
 7dc37ac: aa0103f4     	mov	x20, x1
 7dc37b0: aa0003f3     	mov	x19, x0
 7dc37b4: 97afbdaa     	bl	0x69b2e5c <_ChromeMain+0x69adbc0>
 7dc37b8: aa1403e0     	mov	x0, x20
 7dc37bc: 96646671     	bl	0x16dd180 <_ChromeMain+0x16d7ee4>
 7dc37c0: f100041f     	cmp	x0, #0x1
 7dc37c4: 540007a1     	b.ne	0x7dc38b8 <_ChromeMain+0x7dbe61c>
 7dc37c8: aa1403e0     	mov	x0, x20
 7dc37cc: d2800001     	mov	x1, #0x0                ; =0
 7dc37d0: 9714270c     	bl	0x42cd400 <_ChromeMain+0x42c8164>
 7dc37d4: 96a5f33f     	bl	0x27404d0 <_ChromeMain+0x273b234>
 7dc37d8: aa0003f4     	mov	x20, x0
 7dc37dc: 52800500     	mov	w0, #0x28               ; =40
 7dc37e0: 96092ee2     	bl	0xf368 <_ChromeMain+0xa0cc>
 7dc37e4: aa0003f5     	mov	x21, x0
 7dc37e8: 97e974f3     	bl	0x7820bb4 <_ChromeMain+0x781b918>
 7dc37ec: f9401660     	ldr	x0, [x19, #0x28]
 7dc37f0: f9001675     	str	x21, [x19, #0x28]
 7dc37f4: b40000a0     	cbz	x0, 0x7dc3808 <_ChromeMain+0x7dbe56c>
 7dc37f8: 97e974fc     	bl	0x7820be8 <_ChromeMain+0x781b94c>
 7dc37fc: 52800501     	mov	w1, #0x28               ; =40
 7dc3800: 960915ae     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7dc3804: f9401675     	ldr	x21, [x19, #0x28]
 7dc3808: f0038908     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 7dc380c: f9467d00     	ldr	x0, [x8, #0xcf8]
 7dc3810: 970b5d74     	bl	0x409ade0 <_ChromeMain+0x4095b44>
 7dc3814: aa0003f6     	mov	x22, x0
 7dc3818: 10003328     	adr	x8, 0x7dc3e7c <_ChromeMain+0x7dbebe0>
 7dc381c: d503201f     	nop
 7dc3820: a9017fe8     	stp	x8, xzr, [sp, #0x10]
 7dc3824: 925e7668     	and	x8, x19, #0xfffffffc00000000
 7dc3828: f0036f77     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 7dc382c: f94046e9     	ldr	x9, [x23, #0x88]
 7dc3830: eb09011f     	cmp	x8, x9
 7dc3834: 54000061     	b.ne	0x7dc3840 <_ChromeMain+0x7dbe5a4>
 7dc3838: aa1303e0     	mov	x0, x19
 7dc383c: 960942b0     	bl	0x142fc <_ChromeMain+0xf060>
 7dc3840: f90007f3     	str	x19, [sp, #0x8]
 7dc3844: 52800a00     	mov	w0, #0x50               ; =80
 7dc3848: 96092ec8     	bl	0xf368 <_ChromeMain+0xa0cc>
 7dc384c: aa0003f3     	mov	x19, x0
 7dc3850: 910043e1     	add	x1, sp, #0x10
 7dc3854: 910023e2     	add	x2, sp, #0x8
 7dc3858: aa1403e3     	mov	x3, x20
 7dc385c: 97bb2009     	bl	0x6c8b880 <_ChromeMain+0x6c865e4>
 7dc3860: aa1503e0     	mov	x0, x21
 7dc3864: aa1603e1     	mov	x1, x22
 7dc3868: 52800022     	mov	w2, #0x1                ; =1
 7dc386c: aa1303e3     	mov	x3, x19
 7dc3870: 97e974ed     	bl	0x7820c24 <_ChromeMain+0x781b988>
 7dc3874: f94007e0     	ldr	x0, [sp, #0x8]
 7dc3878: 925e7408     	and	x8, x0, #0xfffffffc00000000
 7dc387c: f94046e9     	ldr	x9, [x23, #0x88]
 7dc3880: eb09011f     	cmp	x8, x9
 7dc3884: 540000e1     	b.ne	0x7dc38a0 <_ChromeMain+0x7dbe604>
 7dc3888: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 7dc388c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 7dc3890: a94357f6     	ldp	x22, x21, [sp, #0x30]
 7dc3894: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 7dc3898: 910183ff     	add	sp, sp, #0x60
 7dc389c: 16098c6a     	b	0x26a44 <_ChromeMain+0x217a8>
 7dc38a0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 7dc38a4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 7dc38a8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 7dc38ac: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 7dc38b0: 910183ff     	add	sp, sp, #0x60
 7dc38b4: d65f03c0     	ret
 7dc38b8: d4200000     	brk	#0
 7dc38bc: d4400000     	hlt	#0
 7dc38c0: d4200020     	brk	#0x1
