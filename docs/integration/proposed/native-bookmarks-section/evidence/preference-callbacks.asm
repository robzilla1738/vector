
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4659ab8: d100c3ff     	sub	sp, sp, #0x30
 4659abc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4659ac0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4659ac4: 910083fd     	add	x29, sp, #0x20
 4659ac8: 397e4008     	ldrb	w8, [x0, #0xf90]
 4659acc: 360000a8     	tbz	w8, #0x0, 0x4659ae0 <_ChromeMain+0x4654844>
 4659ad0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4659ad4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4659ad8: 9100c3ff     	add	sp, sp, #0x30
 4659adc: d65f03c0     	ret
 4659ae0: aa0003f3     	mov	x19, x0
 4659ae4: f9422c08     	ldr	x8, [x0, #0x458]
 4659ae8: b4000508     	cbz	x8, 0x4659b88 <_ChromeMain+0x46548ec>
 4659aec: f9429d08     	ldr	x8, [x8, #0x538]
 4659af0: f9403500     	ldr	x0, [x8, #0x68]
 4659af4: b40004a0     	cbz	x0, 0x4659b88 <_ChromeMain+0x46548ec>
 4659af8: f9400008     	ldr	x8, [x0]
 4659afc: f940a508     	ldr	x8, [x8, #0x148]
 4659b00: d63f0100     	blr	x8
 4659b04: f9400008     	ldr	x8, [x0]
 4659b08: f940b508     	ldr	x8, [x8, #0x168]
 4659b0c: d63f0100     	blr	x8
 4659b10: b40003c0     	cbz	x0, 0x4659b88 <_ChromeMain+0x46548ec>
 4659b14: b0044481     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 4659b18: 9116fc21     	add	x1, x1, #0x5bf
 4659b1c: 528005a2     	mov	w2, #0x2d               ; =45
 4659b20: 96f2b278     	bl	0x306500 <_ChromeMain+0x301264>
 4659b24: 37000320     	tbnz	w0, #0x0, 0x4659b88 <_ChromeMain+0x46548ec>
 4659b28: f9436e74     	ldr	x20, [x19, #0x6d8]
 4659b2c: b40002f4     	cbz	x20, 0x4659b88 <_ChromeMain+0x46548ec>
 4659b30: f9407288     	ldr	x8, [x20, #0xe0]
 4659b34: b40002a8     	cbz	x8, 0x4659b88 <_ChromeMain+0x46548ec>
 4659b38: 19404108     	ldapurb	w8, [x8, #0x4]
 4659b3c: 35000268     	cbnz	w8, 0x4659b88 <_ChromeMain+0x46548ec>
 4659b40: f9407688     	ldr	x8, [x20, #0xe8]
 4659b44: b4000228     	cbz	x8, 0x4659b88 <_ChromeMain+0x46548ec>
 4659b48: f9407288     	ldr	x8, [x20, #0xe0]
 4659b4c: b4000568     	cbz	x8, 0x4659bf8 <_ChromeMain+0x465495c>
 4659b50: 19404108     	ldapurb	w8, [x8, #0x4]
 4659b54: 35000528     	cbnz	w8, 0x4659bf8 <_ChromeMain+0x465495c>
 4659b58: f9407688     	ldr	x8, [x20, #0xe8]
 4659b5c: f9402500     	ldr	x0, [x8, #0x48]
 4659b60: b4000060     	cbz	x0, 0x4659b6c <_ChromeMain+0x46548d0>
 4659b64: 52800001     	mov	w1, #0x0                ; =0
 4659b68: 9793a2a5     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 4659b6c: 979275f6     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 4659b70: f90007f4     	str	x20, [sp, #0x8]
 4659b74: b0030421     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 4659b78: 91389021     	add	x1, x1, #0xe24
 4659b7c: 910023e3     	add	x3, sp, #0x8
 4659b80: d2800002     	mov	x2, #0x0                ; =0
 4659b84: 976f0110     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 4659b88: aa1303e0     	mov	x0, x19
 4659b8c: 52800021     	mov	w1, #0x1                ; =1
 4659b90: 97ffc34c     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 4659b94: aa1303e0     	mov	x0, x19
 4659b98: 97ff49ca     	bl	0x462c2c0 <_ChromeMain+0x4627024>
 4659b9c: f940c660     	ldr	x0, [x19, #0x188]
 4659ba0: b40000a0     	cbz	x0, 0x4659bb4 <_ChromeMain+0x4654918>
 4659ba4: f9400008     	ldr	x8, [x0]
 4659ba8: f9417d08     	ldr	x8, [x8, #0x2f8]
 4659bac: aa1303e1     	mov	x1, x19
 4659bb0: d63f0100     	blr	x8
 4659bb4: aa1303e0     	mov	x0, x19
 4659bb8: 52800001     	mov	w1, #0x0                ; =0
 4659bbc: 96ff5a2e     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4659bc0: f90007f3     	str	x19, [sp, #0x8]
 4659bc4: 9104c260     	add	x0, x19, #0x130
 4659bc8: 910023e3     	add	x3, sp, #0x8
 4659bcc: 52800301     	mov	w1, #0x18               ; =24
 4659bd0: 52800022     	mov	w2, #0x1                ; =1
 4659bd4: 9709357f     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 4659bd8: aa1303e0     	mov	x0, x19
 4659bdc: 52800001     	mov	w1, #0x0                ; =0
 4659be0: 96ff5a25     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4659be4: aa1303e0     	mov	x0, x19
 4659be8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4659bec: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4659bf0: 9100c3ff     	add	sp, sp, #0x30
 4659bf4: 16fd1d62     	b	0x5a117c <_ChromeMain+0x59bee0>
 4659bf8: d4200000     	brk	#0
 4659bfc: d4400000     	hlt	#0
 4659c00: d4200020     	brk	#0x1
 4659c04: d100c3ff     	sub	sp, sp, #0x30
 4659c08: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4659c0c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4659c10: 910083fd     	add	x29, sp, #0x20
 4659c14: 397e4008     	ldrb	w8, [x0, #0xf90]
 4659c18: 360000a8     	tbz	w8, #0x0, 0x4659c2c <_ChromeMain+0x4654990>
 4659c1c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4659c20: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4659c24: 9100c3ff     	add	sp, sp, #0x30
 4659c28: d65f03c0     	ret
 4659c2c: aa0003f3     	mov	x19, x0
 4659c30: f9433400     	ldr	x0, [x0, #0x668]
 4659c34: b4ffff40     	cbz	x0, 0x4659c1c <_ChromeMain+0x4654980>
 4659c38: f9422e68     	ldr	x8, [x19, #0x458]
 4659c3c: b4ffff08     	cbz	x8, 0x4659c1c <_ChromeMain+0x4654980>
 4659c40: f9429d08     	ldr	x8, [x8, #0x538]
 4659c44: f9403508     	ldr	x8, [x8, #0x68]
 4659c48: b4000288     	cbz	x8, 0x4659c98 <_ChromeMain+0x46549fc>
 4659c4c: f9400109     	ldr	x9, [x8]
 4659c50: f940a529     	ldr	x9, [x9, #0x148]
 4659c54: aa0803e0     	mov	x0, x8
 4659c58: d63f0120     	blr	x9
 4659c5c: f9400008     	ldr	x8, [x0]
 4659c60: f940b508     	ldr	x8, [x8, #0x168]
 4659c64: d63f0100     	blr	x8
 4659c68: b4000160     	cbz	x0, 0x4659c94 <_ChromeMain+0x46549f8>
 4659c6c: b0044481     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 4659c70: 9117b421     	add	x1, x1, #0x5ed
 4659c74: 528005c2     	mov	w2, #0x2e               ; =46
 4659c78: 96f2b222     	bl	0x306500 <_ChromeMain+0x301264>
 4659c7c: aa0003e1     	mov	x1, x0
 4659c80: f9433660     	ldr	x0, [x19, #0x668]
 4659c84: 394f0008     	ldrb	w8, [x0, #0x3c0]
 4659c88: 6b08003f     	cmp	w1, w8
 4659c8c: 54fffc80     	b.eq	0x4659c1c <_ChromeMain+0x4654980>
 4659c90: 14000005     	b	0x4659ca4 <_ChromeMain+0x4654a08>
 4659c94: f9433660     	ldr	x0, [x19, #0x668]
 4659c98: 394f0008     	ldrb	w8, [x0, #0x3c0]
 4659c9c: 3707fc08     	tbnz	w8, #0x0, 0x4659c1c <_ChromeMain+0x4654980>
 4659ca0: 52800021     	mov	w1, #0x1                ; =1
 4659ca4: 97ffff03     	bl	0x46598b0 <_ChromeMain+0x4654614>
 4659ca8: f940c660     	ldr	x0, [x19, #0x188]
 4659cac: b40000a0     	cbz	x0, 0x4659cc0 <_ChromeMain+0x4654a24>
 4659cb0: f9400008     	ldr	x8, [x0]
 4659cb4: f9417d08     	ldr	x8, [x8, #0x2f8]
 4659cb8: aa1303e1     	mov	x1, x19
 4659cbc: d63f0100     	blr	x8
 4659cc0: aa1303e0     	mov	x0, x19
 4659cc4: 52800001     	mov	w1, #0x0                ; =0
 4659cc8: 96ff59eb     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4659ccc: f90007f3     	str	x19, [sp, #0x8]
 4659cd0: 9104c260     	add	x0, x19, #0x130
 4659cd4: 910023e3     	add	x3, sp, #0x8
 4659cd8: 52800301     	mov	w1, #0x18               ; =24
 4659cdc: 52800022     	mov	w2, #0x1                ; =1
 4659ce0: 9709353c     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 4659ce4: aa1303e0     	mov	x0, x19
 4659ce8: 52800001     	mov	w1, #0x0                ; =0
 4659cec: 96ff59e2     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4659cf0: aa1303e0     	mov	x0, x19
 4659cf4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4659cf8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4659cfc: 9100c3ff     	add	sp, sp, #0x30
 4659d00: 16fd1d1f     	b	0x5a117c <_ChromeMain+0x59bee0>
