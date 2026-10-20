
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4631680: d10683ff     	sub	sp, sp, #0x1a0
 4631684: a9146ffc     	stp	x28, x27, [sp, #0x140]
 4631688: a91567fa     	stp	x26, x25, [sp, #0x150]
 463168c: a9165ff8     	stp	x24, x23, [sp, #0x160]
 4631690: a91757f6     	stp	x22, x21, [sp, #0x170]
 4631694: a9184ff4     	stp	x20, x19, [sp, #0x180]
 4631698: a9197bfd     	stp	x29, x30, [sp, #0x190]
 463169c: 910643fd     	add	x29, sp, #0x190
 46316a0: f942f008     	ldr	x8, [x0, #0x5e0]
 46316a4: b4000108     	cbz	x8, 0x46316c4 <_ChromeMain+0x462c428>
 46316a8: aa0003f3     	mov	x19, x0
 46316ac: 395f0008     	ldrb	w8, [x0, #0x7c0]
 46316b0: 37000068     	tbnz	w8, #0x0, 0x46316bc <_ChromeMain+0x462c420>
 46316b4: f943fe68     	ldr	x8, [x19, #0x7f8]
 46316b8: b4000468     	cbz	x8, 0x4631744 <_ChromeMain+0x462c4a8>
 46316bc: 52800028     	mov	w8, #0x1                ; =1
 46316c0: 39202668     	strb	w8, [x19, #0x809]
 46316c4: a9597bfd     	ldp	x29, x30, [sp, #0x190]
 46316c8: a9584ff4     	ldp	x20, x19, [sp, #0x180]
 46316cc: a95757f6     	ldp	x22, x21, [sp, #0x170]
 46316d0: a9565ff8     	ldp	x24, x23, [sp, #0x160]
 46316d4: a95567fa     	ldp	x26, x25, [sp, #0x150]
 46316d8: a9546ffc     	ldp	x28, x27, [sp, #0x140]
 46316dc: 910683ff     	add	sp, sp, #0x1a0
 46316e0: d65f03c0     	ret
 46316e4: 3902c3ff     	strb	wzr, [sp, #0xb0]
 46316e8: 390323ff     	strb	wzr, [sp, #0xc8]
 46316ec: f942f260     	ldr	x0, [x19, #0x5e0]
 46316f0: b4000140     	cbz	x0, 0x4631718 <_ChromeMain+0x462c47c>
 46316f4: 395e9268     	ldrb	w8, [x19, #0x7a4]
 46316f8: 34000088     	cbz	w8, 0x4631708 <_ChromeMain+0x462c46c>
 46316fc: 395e8268     	ldrb	w8, [x19, #0x7a0]
 4631700: 34000048     	cbz	w8, 0x4631708 <_ChromeMain+0x462c46c>
 4631704: 395e7268     	ldrb	w8, [x19, #0x79c]
 4631708: f9400009     	ldr	x9, [x0]
 463170c: f9405129     	ldr	x9, [x9, #0xa0]
 4631710: 12000101     	and	w1, w8, #0x1
 4631714: d63f0120     	blr	x9
 4631718: 394323e8     	ldrb	w8, [sp, #0xc8]
 463171c: 34fffd48     	cbz	w8, 0x46316c4 <_ChromeMain+0x462c428>
 4631720: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 4631724: 36fffd08     	tbz	w8, #0x1f, 0x46316c4 <_ChromeMain+0x462c428>
 4631728: f9405be0     	ldr	x0, [sp, #0xb0]
 463172c: f94063e8     	ldr	x8, [sp, #0xc0]
 4631730: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4631734: 96e75de1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4631738: 17ffffe3     	b	0x46316c4 <_ChromeMain+0x462c428>
 463173c: d280001a     	mov	x26, #0x0               ; =0
 4631740: 14000007     	b	0x463175c <_ChromeMain+0x462c4c0>
 4631744: 9102c3f4     	add	x20, sp, #0xb0
 4631748: b00545a8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 463174c: f9467d00     	ldr	x0, [x8, #0xcf8]
 4631750: b4ffff60     	cbz	x0, 0x463173c <_ChromeMain+0x462c4a0>
 4631754: 974fb909     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4631758: aa0003fa     	mov	x26, x0
 463175c: 6f00e400     	movi.2d	v0, #0000000000000000
 4631760: ad000280     	stp	q0, q0, [x20]
 4631764: f9422e68     	ldr	x8, [x19, #0x458]
 4631768: b4fffbe8     	cbz	x8, 0x46316e4 <_ChromeMain+0x462c448>
 463176c: f9429d08     	ldr	x8, [x8, #0x538]
 4631770: b4fffba8     	cbz	x8, 0x46316e4 <_ChromeMain+0x462c448>
 4631774: f9403500     	ldr	x0, [x8, #0x68]
 4631778: f9400008     	ldr	x8, [x0]
 463177c: f940a508     	ldr	x8, [x8, #0x148]
 4631780: d63f0100     	blr	x8
 4631784: b4fffb00     	cbz	x0, 0x46316e4 <_ChromeMain+0x462c448>
 4631788: f9400008     	ldr	x8, [x0]
 463178c: f9401909     	ldr	x9, [x8, #0x30]
 4631790: d10203a8     	sub	x8, x29, #0x80
 4631794: d63f0120     	blr	x9
 4631798: 3dc01a80     	ldr	q0, [x20, #0x60]
 463179c: 3d800280     	str	q0, [x20]
 46317a0: f85903a8     	ldur	x8, [x29, #-0x70]
 46317a4: f90063e8     	str	x8, [sp, #0xc0]
 46317a8: 52800028     	mov	w8, #0x1                ; =1
 46317ac: 390323e8     	strb	w8, [sp, #0xc8]
 46317b0: b4fff9fa     	cbz	x26, 0x46316ec <_ChromeMain+0x462c450>
 46317b4: aa1a03e0     	mov	x0, x26
 46317b8: 974fb916     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 46317bc: aa0003fc     	mov	x28, x0
 46317c0: aa1303e0     	mov	x0, x19
 46317c4: 94008045     	bl	0x46518d8 <_ChromeMain+0x464c63c>
 46317c8: f9400408     	ldr	x8, [x0, #0x8]
 46317cc: f100051f     	cmp	x8, #0x1
 46317d0: 54fff8e9     	b.ls	0x46316ec <_ChromeMain+0x462c450>
 46317d4: f90013e0     	str	x0, [sp, #0x20]
 46317d8: 911ca277     	add	x23, x19, #0x728
 46317dc: f9439a69     	ldr	x9, [x19, #0x730]
 46317e0: b0052c1b     	adrp	x27, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46317e4: eb08013f     	cmp	x9, x8
 46317e8: f9000bfa     	str	x26, [sp, #0x10]
 46317ec: 54000281     	b.ne	0x463183c <_ChromeMain+0x462c5a0>
 46317f0: 8b080509     	add	x9, x8, x8, lsl #1
 46317f4: d37df138     	lsl	x24, x9, #3
 46317f8: b40001d8     	cbz	x24, 0x4631830 <_ChromeMain+0x462c594>
 46317fc: f94002f5     	ldr	x21, [x23]
 4631800: f94013e8     	ldr	x8, [sp, #0x20]
 4631804: f9400116     	ldr	x22, [x8]
 4631808: aa1503e0     	mov	x0, x21
 463180c: aa1603e1     	mov	x1, x22
 4631810: 972a6a3d     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 4631814: 34000140     	cbz	w0, 0x463183c <_ChromeMain+0x462c5a0>
 4631818: 910062b5     	add	x21, x21, #0x18
 463181c: 910062d6     	add	x22, x22, #0x18
 4631820: f1006318     	subs	x24, x24, #0x18
 4631824: 54ffff21     	b.ne	0x4631808 <_ChromeMain+0x462c56c>
 4631828: f94013e8     	ldr	x8, [sp, #0x20]
 463182c: f9400508     	ldr	x8, [x8, #0x8]
 4631830: f9438e69     	ldr	x9, [x19, #0x718]
 4631834: eb08013f     	cmp	x9, x8
 4631838: 540001a0     	b.eq	0x463186c <_ChromeMain+0x462c5d0>
 463183c: aa1303e0     	mov	x0, x19
 4631840: 940080f2     	bl	0x4651c08 <_ChromeMain+0x464c96c>
 4631844: f942f260     	ldr	x0, [x19, #0x5e0]
 4631848: 97607f34     	bl	0x1e51518 <_ChromeMain+0x1e4c27c>
 463184c: f9438a75     	ldr	x21, [x19, #0x710]
 4631850: f9438e68     	ldr	x8, [x19, #0x718]
 4631854: d37df109     	lsl	x9, x8, #3
 4631858: b40002a9     	cbz	x9, 0x46318ac <_ChromeMain+0x462c610>
 463185c: 8b150129     	add	x9, x9, x21
 4631860: d1002138     	sub	x24, x9, #0x8
 4631864: cb080ff6     	neg	x22, x8, lsl #3
 4631868: 14000009     	b	0x463188c <_ChromeMain+0x462c5f0>
 463186c: b9001fff     	str	wzr, [sp, #0x1c]
 4631870: f94013f6     	ldr	x22, [sp, #0x20]
 4631874: 14000024     	b	0x4631904 <_ChromeMain+0x462c668>
 4631878: 96e7c471     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 463187c: f900031f     	str	xzr, [x24]
 4631880: aa1903f8     	mov	x24, x25
 4631884: b10022d6     	adds	x22, x22, #0x8
 4631888: 54000160     	b.eq	0x46318b4 <_ChromeMain+0x462c618>
 463188c: b40069b8     	cbz	x24, 0x46325c0 <_ChromeMain+0x462d324>
 4631890: aa1803f9     	mov	x25, x24
 4631894: f85f8720     	ldr	x0, [x25], #-0x8
 4631898: 925e7408     	and	x8, x0, #0xfffffffc00000000
 463189c: f9404769     	ldr	x9, [x27, #0x88]
 46318a0: eb09011f     	cmp	x8, x9
 46318a4: 54fffec1     	b.ne	0x463187c <_ChromeMain+0x462c5e0>
 46318a8: 17fffff4     	b	0x4631878 <_ChromeMain+0x462c5dc>
 46318ac: aa1503e8     	mov	x8, x21
 46318b0: 14000002     	b	0x46318b8 <_ChromeMain+0x462c61c>
 46318b4: f9438a68     	ldr	x8, [x19, #0x710]
 46318b8: cb0802a8     	sub	x8, x21, x8
 46318bc: 9343fd08     	asr	x8, x8, #3
 46318c0: f9038e68     	str	x8, [x19, #0x718]
 46318c4: f94013f6     	ldr	x22, [sp, #0x20]
 46318c8: f94006c8     	ldr	x8, [x22, #0x8]
 46318cc: eb1602ff     	cmp	x23, x22
 46318d0: 54000160     	b.eq	0x46318fc <_ChromeMain+0x462c660>
 46318d4: f94002c1     	ldr	x1, [x22]
 46318d8: 8b080508     	add	x8, x8, x8, lsl #1
 46318dc: 8b080c22     	add	x2, x1, x8, lsl #3
 46318e0: 9340f108     	sbfx	x8, x8, #0, #61
 46318e4: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 46318e8: f2955569     	movk	x9, #0xaaab
 46318ec: 9b097d03     	mul	x3, x8, x9
 46318f0: 911ca260     	add	x0, x19, #0x728
 46318f4: 97b9d963     	bl	0x34a7e80 <_ChromeMain+0x34a2be4>
 46318f8: f94006c8     	ldr	x8, [x22, #0x8]
 46318fc: 52800029     	mov	w9, #0x1                ; =1
 4631900: b9001fe9     	str	w9, [sp, #0x1c]
 4631904: b4000088     	cbz	x8, 0x4631914 <_ChromeMain+0x462c678>
 4631908: d2800017     	mov	x23, #0x0               ; =0
 463190c: f90007fc     	str	x28, [sp, #0x8]
 4631910: 14000195     	b	0x4631f64 <_ChromeMain+0x462ccc8>
 4631914: f9442668     	ldr	x8, [x19, #0x848]
 4631918: 39424108     	ldrb	w8, [x8, #0x90]
 463191c: 340000e8     	cbz	w8, 0x4631938 <_ChromeMain+0x462c69c>
 4631920: 39682269     	ldrb	w9, [x19, #0xa08]
 4631924: 37000069     	tbnz	w9, #0x0, 0x4631930 <_ChromeMain+0x462c694>
 4631928: 39683269     	ldrb	w9, [x19, #0xa0c]
 463192c: 36000069     	tbz	w9, #0x0, 0x4631938 <_ChromeMain+0x462c69c>
 4631930: 52800008     	mov	w8, #0x0                ; =0
 4631934: 14000021     	b	0x46319b8 <_ChromeMain+0x462c71c>
 4631938: 3973826a     	ldrb	w10, [x19, #0xce0]
 463193c: 397de269     	ldrb	w9, [x19, #0xf78]
 4631940: 360002aa     	tbz	w10, #0x0, 0x4631994 <_ChromeMain+0x462c6f8>
 4631944: 350002a9     	cbnz	w9, 0x4631998 <_ChromeMain+0x462c6fc>
 4631948: 3974a268     	ldrb	w8, [x19, #0xd28]
 463194c: 34006b88     	cbz	w8, 0x46326bc <_ChromeMain+0x462d420>
 4631950: b94d2668     	ldr	w8, [x19, #0xd24]
 4631954: 7100011f     	cmp	w8, #0x0
 4631958: 1a9f17e8     	cset	w8, eq
 463195c: fd46a260     	ldr	d0, [x19, #0xd40]
 4631960: 90021e89     	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 4631964: 912db129     	add	x9, x9, #0xb6c
 4631968: f0ff7c4a     	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 463196c: 9103514a     	add	x10, x10, #0xd4
 4631970: 7100011f     	cmp	w8, #0x0
 4631974: 9a891148     	csel	x8, x10, x9, ne
 4631978: b948ca69     	ldr	w9, [x19, #0x8c8]
 463197c: 1e620121     	scvtf	d1, w9
 4631980: 1e610800     	fmul	d0, d0, d1
 4631984: d63f0100     	blr	x8
 4631988: 1e780009     	fcvtzs	w9, d0
 463198c: b941c268     	ldr	w8, [x19, #0x1c0]
 4631990: 14000004     	b	0x46319a0 <_ChromeMain+0x462c704>
 4631994: 36000129     	tbz	w9, #0x0, 0x46319b8 <_ChromeMain+0x462c71c>
 4631998: b941c268     	ldr	w8, [x19, #0x1c0]
 463199c: aa0803e9     	mov	x9, x8
 46319a0: 6b08013f     	cmp	w9, w8
 46319a4: 1a88b12a     	csel	w10, w9, w8, lt
 46319a8: 7100011f     	cmp	w8, #0x0
 46319ac: 1a89c148     	csel	w8, w10, w9, gt
 46319b0: 71025d1f     	cmp	w8, #0x97
 46319b4: 1a9fa7e8     	cset	w8, lt
 46319b8: f942f260     	ldr	x0, [x19, #0x5e0]
 46319bc: b4000160     	cbz	x0, 0x46319e8 <_ChromeMain+0x462c74c>
 46319c0: 52000108     	eor	w8, w8, #0x1
 46319c4: 395e9269     	ldrb	w9, [x19, #0x7a4]
 46319c8: 34000089     	cbz	w9, 0x46319d8 <_ChromeMain+0x462c73c>
 46319cc: 395e8269     	ldrb	w9, [x19, #0x7a0]
 46319d0: 34000049     	cbz	w9, 0x46319d8 <_ChromeMain+0x462c73c>
 46319d4: 395e7268     	ldrb	w8, [x19, #0x79c]
 46319d8: f9400009     	ldr	x9, [x0]
 46319dc: f9405129     	ldr	x9, [x9, #0xa0]
 46319e0: 12000101     	and	w1, w8, #0x1
 46319e4: d63f0120     	blr	x9
 46319e8: b9401fe8     	ldr	w8, [sp, #0x1c]
 46319ec: 3607e968     	tbz	w8, #0x0, 0x4631718 <_ChromeMain+0x462c47c>
 46319f0: f942f260     	ldr	x0, [x19, #0x5e0]
 46319f4: 52800001     	mov	w1, #0x0                ; =0
 46319f8: 96fffa9f     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46319fc: 17ffff47     	b	0x4631718 <_ChromeMain+0x462c47c>
 4631a00: 52800029     	mov	w9, #0x1                ; =1
 4631a04: 140001fa     	b	0x46321ec <_ChromeMain+0x462cf50>
 4631a08: 9722d1be     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4631a0c: 35008040     	cbnz	w0, 0x4632a14 <_ChromeMain+0x462d778>
 4631a10: aa1b03e0     	mov	x0, x27
 4631a14: 9732b310     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4631a18: aa0003f5     	mov	x21, x0
 4631a1c: f9416760     	ldr	x0, [x27, #0x2c8]
 4631a20: f9016775     	str	x21, [x27, #0x2c8]
 4631a24: b4001fa0     	cbz	x0, 0x4631e18 <_ChromeMain+0x462cb7c>
 4631a28: 140003e6     	b	0x46329c0 <_ChromeMain+0x462d724>
 4631a2c: 9722d1b5     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4631a30: 35007d20     	cbnz	w0, 0x46329d4 <_ChromeMain+0x462d738>
 4631a34: aa1b03e0     	mov	x0, x27
 4631a38: 9732b307     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4631a3c: f9416768     	ldr	x8, [x27, #0x2c8]
 4631a40: f9016760     	str	x0, [x27, #0x2c8]
 4631a44: b4001dc8     	cbz	x8, 0x4631dfc <_ChromeMain+0x462cb60>
 4631a48: 140003ed     	b	0x46329fc <_ChromeMain+0x462d760>
 4631a4c: a9760ba1     	ldp	x1, x2, [x29, #-0xa0]
 4631a50: 9100c3e0     	add	x0, sp, #0x30
 4631a54: 96e8545f     	bl	0x46bd0 <_ChromeMain+0x41934>
 4631a58: 140000f6     	b	0x4631e30 <_ChromeMain+0x462cb94>
 4631a5c: 12800008     	mov	w8, #-0x1               ; =-1
 4631a60: b8e80008     	ldaddal	w8, w8, [x0]
 4631a64: 7100051f     	cmp	w8, #0x1
 4631a68: 54001341     	b.ne	0x4631cd0 <_ChromeMain+0x462ca34>
 4631a6c: f9400808     	ldr	x8, [x0, #0x10]
 4631a70: d63f0100     	blr	x8
 4631a74: 14000097     	b	0x4631cd0 <_ChromeMain+0x462ca34>
 4631a78: a9400b61     	ldp	x1, x2, [x27]
 4631a7c: 9100e320     	add	x0, x25, #0x38
 4631a80: 96e799e6     	bl	0x18218 <_ChromeMain+0x12f7c>
 4631a84: 1400003d     	b	0x4631b78 <_ChromeMain+0x462c8dc>
 4631a88: a9400b61     	ldp	x1, x2, [x27]
 4631a8c: 9100e300     	add	x0, x24, #0x38
 4631a90: 96e799e2     	bl	0x18218 <_ChromeMain+0x12f7c>
 4631a94: 1400001e     	b	0x4631b0c <_ChromeMain+0x462c870>
 4631a98: b0052c08     	adrp	x8, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4631a9c: f9404508     	ldr	x8, [x8, #0x88]
 4631aa0: 925e7675     	and	x21, x19, #0xfffffffc00000000
 4631aa4: eb0802bf     	cmp	x21, x8
 4631aa8: 52800034     	mov	w20, #0x1               ; =1
 4631aac: 54000061     	b.ne	0x4631ab8 <_ChromeMain+0x462c81c>
 4631ab0: aa1303e0     	mov	x0, x19
 4631ab4: 96e78a12     	bl	0x142fc <_ChromeMain+0xf060>
 4631ab8: 52800a00     	mov	w0, #0x50               ; =80
 4631abc: 96e7762b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4631ac0: aa0003f8     	mov	x24, x0
 4631ac4: b9000014     	str	w20, [x0]
 4631ac8: 10258fe9     	adr	x9, 0x467ccc4 <_ChromeMain+0x4677a28>
 4631acc: d503201f     	nop
 4631ad0: d0ff99c8     	adrp	x8, 0x396b000 <_ChromeMain+0x3965d64>
 4631ad4: 91340108     	add	x8, x8, #0xd00
 4631ad8: a900a009     	stp	x9, x8, [x0, #0x8]
 4631adc: 90fef968     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4631ae0: 912c0109     	add	x9, x8, #0xb00
 4631ae4: 10103008     	adr	x8, 0x46520e4 <_ChromeMain+0x464ce48>
 4631ae8: d503201f     	nop
 4631aec: a901a009     	stp	x9, x8, [x0, #0x18]
 4631af0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4631af4: 39c05f68     	ldrsb	w8, [x27, #0x17]
 4631af8: 37fffc88     	tbnz	w8, #0x1f, 0x4631a88 <_ChromeMain+0x462c7ec>
 4631afc: 3dc00360     	ldr	q0, [x27]
 4631b00: f9400b68     	ldr	x8, [x27, #0x10]
 4631b04: f8048308     	stur	x8, [x24, #0x48]
 4631b08: 3c838300     	stur	q0, [x24, #0x38]
 4631b0c: b0052c08     	adrp	x8, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4631b10: f9404508     	ldr	x8, [x8, #0x88]
 4631b14: eb0802bf     	cmp	x21, x8
 4631b18: 54000061     	b.ne	0x4631b24 <_ChromeMain+0x462c888>
 4631b1c: aa1303e0     	mov	x0, x19
 4631b20: 96e789f7     	bl	0x142fc <_ChromeMain+0xf060>
 4631b24: 52800a00     	mov	w0, #0x50               ; =80
 4631b28: 96e77610     	bl	0xf368 <_ChromeMain+0xa0cc>
 4631b2c: aa0003f9     	mov	x25, x0
 4631b30: b9000014     	str	w20, [x0]
 4631b34: 10259169     	adr	x9, 0x467cd60 <_ChromeMain+0x4677ac4>
 4631b38: d503201f     	nop
 4631b3c: d0ff99c8     	adrp	x8, 0x396b000 <_ChromeMain+0x3965d64>
 4631b40: 91340108     	add	x8, x8, #0xd00
 4631b44: a900a009     	stp	x9, x8, [x0, #0x8]
 4631b48: 90fef968     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4631b4c: 912c0109     	add	x9, x8, #0xb00
 4631b50: 101040c8     	adr	x8, 0x4652368 <_ChromeMain+0x464d0cc>
 4631b54: d503201f     	nop
 4631b58: a901a009     	stp	x9, x8, [x0, #0x18]
 4631b5c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4631b60: 39c05f68     	ldrsb	w8, [x27, #0x17]
 4631b64: 37fff8a8     	tbnz	w8, #0x1f, 0x4631a78 <_ChromeMain+0x462c7dc>
 4631b68: 3dc00360     	ldr	q0, [x27]
 4631b6c: f9400b68     	ldr	x8, [x27, #0x10]
 4631b70: f8048328     	stur	x8, [x25, #0x48]
 4631b74: 3c838320     	stur	q0, [x25, #0x38]
 4631b78: 52800034     	mov	w20, #0x1               ; =1
 4631b7c: b0052c1a     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4631b80: f9404748     	ldr	x8, [x26, #0x88]
 4631b84: eb0802bf     	cmp	x21, x8
 4631b88: 54000080     	b.eq	0x4631b98 <_ChromeMain+0x462c8fc>
 4631b8c: 925e767b     	and	x27, x19, #0xfffffffc00000000
 4631b90: 52800016     	mov	w22, #0x0               ; =0
 4631b94: 14000007     	b	0x4631bb0 <_ChromeMain+0x462c914>
 4631b98: aa1303e0     	mov	x0, x19
 4631b9c: 96e789d8     	bl	0x142fc <_ChromeMain+0xf060>
 4631ba0: f9404748     	ldr	x8, [x26, #0x88]
 4631ba4: 925e767b     	and	x27, x19, #0xfffffffc00000000
 4631ba8: eb0802bf     	cmp	x21, x8
 4631bac: 1a9f17f6     	cset	w22, eq
 4631bb0: 52800700     	mov	w0, #0x38               ; =56
 4631bb4: 96e775ed     	bl	0xf368 <_ChromeMain+0xa0cc>
 4631bb8: aa0003f5     	mov	x21, x0
 4631bbc: b9000014     	str	w20, [x0]
 4631bc0: d0ffcc08     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 4631bc4: 91300109     	add	x9, x8, #0xc00
 4631bc8: 90ff9348     	adrp	x8, 0x3899000 <_ChromeMain+0x3893d64>
 4631bcc: 912d0108     	add	x8, x8, #0xb40
 4631bd0: a900a009     	stp	x9, x8, [x0, #0x8]
 4631bd4: 90fef968     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4631bd8: 912c0109     	add	x9, x8, #0xb00
 4631bdc: 10104568     	adr	x8, 0x4652488 <_ChromeMain+0x464d1ec>
 4631be0: d503201f     	nop
 4631be4: a901a009     	stp	x9, x8, [x0, #0x18]
 4631be8: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4631bec: 340000d6     	cbz	w22, 0x4631c04 <_ChromeMain+0x462c968>
 4631bf0: aa1303e0     	mov	x0, x19
 4631bf4: 96e789c2     	bl	0x142fc <_ChromeMain+0xf060>
 4631bf8: f9404748     	ldr	x8, [x26, #0x88]
 4631bfc: eb08037f     	cmp	x27, x8
 4631c00: 1a9f17f6     	cset	w22, eq
 4631c04: 52800700     	mov	w0, #0x38               ; =56
 4631c08: 96e775d8     	bl	0xf368 <_ChromeMain+0xa0cc>
 4631c0c: aa0003fa     	mov	x26, x0
 4631c10: b9000014     	str	w20, [x0]
 4631c14: f0ffd0e8     	adrp	x8, 0x4050000 <_ChromeMain+0x404ad64>
 4631c18: 910a6109     	add	x9, x8, #0x298
 4631c1c: 90ff9348     	adrp	x8, 0x3899000 <_ChromeMain+0x3893d64>
 4631c20: 912d0108     	add	x8, x8, #0xb40
 4631c24: a900a009     	stp	x9, x8, [x0, #0x8]
 4631c28: 90fef968     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4631c2c: 912c0109     	add	x9, x8, #0xb00
 4631c30: 10104e88     	adr	x8, 0x4652600 <_ChromeMain+0x464d364>
 4631c34: d503201f     	nop
 4631c38: a901a009     	stp	x9, x8, [x0, #0x18]
 4631c3c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4631c40: 34000076     	cbz	w22, 0x4631c4c <_ChromeMain+0x462c9b0>
 4631c44: aa1303e0     	mov	x0, x19
 4631c48: 96e789ad     	bl	0x142fc <_ChromeMain+0xf060>
 4631c4c: 52800700     	mov	w0, #0x38               ; =56
 4631c50: 96e775c6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4631c54: aa0003f6     	mov	x22, x0
 4631c58: 52800034     	mov	w20, #0x1               ; =1
 4631c5c: b9000014     	str	w20, [x0]
 4631c60: 90ffcc48     	adrp	x8, 0x3fb9000 <_ChromeMain+0x3fb3d64>
 4631c64: 910c0109     	add	x9, x8, #0x300
 4631c68: 90ff9348     	adrp	x8, 0x3899000 <_ChromeMain+0x3893d64>
 4631c6c: 912d0108     	add	x8, x8, #0xb40
 4631c70: a900a009     	stp	x9, x8, [x0, #0x8]
 4631c74: 90fef968     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4631c78: 912c0109     	add	x9, x8, #0xb00
 4631c7c: 101064e8     	adr	x8, 0x4652918 <_ChromeMain+0x464d67c>
 4631c80: d503201f     	nop
 4631c84: a901a009     	stp	x9, x8, [x0, #0x18]
 4631c88: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4631c8c: b00546c8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4631c90: 91120108     	add	x8, x8, #0x480
 4631c94: f8bfc100     	ldapr	x0, [x8]
 4631c98: b4006500     	cbz	x0, 0x4632938 <_ChromeMain+0x462d69c>
 4631c9c: 52809f01     	mov	w1, #0x4f8              ; =1272
 4631ca0: d2800002     	mov	x2, #0x0                ; =0
 4631ca4: 96e9e643     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4631ca8: aa0003fb     	mov	x27, x0
 4631cac: f81803b8     	stur	x24, [x29, #-0x80]
 4631cb0: 381883b4     	sturb	w20, [x29, #-0x78]
 4631cb4: d10203a1     	sub	x1, x29, #0x80
 4631cb8: 9734f1f2     	bl	0x136e480 <_ChromeMain+0x13691e4>
 4631cbc: 385883a8     	ldurb	w8, [x29, #-0x78]
 4631cc0: 7103fd1f     	cmp	w8, #0xff
 4631cc4: 54000060     	b.eq	0x4631cd0 <_ChromeMain+0x462ca34>
 4631cc8: f85803a0     	ldur	x0, [x29, #-0x80]
 4631ccc: b5ffec80     	cbnz	x0, 0x4631a5c <_ChromeMain+0x462c7c0>
 4631cd0: 52801fe8     	mov	w8, #0xff               ; =255
 4631cd4: 381883a8     	sturb	w8, [x29, #-0x78]
 4631cd8: f00507ca     	adrp	x10, 0xe72c000 <dyld_stub_binder+0xe72c000>
 4631cdc: 9133c14a     	add	x10, x10, #0xcf0
 4631ce0: 91118148     	add	x8, x10, #0x460
 4631ce4: a900236a     	stp	x10, x8, [x27]
 4631ce8: 91122148     	add	x8, x10, #0x488
 4631cec: f9000b68     	str	x8, [x27, #0x10]
 4631cf0: 91130148     	add	x8, x10, #0x4c0
 4631cf4: 9113c149     	add	x9, x10, #0x4f0
 4631cf8: a906a768     	stp	x8, x9, [x27, #0x68]
 4631cfc: 91150148     	add	x8, x10, #0x540
 4631d00: f9005b68     	str	x8, [x27, #0xb0]
 4631d04: 91168148     	add	x8, x10, #0x5a0
 4631d08: f9006f68     	str	x8, [x27, #0xd8]
 4631d0c: 91174148     	add	x8, x10, #0x5d0
 4631d10: aa1b03f8     	mov	x24, x27
 4631d14: f80f8f08     	str	x8, [x24, #0xf8]!
 4631d18: 9117e148     	add	x8, x10, #0x5f8
 4631d1c: f9018b68     	str	x8, [x27, #0x310]
 4631d20: 9119e148     	add	x8, x10, #0x678
 4631d24: f9018f68     	str	x8, [x27, #0x318]
 4631d28: 911ce148     	add	x8, x10, #0x738
 4631d2c: f9019368     	str	x8, [x27, #0x320]
 4631d30: b9401be8     	ldr	w8, [sp, #0x18]
 4631d34: 3912c368     	strb	w8, [x27, #0x4b0]
 4631d38: 925e7788     	and	x8, x28, #0xfffffffc00000000
 4631d3c: b0052c09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4631d40: f9404529     	ldr	x9, [x9, #0x88]
 4631d44: eb09011f     	cmp	x8, x9
 4631d48: 9102c3f4     	add	x20, sp, #0xb0
 4631d4c: 54000061     	b.ne	0x4631d58 <_ChromeMain+0x462cabc>
 4631d50: aa1c03e0     	mov	x0, x28
 4631d54: 96e7896a     	bl	0x142fc <_ChromeMain+0xf060>
 4631d58: f9025f7c     	str	x28, [x27, #0x4b8]
 4631d5c: f9026379     	str	x25, [x27, #0x4c0]
 4631d60: f9026775     	str	x21, [x27, #0x4c8]
 4631d64: f9026b7a     	str	x26, [x27, #0x4d0]
 4631d68: f9026f76     	str	x22, [x27, #0x4d8]
 4631d6c: 91138368     	add	x8, x27, #0x4e0
 4631d70: 6f00e400     	movi.2d	v0, #0000000000000000
 4631d74: 3d813b60     	str	q0, [x27, #0x4e0]
 4631d78: b800f11f     	stur	wzr, [x8, #0xf]
 4631d7c: 39518368     	ldrb	w8, [x27, #0x460]
 4631d80: 340000a8     	cbz	w8, 0x4631d94 <_ChromeMain+0x462caf8>
 4631d84: 3911837f     	strb	wzr, [x27, #0x460]
 4631d88: 91118361     	add	x1, x27, #0x460
 4631d8c: aa1803e0     	mov	x0, x24
 4631d90: 9723d890     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4631d94: aa1b03e0     	mov	x0, x27
 4631d98: b21d07e1     	mov	x1, #0x1800000018       ; =103079215128
 4631d9c: 52800022     	mov	w2, #0x1                ; =1
 4631da0: 97867f30     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4631da4: aa1b03e0     	mov	x0, x27
 4631da8: 52800021     	mov	w1, #0x1                ; =1
 4631dac: 97578eb8     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 4631db0: f9401368     	ldr	x8, [x27, #0x20]
 4631db4: b9400909     	ldr	w9, [x8, #0x8]
 4631db8: 7100093f     	cmp	w9, #0x2
 4631dbc: f94007fc     	ldr	x28, [sp, #0x8]
 4631dc0: f94013f6     	ldr	x22, [sp, #0x20]
 4631dc4: 54005be0     	b.eq	0x4632940 <_ChromeMain+0x462d6a4>
 4631dc8: 39422909     	ldrb	w9, [x8, #0x8a]
 4631dcc: 340000a9     	cbz	w9, 0x4631de0 <_ChromeMain+0x462cb44>
 4631dd0: 3902291f     	strb	wzr, [x8, #0x8a]
 4631dd4: f940b500     	ldr	x0, [x8, #0x168]
 4631dd8: 52800001     	mov	w1, #0x0                ; =0
 4631ddc: 971e6f59     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 4631de0: aa1b03e0     	mov	x0, x27
 4631de4: 52800041     	mov	w1, #0x2                ; =2
 4631de8: 973c167d     	bl	0x15377dc <_ChromeMain+0x1532540>
 4631dec: aa1b03e0     	mov	x0, x27
 4631df0: 9734f414     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 4631df4: f9416760     	ldr	x0, [x27, #0x2c8]
 4631df8: b4ffe1a0     	cbz	x0, 0x4631a2c <_ChromeMain+0x462c790>
 4631dfc: 52800121     	mov	w1, #0x9                ; =9
 4631e00: 974171b8     	bl	0x168e4e0 <_ChromeMain+0x1689244>
 4631e04: 910203e1     	add	x1, sp, #0x80
 4631e08: aa1b03e0     	mov	x0, x27
 4631e0c: 970852ce     	bl	0x846944 <_ChromeMain+0x8416a8>
 4631e10: f9416775     	ldr	x21, [x27, #0x2c8]
 4631e14: b4ffdfb5     	cbz	x21, 0x4631a08 <_ChromeMain+0x462c76c>
 4631e18: 38d773b8     	ldursb	w24, [x29, #-0x89]
 4631e1c: 37ffe198     	tbnz	w24, #0x1f, 0x4631a4c <_ChromeMain+0x462c7b0>
 4631e20: 3dc01280     	ldr	q0, [x20, #0x40]
 4631e24: 3d800fe0     	str	q0, [sp, #0x30]
 4631e28: f85703a8     	ldur	x8, [x29, #-0x90]
 4631e2c: f90023e8     	str	x8, [sp, #0x40]
 4631e30: 9100c3e1     	add	x1, sp, #0x30
 4631e34: aa1503e0     	mov	x0, x21
 4631e38: 972ceea8     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 4631e3c: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4631e40: 36f800a8     	tbz	w8, #0x1f, 0x4631e54 <_ChromeMain+0x462cbb8>
 4631e44: f9401be0     	ldr	x0, [sp, #0x30]
 4631e48: f94023e8     	ldr	x8, [sp, #0x40]
 4631e4c: d37ff901     	lsl	x1, x8, #1
 4631e50: 96e75c1a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4631e54: aa1b03e0     	mov	x0, x27
 4631e58: aa1703e1     	mov	x1, x23
 4631e5c: 94007fea     	bl	0x4651e04 <_ChromeMain+0x464cb68>
 4631e60: 925e7768     	and	x8, x27, #0xfffffffc00000000
 4631e64: b0052c09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4631e68: f9404529     	ldr	x9, [x9, #0x88]
 4631e6c: eb09011f     	cmp	x8, x9
 4631e70: 54000061     	b.ne	0x4631e7c <_ChromeMain+0x462cbe0>
 4631e74: aa1b03e0     	mov	x0, x27
 4631e78: 96e78921     	bl	0x142fc <_ChromeMain+0xf060>
 4631e7c: f90017fb     	str	x27, [sp, #0x28]
 4631e80: f9438a68     	ldr	x8, [x19, #0x710]
 4631e84: f9438e69     	ldr	x9, [x19, #0x718]
 4631e88: 8b090d08     	add	x8, x8, x9, lsl #3
 4631e8c: f81483a8     	stur	x8, [x29, #-0xb8]
 4631e90: f943926a     	ldr	x10, [x19, #0x720]
 4631e94: d102e3ab     	sub	x11, x29, #0xb8
 4631e98: f81803ab     	stur	x11, [x29, #-0x80]
 4631e9c: 9100a3eb     	add	x11, sp, #0x28
 4631ea0: f81883ab     	stur	x11, [x29, #-0x78]
 4631ea4: 911c426b     	add	x11, x19, #0x710
 4631ea8: f81903ab     	stur	x11, [x29, #-0x70]
 4631eac: eb0a013f     	cmp	x9, x10
 4631eb0: 54004220     	b.eq	0x46326f4 <_ChromeMain+0x462d458>
 4631eb4: b4003868     	cbz	x8, 0x46325c0 <_ChromeMain+0x462d324>
 4631eb8: f800851b     	str	x27, [x8], #0x8
 4631ebc: f90017ff     	str	xzr, [sp, #0x28]
 4631ec0: f81483a8     	stur	x8, [x29, #-0xb8]
 4631ec4: f85483a8     	ldur	x8, [x29, #-0xb8]
 4631ec8: f9438a69     	ldr	x9, [x19, #0x710]
 4631ecc: eb090108     	subs	x8, x8, x9
 4631ed0: 9343fd08     	asr	x8, x8, #3
 4631ed4: f9038e68     	str	x8, [x19, #0x718]
 4631ed8: 54003740     	b.eq	0x46325c0 <_ChromeMain+0x462d324>
 4631edc: f94017e0     	ldr	x0, [sp, #0x28]
 4631ee0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4631ee4: b0052c09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4631ee8: f9404529     	ldr	x9, [x9, #0x88]
 4631eec: eb09011f     	cmp	x8, x9
 4631ef0: 54000041     	b.ne	0x4631ef8 <_ChromeMain+0x462cc5c>
 4631ef4: 96e7c2d2     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4631ef8: 3945a768     	ldrb	w8, [x27, #0x169]
 4631efc: 35005288     	cbnz	w8, 0x463294c <_ChromeMain+0x462d6b0>
 4631f00: f942f260     	ldr	x0, [x19, #0x5e0]
 4631f04: f940cc02     	ldr	x2, [x0, #0x198]
 4631f08: aa1b03e1     	mov	x1, x27
 4631f0c: 97051d3c     	bl	0x7793fc <_ChromeMain+0x774160>
 4631f10: 36f800b8     	tbz	w24, #0x1f, 0x4631f24 <_ChromeMain+0x462cc88>
 4631f14: f85603a0     	ldur	x0, [x29, #-0xa0]
 4631f18: f85703a8     	ldur	x8, [x29, #-0x90]
 4631f1c: d37ff901     	lsl	x1, x8, #1
 4631f20: 96e75be6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4631f24: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 4631f28: 36f800a8     	tbz	w8, #0x1f, 0x4631f3c <_ChromeMain+0x462cca0>
 4631f2c: f94043e0     	ldr	x0, [sp, #0x80]
 4631f30: f9404be8     	ldr	x8, [sp, #0x90]
 4631f34: d37ff901     	lsl	x1, x8, #1
 4631f38: 96e75be0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4631f3c: 39c2bfe8     	ldrsb	w8, [sp, #0xaf]
 4631f40: 36f800a8     	tbz	w8, #0x1f, 0x4631f54 <_ChromeMain+0x462ccb8>
 4631f44: f9404fe0     	ldr	x0, [sp, #0x98]
 4631f48: f94057e8     	ldr	x8, [sp, #0xa8]
 4631f4c: d37ff901     	lsl	x1, x8, #1
 4631f50: 96e75bda     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4631f54: 910006f7     	add	x23, x23, #0x1
 4631f58: f94006c8     	ldr	x8, [x22, #0x8]
 4631f5c: eb0802ff     	cmp	x23, x8
 4631f60: 54ffcda2     	b.hs	0x4631914 <_ChromeMain+0x462c678>
 4631f64: f94002c8     	ldr	x8, [x22]
 4631f68: 52800309     	mov	w9, #0x18               ; =24
 4631f6c: 9b0922fb     	madd	x27, x23, x9, x8
 4631f70: aa1c03e0     	mov	x0, x28
 4631f74: aa1b03e1     	mov	x1, x27
 4631f78: 974fb762     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4631f7c: aa0003fc     	mov	x28, x0
 4631f80: f9400be0     	ldr	x0, [sp, #0x10]
 4631f84: aa1b03e1     	mov	x1, x27
 4631f88: 9785cdc7     	bl	0x27a56a4 <_ChromeMain+0x27a0408>
 4631f8c: 394323e8     	ldrb	w8, [sp, #0xc8]
 4631f90: 36003188     	tbz	w8, #0x0, 0x46325c0 <_ChromeMain+0x462d324>
 4631f94: aa0003f5     	mov	x21, x0
 4631f98: 9102c3e1     	add	x1, sp, #0xb0
 4631f9c: aa1b03e0     	mov	x0, x27
 4631fa0: 972a6859     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 4631fa4: b9001be0     	str	w0, [sp, #0x18]
 4631fa8: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 4631fac: f9004fff     	str	xzr, [sp, #0x98]
 4631fb0: f94006c2     	ldr	x2, [x22, #0x8]
 4631fb4: 910263e8     	add	x8, sp, #0x98
 4631fb8: aa1c03e0     	mov	x0, x28
 4631fbc: aa1503e1     	mov	x1, x21
 4631fc0: 97eb2fb5     	bl	0x40fde94 <_ChromeMain+0x40f8bf8>
 4631fc4: 911d0260     	add	x0, x19, #0x740
 4631fc8: aa1b03e1     	mov	x1, x27
 4631fcc: 9418104d     	bl	0x4c36100 <_ChromeMain+0x4c30e64>
 4631fd0: f9400028     	ldr	x8, [x1]
 4631fd4: f100011f     	cmp	x8, #0x0
 4631fd8: 911d2269     	add	x9, x19, #0x748
 4631fdc: fa491104     	ccmp	x8, x9, #0x4, ne
 4631fe0: 540000e0     	b.eq	0x4631ffc <_ChromeMain+0x462cd60>
 4631fe4: 39813d19     	ldrsb	x25, [x8, #0x4f]
 4631fe8: b7f80079     	tbnz	x25, #0x3f, 0x4631ff4 <_ChromeMain+0x462cd58>
 4631fec: 9100e118     	add	x24, x8, #0x38
 4631ff0: 14000005     	b	0x4632004 <_ChromeMain+0x462cd68>
 4631ff4: a943e518     	ldp	x24, x25, [x8, #0x38]
 4631ff8: 14000003     	b	0x4632004 <_ChromeMain+0x462cd68>
 4631ffc: d2800019     	mov	x25, #0x0               ; =0
 4632000: d2800018     	mov	x24, #0x0               ; =0
 4632004: a908ffff     	stp	xzr, xzr, [sp, #0x88]
 4632008: f94006c2     	ldr	x2, [x22, #0x8]
 463200c: 39624276     	ldrb	w22, [x19, #0x890]
 4632010: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 4632014: a907ffff     	stp	xzr, xzr, [sp, #0x78]
 4632018: 9101a3e8     	add	x8, sp, #0x68
 463201c: aa1c03e0     	mov	x0, x28
 4632020: aa1503e1     	mov	x1, x21
 4632024: 97eb2f9c     	bl	0x40fde94 <_ChromeMain+0x40f8bf8>
 4632028: 34000ef6     	cbz	w22, 0x4632204 <_ChromeMain+0x462cf68>
 463202c: 6f00e400     	movi.2d	v0, #0000000000000000
 4632030: ad030280     	stp	q0, q0, [x20, #0x60]
 4632034: b40003d5     	cbz	x21, 0x46320ac <_ChromeMain+0x462ce10>
 4632038: 394122a8     	ldrb	w8, [x21, #0x48]
 463203c: 52800036     	mov	w22, #0x1               ; =1
 4632040: 37000328     	tbnz	w8, #0x0, 0x46320a4 <_ChromeMain+0x462ce08>
 4632044: f94002a8     	ldr	x8, [x21]
 4632048: f940a508     	ldr	x8, [x8, #0x148]
 463204c: aa1503e0     	mov	x0, x21
 4632050: d63f0100     	blr	x8
 4632054: f9400008     	ldr	x8, [x0]
 4632058: f940b508     	ldr	x8, [x8, #0x168]
 463205c: d63f0100     	blr	x8
 4632060: d10283a8     	sub	x8, x29, #0xa0
 4632064: 97aabec7     	bl	0x30e1b80 <_ChromeMain+0x30dc8e4>
 4632068: 385983a8     	ldurb	w8, [x29, #-0x68]
 463206c: 385783a9     	ldurb	w9, [x29, #-0x88]
 4632070: 6b09011f     	cmp	w8, w9
 4632074: 540032e1     	b.ne	0x46326d0 <_ChromeMain+0x462d434>
 4632078: 350047a8     	cbnz	w8, 0x463296c <_ChromeMain+0x462d6d0>
 463207c: 385783a8     	ldurb	w8, [x29, #-0x88]
 4632080: 340000e8     	cbz	w8, 0x463209c <_ChromeMain+0x462ce00>
 4632084: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4632088: 36f800a8     	tbz	w8, #0x1f, 0x463209c <_ChromeMain+0x462ce00>
 463208c: f85603a0     	ldur	x0, [x29, #-0xa0]
 4632090: f85703a8     	ldur	x8, [x29, #-0x90]
 4632094: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4632098: 96e75b88     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463209c: 385983a8     	ldurb	w8, [x29, #-0x68]
 46320a0: 14000005     	b	0x46320b4 <_ChromeMain+0x462ce18>
 46320a4: 52800008     	mov	w8, #0x0                ; =0
 46320a8: 14000003     	b	0x46320b4 <_ChromeMain+0x462ce18>
 46320ac: 52800008     	mov	w8, #0x0                ; =0
 46320b0: 52800036     	mov	w22, #0x1               ; =1
 46320b4: 37002888     	tbnz	w8, #0x0, 0x46325c4 <_ChromeMain+0x462d328>
 46320b8: b4002879     	cbz	x25, 0x46325c4 <_ChromeMain+0x462d328>
 46320bc: 92800228     	mov	x8, #-0x12              ; =-18
 46320c0: f2efffe8     	movk	x8, #0x7fff, lsl #48
 46320c4: eb08033f     	cmp	x25, x8
 46320c8: 540040a8     	b.hi	0x46328dc <_ChromeMain+0x462d640>
 46320cc: f1005b3f     	cmp	x25, #0x16
 46320d0: 54000169     	b.ls	0x46320fc <_ChromeMain+0x462ce60>
 46320d4: 927ceb36     	and	x22, x25, #0x7ffffffffffffff0
 46320d8: 910042c0     	add	x0, x22, #0x10
 46320dc: 96e774a3     	bl	0xf368 <_ChromeMain+0xa0cc>
 46320e0: aa0003f5     	mov	x21, x0
 46320e4: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 46320e8: cb0802c8     	sub	x8, x22, x8
 46320ec: 52800036     	mov	w22, #0x1               ; =1
 46320f0: a93667a0     	stp	x0, x25, [x29, #-0xa0]
 46320f4: f81703a8     	stur	x8, [x29, #-0x90]
 46320f8: 14000003     	b	0x4632104 <_ChromeMain+0x462ce68>
 46320fc: 381773b9     	sturb	w25, [x29, #-0x89]
 4632100: d10283b5     	sub	x21, x29, #0xa0
 4632104: 8b1902a8     	add	x8, x21, x25
 4632108: eb15011f     	cmp	x8, x21
 463210c: 540025a3     	b.lo	0x46325c0 <_ChromeMain+0x462d324>
 4632110: eb1802bf     	cmp	x21, x24
 4632114: 54000068     	b.hi	0x4632120 <_ChromeMain+0x462ce84>
 4632118: eb18011f     	cmp	x8, x24
 463211c: 54002528     	b.hi	0x46325c0 <_ChromeMain+0x462d324>
 4632120: aa1503e0     	mov	x0, x21
 4632124: aa1803e1     	mov	x1, x24
 4632128: aa1903e2     	mov	x2, x25
 463212c: 94e77468     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4632130: 38396abf     	strb	wzr, [x21, x25]
 4632134: 3dc01280     	ldr	q0, [x20, #0x40]
 4632138: 3d801a80     	str	q0, [x20, #0x60]
 463213c: f85703a8     	ldur	x8, [x29, #-0x90]
 4632140: f81903a8     	stur	x8, [x29, #-0x70]
 4632144: 381983b6     	sturb	w22, [x29, #-0x68]
 4632148: 385983a8     	ldurb	w8, [x29, #-0x68]
 463214c: 340005c8     	cbz	w8, 0x4632204 <_ChromeMain+0x462cf68>
 4632150: 385973a9     	ldurb	w9, [x29, #-0x69]
 4632154: 13001d28     	sxtb	w8, w9
 4632158: f85883aa     	ldur	x10, [x29, #-0x78]
 463215c: 7100011f     	cmp	w8, #0x0
 4632160: 9a894149     	csel	x9, x10, x9, mi
 4632164: b4ffc4e9     	cbz	x9, 0x4631a00 <_ChromeMain+0x462c764>
 4632168: 9101a3e0     	add	x0, sp, #0x68
 463216c: d004caa1     	adrp	x1, 0xdf88000 <dyld_stub_binder+0xdf88000>
 4632170: 91003821     	add	x1, x1, #0xe
 4632174: 52800022     	mov	w2, #0x1                ; =1
 4632178: 9717909c     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 463217c: 385983a8     	ldurb	w8, [x29, #-0x68]
 4632180: 36002208     	tbz	w8, #0x0, 0x46325c0 <_ChromeMain+0x462d324>
 4632184: 389973a8     	ldursb	x8, [x29, #-0x69]
 4632188: a9782ba9     	ldp	x9, x10, [x29, #-0x80]
 463218c: f100011f     	cmp	x8, #0x0
 4632190: d10203ab     	sub	x11, x29, #0x80
 4632194: 9a8b4120     	csel	x0, x9, x11, mi
 4632198: 7100011f     	cmp	w8, #0x0
 463219c: 9a884141     	csel	x1, x10, x8, mi
 46321a0: d10283a8     	sub	x8, x29, #0xa0
 46321a4: 970ac05b     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 46321a8: 389773a8     	ldursb	x8, [x29, #-0x89]
 46321ac: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 46321b0: f100011f     	cmp	x8, #0x0
 46321b4: d10283ab     	sub	x11, x29, #0xa0
 46321b8: 9a8b4121     	csel	x1, x9, x11, mi
 46321bc: 7100011f     	cmp	w8, #0x0
 46321c0: 9a884142     	csel	x2, x10, x8, mi
 46321c4: 9101a3e0     	add	x0, sp, #0x68
 46321c8: 97179088     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 46321cc: 38d773a8     	ldursb	w8, [x29, #-0x89]
 46321d0: 36f800a8     	tbz	w8, #0x1f, 0x46321e4 <_ChromeMain+0x462cf48>
 46321d4: f85603a0     	ldur	x0, [x29, #-0xa0]
 46321d8: f85703a8     	ldur	x8, [x29, #-0x90]
 46321dc: d37ff901     	lsl	x1, x8, #1
 46321e0: 96e75b36     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46321e4: 385973a8     	ldurb	w8, [x29, #-0x69]
 46321e8: 385983a9     	ldurb	w9, [x29, #-0x68]
 46321ec: 360000c9     	tbz	w9, #0x0, 0x4632204 <_ChromeMain+0x462cf68>
 46321f0: 363800a8     	tbz	w8, #0x7, 0x4632204 <_ChromeMain+0x462cf68>
 46321f4: f85803a0     	ldur	x0, [x29, #-0x80]
 46321f8: f85903a8     	ldur	x8, [x29, #-0x70]
 46321fc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4632200: 96e75b2e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4632204: f10022ff     	cmp	x23, #0x8
 4632208: 540005e8     	b.hi	0x46322c4 <_ChromeMain+0x462d028>
 463220c: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 4632210: 12001d18     	and	w24, w8, #0xff
 4632214: 36f81b48     	tbz	w8, #0x1f, 0x463257c <_ChromeMain+0x462d2e0>
 4632218: a9476be9     	ldp	x9, x26, [sp, #0x70]
 463221c: 9240fb48     	and	x8, x26, #0x7fffffffffffffff
 4632220: d1000516     	sub	x22, x8, #0x1
 4632224: eb16013f     	cmp	x9, x22
 4632228: 540028a0     	b.eq	0x463273c <_ChromeMain+0x462d4a0>
 463222c: f94037f5     	ldr	x21, [sp, #0x68]
 4632230: aa0903f6     	mov	x22, x9
 4632234: 910006c8     	add	x8, x22, #0x1
 4632238: f9003be8     	str	x8, [sp, #0x70]
 463223c: d37ffac8     	lsl	x8, x22, #1
 4632240: 528003e9     	mov	w9, #0x1f               ; =31
 4632244: b8286aa9     	str	w9, [x21, x8]
 4632248: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 463224c: 12001d18     	and	w24, w8, #0xff
 4632250: 36f81868     	tbz	w8, #0x1f, 0x463255c <_ChromeMain+0x462d2c0>
 4632254: a9476be9     	ldp	x9, x26, [sp, #0x70]
 4632258: 9240fb48     	and	x8, x26, #0x7fffffffffffffff
 463225c: d1000516     	sub	x22, x8, #0x1
 4632260: eb16013f     	cmp	x9, x22
 4632264: 540024e0     	b.eq	0x4632700 <_ChromeMain+0x462d464>
 4632268: f94037f5     	ldr	x21, [sp, #0x68]
 463226c: aa0903f6     	mov	x22, x9
 4632270: 910006c8     	add	x8, x22, #0x1
 4632274: f9003be8     	str	x8, [sp, #0x70]
 4632278: d37ffac8     	lsl	x8, x22, #1
 463227c: 52846069     	mov	w9, #0x2303             ; =8963
 4632280: b8286aa9     	str	w9, [x21, x8]
 4632284: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 4632288: 12001d18     	and	w24, w8, #0xff
 463228c: 36f81588     	tbz	w8, #0x1f, 0x463253c <_ChromeMain+0x462d2a0>
 4632290: a9476be9     	ldp	x9, x26, [sp, #0x70]
 4632294: 9240fb48     	and	x8, x26, #0x7fffffffffffffff
 4632298: d1000516     	sub	x22, x8, #0x1
 463229c: eb16013f     	cmp	x9, x22
 46322a0: 540026c0     	b.eq	0x4632778 <_ChromeMain+0x462d4dc>
 46322a4: f94037f5     	ldr	x21, [sp, #0x68]
 46322a8: aa0903f6     	mov	x22, x9
 46322ac: 910006c8     	add	x8, x22, #0x1
 46322b0: f9003be8     	str	x8, [sp, #0x70]
 46322b4: 1100c6e8     	add	w8, w23, #0x31
 46322b8: 8b1606a9     	add	x9, x21, x22, lsl #1
 46322bc: 79000128     	strh	w8, [x9]
 46322c0: 7900053f     	strh	wzr, [x9, #0x2]
 46322c4: 3cc683e0     	ldur	q0, [sp, #0x68]
 46322c8: 3d8023e0     	str	q0, [sp, #0x80]
 46322cc: f9403fe8     	ldr	x8, [sp, #0x78]
 46322d0: f9004be8     	str	x8, [sp, #0x90]
 46322d4: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 46322d8: f90037ff     	str	xzr, [sp, #0x68]
 46322dc: 3982bfe8     	ldrsb	x8, [sp, #0xaf]
 46322e0: a949abe9     	ldp	x9, x10, [sp, #0x98]
 46322e4: f100011f     	cmp	x8, #0x0
 46322e8: 910263eb     	add	x11, sp, #0x98
 46322ec: 9a8b4135     	csel	x21, x9, x11, mi
 46322f0: 7100011f     	cmp	w8, #0x0
 46322f4: 9a884158     	csel	x24, x10, x8, mi
 46322f8: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 46322fc: f81603bf     	stur	xzr, [x29, #-0xa0]
 4632300: 91002b16     	add	x22, x24, #0xa
 4632304: 92800228     	mov	x8, #-0x12              ; =-18
 4632308: f2efffe8     	movk	x8, #0x7fff, lsl #48
 463230c: eb0802df     	cmp	x22, x8
 4632310: 54003128     	b.hi	0x4632934 <_ChromeMain+0x462d698>
 4632314: f1002adf     	cmp	x22, #0xa
 4632318: 540010c9     	b.ls	0x4632530 <_ChromeMain+0x462d294>
 463231c: 927deed9     	and	x25, x22, #0x7ffffffffffffff8
 4632320: d37ffb28     	lsl	x8, x25, #1
 4632324: 91004100     	add	x0, x8, #0x10
 4632328: 96e77410     	bl	0xf368 <_ChromeMain+0xa0cc>
 463232c: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 4632330: cb080328     	sub	x8, x25, x8
 4632334: a9365ba0     	stp	x0, x22, [x29, #-0xa0]
 4632338: f81703a8     	stur	x8, [x29, #-0x90]
 463233c: b004caa8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4632340: 913a3908     	add	x8, x8, #0xe8e
 4632344: 91005016     	add	x22, x0, #0x14
 4632348: eb0002df     	cmp	x22, x0
 463234c: 540013a3     	b.lo	0x46325c0 <_ChromeMain+0x462d324>
 4632350: eb0802df     	cmp	x22, x8
 4632354: fa488002     	ccmp	x0, x8, #0x2, hi
 4632358: 54001349     	b.ls	0x46325c0 <_ChromeMain+0x462d324>
 463235c: 52800de9     	mov	w9, #0x6f               ; =111
 4632360: 72a00409     	movk	w9, #0x20, lsl #16
 4632364: b9001009     	str	w9, [x0, #0x10]
 4632368: 3dc00100     	ldr	q0, [x8]
 463236c: 3d800000     	str	q0, [x0]
 4632370: 8b1806c8     	add	x8, x22, x24, lsl #1
 4632374: eb16011f     	cmp	x8, x22
 4632378: 54001243     	b.lo	0x46325c0 <_ChromeMain+0x462d324>
 463237c: eb1502df     	cmp	x22, x21
 4632380: 54000068     	b.hi	0x463238c <_ChromeMain+0x462d0f0>
 4632384: eb15011f     	cmp	x8, x21
 4632388: 540011c8     	b.hi	0x46325c0 <_ChromeMain+0x462d324>
 463238c: d37ffb02     	lsl	x2, x24, #1
 4632390: aa1603e0     	mov	x0, x22
 4632394: aa1503e1     	mov	x1, x21
 4632398: 94e773cd     	bl	0x800f2cc <_ChromeMain+0x800a030>
 463239c: 78387adf     	strh	wzr, [x22, x24, lsl #1]
 46323a0: aa1c03e0     	mov	x0, x28
 46323a4: 97fced77     	bl	0x456d980 <_ChromeMain+0x45686e4>
 46323a8: aa0003fc     	mov	x28, x0
 46323ac: b9401fe8     	ldr	w8, [sp, #0x1c]
 46323b0: 3707b748     	tbnz	w8, #0x0, 0x4631a98 <_ChromeMain+0x462c7fc>
 46323b4: f9438e68     	ldr	x8, [x19, #0x718]
 46323b8: eb0802ff     	cmp	x23, x8
 46323bc: 54001022     	b.hs	0x46325c0 <_ChromeMain+0x462d324>
 46323c0: 911c4268     	add	x8, x19, #0x710
 46323c4: f9400108     	ldr	x8, [x8]
 46323c8: f8777915     	ldr	x21, [x8, x23, lsl #3]
 46323cc: 90052c18     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46323d0: b4000575     	cbz	x21, 0x463247c <_ChromeMain+0x462d1e0>
 46323d4: f94002a8     	ldr	x8, [x21]
 46323d8: f9402d08     	ldr	x8, [x8, #0x58]
 46323dc: aa1503e0     	mov	x0, x21
 46323e0: d63f0100     	blr	x8
 46323e4: aa0003f6     	mov	x22, x0
 46323e8: 940129f8     	bl	0x467cbc8 <_ChromeMain+0x467792c>
 46323ec: f10002df     	cmp	x22, #0x0
 46323f0: 1a9f07e8     	cset	w8, ne
 46323f4: eb0002df     	cmp	x22, x0
 46323f8: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
 46323fc: 540000c0     	b.eq	0x4632414 <_ChromeMain+0x462d178>
 4632400: f94026d6     	ldr	x22, [x22, #0x48]
 4632404: f10002df     	cmp	x22, #0x0
 4632408: 1a9f07e8     	cset	w8, ne
 463240c: fa4012c4     	ccmp	x22, x0, #0x4, ne
 4632410: 54ffff81     	b.ne	0x4632400 <_ChromeMain+0x462d164>
 4632414: 34000348     	cbz	w8, 0x463247c <_ChromeMain+0x462d1e0>
 4632418: 3952c2a8     	ldrb	w8, [x21, #0x4b0]
 463241c: b9401be9     	ldr	w9, [sp, #0x18]
 4632420: 6b09011f     	cmp	w8, w9
 4632424: 54000080     	b.eq	0x4632434 <_ChromeMain+0x462d198>
 4632428: 3912c2a9     	strb	w9, [x21, #0x4b0]
 463242c: aa1503e0     	mov	x0, x21
 4632430: 96fdbb53     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4632434: f9425ea0     	ldr	x0, [x21, #0x4b8]
 4632438: eb1c001f     	cmp	x0, x28
 463243c: 54000200     	b.eq	0x463247c <_ChromeMain+0x462d1e0>
 4632440: 925e7788     	and	x8, x28, #0xfffffffc00000000
 4632444: f9404709     	ldr	x9, [x24, #0x88]
 4632448: eb09011f     	cmp	x8, x9
 463244c: 54000081     	b.ne	0x463245c <_ChromeMain+0x462d1c0>
 4632450: aa1c03e0     	mov	x0, x28
 4632454: 96e787aa     	bl	0x142fc <_ChromeMain+0xf060>
 4632458: f9425ea0     	ldr	x0, [x21, #0x4b8]
 463245c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4632460: f9404709     	ldr	x9, [x24, #0x88]
 4632464: eb09011f     	cmp	x8, x9
 4632468: 54000041     	b.ne	0x4632470 <_ChromeMain+0x462d1d4>
 463246c: 96e7c174     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4632470: f9025ebc     	str	x28, [x21, #0x4b8]
 4632474: aa1503e0     	mov	x0, x21
 4632478: 96fdbb41     	bl	0x5a117c <_ChromeMain+0x59bee0>
 463247c: f9438e68     	ldr	x8, [x19, #0x718]
 4632480: eb0802ff     	cmp	x23, x8
 4632484: 540009e2     	b.hs	0x46325c0 <_ChromeMain+0x462d324>
 4632488: f9438a68     	ldr	x8, [x19, #0x710]
 463248c: f8777900     	ldr	x0, [x8, x23, lsl #3]
 4632490: 910203e1     	add	x1, sp, #0x80
 4632494: 9708512c     	bl	0x846944 <_ChromeMain+0x8416a8>
 4632498: f9438e68     	ldr	x8, [x19, #0x718]
 463249c: eb0802ff     	cmp	x23, x8
 46324a0: f94007fc     	ldr	x28, [sp, #0x8]
 46324a4: 540008e2     	b.hs	0x46325c0 <_ChromeMain+0x462d324>
 46324a8: 911c4268     	add	x8, x19, #0x710
 46324ac: f9400108     	ldr	x8, [x8]
 46324b0: f8777915     	ldr	x21, [x8, x23, lsl #3]
 46324b4: f94166b6     	ldr	x22, [x21, #0x2c8]
 46324b8: b4000736     	cbz	x22, 0x463259c <_ChromeMain+0x462d300>
 46324bc: 38d773b8     	ldursb	w24, [x29, #-0x89]
 46324c0: 37f80318     	tbnz	w24, #0x1f, 0x4632520 <_ChromeMain+0x462d284>
 46324c4: 3dc01280     	ldr	q0, [x20, #0x40]
 46324c8: 3d8017e0     	str	q0, [sp, #0x50]
 46324cc: f85703a8     	ldur	x8, [x29, #-0x90]
 46324d0: f90033e8     	str	x8, [sp, #0x60]
 46324d4: 910143e1     	add	x1, sp, #0x50
 46324d8: aa1603e0     	mov	x0, x22
 46324dc: 972cecff     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 46324e0: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 46324e4: 36f800a8     	tbz	w8, #0x1f, 0x46324f8 <_ChromeMain+0x462d25c>
 46324e8: f9402be0     	ldr	x0, [sp, #0x50]
 46324ec: f94033e8     	ldr	x8, [sp, #0x60]
 46324f0: d37ff901     	lsl	x1, x8, #1
 46324f4: 96e75a71     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46324f8: f9438e68     	ldr	x8, [x19, #0x718]
 46324fc: eb0802ff     	cmp	x23, x8
 4632500: f94013f6     	ldr	x22, [sp, #0x20]
 4632504: 540005e2     	b.hs	0x46325c0 <_ChromeMain+0x462d324>
 4632508: 911c4268     	add	x8, x19, #0x710
 463250c: f9400108     	ldr	x8, [x8]
 4632510: f8777900     	ldr	x0, [x8, x23, lsl #3]
 4632514: aa1703e1     	mov	x1, x23
 4632518: 94007e3b     	bl	0x4651e04 <_ChromeMain+0x464cb68>
 463251c: 17fffe7d     	b	0x4631f10 <_ChromeMain+0x462cc74>
 4632520: a9760ba1     	ldp	x1, x2, [x29, #-0xa0]
 4632524: 910143e0     	add	x0, sp, #0x50
 4632528: 96e851aa     	bl	0x46bd0 <_ChromeMain+0x41934>
 463252c: 17ffffea     	b	0x46324d4 <_ChromeMain+0x462d238>
 4632530: 381773b6     	sturb	w22, [x29, #-0x89]
 4632534: d10283a0     	sub	x0, x29, #0xa0
 4632538: 17ffff81     	b	0x463233c <_ChromeMain+0x462d0a0>
 463253c: 71002b1f     	cmp	w24, #0xa
 4632540: 54001a20     	b.eq	0x4632884 <_ChromeMain+0x462d5e8>
 4632544: 92401d16     	and	x22, x8, #0xff
 4632548: 11000708     	add	w8, w24, #0x1
 463254c: 12001908     	and	w8, w8, #0x7f
 4632550: 3901ffe8     	strb	w8, [sp, #0x7f]
 4632554: 9101a3f5     	add	x21, sp, #0x68
 4632558: 17ffff57     	b	0x46322b4 <_ChromeMain+0x462d018>
 463255c: 71002b1f     	cmp	w24, #0xa
 4632560: 54001660     	b.eq	0x463282c <_ChromeMain+0x462d590>
 4632564: 92401d16     	and	x22, x8, #0xff
 4632568: 11000708     	add	w8, w24, #0x1
 463256c: 12001908     	and	w8, w8, #0x7f
 4632570: 3901ffe8     	strb	w8, [sp, #0x7f]
 4632574: 9101a3f5     	add	x21, sp, #0x68
 4632578: 17ffff40     	b	0x4632278 <_ChromeMain+0x462cfdc>
 463257c: 71002b1f     	cmp	w24, #0xa
 4632580: 540012a0     	b.eq	0x46327d4 <_ChromeMain+0x462d538>
 4632584: 92401d16     	and	x22, x8, #0xff
 4632588: 11000708     	add	w8, w24, #0x1
 463258c: 12001908     	and	w8, w8, #0x7f
 4632590: 3901ffe8     	strb	w8, [sp, #0x7f]
 4632594: 9101a3f5     	add	x21, sp, #0x68
 4632598: 17ffff29     	b	0x463223c <_ChromeMain+0x462cfa0>
 463259c: 9722ced9     	bl	0xee6100 <_ChromeMain+0xee0e64>
 46325a0: 35002460     	cbnz	w0, 0x4632a2c <_ChromeMain+0x462d790>
 46325a4: aa1503e0     	mov	x0, x21
 46325a8: 9732b02b     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 46325ac: aa0003f6     	mov	x22, x0
 46325b0: f94166a0     	ldr	x0, [x21, #0x2c8]
 46325b4: f90166b6     	str	x22, [x21, #0x2c8]
 46325b8: b4fff820     	cbz	x0, 0x46324bc <_ChromeMain+0x462d220>
 46325bc: 1400010b     	b	0x46329e8 <_ChromeMain+0x462d74c>
 46325c0: d4200020     	brk	#0x1
 46325c4: f100039f     	cmp	x28, #0x0
 46325c8: 1a9f17e9     	cset	w9, eq
 46325cc: 2a080128     	orr	w8, w9, w8
 46325d0: 3707dbc8     	tbnz	w8, #0x0, 0x4632148 <_ChromeMain+0x462ceac>
 46325d4: d10283a8     	sub	x8, x29, #0xa0
 46325d8: aa1c03e0     	mov	x0, x28
 46325dc: b0044641     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 46325e0: 9119ec21     	add	x1, x1, #0x67b
 46325e4: 976f5837     	bl	0x22086c0 <_ChromeMain+0x2203424>
 46325e8: 389773a8     	ldursb	x8, [x29, #-0x89]
 46325ec: f85683a9     	ldur	x9, [x29, #-0x98]
 46325f0: 7100011f     	cmp	w8, #0x0
 46325f4: 9a884135     	csel	x21, x9, x8, mi
 46325f8: b6f800a8     	tbz	x8, #0x3f, 0x463260c <_ChromeMain+0x462d370>
 46325fc: f85603a0     	ldur	x0, [x29, #-0xa0]
 4632600: f85703a8     	ldur	x8, [x29, #-0x90]
 4632604: d37ff901     	lsl	x1, x8, #1
 4632608: 96e75a2c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463260c: b4ffd9f5     	cbz	x21, 0x4632148 <_ChromeMain+0x462ceac>
 4632610: d102e3a8     	sub	x8, x29, #0xb8
 4632614: aa1c03e0     	mov	x0, x28
 4632618: b0044641     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 463261c: 9119ec21     	add	x1, x1, #0x67b
 4632620: 976f5828     	bl	0x22086c0 <_ChromeMain+0x2203424>
 4632624: 3895f3a8     	ldursb	x8, [x29, #-0xa1]
 4632628: a974aba9     	ldp	x9, x10, [x29, #-0xb8]
 463262c: f100011f     	cmp	x8, #0x0
 4632630: d102e3ab     	sub	x11, x29, #0xb8
 4632634: 9a8b4120     	csel	x0, x9, x11, mi
 4632638: 7100011f     	cmp	w8, #0x0
 463263c: 9a884141     	csel	x1, x10, x8, mi
 4632640: d10283a8     	sub	x8, x29, #0xa0
 4632644: 9725c1b1     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4632648: 385983a8     	ldurb	w8, [x29, #-0x68]
 463264c: 35000128     	cbnz	w8, 0x4632670 <_ChromeMain+0x462d3d4>
 4632650: 3dc01280     	ldr	q0, [x20, #0x40]
 4632654: 3d801a80     	str	q0, [x20, #0x60]
 4632658: f85703a8     	ldur	x8, [x29, #-0x90]
 463265c: f81903a8     	stur	x8, [x29, #-0x70]
 4632660: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 4632664: f81603bf     	stur	xzr, [x29, #-0xa0]
 4632668: 381983b6     	sturb	w22, [x29, #-0x68]
 463266c: 1400000d     	b	0x46326a0 <_ChromeMain+0x462d404>
 4632670: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4632674: 36f800a8     	tbz	w8, #0x1f, 0x4632688 <_ChromeMain+0x462d3ec>
 4632678: f85803a0     	ldur	x0, [x29, #-0x80]
 463267c: f85903a8     	ldur	x8, [x29, #-0x70]
 4632680: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4632684: 96e75a0d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4632688: 3dc01280     	ldr	q0, [x20, #0x40]
 463268c: 3d801a80     	str	q0, [x20, #0x60]
 4632690: f85703a8     	ldur	x8, [x29, #-0x90]
 4632694: f81903a8     	stur	x8, [x29, #-0x70]
 4632698: 381773bf     	sturb	wzr, [x29, #-0x89]
 463269c: 381603bf     	sturb	wzr, [x29, #-0xa0]
 46326a0: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 46326a4: 36ffd528     	tbz	w8, #0x1f, 0x4632148 <_ChromeMain+0x462ceac>
 46326a8: f85483a0     	ldur	x0, [x29, #-0xb8]
 46326ac: f85583a8     	ldur	x8, [x29, #-0xa8]
 46326b0: d37ff901     	lsl	x1, x8, #1
 46326b4: 96e75a01     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46326b8: 17fffea4     	b	0x4632148 <_ChromeMain+0x462ceac>
 46326bc: fd46a260     	ldr	d0, [x19, #0xd40]
 46326c0: 1e6e1001     	fmov	d1, #1.00000000
 46326c4: 1e612000     	fcmp	d0, d1
 46326c8: 1a9f17e8     	cset	w8, eq
 46326cc: 17fffca5     	b	0x4631960 <_ChromeMain+0x462c6c4>
 46326d0: 35001648     	cbnz	w8, 0x4632998 <_ChromeMain+0x462d6fc>
 46326d4: 3dc01280     	ldr	q0, [x20, #0x40]
 46326d8: 3d801a80     	str	q0, [x20, #0x60]
 46326dc: f85703a8     	ldur	x8, [x29, #-0x90]
 46326e0: f81903a8     	stur	x8, [x29, #-0x70]
 46326e4: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 46326e8: f81603bf     	stur	xzr, [x29, #-0xa0]
 46326ec: 381983b6     	sturb	w22, [x29, #-0x68]
 46326f0: 17fffe63     	b	0x463207c <_ChromeMain+0x462cde0>
 46326f4: d10203a0     	sub	x0, x29, #0x80
 46326f8: 940129ca     	bl	0x467ce20 <_ChromeMain+0x4677b84>
 46326fc: 17fffdf2     	b	0x4631ec4 <_ChromeMain+0x462cc28>
 4632700: 92800229     	mov	x9, #-0x12              ; =-18
 4632704: f2efffe9     	movk	x9, #0x7fff, lsl #48
 4632708: eb09011f     	cmp	x8, x9
 463270c: 54001148     	b.hi	0x4632934 <_ChromeMain+0x462d698>
 4632710: d37ffac9     	lsl	x9, x22, #1
 4632714: eb16051f     	cmp	x8, x22, lsl #1
 4632718: 9a898108     	csel	x8, x8, x9, hi
 463271c: 92800309     	mov	x9, #-0x19              ; =-25
 4632720: f2e7ffe9     	movk	x9, #0x3fff, lsl #48
 4632724: eb0902df     	cmp	x22, x9
 4632728: 54001a48     	b.hi	0x4632a70 <_ChromeMain+0x462d7d4>
 463272c: 927df108     	and	x8, x8, #0xfffffffffffffff8
 4632730: 91002119     	add	x25, x8, #0x8
 4632734: b7f80219     	tbnz	x25, #0x3f, 0x4632774 <_ChromeMain+0x462d4d8>
 4632738: 140000cc     	b	0x4632a68 <_ChromeMain+0x462d7cc>
 463273c: 92800229     	mov	x9, #-0x12              ; =-18
 4632740: f2efffe9     	movk	x9, #0x7fff, lsl #48
 4632744: eb09011f     	cmp	x8, x9
 4632748: 54000f68     	b.hi	0x4632934 <_ChromeMain+0x462d698>
 463274c: d37ffac9     	lsl	x9, x22, #1
 4632750: eb16051f     	cmp	x8, x22, lsl #1
 4632754: 9a898108     	csel	x8, x8, x9, hi
 4632758: 92800309     	mov	x9, #-0x19              ; =-25
 463275c: f2e7ffe9     	movk	x9, #0x3fff, lsl #48
 4632760: eb0902df     	cmp	x22, x9
 4632764: 54001748     	b.hi	0x4632a4c <_ChromeMain+0x462d7b0>
 4632768: 927df108     	and	x8, x8, #0xfffffffffffffff8
 463276c: 91002119     	add	x25, x8, #0x8
 4632770: b6f816b9     	tbz	x25, #0x3f, 0x4632a44 <_ChromeMain+0x462d7a8>
 4632774: 94174e2b     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 4632778: 92800229     	mov	x9, #-0x12              ; =-18
 463277c: f2efffe9     	movk	x9, #0x7fff, lsl #48
 4632780: eb09011f     	cmp	x8, x9
 4632784: 54000d88     	b.hi	0x4632934 <_ChromeMain+0x462d698>
 4632788: d37ffac9     	lsl	x9, x22, #1
 463278c: eb16051f     	cmp	x8, x22, lsl #1
 4632790: 9a898108     	csel	x8, x8, x9, hi
 4632794: 92800309     	mov	x9, #-0x19              ; =-25
 4632798: f2e7ffe9     	movk	x9, #0x3fff, lsl #48
 463279c: eb0902df     	cmp	x22, x9
 46327a0: 540000c8     	b.hi	0x46327b8 <_ChromeMain+0x462d51c>
 46327a4: 927df108     	and	x8, x8, #0xfffffffffffffff8
 46327a8: 91002119     	add	x25, x8, #0x8
 46327ac: b7fffe59     	tbnz	x25, #0x3f, 0x4632774 <_ChromeMain+0x462d4d8>
 46327b0: d37ffb20     	lsl	x0, x25, #1
 46327b4: 14000003     	b	0x46327c0 <_ChromeMain+0x462d524>
 46327b8: b27cebf9     	mov	x25, #0x7ffffffffffffff0 ; =9223372036854775792
 46327bc: 928003e0     	mov	x0, #-0x20              ; =-32
 46327c0: 96e772ea     	bl	0xf368 <_ChromeMain+0xa0cc>
 46327c4: aa0003f5     	mov	x21, x0
 46327c8: f94037e1     	ldr	x1, [sp, #0x68]
 46327cc: b5000696     	cbnz	x22, 0x463289c <_ChromeMain+0x462d600>
 46327d0: 14000054     	b	0x4632920 <_ChromeMain+0x462d684>
 46327d4: 52800600     	mov	w0, #0x30               ; =48
 46327d8: 96e772e4     	bl	0xf368 <_ChromeMain+0xa0cc>
 46327dc: aa0003f5     	mov	x21, x0
 46327e0: 9101a3e1     	add	x1, sp, #0x68
 46327e4: 52800319     	mov	w25, #0x18              ; =24
 46327e8: 52800156     	mov	w22, #0xa               ; =10
 46327ec: 8b1606a8     	add	x8, x21, x22, lsl #1
 46327f0: eb15011f     	cmp	x8, x21
 46327f4: 54ffee63     	b.lo	0x46325c0 <_ChromeMain+0x462d324>
 46327f8: eb15003f     	cmp	x1, x21
 46327fc: 54000063     	b.lo	0x4632808 <_ChromeMain+0x462d56c>
 4632800: eb08003f     	cmp	x1, x8
 4632804: 54ffede3     	b.lo	0x46325c0 <_ChromeMain+0x462d324>
 4632808: d37ffac2     	lsl	x2, x22, #1
 463280c: aa1503e0     	mov	x0, x21
 4632810: 94e772af     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4632814: 37380678     	tbnz	w24, #0x7, 0x46328e0 <_ChromeMain+0x462d644>
 4632818: b2410328     	orr	x8, x25, #0x8000000000000000
 463281c: f90037f5     	str	x21, [sp, #0x68]
 4632820: f9003fe8     	str	x8, [sp, #0x78]
 4632824: 9102c3f4     	add	x20, sp, #0xb0
 4632828: 17fffe83     	b	0x4632234 <_ChromeMain+0x462cf98>
 463282c: 52800600     	mov	w0, #0x30               ; =48
 4632830: 96e772ce     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632834: aa0003f5     	mov	x21, x0
 4632838: 9101a3e1     	add	x1, sp, #0x68
 463283c: 52800319     	mov	w25, #0x18              ; =24
 4632840: 52800156     	mov	w22, #0xa               ; =10
 4632844: 8b1606a8     	add	x8, x21, x22, lsl #1
 4632848: eb15011f     	cmp	x8, x21
 463284c: 54ffeba3     	b.lo	0x46325c0 <_ChromeMain+0x462d324>
 4632850: eb15003f     	cmp	x1, x21
 4632854: 54000063     	b.lo	0x4632860 <_ChromeMain+0x462d5c4>
 4632858: eb08003f     	cmp	x1, x8
 463285c: 54ffeb23     	b.lo	0x46325c0 <_ChromeMain+0x462d324>
 4632860: d37ffac2     	lsl	x2, x22, #1
 4632864: aa1503e0     	mov	x0, x21
 4632868: 94e77299     	bl	0x800f2cc <_ChromeMain+0x800a030>
 463286c: 37380498     	tbnz	w24, #0x7, 0x46328fc <_ChromeMain+0x462d660>
 4632870: b2410328     	orr	x8, x25, #0x8000000000000000
 4632874: f90037f5     	str	x21, [sp, #0x68]
 4632878: f9003fe8     	str	x8, [sp, #0x78]
 463287c: 9102c3f4     	add	x20, sp, #0xb0
 4632880: 17fffe7c     	b	0x4632270 <_ChromeMain+0x462cfd4>
 4632884: 52800600     	mov	w0, #0x30               ; =48
 4632888: 96e772b8     	bl	0xf368 <_ChromeMain+0xa0cc>
 463288c: aa0003f5     	mov	x21, x0
 4632890: 9101a3e1     	add	x1, sp, #0x68
 4632894: 52800319     	mov	w25, #0x18              ; =24
 4632898: 52800156     	mov	w22, #0xa               ; =10
 463289c: 8b1606a8     	add	x8, x21, x22, lsl #1
 46328a0: eb15011f     	cmp	x8, x21
 46328a4: 54ffe8e3     	b.lo	0x46325c0 <_ChromeMain+0x462d324>
 46328a8: eb15003f     	cmp	x1, x21
 46328ac: 54000063     	b.lo	0x46328b8 <_ChromeMain+0x462d61c>
 46328b0: eb08003f     	cmp	x1, x8
 46328b4: 54ffe863     	b.lo	0x46325c0 <_ChromeMain+0x462d324>
 46328b8: d37ffac2     	lsl	x2, x22, #1
 46328bc: aa1503e0     	mov	x0, x21
 46328c0: 94e77283     	bl	0x800f2cc <_ChromeMain+0x800a030>
 46328c4: 373802b8     	tbnz	w24, #0x7, 0x4632918 <_ChromeMain+0x462d67c>
 46328c8: b2410328     	orr	x8, x25, #0x8000000000000000
 46328cc: f90037f5     	str	x21, [sp, #0x68]
 46328d0: f9003fe8     	str	x8, [sp, #0x78]
 46328d4: 9102c3f4     	add	x20, sp, #0xb0
 46328d8: 17fffe75     	b	0x46322ac <_ChromeMain+0x462d010>
 46328dc: 941736ac     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 46328e0: f94037e1     	ldr	x1, [sp, #0x68]
 46328e4: f9403ffa     	ldr	x26, [sp, #0x78]
 46328e8: d37ffb48     	lsl	x8, x26, #1
 46328ec: aa0103e0     	mov	x0, x1
 46328f0: aa0803e1     	mov	x1, x8
 46328f4: 96e75971     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46328f8: 17ffffc8     	b	0x4632818 <_ChromeMain+0x462d57c>
 46328fc: f94037e1     	ldr	x1, [sp, #0x68]
 4632900: f9403ffa     	ldr	x26, [sp, #0x78]
 4632904: d37ffb48     	lsl	x8, x26, #1
 4632908: aa0103e0     	mov	x0, x1
 463290c: aa0803e1     	mov	x1, x8
 4632910: 96e7596a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4632914: 17ffffd7     	b	0x4632870 <_ChromeMain+0x462d5d4>
 4632918: f94037e1     	ldr	x1, [sp, #0x68]
 463291c: f9403ffa     	ldr	x26, [sp, #0x78]
 4632920: d37ffb48     	lsl	x8, x26, #1
 4632924: aa0103e0     	mov	x0, x1
 4632928: aa0803e1     	mov	x1, x8
 463292c: 96e75963     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4632930: 17ffffe6     	b	0x46328c8 <_ChromeMain+0x462d62c>
 4632934: 941bc61d     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 4632938: 97f28370     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 463293c: 17fffcd8     	b	0x4631c9c <_ChromeMain+0x462ca00>
 4632940: d4200000     	brk	#0
 4632944: d4400000     	hlt	#0
 4632948: d4200020     	brk	#0x1
 463294c: d4200000     	brk	#0
 4632950: d4400000     	hlt	#0
 4632954: d4200020     	brk	#0x1
 4632958: f85803a0     	ldur	x0, [x29, #-0x80]
 463295c: f85903a8     	ldur	x8, [x29, #-0x70]
 4632960: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4632964: 96e75955     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4632968: 14000003     	b	0x4632974 <_ChromeMain+0x462d6d8>
 463296c: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4632970: 37ffff48     	tbnz	w8, #0x1f, 0x4632958 <_ChromeMain+0x462d6bc>
 4632974: 9102c3f4     	add	x20, sp, #0xb0
 4632978: 3dc01280     	ldr	q0, [x20, #0x40]
 463297c: 3d801a80     	str	q0, [x20, #0x60]
 4632980: f85703a8     	ldur	x8, [x29, #-0x90]
 4632984: f81903a8     	stur	x8, [x29, #-0x70]
 4632988: 381773bf     	sturb	wzr, [x29, #-0x89]
 463298c: 381603bf     	sturb	wzr, [x29, #-0xa0]
 4632990: 52800036     	mov	w22, #0x1               ; =1
 4632994: 17fffdba     	b	0x463207c <_ChromeMain+0x462cde0>
 4632998: 38d973a8     	ldursb	w8, [x29, #-0x69]
 463299c: 36f800a8     	tbz	w8, #0x1f, 0x46329b0 <_ChromeMain+0x462d714>
 46329a0: f85803a0     	ldur	x0, [x29, #-0x80]
 46329a4: f85903a8     	ldur	x8, [x29, #-0x70]
 46329a8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46329ac: 96e75943     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46329b0: 381983bf     	sturb	wzr, [x29, #-0x68]
 46329b4: 52800036     	mov	w22, #0x1               ; =1
 46329b8: 9102c3f4     	add	x20, sp, #0xb0
 46329bc: 17fffdb0     	b	0x463207c <_ChromeMain+0x462cde0>
 46329c0: f9400008     	ldr	x8, [x0]
 46329c4: f9400508     	ldr	x8, [x8, #0x8]
 46329c8: d63f0100     	blr	x8
 46329cc: f9416775     	ldr	x21, [x27, #0x2c8]
 46329d0: 17fffd12     	b	0x4631e18 <_ChromeMain+0x462cb7c>
 46329d4: 52803600     	mov	w0, #0x1b0              ; =432
 46329d8: 96e77264     	bl	0xf368 <_ChromeMain+0xa0cc>
 46329dc: aa1b03e1     	mov	x1, x27
 46329e0: 9722cc68     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 46329e4: 17fffc16     	b	0x4631a3c <_ChromeMain+0x462c7a0>
 46329e8: f9400008     	ldr	x8, [x0]
 46329ec: f9400508     	ldr	x8, [x8, #0x8]
 46329f0: d63f0100     	blr	x8
 46329f4: f94166b6     	ldr	x22, [x21, #0x2c8]
 46329f8: 17fffeb1     	b	0x46324bc <_ChromeMain+0x462d220>
 46329fc: f9400109     	ldr	x9, [x8]
 4632a00: f9400529     	ldr	x9, [x9, #0x8]
 4632a04: aa0803e0     	mov	x0, x8
 4632a08: d63f0120     	blr	x9
 4632a0c: f9416760     	ldr	x0, [x27, #0x2c8]
 4632a10: 17fffcfb     	b	0x4631dfc <_ChromeMain+0x462cb60>
 4632a14: 52803600     	mov	w0, #0x1b0              ; =432
 4632a18: 96e77254     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632a1c: aa0003f5     	mov	x21, x0
 4632a20: aa1b03e1     	mov	x1, x27
 4632a24: 9722cc57     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4632a28: 17fffbfd     	b	0x4631a1c <_ChromeMain+0x462c780>
 4632a2c: 52803600     	mov	w0, #0x1b0              ; =432
 4632a30: 96e7724e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632a34: aa0003f6     	mov	x22, x0
 4632a38: aa1503e1     	mov	x1, x21
 4632a3c: 9722cc51     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4632a40: 17fffedc     	b	0x46325b0 <_ChromeMain+0x462d314>
 4632a44: d37ffb20     	lsl	x0, x25, #1
 4632a48: 14000003     	b	0x4632a54 <_ChromeMain+0x462d7b8>
 4632a4c: b27cebf9     	mov	x25, #0x7ffffffffffffff0 ; =9223372036854775792
 4632a50: 928003e0     	mov	x0, #-0x20              ; =-32
 4632a54: 96e77245     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632a58: aa0003f5     	mov	x21, x0
 4632a5c: f94037e1     	ldr	x1, [sp, #0x68]
 4632a60: b5ffec76     	cbnz	x22, 0x46327ec <_ChromeMain+0x462d550>
 4632a64: 17ffffa1     	b	0x46328e8 <_ChromeMain+0x462d64c>
 4632a68: d37ffb20     	lsl	x0, x25, #1
 4632a6c: 14000003     	b	0x4632a78 <_ChromeMain+0x462d7dc>
 4632a70: b27cebf9     	mov	x25, #0x7ffffffffffffff0 ; =9223372036854775792
 4632a74: 928003e0     	mov	x0, #-0x20              ; =-32
 4632a78: 96e7723c     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632a7c: aa0003f5     	mov	x21, x0
 4632a80: f94037e1     	ldr	x1, [sp, #0x68]
 4632a84: b5ffee16     	cbnz	x22, 0x4632844 <_ChromeMain+0x462d5a8>
 4632a88: 17ffff9f     	b	0x4632904 <_ChromeMain+0x462d668>
 4632a8c: d10183ff     	sub	sp, sp, #0x60
 4632a90: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4632a94: a90357f6     	stp	x22, x21, [sp, #0x30]
 4632a98: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4632a9c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4632aa0: 910143fd     	add	x29, sp, #0x50
 4632aa4: aa0003f4     	mov	x20, x0
 4632aa8: 395d6008     	ldrb	w8, [x0, #0x758]
 4632aac: 35000b88     	cbnz	w8, 0x4632c1c <_ChromeMain+0x462d980>
 4632ab0: 52800038     	mov	w24, #0x1               ; =1
 4632ab4: 391d6298     	strb	w24, [x20, #0x758]
 4632ab8: b004c4c0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4632abc: 91375000     	add	x0, x0, #0xdd4
 4632ac0: b004c4c1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4632ac4: 912c7821     	add	x1, x1, #0xb1e
 4632ac8: 910003e8     	mov	x8, sp
 4632acc: 5286a242     	mov	w2, #0x3512             ; =13586
 4632ad0: 96e8786c     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4632ad4: 52800600     	mov	w0, #0x30               ; =48
 4632ad8: 96e77224     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632adc: aa0003f3     	mov	x19, x0
 4632ae0: 90fecc68     	adrp	x8, 0x1fbe000 <_ChromeMain+0x1fb8d64>
 4632ae4: 91332108     	add	x8, x8, #0xcc8
 4632ae8: b9000018     	str	w24, [x0]
 4632aec: d0ff90a9     	adrp	x9, 0x3848000 <_ChromeMain+0x3842d64>
 4632af0: 913f0129     	add	x9, x9, #0xfc0
 4632af4: f0fef957     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 4632af8: 912c02f7     	add	x23, x23, #0xb00
 4632afc: a900a408     	stp	x8, x9, [x0, #0x8]
