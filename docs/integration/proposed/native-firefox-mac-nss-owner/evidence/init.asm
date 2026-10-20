
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46bff58: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 46bff5c: a90167fa     	stp	x26, x25, [sp, #0x10]
 46bff60: a9025ff8     	stp	x24, x23, [sp, #0x20]
 46bff64: a90357f6     	stp	x22, x21, [sp, #0x30]
 46bff68: a9044ff4     	stp	x20, x19, [sp, #0x40]
 46bff6c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 46bff70: 910143fd     	add	x29, sp, #0x50
 46bff74: d10743ff     	sub	sp, sp, #0x1d0
 46bff78: aa0203f5     	mov	x21, x2
 46bff7c: aa0103f6     	mov	x22, x1
 46bff80: aa0003f3     	mov	x19, x0
 46bff84: 3941a008     	ldrb	w8, [x0, #0x68]
 46bff88: 34000088     	cbz	w8, 0x46bff98 <_ChromeMain+0x46bacfc>
 46bff8c: f9400668     	ldr	x8, [x19, #0x8]
 46bff90: b4000048     	cbz	x8, 0x46bff98 <_ChromeMain+0x46bacfc>
 46bff94: d63f0100     	blr	x8
 46bff98: 3901a27f     	strb	wzr, [x19, #0x68]
 46bff9c: f9402660     	ldr	x0, [x19, #0x48]
 46bffa0: b5000d40     	cbnz	x0, 0x46c0148 <_ChromeMain+0x46baeac>
 46bffa4: f9402260     	ldr	x0, [x19, #0x40]
 46bffa8: b5000d80     	cbnz	x0, 0x46c0158 <_ChromeMain+0x46baebc>
 46bffac: f9401e60     	ldr	x0, [x19, #0x38]
 46bffb0: b5000d00     	cbnz	x0, 0x46c0150 <_ChromeMain+0x46baeb4>
 46bffb4: 6f00e400     	movi.2d	v0, #0000000000000000
 46bffb8: ad018260     	stp	q0, q0, [x19, #0x30]
 46bffbc: 91014278     	add	x24, x19, #0x50
 46bffc0: ad008260     	stp	q0, q0, [x19, #0x10]
 46bffc4: 3d800260     	str	q0, [x19]
 46bffc8: 91014260     	add	x0, x19, #0x50
 46bffcc: 97f037aa     	bl	0x42cde74 <_ChromeMain+0x42c8bd8>
 46bffd0: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 46bffd4: f81703bf     	stur	xzr, [x29, #-0x90]
 46bffd8: b0048161     	adrp	x1, 0xd6ec000 <dyld_stub_binder+0xd6ec000>
 46bffdc: 910e9021     	add	x1, x1, #0x3a4
 46bffe0: d10283b7     	sub	x23, x29, #0xa0
 46bffe4: d10283a8     	sub	x8, x29, #0xa0
 46bffe8: aa1603e0     	mov	x0, x22
 46bffec: 52800202     	mov	w2, #0x10               ; =16
 46bfff0: 973f6509     	bl	0x1699414 <_ChromeMain+0x1694178>
 46bfff4: a934ffbf     	stp	xzr, xzr, [x29, #-0xb8]
 46bfff8: f81583bf     	stur	xzr, [x29, #-0xa8]
 46bfffc: b0048161     	adrp	x1, 0xd6ec000 <dyld_stub_binder+0xd6ec000>
 46c0000: 910ed421     	add	x1, x1, #0x3b5
 46c0004: d102e3b4     	sub	x20, x29, #0xb8
 46c0008: d102e3a8     	sub	x8, x29, #0xb8
 46c000c: aa1603e0     	mov	x0, x22
 46c0010: 528001a2     	mov	w2, #0xd                ; =13
 46c0014: 973f6500     	bl	0x1699414 <_ChromeMain+0x1694178>
 46c0018: a9337fbf     	stp	xzr, xzr, [x29, #-0xd0]
 46c001c: f81403bf     	stur	xzr, [x29, #-0xc0]
 46c0020: 90048161     	adrp	x1, 0xd6ec000 <dyld_stub_binder+0xd6ec000>
 46c0024: 910f0c21     	add	x1, x1, #0x3c3
 46c0028: d10343a8     	sub	x8, x29, #0xd0
 46c002c: aa1603e0     	mov	x0, x22
 46c0030: 52800222     	mov	w2, #0x11               ; =17
 46c0034: 973f64f8     	bl	0x1699414 <_ChromeMain+0x1694178>
 46c0038: 6f00e400     	movi.2d	v0, #0000000000000000
 46c003c: ad0103e0     	stp	q0, q0, [sp, #0x20]
 46c0040: ad0003e0     	stp	q0, q0, [sp]
 46c0044: 90049620     	adrp	x0, 0xd984000 <dyld_stub_binder+0xd984000>
 46c0048: 911a9800     	add	x0, x0, #0x6a6
 46c004c: d004a541     	adrp	x1, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 46c0050: 91311421     	add	x1, x1, #0xc45
 46c0054: d10203a8     	sub	x8, x29, #0x80
 46c0058: 52804fa2     	mov	w2, #0x27d              ; =637
 46c005c: 96e64309     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 46c0060: 910003e0     	mov	x0, sp
 46c0064: d10203a1     	sub	x1, x29, #0x80
 46c0068: 52800002     	mov	w2, #0x0                ; =0
 46c006c: 97074566     	bl	0x891604 <_ChromeMain+0x88c368>
 46c0070: 38d773a8     	ldursb	w8, [x29, #-0x89]
 46c0074: f85603a9     	ldur	x9, [x29, #-0xa0]
 46c0078: 7100011f     	cmp	w8, #0x0
 46c007c: 9a974120     	csel	x0, x9, x23, mi
 46c0080: 52800001     	mov	w1, #0x0                ; =0
 46c0084: 95634723     	bl	0x9f91d10 <_ChromeMain+0x9f8ca74>
 46c0088: aa0003f6     	mov	x22, x0
 46c008c: 910003e0     	mov	x0, sp
 46c0090: 970ebabd     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 46c0094: 34000936     	cbz	w22, 0x46c01b8 <_ChromeMain+0x46baf1c>
 46c0098: 52800016     	mov	w22, #0x0               ; =0
 46c009c: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 46c00a0: 37f806c8     	tbnz	w8, #0x1f, 0x46c0178 <_ChromeMain+0x46baedc>
 46c00a4: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 46c00a8: 37f80728     	tbnz	w8, #0x1f, 0x46c018c <_ChromeMain+0x46baef0>
 46c00ac: 38d773a8     	ldursb	w8, [x29, #-0x89]
 46c00b0: 37f80788     	tbnz	w8, #0x1f, 0x46c01a0 <_ChromeMain+0x46baf04>
 46c00b4: 34000156     	cbz	w22, 0x46c00dc <_ChromeMain+0x46bae40>
 46c00b8: 39819e68     	ldrsb	x8, [x19, #0x67]
 46c00bc: b7f85228     	tbnz	x8, #0x3f, 0x46c0b00 <_ChromeMain+0x46bb864>
 46c00c0: b50000e8     	cbnz	x8, 0x46c00dc <_ChromeMain+0x46bae40>
 46c00c4: d0045060     	adrp	x0, 0xd0ce000 <dyld_stub_binder+0xd0ce000>
 46c00c8: 91178c00     	add	x0, x0, #0x5e3
 46c00cc: 91014262     	add	x2, x19, #0x50
 46c00d0: 52800141     	mov	w1, #0xa                ; =10
 46c00d4: 97a723ff     	bl	0x30890d0 <_ChromeMain+0x3083e34>
 46c00d8: 35000f80     	cbnz	w0, 0x46c02c8 <_ChromeMain+0x46bb02c>
 46c00dc: 3941a268     	ldrb	w8, [x19, #0x68]
 46c00e0: 34000088     	cbz	w8, 0x46c00f0 <_ChromeMain+0x46bae54>
 46c00e4: f9400668     	ldr	x8, [x19, #0x8]
 46c00e8: b4000048     	cbz	x8, 0x46c00f0 <_ChromeMain+0x46bae54>
 46c00ec: d63f0100     	blr	x8
 46c00f0: 3901a27f     	strb	wzr, [x19, #0x68]
 46c00f4: f9402660     	ldr	x0, [x19, #0x48]
 46c00f8: b5000340     	cbnz	x0, 0x46c0160 <_ChromeMain+0x46baec4>
 46c00fc: f9402260     	ldr	x0, [x19, #0x40]
 46c0100: b5000340     	cbnz	x0, 0x46c0168 <_ChromeMain+0x46baecc>
 46c0104: f9401e60     	ldr	x0, [x19, #0x38]
 46c0108: b5000340     	cbnz	x0, 0x46c0170 <_ChromeMain+0x46baed4>
 46c010c: 6f00e400     	movi.2d	v0, #0000000000000000
 46c0110: ad018260     	stp	q0, q0, [x19, #0x30]
 46c0114: ad008260     	stp	q0, q0, [x19, #0x10]
 46c0118: 3d800260     	str	q0, [x19]
 46c011c: aa1803e0     	mov	x0, x24
 46c0120: 97f03755     	bl	0x42cde74 <_ChromeMain+0x42c8bd8>
 46c0124: 52800000     	mov	w0, #0x0                ; =0
 46c0128: 910743ff     	add	sp, sp, #0x1d0
 46c012c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 46c0130: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 46c0134: a94357f6     	ldp	x22, x21, [sp, #0x30]
 46c0138: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 46c013c: a94167fa     	ldp	x26, x25, [sp, #0x10]
 46c0140: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 46c0144: d65f03c0     	ret
 46c0148: 95052aa2     	bl	0x880abd0 <_ChromeMain+0x8805934>
 46c014c: 17ffff96     	b	0x46bffa4 <_ChromeMain+0x46bad08>
 46c0150: 95052aa0     	bl	0x880abd0 <_ChromeMain+0x8805934>
 46c0154: 17ffff98     	b	0x46bffb4 <_ChromeMain+0x46bad18>
 46c0158: 95052a9e     	bl	0x880abd0 <_ChromeMain+0x8805934>
 46c015c: 17ffff94     	b	0x46bffac <_ChromeMain+0x46bad10>
 46c0160: 95052a9c     	bl	0x880abd0 <_ChromeMain+0x8805934>
 46c0164: 17ffffe6     	b	0x46c00fc <_ChromeMain+0x46bae60>
 46c0168: 95052a9a     	bl	0x880abd0 <_ChromeMain+0x8805934>
 46c016c: 17ffffe6     	b	0x46c0104 <_ChromeMain+0x46bae68>
 46c0170: 95052a98     	bl	0x880abd0 <_ChromeMain+0x8805934>
 46c0174: 17ffffe6     	b	0x46c010c <_ChromeMain+0x46bae70>
 46c0178: f85303a0     	ldur	x0, [x29, #-0xd0]
 46c017c: f85403a8     	ldur	x8, [x29, #-0xc0]
 46c0180: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c0184: 96e5234d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c0188: 17ffffc7     	b	0x46c00a4 <_ChromeMain+0x46bae08>
 46c018c: f85483a0     	ldur	x0, [x29, #-0xb8]
 46c0190: f85583a8     	ldur	x8, [x29, #-0xa8]
 46c0194: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c0198: 96e52348     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c019c: 17ffffc4     	b	0x46c00ac <_ChromeMain+0x46bae10>
 46c01a0: f85603a0     	ldur	x0, [x29, #-0xa0]
 46c01a4: f85703a8     	ldur	x8, [x29, #-0x90]
 46c01a8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c01ac: 96e52343     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c01b0: 35fff856     	cbnz	w22, 0x46c00b8 <_ChromeMain+0x46bae1c>
 46c01b4: 17ffffca     	b	0x46c00dc <_ChromeMain+0x46bae40>
 46c01b8: 6f00e400     	movi.2d	v0, #0000000000000000
 46c01bc: ad0103e0     	stp	q0, q0, [sp, #0x20]
 46c01c0: ad0003e0     	stp	q0, q0, [sp]
 46c01c4: 90049620     	adrp	x0, 0xd984000 <dyld_stub_binder+0xd984000>
 46c01c8: 911a9800     	add	x0, x0, #0x6a6
 46c01cc: d004a541     	adrp	x1, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 46c01d0: 91311421     	add	x1, x1, #0xc45
 46c01d4: d10203a8     	sub	x8, x29, #0x80
 46c01d8: 52804fa2     	mov	w2, #0x27d              ; =637
 46c01dc: 96e642a9     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 46c01e0: 910003e0     	mov	x0, sp
 46c01e4: d10203a1     	sub	x1, x29, #0x80
 46c01e8: 52800002     	mov	w2, #0x0                ; =0
 46c01ec: 97074506     	bl	0x891604 <_ChromeMain+0x88c368>
 46c01f0: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 46c01f4: f85483a9     	ldur	x9, [x29, #-0xb8]
 46c01f8: 7100011f     	cmp	w8, #0x0
 46c01fc: 9a944120     	csel	x0, x9, x20, mi
 46c0200: 52800001     	mov	w1, #0x0                ; =0
 46c0204: 956346c3     	bl	0x9f91d10 <_ChromeMain+0x9f8ca74>
 46c0208: aa0003f6     	mov	x22, x0
 46c020c: 910003e0     	mov	x0, sp
 46c0210: 970eba5d     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 46c0214: 35fff436     	cbnz	w22, 0x46c0098 <_ChromeMain+0x46badfc>
 46c0218: a931ffbf     	stp	xzr, xzr, [x29, #-0xe8]
 46c021c: f81283bf     	stur	xzr, [x29, #-0xd8]
 46c0220: d10283a0     	sub	x0, x29, #0xa0
 46c0224: d103a3a1     	sub	x1, x29, #0xe8
 46c0228: 9798849c     	bl	0x2ce1498 <_ChromeMain+0x2cdc1fc>
 46c022c: d103a3b4     	sub	x20, x29, #0xe8
 46c0230: f9001e60     	str	x0, [x19, #0x38]
 46c0234: b4002820     	cbz	x0, 0x46c0738 <_ChromeMain+0x46bb49c>
 46c0238: d102e3a0     	sub	x0, x29, #0xb8
 46c023c: d103a3a1     	sub	x1, x29, #0xe8
 46c0240: 97988496     	bl	0x2ce1498 <_ChromeMain+0x2cdc1fc>
 46c0244: f9002260     	str	x0, [x19, #0x40]
 46c0248: b4002260     	cbz	x0, 0x46c0694 <_ChromeMain+0x46bb3f8>
 46c024c: 6f00e400     	movi.2d	v0, #0000000000000000
 46c0250: ad0103e0     	stp	q0, q0, [sp, #0x20]
 46c0254: ad0003e0     	stp	q0, q0, [sp]
 46c0258: 90049620     	adrp	x0, 0xd984000 <dyld_stub_binder+0xd984000>
 46c025c: 911a9800     	add	x0, x0, #0x6a6
 46c0260: d004a541     	adrp	x1, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 46c0264: 91311421     	add	x1, x1, #0xc45
 46c0268: d10203a8     	sub	x8, x29, #0x80
 46c026c: 52804fa2     	mov	w2, #0x27d              ; =637
 46c0270: 96e64284     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 46c0274: 910003e0     	mov	x0, sp
 46c0278: d10203a1     	sub	x1, x29, #0x80
 46c027c: 52800002     	mov	w2, #0x0                ; =0
 46c0280: 970744e1     	bl	0x891604 <_ChromeMain+0x88c368>
 46c0284: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 46c0288: f85303a9     	ldur	x9, [x29, #-0xd0]
 46c028c: 7100011f     	cmp	w8, #0x0
 46c0290: d10343a8     	sub	x8, x29, #0xd0
 46c0294: 9a884120     	csel	x0, x9, x8, mi
 46c0298: 52800001     	mov	w1, #0x0                ; =0
 46c029c: 9563469d     	bl	0x9f91d10 <_ChromeMain+0x9f8ca74>
 46c02a0: aa0003f6     	mov	x22, x0
 46c02a4: 910003e0     	mov	x0, sp
 46c02a8: 970eba37     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 46c02ac: 34002a76     	cbz	w22, 0x46c07f8 <_ChromeMain+0x46bb55c>
 46c02b0: 52800036     	mov	w22, #0x1               ; =1
 46c02b4: 1400014a     	b	0x46c07dc <_ChromeMain+0x46bb540>
 46c02b8: a9450a61     	ldp	x1, x2, [x19, #0x50]
 46c02bc: d10283a0     	sub	x0, x29, #0xa0
 46c02c0: 96e55fd6     	bl	0x18218 <_ChromeMain+0x12f7c>
 46c02c4: 14000009     	b	0x46c02e8 <_ChromeMain+0x46bb04c>
 46c02c8: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 46c02cc: f81703bf     	stur	xzr, [x29, #-0x90]
 46c02d0: 39c19e68     	ldrsb	w8, [x19, #0x67]
 46c02d4: 37ffff28     	tbnz	w8, #0x1f, 0x46c02b8 <_ChromeMain+0x46bb01c>
 46c02d8: 3dc00300     	ldr	q0, [x24]
 46c02dc: 3c9603a0     	stur	q0, [x29, #-0xa0]
 46c02e0: f9400b08     	ldr	x8, [x24, #0x10]
 46c02e4: f81703a8     	stur	x8, [x29, #-0x90]
 46c02e8: d2800019     	mov	x25, #0x0               ; =0
 46c02ec: b005213a     	adrp	x26, 0xeae5000 <dyld_stub_binder+0xeae5000>
 46c02f0: 910c435a     	add	x26, x26, #0x310
 46c02f4: d102e3bb     	sub	x27, x29, #0xb8
 46c02f8: d28d6e1c     	mov	x28, #0x6b70            ; =27504
 46c02fc: f2ae6c7c     	movk	x28, #0x7363, lsl #16
 46c0300: f2c6263c     	movk	x28, #0x3131, lsl #32
 46c0304: f2ee85dc     	movk	x28, #0x742e, lsl #48
 46c0308: 528e8f14     	mov	w20, #0x7478            ; =29816
 46c030c: 90049636     	adrp	x22, 0xd984000 <dyld_stub_binder+0xd984000>
 46c0310: 911a9ad6     	add	x22, x22, #0x6a6
 46c0314: d004a557     	adrp	x23, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 46c0318: 913116f7     	add	x23, x23, #0xc45
 46c031c: 1400003e     	b	0x46c0414 <_ChromeMain+0x46bb178>
 46c0320: f85483a0     	ldur	x0, [x29, #-0xb8]
 46c0324: f85583a8     	ldur	x8, [x29, #-0xa8]
 46c0328: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c032c: 96e522e3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c0330: 36000358     	tbz	w24, #0x0, 0x46c0398 <_ChromeMain+0x46bb0fc>
 46c0334: 14000035     	b	0x46c0408 <_ChromeMain+0x46bb16c>
 46c0338: f85303a0     	ldur	x0, [x29, #-0xd0]
 46c033c: f85403a8     	ldur	x8, [x29, #-0xc0]
 46c0340: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c0344: 96e522dd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c0348: 14000011     	b	0x46c038c <_ChromeMain+0x46bb0f0>
 46c034c: f85303a0     	ldur	x0, [x29, #-0xd0]
 46c0350: f85403a8     	ldur	x8, [x29, #-0xc0]
 46c0354: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c0358: 96e522d8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c035c: 14000029     	b	0x46c0400 <_ChromeMain+0x46bb164>
 46c0360: f85483a0     	ldur	x0, [x29, #-0xb8]
 46c0364: f85583a8     	ldur	x8, [x29, #-0xa8]
 46c0368: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c036c: 96e522d3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c0370: 14000026     	b	0x46c0408 <_ChromeMain+0x46bb16c>
 46c0374: d102e3a0     	sub	x0, x29, #0xb8
 46c0378: d10343a1     	sub	x1, x29, #0xd0
 46c037c: 95052991     	bl	0x880a9c0 <_ChromeMain+0x8805724>
 46c0380: aa0003f8     	mov	x24, x0
 46c0384: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 46c0388: 37fffd88     	tbnz	w8, #0x1f, 0x46c0338 <_ChromeMain+0x46bb09c>
 46c038c: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 46c0390: 37fffc88     	tbnz	w8, #0x1f, 0x46c0320 <_ChromeMain+0x46bb084>
 46c0394: 370003b8     	tbnz	w24, #0x0, 0x46c0408 <_ChromeMain+0x46bb16c>
 46c0398: 52800014     	mov	w20, #0x0               ; =0
 46c039c: 14000088     	b	0x46c05bc <_ChromeMain+0x46bb320>
 46c03a0: 6f00e400     	movi.2d	v0, #0000000000000000
 46c03a4: ad0103e0     	stp	q0, q0, [sp, #0x20]
 46c03a8: ad0003e0     	stp	q0, q0, [sp]
 46c03ac: d10203a8     	sub	x8, x29, #0x80
 46c03b0: aa1603e0     	mov	x0, x22
 46c03b4: aa1703e1     	mov	x1, x23
 46c03b8: 52804fa2     	mov	w2, #0x27d              ; =637
 46c03bc: 96e64231     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 46c03c0: 910003e0     	mov	x0, sp
 46c03c4: d10203a1     	sub	x1, x29, #0x80
 46c03c8: 52800002     	mov	w2, #0x0                ; =0
 46c03cc: 9707448e     	bl	0x891604 <_ChromeMain+0x88c368>
 46c03d0: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 46c03d4: f85483a9     	ldur	x9, [x29, #-0xb8]
 46c03d8: 7100011f     	cmp	w8, #0x0
 46c03dc: 9a9b4120     	csel	x0, x9, x27, mi
 46c03e0: 52800001     	mov	w1, #0x0                ; =0
 46c03e4: 9563464b     	bl	0x9f91d10 <_ChromeMain+0x9f8ca74>
 46c03e8: aa0003f8     	mov	x24, x0
 46c03ec: 910003e0     	mov	x0, sp
 46c03f0: 970eb9e5     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 46c03f4: 34fffc18     	cbz	w24, 0x46c0374 <_ChromeMain+0x46bb0d8>
 46c03f8: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 46c03fc: 37fffa88     	tbnz	w8, #0x1f, 0x46c034c <_ChromeMain+0x46bb0b0>
 46c0400: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 46c0404: 37fffae8     	tbnz	w8, #0x1f, 0x46c0360 <_ChromeMain+0x46bb0c4>
 46c0408: 91002339     	add	x25, x25, #0x8
 46c040c: f100c33f     	cmp	x25, #0x30
 46c0410: 54000d40     	b.eq	0x46c05b8 <_ChromeMain+0x46bb31c>
 46c0414: f8796b58     	ldr	x24, [x26, x25]
 46c0418: a934ffbf     	stp	xzr, xzr, [x29, #-0xb8]
 46c041c: f81583bf     	stur	xzr, [x29, #-0xa8]
 46c0420: b4001398     	cbz	x24, 0x46c0690 <_ChromeMain+0x46bb3f4>
 46c0424: aa1803e0     	mov	x0, x24
 46c0428: 94e50bdd     	bl	0x800339c <_ChromeMain+0x7ffe100>
 46c042c: aa0003e2     	mov	x2, x0
 46c0430: d102e3a8     	sub	x8, x29, #0xb8
 46c0434: aa1503e0     	mov	x0, x21
 46c0438: aa1803e1     	mov	x1, x24
 46c043c: 973f63f6     	bl	0x1699414 <_ChromeMain+0x1694178>
 46c0440: a9337fbf     	stp	xzr, xzr, [x29, #-0xd0]
 46c0444: f81403bf     	stur	xzr, [x29, #-0xc0]
 46c0448: aa1803e0     	mov	x0, x24
 46c044c: 94e50bd4     	bl	0x800339c <_ChromeMain+0x7ffe100>
 46c0450: aa0003e2     	mov	x2, x0
 46c0454: d10343a8     	sub	x8, x29, #0xd0
 46c0458: d10283a0     	sub	x0, x29, #0xa0
 46c045c: aa1803e1     	mov	x1, x24
 46c0460: 973f63ed     	bl	0x1699414 <_ChromeMain+0x1694178>
 46c0464: aa1803e0     	mov	x0, x24
 46c0468: 94e50bcd     	bl	0x800339c <_ChromeMain+0x7ffe100>
 46c046c: f100281f     	cmp	x0, #0xa
 46c0470: 54fff981     	b.ne	0x46c03a0 <_ChromeMain+0x46bb104>
 46c0474: f9400308     	ldr	x8, [x24]
 46c0478: 79401309     	ldrh	w9, [x24, #0x8]
 46c047c: eb1c011f     	cmp	x8, x28
 46c0480: 7a540120     	ccmp	w9, w20, #0x0, eq
 46c0484: 54fff8e1     	b.ne	0x46c03a0 <_ChromeMain+0x46bb104>
 46c0488: 6f00e400     	movi.2d	v0, #0000000000000000
 46c048c: ad0103e0     	stp	q0, q0, [sp, #0x20]
 46c0490: ad0003e0     	stp	q0, q0, [sp]
 46c0494: d10203a8     	sub	x8, x29, #0x80
 46c0498: aa1603e0     	mov	x0, x22
 46c049c: aa1703e1     	mov	x1, x23
 46c04a0: 52804fa2     	mov	w2, #0x27d              ; =637
 46c04a4: 96e641f7     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 46c04a8: 910003e0     	mov	x0, sp
 46c04ac: d10203a1     	sub	x1, x29, #0x80
 46c04b0: 52800002     	mov	w2, #0x0                ; =0
 46c04b4: 97074454     	bl	0x891604 <_ChromeMain+0x88c368>
 46c04b8: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 46c04bc: f85483a9     	ldur	x9, [x29, #-0xb8]
 46c04c0: 7100011f     	cmp	w8, #0x0
 46c04c4: 9a9b4120     	csel	x0, x9, x27, mi
 46c04c8: 52800001     	mov	w1, #0x0                ; =0
 46c04cc: 95634611     	bl	0x9f91d10 <_ChromeMain+0x9f8ca74>
 46c04d0: aa0003f8     	mov	x24, x0
 46c04d4: 910003e0     	mov	x0, sp
 46c04d8: 970eb9ab     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 46c04dc: 35fff8f8     	cbnz	w24, 0x46c03f8 <_ChromeMain+0x46bb15c>
 46c04e0: a9007fff     	stp	xzr, xzr, [sp]
 46c04e4: f9000bff     	str	xzr, [sp, #0x10]
 46c04e8: d102e3a0     	sub	x0, x29, #0xb8
 46c04ec: 910003e1     	mov	x1, sp
 46c04f0: 92800002     	mov	x2, #-0x1               ; =-1
 46c04f4: 976349a5     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 46c04f8: 35000240     	cbnz	w0, 0x46c0540 <_ChromeMain+0x46bb2a4>
 46c04fc: 52800018     	mov	w24, #0x0               ; =0
 46c0500: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 46c0504: 37f800e8     	tbnz	w8, #0x1f, 0x46c0520 <_ChromeMain+0x46bb284>
 46c0508: 3707f798     	tbnz	w24, #0x0, 0x46c03f8 <_ChromeMain+0x46bb15c>
 46c050c: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 46c0510: 37f82628     	tbnz	w8, #0x1f, 0x46c09d4 <_ChromeMain+0x46bb738>
 46c0514: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 46c0518: 37f82688     	tbnz	w8, #0x1f, 0x46c09e8 <_ChromeMain+0x46bb74c>
 46c051c: 17ffff9f     	b	0x46c0398 <_ChromeMain+0x46bb0fc>
 46c0520: f94003e0     	ldr	x0, [sp]
 46c0524: f9400be8     	ldr	x8, [sp, #0x10]
 46c0528: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c052c: 96e52263     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c0530: 3707f658     	tbnz	w24, #0x0, 0x46c03f8 <_ChromeMain+0x46bb15c>
 46c0534: 17fffff6     	b	0x46c050c <_ChromeMain+0x46bb270>
 46c0538: a9400ea2     	ldp	x2, x3, [x21]
 46c053c: 14000004     	b	0x46c054c <_ChromeMain+0x46bb2b0>
 46c0540: 39805ea3     	ldrsb	x3, [x21, #0x17]
 46c0544: b7ffffa3     	tbnz	x3, #0x3f, 0x46c0538 <_ChromeMain+0x46bb29c>
 46c0548: aa1503e2     	mov	x2, x21
 46c054c: 389773a8     	ldursb	x8, [x29, #-0x89]
 46c0550: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 46c0554: f100011f     	cmp	x8, #0x0
 46c0558: d10283ab     	sub	x11, x29, #0xa0
 46c055c: 9a8b4124     	csel	x4, x9, x11, mi
 46c0560: 7100011f     	cmp	w8, #0x0
 46c0564: 9a884145     	csel	x5, x10, x8, mi
 46c0568: 910003e0     	mov	x0, sp
 46c056c: d2800001     	mov	x1, #0x0                ; =0
 46c0570: 52800006     	mov	w6, #0x0                ; =0
 46c0574: 974e4af7     	bl	0x1a53150 <_ChromeMain+0x1a4deb4>
 46c0578: 39805fe8     	ldrsb	x8, [sp, #0x17]
 46c057c: a9402be9     	ldp	x9, x10, [sp]
 46c0580: f100011f     	cmp	x8, #0x0
 46c0584: 910003eb     	mov	x11, sp
 46c0588: 9a8b4121     	csel	x1, x9, x11, mi
 46c058c: 7100011f     	cmp	w8, #0x0
 46c0590: 9a884142     	csel	x2, x10, x8, mi
 46c0594: d10343a0     	sub	x0, x29, #0xd0
 46c0598: 976b2f8a     	bl	0x218c3c0 <_ChromeMain+0x2187124>
 46c059c: aa0003f8     	mov	x24, x0
 46c05a0: 17ffffd8     	b	0x46c0500 <_ChromeMain+0x46bb264>
 46c05a4: f85603a0     	ldur	x0, [x29, #-0xa0]
 46c05a8: f85703a8     	ldur	x8, [x29, #-0x90]
 46c05ac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c05b0: 96e52242     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c05b4: 14000004     	b	0x46c05c4 <_ChromeMain+0x46bb328>
 46c05b8: 52800034     	mov	w20, #0x1               ; =1
 46c05bc: 38d773a8     	ldursb	w8, [x29, #-0x89]
 46c05c0: 37ffff28     	tbnz	w8, #0x1f, 0x46c05a4 <_ChromeMain+0x46bb308>
 46c05c4: 91014278     	add	x24, x19, #0x50
 46c05c8: 34ffd8b4     	cbz	w20, 0x46c00dc <_ChromeMain+0x46bae40>
 46c05cc: f9402260     	ldr	x0, [x19, #0x40]
 46c05d0: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c05d4: 910ff421     	add	x1, x1, #0x3fd
 46c05d8: 9780e429     	bl	0x26f967c <_ChromeMain+0x26f43e0>
 46c05dc: f9000260     	str	x0, [x19]
 46c05e0: f9402260     	ldr	x0, [x19, #0x40]
 46c05e4: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c05e8: 91101821     	add	x1, x1, #0x406
 46c05ec: 9780e424     	bl	0x26f967c <_ChromeMain+0x26f43e0>
 46c05f0: f9000660     	str	x0, [x19, #0x8]
 46c05f4: f9402260     	ldr	x0, [x19, #0x40]
 46c05f8: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c05fc: 91104c21     	add	x1, x1, #0x413
 46c0600: 9780e41f     	bl	0x26f967c <_ChromeMain+0x26f43e0>
 46c0604: f9000a60     	str	x0, [x19, #0x10]
 46c0608: f9402260     	ldr	x0, [x19, #0x40]
 46c060c: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c0610: 9110ac21     	add	x1, x1, #0x42b
 46c0614: 9780e41a     	bl	0x26f967c <_ChromeMain+0x26f43e0>
 46c0618: f9000e60     	str	x0, [x19, #0x18]
 46c061c: f9402260     	ldr	x0, [x19, #0x40]
 46c0620: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c0624: 9110e421     	add	x1, x1, #0x439
 46c0628: 9780e415     	bl	0x26f967c <_ChromeMain+0x26f43e0>
 46c062c: f9001260     	str	x0, [x19, #0x20]
 46c0630: f9402260     	ldr	x0, [x19, #0x40]
 46c0634: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c0638: 91112c21     	add	x1, x1, #0x44b
 46c063c: 9780e410     	bl	0x26f967c <_ChromeMain+0x26f43e0>
 46c0640: f9001660     	str	x0, [x19, #0x28]
 46c0644: f9402260     	ldr	x0, [x19, #0x40]
 46c0648: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c064c: 91116c21     	add	x1, x1, #0x45b
 46c0650: 9780e40b     	bl	0x26f967c <_ChromeMain+0x26f43e0>
 46c0654: f9001a60     	str	x0, [x19, #0x30]
 46c0658: f9400268     	ldr	x8, [x19]
 46c065c: b4ffd408     	cbz	x8, 0x46c00dc <_ChromeMain+0x46bae40>
 46c0660: f9400668     	ldr	x8, [x19, #0x8]
 46c0664: b4ffd3c8     	cbz	x8, 0x46c00dc <_ChromeMain+0x46bae40>
 46c0668: f9400a68     	ldr	x8, [x19, #0x10]
 46c066c: b4ffd388     	cbz	x8, 0x46c00dc <_ChromeMain+0x46bae40>
 46c0670: f9400e68     	ldr	x8, [x19, #0x18]
 46c0674: b4ffd348     	cbz	x8, 0x46c00dc <_ChromeMain+0x46bae40>
 46c0678: f9401268     	ldr	x8, [x19, #0x20]
 46c067c: b4ffd308     	cbz	x8, 0x46c00dc <_ChromeMain+0x46bae40>
 46c0680: b4ffd2e0     	cbz	x0, 0x46c00dc <_ChromeMain+0x46bae40>
 46c0684: f9401668     	ldr	x8, [x19, #0x28]
 46c0688: b4ffd2a8     	cbz	x8, 0x46c00dc <_ChromeMain+0x46bae40>
 46c068c: 14000095     	b	0x46c08e0 <_ChromeMain+0x46bb644>
 46c0690: d4200020     	brk	#0x1
 46c0694: 90054248     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 46c0698: b940b108     	ldr	w8, [x8, #0xb0]
 46c069c: 7100091f     	cmp	w8, #0x2
 46c06a0: 540009cc     	b.gt	0x46c07d8 <_ChromeMain+0x46bb53c>
 46c06a4: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c06a8: 910d1021     	add	x1, x1, #0x344
 46c06ac: 910003f6     	mov	x22, sp
 46c06b0: 910003e0     	mov	x0, sp
 46c06b4: 52800ae2     	mov	w2, #0x57               ; =87
 46c06b8: 52800043     	mov	w3, #0x2                ; =2
 46c06bc: 96fd22a4     	bl	0x60914c <_ChromeMain+0x603eb0>
 46c06c0: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c06c4: 910e8021     	add	x1, x1, #0x3a0
 46c06c8: 910042c0     	add	x0, x22, #0x10
 46c06cc: 52800482     	mov	w2, #0x24               ; =36
 46c06d0: 96e5937b     	bl	0x254bc <_ChromeMain+0x20220>
 46c06d4: aa0003f6     	mov	x22, x0
 46c06d8: 38d2f3a8     	ldursb	w8, [x29, #-0xd1]
 46c06dc: 37f801e8     	tbnz	w8, #0x1f, 0x46c0718 <_ChromeMain+0x46bb47c>
 46c06e0: 3dc00280     	ldr	q0, [x20]
 46c06e4: 3c9803a0     	stur	q0, [x29, #-0x80]
 46c06e8: f85283a8     	ldur	x8, [x29, #-0xd8]
 46c06ec: f81903a8     	stur	x8, [x29, #-0x70]
 46c06f0: 389973a8     	ldursb	x8, [x29, #-0x69]
 46c06f4: d10203a9     	sub	x9, x29, #0x80
 46c06f8: a9782faa     	ldp	x10, x11, [x29, #-0x80]
 46c06fc: f100011f     	cmp	x8, #0x0
 46c0700: 9a894141     	csel	x1, x10, x9, mi
 46c0704: 7100011f     	cmp	w8, #0x0
 46c0708: 9a884162     	csel	x2, x11, x8, mi
 46c070c: aa1603e0     	mov	x0, x22
 46c0710: 96e5936b     	bl	0x254bc <_ChromeMain+0x20220>
 46c0714: 14000029     	b	0x46c07b8 <_ChromeMain+0x46bb51c>
 46c0718: a9718ba1     	ldp	x1, x2, [x29, #-0xe8]
 46c071c: d10203a0     	sub	x0, x29, #0x80
 46c0720: 96e55ebe     	bl	0x18218 <_ChromeMain+0x12f7c>
 46c0724: 17fffff3     	b	0x46c06f0 <_ChromeMain+0x46bb454>
 46c0728: a9718ba1     	ldp	x1, x2, [x29, #-0xe8]
 46c072c: d10203a0     	sub	x0, x29, #0x80
 46c0730: 96e55eba     	bl	0x18218 <_ChromeMain+0x12f7c>
 46c0734: 14000018     	b	0x46c0794 <_ChromeMain+0x46bb4f8>
 46c0738: 90054248     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 46c073c: b940b108     	ldr	w8, [x8, #0xb0]
 46c0740: 7100091f     	cmp	w8, #0x2
 46c0744: 540004ac     	b.gt	0x46c07d8 <_ChromeMain+0x46bb53c>
 46c0748: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c074c: 910d1021     	add	x1, x1, #0x344
 46c0750: 910003f6     	mov	x22, sp
 46c0754: 910003e0     	mov	x0, sp
 46c0758: 52800a02     	mov	w2, #0x50               ; =80
 46c075c: 52800043     	mov	w3, #0x2                ; =2
 46c0760: 96fd227b     	bl	0x60914c <_ChromeMain+0x603eb0>
 46c0764: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c0768: 910ddc21     	add	x1, x1, #0x377
 46c076c: 910042c0     	add	x0, x22, #0x10
 46c0770: 52800502     	mov	w2, #0x28               ; =40
 46c0774: 96e59352     	bl	0x254bc <_ChromeMain+0x20220>
 46c0778: aa0003f6     	mov	x22, x0
 46c077c: 38d2f3a8     	ldursb	w8, [x29, #-0xd1]
 46c0780: 37fffd48     	tbnz	w8, #0x1f, 0x46c0728 <_ChromeMain+0x46bb48c>
 46c0784: 3dc00280     	ldr	q0, [x20]
 46c0788: 3c9803a0     	stur	q0, [x29, #-0x80]
 46c078c: f85283a8     	ldur	x8, [x29, #-0xd8]
 46c0790: f81903a8     	stur	x8, [x29, #-0x70]
 46c0794: 389973a8     	ldursb	x8, [x29, #-0x69]
 46c0798: d10203a9     	sub	x9, x29, #0x80
 46c079c: a9782faa     	ldp	x10, x11, [x29, #-0x80]
 46c07a0: f100011f     	cmp	x8, #0x0
 46c07a4: 9a894141     	csel	x1, x10, x9, mi
 46c07a8: 7100011f     	cmp	w8, #0x0
 46c07ac: 9a884162     	csel	x2, x11, x8, mi
 46c07b0: aa1603e0     	mov	x0, x22
 46c07b4: 96e59342     	bl	0x254bc <_ChromeMain+0x20220>
 46c07b8: 38d973a8     	ldursb	w8, [x29, #-0x69]
 46c07bc: 36f800a8     	tbz	w8, #0x1f, 0x46c07d0 <_ChromeMain+0x46bb534>
 46c07c0: f85803a0     	ldur	x0, [x29, #-0x80]
 46c07c4: f85903a8     	ldur	x8, [x29, #-0x70]
 46c07c8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c07cc: 96e521bb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c07d0: 910003e0     	mov	x0, sp
 46c07d4: 96fd222b     	bl	0x609080 <_ChromeMain+0x603de4>
 46c07d8: 52800016     	mov	w22, #0x0               ; =0
 46c07dc: 38d2f3a8     	ldursb	w8, [x29, #-0xd1]
 46c07e0: 36ffc5e8     	tbz	w8, #0x1f, 0x46c009c <_ChromeMain+0x46bae00>
 46c07e4: f85183a0     	ldur	x0, [x29, #-0xe8]
 46c07e8: f85283a8     	ldur	x8, [x29, #-0xd8]
 46c07ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c07f0: 96e521b2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c07f4: 17fffe2a     	b	0x46c009c <_ChromeMain+0x46bae00>
 46c07f8: d10343a0     	sub	x0, x29, #0xd0
 46c07fc: d103a3a1     	sub	x1, x29, #0xe8
 46c0800: 97988326     	bl	0x2ce1498 <_ChromeMain+0x2cdc1fc>
 46c0804: f9002660     	str	x0, [x19, #0x48]
 46c0808: 52800036     	mov	w22, #0x1               ; =1
 46c080c: b5fffe80     	cbnz	x0, 0x46c07dc <_ChromeMain+0x46bb540>
 46c0810: 90054248     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 46c0814: b940b108     	ldr	w8, [x8, #0xb0]
 46c0818: 7100051f     	cmp	w8, #0x1
 46c081c: 54fffe0c     	b.gt	0x46c07dc <_ChromeMain+0x46bb540>
 46c0820: b0052788     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 46c0824: b94b8908     	ldr	w8, [x8, #0xb88]
 46c0828: 35000088     	cbnz	w8, 0x46c0838 <_ChromeMain+0x46bb59c>
 46c082c: 90054248     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 46c0830: f9405d08     	ldr	x8, [x8, #0xb8]
 46c0834: b4fffd48     	cbz	x8, 0x46c07dc <_ChromeMain+0x46bb540>
 46c0838: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c083c: 910d1021     	add	x1, x1, #0x344
 46c0840: 910003f6     	mov	x22, sp
 46c0844: 910003e0     	mov	x0, sp
 46c0848: 52800be2     	mov	w2, #0x5f               ; =95
 46c084c: 52800023     	mov	w3, #0x1                ; =1
 46c0850: 96fd223f     	bl	0x60914c <_ChromeMain+0x603eb0>
 46c0854: 9004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46c0858: 910f1421     	add	x1, x1, #0x3c5
 46c085c: 910042c0     	add	x0, x22, #0x10
 46c0860: 52800582     	mov	w2, #0x2c               ; =44
 46c0864: 96e59316     	bl	0x254bc <_ChromeMain+0x20220>
 46c0868: aa0003f6     	mov	x22, x0
 46c086c: 38d2f3a8     	ldursb	w8, [x29, #-0xd1]
 46c0870: 37f802e8     	tbnz	w8, #0x1f, 0x46c08cc <_ChromeMain+0x46bb630>
 46c0874: 3dc00280     	ldr	q0, [x20]
 46c0878: 3c9803a0     	stur	q0, [x29, #-0x80]
 46c087c: f85283a8     	ldur	x8, [x29, #-0xd8]
 46c0880: f81903a8     	stur	x8, [x29, #-0x70]
 46c0884: 389973a8     	ldursb	x8, [x29, #-0x69]
 46c0888: d10203a9     	sub	x9, x29, #0x80
 46c088c: a9782faa     	ldp	x10, x11, [x29, #-0x80]
 46c0890: f100011f     	cmp	x8, #0x0
 46c0894: 9a894141     	csel	x1, x10, x9, mi
 46c0898: 7100011f     	cmp	w8, #0x0
 46c089c: 9a884162     	csel	x2, x11, x8, mi
 46c08a0: aa1603e0     	mov	x0, x22
 46c08a4: 96e59306     	bl	0x254bc <_ChromeMain+0x20220>
 46c08a8: 38d973a8     	ldursb	w8, [x29, #-0x69]
 46c08ac: 36f800a8     	tbz	w8, #0x1f, 0x46c08c0 <_ChromeMain+0x46bb624>
 46c08b0: f85803a0     	ldur	x0, [x29, #-0x80]
 46c08b4: f85903a8     	ldur	x8, [x29, #-0x70]
 46c08b8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c08bc: 96e5217f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c08c0: 910003e0     	mov	x0, sp
 46c08c4: 96fd21ef     	bl	0x609080 <_ChromeMain+0x603de4>
 46c08c8: 17fffe7a     	b	0x46c02b0 <_ChromeMain+0x46bb014>
 46c08cc: a9718ba1     	ldp	x1, x2, [x29, #-0xe8]
 46c08d0: d10203a0     	sub	x0, x29, #0x80
 46c08d4: 96e55e51     	bl	0x18218 <_ChromeMain+0x12f7c>
 46c08d8: 17ffffeb     	b	0x46c0884 <_ChromeMain+0x46bb5e8>
 46c08dc: 14000058     	b	0x46c0a3c <_ChromeMain+0x46bb7a0>
 46c08e0: 52800088     	mov	w8, #0x4                ; =4
 46c08e4: 381973a8     	sturb	w8, [x29, #-0x69]
 46c08e8: d10203a8     	sub	x8, x29, #0x80
 46c08ec: b27e0109     	orr	x9, x8, #0x4
 46c08f0: 9004816a     	adrp	x10, 0xd6ec000 <dyld_stub_binder+0xd6ec000>
 46c08f4: 910f554a     	add	x10, x10, #0x3d5
 46c08f8: eb0a013f     	cmp	x9, x10
 46c08fc: fa4a8102     	ccmp	x8, x10, #0x2, hi
 46c0900: 54ffec89     	b.ls	0x46c0690 <_ChromeMain+0x46bb3f4>
 46c0904: 528e2e68     	mov	w8, #0x7173             ; =29043
 46c0908: 72a74d88     	movk	w8, #0x3a6c, lsl #16
 46c090c: b81803a8     	stur	w8, [x29, #-0x80]
 46c0910: 381843bf     	sturb	wzr, [x29, #-0x7c]
 46c0914: 39819e68     	ldrsb	x8, [x19, #0x67]
 46c0918: a9452a69     	ldp	x9, x10, [x19, #0x50]
 46c091c: f100011f     	cmp	x8, #0x0
 46c0920: 9a984121     	csel	x1, x9, x24, mi
 46c0924: 7100011f     	cmp	w8, #0x0
 46c0928: 9a884142     	csel	x2, x10, x8, mi
 46c092c: d10203a0     	sub	x0, x29, #0x80
 46c0930: 96e766bc     	bl	0x9a420 <_ChromeMain+0x95184>
 46c0934: 3dc00000     	ldr	q0, [x0]
 46c0938: f9400808     	ldr	x8, [x0, #0x10]
 46c093c: f9000be8     	str	x8, [sp, #0x10]
 46c0940: 3d8003e0     	str	q0, [sp]
 46c0944: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 46c0948: f900001f     	str	xzr, [x0]
 46c094c: 38d973a8     	ldursb	w8, [x29, #-0x69]
 46c0950: 36f800a8     	tbz	w8, #0x1f, 0x46c0964 <_ChromeMain+0x46bb6c8>
 46c0954: f85803a0     	ldur	x0, [x29, #-0x80]
 46c0958: f85903a8     	ldur	x8, [x29, #-0x70]
 46c095c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c0960: 96e52156     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c0964: f9400268     	ldr	x8, [x19]
 46c0968: 39c05fe9     	ldrsb	w9, [sp, #0x17]
 46c096c: f94003ea     	ldr	x10, [sp]
 46c0970: 7100013f     	cmp	w9, #0x0
 46c0974: 910003e9     	mov	x9, sp
 46c0978: 9a894140     	csel	x0, x10, x9, mi
 46c097c: d63f0100     	blr	x8
 46c0980: 34000140     	cbz	w0, 0x46c09a8 <_ChromeMain+0x46bb70c>
 46c0984: f9400268     	ldr	x8, [x19]
 46c0988: 39c19e69     	ldrsb	w9, [x19, #0x67]
 46c098c: f9402a6a     	ldr	x10, [x19, #0x50]
 46c0990: 7100013f     	cmp	w9, #0x0
 46c0994: 9a984140     	csel	x0, x10, x24, mi
 46c0998: d63f0100     	blr	x8
 46c099c: 34000060     	cbz	w0, 0x46c09a8 <_ChromeMain+0x46bb70c>
 46c09a0: 52800014     	mov	w20, #0x0               ; =0
 46c09a4: 14000003     	b	0x46c09b0 <_ChromeMain+0x46bb714>
 46c09a8: 52800034     	mov	w20, #0x1               ; =1
 46c09ac: 3901a274     	strb	w20, [x19, #0x68]
 46c09b0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 46c09b4: 36f800a8     	tbz	w8, #0x1f, 0x46c09c8 <_ChromeMain+0x46bb72c>
 46c09b8: f94003e0     	ldr	x0, [sp]
 46c09bc: f9400be8     	ldr	x8, [sp, #0x10]
 46c09c0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c09c4: 96e5213d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c09c8: 3607b8b4     	tbz	w20, #0x0, 0x46c00dc <_ChromeMain+0x46bae40>
 46c09cc: 52800020     	mov	w0, #0x1                ; =1
 46c09d0: 17fffdd6     	b	0x46c0128 <_ChromeMain+0x46bae8c>
 46c09d4: f85303a0     	ldur	x0, [x29, #-0xd0]
 46c09d8: f85403a8     	ldur	x8, [x29, #-0xc0]
 46c09dc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c09e0: 96e52136     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c09e4: 17fffecc     	b	0x46c0514 <_ChromeMain+0x46bb278>
 46c09e8: f85483a0     	ldur	x0, [x29, #-0xb8]
 46c09ec: f85583a8     	ldur	x8, [x29, #-0xa8]
 46c09f0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c09f4: 96e52131     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c09f8: 17fffe68     	b	0x46c0398 <_ChromeMain+0x46bb0fc>
 46c09fc: 14000005     	b	0x46c0a10 <_ChromeMain+0x46bb774>
 46c0a00: 1400000f     	b	0x46c0a3c <_ChromeMain+0x46bb7a0>
 46c0a04: 14000013     	b	0x46c0a50 <_ChromeMain+0x46bb7b4>
 46c0a08: 1400000d     	b	0x46c0a3c <_ChromeMain+0x46bb7a0>
 46c0a0c: 14000001     	b	0x46c0a10 <_ChromeMain+0x46bb774>
 46c0a10: aa0003f3     	mov	x19, x0
 46c0a14: 38d973a8     	ldursb	w8, [x29, #-0x69]
 46c0a18: 36f80148     	tbz	w8, #0x1f, 0x46c0a40 <_ChromeMain+0x46bb7a4>
 46c0a1c: f85803a0     	ldur	x0, [x29, #-0x80]
 46c0a20: f85903a8     	ldur	x8, [x29, #-0x70]
 46c0a24: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c0a28: 96e52124     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c0a2c: 14000005     	b	0x46c0a40 <_ChromeMain+0x46bb7a4>
 46c0a30: 14000003     	b	0x46c0a3c <_ChromeMain+0x46bb7a0>
 46c0a34: 14000002     	b	0x46c0a3c <_ChromeMain+0x46bb7a0>
 46c0a38: 14000006     	b	0x46c0a50 <_ChromeMain+0x46bb7b4>
 46c0a3c: aa0003f3     	mov	x19, x0
 46c0a40: 910003e0     	mov	x0, sp
 46c0a44: 96fd218f     	bl	0x609080 <_ChromeMain+0x603de4>
 46c0a48: 14000003     	b	0x46c0a54 <_ChromeMain+0x46bb7b8>
 46c0a4c: 14000001     	b	0x46c0a50 <_ChromeMain+0x46bb7b4>
 46c0a50: aa0003f3     	mov	x19, x0
 46c0a54: 38d2f3a8     	ldursb	w8, [x29, #-0xd1]
 46c0a58: 36f80188     	tbz	w8, #0x1f, 0x46c0a88 <_ChromeMain+0x46bb7ec>
 46c0a5c: f85183a0     	ldur	x0, [x29, #-0xe8]
 46c0a60: f85283a8     	ldur	x8, [x29, #-0xd8]
 46c0a64: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c0a68: 96e52114     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c0a6c: 14000007     	b	0x46c0a88 <_ChromeMain+0x46bb7ec>
 46c0a70: f85303a0     	ldur	x0, [x29, #-0xd0]
 46c0a74: f85403a8     	ldur	x8, [x29, #-0xc0]
 46c0a78: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c0a7c: 96e5210f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c0a80: 14000004     	b	0x46c0a90 <_ChromeMain+0x46bb7f4>
 46c0a84: aa0003f3     	mov	x19, x0
 46c0a88: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 46c0a8c: 37ffff28     	tbnz	w8, #0x1f, 0x46c0a70 <_ChromeMain+0x46bb7d4>
 46c0a90: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 46c0a94: 37f80148     	tbnz	w8, #0x1f, 0x46c0abc <_ChromeMain+0x46bb820>
 46c0a98: 38d773a8     	ldursb	w8, [x29, #-0x89]
 46c0a9c: 37f80068     	tbnz	w8, #0x1f, 0x46c0aa8 <_ChromeMain+0x46bb80c>
 46c0aa0: aa1303e0     	mov	x0, x19
 46c0aa4: 94e50a98     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 46c0aa8: f85603a0     	ldur	x0, [x29, #-0xa0]
 46c0aac: f85703a8     	ldur	x8, [x29, #-0x90]
 46c0ab0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46c0ab4: 96e52101     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46c0ab8: 17fffffa     	b	0x46c0aa0 <_ChromeMain+0x46bb804>
 46c0abc: f85483a0     	ldur	x0, [x29, #-0xb8]
