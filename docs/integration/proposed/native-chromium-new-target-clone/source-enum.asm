
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425fe90: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 425fe94: a9017bfd     	stp	x29, x30, [sp, #0x10]
 425fe98: 910043fd     	add	x29, sp, #0x10
 425fe9c: aa0803f3     	mov	x19, x8
 425fea0: 71000c1f     	cmp	w0, #0x3
 425fea4: 5400020c     	b.gt	0x425fee4 <_ChromeMain+0x425ac48>
 425fea8: 7100041f     	cmp	w0, #0x1
 425feac: 5400076c     	b.gt	0x425ff98 <_ChromeMain+0x425acfc>
 425feb0: 340003c0     	cbz	w0, 0x425ff28 <_ChromeMain+0x425ac8c>
 425feb4: 7100041f     	cmp	w0, #0x1
 425feb8: 54000b41     	b.ne	0x4260020 <_ChromeMain+0x425ad84>
 425febc: 528000a8     	mov	w8, #0x5                ; =5
 425fec0: 39005e68     	strb	w8, [x19, #0x17]
 425fec4: 91002a69     	add	x9, x19, #0xa
 425fec8: f004e8c8     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 425fecc: 91134108     	add	x8, x8, #0x4d0
 425fed0: eb08013f     	cmp	x9, x8
 425fed4: fa488262     	ccmp	x19, x8, #0x2, hi
 425fed8: 54001109     	b.ls	0x42600f8 <_ChromeMain+0x425ae5c>
 425fedc: 52800ca9     	mov	w9, #0x65               ; =101
 425fee0: 1400004a     	b	0x4260008 <_ChromeMain+0x425ad6c>
 425fee4: 7100141f     	cmp	w0, #0x5
 425fee8: 5400038d     	b.le	0x425ff58 <_ChromeMain+0x425acbc>
 425feec: 7100181f     	cmp	w0, #0x6
 425fef0: 54000dc0     	b.eq	0x42600a8 <_ChromeMain+0x425ae0c>
 425fef4: 71001c1f     	cmp	w0, #0x7
 425fef8: 54000941     	b.ne	0x4260020 <_ChromeMain+0x425ad84>
 425fefc: 528000c8     	mov	w8, #0x6                ; =6
 425ff00: 39005e68     	strb	w8, [x19, #0x17]
 425ff04: 91003269     	add	x9, x19, #0xc
 425ff08: f004e8c8     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 425ff0c: 9114e108     	add	x8, x8, #0x538
 425ff10: eb08013f     	cmp	x9, x8
 425ff14: fa488262     	ccmp	x19, x8, #0x2, hi
 425ff18: 54000f09     	b.ls	0x42600f8 <_ChromeMain+0x425ae5c>
 425ff1c: 52800ea9     	mov	w9, #0x75               ; =117
 425ff20: 72a00da9     	movk	w9, #0x6d, lsl #16
 425ff24: 1400002b     	b	0x425ffd0 <_ChromeMain+0x425ad34>
 425ff28: 52800068     	mov	w8, #0x3                ; =3
 425ff2c: 39005e68     	strb	w8, [x19, #0x17]
 425ff30: 91001a68     	add	x8, x19, #0x6
 425ff34: f004e8c9     	adrp	x9, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 425ff38: 91132129     	add	x9, x9, #0x4c8
 425ff3c: eb09011f     	cmp	x8, x9
 425ff40: fa498262     	ccmp	x19, x9, #0x2, hi
 425ff44: 54000da9     	b.ls	0x42600f8 <_ChromeMain+0x425ae5c>
 425ff48: d2800828     	mov	x8, #0x41               ; =65
 425ff4c: f2a00e48     	movk	x8, #0x72, lsl #16
 425ff50: f2c00c68     	movk	x8, #0x63, lsl #32
 425ff54: 1400002f     	b	0x4260010 <_ChromeMain+0x425ad74>
 425ff58: 7100101f     	cmp	w0, #0x4
 425ff5c: 54000440     	b.eq	0x425ffe4 <_ChromeMain+0x425ad48>
 425ff60: 7100141f     	cmp	w0, #0x5
 425ff64: 540005e1     	b.ne	0x4260020 <_ChromeMain+0x425ad84>
 425ff68: 52800068     	mov	w8, #0x3                ; =3
 425ff6c: 39005e68     	strb	w8, [x19, #0x17]
 425ff70: 91001a68     	add	x8, x19, #0x6
 425ff74: f004e8c9     	adrp	x9, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 425ff78: 91144929     	add	x9, x9, #0x512
 425ff7c: eb09011f     	cmp	x8, x9
 425ff80: fa498262     	ccmp	x19, x9, #0x2, hi
 425ff84: 54000ba9     	b.ls	0x42600f8 <_ChromeMain+0x425ae5c>
 425ff88: d2800888     	mov	x8, #0x44               ; =68
 425ff8c: f2a00d28     	movk	x8, #0x69, lsl #16
 425ff90: f2c00c28     	movk	x8, #0x61, lsl #32
 425ff94: 1400001f     	b	0x4260010 <_ChromeMain+0x425ad74>
 425ff98: 7100081f     	cmp	w0, #0x2
 425ff9c: 540005e0     	b.eq	0x4260058 <_ChromeMain+0x425adbc>
 425ffa0: 71000c1f     	cmp	w0, #0x3
 425ffa4: 540003e1     	b.ne	0x4260020 <_ChromeMain+0x425ad84>
 425ffa8: 528000c8     	mov	w8, #0x6                ; =6
 425ffac: 39005e68     	strb	w8, [x19, #0x17]
 425ffb0: 91003269     	add	x9, x19, #0xc
 425ffb4: f004e8c8     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 425ffb8: 9113e108     	add	x8, x8, #0x4f8
 425ffbc: eb08013f     	cmp	x9, x8
 425ffc0: fa488262     	ccmp	x19, x8, #0x2, hi
 425ffc4: 540009a9     	b.ls	0x42600f8 <_ChromeMain+0x425ae5c>
 425ffc8: 52800da9     	mov	w9, #0x6d               ; =109
 425ffcc: 72a00ca9     	movk	w9, #0x65, lsl #16
 425ffd0: b9000a69     	str	w9, [x19, #0x8]
 425ffd4: f9400108     	ldr	x8, [x8]
 425ffd8: f9000268     	str	x8, [x19]
 425ffdc: 79001a7f     	strh	wzr, [x19, #0xc]
 425ffe0: 1400000d     	b	0x4260014 <_ChromeMain+0x425ad78>
 425ffe4: 528000a8     	mov	w8, #0x5                ; =5
 425ffe8: 39005e68     	strb	w8, [x19, #0x17]
 425ffec: 91002a69     	add	x9, x19, #0xa
 425fff0: f004e8c8     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 425fff4: 91141908     	add	x8, x8, #0x506
 425fff8: eb08013f     	cmp	x9, x8
 425fffc: fa488262     	ccmp	x19, x8, #0x2, hi
 4260000: 540007c9     	b.ls	0x42600f8 <_ChromeMain+0x425ae5c>
 4260004: 52800e89     	mov	w9, #0x74               ; =116
 4260008: b9000a69     	str	w9, [x19, #0x8]
 426000c: f9400108     	ldr	x8, [x8]
 4260010: f9000268     	str	x8, [x19]
 4260014: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4260018: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 426001c: d65f03c0     	ret
 4260020: 528000e8     	mov	w8, #0x7                ; =7
 4260024: 39005e68     	strb	w8, [x19, #0x17]
 4260028: 91003a69     	add	x9, x19, #0xe
 426002c: d004e8c8     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4260030: 91151908     	add	x8, x8, #0x546
 4260034: eb08013f     	cmp	x9, x8
 4260038: fa488262     	ccmp	x19, x8, #0x2, hi
 426003c: 540005e9     	b.ls	0x42600f8 <_ChromeMain+0x425ae5c>
 4260040: f9400109     	ldr	x9, [x8]
 4260044: f9000269     	str	x9, [x19]
 4260048: f8406108     	ldur	x8, [x8, #0x6]
 426004c: f8006268     	stur	x8, [x19, #0x6]
 4260050: 79001e7f     	strh	wzr, [x19, #0xe]
 4260054: 17fffff0     	b	0x4260014 <_ChromeMain+0x425ad78>
 4260058: 52800400     	mov	w0, #0x20               ; =32
 426005c: 96f6bcc3     	bl	0xf368 <_ChromeMain+0xa0cc>
 4260060: f9000260     	str	x0, [x19]
 4260064: f004e6e8     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4260068: 3dc02d00     	ldr	q0, [x8, #0xb0]
 426006c: 3c808260     	stur	q0, [x19, #0x8]
 4260070: 91006809     	add	x9, x0, #0x1a
 4260074: eb00013f     	cmp	x9, x0
 4260078: 54000403     	b.lo	0x42600f8 <_ChromeMain+0x425ae5c>
 426007c: d004e8c8     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4260080: 91137108     	add	x8, x8, #0x4dc
 4260084: eb08013f     	cmp	x9, x8
 4260088: fa488002     	ccmp	x0, x8, #0x2, hi
 426008c: 54000369     	b.ls	0x42600f8 <_ChromeMain+0x425ae5c>
 4260090: 3dc00100     	ldr	q0, [x8]
 4260094: 3d800000     	str	q0, [x0]
 4260098: 3cc0a100     	ldur	q0, [x8, #0xa]
 426009c: 3c80a000     	stur	q0, [x0, #0xa]
 42600a0: 7900341f     	strh	wzr, [x0, #0x1a]
 42600a4: 17ffffdc     	b	0x4260014 <_ChromeMain+0x425ad78>
 42600a8: 52800400     	mov	w0, #0x20               ; =32
 42600ac: 96f6bcaf     	bl	0xf368 <_ChromeMain+0xa0cc>
 42600b0: f9000260     	str	x0, [x19]
 42600b4: 9004e708     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 42600b8: 3dc0b900     	ldr	q0, [x8, #0x2e0]
 42600bc: 3c808260     	stur	q0, [x19, #0x8]
 42600c0: 91007009     	add	x9, x0, #0x1c
 42600c4: eb00013f     	cmp	x9, x0
 42600c8: 54000183     	b.lo	0x42600f8 <_ChromeMain+0x425ae5c>
 42600cc: d004e8c8     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 42600d0: 91146908     	add	x8, x8, #0x51a
 42600d4: eb08013f     	cmp	x9, x8
 42600d8: fa488002     	ccmp	x0, x8, #0x2, hi
 42600dc: 540000e9     	b.ls	0x42600f8 <_ChromeMain+0x425ae5c>
 42600e0: 3dc00100     	ldr	q0, [x8]
 42600e4: 3d800000     	str	q0, [x0]
 42600e8: 3cc0c100     	ldur	q0, [x8, #0xc]
 42600ec: 3c80c000     	stur	q0, [x0, #0xc]
 42600f0: 7900381f     	strh	wzr, [x0, #0x1c]
 42600f4: 17ffffc8     	b	0x4260014 <_ChromeMain+0x425ad78>
 42600f8: d4200020     	brk	#0x1
