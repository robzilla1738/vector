
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462ea30: d103c3ff     	sub	sp, sp, #0xf0
 462ea34: a9096ffc     	stp	x28, x27, [sp, #0x90]
 462ea38: a90a67fa     	stp	x26, x25, [sp, #0xa0]
 462ea3c: a90b5ff8     	stp	x24, x23, [sp, #0xb0]
 462ea40: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 462ea44: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 462ea48: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 462ea4c: 910383fd     	add	x29, sp, #0xe0
 462ea50: b4003ea1     	cbz	x1, 0x462f224 <_ChromeMain+0x4629f88>
 462ea54: aa0203f7     	mov	x23, x2
 462ea58: 39405c48     	ldrb	w8, [x2, #0x17]
 462ea5c: f9400449     	ldr	x9, [x2, #0x8]
 462ea60: 7219011f     	tst	w8, #0x80
 462ea64: 9a881128     	csel	x8, x9, x8, ne
 462ea68: b4003de8     	cbz	x8, 0x462f224 <_ChromeMain+0x4629f88>
 462ea6c: aa0303f5     	mov	x21, x3
 462ea70: aa0103f4     	mov	x20, x1
 462ea74: aa0003f3     	mov	x19, x0
 462ea78: f9400008     	ldr	x8, [x0]
 462ea7c: f9403108     	ldr	x8, [x8, #0x60]
 462ea80: d0fe01fb     	adrp	x27, 0x66c000 <_ChromeMain+0x666d64>
 462ea84: 9139437b     	add	x27, x27, #0xe50
 462ea88: eb1b011f     	cmp	x8, x27
 462ea8c: 54004101     	b.ne	0x462f2ac <_ChromeMain+0x462a010>
 462ea90: f940c260     	ldr	x0, [x19, #0x180]
 462ea94: b4003c80     	cbz	x0, 0x462f224 <_ChromeMain+0x4629f88>
 462ea98: 52827108     	mov	w8, #0x1388             ; =5000
 462ea9c: 8b080260     	add	x0, x19, x8
 462eaa0: aa1703e1     	mov	x1, x23
 462eaa4: 9784b73f     	bl	0x275c7a0 <_ChromeMain+0x2757504>
 462eaa8: b913ca7f     	str	wzr, [x19, #0x13c8]
 462eaac: aa1303e0     	mov	x0, x19
 462eab0: aa1403e1     	mov	x1, x20
 462eab4: 94002a16     	bl	0x463930c <_ChromeMain+0x4634070>
 462eab8: 52800800     	mov	w0, #0x40               ; =64
 462eabc: 96e7822b     	bl	0xf368 <_ChromeMain+0xa0cc>
 462eac0: aa0003f6     	mov	x22, x0
 462eac4: 9115c268     	add	x8, x19, #0x570
 462eac8: f100027f     	cmp	x19, #0x0
 462eacc: 9a8803f8     	csel	x24, xzr, x8, eq
 462ead0: d004e5c8     	adrp	x8, 0xe2e8000 <dyld_stub_binder+0xe2e8000>
 462ead4: 912da108     	add	x8, x8, #0xb68
 462ead8: a9007c08     	stp	x8, xzr, [x0]
 462eadc: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 462eae0: f900081f     	str	xzr, [x0, #0x10]
 462eae4: 925e7708     	and	x8, x24, #0xfffffffc00000000
 462eae8: 90052c3a     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462eaec: f9404749     	ldr	x9, [x26, #0x88]
 462eaf0: eb09011f     	cmp	x8, x9
 462eaf4: 54000061     	b.ne	0x462eb00 <_ChromeMain+0x4629864>
 462eaf8: aa1803e0     	mov	x0, x24
 462eafc: 96e79600     	bl	0x142fc <_ChromeMain+0xf060>
 462eb00: f90016d8     	str	x24, [x22, #0x28]
 462eb04: 52800100     	mov	w0, #0x8                ; =8
 462eb08: 96e78218     	bl	0xf368 <_ChromeMain+0xa0cc>
 462eb0c: b900001f     	str	wzr, [x0]
 462eb10: 3900101f     	strb	wzr, [x0, #0x4]
 462eb14: b40000c0     	cbz	x0, 0x462eb2c <_ChromeMain+0x4629890>
 462eb18: 52800028     	mov	w8, #0x1                ; =1
 462eb1c: b8280008     	ldadd	w8, w8, [x0]
 462eb20: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 462eb24: 6b09011f     	cmp	w8, w9
 462eb28: 54003e20     	b.eq	0x462f2ec <_ChromeMain+0x462a050>
 462eb2c: a9035ac0     	stp	x0, x22, [x22, #0x30]
 462eb30: b40007b7     	cbz	x23, 0x462ec24 <_ChromeMain+0x4629988>
 462eb34: 3940d2e8     	ldrb	w8, [x23, #0x34]
 462eb38: 7100011f     	cmp	w8, #0x0
 462eb3c: 5280f9c8     	mov	w8, #0x7ce              ; =1998
 462eb40: 1a880517     	cinc	w23, w8, ne
 462eb44: b004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462eb48: 91298908     	add	x8, x8, #0xa62
 462eb4c: b004cac9     	adrp	x9, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462eb50: 91293129     	add	x9, x9, #0xa4c
 462eb54: 9a881138     	csel	x24, x9, x8, ne
 462eb58: d280001c     	mov	x28, #0x0               ; =0
 462eb5c: 79400308     	ldrh	w8, [x24]
 462eb60: 34003be8     	cbz	w8, 0x462f2dc <_ChromeMain+0x462a040>
 462eb64: 91000b08     	add	x8, x24, #0x2
 462eb68: 787c7909     	ldrh	w9, [x8, x28, lsl #1]
 462eb6c: 9100079c     	add	x28, x28, #0x1
 462eb70: 35ffffc9     	cbnz	w9, 0x462eb68 <_ChromeMain+0x46298cc>
 462eb74: 92800208     	mov	x8, #-0x11              ; =-17
 462eb78: f2efffe8     	movk	x8, #0x7fff, lsl #48
 462eb7c: eb08039f     	cmp	x28, x8
 462eb80: 54003b42     	b.hs	0x462f2e8 <_ChromeMain+0x462a04c>
 462eb84: aa1a03fb     	mov	x27, x26
 462eb88: f1002b9f     	cmp	x28, #0xa
 462eb8c: 54003a29     	b.ls	0x462f2d0 <_ChromeMain+0x462a034>
 462eb90: 927def9a     	and	x26, x28, #0x7ffffffffffffff8
 462eb94: d37ffb48     	lsl	x8, x26, #1
 462eb98: 91004100     	add	x0, x8, #0x10
 462eb9c: 96e781f3     	bl	0xf368 <_ChromeMain+0xa0cc>
 462eba0: aa0003f9     	mov	x25, x0
 462eba4: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 462eba8: cb080348     	sub	x8, x26, x8
 462ebac: a903f3e0     	stp	x0, x28, [sp, #0x38]
 462ebb0: f90027e8     	str	x8, [sp, #0x48]
 462ebb4: aa1b03fa     	mov	x26, x27
 462ebb8: d0fe01fb     	adrp	x27, 0x66c000 <_ChromeMain+0x666d64>
 462ebbc: 9139437b     	add	x27, x27, #0xe50
 462ebc0: 8b1c0728     	add	x8, x25, x28, lsl #1
 462ebc4: eb19011f     	cmp	x8, x25
 462ebc8: 54003823     	b.lo	0x462f2cc <_ChromeMain+0x462a030>
 462ebcc: eb19031f     	cmp	x24, x25
 462ebd0: 54000063     	b.lo	0x462ebdc <_ChromeMain+0x4629940>
 462ebd4: eb08031f     	cmp	x24, x8
 462ebd8: 540037a3     	b.lo	0x462f2cc <_ChromeMain+0x462a030>
 462ebdc: d37ffb82     	lsl	x2, x28, #1
 462ebe0: aa1903e0     	mov	x0, x25
 462ebe4: aa1803e1     	mov	x1, x24
 462ebe8: 94e76c44     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 462ebec: 783c7b3f     	strh	wzr, [x25, x28, lsl #1]
 462ebf0: 9100e3e2     	add	x2, sp, #0x38
 462ebf4: aa1603e0     	mov	x0, x22
 462ebf8: aa1703e1     	mov	x1, x23
 462ebfc: 9745dac3     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462ec00: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 462ec04: 36f800a8     	tbz	w8, #0x1f, 0x462ec18 <_ChromeMain+0x462997c>
 462ec08: f9401fe0     	ldr	x0, [sp, #0x38]
 462ec0c: f94027e8     	ldr	x8, [sp, #0x48]
 462ec10: d37ff901     	lsl	x1, x8, #1
 462ec14: 96e768a9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462ec18: aa1603e0     	mov	x0, x22
 462ec1c: 52800001     	mov	w1, #0x0                ; =0
 462ec20: 979e1e65     	bl	0x2db65b4 <_ChromeMain+0x2db1318>
 462ec24: 52800400     	mov	w0, #0x20               ; =32
 462ec28: 96e781d0     	bl	0xf368 <_ChromeMain+0xa0cc>
 462ec2c: f9001fe0     	str	x0, [sp, #0x38]
 462ec30: d004c888     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 462ec34: 3dc3b100     	ldr	q0, [x8, #0xec0]
 462ec38: 3c8403e0     	stur	q0, [sp, #0x40]
 462ec3c: 91005809     	add	x9, x0, #0x16
 462ec40: eb00013f     	cmp	x9, x0
 462ec44: 54003443     	b.lo	0x462f2cc <_ChromeMain+0x462a030>
 462ec48: 3d800be0     	str	q0, [sp, #0x20]
 462ec4c: b004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462ec50: 9129d108     	add	x8, x8, #0xa74
 462ec54: eb08013f     	cmp	x9, x8
 462ec58: fa488002     	ccmp	x0, x8, #0x2, hi
 462ec5c: 54003389     	b.ls	0x462f2cc <_ChromeMain+0x462a030>
 462ec60: 3dc00100     	ldr	q0, [x8]
 462ec64: 3d800000     	str	q0, [x0]
 462ec68: f840e108     	ldur	x8, [x8, #0xe]
 462ec6c: f800e008     	stur	x8, [x0, #0xe]
 462ec70: 79002c1f     	strh	wzr, [x0, #0x16]
 462ec74: 9100e3e2     	add	x2, sp, #0x38
 462ec78: aa1603e0     	mov	x0, x22
 462ec7c: 5280fa01     	mov	w1, #0x7d0              ; =2000
 462ec80: 9745daa2     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462ec84: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 462ec88: 36f800a8     	tbz	w8, #0x1f, 0x462ec9c <_ChromeMain+0x4629a00>
 462ec8c: f9401fe0     	ldr	x0, [sp, #0x38]
 462ec90: f94027e8     	ldr	x8, [sp, #0x48]
 462ec94: d37ff901     	lsl	x1, x8, #1
 462ec98: 96e76888     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462ec9c: 52800400     	mov	w0, #0x20               ; =32
 462eca0: 96e781b2     	bl	0xf368 <_ChromeMain+0xa0cc>
 462eca4: f9001fe0     	str	x0, [sp, #0x38]
 462eca8: b004c888     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 462ecac: 3dc18d00     	ldr	q0, [x8, #0x630]
 462ecb0: 3c8403e0     	stur	q0, [sp, #0x40]
 462ecb4: 91006009     	add	x9, x0, #0x18
 462ecb8: eb00013f     	cmp	x9, x0
 462ecbc: 54003083     	b.lo	0x462f2cc <_ChromeMain+0x462a030>
 462ecc0: 3d8007e0     	str	q0, [sp, #0x10]
 462ecc4: b004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462ecc8: 912a3108     	add	x8, x8, #0xa8c
 462eccc: eb08013f     	cmp	x9, x8
 462ecd0: fa488002     	ccmp	x0, x8, #0x2, hi
 462ecd4: 54002fc9     	b.ls	0x462f2cc <_ChromeMain+0x462a030>
 462ecd8: 3dc00100     	ldr	q0, [x8]
 462ecdc: 3d800000     	str	q0, [x0]
 462ece0: f9400908     	ldr	x8, [x8, #0x10]
 462ece4: f9000808     	str	x8, [x0, #0x10]
 462ece8: 7900301f     	strh	wzr, [x0, #0x18]
 462ecec: 9100e3e2     	add	x2, sp, #0x38
 462ecf0: aa1603e0     	mov	x0, x22
 462ecf4: 5280fa21     	mov	w1, #0x7d1              ; =2001
 462ecf8: 9745da84     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462ecfc: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 462ed00: 36f800a8     	tbz	w8, #0x1f, 0x462ed14 <_ChromeMain+0x4629a78>
 462ed04: f9401fe0     	ldr	x0, [sp, #0x38]
 462ed08: f94027e8     	ldr	x8, [sp, #0x48]
 462ed0c: d37ff901     	lsl	x1, x8, #1
 462ed10: 96e7686a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462ed14: 52800400     	mov	w0, #0x20               ; =32
 462ed18: 96e78194     	bl	0xf368 <_ChromeMain+0xa0cc>
 462ed1c: f9001fe0     	str	x0, [sp, #0x38]
 462ed20: 3dc00be0     	ldr	q0, [sp, #0x20]
 462ed24: 3c8403e0     	stur	q0, [sp, #0x40]
 462ed28: 91005809     	add	x9, x0, #0x16
 462ed2c: eb00013f     	cmp	x9, x0
 462ed30: 54002ce3     	b.lo	0x462f2cc <_ChromeMain+0x462a030>
 462ed34: b004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462ed38: 912a9908     	add	x8, x8, #0xaa6
 462ed3c: eb08013f     	cmp	x9, x8
 462ed40: fa488002     	ccmp	x0, x8, #0x2, hi
 462ed44: 54002c49     	b.ls	0x462f2cc <_ChromeMain+0x462a030>
 462ed48: 3dc00100     	ldr	q0, [x8]
 462ed4c: 3d800000     	str	q0, [x0]
 462ed50: f840e108     	ldur	x8, [x8, #0xe]
 462ed54: f800e008     	stur	x8, [x0, #0xe]
 462ed58: 79002c1f     	strh	wzr, [x0, #0x16]
 462ed5c: 9100e3e2     	add	x2, sp, #0x38
 462ed60: aa1603e0     	mov	x0, x22
 462ed64: 5280fae1     	mov	w1, #0x7d7              ; =2007
 462ed68: 9745da68     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462ed6c: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 462ed70: 36f800a8     	tbz	w8, #0x1f, 0x462ed84 <_ChromeMain+0x4629ae8>
 462ed74: f9401fe0     	ldr	x0, [sp, #0x38]
 462ed78: f94027e8     	ldr	x8, [sp, #0x48]
 462ed7c: d37ff901     	lsl	x1, x8, #1
 462ed80: 96e7684e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462ed84: 52800400     	mov	w0, #0x20               ; =32
 462ed88: 96e78178     	bl	0xf368 <_ChromeMain+0xa0cc>
 462ed8c: f9001fe0     	str	x0, [sp, #0x38]
 462ed90: b004c888     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 462ed94: 3dc02d00     	ldr	q0, [x8, #0xb0]
 462ed98: 3c8403e0     	stur	q0, [sp, #0x40]
 462ed9c: 91006809     	add	x9, x0, #0x1a
 462eda0: eb00013f     	cmp	x9, x0
 462eda4: 54002943     	b.lo	0x462f2cc <_ChromeMain+0x462a030>
 462eda8: b004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462edac: 912af908     	add	x8, x8, #0xabe
 462edb0: eb08013f     	cmp	x9, x8
 462edb4: fa488002     	ccmp	x0, x8, #0x2, hi
 462edb8: 540028a9     	b.ls	0x462f2cc <_ChromeMain+0x462a030>
 462edbc: 3dc00100     	ldr	q0, [x8]
 462edc0: 3d800000     	str	q0, [x0]
 462edc4: 3cc0a100     	ldur	q0, [x8, #0xa]
 462edc8: 3c80a000     	stur	q0, [x0, #0xa]
 462edcc: 7900341f     	strh	wzr, [x0, #0x1a]
 462edd0: 9100e3e2     	add	x2, sp, #0x38
 462edd4: aa1603e0     	mov	x0, x22
 462edd8: 5280fa41     	mov	w1, #0x7d2              ; =2002
 462eddc: 9745da4b     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462ede0: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 462ede4: 36f800a8     	tbz	w8, #0x1f, 0x462edf8 <_ChromeMain+0x4629b5c>
 462ede8: f9401fe0     	ldr	x0, [sp, #0x38]
 462edec: f94027e8     	ldr	x8, [sp, #0x48]
 462edf0: d37ff901     	lsl	x1, x8, #1
 462edf4: 96e76831     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462edf8: 52800400     	mov	w0, #0x20               ; =32
 462edfc: 96e7815b     	bl	0xf368 <_ChromeMain+0xa0cc>
 462ee00: f9001fe0     	str	x0, [sp, #0x38]
 462ee04: 3dc007e0     	ldr	q0, [sp, #0x10]
 462ee08: 3c8403e0     	stur	q0, [sp, #0x40]
 462ee0c: 91006009     	add	x9, x0, #0x18
 462ee10: eb00013f     	cmp	x9, x0
 462ee14: 540025c3     	b.lo	0x462f2cc <_ChromeMain+0x462a030>
 462ee18: b004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462ee1c: 912b6908     	add	x8, x8, #0xada
 462ee20: eb08013f     	cmp	x9, x8
 462ee24: fa488002     	ccmp	x0, x8, #0x2, hi
 462ee28: 54002529     	b.ls	0x462f2cc <_ChromeMain+0x462a030>
 462ee2c: 3dc00100     	ldr	q0, [x8]
 462ee30: 3d800000     	str	q0, [x0]
 462ee34: f9400908     	ldr	x8, [x8, #0x10]
 462ee38: f9000808     	str	x8, [x0, #0x10]
 462ee3c: 7900301f     	strh	wzr, [x0, #0x18]
 462ee40: 9100e3e2     	add	x2, sp, #0x38
 462ee44: aa1603e0     	mov	x0, x22
 462ee48: 5280fa61     	mov	w1, #0x7d3              ; =2003
 462ee4c: 9745da2f     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462ee50: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 462ee54: 36f800a8     	tbz	w8, #0x1f, 0x462ee68 <_ChromeMain+0x4629bcc>
 462ee58: f9401fe0     	ldr	x0, [sp, #0x38]
 462ee5c: f94027e8     	ldr	x8, [sp, #0x48]
 462ee60: d37ff901     	lsl	x1, x8, #1
 462ee64: 96e76815     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462ee68: aa1603e0     	mov	x0, x22
 462ee6c: 52800001     	mov	w1, #0x0                ; =0
 462ee70: 979e1dd1     	bl	0x2db65b4 <_ChromeMain+0x2db1318>
 462ee74: 52800600     	mov	w0, #0x30               ; =48
 462ee78: 96e7813c     	bl	0xf368 <_ChromeMain+0xa0cc>
 462ee7c: f9001fe0     	str	x0, [sp, #0x38]
 462ee80: b004c888     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 462ee84: 3dc16d00     	ldr	q0, [x8, #0x5b0]
 462ee88: 3c8403e0     	stur	q0, [sp, #0x40]
 462ee8c: 9100a809     	add	x9, x0, #0x2a
 462ee90: eb00013f     	cmp	x9, x0
 462ee94: 540021c3     	b.lo	0x462f2cc <_ChromeMain+0x462a030>
 462ee98: b004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462ee9c: 912bd108     	add	x8, x8, #0xaf4
 462eea0: eb08013f     	cmp	x9, x8
 462eea4: fa488002     	ccmp	x0, x8, #0x2, hi
 462eea8: 54002129     	b.ls	0x462f2cc <_ChromeMain+0x462a030>
 462eeac: ad400500     	ldp	q0, q1, [x8]
 462eeb0: ad000400     	stp	q0, q1, [x0]
 462eeb4: 3cc1a100     	ldur	q0, [x8, #0x1a]
 462eeb8: 3c81a000     	stur	q0, [x0, #0x1a]
 462eebc: 7900541f     	strh	wzr, [x0, #0x2a]
 462eec0: 9100e3e2     	add	x2, sp, #0x38
 462eec4: aa1603e0     	mov	x0, x22
 462eec8: 5280fa81     	mov	w1, #0x7d4              ; =2004
 462eecc: 9745da0f     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462eed0: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 462eed4: 36f800a8     	tbz	w8, #0x1f, 0x462eee8 <_ChromeMain+0x4629c4c>
 462eed8: f9401fe0     	ldr	x0, [sp, #0x38]
 462eedc: f94027e8     	ldr	x8, [sp, #0x48]
 462eee0: d37ff901     	lsl	x1, x8, #1
 462eee4: 96e767f5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462eee8: 52800400     	mov	w0, #0x20               ; =32
 462eeec: 96e7811f     	bl	0xf368 <_ChromeMain+0xa0cc>
 462eef0: f9001fe0     	str	x0, [sp, #0x38]
 462eef4: b004c888     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 462eef8: 3dc04100     	ldr	q0, [x8, #0x100]
 462eefc: 3c8403e0     	stur	q0, [sp, #0x40]
 462ef00: 91007809     	add	x9, x0, #0x1e
 462ef04: eb00013f     	cmp	x9, x0
 462ef08: 54001e23     	b.lo	0x462f2cc <_ChromeMain+0x462a030>
 462ef0c: b004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462ef10: 912c8108     	add	x8, x8, #0xb20
 462ef14: eb08013f     	cmp	x9, x8
 462ef18: fa488002     	ccmp	x0, x8, #0x2, hi
 462ef1c: 54001d89     	b.ls	0x462f2cc <_ChromeMain+0x462a030>
 462ef20: 3dc00100     	ldr	q0, [x8]
 462ef24: 3d800000     	str	q0, [x0]
 462ef28: 3cc0e100     	ldur	q0, [x8, #0xe]
 462ef2c: 3c80e000     	stur	q0, [x0, #0xe]
 462ef30: 79003c1f     	strh	wzr, [x0, #0x1e]
 462ef34: 9100e3e2     	add	x2, sp, #0x38
 462ef38: aa1603e0     	mov	x0, x22
 462ef3c: 5280faa1     	mov	w1, #0x7d5              ; =2005
 462ef40: 9745d9f2     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462ef44: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 462ef48: 36f800a8     	tbz	w8, #0x1f, 0x462ef5c <_ChromeMain+0x4629cc0>
 462ef4c: f9401fe0     	ldr	x0, [sp, #0x38]
 462ef50: f94027e8     	ldr	x8, [sp, #0x48]
 462ef54: d37ff901     	lsl	x1, x8, #1
 462ef58: 96e767d8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462ef5c: aa1603e0     	mov	x0, x22
 462ef60: 52800001     	mov	w1, #0x0                ; =0
 462ef64: 979e1d94     	bl	0x2db65b4 <_ChromeMain+0x2db1318>
 462ef68: 52800600     	mov	w0, #0x30               ; =48
 462ef6c: 96e780ff     	bl	0xf368 <_ChromeMain+0xa0cc>
 462ef70: f9001fe0     	str	x0, [sp, #0x38]
 462ef74: d004c888     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 462ef78: 3dc00d00     	ldr	q0, [x8, #0x30]
 462ef7c: 3c8403e0     	stur	q0, [sp, #0x40]
 462ef80: 91008809     	add	x9, x0, #0x22
 462ef84: eb00013f     	cmp	x9, x0
 462ef88: 54001a23     	b.lo	0x462f2cc <_ChromeMain+0x462a030>
 462ef8c: b004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462ef90: 912d0108     	add	x8, x8, #0xb40
 462ef94: eb08013f     	cmp	x9, x8
 462ef98: fa488002     	ccmp	x0, x8, #0x2, hi
 462ef9c: 54001989     	b.ls	0x462f2cc <_ChromeMain+0x462a030>
 462efa0: 52800c49     	mov	w9, #0x62               ; =98
 462efa4: b9002009     	str	w9, [x0, #0x20]
 462efa8: ad400500     	ldp	q0, q1, [x8]
 462efac: ad000400     	stp	q0, q1, [x0]
 462efb0: 9100e3e2     	add	x2, sp, #0x38
 462efb4: aa1603e0     	mov	x0, x22
 462efb8: 5280fac1     	mov	w1, #0x7d6              ; =2006
 462efbc: 9745d9d3     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462efc0: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 462efc4: 36f800a8     	tbz	w8, #0x1f, 0x462efd8 <_ChromeMain+0x4629d3c>
 462efc8: f9401fe0     	ldr	x0, [sp, #0x38]
 462efcc: f94027e8     	ldr	x8, [sp, #0x48]
 462efd0: d37ff901     	lsl	x1, x8, #1
 462efd4: 96e767b9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462efd8: f949be60     	ldr	x0, [x19, #0x1378]
 462efdc: f909be76     	str	x22, [x19, #0x1378]
 462efe0: b40000a0     	cbz	x0, 0x462eff4 <_ChromeMain+0x4629d58>
 462efe4: f9400008     	ldr	x8, [x0]
 462efe8: f9400508     	ldr	x8, [x8, #0x8]
 462efec: d63f0100     	blr	x8
 462eff0: f949be76     	ldr	x22, [x19, #0x1378]
 462eff4: 52800300     	mov	w0, #0x18               ; =24
 462eff8: 96e780dc     	bl	0xf368 <_ChromeMain+0xa0cc>
 462effc: aa0003f7     	mov	x23, x0
 462f000: 52800500     	mov	w0, #0x28               ; =40
 462f004: 96e780d9     	bl	0xf368 <_ChromeMain+0xa0cc>
 462f008: aa0003e2     	mov	x2, x0
 462f00c: 52800028     	mov	w8, #0x1                ; =1
 462f010: b9000008     	str	w8, [x0]
 462f014: f0fdcf08     	adrp	x8, 0x12000 <_ChromeMain+0xcd64>
 462f018: 91370108     	add	x8, x8, #0xdc0
 462f01c: 90fe4f89     	adrp	x9, 0x101f000 <_ChromeMain+0x1019d64>
 462f020: 91180129     	add	x9, x9, #0x600
 462f024: a900a408     	stp	x8, x9, [x0, #0x8]
 462f028: d0fef968     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 462f02c: 912c0108     	add	x8, x8, #0xb00
 462f030: f9000c08     	str	x8, [x0, #0x18]
 462f034: 52800128     	mov	w8, #0x9                ; =9
 462f038: b90002e8     	str	w8, [x23]
 462f03c: aa1603e0     	mov	x0, x22
 462f040: 52800121     	mov	w1, #0x9                ; =9
 462f044: 97ad852f     	bl	0x3190500 <_ChromeMain+0x318b264>
 462f048: aa0003f6     	mov	x22, x0
 462f04c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 462f050: f9404749     	ldr	x9, [x26, #0x88]
 462f054: eb09011f     	cmp	x8, x9
 462f058: 54000061     	b.ne	0x462f064 <_ChromeMain+0x4629dc8>
 462f05c: aa1603e0     	mov	x0, x22
 462f060: 96e794a7     	bl	0x142fc <_ChromeMain+0xf060>
 462f064: a900fef6     	stp	x22, xzr, [x23, #0x8]
 462f068: f949c260     	ldr	x0, [x19, #0x1380]
 462f06c: f909c277     	str	x23, [x19, #0x1380]
 462f070: b4000080     	cbz	x0, 0x462f080 <_ChromeMain+0x4629de4>
 462f074: 978a2faa     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 462f078: 52800301     	mov	w1, #0x18               ; =24
 462f07c: 96e7678f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f080: 2d5106a0     	ldp	s0, s1, [x21, #0x88]
 462f084: 1e254000     	frintm	s0, s0
 462f088: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 462f08c: 1e222000     	fcmp	s0, s2
 462f090: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 462f094: 1a88b3e9     	csel	w9, wzr, w8, lt
 462f098: 1e226803     	fmaxnm	s3, s0, s2
 462f09c: 1e38006a     	fcvtzs	w10, s3
 462f0a0: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 462f0a4: 1e270163     	fmov	s3, w11
 462f0a8: 1e232000     	fcmp	s0, s3
 462f0ac: 1a899149     	csel	w9, w10, w9, ls
 462f0b0: 1e254020     	frintm	s0, s1
 462f0b4: 1e222000     	fcmp	s0, s2
 462f0b8: 1a88b3e8     	csel	w8, wzr, w8, lt
 462f0bc: 1e226801     	fmaxnm	s1, s0, s2
 462f0c0: 1e38002a     	fcvtzs	w10, s1
 462f0c4: 1e232000     	fcmp	s0, s3
 462f0c8: 1a889148     	csel	w8, w10, w8, ls
 462f0cc: aa088128     	orr	x8, x9, x8, lsl #32
 462f0d0: f81a83a8     	stur	x8, [x29, #-0x58]
 462f0d4: d10163a1     	sub	x1, x29, #0x58
 462f0d8: aa1403e0     	mov	x0, x20
 462f0dc: 9773d236     	bl	0x23239b4 <_ChromeMain+0x231e718>
 462f0e0: f949c274     	ldr	x20, [x19, #0x1380]
 462f0e4: f9400268     	ldr	x8, [x19]
 462f0e8: f9403108     	ldr	x8, [x8, #0x60]
 462f0ec: eb1b011f     	cmp	x8, x27
 462f0f0: 54000b21     	b.ne	0x462f254 <_ChromeMain+0x4629fb8>
 462f0f4: f940c275     	ldr	x21, [x19, #0x180]
 462f0f8: f85a83a8     	ldur	x8, [x29, #-0x58]
 462f0fc: a939ffa8     	stp	x8, xzr, [x29, #-0x68]
 462f100: 52800100     	mov	w0, #0x8                ; =8
 462f104: 96e78099     	bl	0xf368 <_ChromeMain+0xa0cc>
 462f108: f900001f     	str	xzr, [x0]
 462f10c: f9003be0     	str	x0, [sp, #0x70]
 462f110: 390173ff     	strb	wzr, [sp, #0x5c]
 462f114: 3901b3ff     	strb	wzr, [sp, #0x6c]
 462f118: 3900e3ff     	strb	wzr, [sp, #0x38]
 462f11c: 390143ff     	strb	wzr, [sp, #0x50]
 462f120: 9100e3e8     	add	x8, sp, #0x38
 462f124: f90003e8     	str	x8, [sp]
 462f128: d101a3a3     	sub	x3, x29, #0x68
 462f12c: 9101c3e6     	add	x6, sp, #0x70
 462f130: 910173e7     	add	x7, sp, #0x5c
 462f134: aa1403e0     	mov	x0, x20
 462f138: aa1503e1     	mov	x1, x21
 462f13c: d2800002     	mov	x2, #0x0                ; =0
 462f140: 52800004     	mov	w4, #0x0                ; =0
 462f144: 52800025     	mov	w5, #0x1                ; =1
 462f148: 9581ad34     	bl	0xa69a618 <_ChromeMain+0xa69537c>
 462f14c: 394143e8     	ldrb	w8, [sp, #0x50]
 462f150: 340000e8     	cbz	w8, 0x462f16c <_ChromeMain+0x4629ed0>
 462f154: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 462f158: 36f800a8     	tbz	w8, #0x1f, 0x462f16c <_ChromeMain+0x4629ed0>
 462f15c: f9401fe0     	ldr	x0, [sp, #0x38]
 462f160: f94027e8     	ldr	x8, [sp, #0x48]
 462f164: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462f168: 96e76754     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f16c: f9403bf4     	ldr	x20, [sp, #0x70]
 462f170: f9003bff     	str	xzr, [sp, #0x70]
 462f174: b40000d4     	cbz	x20, 0x462f18c <_ChromeMain+0x4629ef0>
 462f178: aa1403e0     	mov	x0, x20
 462f17c: 9500f3e7     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 462f180: aa1403e0     	mov	x0, x20
 462f184: 52800101     	mov	w1, #0x8                ; =8
 462f188: 96e7674c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f18c: f949c268     	ldr	x8, [x19, #0x1380]
 462f190: b40004a8     	cbz	x8, 0x462f224 <_ChromeMain+0x4629f88>
 462f194: f9400500     	ldr	x0, [x8, #0x8]
 462f198: f9400008     	ldr	x8, [x0]
 462f19c: f9400108     	ldr	x8, [x8]
 462f1a0: d63f0100     	blr	x8
 462f1a4: 37000400     	tbnz	w0, #0x0, 0x462f224 <_ChromeMain+0x4629f88>
 462f1a8: f949d674     	ldr	x20, [x19, #0x13a8]
 462f1ac: b40003d4     	cbz	x20, 0x462f224 <_ChromeMain+0x4629f88>
 462f1b0: f9400680     	ldr	x0, [x20, #0x8]
 462f1b4: b40000c0     	cbz	x0, 0x462f1cc <_ChromeMain+0x4629f30>
 462f1b8: 3944bc08     	ldrb	w8, [x0, #0x12f]
 462f1bc: f9409009     	ldr	x9, [x0, #0x120]
 462f1c0: 7219011f     	tst	w8, #0x80
 462f1c4: 9a881128     	csel	x8, x9, x8, ne
 462f1c8: b4000568     	cbz	x8, 0x462f274 <_ChromeMain+0x4629fd8>
 462f1cc: f909d67f     	str	xzr, [x19, #0x13a8]
 462f1d0: b004e928     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 462f1d4: 9127e108     	add	x8, x8, #0x9f8
 462f1d8: f9000288     	str	x8, [x20]
 462f1dc: 91008280     	add	x0, x20, #0x20
 462f1e0: 973c882a     	bl	0x1551288 <_ChromeMain+0x154bfec>
 462f1e4: f9400a80     	ldr	x0, [x20, #0x10]
 462f1e8: b5000540     	cbnz	x0, 0x462f290 <_ChromeMain+0x4629ff4>
 462f1ec: f9400680     	ldr	x0, [x20, #0x8]
 462f1f0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 462f1f4: f9404749     	ldr	x9, [x26, #0x88]
 462f1f8: eb09011f     	cmp	x8, x9
 462f1fc: 54000041     	b.ne	0x462f204 <_ChromeMain+0x4629f68>
 462f200: 96e7ce0f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462f204: aa1403e0     	mov	x0, x20
 462f208: 52800601     	mov	w1, #0x30               ; =48
 462f20c: 96e7672b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f210: 528278e8     	mov	w8, #0x13c7             ; =5063
 462f214: 38e86a69     	ldrsb	w9, [x19, x8]
 462f218: 37f80169     	tbnz	w9, #0x1f, 0x462f244 <_ChromeMain+0x4629fa8>
 462f21c: 7927627f     	strh	wzr, [x19, #0x13b0]
 462f220: 38286a7f     	strb	wzr, [x19, x8]
 462f224: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 462f228: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 462f22c: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 462f230: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 462f234: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 462f238: a9496ffc     	ldp	x28, x27, [sp, #0x90]
 462f23c: 9103c3ff     	add	sp, sp, #0xf0
 462f240: d65f03c0     	ret
 462f244: f949da68     	ldr	x8, [x19, #0x13b0]
 462f248: 7900011f     	strh	wzr, [x8]
 462f24c: f909de7f     	str	xzr, [x19, #0x13b8]
 462f250: 17fffff5     	b	0x462f224 <_ChromeMain+0x4629f88>
 462f254: b0fe0009     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 462f258: 9120c129     	add	x9, x9, #0x830
 462f25c: eb09011f     	cmp	x8, x9
 462f260: 54fff4a0     	b.eq	0x462f0f4 <_ChromeMain+0x4629e58>
 462f264: aa1303e0     	mov	x0, x19
 462f268: d63f0100     	blr	x8
 462f26c: aa0003f5     	mov	x21, x0
 462f270: 17ffffa2     	b	0x462f0f8 <_ChromeMain+0x4629e5c>
 462f274: 52827608     	mov	w8, #0x13b0             ; =5040
 462f278: 8b080261     	add	x1, x19, x8
 462f27c: 97085db2     	bl	0x846944 <_ChromeMain+0x8416a8>
 462f280: f949d674     	ldr	x20, [x19, #0x13a8]
 462f284: f909d67f     	str	xzr, [x19, #0x13a8]
 462f288: b5fffa54     	cbnz	x20, 0x462f1d0 <_ChromeMain+0x4629f34>
 462f28c: 17ffffe1     	b	0x462f210 <_ChromeMain+0x4629f74>
 462f290: 12800008     	mov	w8, #-0x1               ; =-1
 462f294: b8e80008     	ldaddal	w8, w8, [x0]
 462f298: 7100051f     	cmp	w8, #0x1
 462f29c: 54fffa81     	b.ne	0x462f1ec <_ChromeMain+0x4629f50>
 462f2a0: f9400808     	ldr	x8, [x0, #0x10]
 462f2a4: d63f0100     	blr	x8
 462f2a8: 17ffffd1     	b	0x462f1ec <_ChromeMain+0x4629f50>
 462f2ac: b0fe0009     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 462f2b0: 9120c129     	add	x9, x9, #0x830
 462f2b4: eb09011f     	cmp	x8, x9
 462f2b8: 54ffbec0     	b.eq	0x462ea90 <_ChromeMain+0x46297f4>
 462f2bc: aa1303e0     	mov	x0, x19
 462f2c0: d63f0100     	blr	x8
 462f2c4: b5ffbea0     	cbnz	x0, 0x462ea98 <_ChromeMain+0x46297fc>
 462f2c8: 17ffffd7     	b	0x462f224 <_ChromeMain+0x4629f88>
 462f2cc: d4200020     	brk	#0x1
 462f2d0: aa1b03fa     	mov	x26, x27
 462f2d4: b0fe01fb     	adrp	x27, 0x66c000 <_ChromeMain+0x666d64>
 462f2d8: 9139437b     	add	x27, x27, #0xe50
 462f2dc: 39013ffc     	strb	w28, [sp, #0x4f]
 462f2e0: 9100e3f9     	add	x25, sp, #0x38
 462f2e4: 17fffe37     	b	0x462ebc0 <_ChromeMain+0x4629924>
 462f2e8: 941bd3b0     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 462f2ec: d4200000     	brk	#0
 462f2f0: d4400000     	hlt	#0
 462f2f4: d4200020     	brk	#0x1
 462f2f8: d10143ff     	sub	sp, sp, #0x50
 462f2fc: a9034ff4     	stp	x20, x19, [sp, #0x30]
 462f300: a9047bfd     	stp	x29, x30, [sp, #0x40]
 462f304: 910103fd     	add	x29, sp, #0x40
 462f308: f9422c08     	ldr	x8, [x0, #0x458]
 462f30c: b40003e8     	cbz	x8, 0x462f388 <_ChromeMain+0x462a0ec>
 462f310: aa0003f3     	mov	x19, x0
 462f314: f9429d08     	ldr	x8, [x8, #0x538]
 462f318: f9403500     	ldr	x0, [x8, #0x68]
 462f31c: b4000360     	cbz	x0, 0x462f388 <_ChromeMain+0x462a0ec>
 462f320: aa0103f4     	mov	x20, x1
 462f324: f9400008     	ldr	x8, [x0]
 462f328: f940a508     	ldr	x8, [x8, #0x148]
 462f32c: d63f0100     	blr	x8
 462f330: f9400008     	ldr	x8, [x0]
 462f334: f940b508     	ldr	x8, [x8, #0x168]
 462f338: d63f0100     	blr	x8
 462f33c: 390023f4     	strb	w20, [sp, #0x8]
 462f340: 52800028     	mov	w8, #0x1                ; =1
 462f344: 390083e8     	strb	w8, [sp, #0x20]
 462f348: f00445c1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 462f34c: 91187021     	add	x1, x1, #0x61c
 462f350: 910023e3     	add	x3, sp, #0x8
 462f354: 52800542     	mov	w2, #0x2a               ; =42
 462f358: 973b6954     	bl	0x15098a8 <_ChromeMain+0x150460c>
 462f35c: 394083e8     	ldrb	w8, [sp, #0x20]
 462f360: 7103fd1f     	cmp	w8, #0xff
 462f364: 54000060     	b.eq	0x462f370 <_ChromeMain+0x462a0d4>
 462f368: 721e791f     	tst	w8, #0xfffffffd
 462f36c: 54000241     	b.ne	0x462f3b4 <_ChromeMain+0x462a118>
 462f370: aa1303e0     	mov	x0, x19
 462f374: 52800001     	mov	w1, #0x0                ; =0
 462f378: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 462f37c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 462f380: 910143ff     	add	sp, sp, #0x50
 462f384: 1700043c     	b	0x630474 <_ChromeMain+0x62b1d8>
 462f388: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 462f38c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 462f390: 910143ff     	add	sp, sp, #0x50
 462f394: d65f03c0     	ret
 462f398: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 462f39c: 36fffea8     	tbz	w8, #0x1f, 0x462f370 <_ChromeMain+0x462a0d4>
 462f3a0: f94007e0     	ldr	x0, [sp, #0x8]
 462f3a4: f9400fe8     	ldr	x8, [sp, #0x18]
 462f3a8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462f3ac: 96e766c3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f3b0: 17fffff0     	b	0x462f370 <_ChromeMain+0x462a0d4>
 462f3b4: 7100111f     	cmp	w8, #0x4
 462f3b8: 54ffff00     	b.eq	0x462f398 <_ChromeMain+0x462a0fc>
 462f3bc: d0051489     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 462f3c0: 9121e129     	add	x9, x9, #0x878
 462f3c4: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 462f3c8: d10047a0     	sub	x0, x29, #0x11
 462f3cc: 910023e1     	add	x1, sp, #0x8
 462f3d0: d63f0100     	blr	x8
 462f3d4: 17ffffe7     	b	0x462f370 <_ChromeMain+0x462a0d4>
 462f3d8: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 462f3dc: a90167fa     	stp	x26, x25, [sp, #0x10]
 462f3e0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 462f3e4: a90357f6     	stp	x22, x21, [sp, #0x30]
 462f3e8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 462f3ec: a9057bfd     	stp	x29, x30, [sp, #0x50]
 462f3f0: 910143fd     	add	x29, sp, #0x50
 462f3f4: d10f03ff     	sub	sp, sp, #0x3c0
 462f3f8: f9423408     	ldr	x8, [x0, #0x468]
 462f3fc: b4000ae8     	cbz	x8, 0x462f558 <_ChromeMain+0x462a2bc>
 462f400: aa0003f3     	mov	x19, x0
 462f404: f9003bff     	str	xzr, [sp, #0x70]
 462f408: 6f00e400     	movi.2d	v0, #0000000000000000
 462f40c: ad0283e0     	stp	q0, q0, [sp, #0x50]
 462f410: ad0183e0     	stp	q0, q0, [sp, #0x30]
 462f414: ad0083e0     	stp	q0, q0, [sp, #0x10]
 462f418: 3d8003e0     	str	q0, [sp]
 462f41c: f9422c08     	ldr	x8, [x0, #0x458]
 462f420: b40003a8     	cbz	x8, 0x462f494 <_ChromeMain+0x462a1f8>
 462f424: f9429d08     	ldr	x8, [x8, #0x538]
 462f428: f9403514     	ldr	x20, [x8, #0x68]
 462f42c: b4000374     	cbz	x20, 0x462f498 <_ChromeMain+0x462a1fc>
 462f430: 39412288     	ldrb	w8, [x20, #0x48]
 462f434: 37000328     	tbnz	w8, #0x0, 0x462f498 <_ChromeMain+0x462a1fc>
 462f438: f9400288     	ldr	x8, [x20]
 462f43c: f940b508     	ldr	x8, [x8, #0x168]
 462f440: aa1403e0     	mov	x0, x20
 462f444: d63f0100     	blr	x8
 462f448: b4000280     	cbz	x0, 0x462f498 <_ChromeMain+0x462a1fc>
 462f44c: aa0003f5     	mov	x21, x0
 462f450: b0044561     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 462f454: 91018021     	add	x1, x1, #0x60
 462f458: 52800202     	mov	w2, #0x10               ; =16
 462f45c: 96fa35fc     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 462f460: b40001c0     	cbz	x0, 0x462f498 <_ChromeMain+0x462a1fc>
 462f464: b0044561     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 462f468: 91018021     	add	x1, x1, #0x60
 462f46c: aa1503e0     	mov	x0, x21
 462f470: 52800202     	mov	w2, #0x10               ; =16
 462f474: 96f23d6d     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 462f478: 3100041f     	cmn	w0, #0x1
 462f47c: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 462f480: 9a9fc109     	csel	x9, x8, xzr, gt
 462f484: 37f800a0     	tbnz	w0, #0x1f, 0x462f498 <_ChromeMain+0x462a1fc>
 462f488: 0aa07c0a     	bic	w10, w0, w0, asr #31
 462f48c: aa0a0120     	orr	x0, x9, x10
 462f490: 14000005     	b	0x462f4a4 <_ChromeMain+0x462a208>
 462f494: d2800014     	mov	x20, #0x0               ; =0
 462f498: aa1403e0     	mov	x0, x20
 462f49c: 97eb5049     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 462f4a0: 92600008     	and	x8, x0, #0x100000000
 462f4a4: 2a0003e9     	mov	w9, w0
 462f4a8: aa090108     	orr	x8, x8, x9
 462f4ac: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 462f4b0: eb09011f     	cmp	x8, x9
 462f4b4: 9a898102     	csel	x2, x8, x9, hi
 462f4b8: d00485a0     	adrp	x0, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 462f4bc: 9105b800     	add	x0, x0, #0x16e
 462f4c0: d00485a3     	adrp	x3, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 462f4c4: 91060c63     	add	x3, x3, #0x183
 462f4c8: 910003e8     	mov	x8, sp
 462f4cc: 52800121     	mov	w1, #0x9                ; =9
 462f4d0: 528004c4     	mov	w4, #0x26               ; =38
 462f4d4: 97fcd70b     	bl	0x4565100 <_ChromeMain+0x455fe64>
 462f4d8: f9423668     	ldr	x8, [x19, #0x468]
 462f4dc: b40001a8     	cbz	x8, 0x462f510 <_ChromeMain+0x462a274>
 462f4e0: 394063e9     	ldrb	w9, [sp, #0x18]
 462f4e4: 36000169     	tbz	w9, #0x0, 0x462f510 <_ChromeMain+0x462a274>
 462f4e8: f9400100     	ldr	x0, [x8]
 462f4ec: f9400c08     	ldr	x8, [x0, #0x18]
 462f4f0: 7100051f     	cmp	w8, #0x1
 462f4f4: 540000eb     	b.lt	0x462f510 <_ChromeMain+0x462a274>
 462f4f8: d2800014     	mov	x20, #0x0               ; =0
 462f4fc: 910403f6     	add	x22, sp, #0x100
 462f500: 910003f7     	mov	x23, sp
 462f504: d0ffd0b8     	adrp	x24, 0x4045000 <_ChromeMain+0x403fd64>
 462f508: 913c8318     	add	x24, x24, #0xf20
 462f50c: 1400009f     	b	0x462f788 <_ChromeMain+0x462a4ec>
 462f510: f9422e68     	ldr	x8, [x19, #0x458]
 462f514: b40000a8     	cbz	x8, 0x462f528 <_ChromeMain+0x462a28c>
 462f518: f9429d14     	ldr	x20, [x8, #0x538]
 462f51c: b4000074     	cbz	x20, 0x462f528 <_ChromeMain+0x462a28c>
 462f520: 39624268     	ldrb	w8, [x19, #0x890]
 462f524: 35002068     	cbnz	w8, 0x462f930 <_ChromeMain+0x462a694>
 462f528: 910003f3     	mov	x19, sp
 462f52c: 9101c260     	add	x0, x19, #0x70
 462f530: d2800001     	mov	x1, #0x0                ; =0
 462f534: 96e7e1e1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 462f538: 91008260     	add	x0, x19, #0x20
 462f53c: 96e7e1cf     	bl	0x27c78 <_ChromeMain+0x229dc>
 462f540: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 462f544: 36f800a8     	tbz	w8, #0x1f, 0x462f558 <_ChromeMain+0x462a2bc>
 462f548: f94003e0     	ldr	x0, [sp]
 462f54c: f9400be8     	ldr	x8, [sp, #0x10]
 462f550: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462f554: 96e76659     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f558: 910f03ff     	add	sp, sp, #0x3c0
 462f55c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 462f560: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 462f564: a94357f6     	ldp	x22, x21, [sp, #0x30]
 462f568: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 462f56c: a94167fa     	ldp	x26, x25, [sp, #0x10]
 462f570: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 462f574: d65f03c0     	ret
 462f578: 3100051f     	cmn	w8, #0x1
 462f57c: 54002d80     	b.eq	0x462fb2c <_ChromeMain+0x462a890>
 462f580: 14000015     	b	0x462f5d4 <_ChromeMain+0x462a338>
 462f584: b942bb28     	ldr	w8, [x25, #0x2b8]
 462f588: 3100051f     	cmn	w8, #0x1
 462f58c: 54002701     	b.ne	0x462fa6c <_ChromeMain+0x462a7d0>
 462f590: 394d2348     	ldrb	w8, [x26, #0x348]
 462f594: 340002c8     	cbz	w8, 0x462f5ec <_ChromeMain+0x462a350>
 462f598: 1400011e     	b	0x462fa10 <_ChromeMain+0x462a774>
 462f59c: f94083e0     	ldr	x0, [sp, #0x100]
 462f5a0: f9408be8     	ldr	x8, [sp, #0x110]
 462f5a4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462f5a8: 96e76644     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f5ac: 37001af5     	tbnz	w21, #0x0, 0x462f908 <_ChromeMain+0x462a66c>
 462f5b0: f9414b3a     	ldr	x26, [x25, #0x290]
 462f5b4: b5fffe9a     	cbnz	x26, 0x462f584 <_ChromeMain+0x462a2e8>
 462f5b8: f9413328     	ldr	x8, [x25, #0x260]
 462f5bc: f9401d09     	ldr	x9, [x8, #0x38]
 462f5c0: b982b728     	ldrsw	x8, [x25, #0x2b4]
 462f5c4: eb18013f     	cmp	x9, x24
 462f5c8: 54fffd81     	b.ne	0x462f578 <_ChromeMain+0x462a2dc>
 462f5cc: 3100051f     	cmn	w8, #0x1
 462f5d0: 540027c0     	b.eq	0x462fac8 <_ChromeMain+0x462a82c>
 462f5d4: f9414329     	ldr	x9, [x25, #0x280]
 462f5d8: eb08013f     	cmp	x9, x8
 462f5dc: 54002529     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462f5e0: f9413f29     	ldr	x9, [x25, #0x278]
 462f5e4: f868793a     	ldr	x26, [x9, x8, lsl #3]
 462f5e8: b40005ba     	cbz	x26, 0x462f69c <_ChromeMain+0x462a400>
 462f5ec: f9400f48     	ldr	x8, [x26, #0x18]
 462f5f0: f9400509     	ldr	x9, [x8, #0x8]
 462f5f4: 9101813c     	add	x28, x9, #0x60
 462f5f8: 3941dd2a     	ldrb	w10, [x9, #0x77]
 462f5fc: 13001d48     	sxtb	w8, w10
 462f600: f9403529     	ldr	x9, [x9, #0x68]
 462f604: 7100011f     	cmp	w8, #0x0
 462f608: 9a8a4122     	csel	x2, x9, x10, mi
 462f60c: 39405fe9     	ldrb	w9, [sp, #0x17]
 462f610: 13001d3b     	sxtb	w27, w9
 462f614: f94007ea     	ldr	x10, [sp, #0x8]
 462f618: 7100037f     	cmp	w27, #0x0
 462f61c: 9a894155     	csel	x21, x10, x9, mi
 462f620: eb15005f     	cmp	x2, x21
 462f624: 54000121     	b.ne	0x462f648 <_ChromeMain+0x462a3ac>
 462f628: f9400389     	ldr	x9, [x28]
 462f62c: 7100011f     	cmp	w8, #0x0
 462f630: 9a9c4120     	csel	x0, x9, x28, mi
 462f634: f94003e8     	ldr	x8, [sp]
 462f638: 7100037f     	cmp	w27, #0x0
 462f63c: 9a974101     	csel	x1, x8, x23, mi
 462f640: 94e76888     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462f644: 34001620     	cbz	w0, 0x462f908 <_ChromeMain+0x462a66c>
 462f648: 3980ff48     	ldrsb	x8, [x26, #0x3f]
 462f64c: b7f822a8     	tbnz	x8, #0x3f, 0x462faa0 <_ChromeMain+0x462a804>
 462f650: 9100a349     	add	x9, x26, #0x28
 462f654: f100011f     	cmp	x8, #0x0
 462f658: 9a890388     	csel	x8, x28, x9, eq
 462f65c: 39405d0a     	ldrb	w10, [x8, #0x17]
 462f660: 13001d49     	sxtb	w9, w10
 462f664: f940050b     	ldr	x11, [x8, #0x8]
 462f668: 7100013f     	cmp	w9, #0x0
 462f66c: 9a8a416a     	csel	x10, x11, x10, mi
 462f670: eb15015f     	cmp	x10, x21
 462f674: 54000141     	b.ne	0x462f69c <_ChromeMain+0x462a400>
 462f678: f940010a     	ldr	x10, [x8]
 462f67c: 7100013f     	cmp	w9, #0x0
 462f680: 9a884140     	csel	x0, x10, x8, mi
 462f684: f94003e8     	ldr	x8, [sp]
 462f688: 7100037f     	cmp	w27, #0x0
 462f68c: 9a974101     	csel	x1, x8, x23, mi
 462f690: aa1503e2     	mov	x2, x21
 462f694: 94e76873     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462f698: 34001380     	cbz	w0, 0x462f908 <_ChromeMain+0x462a66c>
 462f69c: b982b728     	ldrsw	x8, [x25, #0x2b4]
 462f6a0: 3100051f     	cmn	w8, #0x1
 462f6a4: 54001f80     	b.eq	0x462fa94 <_ChromeMain+0x462a7f8>
 462f6a8: f9414329     	ldr	x9, [x25, #0x280]
 462f6ac: eb08013f     	cmp	x9, x8
 462f6b0: 54001e89     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462f6b4: f9413f29     	ldr	x9, [x25, #0x278]
 462f6b8: f868793a     	ldr	x26, [x9, x8, lsl #3]
 462f6bc: b40005ba     	cbz	x26, 0x462f770 <_ChromeMain+0x462a4d4>
 462f6c0: f9400f48     	ldr	x8, [x26, #0x18]
 462f6c4: f9400509     	ldr	x9, [x8, #0x8]
 462f6c8: 9101813b     	add	x27, x9, #0x60
 462f6cc: 3941dd2a     	ldrb	w10, [x9, #0x77]
 462f6d0: 13001d48     	sxtb	w8, w10
 462f6d4: f9403529     	ldr	x9, [x9, #0x68]
 462f6d8: 7100011f     	cmp	w8, #0x0
 462f6dc: 9a8a4122     	csel	x2, x9, x10, mi
 462f6e0: 39405fe9     	ldrb	w9, [sp, #0x17]
 462f6e4: 13001d39     	sxtb	w25, w9
 462f6e8: f94007ea     	ldr	x10, [sp, #0x8]
 462f6ec: 7100033f     	cmp	w25, #0x0
 462f6f0: 9a894155     	csel	x21, x10, x9, mi
 462f6f4: eb15005f     	cmp	x2, x21
 462f6f8: 54000121     	b.ne	0x462f71c <_ChromeMain+0x462a480>
 462f6fc: f9400369     	ldr	x9, [x27]
 462f700: 7100011f     	cmp	w8, #0x0
 462f704: 9a9b4120     	csel	x0, x9, x27, mi
 462f708: f94003e8     	ldr	x8, [sp]
 462f70c: 7100033f     	cmp	w25, #0x0
 462f710: 9a974101     	csel	x1, x8, x23, mi
 462f714: 94e76853     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462f718: 34000f80     	cbz	w0, 0x462f908 <_ChromeMain+0x462a66c>
 462f71c: 3980ff48     	ldrsb	x8, [x26, #0x3f]
 462f720: b7f81ca8     	tbnz	x8, #0x3f, 0x462fab4 <_ChromeMain+0x462a818>
 462f724: 9100a349     	add	x9, x26, #0x28
 462f728: f100011f     	cmp	x8, #0x0
 462f72c: 9a890368     	csel	x8, x27, x9, eq
 462f730: 39405d0a     	ldrb	w10, [x8, #0x17]
 462f734: 13001d49     	sxtb	w9, w10
 462f738: f940050b     	ldr	x11, [x8, #0x8]
 462f73c: 7100013f     	cmp	w9, #0x0
 462f740: 9a8a416a     	csel	x10, x11, x10, mi
 462f744: eb15015f     	cmp	x10, x21
 462f748: 54000141     	b.ne	0x462f770 <_ChromeMain+0x462a4d4>
 462f74c: f940010a     	ldr	x10, [x8]
 462f750: 7100013f     	cmp	w9, #0x0
 462f754: 9a884140     	csel	x0, x10, x8, mi
 462f758: f94003e8     	ldr	x8, [sp]
 462f75c: 7100033f     	cmp	w25, #0x0
 462f760: 9a974101     	csel	x1, x8, x23, mi
 462f764: aa1503e2     	mov	x2, x21
 462f768: 94e7683e     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462f76c: 34000ce0     	cbz	w0, 0x462f908 <_ChromeMain+0x462a66c>
 462f770: 91000694     	add	x20, x20, #0x1
 462f774: f9423668     	ldr	x8, [x19, #0x468]
 462f778: f9400100     	ldr	x0, [x8]
 462f77c: f9400c08     	ldr	x8, [x0, #0x18]
 462f780: eb28c29f     	cmp	x20, w8, sxtw
 462f784: 54ffec6a     	b.ge	0x462f510 <_ChromeMain+0x462a274>
 462f788: eb28c29f     	cmp	x20, w8, sxtw
 462f78c: 54ffff2a     	b.ge	0x462f770 <_ChromeMain+0x462a4d4>
 462f790: aa1403e1     	mov	x1, x20
 462f794: 9728bad9     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462f798: f9402019     	ldr	x25, [x0, #0x40]
 462f79c: b4fffeb9     	cbz	x25, 0x462f770 <_ChromeMain+0x462a4d4>
 462f7a0: f900bbff     	str	xzr, [sp, #0x170]
 462f7a4: 6f00e400     	movi.2d	v0, #0000000000000000
 462f7a8: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 462f7ac: ad0983e0     	stp	q0, q0, [sp, #0x130]
 462f7b0: ad0883e0     	stp	q0, q0, [sp, #0x110]
 462f7b4: 3d8043e0     	str	q0, [sp, #0x100]
 462f7b8: f9414b28     	ldr	x8, [x25, #0x290]
 462f7bc: b5000908     	cbnz	x8, 0x462f8dc <_ChromeMain+0x462a640>
 462f7c0: f9413328     	ldr	x8, [x25, #0x260]
 462f7c4: f9401d09     	ldr	x9, [x8, #0x38]
 462f7c8: b982b728     	ldrsw	x8, [x25, #0x2b4]
 462f7cc: eb18013f     	cmp	x9, x24
 462f7d0: 54000921     	b.ne	0x462f8f4 <_ChromeMain+0x462a658>
 462f7d4: 3100051f     	cmn	w8, #0x1
 462f7d8: 54001720     	b.eq	0x462fabc <_ChromeMain+0x462a820>
 462f7dc: f9414329     	ldr	x9, [x25, #0x280]
 462f7e0: eb08013f     	cmp	x9, x8
 462f7e4: 540014e9     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462f7e8: f9413f29     	ldr	x9, [x25, #0x278]
 462f7ec: f8687928     	ldr	x8, [x9, x8, lsl #3]
 462f7f0: b40015c8     	cbz	x8, 0x462faa8 <_ChromeMain+0x462a80c>
 462f7f4: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 462f7f8: b7f81469     	tbnz	x9, #0x3f, 0x462fa84 <_ChromeMain+0x462a7e8>
 462f7fc: b5001489     	cbnz	x9, 0x462fa8c <_ChromeMain+0x462a7f0>
 462f800: f9400d08     	ldr	x8, [x8, #0x18]
 462f804: f9400508     	ldr	x8, [x8, #0x8]
 462f808: 91018101     	add	x1, x8, #0x60
 462f80c: 910403e0     	add	x0, sp, #0x100
 462f810: 96ec29e1     	bl	0x139f94 <_ChromeMain+0x134cf8>
 462f814: 394463e8     	ldrb	w8, [sp, #0x118]
 462f818: 37000248     	tbnz	w8, #0x0, 0x462f860 <_ChromeMain+0x462a5c4>
 462f81c: b982b728     	ldrsw	x8, [x25, #0x2b4]
 462f820: 3100051f     	cmn	w8, #0x1
 462f824: 54001600     	b.eq	0x462fae4 <_ChromeMain+0x462a848>
 462f828: f9414329     	ldr	x9, [x25, #0x280]
 462f82c: eb08013f     	cmp	x9, x8
 462f830: 54001289     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462f834: f9413f29     	ldr	x9, [x25, #0x278]
 462f838: f8687928     	ldr	x8, [x9, x8, lsl #3]
 462f83c: b40015a8     	cbz	x8, 0x462faf0 <_ChromeMain+0x462a854>
 462f840: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 462f844: b7f81489     	tbnz	x9, #0x3f, 0x462fad4 <_ChromeMain+0x462a838>
 462f848: b50014a9     	cbnz	x9, 0x462fadc <_ChromeMain+0x462a840>
 462f84c: f9400d08     	ldr	x8, [x8, #0x18]
 462f850: f9400508     	ldr	x8, [x8, #0x8]
 462f854: 91018101     	add	x1, x8, #0x60
 462f858: 910403e0     	add	x0, sp, #0x100
 462f85c: 96fa702c     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 462f860: 39445fe9     	ldrb	w9, [sp, #0x117]
 462f864: 13001d28     	sxtb	w8, w9
 462f868: f94087ea     	ldr	x10, [sp, #0x108]
 462f86c: 7100011f     	cmp	w8, #0x0
 462f870: 9a894142     	csel	x2, x10, x9, mi
 462f874: 39405fea     	ldrb	w10, [sp, #0x17]
 462f878: 13001d49     	sxtb	w9, w10
 462f87c: f94007eb     	ldr	x11, [sp, #0x8]
 462f880: 7100013f     	cmp	w9, #0x0
 462f884: 9a8a416a     	csel	x10, x11, x10, mi
 462f888: eb0a005f     	cmp	x2, x10
 462f88c: 54000241     	b.ne	0x462f8d4 <_ChromeMain+0x462a638>
 462f890: f94083ea     	ldr	x10, [sp, #0x100]
 462f894: 7100011f     	cmp	w8, #0x0
 462f898: 9a964140     	csel	x0, x10, x22, mi
 462f89c: f94003e8     	ldr	x8, [sp]
 462f8a0: 7100013f     	cmp	w9, #0x0
 462f8a4: 9a974101     	csel	x1, x8, x23, mi
 462f8a8: 94e767ee     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462f8ac: 7100001f     	cmp	w0, #0x0
 462f8b0: 1a9f17f5     	cset	w21, eq
 462f8b4: 9101c2c0     	add	x0, x22, #0x70
 462f8b8: d2800001     	mov	x1, #0x0                ; =0
 462f8bc: 96e7e0ff     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 462f8c0: 910082c0     	add	x0, x22, #0x20
 462f8c4: 96e7e0ed     	bl	0x27c78 <_ChromeMain+0x229dc>
 462f8c8: 39c45fe8     	ldrsb	w8, [sp, #0x117]
 462f8cc: 36ffe708     	tbz	w8, #0x1f, 0x462f5ac <_ChromeMain+0x462a310>
 462f8d0: 17ffff33     	b	0x462f59c <_ChromeMain+0x462a300>
 462f8d4: 52800015     	mov	w21, #0x0               ; =0
 462f8d8: 17fffff7     	b	0x462f8b4 <_ChromeMain+0x462a618>
 462f8dc: b942bb29     	ldr	w9, [x25, #0x2b8]
 462f8e0: 3100053f     	cmn	w9, #0x1
 462f8e4: 54000ba1     	b.ne	0x462fa58 <_ChromeMain+0x462a7bc>
 462f8e8: 394d2109     	ldrb	w9, [x8, #0x348]
 462f8ec: 34fff849     	cbz	w9, 0x462f7f4 <_ChromeMain+0x462a558>
 462f8f0: 14000036     	b	0x462f9c8 <_ChromeMain+0x462a72c>
 462f8f4: 3100051f     	cmn	w8, #0x1
 462f8f8: 54fff721     	b.ne	0x462f7dc <_ChromeMain+0x462a540>
 462f8fc: d4200000     	brk	#0
 462f900: d4400000     	hlt	#0
 462f904: d4200020     	brk	#0x1
 462f908: f9423673     	ldr	x19, [x19, #0x468]
 462f90c: d0052c08     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 462f910: f9468d08     	ldr	x8, [x8, #0xd18]
 462f914: d63f0100     	blr	x8
 462f918: aa0003e3     	mov	x3, x0
 462f91c: aa1303e0     	mov	x0, x19
 462f920: aa1403e1     	mov	x1, x20
 462f924: 528000c2     	mov	w2, #0x6                ; =6
 462f928: 94dc8070     	bl	0x7d4fae8 <_ChromeMain+0x7d4a84c>
 462f92c: 17fffeff     	b	0x462f528 <_ChromeMain+0x462a28c>
 462f930: 910203f3     	add	x19, sp, #0x80
 462f934: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 462f938: b80973ff     	stur	wzr, [sp, #0x97]
 462f93c: f9004bff     	str	xzr, [sp, #0x90]
 462f940: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 462f944: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 462f948: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 462f94c: 7901c3ff     	strh	wzr, [sp, #0xe0]
 462f950: a90effff     	stp	xzr, xzr, [sp, #0xe8]
 462f954: 52800028     	mov	w8, #0x1                ; =1
 462f958: b900fbe8     	str	w8, [sp, #0xf8]
 462f95c: 910403e0     	add	x0, sp, #0x100
 462f960: 910003e1     	mov	x1, sp
 462f964: 910203e2     	add	x2, sp, #0x80
 462f968: 52800063     	mov	w3, #0x3                ; =3
 462f96c: 52800004     	mov	w4, #0x0                ; =0
 462f970: 52800005     	mov	w5, #0x0                ; =0
 462f974: 944e19d1     	bl	0x59b60b8 <_ChromeMain+0x59b0e1c>
 462f978: 9100a280     	add	x0, x20, #0x28
 462f97c: 97cf6c8d     	bl	0x3a0abb0 <_ChromeMain+0x3a05914>
 462f980: 910403e2     	add	x2, sp, #0x100
 462f984: d2800001     	mov	x1, #0x0                ; =0
 462f988: d2800003     	mov	x3, #0x0                ; =0
 462f98c: 97ecd607     	bl	0x41651a8 <_ChromeMain+0x415ff0c>
 462f990: 910403e0     	add	x0, sp, #0x100
 462f994: 977782c6     	bl	0x24104ac <_ChromeMain+0x240b210>
 462f998: 9101c260     	add	x0, x19, #0x70
 462f99c: d2800001     	mov	x1, #0x0                ; =0
 462f9a0: 96e7e0c6     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 462f9a4: 91008260     	add	x0, x19, #0x20
 462f9a8: 96e7e0b4     	bl	0x27c78 <_ChromeMain+0x229dc>
 462f9ac: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 462f9b0: 36ffdbc8     	tbz	w8, #0x1f, 0x462f528 <_ChromeMain+0x462a28c>
 462f9b4: f94043e0     	ldr	x0, [sp, #0x80]
 462f9b8: f9404be8     	ldr	x8, [sp, #0x90]
 462f9bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462f9c0: 96e7653e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462f9c4: 17fffed9     	b	0x462f528 <_ChromeMain+0x462a28c>
 462f9c8: 394ba329     	ldrb	w9, [x25, #0x2e8]
 462f9cc: 34ffefa9     	cbz	w9, 0x462f7c0 <_ChromeMain+0x462a524>
 462f9d0: b982b729     	ldrsw	x9, [x25, #0x2b4]
 462f9d4: 3100053f     	cmn	w9, #0x1
 462f9d8: 54000920     	b.eq	0x462fafc <_ChromeMain+0x462a860>
 462f9dc: f941432a     	ldr	x10, [x25, #0x280]
 462f9e0: eb09015f     	cmp	x10, x9
 462f9e4: 540004e9     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462f9e8: f9413f2a     	ldr	x10, [x25, #0x278]
 462f9ec: f8697949     	ldr	x9, [x10, x9, lsl #3]
 462f9f0: b9443129     	ldr	w9, [x9, #0x430]
 462f9f4: 7100093f     	cmp	w9, #0x2
 462f9f8: 54ffee40     	b.eq	0x462f7c0 <_ChromeMain+0x462a524>
 462f9fc: f9413729     	ldr	x9, [x25, #0x268]
 462fa00: b4000849     	cbz	x9, 0x462fb08 <_ChromeMain+0x462a86c>
 462fa04: 39458129     	ldrb	w9, [x9, #0x160]
 462fa08: 3707edc9     	tbnz	w9, #0x0, 0x462f7c0 <_ChromeMain+0x462a524>
 462fa0c: 17ffff7a     	b	0x462f7f4 <_ChromeMain+0x462a558>
 462fa10: 394ba328     	ldrb	w8, [x25, #0x2e8]
 462fa14: 34ffdd28     	cbz	w8, 0x462f5b8 <_ChromeMain+0x462a31c>
 462fa18: b982b728     	ldrsw	x8, [x25, #0x2b4]
 462fa1c: 3100051f     	cmn	w8, #0x1
 462fa20: 540007a0     	b.eq	0x462fb14 <_ChromeMain+0x462a878>
 462fa24: f9414329     	ldr	x9, [x25, #0x280]
 462fa28: eb08013f     	cmp	x9, x8
 462fa2c: 540002a9     	b.ls	0x462fa80 <_ChromeMain+0x462a7e4>
 462fa30: f9413f29     	ldr	x9, [x25, #0x278]
 462fa34: f8687928     	ldr	x8, [x9, x8, lsl #3]
 462fa38: b9443108     	ldr	w8, [x8, #0x430]
 462fa3c: 7100091f     	cmp	w8, #0x2
 462fa40: 54ffdbc0     	b.eq	0x462f5b8 <_ChromeMain+0x462a31c>
 462fa44: f9413728     	ldr	x8, [x25, #0x268]
 462fa48: b40006c8     	cbz	x8, 0x462fb20 <_ChromeMain+0x462a884>
 462fa4c: 39458108     	ldrb	w8, [x8, #0x160]
 462fa50: 3707db48     	tbnz	w8, #0x0, 0x462f5b8 <_ChromeMain+0x462a31c>
 462fa54: 17fffee6     	b	0x462f5ec <_ChromeMain+0x462a350>
 462fa58: 394ba329     	ldrb	w9, [x25, #0x2e8]
 462fa5c: 34ffeb29     	cbz	w9, 0x462f7c0 <_ChromeMain+0x462a524>
 462fa60: 394d2109     	ldrb	w9, [x8, #0x348]
 462fa64: 35ffeae9     	cbnz	w9, 0x462f7c0 <_ChromeMain+0x462a524>
 462fa68: 17ffff63     	b	0x462f7f4 <_ChromeMain+0x462a558>
 462fa6c: 394ba328     	ldrb	w8, [x25, #0x2e8]
 462fa70: 34ffda48     	cbz	w8, 0x462f5b8 <_ChromeMain+0x462a31c>
 462fa74: 394d2348     	ldrb	w8, [x26, #0x348]
 462fa78: 35ffda08     	cbnz	w8, 0x462f5b8 <_ChromeMain+0x462a31c>
 462fa7c: 17fffedc     	b	0x462f5ec <_ChromeMain+0x462a350>
 462fa80: d4200020     	brk	#0x1
 462fa84: f9401909     	ldr	x9, [x8, #0x30]
 462fa88: b4ffebc9     	cbz	x9, 0x462f800 <_ChromeMain+0x462a564>
 462fa8c: 9100a101     	add	x1, x8, #0x28
 462fa90: 17ffff5f     	b	0x462f80c <_ChromeMain+0x462a570>
 462fa94: d4200000     	brk	#0
 462fa98: d4400000     	hlt	#0
 462fa9c: d4200020     	brk	#0x1
 462faa0: f9401b48     	ldr	x8, [x26, #0x30]
 462faa4: 17fffeeb     	b	0x462f650 <_ChromeMain+0x462a3b4>
 462faa8: 97d0ebf4     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 462faac: aa0003e1     	mov	x1, x0
 462fab0: 17ffff57     	b	0x462f80c <_ChromeMain+0x462a570>
 462fab4: f9401b48     	ldr	x8, [x26, #0x30]
 462fab8: 17ffff1b     	b	0x462f724 <_ChromeMain+0x462a488>
 462fabc: d4200000     	brk	#0
 462fac0: d4400000     	hlt	#0
 462fac4: d4200020     	brk	#0x1
 462fac8: d4200000     	brk	#0
 462facc: d4400000     	hlt	#0
 462fad0: d4200020     	brk	#0x1
 462fad4: f9401909     	ldr	x9, [x8, #0x30]
 462fad8: b4ffeba9     	cbz	x9, 0x462f84c <_ChromeMain+0x462a5b0>
 462fadc: 9100a101     	add	x1, x8, #0x28
 462fae0: 17ffff5e     	b	0x462f858 <_ChromeMain+0x462a5bc>
 462fae4: d4200000     	brk	#0
 462fae8: d4400000     	hlt	#0
 462faec: d4200020     	brk	#0x1
 462faf0: 97d0ebe2     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 462faf4: aa0003e1     	mov	x1, x0
 462faf8: 17ffff58     	b	0x462f858 <_ChromeMain+0x462a5bc>
 462fafc: d4200000     	brk	#0
 462fb00: d4400000     	hlt	#0
 462fb04: d4200020     	brk	#0x1
 462fb08: d4200000     	brk	#0
 462fb0c: d4400000     	hlt	#0
 462fb10: d4200020     	brk	#0x1
 462fb14: d4200000     	brk	#0
 462fb18: d4400000     	hlt	#0
 462fb1c: d4200020     	brk	#0x1
 462fb20: d4200000     	brk	#0
 462fb24: d4400000     	hlt	#0
 462fb28: d4200020     	brk	#0x1
 462fb2c: d4200000     	brk	#0
 462fb30: d4400000     	hlt	#0
 462fb34: d4200020     	brk	#0x1
