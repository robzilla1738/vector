
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7dc5120: 52800700     	mov	w0, #0x38               ; =56
 7dc5124: 96092891     	bl	0xf368 <_ChromeMain+0xa0cc>
 7dc5128: 52800028     	mov	w8, #0x1                ; =1
 7dc512c: b9000008     	str	w8, [x0]
 7dc5130: a900d815     	stp	x21, x22, [x0, #0x8]
 7dc5134: b0fe21e8     	adrp	x8, 0x4202000 <_ChromeMain+0x41fcd64>
 7dc5138: 912b1108     	add	x8, x8, #0xac4
 7dc513c: a901a017     	stp	x23, x8, [x0, #0x18]
 7dc5140: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 7dc5144: 9002e948     	adrp	x8, 0xdaed000 <dyld_stub_binder+0xdaed000>
 7dc5148: 9134c108     	add	x8, x8, #0xd30
 7dc514c: 528002e9     	mov	w9, #0x17               ; =23
 7dc5150: a90127e8     	stp	x8, x9, [sp, #0x10]
 7dc5154: f90007e0     	str	x0, [sp, #0x8]
 7dc5158: 91004300     	add	x0, x24, #0x10
 7dc515c: 91004301     	add	x1, x24, #0x10
 7dc5160: 910043e2     	add	x2, sp, #0x10
 7dc5164: 910023e3     	add	x3, sp, #0x8
 7dc5168: 96972e57     	bl	0x2390ac4 <_ChromeMain+0x238b828>
 7dc516c: f94007e0     	ldr	x0, [sp, #0x8]
 7dc5170: b5003b80     	cbnz	x0, 0x7dc58e0 <_ChromeMain+0x7dc0644>
