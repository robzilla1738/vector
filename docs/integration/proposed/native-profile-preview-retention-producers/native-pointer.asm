
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465020c: 39683008     	ldrb	w8, [x0, #0xa0c]
 4650210: 35000068     	cbnz	w8, 0x465021c <_ChromeMain+0x464af80>
 4650214: 52800000     	mov	w0, #0x0                ; =0
 4650218: d65f03c0     	ret
 465021c: d10143ff     	sub	sp, sp, #0x50
 4650220: a90257f6     	stp	x22, x21, [sp, #0x20]
 4650224: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4650228: a9047bfd     	stp	x29, x30, [sp, #0x40]
 465022c: 910103fd     	add	x29, sp, #0x40
 4650230: aa0003f3     	mov	x19, x0
 4650234: f940c008     	ldr	x8, [x0, #0x180]
 4650238: b40007e8     	cbz	x8, 0x4650334 <_ChromeMain+0x464b098>
 465023c: aa1303e0     	mov	x0, x19
 4650240: 97375ccd     	bl	0x1427574 <_ChromeMain+0x14222d8>
 4650244: a90107e0     	stp	x0, x1, [sp, #0x10]
 4650248: f9422e68     	ldr	x8, [x19, #0x458]
 465024c: f942d914     	ldr	x20, [x8, #0x5b0]
 4650250: b40003d4     	cbz	x20, 0x46502c8 <_ChromeMain+0x464b02c>
 4650254: aa0003f5     	mov	x21, x0
 4650258: f9400288     	ldr	x8, [x20]
 465025c: f9403508     	ldr	x8, [x8, #0x68]
 4650260: aa1403e0     	mov	x0, x20
 4650264: d63f0100     	blr	x8
 4650268: b4000300     	cbz	x0, 0x46502c8 <_ChromeMain+0x464b02c>
 465026c: d360feb5     	lsr	x21, x21, #32
 4650270: f9400be8     	ldr	x8, [sp, #0x10]
 4650274: f90003e8     	str	x8, [sp]
 4650278: b9401be8     	ldr	w8, [sp, #0x18]
 465027c: b9000be8     	str	w8, [sp, #0x8]
 4650280: aa1403e0     	mov	x0, x20
 4650284: 97375cbc     	bl	0x1427574 <_ChromeMain+0x14222d8>
 4650288: d360fc08     	lsr	x8, x0, #32
 465028c: cb4082a9     	sub	x9, x21, x0, lsr #32
 4650290: 0aa97d29     	bic	w9, w9, w9, asr #31
 4650294: 2b090109     	adds	w9, w8, w9
 4650298: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 465029c: 1a896149     	csel	w9, w10, w9, vs
 46502a0: 6b080129     	subs	w9, w9, w8
 46502a4: 131f7d2a     	asr	w10, w9, #31
 46502a8: 5201014a     	eor	w10, w10, #0x80000000
 46502ac: 1a896149     	csel	w9, w10, w9, vs
 46502b0: 0aa97d29     	bic	w9, w9, w9, asr #31
 46502b4: b90007e8     	str	w8, [sp, #0x4]
 46502b8: b9000fe9     	str	w9, [sp, #0xc]
 46502bc: 910043e0     	add	x0, sp, #0x10
 46502c0: 910003e1     	mov	x1, sp
 46502c4: 970d346f     	bl	0x99d480 <_ChromeMain+0x9981e4>
 46502c8: 90054608     	adrp	x8, 0xef10000 <dyld_stub_binder+0xef10000>
 46502cc: f942f500     	ldr	x0, [x8, #0x5e8]
 46502d0: f9400008     	ldr	x8, [x0]
 46502d4: f9400908     	ldr	x8, [x8, #0x10]
 46502d8: d63f0100     	blr	x8
 46502dc: f90003e0     	str	x0, [sp]
 46502e0: b94013e8     	ldr	w8, [sp, #0x10]
 46502e4: 6b00011f     	cmp	w8, w0
 46502e8: 540001ec     	b.gt	0x4650324 <_ChromeMain+0x464b088>
 46502ec: b9401be9     	ldr	w9, [sp, #0x18]
 46502f0: 0b080128     	add	w8, w9, w8
 46502f4: 6b00011f     	cmp	w8, w0
 46502f8: 5400016d     	b.le	0x4650324 <_ChromeMain+0x464b088>
 46502fc: d360fc08     	lsr	x8, x0, #32
 4650300: b94017e9     	ldr	w9, [sp, #0x14]
 4650304: 6b08013f     	cmp	w9, w8
 4650308: 540000ec     	b.gt	0x4650324 <_ChromeMain+0x464b088>
 465030c: b9401fea     	ldr	w10, [sp, #0x1c]
 4650310: 0b090149     	add	w9, w10, w9
 4650314: 6b08013f     	cmp	w9, w8
 4650318: 5400006d     	b.le	0x4650324 <_ChromeMain+0x464b088>
 465031c: 52800020     	mov	w0, #0x1                ; =1
 4650320: 14000006     	b	0x4650338 <_ChromeMain+0x464b09c>
 4650324: 910003e1     	mov	x1, sp
 4650328: aa1303e0     	mov	x0, x19
 465032c: 94000008     	bl	0x465034c <_ChromeMain+0x464b0b0>
 4650330: 14000002     	b	0x4650338 <_ChromeMain+0x464b09c>
 4650334: 52800000     	mov	w0, #0x0                ; =0
 4650338: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 465033c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4650340: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4650344: 910143ff     	add	sp, sp, #0x50
 4650348: d65f03c0     	ret
 465034c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4650350: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4650354: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4650358: 910083fd     	add	x29, sp, #0x20
 465035c: 397e4008     	ldrb	w8, [x0, #0xf90]
 4650360: 37000248     	tbnz	w8, #0x0, 0x46503a8 <_ChromeMain+0x464b10c>
 4650364: aa0003f6     	mov	x22, x0
 4650368: f9422c00     	ldr	x0, [x0, #0x458]
 465036c: b4000200     	cbz	x0, 0x46503ac <_ChromeMain+0x464b110>
 4650370: f940c2c8     	ldr	x8, [x22, #0x180]
 4650374: b40001a8     	cbz	x8, 0x46503a8 <_ChromeMain+0x464b10c>
 4650378: aa0103f3     	mov	x19, x1
 465037c: 978973a9     	bl	0x28ad220 <_ChromeMain+0x28a7f84>
 4650380: 34000160     	cbz	w0, 0x46503ac <_ChromeMain+0x464b110>
 4650384: f94426c8     	ldr	x8, [x22, #0x848]
 4650388: 39424108     	ldrb	w8, [x8, #0x90]
 465038c: 340000e8     	cbz	w8, 0x46503a8 <_ChromeMain+0x464b10c>
 4650390: f940c2c0     	ldr	x0, [x22, #0x180]
 4650394: b4000060     	cbz	x0, 0x46503a0 <_ChromeMain+0x464b104>
 4650398: 9708accc     	bl	0x87b6c8 <_ChromeMain+0x87642c>
 465039c: 34000080     	cbz	w0, 0x46503ac <_ChromeMain+0x464b110>
 46503a0: b94c86c8     	ldr	w8, [x22, #0xc84]
 46503a4: 340000c8     	cbz	w8, 0x46503bc <_ChromeMain+0x464b120>
 46503a8: 52800000     	mov	w0, #0x0                ; =0
 46503ac: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 46503b0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 46503b4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 46503b8: d65f03c0     	ret
 46503bc: f940c2c0     	ldr	x0, [x22, #0x180]
 46503c0: 97f68320     	bl	0x43f1040 <_ChromeMain+0x43ebda4>
 46503c4: b4ffff40     	cbz	x0, 0x46503ac <_ChromeMain+0x464b110>
 46503c8: 97f68336     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 46503cc: aa0003f4     	mov	x20, x0
 46503d0: aa0103f5     	mov	x21, x1
 46503d4: f9422ec8     	ldr	x8, [x22, #0x458]
 46503d8: f9432500     	ldr	x0, [x8, #0x648]
 46503dc: b4000060     	cbz	x0, 0x46503e8 <_ChromeMain+0x464b14c>
 46503e0: 39472008     	ldrb	w8, [x0, #0x1c8]
 46503e4: 350003e8     	cbnz	w8, 0x4650460 <_ChromeMain+0x464b1c4>
 46503e8: 52800000     	mov	w0, #0x0                ; =0
 46503ec: b9400268     	ldr	w8, [x19]
 46503f0: 6b14011f     	cmp	w8, w20
 46503f4: 54fffdcb     	b.lt	0x46503ac <_ChromeMain+0x464b110>
 46503f8: 0b150296     	add	w22, w20, w21
 46503fc: 6b16011f     	cmp	w8, w22
 4650400: 54fffd6a     	b.ge	0x46503ac <_ChromeMain+0x464b110>
 4650404: b9400669     	ldr	w9, [x19, #0x4]
 4650408: d360fe8a     	lsr	x10, x20, #32
 465040c: 6b0a013f     	cmp	w9, w10
 4650410: 54fffccb     	b.lt	0x46503a8 <_ChromeMain+0x464b10c>
 4650414: 8b55814a     	add	x10, x10, x21, lsr #32
 4650418: 6b0a013f     	cmp	w9, w10
 465041c: 54fffc6a     	b.ge	0x46503a8 <_ChromeMain+0x464b10c>
 4650420: d00545f5     	adrp	x21, 0xef0e000 <dyld_stub_binder+0xef0e000>
 4650424: b947aaa0     	ldr	w0, [x21, #0x7a8]
 4650428: 34000420     	cbz	w0, 0x46504ac <_ChromeMain+0x464b210>
 465042c: 7100041f     	cmp	w0, #0x1
 4650430: 540000e0     	b.eq	0x465044c <_ChromeMain+0x464b1b0>
 4650434: 6b14011f     	cmp	w8, w20
 4650438: 54fffb8b     	b.lt	0x46503a8 <_ChromeMain+0x464b10c>
 465043c: 11002289     	add	w9, w20, #0x8
 4650440: 6b09011f     	cmp	w8, w9
 4650444: 1a9fa7e0     	cset	w0, lt
 4650448: 17ffffd9     	b	0x46503ac <_ChromeMain+0x464b110>
 465044c: 510022c9     	sub	w9, w22, #0x8
 4650450: 6b16011f     	cmp	w8, w22
 4650454: 7a49b108     	ccmp	w8, w9, #0x8, lt
 4650458: 1a9fb7e0     	cset	w0, ge
 465045c: 17ffffd4     	b	0x46503ac <_ChromeMain+0x464b110>
 4650460: 97375c45     	bl	0x1427574 <_ChromeMain+0x14222d8>
 4650464: 7100003f     	cmp	w1, #0x0
 4650468: d360fc28     	lsr	x8, x1, #32
 465046c: fa401904     	ccmp	x8, #0x0, #0x4, ne
 4650470: 54fffbc0     	b.eq	0x46503e8 <_ChromeMain+0x464b14c>
 4650474: d360fc09     	lsr	x9, x0, #32
 4650478: b3407e80     	bfxil	x0, x20, #0, #32
 465047c: 2b080128     	adds	w8, w9, w8
 4650480: 131f7d0a     	asr	w10, w8, #31
 4650484: 5201014a     	eor	w10, w10, #0x80000000
 4650488: 1a886148     	csel	w8, w10, w8, vs
 465048c: 6b090108     	subs	w8, w8, w9
 4650490: 131f7d09     	asr	w9, w8, #31
 4650494: 52010129     	eor	w9, w9, #0x80000000
 4650498: 1a886128     	csel	w8, w9, w8, vs
 465049c: 0aa87d08     	bic	w8, w8, w8, asr #31
 46504a0: b3607d15     	bfi	x21, x8, #32, #32
 46504a4: aa0003f4     	mov	x20, x0
 46504a8: 17ffffd0     	b	0x46503e8 <_ChromeMain+0x464b14c>
 46504ac: 974462ae     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 46504b0: aa0003e8     	mov	x8, x0
 46504b4: 39402009     	ldrb	w9, [x0, #0x8]
 46504b8: 7100053f     	cmp	w9, #0x1
 46504bc: 540000c1     	b.ne	0x46504d4 <_ChromeMain+0x464b238>
 46504c0: 91005d00     	add	x0, x8, #0x17
 46504c4: 96eb2b0f     	bl	0x11b100 <_ChromeMain+0x115e64>
 46504c8: b907aaa0     	str	w0, [x21, #0x7a8]
 46504cc: b9400268     	ldr	w8, [x19]
 46504d0: 17ffffd7     	b	0x465042c <_ChromeMain+0x464b190>
 46504d4: b0048ca0     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 46504d8: 91299000     	add	x0, x0, #0xa64
 46504dc: 7100093f     	cmp	w9, #0x2
 46504e0: 540000c1     	b.ne	0x46504f8 <_ChromeMain+0x464b25c>
 46504e4: f9401108     	ldr	x8, [x8, #0x20]
 46504e8: f9400508     	ldr	x8, [x8, #0x8]
 46504ec: f100011f     	cmp	x8, #0x0
 46504f0: 9a880000     	csel	x0, x0, x8, eq
 46504f4: 17fffff4     	b	0x46504c4 <_ChromeMain+0x464b228>
 46504f8: 34fffe69     	cbz	w9, 0x46504c4 <_ChromeMain+0x464b228>
 46504fc: 94e81652     	bl	0x8055e44 <_ChromeMain+0x8050ba8>
