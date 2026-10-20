
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4605e10: f81903bf     	stur	xzr, [x29, #-0x70]
 4605e14: aa1303e0     	mov	x0, x19
 4605e18: 96fe6c76     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4605e1c: aa0003e1     	mov	x1, x0
 4605e20: d101c3a8     	sub	x8, x29, #0x70
 4605e24: 9108c2a0     	add	x0, x21, #0x230
 4605e28: 97286d29     	bl	0x10212cc <_ChromeMain+0x101c030>
 4605e2c: d101c3a0     	sub	x0, x29, #0x70
 4605e30: 9771d860     	bl	0x227bfb0 <_ChromeMain+0x2276d14>
 4605e34: b4ffe3a0     	cbz	x0, 0x4605aa8 <_ChromeMain+0x460080c>
 4605e38: aa0003f8     	mov	x24, x0
 4605e3c: d2800019     	mov	x25, #0x0               ; =0
 4605e40: b9402808     	ldr	w8, [x0, #0x28]
 4605e44: 7100051f     	cmp	w8, #0x1
 4605e48: 54ffe32b     	b.lt	0x4605aac <_ChromeMain+0x4600810>
 4605e4c: b9402f09     	ldr	w9, [x24, #0x2c]
 4605e50: 7100053f     	cmp	w9, #0x1
 4605e54: 54ffe2cb     	b.lt	0x4605aac <_ChromeMain+0x4600810>
 4605e58: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4605e5c: f90013ff     	str	xzr, [sp, #0x20]
 4605e60: f81803bf     	stur	xzr, [x29, #-0x80]
 4605e64: 293127a8     	stp	w8, w9, [x29, #-0x78]
 4605e68: 52800600     	mov	w0, #0x30               ; =48
 4605e6c: 96e8253f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4605e70: b900001a     	str	w26, [x0]
 4605e74: d0fef2c8     	adrp	x8, 0x245f000 <_ChromeMain+0x2459d64>
 4605e78: 91050109     	add	x9, x8, #0x140
 4605e7c: b0fec148     	adrp	x8, 0x1e2e000 <_ChromeMain+0x1e28d64>
 4605e80: 913c0108     	add	x8, x8, #0xf00
 4605e84: a900a009     	stp	x9, x8, [x0, #0x8]
 4605e88: 90fefac8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4605e8c: 912c0109     	add	x9, x8, #0xb00
 4605e90: 10ef6188     	adr	x8, 0x45e4ac0 <_ChromeMain+0x45df824>
 4605e94: d503201f     	nop
 4605e98: a901a009     	stp	x9, x8, [x0, #0x18]
 4605e9c: f81703a0     	stur	x0, [x29, #-0x90]
 4605ea0: 381783ba     	sturb	w26, [x29, #-0x88]
 4605ea4: 910043e8     	add	x8, sp, #0x10
 4605ea8: d10203a2     	sub	x2, x29, #0x80
 4605eac: d10243a3     	sub	x3, x29, #0x90
 4605eb0: aa1803e0     	mov	x0, x24
 4605eb4: 52800101     	mov	w1, #0x8                ; =8
 4605eb8: 97f48852     	bl	0x4328000 <_ChromeMain+0x4322d64>
 4605ebc: 385783a8     	ldurb	w8, [x29, #-0x88]
 4605ec0: 34000068     	cbz	w8, 0x4605ecc <_ChromeMain+0x4600c30>
 4605ec4: f85703a0     	ldur	x0, [x29, #-0x90]
 4605ec8: b5000680     	cbnz	x0, 0x4605f98 <_ChromeMain+0x4600cfc>
 4605ecc: f9400fe8     	ldr	x8, [sp, #0x18]
 4605ed0: b40004c8     	cbz	x8, 0x4605f68 <_ChromeMain+0x4600ccc>
 4605ed4: f9400be0     	ldr	x0, [sp, #0x10]
 4605ed8: b9400018     	ldr	w24, [x0]
 4605edc: b40001e0     	cbz	x0, 0x4605f18 <_ChromeMain+0x4600c7c>
 4605ee0: f9400fe8     	ldr	x8, [sp, #0x18]
 4605ee4: d37ced09     	lsl	x9, x8, #4
 4605ee8: b4000109     	cbz	x9, 0x4605f08 <_ChromeMain+0x4600c6c>
 4605eec: cb0813e8     	neg	x8, x8, lsl #4
 4605ef0: 8b090009     	add	x9, x0, x9
 4605ef4: d1004129     	sub	x9, x9, #0x10
 4605ef8: b4ffc429     	cbz	x9, 0x460577c <_ChromeMain+0x46004e0>
 4605efc: d1004129     	sub	x9, x9, #0x10
