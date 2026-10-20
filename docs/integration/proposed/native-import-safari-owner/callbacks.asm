
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4278400: f900083f     	str	xzr, [x1, #0x10]
 4278404: 3c8103e0     	stur	q0, [sp, #0x10]
 4278408: 910023e1     	add	x1, sp, #0x8
 427840c: d63f0100     	blr	x8
 4278410: f94007e1     	ldr	x1, [sp, #0x8]
 4278414: b5000081     	cbnz	x1, 0x4278424 <_ChromeMain+0x4273188>
 4278418: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 427841c: 9100c3ff     	add	sp, sp, #0x30
 4278420: d65f03c0     	ret
 4278424: 910023e0     	add	x0, sp, #0x8
 4278428: 9722bab2     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 427842c: f94007e0     	ldr	x0, [sp, #0x8]
 4278430: f9400fe8     	ldr	x8, [sp, #0x18]
 4278434: d37be901     	lsl	x1, x8, #5
 4278438: 96f642a0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427843c: 17fffff7     	b	0x4278418 <_ChromeMain+0x427317c>
 4278440: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4278444: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4278448: 910043fd     	add	x29, sp, #0x10
 427844c: aa0003f3     	mov	x19, x0
 4278450: 94000581     	bl	0x4279a54 <_ChromeMain+0x42747b8>
 4278454: f900967f     	str	xzr, [x19, #0x128]
 4278458: f9409268     	ldr	x8, [x19, #0x120]
 427845c: b4000168     	cbz	x8, 0x4278488 <_ChromeMain+0x42731ec>
 4278460: 52800029     	mov	w9, #0x1                ; =1
 4278464: 19004109     	stlurb	w9, [x8, #0x4]
 4278468: f9409260     	ldr	x0, [x19, #0x120]
 427846c: b40000e0     	cbz	x0, 0x4278488 <_ChromeMain+0x42731ec>
 4278470: 12800008     	mov	w8, #-0x1               ; =-1
 4278474: b8e80008     	ldaddal	w8, w8, [x0]
 4278478: 7100051f     	cmp	w8, #0x1
 427847c: 54000061     	b.ne	0x4278488 <_ChromeMain+0x42731ec>
 4278480: 52800101     	mov	w1, #0x8                ; =8
 4278484: 96f6428d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278488: f9407e60     	ldr	x0, [x19, #0xf8]
 427848c: b5000380     	cbnz	x0, 0x42784fc <_ChromeMain+0x4273260>
 4278490: f9407a60     	ldr	x0, [x19, #0xf0]
 4278494: f9007a7f     	str	xzr, [x19, #0xf0]
 4278498: b5000500     	cbnz	x0, 0x4278538 <_ChromeMain+0x427329c>
 427849c: f9407660     	ldr	x0, [x19, #0xe8]
 42784a0: f900767f     	str	xzr, [x19, #0xe8]
 42784a4: b4000080     	cbz	x0, 0x42784b4 <_ChromeMain+0x4273218>
 42784a8: 97b7af60     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 42784ac: 52802f01     	mov	w1, #0x178              ; =376
 42784b0: 96f64282     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42784b4: 39c39e68     	ldrsb	w8, [x19, #0xe7]
 42784b8: 37f80188     	tbnz	w8, #0x1f, 0x42784e8 <_ChromeMain+0x427324c>
 42784bc: f9405a60     	ldr	x0, [x19, #0xb0]
 42784c0: b40000c0     	cbz	x0, 0x42784d8 <_ChromeMain+0x427323c>
 42784c4: f9405e68     	ldr	x8, [x19, #0xb8]
 42784c8: cb0003e9     	neg	x9, x0
 42784cc: eb09011f     	cmp	x8, x9
 42784d0: 540003c9     	b.ls	0x4278548 <_ChromeMain+0x42732ac>
 42784d4: d4200020     	brk	#0x1
 42784d8: aa1303e0     	mov	x0, x19
 42784dc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 42784e0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 42784e4: 14000599     	b	0x4279b48 <_ChromeMain+0x42748ac>
 42784e8: f9406a60     	ldr	x0, [x19, #0xd0]
 42784ec: f9407268     	ldr	x8, [x19, #0xe0]
 42784f0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42784f4: 96f64271     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42784f8: 17fffff1     	b	0x42784bc <_ChromeMain+0x4273220>
 42784fc: f9408268     	ldr	x8, [x19, #0x100]
 4278500: d37ef509     	lsl	x9, x8, #2
 4278504: b4000109     	cbz	x9, 0x4278524 <_ChromeMain+0x4273288>
 4278508: cb080be8     	neg	x8, x8, lsl #2
 427850c: 8b000129     	add	x9, x9, x0
 4278510: d1001129     	sub	x9, x9, #0x4
 4278514: b4fffe09     	cbz	x9, 0x42784d4 <_ChromeMain+0x4273238>
 4278518: d1001129     	sub	x9, x9, #0x4
 427851c: 91001108     	add	x8, x8, #0x4
 4278520: b5ffffa8     	cbnz	x8, 0x4278514 <_ChromeMain+0x4273278>
 4278524: f900827f     	str	xzr, [x19, #0x100]
 4278528: f9408668     	ldr	x8, [x19, #0x108]
 427852c: d37ef501     	lsl	x1, x8, #2
 4278530: 96f64262     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278534: 17ffffd7     	b	0x4278490 <_ChromeMain+0x42731f4>
 4278538: 94d35561     	bl	0x774dabc <_ChromeMain+0x7748820>
 427853c: 52805801     	mov	w1, #0x2c0              ; =704
 4278540: 96f6425e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278544: 17ffffd6     	b	0x427849c <_ChromeMain+0x4273200>
 4278548: f9005e7f     	str	xzr, [x19, #0xb8]
 427854c: f9406261     	ldr	x1, [x19, #0xc0]
 4278550: 96f6425a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278554: 17ffffe1     	b	0x42784d8 <_ChromeMain+0x427323c>
 4278558: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 427855c: 910003fd     	mov	x29, sp
 4278560: 97ffffb8     	bl	0x4278440 <_ChromeMain+0x42731a4>
 4278564: 52802601     	mov	w1, #0x130              ; =304
 4278568: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 427856c: 16f64253     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4278570: d10183ff     	sub	sp, sp, #0x60
 4278574: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4278578: a90357f6     	stp	x22, x21, [sp, #0x30]
 427857c: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4278580: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4278584: 910143fd     	add	x29, sp, #0x50
 4278588: aa0003f4     	mov	x20, x0
 427858c: 39c1bc08     	ldrsb	w8, [x0, #0x6f]
 4278590: 37f80ee8     	tbnz	w8, #0x1f, 0x427876c <_ChromeMain+0x42734d0>
 4278594: 91016288     	add	x8, x20, #0x58
 4278598: 528000e9     	mov	w9, #0x7                ; =7
 427859c: 3901be89     	strb	w9, [x20, #0x6f]
 42785a0: 528d2dc9     	mov	w9, #0x696e             ; =26990
 42785a4: 72acedc9     	movk	w9, #0x676e, lsl #16
 42785a8: b8003109     	stur	w9, [x8, #0x3]
 42785ac: 528eae49     	mov	w9, #0x7572             ; =30066
 42785b0: 72adcdc9     	movk	w9, #0x6e6e, lsl #16
 42785b4: b9000109     	str	w9, [x8]
 42785b8: 39001d1f     	strb	wzr, [x8, #0x7]
 42785bc: d2828f68     	mov	x8, #0x147b             ; =5243
 42785c0: f2a8f5c8     	movk	x8, #0x47ae, lsl #16
 42785c4: f2cf5c28     	movk	x8, #0x7ae1, lsl #32
 42785c8: f2e7f288     	movk	x8, #0x3f94, lsl #48
 42785cc: f9003a88     	str	x8, [x20, #0x70]
 42785d0: aa1403e0     	mov	x0, x20
 42785d4: 940004bc     	bl	0x42798c4 <_ChromeMain+0x4274628>
 42785d8: d004ac20     	adrp	x0, 0xd7fe000 <dyld_stub_binder+0xd7fe000>
 42785dc: 91242400     	add	x0, x0, #0x909
 42785e0: f004c541     	adrp	x1, 0xdb23000 <dyld_stub_binder+0xdb23000>
 42785e4: 910e6821     	add	x1, x1, #0x39a
 42785e8: 910003e8     	mov	x8, sp
 42785ec: 52804f62     	mov	w2, #0x27b              ; =635
 42785f0: 96f761a4     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42785f4: 52800800     	mov	w0, #0x40               ; =64
 42785f8: 96f65b5c     	bl	0xf368 <_ChromeMain+0xa0cc>
 42785fc: aa0003f3     	mov	x19, x0
 4278600: 52800038     	mov	w24, #0x1               ; =1
 4278604: b9000018     	str	w24, [x0]
 4278608: 10011128     	adr	x8, 0x427a82c <_ChromeMain+0x4275590>
 427860c: d503201f     	nop
 4278610: 10011409     	adr	x9, 0x427a890 <_ChromeMain+0x42755f4>
 4278614: d503201f     	nop
 4278618: a900a408     	stp	x8, x9, [x0, #0x8]
 427861c: b0ff1737     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 4278620: 912c02f7     	add	x23, x23, #0xb00
 4278624: 1000b768     	adr	x8, 0x4279d10 <_ChromeMain+0x4274a74>
 4278628: d503201f     	nop
 427862c: a901a017     	stp	x23, x8, [x0, #0x18]
 4278630: f9405a88     	ldr	x8, [x20, #0xb0]
 4278634: f9001408     	str	x8, [x0, #0x28]
 4278638: 3ccb8280     	ldur	q0, [x20, #0xb8]
 427863c: a90b7e9f     	stp	xzr, xzr, [x20, #0xb0]
 4278640: f900629f     	str	xzr, [x20, #0xc0]
 4278644: 3d800c00     	str	q0, [x0, #0x30]
 4278648: f9409295     	ldr	x21, [x20, #0x120]
 427864c: b40000b5     	cbz	x21, 0x4278660 <_ChromeMain+0x42733c4>
 4278650: b83802a8     	ldadd	w24, w8, [x21]
 4278654: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4278658: 6b09011f     	cmp	w8, w9
 427865c: 54000900     	b.eq	0x427877c <_ChromeMain+0x42734e0>
 4278660: f9409696     	ldr	x22, [x20, #0x128]
 4278664: 52800800     	mov	w0, #0x40               ; =64
 4278668: 96f65b40     	bl	0xf368 <_ChromeMain+0xa0cc>
 427866c: aa0003f4     	mov	x20, x0
 4278670: 10011408     	adr	x8, 0x427a8f0 <_ChromeMain+0x4275654>
 4278674: d503201f     	nop
 4278678: d0ffe929     	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 427867c: 91110129     	add	x9, x9, #0x440
 4278680: b9000018     	str	w24, [x0]
 4278684: d0ffef8a     	adrp	x10, 0x406a000 <_ChromeMain+0x4064d64>
 4278688: 910a014a     	add	x10, x10, #0x280
 427868c: 1000c20b     	adr	x11, 0x4279ecc <_ChromeMain+0x4274c30>
 4278690: d503201f     	nop
 4278694: a900a408     	stp	x8, x9, [x0, #0x8]
 4278698: a901ac0a     	stp	x10, x11, [x0, #0x18]
 427869c: a902d41f     	stp	xzr, x21, [x0, #0x28]
 42786a0: f9001c16     	str	x22, [x0, #0x38]
 42786a4: 52800100     	mov	w0, #0x8                ; =8
 42786a8: 96f65b30     	bl	0xf368 <_ChromeMain+0xa0cc>
 42786ac: aa0003f5     	mov	x21, x0
 42786b0: f900001f     	str	xzr, [x0]
 42786b4: 52800700     	mov	w0, #0x38               ; =56
 42786b8: 96f65b2c     	bl	0xf368 <_ChromeMain+0xa0cc>
 42786bc: aa0003f6     	mov	x22, x0
 42786c0: f0ff44a8     	adrp	x8, 0x2b0f000 <_ChromeMain+0x2b09d64>
 42786c4: 91290108     	add	x8, x8, #0xa40
 42786c8: f0ffea09     	adrp	x9, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 42786cc: 91210129     	add	x9, x9, #0x840
 42786d0: b9000018     	str	w24, [x0]
 42786d4: a900a408     	stp	x8, x9, [x0, #0x8]
 42786d8: 1000f508     	adr	x8, 0x427a578 <_ChromeMain+0x42752dc>
 42786dc: d503201f     	nop
 42786e0: a901a017     	stp	x23, x8, [x0, #0x18]
 42786e4: f9001413     	str	x19, [x0, #0x28]
 42786e8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 42786ec: d00549c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 42786f0: f9404529     	ldr	x9, [x9, #0x88]
 42786f4: eb09011f     	cmp	x8, x9
 42786f8: 54000061     	b.ne	0x4278704 <_ChromeMain+0x4273468>
 42786fc: aa1503e0     	mov	x0, x21
 4278700: 96f66eff     	bl	0x142fc <_ChromeMain+0xf060>
 4278704: f9001ad5     	str	x21, [x22, #0x30]
 4278708: 52800700     	mov	w0, #0x38               ; =56
 427870c: 96f65b17     	bl	0xf368 <_ChromeMain+0xa0cc>
 4278710: aa0003e3     	mov	x3, x0
 4278714: 52800028     	mov	w8, #0x1                ; =1
 4278718: b9000008     	str	w8, [x0]
 427871c: f0ff5848     	adrp	x8, 0x2d83000 <_ChromeMain+0x2d7dd64>
 4278720: 91000108     	add	x8, x8, #0x0
 4278724: 10010249     	adr	x9, 0x427a76c <_ChromeMain+0x42754d0>
 4278728: d503201f     	nop
 427872c: a900a408     	stp	x8, x9, [x0, #0x8]
 4278730: 1000fb68     	adr	x8, 0x427a69c <_ChromeMain+0x4275400>
 4278734: d503201f     	nop
 4278738: a901a017     	stp	x23, x8, [x0, #0x18]
 427873c: a902d414     	stp	x20, x21, [x0, #0x28]
 4278740: d0046481     	adrp	x1, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4278744: 9110a821     	add	x1, x1, #0x42a
 4278748: 910003e0     	mov	x0, sp
 427874c: aa1603e2     	mov	x2, x22
 4278750: 9784c98d     	bl	0x23aad84 <_ChromeMain+0x23a5ae8>
 4278754: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4278758: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 427875c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4278760: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4278764: 910183ff     	add	sp, sp, #0x60
 4278768: d65f03c0     	ret
 427876c: 528000e8     	mov	w8, #0x7                ; =7
 4278770: f9003288     	str	x8, [x20, #0x60]
 4278774: f9402e88     	ldr	x8, [x20, #0x58]
 4278778: 17ffff8a     	b	0x42785a0 <_ChromeMain+0x4273304>
 427877c: d4200000     	brk	#0
 4278780: d4400000     	hlt	#0
 4278784: d4200020     	brk	#0x1
 4278788: d10103ff     	sub	sp, sp, #0x40
 427878c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4278790: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4278794: 9100c3fd     	add	x29, sp, #0x30
 4278798: aa0003f3     	mov	x19, x0
 427879c: f9407800     	ldr	x0, [x0, #0xf0]
 42787a0: b4000040     	cbz	x0, 0x42787a8 <_ChromeMain+0x427350c>
 42787a4: 97f9e1f6     	bl	0x40f0f7c <_ChromeMain+0x40ebce0>
 42787a8: 52800128     	mov	w8, #0x9                ; =9
 42787ac: 39007fe8     	strb	w8, [sp, #0x1f]
 42787b0: 910023e9     	add	x9, sp, #0x8
 42787b4: 9100252a     	add	x10, x9, #0x9
 42787b8: d0046488     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 42787bc: 91104108     	add	x8, x8, #0x410
 42787c0: eb08015f     	cmp	x10, x8
 42787c4: fa488122     	ccmp	x9, x8, #0x2, hi
 42787c8: 54000a09     	b.ls	0x4278908 <_ChromeMain+0x427366c>
 42787cc: 52800c89     	mov	w9, #0x64               ; =100
 42787d0: 790023e9     	strh	w9, [sp, #0x10]
 42787d4: f9400108     	ldr	x8, [x8]
 42787d8: f90007e8     	str	x8, [sp, #0x8]
 42787dc: 91016274     	add	x20, x19, #0x58
 42787e0: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 42787e4: 37f80948     	tbnz	w8, #0x1f, 0x427890c <_ChromeMain+0x4273670>
 42787e8: 3cc083e0     	ldur	q0, [sp, #0x8]
 42787ec: 3d800280     	str	q0, [x20]
 42787f0: f9400fe8     	ldr	x8, [sp, #0x18]
 42787f4: f9000a88     	str	x8, [x20, #0x10]
 42787f8: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 42787fc: 37f80928     	tbnz	w8, #0x1f, 0x4278920 <_ChromeMain+0x4273684>
 4278800: a9097e7f     	stp	xzr, xzr, [x19, #0x90]
 4278804: f80a027f     	stur	xzr, [x19, #0xa0]
 4278808: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 427880c: 37f806a8     	tbnz	w8, #0x1f, 0x42788e0 <_ChromeMain+0x4273644>
 4278810: 3901e27f     	strb	wzr, [x19, #0x78]
 4278814: 39023e7f     	strb	wzr, [x19, #0x8f]
 4278818: 3941be69     	ldrb	w9, [x19, #0x6f]
 427881c: 13001d28     	sxtb	w8, w9
 4278820: f940326a     	ldr	x10, [x19, #0x60]
 4278824: 7100011f     	cmp	w8, #0x0
 4278828: 9a894149     	csel	x9, x10, x9, mi
 427882c: f100253f     	cmp	x9, #0x9
 4278830: 540001a1     	b.ne	0x4278864 <_ChromeMain+0x42735c8>
 4278834: f9400289     	ldr	x9, [x20]
 4278838: 7100011f     	cmp	w8, #0x0
 427883c: 9a944128     	csel	x8, x9, x20, mi
 4278840: f9400109     	ldr	x9, [x8]
 4278844: 39402108     	ldrb	w8, [x8, #0x8]
 4278848: 7101911f     	cmp	w8, #0x64
 427884c: d28eae68     	mov	x8, #0x7573             ; =30067
 4278850: f2ac6c68     	movk	x8, #0x6363, lsl #16
 4278854: f2ccaca8     	movk	x8, #0x6565, lsl #32
 4278858: f2ecac88     	movk	x8, #0x6564, lsl #48
 427885c: fa480120     	ccmp	x9, x8, #0x0, eq
 4278860: 54000480     	b.eq	0x42788f0 <_ChromeMain+0x4273654>
 4278864: fd403a60     	ldr	d0, [x19, #0x70]
 4278868: fd003a60     	str	d0, [x19, #0x70]
 427886c: aa1303e0     	mov	x0, x19
 4278870: 94000415     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4278874: f9407a60     	ldr	x0, [x19, #0xf0]
 4278878: f9007a7f     	str	xzr, [x19, #0xf0]
 427887c: b50003e0     	cbnz	x0, 0x42788f8 <_ChromeMain+0x427365c>
 4278880: f9407660     	ldr	x0, [x19, #0xe8]
 4278884: f900767f     	str	xzr, [x19, #0xe8]
 4278888: b4000080     	cbz	x0, 0x4278898 <_ChromeMain+0x42735fc>
 427888c: 97b7ae67     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 4278890: 52802f01     	mov	w1, #0x178              ; =376
 4278894: 96f64189     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278898: f9408268     	ldr	x8, [x19, #0x100]
 427889c: d37ef509     	lsl	x9, x8, #2
 42788a0: b4000129     	cbz	x9, 0x42788c4 <_ChromeMain+0x4273628>
 42788a4: f9407e6a     	ldr	x10, [x19, #0xf8]
 42788a8: cb080be8     	neg	x8, x8, lsl #2
 42788ac: 8b0a0129     	add	x9, x9, x10
 42788b0: d1001129     	sub	x9, x9, #0x4
 42788b4: b40002a9     	cbz	x9, 0x4278908 <_ChromeMain+0x427366c>
 42788b8: d1001129     	sub	x9, x9, #0x4
 42788bc: 91001108     	add	x8, x8, #0x4
 42788c0: b5ffffa8     	cbnz	x8, 0x42788b4 <_ChromeMain+0x4273618>
 42788c4: f900827f     	str	xzr, [x19, #0x100]
 42788c8: aa1303e0     	mov	x0, x19
 42788cc: 94000462     	bl	0x4279a54 <_ChromeMain+0x42747b8>
 42788d0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 42788d4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 42788d8: 910103ff     	add	sp, sp, #0x40
 42788dc: d65f03c0     	ret
 42788e0: f9403e68     	ldr	x8, [x19, #0x78]
 42788e4: 3900011f     	strb	wzr, [x8]
 42788e8: f900427f     	str	xzr, [x19, #0x80]
 42788ec: 17ffffcb     	b	0x4278818 <_ChromeMain+0x427357c>
 42788f0: 1e6e1000     	fmov	d0, #1.00000000
 42788f4: 17ffffdd     	b	0x4278868 <_ChromeMain+0x42735cc>
 42788f8: 94d35471     	bl	0x774dabc <_ChromeMain+0x7748820>
 42788fc: 52805801     	mov	w1, #0x2c0              ; =704
 4278900: 96f6416e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278904: 17ffffdf     	b	0x4278880 <_ChromeMain+0x42735e4>
 4278908: d4200020     	brk	#0x1
 427890c: f9402e60     	ldr	x0, [x19, #0x58]
 4278910: f9403668     	ldr	x8, [x19, #0x68]
 4278914: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4278918: 96f64168     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427891c: 17ffffb3     	b	0x42787e8 <_ChromeMain+0x427354c>
 4278920: f9404a60     	ldr	x0, [x19, #0x90]
 4278924: f9405268     	ldr	x8, [x19, #0xa0]
 4278928: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427892c: 96f64163     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278930: 17ffffb4     	b	0x4278800 <_ChromeMain+0x4273564>
 4278934: d10143ff     	sub	sp, sp, #0x50
 4278938: a9034ff4     	stp	x20, x19, [sp, #0x30]
 427893c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4278940: 910103fd     	add	x29, sp, #0x40
 4278944: aa0003f3     	mov	x19, x0
 4278948: f9407800     	ldr	x0, [x0, #0xf0]
 427894c: f9007a7f     	str	xzr, [x19, #0xf0]
 4278950: b5000ca0     	cbnz	x0, 0x4278ae4 <_ChromeMain+0x4273848>
 4278954: f9407660     	ldr	x0, [x19, #0xe8]
 4278958: f900767f     	str	xzr, [x19, #0xe8]
 427895c: b4000080     	cbz	x0, 0x427896c <_ChromeMain+0x42736d0>
 4278960: 97b7ae32     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 4278964: 52802f01     	mov	w1, #0x178              ; =376
 4278968: 96f64154     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427896c: f9408268     	ldr	x8, [x19, #0x100]
 4278970: d37ef509     	lsl	x9, x8, #2
 4278974: b4000129     	cbz	x9, 0x4278998 <_ChromeMain+0x42736fc>
 4278978: f9407e6a     	ldr	x10, [x19, #0xf8]
 427897c: cb080be8     	neg	x8, x8, lsl #2
 4278980: 8b0a0129     	add	x9, x9, x10
 4278984: d1001129     	sub	x9, x9, #0x4
 4278988: b4000b69     	cbz	x9, 0x4278af4 <_ChromeMain+0x4273858>
 427898c: d1001129     	sub	x9, x9, #0x4
 4278990: 91001108     	add	x8, x8, #0x4
 4278994: b5ffffa8     	cbnz	x8, 0x4278988 <_ChromeMain+0x42736ec>
 4278998: f900827f     	str	xzr, [x19, #0x100]
 427899c: aa1303e0     	mov	x0, x19
 42789a0: 9400042d     	bl	0x4279a54 <_ChromeMain+0x42747b8>
 42789a4: 528000c8     	mov	w8, #0x6                ; =6
 42789a8: 3900bfe8     	strb	w8, [sp, #0x2f]
 42789ac: 910063e8     	add	x8, sp, #0x18
 42789b0: b27f0509     	orr	x9, x8, #0x6
 42789b4: d004648a     	adrp	x10, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 42789b8: 9110c14a     	add	x10, x10, #0x430
 42789bc: eb0a013f     	cmp	x9, x10
 42789c0: fa4a8102     	ccmp	x8, x10, #0x2, hi
 42789c4: 54000989     	b.ls	0x4278af4 <_ChromeMain+0x4273858>
 42789c8: 528c8ca8     	mov	w8, #0x6465             ; =25701
 42789cc: 79003be8     	strh	w8, [sp, #0x1c]
 42789d0: 528c2cc8     	mov	w8, #0x6166             ; =24934
 42789d4: 72ad8d28     	movk	w8, #0x6c69, lsl #16
 42789d8: b9001be8     	str	w8, [sp, #0x18]
 42789dc: 39007bff     	strb	wzr, [sp, #0x1e]
 42789e0: 52800288     	mov	w8, #0x14               ; =20
 42789e4: 39005fe8     	strb	w8, [sp, #0x17]
 42789e8: 910003e9     	mov	x9, sp
 42789ec: 9100512a     	add	x10, x9, #0x14
 42789f0: f004c548     	adrp	x8, 0xdb23000 <dyld_stub_binder+0xdb23000>
 42789f4: 9111f108     	add	x8, x8, #0x47c
 42789f8: eb08015f     	cmp	x10, x8
 42789fc: fa488122     	ccmp	x9, x8, #0x2, hi
 4278a00: 540007a9     	b.ls	0x4278af4 <_ChromeMain+0x4273858>
 4278a04: 528d8d29     	mov	w9, #0x6c69             ; =27753
 4278a08: 72ac8ca9     	movk	w9, #0x6465, lsl #16
 4278a0c: b90013e9     	str	w9, [sp, #0x10]
 4278a10: 3dc00100     	ldr	q0, [x8]
 4278a14: 3d8003e0     	str	q0, [sp]
 4278a18: 390053ff     	strb	wzr, [sp, #0x14]
 4278a1c: 91016274     	add	x20, x19, #0x58
 4278a20: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 4278a24: 37f806a8     	tbnz	w8, #0x1f, 0x4278af8 <_ChromeMain+0x427385c>
 4278a28: 3cc183e0     	ldur	q0, [sp, #0x18]
 4278a2c: 3d800280     	str	q0, [x20]
 4278a30: f94017e8     	ldr	x8, [sp, #0x28]
 4278a34: f9000a88     	str	x8, [x20, #0x10]
 4278a38: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 4278a3c: 37f80688     	tbnz	w8, #0x1f, 0x4278b0c <_ChromeMain+0x4273870>
 4278a40: 3dc003e0     	ldr	q0, [sp]
 4278a44: 3c890260     	stur	q0, [x19, #0x90]
 4278a48: f9400be8     	ldr	x8, [sp, #0x10]
 4278a4c: f80a0268     	stur	x8, [x19, #0xa0]
 4278a50: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 4278a54: 37f803c8     	tbnz	w8, #0x1f, 0x4278acc <_ChromeMain+0x4273830>
 4278a58: 3901e27f     	strb	wzr, [x19, #0x78]
 4278a5c: 39023e7f     	strb	wzr, [x19, #0x8f]
 4278a60: 3941be69     	ldrb	w9, [x19, #0x6f]
 4278a64: 13001d28     	sxtb	w8, w9
 4278a68: f940326a     	ldr	x10, [x19, #0x60]
 4278a6c: 7100011f     	cmp	w8, #0x0
 4278a70: 9a894149     	csel	x9, x10, x9, mi
 4278a74: f100253f     	cmp	x9, #0x9
 4278a78: 540001a1     	b.ne	0x4278aac <_ChromeMain+0x4273810>
 4278a7c: f9400289     	ldr	x9, [x20]
 4278a80: 7100011f     	cmp	w8, #0x0
 4278a84: 9a944128     	csel	x8, x9, x20, mi
 4278a88: f9400109     	ldr	x9, [x8]
 4278a8c: 39402108     	ldrb	w8, [x8, #0x8]
 4278a90: 7101911f     	cmp	w8, #0x64
 4278a94: d28eae68     	mov	x8, #0x7573             ; =30067
 4278a98: f2ac6c68     	movk	x8, #0x6363, lsl #16
 4278a9c: f2ccaca8     	movk	x8, #0x6565, lsl #32
 4278aa0: f2ecac88     	movk	x8, #0x6564, lsl #48
 4278aa4: fa480120     	ccmp	x9, x8, #0x0, eq
 4278aa8: 540001a0     	b.eq	0x4278adc <_ChromeMain+0x4273840>
 4278aac: fd403a60     	ldr	d0, [x19, #0x70]
 4278ab0: fd003a60     	str	d0, [x19, #0x70]
 4278ab4: aa1303e0     	mov	x0, x19
 4278ab8: 94000383     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4278abc: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4278ac0: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4278ac4: 910143ff     	add	sp, sp, #0x50
 4278ac8: d65f03c0     	ret
 4278acc: f9403e68     	ldr	x8, [x19, #0x78]
 4278ad0: 3900011f     	strb	wzr, [x8]
 4278ad4: f900427f     	str	xzr, [x19, #0x80]
 4278ad8: 17ffffe2     	b	0x4278a60 <_ChromeMain+0x42737c4>
 4278adc: 1e6e1000     	fmov	d0, #1.00000000
 4278ae0: 17fffff4     	b	0x4278ab0 <_ChromeMain+0x4273814>
 4278ae4: 94d353f6     	bl	0x774dabc <_ChromeMain+0x7748820>
 4278ae8: 52805801     	mov	w1, #0x2c0              ; =704
 4278aec: 96f640f3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278af0: 17ffff99     	b	0x4278954 <_ChromeMain+0x42736b8>
 4278af4: d4200020     	brk	#0x1
 4278af8: f9402e60     	ldr	x0, [x19, #0x58]
 4278afc: f9403668     	ldr	x8, [x19, #0x68]
 4278b00: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4278b04: 96f640ed     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278b08: 17ffffc8     	b	0x4278a28 <_ChromeMain+0x427378c>
 4278b0c: f9404a60     	ldr	x0, [x19, #0x90]
 4278b10: f9405268     	ldr	x8, [x19, #0xa0]
 4278b14: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4278b18: 96f640e8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278b1c: 17ffffc9     	b	0x4278a40 <_ChromeMain+0x42737a4>
 4278b20: d10103ff     	sub	sp, sp, #0x40
 4278b24: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4278b28: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4278b2c: 9100c3fd     	add	x29, sp, #0x30
 4278b30: 52800028     	mov	w8, #0x1                ; =1
 4278b34: 39044008     	strb	w8, [x0, #0x110]
 4278b38: 52800128     	mov	w8, #0x9                ; =9
 4278b3c: 39007fe8     	strb	w8, [sp, #0x1f]
 4278b40: 910023e9     	add	x9, sp, #0x8
 4278b44: 9100252a     	add	x10, x9, #0x9
 4278b48: f004bd28     	adrp	x8, 0xda1f000 <dyld_stub_binder+0xda1f000>
 4278b4c: 9114dd08     	add	x8, x8, #0x537
 4278b50: eb08015f     	cmp	x10, x8
 4278b54: fa488122     	ccmp	x9, x8, #0x2, hi
 4278b58: 540007c9     	b.ls	0x4278c50 <_ChromeMain+0x42739b4>
 4278b5c: aa0003f3     	mov	x19, x0
 4278b60: 52800e69     	mov	w9, #0x73               ; =115
 4278b64: 790023e9     	strh	w9, [sp, #0x10]
 4278b68: f9400108     	ldr	x8, [x8]
 4278b6c: f90007e8     	str	x8, [sp, #0x8]
 4278b70: 39c23c08     	ldrsb	w8, [x0, #0x8f]
 4278b74: 37f80648     	tbnz	w8, #0x1f, 0x4278c3c <_ChromeMain+0x42739a0>
 4278b78: 3cc083e0     	ldur	q0, [sp, #0x8]
 4278b7c: 3c878260     	stur	q0, [x19, #0x78]
 4278b80: f9400fe8     	ldr	x8, [sp, #0x18]
 4278b84: f8088268     	stur	x8, [x19, #0x88]
 4278b88: aa1303e0     	mov	x0, x19
 4278b8c: 9400034e     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4278b90: 39446268     	ldrb	w8, [x19, #0x118]
 4278b94: 37000448     	tbnz	w8, #0x0, 0x4278c1c <_ChromeMain+0x4273980>
 4278b98: f9407a68     	ldr	x8, [x19, #0xf0]
 4278b9c: b4000408     	cbz	x8, 0x4278c1c <_ChromeMain+0x4273980>
 4278ba0: 39444268     	ldrb	w8, [x19, #0x110]
 4278ba4: 340003c8     	cbz	w8, 0x4278c1c <_ChromeMain+0x4273980>
 4278ba8: 39432268     	ldrb	w8, [x19, #0xc8]
 4278bac: 370000e8     	tbnz	w8, #0x0, 0x4278bc8 <_ChromeMain+0x427392c>
 4278bb0: 39444668     	ldrb	w8, [x19, #0x111]
 4278bb4: 34000348     	cbz	w8, 0x4278c1c <_ChromeMain+0x4273980>
 4278bb8: 39444a68     	ldrb	w8, [x19, #0x112]
 4278bbc: 34000308     	cbz	w8, 0x4278c1c <_ChromeMain+0x4273980>
 4278bc0: 39444e68     	ldrb	w8, [x19, #0x113]
 4278bc4: 340002c8     	cbz	w8, 0x4278c1c <_ChromeMain+0x4273980>
 4278bc8: 52800028     	mov	w8, #0x1                ; =1
 4278bcc: 39046268     	strb	w8, [x19, #0x118]
 4278bd0: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 4278bd4: 37f802c8     	tbnz	w8, #0x1f, 0x4278c2c <_ChromeMain+0x4273990>
 4278bd8: 91016268     	add	x8, x19, #0x58
 4278bdc: 528000e9     	mov	w9, #0x7                ; =7
 4278be0: 3901be69     	strb	w9, [x19, #0x6f]
 4278be4: 528d2dc9     	mov	w9, #0x696e             ; =26990
 4278be8: 72acedc9     	movk	w9, #0x676e, lsl #16
 4278bec: b8003109     	stur	w9, [x8, #0x3]
 4278bf0: 528eae49     	mov	w9, #0x7572             ; =30066
 4278bf4: 72adcdc9     	movk	w9, #0x6e6e, lsl #16
 4278bf8: b9000109     	str	w9, [x8]
 4278bfc: 39001d1f     	strb	wzr, [x8, #0x7]
 4278c00: d2e7fc08     	mov	x8, #0x3fe0000000000000 ; =4602678819172646912
 4278c04: f9003a68     	str	x8, [x19, #0x70]
 4278c08: aa1303e0     	mov	x0, x19
 4278c0c: 9400032e     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4278c10: f9407a60     	ldr	x0, [x19, #0xf0]
 4278c14: 9103e261     	add	x1, x19, #0xf8
 4278c18: 97f9da59     	bl	0x40ef57c <_ChromeMain+0x40ea2e0>
 4278c1c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4278c20: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4278c24: 910103ff     	add	sp, sp, #0x40
 4278c28: d65f03c0     	ret
 4278c2c: 528000e8     	mov	w8, #0x7                ; =7
 4278c30: f9003268     	str	x8, [x19, #0x60]
 4278c34: f9402e68     	ldr	x8, [x19, #0x58]
 4278c38: 17ffffeb     	b	0x4278be4 <_ChromeMain+0x4273948>
 4278c3c: f9403e60     	ldr	x0, [x19, #0x78]
 4278c40: f9404668     	ldr	x8, [x19, #0x88]
 4278c44: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4278c48: 96f6409c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278c4c: 17ffffcb     	b	0x4278b78 <_ChromeMain+0x42738dc>
 4278c50: d4200020     	brk	#0x1
 4278c54: d10103ff     	sub	sp, sp, #0x40
 4278c58: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4278c5c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4278c60: 9100c3fd     	add	x29, sp, #0x30
 4278c64: 52800028     	mov	w8, #0x1                ; =1
 4278c68: 39044408     	strb	w8, [x0, #0x111]
 4278c6c: 528000e8     	mov	w8, #0x7                ; =7
 4278c70: 39007fe8     	strb	w8, [sp, #0x1f]
 4278c74: 910023e8     	add	x8, sp, #0x8
 4278c78: b2400909     	orr	x9, x8, #0x7
 4278c7c: d004baaa     	adrp	x10, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 4278c80: 913a654a     	add	x10, x10, #0xe99
 4278c84: eb0a013f     	cmp	x9, x10
 4278c88: fa4a8102     	ccmp	x8, x10, #0x2, hi
 4278c8c: 54000829     	b.ls	0x4278d90 <_ChromeMain+0x4273af4>
 4278c90: aa0003f3     	mov	x19, x0
 4278c94: 528dee88     	mov	w8, #0x6f74             ; =28532
 4278c98: 72af2e48     	movk	w8, #0x7972, lsl #16
 4278c9c: b800b3e8     	stur	w8, [sp, #0xb]
 4278ca0: 528d2d08     	mov	w8, #0x6968             ; =26984
 4278ca4: 72ae8e68     	movk	w8, #0x7473, lsl #16
 4278ca8: b9000be8     	str	w8, [sp, #0x8]
 4278cac: 39003fff     	strb	wzr, [sp, #0xf]
 4278cb0: 39c23c08     	ldrsb	w8, [x0, #0x8f]
 4278cb4: 37f80648     	tbnz	w8, #0x1f, 0x4278d7c <_ChromeMain+0x4273ae0>
 4278cb8: 3cc083e0     	ldur	q0, [sp, #0x8]
 4278cbc: 3c878260     	stur	q0, [x19, #0x78]
 4278cc0: f9400fe8     	ldr	x8, [sp, #0x18]
 4278cc4: f8088268     	stur	x8, [x19, #0x88]
 4278cc8: aa1303e0     	mov	x0, x19
 4278ccc: 940002fe     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4278cd0: 39446268     	ldrb	w8, [x19, #0x118]
 4278cd4: 37000448     	tbnz	w8, #0x0, 0x4278d5c <_ChromeMain+0x4273ac0>
 4278cd8: f9407a68     	ldr	x8, [x19, #0xf0]
 4278cdc: b4000408     	cbz	x8, 0x4278d5c <_ChromeMain+0x4273ac0>
 4278ce0: 39444268     	ldrb	w8, [x19, #0x110]
 4278ce4: 340003c8     	cbz	w8, 0x4278d5c <_ChromeMain+0x4273ac0>
 4278ce8: 39432268     	ldrb	w8, [x19, #0xc8]
 4278cec: 370000e8     	tbnz	w8, #0x0, 0x4278d08 <_ChromeMain+0x4273a6c>
 4278cf0: 39444668     	ldrb	w8, [x19, #0x111]
 4278cf4: 34000348     	cbz	w8, 0x4278d5c <_ChromeMain+0x4273ac0>
 4278cf8: 39444a68     	ldrb	w8, [x19, #0x112]
 4278cfc: 34000308     	cbz	w8, 0x4278d5c <_ChromeMain+0x4273ac0>
 4278d00: 39444e68     	ldrb	w8, [x19, #0x113]
 4278d04: 340002c8     	cbz	w8, 0x4278d5c <_ChromeMain+0x4273ac0>
 4278d08: 52800028     	mov	w8, #0x1                ; =1
 4278d0c: 39046268     	strb	w8, [x19, #0x118]
 4278d10: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 4278d14: 37f802c8     	tbnz	w8, #0x1f, 0x4278d6c <_ChromeMain+0x4273ad0>
 4278d18: 91016268     	add	x8, x19, #0x58
 4278d1c: 528000e9     	mov	w9, #0x7                ; =7
 4278d20: 3901be69     	strb	w9, [x19, #0x6f]
 4278d24: 528d2dc9     	mov	w9, #0x696e             ; =26990
 4278d28: 72acedc9     	movk	w9, #0x676e, lsl #16
 4278d2c: b8003109     	stur	w9, [x8, #0x3]
 4278d30: 528eae49     	mov	w9, #0x7572             ; =30066
 4278d34: 72adcdc9     	movk	w9, #0x6e6e, lsl #16
 4278d38: b9000109     	str	w9, [x8]
 4278d3c: 39001d1f     	strb	wzr, [x8, #0x7]
 4278d40: d2e7fc08     	mov	x8, #0x3fe0000000000000 ; =4602678819172646912
 4278d44: f9003a68     	str	x8, [x19, #0x70]
 4278d48: aa1303e0     	mov	x0, x19
 4278d4c: 940002de     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4278d50: f9407a60     	ldr	x0, [x19, #0xf0]
 4278d54: 9103e261     	add	x1, x19, #0xf8
 4278d58: 97f9da09     	bl	0x40ef57c <_ChromeMain+0x40ea2e0>
 4278d5c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4278d60: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4278d64: 910103ff     	add	sp, sp, #0x40
 4278d68: d65f03c0     	ret
 4278d6c: 528000e8     	mov	w8, #0x7                ; =7
 4278d70: f9003268     	str	x8, [x19, #0x60]
 4278d74: f9402e68     	ldr	x8, [x19, #0x58]
 4278d78: 17ffffeb     	b	0x4278d24 <_ChromeMain+0x4273a88>
 4278d7c: f9403e60     	ldr	x0, [x19, #0x78]
 4278d80: f9404668     	ldr	x8, [x19, #0x88]
 4278d84: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4278d88: 96f6404c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4278d8c: 17ffffcb     	b	0x4278cb8 <_ChromeMain+0x4273a1c>
 4278d90: d4200020     	brk	#0x1
 4278d94: d10203ff     	sub	sp, sp, #0x80
 4278d98: a9026ffc     	stp	x28, x27, [sp, #0x20]
 4278d9c: a90367fa     	stp	x26, x25, [sp, #0x30]
 4278da0: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4278da4: a90557f6     	stp	x22, x21, [sp, #0x50]
 4278da8: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4278dac: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4278db0: 9101c3fd     	add	x29, sp, #0x70
 4278db4: aa0003f4     	mov	x20, x0
 4278db8: aa0003f3     	mov	x19, x0
 4278dbc: f84f8e75     	ldr	x21, [x19, #0xf8]!
 4278dc0: 52800028     	mov	w8, #0x1                ; =1
 4278dc4: 39006a68     	strb	w8, [x19, #0x1a]
 4278dc8: f9400668     	ldr	x8, [x19, #0x8]
 4278dcc: d37ef509     	lsl	x9, x8, #2
 4278dd0: b4000109     	cbz	x9, 0x4278df0 <_ChromeMain+0x4273b54>
 4278dd4: cb080be8     	neg	x8, x8, lsl #2
 4278dd8: 8b150129     	add	x9, x9, x21
 4278ddc: d1001129     	sub	x9, x9, #0x4
 4278de0: b4000d09     	cbz	x9, 0x4278f80 <_ChromeMain+0x4273ce4>
 4278de4: d1001129     	sub	x9, x9, #0x4
 4278de8: 91001108     	add	x8, x8, #0x4
 4278dec: b5ffffa8     	cbnz	x8, 0x4278de0 <_ChromeMain+0x4273b44>
 4278df0: f900829f     	str	xzr, [x20, #0x100]
 4278df4: 39400028     	ldrb	w8, [x1]
 4278df8: 7100091f     	cmp	w8, #0x2
 4278dfc: 54001182     	b.hs	0x427902c <_ChromeMain+0x4273d90>
 4278e00: 340008a8     	cbz	w8, 0x4278f14 <_ChromeMain+0x4273c78>
 4278e04: 52800128     	mov	w8, #0x9                ; =9
 4278e08: 39007fe8     	strb	w8, [sp, #0x1f]
 4278e0c: 910023e9     	add	x9, sp, #0x8
 4278e10: 9100252a     	add	x10, x9, #0x9
 4278e14: f004baa8     	adrp	x8, 0xd9cf000 <dyld_stub_binder+0xd9cf000>
 4278e18: 91067d08     	add	x8, x8, #0x19f
 4278e1c: eb08015f     	cmp	x10, x8
 4278e20: fa488122     	ccmp	x9, x8, #0x2, hi
 4278e24: 54000ae9     	b.ls	0x4278f80 <_ChromeMain+0x4273ce4>
 4278e28: 52800e69     	mov	w9, #0x73               ; =115
 4278e2c: 790023e9     	strh	w9, [sp, #0x10]
 4278e30: f9400108     	ldr	x8, [x8]
 4278e34: f90007e8     	str	x8, [sp, #0x8]
 4278e38: 39c23e88     	ldrsb	w8, [x20, #0x8f]
 4278e3c: 37f80ea8     	tbnz	w8, #0x1f, 0x4279010 <_ChromeMain+0x4273d74>
 4278e40: 3cc083e0     	ldur	q0, [sp, #0x8]
 4278e44: 3c878280     	stur	q0, [x20, #0x78]
 4278e48: f9400fe8     	ldr	x8, [sp, #0x18]
 4278e4c: f8088288     	stur	x8, [x20, #0x88]
 4278e50: aa1403e0     	mov	x0, x20
 4278e54: 9400029c     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4278e58: 39446288     	ldrb	w8, [x20, #0x118]
 4278e5c: 37000448     	tbnz	w8, #0x0, 0x4278ee4 <_ChromeMain+0x4273c48>
 4278e60: f9407a88     	ldr	x8, [x20, #0xf0]
 4278e64: b4000408     	cbz	x8, 0x4278ee4 <_ChromeMain+0x4273c48>
 4278e68: 39444288     	ldrb	w8, [x20, #0x110]
 4278e6c: 340003c8     	cbz	w8, 0x4278ee4 <_ChromeMain+0x4273c48>
 4278e70: 39432288     	ldrb	w8, [x20, #0xc8]
 4278e74: 370000e8     	tbnz	w8, #0x0, 0x4278e90 <_ChromeMain+0x4273bf4>
 4278e78: 39444688     	ldrb	w8, [x20, #0x111]
 4278e7c: 34000348     	cbz	w8, 0x4278ee4 <_ChromeMain+0x4273c48>
 4278e80: 39444a88     	ldrb	w8, [x20, #0x112]
 4278e84: 34000308     	cbz	w8, 0x4278ee4 <_ChromeMain+0x4273c48>
 4278e88: 39444e88     	ldrb	w8, [x20, #0x113]
 4278e8c: 340002c8     	cbz	w8, 0x4278ee4 <_ChromeMain+0x4273c48>
 4278e90: 52800028     	mov	w8, #0x1                ; =1
 4278e94: 39046288     	strb	w8, [x20, #0x118]
 4278e98: 39c1be88     	ldrsb	w8, [x20, #0x6f]
 4278e9c: 37f80348     	tbnz	w8, #0x1f, 0x4278f04 <_ChromeMain+0x4273c68>
 4278ea0: 91016288     	add	x8, x20, #0x58
 4278ea4: 528000e9     	mov	w9, #0x7                ; =7
 4278ea8: 3901be89     	strb	w9, [x20, #0x6f]
 4278eac: 528d2dc9     	mov	w9, #0x696e             ; =26990
 4278eb0: 72acedc9     	movk	w9, #0x676e, lsl #16
 4278eb4: b8003109     	stur	w9, [x8, #0x3]
 4278eb8: 528eae49     	mov	w9, #0x7572             ; =30066
 4278ebc: 72adcdc9     	movk	w9, #0x6e6e, lsl #16
 4278ec0: b9000109     	str	w9, [x8]
 4278ec4: 39001d1f     	strb	wzr, [x8, #0x7]
 4278ec8: d2e7fc08     	mov	x8, #0x3fe0000000000000 ; =4602678819172646912
 4278ecc: f9003a88     	str	x8, [x20, #0x70]
 4278ed0: aa1403e0     	mov	x0, x20
 4278ed4: 9400027c     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4278ed8: f9407a80     	ldr	x0, [x20, #0xf0]
 4278edc: aa1303e1     	mov	x1, x19
 4278ee0: 97f9d9a7     	bl	0x40ef57c <_ChromeMain+0x40ea2e0>
 4278ee4: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4278ee8: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4278eec: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4278ef0: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4278ef4: a94367fa     	ldp	x26, x25, [sp, #0x30]
 4278ef8: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 4278efc: 910203ff     	add	sp, sp, #0x80
 4278f00: d65f03c0     	ret
 4278f04: 528000e8     	mov	w8, #0x7                ; =7
 4278f08: f9003288     	str	x8, [x20, #0x60]
 4278f0c: f9402e88     	ldr	x8, [x20, #0x58]
 4278f10: 17ffffe7     	b	0x4278eac <_ChromeMain+0x4273c10>
 4278f14: f9401428     	ldr	x8, [x1, #0x28]
 4278f18: 52800b09     	mov	w9, #0x58               ; =88
 4278f1c: 9b097d18     	mul	x24, x8, x9
 4278f20: b4fff738     	cbz	x24, 0x4278e04 <_ChromeMain+0x4273b68>
 4278f24: d280001a     	mov	x26, #0x0               ; =0
 4278f28: f9401028     	ldr	x8, [x1, #0x20]
 4278f2c: 91014119     	add	x25, x8, #0x50
 4278f30: 92fc000a     	mov	x10, #0x1fffffffffffffff ; =2305843009213693951
 4278f34: 92f8001c     	mov	x28, #0x3fffffffffffffff ; =4611686018427387903
 4278f38: f9408688     	ldr	x8, [x20, #0x108]
 4278f3c: eb08035f     	cmp	x26, x8
 4278f40: 54000220     	b.eq	0x4278f84 <_ChromeMain+0x4273ce8>
 4278f44: 8b1a0aa8     	add	x8, x21, x26, lsl #2
 4278f48: b40001c8     	cbz	x8, 0x4278f80 <_ChromeMain+0x4273ce4>
 4278f4c: b9400329     	ldr	w9, [x25]
 4278f50: b9000109     	str	w9, [x8]
 4278f54: 8b1a0aa8     	add	x8, x21, x26, lsl #2
 4278f58: 91001108     	add	x8, x8, #0x4
 4278f5c: f9407e95     	ldr	x21, [x20, #0xf8]
 4278f60: eb150108     	subs	x8, x8, x21
 4278f64: 9342fd1a     	asr	x26, x8, #2
 4278f68: f900829a     	str	x26, [x20, #0x100]
 4278f6c: 540000a0     	b.eq	0x4278f80 <_ChromeMain+0x4273ce4>
 4278f70: 91016339     	add	x25, x25, #0x58
 4278f74: f1016318     	subs	x24, x24, #0x58
 4278f78: 54fffe01     	b.ne	0x4278f38 <_ChromeMain+0x4273c9c>
 4278f7c: 17ffffa2     	b	0x4278e04 <_ChromeMain+0x4273b68>
 4278f80: d4200020     	brk	#0x1
 4278f84: 91000748     	add	x8, x26, #0x1
 4278f88: d37efd09     	lsr	x9, x8, #62
 4278f8c: b50004c9     	cbnz	x9, 0x4279024 <_ChromeMain+0x4273d88>
 4278f90: d37ffb49     	lsl	x9, x26, #1
 4278f94: eb08013f     	cmp	x9, x8
 4278f98: 9a888128     	csel	x8, x9, x8, hi
 4278f9c: eb0a035f     	cmp	x26, x10
 4278fa0: 9a9c311b     	csel	x27, x8, x28, lo
 4278fa4: b40004bb     	cbz	x27, 0x4279038 <_ChromeMain+0x4273d9c>
 4278fa8: d37eff68     	lsr	x8, x27, #62
 4278fac: b50003e8     	cbnz	x8, 0x4279028 <_ChromeMain+0x4273d8c>
 4278fb0: d37ef760     	lsl	x0, x27, #2
 4278fb4: 96f658ed     	bl	0xf368 <_ChromeMain+0xa0cc>
 4278fb8: aa0003f5     	mov	x21, x0
 4278fbc: ab1a0aa8     	adds	x8, x21, x26, lsl #2
 4278fc0: 54fffe00     	b.eq	0x4278f80 <_ChromeMain+0x4273ce4>
 4278fc4: b9400329     	ldr	w9, [x25]
 4278fc8: b9000109     	str	w9, [x8]
 4278fcc: a94fa681     	ldp	x1, x9, [x20, #0xf8]
 4278fd0: cb090916     	sub	x22, x8, x9, lsl #2
 4278fd4: d37ef537     	lsl	x23, x9, #2
 4278fd8: aa1603e0     	mov	x0, x22
 4278fdc: aa1703e2     	mov	x2, x23
 4278fe0: 94f64346     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 4278fe4: 910012e8     	add	x8, x23, #0x4
 4278fe8: 9342fd08     	asr	x8, x8, #2
 4278fec: f9407e80     	ldr	x0, [x20, #0xf8]
 4278ff0: a90fa296     	stp	x22, x8, [x20, #0xf8]
 4278ff4: f9408688     	ldr	x8, [x20, #0x108]
 4278ff8: f900869b     	str	x27, [x20, #0x108]
 4278ffc: b4000060     	cbz	x0, 0x4279008 <_ChromeMain+0x4273d6c>
 4279000: d37ef501     	lsl	x1, x8, #2
 4279004: 96f63fad     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279008: 92fc000a     	mov	x10, #0x1fffffffffffffff ; =2305843009213693951
 427900c: 17ffffd2     	b	0x4278f54 <_ChromeMain+0x4273cb8>
 4279010: f9403e80     	ldr	x0, [x20, #0x78]
 4279014: f9404688     	ldr	x8, [x20, #0x88]
 4279018: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427901c: 96f63fa7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279020: 17ffff88     	b	0x4278e40 <_ChromeMain+0x4273ba4>
 4279024: 97726b57     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 4279028: 942633fe     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 427902c: d4200000     	brk	#0
 4279030: d4400000     	hlt	#0
 4279034: d4200020     	brk	#0x1
 4279038: d2800015     	mov	x21, #0x0               ; =0
 427903c: 17ffffe0     	b	0x4278fbc <_ChromeMain+0x4273d20>
 4279040: d10103ff     	sub	sp, sp, #0x40
 4279044: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4279048: a9037bfd     	stp	x29, x30, [sp, #0x30]
 427904c: 9100c3fd     	add	x29, sp, #0x30
 4279050: 52800028     	mov	w8, #0x1                ; =1
 4279054: 39044c08     	strb	w8, [x0, #0x113]
 4279058: 52800188     	mov	w8, #0xc                ; =12
 427905c: 39007fe8     	strb	w8, [sp, #0x1f]
 4279060: 910023e9     	add	x9, sp, #0x8
 4279064: 9100312a     	add	x10, x9, #0xc
 4279068: d004c548     	adrp	x8, 0xdb23000 <dyld_stub_binder+0xdb23000>
 427906c: 9110d108     	add	x8, x8, #0x434
 4279070: eb08015f     	cmp	x10, x8
 4279074: fa488122     	ccmp	x9, x8, #0x2, hi
 4279078: 54000809     	b.ls	0x4279178 <_ChromeMain+0x4273edc>
 427907c: aa0003f3     	mov	x19, x0
 4279080: 528e4c29     	mov	w9, #0x7261             ; =29281
 4279084: 72ae6c89     	movk	w9, #0x7364, lsl #16
 4279088: b90013e9     	str	w9, [sp, #0x10]
 427908c: f9400108     	ldr	x8, [x8]
 4279090: f90007e8     	str	x8, [sp, #0x8]
 4279094: 390053ff     	strb	wzr, [sp, #0x14]
 4279098: 39c23c08     	ldrsb	w8, [x0, #0x8f]
 427909c: 37f80648     	tbnz	w8, #0x1f, 0x4279164 <_ChromeMain+0x4273ec8>
 42790a0: 3cc083e0     	ldur	q0, [sp, #0x8]
 42790a4: 3c878260     	stur	q0, [x19, #0x78]
 42790a8: f9400fe8     	ldr	x8, [sp, #0x18]
 42790ac: f8088268     	stur	x8, [x19, #0x88]
 42790b0: aa1303e0     	mov	x0, x19
 42790b4: 94000204     	bl	0x42798c4 <_ChromeMain+0x4274628>
 42790b8: 39446268     	ldrb	w8, [x19, #0x118]
 42790bc: 37000448     	tbnz	w8, #0x0, 0x4279144 <_ChromeMain+0x4273ea8>
 42790c0: f9407a68     	ldr	x8, [x19, #0xf0]
 42790c4: b4000408     	cbz	x8, 0x4279144 <_ChromeMain+0x4273ea8>
 42790c8: 39444268     	ldrb	w8, [x19, #0x110]
 42790cc: 340003c8     	cbz	w8, 0x4279144 <_ChromeMain+0x4273ea8>
 42790d0: 39432268     	ldrb	w8, [x19, #0xc8]
 42790d4: 370000e8     	tbnz	w8, #0x0, 0x42790f0 <_ChromeMain+0x4273e54>
 42790d8: 39444668     	ldrb	w8, [x19, #0x111]
 42790dc: 34000348     	cbz	w8, 0x4279144 <_ChromeMain+0x4273ea8>
 42790e0: 39444a68     	ldrb	w8, [x19, #0x112]
 42790e4: 34000308     	cbz	w8, 0x4279144 <_ChromeMain+0x4273ea8>
 42790e8: 39444e68     	ldrb	w8, [x19, #0x113]
 42790ec: 340002c8     	cbz	w8, 0x4279144 <_ChromeMain+0x4273ea8>
 42790f0: 52800028     	mov	w8, #0x1                ; =1
 42790f4: 39046268     	strb	w8, [x19, #0x118]
 42790f8: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 42790fc: 37f802c8     	tbnz	w8, #0x1f, 0x4279154 <_ChromeMain+0x4273eb8>
 4279100: 91016268     	add	x8, x19, #0x58
 4279104: 528000e9     	mov	w9, #0x7                ; =7
 4279108: 3901be69     	strb	w9, [x19, #0x6f]
 427910c: 528d2dc9     	mov	w9, #0x696e             ; =26990
 4279110: 72acedc9     	movk	w9, #0x676e, lsl #16
 4279114: b8003109     	stur	w9, [x8, #0x3]
 4279118: 528eae49     	mov	w9, #0x7572             ; =30066
 427911c: 72adcdc9     	movk	w9, #0x6e6e, lsl #16
 4279120: b9000109     	str	w9, [x8]
 4279124: 39001d1f     	strb	wzr, [x8, #0x7]
 4279128: d2e7fc08     	mov	x8, #0x3fe0000000000000 ; =4602678819172646912
 427912c: f9003a68     	str	x8, [x19, #0x70]
 4279130: aa1303e0     	mov	x0, x19
 4279134: 940001e4     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4279138: f9407a60     	ldr	x0, [x19, #0xf0]
 427913c: 9103e261     	add	x1, x19, #0xf8
 4279140: 97f9d90f     	bl	0x40ef57c <_ChromeMain+0x40ea2e0>
 4279144: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4279148: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 427914c: 910103ff     	add	sp, sp, #0x40
 4279150: d65f03c0     	ret
 4279154: 528000e8     	mov	w8, #0x7                ; =7
 4279158: f9003268     	str	x8, [x19, #0x60]
 427915c: f9402e68     	ldr	x8, [x19, #0x58]
 4279160: 17ffffeb     	b	0x427910c <_ChromeMain+0x4273e70>
 4279164: f9403e60     	ldr	x0, [x19, #0x78]
 4279168: f9404668     	ldr	x8, [x19, #0x88]
 427916c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4279170: 96f63f52     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279174: 17ffffcb     	b	0x42790a0 <_ChromeMain+0x4273e04>
 4279178: d4200020     	brk	#0x1
 427917c: d10103ff     	sub	sp, sp, #0x40
 4279180: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4279184: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4279188: 9100c3fd     	add	x29, sp, #0x30
 427918c: 52800028     	mov	w8, #0x1                ; =1
 4279190: 39045008     	strb	w8, [x0, #0x114]
 4279194: 52800128     	mov	w8, #0x9                ; =9
 4279198: 39007fe8     	strb	w8, [sp, #0x1f]
 427919c: 910023e9     	add	x9, sp, #0x8
 42791a0: 9100252a     	add	x10, x9, #0x9
 42791a4: d004bd28     	adrp	x8, 0xda1f000 <dyld_stub_binder+0xda1f000>
 42791a8: 9114dd08     	add	x8, x8, #0x537
 42791ac: eb08015f     	cmp	x10, x8
 42791b0: fa488122     	ccmp	x9, x8, #0x2, hi
 42791b4: 54000329     	b.ls	0x4279218 <_ChromeMain+0x4273f7c>
 42791b8: aa0003f3     	mov	x19, x0
 42791bc: 52800e69     	mov	w9, #0x73               ; =115
 42791c0: 790023e9     	strh	w9, [sp, #0x10]
 42791c4: f9400108     	ldr	x8, [x8]
 42791c8: f90007e8     	str	x8, [sp, #0x8]
 42791cc: 39c23c08     	ldrsb	w8, [x0, #0x8f]
 42791d0: 37f801a8     	tbnz	w8, #0x1f, 0x4279204 <_ChromeMain+0x4273f68>
 42791d4: 3cc083e0     	ldur	q0, [sp, #0x8]
 42791d8: 3c878260     	stur	q0, [x19, #0x78]
 42791dc: f9400fe8     	ldr	x8, [sp, #0x18]
 42791e0: f8088268     	stur	x8, [x19, #0x88]
 42791e4: aa1303e0     	mov	x0, x19
 42791e8: 940001b7     	bl	0x42798c4 <_ChromeMain+0x4274628>
 42791ec: aa1303e0     	mov	x0, x19
 42791f0: 940005f7     	bl	0x427a9cc <_ChromeMain+0x4275730>
 42791f4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 42791f8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 42791fc: 910103ff     	add	sp, sp, #0x40
 4279200: d65f03c0     	ret
 4279204: f9403e60     	ldr	x0, [x19, #0x78]
 4279208: f9404668     	ldr	x8, [x19, #0x88]
 427920c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4279210: 96f63f2a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279214: 17fffff0     	b	0x42791d4 <_ChromeMain+0x4273f38>
 4279218: d4200020     	brk	#0x1
 427921c: d10103ff     	sub	sp, sp, #0x40
 4279220: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4279224: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4279228: 9100c3fd     	add	x29, sp, #0x30
 427922c: 52800028     	mov	w8, #0x1                ; =1
 4279230: 39045408     	strb	w8, [x0, #0x115]
 4279234: 528000e8     	mov	w8, #0x7                ; =7
 4279238: 39007fe8     	strb	w8, [sp, #0x1f]
 427923c: 910023e8     	add	x8, sp, #0x8
 4279240: b2400909     	orr	x9, x8, #0x7
 4279244: b004baaa     	adrp	x10, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 4279248: 913a654a     	add	x10, x10, #0xe99
 427924c: eb0a013f     	cmp	x9, x10
 4279250: fa4a8102     	ccmp	x8, x10, #0x2, hi
 4279254: 54000389     	b.ls	0x42792c4 <_ChromeMain+0x4274028>
 4279258: aa0003f3     	mov	x19, x0
 427925c: 528dee88     	mov	w8, #0x6f74             ; =28532
 4279260: 72af2e48     	movk	w8, #0x7972, lsl #16
 4279264: b800b3e8     	stur	w8, [sp, #0xb]
 4279268: 528d2d08     	mov	w8, #0x6968             ; =26984
 427926c: 72ae8e68     	movk	w8, #0x7473, lsl #16
 4279270: b9000be8     	str	w8, [sp, #0x8]
 4279274: 39003fff     	strb	wzr, [sp, #0xf]
 4279278: 39c23c08     	ldrsb	w8, [x0, #0x8f]
 427927c: 37f801a8     	tbnz	w8, #0x1f, 0x42792b0 <_ChromeMain+0x4274014>
 4279280: 3cc083e0     	ldur	q0, [sp, #0x8]
 4279284: 3c878260     	stur	q0, [x19, #0x78]
 4279288: f9400fe8     	ldr	x8, [sp, #0x18]
 427928c: f8088268     	stur	x8, [x19, #0x88]
 4279290: aa1303e0     	mov	x0, x19
 4279294: 9400018c     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4279298: aa1303e0     	mov	x0, x19
 427929c: 940005cc     	bl	0x427a9cc <_ChromeMain+0x4275730>
 42792a0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 42792a4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 42792a8: 910103ff     	add	sp, sp, #0x40
 42792ac: d65f03c0     	ret
 42792b0: f9403e60     	ldr	x0, [x19, #0x78]
 42792b4: f9404668     	ldr	x8, [x19, #0x88]
 42792b8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42792bc: 96f63eff     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42792c0: 17fffff0     	b	0x4279280 <_ChromeMain+0x4273fe4>
 42792c4: d4200020     	brk	#0x1
 42792c8: d10103ff     	sub	sp, sp, #0x40
 42792cc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 42792d0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 42792d4: 9100c3fd     	add	x29, sp, #0x30
 42792d8: 52800028     	mov	w8, #0x1                ; =1
 42792dc: 39045808     	strb	w8, [x0, #0x116]
 42792e0: 52800128     	mov	w8, #0x9                ; =9
 42792e4: 39007fe8     	strb	w8, [sp, #0x1f]
 42792e8: 910023e9     	add	x9, sp, #0x8
 42792ec: 9100252a     	add	x10, x9, #0x9
 42792f0: d004baa8     	adrp	x8, 0xd9cf000 <dyld_stub_binder+0xd9cf000>
 42792f4: 91067d08     	add	x8, x8, #0x19f
 42792f8: eb08015f     	cmp	x10, x8
 42792fc: fa488122     	ccmp	x9, x8, #0x2, hi
 4279300: 54000329     	b.ls	0x4279364 <_ChromeMain+0x42740c8>
 4279304: aa0003f3     	mov	x19, x0
 4279308: 52800e69     	mov	w9, #0x73               ; =115
 427930c: 790023e9     	strh	w9, [sp, #0x10]
 4279310: f9400108     	ldr	x8, [x8]
 4279314: f90007e8     	str	x8, [sp, #0x8]
 4279318: 39c23c08     	ldrsb	w8, [x0, #0x8f]
 427931c: 37f801a8     	tbnz	w8, #0x1f, 0x4279350 <_ChromeMain+0x42740b4>
 4279320: 3cc083e0     	ldur	q0, [sp, #0x8]
 4279324: 3c878260     	stur	q0, [x19, #0x78]
 4279328: f9400fe8     	ldr	x8, [sp, #0x18]
 427932c: f8088268     	stur	x8, [x19, #0x88]
 4279330: aa1303e0     	mov	x0, x19
 4279334: 94000164     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4279338: aa1303e0     	mov	x0, x19
 427933c: 940005a4     	bl	0x427a9cc <_ChromeMain+0x4275730>
 4279340: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4279344: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4279348: 910103ff     	add	sp, sp, #0x40
 427934c: d65f03c0     	ret
 4279350: f9403e60     	ldr	x0, [x19, #0x78]
 4279354: f9404668     	ldr	x8, [x19, #0x88]
 4279358: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427935c: 96f63ed7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279360: 17fffff0     	b	0x4279320 <_ChromeMain+0x4274084>
 4279364: d4200020     	brk	#0x1
 4279368: d10103ff     	sub	sp, sp, #0x40
 427936c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4279370: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4279374: 9100c3fd     	add	x29, sp, #0x30
 4279378: 52800028     	mov	w8, #0x1                ; =1
 427937c: 39045c08     	strb	w8, [x0, #0x117]
 4279380: 52800188     	mov	w8, #0xc                ; =12
 4279384: 39007fe8     	strb	w8, [sp, #0x1f]
 4279388: 910023e9     	add	x9, sp, #0x8
 427938c: 9100312a     	add	x10, x9, #0xc
 4279390: d004c548     	adrp	x8, 0xdb23000 <dyld_stub_binder+0xdb23000>
 4279394: 9110d108     	add	x8, x8, #0x434
 4279398: eb08015f     	cmp	x10, x8
 427939c: fa488122     	ccmp	x9, x8, #0x2, hi
 42793a0: 54000369     	b.ls	0x427940c <_ChromeMain+0x4274170>
 42793a4: aa0003f3     	mov	x19, x0
 42793a8: 528e4c29     	mov	w9, #0x7261             ; =29281
 42793ac: 72ae6c89     	movk	w9, #0x7364, lsl #16
 42793b0: b90013e9     	str	w9, [sp, #0x10]
 42793b4: f9400108     	ldr	x8, [x8]
 42793b8: f90007e8     	str	x8, [sp, #0x8]
 42793bc: 390053ff     	strb	wzr, [sp, #0x14]
 42793c0: 39c23c08     	ldrsb	w8, [x0, #0x8f]
 42793c4: 37f801a8     	tbnz	w8, #0x1f, 0x42793f8 <_ChromeMain+0x427415c>
 42793c8: 3cc083e0     	ldur	q0, [sp, #0x8]
 42793cc: 3c878260     	stur	q0, [x19, #0x78]
 42793d0: f9400fe8     	ldr	x8, [sp, #0x18]
 42793d4: f8088268     	stur	x8, [x19, #0x88]
 42793d8: aa1303e0     	mov	x0, x19
 42793dc: 9400013a     	bl	0x42798c4 <_ChromeMain+0x4274628>
 42793e0: aa1303e0     	mov	x0, x19
 42793e4: 9400057a     	bl	0x427a9cc <_ChromeMain+0x4275730>
 42793e8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 42793ec: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 42793f0: 910103ff     	add	sp, sp, #0x40
 42793f4: d65f03c0     	ret
 42793f8: f9403e60     	ldr	x0, [x19, #0x78]
 42793fc: f9404668     	ldr	x8, [x19, #0x88]
 4279400: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4279404: 96f63ead     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279408: 17fffff0     	b	0x42793c8 <_ChromeMain+0x427412c>
 427940c: d4200020     	brk	#0x1
 4279410: aa0003e8     	mov	x8, x0
 4279414: f9409000     	ldr	x0, [x0, #0x120]
 4279418: b40000c0     	cbz	x0, 0x4279430 <_ChromeMain+0x4274194>
 427941c: 52800029     	mov	w9, #0x1                ; =1
 4279420: b8290009     	ldadd	w9, w9, [x0]
 4279424: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4279428: 6b0a013f     	cmp	w9, w10
 427942c: 540000c0     	b.eq	0x4279444 <_ChromeMain+0x42741a8>
 4279430: f9409508     	ldr	x8, [x8, #0x128]
 4279434: 9102a109     	add	x9, x8, #0xa8
 4279438: f100011f     	cmp	x8, #0x0
 427943c: 9a8903e1     	csel	x1, xzr, x9, eq
 4279440: d65f03c0     	ret
 4279444: d4200000     	brk	#0
 4279448: d4400000     	hlt	#0
 427944c: d4200020     	brk	#0x1
 4279450: d102a000     	sub	x0, x0, #0xa8
 4279454: 17fffbfb     	b	0x4278440 <_ChromeMain+0x42731a4>
 4279458: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 427945c: 910003fd     	mov	x29, sp
 4279460: d102a000     	sub	x0, x0, #0xa8
 4279464: 97fffbf7     	bl	0x4278440 <_ChromeMain+0x42731a4>
 4279468: 52802601     	mov	w1, #0x130              ; =304
 427946c: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 4279470: 16f63e92     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4279474: d102a000     	sub	x0, x0, #0xa8
 4279478: 17fffd2f     	b	0x4278934 <_ChromeMain+0x4273698>
 427947c: d102a000     	sub	x0, x0, #0xa8
 4279480: 17fffda8     	b	0x4278b20 <_ChromeMain+0x4273884>
 4279484: d102a000     	sub	x0, x0, #0xa8
 4279488: 17fffdf3     	b	0x4278c54 <_ChromeMain+0x42739b8>
 427948c: d102a000     	sub	x0, x0, #0xa8
 4279490: 17fffe41     	b	0x4278d94 <_ChromeMain+0x4273af8>
 4279494: d102a000     	sub	x0, x0, #0xa8
 4279498: 17fffeea     	b	0x4279040 <_ChromeMain+0x4273da4>
 427949c: d10103ff     	sub	sp, sp, #0x40
 42794a0: a9024ff4     	stp	x20, x19, [sp, #0x20]
 42794a4: a9037bfd     	stp	x29, x30, [sp, #0x30]
 42794a8: 9100c3fd     	add	x29, sp, #0x30
 42794ac: 52800028     	mov	w8, #0x1                ; =1
 42794b0: 3901b008     	strb	w8, [x0, #0x6c]
 42794b4: 52800128     	mov	w8, #0x9                ; =9
 42794b8: 39007fe8     	strb	w8, [sp, #0x1f]
 42794bc: 910023e9     	add	x9, sp, #0x8
 42794c0: 9100252a     	add	x10, x9, #0x9
 42794c4: d004bd28     	adrp	x8, 0xda1f000 <dyld_stub_binder+0xda1f000>
 42794c8: 9114dd08     	add	x8, x8, #0x537
 42794cc: eb08015f     	cmp	x10, x8
 42794d0: fa488122     	ccmp	x9, x8, #0x2, hi
 42794d4: 54000369     	b.ls	0x4279540 <_ChromeMain+0x42742a4>
 42794d8: aa0003f3     	mov	x19, x0
 42794dc: 52800e69     	mov	w9, #0x73               ; =115
 42794e0: 790023e9     	strh	w9, [sp, #0x10]
 42794e4: f9400108     	ldr	x8, [x8]
 42794e8: f90007e8     	str	x8, [sp, #0x8]
 42794ec: d100c014     	sub	x20, x0, #0x30
 42794f0: 38de7008     	ldursb	w8, [x0, #-0x19]
 42794f4: 37f801c8     	tbnz	w8, #0x1f, 0x427952c <_ChromeMain+0x4274290>
 42794f8: d102a273     	sub	x19, x19, #0xa8
 42794fc: 3cc083e0     	ldur	q0, [sp, #0x8]
 4279500: 3d800280     	str	q0, [x20]
 4279504: f9400fe8     	ldr	x8, [sp, #0x18]
 4279508: f9000a88     	str	x8, [x20, #0x10]
 427950c: aa1303e0     	mov	x0, x19
 4279510: 940000ed     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4279514: aa1303e0     	mov	x0, x19
 4279518: 9400052d     	bl	0x427a9cc <_ChromeMain+0x4275730>
 427951c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4279520: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4279524: 910103ff     	add	sp, sp, #0x40
 4279528: d65f03c0     	ret
 427952c: f85d0260     	ldur	x0, [x19, #-0x30]
 4279530: f85e0268     	ldur	x8, [x19, #-0x20]
 4279534: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4279538: 96f63e60     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427953c: 17ffffef     	b	0x42794f8 <_ChromeMain+0x427425c>
 4279540: d4200020     	brk	#0x1
 4279544: d10103ff     	sub	sp, sp, #0x40
 4279548: a9024ff4     	stp	x20, x19, [sp, #0x20]
 427954c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4279550: 9100c3fd     	add	x29, sp, #0x30
 4279554: 52800028     	mov	w8, #0x1                ; =1
 4279558: 3901b408     	strb	w8, [x0, #0x6d]
 427955c: 528000e8     	mov	w8, #0x7                ; =7
 4279560: 39007fe8     	strb	w8, [sp, #0x1f]
 4279564: 910023e8     	add	x8, sp, #0x8
 4279568: b2400909     	orr	x9, x8, #0x7
 427956c: b004baaa     	adrp	x10, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 4279570: 913a654a     	add	x10, x10, #0xe99
 4279574: eb0a013f     	cmp	x9, x10
 4279578: fa4a8102     	ccmp	x8, x10, #0x2, hi
 427957c: 540003c9     	b.ls	0x42795f4 <_ChromeMain+0x4274358>
 4279580: aa0003f3     	mov	x19, x0
 4279584: 528dee88     	mov	w8, #0x6f74             ; =28532
 4279588: 72af2e48     	movk	w8, #0x7972, lsl #16
 427958c: b800b3e8     	stur	w8, [sp, #0xb]
 4279590: 528d2d08     	mov	w8, #0x6968             ; =26984
 4279594: 72ae8e68     	movk	w8, #0x7473, lsl #16
 4279598: b9000be8     	str	w8, [sp, #0x8]
 427959c: 39003fff     	strb	wzr, [sp, #0xf]
 42795a0: d100c014     	sub	x20, x0, #0x30
 42795a4: 38de7008     	ldursb	w8, [x0, #-0x19]
 42795a8: 37f801c8     	tbnz	w8, #0x1f, 0x42795e0 <_ChromeMain+0x4274344>
 42795ac: d102a273     	sub	x19, x19, #0xa8
 42795b0: 3cc083e0     	ldur	q0, [sp, #0x8]
 42795b4: 3d800280     	str	q0, [x20]
 42795b8: f9400fe8     	ldr	x8, [sp, #0x18]
 42795bc: f9000a88     	str	x8, [x20, #0x10]
 42795c0: aa1303e0     	mov	x0, x19
 42795c4: 940000c0     	bl	0x42798c4 <_ChromeMain+0x4274628>
 42795c8: aa1303e0     	mov	x0, x19
 42795cc: 94000500     	bl	0x427a9cc <_ChromeMain+0x4275730>
 42795d0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 42795d4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 42795d8: 910103ff     	add	sp, sp, #0x40
 42795dc: d65f03c0     	ret
 42795e0: f85d0260     	ldur	x0, [x19, #-0x30]
 42795e4: f85e0268     	ldur	x8, [x19, #-0x20]
 42795e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42795ec: 96f63e33     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42795f0: 17ffffef     	b	0x42795ac <_ChromeMain+0x4274310>
 42795f4: d4200020     	brk	#0x1
 42795f8: d10103ff     	sub	sp, sp, #0x40
 42795fc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4279600: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4279604: 9100c3fd     	add	x29, sp, #0x30
 4279608: 52800028     	mov	w8, #0x1                ; =1
 427960c: 3901b808     	strb	w8, [x0, #0x6e]
 4279610: 52800128     	mov	w8, #0x9                ; =9
 4279614: 39007fe8     	strb	w8, [sp, #0x1f]
 4279618: 910023e9     	add	x9, sp, #0x8
 427961c: 9100252a     	add	x10, x9, #0x9
 4279620: d004baa8     	adrp	x8, 0xd9cf000 <dyld_stub_binder+0xd9cf000>
 4279624: 91067d08     	add	x8, x8, #0x19f
 4279628: eb08015f     	cmp	x10, x8
 427962c: fa488122     	ccmp	x9, x8, #0x2, hi
 4279630: 54000369     	b.ls	0x427969c <_ChromeMain+0x4274400>
 4279634: aa0003f3     	mov	x19, x0
 4279638: 52800e69     	mov	w9, #0x73               ; =115
 427963c: 790023e9     	strh	w9, [sp, #0x10]
 4279640: f9400108     	ldr	x8, [x8]
 4279644: f90007e8     	str	x8, [sp, #0x8]
 4279648: d100c014     	sub	x20, x0, #0x30
 427964c: 38de7008     	ldursb	w8, [x0, #-0x19]
 4279650: 37f801c8     	tbnz	w8, #0x1f, 0x4279688 <_ChromeMain+0x42743ec>
 4279654: d102a273     	sub	x19, x19, #0xa8
 4279658: 3cc083e0     	ldur	q0, [sp, #0x8]
 427965c: 3d800280     	str	q0, [x20]
 4279660: f9400fe8     	ldr	x8, [sp, #0x18]
 4279664: f9000a88     	str	x8, [x20, #0x10]
 4279668: aa1303e0     	mov	x0, x19
 427966c: 94000096     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4279670: aa1303e0     	mov	x0, x19
 4279674: 940004d6     	bl	0x427a9cc <_ChromeMain+0x4275730>
 4279678: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 427967c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4279680: 910103ff     	add	sp, sp, #0x40
 4279684: d65f03c0     	ret
 4279688: f85d0260     	ldur	x0, [x19, #-0x30]
 427968c: f85e0268     	ldur	x8, [x19, #-0x20]
 4279690: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4279694: 96f63e09     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279698: 17ffffef     	b	0x4279654 <_ChromeMain+0x42743b8>
 427969c: d4200020     	brk	#0x1
 42796a0: d10103ff     	sub	sp, sp, #0x40
 42796a4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 42796a8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 42796ac: 9100c3fd     	add	x29, sp, #0x30
 42796b0: 52800028     	mov	w8, #0x1                ; =1
 42796b4: 3901bc08     	strb	w8, [x0, #0x6f]
 42796b8: 52800188     	mov	w8, #0xc                ; =12
 42796bc: 39007fe8     	strb	w8, [sp, #0x1f]
 42796c0: 910023e9     	add	x9, sp, #0x8
 42796c4: 9100312a     	add	x10, x9, #0xc
 42796c8: d004c548     	adrp	x8, 0xdb23000 <dyld_stub_binder+0xdb23000>
 42796cc: 9110d108     	add	x8, x8, #0x434
 42796d0: eb08015f     	cmp	x10, x8
 42796d4: fa488122     	ccmp	x9, x8, #0x2, hi
 42796d8: 540003a9     	b.ls	0x427974c <_ChromeMain+0x42744b0>
 42796dc: aa0003f3     	mov	x19, x0
 42796e0: 528e4c29     	mov	w9, #0x7261             ; =29281
 42796e4: 72ae6c89     	movk	w9, #0x7364, lsl #16
 42796e8: b90013e9     	str	w9, [sp, #0x10]
 42796ec: f9400108     	ldr	x8, [x8]
 42796f0: f90007e8     	str	x8, [sp, #0x8]
 42796f4: 390053ff     	strb	wzr, [sp, #0x14]
 42796f8: d100c014     	sub	x20, x0, #0x30
 42796fc: 38de7008     	ldursb	w8, [x0, #-0x19]
 4279700: 37f801c8     	tbnz	w8, #0x1f, 0x4279738 <_ChromeMain+0x427449c>
 4279704: d102a273     	sub	x19, x19, #0xa8
 4279708: 3cc083e0     	ldur	q0, [sp, #0x8]
 427970c: 3d800280     	str	q0, [x20]
 4279710: f9400fe8     	ldr	x8, [sp, #0x18]
 4279714: f9000a88     	str	x8, [x20, #0x10]
 4279718: aa1303e0     	mov	x0, x19
 427971c: 9400006a     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4279720: aa1303e0     	mov	x0, x19
 4279724: 940004aa     	bl	0x427a9cc <_ChromeMain+0x4275730>
 4279728: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 427972c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4279730: 910103ff     	add	sp, sp, #0x40
 4279734: d65f03c0     	ret
 4279738: f85d0260     	ldur	x0, [x19, #-0x30]
 427973c: f85e0268     	ldur	x8, [x19, #-0x20]
 4279740: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4279744: 96f63ddd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4279748: 17ffffef     	b	0x4279704 <_ChromeMain+0x4274468>
 427974c: d4200020     	brk	#0x1
 4279750: aa0003e8     	mov	x8, x0
 4279754: f9403c00     	ldr	x0, [x0, #0x78]
 4279758: b40000c0     	cbz	x0, 0x4279770 <_ChromeMain+0x42744d4>
 427975c: 52800029     	mov	w9, #0x1                ; =1
 4279760: b8290009     	ldadd	w9, w9, [x0]
 4279764: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4279768: 6b0a013f     	cmp	w9, w10
 427976c: 540000c0     	b.eq	0x4279784 <_ChromeMain+0x42744e8>
 4279770: f9404108     	ldr	x8, [x8, #0x80]
 4279774: 9102a109     	add	x9, x8, #0xa8
 4279778: f100011f     	cmp	x8, #0x0
 427977c: 9a8903e1     	csel	x1, xzr, x9, eq
 4279780: d65f03c0     	ret
 4279784: d4200000     	brk	#0
 4279788: d4400000     	hlt	#0
 427978c: d4200020     	brk	#0x1
 4279790: d10103ff     	sub	sp, sp, #0x40
 4279794: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4279798: a9037bfd     	stp	x29, x30, [sp, #0x30]
 427979c: 9100c3fd     	add	x29, sp, #0x30
 42797a0: 52800128     	mov	w8, #0x9                ; =9
 42797a4: 39007fe8     	strb	w8, [sp, #0x1f]
 42797a8: 910023e9     	add	x9, sp, #0x8
 42797ac: 9100252a     	add	x10, x9, #0x9
 42797b0: b0046488     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 42797b4: 91104108     	add	x8, x8, #0x410
 42797b8: eb08015f     	cmp	x10, x8
 42797bc: fa488122     	ccmp	x9, x8, #0x2, hi
 42797c0: 54000809     	b.ls	0x42798c0 <_ChromeMain+0x4274624>
 42797c4: aa0003f3     	mov	x19, x0
 42797c8: 52800c89     	mov	w9, #0x64               ; =100
 42797cc: 790023e9     	strh	w9, [sp, #0x10]
 42797d0: f9400108     	ldr	x8, [x8]
 42797d4: f90007e8     	str	x8, [sp, #0x8]
 42797d8: 91016014     	add	x20, x0, #0x58
 42797dc: 39c1bc08     	ldrsb	w8, [x0, #0x6f]
 42797e0: 37f80668     	tbnz	w8, #0x1f, 0x42798ac <_ChromeMain+0x4274610>
 42797e4: 3cc083e0     	ldur	q0, [sp, #0x8]
 42797e8: 3d800280     	str	q0, [x20]
 42797ec: f9400fe8     	ldr	x8, [sp, #0x18]
 42797f0: f9000a88     	str	x8, [x20, #0x10]
 42797f4: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 42797f8: 37f80508     	tbnz	w8, #0x1f, 0x4279898 <_ChromeMain+0x42745fc>
 42797fc: a9097e7f     	stp	xzr, xzr, [x19, #0x90]
 4279800: f80a027f     	stur	xzr, [x19, #0xa0]
 4279804: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 4279808: 37f803c8     	tbnz	w8, #0x1f, 0x4279880 <_ChromeMain+0x42745e4>
 427980c: 3901e27f     	strb	wzr, [x19, #0x78]
 4279810: 39023e7f     	strb	wzr, [x19, #0x8f]
 4279814: 3941be69     	ldrb	w9, [x19, #0x6f]
 4279818: 13001d28     	sxtb	w8, w9
 427981c: f940326a     	ldr	x10, [x19, #0x60]
 4279820: 7100011f     	cmp	w8, #0x0
 4279824: 9a894149     	csel	x9, x10, x9, mi
 4279828: f100253f     	cmp	x9, #0x9
 427982c: 540001a1     	b.ne	0x4279860 <_ChromeMain+0x42745c4>
 4279830: f9400289     	ldr	x9, [x20]
 4279834: 7100011f     	cmp	w8, #0x0
 4279838: 9a944128     	csel	x8, x9, x20, mi
 427983c: f9400109     	ldr	x9, [x8]
 4279840: 39402108     	ldrb	w8, [x8, #0x8]
 4279844: 7101911f     	cmp	w8, #0x64
 4279848: d28eae68     	mov	x8, #0x7573             ; =30067
 427984c: f2ac6c68     	movk	x8, #0x6363, lsl #16
 4279850: f2ccaca8     	movk	x8, #0x6565, lsl #32
 4279854: f2ecac88     	movk	x8, #0x6564, lsl #48
 4279858: fa480120     	ccmp	x9, x8, #0x0, eq
 427985c: 540001a0     	b.eq	0x4279890 <_ChromeMain+0x42745f4>
 4279860: fd403a60     	ldr	d0, [x19, #0x70]
 4279864: fd003a60     	str	d0, [x19, #0x70]
 4279868: aa1303e0     	mov	x0, x19
 427986c: 94000016     	bl	0x42798c4 <_ChromeMain+0x4274628>
 4279870: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4279874: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4279878: 910103ff     	add	sp, sp, #0x40
 427987c: d65f03c0     	ret
 4279880: f9403e68     	ldr	x8, [x19, #0x78]
 4279884: 3900011f     	strb	wzr, [x8]
 4279888: f900427f     	str	xzr, [x19, #0x80]
 427988c: 17ffffe2     	b	0x4279814 <_ChromeMain+0x4274578>
 4279890: 1e6e1000     	fmov	d0, #1.00000000
 4279894: 17fffff4     	b	0x4279864 <_ChromeMain+0x42745c8>
 4279898: f9404a60     	ldr	x0, [x19, #0x90]
 427989c: f9405268     	ldr	x8, [x19, #0xa0]
 42798a0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42798a4: 96f63d85     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42798a8: 17ffffd5     	b	0x42797fc <_ChromeMain+0x4274560>
 42798ac: f9402e60     	ldr	x0, [x19, #0x58]
 42798b0: f9403668     	ldr	x8, [x19, #0x68]
 42798b4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42798b8: 96f63d80     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42798bc: 17ffffca     	b	0x42797e4 <_ChromeMain+0x4274548>
 42798c0: d4200020     	brk	#0x1
