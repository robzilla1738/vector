
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46507d8: d100c3ff     	sub	sp, sp, #0x30
 46507dc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 46507e0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 46507e4: 910083fd     	add	x29, sp, #0x20
 46507e8: aa0003f3     	mov	x19, x0
 46507ec: f9450000     	ldr	x0, [x0, #0xa00]
 46507f0: b4000220     	cbz	x0, 0x4650834 <_ChromeMain+0x464b598>
 46507f4: b9400828     	ldr	w8, [x1, #0x8]
 46507f8: 7100191f     	cmp	w8, #0x6
 46507fc: 540001c8     	b.hi	0x4650834 <_ChromeMain+0x464b598>
 4650800: 52800a89     	mov	w9, #0x54               ; =84
 4650804: 1ac82528     	lsr	w8, w9, w8
 4650808: 36000168     	tbz	w8, #0x0, 0x4650834 <_ChromeMain+0x464b598>
 465080c: f9400008     	ldr	x8, [x0]
 4650810: f9400908     	ldr	x8, [x8, #0x10]
 4650814: d63f0100     	blr	x8
 4650818: f90007e0     	str	x0, [sp, #0x8]
 465081c: 910023e1     	add	x1, sp, #0x8
 4650820: aa1303e0     	mov	x0, x19
 4650824: 97fffeca     	bl	0x465034c <_ChromeMain+0x464b0b0>
 4650828: aa0003e1     	mov	x1, x0
 465082c: aa1303e0     	mov	x0, x19
 4650830: 97ffff34     	bl	0x4650500 <_ChromeMain+0x464b264>
 4650834: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4650838: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 465083c: 9100c3ff     	add	sp, sp, #0x30
 4650840: d65f03c0     	ret
 4650844: aa0003e8     	mov	x8, x0
 4650848: f9424c00     	ldr	x0, [x0, #0x498]
 465084c: b4000320     	cbz	x0, 0x46508b0 <_ChromeMain+0x464b614>
 4650850: b9400829     	ldr	w9, [x1, #0x8]
 4650854: 7100193f     	cmp	w9, #0x6
 4650858: 540002c8     	b.hi	0x46508b0 <_ChromeMain+0x464b614>
 465085c: 52800a8a     	mov	w10, #0x54              ; =84
 4650860: 1ac92549     	lsr	w9, w10, w9
 4650864: 36000269     	tbz	w9, #0x0, 0x46508b0 <_ChromeMain+0x464b614>
 4650868: d100c3ff     	sub	sp, sp, #0x30
 465086c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4650870: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4650874: 910083fd     	add	x29, sp, #0x20
 4650878: d115a113     	sub	x19, x8, #0x568
 465087c: f9400008     	ldr	x8, [x0]
 4650880: f9400908     	ldr	x8, [x8, #0x10]
 4650884: d63f0100     	blr	x8
 4650888: f90007e0     	str	x0, [sp, #0x8]
 465088c: 910023e1     	add	x1, sp, #0x8
 4650890: aa1303e0     	mov	x0, x19
 4650894: 97fffeae     	bl	0x465034c <_ChromeMain+0x464b0b0>
 4650898: aa0003e1     	mov	x1, x0
 465089c: aa1303e0     	mov	x0, x19
 46508a0: 97ffff18     	bl	0x4650500 <_ChromeMain+0x464b264>
 46508a4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 46508a8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 46508ac: 9100c3ff     	add	sp, sp, #0x30
 46508b0: d65f03c0     	ret
