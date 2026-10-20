
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  6bed5c:      	stp	x20, x19, [sp, #-0x20]!
  6bed60:      	stp	x29, x30, [sp, #0x10]
  6bed64:      	add	x29, sp, #0x10
  6bed68:      	mov	x19, x0
  6bed6c:      	strb	wzr, [x0]
  6bed70:      	mov	w8, #0xff               ; =255
  6bed74:      	strb	w8, [x0, #0x20]
  6bed78:      	bl	0x6bed8c <_ChromeMain+0x6b9af0>
  6bed7c:      	mov	x0, x19
  6bed80:      	ldp	x29, x30, [sp, #0x10]
  6bed84:      	ldp	x20, x19, [sp], #0x20
  6bed88:      	ret
  6bed8c:      	stp	x24, x23, [sp, #-0x40]!
  6bed90:      	stp	x22, x21, [sp, #0x10]
  6bed94:      	stp	x20, x19, [sp, #0x20]
  6bed98:      	stp	x29, x30, [sp, #0x30]
  6bed9c:      	add	x29, sp, #0x30
  6beda0:      	mov	x20, x1
  6beda4:      	mov	x19, x0
  6beda8:      	ldrb	w8, [x0, #0x20]
  6bedac:      	cmp	w8, #0xff
  6bedb0:      	b.ne	0x6bee68 <_ChromeMain+0x6b9bcc>
  6bedb4:      	mov	w8, #0xff               ; =255
  6bedb8:      	strb	w8, [x19, #0x20]
  6bedbc:      	ldrb	w22, [x20, #0x20]
  6bedc0:      	cbnz	w22, 0x6bee24 <_ChromeMain+0x6b9b88>
  6bedc4:      	cbz	x19, 0x6beeb0 <_ChromeMain+0x6b9c14>
  6bedc8:      	ldr	x21, [x20]
  6bedcc:      	and	x8, x21, #0xfffffffc00000000
  6bedd0:      	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
  6bedd4:      	ldr	x9, [x23, #0x88]
  6bedd8:      	cmp	x8, x9
  6beddc:      	b.eq	0x6bee50 <_ChromeMain+0x6b9bb4>
  6bede0:      	str	x21, [x19]
  6bede4:      	ldr	x8, [x20, #0x8]
  6bede8:      	ldr	w9, [x20, #0x10]
  6bedec:      	str	w9, [x19, #0x10]
  6bedf0:      	str	x8, [x19, #0x8]
  6bedf4:      	ldr	x20, [x20, #0x18]
  6bedf8:      	and	x8, x20, #0xfffffffc00000000
  6bedfc:      	ldr	x9, [x23, #0x88]
  6bee00:      	cmp	x8, x9
  6bee04:      	b.eq	0x6bee5c <_ChromeMain+0x6b9bc0>
  6bee08:      	str	x20, [x19, #0x18]
  6bee0c:      	strb	w22, [x19, #0x20]
  6bee10:      	ldp	x29, x30, [sp, #0x30]
  6bee14:      	ldp	x20, x19, [sp, #0x20]
  6bee18:      	ldp	x22, x21, [sp, #0x10]
  6bee1c:      	ldp	x24, x23, [sp], #0x40
  6bee20:      	ret
  6bee24:      	cmp	w22, #0x1
  6bee28:      	b.ne	0x6beeb4 <_ChromeMain+0x6b9c18>
  6bee2c:      	cbz	x19, 0x6beeb0 <_ChromeMain+0x6b9c14>
  6bee30:      	ldr	x8, [x20]
  6bee34:      	str	x8, [x19]
  6bee38:      	cbz	x8, 0x6bee0c <_ChromeMain+0x6b9b70>
  6bee3c:      	ldr	w9, [x8]
  6bee40:      	adds	w9, w9, #0x1
  6bee44:      	str	w9, [x8]
  6bee48:      	b.lo	0x6bee0c <_ChromeMain+0x6b9b70>
  6bee4c:      	b	0x6bef00 <_ChromeMain+0x6b9c64>
  6bee50:      	mov	x0, x21
  6bee54:      	bl	0x142fc <_ChromeMain+0xf060>
  6bee58:      	b	0x6bede0 <_ChromeMain+0x6b9b44>
  6bee5c:      	mov	x0, x20
  6bee60:      	bl	0x142fc <_ChromeMain+0xf060>
  6bee64:      	b	0x6bee08 <_ChromeMain+0x6b9b6c>
  6bee68:      	cbnz	w8, 0x6bee78 <_ChromeMain+0x6b9bdc>
  6bee6c:      	mov	x0, x19
  6bee70:      	bl	0x3a78af0 <_ChromeMain+0x3a73854>
  6bee74:      	b	0x6bedb4 <_ChromeMain+0x6b9b18>
  6bee78:      	cmp	w8, #0x1
  6bee7c:      	b.ne	0x6bee8c <_ChromeMain+0x6b9bf0>
  6bee80:      	mov	x0, x19
  6bee84:      	bl	0x3a8cb1c <_ChromeMain+0x3a87880>
  6bee88:      	b	0x6bedb4 <_ChromeMain+0x6b9b18>
  6bee8c:      	ldr	x0, [x19]
  6bee90:      	cbz	x0, 0x6bedb4 <_ChromeMain+0x6b9b18>
  6bee94:      	mov	w8, #-0x1               ; =-1
  6bee98:      	ldaddal	w8, w8, [x0]
  6bee9c:      	cmp	w8, #0x1
  6beea0:      	b.ne	0x6bedb4 <_ChromeMain+0x6b9b18>
  6beea4:      	ldr	x8, [x0, #0x10]
  6beea8:      	blr	x8
  6beeac:      	b	0x6bedb4 <_ChromeMain+0x6b9b18>
  6beeb0:      	brk	#0x1
