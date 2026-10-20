
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4257d74: d10343ff     	sub	sp, sp, #0xd0
 4257d78: a9076ffc     	stp	x28, x27, [sp, #0x70]
 4257d7c: a90867fa     	stp	x26, x25, [sp, #0x80]
 4257d80: a9095ff8     	stp	x24, x23, [sp, #0x90]
 4257d84: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 4257d88: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 4257d8c: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 4257d90: 910303fd     	add	x29, sp, #0xc0
 4257d94: aa0003f3     	mov	x19, x0
 4257d98: f9400008     	ldr	x8, [x0]
 4257d9c: f940b508     	ldr	x8, [x8, #0x168]
 4257da0: d63f0100     	blr	x8
 4257da4: b4001a60     	cbz	x0, 0x42580f0 <_ChromeMain+0x4252e54>
 4257da8: aa0003f4     	mov	x20, x0
 4257dac: b00490e1     	adrp	x1, 0xd474000 <dyld_stub_binder+0xd474000>
 4257db0: 910ec021     	add	x1, x1, #0x3b0
 4257db4: 528003e2     	mov	w2, #0x1f               ; =31
 4257db8: 9708a59a     	bl	0x481420 <_ChromeMain+0x47c184>
 4257dbc: f9400408     	ldr	x8, [x0, #0x8]
 4257dc0: b4000628     	cbz	x8, 0x4257e84 <_ChromeMain+0x4252be8>
 4257dc4: f90007f3     	str	x19, [sp, #0x8]
 4257dc8: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 4257dcc: f90017ff     	str	xzr, [sp, #0x28]
 4257dd0: a9402015     	ldp	x21, x8, [x0]
 4257dd4: 8b0816a9     	add	x9, x21, x8, lsl #5
 4257dd8: eb0902bf     	cmp	x21, x9
 4257ddc: 54001848     	b.hi	0x42580e4 <_ChromeMain+0x4252e48>
 4257de0: d37be91a     	lsl	x26, x8, #5
 4257de4: 9100c3e8     	add	x8, sp, #0x30
 4257de8: 91004d09     	add	x9, x8, #0x13
 4257dec: b0045f9b     	adrp	x27, 0xce48000 <dyld_stub_binder+0xce48000>
 4257df0: 9127337b     	add	x27, x27, #0x9cc
 4257df4: eb1b011f     	cmp	x8, x27
 4257df8: fa5b9120     	ccmp	x9, x27, #0x0, ls
 4257dfc: 1a9f97fc     	cset	w28, hi
 4257e00: b40003fa     	cbz	x26, 0x4257e7c <_ChromeMain+0x4252be0>
 4257e04: f9000bf4     	str	x20, [sp, #0x10]
 4257e08: 52800019     	mov	w25, #0x0               ; =0
 4257e0c: 910143f3     	add	x19, sp, #0x50
 4257e10: 52800274     	mov	w20, #0x13              ; =19
 4257e14: f004acd6     	adrp	x22, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 4257e18: 9130a6d6     	add	x22, x22, #0xc29
 4257e1c: 14000032     	b	0x4257ee4 <_ChromeMain+0x4252c48>
 4257e20: f9400bf3     	ldr	x19, [sp, #0x10]
 4257e24: 360002d9     	tbz	w25, #0x0, 0x4257e7c <_ChromeMain+0x4252be0>
 4257e28: f94013e8     	ldr	x8, [sp, #0x20]
 4257e2c: b40010e8     	cbz	x8, 0x4258048 <_ChromeMain+0x4252dac>
 4257e30: f9400fe9     	ldr	x9, [sp, #0x18]
 4257e34: f94017ea     	ldr	x10, [sp, #0x28]
 4257e38: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 4257e3c: f90017ff     	str	xzr, [sp, #0x28]
 4257e40: a90523e9     	stp	x9, x8, [sp, #0x50]
 4257e44: f90033ea     	str	x10, [sp, #0x60]
 4257e48: 528000e8     	mov	w8, #0x7                ; =7
 4257e4c: 3901a3e8     	strb	w8, [sp, #0x68]
 4257e50: b00490e1     	adrp	x1, 0xd474000 <dyld_stub_binder+0xd474000>
 4257e54: 910ec021     	add	x1, x1, #0x3b0
 4257e58: 910143e3     	add	x3, sp, #0x50
 4257e5c: aa1303e0     	mov	x0, x19
 4257e60: 528003e2     	mov	w2, #0x1f               ; =31
 4257e64: 974ac691     	bl	0x15098a8 <_ChromeMain+0x150460c>
 4257e68: 3941a3e8     	ldrb	w8, [sp, #0x68]
 4257e6c: 7103fd1f     	cmp	w8, #0xff
 4257e70: 54000060     	b.eq	0x4257e7c <_ChromeMain+0x4252be0>
 4257e74: 721e791f     	tst	w8, #0xfffffffd
 4257e78: 54001161     	b.ne	0x42580a4 <_ChromeMain+0x4252e08>
 4257e7c: f9400fe1     	ldr	x1, [sp, #0x18]
 4257e80: b5000121     	cbnz	x1, 0x4257ea4 <_ChromeMain+0x4252c08>
 4257e84: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 4257e88: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4257e8c: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4257e90: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 4257e94: a94867fa     	ldp	x26, x25, [sp, #0x80]
 4257e98: a9476ffc     	ldp	x28, x27, [sp, #0x70]
 4257e9c: 910343ff     	add	sp, sp, #0xd0
 4257ea0: d65f03c0     	ret
 4257ea4: 910063e0     	add	x0, sp, #0x18
 4257ea8: 97233c12     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 4257eac: f9400fe0     	ldr	x0, [sp, #0x18]
 4257eb0: f94017e8     	ldr	x8, [sp, #0x28]
 4257eb4: d37be901     	lsl	x1, x8, #5
 4257eb8: 96f6c400     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257ebc: 17fffff2     	b	0x4257e84 <_ChromeMain+0x4252be8>
 4257ec0: f9401be0     	ldr	x0, [sp, #0x30]
 4257ec4: f94023e8     	ldr	x8, [sp, #0x40]
 4257ec8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257ecc: 96f6c3fb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257ed0: 36000877     	tbz	w23, #0x0, 0x4257fdc <_ChromeMain+0x4252d40>
 4257ed4: 52800039     	mov	w25, #0x1               ; =1
 4257ed8: 910082b5     	add	x21, x21, #0x20
 4257edc: f100835a     	subs	x26, x26, #0x20
 4257ee0: 54fffa00     	b.eq	0x4257e20 <_ChromeMain+0x4252b84>
 4257ee4: b40007d5     	cbz	x21, 0x4257fdc <_ChromeMain+0x4252d40>
 4257ee8: 394062a8     	ldrb	w8, [x21, #0x18]
 4257eec: 7100111f     	cmp	w8, #0x4
 4257ef0: 54000761     	b.ne	0x4257fdc <_ChromeMain+0x4252d40>
 4257ef4: 39405eb7     	ldrb	w23, [x21, #0x17]
 4257ef8: f94006a8     	ldr	x8, [x21, #0x8]
 4257efc: 721902ff     	tst	w23, #0x80
 4257f00: 9a971109     	csel	x9, x8, x23, ne
 4257f04: f1004d3f     	cmp	x9, #0x13
 4257f08: 54000181     	b.ne	0x4257f38 <_ChromeMain+0x4252c9c>
 4257f0c: f94002a9     	ldr	x9, [x21]
 4257f10: 721902ff     	tst	w23, #0x80
 4257f14: 9a951129     	csel	x9, x9, x21, ne
 4257f18: a9402d2a     	ldp	x10, x11, [x9]
 4257f1c: a940376c     	ldp	x12, x13, [x27]
 4257f20: f840b129     	ldur	x9, [x9, #0xb]
 4257f24: f840b36e     	ldur	x14, [x27, #0xb]
 4257f28: eb0c015f     	cmp	x10, x12
 4257f2c: fa4d0160     	ccmp	x11, x13, #0x0, eq
 4257f30: fa4e0120     	ccmp	x9, x14, #0x0, eq
 4257f34: 54fffd00     	b.eq	0x4257ed4 <_ChromeMain+0x4252c38>
 4257f38: aa1503f8     	mov	x24, x21
 4257f3c: 36380077     	tbz	w23, #0x7, 0x4257f48 <_ChromeMain+0x4252cac>
 4257f40: f94002b8     	ldr	x24, [x21]
 4257f44: aa0803f7     	mov	x23, x8
 4257f48: 39011ff4     	strb	w20, [sp, #0x47]
 4257f4c: 35000d1c     	cbnz	w28, 0x42580ec <_ChromeMain+0x4252e50>
 4257f50: 3dc00360     	ldr	q0, [x27]
 4257f54: 3d800fe0     	str	q0, [sp, #0x30]
 4257f58: b840f368     	ldur	w8, [x27, #0xf]
 4257f5c: b803f3e8     	stur	w8, [sp, #0x3f]
 4257f60: 39010fff     	strb	wzr, [sp, #0x43]
 4257f64: 9100c3e0     	add	x0, sp, #0x30
 4257f68: aa1603e1     	mov	x1, x22
 4257f6c: 52800022     	mov	w2, #0x1                ; =1
 4257f70: 96f9092c     	bl	0x9a420 <_ChromeMain+0x95184>
 4257f74: f9400808     	ldr	x8, [x0, #0x10]
 4257f78: 3dc00000     	ldr	q0, [x0]
 4257f7c: 3d8017e0     	str	q0, [sp, #0x50]
 4257f80: f90033e8     	str	x8, [sp, #0x60]
 4257f84: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4257f88: f900001f     	str	xzr, [x0]
 4257f8c: 39819fe8     	ldrsb	x8, [sp, #0x67]
 4257f90: a9452be9     	ldp	x9, x10, [sp, #0x50]
 4257f94: f100011f     	cmp	x8, #0x0
 4257f98: 9a934122     	csel	x2, x9, x19, mi
 4257f9c: 7100011f     	cmp	w8, #0x0
 4257fa0: 9a884143     	csel	x3, x10, x8, mi
 4257fa4: aa1803e0     	mov	x0, x24
 4257fa8: aa1703e1     	mov	x1, x23
 4257fac: 52800004     	mov	w4, #0x0                ; =0
 4257fb0: 9726fcee     	bl	0xc17368 <_ChromeMain+0xc120cc>
 4257fb4: aa0003f7     	mov	x23, x0
 4257fb8: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4257fbc: 36f800a8     	tbz	w8, #0x1f, 0x4257fd0 <_ChromeMain+0x4252d34>
 4257fc0: f9402be0     	ldr	x0, [sp, #0x50]
 4257fc4: f94033e8     	ldr	x8, [sp, #0x60]
 4257fc8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257fcc: 96f6c3bb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257fd0: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4257fd4: 37fff768     	tbnz	w8, #0x1f, 0x4257ec0 <_ChromeMain+0x4252c24>
 4257fd8: 3707f7f7     	tbnz	w23, #0x0, 0x4257ed4 <_ChromeMain+0x4252c38>
 4257fdc: 910143e8     	add	x8, sp, #0x50
 4257fe0: aa1503e0     	mov	x0, x21
 4257fe4: 9721e977     	bl	0xad25c0 <_ChromeMain+0xacd324>
 4257fe8: 910063e0     	add	x0, sp, #0x18
 4257fec: 910143e1     	add	x1, sp, #0x50
 4257ff0: 9721ec5e     	bl	0xad3168 <_ChromeMain+0xacdecc>
 4257ff4: 3941a3e8     	ldrb	w8, [sp, #0x68]
 4257ff8: 7103fd1f     	cmp	w8, #0xff
 4257ffc: 54fff6e0     	b.eq	0x4257ed8 <_ChromeMain+0x4252c3c>
 4258000: 721e791f     	tst	w8, #0xfffffffd
 4258004: 54fff6a0     	b.eq	0x4257ed8 <_ChromeMain+0x4252c3c>
 4258008: 7100111f     	cmp	w8, #0x4
 425800c: 54000100     	b.eq	0x425802c <_ChromeMain+0x4252d90>
 4258010: b0053349     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4258014: 9121e129     	add	x9, x9, #0x878
 4258018: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 425801c: 9100c3e0     	add	x0, sp, #0x30
 4258020: 910143e1     	add	x1, sp, #0x50
 4258024: d63f0100     	blr	x8
 4258028: 17ffffac     	b	0x4257ed8 <_ChromeMain+0x4252c3c>
 425802c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4258030: 36fff548     	tbz	w8, #0x1f, 0x4257ed8 <_ChromeMain+0x4252c3c>
 4258034: f9402be0     	ldr	x0, [sp, #0x50]
 4258038: f94033e8     	ldr	x8, [sp, #0x60]
 425803c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4258040: 96f6c39e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258044: 17ffffa5     	b	0x4257ed8 <_ChromeMain+0x4252c3c>
 4258048: 900490e1     	adrp	x1, 0xd474000 <dyld_stub_binder+0xd474000>
 425804c: 910ec021     	add	x1, x1, #0x3b0
 4258050: aa1303e0     	mov	x0, x19
 4258054: 528003e2     	mov	w2, #0x1f               ; =31
 4258058: 970992fd     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 425805c: b4000500     	cbz	x0, 0x42580fc <_ChromeMain+0x4252e60>
 4258060: f9400e68     	ldr	x8, [x19, #0x18]
 4258064: b9401c09     	ldr	w9, [x0, #0x1c]
 4258068: 53077d29     	lsr	w9, w9, #7
 425806c: f940010a     	ldr	x10, [x8]
 4258070: f940254a     	ldr	x10, [x10, #0x48]
 4258074: 900490e1     	adrp	x1, 0xd474000 <dyld_stub_binder+0xd474000>
 4258078: 910ec021     	add	x1, x1, #0x3b0
 425807c: 121f0123     	and	w3, w9, #0x2
 4258080: aa0803e0     	mov	x0, x8
 4258084: 528003e2     	mov	w2, #0x1f               ; =31
 4258088: d63f0140     	blr	x10
 425808c: f94007e0     	ldr	x0, [sp, #0x8]
 4258090: f9400008     	ldr	x8, [x0]
 4258094: f940b508     	ldr	x8, [x8, #0x168]
 4258098: d63f0100     	blr	x8
 425809c: 94df1cba     	bl	0x7a1f384 <_ChromeMain+0x7a1a0e8>
 42580a0: 17ffff77     	b	0x4257e7c <_ChromeMain+0x4252be0>
 42580a4: 7100111f     	cmp	w8, #0x4
 42580a8: 54000100     	b.eq	0x42580c8 <_ChromeMain+0x4252e2c>
 42580ac: b0053349     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 42580b0: 9121e129     	add	x9, x9, #0x878
 42580b4: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 42580b8: 9100c3e0     	add	x0, sp, #0x30
 42580bc: 910143e1     	add	x1, sp, #0x50
 42580c0: d63f0100     	blr	x8
 42580c4: 17ffff6e     	b	0x4257e7c <_ChromeMain+0x4252be0>
 42580c8: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 42580cc: 36ffed88     	tbz	w8, #0x1f, 0x4257e7c <_ChromeMain+0x4252be0>
 42580d0: f9402be0     	ldr	x0, [sp, #0x50]
 42580d4: f94033e8     	ldr	x8, [sp, #0x60]
 42580d8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42580dc: 96f6c377     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42580e0: 17ffff67     	b	0x4257e7c <_ChromeMain+0x4252be0>
 42580e4: d4200000     	brk	#0
 42580e8: d4400000     	hlt	#0
 42580ec: d4200020     	brk	#0x1
 42580f0: d4200000     	brk	#0
 42580f4: d4400000     	hlt	#0
 42580f8: d4200020     	brk	#0x1
 42580fc: d4200000     	brk	#0
 4258100: d4400000     	hlt	#0
 4258104: d4200020     	brk	#0x1
