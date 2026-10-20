
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4152118: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 415211c: a90167fa     	stp	x26, x25, [sp, #0x10]
 4152120: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4152124: a90357f6     	stp	x22, x21, [sp, #0x30]
 4152128: a9044ff4     	stp	x20, x19, [sp, #0x40]
 415212c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4152130: 910143fd     	add	x29, sp, #0x50
 4152134: aa0703f6     	mov	x22, x7
 4152138: aa0603f7     	mov	x23, x6
 415213c: aa0503f8     	mov	x24, x5
 4152140: aa0403f9     	mov	x25, x4
 4152144: aa0303fa     	mov	x26, x3
 4152148: aa0203fb     	mov	x27, x2
 415214c: aa0103fc     	mov	x28, x1
 4152150: aa0003f3     	mov	x19, x0
 4152154: a94153b5     	ldp	x21, x20, [x29, #0x10]
 4152158: 94fac584     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 415215c: f100037f     	cmp	x27, #0x0
 4152160: 9a9c0340     	csel	x0, x26, x28, eq
 4152164: 9a9b0321     	csel	x1, x25, x27, eq
 4152168: 9400005d     	bl	0x41522dc <_ChromeMain+0x414d040>
 415216c: 94fac573     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4152170: aa0003fc     	mov	x28, x0
 4152174: aa1303e0     	mov	x0, x19
 4152178: aa1c03e2     	mov	x2, x28
 415217c: 95fffc4e     	bl	0xc1512b4 <_ChromeMain+0xc14c018>
 4152180: aa1c03e0     	mov	x0, x28
 4152184: 94fac576     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4152188: b40005fb     	cbz	x27, 0x4152244 <_ChromeMain+0x414cfa8>
 415218c: aa1a03e0     	mov	x0, x26
 4152190: aa1903e1     	mov	x1, x25
 4152194: 94000052     	bl	0x41522dc <_ChromeMain+0x414d040>
 4152198: 94fac568     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 415219c: aa0003f9     	mov	x25, x0
 41521a0: aa1303e0     	mov	x0, x19
 41521a4: aa1903e2     	mov	x2, x25
 41521a8: 95fffc46     	bl	0xc1512c0 <_ChromeMain+0xc14c024>
 41521ac: aa1903e0     	mov	x0, x25
 41521b0: 94fac56b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 41521b4: aa1303e0     	mov	x0, x19
 41521b8: d2800002     	mov	x2, #0x0                ; =0
 41521bc: 95fffc44     	bl	0xc1512cc <_ChromeMain+0xc14c030>
 41521c0: 7100071f     	cmp	w24, #0x1
 41521c4: 54000621     	b.ne	0x4152288 <_ChromeMain+0x414cfec>
 41521c8: b4000496     	cbz	x22, 0x4152258 <_ChromeMain+0x414cfbc>
 41521cc: aa1703e0     	mov	x0, x23
 41521d0: aa1603e1     	mov	x1, x22
 41521d4: 94000042     	bl	0x41522dc <_ChromeMain+0x414d040>
 41521d8: 94fac558     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 41521dc: aa0003f6     	mov	x22, x0
 41521e0: aa1303e0     	mov	x0, x19
 41521e4: aa1603e2     	mov	x2, x22
 41521e8: 95fffc3c     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 41521ec: aa1d03fd     	mov	x29, x29
 41521f0: 95728a6d     	bl	0x9df4ba4 <_ChromeMain+0x9def908>
 41521f4: aa1603e0     	mov	x0, x22
 41521f8: 94fac559     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 41521fc: b4000374     	cbz	x20, 0x4152268 <_ChromeMain+0x414cfcc>
 4152200: aa1503e0     	mov	x0, x21
 4152204: aa1403e1     	mov	x1, x20
 4152208: 94000035     	bl	0x41522dc <_ChromeMain+0x414d040>
 415220c: 94fac54b     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4152210: aa0003f5     	mov	x21, x0
 4152214: aa1303e0     	mov	x0, x19
 4152218: aa1503e2     	mov	x2, x21
 415221c: 95fffc2f     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 4152220: 94fac546     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4152224: aa0003f4     	mov	x20, x0
 4152228: aa1503e0     	mov	x0, x21
 415222c: 94fac54c     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4152230: f0054ee2     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 4152234: 91096042     	add	x2, x2, #0x258
 4152238: aa1403e0     	mov	x0, x20
 415223c: 956c6348     	bl	0x9c6af5c <_ChromeMain+0x9c65cc0>
 4152240: 1400001d     	b	0x41522b4 <_ChromeMain+0x414d018>
 4152244: b0054ee2     	adrp	x2, 0xeb2f000 <dyld_stub_binder+0xeb2f000>
 4152248: 9103e042     	add	x2, x2, #0xf8
 415224c: aa1303e0     	mov	x0, x19
 4152250: 95fffc1c     	bl	0xc1512c0 <_ChromeMain+0xc14c024>
 4152254: 17ffffd8     	b	0x41521b4 <_ChromeMain+0x414cf18>
 4152258: 5285a040     	mov	w0, #0x2d02             ; =11522
 415225c: 97aa6326     	bl	0x2beaef4 <_ChromeMain+0x2be5c58>
 4152260: 94fac536     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4152264: 17ffffde     	b	0x41521dc <_ChromeMain+0x414cf40>
 4152268: 5292dcc0     	mov	w0, #0x96e6             ; =38630
 415226c: 97aa6322     	bl	0x2beaef4 <_ChromeMain+0x2be5c58>
 4152270: 94fac532     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4152274: 17ffffe7     	b	0x4152210 <_ChromeMain+0x414cf74>
 4152278: 5292dda0     	mov	w0, #0x96ed             ; =38637
 415227c: 97aa631e     	bl	0x2beaef4 <_ChromeMain+0x2be5c58>
 4152280: 94fac52e     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4152284: 14000006     	b	0x415229c <_ChromeMain+0x414d000>
 4152288: b4ffff96     	cbz	x22, 0x4152278 <_ChromeMain+0x414cfdc>
 415228c: aa1703e0     	mov	x0, x23
 4152290: aa1603e1     	mov	x1, x22
 4152294: 94000012     	bl	0x41522dc <_ChromeMain+0x414d040>
 4152298: 94fac528     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 415229c: aa0003f4     	mov	x20, x0
 41522a0: aa1303e0     	mov	x0, x19
 41522a4: aa1403e2     	mov	x2, x20
 41522a8: 95fffc0c     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 41522ac: aa1d03fd     	mov	x29, x29
 41522b0: 95728a3d     	bl	0x9df4ba4 <_ChromeMain+0x9def908>
 41522b4: aa1403e0     	mov	x0, x20
 41522b8: 94fac529     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 41522bc: aa1303e0     	mov	x0, x19
 41522c0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 41522c4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 41522c8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 41522cc: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 41522d0: a94167fa     	ldp	x26, x25, [sp, #0x10]
 41522d4: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 41522d8: 14fac521     	b	0x800375c <_ChromeMain+0x7ffe4c0>
 41522dc: d10143ff     	sub	sp, sp, #0x50
 41522e0: a90257f6     	stp	x22, x21, [sp, #0x20]
 41522e4: a9034ff4     	stp	x20, x19, [sp, #0x30]
 41522e8: a9047bfd     	stp	x29, x30, [sp, #0x40]
 41522ec: 910103fd     	add	x29, sp, #0x40
 41522f0: 92800208     	mov	x8, #-0x11              ; =-17
 41522f4: f2efffe8     	movk	x8, #0x7fff, lsl #48
 41522f8: eb08003f     	cmp	x1, x8
 41522fc: 54000782     	b.hs	0x41523ec <_ChromeMain+0x414d150>
 4152300: aa0103f3     	mov	x19, x1
 4152304: aa0003f4     	mov	x20, x0
 4152308: f100283f     	cmp	x1, #0xa
 415230c: 54000569     	b.ls	0x41523b8 <_ChromeMain+0x414d11c>
 4152310: 927dee76     	and	x22, x19, #0x7ffffffffffffff8
 4152314: d37ffac8     	lsl	x8, x22, #1
 4152318: 91004100     	add	x0, x8, #0x10
 415231c: 96faf413     	bl	0xf368 <_ChromeMain+0xa0cc>
 4152320: aa0003f5     	mov	x21, x0
 4152324: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 4152328: cb0802c8     	sub	x8, x22, x8
 415232c: a900cfe0     	stp	x0, x19, [sp, #0x8]
 4152330: f9000fe8     	str	x8, [sp, #0x18]
 4152334: 8b1306a8     	add	x8, x21, x19, lsl #1
 4152338: eb15011f     	cmp	x8, x21
 415233c: 54000443     	b.lo	0x41523c4 <_ChromeMain+0x414d128>
 4152340: eb14011f     	cmp	x8, x20
 4152344: fa5482a2     	ccmp	x21, x20, #0x2, hi
 4152348: 540003e9     	b.ls	0x41523c4 <_ChromeMain+0x414d128>
 415234c: d37ffa62     	lsl	x2, x19, #1
 4152350: aa1503e0     	mov	x0, x21
 4152354: aa1403e1     	mov	x1, x20
 4152358: 94faf3dd     	bl	0x800f2cc <_ChromeMain+0x800a030>
 415235c: 78337abf     	strh	wzr, [x21, x19, lsl #1]
 4152360: 39807fe8     	ldrsb	x8, [sp, #0x1f]
 4152364: 910023e9     	add	x9, sp, #0x8
 4152368: a940afea     	ldp	x10, x11, [sp, #0x8]
 415236c: f100011f     	cmp	x8, #0x0
 4152370: 9a894140     	csel	x0, x10, x9, mi
 4152374: 7100011f     	cmp	w8, #0x0
 4152378: 9a884161     	csel	x1, x11, x8, mi
 415237c: 976c671b     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 4152380: 94fac4ee     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4152384: aa0003f3     	mov	x19, x0
 4152388: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 415238c: 36f800a8     	tbz	w8, #0x1f, 0x41523a0 <_ChromeMain+0x414d104>
 4152390: f94007e0     	ldr	x0, [sp, #0x8]
 4152394: f9400fe8     	ldr	x8, [sp, #0x18]
 4152398: d37ff901     	lsl	x1, x8, #1
 415239c: 96fadac7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41523a0: aa1303e0     	mov	x0, x19
 41523a4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 41523a8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 41523ac: a94257f6     	ldp	x22, x21, [sp, #0x20]
 41523b0: 910143ff     	add	sp, sp, #0x50
 41523b4: 15282bce     	b	0x8b5d2ec <_ChromeMain+0x8b58050>
 41523b8: 39007ff3     	strb	w19, [sp, #0x1f]
 41523bc: 910023f5     	add	x21, sp, #0x8
 41523c0: 17ffffdd     	b	0x4152334 <_ChromeMain+0x414d098>
 41523c4: d4200020     	brk	#0x1
 41523c8: aa0003f3     	mov	x19, x0
 41523cc: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 41523d0: 36f800a8     	tbz	w8, #0x1f, 0x41523e4 <_ChromeMain+0x414d148>
 41523d4: f94007e0     	ldr	x0, [sp, #0x8]
 41523d8: f9400fe8     	ldr	x8, [sp, #0x18]
 41523dc: d37ff901     	lsl	x1, x8, #1
 41523e0: 96fadab6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41523e4: aa1303e0     	mov	x0, x19
 41523e8: 94fac447     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 41523ec: 942f476f     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 41523f0: d102c3ff     	sub	sp, sp, #0xb0
 41523f4: a9056ffc     	stp	x28, x27, [sp, #0x50]
 41523f8: a90667fa     	stp	x26, x25, [sp, #0x60]
 41523fc: a9075ff8     	stp	x24, x23, [sp, #0x70]
 4152400: a90857f6     	stp	x22, x21, [sp, #0x80]
 4152404: a9094ff4     	stp	x20, x19, [sp, #0x90]
 4152408: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 415240c: 910283fd     	add	x29, sp, #0xa0
 4152410: aa0703f5     	mov	x21, x7
 4152414: aa0603f6     	mov	x22, x6
 4152418: aa0503f8     	mov	x24, x5
 415241c: aa0403f9     	mov	x25, x4
 4152420: aa0303fa     	mov	x26, x3
 4152424: aa0203fb     	mov	x27, x2
 4152428: aa0103f7     	mov	x23, x1
 415242c: aa0003f4     	mov	x20, x0
 4152430: d0056da8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4152434: f9401900     	ldr	x0, [x8, #0x30]
 4152438: 90046801     	adrp	x1, 0xce52000 <dyld_stub_binder+0xce52000>
 415243c: 910ff021     	add	x1, x1, #0x3fc
 4152440: 97028c4f     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 4152444: 35002120     	cbnz	w0, 0x4152868 <_ChromeMain+0x414d5cc>
 4152448: f9401bbc     	ldr	x28, [x29, #0x30]
 415244c: d0056d48     	adrp	x8, 0xeefc000 <dyld_stub_binder+0xeefc000>
 4152450: 911dc108     	add	x8, x8, #0x770
 4152454: 38bfc108     	ldaprb	w8, [x8]
 4152458: 36001648     	tbz	w8, #0x0, 0x4152720 <_ChromeMain+0x414d484>
 415245c: 52800028     	mov	w8, #0x1                ; =1
 4152460: d0056d49     	adrp	x9, 0xeefc000 <dyld_stub_binder+0xeefc000>
 4152464: 391d0128     	strb	w8, [x9, #0x740]
 4152468: 52800500     	mov	w0, #0x28               ; =40
 415246c: 96faf3bf     	bl	0xf368 <_ChromeMain+0xa0cc>
 4152470: aa0003f3     	mov	x19, x0
 4152474: f9000ff6     	str	x22, [sp, #0x18]
 4152478: f900001c     	str	x28, [x0]
 415247c: aa0003fc     	mov	x28, x0
 4152480: f8008f9f     	str	xzr, [x28, #0x8]!
 4152484: f900081f     	str	xzr, [x0, #0x10]
 4152488: 52800100     	mov	w0, #0x8                ; =8
 415248c: 96faf3b7     	bl	0xf368 <_ChromeMain+0xa0cc>
 4152490: b900001f     	str	wzr, [x0]
 4152494: 3900101f     	strb	wzr, [x0, #0x4]
 4152498: b40000c0     	cbz	x0, 0x41524b0 <_ChromeMain+0x414d214>
 415249c: 52800028     	mov	w8, #0x1                ; =1
 41524a0: b8280008     	ldadd	w8, w8, [x0]
 41524a4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 41524a8: 6b09011f     	cmp	w8, w9
 41524ac: 54001e40     	b.eq	0x4152874 <_ChromeMain+0x414d5d8>
 41524b0: aa1503f6     	mov	x22, x21
 41524b4: f9000bf4     	str	x20, [sp, #0x10]
 41524b8: a901ce60     	stp	x0, x19, [x19, #0x18]
 41524bc: f0055cc8     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 41524c0: f9454d00     	ldr	x0, [x8, #0xa98]
 41524c4: 952960bd     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 41524c8: a94157b4     	ldp	x20, x21, [x29, #0x10]
 41524cc: f9400388     	ldr	x8, [x28]
 41524d0: f9000380     	str	x0, [x28]
 41524d4: aa0803e0     	mov	x0, x8
 41524d8: 94fac4a1     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 41524dc: f9400380     	ldr	x0, [x28]
 41524e0: a90057f4     	stp	x20, x21, [sp]
 41524e4: aa1703e1     	mov	x1, x23
 41524e8: aa1b03e2     	mov	x2, x27
 41524ec: aa1a03e3     	mov	x3, x26
 41524f0: aa1903e4     	mov	x4, x25
 41524f4: aa1803e5     	mov	x5, x24
 41524f8: f9400fe6     	ldr	x6, [sp, #0x18]
 41524fc: aa1603e7     	mov	x7, x22
 4152500: 97ffff06     	bl	0x4152118 <_ChromeMain+0x414ce7c>
 4152504: f94017b4     	ldr	x20, [x29, #0x28]
 4152508: b40003d4     	cbz	x20, 0x4152580 <_ChromeMain+0x414d2e4>
 415250c: f0055cc8     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4152510: f9463500     	ldr	x0, [x8, #0xc68]
 4152514: 95303989     	bl	0x8d60b38 <_ChromeMain+0x8d5b89c>
 4152518: f004f6a8     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 415251c: f9433d08     	ldr	x8, [x8, #0x678]
 4152520: 6d400500     	ldp	d0, d1, [x8]
 4152524: 6d410d02     	ldp	d2, d3, [x8, #0x10]
 4152528: 95b4e6bc     	bl	0xae8c018 <_ChromeMain+0xae86d7c>
 415252c: f9400a68     	ldr	x8, [x19, #0x10]
 4152530: f9000a60     	str	x0, [x19, #0x10]
 4152534: aa0803e0     	mov	x0, x8
 4152538: 94fac489     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 415253c: f9400a60     	ldr	x0, [x19, #0x10]
 4152540: 52800062     	mov	w2, #0x3                ; =3
 4152544: 95ffdc04     	bl	0xc149554 <_ChromeMain+0xc1442b8>
 4152548: f94013a0     	ldr	x0, [x29, #0x20]
 415254c: aa1403e1     	mov	x1, x20
 4152550: 97ffff63     	bl	0x41522dc <_ChromeMain+0x414d040>
 4152554: 94fac479     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4152558: aa0003f4     	mov	x20, x0
 415255c: f9400a60     	ldr	x0, [x19, #0x10]
 4152560: aa1403e2     	mov	x2, x20
 4152564: 95bcfab4     	bl	0xb091034 <_ChromeMain+0xb08bd98>
 4152568: aa1403e0     	mov	x0, x20
 415256c: 94fac47c     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4152570: f9400a60     	ldr	x0, [x19, #0x10]
 4152574: 95fffb44     	bl	0xc151284 <_ChromeMain+0xc14bfe8>
 4152578: a9408a60     	ldp	x0, x2, [x19, #0x8]
 415257c: 95fffb45     	bl	0xc151290 <_ChromeMain+0xc14bff4>
 4152580: 52800100     	mov	w0, #0x8                ; =8
 4152584: 96faf379     	bl	0xf368 <_ChromeMain+0xa0cc>
 4152588: aa0003f4     	mov	x20, x0
 415258c: f900001f     	str	xzr, [x0]
 4152590: f9400be8     	ldr	x8, [sp, #0x10]
 4152594: f9400100     	ldr	x0, [x8]
 4152598: 951466dd     	bl	0x866c10c <_ChromeMain+0x8666e70>
 415259c: aa0003f5     	mov	x21, x0
 41525a0: aa1403e0     	mov	x0, x20
 41525a4: aa1503e1     	mov	x1, x21
 41525a8: 951466d6     	bl	0x866c100 <_ChromeMain+0x8666e64>
 41525ac: aa1503e0     	mov	x0, x21
 41525b0: 94fac46b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 41525b4: aa1403e0     	mov	x0, x20
 41525b8: 951466d5     	bl	0x866c10c <_ChromeMain+0x8666e70>
 41525bc: aa0003f5     	mov	x21, x0
 41525c0: 95ab69fe     	bl	0xac2cdb8 <_ChromeMain+0xac27b1c>
 41525c4: 94fac45d     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 41525c8: aa0003f6     	mov	x22, x0
 41525cc: 94fac464     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 41525d0: b4000116     	cbz	x22, 0x41525f0 <_ChromeMain+0x414d354>
 41525d4: aa1503e0     	mov	x0, x21
 41525d8: 95ab69f8     	bl	0xac2cdb8 <_ChromeMain+0xac27b1c>
 41525dc: 94fac457     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 41525e0: aa0003f6     	mov	x22, x0
 41525e4: aa1503e0     	mov	x0, x21
 41525e8: 94fac45d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 41525ec: aa1603f5     	mov	x21, x22
 41525f0: b40000f5     	cbz	x21, 0x415260c <_ChromeMain+0x414d370>
 41525f4: aa1503e0     	mov	x0, x21
 41525f8: 95fd3b17     	bl	0xc0a1254 <_ChromeMain+0xc09bfb8>
 41525fc: 94fac44f     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4152600: aa0003f6     	mov	x22, x0
 4152604: 94fac456     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4152608: b40002d6     	cbz	x22, 0x4152660 <_ChromeMain+0x414d3c4>
 415260c: f9400380     	ldr	x0, [x28]
 4152610: 95fffb23     	bl	0xc15129c <_ChromeMain+0xc14c000>
 4152614: aa0003e1     	mov	x1, x0
 4152618: aa1303e0     	mov	x0, x19
 415261c: 9400009f     	bl	0x4152898 <_ChromeMain+0x414d5fc>
 4152620: aa1503e0     	mov	x0, x21
 4152624: 94fac44e     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4152628: b40000d4     	cbz	x20, 0x4152640 <_ChromeMain+0x414d3a4>
 415262c: aa1403e0     	mov	x0, x20
 4152630: 951466ba     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4152634: aa1403e0     	mov	x0, x20
 4152638: 52800101     	mov	w1, #0x8                ; =8
 415263c: 96fada1f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4152640: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 4152644: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 4152648: a94857f6     	ldp	x22, x21, [sp, #0x80]
 415264c: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 4152650: a94667fa     	ldp	x26, x25, [sp, #0x60]
 4152654: a9456ffc     	ldp	x28, x27, [sp, #0x50]
 4152658: 9102c3ff     	add	sp, sp, #0xb0
 415265c: d65f03c0     	ret
 4152660: f9400e76     	ldr	x22, [x19, #0x18]
 4152664: b40000d6     	cbz	x22, 0x415267c <_ChromeMain+0x414d3e0>
 4152668: 52800028     	mov	w8, #0x1                ; =1
 415266c: b82802c8     	ldadd	w8, w8, [x22]
 4152670: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4152674: 6b09011f     	cmp	w8, w9
 4152678: 54001040     	b.eq	0x4152880 <_ChromeMain+0x414d5e4>
 415267c: f9401268     	ldr	x8, [x19, #0x20]
 4152680: f9400660     	ldr	x0, [x19, #0x8]
 4152684: d004f6a9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4152688: f9454129     	ldr	x9, [x9, #0xa80]
 415268c: 52b8c00a     	mov	w10, #-0x3a000000       ; =-973078528
 4152690: 10001bcb     	adr	x11, 0x4152a08 <_ChromeMain+0x414d76c>
 4152694: d503201f     	nop
 4152698: a9022be9     	stp	x9, x10, [sp, #0x20]
 415269c: b00539c9     	adrp	x9, 0xe88b000 <dyld_stub_binder+0xe88b000>
 41526a0: 91360129     	add	x9, x9, #0xd80
 41526a4: a90327eb     	stp	x11, x9, [sp, #0x30]
 41526a8: f90023f6     	str	x22, [sp, #0x40]
 41526ac: b40000d6     	cbz	x22, 0x41526c4 <_ChromeMain+0x414d428>
 41526b0: 52800029     	mov	w9, #0x1                ; =1
 41526b4: b82902c9     	ldadd	w9, w9, [x22]
 41526b8: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 41526bc: 6b0a013f     	cmp	w9, w10
 41526c0: 54000e60     	b.eq	0x415288c <_ChromeMain+0x414d5f0>
 41526c4: f90027e8     	str	x8, [sp, #0x48]
 41526c8: 910083e3     	add	x3, sp, #0x20
 41526cc: aa1503e2     	mov	x2, x21
 41526d0: 95fffcec     	bl	0xc151a80 <_ChromeMain+0xc14c7e4>
 41526d4: f94023e0     	ldr	x0, [sp, #0x40]
 41526d8: b5000140     	cbnz	x0, 0x4152700 <_ChromeMain+0x414d464>
 41526dc: b4fffa36     	cbz	x22, 0x4152620 <_ChromeMain+0x414d384>
 41526e0: 12800008     	mov	w8, #-0x1               ; =-1
 41526e4: b8e802c8     	ldaddal	w8, w8, [x22]
 41526e8: 7100051f     	cmp	w8, #0x1
 41526ec: 54fff9a1     	b.ne	0x4152620 <_ChromeMain+0x414d384>
 41526f0: aa1603e0     	mov	x0, x22
 41526f4: 52800101     	mov	w1, #0x8                ; =8
 41526f8: 96fad9f0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41526fc: 17ffffc9     	b	0x4152620 <_ChromeMain+0x414d384>
 4152700: 12800008     	mov	w8, #-0x1               ; =-1
 4152704: b8e80008     	ldaddal	w8, w8, [x0]
 4152708: 7100051f     	cmp	w8, #0x1
 415270c: 54fffe81     	b.ne	0x41526dc <_ChromeMain+0x414d440>
 4152710: 52800101     	mov	w1, #0x8                ; =8
 4152714: 96fad9e9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4152718: b4fff856     	cbz	x22, 0x4152620 <_ChromeMain+0x414d384>
 415271c: 17fffff1     	b	0x41526e0 <_ChromeMain+0x414d444>
 4152720: d0056d40     	adrp	x0, 0xeefc000 <dyld_stub_binder+0xeefc000>
 4152724: 911dc000     	add	x0, x0, #0x770
 4152728: 94fac866     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 415272c: 34ffe980     	cbz	w0, 0x415245c <_ChromeMain+0x414d1c0>
 4152730: d0056d48     	adrp	x8, 0xeefc000 <dyld_stub_binder+0xeefc000>
 4152734: 911d0108     	add	x8, x8, #0x740
 4152738: 3900011f     	strb	wzr, [x8]
 415273c: 6f00e400     	movi.2d	v0, #0000000000000000
 4152740: 3c808100     	stur	q0, [x8, #0x8]
 4152744: 3c818100     	stur	q0, [x8, #0x18]
 4152748: f802611f     	stur	xzr, [x8, #0x26]
 415274c: d0056d40     	adrp	x0, 0xeefc000 <dyld_stub_binder+0xeefc000>
 4152750: 911dc000     	add	x0, x0, #0x770
 4152754: 94faed98     	bl	0x800ddb4 <_ChromeMain+0x8008b18>
 4152758: 17ffff41     	b	0x415245c <_ChromeMain+0x414d1c0>
 415275c: 12800008     	mov	w8, #-0x1               ; =-1
 4152760: b8e80008     	ldaddal	w8, w8, [x0]
 4152764: 7100051f     	cmp	w8, #0x1
 4152768: 54000780     	b.eq	0x4152858 <_ChromeMain+0x414d5bc>
 415276c: 14000004     	b	0x415277c <_ChromeMain+0x414d4e0>
 4152770: aa0003f5     	mov	x21, x0
 4152774: f94023e0     	ldr	x0, [sp, #0x40]
 4152778: b5ffff20     	cbnz	x0, 0x415275c <_ChromeMain+0x414d4c0>
 415277c: b40000f6     	cbz	x22, 0x4152798 <_ChromeMain+0x414d4fc>
 4152780: 12800008     	mov	w8, #-0x1               ; =-1
 4152784: b8e802c8     	ldaddal	w8, w8, [x22]
 4152788: 7100051f     	cmp	w8, #0x1
 415278c: 54000061     	b.ne	0x4152798 <_ChromeMain+0x414d4fc>
 4152790: 1400002e     	b	0x4152848 <_ChromeMain+0x414d5ac>
 4152794: aa0003f5     	mov	x21, x0
 4152798: b4000334     	cbz	x20, 0x41527fc <_ChromeMain+0x414d560>
 415279c: aa1403e0     	mov	x0, x20
 41527a0: 9514665e     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 41527a4: aa1403e0     	mov	x0, x20
 41527a8: 52800101     	mov	w1, #0x8                ; =8
 41527ac: 14000013     	b	0x41527f8 <_ChromeMain+0x414d55c>
 41527b0: aa0003f5     	mov	x21, x0
 41527b4: f900127f     	str	xzr, [x19, #0x20]
 41527b8: f9400e68     	ldr	x8, [x19, #0x18]
 41527bc: b4000168     	cbz	x8, 0x41527e8 <_ChromeMain+0x414d54c>
 41527c0: 52800029     	mov	w9, #0x1                ; =1
 41527c4: 19004109     	stlurb	w9, [x8, #0x4]
 41527c8: f9400e60     	ldr	x0, [x19, #0x18]
 41527cc: b40000e0     	cbz	x0, 0x41527e8 <_ChromeMain+0x414d54c>
 41527d0: 12800008     	mov	w8, #-0x1               ; =-1
 41527d4: b8e80008     	ldaddal	w8, w8, [x0]
 41527d8: 7100051f     	cmp	w8, #0x1
 41527dc: 54000061     	b.ne	0x41527e8 <_ChromeMain+0x414d54c>
 41527e0: 52800101     	mov	w1, #0x8                ; =8
 41527e4: 96fad9b5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41527e8: f9400260     	ldr	x0, [x19]
 41527ec: b50000c0     	cbnz	x0, 0x4152804 <_ChromeMain+0x414d568>
 41527f0: aa1303e0     	mov	x0, x19
 41527f4: 52800501     	mov	w1, #0x28               ; =40
 41527f8: 96fad9b0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41527fc: aa1503e0     	mov	x0, x21
 4152800: 94fac341     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 4152804: 12800008     	mov	w8, #-0x1               ; =-1
 4152808: b8e80008     	ldaddal	w8, w8, [x0]
 415280c: 7100051f     	cmp	w8, #0x1
 4152810: 54ffff01     	b.ne	0x41527f0 <_ChromeMain+0x414d554>
 4152814: f9400808     	ldr	x8, [x0, #0x10]
 4152818: d63f0100     	blr	x8
 415281c: 17fffff5     	b	0x41527f0 <_ChromeMain+0x414d554>
 4152820: aa0003f5     	mov	x21, x0
 4152824: b4fffedc     	cbz	x28, 0x41527fc <_ChromeMain+0x414d560>
 4152828: 12800008     	mov	w8, #-0x1               ; =-1
 415282c: b8e80388     	ldaddal	w8, w8, [x28]
 4152830: 7100051f     	cmp	w8, #0x1
 4152834: 54fffe41     	b.ne	0x41527fc <_ChromeMain+0x414d560>
 4152838: f9400b88     	ldr	x8, [x28, #0x10]
 415283c: aa1c03e0     	mov	x0, x28
 4152840: d63f0100     	blr	x8
 4152844: 17ffffee     	b	0x41527fc <_ChromeMain+0x414d560>
 4152848: aa1603e0     	mov	x0, x22
 415284c: 52800101     	mov	w1, #0x8                ; =8
 4152850: 96fad99a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4152854: 17ffffd1     	b	0x4152798 <_ChromeMain+0x414d4fc>
 4152858: 52800101     	mov	w1, #0x8                ; =8
 415285c: 96fad997     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4152860: b5fff916     	cbnz	x22, 0x4152780 <_ChromeMain+0x414d4e4>
 4152864: 17ffffcd     	b	0x4152798 <_ChromeMain+0x414d4fc>
 4152868: d4200000     	brk	#0
 415286c: d4400000     	hlt	#0
 4152870: d4200020     	brk	#0x1
 4152874: d4200000     	brk	#0
 4152878: d4400000     	hlt	#0
 415287c: d4200020     	brk	#0x1
 4152880: d4200000     	brk	#0
 4152884: d4400000     	hlt	#0
 4152888: d4200020     	brk	#0x1
 415288c: d4200000     	brk	#0
 4152890: d4400000     	hlt	#0
 4152894: d4200020     	brk	#0x1
 4152898: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 415289c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 41528a0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 41528a4: 910083fd     	add	x29, sp, #0x20
 41528a8: aa0103f5     	mov	x21, x1
 41528ac: aa0003f3     	mov	x19, x0
 41528b0: f9400814     	ldr	x20, [x0, #0x10]
 41528b4: aa1403e0     	mov	x0, x20
 41528b8: 94fac3ac     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 41528bc: f10fa2bf     	cmp	x21, #0x3e8
 41528c0: 54000121     	b.ne	0x41528e4 <_ChromeMain+0x414d648>
 41528c4: b40000d4     	cbz	x20, 0x41528dc <_ChromeMain+0x414d640>
 41528c8: aa1403e0     	mov	x0, x20
 41528cc: 95fffa77     	bl	0xc1512a8 <_ChromeMain+0xc14c00c>
 41528d0: f100041f     	cmp	x0, #0x1
 41528d4: 1a9f17f5     	cset	w21, eq
 41528d8: 14000004     	b	0x41528e8 <_ChromeMain+0x414d64c>
 41528dc: 52800035     	mov	w21, #0x1               ; =1
 41528e0: 14000002     	b	0x41528e8 <_ChromeMain+0x414d64c>
 41528e4: 52800015     	mov	w21, #0x0               ; =0
 41528e8: aa1403e0     	mov	x0, x20
 41528ec: 94fac39c     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 41528f0: f9400274     	ldr	x20, [x19]
 41528f4: b4000854     	cbz	x20, 0x41529fc <_ChromeMain+0x414d760>
 41528f8: f900027f     	str	xzr, [x19]
 41528fc: f9400688     	ldr	x8, [x20, #0x8]
 4152900: aa1403e0     	mov	x0, x20
 4152904: aa1503e1     	mov	x1, x21
 4152908: d63f0100     	blr	x8
 415290c: 12800008     	mov	w8, #-0x1               ; =-1
 4152910: b8e80288     	ldaddal	w8, w8, [x20]
 4152914: 7100051f     	cmp	w8, #0x1
 4152918: 54000081     	b.ne	0x4152928 <_ChromeMain+0x414d68c>
 415291c: f9400a88     	ldr	x8, [x20, #0x10]
 4152920: aa1403e0     	mov	x0, x20
 4152924: d63f0100     	blr	x8
 4152928: f9400660     	ldr	x0, [x19, #0x8]
 415292c: f900067f     	str	xzr, [x19, #0x8]
 4152930: 94fac38b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4152934: f9400a60     	ldr	x0, [x19, #0x10]
 4152938: f9000a7f     	str	xzr, [x19, #0x10]
 415293c: 94fac388     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4152940: b4000353     	cbz	x19, 0x41529a8 <_ChromeMain+0x414d70c>
 4152944: f900127f     	str	xzr, [x19, #0x20]
 4152948: f9400e68     	ldr	x8, [x19, #0x18]
 415294c: b4000168     	cbz	x8, 0x4152978 <_ChromeMain+0x414d6dc>
 4152950: 52800029     	mov	w9, #0x1                ; =1
 4152954: 19004109     	stlurb	w9, [x8, #0x4]
 4152958: f9400e60     	ldr	x0, [x19, #0x18]
 415295c: b40000e0     	cbz	x0, 0x4152978 <_ChromeMain+0x414d6dc>
 4152960: 12800008     	mov	w8, #-0x1               ; =-1
 4152964: b8e80008     	ldaddal	w8, w8, [x0]
 4152968: 7100051f     	cmp	w8, #0x1
 415296c: 54000061     	b.ne	0x4152978 <_ChromeMain+0x414d6dc>
 4152970: 52800101     	mov	w1, #0x8                ; =8
 4152974: 96fad951     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4152978: f9400a60     	ldr	x0, [x19, #0x10]
 415297c: 94fac378     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4152980: f9400660     	ldr	x0, [x19, #0x8]
 4152984: 94fac376     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4152988: f9400260     	ldr	x0, [x19]
 415298c: b5000160     	cbnz	x0, 0x41529b8 <_ChromeMain+0x414d71c>
 4152990: aa1303e0     	mov	x0, x19
 4152994: 52800501     	mov	w1, #0x28               ; =40
 4152998: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 415299c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 41529a0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 41529a4: 16fad945     	b	0x8eb8 <_ChromeMain+0x3c1c>
 41529a8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 41529ac: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 41529b0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 41529b4: d65f03c0     	ret
 41529b8: 12800008     	mov	w8, #-0x1               ; =-1
 41529bc: b8e80008     	ldaddal	w8, w8, [x0]
 41529c0: 7100051f     	cmp	w8, #0x1
 41529c4: 54fffe61     	b.ne	0x4152990 <_ChromeMain+0x414d6f4>
 41529c8: f9400808     	ldr	x8, [x0, #0x10]
 41529cc: d63f0100     	blr	x8
 41529d0: 17fffff0     	b	0x4152990 <_ChromeMain+0x414d6f4>
 41529d4: aa0003f3     	mov	x19, x0
 41529d8: 12800008     	mov	w8, #-0x1               ; =-1
 41529dc: b8e80288     	ldaddal	w8, w8, [x20]
 41529e0: 7100051f     	cmp	w8, #0x1
 41529e4: 54000081     	b.ne	0x41529f4 <_ChromeMain+0x414d758>
 41529e8: f9400a88     	ldr	x8, [x20, #0x10]
 41529ec: aa1403e0     	mov	x0, x20
 41529f0: d63f0100     	blr	x8
 41529f4: aa1303e0     	mov	x0, x19
 41529f8: 94fac2c3     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 41529fc: d4200000     	brk	#0
 4152a00: d4400000     	hlt	#0
 4152a04: d4200020     	brk	#0x1
 4152a08: f9401008     	ldr	x8, [x0, #0x20]
 4152a0c: b4000068     	cbz	x8, 0x4152a18 <_ChromeMain+0x414d77c>
 4152a10: 19404108     	ldapurb	w8, [x8, #0x4]
 4152a14: 34000048     	cbz	w8, 0x4152a1c <_ChromeMain+0x414d780>
 4152a18: d65f03c0     	ret
 4152a1c: f9401408     	ldr	x8, [x0, #0x28]
 4152a20: b4ffffc8     	cbz	x8, 0x4152a18 <_ChromeMain+0x414d77c>
 4152a24: f9401008     	ldr	x8, [x0, #0x20]
 4152a28: b40000a8     	cbz	x8, 0x4152a3c <_ChromeMain+0x414d7a0>
 4152a2c: 19404108     	ldapurb	w8, [x8, #0x4]
 4152a30: 35000068     	cbnz	w8, 0x4152a3c <_ChromeMain+0x414d7a0>
 4152a34: f9401400     	ldr	x0, [x0, #0x28]
 4152a38: 17ffff98     	b	0x4152898 <_ChromeMain+0x414d5fc>
 4152a3c: d4200000     	brk	#0
 4152a40: d4400000     	hlt	#0
 4152a44: d4200020     	brk	#0x1
 4152a48: f9401028     	ldr	x8, [x1, #0x20]
 4152a4c: f9001008     	str	x8, [x0, #0x20]
 4152a50: b40000c8     	cbz	x8, 0x4152a68 <_ChromeMain+0x414d7cc>
 4152a54: 52800029     	mov	w9, #0x1                ; =1
 4152a58: b8290108     	ldadd	w9, w8, [x8]
 4152a5c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4152a60: 6b09011f     	cmp	w8, w9
 4152a64: 54000080     	b.eq	0x4152a74 <_ChromeMain+0x414d7d8>
 4152a68: f9401428     	ldr	x8, [x1, #0x28]
 4152a6c: f9001408     	str	x8, [x0, #0x28]
 4152a70: d65f03c0     	ret
 4152a74: d4200000     	brk	#0
 4152a78: d4400000     	hlt	#0
 4152a7c: d4200020     	brk	#0x1
 4152a80: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4152a84: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4152a88: 910043fd     	add	x29, sp, #0x10
 4152a8c: aa0003f3     	mov	x19, x0
 4152a90: b0050488     	adrp	x8, 0xe1e3000 <dyld_stub_binder+0xe1e3000>
 4152a94: 911fc108     	add	x8, x8, #0x7f0
 4152a98: f8018408     	str	x8, [x0], #0x18
 4152a9c: 978eae9e     	bl	0x24fe514 <_ChromeMain+0x24f9278>
 4152aa0: f9400a60     	ldr	x0, [x19, #0x10]
 4152aa4: 925e7409     	and	x9, x0, #0xfffffffc00000000
 4152aa8: 90055308     	adrp	x8, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4152aac: f940450a     	ldr	x10, [x8, #0x88]
 4152ab0: eb0a013f     	cmp	x9, x10
 4152ab4: 540001c0     	b.eq	0x4152aec <_ChromeMain+0x414d850>
 4152ab8: f9000a7f     	str	xzr, [x19, #0x10]
 4152abc: f9400660     	ldr	x0, [x19, #0x8]
 4152ac0: 925e7409     	and	x9, x0, #0xfffffffc00000000
 4152ac4: f9404508     	ldr	x8, [x8, #0x88]
 4152ac8: eb08013f     	cmp	x9, x8
 4152acc: 540000c0     	b.eq	0x4152ae4 <_ChromeMain+0x414d848>
 4152ad0: f900067f     	str	xzr, [x19, #0x8]
 4152ad4: aa1303e0     	mov	x0, x19
 4152ad8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4152adc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
