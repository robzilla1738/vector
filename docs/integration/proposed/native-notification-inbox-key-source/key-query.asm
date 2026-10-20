
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40da744: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 40da748: a90167fa     	stp	x26, x25, [sp, #0x10]
 40da74c: a9025ff8     	stp	x24, x23, [sp, #0x20]
 40da750: a90357f6     	stp	x22, x21, [sp, #0x30]
 40da754: a9044ff4     	stp	x20, x19, [sp, #0x40]
 40da758: a9057bfd     	stp	x29, x30, [sp, #0x50]
 40da75c: 910143fd     	add	x29, sp, #0x50
 40da760: d10683ff     	sub	sp, sp, #0x1a0
 40da764: b90027e6     	str	w6, [sp, #0x24]
 40da768: a90097e8     	stp	x8, x5, [sp, #0x8]
 40da76c: f90003e4     	str	x4, [sp]
 40da770: aa0303f3     	mov	x19, x3
 40da774: aa0203f4     	mov	x20, x2
 40da778: aa0103f5     	mov	x21, x1
 40da77c: aa0003f6     	mov	x22, x0
 40da780: d004fa68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 40da784: f940f908     	ldr	x8, [x8, #0x1f0]
 40da788: f9400108     	ldr	x8, [x8]
 40da78c: f81a03a8     	stur	x8, [x29, #-0x60]
 40da790: f9001bff     	str	xzr, [sp, #0x30]
 40da794: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40da798: f9476108     	ldr	x8, [x8, #0xec0]
 40da79c: f9400100     	ldr	x0, [x8]
 40da7a0: 94fca3f2     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40da7a4: f9000fe0     	str	x0, [sp, #0x18]
 40da7a8: f81783a0     	stur	x0, [x29, #-0x88]
 40da7ac: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40da7b0: f9475d08     	ldr	x8, [x8, #0xeb8]
 40da7b4: f9400119     	ldr	x25, [x8]
 40da7b8: aa1903e0     	mov	x0, x25
 40da7bc: 94fca3eb     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40da7c0: f9001ff9     	str	x25, [sp, #0x38]
 40da7c4: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40da7c8: f9475908     	ldr	x8, [x8, #0xeb0]
 40da7cc: f940011a     	ldr	x26, [x8]
 40da7d0: aa1a03e0     	mov	x0, x26
 40da7d4: 94fca3e5     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40da7d8: f81803ba     	stur	x26, [x29, #-0x80]
 40da7dc: aa1603e0     	mov	x0, x22
 40da7e0: aa1503e1     	mov	x1, x21
 40da7e4: 9796824a     	bl	0x267b10c <_ChromeMain+0x2675e70>
 40da7e8: 94fca3d4     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 40da7ec: f90017e0     	str	x0, [sp, #0x28]
 40da7f0: f94017e8     	ldr	x8, [sp, #0x28]
 40da7f4: f90023e8     	str	x8, [sp, #0x40]
 40da7f8: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40da7fc: f9475508     	ldr	x8, [x8, #0xea8]
 40da800: f940011c     	ldr	x28, [x8]
 40da804: aa1c03e0     	mov	x0, x28
 40da808: 94fca3d8     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40da80c: f81883bc     	stur	x28, [x29, #-0x78]
 40da810: aa1403e0     	mov	x0, x20
 40da814: aa1303e1     	mov	x1, x19
 40da818: 9796823d     	bl	0x267b10c <_ChromeMain+0x2675e70>
 40da81c: 94fca3c7     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 40da820: aa0003f5     	mov	x21, x0
 40da824: f90027e0     	str	x0, [sp, #0x48]
 40da828: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40da82c: f9475108     	ldr	x8, [x8, #0xea0]
 40da830: f9400113     	ldr	x19, [x8]
 40da834: aa1303e0     	mov	x0, x19
 40da838: 94fca3cc     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40da83c: f81903b3     	stur	x19, [x29, #-0x70]
 40da840: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40da844: f9474d08     	ldr	x8, [x8, #0xe98]
 40da848: f9400116     	ldr	x22, [x8]
 40da84c: aa1603e0     	mov	x0, x22
 40da850: 94fca3c6     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40da854: f9002bf6     	str	x22, [sp, #0x50]
 40da858: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40da85c: f9474908     	ldr	x8, [x8, #0xe90]
 40da860: f9400114     	ldr	x20, [x8]
 40da864: aa1403e0     	mov	x0, x20
 40da868: 94fca3c0     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40da86c: f81983b4     	stur	x20, [x29, #-0x68]
 40da870: f0056088     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 40da874: f9458100     	ldr	x0, [x8, #0xb00]
 40da878: 952b3fd0     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 40da87c: aa0003fb     	mov	x27, x0
 40da880: 52800022     	mov	w2, #0x1                ; =1
 40da884: 95fffc9e     	bl	0xc0d9afc <_ChromeMain+0xc0d4860>
 40da888: f9002ffb     	str	x27, [sp, #0x58]
 40da88c: f0056088     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 40da890: f9435d00     	ldr	x0, [x8, #0x6b8]
 40da894: 9100e3e2     	add	x2, sp, #0x38
 40da898: d10223a3     	sub	x3, x29, #0x88
 40da89c: 528000a4     	mov	w4, #0x5                ; =5
 40da8a0: 9538db79     	bl	0x8f11684 <_ChromeMain+0x8f0c3e8>
 40da8a4: 94fca3a5     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 40da8a8: aa0003f7     	mov	x23, x0
 40da8ac: 95c4928e     	bl	0xb1ff2e4 <_ChromeMain+0xb1fa048>
 40da8b0: aa0003f8     	mov	x24, x0
 40da8b4: aa1703e0     	mov	x0, x23
 40da8b8: 94fca3a9     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da8bc: aa1b03e0     	mov	x0, x27
 40da8c0: 94fca3a7     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da8c4: aa1403e0     	mov	x0, x20
 40da8c8: 94fca3a5     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da8cc: aa1603e0     	mov	x0, x22
 40da8d0: 94fca3a3     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da8d4: aa1303e0     	mov	x0, x19
 40da8d8: 94fca3a1     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da8dc: aa1503e0     	mov	x0, x21
 40da8e0: 94fca39f     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da8e4: aa1c03e0     	mov	x0, x28
 40da8e8: 94fca39d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da8ec: f94017e0     	ldr	x0, [sp, #0x28]
 40da8f0: 94fca39b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da8f4: aa1a03e0     	mov	x0, x26
 40da8f8: 94fca399     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da8fc: aa1903e0     	mov	x0, x25
 40da900: 94fca397     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da904: f9400fe0     	ldr	x0, [sp, #0x18]
 40da908: 94fca395     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da90c: b94027e8     	ldr	w8, [sp, #0x24]
 40da910: 340001a8     	cbz	w8, 0x40da944 <_ChromeMain+0x40d56a8>
 40da914: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40da918: f9474508     	ldr	x8, [x8, #0xe88]
 40da91c: f9400113     	ldr	x19, [x8]
 40da920: aa1303e0     	mov	x0, x19
 40da924: 94fca391     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40da928: d004fa62     	adrp	x2, 0xe028000 <dyld_stub_binder+0xe028000>
 40da92c: f945cc42     	ldr	x2, [x2, #0xb98]
 40da930: aa1803e0     	mov	x0, x24
 40da934: aa1303e3     	mov	x3, x19
 40da938: 9557f381     	bl	0x96d773c <_ChromeMain+0x96d24a0>
 40da93c: aa1303e0     	mov	x0, x19
 40da940: 94fca387     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da944: f9400be1     	ldr	x1, [sp, #0x10]
 40da948: b4000241     	cbz	x1, 0x40da990 <_ChromeMain+0x40d56f4>
 40da94c: f94003e0     	ldr	x0, [sp]
 40da950: 979681ef     	bl	0x267b10c <_ChromeMain+0x2675e70>
 40da954: 94fca379     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 40da958: aa0003f3     	mov	x19, x0
 40da95c: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40da960: f9474108     	ldr	x8, [x8, #0xe80]
 40da964: f9400114     	ldr	x20, [x8]
 40da968: aa1403e0     	mov	x0, x20
 40da96c: 94fca37f     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40da970: aa1803e0     	mov	x0, x24
 40da974: aa1303e2     	mov	x2, x19
 40da978: aa1403e3     	mov	x3, x20
 40da97c: 9557f370     	bl	0x96d773c <_ChromeMain+0x96d24a0>
 40da980: aa1403e0     	mov	x0, x20
 40da984: 94fca376     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da988: aa1303e0     	mov	x0, x19
 40da98c: 94fca374     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da990: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40da994: f9473d08     	ldr	x8, [x8, #0xe78]
 40da998: f9400113     	ldr	x19, [x8]
 40da99c: aa1303e0     	mov	x0, x19
 40da9a0: 94fca372     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40da9a4: d004fa62     	adrp	x2, 0xe028000 <dyld_stub_binder+0xe028000>
 40da9a8: f945cc42     	ldr	x2, [x2, #0xb98]
 40da9ac: aa1803e0     	mov	x0, x24
 40da9b0: aa1303e3     	mov	x3, x19
 40da9b4: 9557f362     	bl	0x96d773c <_ChromeMain+0x96d24a0>
 40da9b8: aa1303e0     	mov	x0, x19
 40da9bc: 94fca368     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da9c0: f9401be8     	ldr	x8, [sp, #0x30]
 40da9c4: b50017e8     	cbnz	x8, 0x40dacc0 <_ChromeMain+0x40d5a24>
 40da9c8: 9100c3e1     	add	x1, sp, #0x30
 40da9cc: aa1803e0     	mov	x0, x24
 40da9d0: 95a7345f     	bl	0xaaa7b4c <_ChromeMain+0xaaa28b0>
 40da9d4: aa0003f3     	mov	x19, x0
 40da9d8: aa1803e0     	mov	x0, x24
 40da9dc: 94fca360     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40da9e0: 34000b13     	cbz	w19, 0x40dab40 <_ChromeMain+0x40d58a4>
 40da9e4: 128c5a68     	mov	w8, #-0x62d4            ; =-25300
 40da9e8: 6b08027f     	cmp	w19, w8
 40da9ec: 540005c0     	b.eq	0x40daaa4 <_ChromeMain+0x40d5808>
 40da9f0: d0057168     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 40da9f4: b940b108     	ldr	w8, [x8, #0xb0]
 40da9f8: 7100091f     	cmp	w8, #0x2
 40da9fc: 5400026c     	b.gt	0x40daa48 <_ChromeMain+0x40d57ac>
 40daa00: f004cd21     	adrp	x1, 0xda81000 <dyld_stub_binder+0xda81000>
 40daa04: 91023021     	add	x1, x1, #0x8c
 40daa08: 9100e3f4     	add	x20, sp, #0x38
 40daa0c: 9100e3e0     	add	x0, sp, #0x38
 40daa10: 52801282     	mov	w2, #0x94               ; =148
 40daa14: 52800043     	mov	w3, #0x2                ; =2
 40daa18: 951be2f4     	bl	0x87d35e8 <_ChromeMain+0x87ce34c>
 40daa1c: f0050ee8     	adrp	x8, 0xe2b9000 <dyld_stub_binder+0xe2b9000>
 40daa20: 91286108     	add	x8, x8, #0xa18
 40daa24: f9001fe8     	str	x8, [sp, #0x38]
 40daa28: b90167f3     	str	w19, [sp, #0x164]
 40daa2c: f004cd21     	adrp	x1, 0xda81000 <dyld_stub_binder+0xda81000>
 40daa30: 910c8021     	add	x1, x1, #0x320
 40daa34: 91004280     	add	x0, x20, #0x10
 40daa38: 528006a2     	mov	w2, #0x35               ; =53
 40daa3c: 96fd2aa0     	bl	0x254bc <_ChromeMain+0x20220>
 40daa40: 9100e3e0     	add	x0, sp, #0x38
 40daa44: 951cbfba     	bl	0x880a92c <_ChromeMain+0x8805690>
 40daa48: 52800028     	mov	w8, #0x1                ; =1
 40daa4c: f94007f3     	ldr	x19, [sp, #0x8]
 40daa50: 39000268     	strb	w8, [x19]
 40daa54: 52800600     	mov	w0, #0x30               ; =48
 40daa58: 96fcd244     	bl	0xf368 <_ChromeMain+0xa0cc>
 40daa5c: f9000660     	str	x0, [x19, #0x8]
 40daa60: 9004f308     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 40daa64: 3dc2c100     	ldr	q0, [x8, #0xb00]
 40daa68: 3d800660     	str	q0, [x19, #0x10]
 40daa6c: 9100ac09     	add	x9, x0, #0x2b
 40daa70: eb00013f     	cmp	x9, x0
 40daa74: 54001023     	b.lo	0x40dac78 <_ChromeMain+0x40d59dc>
 40daa78: f004cd28     	adrp	x8, 0xda81000 <dyld_stub_binder+0xda81000>
 40daa7c: 910d5908     	add	x8, x8, #0x356
 40daa80: eb08013f     	cmp	x9, x8
 40daa84: fa488002     	ccmp	x0, x8, #0x2, hi
 40daa88: 54000f89     	b.ls	0x40dac78 <_ChromeMain+0x40d59dc>
 40daa8c: ad400500     	ldp	q0, q1, [x8]
 40daa90: ad000400     	stp	q0, q1, [x0]
 40daa94: 3cc1b100     	ldur	q0, [x8, #0x1b]
 40daa98: 3c81b000     	stur	q0, [x0, #0x1b]
 40daa9c: 3900ac1f     	strb	wzr, [x0, #0x2b]
 40daaa0: 14000017     	b	0x40daafc <_ChromeMain+0x40d5860>
 40daaa4: 52800028     	mov	w8, #0x1                ; =1
 40daaa8: f94007f3     	ldr	x19, [sp, #0x8]
 40daaac: 39000268     	strb	w8, [x19]
 40daab0: 52800400     	mov	w0, #0x20               ; =32
 40daab4: 96fcd22d     	bl	0xf368 <_ChromeMain+0xa0cc>
 40daab8: f9000660     	str	x0, [x19, #0x8]
 40daabc: b004f308     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 40daac0: 3dc11900     	ldr	q0, [x8, #0x460]
 40daac4: 3d800660     	str	q0, [x19, #0x10]
 40daac8: 91006009     	add	x9, x0, #0x18
 40daacc: eb00013f     	cmp	x9, x0
 40daad0: 54000d43     	b.lo	0x40dac78 <_ChromeMain+0x40d59dc>
 40daad4: f004cd28     	adrp	x8, 0xda81000 <dyld_stub_binder+0xda81000>
 40daad8: 91089508     	add	x8, x8, #0x225
 40daadc: eb08013f     	cmp	x9, x8
 40daae0: fa488002     	ccmp	x0, x8, #0x2, hi
 40daae4: 54000ca9     	b.ls	0x40dac78 <_ChromeMain+0x40d59dc>
 40daae8: 3dc00100     	ldr	q0, [x8]
 40daaec: 3d800000     	str	q0, [x0]
 40daaf0: f9400908     	ldr	x8, [x8, #0x10]
 40daaf4: f9000808     	str	x8, [x0, #0x10]
 40daaf8: 3900601f     	strb	wzr, [x0, #0x18]
 40daafc: f9401be0     	ldr	x0, [sp, #0x30]
 40dab00: b4000040     	cbz	x0, 0x40dab08 <_ChromeMain+0x40d586c>
 40dab04: 9515c2fe     	bl	0x864b6fc <_ChromeMain+0x8646460>
 40dab08: f85a03a8     	ldur	x8, [x29, #-0x60]
 40dab0c: d004fa69     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 40dab10: f940f929     	ldr	x9, [x9, #0x1f0]
 40dab14: f9400129     	ldr	x9, [x9]
 40dab18: eb08013f     	cmp	x9, x8
 40dab1c: 54000d01     	b.ne	0x40dacbc <_ChromeMain+0x40d5a20>
 40dab20: 910683ff     	add	sp, sp, #0x1a0
 40dab24: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 40dab28: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 40dab2c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 40dab30: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 40dab34: a94167fa     	ldp	x26, x25, [sp, #0x10]
 40dab38: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 40dab3c: d65f03c0     	ret
 40dab40: f9401be8     	ldr	x8, [sp, #0x30]
 40dab44: f9001fe8     	str	x8, [sp, #0x38]
 40dab48: 9100e3e0     	add	x0, sp, #0x38
 40dab4c: 951cbc78     	bl	0x8809d2c <_ChromeMain+0x8804a90>
 40dab50: aa0003f4     	mov	x20, x0
 40dab54: b4000620     	cbz	x0, 0x40dac18 <_ChromeMain+0x40d597c>
 40dab58: aa1403e0     	mov	x0, x20
 40dab5c: 94fca303     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40dab60: 952a09e9     	bl	0x8b5d304 <_ChromeMain+0x8b58068>
 40dab64: 95a73609     	bl	0xaaa8388 <_ChromeMain+0xaaa30ec>
 40dab68: aa0003f3     	mov	x19, x0
 40dab6c: aa1403e0     	mov	x0, x20
 40dab70: 958e8459     	bl	0xa47bcd4 <_ChromeMain+0xa476a38>
 40dab74: aa0003f5     	mov	x21, x0
 40dab78: b5000053     	cbnz	x19, 0x40dab80 <_ChromeMain+0x40d58e4>
 40dab7c: b50007f5     	cbnz	x21, 0x40dac78 <_ChromeMain+0x40d59dc>
 40dab80: 92800208     	mov	x8, #-0x11              ; =-17
 40dab84: f2efffe8     	movk	x8, #0x7fff, lsl #48
 40dab88: eb0802bf     	cmp	x21, x8
 40dab8c: 54000782     	b.hs	0x40dac7c <_ChromeMain+0x40d59e0>
 40dab90: f1005abf     	cmp	x21, #0x16
 40dab94: 54000149     	b.ls	0x40dabbc <_ChromeMain+0x40d5920>
 40dab98: 927ceaa8     	and	x8, x21, #0x7ffffffffffffff0
 40dab9c: 91004117     	add	x23, x8, #0x10
 40daba0: aa1703e0     	mov	x0, x23
 40daba4: 96fcd1f1     	bl	0xf368 <_ChromeMain+0xa0cc>
 40daba8: aa0003f6     	mov	x22, x0
 40dabac: b24102e8     	orr	x8, x23, #0x8000000000000000
 40dabb0: a903d7e0     	stp	x0, x21, [sp, #0x38]
 40dabb4: f90027e8     	str	x8, [sp, #0x48]
 40dabb8: 14000003     	b	0x40dabc4 <_ChromeMain+0x40d5928>
 40dabbc: 39013ff5     	strb	w21, [sp, #0x4f]
 40dabc0: 9100e3f6     	add	x22, sp, #0x38
 40dabc4: 8b1502c8     	add	x8, x22, x21
 40dabc8: eb16011f     	cmp	x8, x22
 40dabcc: 54000563     	b.lo	0x40dac78 <_ChromeMain+0x40d59dc>
 40dabd0: eb16027f     	cmp	x19, x22
 40dabd4: 54000063     	b.lo	0x40dabe0 <_ChromeMain+0x40d5944>
 40dabd8: eb08027f     	cmp	x19, x8
 40dabdc: 540004e3     	b.lo	0x40dac78 <_ChromeMain+0x40d59dc>
 40dabe0: aa1603e0     	mov	x0, x22
 40dabe4: aa1303e1     	mov	x1, x19
 40dabe8: aa1503e2     	mov	x2, x21
 40dabec: 94fcd1b8     	bl	0x800f2cc <_ChromeMain+0x800a030>
 40dabf0: 38356adf     	strb	wzr, [x22, x21]
 40dabf4: f9401fe8     	ldr	x8, [sp, #0x38]
 40dabf8: f94007e9     	ldr	x9, [sp, #0x8]
 40dabfc: 3900013f     	strb	wzr, [x9]
 40dac00: f9000528     	str	x8, [x9, #0x8]
 40dac04: 3cc403e0     	ldur	q0, [sp, #0x40]
 40dac08: 3d800520     	str	q0, [x9, #0x10]
 40dac0c: aa1403e0     	mov	x0, x20
 40dac10: 94fca2d3     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40dac14: 17ffffba     	b	0x40daafc <_ChromeMain+0x40d5860>
 40dac18: 52800028     	mov	w8, #0x1                ; =1
 40dac1c: f94007f3     	ldr	x19, [sp, #0x8]
 40dac20: 39000268     	strb	w8, [x19]
 40dac24: 52800600     	mov	w0, #0x30               ; =48
 40dac28: 96fcd1d0     	bl	0xf368 <_ChromeMain+0xa0cc>
 40dac2c: f9000660     	str	x0, [x19, #0x8]
 40dac30: f004f2e8     	adrp	x8, 0xdf39000 <dyld_stub_binder+0xdf39000>
 40dac34: 3dc25d00     	ldr	q0, [x8, #0x970]
 40dac38: 3d800660     	str	q0, [x19, #0x10]
 40dac3c: 91009009     	add	x9, x0, #0x24
 40dac40: eb00013f     	cmp	x9, x0
 40dac44: 540001a3     	b.lo	0x40dac78 <_ChromeMain+0x40d59dc>
 40dac48: f004cd28     	adrp	x8, 0xda81000 <dyld_stub_binder+0xda81000>
 40dac4c: 910e0908     	add	x8, x8, #0x382
 40dac50: eb08013f     	cmp	x9, x8
 40dac54: fa488002     	ccmp	x0, x8, #0x2, hi
 40dac58: 54000109     	b.ls	0x40dac78 <_ChromeMain+0x40d59dc>
 40dac5c: 528e8c29     	mov	w9, #0x7461             ; =29793
 40dac60: 72a5cc29     	movk	w9, #0x2e61, lsl #16
 40dac64: b9002009     	str	w9, [x0, #0x20]
 40dac68: ad400500     	ldp	q0, q1, [x8]
 40dac6c: ad000400     	stp	q0, q1, [x0]
 40dac70: 3900901f     	strb	wzr, [x0, #0x24]
 40dac74: 17ffffa2     	b	0x40daafc <_ChromeMain+0x40d5860>
 40dac78: d4200020     	brk	#0x1
 40dac7c: 942c95c4     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 40dac80: 17fffffe     	b	0x40dac78 <_ChromeMain+0x40d59dc>
 40dac84: 14000008     	b	0x40daca4 <_ChromeMain+0x40d5a08>
 40dac88: 14000007     	b	0x40daca4 <_ChromeMain+0x40d5a08>
 40dac8c: 14000006     	b	0x40daca4 <_ChromeMain+0x40d5a08>
 40dac90: aa0003f3     	mov	x19, x0
 40dac94: 9100e3e0     	add	x0, sp, #0x38
 40dac98: 951cbf25     	bl	0x880a92c <_ChromeMain+0x8805690>
 40dac9c: 14000003     	b	0x40daca8 <_ChromeMain+0x40d5a0c>
 40daca0: 14000001     	b	0x40daca4 <_ChromeMain+0x40d5a08>
 40daca4: aa0003f3     	mov	x19, x0
 40daca8: f9401be0     	ldr	x0, [sp, #0x30]
 40dacac: b4000040     	cbz	x0, 0x40dacb4 <_ChromeMain+0x40d5a18>
 40dacb0: 9515c293     	bl	0x864b6fc <_ChromeMain+0x8646460>
 40dacb4: aa1303e0     	mov	x0, x19
 40dacb8: 94fca213     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 40dacbc: 94fca5a9     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 40dacc0: d4200000     	brk	#0
 40dacc4: d4400000     	hlt	#0
 40dacc8: d4200020     	brk	#0x1
