
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42589ac: f9403688     	ldr	x8, [x20, #0x68]
 42589b0: f9403908     	ldr	x8, [x8, #0x70]
 42589b4: b40000a8     	cbz	x8, 0x42589c8 <_ChromeMain+0x425372c>
 42589b8: aa1503e0     	mov	x0, x21
 42589bc: 52800001     	mov	w1, #0x0                ; =0
 42589c0: 97b4a057     	bl	0x2f80b1c <_ChromeMain+0x2f7b880>
 42589c4: b50006e0     	cbnz	x0, 0x4258aa0 <_ChromeMain+0x4253804>
 42589c8: 52800028     	mov	w8, #0x1                ; =1
 42589cc: 39004a88     	strb	w8, [x20, #0x12]
 42589d0: aa1403e0     	mov	x0, x20
 42589d4: 940000ab     	bl	0x4258c80 <_ChromeMain+0x42539e4>
 42589d8: b40000d9     	cbz	x25, 0x42589f0 <_ChromeMain+0x4253754>
 42589dc: 91002328     	add	x8, x25, #0x8
 42589e0: 12800009     	mov	w9, #-0x1               ; =-1
 42589e4: b8e90108     	ldaddal	w9, w8, [x8]
 42589e8: 7100051f     	cmp	w8, #0x1
 42589ec: 54000120     	b.eq	0x4258a10 <_ChromeMain+0x4253774>
 42589f0: 910683ff     	add	sp, sp, #0x1a0
 42589f4: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42589f8: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42589fc: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4258a00: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4258a04: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4258a08: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4258a0c: d65f03c0     	ret
 4258a10: aa1903e0     	mov	x0, x25
 4258a14: 94d72a60     	bl	0x7823394 <_ChromeMain+0x781e0f8>
 4258a18: 17fffff6     	b	0x42589f0 <_ChromeMain+0x4253754>
 4258a1c: 12800008     	mov	w8, #-0x1               ; =-1
 4258a20: b8e802c8     	ldaddal	w8, w8, [x22]
 4258a24: 7100051f     	cmp	w8, #0x1
 4258a28: 54fffb61     	b.ne	0x4258994 <_ChromeMain+0x42536f8>
 4258a2c: f9400ac8     	ldr	x8, [x22, #0x10]
 4258a30: aa1603e0     	mov	x0, x22
 4258a34: d63f0100     	blr	x8
 4258a38: 17ffffd7     	b	0x4258994 <_ChromeMain+0x42536f8>
 4258a3c: f94002e8     	ldr	x8, [x23]
 4258a40: f9401508     	ldr	x8, [x8, #0x28]
 4258a44: 9104c302     	add	x2, x24, #0x130
 4258a48: 910143e3     	add	x3, sp, #0x50
 4258a4c: aa1703e0     	mov	x0, x23
 4258a50: aa1803e1     	mov	x1, x24
 4258a54: d63f0100     	blr	x8
 4258a58: 9106a318     	add	x24, x24, #0x1a8
 4258a5c: eb19031f     	cmp	x24, x25
 4258a60: 54fff980     	b.eq	0x4258990 <_ChromeMain+0x42536f4>
 4258a64: 52800600     	mov	w0, #0x30               ; =48
 4258a68: 96f6da40     	bl	0xf368 <_ChromeMain+0xa0cc>
 4258a6c: aa0003e4     	mov	x4, x0
 4258a70: b900001b     	str	w27, [x0]
 4258a74: a900f01a     	stp	x26, x28, [x0, #0x8]
 4258a78: f9000c13     	str	x19, [x0, #0x18]
 4258a7c: f9001416     	str	x22, [x0, #0x28]
 4258a80: b4fffdf6     	cbz	x22, 0x4258a3c <_ChromeMain+0x42537a0>
 4258a84: b83b02c8     	ldadd	w27, w8, [x22]
 4258a88: 7100011f     	cmp	w8, #0x0
 4258a8c: 540006ed     	b.le	0x4258b68 <_ChromeMain+0x42538cc>
 4258a90: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4258a94: 6b09011f     	cmp	w8, w9
 4258a98: 540006e0     	b.eq	0x4258b74 <_ChromeMain+0x42538d8>
 4258a9c: 17ffffe8     	b	0x4258a3c <_ChromeMain+0x42537a0>
 4258aa0: aa0003f5     	mov	x21, x0
 4258aa4: f9403688     	ldr	x8, [x20, #0x68]
 4258aa8: a946e116     	ldp	x22, x24, [x8, #0x68]
 4258aac: a900e3f6     	stp	x22, x24, [sp, #0x8]
 4258ab0: f9403d17     	ldr	x23, [x8, #0x78]
 4258ab4: a906fd1f     	stp	xzr, xzr, [x8, #0x68]
 4258ab8: f9003d1f     	str	xzr, [x8, #0x78]
 4258abc: f9000ff7     	str	x23, [sp, #0x18]
 4258ac0: 910083e8     	add	x8, sp, #0x20
 4258ac4: 910023e0     	add	x0, sp, #0x8
 4258ac8: 94ac4ec5     	bl	0x6d6c5dc <_ChromeMain+0x6d67340>
 4258acc: f9404293     	ldr	x19, [x20, #0x80]
 4258ad0: b40000d3     	cbz	x19, 0x4258ae8 <_ChromeMain+0x425384c>
 4258ad4: 52800028     	mov	w8, #0x1                ; =1
 4258ad8: b8280268     	ldadd	w8, w8, [x19]
 4258adc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4258ae0: 6b09011f     	cmp	w8, w9
 4258ae4: 540007c0     	b.eq	0x4258bdc <_ChromeMain+0x4253940>
 4258ae8: f9404694     	ldr	x20, [x20, #0x88]
 4258aec: 52800800     	mov	w0, #0x40               ; =64
 4258af0: 96f6da1e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4258af4: aa0003e2     	mov	x2, x0
 4258af8: 52800028     	mov	w8, #0x1                ; =1
 4258afc: d0ffe8a9     	adrp	x9, 0x3f6e000 <_ChromeMain+0x3f68d64>
 4258b00: 91230129     	add	x9, x9, #0x8c0
 4258b04: 90ffe8aa     	adrp	x10, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4258b08: 912b014a     	add	x10, x10, #0xac0
 4258b0c: b9000008     	str	w8, [x0]
 4258b10: d0fff2a8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4258b14: 911b0108     	add	x8, x8, #0x6c0
 4258b18: 10000aab     	adr	x11, 0x4258c6c <_ChromeMain+0x42539d0>
 4258b1c: d503201f     	nop
 4258b20: a900a809     	stp	x9, x10, [x0, #0x8]
 4258b24: a901ac08     	stp	x8, x11, [x0, #0x18]
 4258b28: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4258b2c: f9001c14     	str	x20, [x0, #0x38]
 4258b30: 910083e1     	add	x1, sp, #0x20
 4258b34: aa1503e0     	mov	x0, x21
 4258b38: 94ac6821     	bl	0x6d72bbc <_ChromeMain+0x6d6d920>
 4258b3c: f94013f3     	ldr	x19, [sp, #0x20]
 4258b40: b5000593     	cbnz	x19, 0x4258bf0 <_ChromeMain+0x4253954>
 4258b44: b50002b6     	cbnz	x22, 0x4258b98 <_ChromeMain+0x42538fc>
 4258b48: 910022a8     	add	x8, x21, #0x8
 4258b4c: 12800009     	mov	w9, #-0x1               ; =-1
 4258b50: b8e90108     	ldaddal	w9, w8, [x8]
 4258b54: 7100051f     	cmp	w8, #0x1
 4258b58: 54fff401     	b.ne	0x42589d8 <_ChromeMain+0x425373c>
 4258b5c: aa1503e0     	mov	x0, x21
 4258b60: 97923dff     	bl	0x26e835c <_ChromeMain+0x26e30c0>
 4258b64: 17ffff9d     	b	0x42589d8 <_ChromeMain+0x425373c>
