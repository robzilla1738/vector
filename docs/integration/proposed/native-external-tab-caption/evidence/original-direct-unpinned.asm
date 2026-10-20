
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41277dc: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 41277e0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 41277e4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 41277e8: 910083fd     	add	x29, sp, #0x20
 41277ec: b4001261     	cbz	x1, 0x4127a38 <_ChromeMain+0x412279c>
 41277f0: aa0103f3     	mov	x19, x1
 41277f4: aa0003f4     	mov	x20, x0
 41277f8: f9400028     	ldr	x8, [x1]
 41277fc: f9402d08     	ldr	x8, [x8, #0x58]
 4127800: aa0103e0     	mov	x0, x1
 4127804: d63f0100     	blr	x8
 4127808: aa0003f5     	mov	x21, x0
 412780c: 94de1eae     	bl	0x78af2c4 <_ChromeMain+0x78aa028>
 4127810: f10002bf     	cmp	x21, #0x0
 4127814: 1a9f07e8     	cset	w8, ne
 4127818: eb0002bf     	cmp	x21, x0
 412781c: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 4127820: 540000c0     	b.eq	0x4127838 <_ChromeMain+0x412259c>
 4127824: f94026b5     	ldr	x21, [x21, #0x48]
 4127828: f10002bf     	cmp	x21, #0x0
 412782c: 1a9f07e8     	cset	w8, ne
 4127830: fa4012a4     	ccmp	x21, x0, #0x4, ne
 4127834: 54ffff81     	b.ne	0x4127824 <_ChromeMain+0x4122588>
 4127838: 34000448     	cbz	w8, 0x41278c0 <_ChromeMain+0x4122624>
 412783c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4127840: f0055455     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4127844: f94046a9     	ldr	x9, [x21, #0x88]
 4127848: eb09011f     	cmp	x8, x9
 412784c: 54000061     	b.ne	0x4127858 <_ChromeMain+0x41225bc>
 4127850: aa1303e0     	mov	x0, x19
 4127854: 96fbb2aa     	bl	0x142fc <_ChromeMain+0xf060>
 4127858: f941b280     	ldr	x0, [x20, #0x360]
 412785c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4127860: f94046a9     	ldr	x9, [x21, #0x88]
 4127864: eb09011f     	cmp	x8, x9
 4127868: 54000041     	b.ne	0x4127870 <_ChromeMain+0x41225d4>
 412786c: 96fbec74     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4127870: f901b293     	str	x19, [x20, #0x360]
 4127874: 394da688     	ldrb	w8, [x20, #0x369]
 4127878: 34000188     	cbz	w8, 0x41278a8 <_ChromeMain+0x412260c>
 412787c: 3945a668     	ldrb	w8, [x19, #0x169]
 4127880: 35000e28     	cbnz	w8, 0x4127a44 <_ChromeMain+0x41227a8>
 4127884: f940ce82     	ldr	x2, [x20, #0x198]
 4127888: aa1403e0     	mov	x0, x20
 412788c: aa1303e1     	mov	x1, x19
 4127890: 971946db     	bl	0x7793fc <_ChromeMain+0x774160>
 4127894: aa1303e0     	mov	x0, x19
 4127898: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 412789c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 41278a0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 41278a4: d65f03c0     	ret
 41278a8: f941ae80     	ldr	x0, [x20, #0x358]
 41278ac: aa1303e1     	mov	x1, x19
 41278b0: 9595f5c4     	bl	0xa6a4fc0 <_ChromeMain+0xa69fd24>
 41278b4: 17fffff8     	b	0x4127894 <_ChromeMain+0x41225f8>
 41278b8: 34fffe68     	cbz	w8, 0x4127884 <_ChromeMain+0x41225e8>
 41278bc: 14000068     	b	0x4127a5c <_ChromeMain+0x41227c0>
 41278c0: f9400268     	ldr	x8, [x19]
 41278c4: f9402d08     	ldr	x8, [x8, #0x58]
 41278c8: aa1303e0     	mov	x0, x19
 41278cc: d63f0100     	blr	x8
 41278d0: aa0003f5     	mov	x21, x0
 41278d4: 94ddda07     	bl	0x789e0f0 <_ChromeMain+0x7898e54>
 41278d8: f10002bf     	cmp	x21, #0x0
 41278dc: 1a9f07e8     	cset	w8, ne
 41278e0: eb0002bf     	cmp	x21, x0
 41278e4: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 41278e8: 540000c0     	b.eq	0x4127900 <_ChromeMain+0x4122664>
 41278ec: f94026b5     	ldr	x21, [x21, #0x48]
 41278f0: f10002bf     	cmp	x21, #0x0
 41278f4: 1a9f07e8     	cset	w8, ne
 41278f8: fa4012a4     	ccmp	x21, x0, #0x4, ne
 41278fc: 54ffff81     	b.ne	0x41278ec <_ChromeMain+0x4122650>
 4127900: 360009c8     	tbz	w8, #0x0, 0x4127a38 <_ChromeMain+0x412279c>
 4127904: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4127908: f0055455     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 412790c: f94046a9     	ldr	x9, [x21, #0x88]
 4127910: eb09011f     	cmp	x8, x9
 4127914: 54000061     	b.ne	0x4127920 <_ChromeMain+0x4122684>
 4127918: aa1303e0     	mov	x0, x19
 412791c: 96fbb278     	bl	0x142fc <_ChromeMain+0xf060>
 4127920: f9419e80     	ldr	x0, [x20, #0x338]
 4127924: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4127928: f94046a9     	ldr	x9, [x21, #0x88]
 412792c: eb09011f     	cmp	x8, x9
 4127930: 54000041     	b.ne	0x4127938 <_ChromeMain+0x412269c>
 4127934: 96fbec42     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4127938: f9019e93     	str	x19, [x20, #0x338]
 412793c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4127940: f94046a9     	ldr	x9, [x21, #0x88]
 4127944: eb09011f     	cmp	x8, x9
 4127948: 54000061     	b.ne	0x4127954 <_ChromeMain+0x41226b8>
 412794c: aa1403e0     	mov	x0, x20
 4127950: 96fbb26b     	bl	0x142fc <_ChromeMain+0xf060>
 4127954: f942ba60     	ldr	x0, [x19, #0x570]
 4127958: 925e7408     	and	x8, x0, #0xfffffffc00000000
 412795c: f94046a9     	ldr	x9, [x21, #0x88]
 4127960: eb09011f     	cmp	x8, x9
 4127964: 54000041     	b.ne	0x412796c <_ChromeMain+0x41226d0>
 4127968: 96fbec35     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 412796c: f902ba74     	str	x20, [x19, #0x570]
 4127970: 394da688     	ldrb	w8, [x20, #0x369]
 4127974: 340005e8     	cbz	w8, 0x4127a30 <_ChromeMain+0x4122794>
 4127978: f941a280     	ldr	x0, [x20, #0x340]
 412797c: 3945a668     	ldrb	w8, [x19, #0x169]
 4127980: b4fff9c0     	cbz	x0, 0x41278b8 <_ChromeMain+0x412261c>
 4127984: 35000668     	cbnz	w8, 0x4127a50 <_ChromeMain+0x41227b4>
 4127988: f940cc02     	ldr	x2, [x0, #0x198]
 412798c: aa1303e1     	mov	x1, x19
 4127990: 9719469b     	bl	0x7793fc <_ChromeMain+0x774160>
 4127994: f941a280     	ldr	x0, [x20, #0x340]
 4127998: b4fff7e0     	cbz	x0, 0x4127894 <_ChromeMain+0x41225f8>
 412799c: f9419e81     	ldr	x1, [x20, #0x338]
 41279a0: b4fff7a1     	cbz	x1, 0x4127894 <_ChromeMain+0x41225f8>
 41279a4: f940c428     	ldr	x8, [x1, #0x188]
 41279a8: eb08001f     	cmp	x0, x8
 41279ac: 54fff741     	b.ne	0x4127894 <_ChromeMain+0x41225f8>
 41279b0: f941a688     	ldr	x8, [x20, #0x348]
 41279b4: b4fff708     	cbz	x8, 0x4127894 <_ChromeMain+0x41225f8>
 41279b8: f940c509     	ldr	x9, [x8, #0x188]
 41279bc: eb09001f     	cmp	x0, x9
 41279c0: 54fff6a1     	b.ne	0x4127894 <_ChromeMain+0x41225f8>
 41279c4: f940cc09     	ldr	x9, [x0, #0x198]
 41279c8: d37df129     	lsl	x9, x9, #3
 41279cc: b4fff649     	cbz	x9, 0x4127894 <_ChromeMain+0x41225f8>
 41279d0: d280000c     	mov	x12, #0x0               ; =0
 41279d4: f940c80a     	ldr	x10, [x0, #0x190]
 41279d8: f86c694b     	ldr	x11, [x10, x12]
 41279dc: eb08017f     	cmp	x11, x8
 41279e0: 540000a0     	b.eq	0x41279f4 <_ChromeMain+0x4122758>
 41279e4: 9100218c     	add	x12, x12, #0x8
 41279e8: eb0c013f     	cmp	x9, x12
 41279ec: 54ffff61     	b.ne	0x41279d8 <_ChromeMain+0x412273c>
 41279f0: 1400001e     	b	0x4127a68 <_ChromeMain+0x41227cc>
 41279f4: 9343fd82     	asr	x2, x12, #3
 41279f8: d280000c     	mov	x12, #0x0               ; =0
 41279fc: f86c694d     	ldr	x13, [x10, x12]
 4127a00: eb0101bf     	cmp	x13, x1
 4127a04: 540000a0     	b.eq	0x4127a18 <_ChromeMain+0x412277c>
 4127a08: 9100218c     	add	x12, x12, #0x8
 4127a0c: eb0c013f     	cmp	x9, x12
 4127a10: 54ffff61     	b.ne	0x41279fc <_ChromeMain+0x4122760>
 4127a14: 17ffffa0     	b	0x4127894 <_ChromeMain+0x41225f8>
 4127a18: 9343fd89     	asr	x9, x12, #3
 4127a1c: eb02013f     	cmp	x9, x2
 4127a20: fa482160     	ccmp	x11, x8, #0x0, hs
 4127a24: 54fff381     	b.ne	0x4127894 <_ChromeMain+0x41225f8>
 4127a28: 97d49ed4     	bl	0x364f578 <_ChromeMain+0x364a2dc>
 4127a2c: 17ffff9a     	b	0x4127894 <_ChromeMain+0x41225f8>
 4127a30: f9419a80     	ldr	x0, [x20, #0x330]
 4127a34: 17ffff9e     	b	0x41278ac <_ChromeMain+0x4122610>
 4127a38: d4200000     	brk	#0
 4127a3c: d4400000     	hlt	#0
 4127a40: d4200020     	brk	#0x1
 4127a44: d4200000     	brk	#0
 4127a48: d4400000     	hlt	#0
 4127a4c: d4200020     	brk	#0x1
 4127a50: d4200000     	brk	#0
 4127a54: d4400000     	hlt	#0
 4127a58: d4200020     	brk	#0x1
 4127a5c: d4200000     	brk	#0
 4127a60: d4400000     	hlt	#0
 4127a64: d4200020     	brk	#0x1
 4127a68: d2800002     	mov	x2, #0x0                ; =0
 4127a6c: 17ffffe3     	b	0x41279f8 <_ChromeMain+0x412275c>
		...
 4127a80: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4127a84: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4127a88: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4127a8c: 910083fd     	add	x29, sp, #0x20
 4127a90: b4000c01     	cbz	x1, 0x4127c10 <_ChromeMain+0x4122974>
 4127a94: aa0103f3     	mov	x19, x1
 4127a98: aa0003f4     	mov	x20, x0
 4127a9c: f9400028     	ldr	x8, [x1]
 4127aa0: f9402d08     	ldr	x8, [x8, #0x58]
 4127aa4: aa0103e0     	mov	x0, x1
 4127aa8: d63f0100     	blr	x8
 4127aac: aa0003f5     	mov	x21, x0
 4127ab0: 94de1e05     	bl	0x78af2c4 <_ChromeMain+0x78aa028>
 4127ab4: f10002bf     	cmp	x21, #0x0
 4127ab8: 1a9f07e8     	cset	w8, ne
 4127abc: eb0002bf     	cmp	x21, x0
 4127ac0: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 4127ac4: 540000c0     	b.eq	0x4127adc <_ChromeMain+0x4122840>
 4127ac8: f94026b5     	ldr	x21, [x21, #0x48]
 4127acc: f10002bf     	cmp	x21, #0x0
 4127ad0: 1a9f07e8     	cset	w8, ne
 4127ad4: fa4012a4     	ccmp	x21, x0, #0x4, ne
 4127ad8: 54ffff81     	b.ne	0x4127ac8 <_ChromeMain+0x412282c>
 4127adc: 34000468     	cbz	w8, 0x4127b68 <_ChromeMain+0x41228cc>
 4127ae0: f941b280     	ldr	x0, [x20, #0x360]
 4127ae4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4127ae8: f0055449     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4127aec: f9404529     	ldr	x9, [x9, #0x88]
 4127af0: eb09011f     	cmp	x8, x9
 4127af4: 54000041     	b.ne	0x4127afc <_ChromeMain+0x4122860>
 4127af8: 96fbebd1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4127afc: f901b29f     	str	xzr, [x20, #0x360]
 4127b00: 394da688     	ldrb	w8, [x20, #0x369]
 4127b04: 34000268     	cbz	w8, 0x4127b50 <_ChromeMain+0x41228b4>
 4127b08: f940c668     	ldr	x8, [x19, #0x188]
 4127b0c: eb14011f     	cmp	x8, x20
 4127b10: 54000201     	b.ne	0x4127b50 <_ChromeMain+0x41228b4>
 4127b14: 3945a668     	ldrb	w8, [x19, #0x169]
 4127b18: 35000828     	cbnz	w8, 0x4127c1c <_ChromeMain+0x4122980>
 4127b1c: aa1403e0     	mov	x0, x20
 4127b20: aa1303e1     	mov	x1, x19
 4127b24: 52800022     	mov	w2, #0x1                ; =1
 4127b28: 52800003     	mov	w3, #0x0                ; =0
 4127b2c: d2800004     	mov	x4, #0x0                ; =0
 4127b30: 9774a6be     	bl	0x1e51628 <_ChromeMain+0x1e4c38c>
 4127b34: f9400268     	ldr	x8, [x19]
 4127b38: f9402901     	ldr	x1, [x8, #0x50]
 4127b3c: aa1303e0     	mov	x0, x19
 4127b40: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4127b44: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4127b48: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4127b4c: d61f0020     	br	x1
 4127b50: f941ae80     	ldr	x0, [x20, #0x358]
 4127b54: d2800001     	mov	x1, #0x0                ; =0
 4127b58: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4127b5c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4127b60: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4127b64: 1595f517     	b	0xa6a4fc0 <_ChromeMain+0xa69fd24>
 4127b68: f9400268     	ldr	x8, [x19]
 4127b6c: f9402d08     	ldr	x8, [x8, #0x58]
 4127b70: aa1303e0     	mov	x0, x19
 4127b74: d63f0100     	blr	x8
 4127b78: aa0003f5     	mov	x21, x0
 4127b7c: 94ddd95d     	bl	0x789e0f0 <_ChromeMain+0x7898e54>
 4127b80: f10002bf     	cmp	x21, #0x0
 4127b84: 1a9f07e8     	cset	w8, ne
 4127b88: eb0002bf     	cmp	x21, x0
 4127b8c: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 4127b90: 540000c0     	b.eq	0x4127ba8 <_ChromeMain+0x412290c>
 4127b94: f94026b5     	ldr	x21, [x21, #0x48]
 4127b98: f10002bf     	cmp	x21, #0x0
 4127b9c: 1a9f07e8     	cset	w8, ne
 4127ba0: fa4012a4     	ccmp	x21, x0, #0x4, ne
 4127ba4: 54ffff81     	b.ne	0x4127b94 <_ChromeMain+0x41228f8>
 4127ba8: 34000348     	cbz	w8, 0x4127c10 <_ChromeMain+0x4122974>
 4127bac: f9419e95     	ldr	x21, [x20, #0x338]
 4127bb0: f942baa0     	ldr	x0, [x21, #0x570]
 4127bb4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4127bb8: f0055456     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4127bbc: f94046c9     	ldr	x9, [x22, #0x88]
 4127bc0: eb09011f     	cmp	x8, x9
 4127bc4: 54000041     	b.ne	0x4127bcc <_ChromeMain+0x4122930>
 4127bc8: 96fbeb9d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4127bcc: f902babf     	str	xzr, [x21, #0x570]
 4127bd0: f9419e80     	ldr	x0, [x20, #0x338]
 4127bd4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4127bd8: f94046c9     	ldr	x9, [x22, #0x88]
 4127bdc: eb09011f     	cmp	x8, x9
 4127be0: 54000041     	b.ne	0x4127be8 <_ChromeMain+0x412294c>
 4127be4: 96fbeb96     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4127be8: f9019e9f     	str	xzr, [x20, #0x338]
 4127bec: 394da688     	ldrb	w8, [x20, #0x369]
 4127bf0: 340000c8     	cbz	w8, 0x4127c08 <_ChromeMain+0x412296c>
 4127bf4: f940c660     	ldr	x0, [x19, #0x188]
 4127bf8: b4000080     	cbz	x0, 0x4127c08 <_ChromeMain+0x412296c>
 4127bfc: 3945a668     	ldrb	w8, [x19, #0x169]
 4127c00: 34fff908     	cbz	w8, 0x4127b20 <_ChromeMain+0x4122884>
 4127c04: 14000009     	b	0x4127c28 <_ChromeMain+0x412298c>
 4127c08: f9419a80     	ldr	x0, [x20, #0x330]
 4127c0c: 17ffffd2     	b	0x4127b54 <_ChromeMain+0x41228b8>
 4127c10: d4200000     	brk	#0
 4127c14: d4400000     	hlt	#0
 4127c18: d4200020     	brk	#0x1
 4127c1c: d4200000     	brk	#0
 4127c20: d4400000     	hlt	#0
 4127c24: d4200020     	brk	#0x1
 4127c28: d4200000     	brk	#0
 4127c2c: d4400000     	hlt	#0
 4127c30: d4200020     	brk	#0x1
