
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4637f20: d10303ff     	sub	sp, sp, #0xc0
 4637f24: a9085ff8     	stp	x24, x23, [sp, #0x80]
 4637f28: a90957f6     	stp	x22, x21, [sp, #0x90]
 4637f2c: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 4637f30: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 4637f34: 9102c3fd     	add	x29, sp, #0xb0
 4637f38: aa0803f3     	mov	x19, x8
 4637f3c: b40019e1     	cbz	x1, 0x4638278 <_ChromeMain+0x4632fdc>
 4637f40: aa0103f5     	mov	x21, x1
 4637f44: aa0003f4     	mov	x20, x0
 4637f48: 6f00e400     	movi.2d	v0, #0000000000000000
 4637f4c: ad000260     	stp	q0, q0, [x19]
 4637f50: f9003bff     	str	xzr, [sp, #0x70]
 4637f54: ad0283e0     	stp	q0, q0, [sp, #0x50]
 4637f58: ad0183e0     	stp	q0, q0, [sp, #0x30]
 4637f5c: ad0083e0     	stp	q0, q0, [sp, #0x10]
 4637f60: 3d8003e0     	str	q0, [sp]
 4637f64: d0ffd076     	adrp	x22, 0x4045000 <_ChromeMain+0x403fd64>
 4637f68: 913c82d6     	add	x22, x22, #0xf20
 4637f6c: f9414828     	ldr	x8, [x1, #0x290]
 4637f70: b5000728     	cbnz	x8, 0x4638054 <_ChromeMain+0x4632db8>
 4637f74: f94132a8     	ldr	x8, [x21, #0x260]
 4637f78: f9401d09     	ldr	x9, [x8, #0x38]
 4637f7c: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 4637f80: eb16013f     	cmp	x9, x22
 4637f84: 54001a41     	b.ne	0x46382cc <_ChromeMain+0x4633030>
 4637f88: 3100051f     	cmn	w8, #0x1
 4637f8c: 54002160     	b.eq	0x46383b8 <_ChromeMain+0x463311c>
 4637f90: f94142a9     	ldr	x9, [x21, #0x280]
 4637f94: eb08013f     	cmp	x9, x8
 4637f98: 54002009     	b.ls	0x4638398 <_ChromeMain+0x46330fc>
 4637f9c: f9413ea9     	ldr	x9, [x21, #0x278]
 4637fa0: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4637fa4: b4002048     	cbz	x8, 0x46383ac <_ChromeMain+0x4633110>
 4637fa8: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 4637fac: b7f81f89     	tbnz	x9, #0x3f, 0x463839c <_ChromeMain+0x4633100>
 4637fb0: b5001fa9     	cbnz	x9, 0x46383a4 <_ChromeMain+0x4633108>
 4637fb4: f9400d08     	ldr	x8, [x8, #0x18]
 4637fb8: f9400508     	ldr	x8, [x8, #0x8]
 4637fbc: 91018101     	add	x1, x8, #0x60
 4637fc0: 910003f7     	mov	x23, sp
 4637fc4: 910003e0     	mov	x0, sp
 4637fc8: 96ec07f3     	bl	0x139f94 <_ChromeMain+0x134cf8>
 4637fcc: 394063e8     	ldrb	w8, [sp, #0x18]
 4637fd0: 370005a8     	tbnz	w8, #0x0, 0x4638084 <_ChromeMain+0x4632de8>
 4637fd4: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 4637fd8: 3100051f     	cmn	w8, #0x1
 4637fdc: 54002020     	b.eq	0x46383e0 <_ChromeMain+0x4633144>
 4637fe0: f94142a9     	ldr	x9, [x21, #0x280]
 4637fe4: eb08013f     	cmp	x9, x8
 4637fe8: 54001d89     	b.ls	0x4638398 <_ChromeMain+0x46330fc>
 4637fec: f9413ea9     	ldr	x9, [x21, #0x278]
 4637ff0: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4637ff4: b4001fc8     	cbz	x8, 0x46383ec <_ChromeMain+0x4633150>
 4637ff8: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 4637ffc: b7f81e49     	tbnz	x9, #0x3f, 0x46383c4 <_ChromeMain+0x4633128>
 4638000: b5001e69     	cbnz	x9, 0x46383cc <_ChromeMain+0x4633130>
 4638004: f9400d08     	ldr	x8, [x8, #0x18]
 4638008: f9400508     	ldr	x8, [x8, #0x8]
 463800c: 91018101     	add	x1, x8, #0x60
 4638010: 910003f8     	mov	x24, sp
 4638014: 910003e0     	mov	x0, sp
 4638018: 96fa4e3d     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 463801c: 394063e8     	ldrb	w8, [sp, #0x18]
 4638020: 37000328     	tbnz	w8, #0x0, 0x4638084 <_ChromeMain+0x4632de8>
 4638024: 9101c300     	add	x0, x24, #0x70
 4638028: d2800001     	mov	x1, #0x0                ; =0
 463802c: 96e7bf23     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4638030: 91008300     	add	x0, x24, #0x20
 4638034: 96e7bf11     	bl	0x27c78 <_ChromeMain+0x229dc>
 4638038: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 463803c: 36f803e8     	tbz	w8, #0x1f, 0x46380b8 <_ChromeMain+0x4632e1c>
 4638040: f94003e0     	ldr	x0, [sp]
 4638044: f9400be8     	ldr	x8, [sp, #0x10]
 4638048: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463804c: 96e7439b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4638050: 1400001a     	b	0x46380b8 <_ChromeMain+0x4632e1c>
 4638054: b942baa9     	ldr	w9, [x21, #0x2b8]
 4638058: 3100053f     	cmn	w9, #0x1
 463805c: 540018a1     	b.ne	0x4638370 <_ChromeMain+0x46330d4>
 4638060: 394d2109     	ldrb	w9, [x8, #0x348]
 4638064: 34fffa29     	cbz	w9, 0x4637fa8 <_ChromeMain+0x4632d0c>
 4638068: 1400009e     	b	0x46382e0 <_ChromeMain+0x4633044>
 463806c: f94003e0     	ldr	x0, [sp]
 4638070: f9400be8     	ldr	x8, [sp, #0x10]
 4638074: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4638078: 96e74390     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463807c: 360001f8     	tbz	w24, #0x0, 0x46380b8 <_ChromeMain+0x4632e1c>
 4638080: 14000080     	b	0x4638280 <_ChromeMain+0x4632fe4>
 4638084: 910003e1     	mov	x1, sp
 4638088: aa1303e8     	mov	x8, x19
 463808c: aa1403e0     	mov	x0, x20
 4638090: 97fffde1     	bl	0x4637814 <_ChromeMain+0x4632578>
 4638094: 39406278     	ldrb	w24, [x19, #0x18]
 4638098: 9101c2e0     	add	x0, x23, #0x70
 463809c: d2800001     	mov	x1, #0x0                ; =0
 46380a0: 96e7bf06     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46380a4: 910082e0     	add	x0, x23, #0x20
 46380a8: 96e7bef4     	bl	0x27c78 <_ChromeMain+0x229dc>
 46380ac: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 46380b0: 37fffde8     	tbnz	w8, #0x1f, 0x463806c <_ChromeMain+0x4632dd0>
 46380b4: 37000e78     	tbnz	w24, #0x0, 0x4638280 <_ChromeMain+0x4632fe4>
 46380b8: f9414ab7     	ldr	x23, [x21, #0x290]
 46380bc: b5000f77     	cbnz	x23, 0x46382a8 <_ChromeMain+0x463300c>
 46380c0: f94132a8     	ldr	x8, [x21, #0x260]
 46380c4: f9401d09     	ldr	x9, [x8, #0x38]
 46380c8: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 46380cc: eb16013f     	cmp	x9, x22
 46380d0: 54000f81     	b.ne	0x46382c0 <_ChromeMain+0x4633024>
 46380d4: 3100051f     	cmn	w8, #0x1
 46380d8: 540017e0     	b.eq	0x46383d4 <_ChromeMain+0x4633138>
 46380dc: f94142a9     	ldr	x9, [x21, #0x280]
 46380e0: eb08013f     	cmp	x9, x8
 46380e4: 540015a9     	b.ls	0x4638398 <_ChromeMain+0x46330fc>
 46380e8: f9413ea9     	ldr	x9, [x21, #0x278]
 46380ec: f8687937     	ldr	x23, [x9, x8, lsl #3]
 46380f0: b4000397     	cbz	x23, 0x4638160 <_ChromeMain+0x4632ec4>
 46380f4: 6f00e400     	movi.2d	v0, #0000000000000000
 46380f8: ad000260     	stp	q0, q0, [x19]
 46380fc: f9400ee8     	ldr	x8, [x23, #0x18]
 4638100: f9400508     	ldr	x8, [x8, #0x8]
 4638104: 3941e109     	ldrb	w9, [x8, #0x78]
 4638108: 34000109     	cbz	w9, 0x4638128 <_ChromeMain+0x4632e8c>
 463810c: 91018101     	add	x1, x8, #0x60
 4638110: aa1303e8     	mov	x8, x19
 4638114: aa1403e0     	mov	x0, x20
 4638118: 97fffdbf     	bl	0x4637814 <_ChromeMain+0x4632578>
 463811c: 6f00e400     	movi.2d	v0, #0000000000000000
 4638120: 39406268     	ldrb	w8, [x19, #0x18]
 4638124: 37000ae8     	tbnz	w8, #0x0, 0x4638280 <_ChromeMain+0x4632fe4>
 4638128: ad000260     	stp	q0, q0, [x19]
 463812c: 3980fee8     	ldrsb	x8, [x23, #0x3f]
 4638130: b7f81648     	tbnz	x8, #0x3f, 0x46383f8 <_ChromeMain+0x463315c>
 4638134: b5001668     	cbnz	x8, 0x4638400 <_ChromeMain+0x4633164>
 4638138: f9400ee8     	ldr	x8, [x23, #0x18]
 463813c: f9400508     	ldr	x8, [x8, #0x8]
 4638140: 91018101     	add	x1, x8, #0x60
 4638144: 39406028     	ldrb	w8, [x1, #0x18]
 4638148: 340000c8     	cbz	w8, 0x4638160 <_ChromeMain+0x4632ec4>
 463814c: aa1303e8     	mov	x8, x19
 4638150: aa1403e0     	mov	x0, x20
 4638154: 97fffdb0     	bl	0x4637814 <_ChromeMain+0x4632578>
 4638158: 39406268     	ldrb	w8, [x19, #0x18]
 463815c: 37000928     	tbnz	w8, #0x0, 0x4638280 <_ChromeMain+0x4632fe4>
 4638160: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 4638164: 3100051f     	cmn	w8, #0x1
 4638168: 54001500     	b.eq	0x4638408 <_ChromeMain+0x463316c>
 463816c: f94142a9     	ldr	x9, [x21, #0x280]
 4638170: eb08013f     	cmp	x9, x8
 4638174: 54001129     	b.ls	0x4638398 <_ChromeMain+0x46330fc>
 4638178: f9413ea9     	ldr	x9, [x21, #0x278]
 463817c: f8687936     	ldr	x22, [x9, x8, lsl #3]
 4638180: b4000396     	cbz	x22, 0x46381f0 <_ChromeMain+0x4632f54>
 4638184: 6f00e400     	movi.2d	v0, #0000000000000000
 4638188: ad000260     	stp	q0, q0, [x19]
 463818c: f9400ec8     	ldr	x8, [x22, #0x18]
 4638190: f9400508     	ldr	x8, [x8, #0x8]
 4638194: 3941e109     	ldrb	w9, [x8, #0x78]
 4638198: 34000109     	cbz	w9, 0x46381b8 <_ChromeMain+0x4632f1c>
 463819c: 91018101     	add	x1, x8, #0x60
 46381a0: aa1303e8     	mov	x8, x19
 46381a4: aa1403e0     	mov	x0, x20
 46381a8: 97fffd9b     	bl	0x4637814 <_ChromeMain+0x4632578>
 46381ac: 6f00e400     	movi.2d	v0, #0000000000000000
 46381b0: 39406268     	ldrb	w8, [x19, #0x18]
 46381b4: 37000668     	tbnz	w8, #0x0, 0x4638280 <_ChromeMain+0x4632fe4>
 46381b8: ad000260     	stp	q0, q0, [x19]
 46381bc: 3980fec8     	ldrsb	x8, [x22, #0x3f]
 46381c0: b7f812a8     	tbnz	x8, #0x3f, 0x4638414 <_ChromeMain+0x4633178>
 46381c4: b50012c8     	cbnz	x8, 0x463841c <_ChromeMain+0x4633180>
 46381c8: f9400ec8     	ldr	x8, [x22, #0x18]
 46381cc: f9400508     	ldr	x8, [x8, #0x8]
 46381d0: 91018101     	add	x1, x8, #0x60
 46381d4: 39406028     	ldrb	w8, [x1, #0x18]
 46381d8: 340000c8     	cbz	w8, 0x46381f0 <_ChromeMain+0x4632f54>
 46381dc: aa1303e8     	mov	x8, x19
 46381e0: aa1403e0     	mov	x0, x20
 46381e4: 97fffd8c     	bl	0x4637814 <_ChromeMain+0x4632578>
 46381e8: 39406268     	ldrb	w8, [x19, #0x18]
 46381ec: 370004a8     	tbnz	w8, #0x0, 0x4638280 <_ChromeMain+0x4632fe4>
 46381f0: f9447ea8     	ldr	x8, [x21, #0x8f8]
 46381f4: b4000168     	cbz	x8, 0x4638220 <_ChromeMain+0x4632f84>
 46381f8: 6f00e400     	movi.2d	v0, #0000000000000000
 46381fc: ad000260     	stp	q0, q0, [x19]
 4638200: 3946a109     	ldrb	w9, [x8, #0x1a8]
 4638204: 340000e9     	cbz	w9, 0x4638220 <_ChromeMain+0x4632f84>
 4638208: 91064101     	add	x1, x8, #0x190
 463820c: aa1303e8     	mov	x8, x19
 4638210: aa1403e0     	mov	x0, x20
 4638214: 97fffd80     	bl	0x4637814 <_ChromeMain+0x4632578>
 4638218: 39406268     	ldrb	w8, [x19, #0x18]
 463821c: 37000328     	tbnz	w8, #0x0, 0x4638280 <_ChromeMain+0x4632fe4>
 4638220: f9414ab5     	ldr	x21, [x21, #0x290]
 4638224: b40002b5     	cbz	x21, 0x4638278 <_ChromeMain+0x4632fdc>
 4638228: 6f00e400     	movi.2d	v0, #0000000000000000
 463822c: ad000260     	stp	q0, q0, [x19]
 4638230: f9400ea8     	ldr	x8, [x21, #0x18]
 4638234: f9400508     	ldr	x8, [x8, #0x8]
 4638238: 3941e109     	ldrb	w9, [x8, #0x78]
 463823c: 340000e9     	cbz	w9, 0x4638258 <_ChromeMain+0x4632fbc>
 4638240: 91018101     	add	x1, x8, #0x60
 4638244: aa1303e8     	mov	x8, x19
 4638248: aa1403e0     	mov	x0, x20
 463824c: 97fffd72     	bl	0x4637814 <_ChromeMain+0x4632578>
 4638250: 39406268     	ldrb	w8, [x19, #0x18]
 4638254: 37000168     	tbnz	w8, #0x0, 0x4638280 <_ChromeMain+0x4632fe4>
 4638258: 3980fea8     	ldrsb	x8, [x21, #0x3f]
 463825c: b7f80e48     	tbnz	x8, #0x3f, 0x4638424 <_ChromeMain+0x4633188>
 4638260: b5000e68     	cbnz	x8, 0x463842c <_ChromeMain+0x4633190>
 4638264: f9400ea8     	ldr	x8, [x21, #0x18]
 4638268: f9400508     	ldr	x8, [x8, #0x8]
 463826c: 91018101     	add	x1, x8, #0x60
 4638270: 39406028     	ldrb	w8, [x1, #0x18]
 4638274: 35000128     	cbnz	w8, 0x4638298 <_ChromeMain+0x4632ffc>
 4638278: 3900027f     	strb	wzr, [x19]
 463827c: 3900627f     	strb	wzr, [x19, #0x18]
 4638280: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 4638284: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 4638288: a94957f6     	ldp	x22, x21, [sp, #0x90]
 463828c: a9485ff8     	ldp	x24, x23, [sp, #0x80]
 4638290: 910303ff     	add	sp, sp, #0xc0
 4638294: d65f03c0     	ret
 4638298: aa1303e8     	mov	x8, x19
 463829c: aa1403e0     	mov	x0, x20
 46382a0: 97fffd5d     	bl	0x4637814 <_ChromeMain+0x4632578>
 46382a4: 17fffff7     	b	0x4638280 <_ChromeMain+0x4632fe4>
 46382a8: b942baa8     	ldr	w8, [x21, #0x2b8]
 46382ac: 3100051f     	cmn	w8, #0x1
 46382b0: 540006a1     	b.ne	0x4638384 <_ChromeMain+0x46330e8>
 46382b4: 394d22e8     	ldrb	w8, [x23, #0x348]
 46382b8: 34fff1e8     	cbz	w8, 0x46380f4 <_ChromeMain+0x4632e58>
 46382bc: 1400001b     	b	0x4638328 <_ChromeMain+0x463308c>
 46382c0: 3100051f     	cmn	w8, #0x1
 46382c4: 54fff0c1     	b.ne	0x46380dc <_ChromeMain+0x4632e40>
 46382c8: 1400005b     	b	0x4638434 <_ChromeMain+0x4633198>
 46382cc: 3100051f     	cmn	w8, #0x1
 46382d0: 54ffe601     	b.ne	0x4637f90 <_ChromeMain+0x4632cf4>
 46382d4: d4200000     	brk	#0
 46382d8: d4400000     	hlt	#0
 46382dc: d4200020     	brk	#0x1
 46382e0: 394ba2a9     	ldrb	w9, [x21, #0x2e8]
 46382e4: 34ffe489     	cbz	w9, 0x4637f74 <_ChromeMain+0x4632cd8>
 46382e8: b982b6a9     	ldrsw	x9, [x21, #0x2b4]
 46382ec: 3100053f     	cmn	w9, #0x1
 46382f0: 54000a80     	b.eq	0x4638440 <_ChromeMain+0x46331a4>
 46382f4: f94142aa     	ldr	x10, [x21, #0x280]
 46382f8: eb09015f     	cmp	x10, x9
 46382fc: 540004e9     	b.ls	0x4638398 <_ChromeMain+0x46330fc>
 4638300: f9413eaa     	ldr	x10, [x21, #0x278]
 4638304: f8697949     	ldr	x9, [x10, x9, lsl #3]
 4638308: b9443129     	ldr	w9, [x9, #0x430]
 463830c: 7100093f     	cmp	w9, #0x2
 4638310: 54ffe320     	b.eq	0x4637f74 <_ChromeMain+0x4632cd8>
 4638314: f94136a9     	ldr	x9, [x21, #0x268]
 4638318: b40009a9     	cbz	x9, 0x463844c <_ChromeMain+0x46331b0>
 463831c: 39458129     	ldrb	w9, [x9, #0x160]
 4638320: 3707e2a9     	tbnz	w9, #0x0, 0x4637f74 <_ChromeMain+0x4632cd8>
 4638324: 17ffff21     	b	0x4637fa8 <_ChromeMain+0x4632d0c>
 4638328: 394ba2a8     	ldrb	w8, [x21, #0x2e8]
 463832c: 34ffeca8     	cbz	w8, 0x46380c0 <_ChromeMain+0x4632e24>
 4638330: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 4638334: 3100051f     	cmn	w8, #0x1
 4638338: 54000900     	b.eq	0x4638458 <_ChromeMain+0x46331bc>
 463833c: f94142a9     	ldr	x9, [x21, #0x280]
 4638340: eb08013f     	cmp	x9, x8
 4638344: 540002a9     	b.ls	0x4638398 <_ChromeMain+0x46330fc>
 4638348: f9413ea9     	ldr	x9, [x21, #0x278]
 463834c: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4638350: b9443108     	ldr	w8, [x8, #0x430]
 4638354: 7100091f     	cmp	w8, #0x2
 4638358: 54ffeb40     	b.eq	0x46380c0 <_ChromeMain+0x4632e24>
 463835c: f94136a8     	ldr	x8, [x21, #0x268]
 4638360: b4000828     	cbz	x8, 0x4638464 <_ChromeMain+0x46331c8>
 4638364: 39458108     	ldrb	w8, [x8, #0x160]
 4638368: 3707eac8     	tbnz	w8, #0x0, 0x46380c0 <_ChromeMain+0x4632e24>
 463836c: 17ffff62     	b	0x46380f4 <_ChromeMain+0x4632e58>
 4638370: 394ba2a9     	ldrb	w9, [x21, #0x2e8]
 4638374: 34ffe009     	cbz	w9, 0x4637f74 <_ChromeMain+0x4632cd8>
 4638378: 394d2109     	ldrb	w9, [x8, #0x348]
 463837c: 35ffdfc9     	cbnz	w9, 0x4637f74 <_ChromeMain+0x4632cd8>
 4638380: 17ffff0a     	b	0x4637fa8 <_ChromeMain+0x4632d0c>
 4638384: 394ba2a8     	ldrb	w8, [x21, #0x2e8]
 4638388: 34ffe9c8     	cbz	w8, 0x46380c0 <_ChromeMain+0x4632e24>
 463838c: 394d22e8     	ldrb	w8, [x23, #0x348]
 4638390: 35ffe988     	cbnz	w8, 0x46380c0 <_ChromeMain+0x4632e24>
 4638394: 17ffff58     	b	0x46380f4 <_ChromeMain+0x4632e58>
 4638398: d4200020     	brk	#0x1
 463839c: f9401909     	ldr	x9, [x8, #0x30]
 46383a0: b4ffe0a9     	cbz	x9, 0x4637fb4 <_ChromeMain+0x4632d18>
 46383a4: 9100a101     	add	x1, x8, #0x28
 46383a8: 17ffff06     	b	0x4637fc0 <_ChromeMain+0x4632d24>
 46383ac: 97d0c9b3     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 46383b0: aa0003e1     	mov	x1, x0
 46383b4: 17ffff03     	b	0x4637fc0 <_ChromeMain+0x4632d24>
 46383b8: d4200000     	brk	#0
 46383bc: d4400000     	hlt	#0
 46383c0: d4200020     	brk	#0x1
 46383c4: f9401909     	ldr	x9, [x8, #0x30]
 46383c8: b4ffe1e9     	cbz	x9, 0x4638004 <_ChromeMain+0x4632d68>
 46383cc: 9100a101     	add	x1, x8, #0x28
 46383d0: 17ffff10     	b	0x4638010 <_ChromeMain+0x4632d74>
 46383d4: d4200000     	brk	#0
 46383d8: d4400000     	hlt	#0
 46383dc: d4200020     	brk	#0x1
 46383e0: d4200000     	brk	#0
 46383e4: d4400000     	hlt	#0
 46383e8: d4200020     	brk	#0x1
 46383ec: 97d0c9a3     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 46383f0: aa0003e1     	mov	x1, x0
 46383f4: 17ffff07     	b	0x4638010 <_ChromeMain+0x4632d74>
 46383f8: f9401ae8     	ldr	x8, [x23, #0x30]
 46383fc: b4ffe9e8     	cbz	x8, 0x4638138 <_ChromeMain+0x4632e9c>
 4638400: 9100a2e1     	add	x1, x23, #0x28
 4638404: 17ffff50     	b	0x4638144 <_ChromeMain+0x4632ea8>
 4638408: d4200000     	brk	#0
 463840c: d4400000     	hlt	#0
 4638410: d4200020     	brk	#0x1
 4638414: f9401ac8     	ldr	x8, [x22, #0x30]
 4638418: b4ffed88     	cbz	x8, 0x46381c8 <_ChromeMain+0x4632f2c>
 463841c: 9100a2c1     	add	x1, x22, #0x28
 4638420: 17ffff6d     	b	0x46381d4 <_ChromeMain+0x4632f38>
 4638424: f9401aa8     	ldr	x8, [x21, #0x30]
 4638428: b4fff1e8     	cbz	x8, 0x4638264 <_ChromeMain+0x4632fc8>
 463842c: 9100a2a1     	add	x1, x21, #0x28
 4638430: 17ffff90     	b	0x4638270 <_ChromeMain+0x4632fd4>
 4638434: d4200000     	brk	#0
 4638438: d4400000     	hlt	#0
 463843c: d4200020     	brk	#0x1
 4638440: d4200000     	brk	#0
 4638444: d4400000     	hlt	#0
 4638448: d4200020     	brk	#0x1
 463844c: d4200000     	brk	#0
 4638450: d4400000     	hlt	#0
 4638454: d4200020     	brk	#0x1
 4638458: d4200000     	brk	#0
 463845c: d4400000     	hlt	#0
 4638460: d4200020     	brk	#0x1
 4638464: d4200000     	brk	#0
 4638468: d4400000     	hlt	#0
 463846c: d4200020     	brk	#0x1
