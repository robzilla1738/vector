
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463981c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4639820: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4639824: 910043fd     	add	x29, sp, #0x10
 4639828: aa0103f3     	mov	x19, x1
 463982c: 97ffff47     	bl	0x4639548 <_ChromeMain+0x46342ac>
 4639830: 5120d268     	sub	w8, w19, #0x834
 4639834: 71000d1f     	cmp	w8, #0x3
 4639838: 1a9f2400     	csinc	w0, w0, wzr, hs
 463983c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4639840: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4639844: d65f03c0     	ret
 4639848: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 463984c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4639850: 910043fd     	add	x29, sp, #0x10
 4639854: aa0103f3     	mov	x19, x1
 4639858: d115c000     	sub	x0, x0, #0x570
 463985c: 97ffff3b     	bl	0x4639548 <_ChromeMain+0x46342ac>
 4639860: 5120d268     	sub	w8, w19, #0x834
 4639864: 71000d1f     	cmp	w8, #0x3
 4639868: 1a9f2400     	csinc	w0, w0, wzr, hs
 463986c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4639870: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4639874: d65f03c0     	ret
