
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463cfac: b4000462     	cbz	x2, 0x463d038 <_ChromeMain+0x4637d9c>
 463cfb0: f9411448     	ldr	x8, [x2, #0x228]
 463cfb4: 39c05d09     	ldrsb	w9, [x8, #0x17]
 463cfb8: f940050a     	ldr	x10, [x8, #0x8]
 463cfbc: 36f80209     	tbz	w9, #0x1f, 0x463cffc <_ChromeMain+0x4637d60>
 463cfc0: f100815f     	cmp	x10, #0x20
 463cfc4: 540001c1     	b.ne	0x463cffc <_ChromeMain+0x4637d60>
 463cfc8: f940010a     	ldr	x10, [x8]
 463cfcc: 9004406b     	adrp	x11, 0xce48000 <dyld_stub_binder+0xce48000>
 463cfd0: 9125256b     	add	x11, x11, #0x949
 463cfd4: a940354c     	ldp	x12, x13, [x10]
 463cfd8: a9403d6e     	ldp	x14, x15, [x11]
 463cfdc: a9412950     	ldp	x16, x10, [x10, #0x10]
 463cfe0: a9412d71     	ldp	x17, x11, [x11, #0x10]
 463cfe4: eb0e019f     	cmp	x12, x14
 463cfe8: fa4f01a0     	ccmp	x13, x15, #0x0, eq
 463cfec: fa510200     	ccmp	x16, x17, #0x0, eq
 463cff0: fa4b0140     	ccmp	x10, x11, #0x0, eq
 463cff4: 54000280     	b.eq	0x463d044 <_ChromeMain+0x4637da8>
 463cff8: 5280040a     	mov	w10, #0x20              ; =32
 463cffc: 363801e9     	tbz	w9, #0x7, 0x463d038 <_ChromeMain+0x4637d9c>
 463d000: f100815f     	cmp	x10, #0x20
 463d004: 540001a1     	b.ne	0x463d038 <_ChromeMain+0x4637d9c>
 463d008: f9400108     	ldr	x8, [x8]
 463d00c: f0044049     	adrp	x9, 0xce48000 <dyld_stub_binder+0xce48000>
 463d010: 91252529     	add	x9, x9, #0x949
 463d014: a9402d0a     	ldp	x10, x11, [x8]
 463d018: a940352c     	ldp	x12, x13, [x9]
 463d01c: a941210e     	ldp	x14, x8, [x8, #0x10]
 463d020: a941252f     	ldp	x15, x9, [x9, #0x10]
 463d024: eb0c015f     	cmp	x10, x12
 463d028: fa4d0160     	ccmp	x11, x13, #0x0, eq
 463d02c: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 463d030: fa490100     	ccmp	x8, x9, #0x0, eq
 463d034: 54000040     	b.eq	0x463d03c <_ChromeMain+0x4637da0>
 463d038: d65f03c0     	ret
 463d03c: d1158000     	sub	x0, x0, #0x560
 463d040: 17ffd9f0     	b	0x4633800 <_ChromeMain+0x462e564>
 463d044: 52800028     	mov	w8, #0x1                ; =1
 463d048: 390cc008     	strb	w8, [x0, #0x330]
 463d04c: f9411448     	ldr	x8, [x2, #0x228]
 463d050: 39405d09     	ldrb	w9, [x8, #0x17]
 463d054: f940050a     	ldr	x10, [x8, #0x8]
 463d058: 373ffd49     	tbnz	w9, #0x7, 0x463d000 <_ChromeMain+0x4637d64>
 463d05c: 17fffff7     	b	0x463d038 <_ChromeMain+0x4637d9c>
 463d060: b4000262     	cbz	x2, 0x463d0ac <_ChromeMain+0x4637e10>
 463d064: f9411448     	ldr	x8, [x2, #0x228]
 463d068: 39c05d09     	ldrsb	w9, [x8, #0x17]
 463d06c: 36f80209     	tbz	w9, #0x1f, 0x463d0ac <_ChromeMain+0x4637e10>
 463d070: f9400509     	ldr	x9, [x8, #0x8]
 463d074: f100813f     	cmp	x9, #0x20
 463d078: 540001a1     	b.ne	0x463d0ac <_ChromeMain+0x4637e10>
 463d07c: f9400108     	ldr	x8, [x8]
 463d080: f0044049     	adrp	x9, 0xce48000 <dyld_stub_binder+0xce48000>
 463d084: 91252529     	add	x9, x9, #0x949
 463d088: a9402d0a     	ldp	x10, x11, [x8]
 463d08c: a940352c     	ldp	x12, x13, [x9]
 463d090: a941210e     	ldp	x14, x8, [x8, #0x10]
 463d094: a941252f     	ldp	x15, x9, [x9, #0x10]
 463d098: eb0c015f     	cmp	x10, x12
 463d09c: fa4d0160     	ccmp	x11, x13, #0x0, eq
 463d0a0: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 463d0a4: fa490100     	ccmp	x8, x9, #0x0, eq
 463d0a8: 54000040     	b.eq	0x463d0b0 <_ChromeMain+0x4637e14>
 463d0ac: d65f03c0     	ret
 463d0b0: 17ffd9d4     	b	0x4633800 <_ChromeMain+0x462e564>
 463d0b4: b4000262     	cbz	x2, 0x463d100 <_ChromeMain+0x4637e64>
 463d0b8: f9411448     	ldr	x8, [x2, #0x228]
 463d0bc: 39c05d09     	ldrsb	w9, [x8, #0x17]
 463d0c0: 36f80209     	tbz	w9, #0x1f, 0x463d100 <_ChromeMain+0x4637e64>
 463d0c4: f9400509     	ldr	x9, [x8, #0x8]
 463d0c8: f100813f     	cmp	x9, #0x20
 463d0cc: 540001a1     	b.ne	0x463d100 <_ChromeMain+0x4637e64>
 463d0d0: f9400108     	ldr	x8, [x8]
 463d0d4: f0044049     	adrp	x9, 0xce48000 <dyld_stub_binder+0xce48000>
 463d0d8: 91252529     	add	x9, x9, #0x949
 463d0dc: a9402d0a     	ldp	x10, x11, [x8]
 463d0e0: a940352c     	ldp	x12, x13, [x9]
 463d0e4: a941210e     	ldp	x14, x8, [x8, #0x10]
 463d0e8: a941252f     	ldp	x15, x9, [x9, #0x10]
 463d0ec: eb0c015f     	cmp	x10, x12
 463d0f0: fa4d0160     	ccmp	x11, x13, #0x0, eq
 463d0f4: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 463d0f8: fa490100     	ccmp	x8, x9, #0x0, eq
 463d0fc: 54000040     	b.eq	0x463d104 <_ChromeMain+0x4637e68>
 463d100: d65f03c0     	ret
 463d104: d1158000     	sub	x0, x0, #0x560
 463d108: 17ffd9be     	b	0x4633800 <_ChromeMain+0x462e564>
 463d10c: 00000000     	udf	#0x0
 463d110: b4000462     	cbz	x2, 0x463d19c <_ChromeMain+0x4637f00>
 463d114: f9411448     	ldr	x8, [x2, #0x228]
 463d118: 39c05d09     	ldrsb	w9, [x8, #0x17]
 463d11c: f940050a     	ldr	x10, [x8, #0x8]
 463d120: 36f80209     	tbz	w9, #0x1f, 0x463d160 <_ChromeMain+0x4637ec4>
 463d124: f100815f     	cmp	x10, #0x20
 463d128: 540001c1     	b.ne	0x463d160 <_ChromeMain+0x4637ec4>
 463d12c: f940010a     	ldr	x10, [x8]
 463d130: f004404b     	adrp	x11, 0xce48000 <dyld_stub_binder+0xce48000>
 463d134: 9125256b     	add	x11, x11, #0x949
 463d138: a940354c     	ldp	x12, x13, [x10]
 463d13c: a9403d6e     	ldp	x14, x15, [x11]
 463d140: a9412950     	ldp	x16, x10, [x10, #0x10]
 463d144: a9412d71     	ldp	x17, x11, [x11, #0x10]
 463d148: eb0e019f     	cmp	x12, x14
 463d14c: fa4f01a0     	ccmp	x13, x15, #0x0, eq
 463d150: fa510200     	ccmp	x16, x17, #0x0, eq
 463d154: fa4b0140     	ccmp	x10, x11, #0x0, eq
 463d158: 54000260     	b.eq	0x463d1a4 <_ChromeMain+0x4637f08>
 463d15c: 5280040a     	mov	w10, #0x20              ; =32
 463d160: 363801e9     	tbz	w9, #0x7, 0x463d19c <_ChromeMain+0x4637f00>
 463d164: f100815f     	cmp	x10, #0x20
 463d168: 540001a1     	b.ne	0x463d19c <_ChromeMain+0x4637f00>
 463d16c: f9400108     	ldr	x8, [x8]
 463d170: f0044049     	adrp	x9, 0xce48000 <dyld_stub_binder+0xce48000>
 463d174: 91252529     	add	x9, x9, #0x949
 463d178: a9402d0a     	ldp	x10, x11, [x8]
 463d17c: a940352c     	ldp	x12, x13, [x9]
 463d180: a941210e     	ldp	x14, x8, [x8, #0x10]
 463d184: a941252f     	ldp	x15, x9, [x9, #0x10]
 463d188: eb0c015f     	cmp	x10, x12
 463d18c: fa4d0160     	ccmp	x11, x13, #0x0, eq
 463d190: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 463d194: fa490100     	ccmp	x8, x9, #0x0, eq
 463d198: 54000040     	b.eq	0x463d1a0 <_ChromeMain+0x4637f04>
 463d19c: d65f03c0     	ret
 463d1a0: 17ffd998     	b	0x4633800 <_ChromeMain+0x462e564>
 463d1a4: 3922401f     	strb	wzr, [x0, #0x890]
 463d1a8: f9411448     	ldr	x8, [x2, #0x228]
 463d1ac: 39405d09     	ldrb	w9, [x8, #0x17]
 463d1b0: f940050a     	ldr	x10, [x8, #0x8]
 463d1b4: 373ffd89     	tbnz	w9, #0x7, 0x463d164 <_ChromeMain+0x4637ec8>
 463d1b8: 17fffff9     	b	0x463d19c <_ChromeMain+0x4637f00>
 463d1bc: b4000462     	cbz	x2, 0x463d248 <_ChromeMain+0x4637fac>
 463d1c0: f9411448     	ldr	x8, [x2, #0x228]
 463d1c4: 39c05d09     	ldrsb	w9, [x8, #0x17]
 463d1c8: f940050a     	ldr	x10, [x8, #0x8]
 463d1cc: 36f80209     	tbz	w9, #0x1f, 0x463d20c <_ChromeMain+0x4637f70>
 463d1d0: f100815f     	cmp	x10, #0x20
 463d1d4: 540001c1     	b.ne	0x463d20c <_ChromeMain+0x4637f70>
 463d1d8: f940010a     	ldr	x10, [x8]
 463d1dc: f004404b     	adrp	x11, 0xce48000 <dyld_stub_binder+0xce48000>
 463d1e0: 9125256b     	add	x11, x11, #0x949
 463d1e4: a940354c     	ldp	x12, x13, [x10]
 463d1e8: a9403d6e     	ldp	x14, x15, [x11]
 463d1ec: a9412950     	ldp	x16, x10, [x10, #0x10]
 463d1f0: a9412d71     	ldp	x17, x11, [x11, #0x10]
 463d1f4: eb0e019f     	cmp	x12, x14
 463d1f8: fa4f01a0     	ccmp	x13, x15, #0x0, eq
 463d1fc: fa510200     	ccmp	x16, x17, #0x0, eq
 463d200: fa4b0140     	ccmp	x10, x11, #0x0, eq
 463d204: 54000280     	b.eq	0x463d254 <_ChromeMain+0x4637fb8>
 463d208: 5280040a     	mov	w10, #0x20              ; =32
 463d20c: 363801e9     	tbz	w9, #0x7, 0x463d248 <_ChromeMain+0x4637fac>
 463d210: f100815f     	cmp	x10, #0x20
 463d214: 540001a1     	b.ne	0x463d248 <_ChromeMain+0x4637fac>
 463d218: f9400108     	ldr	x8, [x8]
 463d21c: f0044049     	adrp	x9, 0xce48000 <dyld_stub_binder+0xce48000>
 463d220: 91252529     	add	x9, x9, #0x949
 463d224: a9402d0a     	ldp	x10, x11, [x8]
 463d228: a940352c     	ldp	x12, x13, [x9]
 463d22c: a941210e     	ldp	x14, x8, [x8, #0x10]
 463d230: a941252f     	ldp	x15, x9, [x9, #0x10]
 463d234: eb0c015f     	cmp	x10, x12
 463d238: fa4d0160     	ccmp	x11, x13, #0x0, eq
 463d23c: fa4f01c0     	ccmp	x14, x15, #0x0, eq
 463d240: fa490100     	ccmp	x8, x9, #0x0, eq
 463d244: 54000040     	b.eq	0x463d24c <_ChromeMain+0x4637fb0>
 463d248: d65f03c0     	ret
 463d24c: d1158000     	sub	x0, x0, #0x560
 463d250: 17ffd96c     	b	0x4633800 <_ChromeMain+0x462e564>
 463d254: 390cc01f     	strb	wzr, [x0, #0x330]
 463d258: f9411448     	ldr	x8, [x2, #0x228]
 463d25c: 39405d09     	ldrb	w9, [x8, #0x17]
 463d260: f940050a     	ldr	x10, [x8, #0x8]
 463d264: 373ffd69     	tbnz	w9, #0x7, 0x463d210 <_ChromeMain+0x4637f74>
 463d268: 17fffff8     	b	0x463d248 <_ChromeMain+0x4637fac>
 463d26c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 463d270: a9017bfd     	stp	x29, x30, [sp, #0x10]
 463d274: 910043fd     	add	x29, sp, #0x10
 463d278: aa0003f3     	mov	x19, x0
 463d27c: f9445014     	ldr	x20, [x0, #0x8a0]
 463d280: b4000194     	cbz	x20, 0x463d2b0 <_ChromeMain+0x4638014>
 463d284: f904527f     	str	xzr, [x19, #0x8a0]
 463d288: f9444e61     	ldr	x1, [x19, #0x898]
 463d28c: 91026280     	add	x0, x20, #0x98
 463d290: 9747713a     	bl	0x1819778 <_ChromeMain+0x18144dc>
 463d294: 925e7688     	and	x8, x20, #0xfffffffc00000000
 463d298: b0052ba9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 463d29c: f9404529     	ldr	x9, [x9, #0x88]
 463d2a0: eb09011f     	cmp	x8, x9
 463d2a4: 54000061     	b.ne	0x463d2b0 <_ChromeMain+0x4638014>
 463d2a8: aa1403e0     	mov	x0, x20
 463d2ac: 96e795e4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 463d2b0: 3922427f     	strb	wzr, [x19, #0x890]
 463d2b4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 463d2b8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 463d2bc: d65f03c0     	ret
 463d2c0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 463d2c4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 463d2c8: 910043fd     	add	x29, sp, #0x10
 463d2cc: aa0003f3     	mov	x19, x0
 463d2d0: f941a014     	ldr	x20, [x0, #0x340]
 463d2d4: b4000194     	cbz	x20, 0x463d304 <_ChromeMain+0x4638068>
 463d2d8: f901a27f     	str	xzr, [x19, #0x340]
 463d2dc: f9419e61     	ldr	x1, [x19, #0x338]
 463d2e0: 91026280     	add	x0, x20, #0x98
 463d2e4: 97477125     	bl	0x1819778 <_ChromeMain+0x18144dc>
 463d2e8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 463d2ec: b0052ba9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 463d2f0: f9404529     	ldr	x9, [x9, #0x88]
 463d2f4: eb09011f     	cmp	x8, x9
 463d2f8: 54000061     	b.ne	0x463d304 <_ChromeMain+0x4638068>
 463d2fc: aa1403e0     	mov	x0, x20
 463d300: 96e795cf     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 463d304: 390cc27f     	strb	wzr, [x19, #0x330]
 463d308: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 463d30c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 463d310: d65f03c0     	ret
 463d314: d104c3ff     	sub	sp, sp, #0x130
 463d318: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 463d31c: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 463d320: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 463d324: a91057f6     	stp	x22, x21, [sp, #0x100]
 463d328: a9114ff4     	stp	x20, x19, [sp, #0x110]
 463d32c: a9127bfd     	stp	x29, x30, [sp, #0x120]
 463d330: 910483fd     	add	x29, sp, #0x120
 463d334: aa0103f4     	mov	x20, x1
 463d338: aa0003f3     	mov	x19, x0
 463d33c: 910e0000     	add	x0, x0, #0x380
 463d340: 9400e201     	bl	0x4675b44 <_ChromeMain+0x46708a8>
 463d344: f9400288     	ldr	x8, [x20]
 463d348: f901c268     	str	x8, [x19, #0x380]
 463d34c: f9400688     	ldr	x8, [x20, #0x8]
 463d350: f901c668     	str	x8, [x19, #0x388]
 463d354: f9400a88     	ldr	x8, [x20, #0x10]
