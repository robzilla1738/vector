
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464b490: bd4a2a60     	ldr	s0, [x19, #0xa28]
 464b494: aa1303e0     	mov	x0, x19
 464b498: 97fffa3a     	bl	0x4649d80 <_ChromeMain+0x4644ae4>
 464b49c: 39692269     	ldrb	w9, [x19, #0xa48]
 464b4a0: f9422e68     	ldr	x8, [x19, #0x458]
 464b4a4: 35000369     	cbnz	w9, 0x464b510 <_ChromeMain+0x4646274>
 464b4a8: b4fffd88     	cbz	x8, 0x464b458 <_ChromeMain+0x46461bc>
 464b4ac: f9432508     	ldr	x8, [x8, #0x648]
 464b4b0: b4fffd48     	cbz	x8, 0x464b458 <_ChromeMain+0x46461bc>
 464b4b4: f941d909     	ldr	x9, [x8, #0x3b0]
 464b4b8: d37df134     	lsl	x20, x9, #3
 464b4bc: b4fffcf4     	cbz	x20, 0x464b458 <_ChromeMain+0x46461bc>
 464b4c0: f941d515     	ldr	x21, [x8, #0x3a8]
 464b4c4: 1400000e     	b	0x464b4fc <_ChromeMain+0x4646260>
 464b4c8: 97fe0eff     	bl	0x45cf0c4 <_ChromeMain+0x45c9e28>
 464b4cc: 910022b5     	add	x21, x21, #0x8
 464b4d0: f1002294     	subs	x20, x20, #0x8
 464b4d4: 54fffc20     	b.eq	0x464b458 <_ChromeMain+0x46461bc>
 464b4d8: f94002a8     	ldr	x8, [x21]
 464b4dc: b4ffff88     	cbz	x8, 0x464b4cc <_ChromeMain+0x4646230>
 464b4e0: f941b900     	ldr	x0, [x8, #0x370]
 464b4e4: b4ffff40     	cbz	x0, 0x464b4cc <_ChromeMain+0x4646230>
 464b4e8: 17fffff8     	b	0x464b4c8 <_ChromeMain+0x464622c>
 464b4ec: 97fe0ef6     	bl	0x45cf0c4 <_ChromeMain+0x45c9e28>
 464b4f0: 910022b5     	add	x21, x21, #0x8
 464b4f4: f1002294     	subs	x20, x20, #0x8
 464b4f8: 54fffb00     	b.eq	0x464b458 <_ChromeMain+0x46461bc>
 464b4fc: f94002a8     	ldr	x8, [x21]
 464b500: b4ffff88     	cbz	x8, 0x464b4f0 <_ChromeMain+0x4646254>
 464b504: f941b900     	ldr	x0, [x8, #0x370]
 464b508: b4ffff40     	cbz	x0, 0x464b4f0 <_ChromeMain+0x4646254>
 464b50c: 17fffff8     	b	0x464b4ec <_ChromeMain+0x4646250>
 464b510: b4000288     	cbz	x8, 0x464b560 <_ChromeMain+0x46462c4>
 464b514: f9432508     	ldr	x8, [x8, #0x648]
 464b518: b4000248     	cbz	x8, 0x464b560 <_ChromeMain+0x46462c4>
 464b51c: f941d909     	ldr	x9, [x8, #0x3b0]
 464b520: d37df134     	lsl	x20, x9, #3
 464b524: b40001f4     	cbz	x20, 0x464b560 <_ChromeMain+0x46462c4>
 464b528: f941d515     	ldr	x21, [x8, #0x3a8]
 464b52c: 14000006     	b	0x464b544 <_ChromeMain+0x46462a8>
 464b530: 6f00e400     	movi.2d	v0, #0000000000000000
 464b534: 97fe0f43     	bl	0x45cf240 <_ChromeMain+0x45c9fa4>
 464b538: 910022b5     	add	x21, x21, #0x8
 464b53c: f1002294     	subs	x20, x20, #0x8
 464b540: 540000c0     	b.eq	0x464b558 <_ChromeMain+0x46462bc>
 464b544: f94002a8     	ldr	x8, [x21]
 464b548: b4ffff88     	cbz	x8, 0x464b538 <_ChromeMain+0x464629c>
 464b54c: f941b900     	ldr	x0, [x8, #0x370]
 464b550: b4ffff40     	cbz	x0, 0x464b538 <_ChromeMain+0x464629c>
 464b554: 17fffff7     	b	0x464b530 <_ChromeMain+0x4646294>
 464b558: 39692268     	ldrb	w8, [x19, #0xa48]
 464b55c: 34fff8c8     	cbz	w8, 0x464b474 <_ChromeMain+0x46461d8>
 464b560: f9452a68     	ldr	x8, [x19, #0xa50]
 464b564: 91000515     	add	x21, x8, #0x1
 464b568: f9052a75     	str	x21, [x19, #0xa50]
 464b56c: 9004c400     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 464b570: 9138ac00     	add	x0, x0, #0xe2b
 464b574: 9004c401     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 464b578: 912c7821     	add	x1, x1, #0xb1e
 464b57c: 910063e8     	add	x8, sp, #0x18
 464b580: 52870d02     	mov	w2, #0x3868             ; =14440
 464b584: 96e815bf     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 464b588: f94a0674     	ldr	x20, [x19, #0x1408]
 464b58c: b40000d4     	cbz	x20, 0x464b5a4 <_ChromeMain+0x4646308>
 464b590: 52800028     	mov	w8, #0x1                ; =1
 464b594: b8280288     	ldadd	w8, w8, [x20]
 464b598: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 464b59c: 6b09011f     	cmp	w8, w9
 464b5a0: 54001a60     	b.eq	0x464b8ec <_ChromeMain+0x4646650>
 464b5a4: f94a0a7a     	ldr	x26, [x19, #0x1410]
 464b5a8: 52800900     	mov	w0, #0x48               ; =72
 464b5ac: 96e70f6f     	bl	0xf368 <_ChromeMain+0xa0cc>
 464b5b0: aa0003e3     	mov	x3, x0
 464b5b4: 52800028     	mov	w8, #0x1                ; =1
 464b5b8: b9000008     	str	w8, [x0]
 464b5bc: 90ffe7b6     	adrp	x22, 0x433f000 <_ChromeMain+0x4339d64>
 464b5c0: 911422d6     	add	x22, x22, #0x508
 464b5c4: f0ffcaf7     	adrp	x23, 0x3faa000 <_ChromeMain+0x3fa4d64>
 464b5c8: 912802f7     	add	x23, x23, #0xa00
 464b5cc: a900dc16     	stp	x22, x23, [x0, #0x8]
 464b5d0: f0ffd0f8     	adrp	x24, 0x406a000 <_ChromeMain+0x4064d64>
 464b5d4: 910a0318     	add	x24, x24, #0x280
 464b5d8: 10069599     	adr	x25, 0x4658888 <_ChromeMain+0x46535ec>
 464b5dc: d503201f     	nop
 464b5e0: a901e418     	stp	x24, x25, [x0, #0x18]
 464b5e4: a902d01f     	stp	xzr, x20, [x0, #0x28]
 464b5e8: a903d41a     	stp	x26, x21, [x0, #0x38]
 464b5ec: 91296260     	add	x0, x19, #0xa58
 464b5f0: 910063e1     	add	x1, sp, #0x18
 464b5f4: 52986a02     	mov	w2, #0xc350             ; =50000
 464b5f8: 96f97bc3     	bl	0x4aa504 <_ChromeMain+0x4a5268>
