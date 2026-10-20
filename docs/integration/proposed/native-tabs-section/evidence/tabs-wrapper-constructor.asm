
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e3034: f8bfc320     	ldapr	x0, [x25]
 37e3038: b40125e0     	cbz	x0, 0x37e54f4 <_ChromeMain+0x37e0258>
 37e303c: 52806201     	mov	w1, #0x310              ; =784
 37e3040: d2800002     	mov	x2, #0x0                ; =0
 37e3044: 9723215b     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e3048: aa0003f5     	mov	x21, x0
 37e304c: 976e303d     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 37e3050: 52802800     	mov	w0, #0x140              ; =320
 37e3054: 9720b0c5     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e3058: aa0003f4     	mov	x20, x0
 37e305c: 97c8b55d     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 37e3060: aa1503e0     	mov	x0, x21
 37e3064: aa1403e1     	mov	x1, x20
 37e3068: 978e99f4     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 37e306c: b940f288     	ldr	w8, [x20, #0xf0]
 37e3070: 3500cfa8     	cbnz	w8, 0x37e4a64 <_ChromeMain+0x37df7c8>
 37e3074: 52800036     	mov	w22, #0x1               ; =1
 37e3078: b90073f6     	str	w22, [sp, #0x70]
 37e307c: d0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e3080: 9115a021     	add	x1, x1, #0x568
 37e3084: 91046280     	add	x0, x20, #0x118
 37e3088: 9101c3e2     	add	x2, sp, #0x70
 37e308c: 978a0846     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 37e3090: 3943d288     	ldrb	w8, [x20, #0xf4]
 37e3094: 370000a8     	tbnz	w8, #0x0, 0x37e30a8 <_ChromeMain+0x37dde0c>
 37e3098: 3903d296     	strb	w22, [x20, #0xf4]
 37e309c: aa1403e0     	mov	x0, x20
 37e30a0: 52800021     	mov	w1, #0x1                ; =1
 37e30a4: 978a0883     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 37e30a8: b0053ae8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 37e30ac: 3dc2a500     	ldr	q0, [x8, #0xa90]
 37e30b0: 3d801fe0     	str	q0, [sp, #0x70]
 37e30b4: d0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e30b8: 91122021     	add	x1, x1, #0x488
 37e30bc: 91046280     	add	x0, x20, #0x118
 37e30c0: 9101c3e2     	add	x2, sp, #0x70
 37e30c4: 978c2b67     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 37e30c8: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e30cc: f9404789     	ldr	x9, [x28, #0x88]
 37e30d0: eb09011f     	cmp	x8, x9
 37e30d4: 54000061     	b.ne	0x37e30e0 <_ChromeMain+0x37dde44>
 37e30d8: aa1303e0     	mov	x0, x19
 37e30dc: 9720c488     	bl	0x142fc <_ChromeMain+0xf060>
 37e30e0: 52800700     	mov	w0, #0x38               ; =56
 37e30e4: 9720b0a1     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e30e8: aa0003f6     	mov	x22, x0
 37e30ec: 52800028     	mov	w8, #0x1                ; =1
 37e30f0: b9000008     	str	w8, [x0]
 37e30f4: b0007268     	adrp	x8, 0x4630000 <_ChromeMain+0x462ad64>
 37e30f8: 91026108     	add	x8, x8, #0x98
 37e30fc: d0003aa9     	adrp	x9, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e3100: 913a012a     	add	x10, x9, #0xe80
 37e3104: 105b51e9     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e3108: d503201f     	nop
 37e310c: a900a40a     	stp	x10, x9, [x0, #0x8]
 37e3110: a901a018     	stp	x24, x8, [x0, #0x18]
 37e3114: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e3118: f8bfc320     	ldapr	x0, [x25]
 37e311c: b4011f00     	cbz	x0, 0x37e54fc <_ChromeMain+0x37e0260>
 37e3120: 5280a101     	mov	w1, #0x508              ; =1288
 37e3124: d2800002     	mov	x2, #0x0                ; =0
 37e3128: 97232122     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e312c: 52800088     	mov	w8, #0x4                ; =4
 37e3130: 39021fe8     	strb	w8, [sp, #0x87]
 37e3134: 9101c3e8     	add	x8, sp, #0x70
 37e3138: 91002109     	add	x9, x8, #0x8
 37e313c: 90053d2a     	adrp	x10, 0xdf87000 <dyld_stub_binder+0xdf87000>
 37e3140: 9128014a     	add	x10, x10, #0xa00
 37e3144: eb0a013f     	cmp	x9, x10
 37e3148: fa4a8102     	ccmp	x8, x10, #0x2, hi
 37e314c: 54ff5649     	b.ls	0x37e1c14 <_ChromeMain+0x37dc978>
 37e3150: aa0003f4     	mov	x20, x0
 37e3154: d2800a88     	mov	x8, #0x54               ; =84
 37e3158: f2a00d28     	movk	x8, #0x69, lsl #16
 37e315c: f2c00c88     	movk	x8, #0x64, lsl #32
 37e3160: f2e00f28     	movk	x8, #0x79, lsl #48
 37e3164: f9003be8     	str	x8, [sp, #0x70]
 37e3168: 7900f3ff     	strh	wzr, [sp, #0x78]
 37e316c: d0058f81     	adrp	x1, 0xe9d5000 <dyld_stub_binder+0xe9d5000>
 37e3170: 91186021     	add	x1, x1, #0x618
 37e3174: 9101c3e2     	add	x2, sp, #0x70
 37e3178: aa1603e3     	mov	x3, x22
 37e317c: 943a1f8d     	bl	0x466afb0 <_ChromeMain+0x4665d14>
 37e3180: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 37e3184: 36f800a8     	tbz	w8, #0x1f, 0x37e3198 <_ChromeMain+0x37ddefc>
 37e3188: f9403be0     	ldr	x0, [sp, #0x70]
 37e318c: f94043e8     	ldr	x8, [sp, #0x80]
 37e3190: d37ff901     	lsl	x1, x8, #1
 37e3194: 97209749     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 37e3198: 3945a688     	ldrb	w8, [x20, #0x169]
 37e319c: 35012808     	cbnz	w8, 0x37e569c <_ChromeMain+0x37e0400>
 37e31a0: f940cea2     	ldr	x2, [x21, #0x198]
 37e31a4: aa1503e0     	mov	x0, x21
 37e31a8: aa1403e1     	mov	x1, x20
 37e31ac: 973e5894     	bl	0x7793fc <_ChromeMain+0x774160>
 37e31b0: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e31b4: f9404789     	ldr	x9, [x28, #0x88]
 37e31b8: eb09011f     	cmp	x8, x9
 37e31bc: 54000061     	b.ne	0x37e31c8 <_ChromeMain+0x37ddf2c>
 37e31c0: aa1403e0     	mov	x0, x20
 37e31c4: 9720c44e     	bl	0x142fc <_ChromeMain+0xf060>
 37e31c8: f9434660     	ldr	x0, [x19, #0x688]
 37e31cc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e31d0: f9404789     	ldr	x9, [x28, #0x88]
 37e31d4: eb09011f     	cmp	x8, x9
 37e31d8: 54000041     	b.ne	0x37e31e0 <_ChromeMain+0x37ddf44>
 37e31dc: 9720fe18     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e31e0: f9034674     	str	x20, [x19, #0x688]
 37e31e4: 52800600     	mov	w0, #0x30               ; =48
 37e31e8: 9720b060     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e31ec: f9003be0     	str	x0, [sp, #0x70]
 37e31f0: 90053ae8     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 37e31f4: 3dc16d00     	ldr	q0, [x8, #0x5b0]
 37e31f8: 3c8783e0     	stur	q0, [sp, #0x78]
 37e31fc: 9100a809     	add	x9, x0, #0x2a
 37e3200: eb00013f     	cmp	x9, x0
 37e3204: 54ff5083     	b.lo	0x37e1c14 <_ChromeMain+0x37dc978>
 37e3208: 90053d28     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 37e320c: 91282908     	add	x8, x8, #0xa0a
 37e3210: eb08013f     	cmp	x9, x8
 37e3214: fa488002     	ccmp	x0, x8, #0x2, hi
 37e3218: 54ff4fe9     	b.ls	0x37e1c14 <_ChromeMain+0x37dc978>
 37e321c: ad400500     	ldp	q0, q1, [x8]
 37e3220: ad000400     	stp	q0, q1, [x0]
 37e3224: 3cc1a100     	ldur	q0, [x8, #0x1a]
 37e3228: 3c81a000     	stur	q0, [x0, #0x1a]
 37e322c: 7900541f     	strh	wzr, [x0, #0x2a]
 37e3230: 9101c3e1     	add	x1, sp, #0x70
 37e3234: aa1403e0     	mov	x0, x20
 37e3238: 97418dc3     	bl	0x846944 <_ChromeMain+0x8416a8>
 37e323c: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 37e3240: 36f800a8     	tbz	w8, #0x1f, 0x37e3254 <_ChromeMain+0x37ddfb8>
 37e3244: f9403be0     	ldr	x0, [sp, #0x70]
 37e3248: f94043e8     	ldr	x8, [sp, #0x80]
 37e324c: d37ff901     	lsl	x1, x8, #1
 37e3250: 9720971a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 37e3254: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e3258: f9404789     	ldr	x9, [x28, #0x88]
 37e325c: eb09011f     	cmp	x8, x9
 37e3260: 54000061     	b.ne	0x37e326c <_ChromeMain+0x37ddfd0>
 37e3264: aa1303e0     	mov	x0, x19
 37e3268: 9720c425     	bl	0x142fc <_ChromeMain+0xf060>
 37e326c: 52800700     	mov	w0, #0x38               ; =56
 37e3270: 9720b03e     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e3274: aa0003f4     	mov	x20, x0
 37e3278: 52800028     	mov	w8, #0x1                ; =1
 37e327c: b9000008     	str	w8, [x0]
 37e3280: b0007268     	adrp	x8, 0x4630000 <_ChromeMain+0x462ad64>
 37e3284: 912d2108     	add	x8, x8, #0xb48
 37e3288: d0003aa9     	adrp	x9, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e328c: 913a012a     	add	x10, x9, #0xe80
 37e3290: 105b4589     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e3294: d503201f     	nop
 37e3298: a900a40a     	stp	x10, x9, [x0, #0x8]
 37e329c: a901a018     	stp	x24, x8, [x0, #0x18]
 37e32a0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e32a4: f8bfc320     	ldapr	x0, [x25]
 37e32a8: b40112e0     	cbz	x0, 0x37e5504 <_ChromeMain+0x37e0268>
 37e32ac: 5280a101     	mov	w1, #0x508              ; =1288
 37e32b0: d2800002     	mov	x2, #0x0                ; =0
 37e32b4: 972320bf     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e32b8: 528000a8     	mov	w8, #0x5                ; =5
 37e32bc: 39021fe8     	strb	w8, [sp, #0x87]
 37e32c0: 9101c3e9     	add	x9, sp, #0x70
 37e32c4: 9100292a     	add	x10, x9, #0xa
 37e32c8: 90053d28     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 37e32cc: 9128d908     	add	x8, x8, #0xa36
 37e32d0: eb08015f     	cmp	x10, x8
 37e32d4: fa488122     	ccmp	x9, x8, #0x2, hi
 37e32d8: 9101c3f8     	add	x24, sp, #0x70
 37e32dc: 54ff49c9     	b.ls	0x37e1c14 <_ChromeMain+0x37dc978>
 37e32e0: aa0003f6     	mov	x22, x0
 37e32e4: 52800e49     	mov	w9, #0x72               ; =114
 37e32e8: b9007be9     	str	w9, [sp, #0x78]
 37e32ec: f9400108     	ldr	x8, [x8]
 37e32f0: f9003be8     	str	x8, [sp, #0x70]
 37e32f4: b0058f81     	adrp	x1, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 37e32f8: 91276021     	add	x1, x1, #0x9d8
 37e32fc: 9101c3e2     	add	x2, sp, #0x70
 37e3300: aa1403e3     	mov	x3, x20
 37e3304: 943a1f2b     	bl	0x466afb0 <_ChromeMain+0x4665d14>
 37e3308: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 37e330c: 36f800a8     	tbz	w8, #0x1f, 0x37e3320 <_ChromeMain+0x37de084>
 37e3310: f9403be0     	ldr	x0, [sp, #0x70]
 37e3314: f94043e8     	ldr	x8, [sp, #0x80]
 37e3318: d37ff901     	lsl	x1, x8, #1
 37e331c: 972096e7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 37e3320: 3945a6c8     	ldrb	w8, [x22, #0x169]
 37e3324: 35011c28     	cbnz	w8, 0x37e56a8 <_ChromeMain+0x37e040c>
 37e3328: f940cea2     	ldr	x2, [x21, #0x198]
 37e332c: aa1503e0     	mov	x0, x21
 37e3330: aa1603e1     	mov	x1, x22
 37e3334: 973e5832     	bl	0x7793fc <_ChromeMain+0x774160>
 37e3338: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 37e333c: d0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e3340: 91122021     	add	x1, x1, #0x488
 37e3344: 9101c3f7     	add	x23, sp, #0x70
 37e3348: 910362c0     	add	x0, x22, #0xd8
 37e334c: 9101c3e2     	add	x2, sp, #0x70
 37e3350: 978c2ac4     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 37e3354: f8bfc320     	ldapr	x0, [x25]
 37e3358: b4010da0     	cbz	x0, 0x37e550c <_ChromeMain+0x37e0270>
 37e335c: 52806401     	mov	w1, #0x320              ; =800
 37e3360: d2800002     	mov	x2, #0x0                ; =0
 37e3364: 97232093     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e3368: 52800088     	mov	w8, #0x4                ; =4
 37e336c: 39021fe8     	strb	w8, [sp, #0x87]
 37e3370: 910022e9     	add	x9, x23, #0x8
 37e3374: 90053d2a     	adrp	x10, 0xdf87000 <dyld_stub_binder+0xdf87000>
 37e3378: 9129094a     	add	x10, x10, #0xa42
 37e337c: eb0a013f     	cmp	x9, x10
 37e3380: fa4a82e2     	ccmp	x23, x10, #0x2, hi
 37e3384: 54ff4489     	b.ls	0x37e1c14 <_ChromeMain+0x37dc978>
 37e3388: aa0003f4     	mov	x20, x0
 37e338c: d2800a89     	mov	x9, #0x54               ; =84
 37e3390: f2a00c29     	movk	x9, #0x61, lsl #16
 37e3394: f2c00c49     	movk	x9, #0x62, lsl #32
 37e3398: f2e00e69     	movk	x9, #0x73, lsl #48
 37e339c: f9003be9     	str	x9, [sp, #0x70]
 37e33a0: 7900f3ff     	strh	wzr, [sp, #0x78]
 37e33a4: b90003e8     	str	w8, [sp]
 37e33a8: 9101c3e1     	add	x1, sp, #0x70
 37e33ac: 52800002     	mov	w2, #0x0                ; =0
 37e33b0: d2800003     	mov	x3, #0x0                ; =0
 37e33b4: 52800084     	mov	w4, #0x4                ; =4
 37e33b8: d2800005     	mov	x5, #0x0                ; =0
 37e33bc: d2800006     	mov	x6, #0x0                ; =0
 37e33c0: aa1503e7     	mov	x7, x21
 37e33c4: 9439fb13     	bl	0x4662010 <_ChromeMain+0x465cd74>
 37e33c8: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 37e33cc: 36f800a8     	tbz	w8, #0x1f, 0x37e33e0 <_ChromeMain+0x37de144>
 37e33d0: f9403be0     	ldr	x0, [sp, #0x70]
 37e33d4: f94043e8     	ldr	x8, [sp, #0x80]
 37e33d8: d37ff901     	lsl	x1, x8, #1
 37e33dc: 972096b7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 37e33e0: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e33e4: f9404789     	ldr	x9, [x28, #0x88]
 37e33e8: eb09011f     	cmp	x8, x9
 37e33ec: 54000061     	b.ne	0x37e33f8 <_ChromeMain+0x37de15c>
 37e33f0: aa1403e0     	mov	x0, x20
 37e33f4: 9720c3c2     	bl	0x142fc <_ChromeMain+0xf060>
 37e33f8: f9433a60     	ldr	x0, [x19, #0x670]
 37e33fc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e3400: f9404789     	ldr	x9, [x28, #0x88]
 37e3404: eb09011f     	cmp	x8, x9
 37e3408: 54000041     	b.ne	0x37e3410 <_ChromeMain+0x37de174>
 37e340c: 9720fd8c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e3410: f9033a74     	str	x20, [x19, #0x670]
 37e3414: f9418a95     	ldr	x21, [x20, #0x310]
 37e3418: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 37e341c: f9404789     	ldr	x9, [x28, #0x88]
 37e3420: eb09011f     	cmp	x8, x9
 37e3424: 54000061     	b.ne	0x37e3430 <_ChromeMain+0x37de194>
 37e3428: aa1503e0     	mov	x0, x21
 37e342c: 9720c3b4     	bl	0x142fc <_ChromeMain+0xf060>
 37e3430: f9433e60     	ldr	x0, [x19, #0x678]
 37e3434: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e3438: f9404789     	ldr	x9, [x28, #0x88]
 37e343c: eb09011f     	cmp	x8, x9
 37e3440: 54000041     	b.ne	0x37e3448 <_ChromeMain+0x37de1ac>
 37e3444: 9720fd7e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e3448: f9033e75     	str	x21, [x19, #0x678]
 37e344c: f9418e95     	ldr	x21, [x20, #0x318]
 37e3450: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 37e3454: f9404789     	ldr	x9, [x28, #0x88]
 37e3458: eb09011f     	cmp	x8, x9
 37e345c: 54000061     	b.ne	0x37e3468 <_ChromeMain+0x37de1cc>
 37e3460: aa1503e0     	mov	x0, x21
 37e3464: 9720c3a6     	bl	0x142fc <_ChromeMain+0xf060>
 37e3468: f9434260     	ldr	x0, [x19, #0x680]
 37e346c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e3470: f9404789     	ldr	x9, [x28, #0x88]
 37e3474: eb09011f     	cmp	x8, x9
 37e3478: 54000041     	b.ne	0x37e3480 <_ChromeMain+0x37de1e4>
 37e347c: 9720fd70     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e3480: f9034275     	str	x21, [x19, #0x680]
 37e3484: f9418a88     	ldr	x8, [x20, #0x310]
 37e3488: f9426515     	ldr	x21, [x8, #0x4c8]
 37e348c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 37e3490: f9404789     	ldr	x9, [x28, #0x88]
 37e3494: eb09011f     	cmp	x8, x9
 37e3498: 54000061     	b.ne	0x37e34a4 <_ChromeMain+0x37de208>
 37e349c: aa1503e0     	mov	x0, x21
 37e34a0: 9720c397     	bl	0x142fc <_ChromeMain+0xf060>
 37e34a4: f9434a60     	ldr	x0, [x19, #0x690]
 37e34a8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e34ac: f9404789     	ldr	x9, [x28, #0x88]
 37e34b0: eb09011f     	cmp	x8, x9
 37e34b4: 54000041     	b.ne	0x37e34bc <_ChromeMain+0x37de220>
 37e34b8: 9720fd61     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e34bc: f9034a75     	str	x21, [x19, #0x690]
 37e34c0: 3945a688     	ldrb	w8, [x20, #0x169]
 37e34c4: 35010f88     	cbnz	w8, 0x37e56b4 <_ChromeMain+0x37e0418>
 37e34c8: f942e260     	ldr	x0, [x19, #0x5c0]
 37e34cc: f940cc02     	ldr	x2, [x0, #0x198]
 37e34d0: aa1403e1     	mov	x1, x20
 37e34d4: 973e57ca     	bl	0x7793fc <_ChromeMain+0x774160>
 37e34d8: f9433e60     	ldr	x0, [x19, #0x678]
 37e34dc: f9400008     	ldr	x8, [x0]
 37e34e0: f9405108     	ldr	x8, [x8, #0xa0]
 37e34e4: 52800021     	mov	w1, #0x1                ; =1
 37e34e8: d63f0100     	blr	x8
 37e34ec: f9434a60     	ldr	x0, [x19, #0x690]
