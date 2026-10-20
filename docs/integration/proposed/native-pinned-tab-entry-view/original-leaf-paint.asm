
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460d780: d10303ff     	sub	sp, sp, #0xc0
 460d784: a9085ff8     	stp	x24, x23, [sp, #0x80]
 460d788: a90957f6     	stp	x22, x21, [sp, #0x90]
 460d78c: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 460d790: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 460d794: 9102c3fd     	add	x29, sp, #0xb0
 460d798: f941e808     	ldr	x8, [x0, #0x3d0]
 460d79c: b4001068     	cbz	x8, 0x460d9a8 <_ChromeMain+0x460870c>
 460d7a0: aa0003f4     	mov	x20, x0
 460d7a4: f941f009     	ldr	x9, [x0, #0x3e0]
 460d7a8: f941b508     	ldr	x8, [x8, #0x368]
 460d7ac: eb08013f     	cmp	x9, x8
 460d7b0: 54000fc2     	b.hs	0x460d9a8 <_ChromeMain+0x460870c>
 460d7b4: aa0103f3     	mov	x19, x1
 460d7b8: f9406020     	ldr	x0, [x1, #0xc0]
 460d7bc: f9400008     	ldr	x8, [x0]
 460d7c0: f9406108     	ldr	x8, [x8, #0xc0]
 460d7c4: 6f00e400     	movi.2d	v0, #0000000000000000
 460d7c8: 6f00e401     	movi.2d	v1, #0000000000000000
 460d7cc: 6f00e402     	movi.2d	v2, #0000000000000000
 460d7d0: 6f00e403     	movi.2d	v3, #0000000000000000
 460d7d4: 52800021     	mov	w1, #0x1                ; =1
 460d7d8: d63f0100     	blr	x8
 460d7dc: f941ea88     	ldr	x8, [x20, #0x3d0]
 460d7e0: f941f296     	ldr	x22, [x20, #0x3e0]
 460d7e4: f941b509     	ldr	x9, [x8, #0x368]
 460d7e8: eb0902df     	cmp	x22, x9
 460d7ec: 54001182     	b.hs	0x460da1c <_ChromeMain+0x4608780>
 460d7f0: f941b117     	ldr	x23, [x8, #0x360]
 460d7f4: aa1403e0     	mov	x0, x20
 460d7f8: 96fe4dfe     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 460d7fc: b4000d60     	cbz	x0, 0x460d9a8 <_ChromeMain+0x460870c>
 460d800: aa0003f5     	mov	x21, x0
 460d804: 52804d08     	mov	w8, #0x268              ; =616
 460d808: 9b085ed6     	madd	x22, x22, x8, x23
 460d80c: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 460d810: 91070288     	add	x8, x20, #0x1c0
 460d814: f81b03bf     	stur	xzr, [x29, #-0x50]
 460d818: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 460d81c: b004c968     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 460d820: 3dc01101     	ldr	q1, [x8, #0x40]
 460d824: 6ee14400     	ushl.2d	v0, v0, v1
 460d828: 0ea12800     	xtn.2s	v0, v0
 460d82c: 6f00e401     	movi.2d	v1, #0000000000000000
 460d830: 0ea16400     	smax.2s	v0, v0, v1
 460d834: 2e21d800     	ucvtf.2s	v0, v0
 460d838: fc1b83a0     	stur	d0, [x29, #-0x48]
 460d83c: 4f046400     	movi.4s	v0, #0x80, lsl #24
 460d840: 3d8003e0     	str	q0, [sp]
 460d844: d10143a0     	sub	x0, x29, #0x50
 460d848: 910003e1     	mov	x1, sp
 460d84c: 96e83a2d     	bl	0x1c100 <_ChromeMain+0x16e64>
 460d850: d10143a0     	sub	x0, x29, #0x50
 460d854: 9744f308     	bl	0x174a474 <_ChromeMain+0x17451d8>
 460d858: 2d3807a0     	stp	s0, s1, [x29, #-0x40]
 460d85c: 2d390fa2     	stp	s2, s3, [x29, #-0x38]
 460d860: 6f00e400     	movi.2d	v0, #0000000000000000
 460d864: ad0003e0     	stp	q0, q0, [sp]
 460d868: 3d800be0     	str	q0, [sp, #0x20]
 460d86c: b90033ff     	str	wzr, [sp, #0x30]
 460d870: 910003e0     	mov	x0, sp
 460d874: d10103a1     	sub	x1, x29, #0x40
 460d878: 1e249000     	fmov	s0, #10.00000000
 460d87c: 1e249001     	fmov	s1, #10.00000000
 460d880: 970b6e60     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 460d884: 910143e8     	add	x8, sp, #0x50
 460d888: 910003e0     	mov	x0, sp
 460d88c: 52800001     	mov	w1, #0x0                ; =0
 460d890: 970ac310     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 460d894: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 460d898: 6f00e400     	movi.2d	v0, #0000000000000000
 460d89c: ad0103e0     	stp	q0, q0, [sp, #0x20]
 460d8a0: f90023ff     	str	xzr, [sp, #0x40]
 460d8a4: d2806029     	mov	x9, #0x301              ; =769
 460d8a8: f2f7f009     	movk	x9, #0xbf80, lsl #48
 460d8ac: a90127e8     	stp	x8, x9, [sp, #0x10]
 460d8b0: 394982c8     	ldrb	w8, [x22, #0x260]
 460d8b4: 52801b89     	mov	w9, #0xdc               ; =220
 460d8b8: 52801aca     	mov	w10, #0xd6              ; =214
 460d8bc: d503201f     	nop
 460d8c0: 7100011f     	cmp	w8, #0x0
 460d8c4: 1a891141     	csel	w1, w10, w9, ne
 460d8c8: aa1503e0     	mov	x0, x21
 460d8cc: 97246a3f     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 460d8d0: 971f0526     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 460d8d4: 2d0007e0     	stp	s0, s1, [sp]
 460d8d8: 2d010fe2     	stp	s2, s3, [sp, #0x8]
 460d8dc: f9406260     	ldr	x0, [x19, #0xc0]
 460d8e0: f9400008     	ldr	x8, [x0]
 460d8e4: f9408908     	ldr	x8, [x8, #0x110]
 460d8e8: 910143e1     	add	x1, sp, #0x50
 460d8ec: 910003e2     	mov	x2, sp
 460d8f0: 52800023     	mov	w3, #0x1                ; =1
 460d8f4: d63f0100     	blr	x8
 460d8f8: 394982c8     	ldrb	w8, [x22, #0x260]
 460d8fc: 35000108     	cbnz	w8, 0x460d91c <_ChromeMain+0x4608680>
 460d900: 394fe288     	ldrb	w8, [x20, #0x3f8]
 460d904: 34000328     	cbz	w8, 0x460d968 <_ChromeMain+0x46086cc>
 460d908: aa1503e0     	mov	x0, x21
 460d90c: 52801d21     	mov	w1, #0xe9               ; =233
 460d910: 97246a2e     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 460d914: aa0003e8     	mov	x8, x0
 460d918: 14000009     	b	0x460d93c <_ChromeMain+0x46086a0>
 460d91c: aa1503e0     	mov	x0, x21
 460d920: 52801b01     	mov	w1, #0xd8               ; =216
 460d924: 97246a29     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 460d928: 394972c8     	ldrb	w8, [x22, #0x25c]
 460d92c: 34000048     	cbz	w8, 0x460d934 <_ChromeMain+0x4608698>
 460d930: b9425ac0     	ldr	w0, [x22, #0x258]
 460d934: 52a66008     	mov	w8, #0x33000000         ; =855638016
 460d938: 33005c08     	bfxil	w8, w0, #0, #24
 460d93c: aa0803e0     	mov	x0, x8
 460d940: 971f050a     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 460d944: 2d0007e0     	stp	s0, s1, [sp]
 460d948: 2d010fe2     	stp	s2, s3, [sp, #0x8]
 460d94c: f9406260     	ldr	x0, [x19, #0xc0]
 460d950: f9400008     	ldr	x8, [x0]
 460d954: f9408908     	ldr	x8, [x8, #0x110]
 460d958: 910143e1     	add	x1, sp, #0x50
 460d95c: 910003e2     	mov	x2, sp
 460d960: 52800023     	mov	w3, #0x1                ; =1
 460d964: d63f0100     	blr	x8
