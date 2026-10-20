
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3479410: d10c4000     	sub	x0, x0, #0x310
 3479414: 1400000b     	b	0x3479440 <_ChromeMain+0x34741a4>
		...
 3479440: d10303ff     	sub	sp, sp, #0xc0
 3479444: a9066ffc     	stp	x28, x27, [sp, #0x60]
 3479448: a90767fa     	stp	x26, x25, [sp, #0x70]
 347944c: a9085ff8     	stp	x24, x23, [sp, #0x80]
 3479450: a90957f6     	stp	x22, x21, [sp, #0x90]
 3479454: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 3479458: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 347945c: 9102c3fd     	add	x29, sp, #0xb0
 3479460: aa0103f5     	mov	x21, x1
 3479464: aa0003f4     	mov	x20, x0
 3479468: aa0803f3     	mov	x19, x8
 347946c: 6f00e400     	movi.2d	v0, #0000000000000000
 3479470: ad000100     	stp	q0, q0, [x8]
 3479474: 39401029     	ldrb	w9, [x1, #0x4]
 3479478: aa0103e8     	mov	x8, x1
 347947c: 37000069     	tbnz	w9, #0x0, 0x3479488 <_ChromeMain+0x34741ec>
