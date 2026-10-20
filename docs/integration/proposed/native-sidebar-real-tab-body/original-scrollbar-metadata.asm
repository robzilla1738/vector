
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7fb6fe4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7fb6fe8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7fb6fec: 910043fd     	add	x29, sp, #0x10
 7fb6ff0: aa0003f3     	mov	x19, x0
 7fb6ff4: d002dac1     	adrp	x1, 0xdb10000 <dyld_stub_binder+0xdb10000>
 7fb6ff8: 9138ac21     	add	x1, x1, #0xe2b
 7fb6ffc: 52800962     	mov	w2, #0x4b               ; =75
 7fb7000: 528002c3     	mov	w3, #0x16               ; =22
 7fb7004: 9615c15d     	bl	0x527578 <_ChromeMain+0x5222dc>
 7fb7008: b00314c8     	adrp	x8, 0xe250000 <dyld_stub_binder+0xe250000>
 7fb700c: 91002108     	add	x8, x8, #0x8
 7fb7010: f9000008     	str	x8, [x0]
 7fb7014: b002dac1     	adrp	x1, 0xdb10000 <dyld_stub_binder+0xdb10000>
 7fb7018: 91384421     	add	x1, x1, #0xe11
 7fb701c: 52800322     	mov	w2, #0x19               ; =25
 7fb7020: 96d9da6f     	bl	0x362d9dc <_ChromeMain+0x3628740>
 7fb7024: 97fff742     	bl	0x7fb4d2c <_ChromeMain+0x7fafa90>
 7fb7028: aa0003e1     	mov	x1, x0
 7fb702c: aa1303e0     	mov	x0, x19
 7fb7030: 96d9da6d     	bl	0x362d9e4 <_ChromeMain+0x3628748>
 7fb7034: aa1303e0     	mov	x0, x19
 7fb7038: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7fb703c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7fb7040: d65f03c0     	ret
