
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41290b0: aa1503f6     	mov	x22, x21
 41290b4: aa1603e0     	mov	x0, x22
 41290b8: 97c0e262     	bl	0x3161a40 <_ChromeMain+0x315c7a4>
 41290bc: b50002a0     	cbnz	x0, 0x4129110 <_ChromeMain+0x4123e74>
 41290c0: f940c6d6     	ldr	x22, [x22, #0x188]
 41290c4: b5ffff96     	cbnz	x22, 0x41290b4 <_ChromeMain+0x4123e18>
 41290c8: d2800017     	mov	x23, #0x0               ; =0
 41290cc: b40000f4     	cbz	x20, 0x41290e8 <_ChromeMain+0x4123e4c>
 41290d0: aa1403f8     	mov	x24, x20
 41290d4: aa1803e0     	mov	x0, x24
 41290d8: 97c0e25a     	bl	0x3161a40 <_ChromeMain+0x315c7a4>
 41290dc: b5000200     	cbnz	x0, 0x412911c <_ChromeMain+0x4123e80>
 41290e0: f940c718     	ldr	x24, [x24, #0x188]
 41290e4: b5ffff98     	cbnz	x24, 0x41290d4 <_ChromeMain+0x4123e38>
 41290e8: d2800016     	mov	x22, #0x0               ; =0
 41290ec: b4000055     	cbz	x21, 0x41290f4 <_ChromeMain+0x4123e58>
 41290f0: b4001057     	cbz	x23, 0x41292f8 <_ChromeMain+0x412405c>
 41290f4: b4000054     	cbz	x20, 0x41290fc <_ChromeMain+0x4123e60>
 41290f8: b4000f96     	cbz	x22, 0x41292e8 <_ChromeMain+0x412404c>
 41290fc: b5001857     	cbnz	x23, 0x4129404 <_ChromeMain+0x4124168>
 4129100: f10002df     	cmp	x22, #0x0
 4129104: fa5712c4     	ccmp	x22, x23, #0x4, ne
 4129108: 54000320     	b.eq	0x412916c <_ChromeMain+0x4123ed0>
 412910c: 14000080     	b	0x412930c <_ChromeMain+0x4124070>
 4129110: aa0003f7     	mov	x23, x0
 4129114: b4fffeb4     	cbz	x20, 0x41290e8 <_ChromeMain+0x4123e4c>
 4129118: 17ffffee     	b	0x41290d0 <_ChromeMain+0x4123e34>
 412911c: aa0003f6     	mov	x22, x0
 4129120: b4fffeb5     	cbz	x21, 0x41290f4 <_ChromeMain+0x4123e58>
 4129124: 17fffff3     	b	0x41290f0 <_ChromeMain+0x4123e54>
