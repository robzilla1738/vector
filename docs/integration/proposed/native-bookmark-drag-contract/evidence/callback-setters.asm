
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4612080:      	stp	x22, x21, [sp, #-0x30]!
 4612084:      	stp	x20, x19, [sp, #0x10]
 4612088:      	stp	x29, x30, [sp, #0x20]
 461208c:      	add	x29, sp, #0x20
 4612090:      	mov	x21, x1
 4612094:      	mov	x19, x0
 4612098:      	ldr	x20, [x0, #0x6c8]
 461209c:      	str	x1, [x0, #0x6c8]
 46120a0:      	cbnz	x20, 0x46120f4 <_ChromeMain+0x460ce58>
 46120a4:      	cbz	x21, 0x46120e4 <_ChromeMain+0x460ce48>
 46120a8:      	mov	w8, #0x1                ; =1
 46120ac:      	ldadd	w8, w8, [x21]
 46120b0:      	cmp	w8, #0x0
 46120b4:      	b.le	0x4612194 <_ChromeMain+0x460cef8>
 46120b8:      	mov	w9, #0x7fffffff         ; =2147483647
 46120bc:      	cmp	w8, w9
 46120c0:      	b.eq	0x46121a0 <_ChromeMain+0x460cf04>
 46120c4:      	ldr	x8, [x19, #0x6c8]
 46120c8:      	ldr	x8, [x8, #0x8]
 46120cc:      	mov	x0, x21
 46120d0:      	blr	x8
 46120d4:      	mov	w8, #-0x1               ; =-1
 46120d8:      	ldaddal	w8, w8, [x21]
 46120dc:      	cmp	w8, #0x1
 46120e0:      	b.eq	0x4612170 <_ChromeMain+0x460ced4>
 46120e4:      	ldp	x29, x30, [sp, #0x20]
 46120e8:      	ldp	x20, x19, [sp, #0x10]
 46120ec:      	ldp	x22, x21, [sp], #0x30
 46120f0:      	ret
 46120f4:      	mov	w8, #-0x1               ; =-1
 46120f8:      	ldaddal	w8, w8, [x20]
 46120fc:      	cmp	w8, #0x1
 4612100:      	b.ne	0x4612150 <_ChromeMain+0x460ceb4>
 4612104:      	ldr	x8, [x20, #0x10]
 4612108:      	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 461210c:      	add	x9, x9, #0x640
 4612110:      	cmp	x8, x9
 4612114:      	b.eq	0x461213c <_ChromeMain+0x460cea0>
 4612118:      	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 461211c:      	add	x9, x9, #0x600
 4612120:      	mov	x0, x20
 4612124:      	cmp	x8, x9
 4612128:      	b.eq	0x4612134 <_ChromeMain+0x460ce98>
 461212c:      	blr	x8
 4612130:      	b	0x4612150 <_ChromeMain+0x460ceb4>
 4612134:      	mov	w1, #0x38               ; =56
 4612138:      	b	0x461214c <_ChromeMain+0x460ceb0>
 461213c:      	ldr	x0, [x20, #0x30]
 4612140:      	cbnz	x0, 0x461215c <_ChromeMain+0x460cec0>
 4612144:      	mov	x0, x20
 4612148:      	mov	w1, #0x48               ; =72
 461214c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4612150:      	ldr	x21, [x19, #0x6c8]
 4612154:      	cbnz	x21, 0x46120a8 <_ChromeMain+0x460ce0c>
 4612158:      	b	0x46120e4 <_ChromeMain+0x460ce48>
 461215c:      	mov	w8, #-0x1               ; =-1
 4612160:      	ldaddal	w8, w8, [x0]
 4612164:      	cmp	w8, #0x1
 4612168:      	b.eq	0x4612188 <_ChromeMain+0x460ceec>
 461216c:      	b	0x4612144 <_ChromeMain+0x460cea8>
 4612170:      	ldr	x1, [x21, #0x10]
 4612174:      	mov	x0, x21
 4612178:      	ldp	x29, x30, [sp, #0x20]
 461217c:      	ldp	x20, x19, [sp, #0x10]
 4612180:      	ldp	x22, x21, [sp], #0x30
 4612184:      	br	x1
 4612188:      	mov	w1, #0x8                ; =8
 461218c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4612190:      	b	0x4612144 <_ChromeMain+0x460cea8>
 4612194:      	brk	#0
 4612198:      	hlt	#0
 461219c:      	brk	#0x1
 46121a0:      	brk	#0
 46121a4:      	hlt	#0
 46121a8:      	brk	#0x1
 46121ac:      	stp	x22, x21, [sp, #-0x30]!
 46121b0:      	stp	x20, x19, [sp, #0x10]
 46121b4:      	stp	x29, x30, [sp, #0x20]
 46121b8:      	add	x29, sp, #0x20
 46121bc:      	mov	x19, x3
 46121c0:      	mov	x21, x2
 46121c4:      	mov	x20, x0
 46121c8:      	ldr	x22, [x0, #0x6d0]
 46121cc:      	str	x1, [x0, #0x6d0]
 46121d0:      	cbnz	x22, 0x46121fc <_ChromeMain+0x460cf60>
 46121d4:      	ldr	x22, [x20, #0x6d8]
 46121d8:      	str	x21, [x20, #0x6d8]
 46121dc:      	cbnz	x22, 0x461225c <_ChromeMain+0x460cfc0>
 46121e0:      	ldr	x21, [x20, #0x6e0]
 46121e4:      	str	x19, [x20, #0x6e0]
 46121e8:      	cbnz	x21, 0x46122ec <_ChromeMain+0x460d050>
 46121ec:      	ldp	x29, x30, [sp, #0x20]
 46121f0:      	ldp	x20, x19, [sp, #0x10]
 46121f4:      	ldp	x22, x21, [sp], #0x30
 46121f8:      	ret
 46121fc:      	mov	w8, #-0x1               ; =-1
 4612200:      	ldaddal	w8, w8, [x22]
 4612204:      	cmp	w8, #0x1
 4612208:      	b.ne	0x46121d4 <_ChromeMain+0x460cf38>
 461220c:      	ldr	x8, [x22, #0x10]
 4612210:      	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 4612214:      	add	x9, x9, #0x640
 4612218:      	cmp	x8, x9
 461221c:      	b.eq	0x4612244 <_ChromeMain+0x460cfa8>
 4612220:      	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 4612224:      	add	x9, x9, #0x600
 4612228:      	mov	x0, x22
 461222c:      	cmp	x8, x9
 4612230:      	b.eq	0x461223c <_ChromeMain+0x460cfa0>
 4612234:      	blr	x8
 4612238:      	b	0x46121d4 <_ChromeMain+0x460cf38>
 461223c:      	mov	w1, #0x38               ; =56
 4612240:      	b	0x4612254 <_ChromeMain+0x460cfb8>
 4612244:      	ldr	x0, [x22, #0x30]
 4612248:      	cbnz	x0, 0x46122d0 <_ChromeMain+0x460d034>
 461224c:      	mov	x0, x22
 4612250:      	mov	w1, #0x48               ; =72
 4612254:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4612258:      	b	0x46121d4 <_ChromeMain+0x460cf38>
 461225c:      	mov	w8, #-0x1               ; =-1
 4612260:      	ldaddal	w8, w8, [x22]
 4612264:      	cmp	w8, #0x1
 4612268:      	b.ne	0x46121e0 <_ChromeMain+0x460cf44>
 461226c:      	ldr	x8, [x22, #0x10]
 4612270:      	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 4612274:      	add	x9, x9, #0x640
 4612278:      	cmp	x8, x9
 461227c:      	b.eq	0x46122a4 <_ChromeMain+0x460d008>
 4612280:      	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 4612284:      	add	x9, x9, #0x600
 4612288:      	mov	x0, x22
 461228c:      	cmp	x8, x9
 4612290:      	b.eq	0x461229c <_ChromeMain+0x460d000>
 4612294:      	blr	x8
 4612298:      	b	0x46121e0 <_ChromeMain+0x460cf44>
 461229c:      	mov	w1, #0x38               ; =56
 46122a0:      	b	0x46122b4 <_ChromeMain+0x460d018>
 46122a4:      	ldr	x0, [x22, #0x30]
 46122a8:      	cbnz	x0, 0x46122bc <_ChromeMain+0x460d020>
 46122ac:      	mov	x0, x22
 46122b0:      	mov	w1, #0x48               ; =72
 46122b4:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46122b8:      	b	0x46121e0 <_ChromeMain+0x460cf44>
 46122bc:      	mov	w8, #-0x1               ; =-1
 46122c0:      	ldaddal	w8, w8, [x0]
 46122c4:      	cmp	w8, #0x1
 46122c8:      	b.eq	0x4612378 <_ChromeMain+0x460d0dc>
 46122cc:      	b	0x46122ac <_ChromeMain+0x460d010>
 46122d0:      	mov	w8, #-0x1               ; =-1
 46122d4:      	ldaddal	w8, w8, [x0]
 46122d8:      	cmp	w8, #0x1
 46122dc:      	b.ne	0x461224c <_ChromeMain+0x460cfb0>
 46122e0:      	mov	w1, #0x8                ; =8
 46122e4:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46122e8:      	b	0x461224c <_ChromeMain+0x460cfb0>
 46122ec:      	mov	w8, #-0x1               ; =-1
 46122f0:      	ldaddal	w8, w8, [x21]
 46122f4:      	cmp	w8, #0x1
 46122f8:      	b.ne	0x46121ec <_ChromeMain+0x460cf50>
 46122fc:      	ldr	x1, [x21, #0x10]
 4612300:      	adrp	x8, 0xfa5000 <_ChromeMain+0xf9fd64>
 4612304:      	add	x8, x8, #0x640
 4612308:      	cmp	x1, x8
 461230c:      	b.eq	0x461233c <_ChromeMain+0x460d0a0>
 4612310:      	adrp	x8, 0x396c000 <_ChromeMain+0x3966d64>
 4612314:      	add	x8, x8, #0x600
 4612318:      	mov	x0, x21
 461231c:      	cmp	x1, x8
 4612320:      	b.eq	0x4612334 <_ChromeMain+0x460d098>
 4612324:      	ldp	x29, x30, [sp, #0x20]
 4612328:      	ldp	x20, x19, [sp, #0x10]
 461232c:      	ldp	x22, x21, [sp], #0x30
 4612330:      	br	x1
 4612334:      	mov	w1, #0x38               ; =56
 4612338:      	b	0x461234c <_ChromeMain+0x460d0b0>
 461233c:      	ldr	x0, [x21, #0x30]
 4612340:      	cbnz	x0, 0x461235c <_ChromeMain+0x460d0c0>
 4612344:      	mov	x0, x21
 4612348:      	mov	w1, #0x48               ; =72
 461234c:      	ldp	x29, x30, [sp, #0x20]
 4612350:      	ldp	x20, x19, [sp, #0x10]
 4612354:      	ldp	x22, x21, [sp], #0x30
 4612358:      	b	0x8eb8 <_ChromeMain+0x3c1c>
 461235c:      	mov	w8, #-0x1               ; =-1
 4612360:      	ldaddal	w8, w8, [x0]
 4612364:      	cmp	w8, #0x1
 4612368:      	b.ne	0x4612344 <_ChromeMain+0x460d0a8>
 461236c:      	mov	w1, #0x8                ; =8
 4612370:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4612374:      	b	0x4612344 <_ChromeMain+0x460d0a8>
 4612378:      	mov	w1, #0x8                ; =8
 461237c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4612380:      	b	0x46122ac <_ChromeMain+0x460d010>
 4612384:      	sub	sp, sp, #0x80
 4612388:      	stp	x28, x27, [sp, #0x20]
 461238c:      	stp	x26, x25, [sp, #0x30]
 4612390:      	stp	x24, x23, [sp, #0x40]
 4612394:      	stp	x22, x21, [sp, #0x50]
 4612398:      	stp	x20, x19, [sp, #0x60]
 461239c:      	stp	x29, x30, [sp, #0x70]
 46123a0:      	add	x29, sp, #0x70
 46123a4:      	mov	x20, x0
 46123a8:      	mov	x19, x8
 46123ac:      	ldrb	w8, [x1, #0x18]
 46123b0:      	cbz	w8, 0x461240c <_ChromeMain+0x460d170>
 46123b4:      	ldr	x8, [x20, #0x530]
 46123b8:      	cbz	x8, 0x461240c <_ChromeMain+0x460d170>
 46123bc:      	ldrb	w8, [x8, #0x21]
 46123c0:      	cbz	w8, 0x461240c <_ChromeMain+0x460d170>
 46123c4:      	ldrb	w8, [x20, #0x1c8]
 46123c8:      	cbz	w8, 0x461240c <_ChromeMain+0x460d170>
 46123cc:      	mov	x21, x3
 46123d0:      	mov	x0, x20
 46123d4:      	bl	0x1427574 <_ChromeMain+0x14222d8>
 46123d8:      	ldr	w8, [x21]
 46123dc:      	cmp	w8, w0
 46123e0:      	b.lt	0x461240c <_ChromeMain+0x460d170>
 46123e4:      	add	w9, w1, w0
 46123e8:      	cmp	w8, w9
 46123ec:      	b.ge	0x461240c <_ChromeMain+0x460d170>
 46123f0:      	ldr	w8, [x21, #0x4]
 46123f4:      	lsr	x9, x0, #32
 46123f8:      	cmp	w8, w9
 46123fc:      	b.lt	0x461240c <_ChromeMain+0x460d170>
 4612400:      	add	x9, x9, x1, lsr #32
 4612404:      	cmp	w8, w9
 4612408:      	b.lt	0x4612524 <_ChromeMain+0x460d288>
 461240c:      	mov	x0, x20
 4612410:      	mov	w1, #0x1                ; =1
 4612414:      	bl	0x4613160 <_ChromeMain+0x460dec4>
 4612418:      	strb	wzr, [x19]
 461241c:      	strb	wzr, [x19, #0x10]
 4612420:      	ldp	x29, x30, [sp, #0x70]
 4612424:      	ldp	x20, x19, [sp, #0x60]
 4612428:      	ldp	x22, x21, [sp, #0x50]
 461242c:      	ldp	x24, x23, [sp, #0x40]
 4612430:      	ldp	x26, x25, [sp, #0x30]
 4612434:      	ldp	x28, x27, [sp, #0x20]
 4612438:      	add	sp, sp, #0x80
 461243c:      	ret
