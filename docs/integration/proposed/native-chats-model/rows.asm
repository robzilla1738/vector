
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463d314: d104c3ff     	sub	sp, sp, #0x130
 463d318: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 463d31c: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 463d320: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 463d324: a91057f6     	stp	x22, x21, [sp, #0x100]
 463d328: a9114ff4     	stp	x20, x19, [sp, #0x110]
 463d32c: a9127bfd     	stp	x29, x30, [sp, #0x120]
 463d330: 910483fd     	add	x29, sp, #0x120
 463d334: aa0103f4     	mov	x20, x1
 463d338: aa0003f3     	mov	x19, x0
 463d33c: 910e0000     	add	x0, x0, #0x380
 463d340: 9400e201     	bl	0x4675b44 <_ChromeMain+0x46708a8>
 463d344: f9400288     	ldr	x8, [x20]
 463d348: f901c268     	str	x8, [x19, #0x380]
 463d34c: f9400688     	ldr	x8, [x20, #0x8]
 463d350: f901c668     	str	x8, [x19, #0x388]
 463d354: f9400a88     	ldr	x8, [x20, #0x10]
 463d358: f901ca68     	str	x8, [x19, #0x390]
 463d35c: a9007e9f     	stp	xzr, xzr, [x20]
 463d360: f9000a9f     	str	xzr, [x20, #0x10]
 463d364: f941ba60     	ldr	x0, [x19, #0x370]
 463d368: 9760506c     	bl	0x1e51518 <_ChromeMain+0x1e4c27c>
 463d36c: f941ce74     	ldr	x20, [x19, #0x398]
 463d370: f941d268     	ldr	x8, [x19, #0x3a0]
 463d374: d37df109     	lsl	x9, x8, #3
 463d378: b0052bb8     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 463d37c: b4000249     	cbz	x9, 0x463d3c4 <_ChromeMain+0x4638128>
 463d380: 8b140129     	add	x9, x9, x20
 463d384: d1002136     	sub	x22, x9, #0x8
 463d388: cb080ff5     	neg	x21, x8, lsl #3
 463d38c: 14000006     	b	0x463d3a4 <_ChromeMain+0x4638108>
 463d390: 96e7a5ad     	bl	0x26a44 <_ChromeMain+0x217a8>
 463d394: f90002df     	str	xzr, [x22]
 463d398: aa1703f6     	mov	x22, x23
 463d39c: b10022b5     	adds	x21, x21, #0x8
 463d3a0: 54000160     	b.eq	0x463d3cc <_ChromeMain+0x4638130>
 463d3a4: b40016b6     	cbz	x22, 0x463d678 <_ChromeMain+0x46383dc>
 463d3a8: aa1603f7     	mov	x23, x22
 463d3ac: f85f86e0     	ldr	x0, [x23], #-0x8
 463d3b0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 463d3b4: f9404709     	ldr	x9, [x24, #0x88]
 463d3b8: eb09011f     	cmp	x8, x9
 463d3bc: 54fffec1     	b.ne	0x463d394 <_ChromeMain+0x46380f8>
 463d3c0: 17fffff4     	b	0x463d390 <_ChromeMain+0x46380f4>
 463d3c4: aa1403e8     	mov	x8, x20
 463d3c8: 14000003     	b	0x463d3d4 <_ChromeMain+0x4638138>
 463d3cc: 910e6268     	add	x8, x19, #0x398
 463d3d0: f9400108     	ldr	x8, [x8]
 463d3d4: cb080288     	sub	x8, x20, x8
 463d3d8: 9343fd08     	asr	x8, x8, #3
 463d3dc: f901d268     	str	x8, [x19, #0x3a0]
 463d3e0: f941c668     	ldr	x8, [x19, #0x388]
 463d3e4: b4002068     	cbz	x8, 0x463d7f0 <_ChromeMain+0x4638554>
 463d3e8: d280001a     	mov	x26, #0x0               ; =0
 463d3ec: d280001b     	mov	x27, #0x0               ; =0
 463d3f0: 910043fc     	add	x28, sp, #0x10
 463d3f4: 52800036     	mov	w22, #0x1               ; =1
 463d3f8: 90051e54     	adrp	x20, 0xea05000 <dyld_stub_binder+0xea05000>
 463d3fc: 91122294     	add	x20, x20, #0x488
 463d400: 14000081     	b	0x463d604 <_ChromeMain+0x4638368>
 463d404: b83600a8     	ldadd	w22, w8, [x5]
 463d408: 7100011f     	cmp	w8, #0x0
 463d40c: 540023ad     	b.le	0x463d880 <_ChromeMain+0x46385e4>
 463d410: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463d414: 6b09011f     	cmp	w8, w9
 463d418: 540023a0     	b.eq	0x463d88c <_ChromeMain+0x46385f0>
 463d41c: 1400002f     	b	0x463d4d8 <_ChromeMain+0x463823c>
 463d420: b8360088     	ldadd	w22, w8, [x4]
 463d424: 7100011f     	cmp	w8, #0x0
 463d428: 5400220d     	b.le	0x463d868 <_ChromeMain+0x46385cc>
 463d42c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463d430: 6b09011f     	cmp	w8, w9
 463d434: 54002200     	b.eq	0x463d874 <_ChromeMain+0x46385d8>
 463d438: 14000026     	b	0x463d4d0 <_ChromeMain+0x4638234>
 463d43c: b8360068     	ldadd	w22, w8, [x3]
 463d440: 7100011f     	cmp	w8, #0x0
 463d444: 5400206d     	b.le	0x463d850 <_ChromeMain+0x46385b4>
 463d448: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463d44c: 6b09011f     	cmp	w8, w9
 463d450: 54002060     	b.eq	0x463d85c <_ChromeMain+0x46385c0>
 463d454: 1400001d     	b	0x463d4c8 <_ChromeMain+0x463822c>
 463d458: b8360048     	ldadd	w22, w8, [x2]
 463d45c: 7100011f     	cmp	w8, #0x0
 463d460: 54001ecd     	b.le	0x463d838 <_ChromeMain+0x463859c>
 463d464: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463d468: 6b09011f     	cmp	w8, w9
 463d46c: 54001ec0     	b.eq	0x463d844 <_ChromeMain+0x46385a8>
 463d470: 14000014     	b	0x463d4c0 <_ChromeMain+0x4638224>
 463d474: 3cc18100     	ldur	q0, [x8, #0x18]
 463d478: f8428108     	ldur	x8, [x8, #0x28]
 463d47c: f8028388     	stur	x8, [x28, #0x28]
 463d480: 3c818380     	stur	q0, [x28, #0x18]
 463d484: 8b1a02e8     	add	x8, x23, x26
 463d488: b9403109     	ldr	w9, [x8, #0x30]
 463d48c: 7940690a     	ldrh	w10, [x8, #0x34]
 463d490: 7803438a     	sturh	w10, [x28, #0x34]
 463d494: b8030389     	stur	w9, [x28, #0x30]
 463d498: 390123ff     	strb	wzr, [sp, #0x48]
 463d49c: 390303ff     	strb	wzr, [sp, #0xc0]
 463d4a0: 3942c109     	ldrb	w9, [x8, #0xb0]
 463d4a4: 340000a9     	cbz	w9, 0x463d4b8 <_ChromeMain+0x463821c>
 463d4a8: 9100e380     	add	x0, x28, #0x38
 463d4ac: 9100e101     	add	x1, x8, #0x38
 463d4b0: 97ffb634     	bl	0x462ad80 <_ChromeMain+0x4625ae4>
 463d4b4: 390303f6     	strb	w22, [sp, #0xc0]
 463d4b8: f9419662     	ldr	x2, [x19, #0x328]
 463d4bc: b5fffce2     	cbnz	x2, 0x463d458 <_ChromeMain+0x46381bc>
 463d4c0: f9419a63     	ldr	x3, [x19, #0x330]
 463d4c4: b5fffbc3     	cbnz	x3, 0x463d43c <_ChromeMain+0x46381a0>
 463d4c8: f9419e64     	ldr	x4, [x19, #0x338]
 463d4cc: b5fffaa4     	cbnz	x4, 0x463d420 <_ChromeMain+0x4638184>
 463d4d0: f941a265     	ldr	x5, [x19, #0x340]
 463d4d4: b5fff985     	cbnz	x5, 0x463d404 <_ChromeMain+0x4638168>
 463d4d8: 910043e1     	add	x1, sp, #0x10
 463d4dc: aa1503e0     	mov	x0, x21
 463d4e0: 52800006     	mov	w6, #0x0                ; =0
 463d4e4: 9400d023     	bl	0x4671570 <_ChromeMain+0x466c2d4>
 463d4e8: 394303e8     	ldrb	w8, [sp, #0xc0]
 463d4ec: 36000068     	tbz	w8, #0x0, 0x463d4f8 <_ChromeMain+0x463825c>
 463d4f0: 9100e380     	add	x0, x28, #0x38
 463d4f4: 97ffb6eb     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 463d4f8: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 463d4fc: 36f800a8     	tbz	w8, #0x1f, 0x463d510 <_ChromeMain+0x4638274>
 463d500: f94017e0     	ldr	x0, [sp, #0x28]
 463d504: f9401fe8     	ldr	x8, [sp, #0x38]
 463d508: d37ff901     	lsl	x1, x8, #1
 463d50c: 96e72e6b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463d510: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 463d514: 36f800a8     	tbz	w8, #0x1f, 0x463d528 <_ChromeMain+0x463828c>
 463d518: f9400be0     	ldr	x0, [sp, #0x10]
 463d51c: f94013e8     	ldr	x8, [sp, #0x20]
 463d520: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463d524: 96e72e65     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463d528: f100037f     	cmp	x27, #0x0
 463d52c: 52800048     	mov	w8, #0x2                ; =2
 463d530: 9a8803e8     	csel	x8, xzr, x8, eq
 463d534: a9017fe8     	stp	x8, xzr, [sp, #0x10]
 463d538: 910362a0     	add	x0, x21, #0xd8
 463d53c: 910043e2     	add	x2, sp, #0x10
 463d540: aa1403e1     	mov	x1, x20
 463d544: 9752c247     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 463d548: 3945a6a8     	ldrb	w8, [x21, #0x169]
 463d54c: 35001708     	cbnz	w8, 0x463d82c <_ChromeMain+0x4638590>
 463d550: f941ba60     	ldr	x0, [x19, #0x370]
 463d554: f940cc02     	ldr	x2, [x0, #0x198]
 463d558: aa1503e1     	mov	x1, x21
 463d55c: 9704efa8     	bl	0x7793fc <_ChromeMain+0x774160>
 463d560: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 463d564: f9404709     	ldr	x9, [x24, #0x88]
 463d568: eb09011f     	cmp	x8, x9
 463d56c: 54000061     	b.ne	0x463d578 <_ChromeMain+0x46382dc>
 463d570: aa1503e0     	mov	x0, x21
 463d574: 96e75b62     	bl	0x142fc <_ChromeMain+0xf060>
 463d578: f941ce68     	ldr	x8, [x19, #0x398]
 463d57c: f941d269     	ldr	x9, [x19, #0x3a0]
 463d580: 8b090d08     	add	x8, x8, x9, lsl #3
 463d584: a90023f5     	stp	x21, x8, [sp]
 463d588: f941d66a     	ldr	x10, [x19, #0x3a8]
 463d58c: 910023eb     	add	x11, sp, #0x8
 463d590: f9000beb     	str	x11, [sp, #0x10]
 463d594: 910003eb     	mov	x11, sp
 463d598: f9000feb     	str	x11, [sp, #0x18]
 463d59c: 910e626b     	add	x11, x19, #0x398
 463d5a0: f90013eb     	str	x11, [sp, #0x20]
 463d5a4: eb0a013f     	cmp	x9, x10
 463d5a8: 54001380     	b.eq	0x463d818 <_ChromeMain+0x463857c>
 463d5ac: b4000668     	cbz	x8, 0x463d678 <_ChromeMain+0x46383dc>
 463d5b0: f9000115     	str	x21, [x8]
 463d5b4: f94007e8     	ldr	x8, [sp, #0x8]
 463d5b8: 91002108     	add	x8, x8, #0x8
 463d5bc: a90023ff     	stp	xzr, x8, [sp]
 463d5c0: f94007e8     	ldr	x8, [sp, #0x8]
 463d5c4: f941ce69     	ldr	x9, [x19, #0x398]
 463d5c8: eb090108     	subs	x8, x8, x9
 463d5cc: 9343fd08     	asr	x8, x8, #3
 463d5d0: f901d268     	str	x8, [x19, #0x3a0]
 463d5d4: 54000520     	b.eq	0x463d678 <_ChromeMain+0x46383dc>
 463d5d8: f94003e0     	ldr	x0, [sp]
 463d5dc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 463d5e0: f9404709     	ldr	x9, [x24, #0x88]
 463d5e4: eb09011f     	cmp	x8, x9
 463d5e8: 54000041     	b.ne	0x463d5f0 <_ChromeMain+0x4638354>
 463d5ec: 96e7a516     	bl	0x26a44 <_ChromeMain+0x217a8>
 463d5f0: 9100077b     	add	x27, x27, #0x1
 463d5f4: f941c668     	ldr	x8, [x19, #0x388]
 463d5f8: 9102e35a     	add	x26, x26, #0xb8
 463d5fc: eb08037f     	cmp	x27, x8
 463d600: 540004c2     	b.hs	0x463d698 <_ChromeMain+0x46383fc>
 463d604: 910e0268     	add	x8, x19, #0x380
 463d608: f9400117     	ldr	x23, [x8]
 463d60c: b0054668     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 463d610: 91120108     	add	x8, x8, #0x480
 463d614: f8bfc100     	ldapr	x0, [x8]
 463d618: b4001060     	cbz	x0, 0x463d824 <_ChromeMain+0x4638588>
 463d61c: 8b1a02f9     	add	x25, x23, x26
 463d620: 5280be01     	mov	w1, #0x5f0              ; =1520
 463d624: d2800002     	mov	x2, #0x0                ; =0
 463d628: 96e9b7e2     	bl	0xab5b0 <_ChromeMain+0xa6314>
 463d62c: aa0003f5     	mov	x21, x0
 463d630: 39c05f28     	ldrsb	w8, [x25, #0x17]
 463d634: 37f80188     	tbnz	w8, #0x1f, 0x463d664 <_ChromeMain+0x46383c8>
 463d638: 3dc00320     	ldr	q0, [x25]
 463d63c: f9400b28     	ldr	x8, [x25, #0x10]
 463d640: f90013e8     	str	x8, [sp, #0x20]
 463d644: 3d8007e0     	str	q0, [sp, #0x10]
 463d648: 8b1a02e8     	add	x8, x23, x26
 463d64c: 39c0bd09     	ldrsb	w9, [x8, #0x2f]
 463d650: 36fff129     	tbz	w9, #0x1f, 0x463d474 <_ChromeMain+0x46381d8>
 463d654: a9418901     	ldp	x1, x2, [x8, #0x18]
 463d658: 91006380     	add	x0, x28, #0x18
 463d65c: 96e8255d     	bl	0x46bd0 <_ChromeMain+0x41934>
 463d660: 17ffff89     	b	0x463d484 <_ChromeMain+0x46381e8>
 463d664: 8b1a02e8     	add	x8, x23, x26
 463d668: a9400901     	ldp	x1, x2, [x8]
 463d66c: 910043e0     	add	x0, sp, #0x10
 463d670: 96e76aea     	bl	0x18218 <_ChromeMain+0x12f7c>
 463d674: 17fffff5     	b	0x463d648 <_ChromeMain+0x46383ac>
 463d678: d4200020     	brk	#0x1
 463d67c: b8280128     	ldadd	w8, w8, [x9]
 463d680: 7100011f     	cmp	w8, #0x0
 463d684: 540011ad     	b.le	0x463d8b8 <_ChromeMain+0x463861c>
 463d688: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463d68c: 6b09011f     	cmp	w8, w9
 463d690: 540011a0     	b.eq	0x463d8c4 <_ChromeMain+0x4638628>
 463d694: 1400001e     	b	0x463d70c <_ChromeMain+0x4638470>
 463d698: b4000ac8     	cbz	x8, 0x463d7f0 <_ChromeMain+0x4638554>
 463d69c: 390033ff     	strb	wzr, [sp, #0xc]
 463d6a0: b9000bff     	str	wzr, [sp, #0x8]
 463d6a4: d0054688     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
 463d6a8: f946f500     	ldr	x0, [x8, #0xde8]
 463d6ac: b4000fa0     	cbz	x0, 0x463d8a0 <_ChromeMain+0x4638604>
 463d6b0: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 463d6b4: f90013ff     	str	xzr, [sp, #0x20]
 463d6b8: 910043e8     	add	x8, sp, #0x10
 463d6bc: 528585e1     	mov	w1, #0x2c2f             ; =11311
 463d6c0: 9731dc07     	bl	0x12b46dc <_ChromeMain+0x12af440>
 463d6c4: a9415ff6     	ldp	x22, x23, [sp, #0x10]
 463d6c8: f94013f8     	ldr	x24, [sp, #0x20]
 463d6cc: 52800600     	mov	w0, #0x30               ; =48
 463d6d0: 96e74726     	bl	0xf368 <_ChromeMain+0xa0cc>
 463d6d4: aa0003f5     	mov	x21, x0
 463d6d8: 52800028     	mov	w8, #0x1                ; =1
 463d6dc: b9000008     	str	w8, [x0]
 463d6e0: 101c03a9     	adr	x9, 0x4675754 <_ChromeMain+0x46704b8>
 463d6e4: d503201f     	nop
 463d6e8: b0ffcb0a     	adrp	x10, 0x3f9e000 <_ChromeMain+0x3f98d64>
 463d6ec: 9113014a     	add	x10, x10, #0x4c0
 463d6f0: a900a809     	stp	x9, x10, [x0, #0x8]
 463d6f4: 90fef909     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 463d6f8: 912c0129     	add	x9, x9, #0xb00
 463d6fc: f9000c09     	str	x9, [x0, #0x18]
 463d700: f941aa69     	ldr	x9, [x19, #0x350]
 463d704: f9001409     	str	x9, [x0, #0x28]
 463d708: b5fffba9     	cbnz	x9, 0x463d67c <_ChromeMain+0x46383e0>
 463d70c: b0054668     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 463d710: 91120108     	add	x8, x8, #0x480
 463d714: f8bfc100     	ldapr	x0, [x8]
 463d718: b4000c00     	cbz	x0, 0x463d898 <_ChromeMain+0x46385fc>
 463d71c: 5280be01     	mov	w1, #0x5f0              ; =1520
 463d720: d2800002     	mov	x2, #0x0                ; =0
 463d724: 96e9b7a3     	bl	0xab5b0 <_ChromeMain+0xa6314>
 463d728: aa0003f4     	mov	x20, x0
 463d72c: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 463d730: a9025bff     	stp	xzr, x22, [sp, #0x20]
 463d734: a90363f7     	stp	x23, x24, [sp, #0x30]
 463d738: b9400be8     	ldr	w8, [sp, #0x8]
 463d73c: b90043e8     	str	w8, [sp, #0x40]
 463d740: 394033e8     	ldrb	w8, [sp, #0xc]
 463d744: 390113e8     	strb	w8, [sp, #0x44]
 463d748: 52800028     	mov	w8, #0x1                ; =1
 463d74c: 390117e8     	strb	w8, [sp, #0x45]
 463d750: 910043f6     	add	x22, sp, #0x10
 463d754: 390123ff     	strb	wzr, [sp, #0x48]
 463d758: 390303ff     	strb	wzr, [sp, #0xc0]
 463d75c: 910043e1     	add	x1, sp, #0x10
 463d760: aa1503e2     	mov	x2, x21
 463d764: d2800003     	mov	x3, #0x0                ; =0
 463d768: d2800004     	mov	x4, #0x0                ; =0
 463d76c: d2800005     	mov	x5, #0x0                ; =0
 463d770: 52800026     	mov	w6, #0x1                ; =1
 463d774: 9400cf7f     	bl	0x4671570 <_ChromeMain+0x466c2d4>
 463d778: 394303e8     	ldrb	w8, [sp, #0xc0]
 463d77c: 34000068     	cbz	w8, 0x463d788 <_ChromeMain+0x46384ec>
 463d780: 9100e2c0     	add	x0, x22, #0x38
 463d784: 97ffb647     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 463d788: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 463d78c: 36f800a8     	tbz	w8, #0x1f, 0x463d7a0 <_ChromeMain+0x4638504>
 463d790: f94017e0     	ldr	x0, [sp, #0x28]
 463d794: f9401fe8     	ldr	x8, [sp, #0x38]
 463d798: d37ff901     	lsl	x1, x8, #1
 463d79c: 96e72dc7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463d7a0: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 463d7a4: 36f800a8     	tbz	w8, #0x1f, 0x463d7b8 <_ChromeMain+0x463851c>
 463d7a8: f9400be0     	ldr	x0, [sp, #0x10]
 463d7ac: f94013e8     	ldr	x8, [sp, #0x20]
 463d7b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463d7b4: 96e72dc1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463d7b8: b004c7e8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 463d7bc: 3dc38d00     	ldr	q0, [x8, #0xe30]
 463d7c0: 3d8007e0     	str	q0, [sp, #0x10]
 463d7c4: 90051e41     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 463d7c8: 91122021     	add	x1, x1, #0x488
 463d7cc: 91036280     	add	x0, x20, #0xd8
 463d7d0: 910043e2     	add	x2, sp, #0x10
 463d7d4: 9752c1a3     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 463d7d8: 3945a688     	ldrb	w8, [x20, #0x169]
 463d7dc: 35000688     	cbnz	w8, 0x463d8ac <_ChromeMain+0x4638610>
 463d7e0: f941ba60     	ldr	x0, [x19, #0x370]
 463d7e4: f940cc02     	ldr	x2, [x0, #0x198]
 463d7e8: aa1403e1     	mov	x1, x20
 463d7ec: 9704ef04     	bl	0x7793fc <_ChromeMain+0x774160>
 463d7f0: aa1303e0     	mov	x0, x19
 463d7f4: 9400a793     	bl	0x4667640 <_ChromeMain+0x46623a4>
 463d7f8: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 463d7fc: a9514ff4     	ldp	x20, x19, [sp, #0x110]
 463d800: a95057f6     	ldp	x22, x21, [sp, #0x100]
 463d804: a94f5ff8     	ldp	x24, x23, [sp, #0xf0]
 463d808: a94e67fa     	ldp	x26, x25, [sp, #0xe0]
 463d80c: a94d6ffc     	ldp	x28, x27, [sp, #0xd0]
 463d810: 9104c3ff     	add	sp, sp, #0x130
 463d814: d65f03c0     	ret
 463d818: 910043e0     	add	x0, sp, #0x10
 463d81c: 9400df79     	bl	0x4675600 <_ChromeMain+0x4670364>
 463d820: 17ffff68     	b	0x463d5c0 <_ChromeMain+0x4638324>
 463d824: 97f257b5     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 463d828: 17ffff7d     	b	0x463d61c <_ChromeMain+0x4638380>
 463d82c: d4200000     	brk	#0
 463d830: d4400000     	hlt	#0
 463d834: d4200020     	brk	#0x1
 463d838: d4200000     	brk	#0
 463d83c: d4400000     	hlt	#0
 463d840: d4200020     	brk	#0x1
 463d844: d4200000     	brk	#0
 463d848: d4400000     	hlt	#0
 463d84c: d4200020     	brk	#0x1
 463d850: d4200000     	brk	#0
 463d854: d4400000     	hlt	#0
 463d858: d4200020     	brk	#0x1
 463d85c: d4200000     	brk	#0
 463d860: d4400000     	hlt	#0
 463d864: d4200020     	brk	#0x1
 463d868: d4200000     	brk	#0
 463d86c: d4400000     	hlt	#0
 463d870: d4200020     	brk	#0x1
 463d874: d4200000     	brk	#0
 463d878: d4400000     	hlt	#0
 463d87c: d4200020     	brk	#0x1
 463d880: d4200000     	brk	#0
 463d884: d4400000     	hlt	#0
 463d888: d4200020     	brk	#0x1
 463d88c: d4200000     	brk	#0
 463d890: d4400000     	hlt	#0
 463d894: d4200020     	brk	#0x1
 463d898: 97f25798     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 463d89c: 17ffffa0     	b	0x463d71c <_ChromeMain+0x4638480>
 463d8a0: d4200000     	brk	#0
 463d8a4: d4400000     	hlt	#0
 463d8a8: d4200020     	brk	#0x1
 463d8ac: d4200000     	brk	#0
 463d8b0: d4400000     	hlt	#0
 463d8b4: d4200020     	brk	#0x1
 463d8b8: d4200000     	brk	#0
 463d8bc: d4400000     	hlt	#0
 463d8c0: d4200020     	brk	#0x1
 463d8c4: d4200000     	brk	#0
 463d8c8: d4400000     	hlt	#0
 463d8cc: d4200020     	brk	#0x1
