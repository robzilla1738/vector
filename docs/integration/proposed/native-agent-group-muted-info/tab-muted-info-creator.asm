
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7631c9c: 910003e8     	mov	x8, sp
 7631ca0: b27d0118     	orr	x24, x8, #0x8
 7631ca4: f90013ff     	str	xzr, [sp, #0x20]
 7631ca8: 6f00e400     	movi.2d	v0, #0000000000000000
 7631cac: ad0003e0     	stp	q0, q0, [sp]
 7631cb0: f947c2a8     	ldr	x8, [x21, #0xf80]
 7631cb4: b4000048     	cbz	x8, 0x7631cbc <_ChromeMain+0x762ca20>
 7631cb8: 3940a108     	ldrb	w8, [x8, #0x28]
 7631cbc: 12000108     	and	w8, w8, #0x1
 7631cc0: 390003e8     	strb	w8, [sp]
 7631cc4: aa1503e0     	mov	x0, x21
 7631cc8: 94014586     	bl	0x76832e0 <_ChromeMain+0x767e044>
 7631ccc: 51000808     	sub	w8, w0, #0x2
 7631cd0: 7100111f     	cmp	w8, #0x4
 7631cd4: 540002e2     	b.hs	0x7631d30 <_ChromeMain+0x762ca94>
 7631cd8: 52800028     	mov	w8, #0x1                ; =1
 7631cdc: b90007e8     	str	w8, [sp, #0x4]
 7631ce0: 39418288     	ldrb	w8, [x20, #0x60]
 7631ce4: f94003e9     	ldr	x9, [sp]
 7631ce8: f9001e89     	str	x9, [x20, #0x38]
 7631cec: 35000528     	cbnz	w8, 0x7631d90 <_ChromeMain+0x762caf4>
 7631cf0: 3901029f     	strb	wzr, [x20, #0x40]
 7631cf4: 3901629f     	strb	wzr, [x20, #0x58]
 7631cf8: 394083e8     	ldrb	w8, [sp, #0x20]
 7631cfc: 36000128     	tbz	w8, #0x0, 0x7631d20 <_ChromeMain+0x762ca84>
 7631d00: 3dc00300     	ldr	q0, [x24]
 7631d04: 3c840280     	stur	q0, [x20, #0x40]
 7631d08: f9400b09     	ldr	x9, [x24, #0x10]
 7631d0c: f8050289     	stur	x9, [x20, #0x50]
 7631d10: a900ff1f     	stp	xzr, xzr, [x24, #0x8]
 7631d14: f900031f     	str	xzr, [x24]
 7631d18: 52800029     	mov	w9, #0x1                ; =1
 7631d1c: 39016289     	strb	w9, [x20, #0x58]
 7631d20: 52800029     	mov	w9, #0x1                ; =1
 7631d24: 39018289     	strb	w9, [x20, #0x60]
 7631d28: 360004a8     	tbz	w8, #0x0, 0x7631dbc <_ChromeMain+0x762cb20>
 7631d2c: 1400001e     	b	0x7631da4 <_ChromeMain+0x762cb08>
 7631d30: 7100041f     	cmp	w0, #0x1
 7631d34: 54fffd61     	b.ne	0x7631ce0 <_ChromeMain+0x762ca44>
 7631d38: 52800068     	mov	w8, #0x3                ; =3
 7631d3c: b90007e8     	str	w8, [sp, #0x4]
 7631d40: b002c5a1     	adrp	x1, 0xcee6000 <dyld_stub_binder+0xcee6000>
 7631d44: 9115e021     	add	x1, x1, #0x578
 7631d48: 910022a0     	add	x0, x21, #0x8
 7631d4c: 96288509     	bl	0x53170 <_ChromeMain+0x4ded4>
 7631d50: 91006008     	add	x8, x0, #0x18
 7631d54: 394083e9     	ldrb	w9, [sp, #0x20]
 7631d58: 37001da9     	tbnz	w9, #0x0, 0x763210c <_ChromeMain+0x762ce70>
 7631d5c: 39c0bc09     	ldrsb	w9, [x0, #0x2f]
 7631d60: 36f800e9     	tbz	w9, #0x1f, 0x7631d7c <_ChromeMain+0x762cae0>
 7631d64: a9418801     	ldp	x1, x2, [x0, #0x18]
 7631d68: aa1803e0     	mov	x0, x24
 7631d6c: 9627992b     	bl	0x18218 <_ChromeMain+0x12f7c>
 7631d70: 52800028     	mov	w8, #0x1                ; =1
 7631d74: 390083e8     	strb	w8, [sp, #0x20]
 7631d78: 17ffffda     	b	0x7631ce0 <_ChromeMain+0x762ca44>
 7631d7c: 3dc00100     	ldr	q0, [x8]
 7631d80: f9400908     	ldr	x8, [x8, #0x10]
 7631d84: f9000b08     	str	x8, [x24, #0x10]
 7631d88: 3d800300     	str	q0, [x24]
 7631d8c: 17fffff9     	b	0x7631d70 <_ChromeMain+0x762cad4>
 7631d90: 91010280     	add	x0, x20, #0x40
 7631d94: aa1803e1     	mov	x1, x24
 7631d98: 9703e57f     	bl	0x372b394 <_ChromeMain+0x37260f8>
 7631d9c: 394083e8     	ldrb	w8, [sp, #0x20]
 7631da0: 360000e8     	tbz	w8, #0x0, 0x7631dbc <_ChromeMain+0x762cb20>
 7631da4: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 7631da8: 36f800a8     	tbz	w8, #0x1f, 0x7631dbc <_ChromeMain+0x762cb20>
 7631dac: f94007e0     	ldr	x0, [sp, #0x8]
 7631db0: f9400fe8     	ldr	x8, [sp, #0x18]
 7631db4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7631db8: 96275c40     	bl	0x8eb8 <_ChromeMain+0x3c1c>
