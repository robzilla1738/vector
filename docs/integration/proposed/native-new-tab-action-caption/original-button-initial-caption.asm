
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4243118: 90056668     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
 424311c: f946f500     	ldr	x0, [x8, #0xde8]
 4243120: b4002320     	cbz	x0, 0x4243584 <_ChromeMain+0x423e2e8>
 4243124: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 4243128: f9003bff     	str	xzr, [sp, #0x70]
 424312c: 910183f5     	add	x21, sp, #0x60
 4243130: 910183e8     	add	x8, sp, #0x60
 4243134: 528020a1     	mov	w1, #0x105              ; =261
 4243138: 9741c569     	bl	0x12b46dc <_ChromeMain+0x12af440>
 424313c: 3981dfe8     	ldrsb	x8, [sp, #0x77]
 4243140: a9462be9     	ldp	x9, x10, [sp, #0x60]
 4243144: f100011f     	cmp	x8, #0x0
 4243148: 9a954121     	csel	x1, x9, x21, mi
 424314c: 7100011f     	cmp	w8, #0x0
 4243150: 9a884142     	csel	x2, x10, x8, mi
 4243154: f9400268     	ldr	x8, [x19]
 4243158: f9423108     	ldr	x8, [x8, #0x460]
 424315c: aa1303e0     	mov	x0, x19
 4243160: d63f0100     	blr	x8
