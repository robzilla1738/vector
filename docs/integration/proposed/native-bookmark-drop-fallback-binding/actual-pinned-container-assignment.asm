
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41278c0: f9400268     	ldr	x8, [x19]
 41278c4: f9402d08     	ldr	x8, [x8, #0x58]
 41278c8: aa1303e0     	mov	x0, x19
 41278cc: d63f0100     	blr	x8
 41278d0: aa0003f5     	mov	x21, x0
 41278d4: 94ddda07     	bl	0x789e0f0 <_ChromeMain+0x7898e54>
 41278d8: f10002bf     	cmp	x21, #0x0
 41278dc: 1a9f07e8     	cset	w8, ne
 41278e0: eb0002bf     	cmp	x21, x0
 41278e4: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 41278e8: 540000c0     	b.eq	0x4127900 <_ChromeMain+0x4122664>
 41278ec: f94026b5     	ldr	x21, [x21, #0x48]
 41278f0: f10002bf     	cmp	x21, #0x0
 41278f4: 1a9f07e8     	cset	w8, ne
 41278f8: fa4012a4     	ccmp	x21, x0, #0x4, ne
 41278fc: 54ffff81     	b.ne	0x41278ec <_ChromeMain+0x4122650>
 4127900: 360009c8     	tbz	w8, #0x0, 0x4127a38 <_ChromeMain+0x412279c>
 4127904: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4127908: f0055455     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 412790c: f94046a9     	ldr	x9, [x21, #0x88]
 4127910: eb09011f     	cmp	x8, x9
 4127914: 54000061     	b.ne	0x4127920 <_ChromeMain+0x4122684>
 4127918: aa1303e0     	mov	x0, x19
 412791c: 96fbb278     	bl	0x142fc <_ChromeMain+0xf060>
 4127920: f9419e80     	ldr	x0, [x20, #0x338]
 4127924: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4127928: f94046a9     	ldr	x9, [x21, #0x88]
 412792c: eb09011f     	cmp	x8, x9
 4127930: 54000041     	b.ne	0x4127938 <_ChromeMain+0x412269c>
 4127934: 96fbec42     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4127938: f9019e93     	str	x19, [x20, #0x338]
 412793c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4127940: f94046a9     	ldr	x9, [x21, #0x88]
 4127944: eb09011f     	cmp	x8, x9
 4127948: 54000061     	b.ne	0x4127954 <_ChromeMain+0x41226b8>
 412794c: aa1403e0     	mov	x0, x20
 4127950: 96fbb26b     	bl	0x142fc <_ChromeMain+0xf060>
 4127954: f942ba60     	ldr	x0, [x19, #0x570]
 4127958: 925e7408     	and	x8, x0, #0xfffffffc00000000
 412795c: f94046a9     	ldr	x9, [x21, #0x88]
 4127960: eb09011f     	cmp	x8, x9
 4127964: 54000041     	b.ne	0x412796c <_ChromeMain+0x41226d0>
 4127968: 96fbec35     	bl	0x22a3c <_ChromeMain+0x1d7a0>
