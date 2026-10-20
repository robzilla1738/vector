
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 6c89848: d10103ff     	sub	sp, sp, #0x40
 6c8984c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 6c89850: a9037bfd     	stp	x29, x30, [sp, #0x30]
 6c89854: 9100c3fd     	add	x29, sp, #0x30
 6c89858: aa0003f3     	mov	x19, x0
 6c8985c: 39c05c28     	ldrsb	w8, [x1, #0x17]
 6c89860: 36f800c8     	tbz	w8, #0x1f, 0x6c89878 <_ChromeMain+0x6c845dc>
 6c89864: a9400828     	ldp	x8, x2, [x1]
 6c89868: 910003e0     	mov	x0, sp
 6c8986c: aa0803e1     	mov	x1, x8
 6c89870: 964e3a6a     	bl	0x18218 <_ChromeMain+0x12f7c>
 6c89874: 14000005     	b	0x6c89888 <_ChromeMain+0x6c845ec>
 6c89878: 3dc00020     	ldr	q0, [x1]
 6c8987c: 3d8003e0     	str	q0, [sp]
 6c89880: f9400828     	ldr	x8, [x1, #0x10]
 6c89884: f9000be8     	str	x8, [sp, #0x10]
 6c89888: 910003e1     	mov	x1, sp
 6c8988c: aa1303e0     	mov	x0, x19
 6c89890: 52800022     	mov	w2, #0x1                ; =1
 6c89894: 9400000b     	bl	0x6c898c0 <_ChromeMain+0x6c84624>
 6c89898: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 6c8989c: 36f800a8     	tbz	w8, #0x1f, 0x6c898b0 <_ChromeMain+0x6c84614>
 6c898a0: f94003e0     	ldr	x0, [sp]
 6c898a4: f9400be8     	ldr	x8, [sp, #0x10]
 6c898a8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 6c898ac: 964dfd83     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 6c898b0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 6c898b4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 6c898b8: 910103ff     	add	sp, sp, #0x40
 6c898bc: d65f03c0     	ret
