
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4573b6c: 350042e8     	cbnz	w8, 0x45743c8 <_ChromeMain+0x456f12c>
 4573b70: 910c8268     	add	x8, x19, #0x320
 4573b74: f9400108     	ldr	x8, [x8]
 4573b78: b5000848     	cbnz	x8, 0x4573c80 <_ChromeMain+0x456e9e4>
 4573b7c: f9400be8     	ldr	x8, [sp, #0x10]
 4573b80: b4000348     	cbz	x8, 0x4573be8 <_ChromeMain+0x456e94c>
 4573b84: f0054b88     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4573b88: f9467d00     	ldr	x0, [x8, #0xcf8]
 4573b8c: b40002e0     	cbz	x0, 0x4573be8 <_ChromeMain+0x456e94c>
 4573b90: 9752affa     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4573b94: b40002a0     	cbz	x0, 0x4573be8 <_ChromeMain+0x456e94c>
 4573b98: f0054b88     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4573b9c: f9467d00     	ldr	x0, [x8, #0xcf8]
 4573ba0: 9752aff6     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4573ba4: 9752b01b     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4573ba8: aa0003f9     	mov	x25, x0
 4573bac: f9400be0     	ldr	x0, [sp, #0x10]
 4573bb0: f9400008     	ldr	x8, [x0]
 4573bb4: f940a508     	ldr	x8, [x8, #0x148]
 4573bb8: d63f0100     	blr	x8
 4573bbc: f9400008     	ldr	x8, [x0]
 4573bc0: f9401909     	ldr	x9, [x8, #0x30]
 4573bc4: 9106c3e8     	add	x8, sp, #0x1b0
 4573bc8: d63f0120     	blr	x9
 4573bcc: 9106c3e1     	add	x1, sp, #0x1b0
 4573bd0: aa1903e0     	mov	x0, x25
 4573bd4: 9752b04b     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4573bd8: aa0003f9     	mov	x25, x0
 4573bdc: 39c71fe8     	ldrsb	w8, [sp, #0x1c7]
 4573be0: 37fff6c8     	tbnz	w8, #0x1f, 0x4573ab8 <_ChromeMain+0x456e81c>
 4573be4: b5fff759     	cbnz	x25, 0x4573acc <_ChromeMain+0x456e830>
 4573be8: f900dbff     	str	xzr, [sp, #0x1b0]
 4573bec: fd00dfe8     	str	d8, [sp, #0x1b8]
 4573bf0: 390703f5     	strb	w21, [sp, #0x1c0]
 4573bf4: f900e7ff     	str	xzr, [sp, #0x1c8]
 4573bf8: 390743ff     	strb	wzr, [sp, #0x1d0]
 4573bfc: 14000027     	b	0x4573c98 <_ChromeMain+0x456e9fc>
 4573c00: 12800008     	mov	w8, #-0x1               ; =-1
 4573c04: b8e80008     	ldaddal	w8, w8, [x0]
 4573c08: 7100051f     	cmp	w8, #0x1
 4573c0c: 54001201     	b.ne	0x4573e4c <_ChromeMain+0x456ebb0>
 4573c10: f9400808     	ldr	x8, [x0, #0x10]
 4573c14: d63f0100     	blr	x8
 4573c18: 1400008d     	b	0x4573e4c <_ChromeMain+0x456ebb0>
 4573c1c: a9400ae1     	ldp	x1, x2, [x23]
 4573c20: 91010340     	add	x0, x26, #0x40
 4573c24: 96ea917d     	bl	0x18218 <_ChromeMain+0x12f7c>
 4573c28: 14000071     	b	0x4573dec <_ChromeMain+0x456eb50>
 4573c2c: f9400be0     	ldr	x0, [sp, #0x10]
 4573c30: f9400008     	ldr	x8, [x0]
 4573c34: f940a508     	ldr	x8, [x8, #0x148]
 4573c38: d63f0100     	blr	x8
 4573c3c: aa0003fa     	mov	x26, x0
 4573c40: 6f00e400     	movi.2d	v0, #0000000000000000
 4573c44: ad3883a0     	stp	q0, q0, [x29, #-0xf0]
 4573c48: f81303bf     	stur	xzr, [x29, #-0xd0]
 4573c4c: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4573c50: b811c3a8     	stur	w8, [x29, #-0xe4]
 4573c54: 381203b9     	sturb	w25, [x29, #-0xe0]
 4573c58: 381303bf     	sturb	wzr, [x29, #-0xd0]
 4573c5c: 394d0268     	ldrb	w8, [x19, #0x340]
 4573c60: 52800035     	mov	w21, #0x1               ; =1
 4573c64: 7100051f     	cmp	w8, #0x1
 4573c68: 54fff821     	b.ne	0x4573b6c <_ChromeMain+0x456e8d0>
 4573c6c: 910c8268     	add	x8, x19, #0x320
 4573c70: f9400108     	ldr	x8, [x8]
 4573c74: b4fff848     	cbz	x8, 0x4573b7c <_ChromeMain+0x456e8e0>
 4573c78: f9400d08     	ldr	x8, [x8, #0x18]
 4573c7c: b4fff808     	cbz	x8, 0x4573b7c <_ChromeMain+0x456e8e0>
 4573c80: 3906c3ff     	strb	wzr, [sp, #0x1b0]
 4573c84: 52801fe8     	mov	w8, #0xff               ; =255
 4573c88: 390743e8     	strb	w8, [sp, #0x1d0]
 4573c8c: 9106c3e0     	add	x0, sp, #0x1b0
 4573c90: 910c8261     	add	x1, x19, #0x320
 4573c94: 97052c3e     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 4573c98: d103c3a0     	sub	x0, x29, #0xf0
 4573c9c: 9106c3e1     	add	x1, sp, #0x1b0
 4573ca0: 9713176a     	bl	0xa39a48 <_ChromeMain+0xa347ac>
 4573ca4: 9106c3e0     	add	x0, sp, #0x1b0
 4573ca8: 970b4ae6     	bl	0x846840 <_ChromeMain+0x8415a4>
 4573cac: 394d2279     	ldrb	w25, [x19, #0x348]
