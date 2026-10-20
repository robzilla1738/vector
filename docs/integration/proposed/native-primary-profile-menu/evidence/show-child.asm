
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 456fae8: d10183ff     	sub	sp, sp, #0x60
 456faec: a90167fa     	stp	x26, x25, [sp, #0x10]
 456faf0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 456faf4: a90357f6     	stp	x22, x21, [sp, #0x30]
 456faf8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 456fafc: a9057bfd     	stp	x29, x30, [sp, #0x50]
 456fb00: 910143fd     	add	x29, sp, #0x50
 456fb04: b9000fe1     	str	w1, [sp, #0xc]
 456fb08: f9400808     	ldr	x8, [x0, #0x10]
 456fb0c: b4000528     	cbz	x8, 0x456fbb0 <_ChromeMain+0x456a914>
 456fb10: aa0203f5     	mov	x21, x2
 456fb14: b40004e2     	cbz	x2, 0x456fbb0 <_ChromeMain+0x456a914>
 456fb18: aa0003f4     	mov	x20, x0
 456fb1c: f9401008     	ldr	x8, [x0, #0x20]
 456fb20: b4000488     	cbz	x8, 0x456fbb0 <_ChromeMain+0x456a914>
 456fb24: aa0303f3     	mov	x19, x3
 456fb28: aa0103f6     	mov	x22, x1
 456fb2c: f94002a8     	ldr	x8, [x21]
 456fb30: f9403508     	ldr	x8, [x8, #0x68]
 456fb34: aa1503e0     	mov	x0, x21
 456fb38: d63f0100     	blr	x8
 456fb3c: b40003a0     	cbz	x0, 0x456fbb0 <_ChromeMain+0x456a914>
 456fb40: 710026df     	cmp	w22, #0x9
 456fb44: 540002c0     	b.eq	0x456fb9c <_ChromeMain+0x456a900>
 456fb48: 34000436     	cbz	w22, 0x456fbcc <_ChromeMain+0x456a930>
 456fb4c: f9402a88     	ldr	x8, [x20, #0x50]
 456fb50: b4001948     	cbz	x8, 0x456fe78 <_ChromeMain+0x456abdc>
 456fb54: f9402688     	ldr	x8, [x20, #0x48]
 456fb58: b4001908     	cbz	x8, 0x456fe78 <_ChromeMain+0x456abdc>
 456fb5c: f9417508     	ldr	x8, [x8, #0x2e8]
 456fb60: b40018c8     	cbz	x8, 0x456fe78 <_ChromeMain+0x456abdc>
 456fb64: f9400d08     	ldr	x8, [x8, #0x18]
 456fb68: eb15011f     	cmp	x8, x21
 456fb6c: 54001861     	b.ne	0x456fe78 <_ChromeMain+0x456abdc>
 456fb70: b940fa88     	ldr	w8, [x20, #0xf8]
 456fb74: 6b16011f     	cmp	w8, w22
 456fb78: 54001801     	b.ne	0x456fe78 <_ChromeMain+0x456abdc>
 456fb7c: f9401288     	ldr	x8, [x20, #0x20]
 456fb80: b4000188     	cbz	x8, 0x456fbb0 <_ChromeMain+0x456a914>
 456fb84: f941bd09     	ldr	x9, [x8, #0x378]
 456fb88: d37ced33     	lsl	x19, x9, #4
 456fb8c: b4000133     	cbz	x19, 0x456fbb0 <_ChromeMain+0x456a914>
 456fb90: f941b908     	ldr	x8, [x8, #0x370]
 456fb94: 91002114     	add	x20, x8, #0x8
 456fb98: 1400001a     	b	0x456fc00 <_ChromeMain+0x456a964>
 456fb9c: b940fe97     	ldr	w23, [x20, #0xfc]
 456fba0: f9402a88     	ldr	x8, [x20, #0x50]
 456fba4: b5000468     	cbnz	x8, 0x456fc30 <_ChromeMain+0x456a994>
 456fba8: 71000eff     	cmp	w23, #0x3
 456fbac: 54000420     	b.eq	0x456fc30 <_ChromeMain+0x456a994>
 456fbb0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 456fbb4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 456fbb8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 456fbbc: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 456fbc0: a94167fa     	ldp	x26, x25, [sp, #0x10]
 456fbc4: 910183ff     	add	sp, sp, #0x60
 456fbc8: d65f03c0     	ret
 456fbcc: aa1403e0     	mov	x0, x20
 456fbd0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 456fbd4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 456fbd8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 456fbdc: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 456fbe0: a94167fa     	ldp	x26, x25, [sp, #0x10]
 456fbe4: 910183ff     	add	sp, sp, #0x60
 456fbe8: 140000e7     	b	0x456ff84 <_ChromeMain+0x456ace8>
 456fbec: 3912e41f     	strb	wzr, [x0, #0x4b9]
 456fbf0: 94002d42     	bl	0x457b0f8 <_ChromeMain+0x4575e5c>
 456fbf4: 91004294     	add	x20, x20, #0x10
 456fbf8: f1004273     	subs	x19, x19, #0x10
 456fbfc: 54fffda0     	b.eq	0x456fbb0 <_ChromeMain+0x456a914>
 456fc00: f9400280     	ldr	x0, [x20]
 456fc04: b4ffff80     	cbz	x0, 0x456fbf4 <_ChromeMain+0x456a958>
 456fc08: b85f8288     	ldur	w8, [x20, #-0x8]
 456fc0c: 6b16011f     	cmp	w8, w22
 456fc10: 1a9f17e9     	cset	w9, eq
 456fc14: 3952e00a     	ldrb	w10, [x0, #0x4b8]
 456fc18: 6b09015f     	cmp	w10, w9
 456fc1c: 54fffec0     	b.eq	0x456fbf4 <_ChromeMain+0x456a958>
 456fc20: 3912e009     	strb	w9, [x0, #0x4b8]
 456fc24: 6b16011f     	cmp	w8, w22
 456fc28: 54fffe40     	b.eq	0x456fbf0 <_ChromeMain+0x456a954>
 456fc2c: 17fffff0     	b	0x456fbec <_ChromeMain+0x456a950>
 456fc30: f9404a88     	ldr	x8, [x20, #0x90]
 456fc34: b4000a48     	cbz	x8, 0x456fd7c <_ChromeMain+0x456aae0>
 456fc38: f9404688     	ldr	x8, [x20, #0x88]
 456fc3c: b4000a08     	cbz	x8, 0x456fd7c <_ChromeMain+0x456aae0>
 456fc40: f9417508     	ldr	x8, [x8, #0x2e8]
 456fc44: b40009c8     	cbz	x8, 0x456fd7c <_ChromeMain+0x456aae0>
 456fc48: f9400d08     	ldr	x8, [x8, #0x18]
 456fc4c: eb15011f     	cmp	x8, x21
 456fc50: 54000961     	b.ne	0x456fd7c <_ChromeMain+0x456aae0>
 456fc54: 39445e89     	ldrb	w9, [x20, #0x117]
 456fc58: 13001d28     	sxtb	w8, w9
 456fc5c: f940868a     	ldr	x10, [x20, #0x108]
 456fc60: 7100011f     	cmp	w8, #0x0
 456fc64: 9a894142     	csel	x2, x10, x9, mi
 456fc68: 39405e6a     	ldrb	w10, [x19, #0x17]
 456fc6c: 13001d49     	sxtb	w9, w10
 456fc70: f940066b     	ldr	x11, [x19, #0x8]
 456fc74: 7100013f     	cmp	w9, #0x0
 456fc78: 9a8a416a     	csel	x10, x11, x10, mi
 456fc7c: eb0a005f     	cmp	x2, x10
 456fc80: 540007e1     	b.ne	0x456fd7c <_ChromeMain+0x456aae0>
 456fc84: 9104028a     	add	x10, x20, #0x100
 456fc88: f940828b     	ldr	x11, [x20, #0x100]
 456fc8c: 7100011f     	cmp	w8, #0x0
 456fc90: 9a8a4160     	csel	x0, x11, x10, mi
 456fc94: f9400268     	ldr	x8, [x19]
 456fc98: 7100013f     	cmp	w9, #0x0
 456fc9c: 9a934101     	csel	x1, x8, x19, mi
 456fca0: 94ea66f0     	bl	0x8009860 <_ChromeMain+0x80045c4>
 456fca4: 350006c0     	cbnz	w0, 0x456fd7c <_ChromeMain+0x456aae0>
 456fca8: f9403288     	ldr	x8, [x20, #0x60]
 456fcac: b5000088     	cbnz	x8, 0x456fcbc <_ChromeMain+0x456aa20>
 456fcb0: 71000eff     	cmp	w23, #0x3
 456fcb4: 54000041     	b.ne	0x456fcbc <_ChromeMain+0x456aa20>
 456fcb8: f9401288     	ldr	x8, [x20, #0x20]
 456fcbc: b4fff7a8     	cbz	x8, 0x456fbb0 <_ChromeMain+0x456a914>
 456fcc0: f941c909     	ldr	x9, [x8, #0x390]
 456fcc4: d37be935     	lsl	x21, x9, #5
 456fcc8: b4fff755     	cbz	x21, 0x456fbb0 <_ChromeMain+0x456a914>
 456fccc: f941c516     	ldr	x22, [x8, #0x388]
 456fcd0: 1400000a     	b	0x456fcf8 <_ChromeMain+0x456aa5c>
 456fcd4: 3952e288     	ldrb	w8, [x20, #0x4b8]
 456fcd8: 340000a8     	cbz	w8, 0x456fcec <_ChromeMain+0x456aa50>
 456fcdc: 3912e29f     	strb	wzr, [x20, #0x4b8]
 456fce0: 3912e69f     	strb	wzr, [x20, #0x4b9]
 456fce4: aa1403e0     	mov	x0, x20
 456fce8: 94002d04     	bl	0x457b0f8 <_ChromeMain+0x4575e5c>
 456fcec: 910082d6     	add	x22, x22, #0x20
 456fcf0: f10082b5     	subs	x21, x21, #0x20
 456fcf4: 54fff5e0     	b.eq	0x456fbb0 <_ChromeMain+0x456a914>
 456fcf8: f9400ed4     	ldr	x20, [x22, #0x18]
 456fcfc: b4ffff94     	cbz	x20, 0x456fcec <_ChromeMain+0x456aa50>
 456fd00: 39405ec9     	ldrb	w9, [x22, #0x17]
 456fd04: 13001d28     	sxtb	w8, w9
 456fd08: f94006ca     	ldr	x10, [x22, #0x8]
 456fd0c: 7100011f     	cmp	w8, #0x0
 456fd10: 9a894142     	csel	x2, x10, x9, mi
 456fd14: 39405e6a     	ldrb	w10, [x19, #0x17]
 456fd18: 13001d49     	sxtb	w9, w10
 456fd1c: f940066b     	ldr	x11, [x19, #0x8]
 456fd20: 7100013f     	cmp	w9, #0x0
 456fd24: 9a8a416a     	csel	x10, x11, x10, mi
 456fd28: eb0a005f     	cmp	x2, x10
 456fd2c: 54fffd41     	b.ne	0x456fcd4 <_ChromeMain+0x456aa38>
 456fd30: f94002ca     	ldr	x10, [x22]
 456fd34: 7100011f     	cmp	w8, #0x0
 456fd38: 9a964140     	csel	x0, x10, x22, mi
 456fd3c: f9400268     	ldr	x8, [x19]
 456fd40: 7100013f     	cmp	w9, #0x0
 456fd44: 9a934101     	csel	x1, x8, x19, mi
 456fd48: 94ea66c6     	bl	0x8009860 <_ChromeMain+0x80045c4>
 456fd4c: 7100001f     	cmp	w0, #0x0
 456fd50: 1a9f17e8     	cset	w8, eq
 456fd54: 3952e289     	ldrb	w9, [x20, #0x4b8]
 456fd58: 6b08013f     	cmp	w9, w8
 456fd5c: 54fffc80     	b.eq	0x456fcec <_ChromeMain+0x456aa50>
 456fd60: 3912e288     	strb	w8, [x20, #0x4b8]
 456fd64: 35fffbe0     	cbnz	w0, 0x456fce0 <_ChromeMain+0x456aa44>
 456fd68: 17ffffdf     	b	0x456fce4 <_ChromeMain+0x456aa48>
 456fd6c: a9400a61     	ldp	x1, x2, [x19]
 456fd70: 91040280     	add	x0, x20, #0x100
 456fd74: 96fce350     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 456fd78: 1400000e     	b	0x456fdb0 <_ChromeMain+0x456ab14>
 456fd7c: aa1403e0     	mov	x0, x20
 456fd80: 94000120     	bl	0x4570200 <_ChromeMain+0x456af64>
 456fd84: 91040288     	add	x8, x20, #0x100
 456fd88: eb13011f     	cmp	x8, x19
 456fd8c: 54000120     	b.eq	0x456fdb0 <_ChromeMain+0x456ab14>
 456fd90: 39c45e8a     	ldrsb	w10, [x20, #0x117]
 456fd94: 39405e69     	ldrb	w9, [x19, #0x17]
 456fd98: 37f80daa     	tbnz	w10, #0x1f, 0x456ff4c <_ChromeMain+0x456acb0>
 456fd9c: 373ffe89     	tbnz	w9, #0x7, 0x456fd6c <_ChromeMain+0x456aad0>
 456fda0: 3dc00260     	ldr	q0, [x19]
 456fda4: f9400a69     	ldr	x9, [x19, #0x10]
 456fda8: f9000909     	str	x9, [x8, #0x10]
 456fdac: 3d800100     	str	q0, [x8]
 456fdb0: f90003f4     	str	x20, [sp]
 456fdb4: 910003e1     	mov	x1, sp
 456fdb8: 9104c282     	add	x2, x20, #0x130
 456fdbc: 910033e3     	add	x3, sp, #0xc
 456fdc0: aa1403e0     	mov	x0, x20
 456fdc4: aa1303e4     	mov	x4, x19
 456fdc8: 940001b7     	bl	0x45704a4 <_ChromeMain+0x456b208>
 456fdcc: aa0003f6     	mov	x22, x0
 456fdd0: f940c698     	ldr	x24, [x20, #0x188]
 456fdd4: b40000d8     	cbz	x24, 0x456fdec <_ChromeMain+0x456ab50>
 456fdd8: 52800028     	mov	w8, #0x1                ; =1
 456fddc: b8280308     	ldadd	w8, w8, [x24]
 456fde0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 456fde4: 6b09011f     	cmp	w8, w9
 456fde8: 54000c80     	b.eq	0x456ff78 <_ChromeMain+0x456acdc>
 456fdec: f940ca99     	ldr	x25, [x20, #0x190]
 456fdf0: 52800700     	mov	w0, #0x38               ; =56
 456fdf4: 96ea7d5d     	bl	0xf368 <_ChromeMain+0xa0cc>
 456fdf8: aa0003e7     	mov	x7, x0
 456fdfc: 52800028     	mov	w8, #0x1                ; =1
 456fe00: b9000008     	str	w8, [x0]
 456fe04: 1009cc68     	adr	x8, 0x4583790 <_ChromeMain+0x457e4f4>
 456fe08: d503201f     	nop
 456fe0c: 90ffd649     	adrp	x9, 0x4037000 <_ChromeMain+0x4031d64>
 456fe10: 91130129     	add	x9, x9, #0x4c0
 456fe14: a900a408     	stp	x8, x9, [x0, #0x8]
 456fe18: d0feff68     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 456fe1c: 912c0108     	add	x8, x8, #0xb00
 456fe20: f9000c08     	str	x8, [x0, #0x18]
 456fe24: a902e418     	stp	x24, x25, [x0, #0x28]
 456fe28: 91022282     	add	x2, x20, #0x88
 456fe2c: 91026283     	add	x3, x20, #0x98
 456fe30: aa1503e0     	mov	x0, x21
 456fe34: aa1603e1     	mov	x1, x22
 456fe38: 52800084     	mov	w4, #0x4                ; =4
 456fe3c: 528000c5     	mov	w5, #0x6                ; =6
 456fe40: 52800006     	mov	w6, #0x0                ; =0
 456fe44: 95fff7a8     	bl	0xc56dce4 <_ChromeMain+0xc568a48>
 456fe48: aa0003e2     	mov	x2, x0
 456fe4c: f9404a80     	ldr	x0, [x20, #0x90]
 456fe50: f9004a82     	str	x2, [x20, #0x90]
 456fe54: b40000a0     	cbz	x0, 0x456fe68 <_ChromeMain+0x456abcc>
 456fe58: f9400008     	ldr	x8, [x0]
 456fe5c: f9400508     	ldr	x8, [x8, #0x8]
 456fe60: d63f0100     	blr	x8
 456fe64: f9404a82     	ldr	x2, [x20, #0x90]
 456fe68: aa1403e0     	mov	x0, x20
 456fe6c: aa1503e1     	mov	x1, x21
 456fe70: 97fffe3d     	bl	0x456f764 <_ChromeMain+0x456a4c8>
 456fe74: 17ffff8d     	b	0x456fca8 <_ChromeMain+0x456aa0c>
 456fe78: aa1403e0     	mov	x0, x20
 456fe7c: 94000042     	bl	0x456ff84 <_ChromeMain+0x456ace8>
 456fe80: b900fa96     	str	w22, [x20, #0xf8]
 456fe84: f90003f4     	str	x20, [sp]
 456fe88: 910003e1     	mov	x1, sp
 456fe8c: 9104c282     	add	x2, x20, #0x130
 456fe90: 910033e3     	add	x3, sp, #0xc
 456fe94: aa1403e0     	mov	x0, x20
 456fe98: aa1303e4     	mov	x4, x19
 456fe9c: 94000182     	bl	0x45704a4 <_ChromeMain+0x456b208>
 456fea0: aa0003f3     	mov	x19, x0
 456fea4: f940c697     	ldr	x23, [x20, #0x188]
 456fea8: b40000d7     	cbz	x23, 0x456fec0 <_ChromeMain+0x456ac24>
 456feac: 52800028     	mov	w8, #0x1                ; =1
 456feb0: b82802e8     	ldadd	w8, w8, [x23]
 456feb4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 456feb8: 6b09011f     	cmp	w8, w9
 456febc: 54000580     	b.eq	0x456ff6c <_ChromeMain+0x456acd0>
 456fec0: f940ca98     	ldr	x24, [x20, #0x190]
 456fec4: 52800700     	mov	w0, #0x38               ; =56
 456fec8: 96ea7d28     	bl	0xf368 <_ChromeMain+0xa0cc>
 456fecc: aa0003e7     	mov	x7, x0
 456fed0: 52800028     	mov	w8, #0x1                ; =1
 456fed4: b9000008     	str	w8, [x0]
 456fed8: 1009c988     	adr	x8, 0x4583808 <_ChromeMain+0x457e56c>
 456fedc: d503201f     	nop
 456fee0: 90ffd649     	adrp	x9, 0x4037000 <_ChromeMain+0x4031d64>
 456fee4: 91130129     	add	x9, x9, #0x4c0
 456fee8: a900a408     	stp	x8, x9, [x0, #0x8]
 456feec: d0feff68     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 456fef0: 912c0108     	add	x8, x8, #0xb00
 456fef4: f9000c08     	str	x8, [x0, #0x18]
 456fef8: a902e017     	stp	x23, x24, [x0, #0x28]
 456fefc: 91012282     	add	x2, x20, #0x48
 456ff00: 91016283     	add	x3, x20, #0x58
 456ff04: aa1503e0     	mov	x0, x21
 456ff08: aa1303e1     	mov	x1, x19
 456ff0c: 52800084     	mov	w4, #0x4                ; =4
 456ff10: 528000c5     	mov	w5, #0x6                ; =6
 456ff14: 52800006     	mov	w6, #0x0                ; =0
 456ff18: 95fff773     	bl	0xc56dce4 <_ChromeMain+0xc568a48>
 456ff1c: aa0003e2     	mov	x2, x0
 456ff20: f9402a80     	ldr	x0, [x20, #0x50]
 456ff24: f9002a82     	str	x2, [x20, #0x50]
 456ff28: b40000a0     	cbz	x0, 0x456ff3c <_ChromeMain+0x456aca0>
 456ff2c: f9400008     	ldr	x8, [x0]
 456ff30: f9400508     	ldr	x8, [x8, #0x8]
 456ff34: d63f0100     	blr	x8
 456ff38: f9402a82     	ldr	x2, [x20, #0x50]
 456ff3c: aa1403e0     	mov	x0, x20
 456ff40: aa1503e1     	mov	x1, x21
 456ff44: 97fffe08     	bl	0x456f764 <_ChromeMain+0x456a4c8>
 456ff48: 17ffff0d     	b	0x456fb7c <_ChromeMain+0x456a8e0>
 456ff4c: 13001d28     	sxtb	w8, w9
 456ff50: 7100011f     	cmp	w8, #0x0
 456ff54: a9402a68     	ldp	x8, x10, [x19]
 456ff58: 9a934101     	csel	x1, x8, x19, mi
 456ff5c: 9a894142     	csel	x2, x10, x9, mi
 456ff60: 91040280     	add	x0, x20, #0x100
 456ff64: 96fce327     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 456ff68: 17ffff92     	b	0x456fdb0 <_ChromeMain+0x456ab14>
 456ff6c: d4200000     	brk	#0
 456ff70: d4400000     	hlt	#0
 456ff74: d4200020     	brk	#0x1
 456ff78: d4200000     	brk	#0
 456ff7c: d4400000     	hlt	#0
 456ff80: d4200020     	brk	#0x1
