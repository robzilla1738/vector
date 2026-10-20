
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 8d39134: d100c3ff     	sub	sp, sp, #0x30
 8d39138: a9014ff4     	stp	x20, x19, [sp, #0x10]
 8d3913c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 8d39140: 910083fd     	add	x29, sp, #0x20
 8d39144: aa0203f4     	mov	x20, x2
 8d39148: aa0003f3     	mov	x19, x0
 8d3914c: 390003ff     	strb	wzr, [sp]
 8d39150: 52801fe8     	mov	w8, #0xff               ; =255
 8d39154: 390023e8     	strb	w8, [sp, #0x8]
 8d39158: 910003e0     	mov	x0, sp
 8d3915c: 94000244     	bl	0x8d39a6c <_ChromeMain+0x8d347d0>
 8d39160: f9400268     	ldr	x8, [x19]
 8d39164: 910003e1     	mov	x1, sp
 8d39168: 9109c103     	add	x3, x8, #0x270
 8d3916c: 91142104     	add	x4, x8, #0x508
 8d39170: aa1303e0     	mov	x0, x19
 8d39174: aa1403e2     	mov	x2, x20
 8d39178: 9400000c     	bl	0x8d391a8 <_ChromeMain+0x8d33f0c>
 8d3917c: 394023e8     	ldrb	w8, [sp, #0x8]
 8d39180: 51000508     	sub	w8, w8, #0x1
 8d39184: 7103f51f     	cmp	w8, #0xfd
 8d39188: 54000068     	b.hi	0x8d39194 <_ChromeMain+0x8d33ef8>
 8d3918c: 910003e0     	mov	x0, sp
 8d39190: 96078098     	bl	0xf193f0 <_ChromeMain+0xf14154>
 8d39194: aa1303e0     	mov	x0, x19
 8d39198: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 8d3919c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 8d391a0: 9100c3ff     	add	sp, sp, #0x30
 8d391a4: d65f03c0     	ret
 8d391a8: d10103ff     	sub	sp, sp, #0x40
 8d391ac: a90157f6     	stp	x22, x21, [sp, #0x10]
 8d391b0: a9024ff4     	stp	x20, x19, [sp, #0x20]
 8d391b4: a9037bfd     	stp	x29, x30, [sp, #0x30]
 8d391b8: 9100c3fd     	add	x29, sp, #0x30
 8d391bc: 39400048     	ldrb	w8, [x2]
 8d391c0: 360006c8     	tbz	w8, #0x0, 0x8d39298 <_ChromeMain+0x8d33ffc>
 8d391c4: aa0303f4     	mov	x20, x3
 8d391c8: 39428068     	ldrb	w8, [x3, #0xa0]
 8d391cc: 350006c8     	cbnz	w8, 0x8d392a4 <_ChromeMain+0x8d34008>
 8d391d0: aa0203f5     	mov	x21, x2
 8d391d4: aa0003f3     	mov	x19, x0
 8d391d8: 39402028     	ldrb	w8, [x1, #0x8]
 8d391dc: 7100051f     	cmp	w8, #0x1
 8d391e0: 540000ac     	b.gt	0x8d391f4 <_ChromeMain+0x8d33f58>
 8d391e4: 34000108     	cbz	w8, 0x8d39204 <_ChromeMain+0x8d33f68>
 8d391e8: f9400028     	ldr	x8, [x1]
 8d391ec: b50000c8     	cbnz	x8, 0x8d39204 <_ChromeMain+0x8d33f68>
 8d391f0: 14000030     	b	0x8d392b0 <_ChromeMain+0x8d34014>
 8d391f4: 7100091f     	cmp	w8, #0x2
 8d391f8: 540004a1     	b.ne	0x8d3928c <_ChromeMain+0x8d33ff0>
 8d391fc: f9400028     	ldr	x8, [x1]
 8d39200: b4000408     	cbz	x8, 0x8d39280 <_ChromeMain+0x8d33fe4>
 8d39204: aa0403e0     	mov	x0, x4
 8d39208: 94000235     	bl	0x8d39adc <_ChromeMain+0x8d34840>
 8d3920c: 52800500     	mov	w0, #0x28               ; =40
 8d39210: 94f9258b     	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 8d39214: aa0003f6     	mov	x22, x0
 8d39218: f0fd9181     	adrp	x1, 0x3f6c000 <_ChromeMain+0x3f66d64>
 8d3921c: 91220021     	add	x1, x1, #0x880
 8d39220: d0fc1722     	adrp	x2, 0x101f000 <_ChromeMain+0x1019d64>
 8d39224: 91180042     	add	x2, x2, #0x600
 8d39228: 9660f8c2     	bl	0x2577530 <_ChromeMain+0x2572294>
 8d3922c: 39428288     	ldrb	w8, [x20, #0xa0]
 8d39230: 34000088     	cbz	w8, 0x8d39240 <_ChromeMain+0x8d33fa4>
 8d39234: aa1403e0     	mov	x0, x20
 8d39238: 97ffff8b     	bl	0x8d39064 <_ChromeMain+0x8d33dc8>
 8d3923c: 3902829f     	strb	wzr, [x20, #0xa0]
 8d39240: b4000254     	cbz	x20, 0x8d39288 <_ChromeMain+0x8d33fec>
 8d39244: f90007ff     	str	xzr, [sp, #0x8]
 8d39248: aa1403e0     	mov	x0, x20
 8d3924c: aa1603e1     	mov	x1, x22
 8d39250: aa1503e2     	mov	x2, x21
 8d39254: 97ffff3b     	bl	0x8d38f40 <_ChromeMain+0x8d33ca4>
 8d39258: 52800028     	mov	w8, #0x1                ; =1
 8d3925c: 39028288     	strb	w8, [x20, #0xa0]
 8d39260: 910023e0     	add	x0, sp, #0x8
 8d39264: 96078063     	bl	0xf193f0 <_ChromeMain+0xf14154>
 8d39268: aa1303e0     	mov	x0, x19
 8d3926c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 8d39270: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 8d39274: a94157f6     	ldp	x22, x21, [sp, #0x10]
 8d39278: 910103ff     	add	sp, sp, #0x40
 8d3927c: d65f03c0     	ret
 8d39280: d4200000     	brk	#0
 8d39284: d4400000     	hlt	#0
 8d39288: d4200020     	brk	#0x1
 8d3928c: 900255a0     	adrp	x0, 0xd7ed000 <dyld_stub_binder+0xd7ed000>
 8d39290: 912aa000     	add	x0, x0, #0xaa8
 8d39294: 96fbb7ff     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 8d39298: d4200000     	brk	#0
 8d3929c: d4400000     	hlt	#0
 8d392a0: d4200020     	brk	#0x1
 8d392a4: d4200000     	brk	#0
 8d392a8: d4400000     	hlt	#0
 8d392ac: d4200020     	brk	#0x1
 8d392b0: d4200000     	brk	#0
 8d392b4: d4400000     	hlt	#0
 8d392b8: d4200020     	brk	#0x1
