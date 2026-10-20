
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426b4b0: d10643ff     	sub	sp, sp, #0x190
 426b4b4: a9136ffc     	stp	x28, x27, [sp, #0x130]
 426b4b8: a91467fa     	stp	x26, x25, [sp, #0x140]
 426b4bc: a9155ff8     	stp	x24, x23, [sp, #0x150]
 426b4c0: a91657f6     	stp	x22, x21, [sp, #0x160]
 426b4c4: a9174ff4     	stp	x20, x19, [sp, #0x170]
 426b4c8: a9187bfd     	stp	x29, x30, [sp, #0x180]
 426b4cc: 910603fd     	add	x29, sp, #0x180
 426b4d0: aa0103f3     	mov	x19, x1
 426b4d4: aa0003f7     	mov	x23, x0
 426b4d8: aa0803f4     	mov	x20, x8
 426b4dc: a9007d1f     	stp	xzr, xzr, [x8]
 426b4e0: f900091f     	str	xzr, [x8, #0x10]
 426b4e4: b004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426b4e8: 91112821     	add	x1, x1, #0x44a
 426b4ec: 52800242     	mov	w2, #0x12               ; =18
 426b4f0: 9707fe14     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426b4f4: b4000500     	cbz	x0, 0x426b594 <_ChromeMain+0x42662f8>
 426b4f8: 39406008     	ldrb	w8, [x0, #0x18]
 426b4fc: 71001d1f     	cmp	w8, #0x7
 426b500: 540004a1     	b.ne	0x426b594 <_ChromeMain+0x42662f8>
 426b504: a9402018     	ldp	x24, x8, [x0]
 426b508: 8b081709     	add	x9, x24, x8, lsl #5
 426b50c: eb09031f     	cmp	x24, x9
 426b510: 540048a8     	b.hi	0x426be24 <_ChromeMain+0x4266b88>
 426b514: d37be91b     	lsl	x27, x8, #5
 426b518: b40003fb     	cbz	x27, 0x426b594 <_ChromeMain+0x42662f8>
 426b51c: b004b819     	adrp	x25, 0xd96c000 <dyld_stub_binder+0xd96c000>
 426b520: 91392f39     	add	x25, x25, #0xe4b
 426b524: f004b59a     	adrp	x26, 0xd91e000 <dyld_stub_binder+0xd91e000>
 426b528: 911e2f5a     	add	x26, x26, #0x78b
 426b52c: 14000004     	b	0x426b53c <_ChromeMain+0x42662a0>
 426b530: 91008318     	add	x24, x24, #0x20
 426b534: f100837b     	subs	x27, x27, #0x20
 426b538: 540002e0     	b.eq	0x426b594 <_ChromeMain+0x42662f8>
 426b53c: 39406308     	ldrb	w8, [x24, #0x18]
 426b540: 7100191f     	cmp	w8, #0x6
 426b544: 54ffff61     	b.ne	0x426b530 <_ChromeMain+0x4266294>
 426b548: aa1803e0     	mov	x0, x24
 426b54c: aa1903e1     	mov	x1, x25
 426b550: 528000a2     	mov	w2, #0x5                ; =5
 426b554: 975b054b     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 426b558: aa0003f5     	mov	x21, x0
 426b55c: aa1803e0     	mov	x0, x24
 426b560: aa1a03e1     	mov	x1, x26
 426b564: 528000c2     	mov	w2, #0x6                ; =6
 426b568: 975b0546     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 426b56c: b4fffe35     	cbz	x21, 0x426b530 <_ChromeMain+0x4266294>
 426b570: aa0003f6     	mov	x22, x0
 426b574: b4fffde0     	cbz	x0, 0x426b530 <_ChromeMain+0x4266294>
 426b578: f94006a8     	ldr	x8, [x21, #0x8]
 426b57c: b4fffda8     	cbz	x8, 0x426b530 <_ChromeMain+0x4266294>
 426b580: f94006c8     	ldr	x8, [x22, #0x8]
 426b584: b5000548     	cbnz	x8, 0x426b62c <_ChromeMain+0x4266390>
 426b588: 17ffffea     	b	0x426b530 <_ChromeMain+0x4266294>
 426b58c: d2800015     	mov	x21, #0x0               ; =0
 426b590: 1400000a     	b	0x426b5b8 <_ChromeMain+0x426631c>
 426b594: b004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426b598: 91117421     	add	x1, x1, #0x45d
 426b59c: aa1703e0     	mov	x0, x23
 426b5a0: 528002c2     	mov	w2, #0x16               ; =22
 426b5a4: 9707fde7     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426b5a8: b4ffff20     	cbz	x0, 0x426b58c <_ChromeMain+0x42662f0>
 426b5ac: 39406008     	ldrb	w8, [x0, #0x18]
 426b5b0: 71001d1f     	cmp	w8, #0x7
 426b5b4: 9a9f0015     	csel	x21, x0, xzr, eq
 426b5b8: b004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426b5bc: 9111d021     	add	x1, x1, #0x474
 426b5c0: aa1703e0     	mov	x0, x23
 426b5c4: 52800382     	mov	w2, #0x1c               ; =28
 426b5c8: 9707fdde     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426b5cc: b40000c0     	cbz	x0, 0x426b5e4 <_ChromeMain+0x4266348>
 426b5d0: b40000b5     	cbz	x21, 0x426b5e4 <_ChromeMain+0x4266348>
 426b5d4: aa0003f6     	mov	x22, x0
 426b5d8: 39406008     	ldrb	w8, [x0, #0x18]
 426b5dc: 71001d1f     	cmp	w8, #0x7
 426b5e0: 54000260     	b.eq	0x426b62c <_ChromeMain+0x4266390>
 426b5e4: b004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426b5e8: 91124421     	add	x1, x1, #0x491
 426b5ec: aa1703e0     	mov	x0, x23
 426b5f0: 52800402     	mov	w2, #0x20               ; =32
 426b5f4: 9707fdd3     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426b5f8: b4000340     	cbz	x0, 0x426b660 <_ChromeMain+0x42663c4>
 426b5fc: 39406008     	ldrb	w8, [x0, #0x18]
 426b600: 71001d1f     	cmp	w8, #0x7
 426b604: 9a9f0015     	csel	x21, x0, xzr, eq
 426b608: b004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426b60c: 9112c821     	add	x1, x1, #0x4b2
 426b610: aa1703e0     	mov	x0, x23
 426b614: 528004c2     	mov	w2, #0x26               ; =38
 426b618: 9707fdca     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426b61c: b4000120     	cbz	x0, 0x426b640 <_ChromeMain+0x42663a4>
 426b620: 39406008     	ldrb	w8, [x0, #0x18]
 426b624: 71001d1f     	cmp	w8, #0x7
 426b628: 9a9f0016     	csel	x22, x0, xzr, eq
 426b62c: b40000b6     	cbz	x22, 0x426b640 <_ChromeMain+0x42663a4>
 426b630: b4000095     	cbz	x21, 0x426b640 <_ChromeMain+0x42663a4>
 426b634: f94006c8     	ldr	x8, [x22, #0x8]
 426b638: f100091f     	cmp	x8, #0x2
 426b63c: 54000162     	b.hs	0x426b668 <_ChromeMain+0x42663cc>
 426b640: a9587bfd     	ldp	x29, x30, [sp, #0x180]
 426b644: a9574ff4     	ldp	x20, x19, [sp, #0x170]
 426b648: a95657f6     	ldp	x22, x21, [sp, #0x160]
 426b64c: a9555ff8     	ldp	x24, x23, [sp, #0x150]
 426b650: a95467fa     	ldp	x26, x25, [sp, #0x140]
 426b654: a9536ffc     	ldp	x28, x27, [sp, #0x130]
 426b658: 910643ff     	add	sp, sp, #0x190
 426b65c: d65f03c0     	ret
 426b660: d2800015     	mov	x21, #0x0               ; =0
 426b664: 17ffffe9     	b	0x426b608 <_ChromeMain+0x426636c>
 426b668: a9007fff     	stp	xzr, xzr, [sp]
 426b66c: d280001c     	mov	x28, #0x0               ; =0
 426b670: d10283b8     	sub	x24, x29, #0xa0
 426b674: 91002308     	add	x8, x24, #0x8
 426b678: f9000be8     	str	x8, [sp, #0x10]
 426b67c: 9004ac37     	adrp	x23, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426b680: 912582f7     	add	x23, x23, #0x960
 426b684: d004b17b     	adrp	x27, 0xd899000 <dyld_stub_binder+0xd899000>
 426b688: 9135537b     	add	x27, x27, #0xd54
 426b68c: 528000c8     	mov	w8, #0x6                ; =6
 426b690: 4e080d00     	dup.2d	v0, x8
 426b694: b004c5a8     	adrp	x8, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426b698: 9114e908     	add	x8, x8, #0x53a
 426b69c: 4e081d00     	mov.d	v0[0], x8
 426b6a0: 3d800be0     	str	q0, [sp, #0x20]
 426b6a4: 1400002c     	b	0x426b754 <_ChromeMain+0x42664b8>
 426b6a8: f9400ff4     	ldr	x20, [sp, #0x18]
 426b6ac: d10283b8     	sub	x24, x29, #0xa0
 426b6b0: 9004ac37     	adrp	x23, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426b6b4: 912582f7     	add	x23, x23, #0x960
 426b6b8: d004b17b     	adrp	x27, 0xd899000 <dyld_stub_binder+0xd899000>
 426b6bc: 9135537b     	add	x27, x27, #0xd54
 426b6c0: f85683a1     	ldur	x1, [x29, #-0x98]
 426b6c4: f9001bf8     	str	x24, [sp, #0x30]
 426b6c8: 9100c3e0     	add	x0, sp, #0x30
 426b6cc: 9712d4f8     	bl	0x720aac <_ChromeMain+0x71b810>
 426b6d0: f85783b9     	ldur	x25, [x29, #-0x88]
 426b6d4: b40002b9     	cbz	x25, 0x426b728 <_ChromeMain+0x426648c>
 426b6d8: f85803a8     	ldur	x8, [x29, #-0x80]
 426b6dc: 52801609     	mov	w9, #0xb0               ; =176
 426b6e0: 9b097d09     	mul	x9, x8, x9
 426b6e4: b4000149     	cbz	x9, 0x426b70c <_ChromeMain+0x4266470>
 426b6e8: 8b090329     	add	x9, x25, x9
 426b6ec: d102c120     	sub	x0, x9, #0xb0
 426b6f0: 928015e9     	mov	x9, #-0xb0              ; =-176
 426b6f4: 9b097d14     	mul	x20, x8, x9
 426b6f8: b40035a0     	cbz	x0, 0x426bdac <_ChromeMain+0x4266b10>
 426b6fc: 97ffff31     	bl	0x426b3c0 <_ChromeMain+0x4266124>
 426b700: d102c000     	sub	x0, x0, #0xb0
 426b704: b102c294     	adds	x20, x20, #0xb0
 426b708: 54ffff81     	b.ne	0x426b6f8 <_ChromeMain+0x426645c>
 426b70c: f81803bf     	stur	xzr, [x29, #-0x80]
 426b710: f85883a8     	ldur	x8, [x29, #-0x78]
 426b714: 52801609     	mov	w9, #0xb0               ; =176
 426b718: 9b097d01     	mul	x1, x8, x9
 426b71c: aa1903e0     	mov	x0, x25
 426b720: 96f675e6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426b724: f9400ff4     	ldr	x20, [sp, #0x18]
 426b728: 385a73a8     	ldurb	w8, [x29, #-0x59]
 426b72c: 363800a8     	tbz	w8, #0x7, 0x426b740 <_ChromeMain+0x42664a4>
 426b730: f85903a0     	ldur	x0, [x29, #-0x70]
 426b734: f85a03a8     	ldur	x8, [x29, #-0x60]
 426b738: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426b73c: 96f675df     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426b740: 91000f88     	add	x8, x28, #0x3
 426b744: 91000b9c     	add	x28, x28, #0x2
 426b748: f94006c9     	ldr	x9, [x22, #0x8]
 426b74c: eb09011f     	cmp	x8, x9
 426b750: 54fff782     	b.hs	0x426b640 <_ChromeMain+0x42663a4>
 426b754: f94002c8     	ldr	x8, [x22]
 426b758: 8b1c1508     	add	x8, x8, x28, lsl #5
 426b75c: 3940e109     	ldrb	w9, [x8, #0x38]
 426b760: 7100193f     	cmp	w9, #0x6
 426b764: 54fffee1     	b.ne	0x426b740 <_ChromeMain+0x42664a4>
 426b768: 91008119     	add	x25, x8, #0x20
 426b76c: aa1903e0     	mov	x0, x25
 426b770: aa1703e1     	mov	x1, x23
 426b774: 528000a2     	mov	w2, #0x5                ; =5
 426b778: 971bcc32     	bl	0x95e840 <_ChromeMain+0x9595a4>
 426b77c: f100001f     	cmp	x0, #0x0
 426b780: 9a800339     	csel	x25, x25, x0, eq
 426b784: b4fffdf9     	cbz	x25, 0x426b740 <_ChromeMain+0x42664a4>
 426b788: aa1903e0     	mov	x0, x25
 426b78c: aa1b03e1     	mov	x1, x27
 426b790: 528000e2     	mov	w2, #0x7                ; =7
 426b794: 971bcc2b     	bl	0x95e840 <_ChromeMain+0x9595a4>
 426b798: b4fffd40     	cbz	x0, 0x426b740 <_ChromeMain+0x42664a4>
 426b79c: aa0003fa     	mov	x26, x0
 426b7a0: 39405e69     	ldrb	w9, [x19, #0x17]
 426b7a4: 13001d28     	sxtb	w8, w9
 426b7a8: f940066a     	ldr	x10, [x19, #0x8]
 426b7ac: 7100011f     	cmp	w8, #0x0
 426b7b0: 9a894149     	csel	x9, x10, x9, mi
 426b7b4: f1001d3f     	cmp	x9, #0x7
 426b7b8: 540001a1     	b.ne	0x426b7ec <_ChromeMain+0x4266550>
 426b7bc: f9400269     	ldr	x9, [x19]
 426b7c0: 7100011f     	cmp	w8, #0x0
 426b7c4: 9a934128     	csel	x8, x9, x19, mi
 426b7c8: b9400109     	ldr	w9, [x8]
 426b7cc: b8403108     	ldur	w8, [x8, #0x3]
 426b7d0: 528ca88a     	mov	w10, #0x6544            ; =25924
 426b7d4: 72ac2cca     	movk	w10, #0x6166, lsl #16
 426b7d8: 6b0a013f     	cmp	w9, w10
 426b7dc: 528eac29     	mov	w9, #0x7561             ; =30049
 426b7e0: 72ae8d89     	movk	w9, #0x746c, lsl #16
 426b7e4: 7a490100     	ccmp	w8, w9, #0x0, eq
 426b7e8: 540004c0     	b.eq	0x426b880 <_ChromeMain+0x42665e4>
 426b7ec: aa1a03e0     	mov	x0, x26
 426b7f0: d004c381     	adrp	x1, 0xdadd000 <dyld_stub_binder+0xdadd000>
 426b7f4: 91171421     	add	x1, x1, #0x5c5
 426b7f8: 528000c2     	mov	w2, #0x6                ; =6
 426b7fc: 971bcc11     	bl	0x95e840 <_ChromeMain+0x9595a4>
 426b800: b4fffa00     	cbz	x0, 0x426b740 <_ChromeMain+0x42664a4>
 426b804: b004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426b808: 91145421     	add	x1, x1, #0x515
 426b80c: 52800042     	mov	w2, #0x2                ; =2
 426b810: 971bcc0c     	bl	0x95e840 <_ChromeMain+0x9595a4>
 426b814: b4fff960     	cbz	x0, 0x426b740 <_ChromeMain+0x42664a4>
 426b818: b004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426b81c: 91146021     	add	x1, x1, #0x518
 426b820: 52800222     	mov	w2, #0x11               ; =17
 426b824: 9776f897     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 426b828: b4fff8c0     	cbz	x0, 0x426b740 <_ChromeMain+0x42664a4>
 426b82c: 39405c09     	ldrb	w9, [x0, #0x17]
 426b830: 13001d28     	sxtb	w8, w9
 426b834: f940040a     	ldr	x10, [x0, #0x8]
 426b838: 7100011f     	cmp	w8, #0x0
 426b83c: 9a894142     	csel	x2, x10, x9, mi
 426b840: 39405e6a     	ldrb	w10, [x19, #0x17]
 426b844: 13001d49     	sxtb	w9, w10
 426b848: f940066b     	ldr	x11, [x19, #0x8]
 426b84c: 7100013f     	cmp	w9, #0x0
 426b850: 9a8a416a     	csel	x10, x11, x10, mi
 426b854: eb0a005f     	cmp	x2, x10
 426b858: 54fff741     	b.ne	0x426b740 <_ChromeMain+0x42664a4>
 426b85c: f940000a     	ldr	x10, [x0]
 426b860: 7100011f     	cmp	w8, #0x0
 426b864: 9a804140     	csel	x0, x10, x0, mi
 426b868: f9400268     	ldr	x8, [x19]
 426b86c: 7100013f     	cmp	w9, #0x0
 426b870: 9a934101     	csel	x1, x8, x19, mi
 426b874: 94f677fb     	bl	0x8009860 <_ChromeMain+0x80045c4>
 426b878: 35fff640     	cbnz	w0, 0x426b740 <_ChromeMain+0x42664a4>
 426b87c: 14000009     	b	0x426b8a0 <_ChromeMain+0x4266604>
 426b880: aa1a03e0     	mov	x0, x26
 426b884: f004b0e1     	adrp	x1, 0xd88a000 <dyld_stub_binder+0xd88a000>
 426b888: 9130e821     	add	x1, x1, #0xc3a
 426b88c: 528000e2     	mov	w2, #0x7                ; =7
 426b890: 9749d70c     	bl	0x14e14c0 <_ChromeMain+0x14dc224>
 426b894: 52802028     	mov	w8, #0x101              ; =257
 426b898: 6a20011f     	bics	wzr, w8, w0
 426b89c: 54fffa81     	b.ne	0x426b7ec <_ChromeMain+0x4266550>
 426b8a0: f9000ff4     	str	x20, [sp, #0x18]
 426b8a4: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 426b8a8: f81a03bf     	stur	xzr, [x29, #-0x60]
 426b8ac: aa1903e0     	mov	x0, x25
 426b8b0: b004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426b8b4: 9114a821     	add	x1, x1, #0x52a
 426b8b8: 528001e2     	mov	w2, #0xf                ; =15
 426b8bc: 975b0471     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 426b8c0: b40004a0     	cbz	x0, 0x426b954 <_ChromeMain+0x42666b8>
 426b8c4: aa0003fa     	mov	x26, x0
 426b8c8: f9400408     	ldr	x8, [x0, #0x8]
 426b8cc: f100091f     	cmp	x8, #0x2
 426b8d0: 54000423     	b.lo	0x426b954 <_ChromeMain+0x42666b8>
 426b8d4: d280001b     	mov	x27, #0x0               ; =0
 426b8d8: 52800037     	mov	w23, #0x1               ; =1
 426b8dc: 14000006     	b	0x426b8f4 <_ChromeMain+0x4266658>
 426b8e0: f9400748     	ldr	x8, [x26, #0x8]
 426b8e4: 91000af7     	add	x23, x23, #0x2
 426b8e8: 9101037b     	add	x27, x27, #0x40
 426b8ec: eb0802ff     	cmp	x23, x8
 426b8f0: 54000322     	b.hs	0x426b954 <_ChromeMain+0x42666b8>
 426b8f4: f9400354     	ldr	x20, [x26]
 426b8f8: 8b1b0289     	add	x9, x20, x27
 426b8fc: 3940612a     	ldrb	w10, [x9, #0x18]
 426b900: 3940e129     	ldrb	w9, [x9, #0x38]
 426b904: 7100195f     	cmp	w10, #0x6
 426b908: 7a440920     	ccmp	w9, #0x4, #0x0, eq
 426b90c: 54fffec1     	b.ne	0x426b8e4 <_ChromeMain+0x4266648>
 426b910: 3dc00be0     	ldr	q0, [sp, #0x20]
 426b914: 3d800fe0     	str	q0, [sp, #0x30]
 426b918: 8b1b0280     	add	x0, x20, x27
 426b91c: 9100c3e1     	add	x1, sp, #0x30
 426b920: 976b3fc8     	bl	0x1d3b840 <_ChromeMain+0x1d365a4>
 426b924: 3607fde0     	tbz	w0, #0x0, 0x426b8e0 <_ChromeMain+0x4266644>
 426b928: 8b1b0288     	add	x8, x20, x27
 426b92c: 3940e109     	ldrb	w9, [x8, #0x38]
 426b930: 7100113f     	cmp	w9, #0x4
 426b934: 54002841     	b.ne	0x426be3c <_ChromeMain+0x4266ba0>
 426b938: 39c0dd09     	ldrsb	w9, [x8, #0x37]
 426b93c: 37f82449     	tbnz	w9, #0x1f, 0x426bdc4 <_ChromeMain+0x4266b28>
 426b940: 3cc20100     	ldur	q0, [x8, #0x20]
 426b944: f8430108     	ldur	x8, [x8, #0x30]
 426b948: f81a03a8     	stur	x8, [x29, #-0x60]
 426b94c: 3c9903a0     	stur	q0, [x29, #-0x70]
 426b950: 14000016     	b	0x426b9a8 <_ChromeMain+0x426670c>
 426b954: aa1903e0     	mov	x0, x25
 426b958: b004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426b95c: 91150421     	add	x1, x1, #0x541
 426b960: 52800182     	mov	w2, #0xc                ; =12
 426b964: 975b0447     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 426b968: b40001c0     	cbz	x0, 0x426b9a0 <_ChromeMain+0x4266704>
 426b96c: f9400409     	ldr	x9, [x0, #0x8]
 426b970: f100093f     	cmp	x9, #0x2
 426b974: f9400ff4     	ldr	x20, [sp, #0x18]
 426b978: 540001c3     	b.lo	0x426b9b0 <_ChromeMain+0x4266714>
 426b97c: f9400008     	ldr	x8, [x0]
 426b980: 5280002a     	mov	w10, #0x1               ; =1
 426b984: 14000026     	b	0x426ba1c <_ChromeMain+0x4266780>
 426b988: 9004ac37     	adrp	x23, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426b98c: 912582f7     	add	x23, x23, #0x960
 426b990: d004b17b     	adrp	x27, 0xd899000 <dyld_stub_binder+0xd899000>
 426b994: 9135537b     	add	x27, x27, #0xd54
 426b998: 373fecc8     	tbnz	w8, #0x7, 0x426b730 <_ChromeMain+0x4266494>
 426b99c: 17ffff69     	b	0x426b740 <_ChromeMain+0x42664a4>
 426b9a0: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 426b9a4: f81a03bf     	stur	xzr, [x29, #-0x60]
 426b9a8: f9400ff4     	ldr	x20, [sp, #0x18]
 426b9ac: 14000003     	b	0x426b9b8 <_ChromeMain+0x426671c>
 426b9b0: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 426b9b4: f81a03bf     	stur	xzr, [x29, #-0x60]
 426b9b8: 385a73a9     	ldurb	w9, [x29, #-0x59]
 426b9bc: 13001d28     	sxtb	w8, w9
 426b9c0: f85983aa     	ldur	x10, [x29, #-0x68]
 426b9c4: 7100011f     	cmp	w8, #0x0
 426b9c8: 9a89415a     	csel	x26, x10, x9, mi
 426b9cc: b4fffdfa     	cbz	x26, 0x426b988 <_ChromeMain+0x42666ec>
 426b9d0: a937ffbf     	stp	xzr, xzr, [x29, #-0x88]
 426b9d4: f81883bf     	stur	xzr, [x29, #-0x78]
 426b9d8: f9400be9     	ldr	x9, [sp, #0x10]
 426b9dc: a9007d3f     	stp	xzr, xzr, [x9]
 426b9e0: f81603a9     	stur	x9, [x29, #-0xa0]
 426b9e4: f94006b7     	ldr	x23, [x21, #0x8]
 426b9e8: f1000aff     	cmp	x23, #0x2
 426b9ec: 54ffe623     	b.lo	0x426b6b0 <_ChromeMain+0x4266414>
 426b9f0: f94002b8     	ldr	x24, [x21]
 426b9f4: f85903a9     	ldur	x9, [x29, #-0x70]
 426b9f8: 7100011f     	cmp	w8, #0x0
 426b9fc: d101c3a8     	sub	x8, x29, #0x70
 426ba00: 9a88413b     	csel	x27, x9, x8, mi
 426ba04: 52800034     	mov	w20, #0x1               ; =1
 426ba08: 14000023     	b	0x426ba94 <_ChromeMain+0x42667f8>
 426ba0c: 9100094a     	add	x10, x10, #0x2
 426ba10: 91010108     	add	x8, x8, #0x40
 426ba14: eb09015f     	cmp	x10, x9
 426ba18: 54fffcc2     	b.hs	0x426b9b0 <_ChromeMain+0x4266714>
 426ba1c: 3940610b     	ldrb	w11, [x8, #0x18]
 426ba20: 3940e10c     	ldrb	w12, [x8, #0x38]
 426ba24: 7100117f     	cmp	w11, #0x4
 426ba28: 7a440980     	ccmp	w12, #0x4, #0x0, eq
 426ba2c: 54ffff01     	b.ne	0x426ba0c <_ChromeMain+0x4266770>
 426ba30: 39405d0c     	ldrb	w12, [x8, #0x17]
 426ba34: 13001d8b     	sxtb	w11, w12
 426ba38: f940050d     	ldr	x13, [x8, #0x8]
 426ba3c: 7100017f     	cmp	w11, #0x0
 426ba40: 9a8c41ac     	csel	x12, x13, x12, mi
 426ba44: f100199f     	cmp	x12, #0x6
 426ba48: 54fffe21     	b.ne	0x426ba0c <_ChromeMain+0x4266770>
 426ba4c: f940010c     	ldr	x12, [x8]
 426ba50: 7100017f     	cmp	w11, #0x0
 426ba54: 9a88418b     	csel	x11, x12, x8, mi
 426ba58: b940016c     	ldr	w12, [x11]
 426ba5c: 7940096b     	ldrh	w11, [x11, #0x4]
 426ba60: 528d2e0d     	mov	w13, #0x6970            ; =26992
 426ba64: 72adcdcd     	movk	w13, #0x6e6e, lsl #16
 426ba68: 6b0d019f     	cmp	w12, w13
 426ba6c: 528c8cac     	mov	w12, #0x6465            ; =25701
 426ba70: 7a4c0160     	ccmp	w11, w12, #0x0, eq
 426ba74: 54fffcc1     	b.ne	0x426ba0c <_ChromeMain+0x4266770>
 426ba78: 39c0dd09     	ldrsb	w9, [x8, #0x37]
 426ba7c: 37f81b09     	tbnz	w9, #0x1f, 0x426bddc <_ChromeMain+0x4266b40>
 426ba80: 140000cc     	b	0x426bdb0 <_ChromeMain+0x4266b14>
 426ba84: 91000a94     	add	x20, x20, #0x2
 426ba88: 91010318     	add	x24, x24, #0x40
 426ba8c: eb17029f     	cmp	x20, x23
 426ba90: 54ffe0c2     	b.hs	0x426b6a8 <_ChromeMain+0x426640c>
 426ba94: 39406308     	ldrb	w8, [x24, #0x18]
 426ba98: 7100111f     	cmp	w8, #0x4
 426ba9c: 54ffff41     	b.ne	0x426ba84 <_ChromeMain+0x42667e8>
 426baa0: 39405f09     	ldrb	w9, [x24, #0x17]
 426baa4: 13001d28     	sxtb	w8, w9
 426baa8: f940070a     	ldr	x10, [x24, #0x8]
 426baac: 7100011f     	cmp	w8, #0x0
 426bab0: 9a894149     	csel	x9, x10, x9, mi
 426bab4: eb1a013f     	cmp	x9, x26
 426bab8: 54fffe61     	b.ne	0x426ba84 <_ChromeMain+0x42667e8>
 426babc: f9400309     	ldr	x9, [x24]
 426bac0: 7100011f     	cmp	w8, #0x0
 426bac4: 9a984120     	csel	x0, x9, x24, mi
 426bac8: aa1b03e1     	mov	x1, x27
 426bacc: aa1a03e2     	mov	x2, x26
 426bad0: 94f67764     	bl	0x8009860 <_ChromeMain+0x80045c4>
 426bad4: 35fffd80     	cbnz	w0, 0x426ba84 <_ChromeMain+0x42667e8>
 426bad8: 3940e308     	ldrb	w8, [x24, #0x38]
 426badc: 7100191f     	cmp	w8, #0x6
 426bae0: f9400ff4     	ldr	x20, [sp, #0x18]
 426bae4: 54ffde41     	b.ne	0x426b6ac <_ChromeMain+0x4266410>
 426bae8: 9100831a     	add	x26, x24, #0x20
 426baec: aa1a03e0     	mov	x0, x26
 426baf0: 9004ac37     	adrp	x23, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426baf4: 912582f7     	add	x23, x23, #0x960
 426baf8: aa1703e1     	mov	x1, x23
 426bafc: 528000a2     	mov	w2, #0x5                ; =5
 426bb00: 971bcb50     	bl	0x95e840 <_ChromeMain+0x9595a4>
 426bb04: f100001f     	cmp	x0, #0x0
 426bb08: 9a800340     	csel	x0, x26, x0, eq
 426bb0c: d004b17b     	adrp	x27, 0xd899000 <dyld_stub_binder+0xd899000>
 426bb10: 9135537b     	add	x27, x27, #0xd54
 426bb14: b40001e0     	cbz	x0, 0x426bb50 <_ChromeMain+0x42668b4>
 426bb18: b004c5a1     	adrp	x1, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426bb1c: 9113e821     	add	x1, x1, #0x4fa
 426bb20: 52800162     	mov	w2, #0xb                ; =11
 426bb24: 975b03d7     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 426bb28: d10283b8     	sub	x24, x29, #0xa0
 426bb2c: b4ffdca0     	cbz	x0, 0x426b6c0 <_ChromeMain+0x4266424>
 426bb30: a940201a     	ldp	x26, x8, [x0]
 426bb34: 8b081749     	add	x9, x26, x8, lsl #5
 426bb38: eb09035f     	cmp	x26, x9
 426bb3c: 540017a8     	b.hi	0x426be30 <_ChromeMain+0x4266b94>
 426bb40: d37be914     	lsl	x20, x8, #5
 426bb44: b50001b4     	cbnz	x20, 0x426bb78 <_ChromeMain+0x42668dc>
 426bb48: f9400ff4     	ldr	x20, [sp, #0x18]
 426bb4c: 17fffedd     	b	0x426b6c0 <_ChromeMain+0x4266424>
 426bb50: d10283b8     	sub	x24, x29, #0xa0
 426bb54: 17fffedb     	b	0x426b6c0 <_ChromeMain+0x4266424>
 426bb58: d10283a2     	sub	x2, x29, #0xa0
 426bb5c: d10223a3     	sub	x3, x29, #0x88
 426bb60: aa1503e0     	mov	x0, x21
 426bb64: aa1a03e1     	mov	x1, x26
 426bb68: 94000608     	bl	0x426d388 <_ChromeMain+0x42680ec>
 426bb6c: 9100835a     	add	x26, x26, #0x20
 426bb70: f1008294     	subs	x20, x20, #0x20
 426bb74: 54000380     	b.eq	0x426bbe4 <_ChromeMain+0x4266948>
 426bb78: 39406348     	ldrb	w8, [x26, #0x18]
 426bb7c: 7100111f     	cmp	w8, #0x4
 426bb80: 54ffff61     	b.ne	0x426bb6c <_ChromeMain+0x42668d0>
 426bb84: 17fffff5     	b	0x426bb58 <_ChromeMain+0x42668bc>
 426bb88: 528001c8     	mov	w8, #0xe                ; =14
 426bb8c: f9001fe8     	str	x8, [sp, #0x38]
 426bb90: f9401be8     	ldr	x8, [sp, #0x30]
 426bb94: 14000006     	b	0x426bbac <_ChromeMain+0x4266910>
 426bb98: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 426bb9c: 37ffff68     	tbnz	w8, #0x1f, 0x426bb88 <_ChromeMain+0x42668ec>
 426bba0: 528001c8     	mov	w8, #0xe                ; =14
 426bba4: 39011fe8     	strb	w8, [sp, #0x47]
 426bba8: 9100c3e8     	add	x8, sp, #0x30
 426bbac: b004c5aa     	adrp	x10, 0xdb20000 <dyld_stub_binder+0xdb20000>
 426bbb0: 9114194a     	add	x10, x10, #0x506
 426bbb4: f9400149     	ldr	x9, [x10]
 426bbb8: f9000109     	str	x9, [x8]
 426bbbc: f8406149     	ldur	x9, [x10, #0x6]
 426bbc0: f8006109     	stur	x9, [x8, #0x6]
 426bbc4: 3900391f     	strb	wzr, [x8, #0xe]
 426bbc8: 14000022     	b	0x426bc50 <_ChromeMain+0x42669b4>
 426bbcc: a9400801     	ldp	x1, x2, [x0]
 426bbd0: 9100c3e0     	add	x0, sp, #0x30
 426bbd4: 9708f3b8     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 426bbd8: 1400001e     	b	0x426bc50 <_ChromeMain+0x42669b4>
 426bbdc: aa1703e0     	mov	x0, x23
 426bbe0: 1400002d     	b	0x426bc94 <_ChromeMain+0x42669f8>
 426bbe4: f85803ba     	ldur	x26, [x29, #-0x80]
 426bbe8: b4fffb1a     	cbz	x26, 0x426bb48 <_ChromeMain+0x42668ac>
 426bbec: 6f00e400     	movi.2d	v0, #0000000000000000
 426bbf0: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 426bbf4: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 426bbf8: ad0403e0     	stp	q0, q0, [sp, #0x80]
 426bbfc: ad0303e0     	stp	q0, q0, [sp, #0x60]
 426bc00: ad0203e0     	stp	q0, q0, [sp, #0x40]
 426bc04: 3d800fe0     	str	q0, [sp, #0x30]
 426bc08: aa1903e0     	mov	x0, x25
 426bc0c: b004ac81     	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 426bc10: 91307021     	add	x1, x1, #0xc1c
 426bc14: 528000a2     	mov	w2, #0x5                ; =5
 426bc18: 9776f79a     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 426bc1c: f9400ff4     	ldr	x20, [sp, #0x18]
 426bc20: b4fffbc0     	cbz	x0, 0x426bb98 <_ChromeMain+0x42668fc>
 426bc24: 9100c3e8     	add	x8, sp, #0x30
 426bc28: eb00011f     	cmp	x8, x0
 426bc2c: 54000120     	b.eq	0x426bc50 <_ChromeMain+0x42669b4>
 426bc30: 39c11fe9     	ldrsb	w9, [sp, #0x47]
 426bc34: 39405c08     	ldrb	w8, [x0, #0x17]
 426bc38: 37f80da9     	tbnz	w9, #0x1f, 0x426bdec <_ChromeMain+0x4266b50>
 426bc3c: 373ffc88     	tbnz	w8, #0x7, 0x426bbcc <_ChromeMain+0x4266930>
 426bc40: 3dc00000     	ldr	q0, [x0]
 426bc44: f9400808     	ldr	x8, [x0, #0x10]
 426bc48: f90023e8     	str	x8, [sp, #0x40]
 426bc4c: 3d800fe0     	str	q0, [sp, #0x30]
 426bc50: f94067f7     	ldr	x23, [sp, #0xc8]
 426bc54: b4000397     	cbz	x23, 0x426bcc4 <_ChromeMain+0x4266a28>
 426bc58: f9406be8     	ldr	x8, [sp, #0xd0]
 426bc5c: 52801609     	mov	w9, #0xb0               ; =176
 426bc60: 9b097d09     	mul	x9, x8, x9
 426bc64: b4fffbc9     	cbz	x9, 0x426bbdc <_ChromeMain+0x4266940>
 426bc68: 8b0902e9     	add	x9, x23, x9
 426bc6c: d102c120     	sub	x0, x9, #0xb0
 426bc70: 928015e9     	mov	x9, #-0xb0              ; =-176
 426bc74: 9b097d14     	mul	x20, x8, x9
 426bc78: b40009a0     	cbz	x0, 0x426bdac <_ChromeMain+0x4266b10>
 426bc7c: 97fffdd1     	bl	0x426b3c0 <_ChromeMain+0x4266124>
 426bc80: d102c000     	sub	x0, x0, #0xb0
 426bc84: b102c294     	adds	x20, x20, #0xb0
 426bc88: 54ffff81     	b.ne	0x426bc78 <_ChromeMain+0x42669dc>
 426bc8c: f94067e0     	ldr	x0, [sp, #0xc8]
 426bc90: f9400ff4     	ldr	x20, [sp, #0x18]
 426bc94: cb0002e8     	sub	x8, x23, x0
 426bc98: 9344fd08     	asr	x8, x8, #4
 426bc9c: d2917469     	mov	x9, #0x8ba3             ; =35747
 426bca0: f2b745c9     	movk	x9, #0xba2e, lsl #16
 426bca4: f2d45d09     	movk	x9, #0xa2e8, lsl #32
 426bca8: f2e5d169     	movk	x9, #0x2e8b, lsl #48
 426bcac: 9b097d08     	mul	x8, x8, x9
 426bcb0: f9006be8     	str	x8, [sp, #0xd0]
 426bcb4: f9406fe8     	ldr	x8, [sp, #0xd8]
 426bcb8: 52801609     	mov	w9, #0xb0               ; =176
 426bcbc: 9b097d01     	mul	x1, x8, x9
 426bcc0: 96f6747e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426bcc4: f85783a8     	ldur	x8, [x29, #-0x88]
 426bcc8: f85883a9     	ldur	x9, [x29, #-0x78]
 426bccc: a90cebe8     	stp	x8, x26, [sp, #0xc8]
 426bcd0: f9006fe9     	str	x9, [sp, #0xd8]
 426bcd4: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 426bcd8: f81783bf     	stur	xzr, [x29, #-0x88]
 426bcdc: f9400a88     	ldr	x8, [x20, #0x10]
 426bce0: f94007ea     	ldr	x10, [sp, #0x8]
 426bce4: eb08015f     	cmp	x10, x8
 426bce8: 54000920     	b.eq	0x426be0c <_ChromeMain+0x4266b70>
 426bcec: 52801608     	mov	w8, #0xb0               ; =176
 426bcf0: f94003e9     	ldr	x9, [sp]
 426bcf4: 9b082554     	madd	x20, x10, x8, x9
 426bcf8: 9004ac37     	adrp	x23, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426bcfc: 912582f7     	add	x23, x23, #0x960
 426bd00: b4000574     	cbz	x20, 0x426bdac <_ChromeMain+0x4266b10>
 426bd04: 3dc00fe0     	ldr	q0, [sp, #0x30]
 426bd08: f94023e8     	ldr	x8, [sp, #0x40]
 426bd0c: f9000a88     	str	x8, [x20, #0x10]
 426bd10: 3d800280     	str	q0, [x20]
 426bd14: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 426bd18: f9001bff     	str	xzr, [sp, #0x30]
 426bd1c: aa1403e0     	mov	x0, x20
 426bd20: 38018c1f     	strb	wzr, [x0, #0x18]!
 426bd24: 3901e01f     	strb	wzr, [x0, #0x78]
 426bd28: 394303e8     	ldrb	w8, [sp, #0xc0]
 426bd2c: 360000c8     	tbz	w8, #0x0, 0x426bd44 <_ChromeMain+0x4266aa8>
 426bd30: 9100c3e8     	add	x8, sp, #0x30
 426bd34: 91006101     	add	x1, x8, #0x18
 426bd38: 96fdbc43     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 426bd3c: 52800028     	mov	w8, #0x1                ; =1
 426bd40: 39024288     	strb	w8, [x20, #0x90]
 426bd44: f94067e8     	ldr	x8, [sp, #0xc8]
 426bd48: f90067ff     	str	xzr, [sp, #0xc8]
 426bd4c: f9004e88     	str	x8, [x20, #0x98]
 426bd50: f9406be8     	ldr	x8, [sp, #0xd0]
 426bd54: f9006bff     	str	xzr, [sp, #0xd0]
 426bd58: f9005288     	str	x8, [x20, #0xa0]
 426bd5c: f9406fe8     	ldr	x8, [sp, #0xd8]
 426bd60: f9006fff     	str	xzr, [sp, #0xd8]
 426bd64: f9005688     	str	x8, [x20, #0xa8]
 426bd68: 9102c280     	add	x0, x20, #0xb0
 426bd6c: f9400ff4     	ldr	x20, [sp, #0x18]
 426bd70: f9400288     	ldr	x8, [x20]
 426bd74: f90003e8     	str	x8, [sp]
 426bd78: eb080008     	subs	x8, x0, x8
 426bd7c: 9344fd08     	asr	x8, x8, #4
 426bd80: d2917469     	mov	x9, #0x8ba3             ; =35747
 426bd84: f2b745c9     	movk	x9, #0xba2e, lsl #16
 426bd88: f2d45d09     	movk	x9, #0xa2e8, lsl #32
 426bd8c: f2e5d169     	movk	x9, #0x2e8b, lsl #48
 426bd90: 9b097d08     	mul	x8, x8, x9
 426bd94: f90007e8     	str	x8, [sp, #0x8]
 426bd98: f9000688     	str	x8, [x20, #0x8]
 426bd9c: 54000080     	b.eq	0x426bdac <_ChromeMain+0x4266b10>
 426bda0: 9100c3e0     	add	x0, sp, #0x30
 426bda4: 97fffd87     	bl	0x426b3c0 <_ChromeMain+0x4266124>
 426bda8: 17fffe46     	b	0x426b6c0 <_ChromeMain+0x4266424>
 426bdac: d4200020     	brk	#0x1
 426bdb0: 3cc20100     	ldur	q0, [x8, #0x20]
 426bdb4: f8430108     	ldur	x8, [x8, #0x30]
 426bdb8: f81a03a8     	stur	x8, [x29, #-0x60]
 426bdbc: 3c9903a0     	stur	q0, [x29, #-0x70]
 426bdc0: 17fffefe     	b	0x426b9b8 <_ChromeMain+0x426671c>
 426bdc4: f8420101     	ldur	x1, [x8, #0x20]
 426bdc8: 8b1b0288     	add	x8, x20, x27
 426bdcc: f9401502     	ldr	x2, [x8, #0x28]
 426bdd0: d101c3a0     	sub	x0, x29, #0x70
 426bdd4: 96f6b111     	bl	0x18218 <_ChromeMain+0x12f7c>
 426bdd8: 17fffef4     	b	0x426b9a8 <_ChromeMain+0x426670c>
 426bddc: a9420901     	ldp	x1, x2, [x8, #0x20]
 426bde0: d101c3a0     	sub	x0, x29, #0x70
 426bde4: 96f6b10d     	bl	0x18218 <_ChromeMain+0x12f7c>
 426bde8: 17fffef4     	b	0x426b9b8 <_ChromeMain+0x426671c>
 426bdec: 13001d09     	sxtb	w9, w8
 426bdf0: 7100013f     	cmp	w9, #0x0
 426bdf4: a9402809     	ldp	x9, x10, [x0]
 426bdf8: 9a804121     	csel	x1, x9, x0, mi
 426bdfc: 9a884142     	csel	x2, x10, x8, mi
 426be00: 9100c3e0     	add	x0, sp, #0x30
 426be04: 9708f37f     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 426be08: 17ffff92     	b	0x426bc50 <_ChromeMain+0x42669b4>
 426be0c: 9100c3e1     	add	x1, sp, #0x30
 426be10: f9400fe0     	ldr	x0, [sp, #0x18]
 426be14: 940006da     	bl	0x426d97c <_ChromeMain+0x42686e0>
 426be18: 9004ac37     	adrp	x23, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426be1c: 912582f7     	add	x23, x23, #0x960
 426be20: 17ffffd3     	b	0x426bd6c <_ChromeMain+0x4266ad0>
 426be24: d4200000     	brk	#0
 426be28: d4400000     	hlt	#0
 426be2c: d4200020     	brk	#0x1
 426be30: d4200000     	brk	#0
 426be34: d4400000     	hlt	#0
 426be38: d4200020     	brk	#0x1
 426be3c: 7103fd3f     	cmp	w9, #0xff
 426be40: 54000081     	b.ne	0x426be50 <_ChromeMain+0x4266bb4>
 426be44: b004abc0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 426be48: 913be000     	add	x0, x0, #0xef8
 426be4c: 9426ed11     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 426be50: b004abc0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 426be54: 913c6000     	add	x0, x0, #0xf18
 426be58: 9426ed0e     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 426be5c: 00000000     	udf	#0x0
