
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 36a614c: aa1503e0     	mov	x0, x21
 36a6150: aa1603e1     	mov	x1, x22
 36a6154: aa1303e2     	mov	x2, x19
 36a6158: aa1803e3     	mov	x3, x24
 36a615c: 942d3689     	bl	0x41f3b80 <_ChromeMain+0x41ee8e4>
 36a6160: 3945a6a8     	ldrb	w8, [x21, #0x169]
 36a6164: 3500c3e8     	cbnz	w8, 0x36a79e0 <_ChromeMain+0x36a2744>
 36a6168: f940ce82     	ldr	x2, [x20, #0x198]
 36a616c: aa1403e0     	mov	x0, x20
 36a6170: aa1503e1     	mov	x1, x21
 36a6174: 97434ca2     	bl	0x7793fc <_ChromeMain+0x774160>
 36a6178: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 36a617c: f9404749     	ldr	x9, [x26, #0x88]
 36a6180: eb09011f     	cmp	x8, x9
 36a6184: 54000061     	b.ne	0x36a6190 <_ChromeMain+0x36a0ef4>
 36a6188: aa1503e0     	mov	x0, x21
 36a618c: 9725b85c     	bl	0x142fc <_ChromeMain+0xf060>
 36a6190: f942da60     	ldr	x0, [x19, #0x5b0]
 36a6194: 925e7408     	and	x8, x0, #0xfffffffc00000000
 36a6198: f9404749     	ldr	x9, [x26, #0x88]
 36a619c: eb09011f     	cmp	x8, x9
 36a61a0: 54000041     	b.ne	0x36a61a8 <_ChromeMain+0x36a0f0c>
 36a61a4: 9725f226     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 36a61a8: f902da75     	str	x21, [x19, #0x5b0]
