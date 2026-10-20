
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45b63c0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45b63c4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45b63c8: 910043fd     	add	x29, sp, #0x10
 45b63cc: aa0003f3     	mov	x19, x0
 45b63d0: f9429c08     	ldr	x8, [x0, #0x538]
 45b63d4: f9403500     	ldr	x0, [x8, #0x68]
 45b63d8: 97ffa5fd     	bl	0x459fbcc <_ChromeMain+0x459a930>
 45b63dc: aa0003e8     	mov	x8, x0
 45b63e0: f9430a60     	ldr	x0, [x19, #0x610]
 45b63e4: 350000c8     	cbnz	w8, 0x45b63fc <_ChromeMain+0x45b1160>
 45b63e8: b40004c0     	cbz	x0, 0x45b6480 <_ChromeMain+0x45b11e4>
 45b63ec: 52800021     	mov	w1, #0x1                ; =1
 45b63f0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45b63f4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45b63f8: 15fffcc5     	b	0xc5b570c <_ChromeMain+0xc5b0470>
 45b63fc: b4000060     	cbz	x0, 0x45b6408 <_ChromeMain+0x45b116c>
 45b6400: f9402400     	ldr	x0, [x0, #0x48]
 45b6404: 94be3ed4     	bl	0x7545f54 <_ChromeMain+0x7540cb8>
 45b6408: f9430e74     	ldr	x20, [x19, #0x618]
 45b640c: b50001b4     	cbnz	x20, 0x45b6440 <_ChromeMain+0x45b11a4>
 45b6410: 52801f00     	mov	w0, #0xf8               ; =248
 45b6414: 96e963d5     	bl	0xf368 <_ChromeMain+0xa0cc>
 45b6418: aa0003f4     	mov	x20, x0
 45b641c: aa1303e1     	mov	x1, x19
 45b6420: 97ffa630     	bl	0x459fce0 <_ChromeMain+0x459aa44>
 45b6424: f9430e60     	ldr	x0, [x19, #0x618]
 45b6428: f9030e74     	str	x20, [x19, #0x618]
 45b642c: b40000a0     	cbz	x0, 0x45b6440 <_ChromeMain+0x45b11a4>
 45b6430: 97ffa669     	bl	0x459fdd4 <_ChromeMain+0x459ab38>
 45b6434: 52801f01     	mov	w1, #0xf8               ; =248
 45b6438: 96e94aa0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45b643c: f9430e74     	ldr	x20, [x19, #0x618]
 45b6440: 39438a88     	ldrb	w8, [x20, #0xe2]
 45b6444: 350000a8     	cbnz	w8, 0x45b6458 <_ChromeMain+0x45b11bc>
 45b6448: aa1403e0     	mov	x0, x20
 45b644c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45b6450: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45b6454: 17ffa751     	b	0x45a0198 <_ChromeMain+0x459aefc>
 45b6458: 52800028     	mov	w8, #0x1                ; =1
 45b645c: 39038288     	strb	w8, [x20, #0xe0]
 45b6460: aa1403e0     	mov	x0, x20
 45b6464: 97ffac04     	bl	0x45a1474 <_ChromeMain+0x459c1d8>
 45b6468: 39438a88     	ldrb	w8, [x20, #0xe2]
 45b646c: 370000a8     	tbnz	w8, #0x0, 0x45b6480 <_ChromeMain+0x45b11e4>
 45b6470: 3941e288     	ldrb	w8, [x20, #0x78]
 45b6474: 37000068     	tbnz	w8, #0x0, 0x45b6480 <_ChromeMain+0x45b11e4>
 45b6478: 39438288     	ldrb	w8, [x20, #0xe0]
 45b647c: 35000088     	cbnz	w8, 0x45b648c <_ChromeMain+0x45b11f0>
 45b6480: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45b6484: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45b6488: d65f03c0     	ret
 45b648c: f9402280     	ldr	x0, [x20, #0x40]
 45b6490: b4ffff80     	cbz	x0, 0x45b6480 <_ChromeMain+0x45b11e4>
 45b6494: 3903829f     	strb	wzr, [x20, #0xe0]
 45b6498: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45b649c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45b64a0: 17ffae99     	b	0x45a1f04 <_ChromeMain+0x459cc68>
		...
