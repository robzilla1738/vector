
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7accef8: d10103ff     	sub	sp, sp, #0x40
 7accefc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 7accf00: a9037bfd     	stp	x29, x30, [sp, #0x30]
 7accf04: 9100c3fd     	add	x29, sp, #0x30
 7accf08: aa0103e2     	mov	x2, x1
 7accf0c: aa0003f4     	mov	x20, x0
 7accf10: f002a161     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 7accf14: 91124821     	add	x1, x1, #0x492
 7accf18: 97fffe61     	bl	0x7acc89c <_ChromeMain+0x7ac7600>
 7accf1c: 340001a0     	cbz	w0, 0x7accf50 <_ChromeMain+0x7ac7cb4>
 7accf20: f9400693     	ldr	x19, [x20, #0x8]
 7accf24: 39c0be88     	ldrsb	w8, [x20, #0x2f]
 7accf28: 37f801c8     	tbnz	w8, #0x1f, 0x7accf60 <_ChromeMain+0x7ac7cc4>
 7accf2c: 3cc18280     	ldur	q0, [x20, #0x18]
 7accf30: 3d8003e0     	str	q0, [sp]
 7accf34: f8428288     	ldur	x8, [x20, #0x28]
 7accf38: f9000be8     	str	x8, [sp, #0x10]
 7accf3c: 910003e1     	mov	x1, sp
 7accf40: aa1303e0     	mov	x0, x19
 7accf44: 96ab966e     	bl	0x25b28fc <_ChromeMain+0x25ad660>
 7accf48: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 7accf4c: 37f80128     	tbnz	w8, #0x1f, 0x7accf70 <_ChromeMain+0x7ac7cd4>
 7accf50: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 7accf54: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 7accf58: 910103ff     	add	sp, sp, #0x40
 7accf5c: d65f03c0     	ret
 7accf60: a9418a81     	ldp	x1, x2, [x20, #0x18]
 7accf64: 910003e0     	mov	x0, sp
 7accf68: 96152cac     	bl	0x18218 <_ChromeMain+0x12f7c>
 7accf6c: 17fffff4     	b	0x7accf3c <_ChromeMain+0x7ac7ca0>
 7accf70: f94003e0     	ldr	x0, [sp]
 7accf74: f9400be8     	ldr	x8, [sp, #0x10]
 7accf78: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7accf7c: 9614efcf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7accf80: 17fffff4     	b	0x7accf50 <_ChromeMain+0x7ac7cb4>
