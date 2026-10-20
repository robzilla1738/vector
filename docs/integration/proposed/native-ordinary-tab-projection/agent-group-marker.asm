
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4127680: d100c3ff     	sub	sp, sp, #0x30
 4127684: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4127688: a9027bfd     	stp	x29, x30, [sp, #0x20]
 412768c: 910083fd     	add	x29, sp, #0x20
 4127690: b940e009     	ldr	w9, [x0, #0xe0]
 4127694: 71000d3f     	cmp	w9, #0x3
 4127698: 540000e0     	b.eq	0x41276b4 <_ChromeMain+0x4122418>
 412769c: 52800008     	mov	w8, #0x0                ; =0
 41276a0: 12000100     	and	w0, w8, #0x1
 41276a4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 41276a8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 41276ac: 9100c3ff     	add	sp, sp, #0x30
 41276b0: d65f03c0     	ret
 41276b4: aa0003e8     	mov	x8, x0
 41276b8: 390003ff     	strb	wzr, [sp]
 41276bc: 52801fe9     	mov	w9, #0xff               ; =255
 41276c0: 390023e9     	strb	w9, [sp, #0x8]
 41276c4: 910003e0     	mov	x0, sp
 41276c8: 9103c101     	add	x1, x8, #0xf0
 41276cc: 94b35c62     	bl	0x6dfe854 <_ChromeMain+0x6df95b8>
 41276d0: 394023e8     	ldrb	w8, [sp, #0x8]
 41276d4: 7100051f     	cmp	w8, #0x1
 41276d8: 54000201     	b.ne	0x4127718 <_ChromeMain+0x412247c>
 41276dc: f94003f3     	ldr	x19, [sp]
 41276e0: 925e7668     	and	x8, x19, #0xfffffffc00000000
 41276e4: f0055449     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41276e8: f9404529     	ldr	x9, [x9, #0x88]
 41276ec: eb09011f     	cmp	x8, x9
 41276f0: 54000061     	b.ne	0x41276fc <_ChromeMain+0x4122460>
 41276f4: aa1303e0     	mov	x0, x19
 41276f8: 96fbfcd3     	bl	0x26a44 <_ChromeMain+0x217a8>
 41276fc: b40001f3     	cbz	x19, 0x4127738 <_ChromeMain+0x412249c>
 4127700: f9404a68     	ldr	x8, [x19, #0x90]
 4127704: b4fffce8     	cbz	x8, 0x41276a0 <_ChromeMain+0x4122404>
 4127708: f9405d08     	ldr	x8, [x8, #0xb8]
 412770c: b4fffca8     	cbz	x8, 0x41276a0 <_ChromeMain+0x4122404>
 4127710: 39404508     	ldrb	w8, [x8, #0x11]
 4127714: 17ffffe3     	b	0x41276a0 <_ChromeMain+0x4122404>
 4127718: 7103fd1f     	cmp	w8, #0xff
 412771c: 54000081     	b.ne	0x412772c <_ChromeMain+0x4122490>
 4127720: b004b5e0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4127724: 913be000     	add	x0, x0, #0xef8
 4127728: 942bfeda     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 412772c: b004b5e0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4127730: 913c6000     	add	x0, x0, #0xf18
 4127734: 942bfed7     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 4127738: d4200000     	brk	#0
 412773c: d4400000     	hlt	#0
 4127740: d4200020     	brk	#0x1
