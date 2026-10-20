
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 6e01164: d10083ff     	sub	sp, sp, #0x20
 6e01168: a9017bfd     	stp	x29, x30, [sp, #0x10]
 6e0116c: 910043fd     	add	x29, sp, #0x10
 6e01170: 0aa17c28     	bic	w8, w1, w1, asr #31
 6e01174: 1e230100     	ucvtf	s0, w8
 6e01178: 4e040400     	dup.4s	v0, v0[0]
 6e0117c: 3d8003e0     	str	q0, [sp]
 6e01180: 910003e1     	mov	x1, sp
 6e01184: 94000004     	bl	0x6e01194 <_ChromeMain+0x6dfbef8>
 6e01188: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 6e0118c: 910083ff     	add	sp, sp, #0x20
 6e01190: d65f03c0     	ret
 6e01194: 3dc00020     	ldr	q0, [x1]
 6e01198: 6ea0c801     	fcmge.4s	v1, v0, #0.0
 6e0119c: 6e205821     	mvn.16b	v1, v1
 6e011a0: 5ef1b821     	addp.2d	d1, v1
 6e011a4: 9e660028     	fmov	x8, d1
 6e011a8: b50002a8     	cbnz	x8, 0x6e011fc <_ChromeMain+0x6dfbf60>
 6e011ac: aa0003e8     	mov	x8, x0
 6e011b0: bc4b4d01     	ldr	s1, [x8, #0xb4]!
 6e011b4: 1e202020     	fcmp	s1, s0
 6e011b8: 540001c1     	b.ne	0x6e011f0 <_ChromeMain+0x6dfbf54>
 6e011bc: bd40b801     	ldr	s1, [x0, #0xb8]
 6e011c0: 5e0c0402     	mov	s2, v0[1]
 6e011c4: 1e222020     	fcmp	s1, s2
 6e011c8: 54000141     	b.ne	0x6e011f0 <_ChromeMain+0x6dfbf54>
 6e011cc: bd40bc01     	ldr	s1, [x0, #0xbc]
 6e011d0: 5e140402     	mov	s2, v0[2]
 6e011d4: 1e222020     	fcmp	s1, s2
 6e011d8: 540000c1     	b.ne	0x6e011f0 <_ChromeMain+0x6dfbf54>
 6e011dc: bd40c001     	ldr	s1, [x0, #0xc0]
 6e011e0: 5e1c0400     	mov	s0, v0[3]
 6e011e4: 1e202020     	fcmp	s1, s0
 6e011e8: 54000041     	b.ne	0x6e011f0 <_ChromeMain+0x6dfbf54>
 6e011ec: d65f03c0     	ret
 6e011f0: 3dc00020     	ldr	q0, [x1]
 6e011f4: 3d800100     	str	q0, [x8]
 6e011f8: 17fffe62     	b	0x6e00b80 <_ChromeMain+0x6dfb8e4>
 6e011fc: d4200000     	brk	#0
 6e01200: d4400000     	hlt	#0
 6e01204: d4200020     	brk	#0x1
