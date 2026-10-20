
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4684520: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 4684524: f9404709     	ldr	x9, [x24, #0x88]
 4684528: eb09011f     	cmp	x8, x9
 468452c: 54000061     	b.ne	0x4684538 <_ChromeMain+0x467f29c>
 4684530: aa1703e0     	mov	x0, x23
 4684534: 96e63f72     	bl	0x142fc <_ChromeMain+0xf060>
 4684538: f9027e77     	str	x23, [x19, #0x4f8]
 468453c: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4684540: f9404709     	ldr	x9, [x24, #0x88]
 4684544: eb09011f     	cmp	x8, x9
 4684548: 54000061     	b.ne	0x4684554 <_ChromeMain+0x467f2b8>
 468454c: aa1603e0     	mov	x0, x22
 4684550: 96e63f6b     	bl	0x142fc <_ChromeMain+0xf060>
 4684554: f9028276     	str	x22, [x19, #0x500]
 4684558: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 468455c: f9404709     	ldr	x9, [x24, #0x88]
 4684560: eb09011f     	cmp	x8, x9
 4684564: 54000061     	b.ne	0x4684570 <_ChromeMain+0x467f2d4>
 4684568: aa1503e0     	mov	x0, x21
 468456c: 96e63f64     	bl	0x142fc <_ChromeMain+0xf060>
 4684570: f9028675     	str	x21, [x19, #0x508]
 4684574: 3914e27f     	strb	wzr, [x19, #0x538]
 4684578: b905427f     	str	wzr, [x19, #0x540]
 468457c: f9028a7f     	str	xzr, [x19, #0x510]
 4684580: f902927f     	str	xzr, [x19, #0x520]
 4684584: f9028e7f     	str	xzr, [x19, #0x518]
 4684588: 3914a27f     	strb	wzr, [x19, #0x528]
