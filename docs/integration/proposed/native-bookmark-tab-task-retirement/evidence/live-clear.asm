
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464ef84: d10143ff     	sub	sp, sp, #0x50
 464ef88: a90257f6     	stp	x22, x21, [sp, #0x20]
 464ef8c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 464ef90: a9047bfd     	stp	x29, x30, [sp, #0x40]
 464ef94: 910103fd     	add	x29, sp, #0x40
 464ef98: f9422c08     	ldr	x8, [x0, #0x458]
 464ef9c: b4000368     	cbz	x8, 0x464f008 <_ChromeMain+0x4649d6c>
 464efa0: f9429d15     	ldr	x21, [x8, #0x538]
 464efa4: b4000335     	cbz	x21, 0x464f008 <_ChromeMain+0x4649d6c>
 464efa8: f9402034     	ldr	x20, [x1, #0x40]
 464efac: b40002f4     	cbz	x20, 0x464f008 <_ChromeMain+0x4649d6c>
 464efb0: f94036b3     	ldr	x19, [x21, #0x68]
 464efb4: 9728f887     	bl	0x108d1d0 <_ChromeMain+0x1087f34>
 464efb8: aa1303e1     	mov	x1, x19
 464efbc: 52800022     	mov	w2, #0x1                ; =1
 464efc0: 96e80f75     	bl	0x52d94 <_ChromeMain+0x4daf8>
 464efc4: d1004013     	sub	x19, x0, #0x10
 464efc8: f100001f     	cmp	x0, #0x0
 464efcc: fa401a64     	ccmp	x19, #0x0, #0x4, ne
 464efd0: 540001c0     	b.eq	0x464f008 <_ChromeMain+0x4649d6c>
 464efd4: f00473c1     	adrp	x1, 0xd4c9000 <dyld_stub_binder+0xd4c9000>
 464efd8: 9133d021     	add	x1, x1, #0xcf4
 464efdc: 91002280     	add	x0, x20, #0x8
 464efe0: 96e81064     	bl	0x53170 <_ChromeMain+0x4ded4>
 464efe4: b4000120     	cbz	x0, 0x464f008 <_ChromeMain+0x4649d6c>
 464efe8: d1008008     	sub	x8, x0, #0x20
 464efec: b40000e8     	cbz	x8, 0x464f008 <_ChromeMain+0x4649d6c>
 464eff0: b9405014     	ldr	w20, [x0, #0x50]
 464eff4: 7100069f     	cmp	w20, #0x1
 464eff8: 5400008b     	b.lt	0x464f008 <_ChromeMain+0x4649d6c>
 464effc: b94112a1     	ldr	w1, [x21, #0x110]
 464f000: 7100043f     	cmp	w1, #0x1
 464f004: 540000ca     	b.ge	0x464f01c <_ChromeMain+0x4649d80>
 464f008: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 464f00c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 464f010: a94257f6     	ldp	x22, x21, [sp, #0x20]
 464f014: 910143ff     	add	sp, sp, #0x50
 464f018: d65f03c0     	ret
 464f01c: 52800028     	mov	w8, #0x1                ; =1
 464f020: 39007fe8     	strb	w8, [sp, #0x1f]
 464f024: 910023e8     	add	x8, sp, #0x8
 464f028: b2400109     	orr	x9, x8, #0x1
 464f02c: b0048cca     	adrp	x10, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 464f030: 9118d14a     	add	x10, x10, #0x634
 464f034: eb0a013f     	cmp	x9, x10
 464f038: fa4a8102     	ccmp	x8, x10, #0x2, hi
 464f03c: 540003e9     	b.ls	0x464f0b8 <_ChromeMain+0x4649e1c>
 464f040: 52800608     	mov	w8, #0x30               ; =48
 464f044: 790013e8     	strh	w8, [sp, #0x8]
 464f048: d0048483     	adrp	x3, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 464f04c: 911eb063     	add	x3, x3, #0x7ac
 464f050: 910023e4     	add	x4, sp, #0x8
 464f054: aa1303e0     	mov	x0, x19
 464f058: aa1403e2     	mov	x2, x20
 464f05c: 94d25b8a     	bl	0x7ae5e84 <_ChromeMain+0x7ae0be8>
 464f060: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 464f064: 36f800a8     	tbz	w8, #0x1f, 0x464f078 <_ChromeMain+0x4649ddc>
 464f068: f94007e0     	ldr	x0, [sp, #0x8]
 464f06c: f9400fe8     	ldr	x8, [sp, #0x18]
 464f070: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464f074: 96e6e791     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464f078: b94112a1     	ldr	w1, [x21, #0x110]
 464f07c: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 464f080: f9000fff     	str	xzr, [sp, #0x18]
 464f084: d0048483     	adrp	x3, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 464f088: 911f4063     	add	x3, x3, #0x7d0
 464f08c: 910023e4     	add	x4, sp, #0x8
 464f090: aa1303e0     	mov	x0, x19
 464f094: aa1403e2     	mov	x2, x20
 464f098: 94d25b7b     	bl	0x7ae5e84 <_ChromeMain+0x7ae0be8>
 464f09c: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 464f0a0: 36fffb48     	tbz	w8, #0x1f, 0x464f008 <_ChromeMain+0x4649d6c>
 464f0a4: f94007e0     	ldr	x0, [sp, #0x8]
 464f0a8: f9400fe8     	ldr	x8, [sp, #0x18]
 464f0ac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464f0b0: 96e6e782     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464f0b4: 17ffffd5     	b	0x464f008 <_ChromeMain+0x4649d6c>
 464f0b8: d4200020     	brk	#0x1
