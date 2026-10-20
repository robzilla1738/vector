
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41e331c: d10303ff     	sub	sp, sp, #0xc0
 41e3320: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 41e3324: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 41e3328: 9102c3fd     	add	x29, sp, #0xb0
 41e332c: aa0003f3     	mov	x19, x0
 41e3330: 35000161     	cbnz	w1, 0x41e335c <_ChromeMain+0x41de0c0>
 41e3334: b40001f3     	cbz	x19, 0x41e3370 <_ChromeMain+0x41de0d4>
 41e3338: f947c268     	ldr	x8, [x19, #0xf80]
 41e333c: b40001a8     	cbz	x8, 0x41e3370 <_ChromeMain+0x41de0d4>
 41e3340: 3940a108     	ldrb	w8, [x8, #0x28]
 41e3344: 34000168     	cbz	w8, 0x41e3370 <_ChromeMain+0x41de0d4>
 41e3348: aa1303e0     	mov	x0, x19
 41e334c: 94d27fe5     	bl	0x76832e0 <_ChromeMain+0x767e044>
 41e3350: 7100141f     	cmp	w0, #0x5
 41e3354: 540000e1     	b.ne	0x41e3370 <_ChromeMain+0x41de0d4>
 41e3358: 14000018     	b	0x41e33b8 <_ChromeMain+0x41de11c>
 41e335c: b40000b3     	cbz	x19, 0x41e3370 <_ChromeMain+0x41de0d4>
 41e3360: f947c268     	ldr	x8, [x19, #0xf80]
 41e3364: b40000e8     	cbz	x8, 0x41e3380 <_ChromeMain+0x41de0e4>
 41e3368: 3940a108     	ldrb	w8, [x8, #0x28]
 41e336c: 360000a8     	tbz	w8, #0x0, 0x41e3380 <_ChromeMain+0x41de0e4>
 41e3370: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 41e3374: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 41e3378: 910303ff     	add	sp, sp, #0xc0
 41e337c: d65f03c0     	ret
 41e3380: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 41e3384: f9001bff     	str	xzr, [sp, #0x30]
 41e3388: 910083e3     	add	x3, sp, #0x20
 41e338c: aa1303e0     	mov	x0, x19
 41e3390: 52800021     	mov	w1, #0x1                ; =1
 41e3394: 528000a2     	mov	w2, #0x5                ; =5
 41e3398: 94d27fdf     	bl	0x7683314 <_ChromeMain+0x767e078>
 41e339c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 41e33a0: 36fffe88     	tbz	w8, #0x1f, 0x41e3370 <_ChromeMain+0x41de0d4>
 41e33a4: f94013e0     	ldr	x0, [sp, #0x20]
 41e33a8: f9401be8     	ldr	x8, [sp, #0x30]
 41e33ac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41e33b0: 96f896c2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41e33b4: 17ffffef     	b	0x41e3370 <_ChromeMain+0x41de0d4>
 41e33b8: f9004bff     	str	xzr, [sp, #0x90]
 41e33bc: 6f00e400     	movi.2d	v0, #0000000000000000
 41e33c0: ad0383e0     	stp	q0, q0, [sp, #0x70]
 41e33c4: ad0283e0     	stp	q0, q0, [sp, #0x50]
 41e33c8: ad0183e0     	stp	q0, q0, [sp, #0x30]
 41e33cc: 3d800be0     	str	q0, [sp, #0x20]
 41e33d0: b982b668     	ldrsw	x8, [x19, #0x2b4]
 41e33d4: 3100051f     	cmn	w8, #0x1
 41e33d8: 540007c0     	b.eq	0x41e34d0 <_ChromeMain+0x41de234>
 41e33dc: f9414269     	ldr	x9, [x19, #0x280]
 41e33e0: eb08013f     	cmp	x9, x8
 41e33e4: 540007a9     	b.ls	0x41e34d8 <_ChromeMain+0x41de23c>
 41e33e8: f9413e69     	ldr	x9, [x19, #0x278]
 41e33ec: f8687928     	ldr	x8, [x9, x8, lsl #3]
 41e33f0: b40007e8     	cbz	x8, 0x41e34ec <_ChromeMain+0x41de250>
 41e33f4: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 41e33f8: b7f80729     	tbnz	x9, #0x3f, 0x41e34dc <_ChromeMain+0x41de240>
 41e33fc: b5000749     	cbnz	x9, 0x41e34e4 <_ChromeMain+0x41de248>
 41e3400: f9400d08     	ldr	x8, [x8, #0x18]
 41e3404: f9400508     	ldr	x8, [x8, #0x8]
 41e3408: 91018101     	add	x1, x8, #0x60
 41e340c: 910083e0     	add	x0, sp, #0x20
 41e3410: 96fd5ae1     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41e3414: 3940dfe8     	ldrb	w8, [sp, #0x37]
 41e3418: f94017e9     	ldr	x9, [sp, #0x28]
 41e341c: 7219011f     	tst	w8, #0x80
 41e3420: 9a881128     	csel	x8, x9, x8, ne
 41e3424: b4000208     	cbz	x8, 0x41e3464 <_ChromeMain+0x41de1c8>
 41e3428: b0044f81     	adrp	x1, 0xcbd4000 <dyld_stub_binder+0xcbd4000>
 41e342c: 9110f021     	add	x1, x1, #0x43c
 41e3430: 910083e0     	add	x0, sp, #0x20
 41e3434: 528000c2     	mov	w2, #0x6                ; =6
 41e3438: 970ef3d6     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 41e343c: 37000140     	tbnz	w0, #0x0, 0x41e3464 <_ChromeMain+0x41de1c8>
 41e3440: f9413a60     	ldr	x0, [x19, #0x270]
 41e3444: 97581a5b     	bl	0x17e9db0 <_ChromeMain+0x17e4b14>
 41e3448: 910083e1     	add	x1, sp, #0x20
 41e344c: 910083e2     	add	x2, sp, #0x20
 41e3450: 528003e3     	mov	w3, #0x1f               ; =31
 41e3454: d2800004     	mov	x4, #0x0                ; =0
 41e3458: 972262ea     	bl	0xa7c000 <_ChromeMain+0xa76d64>
 41e345c: 7100081f     	cmp	w0, #0x2
 41e3460: 540002a0     	b.eq	0x41e34b4 <_ChromeMain+0x41de218>
 41e3464: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 41e3468: f9000fff     	str	xzr, [sp, #0x18]
 41e346c: 910023e3     	add	x3, sp, #0x8
 41e3470: aa1303e0     	mov	x0, x19
 41e3474: 52800001     	mov	w1, #0x0                ; =0
 41e3478: 528000a2     	mov	w2, #0x5                ; =5
 41e347c: 94d27fa6     	bl	0x7683314 <_ChromeMain+0x767e078>
 41e3480: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 41e3484: 36f800a8     	tbz	w8, #0x1f, 0x41e3498 <_ChromeMain+0x41de1fc>
 41e3488: f94007e0     	ldr	x0, [sp, #0x8]
 41e348c: f9400fe8     	ldr	x8, [sp, #0x18]
 41e3490: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41e3494: 96f89689     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41e3498: 910083f3     	add	x19, sp, #0x20
 41e349c: 9101c260     	add	x0, x19, #0x70
 41e34a0: d2800001     	mov	x1, #0x0                ; =0
 41e34a4: 96f91205     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41e34a8: 91008260     	add	x0, x19, #0x20
 41e34ac: 96f911f3     	bl	0x27c78 <_ChromeMain+0x229dc>
 41e34b0: 17ffffbb     	b	0x41e339c <_ChromeMain+0x41de100>
 41e34b4: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 41e34b8: f9000fff     	str	xzr, [sp, #0x18]
 41e34bc: 910023e3     	add	x3, sp, #0x8
 41e34c0: aa1303e0     	mov	x0, x19
 41e34c4: 52800021     	mov	w1, #0x1                ; =1
 41e34c8: 52800062     	mov	w2, #0x3                ; =3
 41e34cc: 17ffffec     	b	0x41e347c <_ChromeMain+0x41de1e0>
 41e34d0: d4200000     	brk	#0
 41e34d4: d4400000     	hlt	#0
 41e34d8: d4200020     	brk	#0x1
 41e34dc: f9401909     	ldr	x9, [x8, #0x30]
 41e34e0: b4fff909     	cbz	x9, 0x41e3400 <_ChromeMain+0x41de164>
 41e34e4: 9100a101     	add	x1, x8, #0x28
 41e34e8: 17ffffc9     	b	0x41e340c <_ChromeMain+0x41de170>
 41e34ec: 97e21d63     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 41e34f0: aa0003e1     	mov	x1, x0
 41e34f4: 17ffffc6     	b	0x41e340c <_ChromeMain+0x41de170>
