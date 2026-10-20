
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462d5e0: b4000661     	cbz	x1, 0x462d6ac <_ChromeMain+0x4628410>
 462d5e4: d10143ff     	sub	sp, sp, #0x50
 462d5e8: a90257f6     	stp	x22, x21, [sp, #0x20]
 462d5ec: a9034ff4     	stp	x20, x19, [sp, #0x30]
 462d5f0: a9047bfd     	stp	x29, x30, [sp, #0x40]
 462d5f4: 910103fd     	add	x29, sp, #0x40
 462d5f8: aa0003f3     	mov	x19, x0
 462d5fc: f9435408     	ldr	x8, [x0, #0x6a8]
 462d600: b40004e8     	cbz	x8, 0x462d69c <_ChromeMain+0x4628400>
 462d604: aa0103f4     	mov	x20, x1
 462d608: b940f828     	ldr	w8, [x1, #0xf8]
 462d60c: 35000488     	cbnz	w8, 0x462d69c <_ChromeMain+0x4628400>
 462d610: f9435260     	ldr	x0, [x19, #0x6a0]
 462d614: b4000080     	cbz	x0, 0x462d624 <_ChromeMain+0x4628388>
 462d618: f9403281     	ldr	x1, [x20, #0x60]
 462d61c: 97ff97d4     	bl	0x461356c <_ChromeMain+0x460e2d0>
 462d620: b7000480     	tbnz	x0, #0x20, 0x462d6b0 <_ChromeMain+0x4628414>
 462d624: f9435660     	ldr	x0, [x19, #0x6a8]
 462d628: f941a008     	ldr	x8, [x0, #0x340]
 462d62c: b4000068     	cbz	x8, 0x462d638 <_ChromeMain+0x462839c>
 462d630: b940fa88     	ldr	w8, [x20, #0xf8]
 462d634: 34000588     	cbz	w8, 0x462d6e4 <_ChromeMain+0x4628448>
 462d638: f9436660     	ldr	x0, [x19, #0x6c8]
 462d63c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 462d640: b0052c29     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d644: f9404529     	ldr	x9, [x9, #0x88]
 462d648: eb09011f     	cmp	x8, x9
 462d64c: 54000041     	b.ne	0x462d654 <_ChromeMain+0x46283b8>
 462d650: 96e7d4fb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d654: f903667f     	str	xzr, [x19, #0x6c8]
 462d658: f9435e74     	ldr	x20, [x19, #0x6b8]
 462d65c: b4000114     	cbz	x20, 0x462d67c <_ChromeMain+0x46283e0>
 462d660: 394ce288     	ldrb	w8, [x20, #0x338]
 462d664: 35000ee8     	cbnz	w8, 0x462d840 <_ChromeMain+0x46285a4>
 462d668: f9400288     	ldr	x8, [x20]
 462d66c: f9405108     	ldr	x8, [x8, #0xa0]
 462d670: aa1403e0     	mov	x0, x20
 462d674: 52800001     	mov	w1, #0x0                ; =0
 462d678: d63f0100     	blr	x8
 462d67c: f9465260     	ldr	x0, [x19, #0xca0]
 462d680: f906527f     	str	xzr, [x19, #0xca0]
 462d684: b5000280     	cbnz	x0, 0x462d6d4 <_ChromeMain+0x4628438>
 462d688: aa1303e0     	mov	x0, x19
 462d68c: 94005f5d     	bl	0x4645400 <_ChromeMain+0x4640164>
 462d690: aa1303e0     	mov	x0, x19
 462d694: 52800001     	mov	w1, #0x0                ; =0
 462d698: 97000b77     	bl	0x630474 <_ChromeMain+0x62b1d8>
 462d69c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 462d6a0: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 462d6a4: a94257f6     	ldp	x22, x21, [sp, #0x20]
 462d6a8: 910143ff     	add	sp, sp, #0x50
 462d6ac: d65f03c0     	ret
 462d6b0: f9423668     	ldr	x8, [x19, #0x468]
 462d6b4: b4fffb88     	cbz	x8, 0x462d624 <_ChromeMain+0x4628388>
 462d6b8: aa0003f5     	mov	x21, x0
 462d6bc: f9400100     	ldr	x0, [x8]
 462d6c0: b9401808     	ldr	w8, [x0, #0x18]
 462d6c4: 7100051f     	cmp	w8, #0x1
 462d6c8: 54fffaeb     	b.lt	0x462d624 <_ChromeMain+0x4628388>
 462d6cc: d2800016     	mov	x22, #0x0               ; =0
 462d6d0: 1400001c     	b	0x462d740 <_ChromeMain+0x46284a4>
 462d6d4: 94e62361     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462d6d8: 52800301     	mov	w1, #0x18               ; =24
 462d6dc: 96e76df7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462d6e0: 17ffffea     	b	0x462d688 <_ChromeMain+0x46283ec>
 462d6e4: 91020281     	add	x1, x20, #0x80
 462d6e8: 91002282     	add	x2, x20, #0x8
 462d6ec: 97ff6673     	bl	0x46070b8 <_ChromeMain+0x4601e1c>
 462d6f0: 3607fa40     	tbz	w0, #0x0, 0x462d638 <_ChromeMain+0x462839c>
 462d6f4: f9422e68     	ldr	x8, [x19, #0x458]
 462d6f8: b4fffa08     	cbz	x8, 0x462d638 <_ChromeMain+0x462839c>
 462d6fc: f9429d08     	ldr	x8, [x8, #0x538]
 462d700: b4fff9c8     	cbz	x8, 0x462d638 <_ChromeMain+0x462839c>
 462d704: f9403500     	ldr	x0, [x8, #0x68]
 462d708: 9717385d     	bl	0xbfb87c <_ChromeMain+0xbf65e0>
 462d70c: b4fff960     	cbz	x0, 0x462d638 <_ChromeMain+0x462839c>
 462d710: aa0003f5     	mov	x21, x0
 462d714: 39408408     	ldrb	w8, [x0, #0x21]
 462d718: 34fff908     	cbz	w8, 0x462d638 <_ChromeMain+0x462839c>
 462d71c: f9401e88     	ldr	x8, [x20, #0x38]
 462d720: b4fff8c8     	cbz	x8, 0x462d638 <_ChromeMain+0x462839c>
 462d724: 1400003a     	b	0x462d80c <_ChromeMain+0x4628570>
 462d728: 910006d6     	add	x22, x22, #0x1
 462d72c: f9423668     	ldr	x8, [x19, #0x468]
 462d730: f9400100     	ldr	x0, [x8]
 462d734: b9801808     	ldrsw	x8, [x0, #0x18]
 462d738: eb0802df     	cmp	x22, x8
 462d73c: 54fff74a     	b.ge	0x462d624 <_ChromeMain+0x4628388>
 462d740: aa1603e1     	mov	x1, x22
 462d744: 9728c2ed     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462d748: b4ffff00     	cbz	x0, 0x462d728 <_ChromeMain+0x462848c>
 462d74c: b9401008     	ldr	w8, [x0, #0x10]
 462d750: 6b15011f     	cmp	w8, w21
 462d754: 54fffea1     	b.ne	0x462d728 <_ChromeMain+0x462848c>
 462d758: f9423668     	ldr	x8, [x19, #0x468]
 462d75c: f9400100     	ldr	x0, [x8]
 462d760: aa1603e1     	mov	x1, x22
 462d764: 9728c2e5     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462d768: 39418408     	ldrb	w8, [x0, #0x61]
 462d76c: 35fff5c8     	cbnz	w8, 0x462d624 <_ChromeMain+0x4628388>
 462d770: f9423660     	ldr	x0, [x19, #0x468]
 462d774: aa1603e1     	mov	x1, x22
 462d778: 52800022     	mov	w2, #0x1                ; =1
 462d77c: 94dc9354     	bl	0x7d524cc <_ChromeMain+0x7d4d230>
 462d780: f9435660     	ldr	x0, [x19, #0x6a8]
 462d784: f941a008     	ldr	x8, [x0, #0x340]
 462d788: b4000068     	cbz	x8, 0x462d794 <_ChromeMain+0x46284f8>
 462d78c: b940fa88     	ldr	w8, [x20, #0xf8]
 462d790: 34000348     	cbz	w8, 0x462d7f8 <_ChromeMain+0x462855c>
 462d794: f9423668     	ldr	x8, [x19, #0x468]
 462d798: b4fff508     	cbz	x8, 0x462d638 <_ChromeMain+0x462839c>
 462d79c: f9400100     	ldr	x0, [x8]
 462d7a0: b9401808     	ldr	w8, [x0, #0x18]
 462d7a4: 7100051f     	cmp	w8, #0x1
 462d7a8: 54fff48b     	b.lt	0x462d638 <_ChromeMain+0x462839c>
 462d7ac: d2800014     	mov	x20, #0x0               ; =0
 462d7b0: 14000007     	b	0x462d7cc <_ChromeMain+0x4628530>
 462d7b4: 91000694     	add	x20, x20, #0x1
 462d7b8: f9423668     	ldr	x8, [x19, #0x468]
 462d7bc: f9400100     	ldr	x0, [x8]
 462d7c0: b9801808     	ldrsw	x8, [x0, #0x18]
 462d7c4: eb08029f     	cmp	x20, x8
 462d7c8: 54fff38a     	b.ge	0x462d638 <_ChromeMain+0x462839c>
 462d7cc: aa1403e1     	mov	x1, x20
 462d7d0: 9728c2ca     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462d7d4: b4ffff00     	cbz	x0, 0x462d7b4 <_ChromeMain+0x4628518>
 462d7d8: b9401008     	ldr	w8, [x0, #0x10]
 462d7dc: 6b15011f     	cmp	w8, w21
 462d7e0: 54fffea1     	b.ne	0x462d7b4 <_ChromeMain+0x4628518>
 462d7e4: f9423660     	ldr	x0, [x19, #0x468]
 462d7e8: aa1403e1     	mov	x1, x20
 462d7ec: 52800002     	mov	w2, #0x0                ; =0
 462d7f0: 94dc9337     	bl	0x7d524cc <_ChromeMain+0x7d4d230>
 462d7f4: 17ffff91     	b	0x462d638 <_ChromeMain+0x462839c>
 462d7f8: 91020281     	add	x1, x20, #0x80
 462d7fc: 91002282     	add	x2, x20, #0x8
 462d800: 97ff662e     	bl	0x46070b8 <_ChromeMain+0x4601e1c>
 462d804: 3707f780     	tbnz	w0, #0x0, 0x462d6f4 <_ChromeMain+0x4628458>
 462d808: 17ffffe3     	b	0x462d794 <_ChromeMain+0x46284f8>
 462d80c: d004c4e0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 462d810: 9136cc00     	add	x0, x0, #0xdb3
 462d814: d004c4e1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 462d818: 912c7821     	add	x1, x1, #0xb1e
 462d81c: 910003e8     	mov	x8, sp
 462d820: 528651c2     	mov	w2, #0x328e             ; =12942
 462d824: 96e88d17     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 462d828: 910003e3     	mov	x3, sp
 462d82c: aa1503e0     	mov	x0, x21
 462d830: aa1403e1     	mov	x1, x20
 462d834: 52800002     	mov	w2, #0x0                ; =0
 462d838: 957c92e7     	bl	0xa5523d4 <_ChromeMain+0xa54d138>
 462d83c: 17ffff7f     	b	0x462d638 <_ChromeMain+0x462839c>
 462d840: 390ce29f     	strb	wzr, [x20, #0x338]
 462d844: f941a680     	ldr	x0, [x20, #0x348]
 462d848: 910ca281     	add	x1, x20, #0x328
 462d84c: 976b6fad     	bl	0x2109700 <_ChromeMain+0x2104464>
 462d850: f9419688     	ldr	x8, [x20, #0x328]
 462d854: f9401d08     	ldr	x8, [x8, #0x38]
 462d858: 910ca280     	add	x0, x20, #0x328
 462d85c: d63f0100     	blr	x8
 462d860: f941a288     	ldr	x8, [x20, #0x340]
 462d864: b4fff028     	cbz	x8, 0x462d668 <_ChromeMain+0x46283cc>
 462d868: f9419688     	ldr	x8, [x20, #0x328]
 462d86c: f9402108     	ldr	x8, [x8, #0x40]
 462d870: 910ca280     	add	x0, x20, #0x328
 462d874: d63f0100     	blr	x8
 462d878: f941a288     	ldr	x8, [x20, #0x340]
 462d87c: f9400109     	ldr	x9, [x8]
 462d880: 7100001f     	cmp	w0, #0x0
 462d884: 5280020a     	mov	w10, #0x10              ; =16
 462d888: 5280040b     	mov	w11, #0x20              ; =32
 462d88c: 9a8a116a     	csel	x10, x11, x10, ne
 462d890: f86a6929     	ldr	x9, [x9, x10]
 462d894: 910ca281     	add	x1, x20, #0x328
 462d898: aa0803e0     	mov	x0, x8
 462d89c: d63f0120     	blr	x9
 462d8a0: 17ffff72     	b	0x462d668 <_ChromeMain+0x46283cc>
