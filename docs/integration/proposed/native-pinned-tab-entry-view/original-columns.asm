
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4608d00: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 4608d04: a90157f6     	stp	x22, x21, [sp, #0x10]
 4608d08: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4608d0c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4608d10: 9100c3fd     	add	x29, sp, #0x30
 4608d14: b9436808     	ldr	w8, [x0, #0x368]
 4608d18: 39555009     	ldrb	w9, [x0, #0x554]
 4608d1c: 0b080135     	add	w21, w9, w8
 4608d20: 710006bf     	cmp	w21, #0x1
 4608d24: 1a9fc6b3     	csinc	w19, w21, wzr, gt
 4608d28: 39552009     	ldrb	w9, [x0, #0x548]
 4608d2c: 39554008     	ldrb	w8, [x0, #0x550]
 4608d30: 34000129     	cbz	w9, 0x4608d54 <_ChromeMain+0x4603ab8>
 4608d34: 35000288     	cbnz	w8, 0x4608d84 <_ChromeMain+0x4603ae8>
 4608d38: 52800033     	mov	w19, #0x1               ; =1
 4608d3c: aa1303e0     	mov	x0, x19
 4608d40: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4608d44: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4608d48: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4608d4c: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4608d50: d65f03c0     	ret
 4608d54: 37000188     	tbnz	w8, #0x0, 0x4608d84 <_ChromeMain+0x4603ae8>
 4608d58: 39401028     	ldrb	w8, [x1, #0x4]
 4608d5c: 37000168     	tbnz	w8, #0x0, 0x4608d88 <_ChromeMain+0x4603aec>
 4608d60: 52800088     	mov	w8, #0x4                ; =4
 4608d64: 7100127f     	cmp	w19, #0x4
 4608d68: 1a883268     	csel	w8, w19, w8, lo
 4608d6c: 6b0802bf     	cmp	w21, w8
 4608d70: 54fffe6d     	b.le	0x4608d3c <_ChromeMain+0x4603aa0>
 4608d74: 71000ebf     	cmp	w21, #0x3
 4608d78: 54000602     	b.hs	0x4608e38 <_ChromeMain+0x4603b9c>
 4608d7c: aa0803f3     	mov	x19, x8
 4608d80: 17ffffef     	b	0x4608d3c <_ChromeMain+0x4603aa0>
 4608d84: 91153001     	add	x1, x0, #0x54c
 4608d88: b9400036     	ldr	w22, [x1]
 4608d8c: 0ab67ed7     	bic	w23, w22, w22, asr #31
 4608d90: 52800760     	mov	w0, #0x3b               ; =59
 4608d94: 96fbeacb     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4608d98: aa0003f4     	mov	x20, x0
 4608d9c: 52800740     	mov	w0, #0x3a               ; =58
 4608da0: 96fbeac8     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4608da4: 6b00029f     	cmp	w20, w0
 4608da8: 1a80c288     	csel	w8, w20, w0, gt
 4608dac: 11001ae9     	add	w9, w23, #0x6
 4608db0: 11001908     	add	w8, w8, #0x6
 4608db4: 1ac80d28     	sdiv	w8, w9, w8
 4608db8: 7100051f     	cmp	w8, #0x1
 4608dbc: 1a9fc508     	csinc	w8, w8, wzr, gt
 4608dc0: 6b08027f     	cmp	w19, w8
 4608dc4: 1a883268     	csel	w8, w19, w8, lo
 4608dc8: 52800089     	mov	w9, #0x4                ; =4
 4608dcc: 5280004a     	mov	w10, #0x2               ; =2
 4608dd0: 71025edf     	cmp	w22, #0x97
 4608dd4: 1a89b149     	csel	w9, w10, w9, lt
 4608dd8: 6b08013f     	cmp	w9, w8
 4608ddc: 1a883128     	csel	w8, w9, w8, lo
 4608de0: 6b0802bf     	cmp	w21, w8
 4608de4: 54fffacd     	b.le	0x4608d3c <_ChromeMain+0x4603aa0>
 4608de8: 71000d1f     	cmp	w8, #0x3
 4608dec: 54fffc83     	b.lo	0x4608d7c <_ChromeMain+0x4603ae0>
 4608df0: 51000509     	sub	w9, w8, #0x1
 4608df4: 1ac80a6a     	udiv	w10, w19, w8
 4608df8: 1b08cd4a     	msub	w10, w10, w8, w19
 4608dfc: 7100055f     	cmp	w10, #0x1
 4608e00: 54000180     	b.eq	0x4608e30 <_ChromeMain+0x4603b94>
 4608e04: 5100066a     	sub	w10, w19, #0x1
 4608e08: 0b0a012b     	add	w11, w9, w10
 4608e0c: 1ac90d6b     	sdiv	w11, w11, w9
 4608e10: 0b0a010a     	add	w10, w8, w10
 4608e14: 1ac80d4a     	sdiv	w10, w10, w8
 4608e18: 6b0a017f     	cmp	w11, w10
 4608e1c: 54fffb01     	b.ne	0x4608d7c <_ChromeMain+0x4603ae0>
 4608e20: 1ac90a6a     	udiv	w10, w19, w9
 4608e24: 1b09cd4a     	msub	w10, w10, w9, w19
 4608e28: aa0803f3     	mov	x19, x8
 4608e2c: 35fff88a     	cbnz	w10, 0x4608d3c <_ChromeMain+0x4603aa0>
 4608e30: aa0903f3     	mov	x19, x9
 4608e34: 17ffffc2     	b	0x4608d3c <_ChromeMain+0x4603aa0>
 4608e38: 51000509     	sub	w9, w8, #0x1
 4608e3c: 1ac80a6a     	udiv	w10, w19, w8
 4608e40: 1b08cd4a     	msub	w10, w10, w8, w19
 4608e44: 7100055f     	cmp	w10, #0x1
 4608e48: 54ffff40     	b.eq	0x4608e30 <_ChromeMain+0x4603b94>
 4608e4c: 5100066a     	sub	w10, w19, #0x1
 4608e50: 0b0a012b     	add	w11, w9, w10
 4608e54: 1ac90d6b     	sdiv	w11, w11, w9
 4608e58: 0b08014a     	add	w10, w10, w8
 4608e5c: 17ffffee     	b	0x4608e14 <_ChromeMain+0x4603b78>
