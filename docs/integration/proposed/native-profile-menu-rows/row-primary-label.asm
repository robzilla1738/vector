
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 457a0bc: 39436fe8     	ldrb	w8, [sp, #0xdb]
 457a0c0: 52803209     	mov	w9, #0x190              ; =400
 457a0c4: 52803e8a     	mov	w10, #0x1f4             ; =500
 457a0c8: 7100011f     	cmp	w8, #0x0
 457a0cc: 1a891142     	csel	w2, w10, w9, ne
 457a0d0: f9405fe8     	ldr	x8, [sp, #0xb8]
 457a0d4: f81283a8     	stur	x8, [x29, #-0xd8]
 457a0d8: b940e3e4     	ldr	w4, [sp, #0xe0]
 457a0dc: d10363a3     	sub	x3, x29, #0xd8
 457a0e0: aa1603e0     	mov	x0, x22
 457a0e4: 528001c1     	mov	w1, #0xe                ; =14
 457a0e8: 97fffd76     	bl	0x45796c0 <_ChromeMain+0x4574424>
