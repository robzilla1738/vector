
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46051e4: 6db923e9     	stp	d9, d8, [sp, #-0x70]!
 46051e8: a9016ffc     	stp	x28, x27, [sp, #0x10]
 46051ec: a90267fa     	stp	x26, x25, [sp, #0x20]
 46051f0: a9035ff8     	stp	x24, x23, [sp, #0x30]
 46051f4: a90457f6     	stp	x22, x21, [sp, #0x40]
 46051f8: a9054ff4     	stp	x20, x19, [sp, #0x50]
 46051fc: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4605200: 910183fd     	add	x29, sp, #0x60
 4605204: d111c3ff     	sub	sp, sp, #0x470
 4605208: f941a008     	ldr	x8, [x0, #0x340]
 460520c: b40005e8     	cbz	x8, 0x46052c8 <_ChromeMain+0x460002c>
 4605210: aa0003f3     	mov	x19, x0
 4605214: a935ffbf     	stp	xzr, xzr, [x29, #-0xa8]
 4605218: f81683bf     	stur	xzr, [x29, #-0x98]
 460521c: f9403500     	ldr	x0, [x8, #0x68]
 4605220: d102a3a8     	sub	x8, x29, #0xa8
 4605224: 97ef3d0f     	bl	0x41d4660 <_ChromeMain+0x41cf3c4>
 4605228: a9347fbf     	stp	xzr, xzr, [x29, #-0xc0]
 460522c: f81503bf     	stur	xzr, [x29, #-0xb0]
 4605230: f85603b4     	ldur	x20, [x29, #-0xa0]
 4605234: b4000b14     	cbz	x20, 0x4605394 <_ChromeMain+0x46000f8>
 4605238: d291dee8     	mov	x8, #0x8ef7             ; =36599
 460523c: f2b03528     	movk	x8, #0x81a9, lsl #16
 4605240: f2cc77a8     	movk	x8, #0x63bd, lsl #32
 4605244: f2e00d48     	movk	x8, #0x6a, lsl #48
 4605248: eb08029f     	cmp	x20, x8
 460524c: 54006ce2     	b.hs	0x4605fe8 <_ChromeMain+0x4600d4c>
 4605250: d10303b5     	sub	x21, x29, #0xc0
 4605254: 52804d16     	mov	w22, #0x268             ; =616
 4605258: 9b167e80     	mul	x0, x20, x22
 460525c: 96e82843     	bl	0xf368 <_ChromeMain+0xa0cc>
