
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 456bb40: d10383ff     	sub	sp, sp, #0xe0
 456bb44: a9086ffc     	stp	x28, x27, [sp, #0x80]
 456bb48: a90967fa     	stp	x26, x25, [sp, #0x90]
 456bb4c: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 456bb50: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 456bb54: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 456bb58: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 456bb5c: 910343fd     	add	x29, sp, #0xd0
 456bb60: aa0303fc     	mov	x28, x3
 456bb64: aa0203f9     	mov	x25, x2
 456bb68: f90007e1     	str	x1, [sp, #0x8]
 456bb6c: aa0003f4     	mov	x20, x0
 456bb70: 97380d74     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 456bb74: d0050b53     	adrp	x19, 0xe6d5000 <dyld_stub_binder+0xe6d5000>
 456bb78: 9110c273     	add	x19, x19, #0x430
 456bb7c: 910fa268     	add	x8, x19, #0x3e8
 456bb80: a9002013     	stp	x19, x8, [x0]
 456bb84: 91104268     	add	x8, x19, #0x410
 456bb88: f9000808     	str	x8, [x0, #0x10]
 456bb8c: 91112268     	add	x8, x19, #0x448
 456bb90: 9111e269     	add	x9, x19, #0x478
 456bb94: a906a408     	stp	x8, x9, [x0, #0x68]
 456bb98: 91132268     	add	x8, x19, #0x4c8
 456bb9c: f9005808     	str	x8, [x0, #0xb0]
 456bba0: 9114a268     	add	x8, x19, #0x528
 456bba4: f9006c08     	str	x8, [x0, #0xd8]
 456bba8: 91156268     	add	x8, x19, #0x558
 456bbac: f9007c08     	str	x8, [x0, #0xf8]
 456bbb0: 52800400     	mov	w0, #0x20               ; =32
 456bbb4: 96ea8ded     	bl	0xf368 <_ChromeMain+0xa0cc>
 456bbb8: aa0003e1     	mov	x1, x0
 456bbbc: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 456bbc0: b9000808     	str	w8, [x0, #0x8]
 456bbc4: 52800028     	mov	w8, #0x1                ; =1
 456bbc8: 39003008     	strb	w8, [x0, #0xc]
 456bbcc: b004ef08     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 456bbd0: 91044108     	add	x8, x8, #0x110
 456bbd4: f9000008     	str	x8, [x0]
 456bbd8: 4f000500     	movi.4s	v0, #0x8
 456bbdc: 3d800400     	str	q0, [x0, #0x10]
 456bbe0: f9408a68     	ldr	x8, [x19, #0x110]
 456bbe4: f90013f4     	str	x20, [sp, #0x20]
 456bbe8: aa1403e0     	mov	x0, x20
 456bbec: d63f0100     	blr	x8
 456bbf0: b0052b53     	adrp	x19, 0xead4000 <dyld_stub_binder+0xead4000>
 456bbf4: 91316273     	add	x19, x19, #0xc58
 456bbf8: 5280f015     	mov	w21, #0x780             ; =1920
 456bbfc: d0050b5a     	adrp	x26, 0xe6d5000 <dyld_stub_binder+0xe6d5000>
 456bc00: 9126c35a     	add	x26, x26, #0x9b0
 456bc04: aa1303f7     	mov	x23, x19
 456bc08: a90173f9     	stp	x25, x28, [sp, #0x10]
 456bc0c: 140000f5     	b	0x456bfe0 <_ChromeMain+0x4566d44>
 456bc10: f94002f8     	ldr	x24, [x23]
 456bc14: aa1803e0     	mov	x0, x24
 456bc18: f94007e1     	ldr	x1, [sp, #0x8]
 456bc1c: aa1903e2     	mov	x2, x25
 456bc20: 94ea7710     	bl	0x8009860 <_ChromeMain+0x80045c4>
 456bc24: 7100001f     	cmp	w0, #0x0
 456bc28: 1a9f17fb     	cset	w27, eq
 456bc2c: 92800228     	mov	x8, #-0x12              ; =-18
 456bc30: f2efffe8     	movk	x8, #0x7fff, lsl #48
 456bc34: eb0802df     	cmp	x22, x8
 456bc38: 54002408     	b.hi	0x456c0b8 <_ChromeMain+0x4566e1c>
 456bc3c: f1005adf     	cmp	x22, #0x16
 456bc40: 54000229     	b.ls	0x456bc84 <_ChromeMain+0x45669e8>
 456bc44: 927cead4     	and	x20, x22, #0x7ffffffffffffff0
 456bc48: 91004280     	add	x0, x20, #0x10
 456bc4c: 96ea8dc7     	bl	0xf368 <_ChromeMain+0xa0cc>
 456bc50: aa0003f9     	mov	x25, x0
 456bc54: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 456bc58: cb080288     	sub	x8, x20, x8
 456bc5c: a902dbe0     	stp	x0, x22, [sp, #0x28]
 456bc60: f9001fe8     	str	x8, [sp, #0x38]
 456bc64: 1400000a     	b	0x456bc8c <_ChromeMain+0x45669f0>
 456bc68: 12800008     	mov	w8, #-0x1               ; =-1
 456bc6c: b8e80008     	ldaddal	w8, w8, [x0]
 456bc70: 7100051f     	cmp	w8, #0x1
 456bc74: 54000781     	b.ne	0x456bd64 <_ChromeMain+0x4566ac8>
 456bc78: f9400808     	ldr	x8, [x0, #0x10]
 456bc7c: d63f0100     	blr	x8
 456bc80: 14000039     	b	0x456bd64 <_ChromeMain+0x4566ac8>
 456bc84: 3900fff6     	strb	w22, [sp, #0x3f]
 456bc88: 9100a3f9     	add	x25, sp, #0x28
 456bc8c: 8b160328     	add	x8, x25, x22
 456bc90: eb19011f     	cmp	x8, x25
 456bc94: 54001f03     	b.lo	0x456c074 <_ChromeMain+0x4566dd8>
 456bc98: eb19031f     	cmp	x24, x25
 456bc9c: fa482302     	ccmp	x24, x8, #0x2, hs
 456bca0: 54001ea3     	b.lo	0x456c074 <_ChromeMain+0x4566dd8>
 456bca4: aa1903e0     	mov	x0, x25
 456bca8: aa1803e1     	mov	x1, x24
 456bcac: aa1603e2     	mov	x2, x22
 456bcb0: 94ea8d87     	bl	0x800f2cc <_ChromeMain+0x800a030>
 456bcb4: 38366b3f     	strb	wzr, [x25, x22]
 456bcb8: 52800800     	mov	w0, #0x40               ; =64
 456bcbc: 96ea8dab     	bl	0xf368 <_ChromeMain+0xa0cc>
 456bcc0: aa0003f6     	mov	x22, x0
 456bcc4: 52800034     	mov	w20, #0x1               ; =1
 456bcc8: b9000014     	str	w20, [x0]
 456bccc: f0040c28     	adrp	x8, 0xc6f2000 <_ChromeMain+0xc6ecd64>
 456bcd0: 91026109     	add	x9, x8, #0x98
 456bcd4: 90ffd668     	adrp	x8, 0x4037000 <_ChromeMain+0x4031d64>
 456bcd8: 9134a108     	add	x8, x8, #0xd28
 456bcdc: a900a009     	stp	x9, x8, [x0, #0x8]
 456bce0: f0ffd648     	adrp	x8, 0x4036000 <_ChromeMain+0x4030d64>
 456bce4: 911ae108     	add	x8, x8, #0x6b8
 456bce8: a901f008     	stp	x8, x28, [x0, #0x18]
 456bcec: b400201c     	cbz	x28, 0x456c0ec <_ChromeMain+0x4566e50>
 456bcf0: b8340388     	ldadd	w20, w8, [x28]
 456bcf4: 7100011f     	cmp	w8, #0x0
 456bcf8: 54001f4d     	b.le	0x456c0e0 <_ChromeMain+0x4566e44>
 456bcfc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 456bd00: 6b09011f     	cmp	w8, w9
 456bd04: 54001e80     	b.eq	0x456c0d4 <_ChromeMain+0x4566e38>
 456bd08: 3cc283e0     	ldur	q0, [sp, #0x28]
 456bd0c: 3c8282c0     	stur	q0, [x22, #0x28]
 456bd10: f9401fe8     	ldr	x8, [sp, #0x38]
 456bd14: f9001ec8     	str	x8, [x22, #0x38]
 456bd18: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 456bd1c: f90017ff     	str	xzr, [sp, #0x28]
 456bd20: f0054ce8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 456bd24: 91120108     	add	x8, x8, #0x480
 456bd28: f8bfc100     	ldapr	x0, [x8]
 456bd2c: b4001ca0     	cbz	x0, 0x456c0c0 <_ChromeMain+0x4566e24>
 456bd30: 52809801     	mov	w1, #0x4c0              ; =1216
 456bd34: d2800002     	mov	x2, #0x0                ; =0
 456bd38: 96ecfe1e     	bl	0xab5b0 <_ChromeMain+0xa6314>
 456bd3c: aa0003fc     	mov	x28, x0
 456bd40: f81a03b6     	stur	x22, [x29, #-0x60]
 456bd44: 381a83b4     	sturb	w20, [x29, #-0x58]
 456bd48: d10183a1     	sub	x1, x29, #0x60
 456bd4c: 973809cd     	bl	0x136e480 <_ChromeMain+0x13691e4>
 456bd50: 385a83a8     	ldurb	w8, [x29, #-0x58]
 456bd54: 7103fd1f     	cmp	w8, #0xff
 456bd58: 54000060     	b.eq	0x456bd64 <_ChromeMain+0x4566ac8>
 456bd5c: f85a03a0     	ldur	x0, [x29, #-0x60]
 456bd60: b5fff840     	cbnz	x0, 0x456bc68 <_ChromeMain+0x45669cc>
 456bd64: 52801fe8     	mov	w8, #0xff               ; =255
 456bd68: 381a83a8     	sturb	w8, [x29, #-0x58]
 456bd6c: 91118348     	add	x8, x26, #0x460
 456bd70: a900239a     	stp	x26, x8, [x28]
 456bd74: 91122348     	add	x8, x26, #0x488
 456bd78: f9000b88     	str	x8, [x28, #0x10]
 456bd7c: 91130348     	add	x8, x26, #0x4c0
 456bd80: 9113c349     	add	x9, x26, #0x4f0
 456bd84: a906a788     	stp	x8, x9, [x28, #0x68]
 456bd88: 91150348     	add	x8, x26, #0x540
 456bd8c: f9005b88     	str	x8, [x28, #0xb0]
 456bd90: 91168348     	add	x8, x26, #0x5a0
 456bd94: aa1c03f6     	mov	x22, x28
 456bd98: f80d8ec8     	str	x8, [x22, #0xd8]!
 456bd9c: 91174348     	add	x8, x26, #0x5d0
 456bda0: aa1c03f8     	mov	x24, x28
 456bda4: f80f8f08     	str	x8, [x24, #0xf8]!
 456bda8: 9117e348     	add	x8, x26, #0x5f8
 456bdac: f9018b88     	str	x8, [x28, #0x310]
 456bdb0: 9119e348     	add	x8, x26, #0x678
 456bdb4: f9018f88     	str	x8, [x28, #0x318]
 456bdb8: 911ce348     	add	x8, x26, #0x738
 456bdbc: f9019388     	str	x8, [x28, #0x320]
 456bdc0: 925e7668     	and	x8, x19, #0xfffffffc00000000
 456bdc4: f0053229     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 456bdc8: f9404529     	ldr	x9, [x9, #0x88]
 456bdcc: eb09011f     	cmp	x8, x9
 456bdd0: 54000061     	b.ne	0x456bddc <_ChromeMain+0x4566b40>
 456bdd4: aa1303e0     	mov	x0, x19
 456bdd8: 96eaa149     	bl	0x142fc <_ChromeMain+0xf060>
 456bddc: f9025b97     	str	x23, [x28, #0x4b0]
 456bde0: 3912e39b     	strb	w27, [x28, #0x4b8]
 456bde4: f9424388     	ldr	x8, [x28, #0x480]
 456bde8: b900191f     	str	wzr, [x8, #0x18]
 456bdec: b9446788     	ldr	w8, [x28, #0x464]
 456bdf0: 7120011f     	cmp	w8, #0x800
 456bdf4: 540000e0     	b.eq	0x456be10 <_ChromeMain+0x4566b74>
 456bdf8: 91119388     	add	x8, x28, #0x464
 456bdfc: 52810009     	mov	w9, #0x800              ; =2048
 456be00: b9000109     	str	w9, [x8]
 456be04: 91119381     	add	x1, x28, #0x464
 456be08: aa1803e0     	mov	x0, x24
 456be0c: 9726f071     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 456be10: aa1c03e0     	mov	x0, x28
 456be14: b21e0be1     	mov	x1, #0x1c0000001c       ; =120259084316
 456be18: 52800022     	mov	w2, #0x1                ; =1
 456be1c: 97899711     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 456be20: aa1c03e0     	mov	x0, x28
 456be24: 52800021     	mov	w1, #0x1                ; =1
 456be28: 973f2e6d     	bl	0x15377dc <_ChromeMain+0x1532540>
 456be2c: aa1c03e0     	mov	x0, x28
 456be30: 97380c04     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 456be34: 52800600     	mov	w0, #0x30               ; =48
 456be38: 96ea8d4c     	bl	0xf368 <_ChromeMain+0xa0cc>
 456be3c: aa0003e4     	mov	x4, x0
 456be40: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 456be44: 7900301f     	strh	wzr, [x0, #0x18]
 456be48: f004ef08     	adrp	x8, 0xe34e000 <dyld_stub_binder+0xe34e000>
 456be4c: 91362108     	add	x8, x8, #0xd88
 456be50: f9000008     	str	x8, [x0]
 456be54: 4f00f700     	fmov.4s	v0, #6.00000000
 456be58: 3c81c000     	stur	q0, [x0, #0x1c]
 456be5c: aa1603e0     	mov	x0, x22
 456be60: d00524c1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 456be64: 9114a021     	add	x1, x1, #0x528
 456be68: d004bec2     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 456be6c: 91264842     	add	x2, x2, #0x992
 456be70: b0ff4803     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 456be74: 913c0063     	add	x3, x3, #0xf00
 456be78: d2800005     	mov	x5, #0x0                ; =0
 456be7c: 9717f8c8     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 456be80: b5000c80     	cbnz	x0, 0x456c010 <_ChromeMain+0x4566d74>
 456be84: f9416780     	ldr	x0, [x28, #0x2c8]
 456be88: b4000cc0     	cbz	x0, 0x456c020 <_ChromeMain+0x4566d84>
 456be8c: 52800f81     	mov	w1, #0x7c               ; =124
 456be90: 97448994     	bl	0x168e4e0 <_ChromeMain+0x1689244>
 456be94: f9416796     	ldr	x22, [x28, #0x2c8]
 456be98: b4000d96     	cbz	x22, 0x456c048 <_ChromeMain+0x4566dac>
 456be9c: f94012f4     	ldr	x20, [x23, #0x20]
 456bea0: 92800228     	mov	x8, #-0x12              ; =-18
 456bea4: f2efffe8     	movk	x8, #0x7fff, lsl #48
 456bea8: eb08029f     	cmp	x20, x8
 456beac: 54001088     	b.hi	0x456c0bc <_ChromeMain+0x4566e20>
 456beb0: f9400efb     	ldr	x27, [x23, #0x18]
 456beb4: f1002a9f     	cmp	x20, #0xa
 456beb8: 54000a09     	b.ls	0x456bff8 <_ChromeMain+0x4566d5c>
 456bebc: 927dee98     	and	x24, x20, #0x7ffffffffffffff8
 456bec0: d37ffb08     	lsl	x8, x24, #1
 456bec4: 91004100     	add	x0, x8, #0x10
 456bec8: 96ea8d28     	bl	0xf368 <_ChromeMain+0xa0cc>
 456becc: aa0003f9     	mov	x25, x0
 456bed0: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 456bed4: cb080308     	sub	x8, x24, x8
 456bed8: a905d3e0     	stp	x0, x20, [sp, #0x58]
 456bedc: f90037e8     	str	x8, [sp, #0x68]
 456bee0: 8b140728     	add	x8, x25, x20, lsl #1
 456bee4: eb19011f     	cmp	x8, x25
 456bee8: 54000c63     	b.lo	0x456c074 <_ChromeMain+0x4566dd8>
 456beec: eb19037f     	cmp	x27, x25
 456bef0: 54000063     	b.lo	0x456befc <_ChromeMain+0x4566c60>
 456bef4: eb08037f     	cmp	x27, x8
 456bef8: 54000be3     	b.lo	0x456c074 <_ChromeMain+0x4566dd8>
 456befc: d37ffa98     	lsl	x24, x20, #1
 456bf00: aa1903e0     	mov	x0, x25
 456bf04: aa1b03e1     	mov	x1, x27
 456bf08: aa1803e2     	mov	x2, x24
 456bf0c: 94ea8cf0     	bl	0x800f2cc <_ChromeMain+0x800a030>
 456bf10: 78347b3f     	strh	wzr, [x25, x20, lsl #1]
 456bf14: 910163e1     	add	x1, sp, #0x58
 456bf18: aa1603e0     	mov	x0, x22
 456bf1c: 9730066f     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 456bf20: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 456bf24: 36f800a8     	tbz	w8, #0x1f, 0x456bf38 <_ChromeMain+0x4566c9c>
 456bf28: f9402fe0     	ldr	x0, [sp, #0x58]
 456bf2c: f94037e8     	ldr	x8, [sp, #0x68]
 456bf30: d37ff901     	lsl	x1, x8, #1
 456bf34: 96ea73e1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 456bf38: f1002a9f     	cmp	x20, #0xa
 456bf3c: 54000649     	b.ls	0x456c004 <_ChromeMain+0x4566d68>
 456bf40: 927dee96     	and	x22, x20, #0x7ffffffffffffff8
 456bf44: d37ffac8     	lsl	x8, x22, #1
 456bf48: 91004100     	add	x0, x8, #0x10
 456bf4c: 96ea8d07     	bl	0xf368 <_ChromeMain+0xa0cc>
 456bf50: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 456bf54: cb0802c8     	sub	x8, x22, x8
 456bf58: a90453e0     	stp	x0, x20, [sp, #0x40]
 456bf5c: f9002be8     	str	x8, [sp, #0x50]
 456bf60: 8b140414     	add	x20, x0, x20, lsl #1
 456bf64: eb00029f     	cmp	x20, x0
 456bf68: 54000863     	b.lo	0x456c074 <_ChromeMain+0x4566dd8>
 456bf6c: eb00037f     	cmp	x27, x0
 456bf70: 54000063     	b.lo	0x456bf7c <_ChromeMain+0x4566ce0>
 456bf74: eb14037f     	cmp	x27, x20
 456bf78: 540007e3     	b.lo	0x456c074 <_ChromeMain+0x4566dd8>
 456bf7c: aa1b03e1     	mov	x1, x27
 456bf80: aa1803e2     	mov	x2, x24
 456bf84: 94ea8cd2     	bl	0x800f2cc <_ChromeMain+0x800a030>
 456bf88: 7900029f     	strh	wzr, [x20]
 456bf8c: 910103e1     	add	x1, sp, #0x40
 456bf90: aa1c03e0     	mov	x0, x28
 456bf94: 970b6a6c     	bl	0x846944 <_ChromeMain+0x8416a8>
 456bf98: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 456bf9c: 36f800a8     	tbz	w8, #0x1f, 0x456bfb0 <_ChromeMain+0x4566d14>
 456bfa0: f94023e0     	ldr	x0, [sp, #0x40]
 456bfa4: f9402be8     	ldr	x8, [sp, #0x50]
 456bfa8: d37ff901     	lsl	x1, x8, #1
 456bfac: 96ea73c3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 456bfb0: 3945a788     	ldrb	w8, [x28, #0x169]
 456bfb4: f9400bf9     	ldr	x25, [sp, #0x10]
 456bfb8: 35000888     	cbnz	w8, 0x456c0c8 <_ChromeMain+0x4566e2c>
 456bfbc: f94013e0     	ldr	x0, [sp, #0x20]
 456bfc0: f940cc02     	ldr	x2, [x0, #0x198]
 456bfc4: aa1c03e1     	mov	x1, x28
 456bfc8: 9708350d     	bl	0x7793fc <_ChromeMain+0x774160>
 456bfcc: 9100a2f7     	add	x23, x23, #0x28
 456bfd0: 9100a273     	add	x19, x19, #0x28
 456bfd4: f100a2b5     	subs	x21, x21, #0x28
 456bfd8: f9400ffc     	ldr	x28, [sp, #0x18]
 456bfdc: 540004e0     	b.eq	0x456c078 <_ChromeMain+0x4566ddc>
 456bfe0: f94006f6     	ldr	x22, [x23, #0x8]
 456bfe4: eb1902df     	cmp	x22, x25
 456bfe8: 54ffe140     	b.eq	0x456bc10 <_ChromeMain+0x4566974>
 456bfec: 5280001b     	mov	w27, #0x0               ; =0
 456bff0: f94002f8     	ldr	x24, [x23]
 456bff4: 17ffff0e     	b	0x456bc2c <_ChromeMain+0x4566990>
 456bff8: 3901bff4     	strb	w20, [sp, #0x6f]
 456bffc: 910163f9     	add	x25, sp, #0x58
 456c000: 17ffffb8     	b	0x456bee0 <_ChromeMain+0x4566c44>
 456c004: 39015ff4     	strb	w20, [sp, #0x57]
 456c008: 910103e0     	add	x0, sp, #0x40
 456c00c: 17ffffd5     	b	0x456bf60 <_ChromeMain+0x4566cc4>
 456c010: f9400008     	ldr	x8, [x0]
 456c014: f9400508     	ldr	x8, [x8, #0x8]
 456c018: d63f0100     	blr	x8
 456c01c: 17ffff9a     	b	0x456be84 <_ChromeMain+0x4566be8>
 456c020: 900534e0     	adrp	x0, 0xec08000 <dyld_stub_binder+0xec08000>
 456c024: 912f4000     	add	x0, x0, #0xbd0
 456c028: 96eeb496     	bl	0x119280 <_ChromeMain+0x113fe4>
 456c02c: 35000780     	cbnz	w0, 0x456c11c <_ChromeMain+0x4566e80>
 456c030: aa1c03e0     	mov	x0, x28
 456c034: 9735c988     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 456c038: f9416788     	ldr	x8, [x28, #0x2c8]
 456c03c: f9016780     	str	x0, [x28, #0x2c8]
 456c040: b4fff268     	cbz	x8, 0x456be8c <_ChromeMain+0x4566bf0>
 456c044: 1400003b     	b	0x456c130 <_ChromeMain+0x4566e94>
 456c048: 900534e0     	adrp	x0, 0xec08000 <dyld_stub_binder+0xec08000>
 456c04c: 912f4000     	add	x0, x0, #0xbd0
 456c050: 96eeb48c     	bl	0x119280 <_ChromeMain+0x113fe4>
 456c054: 350007a0     	cbnz	w0, 0x456c148 <_ChromeMain+0x4566eac>
 456c058: aa1c03e0     	mov	x0, x28
 456c05c: 9735c97e     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 456c060: aa0003f6     	mov	x22, x0
 456c064: f9416780     	ldr	x0, [x28, #0x2c8]
 456c068: f9016796     	str	x22, [x28, #0x2c8]
 456c06c: b4fff180     	cbz	x0, 0x456be9c <_ChromeMain+0x4566c00>
 456c070: 14000026     	b	0x456c108 <_ChromeMain+0x4566e6c>
 456c074: d4200020     	brk	#0x1
 456c078: 12800008     	mov	w8, #-0x1               ; =-1
 456c07c: b8e80388     	ldaddal	w8, w8, [x28]
 456c080: 7100051f     	cmp	w8, #0x1
 456c084: 54000081     	b.ne	0x456c094 <_ChromeMain+0x4566df8>
 456c088: f9400b88     	ldr	x8, [x28, #0x10]
 456c08c: aa1c03e0     	mov	x0, x28
 456c090: d63f0100     	blr	x8
 456c094: f94013e0     	ldr	x0, [sp, #0x20]
 456c098: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 456c09c: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 456c0a0: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 456c0a4: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 456c0a8: a94967fa     	ldp	x26, x25, [sp, #0x90]
 456c0ac: a9486ffc     	ldp	x28, x27, [sp, #0x80]
 456c0b0: 910383ff     	add	sp, sp, #0xe0
 456c0b4: d65f03c0     	ret
 456c0b8: 941a50b5     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 456c0bc: 941ee03b     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 456c0c0: 97f59d8e     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 456c0c4: 17ffff1b     	b	0x456bd30 <_ChromeMain+0x4566a94>
 456c0c8: d4200000     	brk	#0
 456c0cc: d4400000     	hlt	#0
 456c0d0: d4200020     	brk	#0x1
 456c0d4: d4200000     	brk	#0
 456c0d8: d4400000     	hlt	#0
 456c0dc: d4200020     	brk	#0x1
 456c0e0: d4200000     	brk	#0
 456c0e4: d4400000     	hlt	#0
 456c0e8: d4200020     	brk	#0x1
 456c0ec: 3cc283e0     	ldur	q0, [sp, #0x28]
 456c0f0: 3c8282c0     	stur	q0, [x22, #0x28]
 456c0f4: f9401fe8     	ldr	x8, [sp, #0x38]
 456c0f8: f9001ec8     	str	x8, [x22, #0x38]
 456c0fc: d4200000     	brk	#0
 456c100: d4400000     	hlt	#0
 456c104: d4200020     	brk	#0x1
 456c108: f9400008     	ldr	x8, [x0]
 456c10c: f9400508     	ldr	x8, [x8, #0x8]
 456c110: d63f0100     	blr	x8
 456c114: f9416796     	ldr	x22, [x28, #0x2c8]
 456c118: 17ffff61     	b	0x456be9c <_ChromeMain+0x4566c00>
 456c11c: 52803600     	mov	w0, #0x1b0              ; =432
 456c120: 96ea8c92     	bl	0xf368 <_ChromeMain+0xa0cc>
 456c124: aa1c03e1     	mov	x1, x28
 456c128: 9725e696     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 456c12c: 17ffffc3     	b	0x456c038 <_ChromeMain+0x4566d9c>
 456c130: f9400109     	ldr	x9, [x8]
 456c134: f9400529     	ldr	x9, [x9, #0x8]
 456c138: aa0803e0     	mov	x0, x8
 456c13c: d63f0120     	blr	x9
 456c140: f9416780     	ldr	x0, [x28, #0x2c8]
 456c144: 17ffff52     	b	0x456be8c <_ChromeMain+0x4566bf0>
 456c148: 52803600     	mov	w0, #0x1b0              ; =432
 456c14c: 96ea8c87     	bl	0xf368 <_ChromeMain+0xa0cc>
 456c150: aa0003f6     	mov	x22, x0
 456c154: aa1c03e1     	mov	x1, x28
 456c158: 9725e68a     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 456c15c: 17ffffc2     	b	0x456c064 <_ChromeMain+0x4566dc8>
 456c160: d2801fc0     	mov	x0, #0xfe               ; =254
 456c164: f2c01840     	movk	x0, #0xc2, lsl #32
 456c168: d65f03c0     	ret
 456c16c: 00000000     	udf	#0x0
 456c170: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 456c174: a9014ff4     	stp	x20, x19, [sp, #0x10]
 456c178: a9027bfd     	stp	x29, x30, [sp, #0x20]
 456c17c: 910083fd     	add	x29, sp, #0x20
 456c180: 79411028     	ldrh	w8, [x1, #0x88]
 456c184: 51009508     	sub	w8, w8, #0x25
 456c188: 12003d09     	and	w9, w8, #0xffff
 456c18c: 71000d3f     	cmp	w9, #0x3
 456c190: 540000c9     	b.ls	0x456c1a8 <_ChromeMain+0x4566f0c>
 456c194: 52800000     	mov	w0, #0x0                ; =0
 456c198: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 456c19c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 456c1a0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 456c1a4: d65f03c0     	ret
 456c1a8: aa0003f3     	mov	x19, x0
 456c1ac: 92403d08     	and	x8, x8, #0xffff
 456c1b0: f004cec9     	adrp	x9, 0xdf47000 <dyld_stub_binder+0xdf47000>
 456c1b4: 91220129     	add	x9, x9, #0x880
 456c1b8: b8687936     	ldr	w22, [x9, x8, lsl #2]
 456c1bc: aa0003f4     	mov	x20, x0
 456c1c0: f84d8688     	ldr	x8, [x20], #0xd8
 456c1c4: f9403508     	ldr	x8, [x8, #0x68]
 456c1c8: d63f0100     	blr	x8
 456c1cc: aa0003f5     	mov	x21, x0
 456c1d0: b00524c1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 456c1d4: 91192021     	add	x1, x1, #0x648
 456c1d8: aa1403e0     	mov	x0, x20
 456c1dc: d2800002     	mov	x2, #0x0                ; =0
 456c1e0: 52800003     	mov	w3, #0x0                ; =0
 456c1e4: 9756074e     	bl	0x1aedf1c <_ChromeMain+0x1ae8c80>
 456c1e8: b5000600     	cbnz	x0, 0x456c2a8 <_ChromeMain+0x456700c>
 456c1ec: b4fffd55     	cbz	x21, 0x456c194 <_ChromeMain+0x4566ef8>
 456c1f0: aa1503e0     	mov	x0, x21
 456c1f4: 970b6db7     	bl	0x8478d0 <_ChromeMain+0x842634>
 456c1f8: b4fffd00     	cbz	x0, 0x456c198 <_ChromeMain+0x4566efc>
 456c1fc: f9400268     	ldr	x8, [x19]
 456c200: f9403508     	ldr	x8, [x8, #0x68]
 456c204: aa1303e0     	mov	x0, x19
 456c208: d63f0100     	blr	x8
 456c20c: aa0003f5     	mov	x21, x0
 456c210: b00524c1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 456c214: 91192021     	add	x1, x1, #0x648
 456c218: aa1403e0     	mov	x0, x20
 456c21c: d2800002     	mov	x2, #0x0                ; =0
 456c220: 52800003     	mov	w3, #0x0                ; =0
 456c224: 9756073e     	bl	0x1aedf1c <_ChromeMain+0x1ae8c80>
 456c228: b5000480     	cbnz	x0, 0x456c2b8 <_ChromeMain+0x456701c>
 456c22c: b4000255     	cbz	x21, 0x456c274 <_ChromeMain+0x4566fd8>
 456c230: aa1503e0     	mov	x0, x21
 456c234: 970b6da7     	bl	0x8478d0 <_ChromeMain+0x842634>
 456c238: f940ce68     	ldr	x8, [x19, #0x198]
 456c23c: d37df10a     	lsl	x10, x8, #3
 456c240: b4fffaaa     	cbz	x10, 0x456c194 <_ChromeMain+0x4566ef8>
 456c244: d280000b     	mov	x11, #0x0               ; =0
 456c248: f9400c0c     	ldr	x12, [x0, #0x18]
 456c24c: f940ca69     	ldr	x9, [x19, #0x190]
 456c250: 0b0802cd     	add	w13, w22, w8
 456c254: f86b692e     	ldr	x14, [x9, x11]
 456c258: eb0c01df     	cmp	x14, x12
 456c25c: 54000100     	b.eq	0x456c27c <_ChromeMain+0x4566fe0>
 456c260: 110005ad     	add	w13, w13, #0x1
 456c264: 9100216b     	add	x11, x11, #0x8
 456c268: eb0b015f     	cmp	x10, x11
 456c26c: 54ffff41     	b.ne	0x456c254 <_ChromeMain+0x4566fb8>
 456c270: 17ffffc9     	b	0x456c194 <_ChromeMain+0x4566ef8>
 456c274: d2800000     	mov	x0, #0x0                ; =0
 456c278: 17fffff0     	b	0x456c238 <_ChromeMain+0x4566f9c>
 456c27c: 1ac80daa     	sdiv	w10, w13, w8
 456c280: 1b08b54a     	msub	w10, w10, w8, w13
 456c284: eb2ac11f     	cmp	x8, w10, sxtw
 456c288: 540000e9     	b.ls	0x456c2a4 <_ChromeMain+0x4567008>
 456c28c: f86ad920     	ldr	x0, [x9, w10, sxtw #3]
 456c290: f9400008     	ldr	x8, [x0]
 456c294: f9411108     	ldr	x8, [x8, #0x220]
 456c298: d63f0100     	blr	x8
 456c29c: 52800020     	mov	w0, #0x1                ; =1
 456c2a0: 17ffffbe     	b	0x456c198 <_ChromeMain+0x4566efc>
 456c2a4: d4200020     	brk	#0x1
 456c2a8: b4fffab5     	cbz	x21, 0x456c1fc <_ChromeMain+0x4566f60>
 456c2ac: d4200000     	brk	#0
 456c2b0: d4400000     	hlt	#0
 456c2b4: d4200020     	brk	#0x1
 456c2b8: b4fffc15     	cbz	x21, 0x456c238 <_ChromeMain+0x4566f9c>
 456c2bc: d4200000     	brk	#0
 456c2c0: d4400000     	hlt	#0
 456c2c4: d4200020     	brk	#0x1
 456c2c8: d503201f     	nop
 456c2cc: d503201f     	nop
 456c2d0: d503201f     	nop
 456c2d4: d503201f     	nop
		...
 456c300: d101c3ff     	sub	sp, sp, #0x70
 456c304: a9016ffc     	stp	x28, x27, [sp, #0x10]
 456c308: a90267fa     	stp	x26, x25, [sp, #0x20]
 456c30c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 456c310: a90457f6     	stp	x22, x21, [sp, #0x40]
 456c314: a9054ff4     	stp	x20, x19, [sp, #0x50]
 456c318: a9067bfd     	stp	x29, x30, [sp, #0x60]
 456c31c: 910183fd     	add	x29, sp, #0x60
 456c320: f940cc08     	ldr	x8, [x0, #0x198]
 456c324: d37df113     	lsl	x19, x8, #3
 456c328: b40003f3     	cbz	x19, 0x456c3a4 <_ChromeMain+0x4567108>
 456c32c: d2800014     	mov	x20, #0x0               ; =0
 456c330: 52800115     	mov	w21, #0x8               ; =8
 456c334: f940c816     	ldr	x22, [x0, #0x190]
 456c338: 12801df7     	mov	w23, #-0xf0             ; =-240
 456c33c: 528003d8     	mov	w24, #0x1e              ; =30
 456c340: 12b00019     	mov	w25, #0x7fffffff        ; =2147483647
 456c344: 5280039a     	mov	w26, #0x1c              ; =28
 456c348: 5280011b     	mov	w27, #0x8               ; =8
 456c34c: f8747ac0     	ldr	x0, [x22, x20, lsl #3]
 456c350: 11001e88     	add	w8, w20, #0x7
 456c354: 7100029f     	cmp	w20, #0x0
 456c358: 1a944108     	csel	w8, w8, w20, mi
 456c35c: 13037d08     	asr	w8, w8, #3
 456c360: 1b176d09     	madd	w9, w8, w23, w27
 456c364: 1b185508     	madd	w8, w8, w24, w21
 456c368: 290023e9     	stp	w9, w8, [sp]
 456c36c: 31007109     	adds	w9, w8, #0x1c
 456c370: 1a896329     	csel	w9, w25, w9, vs
 456c374: 6b080128     	subs	w8, w9, w8
 456c378: 131f7d09     	asr	w9, w8, #31
 456c37c: 52010129     	eor	w9, w9, #0x80000000
 456c380: 1a886128     	csel	w8, w9, w8, vs
 456c384: 0aa87d08     	bic	w8, w8, w8, asr #31
 456c388: 290123fa     	stp	w26, w8, [sp, #0x8]
 456c38c: 910003e1     	mov	x1, sp
 456c390: 970ce200     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 456c394: 91000694     	add	x20, x20, #0x1
 456c398: 11007b7b     	add	w27, w27, #0x1e
 456c39c: f1002273     	subs	x19, x19, #0x8
 456c3a0: 54fffd61     	b.ne	0x456c34c <_ChromeMain+0x45670b0>
 456c3a4: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 456c3a8: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 456c3ac: a94457f6     	ldp	x22, x21, [sp, #0x40]
 456c3b0: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 456c3b4: a94267fa     	ldp	x26, x25, [sp, #0x20]
 456c3b8: a9416ffc     	ldp	x28, x27, [sp, #0x10]
