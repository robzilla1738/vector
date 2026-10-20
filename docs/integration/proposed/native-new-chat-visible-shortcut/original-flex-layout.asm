
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4243388: 52802800     	mov	w0, #0x140              ; =320
 424338c: 96f72ff7     	bl	0xf368 <_ChromeMain+0xa0cc>
 4243390: aa0003f4     	mov	x20, x0
 4243394: 979f348f     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4243398: aa1303e0     	mov	x0, x19
 424339c: aa1403e1     	mov	x1, x20
 42433a0: 97651926     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 42433a4: b940f288     	ldr	w8, [x20, #0xf0]
 42433a8: 35000a08     	cbnz	w8, 0x42434e8 <_ChromeMain+0x423e24c>
 42433ac: b90063f5     	str	w21, [sp, #0x60]
 42433b0: d0053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 42433b4: 9115a021     	add	x1, x1, #0x568
 42433b8: 91046280     	add	x0, x20, #0x118
 42433bc: 910183e2     	add	x2, sp, #0x60
 42433c0: 97608779     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 42433c4: 39444688     	ldrb	w8, [x20, #0x111]
 42433c8: 370000c8     	tbnz	w8, #0x0, 0x42433e0 <_ChromeMain+0x423e144>
 42433cc: 52800028     	mov	w8, #0x1                ; =1
 42433d0: 39044688     	strb	w8, [x20, #0x111]
 42433d4: aa1403e0     	mov	x0, x20
 42433d8: 52800021     	mov	w1, #0x1                ; =1
 42433dc: 976087b5     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 42433e0: f9426260     	ldr	x0, [x19, #0x4c0]
 42433e4: f9400008     	ldr	x8, [x0]
 42433e8: f9400d08     	ldr	x8, [x8, #0x18]
 42433ec: d63f0100     	blr	x8
 42433f0: b004e7e8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 42433f4: 3dc02500     	ldr	q0, [x8, #0x90]
 42433f8: 3d801be0     	str	q0, [sp, #0x60]
 42433fc: d0053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4243400: 91122021     	add	x1, x1, #0x488
 4243404: 91036000     	add	x0, x0, #0xd8
 4243408: 910183e2     	add	x2, sp, #0x60
 424340c: 9762aa95     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
