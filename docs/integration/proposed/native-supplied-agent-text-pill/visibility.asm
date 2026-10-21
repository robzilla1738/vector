
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41f0808: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 41f080c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 41f0810: 910043fd     	add	x29, sp, #0x10
 41f0814: b4001420     	cbz	x0, 0x41f0a98 <_ChromeMain+0x41eb7fc>
 41f0818: aa0003f3     	mov	x19, x0
 41f081c: f9414808     	ldr	x8, [x0, #0x290]
 41f0820: b5001468     	cbnz	x8, 0x41f0aac <_ChromeMain+0x41eb810>
 41f0824: f9413268     	ldr	x8, [x19, #0x260]
 41f0828: f9401d09     	ldr	x9, [x8, #0x38]
 41f082c: b0fff2aa     	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 41f0830: 913c814a     	add	x10, x10, #0xf20
 41f0834: b982b668     	ldrsw	x8, [x19, #0x2b4]
 41f0838: eb0a013f     	cmp	x9, x10
 41f083c: 540017c1     	b.ne	0x41f0b34 <_ChromeMain+0x41eb898>
 41f0840: 3100051f     	cmn	w8, #0x1
 41f0844: 54001c80     	b.eq	0x41f0bd4 <_ChromeMain+0x41eb938>
 41f0848: f9414269     	ldr	x9, [x19, #0x280]
 41f084c: eb08013f     	cmp	x9, x8
 41f0850: 54001aa9     	b.ls	0x41f0ba4 <_ChromeMain+0x41eb908>
 41f0854: f9413e69     	ldr	x9, [x19, #0x278]
 41f0858: f8687928     	ldr	x8, [x9, x8, lsl #3]
 41f085c: b4001b68     	cbz	x8, 0x41f0bc8 <_ChromeMain+0x41eb92c>
 41f0860: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 41f0864: b7f81a29     	tbnz	x9, #0x3f, 0x41f0ba8 <_ChromeMain+0x41eb90c>
 41f0868: b5001a49     	cbnz	x9, 0x41f0bb0 <_ChromeMain+0x41eb914>
 41f086c: f9400d08     	ldr	x8, [x8, #0x18]
 41f0870: f9400508     	ldr	x8, [x8, #0x8]
 41f0874: 91018114     	add	x20, x8, #0x60
 41f0878: 90044f21     	adrp	x1, 0xcbd4000 <dyld_stub_binder+0xcbd4000>
 41f087c: 91107821     	add	x1, x1, #0x41e
 41f0880: aa1403e0     	mov	x0, x20
 41f0884: 52800202     	mov	w2, #0x10               ; =16
 41f0888: 970ebec2     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 41f088c: 34000560     	cbz	w0, 0x41f0938 <_ChromeMain+0x41eb69c>
 41f0890: b9403e88     	ldr	w8, [x20, #0x3c]
 41f0894: 7100051f     	cmp	w8, #0x1
 41f0898: 5400050b     	b.lt	0x41f0938 <_ChromeMain+0x41eb69c>
 41f089c: 39405e8a     	ldrb	w10, [x20, #0x17]
 41f08a0: 13001d49     	sxtb	w9, w10
 41f08a4: f940068b     	ldr	x11, [x20, #0x8]
 41f08a8: 7100013f     	cmp	w9, #0x0
 41f08ac: 9a8a416b     	csel	x11, x11, x10, mi
 41f08b0: b9803a8a     	ldrsw	x10, [x20, #0x38]
 41f08b4: eb0a016b     	subs	x11, x11, x10
 41f08b8: 54001a03     	b.lo	0x41f0bf8 <_ChromeMain+0x41eb95c>
 41f08bc: eb08017f     	cmp	x11, x8
 41f08c0: 9a883168     	csel	x8, x11, x8, lo
 41f08c4: f100811f     	cmp	x8, #0x20
 41f08c8: 54000381     	b.ne	0x41f0938 <_ChromeMain+0x41eb69c>
 41f08cc: f9400288     	ldr	x8, [x20]
 41f08d0: 7100013f     	cmp	w9, #0x0
 41f08d4: 9a944108     	csel	x8, x8, x20, mi
 41f08d8: 8b0a0108     	add	x8, x8, x10
 41f08dc: a9402909     	ldp	x9, x10, [x8]
 41f08e0: a941210b     	ldp	x11, x8, [x8, #0x10]
 41f08e4: d28d4ccc     	mov	x12, #0x6a66            ; =27238
 41f08e8: f2ad0c8c     	movk	x12, #0x6864, lsl #16
 41f08ec: f2cd0e0c     	movk	x12, #0x6870, lsl #32
 41f08f0: f2ec8c4c     	movk	x12, #0x6462, lsl #48
 41f08f4: eb0c013f     	cmp	x9, x12
 41f08f8: d28ccd89     	mov	x9, #0x666c             ; =26220
 41f08fc: f2aded49     	movk	x9, #0x6f6a, lsl #16
 41f0900: f2cdece9     	movk	x9, #0x6f67, lsl #32
 41f0904: f2ec8c49     	movk	x9, #0x6462, lsl #48
 41f0908: fa490140     	ccmp	x10, x9, #0x0, eq
 41f090c: d28ccde9     	mov	x9, #0x666f             ; =26223
 41f0910: f2ac2de9     	movk	x9, #0x616f, lsl #16
 41f0914: f2ccec29     	movk	x9, #0x6761, lsl #32
 41f0918: f2ed8dc9     	movk	x9, #0x6c6e, lsl #48
 41f091c: fa490160     	ccmp	x11, x9, #0x0, eq
 41f0920: d28d6dc9     	mov	x9, #0x6b6e             ; =27502
 41f0924: f2ad2de9     	movk	x9, #0x696f, lsl #16
 41f0928: f2cc8c49     	movk	x9, #0x6462, lsl #32
 41f092c: f2ecace9     	movk	x9, #0x6567, lsl #48
 41f0930: fa490100     	ccmp	x8, x9, #0x0, eq
 41f0934: 54000b80     	b.eq	0x41f0aa4 <_ChromeMain+0x41eb808>
 41f0938: b982b668     	ldrsw	x8, [x19, #0x2b4]
 41f093c: 3100051f     	cmn	w8, #0x1
 41f0940: 54001500     	b.eq	0x41f0be0 <_ChromeMain+0x41eb944>
 41f0944: f9414269     	ldr	x9, [x19, #0x280]
 41f0948: eb08013f     	cmp	x9, x8
 41f094c: 540012c9     	b.ls	0x41f0ba4 <_ChromeMain+0x41eb908>
 41f0950: f9413e69     	ldr	x9, [x19, #0x278]
 41f0954: f8687928     	ldr	x8, [x9, x8, lsl #3]
 41f0958: b40014a8     	cbz	x8, 0x41f0bec <_ChromeMain+0x41eb950>
 41f095c: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 41f0960: b7f812c9     	tbnz	x9, #0x3f, 0x41f0bb8 <_ChromeMain+0x41eb91c>
 41f0964: b50012e9     	cbnz	x9, 0x41f0bc0 <_ChromeMain+0x41eb924>
 41f0968: f9400d08     	ldr	x8, [x8, #0x18]
 41f096c: f9400508     	ldr	x8, [x8, #0x8]
 41f0970: 91018114     	add	x20, x8, #0x60
 41f0974: 90044f21     	adrp	x1, 0xcbd4000 <dyld_stub_binder+0xcbd4000>
 41f0978: 91107821     	add	x1, x1, #0x41e
 41f097c: aa1403e0     	mov	x0, x20
 41f0980: 52800202     	mov	w2, #0x10               ; =16
 41f0984: 970ebe83     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 41f0988: 34000560     	cbz	w0, 0x41f0a34 <_ChromeMain+0x41eb798>
 41f098c: b9403e88     	ldr	w8, [x20, #0x3c]
 41f0990: 7100051f     	cmp	w8, #0x1
 41f0994: 5400050b     	b.lt	0x41f0a34 <_ChromeMain+0x41eb798>
 41f0998: 39405e8a     	ldrb	w10, [x20, #0x17]
 41f099c: 13001d49     	sxtb	w9, w10
 41f09a0: f940068b     	ldr	x11, [x20, #0x8]
 41f09a4: 7100013f     	cmp	w9, #0x0
 41f09a8: 9a8a416b     	csel	x11, x11, x10, mi
 41f09ac: b9803a8a     	ldrsw	x10, [x20, #0x38]
 41f09b0: eb0a016b     	subs	x11, x11, x10
 41f09b4: 54001223     	b.lo	0x41f0bf8 <_ChromeMain+0x41eb95c>
 41f09b8: eb08017f     	cmp	x11, x8
 41f09bc: 9a883168     	csel	x8, x11, x8, lo
 41f09c0: f100811f     	cmp	x8, #0x20
 41f09c4: 54000381     	b.ne	0x41f0a34 <_ChromeMain+0x41eb798>
 41f09c8: f9400288     	ldr	x8, [x20]
 41f09cc: 7100013f     	cmp	w9, #0x0
 41f09d0: 9a944108     	csel	x8, x8, x20, mi
 41f09d4: 8b0a0108     	add	x8, x8, x10
 41f09d8: a9402909     	ldp	x9, x10, [x8]
 41f09dc: a941210b     	ldp	x11, x8, [x8, #0x10]
 41f09e0: d28d4ccc     	mov	x12, #0x6a66            ; =27238
 41f09e4: f2ad0c8c     	movk	x12, #0x6864, lsl #16
 41f09e8: f2cd0e0c     	movk	x12, #0x6870, lsl #32
 41f09ec: f2ec8c4c     	movk	x12, #0x6462, lsl #48
 41f09f0: eb0c013f     	cmp	x9, x12
 41f09f4: d28ccd89     	mov	x9, #0x666c             ; =26220
 41f09f8: f2aded49     	movk	x9, #0x6f6a, lsl #16
 41f09fc: f2cdece9     	movk	x9, #0x6f67, lsl #32
 41f0a00: f2ec8c49     	movk	x9, #0x6462, lsl #48
 41f0a04: fa490140     	ccmp	x10, x9, #0x0, eq
 41f0a08: d28ccde9     	mov	x9, #0x666f             ; =26223
 41f0a0c: f2ac2de9     	movk	x9, #0x616f, lsl #16
 41f0a10: f2ccec29     	movk	x9, #0x6761, lsl #32
 41f0a14: f2ed8dc9     	movk	x9, #0x6c6e, lsl #48
 41f0a18: fa490160     	ccmp	x11, x9, #0x0, eq
 41f0a1c: d28d6dc9     	mov	x9, #0x6b6e             ; =27502
 41f0a20: f2ad2de9     	movk	x9, #0x696f, lsl #16
 41f0a24: f2cc8c49     	movk	x9, #0x6462, lsl #32
 41f0a28: f2ecace9     	movk	x9, #0x6567, lsl #48
 41f0a2c: fa490100     	ccmp	x8, x9, #0x0, eq
 41f0a30: 540003a0     	b.eq	0x41f0aa4 <_ChromeMain+0x41eb808>
 41f0a34: f9447e74     	ldr	x20, [x19, #0x8f8]
 41f0a38: b40002f4     	cbz	x20, 0x41f0a94 <_ChromeMain+0x41eb7f8>
 41f0a3c: 91064293     	add	x19, x20, #0x190
 41f0a40: 90044f21     	adrp	x1, 0xcbd4000 <dyld_stub_binder+0xcbd4000>
 41f0a44: 91107821     	add	x1, x1, #0x41e
 41f0a48: 91064280     	add	x0, x20, #0x190
 41f0a4c: 52800202     	mov	w2, #0x10               ; =16
 41f0a50: 970ebe50     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 41f0a54: 34000220     	cbz	w0, 0x41f0a98 <_ChromeMain+0x41eb7fc>
 41f0a58: b941ce88     	ldr	w8, [x20, #0x1cc]
 41f0a5c: 7100051f     	cmp	w8, #0x1
 41f0a60: 540001ab     	b.lt	0x41f0a94 <_ChromeMain+0x41eb7f8>
 41f0a64: 39469e8a     	ldrb	w10, [x20, #0x1a7]
 41f0a68: 13001d49     	sxtb	w9, w10
 41f0a6c: f940ce8b     	ldr	x11, [x20, #0x198]
 41f0a70: 7100013f     	cmp	w9, #0x0
 41f0a74: 9a8a416b     	csel	x11, x11, x10, mi
 41f0a78: b981ca8a     	ldrsw	x10, [x20, #0x1c8]
 41f0a7c: eb0a016b     	subs	x11, x11, x10
 41f0a80: 54000bc3     	b.lo	0x41f0bf8 <_ChromeMain+0x41eb95c>
 41f0a84: eb08017f     	cmp	x11, x8
 41f0a88: 9a883168     	csel	x8, x11, x8, lo
 41f0a8c: f100811f     	cmp	x8, #0x20
 41f0a90: 540001a0     	b.eq	0x41f0ac4 <_ChromeMain+0x41eb828>
 41f0a94: 52800000     	mov	w0, #0x0                ; =0
 41f0a98: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 41f0a9c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 41f0aa0: d65f03c0     	ret
 41f0aa4: 52800020     	mov	w0, #0x1                ; =1
 41f0aa8: 17fffffc     	b	0x41f0a98 <_ChromeMain+0x41eb7fc>
 41f0aac: b942ba69     	ldr	w9, [x19, #0x2b8]
 41f0ab0: 3100053f     	cmn	w9, #0x1
 41f0ab4: 540006e1     	b.ne	0x41f0b90 <_ChromeMain+0x41eb8f4>
 41f0ab8: 394d2109     	ldrb	w9, [x8, #0x348]
 41f0abc: 34ffed29     	cbz	w9, 0x41f0860 <_ChromeMain+0x41eb5c4>
 41f0ac0: 14000022     	b	0x41f0b48 <_ChromeMain+0x41eb8ac>
 41f0ac4: f9400268     	ldr	x8, [x19]
 41f0ac8: 7100013f     	cmp	w9, #0x0
 41f0acc: 9a934108     	csel	x8, x8, x19, mi
 41f0ad0: 8b0a0108     	add	x8, x8, x10
 41f0ad4: a9402909     	ldp	x9, x10, [x8]
 41f0ad8: a941210b     	ldp	x11, x8, [x8, #0x10]
 41f0adc: d28d4ccc     	mov	x12, #0x6a66            ; =27238
 41f0ae0: f2ad0c8c     	movk	x12, #0x6864, lsl #16
 41f0ae4: f2cd0e0c     	movk	x12, #0x6870, lsl #32
 41f0ae8: f2ec8c4c     	movk	x12, #0x6462, lsl #48
 41f0aec: eb0c013f     	cmp	x9, x12
 41f0af0: d28ccd89     	mov	x9, #0x666c             ; =26220
 41f0af4: f2aded49     	movk	x9, #0x6f6a, lsl #16
 41f0af8: f2cdece9     	movk	x9, #0x6f67, lsl #32
 41f0afc: f2ec8c49     	movk	x9, #0x6462, lsl #48
 41f0b00: fa490140     	ccmp	x10, x9, #0x0, eq
 41f0b04: d28ccde9     	mov	x9, #0x666f             ; =26223
 41f0b08: f2ac2de9     	movk	x9, #0x616f, lsl #16
 41f0b0c: f2ccec29     	movk	x9, #0x6761, lsl #32
 41f0b10: f2ed8dc9     	movk	x9, #0x6c6e, lsl #48
 41f0b14: fa490160     	ccmp	x11, x9, #0x0, eq
 41f0b18: d28d6dc9     	mov	x9, #0x6b6e             ; =27502
 41f0b1c: f2ad2de9     	movk	x9, #0x696f, lsl #16
 41f0b20: f2cc8c49     	movk	x9, #0x6462, lsl #32
 41f0b24: f2ecace9     	movk	x9, #0x6567, lsl #48
 41f0b28: fa490100     	ccmp	x8, x9, #0x0, eq
 41f0b2c: 1a9f17e0     	cset	w0, eq
 41f0b30: 17ffffda     	b	0x41f0a98 <_ChromeMain+0x41eb7fc>
 41f0b34: 3100051f     	cmn	w8, #0x1
 41f0b38: 54ffe881     	b.ne	0x41f0848 <_ChromeMain+0x41eb5ac>
 41f0b3c: d4200000     	brk	#0
 41f0b40: d4400000     	hlt	#0
 41f0b44: d4200020     	brk	#0x1
 41f0b48: 394ba269     	ldrb	w9, [x19, #0x2e8]
 41f0b4c: 34ffe6c9     	cbz	w9, 0x41f0824 <_ChromeMain+0x41eb588>
 41f0b50: b982b669     	ldrsw	x9, [x19, #0x2b4]
 41f0b54: 3100053f     	cmn	w9, #0x1
 41f0b58: 54000560     	b.eq	0x41f0c04 <_ChromeMain+0x41eb968>
 41f0b5c: f941426a     	ldr	x10, [x19, #0x280]
 41f0b60: eb09015f     	cmp	x10, x9
 41f0b64: 54000209     	b.ls	0x41f0ba4 <_ChromeMain+0x41eb908>
 41f0b68: f9413e6a     	ldr	x10, [x19, #0x278]
 41f0b6c: f8697949     	ldr	x9, [x10, x9, lsl #3]
 41f0b70: b9443129     	ldr	w9, [x9, #0x430]
 41f0b74: 7100093f     	cmp	w9, #0x2
 41f0b78: 54ffe560     	b.eq	0x41f0824 <_ChromeMain+0x41eb588>
 41f0b7c: f9413669     	ldr	x9, [x19, #0x268]
 41f0b80: b4000489     	cbz	x9, 0x41f0c10 <_ChromeMain+0x41eb974>
 41f0b84: 39458129     	ldrb	w9, [x9, #0x160]
 41f0b88: 3707e4e9     	tbnz	w9, #0x0, 0x41f0824 <_ChromeMain+0x41eb588>
 41f0b8c: 17ffff35     	b	0x41f0860 <_ChromeMain+0x41eb5c4>
 41f0b90: 394ba269     	ldrb	w9, [x19, #0x2e8]
 41f0b94: 34ffe489     	cbz	w9, 0x41f0824 <_ChromeMain+0x41eb588>
 41f0b98: 394d2109     	ldrb	w9, [x8, #0x348]
 41f0b9c: 35ffe449     	cbnz	w9, 0x41f0824 <_ChromeMain+0x41eb588>
 41f0ba0: 17ffff30     	b	0x41f0860 <_ChromeMain+0x41eb5c4>
 41f0ba4: d4200020     	brk	#0x1
 41f0ba8: f9401909     	ldr	x9, [x8, #0x30]
 41f0bac: b4ffe609     	cbz	x9, 0x41f086c <_ChromeMain+0x41eb5d0>
 41f0bb0: 9100a114     	add	x20, x8, #0x28
 41f0bb4: 17ffff31     	b	0x41f0878 <_ChromeMain+0x41eb5dc>
 41f0bb8: f9401909     	ldr	x9, [x8, #0x30]
 41f0bbc: b4ffed69     	cbz	x9, 0x41f0968 <_ChromeMain+0x41eb6cc>
 41f0bc0: 9100a114     	add	x20, x8, #0x28
 41f0bc4: 17ffff6c     	b	0x41f0974 <_ChromeMain+0x41eb6d8>
 41f0bc8: 97e1e7ac     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 41f0bcc: aa0003f4     	mov	x20, x0
 41f0bd0: 17ffff2a     	b	0x41f0878 <_ChromeMain+0x41eb5dc>
 41f0bd4: d4200000     	brk	#0
 41f0bd8: d4400000     	hlt	#0
 41f0bdc: d4200020     	brk	#0x1
 41f0be0: d4200000     	brk	#0
 41f0be4: d4400000     	hlt	#0
 41f0be8: d4200020     	brk	#0x1
 41f0bec: 97e1e7a3     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 41f0bf0: aa0003f4     	mov	x20, x0
 41f0bf4: 17ffff60     	b	0x41f0974 <_ChromeMain+0x41eb6d8>
 41f0bf8: 9004afa0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 41f0bfc: 91376000     	add	x0, x0, #0xdd8
 41f0c00: 94283db5     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
 41f0c04: d4200000     	brk	#0
 41f0c08: d4400000     	hlt	#0
 41f0c0c: d4200020     	brk	#0x1
 41f0c10: d4200000     	brk	#0
 41f0c14: d4400000     	hlt	#0
 41f0c18: d4200020     	brk	#0x1
 41f0c1c: 3959a008     	ldrb	w8, [x0, #0x668]
 41f0c20: 6b01011f     	cmp	w8, w1
 41f0c24: 54000680     	b.eq	0x41f0cf4 <_ChromeMain+0x41eba58>
 41f0c28: d10143ff     	sub	sp, sp, #0x50
 41f0c2c: a90257f6     	stp	x22, x21, [sp, #0x20]
 41f0c30: a9034ff4     	stp	x20, x19, [sp, #0x30]
 41f0c34: a9047bfd     	stp	x29, x30, [sp, #0x40]
 41f0c38: 910103fd     	add	x29, sp, #0x40
 41f0c3c: aa0103f4     	mov	x20, x1
 41f0c40: aa0003f3     	mov	x19, x0
 41f0c44: 3919a001     	strb	w1, [x0, #0x668]
 41f0c48: f9431c08     	ldr	x8, [x0, #0x638]
 41f0c4c: 39c0dd09     	ldrsb	w9, [x8, #0x37]
 41f0c50: 37f80549     	tbnz	w9, #0x1f, 0x41f0cf8 <_ChromeMain+0x41eba5c>
 41f0c54: 3cc20100     	ldur	q0, [x8, #0x20]
 41f0c58: f8430108     	ldur	x8, [x8, #0x30]
 41f0c5c: f9000be8     	str	x8, [sp, #0x10]
 41f0c60: 3d8003e0     	str	q0, [sp]
 41f0c64: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41f0c68: 36f80508     	tbz	w8, #0x1f, 0x41f0d08 <_ChromeMain+0x41eba6c>
 41f0c6c: f94007e9     	ldr	x9, [sp, #0x8]
 41f0c70: f100813f     	cmp	x9, #0x20
 41f0c74: 540004a1     	b.ne	0x41f0d08 <_ChromeMain+0x41eba6c>
 41f0c78: 900462c8     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 41f0c7c: 91252508     	add	x8, x8, #0x949
 41f0c80: f94003e0     	ldr	x0, [sp]
 41f0c84: f9400be9     	ldr	x9, [sp, #0x10]
 41f0c88: a9402c0a     	ldp	x10, x11, [x0]
 41f0c8c: a940350c     	ldp	x12, x13, [x8]
 41f0c90: a9413c0e     	ldp	x14, x15, [x0, #0x10]
 41f0c94: eb0c015f     	cmp	x10, x12
 41f0c98: a941210a     	ldp	x10, x8, [x8, #0x10]
 41f0c9c: fa4d0160     	ccmp	x11, x13, #0x0, eq
 41f0ca0: fa4a01c0     	ccmp	x14, x10, #0x0, eq
 41f0ca4: fa4801e0     	ccmp	x15, x8, #0x0, eq
 41f0ca8: 1a9f07f5     	cset	w21, ne
 41f0cac: 9240f921     	and	x1, x9, #0x7fffffffffffffff
 41f0cb0: 96f86082     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f0cb4: 35000195     	cbnz	w21, 0x41f0ce4 <_ChromeMain+0x41eba48>
 41f0cb8: 36000354     	tbz	w20, #0x0, 0x41f0d20 <_ChromeMain+0x41eba84>
 41f0cbc: 52800014     	mov	w20, #0x0               ; =0
 41f0cc0: f9400268     	ldr	x8, [x19]
 41f0cc4: f9405108     	ldr	x8, [x8, #0xa0]
 41f0cc8: aa1303e0     	mov	x0, x19
 41f0ccc: aa1403e1     	mov	x1, x20
 41f0cd0: d63f0100     	blr	x8
 41f0cd4: aa1303e0     	mov	x0, x19
 41f0cd8: 97fffd48     	bl	0x41f01f8 <_ChromeMain+0x41eaf5c>
 41f0cdc: aa1303e0     	mov	x0, x19
 41f0ce0: 970ec127     	bl	0x5a117c <_ChromeMain+0x59bee0>
 41f0ce4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 41f0ce8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 41f0cec: a94257f6     	ldp	x22, x21, [sp, #0x20]
 41f0cf0: 910143ff     	add	sp, sp, #0x50
 41f0cf4: d65f03c0     	ret
 41f0cf8: a9420901     	ldp	x1, x2, [x8, #0x20]
 41f0cfc: 910003e0     	mov	x0, sp
 41f0d00: 96f89d46     	bl	0x18218 <_ChromeMain+0x12f7c>
 41f0d04: 17ffffd8     	b	0x41f0c64 <_ChromeMain+0x41eb9c8>
 41f0d08: 36fffee8     	tbz	w8, #0x1f, 0x41f0ce4 <_ChromeMain+0x41eba48>
 41f0d0c: f94003e0     	ldr	x0, [sp]
 41f0d10: f9400be8     	ldr	x8, [sp, #0x10]
 41f0d14: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41f0d18: 96f86068     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f0d1c: 17fffff2     	b	0x41f0ce4 <_ChromeMain+0x41eba48>
 41f0d20: f9431e68     	ldr	x8, [x19, #0x638]
 41f0d24: 39c0dd09     	ldrsb	w9, [x8, #0x37]
 41f0d28: 37f80129     	tbnz	w9, #0x1f, 0x41f0d4c <_ChromeMain+0x41ebab0>
 41f0d2c: 3cc20100     	ldur	q0, [x8, #0x20]
 41f0d30: f8430108     	ldur	x8, [x8, #0x30]
 41f0d34: f9000be8     	str	x8, [sp, #0x10]
 41f0d38: 3d8003e0     	str	q0, [sp]
 41f0d3c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41f0d40: 37f800e8     	tbnz	w8, #0x1f, 0x41f0d5c <_ChromeMain+0x41ebac0>
 41f0d44: 52800034     	mov	w20, #0x1               ; =1
 41f0d48: 17ffffde     	b	0x41f0cc0 <_ChromeMain+0x41eba24>
 41f0d4c: a9420901     	ldp	x1, x2, [x8, #0x20]
 41f0d50: 910003e0     	mov	x0, sp
 41f0d54: 96f89d31     	bl	0x18218 <_ChromeMain+0x12f7c>
 41f0d58: 17fffff9     	b	0x41f0d3c <_ChromeMain+0x41ebaa0>
 41f0d5c: a94023e0     	ldp	x0, x8, [sp]
 41f0d60: f100811f     	cmp	x8, #0x20
 41f0d64: 54000301     	b.ne	0x41f0dc4 <_ChromeMain+0x41ebb28>
 41f0d68: a9402408     	ldp	x8, x9, [x0]
 41f0d6c: a9412c0a     	ldp	x10, x11, [x0, #0x10]
 41f0d70: d28d4ccc     	mov	x12, #0x6a66            ; =27238
 41f0d74: f2ad0c8c     	movk	x12, #0x6864, lsl #16
 41f0d78: f2cd0e0c     	movk	x12, #0x6870, lsl #32
 41f0d7c: f2ec8c4c     	movk	x12, #0x6462, lsl #48
 41f0d80: eb0c011f     	cmp	x8, x12
 41f0d84: d28ccd88     	mov	x8, #0x666c             ; =26220
 41f0d88: f2aded48     	movk	x8, #0x6f6a, lsl #16
 41f0d8c: f2cdece8     	movk	x8, #0x6f67, lsl #32
 41f0d90: f2ec8c48     	movk	x8, #0x6462, lsl #48
 41f0d94: fa480120     	ccmp	x9, x8, #0x0, eq
 41f0d98: d28ccde8     	mov	x8, #0x666f             ; =26223
 41f0d9c: f2ac2de8     	movk	x8, #0x616f, lsl #16
 41f0da0: f2ccec28     	movk	x8, #0x6761, lsl #32
 41f0da4: f2ed8dc8     	movk	x8, #0x6c6e, lsl #48
 41f0da8: fa480140     	ccmp	x10, x8, #0x0, eq
 41f0dac: d28d6dc8     	mov	x8, #0x6b6e             ; =27502
 41f0db0: f2ad2de8     	movk	x8, #0x696f, lsl #16
 41f0db4: f2cc8c48     	movk	x8, #0x6462, lsl #32
 41f0db8: f2ecace8     	movk	x8, #0x6567, lsl #48
 41f0dbc: fa480160     	ccmp	x11, x8, #0x0, eq
 41f0dc0: 540000c0     	b.eq	0x41f0dd8 <_ChromeMain+0x41ebb3c>
 41f0dc4: 52800034     	mov	w20, #0x1               ; =1
 41f0dc8: f9400be8     	ldr	x8, [sp, #0x10]
 41f0dcc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41f0dd0: 96f8603a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f0dd4: 17ffffbb     	b	0x41f0cc0 <_ChromeMain+0x41eba24>
 41f0dd8: f9432260     	ldr	x0, [x19, #0x640]
 41f0ddc: f9400008     	ldr	x8, [x0]
 41f0de0: f9401908     	ldr	x8, [x8, #0x30]
 41f0de4: d63f0100     	blr	x8
 41f0de8: 97fffe88     	bl	0x41f0808 <_ChromeMain+0x41eb56c>
 41f0dec: 52000014     	eor	w20, w0, #0x1
 41f0df0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41f0df4: 36fff668     	tbz	w8, #0x1f, 0x41f0cc0 <_ChromeMain+0x41eba24>
 41f0df8: f94003e0     	ldr	x0, [sp]
 41f0dfc: 17fffff3     	b	0x41f0dc8 <_ChromeMain+0x41ebb2c>
