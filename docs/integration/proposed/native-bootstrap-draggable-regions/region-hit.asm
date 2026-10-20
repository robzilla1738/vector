
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45b3380: d10143ff     	sub	sp, sp, #0x50
 45b3384: a9015ff8     	stp	x24, x23, [sp, #0x10]
 45b3388: a90257f6     	stp	x22, x21, [sp, #0x20]
 45b338c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 45b3390: a9047bfd     	stp	x29, x30, [sp, #0x40]
 45b3394: 910103fd     	add	x29, sp, #0x40
 45b3398: f9429c08     	ldr	x8, [x0, #0x538]
 45b339c: b4000aa8     	cbz	x8, 0x45b34f0 <_ChromeMain+0x45ae254>
 45b33a0: aa0103f4     	mov	x20, x1
 45b33a4: aa0003f3     	mov	x19, x0
 45b33a8: 91062117     	add	x23, x8, #0x188
 45b33ac: f940c508     	ldr	x8, [x8, #0x188]
 45b33b0: f0052ff6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45b33b4: b0052918     	adrp	x24, 0xead4000 <dyld_stub_binder+0xead4000>
 45b33b8: 912b4318     	add	x24, x24, #0xad0
 45b33bc: b4000288     	cbz	x8, 0x45b340c <_ChromeMain+0x45ae170>
 45b33c0: 1400000d     	b	0x45b33f4 <_ChromeMain+0x45ae158>
 45b33c4: eb17011f     	cmp	x8, x23
 45b33c8: 54000220     	b.eq	0x45b340c <_ChromeMain+0x45ae170>
 45b33cc: f9401515     	ldr	x21, [x8, #0x28]
 45b33d0: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b33d4: f94046c9     	ldr	x9, [x22, #0x88]
 45b33d8: eb09011f     	cmp	x8, x9
 45b33dc: 540001a1     	b.ne	0x45b3410 <_ChromeMain+0x45ae174>
 45b33e0: aa1503e0     	mov	x0, x21
 45b33e4: 96e983c6     	bl	0x142fc <_ChromeMain+0xf060>
 45b33e8: 1400000a     	b	0x45b3410 <_ChromeMain+0x45ae174>
 45b33ec: f9400108     	ldr	x8, [x8]
 45b33f0: b40000e8     	cbz	x8, 0x45b340c <_ChromeMain+0x45ae170>
 45b33f4: f9401109     	ldr	x9, [x8, #0x20]
 45b33f8: eb18013f     	cmp	x9, x24
 45b33fc: 54ffff88     	b.hi	0x45b33ec <_ChromeMain+0x45ae150>
 45b3400: 54fffe20     	b.eq	0x45b33c4 <_ChromeMain+0x45ae128>
 45b3404: f9400508     	ldr	x8, [x8, #0x8]
 45b3408: b5ffff68     	cbnz	x8, 0x45b33f4 <_ChromeMain+0x45ae158>
 45b340c: d2800015     	mov	x21, #0x0               ; =0
 45b3410: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b3414: f94046c9     	ldr	x9, [x22, #0x88]
 45b3418: eb09011f     	cmp	x8, x9
 45b341c: 54000061     	b.ne	0x45b3428 <_ChromeMain+0x45ae18c>
 45b3420: aa1503e0     	mov	x0, x21
 45b3424: 96e9bd86     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b3428: 39c0fea8     	ldrsb	w8, [x21, #0x3f]
 45b342c: 37f80708     	tbnz	w8, #0x1f, 0x45b350c <_ChromeMain+0x45ae270>
 45b3430: f94002e8     	ldr	x8, [x23]
 45b3434: b4000288     	cbz	x8, 0x45b3484 <_ChromeMain+0x45ae1e8>
 45b3438: 1400000d     	b	0x45b346c <_ChromeMain+0x45ae1d0>
 45b343c: eb17011f     	cmp	x8, x23
 45b3440: 54000220     	b.eq	0x45b3484 <_ChromeMain+0x45ae1e8>
 45b3444: f9401515     	ldr	x21, [x8, #0x28]
 45b3448: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b344c: f94046c9     	ldr	x9, [x22, #0x88]
 45b3450: eb09011f     	cmp	x8, x9
 45b3454: 540001a1     	b.ne	0x45b3488 <_ChromeMain+0x45ae1ec>
 45b3458: aa1503e0     	mov	x0, x21
 45b345c: 96e983a8     	bl	0x142fc <_ChromeMain+0xf060>
 45b3460: 1400000a     	b	0x45b3488 <_ChromeMain+0x45ae1ec>
 45b3464: f9400108     	ldr	x8, [x8]
 45b3468: b40000e8     	cbz	x8, 0x45b3484 <_ChromeMain+0x45ae1e8>
 45b346c: f9401109     	ldr	x9, [x8, #0x20]
 45b3470: eb18013f     	cmp	x9, x24
 45b3474: 54ffff88     	b.hi	0x45b3464 <_ChromeMain+0x45ae1c8>
 45b3478: 54fffe20     	b.eq	0x45b343c <_ChromeMain+0x45ae1a0>
 45b347c: f9400508     	ldr	x8, [x8, #0x8]
 45b3480: b5ffff68     	cbnz	x8, 0x45b346c <_ChromeMain+0x45ae1d0>
 45b3484: d2800015     	mov	x21, #0x0               ; =0
 45b3488: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b348c: f94046c9     	ldr	x9, [x22, #0x88]
 45b3490: eb09011f     	cmp	x8, x9
 45b3494: 54000061     	b.ne	0x45b34a0 <_ChromeMain+0x45ae204>
 45b3498: aa1503e0     	mov	x0, x21
 45b349c: 96e9bd68     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b34a0: 3940fea9     	ldrb	w9, [x21, #0x3f]
 45b34a4: 13001d28     	sxtb	w8, w9
 45b34a8: f9401aaa     	ldr	x10, [x21, #0x30]
 45b34ac: 7100011f     	cmp	w8, #0x0
 45b34b0: 9a894149     	csel	x9, x10, x9, mi
 45b34b4: f100553f     	cmp	x9, #0x15
 45b34b8: 540001c1     	b.ne	0x45b34f0 <_ChromeMain+0x45ae254>
 45b34bc: f8428ea9     	ldr	x9, [x21, #0x28]!
 45b34c0: 7100011f     	cmp	w8, #0x0
 45b34c4: 9a954128     	csel	x8, x9, x21, mi
 45b34c8: d0044a49     	adrp	x9, 0xcefd000 <dyld_stub_binder+0xcefd000>
 45b34cc: 911fd929     	add	x9, x9, #0x7f6
 45b34d0: a9402d0a     	ldp	x10, x11, [x8]
 45b34d4: a940352c     	ldp	x12, x13, [x9]
 45b34d8: f840d108     	ldur	x8, [x8, #0xd]
 45b34dc: f840d129     	ldur	x9, [x9, #0xd]
 45b34e0: eb0c015f     	cmp	x10, x12
 45b34e4: fa4d0160     	ccmp	x11, x13, #0x0, eq
 45b34e8: fa490100     	ccmp	x8, x9, #0x0, eq
 45b34ec: 54000320     	b.eq	0x45b3550 <_ChromeMain+0x45ae2b4>
 45b34f0: 52800000     	mov	w0, #0x0                ; =0
 45b34f4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 45b34f8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 45b34fc: a94257f6     	ldp	x22, x21, [sp, #0x20]
 45b3500: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 45b3504: 910143ff     	add	sp, sp, #0x50
 45b3508: d65f03c0     	ret
 45b350c: f9401aa8     	ldr	x8, [x21, #0x30]
 45b3510: f100711f     	cmp	x8, #0x1c
 45b3514: 54fff8e1     	b.ne	0x45b3430 <_ChromeMain+0x45ae194>
 45b3518: f94016a8     	ldr	x8, [x21, #0x28]
 45b351c: 90044929     	adrp	x9, 0xced7000 <dyld_stub_binder+0xced7000>
 45b3520: 910e6529     	add	x9, x9, #0x399
 45b3524: a9402d0a     	ldp	x10, x11, [x8]
 45b3528: a940352c     	ldp	x12, x13, [x9]
 45b352c: f940090e     	ldr	x14, [x8, #0x10]
 45b3530: f940092f     	ldr	x15, [x9, #0x10]
 45b3534: b9401908     	ldr	w8, [x8, #0x18]
 45b3538: b9401929     	ldr	w9, [x9, #0x18]
 45b353c: eb0c015f     	cmp	x10, x12
 45b3540: fa4d0160     	ccmp	x11, x13, #0x0, eq
 45b3544: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 45b3548: fa490100     	ccmp	x8, x9, #0x0, eq
 45b354c: 54fff721     	b.ne	0x45b3430 <_ChromeMain+0x45ae194>
 45b3550: 3960c268     	ldrb	w8, [x19, #0x830]
 45b3554: 34fffce8     	cbz	w8, 0x45b34f0 <_ChromeMain+0x45ae254>
 45b3558: f9441668     	ldr	x8, [x19, #0x828]
 45b355c: b100051f     	cmn	x8, #0x1
 45b3560: 54fffc80     	b.eq	0x45b34f0 <_ChromeMain+0x45ae254>
 45b3564: f9429e68     	ldr	x8, [x19, #0x538]
 45b3568: f9404508     	ldr	x8, [x8, #0x88]
 45b356c: f9404908     	ldr	x8, [x8, #0x90]
 45b3570: b4000048     	cbz	x8, 0x45b3578 <_ChromeMain+0x45ae2dc>
 45b3574: f9402108     	ldr	x8, [x8, #0x40]
 45b3578: f9440a69     	ldr	x9, [x19, #0x810]
 45b357c: eb08013f     	cmp	x9, x8
 45b3580: 54fffb81     	b.ne	0x45b34f0 <_ChromeMain+0x45ae254>
 45b3584: f9400288     	ldr	x8, [x20]
 45b3588: f90007e8     	str	x8, [sp, #0x8]
 45b358c: f9432668     	ldr	x8, [x19, #0x648]
 45b3590: b9845109     	ldrsw	x9, [x8, #0x450]
 45b3594: f941d90a     	ldr	x10, [x8, #0x3b0]
 45b3598: eb09015f     	cmp	x10, x9
 45b359c: 54000389     	b.ls	0x45b360c <_ChromeMain+0x45ae370>
 45b35a0: f941d508     	ldr	x8, [x8, #0x3a8]
 45b35a4: f8697908     	ldr	x8, [x8, x9, lsl #3]
 45b35a8: f941b901     	ldr	x1, [x8, #0x370]
 45b35ac: 9107c260     	add	x0, x19, #0x1f0
 45b35b0: 910023e2     	add	x2, sp, #0x8
 45b35b4: 95849d27     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b35b8: f9432668     	ldr	x8, [x19, #0x648]
 45b35bc: b9845109     	ldrsw	x9, [x8, #0x450]
 45b35c0: f941d90a     	ldr	x10, [x8, #0x3b0]
 45b35c4: eb09015f     	cmp	x10, x9
 45b35c8: 54000229     	b.ls	0x45b360c <_ChromeMain+0x45ae370>
 45b35cc: f941d508     	ldr	x8, [x8, #0x3a8]
 45b35d0: f8697908     	ldr	x8, [x8, x9, lsl #3]
 45b35d4: f941b908     	ldr	x8, [x8, #0x370]
 45b35d8: f940e108     	ldr	x8, [x8, #0x1c0]
 45b35dc: 29410be1     	ldp	w1, w2, [sp, #0x8]
 45b35e0: 2a020029     	orr	w9, w1, w2
 45b35e4: 3100053f     	cmn	w9, #0x1
 45b35e8: d360fd09     	lsr	x9, x8, #32
 45b35ec: 7a49c040     	ccmp	w2, w9, #0x0, gt
 45b35f0: 7a48b020     	ccmp	w1, w8, #0x0, lt
 45b35f4: 54fff7ea     	b.ge	0x45b34f0 <_ChromeMain+0x45ae254>
 45b35f8: 3960c268     	ldrb	w8, [x19, #0x830]
 45b35fc: 36000088     	tbz	w8, #0x0, 0x45b360c <_ChromeMain+0x45ae370>
 45b3600: 91206260     	add	x0, x19, #0x818
 45b3604: 941f324f     	bl	0x4d7ff40 <_ChromeMain+0x4d7aca4>
 45b3608: 17ffffbb     	b	0x45b34f4 <_ChromeMain+0x45ae258>
 45b360c: d4200020     	brk	#0x1
