
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42637bc: 3940b008     	ldrb	w8, [x0, #0x2c]
 42637c0: 35000048     	cbnz	w8, 0x42637c8 <_ChromeMain+0x425e52c>
 42637c4: d65f03c0     	ret
 42637c8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 42637cc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 42637d0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 42637d4: 910083fd     	add	x29, sp, #0x20
 42637d8: aa0003f3     	mov	x19, x0
 42637dc: f9400c15     	ldr	x21, [x0, #0x18]
 42637e0: b50000d5     	cbnz	x21, 0x42637f8 <_ChromeMain+0x425e55c>
 42637e4: aa1303e0     	mov	x0, x19
 42637e8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 42637ec: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 42637f0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 42637f4: 14000013     	b	0x4263840 <_ChromeMain+0x425e5a4>
 42637f8: f9401aa0     	ldr	x0, [x21, #0x30]
 42637fc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4263800: f0054a74     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4263804: f9404689     	ldr	x9, [x20, #0x88]
 4263808: eb09011f     	cmp	x8, x9
 426380c: 54000041     	b.ne	0x4263814 <_ChromeMain+0x425e578>
 4263810: 96f70c8d     	bl	0x26a44 <_ChromeMain+0x217a8>
 4263814: f9001abf     	str	xzr, [x21, #0x30]
 4263818: f9400e60     	ldr	x0, [x19, #0x18]
 426381c: 94d6f368     	bl	0x78205bc <_ChromeMain+0x781b320>
 4263820: f9400e60     	ldr	x0, [x19, #0x18]
 4263824: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4263828: f9404689     	ldr	x9, [x20, #0x88]
 426382c: eb09011f     	cmp	x8, x9
 4263830: 54000041     	b.ne	0x4263838 <_ChromeMain+0x425e59c>
 4263834: 96f70c84     	bl	0x26a44 <_ChromeMain+0x217a8>
 4263838: f9000e7f     	str	xzr, [x19, #0x18]
 426383c: 17ffffea     	b	0x42637e4 <_ChromeMain+0x425e548>
