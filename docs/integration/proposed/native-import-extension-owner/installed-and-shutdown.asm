
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425f5a8: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 425f5ac: a9015ff8     	stp	x24, x23, [sp, #0x10]
 425f5b0: a90257f6     	stp	x22, x21, [sp, #0x20]
 425f5b4: a9034ff4     	stp	x20, x19, [sp, #0x30]
 425f5b8: a9047bfd     	stp	x29, x30, [sp, #0x40]
 425f5bc: 910103fd     	add	x29, sp, #0x40
 425f5c0: f9400415     	ldr	x21, [x0, #0x8]
 425f5c4: eb0102bf     	cmp	x21, x1
 425f5c8: fa400844     	ccmp	x2, #0x0, #0x4, eq
 425f5cc: 540003a0     	b.eq	0x425f640 <_ChromeMain+0x425a3a4>
 425f5d0: aa0003f4     	mov	x20, x0
 425f5d4: aa0003f7     	mov	x23, x0
 425f5d8: f8418ef8     	ldr	x24, [x23, #0x18]!
 425f5dc: b4000338     	cbz	x24, 0x425f640 <_ChromeMain+0x425a3a4>
 425f5e0: aa0203f3     	mov	x19, x2
 425f5e4: f9411448     	ldr	x8, [x2, #0x228]
 425f5e8: 39805d09     	ldrsb	x9, [x8, #0x17]
 425f5ec: a9402d0a     	ldp	x10, x11, [x8]
 425f5f0: f100013f     	cmp	x9, #0x0
 425f5f4: 9a884156     	csel	x22, x10, x8, mi
 425f5f8: 7100013f     	cmp	w9, #0x0
 425f5fc: 9a894179     	csel	x25, x11, x9, mi
 425f600: aa1803e8     	mov	x8, x24
 425f604: f8420d09     	ldr	x9, [x8, #0x20]!
 425f608: 39805d0a     	ldrsb	x10, [x8, #0x17]
 425f60c: f100015f     	cmp	x10, #0x0
 425f610: 9a884121     	csel	x1, x9, x8, mi
 425f614: f9400508     	ldr	x8, [x8, #0x8]
 425f618: 7100015f     	cmp	w10, #0x0
 425f61c: 9a8a411a     	csel	x26, x8, x10, mi
 425f620: eb19035f     	cmp	x26, x25
 425f624: 9a993342     	csel	x2, x26, x25, lo
 425f628: aa1603e0     	mov	x0, x22
 425f62c: 94f6a88d     	bl	0x8009860 <_ChromeMain+0x80045c4>
 425f630: 340001c0     	cbz	w0, 0x425f668 <_ChromeMain+0x425a3cc>
 425f634: 37f80140     	tbnz	w0, #0x1f, 0x425f65c <_ChromeMain+0x425a3c0>
 425f638: f9400718     	ldr	x24, [x24, #0x8]
 425f63c: b5fffe38     	cbnz	x24, 0x425f600 <_ChromeMain+0x425a364>
 425f640: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 425f644: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 425f648: a94257f6     	ldp	x22, x21, [sp, #0x20]
 425f64c: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 425f650: a8c567fa     	ldp	x26, x25, [sp], #0x50
 425f654: d65f03c0     	ret
 425f658: 54ffff02     	b.hs	0x425f638 <_ChromeMain+0x425a39c>
 425f65c: f9400318     	ldr	x24, [x24]
 425f660: b5fffd18     	cbnz	x24, 0x425f600 <_ChromeMain+0x425a364>
 425f664: 17fffff7     	b	0x425f640 <_ChromeMain+0x425a3a4>
 425f668: eb1a033f     	cmp	x25, x26
 425f66c: 54ffff61     	b.ne	0x425f658 <_ChromeMain+0x425a3bc>
 425f670: eb17031f     	cmp	x24, x23
 425f674: 54fffe60     	b.eq	0x425f640 <_ChromeMain+0x425a3a4>
 425f678: 975b1c19     	bl	0x19266dc <_ChromeMain+0x1921440>
 425f67c: aa1503e0     	mov	x0, x21
 425f680: 975b1c6c     	bl	0x1926830 <_ChromeMain+0x1921594>
 425f684: b4fffde0     	cbz	x0, 0x425f640 <_ChromeMain+0x425a3a4>
 425f688: f9411661     	ldr	x1, [x19, #0x228]
 425f68c: 52800042     	mov	w2, #0x2                ; =2
 425f690: 94a8929f     	bl	0x6c8410c <_ChromeMain+0x6c7ee70>
 425f694: 34fffd60     	cbz	w0, 0x425f640 <_ChromeMain+0x425a3a4>
 425f698: f9400694     	ldr	x20, [x20, #0x8]
 425f69c: 977ea4f6     	bl	0x2208a74 <_ChromeMain+0x22037d8>
 425f6a0: aa1403e1     	mov	x1, x20
 425f6a4: 52800022     	mov	w2, #0x1                ; =1
 425f6a8: 96f7cdbb     	bl	0x52d94 <_ChromeMain+0x4daf8>
 425f6ac: b4fffca0     	cbz	x0, 0x425f640 <_ChromeMain+0x425a3a4>
 425f6b0: aa1303e1     	mov	x1, x19
 425f6b4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 425f6b8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 425f6bc: a94257f6     	ldp	x22, x21, [sp, #0x20]
 425f6c0: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 425f6c4: a8c567fa     	ldp	x26, x25, [sp], #0x50
 425f6c8: 14a8ab96     	b	0x6c8a520 <_ChromeMain+0x6c85284>
 425f6cc: d10103ff     	sub	sp, sp, #0x40
 425f6d0: a90157f6     	stp	x22, x21, [sp, #0x10]
 425f6d4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 425f6d8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 425f6dc: 9100c3fd     	add	x29, sp, #0x30
 425f6e0: aa0003f3     	mov	x19, x0
 425f6e4: f9401814     	ldr	x20, [x0, #0x30]
 425f6e8: f0054a95     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 425f6ec: b4000174     	cbz	x20, 0x425f718 <_ChromeMain+0x425a47c>
 425f6f0: f9001a7f     	str	xzr, [x19, #0x30]
 425f6f4: f9401661     	ldr	x1, [x19, #0x28]
 425f6f8: 91026280     	add	x0, x20, #0x98
 425f6fc: 9756e81f     	bl	0x1819778 <_ChromeMain+0x18144dc>
 425f700: 925e7688     	and	x8, x20, #0xfffffffc00000000
 425f704: f94046a9     	ldr	x9, [x21, #0x88]
 425f708: eb09011f     	cmp	x8, x9
 425f70c: 54000061     	b.ne	0x425f718 <_ChromeMain+0x425a47c>
 425f710: aa1403e0     	mov	x0, x20
 425f714: 96f70cca     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 425f718: b4000293     	cbz	x19, 0x425f768 <_ChromeMain+0x425a4cc>
 425f71c: f0050028     	adrp	x8, 0xe266000 <dyld_stub_binder+0xe266000>
 425f720: 9134a108     	add	x8, x8, #0xd28
 425f724: f9000268     	str	x8, [x19]
 425f728: 9100a260     	add	x0, x19, #0x28
 425f72c: 97570ca7     	bl	0x18229c8 <_ChromeMain+0x181d72c>
 425f730: 91004268     	add	x8, x19, #0x10
 425f734: f9400e61     	ldr	x1, [x19, #0x18]
 425f738: f90007e8     	str	x8, [sp, #0x8]
 425f73c: 910023e0     	add	x0, sp, #0x8
 425f740: 971304db     	bl	0x720aac <_ChromeMain+0x71b810>
