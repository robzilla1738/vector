
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464d718: d10543ff     	sub	sp, sp, #0x150
 464d71c: a9106ffc     	stp	x28, x27, [sp, #0x100]
 464d720: a9115ff8     	stp	x24, x23, [sp, #0x110]
 464d724: a91257f6     	stp	x22, x21, [sp, #0x120]
 464d728: a9134ff4     	stp	x20, x19, [sp, #0x130]
 464d72c: a9147bfd     	stp	x29, x30, [sp, #0x140]
 464d730: 910503fd     	add	x29, sp, #0x140
 464d734: b40000e1     	cbz	x1, 0x464d750 <_ChromeMain+0x46484b4>
 464d738: 39418428     	ldrb	w8, [x1, #0x61]
 464d73c: 370000a8     	tbnz	w8, #0x0, 0x464d750 <_ChromeMain+0x46484b4>
 464d740: 3941e028     	ldrb	w8, [x1, #0x78]
 464d744: 37000068     	tbnz	w8, #0x0, 0x464d750 <_ChromeMain+0x46484b4>
 464d748: 39624008     	ldrb	w8, [x0, #0x890]
 464d74c: 35000188     	cbnz	w8, 0x464d77c <_ChromeMain+0x46484e0>
 464d750: 52800013     	mov	w19, #0x0               ; =0
 464d754: aa1303e0     	mov	x0, x19
 464d758: a9547bfd     	ldp	x29, x30, [sp, #0x140]
 464d75c: a9534ff4     	ldp	x20, x19, [sp, #0x130]
 464d760: a95257f6     	ldp	x22, x21, [sp, #0x120]
 464d764: a9515ff8     	ldp	x24, x23, [sp, #0x110]
 464d768: a9506ffc     	ldp	x28, x27, [sp, #0x100]
 464d76c: 910543ff     	add	sp, sp, #0x150
 464d770: d65f03c0     	ret
 464d774: aa0903eb     	mov	x11, x9
 464d778: 14000011     	b	0x464d7bc <_ChromeMain+0x4648520>
 464d77c: b9401028     	ldr	w8, [x1, #0x10]
 464d780: f9486c09     	ldr	x9, [x0, #0x10d8]
 464d784: f948700a     	ldr	x10, [x0, #0x10e0]
 464d788: d37ef54b     	lsl	x11, x10, #2
 464d78c: b4ffff4b     	cbz	x11, 0x464d774 <_ChromeMain+0x46484d8>
 464d790: 9342fd6c     	asr	x12, x11, #2
 464d794: aa0903eb     	mov	x11, x9
 464d798: d341fd8d     	lsr	x13, x12, #1
 464d79c: 8b0d096e     	add	x14, x11, x13, lsl #2
 464d7a0: b84045cf     	ldr	w15, [x14], #0x4
 464d7a4: aa6c07f0     	mvn	x16, x12, lsr #1
 464d7a8: 8b10018c     	add	x12, x12, x16
 464d7ac: 6b0801ff     	cmp	w15, w8
 464d7b0: 9a8db18c     	csel	x12, x12, x13, lt
 464d7b4: 9a8bb1cb     	csel	x11, x14, x11, lt
 464d7b8: b5ffff0c     	cbnz	x12, 0x464d798 <_ChromeMain+0x46484fc>
 464d7bc: 8b0a0929     	add	x9, x9, x10, lsl #2
 464d7c0: eb09017f     	cmp	x11, x9
 464d7c4: 54000080     	b.eq	0x464d7d4 <_ChromeMain+0x4648538>
 464d7c8: b9400169     	ldr	w9, [x11]
 464d7cc: 6b09011f     	cmp	w8, w9
 464d7d0: 54fffc0a     	b.ge	0x464d750 <_ChromeMain+0x46484b4>
 464d7d4: f9484809     	ldr	x9, [x0, #0x1090]
 464d7d8: f9484c0a     	ldr	x10, [x0, #0x1098]
 464d7dc: d37ef54b     	lsl	x11, x10, #2
 464d7e0: b400070b     	cbz	x11, 0x464d8c0 <_ChromeMain+0x4648624>
 464d7e4: 9342fd6c     	asr	x12, x11, #2
 464d7e8: aa0903eb     	mov	x11, x9
 464d7ec: d341fd8d     	lsr	x13, x12, #1
 464d7f0: 8b0d096e     	add	x14, x11, x13, lsl #2
 464d7f4: b84045cf     	ldr	w15, [x14], #0x4
 464d7f8: aa6c07f0     	mvn	x16, x12, lsr #1
 464d7fc: 8b10018c     	add	x12, x12, x16
 464d800: 6b0801ff     	cmp	w15, w8
 464d804: 9a8db18c     	csel	x12, x12, x13, lt
 464d808: 9a8bb1cb     	csel	x11, x14, x11, lt
 464d80c: b5ffff0c     	cbnz	x12, 0x464d7ec <_ChromeMain+0x4648550>
 464d810: 8b0a0929     	add	x9, x9, x10, lsl #2
 464d814: eb09017f     	cmp	x11, x9
 464d818: 54000080     	b.eq	0x464d828 <_ChromeMain+0x464858c>
 464d81c: b9400169     	ldr	w9, [x11]
 464d820: 6b09011f     	cmp	w8, w9
 464d824: 54fff96a     	b.ge	0x464d750 <_ChromeMain+0x46484b4>
 464d828: f9402035     	ldr	x21, [x1, #0x40]
 464d82c: b4fff935     	cbz	x21, 0x464d750 <_ChromeMain+0x46484b4>
 464d830: f9007bff     	str	xzr, [sp, #0xf0]
 464d834: 6f00e400     	movi.2d	v0, #0000000000000000
 464d838: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 464d83c: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 464d840: ad0483e0     	stp	q0, q0, [sp, #0x90]
 464d844: 3d8023e0     	str	q0, [sp, #0x80]
 464d848: f9422c08     	ldr	x8, [x0, #0x458]
 464d84c: b40004e8     	cbz	x8, 0x464d8e8 <_ChromeMain+0x464864c>
 464d850: f9429d08     	ldr	x8, [x8, #0x538]
 464d854: f9403513     	ldr	x19, [x8, #0x68]
 464d858: b40004b3     	cbz	x19, 0x464d8ec <_ChromeMain+0x4648650>
 464d85c: 39412268     	ldrb	w8, [x19, #0x48]
 464d860: 37000468     	tbnz	w8, #0x0, 0x464d8ec <_ChromeMain+0x4648650>
 464d864: f9400268     	ldr	x8, [x19]
 464d868: f940b508     	ldr	x8, [x8, #0x168]
 464d86c: aa1303e0     	mov	x0, x19
 464d870: d63f0100     	blr	x8
 464d874: b40003c0     	cbz	x0, 0x464d8ec <_ChromeMain+0x4648650>
 464d878: aa0003f4     	mov	x20, x0
 464d87c: f0044461     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 464d880: 91018021     	add	x1, x1, #0x60
 464d884: 52800202     	mov	w2, #0x10               ; =16
 464d888: 96f9bcf1     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 464d88c: b4000300     	cbz	x0, 0x464d8ec <_ChromeMain+0x4648650>
 464d890: f0044461     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 464d894: 91018021     	add	x1, x1, #0x60
 464d898: aa1403e0     	mov	x0, x20
 464d89c: 52800202     	mov	w2, #0x10               ; =16
 464d8a0: 96f1c462     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 464d8a4: 3100041f     	cmn	w0, #0x1
 464d8a8: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 464d8ac: 9a9fc109     	csel	x9, x8, xzr, gt
 464d8b0: 37f801e0     	tbnz	w0, #0x1f, 0x464d8ec <_ChromeMain+0x4648650>
 464d8b4: 0aa07c0a     	bic	w10, w0, w0, asr #31
 464d8b8: aa0a0120     	orr	x0, x9, x10
 464d8bc: 1400000f     	b	0x464d8f8 <_ChromeMain+0x464865c>
 464d8c0: aa0903eb     	mov	x11, x9
 464d8c4: 17ffffd3     	b	0x464d810 <_ChromeMain+0x4648574>
 464d8c8: b942baa9     	ldr	w9, [x21, #0x2b8]
 464d8cc: 3100053f     	cmn	w9, #0x1
 464d8d0: 54002ae1     	b.ne	0x464de2c <_ChromeMain+0x4648b90>
 464d8d4: 394d2109     	ldrb	w9, [x8, #0x348]
 464d8d8: 34000589     	cbz	w9, 0x464d988 <_ChromeMain+0x46486ec>
 464d8dc: 14000142     	b	0x464dde4 <_ChromeMain+0x4648b48>
 464d8e0: 52800014     	mov	w20, #0x0               ; =0
 464d8e4: 1400005b     	b	0x464da50 <_ChromeMain+0x46487b4>
 464d8e8: d2800013     	mov	x19, #0x0               ; =0
 464d8ec: aa1303e0     	mov	x0, x19
 464d8f0: 97ead734     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 464d8f4: 92600008     	and	x8, x0, #0x100000000
 464d8f8: 2a0003e9     	mov	w9, w0
 464d8fc: aa090108     	orr	x8, x8, x9
 464d900: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 464d904: eb09011f     	cmp	x8, x9
 464d908: 9a898102     	csel	x2, x8, x9, hi
 464d90c: 900484c0     	adrp	x0, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 464d910: 9105b800     	add	x0, x0, #0x16e
 464d914: 900484c3     	adrp	x3, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 464d918: 9105e063     	add	x3, x3, #0x178
 464d91c: 910203e8     	add	x8, sp, #0x80
 464d920: 52800121     	mov	w1, #0x9                ; =9
 464d924: 52800144     	mov	w4, #0xa                ; =10
 464d928: 97fc5df6     	bl	0x4565100 <_ChromeMain+0x455fe64>
 464d92c: f9003bff     	str	xzr, [sp, #0x70]
 464d930: 6f00e400     	movi.2d	v0, #0000000000000000
 464d934: ad0283e0     	stp	q0, q0, [sp, #0x50]
 464d938: ad0183e0     	stp	q0, q0, [sp, #0x30]
 464d93c: ad0083e0     	stp	q0, q0, [sp, #0x10]
 464d940: 3d8003e0     	str	q0, [sp]
 464d944: 90ffcfd3     	adrp	x19, 0x4045000 <_ChromeMain+0x403fd64>
 464d948: 913c8273     	add	x19, x19, #0xf20
 464d94c: f9414aa8     	ldr	x8, [x21, #0x290]
 464d950: b5fffbc8     	cbnz	x8, 0x464d8c8 <_ChromeMain+0x464862c>
 464d954: f94132a8     	ldr	x8, [x21, #0x260]
 464d958: f9401d09     	ldr	x9, [x8, #0x38]
 464d95c: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 464d960: eb13013f     	cmp	x9, x19
 464d964: 540022c1     	b.ne	0x464ddbc <_ChromeMain+0x4648b20>
 464d968: 3100051f     	cmn	w8, #0x1
 464d96c: 54002860     	b.eq	0x464de78 <_ChromeMain+0x4648bdc>
 464d970: f94142a9     	ldr	x9, [x21, #0x280]
 464d974: eb08013f     	cmp	x9, x8
 464d978: 54002709     	b.ls	0x464de58 <_ChromeMain+0x4648bbc>
 464d97c: f9413ea9     	ldr	x9, [x21, #0x278]
 464d980: f8687928     	ldr	x8, [x9, x8, lsl #3]
 464d984: b4002748     	cbz	x8, 0x464de6c <_ChromeMain+0x4648bd0>
 464d988: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 464d98c: b7f82689     	tbnz	x9, #0x3f, 0x464de5c <_ChromeMain+0x4648bc0>
 464d990: b50026a9     	cbnz	x9, 0x464de64 <_ChromeMain+0x4648bc8>
 464d994: f9400d08     	ldr	x8, [x8, #0x18]
 464d998: f9400508     	ldr	x8, [x8, #0x8]
 464d99c: 91018101     	add	x1, x8, #0x60
 464d9a0: 910003e0     	mov	x0, sp
 464d9a4: 96ebb17c     	bl	0x139f94 <_ChromeMain+0x134cf8>
 464d9a8: 394063e8     	ldrb	w8, [sp, #0x18]
 464d9ac: 37000248     	tbnz	w8, #0x0, 0x464d9f4 <_ChromeMain+0x4648758>
 464d9b0: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 464d9b4: 3100051f     	cmn	w8, #0x1
 464d9b8: 540026e0     	b.eq	0x464de94 <_ChromeMain+0x4648bf8>
 464d9bc: f94142a9     	ldr	x9, [x21, #0x280]
 464d9c0: eb08013f     	cmp	x9, x8
 464d9c4: 540024a9     	b.ls	0x464de58 <_ChromeMain+0x4648bbc>
 464d9c8: f9413ea9     	ldr	x9, [x21, #0x278]
 464d9cc: f8687928     	ldr	x8, [x9, x8, lsl #3]
 464d9d0: b4002688     	cbz	x8, 0x464dea0 <_ChromeMain+0x4648c04>
 464d9d4: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 464d9d8: b7f82569     	tbnz	x9, #0x3f, 0x464de84 <_ChromeMain+0x4648be8>
 464d9dc: b5002589     	cbnz	x9, 0x464de8c <_ChromeMain+0x4648bf0>
 464d9e0: f9400d08     	ldr	x8, [x8, #0x18]
 464d9e4: f9400508     	ldr	x8, [x8, #0x8]
 464d9e8: 91018101     	add	x1, x8, #0x60
 464d9ec: 910003e0     	mov	x0, sp
 464d9f0: 96f9f7c7     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 464d9f4: 39405fe9     	ldrb	w9, [sp, #0x17]
 464d9f8: 13001d28     	sxtb	w8, w9
 464d9fc: f94007ea     	ldr	x10, [sp, #0x8]
 464da00: 7100011f     	cmp	w8, #0x0
 464da04: 9a894142     	csel	x2, x10, x9, mi
 464da08: 39425fea     	ldrb	w10, [sp, #0x97]
 464da0c: 13001d49     	sxtb	w9, w10
 464da10: f94047eb     	ldr	x11, [sp, #0x88]
 464da14: 7100013f     	cmp	w9, #0x0
 464da18: 9a8a416a     	csel	x10, x11, x10, mi
 464da1c: eb0a005f     	cmp	x2, x10
 464da20: 54fff601     	b.ne	0x464d8e0 <_ChromeMain+0x4648644>
 464da24: f94003ea     	ldr	x10, [sp]
 464da28: 7100011f     	cmp	w8, #0x0
 464da2c: 910003e8     	mov	x8, sp
 464da30: 9a884140     	csel	x0, x10, x8, mi
 464da34: f94043e8     	ldr	x8, [sp, #0x80]
 464da38: 7100013f     	cmp	w9, #0x0
 464da3c: 910203e9     	add	x9, sp, #0x80
 464da40: 9a894101     	csel	x1, x8, x9, mi
 464da44: 94e6ef87     	bl	0x8009860 <_ChromeMain+0x80045c4>
 464da48: 7100001f     	cmp	w0, #0x0
 464da4c: 1a9f17f4     	cset	w20, eq
 464da50: 910003f6     	mov	x22, sp
 464da54: 9101c2c0     	add	x0, x22, #0x70
 464da58: d2800001     	mov	x1, #0x0                ; =0
 464da5c: 96e76897     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 464da60: 910082c0     	add	x0, x22, #0x20
 464da64: 96e76885     	bl	0x27c78 <_ChromeMain+0x229dc>
 464da68: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 464da6c: 36f800a8     	tbz	w8, #0x1f, 0x464da80 <_ChromeMain+0x46487e4>
 464da70: f94003e0     	ldr	x0, [sp]
 464da74: f9400be8     	ldr	x8, [sp, #0x10]
 464da78: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464da7c: 96e6ed0f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464da80: 37001514     	tbnz	w20, #0x0, 0x464dd20 <_ChromeMain+0x4648a84>
 464da84: f9414ab4     	ldr	x20, [x21, #0x290]
 464da88: b5001694     	cbnz	x20, 0x464dd58 <_ChromeMain+0x4648abc>
 464da8c: f94132a8     	ldr	x8, [x21, #0x260]
 464da90: f9401d09     	ldr	x9, [x8, #0x38]
 464da94: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 464da98: eb13013f     	cmp	x9, x19
 464da9c: 540019a1     	b.ne	0x464ddd0 <_ChromeMain+0x4648b34>
 464daa0: 3100051f     	cmn	w8, #0x1
 464daa4: 54002040     	b.eq	0x464deac <_ChromeMain+0x4648c10>
 464daa8: f94142a9     	ldr	x9, [x21, #0x280]
 464daac: eb08013f     	cmp	x9, x8
 464dab0: 54001d49     	b.ls	0x464de58 <_ChromeMain+0x4648bbc>
 464dab4: f9413ea9     	ldr	x9, [x21, #0x278]
 464dab8: f8687936     	ldr	x22, [x9, x8, lsl #3]
 464dabc: b40005f6     	cbz	x22, 0x464db78 <_ChromeMain+0x46488dc>
 464dac0: f9400ec8     	ldr	x8, [x22, #0x18]
 464dac4: f9400509     	ldr	x9, [x8, #0x8]
 464dac8: 91018138     	add	x24, x9, #0x60
 464dacc: 3941dd2a     	ldrb	w10, [x9, #0x77]
 464dad0: 13001d48     	sxtb	w8, w10
 464dad4: f9403529     	ldr	x9, [x9, #0x68]
 464dad8: 7100011f     	cmp	w8, #0x0
 464dadc: 9a8a4122     	csel	x2, x9, x10, mi
 464dae0: 39425fe9     	ldrb	w9, [sp, #0x97]
 464dae4: 13001d37     	sxtb	w23, w9
 464dae8: f94047ea     	ldr	x10, [sp, #0x88]
 464daec: 710002ff     	cmp	w23, #0x0
 464daf0: 9a894153     	csel	x19, x10, x9, mi
 464daf4: eb13005f     	cmp	x2, x19
 464daf8: 54000141     	b.ne	0x464db20 <_ChromeMain+0x4648884>
 464dafc: f9400309     	ldr	x9, [x24]
 464db00: 7100011f     	cmp	w8, #0x0
 464db04: 9a984120     	csel	x0, x9, x24, mi
 464db08: f94043e8     	ldr	x8, [sp, #0x80]
 464db0c: 710002ff     	cmp	w23, #0x0
 464db10: 910203e9     	add	x9, sp, #0x80
 464db14: 9a894101     	csel	x1, x8, x9, mi
 464db18: 94e6ef52     	bl	0x8009860 <_ChromeMain+0x80045c4>
 464db1c: 34001020     	cbz	w0, 0x464dd20 <_ChromeMain+0x4648a84>
 464db20: 9100a2c8     	add	x8, x22, #0x28
 464db24: 3980fec9     	ldrsb	x9, [x22, #0x3f]
 464db28: b7f81c89     	tbnz	x9, #0x3f, 0x464deb8 <_ChromeMain+0x4648c1c>
 464db2c: f100013f     	cmp	x9, #0x0
 464db30: 9a880308     	csel	x8, x24, x8, eq
 464db34: 39405d0a     	ldrb	w10, [x8, #0x17]
 464db38: 13001d49     	sxtb	w9, w10
 464db3c: f940050b     	ldr	x11, [x8, #0x8]
 464db40: 7100013f     	cmp	w9, #0x0
 464db44: 9a8a416a     	csel	x10, x11, x10, mi
 464db48: eb13015f     	cmp	x10, x19
 464db4c: 54000161     	b.ne	0x464db78 <_ChromeMain+0x46488dc>
 464db50: f940010a     	ldr	x10, [x8]
 464db54: 7100013f     	cmp	w9, #0x0
 464db58: 9a884140     	csel	x0, x10, x8, mi
 464db5c: f94043e8     	ldr	x8, [sp, #0x80]
 464db60: 710002ff     	cmp	w23, #0x0
 464db64: 910203e9     	add	x9, sp, #0x80
 464db68: 9a894101     	csel	x1, x8, x9, mi
 464db6c: aa1303e2     	mov	x2, x19
 464db70: 94e6ef3c     	bl	0x8009860 <_ChromeMain+0x80045c4>
 464db74: 34000d60     	cbz	w0, 0x464dd20 <_ChromeMain+0x4648a84>
 464db78: b40005f4     	cbz	x20, 0x464dc34 <_ChromeMain+0x4648998>
 464db7c: f9400e88     	ldr	x8, [x20, #0x18]
 464db80: f9400509     	ldr	x9, [x8, #0x8]
 464db84: 91018137     	add	x23, x9, #0x60
 464db88: 3941dd2a     	ldrb	w10, [x9, #0x77]
 464db8c: 13001d48     	sxtb	w8, w10
 464db90: f9403529     	ldr	x9, [x9, #0x68]
 464db94: 7100011f     	cmp	w8, #0x0
 464db98: 9a8a4122     	csel	x2, x9, x10, mi
 464db9c: 39425fe9     	ldrb	w9, [sp, #0x97]
 464dba0: 13001d36     	sxtb	w22, w9
 464dba4: f94047ea     	ldr	x10, [sp, #0x88]
 464dba8: 710002df     	cmp	w22, #0x0
 464dbac: 9a894153     	csel	x19, x10, x9, mi
 464dbb0: eb13005f     	cmp	x2, x19
 464dbb4: 54000141     	b.ne	0x464dbdc <_ChromeMain+0x4648940>
 464dbb8: f94002e9     	ldr	x9, [x23]
 464dbbc: 7100011f     	cmp	w8, #0x0
 464dbc0: 9a974120     	csel	x0, x9, x23, mi
 464dbc4: f94043e8     	ldr	x8, [sp, #0x80]
 464dbc8: 710002df     	cmp	w22, #0x0
 464dbcc: 910203e9     	add	x9, sp, #0x80
 464dbd0: 9a894101     	csel	x1, x8, x9, mi
 464dbd4: 94e6ef23     	bl	0x8009860 <_ChromeMain+0x80045c4>
 464dbd8: 34000a40     	cbz	w0, 0x464dd20 <_ChromeMain+0x4648a84>
 464dbdc: 9100a288     	add	x8, x20, #0x28
 464dbe0: 3980fe89     	ldrsb	x9, [x20, #0x3f]
 464dbe4: b7f81749     	tbnz	x9, #0x3f, 0x464decc <_ChromeMain+0x4648c30>
 464dbe8: f100013f     	cmp	x9, #0x0
 464dbec: 9a8802e8     	csel	x8, x23, x8, eq
 464dbf0: 39405d0a     	ldrb	w10, [x8, #0x17]
 464dbf4: 13001d49     	sxtb	w9, w10
 464dbf8: f940050b     	ldr	x11, [x8, #0x8]
 464dbfc: 7100013f     	cmp	w9, #0x0
 464dc00: 9a8a416a     	csel	x10, x11, x10, mi
 464dc04: eb13015f     	cmp	x10, x19
 464dc08: 54000161     	b.ne	0x464dc34 <_ChromeMain+0x4648998>
 464dc0c: f940010a     	ldr	x10, [x8]
 464dc10: 7100013f     	cmp	w9, #0x0
 464dc14: 9a884140     	csel	x0, x10, x8, mi
 464dc18: f94043e8     	ldr	x8, [sp, #0x80]
 464dc1c: 710002df     	cmp	w22, #0x0
 464dc20: 910203e9     	add	x9, sp, #0x80
 464dc24: 9a894101     	csel	x1, x8, x9, mi
 464dc28: aa1303e2     	mov	x2, x19
 464dc2c: 94e6ef0d     	bl	0x8009860 <_ChromeMain+0x80045c4>
 464dc30: 34000780     	cbz	w0, 0x464dd20 <_ChromeMain+0x4648a84>
 464dc34: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 464dc38: 3100051f     	cmn	w8, #0x1
 464dc3c: 54001420     	b.eq	0x464dec0 <_ChromeMain+0x4648c24>
 464dc40: f94142a9     	ldr	x9, [x21, #0x280]
 464dc44: eb08013f     	cmp	x9, x8
 464dc48: 54001089     	b.ls	0x464de58 <_ChromeMain+0x4648bbc>
 464dc4c: f9413ea9     	ldr	x9, [x21, #0x278]
 464dc50: f8687936     	ldr	x22, [x9, x8, lsl #3]
 464dc54: b4000636     	cbz	x22, 0x464dd18 <_ChromeMain+0x4648a7c>
 464dc58: f9400ec8     	ldr	x8, [x22, #0x18]
 464dc5c: f9400509     	ldr	x9, [x8, #0x8]
 464dc60: 91018135     	add	x21, x9, #0x60
 464dc64: 3941dd2a     	ldrb	w10, [x9, #0x77]
 464dc68: 13001d48     	sxtb	w8, w10
 464dc6c: f9403529     	ldr	x9, [x9, #0x68]
 464dc70: 7100011f     	cmp	w8, #0x0
 464dc74: 9a8a4122     	csel	x2, x9, x10, mi
 464dc78: 39425fe9     	ldrb	w9, [sp, #0x97]
 464dc7c: 13001d34     	sxtb	w20, w9
 464dc80: f94047ea     	ldr	x10, [sp, #0x88]
 464dc84: 7100029f     	cmp	w20, #0x0
 464dc88: 9a894153     	csel	x19, x10, x9, mi
 464dc8c: eb13005f     	cmp	x2, x19
 464dc90: 54000141     	b.ne	0x464dcb8 <_ChromeMain+0x4648a1c>
 464dc94: f94002a9     	ldr	x9, [x21]
 464dc98: 7100011f     	cmp	w8, #0x0
 464dc9c: 9a954120     	csel	x0, x9, x21, mi
 464dca0: f94043e8     	ldr	x8, [sp, #0x80]
 464dca4: 7100029f     	cmp	w20, #0x0
 464dca8: 910203e9     	add	x9, sp, #0x80
 464dcac: 9a894101     	csel	x1, x8, x9, mi
 464dcb0: 94e6eeec     	bl	0x8009860 <_ChromeMain+0x80045c4>
 464dcb4: 34000360     	cbz	w0, 0x464dd20 <_ChromeMain+0x4648a84>
 464dcb8: 9100a2c8     	add	x8, x22, #0x28
 464dcbc: 3980fec9     	ldrsb	x9, [x22, #0x3f]
 464dcc0: b7f810a9     	tbnz	x9, #0x3f, 0x464ded4 <_ChromeMain+0x4648c38>
 464dcc4: f100013f     	cmp	x9, #0x0
 464dcc8: 9a8802a8     	csel	x8, x21, x8, eq
 464dccc: 39405d0a     	ldrb	w10, [x8, #0x17]
 464dcd0: 13001d49     	sxtb	w9, w10
 464dcd4: f940050b     	ldr	x11, [x8, #0x8]
 464dcd8: 7100013f     	cmp	w9, #0x0
 464dcdc: 9a8a416a     	csel	x10, x11, x10, mi
 464dce0: eb13015f     	cmp	x10, x19
 464dce4: 540001a1     	b.ne	0x464dd18 <_ChromeMain+0x4648a7c>
 464dce8: f940010a     	ldr	x10, [x8]
 464dcec: 7100013f     	cmp	w9, #0x0
 464dcf0: 9a884140     	csel	x0, x10, x8, mi
 464dcf4: f94043e8     	ldr	x8, [sp, #0x80]
 464dcf8: 7100029f     	cmp	w20, #0x0
 464dcfc: 910203e9     	add	x9, sp, #0x80
 464dd00: 9a894101     	csel	x1, x8, x9, mi
 464dd04: aa1303e2     	mov	x2, x19
 464dd08: 94e6eed6     	bl	0x8009860 <_ChromeMain+0x80045c4>
 464dd0c: 7100001f     	cmp	w0, #0x0
 464dd10: 1a9f17f3     	cset	w19, eq
 464dd14: 14000004     	b	0x464dd24 <_ChromeMain+0x4648a88>
 464dd18: 52800013     	mov	w19, #0x0               ; =0
 464dd1c: 14000002     	b	0x464dd24 <_ChromeMain+0x4648a88>
 464dd20: 52800033     	mov	w19, #0x1               ; =1
 464dd24: 910203f4     	add	x20, sp, #0x80
 464dd28: 9101c280     	add	x0, x20, #0x70
 464dd2c: d2800001     	mov	x1, #0x0                ; =0
 464dd30: 96e767e2     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 464dd34: 91008280     	add	x0, x20, #0x20
 464dd38: 96e767d0     	bl	0x27c78 <_ChromeMain+0x229dc>
 464dd3c: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 464dd40: 36ffd0a8     	tbz	w8, #0x1f, 0x464d754 <_ChromeMain+0x46484b8>
 464dd44: f94043e0     	ldr	x0, [sp, #0x80]
 464dd48: f9404be8     	ldr	x8, [sp, #0x90]
 464dd4c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464dd50: 96e6ec5a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464dd54: 17fffe80     	b	0x464d754 <_ChromeMain+0x46484b8>
 464dd58: b942baa8     	ldr	w8, [x21, #0x2b8]
 464dd5c: 3100051f     	cmn	w8, #0x1
 464dd60: 54000701     	b.ne	0x464de40 <_ChromeMain+0x4648ba4>
 464dd64: 394d2288     	ldrb	w8, [x20, #0x348]
 464dd68: aa1403f6     	mov	x22, x20
 464dd6c: 34ffeaa8     	cbz	w8, 0x464dac0 <_ChromeMain+0x4648824>
 464dd70: 394ba2a8     	ldrb	w8, [x21, #0x2e8]
 464dd74: 34ffe8c8     	cbz	w8, 0x464da8c <_ChromeMain+0x46487f0>
 464dd78: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 464dd7c: 3100051f     	cmn	w8, #0x1
 464dd80: 54000ba0     	b.eq	0x464def4 <_ChromeMain+0x4648c58>
 464dd84: f94142a9     	ldr	x9, [x21, #0x280]
 464dd88: eb08013f     	cmp	x9, x8
 464dd8c: 54000669     	b.ls	0x464de58 <_ChromeMain+0x4648bbc>
 464dd90: f9413ea9     	ldr	x9, [x21, #0x278]
 464dd94: f8687928     	ldr	x8, [x9, x8, lsl #3]
 464dd98: b9443108     	ldr	w8, [x8, #0x430]
 464dd9c: 7100091f     	cmp	w8, #0x2
 464dda0: 54ffe760     	b.eq	0x464da8c <_ChromeMain+0x46487f0>
 464dda4: f94136a8     	ldr	x8, [x21, #0x268]
 464dda8: b4000ac8     	cbz	x8, 0x464df00 <_ChromeMain+0x4648c64>
 464ddac: 39458108     	ldrb	w8, [x8, #0x160]
 464ddb0: aa1403f6     	mov	x22, x20
 464ddb4: 3707e6c8     	tbnz	w8, #0x0, 0x464da8c <_ChromeMain+0x46487f0>
 464ddb8: 17ffff42     	b	0x464dac0 <_ChromeMain+0x4648824>
 464ddbc: 3100051f     	cmn	w8, #0x1
 464ddc0: 54ffdd81     	b.ne	0x464d970 <_ChromeMain+0x46486d4>
 464ddc4: d4200000     	brk	#0
 464ddc8: d4400000     	hlt	#0
 464ddcc: d4200020     	brk	#0x1
 464ddd0: 3100051f     	cmn	w8, #0x1
 464ddd4: 54ffe6a1     	b.ne	0x464daa8 <_ChromeMain+0x464880c>
 464ddd8: d4200000     	brk	#0
 464dddc: d4400000     	hlt	#0
 464dde0: d4200020     	brk	#0x1
 464dde4: 394ba2a9     	ldrb	w9, [x21, #0x2e8]
 464dde8: 34ffdb69     	cbz	w9, 0x464d954 <_ChromeMain+0x46486b8>
 464ddec: b982b6a9     	ldrsw	x9, [x21, #0x2b4]
 464ddf0: 3100053f     	cmn	w9, #0x1
 464ddf4: 54000740     	b.eq	0x464dedc <_ChromeMain+0x4648c40>
 464ddf8: f94142aa     	ldr	x10, [x21, #0x280]
 464ddfc: eb09015f     	cmp	x10, x9
 464de00: 540002c9     	b.ls	0x464de58 <_ChromeMain+0x4648bbc>
 464de04: f9413eaa     	ldr	x10, [x21, #0x278]
 464de08: f8697949     	ldr	x9, [x10, x9, lsl #3]
 464de0c: b9443129     	ldr	w9, [x9, #0x430]
 464de10: 7100093f     	cmp	w9, #0x2
 464de14: 54ffda00     	b.eq	0x464d954 <_ChromeMain+0x46486b8>
 464de18: f94136a9     	ldr	x9, [x21, #0x268]
 464de1c: b4000669     	cbz	x9, 0x464dee8 <_ChromeMain+0x4648c4c>
 464de20: 39458129     	ldrb	w9, [x9, #0x160]
 464de24: 3707d989     	tbnz	w9, #0x0, 0x464d954 <_ChromeMain+0x46486b8>
 464de28: 17fffed8     	b	0x464d988 <_ChromeMain+0x46486ec>
 464de2c: 394ba2a9     	ldrb	w9, [x21, #0x2e8]
 464de30: 34ffd929     	cbz	w9, 0x464d954 <_ChromeMain+0x46486b8>
 464de34: 394d2109     	ldrb	w9, [x8, #0x348]
 464de38: 35ffd8e9     	cbnz	w9, 0x464d954 <_ChromeMain+0x46486b8>
 464de3c: 17fffed3     	b	0x464d988 <_ChromeMain+0x46486ec>
 464de40: 394ba2a8     	ldrb	w8, [x21, #0x2e8]
 464de44: 34ffe248     	cbz	w8, 0x464da8c <_ChromeMain+0x46487f0>
 464de48: 394d2288     	ldrb	w8, [x20, #0x348]
 464de4c: aa1403f6     	mov	x22, x20
 464de50: 35ffe1e8     	cbnz	w8, 0x464da8c <_ChromeMain+0x46487f0>
 464de54: 17ffff1b     	b	0x464dac0 <_ChromeMain+0x4648824>
 464de58: d4200020     	brk	#0x1
 464de5c: f9401909     	ldr	x9, [x8, #0x30]
 464de60: b4ffd9a9     	cbz	x9, 0x464d994 <_ChromeMain+0x46486f8>
 464de64: 9100a101     	add	x1, x8, #0x28
 464de68: 17fffece     	b	0x464d9a0 <_ChromeMain+0x4648704>
 464de6c: 97d07303     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 464de70: aa0003e1     	mov	x1, x0
 464de74: 17fffecb     	b	0x464d9a0 <_ChromeMain+0x4648704>
 464de78: d4200000     	brk	#0
 464de7c: d4400000     	hlt	#0
 464de80: d4200020     	brk	#0x1
 464de84: f9401909     	ldr	x9, [x8, #0x30]
 464de88: b4ffdac9     	cbz	x9, 0x464d9e0 <_ChromeMain+0x4648744>
 464de8c: 9100a101     	add	x1, x8, #0x28
 464de90: 17fffed7     	b	0x464d9ec <_ChromeMain+0x4648750>
 464de94: d4200000     	brk	#0
 464de98: d4400000     	hlt	#0
 464de9c: d4200020     	brk	#0x1
 464dea0: 97d072f6     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 464dea4: aa0003e1     	mov	x1, x0
 464dea8: 17fffed1     	b	0x464d9ec <_ChromeMain+0x4648750>
 464deac: d4200000     	brk	#0
 464deb0: d4400000     	hlt	#0
 464deb4: d4200020     	brk	#0x1
 464deb8: f9401ac9     	ldr	x9, [x22, #0x30]
 464debc: 17ffff1c     	b	0x464db2c <_ChromeMain+0x4648890>
 464dec0: d4200000     	brk	#0
 464dec4: d4400000     	hlt	#0
 464dec8: d4200020     	brk	#0x1
 464decc: f9401a89     	ldr	x9, [x20, #0x30]
 464ded0: 17ffff46     	b	0x464dbe8 <_ChromeMain+0x464894c>
 464ded4: f9401ac9     	ldr	x9, [x22, #0x30]
 464ded8: 17ffff7b     	b	0x464dcc4 <_ChromeMain+0x4648a28>
 464dedc: d4200000     	brk	#0
 464dee0: d4400000     	hlt	#0
 464dee4: d4200020     	brk	#0x1
 464dee8: d4200000     	brk	#0
 464deec: d4400000     	hlt	#0
 464def0: d4200020     	brk	#0x1
 464def4: d4200000     	brk	#0
 464def8: d4400000     	hlt	#0
 464defc: d4200020     	brk	#0x1
 464df00: d4200000     	brk	#0
 464df04: d4400000     	hlt	#0
 464df08: d4200020     	brk	#0x1
