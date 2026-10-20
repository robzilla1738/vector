
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4254978: 9105c3e0     	add	x0, sp, #0x170
 425497c: 94001345     	bl	0x4259690 <_ChromeMain+0x42543f4>
 4254980: 37000580     	tbnz	w0, #0x0, 0x4254a30 <_ChromeMain+0x424f794>
 4254984: 900565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4254988: b940b108     	ldr	w8, [x8, #0xb0]
 425498c: 7100011f     	cmp	w8, #0x0
 4254990: 54fffe4c     	b.gt	0x4254958 <_ChromeMain+0x424f6bc>
 4254994: b0054ae8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4254998: b94b8908     	ldr	w8, [x8, #0xb88]
 425499c: 35000088     	cbnz	w8, 0x42549ac <_ChromeMain+0x424f710>
 42549a0: 900565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 42549a4: f9405d08     	ldr	x8, [x8, #0xb8]
 42549a8: b4fffd88     	cbz	x8, 0x4254958 <_ChromeMain+0x424f6bc>
 42549ac: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42549b0: 91080821     	add	x1, x1, #0x202
 42549b4: 910103f5     	add	x21, sp, #0x40
 42549b8: 910103e0     	add	x0, sp, #0x40
 42549bc: 5280fc02     	mov	w2, #0x7e0              ; =2016
 42549c0: 52800003     	mov	w3, #0x0                ; =0
 42549c4: 970ed1e2     	bl	0x60914c <_ChromeMain+0x603eb0>
 42549c8: d10283b6     	sub	x22, x29, #0xa0
 42549cc: d10283a8     	sub	x8, x29, #0xa0
 42549d0: aa1403e0     	mov	x0, x20
 42549d4: 94002d2f     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 42549d8: 389773a8     	ldursb	x8, [x29, #-0x89]
 42549dc: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 42549e0: f100011f     	cmp	x8, #0x0
 42549e4: 9a964120     	csel	x0, x9, x22, mi
 42549e8: 7100011f     	cmp	w8, #0x0
 42549ec: 9a884141     	csel	x1, x10, x8, mi
 42549f0: 910943f4     	add	x20, sp, #0x250
 42549f4: 910943e8     	add	x8, sp, #0x250
 42549f8: 973538c4     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 42549fc: 39899fe8     	ldrsb	x8, [sp, #0x267]
 4254a00: f9412be9     	ldr	x9, [sp, #0x250]
 4254a04: f9412fea     	ldr	x10, [sp, #0x258]
 4254a08: f100011f     	cmp	x8, #0x0
 4254a0c: 9a944121     	csel	x1, x9, x20, mi
 4254a10: 7100011f     	cmp	w8, #0x0
 4254a14: 9a884142     	csel	x2, x10, x8, mi
 4254a18: 910042a0     	add	x0, x21, #0x10
 4254a1c: 96f742a8     	bl	0x254bc <_ChromeMain+0x20220>
 4254a20: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254a24: 910ccc21     	add	x1, x1, #0x333
 4254a28: 52800722     	mov	w2, #0x39               ; =57
 4254a2c: 17ffffbc     	b	0x425491c <_ChromeMain+0x424f680>
 4254a30: 6f00e400     	movi.2d	v0, #0000000000000000
 4254a34: ad1483e0     	stp	q0, q0, [sp, #0x290]
 4254a38: ad1383e0     	stp	q0, q0, [sp, #0x270]
 4254a3c: ad1283e0     	stp	q0, q0, [sp, #0x250]
 4254a40: 394062c8     	ldrb	w8, [x22, #0x18]
 4254a44: 34001528     	cbz	w8, 0x4254ce8 <_ChromeMain+0x424fa4c>
 4254a48: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 4254a4c: 39405ed7     	ldrb	w23, [x22, #0x17]
 4254a50: a94066d8     	ldp	x24, x25, [x22]
 4254a54: b004c940     	adrp	x0, 0xdb7d000 <dyld_stub_binder+0xdb7d000>
 4254a58: 911bfc00     	add	x0, x0, #0x6ff
 4254a5c: b004c941     	adrp	x1, 0xdb7d000 <dyld_stub_binder+0xdb7d000>
 4254a60: 911c3821     	add	x1, x1, #0x70e
 4254a64: 910103e8     	add	x8, sp, #0x40
 4254a68: 52800262     	mov	w2, #0x13               ; =19
 4254a6c: 96f7f085     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4254a70: d0054b40     	adrp	x0, 0xebbe000 <dyld_stub_binder+0xebbe000>
 4254a74: 910be000     	add	x0, x0, #0x2f8
 4254a78: 103ff241     	adr	x1, 0x42d48c0 <_ChromeMain+0x42cf624>
 4254a7c: d503201f     	nop
 4254a80: 94f9f999     	bl	0x80d30e4 <_ChromeMain+0x80cde48>
 4254a84: 35005dc0     	cbnz	w0, 0x425563c <_ChromeMain+0x42503a0>
 4254a88: 13001ee8     	sxtb	w8, w23
 4254a8c: 7100011f     	cmp	w8, #0x0
 4254a90: 9a974321     	csel	x1, x25, x23, mi
 4254a94: 9a964300     	csel	x0, x24, x22, mi
 4254a98: 900465a2     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4254a9c: 91040842     	add	x2, x2, #0x102
 4254aa0: b00565c5     	adrp	x5, 0xef0d000 <dyld_stub_binder+0xef0d000>
 4254aa4: 913de0a5     	add	x5, x5, #0xf78
 4254aa8: d10283a7     	sub	x7, x29, #0xa0
 4254aac: 52800123     	mov	w3, #0x9                ; =9
 4254ab0: 52807d64     	mov	w4, #0x3eb              ; =1003
 4254ab4: 52800206     	mov	w6, #0x10               ; =16
 4254ab8: 97498b12     	bl	0x14b7700 <_ChromeMain+0x14b2464>
 4254abc: 34005c20     	cbz	w0, 0x4255640 <_ChromeMain+0x42503a4>
 4254ac0: 970269c9     	bl	0x2ef1e4 <_ChromeMain+0x2e9f48>
 4254ac4: 385603a8     	ldurb	w8, [x29, #-0xa0]
 4254ac8: f85613a9     	ldur	x9, [x29, #-0x9f]
 4254acc: f80c9349     	stur	x9, [x26, #0xc9]
 4254ad0: f85683a9     	ldur	x9, [x29, #-0x98]
 4254ad4: f9012fe9     	str	x9, [sp, #0x258]
 4254ad8: 52800029     	mov	w9, #0x1                ; =1
 4254adc: 390983e9     	strb	w9, [sp, #0x260]
 4254ae0: 3909a3ff     	strb	wzr, [sp, #0x268]
 4254ae4: 390a03ff     	strb	wzr, [sp, #0x280]
 4254ae8: 390a23ff     	strb	wzr, [sp, #0x288]
 4254aec: 390a83ff     	strb	wzr, [sp, #0x2a0]
 4254af0: 390943e8     	strb	w8, [sp, #0x250]
 4254af4: 390aa3e9     	strb	w9, [sp, #0x2a8]
 4254af8: 9105c3e0     	add	x0, sp, #0x170
 4254afc: 910943e1     	add	x1, sp, #0x250
 4254b00: aa1503e2     	mov	x2, x21
 4254b04: 9400161f     	bl	0x425a380 <_ChromeMain+0x42550e4>
 4254b08: 34000100     	cbz	w0, 0x4254b28 <_ChromeMain+0x424f88c>
 4254b0c: 394aa3e8     	ldrb	w8, [sp, #0x2a8]
 4254b10: 360039e8     	tbz	w8, #0x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254b14: 9105c3e0     	add	x0, sp, #0x170
 4254b18: 910943e1     	add	x1, sp, #0x250
 4254b1c: 910062a2     	add	x2, x21, #0x18
 4254b20: 94001982     	bl	0x425b128 <_ChromeMain+0x4255e8c>
 4254b24: 37003ea0     	tbnz	w0, #0x0, 0x42552f8 <_ChromeMain+0x425005c>
