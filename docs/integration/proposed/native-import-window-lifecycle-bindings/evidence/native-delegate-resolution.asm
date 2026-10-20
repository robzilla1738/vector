
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  6f3328: d10103ff     	sub	sp, sp, #0x40
  6f332c: a90157f6     	stp	x22, x21, [sp, #0x10]
  6f3330: a9024ff4     	stp	x20, x19, [sp, #0x20]
  6f3334: a9037bfd     	stp	x29, x30, [sp, #0x30]
  6f3338: 9100c3fd     	add	x29, sp, #0x30
  6f333c: aa0003f3     	mov	x19, x0
  6f3340: 52800100     	mov	w0, #0x8                ; =8
  6f3344: 97e47009     	bl	0xf368 <_ChromeMain+0xa0cc>
  6f3348: aa0003f4     	mov	x20, x0
  6f334c: f900001f     	str	xzr, [x0]
  6f3350: f90003e0     	str	x0, [sp]
  6f3354: f9400260     	ldr	x0, [x19]
  6f3358: 95fde36d     	bl	0x866c10c <_ChromeMain+0x8666e70>
  6f335c: aa0003f5     	mov	x21, x0
  6f3360: aa1403e0     	mov	x0, x20
  6f3364: aa1503e1     	mov	x1, x21
  6f3368: 95fde366     	bl	0x866c100 <_ChromeMain+0x8666e64>
  6f336c: aa1503e0     	mov	x0, x21
  6f3370: 95e440fb     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
  6f3374: f9400668     	ldr	x8, [x19, #0x8]
  6f3378: f90007e8     	str	x8, [sp, #0x8]
  6f337c: 910003e0     	mov	x0, sp
  6f3380: 9400001e     	bl	0x6f33f8 <_ChromeMain+0x6ee15c>
  6f3384: aa0003f3     	mov	x19, x0
  6f3388: f94003f4     	ldr	x20, [sp]
  6f338c: f90003ff     	str	xzr, [sp]
  6f3390: b40000d4     	cbz	x20, 0x6f33a8 <_ChromeMain+0x6ee10c>
  6f3394: aa1403e0     	mov	x0, x20
  6f3398: 95fde360     	bl	0x866c118 <_ChromeMain+0x8666e7c>
  6f339c: aa1403e0     	mov	x0, x20
  6f33a0: 52800101     	mov	w1, #0x8                ; =8
  6f33a4: 97e456c5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
  6f33a8: b40000f3     	cbz	x19, 0x6f33c4 <_ChromeMain+0x6ee128>
  6f33ac: f9405a60     	ldr	x0, [x19, #0xb0]
  6f33b0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
  6f33b4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
  6f33b8: a94157f6     	ldp	x22, x21, [sp, #0x10]
  6f33bc: 910103ff     	add	sp, sp, #0x40
  6f33c0: d65f03c0     	ret
  6f33c4: d2800000     	mov	x0, #0x0                ; =0
  6f33c8: 17fffffa     	b	0x6f33b0 <_ChromeMain+0x6ee114>
