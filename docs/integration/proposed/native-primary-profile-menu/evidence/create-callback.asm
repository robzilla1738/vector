
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45838f8: d10103ff     	sub	sp, sp, #0x40
 45838fc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4583900: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4583904: 9100c3fd     	add	x29, sp, #0x30
 4583908: f9401413     	ldr	x19, [x0, #0x28]
 458390c: f900141f     	str	xzr, [x0, #0x28]
 4583910: b40002f3     	cbz	x19, 0x458396c <_ChromeMain+0x457e6d0>
 4583914: f9401814     	ldr	x20, [x0, #0x30]
 4583918: 19404268     	ldapurb	w8, [x19, #0x4]
 458391c: b4000201     	cbz	x1, 0x458395c <_ChromeMain+0x457e6c0>
 4583920: 7100011f     	cmp	w8, #0x0
 4583924: fa400a84     	ccmp	x20, #0x0, #0x4, eq
 4583928: 540001a0     	b.eq	0x458395c <_ChromeMain+0x457e6c0>
 458392c: 19404268     	ldapurb	w8, [x19, #0x4]
 4583930: 35000388     	cbnz	w8, 0x45839a0 <_ChromeMain+0x457e704>
 4583934: f9400028     	ldr	x8, [x1]
 4583938: f9401909     	ldr	x9, [x8, #0x30]
 458393c: 910023e8     	add	x8, sp, #0x8
 4583940: aa0103e0     	mov	x0, x1
 4583944: d63f0120     	blr	x9
 4583948: 910023e1     	add	x1, sp, #0x8
 458394c: aa1403e0     	mov	x0, x20
 4583950: 97ffbbb5     	bl	0x4572824 <_ChromeMain+0x456d588>
 4583954: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4583958: 37f801a8     	tbnz	w8, #0x1f, 0x458398c <_ChromeMain+0x457e6f0>
 458395c: 12800008     	mov	w8, #-0x1               ; =-1
 4583960: b8e80268     	ldaddal	w8, w8, [x19]
 4583964: 7100051f     	cmp	w8, #0x1
 4583968: 540000a0     	b.eq	0x458397c <_ChromeMain+0x457e6e0>
 458396c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4583970: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4583974: 910103ff     	add	sp, sp, #0x40
 4583978: d65f03c0     	ret
 458397c: aa1303e0     	mov	x0, x19
 4583980: 52800101     	mov	w1, #0x8                ; =8
 4583984: 96ea154d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4583988: 17fffff9     	b	0x458396c <_ChromeMain+0x457e6d0>
 458398c: f94007e0     	ldr	x0, [sp, #0x8]
 4583990: f9400fe8     	ldr	x8, [sp, #0x18]
 4583994: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4583998: 96ea1548     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458399c: 17fffff0     	b	0x458395c <_ChromeMain+0x457e6c0>
 45839a0: d4200000     	brk	#0
 45839a4: d4400000     	hlt	#0
 45839a8: d4200020     	brk	#0x1
