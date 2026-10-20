
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463b0b0: b6f81bd9     	tbz	x25, #0x3f, 0x463b428 <_ChromeMain+0x463618c>
 463b0b4: f9401119     	ldr	x25, [x8, #0x20]
 463b0b8: 92800209     	mov	x9, #-0x11              ; =-17
 463b0bc: f2efffe9     	movk	x9, #0x7fff, lsl #48
 463b0c0: eb09033f     	cmp	x25, x9
 463b0c4: 54001b62     	b.hs	0x463b430 <_ChromeMain+0x4636194>
 463b0c8: f9400d16     	ldr	x22, [x8, #0x18]
 463b0cc: f1002b3f     	cmp	x25, #0xa
 463b0d0: 54001a49     	b.ls	0x463b418 <_ChromeMain+0x463617c>
 463b0d4: 927def3a     	and	x26, x25, #0x7ffffffffffffff8
 463b0d8: d37ffb48     	lsl	x8, x26, #1
 463b0dc: 91004100     	add	x0, x8, #0x10
 463b0e0: 96e750a2     	bl	0xf368 <_ChromeMain+0xa0cc>
 463b0e4: aa0003f7     	mov	x23, x0
 463b0e8: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 463b0ec: cb080348     	sub	x8, x26, x8
 463b0f0: a90167e0     	stp	x0, x25, [sp, #0x10]
 463b0f4: f90013e8     	str	x8, [sp, #0x20]
 463b0f8: 8b1906e8     	add	x8, x23, x25, lsl #1
 463b0fc: eb17011f     	cmp	x8, x23
 463b100: 54001923     	b.lo	0x463b424 <_ChromeMain+0x4636188>
 463b104: eb1602ff     	cmp	x23, x22
 463b108: fa569100     	ccmp	x8, x22, #0x0, ls
 463b10c: 540018c8     	b.hi	0x463b424 <_ChromeMain+0x4636188>
 463b110: d37ffb22     	lsl	x2, x25, #1
 463b114: aa1703e0     	mov	x0, x23
 463b118: aa1603e1     	mov	x1, x22
 463b11c: 94e7506c     	bl	0x800f2cc <_ChromeMain+0x800a030>
 463b120: 78397aff     	strh	wzr, [x23, x25, lsl #1]
 463b124: a905ffff     	stp	xzr, xzr, [sp, #0x58]
 463b128: f90037ff     	str	xzr, [sp, #0x68]
 463b12c: 39809fe8     	ldrsb	x8, [sp, #0x27]
 463b130: 910043e9     	add	x9, sp, #0x10
 463b134: a9412fea     	ldp	x10, x11, [sp, #0x10]
 463b138: f100011f     	cmp	x8, #0x0
 463b13c: 9a894140     	csel	x0, x10, x9, mi
 463b140: 7100011f     	cmp	w8, #0x0
 463b144: 9a884161     	csel	x1, x11, x8, mi
 463b148: b0044002     	adrp	x2, 0xce3c000 <dyld_stub_binder+0xce3c000>
 463b14c: 9109b842     	add	x2, x2, #0x26e
 463b150: 910163e5     	add	x5, sp, #0x58
 463b154: 52800323     	mov	w3, #0x19               ; =25
 463b158: 52800064     	mov	w4, #0x3                ; =3
 463b15c: 97234ea9     	bl	0xf0ec00 <_ChromeMain+0xf09964>
 463b160: d378ff08     	lsr	x8, x24, #56
 463b164: f100031f     	cmp	x24, #0x0
 463b168: 9a8842a8     	csel	x8, x21, x8, mi
 463b16c: b4001148     	cbz	x8, 0x463b394 <_ChromeMain+0x46360f8>
 463b170: 3941bfe9     	ldrb	w9, [sp, #0x6f]
 463b174: 13001d28     	sxtb	w8, w9
 463b178: f94033ea     	ldr	x10, [sp, #0x60]
 463b17c: 7100011f     	cmp	w8, #0x0
 463b180: 9a894141     	csel	x1, x10, x9, mi
 463b184: b4001081     	cbz	x1, 0x463b394 <_ChromeMain+0x46360f8>
 463b188: d101a3b6     	sub	x22, x29, #0x68
 463b18c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 463b190: f9002bff     	str	xzr, [sp, #0x50]
 463b194: f9402fe9     	ldr	x9, [sp, #0x58]
 463b198: 7100011f     	cmp	w8, #0x0
 463b19c: 910163e8     	add	x8, sp, #0x58
 463b1a0: 9a884120     	csel	x0, x9, x8, mi
 463b1a4: d101a3a8     	sub	x8, x29, #0x68
 463b1a8: 97259ed8     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 463b1ac: 3dc002c0     	ldr	q0, [x22]
 463b1b0: 3d801fe0     	str	q0, [sp, #0x70]
 463b1b4: f85a83a8     	ldur	x8, [x29, #-0x58]
 463b1b8: f90043e8     	str	x8, [sp, #0x80]
 463b1bc: a939ffbf     	stp	xzr, xzr, [x29, #-0x68]
 463b1c0: f81a83bf     	stur	xzr, [x29, #-0x58]
 463b1c4: 52800088     	mov	w8, #0x4                ; =4
 463b1c8: 390223e8     	strb	w8, [sp, #0x88]
 463b1cc: b0048e01     	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 463b1d0: 91307021     	add	x1, x1, #0xc1c
 463b1d4: 910103e0     	add	x0, sp, #0x40
 463b1d8: 9101c3e3     	add	x3, sp, #0x70
