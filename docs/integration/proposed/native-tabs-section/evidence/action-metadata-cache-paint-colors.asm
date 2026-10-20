
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 466bc8c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 466bc90: a9014ff4     	stp	x20, x19, [sp, #0x10]
 466bc94: a9027bfd     	stp	x29, x30, [sp, #0x20]
 466bc98: 910083fd     	add	x29, sp, #0x20
 466bc9c: 90054395     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 466bca0: f94446b3     	ldr	x19, [x21, #0x888]
 466bca4: b5000653     	cbnz	x19, 0x466bd6c <_ChromeMain+0x4666ad0>
 466bca8: 52800d00     	mov	w0, #0x68               ; =104
 466bcac: 96e68daf     	bl	0xf368 <_ChromeMain+0xa0cc>
 466bcb0: aa0003f3     	mov	x19, x0
 466bcb4: 9004c301     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 466bcb8: 912c7821     	add	x1, x1, #0xb1e
 466bcbc: 528008a2     	mov	w2, #0x45               ; =69
 466bcc0: 52823283     	mov	w3, #0x1194             ; =4500
 466bcc4: 96faee2d     	bl	0x527578 <_ChromeMain+0x5222dc>
 466bcc8: d004f4e8     	adrp	x8, 0xe509000 <dyld_stub_binder+0xe509000>
 466bccc: 91028108     	add	x8, x8, #0xa0
 466bcd0: b004c309     	adrp	x9, 0xdecc000 <dyld_stub_binder+0xdecc000>
 466bcd4: 91022529     	add	x9, x9, #0x89
 466bcd8: a9002408     	stp	x8, x9, [x0]
 466bcdc: 528002c8     	mov	w8, #0x16               ; =22
 466bce0: f9000808     	str	x8, [x0, #0x10]
 466bce4: f0054a16     	adrp	x22, 0xefae000 <dyld_stub_binder+0xefae000>
 466bce8: f9476ad4     	ldr	x20, [x22, #0xed0]
 466bcec: b5000214     	cbnz	x20, 0x466bd2c <_ChromeMain+0x4666a90>
 466bcf0: 52800d00     	mov	w0, #0x68               ; =104
 466bcf4: 96e68d9d     	bl	0xf368 <_ChromeMain+0xa0cc>
 466bcf8: aa0003f4     	mov	x20, x0
 466bcfc: 9004b6c1     	adrp	x1, 0xdd43000 <dyld_stub_binder+0xdd43000>
 466bd00: 91235821     	add	x1, x1, #0x8d6
 466bd04: 528004e2     	mov	w2, #0x27               ; =39
 466bd08: 52800663     	mov	w3, #0x33               ; =51
 466bd0c: 96faee1b     	bl	0x527578 <_ChromeMain+0x5222dc>
 466bd10: d004e708     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 466bd14: 9119c108     	add	x8, x8, #0x670
 466bd18: f9000008     	str	x8, [x0]
 466bd1c: 97b62aa9     	bl	0x33f67c0 <_ChromeMain+0x33f1524>
 466bd20: aa1403e0     	mov	x0, x20
 466bd24: 9744eab0     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 466bd28: f9076ad4     	str	x20, [x22, #0xed0]
 466bd2c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 466bd30: f0052a36     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 466bd34: f94046c9     	ldr	x9, [x22, #0x88]
 466bd38: eb09011f     	cmp	x8, x9
 466bd3c: 54000061     	b.ne	0x466bd48 <_ChromeMain+0x4666aac>
 466bd40: aa1403e0     	mov	x0, x20
 466bd44: 96e6a16e     	bl	0x142fc <_ChromeMain+0xf060>
 466bd48: f9402660     	ldr	x0, [x19, #0x48]
 466bd4c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 466bd50: f94046c9     	ldr	x9, [x22, #0x88]
 466bd54: eb09011f     	cmp	x8, x9
 466bd58: 54000140     	b.eq	0x466bd80 <_ChromeMain+0x4666ae4>
 466bd5c: f9002674     	str	x20, [x19, #0x48]
 466bd60: aa1303e0     	mov	x0, x19
 466bd64: 9744eaa0     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 466bd68: f90446b3     	str	x19, [x21, #0x888]
 466bd6c: aa1303e0     	mov	x0, x19
 466bd70: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 466bd74: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 466bd78: a8c357f6     	ldp	x22, x21, [sp], #0x30
 466bd7c: d65f03c0     	ret
 466bd80: 96e6db2f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 466bd84: 17fffff6     	b	0x466bd5c <_ChromeMain+0x4666ac0>
 466bd88: d100c3ff     	sub	sp, sp, #0x30
 466bd8c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 466bd90: a9027bfd     	stp	x29, x30, [sp, #0x20]
 466bd94: 910083fd     	add	x29, sp, #0x20
 466bd98: 9113c014     	add	x20, x0, #0x4f0
 466bd9c: 3953e008     	ldrb	w8, [x0, #0x4f8]
 466bda0: 350002e8     	cbnz	w8, 0x466bdfc <_ChromeMain+0x4666b60>
 466bda4: aa0003f3     	mov	x19, x0
 466bda8: f9428008     	ldr	x8, [x0, #0x500]
 466bdac: 91000508     	add	x8, x8, #0x1
 466bdb0: f9028008     	str	x8, [x0, #0x500]
 466bdb4: 390003ff     	strb	wzr, [sp]
 466bdb8: 390013ff     	strb	wzr, [sp, #0x4]
 466bdbc: 390023ff     	strb	wzr, [sp, #0x8]
 466bdc0: 390033ff     	strb	wzr, [sp, #0xc]
 466bdc4: 910003e1     	mov	x1, sp
 466bdc8: 97d2f604     	bl	0x3b295d8 <_ChromeMain+0x3b2433c>
 466bdcc: aa0003e8     	mov	x8, x0
 466bdd0: d2c00300     	mov	x0, #0x1800000000       ; =103079215104
 466bdd4: b3407d00     	bfxil	x0, x8, #0, #32
 466bdd8: 3953e268     	ldrb	w8, [x19, #0x4f8]
 466bddc: 350000c8     	cbnz	w8, 0x466bdf4 <_ChromeMain+0x4666b58>
 466bde0: b4000194     	cbz	x20, 0x466be10 <_ChromeMain+0x4666b74>
 466bde4: f9027a60     	str	x0, [x19, #0x4f0]
 466bde8: 52800028     	mov	w8, #0x1                ; =1
 466bdec: 3913e268     	strb	w8, [x19, #0x4f8]
 466bdf0: 14000004     	b	0x466be00 <_ChromeMain+0x4666b64>
 466bdf4: f9000280     	str	x0, [x20]
 466bdf8: 14000002     	b	0x466be00 <_ChromeMain+0x4666b64>
 466bdfc: f9400280     	ldr	x0, [x20]
 466be00: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 466be04: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 466be08: 9100c3ff     	add	sp, sp, #0x30
 466be0c: d65f03c0     	ret
 466be10: d4200020     	brk	#0x1
 466be14: 3953e008     	ldrb	w8, [x0, #0x4f8]
 466be18: 34000048     	cbz	w8, 0x466be20 <_ChromeMain+0x4666b84>
 466be1c: 3913e01f     	strb	wzr, [x0, #0x4f8]
 466be20: f9400008     	ldr	x8, [x0]
 466be24: f9418501     	ldr	x1, [x8, #0x308]
 466be28: d61f0020     	br	x1
 466be2c: f9400428     	ldr	x8, [x1, #0x8]
 466be30: eb00011f     	cmp	x8, x0
 466be34: 54000040     	b.eq	0x466be3c <_ChromeMain+0x4666ba0>
 466be38: d65f03c0     	ret
 466be3c: 3953e008     	ldrb	w8, [x0, #0x4f8]
 466be40: 34000048     	cbz	w8, 0x466be48 <_ChromeMain+0x4666bac>
 466be44: 3913e01f     	strb	wzr, [x0, #0x4f8]
 466be48: f9400008     	ldr	x8, [x0]
 466be4c: f9418501     	ldr	x1, [x8, #0x308]
 466be50: d61f0020     	br	x1
 466be54: d10243ff     	sub	sp, sp, #0x90
 466be58: a90657f6     	stp	x22, x21, [sp, #0x60]
 466be5c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 466be60: a9087bfd     	stp	x29, x30, [sp, #0x80]
 466be64: 910203fd     	add	x29, sp, #0x80
 466be68: b943bc08     	ldr	w8, [x0, #0x3bc]
 466be6c: d2801ee9     	mov	x9, #0xf7               ; =247
 466be70: f2c00029     	movk	x9, #0x1, lsl #32
 466be74: 9100592a     	add	x10, x9, #0x16
 466be78: 7100091f     	cmp	w8, #0x2
 466be7c: 9a9f014a     	csel	x10, x10, xzr, eq
 466be80: 7100051f     	cmp	w8, #0x1
 466be84: 9a8a0135     	csel	x21, x9, x10, eq
 466be88: d360fea8     	lsr	x8, x21, #32
 466be8c: b40005c8     	cbz	x8, 0x466bf44 <_ChromeMain+0x4666ca8>
 466be90: aa0103f3     	mov	x19, x1
 466be94: aa0003f4     	mov	x20, x0
 466be98: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 466be9c: 6f00e400     	movi.2d	v0, #0000000000000000
 466bea0: 3c8283e0     	stur	q0, [sp, #0x28]
 466bea4: 3c8383e0     	stur	q0, [sp, #0x38]
 466bea8: f90027ff     	str	xzr, [sp, #0x48]
 466beac: d2806029     	mov	x9, #0x301              ; =769
 466beb0: f2f7f009     	movk	x9, #0xbf80, lsl #48
 466beb4: a901a7e8     	stp	x8, x9, [sp, #0x18]
 466beb8: 96fcd44e     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 466bebc: aa1503e1     	mov	x1, x21
 466bec0: 9722f0c2     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 466bec4: 971d8ba9     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 466bec8: 2d0107e0     	stp	s0, s1, [sp, #0x8]
 466becc: 2d020fe2     	stp	s2, s3, [sp, #0x10]
 466bed0: 91070288     	add	x8, x20, #0x1c0
 466bed4: f9406260     	ldr	x0, [x19, #0xc0]
 466bed8: f81d03bf     	stur	xzr, [x29, #-0x30]
 466bedc: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 466bee0: f004c668     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 466bee4: 3dc01101     	ldr	q1, [x8, #0x40]
 466bee8: 6ee14400     	ushl.2d	v0, v0, v1
 466beec: 0ea12800     	xtn.2s	v0, v0
 466bef0: 6f00e401     	movi.2d	v1, #0000000000000000
 466bef4: 0ea16400     	smax.2s	v0, v0, v1
 466bef8: 2e21d800     	ucvtf.2s	v0, v0
 466befc: fc1d83a0     	stur	d0, [x29, #-0x28]
 466bf00: f9400008     	ldr	x8, [x0]
 466bf04: f9408508     	ldr	x8, [x8, #0x108]
 466bf08: d100c3a1     	sub	x1, x29, #0x30
 466bf0c: 1e241000     	fmov	s0, #8.00000000
 466bf10: 1e241001     	fmov	s1, #8.00000000
 466bf14: 910023e2     	add	x2, sp, #0x8
 466bf18: d63f0100     	blr	x8
 466bf1c: f94027e0     	ldr	x0, [sp, #0x48]
 466bf20: b50004a0     	cbnz	x0, 0x466bfb4 <_ChromeMain+0x4666d18>
 466bf24: f94023e0     	ldr	x0, [sp, #0x40]
 466bf28: b5000340     	cbnz	x0, 0x466bf90 <_ChromeMain+0x4666cf4>
 466bf2c: f9401fe0     	ldr	x0, [sp, #0x38]
 466bf30: b5000660     	cbnz	x0, 0x466bffc <_ChromeMain+0x4666d60>
 466bf34: f9401be0     	ldr	x0, [sp, #0x30]
 466bf38: b5000100     	cbnz	x0, 0x466bf58 <_ChromeMain+0x4666cbc>
 466bf3c: f94017e0     	ldr	x0, [sp, #0x28]
 466bf40: b50004c0     	cbnz	x0, 0x466bfd8 <_ChromeMain+0x4666d3c>
 466bf44: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 466bf48: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 466bf4c: a94657f6     	ldp	x22, x21, [sp, #0x60]
 466bf50: 910243ff     	add	sp, sp, #0x90
 466bf54: d65f03c0     	ret
 466bf58: 91002008     	add	x8, x0, #0x8
 466bf5c: 12800009     	mov	w9, #-0x1               ; =-1
 466bf60: b8e90108     	ldaddal	w9, w8, [x8]
 466bf64: 7100051f     	cmp	w8, #0x1
 466bf68: 54fffea1     	b.ne	0x466bf3c <_ChromeMain+0x4666ca0>
 466bf6c: f9400009     	ldr	x9, [x0]
 466bf70: f9400928     	ldr	x8, [x9, #0x10]
 466bf74: d0fdcdca     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 466bf78: 9106014a     	add	x10, x10, #0x180
 466bf7c: eb0a011f     	cmp	x8, x10
 466bf80: 54000041     	b.ne	0x466bf88 <_ChromeMain+0x4666cec>
 466bf84: f9400528     	ldr	x8, [x9, #0x8]
 466bf88: d63f0100     	blr	x8
 466bf8c: 17ffffec     	b	0x466bf3c <_ChromeMain+0x4666ca0>
 466bf90: 91002008     	add	x8, x0, #0x8
 466bf94: 12800009     	mov	w9, #-0x1               ; =-1
 466bf98: b8e90108     	ldaddal	w9, w8, [x8]
 466bf9c: 7100051f     	cmp	w8, #0x1
 466bfa0: 54fffc61     	b.ne	0x466bf2c <_ChromeMain+0x4666c90>
 466bfa4: f9400008     	ldr	x8, [x0]
 466bfa8: f9400908     	ldr	x8, [x8, #0x10]
 466bfac: d63f0100     	blr	x8
 466bfb0: 17ffffdf     	b	0x466bf2c <_ChromeMain+0x4666c90>
 466bfb4: 91002008     	add	x8, x0, #0x8
 466bfb8: 12800009     	mov	w9, #-0x1               ; =-1
 466bfbc: b8e90108     	ldaddal	w9, w8, [x8]
 466bfc0: 7100051f     	cmp	w8, #0x1
 466bfc4: 54fffb01     	b.ne	0x466bf24 <_ChromeMain+0x4666c88>
 466bfc8: f9400008     	ldr	x8, [x0]
 466bfcc: f9400908     	ldr	x8, [x8, #0x10]
 466bfd0: d63f0100     	blr	x8
 466bfd4: 17ffffd4     	b	0x466bf24 <_ChromeMain+0x4666c88>
 466bfd8: 91002008     	add	x8, x0, #0x8
 466bfdc: 12800009     	mov	w9, #-0x1               ; =-1
 466bfe0: b8e90108     	ldaddal	w9, w8, [x8]
 466bfe4: 7100051f     	cmp	w8, #0x1
 466bfe8: 54fffae1     	b.ne	0x466bf44 <_ChromeMain+0x4666ca8>
 466bfec: f9400008     	ldr	x8, [x0]
 466bff0: f9400908     	ldr	x8, [x8, #0x10]
 466bff4: d63f0100     	blr	x8
 466bff8: 17ffffd3     	b	0x466bf44 <_ChromeMain+0x4666ca8>
 466bffc: 91002008     	add	x8, x0, #0x8
 466c000: 12800009     	mov	w9, #-0x1               ; =-1
 466c004: b8e90108     	ldaddal	w9, w8, [x8]
 466c008: 7100051f     	cmp	w8, #0x1
 466c00c: 54fff941     	b.ne	0x466bf34 <_ChromeMain+0x4666c98>
 466c010: f9400008     	ldr	x8, [x0]
 466c014: f9400908     	ldr	x8, [x8, #0x10]
 466c018: d63f0100     	blr	x8
 466c01c: 17ffffc6     	b	0x466bf34 <_ChromeMain+0x4666c98>
 466c020: d10183ff     	sub	sp, sp, #0x60
 466c024: a90357f6     	stp	x22, x21, [sp, #0x30]
 466c028: a9044ff4     	stp	x20, x19, [sp, #0x40]
 466c02c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 466c030: 910143fd     	add	x29, sp, #0x50
 466c034: aa0003f3     	mov	x19, x0
 466c038: f9426400     	ldr	x0, [x0, #0x4c8]
 466c03c: b4000360     	cbz	x0, 0x466c0a8 <_ChromeMain+0x4666e0c>
 466c040: f9426e74     	ldr	x20, [x19, #0x4d8]
 466c044: 52801c55     	mov	w21, #0xe2              ; =226
 466c048: b90003f5     	str	w21, [sp]
 466c04c: 390013ff     	strb	wzr, [sp, #0x4]
 466c050: 910023e8     	add	x8, sp, #0x8
 466c054: 910003e1     	mov	x1, sp
 466c058: 52800182     	mov	w2, #0xc                ; =12
 466c05c: d2800003     	mov	x3, #0x0                ; =0
 466c060: 971e2230     	bl	0xdf4920 <_ChromeMain+0xdef684>
 466c064: 910023e1     	add	x1, sp, #0x8
 466c068: aa1403e0     	mov	x0, x20
 466c06c: 96fcd40d     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 466c070: 910023e0     	add	x0, sp, #0x8
 466c074: 970769f3     	bl	0x846840 <_ChromeMain+0x8415a4>
 466c078: f9427260     	ldr	x0, [x19, #0x4e0]
 466c07c: b9000bf5     	str	w21, [sp, #0x8]
 466c080: 390033ff     	strb	wzr, [sp, #0xc]
 466c084: f9400008     	ldr	x8, [x0]
 466c088: f941f508     	ldr	x8, [x8, #0x3e8]
 466c08c: 910023e1     	add	x1, sp, #0x8
 466c090: d63f0100     	blr	x8
 466c094: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 466c098: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 466c09c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 466c0a0: 910183ff     	add	sp, sp, #0x60
 466c0a4: d65f03c0     	ret
 466c0a8: d4200000     	brk	#0
 466c0ac: d4400000     	hlt	#0
 466c0b0: d4200020     	brk	#0x1
 466c0b4: 16fcd432     	b	0x5a117c <_ChromeMain+0x59bee0>
