
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45b3000: d10203ff     	sub	sp, sp, #0x80
 45b3004: a90367fa     	stp	x26, x25, [sp, #0x30]
 45b3008: a9045ff8     	stp	x24, x23, [sp, #0x40]
 45b300c: a90557f6     	stp	x22, x21, [sp, #0x50]
 45b3010: a9064ff4     	stp	x20, x19, [sp, #0x60]
 45b3014: a9077bfd     	stp	x29, x30, [sp, #0x70]
 45b3018: 9101c3fd     	add	x29, sp, #0x70
 45b301c: f9429c08     	ldr	x8, [x0, #0x538]
 45b3020: b4000ac8     	cbz	x8, 0x45b3178 <_ChromeMain+0x45adedc>
 45b3024: aa0203f5     	mov	x21, x2
 45b3028: aa0103f4     	mov	x20, x1
 45b302c: aa0003f3     	mov	x19, x0
 45b3030: 91062118     	add	x24, x8, #0x188
 45b3034: f940c508     	ldr	x8, [x8, #0x188]
 45b3038: f0052ff7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45b303c: b0052919     	adrp	x25, 0xead4000 <dyld_stub_binder+0xead4000>
 45b3040: 912b4339     	add	x25, x25, #0xad0
 45b3044: b4000288     	cbz	x8, 0x45b3094 <_ChromeMain+0x45addf8>
 45b3048: 1400000d     	b	0x45b307c <_ChromeMain+0x45adde0>
 45b304c: eb18011f     	cmp	x8, x24
 45b3050: 54000220     	b.eq	0x45b3094 <_ChromeMain+0x45addf8>
 45b3054: f9401516     	ldr	x22, [x8, #0x28]
 45b3058: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45b305c: f94046e9     	ldr	x9, [x23, #0x88]
 45b3060: eb09011f     	cmp	x8, x9
 45b3064: 540001a1     	b.ne	0x45b3098 <_ChromeMain+0x45addfc>
 45b3068: aa1603e0     	mov	x0, x22
 45b306c: 96e984a4     	bl	0x142fc <_ChromeMain+0xf060>
 45b3070: 1400000a     	b	0x45b3098 <_ChromeMain+0x45addfc>
 45b3074: f9400108     	ldr	x8, [x8]
 45b3078: b40000e8     	cbz	x8, 0x45b3094 <_ChromeMain+0x45addf8>
 45b307c: f9401109     	ldr	x9, [x8, #0x20]
 45b3080: eb19013f     	cmp	x9, x25
 45b3084: 54ffff88     	b.hi	0x45b3074 <_ChromeMain+0x45addd8>
 45b3088: 54fffe20     	b.eq	0x45b304c <_ChromeMain+0x45addb0>
 45b308c: f9400508     	ldr	x8, [x8, #0x8]
 45b3090: b5ffff68     	cbnz	x8, 0x45b307c <_ChromeMain+0x45adde0>
 45b3094: d2800016     	mov	x22, #0x0               ; =0
 45b3098: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45b309c: f94046e9     	ldr	x9, [x23, #0x88]
 45b30a0: eb09011f     	cmp	x8, x9
 45b30a4: 54000061     	b.ne	0x45b30b0 <_ChromeMain+0x45ade14>
 45b30a8: aa1603e0     	mov	x0, x22
 45b30ac: 96e9be64     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b30b0: 39c0fec8     	ldrsb	w8, [x22, #0x3f]
 45b30b4: 37f80708     	tbnz	w8, #0x1f, 0x45b3194 <_ChromeMain+0x45adef8>
 45b30b8: f9400308     	ldr	x8, [x24]
 45b30bc: b4000288     	cbz	x8, 0x45b310c <_ChromeMain+0x45ade70>
 45b30c0: 1400000d     	b	0x45b30f4 <_ChromeMain+0x45ade58>
 45b30c4: eb18011f     	cmp	x8, x24
 45b30c8: 54000220     	b.eq	0x45b310c <_ChromeMain+0x45ade70>
 45b30cc: f9401516     	ldr	x22, [x8, #0x28]
 45b30d0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45b30d4: f94046e9     	ldr	x9, [x23, #0x88]
 45b30d8: eb09011f     	cmp	x8, x9
 45b30dc: 540001a1     	b.ne	0x45b3110 <_ChromeMain+0x45ade74>
 45b30e0: aa1603e0     	mov	x0, x22
 45b30e4: 96e98486     	bl	0x142fc <_ChromeMain+0xf060>
 45b30e8: 1400000a     	b	0x45b3110 <_ChromeMain+0x45ade74>
 45b30ec: f9400108     	ldr	x8, [x8]
 45b30f0: b40000e8     	cbz	x8, 0x45b310c <_ChromeMain+0x45ade70>
 45b30f4: f9401109     	ldr	x9, [x8, #0x20]
 45b30f8: eb19013f     	cmp	x9, x25
 45b30fc: 54ffff88     	b.hi	0x45b30ec <_ChromeMain+0x45ade50>
 45b3100: 54fffe20     	b.eq	0x45b30c4 <_ChromeMain+0x45ade28>
 45b3104: f9400508     	ldr	x8, [x8, #0x8]
 45b3108: b5ffff68     	cbnz	x8, 0x45b30f4 <_ChromeMain+0x45ade58>
 45b310c: d2800016     	mov	x22, #0x0               ; =0
 45b3110: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45b3114: f94046e9     	ldr	x9, [x23, #0x88]
 45b3118: eb09011f     	cmp	x8, x9
 45b311c: 54000061     	b.ne	0x45b3128 <_ChromeMain+0x45ade8c>
 45b3120: aa1603e0     	mov	x0, x22
 45b3124: 96e9be46     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b3128: 3940fec9     	ldrb	w9, [x22, #0x3f]
 45b312c: 13001d28     	sxtb	w8, w9
 45b3130: f9401aca     	ldr	x10, [x22, #0x30]
 45b3134: 7100011f     	cmp	w8, #0x0
 45b3138: 9a894149     	csel	x9, x10, x9, mi
 45b313c: f100553f     	cmp	x9, #0x15
 45b3140: 540001c1     	b.ne	0x45b3178 <_ChromeMain+0x45adedc>
 45b3144: f8428ec9     	ldr	x9, [x22, #0x28]!
 45b3148: 7100011f     	cmp	w8, #0x0
 45b314c: 9a964128     	csel	x8, x9, x22, mi
 45b3150: d0044a49     	adrp	x9, 0xcefd000 <dyld_stub_binder+0xcefd000>
 45b3154: 911fd929     	add	x9, x9, #0x7f6
 45b3158: a9402d0a     	ldp	x10, x11, [x8]
 45b315c: a940352c     	ldp	x12, x13, [x9]
 45b3160: f840d108     	ldur	x8, [x8, #0xd]
 45b3164: f840d129     	ldur	x9, [x9, #0xd]
 45b3168: eb0c015f     	cmp	x10, x12
 45b316c: fa4d0160     	ccmp	x11, x13, #0x0, eq
 45b3170: fa490100     	ccmp	x8, x9, #0x0, eq
 45b3174: 54000320     	b.eq	0x45b31d8 <_ChromeMain+0x45adf3c>
 45b3178: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 45b317c: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 45b3180: a94557f6     	ldp	x22, x21, [sp, #0x50]
 45b3184: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 45b3188: a94367fa     	ldp	x26, x25, [sp, #0x30]
 45b318c: 910203ff     	add	sp, sp, #0x80
 45b3190: d65f03c0     	ret
 45b3194: f9401ac8     	ldr	x8, [x22, #0x30]
 45b3198: f100711f     	cmp	x8, #0x1c
 45b319c: 54fff8e1     	b.ne	0x45b30b8 <_ChromeMain+0x45ade1c>
 45b31a0: f94016c8     	ldr	x8, [x22, #0x28]
 45b31a4: 90044929     	adrp	x9, 0xced7000 <dyld_stub_binder+0xced7000>
 45b31a8: 910e6529     	add	x9, x9, #0x399
 45b31ac: a9402d0a     	ldp	x10, x11, [x8]
 45b31b0: a940352c     	ldp	x12, x13, [x9]
 45b31b4: f940090e     	ldr	x14, [x8, #0x10]
 45b31b8: f940092f     	ldr	x15, [x9, #0x10]
 45b31bc: b9401908     	ldr	w8, [x8, #0x18]
 45b31c0: b9401929     	ldr	w9, [x9, #0x18]
 45b31c4: eb0c015f     	cmp	x10, x12
 45b31c8: fa4d0160     	ccmp	x11, x13, #0x0, eq
 45b31cc: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 45b31d0: fa490100     	ccmp	x8, x9, #0x0, eq
 45b31d4: 54fff721     	b.ne	0x45b30b8 <_ChromeMain+0x45ade1c>
 45b31d8: f9429e68     	ldr	x8, [x19, #0x538]
 45b31dc: f9404508     	ldr	x8, [x8, #0x88]
 45b31e0: f9404908     	ldr	x8, [x8, #0x90]
 45b31e4: b4000048     	cbz	x8, 0x45b31ec <_ChromeMain+0x45adf50>
 45b31e8: f9402108     	ldr	x8, [x8, #0x40]
 45b31ec: eb0802bf     	cmp	x21, x8
 45b31f0: 54fffc41     	b.ne	0x45b3178 <_ChromeMain+0x45adedc>
 45b31f4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b31f8: f94046e9     	ldr	x9, [x23, #0x88]
 45b31fc: eb09011f     	cmp	x8, x9
 45b3200: 54000061     	b.ne	0x45b320c <_ChromeMain+0x45adf70>
 45b3204: aa1503e0     	mov	x0, x21
 45b3208: 96e9843d     	bl	0x142fc <_ChromeMain+0xf060>
 45b320c: f9440a60     	ldr	x0, [x19, #0x810]
 45b3210: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45b3214: f94046e9     	ldr	x9, [x23, #0x88]
 45b3218: eb09011f     	cmp	x8, x9
 45b321c: 54000041     	b.ne	0x45b3224 <_ChromeMain+0x45adf88>
 45b3220: 96e9be07     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b3224: f9040a75     	str	x21, [x19, #0x810]
 45b3228: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 45b322c: 92800008     	mov	x8, #-0x1               ; =-1
 45b3230: f9000fe8     	str	x8, [sp, #0x18]
 45b3234: f9400688     	ldr	x8, [x20, #0x8]
 45b3238: d37df115     	lsl	x21, x8, #3
 45b323c: b4000235     	cbz	x21, 0x45b3280 <_ChromeMain+0x45adfe4>
 45b3240: f9400294     	ldr	x20, [x20]
 45b3244: f8408688     	ldr	x8, [x20], #0x8
 45b3248: f9400109     	ldr	x9, [x8]
 45b324c: 29412d0a     	ldp	w10, w11, [x8, #0x8]
 45b3250: 0b09014a     	add	w10, w10, w9
 45b3254: 8b49816b     	add	x11, x11, x9, lsr #32
 45b3258: aa0b814a     	orr	x10, x10, x11, lsl #32
 45b325c: a9022be9     	stp	x9, x10, [sp, #0x20]
 45b3260: 39404108     	ldrb	w8, [x8, #0x10]
 45b3264: 531f7903     	lsl	w3, w8, #1
 45b3268: 910023e0     	add	x0, sp, #0x8
 45b326c: 910023e1     	add	x1, sp, #0x8
 45b3270: 910083e2     	add	x2, sp, #0x20
 45b3274: 96e95b83     	bl	0xa080 <_ChromeMain+0x4de4>
 45b3278: f10022b5     	subs	x21, x21, #0x8
 45b327c: 54fffe41     	b.ne	0x45b3244 <_ChromeMain+0x45adfa8>
 45b3280: 91206274     	add	x20, x19, #0x818
 45b3284: 3960c268     	ldrb	w8, [x19, #0x830]
 45b3288: 350002c8     	cbnz	w8, 0x45b32e0 <_ChromeMain+0x45ae044>
 45b328c: b4000694     	cbz	x20, 0x45b335c <_ChromeMain+0x45ae0c0>
 45b3290: a9007e9f     	stp	xzr, xzr, [x20]
 45b3294: 92800008     	mov	x8, #-0x1               ; =-1
 45b3298: f9041668     	str	x8, [x19, #0x828]
 45b329c: 910023e8     	add	x8, sp, #0x8
 45b32a0: eb08029f     	cmp	x20, x8
 45b32a4: 54000100     	b.eq	0x45b32c4 <_ChromeMain+0x45ae028>
 45b32a8: 3cc083e0     	ldur	q0, [sp, #0x8]
 45b32ac: 3d800280     	str	q0, [x20]
 45b32b0: f9400fe8     	ldr	x8, [sp, #0x18]
 45b32b4: f9041668     	str	x8, [x19, #0x828]
 45b32b8: d1000509     	sub	x9, x8, #0x1
 45b32bc: b1000d3f     	cmn	x9, #0x3
 45b32c0: 54000509     	b.ls	0x45b3360 <_ChromeMain+0x45ae0c4>
 45b32c4: 52800028     	mov	w8, #0x1                ; =1
 45b32c8: 3920c268     	strb	w8, [x19, #0x830]
 45b32cc: f9400fe8     	ldr	x8, [sp, #0x18]
 45b32d0: d1000509     	sub	x9, x8, #0x1
 45b32d4: b1000d3f     	cmn	x9, #0x3
 45b32d8: 54000269     	b.ls	0x45b3324 <_ChromeMain+0x45ae088>
 45b32dc: 17ffffa7     	b	0x45b3178 <_ChromeMain+0x45adedc>
 45b32e0: 910023e8     	add	x8, sp, #0x8
 45b32e4: eb08029f     	cmp	x20, x8
 45b32e8: 54ffff20     	b.eq	0x45b32cc <_ChromeMain+0x45ae030>
 45b32ec: f9441668     	ldr	x8, [x19, #0x828]
 45b32f0: d1000509     	sub	x9, x8, #0x1
 45b32f4: b1000d3f     	cmn	x9, #0x3
 45b32f8: 54000249     	b.ls	0x45b3340 <_ChromeMain+0x45ae0a4>
 45b32fc: 3cc083e0     	ldur	q0, [sp, #0x8]
 45b3300: 3d800280     	str	q0, [x20]
 45b3304: f9400fe8     	ldr	x8, [sp, #0x18]
 45b3308: f9041668     	str	x8, [x19, #0x828]
 45b330c: d1000509     	sub	x9, x8, #0x1
 45b3310: b1000d3f     	cmn	x9, #0x3
 45b3314: 54fffdc8     	b.hi	0x45b32cc <_ChromeMain+0x45ae030>
 45b3318: 52800029     	mov	w9, #0x1                ; =1
 45b331c: b8e90108     	ldaddal	w9, w8, [x8]
 45b3320: 17ffffeb     	b	0x45b32cc <_ChromeMain+0x45ae030>
 45b3324: 12800009     	mov	w9, #-0x1               ; =-1
 45b3328: b8e90108     	ldaddal	w9, w8, [x8]
 45b332c: 7100051f     	cmp	w8, #0x1
 45b3330: 54fff241     	b.ne	0x45b3178 <_ChromeMain+0x45adedc>
 45b3334: f9400fe0     	ldr	x0, [sp, #0x18]
 45b3338: 96ebbd2f     	bl	0xa27f4 <_ChromeMain+0x9d558>
 45b333c: 17ffff8f     	b	0x45b3178 <_ChromeMain+0x45adedc>
 45b3340: 12800009     	mov	w9, #-0x1               ; =-1
 45b3344: b8e90108     	ldaddal	w9, w8, [x8]
 45b3348: 7100051f     	cmp	w8, #0x1
 45b334c: 54fffd81     	b.ne	0x45b32fc <_ChromeMain+0x45ae060>
 45b3350: f9441660     	ldr	x0, [x19, #0x828]
 45b3354: 96ebbd28     	bl	0xa27f4 <_ChromeMain+0x9d558>
 45b3358: 17ffffe9     	b	0x45b32fc <_ChromeMain+0x45ae060>
 45b335c: d4200020     	brk	#0x1
 45b3360: 52800029     	mov	w9, #0x1                ; =1
 45b3364: b8e90108     	ldaddal	w9, w8, [x8]
 45b3368: 17ffffd7     	b	0x45b32c4 <_ChromeMain+0x45ae028>
