
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7a1f094: d101c3ff     	sub	sp, sp, #0x70
 7a1f098: a90457f6     	stp	x22, x21, [sp, #0x40]
 7a1f09c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 7a1f0a0: a9067bfd     	stp	x29, x30, [sp, #0x60]
 7a1f0a4: 910183fd     	add	x29, sp, #0x60
 7a1f0a8: aa0203f4     	mov	x20, x2
 7a1f0ac: aa0103f5     	mov	x21, x1
 7a1f0b0: 971ca5a5     	bl	0x4148744 <_ChromeMain+0x41434a8>
 7a1f0b4: aa0003f3     	mov	x19, x0
 7a1f0b8: 910083f6     	add	x22, sp, #0x20
 7a1f0bc: 910083e8     	add	x8, sp, #0x20
 7a1f0c0: 96bfb490     	bl	0x2a0c300 <_ChromeMain+0x2a07064>
 7a1f0c4: 910023e0     	add	x0, sp, #0x8
 7a1f0c8: aa1503e1     	mov	x1, x21
 7a1f0cc: 96a8c0fd     	bl	0x244f4c0 <_ChromeMain+0x244a224>
 7a1f0d0: 910083e1     	add	x1, sp, #0x20
 7a1f0d4: 910023e3     	add	x3, sp, #0x8
 7a1f0d8: aa1303e0     	mov	x0, x19
 7a1f0dc: 528004e2     	mov	w2, #0x27               ; =39
 7a1f0e0: aa1403e4     	mov	x4, x20
 7a1f0e4: 940000a9     	bl	0x7a1f388 <_ChromeMain+0x7a1a0ec>
 7a1f0e8: aa0003f4     	mov	x20, x0
 7a1f0ec: 910023e0     	add	x0, sp, #0x8
 7a1f0f0: 963cfce4     	bl	0x95e480 <_ChromeMain+0x9591e4>
 7a1f0f4: f81d83b6     	stur	x22, [x29, #-0x28]
 7a1f0f8: d100a3a0     	sub	x0, x29, #0x28
 7a1f0fc: 96c29504     	bl	0x2ac450c <_ChromeMain+0x2abf270>
 7a1f100: b40000b3     	cbz	x19, 0x7a1f114 <_ChromeMain+0x7a19e78>
 7a1f104: aa1303e0     	mov	x0, x19
 7a1f108: 96cd1b1e     	bl	0x2d65d80 <_ChromeMain+0x2d60ae4>
 7a1f10c: 52800601     	mov	w1, #0x30               ; =48
 7a1f110: 9617a76a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7a1f114: aa1403e0     	mov	x0, x20
 7a1f118: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 7a1f11c: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 7a1f120: a94457f6     	ldp	x22, x21, [sp, #0x40]
 7a1f124: 9101c3ff     	add	sp, sp, #0x70
 7a1f128: d65f03c0     	ret
 7a1f12c: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 7a1f130: 910003fd     	mov	x29, sp
 7a1f134: f9400008     	ldr	x8, [x0]
 7a1f138: f940b508     	ldr	x8, [x8, #0x168]
 7a1f13c: d63f0100     	blr	x8
 7a1f140: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 7a1f144: 1400008f     	b	0x7a1f380 <_ChromeMain+0x7a1a0e4>
 7a1f148: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 7a1f14c: 910003fd     	mov	x29, sp
 7a1f150: f9400008     	ldr	x8, [x0]
 7a1f154: f940b508     	ldr	x8, [x8, #0x168]
 7a1f158: d63f0100     	blr	x8
 7a1f15c: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 7a1f160: 14000089     	b	0x7a1f384 <_ChromeMain+0x7a1a0e8>
 7a1f164: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 7a1f168: 910003fd     	mov	x29, sp
 7a1f16c: f9400008     	ldr	x8, [x0]
 7a1f170: f940b508     	ldr	x8, [x8, #0x168]
 7a1f174: d63f0100     	blr	x8
 7a1f178: b002d2a1     	adrp	x1, 0xd474000 <dyld_stub_binder+0xd474000>
 7a1f17c: 910ec021     	add	x1, x1, #0x3b0
 7a1f180: 528003e2     	mov	w2, #0x1f               ; =31
 7a1f184: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 7a1f188: 162988a6     	b	0x481420 <_ChromeMain+0x47c184>
 7a1f18c: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 7a1f190: 910003fd     	mov	x29, sp
 7a1f194: f9400008     	ldr	x8, [x0]
 7a1f198: f940b508     	ldr	x8, [x8, #0x168]
 7a1f19c: d63f0100     	blr	x8
 7a1f1a0: b002d2a1     	adrp	x1, 0xd474000 <dyld_stub_binder+0xd474000>
 7a1f1a4: 910ec021     	add	x1, x1, #0x3b0
 7a1f1a8: 528003e2     	mov	w2, #0x1f               ; =31
 7a1f1ac: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 7a1f1b0: 16bfb057     	b	0x2a0b30c <_ChromeMain+0x2a06070>
 7a1f1b4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7a1f1b8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7a1f1bc: 910043fd     	add	x29, sp, #0x10
 7a1f1c0: aa0003f3     	mov	x19, x0
 7a1f1c4: 90033e08     	adrp	x8, 0xe1df000 <dyld_stub_binder+0xe1df000>
 7a1f1c8: 9137a108     	add	x8, x8, #0xde8
 7a1f1cc: f9000008     	str	x8, [x0]
 7a1f1d0: 39c07c08     	ldrsb	w8, [x0, #0x1f]
 7a1f1d4: 37f800a8     	tbnz	w8, #0x1f, 0x7a1f1e8 <_ChromeMain+0x7a19f4c>
 7a1f1d8: aa1303e0     	mov	x0, x19
 7a1f1dc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7a1f1e0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7a1f1e4: d65f03c0     	ret
 7a1f1e8: f9400660     	ldr	x0, [x19, #0x8]
 7a1f1ec: f9400e68     	ldr	x8, [x19, #0x18]
 7a1f1f0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7a1f1f4: 9617a731     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7a1f1f8: 17fffff8     	b	0x7a1f1d8 <_ChromeMain+0x7a19f3c>
 7a1f1fc: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7a1f200: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7a1f204: 910043fd     	add	x29, sp, #0x10
 7a1f208: 91002000     	add	x0, x0, #0x8
 7a1f20c: 96fe9a24     	bl	0x39c5a9c <_ChromeMain+0x39c0800>
 7a1f210: b4000220     	cbz	x0, 0x7a1f254 <_ChromeMain+0x7a19fb8>
 7a1f214: aa0003f3     	mov	x19, x0
 7a1f218: f9400408     	ldr	x8, [x0, #0x8]
 7a1f21c: 52800041     	mov	w1, #0x2                ; =2
 7a1f220: d63f0100     	blr	x8
 7a1f224: 12800008     	mov	w8, #-0x1               ; =-1
 7a1f228: b8e80268     	ldaddal	w8, w8, [x19]
 7a1f22c: 7100051f     	cmp	w8, #0x1
 7a1f230: 540000c1     	b.ne	0x7a1f248 <_ChromeMain+0x7a19fac>
 7a1f234: f9400a61     	ldr	x1, [x19, #0x10]
 7a1f238: aa1303e0     	mov	x0, x19
 7a1f23c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
