
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425ee14: d10283ff     	sub	sp, sp, #0xa0
 425ee18: a9084ff4     	stp	x20, x19, [sp, #0x80]
 425ee1c: a9097bfd     	stp	x29, x30, [sp, #0x90]
 425ee20: 910243fd     	add	x29, sp, #0x90
 425ee24: 39805c08     	ldrsb	x8, [x0, #0x17]
 425ee28: a9402809     	ldp	x9, x10, [x0]
 425ee2c: f100011f     	cmp	x8, #0x0
 425ee30: 9a804121     	csel	x1, x9, x0, mi
 425ee34: f9003bff     	str	xzr, [sp, #0x70]
 425ee38: 6f00e400     	movi.2d	v0, #0000000000000000
 425ee3c: ad0283e0     	stp	q0, q0, [sp, #0x50]
 425ee40: ad0183e0     	stp	q0, q0, [sp, #0x30]
 425ee44: ad0083e0     	stp	q0, q0, [sp, #0x10]
 425ee48: 3d8003e0     	str	q0, [sp]
 425ee4c: 7100011f     	cmp	w8, #0x0
 425ee50: 9a884142     	csel	x2, x10, x8, mi
 425ee54: 910003f4     	mov	x20, sp
 425ee58: 910003e0     	mov	x0, sp
 425ee5c: 970444de     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425ee60: 394063e8     	ldrb	w8, [sp, #0x18]
 425ee64: 34000728     	cbz	w8, 0x425ef48 <_ChromeMain+0x4259cac>
 425ee68: 910003e0     	mov	x0, sp
 425ee6c: 9733b4cc     	bl	0xf4c19c <_ChromeMain+0xf46f00>
 425ee70: 340006c0     	cbz	w0, 0x425ef48 <_ChromeMain+0x4259cac>
 425ee74: b9403fe8     	ldr	w8, [sp, #0x3c]
 425ee78: 7100051f     	cmp	w8, #0x1
 425ee7c: 5400088b     	b.lt	0x425ef8c <_ChromeMain+0x4259cf0>
 425ee80: 39405fea     	ldrb	w10, [sp, #0x17]
 425ee84: 13001d49     	sxtb	w9, w10
 425ee88: f94007eb     	ldr	x11, [sp, #0x8]
 425ee8c: 7100013f     	cmp	w9, #0x0
 425ee90: 9a8a416b     	csel	x11, x11, x10, mi
 425ee94: b9803bea     	ldrsw	x10, [sp, #0x38]
 425ee98: eb0a016b     	subs	x11, x11, x10
 425ee9c: 54000ca3     	b.lo	0x425f030 <_ChromeMain+0x4259d94>
 425eea0: f94003ec     	ldr	x12, [sp]
 425eea4: 7100013f     	cmp	w9, #0x0
 425eea8: 910003e9     	mov	x9, sp
 425eeac: 9a89418c     	csel	x12, x12, x9, mi
 425eeb0: eb08017f     	cmp	x11, x8
 425eeb4: 9a883169     	csel	x9, x11, x8, lo
 425eeb8: 8b0a0188     	add	x8, x12, x10
 425eebc: b9404fea     	ldr	w10, [sp, #0x4c]
 425eec0: 7100055f     	cmp	w10, #0x1
 425eec4: 540006ab     	b.lt	0x425ef98 <_ChromeMain+0x4259cfc>
 425eec8: 39405fec     	ldrb	w12, [sp, #0x17]
 425eecc: 13001d8b     	sxtb	w11, w12
 425eed0: f94007ed     	ldr	x13, [sp, #0x8]
 425eed4: 7100017f     	cmp	w11, #0x0
 425eed8: 9a8c41ad     	csel	x13, x13, x12, mi
 425eedc: b9804bec     	ldrsw	x12, [sp, #0x48]
 425eee0: eb0c01ad     	subs	x13, x13, x12
 425eee4: 54000a63     	b.lo	0x425f030 <_ChromeMain+0x4259d94>
 425eee8: f94003ee     	ldr	x14, [sp]
 425eeec: 7100017f     	cmp	w11, #0x0
 425eef0: 910003eb     	mov	x11, sp
 425eef4: 9a8b41ce     	csel	x14, x14, x11, mi
 425eef8: eb0a01bf     	cmp	x13, x10
 425eefc: 9a8a31ab     	csel	x11, x13, x10, lo
 425ef00: 8b0c01ca     	add	x10, x14, x12
 425ef04: f100453f     	cmp	x9, #0x11
 425ef08: 540004e0     	b.eq	0x425efa4 <_ChromeMain+0x4259d08>
 425ef0c: f100353f     	cmp	x9, #0xd
 425ef10: 540001c1     	b.ne	0x425ef48 <_ChromeMain+0x4259cac>
 425ef14: f9400109     	ldr	x9, [x8]
 425ef18: f8405108     	ldur	x8, [x8, #0x5]
 425ef1c: d28cae0c     	mov	x12, #0x6570            ; =25968
 425ef20: f2ae0e4c     	movk	x12, #0x7072, lsl #16
 425ef24: f2ccad8c     	movk	x12, #0x656c, lsl #32
 425ef28: f2ed2f0c     	movk	x12, #0x6978, lsl #48
 425ef2c: eb0c013f     	cmp	x9, x12
 425ef30: d28f0ca9     	mov	x9, #0x7865             ; =30821
 425ef34: f2ae8d29     	movk	x9, #0x7469, lsl #16
 425ef38: f2c5cf29     	movk	x9, #0x2e79, lsl #32
 425ef3c: f2ed2c29     	movk	x9, #0x6961, lsl #48
 425ef40: fa490100     	ccmp	x8, x9, #0x0, eq
 425ef44: 540004c0     	b.eq	0x425efdc <_ChromeMain+0x4259d40>
 425ef48: 52800013     	mov	w19, #0x0               ; =0
 425ef4c: 9101c280     	add	x0, x20, #0x70
 425ef50: d2800001     	mov	x1, #0x0                ; =0
 425ef54: 96f72359     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425ef58: 91008280     	add	x0, x20, #0x20
 425ef5c: 96f72347     	bl	0x27c78 <_ChromeMain+0x229dc>
 425ef60: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 425ef64: 36f800a8     	tbz	w8, #0x1f, 0x425ef78 <_ChromeMain+0x4259cdc>
 425ef68: f94003e0     	ldr	x0, [sp]
 425ef6c: f9400be8     	ldr	x8, [sp, #0x10]
 425ef70: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ef74: 96f6a7d1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ef78: aa1303e0     	mov	x0, x19
 425ef7c: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 425ef80: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 425ef84: 910283ff     	add	sp, sp, #0xa0
 425ef88: d65f03c0     	ret
 425ef8c: d2800009     	mov	x9, #0x0                ; =0
 425ef90: d2800008     	mov	x8, #0x0                ; =0
 425ef94: 17ffffca     	b	0x425eebc <_ChromeMain+0x4259c20>
 425ef98: d280000b     	mov	x11, #0x0               ; =0
 425ef9c: d280000a     	mov	x10, #0x0               ; =0
 425efa0: 17ffffd9     	b	0x425ef04 <_ChromeMain+0x4259c68>
 425efa4: a9403109     	ldp	x9, x12, [x8]
 425efa8: 39404108     	ldrb	w8, [x8, #0x10]
 425efac: 7101a51f     	cmp	w8, #0x69
 425efb0: d28cad88     	mov	x8, #0x656c             ; =25964
 425efb4: f2ad2f08     	movk	x8, #0x6978, lsl #16
 425efb8: f2cf2e88     	movk	x8, #0x7974, lsl #32
 425efbc: f2ec25c8     	movk	x8, #0x612e, lsl #48
 425efc0: fa480180     	ccmp	x12, x8, #0x0, eq
 425efc4: d28eeee8     	mov	x8, #0x7777             ; =30583
 425efc8: f2a5cee8     	movk	x8, #0x2e77, lsl #16
 425efcc: f2ccae08     	movk	x8, #0x6570, lsl #32
 425efd0: f2ee0e48     	movk	x8, #0x7072, lsl #48
 425efd4: fa480120     	ccmp	x9, x8, #0x0, eq
 425efd8: 54fffb81     	b.ne	0x425ef48 <_ChromeMain+0x4259cac>
 425efdc: f100217f     	cmp	x11, #0x8
 425efe0: 540001a0     	b.eq	0x425f014 <_ChromeMain+0x4259d78>
 425efe4: f1001d7f     	cmp	x11, #0x7
 425efe8: 54fffb01     	b.ne	0x425ef48 <_ChromeMain+0x4259cac>
 425efec: b9400148     	ldr	w8, [x10]
 425eff0: b8403149     	ldur	w9, [x10, #0x3]
 425eff4: 528c45ea     	mov	w10, #0x622f            ; =25135
 425eff8: 72ad05ea     	movk	w10, #0x682f, lsl #16
 425effc: 6b0a011f     	cmp	w8, w10
 425f000: 528ded08     	mov	w8, #0x6f68             ; =28520
 425f004: 72acada8     	movk	w8, #0x656d, lsl #16
 425f008: 7a480120     	ccmp	w9, w8, #0x0, eq
 425f00c: 1a9f17f3     	cset	w19, eq
 425f010: 17ffffcf     	b	0x425ef4c <_ChromeMain+0x4259cb0>
 425f014: f9400148     	ldr	x8, [x10]
 425f018: d28c45e9     	mov	x9, #0x622f             ; =25135
 425f01c: f2ad05e9     	movk	x9, #0x682f, lsl #16
 425f020: f2cdade9     	movk	x9, #0x6d6f, lsl #32
 425f024: f2e5eca9     	movk	x9, #0x2f65, lsl #48
 425f028: eb09011f     	cmp	x8, x9
 425f02c: 17fffff8     	b	0x425f00c <_ChromeMain+0x4259d70>
 425f030: b004ac20     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 425f034: 91376000     	add	x0, x0, #0xdd8
 425f038: 942684a7     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
 425f03c: f9401808     	ldr	x8, [x0, #0x30]
 425f040: b4000068     	cbz	x8, 0x425f04c <_ChromeMain+0x4259db0>
 425f044: 19404108     	ldapurb	w8, [x8, #0x4]
 425f048: 34000048     	cbz	w8, 0x425f050 <_ChromeMain+0x4259db4>
 425f04c: d65f03c0     	ret
 425f050: f9401c08     	ldr	x8, [x0, #0x38]
 425f054: b4ffffc8     	cbz	x8, 0x425f04c <_ChromeMain+0x4259db0>
 425f058: f9401809     	ldr	x9, [x0, #0x30]
 425f05c: b4000b09     	cbz	x9, 0x425f1bc <_ChromeMain+0x4259f20>
 425f060: a9422808     	ldp	x8, x10, [x0, #0x20]
 425f064: 19404129     	ldapurb	w9, [x9, #0x4]
 425f068: 35000aa9     	cbnz	w9, 0x425f1bc <_ChromeMain+0x4259f20>
 425f06c: d10483ff     	sub	sp, sp, #0x120
 425f070: a9106ffc     	stp	x28, x27, [sp, #0x100]
 425f074: a9117bfd     	stp	x29, x30, [sp, #0x110]
 425f078: 910443fd     	add	x29, sp, #0x110
 425f07c: 910003e9     	mov	x9, sp
 425f080: f9401c0b     	ldr	x11, [x0, #0x38]
 425f084: 8b8a0560     	add	x0, x11, x10, asr #1
 425f088: 3600006a     	tbz	w10, #0x0, 0x425f094 <_ChromeMain+0x4259df8>
 425f08c: f940000a     	ldr	x10, [x0]
 425f090: f8684948     	ldr	x8, [x10, w8, uxtw]
 425f094: 3940002a     	ldrb	w10, [x1]
 425f098: 390003ea     	strb	w10, [sp]
 425f09c: 3cc08020     	ldur	q0, [x1, #0x8]
 425f0a0: 3c8083e0     	stur	q0, [sp, #0x8]
 425f0a4: f9400c2a     	ldr	x10, [x1, #0x18]
 425f0a8: f9000fea     	str	x10, [sp, #0x18]
 425f0ac: 6f00e400     	movi.2d	v0, #0000000000000000
 425f0b0: 3d800420     	str	q0, [x1, #0x10]
 425f0b4: f900043f     	str	xzr, [x1, #0x8]
 425f0b8: 3dc00821     	ldr	q1, [x1, #0x20]
 425f0bc: 3d800be1     	str	q1, [sp, #0x20]
 425f0c0: f940182a     	ldr	x10, [x1, #0x30]
 425f0c4: f9001bea     	str	x10, [sp, #0x30]
 425f0c8: 3c828020     	stur	q0, [x1, #0x28]
 425f0cc: f900103f     	str	xzr, [x1, #0x20]
 425f0d0: 3cc38021     	ldur	q1, [x1, #0x38]
 425f0d4: 3c8383e1     	stur	q1, [sp, #0x38]
 425f0d8: 3c838020     	stur	q0, [x1, #0x38]
 425f0dc: a944ac2a     	ldp	x10, x11, [x1, #0x48]
 425f0e0: a904fc3f     	stp	xzr, xzr, [x1, #0x48]
 425f0e4: a904afea     	stp	x10, x11, [sp, #0x48]
 425f0e8: 3cc58021     	ldur	q1, [x1, #0x58]
 425f0ec: 3c858020     	stur	q0, [x1, #0x58]
 425f0f0: 3c8583e1     	stur	q1, [sp, #0x58]
 425f0f4: f940342a     	ldr	x10, [x1, #0x68]
 425f0f8: f900343f     	str	xzr, [x1, #0x68]
 425f0fc: f90037ea     	str	x10, [sp, #0x68]
 425f100: 3dc01c21     	ldr	q1, [x1, #0x70]
 425f104: 3d801c20     	str	q0, [x1, #0x70]
 425f108: 3d801fe1     	str	q1, [sp, #0x70]
 425f10c: f940402a     	ldr	x10, [x1, #0x80]
 425f110: f900403f     	str	xzr, [x1, #0x80]
 425f114: 3cc88021     	ldur	q1, [x1, #0x88]
 425f118: 3c888020     	stur	q0, [x1, #0x88]
 425f11c: 3c888121     	stur	q1, [x9, #0x88]
 425f120: f9404c2b     	ldr	x11, [x1, #0x98]
 425f124: f9004c3f     	str	xzr, [x1, #0x98]
 425f128: f90043ea     	str	x10, [sp, #0x80]
 425f12c: f9004feb     	str	x11, [sp, #0x98]
 425f130: 3dc02821     	ldr	q1, [x1, #0xa0]
 425f134: 3d802820     	str	q0, [x1, #0xa0]
 425f138: 3d802be1     	str	q1, [sp, #0xa0]
 425f13c: f940582a     	ldr	x10, [x1, #0xb0]
 425f140: f900583f     	str	xzr, [x1, #0xb0]
 425f144: f9005bea     	str	x10, [sp, #0xb0]
 425f148: 3ccb8021     	ldur	q1, [x1, #0xb8]
 425f14c: 3c8b8020     	stur	q0, [x1, #0xb8]
 425f150: 3c8b8121     	stur	q1, [x9, #0xb8]
 425f154: 390323ff     	strb	wzr, [sp, #0xc8]
 425f158: 3903e3ff     	strb	wzr, [sp, #0xf8]
 425f15c: 3943e029     	ldrb	w9, [x1, #0xf8]
 425f160: 340001e9     	cbz	w9, 0x425f19c <_ChromeMain+0x4259f00>
 425f164: 910003e9     	mov	x9, sp
 425f168: 3ccc8020     	ldur	q0, [x1, #0xc8]
 425f16c: 3c8c8120     	stur	q0, [x9, #0xc8]
 425f170: f9406c2a     	ldr	x10, [x1, #0xd8]
 425f174: f80d812a     	stur	x10, [x9, #0xd8]
 425f178: a90cfc3f     	stp	xzr, xzr, [x1, #0xc8]
 425f17c: 3dc03820     	ldr	q0, [x1, #0xe0]
 425f180: a90dfc3f     	stp	xzr, xzr, [x1, #0xd8]
 425f184: 3d803be0     	str	q0, [sp, #0xe0]
 425f188: f9407829     	ldr	x9, [x1, #0xf0]
 425f18c: f9007be9     	str	x9, [sp, #0xf0]
 425f190: a90efc3f     	stp	xzr, xzr, [x1, #0xe8]
 425f194: 52800029     	mov	w9, #0x1                ; =1
 425f198: 3903e3e9     	strb	w9, [sp, #0xf8]
 425f19c: 910003e1     	mov	x1, sp
 425f1a0: d63f0100     	blr	x8
 425f1a4: 910003e0     	mov	x0, sp
 425f1a8: 97ffe80f     	bl	0x42591e4 <_ChromeMain+0x4253f48>
 425f1ac: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 425f1b0: a9506ffc     	ldp	x28, x27, [sp, #0x100]
 425f1b4: 910483ff     	add	sp, sp, #0x120
 425f1b8: d65f03c0     	ret
 425f1bc: d4200000     	brk	#0
 425f1c0: d4400000     	hlt	#0
