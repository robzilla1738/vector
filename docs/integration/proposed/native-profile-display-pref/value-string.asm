
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  bddb80: d10183ff     	sub	sp, sp, #0x60
  bddb84: a9025ff8     	stp	x24, x23, [sp, #0x20]
  bddb88: a90357f6     	stp	x22, x21, [sp, #0x30]
  bddb8c: a9044ff4     	stp	x20, x19, [sp, #0x40]
  bddb90: a9057bfd     	stp	x29, x30, [sp, #0x50]
  bddb94: 910143fd     	add	x29, sp, #0x50
  bddb98: 92800208     	mov	x8, #-0x11              ; =-17
  bddb9c: f2efffe8     	movk	x8, #0x7fff, lsl #48
  bddba0: eb08005f     	cmp	x2, x8
  bddba4: 54000542     	b.hs	0xbddc4c <_ChromeMain+0xbd89b0>
  bddba8: aa0203f4     	mov	x20, x2
  bddbac: aa0103f5     	mov	x21, x1
  bddbb0: aa0003f3     	mov	x19, x0
  bddbb4: f100585f     	cmp	x2, #0x16
  bddbb8: 54000368     	b.hi	0xbddc24 <_ChromeMain+0xbd8988>
  bddbbc: 39007ff4     	strb	w20, [sp, #0x1f]
  bddbc0: 910023f6     	add	x22, sp, #0x8
  bddbc4: 8b1402c8     	add	x8, x22, x20
  bddbc8: eb16011f     	cmp	x8, x22
  bddbcc: 540003e3     	b.lo	0xbddc48 <_ChromeMain+0xbd89ac>
  bddbd0: eb15011f     	cmp	x8, x21
  bddbd4: fa5582c2     	ccmp	x22, x21, #0x2, hi
  bddbd8: 54000389     	b.ls	0xbddc48 <_ChromeMain+0xbd89ac>
  bddbdc: aa1603e0     	mov	x0, x22
  bddbe0: aa1503e1     	mov	x1, x21
  bddbe4: aa1403e2     	mov	x2, x20
  bddbe8: 95d0c5b9     	bl	0x800f2cc <_ChromeMain+0x800a030>
  bddbec: 38346adf     	strb	wzr, [x22, x20]
  bddbf0: 3cc083e0     	ldur	q0, [sp, #0x8]
  bddbf4: 3d800260     	str	q0, [x19]
  bddbf8: f9400fe8     	ldr	x8, [sp, #0x18]
  bddbfc: f9000a68     	str	x8, [x19, #0x10]
  bddc00: 52800088     	mov	w8, #0x4                ; =4
  bddc04: 39006268     	strb	w8, [x19, #0x18]
  bddc08: aa1303e0     	mov	x0, x19
  bddc0c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
  bddc10: a9444ff4     	ldp	x20, x19, [sp, #0x40]
  bddc14: a94357f6     	ldp	x22, x21, [sp, #0x30]
  bddc18: a9425ff8     	ldp	x24, x23, [sp, #0x20]
  bddc1c: 910183ff     	add	sp, sp, #0x60
  bddc20: d65f03c0     	ret
  bddc24: 927cea97     	and	x23, x20, #0x7ffffffffffffff0
  bddc28: 910042e0     	add	x0, x23, #0x10
  bddc2c: 97d0c5cf     	bl	0xf368 <_ChromeMain+0xa0cc>
  bddc30: aa0003f6     	mov	x22, x0
  bddc34: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
  bddc38: cb0802e8     	sub	x8, x23, x8
  bddc3c: a900d3e0     	stp	x0, x20, [sp, #0x8]
  bddc40: f9000fe8     	str	x8, [sp, #0x18]
  bddc44: 17ffffe0     	b	0xbddbc4 <_ChromeMain+0xbd8928>
  bddc48: d4200020     	brk	#0x1
  bddc4c: 950089d0     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
