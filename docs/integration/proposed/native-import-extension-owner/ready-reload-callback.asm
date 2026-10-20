
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425f77c: d10103ff     	sub	sp, sp, #0x40
 425f780: a9024ff4     	stp	x20, x19, [sp, #0x20]
 425f784: a9037bfd     	stp	x29, x30, [sp, #0x30]
 425f788: 9100c3fd     	add	x29, sp, #0x30
 425f78c: aa0003e8     	mov	x8, x0
 425f790: a9428013     	ldp	x19, x0, [x0, #0x28]
 425f794: f900151f     	str	xzr, [x8, #0x28]
 425f798: 3cc38100     	ldur	q0, [x8, #0x38]
 425f79c: 3d8003e0     	str	q0, [sp]
 425f7a0: f9402509     	ldr	x9, [x8, #0x48]
 425f7a4: f9000be9     	str	x9, [sp, #0x10]
 425f7a8: a903fd1f     	stp	xzr, xzr, [x8, #0x38]
 425f7ac: f900251f     	str	xzr, [x8, #0x48]
 425f7b0: b4000133     	cbz	x19, 0x425f7d4 <_ChromeMain+0x425a538>
 425f7b4: 19404268     	ldapurb	w8, [x19, #0x4]
 425f7b8: 7100011f     	cmp	w8, #0x0
 425f7bc: fa400804     	ccmp	x0, #0x0, #0x4, eq
 425f7c0: 540002c1     	b.ne	0x425f818 <_ChromeMain+0x425a57c>
 425f7c4: 12800008     	mov	w8, #-0x1               ; =-1
 425f7c8: b8e80268     	ldaddal	w8, w8, [x19]
 425f7cc: 7100051f     	cmp	w8, #0x1
 425f7d0: 540000e0     	b.eq	0x425f7ec <_ChromeMain+0x425a550>
 425f7d4: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 425f7d8: 37f80128     	tbnz	w8, #0x1f, 0x425f7fc <_ChromeMain+0x425a560>
 425f7dc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 425f7e0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 425f7e4: 910103ff     	add	sp, sp, #0x40
 425f7e8: d65f03c0     	ret
 425f7ec: aa1303e0     	mov	x0, x19
 425f7f0: 52800101     	mov	w1, #0x8                ; =8
 425f7f4: 96f6a5b1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425f7f8: 17fffff7     	b	0x425f7d4 <_ChromeMain+0x425a538>
 425f7fc: f94003e0     	ldr	x0, [sp]
 425f800: f9400be8     	ldr	x8, [sp, #0x10]
 425f804: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425f808: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 425f80c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 425f810: 910103ff     	add	sp, sp, #0x40
 425f814: 16f6a5a9     	b	0x8eb8 <_ChromeMain+0x3c1c>
 425f818: 19404268     	ldapurb	w8, [x19, #0x4]
 425f81c: 35000088     	cbnz	w8, 0x425f82c <_ChromeMain+0x425a590>
 425f820: 910003e1     	mov	x1, sp
 425f824: 94a8a809     	bl	0x6c89848 <_ChromeMain+0x6c845ac>
 425f828: 17ffffe7     	b	0x425f7c4 <_ChromeMain+0x425a528>
 425f82c: d4200000     	brk	#0
 425f830: d4400000     	hlt	#0
