
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41035c0: d10203ff     	sub	sp, sp, #0x80
 41035c4: a90557f6     	stp	x22, x21, [sp, #0x50]
 41035c8: a9064ff4     	stp	x20, x19, [sp, #0x60]
 41035cc: a9077bfd     	stp	x29, x30, [sp, #0x70]
 41035d0: 9101c3fd     	add	x29, sp, #0x70
 41035d4: b40003a0     	cbz	x0, 0x4103648 <_ChromeMain+0x40fe3ac>
 41035d8: aa0003f4     	mov	x20, x0
 41035dc: d2800013     	mov	x19, #0x0               ; =0
 41035e0: 39412008     	ldrb	w8, [x0, #0x48]
 41035e4: 37000348     	tbnz	w8, #0x0, 0x410364c <_ChromeMain+0x40fe3b0>
 41035e8: f0056f15     	adrp	x21, 0xeee6000 <dyld_stub_binder+0xeee6000>
 41035ec: f9467ea0     	ldr	x0, [x21, #0xcf8]
 41035f0: b40002e0     	cbz	x0, 0x410364c <_ChromeMain+0x40fe3b0>
 41035f4: 97647161     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 41035f8: b4000280     	cbz	x0, 0x4103648 <_ChromeMain+0x40fe3ac>
 41035fc: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 4103600: f90027ff     	str	xzr, [sp, #0x48]
 4103604: f9467ea0     	ldr	x0, [x21, #0xcf8]
 4103608: 9764715c     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 410360c: 97647181     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4103610: 9100e3e8     	add	x8, sp, #0x38
 4103614: 97a8e633     	bl	0x2b3cee0 <_ChromeMain+0x2b37c44>
 4103618: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 410361c: f9001bff     	str	xzr, [sp, #0x30]
 4103620: f9400288     	ldr	x8, [x20]
 4103624: f9401909     	ldr	x9, [x8, #0x30]
 4103628: 910083e8     	add	x8, sp, #0x20
 410362c: aa1403e0     	mov	x0, x20
 4103630: d63f0120     	blr	x9
 4103634: f94023e8     	ldr	x8, [sp, #0x40]
 4103638: b4000168     	cbz	x8, 0x4103664 <_ChromeMain+0x40fe3c8>
 410363c: d2800014     	mov	x20, #0x0               ; =0
 4103640: f9401fe9     	ldr	x9, [sp, #0x38]
 4103644: 14000026     	b	0x41036dc <_ChromeMain+0x40fe440>
 4103648: d2800013     	mov	x19, #0x0               ; =0
 410364c: aa1303e0     	mov	x0, x19
 4103650: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4103654: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4103658: a94557f6     	ldp	x22, x21, [sp, #0x50]
 410365c: 910203ff     	add	sp, sp, #0x80
 4103660: d65f03c0     	ret
 4103664: d2800013     	mov	x19, #0x0               ; =0
 4103668: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 410366c: 37f80248     	tbnz	w8, #0x1f, 0x41036b4 <_ChromeMain+0x40fe418>
 4103670: f9401fe0     	ldr	x0, [sp, #0x38]
 4103674: b4fffec0     	cbz	x0, 0x410364c <_ChromeMain+0x40fe3b0>
 4103678: f94023e8     	ldr	x8, [sp, #0x40]
 410367c: d37df109     	lsl	x9, x8, #3
 4103680: b4000109     	cbz	x9, 0x41036a0 <_ChromeMain+0x40fe404>
 4103684: cb080fe8     	neg	x8, x8, lsl #3
 4103688: 8b000129     	add	x9, x9, x0
 410368c: d1002129     	sub	x9, x9, #0x8
 4103690: b40005c9     	cbz	x9, 0x4103748 <_ChromeMain+0x40fe4ac>
 4103694: d1002129     	sub	x9, x9, #0x8
 4103698: 91002108     	add	x8, x8, #0x8
 410369c: b5ffffa8     	cbnz	x8, 0x4103690 <_ChromeMain+0x40fe3f4>
 41036a0: f90023ff     	str	xzr, [sp, #0x40]
 41036a4: f94027e8     	ldr	x8, [sp, #0x48]
 41036a8: d37df101     	lsl	x1, x8, #3
 41036ac: 96fc1603     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41036b0: 17ffffe7     	b	0x410364c <_ChromeMain+0x40fe3b0>
 41036b4: f94013e0     	ldr	x0, [sp, #0x20]
 41036b8: f9401be8     	ldr	x8, [sp, #0x30]
 41036bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41036c0: 96fc15fe     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41036c4: 17ffffeb     	b	0x4103670 <_ChromeMain+0x40fe3d4>
 41036c8: 37000333     	tbnz	w19, #0x0, 0x410372c <_ChromeMain+0x40fe490>
 41036cc: a943a3e9     	ldp	x9, x8, [sp, #0x38]
 41036d0: 91000694     	add	x20, x20, #0x1
 41036d4: eb08029f     	cmp	x20, x8
 41036d8: 54fffc62     	b.hs	0x4103664 <_ChromeMain+0x40fe3c8>
 41036dc: f874792a     	ldr	x10, [x9, x20, lsl #3]
 41036e0: b4ffff8a     	cbz	x10, 0x41036d0 <_ChromeMain+0x40fe434>
 41036e4: f8747928     	ldr	x8, [x9, x20, lsl #3]
 41036e8: 39c0bd09     	ldrsb	w9, [x8, #0x2f]
 41036ec: 37f80269     	tbnz	w9, #0x1f, 0x4103738 <_ChromeMain+0x40fe49c>
 41036f0: 3cc18100     	ldur	q0, [x8, #0x18]
 41036f4: f8428108     	ldur	x8, [x8, #0x28]
 41036f8: f9000be8     	str	x8, [sp, #0x10]
 41036fc: 3d8003e0     	str	q0, [sp]
 4103700: 910003e0     	mov	x0, sp
 4103704: 910083e1     	add	x1, sp, #0x20
 4103708: 973f227f     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 410370c: aa0003f3     	mov	x19, x0
 4103710: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4103714: 36fffda8     	tbz	w8, #0x1f, 0x41036c8 <_ChromeMain+0x40fe42c>
 4103718: f94003e0     	ldr	x0, [sp]
 410371c: f9400be8     	ldr	x8, [sp, #0x10]
 4103720: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4103724: 96fc15e5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4103728: 3607fd33     	tbz	w19, #0x0, 0x41036cc <_ChromeMain+0x40fe430>
 410372c: d2c00033     	mov	x19, #0x100000000       ; =4294967296
 4103730: b3407e93     	bfxil	x19, x20, #0, #32
 4103734: 17ffffcd     	b	0x4103668 <_ChromeMain+0x40fe3cc>
 4103738: a9418901     	ldp	x1, x2, [x8, #0x18]
 410373c: 910003e0     	mov	x0, sp
 4103740: 96fc52b6     	bl	0x18218 <_ChromeMain+0x12f7c>
 4103744: 17ffffef     	b	0x4103700 <_ChromeMain+0x40fe464>
 4103748: d4200020     	brk	#0x1
