
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4243628: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 424362c: a90157f6     	stp	x22, x21, [sp, #0x10]
 4243630: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4243634: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4243638: 9100c3fd     	add	x29, sp, #0x30
 424363c: 90052248     	adrp	x8, 0xe68b000 <dyld_stub_binder+0xe68b000>
 4243640: 91084108     	add	x8, x8, #0x210
 4243644: 91138109     	add	x9, x8, #0x4e0
 4243648: a9002408     	stp	x8, x9, [x0]
 424364c: 91142109     	add	x9, x8, #0x508
 4243650: f9000809     	str	x9, [x0, #0x10]
 4243654: 91150109     	add	x9, x8, #0x540
 4243658: 9115c10a     	add	x10, x8, #0x570
 424365c: a906a809     	stp	x9, x10, [x0, #0x68]
 4243660: 91170109     	add	x9, x8, #0x5c0
 4243664: f9005809     	str	x9, [x0, #0xb0]
 4243668: 91188109     	add	x9, x8, #0x620
 424366c: f9006c09     	str	x9, [x0, #0xd8]
 4243670: 91194109     	add	x9, x8, #0x650
 4243674: f9007c09     	str	x9, [x0, #0xf8]
 4243678: 9119e109     	add	x9, x8, #0x678
 424367c: f9018809     	str	x9, [x0, #0x310]
 4243680: 911be109     	add	x9, x8, #0x6f8
 4243684: f9018c09     	str	x9, [x0, #0x318]
 4243688: 911ee109     	add	x9, x8, #0x7b8
 424368c: f9019009     	str	x9, [x0, #0x320]
 4243690: 911fc109     	add	x9, x8, #0x7f0
 4243694: f9025809     	str	x9, [x0, #0x4b0]
 4243698: 91210109     	add	x9, x8, #0x840
 424369c: f9025c09     	str	x9, [x0, #0x4b8]
 42436a0: 9121c108     	add	x8, x8, #0x870
 42436a4: f9031408     	str	x8, [x0, #0x628]
 42436a8: 39596008     	ldrb	w8, [x0, #0x658]
 42436ac: 350008e8     	cbnz	w8, 0x42437c8 <_ChromeMain+0x423e52c>
 42436b0: aa0003f3     	mov	x19, x0
 42436b4: f903381f     	str	xzr, [x0, #0x670]
 42436b8: f9433408     	ldr	x8, [x0, #0x668]
 42436bc: b4000168     	cbz	x8, 0x42436e8 <_ChromeMain+0x423e44c>
 42436c0: 52800029     	mov	w9, #0x1                ; =1
 42436c4: 19004109     	stlurb	w9, [x8, #0x4]
 42436c8: f9433660     	ldr	x0, [x19, #0x668]
 42436cc: b40000e0     	cbz	x0, 0x42436e8 <_ChromeMain+0x423e44c>
 42436d0: 12800008     	mov	w8, #-0x1               ; =-1
 42436d4: b8e80008     	ldaddal	w8, w8, [x0]
 42436d8: 7100051f     	cmp	w8, #0x1
 42436dc: 54000061     	b.ne	0x42436e8 <_ChromeMain+0x423e44c>
 42436e0: 52800101     	mov	w1, #0x8                ; =8
 42436e4: 96f715f5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42436e8: f9433260     	ldr	x0, [x19, #0x660]
 42436ec: b5000220     	cbnz	x0, 0x4243730 <_ChromeMain+0x423e494>
 42436f0: f9432a68     	ldr	x8, [x19, #0x650]
 42436f4: b50002c8     	cbnz	x8, 0x424374c <_ChromeMain+0x423e4b0>
 42436f8: f9431e60     	ldr	x0, [x19, #0x638]
 42436fc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4243700: f0054b69     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4243704: f9404529     	ldr	x9, [x9, #0x88]
 4243708: eb09011f     	cmp	x8, x9
 424370c: 54000041     	b.ne	0x4243714 <_ChromeMain+0x423e478>
 4243710: 96f77ccb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4243714: f9031e7f     	str	xzr, [x19, #0x638]
 4243718: aa1303e0     	mov	x0, x19
 424371c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4243720: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4243724: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4243728: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 424372c: 1771e84f     	b	0x1ebd868 <_ChromeMain+0x1eb85cc>
 4243730: 12800008     	mov	w8, #-0x1               ; =-1
 4243734: b8e80008     	ldaddal	w8, w8, [x0]
 4243738: 7100051f     	cmp	w8, #0x1
 424373c: 54fffda1     	b.ne	0x42436f0 <_ChromeMain+0x423e454>
 4243740: f9400808     	ldr	x8, [x0, #0x10]
 4243744: d63f0100     	blr	x8
 4243748: 17ffffea     	b	0x42436f0 <_ChromeMain+0x423e454>
 424374c: 91190275     	add	x21, x19, #0x640
 4243750: f9432674     	ldr	x20, [x19, #0x648]
 4243754: f9432268     	ldr	x8, [x19, #0x640]
 4243758: f9400508     	ldr	x8, [x8, #0x8]
 424375c: f9400289     	ldr	x9, [x20]
 4243760: f9000528     	str	x8, [x9, #0x8]
 4243764: f9400289     	ldr	x9, [x20]
 4243768: f9000109     	str	x9, [x8]
 424376c: f9032a7f     	str	xzr, [x19, #0x650]
 4243770: eb15029f     	cmp	x20, x21
 4243774: 54fffc20     	b.eq	0x42436f8 <_ChromeMain+0x423e45c>
 4243778: 12800016     	mov	w22, #-0x1              ; =-1
 424377c: b1004288     	adds	x8, x20, #0x10
 4243780: 54000280     	b.eq	0x42437d0 <_ChromeMain+0x423e534>
 4243784: f9400697     	ldr	x23, [x20, #0x8]
 4243788: f9400100     	ldr	x0, [x8]
 424378c: b5000120     	cbnz	x0, 0x42437b0 <_ChromeMain+0x423e514>
 4243790: b4000214     	cbz	x20, 0x42437d0 <_ChromeMain+0x423e534>
 4243794: aa1403e0     	mov	x0, x20
 4243798: 52800301     	mov	w1, #0x18               ; =24
 424379c: 96f715c7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42437a0: aa1703f4     	mov	x20, x23
 42437a4: eb1502ff     	cmp	x23, x21
 42437a8: 54fffea1     	b.ne	0x424377c <_ChromeMain+0x423e4e0>
 42437ac: 17ffffd3     	b	0x42436f8 <_ChromeMain+0x423e45c>
 42437b0: b8f60008     	ldaddal	w22, w8, [x0]
 42437b4: 7100051f     	cmp	w8, #0x1
 42437b8: 54fffec1     	b.ne	0x4243790 <_ChromeMain+0x423e4f4>
 42437bc: f9400808     	ldr	x8, [x0, #0x10]
 42437c0: d63f0100     	blr	x8
 42437c4: 17fffff3     	b	0x4243790 <_ChromeMain+0x423e4f4>
