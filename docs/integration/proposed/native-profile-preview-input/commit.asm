
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4656258: f941dec8     	ldr	x8, [x22, #0x3b8]
 465625c: bd4a1e60     	ldr	s0, [x19, #0xa1c]
 4656260: 52800029     	mov	w9, #0x1                ; =1
 4656264: 39286669     	strb	w9, [x19, #0xa19]
 4656268: b4fff8c8     	cbz	x8, 0x4656180 <_ChromeMain+0x4650ee4>
 465626c: 1e20c001     	fabs	s1, s0
 4656270: 1e282020     	fcmp	s1, s8
 4656274: 54fff86b     	b.lt	0x4656180 <_ChromeMain+0x4650ee4>
 4656278: bd0a2660     	str	s0, [x19, #0xa24]
 465627c: 3976c268     	ldrb	w8, [x19, #0xdb0]
 4656280: 35002048     	cbnz	w8, 0x4656688 <_ChromeMain+0x46513ec>
 4656284: f906e67f     	str	xzr, [x19, #0xdc8]
 4656288: 3975a268     	ldrb	w8, [x19, #0xd68]
 465628c: 35001988     	cbnz	w8, 0x46565bc <_ChromeMain+0x4651320>
 4656290: 1e2202a0     	scvtf	s0, w21
 4656294: bd0a2a60     	str	s0, [x19, #0xa28]
 4656298: 9128c275     	add	x21, x19, #0xa30
 465629c: 39692268     	ldrb	w8, [x19, #0xa48]
 46562a0: 35000168     	cbnz	w8, 0x46562cc <_ChromeMain+0x4651030>
 46562a4: b4001f15     	cbz	x21, 0x4656684 <_ChromeMain+0x46513e8>
 46562a8: 3dc00280     	ldr	q0, [x20]
 46562ac: f9400a88     	ldr	x8, [x20, #0x10]
 46562b0: f9000aa8     	str	x8, [x21, #0x10]
 46562b4: 3d8002a0     	str	q0, [x21]
 46562b8: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 46562bc: f900029f     	str	xzr, [x20]
 46562c0: 52800028     	mov	w8, #0x1                ; =1
 46562c4: 39292268     	strb	w8, [x19, #0xa48]
 46562c8: 14000009     	b	0x46562ec <_ChromeMain+0x4651050>
 46562cc: 39e91e68     	ldrsb	w8, [x19, #0xa47]
 46562d0: 37f81688     	tbnz	w8, #0x1f, 0x46565a0 <_ChromeMain+0x4651304>
 46562d4: 3dc00280     	ldr	q0, [x20]
 46562d8: f9400a88     	ldr	x8, [x20, #0x10]
 46562dc: f9000aa8     	str	x8, [x21, #0x10]
 46562e0: 3d8002a0     	str	q0, [x21]
 46562e4: 39005e9f     	strb	wzr, [x20, #0x17]
 46562e8: 3900029f     	strb	wzr, [x20]
 46562ec: 3977c268     	ldrb	w8, [x19, #0xdf0]
 46562f0: 35001988     	cbnz	w8, 0x4656620 <_ChromeMain+0x4651384>
 46562f4: f9422e68     	ldr	x8, [x19, #0x458]
 46562f8: b4000a48     	cbz	x8, 0x4656440 <_ChromeMain+0x46511a4>
 46562fc: f9432509     	ldr	x9, [x8, #0x648]
 4656300: b4000249     	cbz	x9, 0x4656348 <_ChromeMain+0x46510ac>
 4656304: f941d92a     	ldr	x10, [x9, #0x3b0]
 4656308: d37df154     	lsl	x20, x10, #3
 465630c: b40001f4     	cbz	x20, 0x4656348 <_ChromeMain+0x46510ac>
 4656310: f941d535     	ldr	x21, [x9, #0x3a8]
 4656314: 14000006     	b	0x465632c <_ChromeMain+0x4651090>
 4656318: 1e2e1000     	fmov	s0, #1.00000000
 465631c: 97fde3c9     	bl	0x45cf240 <_ChromeMain+0x45c9fa4>
 4656320: 910022b5     	add	x21, x21, #0x8
 4656324: f1002294     	subs	x20, x20, #0x8
 4656328: 540000c0     	b.eq	0x4656340 <_ChromeMain+0x46510a4>
 465632c: f94002a8     	ldr	x8, [x21]
 4656330: b4ffff88     	cbz	x8, 0x4656320 <_ChromeMain+0x4651084>
 4656334: f941b900     	ldr	x0, [x8, #0x370]
 4656338: b4ffff40     	cbz	x0, 0x4656320 <_ChromeMain+0x4651084>
 465633c: 17fffff7     	b	0x4656318 <_ChromeMain+0x465107c>
 4656340: f9422e68     	ldr	x8, [x19, #0x458]
 4656344: b40007e8     	cbz	x8, 0x4656440 <_ChromeMain+0x46511a4>
 4656348: f9432509     	ldr	x9, [x8, #0x648]
 465634c: b40007a9     	cbz	x9, 0x4656440 <_ChromeMain+0x46511a4>
 4656350: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 4656354: f9001fff     	str	xzr, [sp, #0x38]
 4656358: f941d92a     	ldr	x10, [x9, #0x3b0]
 465635c: d37df154     	lsl	x20, x10, #3
 4656360: b40000b4     	cbz	x20, 0x4656374 <_ChromeMain+0x46510d8>
 4656364: f941d535     	ldr	x21, [x9, #0x3a8]
 4656368: 14000010     	b	0x46563a8 <_ChromeMain+0x465110c>
 465636c: f9422e68     	ldr	x8, [x19, #0x458]
 4656370: b4000468     	cbz	x8, 0x46563fc <_ChromeMain+0x4651160>
 4656374: f9432508     	ldr	x8, [x8, #0x648]
 4656378: b4000428     	cbz	x8, 0x46563fc <_ChromeMain+0x4651160>
 465637c: f941d909     	ldr	x9, [x8, #0x3b0]
 4656380: d37df134     	lsl	x20, x9, #3
 4656384: b40003d4     	cbz	x20, 0x46563fc <_ChromeMain+0x4651160>
 4656388: f941d515     	ldr	x21, [x8, #0x3a8]
 465638c: 1400004e     	b	0x46564c4 <_ChromeMain+0x4651228>
 4656390: 9100a3e0     	add	x0, sp, #0x28
 4656394: 910083e1     	add	x1, sp, #0x20
 4656398: 94176cda     	bl	0x4c31700 <_ChromeMain+0x4c2c464>
 465639c: 910022b5     	add	x21, x21, #0x8
 46563a0: f1002294     	subs	x20, x20, #0x8
 46563a4: 54000ac0     	b.eq	0x46564fc <_ChromeMain+0x4651260>
 46563a8: f94002a8     	ldr	x8, [x21]
 46563ac: b4ffff88     	cbz	x8, 0x465639c <_ChromeMain+0x4651100>
 46563b0: f941b900     	ldr	x0, [x8, #0x370]
 46563b4: f90013e0     	str	x0, [sp, #0x20]
 46563b8: b4ffff20     	cbz	x0, 0x465639c <_ChromeMain+0x4651100>
 46563bc: f9400008     	ldr	x8, [x0]
 46563c0: f9405508     	ldr	x8, [x8, #0xa8]
 46563c4: d63f0100     	blr	x8
 46563c8: 34fffea0     	cbz	w0, 0x465639c <_ChromeMain+0x4651100>
 46563cc: f94013e8     	ldr	x8, [sp, #0x20]
 46563d0: f942e108     	ldr	x8, [x8, #0x5c0]
 46563d4: b5fffde8     	cbnz	x8, 0x4656390 <_ChromeMain+0x46510f4>
 46563d8: f9422e68     	ldr	x8, [x19, #0x458]
 46563dc: b4000108     	cbz	x8, 0x46563fc <_ChromeMain+0x4651160>
 46563e0: f9432508     	ldr	x8, [x8, #0x648]
 46563e4: b40000c8     	cbz	x8, 0x46563fc <_ChromeMain+0x4651160>
 46563e8: f941d909     	ldr	x9, [x8, #0x3b0]
 46563ec: d37df134     	lsl	x20, x9, #3
 46563f0: b4000074     	cbz	x20, 0x46563fc <_ChromeMain+0x4651160>
 46563f4: f941d515     	ldr	x21, [x8, #0x3a8]
 46563f8: 1400003c     	b	0x46564e8 <_ChromeMain+0x465124c>
 46563fc: 39286a7f     	strb	wzr, [x19, #0xa1a]
 4656400: f94017e0     	ldr	x0, [sp, #0x28]
 4656404: b40001e0     	cbz	x0, 0x4656440 <_ChromeMain+0x46511a4>
 4656408: f9401be8     	ldr	x8, [sp, #0x30]
 465640c: d37df109     	lsl	x9, x8, #3
 4656410: b4000109     	cbz	x9, 0x4656430 <_ChromeMain+0x4651194>
 4656414: cb080fe8     	neg	x8, x8, lsl #3
 4656418: 8b000129     	add	x9, x9, x0
 465641c: d1002129     	sub	x9, x9, #0x8
 4656420: b4001329     	cbz	x9, 0x4656684 <_ChromeMain+0x46513e8>
 4656424: d1002129     	sub	x9, x9, #0x8
 4656428: 91002108     	add	x8, x8, #0x8
 465642c: b5ffffa8     	cbnz	x8, 0x4656420 <_ChromeMain+0x4651184>
 4656430: f9001bff     	str	xzr, [sp, #0x30]
 4656434: f9401fe8     	ldr	x8, [sp, #0x38]
 4656438: d37df101     	lsl	x1, x8, #3
 465643c: 96e6ca9f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4656440: bd4a2a60     	ldr	s0, [x19, #0xa28]
 4656444: bd4a2661     	ldr	s1, [x19, #0xa24]
 4656448: 7ea1d400     	fabd	s0, s0, s1
 465644c: 1e2e1001     	fmov	s1, #1.00000000
 4656450: 1e212000     	fcmp	s0, s1
 4656454: 1e20cc20     	fcsel	s0, s1, s0, gt
 4656458: 1e22c000     	fcvt	d0, s0
 465645c: b004c7c8     	adrp	x8, 0xdf4f000 <dyld_stub_binder+0xdf4f000>
 4656460: fd437901     	ldr	d1, [x8, #0x6f0]
 4656464: 1e610800     	fmul	d0, d0, d1
 4656468: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 465646c: 9e670101     	fmov	d1, x8
 4656470: 1e612000     	fcmp	d0, d1
 4656474: 92f00008     	mov	x8, #0x7fffffffffffffff ; =9223372036854775807
 4656478: 9a88b3e8     	csel	x8, xzr, x8, lt
 465647c: 1e616801     	fmaxnm	d1, d0, d1
 4656480: 9e780029     	fcvtzs	x9, d1
 4656484: 92f7840a     	mov	x10, #0x43dfffffffffffff ; =4890909195324358655
 4656488: 9e670141     	fmov	d1, x10
 465648c: 1e612000     	fcmp	d0, d1
 4656490: 9a889128     	csel	x8, x9, x8, ls
 4656494: 529adb09     	mov	w9, #0xd6d8             ; =55000
 4656498: eb09011f     	cmp	x8, x9
 465649c: 9a89c108     	csel	x8, x8, x9, gt
 46564a0: f906ea68     	str	x8, [x19, #0xdd0]
 46564a4: 91356260     	add	x0, x19, #0xd58
 46564a8: 52800001     	mov	w1, #0x0                ; =0
 46564ac: 9775212e     	bl	0x239e964 <_ChromeMain+0x23996c8>
 46564b0: 17ffff56     	b	0x4656208 <_ChromeMain+0x4650f6c>
 46564b4: 97fde304     	bl	0x45cf0c4 <_ChromeMain+0x45c9e28>
 46564b8: 910022b5     	add	x21, x21, #0x8
 46564bc: f1002294     	subs	x20, x20, #0x8
 46564c0: 54fff9e0     	b.eq	0x46563fc <_ChromeMain+0x4651160>
 46564c4: f94002a8     	ldr	x8, [x21]
 46564c8: b4ffff88     	cbz	x8, 0x46564b8 <_ChromeMain+0x465121c>
 46564cc: f941b900     	ldr	x0, [x8, #0x370]
 46564d0: b4ffff40     	cbz	x0, 0x46564b8 <_ChromeMain+0x465121c>
 46564d4: 17fffff8     	b	0x46564b4 <_ChromeMain+0x4651218>
 46564d8: 97fde2fb     	bl	0x45cf0c4 <_ChromeMain+0x45c9e28>
 46564dc: 910022b5     	add	x21, x21, #0x8
 46564e0: f1002294     	subs	x20, x20, #0x8
 46564e4: 54fff8c0     	b.eq	0x46563fc <_ChromeMain+0x4651160>
 46564e8: f94002a8     	ldr	x8, [x21]
 46564ec: b4ffff88     	cbz	x8, 0x46564dc <_ChromeMain+0x4651240>
 46564f0: f941b900     	ldr	x0, [x8, #0x370]
 46564f4: b4ffff40     	cbz	x0, 0x46564dc <_ChromeMain+0x4651240>
 46564f8: 17fffff8     	b	0x46564d8 <_ChromeMain+0x465123c>
 46564fc: f9401be8     	ldr	x8, [sp, #0x30]
 4656500: b4fff368     	cbz	x8, 0x465636c <_ChromeMain+0x46510d0>
 4656504: d37df114     	lsl	x20, x8, #3
 4656508: b40000f4     	cbz	x20, 0x4656524 <_ChromeMain+0x4651288>
 465650c: f94017f5     	ldr	x21, [sp, #0x28]
 4656510: f84086a0     	ldr	x0, [x21], #0x8
 4656514: 97fde31c     	bl	0x45cf184 <_ChromeMain+0x45c9ee8>
 4656518: 36000120     	tbz	w0, #0x0, 0x465653c <_ChromeMain+0x46512a0>
 465651c: f1002294     	subs	x20, x20, #0x8
 4656520: 54ffff81     	b.ne	0x4656510 <_ChromeMain+0x4651274>
 4656524: 52800028     	mov	w8, #0x1                ; =1
 4656528: 39286a68     	strb	w8, [x19, #0xa1a]
 465652c: f945de68     	ldr	x8, [x19, #0xbb8]
 4656530: 91000508     	add	x8, x8, #0x1
 4656534: f905de68     	str	x8, [x19, #0xbb8]
 4656538: 17ffffb2     	b	0x4656400 <_ChromeMain+0x4651164>
 465653c: f9422e68     	ldr	x8, [x19, #0x458]
