
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 78af854: d10143ff     	sub	sp, sp, #0x50
 78af858: a90257f6     	stp	x22, x21, [sp, #0x20]
 78af85c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 78af860: a9047bfd     	stp	x29, x30, [sp, #0x40]
 78af864: 910103fd     	add	x29, sp, #0x40
 78af868: aa0303f4     	mov	x20, x3
 78af86c: aa0203f3     	mov	x19, x2
 78af870: aa0103f5     	mov	x21, x1
 78af874: aa0303e1     	mov	x1, x3
 78af878: 972cfe12     	bl	0x43ef0c0 <_ChromeMain+0x43e9e24>
 78af87c: 34000180     	cbz	w0, 0x78af8ac <_ChromeMain+0x78aa610>
 78af880: 910c42a0     	add	x0, x21, #0x310
 78af884: aa1403e1     	mov	x1, x20
 78af888: 97ffb052     	bl	0x789b9d0 <_ChromeMain+0x7896734>
 78af88c: b20003e8     	mov	x8, #0x100000001        ; =4294967297
 78af890: ea21011f     	bics	xzr, x8, x1
 78af894: 540000a0     	b.eq	0x78af8a8 <_ChromeMain+0x78aa60c>
 78af898: 39404268     	ldrb	w8, [x19, #0x10]
 78af89c: 35000128     	cbnz	w8, 0x78af8c0 <_ChromeMain+0x78aa624>
 78af8a0: 52800020     	mov	w0, #0x1                ; =1
 78af8a4: 14000002     	b	0x78af8ac <_ChromeMain+0x78aa610>
 78af8a8: 52800000     	mov	w0, #0x0                ; =0
 78af8ac: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 78af8b0: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 78af8b4: a94257f6     	ldp	x22, x21, [sp, #0x20]
 78af8b8: 910143ff     	add	sp, sp, #0x50
 78af8bc: d65f03c0     	ret
 78af8c0: 910023e8     	add	x8, sp, #0x8
 78af8c4: aa1403e0     	mov	x0, x20
 78af8c8: 9400000c     	bl	0x78af8f8 <_ChromeMain+0x78aa65c>
 78af8cc: 39404268     	ldrb	w8, [x19, #0x10]
 78af8d0: 36000128     	tbz	w8, #0x0, 0x78af8f4 <_ChromeMain+0x78aa658>
 78af8d4: 394063e8     	ldrb	w8, [sp, #0x18]
 78af8d8: 34fffe88     	cbz	w8, 0x78af8a8 <_ChromeMain+0x78aa60c>
 78af8dc: a940a7e8     	ldp	x8, x9, [sp, #0x8]
 78af8e0: a9402e6a     	ldp	x10, x11, [x19]
 78af8e4: eb0a011f     	cmp	x8, x10
 78af8e8: fa4b0120     	ccmp	x9, x11, #0x0, eq
 78af8ec: 54fffde1     	b.ne	0x78af8a8 <_ChromeMain+0x78aa60c>
 78af8f0: 17ffffec     	b	0x78af8a0 <_ChromeMain+0x78aa604>
 78af8f4: 974d428a     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
