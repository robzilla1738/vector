
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3555a18: f8bfc2a0     	ldapr	x0, [x21]
 3555a1c: b4000660     	cbz	x0, 0x3555ae8 <_ChromeMain+0x355084c>
 3555a20: 5280ad01     	mov	w1, #0x568              ; =1384
 3555a24: d2800002     	mov	x2, #0x0                ; =0
 3555a28: 972d56e2     	bl	0xab5b0 <_ChromeMain+0xa6314>
 3555a2c: aa0003f4     	mov	x20, x0
 3555a30: f941a661     	ldr	x1, [x19, #0x348]
 3555a34: 52800022     	mov	w2, #0x1                ; =1
 3555a38: d2800003     	mov	x3, #0x0                ; =0
 3555a3c: 9433b071     	bl	0x4241c00 <_ChromeMain+0x423c964>
 3555a40: 3945a408     	ldrb	w8, [x0, #0x169]
 3555a44: 350005c8     	cbnz	w8, 0x3555afc <_ChromeMain+0x3550860>
 3555a48: f940ce62     	ldr	x2, [x19, #0x198]
 3555a4c: aa1303e0     	mov	x0, x19
 3555a50: aa1403e1     	mov	x1, x20
 3555a54: 97488e6a     	bl	0x7793fc <_ChromeMain+0x774160>
 3555a58: 925e7688     	and	x8, x20, #0xfffffffc00000000
 3555a5c: f9404709     	ldr	x9, [x24, #0x88]
 3555a60: eb09011f     	cmp	x8, x9
 3555a64: 54000061     	b.ne	0x3555a70 <_ChromeMain+0x35507d4>
 3555a68: aa1403e0     	mov	x0, x20
 3555a6c: 972afa24     	bl	0x142fc <_ChromeMain+0xf060>
 3555a70: f94002e0     	ldr	x0, [x23]
 3555a74: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3555a78: f9404709     	ldr	x9, [x24, #0x88]
 3555a7c: eb09011f     	cmp	x8, x9
 3555a80: 54000041     	b.ne	0x3555a88 <_ChromeMain+0x35507ec>
 3555a84: 972b33ee     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 3555a88: f901ae74     	str	x20, [x19, #0x358]
 3555a8c: 394ec261     	ldrb	w1, [x19, #0x3b0]
 3555a90: b903b661     	str	w1, [x19, #0x3b4]
 3555a94: aa1403e0     	mov	x0, x20
 3555a98: 97d84861     	bl	0x2b67c1c <_ChromeMain+0x2b62980>
