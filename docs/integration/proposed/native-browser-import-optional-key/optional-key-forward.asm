
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4259898: d100c3ff     	sub	sp, sp, #0x30
 425989c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 42598a0: 910083fd     	add	x29, sp, #0x20
 42598a4: aa0003e9     	mov	x9, x0
 42598a8: f940100a     	ldr	x10, [x0, #0x20]
 42598ac: b9402800     	ldr	w0, [x0, #0x28]
 42598b0: 39412122     	ldrb	w2, [x9, #0x48]
 42598b4: 390003ff     	strb	wzr, [sp]
 42598b8: 390063ff     	strb	wzr, [sp, #0x18]
 42598bc: 3941a12b     	ldrb	w11, [x9, #0x68]
 42598c0: 3400012b     	cbz	w11, 0x42598e4 <_ChromeMain+0x4254648>
 42598c4: 3dc01520     	ldr	q0, [x9, #0x50]
 42598c8: 3d8003e0     	str	q0, [sp]
 42598cc: f940312b     	ldr	x11, [x9, #0x60]
 42598d0: f9000beb     	str	x11, [sp, #0x10]
 42598d4: a905fd3f     	stp	xzr, xzr, [x9, #0x58]
 42598d8: f900293f     	str	xzr, [x9, #0x50]
 42598dc: 5280002b     	mov	w11, #0x1               ; =1
 42598e0: 390063eb     	strb	w11, [sp, #0x18]
 42598e4: 9100c121     	add	x1, x9, #0x30
 42598e8: 910003e3     	mov	x3, sp
 42598ec: d63f0140     	blr	x10
 42598f0: 394063e8     	ldrb	w8, [sp, #0x18]
 42598f4: 340000e8     	cbz	w8, 0x4259910 <_ChromeMain+0x4254674>
 42598f8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 42598fc: 36f800a8     	tbz	w8, #0x1f, 0x4259910 <_ChromeMain+0x4254674>
 4259900: f94003e0     	ldr	x0, [sp]
 4259904: f9400be8     	ldr	x8, [sp, #0x10]
 4259908: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425990c: 96f6bd6b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259910: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4259914: 9100c3ff     	add	sp, sp, #0x30
 4259918: d65f03c0     	ret
