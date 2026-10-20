
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42a111c:      	sub	sp, sp, #0x90
 42a1120:      	stp	x24, x23, [sp, #0x50]
 42a1124:      	stp	x22, x21, [sp, #0x60]
 42a1128:      	stp	x20, x19, [sp, #0x70]
 42a112c:      	stp	x29, x30, [sp, #0x80]
 42a1130:      	add	x29, sp, #0x80
 42a1134:      	mov	x19, x1
 42a1138:      	mov	x20, x0
 42a113c:      	adrp	x23, 0xef08000 <dyld_stub_binder+0xef08000>
 42a1140:      	ldr	x0, [x23, #0x30]
 42a1144:      	adrp	x1, 0xcda5000 <dyld_stub_binder+0xcda5000>
 42a1148:      	add	x1, x1, #0x96e
 42a114c:      	bl	0x1f557c <_ChromeMain+0x1f02e0>
 42a1150:      	tbnz	w0, #0x0, 0x42a1288 <_ChromeMain+0x429bfec>
 42a1154:      	adrp	x0, 0xeb30000 <dyld_stub_binder+0xeb30000>
 42a1158:      	add	x0, x0, #0x118
 42a115c:      	adrp	x1, 0xeb30000 <dyld_stub_binder+0xeb30000>
 42a1160:      	add	x1, x1, #0x138
 42a1164:      	bl	0x9b1ceb4 <_ChromeMain+0x9b17c18>
 42a1168:      	cbz	x0, 0x42a118c <_ChromeMain+0x429bef0>
 42a116c:      	mov	x21, x0
 42a1170:      	bl	0x8b5ecf4 <_ChromeMain+0x8b59a58>
 42a1174:      	mov	x22, x0
 42a1178:      	bl	0xa067dd4 <_ChromeMain+0xa062b38>
 42a117c:      	cmp	x22, x0
 42a1180:      	b.eq	0x42a1270 <_ChromeMain+0x429bfd4>
 42a1184:      	mov	x0, x21
 42a1188:      	bl	0x864b6fc <_ChromeMain+0x8646460>
 42a118c:      	adrp	x8, 0xef06000 <dyld_stub_binder+0xef06000>
 42a1190:      	add	x8, x8, #0x190
 42a1194:      	ldaprb	w8, [x8]
 42a1198:      	adrp	x22, 0xef06000 <dyld_stub_binder+0xef06000>
 42a119c:      	tbz	w8, #0x0, 0x42a14a0 <_ChromeMain+0x429c204>
 42a11a0:      	ldr	x21, [x22, #0x188]
 42a11a4:      	cbz	x21, 0x42a1260 <_ChromeMain+0x429bfc4>
 42a11a8:      	ldrb	w8, [x21, #0x49]
 42a11ac:      	tbnz	w8, #0x0, 0x42a1288 <_ChromeMain+0x429bfec>
 42a11b0:      	ldr	x0, [x23, #0x30]
 42a11b4:      	adrp	x1, 0xcda5000 <dyld_stub_binder+0xcda5000>
 42a11b8:      	add	x1, x1, #0x96e
 42a11bc:      	bl	0x1f557c <_ChromeMain+0x1f02e0>
 42a11c0:      	tbnz	w0, #0x0, 0x42a1288 <_ChromeMain+0x429bfec>
 42a11c4:      	adrp	x0, 0xeb30000 <dyld_stub_binder+0xeb30000>
 42a11c8:      	add	x0, x0, #0x118
 42a11cc:      	adrp	x1, 0xeb30000 <dyld_stub_binder+0xeb30000>
 42a11d0:      	add	x1, x1, #0x138
 42a11d4:      	bl	0x9b1ceb4 <_ChromeMain+0x9b17c18>
 42a11d8:      	cbz	x0, 0x42a12cc <_ChromeMain+0x429c030>
 42a11dc:      	mov	x22, x0
 42a11e0:      	bl	0x8b5ecf4 <_ChromeMain+0x8b59a58>
 42a11e4:      	mov	x23, x0
 42a11e8:      	bl	0xa067dd4 <_ChromeMain+0xa062b38>
 42a11ec:      	cmp	x23, x0
 42a11f0:      	b.eq	0x42a11fc <_ChromeMain+0x429bf60>
 42a11f4:      	mov	w23, #0x0               ; =0
 42a11f8:      	b	0x42a120c <_ChromeMain+0x429bf70>
 42a11fc:      	mov	x0, x22
 42a1200:      	bl	0xa067f60 <_ChromeMain+0xa062cc4>
 42a1204:      	cmp	w0, #0x0
 42a1208:      	cset	w23, ne
 42a120c:      	mov	x0, x22
 42a1210:      	bl	0x864b6fc <_ChromeMain+0x8646460>
 42a1214:      	cbz	x20, 0x42a1288 <_ChromeMain+0x429bfec>
 42a1218:      	tbnz	w23, #0x0, 0x42a1288 <_ChromeMain+0x429bfec>
 42a121c:      	mov	x0, x20
 42a1220:      	bl	0xf15110 <_ChromeMain+0xf0fe74>
 42a1224:      	cbz	w0, 0x42a1288 <_ChromeMain+0x429bfec>
 42a1228:      	mov	x0, x21
 42a122c:      	bl	0x42a430c <_ChromeMain+0x429f070>
 42a1230:      	mov	x0, x21
 42a1234:      	mov	x1, x20
 42a1238:      	bl	0x42a4148 <_ChromeMain+0x429eeac>
 42a123c:      	mov	x0, x21
 42a1240:      	mov	x1, x20
 42a1244:      	bl	0x42a6f58 <_ChromeMain+0x42a1cbc>
 42a1248:      	tbnz	w0, #0x0, 0x42a1288 <_ChromeMain+0x429bfec>
 42a124c:      	ldrb	w8, [x21, #0x3ac]
 42a1250:      	cbz	w8, 0x42a12d4 <_ChromeMain+0x429c038>
 42a1254:      	mov	w20, #0x1               ; =1
 42a1258:      	cbz	x19, 0x42a1290 <_ChromeMain+0x429bff4>
 42a125c:      	b	0x42a13bc <_ChromeMain+0x429c120>
 42a1260:      	bl	0x42a0360 <_ChromeMain+0x429b0c4>
 42a1264:      	ldr	x21, [x22, #0x188]
 42a1268:      	cbz	x21, 0x42a1288 <_ChromeMain+0x429bfec>
 42a126c:      	b	0x42a11a8 <_ChromeMain+0x429bf0c>
 42a1270:      	mov	x0, x21
 42a1274:      	bl	0xa067f60 <_ChromeMain+0xa062cc4>
 42a1278:      	mov	x22, x0
 42a127c:      	mov	x0, x21
 42a1280:      	bl	0x864b6fc <_ChromeMain+0x8646460>
 42a1284:      	cbz	w22, 0x42a118c <_ChromeMain+0x429bef0>
 42a1288:      	cbnz	x19, 0x42a12ac <_ChromeMain+0x429c010>
 42a128c:      	mov	w20, #0x0               ; =0
 42a1290:      	mov	x0, x20
 42a1294:      	ldp	x29, x30, [sp, #0x80]
 42a1298:      	ldp	x20, x19, [sp, #0x70]
 42a129c:      	ldp	x22, x21, [sp, #0x60]
 42a12a0:      	ldp	x24, x23, [sp, #0x50]
 42a12a4:      	add	sp, sp, #0x90
 42a12a8:      	ret
 42a12ac:      	mov	w8, #-0x1               ; =-1
 42a12b0:      	ldaddal	w8, w8, [x19]
 42a12b4:      	cmp	w8, #0x1
 42a12b8:      	b.ne	0x42a128c <_ChromeMain+0x429bff0>
 42a12bc:      	ldr	x8, [x19, #0x10]
 42a12c0:      	mov	x0, x19
 42a12c4:      	blr	x8
 42a12c8:      	b	0x42a128c <_ChromeMain+0x429bff0>
 42a12cc:      	mov	w23, #0x0               ; =0
 42a12d0:      	b	0x42a1214 <_ChromeMain+0x429bf78>
 42a12d4:      	ldr	x8, [x20, #0xc0]
 42a12d8:      	cbz	x8, 0x42a12f0 <_ChromeMain+0x429c054>
 42a12dc:      	mov	w9, #0x1                ; =1
 42a12e0:      	ldadd	w9, w9, [x8]
 42a12e4:      	mov	w10, #0x7fffffff        ; =2147483647
 42a12e8:      	cmp	w9, w10
 42a12ec:      	b.eq	0x42a1518 <_ChromeMain+0x429c27c>
 42a12f0:      	add	x11, x21, #0x3d8
 42a12f4:      	ldr	x9, [x20, #0xc8]
 42a12f8:      	stp	x8, x9, [sp, #0x10]
 42a12fc:      	str	x19, [sp, #0x20]
 42a1300:      	ldr	x10, [x21, #0x3d8]
 42a1304:      	ldr	x12, [x21, #0x3e0]
 42a1308:      	mov	w13, #0x18              ; =24
 42a130c:      	madd	x10, x12, x13, x10
 42a1310:      	stur	x10, [x29, #-0x38]
 42a1314:      	ldr	x13, [x21, #0x3e8]
 42a1318:      	sub	x14, x29, #0x38
 42a131c:      	add	x15, sp, #0x10
 42a1320:      	stp	x14, x15, [sp, #0x28]
 42a1324:      	str	x11, [sp, #0x38]
 42a1328:      	cmp	x12, x13
 42a132c:      	b.eq	0x42a1494 <_ChromeMain+0x429c1f8>
 42a1330:      	cbz	x10, 0x42a1490 <_ChromeMain+0x429c1f4>
 42a1334:      	str	x8, [x10]
 42a1338:      	str	xzr, [sp, #0x10]
 42a133c:      	stp	x9, x19, [x10, #0x8]
 42a1340:      	str	xzr, [sp, #0x20]
 42a1344:      	add	x8, x10, #0x18
 42a1348:      	stur	x8, [x29, #-0x38]
 42a134c:      	ldur	x8, [x29, #-0x38]
 42a1350:      	ldr	x9, [x21, #0x3d8]
 42a1354:      	subs	x8, x8, x9
 42a1358:      	asr	x8, x8, #3
 42a135c:      	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 42a1360:      	movk	x9, #0xaaab
 42a1364:      	mul	x8, x8, x9
 42a1368:      	str	x8, [x21, #0x3e0]
 42a136c:      	b.eq	0x42a1490 <_ChromeMain+0x429c1f4>
 42a1370:      	ldr	x0, [sp, #0x20]
 42a1374:      	cbnz	x0, 0x42a1474 <_ChromeMain+0x429c1d8>
 42a1378:      	ldr	x0, [sp, #0x10]
 42a137c:      	cbnz	x0, 0x42a13a0 <_ChromeMain+0x429c104>
 42a1380:      	adrp	x0, 0xdb2c000 <dyld_stub_binder+0xdb2c000>
 42a1384:      	add	x0, x0, #0x315
 42a1388:      	mov	w1, #0x45               ; =69
 42a138c:      	bl	0x42adc74 <_ChromeMain+0x42a89d8>
 42a1390:      	mov	x0, x21
 42a1394:      	bl	0x42a61ac <_ChromeMain+0x42a0f10>
 42a1398:      	mov	w20, #0x1               ; =1
 42a139c:      	b	0x42a1290 <_ChromeMain+0x429bff4>
 42a13a0:      	mov	w8, #-0x1               ; =-1
 42a13a4:      	ldaddal	w8, w8, [x0]
 42a13a8:      	cmp	w8, #0x1
 42a13ac:      	b.ne	0x42a1380 <_ChromeMain+0x429c0e4>
 42a13b0:      	mov	w1, #0x8                ; =8
 42a13b4:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42a13b8:      	b	0x42a1380 <_ChromeMain+0x429c0e4>
 42a13bc:      	adrp	x0, 0xcf0c000 <dyld_stub_binder+0xcf0c000>
 42a13c0:      	add	x0, x0, #0xb48
 42a13c4:      	bl	0xbdc494 <_ChromeMain+0xbd71f8>
 42a13c8:      	mov	x21, x0
 42a13cc:      	adrp	x0, 0xdb2c000 <dyld_stub_binder+0xdb2c000>
 42a13d0:      	add	x0, x0, #0x2f7
 42a13d4:      	adrp	x1, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a13d8:      	add	x1, x1, #0x193
 42a13dc:      	add	x8, sp, #0x28
 42a13e0:      	mov	w2, #0x2e2              ; =738
 42a13e4:      	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42a13e8:      	mov	w0, #0x30               ; =48
 42a13ec:      	bl	0xf368 <_ChromeMain+0xa0cc>
 42a13f0:      	mov	x2, x0
 42a13f4:      	adrp	x8, 0x3f72000 <_ChromeMain+0x3f6cd64>
 42a13f8:      	add	x8, x8, #0x990
 42a13fc:      	str	w20, [x0]
 42a1400:      	adrp	x9, 0x3895000 <_ChromeMain+0x388fd64>
 42a1404:      	add	x9, x9, #0xc10
 42a1408:      	adrp	x10, 0x3f72000 <_ChromeMain+0x3f6cd64>
 42a140c:      	add	x10, x10, #0xa00
 42a1410:      	stp	x8, x9, [x0, #0x8]
 42a1414:      	stp	x10, x19, [x0, #0x18]
 42a1418:      	strb	wzr, [x0, #0x28]
 42a141c:      	ldr	x8, [x21]
 42a1420:      	ldr	x8, [x8]
 42a1424:      	add	x1, sp, #0x28
 42a1428:      	mov	x0, x21
 42a142c:      	mov	x3, #0x0                ; =0
 42a1430:      	blr	x8
 42a1434:      	cbz	x21, 0x42a1290 <_ChromeMain+0x429bff4>
 42a1438:      	add	x8, x21, #0x8
 42a143c:      	mov	w9, #-0x1               ; =-1
 42a1440:      	ldaddal	w9, w8, [x8]
 42a1444:      	cmp	w8, #0x1
 42a1448:      	b.ne	0x42a1290 <_ChromeMain+0x429bff4>
 42a144c:      	ldr	x9, [x21]
 42a1450:      	ldr	x8, [x9, #0x18]
 42a1454:      	adr	x10, 0x42caa8c <_ChromeMain+0x42c57f0>
 42a1458:      	nop
 42a145c:      	cmp	x8, x10
 42a1460:      	b.ne	0x42a1468 <_ChromeMain+0x429c1cc>
 42a1464:      	ldr	x8, [x9, #0x10]
 42a1468:      	mov	x0, x21
 42a146c:      	blr	x8
 42a1470:      	b	0x42a1290 <_ChromeMain+0x429bff4>
 42a1474:      	mov	w8, #-0x1               ; =-1
 42a1478:      	ldaddal	w8, w8, [x0]
 42a147c:      	cmp	w8, #0x1
 42a1480:      	b.ne	0x42a1378 <_ChromeMain+0x429c0dc>
 42a1484:      	ldr	x8, [x0, #0x10]
 42a1488:      	blr	x8
 42a148c:      	b	0x42a1378 <_ChromeMain+0x429c0dc>
 42a1490:      	brk	#0x1
 42a1494:      	add	x0, sp, #0x28
 42a1498:      	bl	0x42a7360 <_ChromeMain+0x42a20c4>
 42a149c:      	b	0x42a134c <_ChromeMain+0x429c0b0>
 42a14a0:      	adrp	x21, 0xef06000 <dyld_stub_binder+0xef06000>
 42a14a4:      	add	x21, x21, #0x190
 42a14a8:      	mov	x0, x21
 42a14ac:      	bl	0x80048c0 <_ChromeMain+0x7fff624>
 42a14b0:      	cbz	w0, 0x42a11a0 <_ChromeMain+0x429bf04>
 42a14b4:      	str	xzr, [x22, #0x188]
 42a14b8:      	mov	w24, #0x1               ; =1
 42a14bc:      	stlrb	w24, [x21]
 42a14c0:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 42a14c4:      	add	x0, x0, #0x9f0
 42a14c8:      	bl	0x80048cc <_ChromeMain+0x7fff630>
 42a14cc:      	cbnz	w0, 0x42a1544 <_ChromeMain+0x429c2a8>
 42a14d0:      	adrp	x8, 0xef06000 <dyld_stub_binder+0xef06000>
 42a14d4:      	ldrb	w21, [x8, #0x191]
 42a14d8:      	strb	w24, [x8, #0x191]
 42a14dc:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 42a14e0:      	add	x0, x0, #0x9f0
 42a14e4:      	bl	0x8004904 <_ChromeMain+0x7fff668>
 42a14e8:      	cbnz	w0, 0x42a1524 <_ChromeMain+0x429c288>
 42a14ec:      	tbz	w21, #0x2, 0x42a11a0 <_ChromeMain+0x429bf04>
 42a14f0:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 42a14f4:      	add	x0, x0, #0xa30
 42a14f8:      	bl	0x8004910 <_ChromeMain+0x7fff674>
 42a14fc:      	cbz	w0, 0x42a11a0 <_ChromeMain+0x429bf04>
 42a1500:      	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42a1504:      	add	x8, x8, #0x713
 42a1508:      	str	x8, [sp]
 42a150c:      	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42a1510:      	add	x0, x0, #0x727
 42a1514:      	bl	0x800491c <_ChromeMain+0x7fff680>
 42a1518:      	brk	#0
 42a151c:      	hlt	#0
 42a1520:      	brk	#0x1
 42a1524:      	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42a1528:      	add	x8, x8, #0x713
 42a152c:      	str	x8, [sp]
 42a1530:      	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42a1534:      	add	x0, x0, #0x6f8
 42a1538:      	bl	0x800491c <_ChromeMain+0x7fff680>
 42a153c:      	b	0x42a1490 <_ChromeMain+0x429c1f4>
 42a1540:      	bl	0x8004ac4 <_ChromeMain+0x7fff828>
 42a1544:      	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 42a1548:      	add	x8, x8, #0x713
