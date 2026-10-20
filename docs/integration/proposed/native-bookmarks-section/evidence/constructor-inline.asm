
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e10a0: aa0003f7     	mov	x23, x0
 37e10a4: 9100a2a8     	add	x8, x21, #0x28
 37e10a8: f10002bf     	cmp	x21, #0x0
 37e10ac: 9a8803e1     	csel	x1, xzr, x8, eq
 37e10b0: f9423662     	ldr	x2, [x19, #0x468]
 37e10b4: aa1403e3     	mov	x3, x20
 37e10b8: 9438b954     	bl	0x460f608 <_ChromeMain+0x460a36c>
 37e10bc: f9422e68     	ldr	x8, [x19, #0x458]
 37e10c0: b4000228     	cbz	x8, 0x37e1104 <_ChromeMain+0x37dbe68>
 37e10c4: f9429d08     	ldr	x8, [x8, #0x538]
 37e10c8: f9403500     	ldr	x0, [x8, #0x68]
 37e10cc: b40001c0     	cbz	x0, 0x37e1104 <_ChromeMain+0x37dbe68>
 37e10d0: f9400008     	ldr	x8, [x0]
 37e10d4: f940a508     	ldr	x8, [x8, #0x148]
 37e10d8: d63f0100     	blr	x8
 37e10dc: f9400008     	ldr	x8, [x0]
 37e10e0: f940b508     	ldr	x8, [x8, #0x168]
 37e10e4: d63f0100     	blr	x8
 37e10e8: b40000e0     	cbz	x0, 0x37e1104 <_ChromeMain+0x37dbe68>
 37e10ec: b004b841     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 37e10f0: 9117b421     	add	x1, x1, #0x5ed
 37e10f4: 528005c2     	mov	w2, #0x2e               ; =46
 37e10f8: 972c9502     	bl	0x306500 <_ChromeMain+0x301264>
 37e10fc: aa0003f6     	mov	x22, x0
 37e1100: 14000002     	b	0x37e1108 <_ChromeMain+0x37dbe6c>
 37e1104: 52800036     	mov	w22, #0x1               ; =1
 37e1108: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e110c: f9404789     	ldr	x9, [x28, #0x88]
 37e1110: eb09011f     	cmp	x8, x9
 37e1114: 54000061     	b.ne	0x37e1120 <_ChromeMain+0x37dbe84>
 37e1118: aa1303e0     	mov	x0, x19
 37e111c: 9720cc78     	bl	0x142fc <_ChromeMain+0xf060>
 37e1120: 52800700     	mov	w0, #0x38               ; =56
 37e1124: 9720b891     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1128: aa0003f4     	mov	x20, x0
 37e112c: 52800028     	mov	w8, #0x1                ; =1
 37e1130: d0003e89     	adrp	x9, 0x3fb3000 <_ChromeMain+0x3fadd64>
 37e1134: 91300129     	add	x9, x9, #0xc00
 37e1138: b9000008     	str	w8, [x0]
 37e113c: 105c502a     	adr	x10, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1140: d503201f     	nop
 37e1144: f0007248     	adrp	x8, 0x462c000 <_ChromeMain+0x4626d64>
 37e1148: 9102a108     	add	x8, x8, #0xa8
 37e114c: a900a809     	stp	x9, x10, [x0, #0x8]
 37e1150: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e1154: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1158: b005b948     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e115c: 91120108     	add	x8, x8, #0x480
 37e1160: f8bfc100     	ldapr	x0, [x8]
 37e1164: b4021980     	cbz	x0, 0x37e5494 <_ChromeMain+0x37e01f8>
 37e1168: 52807b01     	mov	w1, #0x3d8              ; =984
 37e116c: d2800002     	mov	x2, #0x0                ; =0
 37e1170: 97232910     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e1174: f0057a1a     	adrp	x26, 0xe724000 <dyld_stub_binder+0xe724000>
 37e1178: 9133435a     	add	x26, x26, #0xcd0
 37e117c: 91100348     	add	x8, x26, #0x400
 37e1180: a900201a     	stp	x26, x8, [x0]
 37e1184: 9110a348     	add	x8, x26, #0x428
 37e1188: f9000808     	str	x8, [x0, #0x10]
 37e118c: 91118348     	add	x8, x26, #0x460
 37e1190: 91124349     	add	x9, x26, #0x490
 37e1194: a906a408     	stp	x8, x9, [x0, #0x68]
 37e1198: 91138348     	add	x8, x26, #0x4e0
 37e119c: f9005808     	str	x8, [x0, #0xb0]
 37e11a0: 91150348     	add	x8, x26, #0x540
 37e11a4: f9006c08     	str	x8, [x0, #0xd8]
 37e11a8: 9115c348     	add	x8, x26, #0x570
 37e11ac: f9007c08     	str	x8, [x0, #0xf8]
 37e11b0: 91166348     	add	x8, x26, #0x598
 37e11b4: 9101c3e9     	add	x9, sp, #0x70
 37e11b8: 9100492a     	add	x10, x9, #0x12
 37e11bc: f9019008     	str	x8, [x0, #0x320]
 37e11c0: d0053d28     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 37e11c4: 913b1108     	add	x8, x8, #0xec4
 37e11c8: eb08015f     	cmp	x10, x8
 37e11cc: 5280012a     	mov	w10, #0x9               ; =9
 37e11d0: fa488122     	ccmp	x9, x8, #0x2, hi
 37e11d4: 39021fea     	strb	w10, [sp, #0x87]
 37e11d8: 540051e9     	b.ls	0x37e1c14 <_ChromeMain+0x37dc978>
 37e11dc: aa0003f5     	mov	x21, x0
 37e11e0: f90007fb     	str	x27, [sp, #0x8]
 37e11e4: 910c801b     	add	x27, x0, #0x320
 37e11e8: 52800e69     	mov	w9, #0x73               ; =115
 37e11ec: b90083e9     	str	w9, [sp, #0x80]
 37e11f0: 3dc00100     	ldr	q0, [x8]
 37e11f4: 3d801fe0     	str	q0, [sp, #0x70]
 37e11f8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e11fc: f9404789     	ldr	x9, [x28, #0x88]
 37e1200: eb09011f     	cmp	x8, x9
 37e1204: 54000061     	b.ne	0x37e1210 <_ChromeMain+0x37dbf74>
 37e1208: aa1503e0     	mov	x0, x21
 37e120c: 9720cc3c     	bl	0x142fc <_ChromeMain+0xf060>
 37e1210: 52800700     	mov	w0, #0x38               ; =56
 37e1214: 9720b855     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1218: aa0003e3     	mov	x3, x0
 37e121c: 52800028     	mov	w8, #0x1                ; =1
 37e1220: b9000008     	str	w8, [x0]
 37e1224: 90003ac8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e1228: 913a0108     	add	x8, x8, #0xe80
 37e122c: 105c48a9     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1230: d503201f     	nop
 37e1234: a900a408     	stp	x8, x9, [x0, #0x8]
 37e1238: 90007408     	adrp	x8, 0x4661000 <_ChromeMain+0x465bd64>
 37e123c: 9137e108     	add	x8, x8, #0xdf8
 37e1240: 90ff6be9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e1244: 912c0129     	add	x9, x9, #0xb00
 37e1248: a901a009     	stp	x9, x8, [x0, #0x18]
 37e124c: a902d41f     	stp	xzr, x21, [x0, #0x28]
 37e1250: 52800088     	mov	w8, #0x4                ; =4
 37e1254: b90003e8     	str	w8, [sp]
 37e1258: 9101c3e1     	add	x1, sp, #0x70
 37e125c: aa1503e0     	mov	x0, x21
 37e1260: 52800022     	mov	w2, #0x1                ; =1
 37e1264: 52800084     	mov	w4, #0x4                ; =4
 37e1268: 52800105     	mov	w5, #0x8                ; =8
 37e126c: d2800006     	mov	x6, #0x0                ; =0
 37e1270: d2800007     	mov	x7, #0x0                ; =0
 37e1274: 943a0367     	bl	0x4662010 <_ChromeMain+0x465cd74>
 37e1278: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 37e127c: 36f800a8     	tbz	w8, #0x1f, 0x37e1290 <_ChromeMain+0x37dbff4>
 37e1280: f9403be0     	ldr	x0, [sp, #0x70]
 37e1284: f94043e8     	ldr	x8, [sp, #0x80]
 37e1288: d37ff901     	lsl	x1, x8, #1
 37e128c: 97209f0b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 37e1290: 91100348     	add	x8, x26, #0x400
 37e1294: a90022ba     	stp	x26, x8, [x21]
 37e1298: 9110a348     	add	x8, x26, #0x428
 37e129c: f9000aa8     	str	x8, [x21, #0x10]
 37e12a0: 91118348     	add	x8, x26, #0x460
 37e12a4: 91124349     	add	x9, x26, #0x490
 37e12a8: a906a6a8     	stp	x8, x9, [x21, #0x68]
 37e12ac: 91138348     	add	x8, x26, #0x4e0
 37e12b0: f9005aa8     	str	x8, [x21, #0xb0]
 37e12b4: 91150348     	add	x8, x26, #0x540
 37e12b8: f9006ea8     	str	x8, [x21, #0xd8]
 37e12bc: 9115c348     	add	x8, x26, #0x570
 37e12c0: f9007ea8     	str	x8, [x21, #0xf8]
 37e12c4: 91166348     	add	x8, x26, #0x598
 37e12c8: f90192a8     	str	x8, [x21, #0x320]
 37e12cc: 910ca2ba     	add	x26, x21, #0x328
 37e12d0: 6f00e400     	movi.2d	v0, #0000000000000000
 37e12d4: 3d800340     	str	q0, [x26]
 37e12d8: 910ce2a0     	add	x0, x21, #0x338
 37e12dc: 910c82a1     	add	x1, x21, #0x320
 37e12e0: 52800782     	mov	w2, #0x3c               ; =60
 37e12e4: 976e3647     	bl	0x136ec00 <_ChromeMain+0x1369964>
 37e12e8: 90055808     	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 37e12ec: 91240108     	add	x8, x8, #0x900
 37e12f0: f9019ea8     	str	x8, [x21, #0x338]
 37e12f4: 925e7768     	and	x8, x27, #0xfffffffc00000000
 37e12f8: f9404789     	ldr	x9, [x28, #0x88]
 37e12fc: eb09011f     	cmp	x8, x9
 37e1300: 54000061     	b.ne	0x37e130c <_ChromeMain+0x37dc070>
 37e1304: 910c82a0     	add	x0, x21, #0x320
 37e1308: 9720cbfd     	bl	0x142fc <_ChromeMain+0xf060>
 37e130c: f901c2bb     	str	x27, [x21, #0x380]
 37e1310: 52800028     	mov	w8, #0x1                ; =1
 37e1314: b9038aa8     	str	w8, [x21, #0x388]
 37e1318: 390e32bf     	strb	wzr, [x21, #0x38c]
 37e131c: 390e42bf     	strb	wzr, [x21, #0x390]
 37e1320: f901cebf     	str	xzr, [x21, #0x398]
 37e1324: f901d6bf     	str	xzr, [x21, #0x3a8]
 37e1328: f901d2bf     	str	xzr, [x21, #0x3a0]
 37e132c: 529a9808     	mov	w8, #0xd4c0             ; =54464
 37e1330: 72a00028     	movk	w8, #0x1, lsl #16
 37e1334: f901daa8     	str	x8, [x21, #0x3b0]
 37e1338: d2e7fe08     	mov	x8, #0x3ff0000000000000 ; =4607182418800017408
 37e133c: f901dea8     	str	x8, [x21, #0x3b8]
 37e1340: 390f02b6     	strb	w22, [x21, #0x3c0]
 37e1344: 390f12bf     	strb	wzr, [x21, #0x3c4]
 37e1348: 390f22bf     	strb	wzr, [x21, #0x3c8]
 37e134c: f901eab4     	str	x20, [x21, #0x3d0]
 37e1350: f9418aa8     	ldr	x8, [x21, #0x310]
 37e1354: f9427114     	ldr	x20, [x8, #0x4e0]
 37e1358: b4000154     	cbz	x20, 0x37e1380 <_ChromeMain+0x37dc0e4>
 37e135c: 39504288     	ldrb	w8, [x20, #0x410]
 37e1360: 6b16011f     	cmp	w8, w22
 37e1364: 540000e0     	b.eq	0x37e1380 <_ChromeMain+0x37dc0e4>
 37e1368: 39104296     	strb	w22, [x20, #0x410]
 37e136c: 910e2280     	add	x0, x20, #0x388
 37e1370: 520002c1     	eor	w1, w22, #0x1
 37e1374: 97aef57c     	bl	0x239e964 <_ChromeMain+0x23996c8>
 37e1378: aa1403e0     	mov	x0, x20
 37e137c: 9736ff80     	bl	0x5a117c <_ChromeMain+0x59bee0>
 37e1380: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 37e1384: f9404789     	ldr	x9, [x28, #0x88]
 37e1388: eb09011f     	cmp	x8, x9
 37e138c: 54000061     	b.ne	0x37e1398 <_ChromeMain+0x37dc0fc>
 37e1390: aa1703e0     	mov	x0, x23
 37e1394: 9720cbda     	bl	0x142fc <_ChromeMain+0xf060>
 37e1398: f9419aa0     	ldr	x0, [x21, #0x330]
 37e139c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e13a0: f9404789     	ldr	x9, [x28, #0x88]
 37e13a4: eb09011f     	cmp	x8, x9
 37e13a8: 54000041     	b.ne	0x37e13b0 <_ChromeMain+0x37dc114>
 37e13ac: 972105a4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e13b0: f9019ab7     	str	x23, [x21, #0x330]
 37e13b4: f9418eb6     	ldr	x22, [x21, #0x318]
 37e13b8: b005b948     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e13bc: 91120108     	add	x8, x8, #0x480
 37e13c0: f8bfc100     	ldapr	x0, [x8]
 37e13c4: b40206c0     	cbz	x0, 0x37e549c <_ChromeMain+0x37e0200>
 37e13c8: 52806b01     	mov	w1, #0x358              ; =856
 37e13cc: d2800002     	mov	x2, #0x0                ; =0
 37e13d0: 97232878     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e13d4: aa0003f4     	mov	x20, x0
 37e13d8: aa1703e1     	mov	x1, x23
 37e13dc: 943a1419     	bl	0x4666440 <_ChromeMain+0x46611a4>
 37e13e0: 3945a408     	ldrb	w8, [x0, #0x169]
 37e13e4: 35020fc8     	cbnz	w8, 0x37e55dc <_ChromeMain+0x37e0340>
 37e13e8: f940cec2     	ldr	x2, [x22, #0x198]
 37e13ec: aa1603e0     	mov	x0, x22
 37e13f0: aa1403e1     	mov	x1, x20
 37e13f4: 973e6002     	bl	0x7793fc <_ChromeMain+0x774160>
 37e13f8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e13fc: f9404789     	ldr	x9, [x28, #0x88]
 37e1400: eb09011f     	cmp	x8, x9
 37e1404: 54000061     	b.ne	0x37e1410 <_ChromeMain+0x37dc174>
 37e1408: aa1403e0     	mov	x0, x20
 37e140c: 9720cbbc     	bl	0x142fc <_ChromeMain+0xf060>
 37e1410: 9101c3f6     	add	x22, sp, #0x70
 37e1414: f9400340     	ldr	x0, [x26]
 37e1418: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e141c: f9404789     	ldr	x9, [x28, #0x88]
 37e1420: eb09011f     	cmp	x8, x9
 37e1424: 54000041     	b.ne	0x37e142c <_ChromeMain+0x37dc190>
 37e1428: 97210585     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e142c: f90196b4     	str	x20, [x21, #0x328]
 37e1430: f9418ea8     	ldr	x8, [x21, #0x318]
 37e1434: b0053ac9     	adrp	x9, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 37e1438: 3dc2fd20     	ldr	q0, [x9, #0xbf0]
 37e143c: 3d8026c0     	str	q0, [x22, #0x90]
 37e1440: 90059134     	adrp	x20, 0xea05000 <dyld_stub_binder+0xea05000>
 37e1444: 91122294     	add	x20, x20, #0x488
 37e1448: 91036100     	add	x0, x8, #0xd8
 37e144c: 910403e2     	add	x2, sp, #0x100
 37e1450: aa1403e1     	mov	x1, x20
 37e1454: 978c3283     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 37e1458: f94196a8     	ldr	x8, [x21, #0x328]
 37e145c: a9107fff     	stp	xzr, xzr, [sp, #0x100]
 37e1460: 91036100     	add	x0, x8, #0xd8
 37e1464: 910403e2     	add	x2, sp, #0x100
 37e1468: aa1403e1     	mov	x1, x20
 37e146c: 978c327d     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 37e1470: f005b928     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 37e1474: f9401914     	ldr	x20, [x8, #0x30]
 37e1478: b004d221     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 37e147c: 910a4c21     	add	x1, x1, #0x293
 37e1480: aa1403e0     	mov	x0, x20
 37e1484: 9728503e     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 37e1488: f005b977     	adrp	x23, 0xef10000 <dyld_stub_binder+0xef10000>
 37e148c: f005b976     	adrp	x22, 0xef10000 <dyld_stub_binder+0xef10000>
 37e1490: 90ff6bfa     	adrp	x26, 0x255d000 <_ChromeMain+0x2557d64>
 37e1494: 912c035a     	add	x26, x26, #0xb00
 37e1498: 3701fd20     	tbnz	w0, #0x0, 0x37e543c <_ChromeMain+0x37e01a0>
 37e149c: b004d221     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 37e14a0: 910ac021     	add	x1, x1, #0x2b0
 37e14a4: aa1403e0     	mov	x0, x20
 37e14a8: 97285035     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 37e14ac: 370000a0     	tbnz	w0, #0x0, 0x37e14c0 <_ChromeMain+0x37dc224>
 37e14b0: 394ca6e8     	ldrb	w8, [x23, #0x329]
 37e14b4: 3601faa8     	tbz	w8, #0x0, 0x37e5408 <_ChromeMain+0x37e016c>
 37e14b8: 394ca2c8     	ldrb	w8, [x22, #0x328]
 37e14bc: 3701fc08     	tbnz	w8, #0x0, 0x37e543c <_ChromeMain+0x37e01a0>
 37e14c0: 5297e408     	mov	w8, #0xbf20             ; =48928
 37e14c4: 72a00048     	movk	w8, #0x2, lsl #16
 37e14c8: f901daa8     	str	x8, [x21, #0x3b0]
 37e14cc: 394f02a8     	ldrb	w8, [x21, #0x3c0]
 37e14d0: 7100011f     	cmp	w8, #0x0
 37e14d4: 6f00e400     	movi.2d	v0, #0000000000000000
 37e14d8: 1e6e1001     	fmov	d1, #1.00000000
 37e14dc: 1e601c20     	fcsel	d0, d1, d0, ne
 37e14e0: 394e42a8     	ldrb	w8, [x21, #0x390]
 37e14e4: 3501f508     	cbnz	w8, 0x37e5384 <_ChromeMain+0x37e00e8>
 37e14e8: fd01d6a0     	str	d0, [x21, #0x3a8]
 37e14ec: 394d22a8     	ldrb	w8, [x21, #0x348]
 37e14f0: 3501de88     	cbnz	w8, 0x37e50c0 <_ChromeMain+0x37dfe24>
 37e14f4: 394f02a1     	ldrb	w1, [x21, #0x3c0]
 37e14f8: aa1503e0     	mov	x0, x21
 37e14fc: 9439e0ed     	bl	0x46598b0 <_ChromeMain+0x4654614>
 37e1500: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 37e1504: f9404789     	ldr	x9, [x28, #0x88]
 37e1508: eb09011f     	cmp	x8, x9
 37e150c: 54000061     	b.ne	0x37e1518 <_ChromeMain+0x37dc27c>
 37e1510: aa1503e0     	mov	x0, x21
 37e1514: 9720cb7a     	bl	0x142fc <_ChromeMain+0xf060>
 37e1518: f9433660     	ldr	x0, [x19, #0x668]
 37e151c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e1520: f9404789     	ldr	x9, [x28, #0x88]
 37e1524: eb09011f     	cmp	x8, x9
 37e1528: 54000041     	b.ne	0x37e1530 <_ChromeMain+0x37dc294>
 37e152c: 97210544     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e1530: 911a8276     	add	x22, x19, #0x6a0
 37e1534: f9033675     	str	x21, [x19, #0x668]
 37e1538: f9419ab4     	ldr	x20, [x21, #0x330]
 37e153c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e1540: f9404789     	ldr	x9, [x28, #0x88]
 37e1544: eb09011f     	cmp	x8, x9
 37e1548: 54000061     	b.ne	0x37e1554 <_ChromeMain+0x37dc2b8>
 37e154c: aa1403e0     	mov	x0, x20
 37e1550: 9720cb6b     	bl	0x142fc <_ChromeMain+0xf060>
 37e1554: f94002c0     	ldr	x0, [x22]
 37e1558: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e155c: f9404789     	ldr	x9, [x28, #0x88]
 37e1560: eb09011f     	cmp	x8, x9
 37e1564: 54000041     	b.ne	0x37e156c <_ChromeMain+0x37dc2d0>
 37e1568: 97210535     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e156c: f90002d4     	str	x20, [x22]
 37e1570: 3945a6a8     	ldrb	w8, [x21, #0x169]
 37e1574: 350203a8     	cbnz	w8, 0x37e55e8 <_ChromeMain+0x37e034c>
 37e1578: f942e260     	ldr	x0, [x19, #0x5c0]
 37e157c: f940cc02     	ldr	x2, [x0, #0x198]
 37e1580: aa1503e1     	mov	x1, x21
 37e1584: 973e5f9e     	bl	0x7793fc <_ChromeMain+0x774160>
 37e1588: f9433674     	ldr	x20, [x19, #0x668]
 37e158c: f9422e68     	ldr	x8, [x19, #0x458]
 37e1590: 52800035     	mov	w21, #0x1               ; =1
 37e1594: 52800021     	mov	w1, #0x1                ; =1
 37e1598: b4000248     	cbz	x8, 0x37e15e0 <_ChromeMain+0x37dc344>
 37e159c: f9429d08     	ldr	x8, [x8, #0x538]
 37e15a0: f9403500     	ldr	x0, [x8, #0x68]
 37e15a4: b40001e0     	cbz	x0, 0x37e15e0 <_ChromeMain+0x37dc344>
 37e15a8: f9400008     	ldr	x8, [x0]
 37e15ac: f940a508     	ldr	x8, [x8, #0x148]
 37e15b0: d63f0100     	blr	x8
 37e15b4: f9400008     	ldr	x8, [x0]
 37e15b8: f940b508     	ldr	x8, [x8, #0x168]
 37e15bc: d63f0100     	blr	x8
 37e15c0: b40000e0     	cbz	x0, 0x37e15dc <_ChromeMain+0x37dc340>
 37e15c4: b004b841     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 37e15c8: 9116fc21     	add	x1, x1, #0x5bf
 37e15cc: 528005a2     	mov	w2, #0x2d               ; =45
 37e15d0: 972c93cc     	bl	0x306500 <_ChromeMain+0x301264>
 37e15d4: aa0003e1     	mov	x1, x0
 37e15d8: 14000002     	b	0x37e15e0 <_ChromeMain+0x37dc344>
 37e15dc: 52800021     	mov	w1, #0x1                ; =1
 37e15e0: 5297e408     	mov	w8, #0xbf20             ; =48928
 37e15e4: 72a00048     	movk	w8, #0x2, lsl #16
 37e15e8: f90013e8     	str	x8, [sp, #0x20]
 37e15ec: f9400288     	ldr	x8, [x20]
 37e15f0: f9405108     	ldr	x8, [x8, #0xa0]
 37e15f4: aa1403e0     	mov	x0, x20
 37e15f8: d63f0100     	blr	x8
 37e15fc: f9433676     	ldr	x22, [x19, #0x668]
 37e1600: 52800800     	mov	w0, #0x40               ; =64
 37e1604: 9720b759     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1608: b9000015     	str	w21, [x0]
 37e160c: d0fec23b     	adrp	x27, 0x1027000 <_ChromeMain+0x1021d64>
 37e1610: 9126037b     	add	x27, x27, #0x980
 37e1614: b0fe5898     	adrp	x24, 0x2f2000 <_ChromeMain+0x2ecd64>
 37e1618: 91220318     	add	x24, x24, #0x880
 37e161c: a900e01b     	stp	x27, x24, [x0, #0x8]
 37e1620: b0001a39     	adrp	x25, 0x3b26000 <_ChromeMain+0x3b20d64>
 37e1624: 91310339     	add	x25, x25, #0xc40
 37e1628: a901e41a     	stp	x26, x25, [x0, #0x18]
 37e162c: 3dc013e0     	ldr	q0, [sp, #0x40]
 37e1630: 3c828000     	stur	q0, [x0, #0x28]
 37e1634: 3900e01f     	strb	wzr, [x0, #0x38]
 37e1638: f9003be0     	str	x0, [sp, #0x70]
 37e163c: 0f000428     	movi.2s	v8, #0x1
 37e1640: fd003fe8     	str	d8, [sp, #0x78]
 37e1644: 52800077     	mov	w23, #0x3               ; =3
 37e1648: b90083f7     	str	w23, [sp, #0x80]
 37e164c: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 37e1650: f90047ff     	str	xzr, [sp, #0x88]
 37e1654: 90059134     	adrp	x20, 0xea05000 <dyld_stub_binder+0xea05000>
 37e1658: 91152294     	add	x20, x20, #0x548
 37e165c: 910362c0     	add	x0, x22, #0xd8
 37e1660: 9101c3e2     	add	x2, sp, #0x70
 37e1664: aa1403e1     	mov	x1, x20
 37e1668: 9790cb49     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 37e166c: 9101c3e0     	add	x0, sp, #0x70
 37e1670: 977da5ad     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 37e1674: f9435260     	ldr	x0, [x19, #0x6a0]
 37e1678: 52800001     	mov	w1, #0x0                ; =0
 37e167c: 95bb129e     	bl	0xa6a60f4 <_ChromeMain+0xa6a0e58>
 37e1680: f9435260     	ldr	x0, [x19, #0x6a0]
 37e1684: 52800001     	mov	w1, #0x0                ; =0
 37e1688: 95bb126f     	bl	0xa6a6044 <_ChromeMain+0xa6a0da8>
 37e168c: f9435276     	ldr	x22, [x19, #0x6a0]
 37e1690: 52800800     	mov	w0, #0x40               ; =64
 37e1694: 9720b735     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1698: b9000015     	str	w21, [x0]
 37e169c: a900e01b     	stp	x27, x24, [x0, #0x8]
 37e16a0: a901e41a     	stp	x26, x25, [x0, #0x18]
 37e16a4: 3dc013e0     	ldr	q0, [sp, #0x40]
 37e16a8: 3c828000     	stur	q0, [x0, #0x28]
 37e16ac: 3900e01f     	strb	wzr, [x0, #0x38]
 37e16b0: f9003be0     	str	x0, [sp, #0x70]
 37e16b4: fd003fe8     	str	d8, [sp, #0x78]
 37e16b8: b90083f7     	str	w23, [sp, #0x80]
 37e16bc: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 37e16c0: f90047ff     	str	xzr, [sp, #0x88]
 37e16c4: 910362c0     	add	x0, x22, #0xd8
 37e16c8: 9101c3e2     	add	x2, sp, #0x70
 37e16cc: aa1403e1     	mov	x1, x20
 37e16d0: 9790cb2f     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 37e16d4: 9101c3e0     	add	x0, sp, #0x70
 37e16d8: 977da593     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 37e16dc: f9435274     	ldr	x20, [x19, #0x6a0]
 37e16e0: 925e7675     	and	x21, x19, #0xfffffffc00000000
 37e16e4: f9404788     	ldr	x8, [x28, #0x88]
 37e16e8: eb0802bf     	cmp	x21, x8
 37e16ec: 54000061     	b.ne	0x37e16f8 <_ChromeMain+0x37dc45c>
 37e16f0: aa1303e0     	mov	x0, x19
 37e16f4: 9720cb02     	bl	0x142fc <_ChromeMain+0xf060>
 37e16f8: 52800600     	mov	w0, #0x30               ; =48
 37e16fc: 9720b71b     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1700: aa0003e1     	mov	x1, x0
 37e1704: 52800036     	mov	w22, #0x1               ; =1
 37e1708: b9000016     	str	w22, [x0]
 37e170c: d0007428     	adrp	x8, 0x4667000 <_ChromeMain+0x4661d64>
 37e1710: 91068108     	add	x8, x8, #0x1a0
 37e1714: d0000c09     	adrp	x9, 0x3963000 <_ChromeMain+0x395dd64>
 37e1718: 91120129     	add	x9, x9, #0x480
 37e171c: a900a408     	stp	x8, x9, [x0, #0x8]
 37e1720: f9000c1a     	str	x26, [x0, #0x18]
 37e1724: f9001413     	str	x19, [x0, #0x28]
 37e1728: aa1403e0     	mov	x0, x20
 37e172c: 9438c1bd     	bl	0x4611e20 <_ChromeMain+0x460cb84>
 37e1730: f9435274     	ldr	x20, [x19, #0x6a0]
 37e1734: f9404788     	ldr	x8, [x28, #0x88]
 37e1738: eb0802bf     	cmp	x21, x8
 37e173c: d0003e98     	adrp	x24, 0x3fb3000 <_ChromeMain+0x3fadd64>
 37e1740: 91300318     	add	x24, x24, #0xc00
 37e1744: 54000061     	b.ne	0x37e1750 <_ChromeMain+0x37dc4b4>
 37e1748: aa1303e0     	mov	x0, x19
 37e174c: 9720caec     	bl	0x142fc <_ChromeMain+0xf060>
 37e1750: 52800700     	mov	w0, #0x38               ; =56
 37e1754: 9720b705     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1758: aa0003e1     	mov	x1, x0
 37e175c: b9000016     	str	w22, [x0]
 37e1760: 90003ac8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e1764: 913a0109     	add	x9, x8, #0xe80
 37e1768: 105c1ec8     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e176c: d503201f     	nop
 37e1770: a900a009     	stp	x9, x8, [x0, #0x8]
 37e1774: f0007248     	adrp	x8, 0x462c000 <_ChromeMain+0x4626d64>
 37e1778: 91062108     	add	x8, x8, #0x188
 37e177c: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e1780: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1784: aa1403e0     	mov	x0, x20
 37e1788: 9438c1f1     	bl	0x4611f4c <_ChromeMain+0x460ccb0>
 37e178c: f9435275     	ldr	x21, [x19, #0x6a0]
 37e1790: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e1794: f9404789     	ldr	x9, [x28, #0x88]
 37e1798: eb09011f     	cmp	x8, x9
 37e179c: 54000061     	b.ne	0x37e17a8 <_ChromeMain+0x37dc50c>
 37e17a0: aa1303e0     	mov	x0, x19
 37e17a4: 9720cad6     	bl	0x142fc <_ChromeMain+0xf060>
 37e17a8: 52800700     	mov	w0, #0x38               ; =56
 37e17ac: 9720b6ef     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e17b0: 52800028     	mov	w8, #0x1                ; =1
 37e17b4: b9000008     	str	w8, [x0]
 37e17b8: 90003ac8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e17bc: 913a0109     	add	x9, x8, #0xe80
 37e17c0: 105c1c08     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e17c4: d503201f     	nop
 37e17c8: a900a009     	stp	x9, x8, [x0, #0x8]
 37e17cc: f0007248     	adrp	x8, 0x462c000 <_ChromeMain+0x4626d64>
