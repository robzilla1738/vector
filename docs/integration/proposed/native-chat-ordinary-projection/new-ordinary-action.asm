
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463acb8: 910643f7     	add	x23, sp, #0x190
 463acbc: a9197fff     	stp	xzr, xzr, [sp, #0x190]
 463acc0: b80172df     	stur	wzr, [x22, #0x17]
 463acc4: f900d3ff     	str	xzr, [sp, #0x1a0]
 463acc8: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 463accc: ad0d83e0     	stp	q0, q0, [sp, #0x1b0]
 463acd0: ad0e83e0     	stp	q0, q0, [sp, #0x1d0]
 463acd4: 7903e3ff     	strh	wzr, [sp, #0x1f0]
 463acd8: a91fffff     	stp	xzr, xzr, [sp, #0x1f8]
 463acdc: 52800028     	mov	w8, #0x1                ; =1
 463ace0: b9020be8     	str	w8, [sp, #0x208]
 463ace4: 9108e3f5     	add	x21, sp, #0x238
 463ace8: 910ac3e0     	add	x0, sp, #0x2b0
 463acec: 9108e3e1     	add	x1, sp, #0x238
 463acf0: 910643e2     	add	x2, sp, #0x190
 463acf4: 52800004     	mov	w4, #0x0                ; =0
 463acf8: 52800005     	mov	w5, #0x0                ; =0
 463acfc: 52800063     	mov	w3, #0x3                ; =3
 463ad00: 944decee     	bl	0x59b60b8 <_ChromeMain+0x59b0e1c>
 463ad04: 9100a280     	add	x0, x20, #0x28
 463ad08: 97cf3faa     	bl	0x3a0abb0 <_ChromeMain+0x3a05914>
 463ad0c: 910ac3e2     	add	x2, sp, #0x2b0
 463ad10: d2800001     	mov	x1, #0x0                ; =0
 463ad14: d2800003     	mov	x3, #0x0                ; =0
 463ad18: 97eca924     	bl	0x41651a8 <_ChromeMain+0x415ff0c>
 463ad1c: aa0003f4     	mov	x20, x0
 463ad20: 910ac3e0     	add	x0, sp, #0x2b0
 463ad24: 977755e2     	bl	0x24104ac <_ChromeMain+0x240b210>
 463ad28: 9101c2e0     	add	x0, x23, #0x70
 463ad2c: d2800001     	mov	x1, #0x0                ; =0
 463ad30: 96e7b3e2     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 463ad34: 910082e0     	add	x0, x23, #0x20
 463ad38: 96e7b3d0     	bl	0x27c78 <_ChromeMain+0x229dc>
 463ad3c: 39c69fe8     	ldrsb	w8, [sp, #0x1a7]
 463ad40: 36f800a8     	tbz	w8, #0x1f, 0x463ad54 <_ChromeMain+0x4635ab8>
 463ad44: f940cbe0     	ldr	x0, [sp, #0x190]
 463ad48: f940d3e8     	ldr	x8, [sp, #0x1a0]
 463ad4c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463ad50: 96e7385a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463ad54: 9101c2a0     	add	x0, x21, #0x70
 463ad58: d2800001     	mov	x1, #0x0                ; =0
 463ad5c: 96e7b3d7     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 463ad60: 910082a0     	add	x0, x21, #0x20
 463ad64: 96e7b3c5     	bl	0x27c78 <_ChromeMain+0x229dc>
 463ad68: 39c93fe8     	ldrsb	w8, [sp, #0x24f]
 463ad6c: 36f800a8     	tbz	w8, #0x1f, 0x463ad80 <_ChromeMain+0x4635ae4>
 463ad70: f9411fe0     	ldr	x0, [sp, #0x238]
 463ad74: f94127e8     	ldr	x8, [sp, #0x248]
 463ad78: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463ad7c: 96e7384f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463ad80: b4ffa614     	cbz	x20, 0x463a240 <_ChromeMain+0x4634fa4>
 463ad84: f9423660     	ldr	x0, [x19, #0x468]
 463ad88: b4ffa5c0     	cbz	x0, 0x463a240 <_ChromeMain+0x4634fa4>
 463ad8c: aa1403e1     	mov	x1, x20
 463ad90: 96e7b2dc     	bl	0x27900 <_ChromeMain+0x22664>
 463ad94: 3100041f     	cmn	w0, #0x1
 463ad98: 54ffa540     	b.eq	0x463a240 <_ChromeMain+0x4634fa4>
 463ad9c: f9423668     	ldr	x8, [x19, #0x468]
 463ada0: f9400108     	ldr	x8, [x8]
 463ada4: 93407c01     	sxtw	x1, w0
 463ada8: aa0803e0     	mov	x0, x8
 463adac: 97288d53     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 463adb0: b4ffa7e0     	cbz	x0, 0x463a2ac <_ChromeMain+0x4635010>
 463adb4: b9401008     	ldr	w8, [x0, #0x10]
 463adb8: b902b3e8     	str	w8, [sp, #0x2b0]
 463adbc: 52821208     	mov	w8, #0x1090             ; =4240
 463adc0: 8b080260     	add	x0, x19, x8
 463adc4: 910ac3e1     	add	x1, sp, #0x2b0
 463adc8: 910ac3e2     	add	x2, sp, #0x2b0
 463adcc: 94992fd5     	bl	0x6c86d20 <_ChromeMain+0x6c81a84>
 463add0: f947e668     	ldr	x8, [x19, #0xfc8]
 463add4: f947ea69     	ldr	x9, [x19, #0xfd0]
 463add8: d37be92a     	lsl	x10, x9, #5
 463addc: b4000a8a     	cbz	x10, 0x463af2c <_ChromeMain+0x4635c90>
 463ade0: 9345fd4b     	asr	x11, x10, #5
 463ade4: b942b3ea     	ldr	w10, [sp, #0x2b0]
 463ade8: aa0803e1     	mov	x1, x8
 463adec: d341fd6c     	lsr	x12, x11, #1
 463adf0: 8b0c142d     	add	x13, x1, x12, lsl #5
 463adf4: b84205ae     	ldr	w14, [x13], #0x20
 463adf8: aa6b07ef     	mvn	x15, x11, lsr #1
 463adfc: 8b0f016b     	add	x11, x11, x15
 463ae00: 6b0a01df     	cmp	w14, w10
 463ae04: 9a8cb16b     	csel	x11, x11, x12, lt
 463ae08: 9a81b1a1     	csel	x1, x13, x1, lt
 463ae0c: b5ffff0b     	cbnz	x11, 0x463adec <_ChromeMain+0x4635b50>
 463ae10: 8b091508     	add	x8, x8, x9, lsl #5
 463ae14: aa0103e2     	mov	x2, x1
 463ae18: eb08003f     	cmp	x1, x8
 463ae1c: 540000e0     	b.eq	0x463ae38 <_ChromeMain+0x4635b9c>
 463ae20: b942b3e8     	ldr	w8, [sp, #0x2b0]
 463ae24: b9400029     	ldr	w9, [x1]
 463ae28: 6b09011f     	cmp	w8, w9
 463ae2c: 52800408     	mov	w8, #0x20               ; =32
 463ae30: 9a88b3e8     	csel	x8, xzr, x8, lt
 463ae34: 8b080022     	add	x2, x1, x8
 463ae38: 913f2260     	add	x0, x19, #0xfc8
 463ae3c: 94011c86     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 463ae40: f9485668     	ldr	x8, [x19, #0x10a8]
 463ae44: f9485a6a     	ldr	x10, [x19, #0x10b0]
 463ae48: d37ced4b     	lsl	x11, x10, #4
 463ae4c: aa0803e9     	mov	x9, x8
 463ae50: b40001ab     	cbz	x11, 0x463ae84 <_ChromeMain+0x4635be8>
 463ae54: 9344fd6d     	asr	x13, x11, #4
 463ae58: b942b3ec     	ldr	w12, [sp, #0x2b0]
 463ae5c: aa0803e9     	mov	x9, x8
 463ae60: d341fdae     	lsr	x14, x13, #1
 463ae64: 8b0e112f     	add	x15, x9, x14, lsl #4
 463ae68: b84105f0     	ldr	w16, [x15], #0x10
 463ae6c: aa6d07f1     	mvn	x17, x13, lsr #1
 463ae70: 8b1101ad     	add	x13, x13, x17
 463ae74: 6b0c021f     	cmp	w16, w12
 463ae78: 9a8eb1ad     	csel	x13, x13, x14, lt
 463ae7c: 9a89b1e9     	csel	x9, x15, x9, lt
 463ae80: b5ffff0d     	cbnz	x13, 0x463ae60 <_ChromeMain+0x4635bc4>
 463ae84: 8b0a110c     	add	x12, x8, x10, lsl #4
 463ae88: eb0c013f     	cmp	x9, x12
 463ae8c: 540004c0     	b.eq	0x463af24 <_ChromeMain+0x4635c88>
 463ae90: b942b3ec     	ldr	w12, [sp, #0x2b0]
 463ae94: b940012d     	ldr	w13, [x9]
 463ae98: 6b0d019f     	cmp	w12, w13
 463ae9c: 9100412c     	add	x12, x9, #0x10
 463aea0: 9a8cb12e     	csel	x14, x9, x12, lt
 463aea4: eb0e013f     	cmp	x9, x14
 463aea8: 54ffad68     	b.hi	0x463a454 <_ChromeMain+0x46351b8>
 463aeac: 540004e0     	b.eq	0x463af48 <_ChromeMain+0x4635cac>
 463aeb0: cb0801cc     	sub	x12, x14, x8
 463aeb4: eb0b019f     	cmp	x12, x11
 463aeb8: 540002a0     	b.eq	0x463af0c <_ChromeMain+0x4635c70>
 463aebc: cb0803ec     	neg	x12, x8
 463aec0: 8b0e010d     	add	x13, x8, x14
 463aec4: 8b09010a     	add	x10, x8, x9
 463aec8: 8b0b012b     	add	x11, x9, x11
 463aecc: cb0e016b     	sub	x11, x11, x14
 463aed0: cb090169     	sub	x9, x11, x9
 463aed4: 8b0c01ab     	add	x11, x13, x12
 463aed8: 8b0c014e     	add	x14, x10, x12
 463aedc: b940016f     	ldr	w15, [x11]
 463aee0: b90001cf     	str	w15, [x14]
 463aee4: f940056b     	ldr	x11, [x11, #0x8]
 463aee8: f90005cb     	str	x11, [x14, #0x8]
 463aeec: 910041ad     	add	x13, x13, #0x10
 463aef0: 9100414a     	add	x10, x10, #0x10
 463aef4: d1004129     	sub	x9, x9, #0x10
 463aef8: eb09019f     	cmp	x12, x9
 463aefc: 54fffec1     	b.ne	0x463aed4 <_ChromeMain+0x4635c38>
 463af00: cb080149     	sub	x9, x10, x8
 463af04: f9485668     	ldr	x8, [x19, #0x10a8]
 463af08: f9485a6a     	ldr	x10, [x19, #0x10b0]
 463af0c: 8b0a110a     	add	x10, x8, x10, lsl #4
 463af10: eb09015f     	cmp	x10, x9
 463af14: 54000140     	b.eq	0x463af3c <_ChromeMain+0x4635ca0>
 463af18: f100414a     	subs	x10, x10, #0x10
 463af1c: 54ffa9c0     	b.eq	0x463a454 <_ChromeMain+0x46351b8>
 463af20: 17fffffc     	b	0x463af10 <_ChromeMain+0x4635c74>
 463af24: aa0903ee     	mov	x14, x9
 463af28: 17ffffdf     	b	0x463aea4 <_ChromeMain+0x4635c08>
 463af2c: aa0803e1     	mov	x1, x8
 463af30: 17ffffb8     	b	0x463ae10 <_ChromeMain+0x4635b74>
 463af34: aa0803e1     	mov	x1, x8
 463af38: 14000014     	b	0x463af88 <_ChromeMain+0x4635cec>
 463af3c: cb080128     	sub	x8, x9, x8
 463af40: 9344fd08     	asr	x8, x8, #4
 463af44: f9085a68     	str	x8, [x19, #0x10b0]
 463af48: f9480268     	ldr	x8, [x19, #0x1000]
