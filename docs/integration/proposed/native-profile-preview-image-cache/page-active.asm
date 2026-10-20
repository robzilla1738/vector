
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4658d3c: d10143ff     	sub	sp, sp, #0x50
 4658d40: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4658d44: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4658d48: 910103fd     	add	x29, sp, #0x40
 4658d4c: aa0003f3     	mov	x19, x0
 4658d50: f9418800     	ldr	x0, [x0, #0x310]
 4658d54: 39472008     	ldrb	w8, [x0, #0x1c8]
 4658d58: 37000168     	tbnz	w8, #0x0, 0x4658d84 <_ChromeMain+0x4653ae8>
 4658d5c: f9419668     	ldr	x8, [x19, #0x328]
 4658d60: b40000c8     	cbz	x8, 0x4658d78 <_ChromeMain+0x4653adc>
 4658d64: 39472108     	ldrb	w8, [x8, #0x1c8]
 4658d68: f941de69     	ldr	x9, [x19, #0x3b8]
 4658d6c: 7100011f     	cmp	w8, #0x0
 4658d70: fa401924     	ccmp	x9, #0x0, #0x4, ne
 4658d74: 54000081     	b.ne	0x4658d84 <_ChromeMain+0x4653ae8>
 4658d78: f9419a68     	ldr	x8, [x19, #0x330]
 4658d7c: 39472108     	ldrb	w8, [x8, #0x1c8]
 4658d80: 370004e8     	tbnz	w8, #0x0, 0x4658e1c <_ChromeMain+0x4653b80>
 4658d84: f90007ff     	str	xzr, [sp, #0x8]
 4658d88: 2f06e400     	movi	d0, #0xffff000000000000
 4658d8c: fd000be0     	str	d0, [sp, #0x10]
 4658d90: 52800028     	mov	w8, #0x1                ; =1
 4658d94: 390063e8     	strb	w8, [sp, #0x18]
 4658d98: f90013ff     	str	xzr, [sp, #0x20]
 4658d9c: 3900a3ff     	strb	wzr, [sp, #0x28]
 4658da0: 910023e1     	add	x1, sp, #0x8
 4658da4: 96fd20bf     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4658da8: 910023e0     	add	x0, sp, #0x8
 4658dac: 9707b6a5     	bl	0x846840 <_ChromeMain+0x8415a4>
 4658db0: f9418a60     	ldr	x0, [x19, #0x310]
 4658db4: f9400008     	ldr	x8, [x0]
 4658db8: f9405108     	ldr	x8, [x8, #0xa0]
 4658dbc: 52800001     	mov	w1, #0x0                ; =0
 4658dc0: d63f0100     	blr	x8
 4658dc4: f9419668     	ldr	x8, [x19, #0x328]
 4658dc8: b4000168     	cbz	x8, 0x4658df4 <_ChromeMain+0x4653b58>
 4658dcc: 39472108     	ldrb	w8, [x8, #0x1c8]
 4658dd0: 34000128     	cbz	w8, 0x4658df4 <_ChromeMain+0x4653b58>
 4658dd4: f941de68     	ldr	x8, [x19, #0x3b8]
 4658dd8: b40000e8     	cbz	x8, 0x4658df4 <_ChromeMain+0x4653b58>
 4658ddc: f9419a60     	ldr	x0, [x19, #0x330]
 4658de0: f9400008     	ldr	x8, [x0]
 4658de4: f9405108     	ldr	x8, [x8, #0xa0]
 4658de8: 52800001     	mov	w1, #0x0                ; =0
 4658dec: d63f0100     	blr	x8
 4658df0: 1400000b     	b	0x4658e1c <_ChromeMain+0x4653b80>
 4658df4: f9419a60     	ldr	x0, [x19, #0x330]
 4658df8: f9400008     	ldr	x8, [x0]
 4658dfc: f9405108     	ldr	x8, [x8, #0xa0]
 4658e00: 52800021     	mov	w1, #0x1                ; =1
 4658e04: d63f0100     	blr	x8
 4658e08: aa1303e0     	mov	x0, x19
 4658e0c: 52800001     	mov	w1, #0x0                ; =0
 4658e10: 96ff5d99     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4658e14: aa1303e0     	mov	x0, x19
 4658e18: 96fd20d9     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4658e1c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4658e20: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4658e24: 910143ff     	add	sp, sp, #0x50
 4658e28: d65f03c0     	ret
