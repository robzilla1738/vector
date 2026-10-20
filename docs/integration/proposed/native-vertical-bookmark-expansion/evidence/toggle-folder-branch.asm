
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4614898: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 461489c: a90167fa     	stp	x26, x25, [sp, #0x10]
 46148a0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 46148a4: a90357f6     	stp	x22, x21, [sp, #0x30]
 46148a8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 46148ac: a9057bfd     	stp	x29, x30, [sp, #0x50]
 46148b0: 910143fd     	add	x29, sp, #0x50
 46148b4: d11503ff     	sub	sp, sp, #0x540
 46148b8: b4001021     	cbz	x1, 0x4614abc <_ChromeMain+0x460f820>
 46148bc: aa0003f3     	mov	x19, x0
 46148c0: f9428c08     	ldr	x8, [x0, #0x518]
 46148c4: b4000fc8     	cbz	x8, 0x4614abc <_ChromeMain+0x460f820>
 46148c8: aa0103f4     	mov	x20, x1
 46148cc: b940f828     	ldr	w8, [x1, #0xf8]
 46148d0: 340007a8     	cbz	w8, 0x46149c4 <_ChromeMain+0x460f728>
 46148d4: f940328a     	ldr	x10, [x20, #0x60]
 46148d8: f9430e68     	ldr	x8, [x19, #0x618]
 46148dc: f943126c     	ldr	x12, [x19, #0x620]
 46148e0: d37df189     	lsl	x9, x12, #3
 46148e4: 9340f18b     	sbfx	x11, x12, #0, #61
 46148e8: aa0803ed     	mov	x13, x8
 46148ec: b4000189     	cbz	x9, 0x461491c <_ChromeMain+0x460f680>
 46148f0: aa0803ed     	mov	x13, x8
 46148f4: aa0b03ee     	mov	x14, x11
 46148f8: d341fdcf     	lsr	x15, x14, #1
 46148fc: 8b0f0db0     	add	x16, x13, x15, lsl #3
 4614900: f8408611     	ldr	x17, [x16], #0x8
 4614904: aa6e07e0     	mvn	x0, x14, lsr #1
 4614908: 8b0001ce     	add	x14, x14, x0
 461490c: eb0a023f     	cmp	x17, x10
 4614910: 9a8fb1ce     	csel	x14, x14, x15, lt
 4614914: 9a8db20d     	csel	x13, x16, x13, lt
 4614918: b5ffff0e     	cbnz	x14, 0x46148f8 <_ChromeMain+0x460f65c>
 461491c: 8b0c0d0c     	add	x12, x8, x12, lsl #3
 4614920: eb0c01bf     	cmp	x13, x12
 4614924: 54001680     	b.eq	0x4614bf4 <_ChromeMain+0x460f958>
 4614928: f94001ad     	ldr	x13, [x13]
 461492c: eb0d015f     	cmp	x10, x13
 4614930: 5400162b     	b.lt	0x4614bf4 <_ChromeMain+0x460f958>
 4614934: aa0803f4     	mov	x20, x8
 4614938: b4000149     	cbz	x9, 0x4614960 <_ChromeMain+0x460f6c4>
 461493c: d341fd6d     	lsr	x13, x11, #1
 4614940: 8b0d0e8e     	add	x14, x20, x13, lsl #3
 4614944: f84085cf     	ldr	x15, [x14], #0x8
 4614948: aa6b07f0     	mvn	x16, x11, lsr #1
 461494c: 8b10016b     	add	x11, x11, x16
 4614950: eb0a01ff     	cmp	x15, x10
 4614954: 9a8db16b     	csel	x11, x11, x13, lt
 4614958: 9a94b1d4     	csel	x20, x14, x20, lt
 461495c: b5ffff0b     	cbnz	x11, 0x461493c <_ChromeMain+0x460f6a0>
 4614960: eb0c029f     	cmp	x20, x12
 4614964: 540040a0     	b.eq	0x4615178 <_ChromeMain+0x460fedc>
 4614968: f940028b     	ldr	x11, [x20]
 461496c: 9100228c     	add	x12, x20, #0x8
 4614970: eb0b015f     	cmp	x10, x11
 4614974: 9a8cb28a     	csel	x10, x20, x12, lt
 4614978: eb14014b     	subs	x11, x10, x20
 461497c: 54003fc3     	b.lo	0x4615174 <_ChromeMain+0x460fed8>
 4614980: eb0a029f     	cmp	x20, x10
 4614984: 540013c0     	b.eq	0x4614bfc <_ChromeMain+0x460f960>
 4614988: cb0a0108     	sub	x8, x8, x10
 461498c: 8b090115     	add	x21, x8, x9
 4614990: 8b0b0281     	add	x1, x20, x11
 4614994: aa1403e0     	mov	x0, x20
 4614998: aa1503e2     	mov	x2, x21
 461499c: 94e7ea4c     	bl	0x800f2cc <_ChromeMain+0x800a030>
 46149a0: 8b150288     	add	x8, x20, x21
 46149a4: f9430e69     	ldr	x9, [x19, #0x618]
 46149a8: f943126a     	ldr	x10, [x19, #0x620]
 46149ac: 8b0a0d2a     	add	x10, x9, x10, lsl #3
 46149b0: eb08015f     	cmp	x10, x8
 46149b4: 54000d00     	b.eq	0x4614b54 <_ChromeMain+0x460f8b8>
 46149b8: f100214a     	subs	x10, x10, #0x8
 46149bc: 54ffffa1     	b.ne	0x46149b0 <_ChromeMain+0x460f714>
 46149c0: 140001ed     	b	0x4615174 <_ChromeMain+0x460fed8>
 46149c4: b9405048     	ldr	w8, [x2, #0x50]
 46149c8: 52800349     	mov	w9, #0x1a               ; =26
 46149cc: 0a090109     	and	w9, w8, w9
 46149d0: 7100613f     	cmp	w9, #0x18
 46149d4: 54000100     	b.eq	0x46149f4 <_ChromeMain+0x460f758>
 46149d8: 52820209     	mov	w9, #0x1010             ; =4112
 46149dc: 6a09011f     	tst	w8, w9
 46149e0: 54001a00     	b.eq	0x4614d20 <_ChromeMain+0x460fa84>
 46149e4: 721f011f     	tst	w8, #0x2
 46149e8: 52800068     	mov	w8, #0x3                ; =3
 46149ec: 1a881515     	cinc	w21, w8, eq
 46149f0: 14000002     	b	0x46149f8 <_ChromeMain+0x460f75c>
 46149f4: 52800195     	mov	w21, #0xc               ; =12
 46149f8: 910043e0     	add	x0, sp, #0x10
 46149fc: 5280a001     	mov	w1, #0x500              ; =1280
 4614a00: 94e7d384     	bl	0x8009810 <_ChromeMain+0x8004574>
 4614a04: f9428e61     	ldr	x1, [x19, #0x518]
 4614a08: 910043e0     	add	x0, sp, #0x10
 4614a0c: 91020282     	add	x2, x20, #0x80
 4614a10: 52800043     	mov	w3, #0x2                ; =2
 4614a14: 97aedf32     	bl	0x31cc6dc <_ChromeMain+0x31c7440>
 4614a18: b90283f5     	str	w21, [sp, #0x280]
 4614a1c: 52800028     	mov	w8, #0x1                ; =1
 4614a20: b902dbe8     	str	w8, [sp, #0x2d8]
 4614a24: 710012bf     	cmp	w21, #0x4
 4614a28: 540005a8     	b.hi	0x4614adc <_ChromeMain+0x460f840>
 4614a2c: b0054775     	adrp	x21, 0xef01000 <dyld_stub_binder+0xef01000>
 4614a30: b946caa8     	ldr	w8, [x21, #0x6c8]
 4614a34: 11000508     	add	w8, w8, #0x1
 4614a38: b906caa8     	str	w8, [x21, #0x6c8]
 4614a3c: aa1303e0     	mov	x0, x19
 4614a40: aa1403e1     	mov	x1, x20
 4614a44: 94001d22     	bl	0x461becc <_ChromeMain+0x4616c30>
 4614a48: 381883bf     	sturb	wzr, [x29, #-0x78]
 4614a4c: 910043e0     	add	x0, sp, #0x10
 4614a50: d101e3a1     	sub	x1, x29, #0x78
 4614a54: 97c2c0bb     	bl	0x36c4d40 <_ChromeMain+0x36bfaa4>
 4614a58: b5000700     	cbnz	x0, 0x4614b38 <_ChromeMain+0x460f89c>
 4614a5c: f9444e74     	ldr	x20, [x19, #0x898]
 4614a60: b4000574     	cbz	x20, 0x4614b0c <_ChromeMain+0x460f870>
 4614a64: 52800028     	mov	w8, #0x1                ; =1
 4614a68: b8280288     	ldadd	w8, w8, [x20]
 4614a6c: 7100011f     	cmp	w8, #0x0
 4614a70: 540038ed     	b.le	0x461518c <_ChromeMain+0x460fef0>
 4614a74: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4614a78: 6b09011f     	cmp	w8, w9
 4614a7c: 540038e0     	b.eq	0x4615198 <_ChromeMain+0x460fefc>
 4614a80: f9444e68     	ldr	x8, [x19, #0x898]
 4614a84: f9400508     	ldr	x8, [x8, #0x8]
 4614a88: aa1403e0     	mov	x0, x20
 4614a8c: d63f0100     	blr	x8
 4614a90: 12800008     	mov	w8, #-0x1               ; =-1
 4614a94: b8e80288     	ldaddal	w8, w8, [x20]
 4614a98: 7100051f     	cmp	w8, #0x1
 4614a9c: 54002a80     	b.eq	0x4614fec <_ChromeMain+0x460fd50>
 4614aa0: b946caa8     	ldr	w8, [x21, #0x6c8]
 4614aa4: 7100011f     	cmp	w8, #0x0
 4614aa8: 540036cd     	b.le	0x4615180 <_ChromeMain+0x460fee4>
 4614aac: 51000508     	sub	w8, w8, #0x1
 4614ab0: b906caa8     	str	w8, [x21, #0x6c8]
 4614ab4: 910043e0     	add	x0, sp, #0x10
 4614ab8: 97aedf60     	bl	0x31cc838 <_ChromeMain+0x31c759c>
 4614abc: 911503ff     	add	sp, sp, #0x540
 4614ac0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4614ac4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4614ac8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4614acc: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4614ad0: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4614ad4: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4614ad8: d65f03c0     	ret
 4614adc: 381883bf     	sturb	wzr, [x29, #-0x78]
 4614ae0: 910043e0     	add	x0, sp, #0x10
 4614ae4: d101e3a1     	sub	x1, x29, #0x78
 4614ae8: 97c2c096     	bl	0x36c4d40 <_ChromeMain+0x36bfaa4>
 4614aec: b4fffe40     	cbz	x0, 0x4614ab4 <_ChromeMain+0x460f818>
 4614af0: 12800008     	mov	w8, #-0x1               ; =-1
 4614af4: b8e80008     	ldaddal	w8, w8, [x0]
 4614af8: 7100051f     	cmp	w8, #0x1
 4614afc: 54fffdc1     	b.ne	0x4614ab4 <_ChromeMain+0x460f818>
 4614b00: 52800101     	mov	w1, #0x8                ; =8
 4614b04: 96e7d0ed     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4614b08: 17ffffeb     	b	0x4614ab4 <_ChromeMain+0x460f818>
 4614b0c: f9436274     	ldr	x20, [x19, #0x6c0]
 4614b10: b4fffc94     	cbz	x20, 0x4614aa0 <_ChromeMain+0x460f804>
 4614b14: 52800028     	mov	w8, #0x1                ; =1
 4614b18: b8280288     	ldadd	w8, w8, [x20]
 4614b1c: 7100011f     	cmp	w8, #0x0
 4614b20: 540035ed     	b.le	0x46151dc <_ChromeMain+0x460ff40>
 4614b24: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4614b28: 6b09011f     	cmp	w8, w9
 4614b2c: 540035e0     	b.eq	0x46151e8 <_ChromeMain+0x460ff4c>
 4614b30: f9436268     	ldr	x8, [x19, #0x6c0]
 4614b34: 17ffffd4     	b	0x4614a84 <_ChromeMain+0x460f7e8>
 4614b38: 12800008     	mov	w8, #-0x1               ; =-1
 4614b3c: b8e80008     	ldaddal	w8, w8, [x0]
 4614b40: 7100051f     	cmp	w8, #0x1
 4614b44: 54fff8c1     	b.ne	0x4614a5c <_ChromeMain+0x460f7c0>
 4614b48: 52800101     	mov	w1, #0x8                ; =8
 4614b4c: 96e7d0db     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4614b50: 17ffffc3     	b	0x4614a5c <_ChromeMain+0x460f7c0>
 4614b54: cb090108     	sub	x8, x8, x9
 4614b58: 9343fd08     	asr	x8, x8, #3
 4614b5c: f9031268     	str	x8, [x19, #0x620]
 4614b60: 14000027     	b	0x4614bfc <_ChromeMain+0x460f960>
 4614b64: f85883a8     	ldur	x8, [x29, #-0x78]
 4614b68: 3cc082a0     	ldur	q0, [x21, #0x8]
 4614b6c: a938ffbf     	stp	xzr, xzr, [x29, #-0x78]
 4614b70: f81983bf     	stur	xzr, [x29, #-0x68]
 4614b74: f9000be8     	str	x8, [sp, #0x10]
 4614b78: 3c8183e0     	stur	q0, [sp, #0x18]
 4614b7c: 528000e8     	mov	w8, #0x7                ; =7
 4614b80: 3900a3e8     	strb	w8, [sp, #0x28]
 4614b84: d00446a1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 4614b88: 91191c21     	add	x1, x1, #0x647
 4614b8c: 910043e3     	add	x3, sp, #0x10
 4614b90: aa1403e0     	mov	x0, x20
 4614b94: 52800602     	mov	w2, #0x30               ; =48
 4614b98: 973bd344     	bl	0x15098a8 <_ChromeMain+0x150460c>
 4614b9c: 910043e0     	add	x0, sp, #0x10
 4614ba0: 9740270d     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 4614ba4: f85883a1     	ldur	x1, [x29, #-0x78]
 4614ba8: b5000ae1     	cbnz	x1, 0x4614d04 <_ChromeMain+0x460fa68>
 4614bac: 395bce68     	ldrb	w8, [x19, #0x6f3]
 4614bb0: 34000548     	cbz	w8, 0x4614c58 <_ChromeMain+0x460f9bc>
 4614bb4: 395bd26a     	ldrb	w10, [x19, #0x6f4]
 4614bb8: 52800028     	mov	w8, #0x1                ; =1
 4614bbc: 52800029     	mov	w9, #0x1                ; =1
 4614bc0: 3400004a     	cbz	w10, 0x4614bc8 <_ChromeMain+0x460f92c>
 4614bc4: 395bd669     	ldrb	w9, [x19, #0x6f5]
 4614bc8: 391bd669     	strb	w9, [x19, #0x6f5]
 4614bcc: 391bd268     	strb	w8, [x19, #0x6f4]
 4614bd0: 17ffffbb     	b	0x4614abc <_ChromeMain+0x460f820>
 4614bd4: f9403288     	ldr	x8, [x20, #0x60]
 4614bd8: f9000be8     	str	x8, [sp, #0x10]
 4614bdc: 91186260     	add	x0, x19, #0x618
 4614be0: 910043e1     	add	x1, sp, #0x10
 4614be4: 910043e2     	add	x2, sp, #0x10
 4614be8: 952937bd     	bl	0x9062adc <_ChromeMain+0x905d840>
 4614bec: f9401e94     	ldr	x20, [x20, #0x38]
 4614bf0: b4000074     	cbz	x20, 0x4614bfc <_ChromeMain+0x460f960>
 4614bf4: b940fa88     	ldr	w8, [x20, #0xf8]
 4614bf8: 35fffee8     	cbnz	w8, 0x4614bd4 <_ChromeMain+0x460f938>
 4614bfc: f9428e68     	ldr	x8, [x19, #0x518]
 4614c00: b4fffd68     	cbz	x8, 0x4614bac <_ChromeMain+0x460f910>
 4614c04: f9402100     	ldr	x0, [x8, #0x40]
 4614c08: b4fffd20     	cbz	x0, 0x4614bac <_ChromeMain+0x460f910>
 4614c0c: f9400008     	ldr	x8, [x0]
 4614c10: f940a508     	ldr	x8, [x8, #0x148]
 4614c14: d63f0100     	blr	x8
 4614c18: f9400008     	ldr	x8, [x0]
 4614c1c: f940b508     	ldr	x8, [x8, #0x168]
 4614c20: d63f0100     	blr	x8
 4614c24: b4fffc40     	cbz	x0, 0x4614bac <_ChromeMain+0x460f910>
 4614c28: aa0003f4     	mov	x20, x0
 4614c2c: d101e3b5     	sub	x21, x29, #0x78
 4614c30: f81983bf     	stur	xzr, [x29, #-0x68]
 4614c34: 6f00e400     	movi.2d	v0, #0000000000000000
 4614c38: 3d8002a0     	str	q0, [x21]
 4614c3c: f9431268     	ldr	x8, [x19, #0x620]
 4614c40: d37df116     	lsl	x22, x8, #3
 4614c44: b4000076     	cbz	x22, 0x4614c50 <_ChromeMain+0x460f9b4>
 4614c48: f9430e77     	ldr	x23, [x19, #0x618]
 4614c4c: 14000025     	b	0x4614ce0 <_ChromeMain+0x460fa44>
 4614c50: d2800008     	mov	x8, #0x0                ; =0
 4614c54: 17ffffc6     	b	0x4614b6c <_ChromeMain+0x460f8d0>
 4614c58: 911bce74     	add	x20, x19, #0x6f3
 4614c5c: 925e7695     	and	x21, x20, #0xfffffffc00000000
 4614c60: d0052cf6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4614c64: f94046c8     	ldr	x8, [x22, #0x88]
 4614c68: eb0802bf     	cmp	x21, x8
 4614c6c: 54000060     	b.eq	0x4614c78 <_ChromeMain+0x460f9dc>
 4614c70: 52800017     	mov	w23, #0x0               ; =0
 4614c74: 14000004     	b	0x4614c84 <_ChromeMain+0x460f9e8>
 4614c78: 911bce60     	add	x0, x19, #0x6f3
 4614c7c: 96e7fda0     	bl	0x142fc <_ChromeMain+0xf060>
 4614c80: 39400297     	ldrb	w23, [x20]
 4614c84: 52800028     	mov	w8, #0x1                ; =1
 4614c88: 391bce68     	strb	w8, [x19, #0x6f3]
 4614c8c: 391bd27f     	strb	wzr, [x19, #0x6f4]
 4614c90: 12000101     	and	w1, w8, #0x1
 4614c94: aa1303e0     	mov	x0, x19
 4614c98: 940003da     	bl	0x4615c00 <_ChromeMain+0x4610964>
 4614c9c: 395bd668     	ldrb	w8, [x19, #0x6f5]
 4614ca0: 395bd269     	ldrb	w9, [x19, #0x6f4]
 4614ca4: 3707ff49     	tbnz	w9, #0x0, 0x4614c8c <_ChromeMain+0x460f9f0>
 4614ca8: 39000297     	strb	w23, [x20]
 4614cac: f94046c8     	ldr	x8, [x22, #0x88]
 4614cb0: eb0802bf     	cmp	x21, x8
 4614cb4: 54fff041     	b.ne	0x4614abc <_ChromeMain+0x460f820>
 4614cb8: aa1403e0     	mov	x0, x20
 4614cbc: 96e83760     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4614cc0: 17ffff7f     	b	0x4614abc <_ChromeMain+0x460f820>
 4614cc4: f9400be0     	ldr	x0, [sp, #0x10]
 4614cc8: f94013e8     	ldr	x8, [sp, #0x20]
 4614ccc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4614cd0: 96e7d07a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4614cd4: 910022f7     	add	x23, x23, #0x8
 4614cd8: f10022d6     	subs	x22, x22, #0x8
 4614cdc: 54fff440     	b.eq	0x4614b64 <_ChromeMain+0x460f8c8>
 4614ce0: f94002e0     	ldr	x0, [x23]
 4614ce4: 910043e8     	add	x8, sp, #0x10
 4614ce8: 974be26f     	bl	0x190d6a4 <_ChromeMain+0x1908408>
 4614cec: d101e3a0     	sub	x0, x29, #0x78
 4614cf0: 910043e1     	add	x1, sp, #0x10
 4614cf4: 975143d1     	bl	0x1a65c38 <_ChromeMain+0x1a6099c>
 4614cf8: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 4614cfc: 36fffec8     	tbz	w8, #0x1f, 0x4614cd4 <_ChromeMain+0x460fa38>
 4614d00: 17fffff1     	b	0x4614cc4 <_ChromeMain+0x460fa28>
 4614d04: d101e3a0     	sub	x0, x29, #0x78
 4614d08: 9714487a     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 4614d0c: f85883a0     	ldur	x0, [x29, #-0x78]
 4614d10: f85983a8     	ldur	x8, [x29, #-0x68]
 4614d14: d37be901     	lsl	x1, x8, #5
 4614d18: 96e7d068     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4614d1c: 17ffffa4     	b	0x4614bac <_ChromeMain+0x460f910>
 4614d20: 52800149     	mov	w9, #0xa                ; =10
 4614d24: 721f011f     	tst	w8, #0x2
 4614d28: 528000ca     	mov	w10, #0x6               ; =6
 4614d2c: 1a8a1555     	cinc	w21, w10, eq
 4614d30: 0a090108     	and	w8, w8, w9
 4614d34: 35ffe628     	cbnz	w8, 0x46149f8 <_ChromeMain+0x460f75c>
 4614d38: f9403281     	ldr	x1, [x20, #0x60]
 4614d3c: aa1303e0     	mov	x0, x19
 4614d40: 940002cc     	bl	0x4615870 <_ChromeMain+0x46105d4>
 4614d44: d360fc08     	lsr	x8, x0, #32
 4614d48: b5001748     	cbnz	x8, 0x4615030 <_ChromeMain+0x460fd94>
 4614d4c: f9429268     	ldr	x8, [x19, #0x520]
 4614d50: 52800075     	mov	w21, #0x3               ; =3
 4614d54: b4ffe528     	cbz	x8, 0x46149f8 <_ChromeMain+0x460f75c>
 4614d58: 39426289     	ldrb	w9, [x20, #0x98]
 4614d5c: 3607e4e9     	tbz	w9, #0x0, 0x46149f8 <_ChromeMain+0x460f75c>
 4614d60: f9404901     	ldr	x1, [x8, #0x90]
 4614d64: b40002a1     	cbz	x1, 0x4614db8 <_ChromeMain+0x460fb1c>
 4614d68: f9400100     	ldr	x0, [x8]
 4614d6c: 96f5d5f0     	bl	0x38a52c <_ChromeMain+0x385290>
 4614d70: 7200003f     	tst	w1, #0x1
 4614d74: 5a9f1009     	csinv	w9, w0, wzr, ne
 4614d78: f9429268     	ldr	x8, [x19, #0x520]
 4614d7c: f9400100     	ldr	x0, [x8]
 4614d80: b9401808     	ldr	w8, [x0, #0x18]
 4614d84: 7100051f     	cmp	w8, #0x1
