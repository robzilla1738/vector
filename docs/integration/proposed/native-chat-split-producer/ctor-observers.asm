
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37dfc80: 6db923e9     	stp	d9, d8, [sp, #-0x70]!
 37dfc84: a9016ffc     	stp	x28, x27, [sp, #0x10]
 37dfc88: a90267fa     	stp	x26, x25, [sp, #0x20]
 37dfc8c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 37dfc90: a90457f6     	stp	x22, x21, [sp, #0x40]
 37dfc94: a9054ff4     	stp	x20, x19, [sp, #0x50]
 37dfc98: a9067bfd     	stp	x29, x30, [sp, #0x60]
 37dfc9c: 910183fd     	add	x29, sp, #0x60
 37dfca0: d106c3ff     	sub	sp, sp, #0x1b0
 37dfca4: aa0303fb     	mov	x27, x3
 37dfca8: aa0103f4     	mov	x20, x1
 37dfcac: aa0003f3     	mov	x19, x0
 37dfcb0: 52800035     	mov	w21, #0x1               ; =1
 37dfcb4: aa0303e1     	mov	x1, x3
 37dfcb8: f9001fe2     	str	x2, [sp, #0x38]
 37dfcbc: 52800023     	mov	w3, #0x1                ; =1
 37dfcc0: 94130fa0     	bl	0x3ca3b40 <_ChromeMain+0x3c9e8a4>
 37dfcc4: b0056948     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 37dfcc8: 913bc108     	add	x8, x8, #0xef0
 37dfccc: f9028c08     	str	x8, [x0, #0x518]
 37dfcd0: 900556d6     	adrp	x22, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 37dfcd4: 913c22d6     	add	x22, x22, #0xf08
 37dfcd8: f9029016     	str	x22, [x0, #0x520]
 37dfcdc: 52800100     	mov	w0, #0x8                ; =8
 37dfce0: 9720bda2     	bl	0xf368 <_ChromeMain+0xa0cc>
 37dfce4: b900001f     	str	wzr, [x0]
 37dfce8: 3900101f     	strb	wzr, [x0, #0x4]
 37dfcec: b40000a0     	cbz	x0, 0x37dfd00 <_ChromeMain+0x37daa64>
 37dfcf0: b8350008     	ldadd	w21, w8, [x0]
 37dfcf4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 37dfcf8: 6b09011f     	cmp	w8, w9
 37dfcfc: 5402c4c0     	b.eq	0x37e5594 <_ChromeMain+0x37e02f8>
 37dfd00: 91148275     	add	x21, x19, #0x520
 37dfd04: f9029660     	str	x0, [x19, #0x528]
 37dfd08: f9029a75     	str	x21, [x19, #0x530]
 37dfd0c: 91154268     	add	x8, x19, #0x550
 37dfd10: 6f00e400     	movi.2d	v0, #0000000000000000
 37dfd14: 3d815660     	str	q0, [x19, #0x550]
 37dfd18: f902a668     	str	x8, [x19, #0x548]
 37dfd1c: f0057a08     	adrp	x8, 0xe722000 <dyld_stub_binder+0xe722000>
 37dfd20: 912f4108     	add	x8, x8, #0xbd0
 37dfd24: 9118a109     	add	x9, x8, #0x628
 37dfd28: a9002668     	stp	x8, x9, [x19]
 37dfd2c: 91194109     	add	x9, x8, #0x650
 37dfd30: f9000a69     	str	x9, [x19, #0x10]
 37dfd34: 911a2109     	add	x9, x8, #0x688
 37dfd38: 911ae10a     	add	x10, x8, #0x6b8
 37dfd3c: a906aa69     	stp	x9, x10, [x19, #0x68]
 37dfd40: 911c2109     	add	x9, x8, #0x708
 37dfd44: f9005a69     	str	x9, [x19, #0xb0]
 37dfd48: 911da109     	add	x9, x8, #0x768
 37dfd4c: aa1303ea     	mov	x10, x19
 37dfd50: f80d8d49     	str	x9, [x10, #0xd8]!
 37dfd54: f9000bea     	str	x10, [sp, #0x10]
 37dfd58: 911e6109     	add	x9, x8, #0x798
 37dfd5c: f9007e69     	str	x9, [x19, #0xf8]
 37dfd60: 911f0109     	add	x9, x8, #0x7c0
 37dfd64: f9018a69     	str	x9, [x19, #0x310]
 37dfd68: 911fe109     	add	x9, x8, #0x7f8
 37dfd6c: f9018e69     	str	x9, [x19, #0x318]
 37dfd70: 9120c109     	add	x9, x8, #0x830
 37dfd74: f9021a69     	str	x9, [x19, #0x430]
 37dfd78: 9121e109     	add	x9, x8, #0x878
 37dfd7c: f9021e69     	str	x9, [x19, #0x438]
 37dfd80: 91250109     	add	x9, x8, #0x940
 37dfd84: f9028e69     	str	x9, [x19, #0x518]
 37dfd88: 9125a109     	add	x9, x8, #0x968
 37dfd8c: f9029269     	str	x9, [x19, #0x520]
 37dfd90: 9126a109     	add	x9, x8, #0x9a8
 37dfd94: f9029e69     	str	x9, [x19, #0x538]
 37dfd98: 91274109     	add	x9, x8, #0x9d0
 37dfd9c: f902a269     	str	x9, [x19, #0x540]
 37dfda0: 9129c109     	add	x9, x8, #0xa70
 37dfda4: f902b269     	str	x9, [x19, #0x560]
 37dfda8: 912b4109     	add	x9, x8, #0xad0
 37dfdac: f902b669     	str	x9, [x19, #0x568]
 37dfdb0: 912be109     	add	x9, x8, #0xaf8
 37dfdb4: f902ba69     	str	x9, [x19, #0x570]
 37dfdb8: 912de109     	add	x9, x8, #0xb78
 37dfdbc: f902be69     	str	x9, [x19, #0x578]
 37dfdc0: 912ee109     	add	x9, x8, #0xbb8
 37dfdc4: f902c269     	str	x9, [x19, #0x580]
 37dfdc8: 91312108     	add	x8, x8, #0xc48
 37dfdcc: f902c668     	str	x8, [x19, #0x588]
 37dfdd0: 9117e268     	add	x8, x19, #0x5f8
 37dfdd4: 3d800100     	str	q0, [x8]
 37dfdd8: 3d817a60     	str	q0, [x19, #0x5e0]
 37dfddc: 3d817660     	str	q0, [x19, #0x5d0]
 37dfde0: 3d817260     	str	q0, [x19, #0x5c0]
 37dfde4: 3d816e60     	str	q0, [x19, #0x5b0]
 37dfde8: 3d816a60     	str	q0, [x19, #0x5a0]
 37dfdec: 3d816660     	str	q0, [x19, #0x590]
 37dfdf0: f902fa68     	str	x8, [x19, #0x5f0]
 37dfdf4: f9030676     	str	x22, [x19, #0x608]
 37dfdf8: 52800100     	mov	w0, #0x8                ; =8
 37dfdfc: 9720bd5b     	bl	0xf368 <_ChromeMain+0xa0cc>
 37dfe00: b900001f     	str	wzr, [x0]
 37dfe04: 3900101f     	strb	wzr, [x0, #0x4]
 37dfe08: b40000c0     	cbz	x0, 0x37dfe20 <_ChromeMain+0x37dab84>
 37dfe0c: 52800028     	mov	w8, #0x1                ; =1
 37dfe10: b8280008     	ldadd	w8, w8, [x0]
 37dfe14: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 37dfe18: 6b09011f     	cmp	w8, w9
 37dfe1c: 5402bc20     	b.eq	0x37e55a0 <_ChromeMain+0x37e0304>
 37dfe20: 91182268     	add	x8, x19, #0x608
 37dfe24: f9030a60     	str	x0, [x19, #0x610]
 37dfe28: f9030e68     	str	x8, [x19, #0x618]
 37dfe2c: 90055857     	adrp	x23, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 37dfe30: 911242f7     	add	x23, x23, #0x490
 37dfe34: f9030677     	str	x23, [x19, #0x608]
 37dfe38: f903127f     	str	xzr, [x19, #0x620]
 37dfe3c: f9031a7f     	str	xzr, [x19, #0x630]
 37dfe40: f9031e76     	str	x22, [x19, #0x638]
 37dfe44: 52800100     	mov	w0, #0x8                ; =8
 37dfe48: 9720bd48     	bl	0xf368 <_ChromeMain+0xa0cc>
 37dfe4c: b900001f     	str	wzr, [x0]
 37dfe50: 3900101f     	strb	wzr, [x0, #0x4]
 37dfe54: b40000c0     	cbz	x0, 0x37dfe6c <_ChromeMain+0x37dabd0>
 37dfe58: 52800028     	mov	w8, #0x1                ; =1
 37dfe5c: b8280008     	ldadd	w8, w8, [x0]
 37dfe60: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 37dfe64: 6b09011f     	cmp	w8, w9
 37dfe68: 5402ba20     	b.eq	0x37e55ac <_ChromeMain+0x37e0310>
 37dfe6c: 9118e268     	add	x8, x19, #0x638
 37dfe70: f9032260     	str	x0, [x19, #0x640]
 37dfe74: f9032668     	str	x8, [x19, #0x648]
 37dfe78: f9031e77     	str	x23, [x19, #0x638]
 37dfe7c: f9032a7f     	str	xzr, [x19, #0x650]
 37dfe80: 6f00e400     	movi.2d	v0, #0000000000000000
 37dfe84: 3d819a60     	str	q0, [x19, #0x660]
 37dfe88: 3d819e60     	str	q0, [x19, #0x670]
 37dfe8c: 3d81a260     	str	q0, [x19, #0x680]
 37dfe90: f9034a7f     	str	xzr, [x19, #0x690]
 37dfe94: 529c3808     	mov	w8, #0xe1c0             ; =57792
 37dfe98: 72a01c88     	movk	w8, #0xe4, lsl #16
 37dfe9c: f9034e68     	str	x8, [x19, #0x698]
 37dfea0: 911b2268     	add	x8, x19, #0x6c8
 37dfea4: 911d2269     	add	x9, x19, #0x748
 37dfea8: 3d81aa60     	str	q0, [x19, #0x6a0]
 37dfeac: 3d81ae60     	str	q0, [x19, #0x6b0]
 37dfeb0: 391b027f     	strb	wzr, [x19, #0x6c0]
 37dfeb4: f9039e7f     	str	xzr, [x19, #0x738]
 37dfeb8: ad000100     	stp	q0, q0, [x8]
 37dfebc: ad010100     	stp	q0, q0, [x8, #0x20]
 37dfec0: ad020100     	stp	q0, q0, [x8, #0x40]
 37dfec4: 3d801900     	str	q0, [x8, #0x60]
 37dfec8: 3d800120     	str	q0, [x9]
 37dfecc: f903a269     	str	x9, [x19, #0x740]
 37dfed0: 790eb27f     	strh	wzr, [x19, #0x758]
 37dfed4: 391d727f     	strb	wzr, [x19, #0x75c]
 37dfed8: 391e827f     	strb	wzr, [x19, #0x7a0]
 37dfedc: 391e927f     	strb	wzr, [x19, #0x7a4]
 37dfee0: 391ea27f     	strb	wzr, [x19, #0x7a8]
 37dfee4: 391ec27f     	strb	wzr, [x19, #0x7b0]
 37dfee8: 391ee27f     	strb	wzr, [x19, #0x7b8]
 37dfeec: 391f027f     	strb	wzr, [x19, #0x7c0]
 37dfef0: 911f2268     	add	x8, x19, #0x7c8
 37dfef4: 911fa269     	add	x9, x19, #0x7e8
 37dfef8: f903ee7f     	str	xzr, [x19, #0x7d8]
 37dfefc: 3d800100     	str	q0, [x8]
 37dff00: 3d800120     	str	q0, [x9]
 37dff04: f903f269     	str	x9, [x19, #0x7e0]
 37dff08: 911fe268     	add	x8, x19, #0x7f8
 37dff0c: 91204276     	add	x22, x19, #0x810
 37dff10: 3d800100     	str	q0, [x8]
 37dff14: 7910127f     	strh	wzr, [x19, #0x808]
 37dff18: 3d820660     	str	q0, [x19, #0x810]
 37dff1c: 3d820a60     	str	q0, [x19, #0x820]
 37dff20: 3c81a2c0     	stur	q0, [x22, #0x1a]
 37dff24: 528000a8     	mov	w8, #0x5                ; =5
 37dff28: b9083e68     	str	w8, [x19, #0x83c]
 37dff2c: f904227f     	str	xzr, [x19, #0x840]
 37dff30: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37dff34: f0059e9c     	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37dff38: f9404789     	ldr	x9, [x28, #0x88]
 37dff3c: eb09011f     	cmp	x8, x9
 37dff40: 54000061     	b.ne	0x37dff4c <_ChromeMain+0x37dacb0>
 37dff44: aa1403e0     	mov	x0, x20
 37dff48: 9720d0ed     	bl	0x142fc <_ChromeMain+0xf060>
 37dff4c: 91158278     	add	x24, x19, #0x560
 37dff50: f9042674     	str	x20, [x19, #0x848]
 37dff54: 52800400     	mov	w0, #0x20               ; =32
 37dff58: 9720bd04     	bl	0xf368 <_ChromeMain+0xa0cc>
 37dff5c: f0055b48     	adrp	x8, 0xe34a000 <dyld_stub_binder+0xe34a000>
 37dff60: 91166108     	add	x8, x8, #0x598
 37dff64: aa0003e9     	mov	x9, x0
 37dff68: f8010d3f     	str	xzr, [x9, #0x10]!
 37dff6c: f9000c1f     	str	xzr, [x0, #0x18]
 37dff70: a9002408     	stp	x8, x9, [x0]
 37dff74: f9042a60     	str	x0, [x19, #0x850]
 37dff78: 3921627f     	strb	wzr, [x19, #0x858]
 37dff7c: 3921827f     	strb	wzr, [x19, #0x860]
