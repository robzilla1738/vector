
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4642670: d10203ff     	sub	sp, sp, #0x80
 4642674: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4642678: a90557f6     	stp	x22, x21, [sp, #0x50]
 464267c: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4642680: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4642684: 9101c3fd     	add	x29, sp, #0x70
 4642688: b40005c1     	cbz	x1, 0x4642740 <_ChromeMain+0x463d4a4>
 464268c: aa0203f3     	mov	x19, x2
 4642690: aa0103f4     	mov	x20, x1
 4642694: aa0003f5     	mov	x21, x0
 4642698: b940e028     	ldr	w8, [x1, #0xe0]
 464269c: 7100151f     	cmp	w8, #0x5
 46426a0: 54000600     	b.eq	0x4642760 <_ChromeMain+0x463d4c4>
 46426a4: f9408a89     	ldr	x9, [x20, #0x110]
 46426a8: 52800017     	mov	w23, #0x0               ; =0
 46426ac: d37df136     	lsl	x22, x9, #3
 46426b0: b4000296     	cbz	x22, 0x4642700 <_ChromeMain+0x463d464>
 46426b4: f9408698     	ldr	x24, [x20, #0x108]
 46426b8: f8408701     	ldr	x1, [x24], #0x8
 46426bc: aa1503e0     	mov	x0, x21
 46426c0: aa1303e2     	mov	x2, x19
 46426c4: 97ffffeb     	bl	0x4642670 <_ChromeMain+0x463d3d4>
 46426c8: 2a0002f7     	orr	w23, w23, w0
 46426cc: f10022d6     	subs	x22, x22, #0x8
 46426d0: 54ffff41     	b.ne	0x46426b8 <_ChromeMain+0x463d41c>
 46426d4: b940e288     	ldr	w8, [x20, #0xe0]
 46426d8: 51000d08     	sub	w8, w8, #0x3
 46426dc: 7100091f     	cmp	w8, #0x2
 46426e0: 54000322     	b.hs	0x4642744 <_ChromeMain+0x463d4a8>
 46426e4: 37000077     	tbnz	w23, #0x0, 0x46426f0 <_ChromeMain+0x463d454>
 46426e8: 52800017     	mov	w23, #0x0               ; =0
 46426ec: 14000008     	b	0x464270c <_ChromeMain+0x463d470>
 46426f0: aa1403e0     	mov	x0, x20
 46426f4: 97eb93e3     	bl	0x4127680 <_ChromeMain+0x41223e4>
 46426f8: 52000017     	eor	w23, w0, #0x1
 46426fc: 14000004     	b	0x464270c <_ChromeMain+0x463d470>
 4642700: 51000d08     	sub	w8, w8, #0x3
 4642704: 7100091f     	cmp	w8, #0x2
 4642708: 540001e2     	b.hs	0x4642744 <_ChromeMain+0x463d4a8>
 464270c: f940a280     	ldr	x0, [x20, #0x140]
 4642710: b40001a0     	cbz	x0, 0x4642744 <_ChromeMain+0x463d4a8>
 4642714: 39472008     	ldrb	w8, [x0, #0x1c8]
 4642718: 6b0802ff     	cmp	w23, w8
 464271c: 54000140     	b.eq	0x4642744 <_ChromeMain+0x463d4a8>
 4642720: f9400008     	ldr	x8, [x0]
 4642724: f9405108     	ldr	x8, [x8, #0xa0]
 4642728: aa1703e1     	mov	x1, x23
 464272c: d63f0100     	blr	x8
 4642730: b40000b3     	cbz	x19, 0x4642744 <_ChromeMain+0x463d4a8>
 4642734: 52800028     	mov	w8, #0x1                ; =1
 4642738: 39000268     	strb	w8, [x19]
 464273c: 14000002     	b	0x4642744 <_ChromeMain+0x463d4a8>
 4642740: 52800017     	mov	w23, #0x0               ; =0
 4642744: 120002e0     	and	w0, w23, #0x1
 4642748: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 464274c: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4642750: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4642754: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4642758: 910203ff     	add	sp, sp, #0x80
 464275c: d65f03c0     	ret
 4642760: 390083ff     	strb	wzr, [sp, #0x20]
 4642764: 52801fe8     	mov	w8, #0xff               ; =255
 4642768: 3900a3e8     	strb	w8, [sp, #0x28]
 464276c: 910083e0     	add	x0, sp, #0x20
 4642770: 9103c281     	add	x1, x20, #0xf0
 4642774: 949ef038     	bl	0x6dfe854 <_ChromeMain+0x6df95b8>
 4642778: 3940a3e8     	ldrb	w8, [sp, #0x28]
 464277c: 35001d08     	cbnz	w8, 0x4642b1c <_ChromeMain+0x463d880>
 4642780: f94013f6     	ldr	x22, [sp, #0x20]
 4642784: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4642788: 90052b89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 464278c: f9404529     	ldr	x9, [x9, #0x88]
 4642790: eb09011f     	cmp	x8, x9
 4642794: 54000061     	b.ne	0x46427a0 <_ChromeMain+0x463d504>
 4642798: aa1603e0     	mov	x0, x22
 464279c: 96e790aa     	bl	0x26a44 <_ChromeMain+0x217a8>
 46427a0: f94356a8     	ldr	x8, [x21, #0x6a8]
 46427a4: b4000208     	cbz	x8, 0x46427e4 <_ChromeMain+0x463d548>
 46427a8: b4000456     	cbz	x22, 0x4642830 <_ChromeMain+0x463d594>
 46427ac: 394186c9     	ldrb	w9, [x22, #0x61]
 46427b0: 340001c9     	cbz	w9, 0x46427e8 <_ChromeMain+0x463d54c>
 46427b4: f941b509     	ldr	x9, [x8, #0x368]
 46427b8: 52804d0a     	mov	w10, #0x268             ; =616
 46427bc: 9b0a7d38     	mul	x24, x9, x10
 46427c0: b4000158     	cbz	x24, 0x46427e8 <_ChromeMain+0x463d54c>
 46427c4: f941b117     	ldr	x23, [x8, #0x360]
 46427c8: aa1603e1     	mov	x1, x22
 46427cc: aa1703e2     	mov	x2, x23
 46427d0: 97ff0f50     	bl	0x4606510 <_ChromeMain+0x4601274>
 46427d4: 37000440     	tbnz	w0, #0x0, 0x464285c <_ChromeMain+0x463d5c0>
 46427d8: 9109a2f7     	add	x23, x23, #0x268
 46427dc: f109a318     	subs	x24, x24, #0x268
 46427e0: 54ffff41     	b.ne	0x46427c8 <_ChromeMain+0x463d52c>
 46427e4: b4000276     	cbz	x22, 0x4642830 <_ChromeMain+0x463d594>
 46427e8: 914006b7     	add	x23, x21, #0x1, lsl #12 ; =0x1000
 46427ec: 394092e8     	ldrb	w8, [x23, #0x24]
 46427f0: 340000a8     	cbz	w8, 0x4642804 <_ChromeMain+0x463d568>
 46427f4: b94012c8     	ldr	w8, [x22, #0x10]
 46427f8: b95022a9     	ldr	w9, [x21, #0x1020]
 46427fc: 6b09011f     	cmp	w8, w9
 4642800: 54000880     	b.eq	0x4642910 <_ChromeMain+0x463d674>
 4642804: aa1503e0     	mov	x0, x21
 4642808: aa1603e1     	mov	x1, x22
 464280c: 97fffe1e     	bl	0x4642084 <_ChromeMain+0x463cde8>
 4642810: 37000260     	tbnz	w0, #0x0, 0x464285c <_ChromeMain+0x463d5c0>
 4642814: 394186c8     	ldrb	w8, [x22, #0x61]
 4642818: 37000148     	tbnz	w8, #0x0, 0x4642840 <_ChromeMain+0x463d5a4>
 464281c: 3941e2c8     	ldrb	w8, [x22, #0x78]
 4642820: 37000108     	tbnz	w8, #0x0, 0x4642840 <_ChromeMain+0x463d5a4>
 4642824: 396242a8     	ldrb	w8, [x21, #0x890]
 4642828: 340000c8     	cbz	w8, 0x4642840 <_ChromeMain+0x463d5a4>
 464282c: 14000071     	b	0x46429f0 <_ChromeMain+0x463d754>
 4642830: aa1503e0     	mov	x0, x21
 4642834: aa1603e1     	mov	x1, x22
 4642838: 97fffe13     	bl	0x4642084 <_ChromeMain+0x463cde8>
 464283c: 37000100     	tbnz	w0, #0x0, 0x464285c <_ChromeMain+0x463d5c0>
 4642840: f942eaa0     	ldr	x0, [x21, #0x5d0]
 4642844: b4000080     	cbz	x0, 0x4642854 <_ChromeMain+0x463d5b8>
 4642848: aa1603e1     	mov	x1, x22
 464284c: 97ff909d     	bl	0x4626ac0 <_ChromeMain+0x4621824>
 4642850: 35000060     	cbnz	w0, 0x464285c <_ChromeMain+0x463d5c0>
 4642854: 52800037     	mov	w23, #0x1               ; =1
 4642858: 14000002     	b	0x4642860 <_ChromeMain+0x463d5c4>
 464285c: 52800017     	mov	w23, #0x0               ; =0
 4642860: f94236a8     	ldr	x8, [x21, #0x468]
 4642864: f9404909     	ldr	x9, [x8, #0x90]
 4642868: b40000c9     	cbz	x9, 0x4642880 <_ChromeMain+0x463d5e4>
 464286c: eb0902df     	cmp	x22, x9
 4642870: 54000400     	b.eq	0x46428f0 <_ChromeMain+0x463d654>
 4642874: 3941e2ca     	ldrb	w10, [x22, #0x78]
 4642878: 350008ca     	cbnz	w10, 0x4642990 <_ChromeMain+0x463d6f4>
 464287c: 52800009     	mov	w9, #0x0                ; =0
 4642880: 3dc022c0     	ldr	q0, [x22, #0x80]
 4642884: f9404aca     	ldr	x10, [x22, #0x90]
 4642888: f9001bea     	str	x10, [sp, #0x30]
 464288c: 3d800be0     	str	q0, [sp, #0x20]
 4642890: 520002ea     	eor	w10, w23, #0x1
 4642894: aa1703f6     	mov	x22, x23
 4642898: 2a0a0129     	orr	w9, w9, w10
 464289c: 37000089     	tbnz	w9, #0x0, 0x46428ac <_ChromeMain+0x463d610>
 46428a0: 3940c3e9     	ldrb	w9, [sp, #0x30]
 46428a4: 370012c9     	tbnz	w9, #0x0, 0x4642afc <_ChromeMain+0x463d860>
 46428a8: 52800036     	mov	w22, #0x1               ; =1
 46428ac: f940a294     	ldr	x20, [x20, #0x140]
 46428b0: b4fff4b4     	cbz	x20, 0x4642744 <_ChromeMain+0x463d4a8>
 46428b4: 39472288     	ldrb	w8, [x20, #0x1c8]
 46428b8: 120002c9     	and	w9, w22, #0x1
 46428bc: 6b08013f     	cmp	w9, w8
 46428c0: 54fff420     	b.eq	0x4642744 <_ChromeMain+0x463d4a8>
 46428c4: 370000d6     	tbnz	w22, #0x0, 0x46428dc <_ChromeMain+0x463d640>
 46428c8: f94252a0     	ldr	x0, [x21, #0x4a0]
 46428cc: b4000080     	cbz	x0, 0x46428dc <_ChromeMain+0x463d640>
 46428d0: d2800001     	mov	x1, #0x0                ; =0
 46428d4: 52800082     	mov	w2, #0x4                ; =4
 46428d8: 978486ba     	bl	0x27643c0 <_ChromeMain+0x275f124>
 46428dc: f9400288     	ldr	x8, [x20]
 46428e0: f9405108     	ldr	x8, [x8, #0xa0]
 46428e4: 120002c1     	and	w1, w22, #0x1
 46428e8: aa1403e0     	mov	x0, x20
 46428ec: 17ffff90     	b	0x464272c <_ChromeMain+0x463d490>
 46428f0: 3dc022c0     	ldr	q0, [x22, #0x80]
 46428f4: f9404ac8     	ldr	x8, [x22, #0x90]
 46428f8: f9001be8     	str	x8, [sp, #0x30]
 46428fc: 3d800be0     	str	q0, [sp, #0x20]
 4642900: aa1703f6     	mov	x22, x23
 4642904: 17ffffea     	b	0x46428ac <_ChromeMain+0x463d610>
 4642908: aa0903eb     	mov	x11, x9
 464290c: 14000010     	b	0x464294c <_ChromeMain+0x463d6b0>
 4642910: f947e6a9     	ldr	x9, [x21, #0xfc8]
 4642914: f947eaaa     	ldr	x10, [x21, #0xfd0]
 4642918: d37be94b     	lsl	x11, x10, #5
 464291c: b4ffff6b     	cbz	x11, 0x4642908 <_ChromeMain+0x463d66c>
 4642920: 9345fd6c     	asr	x12, x11, #5
 4642924: aa0903eb     	mov	x11, x9
 4642928: d341fd8d     	lsr	x13, x12, #1
 464292c: 8b0d156e     	add	x14, x11, x13, lsl #5
 4642930: b84205cf     	ldr	w15, [x14], #0x20
 4642934: aa6c07f0     	mvn	x16, x12, lsr #1
 4642938: 8b10018c     	add	x12, x12, x16
 464293c: 6b0801ff     	cmp	w15, w8
 4642940: 9a8db18c     	csel	x12, x12, x13, lt
 4642944: 9a8bb1cb     	csel	x11, x14, x11, lt
 4642948: b5ffff0c     	cbnz	x12, 0x4642928 <_ChromeMain+0x463d68c>
 464294c: 8b0a1529     	add	x9, x9, x10, lsl #5
 4642950: eb09017f     	cmp	x11, x9
 4642954: 54000080     	b.eq	0x4642964 <_ChromeMain+0x463d6c8>
 4642958: b9400169     	ldr	w9, [x11]
 464295c: 6b09011f     	cmp	w8, w9
 4642960: 54fff52a     	b.ge	0x4642804 <_ChromeMain+0x463d568>
 4642964: aa1503e0     	mov	x0, x21
 4642968: aa1603e1     	mov	x1, x22
 464296c: 94002b6b     	bl	0x464d718 <_ChromeMain+0x464847c>
 4642970: 3707f760     	tbnz	w0, #0x0, 0x464285c <_ChromeMain+0x463d5c0>
 4642974: 3940b2e8     	ldrb	w8, [x23, #0x2c]
 4642978: 34fff468     	cbz	w8, 0x4642804 <_ChromeMain+0x463d568>
 464297c: b94012c8     	ldr	w8, [x22, #0x10]
 4642980: b9502aa9     	ldr	w9, [x21, #0x1028]
 4642984: 6b08013f     	cmp	w9, w8
 4642988: 54fff6a0     	b.eq	0x464285c <_ChromeMain+0x463d5c0>
 464298c: 17ffff9e     	b	0x4642804 <_ChromeMain+0x463d568>
 4642990: 3cc682c0     	ldur	q0, [x22, #0x68]
 4642994: 3d800be0     	str	q0, [sp, #0x20]
 4642998: f9403ecb     	ldr	x11, [x22, #0x78]
 464299c: f9001beb     	str	x11, [sp, #0x30]
 46429a0: 3cc68120     	ldur	q0, [x9, #0x68]
 46429a4: 3d8003e0     	str	q0, [sp]
 46429a8: f9403d29     	ldr	x9, [x9, #0x78]
 46429ac: f9000be9     	str	x9, [sp, #0x10]
 46429b0: 12001d2a     	and	w10, w9, #0xff
 46429b4: 6b2b015f     	cmp	w10, w11, uxtb
 46429b8: 1a9f17e9     	cset	w9, eq
 46429bc: 6a0b015f     	tst	w10, w11
 46429c0: 54fff600     	b.eq	0x4642880 <_ChromeMain+0x463d5e4>
 46429c4: 36000aaa     	tbz	w10, #0x0, 0x4642b18 <_ChromeMain+0x463d87c>
 46429c8: a9422be9     	ldp	x9, x10, [sp, #0x20]
 46429cc: a94033eb     	ldp	x11, x12, [sp]
 46429d0: eb0b013f     	cmp	x9, x11
 46429d4: fa4c0140     	ccmp	x10, x12, #0x0, eq
 46429d8: 1a9f17e9     	cset	w9, eq
 46429dc: 17ffffa9     	b	0x4642880 <_ChromeMain+0x463d5e4>
 46429e0: aa0903eb     	mov	x11, x9
 46429e4: 14000028     	b	0x4642a84 <_ChromeMain+0x463d7e8>
 46429e8: aa0903eb     	mov	x11, x9
 46429ec: 14000011     	b	0x4642a30 <_ChromeMain+0x463d794>
 46429f0: b94012c8     	ldr	w8, [x22, #0x10]
 46429f4: f9486ea9     	ldr	x9, [x21, #0x10d8]
 46429f8: f94872aa     	ldr	x10, [x21, #0x10e0]
 46429fc: d37ef54b     	lsl	x11, x10, #2
 4642a00: b4ffff4b     	cbz	x11, 0x46429e8 <_ChromeMain+0x463d74c>
 4642a04: 9342fd6c     	asr	x12, x11, #2
 4642a08: aa0903eb     	mov	x11, x9
 4642a0c: d341fd8d     	lsr	x13, x12, #1
 4642a10: 8b0d096e     	add	x14, x11, x13, lsl #2
 4642a14: b84045cf     	ldr	w15, [x14], #0x4
 4642a18: aa6c07f0     	mvn	x16, x12, lsr #1
 4642a1c: 8b10018c     	add	x12, x12, x16
 4642a20: 6b0801ff     	cmp	w15, w8
 4642a24: 9a8db18c     	csel	x12, x12, x13, lt
 4642a28: 9a8bb1cb     	csel	x11, x14, x11, lt
 4642a2c: b5ffff0c     	cbnz	x12, 0x4642a0c <_ChromeMain+0x463d770>
 4642a30: 8b0a0929     	add	x9, x9, x10, lsl #2
 4642a34: eb09017f     	cmp	x11, x9
 4642a38: 54000080     	b.eq	0x4642a48 <_ChromeMain+0x463d7ac>
 4642a3c: b9400169     	ldr	w9, [x11]
 4642a40: 6b09011f     	cmp	w8, w9
 4642a44: 54ffefea     	b.ge	0x4642840 <_ChromeMain+0x463d5a4>
 4642a48: f9484aa9     	ldr	x9, [x21, #0x1090]
 4642a4c: f9484eaa     	ldr	x10, [x21, #0x1098]
 4642a50: d37ef54b     	lsl	x11, x10, #2
 4642a54: b4fffc6b     	cbz	x11, 0x46429e0 <_ChromeMain+0x463d744>
 4642a58: 9342fd6c     	asr	x12, x11, #2
 4642a5c: aa0903eb     	mov	x11, x9
 4642a60: d341fd8d     	lsr	x13, x12, #1
 4642a64: 8b0d096e     	add	x14, x11, x13, lsl #2
 4642a68: b84045cf     	ldr	w15, [x14], #0x4
 4642a6c: aa6c07f0     	mvn	x16, x12, lsr #1
 4642a70: 8b10018c     	add	x12, x12, x16
 4642a74: 6b0801ff     	cmp	w15, w8
 4642a78: 9a8db18c     	csel	x12, x12, x13, lt
 4642a7c: 9a8bb1cb     	csel	x11, x14, x11, lt
 4642a80: b5ffff0c     	cbnz	x12, 0x4642a60 <_ChromeMain+0x463d7c4>
 4642a84: 8b0a0929     	add	x9, x9, x10, lsl #2
 4642a88: eb09017f     	cmp	x11, x9
 4642a8c: 54000080     	b.eq	0x4642a9c <_ChromeMain+0x463d800>
 4642a90: b9400169     	ldr	w9, [x11]
 4642a94: 6b09011f     	cmp	w8, w9
 4642a98: 54ffed4a     	b.ge	0x4642840 <_ChromeMain+0x463d5a4>
 4642a9c: f947e6a9     	ldr	x9, [x21, #0xfc8]
 4642aa0: f947eaaa     	ldr	x10, [x21, #0xfd0]
 4642aa4: d37be94b     	lsl	x11, x10, #5
 4642aa8: b400026b     	cbz	x11, 0x4642af4 <_ChromeMain+0x463d858>
 4642aac: 9345fd6c     	asr	x12, x11, #5
 4642ab0: aa0903eb     	mov	x11, x9
 4642ab4: d341fd8d     	lsr	x13, x12, #1
 4642ab8: 8b0d156e     	add	x14, x11, x13, lsl #5
 4642abc: b84205cf     	ldr	w15, [x14], #0x20
 4642ac0: aa6c07f0     	mvn	x16, x12, lsr #1
 4642ac4: 8b10018c     	add	x12, x12, x16
 4642ac8: 6b0801ff     	cmp	w15, w8
 4642acc: 9a8db18c     	csel	x12, x12, x13, lt
 4642ad0: 9a8bb1cb     	csel	x11, x14, x11, lt
 4642ad4: b5ffff0c     	cbnz	x12, 0x4642ab4 <_ChromeMain+0x463d818>
 4642ad8: 8b0a1529     	add	x9, x9, x10, lsl #5
 4642adc: eb09017f     	cmp	x11, x9
 4642ae0: 54ffeb00     	b.eq	0x4642840 <_ChromeMain+0x463d5a4>
 4642ae4: b9400169     	ldr	w9, [x11]
 4642ae8: 6b09011f     	cmp	w8, w9
 4642aec: 54ffeb8a     	b.ge	0x464285c <_ChromeMain+0x463d5c0>
 4642af0: 17ffff54     	b	0x4642840 <_ChromeMain+0x463d5a4>
 4642af4: aa0903eb     	mov	x11, x9
 4642af8: 17fffff8     	b	0x4642ad8 <_ChromeMain+0x463d83c>
 4642afc: f9400500     	ldr	x0, [x8, #0x8]
 4642b00: 910083e1     	add	x1, sp, #0x20
 4642b04: 94dc11fd     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 4642b08: f9401008     	ldr	x8, [x0, #0x20]
 4642b0c: 39407108     	ldrb	w8, [x8, #0x1c]
 4642b10: 52000116     	eor	w22, w8, #0x1
 4642b14: 17ffff66     	b	0x46428ac <_ChromeMain+0x463d610>
 4642b18: d4200020     	brk	#0x1
 4642b1c: 7103fd1f     	cmp	w8, #0xff
 4642b20: 54000081     	b.ne	0x4642b30 <_ChromeMain+0x463d894>
 4642b24: d0048d00     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4642b28: 913be000     	add	x0, x0, #0xef8
 4642b2c: 941791d9     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 4642b30: d0048d00     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4642b34: 913c6000     	add	x0, x0, #0xf18
 4642b38: 941791d6     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
