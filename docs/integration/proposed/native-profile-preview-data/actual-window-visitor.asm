
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 455e4ac: d10183ff     	sub	sp, sp, #0x60
 455e4b0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 455e4b4: a90357f6     	stp	x22, x21, [sp, #0x30]
 455e4b8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 455e4bc: a9057bfd     	stp	x29, x30, [sp, #0x50]
 455e4c0: 910143fd     	add	x29, sp, #0x50
 455e4c4: b40004a1     	cbz	x1, 0x455e558 <_ChromeMain+0x45592bc>
 455e4c8: aa0103f4     	mov	x20, x1
 455e4cc: aa0003f3     	mov	x19, x0
 455e4d0: 52800020     	mov	w0, #0x1                ; =1
 455e4d4: f100a028     	subs	x8, x1, #0x28
 455e4d8: 54000420     	b.eq	0x455e55c <_ChromeMain+0x45592c0>
 455e4dc: f9400269     	ldr	x9, [x19]
 455e4e0: eb09011f     	cmp	x8, x9
 455e4e4: 540003c0     	b.eq	0x455e55c <_ChromeMain+0x45592c0>
 455e4e8: f940b288     	ldr	x8, [x20, #0x160]
 455e4ec: 900532b6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 455e4f0: b40001a8     	cbz	x8, 0x455e524 <_ChromeMain+0x4559288>
 455e4f4: 91058289     	add	x9, x20, #0x160
 455e4f8: d0052baa     	adrp	x10, 0xead4000 <dyld_stub_binder+0xead4000>
 455e4fc: 9131414a     	add	x10, x10, #0xc50
 455e500: 14000003     	b	0x455e50c <_ChromeMain+0x4559270>
 455e504: f9400108     	ldr	x8, [x8]
 455e508: b40000e8     	cbz	x8, 0x455e524 <_ChromeMain+0x4559288>
 455e50c: f940110b     	ldr	x11, [x8, #0x20]
 455e510: eb0a017f     	cmp	x11, x10
 455e514: 54ffff88     	b.hi	0x455e504 <_ChromeMain+0x4559268>
 455e518: 540002e0     	b.eq	0x455e574 <_ChromeMain+0x45592d8>
 455e51c: f9400508     	ldr	x8, [x8, #0x8]
 455e520: b5ffff68     	cbnz	x8, 0x455e50c <_ChromeMain+0x4559270>
 455e524: d2800015     	mov	x21, #0x0               ; =0
 455e528: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 455e52c: f94046c9     	ldr	x9, [x22, #0x88]
 455e530: eb09011f     	cmp	x8, x9
 455e534: 54000061     	b.ne	0x455e540 <_ChromeMain+0x45592a4>
 455e538: aa1503e0     	mov	x0, x21
 455e53c: 96eb1140     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 455e540: 394522a8     	ldrb	w8, [x21, #0x148]
 455e544: 370000a8     	tbnz	w8, #0x0, 0x455e558 <_ChromeMain+0x45592bc>
 455e548: 39432288     	ldrb	w8, [x20, #0xc8]
 455e54c: 37000068     	tbnz	w8, #0x0, 0x455e558 <_ChromeMain+0x45592bc>
 455e550: b9403a88     	ldr	w8, [x20, #0x38]
 455e554: 34000248     	cbz	w8, 0x455e59c <_ChromeMain+0x4559300>
 455e558: 52800020     	mov	w0, #0x1                ; =1
 455e55c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 455e560: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 455e564: a94357f6     	ldp	x22, x21, [sp, #0x30]
 455e568: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 455e56c: 910183ff     	add	sp, sp, #0x60
 455e570: d65f03c0     	ret
 455e574: eb09011f     	cmp	x8, x9
 455e578: 54fffd60     	b.eq	0x455e524 <_ChromeMain+0x4559288>
 455e57c: f9401515     	ldr	x21, [x8, #0x28]
 455e580: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 455e584: f94046c9     	ldr	x9, [x22, #0x88]
 455e588: eb09011f     	cmp	x8, x9
 455e58c: 54fffce1     	b.ne	0x455e528 <_ChromeMain+0x455928c>
 455e590: aa1503e0     	mov	x0, x21
 455e594: 96ead75a     	bl	0x142fc <_ChromeMain+0xf060>
 455e598: 17ffffe4     	b	0x455e528 <_ChromeMain+0x455928c>
 455e59c: f9403288     	ldr	x8, [x20, #0x60]
 455e5a0: b4fffdc8     	cbz	x8, 0x455e558 <_ChromeMain+0x45592bc>
 455e5a4: f9402280     	ldr	x0, [x20, #0x40]
 455e5a8: b4fffd80     	cbz	x0, 0x455e558 <_ChromeMain+0x45592bc>
 455e5ac: f9400008     	ldr	x8, [x0]
 455e5b0: f940a508     	ldr	x8, [x8, #0x148]
 455e5b4: d63f0100     	blr	x8
 455e5b8: b4fffd00     	cbz	x0, 0x455e558 <_ChromeMain+0x45592bc>
 455e5bc: f9400008     	ldr	x8, [x0]
 455e5c0: f9401909     	ldr	x9, [x8, #0x30]
 455e5c4: 910003e8     	mov	x8, sp
 455e5c8: d63f0120     	blr	x9
 455e5cc: f9400661     	ldr	x1, [x19, #0x8]
 455e5d0: 910003e0     	mov	x0, sp
 455e5d4: 972db6cc     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 455e5d8: aa0003f5     	mov	x21, x0
 455e5dc: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 455e5e0: 37f805c8     	tbnz	w8, #0x1f, 0x455e698 <_ChromeMain+0x45593fc>
 455e5e4: 34fffbb5     	cbz	w21, 0x455e558 <_ChromeMain+0x45592bc>
 455e5e8: f9403280     	ldr	x0, [x20, #0x60]
 455e5ec: 910003e8     	mov	x8, sp
 455e5f0: 97ffe8f0     	bl	0x45589b0 <_ChromeMain+0x4553714>
 455e5f4: f9400a74     	ldr	x20, [x19, #0x10]
 455e5f8: f9400295     	ldr	x21, [x20]
 455e5fc: b4000395     	cbz	x21, 0x455e66c <_ChromeMain+0x45593d0>
 455e600: f9400688     	ldr	x8, [x20, #0x8]
 455e604: d37be909     	lsl	x9, x8, #5
 455e608: b4000209     	cbz	x9, 0x455e648 <_ChromeMain+0x45593ac>
 455e60c: 8b150129     	add	x9, x9, x21
 455e610: d1008136     	sub	x22, x9, #0x20
 455e614: cb0817f7     	neg	x23, x8, lsl #5
 455e618: 14000008     	b	0x455e638 <_ChromeMain+0x455939c>
 455e61c: f94002c0     	ldr	x0, [x22]
 455e620: f9400ac8     	ldr	x8, [x22, #0x10]
 455e624: d37ff901     	lsl	x1, x8, #1
 455e628: 96eaaa24     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 455e62c: d10082d6     	sub	x22, x22, #0x20
 455e630: b10082f7     	adds	x23, x23, #0x20
 455e634: 540000e0     	b.eq	0x455e650 <_ChromeMain+0x45593b4>
 455e638: b40003d6     	cbz	x22, 0x455e6b0 <_ChromeMain+0x4559414>
 455e63c: 39c05ec8     	ldrsb	w8, [x22, #0x17]
 455e640: 36ffff68     	tbz	w8, #0x1f, 0x455e62c <_ChromeMain+0x4559390>
 455e644: 17fffff6     	b	0x455e61c <_ChromeMain+0x4559380>
 455e648: aa1503e0     	mov	x0, x21
 455e64c: 14000002     	b	0x455e654 <_ChromeMain+0x45593b8>
 455e650: f9400280     	ldr	x0, [x20]
 455e654: cb0002a8     	sub	x8, x21, x0
 455e658: 9345fd08     	asr	x8, x8, #5
 455e65c: f9000688     	str	x8, [x20, #0x8]
 455e660: f9400a88     	ldr	x8, [x20, #0x10]
 455e664: d37be901     	lsl	x1, x8, #5
 455e668: 96eaaa14     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 455e66c: f94003e8     	ldr	x8, [sp]
 455e670: f9000288     	str	x8, [x20]
 455e674: 3cc083e0     	ldur	q0, [sp, #0x8]
 455e678: 3c808280     	stur	q0, [x20, #0x8]
 455e67c: b9401be8     	ldr	w8, [sp, #0x18]
 455e680: b9001a88     	str	w8, [x20, #0x18]
 455e684: f9400a68     	ldr	x8, [x19, #0x10]
 455e688: f9400508     	ldr	x8, [x8, #0x8]
 455e68c: f100011f     	cmp	x8, #0x0
 455e690: 1a9f17e0     	cset	w0, eq
 455e694: 17ffffb2     	b	0x455e55c <_ChromeMain+0x45592c0>
 455e698: f94003e0     	ldr	x0, [sp]
 455e69c: f9400be8     	ldr	x8, [sp, #0x10]
 455e6a0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 455e6a4: 96eaaa05     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 455e6a8: 34fff595     	cbz	w21, 0x455e558 <_ChromeMain+0x45592bc>
 455e6ac: 17ffffcf     	b	0x455e5e8 <_ChromeMain+0x455934c>
 455e6b0: d4200020     	brk	#0x1
