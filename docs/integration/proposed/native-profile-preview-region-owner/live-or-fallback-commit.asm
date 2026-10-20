
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4655ff8: 131f7ea8     	asr	w8, w21, #31
 4655ffc: 32000115     	orr	w21, w8, #0x1
 4656000: f942fe77     	ldr	x23, [x19, #0x5f8]
 4656004: b40007b7     	cbz	x23, 0x46560f8 <_ChromeMain+0x4650e5c>
 4656008: 9117e278     	add	x24, x19, #0x5f8
 465600c: 39805e88     	ldrsb	x8, [x20, #0x17]
 4656010: a9402a89     	ldp	x9, x10, [x20]
 4656014: f100011f     	cmp	x8, #0x0
 4656018: 9a944136     	csel	x22, x9, x20, mi
 465601c: 7100011f     	cmp	w8, #0x0
 4656020: 9a884159     	csel	x25, x10, x8, mi
 4656024: 14000004     	b	0x4656034 <_ChromeMain+0x4650d98>
 4656028: 54000223     	b.lo	0x465606c <_ChromeMain+0x4650dd0>
 465602c: f94006f7     	ldr	x23, [x23, #0x8]
 4656030: b4000657     	cbz	x23, 0x46560f8 <_ChromeMain+0x4650e5c>
 4656034: aa1703e8     	mov	x8, x23
 4656038: f8420d09     	ldr	x9, [x8, #0x20]!
 465603c: 39805d0a     	ldrsb	x10, [x8, #0x17]
 4656040: f100015f     	cmp	x10, #0x0
 4656044: 9a884121     	csel	x1, x9, x8, mi
 4656048: f9400508     	ldr	x8, [x8, #0x8]
 465604c: 7100015f     	cmp	w10, #0x0
 4656050: 9a8a411a     	csel	x26, x8, x10, mi
 4656054: eb19035f     	cmp	x26, x25
 4656058: 9a993342     	csel	x2, x26, x25, lo
 465605c: aa1603e0     	mov	x0, x22
 4656060: 94e6ce00     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4656064: 340000a0     	cbz	w0, 0x4656078 <_ChromeMain+0x4650ddc>
 4656068: 36fffe20     	tbz	w0, #0x1f, 0x465602c <_ChromeMain+0x4650d90>
 465606c: f94002f7     	ldr	x23, [x23]
 4656070: b5fffe37     	cbnz	x23, 0x4656034 <_ChromeMain+0x4650d98>
 4656074: 14000021     	b	0x46560f8 <_ChromeMain+0x4650e5c>
 4656078: eb1a033f     	cmp	x25, x26
 465607c: 54fffd61     	b.ne	0x4656028 <_ChromeMain+0x4650d8c>
 4656080: eb1802ff     	cmp	x23, x24
 4656084: 540003a0     	b.eq	0x46560f8 <_ChromeMain+0x4650e5c>
 4656088: f942f676     	ldr	x22, [x19, #0x5e8]
 465608c: b4000376     	cbz	x22, 0x46560f8 <_ChromeMain+0x4650e5c>
 4656090: f9401ee8     	ldr	x8, [x23, #0x38]
 4656094: eb0802df     	cmp	x22, x8
 4656098: 54000301     	b.ne	0x46560f8 <_ChromeMain+0x4650e5c>
 465609c: f94002c8     	ldr	x8, [x22]
 46560a0: f9402d08     	ldr	x8, [x8, #0x58]
 46560a4: aa1603e0     	mov	x0, x22
 46560a8: d63f0100     	blr	x8
 46560ac: aa0003f7     	mov	x23, x0
 46560b0: 9400a05c     	bl	0x467e220 <_ChromeMain+0x4678f84>
 46560b4: f10002ff     	cmp	x23, #0x0
 46560b8: 1a9f07e8     	cset	w8, ne
 46560bc: eb0002ff     	cmp	x23, x0
 46560c0: fa401ae4     	ccmp	x23, #0x0, #0x4, ne
 46560c4: 540000c0     	b.eq	0x46560dc <_ChromeMain+0x4650e40>
 46560c8: f94026f7     	ldr	x23, [x23, #0x48]
 46560cc: f10002ff     	cmp	x23, #0x0
 46560d0: 1a9f07e8     	cset	w8, ne
 46560d4: fa4012e4     	ccmp	x23, x0, #0x4, ne
 46560d8: 54ffff81     	b.ne	0x46560c8 <_ChromeMain+0x4650e2c>
 46560dc: 340000e8     	cbz	w8, 0x46560f8 <_ChromeMain+0x4650e5c>
 46560e0: 394722c8     	ldrb	w8, [x22, #0x1c8]
 46560e4: 340000a8     	cbz	w8, 0x46560f8 <_ChromeMain+0x4650e5c>
 46560e8: f94196c8     	ldr	x8, [x22, #0x328]
 46560ec: b4000068     	cbz	x8, 0x46560f8 <_ChromeMain+0x4650e5c>
 46560f0: 39472108     	ldrb	w8, [x8, #0x1c8]
 46560f4: 35000a68     	cbnz	w8, 0x4656240 <_ChromeMain+0x4650fa4>
 46560f8: aa1303e0     	mov	x0, x19
 46560fc: aa1403e1     	mov	x1, x20
 4656100: aa1503e2     	mov	x2, x21
 4656104: 94000660     	bl	0x4657a84 <_ChromeMain+0x46527e8>
 4656108: f942f676     	ldr	x22, [x19, #0x5e8]
 465610c: b4000376     	cbz	x22, 0x4656178 <_ChromeMain+0x4650edc>
 4656110: f94002c8     	ldr	x8, [x22]
 4656114: f9402d08     	ldr	x8, [x8, #0x58]
 4656118: aa1603e0     	mov	x0, x22
 465611c: d63f0100     	blr	x8
 4656120: aa0003f7     	mov	x23, x0
 4656124: 9400a03f     	bl	0x467e220 <_ChromeMain+0x4678f84>
 4656128: f10002ff     	cmp	x23, #0x0
 465612c: 1a9f07e8     	cset	w8, ne
 4656130: eb0002ff     	cmp	x23, x0
 4656134: fa401ae4     	ccmp	x23, #0x0, #0x4, ne
 4656138: 540000c0     	b.eq	0x4656150 <_ChromeMain+0x4650eb4>
 465613c: f94026f7     	ldr	x23, [x23, #0x48]
 4656140: f10002ff     	cmp	x23, #0x0
 4656144: 1a9f07e8     	cset	w8, ne
 4656148: fa4012e4     	ccmp	x23, x0, #0x4, ne
 465614c: 54ffff81     	b.ne	0x465613c <_ChromeMain+0x4650ea0>
 4656150: 34000148     	cbz	w8, 0x4656178 <_ChromeMain+0x4650edc>
 4656154: 394722c8     	ldrb	w8, [x22, #0x1c8]
 4656158: 34000108     	cbz	w8, 0x4656178 <_ChromeMain+0x4650edc>
 465615c: b94a2268     	ldr	w8, [x19, #0xa20]
 4656160: 6b15011f     	cmp	w8, w21
 4656164: 540000a1     	b.ne	0x4656178 <_ChromeMain+0x4650edc>
 4656168: f94196c8     	ldr	x8, [x22, #0x328]
 465616c: b4000068     	cbz	x8, 0x4656178 <_ChromeMain+0x4650edc>
 4656170: 39472108     	ldrb	w8, [x8, #0x1c8]
 4656174: 37000728     	tbnz	w8, #0x0, 0x4656258 <_ChromeMain+0x4650fbc>
 4656178: 52800028     	mov	w8, #0x1                ; =1
 465617c: 39286668     	strb	w8, [x19, #0xa19]
 4656180: 1e2202a0     	scvtf	s0, w21
 4656184: aa1303e0     	mov	x0, x19
 4656188: 97ffcefe     	bl	0x4649d80 <_ChromeMain+0x4644ae4>
 465618c: f9422e68     	ldr	x8, [x19, #0x458]
 4656190: b4000228     	cbz	x8, 0x46561d4 <_ChromeMain+0x4650f38>
 4656194: f9432508     	ldr	x8, [x8, #0x648]
 4656198: b40001e8     	cbz	x8, 0x46561d4 <_ChromeMain+0x4650f38>
 465619c: f941d909     	ldr	x9, [x8, #0x3b0]
 46561a0: d37df135     	lsl	x21, x9, #3
 46561a4: b4000195     	cbz	x21, 0x46561d4 <_ChromeMain+0x4650f38>
 46561a8: f941d516     	ldr	x22, [x8, #0x3a8]
 46561ac: 14000005     	b	0x46561c0 <_ChromeMain+0x4650f24>
 46561b0: 97fde3c5     	bl	0x45cf0c4 <_ChromeMain+0x45c9e28>
 46561b4: 910022d6     	add	x22, x22, #0x8
 46561b8: f10022b5     	subs	x21, x21, #0x8
 46561bc: 540000c0     	b.eq	0x46561d4 <_ChromeMain+0x4650f38>
 46561c0: f94002c8     	ldr	x8, [x22]
 46561c4: b4ffff88     	cbz	x8, 0x46561b4 <_ChromeMain+0x4650f18>
 46561c8: f941b900     	ldr	x0, [x8, #0x370]
 46561cc: b4ffff40     	cbz	x0, 0x46561b4 <_ChromeMain+0x4650f18>
 46561d0: 17fffff8     	b	0x46561b0 <_ChromeMain+0x4650f14>
 46561d4: 39286a7f     	strb	wzr, [x19, #0xa1a]
 46561d8: 3dc00280     	ldr	q0, [x20]
 46561dc: 3d8003e0     	str	q0, [sp]
 46561e0: f9400a88     	ldr	x8, [x20, #0x10]
 46561e4: f9000be8     	str	x8, [sp, #0x10]
 46561e8: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 46561ec: f900029f     	str	xzr, [x20]
 46561f0: 910003e1     	mov	x1, sp
 46561f4: aa1303e0     	mov	x0, x19
 46561f8: 52800002     	mov	w2, #0x0                ; =0
 46561fc: 94000888     	bl	0x465841c <_ChromeMain+0x4653180>
 4656200: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4656204: 37f80148     	tbnz	w8, #0x1f, 0x465622c <_ChromeMain+0x4650f90>
 4656208: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 465620c: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 4656210: a94857f6     	ldp	x22, x21, [sp, #0x80]
 4656214: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 4656218: a94667fa     	ldp	x26, x25, [sp, #0x60]
 465621c: a9456ffc     	ldp	x28, x27, [sp, #0x50]
 4656220: 6d4423e9     	ldp	d9, d8, [sp, #0x40]
 4656224: 9102c3ff     	add	sp, sp, #0xb0
 4656228: d65f03c0     	ret
 465622c: f94003e0     	ldr	x0, [sp]
 4656230: f9400be8     	ldr	x8, [sp, #0x10]
 4656234: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4656238: 96e6cb20     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465623c: 17fffff3     	b	0x4656208 <_ChromeMain+0x4650f6c>
 4656240: f941dec8     	ldr	x8, [x22, #0x3b8]
 4656244: b4fff5a8     	cbz	x8, 0x46560f8 <_ChromeMain+0x4650e5c>
 4656248: b94a2268     	ldr	w8, [x19, #0xa20]
 465624c: 6b15011f     	cmp	w8, w21
 4656250: 54fff5c0     	b.eq	0x4656108 <_ChromeMain+0x4650e6c>
 4656254: 17ffffa9     	b	0x46560f8 <_ChromeMain+0x4650e5c>
 4656258: f941dec8     	ldr	x8, [x22, #0x3b8]
 465625c: bd4a1e60     	ldr	s0, [x19, #0xa1c]
 4656260: 52800029     	mov	w9, #0x1                ; =1
 4656264: 39286669     	strb	w9, [x19, #0xa19]
 4656268: b4fff8c8     	cbz	x8, 0x4656180 <_ChromeMain+0x4650ee4>
 465626c: 1e20c001     	fabs	s1, s0
 4656270: 1e282020     	fcmp	s1, s8
 4656274: 54fff86b     	b.lt	0x4656180 <_ChromeMain+0x4650ee4>
 4656278: bd0a2660     	str	s0, [x19, #0xa24]
 465627c: 3976c268     	ldrb	w8, [x19, #0xdb0]
 4656280: 35002048     	cbnz	w8, 0x4656688 <_ChromeMain+0x46513ec>
 4656284: f906e67f     	str	xzr, [x19, #0xdc8]
 4656288: 3975a268     	ldrb	w8, [x19, #0xd68]
 465628c: 35001988     	cbnz	w8, 0x46565bc <_ChromeMain+0x4651320>
