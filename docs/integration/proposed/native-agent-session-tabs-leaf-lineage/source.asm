refresh realthis argument

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46272bc: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 46272c0: a90167fa     	stp	x26, x25, [sp, #0x10]
 46272c4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 46272c8: a90357f6     	stp	x22, x21, [sp, #0x30]
 46272cc: a9044ff4     	stp	x20, x19, [sp, #0x40]
 46272d0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 46272d4: 910143fd     	add	x29, sp, #0x50
 46272d8: d106c3ff     	sub	sp, sp, #0x1b0
 46272dc: 3910b41f     	strb	wzr, [x0, #0x42d]
 46272e0: f9419c08     	ldr	x8, [x0, #0x338]
 46272e4: b4000088     	cbz	x8, 0x46272f4 <_ChromeMain+0x4622058>
 46272e8: aa0003f3     	mov	x19, x0
 46272ec: 97ebf825     	bl	0x4125380 <_ChromeMain+0x41200e4>
 46272f0: b5000460     	cbnz	x0, 0x462737c <_ChromeMain+0x46220e0>

complete actual ancestor helper

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4125380: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4125384: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4125388: 910043fd     	add	x29, sp, #0x10
 412538c: f940c413     	ldr	x19, [x0, #0x188]
 4125390: b40004f3     	cbz	x19, 0x412542c <_ChromeMain+0x4120190>
 4125394: f9400268     	ldr	x8, [x19]
 4125398: f9402d08     	ldr	x8, [x8, #0x58]
 412539c: aa1303e0     	mov	x0, x19
 41253a0: d63f0100     	blr	x8
 41253a4: aa0003f4     	mov	x20, x0
 41253a8: 94de1a5c     	bl	0x78abd18 <_ChromeMain+0x78a6a7c>
 41253ac: f100029f     	cmp	x20, #0x0
 41253b0: 1a9f07e8     	cset	w8, ne
 41253b4: eb00029f     	cmp	x20, x0
 41253b8: fa401a84     	ccmp	x20, #0x0, #0x4, ne
 41253bc: 540000c0     	b.eq	0x41253d4 <_ChromeMain+0x4120138>
 41253c0: f9402694     	ldr	x20, [x20, #0x48]
 41253c4: f100029f     	cmp	x20, #0x0
 41253c8: 1a9f07e8     	cset	w8, ne
 41253cc: fa401284     	ccmp	x20, x0, #0x4, ne
 41253d0: 54ffff81     	b.ne	0x41253c0 <_ChromeMain+0x4120124>
 41253d4: 370002c8     	tbnz	w8, #0x0, 0x412542c <_ChromeMain+0x4120190>
 41253d8: f9400268     	ldr	x8, [x19]
 41253dc: f9402d08     	ldr	x8, [x8, #0x58]
 41253e0: aa1303e0     	mov	x0, x19
 41253e4: d63f0100     	blr	x8
 41253e8: aa0003f4     	mov	x20, x0
 41253ec: 94dde341     	bl	0x789e0f0 <_ChromeMain+0x7898e54>
 41253f0: f100029f     	cmp	x20, #0x0
 41253f4: 1a9f07e8     	cset	w8, ne
 41253f8: eb00029f     	cmp	x20, x0
 41253fc: fa401a84     	ccmp	x20, #0x0, #0x4, ne
 4125400: 540000c0     	b.eq	0x4125418 <_ChromeMain+0x412017c>
 4125404: f9402694     	ldr	x20, [x20, #0x48]
 4125408: f100029f     	cmp	x20, #0x0
 412540c: 1a9f07e8     	cset	w8, ne
 4125410: fa401284     	ccmp	x20, x0, #0x4, ne
 4125414: 54ffff81     	b.ne	0x4125404 <_ChromeMain+0x4120168>
 4125418: 34000068     	cbz	w8, 0x4125424 <_ChromeMain+0x4120188>
 412541c: f942ba68     	ldr	x8, [x19, #0x570]
 4125420: b50000e8     	cbnz	x8, 0x412543c <_ChromeMain+0x41201a0>
 4125424: f940c673     	ldr	x19, [x19, #0x188]
 4125428: b5fffb73     	cbnz	x19, 0x4125394 <_ChromeMain+0x41200f8>
 412542c: aa1303e0     	mov	x0, x19
 4125430: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4125434: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4125438: d65f03c0     	ret
 412543c: aa0803f3     	mov	x19, x8
 4125440: 17fffffb     	b	0x412542c <_ChromeMain+0x4120190>

TabView metadata getter

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 78ad68c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78ad690: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78ad694: 910043fd     	add	x29, sp, #0x10
 78ad698: 9003b2b4     	adrp	x20, 0xef01000 <dyld_stub_binder+0xef01000>
 78ad69c: f9437e93     	ldr	x19, [x20, #0x6f8]
 78ad6a0: b40000b3     	cbz	x19, 0x78ad6b4 <_ChromeMain+0x78a8418>
 78ad6a4: aa1303e0     	mov	x0, x19
 78ad6a8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 78ad6ac: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 78ad6b0: d65f03c0     	ret
 78ad6b4: 52800d00     	mov	w0, #0x68               ; =104
 78ad6b8: 961d872c     	bl	0xf368 <_ChromeMain+0xa0cc>
 78ad6bc: aa0003f3     	mov	x19, x0
 78ad6c0: 94000223     	bl	0x78adf4c <_ChromeMain+0x78a8cb0>
 78ad6c4: 967be448     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 78ad6c8: f9037e93     	str	x19, [x20, #0x6f8]
 78ad6cc: 17fffff6     	b	0x78ad6a4 <_ChromeMain+0x78a8408>
 78ad6d0: 17ffffef     	b	0x78ad68c <_ChromeMain+0x78a83f0>

TabView metadata name+path

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 78adf4c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78adf50: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78adf54: 910043fd     	add	x29, sp, #0x10
 78adf58: aa0003f3     	mov	x19, x0
 78adf5c: d0030f61     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 78adf60: 913f3021     	add	x1, x1, #0xfcc
 78adf64: 52800682     	mov	w2, #0x34               ; =52
 78adf68: 528007c3     	mov	w3, #0x3e               ; =62
 78adf6c: 9631e583     	bl	0x527578 <_ChromeMain+0x5222dc>
 78adf70: 90034868     	adrp	x8, 0xe1b9000 <dyld_stub_binder+0xe1b9000>
 78adf74: 91358108     	add	x8, x8, #0xd60
 78adf78: f9000008     	str	x8, [x0]
 78adf7c: d0030f61     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 78adf80: 913f1021     	add	x1, x1, #0xfc4
 78adf84: 528000e2     	mov	w2, #0x7                ; =7
 78adf88: 96f5fe95     	bl	0x362d9dc <_ChromeMain+0x3628740>
 78adf8c: 96ab1e89     	bl	0x23759b0 <_ChromeMain+0x2370714>

TabGroupHeaderView metadata getter

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 78a6ab8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78a6abc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78a6ac0: 910043fd     	add	x29, sp, #0x10
 78a6ac4: f003b2d4     	adrp	x20, 0xef01000 <dyld_stub_binder+0xef01000>
 78a6ac8: f9436e93     	ldr	x19, [x20, #0x6d8]
 78a6acc: b40000b3     	cbz	x19, 0x78a6ae0 <_ChromeMain+0x78a1844>
 78a6ad0: aa1303e0     	mov	x0, x19
 78a6ad4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 78a6ad8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 78a6adc: d65f03c0     	ret
 78a6ae0: 52800d00     	mov	w0, #0x68               ; =104
 78a6ae4: 961da221     	bl	0xf368 <_ChromeMain+0xa0cc>
 78a6ae8: aa0003f3     	mov	x19, x0
 78a6aec: 940000ff     	bl	0x78a6ee8 <_ChromeMain+0x78a1c4c>
 78a6af0: 967bff3d     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 78a6af4: f9036e93     	str	x19, [x20, #0x6d8]
 78a6af8: 17fffff6     	b	0x78a6ad0 <_ChromeMain+0x78a1834>
 78a6afc: 00000000     	udf	#0x0
 78a6b00: 17ffffee     	b	0x78a6ab8 <_ChromeMain+0x78a181c>

TabGroupHeaderView name+path

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 78a6ee8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78a6eec: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78a6ef0: 910043fd     	add	x29, sp, #0x10
 78a6ef4: aa0003f3     	mov	x19, x0
 78a6ef8: b0030fa1     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 78a6efc: 9134c021     	add	x1, x1, #0xd30
 78a6f00: 52800822     	mov	w2, #0x41               ; =65
 78a6f04: 52800643     	mov	w3, #0x32               ; =50
 78a6f08: 9632019c     	bl	0x527578 <_ChromeMain+0x5222dc>
 78a6f0c: f0034888     	adrp	x8, 0xe1b9000 <dyld_stub_binder+0xe1b9000>
 78a6f10: 911e0108     	add	x8, x8, #0x780
 78a6f14: b0030fa9     	adrp	x9, 0xda9b000 <dyld_stub_binder+0xda9b000>
 78a6f18: 9132c529     	add	x9, x9, #0xcb1
 78a6f1c: a9002408     	stp	x8, x9, [x0]
 78a6f20: 52800248     	mov	w8, #0x12               ; =18
 78a6f24: f9000808     	str	x8, [x0, #0x10]
 78a6f28: 970a0109     	bl	0x3b2734c <_ChromeMain+0x3b220b0>
 78a6f2c: aa0003e1     	mov	x1, x0

required originalthirdmodeflag

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 412a854: f9020676     	str	x22, [x19, #0x408]
 412a858: b94152d6     	ldr	w22, [x22, #0x150]
 412a85c: b9041276     	str	w22, [x19, #0x410]
 412a860: 39105275     	strb	w21, [x19, #0x414]

mode forcesunpinned

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 412c1d4: aa1503e0     	mov	x0, x21
 412c1d8: aa0803e1     	mov	x1, x8
 412c1dc: 94f09969     	bl	0x7d52780 <_ChromeMain+0x7d4d4e4>
 412c1e0: 39184260     	strb	w0, [x19, #0x610]
 412c1e4: 39505268     	ldrb	w8, [x19, #0x414]
 412c1e8: 37000068     	tbnz	w8, #0x0, 0x412c1f4 <_ChromeMain+0x4126f58>
 412c1ec: 3941e288     	ldrb	w8, [x20, #0x78]
 412c1f0: 14000002     	b	0x412c1f8 <_ChromeMain+0x4126f5c>
 412c1f4: 52800008     	mov	w8, #0x0                ; =0
 412c1f8: 12000108     	and	w8, w8, #0x1
 412c1fc: 39185268     	strb	w8, [x19, #0x614]
 412c200: 39418688     	ldrb	w8, [x20, #0x61]
 412c204: 39185a68     	strb	w8, [x19, #0x616]

mode verticalrowheight

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4133c18: a9094ff4     	stp	x20, x19, [sp, #0x90]
 4133c1c: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 4133c20: 910283fd     	add	x29, sp, #0xa0
 4133c24: aa0003f4     	mov	x20, x0
 4133c28: aa0803f3     	mov	x19, x8
 4133c2c: 39401028     	ldrb	w8, [x1, #0x4]
 4133c30: b9400029     	ldr	w9, [x1]
 4133c34: 5280320a     	mov	w10, #0x190             ; =400
 4133c38: 7100011f     	cmp	w8, #0x0
 4133c3c: 1a8a1128     	csel	w8, w9, w10, ne
 4133c40: b9000fe8     	str	w8, [sp, #0xc]
 4133c44: f9401815     	ldr	x21, [x0, #0x30]
 4133c48: f94206a8     	ldr	x8, [x21, #0x408]
 4133c4c: b5002d68     	cbnz	x8, 0x41341f8 <_ChromeMain+0x412ef5c>
 4133c50: 91185aa8     	add	x8, x21, #0x616
 4133c54: 39400117     	ldrb	w23, [x8]
 4133c58: 395052a8     	ldrb	w8, [x21, #0x414]
 4133c5c: 360002c8     	tbz	w8, #0x0, 0x4133cb4 <_ChromeMain+0x412ea18>
 4133c60: d2c00116     	mov	x22, #0x800000000       ; =34359738368
 4133c64: 350003b7     	cbnz	w23, 0x4133cd8 <_ChromeMain+0x412ea3c>
 4133c68: 52800415     	mov	w21, #0x20              ; =32
 4133c6c: 1400001e     	b	0x4133ce4 <_ChromeMain+0x412ea48>
 4133c70: f94002a8     	ldr	x8, [x21]
 4133c74: f9402d08     	ldr	x8, [x8, #0x58]
 4133c78: aa1503e0     	mov	x0, x21
 4133c7c: d63f0100     	blr	x8
 4133c80: aa0003f6     	mov	x22, x0
 4133c84: 94ddcf70     	bl	0x78a7a44 <_ChromeMain+0x78a27a8>
 4133c88: f10002df     	cmp	x22, #0x0
 4133c8c: 1a9f07e8     	cset	w8, ne
 4133c90: eb0002df     	cmp	x22, x0
 4133c94: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
 4133c98: 540000c0     	b.eq	0x4133cb0 <_ChromeMain+0x412ea14>
 4133c9c: f94026d6     	ldr	x22, [x22, #0x48]
 4133ca0: f10002df     	cmp	x22, #0x0
 4133ca4: 1a9f07e8     	cset	w8, ne
 4133ca8: fa4012c4     	ccmp	x22, x0, #0x4, ne
 4133cac: 54ffff81     	b.ne	0x4133c9c <_ChromeMain+0x412ea00>
 4133cb0: 35002ae8     	cbnz	w8, 0x413420c <_ChromeMain+0x412ef70>
 4133cb4: f940c6b5     	ldr	x21, [x21, #0x188]
 4133cb8: b5fffdd5     	cbnz	x21, 0x4133c70 <_ChromeMain+0x412e9d4>
 4133cbc: 370000d7     	tbnz	w23, #0x0, 0x4133cd4 <_ChromeMain+0x412ea38>
 4133cc0: 52800720     	mov	w0, #0x39               ; =57
 4133cc4: 970f3eff     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4133cc8: 11000815     	add	w21, w0, #0x2
 4133ccc: d2c000f6     	mov	x22, #0x700000000       ; =30064771072
 4133cd0: 14000005     	b	0x4133ce4 <_ChromeMain+0x412ea48>
 4133cd4: d2c000f6     	mov	x22, #0x700000000       ; =30064771072
 4133cd8: 52800740     	mov	w0, #0x3a               ; =58
 4133cdc: 970f3ef9     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4133ce0: aa0003f5     	mov	x21, x0
 4133ce4: b9400fe8     	ldr	w8, [sp, #0xc]

actual syntheticheaderdelegate

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462a780: d10c4000     	sub	x0, x0, #0x310
 462a784: 17fffe13     	b	0x4629fd0 <_ChromeMain+0x4624d34>
 462a788: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 462a78c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 462a790: 910043fd     	add	x29, sp, #0x10
 462a794: d10c4013     	sub	x19, x0, #0x310
 462a798: aa1303e0     	mov	x0, x19
 462a79c: 97fffe0d     	bl	0x4629fd0 <_ChromeMain+0x4624d34>
 462a7a0: 90054708     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 462a7a4: 91120108     	add	x8, x8, #0x480
 462a7a8: f8bfc100     	ldapr	x0, [x8]
 462a7ac: b40000a0     	cbz	x0, 0x462a7c0 <_ChromeMain+0x4625524>
 462a7b0: aa1303e1     	mov	x1, x19
 462a7b4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 462a7b8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 462a7bc: 1724c8d9     	b	0xf5cb20 <_ChromeMain+0xf57884>
 462a7c0: 97f2a3ce     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 462a7c4: 17fffffb     	b	0x462a7b0 <_ChromeMain+0x4625514>
 462a7c8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 462a7cc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 462a7d0: 910043fd     	add	x29, sp, #0x10
 462a7d4: f9404c13     	ldr	x19, [x0, #0x98]
 462a7d8: b4000313     	cbz	x19, 0x462a838 <_ChromeMain+0x462559c>
 462a7dc: 52800028     	mov	w8, #0x1                ; =1
 462a7e0: b8280268     	ldadd	w8, w8, [x19]
 462a7e4: 7100011f     	cmp	w8, #0x0
 462a7e8: 540002ed     	b.le	0x462a844 <_ChromeMain+0x46255a8>
 462a7ec: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 462a7f0: 6b09011f     	cmp	w8, w9
 462a7f4: 540002e0     	b.eq	0x462a850 <_ChromeMain+0x46255b4>
 462a7f8: f9404c08     	ldr	x8, [x0, #0x98]
 462a7fc: f9400508     	ldr	x8, [x8, #0x8]
 462a800: aa1303e0     	mov	x0, x19
 462a804: d63f0100     	blr	x8
 462a808: 12800008     	mov	w8, #-0x1               ; =-1
 462a80c: b8e80268     	ldaddal	w8, w8, [x19]
 462a810: 7100051f     	cmp	w8, #0x1
 462a814: 54000080     	b.eq	0x462a824 <_ChromeMain+0x4625588>
 462a818: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 462a81c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 462a820: d65f03c0     	ret
 462a824: f9400a61     	ldr	x1, [x19, #0x10]
 462a828: aa1303e0     	mov	x0, x19
 462a82c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 462a830: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 462a834: d61f0020     	br	x1
 462a838: d4200000     	brk	#0
 462a83c: d4400000     	hlt	#0
 462a840: d4200020     	brk	#0x1
 462a844: d4200000     	brk	#0
 462a848: d4400000     	hlt	#0
 462a84c: d4200020     	brk	#0x1
 462a850: d4200000     	brk	#0
 462a854: d4400000     	hlt	#0
 462a858: d4200020     	brk	#0x1
 462a85c: 00000000     	udf	#0x0
 462a860: b9407001     	ldr	w1, [x0, #0x70]
 462a864: 52859b60     	mov	w0, #0x2cdb             ; =11483
 462a868: 1776e5bc     	b	0x23e3f58 <_ChromeMain+0x23decbc>
 462a86c: 00000000     	udf	#0x0

positive SplitTabView metadata

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 78a7a44: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78a7a48: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78a7a4c: 910043fd     	add	x29, sp, #0x10
 78a7a50: d003b2d4     	adrp	x20, 0xef01000 <dyld_stub_binder+0xef01000>
 78a7a54: f9437293     	ldr	x19, [x20, #0x6e0]
 78a7a58: b40000b3     	cbz	x19, 0x78a7a6c <_ChromeMain+0x78a27d0>
 78a7a5c: aa1303e0     	mov	x0, x19
 78a7a60: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 78a7a64: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 78a7a68: d65f03c0     	ret
 78a7a6c: 52800d00     	mov	w0, #0x68               ; =104
 78a7a70: 961d9e3e     	bl	0xf368 <_ChromeMain+0xa0cc>
 78a7a74: aa0003f3     	mov	x19, x0
 78a7a78: 94000012     	bl	0x78a7ac0 <_ChromeMain+0x78a2824>
 78a7a7c: 967bfb5a     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 78a7a80: f9037293     	str	x19, [x20, #0x6e0]
 78a7a84: 17fffff6     	b	0x78a7a5c <_ChromeMain+0x78a27c0>
		...
 78a7aa0: 17ffffe9     	b	0x78a7a44 <_ChromeMain+0x78a27a8>
		...
 78a7ac0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78a7ac4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78a7ac8: 910043fd     	add	x29, sp, #0x10
 78a7acc: aa0003f3     	mov	x19, x0
 78a7ad0: 90030fa1     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 78a7ad4: 9135fc21     	add	x1, x1, #0xd7f
 78a7ad8: 52800742     	mov	w2, #0x3a               ; =58
 78a7adc: 52800503     	mov	w3, #0x28               ; =40
 78a7ae0: 9631fea6     	bl	0x527578 <_ChromeMain+0x5222dc>
 78a7ae4: d0034888     	adrp	x8, 0xe1b9000 <dyld_stub_binder+0xe1b9000>
 78a7ae8: 911e8108     	add	x8, x8, #0x7a0
 78a7aec: f9000008     	str	x8, [x0]
 78a7af0: 90030fa1     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 78a7af4: 9135c821     	add	x1, x1, #0xd72
 78a7af8: 52800182     	mov	w2, #0xc                ; =12
 78a7afc: 96f617b8     	bl	0x362d9dc <_ChromeMain+0x3628740>
 78a7b00: 96ab37ac     	bl	0x23759b0 <_ChromeMain+0x2370714>
