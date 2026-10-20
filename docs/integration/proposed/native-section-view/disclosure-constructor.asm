
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4119804: d10203ff     	sub	sp, sp, #0x80
 4119808: a9045ff8     	stp	x24, x23, [sp, #0x40]
 411980c: a90557f6     	stp	x22, x21, [sp, #0x50]
 4119810: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4119814: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4119818: 9101c3fd     	add	x29, sp, #0x70
 411981c: aa0103f5     	mov	x21, x1
 4119820: aa0003f3     	mov	x19, x0
 4119824: 978c4e85     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 4119828: d0052448     	adrp	x8, 0xe5a3000 <dyld_stub_binder+0xe5a3000>
 411982c: 9115c108     	add	x8, x8, #0x570
 4119830: 91152109     	add	x9, x8, #0x548
 4119834: aa0003f4     	mov	x20, x0
 4119838: f80d8e89     	str	x9, [x20, #0xd8]!
 411983c: 9115e109     	add	x9, x8, #0x578
 4119840: aa0003f6     	mov	x22, x0
 4119844: f80f8ec9     	str	x9, [x22, #0xf8]!
 4119848: f901a41f     	str	xzr, [x0, #0x348]
 411984c: 2f06e400     	movi	d0, #0xffff000000000000
 4119850: fd01a800     	str	d0, [x0, #0x350]
 4119854: 52800037     	mov	w23, #0x1               ; =1
 4119858: 390d6017     	strb	w23, [x0, #0x358]
 411985c: f901b01f     	str	xzr, [x0, #0x360]
 4119860: 390da01f     	strb	wzr, [x0, #0x368]
 4119864: f901b81f     	str	xzr, [x0, #0x370]
 4119868: b903781f     	str	wzr, [x0, #0x378]
 411986c: 390df01f     	strb	wzr, [x0, #0x37c]
 4119870: 910e0018     	add	x24, x0, #0x380
 4119874: 91102109     	add	x9, x8, #0x408
 4119878: a9002408     	stp	x8, x9, [x0]
 411987c: 9110c109     	add	x9, x8, #0x430
 4119880: f9000809     	str	x9, [x0, #0x10]
 4119884: 9111a109     	add	x9, x8, #0x468
 4119888: 9112610a     	add	x10, x8, #0x498
 411988c: a906a809     	stp	x9, x10, [x0, #0x68]
 4119890: 9113a109     	add	x9, x8, #0x4e8
 4119894: f9005809     	str	x9, [x0, #0xb0]
 4119898: 91168108     	add	x8, x8, #0x5a0
 411989c: f901c008     	str	x8, [x0, #0x380]
 41198a0: 910e2000     	add	x0, x0, #0x388
 41198a4: 910e0261     	add	x1, x19, #0x380
 41198a8: 52800782     	mov	w2, #0x3c               ; =60
 41198ac: 974954d5     	bl	0x136ec00 <_ChromeMain+0x1369964>
 41198b0: 90050e48     	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 41198b4: 91240108     	add	x8, x8, #0x900
 41198b8: f901c668     	str	x8, [x19, #0x388]
 41198bc: 925e7708     	and	x8, x24, #0xfffffffc00000000
 41198c0: b00554c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41198c4: f9404529     	ldr	x9, [x9, #0x88]
 41198c8: eb09011f     	cmp	x8, x9
 41198cc: 54000061     	b.ne	0x41198d8 <_ChromeMain+0x411463c>
 41198d0: 910e0260     	add	x0, x19, #0x380
 41198d4: 96fbea8a     	bl	0x142fc <_ChromeMain+0xf060>
 41198d8: f901ea78     	str	x24, [x19, #0x3d0]
 41198dc: b903da77     	str	w23, [x19, #0x3d8]
 41198e0: 390f727f     	strb	wzr, [x19, #0x3dc]
 41198e4: 390f827f     	strb	wzr, [x19, #0x3e0]
 41198e8: f901f67f     	str	xzr, [x19, #0x3e8]
 41198ec: f901fe7f     	str	xzr, [x19, #0x3f8]
 41198f0: f901fa7f     	str	xzr, [x19, #0x3f0]
 41198f4: 529a9808     	mov	w8, #0xd4c0             ; =54464
 41198f8: 72a00028     	movk	w8, #0x1, lsl #16
 41198fc: f9020268     	str	x8, [x19, #0x400]
 4119900: d2e7fe08     	mov	x8, #0x3ff0000000000000 ; =4607182418800017408
 4119904: f9020668     	str	x8, [x19, #0x408]
 4119908: 39104275     	strb	w21, [x19, #0x410]
 411990c: 3946a668     	ldrb	w8, [x19, #0x1a9]
 4119910: 340000a8     	cbz	w8, 0x4119924 <_ChromeMain+0x4114688>
 4119914: 3906a67f     	strb	wzr, [x19, #0x1a9]
 4119918: 9106a661     	add	x1, x19, #0x1a9
 411991c: aa1603e0     	mov	x0, x22
 4119920: 973839ac     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4119924: b004f128     	adrp	x8, 0xdf3e000 <dyld_stub_binder+0xdf3e000>
 4119928: 3dc1c100     	ldr	q0, [x8, #0x700]
 411992c: 3d8007e0     	str	q0, [sp, #0x10]
 4119930: 90054761     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4119934: 91122021     	add	x1, x1, #0x488
 4119938: 910043e2     	add	x2, sp, #0x10
 411993c: aa1403e0     	mov	x0, x20
 4119940: 97675148     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4119944: 52801bc8     	mov	w8, #0xde               ; =222
 4119948: b9000be8     	str	w8, [sp, #0x8]
 411994c: 390033ff     	strb	wzr, [sp, #0xc]
 4119950: f00545c0     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4119954: 913d4000     	add	x0, x0, #0xf50
 4119958: 910043e8     	add	x8, sp, #0x10
 411995c: 910023e1     	add	x1, sp, #0x8
 4119960: 52800202     	mov	w2, #0x10               ; =16
 4119964: d2800003     	mov	x3, #0x0                ; =0
 4119968: 97336bee     	bl	0xdf4920 <_ChromeMain+0xdef684>
 411996c: 910043e1     	add	x1, sp, #0x10
 4119970: aa1303e0     	mov	x0, x19
 4119974: 97121dcb     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4119978: 910043e0     	add	x0, sp, #0x10
 411997c: 971cb3b1     	bl	0x846840 <_ChromeMain+0x8415a4>
 4119980: 910c4268     	add	x8, x19, #0x310
 4119984: 394c6269     	ldrb	w9, [x19, #0x318]
 4119988: 35000c69     	cbnz	w9, 0x4119b14 <_ChromeMain+0x4114878>
 411998c: b4000c28     	cbz	x8, 0x4119b10 <_ChromeMain+0x4114874>
 4119990: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 4119994: f9018a68     	str	x8, [x19, #0x310]
 4119998: 52800028     	mov	w8, #0x1                ; =1
 411999c: 390c6268     	strb	w8, [x19, #0x318]
 41199a0: f940c660     	ldr	x0, [x19, #0x188]
 41199a4: b40000a0     	cbz	x0, 0x41199b8 <_ChromeMain+0x411471c>
 41199a8: f9400008     	ldr	x8, [x0]
 41199ac: f9417d08     	ldr	x8, [x8, #0x2f8]
 41199b0: aa1303e1     	mov	x1, x19
 41199b4: d63f0100     	blr	x8
 41199b8: aa1303e0     	mov	x0, x19
 41199bc: 52800001     	mov	w1, #0x0                ; =0
 41199c0: 97145aad     	bl	0x630474 <_ChromeMain+0x62b1d8>
 41199c4: f9000bf3     	str	x19, [sp, #0x10]
 41199c8: 9104c260     	add	x0, x19, #0x130
 41199cc: 910043e3     	add	x3, sp, #0x10
 41199d0: 52800301     	mov	w1, #0x18               ; =24
 41199d4: 52800022     	mov	w2, #0x1                ; =1
 41199d8: 971e35fe     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 41199dc: aa1303e0     	mov	x0, x19
 41199e0: 9744f442     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 41199e4: aa1303e0     	mov	x0, x19
 41199e8: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 41199ec: 52800022     	mov	w2, #0x1                ; =1
 41199f0: 979ae01c     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 41199f4: f0056f68     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 41199f8: f9401914     	ldr	x20, [x8, #0x30]
 41199fc: b0048861     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 4119a00: 910a4c21     	add	x1, x1, #0x293
 4119a04: aa1403e0     	mov	x0, x20
 4119a08: 97036edd     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 4119a0c: 370007e0     	tbnz	w0, #0x0, 0x4119b08 <_ChromeMain+0x411486c>
 4119a10: b0048861     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 4119a14: 910ac021     	add	x1, x1, #0x2b0
 4119a18: aa1403e0     	mov	x0, x20
 4119a1c: 97036ed8     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 4119a20: 370000e0     	tbnz	w0, #0x0, 0x4119a3c <_ChromeMain+0x41147a0>
 4119a24: f0056fb4     	adrp	x20, 0xef10000 <dyld_stub_binder+0xef10000>
 4119a28: 394ca688     	ldrb	w8, [x20, #0x329]
 4119a2c: 36000668     	tbz	w8, #0x0, 0x4119af8 <_ChromeMain+0x411485c>
 4119a30: f0056fa8     	adrp	x8, 0xef10000 <dyld_stub_binder+0xef10000>
 4119a34: 394ca108     	ldrb	w8, [x8, #0x328]
 4119a38: 37000688     	tbnz	w8, #0x0, 0x4119b08 <_ChromeMain+0x411486c>
 4119a3c: 5297e408     	mov	w8, #0xbf20             ; =48928
 4119a40: 72a00048     	movk	w8, #0x2, lsl #16
 4119a44: f9020268     	str	x8, [x19, #0x400]
 4119a48: 39504268     	ldrb	w8, [x19, #0x410]
 4119a4c: 7100011f     	cmp	w8, #0x0
 4119a50: 6f00e400     	movi.2d	v0, #0000000000000000
 4119a54: 1e6e1001     	fmov	d1, #1.00000000
 4119a58: 1e601c20     	fcsel	d0, d1, d0, ne
 4119a5c: 394f8268     	ldrb	w8, [x19, #0x3e0]
 4119a60: 35000488     	cbnz	w8, 0x4119af0 <_ChromeMain+0x4114854>
 4119a64: fd01fe60     	str	d0, [x19, #0x3f8]
 4119a68: 394e6268     	ldrb	w8, [x19, #0x398]
 4119a6c: 35000108     	cbnz	w8, 0x4119a8c <_ChromeMain+0x41147f0>
 4119a70: aa1303e0     	mov	x0, x19
 4119a74: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4119a78: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4119a7c: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4119a80: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4119a84: 910203ff     	add	sp, sp, #0x80
 4119a88: d65f03c0     	ret
 4119a8c: 390e627f     	strb	wzr, [x19, #0x398]
 4119a90: f941d660     	ldr	x0, [x19, #0x3a8]
 4119a94: 910e2261     	add	x1, x19, #0x388
 4119a98: 977fbf1a     	bl	0x2109700 <_ChromeMain+0x2104464>
 4119a9c: f941c668     	ldr	x8, [x19, #0x388]
 4119aa0: f9401d08     	ldr	x8, [x8, #0x38]
 4119aa4: 910e2260     	add	x0, x19, #0x388
 4119aa8: d63f0100     	blr	x8
 4119aac: f941d268     	ldr	x8, [x19, #0x3a0]
 4119ab0: b4fffe08     	cbz	x8, 0x4119a70 <_ChromeMain+0x41147d4>
 4119ab4: f941c668     	ldr	x8, [x19, #0x388]
 4119ab8: f9402108     	ldr	x8, [x8, #0x40]
 4119abc: 910e2260     	add	x0, x19, #0x388
 4119ac0: d63f0100     	blr	x8
 4119ac4: f941d268     	ldr	x8, [x19, #0x3a0]
 4119ac8: f9400109     	ldr	x9, [x8]
 4119acc: 7100001f     	cmp	w0, #0x0
 4119ad0: 5280020a     	mov	w10, #0x10              ; =16
 4119ad4: 5280040b     	mov	w11, #0x20              ; =32
 4119ad8: 9a8a116a     	csel	x10, x11, x10, ne
 4119adc: f86a6929     	ldr	x9, [x9, x10]
 4119ae0: 910e2261     	add	x1, x19, #0x388
 4119ae4: aa0803e0     	mov	x0, x8
 4119ae8: d63f0120     	blr	x9
 4119aec: 17ffffe1     	b	0x4119a70 <_ChromeMain+0x41147d4>
 4119af0: 390f827f     	strb	wzr, [x19, #0x3e0]
 4119af4: 17ffffdc     	b	0x4119a64 <_ChromeMain+0x41147c8>
 4119af8: 97a0926b     	bl	0x293e4a4 <_ChromeMain+0x2939208>
 4119afc: 394ca688     	ldrb	w8, [x20, #0x329]
 4119b00: 3707f988     	tbnz	w8, #0x0, 0x4119a30 <_ChromeMain+0x4114794>
 4119b04: 942b9a06     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 4119b08: d2800008     	mov	x8, #0x0                ; =0
 4119b0c: 17ffffce     	b	0x4119a44 <_ChromeMain+0x41147a8>
 4119b10: d4200020     	brk	#0x1
 4119b14: b21c03e9     	mov	x9, #0x1000000010       ; =68719476752
 4119b18: f9000109     	str	x9, [x8]
 4119b1c: 17ffffa1     	b	0x41199a0 <_ChromeMain+0x4114704>
