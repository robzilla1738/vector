
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4607648: d101c3ff     	sub	sp, sp, #0x70
 460764c: a90267fa     	stp	x26, x25, [sp, #0x20]
 4607650: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4607654: a90457f6     	stp	x22, x21, [sp, #0x40]
 4607658: a9054ff4     	stp	x20, x19, [sp, #0x50]
 460765c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4607660: 910183fd     	add	x29, sp, #0x60
 4607664: aa0803f3     	mov	x19, x8
 4607668: 39406028     	ldrb	w8, [x1, #0x18]
 460766c: 360007e8     	tbz	w8, #0x0, 0x4607768 <_ChromeMain+0x46024cc>
 4607670: aa0003f4     	mov	x20, x0
 4607674: aa0103e0     	mov	x0, x1
 4607678: 97019504     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 460767c: 39c05c08     	ldrsb	w8, [x0, #0x17]
 4607680: 37f80208     	tbnz	w8, #0x1f, 0x46076c0 <_ChromeMain+0x4602424>
 4607684: 3dc00000     	ldr	q0, [x0]
 4607688: f9400808     	ldr	x8, [x0, #0x10]
 460768c: f9000be8     	str	x8, [sp, #0x10]
 4607690: 3d8003e0     	str	q0, [sp]
 4607694: 910e0295     	add	x21, x20, #0x380
 4607698: f941c297     	ldr	x23, [x20, #0x380]
 460769c: 39405ff6     	ldrb	w22, [sp, #0x17]
 46076a0: b4000457     	cbz	x23, 0x4607728 <_ChromeMain+0x460248c>
 46076a4: 13001ec8     	sxtb	w8, w22
 46076a8: 7100011f     	cmp	w8, #0x0
 46076ac: 910003e8     	mov	x8, sp
 46076b0: a9402be9     	ldp	x9, x10, [sp]
 46076b4: 9a884134     	csel	x20, x9, x8, mi
 46076b8: 9a964158     	csel	x24, x10, x22, mi
 46076bc: 14000008     	b	0x46076dc <_ChromeMain+0x4602440>
 46076c0: a9400801     	ldp	x1, x2, [x0]
 46076c4: 910003e0     	mov	x0, sp
 46076c8: 96e842d4     	bl	0x18218 <_ChromeMain+0x12f7c>
 46076cc: 17fffff2     	b	0x4607694 <_ChromeMain+0x46023f8>
 46076d0: 54000223     	b.lo	0x4607714 <_ChromeMain+0x4602478>
 46076d4: f94006f7     	ldr	x23, [x23, #0x8]
 46076d8: b4000297     	cbz	x23, 0x4607728 <_ChromeMain+0x460248c>
 46076dc: aa1703e8     	mov	x8, x23
 46076e0: f8420d09     	ldr	x9, [x8, #0x20]!
 46076e4: 39805d0a     	ldrsb	x10, [x8, #0x17]
 46076e8: f100015f     	cmp	x10, #0x0
 46076ec: 9a884121     	csel	x1, x9, x8, mi
 46076f0: f9400508     	ldr	x8, [x8, #0x8]
 46076f4: 7100015f     	cmp	w10, #0x0
 46076f8: 9a8a4119     	csel	x25, x8, x10, mi
 46076fc: eb18033f     	cmp	x25, x24
 4607700: 9a983322     	csel	x2, x25, x24, lo
 4607704: aa1403e0     	mov	x0, x20
 4607708: 94e80856     	bl	0x8009860 <_ChromeMain+0x80045c4>
 460770c: 340000a0     	cbz	w0, 0x4607720 <_ChromeMain+0x4602484>
 4607710: 36fffe20     	tbz	w0, #0x1f, 0x46076d4 <_ChromeMain+0x4602438>
 4607714: f94002f7     	ldr	x23, [x23]
 4607718: b5fffe37     	cbnz	x23, 0x46076dc <_ChromeMain+0x4602440>
 460771c: 14000003     	b	0x4607728 <_ChromeMain+0x460248c>
 4607720: eb19031f     	cmp	x24, x25
 4607724: 54fffd61     	b.ne	0x46076d0 <_ChromeMain+0x4602434>
 4607728: f10002ff     	cmp	x23, #0x0
 460772c: 9a9702b4     	csel	x20, x21, x23, eq
 4607730: 363800b6     	tbz	w22, #0x7, 0x4607744 <_ChromeMain+0x46024a8>
 4607734: f94003e0     	ldr	x0, [sp]
 4607738: f9400be8     	ldr	x8, [sp, #0x10]
 460773c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4607740: 96e805de     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4607744: eb15029f     	cmp	x20, x21
 4607748: 54000100     	b.eq	0x4607768 <_ChromeMain+0x46024cc>
 460774c: 3900027f     	strb	wzr, [x19]
 4607750: 52801fe8     	mov	w8, #0xff               ; =255
 4607754: 39008268     	strb	w8, [x19, #0x20]
 4607758: 9100e281     	add	x1, x20, #0x38
 460775c: aa1303e0     	mov	x0, x19
 4607760: 9702dd8b     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 4607764: 14000008     	b	0x4607784 <_ChromeMain+0x46024e8>
 4607768: f900027f     	str	xzr, [x19]
 460776c: 2f06e400     	movi	d0, #0xffff000000000000
 4607770: fd000660     	str	d0, [x19, #0x8]
 4607774: 52800028     	mov	w8, #0x1                ; =1
 4607778: 39004268     	strb	w8, [x19, #0x10]
 460777c: f9000e7f     	str	xzr, [x19, #0x18]
 4607780: 3900827f     	strb	wzr, [x19, #0x20]
 4607784: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4607788: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 460778c: a94457f6     	ldp	x22, x21, [sp, #0x40]
 4607790: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4607794: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4607798: 9101c3ff     	add	sp, sp, #0x70
 460779c: d65f03c0     	ret
