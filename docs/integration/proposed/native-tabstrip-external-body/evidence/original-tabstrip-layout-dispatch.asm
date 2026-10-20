
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 78abf58:      	stp	x24, x23, [sp, #-0x40]!
 78abf5c:      	stp	x22, x21, [sp, #0x10]
 78abf60:      	stp	x20, x19, [sp, #0x20]
 78abf64:      	stp	x29, x30, [sp, #0x30]
 78abf68:      	add	x29, sp, #0x30
 78abf6c:      	mov	x20, x8
 78abf70:      	ldr	x21, [x0, #0x30]
 78abf74:      	cbz	x21, 0x78abfc4 <_ChromeMain+0x78a6d28>
 78abf78:      	mov	x19, x1
 78abf7c:      	mov	x22, x0
 78abf80:      	ldr	x8, [x21]
 78abf84:      	ldr	x8, [x8, #0x58]
 78abf88:      	mov	x0, x21
 78abf8c:      	blr	x8
 78abf90:      	mov	x23, x0
 78abf94:      	bl	0x78abd18 <_ChromeMain+0x78a6a7c>
 78abf98:      	cmp	x23, #0x0
 78abf9c:      	cset	w8, ne
 78abfa0:      	cmp	x23, x0
 78abfa4:      	ccmp	x23, #0x0, #0x4, ne
 78abfa8:      	b.eq	0x78abfc0 <_ChromeMain+0x78a6d24>
 78abfac:      	ldr	x23, [x23, #0x48]
 78abfb0:      	cmp	x23, #0x0
 78abfb4:      	cset	w8, ne
 78abfb8:      	ccmp	x23, x0, #0x4, ne
 78abfbc:      	b.ne	0x78abfac <_ChromeMain+0x78a6d10>
 78abfc0:      	tbnz	w8, #0x0, 0x78abfe0 <_ChromeMain+0x78a6d44>
 78abfc4:      	movi.2d	v0, #0000000000000000
 78abfc8:      	stp	q0, q0, [x20]
 78abfcc:      	ldp	x29, x30, [sp, #0x30]
 78abfd0:      	ldp	x20, x19, [sp, #0x20]
 78abfd4:      	ldp	x22, x21, [sp, #0x10]
 78abfd8:      	ldp	x24, x23, [sp], #0x40
 78abfdc:      	ret
 78abfe0:      	ldr	w8, [x22, #0xf0]
 78abfe4:      	cbz	w8, 0x78ac008 <_ChromeMain+0x78a6d6c>
 78abfe8:      	mov	x8, x20
 78abfec:      	mov	x0, x21
 78abff0:      	mov	x1, x19
 78abff4:      	ldp	x29, x30, [sp, #0x30]
 78abff8:      	ldp	x20, x19, [sp, #0x20]
 78abffc:      	ldp	x22, x21, [sp, #0x10]
 78ac000:      	ldp	x24, x23, [sp], #0x40
 78ac004:      	b	0x4129e00 <_ChromeMain+0x4124b64>
 78ac008:      	mov	x8, x20
 78ac00c:      	mov	x0, x21
 78ac010:      	mov	x1, x19
 78ac014:      	ldp	x29, x30, [sp, #0x30]
 78ac018:      	ldp	x20, x19, [sp, #0x20]
 78ac01c:      	ldp	x22, x21, [sp, #0x10]
 78ac020:      	ldp	x24, x23, [sp], #0x40
 78ac024:      	b	0x4129b40 <_ChromeMain+0x41248a4>
 78ac028:      	nop
 78ac02c:      	nop
 78ac030:      	nop
 78ac034:      	nop
 78ac038:      	nop
 78ac03c:      	nop
 78ac040:      	nop
 78ac044:      	nop
 78ac048:      	nop
 78ac04c:      	nop
 78ac050:      	nop
 78ac054:      	nop
 78ac058:      	nop
 78ac05c:      	nop
 78ac060:      	sub	sp, sp, #0x50
 78ac064:      	stp	x22, x21, [sp, #0x20]
 78ac068:      	stp	x20, x19, [sp, #0x30]
 78ac06c:      	stp	x29, x30, [sp, #0x40]
 78ac070:      	add	x29, sp, #0x40
 78ac074:      	mov	x20, x1
 78ac078:      	mov	x19, x0
 78ac07c:      	bl	0x78ac18c <_ChromeMain+0x78a6ef0>
 78ac080:      	cbz	x0, 0x78ac14c <_ChromeMain+0x78a6eb0>
 78ac084:      	ldr	x8, [x0, #0x318]
 78ac088:      	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 78ac08c:      	cbz	x8, 0x78ac0f8 <_ChromeMain+0x78a6e5c>
 78ac090:      	add	x9, x0, #0x318
 78ac094:      	adrp	x10, 0xead4000 <dyld_stub_binder+0xead4000>
 78ac098:      	add	x10, x10, #0xc48
 78ac09c:      	b	0x78ac0e0 <_ChromeMain+0x78a6e44>
 78ac0a0:      	cmp	x8, x9
 78ac0a4:      	b.eq	0x78ac0f8 <_ChromeMain+0x78a6e5c>
 78ac0a8:      	ldr	x21, [x8, #0x28]
 78ac0ac:      	and	x8, x21, #0xfffffffc00000000
 78ac0b0:      	ldr	x9, [x22, #0x88]
 78ac0b4:      	cmp	x8, x9
 78ac0b8:      	b.ne	0x78ac0fc <_ChromeMain+0x78a6e60>
 78ac0bc:      	mov	x0, x21
 78ac0c0:      	bl	0x142fc <_ChromeMain+0xf060>
 78ac0c4:      	b	0x78ac0fc <_ChromeMain+0x78a6e60>
 78ac0c8:      	mov	x0, x21
 78ac0cc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 78ac0d0:      	cbz	x21, 0x78ac14c <_ChromeMain+0x78a6eb0>
 78ac0d4:      	b	0x78ac110 <_ChromeMain+0x78a6e74>
 78ac0d8:      	ldr	x8, [x8]
 78ac0dc:      	cbz	x8, 0x78ac0f8 <_ChromeMain+0x78a6e5c>
 78ac0e0:      	ldr	x11, [x8, #0x20]
 78ac0e4:      	cmp	x11, x10
 78ac0e8:      	b.hi	0x78ac0d8 <_ChromeMain+0x78a6e3c>
 78ac0ec:      	b.eq	0x78ac0a0 <_ChromeMain+0x78a6e04>
 78ac0f0:      	ldr	x8, [x8, #0x8]
 78ac0f4:      	cbnz	x8, 0x78ac0e0 <_ChromeMain+0x78a6e44>
 78ac0f8:      	mov	x21, #0x0               ; =0
 78ac0fc:      	and	x8, x21, #0xfffffffc00000000
 78ac100:      	ldr	x9, [x22, #0x88]
 78ac104:      	cmp	x8, x9
 78ac108:      	b.eq	0x78ac0c8 <_ChromeMain+0x78a6e2c>
 78ac10c:      	cbz	x21, 0x78ac14c <_ChromeMain+0x78a6eb0>
 78ac110:      	ldr	q0, [x20]
 78ac114:      	str	q0, [sp]
 78ac118:      	ldr	x8, [x20, #0x10]
 78ac11c:      	str	x8, [sp, #0x10]
 78ac120:      	stp	xzr, xzr, [x20, #0x8]
 78ac124:      	str	xzr, [x20]
 78ac128:      	mov	x1, sp
 78ac12c:      	mov	x0, x21
 78ac130:      	bl	0x456a6f8 <_ChromeMain+0x456545c>
 78ac134:      	ldrsb	w8, [sp, #0x17]
 78ac138:      	tbz	w8, #0x1f, 0x78ac14c <_ChromeMain+0x78a6eb0>
 78ac13c:      	ldr	x0, [sp]
 78ac140:      	ldr	x8, [sp, #0x10]
 78ac144:      	lsl	x1, x8, #1
 78ac148:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 78ac14c:      	ldrb	w8, [x19, #0x61b]
 78ac150:      	cbz	w8, 0x78ac178 <_ChromeMain+0x78a6edc>
 78ac154:      	strb	wzr, [x19, #0x61b]
 78ac158:      	ldr	x0, [x19, #0x430]
 78ac15c:      	ldr	x8, [x0]
 78ac160:      	ldr	x8, [x8, #0xa0]
 78ac164:      	mov	w1, #0x0                ; =0
 78ac168:      	blr	x8
 78ac16c:      	mov	x0, x19
 78ac170:      	mov	w1, #0x0                ; =0
 78ac174:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 78ac178:      	ldp	x29, x30, [sp, #0x40]
 78ac17c:      	ldp	x20, x19, [sp, #0x30]
 78ac180:      	ldp	x22, x21, [sp, #0x20]
 78ac184:      	add	sp, sp, #0x50
 78ac188:      	ret
 78ac18c:      	sub	sp, sp, #0x30
 78ac190:      	stp	x20, x19, [sp, #0x10]
 78ac194:      	stp	x29, x30, [sp, #0x20]
 78ac198:      	add	x29, sp, #0x20
 78ac19c:      	ldr	x8, [x0, #0x408]
 78ac1a0:      	cbnz	x8, 0x78ac1bc <_ChromeMain+0x78a6f20>
 78ac1a4:      	mov	x19, #0x0               ; =0
 78ac1a8:      	mov	x0, x19
 78ac1ac:      	ldp	x29, x30, [sp, #0x20]
 78ac1b0:      	ldp	x20, x19, [sp, #0x10]
 78ac1b4:      	add	sp, sp, #0x30
 78ac1b8:      	ret
 78ac1bc:      	strb	wzr, [sp]
 78ac1c0:      	mov	w9, #0xff               ; =255
 78ac1c4:      	strb	w9, [sp, #0x8]
 78ac1c8:      	mov	x0, sp
 78ac1cc:      	add	x1, x8, #0xf0
 78ac1d0:      	bl	0x6dfe854 <_ChromeMain+0x6df95b8>
 78ac1d4:      	ldrb	w8, [sp, #0x8]
 78ac1d8:      	cbnz	w8, 0x78ac200 <_ChromeMain+0x78a6f64>
 78ac1dc:      	ldr	x19, [sp]
 78ac1e0:      	and	x8, x19, #0xfffffffc00000000
 78ac1e4:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 78ac1e8:      	ldr	x9, [x9, #0x88]
 78ac1ec:      	cmp	x8, x9
 78ac1f0:      	b.ne	0x78ac1a8 <_ChromeMain+0x78a6f0c>
 78ac1f4:      	mov	x0, x19
 78ac1f8:      	bl	0x26a44 <_ChromeMain+0x217a8>
 78ac1fc:      	b	0x78ac1a8 <_ChromeMain+0x78a6f0c>
 78ac200:      	cmp	w8, #0xff
 78ac204:      	b.ne	0x78ac214 <_ChromeMain+0x78a6f78>
 78ac208:      	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 78ac20c:      	add	x0, x0, #0xef8
 78ac210:      	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 78ac214:      	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 78ac218:      	add	x0, x0, #0xf18
 78ac21c:      	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 78ac220:      	b	0x39e58f0 <_ChromeMain+0x39e0654>
		...
 78ac240:      	stp	x20, x19, [sp, #-0x20]!
 78ac244:      	stp	x29, x30, [sp, #0x10]
 78ac248:      	add	x29, sp, #0x10
 78ac24c:      	mov	x19, x0
 78ac250:      	ldr	x8, [x0]
 78ac254:      	ldr	x8, [x8, #0x68]
 78ac258:      	blr	x8
 78ac25c:      	cbz	x0, 0x78ac268 <_ChromeMain+0x78a6fcc>
 78ac260:      	ldrb	w8, [x19, #0x610]
 78ac264:      	cbnz	w8, 0x78ac274 <_ChromeMain+0x78a6fd8>
 78ac268:      	ldp	x29, x30, [sp, #0x10]
 78ac26c:      	ldp	x20, x19, [sp], #0x20
 78ac270:      	ret
 78ac274:      	ldr	x8, [x19]
 78ac278:      	ldr	x8, [x8, #0x68]
 78ac27c:      	mov	x0, x19
 78ac280:      	blr	x8
 78ac284:      	ldp	x29, x30, [sp, #0x10]
 78ac288:      	ldp	x20, x19, [sp], #0x20
 78ac28c:      	b	0x23b3578 <_ChromeMain+0x23ae2dc>
		...
 78ac2c0:      	cmp	w1, #0x0
 78ac2c4:      	cset	w8, eq
 78ac2c8:      	strb	w8, [x0, #0x615]
 78ac2cc:      	ret
 78ac2d0:      	b	0x412c374 <_ChromeMain+0x41270d8>
		...
 78ac300:      	sub	x0, x0, #0x8
 78ac304:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac308:      	sub	x0, x0, #0x10
 78ac30c:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac310:      	sub	x0, x0, #0x68
 78ac314:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac318:      	sub	x0, x0, #0x70
 78ac31c:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac320:      	sub	x0, x0, #0xb0
 78ac324:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac328:      	sub	x0, x0, #0xd8
 78ac32c:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac330:      	sub	x0, x0, #0xf8
 78ac334:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac338:      	sub	x0, x0, #0x310
 78ac33c:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac340:      	sub	x0, x0, #0x320
 78ac344:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac348:      	sub	x0, x0, #0x340
 78ac34c:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac350:      	sub	x0, x0, #0x400
 78ac354:      	b	0x412c374 <_ChromeMain+0x41270d8>
 78ac358:      	stp	x29, x30, [sp, #-0x10]!
 78ac35c:      	mov	x29, sp
 78ac360:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac364:      	mov	w1, #0xf90              ; =3984
 78ac368:      	movk	w1, #0x6df7, lsl #16
 78ac36c:      	ldp	x29, x30, [sp], #0x10
 78ac370:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac374:      	stp	x29, x30, [sp, #-0x10]!
 78ac378:      	mov	x29, sp
 78ac37c:      	sub	x0, x0, #0x8
 78ac380:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac384:      	mov	w1, #0xf90              ; =3984
 78ac388:      	movk	w1, #0x6df7, lsl #16
 78ac38c:      	ldp	x29, x30, [sp], #0x10
 78ac390:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac394:      	stp	x29, x30, [sp, #-0x10]!
 78ac398:      	mov	x29, sp
 78ac39c:      	sub	x0, x0, #0x10
 78ac3a0:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac3a4:      	mov	w1, #0xf90              ; =3984
 78ac3a8:      	movk	w1, #0x6df7, lsl #16
 78ac3ac:      	ldp	x29, x30, [sp], #0x10
 78ac3b0:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac3b4:      	stp	x29, x30, [sp, #-0x10]!
 78ac3b8:      	mov	x29, sp
 78ac3bc:      	sub	x0, x0, #0x68
 78ac3c0:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac3c4:      	mov	w1, #0xf90              ; =3984
 78ac3c8:      	movk	w1, #0x6df7, lsl #16
 78ac3cc:      	ldp	x29, x30, [sp], #0x10
 78ac3d0:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac3d4:      	stp	x29, x30, [sp, #-0x10]!
 78ac3d8:      	mov	x29, sp
 78ac3dc:      	sub	x0, x0, #0x70
 78ac3e0:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac3e4:      	mov	w1, #0xf90              ; =3984
 78ac3e8:      	movk	w1, #0x6df7, lsl #16
 78ac3ec:      	ldp	x29, x30, [sp], #0x10
 78ac3f0:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac3f4:      	stp	x29, x30, [sp, #-0x10]!
 78ac3f8:      	mov	x29, sp
 78ac3fc:      	sub	x0, x0, #0xb0
 78ac400:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac404:      	mov	w1, #0xf90              ; =3984
 78ac408:      	movk	w1, #0x6df7, lsl #16
 78ac40c:      	ldp	x29, x30, [sp], #0x10
 78ac410:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac414:      	stp	x29, x30, [sp, #-0x10]!
 78ac418:      	mov	x29, sp
 78ac41c:      	sub	x0, x0, #0xd8
 78ac420:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac424:      	mov	w1, #0xf90              ; =3984
 78ac428:      	movk	w1, #0x6df7, lsl #16
 78ac42c:      	ldp	x29, x30, [sp], #0x10
 78ac430:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac434:      	stp	x29, x30, [sp, #-0x10]!
 78ac438:      	mov	x29, sp
 78ac43c:      	sub	x0, x0, #0xf8
 78ac440:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac444:      	mov	w1, #0xf90              ; =3984
 78ac448:      	movk	w1, #0x6df7, lsl #16
 78ac44c:      	ldp	x29, x30, [sp], #0x10
 78ac450:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac454:      	stp	x29, x30, [sp, #-0x10]!
 78ac458:      	mov	x29, sp
 78ac45c:      	sub	x0, x0, #0x310
 78ac460:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac464:      	mov	w1, #0xf90              ; =3984
 78ac468:      	movk	w1, #0x6df7, lsl #16
 78ac46c:      	ldp	x29, x30, [sp], #0x10
 78ac470:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac474:      	stp	x29, x30, [sp, #-0x10]!
 78ac478:      	mov	x29, sp
 78ac47c:      	sub	x0, x0, #0x320
 78ac480:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac484:      	mov	w1, #0xf90              ; =3984
 78ac488:      	movk	w1, #0x6df7, lsl #16
 78ac48c:      	ldp	x29, x30, [sp], #0x10
 78ac490:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac494:      	stp	x29, x30, [sp, #-0x10]!
 78ac498:      	mov	x29, sp
 78ac49c:      	sub	x0, x0, #0x340
 78ac4a0:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac4a4:      	mov	w1, #0xf90              ; =3984
 78ac4a8:      	movk	w1, #0x6df7, lsl #16
 78ac4ac:      	ldp	x29, x30, [sp], #0x10
 78ac4b0:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac4b4:      	stp	x29, x30, [sp, #-0x10]!
 78ac4b8:      	mov	x29, sp
 78ac4bc:      	sub	x0, x0, #0x400
 78ac4c0:      	bl	0x412c374 <_ChromeMain+0x41270d8>
 78ac4c4:      	mov	w1, #0xf90              ; =3984
 78ac4c8:      	movk	w1, #0x6df7, lsl #16
 78ac4cc:      	ldp	x29, x30, [sp], #0x10
 78ac4d0:      	b	0xf5cae4 <_ChromeMain+0xf57848>
 78ac4d4:      	cbz	x1, 0x78ac534 <_ChromeMain+0x78a7298>
 78ac4d8:      	stp	x20, x19, [sp, #-0x20]!
 78ac4dc:      	stp	x29, x30, [sp, #0x10]
 78ac4e0:      	add	x29, sp, #0x10
 78ac4e4:      	mov	x0, x1
 78ac4e8:      	ldr	x8, [x1]
 78ac4ec:      	ldr	x8, [x8, #0x58]
 78ac4f0:      	blr	x8
 78ac4f4:      	mov	x19, x0
 78ac4f8:      	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 78ac4fc:      	cmp	x19, #0x0
