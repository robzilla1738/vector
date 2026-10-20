
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2d25d20: d10343ff     	sub	sp, sp, #0xd0
 2d25d24: a9076ffc     	stp	x28, x27, [sp, #0x70]
 2d25d28: a90867fa     	stp	x26, x25, [sp, #0x80]
 2d25d2c: a9095ff8     	stp	x24, x23, [sp, #0x90]
 2d25d30: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 2d25d34: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 2d25d38: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 2d25d3c: 910303fd     	add	x29, sp, #0xc0
 2d25d40: 39412008     	ldrb	w8, [x0, #0x48]
 2d25d44: 350004e8     	cbnz	w8, 0x2d25de0 <_ChromeMain+0x2d20b44>
 2d25d48: aa0403f5     	mov	x21, x4
 2d25d4c: aa0303f3     	mov	x19, x3
 2d25d50: aa0203f4     	mov	x20, x2
 2d25d54: aa0103f6     	mov	x22, x1
 2d25d58: 39c05c68     	ldrsb	w8, [x3, #0x17]
 2d25d5c: 36f80208     	tbz	w8, #0x1f, 0x2d25d9c <_ChromeMain+0x2d20b00>
 2d25d60: f9400668     	ldr	x8, [x19, #0x8]
 2d25d64: f100811f     	cmp	x8, #0x20
 2d25d68: 540001a1     	b.ne	0x2d25d9c <_ChromeMain+0x2d20b00>
 2d25d6c: f9400268     	ldr	x8, [x19]
 2d25d70: f0050909     	adrp	x9, 0xce48000 <dyld_stub_binder+0xce48000>
 2d25d74: 91252529     	add	x9, x9, #0x949
 2d25d78: a9402d0a     	ldp	x10, x11, [x8]
 2d25d7c: a940352c     	ldp	x12, x13, [x9]
 2d25d80: a941210e     	ldp	x14, x8, [x8, #0x10]
 2d25d84: a941252f     	ldp	x15, x9, [x9, #0x10]
 2d25d88: eb0c015f     	cmp	x10, x12
 2d25d8c: fa4d0160     	ccmp	x11, x13, #0x0, eq
 2d25d90: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 2d25d94: fa490100     	ccmp	x8, x9, #0x0, eq
 2d25d98: 54000340     	b.eq	0x2d25e00 <_ChromeMain+0x2d20b64>
 2d25d9c: 39c05e68     	ldrsb	w8, [x19, #0x17]
 2d25da0: 36f80208     	tbz	w8, #0x1f, 0x2d25de0 <_ChromeMain+0x2d20b44>
 2d25da4: f9400668     	ldr	x8, [x19, #0x8]
 2d25da8: f100811f     	cmp	x8, #0x20
 2d25dac: 540001a1     	b.ne	0x2d25de0 <_ChromeMain+0x2d20b44>
 2d25db0: f9400268     	ldr	x8, [x19]
 2d25db4: f0050909     	adrp	x9, 0xce48000 <dyld_stub_binder+0xce48000>
 2d25db8: 9125a929     	add	x9, x9, #0x96a
 2d25dbc: a9402d0a     	ldp	x10, x11, [x8]
 2d25dc0: a940352c     	ldp	x12, x13, [x9]
 2d25dc4: a941210e     	ldp	x14, x8, [x8, #0x10]
 2d25dc8: a941252f     	ldp	x15, x9, [x9, #0x10]
 2d25dcc: eb0c015f     	cmp	x10, x12
 2d25dd0: fa4d0160     	ccmp	x11, x13, #0x0, eq
 2d25dd4: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 2d25dd8: fa490100     	ccmp	x8, x9, #0x0, eq
 2d25ddc: 54001480     	b.eq	0x2d2606c <_ChromeMain+0x2d20dd0>
 2d25de0: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 2d25de4: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 2d25de8: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 2d25dec: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 2d25df0: a94867fa     	ldp	x26, x25, [sp, #0x80]
 2d25df4: a9476ffc     	ldp	x28, x27, [sp, #0x70]
 2d25df8: 910343ff     	add	sp, sp, #0xd0
 2d25dfc: d65f03c0     	ret
 2d25e00: aa0003f7     	mov	x23, x0
 2d25e04: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 2d25e08: f9002bff     	str	xzr, [sp, #0x50]
 2d25e0c: f0050901     	adrp	x1, 0xce48000 <dyld_stub_binder+0xce48000>
 2d25e10: 912db421     	add	x1, x1, #0xb6d
 2d25e14: 910103e2     	add	x2, sp, #0x40
 2d25e18: aa1603e0     	mov	x0, x22
 2d25e1c: 9406e2e1     	bl	0x2ede9a0 <_ChromeMain+0x2ed9704>
 2d25e20: f94027e8     	ldr	x8, [sp, #0x48]
 2d25e24: 8b080508     	add	x8, x8, x8, lsl #1
 2d25e28: d37df119     	lsl	x25, x8, #3
 2d25e2c: b4000399     	cbz	x25, 0x2d25e9c <_ChromeMain+0x2d20c00>
 2d25e30: f94023fa     	ldr	x26, [sp, #0x40]
 2d25e34: 39405e68     	ldrb	w8, [x19, #0x17]
 2d25e38: 13001d1b     	sxtb	w27, w8
 2d25e3c: f9400669     	ldr	x9, [x19, #0x8]
 2d25e40: 7100037f     	cmp	w27, #0x0
 2d25e44: 9a884138     	csel	x24, x9, x8, mi
 2d25e48: 14000004     	b	0x2d25e58 <_ChromeMain+0x2d20bbc>
 2d25e4c: 9100635a     	add	x26, x26, #0x18
 2d25e50: f1006339     	subs	x25, x25, #0x18
 2d25e54: 54000240     	b.eq	0x2d25e9c <_ChromeMain+0x2d20c00>
 2d25e58: 39405f49     	ldrb	w9, [x26, #0x17]
 2d25e5c: 13001d28     	sxtb	w8, w9
 2d25e60: f940074a     	ldr	x10, [x26, #0x8]
 2d25e64: 7100011f     	cmp	w8, #0x0
 2d25e68: 9a894149     	csel	x9, x10, x9, mi
 2d25e6c: eb18013f     	cmp	x9, x24
 2d25e70: 54fffee1     	b.ne	0x2d25e4c <_ChromeMain+0x2d20bb0>
 2d25e74: f9400349     	ldr	x9, [x26]
 2d25e78: 7100011f     	cmp	w8, #0x0
 2d25e7c: 9a9a4120     	csel	x0, x9, x26, mi
 2d25e80: f9400268     	ldr	x8, [x19]
 2d25e84: 7100037f     	cmp	w27, #0x0
 2d25e88: 9a934101     	csel	x1, x8, x19, mi
 2d25e8c: aa1803e2     	mov	x2, x24
 2d25e90: 954b8e74     	bl	0x8009860 <_ChromeMain+0x80045c4>
 2d25e94: 34000320     	cbz	w0, 0x2d25ef8 <_ChromeMain+0x2d20c5c>
 2d25e98: 17ffffed     	b	0x2d25e4c <_ChromeMain+0x2d20bb0>
 2d25e9c: 910103e0     	add	x0, sp, #0x40
 2d25ea0: aa1303e1     	mov	x1, x19
 2d25ea4: 97693f74     	bl	0x775c74 <_ChromeMain+0x7709d8>
 2d25ea8: f94023e8     	ldr	x8, [sp, #0x40]
 2d25eac: f90013e8     	str	x8, [sp, #0x20]
 2d25eb0: 3cc483e0     	ldur	q0, [sp, #0x48]
 2d25eb4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 2d25eb8: f9002bff     	str	xzr, [sp, #0x50]
 2d25ebc: 3c8283e0     	stur	q0, [sp, #0x28]
 2d25ec0: 910083e0     	add	x0, sp, #0x20
 2d25ec4: 940001b7     	bl	0x2d265a0 <_ChromeMain+0x2d21304>
 2d25ec8: f0050901     	adrp	x1, 0xce48000 <dyld_stub_binder+0xce48000>
 2d25ecc: 912db421     	add	x1, x1, #0xb6d
 2d25ed0: 910083e2     	add	x2, sp, #0x20
 2d25ed4: aa1603e0     	mov	x0, x22
 2d25ed8: 94fd7e35     	bl	0x6c857ac <_ChromeMain+0x6c80510>
 2d25edc: f94013f8     	ldr	x24, [sp, #0x20]
 2d25ee0: b50004b8     	cbnz	x24, 0x2d25f74 <_ChromeMain+0x2d20cd8>
 2d25ee4: 340000b5     	cbz	w21, 0x2d25ef8 <_ChromeMain+0x2d20c5c>
 2d25ee8: aa1403e0     	mov	x0, x20
 2d25eec: aa1303e1     	mov	x1, x19
 2d25ef0: 52800022     	mov	w2, #0x1                ; =1
 2d25ef4: 9524044f     	bl	0x7627030 <_ChromeMain+0x7621d94>
 2d25ef8: f94023f8     	ldr	x24, [sp, #0x40]
 2d25efc: b5000098     	cbnz	x24, 0x2d25f0c <_ChromeMain+0x2d20c70>
 2d25f00: 394122e8     	ldrb	w8, [x23, #0x48]
 2d25f04: 3707f6e8     	tbnz	w8, #0x0, 0x2d25de0 <_ChromeMain+0x2d20b44>
 2d25f08: 17ffffa5     	b	0x2d25d9c <_ChromeMain+0x2d20b00>
 2d25f0c: f94027e8     	ldr	x8, [sp, #0x48]
 2d25f10: 8b080509     	add	x9, x8, x8, lsl #1
 2d25f14: d37df129     	lsl	x9, x9, #3
 2d25f18: b4002009     	cbz	x9, 0x2d26318 <_ChromeMain+0x2d2107c>
 2d25f1c: 8b180129     	add	x9, x9, x24
 2d25f20: d1006139     	sub	x25, x9, #0x18
 2d25f24: d37df109     	lsl	x9, x8, #3
 2d25f28: cb08153a     	sub	x26, x9, x8, lsl #5
 2d25f2c: b4002079     	cbz	x25, 0x2d26338 <_ChromeMain+0x2d2109c>
 2d25f30: 39c05f28     	ldrsb	w8, [x25, #0x17]
 2d25f34: 37f807e8     	tbnz	w8, #0x1f, 0x2d26030 <_ChromeMain+0x2d20d94>
 2d25f38: d1006339     	sub	x25, x25, #0x18
 2d25f3c: b100635a     	adds	x26, x26, #0x18
 2d25f40: 54ffff61     	b.ne	0x2d25f2c <_ChromeMain+0x2d20c90>
 2d25f44: f94023e0     	ldr	x0, [sp, #0x40]
 2d25f48: cb000308     	sub	x8, x24, x0
 2d25f4c: 9343fd08     	asr	x8, x8, #3
 2d25f50: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 2d25f54: f2955569     	movk	x9, #0xaaab
 2d25f58: 9b097d08     	mul	x8, x8, x9
 2d25f5c: f90027e8     	str	x8, [sp, #0x48]
 2d25f60: f9402be8     	ldr	x8, [sp, #0x50]
 2d25f64: 8b080508     	add	x8, x8, x8, lsl #1
 2d25f68: d37df101     	lsl	x1, x8, #3
 2d25f6c: 974b8bd3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d25f70: 17ffffe4     	b	0x2d25f00 <_ChromeMain+0x2d20c64>
 2d25f74: f94017e8     	ldr	x8, [sp, #0x28]
 2d25f78: 8b080509     	add	x9, x8, x8, lsl #1
 2d25f7c: d37df129     	lsl	x9, x9, #3
 2d25f80: b4001d09     	cbz	x9, 0x2d26320 <_ChromeMain+0x2d21084>
 2d25f84: 8b180129     	add	x9, x9, x24
 2d25f88: d1006139     	sub	x25, x9, #0x18
 2d25f8c: d37df109     	lsl	x9, x8, #3
 2d25f90: cb08153a     	sub	x26, x9, x8, lsl #5
 2d25f94: b4001d39     	cbz	x25, 0x2d26338 <_ChromeMain+0x2d2109c>
 2d25f98: 39c05f28     	ldrsb	w8, [x25, #0x17]
 2d25f9c: 37f81aa8     	tbnz	w8, #0x1f, 0x2d262f0 <_ChromeMain+0x2d21054>
 2d25fa0: d1006339     	sub	x25, x25, #0x18
 2d25fa4: b100635a     	adds	x26, x26, #0x18
 2d25fa8: 54ffff61     	b.ne	0x2d25f94 <_ChromeMain+0x2d20cf8>
 2d25fac: f94013e0     	ldr	x0, [sp, #0x20]
 2d25fb0: cb000308     	sub	x8, x24, x0
 2d25fb4: 9343fd08     	asr	x8, x8, #3
 2d25fb8: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 2d25fbc: f2955569     	movk	x9, #0xaaab
 2d25fc0: 9b097d08     	mul	x8, x8, x9
 2d25fc4: f90017e8     	str	x8, [sp, #0x28]
 2d25fc8: f9401be8     	ldr	x8, [sp, #0x30]
 2d25fcc: 8b080508     	add	x8, x8, x8, lsl #1
 2d25fd0: d37df101     	lsl	x1, x8, #3
 2d25fd4: 974b8bb9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d25fd8: 35fff895     	cbnz	w21, 0x2d25ee8 <_ChromeMain+0x2d20c4c>
 2d25fdc: 17ffffc7     	b	0x2d25ef8 <_ChromeMain+0x2d20c5c>
 2d25fe0: 91006339     	add	x25, x25, #0x18
 2d25fe4: f1006318     	subs	x24, x24, #0x18
 2d25fe8: 54001140     	b.eq	0x2d26210 <_ChromeMain+0x2d20f74>
 2d25fec: 39405f29     	ldrb	w9, [x25, #0x17]
 2d25ff0: 13001d28     	sxtb	w8, w9
 2d25ff4: f940072a     	ldr	x10, [x25, #0x8]
 2d25ff8: 7100011f     	cmp	w8, #0x0
 2d25ffc: 9a894149     	csel	x9, x10, x9, mi
 2d26000: eb17013f     	cmp	x9, x23
 2d26004: 54fffee1     	b.ne	0x2d25fe0 <_ChromeMain+0x2d20d44>
 2d26008: f9400329     	ldr	x9, [x25]
 2d2600c: 7100011f     	cmp	w8, #0x0
 2d26010: 9a994120     	csel	x0, x9, x25, mi
 2d26014: f9400268     	ldr	x8, [x19]
 2d26018: 7100035f     	cmp	w26, #0x0
 2d2601c: 9a934101     	csel	x1, x8, x19, mi
 2d26020: aa1703e2     	mov	x2, x23
 2d26024: 954b8e0f     	bl	0x8009860 <_ChromeMain+0x80045c4>
 2d26028: 34001220     	cbz	w0, 0x2d2626c <_ChromeMain+0x2d20fd0>
 2d2602c: 17ffffed     	b	0x2d25fe0 <_ChromeMain+0x2d20d44>
 2d26030: f9400320     	ldr	x0, [x25]
 2d26034: f9400b28     	ldr	x8, [x25, #0x10]
 2d26038: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2d2603c: 974b8b9f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d26040: 17ffffbe     	b	0x2d25f38 <_ChromeMain+0x2d20c9c>
 2d26044: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 2d26048: 36f80568     	tbz	w8, #0x1f, 0x2d260f4 <_ChromeMain+0x2d20e58>
 2d2604c: 140000ae     	b	0x2d26304 <_ChromeMain+0x2d21068>
 2d26050: 7100111f     	cmp	w8, #0x4
 2d26054: 54ffff80     	b.eq	0x2d26044 <_ChromeMain+0x2d20da8>
 2d26058: f8685ae8     	ldr	x8, [x23, w8, uxtw #3]
 2d2605c: d10147a0     	sub	x0, x29, #0x51
 2d26060: 910103e1     	add	x1, sp, #0x40
 2d26064: d63f0100     	blr	x8
 2d26068: 14000023     	b	0x2d260f4 <_ChromeMain+0x2d20e58>
 2d2606c: 381ae3bf     	sturb	wzr, [x29, #-0x52]
 2d26070: 90050ec2     	adrp	x2, 0xcefe000 <dyld_stub_binder+0xcefe000>
 2d26074: 913b4842     	add	x2, x2, #0xed2
 2d26078: d1014ba4     	sub	x4, x29, #0x52
 2d2607c: aa1603e0     	mov	x0, x22
 2d26080: aa1303e1     	mov	x1, x19
 2d26084: 528005c3     	mov	w3, #0x2e               ; =46
 2d26088: 94fd7646     	bl	0x6c839a0 <_ChromeMain+0x6c7e704>
 2d2608c: 34000060     	cbz	w0, 0x2d26098 <_ChromeMain+0x2d20dfc>
 2d26090: 385ae3a8     	ldurb	w8, [x29, #-0x52]
 2d26094: 3707ea68     	tbnz	w8, #0x0, 0x2d25de0 <_ChromeMain+0x2d20b44>
 2d26098: 52800037     	mov	w23, #0x1               ; =1
 2d2609c: 390083f7     	strb	w23, [sp, #0x20]
 2d260a0: 3900e3f7     	strb	w23, [sp, #0x38]
 2d260a4: 910103e0     	add	x0, sp, #0x40
 2d260a8: 910083e1     	add	x1, sp, #0x20
 2d260ac: 97afa335     	bl	0x190ed80 <_ChromeMain+0x1909ae4>
 2d260b0: 390183f7     	strb	w23, [sp, #0x60]
 2d260b4: 90050ec2     	adrp	x2, 0xcefe000 <dyld_stub_binder+0xcefe000>
 2d260b8: 913b4842     	add	x2, x2, #0xed2
 2d260bc: 910103e4     	add	x4, sp, #0x40
 2d260c0: aa1603e0     	mov	x0, x22
 2d260c4: aa1303e1     	mov	x1, x19
 2d260c8: 528005c3     	mov	w3, #0x2e               ; =46
 2d260cc: 97e3dba8     	bl	0x261cf6c <_ChromeMain+0x2617cd0>
 2d260d0: 394183e8     	ldrb	w8, [sp, #0x60]
 2d260d4: f005dcd7     	adrp	x23, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 2d260d8: 9121e2f7     	add	x23, x23, #0x878
 2d260dc: 34000108     	cbz	w8, 0x2d260fc <_ChromeMain+0x2d20e60>
 2d260e0: 394163e8     	ldrb	w8, [sp, #0x58]
 2d260e4: 7103fd1f     	cmp	w8, #0xff
 2d260e8: 54000060     	b.eq	0x2d260f4 <_ChromeMain+0x2d20e58>
 2d260ec: 721e791f     	tst	w8, #0xfffffffd
 2d260f0: 54fffb01     	b.ne	0x2d26050 <_ChromeMain+0x2d20db4>
 2d260f4: 52801fe8     	mov	w8, #0xff               ; =255
 2d260f8: 390163e8     	strb	w8, [sp, #0x58]
 2d260fc: 3940e3e8     	ldrb	w8, [sp, #0x38]
 2d26100: 7103fd1f     	cmp	w8, #0xff
 2d26104: 54000060     	b.eq	0x2d26110 <_ChromeMain+0x2d20e74>
 2d26108: 721e791f     	tst	w8, #0xfffffffd
 2d2610c: 54000261     	b.ne	0x2d26158 <_ChromeMain+0x2d20ebc>
 2d26110: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 2d26114: f9001bff     	str	xzr, [sp, #0x30]
 2d26118: d0050901     	adrp	x1, 0xce48000 <dyld_stub_binder+0xce48000>
 2d2611c: 912db421     	add	x1, x1, #0xb6d
 2d26120: 910083e2     	add	x2, sp, #0x20
 2d26124: aa1603e0     	mov	x0, x22
 2d26128: 9406e21e     	bl	0x2ede9a0 <_ChromeMain+0x2ed9704>
 2d2612c: f94017e8     	ldr	x8, [sp, #0x28]
 2d26130: 8b080508     	add	x8, x8, x8, lsl #1
 2d26134: d37df118     	lsl	x24, x8, #3
 2d26138: b40006d8     	cbz	x24, 0x2d26210 <_ChromeMain+0x2d20f74>
 2d2613c: f94013f9     	ldr	x25, [sp, #0x20]
 2d26140: 39405e68     	ldrb	w8, [x19, #0x17]
 2d26144: 13001d1a     	sxtb	w26, w8
 2d26148: f9400669     	ldr	x9, [x19, #0x8]
 2d2614c: 7100035f     	cmp	w26, #0x0
 2d26150: 9a884137     	csel	x23, x9, x8, mi
 2d26154: 17ffffa6     	b	0x2d25fec <_ChromeMain+0x2d20d50>
 2d26158: 7100111f     	cmp	w8, #0x4
 2d2615c: 540000c0     	b.eq	0x2d26174 <_ChromeMain+0x2d20ed8>
 2d26160: f8685ae8     	ldr	x8, [x23, w8, uxtw #3]
 2d26164: d10147a0     	sub	x0, x29, #0x51
 2d26168: 910083e1     	add	x1, sp, #0x20
 2d2616c: d63f0100     	blr	x8
 2d26170: 17ffffe8     	b	0x2d26110 <_ChromeMain+0x2d20e74>
 2d26174: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 2d26178: 36fffcc8     	tbz	w8, #0x1f, 0x2d26110 <_ChromeMain+0x2d20e74>
 2d2617c: f94013e0     	ldr	x0, [sp, #0x20]
 2d26180: f9401be8     	ldr	x8, [sp, #0x30]
 2d26184: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2d26188: 974b8b4c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d2618c: 17ffffe1     	b	0x2d26110 <_ChromeMain+0x2d20e74>
 2d26190: f94002e0     	ldr	x0, [x23]
 2d26194: f9400ae8     	ldr	x8, [x23, #0x10]
 2d26198: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2d2619c: 974b8b47     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d261a0: 1400000c     	b	0x2d261d0 <_ChromeMain+0x2d20f34>
 2d261a4: f9400be8     	ldr	x8, [sp, #0x10]
 2d261a8: 8b080509     	add	x9, x8, x8, lsl #1
 2d261ac: d37df129     	lsl	x9, x9, #3
 2d261b0: b4000c09     	cbz	x9, 0x2d26330 <_ChromeMain+0x2d21094>
 2d261b4: 8b160129     	add	x9, x9, x22
 2d261b8: d1006137     	sub	x23, x9, #0x18
 2d261bc: d37df109     	lsl	x9, x8, #3
 2d261c0: cb081538     	sub	x24, x9, x8, lsl #5
 2d261c4: b4000bb7     	cbz	x23, 0x2d26338 <_ChromeMain+0x2d2109c>
 2d261c8: 39c05ee8     	ldrsb	w8, [x23, #0x17]
 2d261cc: 37fffe28     	tbnz	w8, #0x1f, 0x2d26190 <_ChromeMain+0x2d20ef4>
 2d261d0: d10062f7     	sub	x23, x23, #0x18
 2d261d4: b1006318     	adds	x24, x24, #0x18
 2d261d8: 54ffff61     	b.ne	0x2d261c4 <_ChromeMain+0x2d20f28>
 2d261dc: f94007e0     	ldr	x0, [sp, #0x8]
 2d261e0: cb0002c8     	sub	x8, x22, x0
 2d261e4: 9343fd08     	asr	x8, x8, #3
 2d261e8: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 2d261ec: f2955569     	movk	x9, #0xaaab
 2d261f0: 9b097d08     	mul	x8, x8, x9
 2d261f4: f9000be8     	str	x8, [sp, #0x10]
 2d261f8: f9400fe8     	ldr	x8, [sp, #0x18]
 2d261fc: 8b080508     	add	x8, x8, x8, lsl #1
 2d26200: d37df101     	lsl	x1, x8, #3
 2d26204: 974b8b2d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d26208: 350002b5     	cbnz	w21, 0x2d2625c <_ChromeMain+0x2d20fc0>
 2d2620c: 14000018     	b	0x2d2626c <_ChromeMain+0x2d20fd0>
 2d26210: 910083e0     	add	x0, sp, #0x20
 2d26214: aa1303e1     	mov	x1, x19
 2d26218: 97693e97     	bl	0x775c74 <_ChromeMain+0x7709d8>
 2d2621c: f94013e8     	ldr	x8, [sp, #0x20]
 2d26220: f90007e8     	str	x8, [sp, #0x8]
 2d26224: 3cc283e0     	ldur	q0, [sp, #0x28]
 2d26228: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 2d2622c: f9001bff     	str	xzr, [sp, #0x30]
 2d26230: 3c8103e0     	stur	q0, [sp, #0x10]
 2d26234: 910023e0     	add	x0, sp, #0x8
 2d26238: 940000da     	bl	0x2d265a0 <_ChromeMain+0x2d21304>
 2d2623c: d0050901     	adrp	x1, 0xce48000 <dyld_stub_binder+0xce48000>
 2d26240: 912db421     	add	x1, x1, #0xb6d
 2d26244: 910023e2     	add	x2, sp, #0x8
 2d26248: aa1603e0     	mov	x0, x22
 2d2624c: 94fd7d58     	bl	0x6c857ac <_ChromeMain+0x6c80510>
 2d26250: f94007f6     	ldr	x22, [sp, #0x8]
 2d26254: b5fffa96     	cbnz	x22, 0x2d261a4 <_ChromeMain+0x2d20f08>
 2d26258: 340000b5     	cbz	w21, 0x2d2626c <_ChromeMain+0x2d20fd0>
 2d2625c: aa1403e0     	mov	x0, x20
 2d26260: aa1303e1     	mov	x1, x19
 2d26264: 52800022     	mov	w2, #0x1                ; =1
 2d26268: 95240372     	bl	0x7627030 <_ChromeMain+0x7621d94>
 2d2626c: f94013f3     	ldr	x19, [sp, #0x20]
 2d26270: b4ffdb93     	cbz	x19, 0x2d25de0 <_ChromeMain+0x2d20b44>
 2d26274: f94017e8     	ldr	x8, [sp, #0x28]
 2d26278: 8b080509     	add	x9, x8, x8, lsl #1
 2d2627c: d37df129     	lsl	x9, x9, #3
 2d26280: b4000549     	cbz	x9, 0x2d26328 <_ChromeMain+0x2d2108c>
 2d26284: 8b130129     	add	x9, x9, x19
 2d26288: d1006134     	sub	x20, x9, #0x18
 2d2628c: d37df109     	lsl	x9, x8, #3
 2d26290: cb081535     	sub	x21, x9, x8, lsl #5
 2d26294: b4000534     	cbz	x20, 0x2d26338 <_ChromeMain+0x2d2109c>
 2d26298: 39c05e88     	ldrsb	w8, [x20, #0x17]
 2d2629c: 37f80208     	tbnz	w8, #0x1f, 0x2d262dc <_ChromeMain+0x2d21040>
 2d262a0: d1006294     	sub	x20, x20, #0x18
 2d262a4: b10062b5     	adds	x21, x21, #0x18
 2d262a8: 54ffff61     	b.ne	0x2d26294 <_ChromeMain+0x2d20ff8>
 2d262ac: f94013e0     	ldr	x0, [sp, #0x20]
 2d262b0: cb000268     	sub	x8, x19, x0
 2d262b4: 9343fd08     	asr	x8, x8, #3
 2d262b8: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 2d262bc: f2955569     	movk	x9, #0xaaab
 2d262c0: 9b097d08     	mul	x8, x8, x9
 2d262c4: f90017e8     	str	x8, [sp, #0x28]
 2d262c8: f9401be8     	ldr	x8, [sp, #0x30]
 2d262cc: 8b080508     	add	x8, x8, x8, lsl #1
 2d262d0: d37df101     	lsl	x1, x8, #3
 2d262d4: 974b8af9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d262d8: 17fffec2     	b	0x2d25de0 <_ChromeMain+0x2d20b44>
 2d262dc: f9400280     	ldr	x0, [x20]
 2d262e0: f9400a88     	ldr	x8, [x20, #0x10]
 2d262e4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2d262e8: 974b8af4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d262ec: 17ffffed     	b	0x2d262a0 <_ChromeMain+0x2d21004>
 2d262f0: f9400320     	ldr	x0, [x25]
 2d262f4: f9400b28     	ldr	x8, [x25, #0x10]
 2d262f8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2d262fc: 974b8aef     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d26300: 17ffff28     	b	0x2d25fa0 <_ChromeMain+0x2d20d04>
 2d26304: f94023e0     	ldr	x0, [sp, #0x40]
 2d26308: f9402be8     	ldr	x8, [sp, #0x50]
 2d2630c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2d26310: 974b8aea     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d26314: 17ffff78     	b	0x2d260f4 <_ChromeMain+0x2d20e58>
 2d26318: aa1803e0     	mov	x0, x24
 2d2631c: 17ffff0b     	b	0x2d25f48 <_ChromeMain+0x2d20cac>
 2d26320: aa1803e0     	mov	x0, x24
 2d26324: 17ffff23     	b	0x2d25fb0 <_ChromeMain+0x2d20d14>
 2d26328: aa1303e0     	mov	x0, x19
 2d2632c: 17ffffe1     	b	0x2d262b0 <_ChromeMain+0x2d21014>
 2d26330: aa1603e0     	mov	x0, x22
 2d26334: 17ffffab     	b	0x2d261e0 <_ChromeMain+0x2d20f44>
 2d26338: d4200020     	brk	#0x1
