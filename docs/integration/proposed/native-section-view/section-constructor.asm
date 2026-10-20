
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4662010: d10503ff     	sub	sp, sp, #0x140
 4662014: a90e6ffc     	stp	x28, x27, [sp, #0xe0]
 4662018: a90f67fa     	stp	x26, x25, [sp, #0xf0]
 466201c: a9105ff8     	stp	x24, x23, [sp, #0x100]
 4662020: a91157f6     	stp	x22, x21, [sp, #0x110]
 4662024: a9124ff4     	stp	x20, x19, [sp, #0x120]
 4662028: a9137bfd     	stp	x29, x30, [sp, #0x130]
 466202c: 9104c3fd     	add	x29, sp, #0x130
 4662030: aa0703f4     	mov	x20, x7
 4662034: aa0603f8     	mov	x24, x6
 4662038: aa0503f5     	mov	x21, x5
 466203c: aa0403fa     	mov	x26, x4
 4662040: aa0303f9     	mov	x25, x3
 4662044: b9000fe2     	str	w2, [sp, #0xc]
 4662048: aa0103f6     	mov	x22, x1
 466204c: aa0003f3     	mov	x19, x0
 4662050: 9734343c     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4662054: f0050608     	adrp	x8, 0xe725000 <dyld_stub_binder+0xe725000>
 4662058: 910ac108     	add	x8, x8, #0x2b0
 466205c: 910fa109     	add	x9, x8, #0x3e8
 4662060: a9002408     	stp	x8, x9, [x0]
 4662064: 91104109     	add	x9, x8, #0x410
 4662068: f9000809     	str	x9, [x0, #0x10]
 466206c: 91112109     	add	x9, x8, #0x448
 4662070: 9111e10a     	add	x10, x8, #0x478
 4662074: a906a809     	stp	x9, x10, [x0, #0x68]
 4662078: 91132109     	add	x9, x8, #0x4c8
 466207c: f9005809     	str	x9, [x0, #0xb0]
 4662080: 9114a109     	add	x9, x8, #0x528
 4662084: f9006c09     	str	x9, [x0, #0xd8]
 4662088: 91156108     	add	x8, x8, #0x558
 466208c: f9007c08     	str	x8, [x0, #0xf8]
 4662090: 6f00e400     	movi.2d	v0, #0000000000000000
 4662094: 3d80c400     	str	q0, [x0, #0x310]
 4662098: 52802800     	mov	w0, #0x140              ; =320
 466209c: 96e6b4b3     	bl	0xf368 <_ChromeMain+0xa0cc>
 46620a0: aa0003fb     	mov	x27, x0
 46620a4: 978eb94b     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 46620a8: aa1303e0     	mov	x0, x19
 46620ac: aa1b03e1     	mov	x1, x27
 46620b0: 97549de2     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 46620b4: b940f368     	ldr	w8, [x27, #0xf0]
 46620b8: 7100051f     	cmp	w8, #0x1
 46620bc: 54005bc1     	b.ne	0x4662c34 <_ChromeMain+0x465d998>
 46620c0: 52800068     	mov	w8, #0x3                ; =3
 46620c4: b90073e8     	str	w8, [sp, #0x70]
 46620c8: f0051d01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46620cc: 9115a021     	add	x1, x1, #0x568
 46620d0: 91046360     	add	x0, x27, #0x118
 46620d4: 9101c3e2     	add	x2, sp, #0x70
 46620d8: 97500c33     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 46620dc: b940fb68     	ldr	w8, [x27, #0xf8]
 46620e0: 6b1a011f     	cmp	w8, w26
 46620e4: 54005fe1     	b.ne	0x4662ce0 <_ChromeMain+0x465da44>
 46620e8: d360ff48     	lsr	x8, x26, #32
 46620ec: b940ff69     	ldr	w9, [x27, #0xfc]
 46620f0: 6b08013f     	cmp	w9, w8
 46620f4: 54005f61     	b.ne	0x4662ce0 <_ChromeMain+0x465da44>
 46620f8: b9410368     	ldr	w8, [x27, #0x100]
 46620fc: 6b15011f     	cmp	w8, w21
 4662100: 54005f01     	b.ne	0x4662ce0 <_ChromeMain+0x465da44>
 4662104: b9410768     	ldr	w8, [x27, #0x104]
 4662108: d360fea9     	lsr	x9, x21, #32
 466210c: 6b09011f     	cmp	w8, w9
 4662110: 54005e81     	b.ne	0x4662ce0 <_ChromeMain+0x465da44>
 4662114: b94013b5     	ldr	w21, [x29, #0x10]
 4662118: 39444768     	ldrb	w8, [x27, #0x111]
 466211c: 370000c8     	tbnz	w8, #0x0, 0x4662134 <_ChromeMain+0x465ce98>
 4662120: 52800028     	mov	w8, #0x1                ; =1
 4662124: 39044768     	strb	w8, [x27, #0x111]
 4662128: aa1b03e0     	mov	x0, x27
 466212c: 52800021     	mov	w1, #0x1                ; =1
 4662130: 97500c60     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4662134: f9000ff5     	str	x21, [sp, #0x18]
 4662138: a9077ff5     	stp	x21, xzr, [sp, #0x70]
 466213c: f0051d01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4662140: 91122021     	add	x1, x1, #0x488
 4662144: 91046360     	add	x0, x27, #0x118
 4662148: 9101c3e2     	add	x2, sp, #0x70
 466214c: 97522f45     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4662150: 9005455b     	adrp	x27, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4662154: 9112037b     	add	x27, x27, #0x480
 4662158: f8bfc360     	ldapr	x0, [x27]
 466215c: b4006060     	cbz	x0, 0x4662d68 <_ChromeMain+0x465dacc>
 4662160: 5280a001     	mov	w1, #0x500              ; =1280
 4662164: d2800002     	mov	x2, #0x0                ; =0
 4662168: 96e92512     	bl	0xab5b0 <_ChromeMain+0xa6314>
 466216c: aa0003f5     	mov	x21, x0
 4662170: 3dc002c0     	ldr	q0, [x22]
 4662174: 3d800be0     	str	q0, [sp, #0x20]
 4662178: f9400ac8     	ldr	x8, [x22, #0x10]
 466217c: f9001be8     	str	x8, [sp, #0x30]
 4662180: a9007edf     	stp	xzr, xzr, [x22]
 4662184: f0050617     	adrp	x23, 0xe725000 <dyld_stub_binder+0xe725000>
 4662188: 9120c2f7     	add	x23, x23, #0x830
 466218c: f9000adf     	str	xzr, [x22, #0x10]
 4662190: 911182e8     	add	x8, x23, #0x460
 4662194: a9002017     	stp	x23, x8, [x0]
 4662198: 911222e8     	add	x8, x23, #0x488
 466219c: f9000808     	str	x8, [x0, #0x10]
 46621a0: 911302e8     	add	x8, x23, #0x4c0
 46621a4: 9113c2e9     	add	x9, x23, #0x4f0
 46621a8: a906a408     	stp	x8, x9, [x0, #0x68]
 46621ac: 911502e8     	add	x8, x23, #0x540
 46621b0: f9005808     	str	x8, [x0, #0xb0]
 46621b4: 911682e8     	add	x8, x23, #0x5a0
 46621b8: aa0003e9     	mov	x9, x0
 46621bc: f80d8d28     	str	x8, [x9, #0xd8]!
 46621c0: f9000be9     	str	x9, [sp, #0x10]
 46621c4: 911742e8     	add	x8, x23, #0x5d0
 46621c8: aa0003fa     	mov	x26, x0
 46621cc: f80f8f48     	str	x8, [x26, #0xf8]!
 46621d0: 9117e2e8     	add	x8, x23, #0x5f8
 46621d4: f9018808     	str	x8, [x0, #0x310]
 46621d8: 9119e2e8     	add	x8, x23, #0x678
 46621dc: f9018c08     	str	x8, [x0, #0x318]
 46621e0: 911ce2e8     	add	x8, x23, #0x738
 46621e4: f9019008     	str	x8, [x0, #0x320]
 46621e8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46621ec: 90052a9c     	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46621f0: f9404789     	ldr	x9, [x28, #0x88]
 46621f4: eb09011f     	cmp	x8, x9
 46621f8: 54000061     	b.ne	0x4662204 <_ChromeMain+0x465cf68>
 46621fc: aa1503e0     	mov	x0, x21
 4662200: 96e6c83f     	bl	0x142fc <_ChromeMain+0xf060>
 4662204: 52800700     	mov	w0, #0x38               ; =56
 4662208: 96e6b458     	bl	0xf368 <_ChromeMain+0xa0cc>
 466220c: 52800028     	mov	w8, #0x1                ; =1
 4662210: b9000008     	str	w8, [x0]
 4662214: b0ffca88     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 4662218: 91300108     	add	x8, x8, #0xc00
 466221c: f0ff91a9     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 4662220: 912d0129     	add	x9, x9, #0xb40
 4662224: a900a408     	stp	x8, x9, [x0, #0x8]
 4662228: f0fef7c9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 466222c: 912c0129     	add	x9, x9, #0xb00
 4662230: 1001b708     	adr	x8, 0x4665910 <_ChromeMain+0x4660674>
 4662234: d503201f     	nop
 4662238: a901a009     	stp	x9, x8, [x0, #0x18]
 466223c: a902d41f     	stp	xzr, x21, [x0, #0x28]
 4662240: f81983a0     	stur	x0, [x29, #-0x68]
 4662244: 52800048     	mov	w8, #0x2                ; =2
 4662248: 381a03a8     	sturb	w8, [x29, #-0x60]
 466224c: d101a3a1     	sub	x1, x29, #0x68
 4662250: aa1503e0     	mov	x0, x21
 4662254: 9734308b     	bl	0x136e480 <_ChromeMain+0x13691e4>
 4662258: 385a03a8     	ldurb	w8, [x29, #-0x60]
 466225c: 7103fd1f     	cmp	w8, #0xff
 4662260: 54000060     	b.eq	0x466226c <_ChromeMain+0x465cfd0>
 4662264: f85983a0     	ldur	x0, [x29, #-0x68]
 4662268: b5005180     	cbnz	x0, 0x4662c98 <_ChromeMain+0x465d9fc>
 466226c: 52801fe8     	mov	w8, #0xff               ; =255
 4662270: 381a03a8     	sturb	w8, [x29, #-0x60]
 4662274: 911182e8     	add	x8, x23, #0x460
 4662278: a90022b7     	stp	x23, x8, [x21]
 466227c: 911222e8     	add	x8, x23, #0x488
 4662280: f9000aa8     	str	x8, [x21, #0x10]
 4662284: 911302e8     	add	x8, x23, #0x4c0
 4662288: 9113c2e9     	add	x9, x23, #0x4f0
 466228c: a906a6a8     	stp	x8, x9, [x21, #0x68]
 4662290: 911502e8     	add	x8, x23, #0x540
 4662294: f9005aa8     	str	x8, [x21, #0xb0]
 4662298: 911682e8     	add	x8, x23, #0x5a0
 466229c: f9006ea8     	str	x8, [x21, #0xd8]
 46622a0: 911742e8     	add	x8, x23, #0x5d0
 46622a4: f9007ea8     	str	x8, [x21, #0xf8]
 46622a8: 9117e2e8     	add	x8, x23, #0x5f8
 46622ac: f9018aa8     	str	x8, [x21, #0x310]
 46622b0: 9119e2e8     	add	x8, x23, #0x678
 46622b4: f9018ea8     	str	x8, [x21, #0x318]
 46622b8: 911ce2e8     	add	x8, x23, #0x738
 46622bc: f90192a8     	str	x8, [x21, #0x320]
 46622c0: 52800388     	mov	w8, #0x1c               ; =28
 46622c4: b904b2a8     	str	w8, [x21, #0x4b0]
 46622c8: 3912d2bf     	strb	wzr, [x21, #0x4b4]
 46622cc: f9025eb9     	str	x25, [x21, #0x4b8]
 46622d0: f90262b8     	str	x24, [x21, #0x4c0]
 46622d4: 911322b7     	add	x23, x21, #0x4c8
 46622d8: 3913c2bf     	strb	wzr, [x21, #0x4f0]
 46622dc: f9027ebf     	str	xzr, [x21, #0x4f8]
 46622e0: 3913a2bf     	strb	wzr, [x21, #0x4e8]
 46622e4: 6f00e400     	movi.2d	v0, #0000000000000000
 46622e8: ad0002e0     	stp	q0, q0, [x23]
 46622ec: 395182a8     	ldrb	w8, [x21, #0x460]
 46622f0: 340000a8     	cbz	w8, 0x4662304 <_ChromeMain+0x465d068>
 46622f4: 391182bf     	strb	wzr, [x21, #0x460]
 46622f8: 911182a1     	add	x1, x21, #0x460
 46622fc: aa1a03e0     	mov	x0, x26
 4662300: 97231734     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4662304: f94242a8     	ldr	x8, [x21, #0x480]
 4662308: 52800038     	mov	w24, #0x1               ; =1
 466230c: b9001918     	str	w24, [x8, #0x18]
 4662310: b94466a8     	ldr	w8, [x21, #0x464]
 4662314: 7120011f     	cmp	w8, #0x800
 4662318: 540000e0     	b.eq	0x4662334 <_ChromeMain+0x465d098>
 466231c: 911192a8     	add	x8, x21, #0x464
 4662320: 52810009     	mov	w9, #0x800              ; =2048
 4662324: b9000109     	str	w9, [x8]
 4662328: 911192a1     	add	x1, x21, #0x464
 466232c: aa1a03e0     	mov	x0, x26
 4662330: 97231728     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4662334: 39072eb8     	strb	w24, [x21, #0x1cb]
 4662338: 910083e1     	add	x1, sp, #0x20
 466233c: aa1503e0     	mov	x0, x21
 4662340: 97079181     	bl	0x846944 <_ChromeMain+0x8416a8>
 4662344: f94166b8     	ldr	x24, [x21, #0x2c8]
 4662348: b4004e78     	cbz	x24, 0x4662d14 <_ChromeMain+0x465da78>
 466234c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4662350: 37f844e8     	tbnz	w8, #0x1f, 0x4662bec <_ChromeMain+0x465d950>
 4662354: 3dc00be0     	ldr	q0, [sp, #0x20]
 4662358: 3c9803a0     	stur	q0, [x29, #-0x80]
 466235c: f9401be8     	ldr	x8, [sp, #0x30]
 4662360: f81903a8     	stur	x8, [x29, #-0x70]
 4662364: d10203a1     	sub	x1, x29, #0x80
 4662368: aa1803e0     	mov	x0, x24
 466236c: 972c2d5b     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 4662370: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4662374: 36f800a8     	tbz	w8, #0x1f, 0x4662388 <_ChromeMain+0x465d0ec>
 4662378: f85803a0     	ldur	x0, [x29, #-0x80]
 466237c: f85903a8     	ldur	x8, [x29, #-0x70]
 4662380: d37ff901     	lsl	x1, x8, #1
 4662384: 96e69acd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4662388: f9425ea8     	ldr	x8, [x21, #0x4b8]
 466238c: f100011f     	cmp	x8, #0x0
 4662390: 1a9f07e1     	cset	w1, ne
 4662394: aa1503e0     	mov	x0, x21
 4662398: 973b5511     	bl	0x15377dc <_ChromeMain+0x1532540>
 466239c: 52802800     	mov	w0, #0x140              ; =320
 46623a0: 96e6b3f2     	bl	0xf368 <_ChromeMain+0xa0cc>
 46623a4: aa0003f8     	mov	x24, x0
 46623a8: 978eb88a     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 46623ac: aa1503e0     	mov	x0, x21
 46623b0: aa1803e1     	mov	x1, x24
 46623b4: 97549d21     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 46623b8: b940f308     	ldr	w8, [x24, #0xf0]
 46623bc: 35004288     	cbnz	w8, 0x4662c0c <_ChromeMain+0x465d970>
 46623c0: 52800028     	mov	w8, #0x1                ; =1
 46623c4: b90073e8     	str	w8, [sp, #0x70]
 46623c8: f0051d01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46623cc: 9115a021     	add	x1, x1, #0x568
 46623d0: 91046300     	add	x0, x24, #0x118
 46623d4: 9101c3e2     	add	x2, sp, #0x70
 46623d8: 97500b73     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 46623dc: b940fb08     	ldr	w8, [x24, #0xf8]
 46623e0: 7100111f     	cmp	w8, #0x4
 46623e4: 54004881     	b.ne	0x4662cf4 <_ChromeMain+0x465da58>
 46623e8: b940ff08     	ldr	w8, [x24, #0xfc]
 46623ec: 7100211f     	cmp	w8, #0x8
 46623f0: 54004821     	b.ne	0x4662cf4 <_ChromeMain+0x465da58>
 46623f4: b9410308     	ldr	w8, [x24, #0x100]
 46623f8: 7100111f     	cmp	w8, #0x4
 46623fc: 540047c1     	b.ne	0x4662cf4 <_ChromeMain+0x465da58>
 4662400: b9410708     	ldr	w8, [x24, #0x104]
 4662404: 7100211f     	cmp	w8, #0x8
 4662408: 54004761     	b.ne	0x4662cf4 <_ChromeMain+0x465da58>
 466240c: f8bfc360     	ldapr	x0, [x27]
 4662410: b4004b00     	cbz	x0, 0x4662d70 <_ChromeMain+0x465dad4>
 4662414: 52808c01     	mov	w1, #0x460              ; =1120
 4662418: d2800002     	mov	x2, #0x0                ; =0
 466241c: 96e92465     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4662420: aa0003f8     	mov	x24, x0
 4662424: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 4662428: 910083e9     	add	x9, sp, #0x20
 466242c: a9422fea     	ldp	x10, x11, [sp, #0x20]
 4662430: f100011f     	cmp	x8, #0x0
 4662434: 9a894141     	csel	x1, x10, x9, mi
 4662438: 7100011f     	cmp	w8, #0x0
 466243c: 9a884162     	csel	x2, x11, x8, mi
 4662440: 528000a3     	mov	w3, #0x5                ; =5
 4662444: 52820004     	mov	w4, #0x1000             ; =4096
 4662448: 52800005     	mov	w5, #0x0                ; =0
 466244c: 9754a125     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4662450: 3945a408     	ldrb	w8, [x0, #0x169]
 4662454: 350049a8     	cbnz	w8, 0x4662d88 <_ChromeMain+0x465daec>
 4662458: f940cea2     	ldr	x2, [x21, #0x198]
 466245c: aa1503e0     	mov	x0, x21
 4662460: aa1803e1     	mov	x1, x24
 4662464: 97045be6     	bl	0x7793fc <_ChromeMain+0x774160>
 4662468: 925e7708     	and	x8, x24, #0xfffffffc00000000
 466246c: f9404789     	ldr	x9, [x28, #0x88]
 4662470: eb09011f     	cmp	x8, x9
 4662474: 54000061     	b.ne	0x4662480 <_ChromeMain+0x465d1e4>
 4662478: aa1803e0     	mov	x0, x24
 466247c: 96e6c7a0     	bl	0x142fc <_ChromeMain+0xf060>
 4662480: f94002e0     	ldr	x0, [x23]
 4662484: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4662488: f9404789     	ldr	x9, [x28, #0x88]
 466248c: eb09011f     	cmp	x8, x9
 4662490: 54000041     	b.ne	0x4662498 <_ChromeMain+0x465d1fc>
 4662494: 96e7016a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4662498: f90002f8     	str	x24, [x23]
 466249c: 3946a708     	ldrb	w8, [x24, #0x1a9]
 46624a0: 340000c8     	cbz	w8, 0x46624b8 <_ChromeMain+0x465d21c>
 46624a4: 3906a71f     	strb	wzr, [x24, #0x1a9]
 46624a8: 9103e300     	add	x0, x24, #0xf8
 46624ac: 9106a701     	add	x1, x24, #0x1a9
 46624b0: 972316c8     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46624b4: f94002f8     	ldr	x24, [x23]
 46624b8: aa1803e0     	mov	x0, x24
 46624bc: 52800061     	mov	w1, #0x3                ; =3
 46624c0: 97549e10     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 46624c4: f94002e0     	ldr	x0, [x23]
 46624c8: 528000c1     	mov	w1, #0x6                ; =6
 46624cc: 96fcfa1d     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 46624d0: f94002f8     	ldr	x24, [x23]
 46624d4: 394edb08     	ldrb	w8, [x24, #0x3b6]
 46624d8: 35003ee8     	cbnz	w8, 0x4662cb4 <_ChromeMain+0x465da18>
 46624dc: aa1803e0     	mov	x0, x24
 46624e0: 52800001     	mov	w1, #0x0                ; =0
 46624e4: 978373a3     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 46624e8: f94002e0     	ldr	x0, [x23]
 46624ec: b81783bf     	stur	wzr, [x29, #-0x88]
 46624f0: 52800028     	mov	w8, #0x1                ; =1
 46624f4: 3817c3a8     	sturb	w8, [x29, #-0x84]
 46624f8: d10223a1     	sub	x1, x29, #0x88
 46624fc: 9707987d     	bl	0x8486f0 <_ChromeMain+0x843454>
 4662500: f94002f8     	ldr	x24, [x23]
 4662504: f941af08     	ldr	x8, [x24, #0x358]
 4662508: f9402519     	ldr	x25, [x8, #0x48]
 466250c: b40000b9     	cbz	x25, 0x4662520 <_ChromeMain+0x465d284>
 4662510: b9400328     	ldr	w8, [x25]
 4662514: 31000508     	adds	w8, w8, #0x1
 4662518: b9000328     	str	w8, [x25]
 466251c: 540043c2     	b.hs	0x4662d94 <_ChromeMain+0x465daf8>
 4662520: aa1b03f6     	mov	x22, x27
 4662524: b9404728     	ldr	w8, [x25, #0x44]
 4662528: 3100051f     	cmn	w8, #0x1
 466252c: 540046a0     	b.eq	0x4662e00 <_ChromeMain+0x465db64>
 4662530: 528001a9     	mov	w9, #0xd                ; =13
 4662534: 4b08013a     	sub	w26, w9, w8
 4662538: b940433b     	ldr	w27, [x25, #0x40]
 466253c: 3100077f     	cmn	w27, #0x1
 4662540: 54004040     	b.eq	0x4662d48 <_ChromeMain+0x465daac>
 4662544: b9404b23     	ldr	w3, [x25, #0x48]
 4662548: 3100047f     	cmn	w3, #0x1
 466254c: 54004620     	b.eq	0x4662e10 <_ChromeMain+0x465db74>
 4662550: aa1903e0     	mov	x0, x25
 4662554: aa1a03e1     	mov	x1, x26
 4662558: aa1b03e2     	mov	x2, x27
 466255c: 97591449     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 4662560: aa0003fa     	mov	x26, x0
 4662564: b40000a0     	cbz	x0, 0x4662578 <_ChromeMain+0x465d2dc>
 4662568: b9400348     	ldr	w8, [x26]
 466256c: 31000508     	adds	w8, w8, #0x1
 4662570: b9000348     	str	w8, [x26]
 4662574: 54004162     	b.hs	0x4662da0 <_ChromeMain+0x465db04>
 4662578: b9404342     	ldr	w2, [x26, #0x40]
 466257c: 3100045f     	cmn	w2, #0x1
 4662580: aa1603fb     	mov	x27, x22
 4662584: 54003ea0     	b.eq	0x4662d58 <_ChromeMain+0x465dabc>
 4662588: aa1a03e0     	mov	x0, x26
 466258c: 52800001     	mov	w1, #0x0                ; =0
 4662590: 52803e83     	mov	w3, #0x1f4              ; =500
 4662594: 9759143b     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 4662598: f9003be0     	str	x0, [sp, #0x70]
 466259c: b40000a0     	cbz	x0, 0x46625b0 <_ChromeMain+0x465d314>
 46625a0: b9400008     	ldr	w8, [x0]
 46625a4: 31000508     	adds	w8, w8, #0x1
 46625a8: b9000008     	str	w8, [x0]
 46625ac: 54004002     	b.hs	0x4662dac <_ChromeMain+0x465db10>
 46625b0: b40000da     	cbz	x26, 0x46625c8 <_ChromeMain+0x465d32c>
 46625b4: b9400349     	ldr	w9, [x26]
 46625b8: 51000528     	sub	w8, w9, #0x1
 46625bc: b9000348     	str	w8, [x26]
 46625c0: 34003fc9     	cbz	w9, 0x4662db8 <_ChromeMain+0x465db1c>
 46625c4: 34003448     	cbz	w8, 0x4662c4c <_ChromeMain+0x465d9b0>
 46625c8: f9400bf6     	ldr	x22, [sp, #0x10]
 46625cc: b40000d9     	cbz	x25, 0x46625e4 <_ChromeMain+0x465d348>
 46625d0: b9400329     	ldr	w9, [x25]
 46625d4: 51000528     	sub	w8, w9, #0x1
 46625d8: b9000328     	str	w8, [x25]
 46625dc: 34003f49     	cbz	w9, 0x4662dc4 <_ChromeMain+0x465db28>
 46625e0: 34003408     	cbz	w8, 0x4662c60 <_ChromeMain+0x465d9c4>
 46625e4: f9400308     	ldr	x8, [x24]
 46625e8: f941ed08     	ldr	x8, [x8, #0x3d8]
 46625ec: 9101c3f9     	add	x25, sp, #0x70
 46625f0: 9101c3e1     	add	x1, sp, #0x70
 46625f4: aa1803e0     	mov	x0, x24
 46625f8: d63f0100     	blr	x8
 46625fc: f9403be0     	ldr	x0, [sp, #0x70]
 4662600: b40000c0     	cbz	x0, 0x4662618 <_ChromeMain+0x465d37c>
 4662604: b9400009     	ldr	w9, [x0]
 4662608: 51000528     	sub	w8, w9, #0x1
 466260c: b9000008     	str	w8, [x0]
 4662610: 34003e09     	cbz	w9, 0x4662dd0 <_ChromeMain+0x465db34>
 4662614: 34002f48     	cbz	w8, 0x4662bfc <_ChromeMain+0x465d960>
 4662618: f94002e0     	ldr	x0, [x23]
 466261c: 52801c48     	mov	w8, #0xe2               ; =226
 4662620: b81703a8     	stur	w8, [x29, #-0x90]
 4662624: 381743bf     	sturb	wzr, [x29, #-0x8c]
 4662628: f9400008     	ldr	x8, [x0]
 466262c: f941f508     	ldr	x8, [x8, #0x3e8]
 4662630: d10243a1     	sub	x1, x29, #0x90
 4662634: d63f0100     	blr	x8
 4662638: f94002f7     	ldr	x23, [x23]
 466263c: 52800800     	mov	w0, #0x40               ; =64
 4662640: 96e6b34a     	bl	0xf368 <_ChromeMain+0xa0cc>
 4662644: 52800028     	mov	w8, #0x1                ; =1
 4662648: b9000008     	str	w8, [x0]
 466264c: b0fe4e29     	adrp	x9, 0x1027000 <_ChromeMain+0x1021d64>
 4662650: 91260129     	add	x9, x9, #0x980
 4662654: 90fde48a     	adrp	x10, 0x2f2000 <_ChromeMain+0x2ecd64>
 4662658: 9122014a     	add	x10, x10, #0x880
 466265c: a900a809     	stp	x9, x10, [x0, #0x8]
 4662660: 90ffa629     	adrp	x9, 0x3b26000 <_ChromeMain+0x3b20d64>
 4662664: 91310129     	add	x9, x9, #0xc40
 4662668: f0fef7ca     	adrp	x10, 0x255d000 <_ChromeMain+0x2557d64>
 466266c: 912c014a     	add	x10, x10, #0xb00
 4662670: a901a40a     	stp	x10, x9, [x0, #0x18]
 4662674: b004c6e9     	adrp	x9, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4662678: 3dc3d920     	ldr	q0, [x9, #0xf60]
 466267c: 3c828000     	stur	q0, [x0, #0x28]
 4662680: 3900e01f     	strb	wzr, [x0, #0x38]
 4662684: f90023e0     	str	x0, [sp, #0x40]
 4662688: 0f000420     	movi.2s	v0, #0x1
 466268c: fd0027e0     	str	d0, [sp, #0x48]
 4662690: 52800069     	mov	w9, #0x3                ; =3
 4662694: b90053e9     	str	w9, [sp, #0x50]
 4662698: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 466269c: f9002fff     	str	xzr, [sp, #0x58]
 46626a0: f90043ff     	str	xzr, [sp, #0x80]
 46626a4: f9003be0     	str	x0, [sp, #0x70]
 46626a8: b5002e60     	cbnz	x0, 0x4662c74 <_ChromeMain+0x465d9d8>
 46626ac: 910103e9     	add	x9, sp, #0x40
 46626b0: f840812a     	ldur	x10, [x9, #0x8]
 46626b4: f800832a     	stur	x10, [x25, #0x8]
 46626b8: b8410129     	ldur	w9, [x9, #0x10]
 46626bc: b8010329     	stur	w9, [x25, #0x10]
 46626c0: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 46626c4: f90047ff     	str	xzr, [sp, #0x88]
 46626c8: b9007fe8     	str	w8, [sp, #0x7c]
 46626cc: f0051d01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46626d0: 91152021     	add	x1, x1, #0x548
 46626d4: 910362e0     	add	x0, x23, #0xd8
 46626d8: 9101c3e2     	add	x2, sp, #0x70
 46626dc: 9756c72c     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 46626e0: 9101c3e0     	add	x0, sp, #0x70
 46626e4: 9743a190     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 46626e8: 910103e0     	add	x0, sp, #0x40
 46626ec: 9743a18e     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 46626f0: f8bfc360     	ldapr	x0, [x27]
 46626f4: b4003420     	cbz	x0, 0x4662d78 <_ChromeMain+0x465dadc>
 46626f8: 52806201     	mov	w1, #0x310              ; =784
 46626fc: d2800002     	mov	x2, #0x0                ; =0
 4662700: 96e923ac     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4662704: aa0003f8     	mov	x24, x0
 4662708: 9734328e     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 466270c: 3945a408     	ldrb	w8, [x0, #0x169]
 4662710: 35003668     	cbnz	w8, 0x4662ddc <_ChromeMain+0x465db40>
 4662714: f940cea2     	ldr	x2, [x21, #0x198]
 4662718: aa1503e0     	mov	x0, x21
 466271c: aa1803e1     	mov	x1, x24
 4662720: 97045b37     	bl	0x7793fc <_ChromeMain+0x774160>
 4662724: 925e7708     	and	x8, x24, #0xfffffffc00000000
 4662728: f9404789     	ldr	x9, [x28, #0x88]
 466272c: eb09011f     	cmp	x8, x9
 4662730: 54000061     	b.ne	0x466273c <_ChromeMain+0x465d4a0>
 4662734: aa1803e0     	mov	x0, x24
 4662738: 96e6c6f1     	bl	0x142fc <_ChromeMain+0xf060>
 466273c: f9426aa0     	ldr	x0, [x21, #0x4d0]
 4662740: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4662744: f9404789     	ldr	x9, [x28, #0x88]
 4662748: eb09011f     	cmp	x8, x9
 466274c: 54000041     	b.ne	0x4662754 <_ChromeMain+0x465d4b8>
 4662750: 96e700bb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4662754: f9026ab8     	str	x24, [x21, #0x4d0]
 4662758: 52802800     	mov	w0, #0x140              ; =320
 466275c: 96e6b303     	bl	0xf368 <_ChromeMain+0xa0cc>
 4662760: aa0003f9     	mov	x25, x0
 4662764: 978eb79b     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4662768: aa1803e0     	mov	x0, x24
 466276c: aa1903e1     	mov	x1, x25
 4662770: 97549c32     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4662774: b940f328     	ldr	w8, [x25, #0xf0]
 4662778: 35002548     	cbnz	w8, 0x4662c20 <_ChromeMain+0x465d984>
 466277c: 52800028     	mov	w8, #0x1                ; =1
 4662780: b90073e8     	str	w8, [sp, #0x70]
 4662784: f0051d01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4662788: 9115a021     	add	x1, x1, #0x568
 466278c: 91046320     	add	x0, x25, #0x118
 4662790: 9101c3e2     	add	x2, sp, #0x70
 4662794: 97500a84     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 4662798: b4000354     	cbz	x20, 0x4662800 <_ChromeMain+0x465d564>
 466279c: f9400288     	ldr	x8, [x20]
 46627a0: f9405108     	ldr	x8, [x8, #0xa0]
 46627a4: aa1403e0     	mov	x0, x20
 46627a8: 52800001     	mov	w1, #0x0                ; =0
 46627ac: d63f0100     	blr	x8
 46627b0: 3945a688     	ldrb	w8, [x20, #0x169]
 46627b4: 35003428     	cbnz	w8, 0x4662e38 <_ChromeMain+0x465db9c>
 46627b8: f9426aa0     	ldr	x0, [x21, #0x4d0]
 46627bc: f940cc02     	ldr	x2, [x0, #0x198]
 46627c0: aa1403e1     	mov	x1, x20
 46627c4: 97045b0e     	bl	0x7793fc <_ChromeMain+0x774160>
 46627c8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 46627cc: f9404789     	ldr	x9, [x28, #0x88]
 46627d0: eb09011f     	cmp	x8, x9
 46627d4: 54000061     	b.ne	0x46627e0 <_ChromeMain+0x465d544>
 46627d8: aa1403e0     	mov	x0, x20
 46627dc: 96e6c6c8     	bl	0x142fc <_ChromeMain+0xf060>
 46627e0: f9426ea0     	ldr	x0, [x21, #0x4d8]
 46627e4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46627e8: f9404789     	ldr	x9, [x28, #0x88]
 46627ec: eb09011f     	cmp	x8, x9
 46627f0: 54000041     	b.ne	0x46627f8 <_ChromeMain+0x465d55c>
 46627f4: 96e70092     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46627f8: f9026eb4     	str	x20, [x21, #0x4d8]
 46627fc: d2800014     	mov	x20, #0x0               ; =0
 4662800: b9400fe8     	ldr	w8, [sp, #0xc]
 4662804: 34000628     	cbz	w8, 0x46628c8 <_ChromeMain+0x465d62c>
 4662808: f9426ab8     	ldr	x24, [x21, #0x4d0]
 466280c: f8bfc360     	ldapr	x0, [x27]
 4662810: b4003100     	cbz	x0, 0x4662e30 <_ChromeMain+0x465db94>
 4662814: 52808301     	mov	w1, #0x418              ; =1048
 4662818: d2800002     	mov	x2, #0x0                ; =0
 466281c: 96e92365     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4662820: aa0003f7     	mov	x23, x0
 4662824: 52800021     	mov	w1, #0x1                ; =1
 4662828: 97eadbf7     	bl	0x4119804 <_ChromeMain+0x4114568>
 466282c: 3945a408     	ldrb	w8, [x0, #0x169]
 4662830: 350030a8     	cbnz	w8, 0x4662e44 <_ChromeMain+0x465dba8>
 4662834: f940cf02     	ldr	x2, [x24, #0x198]
 4662838: aa1803e0     	mov	x0, x24
 466283c: aa1703e1     	mov	x1, x23
 4662840: 97045aef     	bl	0x7793fc <_ChromeMain+0x774160>
 4662844: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 4662848: f9404789     	ldr	x9, [x28, #0x88]
 466284c: eb09011f     	cmp	x8, x9
 4662850: 54000061     	b.ne	0x466285c <_ChromeMain+0x465d5c0>
 4662854: aa1703e0     	mov	x0, x23
 4662858: 96e6c6a9     	bl	0x142fc <_ChromeMain+0xf060>
 466285c: f94272a0     	ldr	x0, [x21, #0x4e0]
 4662860: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4662864: f9404789     	ldr	x9, [x28, #0x88]
 4662868: eb09011f     	cmp	x8, x9
 466286c: 54000041     	b.ne	0x4662874 <_ChromeMain+0x465d5d8>
 4662870: 96e70073     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4662874: f90272b7     	str	x23, [x21, #0x4e0]
 4662878: 52801c48     	mov	w8, #0xe2               ; =226
 466287c: b90043e8     	str	w8, [sp, #0x40]
 4662880: 390113ff     	strb	wzr, [sp, #0x44]
 4662884: d0051b80     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4662888: 913d4000     	add	x0, x0, #0xf50
 466288c: 9101c3e8     	add	x8, sp, #0x70
 4662890: 910103e1     	add	x1, sp, #0x40
 4662894: 52800202     	mov	w2, #0x10               ; =16
 4662898: d2800003     	mov	x3, #0x0                ; =0
 466289c: 971e4821     	bl	0xdf4920 <_ChromeMain+0xdef684>
 46628a0: 9101c3e1     	add	x1, sp, #0x70
 46628a4: aa1703e0     	mov	x0, x23
 46628a8: 96fcf9fe     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 46628ac: 9101c3e0     	add	x0, sp, #0x70
 46628b0: 97078fe4     	bl	0x846840 <_ChromeMain+0x8415a4>
 46628b4: f94272a0     	ldr	x0, [x21, #0x4e0]
 46628b8: f9400008     	ldr	x8, [x0]
 46628bc: f9405108     	ldr	x8, [x8, #0xa0]
 46628c0: 52800001     	mov	w1, #0x0                ; =0
 46628c4: d63f0100     	blr	x8
 46628c8: 52800700     	mov	w0, #0x38               ; =56
 46628cc: 96fa83fd     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 46628d0: aa0003f7     	mov	x23, x0
 46628d4: 52800600     	mov	w0, #0x30               ; =48
 46628d8: 96e6b2a4     	bl	0xf368 <_ChromeMain+0xa0cc>
 46628dc: aa0003e4     	mov	x4, x0
 46628e0: 0ab77ee8     	bic	w8, w23, w23, asr #31
 46628e4: 1e230100     	ucvtf	s0, w8
 46628e8: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 46628ec: 9004e779     	adrp	x25, 0xe34e000 <dyld_stub_binder+0xe34e000>
 46628f0: 91362339     	add	x25, x25, #0xd88
 46628f4: 7900301f     	strh	wzr, [x0, #0x18]
 46628f8: f9000019     	str	x25, [x0]
 46628fc: 4e040400     	dup.4s	v0, v0[0]
 4662900: 3c81c000     	stur	q0, [x0, #0x1c]
 4662904: f0051d01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4662908: 9114a021     	add	x1, x1, #0x528
 466290c: f004b702     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 4662910: 91264842     	add	x2, x2, #0x992
 4662914: d0ff4043     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 4662918: 913c0063     	add	x3, x3, #0xf00
 466291c: aa1603e0     	mov	x0, x22
 4662920: d2800005     	mov	x5, #0x0                ; =0
 4662924: 97141e1e     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 4662928: b50015a0     	cbnz	x0, 0x4662bdc <_ChromeMain+0x465d940>
 466292c: aa1503e0     	mov	x0, x21
 4662930: 97343144     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 4662934: aa1503e9     	mov	x9, x21
 4662938: f84e8d28     	ldr	x8, [x9, #0xe8]!
 466293c: b4000128     	cbz	x8, 0x4662960 <_ChromeMain+0x465d6c4>
 4662940: d0051d0a     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 4662944: 9132c14a     	add	x10, x10, #0xcb0
 4662948: f940110b     	ldr	x11, [x8, #0x20]
 466294c: eb0a017f     	cmp	x11, x10
 4662950: 54001348     	b.hi	0x4662bb8 <_ChromeMain+0x465d91c>
 4662954: 540012a2     	b.hs	0x4662ba8 <_ChromeMain+0x465d90c>
 4662958: f9400508     	ldr	x8, [x8, #0x8]
 466295c: b5ffff68     	cbnz	x8, 0x4662948 <_ChromeMain+0x465d6ac>
 4662960: d2800017     	mov	x23, #0x0               ; =0
 4662964: 52800700     	mov	w0, #0x38               ; =56
 4662968: 96fa83d6     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 466296c: aa0003f8     	mov	x24, x0
 4662970: 52800600     	mov	w0, #0x30               ; =48
 4662974: 96e6b27d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4662978: aa0003e8     	mov	x8, x0
 466297c: 0ab87f09     	bic	w9, w24, w24, asr #31
 4662980: 1e230120     	ucvtf	s0, w9
 4662984: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4662988: 7900301f     	strh	wzr, [x0, #0x18]
 466298c: f9000019     	str	x25, [x0]
 4662990: 4e040400     	dup.4s	v0, v0[0]
 4662994: 3c81c000     	stur	q0, [x0, #0x1c]
 4662998: f9418ee0     	ldr	x0, [x23, #0x318]
 466299c: f9018ee8     	str	x8, [x23, #0x318]
 46629a0: b5002400     	cbnz	x0, 0x4662e20 <_ChromeMain+0x465db84>
 46629a4: aa1703e0     	mov	x0, x23
 46629a8: 52800001     	mov	w1, #0x0                ; =0
 46629ac: 96ff36b2     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46629b0: aa1703e0     	mov	x0, x23
 46629b4: 96fcf9f2     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46629b8: b40000b4     	cbz	x20, 0x46629cc <_ChromeMain+0x465d730>
 46629bc: f9400288     	ldr	x8, [x20]
 46629c0: f9402908     	ldr	x8, [x8, #0x50]
 46629c4: aa1403e0     	mov	x0, x20
 46629c8: d63f0100     	blr	x8
 46629cc: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 46629d0: 36f800a8     	tbz	w8, #0x1f, 0x46629e4 <_ChromeMain+0x465d748>
 46629d4: f94013e0     	ldr	x0, [sp, #0x20]
 46629d8: f9401be8     	ldr	x8, [sp, #0x30]
 46629dc: d37ff901     	lsl	x1, x8, #1
 46629e0: 96e69936     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46629e4: 3945a6a8     	ldrb	w8, [x21, #0x169]
 46629e8: 35002008     	cbnz	w8, 0x4662de8 <_ChromeMain+0x465db4c>
 46629ec: 910c4274     	add	x20, x19, #0x310
 46629f0: f940ce62     	ldr	x2, [x19, #0x198]
 46629f4: aa1303e0     	mov	x0, x19
 46629f8: aa1503e1     	mov	x1, x21
 46629fc: 97045a80     	bl	0x7793fc <_ChromeMain+0x774160>
 4662a00: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4662a04: f9404789     	ldr	x9, [x28, #0x88]
 4662a08: eb09011f     	cmp	x8, x9
 4662a0c: 54000061     	b.ne	0x4662a18 <_ChromeMain+0x465d77c>
 4662a10: aa1503e0     	mov	x0, x21
 4662a14: 96e6c63a     	bl	0x142fc <_ChromeMain+0xf060>
 4662a18: f9400280     	ldr	x0, [x20]
 4662a1c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4662a20: f9404789     	ldr	x9, [x28, #0x88]
 4662a24: eb09011f     	cmp	x8, x9
 4662a28: 54000041     	b.ne	0x4662a30 <_ChromeMain+0x465d794>
 4662a2c: 96e70004     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4662a30: f9000295     	str	x21, [x20]
 4662a34: d2c00108     	mov	x8, #0x800000000        ; =34359738368
 4662a38: 4e080d00     	dup.2d	v0, x8
 4662a3c: 3d801fe0     	str	q0, [sp, #0x70]
 4662a40: f0051d01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4662a44: 91122021     	add	x1, x1, #0x488
 4662a48: 9101c3e2     	add	x2, sp, #0x70
 4662a4c: aa1603e0     	mov	x0, x22
 4662a50: 97522d04     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4662a54: f8bfc360     	ldapr	x0, [x27]
 4662a58: b4001940     	cbz	x0, 0x4662d80 <_ChromeMain+0x465dae4>
 4662a5c: 52806201     	mov	w1, #0x310              ; =784
 4662a60: d2800002     	mov	x2, #0x0                ; =0
 4662a64: 96e922d3     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4662a68: aa0003f4     	mov	x20, x0
 4662a6c: 52806201     	mov	w1, #0x310              ; =784
 4662a70: 94e69b68     	bl	0x8009810 <_ChromeMain+0x8004574>
 4662a74: aa1403e0     	mov	x0, x20
 4662a78: 973431b2     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4662a7c: f0050608     	adrp	x8, 0xe725000 <dyld_stub_binder+0xe725000>
 4662a80: 913ec108     	add	x8, x8, #0xfb0
 4662a84: 910fa109     	add	x9, x8, #0x3e8
 4662a88: a9002688     	stp	x8, x9, [x20]
 4662a8c: 91104109     	add	x9, x8, #0x410
 4662a90: f9000a89     	str	x9, [x20, #0x10]
 4662a94: 91112109     	add	x9, x8, #0x448
 4662a98: 9111e10a     	add	x10, x8, #0x478
 4662a9c: a906aa89     	stp	x9, x10, [x20, #0x68]
 4662aa0: 91132109     	add	x9, x8, #0x4c8
 4662aa4: f9005a89     	str	x9, [x20, #0xb0]
 4662aa8: 9114a109     	add	x9, x8, #0x528
 4662aac: f9006e89     	str	x9, [x20, #0xd8]
 4662ab0: 91156108     	add	x8, x8, #0x558
 4662ab4: f9007e88     	str	x8, [x20, #0xf8]
 4662ab8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4662abc: f9404789     	ldr	x9, [x28, #0x88]
 4662ac0: eb09011f     	cmp	x8, x9
 4662ac4: 54000061     	b.ne	0x4662ad0 <_ChromeMain+0x465d834>
 4662ac8: aa1403e0     	mov	x0, x20
 4662acc: 96e6c60c     	bl	0x142fc <_ChromeMain+0xf060>
 4662ad0: f9418e60     	ldr	x0, [x19, #0x318]
 4662ad4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4662ad8: f9404789     	ldr	x9, [x28, #0x88]
 4662adc: eb09011f     	cmp	x8, x9
 4662ae0: 54000041     	b.ne	0x4662ae8 <_ChromeMain+0x465d84c>
 4662ae4: 96e6ffd6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4662ae8: f9018e74     	str	x20, [x19, #0x318]
 4662aec: 3945a688     	ldrb	w8, [x20, #0x169]
 4662af0: 35001828     	cbnz	w8, 0x4662df4 <_ChromeMain+0x465db58>
 4662af4: f940ce62     	ldr	x2, [x19, #0x198]
 4662af8: aa1303e0     	mov	x0, x19
 4662afc: aa1403e1     	mov	x1, x20
 4662b00: 97045a3f     	bl	0x7793fc <_ChromeMain+0x774160>
 4662b04: f9418e75     	ldr	x21, [x19, #0x318]
 4662b08: 52802800     	mov	w0, #0x140              ; =320
 4662b0c: 96e6b217     	bl	0xf368 <_ChromeMain+0xa0cc>
 4662b10: aa0003f4     	mov	x20, x0
 4662b14: 978eb6af     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4662b18: aa1503e0     	mov	x0, x21
 4662b1c: aa1403e1     	mov	x1, x20
 4662b20: 97549b46     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4662b24: b940f288     	ldr	w8, [x20, #0xf0]
 4662b28: 7100051f     	cmp	w8, #0x1
 4662b2c: 540004c1     	b.ne	0x4662bc4 <_ChromeMain+0x465d928>
 4662b30: 52800068     	mov	w8, #0x3                ; =3
 4662b34: b90073e8     	str	w8, [sp, #0x70]
 4662b38: f0051d01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4662b3c: 9115a021     	add	x1, x1, #0x568
 4662b40: 91046280     	add	x0, x20, #0x118
 4662b44: 9101c3e2     	add	x2, sp, #0x70
 4662b48: 97500997     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 4662b4c: 39444688     	ldrb	w8, [x20, #0x111]
 4662b50: f9400ff5     	ldr	x21, [sp, #0x18]
 4662b54: 370000c8     	tbnz	w8, #0x0, 0x4662b6c <_ChromeMain+0x465d8d0>
 4662b58: 52800028     	mov	w8, #0x1                ; =1
 4662b5c: 39044688     	strb	w8, [x20, #0x111]
 4662b60: aa1403e0     	mov	x0, x20
 4662b64: 52800021     	mov	w1, #0x1                ; =1
 4662b68: 975009d2     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4662b6c: a9077ff5     	stp	x21, xzr, [sp, #0x70]
 4662b70: f0051d01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4662b74: 91122021     	add	x1, x1, #0x488
 4662b78: 91046280     	add	x0, x20, #0x118
 4662b7c: 9101c3e2     	add	x2, sp, #0x70
 4662b80: 97522cb8     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4662b84: aa1303e0     	mov	x0, x19
 4662b88: a9537bfd     	ldp	x29, x30, [sp, #0x130]
 4662b8c: a9524ff4     	ldp	x20, x19, [sp, #0x120]
 4662b90: a95157f6     	ldp	x22, x21, [sp, #0x110]
 4662b94: a9505ff8     	ldp	x24, x23, [sp, #0x100]
 4662b98: a94f67fa     	ldp	x26, x25, [sp, #0xf0]
 4662b9c: a94e6ffc     	ldp	x28, x27, [sp, #0xe0]
 4662ba0: 910503ff     	add	sp, sp, #0x140
 4662ba4: d65f03c0     	ret
 4662ba8: eb09011f     	cmp	x8, x9
 4662bac: 54ffeda0     	b.eq	0x4662960 <_ChromeMain+0x465d6c4>
 4662bb0: f9401917     	ldr	x23, [x8, #0x30]
 4662bb4: 17ffff6c     	b	0x4662964 <_ChromeMain+0x465d6c8>
 4662bb8: f9400108     	ldr	x8, [x8]
 4662bbc: b5ffec68     	cbnz	x8, 0x4662948 <_ChromeMain+0x465d6ac>
 4662bc0: 17ffff68     	b	0x4662960 <_ChromeMain+0x465d6c4>
 4662bc4: 52800028     	mov	w8, #0x1                ; =1
 4662bc8: b900f288     	str	w8, [x20, #0xf0]
 4662bcc: aa1403e0     	mov	x0, x20
 4662bd0: 52800021     	mov	w1, #0x1                ; =1
 4662bd4: 975009b7     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4662bd8: 17ffffd6     	b	0x4662b30 <_ChromeMain+0x465d894>
 4662bdc: f9400008     	ldr	x8, [x0]
 4662be0: f9400508     	ldr	x8, [x8, #0x8]
 4662be4: d63f0100     	blr	x8
 4662be8: 17ffff51     	b	0x466292c <_ChromeMain+0x465d690>
 4662bec: a9420be1     	ldp	x1, x2, [sp, #0x20]
 4662bf0: d10203a0     	sub	x0, x29, #0x80
 4662bf4: 96e78ff7     	bl	0x46bd0 <_ChromeMain+0x41934>
 4662bf8: 17fffddb     	b	0x4662364 <_ChromeMain+0x465d0c8>
 4662bfc: 972ba6f2     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4662c00: 52800a01     	mov	w1, #0x50               ; =80
 4662c04: 96e698ad     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4662c08: 17fffe84     	b	0x4662618 <_ChromeMain+0x465d37c>
 4662c0c: b900f31f     	str	wzr, [x24, #0xf0]
 4662c10: aa1803e0     	mov	x0, x24
 4662c14: 52800021     	mov	w1, #0x1                ; =1
 4662c18: 975009a6     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4662c1c: 17fffde9     	b	0x46623c0 <_ChromeMain+0x465d124>
 4662c20: b900f33f     	str	wzr, [x25, #0xf0]
 4662c24: aa1903e0     	mov	x0, x25
 4662c28: 52800021     	mov	w1, #0x1                ; =1
 4662c2c: 975009a1     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4662c30: 17fffed3     	b	0x466277c <_ChromeMain+0x465d4e0>
 4662c34: 52800028     	mov	w8, #0x1                ; =1
 4662c38: b900f368     	str	w8, [x27, #0xf0]
 4662c3c: aa1b03e0     	mov	x0, x27
 4662c40: 52800021     	mov	w1, #0x1                ; =1
 4662c44: 9750099b     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4662c48: 17fffd1e     	b	0x46620c0 <_ChromeMain+0x465ce24>
 4662c4c: aa1a03e0     	mov	x0, x26
 4662c50: 972ba6dd     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4662c54: 52800a01     	mov	w1, #0x50               ; =80
 4662c58: 96e69898     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4662c5c: 17fffe5b     	b	0x46625c8 <_ChromeMain+0x465d32c>
 4662c60: aa1903e0     	mov	x0, x25
 4662c64: 972ba6d8     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4662c68: 52800a01     	mov	w1, #0x50               ; =80
 4662c6c: 96e69893     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4662c70: 17fffe5d     	b	0x46625e4 <_ChromeMain+0x465d348>
 4662c74: b8280009     	ldadd	w8, w9, [x0]
 4662c78: 7100013f     	cmp	w9, #0x0
 4662c7c: 54000ead     	b.le	0x4662e50 <_ChromeMain+0x465dbb4>
 4662c80: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4662c84: 6b0a013f     	cmp	w9, w10
 4662c88: 54ffd121     	b.ne	0x46626ac <_ChromeMain+0x465d410>
 4662c8c: d4200000     	brk	#0
 4662c90: d4400000     	hlt	#0
 4662c94: d4200020     	brk	#0x1
 4662c98: 12800008     	mov	w8, #-0x1               ; =-1
 4662c9c: b8e80008     	ldaddal	w8, w8, [x0]
 4662ca0: 7100051f     	cmp	w8, #0x1
 4662ca4: 54ffae41     	b.ne	0x466226c <_ChromeMain+0x465cfd0>
 4662ca8: f9400808     	ldr	x8, [x0, #0x10]
 4662cac: d63f0100     	blr	x8
 4662cb0: 17fffd6f     	b	0x466226c <_ChromeMain+0x465cfd0>
 4662cb4: 390edb1f     	strb	wzr, [x24, #0x3b6]
 4662cb8: aa1803e0     	mov	x0, x24
 4662cbc: 97231593     	bl	0xf28308 <_ChromeMain+0xf2306c>
 4662cc0: aa1803e0     	mov	x0, x24
 4662cc4: 52800041     	mov	w1, #0x2                ; =2
 4662cc8: 9705fb27     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4662ccc: 9103e300     	add	x0, x24, #0xf8
 4662cd0: 910edb01     	add	x1, x24, #0x3b6
 4662cd4: 972314bf     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4662cd8: f94002f8     	ldr	x24, [x23]
 4662cdc: 17fffe00     	b	0x46624dc <_ChromeMain+0x465d240>
 4662ce0: a90fd77a     	stp	x26, x21, [x27, #0xf8]
 4662ce4: aa1b03e0     	mov	x0, x27
 4662ce8: 52800021     	mov	w1, #0x1                ; =1
 4662cec: 97500971     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4662cf0: 17fffd09     	b	0x4662114 <_ChromeMain+0x465ce78>
 4662cf4: d2800088     	mov	x8, #0x4                ; =4
 4662cf8: f2c00108     	movk	x8, #0x8, lsl #32
 4662cfc: 4e080d00     	dup.2d	v0, x8
 4662d00: 3c8f8300     	stur	q0, [x24, #0xf8]
 4662d04: aa1803e0     	mov	x0, x24
 4662d08: 52800021     	mov	w1, #0x1                ; =1
 4662d0c: 97500969     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4662d10: 17fffdbf     	b	0x466240c <_ChromeMain+0x465d170>
 4662d14: 97220cfb     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4662d18: 35000a20     	cbnz	w0, 0x4662e5c <_ChromeMain+0x465dbc0>
 4662d1c: aa1503e0     	mov	x0, x21
 4662d20: 9731ee4d     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4662d24: aa0003f8     	mov	x24, x0
 4662d28: f94166a0     	ldr	x0, [x21, #0x2c8]
 4662d2c: f90166b8     	str	x24, [x21, #0x2c8]
 4662d30: b4ffb0e0     	cbz	x0, 0x466234c <_ChromeMain+0x465d0b0>
 4662d34: f9400008     	ldr	x8, [x0]
 4662d38: f9400508     	ldr	x8, [x8, #0x8]
 4662d3c: d63f0100     	blr	x8
 4662d40: f94166b8     	ldr	x24, [x21, #0x2c8]
 4662d44: 17fffd82     	b	0x466234c <_ChromeMain+0x465d0b0>
 4662d48: aa1903e0     	mov	x0, x25
 4662d4c: 976f0cfd     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4662d50: b940433b     	ldr	w27, [x25, #0x40]
 4662d54: 17fffdfc     	b	0x4662544 <_ChromeMain+0x465d2a8>
 4662d58: aa1a03e0     	mov	x0, x26
 4662d5c: 976f0cf9     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4662d60: b9404342     	ldr	w2, [x26, #0x40]
 4662d64: 17fffe09     	b	0x4662588 <_ChromeMain+0x465d2ec>
 4662d68: 97f1c264     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4662d6c: 17fffcfd     	b	0x4662160 <_ChromeMain+0x465cec4>
 4662d70: 97f1c262     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4662d74: 17fffda8     	b	0x4662414 <_ChromeMain+0x465d178>
 4662d78: 97f1c260     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4662d7c: 17fffe5f     	b	0x46626f8 <_ChromeMain+0x465d45c>
 4662d80: 97f1c25e     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4662d84: 17ffff36     	b	0x4662a5c <_ChromeMain+0x465d7c0>
 4662d88: d4200000     	brk	#0
 4662d8c: d4400000     	hlt	#0
 4662d90: d4200020     	brk	#0x1
 4662d94: d4200000     	brk	#0
 4662d98: d4400000     	hlt	#0
 4662d9c: d4200020     	brk	#0x1
 4662da0: d4200000     	brk	#0
 4662da4: d4400000     	hlt	#0
 4662da8: d4200020     	brk	#0x1
 4662dac: d4200000     	brk	#0
 4662db0: d4400000     	hlt	#0
 4662db4: d4200020     	brk	#0x1
 4662db8: d4200000     	brk	#0
 4662dbc: d4400000     	hlt	#0
 4662dc0: d4200020     	brk	#0x1
 4662dc4: d4200000     	brk	#0
 4662dc8: d4400000     	hlt	#0
 4662dcc: d4200020     	brk	#0x1
 4662dd0: d4200000     	brk	#0
 4662dd4: d4400000     	hlt	#0
 4662dd8: d4200020     	brk	#0x1
 4662ddc: d4200000     	brk	#0
 4662de0: d4400000     	hlt	#0
 4662de4: d4200020     	brk	#0x1
 4662de8: d4200000     	brk	#0
 4662dec: d4400000     	hlt	#0
 4662df0: d4200020     	brk	#0x1
 4662df4: d4200000     	brk	#0
 4662df8: d4400000     	hlt	#0
 4662dfc: d4200020     	brk	#0x1
 4662e00: aa1903e0     	mov	x0, x25
 4662e04: 976f0ccf     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4662e08: b9404728     	ldr	w8, [x25, #0x44]
 4662e0c: 17fffdc9     	b	0x4662530 <_ChromeMain+0x465d294>
 4662e10: aa1903e0     	mov	x0, x25
 4662e14: 976f0ccb     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4662e18: b9404b23     	ldr	w3, [x25, #0x48]
 4662e1c: 17fffdcd     	b	0x4662550 <_ChromeMain+0x465d2b4>
 4662e20: f9400008     	ldr	x8, [x0]
 4662e24: f9400508     	ldr	x8, [x8, #0x8]
 4662e28: d63f0100     	blr	x8
 4662e2c: 17fffede     	b	0x46629a4 <_ChromeMain+0x465d708>
 4662e30: 97f1c232     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4662e34: 17fffe78     	b	0x4662814 <_ChromeMain+0x465d578>
 4662e38: d4200000     	brk	#0
 4662e3c: d4400000     	hlt	#0
 4662e40: d4200020     	brk	#0x1
 4662e44: d4200000     	brk	#0
 4662e48: d4400000     	hlt	#0
 4662e4c: d4200020     	brk	#0x1
 4662e50: d4200000     	brk	#0
 4662e54: d4400000     	hlt	#0
 4662e58: d4200020     	brk	#0x1
 4662e5c: 52803600     	mov	w0, #0x1b0              ; =432
 4662e60: 96e6b142     	bl	0xf368 <_ChromeMain+0xa0cc>
 4662e64: aa0003f8     	mov	x24, x0
 4662e68: aa1503e1     	mov	x1, x21
 4662e6c: 97220b45     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4662e70: 17ffffae     	b	0x4662d28 <_ChromeMain+0x465da8c>
