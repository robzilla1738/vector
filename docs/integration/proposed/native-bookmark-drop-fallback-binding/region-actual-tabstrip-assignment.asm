
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c75ee84: a90357f6     	stp	x22, x21, [sp, #0x30]
 c75ee88: a9044ff4     	stp	x20, x19, [sp, #0x40]
 c75ee8c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 c75ee90: 910143fd     	add	x29, sp, #0x50
 c75ee94: b4000d01     	cbz	x1, 0xc75f034 <_ChromeMain+0xc759d98>
 c75ee98: aa0103f4     	mov	x20, x1
 c75ee9c: aa0003f3     	mov	x19, x0
 c75eea0: f9400028     	ldr	x8, [x1]
 c75eea4: f9402d08     	ldr	x8, [x8, #0x58]
 c75eea8: aa0103e0     	mov	x0, x1
 c75eeac: d63f0100     	blr	x8
 c75eeb0: aa0003f5     	mov	x21, x0
 c75eeb4: 96c53399     	bl	0x78abd18 <_ChromeMain+0x78a6a7c>
 c75eeb8: f10002bf     	cmp	x21, #0x0
 c75eebc: 1a9f07e8     	cset	w8, ne
 c75eec0: eb0002bf     	cmp	x21, x0
 c75eec4: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 c75eec8: 540000c0     	b.eq	0xc75eee0 <_ChromeMain+0xc759c44>
 c75eecc: f94026b5     	ldr	x21, [x21, #0x48]
 c75eed0: f10002bf     	cmp	x21, #0x0
 c75eed4: 1a9f07e8     	cset	w8, ne
 c75eed8: fa4012a4     	ccmp	x21, x0, #0x4, ne
 c75eedc: 54ffff81     	b.ne	0xc75eecc <_ChromeMain+0xc759c30>
 c75eee0: 36000aa8     	tbz	w8, #0x0, 0xc75f034 <_ChromeMain+0xc759d98>
 c75eee4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 c75eee8: 900122b5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 c75eeec: f94046a9     	ldr	x9, [x21, #0x88]
 c75eef0: eb09011f     	cmp	x8, x9
 c75eef4: 54000061     	b.ne	0xc75ef00 <_ChromeMain+0xc759c64>
 c75eef8: aa1403e0     	mov	x0, x20
 c75eefc: 94108e53     	bl	0xcb82848 <_ChromeMain+0xcb7d5ac>
 c75ef00: f9423e60     	ldr	x0, [x19, #0x478]
 c75ef04: 925e7408     	and	x8, x0, #0xfffffffc00000000
 c75ef08: f94046a9     	ldr	x9, [x21, #0x88]
 c75ef0c: eb09011f     	cmp	x8, x9
 c75ef10: 54000041     	b.ne	0xc75ef18 <_ChromeMain+0xc759c7c>
 c75ef14: 94108e5c     	bl	0xcb82884 <_ChromeMain+0xcb7d5e8>
 c75ef18: f9023e74     	str	x20, [x19, #0x478]
 c75ef1c: 3945a688     	ldrb	w8, [x20, #0x169]
 c75ef20: 35000848     	cbnz	w8, 0xc75f028 <_ChromeMain+0xc759d8c>
 c75ef24: f940ce62     	ldr	x2, [x19, #0x198]
 c75ef28: aa1303e0     	mov	x0, x19
 c75ef2c: aa1403e1     	mov	x1, x20
 c75ef30: 9410bab9     	bl	0xcb8da14 <_ChromeMain+0xcb88778>
 c75ef34: f9423e74     	ldr	x20, [x19, #0x478]
