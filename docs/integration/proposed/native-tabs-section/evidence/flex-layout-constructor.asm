
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2a105d0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 2a105d4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 2a105d8: 910043fd     	add	x29, sp, #0x10
 2a105dc: aa0003f3     	mov	x19, x0
 2a105e0: 97a9d440     	bl	0x14856e0 <_ChromeMain+0x1480444>
 2a105e4: d005ca08     	adrp	x8, 0xe352000 <dyld_stub_binder+0xe352000>
 2a105e8: 913d8108     	add	x8, x8, #0xf60
 2a105ec: f9000008     	str	x8, [x0]
 2a105f0: 91036108     	add	x8, x8, #0xd8
 2a105f4: f9001408     	str	x8, [x0, #0x28]
 2a105f8: b900f01f     	str	wzr, [x0, #0xf0]
 2a105fc: 3903d01f     	strb	wzr, [x0, #0xf4]
 2a10600: b901141f     	str	wzr, [x0, #0x114]
 2a10604: a9107c1f     	stp	xzr, xzr, [x0, #0x100]
 2a10608: f9007c1f     	str	xzr, [x0, #0xf8]
 2a1060c: 7902201f     	strh	wzr, [x0, #0x110]
 2a10610: 9104a008     	add	x8, x0, #0x128
 2a10614: a912fc1f     	stp	xzr, xzr, [x0, #0x128]
 2a10618: d005ca09     	adrp	x9, 0xe352000 <dyld_stub_binder+0xe352000>
 2a1061c: 913cc129     	add	x9, x9, #0xf30
 2a10620: a911a009     	stp	x9, x8, [x0, #0x118]
 2a10624: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2a10628: d0060d09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2a1062c: f9404529     	ldr	x9, [x9, #0x88]
 2a10630: eb09011f     	cmp	x8, x9
 2a10634: 54000061     	b.ne	0x2a10640 <_ChromeMain+0x2a0b3a4>
 2a10638: aa1303e0     	mov	x0, x19
 2a1063c: 97580f30     	bl	0x142fc <_ChromeMain+0xf060>
 2a10640: f9009e73     	str	x19, [x19, #0x138]
 2a10644: 91046260     	add	x0, x19, #0x118
 2a10648: 94000005     	bl	0x2a1065c <_ChromeMain+0x2a0b3c0>
 2a1064c: aa1303e0     	mov	x0, x19
 2a10650: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 2a10654: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 2a10658: d65f03c0     	ret
 2a1065c: d100c3ff     	sub	sp, sp, #0x30
 2a10660: a9014ff4     	stp	x20, x19, [sp, #0x10]
 2a10664: a9027bfd     	stp	x29, x30, [sp, #0x20]
 2a10668: 910083fd     	add	x29, sp, #0x20
 2a1066c: aa0003f3     	mov	x19, x0
 2a10670: b4000280     	cbz	x0, 0x2a106c0 <_ChromeMain+0x2a0b424>
 2a10674: aa1303e9     	mov	x9, x19
 2a10678: f8410d28     	ldr	x8, [x9, #0x10]!
 2a1067c: b4000228     	cbz	x8, 0x2a106c0 <_ChromeMain+0x2a0b424>
 2a10680: b005ffaa     	adrp	x10, 0xea05000 <dyld_stub_binder+0xea05000>
 2a10684: 9115a14a     	add	x10, x10, #0x568
 2a10688: f940110b     	ldr	x11, [x8, #0x20]
 2a1068c: eb0a017f     	cmp	x11, x10
 2a10690: 540000a8     	b.hi	0x2a106a4 <_ChromeMain+0x2a0b408>
 2a10694: 540000e2     	b.hs	0x2a106b0 <_ChromeMain+0x2a0b414>
 2a10698: f9400508     	ldr	x8, [x8, #0x8]
 2a1069c: b5ffff68     	cbnz	x8, 0x2a10688 <_ChromeMain+0x2a0b3ec>
 2a106a0: 14000008     	b	0x2a106c0 <_ChromeMain+0x2a0b424>
 2a106a4: f9400108     	ldr	x8, [x8]
 2a106a8: b5ffff08     	cbnz	x8, 0x2a10688 <_ChromeMain+0x2a0b3ec>
 2a106ac: 14000005     	b	0x2a106c0 <_ChromeMain+0x2a0b424>
 2a106b0: eb09011f     	cmp	x8, x9
 2a106b4: 54000060     	b.eq	0x2a106c0 <_ChromeMain+0x2a0b424>
 2a106b8: f9401908     	ldr	x8, [x8, #0x30]
 2a106bc: b5000308     	cbnz	x8, 0x2a1071c <_ChromeMain+0x2a0b480>
 2a106c0: 52800080     	mov	w0, #0x4                ; =4
 2a106c4: 9757fb29     	bl	0xf368 <_ChromeMain+0xa0cc>
 2a106c8: aa0003e4     	mov	x4, x0
 2a106cc: 52800068     	mov	w8, #0x3                ; =3
 2a106d0: b9000008     	str	w8, [x0]
 2a106d4: b005ffa1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 2a106d8: 9115a021     	add	x1, x1, #0x568
 2a106dc: b00599a2     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 2a106e0: 9126f842     	add	x2, x2, #0x9be
 2a106e4: 90008183     	adrp	x3, 0x3a40000 <_ChromeMain+0x3a3ad64>
 2a106e8: 912ed063     	add	x3, x3, #0xbb4
 2a106ec: aa1303e0     	mov	x0, x19
 2a106f0: d2800005     	mov	x5, #0x0                ; =0
 2a106f4: 978566aa     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 2a106f8: b50000a0     	cbnz	x0, 0x2a1070c <_ChromeMain+0x2a0b470>
 2a106fc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 2a10700: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 2a10704: 9100c3ff     	add	sp, sp, #0x30
 2a10708: d65f03c0     	ret
 2a1070c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 2a10710: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 2a10714: 9100c3ff     	add	sp, sp, #0x30
 2a10718: 1440c127     	b	0x3a40bb4 <_ChromeMain+0x3a3b918>
 2a1071c: b9400109     	ldr	w9, [x8]
 2a10720: 5280006a     	mov	w10, #0x3               ; =3
 2a10724: b900010a     	str	w10, [x8]
