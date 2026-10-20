
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4621174:      	sub	sp, sp, #0x90
 4621178:      	stp	x22, x21, [sp, #0x60]
 462117c:      	stp	x20, x19, [sp, #0x70]
 4621180:      	stp	x29, x30, [sp, #0x80]
 4621184:      	add	x29, sp, #0x80
 4621188:      	mov	x19, x1
 462118c:      	mov	x20, x0
 4621190:      	ldr	x21, [x0, #0x1c0]
 4621194:      	ldr	x0, [x1, #0xc0]
 4621198:      	ldr	x8, [x0]
 462119c:      	ldr	x8, [x8, #0xc0]
 46211a0:      	movi.2d	v0, #0000000000000000
 46211a4:      	movi.2d	v1, #0000000000000000
 46211a8:      	movi.2d	v2, #0000000000000000
 46211ac:      	movi.2d	v3, #0000000000000000
 46211b0:      	mov	w1, #0x1                ; =1
 46211b4:      	blr	x8
 46211b8:      	ldrb	w8, [x20, #0x440]
 46211bc:      	tbnz	w8, #0x0, 0x4621200 <_ChromeMain+0x461bf64>
 46211c0:      	ldrb	w8, [x20, #0x448]
 46211c4:      	cbnz	w8, 0x4621200 <_ChromeMain+0x461bf64>
 46211c8:      	ldrb	w8, [x20, #0x443]
 46211cc:      	cbz	w8, 0x46212ac <_ChromeMain+0x461c010>
 46211d0:      	mov	x8, #0x4080000000000000 ; =4647714815446351872
 46211d4:      	movi.2d	v0, #0000000000000000
 46211d8:      	stur	q0, [sp, #0x28]
 46211dc:      	stur	q0, [sp, #0x38]
 46211e0:      	str	xzr, [sp, #0x48]
 46211e4:      	mov	x9, #0x301              ; =769
 46211e8:      	movk	x9, #0xbf80, lsl #48
 46211ec:      	stp	x8, x9, [sp, #0x18]
 46211f0:      	mov	x0, x20
 46211f4:      	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 46211f8:      	mov	w1, #0xf7               ; =247
 46211fc:      	b	0x462122c <_ChromeMain+0x461bf90>
 4621200:      	mov	x8, #0x4080000000000000 ; =4647714815446351872
 4621204:      	movi.2d	v0, #0000000000000000
 4621208:      	stur	q0, [sp, #0x28]
 462120c:      	stur	q0, [sp, #0x38]
 4621210:      	str	xzr, [sp, #0x48]
 4621214:      	mov	x9, #0x301              ; =769
 4621218:      	movk	x9, #0xbf80, lsl #48
 462121c:      	stp	x8, x9, [sp, #0x18]
 4621220:      	mov	x0, x20
 4621224:      	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4621228:      	mov	w1, #0xd6               ; =214
 462122c:      	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 4621230:      	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4621234:      	stp	s0, s1, [sp, #0x8]
 4621238:      	stp	s2, s3, [sp, #0x10]
 462123c:      	ldr	x0, [x19, #0xc0]
 4621240:      	stur	xzr, [x29, #-0x30]
 4621244:      	dup.2d	v0, x21
 4621248:      	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 462124c:      	ldr	q1, [x8, #0x40]
 4621250:      	ushl.2d	v0, v0, v1
 4621254:      	xtn.2s	v0, v0
 4621258:      	movi.2d	v1, #0000000000000000
 462125c:      	smax.2s	v0, v0, v1
 4621260:      	ucvtf.2s	v0, v0
 4621264:      	stur	d0, [x29, #-0x28]
 4621268:      	ldr	x8, [x0]
 462126c:      	ldr	x8, [x8, #0x108]
 4621270:      	sub	x1, x29, #0x30
 4621274:      	fmov	s0, #10.00000000
 4621278:      	fmov	s1, #10.00000000
 462127c:      	add	x2, sp, #0x8
 4621280:      	blr	x8
 4621284:      	ldr	x0, [sp, #0x48]
 4621288:      	cbnz	x0, 0x4621430 <_ChromeMain+0x461c194>
 462128c:      	ldr	x0, [sp, #0x40]
 4621290:      	cbnz	x0, 0x46213e8 <_ChromeMain+0x461c14c>
 4621294:      	ldr	x0, [sp, #0x38]
 4621298:      	cbnz	x0, 0x46214c0 <_ChromeMain+0x461c224>
 462129c:      	ldr	x0, [sp, #0x30]
 46212a0:      	cbnz	x0, 0x4621378 <_ChromeMain+0x461c0dc>
 46212a4:      	ldr	x0, [sp, #0x28]
 46212a8:      	cbnz	x0, 0x4621478 <_ChromeMain+0x461c1dc>
 46212ac:      	ldr	w8, [x20, #0x454]
 46212b0:      	cmp	w8, #0x1
 46212b4:      	b.ne	0x4621364 <_ChromeMain+0x461c0c8>
 46212b8:      	mov	x8, #0x4080000000000000 ; =4647714815446351872
 46212bc:      	movi.2d	v0, #0000000000000000
 46212c0:      	stur	q0, [sp, #0x28]
 46212c4:      	stur	q0, [sp, #0x38]
 46212c8:      	str	xzr, [sp, #0x48]
 46212cc:      	mov	x9, #0x301              ; =769
 46212d0:      	movk	x9, #0xbf80, lsl #48
 46212d4:      	stp	x8, x9, [sp, #0x18]
 46212d8:      	mov	x0, x20
 46212dc:      	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 46212e0:      	mov	w1, #0xdb               ; =219
 46212e4:      	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 46212e8:      	bl	0xdced68 <_ChromeMain+0xdc9acc>
 46212ec:      	stp	s0, s1, [sp, #0x8]
 46212f0:      	stp	s2, s3, [sp, #0x10]
 46212f4:      	ldr	x0, [x19, #0xc0]
 46212f8:      	stur	xzr, [x29, #-0x30]
 46212fc:      	dup.2d	v0, x21
 4621300:      	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4621304:      	ldr	q1, [x8, #0x40]
 4621308:      	ushl.2d	v0, v0, v1
 462130c:      	xtn.2s	v0, v0
 4621310:      	movi.2d	v1, #0000000000000000
 4621314:      	smax.2s	v0, v0, v1
 4621318:      	ucvtf.2s	v0, v0
 462131c:      	stur	d0, [x29, #-0x28]
 4621320:      	ldr	x8, [x0]
 4621324:      	ldr	x8, [x8, #0x108]
 4621328:      	sub	x1, x29, #0x30
 462132c:      	fmov	s0, #10.00000000
 4621330:      	fmov	s1, #10.00000000
 4621334:      	add	x2, sp, #0x8
 4621338:      	blr	x8
 462133c:      	ldr	x0, [sp, #0x48]
 4621340:      	cbnz	x0, 0x4621454 <_ChromeMain+0x461c1b8>
 4621344:      	ldr	x0, [sp, #0x40]
 4621348:      	cbnz	x0, 0x462140c <_ChromeMain+0x461c170>
 462134c:      	ldr	x0, [sp, #0x38]
 4621350:      	cbnz	x0, 0x46214e4 <_ChromeMain+0x461c248>
 4621354:      	ldr	x0, [sp, #0x30]
 4621358:      	cbnz	x0, 0x46213b0 <_ChromeMain+0x461c114>
 462135c:      	ldr	x0, [sp, #0x28]
 4621360:      	cbnz	x0, 0x462149c <_ChromeMain+0x461c200>
 4621364:      	ldp	x29, x30, [sp, #0x80]
 4621368:      	ldp	x20, x19, [sp, #0x70]
 462136c:      	ldp	x22, x21, [sp, #0x60]
 4621370:      	add	sp, sp, #0x90
 4621374:      	ret
 4621378:      	add	x8, x0, #0x8
 462137c:      	mov	w9, #-0x1               ; =-1
 4621380:      	ldaddal	w9, w8, [x8]
 4621384:      	cmp	w8, #0x1
 4621388:      	b.ne	0x46212a4 <_ChromeMain+0x461c008>
 462138c:      	ldr	x9, [x0]
 4621390:      	ldr	x8, [x9, #0x10]
 4621394:      	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 4621398:      	add	x10, x10, #0x180
 462139c:      	cmp	x8, x10
 46213a0:      	b.ne	0x46213a8 <_ChromeMain+0x461c10c>
 46213a4:      	ldr	x8, [x9, #0x8]
 46213a8:      	blr	x8
 46213ac:      	b	0x46212a4 <_ChromeMain+0x461c008>
 46213b0:      	add	x8, x0, #0x8
 46213b4:      	mov	w9, #-0x1               ; =-1
 46213b8:      	ldaddal	w9, w8, [x8]
 46213bc:      	cmp	w8, #0x1
 46213c0:      	b.ne	0x462135c <_ChromeMain+0x461c0c0>
 46213c4:      	ldr	x9, [x0]
 46213c8:      	ldr	x8, [x9, #0x10]
 46213cc:      	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 46213d0:      	add	x10, x10, #0x180
 46213d4:      	cmp	x8, x10
 46213d8:      	b.ne	0x46213e0 <_ChromeMain+0x461c144>
 46213dc:      	ldr	x8, [x9, #0x8]
 46213e0:      	blr	x8
 46213e4:      	b	0x462135c <_ChromeMain+0x461c0c0>
 46213e8:      	add	x8, x0, #0x8
 46213ec:      	mov	w9, #-0x1               ; =-1
 46213f0:      	ldaddal	w9, w8, [x8]
 46213f4:      	cmp	w8, #0x1
 46213f8:      	b.ne	0x4621294 <_ChromeMain+0x461bff8>
 46213fc:      	ldr	x8, [x0]
 4621400:      	ldr	x8, [x8, #0x10]
 4621404:      	blr	x8
 4621408:      	b	0x4621294 <_ChromeMain+0x461bff8>
 462140c:      	add	x8, x0, #0x8
 4621410:      	mov	w9, #-0x1               ; =-1
 4621414:      	ldaddal	w9, w8, [x8]
 4621418:      	cmp	w8, #0x1
 462141c:      	b.ne	0x462134c <_ChromeMain+0x461c0b0>
 4621420:      	ldr	x8, [x0]
 4621424:      	ldr	x8, [x8, #0x10]
 4621428:      	blr	x8
 462142c:      	b	0x462134c <_ChromeMain+0x461c0b0>
 4621430:      	add	x8, x0, #0x8
 4621434:      	mov	w9, #-0x1               ; =-1
 4621438:      	ldaddal	w9, w8, [x8]
 462143c:      	cmp	w8, #0x1
 4621440:      	b.ne	0x462128c <_ChromeMain+0x461bff0>
 4621444:      	ldr	x8, [x0]
 4621448:      	ldr	x8, [x8, #0x10]
 462144c:      	blr	x8
 4621450:      	b	0x462128c <_ChromeMain+0x461bff0>
 4621454:      	add	x8, x0, #0x8
 4621458:      	mov	w9, #-0x1               ; =-1
 462145c:      	ldaddal	w9, w8, [x8]
 4621460:      	cmp	w8, #0x1
 4621464:      	b.ne	0x4621344 <_ChromeMain+0x461c0a8>
 4621468:      	ldr	x8, [x0]
 462146c:      	ldr	x8, [x8, #0x10]
 4621470:      	blr	x8
 4621474:      	b	0x4621344 <_ChromeMain+0x461c0a8>
 4621478:      	add	x8, x0, #0x8
 462147c:      	mov	w9, #-0x1               ; =-1
 4621480:      	ldaddal	w9, w8, [x8]
 4621484:      	cmp	w8, #0x1
 4621488:      	b.ne	0x46212ac <_ChromeMain+0x461c010>
 462148c:      	ldr	x8, [x0]
 4621490:      	ldr	x8, [x8, #0x10]
 4621494:      	blr	x8
 4621498:      	b	0x46212ac <_ChromeMain+0x461c010>
 462149c:      	add	x8, x0, #0x8
 46214a0:      	mov	w9, #-0x1               ; =-1
 46214a4:      	ldaddal	w9, w8, [x8]
 46214a8:      	cmp	w8, #0x1
 46214ac:      	b.ne	0x4621364 <_ChromeMain+0x461c0c8>
 46214b0:      	ldr	x8, [x0]
 46214b4:      	ldr	x8, [x8, #0x10]
 46214b8:      	blr	x8
 46214bc:      	b	0x4621364 <_ChromeMain+0x461c0c8>
 46214c0:      	add	x8, x0, #0x8
 46214c4:      	mov	w9, #-0x1               ; =-1
 46214c8:      	ldaddal	w9, w8, [x8]
 46214cc:      	cmp	w8, #0x1
 46214d0:      	b.ne	0x462129c <_ChromeMain+0x461c000>
 46214d4:      	ldr	x8, [x0]
 46214d8:      	ldr	x8, [x8, #0x10]
 46214dc:      	blr	x8
 46214e0:      	b	0x462129c <_ChromeMain+0x461c000>
 46214e4:      	add	x8, x0, #0x8
 46214e8:      	mov	w9, #-0x1               ; =-1
 46214ec:      	ldaddal	w9, w8, [x8]
 46214f0:      	cmp	w8, #0x1
 46214f4:      	b.ne	0x4621354 <_ChromeMain+0x461c0b8>
 46214f8:      	ldr	x8, [x0]
 46214fc:      	ldr	x8, [x8, #0x10]
 4621500:      	blr	x8
 4621504:      	b	0x4621354 <_ChromeMain+0x461c0b8>
