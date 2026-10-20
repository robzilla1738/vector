
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4617140: d10343ff     	sub	sp, sp, #0xd0
 4617144: 6d0923e9     	stp	d9, d8, [sp, #0x90]
 4617148: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 461714c: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 4617150: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 4617154: 910303fd     	add	x29, sp, #0xc0
 4617158: aa0003f3     	mov	x19, x0
 461715c: 0a040028     	and	w8, w1, w4
 4617160: 39511c09     	ldrb	w9, [x0, #0x447]
 4617164: 6b01013f     	cmp	w9, w1
 4617168: 54000141     	b.ne	0x4617190 <_ChromeMain+0x4611ef4>
 461716c: 39512269     	ldrb	w9, [x19, #0x448]
 4617170: 6b08013f     	cmp	w9, w8
 4617174: 540000e1     	b.ne	0x4617190 <_ChromeMain+0x4611ef4>
 4617178: b9444e69     	ldr	w9, [x19, #0x44c]
 461717c: 6b02013f     	cmp	w9, w2
 4617180: 54000081     	b.ne	0x4617190 <_ChromeMain+0x4611ef4>
 4617184: b9445269     	ldr	w9, [x19, #0x450]
 4617188: 6b03013f     	cmp	w9, w3
 461718c: 540005e0     	b.eq	0x4617248 <_ChromeMain+0x4611fac>
 4617190: 39111e61     	strb	w1, [x19, #0x447]
 4617194: 39112268     	strb	w8, [x19, #0x448]
 4617198: 7100003f     	cmp	w1, #0x0
 461719c: 1a9f1048     	csel	w8, w2, wzr, ne
 46171a0: b9044e68     	str	w8, [x19, #0x44c]
 46171a4: 1a9f1068     	csel	w8, w3, wzr, ne
 46171a8: b9045268     	str	w8, [x19, #0x450]
 46171ac: f9401275     	ldr	x21, [x19, #0x20]
 46171b0: b40003f5     	cbz	x21, 0x461722c <_ChromeMain+0x4611f90>
 46171b4: 6f00e400     	movi.2d	v0, #0000000000000000
 46171b8: f90043ff     	str	xzr, [sp, #0x80]
 46171bc: ad0303e0     	stp	q0, q0, [sp, #0x60]
 46171c0: ad0203e0     	stp	q0, q0, [sp, #0x40]
 46171c4: ad0103e0     	stp	q0, q0, [sp, #0x20]
 46171c8: ad0003e0     	stp	q0, q0, [sp]
 46171cc: 0f03f600     	fmov.2s	v0, #1.00000000
 46171d0: fd0007e0     	str	d0, [sp, #0x8]
 46171d4: 34000081     	cbz	w1, 0x46171e4 <_ChromeMain+0x4611f48>
 46171d8: 1e220040     	scvtf	s0, w2
 46171dc: 1e220061     	scvtf	s1, w3
 46171e0: 2d0207e0     	stp	s0, s1, [sp, #0x10]
 46171e4: f940b2a0     	ldr	x0, [x21, #0x160]
 46171e8: b40005a0     	cbz	x0, 0x461729c <_ChromeMain+0x4612000>
 46171ec: 910003e1     	mov	x1, sp
 46171f0: 97728025     	bl	0x22b7284 <_ChromeMain+0x22b1fe8>
 46171f4: f9401274     	ldr	x20, [x19, #0x20]
 46171f8: 39512668     	ldrb	w8, [x19, #0x449]
 46171fc: 6f00e408     	movi.2d	v8, #0000000000000000
 4617200: 370000e8     	tbnz	w8, #0x0, 0x461721c <_ChromeMain+0x4611f80>
 4617204: 39511e68     	ldrb	w8, [x19, #0x447]
 4617208: 7100011f     	cmp	w8, #0x0
 461720c: d004c9c8     	adrp	x8, 0xdf51000 <dyld_stub_binder+0xdf51000>
 4617210: bd432500     	ldr	s0, [x8, #0x324]
 4617214: 1e2e1001     	fmov	s1, #1.00000000
 4617218: 1e211c08     	fcsel	s8, s0, s1, ne
 461721c: f940b280     	ldr	x0, [x20, #0x160]
 4617220: b4000200     	cbz	x0, 0x4617260 <_ChromeMain+0x4611fc4>
 4617224: 4ea81d00     	mov.16b	v0, v8
 4617228: 97537644     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 461722c: aa1303e0     	mov	x0, x19
 4617230: 94002d5c     	bl	0x46227a0 <_ChromeMain+0x461d504>
 4617234: f940c660     	ldr	x0, [x19, #0x188]
 4617238: b4000040     	cbz	x0, 0x4617240 <_ChromeMain+0x4611fa4>
 461723c: 96fe27d0     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4617240: aa1303e0     	mov	x0, x19
 4617244: 96fe27ce     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4617248: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 461724c: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4617250: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4617254: 6d4923e9     	ldp	d9, d8, [sp, #0x90]
 4617258: 910343ff     	add	sp, sp, #0xd0
 461725c: d65f03c0     	ret
 4617260: 52802400     	mov	w0, #0x120              ; =288
 4617264: 96e7e041     	bl	0xf368 <_ChromeMain+0xa0cc>
 4617268: aa0003f5     	mov	x21, x0
 461726c: d2800001     	mov	x1, #0x0                ; =0
 4617270: 97298c1a     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 4617274: b40000a0     	cbz	x0, 0x4617288 <_ChromeMain+0x4611fec>
 4617278: b9400aa8     	ldr	w8, [x21, #0x8]
 461727c: 31000508     	adds	w8, w8, #0x1
 4617280: b9000aa8     	str	w8, [x21, #0x8]
 4617284: 540002a2     	b.hs	0x46172d8 <_ChromeMain+0x461203c>
 4617288: aa1403e0     	mov	x0, x20
 461728c: aa1503e1     	mov	x1, x21
 4617290: 973193db     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 4617294: f940b280     	ldr	x0, [x20, #0x160]
 4617298: 17ffffe3     	b	0x4617224 <_ChromeMain+0x4611f88>
 461729c: 52802400     	mov	w0, #0x120              ; =288
 46172a0: 96e7e032     	bl	0xf368 <_ChromeMain+0xa0cc>
 46172a4: aa0003f4     	mov	x20, x0
 46172a8: d2800001     	mov	x1, #0x0                ; =0
 46172ac: 97298c0b     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 46172b0: b40000a0     	cbz	x0, 0x46172c4 <_ChromeMain+0x4612028>
 46172b4: b9400a88     	ldr	w8, [x20, #0x8]
 46172b8: 31000508     	adds	w8, w8, #0x1
 46172bc: b9000a88     	str	w8, [x20, #0x8]
 46172c0: 54000122     	b.hs	0x46172e4 <_ChromeMain+0x4612048>
 46172c4: aa1503e0     	mov	x0, x21
 46172c8: aa1403e1     	mov	x1, x20
 46172cc: 973193cc     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 46172d0: f940b2a0     	ldr	x0, [x21, #0x160]
 46172d4: 17ffffc6     	b	0x46171ec <_ChromeMain+0x4611f50>
 46172d8: d4200000     	brk	#0
 46172dc: d4400000     	hlt	#0
 46172e0: d4200020     	brk	#0x1
 46172e4: d4200000     	brk	#0
 46172e8: d4400000     	hlt	#0
 46172ec: d4200020     	brk	#0x1
