
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4216dfc: d105c3ff     	sub	sp, sp, #0x170
 4216e00: a9116ffc     	stp	x28, x27, [sp, #0x110]
 4216e04: a91267fa     	stp	x26, x25, [sp, #0x120]
 4216e08: a9135ff8     	stp	x24, x23, [sp, #0x130]
 4216e0c: a91457f6     	stp	x22, x21, [sp, #0x140]
 4216e10: a9154ff4     	stp	x20, x19, [sp, #0x150]
 4216e14: a9167bfd     	stp	x29, x30, [sp, #0x160]
 4216e18: 910583fd     	add	x29, sp, #0x160
 4216e1c: aa0703f5     	mov	x21, x7
 4216e20: aa0603f8     	mov	x24, x6
 4216e24: aa0503f7     	mov	x23, x5
 4216e28: aa0403fb     	mov	x27, x4
 4216e2c: aa0303fc     	mov	x28, x3
 4216e30: aa0203fa     	mov	x26, x2
 4216e34: f90043e1     	str	x1, [sp, #0x80]
 4216e38: aa0003f6     	mov	x22, x0
 4216e3c: f94017a8     	ldr	x8, [x29, #0x28]
 4216e40: f9004be8     	str	x8, [sp, #0x90]
 4216e44: f94013a8     	ldr	x8, [x29, #0x20]
 4216e48: f90047e8     	str	x8, [sp, #0x88]
 4216e4c: f9400fa8     	ldr	x8, [x29, #0x18]
 4216e50: f9003be8     	str	x8, [sp, #0x70]
 4216e54: f9400ba8     	ldr	x8, [x29, #0x10]
 4216e58: f9003fe8     	str	x8, [sp, #0x78]
 4216e5c: f9401bb4     	ldr	x20, [x29, #0x30]
 4216e60: b4000974     	cbz	x20, 0x4216f8c <_ChromeMain+0x4211cf0>
 4216e64: f90037fa     	str	x26, [sp, #0x68]
 4216e68: 97b5d3b6     	bl	0x2f8bd40 <_ChromeMain+0x2f86aa4>
 4216e6c: 52800028     	mov	w8, #0x1                ; =1
 4216e70: 39000008     	strb	w8, [x0]
 4216e74: 52800100     	mov	w0, #0x8                ; =8
 4216e78: 96f7e13c     	bl	0xf368 <_ChromeMain+0xa0cc>
 4216e7c: aa0003f3     	mov	x19, x0
 4216e80: f900001f     	str	xzr, [x0]
 4216e84: f94002c0     	ldr	x0, [x22]
 4216e88: 951154a1     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4216e8c: aa0003f9     	mov	x25, x0
 4216e90: aa1303e0     	mov	x0, x19
 4216e94: aa1903e1     	mov	x1, x25
 4216e98: 9511549a     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4216e9c: aa1903e0     	mov	x0, x25
 4216ea0: 94f7b22f     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4216ea4: f94006da     	ldr	x26, [x22, #0x8]
 4216ea8: aa1303e0     	mov	x0, x19
 4216eac: 95115498     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4216eb0: aa0003f6     	mov	x22, x0
 4216eb4: 94f7b22a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4216eb8: b40008d6     	cbz	x22, 0x4216fd0 <_ChromeMain+0x4211d34>
 4216ebc: 52800100     	mov	w0, #0x8                ; =8
 4216ec0: 96f7e12a     	bl	0xf368 <_ChromeMain+0xa0cc>
 4216ec4: aa0003f6     	mov	x22, x0
 4216ec8: f900001f     	str	xzr, [x0]
 4216ecc: f81703a0     	stur	x0, [x29, #-0x90]
 4216ed0: aa1303e0     	mov	x0, x19
 4216ed4: 9511548e     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4216ed8: aa0003f9     	mov	x25, x0
 4216edc: aa1603e0     	mov	x0, x22
 4216ee0: aa1903e1     	mov	x1, x25
 4216ee4: 95115487     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4216ee8: aa1903e0     	mov	x0, x25
 4216eec: 94f7b21c     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4216ef0: f81783ba     	stur	x26, [x29, #-0x88]
 4216ef4: d10243a0     	sub	x0, x29, #0x90
 4216ef8: a948a7ea     	ldp	x10, x9, [sp, #0x88]
 4216efc: a901d3e9     	stp	x9, x20, [sp, #0x18]
 4216f00: a94723e9     	ldp	x9, x8, [sp, #0x70]
 4216f04: a900abe9     	stp	x9, x10, [sp, #0x8]
 4216f08: f90003e8     	str	x8, [sp]
 4216f0c: f94043e1     	ldr	x1, [sp, #0x80]
 4216f10: f94037e2     	ldr	x2, [sp, #0x68]
 4216f14: aa1c03e3     	mov	x3, x28
 4216f18: aa1b03e4     	mov	x4, x27
 4216f1c: aa1703e5     	mov	x5, x23
 4216f20: aa1803e6     	mov	x6, x24
 4216f24: aa1503e7     	mov	x7, x21
 4216f28: 97fced32     	bl	0x41523f0 <_ChromeMain+0x414d154>
 4216f2c: f85703b4     	ldur	x20, [x29, #-0x90]
 4216f30: f81703bf     	stur	xzr, [x29, #-0x90]
 4216f34: b40000d4     	cbz	x20, 0x4216f4c <_ChromeMain+0x4211cb0>
 4216f38: aa1403e0     	mov	x0, x20
 4216f3c: 95115477     	bl	0x866c118 <_ChromeMain+0x8666e7c>
