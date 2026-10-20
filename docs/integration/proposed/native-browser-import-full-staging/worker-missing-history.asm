
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42544a8: 9b097d19     	mul	x25, x8, x9
 42544ac: b4006d00     	cbz	x0, 0x425524c <_ChromeMain+0x424ffb0>
 42544b0: 94005bc4     	bl	0x426b3c0 <_ChromeMain+0x4266124>
 42544b4: d102c000     	sub	x0, x0, #0xb0
 42544b8: b102c339     	adds	x25, x25, #0xb0
 42544bc: 54ffff81     	b.ne	0x42544ac <_ChromeMain+0x424f210>
 42544c0: f94023e0     	ldr	x0, [sp, #0x40]
 42544c4: cb000308     	sub	x8, x24, x0
 42544c8: 9344fd08     	asr	x8, x8, #4
 42544cc: d2917469     	mov	x9, #0x8ba3             ; =35747
 42544d0: f2b745c9     	movk	x9, #0xba2e, lsl #16
 42544d4: f2d45d09     	movk	x9, #0xa2e8, lsl #32
 42544d8: f2e5d169     	movk	x9, #0x2e8b, lsl #48
 42544dc: 9b097d08     	mul	x8, x8, x9
 42544e0: f90027e8     	str	x8, [sp, #0x48]
 42544e4: f9402be8     	ldr	x8, [sp, #0x50]
 42544e8: 52801609     	mov	w9, #0xb0               ; =176
 42544ec: 9b097d01     	mul	x1, x8, x9
 42544f0: 96f6d272     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42544f4: 17ffffd0     	b	0x4254434 <_ChromeMain+0x424f198>
 42544f8: aa1803e0     	mov	x0, x24
 42544fc: 17fffff2     	b	0x42544c4 <_ChromeMain+0x424f228>
 4254500: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4254504: f90013ff     	str	xzr, [sp, #0x20]
 4254508: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 425450c: f81903bf     	stur	xzr, [x29, #-0x70]
 4254510: 9004bfe1     	adrp	x1, 0xda50000 <dyld_stub_binder+0xda50000>
 4254514: 9126dc21     	add	x1, x1, #0x9b7
 4254518: d10203a8     	sub	x8, x29, #0x80
 425451c: 9105c3e0     	add	x0, sp, #0x170
 4254520: 528000e2     	mov	w2, #0x7                ; =7
 4254524: 975113bc     	bl	0x1699414 <_ChromeMain+0x1694178>
 4254528: d10203a0     	sub	x0, x29, #0x80
 425452c: 977f3fc5     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 4254530: 34000ce0     	cbz	w0, 0x42546cc <_ChromeMain+0x424f430>
