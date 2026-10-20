
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40fa214: d10403ff     	sub	sp, sp, #0x100
 40fa218: a90b67fa     	stp	x26, x25, [sp, #0xb0]
 40fa21c: a90c5ff8     	stp	x24, x23, [sp, #0xc0]
 40fa220: a90d57f6     	stp	x22, x21, [sp, #0xd0]
 40fa224: a90e4ff4     	stp	x20, x19, [sp, #0xe0]
 40fa228: a90f7bfd     	stp	x29, x30, [sp, #0xf0]
 40fa22c: 9103c3fd     	add	x29, sp, #0xf0
 40fa230: aa0403f6     	mov	x22, x4
 40fa234: aa0303f4     	mov	x20, x3
 40fa238: aa0203f5     	mov	x21, x2
 40fa23c: aa0103f7     	mov	x23, x1
 40fa240: aa0803f3     	mov	x19, x8
 40fa244: a9007d1f     	stp	xzr, xzr, [x8]
 40fa248: f900091f     	str	xzr, [x8, #0x10]
 40fa24c: 39405c08     	ldrb	w8, [x0, #0x17]
 40fa250: 13001d09     	sxtb	w9, w8
 40fa254: a9402c0a     	ldp	x10, x11, [x0]
 40fa258: 7100013f     	cmp	w9, #0x0
 40fa25c: 9a804143     	csel	x3, x10, x0, mi
 40fa260: 9a884164     	csel	x4, x11, x8, mi
 40fa264: b004cca1     	adrp	x1, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40fa268: 91049421     	add	x1, x1, #0x125
 40fa26c: aa1303e0     	mov	x0, x19
 40fa270: 528001e2     	mov	w2, #0xf                ; =15
 40fa274: 975698d5     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 40fa278: 9100c3f8     	add	x24, sp, #0x30
 40fa27c: 9100c3e8     	add	x8, sp, #0x30
 40fa280: aa1703e0     	mov	x0, x23
 40fa284: 97288b88     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 40fa288: 9100c3e0     	add	x0, sp, #0x30
 40fa28c: 9715c9ff     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 40fa290: 39805c08     	ldrsb	x8, [x0, #0x17]
 40fa294: a9402809     	ldp	x9, x10, [x0]
 40fa298: f100011f     	cmp	x8, #0x0
 40fa29c: 9a804123     	csel	x3, x9, x0, mi
 40fa2a0: 7100011f     	cmp	w8, #0x0
 40fa2a4: 9a884144     	csel	x4, x10, x8, mi
 40fa2a8: d004c561     	adrp	x1, 0xd9a8000 <dyld_stub_binder+0xd9a8000>
 40fa2ac: 91025421     	add	x1, x1, #0x95
 40fa2b0: aa1303e0     	mov	x0, x19
 40fa2b4: 52800102     	mov	w2, #0x8                ; =8
 40fa2b8: 975698c4     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 40fa2bc: 9101c300     	add	x0, x24, #0x70
 40fa2c0: d2800001     	mov	x1, #0x0                ; =0
 40fa2c4: 96fcb67d     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40fa2c8: 91008300     	add	x0, x24, #0x20
 40fa2cc: 96fcb66b     	bl	0x27c78 <_ChromeMain+0x229dc>
 40fa2d0: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 40fa2d4: 36f800a8     	tbz	w8, #0x1f, 0x40fa2e8 <_ChromeMain+0x40f504c>
 40fa2d8: f9401be0     	ldr	x0, [sp, #0x30]
 40fa2dc: f94023e8     	ldr	x8, [sp, #0x40]
 40fa2e0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fa2e4: 96fc3af5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fa2e8: 39805e81     	ldrsb	x1, [x20, #0x17]
 40fa2ec: b7f80e61     	tbnz	x1, #0x3f, 0x40fa4b8 <_ChromeMain+0x40f521c>
 40fa2f0: aa1403e0     	mov	x0, x20
 40fa2f4: 910063e8     	add	x8, sp, #0x18
 40fa2f8: 973aa284     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 40fa2fc: 3cc183e0     	ldur	q0, [sp, #0x18]
 40fa300: 3d800fe0     	str	q0, [sp, #0x30]
 40fa304: f94017e8     	ldr	x8, [sp, #0x28]
 40fa308: f90023e8     	str	x8, [sp, #0x40]
 40fa30c: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 40fa310: f90017ff     	str	xzr, [sp, #0x28]
 40fa314: 52800088     	mov	w8, #0x4                ; =4
 40fa318: 390123e8     	strb	w8, [sp, #0x48]
 40fa31c: d004b801     	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 40fa320: 91307021     	add	x1, x1, #0xc1c
 40fa324: 9100c3e3     	add	x3, sp, #0x30
 40fa328: aa1303e0     	mov	x0, x19
 40fa32c: 528000a2     	mov	w2, #0x5                ; =5
 40fa330: 971102e4     	bl	0x53aec0 <_ChromeMain+0x535c24>
 40fa334: 394123e8     	ldrb	w8, [sp, #0x48]
 40fa338: f0053e38     	adrp	x24, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 40fa33c: 9121e318     	add	x24, x24, #0x878
 40fa340: f103fd1f     	cmp	x8, #0xff
 40fa344: 540000a0     	b.eq	0x40fa358 <_ChromeMain+0x40f50bc>
 40fa348: f8687b08     	ldr	x8, [x24, x8, lsl #3]
 40fa34c: 910003e0     	mov	x0, sp
 40fa350: 9100c3e1     	add	x1, sp, #0x30
 40fa354: d63f0100     	blr	x8
 40fa358: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 40fa35c: 36f800a8     	tbz	w8, #0x1f, 0x40fa370 <_ChromeMain+0x40f50d4>
 40fa360: f9400fe0     	ldr	x0, [sp, #0x18]
 40fa364: f94017e8     	ldr	x8, [sp, #0x28]
 40fa368: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fa36c: 96fc3ad3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fa370: 39813e81     	ldrsb	x1, [x20, #0x4f]
 40fa374: b7f80a61     	tbnz	x1, #0x3f, 0x40fa4c0 <_ChromeMain+0x40f5224>
 40fa378: 9100e280     	add	x0, x20, #0x38
 40fa37c: 910063e8     	add	x8, sp, #0x18
 40fa380: 973aa262     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 40fa384: 3cc183e0     	ldur	q0, [sp, #0x18]
 40fa388: 3d800fe0     	str	q0, [sp, #0x30]
 40fa38c: f94017e8     	ldr	x8, [sp, #0x28]
 40fa390: f90023e8     	str	x8, [sp, #0x40]
 40fa394: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 40fa398: f90017ff     	str	xzr, [sp, #0x28]
 40fa39c: 52800088     	mov	w8, #0x4                ; =4
 40fa3a0: 390123e8     	strb	w8, [sp, #0x48]
 40fa3a4: b004c2a1     	adrp	x1, 0xd94f000 <dyld_stub_binder+0xd94f000>
 40fa3a8: 9136a421     	add	x1, x1, #0xda9
 40fa3ac: 9100c3e3     	add	x3, sp, #0x30
 40fa3b0: aa1303e0     	mov	x0, x19
 40fa3b4: 52800082     	mov	w2, #0x4                ; =4
 40fa3b8: 971102c2     	bl	0x53aec0 <_ChromeMain+0x535c24>
 40fa3bc: 394123e8     	ldrb	w8, [sp, #0x48]
 40fa3c0: f103fd1f     	cmp	x8, #0xff
 40fa3c4: 540000a0     	b.eq	0x40fa3d8 <_ChromeMain+0x40f513c>
 40fa3c8: f8687b08     	ldr	x8, [x24, x8, lsl #3]
 40fa3cc: 910003e0     	mov	x0, sp
 40fa3d0: 9100c3e1     	add	x1, sp, #0x30
 40fa3d4: d63f0100     	blr	x8
 40fa3d8: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 40fa3dc: 36f800a8     	tbz	w8, #0x1f, 0x40fa3f0 <_ChromeMain+0x40f5154>
 40fa3e0: f9400fe0     	ldr	x0, [sp, #0x18]
 40fa3e4: f94017e8     	ldr	x8, [sp, #0x28]
 40fa3e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fa3ec: 96fc3ab3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fa3f0: 3900c3f6     	strb	w22, [sp, #0x30]
 40fa3f4: 52800028     	mov	w8, #0x1                ; =1
 40fa3f8: 390123e8     	strb	w8, [sp, #0x48]
 40fa3fc: b004cca1     	adrp	x1, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40fa400: 9104d421     	add	x1, x1, #0x135
 40fa404: 9100c3e3     	add	x3, sp, #0x30
 40fa408: aa1303e0     	mov	x0, x19
 40fa40c: 528001a2     	mov	w2, #0xd                ; =13
 40fa410: 971102ac     	bl	0x53aec0 <_ChromeMain+0x535c24>
 40fa414: 394123e8     	ldrb	w8, [sp, #0x48]
 40fa418: f103fd1f     	cmp	x8, #0xff
 40fa41c: 540000a0     	b.eq	0x40fa430 <_ChromeMain+0x40f5194>
 40fa420: f8687b08     	ldr	x8, [x24, x8, lsl #3]
 40fa424: 910063e0     	add	x0, sp, #0x18
 40fa428: 9100c3e1     	add	x1, sp, #0x30
 40fa42c: d63f0100     	blr	x8
 40fa430: 394062a8     	ldrb	w8, [x21, #0x18]
 40fa434: 340001c8     	cbz	w8, 0x40fa46c <_ChromeMain+0x40f51d0>
 40fa438: aa1503e0     	mov	x0, x21
 40fa43c: 9715c993     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 40fa440: 39805c08     	ldrsb	x8, [x0, #0x17]
 40fa444: a9402809     	ldp	x9, x10, [x0]
 40fa448: f100011f     	cmp	x8, #0x0
 40fa44c: 9a804123     	csel	x3, x9, x0, mi
 40fa450: 7100011f     	cmp	w8, #0x0
 40fa454: 9a884144     	csel	x4, x10, x8, mi
 40fa458: b004cca1     	adrp	x1, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40fa45c: 91050c21     	add	x1, x1, #0x143
 40fa460: aa1303e0     	mov	x0, x19
 40fa464: 52800162     	mov	w2, #0xb                ; =11
 40fa468: 97569858     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 40fa46c: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 40fa470: f90017ff     	str	xzr, [sp, #0x28]
 40fa474: f9410295     	ldr	x21, [x20, #0x200]
 40fa478: 92800208     	mov	x8, #-0x11              ; =-17
 40fa47c: f2efffe8     	movk	x8, #0x7fff, lsl #48
 40fa480: eb0802bf     	cmp	x21, x8
 40fa484: 54000c02     	b.hs	0x40fa604 <_ChromeMain+0x40f5368>
 40fa488: f940fe96     	ldr	x22, [x20, #0x1f8]
 40fa48c: f1005abf     	cmp	x21, #0x16
 40fa490: 540001c9     	b.ls	0x40fa4c8 <_ChromeMain+0x40f522c>
 40fa494: 927ceab9     	and	x25, x21, #0x7ffffffffffffff0
 40fa498: 91004320     	add	x0, x25, #0x10
 40fa49c: 96fc53b3     	bl	0xf368 <_ChromeMain+0xa0cc>
 40fa4a0: aa0003f7     	mov	x23, x0
 40fa4a4: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 40fa4a8: cb080328     	sub	x8, x25, x8
 40fa4ac: a901d7e0     	stp	x0, x21, [sp, #0x18]
 40fa4b0: f90017e8     	str	x8, [sp, #0x28]
 40fa4b4: 14000007     	b	0x40fa4d0 <_ChromeMain+0x40f5234>
 40fa4b8: a9400680     	ldp	x0, x1, [x20]
 40fa4bc: 17ffff8e     	b	0x40fa2f4 <_ChromeMain+0x40f5058>
 40fa4c0: a9438680     	ldp	x0, x1, [x20, #0x38]
 40fa4c4: 17ffffae     	b	0x40fa37c <_ChromeMain+0x40f50e0>
 40fa4c8: 3900bff5     	strb	w21, [sp, #0x2f]
 40fa4cc: 910063f7     	add	x23, sp, #0x18
 40fa4d0: 8b1502e8     	add	x8, x23, x21
 40fa4d4: eb17011f     	cmp	x8, x23
 40fa4d8: 54000943     	b.lo	0x40fa600 <_ChromeMain+0x40f5364>
 40fa4dc: eb1702df     	cmp	x22, x23
 40fa4e0: 54000063     	b.lo	0x40fa4ec <_ChromeMain+0x40f5250>
 40fa4e4: eb0802df     	cmp	x22, x8
 40fa4e8: 540008c3     	b.lo	0x40fa600 <_ChromeMain+0x40f5364>
 40fa4ec: aa1703e0     	mov	x0, x23
 40fa4f0: aa1603e1     	mov	x1, x22
 40fa4f4: aa1503e2     	mov	x2, x21
 40fa4f8: 94fc5375     	bl	0x800f2cc <_ChromeMain+0x800a030>
 40fa4fc: 38356aff     	strb	wzr, [x23, x21]
 40fa500: 3980bfe8     	ldrsb	x8, [sp, #0x2f]
 40fa504: 910063e9     	add	x9, sp, #0x18
 40fa508: a941afea     	ldp	x10, x11, [sp, #0x18]
 40fa50c: f100011f     	cmp	x8, #0x0
 40fa510: 9a894140     	csel	x0, x10, x9, mi
 40fa514: 7100011f     	cmp	w8, #0x0
 40fa518: 9a884161     	csel	x1, x11, x8, mi
 40fa51c: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 40fa520: f90003ff     	str	xzr, [sp]
 40fa524: 910003e2     	mov	x2, sp
 40fa528: 977a9ed4     	bl	0x1fa2078 <_ChromeMain+0x1f9cddc>
 40fa52c: 3dc003e0     	ldr	q0, [sp]
 40fa530: 3d800fe0     	str	q0, [sp, #0x30]
 40fa534: f9400be8     	ldr	x8, [sp, #0x10]
 40fa538: f90023e8     	str	x8, [sp, #0x40]
 40fa53c: a9007fff     	stp	xzr, xzr, [sp]
 40fa540: f9000bff     	str	xzr, [sp, #0x10]
 40fa544: 52800088     	mov	w8, #0x4                ; =4
 40fa548: 390123e8     	strb	w8, [sp, #0x48]
 40fa54c: b004cca1     	adrp	x1, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40fa550: 91053c21     	add	x1, x1, #0x14f
 40fa554: 9100c3e3     	add	x3, sp, #0x30
 40fa558: aa1303e0     	mov	x0, x19
 40fa55c: 52800282     	mov	w2, #0x14               ; =20
 40fa560: 97110258     	bl	0x53aec0 <_ChromeMain+0x535c24>
 40fa564: 394123e8     	ldrb	w8, [sp, #0x48]
 40fa568: f103fd1f     	cmp	x8, #0xff
 40fa56c: 540000a0     	b.eq	0x40fa580 <_ChromeMain+0x40f52e4>
 40fa570: f8687b08     	ldr	x8, [x24, x8, lsl #3]
 40fa574: d10107a0     	sub	x0, x29, #0x41
 40fa578: 9100c3e1     	add	x1, sp, #0x30
 40fa57c: d63f0100     	blr	x8
 40fa580: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40fa584: 36f800a8     	tbz	w8, #0x1f, 0x40fa598 <_ChromeMain+0x40f52fc>
 40fa588: f94003e0     	ldr	x0, [sp]
 40fa58c: f9400be8     	ldr	x8, [sp, #0x10]
 40fa590: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fa594: 96fc3a49     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fa598: 3948a288     	ldrb	w8, [x20, #0x228]
 40fa59c: 34000128     	cbz	w8, 0x40fa5c0 <_ChromeMain+0x40f5324>
 40fa5a0: 39889e84     	ldrsb	x4, [x20, #0x227]
 40fa5a4: b7f80284     	tbnz	x4, #0x3f, 0x40fa5f4 <_ChromeMain+0x40f5358>
 40fa5a8: 91084283     	add	x3, x20, #0x210
 40fa5ac: b004cca1     	adrp	x1, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40fa5b0: 91059021     	add	x1, x1, #0x164
 40fa5b4: aa1303e0     	mov	x0, x19
 40fa5b8: 52800242     	mov	w2, #0x12               ; =18
 40fa5bc: 97569803     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 40fa5c0: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 40fa5c4: 36f800a8     	tbz	w8, #0x1f, 0x40fa5d8 <_ChromeMain+0x40f533c>
 40fa5c8: f9400fe0     	ldr	x0, [sp, #0x18]
 40fa5cc: f94017e8     	ldr	x8, [sp, #0x28]
 40fa5d0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fa5d4: 96fc3a39     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fa5d8: a94f7bfd     	ldp	x29, x30, [sp, #0xf0]
 40fa5dc: a94e4ff4     	ldp	x20, x19, [sp, #0xe0]
 40fa5e0: a94d57f6     	ldp	x22, x21, [sp, #0xd0]
 40fa5e4: a94c5ff8     	ldp	x24, x23, [sp, #0xc0]
 40fa5e8: a94b67fa     	ldp	x26, x25, [sp, #0xb0]
 40fa5ec: 910403ff     	add	sp, sp, #0x100
 40fa5f0: d65f03c0     	ret
 40fa5f4: f9410a83     	ldr	x3, [x20, #0x210]
 40fa5f8: f9410e84     	ldr	x4, [x20, #0x218]
 40fa5fc: 17ffffec     	b	0x40fa5ac <_ChromeMain+0x40f5310>
 40fa600: d4200020     	brk	#0x1
 40fa604: 942c1762     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
