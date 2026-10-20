
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4579dec: b0054c88     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4579df0: 91120108     	add	x8, x8, #0x480
 4579df4: f8bfc100     	ldapr	x0, [x8]
 4579df8: b40069e0     	cbz	x0, 0x457ab34 <_ChromeMain+0x4575898>
 4579dfc: 52806801     	mov	w1, #0x340              ; =832
 4579e00: d2800002     	mov	x2, #0x0                ; =0
 4579e04: 96ecc5eb     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4579e08: aa0003f5     	mov	x21, x0
 4579e0c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4579e10: 37fffe68     	tbnz	w8, #0x1f, 0x4579ddc <_ChromeMain+0x4574b40>
 4579e14: 3dc00be0     	ldr	q0, [sp, #0x20]
 4579e18: 3c9303a0     	stur	q0, [x29, #-0xd0]
 4579e1c: f9401be8     	ldr	x8, [sp, #0x30]
 4579e20: f81403a8     	stur	x8, [x29, #-0xc0]
 4579e24: b940ebf8     	ldr	w24, [sp, #0xe8]
 4579e28: aa1503e0     	mov	x0, x21
 4579e2c: 9737d4c5     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4579e30: d0050b08     	adrp	x8, 0xe6db000 <dyld_stub_binder+0xe6db000>
 4579e34: 91024108     	add	x8, x8, #0x90
 4579e38: 910fa109     	add	x9, x8, #0x3e8
 4579e3c: a90026a8     	stp	x8, x9, [x21]
 4579e40: 91104109     	add	x9, x8, #0x410
 4579e44: f9000aa9     	str	x9, [x21, #0x10]
 4579e48: 91112109     	add	x9, x8, #0x448
 4579e4c: 9111e10a     	add	x10, x8, #0x478
 4579e50: a906aaa9     	stp	x9, x10, [x21, #0x68]
 4579e54: 91132109     	add	x9, x8, #0x4c8
 4579e58: f9005aa9     	str	x9, [x21, #0xb0]
 4579e5c: 9114a109     	add	x9, x8, #0x528
 4579e60: aa1503f6     	mov	x22, x21
 4579e64: f80d8ec9     	str	x9, [x22, #0xd8]!
 4579e68: 91156108     	add	x8, x8, #0x558
 4579e6c: aa1503f7     	mov	x23, x21
 4579e70: f80f8ee8     	str	x8, [x23, #0xf8]!
 4579e74: 910c42a8     	add	x8, x21, #0x310
 4579e78: d10343a0     	sub	x0, x29, #0xd0
 4579e7c: 94003641     	bl	0x4587780 <_ChromeMain+0x45824e4>
 4579e80: b9032ab8     	str	w24, [x21, #0x328]
 4579e84: 52800188     	mov	w8, #0xc                ; =12
 4579e88: b9032ea8     	str	w8, [x21, #0x32c]
 4579e8c: d004ce68     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 4579e90: 3dc22d00     	ldr	q0, [x8, #0x8b0]
 4579e94: 3d80cea0     	str	q0, [x21, #0x330]
 4579e98: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 4579e9c: 340000a8     	cbz	w8, 0x4579eb0 <_ChromeMain+0x4574c14>
 4579ea0: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 4579ea4: 9106a6a1     	add	x1, x21, #0x1a9
 4579ea8: aa1703e0     	mov	x0, x23
 4579eac: 9726b849     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4579eb0: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 4579eb4: 36f800a8     	tbz	w8, #0x1f, 0x4579ec8 <_ChromeMain+0x4574c2c>
 4579eb8: f85303a0     	ldur	x0, [x29, #-0xd0]
 4579ebc: f85403a8     	ldur	x8, [x29, #-0xc0]
 4579ec0: d37ff901     	lsl	x1, x8, #1
 4579ec4: 96ea3bfd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4579ec8: d2c00108     	mov	x8, #0x800000000        ; =34359738368
 4579ecc: a93323bf     	stp	xzr, x8, [x29, #-0xd0]
 4579ed0: 90052461     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4579ed4: 91122021     	add	x1, x1, #0x488
 4579ed8: d10343a2     	sub	x2, x29, #0xd0
 4579edc: aa1603e0     	mov	x0, x22
 4579ee0: 97a22a28     	bl	0x2e04780 <_ChromeMain+0x2dff4e4>
 4579ee4: 3945a6a8     	ldrb	w8, [x21, #0x169]
 4579ee8: 350063a8     	cbnz	w8, 0x457ab5c <_ChromeMain+0x45758c0>
 4579eec: f940ce62     	ldr	x2, [x19, #0x198]
 4579ef0: aa1303e0     	mov	x0, x19
 4579ef4: aa1503e1     	mov	x1, x21
 4579ef8: 9707fd41     	bl	0x7793fc <_ChromeMain+0x774160>
