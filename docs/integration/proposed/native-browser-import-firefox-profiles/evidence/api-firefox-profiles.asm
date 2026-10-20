
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4276264: f94012e1     	ldr	x1, [x23, #0x20]
 4276268: b4000981     	cbz	x1, 0x4276398 <_ChromeMain+0x42710fc>
 427626c: f9400000     	ldr	x0, [x0]
 4276270: d103c3a8     	sub	x8, x29, #0xf0
 4276274: 9734b2a5     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4276278: 3cd103a0     	ldur	q0, [x29, #-0xf0]
 427627c: 3c9803a0     	stur	q0, [x29, #-0x80]
 4276280: f85203a8     	ldur	x8, [x29, #-0xe0]
 4276284: f81903a8     	stur	x8, [x29, #-0x70]
 4276288: a9317fbf     	stp	xzr, xzr, [x29, #-0xf0]
 427628c: f81203bf     	stur	xzr, [x29, #-0xe0]
 4276290: 381983b3     	sturb	w19, [x29, #-0x68]
 4276294: d10343a0     	sub	x0, x29, #0xd0
 4276298: d10203a3     	sub	x3, x29, #0x80
 427629c: aa1503e1     	mov	x1, x21
 42762a0: 52800082     	mov	w2, #0x4                ; =4
 42762a4: 970b1307     	bl	0x53aec0 <_ChromeMain+0x535c24>
 42762a8: 385983a8     	ldurb	w8, [x29, #-0x68]
 42762ac: f103fd1f     	cmp	x8, #0xff
 42762b0: 540000a0     	b.eq	0x42762c4 <_ChromeMain+0x4271028>
 42762b4: f8687b68     	ldr	x8, [x27, x8, lsl #3]
 42762b8: d10207a0     	sub	x0, x29, #0x81
 42762bc: d10203a1     	sub	x1, x29, #0x80
 42762c0: d63f0100     	blr	x8
 42762c4: 38d273a8     	ldursb	w8, [x29, #-0xd9]
 42762c8: 36f800a8     	tbz	w8, #0x1f, 0x42762dc <_ChromeMain+0x4271040>
 42762cc: f85103a0     	ldur	x0, [x29, #-0xf0]
 42762d0: f85203a8     	ldur	x8, [x29, #-0xe0]
 42762d4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42762d8: 96f64af8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42762dc: 910263e0     	add	x0, sp, #0x98
 42762e0: d10343a1     	sub	x1, x29, #0xd0
 42762e4: 971e9fb0     	bl	0xa1e1a4 <_ChromeMain+0xa18f08>
 42762e8: d10343a0     	sub	x0, x29, #0xd0
 42762ec: 971ba065     	bl	0x95e480 <_ChromeMain+0x9591e4>
 42762f0: 9100c2f7     	add	x23, x23, #0x30
 42762f4: f100c2d6     	subs	x22, x22, #0x30
 42762f8: 54000a00     	b.eq	0x4276438 <_ChromeMain+0x427119c>
 42762fc: aa1703e0     	mov	x0, x23
 4276300: 977ab5b0     	bl	0x21239c0 <_ChromeMain+0x211e724>
 4276304: 34ffff60     	cbz	w0, 0x42762f0 <_ChromeMain+0x4271054>
 4276308: a9337fbf     	stp	xzr, xzr, [x29, #-0xd0]
 427630c: f81403bf     	stur	xzr, [x29, #-0xc0]
 4276310: 39c05ee8     	ldrsb	w8, [x23, #0x17]
 4276314: 36f805a8     	tbz	w8, #0x1f, 0x42763c8 <_ChromeMain+0x427112c>
 4276318: a9400ae1     	ldp	x1, x2, [x23]
 427631c: d103c3a0     	sub	x0, x29, #0xf0
 4276320: 96f687be     	bl	0x18218 <_ChromeMain+0x12f7c>
 4276324: 3cd103a0     	ldur	q0, [x29, #-0xf0]
 4276328: 3c9803a0     	stur	q0, [x29, #-0x80]
 427632c: f85203a8     	ldur	x8, [x29, #-0xe0]
 4276330: f81903a8     	stur	x8, [x29, #-0x70]
 4276334: a9317fbf     	stp	xzr, xzr, [x29, #-0xf0]
 4276338: f81203bf     	stur	xzr, [x29, #-0xe0]
 427633c: 381983b3     	sturb	w19, [x29, #-0x68]
 4276340: d10343a0     	sub	x0, x29, #0xd0
 4276344: d10203a3     	sub	x3, x29, #0x80
 4276348: aa1403e1     	mov	x1, x20
 427634c: 52800042     	mov	w2, #0x2                ; =2
 4276350: 970b12dc     	bl	0x53aec0 <_ChromeMain+0x535c24>
 4276354: 385983a8     	ldurb	w8, [x29, #-0x68]
 4276358: f103fd1f     	cmp	x8, #0xff
 427635c: 540000a0     	b.eq	0x4276370 <_ChromeMain+0x42710d4>
 4276360: f8687b68     	ldr	x8, [x27, x8, lsl #3]
 4276364: d10207a0     	sub	x0, x29, #0x81
 4276368: d10203a1     	sub	x1, x29, #0x80
 427636c: d63f0100     	blr	x8
 4276370: 38d273a8     	ldursb	w8, [x29, #-0xd9]
 4276374: 36f800a8     	tbz	w8, #0x1f, 0x4276388 <_ChromeMain+0x42710ec>
 4276378: f85103a0     	ldur	x0, [x29, #-0xf0]
 427637c: f85203a8     	ldur	x8, [x29, #-0xe0]
 4276380: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4276384: 96f64acd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276388: 910062e0     	add	x0, x23, #0x18
 427638c: 3980bee1     	ldrsb	x1, [x23, #0x2f]
 4276390: b7fff6a1     	tbnz	x1, #0x3f, 0x4276264 <_ChromeMain+0x4270fc8>
 4276394: 35fff6e1     	cbnz	w1, 0x4276270 <_ChromeMain+0x4270fd4>
 4276398: 528000e8     	mov	w8, #0x7                ; =7
 427639c: 381273a8     	sturb	w8, [x29, #-0xd9]
 42763a0: b94027e8     	ldr	w8, [sp, #0x24]
 42763a4: 35ffc6e8     	cbnz	w8, 0x4275c80 <_ChromeMain+0x42709e4>
 42763a8: 528eac28     	mov	w8, #0x7561             ; =30049
 42763ac: 72ae8d88     	movk	w8, #0x746c, lsl #16
 42763b0: b8033388     	stur	w8, [x28, #0x33]
 42763b4: 528ca888     	mov	w8, #0x6544             ; =25924
 42763b8: 72ac2cc8     	movk	w8, #0x6166, lsl #16
 42763bc: b81103a8     	stur	w8, [x29, #-0xf0]
 42763c0: 381173bf     	sturb	wzr, [x29, #-0xe9]
 42763c4: 17ffffad     	b	0x4276278 <_ChromeMain+0x4270fdc>
 42763c8: 3dc002e0     	ldr	q0, [x23]
 42763cc: f9400ae8     	ldr	x8, [x23, #0x10]
 42763d0: f81203a8     	stur	x8, [x29, #-0xe0]
 42763d4: 3c9103a0     	stur	q0, [x29, #-0xf0]
 42763d8: 17ffffd3     	b	0x4276324 <_ChromeMain+0x4271088>
 42763dc: 37f800d6     	tbnz	w22, #0x1f, 0x42763f4 <_ChromeMain+0x4271158>
 42763e0: 3dc04be0     	ldr	q0, [sp, #0x120]
 42763e4: 3d802fe0     	str	q0, [sp, #0xb0]
 42763e8: f9409be8     	ldr	x8, [sp, #0x130]
 42763ec: f90063e8     	str	x8, [sp, #0xc0]
 42763f0: 14000005     	b	0x4276404 <_ChromeMain+0x4271168>
 42763f4: 9102c3e0     	add	x0, sp, #0xb0
 42763f8: aa1703e1     	mov	x1, x23
 42763fc: aa1803e2     	mov	x2, x24
 4276400: 96f68786     	bl	0x18218 <_ChromeMain+0x12f7c>
 4276404: a909ffff     	stp	xzr, xzr, [sp, #0x98]
 4276408: f90057ff     	str	xzr, [sp, #0xa8]
 427640c: a934ffbf     	stp	xzr, xzr, [x29, #-0xb8]
 4276410: f81583bf     	stur	xzr, [x29, #-0xa8]
 4276414: d10283a8     	sub	x8, x29, #0xa0
 4276418: d102e3a0     	sub	x0, x29, #0xb8
 427641c: 94bdea2b     	bl	0x71f0cc8 <_ChromeMain+0x71eba2c>
 4276420: f85683a8     	ldur	x8, [x29, #-0x98]
 4276424: 8b080508     	add	x8, x8, x8, lsl #1
 4276428: d37ced16     	lsl	x22, x8, #4
 427642c: b4000076     	cbz	x22, 0x4276438 <_ChromeMain+0x427119c>
 4276430: f85603b7     	ldur	x23, [x29, #-0xa0]
 4276434: 17ffffb2     	b	0x42762fc <_ChromeMain+0x4271060>
 4276438: d10283a8     	sub	x8, x29, #0xa0
 427643c: f81803a8     	stur	x8, [x29, #-0x80]
 4276440: d10203a0     	sub	x0, x29, #0x80
 4276444: 94d6ac18     	bl	0x78214a4 <_ChromeMain+0x781c208>
 4276448: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 427644c: 36f800a8     	tbz	w8, #0x1f, 0x4276460 <_ChromeMain+0x42711c4>
 4276450: f85483a0     	ldur	x0, [x29, #-0xb8]
 4276454: f85583a8     	ldur	x8, [x29, #-0xa8]
 4276458: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427645c: 96f64a97     	bl	0x8eb8 <_ChromeMain+0x3c1c>
