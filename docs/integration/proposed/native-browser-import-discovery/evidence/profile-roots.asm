
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42600fc: d10483ff     	sub	sp, sp, #0x120
 4260100: a90f6ffc     	stp	x28, x27, [sp, #0xf0]
 4260104: a9104ff4     	stp	x20, x19, [sp, #0x100]
 4260108: a9117bfd     	stp	x29, x30, [sp, #0x110]
 426010c: 910443fd     	add	x29, sp, #0x110
 4260110: aa0003f4     	mov	x20, x0
 4260114: aa0803f3     	mov	x19, x8
 4260118: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 426011c: f9002fff     	str	xzr, [sp, #0x58]
 4260120: 910123e1     	add	x1, sp, #0x48
 4260124: 528000e0     	mov	w0, #0x7                ; =7
 4260128: 9772a113     	bl	0x1f08574 <_ChromeMain+0x1f032d8>
 426012c: 36000b60     	tbz	w0, #0x0, 0x4260298 <_ChromeMain+0x425affc>
 4260130: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 4260134: f90023ff     	str	xzr, [sp, #0x40]
 4260138: 9004c1a1     	adrp	x1, 0xda94000 <dyld_stub_binder+0xda94000>
 426013c: 91180021     	add	x1, x1, #0x600
 4260140: d10183a8     	sub	x8, x29, #0x60
 4260144: 910123e0     	add	x0, sp, #0x48
 4260148: 528000e2     	mov	w2, #0x7                ; =7
 426014c: 9750e4b2     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260150: b004c1a1     	adrp	x1, 0xda95000 <dyld_stub_binder+0xda95000>
 4260154: 91006421     	add	x1, x1, #0x19
 4260158: 9100c3e8     	add	x8, sp, #0x30
 426015c: d10183a0     	sub	x0, x29, #0x60
 4260160: 52800262     	mov	w2, #0x13               ; =19
 4260164: 9750e4ac     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260168: 38db73a8     	ldursb	w8, [x29, #-0x49]
 426016c: 37f801e8     	tbnz	w8, #0x1f, 0x42601a8 <_ChromeMain+0x425af0c>
 4260170: 71000e9f     	cmp	w20, #0x3
 4260174: 5400032d     	b.le	0x42601d8 <_ChromeMain+0x425af3c>
 4260178: 7100169f     	cmp	w20, #0x5
 426017c: 5400020d     	b.le	0x42601bc <_ChromeMain+0x425af20>
 4260180: 71001a9f     	cmp	w20, #0x6
 4260184: 540005a0     	b.eq	0x4260238 <_ChromeMain+0x425af9c>
 4260188: 71001e9f     	cmp	w20, #0x7
 426018c: 54000561     	b.ne	0x4260238 <_ChromeMain+0x425af9c>
 4260190: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260194: 912a8821     	add	x1, x1, #0xaa2
 4260198: 9100c3e0     	add	x0, sp, #0x30
 426019c: aa1303e8     	mov	x8, x19
 42601a0: 52800202     	mov	w2, #0x10               ; =16
 42601a4: 14000023     	b	0x4260230 <_ChromeMain+0x425af94>
 42601a8: f85a03a0     	ldur	x0, [x29, #-0x60]
 42601ac: f85b03a8     	ldur	x8, [x29, #-0x50]
 42601b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42601b4: 96f6a341     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42601b8: 17ffffee     	b	0x4260170 <_ChromeMain+0x425aed4>
 42601bc: 7100129f     	cmp	w20, #0x4
 42601c0: 540002e0     	b.eq	0x426021c <_ChromeMain+0x425af80>
 42601c4: 7100169f     	cmp	w20, #0x5
 42601c8: 54000381     	b.ne	0x4260238 <_ChromeMain+0x425af9c>
 42601cc: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42601d0: 912a7821     	add	x1, x1, #0xa9e
 42601d4: 1400001e     	b	0x426024c <_ChromeMain+0x425afb0>
 42601d8: 7100069f     	cmp	w20, #0x1
 42601dc: 54000ecc     	b.gt	0x42603b4 <_ChromeMain+0x425b118>
 42601e0: 34000334     	cbz	w20, 0x4260244 <_ChromeMain+0x425afa8>
 42601e4: 7100069f     	cmp	w20, #0x1
 42601e8: 54000281     	b.ne	0x4260238 <_ChromeMain+0x425af9c>
 42601ec: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42601f0: 91299021     	add	x1, x1, #0xa64
 42601f4: d10183a8     	sub	x8, x29, #0x60
 42601f8: 9100c3e0     	add	x0, sp, #0x30
 42601fc: 528001a2     	mov	w2, #0xd                ; =13
 4260200: 9750e485     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260204: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260208: 9129c821     	add	x1, x1, #0xa72
 426020c: d10183a0     	sub	x0, x29, #0x60
 4260210: aa1303e8     	mov	x8, x19
 4260214: 528001a2     	mov	w2, #0xd                ; =13
 4260218: 14000016     	b	0x4260270 <_ChromeMain+0x425afd4>
 426021c: b004c1c1     	adrp	x1, 0xda99000 <dyld_stub_binder+0xda99000>
 4260220: 911e9c21     	add	x1, x1, #0x7a7
 4260224: 9100c3e0     	add	x0, sp, #0x30
 4260228: aa1303e8     	mov	x8, x19
 426022c: 528000a2     	mov	w2, #0x5                ; =5
 4260230: 9750e479     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260234: 14000012     	b	0x426027c <_ChromeMain+0x425afe0>
 4260238: a9007e7f     	stp	xzr, xzr, [x19]
 426023c: f9000a7f     	str	xzr, [x19, #0x10]
 4260240: 1400000f     	b	0x426027c <_ChromeMain+0x425afe0>
 4260244: 9004be41     	adrp	x1, 0xda28000 <dyld_stub_binder+0xda28000>
 4260248: 91121821     	add	x1, x1, #0x486
 426024c: d10183a8     	sub	x8, x29, #0x60
 4260250: 9100c3e0     	add	x0, sp, #0x30
 4260254: 52800062     	mov	w2, #0x3                ; =3
 4260258: 9750e46f     	bl	0x1699414 <_ChromeMain+0x1694178>
 426025c: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260260: 91296821     	add	x1, x1, #0xa5a
 4260264: d10183a0     	sub	x0, x29, #0x60
 4260268: aa1303e8     	mov	x8, x19
 426026c: 52800122     	mov	w2, #0x9                ; =9
 4260270: 9750e469     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260274: 38db73a8     	ldursb	w8, [x29, #-0x49]
 4260278: 37f802c8     	tbnz	w8, #0x1f, 0x42602d0 <_ChromeMain+0x425b034>
 426027c: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4260280: 36f80108     	tbz	w8, #0x1f, 0x42602a0 <_ChromeMain+0x425b004>
 4260284: f9401be0     	ldr	x0, [sp, #0x30]
 4260288: f94023e8     	ldr	x8, [sp, #0x40]
 426028c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260290: 96f6a30a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260294: 14000003     	b	0x42602a0 <_ChromeMain+0x425b004>
 4260298: a9007e7f     	stp	xzr, xzr, [x19]
 426029c: f9000a7f     	str	xzr, [x19, #0x10]
 42602a0: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 42602a4: 37f800c8     	tbnz	w8, #0x1f, 0x42602bc <_ChromeMain+0x425b020>
 42602a8: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 42602ac: a9504ff4     	ldp	x20, x19, [sp, #0x100]
 42602b0: a94f6ffc     	ldp	x28, x27, [sp, #0xf0]
 42602b4: 910483ff     	add	sp, sp, #0x120
 42602b8: d65f03c0     	ret
 42602bc: f94027e0     	ldr	x0, [sp, #0x48]
 42602c0: f9402fe8     	ldr	x8, [sp, #0x58]
 42602c4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42602c8: 96f6a2fc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42602cc: 17fffff7     	b	0x42602a8 <_ChromeMain+0x425b00c>
 42602d0: f85a03a0     	ldur	x0, [x29, #-0x60]
 42602d4: f85b03a8     	ldur	x8, [x29, #-0x50]
 42602d8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42602dc: 96f6a2f7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42602e0: 17ffffe7     	b	0x426027c <_ChromeMain+0x425afe0>
 42602e4: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 42602e8: 37f820a8     	tbnz	w8, #0x1f, 0x42606fc <_ChromeMain+0x425b460>
 42602ec: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 42602f0: 37f80148     	tbnz	w8, #0x1f, 0x4260318 <_ChromeMain+0x425b07c>
 42602f4: 3cc183e0     	ldur	q0, [sp, #0x18]
 42602f8: 3d800260     	str	q0, [x19]
 42602fc: f94017e8     	ldr	x8, [sp, #0x28]
 4260300: f9000a68     	str	x8, [x19, #0x10]
 4260304: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4260308: 36fffba8     	tbz	w8, #0x1f, 0x426027c <_ChromeMain+0x425afe0>
 426030c: f9400fe0     	ldr	x0, [sp, #0x18]
 4260310: f94017e8     	ldr	x8, [sp, #0x28]
 4260314: 17fffff1     	b	0x42602d8 <_ChromeMain+0x425b03c>
 4260318: a9418be1     	ldp	x1, x2, [sp, #0x18]
 426031c: aa1303e0     	mov	x0, x19
 4260320: 96f6dfbe     	bl	0x18218 <_ChromeMain+0x12f7c>
 4260324: 17fffff8     	b	0x4260304 <_ChromeMain+0x425b068>
 4260328: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 426032c: 912a0021     	add	x1, x1, #0xa80
 4260330: d10203a8     	sub	x8, x29, #0x80
 4260334: 9100c3e0     	add	x0, sp, #0x30
 4260338: 52800202     	mov	w2, #0x10               ; =16
 426033c: 9750e436     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260340: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260344: 912a4421     	add	x1, x1, #0xa91
 4260348: d10183a8     	sub	x8, x29, #0x60
 426034c: d10203a0     	sub	x0, x29, #0x80
 4260350: 52800182     	mov	w2, #0xc                ; =12
 4260354: 9750e430     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260358: b004ac61     	adrp	x1, 0xd7ed000 <dyld_stub_binder+0xd7ed000>
 426035c: 91053021     	add	x1, x1, #0x14c
 4260360: d10183a0     	sub	x0, x29, #0x60
 4260364: aa1303e8     	mov	x8, x19
 4260368: 52800082     	mov	w2, #0x4                ; =4
 426036c: 9750e42a     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260370: 38db73a8     	ldursb	w8, [x29, #-0x49]
 4260374: 37f800c8     	tbnz	w8, #0x1f, 0x426038c <_ChromeMain+0x425b0f0>
 4260378: 38d973a8     	ldursb	w8, [x29, #-0x69]
 426037c: 36fff808     	tbz	w8, #0x1f, 0x426027c <_ChromeMain+0x425afe0>
 4260380: f85803a0     	ldur	x0, [x29, #-0x80]
 4260384: f85903a8     	ldur	x8, [x29, #-0x70]
 4260388: 17ffffd4     	b	0x42602d8 <_ChromeMain+0x425b03c>
 426038c: f85a03a0     	ldur	x0, [x29, #-0x60]
 4260390: f85b03a8     	ldur	x8, [x29, #-0x50]
 4260394: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260398: 96f6a2c8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426039c: 17fffff7     	b	0x4260378 <_ChromeMain+0x425b0dc>
 42603a0: f85a03a0     	ldur	x0, [x29, #-0x60]
 42603a4: f85b03a8     	ldur	x8, [x29, #-0x50]
 42603a8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42603ac: 96f6a2c3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42603b0: 14000015     	b	0x4260404 <_ChromeMain+0x425b168>
 42603b4: 71000a9f     	cmp	w20, #0x2
 42603b8: 54fffb80     	b.eq	0x4260328 <_ChromeMain+0x425b08c>
 42603bc: 71000e9f     	cmp	w20, #0x3
