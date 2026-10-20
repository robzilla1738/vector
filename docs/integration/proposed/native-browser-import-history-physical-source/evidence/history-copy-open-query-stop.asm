
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
 4254534: f90123ff     	str	xzr, [sp, #0x240]
 4254538: f9011fff     	str	xzr, [sp, #0x238]
 425453c: f90127ff     	str	xzr, [sp, #0x248]
 4254540: f90117ff     	str	xzr, [sp, #0x228]
 4254544: f90113ff     	str	xzr, [sp, #0x220]
 4254548: f9011bff     	str	xzr, [sp, #0x230]
 425454c: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254550: 37f86ba8     	tbnz	w8, #0x1f, 0x42552c4 <_ChromeMain+0x4250028>
 4254554: 52800008     	mov	w8, #0x0                ; =0
 4254558: 3cd803a0     	ldur	q0, [x29, #-0x80]
 425455c: 3d808be0     	str	q0, [sp, #0x220]
 4254560: f85903a9     	ldur	x9, [x29, #-0x70]
 4254564: f9011be9     	str	x9, [sp, #0x230]
 4254568: 93407d08     	sxtw	x8, w8
 425456c: b50003a8     	cbnz	x8, 0x42545e0 <_ChromeMain+0x424f344>
 4254570: d00473c0     	adrp	x0, 0xd0ce000 <dyld_stub_binder+0xd0ce000>
 4254574: 91178c00     	add	x0, x0, #0x5e3
 4254578: 9108e3e2     	add	x2, sp, #0x238
 425457c: 52800141     	mov	w1, #0xa                ; =10
 4254580: 97b8d2d4     	bl	0x30890d0 <_ChromeMain+0x3083e34>
 4254584: 340002e0     	cbz	w0, 0x42545e0 <_ChromeMain+0x424f344>
 4254588: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 425458c: f9002bff     	str	xzr, [sp, #0x50]
 4254590: 9004bfe1     	adrp	x1, 0xda50000 <dyld_stub_binder+0xda50000>
 4254594: 9126dc21     	add	x1, x1, #0x9b7
 4254598: 910103e8     	add	x8, sp, #0x40
 425459c: 9108e3e0     	add	x0, sp, #0x238
 42545a0: 528000e2     	mov	w2, #0x7                ; =7
 42545a4: 9751139c     	bl	0x1699414 <_ChromeMain+0x1694178>
 42545a8: d10203a0     	sub	x0, x29, #0x80
 42545ac: 910103e1     	add	x1, sp, #0x40
 42545b0: 9516d904     	bl	0x880a9c0 <_ChromeMain+0x8805724>
 42545b4: 34000120     	cbz	w0, 0x42545d8 <_ChromeMain+0x424f33c>
 42545b8: 39c8dfe9     	ldrsb	w9, [sp, #0x237]
 42545bc: 39415fe8     	ldrb	w8, [sp, #0x57]
 42545c0: 37f87f89     	tbnz	w9, #0x1f, 0x42555b0 <_ChromeMain+0x4250314>
 42545c4: 37386468     	tbnz	w8, #0x7, 0x4255250 <_ChromeMain+0x424ffb4>
 42545c8: 3dc013e0     	ldr	q0, [sp, #0x40]
 42545cc: 3d808be0     	str	q0, [sp, #0x220]
 42545d0: f9402be8     	ldr	x8, [sp, #0x50]
 42545d4: f9011be8     	str	x8, [sp, #0x230]
 42545d8: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 42545dc: 37f86848     	tbnz	w8, #0x1f, 0x42552e4 <_ChromeMain+0x4250048>
 42545e0: 6f00e400     	movi.2d	v0, #0000000000000000
 42545e4: ad0983e0     	stp	q0, q0, [sp, #0x130]
 42545e8: ad0883e0     	stp	q0, q0, [sp, #0x110]
 42545ec: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 42545f0: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 42545f4: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 42545f8: ad0483e0     	stp	q0, q0, [sp, #0x90]
 42545fc: ad0383e0     	stp	q0, q0, [sp, #0x70]
 4254600: ad0283e0     	stp	q0, q0, [sp, #0x50]
 4254604: 3d8013e0     	str	q0, [sp, #0x40]
 4254608: 9004af01     	adrp	x1, 0xd834000 <dyld_stub_binder+0xd834000>
 425460c: 91299421     	add	x1, x1, #0xa65
 4254610: 910103e0     	add	x0, sp, #0x40
 4254614: 97b6eccd     	bl	0x300f948 <_ChromeMain+0x300a6ac>
 4254618: 910103e0     	add	x0, sp, #0x40
 425461c: 910883e1     	add	x1, sp, #0x220
 4254620: 974c3419     	bl	0x1561684 <_ChromeMain+0x155c3e8>
 4254624: 34000300     	cbz	w0, 0x4254684 <_ChromeMain+0x424f3e8>
 4254628: 910623fa     	add	x26, sp, #0x188
 425462c: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 4254630: f81783bf     	stur	xzr, [x29, #-0x88]
 4254634: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254638: 9112b421     	add	x1, x1, #0x4ad
 425463c: 910103e0     	add	x0, sp, #0x40
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
