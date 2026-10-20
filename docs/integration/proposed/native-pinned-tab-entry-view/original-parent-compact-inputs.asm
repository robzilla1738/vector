
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464a8c0: d10283ff     	sub	sp, sp, #0xa0
 464a8c4: a9046ffc     	stp	x28, x27, [sp, #0x40]
 464a8c8: a90567fa     	stp	x26, x25, [sp, #0x50]
 464a8cc: a9065ff8     	stp	x24, x23, [sp, #0x60]
 464a8d0: a90757f6     	stp	x22, x21, [sp, #0x70]
 464a8d4: a9084ff4     	stp	x20, x19, [sp, #0x80]
 464a8d8: a9097bfd     	stp	x29, x30, [sp, #0x90]
 464a8dc: 910243fd     	add	x29, sp, #0x90
 464a8e0: aa0103f9     	mov	x25, x1
 464a8e4: aa0003f3     	mov	x19, x0
 464a8e8: f9442408     	ldr	x8, [x0, #0x848]
 464a8ec: 39424108     	ldrb	w8, [x8, #0x90]
 464a8f0: 340000a8     	cbz	w8, 0x464a904 <_ChromeMain+0x4645668>
 464a8f4: 39682269     	ldrb	w9, [x19, #0xa08]
 464a8f8: 37000509     	tbnz	w9, #0x0, 0x464a998 <_ChromeMain+0x46456fc>
 464a8fc: 39683269     	ldrb	w9, [x19, #0xa0c]
 464a900: 370004c9     	tbnz	w9, #0x0, 0x464a998 <_ChromeMain+0x46456fc>
 464a904: 3973826a     	ldrb	w10, [x19, #0xce0]
 464a908: 397de269     	ldrb	w9, [x19, #0xf78]
 464a90c: 360005aa     	tbz	w10, #0x0, 0x464a9c0 <_ChromeMain+0x4645724>
 464a910: 35000669     	cbnz	w9, 0x464a9dc <_ChromeMain+0x4645740>
 464a914: 3974a268     	ldrb	w8, [x19, #0xd28]
 464a918: 350000c8     	cbnz	w8, 0x464a930 <_ChromeMain+0x4645694>
 464a91c: fd46a260     	ldr	d0, [x19, #0xd40]
 464a920: 1e6e1001     	fmov	d1, #1.00000000
 464a924: 1e612000     	fcmp	d0, d1
 464a928: 1a9f17e8     	cset	w8, eq
 464a92c: 14000005     	b	0x464a940 <_ChromeMain+0x46456a4>
 464a930: b94d2668     	ldr	w8, [x19, #0xd24]
 464a934: 7100011f     	cmp	w8, #0x0
 464a938: 1a9f17e8     	cset	w8, eq
 464a93c: fd46a260     	ldr	d0, [x19, #0xd40]
 464a940: f0021da9     	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 464a944: 912db129     	add	x9, x9, #0xb6c
 464a948: d0ff7b8a     	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 464a94c: 9103514a     	add	x10, x10, #0xd4
 464a950: 7100011f     	cmp	w8, #0x0
 464a954: 9a891148     	csel	x8, x10, x9, ne
 464a958: b948ca69     	ldr	w9, [x19, #0x8c8]
 464a95c: 1e620121     	scvtf	d1, w9
 464a960: 1e610800     	fmul	d0, d0, d1
 464a964: d63f0100     	blr	x8
 464a968: 1e780008     	fcvtzs	w8, d0
 464a96c: b941c269     	ldr	w9, [x19, #0x1c0]
 464a970: f944266a     	ldr	x10, [x19, #0x848]
 464a974: 3942414a     	ldrb	w10, [x10, #0x90]
 464a978: 6b09011f     	cmp	w8, w9
 464a97c: 1a89b10b     	csel	w11, w8, w9, lt
 464a980: 7100013f     	cmp	w9, #0x0
 464a984: 1a88c168     	csel	w8, w11, w8, gt
 464a988: 71025d1f     	cmp	w8, #0x97
 464a98c: 1a9fa7f4     	cset	w20, lt
 464a990: 360002ea     	tbz	w10, #0x0, 0x464a9ec <_ChromeMain+0x4645750>
 464a994: 14000002     	b	0x464a99c <_ChromeMain+0x4645700>
 464a998: 52800014     	mov	w20, #0x0               ; =0
 464a99c: 39682268     	ldrb	w8, [x19, #0xa08]
 464a9a0: 37000268     	tbnz	w8, #0x0, 0x464a9ec <_ChromeMain+0x4645750>
 464a9a4: 39683268     	ldrb	w8, [x19, #0xa0c]
 464a9a8: 37000228     	tbnz	w8, #0x0, 0x464a9ec <_ChromeMain+0x4645750>
 464a9ac: 397de268     	ldrb	w8, [x19, #0xf78]
 464a9b0: 370001e8     	tbnz	w8, #0x0, 0x464a9ec <_ChromeMain+0x4645750>
 464a9b4: 39738268     	ldrb	w8, [x19, #0xce0]
 464a9b8: 52000115     	eor	w21, w8, #0x1
 464a9bc: 1400000d     	b	0x464a9f0 <_ChromeMain+0x4645754>
 464a9c0: 370000e9     	tbnz	w9, #0x0, 0x464a9dc <_ChromeMain+0x4645740>
 464a9c4: 34000068     	cbz	w8, 0x464a9d0 <_ChromeMain+0x4645734>
 464a9c8: aa0803f4     	mov	x20, x8
 464a9cc: 17fffff4     	b	0x464a99c <_ChromeMain+0x4645700>
 464a9d0: 52800015     	mov	w21, #0x0               ; =0
 464a9d4: aa0803f4     	mov	x20, x8
 464a9d8: 14000006     	b	0x464a9f0 <_ChromeMain+0x4645754>
 464a9dc: b941c269     	ldr	w9, [x19, #0x1c0]
 464a9e0: 71025d3f     	cmp	w9, #0x97
 464a9e4: 1a9fa7f4     	cset	w20, lt
 464a9e8: 3707fda8     	tbnz	w8, #0x0, 0x464a99c <_ChromeMain+0x4645700>
 464a9ec: 52800015     	mov	w21, #0x0               ; =0
 464a9f0: 397de268     	ldrb	w8, [x19, #0xf78]
 464a9f4: 370000a8     	tbnz	w8, #0x0, 0x464aa08 <_ChromeMain+0x464576c>
 464a9f8: 3973827b     	ldrb	w27, [x19, #0xce0]
 464a9fc: 14000004     	b	0x464aa0c <_ChromeMain+0x4645770>
