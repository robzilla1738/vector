
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 411fbf0: d102c3ff     	sub	sp, sp, #0xb0
 411fbf4: a9075ff8     	stp	x24, x23, [sp, #0x70]
 411fbf8: a90857f6     	stp	x22, x21, [sp, #0x80]
 411fbfc: a9094ff4     	stp	x20, x19, [sp, #0x90]
 411fc00: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 411fc04: 910283fd     	add	x29, sp, #0xa0
 411fc08: aa0003f3     	mov	x19, x0
 411fc0c: 39531008     	ldrb	w8, [x0, #0x4c4]
 411fc10: 340001c8     	cbz	w8, 0x411fc48 <_ChromeMain+0x411a9ac>
 411fc14: f9423660     	ldr	x0, [x19, #0x468]
 411fc18: f9400008     	ldr	x8, [x0]
 411fc1c: f9405102     	ldr	x2, [x8, #0xa0]
 411fc20: 52800001     	mov	w1, #0x0                ; =0
 411fc24: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 411fc28: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 411fc2c: a94857f6     	ldp	x22, x21, [sp, #0x80]
 411fc30: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 411fc34: 9102c3ff     	add	sp, sp, #0xb0
 411fc38: d61f0040     	br	x2
