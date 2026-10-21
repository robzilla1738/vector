
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41ef9b4: d10283ff     	sub	sp, sp, #0xa0
 41ef9b8: a9046ffc     	stp	x28, x27, [sp, #0x40]
 41ef9bc: a90567fa     	stp	x26, x25, [sp, #0x50]
 41ef9c0: a9065ff8     	stp	x24, x23, [sp, #0x60]
 41ef9c4: a90757f6     	stp	x22, x21, [sp, #0x70]
 41ef9c8: a9084ff4     	stp	x20, x19, [sp, #0x80]
 41ef9cc: a9097bfd     	stp	x29, x30, [sp, #0x90]
 41ef9d0: 910243fd     	add	x29, sp, #0x90
 41ef9d4: aa0203f7     	mov	x23, x2
 41ef9d8: aa0103f6     	mov	x22, x1
 41ef9dc: aa0003f3     	mov	x19, x0
 41ef9e0: 9005209c     	adrp	x28, 0xe5ff000 <dyld_stub_binder+0xe5ff000>
 41ef9e4: 9123439c     	add	x28, x28, #0x8d0
 41ef9e8: 91136388     	add	x8, x28, #0x4d8
 41ef9ec: a900201c     	stp	x28, x8, [x0]
 41ef9f0: 91140388     	add	x8, x28, #0x500
 41ef9f4: f9000808     	str	x8, [x0, #0x10]
 41ef9f8: 9114e388     	add	x8, x28, #0x538
 41ef9fc: 9115a389     	add	x9, x28, #0x568
 41efa00: a906a408     	stp	x8, x9, [x0, #0x68]
 41efa04: 9116e388     	add	x8, x28, #0x5b8
 41efa08: f9005808     	str	x8, [x0, #0xb0]
 41efa0c: 91186388     	add	x8, x28, #0x618
 41efa10: aa0003f4     	mov	x20, x0
 41efa14: f80d8e88     	str	x8, [x20, #0xd8]!
 41efa18: 91192388     	add	x8, x28, #0x648
 41efa1c: aa0003f5     	mov	x21, x0
 41efa20: f80f8ea8     	str	x8, [x21, #0xf8]!
 41efa24: 9119c388     	add	x8, x28, #0x670
 41efa28: f9018808     	str	x8, [x0, #0x310]
 41efa2c: 911bc388     	add	x8, x28, #0x6f0
 41efa30: f9018c08     	str	x8, [x0, #0x318]
 41efa34: 911ec388     	add	x8, x28, #0x7b0
 41efa38: f9019008     	str	x8, [x0, #0x320]
 41efa3c: 911fa388     	add	x8, x28, #0x7e8
 41efa40: f9025808     	str	x8, [x0, #0x4b0]
 41efa44: 9120e388     	add	x8, x28, #0x838
 41efa48: f9025c08     	str	x8, [x0, #0x4b8]
 41efa4c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41efa50: f0054e18     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41efa54: f9404709     	ldr	x9, [x24, #0x88]
 41efa58: eb09011f     	cmp	x8, x9
 41efa5c: 54000061     	b.ne	0x41efa68 <_ChromeMain+0x41ea7cc>
 41efa60: aa1303e0     	mov	x0, x19
 41efa64: 96f89226     	bl	0x142fc <_ChromeMain+0xf060>
 41efa68: 52800700     	mov	w0, #0x38               ; =56
 41efa6c: 96f87e3f     	bl	0xf368 <_ChromeMain+0xa0cc>
 41efa70: 52800028     	mov	w8, #0x1                ; =1
 41efa74: b9000008     	str	w8, [x0]
 41efa78: b0ffebf9     	adrp	x25, 0x3f6c000 <_ChromeMain+0x3f66d64>
 41efa7c: 91270339     	add	x25, x25, #0x9c0
 41efa80: b0fec6ba     	adrp	x26, 0x1ac4000 <_ChromeMain+0x1abed64>
 41efa84: 9118035a     	add	x26, x26, #0x600
 41efa88: a900e819     	stp	x25, x26, [x0, #0x8]
 41efa8c: d0ff1b7b     	adrp	x27, 0x255d000 <_ChromeMain+0x2557d64>
 41efa90: 912c037b     	add	x27, x27, #0xb00
 41efa94: b001dc89     	adrp	x9, 0x7d80000 <_ChromeMain+0x7d7ad64>
 41efa98: 91096129     	add	x9, x9, #0x258
 41efa9c: a901a41b     	stp	x27, x9, [x0, #0x18]
 41efaa0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 41efaa4: f9000be0     	str	x0, [sp, #0x10]
 41efaa8: 390063e8     	strb	w8, [sp, #0x18]
 41efaac: 910043e1     	add	x1, sp, #0x10
 41efab0: aa1303e0     	mov	x0, x19
 41efab4: d2800002     	mov	x2, #0x0                ; =0
 41efab8: d2800003     	mov	x3, #0x0                ; =0
 41efabc: 52800044     	mov	w4, #0x2                ; =2
 41efac0: 979e12bb     	bl	0x29745ac <_ChromeMain+0x296f310>
 41efac4: 394063e8     	ldrb	w8, [sp, #0x18]
 41efac8: 7103fd1f     	cmp	w8, #0xff
 41efacc: 54000060     	b.eq	0x41efad8 <_ChromeMain+0x41ea83c>
 41efad0: f9400be0     	ldr	x0, [sp, #0x10]
 41efad4: b5002840     	cbnz	x0, 0x41effdc <_ChromeMain+0x41ead40>
 41efad8: 52801fe8     	mov	w8, #0xff               ; =255
 41efadc: 390063e8     	strb	w8, [sp, #0x18]
 41efae0: 91136388     	add	x8, x28, #0x4d8
 41efae4: a900227c     	stp	x28, x8, [x19]
 41efae8: 91140388     	add	x8, x28, #0x500
 41efaec: f9000a68     	str	x8, [x19, #0x10]
 41efaf0: 9114e388     	add	x8, x28, #0x538
 41efaf4: 9115a389     	add	x9, x28, #0x568
 41efaf8: a906a668     	stp	x8, x9, [x19, #0x68]
 41efafc: 9116e388     	add	x8, x28, #0x5b8
 41efb00: f9005a68     	str	x8, [x19, #0xb0]
 41efb04: 91186388     	add	x8, x28, #0x618
 41efb08: f9006e68     	str	x8, [x19, #0xd8]
 41efb0c: 91192388     	add	x8, x28, #0x648
 41efb10: f9007e68     	str	x8, [x19, #0xf8]
 41efb14: 9119c388     	add	x8, x28, #0x670
 41efb18: f9018a68     	str	x8, [x19, #0x310]
 41efb1c: 911bc388     	add	x8, x28, #0x6f0
 41efb20: f9018e68     	str	x8, [x19, #0x318]
 41efb24: 911ec388     	add	x8, x28, #0x7b0
 41efb28: f9019268     	str	x8, [x19, #0x320]
 41efb2c: 911fa388     	add	x8, x28, #0x7e8
 41efb30: f9025a68     	str	x8, [x19, #0x4b0]
 41efb34: 9120e388     	add	x8, x28, #0x838
 41efb38: f9025e68     	str	x8, [x19, #0x4b8]
 41efb3c: f9031a7f     	str	xzr, [x19, #0x630]
 41efb40: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 41efb44: f9404709     	ldr	x9, [x24, #0x88]
 41efb48: eb09011f     	cmp	x8, x9
 41efb4c: 54000061     	b.ne	0x41efb58 <_ChromeMain+0x41ea8bc>
 41efb50: aa1603e0     	mov	x0, x22
 41efb54: 96f891ea     	bl	0x142fc <_ChromeMain+0xf060>
 41efb58: f9031e76     	str	x22, [x19, #0x638]
 41efb5c: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 41efb60: f9404709     	ldr	x9, [x24, #0x88]
 41efb64: eb09011f     	cmp	x8, x9
 41efb68: 54000061     	b.ne	0x41efb74 <_ChromeMain+0x41ea8d8>
 41efb6c: aa1703e0     	mov	x0, x23
 41efb70: 96f891e3     	bl	0x142fc <_ChromeMain+0xf060>
 41efb74: f9032277     	str	x23, [x19, #0x640]
 41efb78: 3919227f     	strb	wzr, [x19, #0x648]
 41efb7c: 3919c27f     	strb	wzr, [x19, #0x670]
 41efb80: 391a227f     	strb	wzr, [x19, #0x688]
 41efb84: f9032a7f     	str	xzr, [x19, #0x650]
 41efb88: f903327f     	str	xzr, [x19, #0x660]
 41efb8c: f9032e7f     	str	xzr, [x19, #0x658]
 41efb90: 3919a27f     	strb	wzr, [x19, #0x668]
 41efb94: 52800100     	mov	w0, #0x8                ; =8
 41efb98: 96f87df4     	bl	0xf368 <_ChromeMain+0xa0cc>
 41efb9c: b900001f     	str	wzr, [x0]
 41efba0: 3900101f     	strb	wzr, [x0, #0x4]
 41efba4: b40000c0     	cbz	x0, 0x41efbbc <_ChromeMain+0x41ea920>
 41efba8: 52800028     	mov	w8, #0x1                ; =1
 41efbac: b8280008     	ldadd	w8, w8, [x0]
 41efbb0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 41efbb4: 6b09011f     	cmp	w8, w9
 41efbb8: 54002240     	b.eq	0x41f0000 <_ChromeMain+0x41ead64>
 41efbbc: f9034a60     	str	x0, [x19, #0x690]
 41efbc0: f9034e73     	str	x19, [x19, #0x698]
 41efbc4: aa1303e0     	mov	x0, x19
 41efbc8: d2800001     	mov	x1, #0x0                ; =0
 41efbcc: 9763f8ec     	bl	0x1aedf7c <_ChromeMain+0x1ae8ce0>
 41efbd0: 3951aa68     	ldrb	w8, [x19, #0x46a]
 41efbd4: 340000a8     	cbz	w8, 0x41efbe8 <_ChromeMain+0x41ea94c>
 41efbd8: 3911aa7f     	strb	wzr, [x19, #0x46a]
 41efbdc: 9111aa61     	add	x1, x19, #0x46a
 41efbe0: aa1503e0     	mov	x0, x21
 41efbe4: 9734e0fb     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 41efbe8: 3951ae68     	ldrb	w8, [x19, #0x46b]
 41efbec: 370000c8     	tbnz	w8, #0x0, 0x41efc04 <_ChromeMain+0x41ea968>
 41efbf0: 52800028     	mov	w8, #0x1                ; =1
 41efbf4: 3911ae68     	strb	w8, [x19, #0x46b]
 41efbf8: 9111ae61     	add	x1, x19, #0x46b
 41efbfc: aa1503e0     	mov	x0, x21
 41efc00: 9734e0f4     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 41efc04: b9417268     	ldr	w8, [x19, #0x170]
 41efc08: 710fc51f     	cmp	w8, #0x3f1
 41efc0c: 540000e0     	b.eq	0x41efc28 <_ChromeMain+0x41ea98c>
 41efc10: 9105c268     	add	x8, x19, #0x170
 41efc14: 52807e29     	mov	w9, #0x3f1              ; =1009
 41efc18: b9000109     	str	w9, [x8]
 41efc1c: 9105c261     	add	x1, x19, #0x170
 41efc20: aa1503e0     	mov	x0, x21
 41efc24: 9734e0eb     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 41efc28: d00540a1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 41efc2c: 911a2021     	add	x1, x1, #0x688
 41efc30: 90054722     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 41efc34: 9113a042     	add	x2, x2, #0x4e8
 41efc38: aa1403e0     	mov	x0, x20
 41efc3c: 976893f1     	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 41efc40: f9431e77     	ldr	x23, [x19, #0x638]
 41efc44: 925e7668     	and	x8, x19, #0xfffffffc00000000
 41efc48: f9404709     	ldr	x9, [x24, #0x88]
 41efc4c: eb09011f     	cmp	x8, x9
 41efc50: 54000061     	b.ne	0x41efc5c <_ChromeMain+0x41ea9c0>
 41efc54: aa1303e0     	mov	x0, x19
 41efc58: 96f891a9     	bl	0x142fc <_ChromeMain+0xf060>
 41efc5c: 52800700     	mov	w0, #0x38               ; =56
 41efc60: 96f87dc2     	bl	0xf368 <_ChromeMain+0xa0cc>
 41efc64: aa0003e1     	mov	x1, x0
 41efc68: 52800028     	mov	w8, #0x1                ; =1
 41efc6c: b9000008     	str	w8, [x0]
 41efc70: a900e819     	stp	x25, x26, [x0, #0x8]
 41efc74: d0fe9f68     	adrp	x8, 0x15dd000 <_ChromeMain+0x15d7d64>
 41efc78: 9103d108     	add	x8, x8, #0xf4
 41efc7c: a901a01b     	stp	x27, x8, [x0, #0x18]
 41efc80: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 41efc84: 910083e8     	add	x8, sp, #0x20
 41efc88: aa1703e0     	mov	x0, x23
 41efc8c: 94e8ed2e     	bl	0x7c2b144 <_ChromeMain+0x7c25ea8>
 41efc90: 91198260     	add	x0, x19, #0x660
 41efc94: 910083e1     	add	x1, sp, #0x20
 41efc98: 97195b8e     	bl	0x846ad0 <_ChromeMain+0x841834>
 41efc9c: f94013f7     	ldr	x23, [sp, #0x20]
 41efca0: b5001777     	cbnz	x23, 0x41eff8c <_ChromeMain+0x41eacf0>
 41efca4: 9117d279     	add	x25, x19, #0x5f4
 41efca8: b945f668     	ldr	w8, [x19, #0x5f4]
 41efcac: 7100051f     	cmp	w8, #0x1
 41efcb0: 54001201     	b.ne	0x41efef0 <_ChromeMain+0x41eac54>
 41efcb4: f9432277     	ldr	x23, [x19, #0x640]
 41efcb8: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 41efcbc: f9404709     	ldr	x9, [x24, #0x88]
 41efcc0: eb09011f     	cmp	x8, x9
 41efcc4: 54000061     	b.ne	0x41efcd0 <_ChromeMain+0x41eaa34>
 41efcc8: aa1703e0     	mov	x0, x23
 41efccc: 96f8918c     	bl	0x142fc <_ChromeMain+0xf060>
 41efcd0: f9415e60     	ldr	x0, [x19, #0x2b8]
 41efcd4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41efcd8: f9404709     	ldr	x9, [x24, #0x88]
 41efcdc: eb09011f     	cmp	x8, x9
 41efce0: 540018c0     	b.eq	0x41efff8 <_ChromeMain+0x41ead5c>
 41efce4: f9015e77     	str	x23, [x19, #0x2b8]
 41efce8: f9431668     	ldr	x8, [x19, #0x628]
 41efcec: 52800029     	mov	w9, #0x1                ; =1
 41efcf0: b9001909     	str	w9, [x8, #0x18]
 41efcf4: 52800200     	mov	w0, #0x10               ; =16
 41efcf8: 96f87d9c     	bl	0xf368 <_ChromeMain+0xa0cc>
 41efcfc: aa0003f7     	mov	x23, x0
 41efd00: b00501c8     	adrp	x8, 0xe228000 <dyld_stub_binder+0xe228000>
 41efd04: 9110e108     	add	x8, x8, #0x438
 41efd08: f9000008     	str	x8, [x0]
 41efd0c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 41efd10: f9404709     	ldr	x9, [x24, #0x88]
 41efd14: eb09011f     	cmp	x8, x9
 41efd18: 54000061     	b.ne	0x41efd24 <_ChromeMain+0x41eaa88>
 41efd1c: aa1303e0     	mov	x0, x19
 41efd20: 96f89177     	bl	0x142fc <_ChromeMain+0xf060>
 41efd24: f90006f3     	str	x19, [x23, #0x8]
 41efd28: f9432a60     	ldr	x0, [x19, #0x650]
 41efd2c: f9032a77     	str	x23, [x19, #0x650]
 41efd30: b4000080     	cbz	x0, 0x41efd40 <_ChromeMain+0x41eaaa4>
 41efd34: 91194277     	add	x23, x19, #0x650
 41efd38: 94ee43b6     	bl	0x7d80c10 <_ChromeMain+0x7d7b974>
 41efd3c: f94002f7     	ldr	x23, [x23]
 41efd40: 52800900     	mov	w0, #0x48               ; =72
 41efd44: 96f87d89     	bl	0xf368 <_ChromeMain+0xa0cc>
 41efd48: aa0003f8     	mov	x24, x0
 41efd4c: aa1603e1     	mov	x1, x22
 41efd50: aa1703e2     	mov	x2, x23
 41efd54: 52800003     	mov	w3, #0x0                ; =0
 41efd58: 94e6fb68     	bl	0x7baeaf8 <_ChromeMain+0x7ba985c>
 41efd5c: f9432e60     	ldr	x0, [x19, #0x658]
 41efd60: f9032e78     	str	x24, [x19, #0x658]
 41efd64: b5000f80     	cbnz	x0, 0x41eff54 <_ChromeMain+0x41eacb8>
 41efd68: aa1303e0     	mov	x0, x19
 41efd6c: aa1803e1     	mov	x1, x24
 41efd70: 97666cd2     	bl	0x1b8b0b8 <_ChromeMain+0x1b85e1c>
 41efd74: f9431e68     	ldr	x8, [x19, #0x638]
 41efd78: 39c0dd09     	ldrsb	w9, [x8, #0x37]
 41efd7c: 37f80b29     	tbnz	w9, #0x1f, 0x41efee0 <_ChromeMain+0x41eac44>
 41efd80: 3cc20100     	ldur	q0, [x8, #0x20]
 41efd84: f8430108     	ldur	x8, [x8, #0x30]
 41efd88: f9001be8     	str	x8, [sp, #0x30]
 41efd8c: 3d800be0     	str	q0, [sp, #0x20]
 41efd90: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 41efd94: 36f80c08     	tbz	w8, #0x1f, 0x41eff14 <_ChromeMain+0x41eac78>
 41efd98: f94017e9     	ldr	x9, [sp, #0x28]
 41efd9c: f100813f     	cmp	x9, #0x20
 41efda0: 54000ba1     	b.ne	0x41eff14 <_ChromeMain+0x41eac78>
 41efda4: b00462c8     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 41efda8: 91252508     	add	x8, x8, #0x949
 41efdac: f94013e0     	ldr	x0, [sp, #0x20]
 41efdb0: f9401be9     	ldr	x9, [sp, #0x30]
 41efdb4: a9402c0a     	ldp	x10, x11, [x0]
 41efdb8: a940350c     	ldp	x12, x13, [x8]
 41efdbc: a9413c0e     	ldp	x14, x15, [x0, #0x10]
 41efdc0: eb0c015f     	cmp	x10, x12
 41efdc4: a941210a     	ldp	x10, x8, [x8, #0x10]
 41efdc8: fa4d0160     	ccmp	x11, x13, #0x0, eq
 41efdcc: fa4a01c0     	ccmp	x14, x10, #0x0, eq
 41efdd0: fa4801e0     	ccmp	x15, x8, #0x0, eq
 41efdd4: 1a9f07f6     	cset	w22, ne
 41efdd8: 9240f921     	and	x1, x9, #0x7fffffffffffffff
 41efddc: 96f86437     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41efde0: 35000a56     	cbnz	w22, 0x41eff28 <_ChromeMain+0x41eac8c>
 41efde4: b9400328     	ldr	w8, [x25]
 41efde8: 7100051f     	cmp	w8, #0x1
 41efdec: 54000be1     	b.ne	0x41eff68 <_ChromeMain+0x41eaccc>
 41efdf0: b945f268     	ldr	w8, [x19, #0x5f0]
 41efdf4: 34000108     	cbz	w8, 0x41efe14 <_ChromeMain+0x41eab78>
 41efdf8: b905f27f     	str	wzr, [x19, #0x5f0]
 41efdfc: aa1303e0     	mov	x0, x19
 41efe00: 52800061     	mov	w1, #0x3                ; =3
 41efe04: 9717c6d8     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 41efe08: 9117c261     	add	x1, x19, #0x5f0
 41efe0c: aa1503e0     	mov	x0, x21
 41efe10: 9734e070     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 41efe14: 52980008     	mov	w8, #0xc000             ; =49152
 41efe18: 72a88f28     	movk	w8, #0x4479, lsl #16
 41efe1c: 4e040d00     	dup.4s	v0, w8
 41efe20: 3d8003e0     	str	q0, [sp]
 41efe24: 3d800be0     	str	q0, [sp, #0x20]
 41efe28: 910083e1     	add	x1, sp, #0x20
 41efe2c: aa1303e0     	mov	x0, x19
 41efe30: 97b1f3b4     	bl	0x2e6cd00 <_ChromeMain+0x2e67a64>
 41efe34: aa1303e0     	mov	x0, x19
 41efe38: 94000075     	bl	0x41f000c <_ChromeMain+0x41ead70>
 41efe3c: aa0003e1     	mov	x1, x0
 41efe40: f9400268     	ldr	x8, [x19]
 41efe44: f9408908     	ldr	x8, [x8, #0x110]
 41efe48: aa1303e0     	mov	x0, x19
 41efe4c: d63f0100     	blr	x8
 41efe50: f9400268     	ldr	x8, [x19]
 41efe54: f9423108     	ldr	x8, [x8, #0x460]
 41efe58: f0046881     	adrp	x1, 0xcf02000 <dyld_stub_binder+0xcf02000>
 41efe5c: 9107d021     	add	x1, x1, #0x1f4
 41efe60: aa1303e0     	mov	x0, x19
 41efe64: 52800122     	mov	w2, #0x9                ; =9
 41efe68: d63f0100     	blr	x8
 41efe6c: f9426660     	ldr	x0, [x19, #0x4c8]
 41efe70: b9434c09     	ldr	w9, [x0, #0x34c]
 41efe74: 52820348     	mov	w8, #0x101a             ; =4122
 41efe78: 6b08013f     	cmp	w9, w8
 41efe7c: 54000060     	b.eq	0x41efe88 <_ChromeMain+0x41eabec>
 41efe80: b9034c08     	str	w8, [x0, #0x34c]
 41efe84: 979541af     	bl	0x2740540 <_ChromeMain+0x273b2a4>
 41efe88: 52800600     	mov	w0, #0x30               ; =48
 41efe8c: 96f87d37     	bl	0xf368 <_ChromeMain+0xa0cc>
 41efe90: aa0003e4     	mov	x4, x0
 41efe94: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 41efe98: 7900301f     	strh	wzr, [x0, #0x18]
 41efe9c: f0050ae8     	adrp	x8, 0xe34e000 <dyld_stub_binder+0xe34e000>
 41efea0: 91362108     	add	x8, x8, #0xd88
 41efea4: f9000008     	str	x8, [x0]
 41efea8: 3dc003e0     	ldr	q0, [sp]
 41efeac: 3c81c000     	stur	q0, [x0, #0x1c]
 41efeb0: d00540a1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 41efeb4: 9114a021     	add	x1, x1, #0x528
 41efeb8: d004daa2     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 41efebc: 91264842     	add	x2, x2, #0x992
 41efec0: b0ff63e3     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 41efec4: 913c0063     	add	x3, x3, #0xf00
 41efec8: aa1403e0     	mov	x0, x20
 41efecc: d2800005     	mov	x5, #0x0                ; =0
 41efed0: 9725e8b3     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 41efed4: b40002a0     	cbz	x0, 0x41eff28 <_ChromeMain+0x41eac8c>
 41efed8: 97b1f40a     	bl	0x2e6cf00 <_ChromeMain+0x2e67c64>
 41efedc: 14000013     	b	0x41eff28 <_ChromeMain+0x41eac8c>
 41efee0: a9420901     	ldp	x1, x2, [x8, #0x20]
 41efee4: 910083e0     	add	x0, sp, #0x20
 41efee8: 96f8a0cc     	bl	0x18218 <_ChromeMain+0x12f7c>
 41efeec: 17ffffa9     	b	0x41efd90 <_ChromeMain+0x41eaaf4>
 41efef0: 52800028     	mov	w8, #0x1                ; =1
 41efef4: b905f668     	str	w8, [x19, #0x5f4]
 41efef8: aa1303e0     	mov	x0, x19
 41efefc: 52800021     	mov	w1, #0x1                ; =1
 41eff00: 9717c699     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 41eff04: 9117d261     	add	x1, x19, #0x5f4
 41eff08: aa1503e0     	mov	x0, x21
 41eff0c: 9734e031     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 41eff10: 17ffff69     	b	0x41efcb4 <_ChromeMain+0x41eaa18>
 41eff14: 36f800a8     	tbz	w8, #0x1f, 0x41eff28 <_ChromeMain+0x41eac8c>
 41eff18: f94013e0     	ldr	x0, [sp, #0x20]
 41eff1c: f9401be8     	ldr	x8, [sp, #0x30]
 41eff20: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41eff24: 96f863e5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41eff28: aa1303e0     	mov	x0, x19
 41eff2c: 974fb472     	bl	0x15dd0f4 <_ChromeMain+0x15d7e58>
 41eff30: aa1303e0     	mov	x0, x19
 41eff34: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 41eff38: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 41eff3c: a94757f6     	ldp	x22, x21, [sp, #0x70]
 41eff40: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 41eff44: a94567fa     	ldp	x26, x25, [sp, #0x50]
 41eff48: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 41eff4c: 910283ff     	add	sp, sp, #0xa0
 41eff50: d65f03c0     	ret
 41eff54: 94e6fb0e     	bl	0x7baeb8c <_ChromeMain+0x7ba98f0>
 41eff58: 52800901     	mov	w1, #0x48               ; =72
 41eff5c: 96f863d7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41eff60: f9432e78     	ldr	x24, [x19, #0x658]
 41eff64: 17ffff81     	b	0x41efd68 <_ChromeMain+0x41eaacc>
 41eff68: 52800028     	mov	w8, #0x1                ; =1
 41eff6c: b905f668     	str	w8, [x19, #0x5f4]
 41eff70: aa1303e0     	mov	x0, x19
 41eff74: 52800021     	mov	w1, #0x1                ; =1
 41eff78: 9717c67b     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 41eff7c: 9117d261     	add	x1, x19, #0x5f4
 41eff80: aa1503e0     	mov	x0, x21
 41eff84: 9734e013     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 41eff88: 17ffff9a     	b	0x41efdf0 <_ChromeMain+0x41eab54>
 41eff8c: f90013ff     	str	xzr, [sp, #0x20]
 41eff90: f94006e8     	ldr	x8, [x23, #0x8]
 41eff94: aa1703e0     	mov	x0, x23
 41eff98: d63f0100     	blr	x8
 41eff9c: 12800008     	mov	w8, #-0x1               ; =-1
 41effa0: b8e802e8     	ldaddal	w8, w8, [x23]
 41effa4: 7100051f     	cmp	w8, #0x1
 41effa8: 54000081     	b.ne	0x41effb8 <_ChromeMain+0x41ead1c>
 41effac: f9400ae8     	ldr	x8, [x23, #0x10]
 41effb0: aa1703e0     	mov	x0, x23
 41effb4: d63f0100     	blr	x8
 41effb8: f94013e0     	ldr	x0, [sp, #0x20]
 41effbc: b4ffe740     	cbz	x0, 0x41efca4 <_ChromeMain+0x41eaa08>
 41effc0: 12800008     	mov	w8, #-0x1               ; =-1
 41effc4: b8e80008     	ldaddal	w8, w8, [x0]
 41effc8: 7100051f     	cmp	w8, #0x1
 41effcc: 54ffe6c1     	b.ne	0x41efca4 <_ChromeMain+0x41eaa08>
 41effd0: f9400808     	ldr	x8, [x0, #0x10]
 41effd4: d63f0100     	blr	x8
 41effd8: 17ffff33     	b	0x41efca4 <_ChromeMain+0x41eaa08>
 41effdc: 12800008     	mov	w8, #-0x1               ; =-1
 41effe0: b8e80008     	ldaddal	w8, w8, [x0]
 41effe4: 7100051f     	cmp	w8, #0x1
 41effe8: 54ffd781     	b.ne	0x41efad8 <_ChromeMain+0x41ea83c>
 41effec: f9400808     	ldr	x8, [x0, #0x10]
 41efff0: d63f0100     	blr	x8
 41efff4: 17fffeb9     	b	0x41efad8 <_ChromeMain+0x41ea83c>
 41efff8: 96f8ca91     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41efffc: 17ffff3a     	b	0x41efce4 <_ChromeMain+0x41eaa48>
 41f0000: d4200000     	brk	#0
 41f0004: d4400000     	hlt	#0
 41f0008: d4200020     	brk	#0x1
