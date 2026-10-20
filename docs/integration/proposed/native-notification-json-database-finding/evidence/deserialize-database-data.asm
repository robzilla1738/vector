
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 672a29c: d10683ff     	sub	sp, sp, #0x1a0
 672a2a0: a9146ffc     	stp	x28, x27, [sp, #0x140]
 672a2a4: a91567fa     	stp	x26, x25, [sp, #0x150]
 672a2a8: a9165ff8     	stp	x24, x23, [sp, #0x160]
 672a2ac: a91757f6     	stp	x22, x21, [sp, #0x170]
 672a2b0: a9184ff4     	stp	x20, x19, [sp, #0x180]
 672a2b4: a9197bfd     	stp	x29, x30, [sp, #0x190]
 672a2b8: 910643fd     	add	x29, sp, #0x190
 672a2bc: aa0103f3     	mov	x19, x1
 672a2c0: aa0003f4     	mov	x20, x0
 672a2c4: 6f00e400     	movi.2d	v0, #0000000000000000
 672a2c8: ad0803e0     	stp	q0, q0, [sp, #0x100]
 672a2cc: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 672a2d0: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 672a2d4: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 672a2d8: 3d8027e0     	str	q0, [sp, #0x90]
 672a2dc: 910243e0     	add	x0, sp, #0x90
 672a2e0: d2800001     	mov	x1, #0x0                ; =0
 672a2e4: 94e55ee5     	bl	0xa081e78 <_ChromeMain+0xa07cbdc>
 672a2e8: 39805e82     	ldrsb	x2, [x20, #0x17]
 672a2ec: b6f80042     	tbz	x2, #0x3f, 0x672a2f4 <_ChromeMain+0x6725058>
 672a2f0: a9400a94     	ldp	x20, x2, [x20]
 672a2f4: 910243e0     	add	x0, sp, #0x90
 672a2f8: aa1403e1     	mov	x1, x20
 672a2fc: 96683df1     	bl	0x139ac0 <_ChromeMain+0x134824>
 672a300: aa0003f4     	mov	x20, x0
 672a304: 35000180     	cbnz	w0, 0x672a334 <_ChromeMain+0x6725098>
 672a308: 910243e0     	add	x0, sp, #0x90
 672a30c: 94e55f0d     	bl	0xa081f40 <_ChromeMain+0xa07cca4>
 672a310: aa1403e0     	mov	x0, x20
 672a314: a9597bfd     	ldp	x29, x30, [sp, #0x190]
 672a318: a9584ff4     	ldp	x20, x19, [sp, #0x180]
 672a31c: a95757f6     	ldp	x22, x21, [sp, #0x170]
 672a320: a9565ff8     	ldp	x24, x23, [sp, #0x160]
 672a324: a95567fa     	ldp	x26, x25, [sp, #0x150]
 672a328: a9546ffc     	ldp	x28, x27, [sp, #0x140]
 672a32c: 910683ff     	add	sp, sp, #0x1a0
 672a330: d65f03c0     	ret
 672a334: f9405be8     	ldr	x8, [sp, #0xb0]
 672a338: 927ef501     	and	x1, x8, #0xfffffffffffffffc
 672a33c: aa1303e0     	mov	x0, x19
 672a340: 9675f9c9     	bl	0x4a8a64 <_ChromeMain+0x4a37c8>
 672a344: f94057e8     	ldr	x8, [sp, #0xa8]
 672a348: 927ef501     	and	x1, x8, #0xfffffffffffffffc
 672a34c: 39805c22     	ldrsb	x2, [x1, #0x17]
 672a350: b6f80042     	tbz	x2, #0x3f, 0x672a358 <_ChromeMain+0x67250bc>
 672a354: a9400821     	ldp	x1, x2, [x1]
 672a358: 910063e0     	add	x0, sp, #0x18
 672a35c: 9671179e     	bl	0x3701d4 <_ChromeMain+0x36af38>
 672a360: 91006260     	add	x0, x19, #0x18
 672a364: 910063e1     	add	x1, sp, #0x18
 672a368: 967b3dde     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 672a36c: 910063e0     	add	x0, sp, #0x18
 672a370: 9663f62f     	bl	0x27c2c <_ChromeMain+0x22990>
 672a374: f94067e8     	ldr	x8, [sp, #0xc8]
 672a378: f9004a68     	str	x8, [x19, #0x90]
 672a37c: 3943e3e8     	ldrb	w8, [sp, #0xf8]
 672a380: 390ec268     	strb	w8, [x19, #0x3b0]
 672a384: 910ed268     	add	x8, x19, #0x3b4
 672a388: fd406be0     	ldr	d0, [sp, #0xd0]
 672a38c: fd000100     	str	d0, [x8]
 672a390: f9406fe8     	ldr	x8, [sp, #0xd8]
 672a394: f901e268     	str	x8, [x19, #0x3c0]
 672a398: b940a3e8     	ldr	w8, [sp, #0xa0]
 672a39c: 36500268     	tbz	w8, #0xa, 0x672a3e8 <_ChromeMain+0x672514c>
 672a3a0: f9407be9     	ldr	x9, [sp, #0xf0]
 672a3a4: 937ffd2a     	asr	x10, x9, #63
 672a3a8: d240f94a     	eor	x10, x10, #0x7fffffffffffffff
 672a3ac: 52807d0b     	mov	w11, #0x3e8             ; =1000
 672a3b0: 9b0b7d2c     	mul	x12, x9, x11
 672a3b4: 9b4b7d29     	smulh	x9, x9, x11
 672a3b8: eb8cfd3f     	cmp	x9, x12, asr #63
 672a3bc: 9a8c1149     	csel	x9, x10, x12, ne
 672a3c0: 910fa26a     	add	x10, x19, #0x3e8
 672a3c4: 394fc26b     	ldrb	w11, [x19, #0x3f0]
 672a3c8: 350000cb     	cbnz	w11, 0x672a3e0 <_ChromeMain+0x6725144>
 672a3cc: b400152a     	cbz	x10, 0x672a670 <_ChromeMain+0x67253d4>
 672a3d0: f901f669     	str	x9, [x19, #0x3e8]
 672a3d4: 52800029     	mov	w9, #0x1                ; =1
 672a3d8: 390fc269     	strb	w9, [x19, #0x3f0]
 672a3dc: 14000006     	b	0x672a3f4 <_ChromeMain+0x6725158>
 672a3e0: f9000149     	str	x9, [x10]
 672a3e4: 14000004     	b	0x672a3f4 <_ChromeMain+0x6725158>
 672a3e8: 394fc269     	ldrb	w9, [x19, #0x3f0]
 672a3ec: 34000049     	cbz	w9, 0x672a3f4 <_ChromeMain+0x6725158>
 672a3f0: 390fc27f     	strb	wzr, [x19, #0x3f0]
 672a3f4: 36400268     	tbz	w8, #0x8, 0x672a440 <_ChromeMain+0x67251a4>
 672a3f8: f94073e9     	ldr	x9, [sp, #0xe0]
 672a3fc: 937ffd2a     	asr	x10, x9, #63
 672a400: d240f94a     	eor	x10, x10, #0x7fffffffffffffff
 672a404: 52807d0b     	mov	w11, #0x3e8             ; =1000
 672a408: 9b0b7d2c     	mul	x12, x9, x11
 672a40c: 9b4b7d29     	smulh	x9, x9, x11
 672a410: eb8cfd3f     	cmp	x9, x12, asr #63
 672a414: 9a8c1149     	csel	x9, x10, x12, ne
 672a418: 910f226a     	add	x10, x19, #0x3c8
 672a41c: 394f426b     	ldrb	w11, [x19, #0x3d0]
 672a420: 350000cb     	cbnz	w11, 0x672a438 <_ChromeMain+0x672519c>
 672a424: b400126a     	cbz	x10, 0x672a670 <_ChromeMain+0x67253d4>
 672a428: f901e669     	str	x9, [x19, #0x3c8]
 672a42c: 52800029     	mov	w9, #0x1                ; =1
 672a430: 390f4269     	strb	w9, [x19, #0x3d0]
 672a434: 14000006     	b	0x672a44c <_ChromeMain+0x67251b0>
 672a438: f9000149     	str	x9, [x10]
 672a43c: 14000004     	b	0x672a44c <_ChromeMain+0x67251b0>
 672a440: 394f4269     	ldrb	w9, [x19, #0x3d0]
 672a444: 34000049     	cbz	w9, 0x672a44c <_ChromeMain+0x67251b0>
 672a448: 390f427f     	strb	wzr, [x19, #0x3d0]
 672a44c: 364803a8     	tbz	w8, #0x9, 0x672a4c0 <_ChromeMain+0x6725224>
 672a450: f94077e8     	ldr	x8, [sp, #0xe8]
 672a454: 937ffd09     	asr	x9, x8, #63
 672a458: d240f929     	eor	x9, x9, #0x7fffffffffffffff
 672a45c: 52807d0a     	mov	w10, #0x3e8             ; =1000
 672a460: 9b0a7d0b     	mul	x11, x8, x10
 672a464: 9b4a7d08     	smulh	x8, x8, x10
 672a468: eb8bfd1f     	cmp	x8, x11, asr #63
 672a46c: 9a8b1128     	csel	x8, x9, x11, ne
 672a470: 910f6269     	add	x9, x19, #0x3d8
 672a474: 394f826a     	ldrb	w10, [x19, #0x3e0]
 672a478: 350000ca     	cbnz	w10, 0x672a490 <_ChromeMain+0x67251f4>
 672a47c: b4000fa9     	cbz	x9, 0x672a670 <_ChromeMain+0x67253d4>
 672a480: f901ee68     	str	x8, [x19, #0x3d8]
 672a484: 52800028     	mov	w8, #0x1                ; =1
 672a488: 390f8268     	strb	w8, [x19, #0x3e0]
 672a48c: 14000010     	b	0x672a4cc <_ChromeMain+0x6725230>
 672a490: f9000128     	str	x8, [x9]
 672a494: 1400000e     	b	0x672a4cc <_ChromeMain+0x6725230>
 672a498: f9406a60     	ldr	x0, [x19, #0xd0]
 672a49c: f9407268     	ldr	x8, [x19, #0xe0]
 672a4a0: d37ff901     	lsl	x1, x8, #1
 672a4a4: 96637a85     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 672a4a8: 14000030     	b	0x672a568 <_ChromeMain+0x67252cc>
 672a4ac: f9404e60     	ldr	x0, [x19, #0x98]
 672a4b0: f9405668     	ldr	x8, [x19, #0xa8]
 672a4b4: d37ff901     	lsl	x1, x8, #1
 672a4b8: 96637a80     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 672a4bc: 14000016     	b	0x672a514 <_ChromeMain+0x6725278>
 672a4c0: 394f8268     	ldrb	w8, [x19, #0x3e0]
 672a4c4: 34000048     	cbz	w8, 0x672a4cc <_ChromeMain+0x6725230>
 672a4c8: 390f827f     	strb	wzr, [x19, #0x3e0]
 672a4cc: b940ffe8     	ldr	w8, [sp, #0xfc]
 672a4d0: 7100091f     	cmp	w8, #0x2
 672a4d4: 54000048     	b.hi	0x672a4dc <_ChromeMain+0x6725240>
 672a4d8: b903fa68     	str	w8, [x19, #0x3f8]
 672a4dc: 90042aa8     	adrp	x8, 0xec7e000 <dyld_stub_binder+0xec7e000>
 672a4e0: 913ec108     	add	x8, x8, #0xfb0
 672a4e4: f9405fe9     	ldr	x9, [sp, #0xb8]
 672a4e8: f100013f     	cmp	x9, #0x0
 672a4ec: 9a890116     	csel	x22, x8, x9, eq
 672a4f0: f94026c8     	ldr	x8, [x22, #0x48]
 672a4f4: 927ef500     	and	x0, x8, #0xfffffffffffffffc
 672a4f8: 39805c01     	ldrsb	x1, [x0, #0x17]
 672a4fc: b6f80041     	tbz	x1, #0x3f, 0x672a504 <_ChromeMain+0x6725268>
 672a500: a9400400     	ldp	x0, x1, [x0]
 672a504: 910063e8     	add	x8, sp, #0x18
 672a508: 9686df82     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 672a50c: 39c2be68     	ldrsb	w8, [x19, #0xaf]
 672a510: 37fffce8     	tbnz	w8, #0x1f, 0x672a4ac <_ChromeMain+0x6725210>
 672a514: 3cc183e0     	ldur	q0, [sp, #0x18]
 672a518: 3c898260     	stur	q0, [x19, #0x98]
 672a51c: f94017e8     	ldr	x8, [sp, #0x28]
 672a520: f80a8268     	stur	x8, [x19, #0xa8]
 672a524: b9408ac8     	ldr	w8, [x22, #0x88]
 672a528: 7100091f     	cmp	w8, #0x2
 672a52c: 54000048     	b.hi	0x672a534 <_ChromeMain+0x6725298>
 672a530: b900b268     	str	w8, [x19, #0xb0]
 672a534: f9402ac8     	ldr	x8, [x22, #0x50]
 672a538: 9102e260     	add	x0, x19, #0xb8
 672a53c: 927ef501     	and	x1, x8, #0xfffffffffffffffc
 672a540: 9675f949     	bl	0x4a8a64 <_ChromeMain+0x4a37c8>
 672a544: f9402ec8     	ldr	x8, [x22, #0x58]
 672a548: 927ef500     	and	x0, x8, #0xfffffffffffffffc
 672a54c: 39805c01     	ldrsb	x1, [x0, #0x17]
 672a550: b6f80041     	tbz	x1, #0x3f, 0x672a558 <_ChromeMain+0x67252bc>
 672a554: a9400400     	ldp	x0, x1, [x0]
 672a558: 910063e8     	add	x8, sp, #0x18
 672a55c: 9686df6d     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 672a560: 39c39e68     	ldrsb	w8, [x19, #0xe7]
 672a564: 37fff9a8     	tbnz	w8, #0x1f, 0x672a498 <_ChromeMain+0x67251fc>
 672a568: 3cc183e0     	ldur	q0, [sp, #0x18]
 672a56c: 3c8d0260     	stur	q0, [x19, #0xd0]
 672a570: f94017e8     	ldr	x8, [sp, #0x28]
 672a574: f80e0268     	stur	x8, [x19, #0xe0]
 672a578: f94032c8     	ldr	x8, [x22, #0x60]
 672a57c: 9103a260     	add	x0, x19, #0xe8
 672a580: 927ef501     	and	x1, x8, #0xfffffffffffffffc
 672a584: 9675f938     	bl	0x4a8a64 <_ChromeMain+0x4a37c8>
 672a588: f94042c8     	ldr	x8, [x22, #0x80]
 672a58c: 927ef501     	and	x1, x8, #0xfffffffffffffffc
 672a590: 39805c22     	ldrsb	x2, [x1, #0x17]
 672a594: b6f80042     	tbz	x2, #0x3f, 0x672a59c <_ChromeMain+0x6725300>
 672a598: a9400821     	ldp	x1, x2, [x1]
 672a59c: 910063e0     	add	x0, sp, #0x18
 672a5a0: 9671170d     	bl	0x3701d4 <_ChromeMain+0x36af38>
 672a5a4: 91040260     	add	x0, x19, #0x100
 672a5a8: 910063e1     	add	x1, sp, #0x18
 672a5ac: 967b3d4d     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 672a5b0: 910063e0     	add	x0, sp, #0x18
 672a5b4: 9663f59e     	bl	0x27c2c <_ChromeMain+0x22990>
 672a5b8: f94036c8     	ldr	x8, [x22, #0x68]
 672a5bc: 927ef501     	and	x1, x8, #0xfffffffffffffffc
 672a5c0: 39805c22     	ldrsb	x2, [x1, #0x17]
 672a5c4: b6f80042     	tbz	x2, #0x3f, 0x672a5cc <_ChromeMain+0x6725330>
 672a5c8: a9400821     	ldp	x1, x2, [x1]
 672a5cc: 910063e0     	add	x0, sp, #0x18
 672a5d0: 96711701     	bl	0x3701d4 <_ChromeMain+0x36af38>
 672a5d4: 9105e260     	add	x0, x19, #0x178
 672a5d8: 910063e1     	add	x1, sp, #0x18
 672a5dc: 967b3d41     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 672a5e0: 910063e0     	add	x0, sp, #0x18
 672a5e4: 9663f592     	bl	0x27c2c <_ChromeMain+0x22990>
 672a5e8: f9403ec8     	ldr	x8, [x22, #0x78]
 672a5ec: 927ef501     	and	x1, x8, #0xfffffffffffffffc
 672a5f0: 39805c22     	ldrsb	x2, [x1, #0x17]
 672a5f4: b6f80042     	tbz	x2, #0x3f, 0x672a5fc <_ChromeMain+0x6725360>
 672a5f8: a9400821     	ldp	x1, x2, [x1]
 672a5fc: 910063e0     	add	x0, sp, #0x18
 672a600: 967116f5     	bl	0x3701d4 <_ChromeMain+0x36af38>
 672a604: 9107c260     	add	x0, x19, #0x1f0
 672a608: 910063e1     	add	x1, sp, #0x18
 672a60c: 967b3d35     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 672a610: 910063e0     	add	x0, sp, #0x18
 672a614: 9663f586     	bl	0x27c2c <_ChromeMain+0x22990>
 672a618: f9400ec9     	ldr	x9, [x22, #0x18]
 672a61c: 361000c9     	tbz	w9, #0x2, 0x672a634 <_ChromeMain+0x6725398>
 672a620: b94022c8     	ldr	w8, [x22, #0x20]
 672a624: 7100011f     	cmp	w8, #0x0
 672a628: 540000ad     	b.le	0x672a63c <_ChromeMain+0x67253a0>
 672a62c: 927df121     	and	x1, x9, #0xfffffffffffffff8
 672a630: 14000013     	b	0x672a67c <_ChromeMain+0x67253e0>
 672a634: f240053f     	tst	x9, #0x3
 672a638: 540001e1     	b.ne	0x672a674 <_ChromeMain+0x67253d8>
 672a63c: f9413a68     	ldr	x8, [x19, #0x270]
 672a640: d37ef509     	lsl	x9, x8, #2
 672a644: b4000129     	cbz	x9, 0x672a668 <_ChromeMain+0x67253cc>
 672a648: f941366a     	ldr	x10, [x19, #0x268]
 672a64c: cb080be8     	neg	x8, x8, lsl #2
 672a650: 8b0a0129     	add	x9, x9, x10
 672a654: d1001129     	sub	x9, x9, #0x4
 672a658: b40000c9     	cbz	x9, 0x672a670 <_ChromeMain+0x67253d4>
 672a65c: d1001129     	sub	x9, x9, #0x4
 672a660: 91001108     	add	x8, x8, #0x4
 672a664: b5ffffa8     	cbnz	x8, 0x672a658 <_ChromeMain+0x67253bc>
 672a668: f9013a7f     	str	xzr, [x19, #0x270]
 672a66c: 14000009     	b	0x672a690 <_ChromeMain+0x67253f4>
 672a670: d4200020     	brk	#0x1
 672a674: 910082c1     	add	x1, x22, #0x20
 672a678: 12000528     	and	w8, w9, #0x3
 672a67c: 8b284822     	add	x2, x1, w8, uxtw #2
 672a680: cb010048     	sub	x8, x2, x1
 672a684: 9342fd03     	asr	x3, x8, #2
 672a688: 9109a260     	add	x0, x19, #0x268
 672a68c: 940004d5     	bl	0x672b9e0 <_ChromeMain+0x6726744>
 672a690: f9404ac8     	ldr	x8, [x22, #0x90]
 672a694: f9014268     	str	x8, [x19, #0x280]
 672a698: 39423ac8     	ldrb	w8, [x22, #0x8e]
 672a69c: 390a2268     	strb	w8, [x19, #0x288]
 672a6a0: 394232c8     	ldrb	w8, [x22, #0x8c]
 672a6a4: 390a2668     	strb	w8, [x19, #0x289]
 672a6a8: 394236c8     	ldrb	w8, [x22, #0x8d]
 672a6ac: 390a2a68     	strb	w8, [x19, #0x28a]
 672a6b0: f9403ac8     	ldr	x8, [x22, #0x70]
 672a6b4: 927ef501     	and	x1, x8, #0xfffffffffffffffc
 672a6b8: 39805c28     	ldrsb	x8, [x1, #0x17]
 672a6bc: b6f80128     	tbz	x8, #0x3f, 0x672a6e0 <_ChromeMain+0x6725444>
 672a6c0: f9400428     	ldr	x8, [x1, #0x8]
 672a6c4: b4000108     	cbz	x8, 0x672a6e4 <_ChromeMain+0x6725448>
 672a6c8: f9400021     	ldr	x1, [x1]
 672a6cc: 8b080022     	add	x2, x1, x8
 672a6d0: cb010043     	sub	x3, x2, x1
 672a6d4: 910a4260     	add	x0, x19, #0x290
 672a6d8: 94000513     	bl	0x672bb24 <_ChromeMain+0x6726888>
 672a6dc: 14000008     	b	0x672a6fc <_ChromeMain+0x6725460>
 672a6e0: 35ffff68     	cbnz	w8, 0x672a6cc <_ChromeMain+0x6725430>
 672a6e4: f9414a68     	ldr	x8, [x19, #0x290]
 672a6e8: f9414e69     	ldr	x9, [x19, #0x298]
 672a6ec: cb0803e8     	neg	x8, x8
 672a6f0: eb08013f     	cmp	x9, x8
 672a6f4: 54fffbe8     	b.hi	0x672a670 <_ChromeMain+0x67253d4>
 672a6f8: f9014e7f     	str	xzr, [x19, #0x298]
 672a6fc: 910b2278     	add	x24, x19, #0x2c8
 672a700: f9416677     	ldr	x23, [x19, #0x2c8]
 672a704: f9416a6a     	ldr	x10, [x19, #0x2d0]
 672a708: d37df148     	lsl	x8, x10, #3
 672a70c: aa1703e9     	mov	x9, x23
 672a710: b4000148     	cbz	x8, 0x672a738 <_ChromeMain+0x672549c>
 672a714: cb0a0ff9     	neg	x25, x10, lsl #3
 672a718: 8b170108     	add	x8, x8, x23
 672a71c: d1002115     	sub	x21, x8, #0x8
 672a720: aa1503e0     	mov	x0, x21
 672a724: 97c7b0fe     	bl	0x5916b1c <_ChromeMain+0x5911880>
 672a728: d10022b5     	sub	x21, x21, #0x8
 672a72c: 91002339     	add	x25, x25, #0x8
 672a730: b5ffff99     	cbnz	x25, 0x672a720 <_ChromeMain+0x6725484>
 672a734: f9400309     	ldr	x9, [x24]
 672a738: cb0902e8     	sub	x8, x23, x9
 672a73c: 9343fd08     	asr	x8, x8, #3
 672a740: f9016a68     	str	x8, [x19, #0x2d0]
 672a744: aa1603e8     	mov	x8, x22
 672a748: f8430d09     	ldr	x9, [x8, #0x30]!
 672a74c: 91001d2a     	add	x10, x9, #0x7
 672a750: f240013f     	tst	x9, #0x1
 672a754: 9a8a0115     	csel	x21, x8, x10, eq
 672a758: b9800908     	ldrsw	x8, [x8, #0x8]
 672a75c: 34000d08     	cbz	w8, 0x672a8fc <_ChromeMain+0x6725660>
 672a760: d37df117     	lsl	x23, x8, #3
 672a764: 52800038     	mov	w24, #0x1               ; =1
 672a768: 14000021     	b	0x672a7ec <_ChromeMain+0x6725550>
 672a76c: f9405900     	ldr	x0, [x8, #0xb0]
 672a770: f9406108     	ldr	x8, [x8, #0xc0]
 672a774: d37ff901     	lsl	x1, x8, #1
 672a778: 966379d0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 672a77c: a9007f3f     	stp	xzr, xzr, [x25]
 672a780: f9000b3f     	str	xzr, [x25, #0x10]
 672a784: 1400000a     	b	0x672a7ac <_ChromeMain+0x6725510>
 672a788: f9401340     	ldr	x0, [x26, #0x20]
 672a78c: f9401b48     	ldr	x8, [x26, #0x30]
 672a790: d37ff901     	lsl	x1, x8, #1
 672a794: 966379c9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 672a798: a9027f5f     	stp	xzr, xzr, [x26, #0x20]
 672a79c: f803035f     	stur	xzr, [x26, #0x30]
 672a7a0: 1400002a     	b	0x672a848 <_ChromeMain+0x67255ac>
 672a7a4: 39c31d09     	ldrsb	w9, [x8, #0xc7]
 672a7a8: 37fffe29     	tbnz	w9, #0x1f, 0x672a76c <_ChromeMain+0x67254d0>
 672a7ac: 3cc183e0     	ldur	q0, [sp, #0x18]
 672a7b0: f94017e8     	ldr	x8, [sp, #0x28]
 672a7b4: f9000b28     	str	x8, [x25, #0x10]
 672a7b8: 3d800320     	str	q0, [x25]
 672a7bc: 910b2260     	add	x0, x19, #0x2c8
 672a7c0: d101a3a1     	sub	x1, x29, #0x68
 672a7c4: 97c9beef     	bl	0x599a380 <_ChromeMain+0x59950e4>
 672a7c8: f85983a0     	ldur	x0, [x29, #-0x68]
 672a7cc: f81983bf     	stur	xzr, [x29, #-0x68]
 672a7d0: b4000080     	cbz	x0, 0x672a7e0 <_ChromeMain+0x6725544>
 672a7d4: 97c7b04e     	bl	0x591690c <_ChromeMain+0x5911670>
 672a7d8: 52801a01     	mov	w1, #0xd0               ; =208
 672a7dc: 966379b7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 672a7e0: 910022b5     	add	x21, x21, #0x8
 672a7e4: f10022f7     	subs	x23, x23, #0x8
 672a7e8: 540008a0     	b.eq	0x672a8fc <_ChromeMain+0x6725660>
 672a7ec: f94002b9     	ldr	x25, [x21]
 672a7f0: f81983bf     	stur	xzr, [x29, #-0x68]
 672a7f4: 52801a00     	mov	w0, #0xd0               ; =208
 672a7f8: 966392dc     	bl	0xf368 <_ChromeMain+0xa0cc>
 672a7fc: 97c7afe0     	bl	0x591677c <_ChromeMain+0x59114e0>
 672a800: f81983a0     	stur	x0, [x29, #-0x68]
 672a804: b9403b28     	ldr	w8, [x25, #0x38]
 672a808: 7100091f     	cmp	w8, #0x2
 672a80c: 54001062     	b.hs	0x672aa18 <_ChromeMain+0x672577c>
 672a810: b8008408     	str	w8, [x0], #0x8
 672a814: f9400f28     	ldr	x8, [x25, #0x18]
 672a818: 927ef501     	and	x1, x8, #0xfffffffffffffffc
 672a81c: 9675f892     	bl	0x4a8a64 <_ChromeMain+0x4a37c8>
 672a820: f9401328     	ldr	x8, [x25, #0x20]
 672a824: 927ef500     	and	x0, x8, #0xfffffffffffffffc
 672a828: 39805c01     	ldrsb	x1, [x0, #0x17]
 672a82c: b6f80041     	tbz	x1, #0x3f, 0x672a834 <_ChromeMain+0x6725598>
 672a830: a9400400     	ldp	x0, x1, [x0]
 672a834: 910063e8     	add	x8, sp, #0x18
 672a838: 9686deb6     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 672a83c: f85983ba     	ldur	x26, [x29, #-0x68]
 672a840: 39c0df48     	ldrsb	w8, [x26, #0x37]
 672a844: 37fffa28     	tbnz	w8, #0x1f, 0x672a788 <_ChromeMain+0x67254ec>
 672a848: 3cc183e0     	ldur	q0, [sp, #0x18]
 672a84c: f94017e8     	ldr	x8, [sp, #0x28]
 672a850: f8030348     	stur	x8, [x26, #0x30]
 672a854: 3c820340     	stur	q0, [x26, #0x20]
 672a858: f9401728     	ldr	x8, [x25, #0x28]
 672a85c: 927ef501     	and	x1, x8, #0xfffffffffffffffc
 672a860: 39805c22     	ldrsb	x2, [x1, #0x17]
 672a864: b6f80042     	tbz	x2, #0x3f, 0x672a86c <_ChromeMain+0x67255d0>
 672a868: a9400821     	ldp	x1, x2, [x1]
 672a86c: 910063e0     	add	x0, sp, #0x18
 672a870: 96711659     	bl	0x3701d4 <_ChromeMain+0x36af38>
 672a874: f85983a8     	ldur	x8, [x29, #-0x68]
 672a878: 9100e100     	add	x0, x8, #0x38
 672a87c: 910063e1     	add	x1, sp, #0x18
 672a880: 967b3c98     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 672a884: 910063e0     	add	x0, sp, #0x18
 672a888: 9663f4e9     	bl	0x27c2c <_ChromeMain+0x22990>
 672a88c: 39404328     	ldrb	w8, [x25, #0x10]
 672a890: 361ff968     	tbz	w8, #0x3, 0x672a7bc <_ChromeMain+0x6725520>
 672a894: f9401b28     	ldr	x8, [x25, #0x30]
 672a898: 927ef500     	and	x0, x8, #0xfffffffffffffffc
 672a89c: 39805c01     	ldrsb	x1, [x0, #0x17]
 672a8a0: b6f80041     	tbz	x1, #0x3f, 0x672a8a8 <_ChromeMain+0x672560c>
 672a8a4: a9400400     	ldp	x0, x1, [x0]
 672a8a8: 910063e8     	add	x8, sp, #0x18
 672a8ac: 9686de99     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 672a8b0: f85983a8     	ldur	x8, [x29, #-0x68]
 672a8b4: 9102c119     	add	x25, x8, #0xb0
 672a8b8: 39432109     	ldrb	w9, [x8, #0xc8]
 672a8bc: 35fff749     	cbnz	w9, 0x672a7a4 <_ChromeMain+0x6725508>
 672a8c0: b4ffed99     	cbz	x25, 0x672a670 <_ChromeMain+0x67253d4>
 672a8c4: 3cc183e0     	ldur	q0, [sp, #0x18]
 672a8c8: f94017e9     	ldr	x9, [sp, #0x28]
 672a8cc: f9000b29     	str	x9, [x25, #0x10]
 672a8d0: 3d800320     	str	q0, [x25]
 672a8d4: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 672a8d8: f9000fff     	str	xzr, [sp, #0x18]
 672a8dc: 39032118     	strb	w24, [x8, #0xc8]
 672a8e0: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 672a8e4: 36fff6c8     	tbz	w8, #0x1f, 0x672a7bc <_ChromeMain+0x6725520>
 672a8e8: f9400fe0     	ldr	x0, [sp, #0x18]
 672a8ec: f94017e8     	ldr	x8, [sp, #0x28]
 672a8f0: d37ff901     	lsl	x1, x8, #1
 672a8f4: 96637971     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 672a8f8: 17ffffb1     	b	0x672a7bc <_ChromeMain+0x6725520>
 672a8fc: 394046c8     	ldrb	w8, [x22, #0x11]
 672a900: 36380188     	tbz	w8, #0x7, 0x672a930 <_ChromeMain+0x6725694>
 672a904: f9404ec8     	ldr	x8, [x22, #0x98]
 672a908: 910b8269     	add	x9, x19, #0x2e0
 672a90c: 394ba26a     	ldrb	w10, [x19, #0x2e8]
 672a910: 350000ca     	cbnz	w10, 0x672a928 <_ChromeMain+0x672568c>
 672a914: b4ffeae9     	cbz	x9, 0x672a670 <_ChromeMain+0x67253d4>
 672a918: f9017268     	str	x8, [x19, #0x2e0]
 672a91c: 52800028     	mov	w8, #0x1                ; =1
 672a920: 390ba268     	strb	w8, [x19, #0x2e8]
 672a924: 14000006     	b	0x672a93c <_ChromeMain+0x67256a0>
 672a928: f9000128     	str	x8, [x9]
 672a92c: 14000004     	b	0x672a93c <_ChromeMain+0x67256a0>
 672a930: 394ba268     	ldrb	w8, [x19, #0x2e8]
 672a934: 34000048     	cbz	w8, 0x672a93c <_ChromeMain+0x67256a0>
 672a938: 390ba27f     	strb	wzr, [x19, #0x2e8]
 672a93c: 3943e7e8     	ldrb	w8, [sp, #0xf9]
 672a940: 390be268     	strb	w8, [x19, #0x2f8]
 672a944: 3943ebe8     	ldrb	w8, [sp, #0xfa]
 672a948: 390ff268     	strb	w8, [x19, #0x3fc]
 672a94c: 394ea268     	ldrb	w8, [x19, #0x3a8]
 672a950: 34000088     	cbz	w8, 0x672a960 <_ChromeMain+0x67256c4>
 672a954: 910c0260     	add	x0, x19, #0x300
 672a958: 97c9bca8     	bl	0x5999bf8 <_ChromeMain+0x599495c>
 672a95c: 390ea27f     	strb	wzr, [x19, #0x3a8]
 672a960: 910243e8     	add	x8, sp, #0x90
 672a964: 9101c108     	add	x8, x8, #0x70
 672a968: b9410be9     	ldr	w9, [sp, #0x108]
 672a96c: b94107ea     	ldr	w10, [sp, #0x104]
 672a970: 6b0a013f     	cmp	w9, w10
 672a974: 54000080     	b.eq	0x672a984 <_ChromeMain+0x67256e8>
 672a978: f9408bea     	ldr	x10, [sp, #0x110]
 672a97c: f869594a     	ldr	x10, [x10, w9, uxtw #3]
 672a980: 14000003     	b	0x672a98c <_ChromeMain+0x67256f0>
 672a984: 52800009     	mov	w9, #0x0                ; =0
 672a988: d280000a     	mov	x10, #0x0               ; =0
 672a98c: a939ffbf     	stp	xzr, xzr, [x29, #-0x68]
 672a990: f81a83bf     	stur	xzr, [x29, #-0x58]
 672a994: 910003eb     	mov	x11, sp
 672a998: 91002175     	add	x21, x11, #0x8
 672a99c: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 672a9a0: f90003f5     	str	x21, [sp]
 672a9a4: a901a3ea     	stp	x10, x8, [sp, #0x18]
 672a9a8: b9002be9     	str	w9, [sp, #0x28]
 672a9ac: 910003e0     	mov	x0, sp
 672a9b0: 910063e1     	add	x1, sp, #0x18
 672a9b4: d101a3a2     	sub	x2, x29, #0x68
 672a9b8: 940004b9     	bl	0x672bc9c <_ChromeMain+0x6726a00>
 672a9bc: 91100277     	add	x23, x19, #0x400
 672a9c0: 91102276     	add	x22, x19, #0x408
 672a9c4: f9420661     	ldr	x1, [x19, #0x408]
 672a9c8: f9000ff7     	str	x23, [sp, #0x18]
 672a9cc: 910063e0     	add	x0, sp, #0x18
 672a9d0: 96726b49     	bl	0x3c56f4 <_ChromeMain+0x3c0458>
 672a9d4: a94007e8     	ldp	x8, x1, [sp]
 672a9d8: f9020268     	str	x8, [x19, #0x400]
 672a9dc: f9020661     	str	x1, [x19, #0x408]
 672a9e0: f9400be8     	ldr	x8, [sp, #0x10]
 672a9e4: f9020a68     	str	x8, [x19, #0x410]
 672a9e8: b4000148     	cbz	x8, 0x672aa10 <_ChromeMain+0x6725774>
 672a9ec: f9000836     	str	x22, [x1, #0x10]
 672a9f0: d2800001     	mov	x1, #0x0                ; =0
 672a9f4: f90003f5     	str	x21, [sp]
 672a9f8: a9007ebf     	stp	xzr, xzr, [x21]
 672a9fc: 910003e8     	mov	x8, sp
 672aa00: f9000fe8     	str	x8, [sp, #0x18]
 672aa04: 910063e0     	add	x0, sp, #0x18
 672aa08: 96726b3b     	bl	0x3c56f4 <_ChromeMain+0x3c0458>
 672aa0c: 17fffe3f     	b	0x672a308 <_ChromeMain+0x672506c>
 672aa10: f90002f6     	str	x22, [x23]
 672aa14: 17fffffa     	b	0x672a9fc <_ChromeMain+0x6725760>
 672aa18: d4200000     	brk	#0
 672aa1c: d4400000     	hlt	#0
 672aa20: d4200020     	brk	#0x1
