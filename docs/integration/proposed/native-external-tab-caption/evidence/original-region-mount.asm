
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464ccfc: d101c3ff     	sub	sp, sp, #0x70
 464cd00: a9035ff8     	stp	x24, x23, [sp, #0x30]
 464cd04: a90457f6     	stp	x22, x21, [sp, #0x40]
 464cd08: a9054ff4     	stp	x20, x19, [sp, #0x50]
 464cd0c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 464cd10: 910183fd     	add	x29, sp, #0x60
 464cd14: f9423c14     	ldr	x20, [x0, #0x478]
 464cd18: b4002574     	cbz	x20, 0x464d1c4 <_ChromeMain+0x4647f28>
 464cd1c: aa0003f3     	mov	x19, x0
 464cd20: f9434000     	ldr	x0, [x0, #0x680]
 464cd24: b40024a0     	cbz	x0, 0x464d1b8 <_ChromeMain+0x4647f1c>
 464cd28: f940cc02     	ldr	x2, [x0, #0x198]
 464cd2c: aa1403e1     	mov	x1, x20
 464cd30: 9704b1b3     	bl	0x7793fc <_ChromeMain+0x774160>
 464cd34: aa1403e0     	mov	x0, x20
 464cd38: 52800021     	mov	w1, #0x1                ; =1
 464cd3c: 97eb723b     	bl	0x4129628 <_ChromeMain+0x412438c>
 464cd40: f942da62     	ldr	x2, [x19, #0x5b0]
 464cd44: aa1403e0     	mov	x0, x20
 464cd48: aa1303e1     	mov	x1, x19
 464cd4c: 97eb7295     	bl	0x41297a0 <_ChromeMain+0x4124504>
 464cd50: f941b295     	ldr	x21, [x20, #0x360]
 464cd54: b0fef897     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 464cd58: 912c02f7     	add	x23, x23, #0xb00
 464cd5c: d0052b38     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 464cd60: b40003d5     	cbz	x21, 0x464cdd8 <_ChromeMain+0x4647b3c>
 464cd64: f942ea61     	ldr	x1, [x19, #0x5d0]
 464cd68: f940cea2     	ldr	x2, [x21, #0x198]
 464cd6c: aa1503e0     	mov	x0, x21
 464cd70: 9704b1a3     	bl	0x7793fc <_ChromeMain+0x774160>
 464cd74: f942ea61     	ldr	x1, [x19, #0x5d0]
 464cd78: aa1503e0     	mov	x0, x21
 464cd7c: 97eb9da1     	bl	0x4134400 <_ChromeMain+0x412f164>
 464cd80: f942ea60     	ldr	x0, [x19, #0x5d0]
 464cd84: 97ff690b     	bl	0x46271b0 <_ChromeMain+0x4621f14>
 464cd88: 925e7668     	and	x8, x19, #0xfffffffc00000000
 464cd8c: f9404709     	ldr	x9, [x24, #0x88]
 464cd90: eb09011f     	cmp	x8, x9
 464cd94: 54000061     	b.ne	0x464cda0 <_ChromeMain+0x4647b04>
 464cd98: aa1303e0     	mov	x0, x19
 464cd9c: 96e71d58     	bl	0x142fc <_ChromeMain+0xf060>
 464cda0: 52800600     	mov	w0, #0x30               ; =48
 464cda4: 96e70971     	bl	0xf368 <_ChromeMain+0xa0cc>
 464cda8: 52800028     	mov	w8, #0x1                ; =1
 464cdac: b9000008     	str	w8, [x0]
 464cdb0: 10162d48     	adr	x8, 0x4679358 <_ChromeMain+0x46740bc>
 464cdb4: d503201f     	nop
 464cdb8: f0ff98a9     	adrp	x9, 0x3963000 <_ChromeMain+0x395dd64>
 464cdbc: 91120129     	add	x9, x9, #0x480
 464cdc0: a900a408     	stp	x8, x9, [x0, #0x8]
 464cdc4: f9000c17     	str	x23, [x0, #0x18]
 464cdc8: f9001413     	str	x19, [x0, #0x28]
 464cdcc: f942c2b6     	ldr	x22, [x21, #0x580]
 464cdd0: f902c2a0     	str	x0, [x21, #0x580]
 464cdd4: b5001b56     	cbnz	x22, 0x464d13c <_ChromeMain+0x4647ea0>
 464cdd8: 52800800     	mov	w0, #0x40               ; =64
 464cddc: 96e70963     	bl	0xf368 <_ChromeMain+0xa0cc>
 464cde0: 52800028     	mov	w8, #0x1                ; =1
 464cde4: b9000008     	str	w8, [x0]
 464cde8: f0fe4ec8     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 464cdec: 91260108     	add	x8, x8, #0x980
 464cdf0: d0fde529     	adrp	x9, 0x2f2000 <_ChromeMain+0x2ecd64>
 464cdf4: 91220129     	add	x9, x9, #0x880
 464cdf8: a900a408     	stp	x8, x9, [x0, #0x8]
 464cdfc: d0ffa6c8     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 464ce00: 91310108     	add	x8, x8, #0xc40
 464ce04: a901a017     	stp	x23, x8, [x0, #0x18]
 464ce08: 9004c7a8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 464ce0c: 3dc1d900     	ldr	q0, [x8, #0x760]
 464ce10: 3c828000     	stur	q0, [x0, #0x28]
 464ce14: 3900e01f     	strb	wzr, [x0, #0x38]
 464ce18: f90003e0     	str	x0, [sp]
 464ce1c: 0f000420     	movi.2s	v0, #0x1
 464ce20: fd0007e0     	str	d0, [sp, #0x8]
 464ce24: 52800068     	mov	w8, #0x3                ; =3
 464ce28: b90013e8     	str	w8, [sp, #0x10]
 464ce2c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 464ce30: f9000fff     	str	xzr, [sp, #0x18]
 464ce34: b0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464ce38: 91152021     	add	x1, x1, #0x548
 464ce3c: 91036280     	add	x0, x20, #0xd8
 464ce40: 910003e2     	mov	x2, sp
 464ce44: 97571d52     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 464ce48: 910003e0     	mov	x0, sp
 464ce4c: 9743f7b6     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 464ce50: d004c768     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 464ce54: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 464ce58: 3d8003e0     	str	q0, [sp]
 464ce5c: b0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464ce60: 91122021     	add	x1, x1, #0x488
 464ce64: 91036280     	add	x0, x20, #0xd8
 464ce68: 910003e2     	mov	x2, sp
 464ce6c: 975283fd     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464ce70: f9422e68     	ldr	x8, [x19, #0x458]
 464ce74: f9429d08     	ldr	x8, [x8, #0x538]
 464ce78: 9100a109     	add	x9, x8, #0x28
 464ce7c: f100011f     	cmp	x8, #0x0
 464ce80: 9a8903e9     	csel	x9, xzr, x9, eq
 464ce84: f940b128     	ldr	x8, [x9, #0x160]
 464ce88: b40002e8     	cbz	x8, 0x464cee4 <_ChromeMain+0x4647c48>
 464ce8c: 91058129     	add	x9, x9, #0x160
 464ce90: f005116a     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464ce94: 9108614a     	add	x10, x10, #0x218
 464ce98: 1400000d     	b	0x464cecc <_ChromeMain+0x4647c30>
 464ce9c: eb09011f     	cmp	x8, x9
 464cea0: 54000220     	b.eq	0x464cee4 <_ChromeMain+0x4647c48>
 464cea4: f9401514     	ldr	x20, [x8, #0x28]
 464cea8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 464ceac: f9404709     	ldr	x9, [x24, #0x88]
 464ceb0: eb09011f     	cmp	x8, x9
 464ceb4: 540001a1     	b.ne	0x464cee8 <_ChromeMain+0x4647c4c>
 464ceb8: aa1403e0     	mov	x0, x20
 464cebc: 96e71d10     	bl	0x142fc <_ChromeMain+0xf060>
 464cec0: 1400000a     	b	0x464cee8 <_ChromeMain+0x4647c4c>
 464cec4: f9400108     	ldr	x8, [x8]
 464cec8: b40000e8     	cbz	x8, 0x464cee4 <_ChromeMain+0x4647c48>
 464cecc: f940110b     	ldr	x11, [x8, #0x20]
 464ced0: eb0a017f     	cmp	x11, x10
 464ced4: 54ffff88     	b.hi	0x464cec4 <_ChromeMain+0x4647c28>
 464ced8: 54fffe20     	b.eq	0x464ce9c <_ChromeMain+0x4647c00>
 464cedc: f9400508     	ldr	x8, [x8, #0x8]
 464cee0: b5ffff68     	cbnz	x8, 0x464cecc <_ChromeMain+0x4647c30>
 464cee4: d2800014     	mov	x20, #0x0               ; =0
 464cee8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 464ceec: f9404709     	ldr	x9, [x24, #0x88]
 464cef0: eb09011f     	cmp	x8, x9
 464cef4: 54000061     	b.ne	0x464cf00 <_ChromeMain+0x4647c64>
 464cef8: aa1403e0     	mov	x0, x20
 464cefc: 96e756d0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 464cf00: 39631268     	ldrb	w8, [x19, #0x8c4]
 464cf04: f0051169     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464cf08: 910a6129     	add	x9, x9, #0x298
 464cf0c: f005116a     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464cf10: 910a814a     	add	x10, x10, #0x2a0
 464cf14: 7100011f     	cmp	w8, #0x0
 464cf18: 9a891142     	csel	x2, x10, x9, ne
 464cf1c: f0051161     	adrp	x1, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464cf20: 910a4021     	add	x1, x1, #0x290
 464cf24: aa1403e0     	mov	x0, x20
 464cf28: 94c2ce7b     	bl	0x7700914 <_ChromeMain+0x76fb678>
 464cf2c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 464cf30: f9404709     	ldr	x9, [x24, #0x88]
 464cf34: eb09011f     	cmp	x8, x9
 464cf38: 54000061     	b.ne	0x464cf44 <_ChromeMain+0x4647ca8>
 464cf3c: aa1303e0     	mov	x0, x19
 464cf40: 96e71cef     	bl	0x142fc <_ChromeMain+0xf060>
 464cf44: 52800700     	mov	w0, #0x38               ; =56
 464cf48: 96e70908     	bl	0xf368 <_ChromeMain+0xa0cc>
 464cf4c: aa0003f5     	mov	x21, x0
 464cf50: 52800028     	mov	w8, #0x1                ; =1
 464cf54: b9000008     	str	w8, [x0]
 464cf58: b0ffcb68     	adrp	x8, 0x3fb9000 <_ChromeMain+0x3fb3d64>
 464cf5c: 910c0108     	add	x8, x8, #0x300
 464cf60: b0ff9269     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 464cf64: 912d0129     	add	x9, x9, #0xb40
 464cf68: a900a408     	stp	x8, x9, [x0, #0x8]
 464cf6c: 10ff7ca8     	adr	x8, 0x464bf00 <_ChromeMain+0x4646c64>
 464cf70: d503201f     	nop
 464cf74: a901a017     	stp	x23, x8, [x0, #0x18]
 464cf78: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 464cf7c: f0051161     	adrp	x1, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464cf80: 910a4021     	add	x1, x1, #0x290
 464cf84: aa1403e0     	mov	x0, x20
 464cf88: 972e5df4     	bl	0x11e4758 <_ChromeMain+0x11df4bc>
 464cf8c: 910003e8     	mov	x8, sp
 464cf90: 91074000     	add	x0, x0, #0x1d0
 464cf94: aa1503e1     	mov	x1, x21
 464cf98: 97a67ef6     	bl	0x2fecb70 <_ChromeMain+0x2fe78d4>
 464cf9c: 9121c268     	add	x8, x19, #0x870
 464cfa0: 3961e269     	ldrb	w9, [x19, #0x878]
 464cfa4: 36000349     	tbz	w9, #0x0, 0x464d00c <_ChromeMain+0x4647d70>
 464cfa8: 9121c260     	add	x0, x19, #0x870
 464cfac: 910003e1     	mov	x1, sp
 464cfb0: 9707e6c8     	bl	0x846ad0 <_ChromeMain+0x841834>
 464cfb4: f94003f4     	ldr	x20, [sp]
 464cfb8: b4000354     	cbz	x20, 0x464d020 <_ChromeMain+0x4647d84>
 464cfbc: f90003ff     	str	xzr, [sp]
 464cfc0: f9400688     	ldr	x8, [x20, #0x8]
 464cfc4: aa1403e0     	mov	x0, x20
 464cfc8: d63f0100     	blr	x8
 464cfcc: 12800008     	mov	w8, #-0x1               ; =-1
 464cfd0: b8e80288     	ldaddal	w8, w8, [x20]
 464cfd4: 7100051f     	cmp	w8, #0x1
 464cfd8: 54000081     	b.ne	0x464cfe8 <_ChromeMain+0x4647d4c>
 464cfdc: f9400a88     	ldr	x8, [x20, #0x10]
 464cfe0: aa1403e0     	mov	x0, x20
 464cfe4: d63f0100     	blr	x8
 464cfe8: f94003e0     	ldr	x0, [sp]
 464cfec: b40001a0     	cbz	x0, 0x464d020 <_ChromeMain+0x4647d84>
 464cff0: 12800008     	mov	w8, #-0x1               ; =-1
 464cff4: b8e80008     	ldaddal	w8, w8, [x0]
 464cff8: 7100051f     	cmp	w8, #0x1
 464cffc: 54000121     	b.ne	0x464d020 <_ChromeMain+0x4647d84>
 464d000: f9400808     	ldr	x8, [x0, #0x10]
 464d004: d63f0100     	blr	x8
 464d008: 14000006     	b	0x464d020 <_ChromeMain+0x4647d84>
 464d00c: b4000da8     	cbz	x8, 0x464d1c0 <_ChromeMain+0x4647f24>
 464d010: f94003e8     	ldr	x8, [sp]
 464d014: f9043a68     	str	x8, [x19, #0x870]
 464d018: 52800028     	mov	w8, #0x1                ; =1
 464d01c: 3921e268     	strb	w8, [x19, #0x878]
 464d020: f9442674     	ldr	x20, [x19, #0x848]
 464d024: 925e7668     	and	x8, x19, #0xfffffffc00000000
 464d028: f9404709     	ldr	x9, [x24, #0x88]
 464d02c: eb09011f     	cmp	x8, x9
 464d030: 54000061     	b.ne	0x464d03c <_ChromeMain+0x4647da0>
 464d034: aa1303e0     	mov	x0, x19
 464d038: 96e71cb1     	bl	0x142fc <_ChromeMain+0xf060>
 464d03c: 52800700     	mov	w0, #0x38               ; =56
 464d040: 96e708ca     	bl	0xf368 <_ChromeMain+0xa0cc>
 464d044: aa0003e1     	mov	x1, x0
 464d048: 52800028     	mov	w8, #0x1                ; =1
 464d04c: b9000008     	str	w8, [x0]
 464d050: d0ffcb28     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 464d054: 91300108     	add	x8, x8, #0xc00
 464d058: 90ff9269     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 464d05c: 912d0129     	add	x9, x9, #0xb40
 464d060: a900a408     	stp	x8, x9, [x0, #0x8]
 464d064: b00409c8     	adrp	x8, 0xc786000 <_ChromeMain+0xc780d64>
 464d068: 911e8108     	add	x8, x8, #0x7a0
 464d06c: a901a017     	stp	x23, x8, [x0, #0x18]
 464d070: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 464d074: 910003e8     	mov	x8, sp
 464d078: 91042280     	add	x0, x20, #0x108
 464d07c: 9755c089     	bl	0x1bbd2a0 <_ChromeMain+0x1bb8004>
 464d080: 91216268     	add	x8, x19, #0x858
 464d084: 39618269     	ldrb	w9, [x19, #0x860]
 464d088: 36000349     	tbz	w9, #0x0, 0x464d0f0 <_ChromeMain+0x4647e54>
 464d08c: 91216260     	add	x0, x19, #0x858
 464d090: 910003e1     	mov	x1, sp
 464d094: 9707e68f     	bl	0x846ad0 <_ChromeMain+0x841834>
 464d098: f94003f4     	ldr	x20, [sp]
 464d09c: b4000354     	cbz	x20, 0x464d104 <_ChromeMain+0x4647e68>
 464d0a0: f90003ff     	str	xzr, [sp]
 464d0a4: f9400688     	ldr	x8, [x20, #0x8]
 464d0a8: aa1403e0     	mov	x0, x20
 464d0ac: d63f0100     	blr	x8
 464d0b0: 12800008     	mov	w8, #-0x1               ; =-1
 464d0b4: b8e80288     	ldaddal	w8, w8, [x20]
 464d0b8: 7100051f     	cmp	w8, #0x1
 464d0bc: 54000081     	b.ne	0x464d0cc <_ChromeMain+0x4647e30>
 464d0c0: f9400a88     	ldr	x8, [x20, #0x10]
 464d0c4: aa1403e0     	mov	x0, x20
 464d0c8: d63f0100     	blr	x8
 464d0cc: f94003e0     	ldr	x0, [sp]
 464d0d0: b40001a0     	cbz	x0, 0x464d104 <_ChromeMain+0x4647e68>
 464d0d4: 12800008     	mov	w8, #-0x1               ; =-1
 464d0d8: b8e80008     	ldaddal	w8, w8, [x0]
 464d0dc: 7100051f     	cmp	w8, #0x1
 464d0e0: 54000121     	b.ne	0x464d104 <_ChromeMain+0x4647e68>
 464d0e4: f9400808     	ldr	x8, [x0, #0x10]
 464d0e8: d63f0100     	blr	x8
 464d0ec: 14000006     	b	0x464d104 <_ChromeMain+0x4647e68>
 464d0f0: b4000688     	cbz	x8, 0x464d1c0 <_ChromeMain+0x4647f24>
 464d0f4: f94003e8     	ldr	x8, [sp]
 464d0f8: f9042e68     	str	x8, [x19, #0x858]
 464d0fc: 52800028     	mov	w8, #0x1                ; =1
 464d100: 39218268     	strb	w8, [x19, #0x860]
 464d104: f9442661     	ldr	x1, [x19, #0x848]
 464d108: aa1303e0     	mov	x0, x19
 464d10c: 97ff988d     	bl	0x4633340 <_ChromeMain+0x462e0a4>
 464d110: aa1303e0     	mov	x0, x19
 464d114: 97ffe0bb     	bl	0x4645400 <_ChromeMain+0x4640164>
 464d118: f9442661     	ldr	x1, [x19, #0x848]
 464d11c: aa1303e0     	mov	x0, x19
 464d120: 97ff9888     	bl	0x4633340 <_ChromeMain+0x462e0a4>
 464d124: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 464d128: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 464d12c: a94457f6     	ldp	x22, x21, [sp, #0x40]
 464d130: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 464d134: 9101c3ff     	add	sp, sp, #0x70
 464d138: d65f03c0     	ret
 464d13c: 12800008     	mov	w8, #-0x1               ; =-1
 464d140: b8e802c8     	ldaddal	w8, w8, [x22]
 464d144: 7100051f     	cmp	w8, #0x1
 464d148: 54ffe481     	b.ne	0x464cdd8 <_ChromeMain+0x4647b3c>
 464d14c: f9400ac8     	ldr	x8, [x22, #0x10]
 464d150: 90fe4ac9     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 464d154: 91190129     	add	x9, x9, #0x640
 464d158: eb09011f     	cmp	x8, x9
 464d15c: 54000140     	b.eq	0x464d184 <_ChromeMain+0x4647ee8>
 464d160: f0ff98e9     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 464d164: 91180129     	add	x9, x9, #0x600
 464d168: aa1603e0     	mov	x0, x22
 464d16c: eb09011f     	cmp	x8, x9
 464d170: 54000060     	b.eq	0x464d17c <_ChromeMain+0x4647ee0>
 464d174: d63f0100     	blr	x8
 464d178: 17ffff18     	b	0x464cdd8 <_ChromeMain+0x4647b3c>
 464d17c: 52800701     	mov	w1, #0x38               ; =56
 464d180: 14000005     	b	0x464d194 <_ChromeMain+0x4647ef8>
 464d184: f9401ac0     	ldr	x0, [x22, #0x30]
 464d188: b50000a0     	cbnz	x0, 0x464d19c <_ChromeMain+0x4647f00>
 464d18c: aa1603e0     	mov	x0, x22
 464d190: 52800901     	mov	w1, #0x48               ; =72
 464d194: 96e6ef49     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d198: 17ffff10     	b	0x464cdd8 <_ChromeMain+0x4647b3c>
 464d19c: 12800008     	mov	w8, #-0x1               ; =-1
 464d1a0: b8e80008     	ldaddal	w8, w8, [x0]
 464d1a4: 7100051f     	cmp	w8, #0x1
 464d1a8: 54ffff21     	b.ne	0x464d18c <_ChromeMain+0x4647ef0>
 464d1ac: 52800101     	mov	w1, #0x8                ; =8
 464d1b0: 96e6ef42     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d1b4: 17fffff6     	b	0x464d18c <_ChromeMain+0x4647ef0>
 464d1b8: d4200000     	brk	#0
 464d1bc: d4400000     	hlt	#0
 464d1c0: d4200020     	brk	#0x1
 464d1c4: d4200000     	brk	#0
 464d1c8: d4400000     	hlt	#0
 464d1cc: d4200020     	brk	#0x1
		...
 464d1e0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 464d1e4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 464d1e8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 464d1ec: 910083fd     	add	x29, sp, #0x20
 464d1f0: aa0003f3     	mov	x19, x0
 464d1f4: f9444414     	ldr	x20, [x0, #0x888]
 464d1f8: b50004f4     	cbnz	x20, 0x464d294 <_ChromeMain+0x4647ff8>
 464d1fc: f9464a60     	ldr	x0, [x19, #0xc90]
 464d200: f9064a7f     	str	xzr, [x19, #0xc90]
 464d204: b5000600     	cbnz	x0, 0x464d2c4 <_ChromeMain+0x4648028>
 464d208: 3961e268     	ldrb	w8, [x19, #0x878]
 464d20c: 34000088     	cbz	w8, 0x464d21c <_ChromeMain+0x4647f80>
 464d210: f9443a74     	ldr	x20, [x19, #0x870]
 464d214: b5000894     	cbnz	x20, 0x464d324 <_ChromeMain+0x4648088>
 464d218: 3921e27f     	strb	wzr, [x19, #0x878]
 464d21c: 39618268     	ldrb	w8, [x19, #0x860]
 464d220: 34000088     	cbz	w8, 0x464d230 <_ChromeMain+0x4647f94>
 464d224: f9442e74     	ldr	x20, [x19, #0x858]
 464d228: b5000574     	cbnz	x20, 0x464d2d4 <_ChromeMain+0x4648038>
 464d22c: 3921827f     	strb	wzr, [x19, #0x860]
 464d230: aa1303e0     	mov	x0, x19
 464d234: 979d1c9f     	bl	0x2d944b0 <_ChromeMain+0x2d8f214>
 464d238: 3928227f     	strb	wzr, [x19, #0xa08]
 464d23c: f9423e74     	ldr	x20, [x19, #0x478]
 464d240: b4000234     	cbz	x20, 0x464d284 <_ChromeMain+0x4647fe8>
 464d244: f941b288     	ldr	x8, [x20, #0x360]
 464d248: b4000088     	cbz	x8, 0x464d258 <_ChromeMain+0x4647fbc>
 464d24c: f942c115     	ldr	x21, [x8, #0x580]
 464d250: f902c11f     	str	xzr, [x8, #0x580]
 464d254: b5000915     	cbnz	x21, 0x464d374 <_ChromeMain+0x46480d8>
 464d258: aa1403e0     	mov	x0, x20
 464d25c: d2800001     	mov	x1, #0x0                ; =0
 464d260: d2800002     	mov	x2, #0x0                ; =0
 464d264: 97eb714f     	bl	0x41297a0 <_ChromeMain+0x4124504>
 464d268: f940ce62     	ldr	x2, [x19, #0x198]
 464d26c: aa1303e0     	mov	x0, x19
 464d270: aa1403e1     	mov	x1, x20
 464d274: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 464d278: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 464d27c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 464d280: 1704b05f     	b	0x7793fc <_ChromeMain+0x774160>
 464d284: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 464d288: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 464d28c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 464d290: d65f03c0     	ret
 464d294: f904467f     	str	xzr, [x19, #0x888]
 464d298: f9444261     	ldr	x1, [x19, #0x880]
 464d29c: 91028280     	add	x0, x20, #0xa0
 464d2a0: 978d6834     	bl	0x29a7370 <_ChromeMain+0x29a20d4>
 464d2a4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 464d2a8: b0052b29     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 464d2ac: f9404529     	ldr	x9, [x9, #0x88]
 464d2b0: eb09011f     	cmp	x8, x9
 464d2b4: 54fffa41     	b.ne	0x464d1fc <_ChromeMain+0x4647f60>
 464d2b8: aa1403e0     	mov	x0, x20
 464d2bc: 96e755e0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 464d2c0: 17ffffcf     	b	0x464d1fc <_ChromeMain+0x4647f60>
 464d2c4: 94e5a465     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 464d2c8: 52800301     	mov	w1, #0x18               ; =24
 464d2cc: 96e6eefb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d2d0: 17ffffce     	b	0x464d208 <_ChromeMain+0x4647f6c>
 464d2d4: f9042e7f     	str	xzr, [x19, #0x858]
 464d2d8: f9400688     	ldr	x8, [x20, #0x8]
 464d2dc: aa1403e0     	mov	x0, x20
 464d2e0: d63f0100     	blr	x8
 464d2e4: 12800008     	mov	w8, #-0x1               ; =-1
 464d2e8: b8e80288     	ldaddal	w8, w8, [x20]
 464d2ec: 7100051f     	cmp	w8, #0x1
 464d2f0: 54000081     	b.ne	0x464d300 <_ChromeMain+0x4648064>
 464d2f4: f9400a88     	ldr	x8, [x20, #0x10]
 464d2f8: aa1403e0     	mov	x0, x20
 464d2fc: d63f0100     	blr	x8
 464d300: f9442e60     	ldr	x0, [x19, #0x858]
 464d304: b4fff940     	cbz	x0, 0x464d22c <_ChromeMain+0x4647f90>
 464d308: 12800008     	mov	w8, #-0x1               ; =-1
 464d30c: b8e80008     	ldaddal	w8, w8, [x0]
 464d310: 7100051f     	cmp	w8, #0x1
 464d314: 54fff8c1     	b.ne	0x464d22c <_ChromeMain+0x4647f90>
 464d318: f9400808     	ldr	x8, [x0, #0x10]
 464d31c: d63f0100     	blr	x8
 464d320: 17ffffc3     	b	0x464d22c <_ChromeMain+0x4647f90>
 464d324: f9043a7f     	str	xzr, [x19, #0x870]
 464d328: f9400688     	ldr	x8, [x20, #0x8]
 464d32c: aa1403e0     	mov	x0, x20
 464d330: d63f0100     	blr	x8
 464d334: 12800008     	mov	w8, #-0x1               ; =-1
 464d338: b8e80288     	ldaddal	w8, w8, [x20]
 464d33c: 7100051f     	cmp	w8, #0x1
 464d340: 54000081     	b.ne	0x464d350 <_ChromeMain+0x46480b4>
 464d344: f9400a88     	ldr	x8, [x20, #0x10]
 464d348: aa1403e0     	mov	x0, x20
 464d34c: d63f0100     	blr	x8
 464d350: f9443a60     	ldr	x0, [x19, #0x870]
 464d354: b4fff620     	cbz	x0, 0x464d218 <_ChromeMain+0x4647f7c>
 464d358: 12800008     	mov	w8, #-0x1               ; =-1
 464d35c: b8e80008     	ldaddal	w8, w8, [x0]
 464d360: 7100051f     	cmp	w8, #0x1
 464d364: 54fff5a1     	b.ne	0x464d218 <_ChromeMain+0x4647f7c>
 464d368: f9400808     	ldr	x8, [x0, #0x10]
 464d36c: d63f0100     	blr	x8
 464d370: 17ffffaa     	b	0x464d218 <_ChromeMain+0x4647f7c>
 464d374: 12800008     	mov	w8, #-0x1               ; =-1
 464d378: b8e802a8     	ldaddal	w8, w8, [x21]
 464d37c: 7100051f     	cmp	w8, #0x1
 464d380: 54fff6c1     	b.ne	0x464d258 <_ChromeMain+0x4647fbc>
 464d384: f9400aa8     	ldr	x8, [x21, #0x10]
 464d388: 90fe4ac9     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 464d38c: 91190129     	add	x9, x9, #0x640
 464d390: eb09011f     	cmp	x8, x9
 464d394: 54000140     	b.eq	0x464d3bc <_ChromeMain+0x4648120>
 464d398: f0ff98e9     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 464d39c: 91180129     	add	x9, x9, #0x600
 464d3a0: aa1503e0     	mov	x0, x21
 464d3a4: eb09011f     	cmp	x8, x9
 464d3a8: 54000060     	b.eq	0x464d3b4 <_ChromeMain+0x4648118>
 464d3ac: d63f0100     	blr	x8
 464d3b0: 17ffffaa     	b	0x464d258 <_ChromeMain+0x4647fbc>
 464d3b4: 52800701     	mov	w1, #0x38               ; =56
 464d3b8: 14000005     	b	0x464d3cc <_ChromeMain+0x4648130>
 464d3bc: f9401aa0     	ldr	x0, [x21, #0x30]
 464d3c0: b50000a0     	cbnz	x0, 0x464d3d4 <_ChromeMain+0x4648138>
 464d3c4: aa1503e0     	mov	x0, x21
 464d3c8: 52800901     	mov	w1, #0x48               ; =72
 464d3cc: 96e6eebb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d3d0: 17ffffa2     	b	0x464d258 <_ChromeMain+0x4647fbc>
 464d3d4: 12800008     	mov	w8, #-0x1               ; =-1
 464d3d8: b8e80008     	ldaddal	w8, w8, [x0]
 464d3dc: 7100051f     	cmp	w8, #0x1
 464d3e0: 54ffff21     	b.ne	0x464d3c4 <_ChromeMain+0x4648128>
 464d3e4: 52800101     	mov	w1, #0x8                ; =8
 464d3e8: 96e6eeb4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d3ec: 17fffff6     	b	0x464d3c4 <_ChromeMain+0x4648128>
