
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 427b13c: d10103ff     	sub	sp, sp, #0x40
 427b140: a9024ff4     	stp	x20, x19, [sp, #0x20]
 427b144: a9037bfd     	stp	x29, x30, [sp, #0x30]
 427b148: 9100c3fd     	add	x29, sp, #0x30
 427b14c: aa0003f3     	mov	x19, x0
 427b150: 52800028     	mov	w8, #0x1                ; =1
 427b154: 39038008     	strb	w8, [x0, #0xe0]
 427b158: f9406c00     	ldr	x0, [x0, #0xd8]
 427b15c: b40000a0     	cbz	x0, 0x427b170 <_ChromeMain+0x4275ed4>
 427b160: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 427b164: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 427b168: 910103ff     	add	sp, sp, #0x40
 427b16c: 17ffa194     	b	0x42637bc <_ChromeMain+0x425e520>
 427b170: 52800128     	mov	w8, #0x9                ; =9
 427b174: 39007fe8     	strb	w8, [sp, #0x1f]
 427b178: 910023e9     	add	x9, sp, #0x8
 427b17c: 9100252a     	add	x10, x9, #0x9
 427b180: f0046468     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427b184: 91104108     	add	x8, x8, #0x410
 427b188: eb08015f     	cmp	x10, x8
 427b18c: fa488122     	ccmp	x9, x8, #0x2, hi
 427b190: 540007e9     	b.ls	0x427b28c <_ChromeMain+0x4275ff0>
 427b194: 52800c89     	mov	w9, #0x64               ; =100
 427b198: 790023e9     	strh	w9, [sp, #0x10]
 427b19c: f9400108     	ldr	x8, [x8]
 427b1a0: f90007e8     	str	x8, [sp, #0x8]
 427b1a4: 91016274     	add	x20, x19, #0x58
 427b1a8: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427b1ac: 37f805c8     	tbnz	w8, #0x1f, 0x427b264 <_ChromeMain+0x4275fc8>
 427b1b0: 3cc083e0     	ldur	q0, [sp, #0x8]
 427b1b4: 3d800280     	str	q0, [x20]
 427b1b8: f9400fe8     	ldr	x8, [sp, #0x18]
 427b1bc: f9000a88     	str	x8, [x20, #0x10]
 427b1c0: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 427b1c4: 37f805a8     	tbnz	w8, #0x1f, 0x427b278 <_ChromeMain+0x4275fdc>
 427b1c8: a9097e7f     	stp	xzr, xzr, [x19, #0x90]
 427b1cc: f80a027f     	stur	xzr, [x19, #0xa0]
 427b1d0: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 427b1d4: 37f803c8     	tbnz	w8, #0x1f, 0x427b24c <_ChromeMain+0x4275fb0>
 427b1d8: 3901e27f     	strb	wzr, [x19, #0x78]
 427b1dc: 39023e7f     	strb	wzr, [x19, #0x8f]
 427b1e0: 3941be69     	ldrb	w9, [x19, #0x6f]
 427b1e4: 13001d28     	sxtb	w8, w9
 427b1e8: f940326a     	ldr	x10, [x19, #0x60]
 427b1ec: 7100011f     	cmp	w8, #0x0
 427b1f0: 9a894149     	csel	x9, x10, x9, mi
 427b1f4: f100253f     	cmp	x9, #0x9
 427b1f8: 540001a1     	b.ne	0x427b22c <_ChromeMain+0x4275f90>
 427b1fc: f9400289     	ldr	x9, [x20]
 427b200: 7100011f     	cmp	w8, #0x0
 427b204: 9a944128     	csel	x8, x9, x20, mi
 427b208: f9400109     	ldr	x9, [x8]
 427b20c: 39402108     	ldrb	w8, [x8, #0x8]
 427b210: 7101911f     	cmp	w8, #0x64
 427b214: d28eae68     	mov	x8, #0x7573             ; =30067
 427b218: f2ac6c68     	movk	x8, #0x6363, lsl #16
 427b21c: f2ccaca8     	movk	x8, #0x6565, lsl #32
 427b220: f2ecac88     	movk	x8, #0x6564, lsl #48
 427b224: fa480120     	ccmp	x9, x8, #0x0, eq
 427b228: 540001a0     	b.eq	0x427b25c <_ChromeMain+0x4275fc0>
 427b22c: fd403a60     	ldr	d0, [x19, #0x70]
 427b230: fd003a60     	str	d0, [x19, #0x70]
 427b234: aa1303e0     	mov	x0, x19
 427b238: 97fff9a3     	bl	0x42798c4 <_ChromeMain+0x4274628>
 427b23c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 427b240: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 427b244: 910103ff     	add	sp, sp, #0x40
 427b248: d65f03c0     	ret
 427b24c: f9403e68     	ldr	x8, [x19, #0x78]
 427b250: 3900011f     	strb	wzr, [x8]
 427b254: f900427f     	str	xzr, [x19, #0x80]
 427b258: 17ffffe2     	b	0x427b1e0 <_ChromeMain+0x4275f44>
 427b25c: 1e6e1000     	fmov	d0, #1.00000000
 427b260: 17fffff4     	b	0x427b230 <_ChromeMain+0x4275f94>
 427b264: f9402e60     	ldr	x0, [x19, #0x58]
 427b268: f9403668     	ldr	x8, [x19, #0x68]
 427b26c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427b270: 96f63712     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427b274: 17ffffcf     	b	0x427b1b0 <_ChromeMain+0x4275f14>
 427b278: f9404a60     	ldr	x0, [x19, #0x90]
 427b27c: f9405268     	ldr	x8, [x19, #0xa0]
 427b280: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427b284: 96f6370d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427b288: 17ffffd0     	b	0x427b1c8 <_ChromeMain+0x4275f2c>
 427b28c: d4200020     	brk	#0x1
 427b290: d10203ff     	sub	sp, sp, #0x80
 427b294: a90367fa     	stp	x26, x25, [sp, #0x30]
 427b298: a9045ff8     	stp	x24, x23, [sp, #0x40]
 427b29c: a90557f6     	stp	x22, x21, [sp, #0x50]
 427b2a0: a9064ff4     	stp	x20, x19, [sp, #0x60]
 427b2a4: a9077bfd     	stp	x29, x30, [sp, #0x70]
 427b2a8: 9101c3fd     	add	x29, sp, #0x70
 427b2ac: aa0103f4     	mov	x20, x1
 427b2b0: aa0003f3     	mov	x19, x0
 427b2b4: 39438018     	ldrb	w24, [x0, #0xe0]
 427b2b8: f0046468     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427b2bc: 9110c108     	add	x8, x8, #0x430
 427b2c0: f0046469     	adrp	x9, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427b2c4: 91106929     	add	x9, x9, #0x41a
 427b2c8: 7100003f     	cmp	w1, #0x0
 427b2cc: 9a881128     	csel	x8, x9, x8, ne
 427b2d0: f0046469     	adrp	x9, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427b2d4: 91104129     	add	x9, x9, #0x410
 427b2d8: 7100031f     	cmp	w24, #0x0
 427b2dc: 9a881136     	csel	x22, x9, x8, ne
 427b2e0: aa1603e0     	mov	x0, x22
 427b2e4: 94f6202e     	bl	0x800339c <_ChromeMain+0x7ffe100>
 427b2e8: 92800208     	mov	x8, #-0x11              ; =-17
 427b2ec: f2efffe8     	movk	x8, #0x7fff, lsl #48
 427b2f0: eb08001f     	cmp	x0, x8
 427b2f4: 54000da2     	b.hs	0x427b4a8 <_ChromeMain+0x427620c>
 427b2f8: aa0003f5     	mov	x21, x0
 427b2fc: f100581f     	cmp	x0, #0x16
 427b300: 540003e8     	b.hi	0x427b37c <_ChromeMain+0x42760e0>
 427b304: 3900bff5     	strb	w21, [sp, #0x2f]
 427b308: 910063f7     	add	x23, sp, #0x18
 427b30c: 8b1502e8     	add	x8, x23, x21
 427b310: eb17011f     	cmp	x8, x23
 427b314: 54000c83     	b.lo	0x427b4a4 <_ChromeMain+0x4276208>
 427b318: eb0802df     	cmp	x22, x8
 427b31c: fa5732c0     	ccmp	x22, x23, #0x0, lo
 427b320: 54000c22     	b.hs	0x427b4a4 <_ChromeMain+0x4276208>
 427b324: aa1703e0     	mov	x0, x23
 427b328: aa1603e1     	mov	x1, x22
 427b32c: aa1503e2     	mov	x2, x21
 427b330: 94f63a72     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 427b334: 38356aff     	strb	wzr, [x23, x21]
 427b338: 2a180288     	orr	w8, w20, w24
 427b33c: 350003a8     	cbnz	w8, 0x427b3b0 <_ChromeMain+0x4276114>
 427b340: 528002a8     	mov	w8, #0x15               ; =21
 427b344: 39005fe8     	strb	w8, [sp, #0x17]
 427b348: 910003e9     	mov	x9, sp
 427b34c: 9100552a     	add	x10, x9, #0x15
 427b350: 9004c548     	adrp	x8, 0xdb23000 <dyld_stub_binder+0xdb23000>
 427b354: 9112c108     	add	x8, x8, #0x4b0
 427b358: eb08015f     	cmp	x10, x8
 427b35c: fa488122     	ccmp	x9, x8, #0x2, hi
 427b360: 54000a29     	b.ls	0x427b4a4 <_ChromeMain+0x4276208>
 427b364: 3dc00100     	ldr	q0, [x8]
 427b368: 3d8003e0     	str	q0, [sp]
 427b36c: f840d108     	ldur	x8, [x8, #0xd]
 427b370: f800d3e8     	stur	x8, [sp, #0xd]
 427b374: 390057ff     	strb	wzr, [sp, #0x15]
 427b378: 14000010     	b	0x427b3b8 <_ChromeMain+0x427611c>
 427b37c: 927ceab9     	and	x25, x21, #0x7ffffffffffffff0
 427b380: 91004320     	add	x0, x25, #0x10
 427b384: 96f64ff9     	bl	0xf368 <_ChromeMain+0xa0cc>
 427b388: aa0003f7     	mov	x23, x0
 427b38c: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 427b390: cb080328     	sub	x8, x25, x8
 427b394: a901d7e0     	stp	x0, x21, [sp, #0x18]
 427b398: f90017e8     	str	x8, [sp, #0x28]
 427b39c: 17ffffdc     	b	0x427b30c <_ChromeMain+0x4276070>
 427b3a0: f9403e68     	ldr	x8, [x19, #0x78]
 427b3a4: 3900011f     	strb	wzr, [x8]
 427b3a8: f900427f     	str	xzr, [x19, #0x80]
 427b3ac: 14000014     	b	0x427b3fc <_ChromeMain+0x4276160>
 427b3b0: a9007fff     	stp	xzr, xzr, [sp]
 427b3b4: f9000bff     	str	xzr, [sp, #0x10]
 427b3b8: 91016274     	add	x20, x19, #0x58
 427b3bc: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427b3c0: 37f80688     	tbnz	w8, #0x1f, 0x427b490 <_ChromeMain+0x42761f4>
 427b3c4: 3cc183e0     	ldur	q0, [sp, #0x18]
 427b3c8: 3d800280     	str	q0, [x20]
 427b3cc: f94017e8     	ldr	x8, [sp, #0x28]
 427b3d0: f9000a88     	str	x8, [x20, #0x10]
 427b3d4: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 427b3d8: 37f80528     	tbnz	w8, #0x1f, 0x427b47c <_ChromeMain+0x42761e0>
 427b3dc: 3dc003e0     	ldr	q0, [sp]
 427b3e0: 3c890260     	stur	q0, [x19, #0x90]
 427b3e4: f9400be8     	ldr	x8, [sp, #0x10]
 427b3e8: f80a0268     	stur	x8, [x19, #0xa0]
 427b3ec: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 427b3f0: 37fffd88     	tbnz	w8, #0x1f, 0x427b3a0 <_ChromeMain+0x4276104>
 427b3f4: 3901e27f     	strb	wzr, [x19, #0x78]
 427b3f8: 39023e7f     	strb	wzr, [x19, #0x8f]
 427b3fc: 3941be69     	ldrb	w9, [x19, #0x6f]
 427b400: 13001d28     	sxtb	w8, w9
 427b404: f940326a     	ldr	x10, [x19, #0x60]
 427b408: 7100011f     	cmp	w8, #0x0
 427b40c: 9a894149     	csel	x9, x10, x9, mi
 427b410: f100253f     	cmp	x9, #0x9
 427b414: 540001a1     	b.ne	0x427b448 <_ChromeMain+0x42761ac>
 427b418: f9400289     	ldr	x9, [x20]
 427b41c: 7100011f     	cmp	w8, #0x0
 427b420: 9a944128     	csel	x8, x9, x20, mi
 427b424: f9400109     	ldr	x9, [x8]
 427b428: 39402108     	ldrb	w8, [x8, #0x8]
 427b42c: 7101911f     	cmp	w8, #0x64
 427b430: d28eae68     	mov	x8, #0x7573             ; =30067
 427b434: f2ac6c68     	movk	x8, #0x6363, lsl #16
 427b438: f2ccaca8     	movk	x8, #0x6565, lsl #32
 427b43c: f2ecac88     	movk	x8, #0x6564, lsl #48
 427b440: fa480120     	ccmp	x9, x8, #0x0, eq
 427b444: 54000180     	b.eq	0x427b474 <_ChromeMain+0x42761d8>
 427b448: fd403a60     	ldr	d0, [x19, #0x70]
 427b44c: fd003a60     	str	d0, [x19, #0x70]
 427b450: aa1303e0     	mov	x0, x19
 427b454: 97fff91c     	bl	0x42798c4 <_ChromeMain+0x4274628>
 427b458: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 427b45c: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 427b460: a94557f6     	ldp	x22, x21, [sp, #0x50]
 427b464: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 427b468: a94367fa     	ldp	x26, x25, [sp, #0x30]
 427b46c: 910203ff     	add	sp, sp, #0x80
 427b470: d65f03c0     	ret
 427b474: 1e6e1000     	fmov	d0, #1.00000000
 427b478: 17fffff5     	b	0x427b44c <_ChromeMain+0x42761b0>
 427b47c: f9404a60     	ldr	x0, [x19, #0x90]
 427b480: f9405268     	ldr	x8, [x19, #0xa0]
 427b484: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427b488: 96f6368c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427b48c: 17ffffd4     	b	0x427b3dc <_ChromeMain+0x4276140>
 427b490: f9402e60     	ldr	x0, [x19, #0x58]
 427b494: f9403668     	ldr	x8, [x19, #0x68]
 427b498: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427b49c: 96f63687     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427b4a0: 17ffffc9     	b	0x427b3c4 <_ChromeMain+0x4276128>
 427b4a4: d4200020     	brk	#0x1
 427b4a8: 942613b9     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 427b4ac: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 427b4b0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 427b4b4: 910043fd     	add	x29, sp, #0x10
 427b4b8: aa0003f3     	mov	x19, x0
