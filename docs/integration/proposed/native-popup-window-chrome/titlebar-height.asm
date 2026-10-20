
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4550500: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 4550504: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4550508: a90257f6     	stp	x22, x21, [sp, #0x20]
 455050c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4550510: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4550514: 910103fd     	add	x29, sp, #0x40
 4550518: aa0203f3     	mov	x19, x2
 455051c: aa0103f4     	mov	x20, x1
 4550520: f9406408     	ldr	x8, [x0, #0xc8]
 4550524: b4001188     	cbz	x8, 0x4550754 <_ChromeMain+0x454b4b8>
 4550528: aa0003f5     	mov	x21, x0
 455052c: f9429d08     	ldr	x8, [x8, #0x538]
 4550530: b4000d68     	cbz	x8, 0x45506dc <_ChromeMain+0x454b440>
 4550534: 91062119     	add	x25, x8, #0x188
 4550538: f940c508     	ldr	x8, [x8, #0x188]
 455053c: d0053317     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4550540: 90052c38     	adrp	x24, 0xead4000 <dyld_stub_binder+0xead4000>
 4550544: 912b4318     	add	x24, x24, #0xad0
 4550548: b4000288     	cbz	x8, 0x4550598 <_ChromeMain+0x454b2fc>
 455054c: 1400000d     	b	0x4550580 <_ChromeMain+0x454b2e4>
 4550550: eb19011f     	cmp	x8, x25
 4550554: 54000220     	b.eq	0x4550598 <_ChromeMain+0x454b2fc>
 4550558: f9401516     	ldr	x22, [x8, #0x28]
 455055c: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4550560: f94046e9     	ldr	x9, [x23, #0x88]
 4550564: eb09011f     	cmp	x8, x9
 4550568: 540001a1     	b.ne	0x455059c <_ChromeMain+0x454b300>
 455056c: aa1603e0     	mov	x0, x22
 4550570: 96eb0f63     	bl	0x142fc <_ChromeMain+0xf060>
 4550574: 1400000a     	b	0x455059c <_ChromeMain+0x454b300>
 4550578: f9400108     	ldr	x8, [x8]
 455057c: b40000e8     	cbz	x8, 0x4550598 <_ChromeMain+0x454b2fc>
 4550580: f9401109     	ldr	x9, [x8, #0x20]
 4550584: eb18013f     	cmp	x9, x24
 4550588: 54ffff88     	b.hi	0x4550578 <_ChromeMain+0x454b2dc>
 455058c: 54fffe20     	b.eq	0x4550550 <_ChromeMain+0x454b2b4>
 4550590: f9400508     	ldr	x8, [x8, #0x8]
 4550594: b5ffff68     	cbnz	x8, 0x4550580 <_ChromeMain+0x454b2e4>
 4550598: d2800016     	mov	x22, #0x0               ; =0
 455059c: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45505a0: f94046e9     	ldr	x9, [x23, #0x88]
 45505a4: eb09011f     	cmp	x8, x9
 45505a8: 54000061     	b.ne	0x45505b4 <_ChromeMain+0x454b318>
 45505ac: aa1603e0     	mov	x0, x22
 45505b0: 96eb4923     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45505b4: 39c0fec8     	ldrsb	w8, [x22, #0x3f]
 45505b8: 37f80088     	tbnz	w8, #0x1f, 0x45505c8 <_ChromeMain+0x454b32c>
 45505bc: f9400328     	ldr	x8, [x25]
 45505c0: b4000588     	cbz	x8, 0x4550670 <_ChromeMain+0x454b3d4>
 45505c4: 14000025     	b	0x4550658 <_ChromeMain+0x454b3bc>
 45505c8: f9401ac8     	ldr	x8, [x22, #0x30]
 45505cc: f100711f     	cmp	x8, #0x1c
 45505d0: 54ffff61     	b.ne	0x45505bc <_ChromeMain+0x454b320>
 45505d4: f94016c8     	ldr	x8, [x22, #0x28]
 45505d8: f0044c29     	adrp	x9, 0xced7000 <dyld_stub_binder+0xced7000>
 45505dc: 910e6529     	add	x9, x9, #0x399
 45505e0: a9402d0a     	ldp	x10, x11, [x8]
 45505e4: a940352c     	ldp	x12, x13, [x9]
 45505e8: f940090e     	ldr	x14, [x8, #0x10]
 45505ec: f940092f     	ldr	x15, [x9, #0x10]
 45505f0: b9401908     	ldr	w8, [x8, #0x18]
 45505f4: b9401929     	ldr	w9, [x9, #0x18]
 45505f8: eb0c015f     	cmp	x10, x12
 45505fc: fa4d0160     	ccmp	x11, x13, #0x0, eq
 4550600: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 4550604: fa490100     	ccmp	x8, x9, #0x0, eq
 4550608: 54fffda1     	b.ne	0x45505bc <_ChromeMain+0x454b320>
 455060c: f94066a8     	ldr	x8, [x21, #0xc8]
 4550610: f9429d09     	ldr	x9, [x8, #0x538]
 4550614: b4000b29     	cbz	x9, 0x4550778 <_ChromeMain+0x454b4dc>
 4550618: f940c528     	ldr	x8, [x9, #0x188]
 455061c: b4000c48     	cbz	x8, 0x45507a4 <_ChromeMain+0x454b508>
 4550620: 91062129     	add	x9, x9, #0x188
 4550624: 1400005a     	b	0x455078c <_ChromeMain+0x454b4f0>
 4550628: eb19011f     	cmp	x8, x25
 455062c: 54000220     	b.eq	0x4550670 <_ChromeMain+0x454b3d4>
 4550630: f9401516     	ldr	x22, [x8, #0x28]
 4550634: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4550638: f94046e9     	ldr	x9, [x23, #0x88]
 455063c: eb09011f     	cmp	x8, x9
 4550640: 540001a1     	b.ne	0x4550674 <_ChromeMain+0x454b3d8>
 4550644: aa1603e0     	mov	x0, x22
 4550648: 96eb0f2d     	bl	0x142fc <_ChromeMain+0xf060>
 455064c: 1400000a     	b	0x4550674 <_ChromeMain+0x454b3d8>
 4550650: f9400108     	ldr	x8, [x8]
 4550654: b40000e8     	cbz	x8, 0x4550670 <_ChromeMain+0x454b3d4>
 4550658: f9401109     	ldr	x9, [x8, #0x20]
 455065c: eb18013f     	cmp	x9, x24
 4550660: 54ffff88     	b.hi	0x4550650 <_ChromeMain+0x454b3b4>
 4550664: 54fffe20     	b.eq	0x4550628 <_ChromeMain+0x454b38c>
 4550668: f9400508     	ldr	x8, [x8, #0x8]
 455066c: b5ffff68     	cbnz	x8, 0x4550658 <_ChromeMain+0x454b3bc>
 4550670: d2800016     	mov	x22, #0x0               ; =0
 4550674: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4550678: f94046e9     	ldr	x9, [x23, #0x88]
 455067c: eb09011f     	cmp	x8, x9
 4550680: 54000061     	b.ne	0x455068c <_ChromeMain+0x454b3f0>
 4550684: aa1603e0     	mov	x0, x22
 4550688: 96eb48ed     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 455068c: 3940fec9     	ldrb	w9, [x22, #0x3f]
 4550690: 13001d28     	sxtb	w8, w9
 4550694: f9401aca     	ldr	x10, [x22, #0x30]
 4550698: 7100011f     	cmp	w8, #0x0
 455069c: 9a894149     	csel	x9, x10, x9, mi
 45506a0: f100553f     	cmp	x9, #0x15
 45506a4: 540001c1     	b.ne	0x45506dc <_ChromeMain+0x454b440>
 45506a8: f8428ec9     	ldr	x9, [x22, #0x28]!
 45506ac: 7100011f     	cmp	w8, #0x0
 45506b0: 9a964128     	csel	x8, x9, x22, mi
 45506b4: b0044d69     	adrp	x9, 0xcefd000 <dyld_stub_binder+0xcefd000>
 45506b8: 911fd929     	add	x9, x9, #0x7f6
 45506bc: a9402d0a     	ldp	x10, x11, [x8]
 45506c0: a940352c     	ldp	x12, x13, [x9]
 45506c4: f840d108     	ldur	x8, [x8, #0xd]
 45506c8: f840d129     	ldur	x9, [x9, #0xd]
 45506cc: eb0c015f     	cmp	x10, x12
 45506d0: fa4d0160     	ccmp	x11, x13, #0x0, eq
 45506d4: fa490100     	ccmp	x8, x9, #0x0, eq
 45506d8: 54fff9a0     	b.eq	0x455060c <_ChromeMain+0x454b370>
 45506dc: f94066a8     	ldr	x8, [x21, #0xc8]
 45506e0: b40003a8     	cbz	x8, 0x4550754 <_ChromeMain+0x454b4b8>
 45506e4: f9429908     	ldr	x8, [x8, #0x530]
 45506e8: b4000368     	cbz	x8, 0x4550754 <_ChromeMain+0x454b4b8>
 45506ec: f941c108     	ldr	x8, [x8, #0x380]
 45506f0: b4000328     	cbz	x8, 0x4550754 <_ChromeMain+0x454b4b8>
 45506f4: 52800028     	mov	w8, #0x1                ; =1
 45506f8: 39000288     	strb	w8, [x20]
 45506fc: f94066a0     	ldr	x0, [x21, #0xc8]
 4550700: 97c058c3     	bl	0x3566a0c <_ChromeMain+0x3561770>
 4550704: d360fc08     	lsr	x8, x0, #32
 4550708: 6b08001f     	cmp	w0, w8
 455070c: 1a88c014     	csel	w20, w0, w8, gt
 4550710: f94066a8     	ldr	x8, [x21, #0xc8]
 4550714: f9429908     	ldr	x8, [x8, #0x530]
 4550718: f941c100     	ldr	x0, [x8, #0x380]
 455071c: f9400008     	ldr	x8, [x0]
 4550720: f9424908     	ldr	x8, [x8, #0x490]
 4550724: 52800021     	mov	w1, #0x1                ; =1
 4550728: d63f0100     	blr	x8
 455072c: 0b140008     	add	w8, w0, w20
 4550730: 1e220100     	scvtf	s0, w8
 4550734: bd000260     	str	s0, [x19]
 4550738: f94066a0     	ldr	x0, [x21, #0xc8]
 455073c: 973251aa     	bl	0x11e4de4 <_ChromeMain+0x11dfb48>
 4550740: 37000100     	tbnz	w0, #0x0, 0x4550760 <_ChromeMain+0x454b4c4>
 4550744: bd400260     	ldr	s0, [x19]
 4550748: 1e259001     	fmov	s1, #14.00000000
 455074c: 1e212800     	fadd	s0, s0, s1
 4550750: 14000003     	b	0x455075c <_ChromeMain+0x454b4c0>
 4550754: 3900029f     	strb	wzr, [x20]
 4550758: 6f00e400     	movi.2d	v0, #0000000000000000
 455075c: bd000260     	str	s0, [x19]
 4550760: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4550764: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4550768: a94257f6     	ldp	x22, x21, [sp, #0x20]
 455076c: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4550770: a8c567fa     	ldp	x26, x25, [sp], #0x50
 4550774: d65f03c0     	ret
 4550778: 52800028     	mov	w8, #0x1                ; =1
 455077c: 39000288     	strb	w8, [x20]
 4550780: 17fffff6     	b	0x4550758 <_ChromeMain+0x454b4bc>
 4550784: f9400108     	ldr	x8, [x8]
 4550788: b40000e8     	cbz	x8, 0x45507a4 <_ChromeMain+0x454b508>
 455078c: f940110a     	ldr	x10, [x8, #0x20]
 4550790: eb18015f     	cmp	x10, x24
 4550794: 54ffff88     	b.hi	0x4550784 <_ChromeMain+0x454b4e8>
 4550798: 540003e0     	b.eq	0x4550814 <_ChromeMain+0x454b578>
 455079c: f9400508     	ldr	x8, [x8, #0x8]
 45507a0: b5ffff68     	cbnz	x8, 0x455078c <_ChromeMain+0x454b4f0>
 45507a4: d2800015     	mov	x21, #0x0               ; =0
 45507a8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45507ac: f94046e9     	ldr	x9, [x23, #0x88]
 45507b0: eb09011f     	cmp	x8, x9
 45507b4: 54000061     	b.ne	0x45507c0 <_ChromeMain+0x454b524>
 45507b8: aa1503e0     	mov	x0, x21
 45507bc: 96eb48a0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45507c0: 3940fea9     	ldrb	w9, [x21, #0x3f]
 45507c4: 13001d28     	sxtb	w8, w9
 45507c8: f9401aaa     	ldr	x10, [x21, #0x30]
 45507cc: 7100011f     	cmp	w8, #0x0
 45507d0: 9a894149     	csel	x9, x10, x9, mi
 45507d4: f100553f     	cmp	x9, #0x15
 45507d8: 54fffd01     	b.ne	0x4550778 <_ChromeMain+0x454b4dc>
 45507dc: f8428ea9     	ldr	x9, [x21, #0x28]!
 45507e0: 7100011f     	cmp	w8, #0x0
 45507e4: 9a954128     	csel	x8, x9, x21, mi
 45507e8: b0044d69     	adrp	x9, 0xcefd000 <dyld_stub_binder+0xcefd000>
 45507ec: 911fd929     	add	x9, x9, #0x7f6
 45507f0: a9402d0a     	ldp	x10, x11, [x8]
 45507f4: a940352c     	ldp	x12, x13, [x9]
 45507f8: f840d108     	ldur	x8, [x8, #0xd]
 45507fc: f840d129     	ldur	x9, [x9, #0xd]
 4550800: eb0c015f     	cmp	x10, x12
 4550804: fa4d0160     	ccmp	x11, x13, #0x0, eq
 4550808: fa490100     	ccmp	x8, x9, #0x0, eq
 455080c: 1a9f07e8     	cset	w8, ne
 4550810: 17ffffdb     	b	0x455077c <_ChromeMain+0x454b4e0>
 4550814: eb09011f     	cmp	x8, x9
 4550818: 54fffc60     	b.eq	0x45507a4 <_ChromeMain+0x454b508>
 455081c: f9401515     	ldr	x21, [x8, #0x28]
 4550820: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4550824: f94046e9     	ldr	x9, [x23, #0x88]
 4550828: eb09011f     	cmp	x8, x9
 455082c: 54fffbe1     	b.ne	0x45507a8 <_ChromeMain+0x454b50c>
 4550830: aa1503e0     	mov	x0, x21
 4550834: 96eb0eb2     	bl	0x142fc <_ChromeMain+0xf060>
 4550838: 17ffffdc     	b	0x45507a8 <_ChromeMain+0x454b50c>
