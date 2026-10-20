
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425b784: 52800013     	mov	w19, #0x0               ; =0
 425b788: 1400000f     	b	0x425b7c4 <_ChromeMain+0x4256528>
 425b78c: f94033e8     	ldr	x8, [sp, #0x60]
 425b790: f100011f     	cmp	x8, #0x0
 425b794: f9402be8     	ldr	x8, [sp, #0x50]
 425b798: fa401900     	ccmp	x8, #0x0, #0x0, ne
 425b79c: 1a9f07f3     	cset	w19, ne
 425b7a0: 39cc7fe8     	ldrsb	w8, [sp, #0x31f]
 425b7a4: 37f83328     	tbnz	w8, #0x1f, 0x425be08 <_ChromeMain+0x4256b6c>
 425b7a8: 39cc1fe8     	ldrsb	w8, [sp, #0x307]
 425b7ac: 37f83388     	tbnz	w8, #0x1f, 0x425be1c <_ChromeMain+0x4256b80>
 425b7b0: f94053e1     	ldr	x1, [sp, #0xa0]
 425b7b4: 910263e8     	add	x8, sp, #0x98
 425b7b8: f90193e8     	str	x8, [sp, #0x320]
 425b7bc: 910c83e0     	add	x0, sp, #0x320
 425b7c0: 971314bb     	bl	0x720aac <_ChromeMain+0x71b810>
 425b7c4: f85a03a8     	ldur	x8, [x29, #-0x60]
 425b7c8: b004ee69     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 425b7cc: f940f929     	ldr	x9, [x9, #0x1f0]
 425b7d0: f9400129     	ldr	x9, [x9]
 425b7d4: eb08013f     	cmp	x9, x8
