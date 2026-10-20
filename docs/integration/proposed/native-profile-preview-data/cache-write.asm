
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 455b610: aa1803f5     	mov	x21, x24
 455b614: f9404700     	ldr	x0, [x24, #0x88]
 455b618: d102e3a8     	sub	x8, x29, #0xb8
 455b61c: 97fff4e5     	bl	0x45589b0 <_ChromeMain+0x4553714>
 455b620: aa1a03e0     	mov	x0, x26
 455b624: f9400348     	ldr	x8, [x26]
 455b628: f9401909     	ldr	x9, [x8, #0x30]
 455b62c: d10203ba     	sub	x26, x29, #0x80
 455b630: d10203a8     	sub	x8, x29, #0x80
 455b634: d63f0120     	blr	x9
 455b638: f84b0ea8     	ldr	x8, [x21, #0xb0]!
 455b63c: b4000428     	cbz	x8, 0x455b6c0 <_ChromeMain+0x4556424>
 455b640: 389973a9     	ldursb	x9, [x29, #-0x69]
 455b644: a9782faa     	ldp	x10, x11, [x29, #-0x80]
 455b648: f100013f     	cmp	x9, #0x0
 455b64c: 9a9a415c     	csel	x28, x10, x26, mi
 455b650: 7100013f     	cmp	w9, #0x0
 455b654: 9a89417b     	csel	x27, x11, x9, mi
 455b658: 14000006     	b	0x455b670 <_ChromeMain+0x45563d4>
 455b65c: 52800002     	mov	w2, #0x0                ; =0
 455b660: 17ffffea     	b	0x455b608 <_ChromeMain+0x455636c>
 455b664: 54000223     	b.lo	0x455b6a8 <_ChromeMain+0x455640c>
 455b668: f9400748     	ldr	x8, [x26, #0x8]
 455b66c: b4000268     	cbz	x8, 0x455b6b8 <_ChromeMain+0x455641c>
 455b670: aa0803fa     	mov	x26, x8
 455b674: f8420d09     	ldr	x9, [x8, #0x20]!
 455b678: 39805d0a     	ldrsb	x10, [x8, #0x17]
 455b67c: f100015f     	cmp	x10, #0x0
 455b680: 9a884121     	csel	x1, x9, x8, mi
 455b684: f9400508     	ldr	x8, [x8, #0x8]
 455b688: 7100015f     	cmp	w10, #0x0
 455b68c: 9a8a4115     	csel	x21, x8, x10, mi
 455b690: eb1b02bf     	cmp	x21, x27
 455b694: 9a9b32a2     	csel	x2, x21, x27, lo
 455b698: aa1c03e0     	mov	x0, x28
 455b69c: 94eab871     	bl	0x8009860 <_ChromeMain+0x80045c4>
 455b6a0: 340004e0     	cbz	w0, 0x455b73c <_ChromeMain+0x45564a0>
 455b6a4: 36fffe20     	tbz	w0, #0x1f, 0x455b668 <_ChromeMain+0x45563cc>
 455b6a8: f9400348     	ldr	x8, [x26]
 455b6ac: aa1a03f5     	mov	x21, x26
 455b6b0: b5fffe08     	cbnz	x8, 0x455b670 <_ChromeMain+0x45563d4>
 455b6b4: 14000004     	b	0x455b6c4 <_ChromeMain+0x4556428>
 455b6b8: 91002355     	add	x21, x26, #0x8
 455b6bc: 14000002     	b	0x455b6c4 <_ChromeMain+0x4556428>
