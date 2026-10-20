
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425bf70: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 425bf74: a90157f6     	stp	x22, x21, [sp, #0x10]
 425bf78: a9024ff4     	stp	x20, x19, [sp, #0x20]
 425bf7c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 425bf80: 9100c3fd     	add	x29, sp, #0x30
 425bf84: b40007c1     	cbz	x1, 0x425c07c <_ChromeMain+0x4256de0>
 425bf88: aa0303f4     	mov	x20, x3
 425bf8c: aa0203f5     	mov	x21, x2
 425bf90: aa0103f6     	mov	x22, x1
 425bf94: aa0003f7     	mov	x23, x0
 425bf98: aa0803f3     	mov	x19, x8
 425bf9c: aa0103e0     	mov	x0, x1
 425bfa0: 94f69cff     	bl	0x800339c <_ChromeMain+0x7ffe100>
 425bfa4: aa0003e2     	mov	x2, x0
 425bfa8: aa1703e0     	mov	x0, x23
 425bfac: aa1603e1     	mov	x1, x22
 425bfb0: 97083b64     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425bfb4: b5000440     	cbnz	x0, 0x425c03c <_ChromeMain+0x4256da0>
 425bfb8: 92800208     	mov	x8, #-0x11              ; =-17
 425bfbc: f2efffe8     	movk	x8, #0x7fff, lsl #48
 425bfc0: eb08029f     	cmp	x20, x8
 425bfc4: 540005e2     	b.hs	0x425c080 <_ChromeMain+0x4256de4>
 425bfc8: f1002a9f     	cmp	x20, #0xa
 425bfcc: 54000349     	b.ls	0x425c034 <_ChromeMain+0x4256d98>
 425bfd0: 927dee96     	and	x22, x20, #0x7ffffffffffffff8
 425bfd4: d37ffac8     	lsl	x8, x22, #1
 425bfd8: 91004100     	add	x0, x8, #0x10
 425bfdc: 96f6cce3     	bl	0xf368 <_ChromeMain+0xa0cc>
 425bfe0: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 425bfe4: cb0802c8     	sub	x8, x22, x8
 425bfe8: a9005260     	stp	x0, x20, [x19]
 425bfec: f9000a68     	str	x8, [x19, #0x10]
 425bff0: aa0003f3     	mov	x19, x0
 425bff4: 8b140668     	add	x8, x19, x20, lsl #1
 425bff8: eb13011f     	cmp	x8, x19
 425bffc: 54000403     	b.lo	0x425c07c <_ChromeMain+0x4256de0>
 425c000: eb15011f     	cmp	x8, x21
 425c004: fa558262     	ccmp	x19, x21, #0x2, hi
 425c008: 540003a9     	b.ls	0x425c07c <_ChromeMain+0x4256de0>
 425c00c: d37ffa82     	lsl	x2, x20, #1
 425c010: aa1303e0     	mov	x0, x19
 425c014: aa1503e1     	mov	x1, x21
 425c018: 94f6ccad     	bl	0x800f2cc <_ChromeMain+0x800a030>
 425c01c: 78347a7f     	strh	wzr, [x19, x20, lsl #1]
 425c020: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 425c024: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 425c028: a94157f6     	ldp	x22, x21, [sp, #0x10]
 425c02c: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 425c030: d65f03c0     	ret
 425c034: 39005e74     	strb	w20, [x19, #0x17]
 425c038: 17ffffef     	b	0x425bff4 <_ChromeMain+0x4256d58>
 425c03c: 39406008     	ldrb	w8, [x0, #0x18]
 425c040: 7100111f     	cmp	w8, #0x4
 425c044: 54fffba1     	b.ne	0x425bfb8 <_ChromeMain+0x4256d1c>
 425c048: 39805c01     	ldrsb	x1, [x0, #0x17]
 425c04c: b7f80101     	tbnz	x1, #0x3f, 0x425c06c <_ChromeMain+0x4256dd0>
 425c050: 34fffb41     	cbz	w1, 0x425bfb8 <_ChromeMain+0x4256d1c>
 425c054: aa1303e8     	mov	x8, x19
 425c058: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 425c05c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 425c060: a94157f6     	ldp	x22, x21, [sp, #0x10]
 425c064: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 425c068: 171a18aa     	b	0x8e2310 <_ChromeMain+0x8dd074>
 425c06c: f9400401     	ldr	x1, [x0, #0x8]
 425c070: b4fffa41     	cbz	x1, 0x425bfb8 <_ChromeMain+0x4256d1c>
 425c074: f9400000     	ldr	x0, [x0]
 425c078: 17fffff7     	b	0x425c054 <_ChromeMain+0x4256db8>
 425c07c: d4200020     	brk	#0x1
 425c080: 942b204a     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
