
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4551750: f9406408     	ldr	x8, [x0, #0xc8]
 4551754: b4003528     	cbz	x8, 0x4551df8 <_ChromeMain+0x454cb5c>
 4551758: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 455175c: a90167fa     	stp	x26, x25, [sp, #0x10]
 4551760: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4551764: a90357f6     	stp	x22, x21, [sp, #0x30]
 4551768: a9044ff4     	stp	x20, x19, [sp, #0x40]
 455176c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4551770: 910143fd     	add	x29, sp, #0x50
 4551774: aa0003f3     	mov	x19, x0
 4551778: aa0103e0     	mov	x0, x1
 455177c: 976f84b7     	bl	0x2132a58 <_ChromeMain+0x212d7bc>
 4551780: 94eac7ee     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4551784: aa0003f4     	mov	x20, x0
 4551788: f9406668     	ldr	x8, [x19, #0xc8]
 455178c: f9429d09     	ldr	x9, [x8, #0x538]
 4551790: f0052c1b     	adrp	x27, 0xead4000 <dyld_stub_binder+0xead4000>
 4551794: 912b437b     	add	x27, x27, #0xad0
 4551798: b005331a     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 455179c: b4000649     	cbz	x9, 0x4551864 <_ChromeMain+0x454c5c8>
 45517a0: f940c528     	ldr	x8, [x9, #0x188]
 45517a4: b40002a8     	cbz	x8, 0x45517f8 <_ChromeMain+0x454c55c>
 45517a8: 91062129     	add	x9, x9, #0x188
 45517ac: 1400000d     	b	0x45517e0 <_ChromeMain+0x454c544>
 45517b0: eb09011f     	cmp	x8, x9
 45517b4: 54000220     	b.eq	0x45517f8 <_ChromeMain+0x454c55c>
 45517b8: f9401515     	ldr	x21, [x8, #0x28]
 45517bc: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45517c0: f9404749     	ldr	x9, [x26, #0x88]
 45517c4: eb09011f     	cmp	x8, x9
 45517c8: 540001a1     	b.ne	0x45517fc <_ChromeMain+0x454c560>
 45517cc: aa1503e0     	mov	x0, x21
 45517d0: 96eb0acb     	bl	0x142fc <_ChromeMain+0xf060>
 45517d4: 1400000a     	b	0x45517fc <_ChromeMain+0x454c560>
 45517d8: f9400108     	ldr	x8, [x8]
 45517dc: b40000e8     	cbz	x8, 0x45517f8 <_ChromeMain+0x454c55c>
 45517e0: f940110a     	ldr	x10, [x8, #0x20]
 45517e4: eb1b015f     	cmp	x10, x27
 45517e8: 54ffff88     	b.hi	0x45517d8 <_ChromeMain+0x454c53c>
 45517ec: 54fffe20     	b.eq	0x45517b0 <_ChromeMain+0x454c514>
 45517f0: f9400508     	ldr	x8, [x8, #0x8]
 45517f4: b5ffff68     	cbnz	x8, 0x45517e0 <_ChromeMain+0x454c544>
 45517f8: d2800015     	mov	x21, #0x0               ; =0
 45517fc: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551800: f9404749     	ldr	x9, [x26, #0x88]
 4551804: eb09011f     	cmp	x8, x9
 4551808: 54000061     	b.ne	0x4551814 <_ChromeMain+0x454c578>
 455180c: aa1503e0     	mov	x0, x21
 4551810: 96eb448b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4551814: 3940fea9     	ldrb	w9, [x21, #0x3f]
 4551818: 13001d28     	sxtb	w8, w9
 455181c: f9401aaa     	ldr	x10, [x21, #0x30]
 4551820: 7100011f     	cmp	w8, #0x0
 4551824: 9a894149     	csel	x9, x10, x9, mi
 4551828: f100453f     	cmp	x9, #0x11
 455182c: 540001c1     	b.ne	0x4551864 <_ChromeMain+0x454c5c8>
 4551830: f8428ea9     	ldr	x9, [x21, #0x28]!
 4551834: 7100011f     	cmp	w8, #0x0
 4551838: 9a954128     	csel	x8, x9, x21, mi
 455183c: b0044d89     	adrp	x9, 0xcf02000 <dyld_stub_binder+0xcf02000>
 4551840: 91249129     	add	x9, x9, #0x924
 4551844: a9402d0a     	ldp	x10, x11, [x8]
 4551848: a940352c     	ldp	x12, x13, [x9]
 455184c: 39404108     	ldrb	w8, [x8, #0x10]
 4551850: 39404129     	ldrb	w9, [x9, #0x10]
 4551854: eb0c015f     	cmp	x10, x12
 4551858: fa4d0160     	ccmp	x11, x13, #0x0, eq
 455185c: fa490100     	ccmp	x8, x9, #0x0, eq
 4551860: 540022e0     	b.eq	0x4551cbc <_ChromeMain+0x454ca20>
 4551864: aa1403e0     	mov	x0, x20
 4551868: 94eac7c0     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 455186c: b4000414     	cbz	x20, 0x45518ec <_ChromeMain+0x454c650>
 4551870: f0054da8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4551874: f9401900     	ldr	x0, [x8, #0x30]
 4551878: b0044c61     	adrp	x1, 0xcede000 <dyld_stub_binder+0xcede000>
 455187c: 912a5021     	add	x1, x1, #0xa94
 4551880: 96f28f3f     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 4551884: 35000060     	cbnz	w0, 0x4551890 <_ChromeMain+0x454c5f4>
 4551888: aa1403f5     	mov	x21, x20
 455188c: 1400000f     	b	0x45518c8 <_ChromeMain+0x454c62c>
 4551890: 90053ce8     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4551894: f944f100     	ldr	x0, [x8, #0x9e0]
 4551898: 9004d6c8     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 455189c: f9448908     	ldr	x8, [x8, #0x910]
 45518a0: f9400102     	ldr	x2, [x8]
 45518a4: 956f8173     	bl	0xa131e70 <_ChromeMain+0xa12cbd4>
 45518a8: 94eac7a4     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 45518ac: aa0003f6     	mov	x22, x0
 45518b0: aa1403e0     	mov	x0, x20
 45518b4: aa1603e2     	mov	x2, x22
 45518b8: 956f8171     	bl	0xa131e7c <_ChromeMain+0xa12cbe0>
 45518bc: aa1403f5     	mov	x21, x20
 45518c0: aa1603e0     	mov	x0, x22
 45518c4: 94eac7a6     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 45518c8: aa1503e0     	mov	x0, x21
 45518cc: 94eac7a4     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 45518d0: f9406668     	ldr	x8, [x19, #0xc8]
 45518d4: f9429d08     	ldr	x8, [x8, #0x538]
 45518d8: b4000a48     	cbz	x8, 0x4551a20 <_ChromeMain+0x454c784>
 45518dc: 91062116     	add	x22, x8, #0x188
 45518e0: f940c508     	ldr	x8, [x8, #0x188]
 45518e4: b40002c8     	cbz	x8, 0x455193c <_ChromeMain+0x454c6a0>
 45518e8: 1400000f     	b	0x4551924 <_ChromeMain+0x454c688>
 45518ec: d2800015     	mov	x21, #0x0               ; =0
 45518f0: 17fffff6     	b	0x45518c8 <_ChromeMain+0x454c62c>
 45518f4: eb16011f     	cmp	x8, x22
 45518f8: 54000220     	b.eq	0x455193c <_ChromeMain+0x454c6a0>
 45518fc: f9401515     	ldr	x21, [x8, #0x28]
 4551900: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551904: f9404749     	ldr	x9, [x26, #0x88]
 4551908: eb09011f     	cmp	x8, x9
 455190c: 540001a1     	b.ne	0x4551940 <_ChromeMain+0x454c6a4>
 4551910: aa1503e0     	mov	x0, x21
 4551914: 96eb0a7a     	bl	0x142fc <_ChromeMain+0xf060>
 4551918: 1400000a     	b	0x4551940 <_ChromeMain+0x454c6a4>
 455191c: f9400108     	ldr	x8, [x8]
 4551920: b40000e8     	cbz	x8, 0x455193c <_ChromeMain+0x454c6a0>
 4551924: f9401109     	ldr	x9, [x8, #0x20]
 4551928: eb1b013f     	cmp	x9, x27
 455192c: 54ffff88     	b.hi	0x455191c <_ChromeMain+0x454c680>
 4551930: 54fffe20     	b.eq	0x45518f4 <_ChromeMain+0x454c658>
 4551934: f9400508     	ldr	x8, [x8, #0x8]
 4551938: b5ffff68     	cbnz	x8, 0x4551924 <_ChromeMain+0x454c688>
 455193c: d2800015     	mov	x21, #0x0               ; =0
 4551940: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551944: f9404749     	ldr	x9, [x26, #0x88]
 4551948: eb09011f     	cmp	x8, x9
 455194c: 54000061     	b.ne	0x4551958 <_ChromeMain+0x454c6bc>
 4551950: aa1503e0     	mov	x0, x21
 4551954: 96eb443a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4551958: 39c0fea8     	ldrsb	w8, [x21, #0x3f]
 455195c: 37f808e8     	tbnz	w8, #0x1f, 0x4551a78 <_ChromeMain+0x454c7dc>
 4551960: f94002c8     	ldr	x8, [x22]
 4551964: b4000288     	cbz	x8, 0x45519b4 <_ChromeMain+0x454c718>
 4551968: 1400000d     	b	0x455199c <_ChromeMain+0x454c700>
 455196c: eb16011f     	cmp	x8, x22
 4551970: 54000220     	b.eq	0x45519b4 <_ChromeMain+0x454c718>
 4551974: f9401515     	ldr	x21, [x8, #0x28]
 4551978: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 455197c: f9404749     	ldr	x9, [x26, #0x88]
 4551980: eb09011f     	cmp	x8, x9
 4551984: 540001a1     	b.ne	0x45519b8 <_ChromeMain+0x454c71c>
 4551988: aa1503e0     	mov	x0, x21
 455198c: 96eb0a5c     	bl	0x142fc <_ChromeMain+0xf060>
 4551990: 1400000a     	b	0x45519b8 <_ChromeMain+0x454c71c>
 4551994: f9400108     	ldr	x8, [x8]
 4551998: b40000e8     	cbz	x8, 0x45519b4 <_ChromeMain+0x454c718>
 455199c: f9401109     	ldr	x9, [x8, #0x20]
 45519a0: eb1b013f     	cmp	x9, x27
 45519a4: 54ffff88     	b.hi	0x4551994 <_ChromeMain+0x454c6f8>
 45519a8: 54fffe20     	b.eq	0x455196c <_ChromeMain+0x454c6d0>
 45519ac: f9400508     	ldr	x8, [x8, #0x8]
 45519b0: b5ffff68     	cbnz	x8, 0x455199c <_ChromeMain+0x454c700>
 45519b4: d2800015     	mov	x21, #0x0               ; =0
 45519b8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45519bc: f9404749     	ldr	x9, [x26, #0x88]
 45519c0: eb09011f     	cmp	x8, x9
 45519c4: 54000061     	b.ne	0x45519d0 <_ChromeMain+0x454c734>
 45519c8: aa1503e0     	mov	x0, x21
 45519cc: 96eb441c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45519d0: 3940fea9     	ldrb	w9, [x21, #0x3f]
 45519d4: 13001d28     	sxtb	w8, w9
 45519d8: f9401aaa     	ldr	x10, [x21, #0x30]
 45519dc: 7100011f     	cmp	w8, #0x0
 45519e0: 9a894149     	csel	x9, x10, x9, mi
 45519e4: f100553f     	cmp	x9, #0x15
 45519e8: 540001c1     	b.ne	0x4551a20 <_ChromeMain+0x454c784>
 45519ec: f8428ea9     	ldr	x9, [x21, #0x28]!
 45519f0: 7100011f     	cmp	w8, #0x0
 45519f4: 9a954128     	csel	x8, x9, x21, mi
 45519f8: 90044d69     	adrp	x9, 0xcefd000 <dyld_stub_binder+0xcefd000>
 45519fc: 911fd929     	add	x9, x9, #0x7f6
 4551a00: a9402d0a     	ldp	x10, x11, [x8]
 4551a04: a940352c     	ldp	x12, x13, [x9]
 4551a08: f840d108     	ldur	x8, [x8, #0xd]
 4551a0c: f840d129     	ldur	x9, [x9, #0xd]
 4551a10: eb0c015f     	cmp	x10, x12
 4551a14: fa4d0160     	ccmp	x11, x13, #0x0, eq
 4551a18: fa490100     	ccmp	x8, x9, #0x0, eq
 4551a1c: 54000500     	b.eq	0x4551abc <_ChromeMain+0x454c820>
 4551a20: b0053ce8     	adrp	x8, 0xecee000 <dyld_stub_binder+0xecee000>
 4551a24: f9418500     	ldr	x0, [x8, #0x308]
 4551a28: 95203c44     	bl	0x8d60b38 <_ChromeMain+0x8d5b89c>
 4551a2c: f9406668     	ldr	x8, [x19, #0xc8]
 4551a30: f9429d02     	ldr	x2, [x8, #0x538]
 4551a34: aa1403e3     	mov	x3, x20
 4551a38: 95fffcf7     	bl	0xc550e14 <_ChromeMain+0xc54bb78>
 4551a3c: f9406a68     	ldr	x8, [x19, #0xd0]
 4551a40: f9006a60     	str	x0, [x19, #0xd0]
 4551a44: aa0803e0     	mov	x0, x8
 4551a48: 94eac745     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4551a4c: f9406a62     	ldr	x2, [x19, #0xd0]
 4551a50: aa1403e0     	mov	x0, x20
 4551a54: 95fffcf3     	bl	0xc550e20 <_ChromeMain+0xc54bb84>
 4551a58: aa1403e0     	mov	x0, x20
 4551a5c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4551a60: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4551a64: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4551a68: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4551a6c: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4551a70: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4551a74: 15182e1e     	b	0x8b5d2ec <_ChromeMain+0x8b58050>
 4551a78: f9401aa8     	ldr	x8, [x21, #0x30]
 4551a7c: f100711f     	cmp	x8, #0x1c
 4551a80: 54fff701     	b.ne	0x4551960 <_ChromeMain+0x454c6c4>
 4551a84: f94016a8     	ldr	x8, [x21, #0x28]
 4551a88: d0044c29     	adrp	x9, 0xced7000 <dyld_stub_binder+0xced7000>
 4551a8c: 910e6529     	add	x9, x9, #0x399
 4551a90: a9402d0a     	ldp	x10, x11, [x8]
 4551a94: a940352c     	ldp	x12, x13, [x9]
 4551a98: f940090e     	ldr	x14, [x8, #0x10]
 4551a9c: f940092f     	ldr	x15, [x9, #0x10]
 4551aa0: b9401908     	ldr	w8, [x8, #0x18]
 4551aa4: b9401929     	ldr	w9, [x9, #0x18]
 4551aa8: eb0c015f     	cmp	x10, x12
 4551aac: fa4d0160     	ccmp	x11, x13, #0x0, eq
 4551ab0: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 4551ab4: fa490100     	ccmp	x8, x9, #0x0, eq
 4551ab8: 54fff541     	b.ne	0x4551960 <_ChromeMain+0x454c6c4>
 4551abc: aa1403e0     	mov	x0, x20
 4551ac0: 94eac72a     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4551ac4: b0053ce8     	adrp	x8, 0xecee000 <dyld_stub_binder+0xecee000>
 4551ac8: f9405500     	ldr	x0, [x8, #0xa8]
 4551acc: 9506833c     	bl	0x86f27bc <_ChromeMain+0x86ed520>
 4551ad0: aa0003e2     	mov	x2, x0
 4551ad4: aa1403e0     	mov	x0, x20
 4551ad8: 9506833c     	bl	0x86f27c8 <_ChromeMain+0x86ed52c>
 4551adc: 340001e0     	cbz	w0, 0x4551b18 <_ChromeMain+0x454c87c>
 4551ae0: b4fffa14     	cbz	x20, 0x4551a20 <_ChromeMain+0x454c784>
 4551ae4: f9406668     	ldr	x8, [x19, #0xc8]
 4551ae8: f9429d09     	ldr	x9, [x8, #0x538]
 4551aec: b4000789     	cbz	x9, 0x4551bdc <_ChromeMain+0x454c940>
 4551af0: f940c528     	ldr	x8, [x9, #0x188]
 4551af4: b40003c8     	cbz	x8, 0x4551b6c <_ChromeMain+0x454c8d0>
 4551af8: 91062129     	add	x9, x9, #0x188
 4551afc: 14000016     	b	0x4551b54 <_ChromeMain+0x454c8b8>
 4551b00: 52800002     	mov	w2, #0x0                ; =0
 4551b04: aa1403e0     	mov	x0, x20
 4551b08: 95fffcd8     	bl	0xc550e68 <_ChromeMain+0xc54bbcc>
 4551b0c: aa1403e0     	mov	x0, x20
 4551b10: 52800002     	mov	w2, #0x0                ; =0
 4551b14: 95fffcd8     	bl	0xc550e74 <_ChromeMain+0xc54bbd8>
 4551b18: aa1403e0     	mov	x0, x20
 4551b1c: 94eac710     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4551b20: 17ffffc0     	b	0x4551a20 <_ChromeMain+0x454c784>
 4551b24: eb09011f     	cmp	x8, x9
 4551b28: 54000220     	b.eq	0x4551b6c <_ChromeMain+0x454c8d0>
 4551b2c: f9401515     	ldr	x21, [x8, #0x28]
 4551b30: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551b34: f9404749     	ldr	x9, [x26, #0x88]
 4551b38: eb09011f     	cmp	x8, x9
 4551b3c: 540001a1     	b.ne	0x4551b70 <_ChromeMain+0x454c8d4>
 4551b40: aa1503e0     	mov	x0, x21
 4551b44: 96eb09ee     	bl	0x142fc <_ChromeMain+0xf060>
 4551b48: 1400000a     	b	0x4551b70 <_ChromeMain+0x454c8d4>
 4551b4c: f9400108     	ldr	x8, [x8]
 4551b50: b40000e8     	cbz	x8, 0x4551b6c <_ChromeMain+0x454c8d0>
 4551b54: f940110a     	ldr	x10, [x8, #0x20]
 4551b58: eb1b015f     	cmp	x10, x27
 4551b5c: 54ffff88     	b.hi	0x4551b4c <_ChromeMain+0x454c8b0>
 4551b60: 54fffe20     	b.eq	0x4551b24 <_ChromeMain+0x454c888>
 4551b64: f9400508     	ldr	x8, [x8, #0x8]
 4551b68: b5ffff68     	cbnz	x8, 0x4551b54 <_ChromeMain+0x454c8b8>
 4551b6c: d2800015     	mov	x21, #0x0               ; =0
 4551b70: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551b74: f9404749     	ldr	x9, [x26, #0x88]
 4551b78: eb09011f     	cmp	x8, x9
 4551b7c: 54000061     	b.ne	0x4551b88 <_ChromeMain+0x454c8ec>
 4551b80: aa1503e0     	mov	x0, x21
 4551b84: 96eb43ae     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4551b88: 3940fea9     	ldrb	w9, [x21, #0x3f]
 4551b8c: 13001d28     	sxtb	w8, w9
 4551b90: f9401aaa     	ldr	x10, [x21, #0x30]
 4551b94: 7100011f     	cmp	w8, #0x0
 4551b98: 9a894149     	csel	x9, x10, x9, mi
 4551b9c: f100553f     	cmp	x9, #0x15
 4551ba0: 540001e1     	b.ne	0x4551bdc <_ChromeMain+0x454c940>
 4551ba4: f8428ea9     	ldr	x9, [x21, #0x28]!
 4551ba8: 7100011f     	cmp	w8, #0x0
 4551bac: 9a954128     	csel	x8, x9, x21, mi
 4551bb0: 90044d69     	adrp	x9, 0xcefd000 <dyld_stub_binder+0xcefd000>
 4551bb4: 911fd929     	add	x9, x9, #0x7f6
 4551bb8: a9402d0a     	ldp	x10, x11, [x8]
 4551bbc: a940352c     	ldp	x12, x13, [x9]
 4551bc0: f840d108     	ldur	x8, [x8, #0xd]
 4551bc4: f840d129     	ldur	x9, [x9, #0xd]
 4551bc8: eb0c015f     	cmp	x10, x12
 4551bcc: fa4d0160     	ccmp	x11, x13, #0x0, eq
 4551bd0: fa490100     	ccmp	x8, x9, #0x0, eq
 4551bd4: 1a9f07e2     	cset	w2, ne
 4551bd8: 14000002     	b	0x4551be0 <_ChromeMain+0x454c944>
 4551bdc: 52800022     	mov	w2, #0x1                ; =1
 4551be0: aa1403e0     	mov	x0, x20
 4551be4: 95fffca7     	bl	0xc550e80 <_ChromeMain+0xc54bbe4>
 4551be8: f9406668     	ldr	x8, [x19, #0xc8]
 4551bec: f9429d09     	ldr	x9, [x8, #0x538]
 4551bf0: b4fff889     	cbz	x9, 0x4551b00 <_ChromeMain+0x454c864>
 4551bf4: f940c528     	ldr	x8, [x9, #0x188]
 4551bf8: b4000168     	cbz	x8, 0x4551c24 <_ChromeMain+0x454c988>
 4551bfc: 91062129     	add	x9, x9, #0x188
 4551c00: 14000003     	b	0x4551c0c <_ChromeMain+0x454c970>
 4551c04: f9400108     	ldr	x8, [x8]
 4551c08: b40000e8     	cbz	x8, 0x4551c24 <_ChromeMain+0x454c988>
 4551c0c: f940110a     	ldr	x10, [x8, #0x20]
 4551c10: eb1b015f     	cmp	x10, x27
 4551c14: 54ffff88     	b.hi	0x4551c04 <_ChromeMain+0x454c968>
 4551c18: 540003e0     	b.eq	0x4551c94 <_ChromeMain+0x454c9f8>
 4551c1c: f9400508     	ldr	x8, [x8, #0x8]
 4551c20: b5ffff68     	cbnz	x8, 0x4551c0c <_ChromeMain+0x454c970>
 4551c24: d2800015     	mov	x21, #0x0               ; =0
 4551c28: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551c2c: f9404749     	ldr	x9, [x26, #0x88]
 4551c30: eb09011f     	cmp	x8, x9
 4551c34: 54000061     	b.ne	0x4551c40 <_ChromeMain+0x454c9a4>
 4551c38: aa1503e0     	mov	x0, x21
 4551c3c: 96eb4380     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4551c40: 3940fea9     	ldrb	w9, [x21, #0x3f]
 4551c44: 13001d28     	sxtb	w8, w9
 4551c48: f9401aaa     	ldr	x10, [x21, #0x30]
 4551c4c: 7100011f     	cmp	w8, #0x0
 4551c50: 9a894149     	csel	x9, x10, x9, mi
 4551c54: f100553f     	cmp	x9, #0x15
 4551c58: 54fff541     	b.ne	0x4551b00 <_ChromeMain+0x454c864>
 4551c5c: f8428ea9     	ldr	x9, [x21, #0x28]!
 4551c60: 7100011f     	cmp	w8, #0x0
 4551c64: 9a954128     	csel	x8, x9, x21, mi
 4551c68: 90044d69     	adrp	x9, 0xcefd000 <dyld_stub_binder+0xcefd000>
 4551c6c: 911fd929     	add	x9, x9, #0x7f6
 4551c70: a9402d0a     	ldp	x10, x11, [x8]
 4551c74: a940352c     	ldp	x12, x13, [x9]
 4551c78: f840d108     	ldur	x8, [x8, #0xd]
 4551c7c: f840d129     	ldur	x9, [x9, #0xd]
 4551c80: eb0c015f     	cmp	x10, x12
 4551c84: fa4d0160     	ccmp	x11, x13, #0x0, eq
 4551c88: fa490100     	ccmp	x8, x9, #0x0, eq
 4551c8c: 1a9f17e2     	cset	w2, eq
 4551c90: 17ffff9d     	b	0x4551b04 <_ChromeMain+0x454c868>
 4551c94: eb09011f     	cmp	x8, x9
 4551c98: 54fffc60     	b.eq	0x4551c24 <_ChromeMain+0x454c988>
 4551c9c: f9401515     	ldr	x21, [x8, #0x28]
 4551ca0: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4551ca4: f9404749     	ldr	x9, [x26, #0x88]
 4551ca8: eb09011f     	cmp	x8, x9
 4551cac: 54fffbe1     	b.ne	0x4551c28 <_ChromeMain+0x454c98c>
 4551cb0: aa1503e0     	mov	x0, x21
 4551cb4: 96eb0992     	bl	0x142fc <_ChromeMain+0xf060>
 4551cb8: 17ffffdc     	b	0x4551c28 <_ChromeMain+0x454c98c>
 4551cbc: b4ffe0b4     	cbz	x20, 0x45518d0 <_ChromeMain+0x454c634>
 4551cc0: 90053ce8     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4551cc4: f9441d15     	ldr	x21, [x8, #0x838]
 4551cc8: aa1403e0     	mov	x0, x20
 4551ccc: 94eac6a7     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4551cd0: d004cfe8     	adrp	x8, 0xdf4f000 <dyld_stub_binder+0xdf4f000>
 4551cd4: fd433d00     	ldr	d0, [x8, #0x678]
 4551cd8: d503201f     	nop
 4551cdc: fd434102     	ldr	d2, [x8, #0x680]
 4551ce0: 1e6e1003     	fmov	d3, #1.00000000
 4551ce4: aa1503e0     	mov	x0, x21
 4551ce8: 4ea01c01     	mov.16b	v1, v0
 4551cec: 956f805e     	bl	0xa131e64 <_ChromeMain+0xa12cbc8>
 4551cf0: 94eac692     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4551cf4: aa0003f5     	mov	x21, x0
 4551cf8: 90053ce8     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4551cfc: f944f100     	ldr	x0, [x8, #0x9e0]
 4551d00: 9004d6c8     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 4551d04: f9448908     	ldr	x8, [x8, #0x910]
 4551d08: f9400102     	ldr	x2, [x8]
 4551d0c: 956f8059     	bl	0xa131e70 <_ChromeMain+0xa12cbd4>
 4551d10: 94eac68a     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4551d14: aa0003f6     	mov	x22, x0
 4551d18: aa1403e0     	mov	x0, x20
 4551d1c: aa1603e2     	mov	x2, x22
 4551d20: 956f8057     	bl	0xa131e7c <_ChromeMain+0xa12cbe0>
 4551d24: aa1603e0     	mov	x0, x22
 4551d28: 94eac68d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4551d2c: aa1403e0     	mov	x0, x20
 4551d30: 52800022     	mov	w2, #0x1                ; =1
 4551d34: 954d623a     	bl	0x98aa61c <_ChromeMain+0x98a5380>
 4551d38: aa1403e0     	mov	x0, x20
 4551d3c: aa1503e2     	mov	x2, x21
 4551d40: 95196614     	bl	0x8bab590 <_ChromeMain+0x8ba62f4>
 4551d44: aa1403e0     	mov	x0, x20
 4551d48: 95459271     	bl	0x96b670c <_ChromeMain+0x96b1470>
 4551d4c: 94eac67b     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4551d50: aa0003f6     	mov	x22, x0
 4551d54: aa1403e0     	mov	x0, x20
 4551d58: 94eac681     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4551d5c: b4ffdb36     	cbz	x22, 0x45518c0 <_ChromeMain+0x454c624>
 4551d60: aa1603e0     	mov	x0, x22
 4551d64: 52800022     	mov	w2, #0x1                ; =1
 4551d68: 956f8048     	bl	0xa131e88 <_ChromeMain+0xa12cbec>
 4551d6c: aa1503e0     	mov	x0, x21
 4551d70: 95182d65     	bl	0x8b5d304 <_ChromeMain+0x8b58068>
 4551d74: 956f8048     	bl	0xa131e94 <_ChromeMain+0xa12cbf8>
 4551d78: aa0003f7     	mov	x23, x0
 4551d7c: aa1603e0     	mov	x0, x22
 4551d80: 956f8048     	bl	0xa131ea0 <_ChromeMain+0xa12cc04>
 4551d84: 94eac66d     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4551d88: aa0003f8     	mov	x24, x0
 4551d8c: aa1703e2     	mov	x2, x23
 4551d90: 95196600     	bl	0x8bab590 <_ChromeMain+0x8ba62f4>
 4551d94: aa1803e0     	mov	x0, x24
 4551d98: 94eac671     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4551d9c: aa1603e0     	mov	x0, x22
 4551da0: 950d310d     	bl	0x889e1d4 <_ChromeMain+0x8898f38>
 4551da4: 94eac665     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4551da8: aa0003f7     	mov	x23, x0
 4551dac: b4000200     	cbz	x0, 0x4551dec <_ChromeMain+0x454cb50>
 4551db0: aa1703e0     	mov	x0, x23
 4551db4: 52800022     	mov	w2, #0x1                ; =1
 4551db8: 956f8034     	bl	0xa131e88 <_ChromeMain+0xa12cbec>
 4551dbc: aa1503e0     	mov	x0, x21
 4551dc0: 95182d51     	bl	0x8b5d304 <_ChromeMain+0x8b58068>
 4551dc4: 956f8034     	bl	0xa131e94 <_ChromeMain+0xa12cbf8>
 4551dc8: aa0003f8     	mov	x24, x0
 4551dcc: aa1703e0     	mov	x0, x23
 4551dd0: 956f8034     	bl	0xa131ea0 <_ChromeMain+0xa12cc04>
 4551dd4: 94eac659     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4551dd8: aa0003f9     	mov	x25, x0
 4551ddc: aa1803e2     	mov	x2, x24
 4551de0: 951965ec     	bl	0x8bab590 <_ChromeMain+0x8ba62f4>
 4551de4: aa1903e0     	mov	x0, x25
 4551de8: 94eac65d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4551dec: aa1703e0     	mov	x0, x23
 4551df0: 94eac65b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4551df4: 17fffeb3     	b	0x45518c0 <_ChromeMain+0x454c624>
 4551df8: d4200000     	brk	#0
 4551dfc: d4400000     	hlt	#0
 4551e00: d4200020     	brk	#0x1
 4551e04: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
