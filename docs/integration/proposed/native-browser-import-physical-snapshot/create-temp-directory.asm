
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 30890d0: d102c3ff     	sub	sp, sp, #0xb0
 30890d4: a90857f6     	stp	x22, x21, [sp, #0x80]
 30890d8: a9094ff4     	stp	x20, x19, [sp, #0x90]
 30890dc: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 30890e0: 910283fd     	add	x29, sp, #0xa0
 30890e4: aa0203f3     	mov	x19, x2
 30890e8: aa0103f4     	mov	x20, x1
 30890ec: aa0003f5     	mov	x21, x0
 30890f0: f0057ce8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 30890f4: f940f908     	ldr	x8, [x8, #0x1f0]
 30890f8: f9400108     	ldr	x8, [x8]
 30890fc: f81d83a8     	stur	x8, [x29, #-0x28]
 3089100: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 3089104: f90017ff     	str	xzr, [sp, #0x28]
 3089108: 910063e0     	add	x0, sp, #0x18
 308910c: 97d31f6f     	bl	0x2550ec8 <_ChromeMain+0x254bc2c>
 3089110: 34000860     	cbz	w0, 0x308921c <_ChromeMain+0x3083f80>
 3089114: a904d3f5     	stp	x21, x20, [sp, #0x48]
 3089118: 90053ae8     	adrp	x8, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 308911c: 91299108     	add	x8, x8, #0xa64
 3089120: b0053b49     	adrp	x9, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 3089124: 9130a529     	add	x9, x9, #0xc29
 3089128: f100029f     	cmp	x20, #0x0
 308912c: 9a881128     	csel	x8, x9, x8, ne
 3089130: 1a9f07e9     	cset	w9, ne
 3089134: a905a7e8     	stp	x8, x9, [sp, #0x58]
 3089138: b0055708     	adrp	x8, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 308913c: 91348508     	add	x8, x8, #0xd21
 3089140: 528000c9     	mov	w9, #0x6                ; =6
 3089144: a906a7e8     	stp	x8, x9, [sp, #0x68]
 3089148: 9100c3f4     	add	x20, sp, #0x30
 308914c: 9100c3e8     	add	x8, sp, #0x30
 3089150: 910123e0     	add	x0, sp, #0x48
 3089154: 52800061     	mov	w1, #0x3                ; =3
 3089158: 9757867f     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 308915c: 39811fe8     	ldrsb	x8, [sp, #0x47]
 3089160: a9432be9     	ldp	x9, x10, [sp, #0x30]
 3089164: f100011f     	cmp	x8, #0x0
 3089168: 9a944120     	csel	x0, x9, x20, mi
 308916c: 7100011f     	cmp	w8, #0x0
 3089170: 9a884141     	csel	x1, x10, x8, mi
 3089174: 910003e8     	mov	x8, sp
 3089178: 52800002     	mov	w2, #0x0                ; =0
 308917c: 97bfc521     	bl	0x207a600 <_ChromeMain+0x2075364>
 3089180: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 3089184: 37f802c8     	tbnz	w8, #0x1f, 0x30891dc <_ChromeMain+0x3083f40>
 3089188: 910063e0     	add	x0, sp, #0x18
 308918c: 910003e1     	mov	x1, sp
 3089190: aa1303e2     	mov	x2, x19
 3089194: 940000ab     	bl	0x3089440 <_ChromeMain+0x30841a4>
 3089198: aa0003f3     	mov	x19, x0
 308919c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 30891a0: 37f80328     	tbnz	w8, #0x1f, 0x3089204 <_ChromeMain+0x3083f68>
 30891a4: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 30891a8: 37f80248     	tbnz	w8, #0x1f, 0x30891f0 <_ChromeMain+0x3083f54>
 30891ac: f85d83a8     	ldur	x8, [x29, #-0x28]
 30891b0: f0057ce9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 30891b4: f940f929     	ldr	x9, [x9, #0x1f0]
 30891b8: f9400129     	ldr	x9, [x9]
 30891bc: eb08013f     	cmp	x9, x8
 30891c0: 540002c1     	b.ne	0x3089218 <_ChromeMain+0x3083f7c>
 30891c4: aa1303e0     	mov	x0, x19
 30891c8: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 30891cc: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 30891d0: a94857f6     	ldp	x22, x21, [sp, #0x80]
 30891d4: 9102c3ff     	add	sp, sp, #0xb0
 30891d8: d65f03c0     	ret
 30891dc: f9401be0     	ldr	x0, [sp, #0x30]
 30891e0: f94023e8     	ldr	x8, [sp, #0x40]
 30891e4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 30891e8: 973dff34     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 30891ec: 17ffffe7     	b	0x3089188 <_ChromeMain+0x3083eec>
 30891f0: f9400fe0     	ldr	x0, [sp, #0x18]
 30891f4: f94017e8     	ldr	x8, [sp, #0x28]
 30891f8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 30891fc: 973dff2f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3089200: 17ffffeb     	b	0x30891ac <_ChromeMain+0x3083f10>
 3089204: f94003e0     	ldr	x0, [sp]
 3089208: f9400be8     	ldr	x8, [sp, #0x10]
 308920c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 3089210: 973dff2a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3089214: 17ffffe4     	b	0x30891a4 <_ChromeMain+0x3083f08>
 3089218: 953dec52     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 308921c: 52800013     	mov	w19, #0x0               ; =0
 3089220: 17ffffe1     	b	0x30891a4 <_ChromeMain+0x3083f08>
