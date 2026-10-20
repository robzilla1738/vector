
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  6d63b8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
  6d63bc: a9014ff4     	stp	x20, x19, [sp, #0x10]
  6d63c0: a9027bfd     	stp	x29, x30, [sp, #0x20]
  6d63c4: 910083fd     	add	x29, sp, #0x20
  6d63c8: aa0803f3     	mov	x19, x8
  6d63cc: 97ffff05     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
  6d63d0: 92800208     	mov	x8, #-0x11              ; =-17
  6d63d4: f2efffe8     	movk	x8, #0x7fff, lsl #48
  6d63d8: eb08003f     	cmp	x1, x8
  6d63dc: 540003e2     	b.hs	0x6d6458 <_ChromeMain+0x6d11bc>
  6d63e0: aa0003f5     	mov	x21, x0
  6d63e4: aa0103f4     	mov	x20, x1
  6d63e8: f100583f     	cmp	x1, #0x16
  6d63ec: 54000228     	b.hi	0x6d6430 <_ChromeMain+0x6d1194>
  6d63f0: 39005e74     	strb	w20, [x19, #0x17]
  6d63f4: 8b140268     	add	x8, x19, x20
  6d63f8: eb13011f     	cmp	x8, x19
  6d63fc: 540002c3     	b.lo	0x6d6454 <_ChromeMain+0x6d11b8>
  6d6400: eb15011f     	cmp	x8, x21
  6d6404: fa558262     	ccmp	x19, x21, #0x2, hi
  6d6408: 54000269     	b.ls	0x6d6454 <_ChromeMain+0x6d11b8>
  6d640c: aa1303e0     	mov	x0, x19
  6d6410: aa1503e1     	mov	x1, x21
  6d6414: aa1403e2     	mov	x2, x20
  6d6418: 95e4e3ad     	bl	0x800f2cc <_ChromeMain+0x800a030>
  6d641c: 38346a7f     	strb	wzr, [x19, x20]
  6d6420: a9427bfd     	ldp	x29, x30, [sp, #0x20]
  6d6424: a9414ff4     	ldp	x20, x19, [sp, #0x10]
  6d6428: a8c357f6     	ldp	x22, x21, [sp], #0x30
  6d642c: d65f03c0     	ret
  6d6430: 927cea96     	and	x22, x20, #0x7ffffffffffffff0
  6d6434: 910042c0     	add	x0, x22, #0x10
  6d6438: 97e4e3cc     	bl	0xf368 <_ChromeMain+0xa0cc>
  6d643c: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
  6d6440: cb0802c8     	sub	x8, x22, x8
  6d6444: a9005260     	stp	x0, x20, [x19]
  6d6448: f9000a68     	str	x8, [x19, #0x10]
  6d644c: aa0003f3     	mov	x19, x0
  6d6450: 17ffffe9     	b	0x6d63f4 <_ChromeMain+0x6d1158>
  6d6454: d4200020     	brk	#0x1
  6d6458: 9514a7cd     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
