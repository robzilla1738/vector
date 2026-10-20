
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4680e80: d10243ff     	sub	sp, sp, #0x90
 4680e84: a90467fa     	stp	x26, x25, [sp, #0x40]
 4680e88: a9055ff8     	stp	x24, x23, [sp, #0x50]
 4680e8c: a90657f6     	stp	x22, x21, [sp, #0x60]
 4680e90: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4680e94: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4680e98: 910203fd     	add	x29, sp, #0x80
 4680e9c: a942d013     	ldp	x19, x20, [x0, #0x28]
 4680ea0: f900141f     	str	xzr, [x0, #0x28]
 4680ea4: 3cc38000     	ldur	q0, [x0, #0x38]
 4680ea8: 3d8003e0     	str	q0, [sp]
 4680eac: f9402408     	ldr	x8, [x0, #0x48]
 4680eb0: f9000be8     	str	x8, [sp, #0x10]
 4680eb4: a903fc1f     	stp	xzr, xzr, [x0, #0x38]
 4680eb8: f900241f     	str	xzr, [x0, #0x48]
 4680ebc: b4000153     	cbz	x19, 0x4680ee4 <_ChromeMain+0x467bc48>
 4680ec0: b9405017     	ldr	w23, [x0, #0x50]
 4680ec4: 19404268     	ldapurb	w8, [x19, #0x4]
 4680ec8: 7100011f     	cmp	w8, #0x0
 4680ecc: fa400a84     	ccmp	x20, #0x0, #0x4, eq
 4680ed0: 540002e1     	b.ne	0x4680f2c <_ChromeMain+0x467bc90>
 4680ed4: 12800008     	mov	w8, #-0x1               ; =-1
 4680ed8: b8e80268     	ldaddal	w8, w8, [x19]
 4680edc: 7100051f     	cmp	w8, #0x1
 4680ee0: 54000140     	b.eq	0x4680f08 <_ChromeMain+0x467bc6c>
 4680ee4: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4680ee8: 37f80188     	tbnz	w8, #0x1f, 0x4680f18 <_ChromeMain+0x467bc7c>
 4680eec: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 4680ef0: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 4680ef4: a94657f6     	ldp	x22, x21, [sp, #0x60]
 4680ef8: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 4680efc: a94467fa     	ldp	x26, x25, [sp, #0x40]
 4680f00: 910243ff     	add	sp, sp, #0x90
 4680f04: d65f03c0     	ret
 4680f08: aa1303e0     	mov	x0, x19
 4680f0c: 52800101     	mov	w1, #0x8                ; =8
 4680f10: 96e61fea     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4680f14: 17fffff4     	b	0x4680ee4 <_ChromeMain+0x467bc48>
 4680f18: f94003e0     	ldr	x0, [sp]
 4680f1c: f9400be8     	ldr	x8, [sp, #0x10]
 4680f20: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4680f24: 96e61fe5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4680f28: 17fffff1     	b	0x4680eec <_ChromeMain+0x467bc50>
 4680f2c: 19404268     	ldapurb	w8, [x19, #0x4]
 4680f30: 350028c8     	cbnz	w8, 0x4681448 <_ChromeMain+0x467c1ac>
 4680f34: 912b8280     	add	x0, x20, #0xae0
 4680f38: 910003e1     	mov	x1, sp
 4680f3c: 94000a11     	bl	0x4683780 <_ChromeMain+0x467e4e4>
 4680f40: aa0003e2     	mov	x2, x0
 4680f44: aa0103e3     	mov	x3, x1
 4680f48: 912b8280     	add	x0, x20, #0xae0
 4680f4c: aa0203e1     	mov	x1, x2
 4680f50: aa0303e2     	mov	x2, x3
 4680f54: 94d59e60     	bl	0x7be88d4 <_ChromeMain+0x7be3638>
 4680f58: 19404268     	ldapurb	w8, [x19, #0x4]
 4680f5c: 350027c8     	cbnz	w8, 0x4681454 <_ChromeMain+0x467c1b8>
 4680f60: d0054328     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4680f64: f9467d00     	ldr	x0, [x8, #0xcf8]
 4680f68: b4fffb60     	cbz	x0, 0x4680ed4 <_ChromeMain+0x467bc38>
 4680f6c: 974e7b03     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4680f70: b4fffb20     	cbz	x0, 0x4680ed4 <_ChromeMain+0x467bc38>
 4680f74: 974e7b27     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4680f78: 97e9f1f5     	bl	0x40fd74c <_ChromeMain+0x40f84b0>
 4680f7c: f100081f     	cmp	x0, #0x2
 4680f80: 54fffaa3     	b.lo	0x4680ed4 <_ChromeMain+0x467bc38>
 4680f84: f9422e88     	ldr	x8, [x20, #0x458]
 4680f88: b4fffa68     	cbz	x8, 0x4680ed4 <_ChromeMain+0x467bc38>
 4680f8c: f9429d08     	ldr	x8, [x8, #0x538]
 4680f90: b4fffa28     	cbz	x8, 0x4680ed4 <_ChromeMain+0x467bc38>
 4680f94: f9403500     	ldr	x0, [x8, #0x68]
 4680f98: b4fff9e0     	cbz	x0, 0x4680ed4 <_ChromeMain+0x467bc38>
 4680f9c: 14000007     	b	0x4680fb8 <_ChromeMain+0x467bd1c>
 4680fa0: f94017e0     	ldr	x0, [sp, #0x28]
 4680fa4: f9401fe8     	ldr	x8, [sp, #0x38]
 4680fa8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4680fac: 96e61fc3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4680fb0: 34fff935     	cbz	w21, 0x4680ed4 <_ChromeMain+0x467bc38>
 4680fb4: 1400000f     	b	0x4680ff0 <_ChromeMain+0x467bd54>
 4680fb8: f9400008     	ldr	x8, [x0]
 4680fbc: f940a508     	ldr	x8, [x8, #0x148]
 4680fc0: d63f0100     	blr	x8
 4680fc4: f9400008     	ldr	x8, [x0]
 4680fc8: f9401909     	ldr	x9, [x8, #0x30]
 4680fcc: 9100a3e8     	add	x8, sp, #0x28
 4680fd0: d63f0120     	blr	x9
 4680fd4: 9100a3e0     	add	x0, sp, #0x28
 4680fd8: 910003e1     	mov	x1, sp
 4680fdc: 97292c4a     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 4680fe0: aa0003f5     	mov	x21, x0
 4680fe4: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 4680fe8: 37fffdc8     	tbnz	w8, #0x1f, 0x4680fa0 <_ChromeMain+0x467bd04>
 4680fec: 34fff755     	cbz	w21, 0x4680ed4 <_ChromeMain+0x467bc38>
 4680ff0: 39686288     	ldrb	w8, [x20, #0xa18]
 4680ff4: 37000168     	tbnz	w8, #0x0, 0x4681020 <_ChromeMain+0x467bd84>
 4680ff8: 39686688     	ldrb	w8, [x20, #0xa19]
 4680ffc: 37000128     	tbnz	w8, #0x0, 0x4681020 <_ChromeMain+0x467bd84>
 4681000: 3975a288     	ldrb	w8, [x20, #0xd68]
 4681004: 370000e8     	tbnz	w8, #0x0, 0x4681020 <_ChromeMain+0x467bd84>
 4681008: bd4a1e80     	ldr	s0, [x20, #0xa1c]
 468100c: 1e20c000     	fabs	s0, s0
 4681010: f004c668     	adrp	x8, 0xdf50000 <dyld_stub_binder+0xdf50000>
 4681014: bd46ed01     	ldr	s1, [x8, #0x6ec]
 4681018: 1e212000     	fcmp	s0, s1
 468101c: 5400010d     	b.le	0x468103c <_ChromeMain+0x467bda0>
 4681020: 910003e1     	mov	x1, sp
 4681024: 110006e3     	add	w3, w23, #0x1
 4681028: aa1403e0     	mov	x0, x20
 468102c: 529a9802     	mov	w2, #0xd4c0             ; =54464
 4681030: 72a00022     	movk	w2, #0x1, lsl #16
 4681034: 97ff6013     	bl	0x4659080 <_ChromeMain+0x4653de4>
 4681038: 17ffffa7     	b	0x4680ed4 <_ChromeMain+0x467bc38>
 468103c: aa1403e0     	mov	x0, x20
 4681040: 9708927d     	bl	0x8a5a34 <_ChromeMain+0x8a0798>
 4681044: aa1403e0     	mov	x0, x20
 4681048: 97fefd6e     	bl	0x4640600 <_ChromeMain+0x463b364>
 468104c: aa0103f5     	mov	x21, x1
 4681050: 710002bf     	cmp	w21, #0x0
 4681054: d360fc38     	lsr	x24, x1, #32
 4681058: fa401b04     	ccmp	x24, #0x0, #0x4, ne
 468105c: 54fff3c0     	b.eq	0x4680ed4 <_ChromeMain+0x467bc38>
 4681060: aa0003f6     	mov	x22, x0
 4681064: f9442688     	ldr	x8, [x20, #0x848]
 4681068: 39424108     	ldrb	w8, [x8, #0x90]
 468106c: 340000a8     	cbz	w8, 0x4681080 <_ChromeMain+0x467bde4>
 4681070: 39682289     	ldrb	w9, [x20, #0xa08]
 4681074: 37000249     	tbnz	w9, #0x0, 0x46810bc <_ChromeMain+0x467be20>
 4681078: 39683289     	ldrb	w9, [x20, #0xa0c]
 468107c: 37000209     	tbnz	w9, #0x0, 0x46810bc <_ChromeMain+0x467be20>
 4681080: 3973828a     	ldrb	w10, [x20, #0xce0]
 4681084: 397de289     	ldrb	w9, [x20, #0xf78]
 4681088: 3700008a     	tbnz	w10, #0x0, 0x4681098 <_ChromeMain+0x467bdfc>
 468108c: 37000089     	tbnz	w9, #0x0, 0x468109c <_ChromeMain+0x467be00>
 4681090: 3707fc88     	tbnz	w8, #0x0, 0x4681020 <_ChromeMain+0x467bd84>
 4681094: 1400000a     	b	0x46810bc <_ChromeMain+0x467be20>
 4681098: 34000269     	cbz	w9, 0x46810e4 <_ChromeMain+0x467be48>
 468109c: b941c288     	ldr	w8, [x20, #0x1c0]
 46810a0: aa0803e9     	mov	x9, x8
 46810a4: 6b08013f     	cmp	w9, w8
 46810a8: 1a88b12a     	csel	w10, w9, w8, lt
 46810ac: 7100011f     	cmp	w8, #0x0
 46810b0: 1a89c148     	csel	w8, w10, w9, gt
 46810b4: 71025d1f     	cmp	w8, #0x97
 46810b8: 54fffb4b     	b.lt	0x4681020 <_ChromeMain+0x467bd84>
 46810bc: 34fffb35     	cbz	w21, 0x4681020 <_ChromeMain+0x467bd84>
 46810c0: f942d689     	ldr	x9, [x20, #0x5a8]
 46810c4: b4fffae9     	cbz	x9, 0x4681020 <_ChromeMain+0x467bd84>
 46810c8: 39472128     	ldrb	w8, [x9, #0x1c8]
 46810cc: 34fffaa8     	cbz	w8, 0x4681020 <_ChromeMain+0x467bd84>
 46810d0: b941c12d     	ldr	w13, [x9, #0x1c0]
 46810d4: 34fffa6d     	cbz	w13, 0x4681020 <_ChromeMain+0x467bd84>
 46810d8: b941c52b     	ldr	w11, [x9, #0x1c4]
 46810dc: 34fffa2b     	cbz	w11, 0x4681020 <_ChromeMain+0x467bd84>
 46810e0: 14000022     	b	0x4681168 <_ChromeMain+0x467becc>
 46810e4: 3974a288     	ldrb	w8, [x20, #0xd28]
 46810e8: 340000c8     	cbz	w8, 0x4681100 <_ChromeMain+0x467be64>
 46810ec: b94d2688     	ldr	w8, [x20, #0xd24]
 46810f0: 7100011f     	cmp	w8, #0x0
 46810f4: 1a9f17e8     	cset	w8, eq
 46810f8: fd46a280     	ldr	d0, [x20, #0xd40]
 46810fc: 14000005     	b	0x4681110 <_ChromeMain+0x467be74>
 4681100: fd46a280     	ldr	d0, [x20, #0xd40]
 4681104: 1e6e1001     	fmov	d1, #1.00000000
 4681108: 1e612000     	fcmp	d0, d1
 468110c: 1a9f17e8     	cset	w8, eq
 4681110: 90021c09     	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 4681114: 912db129     	add	x9, x9, #0xb6c
 4681118: f0ff79ca     	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 468111c: 9103514a     	add	x10, x10, #0xd4
 4681120: 7100011f     	cmp	w8, #0x0
 4681124: 9a891148     	csel	x8, x10, x9, ne
 4681128: b948ca89     	ldr	w9, [x20, #0x8c8]
 468112c: 1e620121     	scvtf	d1, w9
 4681130: 1e610800     	fmul	d0, d0, d1
 4681134: d63f0100     	blr	x8
 4681138: 1e780009     	fcvtzs	w9, d0
 468113c: b941c288     	ldr	w8, [x20, #0x1c0]
 4681140: 17ffffd9     	b	0x46810a4 <_ChromeMain+0x467be08>
 4681144: f0fdfd69     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 4681148: 9120c129     	add	x9, x9, #0x830
 468114c: eb09011f     	cmp	x8, x9
 4681150: 540008e0     	b.eq	0x468126c <_ChromeMain+0x467bfd0>
 4681154: aa1403e0     	mov	x0, x20
 4681158: d63f0100     	blr	x8
 468115c: aa0003fa     	mov	x26, x0
 4681160: b4ffebba     	cbz	x26, 0x4680ed4 <_ChromeMain+0x467bc38>
 4681164: 14000044     	b	0x4681274 <_ChromeMain+0x467bfd8>
 4681168: f942da88     	ldr	x8, [x20, #0x5b0]
 468116c: b4fff5a8     	cbz	x8, 0x4681020 <_ChromeMain+0x467bd84>
 4681170: 3947210a     	ldrb	w10, [x8, #0x1c8]
 4681174: 34fff56a     	cbz	w10, 0x4681020 <_ChromeMain+0x467bd84>
 4681178: b941c10c     	ldr	w12, [x8, #0x1c0]
 468117c: 34fff52c     	cbz	w12, 0x4681020 <_ChromeMain+0x467bd84>
 4681180: b941c50a     	ldr	w10, [x8, #0x1c4]
 4681184: 34fff4ea     	cbz	w10, 0x4681020 <_ChromeMain+0x467bd84>
 4681188: b941b92e     	ldr	w14, [x9, #0x1b8]
 468118c: 6b1601df     	cmp	w14, w22
 4681190: 54fff48b     	b.lt	0x4681020 <_ChromeMain+0x467bd84>
 4681194: 0b0d01cd     	add	w13, w14, w13
 4681198: 0b1502ce     	add	w14, w22, w21
 468119c: 6b0e01bf     	cmp	w13, w14
 46811a0: 54fff40c     	b.gt	0x4681020 <_ChromeMain+0x467bd84>
 46811a4: d360fecd     	lsr	x13, x22, #32
 46811a8: b941bd29     	ldr	w9, [x9, #0x1bc]
 46811ac: 6b0d013f     	cmp	w9, w13
 46811b0: 54fff38b     	b.lt	0x4681020 <_ChromeMain+0x467bd84>
 46811b4: 0b0b012b     	add	w11, w9, w11
 46811b8: 0b1801a9     	add	w9, w13, w24
 46811bc: 6b09017f     	cmp	w11, w9
 46811c0: 54fff30c     	b.gt	0x4681020 <_ChromeMain+0x467bd84>
 46811c4: b941b90b     	ldr	w11, [x8, #0x1b8]
 46811c8: 6b16017f     	cmp	w11, w22
 46811cc: 54fff2ab     	b.lt	0x4681020 <_ChromeMain+0x467bd84>
 46811d0: 0b0c016b     	add	w11, w11, w12
 46811d4: 6b0e017f     	cmp	w11, w14
 46811d8: 54fff24c     	b.gt	0x4681020 <_ChromeMain+0x467bd84>
 46811dc: b941bd08     	ldr	w8, [x8, #0x1bc]
 46811e0: 6b0d011f     	cmp	w8, w13
 46811e4: 54fff1eb     	b.lt	0x4681020 <_ChromeMain+0x467bd84>
 46811e8: 0b0a0108     	add	w8, w8, w10
 46811ec: 6b09011f     	cmp	w8, w9
 46811f0: 54fff18c     	b.gt	0x4681020 <_ChromeMain+0x467bd84>
 46811f4: f942e288     	ldr	x8, [x20, #0x5c0]
 46811f8: b40000e8     	cbz	x8, 0x4681214 <_ChromeMain+0x467bf78>
 46811fc: 39472109     	ldrb	w9, [x8, #0x1c8]
 4681200: 340000a9     	cbz	w9, 0x4681214 <_ChromeMain+0x467bf78>
 4681204: b941c109     	ldr	w9, [x8, #0x1c0]
 4681208: 34fff0c9     	cbz	w9, 0x4681020 <_ChromeMain+0x467bd84>
 468120c: b941c508     	ldr	w8, [x8, #0x1c4]
 4681210: 34fff088     	cbz	w8, 0x4681020 <_ChromeMain+0x467bd84>
 4681214: f9423e88     	ldr	x8, [x20, #0x478]
 4681218: b40000e8     	cbz	x8, 0x4681234 <_ChromeMain+0x467bf98>
 468121c: 39472109     	ldrb	w9, [x8, #0x1c8]
 4681220: 340000a9     	cbz	w9, 0x4681234 <_ChromeMain+0x467bf98>
 4681224: b941c109     	ldr	w9, [x8, #0x1c0]
 4681228: 34ffefc9     	cbz	w9, 0x4681020 <_ChromeMain+0x467bd84>
 468122c: b941c508     	ldr	w8, [x8, #0x1c4]
 4681230: 34ffef88     	cbz	w8, 0x4681020 <_ChromeMain+0x467bd84>
 4681234: f9433688     	ldr	x8, [x20, #0x668]
 4681238: b40000e8     	cbz	x8, 0x4681254 <_ChromeMain+0x467bfb8>
 468123c: 39472109     	ldrb	w9, [x8, #0x1c8]
 4681240: 340000a9     	cbz	w9, 0x4681254 <_ChromeMain+0x467bfb8>
 4681244: b941c109     	ldr	w9, [x8, #0x1c0]
 4681248: 34ffeec9     	cbz	w9, 0x4681020 <_ChromeMain+0x467bd84>
 468124c: b941c508     	ldr	w8, [x8, #0x1c4]
 4681250: 34ffee88     	cbz	w8, 0x4681020 <_ChromeMain+0x467bd84>
 4681254: f9400288     	ldr	x8, [x20]
 4681258: f9403108     	ldr	x8, [x8, #0x60]
 468125c: f0fdff49     	adrp	x9, 0x66c000 <_ChromeMain+0x666d64>
 4681260: 91394129     	add	x9, x9, #0xe50
 4681264: eb09011f     	cmp	x8, x9
 4681268: 54fff6e1     	b.ne	0x4681144 <_ChromeMain+0x467bea8>
 468126c: f940c29a     	ldr	x26, [x20, #0x180]
 4681270: b4ffe33a     	cbz	x26, 0x4680ed4 <_ChromeMain+0x467bc38>
 4681274: f9407348     	ldr	x8, [x26, #0xe0]
 4681278: b4000d48     	cbz	x8, 0x4681420 <_ChromeMain+0x467c184>
 468127c: 19404108     	ldapurb	w8, [x8, #0x4]
 4681280: 35000d08     	cbnz	w8, 0x4681420 <_ChromeMain+0x467c184>
 4681284: f9407748     	ldr	x8, [x26, #0xe8]
 4681288: b4000cc8     	cbz	x8, 0x4681420 <_ChromeMain+0x467c184>
 468128c: f9407348     	ldr	x8, [x26, #0xe0]
 4681290: b4000e88     	cbz	x8, 0x4681460 <_ChromeMain+0x467c1c4>
 4681294: 19404108     	ldapurb	w8, [x8, #0x4]
 4681298: 35000e48     	cbnz	w8, 0x4681460 <_ChromeMain+0x467c1c4>
 468129c: f9407740     	ldr	x0, [x26, #0xe8]
 46812a0: 9100a3e8     	add	x8, sp, #0x28
 46812a4: 9740d8ef     	bl	0x16b7660 <_ChromeMain+0x16b23c4>
 46812a8: f94017e0     	ldr	x0, [sp, #0x28]
 46812ac: 94ffab98     	bl	0x866c10c <_ChromeMain+0x8666e70>
 46812b0: aa0003f8     	mov	x24, x0
 46812b4: 94e6092a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 46812b8: f94017f9     	ldr	x25, [sp, #0x28]
 46812bc: f90017ff     	str	xzr, [sp, #0x28]
 46812c0: b40000d9     	cbz	x25, 0x46812d8 <_ChromeMain+0x467c03c>
 46812c4: aa1903e0     	mov	x0, x25
 46812c8: 94ffab94     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 46812cc: aa1903e0     	mov	x0, x25
 46812d0: 52800101     	mov	w1, #0x8                ; =8
 46812d4: 96e61ef9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46812d8: b4ffdff8     	cbz	x24, 0x4680ed4 <_ChromeMain+0x467bc38>
 46812dc: a902d7f6     	stp	x22, x21, [sp, #0x28]
 46812e0: aa1403f5     	mov	x21, x20
 46812e4: 9100a3e1     	add	x1, sp, #0x28
 46812e8: aa1503e0     	mov	x0, x21
 46812ec: 970878da     	bl	0x89f654 <_ChromeMain+0x89a3b8>
 46812f0: a90287e0     	stp	x0, x1, [sp, #0x28]
 46812f4: f940c6b5     	ldr	x21, [x21, #0x188]
 46812f8: b5ffff75     	cbnz	x21, 0x46812e4 <_ChromeMain+0x467c048>
 46812fc: a90287e0     	stp	x0, x1, [sp, #0x28]
 4681300: f940cb48     	ldr	x8, [x26, #0x190]
 4681304: b4000828     	cbz	x8, 0x4681408 <_ChromeMain+0x467c16c>
 4681308: f9000fff     	str	xzr, [sp, #0x18]
 468130c: f940e108     	ldr	x8, [x8, #0x1c0]
 4681310: f90013e8     	str	x8, [sp, #0x20]
 4681314: 9100a3e0     	add	x0, sp, #0x28
 4681318: 910063e1     	add	x1, sp, #0x18
 468131c: 97053ed9     	bl	0x7d0e80 <_ChromeMain+0x7cbbe4>
 4681320: 294623e1     	ldp	w1, w8, [sp, #0x30]
 4681324: 34ffdd81     	cbz	w1, 0x4680ed4 <_ChromeMain+0x467bc38>
 4681328: 34ffdd68     	cbz	w8, 0x4680ed4 <_ChromeMain+0x467bc38>
 468132c: f9407348     	ldr	x8, [x26, #0xe0]
 4681330: b4000828     	cbz	x8, 0x4681434 <_ChromeMain+0x467c198>
 4681334: 19404108     	ldapurb	w8, [x8, #0x4]
 4681338: 350007e8     	cbnz	w8, 0x4681434 <_ChromeMain+0x467c198>
 468133c: f9407748     	ldr	x8, [x26, #0xe8]
 4681340: b40007a8     	cbz	x8, 0x4681434 <_ChromeMain+0x467c198>
 4681344: f9407348     	ldr	x8, [x26, #0xe0]
 4681348: b4000928     	cbz	x8, 0x468146c <_ChromeMain+0x467c1d0>
 468134c: 19404108     	ldapurb	w8, [x8, #0x4]
 4681350: 350008e8     	cbnz	w8, 0x468146c <_ChromeMain+0x467c1d0>
 4681354: f9407740     	ldr	x0, [x26, #0xe8]
 4681358: 910063e8     	add	x8, sp, #0x18
 468135c: 9740d8c1     	bl	0x16b7660 <_ChromeMain+0x16b23c4>
 4681360: f94a0695     	ldr	x21, [x20, #0x1408]
 4681364: b40000d5     	cbz	x21, 0x468137c <_ChromeMain+0x467c0e0>
 4681368: 52800028     	mov	w8, #0x1                ; =1
 468136c: b82802a8     	ldadd	w8, w8, [x21]
 4681370: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4681374: 6b09011f     	cmp	w8, w9
 4681378: 54000800     	b.eq	0x4681478 <_ChromeMain+0x467c1dc>
 468137c: f94a0a96     	ldr	x22, [x20, #0x1410]
 4681380: 52800b00     	mov	w0, #0x58               ; =88
 4681384: 96e637f9     	bl	0xf368 <_ChromeMain+0xa0cc>
 4681388: aa0003f4     	mov	x20, x0
 468138c: 52800028     	mov	w8, #0x1                ; =1
 4681390: b9000008     	str	w8, [x0]
 4681394: 10000ae8     	adr	x8, 0x46814f0 <_ChromeMain+0x467c254>
 4681398: d503201f     	nop
 468139c: 10000749     	adr	x9, 0x4681484 <_ChromeMain+0x467c1e8>
 46813a0: d503201f     	nop
 46813a4: a900a408     	stp	x8, x9, [x0, #0x8]
 46813a8: 90fef6e8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 46813ac: 912c0108     	add	x8, x8, #0xb00
 46813b0: f9000c08     	str	x8, [x0, #0x18]
 46813b4: a902d815     	stp	x21, x22, [x0, #0x28]
 46813b8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 46813bc: 37f802a8     	tbnz	w8, #0x1f, 0x4681410 <_ChromeMain+0x467c174>
 46813c0: 3dc003e0     	ldr	q0, [sp]
 46813c4: 3c838280     	stur	q0, [x20, #0x38]
 46813c8: f9400be8     	ldr	x8, [sp, #0x10]
 46813cc: f8048288     	stur	x8, [x20, #0x48]
 46813d0: b9005297     	str	w23, [x20, #0x50]
 46813d4: 910063e0     	add	x0, sp, #0x18
 46813d8: 9100a3e1     	add	x1, sp, #0x28
 46813dc: aa1403e2     	mov	x2, x20
 46813e0: 956f2a18     	bl	0xa24bc40 <_ChromeMain+0xa2469a4>
 46813e4: f9400ff4     	ldr	x20, [sp, #0x18]
 46813e8: f9000fff     	str	xzr, [sp, #0x18]
 46813ec: b4ffd754     	cbz	x20, 0x4680ed4 <_ChromeMain+0x467bc38>
 46813f0: aa1403e0     	mov	x0, x20
 46813f4: 94ffab49     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 46813f8: aa1403e0     	mov	x0, x20
 46813fc: 52800101     	mov	w1, #0x8                ; =8
 4681400: 96e61eae     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4681404: 17fffeb4     	b	0x4680ed4 <_ChromeMain+0x467bc38>
 4681408: d360fc28     	lsr	x8, x1, #32
 468140c: 17ffffc6     	b	0x4681324 <_ChromeMain+0x467c088>
 4681410: a9400be1     	ldp	x1, x2, [sp]
 4681414: 9100e280     	add	x0, x20, #0x38
 4681418: 96e65b80     	bl	0x18218 <_ChromeMain+0x12f7c>
 468141c: 17ffffed     	b	0x46813d0 <_ChromeMain+0x467c134>
 4681420: 52800100     	mov	w0, #0x8                ; =8
 4681424: 96e637d1     	bl	0xf368 <_ChromeMain+0xa0cc>
 4681428: f900001f     	str	xzr, [x0]
 468142c: f90017e0     	str	x0, [sp, #0x28]
 4681430: 17ffff9f     	b	0x46812ac <_ChromeMain+0x467c010>
 4681434: 52800100     	mov	w0, #0x8                ; =8
 4681438: 96e637cc     	bl	0xf368 <_ChromeMain+0xa0cc>
 468143c: f900001f     	str	xzr, [x0]
 4681440: f9000fe0     	str	x0, [sp, #0x18]
 4681444: 17ffffc7     	b	0x4681360 <_ChromeMain+0x467c0c4>
 4681448: d4200000     	brk	#0
 468144c: d4400000     	hlt	#0
 4681450: d4200020     	brk	#0x1
 4681454: d4200000     	brk	#0
 4681458: d4400000     	hlt	#0
 468145c: d4200020     	brk	#0x1
 4681460: d4200000     	brk	#0
 4681464: d4400000     	hlt	#0
 4681468: d4200020     	brk	#0x1
 468146c: d4200000     	brk	#0
 4681470: d4400000     	hlt	#0
 4681474: d4200020     	brk	#0x1
 4681478: d4200000     	brk	#0
 468147c: d4400000     	hlt	#0
 4681480: d4200020     	brk	#0x1
