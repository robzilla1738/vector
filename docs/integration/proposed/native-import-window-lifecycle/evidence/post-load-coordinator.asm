
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 458d2f0: b40001a0     	cbz	x0, 0x458d324 <_ChromeMain+0x4588088>
 458d2f4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 458d2f8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 458d2fc: 910043fd     	add	x29, sp, #0x10
 458d300: f9402013     	ldr	x19, [x0, #0x40]
 458d304: 97a3de51     	bl	0x2e84c48 <_ChromeMain+0x2e7f9ac>
 458d308: aa1303e1     	mov	x1, x19
 458d30c: 52800022     	mov	w2, #0x1                ; =1
 458d310: 96eb16a1     	bl	0x52d94 <_ChromeMain+0x4daf8>
 458d314: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 458d318: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 458d31c: b4000040     	cbz	x0, 0x458d324 <_ChromeMain+0x4588088>
 458d320: 17efbc73     	b	0x417c4ec <_ChromeMain+0x4177250>
 458d324: d65f03c0     	ret
