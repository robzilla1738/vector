
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4651140: d10343ff     	sub	sp, sp, #0xd0
 4651144: 6d062beb     	stp	d11, d10, [sp, #0x60]
 4651148: 6d0723e9     	stp	d9, d8, [sp, #0x70]
 465114c: a90867fa     	stp	x26, x25, [sp, #0x80]
 4651150: a9095ff8     	stp	x24, x23, [sp, #0x90]
 4651154: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 4651158: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 465115c: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 4651160: 910303fd     	add	x29, sp, #0xc0
 4651164: aa0503f4     	mov	x20, x5
 4651168: aa0403f3     	mov	x19, x4
 465116c: aa0303f8     	mov	x24, x3
 4651170: aa0203f5     	mov	x21, x2
 4651174: aa0103f6     	mov	x22, x1
 4651178: aa0003f7     	mov	x23, x0
 465117c: 39682008     	ldrb	w8, [x0, #0xa08]
 4651180: 34000068     	cbz	w8, 0x465118c <_ChromeMain+0x464bef0>
 4651184: f94652e8     	ldr	x8, [x23, #0xca0]
 4651188: b4001b88     	cbz	x8, 0x46514f8 <_ChromeMain+0x464c25c>
 465118c: aa1703e0     	mov	x0, x23
 4651190: 97ff8db9     	bl	0x4634874 <_ChromeMain+0x462f5d8>
 4651194: f9435ee8     	ldr	x8, [x23, #0x6b8]
 4651198: b4001608     	cbz	x8, 0x4651458 <_ChromeMain+0x464c1bc>
 465119c: aa1703e0     	mov	x0, x23
 46511a0: 973758f5     	bl	0x1427574 <_ChromeMain+0x14222d8>
 46511a4: 3dc00300     	ldr	q0, [x24]
 46511a8: 3d800be0     	str	q0, [sp, #0x20]
 46511ac: 4e080c01     	dup.2d	v1, x0
 46511b0: b004c748     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 46511b4: 3dc01102     	ldr	q2, [x8, #0x40]
 46511b8: 6ee24421     	ushl.2d	v1, v1, v2
 46511bc: 0ea12821     	xtn.2s	v1, v1
 46511c0: 2ea0b821     	neg.2s	v1, v1
 46511c4: 6f00e403     	movi.2d	v3, #0000000000000000
 46511c8: 0ea10c00     	sqadd.2s	v0, v0, v1
 46511cc: fd4017e2     	ldr	d2, [sp, #0x28]
 46511d0: 0ea20c02     	sqadd.2s	v2, v0, v2
 46511d4: 0ea02c42     	sqsub.2s	v2, v2, v0
 46511d8: 0ea36442     	smax.2s	v2, v2, v3
 46511dc: 6d020be0     	stp	d0, d2, [sp, #0x20]
 46511e0: 6d400262     	ldp	d2, d0, [x19]
 46511e4: 0ea10c41     	sqadd.2s	v1, v2, v1
 46511e8: f9435ef3     	ldr	x19, [x23, #0x6b8]
 46511ec: f9419260     	ldr	x0, [x19, #0x320]
 46511f0: f941ac0a     	ldr	x10, [x0, #0x358]
 46511f4: 3980bd48     	ldrsb	x8, [x10, #0x2f]
 46511f8: b7f802a8     	tbnz	x8, #0x3f, 0x465124c <_ChromeMain+0x464bfb0>
 46511fc: 91006149     	add	x9, x10, #0x18
 4651200: 0ea00c28     	sqadd.2s	v8, v1, v0
 4651204: 39405eca     	ldrb	w10, [x22, #0x17]
 4651208: 13001d4b     	sxtb	w11, w10
 465120c: a94036cc     	ldp	x12, x13, [x22]
 4651210: 7100017f     	cmp	w11, #0x0
 4651214: 9a8a41a2     	csel	x2, x13, x10, mi
 4651218: 9a964181     	csel	x1, x12, x22, mi
 465121c: eb02011f     	cmp	x8, x2
 4651220: 3d8007e1     	str	q1, [sp, #0x10]
 4651224: 54000181     	b.ne	0x4651254 <_ChromeMain+0x464bfb8>
 4651228: b40001e8     	cbz	x8, 0x4651264 <_ChromeMain+0x464bfc8>
 465122c: aa0103ea     	mov	x10, x1
 4651230: 7840252b     	ldrh	w11, [x9], #0x2
 4651234: 7840254c     	ldrh	w12, [x10], #0x2
 4651238: 6b0b019f     	cmp	w12, w11
 465123c: 540000c1     	b.ne	0x4651254 <_ChromeMain+0x464bfb8>
 4651240: f1000508     	subs	x8, x8, #0x1
 4651244: 54ffff61     	b.ne	0x4651230 <_ChromeMain+0x464bf94>
 4651248: 14000007     	b	0x4651264 <_ChromeMain+0x464bfc8>
 465124c: a941a149     	ldp	x9, x8, [x10, #0x18]
 4651250: 17ffffec     	b	0x4651200 <_ChromeMain+0x464bf64>
 4651254: f9400008     	ldr	x8, [x0]
 4651258: f941f108     	ldr	x8, [x8, #0x3e0]
 465125c: d63f0100     	blr	x8
 4651260: 3dc007e1     	ldr	q1, [sp, #0x10]
 4651264: 0ea12d08     	sqsub.2s	v8, v8, v1
 4651268: f9418e68     	ldr	x8, [x19, #0x318]
 465126c: 3900e3ff     	strb	wzr, [sp, #0x38]
 4651270: 52801fe9     	mov	w9, #0xff               ; =255
 4651274: 390163e9     	strb	w9, [sp, #0x58]
 4651278: 9100e3e0     	add	x0, sp, #0x38
 465127c: 910d2101     	add	x1, x8, #0x348
 4651280: 9701b6c3     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 4651284: 394163f6     	ldrb	w22, [sp, #0x58]
 4651288: 394082b7     	ldrb	w23, [x21, #0x20]
 465128c: 7103fedf     	cmp	w22, #0xff
 4651290: 7a5612e0     	ccmp	w23, w22, #0x0, ne
 4651294: 54000601     	b.ne	0x4651354 <_ChromeMain+0x464c0b8>
 4651298: f9401ff7     	ldr	x23, [sp, #0x38]
 465129c: f94002b8     	ldr	x24, [x21]
 46512a0: 34000116     	cbz	w22, 0x46512c0 <_ChromeMain+0x464c024>
 46512a4: 710006df     	cmp	w22, #0x1
 46512a8: 540004c0     	b.eq	0x4651340 <_ChromeMain+0x464c0a4>
 46512ac: eb1802ff     	cmp	x23, x24
 46512b0: 54000360     	b.eq	0x465131c <_ChromeMain+0x464c080>
 46512b4: 9100e3e0     	add	x0, sp, #0x38
 46512b8: 9707d562     	bl	0x846840 <_ChromeMain+0x8415a4>
 46512bc: 1400002a     	b	0x4651364 <_ChromeMain+0x464c0c8>
 46512c0: eb1802ff     	cmp	x23, x24
 46512c4: 54ffff81     	b.ne	0x46512b4 <_ChromeMain+0x464c018>
 46512c8: b94043e8     	ldr	w8, [sp, #0x40]
 46512cc: b9400aa9     	ldr	w9, [x21, #0x8]
 46512d0: 6b09011f     	cmp	w8, w9
 46512d4: 54ffff01     	b.ne	0x46512b4 <_ChromeMain+0x464c018>
 46512d8: 394123e8     	ldrb	w8, [sp, #0x48]
 46512dc: 394042a9     	ldrb	w9, [x21, #0x10]
 46512e0: 7103fd1f     	cmp	w8, #0xff
 46512e4: 540015e0     	b.eq	0x46515a0 <_ChromeMain+0x464c304>
 46512e8: 6b08013f     	cmp	w9, w8
 46512ec: 540015a1     	b.ne	0x46515a0 <_ChromeMain+0x464c304>
 46512f0: b94047e8     	ldr	w8, [sp, #0x44]
 46512f4: b9400ea9     	ldr	w9, [x21, #0xc]
 46512f8: 6b09011f     	cmp	w8, w9
 46512fc: 54fffdc1     	b.ne	0x46512b4 <_ChromeMain+0x464c018>
 4651300: f9402bf6     	ldr	x22, [sp, #0x50]
 4651304: f9400eb7     	ldr	x23, [x21, #0x18]
 4651308: 9100e3e0     	add	x0, sp, #0x38
 465130c: 9707d54d     	bl	0x846840 <_ChromeMain+0x8415a4>
 4651310: eb1702df     	cmp	x22, x23
 4651314: 54000281     	b.ne	0x4651364 <_ChromeMain+0x464c0c8>
 4651318: 14000016     	b	0x4651370 <_ChromeMain+0x464c0d4>
 465131c: 29485bf8     	ldp	w24, w22, [sp, #0x40]
 4651320: 29415eb9     	ldp	w25, w23, [x21, #0x8]
 4651324: 9100e3e0     	add	x0, sp, #0x38
 4651328: 9707d546     	bl	0x846840 <_ChromeMain+0x8415a4>
 465132c: 6b19031f     	cmp	w24, w25
 4651330: 540001a1     	b.ne	0x4651364 <_ChromeMain+0x464c0c8>
 4651334: 6b1702df     	cmp	w22, w23
 4651338: 54000161     	b.ne	0x4651364 <_ChromeMain+0x464c0c8>
 465133c: 1400000d     	b	0x4651370 <_ChromeMain+0x464c0d4>
 4651340: 9100e3e0     	add	x0, sp, #0x38
 4651344: 9707d53f     	bl	0x846840 <_ChromeMain+0x8415a4>
 4651348: eb1802ff     	cmp	x23, x24
 465134c: 540000c1     	b.ne	0x4651364 <_ChromeMain+0x464c0c8>
 4651350: 14000008     	b	0x4651370 <_ChromeMain+0x464c0d4>
 4651354: 9100e3e0     	add	x0, sp, #0x38
 4651358: 9707d53a     	bl	0x846840 <_ChromeMain+0x8415a4>
 465135c: 6b1602ff     	cmp	w23, w22
 4651360: 54000080     	b.eq	0x4651370 <_ChromeMain+0x464c0d4>
 4651364: f9418e60     	ldr	x0, [x19, #0x318]
 4651368: aa1503e1     	mov	x1, x21
 465136c: 96fd3f4d     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4651370: 6f00e400     	movi.2d	v0, #0000000000000000
 4651374: 0ea06501     	smax.2s	v1, v8, v0
 4651378: 7100029f     	cmp	w20, #0x0
 465137c: 1e6e1009     	fmov	d9, #1.00000000
 4651380: 6f00e40a     	movi.2d	v10, #0000000000000000
 4651384: 1e691d48     	fcsel	d8, d10, d9, ne
 4651388: 39472268     	ldrb	w8, [x19, #0x1c8]
 465138c: 370007c8     	tbnz	w8, #0x0, 0x4651484 <_ChromeMain+0x464c1e8>
 4651390: f9400268     	ldr	x8, [x19]
 4651394: f9405108     	ldr	x8, [x8, #0xa0]
 4651398: aa1303e0     	mov	x0, x19
 465139c: 52800021     	mov	w1, #0x1                ; =1
 46513a0: 3d8003e1     	str	q1, [sp]
 46513a4: d63f0100     	blr	x8
 46513a8: 910083e1     	add	x1, sp, #0x20
 46513ac: aa1303e0     	mov	x0, x19
 46513b0: 97094df8     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 46513b4: ad400be1     	ldp	q1, q2, [sp]
 46513b8: 7100029f     	cmp	w20, #0x0
 46513bc: 1e6a1d20     	fcsel	d0, d9, d10, ne
 46513c0: fd01f260     	str	d0, [x19, #0x3e0]
 46513c4: 9106e268     	add	x8, x19, #0x1b8
 46513c8: 6e180422     	mov.d	v2[1], v1[0]
 46513cc: 3dc00101     	ldr	q1, [x8]
 46513d0: ad1d8a61     	stp	q1, q2, [x19, #0x3b0]
 46513d4: fd01ea60     	str	d0, [x19, #0x3d0]
 46513d8: fd01ee68     	str	d8, [x19, #0x3d8]
 46513dc: 394e0268     	ldrb	w8, [x19, #0x380]
 46513e0: 35000dc8     	cbnz	w8, 0x4651598 <_ChromeMain+0x464c2fc>
 46513e4: f901ce7f     	str	xzr, [x19, #0x398]
 46513e8: 394ce268     	ldrb	w8, [x19, #0x338]
 46513ec: 35000a48     	cbnz	w8, 0x4651534 <_ChromeMain+0x464c298>
 46513f0: 910ca260     	add	x0, x19, #0x328
 46513f4: 52800001     	mov	w1, #0x0                ; =0
 46513f8: 9775355b     	bl	0x239e964 <_ChromeMain+0x23996c8>
 46513fc: f941f668     	ldr	x8, [x19, #0x3e8]
 4651400: 91000508     	add	x8, x8, #0x1
 4651404: f901f668     	str	x8, [x19, #0x3e8]
 4651408: fd41ce68     	ldr	d8, [x19, #0x398]
 465140c: 910ec260     	add	x0, x19, #0x3b0
 4651410: 910f0261     	add	x1, x19, #0x3c0
 4651414: 4ea81d00     	mov.16b	v0, v8
 4651418: 97802fbb     	bl	0x265d304 <_ChromeMain+0x2658068>
 465141c: a90387e0     	stp	x0, x1, [sp, #0x38]
 4651420: 9100e3e1     	add	x1, sp, #0x38
 4651424: aa1303e0     	mov	x0, x19
 4651428: 97094dda     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 465142c: fd41ea60     	ldr	d0, [x19, #0x3d0]
 4651430: fd41ee61     	ldr	d1, [x19, #0x3d8]
 4651434: 1e603821     	fsub	d1, d1, d0
 4651438: 1e610901     	fmul	d1, d8, d1
 465143c: 1e612800     	fadd	d0, d0, d1
 4651440: fd01f260     	str	d0, [x19, #0x3e0]
 4651444: aa1303e0     	mov	x0, x19
 4651448: 52800001     	mov	w1, #0x0                ; =0
 465144c: 96ff7c0a     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4651450: aa1303e0     	mov	x0, x19
 4651454: 96fd3f4a     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4651458: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 465145c: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4651460: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4651464: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 4651468: a94867fa     	ldp	x26, x25, [sp, #0x80]
 465146c: 6d4723e9     	ldp	d9, d8, [sp, #0x70]
 4651470: 6d462beb     	ldp	d11, d10, [sp, #0x60]
 4651474: 910343ff     	add	sp, sp, #0xd0
 4651478: d65f03c0     	ret
 465147c: fd41f260     	ldr	d0, [x19, #0x3e0]
 4651480: 17ffffd1     	b	0x46513c4 <_ChromeMain+0x464c128>
 4651484: fd41ee60     	ldr	d0, [x19, #0x3d8]
 4651488: 1e682000     	fcmp	d0, d8
 465148c: 3dc007e2     	ldr	q2, [sp, #0x10]
 4651490: 54ffff61     	b.ne	0x465147c <_ChromeMain+0x464c1e0>
 4651494: b943c26a     	ldr	w10, [x19, #0x3c0]
 4651498: 1e260048     	fmov	w8, s2
 465149c: 0e0c3c49     	mov.s	w9, v2[1]
 46514a0: 6b08015f     	cmp	w10, w8
 46514a4: 54000141     	b.ne	0x46514cc <_ChromeMain+0x464c230>
 46514a8: b943c66a     	ldr	w10, [x19, #0x3c4]
 46514ac: 6b09015f     	cmp	w10, w9
 46514b0: 540000e1     	b.ne	0x46514cc <_ChromeMain+0x464c230>
 46514b4: fd41e660     	ldr	d0, [x19, #0x3c8]
 46514b8: 2ea18c00     	cmeq.2s	v0, v0, v1
 46514bc: 0e0c3c0a     	mov.s	w10, v0[1]
 46514c0: 1e26000b     	fmov	w11, s0
 46514c4: 0a0a016a     	and	w10, w11, w10
 46514c8: 3707fc8a     	tbnz	w10, #0x0, 0x4651458 <_ChromeMain+0x464c1bc>
 46514cc: b903c268     	str	w8, [x19, #0x3c0]
 46514d0: b903c669     	str	w9, [x19, #0x3c4]
 46514d4: fd01e661     	str	d1, [x19, #0x3c8]
 46514d8: 394ce268     	ldrb	w8, [x19, #0x338]
 46514dc: 3707fbe8     	tbnz	w8, #0x0, 0x4651458 <_ChromeMain+0x464c1bc>
 46514e0: 910f0261     	add	x1, x19, #0x3c0
 46514e4: aa1303e0     	mov	x0, x19
 46514e8: 97094daa     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 46514ec: fd41ee60     	ldr	d0, [x19, #0x3d8]
 46514f0: fd01f260     	str	d0, [x19, #0x3e0]
 46514f4: 17ffffd9     	b	0x4651458 <_ChromeMain+0x464c1bc>
 46514f8: 397e42fa     	ldrb	w26, [x23, #0xf90]
 46514fc: 52800300     	mov	w0, #0x18               ; =24
 4651500: 96e6f79a     	bl	0xf368 <_ChromeMain+0xa0cc>
 4651504: aa0003f9     	mov	x25, x0
 4651508: 7100035f     	cmp	w26, #0x0
 465150c: 9a9713e1     	csel	x1, xzr, x23, ne
 4651510: 52800042     	mov	w2, #0x2                ; =2
 4651514: 94e593b8     	bl	0x7fb63f4 <_ChromeMain+0x7fb1158>
 4651518: f94652e0     	ldr	x0, [x23, #0xca0]
 465151c: f90652f9     	str	x25, [x23, #0xca0]
 4651520: b4ffe360     	cbz	x0, 0x465118c <_ChromeMain+0x464bef0>
 4651524: 94e593cd     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 4651528: 52800301     	mov	w1, #0x18               ; =24
 465152c: 96e6de63     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4651530: 17ffff17     	b	0x465118c <_ChromeMain+0x464bef0>
 4651534: 390ce27f     	strb	wzr, [x19, #0x338]
 4651538: f941a660     	ldr	x0, [x19, #0x348]
 465153c: 910ca261     	add	x1, x19, #0x328
 4651540: 976ae070     	bl	0x2109700 <_ChromeMain+0x2104464>
 4651544: f9419668     	ldr	x8, [x19, #0x328]
 4651548: f9401d08     	ldr	x8, [x8, #0x38]
 465154c: 910ca260     	add	x0, x19, #0x328
 4651550: d63f0100     	blr	x8
 4651554: f941a268     	ldr	x8, [x19, #0x340]
 4651558: b4fff4c8     	cbz	x8, 0x46513f0 <_ChromeMain+0x464c154>
 465155c: f9419668     	ldr	x8, [x19, #0x328]
 4651560: f9402108     	ldr	x8, [x8, #0x40]
 4651564: 910ca260     	add	x0, x19, #0x328
 4651568: d63f0100     	blr	x8
 465156c: f941a268     	ldr	x8, [x19, #0x340]
 4651570: f9400109     	ldr	x9, [x8]
 4651574: 7100001f     	cmp	w0, #0x0
 4651578: 5280020a     	mov	w10, #0x10              ; =16
 465157c: 5280040b     	mov	w11, #0x20              ; =32
 4651580: 9a8a116a     	csel	x10, x11, x10, ne
 4651584: f86a6929     	ldr	x9, [x9, x10]
 4651588: 910ca261     	add	x1, x19, #0x328
 465158c: aa0803e0     	mov	x0, x8
 4651590: d63f0120     	blr	x9
 4651594: 17ffff97     	b	0x46513f0 <_ChromeMain+0x464c154>
 4651598: 390e027f     	strb	wzr, [x19, #0x380]
 465159c: 17ffff92     	b	0x46513e4 <_ChromeMain+0x464c148>
