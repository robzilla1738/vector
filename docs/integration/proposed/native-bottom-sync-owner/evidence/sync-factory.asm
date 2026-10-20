
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 21acfc0: d10103ff     	sub	sp, sp, #0x40
 21acfc4: a90157f6     	stp	x22, x21, [sp, #0x10]
 21acfc8: a9024ff4     	stp	x20, x19, [sp, #0x20]
 21acfcc: a9037bfd     	stp	x29, x30, [sp, #0x30]
 21acfd0: 9100c3fd     	add	x29, sp, #0x30
 21acfd4: aa0003f3     	mov	x19, x0
 21acfd8: 90066ae8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 21acfdc: f9401900     	ldr	x0, [x8, #0x30]
 21acfe0: d0059001     	adrp	x1, 0xd3ae000 <dyld_stub_binder+0xd3ae000>
 21acfe4: 91083c21     	add	x1, x1, #0x20f
 21acfe8: 97812165     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 21acfec: 370005c0     	tbnz	w0, #0x0, 0x21ad0a4 <_ChromeMain+0x21a7e08>
 21acff0: d0066a88     	adrp	x8, 0xeefe000 <dyld_stub_binder+0xeefe000>
 21acff4: 9109c108     	add	x8, x8, #0x270
 21acff8: 38bfc108     	ldaprb	w8, [x8]
 21acffc: 36000148     	tbz	w8, #0x0, 0x21ad024 <_ChromeMain+0x21a7d88>
 21ad000: b0066a80     	adrp	x0, 0xeefe000 <dyld_stub_binder+0xeefe000>
 21ad004: 9108a000     	add	x0, x0, #0x228
 21ad008: aa1303e1     	mov	x1, x19
 21ad00c: 52800022     	mov	w2, #0x1                ; =1
 21ad010: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 21ad014: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 21ad018: a94157f6     	ldp	x22, x21, [sp, #0x10]
 21ad01c: 910103ff     	add	sp, sp, #0x40
 21ad020: 177a975d     	b	0x52d94 <_ChromeMain+0x4daf8>
 21ad024: b0066a94     	adrp	x20, 0xeefe000 <dyld_stub_binder+0xeefe000>
 21ad028: 9109c294     	add	x20, x20, #0x270
 21ad02c: aa1403e0     	mov	x0, x20
 21ad030: 95795e24     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 21ad034: 34fffe60     	cbz	w0, 0x21ad000 <_ChromeMain+0x21a7d64>
 21ad038: b0066a80     	adrp	x0, 0xeefe000 <dyld_stub_binder+0xeefe000>
 21ad03c: 9108a000     	add	x0, x0, #0x228
 21ad040: 9400022b     	bl	0x21ad8ec <_ChromeMain+0x21a8650>
 21ad044: 52800035     	mov	w21, #0x1               ; =1
 21ad048: 089ffe95     	stlrb	w21, [x20]
 21ad04c: d00659e0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 21ad050: 9127c000     	add	x0, x0, #0x9f0
 21ad054: 95795e1e     	bl	0x80048cc <_ChromeMain+0x7fff630>
 21ad058: 35000420     	cbnz	w0, 0x21ad0dc <_ChromeMain+0x21a7e40>
 21ad05c: b0066a88     	adrp	x8, 0xeefe000 <dyld_stub_binder+0xeefe000>
 21ad060: 3949c514     	ldrb	w20, [x8, #0x271]
 21ad064: 3909c515     	strb	w21, [x8, #0x271]
 21ad068: d00659e0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 21ad06c: 9127c000     	add	x0, x0, #0x9f0
 21ad070: 95795e25     	bl	0x8004904 <_ChromeMain+0x7fff668>
 21ad074: 35000240     	cbnz	w0, 0x21ad0bc <_ChromeMain+0x21a7e20>
 21ad078: 3617fc54     	tbz	w20, #0x2, 0x21ad000 <_ChromeMain+0x21a7d64>
 21ad07c: d00659e0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 21ad080: 9128c000     	add	x0, x0, #0xa30
 21ad084: 95795e23     	bl	0x8004910 <_ChromeMain+0x7fff674>
 21ad088: 34fffbc0     	cbz	w0, 0x21ad000 <_ChromeMain+0x21a7d64>
 21ad08c: f005ea28     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 21ad090: 911c4d08     	add	x8, x8, #0x713
 21ad094: f90003e8     	str	x8, [sp]
 21ad098: f005ea20     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 21ad09c: 911c9c00     	add	x0, x0, #0x727
 21ad0a0: 95795e1f     	bl	0x800491c <_ChromeMain+0x7fff680>
 21ad0a4: d2800000     	mov	x0, #0x0                ; =0
 21ad0a8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 21ad0ac: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 21ad0b0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 21ad0b4: 910103ff     	add	sp, sp, #0x40
 21ad0b8: d65f03c0     	ret
