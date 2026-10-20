
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 457903c: d10643ff     	sub	sp, sp, #0x190
 4579040: a9136ffc     	stp	x28, x27, [sp, #0x130]
 4579044: a91467fa     	stp	x26, x25, [sp, #0x140]
 4579048: a9155ff8     	stp	x24, x23, [sp, #0x150]
 457904c: a91657f6     	stp	x22, x21, [sp, #0x160]
 4579050: a9174ff4     	stp	x20, x19, [sp, #0x170]
 4579054: a9187bfd     	stp	x29, x30, [sp, #0x180]
 4579058: 910603fd     	add	x29, sp, #0x180
 457905c: aa0303f5     	mov	x21, x3
 4579060: aa0103f3     	mov	x19, x1
 4579064: aa0003f4     	mov	x20, x0
 4579068: b81843a4     	stur	w4, [x29, #-0x7c]
 457906c: f90077ff     	str	xzr, [sp, #0xe8]
 4579070: 910083f6     	add	x22, sp, #0x20
 4579074: 6f00e400     	movi.2d	v0, #0000000000000000
 4579078: 3c8b82c0     	stur	q0, [x22, #0xb8]
 457907c: 3c8a82c0     	stur	q0, [x22, #0xa8]
 4579080: 3c8982c0     	stur	q0, [x22, #0x98]
 4579084: 3c8882c0     	stur	q0, [x22, #0x88]
 4579088: 3c8782c0     	stur	q0, [x22, #0x78]
 457908c: 3c8682c0     	stur	q0, [x22, #0x68]
 4579090: 3dc00041     	ldr	q1, [x2]
 4579094: 3d800be1     	str	q1, [sp, #0x20]
 4579098: f9400848     	ldr	x8, [x2, #0x10]
 457909c: f9001be8     	str	x8, [sp, #0x30]
 45790a0: a900fc5f     	stp	xzr, xzr, [x2, #0x8]
 45790a4: f900005f     	str	xzr, [x2]
 45790a8: 3c8383e0     	stur	q0, [sp, #0x38]
 45790ac: 3c8483e0     	stur	q0, [sp, #0x48]
 45790b0: 3c8583e0     	stur	q0, [sp, #0x58]
 45790b4: 925e7468     	and	x8, x3, #0xfffffffc00000000
 45790b8: b00531d8     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45790bc: f9404709     	ldr	x9, [x24, #0x88]
 45790c0: eb09011f     	cmp	x8, x9
 45790c4: 54000061     	b.ne	0x45790d0 <_ChromeMain+0x4573e34>
 45790c8: aa1503e0     	mov	x0, x21
 45790cc: 96ea6c8c     	bl	0x142fc <_ChromeMain+0xf060>
 45790d0: a906fff5     	stp	x21, xzr, [sp, #0x68]
 45790d4: d2ffffe8     	mov	x8, #-0x1000000000000   ; =-281474976710656
 45790d8: a907a3ff     	stp	xzr, x8, [sp, #0x78]
 45790dc: 52800028     	mov	w8, #0x1                ; =1
 45790e0: 390223e8     	strb	w8, [sp, #0x88]
 45790e4: f9004bff     	str	xzr, [sp, #0x90]
 45790e8: 390263ff     	strb	wzr, [sp, #0x98]
 45790ec: a90affff     	stp	xzr, xzr, [sp, #0xa8]
 45790f0: f90053ff     	str	xzr, [sp, #0xa0]
 45790f4: 52801ba8     	mov	w8, #0xdd               ; =221
 45790f8: b900bbe8     	str	w8, [sp, #0xb8]
 45790fc: 3902f3ff     	strb	wzr, [sp, #0xbc]
 4579100: a90cffff     	stp	xzr, xzr, [sp, #0xc8]
 4579104: f90063ff     	str	xzr, [sp, #0xc0]
 4579108: 390363ff     	strb	wzr, [sp, #0xd8]
 457910c: 0f000420     	movi.2s	v0, #0x1
 4579110: bc0b92c0     	stur	s0, [x22, #0xb9]
 4579114: d2c00408     	mov	x8, #0x2000000000       ; =137438953472
 4579118: f90073e8     	str	x8, [sp, #0xe0]
 457911c: 52800208     	mov	w8, #0x10               ; =16
 4579120: b900ebe8     	str	w8, [sp, #0xe8]
 4579124: f9007bff     	str	xzr, [sp, #0xf0]
 4579128: f81883bf     	stur	xzr, [x29, #-0x78]
 457912c: 52800048     	mov	w8, #0x2                ; =2
 4579130: 381903a8     	sturb	w8, [x29, #-0x70]
 4579134: 910083e0     	add	x0, sp, #0x20
 4579138: d101e3a1     	sub	x1, x29, #0x78
 457913c: 940001d1     	bl	0x4579880 <_ChromeMain+0x45745e4>
 4579140: aa0003f5     	mov	x21, x0
 4579144: 385903a8     	ldurb	w8, [x29, #-0x70]
 4579148: 7103fd1f     	cmp	w8, #0xff
 457914c: 54000060     	b.eq	0x4579158 <_ChromeMain+0x4573ebc>
 4579150: f85883a0     	ldur	x0, [x29, #-0x78]
 4579154: b5001020     	cbnz	x0, 0x4579358 <_ChromeMain+0x45740bc>
 4579158: f9000ff5     	str	x21, [sp, #0x18]
 457915c: f9418e88     	ldr	x8, [x20, #0x318]
 4579160: f940c517     	ldr	x23, [x8, #0x188]
 4579164: b40000d7     	cbz	x23, 0x457917c <_ChromeMain+0x4573ee0>
 4579168: 52800029     	mov	w9, #0x1                ; =1
 457916c: b82902e9     	ldadd	w9, w9, [x23]
 4579170: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4579174: 6b0a013f     	cmp	w9, w10
 4579178: 540019e0     	b.eq	0x45794b4 <_ChromeMain+0x4574218>
 457917c: f940c919     	ldr	x25, [x8, #0x190]
 4579180: 52800d00     	mov	w0, #0x68               ; =104
 4579184: 96ea5879     	bl	0xf368 <_ChromeMain+0xa0cc>
 4579188: aa0003f6     	mov	x22, x0
 457918c: 52800028     	mov	w8, #0x1                ; =1
 4579190: b9000008     	str	w8, [x0]
 4579194: 10020468     	adr	x8, 0x457d220 <_ChromeMain+0x4577f84>
 4579198: d503201f     	nop
 457919c: 10020b69     	adr	x9, 0x457d308 <_ChromeMain+0x457806c>
 45791a0: d503201f     	nop
 45791a4: a900a408     	stp	x8, x9, [x0, #0x8]
 45791a8: b0ffd9a8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 45791ac: 911b0108     	add	x8, x8, #0x6c0
 45791b0: 10fb49c9     	adr	x9, 0x456fae8 <_ChromeMain+0x456a84c>
 45791b4: d503201f     	nop
 45791b8: a901a408     	stp	x8, x9, [x0, #0x18]
 45791bc: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 45791c0: f9001c19     	str	x25, [x0, #0x38]
 45791c4: b85843b9     	ldur	w25, [x29, #-0x7c]
 45791c8: b9004019     	str	w25, [x0, #0x40]
 45791cc: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45791d0: f9404709     	ldr	x9, [x24, #0x88]
 45791d4: eb09011f     	cmp	x8, x9
 45791d8: 54000061     	b.ne	0x45791e4 <_ChromeMain+0x4573f48>
 45791dc: aa1503e0     	mov	x0, x21
 45791e0: 96ea6c47     	bl	0x142fc <_ChromeMain+0xf060>
 45791e4: d2800000     	mov	x0, #0x0                ; =0
 45791e8: a904fed5     	stp	x21, xzr, [x22, #0x48]
 45791ec: 90feff3a     	adrp	x26, 0x255d000 <_ChromeMain+0x2557d64>
 45791f0: 912c035a     	add	x26, x26, #0xb00
 45791f4: a905fedf     	stp	xzr, xzr, [x22, #0x58]
 45791f8: b5000dd6     	cbnz	x22, 0x45793b0 <_ChromeMain+0x4574114>
 45791fc: f9425ab7     	ldr	x23, [x21, #0x4b0]
 4579200: f9025aa0     	str	x0, [x21, #0x4b0]
 4579204: b5001117     	cbnz	x23, 0x4579424 <_ChromeMain+0x4574188>
 4579208: b5000996     	cbnz	x22, 0x4579338 <_ChromeMain+0x457409c>
 457920c: 52800600     	mov	w0, #0x30               ; =48
 4579210: 96ea5856     	bl	0xf368 <_ChromeMain+0xa0cc>
 4579214: 52800028     	mov	w8, #0x1                ; =1
 4579218: 1000f029     	adr	x9, 0x457b01c <_ChromeMain+0x4575d80>
 457921c: d503201f     	nop
 4579220: b9000008     	str	w8, [x0]
 4579224: b0ffcfc8     	adrp	x8, 0x3f72000 <_ChromeMain+0x3f6cd64>
 4579228: 91250108     	add	x8, x8, #0x940
 457922c: a900a009     	stp	x9, x8, [x0, #0x8]
 4579230: f9000c1a     	str	x26, [x0, #0x18]
 4579234: f9001416     	str	x22, [x0, #0x28]
 4579238: f90007e0     	str	x0, [sp, #0x8]
 457923c: 52800048     	mov	w8, #0x2                ; =2
 4579240: 390043e8     	strb	w8, [sp, #0x10]
 4579244: f94002a8     	ldr	x8, [x21]
 4579248: f941ed08     	ldr	x8, [x8, #0x3d8]
 457924c: 910023e1     	add	x1, sp, #0x8
 4579250: aa1503e0     	mov	x0, x21
 4579254: d63f0100     	blr	x8
 4579258: 394043e8     	ldrb	w8, [sp, #0x10]
 457925c: 7103fd1f     	cmp	w8, #0xff
 4579260: 54000060     	b.eq	0x457926c <_ChromeMain+0x4573fd0>
 4579264: f94007e0     	ldr	x0, [sp, #0x8]
 4579268: b5000860     	cbnz	x0, 0x4579374 <_ChromeMain+0x45740d8>
 457926c: 52801fe8     	mov	w8, #0xff               ; =255
 4579270: 390043e8     	strb	w8, [sp, #0x10]
 4579274: 910dc288     	add	x8, x20, #0x370
 4579278: f941ba89     	ldr	x9, [x20, #0x370]
 457927c: f941be8a     	ldr	x10, [x20, #0x378]
 4579280: 8b0a1137     	add	x23, x9, x10, lsl #4
 4579284: a93a5fa8     	stp	x8, x23, [x29, #-0x60]
 4579288: f941c289     	ldr	x9, [x20, #0x380]
 457928c: d10163ab     	sub	x11, x29, #0x58
 4579290: d101f3ac     	sub	x12, x29, #0x7c
 4579294: a938b3ab     	stp	x11, x12, [x29, #-0x78]
 4579298: 910063eb     	add	x11, sp, #0x18
 457929c: f81983ab     	stur	x11, [x29, #-0x68]
 45792a0: eb09015f     	cmp	x10, x9
 45792a4: 54001020     	b.eq	0x45794a8 <_ChromeMain+0x457420c>
 45792a8: b4000f97     	cbz	x23, 0x4579498 <_ChromeMain+0x45741fc>
 45792ac: b90002f9     	str	w25, [x23]
 45792b0: 925e76a9     	and	x9, x21, #0xfffffffc00000000
 45792b4: f940470a     	ldr	x10, [x24, #0x88]
 45792b8: aa1703e8     	mov	x8, x23
 45792bc: eb0a013f     	cmp	x9, x10
 45792c0: 54000081     	b.ne	0x45792d0 <_ChromeMain+0x4574034>
 45792c4: aa1503e0     	mov	x0, x21
 45792c8: 96ea6c0d     	bl	0x142fc <_ChromeMain+0xf060>
 45792cc: f85a83a8     	ldur	x8, [x29, #-0x58]
 45792d0: f90006f5     	str	x21, [x23, #0x8]
 45792d4: 91004108     	add	x8, x8, #0x10
 45792d8: f81a83a8     	stur	x8, [x29, #-0x58]
 45792dc: f85a83a8     	ldur	x8, [x29, #-0x58]
 45792e0: f941ba89     	ldr	x9, [x20, #0x370]
 45792e4: eb090108     	subs	x8, x8, x9
 45792e8: 9344fd08     	asr	x8, x8, #4
 45792ec: f901be88     	str	x8, [x20, #0x378]
 45792f0: 54000d40     	b.eq	0x4579498 <_ChromeMain+0x45741fc>
 45792f4: 3945a6a8     	ldrb	w8, [x21, #0x169]
 45792f8: 35000e48     	cbnz	w8, 0x45794c0 <_ChromeMain+0x4574224>
 45792fc: f940ce62     	ldr	x2, [x19, #0x198]
 4579300: aa1303e0     	mov	x0, x19
 4579304: aa1503e1     	mov	x1, x21
 4579308: 9708003d     	bl	0x7793fc <_ChromeMain+0x774160>
 457930c: b5000436     	cbnz	x22, 0x4579390 <_ChromeMain+0x45740f4>
 4579310: 910083e0     	add	x0, sp, #0x20
 4579314: 940006bc     	bl	0x457ae04 <_ChromeMain+0x4575b68>
 4579318: a9587bfd     	ldp	x29, x30, [sp, #0x180]
 457931c: a9574ff4     	ldp	x20, x19, [sp, #0x170]
