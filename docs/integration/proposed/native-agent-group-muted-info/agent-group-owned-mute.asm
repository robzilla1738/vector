
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
