
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460ee60: d10143ff     	sub	sp, sp, #0x50
 460ee64: a9015ff8     	stp	x24, x23, [sp, #0x10]
 460ee68: a90257f6     	stp	x22, x21, [sp, #0x20]
 460ee6c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 460ee70: a9047bfd     	stp	x29, x30, [sp, #0x40]
 460ee74: 910103fd     	add	x29, sp, #0x40
 460ee78: aa0203f5     	mov	x21, x2
 460ee7c: aa0103f6     	mov	x22, x1
 460ee80: aa0003f3     	mov	x19, x0
 460ee84: 973580af     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 460ee88: b0050898     	adrp	x24, 0xe71f000 <dyld_stub_binder+0xe71f000>
 460ee8c: 912fc318     	add	x24, x24, #0xbf0
 460ee90: 91106308     	add	x8, x24, #0x418
 460ee94: a9002018     	stp	x24, x8, [x0]
 460ee98: 91110308     	add	x8, x24, #0x440
 460ee9c: f9000808     	str	x8, [x0, #0x10]
 460eea0: 9111e308     	add	x8, x24, #0x478
 460eea4: 9112a309     	add	x9, x24, #0x4a8
 460eea8: a906a408     	stp	x8, x9, [x0, #0x68]
 460eeac: 9113e308     	add	x8, x24, #0x4f8
 460eeb0: f9005808     	str	x8, [x0, #0xb0]
 460eeb4: 91156308     	add	x8, x24, #0x558
 460eeb8: aa0003f4     	mov	x20, x0
 460eebc: f80d8e88     	str	x8, [x20, #0xd8]!
 460eec0: 91162308     	add	x8, x24, #0x588
 460eec4: b004f7e9     	adrp	x9, 0xe50b000 <dyld_stub_binder+0xe50b000>
 460eec8: 912d4129     	add	x9, x9, #0xb50
 460eecc: f9007c08     	str	x8, [x0, #0xf8]
 460eed0: f9018809     	str	x9, [x0, #0x310]
 460eed4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 460eed8: 90052d37     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 460eedc: f94046e9     	ldr	x9, [x23, #0x88]
 460eee0: eb09011f     	cmp	x8, x9
 460eee4: 54000061     	b.ne	0x460eef0 <_ChromeMain+0x4609c54>
 460eee8: aa1303e0     	mov	x0, x19
 460eeec: 96e81504     	bl	0x142fc <_ChromeMain+0xf060>
 460eef0: f9018e73     	str	x19, [x19, #0x318]
 460eef4: 390f227f     	strb	wzr, [x19, #0x3c8]
 460eef8: b40016d3     	cbz	x19, 0x460f1d0 <_ChromeMain+0x4609f34>
 460eefc: 91106308     	add	x8, x24, #0x418
 460ef00: a9002278     	stp	x24, x8, [x19]
 460ef04: 91110308     	add	x8, x24, #0x440
 460ef08: f9000a68     	str	x8, [x19, #0x10]
 460ef0c: 9111e308     	add	x8, x24, #0x478
 460ef10: 9112a309     	add	x9, x24, #0x4a8
 460ef14: a906a668     	stp	x8, x9, [x19, #0x68]
 460ef18: 9113e308     	add	x8, x24, #0x4f8
 460ef1c: f9005a68     	str	x8, [x19, #0xb0]
 460ef20: 91156308     	add	x8, x24, #0x558
 460ef24: f9006e68     	str	x8, [x19, #0xd8]
 460ef28: 91162308     	add	x8, x24, #0x588
 460ef2c: f9007e68     	str	x8, [x19, #0xf8]
 460ef30: 9116c308     	add	x8, x24, #0x5b0
 460ef34: f9018a68     	str	x8, [x19, #0x310]
 460ef38: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 460ef3c: f94046e9     	ldr	x9, [x23, #0x88]
 460ef40: eb09011f     	cmp	x8, x9
 460ef44: 54000061     	b.ne	0x460ef50 <_ChromeMain+0x4609cb4>
 460ef48: aa1603e0     	mov	x0, x22
 460ef4c: 96e814ec     	bl	0x142fc <_ChromeMain+0xf060>
 460ef50: f901ea76     	str	x22, [x19, #0x3d0]
 460ef54: f901ee7f     	str	xzr, [x19, #0x3d8]
 460ef58: f901f275     	str	x21, [x19, #0x3e0]
 460ef5c: 910fa268     	add	x8, x19, #0x3e8
 460ef60: b903fa7f     	str	wzr, [x19, #0x3f8]
 460ef64: 6f00e400     	movi.2d	v0, #0000000000000000
 460ef68: 3d800100     	str	q0, [x8]
 460ef6c: 900547e8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 460ef70: 91120108     	add	x8, x8, #0x480
 460ef74: f8bfc100     	ldapr	x0, [x8]
 460ef78: b4001280     	cbz	x0, 0x460f1c8 <_ChromeMain+0x4609f2c>
 460ef7c: 52807001     	mov	w1, #0x380              ; =896
 460ef80: d2800002     	mov	x2, #0x0                ; =0
 460ef84: 96ea718b     	bl	0xab5b0 <_ChromeMain+0xa6314>
 460ef88: aa0003f5     	mov	x21, x0
 460ef8c: 977878ab     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 460ef90: 90050528     	adrp	x8, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 460ef94: 912f4108     	add	x8, x8, #0xbd0
 460ef98: 910fc109     	add	x9, x8, #0x3f0
 460ef9c: a9002408     	stp	x8, x9, [x0]
 460efa0: 91106109     	add	x9, x8, #0x418
 460efa4: f9000809     	str	x9, [x0, #0x10]
 460efa8: 91114109     	add	x9, x8, #0x450
 460efac: 9112010a     	add	x10, x8, #0x480
 460efb0: a906a809     	stp	x9, x10, [x0, #0x68]
 460efb4: 91134109     	add	x9, x8, #0x4d0
 460efb8: f9005809     	str	x9, [x0, #0xb0]
 460efbc: 9114c109     	add	x9, x8, #0x530
 460efc0: f9006c09     	str	x9, [x0, #0xd8]
 460efc4: 91158108     	add	x8, x8, #0x560
 460efc8: f9007c08     	str	x8, [x0, #0xf8]
 460efcc: f901a41f     	str	xzr, [x0, #0x348]
 460efd0: 2f06e400     	movi	d0, #0xffff000000000000
 460efd4: fd01a800     	str	d0, [x0, #0x350]
 460efd8: 52800028     	mov	w8, #0x1                ; =1
 460efdc: 390d6008     	strb	w8, [x0, #0x358]
 460efe0: f901b01f     	str	xzr, [x0, #0x360]
 460efe4: 390da01f     	strb	wzr, [x0, #0x368]
 460efe8: f901b81f     	str	xzr, [x0, #0x370]
 460efec: b903781f     	str	wzr, [x0, #0x378]
 460eff0: 390df01f     	strb	wzr, [x0, #0x37c]
 460eff4: 3945a408     	ldrb	w8, [x0, #0x169]
 460eff8: 35000e28     	cbnz	w8, 0x460f1bc <_ChromeMain+0x4609f20>
 460effc: f940ce62     	ldr	x2, [x19, #0x198]
 460f000: aa1303e0     	mov	x0, x19
 460f004: aa1503e1     	mov	x1, x21
 460f008: 9705a8fd     	bl	0x7793fc <_ChromeMain+0x774160>
 460f00c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 460f010: f94046e9     	ldr	x9, [x23, #0x88]
 460f014: eb09011f     	cmp	x8, x9
 460f018: 54000061     	b.ne	0x460f024 <_ChromeMain+0x4609d88>
 460f01c: aa1503e0     	mov	x0, x21
 460f020: 96e814b7     	bl	0x142fc <_ChromeMain+0xf060>
 460f024: f941ee60     	ldr	x0, [x19, #0x3d8]
 460f028: 925e7408     	and	x8, x0, #0xfffffffc00000000
 460f02c: f94046e9     	ldr	x9, [x23, #0x88]
 460f030: eb09011f     	cmp	x8, x9
 460f034: 54000041     	b.ne	0x460f03c <_ChromeMain+0x4609da0>
 460f038: 96e84e81     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 460f03c: f901ee75     	str	x21, [x19, #0x3d8]
 460f040: 910c42a8     	add	x8, x21, #0x310
 460f044: 394c62a9     	ldrb	w9, [x21, #0x318]
 460f048: 35000ca9     	cbnz	w9, 0x460f1dc <_ChromeMain+0x4609f40>
 460f04c: b4000bc8     	cbz	x8, 0x460f1c4 <_ChromeMain+0x4609f28>
 460f050: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 460f054: f9018aa8     	str	x8, [x21, #0x310]
 460f058: 52800028     	mov	w8, #0x1                ; =1
 460f05c: 390c62a8     	strb	w8, [x21, #0x318]
 460f060: f940c6a0     	ldr	x0, [x21, #0x188]
 460f064: b40000a0     	cbz	x0, 0x460f078 <_ChromeMain+0x4609ddc>
 460f068: f9400008     	ldr	x8, [x0]
 460f06c: f9417d08     	ldr	x8, [x8, #0x2f8]
 460f070: aa1503e1     	mov	x1, x21
 460f074: d63f0100     	blr	x8
 460f078: aa1503e0     	mov	x0, x21
 460f07c: 52800001     	mov	w1, #0x0                ; =0
 460f080: 970084fd     	bl	0x630474 <_ChromeMain+0x62b1d8>
 460f084: f90007f5     	str	x21, [sp, #0x8]
 460f088: 52800036     	mov	w22, #0x1               ; =1
 460f08c: 9104c2a0     	add	x0, x21, #0x130
 460f090: 910023e3     	add	x3, sp, #0x8
 460f094: 52800301     	mov	w1, #0x18               ; =24
 460f098: 52800022     	mov	w2, #0x1                ; =1
 460f09c: 970a604d     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 460f0a0: aa1503e0     	mov	x0, x21
 460f0a4: 97311e91     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 460f0a8: 52800740     	mov	w0, #0x3a               ; =58
 460f0ac: 96fbd205     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 460f0b0: aa0003f5     	mov	x21, x0
 460f0b4: 52800740     	mov	w0, #0x3a               ; =58
 460f0b8: 96fbd202     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 460f0bc: 0ab57ea8     	bic	w8, w21, w21, asr #31
 460f0c0: 0aa07c09     	bic	w9, w0, w0, asr #31
 460f0c4: aa098101     	orr	x1, x8, x9, lsl #32
 460f0c8: aa1303e0     	mov	x0, x19
 460f0cc: 52800022     	mov	w2, #0x1                ; =1
 460f0d0: 97870a64     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 460f0d4: 39072e76     	strb	w22, [x19, #0x1cb]
 460f0d8: aa1303e0     	mov	x0, x19
 460f0dc: 52800021     	mov	w1, #0x1                ; =1
 460f0e0: 973ca1bf     	bl	0x15377dc <_ChromeMain+0x1532540>
 460f0e4: aa1303e0     	mov	x0, x19
 460f0e8: 52800021     	mov	w1, #0x1                ; =1
 460f0ec: 975819e8     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 460f0f0: f9401268     	ldr	x8, [x19, #0x20]
 460f0f4: b9400909     	ldr	w9, [x8, #0x8]
 460f0f8: 7100093f     	cmp	w9, #0x2
 460f0fc: 54000760     	b.eq	0x460f1e8 <_ChromeMain+0x4609f4c>
 460f100: 39422909     	ldrb	w9, [x8, #0x8a]
 460f104: 340000a9     	cbz	w9, 0x460f118 <_ChromeMain+0x4609e7c>
 460f108: 3902291f     	strb	wzr, [x8, #0x8a]
 460f10c: f940b500     	ldr	x0, [x8, #0x168]
 460f110: 52800001     	mov	w1, #0x0                ; =0
 460f114: 971efa8b     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 460f118: 52800600     	mov	w0, #0x30               ; =48
 460f11c: 96e80093     	bl	0xf368 <_ChromeMain+0xa0cc>
 460f120: aa0003e4     	mov	x4, x0
 460f124: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 460f128: 7900301f     	strh	wzr, [x0, #0x18]
 460f12c: f004e9e8     	adrp	x8, 0xe34e000 <dyld_stub_binder+0xe34e000>
 460f130: 91362108     	add	x8, x8, #0xd88
 460f134: f9000008     	str	x8, [x0]
 460f138: 4f01f480     	fmov.4s	v0, #10.00000000
 460f13c: 3c81c000     	stur	q0, [x0, #0x1c]
 460f140: d0051fa1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 460f144: 9114a021     	add	x1, x1, #0x528
 460f148: d004b9a2     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 460f14c: 91264842     	add	x2, x2, #0x992
 460f150: b0ff42e3     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 460f154: 913c0063     	add	x3, x3, #0xf00
 460f158: aa1403e0     	mov	x0, x20
 460f15c: d2800005     	mov	x5, #0x0                ; =0
 460f160: 97156c0f     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 460f164: b5000240     	cbnz	x0, 0x460f1ac <_ChromeMain+0x4609f10>
 460f168: aa1303e0     	mov	x0, x19
 460f16c: 97357f35     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 460f170: b0051fa1     	adrp	x1, 0xea04000 <dyld_stub_binder+0xea04000>
 460f174: 9132c021     	add	x1, x1, #0xcb0
 460f178: aa1403e0     	mov	x0, x20
 460f17c: d2800002     	mov	x2, #0x0                ; =0
 460f180: 52800003     	mov	w3, #0x0                ; =0
 460f184: 97537b66     	bl	0x1aedf1c <_ChromeMain+0x1ae8c80>
 460f188: 52800028     	mov	w8, #0x1                ; =1
 460f18c: 390c8008     	strb	w8, [x0, #0x320]
 460f190: aa1303e0     	mov	x0, x19
 460f194: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 460f198: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 460f19c: a94257f6     	ldp	x22, x21, [sp, #0x20]
 460f1a0: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 460f1a4: 910143ff     	add	sp, sp, #0x50
 460f1a8: d65f03c0     	ret
 460f1ac: f9400008     	ldr	x8, [x0]
 460f1b0: f9400508     	ldr	x8, [x8, #0x8]
 460f1b4: d63f0100     	blr	x8
 460f1b8: 17ffffec     	b	0x460f168 <_ChromeMain+0x4609ecc>
 460f1bc: d4200000     	brk	#0
 460f1c0: d4400000     	hlt	#0
 460f1c4: d4200020     	brk	#0x1
 460f1c8: 97f3114c     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 460f1cc: 17ffff6c     	b	0x460ef7c <_ChromeMain+0x4609ce0>
 460f1d0: d4200000     	brk	#0
 460f1d4: d4400000     	hlt	#0
 460f1d8: d4200020     	brk	#0x1
 460f1dc: b21c03e9     	mov	x9, #0x1000000010       ; =68719476752
 460f1e0: f9000109     	str	x9, [x8]
 460f1e4: 17ffff9f     	b	0x460f060 <_ChromeMain+0x4609dc4>
 460f1e8: d4200000     	brk	#0
 460f1ec: d4400000     	hlt	#0
 460f1f0: d4200020     	brk	#0x1
