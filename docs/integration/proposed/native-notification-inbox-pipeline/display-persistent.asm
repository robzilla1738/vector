
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 77daf18: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 77daf1c: a90167fa     	stp	x26, x25, [sp, #0x10]
 77daf20: a9025ff8     	stp	x24, x23, [sp, #0x20]
 77daf24: a90357f6     	stp	x22, x21, [sp, #0x30]
 77daf28: a9044ff4     	stp	x20, x19, [sp, #0x40]
 77daf2c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 77daf30: 910143fd     	add	x29, sp, #0x50
 77daf34: d10f03ff     	sub	sp, sp, #0x3c0
 77daf38: aa0503f7     	mov	x23, x5
 77daf3c: aa0403f6     	mov	x22, x4
 77daf40: aa0303f5     	mov	x21, x3
 77daf44: aa0203f8     	mov	x24, x2
 77daf48: aa0103f9     	mov	x25, x1
 77daf4c: aa0003f3     	mov	x19, x0
 77daf50: 91008000     	add	x0, x0, #0x20
 77daf54: 9767183b     	bl	0x51a1040 <_ChromeMain+0x519bda4>
 77daf58: b5000220     	cbnz	x0, 0x77daf9c <_ChromeMain+0x77d5d00>
 77daf5c: 9003b868     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 77daf60: f9467d08     	ldr	x8, [x8, #0xcf8]
 77daf64: 39448109     	ldrb	w9, [x8, #0x120]
 77daf68: 370000a9     	tbnz	w9, #0x0, 0x77daf7c <_ChromeMain+0x77d5ce0>
 77daf6c: 39448508     	ldrb	w8, [x8, #0x121]
 77daf70: 37000068     	tbnz	w8, #0x0, 0x77daf7c <_ChromeMain+0x77d5ce0>
 77daf74: f9400e68     	ldr	x8, [x19, #0x18]
 77daf78: b50001a8     	cbnz	x8, 0x77dafac <_ChromeMain+0x77d5d10>
 77daf7c: 910f03ff     	add	sp, sp, #0x3c0
 77daf80: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 77daf84: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 77daf88: a94357f6     	ldp	x22, x21, [sp, #0x30]
 77daf8c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 77daf90: a94167fa     	ldp	x26, x25, [sp, #0x10]
 77daf94: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 77daf98: d65f03c0     	ret
 77daf9c: aa0003e1     	mov	x1, x0
 77dafa0: 91008260     	add	x0, x19, #0x20
 77dafa4: 97872ba7     	bl	0x59a5e40 <_ChromeMain+0x59a0ba4>
 77dafa8: 17ffffed     	b	0x77daf5c <_ChromeMain+0x77d5cc0>
 77dafac: 9101a3e0     	add	x0, sp, #0x68
 77dafb0: 52806b01     	mov	w1, #0x358              ; =856
 77dafb4: 954f69e0     	bl	0xcbb5734 <dyld_stub_binder+0xcbb5734>
 77dafb8: 9101a3e8     	add	x8, sp, #0x68
 77dafbc: aa1303e0     	mov	x0, x19
 77dafc0: aa1503e1     	mov	x1, x21
 77dafc4: aa1903e2     	mov	x2, x25
 77dafc8: aa1603e3     	mov	x3, x22
 77dafcc: aa1703e4     	mov	x4, x23
 77dafd0: aa1803e5     	mov	x5, x24
 77dafd4: 97fffe21     	bl	0x77da858 <_ChromeMain+0x77d55bc>
 77dafd8: 52801200     	mov	w0, #0x90               ; =144
 77dafdc: 9620d0e3     	bl	0xf368 <_ChromeMain+0xa0cc>
 77dafe0: aa0003f4     	mov	x20, x0
 77dafe4: 90034e88     	adrp	x8, 0xe1aa000 <dyld_stub_binder+0xe1aa000>
 77dafe8: 91272108     	add	x8, x8, #0x9c8
 77dafec: f9000008     	str	x8, [x0]
 77daff0: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 77daff4: b802701f     	stur	wzr, [x0, #0x27]
 77daff8: f8010c1f     	str	xzr, [x0, #0x10]!
 77daffc: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 77db000: ad018280     	stp	q0, q0, [x20, #0x30]
 77db004: ad028280     	stp	q0, q0, [x20, #0x50]
 77db008: 7900e29f     	strh	wzr, [x20, #0x70]
 77db00c: b9000a9f     	str	wzr, [x20, #0x8]
 77db010: a907fe9f     	stp	xzr, xzr, [x20, #0x78]
 77db014: 7901129f     	strh	wzr, [x20, #0x88]
 77db018: aa1803e1     	mov	x1, x24
 77db01c: 9633c23c     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 77db020: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 77db024: f90033ff     	str	xzr, [sp, #0x60]
 77db028: 5280003a     	mov	w26, #0x1               ; =1
 77db02c: 910143e8     	add	x8, sp, #0x50
 77db030: aa1903e0     	mov	x0, x25
 77db034: aa1503e1     	mov	x1, x21
 77db038: aa1803e2     	mov	x2, x24
 77db03c: aa1603e3     	mov	x3, x22
 77db040: 52800024     	mov	w4, #0x1                ; =1
 77db044: 97247c74     	bl	0x40fa214 <_ChromeMain+0x40f4f78>
 77db048: f9402be8     	ldr	x8, [sp, #0x50]
 77db04c: f9001fe8     	str	x8, [sp, #0x38]
 77db050: 3cc583e0     	ldur	q0, [sp, #0x58]
 77db054: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 77db058: f90033ff     	str	xzr, [sp, #0x60]
 77db05c: 3c8403e0     	stur	q0, [sp, #0x40]
 77db060: f94002e8     	ldr	x8, [x23]
 77db064: b4000068     	cbz	x8, 0x77db070 <_ChromeMain+0x77d5dd4>
 77db068: 91002109     	add	x9, x8, #0x8
 77db06c: b83a0129     	ldadd	w26, w9, [x9]
 77db070: f90007e8     	str	x8, [sp, #0x8]
 77db074: 3cc082e0     	ldur	q0, [x23, #0x8]
 77db078: 3c8103e0     	stur	q0, [sp, #0x10]
 77db07c: f9400ee8     	ldr	x8, [x23, #0x18]
 77db080: b4000068     	cbz	x8, 0x77db08c <_ChromeMain+0x77d5df0>
 77db084: 52800029     	mov	w9, #0x1                ; =1
 77db088: b8290109     	ldadd	w9, w9, [x8]
 77db08c: f90013e8     	str	x8, [sp, #0x20]
 77db090: 3dc00ae0     	ldr	q0, [x23, #0x20]
 77db094: 3c8283e0     	stur	q0, [sp, #0x28]
 77db098: 9100e3e1     	add	x1, sp, #0x38
 77db09c: 910023e2     	add	x2, sp, #0x8
 77db0a0: aa1303e0     	mov	x0, x19
 77db0a4: 52800023     	mov	w3, #0x1                ; =1
 77db0a8: 9724760a     	bl	0x40f88d0 <_ChromeMain+0x40f3634>
 77db0ac: f94013e0     	ldr	x0, [sp, #0x20]
 77db0b0: b40000a0     	cbz	x0, 0x77db0c4 <_ChromeMain+0x77d5e28>
 77db0b4: 12800008     	mov	w8, #-0x1               ; =-1
 77db0b8: b8e80008     	ldaddal	w8, w8, [x0]
 77db0bc: 7100051f     	cmp	w8, #0x1
 77db0c0: 54001860     	b.eq	0x77db3cc <_ChromeMain+0x77d6130>
 77db0c4: f94007e0     	ldr	x0, [sp, #0x8]
 77db0c8: b5000820     	cbnz	x0, 0x77db1cc <_ChromeMain+0x77d5f30>
 77db0cc: 9100e3e0     	add	x0, sp, #0x38
 77db0d0: 96460cec     	bl	0x95e480 <_ChromeMain+0x9591e4>
 77db0d4: f9400e60     	ldr	x0, [x19, #0x18]
 77db0d8: aa1503e1     	mov	x1, x21
 77db0dc: 97247d4b     	bl	0x40fa608 <_ChromeMain+0x40f536c>
 77db0e0: 370006a0     	tbnz	w0, #0x0, 0x77db1b4 <_ChromeMain+0x77d5f18>
 77db0e4: f9400e60     	ldr	x0, [x19, #0x18]
 77db0e8: f9400008     	ldr	x8, [x0]
 77db0ec: f940b508     	ldr	x8, [x8, #0x168]
 77db0f0: d63f0100     	blr	x8
 77db0f4: f002b3a1     	adrp	x1, 0xce52000 <dyld_stub_binder+0xce52000>
 77db0f8: 91146821     	add	x1, x1, #0x51a
 77db0fc: 52800282     	mov	w2, #0x14               ; =20
 77db100: 962cad00     	bl	0x306500 <_ChromeMain+0x301264>
 77db104: 340001e0     	cbz	w0, 0x77db140 <_ChromeMain+0x77d5ea4>
 77db108: f9400e60     	ldr	x0, [x19, #0x18]
 77db10c: f9400008     	ldr	x8, [x0]
 77db110: f940b508     	ldr	x8, [x8, #0x168]
 77db114: d63f0100     	blr	x8
 77db118: aa0003e1     	mov	x1, x0
 77db11c: aa1503e0     	mov	x0, x21
 77db120: 970cd2f9     	bl	0x3b0fd04 <_ChromeMain+0x3b0aa68>
 77db124: 370000e0     	tbnz	w0, #0x0, 0x77db140 <_ChromeMain+0x77d5ea4>
 77db128: f9400e77     	ldr	x23, [x19, #0x18]
 77db12c: 96dfdfa1     	bl	0x2fd2fb0 <_ChromeMain+0x2fcdd14>
 77db130: aa1703e1     	mov	x1, x23
 77db134: 52800022     	mov	w2, #0x1                ; =1
 77db138: 9621df17     	bl	0x52d94 <_ChromeMain+0x4daf8>
 77db13c: b50009a0     	cbnz	x0, 0x77db270 <_ChromeMain+0x77d5fd4>
 77db140: f9400e75     	ldr	x21, [x19, #0x18]
 77db144: b003b928     	adrp	x8, 0xef00000 <dyld_stub_binder+0xef00000>
 77db148: 9127a108     	add	x8, x8, #0x9e8
 77db14c: 38bfc108     	ldaprb	w8, [x8]
 77db150: 36000508     	tbz	w8, #0x0, 0x77db1f0 <_ChromeMain+0x77d5f54>
 77db154: b003b920     	adrp	x0, 0xef00000 <dyld_stub_binder+0xef00000>
 77db158: 91268000     	add	x0, x0, #0x9a0
 77db15c: aa1503e1     	mov	x1, x21
 77db160: 52800022     	mov	w2, #0x1                ; =1
 77db164: 9621df0c     	bl	0x52d94 <_ChromeMain+0x4daf8>
 77db168: 9101a3f5     	add	x21, sp, #0x68
 77db16c: 9101a3e2     	add	x2, sp, #0x68
 77db170: 52800001     	mov	w1, #0x0                ; =0
 77db174: aa1403e3     	mov	x3, x20
 77db178: 97fff279     	bl	0x77d7b5c <_ChromeMain+0x77d28c0>
 77db17c: 910262a3     	add	x3, x21, #0x98
 77db180: aa1303e0     	mov	x0, x19
 77db184: 9400018a     	bl	0x77db7ac <_ChromeMain+0x77d6510>
 77db188: 910262a0     	add	x0, x21, #0x98
 77db18c: 946244c2     	bl	0x906c494 <_ChromeMain+0x90671f8>
 77db190: aa0003e2     	mov	x2, x0
 77db194: f9400e60     	ldr	x0, [x19, #0x18]
 77db198: 910262a1     	add	x1, x21, #0x98
 77db19c: 942bb319     	bl	0x82c7e00 <_ChromeMain+0x82c2b64>
 77db1a0: 910143e0     	add	x0, sp, #0x50
 77db1a4: 96460cb7     	bl	0x95e480 <_ChromeMain+0x9591e4>
 77db1a8: 9101a3e0     	add	x0, sp, #0x68
 77db1ac: 95323f76     	bl	0xc46af84 <_ChromeMain+0xc465ce8>
 77db1b0: 17ffff73     	b	0x77daf7c <_ChromeMain+0x77d5ce0>
 77db1b4: 910143e0     	add	x0, sp, #0x50
 77db1b8: 96460cb2     	bl	0x95e480 <_ChromeMain+0x9591e4>
 77db1bc: b4ffff74     	cbz	x20, 0x77db1a8 <_ChromeMain+0x77d5f0c>
 77db1c0: aa1403e0     	mov	x0, x20
 77db1c4: 97ffeb61     	bl	0x77d5f48 <_ChromeMain+0x77d0cac>
 77db1c8: 17fffff8     	b	0x77db1a8 <_ChromeMain+0x77d5f0c>
 77db1cc: 91002008     	add	x8, x0, #0x8
 77db1d0: 12800009     	mov	w9, #-0x1               ; =-1
 77db1d4: b8e90108     	ldaddal	w9, w8, [x8]
 77db1d8: 7100051f     	cmp	w8, #0x1
 77db1dc: 54fff781     	b.ne	0x77db0cc <_ChromeMain+0x77d5e30>
 77db1e0: f9400008     	ldr	x8, [x0]
 77db1e4: f9400908     	ldr	x8, [x8, #0x10]
 77db1e8: d63f0100     	blr	x8
 77db1ec: 17ffffb8     	b	0x77db0cc <_ChromeMain+0x77d5e30>
 77db1f0: b003b936     	adrp	x22, 0xef00000 <dyld_stub_binder+0xef00000>
 77db1f4: 9127a2d6     	add	x22, x22, #0x9e8
 77db1f8: aa1603e0     	mov	x0, x22
 77db1fc: 954d690c     	bl	0xcb3562c <_ChromeMain+0xcb30390>
 77db200: 34fffaa0     	cbz	w0, 0x77db154 <_ChromeMain+0x77d5eb8>
 77db204: b003b920     	adrp	x0, 0xef00000 <dyld_stub_binder+0xef00000>
 77db208: 91268000     	add	x0, x0, #0x9a0
 77db20c: 96c3bad5     	bl	0x28c9d60 <_ChromeMain+0x28c4ac4>
 77db210: 52800037     	mov	w23, #0x1               ; =1
 77db214: 089ffed7     	stlrb	w23, [x22]
 77db218: 9003a880     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 77db21c: 9127c000     	add	x0, x0, #0x9f0
 77db220: 954f6987     	bl	0xcbb583c <dyld_stub_binder+0xcbb583c>
 77db224: 35000f00     	cbnz	w0, 0x77db404 <_ChromeMain+0x77d6168>
 77db228: b003b928     	adrp	x8, 0xef00000 <dyld_stub_binder+0xef00000>
 77db22c: 3967a516     	ldrb	w22, [x8, #0x9e9]
 77db230: 3927a517     	strb	w23, [x8, #0x9e9]
 77db234: 9003a880     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 77db238: 9127c000     	add	x0, x0, #0x9f0
 77db23c: 954f6962     	bl	0xcbb57c4 <dyld_stub_binder+0xcbb57c4>
 77db240: 35000cc0     	cbnz	w0, 0x77db3d8 <_ChromeMain+0x77d613c>
 77db244: 3617f896     	tbz	w22, #0x2, 0x77db154 <_ChromeMain+0x77d5eb8>
 77db248: 9003a880     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 77db24c: 9128c000     	add	x0, x0, #0xa30
 77db250: 954f6978     	bl	0xcbb5830 <dyld_stub_binder+0xcbb5830>
 77db254: 34fff800     	cbz	w0, 0x77db154 <_ChromeMain+0x77d5eb8>
 77db258: b00338c8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 77db25c: 911c4d08     	add	x8, x8, #0x713
 77db260: f90003e8     	str	x8, [sp]
 77db264: b00338c0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 77db268: 911c9c00     	add	x0, x0, #0x727
 77db26c: 954d60d6     	bl	0xcb335c4 <_ChromeMain+0xcb2e328>
 77db270: aa0003f7     	mov	x23, x0
 77db274: b0039e60     	adrp	x0, 0xeba8000 <dyld_stub_binder+0xeba8000>
 77db278: 91360000     	add	x0, x0, #0xd80
 77db27c: 9624f801     	bl	0x119280 <_ChromeMain+0x113fe4>
 77db280: aa0003f9     	mov	x25, x0
 77db284: aa1303e0     	mov	x0, x19
 77db288: aa1503e1     	mov	x1, x21
 77db28c: 94000065     	bl	0x77db420 <_ChromeMain+0x77d6184>
 77db290: aa0003f8     	mov	x24, x0
 77db294: 35000299     	cbnz	w25, 0x77db2e4 <_ChromeMain+0x77d6048>
 77db298: 52800500     	mov	w0, #0x28               ; =40
 77db29c: 9620d033     	bl	0xf368 <_ChromeMain+0xa0cc>
 77db2a0: aa0003e4     	mov	x4, x0
 77db2a4: 52800028     	mov	w8, #0x1                ; =1
 77db2a8: 90ffe6c9     	adrp	x9, 0x74b3000 <_ChromeMain+0x74add64>
 77db2ac: 91002129     	add	x9, x9, #0x8
 77db2b0: 90fcc22a     	adrp	x10, 0x101f000 <_ChromeMain+0x1019d64>
 77db2b4: 9118014a     	add	x10, x10, #0x600
 77db2b8: b9000008     	str	w8, [x0]
 77db2bc: a900a809     	stp	x9, x10, [x0, #0x8]
 77db2c0: d0fd6c08     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 77db2c4: 912c0108     	add	x8, x8, #0xb00
 77db2c8: f9000c08     	str	x8, [x0, #0x18]
 77db2cc: aa1703e0     	mov	x0, x23
 77db2d0: aa1603e1     	mov	x1, x22
 77db2d4: aa1503e2     	mov	x2, x21
 77db2d8: aa1803e3     	mov	x3, x24
 77db2dc: 97f35de6     	bl	0x74b2a74 <_ChromeMain+0x74ad7d8>
 77db2e0: 17ffff98     	b	0x77db140 <_ChromeMain+0x77d5ea4>
 77db2e4: f9405a7a     	ldr	x26, [x19, #0xb0]
 77db2e8: b40000da     	cbz	x26, 0x77db300 <_ChromeMain+0x77d6064>
 77db2ec: 52800028     	mov	w8, #0x1                ; =1
 77db2f0: b8280348     	ldadd	w8, w8, [x26]
 77db2f4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 77db2f8: 6b09011f     	cmp	w8, w9
 77db2fc: 540007e0     	b.eq	0x77db3f8 <_ChromeMain+0x77d615c>
 77db300: f9405e7b     	ldr	x27, [x19, #0xb8]
 77db304: 52807400     	mov	w0, #0x3a0              ; =928
 77db308: 9620d018     	bl	0xf368 <_ChromeMain+0xa0cc>
 77db30c: aa0003f9     	mov	x25, x0
 77db310: 52800028     	mov	w8, #0x1                ; =1
 77db314: 10006789     	adr	x9, 0x77dc004 <_ChromeMain+0x77d6d68>
 77db318: d503201f     	nop
 77db31c: 10006fca     	adr	x10, 0x77dc114 <_ChromeMain+0x77d6e78>
 77db320: d503201f     	nop
 77db324: b9000008     	str	w8, [x0]
 77db328: 90ffa568     	adrp	x8, 0x6c87000 <_ChromeMain+0x6c81d64>
 77db32c: 913e0108     	add	x8, x8, #0xf80
 77db330: 1000108b     	adr	x11, 0x77db540 <_ChromeMain+0x77d62a4>
 77db334: d503201f     	nop
 77db338: a900a809     	stp	x9, x10, [x0, #0x8]
 77db33c: a901ac08     	stp	x8, x11, [x0, #0x18]
 77db340: a902e81f     	stp	xzr, x26, [x0, #0x28]
 77db344: f9001c1b     	str	x27, [x0, #0x38]
 77db348: 91010000     	add	x0, x0, #0x40
 77db34c: 9101a3e1     	add	x1, sp, #0x68
 77db350: 95323db8     	bl	0xc46aa30 <_ChromeMain+0xc465794>
 77db354: f901cf34     	str	x20, [x25, #0x398]
 77db358: aa1703e0     	mov	x0, x23
 77db35c: aa1603e1     	mov	x1, x22
 77db360: aa1503e2     	mov	x2, x21
 77db364: aa1803e3     	mov	x3, x24
 77db368: aa1903e4     	mov	x4, x25
 77db36c: 97f35dc2     	bl	0x74b2a74 <_ChromeMain+0x74ad7d8>
 77db370: d002b860     	adrp	x0, 0xcee9000 <dyld_stub_binder+0xcee9000>
 77db374: 912ba800     	add	x0, x0, #0xaea
 77db378: 52800021     	mov	w1, #0x1                ; =1
 77db37c: 52800042     	mov	w2, #0x2                ; =2
 77db380: 52800063     	mov	w3, #0x3                ; =3
 77db384: 52800024     	mov	w4, #0x1                ; =1
 77db388: 9645087e     	bl	0x91d580 <_ChromeMain+0x9182e4>
 77db38c: f9400008     	ldr	x8, [x0]
 77db390: f9401908     	ldr	x8, [x8, #0x30]
 77db394: b0fc4ee9     	adrp	x9, 0x1b8000 <_ChromeMain+0x1b2d64>
 77db398: 912b0129     	add	x9, x9, #0xac0
 77db39c: eb09011f     	cmp	x8, x9
 77db3a0: 54000101     	b.ne	0x77db3c0 <_ChromeMain+0x77d6124>
 77db3a4: 52800001     	mov	w1, #0x0                ; =0
 77db3a8: 962775c6     	bl	0x1b8ac0 <_ChromeMain+0x1b3824>
 77db3ac: 9101a3e8     	add	x8, sp, #0x68
 77db3b0: 91026103     	add	x3, x8, #0x98
 77db3b4: aa1303e0     	mov	x0, x19
 77db3b8: 940000fd     	bl	0x77db7ac <_ChromeMain+0x77d6510>
 77db3bc: 17ffff79     	b	0x77db1a0 <_ChromeMain+0x77d5f04>
 77db3c0: 52800001     	mov	w1, #0x0                ; =0
 77db3c4: d63f0100     	blr	x8
 77db3c8: 17fffff9     	b	0x77db3ac <_ChromeMain+0x77d6110>
 77db3cc: 52801201     	mov	w1, #0x90               ; =144
 77db3d0: 9620b6ba     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 77db3d4: 17ffff3c     	b	0x77db0c4 <_ChromeMain+0x77d5e28>
 77db3d8: b00338c8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 77db3dc: 911c4d08     	add	x8, x8, #0x713
 77db3e0: f90003e8     	str	x8, [sp]
 77db3e4: b00338c0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 77db3e8: 911be000     	add	x0, x0, #0x6f8
 77db3ec: 954d6076     	bl	0xcb335c4 <_ChromeMain+0xcb2e328>
 77db3f0: 1400000b     	b	0x77db41c <_ChromeMain+0x77d6180>
 77db3f4: 954ce49a     	bl	0xcb1465c <_ChromeMain+0xcb0f3c0>
 77db3f8: d4200000     	brk	#0
 77db3fc: d4400000     	hlt	#0
 77db400: d4200020     	brk	#0x1
 77db404: b00338c8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 77db408: 911c4d08     	add	x8, x8, #0x713
 77db40c: f90003e8     	str	x8, [sp]
 77db410: b00338c0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 77db414: 911b7400     	add	x0, x0, #0x6dd
 77db418: 954d606b     	bl	0xcb335c4 <_ChromeMain+0xcb2e328>
 77db41c: d4200020     	brk	#0x1
 77db420: d106c3ff     	sub	sp, sp, #0x1b0
 77db424: a91857f6     	stp	x22, x21, [sp, #0x180]
 77db428: a9194ff4     	stp	x20, x19, [sp, #0x190]
 77db42c: a91a7bfd     	stp	x29, x30, [sp, #0x1a0]
 77db430: 910683fd     	add	x29, sp, #0x1a0
 77db434: aa0103f3     	mov	x19, x1
 77db438: f9400c00     	ldr	x0, [x0, #0x18]
 77db43c: 96803a5d     	bl	0x17e9db0 <_ChromeMain+0x17e4b14>
 77db440: b4000060     	cbz	x0, 0x77db44c <_ChromeMain+0x77d61b0>
 77db444: 39406268     	ldrb	w8, [x19, #0x18]
 77db448: 35000108     	cbnz	w8, 0x77db468 <_ChromeMain+0x77d61cc>
 77db44c: 52800013     	mov	w19, #0x0               ; =0
 77db450: aa1303e0     	mov	x0, x19
 77db454: a95a7bfd     	ldp	x29, x30, [sp, #0x1a0]
 77db458: a9594ff4     	ldp	x20, x19, [sp, #0x190]
 77db45c: a95857f6     	ldp	x22, x21, [sp, #0x180]
 77db460: 9106c3ff     	add	sp, sp, #0x1b0
 77db464: d65f03c0     	ret
 77db468: aa0003f4     	mov	x20, x0
 77db46c: f900bbff     	str	xzr, [sp, #0x170]
 77db470: 6f00e400     	movi.2d	v0, #0000000000000000
 77db474: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 77db478: ad0983e0     	stp	q0, q0, [sp, #0x130]
 77db47c: ad0883e0     	stp	q0, q0, [sp, #0x110]
 77db480: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 77db484: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 77db488: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 77db48c: ad0483e0     	stp	q0, q0, [sp, #0x90]
 77db490: ad0383e0     	stp	q0, q0, [sp, #0x70]
 77db494: ad0283e0     	stp	q0, q0, [sp, #0x50]
 77db498: ad0183e0     	stp	q0, q0, [sp, #0x30]
 77db49c: 3d800be0     	str	q0, [sp, #0x20]
 77db4a0: 910083f5     	add	x21, sp, #0x20
 77db4a4: 910083e0     	add	x0, sp, #0x20
 77db4a8: 972e09a6     	bl	0x435db40 <_ChromeMain+0x43588a4>
 77db4ac: 6f00e400     	movi.2d	v0, #0000000000000000
 77db4b0: ad0003e0     	stp	q0, q0, [sp]
 77db4b4: 910003e8     	mov	x8, sp
 77db4b8: 910083e4     	add	x4, sp, #0x20
 77db4bc: aa1403e0     	mov	x0, x20
 77db4c0: aa1303e1     	mov	x1, x19
 77db4c4: aa1303e2     	mov	x2, x19
 77db4c8: 52800d63     	mov	w3, #0x6b               ; =107
 77db4cc: 964a83e0     	bl	0xa7c44c <_ChromeMain+0xa771b0>
 77db4d0: 394063e8     	ldrb	w8, [sp, #0x18]
 77db4d4: 7100191f     	cmp	w8, #0x6
 77db4d8: 54000101     	b.ne	0x77db4f8 <_ChromeMain+0x77d625c>
 77db4dc: 910003e0     	mov	x0, sp
 77db4e0: 96d5cbb6     	bl	0x2d4e3b8 <_ChromeMain+0x2d4911c>
 77db4e4: 9002b821     	adrp	x1, 0xcedf000 <dyld_stub_binder+0xcedf000>
 77db4e8: 910ef021     	add	x1, x1, #0x3bc
 77db4ec: 528002c2     	mov	w2, #0x16               ; =22
 77db4f0: 969580c4     	bl	0x1d3b800 <_ChromeMain+0x1d36564>
 77db4f4: 35000120     	cbnz	w0, 0x77db518 <_ChromeMain+0x77d627c>
 77db4f8: 52800013     	mov	w19, #0x0               ; =0
 77db4fc: 910003e0     	mov	x0, sp
 77db500: 96790cb5     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 77db504: 910242a0     	add	x0, x21, #0x90
 77db508: 96399cbe     	bl	0x642800 <_ChromeMain+0x63d564>
 77db50c: b27d02a0     	orr	x0, x21, #0x8
 77db510: 96399cbc     	bl	0x642800 <_ChromeMain+0x63d564>
 77db514: 17ffffcf     	b	0x77db450 <_ChromeMain+0x77d61b4>
 77db518: 910003e0     	mov	x0, sp
 77db51c: 96d5cba7     	bl	0x2d4e3b8 <_ChromeMain+0x2d4911c>
 77db520: 9002b821     	adrp	x1, 0xcedf000 <dyld_stub_binder+0xcedf000>
 77db524: 910ef021     	add	x1, x1, #0x3bc
 77db528: 528002c2     	mov	w2, #0x16               ; =22
 77db52c: 967417e5     	bl	0x14e14c0 <_ChromeMain+0x14dc224>
 77db530: 52802028     	mov	w8, #0x101              ; =257
 77db534: 6a20011f     	bics	wzr, w8, w0
 77db538: 1a9f17f3     	cset	w19, eq
 77db53c: 17fffff0     	b	0x77db4fc <_ChromeMain+0x77d6260>
 77db540: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 77db544: a90167fa     	stp	x26, x25, [sp, #0x10]
 77db548: a9025ff8     	stp	x24, x23, [sp, #0x20]
 77db54c: a90357f6     	stp	x22, x21, [sp, #0x30]
 77db550: a9044ff4     	stp	x20, x19, [sp, #0x40]
 77db554: a9057bfd     	stp	x29, x30, [sp, #0x50]
 77db558: 910143fd     	add	x29, sp, #0x50
 77db55c: d10e03ff     	sub	sp, sp, #0x380
 77db560: aa0403f3     	mov	x19, x4
 77db564: aa0303f7     	mov	x23, x3
 77db568: aa0203f5     	mov	x21, x2
 77db56c: aa0103f4     	mov	x20, x1
 77db570: aa0003f6     	mov	x22, x0
 77db574: b0039e60     	adrp	x0, 0xeba8000 <dyld_stub_binder+0xeba8000>
 77db578: 91288000     	add	x0, x0, #0xa20
 77db57c: 9624f741     	bl	0x119280 <_ChromeMain+0x113fe4>
 77db580: 6a0002ff     	tst	w23, w0
 77db584: 54000120     	b.eq	0x77db5a8 <_ChromeMain+0x77d630c>
 77db588: f9400ed8     	ldr	x24, [x22, #0x18]
 77db58c: 96d4c24e     	bl	0x2d0bec4 <_ChromeMain+0x2d06c28>
 77db590: aa1803e1     	mov	x1, x24
 77db594: 52800022     	mov	w2, #0x1                ; =1
 77db598: 9621ddff     	bl	0x52d94 <_ChromeMain+0x4daf8>
 77db59c: b4000060     	cbz	x0, 0x77db5a8 <_ChromeMain+0x77d630c>
 77db5a0: 91026281     	add	x1, x20, #0x98
 77db5a4: 97d4edef     	bl	0x6d16d60 <_ChromeMain+0x6d11ac4>
 77db5a8: b0039e60     	adrp	x0, 0xeba8000 <dyld_stub_binder+0xeba8000>
 77db5ac: 9134c000     	add	x0, x0, #0xd30
 77db5b0: 9624f734     	bl	0x119280 <_ChromeMain+0x113fe4>
 77db5b4: 35000340     	cbnz	w0, 0x77db61c <_ChromeMain+0x77d6380>
 77db5b8: 910023e0     	add	x0, sp, #0x8
 77db5bc: aa1403e1     	mov	x1, x20
 77db5c0: 95323d1c     	bl	0xc46aa30 <_ChromeMain+0xc465794>
 77db5c4: d002b860     	adrp	x0, 0xcee9000 <dyld_stub_binder+0xcee9000>
 77db5c8: 912ba800     	add	x0, x0, #0xaea
 77db5cc: 52800021     	mov	w1, #0x1                ; =1
 77db5d0: 52800042     	mov	w2, #0x2                ; =2
 77db5d4: 964507d3     	bl	0x91d520 <_ChromeMain+0x918284>
 77db5d8: 390222b7     	strb	w23, [x21, #0x88]
 77db5dc: f9400ec0     	ldr	x0, [x22, #0x18]
 77db5e0: 97081296     	bl	0x39e0038 <_ChromeMain+0x39dad9c>
 77db5e4: 910023e2     	add	x2, sp, #0x8
 77db5e8: 52800001     	mov	w1, #0x0                ; =0
 77db5ec: aa1503e3     	mov	x3, x21
 77db5f0: 97fff15b     	bl	0x77d7b5c <_ChromeMain+0x77d28c0>
 77db5f4: 910023e0     	add	x0, sp, #0x8
 77db5f8: 95323e63     	bl	0xc46af84 <_ChromeMain+0xc465ce8>
 77db5fc: 910e03ff     	add	sp, sp, #0x380
 77db600: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 77db604: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 77db608: a94357f6     	ldp	x22, x21, [sp, #0x30]
 77db60c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 77db610: a94167fa     	ldp	x26, x25, [sp, #0x10]
 77db614: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 77db618: d65f03c0     	ret
 77db61c: f9405ad9     	ldr	x25, [x22, #0xb0]
 77db620: b40000d9     	cbz	x25, 0x77db638 <_ChromeMain+0x77d639c>
 77db624: 52800028     	mov	w8, #0x1                ; =1
 77db628: b8280328     	ldadd	w8, w8, [x25]
 77db62c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 77db630: 6b09011f     	cmp	w8, w9
 77db634: 54000aa0     	b.eq	0x77db788 <_ChromeMain+0x77d64ec>
 77db638: f9405eda     	ldr	x26, [x22, #0xb8]
 77db63c: 52807500     	mov	w0, #0x3a8              ; =936
 77db640: 9620cf4a     	bl	0xf368 <_ChromeMain+0xa0cc>
 77db644: aa0003f8     	mov	x24, x0
 77db648: 52800028     	mov	w8, #0x1                ; =1
 77db64c: b9000008     	str	w8, [x0]
 77db650: 10007748     	adr	x8, 0x77dc538 <_ChromeMain+0x77d729c>
 77db654: d503201f     	nop
 77db658: 10007ec9     	adr	x9, 0x77dc630 <_ChromeMain+0x77d7394>
 77db65c: d503201f     	nop
 77db660: a900a408     	stp	x8, x9, [x0, #0x8]
 77db664: 90ffa568     	adrp	x8, 0x6c87000 <_ChromeMain+0x6c81d64>
 77db668: 913e0108     	add	x8, x8, #0xf80
 77db66c: 10004829     	adr	x9, 0x77dbf70 <_ChromeMain+0x77d6cd4>
 77db670: d503201f     	nop
 77db674: a901a408     	stp	x8, x9, [x0, #0x18]
 77db678: a902e41f     	stp	xzr, x25, [x0, #0x28]
 77db67c: a903d41a     	stp	x26, x21, [x0, #0x38]
 77db680: 91012000     	add	x0, x0, #0x48
 77db684: aa1403e1     	mov	x1, x20
 77db688: 95323cea     	bl	0xc46aa30 <_ChromeMain+0xc465794>
 77db68c: 390e8317     	strb	w23, [x24, #0x3a0]
 77db690: 39406268     	ldrb	w8, [x19, #0x18]
 77db694: 34000108     	cbz	w8, 0x77db6b4 <_ChromeMain+0x77d6418>
 77db698: f9400ec0     	ldr	x0, [x22, #0x18]
 77db69c: 52800036     	mov	w22, #0x1               ; =1
 77db6a0: 91026281     	add	x1, x20, #0x98
 77db6a4: 52800022     	mov	w2, #0x1                ; =1
 77db6a8: 96a2df4e     	bl	0x20933e0 <_ChromeMain+0x208e144>
 77db6ac: f9409015     	ldr	x21, [x0, #0x120]
 77db6b0: b5000295     	cbnz	x21, 0x77db700 <_ChromeMain+0x77d6464>
 77db6b4: b4000718     	cbz	x24, 0x77db794 <_ChromeMain+0x77d64f8>
 77db6b8: f9400708     	ldr	x8, [x24, #0x8]
 77db6bc: aa1803e0     	mov	x0, x24
 77db6c0: 52800001     	mov	w1, #0x0                ; =0
 77db6c4: d63f0100     	blr	x8
 77db6c8: 12800008     	mov	w8, #-0x1               ; =-1
 77db6cc: b8e80308     	ldaddal	w8, w8, [x24]
 77db6d0: 7100051f     	cmp	w8, #0x1
 77db6d4: 54fff941     	b.ne	0x77db5fc <_ChromeMain+0x77d6360>
 77db6d8: f9400b01     	ldr	x1, [x24, #0x10]
 77db6dc: aa1803e0     	mov	x0, x24
 77db6e0: 910e03ff     	add	sp, sp, #0x380
 77db6e4: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 77db6e8: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 77db6ec: a94357f6     	ldp	x22, x21, [sp, #0x30]
 77db6f0: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 77db6f4: a94167fa     	ldp	x26, x25, [sp, #0x10]
 77db6f8: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 77db6fc: d61f0020     	br	x1
 77db700: 910022a8     	add	x8, x21, #0x8
 77db704: b8360108     	ldadd	w22, w8, [x8]
 77db708: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 77db70c: 6b09011f     	cmp	w8, w9
 77db710: 54000480     	b.eq	0x77db7a0 <_ChromeMain+0x77d6504>
 77db714: 9002b821     	adrp	x1, 0xcedf000 <dyld_stub_binder+0xcedf000>
 77db718: 910f4c21     	add	x1, x1, #0x3d3
 77db71c: d101a3a0     	sub	x0, x29, #0x68
 77db720: d101a7a2     	sub	x2, x29, #0x69
 77db724: 966daa63     	bl	0x13460b0 <_ChromeMain+0x1340e14>
 77db728: 39406268     	ldrb	w8, [x19, #0x18]
 77db72c: 360002c8     	tbz	w8, #0x0, 0x77db784 <_ChromeMain+0x77d64e8>
 77db730: 91004281     	add	x1, x20, #0x10
 77db734: 91026282     	add	x2, x20, #0x98
 77db738: d101a3a3     	sub	x3, x29, #0x68
 77db73c: aa1503e0     	mov	x0, x21
 77db740: aa1303e4     	mov	x4, x19
 77db744: aa1803e5     	mov	x5, x24
 77db748: 97bd5512     	bl	0x6730b90 <_ChromeMain+0x672b8f4>
 77db74c: 38daf3a8     	ldursb	w8, [x29, #-0x51]
 77db750: 36f800a8     	tbz	w8, #0x1f, 0x77db764 <_ChromeMain+0x77d64c8>
 77db754: f85983a0     	ldur	x0, [x29, #-0x68]
 77db758: f85a83a8     	ldur	x8, [x29, #-0x58]
 77db75c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 77db760: 9620b5d6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 77db764: 910022a8     	add	x8, x21, #0x8
 77db768: 12800009     	mov	w9, #-0x1               ; =-1
 77db76c: b8e90108     	ldaddal	w9, w8, [x8]
 77db770: 7100051f     	cmp	w8, #0x1
 77db774: 54fff441     	b.ne	0x77db5fc <_ChromeMain+0x77d6360>
 77db778: aa1503e0     	mov	x0, x21
 77db77c: 96e98cd1     	bl	0x323eac0 <_ChromeMain+0x3239824>
 77db780: 17ffff9f     	b	0x77db5fc <_ChromeMain+0x77d6360>
 77db784: 975092e6     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 77db788: d4200000     	brk	#0
 77db78c: d4400000     	hlt	#0
 77db790: d4200020     	brk	#0x1
 77db794: d4200000     	brk	#0
 77db798: d4400000     	hlt	#0
 77db79c: d4200020     	brk	#0x1
 77db7a0: d4200000     	brk	#0
 77db7a4: d4400000     	hlt	#0
 77db7a8: d4200020     	brk	#0x1
 77db7ac: d10103ff     	sub	sp, sp, #0x40
 77db7b0: a90157f6     	stp	x22, x21, [sp, #0x10]
 77db7b4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 77db7b8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 77db7bc: 9100c3fd     	add	x29, sp, #0x30
 77db7c0: aa0303f3     	mov	x19, x3
 77db7c4: aa0003f4     	mov	x20, x0
 77db7c8: f9400c00     	ldr	x0, [x0, #0x18]
 77db7cc: 97ffe7a5     	bl	0x77d5660 <_ChromeMain+0x77d03c4>
 77db7d0: f0031588     	adrp	x8, 0xda8e000 <dyld_stub_binder+0xda8e000>
 77db7d4: 91316108     	add	x8, x8, #0xc58
 77db7d8: f90007e8     	str	x8, [sp, #0x8]
 77db7dc: 910023e0     	add	x0, sp, #0x8
 77db7e0: 968c4be3     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 77db7e4: f9400e95     	ldr	x21, [x20, #0x18]
 77db7e8: 96d4c1b7     	bl	0x2d0bec4 <_ChromeMain+0x2d06c28>
 77db7ec: aa1503e1     	mov	x1, x21
 77db7f0: 52800022     	mov	w2, #0x1                ; =1
 77db7f4: 9621dd68     	bl	0x52d94 <_ChromeMain+0x4daf8>
 77db7f8: b40000c0     	cbz	x0, 0x77db810 <_ChromeMain+0x77d6574>
 77db7fc: aa1303e1     	mov	x1, x19
 77db800: 52800022     	mov	w2, #0x1                ; =1
 77db804: 52800003     	mov	w3, #0x0                ; =0
 77db808: 52800004     	mov	w4, #0x0                ; =0
 77db80c: 97d4ec58     	bl	0x6d1696c <_ChromeMain+0x6d116d0>
 77db810: f9400e81     	ldr	x1, [x20, #0x18]
 77db814: 528000c0     	mov	w0, #0x6                ; =6
 77db818: d2800002     	mov	x2, #0x0                ; =0
 77db81c: aa1303e3     	mov	x3, x19
 77db820: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 77db824: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 77db828: a94157f6     	ldp	x22, x21, [sp, #0x10]
 77db82c: 910103ff     	add	sp, sp, #0x40
 77db830: 17d53495     	b	0x6d28a84 <_ChromeMain+0x6d237e8>
