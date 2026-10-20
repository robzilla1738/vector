
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 136e810: 54000061     	b.ne	0x136e81c <_ChromeMain+0x1369580>
 136e814: aa1303e0     	mov	x0, x19
 136e818: 97b296b9     	bl	0x142fc <_ChromeMain+0xf060>
 136e81c: f0067ee8     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 136e820: 910b6108     	add	x8, x8, #0x2d8
 136e824: a9004ea8     	stp	x8, x19, [x21]
 136e828: 52800400     	mov	w0, #0x20               ; =32
 136e82c: 97b282cf     	bl	0xf368 <_ChromeMain+0xa0cc>
 136e830: aa0003f6     	mov	x22, x0
 136e834: f0067ee8     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 136e838: 911a4108     	add	x8, x8, #0x690
 136e83c: f9000008     	str	x8, [x0]
 136e840: f94046e8     	ldr	x8, [x23, #0x88]
 136e844: eb08033f     	cmp	x25, x8
 136e848: 54000061     	b.ne	0x136e854 <_ChromeMain+0x13695b8>
 136e84c: aa1303e0     	mov	x0, x19
 136e850: 97b296ab     	bl	0x142fc <_ChromeMain+0xf060>
 136e854: a900d6d3     	stp	x19, x21, [x22, #0x8]
 136e858: 52800028     	mov	w8, #0x1                ; =1
 136e85c: b9001ac8     	str	w8, [x22, #0x18]
 136e860: f9424260     	ldr	x0, [x19, #0x480]
 136e864: f9024276     	str	x22, [x19, #0x480]
 136e868: b50011a0     	cbnz	x0, 0x136ea9c <_ChromeMain+0x1369800>
 136e86c: f9423a69     	ldr	x9, [x19, #0x470]
