
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4263ddc: d10203ff     	sub	sp, sp, #0x80
 4263de0: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4263de4: a90557f6     	stp	x22, x21, [sp, #0x50]
 4263de8: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4263dec: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4263df0: 9101c3fd     	add	x29, sp, #0x70
 4263df4: aa0003f6     	mov	x22, x0
 4263df8: b4000863     	cbz	x3, 0x4263f04 <_ChromeMain+0x425ec68>
 4263dfc: aa0303f3     	mov	x19, x3
 4263e00: aa0203f4     	mov	x20, x2
 4263e04: aa0103f5     	mov	x21, x1
 4263e08: f9400068     	ldr	x8, [x3]
 4263e0c: f940b508     	ldr	x8, [x8, #0x168]
 4263e10: aa0303e0     	mov	x0, x3
 4263e14: d63f0100     	blr	x8
 4263e18: aa0003f7     	mov	x23, x0
 4263e1c: 39829ec1     	ldrsb	x1, [x22, #0xa7]
 4263e20: b7f806e1     	tbnz	x1, #0x3f, 0x4263efc <_ChromeMain+0x425ec60>
 4263e24: 910242c0     	add	x0, x22, #0x90
 4263e28: 910023f8     	add	x24, sp, #0x8
 4263e2c: 910023e8     	add	x8, sp, #0x8
 4263e30: 9734fbb6     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4263e34: 39807fe8     	ldrsb	x8, [sp, #0x1f]
 4263e38: a940abe9     	ldp	x9, x10, [sp, #0x8]
 4263e3c: f100011f     	cmp	x8, #0x0
 4263e40: 9a984121     	csel	x1, x9, x24, mi
 4263e44: 7100011f     	cmp	w8, #0x0
 4263e48: 9a884142     	csel	x2, x10, x8, mi
 4263e4c: 910083e0     	add	x0, sp, #0x20
 4263e50: 9725e74c     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 4263e54: b00463a1     	adrp	x1, 0xced8000 <dyld_stub_binder+0xced8000>
 4263e58: 913d4021     	add	x1, x1, #0xf50
 4263e5c: 910083e3     	add	x3, sp, #0x20
 4263e60: aa1703e0     	mov	x0, x23
 4263e64: 52800182     	mov	w2, #0xc                ; =12
 4263e68: 974a9690     	bl	0x15098a8 <_ChromeMain+0x150460c>
 4263e6c: 910083e0     	add	x0, sp, #0x20
 4263e70: 974eea59     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 4263e74: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4263e78: 36f800a8     	tbz	w8, #0x1f, 0x4263e8c <_ChromeMain+0x425ebf0>
 4263e7c: f94007e0     	ldr	x0, [sp, #0x8]
 4263e80: f9400fe8     	ldr	x8, [sp, #0x18]
 4263e84: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4263e88: 96f6940c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4263e8c: f0056408     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4263e90: f9467d00     	ldr	x0, [x8, #0xcf8]
 4263e94: 975eef39     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4263e98: 975eef5e     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4263e9c: aa0003f7     	mov	x23, x0
 4263ea0: f9400268     	ldr	x8, [x19]
 4263ea4: f9401909     	ldr	x9, [x8, #0x30]
 4263ea8: 910083e8     	add	x8, sp, #0x20
 4263eac: aa1303e0     	mov	x0, x19
 4263eb0: d63f0120     	blr	x9
 4263eb4: 910083e1     	add	x1, sp, #0x20
 4263eb8: aa1703e0     	mov	x0, x23
 4263ebc: 975eef91     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4263ec0: aa0003f7     	mov	x23, x0
 4263ec4: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4263ec8: 37f802c8     	tbnz	w8, #0x1f, 0x4263f20 <_ChromeMain+0x425ec84>
 4263ecc: b5000357     	cbnz	x23, 0x4263f34 <_ChromeMain+0x425ec98>
 4263ed0: aa1603e0     	mov	x0, x22
 4263ed4: aa1503e1     	mov	x1, x21
 4263ed8: aa1403e2     	mov	x2, x20
 4263edc: aa1303e3     	mov	x3, x19
 4263ee0: 97fffee2     	bl	0x4263a68 <_ChromeMain+0x425e7cc>
 4263ee4: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4263ee8: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4263eec: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4263ef0: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4263ef4: 910203ff     	add	sp, sp, #0x80
 4263ef8: d65f03c0     	ret
 4263efc: a94906c0     	ldp	x0, x1, [x22, #0x90]
 4263f00: 17ffffca     	b	0x4263e28 <_ChromeMain+0x425eb8c>
 4263f04: aa1603e0     	mov	x0, x22
 4263f08: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4263f0c: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4263f10: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4263f14: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4263f18: 910203ff     	add	sp, sp, #0x80
 4263f1c: 17fffe49     	b	0x4263840 <_ChromeMain+0x425e5a4>
 4263f20: f94013e0     	ldr	x0, [sp, #0x20]
 4263f24: f9401be8     	ldr	x8, [sp, #0x30]
 4263f28: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4263f2c: 96f693e3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4263f30: b4fffd17     	cbz	x23, 0x4263ed0 <_ChromeMain+0x425ec34>
 4263f34: 910242c1     	add	x1, x22, #0x90
 4263f38: aa1703e0     	mov	x0, x23
 4263f3c: 52800002     	mov	w2, #0x0                ; =0
 4263f40: 94e1a1a9     	bl	0x7acc5e4 <_ChromeMain+0x7ac7348>
 4263f44: 17ffffe3     	b	0x4263ed0 <_ChromeMain+0x425ec34>
