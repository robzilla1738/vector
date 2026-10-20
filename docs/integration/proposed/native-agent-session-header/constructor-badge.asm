
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 411b300: d10403ff     	sub	sp, sp, #0x100
 411b304: a90a6ffc     	stp	x28, x27, [sp, #0xa0]
 411b308: a90b67fa     	stp	x26, x25, [sp, #0xb0]
 411b30c: a90c5ff8     	stp	x24, x23, [sp, #0xc0]
 411b310: a90d57f6     	stp	x22, x21, [sp, #0xd0]
 411b314: a90e4ff4     	stp	x20, x19, [sp, #0xe0]
 411b318: a90f7bfd     	stp	x29, x30, [sp, #0xf0]
 411b31c: 9103c3fd     	add	x29, sp, #0xf0
 411b320: aa0403f6     	mov	x22, x4
 411b324: aa0303f8     	mov	x24, x3
 411b328: aa0203f7     	mov	x23, x2
 411b32c: aa0103f9     	mov	x25, x1
 411b330: aa0003f3     	mov	x19, x0
 411b334: 97ac63dc     	bl	0x2c342a4 <_ChromeMain+0x2c2f008>
 411b338: d0051188     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 411b33c: 91094108     	add	x8, x8, #0x250
 411b340: f901a008     	str	x8, [x0, #0x340]
 411b344: 390d201f     	strb	wzr, [x0, #0x348]
 411b348: 52800100     	mov	w0, #0x8                ; =8
 411b34c: 96fbd007     	bl	0xf368 <_ChromeMain+0xa0cc>
 411b350: b900001f     	str	wzr, [x0]
 411b354: 3900101f     	strb	wzr, [x0, #0x4]
 411b358: b40000c0     	cbz	x0, 0x411b370 <_ChromeMain+0x41160d4>
 411b35c: 52800028     	mov	w8, #0x1                ; =1
 411b360: b8280008     	ldadd	w8, w8, [x0]
 411b364: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 411b368: 6b09011f     	cmp	w8, w9
 411b36c: 5400ef80     	b.eq	0x411d15c <_ChromeMain+0x4117ec0>
 411b370: 910d0268     	add	x8, x19, #0x340
 411b374: f901aa60     	str	x0, [x19, #0x350]
 411b378: f901ae68     	str	x8, [x19, #0x358]
 411b37c: 90052454     	adrp	x20, 0xe5a3000 <dyld_stub_binder+0xe5a3000>
 411b380: 912d4294     	add	x20, x20, #0xb50
 411b384: 91104288     	add	x8, x20, #0x410
 411b388: a9002274     	stp	x20, x8, [x19]
 411b38c: 9110e288     	add	x8, x20, #0x438
 411b390: f9000a68     	str	x8, [x19, #0x10]
 411b394: 9111c288     	add	x8, x20, #0x470
 411b398: 91128289     	add	x9, x20, #0x4a0
 411b39c: a906a668     	stp	x8, x9, [x19, #0x68]
 411b3a0: 9113c288     	add	x8, x20, #0x4f0
 411b3a4: f9005a68     	str	x8, [x19, #0xb0]
 411b3a8: 91154288     	add	x8, x20, #0x550
 411b3ac: aa1303e9     	mov	x9, x19
 411b3b0: f80d8d28     	str	x8, [x9, #0xd8]!
 411b3b4: f9000be9     	str	x9, [sp, #0x10]
 411b3b8: 91160288     	add	x8, x20, #0x580
 411b3bc: aa1303fb     	mov	x27, x19
 411b3c0: f80f8f68     	str	x8, [x27, #0xf8]!
 411b3c4: 9116a288     	add	x8, x20, #0x5a8
 411b3c8: 90051f89     	adrp	x9, 0xe50b000 <dyld_stub_binder+0xe50b000>
 411b3cc: 912d4129     	add	x9, x9, #0xb50
 411b3d0: f901a268     	str	x8, [x19, #0x340]
 411b3d4: f901b269     	str	x9, [x19, #0x360]
 411b3d8: 925e7669     	and	x9, x19, #0xfffffffc00000000
 411b3dc: f00554bc     	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 411b3e0: f9404788     	ldr	x8, [x28, #0x88]
 411b3e4: eb08013f     	cmp	x9, x8
 411b3e8: 54000061     	b.ne	0x411b3f4 <_ChromeMain+0x4116158>
 411b3ec: aa1303e0     	mov	x0, x19
 411b3f0: 96fbe3c3     	bl	0x142fc <_ChromeMain+0xf060>
 411b3f4: f901b673     	str	x19, [x19, #0x368]
 411b3f8: 3910627f     	strb	wzr, [x19, #0x418]
 411b3fc: b400e393     	cbz	x19, 0x411d06c <_ChromeMain+0x4117dd0>
 411b400: 91104288     	add	x8, x20, #0x410
 411b404: a9002274     	stp	x20, x8, [x19]
 411b408: 9110e288     	add	x8, x20, #0x438
 411b40c: f9000a68     	str	x8, [x19, #0x10]
 411b410: 9111c288     	add	x8, x20, #0x470
 411b414: 91128289     	add	x9, x20, #0x4a0
 411b418: a906a668     	stp	x8, x9, [x19, #0x68]
 411b41c: 9113c288     	add	x8, x20, #0x4f0
 411b420: f9005a68     	str	x8, [x19, #0xb0]
 411b424: 91154288     	add	x8, x20, #0x550
 411b428: f9006e68     	str	x8, [x19, #0xd8]
 411b42c: 91160288     	add	x8, x20, #0x580
 411b430: f9007e68     	str	x8, [x19, #0xf8]
 411b434: 9116a288     	add	x8, x20, #0x5a8
 411b438: f901a268     	str	x8, [x19, #0x340]
 411b43c: 91174288     	add	x8, x20, #0x5d0
 411b440: f901b268     	str	x8, [x19, #0x360]
 411b444: 91108268     	add	x8, x19, #0x420
 411b448: 39c05ec9     	ldrsb	w9, [x22, #0x17]
 411b44c: 37f800c9     	tbnz	w9, #0x1f, 0x411b464 <_ChromeMain+0x41161c8>
 411b450: 3dc002c0     	ldr	q0, [x22]
 411b454: f9400ac9     	ldr	x9, [x22, #0x10]
 411b458: f9000909     	str	x9, [x8, #0x10]
 411b45c: 3d800100     	str	q0, [x8]
 411b460: 14000004     	b	0x411b470 <_ChromeMain+0x41161d4>
 411b464: a9400ac1     	ldp	x1, x2, [x22]
 411b468: 91108260     	add	x0, x19, #0x420
 411b46c: 96fcadd9     	bl	0x46bd0 <_ChromeMain+0x41934>
 411b470: b9401ac8     	ldr	w8, [x22, #0x18]
 411b474: 394072c9     	ldrb	w9, [x22, #0x1c]
 411b478: 3910f269     	strb	w9, [x19, #0x43c]
 411b47c: b9043a68     	str	w8, [x19, #0x438]
 411b480: 91110268     	add	x8, x19, #0x440
 411b484: 39c0dec9     	ldrsb	w9, [x22, #0x37]
 411b488: 37f800c9     	tbnz	w9, #0x1f, 0x411b4a0 <_ChromeMain+0x4116204>
 411b48c: 3cc202c0     	ldur	q0, [x22, #0x20]
 411b490: f84302c9     	ldur	x9, [x22, #0x30]
 411b494: f9000909     	str	x9, [x8, #0x10]
 411b498: 3d800100     	str	q0, [x8]
 411b49c: 14000004     	b	0x411b4ac <_ChromeMain+0x4116210>
 411b4a0: a9420ac1     	ldp	x1, x2, [x22, #0x20]
 411b4a4: 91110260     	add	x0, x19, #0x440
 411b4a8: 96fbf35c     	bl	0x18218 <_ChromeMain+0x12f7c>
 411b4ac: 3940e2c8     	ldrb	w8, [x22, #0x38]
 411b4b0: 39116268     	strb	w8, [x19, #0x458]
 411b4b4: 7908c27f     	strh	wzr, [x19, #0x460]
 411b4b8: f0056f74     	adrp	x20, 0xef0a000 <dyld_stub_binder+0xef0a000>
 411b4bc: 91120294     	add	x20, x20, #0x480
 411b4c0: f8bfc280     	ldapr	x0, [x20]
 411b4c4: b400db80     	cbz	x0, 0x411d034 <_ChromeMain+0x4117d98>
 411b4c8: 52807001     	mov	w1, #0x380              ; =896
 411b4cc: d2800002     	mov	x2, #0x0                ; =0
 411b4d0: 96fe4038     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411b4d4: aa0003fa     	mov	x26, x0
 411b4d8: 978c4758     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 411b4dc: f0052cb5     	adrp	x21, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 411b4e0: 912f42b5     	add	x21, x21, #0xbd0
 411b4e4: 910fc2a8     	add	x8, x21, #0x3f0
 411b4e8: a9002015     	stp	x21, x8, [x0]
 411b4ec: 911062a8     	add	x8, x21, #0x418
 411b4f0: f9000808     	str	x8, [x0, #0x10]
 411b4f4: 911142a8     	add	x8, x21, #0x450
 411b4f8: 911202a9     	add	x9, x21, #0x480
 411b4fc: a906a408     	stp	x8, x9, [x0, #0x68]
 411b500: 911342a8     	add	x8, x21, #0x4d0
 411b504: f9005808     	str	x8, [x0, #0xb0]
 411b508: 9114c2a8     	add	x8, x21, #0x530
 411b50c: f9006c08     	str	x8, [x0, #0xd8]
 411b510: 911582a8     	add	x8, x21, #0x560
 411b514: f9007c08     	str	x8, [x0, #0xf8]
 411b518: f901a41f     	str	xzr, [x0, #0x348]
 411b51c: 2f06e400     	movi	d0, #0xffff000000000000
 411b520: fd01a800     	str	d0, [x0, #0x350]
 411b524: 52800028     	mov	w8, #0x1                ; =1
 411b528: 390d6008     	strb	w8, [x0, #0x358]
 411b52c: f901b01f     	str	xzr, [x0, #0x360]
 411b530: 390da01f     	strb	wzr, [x0, #0x368]
 411b534: f901b81f     	str	xzr, [x0, #0x370]
 411b538: b903781f     	str	wzr, [x0, #0x378]
 411b53c: 390df01f     	strb	wzr, [x0, #0x37c]
 411b540: 3945a408     	ldrb	w8, [x0, #0x169]
 411b544: 3500d9a8     	cbnz	w8, 0x411d078 <_ChromeMain+0x4117ddc>
 411b548: f940ce62     	ldr	x2, [x19, #0x198]
 411b54c: aa1303e0     	mov	x0, x19
 411b550: aa1a03e1     	mov	x1, x26
 411b554: 971977aa     	bl	0x7793fc <_ChromeMain+0x774160>
 411b558: 925e7748     	and	x8, x26, #0xfffffffc00000000
 411b55c: f9404789     	ldr	x9, [x28, #0x88]
 411b560: eb09011f     	cmp	x8, x9
 411b564: 54000061     	b.ne	0x411b570 <_ChromeMain+0x41162d4>
 411b568: aa1a03e0     	mov	x0, x26
 411b56c: 96fbe364     	bl	0x142fc <_ChromeMain+0xf060>
 411b570: f902367a     	str	x26, [x19, #0x468]
 411b574: f8bfc280     	ldapr	x0, [x20]
 411b578: b400d620     	cbz	x0, 0x411d03c <_ChromeMain+0x4117da0>
 411b57c: 52807001     	mov	w1, #0x380              ; =896
 411b580: d2800002     	mov	x2, #0x0                ; =0
 411b584: 96fe400b     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411b588: aa0003fa     	mov	x26, x0
 411b58c: 978c472b     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 411b590: 910fc2a8     	add	x8, x21, #0x3f0
 411b594: a9002015     	stp	x21, x8, [x0]
 411b598: 911062a8     	add	x8, x21, #0x418
 411b59c: f9000808     	str	x8, [x0, #0x10]
 411b5a0: 911142a8     	add	x8, x21, #0x450
 411b5a4: 911202a9     	add	x9, x21, #0x480
 411b5a8: a906a408     	stp	x8, x9, [x0, #0x68]
 411b5ac: 911342a8     	add	x8, x21, #0x4d0
 411b5b0: f9005808     	str	x8, [x0, #0xb0]
 411b5b4: 9114c2a8     	add	x8, x21, #0x530
 411b5b8: f9006c08     	str	x8, [x0, #0xd8]
 411b5bc: 911582a8     	add	x8, x21, #0x560
 411b5c0: f9007c08     	str	x8, [x0, #0xf8]
 411b5c4: f901a41f     	str	xzr, [x0, #0x348]
 411b5c8: 2f06e400     	movi	d0, #0xffff000000000000
 411b5cc: fd01a800     	str	d0, [x0, #0x350]
 411b5d0: 52800028     	mov	w8, #0x1                ; =1
 411b5d4: 390d6008     	strb	w8, [x0, #0x358]
 411b5d8: f901b01f     	str	xzr, [x0, #0x360]
 411b5dc: 390da01f     	strb	wzr, [x0, #0x368]
 411b5e0: f901b81f     	str	xzr, [x0, #0x370]
 411b5e4: b903781f     	str	wzr, [x0, #0x378]
 411b5e8: 390df01f     	strb	wzr, [x0, #0x37c]
 411b5ec: 3945a408     	ldrb	w8, [x0, #0x169]
 411b5f0: 3500d4a8     	cbnz	w8, 0x411d084 <_ChromeMain+0x4117de8>
 411b5f4: f940ce62     	ldr	x2, [x19, #0x198]
 411b5f8: aa1303e0     	mov	x0, x19
 411b5fc: aa1a03e1     	mov	x1, x26
 411b600: 9719777f     	bl	0x7793fc <_ChromeMain+0x774160>
 411b604: 925e7748     	and	x8, x26, #0xfffffffc00000000
 411b608: f9404789     	ldr	x9, [x28, #0x88]
 411b60c: eb09011f     	cmp	x8, x9
 411b610: 54000061     	b.ne	0x411b61c <_ChromeMain+0x4116380>
 411b614: aa1a03e0     	mov	x0, x26
 411b618: 96fbe339     	bl	0x142fc <_ChromeMain+0xf060>
 411b61c: f90003fb     	str	x27, [sp]
 411b620: f9023a7a     	str	x26, [x19, #0x470]
 411b624: f8bfc280     	ldapr	x0, [x20]
 411b628: b400d0e0     	cbz	x0, 0x411d044 <_ChromeMain+0x4117da8>
 411b62c: 52808c01     	mov	w1, #0x460              ; =1120
 411b630: d2800002     	mov	x2, #0x0                ; =0
 411b634: 96fe3fdf     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411b638: aa0003fa     	mov	x26, x0
 411b63c: d2800001     	mov	x1, #0x0                ; =0
 411b640: d2800002     	mov	x2, #0x0                ; =0
 411b644: 528000a3     	mov	w3, #0x5                ; =5
 411b648: 52820004     	mov	w4, #0x1000             ; =4096
 411b64c: 52800005     	mov	w5, #0x0                ; =0
 411b650: 9769bca4     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 411b654: b0052448     	adrp	x8, 0xe5a4000 <dyld_stub_binder+0xe5a4000>
 411b658: 91064108     	add	x8, x8, #0x190
 411b65c: 9112a109     	add	x9, x8, #0x4a8
 411b660: a9002408     	stp	x8, x9, [x0]
 411b664: 91134109     	add	x9, x8, #0x4d0
 411b668: f9000809     	str	x9, [x0, #0x10]
 411b66c: 91142109     	add	x9, x8, #0x508
 411b670: 9114e10a     	add	x10, x8, #0x538
 411b674: a906a809     	stp	x9, x10, [x0, #0x68]
 411b678: 91162109     	add	x9, x8, #0x588
 411b67c: f9005809     	str	x9, [x0, #0xb0]
 411b680: 9117a109     	add	x9, x8, #0x5e8
 411b684: f9006c09     	str	x9, [x0, #0xd8]
 411b688: 91186109     	add	x9, x8, #0x618
 411b68c: aa0003fb     	mov	x27, x0
 411b690: f80f8f69     	str	x9, [x27, #0xf8]!
 411b694: 91190109     	add	x9, x8, #0x640
 411b698: f9018809     	str	x9, [x0, #0x310]
 411b69c: 9119a109     	add	x9, x8, #0x668
 411b6a0: f9019809     	str	x9, [x0, #0x330]
 411b6a4: 911a6109     	add	x9, x8, #0x698
 411b6a8: f9019c09     	str	x9, [x0, #0x338]
 411b6ac: 911c6108     	add	x8, x8, #0x718
 411b6b0: f901a008     	str	x8, [x0, #0x340]
 411b6b4: 52800061     	mov	w1, #0x3                ; =3
 411b6b8: 9769b992     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 411b6bc: aa1a03e0     	mov	x0, x26
 411b6c0: 528000c1     	mov	w1, #0x6                ; =6
 411b6c4: 9712159f     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 411b6c8: 394edb48     	ldrb	w8, [x26, #0x3b6]
 411b6cc: 3500bc88     	cbnz	w8, 0x411ce5c <_ChromeMain+0x4117bc0>
 411b6d0: aa1a03e0     	mov	x0, x26
 411b6d4: 52800001     	mov	w1, #0x0                ; =0
 411b6d8: 97988f26     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 411b6dc: 3945a748     	ldrb	w8, [x26, #0x169]
 411b6e0: 3500cd88     	cbnz	w8, 0x411d090 <_ChromeMain+0x4117df4>
 411b6e4: f940ce62     	ldr	x2, [x19, #0x198]
 411b6e8: aa1303e0     	mov	x0, x19
 411b6ec: aa1a03e1     	mov	x1, x26
 411b6f0: 97197743     	bl	0x7793fc <_ChromeMain+0x774160>
 411b6f4: 925e7748     	and	x8, x26, #0xfffffffc00000000
 411b6f8: f9404789     	ldr	x9, [x28, #0x88]
 411b6fc: eb09011f     	cmp	x8, x9
 411b700: 54000061     	b.ne	0x411b70c <_ChromeMain+0x4116470>
 411b704: aa1a03e0     	mov	x0, x26
 411b708: 96fbe2fd     	bl	0x142fc <_ChromeMain+0xf060>
 411b70c: f9023e7a     	str	x26, [x19, #0x478]
 411b710: f902427f     	str	xzr, [x19, #0x480]
 411b714: f8bfc280     	ldapr	x0, [x20]
 411b718: b400c9a0     	cbz	x0, 0x411d04c <_ChromeMain+0x4117db0>
 411b71c: 52807001     	mov	w1, #0x380              ; =896
 411b720: d2800002     	mov	x2, #0x0                ; =0
 411b724: 96fe3fa3     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411b728: aa0003fa     	mov	x26, x0
 411b72c: 978c46c3     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 411b730: 910fc2a8     	add	x8, x21, #0x3f0
 411b734: a9002015     	stp	x21, x8, [x0]
 411b738: 911062a8     	add	x8, x21, #0x418
 411b73c: f9000808     	str	x8, [x0, #0x10]
 411b740: 911142a8     	add	x8, x21, #0x450
 411b744: 911202a9     	add	x9, x21, #0x480
 411b748: a906a408     	stp	x8, x9, [x0, #0x68]
 411b74c: 911342a8     	add	x8, x21, #0x4d0
 411b750: f9005808     	str	x8, [x0, #0xb0]
 411b754: 9114c2a8     	add	x8, x21, #0x530
 411b758: f9006c08     	str	x8, [x0, #0xd8]
 411b75c: 911582a8     	add	x8, x21, #0x560
 411b760: f9007c08     	str	x8, [x0, #0xf8]
 411b764: f901a41f     	str	xzr, [x0, #0x348]
 411b768: 2f06e400     	movi	d0, #0xffff000000000000
 411b76c: fd01a800     	str	d0, [x0, #0x350]
 411b770: 52800028     	mov	w8, #0x1                ; =1
 411b774: 390d6008     	strb	w8, [x0, #0x358]
 411b778: f901b01f     	str	xzr, [x0, #0x360]
 411b77c: 390da01f     	strb	wzr, [x0, #0x368]
 411b780: f901b81f     	str	xzr, [x0, #0x370]
 411b784: b903781f     	str	wzr, [x0, #0x378]
 411b788: 390df01f     	strb	wzr, [x0, #0x37c]
 411b78c: 3945a408     	ldrb	w8, [x0, #0x169]
 411b790: 3500c868     	cbnz	w8, 0x411d09c <_ChromeMain+0x4117e00>
 411b794: f940ce62     	ldr	x2, [x19, #0x198]
 411b798: aa1303e0     	mov	x0, x19
 411b79c: aa1a03e1     	mov	x1, x26
 411b7a0: 97197717     	bl	0x7793fc <_ChromeMain+0x774160>
 411b7a4: 925e7748     	and	x8, x26, #0xfffffffc00000000
 411b7a8: f9404789     	ldr	x9, [x28, #0x88]
 411b7ac: eb09011f     	cmp	x8, x9
 411b7b0: 54000061     	b.ne	0x411b7bc <_ChromeMain+0x4116520>
 411b7b4: aa1a03e0     	mov	x0, x26
 411b7b8: 96fbe2d1     	bl	0x142fc <_ChromeMain+0xf060>
 411b7bc: f902467a     	str	x26, [x19, #0x488]
 411b7c0: f8bfc280     	ldapr	x0, [x20]
 411b7c4: b400c480     	cbz	x0, 0x411d054 <_ChromeMain+0x4117db8>
 411b7c8: 52806801     	mov	w1, #0x340              ; =832
 411b7cc: d2800002     	mov	x2, #0x0                ; =0
 411b7d0: 96fe3f78     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411b7d4: aa0003fa     	mov	x26, x0
 411b7d8: 97ac62b3     	bl	0x2c342a4 <_ChromeMain+0x2c2f008>
 411b7dc: b0052448     	adrp	x8, 0xe5a4000 <dyld_stub_binder+0xe5a4000>
 411b7e0: 9124c108     	add	x8, x8, #0x930
 411b7e4: 910fa109     	add	x9, x8, #0x3e8
 411b7e8: a9002408     	stp	x8, x9, [x0]
 411b7ec: 91104109     	add	x9, x8, #0x410
 411b7f0: f9000809     	str	x9, [x0, #0x10]
 411b7f4: 91112109     	add	x9, x8, #0x448
 411b7f8: 9111e10a     	add	x10, x8, #0x478
 411b7fc: a906a809     	stp	x9, x10, [x0, #0x68]
 411b800: 91132109     	add	x9, x8, #0x4c8
 411b804: f9005809     	str	x9, [x0, #0xb0]
 411b808: 9114a109     	add	x9, x8, #0x528
 411b80c: f9006c09     	str	x9, [x0, #0xd8]
 411b810: 91156108     	add	x8, x8, #0x558
 411b814: aa0003fb     	mov	x27, x0
 411b818: f80f8f68     	str	x8, [x27, #0xf8]!
 411b81c: 52800035     	mov	w21, #0x1               ; =1
 411b820: 52800021     	mov	w1, #0x1                ; =1
 411b824: 9596dfcc     	bl	0xa6d3754 <_ChromeMain+0xa6ce4b8>
 411b828: b9432348     	ldr	w8, [x26, #0x320]
 411b82c: 7100051f     	cmp	w8, #0x1
 411b830: 540001e0     	b.eq	0x411b86c <_ChromeMain+0x41165d0>
 411b834: f9418b48     	ldr	x8, [x26, #0x310]
 411b838: b90053f5     	str	w21, [sp, #0x50]
 411b83c: d0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411b840: 9115a021     	add	x1, x1, #0x568
 411b844: 91046100     	add	x0, x8, #0x118
 411b848: 910143e2     	add	x2, sp, #0x50
 411b84c: 97652656     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 411b850: b9032355     	str	w21, [x26, #0x320]
 411b854: aa1a03e0     	mov	x0, x26
 411b858: 52800021     	mov	w1, #0x1                ; =1
 411b85c: 971b1842     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 411b860: 910c8341     	add	x1, x26, #0x320
 411b864: aa1b03e0     	mov	x0, x27
 411b868: 973831da     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411b86c: 3945a748     	ldrb	w8, [x26, #0x169]
 411b870: 3500c1c8     	cbnz	w8, 0x411d0a8 <_ChromeMain+0x4117e0c>
 411b874: f940ce62     	ldr	x2, [x19, #0x198]
 411b878: aa1303e0     	mov	x0, x19
 411b87c: aa1a03e1     	mov	x1, x26
 411b880: 971976df     	bl	0x7793fc <_ChromeMain+0x774160>
 411b884: 925e7748     	and	x8, x26, #0xfffffffc00000000
 411b888: f9404789     	ldr	x9, [x28, #0x88]
 411b88c: eb09011f     	cmp	x8, x9
 411b890: 54000061     	b.ne	0x411b89c <_ChromeMain+0x4116600>
 411b894: aa1a03e0     	mov	x0, x26
 411b898: 96fbe299     	bl	0x142fc <_ChromeMain+0xf060>
 411b89c: f9024a7a     	str	x26, [x19, #0x490]
 411b8a0: f8bfc280     	ldapr	x0, [x20]
 411b8a4: b400bdc0     	cbz	x0, 0x411d05c <_ChromeMain+0x4117dc0>
 411b8a8: 52808c01     	mov	w1, #0x460              ; =1120
 411b8ac: d2800002     	mov	x2, #0x0                ; =0
 411b8b0: 96fe3f40     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411b8b4: aa0003fb     	mov	x27, x0
 411b8b8: d2800001     	mov	x1, #0x0                ; =0
 411b8bc: d2800002     	mov	x2, #0x0                ; =0
 411b8c0: 528000a3     	mov	w3, #0x5                ; =5
 411b8c4: 52820004     	mov	w4, #0x1000             ; =4096
 411b8c8: 52800005     	mov	w5, #0x0                ; =0
 411b8cc: 9769bc05     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 411b8d0: 3945a408     	ldrb	w8, [x0, #0x169]
 411b8d4: 3500bf08     	cbnz	w8, 0x411d0b4 <_ChromeMain+0x4117e18>
 411b8d8: f940cf42     	ldr	x2, [x26, #0x198]
 411b8dc: aa1a03e0     	mov	x0, x26
 411b8e0: aa1b03e1     	mov	x1, x27
 411b8e4: 971976c6     	bl	0x7793fc <_ChromeMain+0x774160>
 411b8e8: 925e7768     	and	x8, x27, #0xfffffffc00000000
 411b8ec: f9404789     	ldr	x9, [x28, #0x88]
 411b8f0: eb09011f     	cmp	x8, x9
 411b8f4: 54000061     	b.ne	0x411b900 <_ChromeMain+0x4116664>
 411b8f8: aa1b03e0     	mov	x0, x27
 411b8fc: 96fbe280     	bl	0x142fc <_ChromeMain+0xf060>
 411b900: f9024e7b     	str	x27, [x19, #0x498]
 411b904: f902527f     	str	xzr, [x19, #0x4a0]
 411b908: f9025a7f     	str	xzr, [x19, #0x4b0]
 411b90c: f902567f     	str	xzr, [x19, #0x4a8]
 411b910: 925e7728     	and	x8, x25, #0xfffffffc00000000
 411b914: f9404789     	ldr	x9, [x28, #0x88]
 411b918: eb09011f     	cmp	x8, x9
 411b91c: 54000061     	b.ne	0x411b928 <_ChromeMain+0x411668c>
 411b920: aa1903e0     	mov	x0, x25
 411b924: 96fbe276     	bl	0x142fc <_ChromeMain+0xf060>
 411b928: f9025e79     	str	x25, [x19, #0x4b8]
 411b92c: b904c277     	str	w23, [x19, #0x4c0]
 411b930: 91131268     	add	x8, x19, #0x4c4
 411b934: b904ce7f     	str	wzr, [x19, #0x4cc]
 411b938: f900011f     	str	xzr, [x8]
 411b93c: 91134260     	add	x0, x19, #0x4d0
 411b940: aa1803e1     	mov	x1, x24
 411b944: 94de5877     	bl	0x78b1b20 <_ChromeMain+0x78ac884>
 411b948: 790b127f     	strh	wzr, [x19, #0x588]
 411b94c: f902c27f     	str	xzr, [x19, #0x580]
 411b950: 6f00e400     	movi.2d	v0, #0000000000000000
 411b954: 3d815e60     	str	q0, [x19, #0x570]
 411b958: 52800100     	mov	w0, #0x8                ; =8
 411b95c: 96fbce83     	bl	0xf368 <_ChromeMain+0xa0cc>
 411b960: b900001f     	str	wzr, [x0]
 411b964: 3900101f     	strb	wzr, [x0, #0x4]
 411b968: 925e767b     	and	x27, x19, #0xfffffffc00000000
 411b96c: b40000c0     	cbz	x0, 0x411b984 <_ChromeMain+0x41166e8>
 411b970: 52800028     	mov	w8, #0x1                ; =1
 411b974: b8280008     	ldadd	w8, w8, [x0]
 411b978: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 411b97c: 6b09011f     	cmp	w8, w9
 411b980: 5400bf40     	b.eq	0x411d168 <_ChromeMain+0x4117ecc>
 411b984: 9112827a     	add	x26, x19, #0x4a0
 411b988: f902ca60     	str	x0, [x19, #0x590]
 411b98c: f902ce73     	str	x19, [x19, #0x598]
 411b990: d0ff2219     	adrp	x25, 0x255d000 <_ChromeMain+0x2557d64>
 411b994: 912c0339     	add	x25, x25, #0xb00
 411b998: 710006ff     	cmp	w23, #0x1
 411b99c: 54001161     	b.ne	0x411bbc8 <_ChromeMain+0x411692c>
 411b9a0: 394072c8     	ldrb	w8, [x22, #0x1c]
 411b9a4: 52000115     	eor	w21, w8, #0x1
 411b9a8: f8bfc280     	ldapr	x0, [x20]
 411b9ac: b400bf40     	cbz	x0, 0x411d194 <_ChromeMain+0x4117ef8>
 411b9b0: 52808301     	mov	w1, #0x418              ; =1048
 411b9b4: d2800002     	mov	x2, #0x0                ; =0
 411b9b8: 96fe3efe     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411b9bc: aa0003f6     	mov	x22, x0
 411b9c0: 120002a1     	and	w1, w21, #0x1
 411b9c4: 97fff790     	bl	0x4119804 <_ChromeMain+0x4114568>
 411b9c8: 3945a408     	ldrb	w8, [x0, #0x169]
 411b9cc: 3500c228     	cbnz	w8, 0x411d210 <_ChromeMain+0x4117f74>
 411b9d0: f940ce62     	ldr	x2, [x19, #0x198]
 411b9d4: aa1303e0     	mov	x0, x19
 411b9d8: aa1603e1     	mov	x1, x22
 411b9dc: 97197688     	bl	0x7793fc <_ChromeMain+0x774160>
 411b9e0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 411b9e4: f9404789     	ldr	x9, [x28, #0x88]
 411b9e8: eb09011f     	cmp	x8, x9
 411b9ec: 54000061     	b.ne	0x411b9f8 <_ChromeMain+0x411675c>
 411b9f0: aa1603e0     	mov	x0, x22
 411b9f4: 96fbe242     	bl	0x142fc <_ChromeMain+0xf060>
 411b9f8: f9400340     	ldr	x0, [x26]
 411b9fc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 411ba00: f9404789     	ldr	x9, [x28, #0x88]
 411ba04: eb09011f     	cmp	x8, x9
 411ba08: 54000041     	b.ne	0x411ba10 <_ChromeMain+0x4116774>
 411ba0c: 96fc1c0c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 411ba10: f9000356     	str	x22, [x26]
 411ba14: f8bfc280     	ldapr	x0, [x20]
 411ba18: b400bc20     	cbz	x0, 0x411d19c <_ChromeMain+0x4117f00>
 411ba1c: 52806201     	mov	w1, #0x310              ; =784
 411ba20: d2800002     	mov	x2, #0x0                ; =0
 411ba24: 96fe3ee3     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411ba28: aa0003f6     	mov	x22, x0
 411ba2c: 97494dc5     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 411ba30: 3945a408     	ldrb	w8, [x0, #0x169]
 411ba34: 3500bf48     	cbnz	w8, 0x411d21c <_ChromeMain+0x4117f80>
 411ba38: f940ce62     	ldr	x2, [x19, #0x198]
 411ba3c: aa1303e0     	mov	x0, x19
 411ba40: aa1603e1     	mov	x1, x22
 411ba44: 9719766e     	bl	0x7793fc <_ChromeMain+0x774160>
 411ba48: f9404788     	ldr	x8, [x28, #0x88]
 411ba4c: 925e76c9     	and	x9, x22, #0xfffffffc00000000
 411ba50: eb08013f     	cmp	x9, x8
 411ba54: 54000081     	b.ne	0x411ba64 <_ChromeMain+0x41167c8>
 411ba58: aa1603e0     	mov	x0, x22
 411ba5c: 96fbe228     	bl	0x142fc <_ChromeMain+0xf060>
 411ba60: f9404788     	ldr	x8, [x28, #0x88]
 411ba64: f9425660     	ldr	x0, [x19, #0x4a8]
 411ba68: 925e7409     	and	x9, x0, #0xfffffffc00000000
 411ba6c: eb08013f     	cmp	x9, x8
 411ba70: 54000061     	b.ne	0x411ba7c <_ChromeMain+0x41167e0>
 411ba74: 96fc1bf2     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 411ba78: f9404788     	ldr	x8, [x28, #0x88]
 411ba7c: f9025676     	str	x22, [x19, #0x4a8]
 411ba80: eb08037f     	cmp	x27, x8
 411ba84: 54000061     	b.ne	0x411ba90 <_ChromeMain+0x41167f4>
 411ba88: aa1303e0     	mov	x0, x19
 411ba8c: 96fbe21c     	bl	0x142fc <_ChromeMain+0xf060>
 411ba90: 52800700     	mov	w0, #0x38               ; =56
 411ba94: 96fbce35     	bl	0xf368 <_ChromeMain+0xa0cc>
 411ba98: aa0003f7     	mov	x23, x0
 411ba9c: 52800035     	mov	w21, #0x1               ; =1
 411baa0: b9000015     	str	w21, [x0]
 411baa4: 1000c948     	adr	x8, 0x411d3cc <_ChromeMain+0x4118130>
 411baa8: d503201f     	nop
 411baac: b0fff289     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 411bab0: 9127012a     	add	x10, x9, #0x9c0
 411bab4: b0fecd49     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 411bab8: 91180129     	add	x9, x9, #0x600
 411babc: a900a40a     	stp	x10, x9, [x0, #0x8]
 411bac0: a901a019     	stp	x25, x8, [x0, #0x18]
 411bac4: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 411bac8: f8bfc280     	ldapr	x0, [x20]
 411bacc: b400b6c0     	cbz	x0, 0x411d1a4 <_ChromeMain+0x4117f08>
 411bad0: 5280c501     	mov	w1, #0x628              ; =1576
 411bad4: d2800002     	mov	x2, #0x0                ; =0
 411bad8: 96fe3eb6     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411badc: aa0003f6     	mov	x22, x0
 411bae0: f9002bf7     	str	x23, [sp, #0x50]
 411bae4: 390163f5     	strb	w21, [sp, #0x58]
 411bae8: 52800700     	mov	w0, #0x38               ; =56
 411baec: 96fbce1f     	bl	0xf368 <_ChromeMain+0xa0cc>
 411baf0: aa0003f7     	mov	x23, x0
 411baf4: a902fc1f     	stp	xzr, xzr, [x0, #0x28]
 411baf8: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 411bafc: d0051188     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 411bb00: 91384108     	add	x8, x8, #0xe10
 411bb04: f9000008     	str	x8, [x0]
 411bb08: b00511c8     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 411bb0c: 9127e108     	add	x8, x8, #0x9f8
 411bb10: aa0003f8     	mov	x24, x0
 411bb14: f8008f08     	str	x8, [x24, #0x8]!
 411bb18: f900081f     	str	xzr, [x0, #0x10]
 411bb1c: 3900801f     	strb	wzr, [x0, #0x20]
 411bb20: 925e7708     	and	x8, x24, #0xfffffffc00000000
 411bb24: f9404789     	ldr	x9, [x28, #0x88]
 411bb28: eb09011f     	cmp	x8, x9
 411bb2c: 54000061     	b.ne	0x411bb38 <_ChromeMain+0x411689c>
 411bb30: aa1803e0     	mov	x0, x24
 411bb34: 96fbe1f2     	bl	0x142fc <_ChromeMain+0xf060>
 411bb38: a902fef8     	stp	x24, xzr, [x23, #0x28]
 411bb3c: aa1803e0     	mov	x0, x24
 411bb40: d2800001     	mov	x1, #0x0                ; =0
 411bb44: 97770c57     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 411bb48: 910143e1     	add	x1, sp, #0x50
 411bb4c: aa1603e0     	mov	x0, x22
 411bb50: d2800002     	mov	x2, #0x0                ; =0
 411bb54: d2800003     	mov	x3, #0x0                ; =0
 411bb58: 52800044     	mov	w4, #0x2                ; =2
 411bb5c: aa1703e5     	mov	x5, x23
 411bb60: 9769b538     	bl	0x1b89040 <_ChromeMain+0x1b83da4>
 411bb64: 394163e8     	ldrb	w8, [sp, #0x58]
 411bb68: 7103fd1f     	cmp	w8, #0xff
 411bb6c: 54000060     	b.eq	0x411bb78 <_ChromeMain+0x41168dc>
 411bb70: f9402be0     	ldr	x0, [sp, #0x50]
 411bb74: b500a020     	cbnz	x0, 0x411cf78 <_ChromeMain+0x4117cdc>
 411bb78: 3945a6c8     	ldrb	w8, [x22, #0x169]
 411bb7c: 3500b568     	cbnz	w8, 0x411d228 <_ChromeMain+0x4117f8c>
 411bb80: f940ce62     	ldr	x2, [x19, #0x198]
 411bb84: aa1303e0     	mov	x0, x19
 411bb88: aa1603e1     	mov	x1, x22
 411bb8c: 9719761c     	bl	0x7793fc <_ChromeMain+0x774160>
 411bb90: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 411bb94: f9404789     	ldr	x9, [x28, #0x88]
 411bb98: eb09011f     	cmp	x8, x9
 411bb9c: 54000061     	b.ne	0x411bba8 <_ChromeMain+0x411690c>
 411bba0: aa1603e0     	mov	x0, x22
 411bba4: 96fbe1d6     	bl	0x142fc <_ChromeMain+0xf060>
 411bba8: f9425a60     	ldr	x0, [x19, #0x4b0]
 411bbac: 925e7408     	and	x8, x0, #0xfffffffc00000000
 411bbb0: f9404789     	ldr	x9, [x28, #0x88]
 411bbb4: eb09011f     	cmp	x8, x9
 411bbb8: 54000041     	b.ne	0x411bbc0 <_ChromeMain+0x4116924>
 411bbbc: 96fc1ba0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 411bbc0: f9025a76     	str	x22, [x19, #0x4b0]
 411bbc4: 14000036     	b	0x411bc9c <_ChromeMain+0x4116a00>
 411bbc8: f8bfc280     	ldapr	x0, [x20]
 411bbcc: b400af00     	cbz	x0, 0x411d1ac <_ChromeMain+0x4117f10>
 411bbd0: 52808301     	mov	w1, #0x418              ; =1048
 411bbd4: d2800002     	mov	x2, #0x0                ; =0
 411bbd8: 96fe3e76     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411bbdc: aa0003f6     	mov	x22, x0
 411bbe0: 52800001     	mov	w1, #0x0                ; =0
 411bbe4: 97fff708     	bl	0x4119804 <_ChromeMain+0x4114568>
 411bbe8: 3945a408     	ldrb	w8, [x0, #0x169]
 411bbec: 3500b248     	cbnz	w8, 0x411d234 <_ChromeMain+0x4117f98>
 411bbf0: f940ce62     	ldr	x2, [x19, #0x198]
 411bbf4: aa1303e0     	mov	x0, x19
 411bbf8: aa1603e1     	mov	x1, x22
 411bbfc: 97197600     	bl	0x7793fc <_ChromeMain+0x774160>
 411bc00: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 411bc04: f9404789     	ldr	x9, [x28, #0x88]
 411bc08: eb09011f     	cmp	x8, x9
 411bc0c: 54000061     	b.ne	0x411bc18 <_ChromeMain+0x411697c>
 411bc10: aa1603e0     	mov	x0, x22
 411bc14: 96fbe1ba     	bl	0x142fc <_ChromeMain+0xf060>
 411bc18: f9400340     	ldr	x0, [x26]
 411bc1c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 411bc20: f9404789     	ldr	x9, [x28, #0x88]
 411bc24: eb09011f     	cmp	x8, x9
 411bc28: 54000041     	b.ne	0x411bc30 <_ChromeMain+0x4116994>
 411bc2c: 96fc1b84     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 411bc30: f9000356     	str	x22, [x26]
 411bc34: f8bfc280     	ldapr	x0, [x20]
 411bc38: b400abe0     	cbz	x0, 0x411d1b4 <_ChromeMain+0x4117f18>
 411bc3c: 52806201     	mov	w1, #0x310              ; =784
 411bc40: d2800002     	mov	x2, #0x0                ; =0
 411bc44: 96fe3e5b     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411bc48: aa0003f6     	mov	x22, x0
 411bc4c: 97494d3d     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 411bc50: 3945a408     	ldrb	w8, [x0, #0x169]
 411bc54: 3500af68     	cbnz	w8, 0x411d240 <_ChromeMain+0x4117fa4>
 411bc58: f940ce62     	ldr	x2, [x19, #0x198]
 411bc5c: aa1303e0     	mov	x0, x19
 411bc60: aa1603e1     	mov	x1, x22
 411bc64: 971975e6     	bl	0x7793fc <_ChromeMain+0x774160>
 411bc68: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 411bc6c: f9404789     	ldr	x9, [x28, #0x88]
 411bc70: eb09011f     	cmp	x8, x9
 411bc74: 54000061     	b.ne	0x411bc80 <_ChromeMain+0x41169e4>
 411bc78: aa1603e0     	mov	x0, x22
 411bc7c: 96fbe1a0     	bl	0x142fc <_ChromeMain+0xf060>
 411bc80: f9425660     	ldr	x0, [x19, #0x4a8]
 411bc84: 925e7408     	and	x8, x0, #0xfffffffc00000000
 411bc88: f9404789     	ldr	x9, [x28, #0x88]
 411bc8c: eb09011f     	cmp	x8, x9
 411bc90: 54000041     	b.ne	0x411bc98 <_ChromeMain+0x41169fc>
 411bc94: 96fc1b6a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 411bc98: f9025676     	str	x22, [x19, #0x4a8]
 411bc9c: f9404788     	ldr	x8, [x28, #0x88]
 411bca0: eb08037f     	cmp	x27, x8
 411bca4: 54000060     	b.eq	0x411bcb0 <_ChromeMain+0x4116a14>
 411bca8: 52800017     	mov	w23, #0x0               ; =0
 411bcac: 14000006     	b	0x411bcc4 <_ChromeMain+0x4116a28>
 411bcb0: aa1303e0     	mov	x0, x19
 411bcb4: 96fbe192     	bl	0x142fc <_ChromeMain+0xf060>
 411bcb8: f9404788     	ldr	x8, [x28, #0x88]
 411bcbc: eb08037f     	cmp	x27, x8
 411bcc0: 1a9f17f7     	cset	w23, eq
 411bcc4: 52800700     	mov	w0, #0x38               ; =56
 411bcc8: 96fbcda8     	bl	0xf368 <_ChromeMain+0xa0cc>
 411bccc: aa0003f6     	mov	x22, x0
 411bcd0: b9000015     	str	w21, [x0]
 411bcd4: 10023868     	adr	x8, 0x41203e0 <_ChromeMain+0x411b144>
 411bcd8: d503201f     	nop
 411bcdc: b0fecd49     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 411bce0: 91180129     	add	x9, x9, #0x600
 411bce4: a900a408     	stp	x8, x9, [x0, #0x8]
 411bce8: 1000b828     	adr	x8, 0x411d3ec <_ChromeMain+0x4118150>
 411bcec: d503201f     	nop
 411bcf0: a901a019     	stp	x25, x8, [x0, #0x18]
 411bcf4: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 411bcf8: 34000077     	cbz	w23, 0x411bd04 <_ChromeMain+0x4116a68>
 411bcfc: aa1303e0     	mov	x0, x19
 411bd00: 96fbe17f     	bl	0x142fc <_ChromeMain+0xf060>
 411bd04: 52800700     	mov	w0, #0x38               ; =56
 411bd08: 96fbcd98     	bl	0xf368 <_ChromeMain+0xa0cc>
 411bd0c: aa0003f8     	mov	x24, x0
 411bd10: b9000015     	str	w21, [x0]
 411bd14: 1000c9c8     	adr	x8, 0x411d64c <_ChromeMain+0x41183b0>
 411bd18: d503201f     	nop
 411bd1c: b0fff289     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 411bd20: 9127012a     	add	x10, x9, #0x9c0
 411bd24: b0fecd49     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 411bd28: 91180129     	add	x9, x9, #0x600
 411bd2c: a900a40a     	stp	x10, x9, [x0, #0x8]
 411bd30: a901a019     	stp	x25, x8, [x0, #0x18]
 411bd34: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 411bd38: f8bfc280     	ldapr	x0, [x20]
 411bd3c: b4009940     	cbz	x0, 0x411d064 <_ChromeMain+0x4117dc8>
 411bd40: 5280d001     	mov	w1, #0x680              ; =1664
 411bd44: d2800002     	mov	x2, #0x0                ; =0
 411bd48: 96fe3e1a     	bl	0xab5b0 <_ChromeMain+0xa6314>
 411bd4c: aa0003f7     	mov	x23, x0
 411bd50: aa1603e1     	mov	x1, x22
 411bd54: aa1803e2     	mov	x2, x24
 411bd58: 95d229a5     	bl	0xb5a63ec <_ChromeMain+0xb5a1150>
 411bd5c: 3945a408     	ldrb	w8, [x0, #0x169]
 411bd60: f9400bf4     	ldr	x20, [sp, #0x10]
 411bd64: 35009ae8     	cbnz	w8, 0x411d0c0 <_ChromeMain+0x4117e24>
 411bd68: aa1303e0     	mov	x0, x19
 411bd6c: aa1703e1     	mov	x1, x23
 411bd70: 52800062     	mov	w2, #0x3                ; =3
 411bd74: 971975a2     	bl	0x7793fc <_ChromeMain+0x774160>
 411bd78: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 411bd7c: f9404789     	ldr	x9, [x28, #0x88]
 411bd80: eb09011f     	cmp	x8, x9
 411bd84: 54000061     	b.ne	0x411bd90 <_ChromeMain+0x4116af4>
 411bd88: aa1703e0     	mov	x0, x23
 411bd8c: 96fbe15c     	bl	0x142fc <_ChromeMain+0xf060>
 411bd90: f9424260     	ldr	x0, [x19, #0x480]
 411bd94: 925e7408     	and	x8, x0, #0xfffffffc00000000
 411bd98: f9404789     	ldr	x9, [x28, #0x88]
 411bd9c: eb09011f     	cmp	x8, x9
 411bda0: 54000041     	b.ne	0x411bda8 <_ChromeMain+0x4116b0c>
 411bda4: 96fc1b26     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 411bda8: f9024277     	str	x23, [x19, #0x480]
 411bdac: 90056fbb     	adrp	x27, 0xef0f000 <dyld_stub_binder+0xef0f000>
 411bdb0: f946f760     	ldr	x0, [x27, #0xde8]
 411bdb4: b40098c0     	cbz	x0, 0x411d0cc <_ChromeMain+0x4117e30>
 411bdb8: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 411bdbc: f90033ff     	str	xzr, [sp, #0x60]
 411bdc0: 910143e8     	add	x8, sp, #0x50
 411bdc4: 5285cb81     	mov	w1, #0x2e5c             ; =11868
 411bdc8: 97466245     	bl	0x12b46dc <_ChromeMain+0x12af440>
 411bdcc: 910143e1     	add	x1, sp, #0x50
 411bdd0: aa1703e0     	mov	x0, x23
 411bdd4: 97465ff7     	bl	0x12b3db0 <_ChromeMain+0x12aeb14>
 411bdd8: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 411bddc: 36f800a8     	tbz	w8, #0x1f, 0x411bdf0 <_ChromeMain+0x4116b54>
 411bde0: f9402be0     	ldr	x0, [sp, #0x50]
 411bde4: f94033e8     	ldr	x8, [sp, #0x60]
 411bde8: d37ff901     	lsl	x1, x8, #1
 411bdec: 96fbb433     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411bdf0: d0054756     	adrp	x22, 0xea05000 <dyld_stub_binder+0xea05000>
 411bdf4: 911a22d6     	add	x22, x22, #0x688
 411bdf8: 90054dc2     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 411bdfc: 91126042     	add	x2, x2, #0x498
 411be00: aa1403e0     	mov	x0, x20
 411be04: aa1603e1     	mov	x1, x22
 411be08: 976be37e     	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 411be0c: f9424668     	ldr	x8, [x19, #0x488]
 411be10: 90054dc2     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 411be14: 91124042     	add	x2, x2, #0x490
 411be18: 91036100     	add	x0, x8, #0xd8
 411be1c: aa1603e1     	mov	x1, x22
 411be20: 976be378     	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 411be24: f9423668     	ldr	x8, [x19, #0x468]
 411be28: 3946a509     	ldrb	w9, [x8, #0x1a9]
 411be2c: 340000a9     	cbz	w9, 0x411be40 <_ChromeMain+0x4116ba4>
 411be30: 3906a51f     	strb	wzr, [x8, #0x1a9]
 411be34: 9103e100     	add	x0, x8, #0xf8
 411be38: 9106a501     	add	x1, x8, #0x1a9
 411be3c: 97383065     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411be40: f9423a68     	ldr	x8, [x19, #0x470]
 411be44: 3946a509     	ldrb	w9, [x8, #0x1a9]
 411be48: 340000a9     	cbz	w9, 0x411be5c <_ChromeMain+0x4116bc0>
 411be4c: 3906a51f     	strb	wzr, [x8, #0x1a9]
 411be50: 9103e100     	add	x0, x8, #0xf8
 411be54: 9106a501     	add	x1, x8, #0x1a9
 411be58: 9738305e     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411be5c: f9423e76     	ldr	x22, [x19, #0x478]
 411be60: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 411be64: 340000c8     	cbz	w8, 0x411be7c <_ChromeMain+0x4116be0>
 411be68: 3906a6df     	strb	wzr, [x22, #0x1a9]
 411be6c: 9103e2c0     	add	x0, x22, #0xf8
 411be70: 9106a6c1     	add	x1, x22, #0x1a9
 411be74: 97383057     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411be78: f9423e76     	ldr	x22, [x19, #0x478]
 411be7c: b944c268     	ldr	w8, [x19, #0x4c0]
 411be80: 52800049     	mov	w9, #0x2                ; =2
 411be84: 7100051f     	cmp	w8, #0x1
 411be88: 1a9f0137     	csel	w23, w9, wzr, eq
 411be8c: 52803e88     	mov	w8, #0x1f4              ; =500
 411be90: 52803209     	mov	w9, #0x190              ; =400
 411be94: 1a880138     	csel	w24, w9, w8, eq
 411be98: 9595adff     	bl	0xa687694 <_ChromeMain+0xa6823f8>
 411be9c: f9400000     	ldr	x0, [x0]
 411bea0: aa1703e1     	mov	x1, x23
 411bea4: 52800002     	mov	w2, #0x0                ; =0
 411bea8: aa1803e3     	mov	x3, x24
 411beac: 976e2df5     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 411beb0: f9002be0     	str	x0, [sp, #0x50]
 411beb4: b40000a0     	cbz	x0, 0x411bec8 <_ChromeMain+0x4116c2c>
 411beb8: b9400008     	ldr	w8, [x0]
 411bebc: 31000508     	adds	w8, w8, #0x1
 411bec0: b9000008     	str	w8, [x0]
 411bec4: 540090a2     	b.hs	0x411d0d8 <_ChromeMain+0x4117e3c>
 411bec8: f94002c8     	ldr	x8, [x22]
 411becc: f941ed08     	ldr	x8, [x8, #0x3d8]
 411bed0: 910143e1     	add	x1, sp, #0x50
 411bed4: aa1603e0     	mov	x0, x22
 411bed8: d63f0100     	blr	x8
 411bedc: f9402be0     	ldr	x0, [sp, #0x50]
 411bee0: b40000c0     	cbz	x0, 0x411bef8 <_ChromeMain+0x4116c5c>
 411bee4: b9400009     	ldr	w9, [x0]
 411bee8: 51000528     	sub	w8, w9, #0x1
 411beec: b9000008     	str	w8, [x0]
 411bef0: 34008fa9     	cbz	w9, 0x411d0e4 <_ChromeMain+0x4117e48>
 411bef4: 34007808     	cbz	w8, 0x411cdf4 <_ChromeMain+0x4117b58>
 411bef8: f9424668     	ldr	x8, [x19, #0x488]
 411befc: 3946a509     	ldrb	w9, [x8, #0x1a9]
 411bf00: 340000a9     	cbz	w9, 0x411bf14 <_ChromeMain+0x4116c78>
 411bf04: 3906a51f     	strb	wzr, [x8, #0x1a9]
 411bf08: 9103e100     	add	x0, x8, #0xf8
 411bf0c: 9106a501     	add	x1, x8, #0x1a9
 411bf10: 97383030     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411bf14: f9425668     	ldr	x8, [x19, #0x4a8]
 411bf18: 3946a509     	ldrb	w9, [x8, #0x1a9]
 411bf1c: 340000a9     	cbz	w9, 0x411bf30 <_ChromeMain+0x4116c94>
 411bf20: 3906a51f     	strb	wzr, [x8, #0x1a9]
 411bf24: 9103e100     	add	x0, x8, #0xf8
 411bf28: 9106a501     	add	x1, x8, #0x1a9
 411bf2c: 97383029     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411bf30: f9400356     	ldr	x22, [x26]
 411bf34: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 411bf38: 340000c8     	cbz	w8, 0x411bf50 <_ChromeMain+0x4116cb4>
 411bf3c: 3906a6df     	strb	wzr, [x22, #0x1a9]
 411bf40: 9103e2c0     	add	x0, x22, #0xf8
 411bf44: 9106a6c1     	add	x1, x22, #0x1a9
 411bf48: 97383022     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411bf4c: f9400356     	ldr	x22, [x26]
 411bf50: f9425e60     	ldr	x0, [x19, #0x4b8]
 411bf54: b4008ce0     	cbz	x0, 0x411d0f0 <_ChromeMain+0x4117e54>
 411bf58: f9400008     	ldr	x8, [x0]
 411bf5c: f9405908     	ldr	x8, [x8, #0xb0]
 411bf60: d63f0100     	blr	x8
 411bf64: 370001e0     	tbnz	w0, #0x0, 0x411bfa0 <_ChromeMain+0x4116d04>
 411bf68: b944c268     	ldr	w8, [x19, #0x4c0]
 411bf6c: 7100051f     	cmp	w8, #0x1
 411bf70: 54000140     	b.eq	0x411bf98 <_ChromeMain+0x4116cfc>
 411bf74: 3950f268     	ldrb	w8, [x19, #0x43c]
 411bf78: 34000148     	cbz	w8, 0x411bfa0 <_ChromeMain+0x4116d04>
 411bf7c: f9425e60     	ldr	x0, [x19, #0x4b8]
 411bf80: b4009dc0     	cbz	x0, 0x411d338 <_ChromeMain+0x411809c>
 411bf84: f9400008     	ldr	x8, [x0]
 411bf88: f9401908     	ldr	x8, [x8, #0x30]
 411bf8c: d63f0100     	blr	x8
 411bf90: 52000001     	eor	w1, w0, #0x1
 411bf94: 14000004     	b	0x411bfa4 <_ChromeMain+0x4116d08>
 411bf98: 52800021     	mov	w1, #0x1                ; =1
 411bf9c: 14000002     	b	0x411bfa4 <_ChromeMain+0x4116d08>
 411bfa0: 52800001     	mov	w1, #0x0                ; =0
 411bfa4: f94002c8     	ldr	x8, [x22]
 411bfa8: f9405108     	ldr	x8, [x8, #0xa0]
 411bfac: aa1603e0     	mov	x0, x22
 411bfb0: d63f0100     	blr	x8
 411bfb4: 52800028     	mov	w8, #0x1                ; =1
 411bfb8: 39072e68     	strb	w8, [x19, #0x1cb]
 411bfbc: b944c268     	ldr	w8, [x19, #0x4c0]
 411bfc0: 350001c8     	cbnz	w8, 0x411bff8 <_ChromeMain+0x4116d5c>
 411bfc4: aa1303e0     	mov	x0, x19
 411bfc8: 52800021     	mov	w1, #0x1                ; =1
 411bfcc: 976be630     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 411bfd0: f9401268     	ldr	x8, [x19, #0x20]
 411bfd4: b9400909     	ldr	w9, [x8, #0x8]
 411bfd8: 7100093f     	cmp	w9, #0x2
 411bfdc: 54009380     	b.eq	0x411d24c <_ChromeMain+0x4117fb0>
 411bfe0: 39422909     	ldrb	w9, [x8, #0x8a]
 411bfe4: 340000a9     	cbz	w9, 0x411bff8 <_ChromeMain+0x4116d5c>
 411bfe8: 3902291f     	strb	wzr, [x8, #0x8a]
 411bfec: f940b500     	ldr	x0, [x8, #0x168]
 411bff0: 52800001     	mov	w1, #0x0                ; =0
 411bff4: 9732c6d3     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 411bff8: f9425a76     	ldr	x22, [x19, #0x4b0]
 411bffc: f0fe0eb8     	adrp	x24, 0x2f2000 <_ChromeMain+0x2ecd64>
 411c000: 91220318     	add	x24, x24, #0x880
 411c004: d0ffd054     	adrp	x20, 0x3b26000 <_ChromeMain+0x3b20d64>
 411c008: 91310294     	add	x20, x20, #0xc40
 411c00c: b40013d6     	cbz	x22, 0x411c284 <_ChromeMain+0x4116fe8>
 411c010: b945f6c8     	ldr	w8, [x22, #0x5f4]
 411c014: 7100051f     	cmp	w8, #0x1
 411c018: 540079c1     	b.ne	0x411cf50 <_ChromeMain+0x4117cb4>
 411c01c: 52800035     	mov	w21, #0x1               ; =1
 411c020: aa1603e0     	mov	x0, x22
 411c024: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 411c028: 52800022     	mov	w2, #0x1                ; =1
 411c02c: 979ad68d     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 411c030: f9425a76     	ldr	x22, [x19, #0x4b0]
 411c034: 52800400     	mov	w0, #0x20               ; =32
 411c038: 96fbcccc     	bl	0xf368 <_ChromeMain+0xa0cc>
 411c03c: aa0003e1     	mov	x1, x0
 411c040: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 411c044: b9000808     	str	w8, [x0, #0x8]
 411c048: 90051188     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 411c04c: 91044108     	add	x8, x8, #0x110
 411c050: 39003015     	strb	w21, [x0, #0xc]
 411c054: f9000008     	str	x8, [x0]
 411c058: a9017c1f     	stp	xzr, xzr, [x0, #0x10]
 411c05c: f94002c8     	ldr	x8, [x22]
 411c060: f9408908     	ldr	x8, [x8, #0x110]
 411c064: aa1603e0     	mov	x0, x22
 411c068: d63f0100     	blr	x8
 411c06c: f9425a68     	ldr	x8, [x19, #0x4b0]
 411c070: 3951a509     	ldrb	w9, [x8, #0x469]
 411c074: 370000c9     	tbnz	w9, #0x0, 0x411c08c <_ChromeMain+0x4116df0>
 411c078: 3911a515     	strb	w21, [x8, #0x469]
 411c07c: 9103e100     	add	x0, x8, #0xf8
 411c080: 9111a501     	add	x1, x8, #0x469
 411c084: 97382fd3     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411c088: f9425a68     	ldr	x8, [x19, #0x4b0]
 411c08c: f902251f     	str	xzr, [x8, #0x448]
 411c090: f9425a69     	ldr	x9, [x19, #0x4b0]
 411c094: f84e8d28     	ldr	x8, [x9, #0xe8]!
 411c098: b4000128     	cbz	x8, 0x411c0bc <_ChromeMain+0x4116e20>
 411c09c: 9005474a     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 411c0a0: 9123414a     	add	x10, x10, #0x8d0
 411c0a4: f940110b     	ldr	x11, [x8, #0x20]
 411c0a8: eb0a017f     	cmp	x11, x10
 411c0ac: 54006be8     	b.hi	0x411ce28 <_ChromeMain+0x4117b8c>
 411c0b0: 540069a2     	b.hs	0x411cde4 <_ChromeMain+0x4117b48>
 411c0b4: f9400508     	ldr	x8, [x8, #0x8]
 411c0b8: b5ffff68     	cbnz	x8, 0x411c0a4 <_ChromeMain+0x4116e08>
 411c0bc: d2800016     	mov	x22, #0x0               ; =0
 411c0c0: 52800028     	mov	w8, #0x1                ; =1
 411c0c4: b90012c8     	str	w8, [x22, #0x10]
 411c0c8: f9401ec0     	ldr	x0, [x22, #0x38]
 411c0cc: f9001edf     	str	xzr, [x22, #0x38]
 411c0d0: b50076a0     	cbnz	x0, 0x411cfa4 <_ChromeMain+0x4117d08>
 411c0d4: 9103a2d5     	add	x21, x22, #0xe8
 411c0d8: 3943c2c8     	ldrb	w8, [x22, #0xf0]
 411c0dc: 35008828     	cbnz	w8, 0x411d1e0 <_ChromeMain+0x4117f44>
 411c0e0: 52801c88     	mov	w8, #0xe4               ; =228
 411c0e4: f90002a8     	str	x8, [x21]
 411c0e8: 3943f2c8     	ldrb	w8, [x22, #0xfc]
 411c0ec: 350090e8     	cbnz	w8, 0x411d308 <_ChromeMain+0x411806c>
 411c0f0: 529ae148     	mov	w8, #0xd70a             ; =55050
 411c0f4: 72a7c468     	movk	w8, #0x3e23, lsl #16
 411c0f8: b900fac8     	str	w8, [x22, #0xf8]
 411c0fc: 52800028     	mov	w8, #0x1                ; =1
 411c100: 3903f2c8     	strb	w8, [x22, #0xfc]
 411c104: bd40dac0     	ldr	s0, [x22, #0xd8]
 411c108: 9004f1a8     	adrp	x8, 0xdf50000 <dyld_stub_binder+0xdf50000>
 411c10c: bd4b6d01     	ldr	s1, [x8, #0xb6c]
 411c110: 1e212000     	fcmp	s0, s1
 411c114: 54000080     	b.eq	0x411c124 <_ChromeMain+0x4116e88>
 411c118: 528b8528     	mov	w8, #0x5c29             ; =23593
 411c11c: 72a7c1e8     	movk	w8, #0x3e0f, lsl #16
 411c120: b900dac8     	str	w8, [x22, #0xd8]
 411c124: aa1603e0     	mov	x0, x22
 411c128: 9738f20e     	bl	0xf58960 <_ChromeMain+0xf536c4>
 411c12c: f9400008     	ldr	x8, [x0]
 411c130: f9401d08     	ldr	x8, [x8, #0x38]
 411c134: d2800001     	mov	x1, #0x0                ; =0
 411c138: d63f0100     	blr	x8
 411c13c: f9425a75     	ldr	x21, [x19, #0x4b0]
 411c140: 52800400     	mov	w0, #0x20               ; =32
 411c144: 96fbcc89     	bl	0xf368 <_ChromeMain+0xa0cc>
 411c148: aa0003e4     	mov	x4, x0
 411c14c: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 411c150: 7900301f     	strh	wzr, [x0, #0x18]
 411c154: d0051188     	adrp	x8, 0xe34e000 <dyld_stub_binder+0xe34e000>
 411c158: 9134a108     	add	x8, x8, #0xd28
 411c15c: f9000008     	str	x8, [x0]
 411c160: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c164: 9114a021     	add	x1, x1, #0x528
 411c168: b004e142     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 411c16c: 91264842     	add	x2, x2, #0x992
 411c170: 90ff6a83     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 411c174: 913c0063     	add	x3, x3, #0xf00
 411c178: 910362a0     	add	x0, x21, #0xd8
 411c17c: d2800005     	mov	x5, #0x0                ; =0
 411c180: 97293807     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 411c184: b5007080     	cbnz	x0, 0x411cf94 <_ChromeMain+0x4117cf8>
 411c188: f9425a76     	ldr	x22, [x19, #0x4b0]
 411c18c: f94166d7     	ldr	x23, [x22, #0x2c8]
 411c190: b4007237     	cbz	x23, 0x411cfd4 <_ChromeMain+0x4117d38>
 411c194: f946f760     	ldr	x0, [x27, #0xde8]
 411c198: b4008600     	cbz	x0, 0x411d258 <_ChromeMain+0x4117fbc>
 411c19c: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 411c1a0: f81a03bf     	stur	xzr, [x29, #-0x60]
 411c1a4: d101c3a8     	sub	x8, x29, #0x70
 411c1a8: 52802821     	mov	w1, #0x141              ; =321
 411c1ac: 9746614c     	bl	0x12b46dc <_ChromeMain+0x12af440>
 411c1b0: d101c3a1     	sub	x1, x29, #0x70
 411c1b4: aa1703e0     	mov	x0, x23
 411c1b8: 974145c8     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 411c1bc: 38da73a8     	ldursb	w8, [x29, #-0x59]
 411c1c0: 36f800a8     	tbz	w8, #0x1f, 0x411c1d4 <_ChromeMain+0x4116f38>
 411c1c4: f85903a0     	ldur	x0, [x29, #-0x70]
 411c1c8: f85a03a8     	ldur	x8, [x29, #-0x60]
 411c1cc: d37ff901     	lsl	x1, x8, #1
 411c1d0: 96fbb33a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411c1d4: f9425a60     	ldr	x0, [x19, #0x4b0]
 411c1d8: 52800001     	mov	w1, #0x0                ; =0
 411c1dc: 97506d80     	bl	0x15377dc <_ChromeMain+0x1532540>
 411c1e0: f9425a60     	ldr	x0, [x19, #0x4b0]
 411c1e4: f9400008     	ldr	x8, [x0]
 411c1e8: f9405108     	ldr	x8, [x8, #0xa0]
 411c1ec: 52800001     	mov	w1, #0x0                ; =0
 411c1f0: d63f0100     	blr	x8
 411c1f4: f9425a75     	ldr	x21, [x19, #0x4b0]
 411c1f8: 52800800     	mov	w0, #0x40               ; =64
 411c1fc: 96fbcc5b     	bl	0xf368 <_ChromeMain+0xa0cc>
 411c200: 52800028     	mov	w8, #0x1                ; =1
 411c204: b9000008     	str	w8, [x0]
 411c208: f0fe7848     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 411c20c: 91260108     	add	x8, x8, #0x980
 411c210: a900e008     	stp	x8, x24, [x0, #0x8]
 411c214: a901d019     	stp	x25, x20, [x0, #0x18]
 411c218: 9004f128     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 411c21c: 3dc01900     	ldr	q0, [x8, #0x60]
 411c220: 3c828000     	stur	q0, [x0, #0x28]
 411c224: 3900e01f     	strb	wzr, [x0, #0x38]
 411c228: f9002be0     	str	x0, [sp, #0x50]
 411c22c: 0f000420     	movi.2s	v0, #0x1
 411c230: fd002fe0     	str	d0, [sp, #0x58]
 411c234: 52800068     	mov	w8, #0x3                ; =3
 411c238: b90063e8     	str	w8, [sp, #0x60]
 411c23c: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 411c240: f90037ff     	str	xzr, [sp, #0x68]
 411c244: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c248: 91152021     	add	x1, x1, #0x548
 411c24c: 910362a0     	add	x0, x21, #0xd8
 411c250: 910143e2     	add	x2, sp, #0x50
 411c254: 976be04e     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 411c258: 910143e0     	add	x0, sp, #0x50
 411c25c: 9758bab2     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 411c260: f9425a68     	ldr	x8, [x19, #0x4b0]
 411c264: 9004f129     	adrp	x9, 0xdf40000 <dyld_stub_binder+0xdf40000>
 411c268: 3dc01d20     	ldr	q0, [x9, #0x70]
 411c26c: 3d8017e0     	str	q0, [sp, #0x50]
 411c270: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c274: 91122021     	add	x1, x1, #0x488
 411c278: 91036100     	add	x0, x8, #0xd8
 411c27c: 910143e2     	add	x2, sp, #0x50
 411c280: 976746f8     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 411c284: f9404788     	ldr	x8, [x28, #0x88]
 411c288: 925e7675     	and	x21, x19, #0xfffffffc00000000
 411c28c: eb0802bf     	cmp	x21, x8
 411c290: 54000061     	b.ne	0x411c29c <_ChromeMain+0x4117000>
 411c294: aa1303e0     	mov	x0, x19
 411c298: 96fbe019     	bl	0x142fc <_ChromeMain+0xf060>
 411c29c: 52800700     	mov	w0, #0x38               ; =56
 411c2a0: 96fbcc32     	bl	0xf368 <_ChromeMain+0xa0cc>
 411c2a4: aa0003e1     	mov	x1, x0
 411c2a8: 52800028     	mov	w8, #0x1                ; =1
 411c2ac: b9000008     	str	w8, [x0]
 411c2b0: 90fff288     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 411c2b4: 91270109     	add	x9, x8, #0x9c0
 411c2b8: 90fecd48     	adrp	x8, 0x1ac4000 <_ChromeMain+0x1abed64>
 411c2bc: 91180108     	add	x8, x8, #0x600
 411c2c0: a900a009     	stp	x9, x8, [x0, #0x8]
 411c2c4: d001bc48     	adrp	x8, 0x78a6000 <_ChromeMain+0x78a0d64>
 411c2c8: 91074108     	add	x8, x8, #0x1d0
 411c2cc: a901a019     	stp	x25, x8, [x0, #0x18]
 411c2d0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 411c2d4: 910143e8     	add	x8, sp, #0x50
 411c2d8: 91138260     	add	x0, x19, #0x4e0
 411c2dc: 976bbf05     	bl	0x1c0bef0 <_ChromeMain+0x1c06c54>
 411c2e0: 9115c260     	add	x0, x19, #0x570
 411c2e4: 910143e1     	add	x1, sp, #0x50
 411c2e8: 971ca9fa     	bl	0x846ad0 <_ChromeMain+0x841834>
 411c2ec: f9402bf6     	ldr	x22, [sp, #0x50]
 411c2f0: f94003f7     	ldr	x23, [sp]
 411c2f4: b5005df6     	cbnz	x22, 0x411ceb0 <_ChromeMain+0x4117c14>
 411c2f8: f9404788     	ldr	x8, [x28, #0x88]
 411c2fc: eb0802bf     	cmp	x21, x8
 411c300: 54000061     	b.ne	0x411c30c <_ChromeMain+0x4117070>
 411c304: aa1303e0     	mov	x0, x19
 411c308: 96fbdffd     	bl	0x142fc <_ChromeMain+0xf060>
 411c30c: 52800700     	mov	w0, #0x38               ; =56
 411c310: 96fbcc16     	bl	0xf368 <_ChromeMain+0xa0cc>
 411c314: aa0003e1     	mov	x1, x0
 411c318: 52800028     	mov	w8, #0x1                ; =1
 411c31c: b9000008     	str	w8, [x0]
 411c320: 90fff288     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 411c324: 91270109     	add	x9, x8, #0x9c0
 411c328: 90fecd48     	adrp	x8, 0x1ac4000 <_ChromeMain+0x1abed64>
 411c32c: 91180108     	add	x8, x8, #0x600
 411c330: a900a009     	stp	x9, x8, [x0, #0x8]
 411c334: d001bc48     	adrp	x8, 0x78a6000 <_ChromeMain+0x78a0d64>
 411c338: 9108e108     	add	x8, x8, #0x238
 411c33c: a901a019     	stp	x25, x8, [x0, #0x18]
 411c340: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 411c344: 910143e8     	add	x8, sp, #0x50
 411c348: 91146260     	add	x0, x19, #0x518
 411c34c: 976bbee9     	bl	0x1c0bef0 <_ChromeMain+0x1c06c54>
 411c350: 9115e260     	add	x0, x19, #0x578
 411c354: 910143e1     	add	x1, sp, #0x50
 411c358: 971ca9de     	bl	0x846ad0 <_ChromeMain+0x841834>
 411c35c: f9402bf6     	ldr	x22, [sp, #0x50]
 411c360: b5005d16     	cbnz	x22, 0x411cf00 <_ChromeMain+0x4117c64>
 411c364: b9432268     	ldr	w8, [x19, #0x320]
 411c368: 7100051f     	cmp	w8, #0x1
 411c36c: 54000200     	b.eq	0x411c3ac <_ChromeMain+0x4117110>
 411c370: f9418a68     	ldr	x8, [x19, #0x310]
 411c374: 52800035     	mov	w21, #0x1               ; =1
 411c378: b90053f5     	str	w21, [sp, #0x50]
 411c37c: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c380: 9115a021     	add	x1, x1, #0x568
 411c384: 91046100     	add	x0, x8, #0x118
 411c388: 910143e2     	add	x2, sp, #0x50
 411c38c: 97652386     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 411c390: b9032275     	str	w21, [x19, #0x320]
 411c394: aa1303e0     	mov	x0, x19
 411c398: 52800021     	mov	w1, #0x1                ; =1
 411c39c: 971b1572     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 411c3a0: 910c8261     	add	x1, x19, #0x320
 411c3a4: aa1703e0     	mov	x0, x23
 411c3a8: 97382f0a     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411c3ac: b944c268     	ldr	w8, [x19, #0x4c0]
 411c3b0: 7100011f     	cmp	w8, #0x0
 411c3b4: 1a9f17e8     	cset	w8, eq
 411c3b8: 0e040d00     	dup.2s	v0, w8
 411c3bc: 2f20a400     	ushll.2d	v0, v0, #0x0
 411c3c0: 4f7f5400     	shl.2d	v0, v0, #0x3f
 411c3c4: 4ee0a800     	cmlt.2d	v0, v0, #0
 411c3c8: d28000c8     	mov	x8, #0x6                ; =6
 411c3cc: f2c00108     	movk	x8, #0x8, lsl #32
 411c3d0: 4e080d01     	dup.2d	v1, x8
 411c3d4: 9004f128     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 411c3d8: 3dc02102     	ldr	q2, [x8, #0x80]
 411c3dc: 6e611c40     	bsl.16b	v0, v2, v1
 411c3e0: 3d8017e0     	str	q0, [sp, #0x50]
 411c3e4: 910143e1     	add	x1, sp, #0x50
 411c3e8: aa1303e0     	mov	x0, x19
 411c3ec: 9596dcee     	bl	0xa6d37a4 <_ChromeMain+0xa6ce508>
 411c3f0: 52800800     	mov	w0, #0x40               ; =64
 411c3f4: 96fbcbdd     	bl	0xf368 <_ChromeMain+0xa0cc>
 411c3f8: 52800035     	mov	w21, #0x1               ; =1
 411c3fc: b9000015     	str	w21, [x0]
 411c400: f0fe7857     	adrp	x23, 0x1027000 <_ChromeMain+0x1021d64>
 411c404: 912602f7     	add	x23, x23, #0x980
 411c408: a900e017     	stp	x23, x24, [x0, #0x8]
 411c40c: a901d019     	stp	x25, x20, [x0, #0x18]
 411c410: f004f0e8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 411c414: 3dc06900     	ldr	q0, [x8, #0x1a0]
 411c418: 3c828000     	stur	q0, [x0, #0x28]
 411c41c: 3900e01f     	strb	wzr, [x0, #0x38]
 411c420: f9002be0     	str	x0, [sp, #0x50]
 411c424: 0f000420     	movi.2s	v0, #0x1
 411c428: fd002fe0     	str	d0, [sp, #0x58]
 411c42c: 52800068     	mov	w8, #0x3                ; =3
 411c430: b90063e8     	str	w8, [sp, #0x60]
 411c434: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 411c438: f90037ff     	str	xzr, [sp, #0x68]
 411c43c: f9418a68     	ldr	x8, [x19, #0x310]
 411c440: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c444: 91152021     	add	x1, x1, #0x548
 411c448: 910143fb     	add	x27, sp, #0x50
 411c44c: 91046100     	add	x0, x8, #0x118
 411c450: 910143e2     	add	x2, sp, #0x50
 411c454: 976bdfce     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 411c458: aa1303e0     	mov	x0, x19
 411c45c: 52800001     	mov	w1, #0x0                ; =0
 411c460: 97145005     	bl	0x630474 <_ChromeMain+0x62b1d8>
 411c464: 910143e0     	add	x0, sp, #0x50
 411c468: 9758ba2f     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 411c46c: f9423e7c     	ldr	x28, [x19, #0x478]
 411c470: 910083e0     	add	x0, sp, #0x20
 411c474: 52800001     	mov	w1, #0x0                ; =0
 411c478: 52800022     	mov	w2, #0x1                ; =1
 411c47c: 52800003     	mov	w3, #0x0                ; =0
 411c480: 52800004     	mov	w4, #0x0                ; =0
 411c484: 52800005     	mov	w5, #0x0                ; =0
 411c488: 97e82b4e     	bl	0x3b271c0 <_ChromeMain+0x3b21f24>
 411c48c: f94013e8     	ldr	x8, [sp, #0x20]
 411c490: f90033ff     	str	xzr, [sp, #0x60]
 411c494: f9002be8     	str	x8, [sp, #0x50]
 411c498: b5004b68     	cbnz	x8, 0x411ce04 <_ChromeMain+0x4117b68>
 411c49c: f94017e8     	ldr	x8, [sp, #0x28]
 411c4a0: f8008368     	stur	x8, [x27, #0x8]
 411c4a4: b94033e8     	ldr	w8, [sp, #0x30]
 411c4a8: b8010368     	stur	w8, [x27, #0x10]
 411c4ac: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 411c4b0: f90037ff     	str	xzr, [sp, #0x68]
 411c4b4: f94023f5     	ldr	x21, [sp, #0x40]
 411c4b8: b5006d75     	cbnz	x21, 0x411d264 <_ChromeMain+0x4117fc8>
 411c4bc: 52800048     	mov	w8, #0x2                ; =2
 411c4c0: b9005be8     	str	w8, [sp, #0x58]
 411c4c4: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c4c8: 91152021     	add	x1, x1, #0x548
 411c4cc: 910143f5     	add	x21, sp, #0x50
 411c4d0: 91036380     	add	x0, x28, #0xd8
 411c4d4: 910143e2     	add	x2, sp, #0x50
 411c4d8: 976bdfad     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 411c4dc: 910143e0     	add	x0, sp, #0x50
 411c4e0: 9758ba11     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 411c4e4: 910083e0     	add	x0, sp, #0x20
 411c4e8: 9758ba0f     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 411c4ec: b944c268     	ldr	w8, [x19, #0x4c0]
 411c4f0: 7100051f     	cmp	w8, #0x1
 411c4f4: 54000081     	b.ne	0x411c504 <_ChromeMain+0x4117268>
 411c4f8: f9423e60     	ldr	x0, [x19, #0x478]
 411c4fc: 52800081     	mov	w1, #0x4                ; =4
 411c500: 97121210     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 411c504: f942427b     	ldr	x27, [x19, #0x480]
 411c508: 910083e0     	add	x0, sp, #0x20
 411c50c: 52800001     	mov	w1, #0x0                ; =0
 411c510: 52800062     	mov	w2, #0x3                ; =3
 411c514: 52800003     	mov	w3, #0x0                ; =0
 411c518: 52800004     	mov	w4, #0x0                ; =0
 411c51c: 52800005     	mov	w5, #0x0                ; =0
 411c520: 97e82b28     	bl	0x3b271c0 <_ChromeMain+0x3b21f24>
 411c524: f94013e8     	ldr	x8, [sp, #0x20]
 411c528: f90033ff     	str	xzr, [sp, #0x60]
 411c52c: f9002be8     	str	x8, [sp, #0x50]
 411c530: b5004828     	cbnz	x8, 0x411ce34 <_ChromeMain+0x4117b98>
 411c534: f94017e8     	ldr	x8, [sp, #0x28]
 411c538: f80082a8     	stur	x8, [x21, #0x8]
 411c53c: b94033e8     	ldr	w8, [sp, #0x30]
 411c540: b80102a8     	stur	w8, [x21, #0x10]
 411c544: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 411c548: f90037ff     	str	xzr, [sp, #0x68]
 411c54c: f94023f5     	ldr	x21, [sp, #0x40]
 411c550: b5006b35     	cbnz	x21, 0x411d2b4 <_ChromeMain+0x4118018>
 411c554: 52800048     	mov	w8, #0x2                ; =2
 411c558: b9005be8     	str	w8, [sp, #0x58]
 411c55c: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c560: 91152021     	add	x1, x1, #0x548
 411c564: 91036360     	add	x0, x27, #0xd8
 411c568: 910143e2     	add	x2, sp, #0x50
 411c56c: 976bdf88     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 411c570: 910143e0     	add	x0, sp, #0x50
 411c574: 9758b9ec     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 411c578: 910083e0     	add	x0, sp, #0x20
 411c57c: 9758b9ea     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 411c580: f9400355     	ldr	x21, [x26]
 411c584: b94326a8     	ldr	w8, [x21, #0x324]
 411c588: 35005408     	cbnz	w8, 0x411d008 <_ChromeMain+0x4117d6c>
 411c58c: b21c03f6     	mov	x22, #0x1000000010      ; =68719476752
 411c590: aa1503e0     	mov	x0, x21
 411c594: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 411c598: 52800022     	mov	w2, #0x1                ; =1
 411c59c: 979ad531     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 411c5a0: f9400355     	ldr	x21, [x26]
 411c5a4: 910c42a8     	add	x8, x21, #0x310
 411c5a8: 394c62a9     	ldrb	w9, [x21, #0x318]
 411c5ac: 35005a89     	cbnz	w9, 0x411d0fc <_ChromeMain+0x4117e60>
 411c5b0: b40062e8     	cbz	x8, 0x411d20c <_ChromeMain+0x4117f70>
 411c5b4: aa1803fa     	mov	x26, x24
 411c5b8: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 411c5bc: f9018aa8     	str	x8, [x21, #0x310]
 411c5c0: 52800028     	mov	w8, #0x1                ; =1
 411c5c4: 390c62a8     	strb	w8, [x21, #0x318]
 411c5c8: f940c6a0     	ldr	x0, [x21, #0x188]
 411c5cc: b40000a0     	cbz	x0, 0x411c5e0 <_ChromeMain+0x4117344>
 411c5d0: f9400008     	ldr	x8, [x0]
 411c5d4: f9417d08     	ldr	x8, [x8, #0x2f8]
 411c5d8: aa1503e1     	mov	x1, x21
 411c5dc: d63f0100     	blr	x8
 411c5e0: aa1503e0     	mov	x0, x21
 411c5e4: 52800001     	mov	w1, #0x0                ; =0
 411c5e8: 97144fa3     	bl	0x630474 <_ChromeMain+0x62b1d8>
 411c5ec: f9002bf5     	str	x21, [sp, #0x50]
 411c5f0: 52800036     	mov	w22, #0x1               ; =1
 411c5f4: 9104c2a0     	add	x0, x21, #0x130
 411c5f8: 910143e3     	add	x3, sp, #0x50
 411c5fc: 52800301     	mov	w1, #0x18               ; =24
 411c600: 52800022     	mov	w2, #0x1                ; =1
 411c604: 971e2af3     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 411c608: aa1503e0     	mov	x0, x21
 411c60c: 9744e937     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 411c610: f9425275     	ldr	x21, [x19, #0x4a0]
 411c614: 52800800     	mov	w0, #0x40               ; =64
 411c618: 96fbcb54     	bl	0xf368 <_ChromeMain+0xa0cc>
 411c61c: b9000016     	str	w22, [x0]
 411c620: a900e817     	stp	x23, x26, [x0, #0x8]
 411c624: a901d019     	stp	x25, x20, [x0, #0x18]
 411c628: 9004f128     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 411c62c: 3dc01900     	ldr	q0, [x8, #0x60]
 411c630: 3d8003e0     	str	q0, [sp]
 411c634: 3c828000     	stur	q0, [x0, #0x28]
 411c638: 3900e01f     	strb	wzr, [x0, #0x38]
 411c63c: f9002be0     	str	x0, [sp, #0x50]
 411c640: 0f000420     	movi.2s	v0, #0x1
 411c644: fd002fe0     	str	d0, [sp, #0x58]
 411c648: 52800068     	mov	w8, #0x3                ; =3
 411c64c: b90063e8     	str	w8, [sp, #0x60]
 411c650: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 411c654: f90037ff     	str	xzr, [sp, #0x68]
 411c658: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c65c: 91152021     	add	x1, x1, #0x548
 411c660: 910362a0     	add	x0, x21, #0xd8
 411c664: 910143e2     	add	x2, sp, #0x50
 411c668: 976bdf49     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 411c66c: 910143e0     	add	x0, sp, #0x50
 411c670: 9758b9ad     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 411c674: f9425268     	ldr	x8, [x19, #0x4a0]
 411c678: b944c269     	ldr	w9, [x19, #0x4c0]
 411c67c: 7100013f     	cmp	w9, #0x0
 411c680: d2c00109     	mov	x9, #0x800000000        ; =34359738368
 411c684: d2c0008a     	mov	x10, #0x400000000       ; =17179869184
 411c688: 9a890149     	csel	x9, x10, x9, eq
 411c68c: a9057fe9     	stp	x9, xzr, [sp, #0x50]
 411c690: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c694: 91122021     	add	x1, x1, #0x488
 411c698: 91036100     	add	x0, x8, #0xd8
 411c69c: 910143e2     	add	x2, sp, #0x50
 411c6a0: 976745f0     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 411c6a4: b944c268     	ldr	w8, [x19, #0x4c0]
 411c6a8: 7100051f     	cmp	w8, #0x1
 411c6ac: 54000701     	b.ne	0x411c78c <_ChromeMain+0x41174f0>
 411c6b0: f9423660     	ldr	x0, [x19, #0x468]
 411c6b4: b21c03f6     	mov	x22, #0x1000000010      ; =68719476752
 411c6b8: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 411c6bc: 52800022     	mov	w2, #0x1                ; =1
 411c6c0: 979ad4e8     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 411c6c4: f9423675     	ldr	x21, [x19, #0x468]
 411c6c8: 910c42a8     	add	x8, x21, #0x310
 411c6cc: 394c62a9     	ldrb	w9, [x21, #0x318]
 411c6d0: 35005769     	cbnz	w9, 0x411d1bc <_ChromeMain+0x4117f20>
 411c6d4: b40059c8     	cbz	x8, 0x411d20c <_ChromeMain+0x4117f70>
 411c6d8: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 411c6dc: f9018aa8     	str	x8, [x21, #0x310]
 411c6e0: 52800028     	mov	w8, #0x1                ; =1
 411c6e4: 390c62a8     	strb	w8, [x21, #0x318]
 411c6e8: f940c6a0     	ldr	x0, [x21, #0x188]
 411c6ec: b40000a0     	cbz	x0, 0x411c700 <_ChromeMain+0x4117464>
 411c6f0: f9400008     	ldr	x8, [x0]
 411c6f4: f9417d08     	ldr	x8, [x8, #0x2f8]
 411c6f8: aa1503e1     	mov	x1, x21
 411c6fc: d63f0100     	blr	x8
 411c700: aa1503e0     	mov	x0, x21
 411c704: 52800001     	mov	w1, #0x0                ; =0
 411c708: 97144f5b     	bl	0x630474 <_ChromeMain+0x62b1d8>
 411c70c: f9002bf5     	str	x21, [sp, #0x50]
 411c710: 52800036     	mov	w22, #0x1               ; =1
 411c714: 9104c2a0     	add	x0, x21, #0x130
 411c718: 910143e3     	add	x3, sp, #0x50
 411c71c: 52800301     	mov	w1, #0x18               ; =24
 411c720: 52800022     	mov	w2, #0x1                ; =1
 411c724: 971e2aab     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 411c728: aa1503e0     	mov	x0, x21
 411c72c: 9744e8ef     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 411c730: f9423675     	ldr	x21, [x19, #0x468]
 411c734: 52800800     	mov	w0, #0x40               ; =64
 411c738: 96fbcb0c     	bl	0xf368 <_ChromeMain+0xa0cc>
 411c73c: b9000016     	str	w22, [x0]
 411c740: a900e817     	stp	x23, x26, [x0, #0x8]
 411c744: a901d019     	stp	x25, x20, [x0, #0x18]
 411c748: 3dc003e0     	ldr	q0, [sp]
 411c74c: 3c828000     	stur	q0, [x0, #0x28]
 411c750: 3900e01f     	strb	wzr, [x0, #0x38]
 411c754: f9002be0     	str	x0, [sp, #0x50]
 411c758: 0f000420     	movi.2s	v0, #0x1
 411c75c: fd002fe0     	str	d0, [sp, #0x58]
 411c760: 52800068     	mov	w8, #0x3                ; =3
 411c764: b90063e8     	str	w8, [sp, #0x60]
 411c768: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 411c76c: f90037ff     	str	xzr, [sp, #0x68]
 411c770: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c774: 91152021     	add	x1, x1, #0x548
 411c778: 910362a0     	add	x0, x21, #0xd8
 411c77c: 910143e2     	add	x2, sp, #0x50
 411c780: 976bdf03     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 411c784: 910143e0     	add	x0, sp, #0x50
 411c788: 9758b967     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 411c78c: f9423a75     	ldr	x21, [x19, #0x470]
 411c790: 910c42a8     	add	x8, x21, #0x310
 411c794: 394c62a9     	ldrb	w9, [x21, #0x318]
 411c798: 35004b89     	cbnz	w9, 0x411d108 <_ChromeMain+0x4117e6c>
 411c79c: b4005388     	cbz	x8, 0x411d20c <_ChromeMain+0x4117f70>
 411c7a0: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 411c7a4: f9018aa8     	str	x8, [x21, #0x310]
 411c7a8: 52800028     	mov	w8, #0x1                ; =1
 411c7ac: 390c62a8     	strb	w8, [x21, #0x318]
 411c7b0: f940c6a0     	ldr	x0, [x21, #0x188]
 411c7b4: b40000a0     	cbz	x0, 0x411c7c8 <_ChromeMain+0x411752c>
 411c7b8: f9400008     	ldr	x8, [x0]
 411c7bc: f9417d08     	ldr	x8, [x8, #0x2f8]
 411c7c0: aa1503e1     	mov	x1, x21
 411c7c4: d63f0100     	blr	x8
 411c7c8: aa1503e0     	mov	x0, x21
 411c7cc: 52800001     	mov	w1, #0x0                ; =0
 411c7d0: 97144f29     	bl	0x630474 <_ChromeMain+0x62b1d8>
 411c7d4: f9002bf5     	str	x21, [sp, #0x50]
 411c7d8: 52800036     	mov	w22, #0x1               ; =1
 411c7dc: 9104c2a0     	add	x0, x21, #0x130
 411c7e0: 910143e3     	add	x3, sp, #0x50
 411c7e4: 52800301     	mov	w1, #0x18               ; =24
 411c7e8: 52800022     	mov	w2, #0x1                ; =1
 411c7ec: 971e2a79     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 411c7f0: aa1503e0     	mov	x0, x21
 411c7f4: 9744e8bd     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 411c7f8: f9423a60     	ldr	x0, [x19, #0x470]
 411c7fc: f9400008     	ldr	x8, [x0]
 411c800: f9405108     	ldr	x8, [x8, #0xa0]
 411c804: 52800001     	mov	w1, #0x0                ; =0
 411c808: d63f0100     	blr	x8
 411c80c: f9424a60     	ldr	x0, [x19, #0x490]
 411c810: f9400008     	ldr	x8, [x0]
 411c814: f9405108     	ldr	x8, [x8, #0xa0]
 411c818: 52800001     	mov	w1, #0x0                ; =0
 411c81c: d63f0100     	blr	x8
 411c820: f9424a75     	ldr	x21, [x19, #0x490]
 411c824: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 411c828: 340000c8     	cbz	w8, 0x411c840 <_ChromeMain+0x41175a4>
 411c82c: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 411c830: 9103e2a0     	add	x0, x21, #0xf8
 411c834: 9106a6a1     	add	x1, x21, #0x1a9
 411c838: 97382de6     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411c83c: f9424a75     	ldr	x21, [x19, #0x490]
 411c840: 52800800     	mov	w0, #0x40               ; =64
 411c844: 96fbcac9     	bl	0xf368 <_ChromeMain+0xa0cc>
 411c848: b9000016     	str	w22, [x0]
 411c84c: a900e817     	stp	x23, x26, [x0, #0x8]
 411c850: a901d019     	stp	x25, x20, [x0, #0x18]
 411c854: 3dc003e0     	ldr	q0, [sp]
 411c858: 3c828000     	stur	q0, [x0, #0x28]
 411c85c: 3900e01f     	strb	wzr, [x0, #0x38]
 411c860: f9002be0     	str	x0, [sp, #0x50]
 411c864: 0f000420     	movi.2s	v0, #0x1
 411c868: fd002fe0     	str	d0, [sp, #0x58]
 411c86c: 52800068     	mov	w8, #0x3                ; =3
 411c870: b90063e8     	str	w8, [sp, #0x60]
 411c874: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 411c878: f90037ff     	str	xzr, [sp, #0x68]
 411c87c: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c880: 91152021     	add	x1, x1, #0x548
 411c884: 910362a0     	add	x0, x21, #0xd8
 411c888: 910143e2     	add	x2, sp, #0x50
 411c88c: 976bdec0     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 411c890: 910143e0     	add	x0, sp, #0x50
 411c894: 9758b924     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 411c898: f9424a68     	ldr	x8, [x19, #0x490]
 411c89c: 9004f129     	adrp	x9, 0xdf40000 <dyld_stub_binder+0xdf40000>
 411c8a0: 3dc01d20     	ldr	q0, [x9, #0x70]
 411c8a4: 3d8017e0     	str	q0, [sp, #0x50]
 411c8a8: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411c8ac: 91122021     	add	x1, x1, #0x488
 411c8b0: 91036100     	add	x0, x8, #0xd8
 411c8b4: 910143e2     	add	x2, sp, #0x50
 411c8b8: 9767456a     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 411c8bc: f9424e75     	ldr	x21, [x19, #0x498]
 411c8c0: 394edaa8     	ldrb	w8, [x21, #0x3b6]
 411c8c4: 35002e08     	cbnz	w8, 0x411ce84 <_ChromeMain+0x4117be8>
 411c8c8: aa1503e0     	mov	x0, x21
 411c8cc: 52800001     	mov	w1, #0x0                ; =0
 411c8d0: 97988aa8     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 411c8d4: f9424e60     	ldr	x0, [x19, #0x498]
 411c8d8: 52801bc8     	mov	w8, #0xde               ; =222
 411c8dc: b9001be8     	str	w8, [sp, #0x18]
 411c8e0: 390073ff     	strb	wzr, [sp, #0x1c]
 411c8e4: f9400008     	ldr	x8, [x0]
 411c8e8: f941f508     	ldr	x8, [x8, #0x3e8]
 411c8ec: 910063e1     	add	x1, sp, #0x18
 411c8f0: d63f0100     	blr	x8
 411c8f4: f9424e60     	ldr	x0, [x19, #0x498]
 411c8f8: 52800021     	mov	w1, #0x1                ; =1
 411c8fc: 9769b501     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 411c900: f9424e75     	ldr	x21, [x19, #0x498]
 411c904: f941aea8     	ldr	x8, [x21, #0x358]
 411c908: f9402516     	ldr	x22, [x8, #0x48]
 411c90c: b40000b6     	cbz	x22, 0x411c920 <_ChromeMain+0x4117684>
 411c910: b94002c8     	ldr	w8, [x22]
 411c914: 31000508     	adds	w8, w8, #0x1
 411c918: b90002c8     	str	w8, [x22]
 411c91c: 54003fc2     	b.hs	0x411d114 <_ChromeMain+0x4117e78>
 411c920: b94046c8     	ldr	w8, [x22, #0x44]
 411c924: 3100051f     	cmn	w8, #0x1
 411c928: 54004260     	b.eq	0x411d174 <_ChromeMain+0x4117ed8>
 411c92c: 52800189     	mov	w9, #0xc                ; =12
 411c930: 4b080137     	sub	w23, w9, w8
 411c934: b94042d8     	ldr	w24, [x22, #0x40]
 411c938: 3100071f     	cmn	w24, #0x1
 411c93c: 540033c0     	b.eq	0x411cfb4 <_ChromeMain+0x4117d18>
 411c940: b9404ac3     	ldr	w3, [x22, #0x48]
 411c944: 3100047f     	cmn	w3, #0x1
 411c948: 540041e0     	b.eq	0x411d184 <_ChromeMain+0x4117ee8>
 411c94c: aa1603e0     	mov	x0, x22
 411c950: aa1703e1     	mov	x1, x23
 411c954: aa1803e2     	mov	x2, x24
 411c958: 976e2b4a     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 411c95c: aa0003f7     	mov	x23, x0
 411c960: b40000a0     	cbz	x0, 0x411c974 <_ChromeMain+0x41176d8>
 411c964: b94002e8     	ldr	w8, [x23]
 411c968: 31000508     	adds	w8, w8, #0x1
 411c96c: b90002e8     	str	w8, [x23]
 411c970: 54003d82     	b.hs	0x411d120 <_ChromeMain+0x4117e84>
 411c974: b94042e2     	ldr	w2, [x23, #0x40]
 411c978: 3100045f     	cmn	w2, #0x1
 411c97c: 54003240     	b.eq	0x411cfc4 <_ChromeMain+0x4117d28>
 411c980: aa1703e0     	mov	x0, x23
 411c984: 52800001     	mov	w1, #0x0                ; =0
 411c988: 52803e83     	mov	w3, #0x1f4              ; =500
 411c98c: 976e2b3d     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 411c990: f9002be0     	str	x0, [sp, #0x50]
 411c994: b40000a0     	cbz	x0, 0x411c9a8 <_ChromeMain+0x411770c>
 411c998: b9400008     	ldr	w8, [x0]
 411c99c: 31000508     	adds	w8, w8, #0x1
 411c9a0: b9000008     	str	w8, [x0]
 411c9a4: 54003c42     	b.hs	0x411d12c <_ChromeMain+0x4117e90>
 411c9a8: b40000d7     	cbz	x23, 0x411c9c0 <_ChromeMain+0x4117724>
 411c9ac: b94002e9     	ldr	w9, [x23]
 411c9b0: 51000528     	sub	w8, w9, #0x1
 411c9b4: b90002e8     	str	w8, [x23]
 411c9b8: 34003c09     	cbz	w9, 0x411d138 <_ChromeMain+0x4117e9c>
 411c9bc: 34001848     	cbz	w8, 0x411ccc4 <_ChromeMain+0x4117a28>
 411c9c0: f0fe7857     	adrp	x23, 0x1027000 <_ChromeMain+0x1021d64>
 411c9c4: 912602f7     	add	x23, x23, #0x980
 411c9c8: b40000d6     	cbz	x22, 0x411c9e0 <_ChromeMain+0x4117744>
 411c9cc: b94002c9     	ldr	w9, [x22]
 411c9d0: 51000528     	sub	w8, w9, #0x1
 411c9d4: b90002c8     	str	w8, [x22]
 411c9d8: 34003b69     	cbz	w9, 0x411d144 <_ChromeMain+0x4117ea8>
 411c9dc: 34001628     	cbz	w8, 0x411cca0 <_ChromeMain+0x4117a04>
 411c9e0: f94002a8     	ldr	x8, [x21]
 411c9e4: f941ed08     	ldr	x8, [x8, #0x3d8]
 411c9e8: 910143e1     	add	x1, sp, #0x50
 411c9ec: aa1503e0     	mov	x0, x21
 411c9f0: d63f0100     	blr	x8
 411c9f4: f9402be0     	ldr	x0, [sp, #0x50]
 411c9f8: b40000c0     	cbz	x0, 0x411ca10 <_ChromeMain+0x4117774>
 411c9fc: b9400009     	ldr	w9, [x0]
 411ca00: 51000528     	sub	w8, w9, #0x1
 411ca04: b9000008     	str	w8, [x0]
 411ca08: 34003a49     	cbz	w9, 0x411d150 <_ChromeMain+0x4117eb4>
 411ca0c: 34001428     	cbz	w8, 0x411cc90 <_ChromeMain+0x41179f4>
 411ca10: b944c268     	ldr	w8, [x19, #0x4c0]
 411ca14: 340016a8     	cbz	w8, 0x411cce8 <_ChromeMain+0x4117a4c>
 411ca18: f9425675     	ldr	x21, [x19, #0x4a8]
 411ca1c: 52800800     	mov	w0, #0x40               ; =64
 411ca20: 96fbca52     	bl	0xf368 <_ChromeMain+0xa0cc>
 411ca24: 52800028     	mov	w8, #0x1                ; =1
 411ca28: b9000008     	str	w8, [x0]
 411ca2c: a900e817     	stp	x23, x26, [x0, #0x8]
 411ca30: a901d019     	stp	x25, x20, [x0, #0x18]
 411ca34: f004f108     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 411ca38: 3dc3d900     	ldr	q0, [x8, #0xf60]
 411ca3c: 3c828000     	stur	q0, [x0, #0x28]
 411ca40: 3900e01f     	strb	wzr, [x0, #0x38]
 411ca44: f9002be0     	str	x0, [sp, #0x50]
 411ca48: 0f000420     	movi.2s	v0, #0x1
 411ca4c: fd002fe0     	str	d0, [sp, #0x58]
 411ca50: 52800068     	mov	w8, #0x3                ; =3
 411ca54: b90063e8     	str	w8, [sp, #0x60]
 411ca58: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 411ca5c: f90037ff     	str	xzr, [sp, #0x68]
 411ca60: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411ca64: 91152021     	add	x1, x1, #0x548
 411ca68: 910362a0     	add	x0, x21, #0xd8
 411ca6c: 910143e2     	add	x2, sp, #0x50
 411ca70: 976bde47     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 411ca74: 910143e0     	add	x0, sp, #0x50
 411ca78: 9758b8ab     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 411ca7c: f9423668     	ldr	x8, [x19, #0x468]
 411ca80: b944c269     	ldr	w9, [x19, #0x4c0]
 411ca84: 7100053f     	cmp	w9, #0x1
 411ca88: d2c000c9     	mov	x9, #0x600000000        ; =25769803776
 411ca8c: d2c0010a     	mov	x10, #0x800000000       ; =34359738368
 411ca90: 9a890149     	csel	x9, x10, x9, eq
 411ca94: a90527ff     	stp	xzr, x9, [sp, #0x50]
 411ca98: b0054755     	adrp	x21, 0xea05000 <dyld_stub_binder+0xea05000>
 411ca9c: 911222b5     	add	x21, x21, #0x488
 411caa0: 91036100     	add	x0, x8, #0xd8
 411caa4: 910143e2     	add	x2, sp, #0x50
 411caa8: aa1503e1     	mov	x1, x21
 411caac: 976744ed     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 411cab0: f9423a68     	ldr	x8, [x19, #0x470]
 411cab4: 9004f129     	adrp	x9, 0xdf40000 <dyld_stub_binder+0xdf40000>
 411cab8: 3dc02520     	ldr	q0, [x9, #0x90]
 411cabc: 3d8017e0     	str	q0, [sp, #0x50]
 411cac0: 91036100     	add	x0, x8, #0xd8
 411cac4: 910143e2     	add	x2, sp, #0x50
 411cac8: aa1503e1     	mov	x1, x21
 411cacc: 976744e5     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 411cad0: f9424668     	ldr	x8, [x19, #0x488]
 411cad4: b944c269     	ldr	w9, [x19, #0x4c0]
 411cad8: 7100013f     	cmp	w9, #0x0
 411cadc: d2c00049     	mov	x9, #0x200000000        ; =8589934592
 411cae0: 9a9f012a     	csel	x10, x9, xzr, eq
 411cae4: a9052be9     	stp	x9, x10, [sp, #0x50]
 411cae8: 91036100     	add	x0, x8, #0xd8
 411caec: 910143e2     	add	x2, sp, #0x50
 411caf0: aa1503e1     	mov	x1, x21
 411caf4: 976744db     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 411caf8: 910d0261     	add	x1, x19, #0x340
 411cafc: aa1303e0     	mov	x0, x19
 411cb00: 9769b96e     	bl	0x1b8b0b8 <_ChromeMain+0x1b85e1c>
 411cb04: aa1303e0     	mov	x0, x19
 411cb08: 52800041     	mov	w1, #0x2                ; =2
 411cb0c: 97506b34     	bl	0x15377dc <_ChromeMain+0x1532540>
 411cb10: f9416660     	ldr	x0, [x19, #0x2c8]
 411cb14: f9400bf4     	ldr	x20, [sp, #0x10]
 411cb18: b40014c0     	cbz	x0, 0x411cdb0 <_ChromeMain+0x4117b14>
 411cb1c: 528014a1     	mov	w1, #0xa5               ; =165
 411cb20: 9755c670     	bl	0x168e4e0 <_ChromeMain+0x1689244>
 411cb24: f9416660     	ldr	x0, [x19, #0x2c8]
 411cb28: b4001340     	cbz	x0, 0x411cd90 <_ChromeMain+0x4117af4>
 411cb2c: 52800021     	mov	w1, #0x1                ; =1
 411cb30: 97c038a4     	bl	0x312adc0 <_ChromeMain+0x3125b24>
 411cb34: aa1303e0     	mov	x0, x19
 411cb38: 974948c2     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 411cb3c: f9416675     	ldr	x21, [x19, #0x2c8]
 411cb40: b4001175     	cbz	x21, 0x411cd6c <_ChromeMain+0x4117ad0>
 411cb44: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 411cb48: f9001bff     	str	xzr, [sp, #0x30]
 411cb4c: 910143e8     	add	x8, sp, #0x50
 411cb50: 910083e0     	add	x0, sp, #0x20
 411cb54: d2800001     	mov	x1, #0x0                ; =0
 411cb58: 971f15ee     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 411cb5c: 910143e1     	add	x1, sp, #0x50
 411cb60: aa1503e0     	mov	x0, x21
 411cb64: 52800042     	mov	w2, #0x2                ; =2
 411cb68: 97414389     	bl	0x116d98c <_ChromeMain+0x11686f0>
 411cb6c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 411cb70: 37f80868     	tbnz	w8, #0x1f, 0x411cc7c <_ChromeMain+0x41179e0>
 411cb74: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 411cb78: 36f800a8     	tbz	w8, #0x1f, 0x411cb8c <_ChromeMain+0x41178f0>
 411cb7c: f94013e0     	ldr	x0, [sp, #0x20]
 411cb80: f9401be8     	ldr	x8, [sp, #0x30]
 411cb84: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 411cb88: 96fbb0cc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411cb8c: b944c268     	ldr	w8, [x19, #0x4c0]
 411cb90: 340003e8     	cbz	w8, 0x411cc0c <_ChromeMain+0x4117970>
 411cb94: 52800600     	mov	w0, #0x30               ; =48
 411cb98: 96fbc9f4     	bl	0xf368 <_ChromeMain+0xa0cc>
 411cb9c: aa0003e4     	mov	x4, x0
 411cba0: 4f000440     	movi.4s	v0, #0x2
 411cba4: 3c808000     	stur	q0, [x0, #0x8]
 411cba8: 7900301f     	strh	wzr, [x0, #0x18]
 411cbac: d0051188     	adrp	x8, 0xe34e000 <dyld_stub_binder+0xe34e000>
 411cbb0: 91362108     	add	x8, x8, #0xd88
 411cbb4: f9000008     	str	x8, [x0]
 411cbb8: 4f026420     	movi.4s	v0, #0x41, lsl #24
 411cbbc: 3c81c000     	stur	q0, [x0, #0x1c]
 411cbc0: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411cbc4: 9114a021     	add	x1, x1, #0x528
 411cbc8: b004e142     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 411cbcc: 91264842     	add	x2, x2, #0x992
 411cbd0: 90ff6a83     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 411cbd4: 913c0063     	add	x3, x3, #0xf00
 411cbd8: aa1403e0     	mov	x0, x20
 411cbdc: d2800005     	mov	x5, #0x0                ; =0
 411cbe0: 9729356f     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 411cbe4: b5000680     	cbnz	x0, 0x411ccb4 <_ChromeMain+0x4117a18>
 411cbe8: aa1303e0     	mov	x0, x19
 411cbec: a94f7bfd     	ldp	x29, x30, [sp, #0xf0]
 411cbf0: a94e4ff4     	ldp	x20, x19, [sp, #0xe0]
 411cbf4: a94d57f6     	ldp	x22, x21, [sp, #0xd0]
 411cbf8: a94c5ff8     	ldp	x24, x23, [sp, #0xc0]
 411cbfc: a94b67fa     	ldp	x26, x25, [sp, #0xb0]
 411cc00: a94a6ffc     	ldp	x28, x27, [sp, #0xa0]
 411cc04: 910403ff     	add	sp, sp, #0x100
 411cc08: d65f03c0     	ret
 411cc0c: 52800400     	mov	w0, #0x20               ; =32
 411cc10: 96fbc9d6     	bl	0xf368 <_ChromeMain+0xa0cc>
 411cc14: aa0003e4     	mov	x4, x0
 411cc18: a9017c1f     	stp	xzr, xzr, [x0, #0x10]
 411cc1c: 7900301f     	strh	wzr, [x0, #0x18]
 411cc20: b00504e8     	adrp	x8, 0xe1b9000 <dyld_stub_binder+0xe1b9000>
 411cc24: 911d4108     	add	x8, x8, #0x750
 411cc28: a9007c08     	stp	x8, xzr, [x0]
 411cc2c: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411cc30: 9114a021     	add	x1, x1, #0x528
 411cc34: b004e142     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 411cc38: 91264842     	add	x2, x2, #0x992
 411cc3c: 90ff6a83     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 411cc40: 913c0063     	add	x3, x3, #0xf00
 411cc44: aa1403e0     	mov	x0, x20
 411cc48: d2800005     	mov	x5, #0x0                ; =0
 411cc4c: 97293554     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 411cc50: b5000440     	cbnz	x0, 0x411ccd8 <_ChromeMain+0x4117a3c>
 411cc54: 90054741     	adrp	x1, 0xea04000 <dyld_stub_binder+0xea04000>
 411cc58: 91324021     	add	x1, x1, #0xc90
 411cc5c: 9004e142     	adrp	x2, 0xdd44000 <dyld_stub_binder+0xdd44000>
 411cc60: 91008442     	add	x2, x2, #0x21
 411cc64: aa1403e0     	mov	x0, x20
 411cc68: d2800003     	mov	x3, #0x0                ; =0
 411cc6c: 52800024     	mov	w4, #0x1                ; =1
 411cc70: d2800005     	mov	x5, #0x0                ; =0
 411cc74: 9729354a     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 411cc78: 17ffffdc     	b	0x411cbe8 <_ChromeMain+0x411794c>
 411cc7c: f9402be0     	ldr	x0, [sp, #0x50]
 411cc80: f94033e8     	ldr	x8, [sp, #0x60]
 411cc84: d37ff901     	lsl	x1, x8, #1
 411cc88: 96fbb08c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411cc8c: 17ffffba     	b	0x411cb74 <_ChromeMain+0x41178d8>
 411cc90: 9740becd     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 411cc94: 52800a01     	mov	w1, #0x50               ; =80
 411cc98: 96fbb088     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411cc9c: 17ffff5d     	b	0x411ca10 <_ChromeMain+0x4117774>
 411cca0: aa1603e0     	mov	x0, x22
 411cca4: 9740bec8     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 411cca8: 52800a01     	mov	w1, #0x50               ; =80
 411ccac: 96fbb083     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411ccb0: 17ffff4c     	b	0x411c9e0 <_ChromeMain+0x4117744>
 411ccb4: f9400008     	ldr	x8, [x0]
 411ccb8: f9400508     	ldr	x8, [x8, #0x8]
 411ccbc: d63f0100     	blr	x8
 411ccc0: 17ffffca     	b	0x411cbe8 <_ChromeMain+0x411794c>
 411ccc4: aa1703e0     	mov	x0, x23
 411ccc8: 9740bebf     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 411cccc: 52800a01     	mov	w1, #0x50               ; =80
 411ccd0: 96fbb07a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411ccd4: 17ffff3b     	b	0x411c9c0 <_ChromeMain+0x4117724>
 411ccd8: f9400008     	ldr	x8, [x0]
 411ccdc: f9400508     	ldr	x8, [x8, #0x8]
 411cce0: d63f0100     	blr	x8
 411cce4: 17ffffdc     	b	0x411cc54 <_ChromeMain+0x41179b8>
 411cce8: f9424a75     	ldr	x21, [x19, #0x490]
 411ccec: b94336a8     	ldr	w8, [x21, #0x334]
 411ccf0: 7100491f     	cmp	w8, #0x12
 411ccf4: 54000240     	b.eq	0x411cd3c <_ChromeMain+0x4117aa0>
 411ccf8: f9418aa0     	ldr	x0, [x21, #0x310]
 411ccfc: b9410c08     	ldr	w8, [x0, #0x10c]
 411cd00: 7100491f     	cmp	w8, #0x12
 411cd04: 540000a0     	b.eq	0x411cd18 <_ChromeMain+0x4117a7c>
 411cd08: 52800248     	mov	w8, #0x12               ; =18
 411cd0c: b9010c08     	str	w8, [x0, #0x10c]
 411cd10: 52800021     	mov	w1, #0x1                ; =1
 411cd14: 97652167     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 411cd18: 52800248     	mov	w8, #0x12               ; =18
 411cd1c: b90336a8     	str	w8, [x21, #0x334]
 411cd20: aa1503e0     	mov	x0, x21
 411cd24: 52800021     	mov	w1, #0x1                ; =1
 411cd28: 971b130f     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 411cd2c: 9103e2a0     	add	x0, x21, #0xf8
 411cd30: 910cd2a1     	add	x1, x21, #0x334
 411cd34: 97382ca7     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411cd38: f9424a75     	ldr	x21, [x19, #0x490]
 411cd3c: d004f108     	adrp	x8, 0xdf3e000 <dyld_stub_binder+0xdf3e000>
 411cd40: 3dc1c100     	ldr	q0, [x8, #0x700]
 411cd44: 3d8017e0     	str	q0, [sp, #0x50]
 411cd48: b0054741     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 411cd4c: 91122021     	add	x1, x1, #0x488
 411cd50: 910362a0     	add	x0, x21, #0xd8
 411cd54: 910143e2     	add	x2, sp, #0x50
 411cd58: 97674442     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 411cd5c: f9423e60     	ldr	x0, [x19, #0x478]
 411cd60: 52800281     	mov	w1, #0x14               ; =20
 411cd64: 9595ab8f     	bl	0xa687ba0 <_ChromeMain+0xa682904>
 411cd68: 17ffff2c     	b	0x411ca18 <_ChromeMain+0x411777c>
 411cd6c: 973724e5     	bl	0xee6100 <_ChromeMain+0xee0e64>
 411cd70: 35003140     	cbnz	w0, 0x411d398 <_ChromeMain+0x41180fc>
 411cd74: aa1303e0     	mov	x0, x19
 411cd78: 97470637     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 411cd7c: aa0003f5     	mov	x21, x0
 411cd80: f9416660     	ldr	x0, [x19, #0x2c8]
 411cd84: f9016675     	str	x21, [x19, #0x2c8]
 411cd88: b4ffede0     	cbz	x0, 0x411cb44 <_ChromeMain+0x41178a8>
 411cd8c: 1400016e     	b	0x411d344 <_ChromeMain+0x41180a8>
 411cd90: 973724dc     	bl	0xee6100 <_ChromeMain+0xee0e64>
 411cd94: 35002ec0     	cbnz	w0, 0x411d36c <_ChromeMain+0x41180d0>
 411cd98: aa1303e0     	mov	x0, x19
 411cd9c: 9747062e     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 411cda0: f9416668     	ldr	x8, [x19, #0x2c8]
 411cda4: f9016660     	str	x0, [x19, #0x2c8]
 411cda8: b4ffec28     	cbz	x8, 0x411cb2c <_ChromeMain+0x4117890>
 411cdac: 14000175     	b	0x411d380 <_ChromeMain+0x41180e4>
 411cdb0: 973724d4     	bl	0xee6100 <_ChromeMain+0xee0e64>
 411cdb4: 35002d20     	cbnz	w0, 0x411d358 <_ChromeMain+0x41180bc>
 411cdb8: aa1303e0     	mov	x0, x19
 411cdbc: 97470626     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 411cdc0: f9416668     	ldr	x8, [x19, #0x2c8]
 411cdc4: f9016660     	str	x0, [x19, #0x2c8]
 411cdc8: b4ffeaa8     	cbz	x8, 0x411cb1c <_ChromeMain+0x4117880>
 411cdcc: f9400109     	ldr	x9, [x8]
 411cdd0: f9400529     	ldr	x9, [x9, #0x8]
 411cdd4: aa0803e0     	mov	x0, x8
 411cdd8: d63f0120     	blr	x9
 411cddc: f9416660     	ldr	x0, [x19, #0x2c8]
 411cde0: 17ffff4f     	b	0x411cb1c <_ChromeMain+0x4117880>
 411cde4: eb09011f     	cmp	x8, x9
 411cde8: 54ff96a0     	b.eq	0x411c0bc <_ChromeMain+0x4116e20>
 411cdec: f9401916     	ldr	x22, [x8, #0x30]
 411cdf0: 17fffcb4     	b	0x411c0c0 <_ChromeMain+0x4116e24>
 411cdf4: 9740be74     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 411cdf8: 52800a01     	mov	w1, #0x50               ; =80
 411cdfc: 96fbb02f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411ce00: 17fffc3e     	b	0x411bef8 <_ChromeMain+0x4116c5c>
 411ce04: b8350108     	ldadd	w21, w8, [x8]
 411ce08: 7100011f     	cmp	w8, #0x0
 411ce0c: 540028ad     	b.le	0x411d320 <_ChromeMain+0x4118084>
 411ce10: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 411ce14: 6b09011f     	cmp	w8, w9
 411ce18: 54ffb421     	b.ne	0x411c49c <_ChromeMain+0x4117200>
 411ce1c: d4200000     	brk	#0
 411ce20: d4400000     	hlt	#0
 411ce24: d4200020     	brk	#0x1
 411ce28: f9400108     	ldr	x8, [x8]
 411ce2c: b5ff93c8     	cbnz	x8, 0x411c0a4 <_ChromeMain+0x4116e08>
 411ce30: 17fffca3     	b	0x411c0bc <_ChromeMain+0x4116e20>
 411ce34: 52800029     	mov	w9, #0x1                ; =1
 411ce38: b8290108     	ldadd	w9, w8, [x8]
 411ce3c: 7100011f     	cmp	w8, #0x0
 411ce40: 5400276d     	b.le	0x411d32c <_ChromeMain+0x4118090>
 411ce44: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 411ce48: 6b09011f     	cmp	w8, w9
 411ce4c: 54ffb741     	b.ne	0x411c534 <_ChromeMain+0x4117298>
 411ce50: d4200000     	brk	#0
 411ce54: d4400000     	hlt	#0
 411ce58: d4200020     	brk	#0x1
 411ce5c: 390edb5f     	strb	wzr, [x26, #0x3b6]
 411ce60: aa1a03e0     	mov	x0, x26
 411ce64: 97382d29     	bl	0xf28308 <_ChromeMain+0xf2306c>
 411ce68: aa1a03e0     	mov	x0, x26
 411ce6c: 52800041     	mov	w1, #0x2                ; =2
 411ce70: 971b12bd     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 411ce74: 910edb41     	add	x1, x26, #0x3b6
 411ce78: aa1b03e0     	mov	x0, x27
 411ce7c: 97382c55     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411ce80: 17fffa14     	b	0x411b6d0 <_ChromeMain+0x4116434>
 411ce84: 390edabf     	strb	wzr, [x21, #0x3b6]
 411ce88: aa1503e0     	mov	x0, x21
 411ce8c: 97382d1f     	bl	0xf28308 <_ChromeMain+0xf2306c>
 411ce90: aa1503e0     	mov	x0, x21
 411ce94: 52800041     	mov	w1, #0x2                ; =2
 411ce98: 971b12b3     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 411ce9c: 9103e2a0     	add	x0, x21, #0xf8
 411cea0: 910edaa1     	add	x1, x21, #0x3b6
 411cea4: 97382c4b     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411cea8: f9424e75     	ldr	x21, [x19, #0x498]
 411ceac: 17fffe87     	b	0x411c8c8 <_ChromeMain+0x411762c>
 411ceb0: f9002bff     	str	xzr, [sp, #0x50]
 411ceb4: f94006c8     	ldr	x8, [x22, #0x8]
 411ceb8: aa1603e0     	mov	x0, x22
 411cebc: d63f0100     	blr	x8
 411cec0: 12800008     	mov	w8, #-0x1               ; =-1
 411cec4: b8e802c8     	ldaddal	w8, w8, [x22]
 411cec8: 7100051f     	cmp	w8, #0x1
 411cecc: 54000081     	b.ne	0x411cedc <_ChromeMain+0x4117c40>
 411ced0: f9400ac8     	ldr	x8, [x22, #0x10]
 411ced4: aa1603e0     	mov	x0, x22
 411ced8: d63f0100     	blr	x8
 411cedc: f9402be0     	ldr	x0, [sp, #0x50]
 411cee0: b4ffa0c0     	cbz	x0, 0x411c2f8 <_ChromeMain+0x411705c>
 411cee4: 12800008     	mov	w8, #-0x1               ; =-1
 411cee8: b8e80008     	ldaddal	w8, w8, [x0]
 411ceec: 7100051f     	cmp	w8, #0x1
 411cef0: 54ffa041     	b.ne	0x411c2f8 <_ChromeMain+0x411705c>
 411cef4: f9400808     	ldr	x8, [x0, #0x10]
 411cef8: d63f0100     	blr	x8
 411cefc: 17fffcff     	b	0x411c2f8 <_ChromeMain+0x411705c>
 411cf00: f9002bff     	str	xzr, [sp, #0x50]
 411cf04: f94006c8     	ldr	x8, [x22, #0x8]
 411cf08: aa1603e0     	mov	x0, x22
 411cf0c: d63f0100     	blr	x8
 411cf10: 12800008     	mov	w8, #-0x1               ; =-1
 411cf14: b8e802c8     	ldaddal	w8, w8, [x22]
 411cf18: 7100051f     	cmp	w8, #0x1
 411cf1c: 54000081     	b.ne	0x411cf2c <_ChromeMain+0x4117c90>
 411cf20: f9400ac8     	ldr	x8, [x22, #0x10]
 411cf24: aa1603e0     	mov	x0, x22
 411cf28: d63f0100     	blr	x8
 411cf2c: f9402be0     	ldr	x0, [sp, #0x50]
 411cf30: b4ffa1a0     	cbz	x0, 0x411c364 <_ChromeMain+0x41170c8>
 411cf34: 12800008     	mov	w8, #-0x1               ; =-1
 411cf38: b8e80008     	ldaddal	w8, w8, [x0]
 411cf3c: 7100051f     	cmp	w8, #0x1
 411cf40: 54ffa121     	b.ne	0x411c364 <_ChromeMain+0x41170c8>
 411cf44: f9400808     	ldr	x8, [x0, #0x10]
 411cf48: d63f0100     	blr	x8
 411cf4c: 17fffd06     	b	0x411c364 <_ChromeMain+0x41170c8>
 411cf50: 52800028     	mov	w8, #0x1                ; =1
 411cf54: b905f6c8     	str	w8, [x22, #0x5f4]
 411cf58: aa1603e0     	mov	x0, x22
 411cf5c: 52800021     	mov	w1, #0x1                ; =1
 411cf60: 971b1281     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 411cf64: 9103e2c0     	add	x0, x22, #0xf8
 411cf68: 9117d2c1     	add	x1, x22, #0x5f4
 411cf6c: 97382c19     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411cf70: f9425a76     	ldr	x22, [x19, #0x4b0]
 411cf74: 17fffc2a     	b	0x411c01c <_ChromeMain+0x4116d80>
 411cf78: 12800008     	mov	w8, #-0x1               ; =-1
 411cf7c: b8e80008     	ldaddal	w8, w8, [x0]
 411cf80: 7100051f     	cmp	w8, #0x1
 411cf84: 54ff5fa1     	b.ne	0x411bb78 <_ChromeMain+0x41168dc>
 411cf88: f9400808     	ldr	x8, [x0, #0x10]
 411cf8c: d63f0100     	blr	x8
 411cf90: 17fffafa     	b	0x411bb78 <_ChromeMain+0x41168dc>
 411cf94: f9400008     	ldr	x8, [x0]
 411cf98: f9400508     	ldr	x8, [x8, #0x8]
 411cf9c: d63f0100     	blr	x8
 411cfa0: 17fffc7a     	b	0x411c188 <_ChromeMain+0x4116eec>
 411cfa4: f9400008     	ldr	x8, [x0]
 411cfa8: f9400508     	ldr	x8, [x8, #0x8]
 411cfac: d63f0100     	blr	x8
 411cfb0: 17fffc49     	b	0x411c0d4 <_ChromeMain+0x4116e38>
 411cfb4: aa1603e0     	mov	x0, x22
 411cfb8: 97842462     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 411cfbc: b94042d8     	ldr	w24, [x22, #0x40]
 411cfc0: 17fffe60     	b	0x411c940 <_ChromeMain+0x41176a4>
 411cfc4: aa1703e0     	mov	x0, x23
 411cfc8: 9784245e     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 411cfcc: b94042e2     	ldr	w2, [x23, #0x40]
 411cfd0: 17fffe6c     	b	0x411c980 <_ChromeMain+0x41176e4>
 411cfd4: 9737244b     	bl	0xee6100 <_ChromeMain+0xee0e64>
 411cfd8: 35001ec0     	cbnz	w0, 0x411d3b0 <_ChromeMain+0x4118114>
 411cfdc: aa1603e0     	mov	x0, x22
 411cfe0: 9747059d     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 411cfe4: aa0003f7     	mov	x23, x0
 411cfe8: f94166c0     	ldr	x0, [x22, #0x2c8]
 411cfec: f90166d7     	str	x23, [x22, #0x2c8]
 411cff0: b4ff8d20     	cbz	x0, 0x411c194 <_ChromeMain+0x4116ef8>
 411cff4: f9400008     	ldr	x8, [x0]
 411cff8: f9400508     	ldr	x8, [x8, #0x8]
 411cffc: d63f0100     	blr	x8
 411d000: f94166d7     	ldr	x23, [x22, #0x2c8]
 411d004: 17fffc64     	b	0x411c194 <_ChromeMain+0x4116ef8>
 411d008: b90326bf     	str	wzr, [x21, #0x324]
 411d00c: aa1503e0     	mov	x0, x21
 411d010: 9744e6b6     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 411d014: aa1503e0     	mov	x0, x21
 411d018: 52800041     	mov	w1, #0x2                ; =2
 411d01c: 971b1252     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 411d020: 9103e2a0     	add	x0, x21, #0xf8
 411d024: 910c92a1     	add	x1, x21, #0x324
 411d028: 97382bea     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 411d02c: f9400355     	ldr	x21, [x26]
 411d030: 17fffd57     	b	0x411c58c <_ChromeMain+0x41172f0>
 411d034: 9406d9b1     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d038: 17fff924     	b	0x411b4c8 <_ChromeMain+0x411622c>
 411d03c: 9406d9af     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d040: 17fff94f     	b	0x411b57c <_ChromeMain+0x41162e0>
 411d044: 9406d9ad     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d048: 17fff979     	b	0x411b62c <_ChromeMain+0x4116390>
 411d04c: 9406d9ab     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d050: 17fff9b3     	b	0x411b71c <_ChromeMain+0x4116480>
 411d054: 9406d9a9     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d058: 17fff9dc     	b	0x411b7c8 <_ChromeMain+0x411652c>
 411d05c: 9406d9a7     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d060: 17fffa12     	b	0x411b8a8 <_ChromeMain+0x411660c>
 411d064: 9406d9a5     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d068: 17fffb36     	b	0x411bd40 <_ChromeMain+0x4116aa4>
 411d06c: d4200000     	brk	#0
 411d070: d4400000     	hlt	#0
 411d074: d4200020     	brk	#0x1
 411d078: d4200000     	brk	#0
 411d07c: d4400000     	hlt	#0
 411d080: d4200020     	brk	#0x1
 411d084: d4200000     	brk	#0
 411d088: d4400000     	hlt	#0
 411d08c: d4200020     	brk	#0x1
 411d090: d4200000     	brk	#0
 411d094: d4400000     	hlt	#0
 411d098: d4200020     	brk	#0x1
 411d09c: d4200000     	brk	#0
 411d0a0: d4400000     	hlt	#0
 411d0a4: d4200020     	brk	#0x1
 411d0a8: d4200000     	brk	#0
 411d0ac: d4400000     	hlt	#0
 411d0b0: d4200020     	brk	#0x1
 411d0b4: d4200000     	brk	#0
 411d0b8: d4400000     	hlt	#0
 411d0bc: d4200020     	brk	#0x1
 411d0c0: d4200000     	brk	#0
 411d0c4: d4400000     	hlt	#0
 411d0c8: d4200020     	brk	#0x1
 411d0cc: d4200000     	brk	#0
 411d0d0: d4400000     	hlt	#0
 411d0d4: d4200020     	brk	#0x1
 411d0d8: d4200000     	brk	#0
 411d0dc: d4400000     	hlt	#0
 411d0e0: d4200020     	brk	#0x1
 411d0e4: d4200000     	brk	#0
 411d0e8: d4400000     	hlt	#0
 411d0ec: d4200020     	brk	#0x1
 411d0f0: d4200000     	brk	#0
 411d0f4: d4400000     	hlt	#0
 411d0f8: d4200020     	brk	#0x1
 411d0fc: f9000116     	str	x22, [x8]
 411d100: aa1803fa     	mov	x26, x24
 411d104: 17fffd31     	b	0x411c5c8 <_ChromeMain+0x411732c>
 411d108: b21c03e9     	mov	x9, #0x1000000010       ; =68719476752
 411d10c: f9000109     	str	x9, [x8]
 411d110: 17fffda8     	b	0x411c7b0 <_ChromeMain+0x4117514>
 411d114: d4200000     	brk	#0
 411d118: d4400000     	hlt	#0
 411d11c: d4200020     	brk	#0x1
 411d120: d4200000     	brk	#0
 411d124: d4400000     	hlt	#0
 411d128: d4200020     	brk	#0x1
 411d12c: d4200000     	brk	#0
 411d130: d4400000     	hlt	#0
 411d134: d4200020     	brk	#0x1
 411d138: d4200000     	brk	#0
 411d13c: d4400000     	hlt	#0
 411d140: d4200020     	brk	#0x1
 411d144: d4200000     	brk	#0
 411d148: d4400000     	hlt	#0
 411d14c: d4200020     	brk	#0x1
 411d150: d4200000     	brk	#0
 411d154: d4400000     	hlt	#0
 411d158: d4200020     	brk	#0x1
 411d15c: d4200000     	brk	#0
 411d160: d4400000     	hlt	#0
 411d164: d4200020     	brk	#0x1
 411d168: d4200000     	brk	#0
 411d16c: d4400000     	hlt	#0
 411d170: d4200020     	brk	#0x1
 411d174: aa1603e0     	mov	x0, x22
 411d178: 978423f2     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 411d17c: b94046c8     	ldr	w8, [x22, #0x44]
 411d180: 17fffdeb     	b	0x411c92c <_ChromeMain+0x4117690>
 411d184: aa1603e0     	mov	x0, x22
 411d188: 978423ee     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 411d18c: b9404ac3     	ldr	w3, [x22, #0x48]
 411d190: 17fffdef     	b	0x411c94c <_ChromeMain+0x41176b0>
 411d194: 9406d959     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d198: 17fffa06     	b	0x411b9b0 <_ChromeMain+0x4116714>
 411d19c: 9406d957     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d1a0: 17fffa1f     	b	0x411ba1c <_ChromeMain+0x4116780>
 411d1a4: 9406d955     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d1a8: 17fffa4a     	b	0x411bad0 <_ChromeMain+0x4116834>
 411d1ac: 9406d953     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d1b0: 17fffa88     	b	0x411bbd0 <_ChromeMain+0x4116934>
 411d1b4: 9406d951     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 411d1b8: 17fffaa1     	b	0x411bc3c <_ChromeMain+0x41169a0>
 411d1bc: f9000116     	str	x22, [x8]
 411d1c0: 17fffd4a     	b	0x411c6e8 <_ChromeMain+0x411744c>
 411d1c4: 12800008     	mov	w8, #-0x1               ; =-1
 411d1c8: b8e80008     	ldaddal	w8, w8, [x0]
 411d1cc: 7100051f     	cmp	w8, #0x1
 411d1d0: 54000101     	b.ne	0x411d1f0 <_ChromeMain+0x4117f54>
 411d1d4: f9400808     	ldr	x8, [x0, #0x10]
 411d1d8: d63f0100     	blr	x8
 411d1dc: 14000005     	b	0x411d1f0 <_ChromeMain+0x4117f54>
 411d1e0: 7103fd1f     	cmp	w8, #0xff
 411d1e4: 54000060     	b.eq	0x411d1f0 <_ChromeMain+0x4117f54>
 411d1e8: f94002a0     	ldr	x0, [x21]
 411d1ec: b5fffec0     	cbnz	x0, 0x411d1c4 <_ChromeMain+0x4117f28>
 411d1f0: 52801fe8     	mov	w8, #0xff               ; =255
 411d1f4: 3903c2c8     	strb	w8, [x22, #0xf0]
 411d1f8: b40000b5     	cbz	x21, 0x411d20c <_ChromeMain+0x4117f70>
 411d1fc: 52801c88     	mov	w8, #0xe4               ; =228
 411d200: f90076c8     	str	x8, [x22, #0xe8]
 411d204: 3903c2df     	strb	wzr, [x22, #0xf0]
 411d208: 17fffbb8     	b	0x411c0e8 <_ChromeMain+0x4116e4c>
 411d20c: d4200020     	brk	#0x1
 411d210: d4200000     	brk	#0
 411d214: d4400000     	hlt	#0
 411d218: d4200020     	brk	#0x1
 411d21c: d4200000     	brk	#0
 411d220: d4400000     	hlt	#0
 411d224: d4200020     	brk	#0x1
 411d228: d4200000     	brk	#0
 411d22c: d4400000     	hlt	#0
 411d230: d4200020     	brk	#0x1
 411d234: d4200000     	brk	#0
 411d238: d4400000     	hlt	#0
 411d23c: d4200020     	brk	#0x1
 411d240: d4200000     	brk	#0
 411d244: d4400000     	hlt	#0
 411d248: d4200020     	brk	#0x1
 411d24c: d4200000     	brk	#0
 411d250: d4400000     	hlt	#0
 411d254: d4200020     	brk	#0x1
 411d258: d4200000     	brk	#0
 411d25c: d4400000     	hlt	#0
 411d260: d4200020     	brk	#0x1
 411d264: b201f3e8     	mov	x8, #-0x5555555555555556 ; =-6148914691236517206
 411d268: f2e15548     	movk	x8, #0xaaa, lsl #48
 411d26c: eb0802bf     	cmp	x21, x8
 411d270: 54000ac8     	b.hi	0x411d3c8 <_ChromeMain+0x411812c>
 411d274: f9401ff6     	ldr	x22, [sp, #0x38]
 411d278: 52800308     	mov	w8, #0x18               ; =24
 411d27c: 9b085ab7     	madd	x23, x21, x8, x22
 411d280: 8b1506a8     	add	x8, x21, x21, lsl #1
 411d284: d37df100     	lsl	x0, x8, #3
 411d288: 96fbc838     	bl	0xf368 <_ChromeMain+0xa0cc>
 411d28c: a906ffe0     	stp	x0, xzr, [sp, #0x68]
 411d290: f9003ff5     	str	x21, [sp, #0x78]
 411d294: 91006360     	add	x0, x27, #0x18
 411d298: aa1603e1     	mov	x1, x22
 411d29c: aa1703e2     	mov	x2, x23
 411d2a0: aa1503e3     	mov	x3, x21
 411d2a4: 9596d8c7     	bl	0xa6d35c0 <_ChromeMain+0xa6ce324>
 411d2a8: d0fe7857     	adrp	x23, 0x1027000 <_ChromeMain+0x1021d64>
 411d2ac: 912602f7     	add	x23, x23, #0x980
 411d2b0: 17fffc83     	b	0x411c4bc <_ChromeMain+0x4117220>
 411d2b4: b201f3e8     	mov	x8, #-0x5555555555555556 ; =-6148914691236517206
 411d2b8: f2e15548     	movk	x8, #0xaaa, lsl #48
 411d2bc: eb0802bf     	cmp	x21, x8
 411d2c0: 54000848     	b.hi	0x411d3c8 <_ChromeMain+0x411812c>
 411d2c4: 910143fc     	add	x28, sp, #0x50
 411d2c8: f9401ff6     	ldr	x22, [sp, #0x38]
 411d2cc: 52800308     	mov	w8, #0x18               ; =24
 411d2d0: 9b085ab7     	madd	x23, x21, x8, x22
 411d2d4: 8b1506a8     	add	x8, x21, x21, lsl #1
 411d2d8: d37df100     	lsl	x0, x8, #3
 411d2dc: 96fbc823     	bl	0xf368 <_ChromeMain+0xa0cc>
 411d2e0: a906ffe0     	stp	x0, xzr, [sp, #0x68]
 411d2e4: f9003ff5     	str	x21, [sp, #0x78]
 411d2e8: 91006380     	add	x0, x28, #0x18
 411d2ec: aa1603e1     	mov	x1, x22
 411d2f0: aa1703e2     	mov	x2, x23
 411d2f4: aa1503e3     	mov	x3, x21
 411d2f8: 9596d8b2     	bl	0xa6d35c0 <_ChromeMain+0xa6ce324>
 411d2fc: d0fe7857     	adrp	x23, 0x1027000 <_ChromeMain+0x1021d64>
 411d300: 912602f7     	add	x23, x23, #0x980
 411d304: 17fffc94     	b	0x411c554 <_ChromeMain+0x41172b8>
 411d308: bd40fac0     	ldr	s0, [x22, #0xf8]
 411d30c: f004f188     	adrp	x8, 0xdf50000 <dyld_stub_binder+0xdf50000>
 411d310: bd4b3501     	ldr	s1, [x8, #0xb34]
 411d314: 1e212000     	fcmp	s0, s1
 411d318: 54ff6ec1     	b.ne	0x411c0f0 <_ChromeMain+0x4116e54>
 411d31c: 17fffb7a     	b	0x411c104 <_ChromeMain+0x4116e68>
 411d320: d4200000     	brk	#0
 411d324: d4400000     	hlt	#0
 411d328: d4200020     	brk	#0x1
 411d32c: d4200000     	brk	#0
 411d330: d4400000     	hlt	#0
 411d334: d4200020     	brk	#0x1
 411d338: d4200000     	brk	#0
 411d33c: d4400000     	hlt	#0
 411d340: d4200020     	brk	#0x1
 411d344: f9400008     	ldr	x8, [x0]
 411d348: f9400508     	ldr	x8, [x8, #0x8]
 411d34c: d63f0100     	blr	x8
 411d350: f9416675     	ldr	x21, [x19, #0x2c8]
 411d354: 17fffdfc     	b	0x411cb44 <_ChromeMain+0x41178a8>
 411d358: 52803600     	mov	w0, #0x1b0              ; =432
 411d35c: 96fbc803     	bl	0xf368 <_ChromeMain+0xa0cc>
 411d360: aa1303e1     	mov	x1, x19
 411d364: 97372207     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 411d368: 17fffe96     	b	0x411cdc0 <_ChromeMain+0x4117b24>
 411d36c: 52803600     	mov	w0, #0x1b0              ; =432
 411d370: 96fbc7fe     	bl	0xf368 <_ChromeMain+0xa0cc>
 411d374: aa1303e1     	mov	x1, x19
 411d378: 97372202     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 411d37c: 17fffe89     	b	0x411cda0 <_ChromeMain+0x4117b04>
 411d380: f9400109     	ldr	x9, [x8]
 411d384: f9400529     	ldr	x9, [x9, #0x8]
 411d388: aa0803e0     	mov	x0, x8
 411d38c: d63f0120     	blr	x9
 411d390: f9416660     	ldr	x0, [x19, #0x2c8]
 411d394: 17fffde6     	b	0x411cb2c <_ChromeMain+0x4117890>
 411d398: 52803600     	mov	w0, #0x1b0              ; =432
 411d39c: 96fbc7f3     	bl	0xf368 <_ChromeMain+0xa0cc>
 411d3a0: aa0003f5     	mov	x21, x0
 411d3a4: aa1303e1     	mov	x1, x19
 411d3a8: 973721f6     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 411d3ac: 17fffe75     	b	0x411cd80 <_ChromeMain+0x4117ae4>
 411d3b0: 52803600     	mov	w0, #0x1b0              ; =432
 411d3b4: 96fbc7ed     	bl	0xf368 <_ChromeMain+0xa0cc>
 411d3b8: aa0003f7     	mov	x23, x0
 411d3bc: aa1603e1     	mov	x1, x22
 411d3c0: 973721f0     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 411d3c4: 17ffff09     	b	0x411cfe8 <_ChromeMain+0x4117d4c>
 411d3c8: 942a830e     	bl	0x4bbe000 <_ChromeMain+0x4bb8d64>
 411d3cc: f9425c00     	ldr	x0, [x0, #0x4b8]
 411d3d0: b4000080     	cbz	x0, 0x411d3e0 <_ChromeMain+0x4118144>
 411d3d4: f9400008     	ldr	x8, [x0]
 411d3d8: f9402101     	ldr	x1, [x8, #0x40]
 411d3dc: d61f0020     	br	x1
 411d3e0: d4200000     	brk	#0
 411d3e4: d4400000     	hlt	#0
 411d3e8: d4200020     	brk	#0x1
 411d3ec: d10343ff     	sub	sp, sp, #0xd0
 411d3f0: a9076ffc     	stp	x28, x27, [sp, #0x70]
 411d3f4: a90867fa     	stp	x26, x25, [sp, #0x80]
 411d3f8: a9095ff8     	stp	x24, x23, [sp, #0x90]
 411d3fc: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 411d400: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 411d404: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 411d408: 910303fd     	add	x29, sp, #0xc0
 411d40c: aa0003f3     	mov	x19, x0
 411d410: f9425c00     	ldr	x0, [x0, #0x4b8]
 411d414: b40010a0     	cbz	x0, 0x411d628 <_ChromeMain+0x411838c>
 411d418: aa0103f6     	mov	x22, x1
 411d41c: f9400008     	ldr	x8, [x0]
 411d420: f9402508     	ldr	x8, [x8, #0x48]
 411d424: d63f0100     	blr	x8
 411d428: 34000c20     	cbz	w0, 0x411d5ac <_ChromeMain+0x4118310>
 411d42c: f9425e60     	ldr	x0, [x19, #0x4b8]
 411d430: b4001020     	cbz	x0, 0x411d634 <_ChromeMain+0x4118398>
 411d434: f9400008     	ldr	x8, [x0]
 411d438: f9403508     	ldr	x8, [x8, #0x68]
 411d43c: d63f0100     	blr	x8
