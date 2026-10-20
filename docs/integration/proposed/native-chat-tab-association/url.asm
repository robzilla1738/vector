
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4637684: d10203ff     	sub	sp, sp, #0x80
 4637688: a90557f6     	stp	x22, x21, [sp, #0x50]
 463768c: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4637690: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4637694: 9101c3fd     	add	x29, sp, #0x70
 4637698: aa0103f4     	mov	x20, x1
 463769c: aa0803f3     	mov	x19, x8
 46376a0: b004cf88     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 46376a4: f940f908     	ldr	x8, [x8, #0x1f0]
 46376a8: f9400108     	ldr	x8, [x8]
 46376ac: f81d83a8     	stur	x8, [x29, #-0x28]
 46376b0: f9422c08     	ldr	x8, [x0, #0x458]
 46376b4: b40003a8     	cbz	x8, 0x4637728 <_ChromeMain+0x463248c>
 46376b8: f9429d08     	ldr	x8, [x8, #0x538]
 46376bc: f9403515     	ldr	x21, [x8, #0x68]
 46376c0: b4000375     	cbz	x21, 0x463772c <_ChromeMain+0x4632490>
 46376c4: 394122a8     	ldrb	w8, [x21, #0x48]
 46376c8: 37000328     	tbnz	w8, #0x0, 0x463772c <_ChromeMain+0x4632490>
 46376cc: f94002a8     	ldr	x8, [x21]
 46376d0: f940b508     	ldr	x8, [x8, #0x168]
 46376d4: aa1503e0     	mov	x0, x21
 46376d8: d63f0100     	blr	x8
 46376dc: b4000280     	cbz	x0, 0x463772c <_ChromeMain+0x4632490>
 46376e0: aa0003f6     	mov	x22, x0
 46376e4: b0044521     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 46376e8: 91018021     	add	x1, x1, #0x60
 46376ec: 52800202     	mov	w2, #0x10               ; =16
 46376f0: 96fa1557     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 46376f4: b40001c0     	cbz	x0, 0x463772c <_ChromeMain+0x4632490>
 46376f8: b0044521     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 46376fc: 91018021     	add	x1, x1, #0x60
 4637700: aa1603e0     	mov	x0, x22
 4637704: 52800202     	mov	w2, #0x10               ; =16
 4637708: 96f21cc8     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 463770c: 3100041f     	cmn	w0, #0x1
 4637710: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 4637714: 9a9fc109     	csel	x9, x8, xzr, gt
 4637718: 37f800a0     	tbnz	w0, #0x1f, 0x463772c <_ChromeMain+0x4632490>
 463771c: 0aa07c0a     	bic	w10, w0, w0, asr #31
 4637720: aa0a0120     	orr	x0, x9, x10
 4637724: 14000005     	b	0x4637738 <_ChromeMain+0x463249c>
 4637728: d2800015     	mov	x21, #0x0               ; =0
 463772c: aa1503e0     	mov	x0, x21
 4637730: 97eb2fa4     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 4637734: 92600008     	and	x8, x0, #0x100000000
 4637738: 2a0003e9     	mov	w9, w0
 463773c: aa090108     	orr	x8, x8, x9
 4637740: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 4637744: d004856a     	adrp	x10, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4637748: 9106a94a     	add	x10, x10, #0x1aa
 463774c: eb09011f     	cmp	x8, x9
 4637750: 9a898115     	csel	x21, x8, x9, hi
 4637754: 528000c8     	mov	w8, #0x6                ; =6
 4637758: a901a3ea     	stp	x10, x8, [sp, #0x18]
 463775c: b0048d88     	adrp	x8, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 4637760: 9104f108     	add	x8, x8, #0x13c
 4637764: 52800029     	mov	w9, #0x1                ; =1
 4637768: a902a7e8     	stp	x8, x9, [sp, #0x28]
 463776c: 39805e88     	ldrsb	x8, [x20, #0x17]
 4637770: a9402a89     	ldp	x9, x10, [x20]
 4637774: f100011f     	cmp	x8, #0x0
 4637778: 9a944129     	csel	x9, x9, x20, mi
 463777c: 7100011f     	cmp	w8, #0x0
 4637780: 9a884148     	csel	x8, x10, x8, mi
 4637784: a903a3e9     	stp	x9, x8, [sp, #0x38]
 4637788: 910003f4     	mov	x20, sp
 463778c: 910003e8     	mov	x8, sp
 4637790: 910063e0     	add	x0, sp, #0x18
 4637794: 52800061     	mov	w1, #0x3                ; =3
 4637798: 9700ccef     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 463779c: 39805fe8     	ldrsb	x8, [sp, #0x17]
 46377a0: a9402be9     	ldp	x9, x10, [sp]
 46377a4: f100011f     	cmp	x8, #0x0
 46377a8: 9a944123     	csel	x3, x9, x20, mi
 46377ac: 7100011f     	cmp	w8, #0x0
 46377b0: 9a884144     	csel	x4, x10, x8, mi
 46377b4: d0048560     	adrp	x0, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 46377b8: 9105b800     	add	x0, x0, #0x16e
 46377bc: aa1303e8     	mov	x8, x19
 46377c0: 52800121     	mov	w1, #0x9                ; =9
 46377c4: aa1503e2     	mov	x2, x21
 46377c8: 97fcb64e     	bl	0x4565100 <_ChromeMain+0x455fe64>
 46377cc: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 46377d0: 36f800a8     	tbz	w8, #0x1f, 0x46377e4 <_ChromeMain+0x4632548>
 46377d4: f94003e0     	ldr	x0, [sp]
 46377d8: f9400be8     	ldr	x8, [sp, #0x10]
 46377dc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46377e0: 96e745b6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46377e4: f85d83a8     	ldur	x8, [x29, #-0x28]
 46377e8: b004cf89     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 46377ec: f940f929     	ldr	x9, [x9, #0x1f0]
 46377f0: f9400129     	ldr	x9, [x9]
 46377f4: eb08013f     	cmp	x9, x8
 46377f8: 540000c1     	b.ne	0x4637810 <_ChromeMain+0x4632574>
 46377fc: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4637800: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4637804: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4637808: 910203ff     	add	sp, sp, #0x80
 463780c: d65f03c0     	ret
 4637810: 94e732d4     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4637814: d10403ff     	sub	sp, sp, #0x100
 4637818: a90b67fa     	stp	x26, x25, [sp, #0xb0]
 463781c: a90c5ff8     	stp	x24, x23, [sp, #0xc0]
 4637820: a90d57f6     	stp	x22, x21, [sp, #0xd0]
 4637824: a90e4ff4     	stp	x20, x19, [sp, #0xe0]
 4637828: a90f7bfd     	stp	x29, x30, [sp, #0xf0]
 463782c: 9103c3fd     	add	x29, sp, #0xf0
 4637830: aa0103f4     	mov	x20, x1
 4637834: aa0803f3     	mov	x19, x8
 4637838: b004cf88     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 463783c: f940f908     	ldr	x8, [x8, #0x1f0]
 4637840: f9400108     	ldr	x8, [x8]
 4637844: f81b83a8     	stur	x8, [x29, #-0x48]
 4637848: f9422c08     	ldr	x8, [x0, #0x458]
 463784c: b40003a8     	cbz	x8, 0x46378c0 <_ChromeMain+0x4632624>
 4637850: f9429d08     	ldr	x8, [x8, #0x538]
 4637854: f9403515     	ldr	x21, [x8, #0x68]
 4637858: b4000375     	cbz	x21, 0x46378c4 <_ChromeMain+0x4632628>
 463785c: 394122a8     	ldrb	w8, [x21, #0x48]
 4637860: 37000328     	tbnz	w8, #0x0, 0x46378c4 <_ChromeMain+0x4632628>
 4637864: f94002a8     	ldr	x8, [x21]
 4637868: f940b508     	ldr	x8, [x8, #0x168]
 463786c: aa1503e0     	mov	x0, x21
 4637870: d63f0100     	blr	x8
 4637874: b4000280     	cbz	x0, 0x46378c4 <_ChromeMain+0x4632628>
 4637878: aa0003f6     	mov	x22, x0
 463787c: b0044521     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4637880: 91018021     	add	x1, x1, #0x60
 4637884: 52800202     	mov	w2, #0x10               ; =16
 4637888: 96fa14f1     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 463788c: b40001c0     	cbz	x0, 0x46378c4 <_ChromeMain+0x4632628>
 4637890: b0044521     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4637894: 91018021     	add	x1, x1, #0x60
 4637898: aa1603e0     	mov	x0, x22
 463789c: 52800202     	mov	w2, #0x10               ; =16
 46378a0: 96f21c62     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 46378a4: 3100041f     	cmn	w0, #0x1
 46378a8: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 46378ac: 9a9fc109     	csel	x9, x8, xzr, gt
 46378b0: 37f800a0     	tbnz	w0, #0x1f, 0x46378c4 <_ChromeMain+0x4632628>
 46378b4: 0aa07c0a     	bic	w10, w0, w0, asr #31
 46378b8: aa0a0120     	orr	x0, x9, x10
 46378bc: 14000005     	b	0x46378d0 <_ChromeMain+0x4632634>
 46378c0: d2800015     	mov	x21, #0x0               ; =0
 46378c4: aa1503e0     	mov	x0, x21
 46378c8: 97eb2f3e     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 46378cc: 92600008     	and	x8, x0, #0x100000000
 46378d0: 2a0003e9     	mov	w9, w0
 46378d4: aa090108     	orr	x8, x8, x9
 46378d8: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 46378dc: eb09011f     	cmp	x8, x9
 46378e0: 9a898115     	csel	x21, x8, x9, hi
 46378e4: 39406288     	ldrb	w8, [x20, #0x18]
 46378e8: 34000368     	cbz	w8, 0x4637954 <_ChromeMain+0x46326b8>
 46378ec: b940268a     	ldr	w10, [x20, #0x24]
 46378f0: 7100055f     	cmp	w10, #0x1
 46378f4: 5400030b     	b.lt	0x4637954 <_ChromeMain+0x46326b8>
 46378f8: 39405e88     	ldrb	w8, [x20, #0x17]
 46378fc: 13001d09     	sxtb	w9, w8
 4637900: f940068b     	ldr	x11, [x20, #0x8]
 4637904: 7100013f     	cmp	w9, #0x0
 4637908: 9a884168     	csel	x8, x11, x8, mi
 463790c: b980228b     	ldrsw	x11, [x20, #0x20]
 4637910: eb0b010c     	subs	x12, x8, x11
 4637914: 54002f83     	b.lo	0x4637f04 <_ChromeMain+0x4632c68>
 4637918: f940028d     	ldr	x13, [x20]
 463791c: 7100013f     	cmp	w9, #0x0
 4637920: 9a9441a9     	csel	x9, x13, x20, mi
 4637924: eb0a019f     	cmp	x12, x10
 4637928: 9a8a318a     	csel	x10, x12, x10, lo
 463792c: f100415f     	cmp	x10, #0x10
 4637930: 54000121     	b.ne	0x4637954 <_ChromeMain+0x46326b8>
 4637934: 8b0b012a     	add	x10, x9, x11
 4637938: b0042ceb     	adrp	x11, 0xcbd4000 <dyld_stub_binder+0xcbd4000>
 463793c: 9110796b     	add	x11, x11, #0x41e
 4637940: a940294c     	ldp	x12, x10, [x10]
 4637944: a9402d6d     	ldp	x13, x11, [x11]
 4637948: eb0d019f     	cmp	x12, x13
 463794c: fa4b0140     	ccmp	x10, x11, #0x0, eq
 4637950: 54000200     	b.eq	0x4637990 <_ChromeMain+0x46326f4>
 4637954: 3900027f     	strb	wzr, [x19]
 4637958: 3900627f     	strb	wzr, [x19, #0x18]
 463795c: f85b83a8     	ldur	x8, [x29, #-0x48]
 4637960: b004cf89     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4637964: f940f929     	ldr	x9, [x9, #0x1f0]
 4637968: f9400129     	ldr	x9, [x9]
 463796c: eb08013f     	cmp	x9, x8
 4637970: 54002c61     	b.ne	0x4637efc <_ChromeMain+0x4632c60>
 4637974: a94f7bfd     	ldp	x29, x30, [sp, #0xf0]
 4637978: a94e4ff4     	ldp	x20, x19, [sp, #0xe0]
 463797c: a94d57f6     	ldp	x22, x21, [sp, #0xd0]
 4637980: a94c5ff8     	ldp	x24, x23, [sp, #0xc0]
 4637984: a94b67fa     	ldp	x26, x25, [sp, #0xb0]
 4637988: 910403ff     	add	sp, sp, #0x100
 463798c: d65f03c0     	ret
 4637990: b9403e8a     	ldr	w10, [x20, #0x3c]
 4637994: 7100055f     	cmp	w10, #0x1
 4637998: 54fffdeb     	b.lt	0x4637954 <_ChromeMain+0x46326b8>
 463799c: b9803a8b     	ldrsw	x11, [x20, #0x38]
 46379a0: eb0b010c     	subs	x12, x8, x11
 46379a4: 54002b03     	b.lo	0x4637f04 <_ChromeMain+0x4632c68>
 46379a8: eb0a019f     	cmp	x12, x10
 46379ac: 9a8a318a     	csel	x10, x12, x10, lo
 46379b0: f100815f     	cmp	x10, #0x20
 46379b4: 54fffd01     	b.ne	0x4637954 <_ChromeMain+0x46326b8>
 46379b8: 8b09016a     	add	x10, x11, x9
 46379bc: b004408b     	adrp	x11, 0xce48000 <dyld_stub_binder+0xce48000>
 46379c0: 9125256b     	add	x11, x11, #0x949
 46379c4: a940354c     	ldp	x12, x13, [x10]
 46379c8: a9403d6e     	ldp	x14, x15, [x11]
 46379cc: a9412950     	ldp	x16, x10, [x10, #0x10]
 46379d0: a9412d71     	ldp	x17, x11, [x11, #0x10]
 46379d4: eb0e019f     	cmp	x12, x14
 46379d8: fa4f01a0     	ccmp	x13, x15, #0x0, eq
 46379dc: fa510200     	ccmp	x16, x17, #0x0, eq
 46379e0: fa4b0140     	ccmp	x10, x11, #0x0, eq
 46379e4: 54fffb81     	b.ne	0x4637954 <_ChromeMain+0x46326b8>
 46379e8: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 46379ec: f90033ff     	str	xzr, [sp, #0x60]
 46379f0: b9404e8a     	ldr	w10, [x20, #0x4c]
 46379f4: 7100055f     	cmp	w10, #0x1
 46379f8: 5400014b     	b.lt	0x4637a20 <_ChromeMain+0x4632784>
 46379fc: b9804a8b     	ldrsw	x11, [x20, #0x48]
 4637a00: eb0b0108     	subs	x8, x8, x11
 4637a04: 54002803     	b.lo	0x4637f04 <_ChromeMain+0x4632c68>
 4637a08: eb0a011f     	cmp	x8, x10
 4637a0c: 9a8a3116     	csel	x22, x8, x10, lo
 4637a10: 8b090177     	add	x23, x11, x9
 4637a14: f1005adf     	cmp	x22, #0x16
 4637a18: 54000089     	b.ls	0x4637a28 <_ChromeMain+0x463278c>
 4637a1c: 1400005e     	b	0x4637b94 <_ChromeMain+0x46328f8>
 4637a20: d2800016     	mov	x22, #0x0               ; =0
 4637a24: d2800017     	mov	x23, #0x0               ; =0
 4637a28: 39019ff6     	strb	w22, [sp, #0x67]
 4637a2c: 910143f8     	add	x24, sp, #0x50
 4637a30: 8b160308     	add	x8, x24, x22
 4637a34: eb18011f     	cmp	x8, x24
 4637a38: 54002603     	b.lo	0x4637ef8 <_ChromeMain+0x4632c5c>
 4637a3c: eb1802ff     	cmp	x23, x24
 4637a40: 54000063     	b.lo	0x4637a4c <_ChromeMain+0x46327b0>
 4637a44: eb0802ff     	cmp	x23, x8
 4637a48: 54002583     	b.lo	0x4637ef8 <_ChromeMain+0x4632c5c>
 4637a4c: aa1803e0     	mov	x0, x24
 4637a50: aa1703e1     	mov	x1, x23
 4637a54: aa1603e2     	mov	x2, x22
 4637a58: 94e75e1d     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4637a5c: 38366b1f     	strb	wzr, [x24, x22]
 4637a60: d00524e0     	adrp	x0, 0xead5000 <dyld_stub_binder+0xead5000>
 4637a64: 91202000     	add	x0, x0, #0x808
 4637a68: 9101a3f9     	add	x25, sp, #0x68
 4637a6c: 9101a3e8     	add	x8, sp, #0x68
 4637a70: 52800041     	mov	w1, #0x2                ; =2
 4637a74: 9700cc38     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 4637a78: 39419fe8     	ldrb	w8, [sp, #0x67]
 4637a7c: 13001d18     	sxtb	w24, w8
 4637a80: f9402fe9     	ldr	x9, [sp, #0x58]
 4637a84: 7100031f     	cmp	w24, #0x0
 4637a88: 9a884136     	csel	x22, x9, x8, mi
 4637a8c: 3941ffe8     	ldrb	w8, [sp, #0x7f]
 4637a90: 13001d17     	sxtb	w23, w8
 4637a94: f9403be9     	ldr	x9, [sp, #0x70]
 4637a98: 710002ff     	cmp	w23, #0x0
 4637a9c: 9a884128     	csel	x8, x9, x8, mi
 4637aa0: eb0802df     	cmp	x22, x8
 4637aa4: 54000161     	b.ne	0x4637ad0 <_ChromeMain+0x4632834>
 4637aa8: f9402be8     	ldr	x8, [sp, #0x50]
 4637aac: 7100031f     	cmp	w24, #0x0
 4637ab0: 910143e9     	add	x9, sp, #0x50
 4637ab4: 9a894100     	csel	x0, x8, x9, mi
 4637ab8: f94037e8     	ldr	x8, [sp, #0x68]
 4637abc: 710002ff     	cmp	w23, #0x0
 4637ac0: 9a994101     	csel	x1, x8, x25, mi
 4637ac4: aa1603e2     	mov	x2, x22
 4637ac8: 94e74766     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4637acc: 340005e0     	cbz	w0, 0x4637b88 <_ChromeMain+0x46328ec>
 4637ad0: d00524e0     	adrp	x0, 0xead5000 <dyld_stub_binder+0xead5000>
 4637ad4: 9120a000     	add	x0, x0, #0x828
 4637ad8: 9100e3f9     	add	x25, sp, #0x38
 4637adc: 9100e3e8     	add	x8, sp, #0x38
 4637ae0: 52800041     	mov	w1, #0x2                ; =2
 4637ae4: 9700cc1c     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 4637ae8: 39413fe8     	ldrb	w8, [sp, #0x4f]
 4637aec: 13001d17     	sxtb	w23, w8
 4637af0: f94023e9     	ldr	x9, [sp, #0x40]
 4637af4: 710002ff     	cmp	w23, #0x0
 4637af8: 9a884128     	csel	x8, x9, x8, mi
 4637afc: eb0802df     	cmp	x22, x8
 4637b00: 540001a1     	b.ne	0x4637b34 <_ChromeMain+0x4632898>
 4637b04: f9402be8     	ldr	x8, [sp, #0x50]
 4637b08: 7100031f     	cmp	w24, #0x0
 4637b0c: 910143e9     	add	x9, sp, #0x50
 4637b10: 9a894100     	csel	x0, x8, x9, mi
 4637b14: f9401fe8     	ldr	x8, [sp, #0x38]
 4637b18: 710002ff     	cmp	w23, #0x0
 4637b1c: 9a994101     	csel	x1, x8, x25, mi
 4637b20: aa1603e2     	mov	x2, x22
 4637b24: 94e7474f     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4637b28: 7100001f     	cmp	w0, #0x0
 4637b2c: 1a9f07f6     	cset	w22, ne
 4637b30: 14000002     	b	0x4637b38 <_ChromeMain+0x463289c>
 4637b34: 52800036     	mov	w22, #0x1               ; =1
 4637b38: 36f800b7     	tbz	w23, #0x1f, 0x4637b4c <_ChromeMain+0x46328b0>
 4637b3c: f9401fe0     	ldr	x0, [sp, #0x38]
 4637b40: f94027e8     	ldr	x8, [sp, #0x48]
 4637b44: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4637b48: 96e744dc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4637b4c: 3941fff7     	ldrb	w23, [sp, #0x7f]
 4637b50: 363800b7     	tbz	w23, #0x7, 0x4637b64 <_ChromeMain+0x46328c8>
 4637b54: f94037e0     	ldr	x0, [sp, #0x68]
 4637b58: f9403fe8     	ldr	x8, [sp, #0x78]
 4637b5c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4637b60: 96e744d6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4637b64: 34000316     	cbz	w22, 0x4637bc4 <_ChromeMain+0x4632928>
 4637b68: 3900027f     	strb	wzr, [x19]
 4637b6c: 3900627f     	strb	wzr, [x19, #0x18]
 4637b70: 36ffef78     	tbz	w24, #0x1f, 0x463795c <_ChromeMain+0x46326c0>
 4637b74: f9402be0     	ldr	x0, [sp, #0x50]
 4637b78: f94033e8     	ldr	x8, [sp, #0x60]
 4637b7c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4637b80: 96e744ce     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4637b84: 17ffff76     	b	0x463795c <_ChromeMain+0x46326c0>
 4637b88: 52800016     	mov	w22, #0x0               ; =0
 4637b8c: 373ffe57     	tbnz	w23, #0x7, 0x4637b54 <_ChromeMain+0x46328b8>
 4637b90: 17fffff5     	b	0x4637b64 <_ChromeMain+0x46328c8>
 4637b94: 927c6ad9     	and	x25, x22, #0x7ffffff0
 4637b98: 91004320     	add	x0, x25, #0x10
 4637b9c: 96e75df3     	bl	0xf368 <_ChromeMain+0xa0cc>
 4637ba0: aa0003f8     	mov	x24, x0
 4637ba4: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 4637ba8: cb080328     	sub	x8, x25, x8
 4637bac: a9055be0     	stp	x0, x22, [sp, #0x50]
 4637bb0: f90033e8     	str	x8, [sp, #0x60]
 4637bb4: 17ffff9f     	b	0x4637a30 <_ChromeMain+0x4632794>
 4637bb8: d2800016     	mov	x22, #0x0               ; =0
 4637bbc: d2800014     	mov	x20, #0x0               ; =0
 4637bc0: 14000035     	b	0x4637c94 <_ChromeMain+0x46329f8>
 4637bc4: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 4637bc8: f90027ff     	str	xzr, [sp, #0x48]
 4637bcc: b004c4b7     	adrp	x23, 0xdecc000 <dyld_stub_binder+0xdecc000>
 4637bd0: 91034ef7     	add	x23, x23, #0xd3
 4637bd4: 52800068     	mov	w8, #0x3                ; =3
 4637bd8: a906a3f7     	stp	x23, x8, [sp, #0x68]
 4637bdc: 910083f6     	add	x22, sp, #0x20
 4637be0: 910083e8     	add	x8, sp, #0x20
 4637be4: aa1503e0     	mov	x0, x21
 4637be8: 972be596     	bl	0x1131240 <_ChromeMain+0x112bfa4>
 4637bec: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 4637bf0: a9422be9     	ldp	x9, x10, [sp, #0x20]
 4637bf4: f100011f     	cmp	x8, #0x0
 4637bf8: 9a964129     	csel	x9, x9, x22, mi
 4637bfc: 7100011f     	cmp	w8, #0x0
 4637c00: 9a884148     	csel	x8, x10, x8, mi
 4637c04: a907a3e9     	stp	x9, x8, [sp, #0x78]
 4637c08: d0048568     	adrp	x8, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4637c0c: 9106a908     	add	x8, x8, #0x1aa
 4637c10: 528000c9     	mov	w9, #0x6                ; =6
 4637c14: a908a7e8     	stp	x8, x9, [sp, #0x88]
 4637c18: b0048d88     	adrp	x8, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 4637c1c: 9104f108     	add	x8, x8, #0x13c
 4637c20: 52800029     	mov	w9, #0x1                ; =1
 4637c24: a909a7e8     	stp	x8, x9, [sp, #0x98]
 4637c28: 9100e3e8     	add	x8, sp, #0x38
 4637c2c: 9101a3e0     	add	x0, sp, #0x68
 4637c30: 52800081     	mov	w1, #0x4                ; =4
 4637c34: 9700cbc8     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 4637c38: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4637c3c: 36f800a8     	tbz	w8, #0x1f, 0x4637c50 <_ChromeMain+0x46329b4>
 4637c40: f94013e0     	ldr	x0, [sp, #0x20]
 4637c44: f9401be8     	ldr	x8, [sp, #0x30]
 4637c48: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4637c4c: 96e7449b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4637c50: b9405e88     	ldr	w8, [x20, #0x5c]
 4637c54: 7100051f     	cmp	w8, #0x1
 4637c58: 54fffb0b     	b.lt	0x4637bb8 <_ChromeMain+0x463291c>
 4637c5c: 39405e89     	ldrb	w9, [x20, #0x17]
 4637c60: 13001d2a     	sxtb	w10, w9
 4637c64: f940068b     	ldr	x11, [x20, #0x8]
 4637c68: 7100015f     	cmp	w10, #0x0
 4637c6c: 9a89416b     	csel	x11, x11, x9, mi
 4637c70: b9805a89     	ldrsw	x9, [x20, #0x58]
 4637c74: eb09016b     	subs	x11, x11, x9
 4637c78: 54001463     	b.lo	0x4637f04 <_ChromeMain+0x4632c68>
 4637c7c: f940028c     	ldr	x12, [x20]
 4637c80: 7100015f     	cmp	w10, #0x0
 4637c84: 9a94418a     	csel	x10, x12, x20, mi
 4637c88: eb08017f     	cmp	x11, x8
 4637c8c: 9a883176     	csel	x22, x11, x8, lo
 4637c90: 8b090154     	add	x20, x10, x9
 4637c94: aa1403e0     	mov	x0, x20
 4637c98: 528007e1     	mov	w1, #0x3f               ; =63
 4637c9c: aa1603e2     	mov	x2, x22
 4637ca0: 94e79fc1     	bl	0x801fba4 <_ChromeMain+0x801a908>
 4637ca4: cb140008     	sub	x8, x0, x20
 4637ca8: eb0802df     	cmp	x22, x8
 4637cac: 9a8832c8     	csel	x8, x22, x8, lo
 4637cb0: f100001f     	cmp	x0, #0x0
 4637cb4: 9a8802d6     	csel	x22, x22, x8, eq
 4637cb8: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4637cbc: f9001bff     	str	xzr, [sp, #0x30]
 4637cc0: 52800068     	mov	w8, #0x3                ; =3
 4637cc4: a906a3f7     	stp	x23, x8, [sp, #0x68]
 4637cc8: 910023f7     	add	x23, sp, #0x8
 4637ccc: 910023e8     	add	x8, sp, #0x8
 4637cd0: aa1503e0     	mov	x0, x21
 4637cd4: 972be55b     	bl	0x1131240 <_ChromeMain+0x112bfa4>
 4637cd8: 39807fe8     	ldrsb	x8, [sp, #0x1f]
 4637cdc: a940abe9     	ldp	x9, x10, [sp, #0x8]
 4637ce0: f100011f     	cmp	x8, #0x0
 4637ce4: 9a974129     	csel	x9, x9, x23, mi
 4637ce8: 7100011f     	cmp	w8, #0x0
 4637cec: 9a884148     	csel	x8, x10, x8, mi
 4637cf0: a907a3e9     	stp	x9, x8, [sp, #0x78]
 4637cf4: d0048568     	adrp	x8, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4637cf8: 9105e108     	add	x8, x8, #0x178
 4637cfc: 52800149     	mov	w9, #0xa                ; =10
 4637d00: a908a7e8     	stp	x8, x9, [sp, #0x88]
 4637d04: 910083e8     	add	x8, sp, #0x20
 4637d08: 9101a3e0     	add	x0, sp, #0x68
 4637d0c: 52800061     	mov	w1, #0x3                ; =3
 4637d10: 9700cb91     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 4637d14: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4637d18: 36f800a8     	tbz	w8, #0x1f, 0x4637d2c <_ChromeMain+0x4632a90>
 4637d1c: f94007e0     	ldr	x0, [sp, #0x8]
 4637d20: f9400fe8     	ldr	x8, [sp, #0x18]
 4637d24: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4637d28: 96e74464     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4637d2c: 3940dfe8     	ldrb	w8, [sp, #0x37]
 4637d30: 13001d19     	sxtb	w25, w8
 4637d34: f94017e9     	ldr	x9, [sp, #0x28]
 4637d38: 7100033f     	cmp	w25, #0x0
 4637d3c: 9a884135     	csel	x21, x9, x8, mi
 4637d40: eb1502df     	cmp	x22, x21
 4637d44: 54000121     	b.ne	0x4637d68 <_ChromeMain+0x4632acc>
 4637d48: f94013e8     	ldr	x8, [sp, #0x20]
 4637d4c: 7100033f     	cmp	w25, #0x0
 4637d50: 910083e9     	add	x9, sp, #0x20
 4637d54: 9a894101     	csel	x1, x8, x9, mi
 4637d58: aa1403e0     	mov	x0, x20
 4637d5c: aa1603e2     	mov	x2, x22
 4637d60: 94e746c0     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4637d64: 340003a0     	cbz	w0, 0x4637dd8 <_ChromeMain+0x4632b3c>
 4637d68: eb1602bf     	cmp	x21, x22
 4637d6c: 54000188     	b.hi	0x4637d9c <_ChromeMain+0x4632b00>
 4637d70: 910006a8     	add	x8, x21, #0x1
 4637d74: eb0802df     	cmp	x22, x8
 4637d78: 54000121     	b.ne	0x4637d9c <_ChromeMain+0x4632b00>
 4637d7c: f94013e8     	ldr	x8, [sp, #0x20]
 4637d80: 7100033f     	cmp	w25, #0x0
 4637d84: 910083e9     	add	x9, sp, #0x20
 4637d88: 9a894101     	csel	x1, x8, x9, mi
 4637d8c: aa1403e0     	mov	x0, x20
 4637d90: aa1503e2     	mov	x2, x21
 4637d94: 94e746b3     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4637d98: 340003c0     	cbz	w0, 0x4637e10 <_ChromeMain+0x4632b74>
 4637d9c: 39413fe9     	ldrb	w9, [sp, #0x4f]
 4637da0: 13001d28     	sxtb	w8, w9
 4637da4: f94023ea     	ldr	x10, [sp, #0x40]
 4637da8: 7100011f     	cmp	w8, #0x0
 4637dac: 9a894157     	csel	x23, x10, x9, mi
 4637db0: eb1702d5     	subs	x21, x22, x23
 4637db4: 54000129     	b.ls	0x4637dd8 <_ChromeMain+0x4632b3c>
 4637db8: f9401fe9     	ldr	x9, [sp, #0x38]
 4637dbc: 7100011f     	cmp	w8, #0x0
 4637dc0: 9100e3e8     	add	x8, sp, #0x38
 4637dc4: 9a884121     	csel	x1, x9, x8, mi
 4637dc8: aa1403e0     	mov	x0, x20
 4637dcc: aa1703e2     	mov	x2, x23
 4637dd0: 94e746a4     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4637dd4: 340002a0     	cbz	w0, 0x4637e28 <_ChromeMain+0x4632b8c>
 4637dd8: 3900027f     	strb	wzr, [x19]
 4637ddc: 3900627f     	strb	wzr, [x19, #0x18]
 4637de0: 36f800b9     	tbz	w25, #0x1f, 0x4637df4 <_ChromeMain+0x4632b58>
 4637de4: f94013e0     	ldr	x0, [sp, #0x20]
 4637de8: f9401be8     	ldr	x8, [sp, #0x30]
 4637dec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4637df0: 96e74432     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4637df4: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 4637df8: 36ffebc8     	tbz	w8, #0x1f, 0x4637b70 <_ChromeMain+0x46328d4>
 4637dfc: f9401fe0     	ldr	x0, [sp, #0x38]
 4637e00: f94027e8     	ldr	x8, [sp, #0x48]
 4637e04: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4637e08: 96e7442c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4637e0c: 17ffff59     	b	0x4637b70 <_ChromeMain+0x46328d4>
 4637e10: b4000756     	cbz	x22, 0x4637ef8 <_ChromeMain+0x4632c5c>
 4637e14: 8b160288     	add	x8, x20, x22
 4637e18: 385ff108     	ldurb	w8, [x8, #-0x1]
 4637e1c: 7100bd1f     	cmp	w8, #0x2f
 4637e20: 54fffdc0     	b.eq	0x4637dd8 <_ChromeMain+0x4632b3c>
 4637e24: 17ffffde     	b	0x4637d9c <_ChromeMain+0x4632b00>
 4637e28: 8b160288     	add	x8, x20, x22
 4637e2c: 385ff108     	ldurb	w8, [x8, #-0x1]
 4637e30: 7100bd1f     	cmp	w8, #0x2f
 4637e34: 1a9f17e8     	cset	w8, eq
 4637e38: eb0802b5     	subs	x21, x21, x8
 4637e3c: 54fffce0     	b.eq	0x4637dd8 <_ChromeMain+0x4632b3c>
 4637e40: 8b170294     	add	x20, x20, x23
 4637e44: aa1403e0     	mov	x0, x20
 4637e48: 528005e1     	mov	w1, #0x2f               ; =47
 4637e4c: aa1503e2     	mov	x2, x21
 4637e50: 94e79f55     	bl	0x801fba4 <_ChromeMain+0x801a908>
 4637e54: cb140008     	sub	x8, x0, x20
 4637e58: b100051f     	cmn	x8, #0x1
 4637e5c: fa401804     	ccmp	x0, #0x0, #0x4, ne
 4637e60: 54fffbc1     	b.ne	0x4637dd8 <_ChromeMain+0x4632b3c>
 4637e64: 92800208     	mov	x8, #-0x11              ; =-17
 4637e68: f2efffe8     	movk	x8, #0x7fff, lsl #48
 4637e6c: eb0802bf     	cmp	x21, x8
 4637e70: 54000482     	b.hs	0x4637f00 <_ChromeMain+0x4632c64>
 4637e74: f1005abf     	cmp	x21, #0x16
 4637e78: 54000088     	b.hi	0x4637e88 <_ChromeMain+0x4632bec>
 4637e7c: 3901fff5     	strb	w21, [sp, #0x7f]
 4637e80: 9101a3f6     	add	x22, sp, #0x68
 4637e84: 14000009     	b	0x4637ea8 <_ChromeMain+0x4632c0c>
 4637e88: 927ceab7     	and	x23, x21, #0x7ffffffffffffff0
 4637e8c: 910042e0     	add	x0, x23, #0x10
 4637e90: 96e75d36     	bl	0xf368 <_ChromeMain+0xa0cc>
 4637e94: aa0003f6     	mov	x22, x0
 4637e98: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 4637e9c: cb0802e8     	sub	x8, x23, x8
 4637ea0: a906d7e0     	stp	x0, x21, [sp, #0x68]
 4637ea4: f9003fe8     	str	x8, [sp, #0x78]
 4637ea8: 8b1502c8     	add	x8, x22, x21
 4637eac: eb16011f     	cmp	x8, x22
 4637eb0: 54000243     	b.lo	0x4637ef8 <_ChromeMain+0x4632c5c>
 4637eb4: eb16029f     	cmp	x20, x22
 4637eb8: 54000063     	b.lo	0x4637ec4 <_ChromeMain+0x4632c28>
 4637ebc: eb08029f     	cmp	x20, x8
 4637ec0: 540001c3     	b.lo	0x4637ef8 <_ChromeMain+0x4632c5c>
 4637ec4: aa1603e0     	mov	x0, x22
 4637ec8: aa1403e1     	mov	x1, x20
 4637ecc: aa1503e2     	mov	x2, x21
 4637ed0: 94e75cff     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4637ed4: 38356adf     	strb	wzr, [x22, x21]
 4637ed8: 3cc683e0     	ldur	q0, [sp, #0x68]
 4637edc: 3d800260     	str	q0, [x19]
 4637ee0: f9403fe8     	ldr	x8, [sp, #0x78]
 4637ee4: f9000a68     	str	x8, [x19, #0x10]
 4637ee8: 52800028     	mov	w8, #0x1                ; =1
 4637eec: 39006268     	strb	w8, [x19, #0x18]
 4637ef0: 37fff7b9     	tbnz	w25, #0x1f, 0x4637de4 <_ChromeMain+0x4632b48>
 4637ef4: 17ffffc0     	b	0x4637df4 <_ChromeMain+0x4632b58>
 4637ef8: d4200020     	brk	#0x1
 4637efc: 94e73119     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4637f00: 94172123     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 4637f04: b0048d60     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4637f08: 91376000     	add	x0, x0, #0xdd8
 4637f0c: 941720f2     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
		...
