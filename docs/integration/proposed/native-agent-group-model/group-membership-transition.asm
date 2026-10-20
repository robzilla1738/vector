
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41e34f8: d10583ff     	sub	sp, sp, #0x160
 41e34fc: a9106ffc     	stp	x28, x27, [sp, #0x100]
 41e3500: a91167fa     	stp	x26, x25, [sp, #0x110]
 41e3504: a9125ff8     	stp	x24, x23, [sp, #0x120]
 41e3508: a91357f6     	stp	x22, x21, [sp, #0x130]
 41e350c: a9144ff4     	stp	x20, x19, [sp, #0x140]
 41e3510: a9157bfd     	stp	x29, x30, [sp, #0x150]
 41e3514: 910543fd     	add	x29, sp, #0x150
 41e3518: aa0003f5     	mov	x21, x0
 41e351c: f9400400     	ldr	x0, [x0, #0x8]
 41e3520: b4000420     	cbz	x0, 0x41e35a4 <_ChromeMain+0x41de308>
 41e3524: aa0403f4     	mov	x20, x4
 41e3528: aa0303f7     	mov	x23, x3
 41e352c: aa0203f3     	mov	x19, x2
 41e3530: aa0103f6     	mov	x22, x1
 41e3534: 39404068     	ldrb	w8, [x3, #0x10]
 41e3538: 39404089     	ldrb	w9, [x4, #0x10]
 41e353c: 6a08013f     	tst	w9, w8
 41e3540: 54000420     	b.eq	0x41e35c4 <_ChromeMain+0x41de328>
 41e3544: 36001ec9     	tbz	w9, #0x0, 0x41e391c <_ChromeMain+0x41de680>
 41e3548: a9402ae9     	ldp	x9, x10, [x23]
 41e354c: a940328b     	ldp	x11, x12, [x20]
 41e3550: eb0b013f     	cmp	x9, x11
 41e3554: fa4c0140     	ccmp	x10, x12, #0x0, eq
 41e3558: 54000260     	b.eq	0x41e35a4 <_ChromeMain+0x41de308>
 41e355c: 350003a8     	cbnz	w8, 0x41e35d0 <_ChromeMain+0x41de334>
 41e3560: 52800019     	mov	w25, #0x0               ; =0
 41e3564: 5280001a     	mov	w26, #0x0               ; =0
 41e3568: f94006a0     	ldr	x0, [x21, #0x8]
 41e356c: b4000060     	cbz	x0, 0x41e3578 <_ChromeMain+0x41de2dc>
 41e3570: 39404288     	ldrb	w8, [x20, #0x10]
 41e3574: 370003c8     	tbnz	w8, #0x0, 0x41e35ec <_ChromeMain+0x41de350>
 41e3578: 910283fb     	add	x27, sp, #0xa0
 41e357c: 394042e8     	ldrb	w8, [x23, #0x10]
 41e3580: 35001168     	cbnz	w8, 0x41e37ac <_ChromeMain+0x41de510>
 41e3584: 39404288     	ldrb	w8, [x20, #0x10]
 41e3588: 350005c8     	cbnz	w8, 0x41e3640 <_ChromeMain+0x41de3a4>
 41e358c: 12000341     	and	w1, w26, #0x1
 41e3590: 12000328     	and	w8, w25, #0x1
 41e3594: 6b01011f     	cmp	w8, w1
 41e3598: 54000060     	b.eq	0x41e35a4 <_ChromeMain+0x41de308>
 41e359c: f9402260     	ldr	x0, [x19, #0x40]
 41e35a0: 97ffff5f     	bl	0x41e331c <_ChromeMain+0x41de080>
 41e35a4: a9557bfd     	ldp	x29, x30, [sp, #0x150]
 41e35a8: a9544ff4     	ldp	x20, x19, [sp, #0x140]
 41e35ac: a95357f6     	ldp	x22, x21, [sp, #0x130]
 41e35b0: a9525ff8     	ldp	x24, x23, [sp, #0x120]
 41e35b4: a95167fa     	ldp	x26, x25, [sp, #0x110]
 41e35b8: a9506ffc     	ldp	x28, x27, [sp, #0x100]
 41e35bc: 910583ff     	add	sp, sp, #0x160
 41e35c0: d65f03c0     	ret
 41e35c4: 6b09011f     	cmp	w8, w9
 41e35c8: 54fffee0     	b.eq	0x41e35a4 <_ChromeMain+0x41de308>
 41e35cc: 17ffffe4     	b	0x41e355c <_ChromeMain+0x41de2c0>
 41e35d0: aa1703e1     	mov	x1, x23
 41e35d4: 94ed8f49     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 41e35d8: b4fffc40     	cbz	x0, 0x41e3560 <_ChromeMain+0x41de2c4>
 41e35dc: f9405c08     	ldr	x8, [x0, #0xb8]
 41e35e0: b4fffc08     	cbz	x8, 0x41e3560 <_ChromeMain+0x41de2c4>
 41e35e4: 39404519     	ldrb	w25, [x8, #0x11]
 41e35e8: 17ffffdf     	b	0x41e3564 <_ChromeMain+0x41de2c8>
 41e35ec: aa1403e1     	mov	x1, x20
 41e35f0: 94ed8f42     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 41e35f4: b40000a0     	cbz	x0, 0x41e3608 <_ChromeMain+0x41de36c>
 41e35f8: f9405c08     	ldr	x8, [x0, #0xb8]
 41e35fc: b4000068     	cbz	x8, 0x41e3608 <_ChromeMain+0x41de36c>
 41e3600: 3940451a     	ldrb	w26, [x8, #0x11]
 41e3604: 17ffffdd     	b	0x41e3578 <_ChromeMain+0x41de2dc>
 41e3608: 5280001a     	mov	w26, #0x0               ; =0
