
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460cc88: 34ffc940     	cbz	w0, 0x460c5b0 <_ChromeMain+0x4607314>
 460cc8c: b9405288     	ldr	w8, [x20, #0x50]
 460cc90: 12151108     	and	w8, w8, #0xf800
 460cc94: 7120011f     	cmp	w8, #0x800
 460cc98: 54000200     	b.eq	0x460ccd8 <_ChromeMain+0x4607a3c>
 460cc9c: 7140051f     	cmp	w8, #0x1, lsl #12       ; =0x1000
 460cca0: 54ffc881     	b.ne	0x460c5b0 <_ChromeMain+0x4607314>
 460cca4: f941ea68     	ldr	x8, [x19, #0x3d0]
 460cca8: f941a500     	ldr	x0, [x8, #0x348]
 460ccac: b4ffc820     	cbz	x0, 0x460c5b0 <_ChromeMain+0x4607314>
 460ccb0: f941f269     	ldr	x9, [x19, #0x3e0]
 460ccb4: f941b50a     	ldr	x10, [x8, #0x368]
 460ccb8: eb0a013f     	cmp	x9, x10
 460ccbc: 54ffc7a2     	b.hs	0x460c5b0 <_ChromeMain+0x4607314>
 460ccc0: f941b108     	ldr	x8, [x8, #0x360]
 460ccc4: 52804d0a     	mov	w10, #0x268             ; =616
 460ccc8: 9b0a2128     	madd	x8, x9, x10, x8
 460cccc: 39425109     	ldrb	w9, [x8, #0x94]
 460ccd0: 34ffc709     	cbz	w9, 0x460c5b0 <_ChromeMain+0x4607314>
 460ccd4: 14000035     	b	0x460cda8 <_ChromeMain+0x4607b0c>
 460ccd8: f941ea60     	ldr	x0, [x19, #0x3d0]
 460ccdc: f941f261     	ldr	x1, [x19, #0x3e0]
 460cce0: 97fff552     	bl	0x460a228 <_ChromeMain+0x4604f8c>
 460cce4: 17fffe33     	b	0x460c5b0 <_ChromeMain+0x4607314>
 460cce8: 52802400     	mov	w0, #0x120              ; =288
 460ccec: 96e8099f     	bl	0xf368 <_ChromeMain+0xa0cc>
 460ccf0: aa0003f5     	mov	x21, x0
 460ccf4: d2800001     	mov	x1, #0x0                ; =0
 460ccf8: 9729b578     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460ccfc: b40000a0     	cbz	x0, 0x460cd10 <_ChromeMain+0x4607a74>
 460cd00: b9400aa8     	ldr	w8, [x21, #0x8]
 460cd04: 31000508     	adds	w8, w8, #0x1
 460cd08: b9000aa8     	str	w8, [x21, #0x8]
 460cd0c: 54000922     	b.hs	0x460ce30 <_ChromeMain+0x4607b94>
 460cd10: aa1403e0     	mov	x0, x20
 460cd14: aa1503e1     	mov	x1, x21
 460cd18: 9731bd39     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460cd1c: f940b280     	ldr	x0, [x20, #0x160]
 460cd20: 17fffe19     	b	0x460c584 <_ChromeMain+0x46072e8>
 460cd24: 52802400     	mov	w0, #0x120              ; =288
 460cd28: 96e80990     	bl	0xf368 <_ChromeMain+0xa0cc>
 460cd2c: aa0003f6     	mov	x22, x0
 460cd30: d2800001     	mov	x1, #0x0                ; =0
 460cd34: 9729b569     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460cd38: b40000a0     	cbz	x0, 0x460cd4c <_ChromeMain+0x4607ab0>
 460cd3c: b9400ac8     	ldr	w8, [x22, #0x8]
 460cd40: 31000508     	adds	w8, w8, #0x1
 460cd44: b9000ac8     	str	w8, [x22, #0x8]
 460cd48: 540007a2     	b.hs	0x460ce3c <_ChromeMain+0x4607ba0>
 460cd4c: aa1503e0     	mov	x0, x21
 460cd50: aa1603e1     	mov	x1, x22
 460cd54: 9731bd2a     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460cd58: f940b2a0     	ldr	x0, [x21, #0x160]
 460cd5c: 17fffe9c     	b	0x460c7cc <_ChromeMain+0x4607530>
 460cd60: f9400a61     	ldr	x1, [x19, #0x10]
 460cd64: aa1303e0     	mov	x0, x19
 460cd68: a9597bfd     	ldp	x29, x30, [sp, #0x190]
 460cd6c: a9584ff4     	ldp	x20, x19, [sp, #0x180]
 460cd70: a95757f6     	ldp	x22, x21, [sp, #0x170]
 460cd74: a9565ff8     	ldp	x24, x23, [sp, #0x160]
 460cd78: a95567fa     	ldp	x26, x25, [sp, #0x150]
 460cd7c: 910683ff     	add	sp, sp, #0x1a0
 460cd80: d61f0020     	br	x1
 460cd84: f9400aa8     	ldr	x8, [x21, #0x10]
 460cd88: aa1503e0     	mov	x0, x21
 460cd8c: d63f0100     	blr	x8
 460cd90: 3607db73     	tbz	w19, #0x0, 0x460c8fc <_ChromeMain+0x4607660>
 460cd94: 17fffe2b     	b	0x460c640 <_ChromeMain+0x46073a4>
 460cd98: d101e3a0     	sub	x0, x29, #0x78
 460cd9c: aa1303e1     	mov	x1, x19
 460cda0: 97ff63d2     	bl	0x45e5ce8 <_ChromeMain+0x45e0a4c>
 460cda4: 17fffede     	b	0x460c91c <_ChromeMain+0x4607680>
 460cda8: b9409101     	ldr	w1, [x8, #0x90]
 460cdac: 52800022     	mov	w2, #0x1                ; =1
 460cdb0: 94dd1480     	bl	0x7d51fb0 <_ChromeMain+0x7d4cd14>
 460cdb4: 17fffdff     	b	0x460c5b0 <_ChromeMain+0x4607314>
