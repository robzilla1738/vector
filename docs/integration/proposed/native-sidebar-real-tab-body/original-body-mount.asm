
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e0cd4: f8bfc320     	ldapr	x0, [x25]
 37e0cd8: b4023ce0     	cbz	x0, 0x37e5474 <_ChromeMain+0x37e01d8>
 37e0cdc: 5280a601     	mov	w1, #0x530              ; =1328
 37e0ce0: d2800002     	mov	x2, #0x0                ; =0
 37e0ce4: 97232a33     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e0ce8: aa0003f4     	mov	x20, x0
 37e0cec: 94299235     	bl	0x42455c0 <_ChromeMain+0x4240324>
 37e0cf0: 3945a408     	ldrb	w8, [x0, #0x169]
 37e0cf4: 35024448     	cbnz	w8, 0x37e557c <_ChromeMain+0x37e02e0>
 37e0cf8: f940ce62     	ldr	x2, [x19, #0x198]
 37e0cfc: aa1303e0     	mov	x0, x19
 37e0d00: aa1403e1     	mov	x1, x20
 37e0d04: 973e61be     	bl	0x7793fc <_ChromeMain+0x774160>
 37e0d08: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e0d0c: f9404789     	ldr	x9, [x28, #0x88]
 37e0d10: eb09011f     	cmp	x8, x9
 37e0d14: 54000061     	b.ne	0x37e0d20 <_ChromeMain+0x37dba84>
 37e0d18: aa1403e0     	mov	x0, x20
 37e0d1c: 9720cd78     	bl	0x142fc <_ChromeMain+0xf060>
 37e0d20: f942da60     	ldr	x0, [x19, #0x5b0]
 37e0d24: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e0d28: f9404789     	ldr	x9, [x28, #0x88]
 37e0d2c: eb09011f     	cmp	x8, x9
 37e0d30: 54000041     	b.ne	0x37e0d38 <_ChromeMain+0x37dba9c>
 37e0d34: 97210742     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e0d38: f902da74     	str	x20, [x19, #0x5b0]
 37e0d3c: aa1403e0     	mov	x0, x20
 37e0d40: 52800021     	mov	w1, #0x1                ; =1
 37e0d44: 95bb1ba2     	bl	0xa6a7bcc <_ChromeMain+0xa6a2930>
 37e0d48: f942da60     	ldr	x0, [x19, #0x5b0]
 37e0d4c: b9438c08     	ldr	w8, [x0, #0x38c]
 37e0d50: 35000068     	cbnz	w8, 0x37e0d5c <_ChromeMain+0x37dbac0>
 37e0d54: b9439008     	ldr	w8, [x0, #0x390]
 37e0d58: 340000e8     	cbz	w8, 0x37e0d74 <_ChromeMain+0x37dbad8>
 37e0d5c: 910e3008     	add	x8, x0, #0x38c
 37e0d60: f900011f     	str	xzr, [x8]
 37e0d64: f9400008     	ldr	x8, [x0]
 37e0d68: f9418508     	ldr	x8, [x8, #0x308]
 37e0d6c: d63f0100     	blr	x8
 37e0d70: f942da60     	ldr	x0, [x19, #0x5b0]
 37e0d74: 3901c3ff     	strb	wzr, [sp, #0x70]
 37e0d78: 3901e3ff     	strb	wzr, [sp, #0x78]
 37e0d7c: 9101c3e1     	add	x1, sp, #0x70
 37e0d80: 95bb1410     	bl	0xa6a5dc0 <_ChromeMain+0xa6a0b24>
 37e0d84: f942da60     	ldr	x0, [x19, #0x5b0]
 37e0d88: 52800001     	mov	w1, #0x0                ; =0
 37e0d8c: 95bb1493     	bl	0xa6a5fd8 <_ChromeMain+0xa6a0d3c>
 37e0d90: f8bfc320     	ldapr	x0, [x25]
 37e0d94: b4023740     	cbz	x0, 0x37e547c <_ChromeMain+0x37e01e0>
 37e0d98: 52808301     	mov	w1, #0x418              ; =1048
 37e0d9c: d2800002     	mov	x2, #0x0                ; =0
 37e0da0: 97232a04     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e0da4: aa0003f4     	mov	x20, x0
 37e0da8: f9442661     	ldr	x1, [x19, #0x848]
 37e0dac: 951f56a5     	bl	0x7fb6840 <_ChromeMain+0x7fb15a4>
 37e0db0: 39502408     	ldrb	w8, [x0, #0x409]
 37e0db4: 34000188     	cbz	w8, 0x37e0de4 <_ChromeMain+0x37dbb48>
 37e0db8: 3910269f     	strb	wzr, [x20, #0x409]
 37e0dbc: f941ae80     	ldr	x0, [x20, #0x358]
 37e0dc0: f9400008     	ldr	x8, [x0]
 37e0dc4: f9405108     	ldr	x8, [x8, #0xa0]
 37e0dc8: 52800001     	mov	w1, #0x0                ; =0
 37e0dcc: d63f0100     	blr	x8
 37e0dd0: aa1403e0     	mov	x0, x20
 37e0dd4: 52800001     	mov	w1, #0x0                ; =0
 37e0dd8: 97393da7     	bl	0x630474 <_ChromeMain+0x62b1d8>
 37e0ddc: aa1403e0     	mov	x0, x20
 37e0de0: 973700e7     	bl	0x5a117c <_ChromeMain+0x59bee0>
 37e0de4: f942da60     	ldr	x0, [x19, #0x5b0]
 37e0de8: aa1403e1     	mov	x1, x20
 37e0dec: 95bb1641     	bl	0xa6a66f0 <_ChromeMain+0xa6a1454>
 37e0df0: f942da60     	ldr	x0, [x19, #0x5b0]
 37e0df4: 52800048     	mov	w8, #0x2                ; =2
 37e0df8: b9044008     	str	w8, [x0, #0x440]
 37e0dfc: 9430224e     	bl	0x43e9734 <_ChromeMain+0x43e4498>
