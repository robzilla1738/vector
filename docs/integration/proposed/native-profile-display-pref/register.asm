
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 34e4014: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 34e4018: f9000fff     	str	xzr, [sp, #0x18]
 34e401c: 910083e0     	add	x0, sp, #0x20
 34e4020: 910023e1     	add	x1, sp, #0x8
 34e4024: d2800002     	mov	x2, #0x0                ; =0
 34e4028: 975be6d6     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e402c: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4030: 91136821     	add	x1, x1, #0x4da
 34e4034: 910083e3     	add	x3, sp, #0x20
 34e4038: aa1303e0     	mov	x0, x19
 34e403c: 52800342     	mov	w2, #0x1a               ; =26
 34e4040: 52800004     	mov	w4, #0x0                ; =0
 34e4044: 52800005     	mov	w5, #0x0                ; =0
 34e4048: 975be702     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e404c: 910083e0     	add	x0, sp, #0x20
 34e4050: 9784e9e1     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4054: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 34e4058: 36f800a8     	tbz	w8, #0x1f, 0x34e406c <_ChromeMain+0x34dedd0>
 34e405c: f94007e0     	ldr	x0, [sp, #0x8]
 34e4060: f9400fe8     	ldr	x8, [sp, #0x18]
 34e4064: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 34e4068: 972c9394     	bl	0x8eb8 <_ChromeMain+0x3c1c>
