
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e8438: f94017e0     	ldr	x0, [sp, #0x28]
 35e843c: b501acc0     	cbnz	x0, 0x35eb9d4 <_ChromeMain+0x35e6738>
 35e8440: 52830368     	mov	w8, #0x181b             ; =6171
 35e8444: 72bfe308     	movk	w8, #0xff18, lsl #16
 35e8448: 7100029f     	cmp	w20, #0x0
 35e844c: 5a9f1115     	csinv	w21, w8, wzr, ne
 35e8450: 52800036     	mov	w22, #0x1               ; =1
 35e8454: 3900c3f6     	strb	w22, [sp, #0x30]
 35e8458: 52800500     	mov	w0, #0x28               ; =40
 35e845c: 97289bc3     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e8460: b9000016     	str	w22, [x0]
 35e8464: f0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e8468: 91180108     	add	x8, x8, #0x600
 35e846c: a900a019     	stp	x25, x8, [x0, #0x8]
 35e8470: f9000c1a     	str	x26, [x0, #0x18]
 35e8474: b9002415     	str	w21, [x0, #0x24]
 35e8478: f90017e0     	str	x0, [sp, #0x28]
 35e847c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e8480: f9001fff     	str	xzr, [sp, #0x38]
 35e8484: 52800200     	mov	w0, #0x10               ; =16
 35e8488: 97289bb8     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e848c: b4035460     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e8490: aa0003f5     	mov	x21, x0
 35e8494: 9100a3e1     	add	x1, sp, #0x28
 35e8498: 972c14ae     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e849c: a943dff6     	ldp	x22, x23, [sp, #0x38]
 35e84a0: cb17101c     	sub	x28, x0, x23, lsl #4
 35e84a4: d37ceef8     	lsl	x24, x23, #4
 35e84a8: b50217d8     	cbnz	x24, 0x35ec7a0 <_ChromeMain+0x35e7504>
 35e84ac: cb1713e8     	neg	x8, x23, lsl #4
 35e84b0: 52800209     	mov	w9, #0x10               ; =16
 35e84b4: cb080128     	sub	x8, x9, x8
 35e84b8: 9344fd08     	asr	x8, x8, #4
 35e84bc: a903a3fc     	stp	x28, x8, [sp, #0x38]
 35e84c0: f94027e8     	ldr	x8, [sp, #0x48]
 35e84c4: 52800029     	mov	w9, #0x1                ; =1
 35e84c8: f90027e9     	str	x9, [sp, #0x48]
 35e84cc: b5032bb6     	cbnz	x22, 0x35eea40 <_ChromeMain+0x35e97a4>
 35e84d0: 910042a8     	add	x8, x21, #0x10
 35e84d4: eb1c0108     	subs	x8, x8, x28
 35e84d8: 9344fd08     	asr	x8, x8, #4
 35e84dc: f90023e8     	str	x8, [sp, #0x40]
 35e84e0: 540351c0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e84e4: aa1303e0     	mov	x0, x19
 35e84e8: 52801e61     	mov	w1, #0xf3               ; =243
 35e84ec: 97353160     	bl	0x334a6c <_ChromeMain+0x32f7d0>
