
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d81d0: b4000640     	cbz	x0, 0x41d8298 <_ChromeMain+0x41d2ffc>
 41d81d4: d10143ff     	sub	sp, sp, #0x50
 41d81d8: a90257f6     	stp	x22, x21, [sp, #0x20]
 41d81dc: a9034ff4     	stp	x20, x19, [sp, #0x30]
 41d81e0: a9047bfd     	stp	x29, x30, [sp, #0x40]
 41d81e4: 910103fd     	add	x29, sp, #0x40
 41d81e8: aa0003f5     	mov	x21, x0
 41d81ec: f9402008     	ldr	x8, [x0, #0x40]
 41d81f0: b40004c8     	cbz	x8, 0x41d8288 <_ChromeMain+0x41d2fec>
 41d81f4: aa0103f3     	mov	x19, x1
 41d81f8: f9402aa8     	ldr	x8, [x21, #0x50]
 41d81fc: b5000068     	cbnz	x8, 0x41d8208 <_ChromeMain+0x41d2f6c>
 41d8200: f94026a9     	ldr	x9, [x21, #0x48]
 41d8204: b4000429     	cbz	x9, 0x41d8288 <_ChromeMain+0x41d2fec>
 41d8208: 52800a09     	mov	w9, #0x50               ; =80
 41d820c: 5280090a     	mov	w10, #0x48              ; =72
 41d8210: f100011f     	cmp	x8, #0x0
 41d8214: 9a890148     	csel	x8, x10, x9, eq
 41d8218: f8686aa8     	ldr	x8, [x21, x8]
 41d821c: f9400908     	ldr	x8, [x8, #0x10]
 41d8220: f9400516     	ldr	x22, [x8, #0x8]
 41d8224: b4000336     	cbz	x22, 0x41d8288 <_ChromeMain+0x41d2fec>
 41d8228: f94036d4     	ldr	x20, [x22, #0x68]
 41d822c: 973ad3e9     	bl	0x108d1d0 <_ChromeMain+0x1087f34>
 41d8230: aa1403e1     	mov	x1, x20
 41d8234: 52800022     	mov	w2, #0x1                ; =1
 41d8238: 96f9ead7     	bl	0x52d94 <_ChromeMain+0x4daf8>
 41d823c: d1004014     	sub	x20, x0, #0x10
 41d8240: f100001f     	cmp	x0, #0x0
 41d8244: fa401a84     	ccmp	x20, #0x0, #0x4, ne
 41d8248: 54000200     	b.eq	0x41d8288 <_ChromeMain+0x41d2fec>
 41d824c: f94022a8     	ldr	x8, [x21, #0x40]
 41d8250: b40001c8     	cbz	x8, 0x41d8288 <_ChromeMain+0x41d2fec>
 41d8254: b0049781     	adrp	x1, 0xd4c9000 <dyld_stub_binder+0xd4c9000>
 41d8258: 9133d021     	add	x1, x1, #0xcf4
 41d825c: 91002100     	add	x0, x8, #0x8
 41d8260: 96f9ebc4     	bl	0x53170 <_ChromeMain+0x4ded4>
 41d8264: b4000120     	cbz	x0, 0x41d8288 <_ChromeMain+0x41d2fec>
 41d8268: d1008008     	sub	x8, x0, #0x20
 41d826c: b40000e8     	cbz	x8, 0x41d8288 <_ChromeMain+0x41d2fec>
 41d8270: b9405015     	ldr	w21, [x0, #0x50]
 41d8274: 710006bf     	cmp	w21, #0x1
 41d8278: 5400008b     	b.lt	0x41d8288 <_ChromeMain+0x41d2fec>
 41d827c: b94112d6     	ldr	w22, [x22, #0x110]
 41d8280: 710006df     	cmp	w22, #0x1
 41d8284: 540000ca     	b.ge	0x41d829c <_ChromeMain+0x41d3000>
 41d8288: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 41d828c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 41d8290: a94257f6     	ldp	x22, x21, [sp, #0x20]
 41d8294: 910143ff     	add	sp, sp, #0x50
 41d8298: d65f03c0     	ret
 41d829c: 39406268     	ldrb	w8, [x19, #0x18]
 41d82a0: 340001c8     	cbz	w8, 0x41d82d8 <_ChromeMain+0x41d303c>
 41d82a4: aa1303e0     	mov	x0, x19
 41d82a8: 971251f8     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 41d82ac: 39c05c08     	ldrsb	w8, [x0, #0x17]
 41d82b0: 36f800a8     	tbz	w8, #0x1f, 0x41d82c4 <_ChromeMain+0x41d3028>
 41d82b4: a9400801     	ldp	x1, x2, [x0]
 41d82b8: 910003e0     	mov	x0, sp
 41d82bc: 96f8ffd7     	bl	0x18218 <_ChromeMain+0x12f7c>
 41d82c0: 14000008     	b	0x41d82e0 <_ChromeMain+0x41d3044>
 41d82c4: 3dc00000     	ldr	q0, [x0]
 41d82c8: f9400808     	ldr	x8, [x0, #0x10]
 41d82cc: f9000be8     	str	x8, [sp, #0x10]
 41d82d0: 3d8003e0     	str	q0, [sp]
 41d82d4: 14000003     	b	0x41d82e0 <_ChromeMain+0x41d3044>
 41d82d8: a9007fff     	stp	xzr, xzr, [sp]
 41d82dc: f9000bff     	str	xzr, [sp, #0x10]
 41d82e0: b0046943     	adrp	x3, 0xcf01000 <dyld_stub_binder+0xcf01000>
 41d82e4: 91275863     	add	x3, x3, #0x9d6
 41d82e8: 910003e4     	mov	x4, sp
 41d82ec: aa1403e0     	mov	x0, x20
 41d82f0: aa1603e1     	mov	x1, x22
 41d82f4: aa1503e2     	mov	x2, x21
 41d82f8: 94e436e3     	bl	0x7ae5e84 <_ChromeMain+0x7ae0be8>
 41d82fc: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41d8300: 36fffc48     	tbz	w8, #0x1f, 0x41d8288 <_ChromeMain+0x41d2fec>
 41d8304: f94003e0     	ldr	x0, [sp]
 41d8308: f9400be8     	ldr	x8, [sp, #0x10]
 41d830c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d8310: 96f8c2ea     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d8314: 17ffffdd     	b	0x41d8288 <_ChromeMain+0x41d2fec>
 41d8318: d104c3ff     	sub	sp, sp, #0x130
 41d831c: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 41d8320: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 41d8324: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 41d8328: a91057f6     	stp	x22, x21, [sp, #0x100]
 41d832c: a9114ff4     	stp	x20, x19, [sp, #0x110]
 41d8330: a9127bfd     	stp	x29, x30, [sp, #0x120]
 41d8334: 910483fd     	add	x29, sp, #0x120
 41d8338: aa0003f3     	mov	x19, x0
 41d833c: 3903001f     	strb	wzr, [x0, #0xc0]
 41d8340: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 41d8344: f81a03bf     	stur	xzr, [x29, #-0x60]
 41d8348: f9402000     	ldr	x0, [x0, #0x40]
 41d834c: 9100c3e8     	add	x8, sp, #0x30
 41d8350: 97fff0c4     	bl	0x41d4660 <_ChromeMain+0x41cf3c4>
 41d8354: a94323f4     	ldp	x20, x8, [sp, #0x30]
 41d8358: 8b080d08     	add	x8, x8, x8, lsl #3
 41d835c: d37ced15     	lsl	x21, x8, #4
 41d8360: b4000175     	cbz	x21, 0x41d838c <_ChromeMain+0x41d30f0>
 41d8364: aa1403e0     	mov	x0, x20
 41d8368: 971251c8     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 41d836c: aa0003e1     	mov	x1, x0
 41d8370: d101c3a0     	sub	x0, x29, #0x70
 41d8374: aa0103e2     	mov	x2, x1
 41d8378: 97702ae2     	bl	0x1de2f00 <_ChromeMain+0x1dddc64>
 41d837c: 91024294     	add	x20, x20, #0x90
 41d8380: f10242b5     	subs	x21, x21, #0x90
 41d8384: 54ffff01     	b.ne	0x41d8364 <_ChromeMain+0x41d30c8>
 41d8388: f9401bf4     	ldr	x20, [sp, #0x30]
 41d838c: b4000634     	cbz	x20, 0x41d8450 <_ChromeMain+0x41d31b4>
 41d8390: f9401fe8     	ldr	x8, [sp, #0x38]
 41d8394: 8b080d08     	add	x8, x8, x8, lsl #3
 41d8398: d37ced15     	lsl	x21, x8, #4
 41d839c: aa1403e0     	mov	x0, x20
 41d83a0: b4000415     	cbz	x21, 0x41d8420 <_ChromeMain+0x41d3184>
 41d83a4: d2800016     	mov	x22, #0x0               ; =0
 41d83a8: aa1403f7     	mov	x23, x20
 41d83ac: 14000016     	b	0x41d8404 <_ChromeMain+0x41d3168>
 41d83b0: 8b1502e8     	add	x8, x23, x21
 41d83b4: f85e8100     	ldur	x0, [x8, #-0x18]
 41d83b8: f85f8108     	ldur	x8, [x8, #-0x8]
 41d83bc: d37ff901     	lsl	x1, x8, #1
 41d83c0: 96f8c2be     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d83c4: 8b1502f9     	add	x25, x23, x21
 41d83c8: d1008320     	sub	x0, x25, #0x20
 41d83cc: d2800001     	mov	x1, #0x0                ; =0
 41d83d0: 96f93e3a     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d83d4: d101c320     	sub	x0, x25, #0x70
 41d83d8: 96f93e28     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d83dc: 38d87328     	ldursb	w8, [x25, #-0x79]
 41d83e0: 36f800a8     	tbz	w8, #0x1f, 0x41d83f4 <_ChromeMain+0x41d3158>
 41d83e4: f9400300     	ldr	x0, [x24]
 41d83e8: f8580328     	ldur	x8, [x25, #-0x80]
 41d83ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d83f0: 96f8c2b2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d83f4: d10242f7     	sub	x23, x23, #0x90
 41d83f8: 910242d6     	add	x22, x22, #0x90
 41d83fc: eb1602bf     	cmp	x21, x22
 41d8400: 540000e0     	b.eq	0x41d841c <_ChromeMain+0x41d3180>
 41d8404: 8b1502e8     	add	x8, x23, x21
 41d8408: f1024118     	subs	x24, x8, #0x90
 41d840c: 54001900     	b.eq	0x41d872c <_ChromeMain+0x41d3490>
 41d8410: 38dff108     	ldursb	w8, [x8, #-0x1]
 41d8414: 36fffd88     	tbz	w8, #0x1f, 0x41d83c4 <_ChromeMain+0x41d3128>
 41d8418: 17ffffe6     	b	0x41d83b0 <_ChromeMain+0x41d3114>
 41d841c: f9401be0     	ldr	x0, [sp, #0x30]
 41d8420: cb000288     	sub	x8, x20, x0
 41d8424: 9344fd08     	asr	x8, x8, #4
 41d8428: d291c729     	mov	x9, #0x8e39             ; =36409
 41d842c: f2a71c69     	movk	x9, #0x38e3, lsl #16
 41d8430: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 41d8434: f2f1c709     	movk	x9, #0x8e38, lsl #48
 41d8438: 9b097d08     	mul	x8, x8, x9
 41d843c: f9001fe8     	str	x8, [sp, #0x38]
 41d8440: f94023e8     	ldr	x8, [sp, #0x40]
 41d8444: 8b080d08     	add	x8, x8, x8, lsl #3
 41d8448: d37ced01     	lsl	x1, x8, #4
 41d844c: 96f8c29b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d8450: f9402a68     	ldr	x8, [x19, #0x50]
 41d8454: d37df109     	lsl	x9, x8, #3
 41d8458: b4000449     	cbz	x9, 0x41d84e0 <_ChromeMain+0x41d3244>
 41d845c: f9402679     	ldr	x25, [x19, #0x48]
 41d8460: 8b080f3a     	add	x26, x25, x8, lsl #3
 41d8464: 9100c3fb     	add	x27, sp, #0x30
 41d8468: 900547f3     	adrp	x19, 0xead4000 <dyld_stub_binder+0xead4000>
 41d846c: 9126c273     	add	x19, x19, #0x9b0
 41d8470: 5280003c     	mov	w28, #0x1               ; =1
 41d8474: 14000042     	b	0x41d857c <_ChromeMain+0x41d32e0>
 41d8478: f85983a8     	ldur	x8, [x29, #-0x68]
 41d847c: 8b080509     	add	x9, x8, x8, lsl #1
