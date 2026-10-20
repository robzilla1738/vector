
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3355fd8: d10243ff     	sub	sp, sp, #0x90
 3355fdc: a90467fa     	stp	x26, x25, [sp, #0x40]
 3355fe0: a9055ff8     	stp	x24, x23, [sp, #0x50]
 3355fe4: a90657f6     	stp	x22, x21, [sp, #0x60]
 3355fe8: a9074ff4     	stp	x20, x19, [sp, #0x70]
 3355fec: a9087bfd     	stp	x29, x30, [sp, #0x80]
 3355ff0: 910203fd     	add	x29, sp, #0x80
 3355ff4: aa0103f3     	mov	x19, x1
 3355ff8: aa0003f4     	mov	x20, x0
 3355ffc: 91062019     	add	x25, x0, #0x188
 3356000: f940c408     	ldr	x8, [x0, #0x188]
 3356004: 9005c2f8     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3356008: b40002c8     	cbz	x8, 0x3356060 <_ChromeMain+0x3350dc4>
 335600c: d005bbe9     	adrp	x9, 0xead4000 <dyld_stub_binder+0xead4000>
 3356010: 91314129     	add	x9, x9, #0xc50
 3356014: 1400000d     	b	0x3356048 <_ChromeMain+0x3350dac>
 3356018: eb19011f     	cmp	x8, x25
 335601c: 54000220     	b.eq	0x3356060 <_ChromeMain+0x3350dc4>
 3356020: f9401515     	ldr	x21, [x8, #0x28]
 3356024: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3356028: f9404709     	ldr	x9, [x24, #0x88]
 335602c: eb09011f     	cmp	x8, x9
 3356030: 540001a1     	b.ne	0x3356064 <_ChromeMain+0x3350dc8>
 3356034: aa1503e0     	mov	x0, x21
 3356038: 9732f8b1     	bl	0x142fc <_ChromeMain+0xf060>
 335603c: 1400000a     	b	0x3356064 <_ChromeMain+0x3350dc8>
 3356040: f9400108     	ldr	x8, [x8]
 3356044: b40000e8     	cbz	x8, 0x3356060 <_ChromeMain+0x3350dc4>
 3356048: f940110a     	ldr	x10, [x8, #0x20]
 335604c: eb09015f     	cmp	x10, x9
 3356050: 54ffff88     	b.hi	0x3356040 <_ChromeMain+0x3350da4>
 3356054: 54fffe20     	b.eq	0x3356018 <_ChromeMain+0x3350d7c>
 3356058: f9400508     	ldr	x8, [x8, #0x8]
 335605c: b5ffff68     	cbnz	x8, 0x3356048 <_ChromeMain+0x3350dac>
 3356060: d2800015     	mov	x21, #0x0               ; =0
 3356064: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3356068: f9404709     	ldr	x9, [x24, #0x88]
 335606c: eb09011f     	cmp	x8, x9
 3356070: 54000061     	b.ne	0x335607c <_ChromeMain+0x3350de0>
 3356074: aa1503e0     	mov	x0, x21
 3356078: 97333271     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 335607c: 394522a8     	ldrb	w8, [x21, #0x148]
 3356080: 350000c8     	cbnz	w8, 0x3356098 <_ChromeMain+0x3350dfc>
 3356084: f9400328     	ldr	x8, [x25]
 3356088: b4000468     	cbz	x8, 0x3356114 <_ChromeMain+0x3350e78>
 335608c: f005a9c9     	adrp	x9, 0xe891000 <dyld_stub_binder+0xe891000>
 3356090: 91234129     	add	x9, x9, #0x8d0
 3356094: 1400001a     	b	0x33560fc <_ChromeMain+0x3350e60>
 3356098: f0055b60     	adrp	x0, 0xdec5000 <dyld_stub_binder+0xdec5000>
 335609c: 91080400     	add	x0, x0, #0x201
 33560a0: 910043e8     	add	x8, sp, #0x10
 33560a4: 5280f841     	mov	w1, #0x7c2              ; =1986
 33560a8: 9551f4fb     	bl	0x87d3494 <_ChromeMain+0x87ce1f8>
 33560ac: f0055b60     	adrp	x0, 0xdec5000 <dyld_stub_binder+0xdec5000>
 33560b0: 910f6800     	add	x0, x0, #0x3da
 33560b4: 910023e8     	add	x8, sp, #0x8
 33560b8: 910043e1     	add	x1, sp, #0x10
 33560bc: 9551e439     	bl	0x87cf1a0 <_ChromeMain+0x87c9f04>
 33560c0: 910023e0     	add	x0, sp, #0x8
 33560c4: 9551e4a8     	bl	0x87cf364 <_ChromeMain+0x87ca0c8>
 33560c8: 17ffffef     	b	0x3356084 <_ChromeMain+0x3350de8>
 33560cc: eb19011f     	cmp	x8, x25
 33560d0: 54000220     	b.eq	0x3356114 <_ChromeMain+0x3350e78>
 33560d4: f9401515     	ldr	x21, [x8, #0x28]
 33560d8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 33560dc: f9404709     	ldr	x9, [x24, #0x88]
 33560e0: eb09011f     	cmp	x8, x9
 33560e4: 540001a1     	b.ne	0x3356118 <_ChromeMain+0x3350e7c>
 33560e8: aa1503e0     	mov	x0, x21
 33560ec: 9732f884     	bl	0x142fc <_ChromeMain+0xf060>
 33560f0: 1400000a     	b	0x3356118 <_ChromeMain+0x3350e7c>
 33560f4: f9400108     	ldr	x8, [x8]
 33560f8: b40000e8     	cbz	x8, 0x3356114 <_ChromeMain+0x3350e78>
 33560fc: f940110a     	ldr	x10, [x8, #0x20]
 3356100: eb09015f     	cmp	x10, x9
 3356104: 54ffff88     	b.hi	0x33560f4 <_ChromeMain+0x3350e58>
 3356108: 54fffe20     	b.eq	0x33560cc <_ChromeMain+0x3350e30>
 335610c: f9400508     	ldr	x8, [x8, #0x8]
 3356110: b5ffff68     	cbnz	x8, 0x33560fc <_ChromeMain+0x3350e60>
 3356114: d2800015     	mov	x21, #0x0               ; =0
 3356118: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 335611c: f9404709     	ldr	x9, [x24, #0x88]
 3356120: eb09011f     	cmp	x8, x9
 3356124: 54000061     	b.ne	0x3356130 <_ChromeMain+0x3350e94>
 3356128: aa1503e0     	mov	x0, x21
 335612c: 97333244     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 3356130: aa1303e0     	mov	x0, x19
 3356134: aa1503e1     	mov	x1, x21
 3356138: 97db4d3c     	bl	0x2a29628 <_ChromeMain+0x2a2438c>
 335613c: 90050ba1     	adrp	x1, 0xd4ca000 <dyld_stub_binder+0xd4ca000>
 3356140: 91090021     	add	x1, x1, #0x240
 3356144: 91002260     	add	x0, x19, #0x8
 3356148: 9733f40a     	bl	0x53170 <_ChromeMain+0x4ded4>
 335614c: d100a008     	sub	x8, x0, #0x28
 3356150: f100001f     	cmp	x0, #0x0
 3356154: 9a8803f6     	csel	x22, xzr, x8, eq
 3356158: f9400328     	ldr	x8, [x25]
 335615c: b40002c8     	cbz	x8, 0x33561b4 <_ChromeMain+0x3350f18>
 3356160: f005a9c9     	adrp	x9, 0xe891000 <dyld_stub_binder+0xe891000>
 3356164: 9133a129     	add	x9, x9, #0xce8
 3356168: 1400000d     	b	0x335619c <_ChromeMain+0x3350f00>
 335616c: eb19011f     	cmp	x8, x25
 3356170: 54000220     	b.eq	0x33561b4 <_ChromeMain+0x3350f18>
 3356174: f9401517     	ldr	x23, [x8, #0x28]
 3356178: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 335617c: f9404709     	ldr	x9, [x24, #0x88]
 3356180: eb09011f     	cmp	x8, x9
 3356184: 540001a1     	b.ne	0x33561b8 <_ChromeMain+0x3350f1c>
 3356188: aa1703e0     	mov	x0, x23
 335618c: 9732f85c     	bl	0x142fc <_ChromeMain+0xf060>
 3356190: 1400000a     	b	0x33561b8 <_ChromeMain+0x3350f1c>
 3356194: f9400108     	ldr	x8, [x8]
 3356198: b40000e8     	cbz	x8, 0x33561b4 <_ChromeMain+0x3350f18>
 335619c: f940110a     	ldr	x10, [x8, #0x20]
 33561a0: eb09015f     	cmp	x10, x9
 33561a4: 54ffff88     	b.hi	0x3356194 <_ChromeMain+0x3350ef8>
 33561a8: 54fffe20     	b.eq	0x335616c <_ChromeMain+0x3350ed0>
 33561ac: f9400508     	ldr	x8, [x8, #0x8]
 33561b0: b5ffff68     	cbnz	x8, 0x335619c <_ChromeMain+0x3350f00>
 33561b4: d2800017     	mov	x23, #0x0               ; =0
 33561b8: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 33561bc: f9404709     	ldr	x9, [x24, #0x88]
 33561c0: eb09011f     	cmp	x8, x9
 33561c4: 54000061     	b.ne	0x33561d0 <_ChromeMain+0x3350f34>
 33561c8: aa1703e0     	mov	x0, x23
 33561cc: 9733321c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 33561d0: aa1603e0     	mov	x0, x22
 33561d4: aa1703e1     	mov	x1, x23
 33561d8: 97dc2c6c     	bl	0x2a61388 <_ChromeMain+0x2a5c0ec>
 33561dc: b40013f5     	cbz	x21, 0x3356458 <_ChromeMain+0x33511bc>
 33561e0: 91048280     	add	x0, x20, #0x120
 33561e4: aa1303e1     	mov	x1, x19
 33561e8: 97fabc9b     	bl	0x3205454 <_ChromeMain+0x32001b8>
 33561ec: f9400328     	ldr	x8, [x25]
 33561f0: b40002c8     	cbz	x8, 0x3356248 <_ChromeMain+0x3350fac>
 33561f4: d005bbe9     	adrp	x9, 0xead4000 <dyld_stub_binder+0xead4000>
 33561f8: 912b4129     	add	x9, x9, #0xad0
 33561fc: 1400000d     	b	0x3356230 <_ChromeMain+0x3350f94>
 3356200: eb19011f     	cmp	x8, x25
 3356204: 54000220     	b.eq	0x3356248 <_ChromeMain+0x3350fac>
 3356208: f9401515     	ldr	x21, [x8, #0x28]
 335620c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3356210: f9404709     	ldr	x9, [x24, #0x88]
 3356214: eb09011f     	cmp	x8, x9
 3356218: 540001a1     	b.ne	0x335624c <_ChromeMain+0x3350fb0>
 335621c: aa1503e0     	mov	x0, x21
 3356220: 9732f837     	bl	0x142fc <_ChromeMain+0xf060>
 3356224: 1400000a     	b	0x335624c <_ChromeMain+0x3350fb0>
 3356228: f9400108     	ldr	x8, [x8]
 335622c: b40000e8     	cbz	x8, 0x3356248 <_ChromeMain+0x3350fac>
 3356230: f940110a     	ldr	x10, [x8, #0x20]
 3356234: eb09015f     	cmp	x10, x9
 3356238: 54ffff88     	b.hi	0x3356228 <_ChromeMain+0x3350f8c>
 335623c: 54fffe20     	b.eq	0x3356200 <_ChromeMain+0x3350f64>
 3356240: f9400508     	ldr	x8, [x8, #0x8]
 3356244: b5ffff68     	cbnz	x8, 0x3356230 <_ChromeMain+0x3350f94>
 3356248: d2800015     	mov	x21, #0x0               ; =0
 335624c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3356250: f9404709     	ldr	x9, [x24, #0x88]
 3356254: eb09011f     	cmp	x8, x9
 3356258: 54000061     	b.ne	0x3356264 <_ChromeMain+0x3350fc8>
 335625c: aa1503e0     	mov	x0, x21
 3356260: 973331f7     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 3356264: 3940fea9     	ldrb	w9, [x21, #0x3f]
 3356268: 13001d28     	sxtb	w8, w9
 335626c: f9401aaa     	ldr	x10, [x21, #0x30]
 3356270: 7100011f     	cmp	w8, #0x0
 3356274: 9a894149     	csel	x9, x10, x9, mi
 3356278: f1002d3f     	cmp	x9, #0xb
 335627c: 540001e1     	b.ne	0x33562b8 <_ChromeMain+0x335101c>
 3356280: f8428ea9     	ldr	x9, [x21, #0x28]!
 3356284: 7100011f     	cmp	w8, #0x0
 3356288: 9a954128     	csel	x8, x9, x21, mi
 335628c: f0051c69     	adrp	x9, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 3356290: 913e5929     	add	x9, x9, #0xf96
 3356294: f940010a     	ldr	x10, [x8]
 3356298: f940012b     	ldr	x11, [x9]
 335629c: f8403108     	ldur	x8, [x8, #0x3]
 33562a0: f8403129     	ldur	x9, [x9, #0x3]
 33562a4: eb0b015f     	cmp	x10, x11
 33562a8: fa490100     	ccmp	x8, x9, #0x0, eq
 33562ac: 54000061     	b.ne	0x33562b8 <_ChromeMain+0x335101c>
 33562b0: 52800028     	mov	w8, #0x1                ; =1
 33562b4: 3936e668     	strb	w8, [x19, #0xdb9]
 33562b8: f940ce8a     	ldr	x10, [x20, #0x198]
 33562bc: 9100a148     	add	x8, x10, #0x28
 33562c0: 3980fd49     	ldrsb	x9, [x10, #0x3f]
 33562c4: f940194a     	ldr	x10, [x10, #0x30]
 33562c8: b6f80249     	tbz	x9, #0x3f, 0x3356310 <_ChromeMain+0x3351074>
 33562cc: f100715f     	cmp	x10, #0x1c
 33562d0: 54000201     	b.ne	0x3356310 <_ChromeMain+0x3351074>
 33562d4: f940010a     	ldr	x10, [x8]
 33562d8: b004dc0b     	adrp	x11, 0xced7000 <dyld_stub_binder+0xced7000>
 33562dc: 910e656b     	add	x11, x11, #0x399
 33562e0: a940354c     	ldp	x12, x13, [x10]
 33562e4: a9403d6e     	ldp	x14, x15, [x11]
 33562e8: f9400950     	ldr	x16, [x10, #0x10]
 33562ec: f9400971     	ldr	x17, [x11, #0x10]
 33562f0: b940194a     	ldr	w10, [x10, #0x18]
 33562f4: b940196b     	ldr	w11, [x11, #0x18]
 33562f8: eb0e019f     	cmp	x12, x14
 33562fc: fa4f01a0     	ccmp	x13, x15, #0x0, eq
 3356300: fa510200     	ccmp	x16, x17, #0x0, eq
 3356304: fa4b0140     	ccmp	x10, x11, #0x0, eq
 3356308: 54000260     	b.eq	0x3356354 <_ChromeMain+0x33510b8>
 335630c: 5280038a     	mov	w10, #0x1c              ; =28
 3356310: 7100013f     	cmp	w9, #0x0
 3356314: 9a89414a     	csel	x10, x10, x9, mi
 3356318: f100555f     	cmp	x10, #0x15
 335631c: 54000441     	b.ne	0x33563a4 <_ChromeMain+0x3351108>
 3356320: f940010a     	ldr	x10, [x8]
 3356324: 7100013f     	cmp	w9, #0x0
 3356328: 9a884148     	csel	x8, x10, x8, mi
 335632c: f004dd29     	adrp	x9, 0xcefd000 <dyld_stub_binder+0xcefd000>
 3356330: 911fd929     	add	x9, x9, #0x7f6
 3356334: a9402d0a     	ldp	x10, x11, [x8]
 3356338: a940352c     	ldp	x12, x13, [x9]
 335633c: f840d108     	ldur	x8, [x8, #0xd]
 3356340: f840d129     	ldur	x9, [x9, #0xd]
 3356344: eb0c015f     	cmp	x10, x12
 3356348: fa4d0160     	ccmp	x11, x13, #0x0, eq
 335634c: fa490100     	ccmp	x8, x9, #0x0, eq
 3356350: 540002a1     	b.ne	0x33563a4 <_ChromeMain+0x3351108>
 3356354: 52824b28     	mov	w8, #0x1259             ; =4697
 3356358: 52800029     	mov	w9, #0x1                ; =1
 335635c: 38286a69     	strb	w9, [x19, x8]
 3356360: 3900dfe9     	strb	w9, [sp, #0x37]
 3356364: d0ff8c95     	adrp	x21, 0x24e8000 <_ChromeMain+0x24e2d64>
 3356368: 911452b5     	add	x21, x21, #0x514
 335636c: 528004a8     	mov	w8, #0x25               ; =37
 3356370: f9001fe8     	str	x8, [sp, #0x38]
 3356374: f005dd96     	adrp	x22, 0xef09000 <dyld_stub_binder+0xef09000>
 3356378: 395636c0     	ldrb	w0, [x22, #0x58d]
 335637c: 35000840     	cbnz	w0, 0x3356484 <_ChromeMain+0x33511e8>
 3356380: 9123a260     	add	x0, x19, #0x8e8
 3356384: 9100dfe1     	add	x1, sp, #0x37
 3356388: aa1503e2     	mov	x2, x21
 335638c: d2800003     	mov	x3, #0x0                ; =0
 3356390: 97b00d2a     	bl	0x1f59838 <_ChromeMain+0x1f5459c>
 3356394: 528004a8     	mov	w8, #0x25               ; =37
 3356398: f9001fe8     	str	x8, [sp, #0x38]
 335639c: 395636c0     	ldrb	w0, [x22, #0x58d]
 33563a0: 35000660     	cbnz	w0, 0x335646c <_ChromeMain+0x33511d0>
 33563a4: 39441288     	ldrb	w8, [x20, #0x104]
 33563a8: 37000368     	tbnz	w8, #0x0, 0x3356414 <_ChromeMain+0x3351178>
 33563ac: 3943c288     	ldrb	w8, [x20, #0xf0]
 33563b0: 37000328     	tbnz	w8, #0x0, 0x3356414 <_ChromeMain+0x3351178>
 33563b4: f9400328     	ldr	x8, [x25]
 33563b8: b4000188     	cbz	x8, 0x33563e8 <_ChromeMain+0x335114c>
 33563bc: f005a9e9     	adrp	x9, 0xe895000 <dyld_stub_binder+0xe895000>
 33563c0: 9119e129     	add	x9, x9, #0x678
 33563c4: 14000003     	b	0x33563d0 <_ChromeMain+0x3351134>
 33563c8: f9400108     	ldr	x8, [x8]
 33563cc: b40000e8     	cbz	x8, 0x33563e8 <_ChromeMain+0x335114c>
 33563d0: f940110a     	ldr	x10, [x8, #0x20]
 33563d4: eb09015f     	cmp	x10, x9
 33563d8: 54ffff88     	b.hi	0x33563c8 <_ChromeMain+0x335112c>
 33563dc: 540002a0     	b.eq	0x3356430 <_ChromeMain+0x3351194>
 33563e0: f9400508     	ldr	x8, [x8, #0x8]
 33563e4: b5ffff68     	cbnz	x8, 0x33563d0 <_ChromeMain+0x3351134>
 33563e8: d2800014     	mov	x20, #0x0               ; =0
 33563ec: 925e7688     	and	x8, x20, #0xfffffffc00000000
 33563f0: f9404709     	ldr	x9, [x24, #0x88]
 33563f4: eb09011f     	cmp	x8, x9
 33563f8: 54000061     	b.ne	0x3356404 <_ChromeMain+0x3351168>
 33563fc: aa1403e0     	mov	x0, x20
 3356400: 9733318f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 3356404: aa1403e0     	mov	x0, x20
 3356408: aa1303e1     	mov	x1, x19
 335640c: 52800022     	mov	w2, #0x1                ; =1
 3356410: 978d800c     	bl	0x16b6440 <_ChromeMain+0x16b11a4>
 3356414: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 3356418: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 335641c: a94657f6     	ldp	x22, x21, [sp, #0x60]
 3356420: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 3356424: a94467fa     	ldp	x26, x25, [sp, #0x40]
 3356428: 910243ff     	add	sp, sp, #0x90
 335642c: d65f03c0     	ret
 3356430: eb19011f     	cmp	x8, x25
 3356434: 54fffda0     	b.eq	0x33563e8 <_ChromeMain+0x335114c>
 3356438: f9401514     	ldr	x20, [x8, #0x28]
 335643c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 3356440: f9404709     	ldr	x9, [x24, #0x88]
 3356444: eb09011f     	cmp	x8, x9
 3356448: 54fffd21     	b.ne	0x33563ec <_ChromeMain+0x3351150>
 335644c: aa1403e0     	mov	x0, x20
 3356450: 9732f7ab     	bl	0x142fc <_ChromeMain+0xf060>
 3356454: 17ffffe6     	b	0x33563ec <_ChromeMain+0x3351150>
 3356458: f9000bf3     	str	x19, [sp, #0x10]
 335645c: 9104a280     	add	x0, x20, #0x128
 3356460: 910043e1     	add	x1, sp, #0x10
 3356464: 97d68588     	bl	0x28f7a84 <_ChromeMain+0x28f27e8>
 3356468: 17ffff61     	b	0x33561ec <_ChromeMain+0x3350f50>
 335646c: f9000bff     	str	xzr, [sp, #0x10]
 3356470: 9100e3e1     	add	x1, sp, #0x38
 3356474: 910043e2     	add	x2, sp, #0x10
 3356478: 52800043     	mov	w3, #0x2                ; =2
 335647c: 973c7603     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 3356480: 17ffffc9     	b	0x33563a4 <_ChromeMain+0x3351108>
 3356484: f0053288     	adrp	x8, 0xd9a9000 <dyld_stub_binder+0xd9a9000>
 3356488: 913a4508     	add	x8, x8, #0xe91
 335648c: f9000be8     	str	x8, [sp, #0x10]
 3356490: 9100e3e1     	add	x1, sp, #0x38
 3356494: 910043e2     	add	x2, sp, #0x10
 3356498: 52800023     	mov	w3, #0x1                ; =1
 335649c: 973c75fb     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 33564a0: 17ffffb8     	b	0x3356380 <_ChromeMain+0x33510e4>
