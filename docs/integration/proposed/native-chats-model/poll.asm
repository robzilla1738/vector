
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463db48: d10183ff     	sub	sp, sp, #0x60
 463db4c: a9025ff8     	stp	x24, x23, [sp, #0x20]
 463db50: a90357f6     	stp	x22, x21, [sp, #0x30]
 463db54: a9044ff4     	stp	x20, x19, [sp, #0x40]
 463db58: a9057bfd     	stp	x29, x30, [sp, #0x50]
 463db5c: 910143fd     	add	x29, sp, #0x50
 463db60: 397e4008     	ldrb	w8, [x0, #0xf90]
 463db64: 37000088     	tbnz	w8, #0x0, 0x463db74 <_ChromeMain+0x46388d8>
 463db68: aa0003f3     	mov	x19, x0
 463db6c: f9497408     	ldr	x8, [x0, #0x12e8]
 463db70: b40000e8     	cbz	x8, 0x463db8c <_ChromeMain+0x46388f0>
 463db74: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 463db78: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 463db7c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 463db80: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 463db84: 910183ff     	add	sp, sp, #0x60
 463db88: d65f03c0     	ret
 463db8c: f948ee68     	ldr	x8, [x19, #0x11d8]
 463db90: b5ffff28     	cbnz	x8, 0x463db74 <_ChromeMain+0x46388d8>
 463db94: 39624268     	ldrb	w8, [x19, #0x890]
 463db98: 34fffee8     	cbz	w8, 0x463db74 <_ChromeMain+0x46388d8>
 463db9c: f9422e68     	ldr	x8, [x19, #0x458]
 463dba0: b40008a8     	cbz	x8, 0x463dcb4 <_ChromeMain+0x4638a18>
 463dba4: f9429d08     	ldr	x8, [x8, #0x538]
 463dba8: f9403515     	ldr	x21, [x8, #0x68]
 463dbac: b4000855     	cbz	x21, 0x463dcb4 <_ChromeMain+0x4638a18>
 463dbb0: aa0103f4     	mov	x20, x1
 463dbb4: b9537276     	ldr	w22, [x19, #0x1370]
 463dbb8: a9007fff     	stp	xzr, xzr, [sp]
 463dbbc: f9000bff     	str	xzr, [sp, #0x10]
 463dbc0: f94002a8     	ldr	x8, [x21]
 463dbc4: f940a508     	ldr	x8, [x8, #0x148]
 463dbc8: aa1503e0     	mov	x0, x21
 463dbcc: d63f0100     	blr	x8
 463dbd0: f9400008     	ldr	x8, [x0]
 463dbd4: f9401909     	ldr	x9, [x8, #0x30]
 463dbd8: 910003e8     	mov	x8, sp
 463dbdc: d63f0120     	blr	x9
 463dbe0: aa1503e0     	mov	x0, x21
 463dbe4: 972db159     	bl	0x11aa148 <_ChromeMain+0x11a4eac>
 463dbe8: f9413c08     	ldr	x8, [x0, #0x278]
 463dbec: b4000c08     	cbz	x8, 0x463dd6c <_ChromeMain+0x4638ad0>
 463dbf0: f9400115     	ldr	x21, [x8]
 463dbf4: b40000b5     	cbz	x21, 0x463dc08 <_ChromeMain+0x463896c>
 463dbf8: b9400aa8     	ldr	w8, [x21, #0x8]
 463dbfc: 31000508     	adds	w8, w8, #0x1
 463dc00: b9000aa8     	str	w8, [x21, #0x8]
 463dc04: 54000ba2     	b.hs	0x463dd78 <_ChromeMain+0x4638adc>
 463dc08: f94a0677     	ldr	x23, [x19, #0x1408]
 463dc0c: b40000d7     	cbz	x23, 0x463dc24 <_ChromeMain+0x4638988>
 463dc10: 52800028     	mov	w8, #0x1                ; =1
 463dc14: b82802e8     	ldadd	w8, w8, [x23]
 463dc18: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463dc1c: 6b09011f     	cmp	w8, w9
 463dc20: 54000b20     	b.eq	0x463dd84 <_ChromeMain+0x4638ae8>
 463dc24: f94a0a78     	ldr	x24, [x19, #0x1410]
 463dc28: 52800c00     	mov	w0, #0x60               ; =96
 463dc2c: 96e745cf     	bl	0xf368 <_ChromeMain+0xa0cc>
 463dc30: aa0003f3     	mov	x19, x0
 463dc34: 52800028     	mov	w8, #0x1                ; =1
 463dc38: b9000008     	str	w8, [x0]
 463dc3c: 101beca8     	adr	x8, 0x46759d0 <_ChromeMain+0x4670734>
 463dc40: d503201f     	nop
 463dc44: 101bf4a9     	adr	x9, 0x4675ad8 <_ChromeMain+0x467083c>
 463dc48: d503201f     	nop
 463dc4c: a900a408     	stp	x8, x9, [x0, #0x8]
 463dc50: b0ffd168     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 463dc54: 910a0108     	add	x8, x8, #0x280
 463dc58: 100009c9     	adr	x9, 0x463dd90 <_ChromeMain+0x4638af4>
 463dc5c: d503201f     	nop
 463dc60: a901a408     	stp	x8, x9, [x0, #0x18]
 463dc64: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 463dc68: f9001c18     	str	x24, [x0, #0x38]
 463dc6c: 39010014     	strb	w20, [x0, #0x40]
 463dc70: b9004416     	str	w22, [x0, #0x44]
 463dc74: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 463dc78: 37f806c8     	tbnz	w8, #0x1f, 0x463dd50 <_ChromeMain+0x4638ab4>
 463dc7c: 3dc003e0     	ldr	q0, [sp]
 463dc80: 3c848260     	stur	q0, [x19, #0x48]
 463dc84: f9400be8     	ldr	x8, [sp, #0x10]
 463dc88: f8058268     	stur	x8, [x19, #0x58]
 463dc8c: aa1503e0     	mov	x0, x21
 463dc90: aa1303e1     	mov	x1, x19
 463dc94: 97ec7b55     	bl	0x415c9e8 <_ChromeMain+0x415774c>
 463dc98: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 463dc9c: 36fff6c8     	tbz	w8, #0x1f, 0x463db74 <_ChromeMain+0x46388d8>
 463dca0: f94003e0     	ldr	x0, [sp]
 463dca4: f9400be8     	ldr	x8, [sp, #0x10]
 463dca8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463dcac: 96e72c83     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463dcb0: 17ffffb1     	b	0x463db74 <_ChromeMain+0x46388d8>
 463dcb4: d004c460     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463dcb8: 912e3000     	add	x0, x0, #0xb8c
 463dcbc: d004c461     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463dcc0: 912c7821     	add	x1, x1, #0xb1e
 463dcc4: 910003e8     	mov	x8, sp
 463dcc8: 52841062     	mov	w2, #0x2083             ; =8323
 463dccc: 96e84bed     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 463dcd0: f94a0674     	ldr	x20, [x19, #0x1408]
 463dcd4: b40000d4     	cbz	x20, 0x463dcec <_ChromeMain+0x4638a50>
 463dcd8: 52800028     	mov	w8, #0x1                ; =1
 463dcdc: b8280288     	ldadd	w8, w8, [x20]
 463dce0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463dce4: 6b09011f     	cmp	w8, w9
 463dce8: 540003c0     	b.eq	0x463dd60 <_ChromeMain+0x4638ac4>
 463dcec: 52826215     	mov	w21, #0x1310            ; =4880
 463dcf0: f94a0a76     	ldr	x22, [x19, #0x1410]
 463dcf4: 52800800     	mov	w0, #0x40               ; =64
 463dcf8: 96e7459c     	bl	0xf368 <_ChromeMain+0xa0cc>
 463dcfc: aa0003e3     	mov	x3, x0
 463dd00: 52800028     	mov	w8, #0x1                ; =1
 463dd04: d0ffcbe9     	adrp	x9, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 463dd08: 911c0129     	add	x9, x9, #0x700
 463dd0c: b0ffcb0a     	adrp	x10, 0x3f9e000 <_ChromeMain+0x3f98d64>
 463dd10: 9111014a     	add	x10, x10, #0x440
 463dd14: b9000008     	str	w8, [x0]
 463dd18: b0ffd168     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 463dd1c: 910a0108     	add	x8, x8, #0x280
 463dd20: 10fff10b     	adr	x11, 0x463db40 <_ChromeMain+0x46388a4>
 463dd24: d503201f     	nop
 463dd28: a900a809     	stp	x9, x10, [x0, #0x8]
 463dd2c: a901ac08     	stp	x8, x11, [x0, #0x18]
 463dd30: a902d01f     	stp	xzr, x20, [x0, #0x28]
 463dd34: f9001c16     	str	x22, [x0, #0x38]
 463dd38: 8b150260     	add	x0, x19, x21
 463dd3c: 910003e1     	mov	x1, sp
 463dd40: 52884802     	mov	w2, #0x4240             ; =16960
 463dd44: 72a001e2     	movk	w2, #0xf, lsl #16
 463dd48: 96f9b1ef     	bl	0x4aa504 <_ChromeMain+0x4a5268>
 463dd4c: 17ffff8a     	b	0x463db74 <_ChromeMain+0x46388d8>
 463dd50: a9400be1     	ldp	x1, x2, [sp]
 463dd54: 91012260     	add	x0, x19, #0x48
 463dd58: 96e76930     	bl	0x18218 <_ChromeMain+0x12f7c>
 463dd5c: 17ffffcc     	b	0x463dc8c <_ChromeMain+0x46389f0>
 463dd60: d4200000     	brk	#0
 463dd64: d4400000     	hlt	#0
 463dd68: d4200020     	brk	#0x1
 463dd6c: d4200000     	brk	#0
