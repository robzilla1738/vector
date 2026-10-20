
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41f8d4c: aa0003fc     	mov	x28, x0
 41f8d50: 52800400     	mov	w0, #0x20               ; =32
 41f8d54: 96f85985     	bl	0xf368 <_ChromeMain+0xa0cc>
 41f8d58: d0050a88     	adrp	x8, 0xe34a000 <dyld_stub_binder+0xe34a000>
 41f8d5c: 91166108     	add	x8, x8, #0x598
 41f8d60: f9000c1f     	str	xzr, [x0, #0x18]
 41f8d64: aa0003e9     	mov	x9, x0
 41f8d68: f8010d3f     	str	xzr, [x9, #0x10]!
 41f8d6c: a9002408     	stp	x8, x9, [x0]
 41f8d70: f9436274     	ldr	x20, [x19, #0x6c0]
 41f8d74: f9036260     	str	x0, [x19, #0x6c0]
 41f8d78: b4000154     	cbz	x20, 0x41f8da0 <_ChromeMain+0x41f3b04>
 41f8d7c: f9000288     	str	x8, [x20]
 41f8d80: 91002288     	add	x8, x20, #0x8
 41f8d84: f9400a81     	ldr	x1, [x20, #0x10]
 41f8d88: f81703a8     	stur	x8, [x29, #-0x90]
 41f8d8c: d10243a0     	sub	x0, x29, #0x90
 41f8d90: 96f967e4     	bl	0x52d20 <_ChromeMain+0x4da84>
 41f8d94: aa1403e0     	mov	x0, x20
 41f8d98: 52800401     	mov	w1, #0x20               ; =32
 41f8d9c: 96f84047     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f8da0: f9000ffb     	str	x27, [sp, #0x18]
 41f8da4: d0056888     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 41f8da8: 91120108     	add	x8, x8, #0x480
 41f8dac: f8bfc100     	ldapr	x0, [x8]
 41f8db0: b40067a0     	cbz	x0, 0x41f9aa4 <_ChromeMain+0x41f4808>
 41f8db4: 5280fb01     	mov	w1, #0x7d8              ; =2008
 41f8db8: d2800002     	mov	x2, #0x0                ; =0
 41f8dbc: 96fac9fd     	bl	0xab5b0 <_ChromeMain+0xa6314>
 41f8dc0: aa0003fa     	mov	x26, x0
 41f8dc4: f943427b     	ldr	x27, [x19, #0x680]
 41f8dc8: f9004bff     	str	xzr, [sp, #0x90]
 41f8dcc: 52800048     	mov	w8, #0x2                ; =2
 41f8dd0: 390263e8     	strb	w8, [sp, #0x98]
 41f8dd4: d10243a0     	sub	x0, x29, #0x90
 41f8dd8: 910243e1     	add	x1, sp, #0x90
 41f8ddc: 97a9bb69     	bl	0x2c67b80 <_ChromeMain+0x2c628e4>
 41f8de0: d10243a1     	sub	x1, x29, #0x90
 41f8de4: aa1a03e0     	mov	x0, x26
 41f8de8: d2800002     	mov	x2, #0x0                ; =0
 41f8dec: d2800003     	mov	x3, #0x0                ; =0
 41f8df0: 52800024     	mov	w4, #0x1                ; =1
 41f8df4: 9763d2a9     	bl	0x1aed898 <_ChromeMain+0x1ae85fc>
 41f8df8: 385783a8     	ldurb	w8, [x29, #-0x88]
 41f8dfc: 7103fd1f     	cmp	w8, #0xff
 41f8e00: 54000060     	b.eq	0x41f8e0c <_ChromeMain+0x41f3b70>
 41f8e04: f85703a0     	ldur	x0, [x29, #-0x90]
 41f8e08: b5fff740     	cbnz	x0, 0x41f8cf0 <_ChromeMain+0x41f3a54>
 41f8e0c: 394263e8     	ldrb	w8, [sp, #0x98]
 41f8e10: 7103fd1f     	cmp	w8, #0xff
 41f8e14: 54000060     	b.eq	0x41f8e20 <_ChromeMain+0x41f3b84>
 41f8e18: f9404be0     	ldr	x0, [sp, #0x90]
 41f8e1c: b5fff780     	cbnz	x0, 0x41f8d0c <_ChromeMain+0x41f3a70>
 41f8e20: 52801fe8     	mov	w8, #0xff               ; =255
 41f8e24: 390263e8     	strb	w8, [sp, #0x98]
 41f8e28: d0052068     	adrp	x8, 0xe606000 <dyld_stub_binder+0xe606000>
 41f8e2c: 9130c108     	add	x8, x8, #0xc30
 41f8e30: 91154109     	add	x9, x8, #0x550
 41f8e34: a9002748     	stp	x8, x9, [x26]
 41f8e38: 9115e109     	add	x9, x8, #0x578
 41f8e3c: f9000b49     	str	x9, [x26, #0x10]
 41f8e40: 9116c109     	add	x9, x8, #0x5b0
 41f8e44: 9117810a     	add	x10, x8, #0x5e0
 41f8e48: a906ab49     	stp	x9, x10, [x26, #0x68]
 41f8e4c: 9118c109     	add	x9, x8, #0x630
 41f8e50: f9005b49     	str	x9, [x26, #0xb0]
 41f8e54: 911a4109     	add	x9, x8, #0x690
 41f8e58: aa1a03f5     	mov	x21, x26
 41f8e5c: f80d8ea9     	str	x9, [x21, #0xd8]!
 41f8e60: 911b0109     	add	x9, x8, #0x6c0
 41f8e64: aa1a03f4     	mov	x20, x26
 41f8e68: f80f8e89     	str	x9, [x20, #0xf8]!
 41f8e6c: 911ba109     	add	x9, x8, #0x6e8
 41f8e70: f9018b49     	str	x9, [x26, #0x310]
 41f8e74: 911da109     	add	x9, x8, #0x768
 41f8e78: f9018f49     	str	x9, [x26, #0x318]
 41f8e7c: 9120a109     	add	x9, x8, #0x828
 41f8e80: f9019349     	str	x9, [x26, #0x320]
 41f8e84: 91218109     	add	x9, x8, #0x860
 41f8e88: f9025b49     	str	x9, [x26, #0x4b0]
 41f8e8c: 9122c109     	add	x9, x8, #0x8b0
 41f8e90: f9025f49     	str	x9, [x26, #0x4b8]
 41f8e94: 91238108     	add	x8, x8, #0x8e0
 41f8e98: f9031748     	str	x8, [x26, #0x628]
 41f8e9c: 925e7768     	and	x8, x27, #0xfffffffc00000000
 41f8ea0: f9404709     	ldr	x9, [x24, #0x88]
 41f8ea4: eb09011f     	cmp	x8, x9
 41f8ea8: 54000061     	b.ne	0x41f8eb4 <_ChromeMain+0x41f3c18>
 41f8eac: aa1b03e0     	mov	x0, x27
 41f8eb0: 96f86d13     	bl	0x142fc <_ChromeMain+0xf060>
 41f8eb4: f903eb5b     	str	x27, [x26, #0x7d0]
 41f8eb8: b945f748     	ldr	w8, [x26, #0x5f4]
 41f8ebc: 7100051f     	cmp	w8, #0x1
 41f8ec0: 54fff341     	b.ne	0x41f8d28 <_ChromeMain+0x41f3a8c>
 41f8ec4: b21b03e8     	mov	x8, #0x2000000020       ; =137438953504
 41f8ec8: f9004be8     	str	x8, [sp, #0x90]
 41f8ecc: aa1a03e0     	mov	x0, x26
 41f8ed0: d2800281     	mov	x1, #0x14               ; =20
 41f8ed4: f2c00021     	movk	x1, #0x1, lsl #32
 41f8ed8: 97ffe0b2     	bl	0x41f11a0 <_ChromeMain+0x41ebf04>
 41f8edc: 4f0004c0     	movi.4s	v0, #0x6
 41f8ee0: 3c9703a0     	stur	q0, [x29, #-0x90]
 41f8ee4: 5280003b     	mov	w27, #0x1               ; =1
 41f8ee8: 381803bb     	sturb	w27, [x29, #-0x80]
 41f8eec: d10243a1     	sub	x1, x29, #0x90
 41f8ef0: aa1a03e0     	mov	x0, x26
 41f8ef4: 977d4c7f     	bl	0x214c0f0 <_ChromeMain+0x2146e54>
 41f8ef8: 395a8348     	ldrb	w8, [x26, #0x6a0]
 41f8efc: 34000088     	cbz	w8, 0x41f8f0c <_ChromeMain+0x41f3c70>
 41f8f00: b9469f48     	ldr	w8, [x26, #0x69c]
 41f8f04: 7100211f     	cmp	w8, #0x8
 41f8f08: 54000100     	b.eq	0x41f8f28 <_ChromeMain+0x41f3c8c>
 41f8f0c: 52800108     	mov	w8, #0x8                ; =8
 41f8f10: b9069f48     	str	w8, [x26, #0x69c]
 41f8f14: 391a835b     	strb	w27, [x26, #0x6a0]
 41f8f18: f9400348     	ldr	x8, [x26]
 41f8f1c: f9427d08     	ldr	x8, [x8, #0x4f8]
 41f8f20: aa1a03e0     	mov	x0, x26
 41f8f24: d63f0100     	blr	x8
 41f8f28: d2c00048     	mov	x8, #0x200000000        ; =8589934592
 41f8f2c: 4e080d00     	dup.2d	v0, x8
 41f8f30: 3c9703a0     	stur	q0, [x29, #-0x90]
 41f8f34: b0054061     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 41f8f38: 91122021     	add	x1, x1, #0x488
 41f8f3c: d10243a2     	sub	x2, x29, #0x90
 41f8f40: aa1503e0     	mov	x0, x21
 41f8f44: 9763d3c7     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 41f8f48: d10012c1     	sub	x1, x22, #0x4
 41f8f4c: aa1a03e0     	mov	x0, x26
 41f8f50: 97ffe094     	bl	0x41f11a0 <_ChromeMain+0x41ebf04>
 41f8f54: 4f000500     	movi.4s	v0, #0x8
 41f8f58: 3c9703a0     	stur	q0, [x29, #-0x90]
 41f8f5c: 52800028     	mov	w8, #0x1                ; =1
 41f8f60: 381803a8     	sturb	w8, [x29, #-0x80]
 41f8f64: d10243a1     	sub	x1, x29, #0x90
 41f8f68: aa1a03e0     	mov	x0, x26
 41f8f6c: 977d4c61     	bl	0x214c0f0 <_ChromeMain+0x2146e54>
 41f8f70: b21b03f5     	mov	x21, #0x2000000020      ; =137438953504
 41f8f74: aa1a03e0     	mov	x0, x26
 41f8f78: b21b03e1     	mov	x1, #0x2000000020       ; =137438953504
 41f8f7c: 52800022     	mov	w2, #0x1                ; =1
 41f8f80: 979762b8     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 41f8f84: 91177348     	add	x8, x26, #0x5dc
 41f8f88: f9400109     	ldr	x9, [x8]
 41f8f8c: eb15013f     	cmp	x9, x21
 41f8f90: 54000100     	b.eq	0x41f8fb0 <_ChromeMain+0x41f3d14>
 41f8f94: f9000115     	str	x21, [x8]
 41f8f98: aa1a03e0     	mov	x0, x26
 41f8f9c: 52800061     	mov	w1, #0x3                ; =3
 41f8fa0: 9717a271     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 41f8fa4: 91177341     	add	x1, x26, #0x5dc
 41f8fa8: aa1403e0     	mov	x0, x20
 41f8fac: 9734bc09     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 41f8fb0: 910243e1     	add	x1, sp, #0x90
 41f8fb4: aa1a03e0     	mov	x0, x26
 41f8fb8: 95920a92     	bl	0xa67ba00 <_ChromeMain+0xa676764>
 41f8fbc: f9436268     	ldr	x8, [x19, #0x6c0]
 41f8fc0: f90013e8     	str	x8, [sp, #0x20]
 41f8fc4: f940b79b     	ldr	x27, [x28, #0x168]
 41f8fc8: b400411b     	cbz	x27, 0x41f97e8 <_ChromeMain+0x41f454c>
 41f8fcc: 52800034     	mov	w20, #0x1               ; =1
 41f8fd0: b8340368     	ldadd	w20, w8, [x27]
 41f8fd4: 12b00015     	mov	w21, #0x7fffffff        ; =2147483647
 41f8fd8: 6b15011f     	cmp	w8, w21
 41f8fdc: 540056e0     	b.eq	0x41f9ab8 <_ChromeMain+0x41f481c>
 41f8fe0: f940bb88     	ldr	x8, [x28, #0x170]
 41f8fe4: f9000be8     	str	x8, [sp, #0x10]
 41f8fe8: 52800b00     	mov	w0, #0x58               ; =88
 41f8fec: 96f858df     	bl	0xf368 <_ChromeMain+0xa0cc>
 41f8ff0: b8340368     	ldadd	w20, w8, [x27]
 41f8ff4: 6b15011f     	cmp	w8, w21
 41f8ff8: 54005660     	b.eq	0x41f9ac4 <_ChromeMain+0x41f4828>
 41f8ffc: aa0003fc     	mov	x28, x0
 41f9000: f0050168     	adrp	x8, 0xe228000 <dyld_stub_binder+0xe228000>
 41f9004: 91342108     	add	x8, x8, #0xd08
 41f9008: f9000008     	str	x8, [x0]
 41f900c: f0050ac8     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 41f9010: 9127e108     	add	x8, x8, #0x9f8
 41f9014: aa0003f5     	mov	x21, x0
 41f9018: f8008ea8     	str	x8, [x21, #0x8]!
 41f901c: a9017c1f     	stp	xzr, xzr, [x0, #0x10]
 41f9020: 3900801f     	strb	wzr, [x0, #0x20]
 41f9024: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 41f9028: f9404709     	ldr	x9, [x24, #0x88]
 41f902c: eb09011f     	cmp	x8, x9
 41f9030: 54000061     	b.ne	0x41f903c <_ChromeMain+0x41f3da0>
 41f9034: aa1503e0     	mov	x0, x21
 41f9038: 96f86cb1     	bl	0x142fc <_ChromeMain+0xf060>
 41f903c: a902ff95     	stp	x21, xzr, [x28, #0x28]
 41f9040: aa1503e0     	mov	x0, x21
 41f9044: d2800001     	mov	x1, #0x0                ; =0
 41f9048: 97739716     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 41f904c: 6f00e400     	movi.2d	v0, #0000000000000000
 41f9050: aa1c03f6     	mov	x22, x28
 41f9054: 3c838ec0     	str	q0, [x22, #0x38]!
 41f9058: aa1603f4     	mov	x20, x22
 41f905c: 3c810e80     	str	q0, [x20, #0x10]!
 41f9060: f85d82c8     	ldur	x8, [x22, #-0x28]
 41f9064: eb1a011f     	cmp	x8, x26
 41f9068: 54000900     	b.eq	0x41f9188 <_ChromeMain+0x41f3eec>
 41f906c: aa1503e0     	mov	x0, x21
 41f9070: aa1a03e1     	mov	x1, x26
 41f9074: 9773970b     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 41f9078: f9400348     	ldr	x8, [x26]
 41f907c: f9417108     	ldr	x8, [x8, #0x2e0]
 41f9080: aa1a03e0     	mov	x0, x26
 41f9084: d63f0100     	blr	x8
 41f9088: aa0003f5     	mov	x21, x0
 41f908c: 925e7788     	and	x8, x28, #0xfffffffc00000000
 41f9090: f9404709     	ldr	x9, [x24, #0x88]
 41f9094: eb09011f     	cmp	x8, x9
 41f9098: 54000061     	b.ne	0x41f90a4 <_ChromeMain+0x41f3e08>
 41f909c: aa1c03e0     	mov	x0, x28
 41f90a0: 96f86c97     	bl	0x142fc <_ChromeMain+0xf060>
 41f90a4: 52800700     	mov	w0, #0x38               ; =56
 41f90a8: 96f858b0     	bl	0xf368 <_ChromeMain+0xa0cc>
 41f90ac: aa0003e1     	mov	x1, x0
 41f90b0: 52800028     	mov	w8, #0x1                ; =1
 41f90b4: b9000008     	str	w8, [x0]
 41f90b8: f0ffeb88     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 41f90bc: 91270108     	add	x8, x8, #0x9c0
 41f90c0: f0fec649     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 41f90c4: 91180129     	add	x9, x9, #0x600
 41f90c8: a900a408     	stp	x8, x9, [x0, #0x8]
 41f90cc: 10032ae8     	adr	x8, 0x41ff628 <_ChromeMain+0x41fa38c>
 41f90d0: d503201f     	nop
 41f90d4: 90ff1b29     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 41f90d8: 912c0129     	add	x9, x9, #0xb00
 41f90dc: a901a009     	stp	x9, x8, [x0, #0x18]
 41f90e0: a902f01f     	stp	xzr, x28, [x0, #0x28]
 41f90e4: f94002a8     	ldr	x8, [x21]
 41f90e8: f9400d08     	ldr	x8, [x8, #0x18]
 41f90ec: aa1503e0     	mov	x0, x21
 41f90f0: d63f0100     	blr	x8
 41f90f4: b40000b5     	cbz	x21, 0x41f9108 <_ChromeMain+0x41f3e6c>
 41f90f8: f94002a8     	ldr	x8, [x21]
 41f90fc: f9400508     	ldr	x8, [x8, #0x8]
 41f9100: aa1503e0     	mov	x0, x21
 41f9104: d63f0100     	blr	x8
 41f9108: 925e7788     	and	x8, x28, #0xfffffffc00000000
 41f910c: f9404709     	ldr	x9, [x24, #0x88]
 41f9110: eb09011f     	cmp	x8, x9
 41f9114: 54000061     	b.ne	0x41f9120 <_ChromeMain+0x41f3e84>
 41f9118: aa1c03e0     	mov	x0, x28
 41f911c: 96f86c78     	bl	0x142fc <_ChromeMain+0xf060>
 41f9120: 52800700     	mov	w0, #0x38               ; =56
 41f9124: 96f85891     	bl	0xf368 <_ChromeMain+0xa0cc>
 41f9128: aa0003e1     	mov	x1, x0
 41f912c: 52800028     	mov	w8, #0x1                ; =1
 41f9130: b9000008     	str	w8, [x0]
 41f9134: f0ffeb88     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 41f9138: 91270109     	add	x9, x8, #0x9c0
 41f913c: f0fec648     	adrp	x8, 0x1ac4000 <_ChromeMain+0x1abed64>
 41f9140: 91180108     	add	x8, x8, #0x600
 41f9144: a900a009     	stp	x9, x8, [x0, #0x8]
 41f9148: 10032bc8     	adr	x8, 0x41ff6c0 <_ChromeMain+0x41fa424>
 41f914c: d503201f     	nop
 41f9150: 90ff1b29     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 41f9154: 912c0129     	add	x9, x9, #0xb00
 41f9158: a901a009     	stp	x9, x8, [x0, #0x18]
 41f915c: a902f01f     	stp	xzr, x28, [x0, #0x28]
 41f9160: d10243a8     	sub	x8, x29, #0x90
 41f9164: 910b6340     	add	x0, x26, #0x2d8
 41f9168: 97684b62     	bl	0x1c0bef0 <_ChromeMain+0x1c06c54>
 41f916c: 910062c0     	add	x0, x22, #0x18
 41f9170: d10243a1     	sub	x1, x29, #0x90
 41f9174: 97193657     	bl	0x846ad0 <_ChromeMain+0x841834>
 41f9178: f85703b5     	ldur	x21, [x29, #-0x90]
 41f917c: b5001435     	cbnz	x21, 0x41f9400 <_ChromeMain+0x41f4164>
 41f9180: aa1c03e0     	mov	x0, x28
 41f9184: 9400196d     	bl	0x41ff738 <_ChromeMain+0x41fa49c>
 41f9188: b40000db     	cbz	x27, 0x41f91a0 <_ChromeMain+0x41f3f04>
 41f918c: 52800028     	mov	w8, #0x1                ; =1
 41f9190: b8280368     	ldadd	w8, w8, [x27]
 41f9194: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 41f9198: 6b09011f     	cmp	w8, w9
 41f919c: 540049a0     	b.eq	0x41f9ad0 <_ChromeMain+0x41f4834>
 41f91a0: f94002c8     	ldr	x8, [x22]
 41f91a4: f94013f5     	ldr	x21, [sp, #0x20]
 41f91a8: f9400bea     	ldr	x10, [sp, #0x10]
 41f91ac: b4000088     	cbz	x8, 0x41f91bc <_ChromeMain+0x41f3f20>
 41f91b0: 19404108     	ldapurb	w8, [x8, #0x4]
 41f91b4: 34000ac8     	cbz	w8, 0x41f930c <_ChromeMain+0x41f4070>
 41f91b8: d2800008     	mov	x8, #0x0                ; =0
 41f91bc: b4000efb     	cbz	x27, 0x41f9398 <_ChromeMain+0x41f40fc>
 41f91c0: 19404369     	ldapurb	w9, [x27, #0x4]
 41f91c4: 72001d3f     	tst	w9, #0xff
 41f91c8: 9a9f0149     	csel	x9, x10, xzr, eq
 41f91cc: eb09011f     	cmp	x8, x9
 41f91d0: 54000a20     	b.eq	0x41f9314 <_ChromeMain+0x41f4078>
 41f91d4: 52800028     	mov	w8, #0x1                ; =1
 41f91d8: b8280368     	ldadd	w8, w8, [x27]
 41f91dc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 41f91e0: 6b09011f     	cmp	w8, w9
 41f91e4: 54004820     	b.eq	0x41f9ae8 <_ChromeMain+0x41f484c>
 41f91e8: f94002c0     	ldr	x0, [x22]
 41f91ec: f90002db     	str	x27, [x22]
 41f91f0: b5002ec0     	cbnz	x0, 0x41f97c8 <_ChromeMain+0x41f452c>
 41f91f4: f900238a     	str	x10, [x28, #0x40]
 41f91f8: f81703bf     	stur	xzr, [x29, #-0x90]
 41f91fc: d10243a1     	sub	x1, x29, #0x90
 41f9200: aa1403e0     	mov	x0, x20
 41f9204: 97193633     	bl	0x846ad0 <_ChromeMain+0x841834>
 41f9208: f85703b4     	ldur	x20, [x29, #-0x90]
 41f920c: b5000cb4     	cbnz	x20, 0x41f93a0 <_ChromeMain+0x41f4104>
 41f9210: aa1c03e0     	mov	x0, x28
 41f9214: 94001949     	bl	0x41ff738 <_ChromeMain+0x41fa49c>
 41f9218: b50007fb     	cbnz	x27, 0x41f9314 <_ChromeMain+0x41f4078>
 41f921c: aa1503f6     	mov	x22, x21
 41f9220: f8410ec8     	ldr	x8, [x22, #0x10]!
 41f9224: b50009e8     	cbnz	x8, 0x41f9360 <_ChromeMain+0x41f40c4>
 41f9228: aa1603f5     	mov	x21, x22
 41f922c: 52800600     	mov	w0, #0x30               ; =48
 41f9230: 96f8584e     	bl	0xf368 <_ChromeMain+0xa0cc>
 41f9234: b4002000     	cbz	x0, 0x41f9634 <_ChromeMain+0x41f4398>
 41f9238: aa0003f4     	mov	x20, x0
 41f923c: b100801f     	cmn	x0, #0x20
 41f9240: 54001fa0     	b.eq	0x41f9634 <_ChromeMain+0x41f4398>
 41f9244: a9027e9a     	stp	x26, xzr, [x20, #0x20]
 41f9248: a9007e9f     	stp	xzr, xzr, [x20]
 41f924c: f9000a95     	str	x21, [x20, #0x10]
 41f9250: f90002d4     	str	x20, [x22]
 41f9254: f94013f5     	ldr	x21, [sp, #0x20]
 41f9258: f94006a8     	ldr	x8, [x21, #0x8]
 41f925c: f9400108     	ldr	x8, [x8]
 41f9260: aa1403e1     	mov	x1, x20
 41f9264: b4000068     	cbz	x8, 0x41f9270 <_ChromeMain+0x41f3fd4>
 41f9268: f90006a8     	str	x8, [x21, #0x8]
 41f926c: f94002c1     	ldr	x1, [x22]
 41f9270: f9400aa0     	ldr	x0, [x21, #0x10]
 41f9274: 96f989fb     	bl	0x5ba60 <_ChromeMain+0x567c4>
 41f9278: f9400ea8     	ldr	x8, [x21, #0x18]
 41f927c: 91000508     	add	x8, x8, #0x1
 41f9280: f9000ea8     	str	x8, [x21, #0x18]
 41f9284: f9401680     	ldr	x0, [x20, #0x28]
 41f9288: f900169c     	str	x28, [x20, #0x28]
 41f928c: b4000080     	cbz	x0, 0x41f929c <_ChromeMain+0x41f4000>
 41f9290: f9400008     	ldr	x8, [x0]
 41f9294: f9400508     	ldr	x8, [x8, #0x8]
 41f9298: d63f0100     	blr	x8
 41f929c: b500053b     	cbnz	x27, 0x41f9340 <_ChromeMain+0x41f40a4>
 41f92a0: f9400348     	ldr	x8, [x26]
 41f92a4: f9405108     	ldr	x8, [x8, #0xa0]
 41f92a8: aa1a03e0     	mov	x0, x26
 41f92ac: 52800001     	mov	w1, #0x0                ; =0
 41f92b0: d63f0100     	blr	x8
 41f92b4: f9400ffb     	ldr	x27, [sp, #0x18]
 41f92b8: b4fe807a     	cbz	x26, 0x41f62c4 <_ChromeMain+0x41f1028>
 41f92bc: 3945a748     	ldrb	w8, [x26, #0x169]
 41f92c0: 350040e8     	cbnz	w8, 0x41f9adc <_ChromeMain+0x41f4840>
 41f92c4: f940ce62     	ldr	x2, [x19, #0x198]
 41f92c8: aa1303e0     	mov	x0, x19
 41f92cc: aa1a03e1     	mov	x1, x26
 41f92d0: 9716004b     	bl	0x7793fc <_ChromeMain+0x774160>
 41f92d4: 925e7748     	and	x8, x26, #0xfffffffc00000000
 41f92d8: f9404709     	ldr	x9, [x24, #0x88]
 41f92dc: eb09011f     	cmp	x8, x9
 41f92e0: 54000061     	b.ne	0x41f92ec <_ChromeMain+0x41f4050>
 41f92e4: aa1a03e0     	mov	x0, x26
 41f92e8: 96f86c05     	bl	0x142fc <_ChromeMain+0xf060>
 41f92ec: f942b660     	ldr	x0, [x19, #0x568]
 41f92f0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41f92f4: f9404709     	ldr	x9, [x24, #0x88]
 41f92f8: eb09011f     	cmp	x8, x9
 41f92fc: 54000041     	b.ne	0x41f9304 <_ChromeMain+0x41f4068>
 41f9300: 96f8a5cf     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41f9304: f902b67a     	str	x26, [x19, #0x568]
 41f9308: 17fff3ef     	b	0x41f62c4 <_ChromeMain+0x41f1028>
