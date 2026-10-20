
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4134400: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4134404: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4134408: a9027bfd     	stp	x29, x30, [sp, #0x20]
 413440c: 910083fd     	add	x29, sp, #0x20
 4134410: aa0103f4     	mov	x20, x1
 4134414: aa0003f3     	mov	x19, x0
 4134418: b4000081     	cbz	x1, 0x4134428 <_ChromeMain+0x412f18c>
 413441c: f940c688     	ldr	x8, [x20, #0x188]
 4134420: eb13011f     	cmp	x8, x19
 4134424: 540002a1     	b.ne	0x4134478 <_ChromeMain+0x412f1dc>
 4134428: 925e7688     	and	x8, x20, #0xfffffffc00000000
 413442c: d00553f5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4134430: f94046a9     	ldr	x9, [x21, #0x88]
 4134434: eb09011f     	cmp	x8, x9
 4134438: 54000061     	b.ne	0x4134444 <_ChromeMain+0x412f1a8>
 413443c: aa1403e0     	mov	x0, x20
 4134440: 96fb7faf     	bl	0x142fc <_ChromeMain+0xf060>
 4134444: f942ba60     	ldr	x0, [x19, #0x570]
 4134448: 925e7408     	and	x8, x0, #0xfffffffc00000000
 413444c: f94046a9     	ldr	x9, [x21, #0x88]
 4134450: eb09011f     	cmp	x8, x9
 4134454: 54000041     	b.ne	0x413445c <_ChromeMain+0x412f1c0>
 4134458: 96fbb979     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 413445c: f902ba74     	str	x20, [x19, #0x570]
 4134460: aa1303e0     	mov	x0, x19
 4134464: 52800001     	mov	w1, #0x0                ; =0
 4134468: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 413446c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4134470: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4134474: 1713f000     	b	0x630474 <_ChromeMain+0x62b1d8>
 4134478: d4200000     	brk	#0
