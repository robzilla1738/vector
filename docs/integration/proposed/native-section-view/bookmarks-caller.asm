
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
