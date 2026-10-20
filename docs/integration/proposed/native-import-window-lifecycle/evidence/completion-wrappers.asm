
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 458d5b0: d10183ff     	sub	sp, sp, #0x60
 458d5b4: a90167fa     	stp	x26, x25, [sp, #0x10]
 458d5b8: a9025ff8     	stp	x24, x23, [sp, #0x20]
 458d5bc: a90357f6     	stp	x22, x21, [sp, #0x30]
 458d5c0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 458d5c4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 458d5c8: 910143fd     	add	x29, sp, #0x50
 458d5cc: aa0303f3     	mov	x19, x3
 458d5d0: aa0203f4     	mov	x20, x2
 458d5d4: aa0103f5     	mov	x21, x1
 458d5d8: aa0003f6     	mov	x22, x0
 458d5dc: 52800100     	mov	w0, #0x8                ; =8
 458d5e0: 96ea0762     	bl	0xf368 <_ChromeMain+0xa0cc>
 458d5e4: aa0003f7     	mov	x23, x0
 458d5e8: f900001f     	str	xzr, [x0]
 458d5ec: f94002c0     	ldr	x0, [x22]
 458d5f0: 95037ac7     	bl	0x866c10c <_ChromeMain+0x8666e70>
 458d5f4: aa0003f8     	mov	x24, x0
 458d5f8: aa1703e0     	mov	x0, x23
 458d5fc: aa1803e1     	mov	x1, x24
 458d600: 95037ac0     	bl	0x866c100 <_ChromeMain+0x8666e64>
 458d604: aa1803e0     	mov	x0, x24
 458d608: 94e9d855     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d60c: f94006da     	ldr	x26, [x22, #0x8]
 458d610: aa1703e0     	mov	x0, x23
 458d614: 95037abe     	bl	0x866c10c <_ChromeMain+0x8666e70>
 458d618: aa0003f8     	mov	x24, x0
 458d61c: 94e9d850     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d620: b40003d8     	cbz	x24, 0x458d698 <_ChromeMain+0x45883fc>
 458d624: 52800100     	mov	w0, #0x8                ; =8
 458d628: 96ea0750     	bl	0xf368 <_ChromeMain+0xa0cc>
 458d62c: aa0003f8     	mov	x24, x0
 458d630: f900001f     	str	xzr, [x0]
 458d634: f90003e0     	str	x0, [sp]
 458d638: aa1703e0     	mov	x0, x23
 458d63c: 95037ab4     	bl	0x866c10c <_ChromeMain+0x8666e70>
 458d640: aa0003f9     	mov	x25, x0
 458d644: aa1803e0     	mov	x0, x24
 458d648: aa1903e1     	mov	x1, x25
 458d64c: 95037aad     	bl	0x866c100 <_ChromeMain+0x8666e64>
 458d650: aa1903e0     	mov	x0, x25
 458d654: 94e9d842     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d658: f90007fa     	str	x26, [sp, #0x8]
 458d65c: 910003e0     	mov	x0, sp
 458d660: 97059732     	bl	0x6f3328 <_ChromeMain+0x6ee08c>
 458d664: aa0003f8     	mov	x24, x0
 458d668: f94003f9     	ldr	x25, [sp]
 458d66c: f90003ff     	str	xzr, [sp]
 458d670: b40000d9     	cbz	x25, 0x458d688 <_ChromeMain+0x45883ec>
 458d674: aa1903e0     	mov	x0, x25
 458d678: 95037aa8     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 458d67c: aa1903e0     	mov	x0, x25
 458d680: 52800101     	mov	w1, #0x8                ; =8
 458d684: 96e9ee0d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d688: b4000098     	cbz	x24, 0x458d698 <_ChromeMain+0x45883fc>
 458d68c: aa1803e0     	mov	x0, x24
 458d690: 978c7ed0     	bl	0x28ad1d0 <_ChromeMain+0x28a7f34>
 458d694: aa0003f8     	mov	x24, x0
 458d698: b40000d7     	cbz	x23, 0x458d6b0 <_ChromeMain+0x4588414>
 458d69c: aa1703e0     	mov	x0, x23
 458d6a0: 95037a9e     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 458d6a4: aa1703e0     	mov	x0, x23
 458d6a8: 52800101     	mov	w1, #0x8                ; =8
 458d6ac: 96e9ee03     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d6b0: b40001d8     	cbz	x24, 0x458d6e8 <_ChromeMain+0x458844c>
 458d6b4: aa1803e0     	mov	x0, x24
 458d6b8: 978f313e     	bl	0x2959bb0 <_ChromeMain+0x2954914>
 458d6bc: aa1503e0     	mov	x0, x21
 458d6c0: aa1403e1     	mov	x1, x20
 458d6c4: aa1303e2     	mov	x2, x19
 458d6c8: 97fffe7b     	bl	0x458d0b4 <_ChromeMain+0x4587e18>
 458d6cc: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 458d6d0: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 458d6d4: a94357f6     	ldp	x22, x21, [sp, #0x30]
 458d6d8: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 458d6dc: a94167fa     	ldp	x26, x25, [sp, #0x10]
 458d6e0: 910183ff     	add	sp, sp, #0x60
 458d6e4: d65f03c0     	ret
 458d6e8: f94002c0     	ldr	x0, [x22]
 458d6ec: 95037a88     	bl	0x866c10c <_ChromeMain+0x8666e70>
 458d6f0: aa0003f6     	mov	x22, x0
 458d6f4: b40000c0     	cbz	x0, 0x458d70c <_ChromeMain+0x4588470>
 458d6f8: aa1603e0     	mov	x0, x22
 458d6fc: d2800002     	mov	x2, #0x0                ; =0
 458d700: 958b21a7     	bl	0xa855d9c <_ChromeMain+0xa850b00>
 458d704: aa1603e0     	mov	x0, x22
 458d708: 959a7e6e     	bl	0xac2d0c0 <_ChromeMain+0xac27e24>
 458d70c: aa1603e0     	mov	x0, x22
 458d710: 94e9d813     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d714: 17ffffea     	b	0x458d6bc <_ChromeMain+0x4588420>
 458d718: d10183ff     	sub	sp, sp, #0x60
 458d71c: a90167fa     	stp	x26, x25, [sp, #0x10]
 458d720: a9025ff8     	stp	x24, x23, [sp, #0x20]
 458d724: a90357f6     	stp	x22, x21, [sp, #0x30]
 458d728: a9044ff4     	stp	x20, x19, [sp, #0x40]
 458d72c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 458d730: 910143fd     	add	x29, sp, #0x50
 458d734: aa0203f3     	mov	x19, x2
 458d738: aa0103f4     	mov	x20, x1
 458d73c: aa0003f5     	mov	x21, x0
 458d740: 52800100     	mov	w0, #0x8                ; =8
 458d744: 96ea0709     	bl	0xf368 <_ChromeMain+0xa0cc>
 458d748: aa0003f6     	mov	x22, x0
 458d74c: f900001f     	str	xzr, [x0]
 458d750: f94002a0     	ldr	x0, [x21]
 458d754: 95037a6e     	bl	0x866c10c <_ChromeMain+0x8666e70>
 458d758: aa0003f7     	mov	x23, x0
 458d75c: aa1603e0     	mov	x0, x22
 458d760: aa1703e1     	mov	x1, x23
 458d764: 95037a67     	bl	0x866c100 <_ChromeMain+0x8666e64>
 458d768: aa1703e0     	mov	x0, x23
 458d76c: 94e9d7fc     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d770: f94006b9     	ldr	x25, [x21, #0x8]
 458d774: aa1603e0     	mov	x0, x22
 458d778: 95037a65     	bl	0x866c10c <_ChromeMain+0x8666e70>
 458d77c: aa0003f7     	mov	x23, x0
 458d780: 94e9d7f7     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d784: b40003d7     	cbz	x23, 0x458d7fc <_ChromeMain+0x4588560>
 458d788: 52800100     	mov	w0, #0x8                ; =8
 458d78c: 96ea06f7     	bl	0xf368 <_ChromeMain+0xa0cc>
 458d790: aa0003f7     	mov	x23, x0
 458d794: f900001f     	str	xzr, [x0]
 458d798: f90003e0     	str	x0, [sp]
 458d79c: aa1603e0     	mov	x0, x22
 458d7a0: 95037a5b     	bl	0x866c10c <_ChromeMain+0x8666e70>
 458d7a4: aa0003f8     	mov	x24, x0
 458d7a8: aa1703e0     	mov	x0, x23
 458d7ac: aa1803e1     	mov	x1, x24
 458d7b0: 95037a54     	bl	0x866c100 <_ChromeMain+0x8666e64>
 458d7b4: aa1803e0     	mov	x0, x24
 458d7b8: 94e9d7e9     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d7bc: f90007f9     	str	x25, [sp, #0x8]
 458d7c0: 910003e0     	mov	x0, sp
 458d7c4: 970596d9     	bl	0x6f3328 <_ChromeMain+0x6ee08c>
 458d7c8: aa0003f7     	mov	x23, x0
 458d7cc: f94003f8     	ldr	x24, [sp]
 458d7d0: f90003ff     	str	xzr, [sp]
 458d7d4: b40000d8     	cbz	x24, 0x458d7ec <_ChromeMain+0x4588550>
 458d7d8: aa1803e0     	mov	x0, x24
 458d7dc: 95037a4f     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 458d7e0: aa1803e0     	mov	x0, x24
 458d7e4: 52800101     	mov	w1, #0x8                ; =8
 458d7e8: 96e9edb4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d7ec: b4000097     	cbz	x23, 0x458d7fc <_ChromeMain+0x4588560>
 458d7f0: aa1703e0     	mov	x0, x23
 458d7f4: 978c7e77     	bl	0x28ad1d0 <_ChromeMain+0x28a7f34>
 458d7f8: aa0003f7     	mov	x23, x0
 458d7fc: b40000d6     	cbz	x22, 0x458d814 <_ChromeMain+0x4588578>
 458d800: aa1603e0     	mov	x0, x22
 458d804: 95037a45     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 458d808: aa1603e0     	mov	x0, x22
 458d80c: 52800101     	mov	w1, #0x8                ; =8
 458d810: 96e9edaa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d814: b40001b7     	cbz	x23, 0x458d848 <_ChromeMain+0x45885ac>
 458d818: aa1703e0     	mov	x0, x23
 458d81c: 978f30e5     	bl	0x2959bb0 <_ChromeMain+0x2954914>
 458d820: aa1403e0     	mov	x0, x20
 458d824: aa1303e1     	mov	x1, x19
 458d828: 97fffec0     	bl	0x458d328 <_ChromeMain+0x458808c>
 458d82c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 458d830: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 458d834: a94357f6     	ldp	x22, x21, [sp, #0x30]
 458d838: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 458d83c: a94167fa     	ldp	x26, x25, [sp, #0x10]
 458d840: 910183ff     	add	sp, sp, #0x60
 458d844: d65f03c0     	ret
 458d848: f94002a0     	ldr	x0, [x21]
 458d84c: 95037a30     	bl	0x866c10c <_ChromeMain+0x8666e70>
 458d850: aa0003f5     	mov	x21, x0
 458d854: b40000c0     	cbz	x0, 0x458d86c <_ChromeMain+0x45885d0>
 458d858: aa1503e0     	mov	x0, x21
 458d85c: d2800002     	mov	x2, #0x0                ; =0
 458d860: 958b214f     	bl	0xa855d9c <_ChromeMain+0xa850b00>
 458d864: aa1503e0     	mov	x0, x21
 458d868: 959a7e16     	bl	0xac2d0c0 <_ChromeMain+0xac27e24>
 458d86c: aa1503e0     	mov	x0, x21
 458d870: 94e9d7bb     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d874: 17ffffeb     	b	0x458d820 <_ChromeMain+0x4588584>
		...
 458d880: d10183ff     	sub	sp, sp, #0x60
 458d884: a9044ff4     	stp	x20, x19, [sp, #0x40]
 458d888: a9057bfd     	stp	x29, x30, [sp, #0x50]
 458d88c: 910143fd     	add	x29, sp, #0x50
 458d890: 7101201f     	cmp	w0, #0x48
 458d894: 540046c8     	b.hi	0x458e16c <_ChromeMain+0x4588ed0>
 458d898: aa0803f3     	mov	x19, x8
 458d89c: 2a0003e8     	mov	w8, w0
 458d8a0: d0048aa9     	adrp	x9, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 458d8a4: 911bd129     	add	x9, x9, #0x6f4
 458d8a8: 1000000a     	adr	x10, 0x458d8a8 <_ChromeMain+0x458860c>
 458d8ac: b8a8792b     	ldrsw	x11, [x9, x8, lsl #2]
 458d8b0: 8b0b014a     	add	x10, x10, x11
 458d8b4: d61f0140     	br	x10
 458d8b8: 3900027f     	strb	wzr, [x19]
 458d8bc: 3900a27f     	strb	wzr, [x19, #0x28]
 458d8c0: 14000075     	b	0x458da94 <_ChromeMain+0x45887f8>
 458d8c4: 528034e8     	mov	w8, #0x1a7              ; =423
 458d8c8: b81e83a8     	stur	w8, [x29, #-0x18]
 458d8cc: 381ec3bf     	sturb	wzr, [x29, #-0x14]
 458d8d0: f0052240     	adrp	x0, 0xe9d8000 <dyld_stub_binder+0xe9d8000>
 458d8d4: 913ea000     	add	x0, x0, #0xfa8
 458d8d8: 14000060     	b	0x458da58 <_ChromeMain+0x45887bc>
 458d8dc: 528034e8     	mov	w8, #0x1a7              ; =423
 458d8e0: b81e83a8     	stur	w8, [x29, #-0x18]
 458d8e4: 381ec3bf     	sturb	wzr, [x29, #-0x14]
 458d8e8: b0051500     	adrp	x0, 0xe82e000 <dyld_stub_binder+0xe82e000>
 458d8ec: 91248000     	add	x0, x0, #0x920
 458d8f0: 14000049     	b	0x458da14 <_ChromeMain+0x4588778>
 458d8f4: 528034e8     	mov	w8, #0x1a7              ; =423
 458d8f8: b81e83a8     	stur	w8, [x29, #-0x18]
 458d8fc: 381ec3bf     	sturb	wzr, [x29, #-0x14]
 458d900: d0052240     	adrp	x0, 0xe9d7000 <dyld_stub_binder+0xe9d7000>
 458d904: 9112c000     	add	x0, x0, #0x4b0
 458d908: 14000054     	b	0x458da58 <_ChromeMain+0x45887bc>
 458d90c: f0053180     	adrp	x0, 0xebc0000 <dyld_stub_binder+0xebc0000>
 458d910: 9104c000     	add	x0, x0, #0x130
 458d914: 96ee2e5b     	bl	0x119280 <_ChromeMain+0x113fe4>
 458d918: 37000100     	tbnz	w0, #0x0, 0x458d938 <_ChromeMain+0x458869c>
 458d91c: f0053180     	adrp	x0, 0xebc0000 <dyld_stub_binder+0xebc0000>
 458d920: 91054000     	add	x0, x0, #0x150
 458d924: 96ee2e57     	bl	0x119280 <_ChromeMain+0x113fe4>
 458d928: 35000080     	cbnz	w0, 0x458d938 <_ChromeMain+0x458869c>
 458d92c: b0052240     	adrp	x0, 0xe9d6000 <dyld_stub_binder+0xe9d6000>
 458d930: 912c2000     	add	x0, x0, #0xb08
 458d934: 14000035     	b	0x458da08 <_ChromeMain+0x458876c>
 458d938: d0052240     	adrp	x0, 0xe9d7000 <dyld_stub_binder+0xe9d7000>
 458d93c: 912ec000     	add	x0, x0, #0xbb0
 458d940: 14000032     	b	0x458da08 <_ChromeMain+0x458876c>
 458d944: 528034e8     	mov	w8, #0x1a7              ; =423
 458d948: b81e83a8     	stur	w8, [x29, #-0x18]
 458d94c: 381ec3bf     	sturb	wzr, [x29, #-0x14]
 458d950: 90052980     	adrp	x0, 0xeabd000 <dyld_stub_binder+0xeabd000>
 458d954: 9109e000     	add	x0, x0, #0x278
 458d958: 1400002f     	b	0x458da14 <_ChromeMain+0x4588778>
 458d95c: 528034e8     	mov	w8, #0x1a7              ; =423
