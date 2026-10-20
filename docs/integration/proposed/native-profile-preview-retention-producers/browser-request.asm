
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45abe40: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 45abe44: a90157f6     	stp	x22, x21, [sp, #0x10]
 45abe48: a9024ff4     	stp	x20, x19, [sp, #0x20]
 45abe4c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 45abe50: 9100c3fd     	add	x29, sp, #0x30
 45abe54: f9432c13     	ldr	x19, [x0, #0x658]
 45abe58: b4000193     	cbz	x19, 0x45abe88 <_ChromeMain+0x45a6bec>
 45abe5c: 34000be1     	cbz	w1, 0x45abfd8 <_ChromeMain+0x45a6d3c>
 45abe60: aa0003f4     	mov	x20, x0
 45abe64: f9429c09     	ldr	x9, [x0, #0x538]
 45abe68: f0053037     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45abe6c: b4000cc9     	cbz	x9, 0x45ac004 <_ChromeMain+0x45a6d68>
 45abe70: f940c528     	ldr	x8, [x9, #0x188]
 45abe74: b4000388     	cbz	x8, 0x45abee4 <_ChromeMain+0x45a6c48>
 45abe78: 91062129     	add	x9, x9, #0x188
 45abe7c: f005174a     	adrp	x10, 0xe896000 <dyld_stub_binder+0xe896000>
 45abe80: 913ae14a     	add	x10, x10, #0xeb8
 45abe84: 14000012     	b	0x45abecc <_ChromeMain+0x45a6c30>
 45abe88: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45abe8c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45abe90: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45abe94: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 45abe98: d65f03c0     	ret
 45abe9c: eb09011f     	cmp	x8, x9
 45abea0: 54000220     	b.eq	0x45abee4 <_ChromeMain+0x45a6c48>
 45abea4: f9401515     	ldr	x21, [x8, #0x28]
 45abea8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45abeac: f94046e9     	ldr	x9, [x23, #0x88]
 45abeb0: eb09011f     	cmp	x8, x9
 45abeb4: 540001a1     	b.ne	0x45abee8 <_ChromeMain+0x45a6c4c>
 45abeb8: aa1503e0     	mov	x0, x21
 45abebc: 96e9a110     	bl	0x142fc <_ChromeMain+0xf060>
 45abec0: 1400000a     	b	0x45abee8 <_ChromeMain+0x45a6c4c>
 45abec4: f9400108     	ldr	x8, [x8]
 45abec8: b40000e8     	cbz	x8, 0x45abee4 <_ChromeMain+0x45a6c48>
 45abecc: f940110b     	ldr	x11, [x8, #0x20]
 45abed0: eb0a017f     	cmp	x11, x10
 45abed4: 54ffff88     	b.hi	0x45abec4 <_ChromeMain+0x45a6c28>
 45abed8: 54fffe20     	b.eq	0x45abe9c <_ChromeMain+0x45a6c00>
 45abedc: f9400508     	ldr	x8, [x8, #0x8]
 45abee0: b5ffff68     	cbnz	x8, 0x45abecc <_ChromeMain+0x45a6c30>
 45abee4: d2800015     	mov	x21, #0x0               ; =0
 45abee8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45abeec: f94046e9     	ldr	x9, [x23, #0x88]
 45abef0: eb09011f     	cmp	x8, x9
 45abef4: 54000061     	b.ne	0x45abf00 <_ChromeMain+0x45a6c64>
 45abef8: aa1503e0     	mov	x0, x21
 45abefc: 96e9dad0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45abf00: f9429e88     	ldr	x8, [x20, #0x538]
 45abf04: 9100a109     	add	x9, x8, #0x28
 45abf08: f100011f     	cmp	x8, #0x0
 45abf0c: 9a8903e9     	csel	x9, xzr, x9, eq
 45abf10: f940b128     	ldr	x8, [x9, #0x160]
 45abf14: b40002e8     	cbz	x8, 0x45abf70 <_ChromeMain+0x45a6cd4>
 45abf18: 91058129     	add	x9, x9, #0x160
 45abf1c: d00516aa     	adrp	x10, 0xe881000 <dyld_stub_binder+0xe881000>
 45abf20: 911fa14a     	add	x10, x10, #0x7e8
 45abf24: 1400000d     	b	0x45abf58 <_ChromeMain+0x45a6cbc>
 45abf28: eb09011f     	cmp	x8, x9
 45abf2c: 54000220     	b.eq	0x45abf70 <_ChromeMain+0x45a6cd4>
 45abf30: f9401516     	ldr	x22, [x8, #0x28]
 45abf34: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45abf38: f94046e9     	ldr	x9, [x23, #0x88]
 45abf3c: eb09011f     	cmp	x8, x9
 45abf40: 540001a1     	b.ne	0x45abf74 <_ChromeMain+0x45a6cd8>
 45abf44: aa1603e0     	mov	x0, x22
 45abf48: 96e9a0ed     	bl	0x142fc <_ChromeMain+0xf060>
 45abf4c: 1400000a     	b	0x45abf74 <_ChromeMain+0x45a6cd8>
 45abf50: f9400108     	ldr	x8, [x8]
 45abf54: b40000e8     	cbz	x8, 0x45abf70 <_ChromeMain+0x45a6cd4>
 45abf58: f940110b     	ldr	x11, [x8, #0x20]
 45abf5c: eb0a017f     	cmp	x11, x10
 45abf60: 54ffff88     	b.hi	0x45abf50 <_ChromeMain+0x45a6cb4>
 45abf64: 54fffe20     	b.eq	0x45abf28 <_ChromeMain+0x45a6c8c>
 45abf68: f9400508     	ldr	x8, [x8, #0x8]
 45abf6c: b5ffff68     	cbnz	x8, 0x45abf58 <_ChromeMain+0x45a6cbc>
 45abf70: d2800016     	mov	x22, #0x0               ; =0
 45abf74: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45abf78: f94046e9     	ldr	x9, [x23, #0x88]
 45abf7c: eb09011f     	cmp	x8, x9
 45abf80: 54000061     	b.ne	0x45abf8c <_ChromeMain+0x45a6cf0>
 45abf84: aa1603e0     	mov	x0, x22
 45abf88: 96e9daad     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45abf8c: aa1603e0     	mov	x0, x22
 45abf90: 52800041     	mov	w1, #0x2                ; =2
 45abf94: 9730e3e1     	bl	0x11e4f18 <_ChromeMain+0x11dfc7c>
 45abf98: 340001e0     	cbz	w0, 0x45abfd4 <_ChromeMain+0x45a6d38>
 45abf9c: 52800001     	mov	w1, #0x0                ; =0
 45abfa0: b40001d5     	cbz	x21, 0x45abfd8 <_ChromeMain+0x45a6d3c>
 45abfa4: f9432e88     	ldr	x8, [x20, #0x658]
 45abfa8: b4000188     	cbz	x8, 0x45abfd8 <_ChromeMain+0x45a6d3c>
 45abfac: f0052fe0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 45abfb0: 9118e000     	add	x0, x0, #0x638
 45abfb4: 96edb4b3     	bl	0x119280 <_ChromeMain+0x113fe4>
 45abfb8: 370000a0     	tbnz	w0, #0x0, 0x45abfcc <_ChromeMain+0x45a6d30>
 45abfbc: f0052fe0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 45abfc0: 91192000     	add	x0, x0, #0x648
 45abfc4: 96edb4af     	bl	0x119280 <_ChromeMain+0x113fe4>
 45abfc8: 34000060     	cbz	w0, 0x45abfd4 <_ChromeMain+0x45a6d38>
 45abfcc: 394782a8     	ldrb	w8, [x21, #0x1e0]
 45abfd0: 35000108     	cbnz	w8, 0x45abff0 <_ChromeMain+0x45a6d54>
 45abfd4: 52800001     	mov	w1, #0x0                ; =0
 45abfd8: aa1303e0     	mov	x0, x19
 45abfdc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45abfe0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45abfe4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45abfe8: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 45abfec: 1402bae9     	b	0x465ab90 <_ChromeMain+0x46558f4>
 45abff0: f9429e88     	ldr	x8, [x20, #0x538]
 45abff4: b9406108     	ldr	w8, [x8, #0x60]
 45abff8: 7100011f     	cmp	w8, #0x0
 45abffc: 1a9f17e1     	cset	w1, eq
 45ac000: 17fffff6     	b	0x45abfd8 <_ChromeMain+0x45a6d3c>
 45ac004: d2800015     	mov	x21, #0x0               ; =0
 45ac008: 17ffffbe     	b	0x45abf00 <_ChromeMain+0x45a6c64>
