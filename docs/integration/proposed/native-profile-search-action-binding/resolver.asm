
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40c9570: d10203ff     	sub	sp, sp, #0x80
 40c9574: a90367fa     	stp	x26, x25, [sp, #0x30]
 40c9578: a9045ff8     	stp	x24, x23, [sp, #0x40]
 40c957c: a90557f6     	stp	x22, x21, [sp, #0x50]
 40c9580: a9064ff4     	stp	x20, x19, [sp, #0x60]
 40c9584: a9077bfd     	stp	x29, x30, [sp, #0x70]
 40c9588: 9101c3fd     	add	x29, sp, #0x70
 40c958c: aa0503f3     	mov	x19, x5
 40c9590: aa0403f7     	mov	x23, x4
 40c9594: aa0303f8     	mov	x24, x3
 40c9598: aa0203f4     	mov	x20, x2
 40c959c: aa0103f5     	mov	x21, x1
 40c95a0: f004fae8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 40c95a4: f940f908     	ldr	x8, [x8, #0x1f0]
 40c95a8: f9400108     	ldr	x8, [x8]
 40c95ac: f90017e8     	str	x8, [sp, #0x28]
 40c95b0: b4000142     	cbz	x2, 0x40c95d8 <_ChromeMain+0x40c433c>
 40c95b4: d004b0c1     	adrp	x1, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 40c95b8: 91396021     	add	x1, x1, #0xe58
 40c95bc: 91002280     	add	x0, x20, #0x8
 40c95c0: 96fe26ec     	bl	0x53170 <_ChromeMain+0x4ded4>
 40c95c4: b40000a0     	cbz	x0, 0x40c95d8 <_ChromeMain+0x40c433c>
 40c95c8: f9400808     	ldr	x8, [x0, #0x10]
 40c95cc: b4000068     	cbz	x8, 0x40c95d8 <_ChromeMain+0x40c433c>
 40c95d0: 19404108     	ldapurb	w8, [x8, #0x4]
 40c95d4: 34000548     	cbz	w8, 0x40c967c <_ChromeMain+0x40c43e0>
 40c95d8: d2800019     	mov	x25, #0x0               ; =0
 40c95dc: aa1903f6     	mov	x22, x25
 40c95e0: b4000078     	cbz	x24, 0x40c95ec <_ChromeMain+0x40c4350>
 40c95e4: aa1903f6     	mov	x22, x25
 40c95e8: b4000559     	cbz	x25, 0x40c9690 <_ChromeMain+0x40c43f4>
 40c95ec: b40005d6     	cbz	x22, 0x40c96a4 <_ChromeMain+0x40c4408>
 40c95f0: 90053e61     	adrp	x1, 0xe895000 <dyld_stub_binder+0xe895000>
 40c95f4: 91018021     	add	x1, x1, #0x60
 40c95f8: 910562c0     	add	x0, x22, #0x158
 40c95fc: 97012c2c     	bl	0x1146ac <_ChromeMain+0x10f410>
 40c9600: b4000420     	cbz	x0, 0x40c9684 <_ChromeMain+0x40c43e8>
 40c9604: f94116a1     	ldr	x1, [x21, #0x228]
 40c9608: f9400008     	ldr	x8, [x0]
 40c960c: f9400108     	ldr	x8, [x8]
 40c9610: d63f0100     	blr	x8
 40c9614: b4000a20     	cbz	x0, 0x40c9758 <_ChromeMain+0x40c44bc>
 40c9618: aa0003f7     	mov	x23, x0
 40c961c: d0053b21     	adrp	x1, 0xe82f000 <dyld_stub_binder+0xe82f000>
 40c9620: 910a0021     	add	x1, x1, #0x280
 40c9624: 910562c0     	add	x0, x22, #0x158
 40c9628: 97012c21     	bl	0x1146ac <_ChromeMain+0x10f410>
 40c962c: b4000680     	cbz	x0, 0x40c96fc <_ChromeMain+0x40c4460>
 40c9630: f9401408     	ldr	x8, [x0, #0x28]
 40c9634: b4000ba8     	cbz	x8, 0x40c97a8 <_ChromeMain+0x40c450c>
 40c9638: f9404908     	ldr	x8, [x8, #0x90]
 40c963c: b4000608     	cbz	x8, 0x40c96fc <_ChromeMain+0x40c4460>
 40c9640: f9402101     	ldr	x1, [x8, #0x40]
 40c9644: b40005c1     	cbz	x1, 0x40c96fc <_ChromeMain+0x40c4460>
 40c9648: aa1703e0     	mov	x0, x23
 40c964c: 94031003     	bl	0x418d658 <_ChromeMain+0x41883bc>
 40c9650: 36000560     	tbz	w0, #0x0, 0x40c96fc <_ChromeMain+0x40c4460>
 40c9654: b50004f9     	cbnz	x25, 0x40c96f0 <_ChromeMain+0x40c4454>
 40c9658: f9402ac0     	ldr	x0, [x22, #0x50]
 40c965c: f9400008     	ldr	x8, [x0]
 40c9660: f9403508     	ldr	x8, [x8, #0x68]
 40c9664: d63f0100     	blr	x8
 40c9668: 52800034     	mov	w20, #0x1               ; =1
 40c966c: aa1703e0     	mov	x0, x23
 40c9670: 52800021     	mov	w1, #0x1                ; =1
 40c9674: 940310d3     	bl	0x418d9c0 <_ChromeMain+0x4188724>
 40c9678: 14000010     	b	0x40c96b8 <_ChromeMain+0x40c441c>
 40c967c: f9400c19     	ldr	x25, [x0, #0x18]
 40c9680: 17ffffd7     	b	0x40c95dc <_ChromeMain+0x40c4340>
 40c9684: d00470c1     	adrp	x1, 0xcee3000 <dyld_stub_binder+0xcee3000>
 40c9688: 91116c21     	add	x1, x1, #0x45b
 40c968c: 14000008     	b	0x40c96ac <_ChromeMain+0x40c4410>
 40c9690: aa1803e0     	mov	x0, x24
 40c9694: aa1703e1     	mov	x1, x23
 40c9698: 94d53e36     	bl	0x7618f70 <_ChromeMain+0x7613cd4>
 40c969c: aa0003f6     	mov	x22, x0
 40c96a0: b5fffa96     	cbnz	x22, 0x40c95f0 <_ChromeMain+0x40c4354>
 40c96a4: d00470c1     	adrp	x1, 0xcee3000 <dyld_stub_binder+0xcee3000>
 40c96a8: 9110c821     	add	x1, x1, #0x432
 40c96ac: aa1303e0     	mov	x0, x19
 40c96b0: 974cb925     	bl	0x13f7b44 <_ChromeMain+0x13f28a8>
 40c96b4: 52800014     	mov	w20, #0x0               ; =0
 40c96b8: f94017e8     	ldr	x8, [sp, #0x28]
 40c96bc: f004fae9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 40c96c0: f940f929     	ldr	x9, [x9, #0x1f0]
 40c96c4: f9400129     	ldr	x9, [x9]
 40c96c8: eb08013f     	cmp	x9, x8
 40c96cc: 540006c1     	b.ne	0x40c97a4 <_ChromeMain+0x40c4508>
 40c96d0: aa1403e0     	mov	x0, x20
 40c96d4: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 40c96d8: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 40c96dc: a94557f6     	ldp	x22, x21, [sp, #0x50]
 40c96e0: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 40c96e4: a94367fa     	ldp	x26, x25, [sp, #0x30]
 40c96e8: 910203ff     	add	sp, sp, #0x80
 40c96ec: d65f03c0     	ret
 40c96f0: aa1403e0     	mov	x0, x20
 40c96f4: 94a1f918     	bl	0x6947b54 <_ChromeMain+0x69428b8>
 40c96f8: 17ffffd8     	b	0x40c9658 <_ChromeMain+0x40c43bc>
 40c96fc: f94116a8     	ldr	x8, [x21, #0x228]
 40c9700: 39805d09     	ldrsb	x9, [x8, #0x17]
 40c9704: a9402d0a     	ldp	x10, x11, [x8]
 40c9708: f100013f     	cmp	x9, #0x0
 40c970c: 9a884148     	csel	x8, x10, x8, mi
 40c9710: 7100013f     	cmp	w9, #0x0
 40c9714: 9a894169     	csel	x9, x11, x9, mi
 40c9718: a901a7e8     	stp	x8, x9, [sp, #0x18]
 40c971c: d00470c0     	adrp	x0, 0xcee3000 <dyld_stub_binder+0xcee3000>
 40c9720: 91129800     	add	x0, x0, #0x4a6
 40c9724: 910003e8     	mov	x8, sp
 40c9728: 910063e2     	add	x2, sp, #0x18
 40c972c: 52800721     	mov	w1, #0x39               ; =57
 40c9730: 52800023     	mov	w3, #0x1                ; =1
 40c9734: 95866cc0     	bl	0xa264a34 <_ChromeMain+0xa25f798>
 40c9738: 39c05e68     	ldrsb	w8, [x19, #0x17]
 40c973c: 37f802a8     	tbnz	w8, #0x1f, 0x40c9790 <_ChromeMain+0x40c44f4>
 40c9740: 52800014     	mov	w20, #0x0               ; =0
 40c9744: 3dc003e0     	ldr	q0, [sp]
 40c9748: 3d800260     	str	q0, [x19]
 40c974c: f9400be8     	ldr	x8, [sp, #0x10]
 40c9750: f9000a68     	str	x8, [x19, #0x10]
 40c9754: 17ffffd9     	b	0x40c96b8 <_ChromeMain+0x40c441c>
 40c9758: f94116a8     	ldr	x8, [x21, #0x228]
 40c975c: 39805d09     	ldrsb	x9, [x8, #0x17]
 40c9760: a9402d0a     	ldp	x10, x11, [x8]
 40c9764: f100013f     	cmp	x9, #0x0
 40c9768: 9a884148     	csel	x8, x10, x8, mi
 40c976c: 7100013f     	cmp	w9, #0x0
 40c9770: 9a894169     	csel	x9, x11, x9, mi
 40c9774: a901a7e8     	stp	x8, x9, [sp, #0x18]
 40c9778: d00470c0     	adrp	x0, 0xcee3000 <dyld_stub_binder+0xcee3000>
 40c977c: 9111e800     	add	x0, x0, #0x47a
 40c9780: 910003e8     	mov	x8, sp
 40c9784: 910063e2     	add	x2, sp, #0x18
 40c9788: 52800561     	mov	w1, #0x2b               ; =43
 40c978c: 17ffffe9     	b	0x40c9730 <_ChromeMain+0x40c4494>
 40c9790: f9400260     	ldr	x0, [x19]
 40c9794: f9400a68     	ldr	x8, [x19, #0x10]
 40c9798: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40c979c: 96fcfdc7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40c97a0: 17ffffe8     	b	0x40c9740 <_ChromeMain+0x40c44a4>
 40c97a4: 94fceaef     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 40c97a8: d4200000     	brk	#0
 40c97ac: d4400000     	hlt	#0
 40c97b0: d4200020     	brk	#0x1
