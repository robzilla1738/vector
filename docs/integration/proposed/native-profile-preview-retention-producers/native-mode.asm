
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 28ad220: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 28ad224: a9014ff4     	stp	x20, x19, [sp, #0x10]
 28ad228: a9027bfd     	stp	x29, x30, [sp, #0x20]
 28ad22c: 910083fd     	add	x29, sp, #0x20
 28ad230: aa0003f3     	mov	x19, x0
 28ad234: f9429c09     	ldr	x9, [x0, #0x538]
 28ad238: b0061836     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 28ad23c: b4000be9     	cbz	x9, 0x28ad3b8 <_ChromeMain+0x28a811c>
 28ad240: f940c528     	ldr	x8, [x9, #0x188]
 28ad244: b40002e8     	cbz	x8, 0x28ad2a0 <_ChromeMain+0x28a8004>
 28ad248: 91062129     	add	x9, x9, #0x188
 28ad24c: b005ff4a     	adrp	x10, 0xe896000 <dyld_stub_binder+0xe896000>
 28ad250: 913ae14a     	add	x10, x10, #0xeb8
 28ad254: 1400000d     	b	0x28ad288 <_ChromeMain+0x28a7fec>
 28ad258: eb09011f     	cmp	x8, x9
 28ad25c: 54000220     	b.eq	0x28ad2a0 <_ChromeMain+0x28a8004>
 28ad260: f9401514     	ldr	x20, [x8, #0x28]
 28ad264: 925e7688     	and	x8, x20, #0xfffffffc00000000
 28ad268: f94046c9     	ldr	x9, [x22, #0x88]
 28ad26c: eb09011f     	cmp	x8, x9
 28ad270: 540001a1     	b.ne	0x28ad2a4 <_ChromeMain+0x28a8008>
 28ad274: aa1403e0     	mov	x0, x20
 28ad278: 975d9c21     	bl	0x142fc <_ChromeMain+0xf060>
 28ad27c: 1400000a     	b	0x28ad2a4 <_ChromeMain+0x28a8008>
 28ad280: f9400108     	ldr	x8, [x8]
 28ad284: b40000e8     	cbz	x8, 0x28ad2a0 <_ChromeMain+0x28a8004>
 28ad288: f940110b     	ldr	x11, [x8, #0x20]
 28ad28c: eb0a017f     	cmp	x11, x10
 28ad290: 54ffff88     	b.hi	0x28ad280 <_ChromeMain+0x28a7fe4>
 28ad294: 54fffe20     	b.eq	0x28ad258 <_ChromeMain+0x28a7fbc>
 28ad298: f9400508     	ldr	x8, [x8, #0x8]
 28ad29c: b5ffff68     	cbnz	x8, 0x28ad288 <_ChromeMain+0x28a7fec>
 28ad2a0: d2800014     	mov	x20, #0x0               ; =0
 28ad2a4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 28ad2a8: f94046c9     	ldr	x9, [x22, #0x88]
 28ad2ac: eb09011f     	cmp	x8, x9
 28ad2b0: 54000061     	b.ne	0x28ad2bc <_ChromeMain+0x28a8020>
 28ad2b4: aa1403e0     	mov	x0, x20
 28ad2b8: 975dd5e1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 28ad2bc: f9429e68     	ldr	x8, [x19, #0x538]
 28ad2c0: 9100a109     	add	x9, x8, #0x28
 28ad2c4: f100011f     	cmp	x8, #0x0
 28ad2c8: 9a8903e9     	csel	x9, xzr, x9, eq
 28ad2cc: f940b128     	ldr	x8, [x9, #0x160]
 28ad2d0: b40002e8     	cbz	x8, 0x28ad32c <_ChromeMain+0x28a8090>
 28ad2d4: 91058129     	add	x9, x9, #0x160
 28ad2d8: 9005feaa     	adrp	x10, 0xe881000 <dyld_stub_binder+0xe881000>
 28ad2dc: 911fa14a     	add	x10, x10, #0x7e8
 28ad2e0: 1400000d     	b	0x28ad314 <_ChromeMain+0x28a8078>
 28ad2e4: eb09011f     	cmp	x8, x9
 28ad2e8: 54000220     	b.eq	0x28ad32c <_ChromeMain+0x28a8090>
 28ad2ec: f9401515     	ldr	x21, [x8, #0x28]
 28ad2f0: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 28ad2f4: f94046c9     	ldr	x9, [x22, #0x88]
 28ad2f8: eb09011f     	cmp	x8, x9
 28ad2fc: 540001a1     	b.ne	0x28ad330 <_ChromeMain+0x28a8094>
 28ad300: aa1503e0     	mov	x0, x21
 28ad304: 975d9bfe     	bl	0x142fc <_ChromeMain+0xf060>
 28ad308: 1400000a     	b	0x28ad330 <_ChromeMain+0x28a8094>
 28ad30c: f9400108     	ldr	x8, [x8]
 28ad310: b40000e8     	cbz	x8, 0x28ad32c <_ChromeMain+0x28a8090>
 28ad314: f940110b     	ldr	x11, [x8, #0x20]
 28ad318: eb0a017f     	cmp	x11, x10
 28ad31c: 54ffff88     	b.hi	0x28ad30c <_ChromeMain+0x28a8070>
 28ad320: 54fffe20     	b.eq	0x28ad2e4 <_ChromeMain+0x28a8048>
 28ad324: f9400508     	ldr	x8, [x8, #0x8]
 28ad328: b5ffff68     	cbnz	x8, 0x28ad314 <_ChromeMain+0x28a8078>
 28ad32c: d2800015     	mov	x21, #0x0               ; =0
 28ad330: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 28ad334: f94046c9     	ldr	x9, [x22, #0x88]
 28ad338: eb09011f     	cmp	x8, x9
 28ad33c: 54000061     	b.ne	0x28ad348 <_ChromeMain+0x28a80ac>
 28ad340: aa1503e0     	mov	x0, x21
 28ad344: 975dd5be     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 28ad348: aa1503e0     	mov	x0, x21
 28ad34c: 52800041     	mov	w1, #0x2                ; =2
 28ad350: 97a4def2     	bl	0x11e4f18 <_ChromeMain+0x11dfc7c>
 28ad354: 340002a0     	cbz	w0, 0x28ad3a8 <_ChromeMain+0x28a810c>
 28ad358: 52800000     	mov	w0, #0x0                ; =0
 28ad35c: b4000274     	cbz	x20, 0x28ad3a8 <_ChromeMain+0x28a810c>
 28ad360: f9432e68     	ldr	x8, [x19, #0x658]
 28ad364: b4000228     	cbz	x8, 0x28ad3a8 <_ChromeMain+0x28a810c>
 28ad368: b00617e0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 28ad36c: 9118e000     	add	x0, x0, #0x638
 28ad370: 9761afc4     	bl	0x119280 <_ChromeMain+0x113fe4>
 28ad374: 370000a0     	tbnz	w0, #0x0, 0x28ad388 <_ChromeMain+0x28a80ec>
 28ad378: b00617e0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 28ad37c: 91192000     	add	x0, x0, #0x648
 28ad380: 9761afc0     	bl	0x119280 <_ChromeMain+0x113fe4>
 28ad384: 34000120     	cbz	w0, 0x28ad3a8 <_ChromeMain+0x28a810c>
 28ad388: 39478288     	ldrb	w8, [x20, #0x1e0]
 28ad38c: 35000068     	cbnz	w8, 0x28ad398 <_ChromeMain+0x28a80fc>
 28ad390: 52800000     	mov	w0, #0x0                ; =0
 28ad394: 14000005     	b	0x28ad3a8 <_ChromeMain+0x28a810c>
 28ad398: f9429e68     	ldr	x8, [x19, #0x538]
 28ad39c: b9406108     	ldr	w8, [x8, #0x60]
 28ad3a0: 7100011f     	cmp	w8, #0x0
 28ad3a4: 1a9f17e0     	cset	w0, eq
 28ad3a8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 28ad3ac: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 28ad3b0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 28ad3b4: d65f03c0     	ret
 28ad3b8: d2800014     	mov	x20, #0x0               ; =0
 28ad3bc: 17ffffc0     	b	0x28ad2bc <_ChromeMain+0x28a8020>
