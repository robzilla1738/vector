
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4635348: d105c3ff     	sub	sp, sp, #0x170
 463534c: a9116ffc     	stp	x28, x27, [sp, #0x110]
 4635350: a91267fa     	stp	x26, x25, [sp, #0x120]
 4635354: a9135ff8     	stp	x24, x23, [sp, #0x130]
 4635358: a91457f6     	stp	x22, x21, [sp, #0x140]
 463535c: a9154ff4     	stp	x20, x19, [sp, #0x150]
 4635360: a9167bfd     	stp	x29, x30, [sp, #0x160]
 4635364: 910583fd     	add	x29, sp, #0x160
 4635368: aa0103f4     	mov	x20, x1
 463536c: aa0003f3     	mov	x19, x0
 4635370: f004cf88     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4635374: f940f908     	ldr	x8, [x8, #0x1f0]
 4635378: f9400108     	ldr	x8, [x8]
 463537c: f81a03a8     	stur	x8, [x29, #-0x60]
 4635380: 91400409     	add	x9, x0, #0x1, lsl #12   ; =0x1000
 4635384: 3947a128     	ldrb	w8, [x9, #0x1e8]
 4635388: b9001fe8     	str	w8, [sp, #0x1c]
 463538c: 3907a13f     	strb	wzr, [x9, #0x1e8]
 4635390: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 4635394: f90027ff     	str	xzr, [sp, #0x48]
 4635398: f948d001     	ldr	x1, [x0, #0x11a0]
 463539c: f948d403     	ldr	x3, [x0, #0x11a8]
 46353a0: 52801708     	mov	w8, #0xb8               ; =184
 46353a4: 9b080462     	madd	x2, x3, x8, x1
 46353a8: 9100e3e0     	add	x0, sp, #0x38
 46353ac: 9401012e     	bl	0x4675864 <_ChromeMain+0x46705c8>
 46353b0: f94023f5     	ldr	x21, [sp, #0x40]
 46353b4: f9400688     	ldr	x8, [x20, #0x8]
 46353b8: eb0802bf     	cmp	x21, x8
 46353bc: 54000360     	b.eq	0x4635428 <_ChromeMain+0x463018c>
 46353c0: 52823408     	mov	w8, #0x11a0             ; =4512
 46353c4: 8b080260     	add	x0, x19, x8
 46353c8: 940101df     	bl	0x4675b44 <_ChromeMain+0x46708a8>
 46353cc: f9400288     	ldr	x8, [x20]
 46353d0: f908d268     	str	x8, [x19, #0x11a0]
 46353d4: f9400688     	ldr	x8, [x20, #0x8]
 46353d8: f908d668     	str	x8, [x19, #0x11a8]
 46353dc: f9400a88     	ldr	x8, [x20, #0x10]
 46353e0: f908da68     	str	x8, [x19, #0x11b0]
 46353e4: a9007e9f     	stp	xzr, xzr, [x20]
 46353e8: f9000a9f     	str	xzr, [x20, #0x10]
 46353ec: f948e279     	ldr	x25, [x19, #0x11c0]
 46353f0: 8b190728     	add	x8, x25, x25, lsl #1
 46353f4: d37df108     	lsl	x8, x8, #3
 46353f8: b4004388     	cbz	x8, 0x4635c68 <_ChromeMain+0x46309cc>
 46353fc: 52801716     	mov	w22, #0xb8              ; =184
 4635400: f948de7a     	ldr	x26, [x19, #0x11b8]
 4635404: 52800318     	mov	w24, #0x18              ; =24
 4635408: aa1a03fc     	mov	x28, x26
 463540c: 14000136     	b	0x46358e4 <_ChromeMain+0x4630648>
 4635410: 6b08033f     	cmp	w25, w8
 4635414: 54fffd61     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 4635418: 910006d6     	add	x22, x22, #0x1
 463541c: eb1502df     	cmp	x22, x21
 4635420: 540000c1     	b.ne	0x4635438 <_ChromeMain+0x463019c>
 4635424: 14000315     	b	0x4636078 <_ChromeMain+0x4630ddc>
 4635428: b4006295     	cbz	x21, 0x4636078 <_ChromeMain+0x4630ddc>
 463542c: d2800016     	mov	x22, #0x0               ; =0
 4635430: f9401ff7     	ldr	x23, [sp, #0x38]
 4635434: f9400298     	ldr	x24, [x20]
 4635438: 52801708     	mov	w8, #0xb8               ; =184
 463543c: 9b087ec8     	mul	x8, x22, x8
 4635440: 8b0802fc     	add	x28, x23, x8
 4635444: 8b08031b     	add	x27, x24, x8
 4635448: 39405f89     	ldrb	w9, [x28, #0x17]
 463544c: 13001d28     	sxtb	w8, w9
 4635450: f940078a     	ldr	x10, [x28, #0x8]
 4635454: 7100011f     	cmp	w8, #0x0
 4635458: 9a894142     	csel	x2, x10, x9, mi
 463545c: 39405f6a     	ldrb	w10, [x27, #0x17]
 4635460: 13001d49     	sxtb	w9, w10
 4635464: f940076b     	ldr	x11, [x27, #0x8]
 4635468: 7100013f     	cmp	w9, #0x0
 463546c: 9a8a416a     	csel	x10, x11, x10, mi
 4635470: eb0a005f     	cmp	x2, x10
 4635474: 54fffa61     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 4635478: f940038a     	ldr	x10, [x28]
 463547c: 7100011f     	cmp	w8, #0x0
 4635480: 9a9c4140     	csel	x0, x10, x28, mi
 4635484: f9400368     	ldr	x8, [x27]
 4635488: 7100013f     	cmp	w9, #0x0
 463548c: 9a9b4101     	csel	x1, x8, x27, mi
 4635490: 94e750f4     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4635494: 35fff960     	cbnz	w0, 0x46353c0 <_ChromeMain+0x4630124>
 4635498: 3940bf88     	ldrb	w8, [x28, #0x2f]
 463549c: 13001d0a     	sxtb	w10, w8
 46354a0: f9401389     	ldr	x9, [x28, #0x20]
 46354a4: 7100015f     	cmp	w10, #0x0
 46354a8: 9a884128     	csel	x8, x9, x8, mi
 46354ac: 3940bf6b     	ldrb	w11, [x27, #0x2f]
 46354b0: 13001d69     	sxtb	w9, w11
 46354b4: f940136c     	ldr	x12, [x27, #0x20]
 46354b8: 7100013f     	cmp	w9, #0x0
 46354bc: 9a8b418b     	csel	x11, x12, x11, mi
 46354c0: eb0b011f     	cmp	x8, x11
 46354c4: 54fff7e1     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 46354c8: b40001e8     	cbz	x8, 0x4635504 <_ChromeMain+0x4630268>
 46354cc: aa1b03eb     	mov	x11, x27
 46354d0: f8418d6c     	ldr	x12, [x11, #0x18]!
 46354d4: 7100013f     	cmp	w9, #0x0
 46354d8: 9a8b4189     	csel	x9, x12, x11, mi
 46354dc: aa1c03eb     	mov	x11, x28
 46354e0: f8418d6c     	ldr	x12, [x11, #0x18]!
 46354e4: 7100015f     	cmp	w10, #0x0
 46354e8: 9a8b418a     	csel	x10, x12, x11, mi
 46354ec: 7840254b     	ldrh	w11, [x10], #0x2
 46354f0: 7840252c     	ldrh	w12, [x9], #0x2
 46354f4: 6b0b019f     	cmp	w12, w11
 46354f8: 54fff641     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 46354fc: f1000508     	subs	x8, x8, #0x1
 4635500: 54ffff61     	b.ne	0x46354ec <_ChromeMain+0x4630250>
 4635504: b9403388     	ldr	w8, [x28, #0x30]
 4635508: b9403369     	ldr	w9, [x27, #0x30]
 463550c: 6b09011f     	cmp	w8, w9
 4635510: 54fff581     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 4635514: 3940d388     	ldrb	w8, [x28, #0x34]
 4635518: 3940d369     	ldrb	w9, [x27, #0x34]
 463551c: 6b09011f     	cmp	w8, w9
 4635520: 54fff501     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 4635524: 3940d788     	ldrb	w8, [x28, #0x35]
 4635528: 3940d769     	ldrb	w9, [x27, #0x35]
 463552c: 6b09011f     	cmp	w8, w9
 4635530: 54fff481     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 4635534: 3942c399     	ldrb	w25, [x28, #0xb0]
 4635538: 3942c368     	ldrb	w8, [x27, #0xb0]
 463553c: 6a19011f     	tst	w8, w25
 4635540: 54fff680     	b.eq	0x4635410 <_ChromeMain+0x4630174>
 4635544: 36003188     	tbz	w8, #0x0, 0x4635b74 <_ChromeMain+0x46308d8>
 4635548: 39413f89     	ldrb	w9, [x28, #0x4f]
 463554c: 13001d28     	sxtb	w8, w9
 4635550: f940238a     	ldr	x10, [x28, #0x40]
 4635554: 7100011f     	cmp	w8, #0x0
 4635558: 9a894142     	csel	x2, x10, x9, mi
 463555c: 39413f6a     	ldrb	w10, [x27, #0x4f]
 4635560: 13001d49     	sxtb	w9, w10
 4635564: f940236b     	ldr	x11, [x27, #0x40]
 4635568: 7100013f     	cmp	w9, #0x0
 463556c: 9a8a416a     	csel	x10, x11, x10, mi
 4635570: eb0a005f     	cmp	x2, x10
 4635574: 54fff261     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 4635578: 9100e38a     	add	x10, x28, #0x38
 463557c: 9100e36b     	add	x11, x27, #0x38
 4635580: f940014c     	ldr	x12, [x10]
 4635584: 7100011f     	cmp	w8, #0x0
 4635588: 9a8a4180     	csel	x0, x12, x10, mi
 463558c: f9400168     	ldr	x8, [x11]
 4635590: 7100013f     	cmp	w9, #0x0
 4635594: 9a8b4101     	csel	x1, x8, x11, mi
 4635598: 94e750b2     	bl	0x8009860 <_ChromeMain+0x80045c4>
 463559c: 35fff120     	cbnz	w0, 0x46353c0 <_ChromeMain+0x4630124>
 46355a0: 36002eb9     	tbz	w25, #0x0, 0x4635b74 <_ChromeMain+0x46308d8>
 46355a4: 39419f89     	ldrb	w9, [x28, #0x67]
 46355a8: 13001d28     	sxtb	w8, w9
 46355ac: f9402f8a     	ldr	x10, [x28, #0x58]
 46355b0: 7100011f     	cmp	w8, #0x0
 46355b4: 9a894142     	csel	x2, x10, x9, mi
 46355b8: 39419f6a     	ldrb	w10, [x27, #0x67]
 46355bc: 13001d49     	sxtb	w9, w10
 46355c0: f9402f6b     	ldr	x11, [x27, #0x58]
 46355c4: 7100013f     	cmp	w9, #0x0
 46355c8: 9a8a416a     	csel	x10, x11, x10, mi
 46355cc: eb0a005f     	cmp	x2, x10
 46355d0: 54ffef81     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 46355d4: aa1c03ea     	mov	x10, x28
 46355d8: f8450d4b     	ldr	x11, [x10, #0x50]!
 46355dc: 7100011f     	cmp	w8, #0x0
 46355e0: 9a8a4160     	csel	x0, x11, x10, mi
 46355e4: aa1b03e8     	mov	x8, x27
 46355e8: f8450d0a     	ldr	x10, [x8, #0x50]!
 46355ec: 7100013f     	cmp	w9, #0x0
 46355f0: 9a884141     	csel	x1, x10, x8, mi
 46355f4: 94e7509b     	bl	0x8009860 <_ChromeMain+0x80045c4>
 46355f8: 35ffee40     	cbnz	w0, 0x46353c0 <_ChromeMain+0x4630124>
 46355fc: 3941ff88     	ldrb	w8, [x28, #0x7f]
 4635600: 13001d0a     	sxtb	w10, w8
 4635604: f9403b89     	ldr	x9, [x28, #0x70]
 4635608: 7100015f     	cmp	w10, #0x0
 463560c: 9a884128     	csel	x8, x9, x8, mi
 4635610: 3941ff6b     	ldrb	w11, [x27, #0x7f]
 4635614: 13001d69     	sxtb	w9, w11
 4635618: f9403b6c     	ldr	x12, [x27, #0x70]
 463561c: 7100013f     	cmp	w9, #0x0
 4635620: 9a8b418b     	csel	x11, x12, x11, mi
 4635624: eb0b011f     	cmp	x8, x11
 4635628: 54ffecc1     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 463562c: b40001e8     	cbz	x8, 0x4635668 <_ChromeMain+0x46303cc>
 4635630: aa1b03eb     	mov	x11, x27
 4635634: f8468d6c     	ldr	x12, [x11, #0x68]!
 4635638: 7100013f     	cmp	w9, #0x0
 463563c: 9a8b4189     	csel	x9, x12, x11, mi
 4635640: aa1c03eb     	mov	x11, x28
 4635644: f8468d6c     	ldr	x12, [x11, #0x68]!
 4635648: 7100015f     	cmp	w10, #0x0
 463564c: 9a8b418a     	csel	x10, x12, x11, mi
 4635650: 7840254b     	ldrh	w11, [x10], #0x2
 4635654: 7840252c     	ldrh	w12, [x9], #0x2
 4635658: 6b0b019f     	cmp	w12, w11
 463565c: 54ffeb21     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 4635660: f1000508     	subs	x8, x8, #0x1
 4635664: 54ffff61     	b.ne	0x4635650 <_ChromeMain+0x46303b4>
 4635668: 39425f88     	ldrb	w8, [x28, #0x97]
 463566c: 13001d0a     	sxtb	w10, w8
 4635670: f9404789     	ldr	x9, [x28, #0x88]
 4635674: 7100015f     	cmp	w10, #0x0
 4635678: 9a884128     	csel	x8, x9, x8, mi
 463567c: 39425f6b     	ldrb	w11, [x27, #0x97]
 4635680: 13001d69     	sxtb	w9, w11
 4635684: f940476c     	ldr	x12, [x27, #0x88]
 4635688: 7100013f     	cmp	w9, #0x0
 463568c: 9a8b418b     	csel	x11, x12, x11, mi
 4635690: eb0b011f     	cmp	x8, x11
 4635694: 54ffe961     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 4635698: b40001e8     	cbz	x8, 0x46356d4 <_ChromeMain+0x4630438>
 463569c: aa1b03eb     	mov	x11, x27
 46356a0: f8480d6c     	ldr	x12, [x11, #0x80]!
 46356a4: 7100013f     	cmp	w9, #0x0
 46356a8: 9a8b4189     	csel	x9, x12, x11, mi
 46356ac: aa1c03eb     	mov	x11, x28
 46356b0: f8480d6c     	ldr	x12, [x11, #0x80]!
 46356b4: 7100015f     	cmp	w10, #0x0
 46356b8: 9a8b418a     	csel	x10, x12, x11, mi
 46356bc: 7840254b     	ldrh	w11, [x10], #0x2
 46356c0: 7840252c     	ldrh	w12, [x9], #0x2
 46356c4: 6b0b019f     	cmp	w12, w11
 46356c8: 54ffe7c1     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 46356cc: f1000508     	subs	x8, x8, #0x1
 46356d0: 54ffff61     	b.ne	0x46356bc <_ChromeMain+0x4630420>
 46356d4: f9405399     	ldr	x25, [x28, #0xa0]
 46356d8: f9405368     	ldr	x8, [x27, #0xa0]
 46356dc: eb08033f     	cmp	x25, x8
 46356e0: 54ffe701     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 46356e4: b4ffe9b9     	cbz	x25, 0x4635418 <_ChromeMain+0x463017c>
 46356e8: d280001a     	mov	x26, #0x0               ; =0
 46356ec: f9404f89     	ldr	x9, [x28, #0x98]
 46356f0: f9404f68     	ldr	x8, [x27, #0x98]
 46356f4: a900a7e8     	stp	x8, x9, [sp, #0x8]
 46356f8: d37ae748     	lsl	x8, x26, #6
 46356fc: cb1a0d08     	sub	x8, x8, x26, lsl #3
 4635700: a940abe9     	ldp	x9, x10, [sp, #0x8]
 4635704: 8b08015c     	add	x28, x10, x8
 4635708: 8b08013b     	add	x27, x9, x8
 463570c: 39405f89     	ldrb	w9, [x28, #0x17]
 4635710: 13001d28     	sxtb	w8, w9
 4635714: f940078a     	ldr	x10, [x28, #0x8]
 4635718: 7100011f     	cmp	w8, #0x0
 463571c: 9a894142     	csel	x2, x10, x9, mi
 4635720: 39405f6a     	ldrb	w10, [x27, #0x17]
 4635724: 13001d49     	sxtb	w9, w10
 4635728: f940076b     	ldr	x11, [x27, #0x8]
 463572c: 7100013f     	cmp	w9, #0x0
 4635730: 9a8a416a     	csel	x10, x11, x10, mi
 4635734: eb0a005f     	cmp	x2, x10
 4635738: 54ffe441     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 463573c: f940038a     	ldr	x10, [x28]
 4635740: 7100011f     	cmp	w8, #0x0
 4635744: 9a9c4140     	csel	x0, x10, x28, mi
 4635748: f9400368     	ldr	x8, [x27]
 463574c: 7100013f     	cmp	w9, #0x0
 4635750: 9a9b4101     	csel	x1, x8, x27, mi
 4635754: 94e75043     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4635758: 35ffe340     	cbnz	w0, 0x46353c0 <_ChromeMain+0x4630124>
 463575c: 3940bf88     	ldrb	w8, [x28, #0x2f]
 4635760: 13001d0a     	sxtb	w10, w8
 4635764: f9401389     	ldr	x9, [x28, #0x20]
 4635768: 7100015f     	cmp	w10, #0x0
 463576c: 9a884128     	csel	x8, x9, x8, mi
 4635770: 3940bf6b     	ldrb	w11, [x27, #0x2f]
 4635774: 13001d69     	sxtb	w9, w11
 4635778: f940136c     	ldr	x12, [x27, #0x20]
 463577c: 7100013f     	cmp	w9, #0x0
 4635780: 9a8b418b     	csel	x11, x12, x11, mi
 4635784: eb0b011f     	cmp	x8, x11
 4635788: 54ffe1c1     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 463578c: b40001e8     	cbz	x8, 0x46357c8 <_ChromeMain+0x463052c>
 4635790: aa1b03eb     	mov	x11, x27
 4635794: f8418d6c     	ldr	x12, [x11, #0x18]!
 4635798: 7100013f     	cmp	w9, #0x0
 463579c: 9a8b4189     	csel	x9, x12, x11, mi
 46357a0: aa1c03eb     	mov	x11, x28
 46357a4: f8418d6c     	ldr	x12, [x11, #0x18]!
 46357a8: 7100015f     	cmp	w10, #0x0
 46357ac: 9a8b418a     	csel	x10, x12, x11, mi
 46357b0: 7840254b     	ldrh	w11, [x10], #0x2
 46357b4: 7840252c     	ldrh	w12, [x9], #0x2
 46357b8: 6b0b019f     	cmp	w12, w11
 46357bc: 54ffe021     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 46357c0: f1000508     	subs	x8, x8, #0x1
 46357c4: 54ffff61     	b.ne	0x46357b0 <_ChromeMain+0x4630514>
 46357c8: 3940c388     	ldrb	w8, [x28, #0x30]
 46357cc: 3940c369     	ldrb	w9, [x27, #0x30]
 46357d0: 6b09011f     	cmp	w8, w9
 46357d4: 54ffdf61     	b.ne	0x46353c0 <_ChromeMain+0x4630124>
 46357d8: 9100075a     	add	x26, x26, #0x1
 46357dc: eb19035f     	cmp	x26, x25
 46357e0: 54ffe1c0     	b.eq	0x4635418 <_ChromeMain+0x463017c>
 46357e4: 17ffffc5     	b	0x46356f8 <_ChromeMain+0x463045c>
 46357e8: f9400320     	ldr	x0, [x25]
 46357ec: f9400b28     	ldr	x8, [x25, #0x10]
 46357f0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46357f4: 96e74db1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46357f8: 14000013     	b	0x4635844 <_ChromeMain+0x46305a8>
 46357fc: f948de7a     	ldr	x26, [x19, #0x11b8]
 4635800: f948e279     	ldr	x25, [x19, #0x11c0]
 4635804: 8b190728     	add	x8, x25, x25, lsl #1
 4635808: 8b080f49     	add	x9, x26, x8, lsl #3
 463580c: eb09039f     	cmp	x28, x9
 4635810: 54009520     	b.eq	0x4636ab4 <_ChromeMain+0x4631818>
 4635814: d37df108     	lsl	x8, x8, #3
 4635818: cb1a0389     	sub	x9, x28, x26
 463581c: 91006129     	add	x9, x9, #0x18
 4635820: eb08013f     	cmp	x9, x8
 4635824: 54000360     	b.eq	0x4635890 <_ChromeMain+0x46305f4>
 4635828: cb1a03f5     	neg	x21, x26
 463582c: cb1c0108     	sub	x8, x8, x28
 4635830: d1006117     	sub	x23, x8, #0x18
 4635834: 8b1c0354     	add	x20, x26, x28
 4635838: 8b150299     	add	x25, x20, x21
 463583c: 39c05f28     	ldrsb	w8, [x25, #0x17]
 4635840: 37fffd48     	tbnz	w8, #0x1f, 0x46357e8 <_ChromeMain+0x463054c>
 4635844: 3cc18320     	ldur	q0, [x25, #0x18]
 4635848: 3d800320     	str	q0, [x25]
 463584c: f8428328     	ldur	x8, [x25, #0x28]
 4635850: f9000b28     	str	x8, [x25, #0x10]
 4635854: 3900bf3f     	strb	wzr, [x25, #0x2f]
 4635858: 3900633f     	strb	wzr, [x25, #0x18]
 463585c: d10062f7     	sub	x23, x23, #0x18
 4635860: 91006294     	add	x20, x20, #0x18
 4635864: eb1702bf     	cmp	x21, x23
 4635868: 54fffe81     	b.ne	0x4635838 <_ChromeMain+0x463059c>
 463586c: cb1a0294     	sub	x20, x20, x26
 4635870: f948de7a     	ldr	x26, [x19, #0x11b8]
 4635874: f948e279     	ldr	x25, [x19, #0x11c0]
 4635878: 14000007     	b	0x4635894 <_ChromeMain+0x46305f8>
 463587c: f85e8100     	ldur	x0, [x8, #-0x18]
 4635880: f85f8108     	ldur	x8, [x8, #-0x8]
 4635884: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4635888: 96e74d8c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463588c: 14000009     	b	0x46358b0 <_ChromeMain+0x4630614>
 4635890: aa1c03f4     	mov	x20, x28
 4635894: 9b186b28     	madd	x8, x25, x24, x26
 4635898: eb08029f     	cmp	x20, x8
 463589c: 54000120     	b.eq	0x46358c0 <_ChromeMain+0x4630624>
 46358a0: f1006115     	subs	x21, x8, #0x18
 46358a4: 54001680     	b.eq	0x4635b74 <_ChromeMain+0x46308d8>
 46358a8: 38dff109     	ldursb	w9, [x8, #-0x1]
 46358ac: 37fffe89     	tbnz	w9, #0x1f, 0x463587c <_ChromeMain+0x46305e0>
 46358b0: aa1503e8     	mov	x8, x21
 46358b4: eb1402bf     	cmp	x21, x20
 46358b8: 54ffff41     	b.ne	0x46358a0 <_ChromeMain+0x4630604>
 46358bc: f948de7a     	ldr	x26, [x19, #0x11b8]
 46358c0: cb1a0288     	sub	x8, x20, x26
 46358c4: 9343fd08     	asr	x8, x8, #3
 46358c8: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 46358cc: f2955569     	movk	x9, #0xaaab
 46358d0: 9b097d19     	mul	x25, x8, x9
 46358d4: f908e279     	str	x25, [x19, #0x11c0]
 46358d8: 9b186b28     	madd	x8, x25, x24, x26
 46358dc: eb08039f     	cmp	x28, x8
 46358e0: 54001c40     	b.eq	0x4635c68 <_ChromeMain+0x46309cc>
 46358e4: f948d668     	ldr	x8, [x19, #0x11a8]
 46358e8: 9b167d15     	mul	x21, x8, x22
 46358ec: b4000115     	cbz	x21, 0x463590c <_ChromeMain+0x4630670>
 46358f0: f948d277     	ldr	x23, [x19, #0x11a0]
 46358f4: 39405f88     	ldrb	w8, [x28, #0x17]
 46358f8: 13001d1b     	sxtb	w27, w8
 46358fc: f9400789     	ldr	x9, [x28, #0x8]
 4635900: 7100037f     	cmp	w27, #0x0
 4635904: 9a884134     	csel	x20, x9, x8, mi
 4635908: 1400000a     	b	0x4635930 <_ChromeMain+0x4630694>
 463590c: f947ea77     	ldr	x23, [x19, #0xfd0]
 4635910: f240eaff     	tst	x23, #0x7ffffffffffffff
 4635914: 54fff780     	b.eq	0x4635804 <_ChromeMain+0x4630568>
 4635918: f947e679     	ldr	x25, [x19, #0xfc8]
 463591c: aa1903f4     	mov	x20, x25
 4635920: 14000024     	b	0x46359b0 <_ChromeMain+0x4630714>
 4635924: 9102e2f7     	add	x23, x23, #0xb8
 4635928: f102e2b5     	subs	x21, x21, #0xb8
 463592c: 54ffff00     	b.eq	0x463590c <_ChromeMain+0x4630670>
 4635930: 39405ee9     	ldrb	w9, [x23, #0x17]
 4635934: 13001d28     	sxtb	w8, w9
 4635938: f94006ea     	ldr	x10, [x23, #0x8]
 463593c: 7100011f     	cmp	w8, #0x0
 4635940: 9a894149     	csel	x9, x10, x9, mi
 4635944: eb14013f     	cmp	x9, x20
 4635948: 54fffee1     	b.ne	0x4635924 <_ChromeMain+0x4630688>
 463594c: f94002e9     	ldr	x9, [x23]
 4635950: 7100011f     	cmp	w8, #0x0
 4635954: 9a974120     	csel	x0, x9, x23, mi
 4635958: f9400388     	ldr	x8, [x28]
 463595c: 7100037f     	cmp	w27, #0x0
 4635960: 9a9c4101     	csel	x1, x8, x28, mi
 4635964: aa1403e2     	mov	x2, x20
 4635968: 94e74fbe     	bl	0x8009860 <_ChromeMain+0x80045c4>
 463596c: 35fffdc0     	cbnz	w0, 0x4635924 <_ChromeMain+0x4630688>
 4635970: b4fffcf7     	cbz	x23, 0x463590c <_ChromeMain+0x4630670>
 4635974: 3940d2e8     	ldrb	w8, [x23, #0x34]
 4635978: 34fff468     	cbz	w8, 0x4635804 <_ChromeMain+0x4630568>
 463597c: 9100639c     	add	x28, x28, #0x18
 4635980: 17ffffd6     	b	0x46358d8 <_ChromeMain+0x463063c>
 4635984: f947e679     	ldr	x25, [x19, #0xfc8]
 4635988: cb1902a8     	sub	x8, x21, x25
 463598c: 9345fd17     	asr	x23, x8, #5
 4635990: f907ea77     	str	x23, [x19, #0xfd0]
 4635994: 14000004     	b	0x46359a4 <_ChromeMain+0x4630708>
 4635998: aa0803e1     	mov	x1, x8
 463599c: 14000032     	b	0x4635a64 <_ChromeMain+0x46307c8>
 46359a0: 91008294     	add	x20, x20, #0x20
 46359a4: 8b171728     	add	x8, x25, x23, lsl #5
 46359a8: eb08029f     	cmp	x20, x8
 46359ac: 54fff280     	b.eq	0x46357fc <_ChromeMain+0x4630560>
 46359b0: 39407e89     	ldrb	w9, [x20, #0x1f]
 46359b4: 13001d28     	sxtb	w8, w9
 46359b8: f9400a8a     	ldr	x10, [x20, #0x10]
 46359bc: 7100011f     	cmp	w8, #0x0
 46359c0: 9a894142     	csel	x2, x10, x9, mi
 46359c4: 39405f8a     	ldrb	w10, [x28, #0x17]
 46359c8: 13001d49     	sxtb	w9, w10
 46359cc: f940078b     	ldr	x11, [x28, #0x8]
 46359d0: 7100013f     	cmp	w9, #0x0
 46359d4: 9a8a416a     	csel	x10, x11, x10, mi
 46359d8: eb0a005f     	cmp	x2, x10
 46359dc: 54fffe21     	b.ne	0x46359a0 <_ChromeMain+0x4630704>
 46359e0: aa1403ea     	mov	x10, x20
 46359e4: f8408d4b     	ldr	x11, [x10, #0x8]!
 46359e8: 7100011f     	cmp	w8, #0x0
 46359ec: 9a8a4160     	csel	x0, x11, x10, mi
 46359f0: f9400388     	ldr	x8, [x28]
 46359f4: 7100013f     	cmp	w9, #0x0
 46359f8: 9a9c4101     	csel	x1, x8, x28, mi
 46359fc: 94e74f99     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4635a00: 35fffd00     	cbnz	w0, 0x46359a0 <_ChromeMain+0x4630704>
 4635a04: b90073ff     	str	wzr, [sp, #0x70]
 4635a08: b9400288     	ldr	w8, [x20]
 4635a0c: b90073e8     	str	w8, [sp, #0x70]
 4635a10: 52821208     	mov	w8, #0x1090             ; =4240
 4635a14: 8b080260     	add	x0, x19, x8
 4635a18: 9101c3e1     	add	x1, sp, #0x70
 4635a1c: 9101c3e2     	add	x2, sp, #0x70
 4635a20: 949944c0     	bl	0x6c86d20 <_ChromeMain+0x6c81a84>
 4635a24: f9480268     	ldr	x8, [x19, #0x1000]
 4635a28: f9480669     	ldr	x9, [x19, #0x1008]
 4635a2c: d37be92a     	lsl	x10, x9, #5
 4635a30: b4fffb4a     	cbz	x10, 0x4635998 <_ChromeMain+0x46306fc>
 4635a34: 9345fd4b     	asr	x11, x10, #5
 4635a38: b94073ea     	ldr	w10, [sp, #0x70]
 4635a3c: aa0803e1     	mov	x1, x8
 4635a40: d341fd6c     	lsr	x12, x11, #1
 4635a44: 8b0c142d     	add	x13, x1, x12, lsl #5
 4635a48: b84205ae     	ldr	w14, [x13], #0x20
 4635a4c: aa6b07ef     	mvn	x15, x11, lsr #1
 4635a50: 8b0f016b     	add	x11, x11, x15
 4635a54: 6b0a01df     	cmp	w14, w10
 4635a58: 9a8cb16b     	csel	x11, x11, x12, lt
 4635a5c: 9a81b1a1     	csel	x1, x13, x1, lt
 4635a60: b5ffff0b     	cbnz	x11, 0x4635a40 <_ChromeMain+0x46307a4>
 4635a64: 8b091508     	add	x8, x8, x9, lsl #5
 4635a68: aa0103e2     	mov	x2, x1
 4635a6c: eb08003f     	cmp	x1, x8
 4635a70: 540000e0     	b.eq	0x4635a8c <_ChromeMain+0x46307f0>
 4635a74: b94073e8     	ldr	w8, [sp, #0x70]
 4635a78: b9400029     	ldr	w9, [x1]
 4635a7c: 6b09011f     	cmp	w8, w9
 4635a80: 52800408     	mov	w8, #0x20               ; =32
 4635a84: 9a88b3e8     	csel	x8, xzr, x8, lt
 4635a88: 8b080022     	add	x2, x1, x8
 4635a8c: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 4635a90: 94013171     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 4635a94: f9485668     	ldr	x8, [x19, #0x10a8]
 4635a98: f9485a6a     	ldr	x10, [x19, #0x10b0]
 4635a9c: d37ced4b     	lsl	x11, x10, #4
 4635aa0: aa0803e9     	mov	x9, x8
 4635aa4: b40001ab     	cbz	x11, 0x4635ad8 <_ChromeMain+0x463083c>
 4635aa8: 9344fd6d     	asr	x13, x11, #4
 4635aac: b94073ec     	ldr	w12, [sp, #0x70]
 4635ab0: aa0803e9     	mov	x9, x8
 4635ab4: d341fdae     	lsr	x14, x13, #1
 4635ab8: 8b0e112f     	add	x15, x9, x14, lsl #4
 4635abc: b84105f0     	ldr	w16, [x15], #0x10
 4635ac0: aa6d07f1     	mvn	x17, x13, lsr #1
 4635ac4: 8b1101ad     	add	x13, x13, x17
 4635ac8: 6b0c021f     	cmp	w16, w12
 4635acc: 9a8eb1ad     	csel	x13, x13, x14, lt
 4635ad0: 9a89b1e9     	csel	x9, x15, x9, lt
 4635ad4: b5ffff0d     	cbnz	x13, 0x4635ab4 <_ChromeMain+0x4630818>
 4635ad8: 8b0a110c     	add	x12, x8, x10, lsl #4
 4635adc: eb0c013f     	cmp	x9, x12
 4635ae0: 540004c0     	b.eq	0x4635b78 <_ChromeMain+0x46308dc>
 4635ae4: b94073ec     	ldr	w12, [sp, #0x70]
 4635ae8: b940012d     	ldr	w13, [x9]
 4635aec: 6b0d019f     	cmp	w12, w13
 4635af0: 9100412c     	add	x12, x9, #0x10
 4635af4: 9a8cb12e     	csel	x14, x9, x12, lt
 4635af8: eb0e013f     	cmp	x9, x14
 4635afc: 540003c8     	b.hi	0x4635b74 <_ChromeMain+0x46308d8>
 4635b00: 54000460     	b.eq	0x4635b8c <_ChromeMain+0x46308f0>
 4635b04: cb0801cc     	sub	x12, x14, x8
 4635b08: eb0b019f     	cmp	x12, x11
 4635b0c: 540002a0     	b.eq	0x4635b60 <_ChromeMain+0x46308c4>
 4635b10: cb0803ec     	neg	x12, x8
 4635b14: 8b0e010d     	add	x13, x8, x14
 4635b18: 8b09010a     	add	x10, x8, x9
 4635b1c: 8b0b012b     	add	x11, x9, x11
 4635b20: cb0e016b     	sub	x11, x11, x14
 4635b24: cb090169     	sub	x9, x11, x9
 4635b28: 8b0c01ab     	add	x11, x13, x12
 4635b2c: 8b0c014e     	add	x14, x10, x12
 4635b30: b940016f     	ldr	w15, [x11]
 4635b34: b90001cf     	str	w15, [x14]
 4635b38: f940056b     	ldr	x11, [x11, #0x8]
 4635b3c: f90005cb     	str	x11, [x14, #0x8]
 4635b40: 910041ad     	add	x13, x13, #0x10
 4635b44: 9100414a     	add	x10, x10, #0x10
 4635b48: d1004129     	sub	x9, x9, #0x10
 4635b4c: eb09019f     	cmp	x12, x9
 4635b50: 54fffec1     	b.ne	0x4635b28 <_ChromeMain+0x463088c>
 4635b54: cb080149     	sub	x9, x10, x8
 4635b58: f9485668     	ldr	x8, [x19, #0x10a8]
 4635b5c: f9485a6a     	ldr	x10, [x19, #0x10b0]
 4635b60: 8b0a110a     	add	x10, x8, x10, lsl #4
 4635b64: eb09015f     	cmp	x10, x9
 4635b68: 540000c0     	b.eq	0x4635b80 <_ChromeMain+0x46308e4>
 4635b6c: f100414a     	subs	x10, x10, #0x10
 4635b70: 54ffffa1     	b.ne	0x4635b64 <_ChromeMain+0x46308c8>
 4635b74: d4200020     	brk	#0x1
 4635b78: aa0903ee     	mov	x14, x9
 4635b7c: 17ffffdf     	b	0x4635af8 <_ChromeMain+0x463085c>
 4635b80: cb080128     	sub	x8, x9, x8
 4635b84: 9344fd08     	asr	x8, x8, #4
 4635b88: f9085a68     	str	x8, [x19, #0x10b0]
 4635b8c: f947e679     	ldr	x25, [x19, #0xfc8]
 4635b90: f947ea68     	ldr	x8, [x19, #0xfd0]
 4635b94: 8b081729     	add	x9, x25, x8, lsl #5
 4635b98: eb09029f     	cmp	x20, x9
 4635b9c: 54007860     	b.eq	0x4636aa8 <_ChromeMain+0x463180c>
 4635ba0: d37be909     	lsl	x9, x8, #5
 4635ba4: cb19028a     	sub	x10, x20, x25
 4635ba8: 9100814a     	add	x10, x10, #0x20
 4635bac: eb09015f     	cmp	x10, x9
 4635bb0: 540003a0     	b.eq	0x4635c24 <_ChromeMain+0x4630988>
 4635bb4: cb1903f7     	neg	x23, x25
 4635bb8: cb140128     	sub	x8, x9, x20
 4635bbc: d100811a     	sub	x26, x8, #0x20
 4635bc0: 8b140335     	add	x21, x25, x20
 4635bc4: 8b1702bb     	add	x27, x21, x23
 4635bc8: b9402368     	ldr	w8, [x27, #0x20]
 4635bcc: b9000368     	str	w8, [x27]
 4635bd0: 39c07f68     	ldrsb	w8, [x27, #0x1f]
 4635bd4: 37f801e8     	tbnz	w8, #0x1f, 0x4635c10 <_ChromeMain+0x4630974>
 4635bd8: 3cc28360     	ldur	q0, [x27, #0x28]
 4635bdc: 3c808360     	stur	q0, [x27, #0x8]
 4635be0: f8438368     	ldur	x8, [x27, #0x38]
 4635be4: f8018368     	stur	x8, [x27, #0x18]
 4635be8: 3900ff7f     	strb	wzr, [x27, #0x3f]
 4635bec: 3802837f     	sturb	wzr, [x27, #0x28]
 4635bf0: d100835a     	sub	x26, x26, #0x20
 4635bf4: 910082b5     	add	x21, x21, #0x20
 4635bf8: eb1a02ff     	cmp	x23, x26
 4635bfc: 54fffe41     	b.ne	0x4635bc4 <_ChromeMain+0x4630928>
 4635c00: cb1902b5     	sub	x21, x21, x25
 4635c04: f947e679     	ldr	x25, [x19, #0xfc8]
 4635c08: f947ea68     	ldr	x8, [x19, #0xfd0]
 4635c0c: 14000007     	b	0x4635c28 <_ChromeMain+0x463098c>
 4635c10: f8408360     	ldur	x0, [x27, #0x8]
 4635c14: f9400f68     	ldr	x8, [x27, #0x18]
 4635c18: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4635c1c: 96e74ca7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4635c20: 17ffffee     	b	0x4635bd8 <_ChromeMain+0x463093c>
 4635c24: aa1403f5     	mov	x21, x20
 4635c28: 8b081728     	add	x8, x25, x8, lsl #5
 4635c2c: eb0802bf     	cmp	x21, x8
 4635c30: 54ffeac0     	b.eq	0x4635988 <_ChromeMain+0x46306ec>
 4635c34: 14000008     	b	0x4635c54 <_ChromeMain+0x46309b8>
 4635c38: f85e8100     	ldur	x0, [x8, #-0x18]
 4635c3c: f85f8108     	ldur	x8, [x8, #-0x8]
 4635c40: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4635c44: 96e74c9d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4635c48: aa1703e8     	mov	x8, x23
 4635c4c: eb1502ff     	cmp	x23, x21
 4635c50: 54ffe9a0     	b.eq	0x4635984 <_ChromeMain+0x46306e8>
 4635c54: f1008117     	subs	x23, x8, #0x20
 4635c58: 54fff8e0     	b.eq	0x4635b74 <_ChromeMain+0x46308d8>
 4635c5c: 38dff109     	ldursb	w9, [x8, #-0x1]
 4635c60: 36ffff49     	tbz	w9, #0x1f, 0x4635c48 <_ChromeMain+0x46309ac>
 4635c64: 17fffff5     	b	0x4635c38 <_ChromeMain+0x463099c>
 4635c68: f942e674     	ldr	x20, [x19, #0x5c8]
 4635c6c: b4000214     	cbz	x20, 0x4635cac <_ChromeMain+0x4630a10>
 4635c70: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4635c74: f9001bff     	str	xzr, [sp, #0x30]
 4635c78: f948d261     	ldr	x1, [x19, #0x11a0]
 4635c7c: f948d663     	ldr	x3, [x19, #0x11a8]
 4635c80: 52801708     	mov	w8, #0xb8               ; =184
 4635c84: 9b080462     	madd	x2, x3, x8, x1
 4635c88: 910083f5     	add	x21, sp, #0x20
 4635c8c: 910083e0     	add	x0, sp, #0x20
 4635c90: 9400fef5     	bl	0x4675864 <_ChromeMain+0x46705c8>
 4635c94: 910083e1     	add	x1, sp, #0x20
 4635c98: aa1403e0     	mov	x0, x20
 4635c9c: 94001d9e     	bl	0x463d314 <_ChromeMain+0x4638078>
 4635ca0: f9003bf5     	str	x21, [sp, #0x70]
 4635ca4: 9101c3e0     	add	x0, sp, #0x70
 4635ca8: 9400e11a     	bl	0x466e110 <_ChromeMain+0x4668e74>
 4635cac: 91400678     	add	x24, x19, #0x1, lsl #12 ; =0x1000
 4635cb0: 39407308     	ldrb	w8, [x24, #0x1c]
 4635cb4: b9401ff9     	ldr	w25, [sp, #0x1c]
 4635cb8: 340005c8     	cbz	w8, 0x4635d70 <_ChromeMain+0x4630ad4>
 4635cbc: f9423668     	ldr	x8, [x19, #0x468]
 4635cc0: b4000588     	cbz	x8, 0x4635d70 <_ChromeMain+0x4630ad4>
 4635cc4: b9501a7b     	ldr	w27, [x19, #0x1018]
 4635cc8: b90057fb     	str	w27, [sp, #0x54]
 4635ccc: f9400100     	ldr	x0, [x8]
 4635cd0: b9401808     	ldr	w8, [x0, #0x18]
 4635cd4: 7100051f     	cmp	w8, #0x1
 4635cd8: 5400034b     	b.lt	0x4635d40 <_ChromeMain+0x4630aa4>
 4635cdc: d2800014     	mov	x20, #0x0               ; =0
 4635ce0: 14000007     	b	0x4635cfc <_ChromeMain+0x4630a60>
 4635ce4: 91000694     	add	x20, x20, #0x1
 4635ce8: f9423668     	ldr	x8, [x19, #0x468]
 4635cec: f9400100     	ldr	x0, [x8]
 4635cf0: b9801808     	ldrsw	x8, [x0, #0x18]
 4635cf4: eb08029f     	cmp	x20, x8
 4635cf8: 5400020a     	b.ge	0x4635d38 <_ChromeMain+0x4630a9c>
 4635cfc: aa1403e1     	mov	x1, x20
 4635d00: 9728a17e     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4635d04: b4ffff00     	cbz	x0, 0x4635ce4 <_ChromeMain+0x4630a48>
 4635d08: b9401008     	ldr	w8, [x0, #0x10]
 4635d0c: 6b1b011f     	cmp	w8, w27
 4635d10: 54fffea1     	b.ne	0x4635ce4 <_ChromeMain+0x4630a48>
 4635d14: f9423668     	ldr	x8, [x19, #0x468]
 4635d18: f9400100     	ldr	x0, [x8]
 4635d1c: aa1403e1     	mov	x1, x20
 4635d20: 9728a176     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4635d24: b40000a0     	cbz	x0, 0x4635d38 <_ChromeMain+0x4630a9c>
 4635d28: 39418408     	ldrb	w8, [x0, #0x61]
 4635d2c: 37000068     	tbnz	w8, #0x0, 0x4635d38 <_ChromeMain+0x4630a9c>
 4635d30: 3941e008     	ldrb	w8, [x0, #0x78]
 4635d34: 36002be8     	tbz	w8, #0x0, 0x46362b0 <_ChromeMain+0x4631014>
 4635d38: 39407308     	ldrb	w8, [x24, #0x1c]
 4635d3c: 34000048     	cbz	w8, 0x4635d44 <_ChromeMain+0x4630aa8>
 4635d40: 3900731f     	strb	wzr, [x24, #0x1c]
 4635d44: 3940b308     	ldrb	w8, [x24, #0x2c]
 4635d48: 34000148     	cbz	w8, 0x4635d70 <_ChromeMain+0x4630ad4>
 4635d4c: b9502a68     	ldr	w8, [x19, #0x1028]
 4635d50: 6b1b011f     	cmp	w8, w27
 4635d54: 540000e1     	b.ne	0x4635d70 <_ChromeMain+0x4630ad4>
 4635d58: 52820608     	mov	w8, #0x1030             ; =4144
 4635d5c: 8b080260     	add	x0, x19, x8
 4635d60: 9703e26e     	bl	0x72e718 <_ChromeMain+0x72947c>
 4635d64: 3940b308     	ldrb	w8, [x24, #0x2c]
 4635d68: 34000048     	cbz	w8, 0x4635d70 <_ChromeMain+0x4630ad4>
 4635d6c: 3900b31f     	strb	wzr, [x24, #0x2c]
 4635d70: 37001399     	tbnz	w25, #0x0, 0x4635fe0 <_ChromeMain+0x4630d44>
 4635d74: f942e674     	ldr	x20, [x19, #0x5c8]
 4635d78: b4000f94     	cbz	x20, 0x4635f68 <_ChromeMain+0x4630ccc>
 4635d7c: f948d668     	ldr	x8, [x19, #0x11a8]
 4635d80: 52801709     	mov	w9, #0xb8               ; =184
 4635d84: 9b097d08     	mul	x8, x8, x9
 4635d88: b4000f08     	cbz	x8, 0x4635f68 <_ChromeMain+0x4630ccc>
 4635d8c: f948d276     	ldr	x22, [x19, #0x11a0]
 4635d90: 8b0802d7     	add	x23, x22, x8
 4635d94: a943a3f8     	ldp	x24, x8, [sp, #0x38]
 4635d98: 52801709     	mov	w9, #0xb8               ; =184
 4635d9c: 9b097d19     	mul	x25, x8, x9
 4635da0: 14000008     	b	0x4635dc0 <_ChromeMain+0x4630b24>
 4635da4: b94032c8     	ldr	w8, [x22, #0x30]
 4635da8: 51000908     	sub	w8, w8, #0x2
 4635dac: 71000d1f     	cmp	w8, #0x3
 4635db0: 54000583     	b.lo	0x4635e60 <_ChromeMain+0x4630bc4>
 4635db4: 9102e2d6     	add	x22, x22, #0xb8
 4635db8: eb1702df     	cmp	x22, x23
 4635dbc: 54000d60     	b.eq	0x4635f68 <_ChromeMain+0x4630ccc>
 4635dc0: b4ffff39     	cbz	x25, 0x4635da4 <_ChromeMain+0x4630b08>
 4635dc4: 39405ec8     	ldrb	w8, [x22, #0x17]
 4635dc8: 13001d1b     	sxtb	w27, w8
 4635dcc: f94006c9     	ldr	x9, [x22, #0x8]
 4635dd0: 7100037f     	cmp	w27, #0x0
 4635dd4: 9a884135     	csel	x21, x9, x8, mi
 4635dd8: aa1903fc     	mov	x28, x25
 4635ddc: aa1803fa     	mov	x26, x24
 4635de0: 14000004     	b	0x4635df0 <_ChromeMain+0x4630b54>
 4635de4: 9102e35a     	add	x26, x26, #0xb8
 4635de8: f102e39c     	subs	x28, x28, #0xb8
 4635dec: 54fffdc0     	b.eq	0x4635da4 <_ChromeMain+0x4630b08>
 4635df0: 39405f49     	ldrb	w9, [x26, #0x17]
 4635df4: 13001d28     	sxtb	w8, w9
 4635df8: f940074a     	ldr	x10, [x26, #0x8]
 4635dfc: 7100011f     	cmp	w8, #0x0
 4635e00: 9a894149     	csel	x9, x10, x9, mi
 4635e04: eb15013f     	cmp	x9, x21
 4635e08: 54fffee1     	b.ne	0x4635de4 <_ChromeMain+0x4630b48>
 4635e0c: f9400349     	ldr	x9, [x26]
 4635e10: 7100011f     	cmp	w8, #0x0
 4635e14: 9a9a4120     	csel	x0, x9, x26, mi
 4635e18: f94002c8     	ldr	x8, [x22]
 4635e1c: 7100037f     	cmp	w27, #0x0
 4635e20: 9a964101     	csel	x1, x8, x22, mi
 4635e24: aa1503e2     	mov	x2, x21
 4635e28: 94e74e8e     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4635e2c: 35fffdc0     	cbnz	w0, 0x4635de4 <_ChromeMain+0x4630b48>
 4635e30: b94032c8     	ldr	w8, [x22, #0x30]
 4635e34: 51000909     	sub	w9, w8, #0x2
 4635e38: 7100093f     	cmp	w9, #0x2
 4635e3c: 54fffbc8     	b.hi	0x4635db4 <_ChromeMain+0x4630b18>
 4635e40: 7100091f     	cmp	w8, #0x2
 4635e44: b9403349     	ldr	w9, [x26, #0x30]
 4635e48: 7a420924     	ccmp	w9, #0x2, #0x4, eq
 4635e4c: 1a9f07e8     	cset	w8, ne
 4635e50: 51001529     	sub	w9, w9, #0x5
 4635e54: 31000d3f     	cmn	w9, #0x3
 4635e58: 54000043     	b.lo	0x4635e60 <_ChromeMain+0x4630bc4>
 4635e5c: 3607fac8     	tbz	w8, #0x0, 0x4635db4 <_ChromeMain+0x4630b18>
 4635e60: 3950e288     	ldrb	w8, [x20, #0x438]
 4635e64: 37000268     	tbnz	w8, #0x0, 0x4635eb0 <_ChromeMain+0x4630c14>
 4635e68: 52800028     	mov	w8, #0x1                ; =1
 4635e6c: 3910e288     	strb	w8, [x20, #0x438]
 4635e70: f9418a88     	ldr	x8, [x20, #0x310]
 4635e74: f9427115     	ldr	x21, [x8, #0x4e0]
 4635e78: b4000075     	cbz	x21, 0x4635e84 <_ChromeMain+0x4630be8>
 4635e7c: 395042a8     	ldrb	w8, [x21, #0x410]
 4635e80: 36002de8     	tbz	w8, #0x0, 0x463643c <_ChromeMain+0x46311a0>
 4635e84: f941be80     	ldr	x0, [x20, #0x378]
 4635e88: f9400008     	ldr	x8, [x0]
 4635e8c: f9405108     	ldr	x8, [x8, #0xa0]
 4635e90: 52800021     	mov	w1, #0x1                ; =1
 4635e94: d63f0100     	blr	x8
 4635e98: 3950e288     	ldrb	w8, [x20, #0x438]
 4635e9c: 910ec280     	add	x0, x20, #0x3b0
 4635ea0: 52000101     	eor	w1, w8, #0x1
 4635ea4: 9775a2b0     	bl	0x239e964 <_ChromeMain+0x23996c8>
 4635ea8: aa1403e0     	mov	x0, x20
 4635eac: 9400c5e5     	bl	0x4667640 <_ChromeMain+0x46623a4>
 4635eb0: d0053660     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 4635eb4: 91360000     	add	x0, x0, #0xd80
 4635eb8: f9400008     	ldr	x8, [x0]
 4635ebc: d63f0100     	blr	x8
 4635ec0: f9400008     	ldr	x8, [x0]
 4635ec4: b4005fe8     	cbz	x8, 0x4636ac0 <_ChromeMain+0x4631824>
 4635ec8: f9400114     	ldr	x20, [x8]
 4635ecc: b4005fb4     	cbz	x20, 0x4636ac0 <_ChromeMain+0x4631824>
 4635ed0: d004c4a0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4635ed4: 91306000     	add	x0, x0, #0xc18
 4635ed8: d004c4a1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4635edc: 912c7821     	add	x1, x1, #0xb1e
 4635ee0: 9101c3e8     	add	x8, sp, #0x70
 4635ee4: 52844ca2     	mov	w2, #0x2265             ; =8805
 4635ee8: 96e86b66     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4635eec: f94a0675     	ldr	x21, [x19, #0x1408]
 4635ef0: b40000d5     	cbz	x21, 0x4635f08 <_ChromeMain+0x4630c6c>
 4635ef4: 52800028     	mov	w8, #0x1                ; =1
 4635ef8: b82802a8     	ldadd	w8, w8, [x21]
 4635efc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4635f00: 6b09011f     	cmp	w8, w9
 4635f04: 54005e40     	b.eq	0x4636acc <_ChromeMain+0x4631830>
 4635f08: f94a0a76     	ldr	x22, [x19, #0x1410]
 4635f0c: 52800800     	mov	w0, #0x40               ; =64
 4635f10: 96e76516     	bl	0xf368 <_ChromeMain+0xa0cc>
 4635f14: aa0003e2     	mov	x2, x0
 4635f18: 52800028     	mov	w8, #0x1                ; =1
 4635f1c: b9000008     	str	w8, [x0]
 4635f20: d0ffcc28     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 4635f24: 911c0108     	add	x8, x8, #0x700
 4635f28: b0ffcb49     	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 4635f2c: 91110129     	add	x9, x9, #0x440
 4635f30: a900a408     	stp	x8, x9, [x0, #0x8]
 4635f34: b0ffd1a8     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 4635f38: 910a0108     	add	x8, x8, #0x280
 4635f3c: 1004aac9     	adr	x9, 0x463f494 <_ChromeMain+0x463a1f8>
 4635f40: d503201f     	nop
 4635f44: a901a408     	stp	x8, x9, [x0, #0x18]
 4635f48: a902d41f     	stp	xzr, x21, [x0, #0x28]
 4635f4c: f9001c16     	str	x22, [x0, #0x38]
 4635f50: f9400288     	ldr	x8, [x20]
 4635f54: f9400108     	ldr	x8, [x8]
 4635f58: 9101c3e1     	add	x1, sp, #0x70
 4635f5c: aa1403e0     	mov	x0, x20
 4635f60: d2800003     	mov	x3, #0x0                ; =0
 4635f64: d63f0100     	blr	x8
 4635f68: f9442674     	ldr	x20, [x19, #0x848]
 4635f6c: b0052ba0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 4635f70: 9118e000     	add	x0, x0, #0x638
 4635f74: 96eb8cc3     	bl	0x119280 <_ChromeMain+0x113fe4>
 4635f78: b9401ff9     	ldr	w25, [sp, #0x1c]
 4635f7c: 91400678     	add	x24, x19, #0x1, lsl #12 ; =0x1000
 4635f80: 370000a0     	tbnz	w0, #0x0, 0x4635f94 <_ChromeMain+0x4630cf8>
 4635f84: b0052ba0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 4635f88: 91192000     	add	x0, x0, #0x648
 4635f8c: 96eb8cbd     	bl	0x119280 <_ChromeMain+0x113fe4>
 4635f90: 34000280     	cbz	w0, 0x4635fe0 <_ChromeMain+0x4630d44>
 4635f94: 39478288     	ldrb	w8, [x20, #0x1e0]
 4635f98: 34000248     	cbz	w8, 0x4635fe0 <_ChromeMain+0x4630d44>
 4635f9c: 394a8308     	ldrb	w8, [x24, #0x2a0]
 4635fa0: 37000208     	tbnz	w8, #0x0, 0x4635fe0 <_ChromeMain+0x4630d44>
 4635fa4: 394a0308     	ldrb	w8, [x24, #0x280]
 4635fa8: 370001c8     	tbnz	w8, #0x0, 0x4635fe0 <_ChromeMain+0x4630d44>
 4635fac: f942e668     	ldr	x8, [x19, #0x5c8]
 4635fb0: b4000188     	cbz	x8, 0x4635fe0 <_ChromeMain+0x4630d44>
 4635fb4: 9101c3e8     	add	x8, sp, #0x70
 4635fb8: aa1303e0     	mov	x0, x19
 4635fbc: 9400092d     	bl	0x4638470 <_ChromeMain+0x46331d4>
 4635fc0: 394223e8     	ldrb	w8, [sp, #0x88]
 4635fc4: 34001588     	cbz	w8, 0x4636274 <_ChromeMain+0x4630fd8>
 4635fc8: 39c21fe9     	ldrsb	w9, [sp, #0x87]
 4635fcc: 36f81549     	tbz	w9, #0x1f, 0x4636274 <_ChromeMain+0x4630fd8>
 4635fd0: f9403be0     	ldr	x0, [sp, #0x70]
 4635fd4: f94043e8     	ldr	x8, [sp, #0x80]
 4635fd8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4635fdc: 96e74bb7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4635fe0: 9107a714     	add	x20, x24, #0x1e9
 4635fe4: 3947a718     	ldrb	w24, [x24, #0x1e9]
 4635fe8: 2a190315     	orr	w21, w24, w25
 4635fec: 925e7696     	and	x22, x20, #0xfffffffc00000000
 4635ff0: b0052bf7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4635ff4: f94046e8     	ldr	x8, [x23, #0x88]
 4635ff8: eb0802df     	cmp	x22, x8
 4635ffc: 54000081     	b.ne	0x463600c <_ChromeMain+0x4630d70>
 4636000: aa1403e0     	mov	x0, x20
 4636004: 96e778be     	bl	0x142fc <_ChromeMain+0xf060>
 4636008: 39400298     	ldrb	w24, [x20]
 463600c: 39000295     	strb	w21, [x20]
 4636010: f9423668     	ldr	x8, [x19, #0x468]
 4636014: b4000228     	cbz	x8, 0x4636058 <_ChromeMain+0x4630dbc>
 4636018: f9400100     	ldr	x0, [x8]
 463601c: b9401808     	ldr	w8, [x0, #0x18]
 4636020: 7100051f     	cmp	w8, #0x1
 4636024: 540001ab     	b.lt	0x4636058 <_ChromeMain+0x4630dbc>
 4636028: d2800015     	mov	x21, #0x0               ; =0
 463602c: aa1503e1     	mov	x1, x21
 4636030: 9728a0b2     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4636034: aa0003e1     	mov	x1, x0
 4636038: aa1303e0     	mov	x0, x19
 463603c: 94002191     	bl	0x463e680 <_ChromeMain+0x46393e4>
 4636040: 910006b5     	add	x21, x21, #0x1
 4636044: f9423668     	ldr	x8, [x19, #0x468]
 4636048: f9400100     	ldr	x0, [x8]
 463604c: b9801808     	ldrsw	x8, [x0, #0x18]
 4636050: eb0802bf     	cmp	x21, x8
 4636054: 54fffecb     	b.lt	0x463602c <_ChromeMain+0x4630d90>
 4636058: aa1303e0     	mov	x0, x19
 463605c: 9400235a     	bl	0x463edc4 <_ChromeMain+0x4639b28>
 4636060: aa1303e0     	mov	x0, x19
 4636064: 9400037f     	bl	0x4636e60 <_ChromeMain+0x4631bc4>
 4636068: aa1303e0     	mov	x0, x19
 463606c: 350000d9     	cbnz	w25, 0x4636084 <_ChromeMain+0x4630de8>
 4636070: 97ffd846     	bl	0x462c188 <_ChromeMain+0x4626eec>
 4636074: 14000005     	b	0x4636088 <_ChromeMain+0x4630dec>
 4636078: aa1303e0     	mov	x0, x19
 463607c: 94000379     	bl	0x4636e60 <_ChromeMain+0x4631bc4>
 4636080: 14000008     	b	0x46360a0 <_ChromeMain+0x4630e04>
 4636084: 94001e13     	bl	0x463d8d0 <_ChromeMain+0x4638634>
 4636088: 39000298     	strb	w24, [x20]
 463608c: f94046e8     	ldr	x8, [x23, #0x88]
 4636090: eb0802df     	cmp	x22, x8
 4636094: 54000061     	b.ne	0x46360a0 <_ChromeMain+0x4630e04>
 4636098: aa1403e0     	mov	x0, x20
 463609c: 96e7b268     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46360a0: 9100e3e8     	add	x8, sp, #0x38
 46360a4: f9003be8     	str	x8, [sp, #0x70]
 46360a8: 9101c3e0     	add	x0, sp, #0x70
 46360ac: 9400e019     	bl	0x466e110 <_ChromeMain+0x4668e74>
 46360b0: f85a03a8     	ldur	x8, [x29, #-0x60]
 46360b4: d004cf89     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 46360b8: f940f929     	ldr	x9, [x9, #0x1f0]
 46360bc: f9400129     	ldr	x9, [x9]
 46360c0: eb08013f     	cmp	x9, x8
 46360c4: 54004a21     	b.ne	0x4636a08 <_ChromeMain+0x463176c>
 46360c8: a9567bfd     	ldp	x29, x30, [sp, #0x160]
 46360cc: a9554ff4     	ldp	x20, x19, [sp, #0x150]
 46360d0: a95457f6     	ldp	x22, x21, [sp, #0x140]
 46360d4: a9535ff8     	ldp	x24, x23, [sp, #0x130]
 46360d8: a95267fa     	ldp	x26, x25, [sp, #0x120]
 46360dc: a9516ffc     	ldp	x28, x27, [sp, #0x110]
 46360e0: 9105c3ff     	add	sp, sp, #0x170
 46360e4: d65f03c0     	ret
 46360e8: 9102e37b     	add	x27, x27, #0xb8
 46360ec: f102e318     	subs	x24, x24, #0xb8
 46360f0: 54000500     	b.eq	0x4636190 <_ChromeMain+0x4630ef4>
 46360f4: 39405f69     	ldrb	w9, [x27, #0x17]
 46360f8: 13001d28     	sxtb	w8, w9
 46360fc: f940076a     	ldr	x10, [x27, #0x8]
 4636100: 7100011f     	cmp	w8, #0x0
 4636104: 9a894149     	csel	x9, x10, x9, mi
 4636108: eb16013f     	cmp	x9, x22
 463610c: 54fffee1     	b.ne	0x46360e8 <_ChromeMain+0x4630e4c>
 4636110: f9400369     	ldr	x9, [x27]
 4636114: 7100011f     	cmp	w8, #0x0
 4636118: 9a9b4120     	csel	x0, x9, x27, mi
 463611c: f9400288     	ldr	x8, [x20]
 4636120: 7100033f     	cmp	w25, #0x0
 4636124: 9a944101     	csel	x1, x8, x20, mi
 4636128: aa1603e2     	mov	x2, x22
 463612c: 94e74dcd     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4636130: 35fffdc0     	cbnz	w0, 0x46360e8 <_ChromeMain+0x4630e4c>
 4636134: 3942c368     	ldrb	w8, [x27, #0xb0]
 4636138: 340002c8     	cbz	w8, 0x4636190 <_ChromeMain+0x4630ef4>
 463613c: 39413f69     	ldrb	w9, [x27, #0x4f]
 4636140: 13001d28     	sxtb	w8, w9
 4636144: f940236a     	ldr	x10, [x27, #0x40]
 4636148: 7100011f     	cmp	w8, #0x0
 463614c: 9a894142     	csel	x2, x10, x9, mi
 4636150: 39413e8a     	ldrb	w10, [x20, #0x4f]
 4636154: 13001d49     	sxtb	w9, w10
 4636158: f940228b     	ldr	x11, [x20, #0x40]
 463615c: 7100013f     	cmp	w9, #0x0
 4636160: 9a8a416a     	csel	x10, x11, x10, mi
 4636164: eb0a005f     	cmp	x2, x10
 4636168: 54000141     	b.ne	0x4636190 <_ChromeMain+0x4630ef4>
 463616c: 9100e36a     	add	x10, x27, #0x38
 4636170: f940014b     	ldr	x11, [x10]
 4636174: 7100011f     	cmp	w8, #0x0
 4636178: 9a8a4160     	csel	x0, x11, x10, mi
 463617c: f94002a8     	ldr	x8, [x21]
 4636180: 7100013f     	cmp	w9, #0x0
 4636184: 9a954101     	csel	x1, x8, x21, mi
 4636188: 94e74db6     	bl	0x8009860 <_ChromeMain+0x80045c4>
 463618c: 340004c0     	cbz	w0, 0x4636224 <_ChromeMain+0x4630f88>
 4636190: a905ffff     	stp	xzr, xzr, [sp, #0x58]
 4636194: f90037ff     	str	xzr, [sp, #0x68]
 4636198: 39805e88     	ldrsb	x8, [x20, #0x17]
 463619c: a9402a89     	ldp	x9, x10, [x20]
 46361a0: f100011f     	cmp	x8, #0x0
 46361a4: 9a944129     	csel	x9, x9, x20, mi
 46361a8: 7100011f     	cmp	w8, #0x0
 46361ac: 9a884148     	csel	x8, x10, x8, mi
 46361b0: a90723e9     	stp	x9, x8, [sp, #0x70]
 46361b4: b0048d88     	adrp	x8, 0xd7e7000 <dyld_stub_binder+0xd7e7000>
 46361b8: 91289108     	add	x8, x8, #0xa24
 46361bc: a9085fe8     	stp	x8, x23, [sp, #0x80]
 46361c0: 39813e88     	ldrsb	x8, [x20, #0x4f]
 46361c4: a943aa89     	ldp	x9, x10, [x20, #0x38]
 46361c8: f100011f     	cmp	x8, #0x0
 46361cc: 9a954129     	csel	x9, x9, x21, mi
 46361d0: 7100011f     	cmp	w8, #0x0
 46361d4: 9a884148     	csel	x8, x10, x8, mi
 46361d8: a90923e9     	stp	x9, x8, [sp, #0x90]
 46361dc: 910163e8     	add	x8, sp, #0x58
 46361e0: 9101c3e0     	add	x0, sp, #0x70
 46361e4: 52800061     	mov	w1, #0x3                ; =3
 46361e8: 9700d25b     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 46361ec: 52825908     	mov	w8, #0x12c8             ; =4808
 46361f0: 8b080260     	add	x0, x19, x8
 46361f4: 910163e1     	add	x1, sp, #0x58
 46361f8: 973b0a82     	bl	0x14f8c00 <_ChromeMain+0x14f3964>
 46361fc: 36001a20     	tbz	w0, #0x0, 0x4636540 <_ChromeMain+0x46312a4>
 4636200: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 4636204: 36f80108     	tbz	w8, #0x1f, 0x4636224 <_ChromeMain+0x4630f88>
 4636208: f9402fe0     	ldr	x0, [sp, #0x58]
 463620c: f94037e8     	ldr	x8, [sp, #0x68]
 4636210: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4636214: 96e74b29     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4636218: 14000003     	b	0x4636224 <_ChromeMain+0x4630f88>
 463621c: f9400688     	ldr	x8, [x20, #0x8]
 4636220: b5000148     	cbnz	x8, 0x4636248 <_ChromeMain+0x4630fac>
 4636224: 9102e294     	add	x20, x20, #0xb8
 4636228: eb1a029f     	cmp	x20, x26
 463622c: b9401ff9     	ldr	w25, [sp, #0x1c]
 4636230: 91400678     	add	x24, x19, #0x1, lsl #12 ; =0x1000
 4636234: 54ffed60     	b.eq	0x4635fe0 <_ChromeMain+0x4630d44>
 4636238: 39805e99     	ldrsb	x25, [x20, #0x17]
 463623c: b7ffff19     	tbnz	x25, #0x3f, 0x463621c <_ChromeMain+0x4630f80>
 4636240: aa1903e8     	mov	x8, x25
 4636244: b4ffff08     	cbz	x8, 0x4636224 <_ChromeMain+0x4630f88>
 4636248: 3942c288     	ldrb	w8, [x20, #0xb0]
 463624c: 34fffec8     	cbz	w8, 0x4636224 <_ChromeMain+0x4630f88>
 4636250: 9100e295     	add	x21, x20, #0x38
 4636254: f94023e8     	ldr	x8, [sp, #0x40]
 4636258: 9b1c7d18     	mul	x24, x8, x28
 463625c: b4fff9b8     	cbz	x24, 0x4636190 <_ChromeMain+0x4630ef4>
 4636260: f9401ffb     	ldr	x27, [sp, #0x38]
 4636264: f9400688     	ldr	x8, [x20, #0x8]
 4636268: 7100033f     	cmp	w25, #0x0
 463626c: 9a994116     	csel	x22, x8, x25, mi
 4636270: 17ffffa1     	b	0x46360f4 <_ChromeMain+0x4630e58>
 4636274: 3707eb68     	tbnz	w8, #0x0, 0x4635fe0 <_ChromeMain+0x4630d44>
 4636278: f948d668     	ldr	x8, [x19, #0x11a8]
 463627c: 52801709     	mov	w9, #0xb8               ; =184
 4636280: 9b097d08     	mul	x8, x8, x9
 4636284: b4ffeae8     	cbz	x8, 0x4635fe0 <_ChromeMain+0x4630d44>
 4636288: 52823e09     	mov	w9, #0x11f0             ; =4592
 463628c: 8b090269     	add	x9, x19, x9
 4636290: f9000be9     	str	x9, [sp, #0x10]
 4636294: f948d274     	ldr	x20, [x19, #0x11a0]
 4636298: 8b08029a     	add	x26, x20, x8
 463629c: 5280171c     	mov	w28, #0xb8              ; =184
 46362a0: 52800037     	mov	w23, #0x1               ; =1
 46362a4: 17ffffe5     	b	0x4636238 <_ChromeMain+0x4630f9c>
 46362a8: aa0903eb     	mov	x11, x9
 46362ac: 14000013     	b	0x46362f8 <_ChromeMain+0x463105c>
 46362b0: 39624268     	ldrb	w8, [x19, #0x890]
 46362b4: 34ffd428     	cbz	w8, 0x4635d38 <_ChromeMain+0x4630a9c>
 46362b8: b9401008     	ldr	w8, [x0, #0x10]
 46362bc: f9486e69     	ldr	x9, [x19, #0x10d8]
 46362c0: f948726a     	ldr	x10, [x19, #0x10e0]
 46362c4: d37ef54b     	lsl	x11, x10, #2
 46362c8: b4ffff0b     	cbz	x11, 0x46362a8 <_ChromeMain+0x463100c>
 46362cc: 9342fd6c     	asr	x12, x11, #2
 46362d0: aa0903eb     	mov	x11, x9
 46362d4: d341fd8d     	lsr	x13, x12, #1
 46362d8: 8b0d096e     	add	x14, x11, x13, lsl #2
 46362dc: b84045cf     	ldr	w15, [x14], #0x4
 46362e0: aa6c07f0     	mvn	x16, x12, lsr #1
 46362e4: 8b10018c     	add	x12, x12, x16
 46362e8: 6b0801ff     	cmp	w15, w8
 46362ec: 9a8db18c     	csel	x12, x12, x13, lt
 46362f0: 9a8bb1cb     	csel	x11, x14, x11, lt
 46362f4: b5ffff0c     	cbnz	x12, 0x46362d4 <_ChromeMain+0x4631038>
 46362f8: 8b0a0929     	add	x9, x9, x10, lsl #2
 46362fc: eb09017f     	cmp	x11, x9
 4636300: 54000080     	b.eq	0x4636310 <_ChromeMain+0x4631074>
 4636304: b9400169     	ldr	w9, [x11]
 4636308: 6b09011f     	cmp	w8, w9
 463630c: 54ffd16a     	b.ge	0x4635d38 <_ChromeMain+0x4630a9c>
 4636310: f9484a69     	ldr	x9, [x19, #0x1090]
 4636314: f9484e6a     	ldr	x10, [x19, #0x1098]
 4636318: d37ef54b     	lsl	x11, x10, #2
 463631c: b40004eb     	cbz	x11, 0x46363b8 <_ChromeMain+0x463111c>
 4636320: 9342fd6c     	asr	x12, x11, #2
 4636324: aa0903eb     	mov	x11, x9
 4636328: d341fd8d     	lsr	x13, x12, #1
 463632c: 8b0d096e     	add	x14, x11, x13, lsl #2
 4636330: b84045cf     	ldr	w15, [x14], #0x4
 4636334: aa6c07f0     	mvn	x16, x12, lsr #1
 4636338: 8b10018c     	add	x12, x12, x16
 463633c: 6b0801ff     	cmp	w15, w8
 4636340: 9a8db18c     	csel	x12, x12, x13, lt
 4636344: 9a8bb1cb     	csel	x11, x14, x11, lt
 4636348: b5ffff0c     	cbnz	x12, 0x4636328 <_ChromeMain+0x463108c>
 463634c: 8b0a0929     	add	x9, x9, x10, lsl #2
 4636350: eb09017f     	cmp	x11, x9
 4636354: 54000080     	b.eq	0x4636364 <_ChromeMain+0x46310c8>
 4636358: b9400169     	ldr	w9, [x11]
 463635c: 6b09011f     	cmp	w8, w9
 4636360: 54ffceca     	b.ge	0x4635d38 <_ChromeMain+0x4630a9c>
 4636364: 6f00e400     	movi.2d	v0, #0000000000000000
 4636368: ad0383e0     	stp	q0, q0, [sp, #0x70]
 463636c: f9402001     	ldr	x1, [x0, #0x40]
 4636370: 9101c3e8     	add	x8, sp, #0x70
 4636374: aa1303e0     	mov	x0, x19
 4636378: 940006ea     	bl	0x4637f20 <_ChromeMain+0x4632c84>
 463637c: 394223e8     	ldrb	w8, [sp, #0x88]
 4636380: 34ffcf88     	cbz	w8, 0x4635d70 <_ChromeMain+0x4630ad4>
 4636384: f948d668     	ldr	x8, [x19, #0x11a8]
 4636388: 52801709     	mov	w9, #0xb8               ; =184
 463638c: 9b097d1c     	mul	x28, x8, x9
 4636390: b40003dc     	cbz	x28, 0x4636408 <_ChromeMain+0x463116c>
 4636394: f948d279     	ldr	x25, [x19, #0x11a0]
 4636398: 39421fe8     	ldrb	w8, [sp, #0x87]
 463639c: 13001d1a     	sxtb	w26, w8
 46363a0: 7100035f     	cmp	w26, #0x0
 46363a4: a94757f6     	ldp	x22, x21, [sp, #0x70]
 46363a8: 9a8842b7     	csel	x23, x21, x8, mi
 46363ac: 9101c3e8     	add	x8, sp, #0x70
 46363b0: 9a8842d8     	csel	x24, x22, x8, mi
 46363b4: 14000006     	b	0x46363cc <_ChromeMain+0x4631130>
 46363b8: aa0903eb     	mov	x11, x9
 46363bc: 17ffffe4     	b	0x463634c <_ChromeMain+0x46310b0>
 46363c0: 9102e339     	add	x25, x25, #0xb8
 46363c4: f102e39c     	subs	x28, x28, #0xb8
 46363c8: 54000240     	b.eq	0x4636410 <_ChromeMain+0x4631174>
 46363cc: 39405f29     	ldrb	w9, [x25, #0x17]
 46363d0: 13001d28     	sxtb	w8, w9
 46363d4: f940072a     	ldr	x10, [x25, #0x8]
 46363d8: 7100011f     	cmp	w8, #0x0
 46363dc: 9a894149     	csel	x9, x10, x9, mi
 46363e0: eb17013f     	cmp	x9, x23
 46363e4: 54fffee1     	b.ne	0x46363c0 <_ChromeMain+0x4631124>
 46363e8: f9400329     	ldr	x9, [x25]
 46363ec: 7100011f     	cmp	w8, #0x0
 46363f0: 9a994120     	csel	x0, x9, x25, mi
 46363f4: aa1803e1     	mov	x1, x24
 46363f8: aa1703e2     	mov	x2, x23
 46363fc: 94e74d19     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4636400: 34001f40     	cbz	w0, 0x46367e8 <_ChromeMain+0x463154c>
 4636404: 17ffffef     	b	0x46363c0 <_ChromeMain+0x4631124>
 4636408: 52800028     	mov	w8, #0x1                ; =1
 463640c: 14000004     	b	0x463641c <_ChromeMain+0x4631180>
 4636410: 52800028     	mov	w8, #0x1                ; =1
 4636414: b9401ff9     	ldr	w25, [sp, #0x1c]
 4636418: 91400678     	add	x24, x19, #0x1, lsl #12 ; =0x1000
 463641c: 3607caa8     	tbz	w8, #0x0, 0x4635d70 <_ChromeMain+0x4630ad4>
 4636420: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4636424: 36ffca68     	tbz	w8, #0x1f, 0x4635d70 <_ChromeMain+0x4630ad4>
 4636428: f9403be0     	ldr	x0, [sp, #0x70]
 463642c: f94043e8     	ldr	x8, [sp, #0x80]
 4636430: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4636434: 96e74aa1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4636438: 17fffe4e     	b	0x4635d70 <_ChromeMain+0x4630ad4>
 463643c: 52800028     	mov	w8, #0x1                ; =1
 4636440: 391042a8     	strb	w8, [x21, #0x410]
 4636444: 910e22a0     	add	x0, x21, #0x388
 4636448: 52800001     	mov	w1, #0x0                ; =0
 463644c: 9775a146     	bl	0x239e964 <_ChromeMain+0x23996c8>
 4636450: aa1503e0     	mov	x0, x21
 4636454: 96fdab4a     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4636458: 17fffe8b     	b	0x4635e84 <_ChromeMain+0x4630be8>
 463645c: 9342fd4a     	asr	x10, x10, #2
 4636460: aa0803e1     	mov	x1, x8
 4636464: d341fd4b     	lsr	x11, x10, #1
 4636468: 8b0b082c     	add	x12, x1, x11, lsl #2
 463646c: b840458d     	ldr	w13, [x12], #0x4
 4636470: aa6a07ee     	mvn	x14, x10, lsr #1
 4636474: 8b0e014a     	add	x10, x10, x14
 4636478: 6b1b01bf     	cmp	w13, w27
 463647c: 9a8bb14a     	csel	x10, x10, x11, lt
 4636480: 9a81b181     	csel	x1, x12, x1, lt
 4636484: b5ffff0a     	cbnz	x10, 0x4636464 <_ChromeMain+0x46311c8>
 4636488: 140000f0     	b	0x4636848 <_ChromeMain+0x46315ac>
 463648c: 9345fd4a     	asr	x10, x10, #5
 4636490: aa0803e1     	mov	x1, x8
 4636494: d341fd4b     	lsr	x11, x10, #1
 4636498: 8b0b142c     	add	x12, x1, x11, lsl #5
 463649c: b842058d     	ldr	w13, [x12], #0x20
 46364a0: aa6a07ee     	mvn	x14, x10, lsr #1
 46364a4: 8b0e014a     	add	x10, x10, x14
 46364a8: 6b1b01bf     	cmp	w13, w27
 46364ac: 9a8bb14a     	csel	x10, x10, x11, lt
 46364b0: 9a81b181     	csel	x1, x12, x1, lt
 46364b4: b5ffff0a     	cbnz	x10, 0x4636494 <_ChromeMain+0x46311f8>
 46364b8: 140000f5     	b	0x463688c <_ChromeMain+0x46315f0>
 46364bc: 9345fd4a     	asr	x10, x10, #5
 46364c0: aa0803e1     	mov	x1, x8
 46364c4: d341fd4b     	lsr	x11, x10, #1
 46364c8: 8b0b142c     	add	x12, x1, x11, lsl #5
 46364cc: b842058d     	ldr	w13, [x12], #0x20
 46364d0: aa6a07ee     	mvn	x14, x10, lsr #1
 46364d4: 8b0e014a     	add	x10, x10, x14
 46364d8: 6b1b01bf     	cmp	w13, w27
 46364dc: 9a8bb14a     	csel	x10, x10, x11, lt
 46364e0: 9a81b181     	csel	x1, x12, x1, lt
 46364e4: b5ffff0a     	cbnz	x10, 0x46364c4 <_ChromeMain+0x4631228>
 46364e8: 1400010a     	b	0x4636910 <_ChromeMain+0x4631674>
 46364ec: 9344fd4a     	asr	x10, x10, #4
 46364f0: aa0803e1     	mov	x1, x8
 46364f4: d341fd4b     	lsr	x11, x10, #1
 46364f8: 8b0b102c     	add	x12, x1, x11, lsl #4
 46364fc: b841058d     	ldr	w13, [x12], #0x10
 4636500: aa6a07ee     	mvn	x14, x10, lsr #1
 4636504: 8b0e014a     	add	x10, x10, x14
 4636508: 6b1b01bf     	cmp	w13, w27
 463650c: 9a8bb14a     	csel	x10, x10, x11, lt
 4636510: 9a81b181     	csel	x1, x12, x1, lt
 4636514: b5ffff0a     	cbnz	x10, 0x46364f4 <_ChromeMain+0x4631258>
 4636518: 14000121     	b	0x463699c <_ChromeMain+0x4631700>
 463651c: f948fa60     	ldr	x0, [x19, #0x11f0]
 4636520: f9490268     	ldr	x8, [x19, #0x1200]
 4636524: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4636528: 96e74a64     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463652c: 1400004c     	b	0x463665c <_ChromeMain+0x46313c0>
 4636530: a9400a81     	ldp	x1, x2, [x20]
 4636534: 9101c3e0     	add	x0, sp, #0x70
 4636538: 96e78738     	bl	0x18218 <_ChromeMain+0x12f7c>
 463653c: 14000014     	b	0x463658c <_ChromeMain+0x46312f0>
 4636540: 52825908     	mov	w8, #0x12c8             ; =4808
 4636544: 8b080260     	add	x0, x19, x8
 4636548: 910163e1     	add	x1, sp, #0x58
 463654c: 910163e2     	add	x2, sp, #0x58
 4636550: 975eb26c     	bl	0x1de2f00 <_ChromeMain+0x1dddc64>
 4636554: 52825108     	mov	w8, #0x1288             ; =4744
 4636558: 8b080260     	add	x0, x19, x8
 463655c: 910163e1     	add	x1, sp, #0x58
 4636560: 97849890     	bl	0x275c7a0 <_ChromeMain+0x2757504>
 4636564: 52825508     	mov	w8, #0x12a8             ; =4776
 4636568: 8b080260     	add	x0, x19, x8
 463656c: aa1403e1     	mov	x1, x20
 4636570: 9784988c     	bl	0x275c7a0 <_ChromeMain+0x2757504>
 4636574: 39c05e88     	ldrsb	w8, [x20, #0x17]
 4636578: 37fffdc8     	tbnz	w8, #0x1f, 0x4636530 <_ChromeMain+0x4631294>
 463657c: 3dc00280     	ldr	q0, [x20]
 4636580: f9400a88     	ldr	x8, [x20, #0x10]
 4636584: f90043e8     	str	x8, [sp, #0x80]
 4636588: 3d801fe0     	str	q0, [sp, #0x70]
 463658c: 91400678     	add	x24, x19, #0x1, lsl #12 ; =0x1000
 4636590: f9400bf6     	ldr	x22, [sp, #0x10]
 4636594: 3942c288     	ldrb	w8, [x20, #0xb0]
 4636598: b9401ff9     	ldr	w25, [sp, #0x1c]
 463659c: 3607aec8     	tbz	w8, #0x0, 0x4635b74 <_ChromeMain+0x46308d8>
 46365a0: 9101c3f4     	add	x20, sp, #0x70
 46365a4: 91006280     	add	x0, x20, #0x18
 46365a8: aa1503e1     	mov	x1, x21
 46365ac: 97ffd1f5     	bl	0x462ad80 <_ChromeMain+0x4625ae4>
 46365b0: 394a0308     	ldrb	w8, [x24, #0x280]
 46365b4: 35000508     	cbnz	w8, 0x4636654 <_ChromeMain+0x46313b8>
 46365b8: b4ffadf6     	cbz	x22, 0x4635b74 <_ChromeMain+0x46308d8>
 46365bc: 3dc01fe0     	ldr	q0, [sp, #0x70]
 46365c0: 3d8002c0     	str	q0, [x22]
 46365c4: f94043e8     	ldr	x8, [sp, #0x80]
 46365c8: f9000ac8     	str	x8, [x22, #0x10]
 46365cc: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 46365d0: 3cc18280     	ldur	q0, [x20, #0x18]
 46365d4: 52824108     	mov	w8, #0x1208             ; =4616
 46365d8: 3ca86a60     	str	q0, [x19, x8]
 46365dc: f8428288     	ldur	x8, [x20, #0x28]
 46365e0: f9090e68     	str	x8, [x19, #0x1218]
 46365e4: a901fe9f     	stp	xzr, xzr, [x20, #0x18]
 46365e8: f802829f     	stur	xzr, [x20, #0x28]
 46365ec: f9405be8     	ldr	x8, [sp, #0xb0]
 46365f0: f9091a68     	str	x8, [x19, #0x1230]
 46365f4: 3dc02be0     	ldr	q0, [sp, #0xa0]
 46365f8: 3d848a60     	str	q0, [x19, #0x1220]
 46365fc: f90043ff     	str	xzr, [sp, #0x80]
 4636600: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 4636604: f94067e8     	ldr	x8, [sp, #0xc8]
 4636608: 3ccb83e0     	ldur	q0, [sp, #0xb8]
 463660c: 52824709     	mov	w9, #0x1238             ; =4664
 4636610: 3ca96a60     	str	q0, [x19, x9]
 4636614: f9092668     	str	x8, [x19, #0x1248]
 4636618: a90c7fff     	stp	xzr, xzr, [sp, #0xc0]
 463661c: a90b7fff     	stp	xzr, xzr, [sp, #0xb0]
 4636620: 3dc037e0     	ldr	q0, [sp, #0xd0]
 4636624: a94e27e8     	ldp	x8, x9, [sp, #0xe0]
 4636628: f9093268     	str	x8, [x19, #0x1260]
 463662c: 3d849660     	str	q0, [x19, #0x1250]
 4636630: a90d7fff     	stp	xzr, xzr, [sp, #0xd0]
 4636634: a90e7fff     	stp	xzr, xzr, [sp, #0xe0]
 4636638: f9093669     	str	x9, [x19, #0x1268]
 463663c: 3dc03fe0     	ldr	q0, [sp, #0xf0]
 4636640: a90f7fff     	stp	xzr, xzr, [sp, #0xf0]
 4636644: 3d849e60     	str	q0, [x19, #0x1270]
 4636648: 52800028     	mov	w8, #0x1                ; =1
 463664c: 390a0308     	strb	w8, [x24, #0x280]
 4636650: 1400000d     	b	0x4636684 <_ChromeMain+0x46313e8>
 4636654: 39c81f08     	ldrsb	w8, [x24, #0x207]
 4636658: 37fff628     	tbnz	w8, #0x1f, 0x463651c <_ChromeMain+0x4631280>
 463665c: 3dc01fe0     	ldr	q0, [sp, #0x70]
 4636660: 3d8002c0     	str	q0, [x22]
 4636664: f94043e8     	ldr	x8, [sp, #0x80]
 4636668: f9000ac8     	str	x8, [x22, #0x10]
 463666c: 39021fff     	strb	wzr, [sp, #0x87]
 4636670: 3901c3ff     	strb	wzr, [sp, #0x70]
 4636674: 52824108     	mov	w8, #0x1208             ; =4616
 4636678: 8b080260     	add	x0, x19, x8
 463667c: 91006281     	add	x1, x20, #0x18
 4636680: 97ffd239     	bl	0x462af64 <_ChromeMain+0x4625cc8>
 4636684: 91006280     	add	x0, x20, #0x18
 4636688: 97ffd286     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 463668c: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4636690: 36f800a8     	tbz	w8, #0x1f, 0x46366a4 <_ChromeMain+0x4631408>
 4636694: f9403be0     	ldr	x0, [sp, #0x70]
 4636698: f94043e8     	ldr	x8, [sp, #0x80]
 463669c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46366a0: 96e74a06     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46366a4: f942e674     	ldr	x20, [x19, #0x5c8]
 46366a8: 3950e288     	ldrb	w8, [x20, #0x438]
 46366ac: 370001e8     	tbnz	w8, #0x0, 0x46366e8 <_ChromeMain+0x463144c>
 46366b0: 52800028     	mov	w8, #0x1                ; =1
 46366b4: 3910e288     	strb	w8, [x20, #0x438]
 46366b8: f9418a88     	ldr	x8, [x20, #0x310]
 46366bc: f9427115     	ldr	x21, [x8, #0x4e0]
 46366c0: b4000155     	cbz	x21, 0x46366e8 <_ChromeMain+0x463144c>
 46366c4: 395042a8     	ldrb	w8, [x21, #0x410]
 46366c8: 37000108     	tbnz	w8, #0x0, 0x46366e8 <_ChromeMain+0x463144c>
 46366cc: 52800028     	mov	w8, #0x1                ; =1
 46366d0: 391042a8     	strb	w8, [x21, #0x410]
 46366d4: 910e22a0     	add	x0, x21, #0x388
 46366d8: 52800001     	mov	w1, #0x0                ; =0
 46366dc: 9775a0a2     	bl	0x239e964 <_ChromeMain+0x23996c8>
 46366e0: aa1503e0     	mov	x0, x21
 46366e4: 96fdaaa6     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46366e8: f941be80     	ldr	x0, [x20, #0x378]
 46366ec: f9400008     	ldr	x8, [x0]
 46366f0: f9405108     	ldr	x8, [x8, #0xa0]
 46366f4: 52800021     	mov	w1, #0x1                ; =1
 46366f8: d63f0100     	blr	x8
 46366fc: 39502288     	ldrb	w8, [x20, #0x408]
 4636700: 35001b88     	cbnz	w8, 0x4636a70 <_ChromeMain+0x46317d4>
 4636704: d2e7fe08     	mov	x8, #0x3ff0000000000000 ; =4607182418800017408
 4636708: f9021288     	str	x8, [x20, #0x420]
 463670c: 394f0288     	ldrb	w8, [x20, #0x3c0]
 4636710: 350017e8     	cbnz	w8, 0x4636a0c <_ChromeMain+0x4631770>
 4636714: aa1403e0     	mov	x0, x20
 4636718: 9400c3ca     	bl	0x4667640 <_ChromeMain+0x46623a4>
 463671c: b0053660     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 4636720: 91360000     	add	x0, x0, #0xd80
 4636724: f9400008     	ldr	x8, [x0]
 4636728: d63f0100     	blr	x8
 463672c: f9400008     	ldr	x8, [x0]
 4636730: b4001d48     	cbz	x8, 0x4636ad8 <_ChromeMain+0x463183c>
 4636734: f9400114     	ldr	x20, [x8]
 4636738: b4001d14     	cbz	x20, 0x4636ad8 <_ChromeMain+0x463183c>
 463673c: b004c4a0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4636740: 912f1000     	add	x0, x0, #0xbc4
 4636744: b004c4a1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4636748: 912c7821     	add	x1, x1, #0xb1e
 463674c: 9101c3e8     	add	x8, sp, #0x70
 4636750: 528427c2     	mov	w2, #0x213e             ; =8510
 4636754: 96e8694b     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4636758: f94a0675     	ldr	x21, [x19, #0x1408]
 463675c: b40000d5     	cbz	x21, 0x4636774 <_ChromeMain+0x46314d8>
 4636760: 52800028     	mov	w8, #0x1                ; =1
 4636764: b82802a8     	ldadd	w8, w8, [x21]
 4636768: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463676c: 6b09011f     	cmp	w8, w9
 4636770: 54001ba0     	b.eq	0x4636ae4 <_ChromeMain+0x4631848>
 4636774: f94a0a76     	ldr	x22, [x19, #0x1410]
 4636778: 52800800     	mov	w0, #0x40               ; =64
 463677c: 96e762fb     	bl	0xf368 <_ChromeMain+0xa0cc>
 4636780: aa0003e2     	mov	x2, x0
 4636784: 52800028     	mov	w8, #0x1                ; =1
 4636788: b9000008     	str	w8, [x0]
 463678c: b0ffcc28     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 4636790: 911c0108     	add	x8, x8, #0x700
 4636794: 90ffcb49     	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 4636798: 91110129     	add	x9, x9, #0x440
 463679c: a900a408     	stp	x8, x9, [x0, #0x8]
 46367a0: 90ffd1a8     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 46367a4: 910a0108     	add	x8, x8, #0x280
 46367a8: 100439a9     	adr	x9, 0x463eedc <_ChromeMain+0x4639c40>
 46367ac: d503201f     	nop
 46367b0: a901a408     	stp	x8, x9, [x0, #0x18]
 46367b4: a902d41f     	stp	xzr, x21, [x0, #0x28]
 46367b8: f9001c16     	str	x22, [x0, #0x38]
 46367bc: f9400288     	ldr	x8, [x20]
 46367c0: f9400108     	ldr	x8, [x8]
 46367c4: 9101c3e1     	add	x1, sp, #0x70
 46367c8: aa1403e0     	mov	x0, x20
 46367cc: d2800003     	mov	x3, #0x0                ; =0
 46367d0: d63f0100     	blr	x8
 46367d4: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 46367d8: 36ffc048     	tbz	w8, #0x1f, 0x4635fe0 <_ChromeMain+0x4630d44>
 46367dc: f9402fe0     	ldr	x0, [sp, #0x58]
 46367e0: f94037e8     	ldr	x8, [sp, #0x68]
 46367e4: 17fffdfd     	b	0x4635fd8 <_ChromeMain+0x4630d3c>
 46367e8: 91400668     	add	x8, x19, #0x1, lsl #12  ; =0x1000
 46367ec: 39407108     	ldrb	w8, [x8, #0x1c]
 46367f0: 34000068     	cbz	w8, 0x46367fc <_ChromeMain+0x4631560>
 46367f4: 91400668     	add	x8, x19, #0x1, lsl #12  ; =0x1000
 46367f8: 3900711f     	strb	wzr, [x8, #0x1c]
 46367fc: 91400668     	add	x8, x19, #0x1, lsl #12  ; =0x1000
 4636800: 3940b108     	ldrb	w8, [x8, #0x2c]
 4636804: 34000188     	cbz	w8, 0x4636834 <_ChromeMain+0x4631598>
 4636808: b9502a68     	ldr	w8, [x19, #0x1028]
 463680c: 6b1b011f     	cmp	w8, w27
 4636810: 54000121     	b.ne	0x4636834 <_ChromeMain+0x4631598>
 4636814: 52820608     	mov	w8, #0x1030             ; =4144
 4636818: 8b080260     	add	x0, x19, x8
 463681c: 9703dfbf     	bl	0x72e718 <_ChromeMain+0x72947c>
 4636820: 91400668     	add	x8, x19, #0x1, lsl #12  ; =0x1000
 4636824: 3940b108     	ldrb	w8, [x8, #0x2c]
 4636828: 34000068     	cbz	w8, 0x4636834 <_ChromeMain+0x4631598>
 463682c: 91400668     	add	x8, x19, #0x1, lsl #12  ; =0x1000
 4636830: 3900b11f     	strb	wzr, [x8, #0x2c]
 4636834: f9484a68     	ldr	x8, [x19, #0x1090]
 4636838: f9484e69     	ldr	x9, [x19, #0x1098]
 463683c: d37ef52a     	lsl	x10, x9, #2
 4636840: b5ffe0ea     	cbnz	x10, 0x463645c <_ChromeMain+0x46311c0>
 4636844: aa0803e1     	mov	x1, x8
 4636848: 8b090908     	add	x8, x8, x9, lsl #2
 463684c: aa0103e2     	mov	x2, x1
 4636850: eb08003f     	cmp	x1, x8
 4636854: 540000c0     	b.eq	0x463686c <_ChromeMain+0x46315d0>
 4636858: b9400028     	ldr	w8, [x1]
 463685c: 6b08037f     	cmp	w27, w8
 4636860: 52800088     	mov	w8, #0x4                ; =4
 4636864: 9a88b3e8     	csel	x8, xzr, x8, lt
 4636868: 8b080022     	add	x2, x1, x8
 463686c: 52821208     	mov	w8, #0x1090             ; =4240
 4636870: 8b080260     	add	x0, x19, x8
 4636874: 94198c2f     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 4636878: f9480268     	ldr	x8, [x19, #0x1000]
 463687c: f9480669     	ldr	x9, [x19, #0x1008]
 4636880: d37be92a     	lsl	x10, x9, #5
 4636884: b5ffe04a     	cbnz	x10, 0x463648c <_ChromeMain+0x46311f0>
 4636888: aa0803e1     	mov	x1, x8
 463688c: 8b091508     	add	x8, x8, x9, lsl #5
 4636890: eb08003f     	cmp	x1, x8
 4636894: 54000280     	b.eq	0x46368e4 <_ChromeMain+0x4631648>
 4636898: b9400028     	ldr	w8, [x1]
 463689c: 6b08037f     	cmp	w27, w8
 46368a0: 5400022b     	b.lt	0x46368e4 <_ChromeMain+0x4631648>
 46368a4: 91002020     	add	x0, x1, #0x8
 46368a8: 9101c3e8     	add	x8, sp, #0x70
 46368ac: eb08001f     	cmp	x0, x8
 46368b0: 54000220     	b.eq	0x46368f4 <_ChromeMain+0x4631658>
 46368b4: 39c07c28     	ldrsb	w8, [x1, #0x1f]
 46368b8: 37f80e08     	tbnz	w8, #0x1f, 0x4636a78 <_ChromeMain+0x46317dc>
 46368bc: 37f800da     	tbnz	w26, #0x1f, 0x46368d4 <_ChromeMain+0x4631638>
 46368c0: 3dc01fe0     	ldr	q0, [sp, #0x70]
 46368c4: f94043e8     	ldr	x8, [sp, #0x80]
 46368c8: f9000808     	str	x8, [x0, #0x10]
 46368cc: 3d800000     	str	q0, [x0]
 46368d0: 14000009     	b	0x46368f4 <_ChromeMain+0x4631658>
 46368d4: aa1603e1     	mov	x1, x22
 46368d8: aa1503e2     	mov	x2, x21
 46368dc: 96f9c876     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46368e0: 14000005     	b	0x46368f4 <_ChromeMain+0x4631658>
 46368e4: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 46368e8: 910153e2     	add	x2, sp, #0x54
 46368ec: 9101c3e3     	add	x3, sp, #0x70
 46368f0: 94012e22     	bl	0x4682178 <_ChromeMain+0x467cedc>
 46368f4: 394223e8     	ldrb	w8, [sp, #0x88]
 46368f8: 360793e8     	tbz	w8, #0x0, 0x4635b74 <_ChromeMain+0x46308d8>
 46368fc: f947e668     	ldr	x8, [x19, #0xfc8]
 4636900: f947ea69     	ldr	x9, [x19, #0xfd0]
 4636904: d37be92a     	lsl	x10, x9, #5
 4636908: b5ffddaa     	cbnz	x10, 0x46364bc <_ChromeMain+0x4631220>
 463690c: aa0803e1     	mov	x1, x8
 4636910: 8b091508     	add	x8, x8, x9, lsl #5
 4636914: eb08003f     	cmp	x1, x8
 4636918: 54000280     	b.eq	0x4636968 <_ChromeMain+0x46316cc>
 463691c: b9400028     	ldr	w8, [x1]
 4636920: 6b08037f     	cmp	w27, w8
 4636924: 5400022b     	b.lt	0x4636968 <_ChromeMain+0x46316cc>
 4636928: 91002020     	add	x0, x1, #0x8
 463692c: 9101c3e8     	add	x8, sp, #0x70
 4636930: eb08001f     	cmp	x0, x8
 4636934: 54000220     	b.eq	0x4636978 <_ChromeMain+0x46316dc>
 4636938: 39c07c29     	ldrsb	w9, [x1, #0x1f]
 463693c: 39421fe8     	ldrb	w8, [sp, #0x87]
 4636940: 37f80a49     	tbnz	w9, #0x1f, 0x4636a88 <_ChromeMain+0x46317ec>
 4636944: 373800c8     	tbnz	w8, #0x7, 0x463695c <_ChromeMain+0x46316c0>
 4636948: 3dc01fe0     	ldr	q0, [sp, #0x70]
 463694c: f94043e8     	ldr	x8, [sp, #0x80]
 4636950: f9000808     	str	x8, [x0, #0x10]
 4636954: 3d800000     	str	q0, [x0]
 4636958: 14000008     	b	0x4636978 <_ChromeMain+0x46316dc>
 463695c: a9470be1     	ldp	x1, x2, [sp, #0x70]
 4636960: 96f9c855     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4636964: 14000005     	b	0x4636978 <_ChromeMain+0x46316dc>
 4636968: 913f2260     	add	x0, x19, #0xfc8
 463696c: 910153e2     	add	x2, sp, #0x54
 4636970: 9101c3e3     	add	x3, sp, #0x70
 4636974: 94012e01     	bl	0x4682178 <_ChromeMain+0x467cedc>
 4636978: f0052bd6     	adrp	x22, 0xebb1000 <dyld_stub_binder+0xebb1000>
 463697c: f9468ec8     	ldr	x8, [x22, #0xd18]
 4636980: d63f0100     	blr	x8
 4636984: f9002fe0     	str	x0, [sp, #0x58]
 4636988: f9485668     	ldr	x8, [x19, #0x10a8]
 463698c: f9485a69     	ldr	x9, [x19, #0x10b0]
 4636990: d37ced2a     	lsl	x10, x9, #4
 4636994: b5ffdaca     	cbnz	x10, 0x46364ec <_ChromeMain+0x4631250>
 4636998: aa0803e1     	mov	x1, x8
 463699c: 8b091108     	add	x8, x8, x9, lsl #4
 46369a0: eb08003f     	cmp	x1, x8
 46369a4: 540000c0     	b.eq	0x46369bc <_ChromeMain+0x4631720>
 46369a8: b9400028     	ldr	w8, [x1]
 46369ac: 6b08037f     	cmp	w27, w8
 46369b0: 5400006b     	b.lt	0x46369bc <_ChromeMain+0x4631720>
 46369b4: f9000420     	str	x0, [x1, #0x8]
 46369b8: 14000006     	b	0x46369d0 <_ChromeMain+0x4631734>
 46369bc: 52821508     	mov	w8, #0x10a8             ; =4264
 46369c0: 8b080260     	add	x0, x19, x8
 46369c4: 910153e2     	add	x2, sp, #0x54
 46369c8: 910163e3     	add	x3, sp, #0x58
 46369cc: 94012ecf     	bl	0x4682508 <_ChromeMain+0x467d26c>
 46369d0: f9423675     	ldr	x21, [x19, #0x468]
 46369d4: f9468ec8     	ldr	x8, [x22, #0xd18]
 46369d8: d63f0100     	blr	x8
 46369dc: aa0003e3     	mov	x3, x0
 46369e0: aa1503e0     	mov	x0, x21
 46369e4: aa1403e1     	mov	x1, x20
 46369e8: 528000c2     	mov	w2, #0x6                ; =6
 46369ec: 94dc643f     	bl	0x7d4fae8 <_ChromeMain+0x7d4a84c>
 46369f0: aa1303e0     	mov	x0, x19
 46369f4: 97ffd633     	bl	0x462c2c0 <_ChromeMain+0x4627024>
 46369f8: aa1303e0     	mov	x0, x19
 46369fc: 97ffd5e3     	bl	0x462c188 <_ChromeMain+0x4626eec>
 4636a00: 394223e8     	ldrb	w8, [sp, #0x88]
 4636a04: 17fffe84     	b	0x4636414 <_ChromeMain+0x4631178>
 4636a08: 94e73656     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4636a0c: 390f029f     	strb	wzr, [x20, #0x3c0]
 4636a10: f941ea80     	ldr	x0, [x20, #0x3d0]
 4636a14: 910ec281     	add	x1, x20, #0x3b0
 4636a18: 976b4b3a     	bl	0x2109700 <_ChromeMain+0x2104464>
 4636a1c: f941da88     	ldr	x8, [x20, #0x3b0]
 4636a20: f9401d08     	ldr	x8, [x8, #0x38]
 4636a24: 910ec280     	add	x0, x20, #0x3b0
 4636a28: d63f0100     	blr	x8
 4636a2c: f941e688     	ldr	x8, [x20, #0x3c8]
 4636a30: b4ffe728     	cbz	x8, 0x4636714 <_ChromeMain+0x4631478>
 4636a34: f941da88     	ldr	x8, [x20, #0x3b0]
 4636a38: f9402108     	ldr	x8, [x8, #0x40]
 4636a3c: 910ec280     	add	x0, x20, #0x3b0
 4636a40: d63f0100     	blr	x8
 4636a44: f941e688     	ldr	x8, [x20, #0x3c8]
 4636a48: f9400109     	ldr	x9, [x8]
 4636a4c: 7100001f     	cmp	w0, #0x0
 4636a50: 5280020a     	mov	w10, #0x10              ; =16
 4636a54: 5280040b     	mov	w11, #0x20              ; =32
 4636a58: 9a8a116a     	csel	x10, x11, x10, ne
 4636a5c: f86a6929     	ldr	x9, [x9, x10]
 4636a60: 910ec281     	add	x1, x20, #0x3b0
 4636a64: aa0803e0     	mov	x0, x8
 4636a68: d63f0120     	blr	x9
 4636a6c: 17ffff2a     	b	0x4636714 <_ChromeMain+0x4631478>
 4636a70: 3910229f     	strb	wzr, [x20, #0x408]
 4636a74: 17ffff24     	b	0x4636704 <_ChromeMain+0x4631468>
 4636a78: aa1803e1     	mov	x1, x24
 4636a7c: aa1703e2     	mov	x2, x23
 4636a80: 96f9c860     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4636a84: 17ffff9c     	b	0x46368f4 <_ChromeMain+0x4631658>
 4636a88: 13001d09     	sxtb	w9, w8
 4636a8c: 7100013f     	cmp	w9, #0x0
 4636a90: 9101c3e9     	add	x9, sp, #0x70
 4636a94: a9472fea     	ldp	x10, x11, [sp, #0x70]
 4636a98: 9a894141     	csel	x1, x10, x9, mi
 4636a9c: 9a884162     	csel	x2, x11, x8, mi
 4636aa0: 96f9c858     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4636aa4: 17ffffb5     	b	0x4636978 <_ChromeMain+0x46316dc>
 4636aa8: d4200000     	brk	#0
 4636aac: d4400000     	hlt	#0
 4636ab0: d4200020     	brk	#0x1
 4636ab4: d4200000     	brk	#0
 4636ab8: d4400000     	hlt	#0
 4636abc: d4200020     	brk	#0x1
