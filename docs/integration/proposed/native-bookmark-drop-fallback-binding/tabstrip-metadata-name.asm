
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 78abef4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78abef8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78abefc: 910043fd     	add	x29, sp, #0x10
 78abf00: aa0003f3     	mov	x19, x0
 78abf04: 90030f81     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 78abf08: 913a3021     	add	x1, x1, #0xe8c
 78abf0c: 52800742     	mov	w2, #0x3a               ; =58
 78abf10: 52800403     	mov	w3, #0x20               ; =32
 78abf14: 9631ed99     	bl	0x527578 <_ChromeMain+0x5222dc>
 78abf18: d0034868     	adrp	x8, 0xe1b9000 <dyld_stub_binder+0xe1b9000>
 78abf1c: 91298108     	add	x8, x8, #0xa60
 78abf20: f9000008     	str	x8, [x0]
 78abf24: 90030f81     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 78abf28: 9139fc21     	add	x1, x1, #0xe7f
 78abf2c: 52800182     	mov	w2, #0xc                ; =12
 78abf30: 96f606ab     	bl	0x362d9dc <_ChromeMain+0x3628740>
 78abf34: 96ab269f     	bl	0x23759b0 <_ChromeMain+0x2370714>
 78abf38: aa0003e1     	mov	x1, x0
 78abf3c: aa1303e0     	mov	x0, x19
 78abf40: 96f606a9     	bl	0x362d9e4 <_ChromeMain+0x3628748>
 78abf44: aa1303e0     	mov	x0, x19
 78abf48: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 78abf4c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 78abf50: d65f03c0     	ret
