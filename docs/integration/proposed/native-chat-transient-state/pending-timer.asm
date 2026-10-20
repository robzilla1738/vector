
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464e0f4: d10143ff     	sub	sp, sp, #0x50
 464e0f8: a90257f6     	stp	x22, x21, [sp, #0x20]
 464e0fc: a9034ff4     	stp	x20, x19, [sp, #0x30]
 464e100: a9047bfd     	stp	x29, x30, [sp, #0x40]
 464e104: 910103fd     	add	x29, sp, #0x40
 464e108: 397e4008     	ldrb	w8, [x0, #0xf90]
 464e10c: 37000a68     	tbnz	w8, #0x0, 0x464e258 <_ChromeMain+0x4648fbc>
 464e110: aa0103f4     	mov	x20, x1
 464e114: aa0003f3     	mov	x19, x0
 464e118: 97274796     	bl	0x101ff70 <_ChromeMain+0x101acd4>
 464e11c: f8418c08     	ldr	x8, [x0, #0x18]!
 464e120: b40009c8     	cbz	x8, 0x464e258 <_ChromeMain+0x4648fbc>
 464e124: b9402109     	ldr	w9, [x8, #0x20]
 464e128: 6b14013f     	cmp	w9, w20
 464e12c: 54000a6c     	b.gt	0x464e278 <_ChromeMain+0x4648fdc>
 464e130: 54000aab     	b.lt	0x464e284 <_ChromeMain+0x4648fe8>
 464e134: eb00011f     	cmp	x8, x0
 464e138: 54000900     	b.eq	0x464e258 <_ChromeMain+0x4648fbc>
 464e13c: f9401508     	ldr	x8, [x8, #0x28]
 464e140: b40008c8     	cbz	x8, 0x464e258 <_ChromeMain+0x4648fbc>
 464e144: 52820508     	mov	w8, #0x1028             ; =4136
 464e148: 8b080275     	add	x21, x19, x8
 464e14c: 52820596     	mov	w22, #0x102c            ; =4140
 464e150: 38766a68     	ldrb	w8, [x19, x22]
 464e154: b9502a69     	ldr	w9, [x19, #0x1028]
 464e158: 7100011f     	cmp	w8, #0x0
 464e15c: 7a541120     	ccmp	w9, w20, #0x0, ne
 464e160: 540002c1     	b.ne	0x464e1b8 <_ChromeMain+0x4648f1c>
 464e164: f9483260     	ldr	x0, [x19, #0x1060]
 464e168: b40001a0     	cbz	x0, 0x464e19c <_ChromeMain+0x4648f00>
 464e16c: f9400008     	ldr	x8, [x0]
 464e170: f9400908     	ldr	x8, [x8, #0x10]
 464e174: d0ffe3c9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 464e178: 9123b129     	add	x9, x9, #0x8ec
 464e17c: eb09011f     	cmp	x8, x9
 464e180: 54000761     	b.ne	0x464e26c <_ChromeMain+0x4648fd0>
 464e184: f9401008     	ldr	x8, [x0, #0x20]
 464e188: b40000a8     	cbz	x8, 0x464e19c <_ChromeMain+0x4648f00>
 464e18c: f9400c08     	ldr	x8, [x0, #0x18]
 464e190: b8bfc108     	ldapr	w8, [x8]
 464e194: 7100051f     	cmp	w8, #0x1
 464e198: 54000601     	b.ne	0x464e258 <_ChromeMain+0x4648fbc>
 464e19c: 38766a68     	ldrb	w8, [x19, x22]
 464e1a0: 370000e8     	tbnz	w8, #0x0, 0x464e1bc <_ChromeMain+0x4648f20>
 464e1a4: b4000775     	cbz	x21, 0x464e290 <_ChromeMain+0x4648ff4>
 464e1a8: b90002b4     	str	w20, [x21]
 464e1ac: 52800028     	mov	w8, #0x1                ; =1
 464e1b0: 38366a68     	strb	w8, [x19, x22]
 464e1b4: 14000003     	b	0x464e1c0 <_ChromeMain+0x4648f24>
 464e1b8: 34ffff68     	cbz	w8, 0x464e1a4 <_ChromeMain+0x4648f08>
 464e1bc: b90002b4     	str	w20, [x21]
 464e1c0: b004c3e0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 464e1c4: 91344400     	add	x0, x0, #0xd11
 464e1c8: b004c3e1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 464e1cc: 912c7821     	add	x1, x1, #0xb1e
 464e1d0: 910003e8     	mov	x8, sp
 464e1d4: 52857ae2     	mov	w2, #0x2bd7             ; =11223
 464e1d8: 96e80aaa     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 464e1dc: f94a0674     	ldr	x20, [x19, #0x1408]
 464e1e0: b40000d4     	cbz	x20, 0x464e1f8 <_ChromeMain+0x4648f5c>
 464e1e4: 52800028     	mov	w8, #0x1                ; =1
 464e1e8: b8280288     	ldadd	w8, w8, [x20]
 464e1ec: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 464e1f0: 6b09011f     	cmp	w8, w9
 464e1f4: 54000500     	b.eq	0x464e294 <_ChromeMain+0x4648ff8>
 464e1f8: 52820615     	mov	w21, #0x1030            ; =4144
 464e1fc: f94a0a76     	ldr	x22, [x19, #0x1410]
 464e200: 52800800     	mov	w0, #0x40               ; =64
 464e204: 96e70459     	bl	0xf368 <_ChromeMain+0xa0cc>
 464e208: aa0003e3     	mov	x3, x0
 464e20c: 52800028     	mov	w8, #0x1                ; =1
 464e210: b0ffcb69     	adrp	x9, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 464e214: 911c0129     	add	x9, x9, #0x700
 464e218: 90ffca8a     	adrp	x10, 0x3f9e000 <_ChromeMain+0x3f98d64>
 464e21c: 9111014a     	add	x10, x10, #0x440
 464e220: b9000008     	str	w8, [x0]
 464e224: 90ffd0e8     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 464e228: 910a0108     	add	x8, x8, #0x280
 464e22c: 100003ab     	adr	x11, 0x464e2a0 <_ChromeMain+0x4649004>
 464e230: d503201f     	nop
 464e234: a900a809     	stp	x9, x10, [x0, #0x8]
 464e238: a901ac08     	stp	x8, x11, [x0, #0x18]
 464e23c: a902d01f     	stp	xzr, x20, [x0, #0x28]
 464e240: f9001c16     	str	x22, [x0, #0x38]
 464e244: 8b150260     	add	x0, x19, x21
 464e248: 910003e1     	mov	x1, sp
 464e24c: 52825a02     	mov	w2, #0x12d0             ; =4816
 464e250: 72a00262     	movk	w2, #0x13, lsl #16
 464e254: 96f970ac     	bl	0x4aa504 <_ChromeMain+0x4a5268>
 464e258: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 464e25c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 464e260: a94257f6     	ldp	x22, x21, [sp, #0x20]
 464e264: 910143ff     	add	sp, sp, #0x50
 464e268: d65f03c0     	ret
 464e26c: d63f0100     	blr	x8
 464e270: 3707ff40     	tbnz	w0, #0x0, 0x464e258 <_ChromeMain+0x4648fbc>
 464e274: 17ffffca     	b	0x464e19c <_ChromeMain+0x4648f00>
 464e278: f9400108     	ldr	x8, [x8]
 464e27c: b5fff548     	cbnz	x8, 0x464e124 <_ChromeMain+0x4648e88>
 464e280: 17fffff6     	b	0x464e258 <_ChromeMain+0x4648fbc>
 464e284: f9400508     	ldr	x8, [x8, #0x8]
 464e288: b5fff4e8     	cbnz	x8, 0x464e124 <_ChromeMain+0x4648e88>
 464e28c: 17fffff3     	b	0x464e258 <_ChromeMain+0x4648fbc>
 464e290: d4200020     	brk	#0x1
 464e294: d4200000     	brk	#0
 464e298: d4400000     	hlt	#0
 464e29c: d4200020     	brk	#0x1
 464e2a0: f9481409     	ldr	x9, [x0, #0x1028]
 464e2a4: b60001e9     	tbz	x9, #0x20, 0x464e2e0 <_ChromeMain+0x4649044>
 464e2a8: 91400408     	add	x8, x0, #0x1, lsl #12   ; =0x1000
 464e2ac: 3900b11f     	strb	wzr, [x8, #0x2c]
 464e2b0: 3940710a     	ldrb	w10, [x8, #0x1c]
 464e2b4: 340000aa     	cbz	w10, 0x464e2c8 <_ChromeMain+0x464902c>
 464e2b8: b950180a     	ldr	w10, [x0, #0x1018]
 464e2bc: 6b09015f     	cmp	w10, w9
 464e2c0: 54000041     	b.ne	0x464e2c8 <_ChromeMain+0x464902c>
 464e2c4: 3900711f     	strb	wzr, [x8, #0x1c]
 464e2c8: 3940910a     	ldrb	w10, [x8, #0x24]
 464e2cc: 340000aa     	cbz	w10, 0x464e2e0 <_ChromeMain+0x4649044>
 464e2d0: b950200a     	ldr	w10, [x0, #0x1020]
 464e2d4: 6b09015f     	cmp	w10, w9
 464e2d8: 54000041     	b.ne	0x464e2e0 <_ChromeMain+0x4649044>
 464e2dc: 3900911f     	strb	wzr, [x8, #0x24]
 464e2e0: 17ff77f8     	b	0x462c2c0 <_ChromeMain+0x4627024>
