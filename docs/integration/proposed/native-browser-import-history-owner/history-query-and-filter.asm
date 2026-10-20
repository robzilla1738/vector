
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4254640: 528009c2     	mov	w2, #0x4e               ; =78
 4254644: 52800003     	mov	w3, #0x0                ; =0
 4254648: 9722a62e     	bl	0xafdf00 <_ChromeMain+0xaf8c64>
 425464c: f81603a0     	stur	x0, [x29, #-0xa0]
 4254650: 381683bf     	sturb	wzr, [x29, #-0x98]
 4254654: 3816c3bf     	sturb	wzr, [x29, #-0x94]
 4254658: 381703bf     	sturb	wzr, [x29, #-0x90]
 425465c: 381783bf     	sturb	wzr, [x29, #-0x88]
 4254660: f9401408     	ldr	x8, [x0, #0x28]
 4254664: b40000a8     	cbz	x8, 0x4254678 <_ChromeMain+0x424f3dc>
 4254668: d10283a0     	sub	x0, x29, #0xa0
 425466c: 9718f015     	bl	0x8906c0 <_ChromeMain+0x88b424>
 4254670: 7101901f     	cmp	w0, #0x64
 4254674: 54004a80     	b.eq	0x4254fc4 <_ChromeMain+0x424fd28>
 4254678: d10283a0     	sub	x0, x29, #0xa0
 425467c: 9722a132     	bl	0xafcb44 <_ChromeMain+0xaf78a8>
 4254680: 910623fa     	add	x26, sp, #0x188
 4254684: 910103e0     	add	x0, sp, #0x40
 4254688: 97686ad7     	bl	0x1c6f1e4 <_ChromeMain+0x1c69f48>
 425468c: 39c8dfe8     	ldrsb	w8, [sp, #0x237]
 4254690: 37f85e88     	tbnz	w8, #0x1f, 0x4255260 <_ChromeMain+0x424ffc4>
 4254694: 39c93fe8     	ldrsb	w8, [sp, #0x24f]
 4254698: 36f87ca8     	tbz	w8, #0x1f, 0x425562c <_ChromeMain+0x4250390>
 425469c: f94123e8     	ldr	x8, [sp, #0x240]
