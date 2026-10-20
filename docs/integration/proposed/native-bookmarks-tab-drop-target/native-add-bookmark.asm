
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4613354: d101c3ff     	sub	sp, sp, #0x70
 4613358: a90267fa     	stp	x26, x25, [sp, #0x20]
 461335c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4613360: a90457f6     	stp	x22, x21, [sp, #0x40]
 4613364: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4613368: a9067bfd     	stp	x29, x30, [sp, #0x60]
 461336c: 910183fd     	add	x29, sp, #0x60
 4613370: f9429808     	ldr	x8, [x0, #0x530]
 4613374: b40006a8     	cbz	x8, 0x4613448 <_ChromeMain+0x460e1ac>
 4613378: d2800019     	mov	x25, #0x0               ; =0
 461337c: 39408508     	ldrb	w8, [x8, #0x21]
 4613380: 34000668     	cbz	w8, 0x461344c <_ChromeMain+0x460e1b0>
 4613384: aa0103f4     	mov	x20, x1
 4613388: 39406028     	ldrb	w8, [x1, #0x18]
 461338c: 36000608     	tbz	w8, #0x0, 0x461344c <_ChromeMain+0x460e1b0>
 4613390: aa0503f6     	mov	x22, x5
 4613394: aa0403f8     	mov	x24, x4
 4613398: aa0303f7     	mov	x23, x3
 461339c: aa0203f5     	mov	x21, x2
 46133a0: aa0003f3     	mov	x19, x0
 46133a4: b4000643     	cbz	x3, 0x461346c <_ChromeMain+0x460e1d0>
 46133a8: b940fae8     	ldr	w8, [x23, #0xf8]
 46133ac: 34000608     	cbz	w8, 0x461346c <_ChromeMain+0x460e1d0>
 46133b0: 52800039     	mov	w25, #0x1               ; =1
 46133b4: 39805ea8     	ldrsb	x8, [x21, #0x17]
 46133b8: b7f806a8     	tbnz	x8, #0x3f, 0x461348c <_ChromeMain+0x460e1f0>
 46133bc: b40006c8     	cbz	x8, 0x4613494 <_ChromeMain+0x460e1f8>
 46133c0: f94026e8     	ldr	x8, [x23, #0x48]
 46133c4: eb18011f     	cmp	x8, x24
 46133c8: 9a983109     	csel	x9, x8, x24, lo
 46133cc: 6a16033f     	tst	w25, w22
 46133d0: 9a881122     	csel	x2, x9, x8, ne
 46133d4: f9429a60     	ldr	x0, [x19, #0x530]
 46133d8: aa1703e1     	mov	x1, x23
 46133dc: aa1503e3     	mov	x3, x21
 46133e0: aa1403e4     	mov	x4, x20
 46133e4: d2800005     	mov	x5, #0x0                ; =0
 46133e8: 957d07ac     	bl	0xa555298 <_ChromeMain+0xa54fffc>
 46133ec: aa0003f9     	mov	x25, x0
 46133f0: b40002e0     	cbz	x0, 0x461344c <_ChromeMain+0x460e1b0>
 46133f4: aa1303e0     	mov	x0, x19
 46133f8: aa1903e1     	mov	x1, x25
 46133fc: 940022b4     	bl	0x461becc <_ChromeMain+0x4616c30>
 4613400: f9436274     	ldr	x20, [x19, #0x6c0]
 4613404: b4000254     	cbz	x20, 0x461344c <_ChromeMain+0x460e1b0>
 4613408: 52800028     	mov	w8, #0x1                ; =1
 461340c: b8280288     	ldadd	w8, w8, [x20]
 4613410: 7100011f     	cmp	w8, #0x0
 4613414: 540009ad     	b.le	0x4613548 <_ChromeMain+0x460e2ac>
 4613418: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461341c: 6b09011f     	cmp	w8, w9
 4613420: 540009a0     	b.eq	0x4613554 <_ChromeMain+0x460e2b8>
 4613424: f9436268     	ldr	x8, [x19, #0x6c0]
 4613428: f9400508     	ldr	x8, [x8, #0x8]
 461342c: aa1403e0     	mov	x0, x20
 4613430: d63f0100     	blr	x8
 4613434: 12800008     	mov	w8, #-0x1               ; =-1
 4613438: b8e80288     	ldaddal	w8, w8, [x20]
 461343c: 7100051f     	cmp	w8, #0x1
 4613440: 54000061     	b.ne	0x461344c <_ChromeMain+0x460e1b0>
 4613444: 1400003d     	b	0x4613538 <_ChromeMain+0x460e29c>
 4613448: d2800019     	mov	x25, #0x0               ; =0
 461344c: aa1903e0     	mov	x0, x25
 4613450: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4613454: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4613458: a94457f6     	ldp	x22, x21, [sp, #0x40]
 461345c: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4613460: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4613464: 9101c3ff     	add	sp, sp, #0x70
 4613468: d65f03c0     	ret
 461346c: aa1303e0     	mov	x0, x19
 4613470: 97fffe5f     	bl	0x4612dec <_ChromeMain+0x460db50>
 4613474: b4fffea0     	cbz	x0, 0x4613448 <_ChromeMain+0x460e1ac>
 4613478: aa0003f7     	mov	x23, x0
 461347c: b940f808     	ldr	w8, [x0, #0xf8]
 4613480: 34fffe48     	cbz	w8, 0x4613448 <_ChromeMain+0x460e1ac>
 4613484: 52800019     	mov	w25, #0x0               ; =0
 4613488: 17ffffcb     	b	0x46133b4 <_ChromeMain+0x460e118>
 461348c: f94006a8     	ldr	x8, [x21, #0x8]
 4613490: b5fff988     	cbnz	x8, 0x46133c0 <_ChromeMain+0x460e124>
 4613494: b9403e88     	ldr	w8, [x20, #0x3c]
 4613498: 7100051f     	cmp	w8, #0x1
 461349c: 5400014b     	b.lt	0x46134c4 <_ChromeMain+0x460e228>
 46134a0: 39405e8a     	ldrb	w10, [x20, #0x17]
 46134a4: 13001d49     	sxtb	w9, w10
 46134a8: f940068b     	ldr	x11, [x20, #0x8]
 46134ac: 7100013f     	cmp	w9, #0x0
 46134b0: 9a8a416b     	csel	x11, x11, x10, mi
 46134b4: b9803a8a     	ldrsw	x10, [x20, #0x38]
 46134b8: eb0a016b     	subs	x11, x11, x10
 46134bc: 54000523     	b.lo	0x4613560 <_ChromeMain+0x460e2c4>
 46134c0: 54000241     	b.ne	0x4613508 <_ChromeMain+0x460e26c>
 46134c4: aa1403e0     	mov	x0, x20
 46134c8: 97016570     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 46134cc: 39805c08     	ldrsb	x8, [x0, #0x17]
 46134d0: a9402809     	ldp	x9, x10, [x0]
 46134d4: f100011f     	cmp	x8, #0x0
 46134d8: 9a804120     	csel	x0, x9, x0, mi
 46134dc: 7100011f     	cmp	w8, #0x0
 46134e0: 9a884141     	csel	x1, x10, x8, mi
 46134e4: 910023e8     	add	x8, sp, #0x8
 46134e8: 970b3b8a     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 46134ec: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 46134f0: 37f801a8     	tbnz	w8, #0x1f, 0x4613524 <_ChromeMain+0x460e288>
 46134f4: 3cc083e0     	ldur	q0, [sp, #0x8]
 46134f8: 3d8002a0     	str	q0, [x21]
 46134fc: f9400fe8     	ldr	x8, [sp, #0x18]
 4613500: f9000aa8     	str	x8, [x21, #0x10]
 4613504: 17ffffaf     	b	0x46133c0 <_ChromeMain+0x460e124>
 4613508: eb08017f     	cmp	x11, x8
 461350c: 9a883161     	csel	x1, x11, x8, lo
 4613510: f9400288     	ldr	x8, [x20]
 4613514: 7100013f     	cmp	w9, #0x0
 4613518: 9a944108     	csel	x8, x8, x20, mi
 461351c: 8b0a0100     	add	x0, x8, x10
 4613520: 17fffff1     	b	0x46134e4 <_ChromeMain+0x460e248>
 4613524: f94002a0     	ldr	x0, [x21]
 4613528: f9400aa8     	ldr	x8, [x21, #0x10]
 461352c: d37ff901     	lsl	x1, x8, #1
 4613530: 96e7d662     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613534: 17fffff0     	b	0x46134f4 <_ChromeMain+0x460e258>
 4613538: f9400a88     	ldr	x8, [x20, #0x10]
 461353c: aa1403e0     	mov	x0, x20
 4613540: d63f0100     	blr	x8
 4613544: 17ffffc2     	b	0x461344c <_ChromeMain+0x460e1b0>
 4613548: d4200000     	brk	#0
 461354c: d4400000     	hlt	#0
 4613550: d4200020     	brk	#0x1
 4613554: d4200000     	brk	#0
 4613558: d4400000     	hlt	#0
 461355c: d4200020     	brk	#0x1
 4613560: b0048e80     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4613564: 91376000     	add	x0, x0, #0xdd8
 4613568: 9417b35b     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
