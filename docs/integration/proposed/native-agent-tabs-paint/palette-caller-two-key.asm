
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 370c240: d10383ff     	sub	sp, sp, #0xe0
 370c244: a9086ffc     	stp	x28, x27, [sp, #0x80]
 370c248: a90967fa     	stp	x26, x25, [sp, #0x90]
 370c24c: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 370c250: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 370c254: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 370c258: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 370c25c: 910343fd     	add	x29, sp, #0xd0
 370c260: b9400028     	ldr	w8, [x1]
 370c264: b9001be8     	str	w8, [sp, #0x18]
 370c268: 7100051f     	cmp	w8, #0x1
 370c26c: 1a9f17f4     	cset	w20, eq
 370c270: 97b9a0d1     	bl	0x25745b4 <_ChromeMain+0x256f318>
 370c274: aa0003f3     	mov	x19, x0
 370c278: aa1403e1     	mov	x1, x20
 370c27c: 97fb6ab1     	bl	0x35e6d40 <_ChromeMain+0x35e1aa4>
