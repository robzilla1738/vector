
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  2bf030: d10143ff     	sub	sp, sp, #0x50
  2bf034: a9015ff8     	stp	x24, x23, [sp, #0x10]
  2bf038: a90257f6     	stp	x22, x21, [sp, #0x20]
  2bf03c: a9034ff4     	stp	x20, x19, [sp, #0x30]
  2bf040: a9047bfd     	stp	x29, x30, [sp, #0x40]
  2bf044: 910103fd     	add	x29, sp, #0x40
  2bf048: f9401800     	ldr	x0, [x0, #0x30]
  2bf04c: f9400008     	ldr	x8, [x0]
  2bf050: f940b508     	ldr	x8, [x8, #0x168]
  2bf054: d63f0100     	blr	x8
  2bf058: f00660e1     	adrp	x1, 0xcede000 <dyld_stub_binder+0xcede000>
  2bf05c: 91248c21     	add	x1, x1, #0x923
  2bf060: 52800402     	mov	w2, #0x20               ; =32
  2bf064: 9407f6fa     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
  2bf068: b40005a0     	cbz	x0, 0x2bf11c <_ChromeMain+0x2b9e80>
  2bf06c: aa0003e8     	mov	x8, x0
  2bf070: f9401009     	ldr	x9, [x0, #0x20]
  2bf074: b4000789     	cbz	x9, 0x2bf164 <_ChromeMain+0x2b9ec8>
  2bf078: f9400929     	ldr	x9, [x9, #0x10]
  2bf07c: f90007ff     	str	xzr, [sp, #0x8]
  2bf080: f9401520     	ldr	x0, [x9, #0x28]
  2bf084: b40004a0     	cbz	x0, 0x2bf118 <_ChromeMain+0x2b9e7c>
  2bf088: 39805d09     	ldrsb	x9, [x8, #0x17]
  2bf08c: a9402d0a     	ldp	x10, x11, [x8]
  2bf090: f100013f     	cmp	x9, #0x0
  2bf094: 9a884153     	csel	x19, x10, x8, mi
  2bf098: 7100013f     	cmp	w9, #0x0
  2bf09c: 9a894174     	csel	x20, x11, x9, mi
  2bf0a0: f9400008     	ldr	x8, [x0]
  2bf0a4: f9401108     	ldr	x8, [x8, #0x20]
  2bf0a8: b0ffef29     	adrp	x9, 0xa4000 <_ChromeMain+0x9ed64>
  2bf0ac: 91177129     	add	x9, x9, #0x5dc
  2bf0b0: eb09011f     	cmp	x8, x9
  2bf0b4: 540004c1     	b.ne	0x2bf14c <_ChromeMain+0x2b9eb0>
  2bf0b8: f9402415     	ldr	x21, [x0, #0x48]
  2bf0bc: b40002f5     	cbz	x21, 0x2bf118 <_ChromeMain+0x2b9e7c>
  2bf0c0: f8410eb6     	ldr	x22, [x21, #0x10]!
  2bf0c4: b40002b6     	cbz	x22, 0x2bf118 <_ChromeMain+0x2b9e7c>
  2bf0c8: 14000004     	b	0x2bf0d8 <_ChromeMain+0x2b9e3c>
  2bf0cc: 54000223     	b.lo	0x2bf110 <_ChromeMain+0x2b9e74>
  2bf0d0: f94006d6     	ldr	x22, [x22, #0x8]
  2bf0d4: b4000236     	cbz	x22, 0x2bf118 <_ChromeMain+0x2b9e7c>
  2bf0d8: aa1603e8     	mov	x8, x22
  2bf0dc: f8420d09     	ldr	x9, [x8, #0x20]!
  2bf0e0: 39805d0a     	ldrsb	x10, [x8, #0x17]
  2bf0e4: f100015f     	cmp	x10, #0x0
  2bf0e8: 9a884121     	csel	x1, x9, x8, mi
  2bf0ec: f9400508     	ldr	x8, [x8, #0x8]
  2bf0f0: 7100015f     	cmp	w10, #0x0
  2bf0f4: 9a8a4117     	csel	x23, x8, x10, mi
  2bf0f8: eb1402ff     	cmp	x23, x20
  2bf0fc: 9a9432e2     	csel	x2, x23, x20, lo
  2bf100: aa1303e0     	mov	x0, x19
  2bf104: 95f529d7     	bl	0x8009860 <_ChromeMain+0x80045c4>
  2bf108: 34000160     	cbz	w0, 0x2bf134 <_ChromeMain+0x2b9e98>
  2bf10c: 36fffe20     	tbz	w0, #0x1f, 0x2bf0d0 <_ChromeMain+0x2b9e34>
  2bf110: f94002d6     	ldr	x22, [x22]
  2bf114: b5fffe36     	cbnz	x22, 0x2bf0d8 <_ChromeMain+0x2b9e3c>
  2bf118: 52800000     	mov	w0, #0x0                ; =0
  2bf11c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
  2bf120: a9434ff4     	ldp	x20, x19, [sp, #0x30]
  2bf124: a94257f6     	ldp	x22, x21, [sp, #0x20]
  2bf128: a9415ff8     	ldp	x24, x23, [sp, #0x10]
