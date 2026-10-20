
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  114694: b40000a0     	cbz	x0, 0x1146a8 <_ChromeMain+0x10f40c>
  114698: d0073c01     	adrp	x1, 0xe896000 <dyld_stub_binder+0xe896000>
  11469c: 913ae021     	add	x1, x1, #0xeb8
  1146a0: 91056000     	add	x0, x0, #0x158
  1146a4: 14000002     	b	0x1146ac <_ChromeMain+0x10f410>
  1146a8: d65f03c0     	ret
  1146ac: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
  1146b0: a9017bfd     	stp	x29, x30, [sp, #0x10]
  1146b4: 910043fd     	add	x29, sp, #0x10
  1146b8: f8408c08     	ldr	x8, [x0, #0x8]!
  1146bc: d00754f4     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
  1146c0: b5000088     	cbnz	x8, 0x1146d0 <_ChromeMain+0x10f434>
  1146c4: 14000009     	b	0x1146e8 <_ChromeMain+0x10f44c>
  1146c8: f9400108     	ldr	x8, [x8]
  1146cc: b40000e8     	cbz	x8, 0x1146e8 <_ChromeMain+0x10f44c>
  1146d0: f9401109     	ldr	x9, [x8, #0x20]
  1146d4: eb09003f     	cmp	x1, x9
  1146d8: 54ffff83     	b.lo	0x1146c8 <_ChromeMain+0x10f42c>
  1146dc: 540001c0     	b.eq	0x114714 <_ChromeMain+0x10f478>
  1146e0: f9400508     	ldr	x8, [x8, #0x8]
  1146e4: b5ffff68     	cbnz	x8, 0x1146d0 <_ChromeMain+0x10f434>
  1146e8: d2800013     	mov	x19, #0x0               ; =0
  1146ec: 925e7668     	and	x8, x19, #0xfffffffc00000000
  1146f0: f9404689     	ldr	x9, [x20, #0x88]
  1146f4: eb09011f     	cmp	x8, x9
  1146f8: 54000061     	b.ne	0x114704 <_ChromeMain+0x10f468>
  1146fc: aa1303e0     	mov	x0, x19
  114700: 97fc38cf     	bl	0x22a3c <_ChromeMain+0x1d7a0>
  114704: aa1303e0     	mov	x0, x19
  114708: a9417bfd     	ldp	x29, x30, [sp, #0x10]
  11470c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
  114710: d65f03c0     	ret
  114714: eb00011f     	cmp	x8, x0
  114718: 54fffe80     	b.eq	0x1146e8 <_ChromeMain+0x10f44c>
  11471c: f9401513     	ldr	x19, [x8, #0x28]
  114720: 925e7668     	and	x8, x19, #0xfffffffc00000000
  114724: f9404689     	ldr	x9, [x20, #0x88]
  114728: eb09011f     	cmp	x8, x9
  11472c: 54fffe01     	b.ne	0x1146ec <_ChromeMain+0x10f450>
  114730: aa1303e0     	mov	x0, x19
  114734: 97fbfef2     	bl	0x142fc <_ChromeMain+0xf060>
  114738: 17ffffed     	b	0x1146ec <_ChromeMain+0x10f450>
