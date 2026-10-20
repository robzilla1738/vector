
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c776b50: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 c776b54: a9014ff4     	stp	x20, x19, [sp, #0x10]
 c776b58: a9027bfd     	stp	x29, x30, [sp, #0x20]
 c776b5c: 910083fd     	add	x29, sp, #0x20
 c776b60: aa0003f3     	mov	x19, x0
 c776b64: f941c800     	ldr	x0, [x0, #0x390]
 c776b68: b50001e0     	cbnz	x0, 0xc776ba4 <_ChromeMain+0xc771908>
 c776b6c: f941c674     	ldr	x20, [x19, #0x388]
 c776b70: f9429e95     	ldr	x21, [x20, #0x538]
 c776b74: 52800600     	mov	w0, #0x30               ; =48
 c776b78: 94102f31     	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 c776b7c: 9100a288     	add	x8, x20, #0x28
 c776b80: f100029f     	cmp	x20, #0x0
 c776b84: 9a8803e1     	csel	x1, xzr, x8, eq
 c776b88: 9100a2a8     	add	x8, x21, #0x28
 c776b8c: f10002bf     	cmp	x21, #0x0
 c776b90: 9a8803e2     	csel	x2, xzr, x8, eq
 c776b94: 940032ac     	bl	0xc783644 <_ChromeMain+0xc77e3a8>
 c776b98: f941ca74     	ldr	x20, [x19, #0x390]
 c776b9c: f901ca60     	str	x0, [x19, #0x390]
 c776ba0: b5000114     	cbnz	x20, 0xc776bc0 <_ChromeMain+0xc771924>
 c776ba4: 940032c2     	bl	0xc7836ac <_ChromeMain+0xc77e410>
 c776ba8: f941ca68     	ldr	x8, [x19, #0x390]
 c776bac: f9401100     	ldr	x0, [x8, #0x20]
 c776bb0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 c776bb4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 c776bb8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 c776bbc: d65f03c0     	ret
 c776bc0: aa1403e0     	mov	x0, x20
 c776bc4: 940032a6     	bl	0xc78365c <_ChromeMain+0xc77e3c0>
 c776bc8: 52800601     	mov	w1, #0x30               ; =48
 c776bcc: 94102f19     	bl	0xcb82830 <_ChromeMain+0xcb7d594>
 c776bd0: f941ca60     	ldr	x0, [x19, #0x390]
 c776bd4: 17fffff4     	b	0xc776ba4 <_ChromeMain+0xc771908>
