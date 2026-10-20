
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4657570: d10103ff     	sub	sp, sp, #0x40
 4657574: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4657578: a9037bfd     	stp	x29, x30, [sp, #0x30]
 465757c: 9100c3fd     	add	x29, sp, #0x30
 4657580: aa0003f3     	mov	x19, x0
 4657584: 39686008     	ldrb	w8, [x0, #0xa18]
 4657588: 34000248     	cbz	w8, 0x46575d0 <_ChromeMain+0x4652334>
 465758c: bd4a1260     	ldr	s0, [x19, #0xa10]
 4657590: 1e20c001     	fabs	s1, s0
 4657594: bd41c262     	ldr	s2, [x19, #0x1c0]
 4657598: 5e21d843     	scvtf	s3, s2
 465759c: 1e2e1002     	fmov	s2, #1.00000000
 46575a0: 1e226863     	fmaxnm	s3, s3, s2
 46575a4: 1e2c1004     	fmov	s4, #0.50000000
 46575a8: 1e240863     	fmul	s3, s3, s4
 46575ac: 1e232020     	fcmp	s1, s3
 46575b0: 5400010b     	b.lt	0x46575d0 <_ChromeMain+0x4652334>
 46575b4: bd4a1663     	ldr	s3, [x19, #0xa14]
 46575b8: 1e20c063     	fabs	s3, s3
 46575bc: 1e2f1004     	fmov	s4, #1.50000000
 46575c0: 1e240863     	fmul	s3, s3, s4
 46575c4: 1e226862     	fmaxnm	s2, s3, s2
 46575c8: 1e222020     	fcmp	s1, s2
 46575cc: 5400010c     	b.gt	0x46575ec <_ChromeMain+0x4652350>
 46575d0: 3928627f     	strb	wzr, [x19, #0xa18]
 46575d4: f9050a7f     	str	xzr, [x19, #0xa10]
 46575d8: aa1303e0     	mov	x0, x19
 46575dc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 46575e0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 46575e4: 910103ff     	add	sp, sp, #0x40
 46575e8: 1400001e     	b	0x4657660 <_ChromeMain+0x46523c4>
 46575ec: 91284268     	add	x8, x19, #0xa10
 46575f0: 1e202008     	fcmp	s0, #0.0
 46575f4: 12800009     	mov	w9, #-0x1               ; =-1
 46575f8: 1a9f5534     	csinc	w20, w9, wzr, pl
 46575fc: 3900211f     	strb	wzr, [x8, #0x8]
 4657600: f900011f     	str	xzr, [x8]
 4657604: 910003e8     	mov	x8, sp
 4657608: aa1303e0     	mov	x0, x19
 465760c: aa1403e1     	mov	x1, x20
 4657610: 94000080     	bl	0x4657810 <_ChromeMain+0x4652574>
 4657614: 394063e8     	ldrb	w8, [sp, #0x18]
 4657618: 35000088     	cbnz	w8, 0x4657628 <_ChromeMain+0x465238c>
 465761c: aa1303e0     	mov	x0, x19
 4657620: 94000010     	bl	0x4657660 <_ChromeMain+0x46523c4>
 4657624: 14000006     	b	0x465763c <_ChromeMain+0x46523a0>
 4657628: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 465762c: 37f80108     	tbnz	w8, #0x1f, 0x465764c <_ChromeMain+0x46523b0>
 4657630: aa1303e0     	mov	x0, x19
 4657634: aa1403e1     	mov	x1, x20
 4657638: 940000e3     	bl	0x46579c4 <_ChromeMain+0x4652728>
 465763c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4657640: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4657644: 910103ff     	add	sp, sp, #0x40
 4657648: d65f03c0     	ret
 465764c: f94003e0     	ldr	x0, [sp]
 4657650: f9400be8     	ldr	x8, [sp, #0x10]
 4657654: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4657658: 96e6c618     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465765c: 17fffff5     	b	0x4657630 <_ChromeMain+0x4652394>
 4657660: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4657664: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4657668: a9027bfd     	stp	x29, x30, [sp, #0x20]
 465766c: 910083fd     	add	x29, sp, #0x20
 4657670: aa0003f3     	mov	x19, x0
 4657674: f9422c08     	ldr	x8, [x0, #0x458]
 4657678: b40002c8     	cbz	x8, 0x46576d0 <_ChromeMain+0x4652434>
 465767c: f9432508     	ldr	x8, [x8, #0x648]
 4657680: b4000288     	cbz	x8, 0x46576d0 <_ChromeMain+0x4652434>
 4657684: f941d909     	ldr	x9, [x8, #0x3b0]
 4657688: d37df134     	lsl	x20, x9, #3
 465768c: b4000234     	cbz	x20, 0x46576d0 <_ChromeMain+0x4652434>
 4657690: f941d515     	ldr	x21, [x8, #0x3a8]
 4657694: 14000005     	b	0x46576a8 <_ChromeMain+0x465240c>
 4657698: 97fdde8b     	bl	0x45cf0c4 <_ChromeMain+0x45c9e28>
 465769c: 910022b5     	add	x21, x21, #0x8
 46576a0: f1002294     	subs	x20, x20, #0x8
 46576a4: 54000160     	b.eq	0x46576d0 <_ChromeMain+0x4652434>
 46576a8: f94002a8     	ldr	x8, [x21]
 46576ac: b4ffff88     	cbz	x8, 0x465769c <_ChromeMain+0x4652400>
 46576b0: f941b900     	ldr	x0, [x8, #0x370]
 46576b4: b4ffff40     	cbz	x0, 0x465769c <_ChromeMain+0x4652400>
 46576b8: 17fffff8     	b	0x4657698 <_ChromeMain+0x46523fc>
 46576bc: f9451a60     	ldr	x0, [x19, #0xa30]
 46576c0: f9452268     	ldr	x8, [x19, #0xa40]
 46576c4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46576c8: 96e6c5fc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46576cc: 14000006     	b	0x46576e4 <_ChromeMain+0x4652448>
 46576d0: 39286a7f     	strb	wzr, [x19, #0xa1a]
 46576d4: 39692268     	ldrb	w8, [x19, #0xa48]
 46576d8: 34000088     	cbz	w8, 0x46576e8 <_ChromeMain+0x465244c>
 46576dc: 39e91e68     	ldrsb	w8, [x19, #0xa47]
 46576e0: 37fffee8     	tbnz	w8, #0x1f, 0x46576bc <_ChromeMain+0x4652420>
 46576e4: 3929227f     	strb	wzr, [x19, #0xa48]
 46576e8: f9452a68     	ldr	x8, [x19, #0xa50]
 46576ec: 91000508     	add	x8, x8, #0x1
 46576f0: f9052a68     	str	x8, [x19, #0xa50]
 46576f4: 91296260     	add	x0, x19, #0xa58
 46576f8: 97035c08     	bl	0x72e718 <_ChromeMain+0x72947c>
 46576fc: f9456274     	ldr	x20, [x19, #0xac0]
 4657700: b50001d4     	cbnz	x20, 0x4657738 <_ChromeMain+0x465249c>
 4657704: b90a2a7f     	str	wzr, [x19, #0xa28]
 4657708: bd4a1e60     	ldr	s0, [x19, #0xa1c]
 465770c: 1e20c001     	fabs	s1, s0
 4657710: b004c7c8     	adrp	x8, 0xdf50000 <dyld_stub_binder+0xdf50000>
 4657714: bd46ed02     	ldr	s2, [x8, #0x6ec]
 4657718: 1e222020     	fcmp	s1, s2
 465771c: 54000265     	b.pl	0x4657768 <_ChromeMain+0x46524cc>
 4657720: 6f00e400     	movi.2d	v0, #0000000000000000
 4657724: aa1303e0     	mov	x0, x19
 4657728: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 465772c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4657730: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4657734: 17ffc993     	b	0x4649d80 <_ChromeMain+0x4644ae4>
 4657738: f905627f     	str	xzr, [x19, #0xac0]
 465773c: f9455e61     	ldr	x1, [x19, #0xab8]
 4657740: 9105c280     	add	x0, x20, #0x170
 4657744: 975fea31     	bl	0x1e52008 <_ChromeMain+0x1e4cd6c>
 4657748: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465774c: f0052ac9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4657750: f9404529     	ldr	x9, [x9, #0x88]
 4657754: eb09011f     	cmp	x8, x9
 4657758: 54fffd61     	b.ne	0x4657704 <_ChromeMain+0x4652468>
 465775c: aa1403e0     	mov	x0, x20
 4657760: 96e72cb7     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4657764: 17ffffe8     	b	0x4657704 <_ChromeMain+0x4652468>
 4657768: bd0a2660     	str	s0, [x19, #0xa24]
 465776c: 52930208     	mov	w8, #0x9810             ; =38928
 4657770: 72a00048     	movk	w8, #0x2, lsl #16
 4657774: f906ea68     	str	x8, [x19, #0xdd0]
 4657778: 3976c268     	ldrb	w8, [x19, #0xdb0]
 465777c: 35000468     	cbnz	w8, 0x4657808 <_ChromeMain+0x465256c>
 4657780: f906e67f     	str	xzr, [x19, #0xdc8]
 4657784: 3975a268     	ldrb	w8, [x19, #0xd68]
 4657788: 350000e8     	cbnz	w8, 0x46577a4 <_ChromeMain+0x4652508>
 465778c: 91356260     	add	x0, x19, #0xd58
 4657790: 52800001     	mov	w1, #0x0                ; =0
 4657794: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4657798: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 465779c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 46577a0: 17751c71     	b	0x239e964 <_ChromeMain+0x23996c8>
 46577a4: 3935a27f     	strb	wzr, [x19, #0xd68]
 46577a8: f946be60     	ldr	x0, [x19, #0xd78]
 46577ac: 91356261     	add	x1, x19, #0xd58
 46577b0: 976ac7d4     	bl	0x2109700 <_ChromeMain+0x2104464>
 46577b4: f946ae68     	ldr	x8, [x19, #0xd58]
 46577b8: f9401d08     	ldr	x8, [x8, #0x38]
 46577bc: 91356260     	add	x0, x19, #0xd58
 46577c0: d63f0100     	blr	x8
 46577c4: f946ba68     	ldr	x8, [x19, #0xd70]
 46577c8: b4fffe28     	cbz	x8, 0x465778c <_ChromeMain+0x46524f0>
 46577cc: f946ae68     	ldr	x8, [x19, #0xd58]
 46577d0: f9402108     	ldr	x8, [x8, #0x40]
 46577d4: 91356260     	add	x0, x19, #0xd58
 46577d8: d63f0100     	blr	x8
 46577dc: f946ba68     	ldr	x8, [x19, #0xd70]
 46577e0: f9400109     	ldr	x9, [x8]
 46577e4: 7100001f     	cmp	w0, #0x0
 46577e8: 5280020a     	mov	w10, #0x10              ; =16
 46577ec: 5280040b     	mov	w11, #0x20              ; =32
 46577f0: 9a8a116a     	csel	x10, x11, x10, ne
 46577f4: f86a6929     	ldr	x9, [x9, x10]
 46577f8: 91356261     	add	x1, x19, #0xd58
 46577fc: aa0803e0     	mov	x0, x8
 4657800: d63f0120     	blr	x9
 4657804: 17ffffe2     	b	0x465778c <_ChromeMain+0x46524f0>
 4657808: 3936c27f     	strb	wzr, [x19, #0xdb0]
 465780c: 17ffffdd     	b	0x4657780 <_ChromeMain+0x46524e4>
