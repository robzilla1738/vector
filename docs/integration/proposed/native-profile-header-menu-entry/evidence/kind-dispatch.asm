
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
