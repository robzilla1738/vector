
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7d812e8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7d812ec: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7d812f0: 910043fd     	add	x29, sp, #0x10
 7d812f4: b943bc08     	ldr	w8, [x0, #0x3bc]
 7d812f8: 71000d1f     	cmp	w8, #0x3
 7d812fc: 540000e0     	b.eq	0x7d81318 <_ChromeMain+0x7d7c07c>
 7d81300: aa0003f3     	mov	x19, x0
 7d81304: 94a56b0b     	bl	0xa6dbf30 <_ChromeMain+0xa6d6c94>
 7d81308: 37000080     	tbnz	w0, #0x0, 0x7d81318 <_ChromeMain+0x7d7c07c>
 7d8130c: b943be68     	ldr	w8, [x19, #0x3bc]
 7d81310: 7100091f     	cmp	w8, #0x2
 7d81314: 54000081     	b.ne	0x7d81324 <_ChromeMain+0x7d7c088>
 7d81318: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7d8131c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7d81320: d65f03c0     	ret
 7d81324: aa1303e0     	mov	x0, x19
 7d81328: 52800001     	mov	w1, #0x0                ; =0
 7d8132c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7d81330: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7d81334: 166d27b9     	b	0x18cb218 <_ChromeMain+0x18c5f7c>
