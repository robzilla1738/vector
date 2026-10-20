
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4078130: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4078134: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4078138: a9027bfd     	stp	x29, x30, [sp, #0x20]
 407813c: 910083fd     	add	x29, sp, #0x20
 4078140: aa0203f4     	mov	x20, x2
 4078144: aa0103f5     	mov	x21, x1
 4078148: aa0003f3     	mov	x19, x0
 407814c: 52800800     	mov	w0, #0x40               ; =64
 4078150: 96fe5c86     	bl	0xf368 <_ChromeMain+0xa0cc>
 4078154: aa0003f6     	mov	x22, x0
 4078158: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 407815c: 37f805e8     	tbnz	w8, #0x1f, 0x4078218 <_ChromeMain+0x4072f7c>
 4078160: 3dc002a0     	ldr	q0, [x21]
 4078164: 3d8002c0     	str	q0, [x22]
 4078168: f9400aa8     	ldr	x8, [x21, #0x10]
 407816c: f9000ac8     	str	x8, [x22, #0x10]
 4078170: b9401aa8     	ldr	w8, [x21, #0x18]
 4078174: b9001ac8     	str	w8, [x22, #0x18]
 4078178: 394072a8     	ldrb	w8, [x21, #0x1c]
 407817c: 390072c8     	strb	w8, [x22, #0x1c]
 4078180: 39c0dea8     	ldrsb	w8, [x21, #0x37]
 4078184: 37f80428     	tbnz	w8, #0x1f, 0x4078208 <_ChromeMain+0x4072f6c>
 4078188: 3cc202a0     	ldur	q0, [x21, #0x20]
 407818c: 3c8202c0     	stur	q0, [x22, #0x20]
 4078190: f84302a8     	ldur	x8, [x21, #0x30]
 4078194: f80302c8     	stur	x8, [x22, #0x30]
 4078198: 3940e2a8     	ldrb	w8, [x21, #0x38]
 407819c: 3900e2c8     	strb	w8, [x22, #0x38]
 40781a0: f9401275     	ldr	x21, [x19, #0x20]
 40781a4: f9001276     	str	x22, [x19, #0x20]
 40781a8: b4000215     	cbz	x21, 0x40781e8 <_ChromeMain+0x4072f4c>
 40781ac: 39c0dea8     	ldrsb	w8, [x21, #0x37]
 40781b0: 36f800a8     	tbz	w8, #0x1f, 0x40781c4 <_ChromeMain+0x4072f28>
 40781b4: f94012a0     	ldr	x0, [x21, #0x20]
 40781b8: f9401aa8     	ldr	x8, [x21, #0x30]
 40781bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40781c0: 96fe433e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40781c4: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 40781c8: 36f800a8     	tbz	w8, #0x1f, 0x40781dc <_ChromeMain+0x4072f40>
 40781cc: f94002a0     	ldr	x0, [x21]
 40781d0: f9400aa8     	ldr	x8, [x21, #0x10]
 40781d4: d37ff901     	lsl	x1, x8, #1
 40781d8: 96fe4338     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40781dc: aa1503e0     	mov	x0, x21
 40781e0: 52800801     	mov	w1, #0x40               ; =64
 40781e4: 96fe4335     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40781e8: 39428668     	ldrb	w8, [x19, #0xa1]
 40781ec: 2a140108     	orr	w8, w8, w20
 40781f0: 39028668     	strb	w8, [x19, #0xa1]
 40781f4: 9101a260     	add	x0, x19, #0x68
 40781f8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 40781fc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4078200: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4078204: 172db265     	b	0xbe4b98 <_ChromeMain+0xbdf8fc>
 4078208: a9420aa1     	ldp	x1, x2, [x21, #0x20]
 407820c: 910082c0     	add	x0, x22, #0x20
 4078210: 96fe8002     	bl	0x18218 <_ChromeMain+0x12f7c>
 4078214: 17ffffe1     	b	0x4078198 <_ChromeMain+0x4072efc>
 4078218: a9400aa1     	ldp	x1, x2, [x21]
 407821c: aa1603e0     	mov	x0, x22
 4078220: 96ff3a6c     	bl	0x46bd0 <_ChromeMain+0x41934>
 4078224: 17ffffd3     	b	0x4078170 <_ChromeMain+0x4072ed4>
