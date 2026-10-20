
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41f1410: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 41f1414: a9017bfd     	stp	x29, x30, [sp, #0x10]
 41f1418: 910043fd     	add	x29, sp, #0x10
 41f141c: 52800d00     	mov	w0, #0x68               ; =104
 41f1420: 96f877d2     	bl	0xf368 <_ChromeMain+0xa0cc>
 41f1424: aa0003f3     	mov	x19, x0
 41f1428: 9004c7c1     	adrp	x1, 0xdae9000 <dyld_stub_binder+0xdae9000>
 41f142c: 913c6821     	add	x1, x1, #0xf1a
 41f1430: 528006c2     	mov	w2, #0x36               ; =54
 41f1434: 528006a3     	mov	w3, #0x35               ; =53
 41f1438: 970cd850     	bl	0x527578 <_ChromeMain+0x5222dc>
 41f143c: f00501a8     	adrp	x8, 0xe228000 <dyld_stub_binder+0xe228000>
 41f1440: 91160108     	add	x8, x8, #0x580
 41f1444: f9000008     	str	x8, [x0]
 41f1448: 97aa6394     	bl	0x2c8a298 <_ChromeMain+0x2c84ffc>
 41f144c: aa1303e0     	mov	x0, x19
 41f1450: 9756d4e5     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 41f1454: aa1303e0     	mov	x0, x19
 41f1458: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 41f145c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 41f1460: d65f03c0     	ret
 41f1464: f0056888     	adrp	x8, 0xef04000 <dyld_stub_binder+0xef04000>
 41f1468: f945c100     	ldr	x0, [x8, #0xb80]
 41f146c: b4000040     	cbz	x0, 0x41f1474 <_ChromeMain+0x41ec1d8>
 41f1470: d65f03c0     	ret
 41f1474: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 41f1478: a9017bfd     	stp	x29, x30, [sp, #0x10]
 41f147c: 910043fd     	add	x29, sp, #0x10
 41f1480: aa0803f3     	mov	x19, x8
 41f1484: 97ffffe3     	bl	0x41f1410 <_ChromeMain+0x41ec174>
 41f1488: f905c260     	str	x0, [x19, #0xb80]
 41f148c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 41f1490: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 41f1494: 17fffff7     	b	0x41f1470 <_ChromeMain+0x41ec1d4>
