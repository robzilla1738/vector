
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c6e16d8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 c6e16dc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 c6e16e0: 910043fd     	add	x29, sp, #0x10
 c6e16e4: d10cc3ff     	sub	sp, sp, #0x330
 c6e16e8: aa0203e3     	mov	x3, x2
 c6e16ec: aa0003f3     	mov	x19, x0
 c6e16f0: a9007fff     	stp	xzr, xzr, [sp]
 c6e16f4: b80173ff     	stur	wzr, [sp, #0x17]
 c6e16f8: f9000bff     	str	xzr, [sp, #0x10]
 c6e16fc: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 c6e1700: ad0103e0     	stp	q0, q0, [sp, #0x20]
 c6e1704: ad0203e0     	stp	q0, q0, [sp, #0x40]
 c6e1708: 7900c3ff     	strh	wzr, [sp, #0x60]
 c6e170c: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 c6e1710: 52800028     	mov	w8, #0x1                ; =1
 c6e1714: b9007be8     	str	w8, [sp, #0x78]
 c6e1718: 910203e0     	add	x0, sp, #0x80
 c6e171c: 910003e2     	mov	x2, sp
 c6e1720: 52800004     	mov	w4, #0x0                ; =0
 c6e1724: 52800005     	mov	w5, #0x0                ; =0
 c6e1728: 964b529b     	bl	0x59b6194 <_ChromeMain+0x59b0ef8>
 c6e172c: 9100a260     	add	x0, x19, #0x28
 c6e1730: 94132f85     	bl	0xcbad544 <_ChromeMain+0xcba82a8>
 c6e1734: 910203e2     	add	x2, sp, #0x80
 c6e1738: d2800001     	mov	x1, #0x0                ; =0
 c6e173c: d2800003     	mov	x3, #0x0                ; =0
 c6e1740: 94132f84     	bl	0xcbad550 <_ChromeMain+0xcba82b4>
 c6e1744: 910203e0     	add	x0, sp, #0x80
 c6e1748: 94131443     	bl	0xcba6854 <_ChromeMain+0xcba15b8>
 c6e174c: 910003e0     	mov	x0, sp
 c6e1750: 94128456     	bl	0xcb828a8 <_ChromeMain+0xcb7d60c>
 c6e1754: 910cc3ff     	add	sp, sp, #0x330
 c6e1758: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 c6e175c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 c6e1760: d65f03c0     	ret
