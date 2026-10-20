
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  f15110:      	sub	sp, sp, #0x20
  f15114:      	stp	x29, x30, [sp, #0x10]
  f15118:      	add	x29, sp, #0x10
  f1511c:      	ldr	x8, [x0, #0x8]
  f15120:      	ldr	x13, [x8]
  f15124:      	tst	x13, #0xfe
  f15128:      	b.eq	0xf15244 <_ChromeMain+0xf0ffa8>
  f1512c:      	mov	x9, #0x0                ; =0
  f15130:      	ldr	x8, [x8, #0x8]
  f15134:      	mov	x10, #-0x1              ; =-1
  f15138:      	lsl	x10, x10, x13
  f1513c:      	adrp	x12, 0xe757000 <dyld_stub_binder+0xe757000>
  f15140:      	add	x12, x12, #0xa50
  f15144:      	adrp	x11, 0xe9db000 <dyld_stub_binder+0xe9db000>
  f15148:      	add	x11, x11, #0xd38
  f1514c:      	eor	x12, x11, x12
  f15150:      	mov	x14, #0x8cf5            ; =36085
  f15154:      	movk	x14, #0xde1e, lsl #16
  f15158:      	movk	x14, #0xf9e0, lsl #32
  f1515c:      	movk	x14, #0x79d5, lsl #48
  f15160:      	mul	x15, x12, x14
  f15164:      	umulh	x14, x12, x14
  f15168:      	sub	x12, x8, x10
  f1516c:      	add	x12, x12, #0x7
  f15170:      	prfm	pldl3keep, [x8]
  f15174:      	ubfx	x13, x13, #8, #8
  f15178:      	eor	x14, x14, x15
  f1517c:      	eor	x13, x13, x14
  f15180:      	lsr	x14, x14, #57
  f15184:      	dup.8b	v0, w14
  f15188:      	bic	x13, x13, x10
  f1518c:      	lsl	x14, x13, #4
  f15190:      	prfm	pldl1keep, [x12, x14]
  f15194:      	ldr	d1, [x8, x13]
  f15198:      	cmeq.8b	v2, v1, v0
  f1519c:      	fmov	x14, d2
  f151a0:      	cbz	x14, 0xf1522c <_ChromeMain+0xf0ff90>
  f151a4:      	rbit	x15, x14
  f151a8:      	clz	x15, x15
  f151ac:      	add	x15, x13, x15, lsr #3
  f151b0:      	bic	x15, x15, x10
  f151b4:      	lsl	x16, x15, #4
  f151b8:      	ldr	x16, [x12, x16]
  f151bc:      	cmp	x16, x11
  f151c0:      	b.ne	0xf1521c <_ChromeMain+0xf0ff80>
  f151c4:      	add	x9, x12, x15, lsl #4
  f151c8:      	add	x8, x8, x15
  f151cc:      	adrp	x10, 0xeee6000 <dyld_stub_binder+0xeee6000>
  f151d0:      	add	x10, x10, #0x2c0
  f151d4:      	cmp	x9, x10
  f151d8:      	ccmp	x9, #0x0, #0x4, ne
  f151dc:      	b.eq	0xf151e8 <_ChromeMain+0xf0ff4c>
  f151e0:      	ldrb	w11, [x8]
  f151e4:      	tbnz	w11, #0x7, 0xf15280 <_ChromeMain+0xf0ffe4>
  f151e8:      	cmp	x9, x10
  f151ec:      	b.eq	0xf15290 <_ChromeMain+0xf0fff4>
  f151f0:      	cbz	x9, 0xf15284 <_ChromeMain+0xf0ffe8>
  f151f4:      	ldrb	w8, [x8]
  f151f8:      	tbnz	w8, #0x7, 0xf152bc <_ChromeMain+0xf10020>
  f151fc:      	ldr	x8, [x9, #0x8]
  f15200:      	cbz	x8, 0xf15284 <_ChromeMain+0xf0ffe8>
  f15204:      	ldr	w8, [x8, #0x8]
  f15208:      	cmp	w8, #0x0
  f1520c:      	cset	w0, eq
  f15210:      	ldp	x29, x30, [sp, #0x10]
  f15214:      	add	sp, sp, #0x20
  f15218:      	ret
  f1521c:      	and	x14, x14, #0x8080808080808080
  f15220:      	sub	x15, x14, #0x80
  f15224:      	ands	x14, x15, x14
  f15228:      	b.ne	0xf151a4 <_ChromeMain+0xf0ff08>
  f1522c:      	movi.8b	v2, #0x80
  f15230:      	cmeq.8b	v1, v1, v2
  f15234:      	fmov	x14, d1
  f15238:      	cbz	x14, 0xf15274 <_ChromeMain+0xf0ffd8>
  f1523c:      	mov	x9, #0x0                ; =0
  f15240:      	b	0xf151cc <_ChromeMain+0xf0ff30>
  f15244:      	cmp	x13, #0x100, lsl #12    ; =0x100000
  f15248:      	b.lo	0xf1523c <_ChromeMain+0xf0ffa0>
  f1524c:      	ldr	x9, [x8, #0x8]
  f15250:      	adrp	x8, 0xe9db000 <dyld_stub_binder+0xe9db000>
  f15254:      	add	x8, x8, #0xd38
  f15258:      	ldr	x10, [x9]
  f1525c:      	adrp	x11, 0xcbd8000 <dyld_stub_binder+0xcbd8000>
