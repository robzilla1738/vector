
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4134620: f942b808     	ldr	x8, [x0, #0x570]
 4134624: eb01011f     	cmp	x8, x1
 4134628: 54000080     	b.eq	0x4134638 <_ChromeMain+0x412f39c>
 413462c: b50000a1     	cbnz	x1, 0x4134640 <_ChromeMain+0x412f3a4>
 4134630: 52800000     	mov	w0, #0x0                ; =0
 4134634: d65f03c0     	ret
 4134638: 52800020     	mov	w0, #0x1                ; =1
 413463c: d65f03c0     	ret
 4134640: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4134644: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4134648: 910043fd     	add	x29, sp, #0x10
 413464c: f9400028     	ldr	x8, [x1]
 4134650: f9402d08     	ldr	x8, [x8, #0x58]
 4134654: aa0103e0     	mov	x0, x1
 4134658: d63f0100     	blr	x8
 413465c: aa0003f3     	mov	x19, x0
 4134660: 94ddafa7     	bl	0x78a04fc <_ChromeMain+0x789b260>
 4134664: aa0003e8     	mov	x8, x0
 4134668: f100027f     	cmp	x19, #0x0
 413466c: 1a9f07e0     	cset	w0, ne
 4134670: eb08027f     	cmp	x19, x8
 4134674: fa401a64     	ccmp	x19, #0x0, #0x4, ne
 4134678: 540000c0     	b.eq	0x4134690 <_ChromeMain+0x412f3f4>
 413467c: f9402673     	ldr	x19, [x19, #0x48]
 4134680: f100027f     	cmp	x19, #0x0
 4134684: 1a9f07e0     	cset	w0, ne
 4134688: fa481264     	ccmp	x19, x8, #0x4, ne
 413468c: 54ffff81     	b.ne	0x413467c <_ChromeMain+0x412f3e0>
 4134690: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4134694: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4134698: d65f03c0     	ret
