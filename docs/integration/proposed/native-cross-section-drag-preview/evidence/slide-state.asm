
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 21cfec0:      	stp	d9, d8, [sp, #-0x30]!
 21cfec4:      	stp	x20, x19, [sp, #0x10]
 21cfec8:      	stp	x29, x30, [sp, #0x20]
 21cfecc:      	add	x29, sp, #0x20
 21cfed0:      	mov	x19, x0
 21cfed4:      	ldr	w0, [x0, #0x50]
 21cfed8:      	fmov	d8, #1.00000000
 21cfedc:      	fcmp	d0, d8
 21cfee0:      	fcsel	d1, d8, d0, gt
 21cfee4:      	fcmp	d0, #0.0
 21cfee8:      	movi.2d	v0, #0000000000000000
 21cfeec:      	fcsel	d0, d0, d1, mi
 21cfef0:      	bl	0x21cff80 <_ChromeMain+0x21cace4>
 21cfef4:      	fcmp	d0, d8
 21cfef8:      	b.eq	0x21cff3c <_ChromeMain+0x21caca0>
 21cfefc:      	ldp	d2, d1, [x19, #0x60]
 21cff00:      	fsub	d3, d1, d2
 21cff04:      	fmul	d0, d0, d3
 21cff08:      	fadd	d0, d2, d0
 21cff0c:      	str	d0, [x19, #0x70]
 21cff10:      	fcmp	d1, d2
 21cff14:      	b.lt	0x21cff30 <_ChromeMain+0x21cac94>
 21cff18:      	fcmp	d0, d1
 21cff1c:      	b.gt	0x21cff4c <_ChromeMain+0x21cacb0>
 21cff20:      	ldp	x29, x30, [sp, #0x20]
 21cff24:      	ldp	x20, x19, [sp, #0x10]
 21cff28:      	ldp	d9, d8, [sp], #0x30
 21cff2c:      	ret
 21cff30:      	fcmp	d0, d1
 21cff34:      	b.pl	0x21cff20 <_ChromeMain+0x21cac84>
 21cff38:      	b	0x21cff4c <_ChromeMain+0x21cacb0>
 21cff3c:      	ldrb	w8, [x19, #0x58]
 21cff40:      	cbz	w8, 0x21cfefc <_ChromeMain+0x21cac60>
 21cff44:      	strb	wzr, [x19, #0x58]
 21cff48:      	b	0x21cfefc <_ChromeMain+0x21cac60>
 21cff4c:      	str	d1, [x19, #0x70]
 21cff50:      	b	0x21cff20 <_ChromeMain+0x21cac84>
		...
