
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4605a28: f941a268     	ldr	x8, [x19, #0x340]
 4605a2c: b4000708     	cbz	x8, 0x4605b0c <_ChromeMain+0x4600870>
 4605a30: 394703e8     	ldrb	w8, [sp, #0x1c0]
 4605a34: 360006c8     	tbz	w8, #0x0, 0x4605b0c <_ChromeMain+0x4600870>
 4605a38: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4605a3c: f90013ff     	str	xzr, [sp, #0x20]
 4605a40: 9106a3e0     	add	x0, sp, #0x1a8
 4605a44: 97019c11     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 4605a48: 39c05c08     	ldrsb	w8, [x0, #0x17]
 4605a4c: 37fffe08     	tbnz	w8, #0x1f, 0x4605a0c <_ChromeMain+0x4600770>
 4605a50: 3dc00000     	ldr	q0, [x0]
 4605a54: f9400808     	ldr	x8, [x0, #0x10]
 4605a58: f90013e8     	str	x8, [sp, #0x20]
 4605a5c: 3d8007e0     	str	q0, [sp, #0x10]
 4605a60: 910e0268     	add	x8, x19, #0x380
 4605a64: f9400119     	ldr	x25, [x8]
 4605a68: b4fff139     	cbz	x25, 0x460588c <_ChromeMain+0x46005f0>
 4605a6c: 39809fe8     	ldrsb	x8, [sp, #0x27]
 4605a70: a9412be9     	ldp	x9, x10, [sp, #0x10]
 4605a74: f100011f     	cmp	x8, #0x0
 4605a78: 910043eb     	add	x11, sp, #0x10
 4605a7c: 9a8b4138     	csel	x24, x9, x11, mi
 4605a80: 7100011f     	cmp	w8, #0x0
 4605a84: 9a884157     	csel	x23, x10, x8, mi
