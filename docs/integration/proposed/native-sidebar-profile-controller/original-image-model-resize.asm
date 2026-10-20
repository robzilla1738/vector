
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7ad3088: d101c3ff     	sub	sp, sp, #0x70
 7ad308c: a90457f6     	stp	x22, x21, [sp, #0x40]
 7ad3090: a9054ff4     	stp	x20, x19, [sp, #0x50]
 7ad3094: a9067bfd     	stp	x29, x30, [sp, #0x60]
 7ad3098: 910183fd     	add	x29, sp, #0x60
 7ad309c: aa0103f4     	mov	x20, x1
 7ad30a0: aa0003f5     	mov	x21, x0
 7ad30a4: aa0803f3     	mov	x19, x8
 7ad30a8: 9664bde7     	bl	0x1402844 <_ChromeMain+0x13fd5a8>
 7ad30ac: d360fc08     	lsr	x8, x0, #32
 7ad30b0: 0ab47e96     	bic	w22, w20, w20, asr #31
 7ad30b4: 6b0802df     	cmp	w22, w8
 7ad30b8: 7a4002c0     	ccmp	w22, w0, #0x0, eq
 7ad30bc: 54000101     	b.ne	0x7ad30dc <_ChromeMain+0x7acde40>
 7ad30c0: aa1303e0     	mov	x0, x19
 7ad30c4: aa1503e1     	mov	x1, x21
 7ad30c8: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 7ad30cc: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 7ad30d0: a94457f6     	ldp	x22, x21, [sp, #0x40]
 7ad30d4: 9101c3ff     	add	sp, sp, #0x70
 7ad30d8: 162faf21     	b	0x6bed5c <_ChromeMain+0x6b9ac0>
 7ad30dc: aa1503e0     	mov	x0, x21
 7ad30e0: 9720ef28     	bl	0x430ed80 <_ChromeMain+0x4309ae4>
 7ad30e4: 34000460     	cbz	w0, 0x7ad3170 <_ChromeMain+0x7acded4>
 7ad30e8: f9000bff     	str	xzr, [sp, #0x10]
 7ad30ec: d100a3a8     	sub	x8, x29, #0x28
 7ad30f0: aa1503e0     	mov	x0, x21
 7ad30f4: 9720ef2e     	bl	0x430edac <_ChromeMain+0x4309b10>
 7ad30f8: 910043e8     	add	x8, sp, #0x10
 7ad30fc: d100a3a0     	sub	x0, x29, #0x28
 7ad3100: 96663bcd     	bl	0x1462034 <_ChromeMain+0x145cd98>
 7ad3104: d100a3a0     	sub	x0, x29, #0x28
 7ad3108: 96fee685     	bl	0x3a8cb1c <_ChromeMain+0x3a87880>
 7ad310c: 29065bf6     	stp	w22, w22, [sp, #0x30]
 7ad3110: d100a3a8     	sub	x8, x29, #0x28
 7ad3114: 910043e0     	add	x0, sp, #0x10
 7ad3118: 9100c3e2     	add	x2, sp, #0x30
 7ad311c: 52800041     	mov	w1, #0x2                ; =2
 7ad3120: 967534e2     	bl	0x18204a8 <_ChromeMain+0x181b20c>
 7ad3124: d100a3a0     	sub	x0, x29, #0x28
 7ad3128: aa1303e8     	mov	x8, x19
 7ad312c: 96fe9630     	bl	0x3a789ec <_ChromeMain+0x3a73750>
 7ad3130: f85d83a0     	ldur	x0, [x29, #-0x28]
 7ad3134: b40000c0     	cbz	x0, 0x7ad314c <_ChromeMain+0x7acdeb0>
 7ad3138: 91002008     	add	x8, x0, #0x8
 7ad313c: 12800009     	mov	w9, #-0x1               ; =-1
 7ad3140: b8e90108     	ldaddal	w9, w8, [x8]
 7ad3144: 7100051f     	cmp	w8, #0x1
 7ad3148: 540003c0     	b.eq	0x7ad31c0 <_ChromeMain+0x7acdf24>
 7ad314c: f9400be0     	ldr	x0, [sp, #0x10]
 7ad3150: b40002e0     	cbz	x0, 0x7ad31ac <_ChromeMain+0x7acdf10>
 7ad3154: 91002008     	add	x8, x0, #0x8
 7ad3158: 12800009     	mov	w9, #-0x1               ; =-1
 7ad315c: b8e90108     	ldaddal	w9, w8, [x8]
 7ad3160: 7100051f     	cmp	w8, #0x1
 7ad3164: 54000241     	b.ne	0x7ad31ac <_ChromeMain+0x7acdf10>
 7ad3168: 968cf978     	bl	0x1e11748 <_ChromeMain+0x1e0c4ac>
 7ad316c: 14000010     	b	0x7ad31ac <_ChromeMain+0x7acdf10>
 7ad3170: 910043e8     	add	x8, sp, #0x10
 7ad3174: aa1503e0     	mov	x0, x21
 7ad3178: 9635d277     	bl	0x847b54 <_ChromeMain+0x8428b8>
 7ad317c: f9400be0     	ldr	x0, [sp, #0x10]
 7ad3180: f841c3e8     	ldur	x8, [sp, #0x1c]
 7ad3184: f90007e8     	str	x8, [sp, #0x8]
 7ad3188: 910023e1     	add	x1, sp, #0x8
 7ad318c: aa1303e8     	mov	x8, x19
 7ad3190: aa1403e2     	mov	x2, x20
 7ad3194: d2800003     	mov	x3, #0x0                ; =0
 7ad3198: 964c85e2     	bl	0xdf4920 <_ChromeMain+0xdef684>
 7ad319c: 910023e0     	add	x0, sp, #0x8
 7ad31a0: 9614ff08     	bl	0x12dc0 <_ChromeMain+0xdb24>
 7ad31a4: 910043e0     	add	x0, sp, #0x10
 7ad31a8: 96a568dd     	bl	0x242d51c <_ChromeMain+0x2428280>
 7ad31ac: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 7ad31b0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 7ad31b4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 7ad31b8: 9101c3ff     	add	sp, sp, #0x70
 7ad31bc: d65f03c0     	ret
 7ad31c0: 968cf962     	bl	0x1e11748 <_ChromeMain+0x1e0c4ac>
 7ad31c4: 17ffffe2     	b	0x7ad314c <_ChromeMain+0x7acdeb0>
