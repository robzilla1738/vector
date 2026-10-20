
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4381104: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4381108: a9017bfd     	stp	x29, x30, [sp, #0x10]
 438110c: 910043fd     	add	x29, sp, #0x10
 4381110: aa0003f3     	mov	x19, x0
 4381114: d0054c68     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4381118: b98d6908     	ldrsw	x8, [x8, #0xd68]
 438111c: 38286802     	strb	w2, [x0, x8]
 4381120: 52800022     	mov	w2, #0x1                ; =1
 4381124: 95fffbe4     	bl	0xc3800b4 <_ChromeMain+0xc37ae18>
 4381128: aa1303e0     	mov	x0, x19
 438112c: 95fe2226     	bl	0xc3099c4 <_ChromeMain+0xc304728>
 4381130: aa1303e0     	mov	x0, x19
 4381134: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4381138: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 438113c: 15fffbe1     	b	0xc3800c0 <_ChromeMain+0xc37ae24>
 4381140: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4381144: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4381148: 910043fd     	add	x29, sp, #0x10
 438114c: aa0003f3     	mov	x19, x0
 4381150: d0054c68     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4381154: b98d6d08     	ldrsw	x8, [x8, #0xd6c]
 4381158: 38286802     	strb	w2, [x0, x8]
 438115c: 52800022     	mov	w2, #0x1                ; =1
 4381160: 95fffbd5     	bl	0xc3800b4 <_ChromeMain+0xc37ae18>
 4381164: aa1303e0     	mov	x0, x19
 4381168: 95fe2217     	bl	0xc3099c4 <_ChromeMain+0xc304728>
 438116c: aa1303e0     	mov	x0, x19
 4381170: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4381174: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4381178: 15fffbd2     	b	0xc3800c0 <_ChromeMain+0xc37ae24>
 438117c: d0054c68     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4381180: b98d6508     	ldrsw	x8, [x8, #0xd64]
 4381184: 38686808     	ldrb	w8, [x0, x8]
 4381188: 37000128     	tbnz	w8, #0x0, 0x43811ac <_ChromeMain+0x437bf10>
 438118c: d0054c68     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4381190: b98d6908     	ldrsw	x8, [x8, #0xd68]
 4381194: 38686808     	ldrb	w8, [x0, x8]
 4381198: 370000a8     	tbnz	w8, #0x0, 0x43811ac <_ChromeMain+0x437bf10>
 438119c: d0054c68     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 43811a0: b98d6d08     	ldrsw	x8, [x8, #0xd6c]
 43811a4: 38686808     	ldrb	w8, [x0, x8]
 43811a8: 34000048     	cbz	w8, 0x43811b0 <_ChromeMain+0x437bf14>
 43811ac: 15fffbc5     	b	0xc3800c0 <_ChromeMain+0xc37ae24>
 43811b0: d65f03c0     	ret
 43811b4: d100c3ff     	sub	sp, sp, #0x30
 43811b8: a9014ff4     	stp	x20, x19, [sp, #0x10]
 43811bc: a9027bfd     	stp	x29, x30, [sp, #0x20]
 43811c0: 910083fd     	add	x29, sp, #0x20
 43811c4: aa0003f3     	mov	x19, x0
 43811c8: f0054c28     	adrp	x8, 0xed08000 <dyld_stub_binder+0xed08000>
 43811cc: f9408908     	ldr	x8, [x8, #0x110]
 43811d0: a90023e0     	stp	x0, x8, [sp]
 43811d4: f0054c28     	adrp	x8, 0xed08000 <dyld_stub_binder+0xed08000>
 43811d8: f9451901     	ldr	x1, [x8, #0xa30]
 43811dc: 910003e0     	mov	x0, sp
 43811e0: 955970a4     	bl	0x99dd470 <_ChromeMain+0x99d81d4>
 43811e4: aa1303e0     	mov	x0, x19
 43811e8: 95fffbb6     	bl	0xc3800c0 <_ChromeMain+0xc37ae24>
 43811ec: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 43811f0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 43811f4: 9100c3ff     	add	sp, sp, #0x30
 43811f8: d65f03c0     	ret
 43811fc: 6db82beb     	stp	d11, d10, [sp, #-0x80]!
 4381200: 6d0123e9     	stp	d9, d8, [sp, #0x10]
 4381204: a9026ffc     	stp	x28, x27, [sp, #0x20]
 4381208: a90367fa     	stp	x26, x25, [sp, #0x30]
 438120c: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4381210: a90557f6     	stp	x22, x21, [sp, #0x50]
 4381214: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4381218: a9077bfd     	stp	x29, x30, [sp, #0x70]
 438121c: 9101c3fd     	add	x29, sp, #0x70
 4381220: aa0003f3     	mov	x19, x0
 4381224: 9559bf99     	bl	0x99f1088 <_ChromeMain+0x99ebdec>
 4381228: 94f20944     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 438122c: aa0003f4     	mov	x20, x0
 4381230: d2800019     	mov	x25, #0x0               ; =0
 4381234: f0054c28     	adrp	x8, 0xed08000 <dyld_stub_binder+0xed08000>
 4381238: f9451d15     	ldr	x21, [x8, #0xa38]
 438123c: d503201f     	nop
 4381240: f9451516     	ldr	x22, [x8, #0xa28]
 4381244: b0054b7a     	adrp	x26, 0xecee000 <dyld_stub_binder+0xecee000>
 4381248: d0054c7b     	adrp	x27, 0xed0f000 <dyld_stub_binder+0xed0f000>
 438124c: 1e6e1009     	fmov	d9, #1.00000000
 4381250: 6f00e40a     	movi.2d	v10, #0000000000000000
 4381254: f004813c     	adrp	x28, 0xd3a8000 <dyld_stub_binder+0xd3a8000>
 4381258: 9115039c     	add	x28, x28, #0x540
 438125c: 1400002d     	b	0x4381310 <_ChromeMain+0x437c074>
 4381260: 1e6e1008     	fmov	d8, #1.00000000
 4381264: 52800038     	mov	w24, #0x1               ; =1
 4381268: 14000003     	b	0x4381274 <_ChromeMain+0x437bfd8>
 438126c: 52800018     	mov	w24, #0x0               ; =0
 4381270: 6f00e408     	movi.2d	v8, #0000000000000000
 4381274: aa1703e0     	mov	x0, x23
 4381278: 4ea81d00     	mov.16b	v0, v8
 438127c: 95fffcf4     	bl	0xc38064c <_ChromeMain+0xc37b3b0>
 4381280: 52000302     	eor	w2, w24, #0x1
 4381284: aa1703e0     	mov	x0, x23
 4381288: 951473a0     	bl	0x889e108 <_ChromeMain+0x8898e6c>
 438128c: aa1703e0     	mov	x0, x23
 4381290: aa1803e2     	mov	x2, x24
 4381294: 9554776e     	bl	0x989f04c <_ChromeMain+0x9899db0>
 4381298: aa1703e0     	mov	x0, x23
 438129c: aa1503e2     	mov	x2, x21
 43812a0: 95911919     	bl	0xa7c7704 <_ChromeMain+0xa7c2468>
 43812a4: 340002c0     	cbz	w0, 0x43812fc <_ChromeMain+0x437c060>
 43812a8: aa1703e0     	mov	x0, x23
 43812ac: 4ea81d00     	mov.16b	v0, v8
 43812b0: 95fffcea     	bl	0xc380658 <_ChromeMain+0xc37b3bc>
 43812b4: 52800020     	mov	w0, #0x1                ; =1
 43812b8: 52800361     	mov	w1, #0x1b               ; =27
 43812bc: 52800002     	mov	w2, #0x0                ; =0
 43812c0: 52800003     	mov	w3, #0x0                ; =0
 43812c4: 9720b22a     	bl	0xbadb6c <_ChromeMain+0xba88d0>
 43812c8: 340001a0     	cbz	w0, 0x43812fc <_ChromeMain+0x437c060>
 43812cc: aa1703e0     	mov	x0, x23
 43812d0: 95fffce5     	bl	0xc380664 <_ChromeMain+0xc37b3c8>
 43812d4: 94f20919     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 43812d8: aa0003f8     	mov	x24, x0
 43812dc: aa1603e2     	mov	x2, x22
 43812e0: 95911909     	bl	0xa7c7704 <_ChromeMain+0xa7c2468>
 43812e4: 34000080     	cbz	w0, 0x43812f4 <_ChromeMain+0x437c058>
 43812e8: aa1803e0     	mov	x0, x24
 43812ec: 4ea81d00     	mov.16b	v0, v8
 43812f0: 95fffcfe     	bl	0xc3806e8 <_ChromeMain+0xc37b44c>
 43812f4: aa1803e0     	mov	x0, x24
 43812f8: 94f20919     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 43812fc: aa1703e0     	mov	x0, x23
 4381300: 94f20917     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4381304: 91002339     	add	x25, x25, #0x8
 4381308: f100633f     	cmp	x25, #0x18
 438130c: 54000320     	b.eq	0x4381370 <_ChromeMain+0x437c0d4>
 4381310: f8796b98     	ldr	x24, [x28, x25]
 4381314: aa1403e0     	mov	x0, x20
 4381318: aa1803e2     	mov	x2, x24
 438131c: 95547749     	bl	0x989f040 <_ChromeMain+0x9899da4>
 4381320: 94f20906     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4381324: b40003a0     	cbz	x0, 0x4381398 <_ChromeMain+0x437c0fc>
 4381328: aa0003f7     	mov	x23, x0
 438132c: f9402b40     	ldr	x0, [x26, #0x50]
 4381330: 950dc523     	bl	0x86f27bc <_ChromeMain+0x86ed520>
 4381334: aa0003e2     	mov	x2, x0
 4381338: aa1703e0     	mov	x0, x23
 438133c: 950dc523     	bl	0x86f27c8 <_ChromeMain+0x86ed52c>
 4381340: 36000320     	tbz	w0, #0x0, 0x43813a4 <_ChromeMain+0x437c108>
 4381344: b98d6f68     	ldrsw	x8, [x27, #0xd6c]
 4381348: 38686a68     	ldrb	w8, [x19, x8]
 438134c: 3707f908     	tbnz	w8, #0x0, 0x438126c <_ChromeMain+0x437bfd0>
 4381350: b4fff898     	cbz	x24, 0x4381260 <_ChromeMain+0x437bfc4>
 4381354: d0054c68     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4381358: b98d6908     	ldrsw	x8, [x8, #0xd68]
 438135c: 38686a68     	ldrb	w8, [x19, x8]
 4381360: 52000118     	eor	w24, w8, #0x1
 4381364: 7100011f     	cmp	w8, #0x0
 4381368: 1e691d48     	fcsel	d8, d10, d9, ne
 438136c: 17ffffc2     	b	0x4381274 <_ChromeMain+0x437bfd8>
 4381370: aa1403e0     	mov	x0, x20
 4381374: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4381378: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 438137c: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4381380: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4381384: a94367fa     	ldp	x26, x25, [sp, #0x30]
 4381388: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 438138c: 6d4123e9     	ldp	d9, d8, [sp, #0x10]
 4381390: 6cc82beb     	ldp	d11, d10, [sp], #0x80
 4381394: 14f208f2     	b	0x800375c <_ChromeMain+0x7ffe4c0>
 4381398: d4200000     	brk	#0
 438139c: d4400000     	hlt	#0
 43813a0: d4200020     	brk	#0x1
 43813a4: d4200000     	brk	#0
 43813a8: d4400000     	hlt	#0
 43813ac: d4200020     	brk	#0x1
