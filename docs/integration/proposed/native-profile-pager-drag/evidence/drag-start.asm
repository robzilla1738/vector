Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4652488: b4000221     	cbz	x1, 0x46524cc <_ChromeMain+0x464d230>
 465248c: d10143ff     	sub	sp, sp, #0x50
 4652490: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4652494: a90257f6     	stp	x22, x21, [sp, #0x20]
 4652498: a9034ff4     	stp	x20, x19, [sp, #0x30]
 465249c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 46524a0: 910103fd     	add	x29, sp, #0x40
 46524a4: aa0003f3     	mov	x19, x0
 46524a8: f942f00a     	ldr	x10, [x0, #0x5e0]
 46524ac: b400006a     	cbz	x10, 0x46524b8 <_ChromeMain+0x464d21c>
 46524b0: f943fe68     	ldr	x8, [x19, #0x7f8]
 46524b4: b40000e8     	cbz	x8, 0x46524d0 <_ChromeMain+0x464d234>
 46524b8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 46524bc: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 46524c0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 46524c4: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 46524c8: 910143ff     	add	sp, sp, #0x50
 46524cc: d65f03c0     	ret
 46524d0: f9439a68     	ldr	x8, [x19, #0x730]
 46524d4: f9438e69     	ldr	x9, [x19, #0x718]
 46524d8: eb09011f     	cmp	x8, x9
 46524dc: 54fffee1     	b.ne	0x46524b8 <_ChromeMain+0x464d21c>
 46524e0: f940cd49     	ldr	x9, [x10, #0x198]
 46524e4: d37df129     	lsl	x9, x9, #3
 46524e8: b4fffe89     	cbz	x9, 0x46524b8 <_ChromeMain+0x464d21c>
 46524ec: d280000b     	mov	x11, #0x0               ; =0
 46524f0: f940c94a     	ldr	x10, [x10, #0x190]
 46524f4: f86b694c     	ldr	x12, [x10, x11]
 46524f8: eb01019f     	cmp	x12, x1
 46524fc: 540000a0     	b.eq	0x4652510 <_ChromeMain+0x464d274>
 4652500: 9100216b     	add	x11, x11, #0x8
 4652504: eb0b013f     	cmp	x9, x11
 4652508: 54ffff61     	b.ne	0x46524f4 <_ChromeMain+0x464d258>
 465250c: 17ffffeb     	b	0x46524b8 <_ChromeMain+0x464d21c>
 4652510: 9343fd74     	asr	x20, x11, #3
 4652514: eb08029f     	cmp	x20, x8
 4652518: 54fffd02     	b.hs	0x46524b8 <_ChromeMain+0x464d21c>
 465251c: aa1303e0     	mov	x0, x19
 4652520: 97fffdba     	bl	0x4651c08 <_ChromeMain+0x464c96c>
 4652524: f9438e68     	ldr	x8, [x19, #0x718]
 4652528: b40000c8     	cbz	x8, 0x4652540 <_ChromeMain+0x464d2a4>
 465252c: 52800015     	mov	w21, #0x0               ; =0
 4652530: d2800016     	mov	x22, #0x0               ; =0
 4652534: 128002f7     	mov	w23, #-0x18             ; =-24
 4652538: 12b00018     	mov	w24, #0x7fffffff        ; =2147483647
 465253c: 14000028     	b	0x46525dc <_ChromeMain+0x464d340>
 4652540: f903d674     	str	x20, [x19, #0x7a8]
 4652544: 52800028     	mov	w8, #0x1                ; =1
 4652548: 391ec268     	strb	w8, [x19, #0x7b0]
 465254c: f903de74     	str	x20, [x19, #0x7b8]
 4652550: 391f0268     	strb	w8, [x19, #0x7c0]
 4652554: f9439661     	ldr	x1, [x19, #0x728]
 4652558: f9439a68     	ldr	x8, [x19, #0x730]
 465255c: 8b080508     	add	x8, x8, x8, lsl #1
 4652560: 8b080c22     	add	x2, x1, x8, lsl #3
 4652564: 9340f108     	sbfx	x8, x8, #0, #61
 4652568: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 465256c: f2955569     	movk	x9, #0xaaab
 4652570: 9b097d03     	mul	x3, x8, x9
 4652574: 911f2260     	add	x0, x19, #0x7c8
 4652578: 97b95642     	bl	0x34a7e80 <_ChromeMain+0x34a2be4>
 465257c: 3920227f     	strb	wzr, [x19, #0x808]
 4652580: 17ffffce     	b	0x46524b8 <_ChromeMain+0x464d21c>
 4652584: b941c129     	ldr	w9, [x9, #0x1c0]
 4652588: 1b172508     	madd	w8, w8, w23, w9
 465258c: 0b487d08     	add	w8, w8, w8, lsr #31
 4652590: 0b8806a8     	add	w8, w21, w8, asr #1
 4652594: 31006109     	adds	w9, w8, #0x18
 4652598: 1a896309     	csel	w9, w24, w9, vs
 465259c: 6b080129     	subs	w9, w9, w8
 46525a0: 131f7d2a     	asr	w10, w9, #31
 46525a4: 5201014a     	eor	w10, w10, #0x80000000
 46525a8: 1a896149     	csel	w9, w10, w9, vs
 46525ac: 0aa97d29     	bic	w9, w9, w9, asr #31
 46525b0: b25d0529     	orr	x9, x9, #0x1800000000
 46525b4: f9438a6a     	ldr	x10, [x19, #0x710]
 46525b8: f8767940     	ldr	x0, [x10, x22, lsl #3]
 46525bc: a90027e8     	stp	x8, x9, [sp]
 46525c0: 910003e1     	mov	x1, sp
 46525c4: 97094973     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 46525c8: 910006d6     	add	x22, x22, #0x1
 46525cc: f9438e68     	ldr	x8, [x19, #0x718]
 46525d0: 110062b5     	add	w21, w21, #0x18
 46525d4: eb0802df     	cmp	x22, x8
 46525d8: 54fffb42     	b.hs	0x4652540 <_ChromeMain+0x464d2a4>
 46525dc: f942f269     	ldr	x9, [x19, #0x5e0]
 46525e0: b5fffd29     	cbnz	x9, 0x4652584 <_ChromeMain+0x464d2e8>
 46525e4: d2800008     	mov	x8, #0x0                ; =0
 46525e8: 17fffff3     	b	0x46525b4 <_ChromeMain+0x464d318>
 46525ec: d503201f     	nop
 46525f0: d503201f     	nop
 46525f4: d503201f     	nop
 46525f8: d503201f     	nop
 46525fc: d503201f     	nop
