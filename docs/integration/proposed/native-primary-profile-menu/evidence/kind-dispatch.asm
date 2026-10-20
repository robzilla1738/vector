
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4574428: 6db923e9     	stp	d9, d8, [sp, #-0x70]!
 457442c: a9016ffc     	stp	x28, x27, [sp, #0x10]
 4574430: a90267fa     	stp	x26, x25, [sp, #0x20]
 4574434: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4574438: a90457f6     	stp	x22, x21, [sp, #0x40]
 457443c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4574440: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4574444: 910183fd     	add	x29, sp, #0x60
 4574448: d10c43ff     	sub	sp, sp, #0x310
 457444c: 51000428     	sub	w8, w1, #0x1
 4574450: 7100251f     	cmp	w8, #0x9
 4574454: 54000328     	b.hi	0x45744b8 <_ChromeMain+0x456f21c>
 4574458: aa0203f5     	mov	x21, x2
 457445c: aa0003f4     	mov	x20, x0
 4574460: 910883f3     	add	x19, sp, #0x220
 4574464: 910723fb     	add	x27, sp, #0x1c8
 4574468: 910303f9     	add	x25, sp, #0xc0
 457446c: f0048b69     	adrp	x9, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 4574470: 91021129     	add	x9, x9, #0x84
 4574474: 1000000a     	adr	x10, 0x4574474 <_ChromeMain+0x456f1d8>
 4574478: b8a8792b     	ldrsw	x11, [x9, x8, lsl #2]
 457447c: 8b0b014a     	add	x10, x10, x11
 4574480: d61f0140     	br	x10
 4574484: aa0303f6     	mov	x22, x3
 4574488: 52801e00     	mov	w0, #0xf0               ; =240
 457448c: 940011a0     	bl	0x4578b0c <_ChromeMain+0x4573870>
 4574490: aa0003fc     	mov	x28, x0
 4574494: f9418a89     	ldr	x9, [x20, #0x310]
 4574498: b4012389     	cbz	x9, 0x4576908 <_ChromeMain+0x457166c>
 457449c: f940c528     	ldr	x8, [x9, #0x188]
 45744a0: d00531f8     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45744a4: b4012ea8     	cbz	x8, 0x4576a78 <_ChromeMain+0x45717dc>
 45744a8: 91062129     	add	x9, x9, #0x188
 45744ac: b005190a     	adrp	x10, 0xe895000 <dyld_stub_binder+0xe895000>
 45744b0: 9101814a     	add	x10, x10, #0x60
 45744b4: 1400096b     	b	0x4576a60 <_ChromeMain+0x45717c4>
 45744b8: 52802580     	mov	w0, #0x12c              ; =300
 45744bc: 910c43ff     	add	sp, sp, #0x310
 45744c0: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 45744c4: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 45744c8: a94457f6     	ldp	x22, x21, [sp, #0x40]
 45744cc: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 45744d0: a94267fa     	ldp	x26, x25, [sp, #0x20]
 45744d4: a9416ffc     	ldp	x28, x27, [sp, #0x10]
 45744d8: 6cc723e9     	ldp	d9, d8, [sp], #0x70
 45744dc: 1400118c     	b	0x4578b0c <_ChromeMain+0x4573870>
