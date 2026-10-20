
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 459fbcc: d10143ff     	sub	sp, sp, #0x50
 459fbd0: a9034ff4     	stp	x20, x19, [sp, #0x30]
 459fbd4: a9047bfd     	stp	x29, x30, [sp, #0x40]
 459fbd8: 910103fd     	add	x29, sp, #0x40
 459fbdc: b40007a0     	cbz	x0, 0x459fcd0 <_ChromeMain+0x459aa34>
 459fbe0: 97440723     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 459fbe4: aa0003f3     	mov	x19, x0
 459fbe8: b40006a0     	cbz	x0, 0x459fcbc <_ChromeMain+0x459aa20>
 459fbec: 910063e8     	add	x8, sp, #0x18
 459fbf0: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 459fbf4: 91002108     	add	x8, x8, #0x8
 459fbf8: f9000fe8     	str	x8, [sp, #0x18]
 459fbfc: 910063e0     	add	x0, sp, #0x18
 459fc00: 91002261     	add	x1, x19, #0x8
 459fc04: 976373c9     	bl	0x1e7cb28 <_ChromeMain+0x1e7788c>
 459fc08: 910063e0     	add	x0, sp, #0x18
 459fc0c: 91008261     	add	x1, x19, #0x20
 459fc10: 976373c6     	bl	0x1e7cb28 <_ChromeMain+0x1e7788c>
 459fc14: 910063e0     	add	x0, sp, #0x18
 459fc18: 9100e261     	add	x1, x19, #0x38
 459fc1c: 976373c3     	bl	0x1e7cb28 <_ChromeMain+0x1e7788c>
 459fc20: 910063e0     	add	x0, sp, #0x18
 459fc24: 91014261     	add	x1, x19, #0x50
 459fc28: 976373c0     	bl	0x1e7cb28 <_ChromeMain+0x1e7788c>
 459fc2c: 910063e0     	add	x0, sp, #0x18
 459fc30: 9101a261     	add	x1, x19, #0x68
 459fc34: 976373bd     	bl	0x1e7cb28 <_ChromeMain+0x1e7788c>
 459fc38: 52800600     	mov	w0, #0x30               ; =48
 459fc3c: 96e9bdcb     	bl	0xf368 <_ChromeMain+0xa0cc>
 459fc40: f90003e0     	str	x0, [sp]
 459fc44: 9004cce8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 459fc48: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 459fc4c: 3c8083e0     	stur	q0, [sp, #0x8]
 459fc50: 91008009     	add	x9, x0, #0x20
 459fc54: eb00013f     	cmp	x9, x0
 459fc58: 54000403     	b.lo	0x459fcd8 <_ChromeMain+0x459aa3c>
 459fc5c: b0044548     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 459fc60: 91252508     	add	x8, x8, #0x949
 459fc64: eb08013f     	cmp	x9, x8
 459fc68: fa488002     	ccmp	x0, x8, #0x2, hi
 459fc6c: 54000369     	b.ls	0x459fcd8 <_ChromeMain+0x459aa3c>
 459fc70: ad400500     	ldp	q0, q1, [x8]
 459fc74: ad000400     	stp	q0, q1, [x0]
 459fc78: 3900801f     	strb	wzr, [x0, #0x20]
 459fc7c: 910063f4     	add	x20, sp, #0x18
 459fc80: 910063e0     	add	x0, sp, #0x18
 459fc84: 910003e1     	mov	x1, sp
 459fc88: 9719759f     	bl	0xbfd304 <_ChromeMain+0xbf8068>
 459fc8c: f100001f     	cmp	x0, #0x0
 459fc90: 1a9f07f3     	cset	w19, ne
 459fc94: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 459fc98: 36f800a8     	tbz	w8, #0x1f, 0x459fcac <_ChromeMain+0x459aa10>
 459fc9c: f94003e0     	ldr	x0, [sp]
 459fca0: f9400be8     	ldr	x8, [sp, #0x10]
 459fca4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 459fca8: 96e9a484     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 459fcac: f94013e1     	ldr	x1, [sp, #0x20]
 459fcb0: f90003f4     	str	x20, [sp]
 459fcb4: 910003e0     	mov	x0, sp
 459fcb8: 9750eea6     	bl	0x19db750 <_ChromeMain+0x19d64b4>
 459fcbc: aa1303e0     	mov	x0, x19
 459fcc0: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 459fcc4: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 459fcc8: 910143ff     	add	sp, sp, #0x50
 459fccc: d65f03c0     	ret
 459fcd0: 52800013     	mov	w19, #0x0               ; =0
 459fcd4: 17fffffa     	b	0x459fcbc <_ChromeMain+0x459aa20>
 459fcd8: d4200020     	brk	#0x1
 459fcdc: 00000000     	udf	#0x0
