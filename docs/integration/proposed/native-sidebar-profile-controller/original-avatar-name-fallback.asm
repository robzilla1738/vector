
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 220801c: d10203ff     	sub	sp, sp, #0x80
 2208020: a90557f6     	stp	x22, x21, [sp, #0x50]
 2208024: a9064ff4     	stp	x20, x19, [sp, #0x60]
 2208028: a9077bfd     	stp	x29, x30, [sp, #0x70]
 220802c: 9101c3fd     	add	x29, sp, #0x70
 2208030: aa0003f4     	mov	x20, x0
 2208034: aa0803f3     	mov	x19, x8
 2208038: d00666f6     	adrp	x22, 0xeee6000 <dyld_stub_binder+0xeee6000>
 220803c: f9467ec0     	ldr	x0, [x22, #0xcf8]
 2208040: 97e05ece     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 2208044: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 2208048: f90023ff     	str	xzr, [sp, #0x40]
 220804c: 39c19c08     	ldrsb	w8, [x0, #0x67]
 2208050: 37f808c8     	tbnz	w8, #0x1f, 0x2208168 <_ChromeMain+0x2202ecc>
 2208054: 3cc50000     	ldur	q0, [x0, #0x50]
 2208058: f8460008     	ldur	x8, [x0, #0x60]
 220805c: f90023e8     	str	x8, [sp, #0x40]
 2208060: 3d800fe0     	str	q0, [sp, #0x30]
 2208064: f0056781     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 2208068: 9107d821     	add	x1, x1, #0x1f6
 220806c: 910063e8     	add	x8, sp, #0x18
 2208070: 9100c3e0     	add	x0, sp, #0x30
 2208074: 528001a2     	mov	w2, #0xd                ; =13
 2208078: 97d244e7     	bl	0x1699414 <_ChromeMain+0x1694178>
 220807c: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 2208080: 37f80868     	tbnz	w8, #0x1f, 0x220818c <_ChromeMain+0x2202ef0>
 2208084: 910063e1     	add	x1, sp, #0x18
 2208088: aa1403e0     	mov	x0, x20
 220808c: 97bb101e     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 2208090: aa0003f5     	mov	x21, x0
 2208094: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 2208098: 37f80708     	tbnz	w8, #0x1f, 0x2208178 <_ChromeMain+0x2202edc>
 220809c: 35000835     	cbnz	w21, 0x22081a0 <_ChromeMain+0x2202f04>
 22080a0: f9467ec0     	ldr	x0, [x22, #0xcf8]
 22080a4: 97e05eb5     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 22080a8: 97e05eda     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 22080ac: aa0003f5     	mov	x21, x0
 22080b0: aa1403e1     	mov	x1, x20
 22080b4: 97e05f13     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 22080b8: b4000840     	cbz	x0, 0x22081c0 <_ChromeMain+0x2202f24>
 22080bc: aa0003f4     	mov	x20, x0
 22080c0: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 22080c4: f90023ff     	str	xzr, [sp, #0x40]
 22080c8: 9100c3e8     	add	x8, sp, #0x30
 22080cc: 940000ad     	bl	0x2208380 <_ChromeMain+0x22030e4>
 22080d0: aa1403e0     	mov	x0, x20
 22080d4: 9400008b     	bl	0x2208300 <_ChromeMain+0x2203064>
 22080d8: 36000960     	tbz	w0, #0x0, 0x2208204 <_ChromeMain+0x2202f68>
 22080dc: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 22080e0: f90017ff     	str	xzr, [sp, #0x28]
 22080e4: 910063e8     	add	x8, sp, #0x18
 22080e8: aa1403e0     	mov	x0, x20
 22080ec: 9400012b     	bl	0x2208598 <_ChromeMain+0x22032fc>
 22080f0: 3940bfe8     	ldrb	w8, [sp, #0x2f]
 22080f4: f94013e9     	ldr	x9, [sp, #0x20]
 22080f8: 7219011f     	tst	w8, #0x80
 22080fc: 9a881128     	csel	x8, x9, x8, ne
 2208100: b5000988     	cbnz	x8, 0x2208230 <_ChromeMain+0x2202f94>
 2208104: f94006a8     	ldr	x8, [x21, #0x8]
 2208108: 926cad08     	and	x8, x8, #0xfffffffffff00000
 220810c: f144011f     	cmp	x8, #0x100, lsl #12     ; =0x100000
 2208110: 54000a61     	b.ne	0x220825c <_ChromeMain+0x2202fc0>
 2208114: f0066828     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
 2208118: f946f500     	ldr	x0, [x8, #0xde8]
 220811c: b4000640     	cbz	x0, 0x22081e4 <_ChromeMain+0x2202f48>
 2208120: a9007e7f     	stp	xzr, xzr, [x19]
 2208124: f9000a7f     	str	xzr, [x19, #0x10]
 2208128: aa1303e8     	mov	x8, x19
 220812c: 52812fc1     	mov	w1, #0x97e              ; =2430
 2208130: 97c2b16b     	bl	0x12b46dc <_ChromeMain+0x12af440>
 2208134: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 2208138: 37f805c8     	tbnz	w8, #0x1f, 0x22081f0 <_ChromeMain+0x2202f54>
 220813c: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 2208140: 36f800a8     	tbz	w8, #0x1f, 0x2208154 <_ChromeMain+0x2202eb8>
 2208144: f9401be0     	ldr	x0, [sp, #0x30]
 2208148: f94023e8     	ldr	x8, [sp, #0x40]
 220814c: d37ff901     	lsl	x1, x8, #1
 2208150: 9778035a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2208154: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 2208158: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 220815c: a94557f6     	ldp	x22, x21, [sp, #0x50]
 2208160: 910203ff     	add	sp, sp, #0x80
 2208164: d65f03c0     	ret
 2208168: a9450801     	ldp	x1, x2, [x0, #0x50]
 220816c: 9100c3e0     	add	x0, sp, #0x30
 2208170: 9778402a     	bl	0x18218 <_ChromeMain+0x12f7c>
 2208174: 17ffffbc     	b	0x2208064 <_ChromeMain+0x2202dc8>
 2208178: f9400fe0     	ldr	x0, [sp, #0x18]
 220817c: f94017e8     	ldr	x8, [sp, #0x28]
 2208180: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2208184: 9778034d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2208188: 17ffffc5     	b	0x220809c <_ChromeMain+0x2202e00>
 220818c: f9401be0     	ldr	x0, [sp, #0x30]
 2208190: f94023e8     	ldr	x8, [sp, #0x40]
 2208194: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2208198: 97780348     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 220819c: 17ffffba     	b	0x2208084 <_ChromeMain+0x2202de8>
 22081a0: f0066828     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
 22081a4: f946f500     	ldr	x0, [x8, #0xde8]
 22081a8: b4000a00     	cbz	x0, 0x22082e8 <_ChromeMain+0x220304c>
 22081ac: a9007e7f     	stp	xzr, xzr, [x19]
 22081b0: f9000a7f     	str	xzr, [x19, #0x10]
 22081b4: aa1303e8     	mov	x8, x19
 22081b8: 52812fe1     	mov	w1, #0x97f              ; =2431
 22081bc: 14000008     	b	0x22081dc <_ChromeMain+0x2202f40>
 22081c0: f0066828     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
 22081c4: f946f500     	ldr	x0, [x8, #0xde8]
 22081c8: b4000960     	cbz	x0, 0x22082f4 <_ChromeMain+0x2203058>
 22081cc: a9007e7f     	stp	xzr, xzr, [x19]
 22081d0: f9000a7f     	str	xzr, [x19, #0x10]
 22081d4: aa1303e8     	mov	x8, x19
 22081d8: 52812fc1     	mov	w1, #0x97e              ; =2430
 22081dc: 97c2b140     	bl	0x12b46dc <_ChromeMain+0x12af440>
 22081e0: 17ffffdd     	b	0x2208154 <_ChromeMain+0x2202eb8>
 22081e4: d4200000     	brk	#0
 22081e8: d4400000     	hlt	#0
 22081ec: d4200020     	brk	#0x1
 22081f0: f9400fe0     	ldr	x0, [sp, #0x18]
 22081f4: f94017e8     	ldr	x8, [sp, #0x28]
 22081f8: d37ff901     	lsl	x1, x8, #1
 22081fc: 9778032f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2208200: 17ffffcf     	b	0x220813c <_ChromeMain+0x2202ea0>
 2208204: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 2208208: 37f800c8     	tbnz	w8, #0x1f, 0x2208220 <_ChromeMain+0x2202f84>
 220820c: 3dc00fe0     	ldr	q0, [sp, #0x30]
 2208210: 3d800260     	str	q0, [x19]
 2208214: f94023e8     	ldr	x8, [sp, #0x40]
 2208218: f9000a68     	str	x8, [x19, #0x10]
 220821c: 17ffffc8     	b	0x220813c <_ChromeMain+0x2202ea0>
 2208220: a9430be1     	ldp	x1, x2, [sp, #0x30]
 2208224: aa1303e0     	mov	x0, x19
 2208228: 9778fa6a     	bl	0x46bd0 <_ChromeMain+0x41934>
 220822c: 17ffffc4     	b	0x220813c <_ChromeMain+0x2202ea0>
 2208230: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 2208234: 37f800c8     	tbnz	w8, #0x1f, 0x220824c <_ChromeMain+0x2202fb0>
 2208238: 3dc00fe0     	ldr	q0, [sp, #0x30]
 220823c: 3d800260     	str	q0, [x19]
 2208240: f94023e8     	ldr	x8, [sp, #0x40]
 2208244: f9000a68     	str	x8, [x19, #0x10]
 2208248: 17ffffbb     	b	0x2208134 <_ChromeMain+0x2202e98>
 220824c: a9430be1     	ldp	x1, x2, [sp, #0x30]
 2208250: aa1303e0     	mov	x0, x19
 2208254: 9778fa5f     	bl	0x46bd0 <_ChromeMain+0x41934>
 2208258: 17ffffb7     	b	0x2208134 <_ChromeMain+0x2202e98>
 220825c: a9007fff     	stp	xzr, xzr, [sp]
 2208260: f9000bff     	str	xzr, [sp, #0x10]
 2208264: 910003f5     	mov	x21, sp
 2208268: 910003e8     	mov	x8, sp
 220826c: aa1403e0     	mov	x0, x20
 2208270: 945fed54     	bl	0x3a037c0 <_ChromeMain+0x39fe524>
 2208274: 39405fec     	ldrb	w12, [sp, #0x17]
 2208278: 13001d88     	sxtb	w8, w12
 220827c: f94007e9     	ldr	x9, [sp, #0x8]
 2208280: 7100011f     	cmp	w8, #0x0
 2208284: 9a8c412a     	csel	x10, x9, x12, mi
 2208288: 9100c3eb     	add	x11, sp, #0x30
 220828c: f100015f     	cmp	x10, #0x0
 2208290: 9a95016b     	csel	x11, x11, x21, eq
 2208294: 39411fed     	ldrb	w13, [sp, #0x47]
 2208298: 1a8c01ac     	csel	w12, w13, w12, eq
 220829c: 3738016c     	tbnz	w12, #0x7, 0x22082c8 <_ChromeMain+0x220302c>
 22082a0: 3dc00160     	ldr	q0, [x11]
 22082a4: 3d800260     	str	q0, [x19]
 22082a8: f9400969     	ldr	x9, [x11, #0x10]
 22082ac: f9000a69     	str	x9, [x19, #0x10]
 22082b0: 363ff428     	tbz	w8, #0x7, 0x2208134 <_ChromeMain+0x2202e98>
 22082b4: f94003e0     	ldr	x0, [sp]
 22082b8: f9400be8     	ldr	x8, [sp, #0x10]
 22082bc: d37ff901     	lsl	x1, x8, #1
 22082c0: 977802fe     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 22082c4: 17ffff9c     	b	0x2208134 <_ChromeMain+0x2202e98>
 22082c8: f9400161     	ldr	x1, [x11]
 22082cc: f9401fe8     	ldr	x8, [sp, #0x38]
 22082d0: f100015f     	cmp	x10, #0x0
 22082d4: 9a890102     	csel	x2, x8, x9, eq
 22082d8: aa1303e0     	mov	x0, x19
 22082dc: 9778fa3d     	bl	0x46bd0 <_ChromeMain+0x41934>
 22082e0: 39405fe8     	ldrb	w8, [sp, #0x17]
 22082e4: 17fffff3     	b	0x22082b0 <_ChromeMain+0x2203014>
 22082e8: d4200000     	brk	#0
 22082ec: d4400000     	hlt	#0
 22082f0: d4200020     	brk	#0x1
 22082f4: d4200000     	brk	#0
 22082f8: d4400000     	hlt	#0
 22082fc: d4200020     	brk	#0x1
