
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1ae39c0: d101c3ff     	sub	sp, sp, #0x70
 1ae39c4: a9016ffc     	stp	x28, x27, [sp, #0x10]
 1ae39c8: a90267fa     	stp	x26, x25, [sp, #0x20]
 1ae39cc: a9035ff8     	stp	x24, x23, [sp, #0x30]
 1ae39d0: a90457f6     	stp	x22, x21, [sp, #0x40]
 1ae39d4: a9054ff4     	stp	x20, x19, [sp, #0x50]
 1ae39d8: a9067bfd     	stp	x29, x30, [sp, #0x60]
 1ae39dc: 910183fd     	add	x29, sp, #0x60
 1ae39e0: aa0203f5     	mov	x21, x2
 1ae39e4: aa0103f6     	mov	x22, x1
 1ae39e8: a9406017     	ldp	x23, x24, [x0]
 1ae39ec: f90007e0     	str	x0, [sp, #0x8]
 1ae39f0: d37beb08     	lsl	x8, x24, #5
 1ae39f4: b4000868     	cbz	x8, 0x1ae3b00 <_ChromeMain+0x1ade864>
 1ae39f8: 9345fd19     	asr	x25, x8, #5
 1ae39fc: 1280001a     	mov	w26, #-0x1              ; =-1
 1ae3a00: aa1703f4     	mov	x20, x23
 1ae3a04: d341ff3b     	lsr	x27, x25, #1
 1ae3a08: 8b1b169c     	add	x28, x20, x27, lsl #5
 1ae3a0c: 39805f88     	ldrsb	x8, [x28, #0x17]
 1ae3a10: a9402b89     	ldp	x9, x10, [x28]
 1ae3a14: f100011f     	cmp	x8, #0x0
 1ae3a18: 9a9c4121     	csel	x1, x9, x28, mi
 1ae3a1c: 7100011f     	cmp	w8, #0x0
 1ae3a20: 9a884153     	csel	x19, x10, x8, mi
 1ae3a24: eb15027f     	cmp	x19, x21
 1ae3a28: 9a953262     	csel	x2, x19, x21, lo
 1ae3a2c: aa1603e0     	mov	x0, x22
 1ae3a30: 9594978c     	bl	0x8009860 <_ChromeMain+0x80045c4>
 1ae3a34: eb1302bf     	cmp	x21, x19
 1ae3a38: 5a9a3748     	cneg	w8, w26, hs
 1ae3a3c: 1a8803e8     	csel	w8, wzr, w8, eq
 1ae3a40: 7100001f     	cmp	w0, #0x0
 1ae3a44: 1a881008     	csel	w8, w0, w8, ne
 1ae3a48: 91008389     	add	x9, x28, #0x20
 1ae3a4c: aa3b03ea     	mvn	x10, x27
 1ae3a50: 8b0a032a     	add	x10, x25, x10
 1ae3a54: 7100011f     	cmp	w8, #0x0
 1ae3a58: 9a9bc159     	csel	x25, x10, x27, gt
 1ae3a5c: 9a94c134     	csel	x20, x9, x20, gt
 1ae3a60: b5fffd39     	cbnz	x25, 0x1ae3a04 <_ChromeMain+0x1ade768>
 1ae3a64: 8b1816e8     	add	x8, x23, x24, lsl #5
 1ae3a68: eb08029f     	cmp	x20, x8
 1ae3a6c: 54000440     	b.eq	0x1ae3af4 <_ChromeMain+0x1ade858>
 1ae3a70: 39805e88     	ldrsb	x8, [x20, #0x17]
 1ae3a74: a9402a89     	ldp	x9, x10, [x20]
 1ae3a78: f100011f     	cmp	x8, #0x0
 1ae3a7c: 9a944121     	csel	x1, x9, x20, mi
 1ae3a80: 7100011f     	cmp	w8, #0x0
 1ae3a84: 9a884157     	csel	x23, x10, x8, mi
 1ae3a88: eb1502ff     	cmp	x23, x21
 1ae3a8c: 9a9532e2     	csel	x2, x23, x21, lo
 1ae3a90: aa1603e0     	mov	x0, x22
 1ae3a94: 95949773     	bl	0x8009860 <_ChromeMain+0x80045c4>
 1ae3a98: 34000240     	cbz	w0, 0x1ae3ae0 <_ChromeMain+0x1ade844>
 1ae3a9c: f94007e8     	ldr	x8, [sp, #0x8]
 1ae3aa0: 36f80260     	tbz	w0, #0x1f, 0x1ae3aec <_ChromeMain+0x1ade850>
 1ae3aa4: aa1403f5     	mov	x21, x20
 1ae3aa8: aa0803e0     	mov	x0, x8
 1ae3aac: aa1403e1     	mov	x1, x20
 1ae3ab0: aa1503e2     	mov	x2, x21
 1ae3ab4: 94000023     	bl	0x1ae3b40 <_ChromeMain+0x1ade8a4>
 1ae3ab8: eb1402bf     	cmp	x21, x20
 1ae3abc: 1a9f07e0     	cset	w0, ne
 1ae3ac0: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 1ae3ac4: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 1ae3ac8: a94457f6     	ldp	x22, x21, [sp, #0x40]
 1ae3acc: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 1ae3ad0: a94267fa     	ldp	x26, x25, [sp, #0x20]
 1ae3ad4: a9416ffc     	ldp	x28, x27, [sp, #0x10]
 1ae3ad8: 9101c3ff     	add	sp, sp, #0x70
 1ae3adc: d65f03c0     	ret
 1ae3ae0: eb1702bf     	cmp	x21, x23
 1ae3ae4: f94007e8     	ldr	x8, [sp, #0x8]
 1ae3ae8: 54fffde3     	b.lo	0x1ae3aa4 <_ChromeMain+0x1ade808>
 1ae3aec: 91008295     	add	x21, x20, #0x20
 1ae3af0: 17ffffee     	b	0x1ae3aa8 <_ChromeMain+0x1ade80c>
 1ae3af4: aa1403f5     	mov	x21, x20
 1ae3af8: f94007e8     	ldr	x8, [sp, #0x8]
 1ae3afc: 17ffffeb     	b	0x1ae3aa8 <_ChromeMain+0x1ade80c>
 1ae3b00: aa1703f4     	mov	x20, x23
 1ae3b04: 17ffffd8     	b	0x1ae3a64 <_ChromeMain+0x1ade7c8>
 1ae3b08: d503201f     	nop
 1ae3b0c: d503201f     	nop
 1ae3b10: d503201f     	nop
 1ae3b14: d503201f     	nop
 1ae3b18: d503201f     	nop
 1ae3b1c: d503201f     	nop
 1ae3b20: d503201f     	nop
 1ae3b24: d503201f     	nop
 1ae3b28: d503201f     	nop
 1ae3b2c: d503201f     	nop
 1ae3b30: d503201f     	nop
 1ae3b34: d503201f     	nop
 1ae3b38: d503201f     	nop
 1ae3b3c: d503201f     	nop
