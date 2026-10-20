original third argument store

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 412a854: f9020676     	str	x22, [x19, #0x408]
 412a858: b94152d6     	ldr	w22, [x22, #0x150]
 412a85c: b9041276     	str	w22, [x19, #0x410]
 412a860: 39105275     	strb	w21, [x19, #0x414]

split suppression with pinned retained

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

activation before keyboard reorder refusal

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 412ea14: d10103ff     	sub	sp, sp, #0x40
 412ea18: a90157f6     	stp	x22, x21, [sp, #0x10]
 412ea1c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 412ea20: a9037bfd     	stp	x29, x30, [sp, #0x30]
 412ea24: 9100c3fd     	add	x29, sp, #0x30
 412ea28: aa0103f4     	mov	x20, x1
 412ea2c: aa0003f3     	mov	x19, x0
 412ea30: 79411028     	ldrh	w8, [x1, #0x88]
 412ea34: 7100351f     	cmp	w8, #0xd
 412ea38: 540000e1     	b.ne	0x412ea54 <_ChromeMain+0x41297b8>
 412ea3c: 39584668     	ldrb	w8, [x19, #0x611]
 412ea40: 370000a8     	tbnz	w8, #0x0, 0x412ea54 <_ChromeMain+0x41297b8>
 412ea44: f9420668     	ldr	x8, [x19, #0x408]
 412ea48: b4000068     	cbz	x8, 0x412ea54 <_ChromeMain+0x41297b8>
 412ea4c: f940a515     	ldr	x21, [x8, #0x148]
 412ea50: b50004d5     	cbnz	x21, 0x412eae8 <_ChromeMain+0x412984c>
 412ea54: aa1403e0     	mov	x0, x20
 412ea58: 52800021     	mov	w1, #0x1                ; =1
 412ea5c: 95ffbad0     	bl	0xc11d59c <_ChromeMain+0xc118300>
 412ea60: b6000060     	tbz	x0, #0x20, 0x412ea6c <_ChromeMain+0x41297d0>
 412ea64: 39505268     	ldrb	w8, [x19, #0x414]
 412ea68: 36000108     	tbz	w8, #0x0, 0x412ea88 <_ChromeMain+0x41297ec>
 412ea6c: 52800013     	mov	w19, #0x0               ; =0
 412ea70: aa1303e0     	mov	x0, x19
 412ea74: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 412ea78: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 412ea7c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 412ea80: 910103ff     	add	sp, sp, #0x40
 412ea84: d65f03c0     	ret
 412ea88: f9420668     	ldr	x8, [x19, #0x408]
 412ea8c: b4ffff08     	cbz	x8, 0x412ea6c <_ChromeMain+0x41297d0>
 412ea90: f940a515     	ldr	x21, [x8, #0x148]
 412ea94: b4fffed5     	cbz	x21, 0x412ea6c <_ChromeMain+0x41297d0>
 412ea98: b9405294     	ldr	w20, [x20, #0x50]
 412ea9c: 7100041f     	cmp	w0, #0x1
 412eaa0: 54000160     	b.eq	0x412eacc <_ChromeMain+0x4129830>
 412eaa4: 34000060     	cbz	w0, 0x412eab0 <_ChromeMain+0x4129814>
 412eaa8: 52800033     	mov	w19, #0x1               ; =1
 412eaac: 17fffff1     	b	0x412ea70 <_ChromeMain+0x41297d4>
 412eab0: aa1303e0     	mov	x0, x19
 412eab4: 94ddf5b6     	bl	0x78ac18c <_ChromeMain+0x78a6ef0>
 412eab8: aa0003e1     	mov	x1, x0
 412eabc: aa1503e0     	mov	x0, x21
 412eac0: 36080334     	tbz	w20, #0x1, 0x412eb24 <_ChromeMain+0x4129888>
 412eac4: 94dde988     	bl	0x78a90e4 <_ChromeMain+0x78a3e48>
 412eac8: 17fffff8     	b	0x412eaa8 <_ChromeMain+0x412980c>
 412eacc: aa1303e0     	mov	x0, x19
 412ead0: 94ddf5af     	bl	0x78ac18c <_ChromeMain+0x78a6ef0>
 412ead4: aa0003e1     	mov	x1, x0
 412ead8: 360802d4     	tbz	w20, #0x1, 0x412eb30 <_ChromeMain+0x4129894>
 412eadc: aa1503e0     	mov	x0, x21
 412eae0: 94ddea04     	bl	0x78a92f0 <_ChromeMain+0x78a4054>
 412eae4: 17fffff1     	b	0x412eaa8 <_ChromeMain+0x412980c>
 412eae8: aa1303e0     	mov	x0, x19

gesture/press selection retains but drag initiation skipped

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 412ed68: 395846a8     	ldrb	w8, [x21, #0x611]
 412ed6c: 36000188     	tbz	w8, #0x0, 0x412ed9c <_ChromeMain+0x4129b00>
 412ed70: 395052a8     	ldrb	w8, [x21, #0x414]
 412ed74: 3707fd68     	tbnz	w8, #0x0, 0x412ed20 <_ChromeMain+0x4129a84>
 412ed78: f9401ac0     	ldr	x0, [x22, #0x30]
 412ed7c: b40007e0     	cbz	x0, 0x412ee78 <_ChromeMain+0x4129bdc>
 412ed80: f94206a1     	ldr	x1, [x21, #0x408]
 412ed84: 910063e2     	add	x2, sp, #0x18
 412ed88: aa1303e3     	mov	x3, x19
 412ed8c: 97ff9b83     	bl	0x4115b98 <_ChromeMain+0x41108fc>
 412ed90: 52800033     	mov	w19, #0x1               ; =1
 412ed94: f9400ff4     	ldr	x20, [sp, #0x18]
 412ed98: 17ffffe3     	b	0x412ed24 <_ChromeMain+0x4129a88>

release skips source drag forwarding

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 412f01c: b94052c8     	ldr	w8, [x22, #0x50]
 412f020: 12151109     	and	w9, w8, #0xf800
 412f024: 7140053f     	cmp	w9, #0x1, lsl #12       ; =0x1000
 412f028: 54000900     	b.eq	0x412f148 <_ChromeMain+0x4129eac>
 412f02c: 7120013f     	cmp	w9, #0x800
 412f030: 1a9f0749     	csinc	w9, w26, wzr, eq
 412f034: 370001a9     	tbnz	w9, #0x0, 0x412f068 <_ChromeMain+0x4129dcc>
 412f038: 39505269     	ldrb	w9, [x19, #0x414]
 412f03c: 370000e9     	tbnz	w9, #0x0, 0x412f058 <_ChromeMain+0x4129dbc>
 412f040: f9401aa9     	ldr	x9, [x21, #0x30]
 412f044: b4000ea9     	cbz	x9, 0x412f218 <_ChromeMain+0x4129f7c>
 412f048: 37080108     	tbnz	w8, #0x1, 0x412f068 <_ChromeMain+0x4129dcc>
 412f04c: 39502129     	ldrb	w9, [x9, #0x408]
 412f050: 370000c9     	tbnz	w9, #0x0, 0x412f068 <_ChromeMain+0x4129dcc>
 412f054: 14000002     	b	0x412f05c <_ChromeMain+0x4129dc0>
 412f058: 37080088     	tbnz	w8, #0x1, 0x412f068 <_ChromeMain+0x4129dcc>
 412f05c: 37200068     	tbnz	w8, #0x4, 0x412f068 <_ChromeMain+0x4129dcc>
 412f060: 39585e68     	ldrb	w8, [x19, #0x617]
 412f064: 36000b68     	tbz	w8, #0x0, 0x412f1d0 <_ChromeMain+0x4129f34>
 412f068: 39505268     	ldrb	w8, [x19, #0x414]
 412f06c: 36000628     	tbz	w8, #0x0, 0x412f130 <_ChromeMain+0x4129e94>
 412f070: b40001d4     	cbz	x20, 0x412f0a8 <_ChromeMain+0x4129e0c>
 412f074: 19404288     	ldapurb	w8, [x20, #0x4]
 412f078: 35000068     	cbnz	w8, 0x412f084 <_ChromeMain+0x4129de8>
 412f07c: b4000059     	cbz	x25, 0x412f084 <_ChromeMain+0x4129de8>
 412f080: 39185e7f     	strb	wzr, [x19, #0x617]

source pointer-state forwarding mode guard

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 412f2c4: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 412f2c8: a9014ff4     	stp	x20, x19, [sp, #0x10]
 412f2cc: a9027bfd     	stp	x29, x30, [sp, #0x20]
 412f2d0: 910083fd     	add	x29, sp, #0x20
 412f2d4: aa0003f3     	mov	x19, x0
 412f2d8: f9420408     	ldr	x8, [x0, #0x408]
 412f2dc: b40000a8     	cbz	x8, 0x412f2f0 <_ChromeMain+0x412a054>
 412f2e0: 39505269     	ldrb	w9, [x19, #0x414]
 412f2e4: 37000069     	tbnz	w9, #0x0, 0x412f2f0 <_ChromeMain+0x412a054>
 412f2e8: f940a508     	ldr	x8, [x8, #0x148]
 412f2ec: b50005a8     	cbnz	x8, 0x412f3a0 <_ChromeMain+0x412a104>
 412f2f0: 39586668     	ldrb	w8, [x19, #0x619]
 412f2f4: 35000148     	cbnz	w8, 0x412f31c <_ChromeMain+0x412a080>
 412f2f8: 39584e68     	ldrb	w8, [x19, #0x613]
 412f2fc: 39184e7f     	strb	wzr, [x19, #0x613]
 412f300: 39584a69     	ldrb	w9, [x19, #0x612]
 412f304: 37000589     	tbnz	w9, #0x0, 0x412f3b4 <_ChromeMain+0x412a118>
 412f308: 37000568     	tbnz	w8, #0x0, 0x412f3b4 <_ChromeMain+0x412a118>
 412f30c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 412f310: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 412f314: a8c357f6     	ldp	x22, x21, [sp], #0x30
 412f318: d65f03c0     	ret
 412f31c: 3918667f     	strb	wzr, [x19, #0x619]
 412f320: aa1303e0     	mov	x0, x19
 412f324: 9711c796     	bl	0x5a117c <_ChromeMain+0x59bee0>
 412f328: aa1303f4     	mov	x20, x19
 412f32c: f940c694     	ldr	x20, [x20, #0x188]
 412f330: b4fffe54     	cbz	x20, 0x412f2f8 <_ChromeMain+0x412a05c>
 412f334: aa1403e0     	mov	x0, x20
 412f338: 9711c791     	bl	0x5a117c <_ChromeMain+0x59bee0>
 412f33c: f9400288     	ldr	x8, [x20]

drag continuation returnsfalse

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 412f77c: f9420408     	ldr	x8, [x0, #0x408]
 412f780: b40000c8     	cbz	x8, 0x412f798 <_ChromeMain+0x412a4fc>
 412f784: aa0003f4     	mov	x20, x0
 412f788: 39505009     	ldrb	w9, [x0, #0x414]
 412f78c: 37000069     	tbnz	w9, #0x0, 0x412f798 <_ChromeMain+0x412a4fc>
 412f790: f940a517     	ldr	x23, [x8, #0x148]
 412f794: b50000f7     	cbnz	x23, 0x412f7b0 <_ChromeMain+0x412a514>
 412f798: 52800000     	mov	w0, #0x0                ; =0
 412f79c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 412f7a0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 412f7a4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 412f7a8: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 412f7ac: d65f03c0     	ret

other press/gesture drag initiation skipped

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 412fa10: 395846a8     	ldrb	w8, [x21, #0x611]
 412fa14: 36000348     	tbz	w8, #0x0, 0x412fa7c <_ChromeMain+0x412a7e0>
 412fa18: 395052a8     	ldrb	w8, [x21, #0x414]
 412fa1c: 3707fde8     	tbnz	w8, #0x0, 0x412f9d8 <_ChromeMain+0x412a73c>
 412fa20: f9401a80     	ldr	x0, [x20, #0x30]
 412fa24: b4000780     	cbz	x0, 0x412fb14 <_ChromeMain+0x412a878>
 412fa28: f94206a1     	ldr	x1, [x21, #0x408]
 412fa2c: 910063e2     	add	x2, sp, #0x18
 412fa30: aa1303e3     	mov	x3, x19
 412fa34: 97ff9859     	bl	0x4115b98 <_ChromeMain+0x41108fc>

actual row sizes and actualView+8px horizontal insets

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
 4133ce8: 0aa87d08     	bic	w8, w8, w8, asr #31
 4133cec: 0ab57eb8     	bic	w24, w21, w21, asr #31
 4133cf0: aa188108     	orr	x8, x8, x24, lsl #32
 4133cf4: a9017e7f     	stp	xzr, xzr, [x19, #0x10]
 4133cf8: a9007e68     	stp	x8, xzr, [x19]
 4133cfc: a90323ff     	stp	xzr, x8, [sp, #0x30]
 4133d00: f9401a80     	ldr	x0, [x20, #0x30]
 4133d04: f9400008     	ldr	x8, [x0]
 4133d08: f9403908     	ldr	x8, [x8, #0x70]
 4133d0c: d63f0100     	blr	x8
 4133d10: a90207e0     	stp	x0, x1, [sp, #0x20]
 4133d14: 9100c3e0     	add	x0, sp, #0x30
 4133d18: 910083e1     	add	x1, sp, #0x20
 4133d1c: 970a64e7     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 4133d20: a9025bf6     	stp	x22, x22, [sp, #0x20]
 4133d24: 9100c3e0     	add	x0, sp, #0x30
 4133d28: 910083e1     	add	x1, sp, #0x20
 4133d2c: 970a64e3     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>

positive SplitTabView metadata

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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

original pinned metric58 immediate40 via root prior decode

/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  50394c: 52800500     	mov	w0, #0x28               ; =40
  503950: 14000011     	b	0x503994 <_ChromeMain+0x4fe6f8>
  503954: 52800280     	mov	w0, #0x14               ; =20

