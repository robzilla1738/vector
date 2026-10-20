
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
 463dd70: d4400000     	hlt	#0
 463dd74: d4200020     	brk	#0x1
 463dd78: d4200000     	brk	#0
 463dd7c: d4400000     	hlt	#0
 463dd80: d4200020     	brk	#0x1
 463dd84: d4200000     	brk	#0
 463dd88: d4400000     	hlt	#0
 463dd8c: d4200020     	brk	#0x1
 463dd90: d10643ff     	sub	sp, sp, #0x190
 463dd94: a9136ffc     	stp	x28, x27, [sp, #0x130]
 463dd98: a91467fa     	stp	x26, x25, [sp, #0x140]
 463dd9c: a9155ff8     	stp	x24, x23, [sp, #0x150]
 463dda0: a91657f6     	stp	x22, x21, [sp, #0x160]
 463dda4: a9174ff4     	stp	x20, x19, [sp, #0x170]
 463dda8: a9187bfd     	stp	x29, x30, [sp, #0x180]
 463ddac: 910603fd     	add	x29, sp, #0x180
 463ddb0: 397e4008     	ldrb	w8, [x0, #0xf90]
 463ddb4: 370003c8     	tbnz	w8, #0x0, 0x463de2c <_ChromeMain+0x4638b90>
 463ddb8: aa0003f3     	mov	x19, x0
 463ddbc: 39624008     	ldrb	w8, [x0, #0x890]
 463ddc0: 34000368     	cbz	w8, 0x463de2c <_ChromeMain+0x4638b90>
 463ddc4: aa0203f5     	mov	x21, x2
 463ddc8: b9537268     	ldr	w8, [x19, #0x1370]
 463ddcc: 6b08005f     	cmp	w2, w8
 463ddd0: 540002e1     	b.ne	0x463de2c <_ChromeMain+0x4638b90>
 463ddd4: f9422e68     	ldr	x8, [x19, #0x458]
 463ddd8: b40002a8     	cbz	x8, 0x463de2c <_ChromeMain+0x4638b90>
 463dddc: f9429d08     	ldr	x8, [x8, #0x538]
 463dde0: f9403500     	ldr	x0, [x8, #0x68]
 463dde4: b4000240     	cbz	x0, 0x463de2c <_ChromeMain+0x4638b90>
 463dde8: aa0403f7     	mov	x23, x4
 463ddec: aa0303f4     	mov	x20, x3
 463ddf0: aa0103f6     	mov	x22, x1
 463ddf4: f9400008     	ldr	x8, [x0]
 463ddf8: f940a508     	ldr	x8, [x8, #0x148]
 463ddfc: d63f0100     	blr	x8
 463de00: f9400008     	ldr	x8, [x0]
 463de04: f9401909     	ldr	x9, [x8, #0x30]
 463de08: 910263e8     	add	x8, sp, #0x98
 463de0c: d63f0120     	blr	x9
 463de10: 910263e0     	add	x0, sp, #0x98
 463de14: aa1403e1     	mov	x1, x20
 463de18: 972a38bb     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 463de1c: aa0003f8     	mov	x24, x0
 463de20: 39c2bfe8     	ldrsb	w8, [sp, #0xaf]
 463de24: 37f80148     	tbnz	w8, #0x1f, 0x463de4c <_ChromeMain+0x4638bb0>
 463de28: 350001d8     	cbnz	w24, 0x463de60 <_ChromeMain+0x4638bc4>
 463de2c: a9587bfd     	ldp	x29, x30, [sp, #0x180]
 463de30: a9574ff4     	ldp	x20, x19, [sp, #0x170]
 463de34: a95657f6     	ldp	x22, x21, [sp, #0x160]
 463de38: a9555ff8     	ldp	x24, x23, [sp, #0x150]
 463de3c: a95467fa     	ldp	x26, x25, [sp, #0x140]
 463de40: a9536ffc     	ldp	x28, x27, [sp, #0x130]
 463de44: 910643ff     	add	sp, sp, #0x190
 463de48: d65f03c0     	ret
 463de4c: f9404fe0     	ldr	x0, [sp, #0x98]
 463de50: f94057e8     	ldr	x8, [sp, #0xa8]
 463de54: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463de58: 96e72c18     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463de5c: 34fffe98     	cbz	w24, 0x463de2c <_ChromeMain+0x4638b90>
 463de60: f9422e68     	ldr	x8, [x19, #0x458]
 463de64: b40000c8     	cbz	x8, 0x463de7c <_ChromeMain+0x4638be0>
 463de68: f9429d08     	ldr	x8, [x8, #0x538]
 463de6c: f9403518     	ldr	x24, [x8, #0x68]
 463de70: b4000078     	cbz	x24, 0x463de7c <_ChromeMain+0x4638be0>
 463de74: 394062e8     	ldrb	w8, [x23, #0x18]
 463de78: 35000588     	cbnz	w8, 0x463df28 <_ChromeMain+0x4638c8c>
 463de7c: 397e4268     	ldrb	w8, [x19, #0xf90]
 463de80: 3707fd68     	tbnz	w8, #0x0, 0x463de2c <_ChromeMain+0x4638b90>
 463de84: 39624268     	ldrb	w8, [x19, #0x890]
 463de88: 34fffd28     	cbz	w8, 0x463de2c <_ChromeMain+0x4638b90>
 463de8c: d004c460     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463de90: 912e3000     	add	x0, x0, #0xb8c
 463de94: d004c461     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463de98: 912c7821     	add	x1, x1, #0xb1e
 463de9c: 910263e8     	add	x8, sp, #0x98
 463dea0: 52841062     	mov	w2, #0x2083             ; =8323
 463dea4: 96e84b77     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 463dea8: f94a0674     	ldr	x20, [x19, #0x1408]
 463deac: b40000d4     	cbz	x20, 0x463dec4 <_ChromeMain+0x4638c28>
 463deb0: 52800028     	mov	w8, #0x1                ; =1
 463deb4: b8280288     	ldadd	w8, w8, [x20]
 463deb8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463debc: 6b09011f     	cmp	w8, w9
 463dec0: 54002220     	b.eq	0x463e304 <_ChromeMain+0x4639068>
 463dec4: 52826215     	mov	w21, #0x1310            ; =4880
 463dec8: f94a0a76     	ldr	x22, [x19, #0x1410]
 463decc: 52800800     	mov	w0, #0x40               ; =64
 463ded0: 96e74526     	bl	0xf368 <_ChromeMain+0xa0cc>
 463ded4: aa0003e3     	mov	x3, x0
 463ded8: 52800028     	mov	w8, #0x1                ; =1
 463dedc: d0ffcbe9     	adrp	x9, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 463dee0: 911c0129     	add	x9, x9, #0x700
 463dee4: b0ffcb0a     	adrp	x10, 0x3f9e000 <_ChromeMain+0x3f98d64>
 463dee8: 9111014a     	add	x10, x10, #0x440
 463deec: b9000008     	str	w8, [x0]
 463def0: b0ffd168     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 463def4: 910a0108     	add	x8, x8, #0x280
 463def8: 10ffe24b     	adr	x11, 0x463db40 <_ChromeMain+0x46388a4>
 463defc: d503201f     	nop
 463df00: a900a809     	stp	x9, x10, [x0, #0x8]
 463df04: a901ac08     	stp	x8, x11, [x0, #0x18]
 463df08: a902d01f     	stp	xzr, x20, [x0, #0x28]
 463df0c: f9001c16     	str	x22, [x0, #0x38]
 463df10: 8b150260     	add	x0, x19, x21
 463df14: 910263e1     	add	x1, sp, #0x98
 463df18: 52884802     	mov	w2, #0x4240             ; =16960
 463df1c: 72a001e2     	movk	w2, #0xf, lsl #16
 463df20: 96f9b179     	bl	0x4aa504 <_ChromeMain+0x4a5268>
 463df24: 17ffffc2     	b	0x463de2c <_ChromeMain+0x4638b90>
 463df28: 39805ee8     	ldrsb	x8, [x23, #0x17]
 463df2c: b6f80048     	tbz	x8, #0x3f, 0x463df34 <_ChromeMain+0x4638c98>
 463df30: f94006e8     	ldr	x8, [x23, #0x8]
 463df34: b4fffa48     	cbz	x8, 0x463de7c <_ChromeMain+0x4638be0>
 463df38: 5280e600     	mov	w0, #0x730              ; =1840
 463df3c: 96e7450b     	bl	0xf368 <_ChromeMain+0xa0cc>
 463df40: aa0003f9     	mov	x25, x0
 463df44: 96ebf055     	bl	0x13a098 <_ChromeMain+0x134dfc>
 463df48: f9422e68     	ldr	x8, [x19, #0x458]
 463df4c: b4000208     	cbz	x8, 0x463df8c <_ChromeMain+0x4638cf0>
 463df50: f9429d08     	ldr	x8, [x8, #0x538]
 463df54: f940351a     	ldr	x26, [x8, #0x68]
 463df58: b40001da     	cbz	x26, 0x463df90 <_ChromeMain+0x4638cf4>
 463df5c: 39412348     	ldrb	w8, [x26, #0x48]
 463df60: 37000188     	tbnz	w8, #0x0, 0x463df90 <_ChromeMain+0x4638cf4>
 463df64: f9400348     	ldr	x8, [x26]
 463df68: f940b508     	ldr	x8, [x8, #0x168]
 463df6c: aa1a03e0     	mov	x0, x26
 463df70: d63f0100     	blr	x8
 463df74: b40000e0     	cbz	x0, 0x463df90 <_ChromeMain+0x4638cf4>
 463df78: 140000d1     	b	0x463e2bc <_ChromeMain+0x4639020>
 463df7c: 52800068     	mov	w8, #0x3                ; =3
 463df80: f9000728     	str	x8, [x25, #0x8]
 463df84: f9400328     	ldr	x8, [x25]
 463df88: 14000045     	b	0x463e09c <_ChromeMain+0x4638e00>
 463df8c: d280001a     	mov	x26, #0x0               ; =0
 463df90: aa1a03e0     	mov	x0, x26
 463df94: 97eb158b     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 463df98: 92600008     	and	x8, x0, #0x100000000
 463df9c: 2a0003e9     	mov	w9, w0
 463dfa0: aa090108     	orr	x8, x8, x9
 463dfa4: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 463dfa8: eb09011f     	cmp	x8, x9
 463dfac: 9a89811a     	csel	x26, x8, x9, hi
 463dfb0: 90048541     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 463dfb4: 9107b421     	add	x1, x1, #0x1ed
 463dfb8: 910263fb     	add	x27, sp, #0x98
 463dfbc: 910263e0     	add	x0, sp, #0x98
 463dfc0: 528005e2     	mov	w2, #0x2f               ; =47
 463dfc4: 96f4c884     	bl	0x3701d4 <_ChromeMain+0x36af38>
 463dfc8: d101c3bc     	sub	x28, x29, #0x70
 463dfcc: d101c3a8     	sub	x8, x29, #0x70
 463dfd0: aa1a03e0     	mov	x0, x26
 463dfd4: 972bcc9b     	bl	0x1131240 <_ChromeMain+0x112bfa4>
 463dfd8: 389a73a8     	ldursb	x8, [x29, #-0x59]
 463dfdc: a9792ba9     	ldp	x9, x10, [x29, #-0x70]
 463dfe0: f100011f     	cmp	x8, #0x0
 463dfe4: 9a9c4123     	csel	x3, x9, x28, mi
 463dfe8: 7100011f     	cmp	w8, #0x0
 463dfec: 9a884144     	csel	x4, x10, x8, mi
 463dff0: f0049961     	adrp	x1, 0xd96c000 <dyld_stub_binder+0xd96c000>
 463dff4: 91287021     	add	x1, x1, #0xa1c
 463dff8: 910083e8     	add	x8, sp, #0x20
 463dffc: 910263e0     	add	x0, sp, #0x98
 463e000: 52800122     	mov	w2, #0x9                ; =9
 463e004: 975a8fcf     	bl	0x1ce1f40 <_ChromeMain+0x1cdcca4>
 463e008: 38da73a8     	ldursb	w8, [x29, #-0x59]
 463e00c: 36f800a8     	tbz	w8, #0x1f, 0x463e020 <_ChromeMain+0x4638d84>
 463e010: f85903a0     	ldur	x0, [x29, #-0x70]
 463e014: f85a03a8     	ldur	x8, [x29, #-0x60]
 463e018: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463e01c: 96e72ba7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463e020: 9101c360     	add	x0, x27, #0x70
 463e024: d2800001     	mov	x1, #0x0                ; =0
 463e028: 96e7a724     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 463e02c: 91008360     	add	x0, x27, #0x20
 463e030: 96e7a712     	bl	0x27c78 <_ChromeMain+0x229dc>
 463e034: 39c2bfe8     	ldrsb	w8, [sp, #0xaf]
 463e038: 36f800a8     	tbz	w8, #0x1f, 0x463e04c <_ChromeMain+0x4638db0>
 463e03c: f9404fe0     	ldr	x0, [sp, #0x98]
 463e040: f94057e8     	ldr	x8, [sp, #0xa8]
 463e044: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463e048: 96e72b9c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463e04c: 910083fa     	add	x26, sp, #0x20
 463e050: 91006320     	add	x0, x25, #0x18
 463e054: 910083e1     	add	x1, sp, #0x20
 463e058: 96feeea2     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 463e05c: 9101c340     	add	x0, x26, #0x70
 463e060: d2800001     	mov	x1, #0x0                ; =0
 463e064: 96e7a715     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 463e068: 91008340     	add	x0, x26, #0x20
 463e06c: 96e7a703     	bl	0x27c78 <_ChromeMain+0x229dc>
 463e070: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 463e074: 36f800a8     	tbz	w8, #0x1f, 0x463e088 <_ChromeMain+0x4638dec>
 463e078: f94013e0     	ldr	x0, [sp, #0x20]
 463e07c: f9401be8     	ldr	x8, [sp, #0x30]
 463e080: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463e084: 96e72b8d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463e088: 39c05f28     	ldrsb	w8, [x25, #0x17]
 463e08c: 37fff788     	tbnz	w8, #0x1f, 0x463df7c <_ChromeMain+0x4638ce0>
 463e090: 52800068     	mov	w8, #0x3                ; =3
 463e094: 39005f28     	strb	w8, [x25, #0x17]
 463e098: aa1903e8     	mov	x8, x25
 463e09c: 5288a8e9     	mov	w9, #0x4547             ; =17735
 463e0a0: 72a00a89     	movk	w9, #0x54, lsl #16
 463e0a4: b9000109     	str	w9, [x8]
 463e0a8: 52800208     	mov	w8, #0x10               ; =16
 463e0ac: b9026b28     	str	w8, [x25, #0x268]
 463e0b0: 394062e8     	ldrb	w8, [x23, #0x18]
 463e0b4: 360012c8     	tbz	w8, #0x0, 0x463e30c <_ChromeMain+0x4639070>
 463e0b8: 39805ee4     	ldrsb	x4, [x23, #0x17]
 463e0bc: b6f80044     	tbz	x4, #0x3f, 0x463e0c4 <_ChromeMain+0x4638e28>
 463e0c0: a94012f7     	ldp	x23, x4, [x23]
 463e0c4: b0043ae1     	adrp	x1, 0xcd9b000 <dyld_stub_binder+0xcd9b000>
 463e0c8: 912ed421     	add	x1, x1, #0xbb5
 463e0cc: 9108e320     	add	x0, x25, #0x238
 463e0d0: 528001a2     	mov	w2, #0xd                ; =13
 463e0d4: aa1703e3     	mov	x3, x23
 463e0d8: 97181129     	bl	0xc4257c <_ChromeMain+0xc3d2e0>
 463e0dc: b004c460     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463e0e0: 912e8c00     	add	x0, x0, #0xba3
 463e0e4: b004c461     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463e0e8: 912c7821     	add	x1, x1, #0xb1e
 463e0ec: 910003e8     	mov	x8, sp
 463e0f0: 528418e2     	mov	w2, #0x20c7             ; =8391
 463e0f4: 96e84ae3     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 463e0f8: f0048521     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 463e0fc: 91025021     	add	x1, x1, #0x94
 463e100: 910003e2     	mov	x2, sp
 463e104: aa1903e0     	mov	x0, x25
 463e108: 975a8efe     	bl	0x1ce1d00 <_ChromeMain+0x1cdca64>
 463e10c: f9497677     	ldr	x23, [x19, #0x12e8]
 463e110: f9097660     	str	x0, [x19, #0x12e8]
 463e114: b40000d7     	cbz	x23, 0x463e12c <_ChromeMain+0x4638e90>
 463e118: aa1703e0     	mov	x0, x23
 463e11c: 973fbe9f     	bl	0x162db98 <_ChromeMain+0x16288fc>
 463e120: 52804501     	mov	w1, #0x228              ; =552
 463e124: 96e72b65     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463e128: f9497660     	ldr	x0, [x19, #0x12e8]
 463e12c: 52800028     	mov	w8, #0x1                ; =1
 463e130: 3900c408     	strb	w8, [x0, #0x31]
 463e134: f9497668     	ldr	x8, [x19, #0x12e8]
 463e138: 5298d809     	mov	w9, #0xc6c0             ; =50880
 463e13c: 72a005a9     	movk	w9, #0x2d, lsl #16
 463e140: f9010109     	str	x9, [x8, #0x200]
 463e144: f9497679     	ldr	x25, [x19, #0x12e8]
 463e148: aa1803e0     	mov	x0, x24
 463e14c: 972dafff     	bl	0x11aa148 <_ChromeMain+0x11a4eac>
 463e150: f9413c08     	ldr	x8, [x0, #0x278]
 463e154: b4000de8     	cbz	x8, 0x463e310 <_ChromeMain+0x4639074>
 463e158: f9400117     	ldr	x23, [x8]
 463e15c: b40000b7     	cbz	x23, 0x463e170 <_ChromeMain+0x4638ed4>
 463e160: b9400ae8     	ldr	w8, [x23, #0x8]
 463e164: 31000508     	adds	w8, w8, #0x1
 463e168: b9000ae8     	str	w8, [x23, #0x8]
 463e16c: 54000d82     	b.hs	0x463e31c <_ChromeMain+0x4639080>
 463e170: f94a0678     	ldr	x24, [x19, #0x1408]
 463e174: b40000d8     	cbz	x24, 0x463e18c <_ChromeMain+0x4638ef0>
 463e178: 52800028     	mov	w8, #0x1                ; =1
 463e17c: b8280308     	ldadd	w8, w8, [x24]
 463e180: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463e184: 6b09011f     	cmp	w8, w9
 463e188: 54000d00     	b.eq	0x463e328 <_ChromeMain+0x463908c>
 463e18c: f94a0a7a     	ldr	x26, [x19, #0x1410]
 463e190: 52800c00     	mov	w0, #0x60               ; =96
 463e194: 96e74475     	bl	0xf368 <_ChromeMain+0xa0cc>
 463e198: aa0003f3     	mov	x19, x0
 463e19c: 52800028     	mov	w8, #0x1                ; =1
 463e1a0: b9000008     	str	w8, [x0]
 463e1a4: 101bc168     	adr	x8, 0x46759d0 <_ChromeMain+0x4670734>
 463e1a8: d503201f     	nop
 463e1ac: 101bc969     	adr	x9, 0x4675ad8 <_ChromeMain+0x467083c>
 463e1b0: d503201f     	nop
 463e1b4: a900a408     	stp	x8, x9, [x0, #0x8]
 463e1b8: 90ffd168     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 463e1bc: 910a0108     	add	x8, x8, #0x280
 463e1c0: 10000c89     	adr	x9, 0x463e350 <_ChromeMain+0x46390b4>
 463e1c4: d503201f     	nop
 463e1c8: a901a408     	stp	x8, x9, [x0, #0x18]
 463e1cc: a902e01f     	stp	xzr, x24, [x0, #0x28]
 463e1d0: f9001c1a     	str	x26, [x0, #0x38]
 463e1d4: 39010016     	strb	w22, [x0, #0x40]
 463e1d8: b9004415     	str	w21, [x0, #0x44]
 463e1dc: 39c05e88     	ldrsb	w8, [x20, #0x17]
 463e1e0: 37f80668     	tbnz	w8, #0x1f, 0x463e2ac <_ChromeMain+0x4639010>
 463e1e4: 3dc00280     	ldr	q0, [x20]
 463e1e8: 3c848260     	stur	q0, [x19, #0x48]
 463e1ec: f9400a88     	ldr	x8, [x20, #0x10]
 463e1f0: f8058268     	stur	x8, [x19, #0x58]
 463e1f4: f9401735     	ldr	x21, [x25, #0x28]
 463e1f8: 52800f00     	mov	w0, #0x78               ; =120
 463e1fc: 96e7445b     	bl	0xf368 <_ChromeMain+0xa0cc>
 463e200: aa0003f4     	mov	x20, x0
 463e204: 925e7728     	and	x8, x25, #0xfffffffc00000000
 463e208: 90052ba9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 463e20c: f9404529     	ldr	x9, [x9, #0x88]
 463e210: eb09011f     	cmp	x8, x9
 463e214: 54000061     	b.ne	0x463e220 <_ChromeMain+0x4638f84>
 463e218: aa1903e0     	mov	x0, x25
 463e21c: 96e75838     	bl	0x142fc <_ChromeMain+0xf060>
 463e220: f10002bf     	cmp	x21, #0x0
 463e224: 1a9f07e8     	cset	w8, ne
 463e228: 39004288     	strb	w8, [x20, #0x10]
 463e22c: 9004e608     	adrp	x8, 0xe2fe000 <dyld_stub_binder+0xe2fe000>
 463e230: 91294108     	add	x8, x8, #0xa50
 463e234: a9006688     	stp	x8, x25, [x20]
 463e238: 91014108     	add	x8, x8, #0x50
 463e23c: 52a00089     	mov	w9, #0x40000            ; =262144
 463e240: a901a688     	stp	x8, x9, [x20, #0x18]
 463e244: 3900a29f     	strb	wzr, [x20, #0x28]
 463e248: 3901029f     	strb	wzr, [x20, #0x40]
 463e24c: f9002693     	str	x19, [x20, #0x48]
 463e250: 3dc01b20     	ldr	q0, [x25, #0x60]
 463e254: b9407328     	ldr	w8, [x25, #0x70]
 463e258: b9006288     	str	w8, [x20, #0x60]
 463e25c: 3d801680     	str	q0, [x20, #0x50]
 463e260: f9403f28     	ldr	x8, [x25, #0x78]
 463e264: a906fe88     	stp	x8, xzr, [x20, #0x68]
 463e268: f9405b20     	ldr	x0, [x25, #0xb0]
 463e26c: f9005b34     	str	x20, [x25, #0xb0]
 463e270: b5000620     	cbnz	x0, 0x463e334 <_ChromeMain+0x4639098>
 463e274: aa1903e0     	mov	x0, x25
 463e278: aa1703e1     	mov	x1, x23
 463e27c: 976d5ea1     	bl	0x2195d00 <_ChromeMain+0x2190a64>
 463e280: b4ffdd77     	cbz	x23, 0x463de2c <_ChromeMain+0x4638b90>
 463e284: b9400ae9     	ldr	w9, [x23, #0x8]
 463e288: 51000528     	sub	w8, w9, #0x1
 463e28c: b9000ae8     	str	w8, [x23, #0x8]
 463e290: 340005a9     	cbz	w9, 0x463e344 <_ChromeMain+0x46390a8>
 463e294: 35ffdcc8     	cbnz	w8, 0x463de2c <_ChromeMain+0x4638b90>
 463e298: f94002e8     	ldr	x8, [x23]
 463e29c: f9400508     	ldr	x8, [x8, #0x8]
 463e2a0: aa1703e0     	mov	x0, x23
 463e2a4: d63f0100     	blr	x8
 463e2a8: 17fffee1     	b	0x463de2c <_ChromeMain+0x4638b90>
 463e2ac: a9400a81     	ldp	x1, x2, [x20]
 463e2b0: 91012260     	add	x0, x19, #0x48
 463e2b4: 96e767d9     	bl	0x18218 <_ChromeMain+0x12f7c>
 463e2b8: 17ffffcf     	b	0x463e1f4 <_ChromeMain+0x4638f58>
 463e2bc: aa0003fb     	mov	x27, x0
 463e2c0: d00444e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 463e2c4: 91018021     	add	x1, x1, #0x60
 463e2c8: 52800202     	mov	w2, #0x10               ; =16
 463e2cc: 96f9fa60     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 463e2d0: b4ffe600     	cbz	x0, 0x463df90 <_ChromeMain+0x4638cf4>
 463e2d4: d00444e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 463e2d8: 91018021     	add	x1, x1, #0x60
 463e2dc: aa1b03e0     	mov	x0, x27
 463e2e0: 52800202     	mov	w2, #0x10               ; =16
 463e2e4: 96f201d1     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 463e2e8: 3100041f     	cmn	w0, #0x1
 463e2ec: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 463e2f0: 9a9fc109     	csel	x9, x8, xzr, gt
 463e2f4: 37ffe4e0     	tbnz	w0, #0x1f, 0x463df90 <_ChromeMain+0x4638cf4>
 463e2f8: 0aa07c0a     	bic	w10, w0, w0, asr #31
 463e2fc: aa0a0120     	orr	x0, x9, x10
 463e300: 17ffff27     	b	0x463df9c <_ChromeMain+0x4638d00>
 463e304: d4200000     	brk	#0
 463e308: d4400000     	hlt	#0
 463e30c: d4200020     	brk	#0x1
 463e310: d4200000     	brk	#0
 463e314: d4400000     	hlt	#0
 463e318: d4200020     	brk	#0x1
 463e31c: d4200000     	brk	#0
 463e320: d4400000     	hlt	#0
 463e324: d4200020     	brk	#0x1
 463e328: d4200000     	brk	#0
