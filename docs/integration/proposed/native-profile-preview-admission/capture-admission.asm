
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
