
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4105c18: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4105c1c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4105c20: 910043fd     	add	x29, sp, #0x10
 4105c24: d120c3ff     	sub	sp, sp, #0x830
 4105c28: 3945a008     	ldrb	w8, [x0, #0x168]
 4105c2c: 37000328     	tbnz	w8, #0x0, 0x4105c90 <_ChromeMain+0x41009f4>
 4105c30: aa0003f3     	mov	x19, x0
 4105c34: b940e808     	ldr	w8, [x0, #0xe8]
 4105c38: 7100091f     	cmp	w8, #0x2
 4105c3c: 54000321     	b.ne	0x4105ca0 <_ChromeMain+0x4100a04>
 4105c40: aa1303e0     	mov	x0, x19
 4105c44: a9c72408     	ldp	x8, x9, [x0, #0x70]!
 4105c48: f940080a     	ldr	x10, [x0, #0x10]
 4105c4c: eb0a013f     	cmp	x9, x10
 4105c50: 54000400     	b.eq	0x4105cd0 <_ChromeMain+0x4100a34>
 4105c54: 52802f0a     	mov	w10, #0x178             ; =376
 4105c58: 9b0a2120     	madd	x0, x9, x10, x8
 4105c5c: b4000380     	cbz	x0, 0x4105ccc <_ChromeMain+0x4100a30>
 4105c60: 97fe4bc3     	bl	0x4098b6c <_ChromeMain+0x40938d0>
 4105c64: 9105e000     	add	x0, x0, #0x178
 4105c68: f9403a68     	ldr	x8, [x19, #0x70]
 4105c6c: eb080008     	subs	x8, x0, x8
 4105c70: 9343fd08     	asr	x8, x8, #3
 4105c74: d288d9e9     	mov	x9, #0x46cf             ; =18127
 4105c78: f2acefa9     	movk	x9, #0x677d, lsl #16
 4105c7c: f2d7d469     	movk	x9, #0xbea3, lsl #32
 4105c80: f2ea3669     	movk	x9, #0x51b3, lsl #48
 4105c84: 9b097d08     	mul	x8, x8, x9
 4105c88: f9003e68     	str	x8, [x19, #0x78]
 4105c8c: 54000200     	b.eq	0x4105ccc <_ChromeMain+0x4100a30>
 4105c90: 9120c3ff     	add	sp, sp, #0x830
 4105c94: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4105c98: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4105c9c: d65f03c0     	ret
 4105ca0: f940b268     	ldr	x8, [x19, #0x160]
 4105ca4: f9400913     	ldr	x19, [x8, #0x10]
 4105ca8: 910003e8     	mov	x8, sp
 4105cac: aa0103e0     	mov	x0, x1
 4105cb0: 94dc7154     	bl	0x7822200 <_ChromeMain+0x781cf64>
 4105cb4: 910003e1     	mov	x1, sp
 4105cb8: aa1303e0     	mov	x0, x19
 4105cbc: 940002ca     	bl	0x41067e4 <_ChromeMain+0x4101548>
 4105cc0: 910003e0     	mov	x0, sp
 4105cc4: 94b18d96     	bl	0x6d6931c <_ChromeMain+0x6d64080>
 4105cc8: 17fffff2     	b	0x4105c90 <_ChromeMain+0x41009f4>
 4105ccc: d4200020     	brk	#0x1
 4105cd0: 940000ce     	bl	0x4106008 <_ChromeMain+0x4100d6c>
 4105cd4: 17ffffe5     	b	0x4105c68 <_ChromeMain+0x41009cc>
 4105cd8: 3945a008     	ldrb	w8, [x0, #0x168]
 4105cdc: 370000a8     	tbnz	w8, #0x0, 0x4105cf0 <_ChromeMain+0x4100a54>
 4105ce0: 52800028     	mov	w8, #0x1                ; =1
 4105ce4: 3905a408     	strb	w8, [x0, #0x169]
 4105ce8: 3905a801     	strb	w1, [x0, #0x16a]
 4105cec: b9016c02     	str	w2, [x0, #0x16c]
 4105cf0: d65f03c0     	ret
 4105cf4: d10103ff     	sub	sp, sp, #0x40
 4105cf8: a90157f6     	stp	x22, x21, [sp, #0x10]
 4105cfc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4105d00: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4105d04: 9100c3fd     	add	x29, sp, #0x30
 4105d08: aa0003f3     	mov	x19, x0
 4105d0c: f0050548     	adrp	x8, 0xe1b0000 <dyld_stub_binder+0xe1b0000>
 4105d10: 9107e108     	add	x8, x8, #0x1f8
 4105d14: f9000008     	str	x8, [x0]
 4105d18: 91072000     	add	x0, x0, #0x1c8
 4105d1c: 9710b2bd     	bl	0x532810 <_ChromeMain+0x52d574>
