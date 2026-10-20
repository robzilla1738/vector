
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 468074c: d10203ff     	sub	sp, sp, #0x80
 4680750: a90367fa     	stp	x26, x25, [sp, #0x30]
 4680754: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4680758: a90557f6     	stp	x22, x21, [sp, #0x50]
 468075c: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4680760: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4680764: 9101c3fd     	add	x29, sp, #0x70
 4680768: a942d413     	ldp	x19, x21, [x0, #0x28]
 468076c: f900141f     	str	xzr, [x0, #0x28]
 4680770: a943e014     	ldp	x20, x24, [x0, #0x38]
 4680774: f9001c1f     	str	xzr, [x0, #0x38]
 4680778: 3cc48000     	ldur	q0, [x0, #0x48]
 468077c: 3d8003e0     	str	q0, [sp]
 4680780: f9402c08     	ldr	x8, [x0, #0x58]
 4680784: f9000be8     	str	x8, [sp, #0x10]
 4680788: a904fc1f     	stp	xzr, xzr, [x0, #0x48]
 468078c: f9002c1f     	str	xzr, [x0, #0x58]
 4680790: b40000b3     	cbz	x19, 0x46807a4 <_ChromeMain+0x467b508>
 4680794: 19404268     	ldapurb	w8, [x19, #0x4]
 4680798: 7100011f     	cmp	w8, #0x0
 468079c: fa400aa4     	ccmp	x21, #0x0, #0x4, eq
 46807a0: 54000441     	b.ne	0x4680828 <_ChromeMain+0x467b58c>
 46807a4: b5000274     	cbnz	x20, 0x46807f0 <_ChromeMain+0x467b554>
 46807a8: b5000153     	cbnz	x19, 0x46807d0 <_ChromeMain+0x467b534>
 46807ac: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 46807b0: 37f80328     	tbnz	w8, #0x1f, 0x4680814 <_ChromeMain+0x467b578>
 46807b4: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 46807b8: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 46807bc: a94557f6     	ldp	x22, x21, [sp, #0x50]
 46807c0: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 46807c4: a94367fa     	ldp	x26, x25, [sp, #0x30]
 46807c8: 910203ff     	add	sp, sp, #0x80
 46807cc: d65f03c0     	ret
 46807d0: 12800008     	mov	w8, #-0x1               ; =-1
 46807d4: b8e80268     	ldaddal	w8, w8, [x19]
 46807d8: 7100051f     	cmp	w8, #0x1
 46807dc: 54fffe81     	b.ne	0x46807ac <_ChromeMain+0x467b510>
 46807e0: aa1303e0     	mov	x0, x19
 46807e4: 52800101     	mov	w1, #0x8                ; =8
 46807e8: 96e621b4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46807ec: 17fffff0     	b	0x46807ac <_ChromeMain+0x467b510>
 46807f0: 12800008     	mov	w8, #-0x1               ; =-1
 46807f4: b8e80288     	ldaddal	w8, w8, [x20]
 46807f8: 7100051f     	cmp	w8, #0x1
 46807fc: 54fffd61     	b.ne	0x46807a8 <_ChromeMain+0x467b50c>
 4680800: aa1403e0     	mov	x0, x20
 4680804: 52800101     	mov	w1, #0x8                ; =8
 4680808: 96e621ac     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 468080c: b5fffe33     	cbnz	x19, 0x46807d0 <_ChromeMain+0x467b534>
 4680810: 17ffffe7     	b	0x46807ac <_ChromeMain+0x467b510>
 4680814: f94003e0     	ldr	x0, [sp]
 4680818: f9400be8     	ldr	x8, [sp, #0x10]
 468081c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4680820: 96e621a6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4680824: 17ffffe4     	b	0x46807b4 <_ChromeMain+0x467b518>
 4680828: 19404268     	ldapurb	w8, [x19, #0x4]
 468082c: 350017c8     	cbnz	w8, 0x4680b24 <_ChromeMain+0x467b888>
 4680830: aa0103f6     	mov	x22, x1
 4680834: 912be2a0     	add	x0, x21, #0xaf8
 4680838: 910003e1     	mov	x1, sp
 468083c: 94000bd1     	bl	0x4683780 <_ChromeMain+0x467e4e4>
 4680840: aa0003e2     	mov	x2, x0
 4680844: aa0103e3     	mov	x3, x1
 4680848: 912be2a0     	add	x0, x21, #0xaf8
 468084c: aa0203e1     	mov	x1, x2
 4680850: aa0303e2     	mov	x2, x3
 4680854: 94d5a020     	bl	0x7be88d4 <_ChromeMain+0x7be3638>
 4680858: b40000b4     	cbz	x20, 0x468086c <_ChromeMain+0x467b5d0>
 468085c: 19404288     	ldapurb	w8, [x20, #0x4]
 4680860: 7100011f     	cmp	w8, #0x0
 4680864: fa400b04     	ccmp	x24, #0x0, #0x4, eq
 4680868: 54000481     	b.ne	0x46808f8 <_ChromeMain+0x467b65c>
 468086c: b4fff9d6     	cbz	x22, 0x46807a4 <_ChromeMain+0x467b508>
 4680870: f94002c8     	ldr	x8, [x22]
 4680874: f940a508     	ldr	x8, [x8, #0x148]
 4680878: aa1603e0     	mov	x0, x22
 468087c: d63f0100     	blr	x8
 4680880: f9400008     	ldr	x8, [x0]
 4680884: f9401909     	ldr	x9, [x8, #0x30]
 4680888: 910063e8     	add	x8, sp, #0x18
 468088c: d63f0120     	blr	x9
 4680890: 910063e0     	add	x0, sp, #0x18
 4680894: 910003e1     	mov	x1, sp
 4680898: 97292e1b     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 468089c: aa0003f6     	mov	x22, x0
 46808a0: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 46808a4: 37f801e8     	tbnz	w8, #0x1f, 0x46808e0 <_ChromeMain+0x467b644>
 46808a8: 34fff7f6     	cbz	w22, 0x46807a4 <_ChromeMain+0x467b508>
 46808ac: 19404268     	ldapurb	w8, [x19, #0x4]
 46808b0: 35001468     	cbnz	w8, 0x4680b3c <_ChromeMain+0x467b8a0>
 46808b4: 9117e2b7     	add	x23, x21, #0x5f8
 46808b8: f942feb8     	ldr	x24, [x21, #0x5f8]
 46808bc: b4000c78     	cbz	x24, 0x4680a48 <_ChromeMain+0x467b7ac>
 46808c0: 39805fe8     	ldrsb	x8, [sp, #0x17]
 46808c4: 910003e9     	mov	x9, sp
 46808c8: a9402fea     	ldp	x10, x11, [sp]
 46808cc: f100011f     	cmp	x8, #0x0
 46808d0: 9a894156     	csel	x22, x10, x9, mi
 46808d4: 7100011f     	cmp	w8, #0x0
 46808d8: 9a884179     	csel	x25, x11, x8, mi
 46808dc: 14000042     	b	0x46809e4 <_ChromeMain+0x467b748>
 46808e0: f9400fe0     	ldr	x0, [sp, #0x18]
 46808e4: f94017e8     	ldr	x8, [sp, #0x28]
 46808e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46808ec: 96e62173     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46808f0: 34fff5b6     	cbz	w22, 0x46807a4 <_ChromeMain+0x467b508>
 46808f4: 17ffffee     	b	0x46808ac <_ChromeMain+0x467b610>
 46808f8: 19404288     	ldapurb	w8, [x20, #0x4]
 46808fc: 350011a8     	cbnz	w8, 0x4680b30 <_ChromeMain+0x467b894>
 4680900: f940b308     	ldr	x8, [x24, #0x160]
 4680904: d0052999     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4680908: b40001a8     	cbz	x8, 0x468093c <_ChromeMain+0x467b6a0>
 468090c: 91058309     	add	x9, x24, #0x160
 4680910: 900522aa     	adrp	x10, 0xead4000 <dyld_stub_binder+0xead4000>
 4680914: 9131414a     	add	x10, x10, #0xc50
 4680918: 14000003     	b	0x4680924 <_ChromeMain+0x467b688>
 468091c: f9400108     	ldr	x8, [x8]
 4680920: b40000e8     	cbz	x8, 0x468093c <_ChromeMain+0x467b6a0>
 4680924: f940110b     	ldr	x11, [x8, #0x20]
 4680928: eb0a017f     	cmp	x11, x10
 468092c: 54ffff88     	b.hi	0x468091c <_ChromeMain+0x467b680>
 4680930: 54000400     	b.eq	0x46809b0 <_ChromeMain+0x467b714>
 4680934: f9400508     	ldr	x8, [x8, #0x8]
 4680938: b5ffff68     	cbnz	x8, 0x4680924 <_ChromeMain+0x467b688>
 468093c: d2800017     	mov	x23, #0x0               ; =0
 4680940: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 4680944: f9404729     	ldr	x9, [x25, #0x88]
 4680948: eb09011f     	cmp	x8, x9
 468094c: 54000061     	b.ne	0x4680958 <_ChromeMain+0x467b6bc>
 4680950: aa1703e0     	mov	x0, x23
 4680954: 96e6883a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4680958: b4fff8b6     	cbz	x22, 0x468086c <_ChromeMain+0x467b5d0>
 468095c: 394522e8     	ldrb	w8, [x23, #0x148]
 4680960: 3707f868     	tbnz	w8, #0x0, 0x468086c <_ChromeMain+0x467b5d0>
 4680964: 19404268     	ldapurb	w8, [x19, #0x4]
 4680968: 35000fc8     	cbnz	w8, 0x4680b60 <_ChromeMain+0x467b8c4>
 468096c: 910003e1     	mov	x1, sp
 4680970: aa1503e0     	mov	x0, x21
 4680974: 97ff54f7     	bl	0x4655d50 <_ChromeMain+0x4650ab4>
 4680978: 3707f7c0     	tbnz	w0, #0x0, 0x4680870 <_ChromeMain+0x467b5d4>
 468097c: 19404288     	ldapurb	w8, [x20, #0x4]
 4680980: 35000fc8     	cbnz	w8, 0x4680b78 <_ChromeMain+0x467b8dc>
 4680984: d100a317     	sub	x23, x24, #0x28
 4680988: aa1703e0     	mov	x0, x23
 468098c: aa1603e1     	mov	x1, x22
 4680990: 97fb6f39     	bl	0x455c674 <_ChromeMain+0x45573d8>
 4680994: 19404288     	ldapurb	w8, [x20, #0x4]
 4680998: 35000f68     	cbnz	w8, 0x4680b84 <_ChromeMain+0x467b8e8>
 468099c: aa1703e0     	mov	x0, x23
 46809a0: aa1603e1     	mov	x1, x22
 46809a4: 52800002     	mov	w2, #0x0                ; =0
 46809a8: 97fb7191     	bl	0x455cfec <_ChromeMain+0x4557d50>
 46809ac: 17ffffb1     	b	0x4680870 <_ChromeMain+0x467b5d4>
 46809b0: eb09011f     	cmp	x8, x9
 46809b4: 54fffc40     	b.eq	0x468093c <_ChromeMain+0x467b6a0>
 46809b8: f9401517     	ldr	x23, [x8, #0x28]
 46809bc: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 46809c0: f9404729     	ldr	x9, [x25, #0x88]
 46809c4: eb09011f     	cmp	x8, x9
 46809c8: 54fffbc1     	b.ne	0x4680940 <_ChromeMain+0x467b6a4>
 46809cc: aa1703e0     	mov	x0, x23
 46809d0: 96e64e4b     	bl	0x142fc <_ChromeMain+0xf060>
 46809d4: 17ffffdb     	b	0x4680940 <_ChromeMain+0x467b6a4>
 46809d8: 54000223     	b.lo	0x4680a1c <_ChromeMain+0x467b780>
 46809dc: f9400718     	ldr	x24, [x24, #0x8]
 46809e0: b4000358     	cbz	x24, 0x4680a48 <_ChromeMain+0x467b7ac>
 46809e4: aa1803e8     	mov	x8, x24
 46809e8: f8420d09     	ldr	x9, [x8, #0x20]!
 46809ec: 39805d0a     	ldrsb	x10, [x8, #0x17]
 46809f0: f100015f     	cmp	x10, #0x0
 46809f4: 9a884121     	csel	x1, x9, x8, mi
 46809f8: f9400508     	ldr	x8, [x8, #0x8]
 46809fc: 7100015f     	cmp	w10, #0x0
 4680a00: 9a8a411a     	csel	x26, x8, x10, mi
 4680a04: eb19035f     	cmp	x26, x25
 4680a08: 9a993342     	csel	x2, x26, x25, lo
 4680a0c: aa1603e0     	mov	x0, x22
 4680a10: 94e62394     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4680a14: 340000a0     	cbz	w0, 0x4680a28 <_ChromeMain+0x467b78c>
 4680a18: 36fffe20     	tbz	w0, #0x1f, 0x46809dc <_ChromeMain+0x467b740>
 4680a1c: f9400318     	ldr	x24, [x24]
 4680a20: b5fffe38     	cbnz	x24, 0x46809e4 <_ChromeMain+0x467b748>
 4680a24: 14000009     	b	0x4680a48 <_ChromeMain+0x467b7ac>
 4680a28: eb1a033f     	cmp	x25, x26
 4680a2c: 54fffd61     	b.ne	0x46809d8 <_ChromeMain+0x467b73c>
 4680a30: eb17031f     	cmp	x24, x23
 4680a34: 540000a0     	b.eq	0x4680a48 <_ChromeMain+0x467b7ac>
 4680a38: f9401f01     	ldr	x1, [x24, #0x38]
 4680a3c: 910003e2     	mov	x2, sp
 4680a40: aa1503e0     	mov	x0, x21
 4680a44: 97ff4f3f     	bl	0x4654740 <_ChromeMain+0x464f4a4>
 4680a48: 19404268     	ldapurb	w8, [x19, #0x4]
 4680a4c: 350007e8     	cbnz	w8, 0x4680b48 <_ChromeMain+0x467b8ac>
 4680a50: f94002f8     	ldr	x24, [x23]
 4680a54: 9117e2a8     	add	x8, x21, #0x5f8
 4680a58: b4000438     	cbz	x24, 0x4680adc <_ChromeMain+0x467b840>
 4680a5c: 39805fe8     	ldrsb	x8, [sp, #0x17]
 4680a60: 910003e9     	mov	x9, sp
 4680a64: a9402fea     	ldp	x10, x11, [sp]
 4680a68: f100011f     	cmp	x8, #0x0
 4680a6c: 9a894156     	csel	x22, x10, x9, mi
 4680a70: 7100011f     	cmp	w8, #0x0
 4680a74: 9a884179     	csel	x25, x11, x8, mi
 4680a78: 14000004     	b	0x4680a88 <_ChromeMain+0x467b7ec>
 4680a7c: 54000223     	b.lo	0x4680ac0 <_ChromeMain+0x467b824>
 4680a80: f9400718     	ldr	x24, [x24, #0x8]
 4680a84: b4000298     	cbz	x24, 0x4680ad4 <_ChromeMain+0x467b838>
 4680a88: aa1803e8     	mov	x8, x24
 4680a8c: f8420d09     	ldr	x9, [x8, #0x20]!
 4680a90: 39805d0a     	ldrsb	x10, [x8, #0x17]
 4680a94: f100015f     	cmp	x10, #0x0
 4680a98: 9a884121     	csel	x1, x9, x8, mi
 4680a9c: f9400508     	ldr	x8, [x8, #0x8]
 4680aa0: 7100015f     	cmp	w10, #0x0
 4680aa4: 9a8a411a     	csel	x26, x8, x10, mi
 4680aa8: eb19035f     	cmp	x26, x25
 4680aac: 9a993342     	csel	x2, x26, x25, lo
 4680ab0: aa1603e0     	mov	x0, x22
 4680ab4: 94e6236b     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4680ab8: 340000a0     	cbz	w0, 0x4680acc <_ChromeMain+0x467b830>
 4680abc: 36fffe20     	tbz	w0, #0x1f, 0x4680a80 <_ChromeMain+0x467b7e4>
 4680ac0: f9400318     	ldr	x24, [x24]
 4680ac4: b5fffe38     	cbnz	x24, 0x4680a88 <_ChromeMain+0x467b7ec>
 4680ac8: 14000003     	b	0x4680ad4 <_ChromeMain+0x467b838>
 4680acc: eb1a033f     	cmp	x25, x26
 4680ad0: 54fffd61     	b.ne	0x4680a7c <_ChromeMain+0x467b7e0>
 4680ad4: f100031f     	cmp	x24, #0x0
 4680ad8: 9a9802e8     	csel	x8, x23, x24, eq
 4680adc: 19404269     	ldapurb	w9, [x19, #0x4]
 4680ae0: 350003a9     	cbnz	w9, 0x4680b54 <_ChromeMain+0x467b8b8>
 4680ae4: eb17011f     	cmp	x8, x23
 4680ae8: 54ffe5e0     	b.eq	0x46807a4 <_ChromeMain+0x467b508>
 4680aec: 19404269     	ldapurb	w9, [x19, #0x4]
 4680af0: 350003e9     	cbnz	w9, 0x4680b6c <_ChromeMain+0x467b8d0>
 4680af4: f942f6a9     	ldr	x9, [x21, #0x5e8]
 4680af8: f9401d08     	ldr	x8, [x8, #0x38]
 4680afc: eb08013f     	cmp	x9, x8
 4680b00: 54ffe521     	b.ne	0x46807a4 <_ChromeMain+0x467b508>
 4680b04: 19404268     	ldapurb	w8, [x19, #0x4]
 4680b08: 35000448     	cbnz	w8, 0x4680b90 <_ChromeMain+0x467b8f4>
 4680b0c: 19404268     	ldapurb	w8, [x19, #0x4]
 4680b10: 35000468     	cbnz	w8, 0x4680b9c <_ChromeMain+0x467b900>
 4680b14: bd4a1ea0     	ldr	s0, [x21, #0xa1c]
 4680b18: aa1503e0     	mov	x0, x21
 4680b1c: 97ff2499     	bl	0x4649d80 <_ChromeMain+0x4644ae4>
