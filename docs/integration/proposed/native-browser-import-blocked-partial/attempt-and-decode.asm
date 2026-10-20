
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425b304: 910643e0     	add	x0, sp, #0x190
 425b308: 9718d4ee     	bl	0x8906c0 <_ChromeMain+0x88b424>
 425b30c: 7101901f     	cmp	w0, #0x64
 425b310: 54fffbc1     	b.ne	0x425b288 <_ChromeMain+0x4255fec>
 425b314: 910643e0     	add	x0, sp, #0x190
 425b318: 52800121     	mov	w1, #0x9                ; =9
 425b31c: 9711eb65     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425b320: aa0003fa     	mov	x26, x0
 425b324: a917ffff     	stp	xzr, xzr, [sp, #0x178]
 425b328: f900c7ff     	str	xzr, [sp, #0x188]
 425b32c: 9105e3e8     	add	x8, sp, #0x178
 425b330: 910643e0     	add	x0, sp, #0x190
 425b334: 528000a1     	mov	w1, #0x5                ; =5
 425b338: 9534d982     	bl	0x8f91940 <_ChromeMain+0x8f8c6a4>
 425b33c: a9167fff     	stp	xzr, xzr, [sp, #0x160]
 425b340: f900bbff     	str	xzr, [sp, #0x170]
 425b344: 370026fa     	tbnz	w26, #0x0, 0x425b820 <_ChromeMain+0x4256584>
 425b348: 39463fe8     	ldrb	w8, [sp, #0x18f]
 425b34c: f940c3e9     	ldr	x9, [sp, #0x180]
 425b350: 7219011f     	tst	w8, #0x80
 425b354: 9a881128     	csel	x8, x9, x8, ne
 425b358: f100011f     	cmp	x8, #0x0
 425b35c: a945a3e1     	ldp	x1, x8, [sp, #0x58]
 425b360: 9a880508     	cinc	x8, x8, ne
 425b364: f90033e8     	str	x8, [sp, #0x60]
 425b368: 9105e3e0     	add	x0, sp, #0x178
 425b36c: 910583e2     	add	x2, sp, #0x160
 425b370: 9400068c     	bl	0x425cda0 <_ChromeMain+0x4257b04>
 425b374: 35002460     	cbnz	w0, 0x425b800 <_ChromeMain+0x4256564>
 425b378: 39c5dfe8     	ldrsb	w8, [sp, #0x177]
 425b37c: 36f800a8     	tbz	w8, #0x1f, 0x425b390 <_ChromeMain+0x42560f4>
 425b380: f940b3e0     	ldr	x0, [sp, #0x160]
 425b384: f940bbe8     	ldr	x8, [sp, #0x170]
 425b388: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b38c: 96f6b6cb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b390: 39c63fe8     	ldrsb	w8, [sp, #0x18f]
 425b394: 36fffb88     	tbz	w8, #0x1f, 0x425b304 <_ChromeMain+0x4256068>
 425b398: f940bfe0     	ldr	x0, [sp, #0x178]
 425b39c: f940c7e8     	ldr	x8, [sp, #0x188]
 425b3a0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b3a4: 96f6b6c5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b3a8: 17ffffd7     	b	0x425b304 <_ChromeMain+0x4256068>
