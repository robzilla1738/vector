
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4605d2c: 394a23e8     	ldrb	w8, [sp, #0x288]
 4605d30: 7100051f     	cmp	w8, #0x1
 4605d34: 54000f81     	b.ne	0x4605f24 <_ChromeMain+0x4600c88>
 4605d38: f94137e9     	ldr	x9, [sp, #0x268]
 4605d3c: b40005c9     	cbz	x9, 0x4605df4 <_ChromeMain+0x4600b58>
 4605d40: f9400d29     	ldr	x9, [x9, #0x18]
 4605d44: b4000589     	cbz	x9, 0x4605df4 <_ChromeMain+0x4600b58>
 4605d48: 394703e9     	ldrb	w9, [sp, #0x1c0]
 4605d4c: 34000429     	cbz	w9, 0x4605dd0 <_ChromeMain+0x4600b34>
 4605d50: 7100051f     	cmp	w8, #0x1
 4605d54: 54000fa1     	b.ne	0x4605f48 <_ChromeMain+0x4600cac>
 4605d58: f94137e8     	ldr	x8, [sp, #0x268]
 4605d5c: b40003a8     	cbz	x8, 0x4605dd0 <_ChromeMain+0x4600b34>
 4605d60: f9400d08     	ldr	x8, [x8, #0x18]
 4605d64: b4000368     	cbz	x8, 0x4605dd0 <_ChromeMain+0x4600b34>
 4605d68: 9106a3e0     	add	x0, sp, #0x1a8
 4605d6c: 97019b47     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 4605d70: 39c05c08     	ldrsb	w8, [x0, #0x17]
 4605d74: 37f80f28     	tbnz	w8, #0x1f, 0x4605f58 <_ChromeMain+0x4600cbc>
 4605d78: 3dc00000     	ldr	q0, [x0]
 4605d7c: f9400808     	ldr	x8, [x0, #0x10]
 4605d80: f90013e8     	str	x8, [sp, #0x20]
 4605d84: 3d8007e0     	str	q0, [sp, #0x10]
 4605d88: 910043e8     	add	x8, sp, #0x10
 4605d8c: f81803a8     	stur	x8, [x29, #-0x80]
 4605d90: 910de260     	add	x0, x19, #0x378
 4605d94: 910de261     	add	x1, x19, #0x378
 4605d98: d10203a3     	sub	x3, x29, #0x80
 4605d9c: d10243a4     	sub	x4, x29, #0x90
 4605da0: f0042e82     	adrp	x2, 0xcbd8000 <dyld_stub_binder+0xcbd8000>
 4605da4: 91392042     	add	x2, x2, #0xe48
 4605da8: 97ff7aee     	bl	0x45e4960 <_ChromeMain+0x45df6c4>
 4605dac: 9100e000     	add	x0, x0, #0x38
 4605db0: 910302a1     	add	x1, x21, #0xc0
 4605db4: 970caede     	bl	0x93192c <_ChromeMain+0x92c690>
 4605db8: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 4605dbc: 36f800a8     	tbz	w8, #0x1f, 0x4605dd0 <_ChromeMain+0x4600b34>
 4605dc0: f9400be0     	ldr	x0, [sp, #0x10]
 4605dc4: f94013e8     	ldr	x8, [sp, #0x20]
 4605dc8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4605dcc: 96e80c3b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4605dd0: 910043e8     	add	x8, sp, #0x10
 4605dd4: 9106a3e1     	add	x1, sp, #0x1a8
 4605dd8: aa1303e0     	mov	x0, x19
 4605ddc: 9400061b     	bl	0x4607648 <_ChromeMain+0x46023ac>
 4605de0: 9108c2a0     	add	x0, x21, #0x230
 4605de4: 910043e1     	add	x1, sp, #0x10
 4605de8: 9710cf18     	bl	0xa39a48 <_ChromeMain+0xa347ac>
 4605dec: 910043e0     	add	x0, sp, #0x10
 4605df0: 97090294     	bl	0x846840 <_ChromeMain+0x8415a4>
