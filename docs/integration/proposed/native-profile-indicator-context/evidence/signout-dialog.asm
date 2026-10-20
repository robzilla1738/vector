
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4571fe4: d10643ff     	sub	sp, sp, #0x190
 4571fe8: a9136ffc     	stp	x28, x27, [sp, #0x130]
 4571fec: a91467fa     	stp	x26, x25, [sp, #0x140]
 4571ff0: a9155ff8     	stp	x24, x23, [sp, #0x150]
 4571ff4: a91657f6     	stp	x22, x21, [sp, #0x160]
 4571ff8: a9174ff4     	stp	x20, x19, [sp, #0x170]
 4571ffc: a9187bfd     	stp	x29, x30, [sp, #0x180]
 4572000: 910603fd     	add	x29, sp, #0x180
 4572004: aa0003f4     	mov	x20, x0
 4572008: f9400018     	ldr	x24, [x0]
 457200c: b40000b8     	cbz	x24, 0x4572020 <_ChromeMain+0x456cd84>
 4572010: aa0103f3     	mov	x19, x1
 4572014: f9403700     	ldr	x0, [x24, #0x68]
 4572018: 97ee342d     	bl	0x40ff0cc <_ChromeMain+0x40f9e30>
 457201c: 37000140     	tbnz	w0, #0x0, 0x4572044 <_ChromeMain+0x456cda8>
 4572020: aa1403e0     	mov	x0, x20
 4572024: a9587bfd     	ldp	x29, x30, [sp, #0x180]
 4572028: a9574ff4     	ldp	x20, x19, [sp, #0x170]
 457202c: a95657f6     	ldp	x22, x21, [sp, #0x160]
 4572030: a9555ff8     	ldp	x24, x23, [sp, #0x150]
 4572034: a95467fa     	ldp	x26, x25, [sp, #0x140]
 4572038: a9536ffc     	ldp	x28, x27, [sp, #0x130]
 457203c: 910643ff     	add	sp, sp, #0x190
 4572040: 17fff062     	b	0x456e1c8 <_ChromeMain+0x4568f2c>
 4572044: 910263fa     	add	x26, sp, #0x98
 4572048: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 457204c: f81903bf     	stur	xzr, [x29, #-0x70]
 4572050: 90054ba8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4572054: f9467d00     	ldr	x0, [x8, #0xcf8]
 4572058: b4000400     	cbz	x0, 0x45720d8 <_ChromeMain+0x456ce3c>
 457205c: 9752b6c7     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4572060: b40003c0     	cbz	x0, 0x45720d8 <_ChromeMain+0x456ce3c>
 4572064: 9752b6eb     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4572068: aa1303e1     	mov	x1, x19
 457206c: 9752b725     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4572070: b4000340     	cbz	x0, 0x45720d8 <_ChromeMain+0x456ce3c>
 4572074: aa0003f5     	mov	x21, x0
 4572078: 910263e8     	add	x8, sp, #0x98
 457207c: 97efa223     	bl	0x415a908 <_ChromeMain+0x415566c>
 4572080: f94057e8     	ldr	x8, [sp, #0xa8]
 4572084: f81903a8     	stur	x8, [x29, #-0x70]
 4572088: 3cc983e0     	ldur	q0, [sp, #0x98]
 457208c: 3c868340     	stur	q0, [x26, #0x68]
 4572090: d378fd08     	lsr	x8, x8, #56
 4572094: 13001d16     	sxtb	w22, w8
 4572098: f85883a9     	ldur	x9, [x29, #-0x78]
 457209c: 710002df     	cmp	w22, #0x0
 45720a0: 9a884128     	csel	x8, x9, x8, mi
 45720a4: b50001a8     	cbnz	x8, 0x45720d8 <_ChromeMain+0x456ce3c>
 45720a8: 910263e8     	add	x8, sp, #0x98
 45720ac: aa1503e0     	mov	x0, x21
 45720b0: 977258b4     	bl	0x2208380 <_ChromeMain+0x22030e4>
 45720b4: 36f800b6     	tbz	w22, #0x1f, 0x45720c8 <_ChromeMain+0x456ce2c>
 45720b8: f85803a0     	ldur	x0, [x29, #-0x80]
 45720bc: f85903a8     	ldur	x8, [x29, #-0x70]
 45720c0: d37ff901     	lsl	x1, x8, #1
 45720c4: 96ea5b7d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45720c8: 3cc983e0     	ldur	q0, [sp, #0x98]
 45720cc: 3c868340     	stur	q0, [x26, #0x68]
 45720d0: f94057e8     	ldr	x8, [sp, #0xa8]
 45720d4: f81903a8     	stur	x8, [x29, #-0x70]
 45720d8: aa1403e0     	mov	x0, x20
 45720dc: 97fff03b     	bl	0x456e1c8 <_ChromeMain+0x4568f2c>
 45720e0: 52800c00     	mov	w0, #0x60               ; =96
 45720e4: 96ea74a1     	bl	0xf368 <_ChromeMain+0xa0cc>
 45720e8: 91017008     	add	x8, x0, #0x5c
 45720ec: eb00011f     	cmp	x8, x0
 45720f0: 54002903     	b.lo	0x4572610 <_ChromeMain+0x456d374>
 45720f4: aa0003f6     	mov	x22, x0
 45720f8: 9004d0a9     	adrp	x9, 0xdf86000 <dyld_stub_binder+0xdf86000>
 45720fc: 913b7129     	add	x9, x9, #0xedc
 4572100: eb09011f     	cmp	x8, x9
 4572104: fa498002     	ccmp	x0, x9, #0x2, hi
 4572108: 54002849     	b.ls	0x4572610 <_ChromeMain+0x456d374>
 457210c: 92800228     	mov	x8, #-0x12              ; =-18
 4572110: f2efffe8     	movk	x8, #0x7fff, lsl #48
 4572114: 3dc01120     	ldr	q0, [x9, #0x40]
 4572118: 3d8012c0     	str	q0, [x22, #0x40]
 457211c: 3cc4c120     	ldur	q0, [x9, #0x4c]
 4572120: 3c84c2c0     	stur	q0, [x22, #0x4c]
 4572124: ad400520     	ldp	q0, q1, [x9]
 4572128: ad0006c0     	stp	q0, q1, [x22]
 457212c: ad410520     	ldp	q0, q1, [x9, #0x20]
 4572130: ad0106c0     	stp	q0, q1, [x22, #0x20]
 4572134: 385973a9     	ldurb	w9, [x29, #-0x69]
 4572138: 13001d39     	sxtb	w25, w9
 457213c: f85883aa     	ldur	x10, [x29, #-0x78]
 4572140: 7100033f     	cmp	w25, #0x0
 4572144: 9a89415b     	csel	x27, x10, x9, mi
 4572148: 7900badf     	strh	wzr, [x22, #0x5c]
 457214c: b4000a1b     	cbz	x27, 0x457228c <_ChromeMain+0x456cff0>
 4572150: f85803a9     	ldur	x9, [x29, #-0x80]
 4572154: 7100033f     	cmp	w25, #0x0
 4572158: d10203aa     	sub	x10, x29, #0x80
 457215c: 9a8a4135     	csel	x21, x9, x10, mi
 4572160: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 4572164: f9004fff     	str	xzr, [sp, #0x98]
 4572168: 91000777     	add	x23, x27, #0x1
 457216c: eb0802ff     	cmp	x23, x8
 4572170: 54002528     	b.hi	0x4572614 <_ChromeMain+0x456d378>
 4572174: f1002aff     	cmp	x23, #0xa
 4572178: 54000669     	b.ls	0x4572244 <_ChromeMain+0x456cfa8>
 457217c: 927deefc     	and	x28, x23, #0x7ffffffffffffff8
 4572180: d37ffb88     	lsl	x8, x28, #1
 4572184: 91004100     	add	x0, x8, #0x10
 4572188: 96ea7478     	bl	0xf368 <_ChromeMain+0xa0cc>
 457218c: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 4572190: cb080388     	sub	x8, x28, x8
 4572194: a909dfe0     	stp	x0, x23, [sp, #0x98]
 4572198: f90057e8     	str	x8, [sp, #0xa8]
 457219c: 91000817     	add	x23, x0, #0x2
 45721a0: eb0002ff     	cmp	x23, x0
 45721a4: 54002363     	b.lo	0x4572610 <_ChromeMain+0x456d374>
 45721a8: 9004d0a8     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 45721ac: 913ce908     	add	x8, x8, #0xf3a
 45721b0: eb0802ff     	cmp	x23, x8
 45721b4: fa488002     	ccmp	x0, x8, #0x2, hi
 45721b8: 540022c9     	b.ls	0x4572610 <_ChromeMain+0x456d374>
 45721bc: 52800448     	mov	w8, #0x22               ; =34
 45721c0: 79000008     	strh	w8, [x0]
 45721c4: 8b1b06e8     	add	x8, x23, x27, lsl #1
 45721c8: eb17011f     	cmp	x8, x23
 45721cc: 54002223     	b.lo	0x4572610 <_ChromeMain+0x456d374>
 45721d0: eb1502ff     	cmp	x23, x21
 45721d4: 54000068     	b.hi	0x45721e0 <_ChromeMain+0x456cf44>
 45721d8: eb15011f     	cmp	x8, x21
 45721dc: 540021a8     	b.hi	0x4572610 <_ChromeMain+0x456d374>
 45721e0: d37ffb62     	lsl	x2, x27, #1
 45721e4: aa1703e0     	mov	x0, x23
 45721e8: aa1503e1     	mov	x1, x21
 45721ec: 94ea7438     	bl	0x800f2cc <_ChromeMain+0x800a030>
 45721f0: 783b7aff     	strh	wzr, [x23, x27, lsl #1]
 45721f4: 9004d0a1     	adrp	x1, 0xdf86000 <dyld_stub_binder+0xdf86000>
 45721f8: 913cf821     	add	x1, x1, #0xf3e
 45721fc: 910263e0     	add	x0, sp, #0x98
 4572200: 52800462     	mov	w2, #0x23               ; =35
 4572204: 971a9079     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 4572208: a9407015     	ldp	x21, x28, [x0]
 457220c: f940081b     	ldr	x27, [x0, #0x10]
 4572210: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4572214: f900001f     	str	xzr, [x0]
 4572218: aa1603e0     	mov	x0, x22
 457221c: 52800c01     	mov	w1, #0x60               ; =96
 4572220: 96ea5b26     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4572224: 39c2bfe8     	ldrsb	w8, [sp, #0xaf]
 4572228: 36f800a8     	tbz	w8, #0x1f, 0x457223c <_ChromeMain+0x456cfa0>
 457222c: f9404fe0     	ldr	x0, [sp, #0x98]
 4572230: f94057e8     	ldr	x8, [sp, #0xa8]
 4572234: d37ff901     	lsl	x1, x8, #1
 4572238: 96ea5b20     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 457223c: aa1503f6     	mov	x22, x21
 4572240: 14000015     	b	0x4572294 <_ChromeMain+0x456cff8>
 4572244: 3902bff7     	strb	w23, [sp, #0xaf]
 4572248: 910263e0     	add	x0, sp, #0x98
 457224c: 17ffffd4     	b	0x457219c <_ChromeMain+0x456cf00>
 4572250: f9400ea0     	ldr	x0, [x21, #0x18]
 4572254: f94016a8     	ldr	x8, [x21, #0x28]
 4572258: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 457225c: 96ea5b17     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4572260: 14000025     	b	0x45722f4 <_ChromeMain+0x456d058>
 4572264: f94032a0     	ldr	x0, [x21, #0x60]
 4572268: f9403aa8     	ldr	x8, [x21, #0x70]
 457226c: d37ff901     	lsl	x1, x8, #1
 4572270: 96ea5b12     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4572274: 1400003c     	b	0x4572364 <_ChromeMain+0x456d0c8>
 4572278: f9401aa0     	ldr	x0, [x21, #0x30]
 457227c: f94022a8     	ldr	x8, [x21, #0x40]
 4572280: d37ff901     	lsl	x1, x8, #1
 4572284: 96ea5b0d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4572288: 14000031     	b	0x457234c <_ChromeMain+0x456d0b0>
 457228c: 9101091b     	add	x27, x8, #0x42
 4572290: 528005dc     	mov	w28, #0x2e              ; =46
 4572294: 5280a700     	mov	w0, #0x538              ; =1336
 4572298: 96ea7434     	bl	0xf368 <_ChromeMain+0xa0cc>
 457229c: aa0003f5     	mov	x21, x0
 45722a0: d2800001     	mov	x1, #0x0                ; =0
 45722a4: 951f1c72     	bl	0x8d3946c <_ChromeMain+0x8d341d0>
 45722a8: f81783a0     	stur	x0, [x29, #-0x88]
 45722ac: 52800400     	mov	w0, #0x20               ; =32
 45722b0: 96ea742e     	bl	0xf368 <_ChromeMain+0xa0cc>
 45722b4: 91007409     	add	x9, x0, #0x1d
 45722b8: eb00013f     	cmp	x9, x0
 45722bc: 54001aa3     	b.lo	0x4572610 <_ChromeMain+0x456d374>
 45722c0: aa0003f7     	mov	x23, x0
 45722c4: 9004caa8     	adrp	x8, 0xdec6000 <dyld_stub_binder+0xdec6000>
 45722c8: 910b1108     	add	x8, x8, #0x2c4
 45722cc: eb08013f     	cmp	x9, x8
 45722d0: fa488002     	ccmp	x0, x8, #0x2, hi
 45722d4: 540019e9     	b.ls	0x4572610 <_ChromeMain+0x456d374>
 45722d8: 3dc00100     	ldr	q0, [x8]
 45722dc: 3d8002e0     	str	q0, [x23]
 45722e0: 3cc0d100     	ldur	q0, [x8, #0xd]
 45722e4: 3c80d2e0     	stur	q0, [x23, #0xd]
 45722e8: 390076ff     	strb	wzr, [x23, #0x1d]
 45722ec: 39c0bea8     	ldrsb	w8, [x21, #0x2f]
 45722f0: 37fffb08     	tbnz	w8, #0x1f, 0x4572250 <_ChromeMain+0x456cfb4>
 45722f4: f9000eb7     	str	x23, [x21, #0x18]
 45722f8: 9004ce48     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45722fc: 3dc2cd00     	ldr	q0, [x8, #0xb30]
 4572300: 3d800aa0     	str	q0, [x21, #0x20]
 4572304: 52800400     	mov	w0, #0x20               ; =32
 4572308: 96ea7418     	bl	0xf368 <_ChromeMain+0xa0cc>
 457230c: 91007809     	add	x9, x0, #0x1e
 4572310: eb00013f     	cmp	x9, x0
 4572314: 540017e3     	b.lo	0x4572610 <_ChromeMain+0x456d374>
 4572318: aa0003f7     	mov	x23, x0
 457231c: 9004d0a8     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 4572320: 913e1908     	add	x8, x8, #0xf86
 4572324: eb08013f     	cmp	x9, x8
 4572328: fa488002     	ccmp	x0, x8, #0x2, hi
 457232c: 54001729     	b.ls	0x4572610 <_ChromeMain+0x456d374>
 4572330: 3dc00100     	ldr	q0, [x8]
 4572334: 3d8002e0     	str	q0, [x23]
 4572338: 3cc0e100     	ldur	q0, [x8, #0xe]
 457233c: 3c80e2e0     	stur	q0, [x23, #0xe]
 4572340: 79003eff     	strh	wzr, [x23, #0x1e]
 4572344: 39c11ea8     	ldrsb	w8, [x21, #0x47]
 4572348: 37fff988     	tbnz	w8, #0x1f, 0x4572278 <_ChromeMain+0x456cfdc>
 457234c: f9001ab7     	str	x23, [x21, #0x30]
 4572350: b004ce68     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4572354: 3dc04100     	ldr	q0, [x8, #0x100]
 4572358: 3c8382a0     	stur	q0, [x21, #0x38]
 457235c: 39c1dea8     	ldrsb	w8, [x21, #0x77]
 4572360: 37fff828     	tbnz	w8, #0x1f, 0x4572264 <_ChromeMain+0x456cfc8>
 4572364: a90672b6     	stp	x22, x28, [x21, #0x60]
 4572368: f9003abb     	str	x27, [x21, #0x70]
 457236c: f940c696     	ldr	x22, [x20, #0x188]
 4572370: b40000d6     	cbz	x22, 0x4572388 <_ChromeMain+0x456d0ec>
 4572374: 52800028     	mov	w8, #0x1                ; =1
 4572378: b82802c8     	ldadd	w8, w8, [x22]
 457237c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4572380: 6b09011f     	cmp	w8, w9
 4572384: 540014a0     	b.eq	0x4572618 <_ChromeMain+0x456d37c>
 4572388: f940ca97     	ldr	x23, [x20, #0x190]
 457238c: 52800b00     	mov	w0, #0x58               ; =88
 4572390: 96ea73f6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4572394: aa0003f4     	mov	x20, x0
 4572398: 52800028     	mov	w8, #0x1                ; =1
 457239c: b9000008     	str	w8, [x0]
 45723a0: b0ffcfe8     	adrp	x8, 0x3f6f000 <_ChromeMain+0x3f69d64>
 45723a4: 91210108     	add	x8, x8, #0x840
 45723a8: 90ffd7c9     	adrp	x9, 0x406a000 <_ChromeMain+0x4064d64>
 45723ac: 913a0129     	add	x9, x9, #0xe80
 45723b0: a900a408     	stp	x8, x9, [x0, #0x8]
 45723b4: 90ffd9e8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 45723b8: 911b0108     	add	x8, x8, #0x6c0
 45723bc: 100013a9     	adr	x9, 0x4572630 <_ChromeMain+0x456d394>
 45723c0: d503201f     	nop
 45723c4: a901a408     	stp	x8, x9, [x0, #0x18]
 45723c8: a902d81f     	stp	xzr, x22, [x0, #0x28]
 45723cc: f9001c17     	str	x23, [x0, #0x38]
 45723d0: 39c05e68     	ldrsb	w8, [x19, #0x17]
 45723d4: 37f80a68     	tbnz	w8, #0x1f, 0x4572520 <_ChromeMain+0x456d284>
 45723d8: 3dc00260     	ldr	q0, [x19]
 45723dc: 3c840280     	stur	q0, [x20, #0x40]
 45723e0: f9400a68     	ldr	x8, [x19, #0x10]
 45723e4: f8050288     	stur	x8, [x20, #0x50]
 45723e8: f81683b4     	stur	x20, [x29, #-0x98]
 45723ec: 52800034     	mov	w20, #0x1               ; =1
 45723f0: 381703b4     	sturb	w20, [x29, #-0x90]
 45723f4: 390263f4     	strb	w20, [sp, #0x98]
 45723f8: 390313ff     	strb	wzr, [sp, #0xc4]
 45723fc: 6f00e400     	movi.2d	v0, #0000000000000000
 4572400: 3c808340     	stur	q0, [x26, #0x8]
 4572404: 3c818340     	stur	q0, [x26, #0x18]
 4572408: 390303ff     	strb	wzr, [sp, #0xc0]
 457240c: 390323f4     	strb	w20, [sp, #0xc8]
 4572410: a90dffff     	stp	xzr, xzr, [sp, #0xd8]
 4572414: 528000d3     	mov	w19, #0x6               ; =6
 4572418: 910203e9     	add	x9, sp, #0x80
 457241c: 9100312a     	add	x10, x9, #0xc
 4572420: f9006bff     	str	xzr, [sp, #0xd0]
 4572424: 9004d0a8     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 4572428: 913e9908     	add	x8, x8, #0xfa6
 457242c: eb08015f     	cmp	x10, x8
 4572430: fa488122     	ccmp	x9, x8, #0x2, hi
 4572434: 39025ff3     	strb	w19, [sp, #0x97]
 4572438: 54000ec9     	b.ls	0x4572610 <_ChromeMain+0x456d374>
 457243c: 52800e89     	mov	w9, #0x74               ; =116
 4572440: 72a00ca9     	movk	w9, #0x65, lsl #16
 4572444: b9008be9     	str	w9, [sp, #0x88]
 4572448: f9400108     	ldr	x8, [x8]
 457244c: f90043e8     	str	x8, [sp, #0x80]
 4572450: 79011bff     	strh	wzr, [sp, #0x8c]
 4572454: 910263e0     	add	x0, sp, #0x98
 4572458: 910203e1     	add	x1, sp, #0x80
 457245c: 951f1a86     	bl	0x8d38e74 <_ChromeMain+0x8d33bd8>
 4572460: aa0003e2     	mov	x2, x0
 4572464: d10223a0     	sub	x0, x29, #0x88
 4572468: d10263a1     	sub	x1, x29, #0x98
 457246c: 951f1b32     	bl	0x8d39134 <_ChromeMain+0x8d33e98>
 4572470: 390083f4     	strb	w20, [sp, #0x20]
 4572474: 390143f4     	strb	w20, [sp, #0x50]
 4572478: 910023e9     	add	x9, sp, #0x8
 457247c: 9004d0a8     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 4572480: 913ad108     	add	x8, x8, #0xeb4
 4572484: 9100312a     	add	x10, x9, #0xc
 4572488: eb08015f     	cmp	x10, x8
 457248c: 3901e3ff     	strb	wzr, [sp, #0x78]
 4572490: 390133ff     	strb	wzr, [sp, #0x4c]
 4572494: 6f00e400     	movi.2d	v0, #0000000000000000
 4572498: 3c8283e0     	stur	q0, [sp, #0x28]
 457249c: 3c8383e0     	stur	q0, [sp, #0x38]
 45724a0: 390123ff     	strb	wzr, [sp, #0x48]
 45724a4: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 45724a8: f9002fff     	str	xzr, [sp, #0x58]
 45724ac: fa488122     	ccmp	x9, x8, #0x2, hi
 45724b0: 39007ff3     	strb	w19, [sp, #0x1f]
 45724b4: 54000ae9     	b.ls	0x4572610 <_ChromeMain+0x456d374>
 45724b8: 52800ca9     	mov	w9, #0x65               ; =101
 45724bc: 72a00d89     	movk	w9, #0x6c, lsl #16
 45724c0: b90013e9     	str	w9, [sp, #0x10]
 45724c4: f9400108     	ldr	x8, [x8]
 45724c8: f90007e8     	str	x8, [sp, #0x8]
 45724cc: 79002bff     	strh	wzr, [sp, #0x14]
 45724d0: 910083e0     	add	x0, sp, #0x20
 45724d4: 910023e1     	add	x1, sp, #0x8
 45724d8: 951f1a67     	bl	0x8d38e74 <_ChromeMain+0x8d33bd8>
 45724dc: aa0003e2     	mov	x2, x0
 45724e0: d10223a0     	sub	x0, x29, #0x88
 45724e4: 9101c3e1     	add	x1, sp, #0x70
 45724e8: 951f1b75     	bl	0x8d392bc <_ChromeMain+0x8d34020>
 45724ec: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 45724f0: 36f800a8     	tbz	w8, #0x1f, 0x4572504 <_ChromeMain+0x456d268>
 45724f4: f94007e0     	ldr	x0, [sp, #0x8]
 45724f8: f9400fe8     	ldr	x8, [sp, #0x18]
 45724fc: d37ff901     	lsl	x1, x8, #1
 4572500: 96ea5a6e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4572504: 910083e0     	add	x0, sp, #0x20
 4572508: 951f1a3b     	bl	0x8d38df4 <_ChromeMain+0x8d33b58>
 457250c: 3941e3e8     	ldrb	w8, [sp, #0x78]
 4572510: 7100051f     	cmp	w8, #0x1
 4572514: 540000ec     	b.gt	0x4572530 <_ChromeMain+0x456d294>
 4572518: 35000108     	cbnz	w8, 0x4572538 <_ChromeMain+0x456d29c>
 457251c: 14000009     	b	0x4572540 <_ChromeMain+0x456d2a4>
 4572520: a9400a61     	ldp	x1, x2, [x19]
 4572524: 91010280     	add	x0, x20, #0x40
 4572528: 96ea973c     	bl	0x18218 <_ChromeMain+0x12f7c>
 457252c: 17ffffaf     	b	0x45723e8 <_ChromeMain+0x456d14c>
 4572530: 7100091f     	cmp	w8, #0x2
 4572534: 54000061     	b.ne	0x4572540 <_ChromeMain+0x456d2a4>
 4572538: f9403be0     	ldr	x0, [sp, #0x70]
 457253c: b50005c0     	cbnz	x0, 0x45725f4 <_ChromeMain+0x456d358>
 4572540: 52801fe8     	mov	w8, #0xff               ; =255
 4572544: 3901e3e8     	strb	w8, [sp, #0x78]
 4572548: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 457254c: 36f800a8     	tbz	w8, #0x1f, 0x4572560 <_ChromeMain+0x456d2c4>
 4572550: f94043e0     	ldr	x0, [sp, #0x80]
 4572554: f9404be8     	ldr	x8, [sp, #0x90]
 4572558: d37ff901     	lsl	x1, x8, #1
 457255c: 96ea5a57     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4572560: 910263e0     	add	x0, sp, #0x98
 4572564: 951f1a24     	bl	0x8d38df4 <_ChromeMain+0x8d33b58>
 4572568: 385703a8     	ldurb	w8, [x29, #-0x90]
 457256c: 7100051f     	cmp	w8, #0x1
 4572570: 5400008d     	b.le	0x4572580 <_ChromeMain+0x456d2e4>
 4572574: 7100091f     	cmp	w8, #0x2
 4572578: 540000a1     	b.ne	0x457258c <_ChromeMain+0x456d2f0>
 457257c: 14000002     	b	0x4572584 <_ChromeMain+0x456d2e8>
 4572580: 34000068     	cbz	w8, 0x457258c <_ChromeMain+0x456d2f0>
 4572584: f85683a0     	ldur	x0, [x29, #-0x98]
 4572588: b5000280     	cbnz	x0, 0x45725d8 <_ChromeMain+0x456d33c>
 457258c: 52801fe8     	mov	w8, #0xff               ; =255
 4572590: 381703a8     	sturb	w8, [x29, #-0x90]
 4572594: b4000495     	cbz	x21, 0x4572624 <_ChromeMain+0x456d388>
 4572598: 9100a300     	add	x0, x24, #0x28
 457259c: aa1503e1     	mov	x1, x21
 45725a0: 95b4b271     	bl	0xb29ef64 <_ChromeMain+0xb299cc8>
 45725a4: 36f800b9     	tbz	w25, #0x1f, 0x45725b8 <_ChromeMain+0x456d31c>
 45725a8: f85803a0     	ldur	x0, [x29, #-0x80]
 45725ac: f85903a8     	ldur	x8, [x29, #-0x70]
 45725b0: d37ff901     	lsl	x1, x8, #1
 45725b4: 96ea5a41     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45725b8: a9587bfd     	ldp	x29, x30, [sp, #0x180]
 45725bc: a9574ff4     	ldp	x20, x19, [sp, #0x170]
 45725c0: a95657f6     	ldp	x22, x21, [sp, #0x160]
 45725c4: a9555ff8     	ldp	x24, x23, [sp, #0x150]
 45725c8: a95467fa     	ldp	x26, x25, [sp, #0x140]
 45725cc: a9536ffc     	ldp	x28, x27, [sp, #0x130]
 45725d0: 910643ff     	add	sp, sp, #0x190
 45725d4: d65f03c0     	ret
 45725d8: 12800008     	mov	w8, #-0x1               ; =-1
 45725dc: b8e80008     	ldaddal	w8, w8, [x0]
 45725e0: 7100051f     	cmp	w8, #0x1
 45725e4: 54fffd41     	b.ne	0x457258c <_ChromeMain+0x456d2f0>
 45725e8: f9400808     	ldr	x8, [x0, #0x10]
 45725ec: d63f0100     	blr	x8
 45725f0: 17ffffe7     	b	0x457258c <_ChromeMain+0x456d2f0>
 45725f4: 12800008     	mov	w8, #-0x1               ; =-1
 45725f8: b8e80008     	ldaddal	w8, w8, [x0]
 45725fc: 7100051f     	cmp	w8, #0x1
 4572600: 54fffa01     	b.ne	0x4572540 <_ChromeMain+0x456d2a4>
 4572604: f9400808     	ldr	x8, [x0, #0x10]
 4572608: d63f0100     	blr	x8
 457260c: 17ffffcd     	b	0x4572540 <_ChromeMain+0x456d2a4>
 4572610: d4200020     	brk	#0x1
 4572614: 941ec6e5     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 4572618: d4200000     	brk	#0
 457261c: d4400000     	hlt	#0
 4572620: d4200020     	brk	#0x1
 4572624: d4200000     	brk	#0
 4572628: d4400000     	hlt	#0
 457262c: d4200020     	brk	#0x1
 4572630: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4572634: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4572638: 910043fd     	add	x29, sp, #0x10
 457263c: aa0103f3     	mov	x19, x1
 4572640: f9400008     	ldr	x8, [x0]
 4572644: b4000288     	cbz	x8, 0x4572694 <_ChromeMain+0x456d3f8>
 4572648: f9403514     	ldr	x20, [x8, #0x68]
 457264c: 52800500     	mov	w0, #0x28               ; =40
 4572650: 96ea7346     	bl	0xf368 <_ChromeMain+0xa0cc>
 4572654: aa0003e2     	mov	x2, x0
 4572658: 52800028     	mov	w8, #0x1                ; =1
 457265c: b9000008     	str	w8, [x0]
 4572660: 90fdd508     	adrp	x8, 0x12000 <_ChromeMain+0xcd64>
 4572664: 91370108     	add	x8, x8, #0xdc0
 4572668: b0fe5569     	adrp	x9, 0x101f000 <_ChromeMain+0x1019d64>
 457266c: 91180129     	add	x9, x9, #0x600
 4572670: a900a408     	stp	x8, x9, [x0, #0x8]
 4572674: f0feff48     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4572678: 912c0108     	add	x8, x8, #0xb00
 457267c: f9000c08     	str	x8, [x0, #0x18]
 4572680: aa1303e0     	mov	x0, x19
 4572684: aa1403e1     	mov	x1, x20
 4572688: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 457268c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4572690: 17ee32f0     	b	0x40ff250 <_ChromeMain+0x40f9fb4>
 4572694: d2800014     	mov	x20, #0x0               ; =0
 4572698: 17ffffed     	b	0x457264c <_ChromeMain+0x456d3b0>
