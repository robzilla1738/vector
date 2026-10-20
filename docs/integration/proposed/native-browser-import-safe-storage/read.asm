
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 8919474: d101c3ff     	sub	sp, sp, #0x70
 8919478: a9035ff8     	stp	x24, x23, [sp, #0x30]
 891947c: a90457f6     	stp	x22, x21, [sp, #0x40]
 8919480: a9054ff4     	stp	x20, x19, [sp, #0x50]
 8919484: a9067bfd     	stp	x29, x30, [sp, #0x60]
 8919488: 910183fd     	add	x29, sp, #0x60
 891948c: aa0103e0     	mov	x0, x1
 8919490: aa0803f4     	mov	x20, x8
 8919494: 910083e8     	add	x8, sp, #0x20
 8919498: aa0203e1     	mov	x1, x2
 891949c: aa0303e2     	mov	x2, x3
 89194a0: aa0403e3     	mov	x3, x4
 89194a4: 97fffece     	bl	0x8918fdc <_ChromeMain+0x8913d40>
 89194a8: f9000fff     	str	xzr, [sp, #0x18]
 89194ac: f94013f3     	ldr	x19, [sp, #0x20]
 89194b0: 910063e1     	add	x1, sp, #0x18
 89194b4: aa1303e0     	mov	x0, x19
 89194b8: 950a7834     	bl	0xcbb7588 <dyld_stub_binder+0xcbb7588>
 89194bc: 34000200     	cbz	w0, 0x89194fc <_ChromeMain+0x8914260>
 89194c0: 52800028     	mov	w8, #0x1                ; =1
 89194c4: 39000288     	strb	w8, [x20]
 89194c8: b9000a80     	str	w0, [x20, #0x8]
 89194cc: f9400fe0     	ldr	x0, [sp, #0x18]
 89194d0: b4000040     	cbz	x0, 0x89194d8 <_ChromeMain+0x891423c>
 89194d4: 950a7107     	bl	0xcbb58f0 <dyld_stub_binder+0xcbb58f0>
 89194d8: b4000073     	cbz	x19, 0x89194e4 <_ChromeMain+0x8914248>
 89194dc: aa1303e0     	mov	x0, x19
 89194e0: 950a7104     	bl	0xcbb58f0 <dyld_stub_binder+0xcbb58f0>
 89194e4: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 89194e8: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 89194ec: a94457f6     	ldp	x22, x21, [sp, #0x40]
 89194f0: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 89194f4: 9101c3ff     	add	sp, sp, #0x70
 89194f8: d65f03c0     	ret
 89194fc: f9400fe8     	ldr	x8, [sp, #0x18]
 8919500: f90003e8     	str	x8, [sp]
 8919504: 910003e0     	mov	x0, sp
 8919508: 96e6d4fd     	bl	0x42ce8fc <_ChromeMain+0x42c9660>
 891950c: 9002b888     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 8919510: f9476908     	ldr	x8, [x8, #0xed0]
 8919514: f9400101     	ldr	x1, [x8]
 8919518: 97ab1e74     	bl	0x73e0ee8 <_ChromeMain+0x73dbc4c>
 891951c: 96863ebf     	bl	0x2aa9018 <_ChromeMain+0x2aa3d7c>
 8919520: aa0103f5     	mov	x21, x1
 8919524: b40002a1     	cbz	x1, 0x8919578 <_ChromeMain+0x89142dc>
 8919528: b7f802f5     	tbnz	x21, #0x3f, 0x8919584 <_ChromeMain+0x89142e8>
 891952c: aa0003f6     	mov	x22, x0
 8919530: aa1503e0     	mov	x0, x21
 8919534: 9509a4c2     	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 8919538: aa0003f7     	mov	x23, x0
 891953c: 8b1502c8     	add	x8, x22, x21
 8919540: cb160118     	sub	x24, x8, x22
 8919544: aa1603e1     	mov	x1, x22
 8919548: aa1803e2     	mov	x2, x24
 891954c: 950a7077     	bl	0xcbb5728 <dyld_stub_binder+0xcbb5728>
 8919550: 3900029f     	strb	wzr, [x20]
 8919554: a900e297     	stp	x23, x24, [x20, #0x8]
 8919558: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 891955c: f90003ff     	str	xzr, [sp]
 8919560: f9000e95     	str	x21, [x20, #0x18]
 8919564: 910003e8     	mov	x8, sp
 8919568: f90017e8     	str	x8, [sp, #0x28]
 891956c: 9100a3e0     	add	x0, sp, #0x28
 8919570: 96262296     	bl	0x12a1fc8 <_ChromeMain+0x129cd2c>
 8919574: 17ffffd6     	b	0x89194cc <_ChromeMain+0x8914230>
 8919578: d2800018     	mov	x24, #0x0               ; =0
 891957c: d2800017     	mov	x23, #0x0               ; =0
 8919580: 17fffff4     	b	0x8919550 <_ChromeMain+0x89142b4>
 8919584: 9657e9ff     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 8919588: 1400000d     	b	0x89195bc <_ChromeMain+0x8914320>
 891958c: 14000003     	b	0x8919598 <_ChromeMain+0x89142fc>
 8919590: 14000002     	b	0x8919598 <_ChromeMain+0x89142fc>
 8919594: 14000001     	b	0x8919598 <_ChromeMain+0x89142fc>
 8919598: aa0003f4     	mov	x20, x0
 891959c: f9400fe0     	ldr	x0, [sp, #0x18]
 89195a0: b4000040     	cbz	x0, 0x89195a8 <_ChromeMain+0x891430c>
 89195a4: 950a70d3     	bl	0xcbb58f0 <dyld_stub_binder+0xcbb58f0>
 89195a8: b4000073     	cbz	x19, 0x89195b4 <_ChromeMain+0x8914318>
 89195ac: aa1303e0     	mov	x0, x19
 89195b0: 950a70d0     	bl	0xcbb58f0 <dyld_stub_binder+0xcbb58f0>
 89195b4: aa1403e0     	mov	x0, x20
 89195b8: 950a7068     	bl	0xcbb5758 <dyld_stub_binder+0xcbb5758>
 89195bc: d4200020     	brk	#0x1
