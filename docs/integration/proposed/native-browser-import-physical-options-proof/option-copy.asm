
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 21f17a8: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 21f17ac: a9015ff8     	stp	x24, x23, [sp, #0x10]
 21f17b0: a90257f6     	stp	x22, x21, [sp, #0x20]
 21f17b4: a9034ff4     	stp	x20, x19, [sp, #0x30]
 21f17b8: a9047bfd     	stp	x29, x30, [sp, #0x40]
 21f17bc: 910103fd     	add	x29, sp, #0x40
 21f17c0: d10883ff     	sub	sp, sp, #0x220
 21f17c4: aa0203f4     	mov	x20, x2
 21f17c8: aa0003f3     	mov	x19, x0
 21f17cc: f900001f     	str	xzr, [x0]
 21f17d0: ad400420     	ldp	q0, q1, [x1]
 21f17d4: b9402028     	ldr	w8, [x1, #0x20]
 21f17d8: b9002808     	str	w8, [x0, #0x28]
 21f17dc: 3c818001     	stur	q1, [x0, #0x18]
 21f17e0: 3c808000     	stur	q0, [x0, #0x8]
 21f17e4: f9401428     	ldr	x8, [x1, #0x28]
 21f17e8: f9001808     	str	x8, [x0, #0x30]
 21f17ec: b5000c48     	cbnz	x8, 0x21f1974 <_ChromeMain+0x21ec6d8>
 21f17f0: a903fe7f     	stp	xzr, xzr, [x19, #0x38]
 21f17f4: 52800028     	mov	w8, #0x1                ; =1
 21f17f8: a904a27f     	stp	xzr, x8, [x19, #0x48]
 21f17fc: f900327f     	str	xzr, [x19, #0x60]
 21f1800: f806727f     	stur	xzr, [x19, #0x67]
 21f1804: 39408028     	ldrb	w8, [x1, #0x20]
 21f1808: 52000108     	eor	w8, w8, #0x1
 21f180c: 3901be68     	strb	w8, [x19, #0x6f]
 21f1810: 3901c27f     	strb	wzr, [x19, #0x70]
 21f1814: a907fe7f     	stp	xzr, xzr, [x19, #0x78]
 21f1818: 3902227f     	strb	wzr, [x19, #0x88]
 21f181c: b40019b4     	cbz	x20, 0x21f1b50 <_ChromeMain+0x21ec8b4>
