Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4653178: d10143ff     	sub	sp, sp, #0x50
 465317c: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4653180: a90257f6     	stp	x22, x21, [sp, #0x20]
 4653184: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4653188: a9047bfd     	stp	x29, x30, [sp, #0x40]
 465318c: 910103fd     	add	x29, sp, #0x40
 4653190: aa0103f4     	mov	x20, x1
 4653194: aa0003f3     	mov	x19, x0
 4653198: 391d601f     	strb	wzr, [x0, #0x758]
 465319c: f943a808     	ldr	x8, [x0, #0x750]
 46531a0: f9400829     	ldr	x9, [x1, #0x10]
 46531a4: eb09011f     	cmp	x8, x9
 46531a8: 540000e1     	b.ne	0x46531c4 <_ChromeMain+0x464df28>
 46531ac: f943a276     	ldr	x22, [x19, #0x740]
 46531b0: 911d2275     	add	x21, x19, #0x748
 46531b4: eb1502df     	cmp	x22, x21
 46531b8: 540002c0     	b.eq	0x4653210 <_ChromeMain+0x464df74>
 46531bc: f9400297     	ldr	x23, [x20]
 46531c0: 14000031     	b	0x4653284 <_ChromeMain+0x464dfe8>
 46531c4: 911d0276     	add	x22, x19, #0x740
 46531c8: 911d2275     	add	x21, x19, #0x748
 46531cc: f943a661     	ldr	x1, [x19, #0x748]
 46531d0: f90007f6     	str	x22, [sp, #0x8]
 46531d4: 910023e0     	add	x0, sp, #0x8
 46531d8: 94b059c0     	bl	0x72698d8 <_ChromeMain+0x726463c>
 46531dc: f9400288     	ldr	x8, [x20]
 46531e0: f903a268     	str	x8, [x19, #0x740]
 46531e4: aa1403e8     	mov	x8, x20
 46531e8: f8408d09     	ldr	x9, [x8, #0x8]!
 46531ec: f903a669     	str	x9, [x19, #0x748]
 46531f0: f940050a     	ldr	x10, [x8, #0x8]
 46531f4: f903aa6a     	str	x10, [x19, #0x750]
 46531f8: b400022a     	cbz	x10, 0x465323c <_ChromeMain+0x464dfa0>
 46531fc: f9000935     	str	x21, [x9, #0x10]
 4653200: f9000288     	str	x8, [x20]
 4653204: a9007d1f     	stp	xzr, xzr, [x8]
 4653208: aa1303e0     	mov	x0, x19
 465320c: 97ff791d     	bl	0x4631680 <_ChromeMain+0x462c3e4>
 4653210: 395d6668     	ldrb	w8, [x19, #0x759]
 4653214: 34000088     	cbz	w8, 0x4653224 <_ChromeMain+0x464df88>
 4653218: 391d667f     	strb	wzr, [x19, #0x759]
 465321c: aa1303e0     	mov	x0, x19
 4653220: 97ff7e1b     	bl	0x4632a8c <_ChromeMain+0x462d7f0>
 4653224: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4653228: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 465322c: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4653230: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4653234: 910143ff     	add	sp, sp, #0x50
 4653238: d65f03c0     	ret
 465323c: f90002d5     	str	x21, [x22]
 4653240: 17fffff2     	b	0x4653208 <_ChromeMain+0x464df6c>
 4653244: aa1703e8     	mov	x8, x23
 4653248: f9400af7     	ldr	x23, [x23, #0x10]
 465324c: f94002e9     	ldr	x9, [x23]
 4653250: eb09011f     	cmp	x8, x9
 4653254: 54ffff81     	b.ne	0x4653244 <_ChromeMain+0x464dfa8>
 4653258: 14000009     	b	0x465327c <_ChromeMain+0x464dfe0>
 465325c: aa0803f6     	mov	x22, x8
 4653260: f9400108     	ldr	x8, [x8]
 4653264: b5ffffc8     	cbnz	x8, 0x465325c <_ChromeMain+0x464dfc0>
 4653268: f94006e8     	ldr	x8, [x23, #0x8]
 465326c: b4fffec8     	cbz	x8, 0x4653244 <_ChromeMain+0x464dfa8>
 4653270: aa0803f7     	mov	x23, x8
 4653274: f9400108     	ldr	x8, [x8]
 4653278: b5ffffc8     	cbnz	x8, 0x4653270 <_ChromeMain+0x464dfd4>
 465327c: eb1502df     	cmp	x22, x21
 4653280: 54fffc80     	b.eq	0x4653210 <_ChromeMain+0x464df74>
 4653284: 910082c0     	add	x0, x22, #0x20
 4653288: 910082e1     	add	x1, x23, #0x20
 465328c: 9729e39e     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 4653290: 34fff9a0     	cbz	w0, 0x46531c4 <_ChromeMain+0x464df28>
 4653294: 39413ec9     	ldrb	w9, [x22, #0x4f]
 4653298: 13001d28     	sxtb	w8, w9
 465329c: f94022ca     	ldr	x10, [x22, #0x40]
 46532a0: 7100011f     	cmp	w8, #0x0
 46532a4: 9a894142     	csel	x2, x10, x9, mi
 46532a8: 39413eea     	ldrb	w10, [x23, #0x4f]
 46532ac: 13001d49     	sxtb	w9, w10
 46532b0: f94022eb     	ldr	x11, [x23, #0x40]
 46532b4: 7100013f     	cmp	w9, #0x0
 46532b8: 9a8a416a     	csel	x10, x11, x10, mi
 46532bc: eb0a005f     	cmp	x2, x10
 46532c0: 54fff821     	b.ne	0x46531c4 <_ChromeMain+0x464df28>
 46532c4: aa1603ea     	mov	x10, x22
 46532c8: f8438d4b     	ldr	x11, [x10, #0x38]!
 46532cc: 7100011f     	cmp	w8, #0x0
 46532d0: 9a8a4160     	csel	x0, x11, x10, mi
 46532d4: aa1703e8     	mov	x8, x23
 46532d8: f8438d0a     	ldr	x10, [x8, #0x38]!
 46532dc: 7100013f     	cmp	w9, #0x0
 46532e0: 9a884141     	csel	x1, x10, x8, mi
 46532e4: 94e6d95f     	bl	0x8009860 <_ChromeMain+0x80045c4>
