
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41e2f7c: d10543ff     	sub	sp, sp, #0x150
 41e2f80: a90f6ffc     	stp	x28, x27, [sp, #0xf0]
 41e2f84: a91067fa     	stp	x26, x25, [sp, #0x100]
 41e2f88: a9115ff8     	stp	x24, x23, [sp, #0x110]
 41e2f8c: a91257f6     	stp	x22, x21, [sp, #0x120]
 41e2f90: a9134ff4     	stp	x20, x19, [sp, #0x130]
 41e2f94: a9147bfd     	stp	x29, x30, [sp, #0x140]
 41e2f98: 910503fd     	add	x29, sp, #0x140
 41e2f9c: aa0003f4     	mov	x20, x0
 41e2fa0: f9400400     	ldr	x0, [x0, #0x8]
 41e2fa4: b4001aa0     	cbz	x0, 0x41e32f8 <_ChromeMain+0x41de05c>
 41e2fa8: aa0203f3     	mov	x19, x2
 41e2fac: aa0103f5     	mov	x21, x1
 41e2fb0: 94ed90d2     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 41e2fb4: b4001a80     	cbz	x0, 0x41e3304 <_ChromeMain+0x41de068>
 41e2fb8: aa0003f6     	mov	x22, x0
 41e2fbc: f9405c08     	ldr	x8, [x0, #0xb8]
 41e2fc0: b4001a88     	cbz	x8, 0x41e3310 <_ChromeMain+0x41de074>
 41e2fc4: 39404509     	ldrb	w9, [x8, #0x11]
 41e2fc8: 6b09027f     	cmp	w19, w9
 41e2fcc: 54000481     	b.ne	0x41e305c <_ChromeMain+0x41dddc0>
 41e2fd0: a9547bfd     	ldp	x29, x30, [sp, #0x140]
 41e2fd4: a9534ff4     	ldp	x20, x19, [sp, #0x130]
 41e2fd8: a95257f6     	ldp	x22, x21, [sp, #0x120]
 41e2fdc: a9515ff8     	ldp	x24, x23, [sp, #0x110]
 41e2fe0: a95067fa     	ldp	x26, x25, [sp, #0x100]
 41e2fe4: a94f6ffc     	ldp	x28, x27, [sp, #0xf0]
 41e2fe8: 910543ff     	add	sp, sp, #0x150
 41e2fec: d65f03c0     	ret
 41e2ff0: 910063e0     	add	x0, sp, #0x18
 41e2ff4: 94edf3ac     	bl	0x7d5fea4 <_ChromeMain+0x7d5ac08>
 41e2ff8: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 41e2ffc: 36f800a8     	tbz	w8, #0x1f, 0x41e3010 <_ChromeMain+0x41ddd74>
 41e3000: f9404be0     	ldr	x0, [sp, #0x90]
 41e3004: f94053e8     	ldr	x8, [sp, #0xa0]
 41e3008: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41e300c: 96f897ab     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41e3010: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 41e3014: 36f800a8     	tbz	w8, #0x1f, 0x41e3028 <_ChromeMain+0x41ddd8c>
 41e3018: f9403be0     	ldr	x0, [sp, #0x70]
 41e301c: f94043e8     	ldr	x8, [sp, #0x80]
 41e3020: d37ff901     	lsl	x1, x8, #1
 41e3024: 96f897a5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41e3028: 38da73a8     	ldursb	w8, [x29, #-0x59]
 41e302c: 36f800a8     	tbz	w8, #0x1f, 0x41e3040 <_ChromeMain+0x41ddda4>
 41e3030: f85903a0     	ldur	x0, [x29, #-0x70]
 41e3034: f85a03a8     	ldur	x8, [x29, #-0x60]
 41e3038: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41e303c: 96f8979f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41e3040: 38d873a8     	ldursb	w8, [x29, #-0x79]
 41e3044: 36fffc68     	tbz	w8, #0x1f, 0x41e2fd0 <_ChromeMain+0x41ddd34>
 41e3048: f85703a0     	ldur	x0, [x29, #-0x90]
 41e304c: f85803a8     	ldur	x8, [x29, #-0x80]
 41e3050: d37ff901     	lsl	x1, x8, #1
 41e3054: 96f89799     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41e3058: 17ffffde     	b	0x41e2fd0 <_ChromeMain+0x41ddd34>
 41e305c: 39004513     	strb	w19, [x8, #0x11]
 41e3060: 6f00e400     	movi.2d	v0, #0000000000000000
 41e3064: ad3c83a0     	stp	q0, q0, [x29, #-0x70]
 41e3068: ad3b83a0     	stp	q0, q0, [x29, #-0x90]
 41e306c: f94012d8     	ldr	x24, [x22, #0x20]
 41e3070: 39c05f08     	ldrsb	w8, [x24, #0x17]
 41e3074: 37f800c8     	tbnz	w8, #0x1f, 0x41e308c <_ChromeMain+0x41dddf0>
 41e3078: 3dc00300     	ldr	q0, [x24]
 41e307c: f9400b08     	ldr	x8, [x24, #0x10]
 41e3080: f81803a8     	stur	x8, [x29, #-0x80]
 41e3084: 3c9703a0     	stur	q0, [x29, #-0x90]
 41e3088: 14000004     	b	0x41e3098 <_ChromeMain+0x41dddfc>
 41e308c: a9400b01     	ldp	x1, x2, [x24]
 41e3090: d10243a0     	sub	x0, x29, #0x90
 41e3094: 96f98ecf     	bl	0x46bd0 <_ChromeMain+0x41934>
 41e3098: d10243b7     	sub	x23, x29, #0x90
 41e309c: b9401b08     	ldr	w8, [x24, #0x18]
 41e30a0: 39407309     	ldrb	w9, [x24, #0x1c]
 41e30a4: 3818c3a9     	sturb	w9, [x29, #-0x74]
 41e30a8: b81883a8     	stur	w8, [x29, #-0x78]
 41e30ac: 39c0df08     	ldrsb	w8, [x24, #0x37]
 41e30b0: 37f800c8     	tbnz	w8, #0x1f, 0x41e30c8 <_ChromeMain+0x41dde2c>
 41e30b4: 3cc20300     	ldur	q0, [x24, #0x20]
 41e30b8: f8430308     	ldur	x8, [x24, #0x30]
 41e30bc: f80302e8     	stur	x8, [x23, #0x30]
 41e30c0: 3c8202e0     	stur	q0, [x23, #0x20]
 41e30c4: 14000004     	b	0x41e30d4 <_ChromeMain+0x41dde38>
 41e30c8: a9420b01     	ldp	x1, x2, [x24, #0x20]
 41e30cc: 910082e0     	add	x0, x23, #0x20
 41e30d0: 96f8d452     	bl	0x18218 <_ChromeMain+0x12f7c>
 41e30d4: 3940e308     	ldrb	w8, [x24, #0x38]
 41e30d8: 381a83a8     	sturb	w8, [x29, #-0x58]
 41e30dc: 6f00e400     	movi.2d	v0, #0000000000000000
 41e30e0: ad0483e0     	stp	q0, q0, [sp, #0x90]
 41e30e4: ad0383e0     	stp	q0, q0, [sp, #0x70]
 41e30e8: 38d873a8     	ldursb	w8, [x29, #-0x79]
 41e30ec: 37f800c8     	tbnz	w8, #0x1f, 0x41e3104 <_ChromeMain+0x41dde68>
 41e30f0: 3cd703a0     	ldur	q0, [x29, #-0x90]
 41e30f4: 3d801fe0     	str	q0, [sp, #0x70]
 41e30f8: f85803a8     	ldur	x8, [x29, #-0x80]
 41e30fc: f90043e8     	str	x8, [sp, #0x80]
 41e3100: 14000004     	b	0x41e3110 <_ChromeMain+0x41dde74>
 41e3104: a9770ba1     	ldp	x1, x2, [x29, #-0x90]
 41e3108: 9101c3e0     	add	x0, sp, #0x70
 41e310c: 96f98eb1     	bl	0x46bd0 <_ChromeMain+0x41934>
 41e3110: 9101c3f8     	add	x24, sp, #0x70
 41e3114: b84182e8     	ldur	w8, [x23, #0x18]
 41e3118: b9008be8     	str	w8, [sp, #0x88]
 41e311c: 3841c2e8     	ldurb	w8, [x23, #0x1c]
 41e3120: 390233e8     	strb	w8, [sp, #0x8c]
 41e3124: 38da73a8     	ldursb	w8, [x29, #-0x59]
 41e3128: 37f800c8     	tbnz	w8, #0x1f, 0x41e3140 <_ChromeMain+0x41ddea4>
 41e312c: 3cc202e0     	ldur	q0, [x23, #0x20]
 41e3130: 3c820300     	stur	q0, [x24, #0x20]
 41e3134: f84302e8     	ldur	x8, [x23, #0x30]
 41e3138: f8030308     	stur	x8, [x24, #0x30]
 41e313c: 14000004     	b	0x41e314c <_ChromeMain+0x41ddeb0>
 41e3140: a9790ba1     	ldp	x1, x2, [x29, #-0x70]
 41e3144: 91008300     	add	x0, x24, #0x20
 41e3148: 96f8d434     	bl	0x18218 <_ChromeMain+0x12f7c>
 41e314c: 3902a3f3     	strb	w19, [sp, #0xa8]
 41e3150: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 41e3154: 37f800c8     	tbnz	w8, #0x1f, 0x41e316c <_ChromeMain+0x41dded0>
 41e3158: 3dc01fe0     	ldr	q0, [sp, #0x70]
 41e315c: 3d800fe0     	str	q0, [sp, #0x30]
 41e3160: f94043e8     	ldr	x8, [sp, #0x80]
 41e3164: f90023e8     	str	x8, [sp, #0x40]
 41e3168: 14000004     	b	0x41e3178 <_ChromeMain+0x41ddedc>
 41e316c: a9470be1     	ldp	x1, x2, [sp, #0x70]
 41e3170: 9100c3e0     	add	x0, sp, #0x30
 41e3174: 96f98e97     	bl	0x46bd0 <_ChromeMain+0x41934>
 41e3178: b8418308     	ldur	w8, [x24, #0x18]
 41e317c: b9004be8     	str	w8, [sp, #0x48]
 41e3180: 3841c308     	ldurb	w8, [x24, #0x1c]
 41e3184: 390133e8     	strb	w8, [sp, #0x4c]
 41e3188: 9100c3e8     	add	x8, sp, #0x30
 41e318c: 39c29fe9     	ldrsb	w9, [sp, #0xa7]
 41e3190: 37f800c9     	tbnz	w9, #0x1f, 0x41e31a8 <_ChromeMain+0x41ddf0c>
 41e3194: 3cc20300     	ldur	q0, [x24, #0x20]
 41e3198: 3c820100     	stur	q0, [x8, #0x20]
 41e319c: f8430309     	ldur	x9, [x24, #0x30]
 41e31a0: f8030109     	stur	x9, [x8, #0x30]
 41e31a4: 14000004     	b	0x41e31b4 <_ChromeMain+0x41ddf18>
 41e31a8: a9490be1     	ldp	x1, x2, [sp, #0x90]
 41e31ac: 91008100     	add	x0, x8, #0x20
 41e31b0: 96f8d41a     	bl	0x18218 <_ChromeMain+0x12f7c>
 41e31b4: 3942a3e8     	ldrb	w8, [sp, #0xa8]
 41e31b8: 3901a3e8     	strb	w8, [sp, #0x68]
 41e31bc: 394286c2     	ldrb	w2, [x22, #0xa1]
 41e31c0: 9100c3e1     	add	x1, sp, #0x30
 41e31c4: aa1603e0     	mov	x0, x22
 41e31c8: 97fa53da     	bl	0x4078130 <_ChromeMain+0x4072e94>
 41e31cc: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 41e31d0: 36f800a8     	tbz	w8, #0x1f, 0x41e31e4 <_ChromeMain+0x41ddf48>
 41e31d4: f9402be0     	ldr	x0, [sp, #0x50]
 41e31d8: f94033e8     	ldr	x8, [sp, #0x60]
 41e31dc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41e31e0: 96f89736     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41e31e4: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 41e31e8: 36f800a8     	tbz	w8, #0x1f, 0x41e31fc <_ChromeMain+0x41ddf60>
 41e31ec: f9401be0     	ldr	x0, [sp, #0x30]
 41e31f0: f94023e8     	ldr	x8, [sp, #0x40]
 41e31f4: d37ff901     	lsl	x1, x8, #1
 41e31f8: 96f89730     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41e31fc: d0050218     	adrp	x24, 0xe225000 <dyld_stub_binder+0xe225000>
 41e3200: 912f4318     	add	x24, x24, #0xbd0
 41e3204: f9000ff8     	str	x24, [sp, #0x18]
 41e3208: d10243ba     	sub	x26, x29, #0x90
 41e320c: 925e7759     	and	x25, x26, #0xfffffffc00000000
 41e3210: f0054e77     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41e3214: f94046e8     	ldr	x8, [x23, #0x88]
 41e3218: eb08033f     	cmp	x25, x8
 41e321c: 54000081     	b.ne	0x41e322c <_ChromeMain+0x41ddf90>
 41e3220: d10243a0     	sub	x0, x29, #0x90
 41e3224: 96f8c436     	bl	0x142fc <_ChromeMain+0xf060>
 41e3228: f94046e8     	ldr	x8, [x23, #0x88]
 41e322c: f90013fa     	str	x26, [sp, #0x20]
 41e3230: 9101c3fb     	add	x27, sp, #0x70
 41e3234: 925e777a     	and	x26, x27, #0xfffffffc00000000
 41e3238: eb08035f     	cmp	x26, x8
 41e323c: 54000081     	b.ne	0x41e324c <_ChromeMain+0x41ddfb0>
 41e3240: 9101c3e0     	add	x0, sp, #0x70
 41e3244: 96f8c42e     	bl	0x142fc <_ChromeMain+0xf060>
 41e3248: f94046e8     	ldr	x8, [x23, #0x88]
 41e324c: f90017fb     	str	x27, [sp, #0x28]
 41e3250: f90003f8     	str	x24, [sp]
 41e3254: eb08033f     	cmp	x25, x8
 41e3258: 54000081     	b.ne	0x41e3268 <_ChromeMain+0x41ddfcc>
 41e325c: d10243a0     	sub	x0, x29, #0x90
 41e3260: 96f8c427     	bl	0x142fc <_ChromeMain+0xf060>
 41e3264: f94046e8     	ldr	x8, [x23, #0x88]
 41e3268: d10243a9     	sub	x9, x29, #0x90
 41e326c: f90007e9     	str	x9, [sp, #0x8]
 41e3270: eb08035f     	cmp	x26, x8
 41e3274: 54000061     	b.ne	0x41e3280 <_ChromeMain+0x41ddfe4>
 41e3278: 9101c3e0     	add	x0, sp, #0x70
 41e327c: 96f8c420     	bl	0x142fc <_ChromeMain+0xf060>
 41e3280: 9101c3e8     	add	x8, sp, #0x70
 41e3284: f9000be8     	str	x8, [sp, #0x10]
 41e3288: 910003e2     	mov	x2, sp
 41e328c: aa1403e0     	mov	x0, x20
 41e3290: aa1503e1     	mov	x1, x21
 41e3294: 94edcfe6     	bl	0x7d5722c <_ChromeMain+0x7d51f90>
 41e3298: 910003e0     	mov	x0, sp
 41e329c: 94edf302     	bl	0x7d5fea4 <_ChromeMain+0x7d5ac08>
 41e32a0: aa1603e0     	mov	x0, x22
 41e32a4: 94b06564     	bl	0x6dfc834 <_ChromeMain+0x6df7598>
 41e32a8: 2a0003f5     	mov	w21, w0
 41e32ac: eb4082bf     	cmp	x21, x0, lsr #32
 41e32b0: 54ffea02     	b.hs	0x41e2ff0 <_ChromeMain+0x41ddd54>
 41e32b4: d360fc16     	lsr	x22, x0, #32
 41e32b8: 14000007     	b	0x41e32d4 <_ChromeMain+0x41de038>
 41e32bc: d2800000     	mov	x0, #0x0                ; =0
 41e32c0: aa1303e1     	mov	x1, x19
 41e32c4: 94000016     	bl	0x41e331c <_ChromeMain+0x41de080>
 41e32c8: 910006b5     	add	x21, x21, #0x1
 41e32cc: eb1502df     	cmp	x22, x21
 41e32d0: 54ffe900     	b.eq	0x41e2ff0 <_ChromeMain+0x41ddd54>
 41e32d4: 37ffff55     	tbnz	w21, #0x1f, 0x41e32bc <_ChromeMain+0x41de020>
 41e32d8: f9400280     	ldr	x0, [x20]
 41e32dc: b9401808     	ldr	w8, [x0, #0x18]
 41e32e0: 6b0802bf     	cmp	w21, w8
 41e32e4: 54fffeca     	b.ge	0x41e32bc <_ChromeMain+0x41de020>
 41e32e8: 92407aa1     	and	x1, x21, #0x7fffffff
 41e32ec: 9739ec03     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 41e32f0: f9402000     	ldr	x0, [x0, #0x40]
 41e32f4: 17fffff3     	b	0x41e32c0 <_ChromeMain+0x41de024>
 41e32f8: d4200000     	brk	#0
 41e32fc: d4400000     	hlt	#0
 41e3300: d4200020     	brk	#0x1
 41e3304: d4200000     	brk	#0
 41e3308: d4400000     	hlt	#0
 41e330c: d4200020     	brk	#0x1
 41e3310: d4200000     	brk	#0
 41e3314: d4400000     	hlt	#0
 41e3318: d4200020     	brk	#0x1
