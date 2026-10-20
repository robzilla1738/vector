
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 21cff80:      	sub	sp, sp, #0x40
 21cff84:      	stp	d9, d8, [sp, #0x10]
 21cff88:      	stp	x20, x19, [sp, #0x20]
 21cff8c:      	stp	x29, x30, [sp, #0x30]
 21cff90:      	add	x29, sp, #0x30
 21cff94:      	cmp	w0, #0x20
 21cff98:      	b.hi	0x21d0198 <_ChromeMain+0x21caefc>
 21cff9c:      	mov.16b	v8, v0
 21cffa0:      	mov	w8, w0
 21cffa4:      	adrp	x9, 0xd226000 <dyld_stub_binder+0xd226000>
 21cffa8:      	add	x9, x9, #0x3c0
 21cffac:      	adr	x10, 0x21cffac <_ChromeMain+0x21cad10>
 21cffb0:      	ldrsw	x11, [x9, x8, lsl #2]
 21cffb4:      	add	x10, x10, x11
 21cffb8:      	br	x10
 21cffbc:      	fmov	d0, #1.00000000
 21cffc0:      	fsub	d1, d0, d8
 21cffc4:      	fmul	d1, d1, d1
 21cffc8:      	fsub	d8, d0, d1
 21cffcc:      	mov.16b	v0, v8
 21cffd0:      	ldp	x29, x30, [sp, #0x30]
 21cffd4:      	ldp	x20, x19, [sp, #0x20]
 21cffd8:      	ldp	d9, d8, [sp, #0x10]
 21cffdc:      	add	sp, sp, #0x40
 21cffe0:      	ret
 21cffe4:      	fmul	d8, d8, d8
 21cffe8:      	b	0x21cffcc <_ChromeMain+0x21cad30>
 21cffec:      	fadd	d1, d8, d8
 21cfff0:      	fmul	d1, d1, d1
 21cfff4:      	fmul	d8, d1, d0
 21cfff8:      	b	0x21cffcc <_ChromeMain+0x21cad30>
 21cfffc:      	fmov	d0, #0.50000000
 21d0000:      	fcmp	d8, d0
 21d0004:      	b.mi	0x21cffec <_ChromeMain+0x21cad50>
 21d0008:      	fmov	d0, #-1.00000000
 21d000c:      	fadd	d0, d8, d0
 21d0010:      	fadd	d0, d0, d0
 21d0014:      	fmul	d0, d0, d0
 21d0018:      	fmov	d1, #-0.50000000
 21d001c:      	fmul	d0, d0, d1
 21d0020:      	fmov	d1, #1.00000000
 21d0024:      	fadd	d8, d0, d1
 21d0028:      	b	0x21cffcc <_ChromeMain+0x21cad30>
 21d002c:      	adrp	x8, 0xed5b000 <dyld_stub_binder+0xed5b000>
 21d0030:      	add	x8, x8, #0xf48
 21d0034:      	ldaprb	w8, [x8]
 21d0038:      	tbz	w8, #0x0, 0x21d00e8 <_ChromeMain+0x21cae4c>
 21d003c:      	adrp	x0, 0xed5b000 <dyld_stub_binder+0xed5b000>
 21d0040:      	add	x0, x0, #0xea0
 21d0044:      	mov.16b	v0, v8
 21d0048:      	ldp	x29, x30, [sp, #0x30]
 21d004c:      	ldp	x20, x19, [sp, #0x20]
 21d0050:      	ldp	d9, d8, [sp, #0x10]
 21d0054:      	add	sp, sp, #0x40
 21d0058:      	b	0x194e340 <_ChromeMain+0x19490a4>
 21d005c:      	adrp	x8, 0xed5b000 <dyld_stub_binder+0xed5b000>
 21d0060:      	add	x8, x8, #0xde8
 21d0064:      	ldaprb	w8, [x8]
 21d0068:      	tbnz	w8, #0x0, 0x21d00dc <_ChromeMain+0x21cae40>
 21d006c:      	adrp	x19, 0xed5b000 <dyld_stub_binder+0xed5b000>
 21d0070:      	add	x19, x19, #0xde8
 21d0074:      	mov	x0, x19
 21d0078:      	bl	0x80048c0 <_ChromeMain+0x7fff624>
 21d007c:      	cbz	w0, 0x21d00dc <_ChromeMain+0x21cae40>
 21d0080:      	adrp	x0, 0xed5b000 <dyld_stub_binder+0xed5b000>
 21d0084:      	add	x0, x0, #0xd40
 21d0088:      	adrp	x8, 0xdf4c000 <dyld_stub_binder+0xdf4c000>
 21d008c:      	ldr	d0, [x8, #0xd0]
 21d0090:      	nop
 21d0094:      	ldr	d2, [x8, #0x978]
 21d0098:      	movi.2d	v1, #0000000000000000
 21d009c:      	fmov	d3, #1.00000000
 21d00a0:      	bl	0x1f23700 <_ChromeMain+0x1f1e464>
 21d00a4:      	mov	w20, #0x1               ; =1
 21d00a8:      	stlrb	w20, [x19]
 21d00ac:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 21d00b0:      	add	x0, x0, #0x9f0
 21d00b4:      	bl	0x80048cc <_ChromeMain+0x7fff630>
 21d00b8:      	cbnz	w0, 0x21d048c <_ChromeMain+0x21cb1f0>
 21d00bc:      	adrp	x8, 0xed5b000 <dyld_stub_binder+0xed5b000>
 21d00c0:      	ldrb	w19, [x8, #0xde9]
 21d00c4:      	strb	w20, [x8, #0xde9]
 21d00c8:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 21d00cc:      	add	x0, x0, #0x9f0
 21d00d0:      	bl	0x8004904 <_ChromeMain+0x7fff668>
 21d00d4:      	cbnz	w0, 0x21d04c4 <_ChromeMain+0x21cb228>
 21d00d8:      	tbnz	w19, #0x2, 0x21d017c <_ChromeMain+0x21caee0>
 21d00dc:      	adrp	x0, 0xed5b000 <dyld_stub_binder+0xed5b000>
 21d00e0:      	add	x0, x0, #0xd40
 21d00e4:      	b	0x21d0044 <_ChromeMain+0x21cada8>
