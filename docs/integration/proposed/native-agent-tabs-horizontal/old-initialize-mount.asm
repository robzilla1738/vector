
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45d77e0: d10283ff     	sub	sp, sp, #0xa0
 45d77e4: a9065ff8     	stp	x24, x23, [sp, #0x60]
 45d77e8: a90757f6     	stp	x22, x21, [sp, #0x70]
 45d77ec: a9084ff4     	stp	x20, x19, [sp, #0x80]
 45d77f0: a9097bfd     	stp	x29, x30, [sp, #0x90]
 45d77f4: 910243fd     	add	x29, sp, #0x90
 45d77f8: 39510008     	ldrb	w8, [x0, #0x440]
 45d77fc: 360000e8     	tbz	w8, #0x0, 0x45d7818 <_ChromeMain+0x45d257c>
 45d7800: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 45d7804: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 45d7808: a94757f6     	ldp	x22, x21, [sp, #0x70]
 45d780c: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 45d7810: 910283ff     	add	sp, sp, #0xa0
 45d7814: d65f03c0     	ret
 45d7818: aa0003f3     	mov	x19, x0
 45d781c: f9423400     	ldr	x0, [x0, #0x468]
 45d7820: 940328d5     	bl	0x46a1b74 <_ChromeMain+0x469c8d8>
 45d7824: aa1303e0     	mov	x0, x19
 45d7828: 940000e1     	bl	0x45d7bac <_ChromeMain+0x45d2910>
 45d782c: f9423661     	ldr	x1, [x19, #0x468]
 45d7830: f941a420     	ldr	x0, [x1, #0x348]
 45d7834: 97ae24dd     	bl	0x3160ba8 <_ChromeMain+0x315b90c>
 45d7838: 52800028     	mov	w8, #0x1                ; =1
 45d783c: 39110268     	strb	w8, [x19, #0x440]
 45d7840: f9400268     	ldr	x8, [x19]
 45d7844: f9407508     	ldr	x8, [x8, #0xe8]
 45d7848: d00527e1     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 45d784c: 91218021     	add	x1, x1, #0x860
 45d7850: aa1303e0     	mov	x0, x19
 45d7854: d63f0100     	blr	x8
 45d7858: b4000240     	cbz	x0, 0x45d78a0 <_ChromeMain+0x45d2604>
 45d785c: f9423675     	ldr	x21, [x19, #0x468]
 45d7860: b4000075     	cbz	x21, 0x45d786c <_ChromeMain+0x45d25d0>
 45d7864: 39510268     	ldrb	w8, [x19, #0x440]
 45d7868: 35000608     	cbnz	w8, 0x45d7928 <_ChromeMain+0x45d268c>
 45d786c: f9423a60     	ldr	x0, [x19, #0x470]
 45d7870: b4000040     	cbz	x0, 0x45d7878 <_ChromeMain+0x45d25dc>
 45d7874: 9400019c     	bl	0x45d7ee4 <_ChromeMain+0x45d2c48>
 45d7878: aa1303e0     	mov	x0, x19
 45d787c: 97fff714     	bl	0x45d54cc <_ChromeMain+0x45d0230>
 45d7880: aa1303e0     	mov	x0, x19
 45d7884: 52800001     	mov	w1, #0x0                ; =0
 45d7888: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 45d788c: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 45d7890: a94757f6     	ldp	x22, x21, [sp, #0x70]
 45d7894: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 45d7898: 910283ff     	add	sp, sp, #0xa0
 45d789c: 170162f6     	b	0x630474 <_ChromeMain+0x62b1d8>
 45d78a0: f9425668     	ldr	x8, [x19, #0x4a8]
 45d78a4: b4fffdc8     	cbz	x8, 0x45d785c <_ChromeMain+0x45d25c0>
 45d78a8: f9422668     	ldr	x8, [x19, #0x448]
 45d78ac: b4fffd88     	cbz	x8, 0x45d785c <_ChromeMain+0x45d25c0>
 45d78b0: f9429d16     	ldr	x22, [x8, #0x538]
 45d78b4: b4fffd56     	cbz	x22, 0x45d785c <_ChromeMain+0x45d25c0>
 45d78b8: b94062c8     	ldr	w8, [x22, #0x60]
 45d78bc: 35fffd08     	cbnz	w8, 0x45d785c <_ChromeMain+0x45d25c0>
 45d78c0: f94046d5     	ldr	x21, [x22, #0x88]
 45d78c4: f0054988     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45d78c8: 91120108     	add	x8, x8, #0x480
 45d78cc: f8bfc100     	ldapr	x0, [x8]
 45d78d0: b40015e0     	cbz	x0, 0x45d7b8c <_ChromeMain+0x45d28f0>
 45d78d4: 5280ae01     	mov	w1, #0x570              ; =1392
 45d78d8: d2800002     	mov	x2, #0x0                ; =0
 45d78dc: 96eb4f35     	bl	0xab5b0 <_ChromeMain+0xa6314>
 45d78e0: aa0003f4     	mov	x20, x0
 45d78e4: f9423663     	ldr	x3, [x19, #0x468]
 45d78e8: 9100a2c1     	add	x1, x22, #0x28
 45d78ec: aa1503e2     	mov	x2, x21
 45d78f0: 9402b294     	bl	0x4684340 <_ChromeMain+0x467f0a4>
 45d78f4: f940ce62     	ldr	x2, [x19, #0x198]
 45d78f8: d37df048     	lsl	x8, x2, #3
 45d78fc: b4000a48     	cbz	x8, 0x45d7a44 <_ChromeMain+0x45d27a8>
 45d7900: d2800009     	mov	x9, #0x0                ; =0
 45d7904: f942566a     	ldr	x10, [x19, #0x4a8]
 45d7908: f940ca6b     	ldr	x11, [x19, #0x190]
 45d790c: f869696c     	ldr	x12, [x11, x9]
 45d7910: eb0a019f     	cmp	x12, x10
 45d7914: 54000960     	b.eq	0x45d7a40 <_ChromeMain+0x45d27a4>
 45d7918: 91002129     	add	x9, x9, #0x8
 45d791c: eb09011f     	cmp	x8, x9
 45d7920: 54ffff61     	b.ne	0x45d790c <_ChromeMain+0x45d2670>
 45d7924: 14000048     	b	0x45d7a44 <_ChromeMain+0x45d27a8>
 45d7928: b0054968     	adrp	x8, 0xef04000 <dyld_stub_binder+0xef04000>
 45d792c: 3969c108     	ldrb	w8, [x8, #0xa70]
 45d7930: 36000448     	tbz	w8, #0x0, 0x45d79b8 <_ChromeMain+0x45d271c>
 45d7934: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45d7938: f0052ec9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45d793c: f9404529     	ldr	x9, [x9, #0x88]
 45d7940: eb09011f     	cmp	x8, x9
 45d7944: 54000061     	b.ne	0x45d7950 <_ChromeMain+0x45d26b4>
 45d7948: aa1303e0     	mov	x0, x19
 45d794c: 96e8f26c     	bl	0x142fc <_ChromeMain+0xf060>
 45d7950: 52800700     	mov	w0, #0x38               ; =56
 45d7954: 96e8de85     	bl	0xf368 <_ChromeMain+0xa0cc>
 45d7958: aa0003f4     	mov	x20, x0
 45d795c: 52800036     	mov	w22, #0x1               ; =1
 45d7960: b0ffcca8     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 45d7964: 91270108     	add	x8, x8, #0x9c0
 45d7968: b0fea769     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 45d796c: 91180129     	add	x9, x9, #0x600
 45d7970: b9000016     	str	w22, [x0]
 45d7974: d0fefc2a     	adrp	x10, 0x255d000 <_ChromeMain+0x2557d64>
 45d7978: 912c014a     	add	x10, x10, #0xb00
 45d797c: 10fef82b     	adr	x11, 0x45d5880 <_ChromeMain+0x45d05e4>
 45d7980: d503201f     	nop
 45d7984: a900a408     	stp	x8, x9, [x0, #0x8]
 45d7988: a901ac0a     	stp	x10, x11, [x0, #0x18]
 45d798c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 45d7990: f941b2b5     	ldr	x21, [x21, #0x360]
 45d7994: b4000180     	cbz	x0, 0x45d79c4 <_ChromeMain+0x45d2728>
 45d7998: b8360288     	ldadd	w22, w8, [x20]
 45d799c: 7100011f     	cmp	w8, #0x0
 45d79a0: 54000ead     	b.le	0x45d7b74 <_ChromeMain+0x45d28d8>
 45d79a4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45d79a8: 6b09011f     	cmp	w8, w9
 45d79ac: 54000ea0     	b.eq	0x45d7b80 <_ChromeMain+0x45d28e4>
 45d79b0: 52800016     	mov	w22, #0x0               ; =0
 45d79b4: 14000004     	b	0x45d79c4 <_ChromeMain+0x45d2728>
 45d79b8: d2800014     	mov	x20, #0x0               ; =0
 45d79bc: f941b2b5     	ldr	x21, [x21, #0x360]
 45d79c0: 52800036     	mov	w22, #0x1               ; =1
 45d79c4: f9001bf4     	str	x20, [sp, #0x30]
 45d79c8: f9428aa8     	ldr	x8, [x21, #0x510]
 45d79cc: f100011f     	cmp	x8, #0x0
 45d79d0: 1a9f17f7     	cset	w23, eq
 45d79d4: 911442a0     	add	x0, x21, #0x510
 45d79d8: 9100c3e1     	add	x1, sp, #0x30
 45d79dc: 974b3b15     	bl	0x18a6630 <_ChromeMain+0x18a1394>
 45d79e0: 6b1702df     	cmp	w22, w23
 45d79e4: 540000a0     	b.eq	0x45d79f8 <_ChromeMain+0x45d275c>
 45d79e8: f94002a8     	ldr	x8, [x21]
 45d79ec: f9418508     	ldr	x8, [x8, #0x308]
 45d79f0: aa1503e0     	mov	x0, x21
 45d79f4: d63f0100     	blr	x8
 45d79f8: f9401be0     	ldr	x0, [sp, #0x30]
 45d79fc: b5000140     	cbnz	x0, 0x45d7a24 <_ChromeMain+0x45d2788>
 45d7a00: 3707f376     	tbnz	w22, #0x0, 0x45d786c <_ChromeMain+0x45d25d0>
 45d7a04: 12800008     	mov	w8, #-0x1               ; =-1
 45d7a08: b8e80288     	ldaddal	w8, w8, [x20]
 45d7a0c: 7100051f     	cmp	w8, #0x1
 45d7a10: 54fff2e1     	b.ne	0x45d786c <_ChromeMain+0x45d25d0>
 45d7a14: f9400a88     	ldr	x8, [x20, #0x10]
 45d7a18: aa1403e0     	mov	x0, x20
 45d7a1c: d63f0100     	blr	x8
 45d7a20: 17ffff93     	b	0x45d786c <_ChromeMain+0x45d25d0>
 45d7a24: 12800008     	mov	w8, #-0x1               ; =-1
 45d7a28: b8e80008     	ldaddal	w8, w8, [x0]
 45d7a2c: 7100051f     	cmp	w8, #0x1
 45d7a30: 54fffe81     	b.ne	0x45d7a00 <_ChromeMain+0x45d2764>
 45d7a34: f9400808     	ldr	x8, [x0, #0x10]
 45d7a38: d63f0100     	blr	x8
 45d7a3c: 17fffff1     	b	0x45d7a00 <_ChromeMain+0x45d2764>
 45d7a40: 9343fd22     	asr	x2, x9, #3
 45d7a44: 3945a688     	ldrb	w8, [x20, #0x169]
 45d7a48: 35000a68     	cbnz	w8, 0x45d7b94 <_ChromeMain+0x45d28f8>
 45d7a4c: aa1303e0     	mov	x0, x19
 45d7a50: aa1403e1     	mov	x1, x20
 45d7a54: 9706866a     	bl	0x7793fc <_ChromeMain+0x774160>
 45d7a58: 52800035     	mov	w21, #0x1               ; =1
 45d7a5c: b90033f5     	str	w21, [sp, #0x30]
 45d7a60: d0052161     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 45d7a64: 9115a021     	add	x1, x1, #0x568
 45d7a68: 91036280     	add	x0, x20, #0xd8
 45d7a6c: 9100c3e2     	add	x2, sp, #0x30
 45d7a70: 97b2d46a     	bl	0x328cc18 <_ChromeMain+0x328797c>
 45d7a74: b004cb48     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 45d7a78: 3dc02500     	ldr	q0, [x8, #0x90]
 45d7a7c: 3d800fe0     	str	q0, [sp, #0x30]
 45d7a80: d0052161     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 45d7a84: 91122021     	add	x1, x1, #0x488
 45d7a88: 9100c3f6     	add	x22, sp, #0x30
 45d7a8c: 91036280     	add	x0, x20, #0xd8
 45d7a90: 9100c3e2     	add	x2, sp, #0x30
 45d7a94: 975458f3     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 45d7a98: 52800800     	mov	w0, #0x40               ; =64
 45d7a9c: 96e8de33     	bl	0xf368 <_ChromeMain+0xa0cc>
 45d7aa0: b9000015     	str	w21, [x0]
 45d7aa4: 90fe5288     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 45d7aa8: 91260108     	add	x8, x8, #0x980
 45d7aac: f0fde8c9     	adrp	x9, 0x2f2000 <_ChromeMain+0x2ecd64>
 45d7ab0: 91220129     	add	x9, x9, #0x880
 45d7ab4: a900a408     	stp	x8, x9, [x0, #0x8]
 45d7ab8: d0fefc28     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 45d7abc: 912c0108     	add	x8, x8, #0xb00
 45d7ac0: f0ffaa69     	adrp	x9, 0x3b26000 <_ChromeMain+0x3b20d64>
 45d7ac4: 91310129     	add	x9, x9, #0xc40
 45d7ac8: a901a408     	stp	x8, x9, [x0, #0x18]
 45d7acc: b004cb48     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 45d7ad0: 3dc01900     	ldr	q0, [x8, #0x60]
 45d7ad4: 3c828000     	stur	q0, [x0, #0x28]
 45d7ad8: 3900e01f     	strb	wzr, [x0, #0x38]
 45d7adc: f90003e0     	str	x0, [sp]
 45d7ae0: 0f000420     	movi.2s	v0, #0x1
 45d7ae4: fd0007e0     	str	d0, [sp, #0x8]
 45d7ae8: 52800068     	mov	w8, #0x3                ; =3
 45d7aec: b90013e8     	str	w8, [sp, #0x10]
 45d7af0: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 45d7af4: f9000fff     	str	xzr, [sp, #0x18]
 45d7af8: f90023ff     	str	xzr, [sp, #0x40]
 45d7afc: f9001be0     	str	x0, [sp, #0x30]
 45d7b00: b5000280     	cbnz	x0, 0x45d7b50 <_ChromeMain+0x45d28b4>
 45d7b04: 910003e8     	mov	x8, sp
 45d7b08: f8408109     	ldur	x9, [x8, #0x8]
 45d7b0c: f80082c9     	stur	x9, [x22, #0x8]
 45d7b10: b8410108     	ldur	w8, [x8, #0x10]
 45d7b14: b80102c8     	stur	w8, [x22, #0x10]
 45d7b18: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 45d7b1c: f90027ff     	str	xzr, [sp, #0x48]
 45d7b20: 528000a8     	mov	w8, #0x5                ; =5
 45d7b24: b9003be8     	str	w8, [sp, #0x38]
 45d7b28: d0052161     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 45d7b2c: 91152021     	add	x1, x1, #0x548
 45d7b30: 91036280     	add	x0, x20, #0xd8
 45d7b34: 9100c3e2     	add	x2, sp, #0x30
 45d7b38: 9758f215     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 45d7b3c: 9100c3e0     	add	x0, sp, #0x30
 45d7b40: 9745cc79     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 45d7b44: 910003e0     	mov	x0, sp
 45d7b48: 9745cc77     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 45d7b4c: 17ffff44     	b	0x45d785c <_ChromeMain+0x45d25c0>
 45d7b50: b8350008     	ldadd	w21, w8, [x0]
 45d7b54: 7100011f     	cmp	w8, #0x0
 45d7b58: 5400024d     	b.le	0x45d7ba0 <_ChromeMain+0x45d2904>
 45d7b5c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45d7b60: 6b09011f     	cmp	w8, w9
 45d7b64: 54fffd01     	b.ne	0x45d7b04 <_ChromeMain+0x45d2868>
 45d7b68: d4200000     	brk	#0
 45d7b6c: d4400000     	hlt	#0
 45d7b70: d4200020     	brk	#0x1
 45d7b74: d4200000     	brk	#0
 45d7b78: d4400000     	hlt	#0
 45d7b7c: d4200020     	brk	#0x1
 45d7b80: d4200000     	brk	#0
 45d7b84: d4400000     	hlt	#0
 45d7b88: d4200020     	brk	#0x1
 45d7b8c: 97f3eedb     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45d7b90: 17ffff51     	b	0x45d78d4 <_ChromeMain+0x45d2638>
 45d7b94: d4200000     	brk	#0
