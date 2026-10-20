
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 6ca04c8: d10643ff     	sub	sp, sp, #0x190
 6ca04cc: a9156ffc     	stp	x28, x27, [sp, #0x150]
 6ca04d0: a91657f6     	stp	x22, x21, [sp, #0x160]
 6ca04d4: a9174ff4     	stp	x20, x19, [sp, #0x170]
 6ca04d8: a9187bfd     	stp	x29, x30, [sp, #0x180]
 6ca04dc: 910603fd     	add	x29, sp, #0x180
 6ca04e0: aa0303f4     	mov	x20, x3
 6ca04e4: aa0203f5     	mov	x21, x2
 6ca04e8: aa0103f3     	mov	x19, x1
 6ca04ec: aa0003f6     	mov	x22, x0
 6ca04f0: 52800000     	mov	w0, #0x0                ; =0
 6ca04f4: 9680310b     	bl	0xcac920 <_ChromeMain+0xca7684>
 6ca04f8: 360008a0     	tbz	w0, #0x0, 0x6ca060c <_ChromeMain+0x6c9b370>
 6ca04fc: f94006c0     	ldr	x0, [x22, #0x8]
 6ca0500: 96a804db     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 6ca0504: aa1303e1     	mov	x1, x19
 6ca0508: 528003e2     	mov	w2, #0x1f               ; =31
 6ca050c: 96d09544     	bl	0x20c5a1c <_ChromeMain+0x20c0780>
 6ca0510: b40004c0     	cbz	x0, 0x6ca05a8 <_ChromeMain+0x6c9b30c>
 6ca0514: 90041348     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 6ca0518: b940b108     	ldr	w8, [x8, #0xb0]
 6ca051c: 7100091f     	cmp	w8, #0x2
 6ca0520: 5400034c     	b.gt	0x6ca0588 <_ChromeMain+0x6c9b2ec>
 6ca0524: f0036a41     	adrp	x1, 0xd9eb000 <dyld_stub_binder+0xd9eb000>
 6ca0528: 910c1021     	add	x1, x1, #0x304
 6ca052c: 910083f4     	add	x20, sp, #0x20
 6ca0530: 910083e0     	add	x0, sp, #0x20
 6ca0534: 528011a2     	mov	w2, #0x8d               ; =141
 6ca0538: 52800043     	mov	w3, #0x2                ; =2
 6ca053c: 9665a304     	bl	0x60914c <_ChromeMain+0x603eb0>
 6ca0540: f0036a41     	adrp	x1, 0xd9eb000 <dyld_stub_binder+0xd9eb000>
 6ca0544: 910ce821     	add	x1, x1, #0x33a
 6ca0548: 91004280     	add	x0, x20, #0x10
 6ca054c: 52800402     	mov	w2, #0x20               ; =32
 6ca0550: 964e13db     	bl	0x254bc <_ChromeMain+0x20220>
 6ca0554: 39805e68     	ldrsb	x8, [x19, #0x17]
 6ca0558: a9402a69     	ldp	x9, x10, [x19]
 6ca055c: f100011f     	cmp	x8, #0x0
 6ca0560: 9a934121     	csel	x1, x9, x19, mi
 6ca0564: 7100011f     	cmp	w8, #0x0
 6ca0568: 9a884142     	csel	x2, x10, x8, mi
 6ca056c: 964e13d4     	bl	0x254bc <_ChromeMain+0x20220>
 6ca0570: f0036a41     	adrp	x1, 0xd9eb000 <dyld_stub_binder+0xd9eb000>
 6ca0574: 910d6c21     	add	x1, x1, #0x35b
 6ca0578: 528002a2     	mov	w2, #0x15               ; =21
 6ca057c: 964e13d0     	bl	0x254bc <_ChromeMain+0x20220>
 6ca0580: 910083e0     	add	x0, sp, #0x20
 6ca0584: 9665a2bf     	bl	0x609080 <_ChromeMain+0x603de4>
 6ca0588: 52800013     	mov	w19, #0x0               ; =0
 6ca058c: aa1303e0     	mov	x0, x19
 6ca0590: a9587bfd     	ldp	x29, x30, [sp, #0x180]
 6ca0594: a9574ff4     	ldp	x20, x19, [sp, #0x170]
 6ca0598: a95657f6     	ldp	x22, x21, [sp, #0x160]
 6ca059c: a9556ffc     	ldp	x28, x27, [sp, #0x150]
 6ca05a0: 910643ff     	add	sp, sp, #0x190
 6ca05a4: d65f03c0     	ret
 6ca05a8: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 6ca05ac: f9001bff     	str	xzr, [sp, #0x30]
 6ca05b0: 910023e0     	add	x0, sp, #0x8
 6ca05b4: 96a08d93     	bl	0x14c3c00 <_ChromeMain+0x14be964>
 6ca05b8: 79000bff     	strh	wzr, [sp, #0x4]
 6ca05bc: b90003ff     	str	wzr, [sp]
 6ca05c0: 910083e2     	add	x2, sp, #0x20
 6ca05c4: 910023e4     	add	x4, sp, #0x8
 6ca05c8: aa1603e0     	mov	x0, x22
 6ca05cc: aa1303e1     	mov	x1, x19
 6ca05d0: aa1503e3     	mov	x3, x21
 6ca05d4: aa1403e5     	mov	x5, x20
 6ca05d8: 52800006     	mov	w6, #0x0                ; =0
 6ca05dc: 52800027     	mov	w7, #0x1                ; =1
 6ca05e0: 97fffef6     	bl	0x6ca01b8 <_ChromeMain+0x6c9af1c>
 6ca05e4: aa0003f3     	mov	x19, x0
 6ca05e8: 910023e0     	add	x0, sp, #0x8
 6ca05ec: 96f7af37     	bl	0x2a8c2c8 <_ChromeMain+0x2a8702c>
 6ca05f0: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 6ca05f4: 36fffcc8     	tbz	w8, #0x1f, 0x6ca058c <_ChromeMain+0x6c9b2f0>
 6ca05f8: f94013e0     	ldr	x0, [sp, #0x20]
 6ca05fc: f9401be8     	ldr	x8, [sp, #0x30]
 6ca0600: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 6ca0604: 964da22d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 6ca0608: 17ffffe1     	b	0x6ca058c <_ChromeMain+0x6c9b2f0>
 6ca060c: d4200000     	brk	#0
