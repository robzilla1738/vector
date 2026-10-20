
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4664c00: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4664c04: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4664c08: 910043fd     	add	x29, sp, #0x10
 4664c0c: aa0003f3     	mov	x19, x0
 4664c10: d10c8000     	sub	x0, x0, #0x320
 4664c14: 9400001b     	bl	0x4664c80 <_ChromeMain+0x465f9e4>
 4664c18: 3942a268     	ldrb	w8, [x19, #0xa8]
 4664c1c: 34000048     	cbz	w8, 0x4664c24 <_ChromeMain+0x465f988>
 4664c20: 3902a27f     	strb	wzr, [x19, #0xa8]
 4664c24: f9400660     	ldr	x0, [x19, #0x8]
 4664c28: 394c9008     	ldrb	w8, [x0, #0x324]
 4664c2c: 34000168     	cbz	w8, 0x4664c58 <_ChromeMain+0x465f9bc>
 4664c30: b903201f     	str	wzr, [x0, #0x320]
 4664c34: 390c901f     	strb	wzr, [x0, #0x324]
 4664c38: 394cc008     	ldrb	w8, [x0, #0x330]
 4664c3c: 34000048     	cbz	w8, 0x4664c44 <_ChromeMain+0x465f9a8>
 4664c40: 390cc01f     	strb	wzr, [x0, #0x330]
 4664c44: f9400008     	ldr	x8, [x0]
 4664c48: f9418501     	ldr	x1, [x8, #0x308]
 4664c4c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4664c50: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4664c54: d61f0020     	br	x1
 4664c58: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4664c5c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4664c60: d65f03c0     	ret
 4664c64: 00000000     	udf	#0x0
 4664c68: d10c8000     	sub	x0, x0, #0x320
 4664c6c: 14000005     	b	0x4664c80 <_ChromeMain+0x465f9e4>
		...
 4664c80: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4664c84: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4664c88: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4664c8c: 910083fd     	add	x29, sp, #0x20
 4664c90: aa0003f3     	mov	x19, x0
 4664c94: 394f0008     	ldrb	w8, [x0, #0x3c0]
 4664c98: 340002c8     	cbz	w8, 0x4664cf0 <_ChromeMain+0x465fa54>
 4664c9c: 394d2268     	ldrb	w8, [x19, #0x348]
 4664ca0: 37000288     	tbnz	w8, #0x0, 0x4664cf0 <_ChromeMain+0x465fa54>
 4664ca4: fd41d660     	ldr	d0, [x19, #0x3a8]
 4664ca8: 1e6e1001     	fmov	d1, #1.00000000
 4664cac: 1e612000     	fcmp	d0, d1
 4664cb0: 54000201     	b.ne	0x4664cf0 <_ChromeMain+0x465fa54>
 4664cb4: f9419660     	ldr	x0, [x19, #0x328]
 4664cb8: 394c7008     	ldrb	w8, [x0, #0x31c]
 4664cbc: 34000128     	cbz	w8, 0x4664ce0 <_ChromeMain+0x465fa44>
 4664cc0: 390c701f     	strb	wzr, [x0, #0x31c]
 4664cc4: 394cc008     	ldrb	w8, [x0, #0x330]
 4664cc8: 34000048     	cbz	w8, 0x4664cd0 <_ChromeMain+0x465fa34>
 4664ccc: 390cc01f     	strb	wzr, [x0, #0x330]
 4664cd0: f9400008     	ldr	x8, [x0]
 4664cd4: f9418508     	ldr	x8, [x8, #0x308]
 4664cd8: d63f0100     	blr	x8
 4664cdc: f9419660     	ldr	x0, [x19, #0x328]
 4664ce0: f9400008     	ldr	x8, [x0]
 4664ce4: f9405102     	ldr	x2, [x8, #0xa0]
 4664ce8: 52800021     	mov	w1, #0x1                ; =1
 4664cec: 14000038     	b	0x4664dcc <_ChromeMain+0x465fb30>
 4664cf0: f9419674     	ldr	x20, [x19, #0x328]
 4664cf4: 394c9288     	ldrb	w8, [x20, #0x324]
 4664cf8: 350002e8     	cbnz	w8, 0x4664d54 <_ChromeMain+0x465fab8>
 4664cfc: 910d0295     	add	x21, x20, #0x340
 4664d00: 394d2288     	ldrb	w8, [x20, #0x348]
 4664d04: 35000228     	cbnz	w8, 0x4664d48 <_ChromeMain+0x465faac>
 4664d08: f941aa88     	ldr	x8, [x20, #0x350]
 4664d0c: 91000508     	add	x8, x8, #0x1
 4664d10: f901aa88     	str	x8, [x20, #0x350]
 4664d14: f9418a80     	ldr	x0, [x20, #0x310]
 4664d18: b0048401     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4664d1c: 9104b021     	add	x1, x1, #0x12c
 4664d20: 9705c3d8     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4664d24: 394d2288     	ldrb	w8, [x20, #0x348]
 4664d28: 350000c8     	cbnz	w8, 0x4664d40 <_ChromeMain+0x465faa4>
 4664d2c: b40005d5     	cbz	x21, 0x4664de4 <_ChromeMain+0x465fb48>
 4664d30: f901a280     	str	x0, [x20, #0x340]
 4664d34: 52800028     	mov	w8, #0x1                ; =1
 4664d38: 390d2288     	strb	w8, [x20, #0x348]
 4664d3c: 14000004     	b	0x4664d4c <_ChromeMain+0x465fab0>
 4664d40: f90002a0     	str	x0, [x21]
 4664d44: 14000002     	b	0x4664d4c <_ChromeMain+0x465fab0>
 4664d48: f94002a0     	ldr	x0, [x21]
 4664d4c: d360fc08     	lsr	x8, x0, #32
 4664d50: 14000002     	b	0x4664d58 <_ChromeMain+0x465fabc>
 4664d54: b9432288     	ldr	w8, [x20, #0x320]
 4664d58: 394f2269     	ldrb	w9, [x19, #0x3c8]
 4664d5c: 34000049     	cbz	w9, 0x4664d64 <_ChromeMain+0x465fac8>
 4664d60: b943c668     	ldr	w8, [x19, #0x3c4]
 4664d64: 1e620100     	scvtf	d0, w8
 4664d68: fd41d661     	ldr	d1, [x19, #0x3a8]
 4664d6c: 1e600820     	fmul	d0, d1, d0
 4664d70: 9e640014     	fcvtas	x20, d0
 4664d74: f9419660     	ldr	x0, [x19, #0x328]
 4664d78: 394c7008     	ldrb	w8, [x0, #0x31c]
 4664d7c: 34000088     	cbz	w8, 0x4664d8c <_ChromeMain+0x465faf0>
 4664d80: b9431808     	ldr	w8, [x0, #0x318]
 4664d84: 6b14011f     	cmp	w8, w20
 4664d88: 54000160     	b.eq	0x4664db4 <_ChromeMain+0x465fb18>
 4664d8c: b9031814     	str	w20, [x0, #0x318]
 4664d90: 52800028     	mov	w8, #0x1                ; =1
 4664d94: 390c7008     	strb	w8, [x0, #0x31c]
 4664d98: 394cc008     	ldrb	w8, [x0, #0x330]
 4664d9c: 34000048     	cbz	w8, 0x4664da4 <_ChromeMain+0x465fb08>
 4664da0: 390cc01f     	strb	wzr, [x0, #0x330]
 4664da4: f9400008     	ldr	x8, [x0]
 4664da8: f9418508     	ldr	x8, [x8, #0x308]
 4664dac: d63f0100     	blr	x8
 4664db0: f9419660     	ldr	x0, [x19, #0x328]
 4664db4: 7100029f     	cmp	w20, #0x0
 4664db8: 5400012d     	b.le	0x4664ddc <_ChromeMain+0x465fb40>
 4664dbc: 52800028     	mov	w8, #0x1                ; =1
 4664dc0: f9400009     	ldr	x9, [x0]
 4664dc4: f9405122     	ldr	x2, [x9, #0xa0]
 4664dc8: 12000101     	and	w1, w8, #0x1
 4664dcc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4664dd0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4664dd4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4664dd8: d61f0040     	br	x2
 4664ddc: 394d2268     	ldrb	w8, [x19, #0x348]
 4664de0: 17fffff8     	b	0x4664dc0 <_ChromeMain+0x465fb24>
 4664de4: d4200020     	brk	#0x1
