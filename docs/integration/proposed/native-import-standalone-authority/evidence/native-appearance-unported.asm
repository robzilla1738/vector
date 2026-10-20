
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 458cc00: b4001be0     	cbz	x0, 0x458cf7c <_ChromeMain+0x4587ce0>
 458cc04: d10143ff     	sub	sp, sp, #0x50
 458cc08: a9015ff8     	stp	x24, x23, [sp, #0x10]
 458cc0c: a90257f6     	stp	x22, x21, [sp, #0x20]
 458cc10: a9034ff4     	stp	x20, x19, [sp, #0x30]
 458cc14: a9047bfd     	stp	x29, x30, [sp, #0x40]
 458cc18: 910103fd     	add	x29, sp, #0x40
 458cc1c: aa0003f3     	mov	x19, x0
 458cc20: 9100a000     	add	x0, x0, #0x28
 458cc24: 9707e70d     	bl	0x786858 <_ChromeMain+0x7815bc>
 458cc28: b4001ac0     	cbz	x0, 0x458cf80 <_ChromeMain+0x4587ce4>
 458cc2c: aa0003f4     	mov	x20, x0
 458cc30: f9400288     	ldr	x8, [x20]
 458cc34: f9401109     	ldr	x9, [x8, #0x20]
 458cc38: 910003e8     	mov	x8, sp
 458cc3c: aa1403e0     	mov	x0, x20
 458cc40: d63f0120     	blr	x9
 458cc44: f94003e0     	ldr	x0, [sp]
 458cc48: 95037d31     	bl	0x866c10c <_ChromeMain+0x8666e70>
 458cc4c: aa0003f3     	mov	x19, x0
 458cc50: f94003f5     	ldr	x21, [sp]
 458cc54: f90003ff     	str	xzr, [sp]
 458cc58: b40000d5     	cbz	x21, 0x458cc70 <_ChromeMain+0x45879d4>
 458cc5c: aa1503e0     	mov	x0, x21
 458cc60: 95037d2e     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 458cc64: aa1503e0     	mov	x0, x21
 458cc68: 52800101     	mov	w1, #0x8                ; =8
 458cc6c: 96e9f093     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458cc70: b4001793     	cbz	x19, 0x458cf60 <_ChromeMain+0x4587cc4>
 458cc74: aa1303e0     	mov	x0, x19
 458cc78: 954c48e6     	bl	0x989f010 <_ChromeMain+0x9899d74>
 458cc7c: 927cf408     	and	x8, x0, #0xfffffffffffffff3
 458cc80: b2710102     	orr	x2, x8, #0x8000
 458cc84: aa1303e0     	mov	x0, x19
 458cc88: 954c48e5     	bl	0x989f01c <_ChromeMain+0x9899d80>
 458cc8c: aa1303e0     	mov	x0, x19
 458cc90: 94e9dab6     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 458cc94: 954c48e5     	bl	0x989f028 <_ChromeMain+0x9899d8c>
 458cc98: 37400080     	tbnz	w0, #0x8, 0x458cca8 <_ChromeMain+0x4587a0c>
 458cc9c: 9277f402     	and	x2, x0, #0xfffffffffffffe7f
 458cca0: aa1303e0     	mov	x0, x19
 458cca4: 954c48e4     	bl	0x989f034 <_ChromeMain+0x9899d98>
 458cca8: aa1303e0     	mov	x0, x19
 458ccac: 94e9daac     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458ccb0: f9400288     	ldr	x8, [x20]
 458ccb4: f9407908     	ldr	x8, [x8, #0xf0]
 458ccb8: aa1403e0     	mov	x0, x20
 458ccbc: d63f0100     	blr	x8
 458ccc0: 52801e61     	mov	w1, #0xf3               ; =243
 458ccc4: 97266d41     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 458ccc8: 95131e89     	bl	0x8a546ec <_ChromeMain+0x8a4f450>
 458cccc: 94e9da9b     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458ccd0: aa0003f4     	mov	x20, x0
 458ccd4: b0053b08     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 458ccd8: f944f100     	ldr	x0, [x8, #0x9e0]
 458ccdc: b004d4e8     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 458cce0: f9448908     	ldr	x8, [x8, #0x910]
 458cce4: f9400102     	ldr	x2, [x8]
 458cce8: 956e9462     	bl	0xa131e70 <_ChromeMain+0xa12cbd4>
 458ccec: 94e9da93     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458ccf0: aa0003f5     	mov	x21, x0
 458ccf4: aa1303e0     	mov	x0, x19
 458ccf8: aa1503e2     	mov	x2, x21
 458ccfc: 956e9460     	bl	0xa131e7c <_ChromeMain+0xa12cbe0>
 458cd00: aa1503e0     	mov	x0, x21
 458cd04: 94e9da96     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cd08: aa1303e0     	mov	x0, x19
 458cd0c: 52800022     	mov	w2, #0x1                ; =1
 458cd10: 954c7643     	bl	0x98aa61c <_ChromeMain+0x98a5380>
 458cd14: aa1303e0     	mov	x0, x19
 458cd18: aa1403e2     	mov	x2, x20
 458cd1c: 95187a1d     	bl	0x8bab590 <_ChromeMain+0x8ba62f4>
 458cd20: aa1303e0     	mov	x0, x19
 458cd24: 9544a67a     	bl	0x96b670c <_ChromeMain+0x96b1470>
 458cd28: 94e9da84     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458cd2c: aa0003f5     	mov	x21, x0
 458cd30: b40004c0     	cbz	x0, 0x458cdc8 <_ChromeMain+0x4587b2c>
 458cd34: aa1503e0     	mov	x0, x21
 458cd38: 52800022     	mov	w2, #0x1                ; =1
 458cd3c: 956e9453     	bl	0xa131e88 <_ChromeMain+0xa12cbec>
 458cd40: aa1403e0     	mov	x0, x20
 458cd44: 95174170     	bl	0x8b5d304 <_ChromeMain+0x8b58068>
 458cd48: 956e9453     	bl	0xa131e94 <_ChromeMain+0xa12cbf8>
 458cd4c: aa0003f6     	mov	x22, x0
 458cd50: aa1503e0     	mov	x0, x21
 458cd54: 956e9453     	bl	0xa131ea0 <_ChromeMain+0xa12cc04>
 458cd58: 94e9da78     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458cd5c: aa0003f7     	mov	x23, x0
 458cd60: aa1603e2     	mov	x2, x22
 458cd64: 95187a0b     	bl	0x8bab590 <_ChromeMain+0x8ba62f4>
 458cd68: aa1703e0     	mov	x0, x23
 458cd6c: 94e9da7c     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cd70: aa1503e0     	mov	x0, x21
 458cd74: 950c4518     	bl	0x889e1d4 <_ChromeMain+0x8898f38>
 458cd78: 94e9da70     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458cd7c: aa0003f6     	mov	x22, x0
 458cd80: b4000200     	cbz	x0, 0x458cdc0 <_ChromeMain+0x4587b24>
 458cd84: aa1603e0     	mov	x0, x22
 458cd88: 52800022     	mov	w2, #0x1                ; =1
 458cd8c: 956e943f     	bl	0xa131e88 <_ChromeMain+0xa12cbec>
 458cd90: aa1403e0     	mov	x0, x20
 458cd94: 9517415c     	bl	0x8b5d304 <_ChromeMain+0x8b58068>
 458cd98: 956e943f     	bl	0xa131e94 <_ChromeMain+0xa12cbf8>
 458cd9c: aa0003f7     	mov	x23, x0
 458cda0: aa1603e0     	mov	x0, x22
 458cda4: 956e943f     	bl	0xa131ea0 <_ChromeMain+0xa12cc04>
 458cda8: 94e9da64     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458cdac: aa0003f8     	mov	x24, x0
 458cdb0: aa1703e2     	mov	x2, x23
 458cdb4: 951879f7     	bl	0x8bab590 <_ChromeMain+0x8ba62f4>
 458cdb8: aa1803e0     	mov	x0, x24
 458cdbc: 94e9da68     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cdc0: aa1603e0     	mov	x0, x22
 458cdc4: 94e9da66     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cdc8: aa1503e0     	mov	x0, x21
 458cdcc: 94e9da64     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cdd0: f0052d02     	adrp	x2, 0xeb2f000 <dyld_stub_binder+0xeb2f000>
 458cdd4: 9103e042     	add	x2, x2, #0xf8
 458cdd8: aa1303e0     	mov	x0, x19
 458cddc: 95ac1096     	bl	0xb091034 <_ChromeMain+0xb08bd98>
 458cde0: aa1303e0     	mov	x0, x19
 458cde4: 52800022     	mov	w2, #0x1                ; =1
 458cde8: 956e9416     	bl	0xa131e40 <_ChromeMain+0xa12cba4>
 458cdec: aa1303e0     	mov	x0, x19
 458cdf0: 52800022     	mov	w2, #0x1                ; =1
 458cdf4: 956e9410     	bl	0xa131e34 <_ChromeMain+0xa12cb98>
 458cdf8: aa1303e0     	mov	x0, x19
 458cdfc: 52800022     	mov	w2, #0x1                ; =1
 458ce00: 95ff101d     	bl	0xc550e74 <_ChromeMain+0xc54bbd8>
 458ce04: aa1303e0     	mov	x0, x19
 458ce08: d2800002     	mov	x2, #0x0                ; =0
 458ce0c: 954c488d     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458ce10: 94e9da4a     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458ce14: aa0003f5     	mov	x21, x0
 458ce18: 52800002     	mov	w2, #0x0                ; =0
 458ce1c: 950c44bb     	bl	0x889e108 <_ChromeMain+0x8898e6c>
 458ce20: aa1503e0     	mov	x0, x21
 458ce24: 94e9da4e     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458ce28: aa1303e0     	mov	x0, x19
 458ce2c: d2800002     	mov	x2, #0x0                ; =0
 458ce30: 954c4884     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458ce34: 94e9da41     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458ce38: aa0003f5     	mov	x21, x0
 458ce3c: 52800022     	mov	w2, #0x1                ; =1
 458ce40: 954c4883     	bl	0x989f04c <_ChromeMain+0x9899db0>
 458ce44: aa1503e0     	mov	x0, x21
 458ce48: 94e9da45     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458ce4c: aa1303e0     	mov	x0, x19
 458ce50: 52800022     	mov	w2, #0x1                ; =1
 458ce54: 954c487b     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458ce58: 94e9da38     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458ce5c: aa0003f5     	mov	x21, x0
 458ce60: 52800022     	mov	w2, #0x1                ; =1
 458ce64: 950c44a9     	bl	0x889e108 <_ChromeMain+0x8898e6c>
 458ce68: aa1503e0     	mov	x0, x21
 458ce6c: 94e9da3c     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458ce70: aa1303e0     	mov	x0, x19
 458ce74: 52800022     	mov	w2, #0x1                ; =1
 458ce78: 954c4872     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458ce7c: 94e9da2f     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458ce80: aa0003f5     	mov	x21, x0
 458ce84: 52800002     	mov	w2, #0x0                ; =0
 458ce88: 954c4871     	bl	0x989f04c <_ChromeMain+0x9899db0>
 458ce8c: aa1503e0     	mov	x0, x21
 458ce90: 94e9da33     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458ce94: aa1303e0     	mov	x0, x19
 458ce98: 52800042     	mov	w2, #0x2                ; =2
 458ce9c: 954c4869     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458cea0: 94e9da26     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458cea4: aa0003f5     	mov	x21, x0
 458cea8: 52800022     	mov	w2, #0x1                ; =1
 458ceac: 950c4497     	bl	0x889e108 <_ChromeMain+0x8898e6c>
 458ceb0: aa1503e0     	mov	x0, x21
 458ceb4: 94e9da2a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458ceb8: aa1303e0     	mov	x0, x19
 458cebc: 52800042     	mov	w2, #0x2                ; =2
 458cec0: 954c4860     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458cec4: 94e9da1d     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458cec8: aa0003f5     	mov	x21, x0
 458cecc: 52800002     	mov	w2, #0x0                ; =0
 458ced0: 954c485f     	bl	0x989f04c <_ChromeMain+0x9899db0>
 458ced4: aa1503e0     	mov	x0, x21
 458ced8: 94e9da21     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cedc: aa1303e0     	mov	x0, x19
 458cee0: 94e9da22     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 458cee4: d2800002     	mov	x2, #0x0                ; =0
 458cee8: 954c4856     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458ceec: 94e9da13     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458cef0: aa0003f5     	mov	x21, x0
 458cef4: 52800022     	mov	w2, #0x1                ; =1
 458cef8: 954c4855     	bl	0x989f04c <_ChromeMain+0x9899db0>
 458cefc: aa1503e0     	mov	x0, x21
 458cf00: 94e9da17     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cf04: aa1303e0     	mov	x0, x19
 458cf08: 52800022     	mov	w2, #0x1                ; =1
 458cf0c: 954c484d     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458cf10: 94e9da0a     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458cf14: aa0003f5     	mov	x21, x0
 458cf18: 52800022     	mov	w2, #0x1                ; =1
 458cf1c: 954c484c     	bl	0x989f04c <_ChromeMain+0x9899db0>
 458cf20: aa1503e0     	mov	x0, x21
 458cf24: 94e9da0e     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cf28: aa1303e0     	mov	x0, x19
 458cf2c: 52800042     	mov	w2, #0x2                ; =2
 458cf30: 954c4844     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458cf34: 94e9da01     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458cf38: aa0003f5     	mov	x21, x0
 458cf3c: aa1303e0     	mov	x0, x19
 458cf40: 94e9da07     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cf44: aa1503e0     	mov	x0, x21
 458cf48: 52800022     	mov	w2, #0x1                ; =1
 458cf4c: 954c4840     	bl	0x989f04c <_ChromeMain+0x9899db0>
 458cf50: aa1503e0     	mov	x0, x21
 458cf54: 94e9da02     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cf58: aa1403e0     	mov	x0, x20
 458cf5c: 94e9da00     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cf60: aa1303e0     	mov	x0, x19
 458cf64: 94e9d9fe     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458cf68: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 458cf6c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 458cf70: a94257f6     	ldp	x22, x21, [sp, #0x20]
 458cf74: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 458cf78: 910143ff     	add	sp, sp, #0x50
 458cf7c: d65f03c0     	ret
 458cf80: 9100a260     	add	x0, x19, #0x28
 458cf84: 972b4513     	bl	0x105e3d0 <_ChromeMain+0x1059134>
 458cf88: b5ffe520     	cbnz	x0, 0x458cc2c <_ChromeMain+0x4587990>
 458cf8c: f9403e74     	ldr	x20, [x19, #0x78]
 458cf90: b5ffe514     	cbnz	x20, 0x458cc30 <_ChromeMain+0x4587994>
 458cf94: 17fffff5     	b	0x458cf68 <_ChromeMain+0x4587ccc>
