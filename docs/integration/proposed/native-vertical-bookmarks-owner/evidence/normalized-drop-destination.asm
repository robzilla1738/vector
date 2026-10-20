
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461b6f4: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 461b6f8: a9014ff4     	stp	x20, x19, [sp, #0x10]
 461b6fc: a9027bfd     	stp	x29, x30, [sp, #0x20]
 461b700: 910083fd     	add	x29, sp, #0x20
 461b704: f9437c08     	ldr	x8, [x0, #0x6f8]
 461b708: b40005a8     	cbz	x8, 0x461b7bc <_ChromeMain+0x4616520>
 461b70c: f9401d0a     	ldr	x10, [x8, #0x38]
 461b710: b400056a     	cbz	x10, 0x461b7bc <_ChromeMain+0x4616520>
 461b714: aa0203f4     	mov	x20, x2
 461b718: aa0103f5     	mov	x21, x1
 461b71c: aa0003f3     	mov	x19, x0
 461b720: eb01015f     	cmp	x10, x1
 461b724: 54000261     	b.ne	0x461b770 <_ChromeMain+0x46164d4>
 461b728: a9442949     	ldp	x9, x10, [x10, #0x40]
 461b72c: d37df14c     	lsl	x12, x10, #3
 461b730: 8b0a0d2a     	add	x10, x9, x10, lsl #3
 461b734: aa0903eb     	mov	x11, x9
 461b738: b400010c     	cbz	x12, 0x461b758 <_ChromeMain+0x46164bc>
 461b73c: f940016d     	ldr	x13, [x11]
 461b740: eb0801bf     	cmp	x13, x8
 461b744: 540000a0     	b.eq	0x461b758 <_ChromeMain+0x46164bc>
 461b748: 9100216b     	add	x11, x11, #0x8
 461b74c: f100218c     	subs	x12, x12, #0x8
 461b750: 54ffff61     	b.ne	0x461b73c <_ChromeMain+0x46164a0>
 461b754: aa0a03eb     	mov	x11, x10
 461b758: cb090168     	sub	x8, x11, x9
 461b75c: eb0a017f     	cmp	x11, x10
 461b760: 9343fd08     	asr	x8, x8, #3
 461b764: fa481280     	ccmp	x20, x8, #0x0, ne
 461b768: 1a9f97e8     	cset	w8, hi
 461b76c: cb080294     	sub	x20, x20, x8
 461b770: 395e8268     	ldrb	w8, [x19, #0x7a0]
 461b774: 37000348     	tbnz	w8, #0x0, 0x461b7dc <_ChromeMain+0x4616540>
 461b778: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 461b77c: f0052cb6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461b780: f94046c9     	ldr	x9, [x22, #0x88]
 461b784: eb09011f     	cmp	x8, x9
 461b788: 54000061     	b.ne	0x461b794 <_ChromeMain+0x46164f8>
 461b78c: aa1503e0     	mov	x0, x21
 461b790: 96e7e2db     	bl	0x142fc <_ChromeMain+0xf060>
 461b794: f943ca60     	ldr	x0, [x19, #0x790]
 461b798: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461b79c: f94046c9     	ldr	x9, [x22, #0x88]
 461b7a0: eb09011f     	cmp	x8, x9
 461b7a4: 54000041     	b.ne	0x461b7ac <_ChromeMain+0x4616510>
 461b7a8: 96e81ca5     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461b7ac: f903ca75     	str	x21, [x19, #0x790]
 461b7b0: f903ce74     	str	x20, [x19, #0x798]
 461b7b4: 52800028     	mov	w8, #0x1                ; =1
 461b7b8: 391e8268     	strb	w8, [x19, #0x7a0]
 461b7bc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 461b7c0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 461b7c4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 461b7c8: d65f03c0     	ret
 461b7cc: f943ce68     	ldr	x8, [x19, #0x798]
 461b7d0: eb14011f     	cmp	x8, x20
 461b7d4: 54ffff40     	b.eq	0x461b7bc <_ChromeMain+0x4616520>
 461b7d8: 14000004     	b	0x461b7e8 <_ChromeMain+0x461654c>
 461b7dc: f943ca60     	ldr	x0, [x19, #0x790]
 461b7e0: eb15001f     	cmp	x0, x21
 461b7e4: 54ffff40     	b.eq	0x461b7cc <_ChromeMain+0x4616530>
 461b7e8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 461b7ec: f0052cb6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461b7f0: f94046c9     	ldr	x9, [x22, #0x88]
 461b7f4: eb09011f     	cmp	x8, x9
 461b7f8: 54000081     	b.ne	0x461b808 <_ChromeMain+0x461656c>
 461b7fc: aa1503e0     	mov	x0, x21
 461b800: 96e7e2bf     	bl	0x142fc <_ChromeMain+0xf060>
 461b804: f943ca60     	ldr	x0, [x19, #0x790]
 461b808: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461b80c: f94046c9     	ldr	x9, [x22, #0x88]
 461b810: eb09011f     	cmp	x8, x9
 461b814: 54000041     	b.ne	0x461b81c <_ChromeMain+0x4616580>
 461b818: 96e81c89     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461b81c: f903ca75     	str	x21, [x19, #0x790]
 461b820: f903ce74     	str	x20, [x19, #0x798]
 461b824: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 461b828: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 461b82c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 461b830: 17ec6a7a     	b	0x4136218 <_ChromeMain+0x4130f7c>
