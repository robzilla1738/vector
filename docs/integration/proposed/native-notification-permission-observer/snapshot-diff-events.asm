
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40f8df0: 6db733ed     	stp	d13, d12, [sp, #-0x90]!
 40f8df4: 6d012beb     	stp	d11, d10, [sp, #0x10]
 40f8df8: 6d0223e9     	stp	d9, d8, [sp, #0x20]
 40f8dfc: a9036ffc     	stp	x28, x27, [sp, #0x30]
 40f8e00: a90467fa     	stp	x26, x25, [sp, #0x40]
 40f8e04: a9055ff8     	stp	x24, x23, [sp, #0x50]
 40f8e08: a90657f6     	stp	x22, x21, [sp, #0x60]
 40f8e0c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 40f8e10: a9087bfd     	stp	x29, x30, [sp, #0x80]
 40f8e14: 910203fd     	add	x29, sp, #0x80
 40f8e18: d10683ff     	sub	sp, sp, #0x1a0
 40f8e1c: f9400c08     	ldr	x8, [x0, #0x18]
 40f8e20: b4000388     	cbz	x8, 0x40f8e90 <_ChromeMain+0x40f3bf4>
 40f8e24: aa0103f4     	mov	x20, x1
 40f8e28: f840869a     	ldr	x26, [x20], #0x8
 40f8e2c: eb14035f     	cmp	x26, x20
 40f8e30: 54000300     	b.eq	0x40f8e90 <_ChromeMain+0x40f3bf4>
 40f8e34: aa0203f3     	mov	x19, x2
 40f8e38: aa0003f5     	mov	x21, x0
 40f8e3c: 9100c3ea     	add	x10, sp, #0x30
 40f8e40: b2400948     	orr	x8, x10, #0x7
 40f8e44: b0046f89     	adrp	x9, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f8e48: 912b4d29     	add	x9, x9, #0xad3
 40f8e4c: eb09015f     	cmp	x10, x9
 40f8e50: fa499100     	ccmp	x8, x9, #0x0, ls
 40f8e54: 1a9f97e8     	cset	w8, hi
 40f8e58: b9002fe8     	str	w8, [sp, #0x2c]
 40f8e5c: 9004f988     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 40f8e60: f9444908     	ldr	x8, [x8, #0x890]
 40f8e64: fd400108     	ldr	d8, [x8]
 40f8e68: 910143fb     	add	x27, sp, #0x50
 40f8e6c: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 40f8e70: 9e670109     	fmov	d9, x8
 40f8e74: f004f288     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 40f8e78: fd45ad0a     	ldr	d10, [x8, #0xb58]
 40f8e7c: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 40f8e80: 9e67010b     	fmov	d11, x8
 40f8e84: 92f78408     	mov	x8, #0x43dfffffffffffff ; =4890909195324358655
 40f8e88: 9e67010c     	fmov	d12, x8
 40f8e8c: 1400005a     	b	0x40f8ff4 <_ChromeMain+0x40f3d58>
 40f8e90: 910683ff     	add	sp, sp, #0x1a0
 40f8e94: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 40f8e98: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 40f8e9c: a94657f6     	ldp	x22, x21, [sp, #0x60]
 40f8ea0: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 40f8ea4: a94467fa     	ldp	x26, x25, [sp, #0x40]
 40f8ea8: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 40f8eac: 6d4223e9     	ldp	d9, d8, [sp, #0x20]
 40f8eb0: 6d412beb     	ldp	d11, d10, [sp, #0x10]
 40f8eb4: 6cc933ed     	ldp	d13, d12, [sp], #0x90
 40f8eb8: d65f03c0     	ret
 40f8ebc: 910443e8     	add	x8, sp, #0x110
 40f8ec0: 910203e0     	add	x0, sp, #0x80
 40f8ec4: 97276619     	bl	0xad2728 <_ChromeMain+0xacd48c>
 40f8ec8: 9101a3e0     	add	x0, sp, #0x68
 40f8ecc: 910443e1     	add	x1, sp, #0x110
 40f8ed0: 972f04ac     	bl	0xcba180 <_ChromeMain+0xcb4ee4>
 40f8ed4: 910443e0     	add	x0, sp, #0x110
 40f8ed8: 9721956a     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40f8edc: 14000021     	b	0x40f8f60 <_ChromeMain+0x40f3cc4>
 40f8ee0: 12800008     	mov	w8, #-0x1               ; =-1
 40f8ee4: b8e80008     	ldaddal	w8, w8, [x0]
 40f8ee8: 7100051f     	cmp	w8, #0x1
 40f8eec: 540005e1     	b.ne	0x40f8fa8 <_ChromeMain+0x40f3d0c>
 40f8ef0: f9400808     	ldr	x8, [x0, #0x10]
 40f8ef4: d63f0100     	blr	x8
 40f8ef8: 1400002c     	b	0x40f8fa8 <_ChromeMain+0x40f3d0c>
 40f8efc: d63f0100     	blr	x8
 40f8f00: b5002280     	cbnz	x0, 0x40f9350 <_ChromeMain+0x40f40b4>
 40f8f04: d2800008     	mov	x8, #0x0                ; =0
 40f8f08: 9e620100     	scvtf	d0, x8
 40f8f0c: 910443e0     	add	x0, sp, #0x110
 40f8f10: 973e8b0c     	bl	0x109bb40 <_ChromeMain+0x10968a4>
 40f8f14: 52800068     	mov	w8, #0x3                ; =3
 40f8f18: 3904a3e8     	strb	w8, [sp, #0x128]
 40f8f1c: 910203e0     	add	x0, sp, #0x80
 40f8f20: 910443e3     	add	x3, sp, #0x110
 40f8f24: b004b761     	adrp	x1, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 40f8f28: 913b2821     	add	x1, x1, #0xeca
 40f8f2c: 52800122     	mov	w2, #0x9                ; =9
 40f8f30: 971107e4     	bl	0x53aec0 <_ChromeMain+0x535c24>
 40f8f34: 3944a3e8     	ldrb	w8, [sp, #0x128]
 40f8f38: f103fd1f     	cmp	x8, #0xff
 40f8f3c: 540000e0     	b.eq	0x40f8f58 <_ChromeMain+0x40f3cbc>
 40f8f40: b0053e49     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 40f8f44: 9121e129     	add	x9, x9, #0x878
 40f8f48: f8687928     	ldr	x8, [x9, x8, lsl #3]
 40f8f4c: 9103e3e0     	add	x0, sp, #0xf8
 40f8f50: 910443e1     	add	x1, sp, #0x110
 40f8f54: d63f0100     	blr	x8
 40f8f58: f94037e8     	ldr	x8, [sp, #0x68]
 40f8f5c: b5fffb08     	cbnz	x8, 0x40f8ebc <_ChromeMain+0x40f3c20>
 40f8f60: f94043e8     	ldr	x8, [sp, #0x80]
 40f8f64: f9007fe8     	str	x8, [sp, #0xf8]
 40f8f68: 3cc883e0     	ldur	q0, [sp, #0x88]
 40f8f6c: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 40f8f70: f9004bff     	str	xzr, [sp, #0x90]
 40f8f74: 9103e3e8     	add	x8, sp, #0xf8
 40f8f78: 3c808100     	stur	q0, [x8, #0x8]
 40f8f7c: 9103e3e2     	add	x2, sp, #0xf8
 40f8f80: aa1703e0     	mov	x0, x23
 40f8f84: b0046f81     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f8f88: 912d8821     	add	x1, x1, #0xb62
 40f8f8c: 940005d0     	bl	0x40fa6cc <_ChromeMain+0x40f5430>
 40f8f90: 9103e3e0     	add	x0, sp, #0xf8
 40f8f94: 9721953b     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40f8f98: 910203e0     	add	x0, sp, #0x80
 40f8f9c: 97219539     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40f8fa0: f94037e0     	ldr	x0, [sp, #0x68]
 40f8fa4: b5fff9e0     	cbnz	x0, 0x40f8ee0 <_ChromeMain+0x40f3c44>
 40f8fa8: 39411ff8     	ldrb	w24, [sp, #0x47]
 40f8fac: 363800b8     	tbz	w24, #0x7, 0x40f8fc0 <_ChromeMain+0x40f3d24>
 40f8fb0: f9401be0     	ldr	x0, [sp, #0x30]
 40f8fb4: f94023e8     	ldr	x8, [sp, #0x40]
 40f8fb8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8fbc: 96fc3fbf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8fc0: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 40f8fc4: 36f800a8     	tbz	w8, #0x1f, 0x40f8fd8 <_ChromeMain+0x40f3d3c>
 40f8fc8: f9402be0     	ldr	x0, [sp, #0x50]
 40f8fcc: f94033e8     	ldr	x8, [sp, #0x60]
 40f8fd0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8fd4: 96fc3fb9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8fd8: f9400748     	ldr	x8, [x26, #0x8]
 40f8fdc: b40001a8     	cbz	x8, 0x40f9010 <_ChromeMain+0x40f3d74>
 40f8fe0: aa0803fa     	mov	x26, x8
 40f8fe4: f9400108     	ldr	x8, [x8]
 40f8fe8: b5ffffc8     	cbnz	x8, 0x40f8fe0 <_ChromeMain+0x40f3d44>
 40f8fec: eb14035f     	cmp	x26, x20
 40f8ff0: 54fff500     	b.eq	0x40f8e90 <_ChromeMain+0x40f3bf4>
 40f8ff4: 91008356     	add	x22, x26, #0x20
 40f8ff8: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 40f8ffc: f90033ff     	str	xzr, [sp, #0x60]
 40f9000: 3980df42     	ldrsb	x2, [x26, #0x37]
 40f9004: b7f80122     	tbnz	x2, #0x3f, 0x40f9028 <_ChromeMain+0x40f3d8c>
 40f9008: 91008341     	add	x1, x26, #0x20
 40f900c: 14000008     	b	0x40f902c <_ChromeMain+0x40f3d90>
 40f9010: aa1a03e8     	mov	x8, x26
 40f9014: f9400b5a     	ldr	x26, [x26, #0x10]
 40f9018: f9400349     	ldr	x9, [x26]
 40f901c: eb09011f     	cmp	x8, x9
 40f9020: 54ffff81     	b.ne	0x40f9010 <_ChromeMain+0x40f3d74>
 40f9024: 17fffff2     	b	0x40f8fec <_ChromeMain+0x40f3d50>
 40f9028: a9420b41     	ldp	x1, x2, [x26, #0x20]
 40f902c: f9400eb7     	ldr	x23, [x21, #0x18]
 40f9030: 910443e0     	add	x0, sp, #0x110
 40f9034: 9709dc68     	bl	0x3701d4 <_ChromeMain+0x36af38>
 40f9038: 910143e8     	add	x8, sp, #0x50
 40f903c: 910443e1     	add	x1, sp, #0x110
 40f9040: aa1703e0     	mov	x0, x23
 40f9044: 94000309     	bl	0x40f9c68 <_ChromeMain+0x40f49cc>
 40f9048: 910443f7     	add	x23, sp, #0x110
 40f904c: 9101c2e0     	add	x0, x23, #0x70
 40f9050: d2800001     	mov	x1, #0x0                ; =0
 40f9054: 96fcbb19     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40f9058: 910082e0     	add	x0, x23, #0x20
 40f905c: 96fcbb07     	bl	0x27c78 <_ChromeMain+0x229dc>
 40f9060: 39c49fe8     	ldrsb	w8, [sp, #0x127]
 40f9064: 36f800a8     	tbz	w8, #0x1f, 0x40f9078 <_ChromeMain+0x40f3ddc>
 40f9068: f9408be0     	ldr	x0, [sp, #0x110]
 40f906c: f94093e8     	ldr	x8, [sp, #0x120]
 40f9070: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9074: 96fc3f91     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9078: 910182a0     	add	x0, x21, #0x60
 40f907c: 91008341     	add	x1, x26, #0x20
 40f9080: 948eaa08     	bl	0x64a38a0 <_ChromeMain+0x649e604>
 40f9084: a9462aa9     	ldp	x9, x10, [x21, #0x60]
 40f9088: 5280060b     	mov	w11, #0x30              ; =48
 40f908c: 9b0b2548     	madd	x8, x10, x11, x9
 40f9090: eb01001f     	cmp	x0, x1
 40f9094: 9a881008     	csel	x8, x0, x8, ne
 40f9098: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 40f909c: f90023ff     	str	xzr, [sp, #0x40]
 40f90a0: 5280061c     	mov	w28, #0x30              ; =48
 40f90a4: 9b0b2549     	madd	x9, x10, x11, x9
 40f90a8: eb08013f     	cmp	x9, x8
 40f90ac: 540002c0     	b.eq	0x40f9104 <_ChromeMain+0x40f3e68>
 40f90b0: 39c0bd09     	ldrsb	w9, [x8, #0x2f]
 40f90b4: 37f800c9     	tbnz	w9, #0x1f, 0x40f90cc <_ChromeMain+0x40f3e30>
 40f90b8: 3cc18100     	ldur	q0, [x8, #0x18]
 40f90bc: f8428108     	ldur	x8, [x8, #0x28]
 40f90c0: f90023e8     	str	x8, [sp, #0x40]
 40f90c4: 3d800fe0     	str	q0, [sp, #0x30]
 40f90c8: 1400001a     	b	0x40f9130 <_ChromeMain+0x40f3e94>
 40f90cc: a9418901     	ldp	x1, x2, [x8, #0x18]
 40f90d0: 9100c3e0     	add	x0, sp, #0x30
 40f90d4: 96fc7c51     	bl	0x18218 <_ChromeMain+0x12f7c>
 40f90d8: 14000016     	b	0x40f9130 <_ChromeMain+0x40f3e94>
 40f90dc: 910182a0     	add	x0, x21, #0x60
 40f90e0: 91008341     	add	x1, x26, #0x20
 40f90e4: 948ea9ef     	bl	0x64a38a0 <_ChromeMain+0x649e604>
 40f90e8: eb01001f     	cmp	x0, x1
 40f90ec: 540026c8     	b.hi	0x40f95c4 <_ChromeMain+0x40f4328>
 40f90f0: 54000820     	b.eq	0x40f91f4 <_ChromeMain+0x40f3f58>
 40f90f4: 1400014a     	b	0x40f961c <_ChromeMain+0x40f4380>
 40f90f8: a9450be1     	ldp	x1, x2, [sp, #0x50]
 40f90fc: 970ebe6e     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 40f9100: 1400003d     	b	0x40f91f4 <_ChromeMain+0x40f3f58>
 40f9104: 528000e8     	mov	w8, #0x7                ; =7
 40f9108: 39011fe8     	strb	w8, [sp, #0x47]
 40f910c: b9402fe8     	ldr	w8, [sp, #0x2c]
 40f9110: 350025a8     	cbnz	w8, 0x40f95c4 <_ChromeMain+0x40f4328>
 40f9114: 528eac28     	mov	w8, #0x7561             ; =30049
 40f9118: 72ae8d88     	movk	w8, #0x746c, lsl #16
 40f911c: b80333e8     	stur	w8, [sp, #0x33]
 40f9120: 528cac88     	mov	w8, #0x6564             ; =25956
 40f9124: 72ac2cc8     	movk	w8, #0x6166, lsl #16
 40f9128: b90033e8     	str	w8, [sp, #0x30]
 40f912c: 3900dfff     	strb	wzr, [sp, #0x37]
 40f9130: 39419fe8     	ldrb	w8, [sp, #0x67]
 40f9134: 13001d19     	sxtb	w25, w8
 40f9138: f9402fe9     	ldr	x9, [sp, #0x58]
 40f913c: 7100033f     	cmp	w25, #0x0
 40f9140: 9a884137     	csel	x23, x9, x8, mi
 40f9144: 39411fe8     	ldrb	w8, [sp, #0x47]
 40f9148: 13001d18     	sxtb	w24, w8
 40f914c: f9401fe9     	ldr	x9, [sp, #0x38]
 40f9150: 7100031f     	cmp	w24, #0x0
 40f9154: 9a884128     	csel	x8, x9, x8, mi
 40f9158: eb0802ff     	cmp	x23, x8
 40f915c: 54000161     	b.ne	0x40f9188 <_ChromeMain+0x40f3eec>
 40f9160: f9402be8     	ldr	x8, [sp, #0x50]
 40f9164: 7100033f     	cmp	w25, #0x0
 40f9168: 9a9b4100     	csel	x0, x8, x27, mi
 40f916c: f9401be8     	ldr	x8, [sp, #0x30]
 40f9170: 7100031f     	cmp	w24, #0x0
 40f9174: 9100c3e9     	add	x9, sp, #0x30
 40f9178: 9a894101     	csel	x1, x8, x9, mi
 40f917c: aa1703e2     	mov	x2, x23
 40f9180: 94fc41b8     	bl	0x8009860 <_ChromeMain+0x80045c4>
 40f9184: 34fff140     	cbz	w0, 0x40f8fac <_ChromeMain+0x40f3d10>
 40f9188: f1001eff     	cmp	x23, #0x7
 40f918c: 540001a1     	b.ne	0x40f91c0 <_ChromeMain+0x40f3f24>
 40f9190: f9402be8     	ldr	x8, [sp, #0x50]
 40f9194: 7100033f     	cmp	w25, #0x0
 40f9198: 9a9b4108     	csel	x8, x8, x27, mi
 40f919c: b9400109     	ldr	w9, [x8]
 40f91a0: b8403108     	ldur	w8, [x8, #0x3]
 40f91a4: 528cac8a     	mov	w10, #0x6564            ; =25956
 40f91a8: 72ac2cca     	movk	w10, #0x6166, lsl #16
 40f91ac: 6b0a013f     	cmp	w9, w10
 40f91b0: 528eac29     	mov	w9, #0x7561             ; =30049
 40f91b4: 72ae8d89     	movk	w9, #0x746c, lsl #16
 40f91b8: 7a490100     	ccmp	w8, w9, #0x0, eq
 40f91bc: 54fff900     	b.eq	0x40f90dc <_ChromeMain+0x40f3e40>
 40f91c0: 910182a0     	add	x0, x21, #0x60
 40f91c4: 91008341     	add	x1, x26, #0x20
 40f91c8: 97bf23ec     	bl	0x30c2178 <_ChromeMain+0x30bcedc>
 40f91cc: eb1b001f     	cmp	x0, x27
 40f91d0: 54000120     	b.eq	0x40f91f4 <_ChromeMain+0x40f3f58>
 40f91d4: 39c05c09     	ldrsb	w9, [x0, #0x17]
 40f91d8: 39419fe8     	ldrb	w8, [sp, #0x67]
 40f91dc: 37f81de9     	tbnz	w9, #0x1f, 0x40f9598 <_ChromeMain+0x40f42fc>
 40f91e0: 373ff8c8     	tbnz	w8, #0x7, 0x40f90f8 <_ChromeMain+0x40f3e5c>
 40f91e4: 3dc017e0     	ldr	q0, [sp, #0x50]
 40f91e8: f94033e8     	ldr	x8, [sp, #0x60]
 40f91ec: f9000808     	str	x8, [x0, #0x10]
 40f91f0: 3d800000     	str	q0, [x0]
 40f91f4: 39419fe9     	ldrb	w9, [sp, #0x67]
 40f91f8: 13001d28     	sxtb	w8, w9
 40f91fc: f9402fea     	ldr	x10, [sp, #0x58]
 40f9200: 7100011f     	cmp	w8, #0x0
 40f9204: 9a894149     	csel	x9, x10, x9, mi
 40f9208: f1001d3f     	cmp	x9, #0x7
 40f920c: 54000e20     	b.eq	0x40f93d0 <_ChromeMain+0x40f4134>
 40f9210: f100113f     	cmp	x9, #0x4
 40f9214: 54000121     	b.ne	0x40f9238 <_ChromeMain+0x40f3f9c>
 40f9218: f9402be9     	ldr	x9, [sp, #0x50]
 40f921c: 7100011f     	cmp	w8, #0x0
 40f9220: 9a9b4128     	csel	x8, x9, x27, mi
 40f9224: b9400108     	ldr	w8, [x8]
 40f9228: 528cac89     	mov	w9, #0x6564             ; =25956
 40f922c: 72af2dc9     	movk	w9, #0x796e, lsl #16
 40f9230: 6b09011f     	cmp	w8, w9
 40f9234: 54000e60     	b.eq	0x40f9400 <_ChromeMain+0x40f4164>
 40f9238: f9400eb7     	ldr	x23, [x21, #0x18]
 40f923c: f9402ea8     	ldr	x8, [x21, #0x58]
 40f9240: b5000968     	cbnz	x8, 0x40f936c <_ChromeMain+0x40f40d0>
 40f9244: f90037e8     	str	x8, [sp, #0x68]
 40f9248: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 40f924c: f9004bff     	str	xzr, [sp, #0x90]
 40f9250: 910203e0     	add	x0, sp, #0x80
 40f9254: f004b741     	adrp	x1, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 40f9258: 911cdc21     	add	x1, x1, #0x737
 40f925c: 52800082     	mov	w2, #0x4                ; =4
 40f9260: 90046f83     	adrp	x3, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f9264: 912d8863     	add	x3, x3, #0xb62
 40f9268: 97569d22     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 40f926c: 3980df44     	ldrsb	x4, [x26, #0x37]
 40f9270: b6f80044     	tbz	x4, #0x3f, 0x40f9278 <_ChromeMain+0x40f3fdc>
 40f9274: a9421356     	ldp	x22, x4, [x26, #0x20]
 40f9278: 910203e0     	add	x0, sp, #0x80
 40f927c: d004be41     	adrp	x1, 0xd8c3000 <dyld_stub_binder+0xd8c3000>
 40f9280: 912bfc21     	add	x1, x1, #0xaff
 40f9284: 528000c2     	mov	w2, #0x6                ; =6
 40f9288: aa1603e3     	mov	x3, x22
 40f928c: 97569ccf     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 40f9290: 39819fe8     	ldrsb	x8, [sp, #0x67]
 40f9294: a9452be9     	ldp	x9, x10, [sp, #0x50]
 40f9298: f100011f     	cmp	x8, #0x0
 40f929c: 9a9b4123     	csel	x3, x9, x27, mi
 40f92a0: 7100011f     	cmp	w8, #0x0
 40f92a4: 9a884144     	csel	x4, x10, x8, mi
 40f92a8: 910203e0     	add	x0, sp, #0x80
 40f92ac: f004b801     	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 40f92b0: 91216821     	add	x1, x1, #0x85a
 40f92b4: 52800142     	mov	w2, #0xa                ; =10
 40f92b8: 97569cc4     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 40f92bc: 910203e0     	add	x0, sp, #0x80
 40f92c0: d004b7a1     	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 40f92c4: 910d7821     	add	x1, x1, #0x35e
 40f92c8: 528000c2     	mov	w2, #0x6                ; =6
 40f92cc: aa1303e3     	mov	x3, x19
 40f92d0: 97569d08     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 40f92d4: 900555c8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40f92d8: f9468508     	ldr	x8, [x8, #0xd08]
 40f92dc: d0000ea9     	adrp	x9, 0x42cf000 <_ChromeMain+0x42c9d64>
 40f92e0: 9138c129     	add	x9, x9, #0xe30
 40f92e4: eb09011f     	cmp	x8, x9
 40f92e8: 54ffe0a1     	b.ne	0x40f8efc <_ChromeMain+0x40f3c60>
 40f92ec: 94fce1a9     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 40f92f0: 1e602008     	fcmp	d0, #0.0
 40f92f4: 92f0000a     	mov	x10, #0x7fffffffffffffff ; =9223372036854775807
 40f92f8: 54ffe060     	b.eq	0x40f8f04 <_ChromeMain+0x40f3c68>
 40f92fc: 1e692000     	fcmp	d0, d9
 40f9300: 540015a0     	b.eq	0x40f95b4 <_ChromeMain+0x40f4318>
 40f9304: 1e682800     	fadd	d0, d0, d8
 40f9308: 1e6a0800     	fmul	d0, d0, d10
 40f930c: 1e6b2000     	fcmp	d0, d11
 40f9310: 9a8ab3e8     	csel	x8, xzr, x10, lt
 40f9314: 1e6b6801     	fmaxnm	d1, d0, d11
 40f9318: 9e780029     	fcvtzs	x9, d1
 40f931c: 1e6c2000     	fcmp	d0, d12
 40f9320: 9a889120     	csel	x0, x9, x8, ls
 40f9324: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 40f9328: 8b080008     	add	x8, x0, x8
 40f932c: f100091f     	cmp	x8, #0x2
 40f9330: 54000103     	b.lo	0x40f9350 <_ChromeMain+0x40f40b4>
 40f9334: d2880008     	mov	x8, #0x4000             ; =16384
 40f9338: f2a910c8     	movk	x8, #0x4886, lsl #16
 40f933c: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 40f9340: f2e00528     	movk	x8, #0x29, lsl #48
 40f9344: ab080008     	adds	x8, x0, x8
 40f9348: 9a886140     	csel	x0, x10, x8, vs
 40f934c: b4ffddc0     	cbz	x0, 0x40f8f04 <_ChromeMain+0x40f3c68>
 40f9350: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 40f9354: 8b080008     	add	x8, x0, x8
 40f9358: f100091f     	cmp	x8, #0x2
 40f935c: 54000182     	b.hs	0x40f938c <_ChromeMain+0x40f40f0>
 40f9360: 937ffc08     	asr	x8, x0, #63
 40f9364: d240f908     	eor	x8, x8, #0x7fffffffffffffff
 40f9368: 17fffee8     	b	0x40f8f08 <_ChromeMain+0x40f3c6c>
 40f936c: 52800029     	mov	w9, #0x1                ; =1
 40f9370: b8290109     	ldadd	w9, w9, [x8]
 40f9374: 7100013f     	cmp	w9, #0x0
 40f9378: 5400128d     	b.le	0x40f95c8 <_ChromeMain+0x40f432c>
 40f937c: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 40f9380: 6b0a013f     	cmp	w9, w10
 40f9384: 540011c0     	b.eq	0x40f95bc <_ChromeMain+0x40f4320>
 40f9388: 17ffffaf     	b	0x40f9244 <_ChromeMain+0x40f3fa8>
 40f938c: d2980008     	mov	x8, #0xc000             ; =49152
 40f9390: f2b6ef28     	movk	x8, #0xb779, lsl #16
 40f9394: f2d42d28     	movk	x8, #0xa169, lsl #32
 40f9398: f2fffac8     	movk	x8, #0xffd6, lsl #48
 40f939c: ab080009     	adds	x9, x0, x8
 40f93a0: d2f00008     	mov	x8, #-0x8000000000000000 ; =-9223372036854775808
 40f93a4: 9a896109     	csel	x9, x8, x9, vs
 40f93a8: eb08013f     	cmp	x9, x8
 40f93ac: 54ffdae0     	b.eq	0x40f8f08 <_ChromeMain+0x40f3c6c>
 40f93b0: d29ef9e8     	mov	x8, #0xf7cf             ; =63439
 40f93b4: f2bc6a68     	movk	x8, #0xe353, lsl #16
 40f93b8: f2d374a8     	movk	x8, #0x9ba5, lsl #32
 40f93bc: f2e41888     	movk	x8, #0x20c4, lsl #48
 40f93c0: 9b487d28     	smulh	x8, x9, x8
 40f93c4: 9347fd09     	asr	x9, x8, #7
 40f93c8: 8b48fd28     	add	x8, x9, x8, lsr #63
 40f93cc: 17fffecf     	b	0x40f8f08 <_ChromeMain+0x40f3c6c>
 40f93d0: f9402be9     	ldr	x9, [sp, #0x50]
 40f93d4: 7100011f     	cmp	w8, #0x0
 40f93d8: 9a9b4128     	csel	x8, x9, x27, mi
 40f93dc: b9400109     	ldr	w9, [x8]
 40f93e0: b8403108     	ldur	w8, [x8, #0x3]
 40f93e4: 528cac8a     	mov	w10, #0x6564            ; =25956
 40f93e8: 72ac2cca     	movk	w10, #0x6166, lsl #16
 40f93ec: 6b0a013f     	cmp	w9, w10
 40f93f0: 528eac29     	mov	w9, #0x7561             ; =30049
 40f93f4: 72ae8d89     	movk	w9, #0x746c, lsl #16
 40f93f8: 7a490100     	ccmp	w8, w9, #0x0, eq
 40f93fc: 54fff1e1     	b.ne	0x40f9238 <_ChromeMain+0x40f3f9c>
 40f9400: f9400ea8     	ldr	x8, [x21, #0x18]
 40f9404: b4fff1a8     	cbz	x8, 0x40f9238 <_ChromeMain+0x40f3f9c>
 40f9408: f900c3ff     	str	xzr, [sp, #0x180]
 40f940c: 6f00e400     	movi.2d	v0, #0000000000000000
 40f9410: ad0b03e0     	stp	q0, q0, [sp, #0x160]
 40f9414: ad0a03e0     	stp	q0, q0, [sp, #0x140]
 40f9418: ad0903e0     	stp	q0, q0, [sp, #0x120]
 40f941c: 3d8047e0     	str	q0, [sp, #0x110]
 40f9420: 3980df48     	ldrsb	x8, [x26, #0x37]
 40f9424: a9422b49     	ldp	x9, x10, [x26, #0x20]
 40f9428: f100011f     	cmp	x8, #0x0
 40f942c: 9a964121     	csel	x1, x9, x22, mi
 40f9430: 7100011f     	cmp	w8, #0x0
 40f9434: 9a884142     	csel	x2, x10, x8, mi
 40f9438: 910443e0     	add	x0, sp, #0x110
 40f943c: 9709db66     	bl	0x3701d4 <_ChromeMain+0x36af38>
 40f9440: f9400ea0     	ldr	x0, [x21, #0x18]
 40f9444: 975bc25b     	bl	0x17e9db0 <_ChromeMain+0x17e4b14>
 40f9448: 910443e1     	add	x1, sp, #0x110
 40f944c: 910443e2     	add	x2, sp, #0x110
 40f9450: 528000c3     	mov	w3, #0x6                ; =6
 40f9454: d2800004     	mov	x4, #0x0                ; =0
 40f9458: 97260aea     	bl	0xa7c000 <_ChromeMain+0xa76d64>
 40f945c: 7100041f     	cmp	w0, #0x1
 40f9460: 54000820     	b.eq	0x40f9564 <_ChromeMain+0x40f42c8>
 40f9464: f9400ea0     	ldr	x0, [x21, #0x18]
 40f9468: f9400008     	ldr	x8, [x0]
 40f946c: f940b508     	ldr	x8, [x8, #0x168]
 40f9470: d63f0100     	blr	x8
 40f9474: aa0003f7     	mov	x23, x0
 40f9478: a90fffff     	stp	xzr, xzr, [sp, #0xf8]
 40f947c: f90087ff     	str	xzr, [sp, #0x108]
 40f9480: 90046f81     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f9484: 9128a021     	add	x1, x1, #0xa28
 40f9488: 52800662     	mov	w2, #0x33               ; =51
 40f948c: 96feab9f     	bl	0xa4308 <_ChromeMain+0x9f06c>
 40f9490: 9103e3e8     	add	x8, sp, #0xf8
 40f9494: 972764a5     	bl	0xad2728 <_ChromeMain+0xacd48c>
 40f9498: 910203e8     	add	x8, sp, #0x80
 40f949c: 910443e0     	add	x0, sp, #0x110
 40f94a0: 97288f01     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 40f94a4: 910203e0     	add	x0, sp, #0x80
 40f94a8: 9715cd78     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 40f94ac: 39805c08     	ldrsb	x8, [x0, #0x17]
 40f94b0: a9402809     	ldp	x9, x10, [x0]
 40f94b4: f100011f     	cmp	x8, #0x0
 40f94b8: 9a804121     	csel	x1, x9, x0, mi
 40f94bc: 7100011f     	cmp	w8, #0x0
 40f94c0: 9a884142     	csel	x2, x10, x8, mi
 40f94c4: 9103e3e0     	add	x0, sp, #0xf8
 40f94c8: 9767a93e     	bl	0x1ae39c0 <_ChromeMain+0x1ade724>
 40f94cc: aa0003f9     	mov	x25, x0
 40f94d0: 910203f8     	add	x24, sp, #0x80
 40f94d4: 9101c300     	add	x0, x24, #0x70
 40f94d8: d2800001     	mov	x1, #0x0                ; =0
 40f94dc: 96fcb9f7     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40f94e0: 91008300     	add	x0, x24, #0x20
 40f94e4: 96fcb9e5     	bl	0x27c78 <_ChromeMain+0x229dc>
 40f94e8: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 40f94ec: 36f800a8     	tbz	w8, #0x1f, 0x40f9500 <_ChromeMain+0x40f4264>
 40f94f0: f94043e0     	ldr	x0, [sp, #0x80]
 40f94f4: f9404be8     	ldr	x8, [sp, #0x90]
 40f94f8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f94fc: 96fc3e6f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9500: 340002f9     	cbz	w25, 0x40f955c <_ChromeMain+0x40f42c0>
 40f9504: f9407fe8     	ldr	x8, [sp, #0xf8]
 40f9508: f9007fff     	str	xzr, [sp, #0xf8]
 40f950c: f90037ff     	str	xzr, [sp, #0x68]
 40f9510: f90043e8     	str	x8, [sp, #0x80]
 40f9514: 6f00e401     	movi.2d	v1, #0000000000000000
 40f9518: 3c8703e1     	stur	q1, [sp, #0x70]
 40f951c: 9103e3e8     	add	x8, sp, #0xf8
 40f9520: 3cc08100     	ldur	q0, [x8, #0x8]
 40f9524: 3c808101     	stur	q1, [x8, #0x8]
 40f9528: 3c8883e0     	stur	q0, [sp, #0x88]
 40f952c: 528000c8     	mov	w8, #0x6                ; =6
 40f9530: 390263e8     	strb	w8, [sp, #0x98]
 40f9534: 910203e3     	add	x3, sp, #0x80
 40f9538: aa1703e0     	mov	x0, x23
 40f953c: 90046f81     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f9540: 9128a021     	add	x1, x1, #0xa28
 40f9544: 52800662     	mov	w2, #0x33               ; =51
 40f9548: 975040d8     	bl	0x15098a8 <_ChromeMain+0x150460c>
 40f954c: 910203e0     	add	x0, sp, #0x80
 40f9550: 975494a1     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 40f9554: 9101a3e0     	add	x0, sp, #0x68
 40f9558: 972193ca     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40f955c: 9103e3e0     	add	x0, sp, #0xf8
 40f9560: 972193c8     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40f9564: 910443f7     	add	x23, sp, #0x110
 40f9568: 9101c2e0     	add	x0, x23, #0x70
 40f956c: d2800001     	mov	x1, #0x0                ; =0
 40f9570: 96fcb9d2     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40f9574: 910082e0     	add	x0, x23, #0x20
 40f9578: 96fcb9c0     	bl	0x27c78 <_ChromeMain+0x229dc>
 40f957c: 39c49fe8     	ldrsb	w8, [sp, #0x127]
 40f9580: 36ffe5c8     	tbz	w8, #0x1f, 0x40f9238 <_ChromeMain+0x40f3f9c>
 40f9584: f9408be0     	ldr	x0, [sp, #0x110]
 40f9588: f94093e8     	ldr	x8, [sp, #0x120]
 40f958c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9590: 96fc3e4a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9594: 17ffff29     	b	0x40f9238 <_ChromeMain+0x40f3f9c>
 40f9598: 13001d09     	sxtb	w9, w8
 40f959c: 7100013f     	cmp	w9, #0x0
 40f95a0: a9452be9     	ldp	x9, x10, [sp, #0x50]
 40f95a4: 9a9b4121     	csel	x1, x9, x27, mi
 40f95a8: 9a884142     	csel	x2, x10, x8, mi
 40f95ac: 970ebd95     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 40f95b0: 17ffff11     	b	0x40f91f4 <_ChromeMain+0x40f3f58>
 40f95b4: 92f00008     	mov	x8, #0x7fffffffffffffff ; =9223372036854775807
 40f95b8: 17fffe54     	b	0x40f8f08 <_ChromeMain+0x40f3c6c>
 40f95bc: d4200000     	brk	#0
 40f95c0: d4400000     	hlt	#0
 40f95c4: d4200020     	brk	#0x1
 40f95c8: d4200000     	brk	#0
 40f95cc: d4400000     	hlt	#0
 40f95d0: d4200020     	brk	#0x1
 40f95d4: a941a3e9     	ldp	x9, x8, [sp, #0x18]
 40f95d8: f8418120     	ldur	x0, [x9, #0x18]
 40f95dc: 8b180108     	add	x8, x8, x24
 40f95e0: f9401508     	ldr	x8, [x8, #0x28]
 40f95e4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f95e8: 96fc3e34     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f95ec: f9400fe8     	ldr	x8, [sp, #0x18]
 40f95f0: a901fd1f     	stp	xzr, xzr, [x8, #0x18]
 40f95f4: f802811f     	stur	xzr, [x8, #0x28]
 40f95f8: 14000027     	b	0x40f9694 <_ChromeMain+0x40f43f8>
 40f95fc: f9400ff9     	ldr	x25, [sp, #0x18]
 40f9600: f9400320     	ldr	x0, [x25]
 40f9604: f9400b28     	ldr	x8, [x25, #0x10]
 40f9608: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f960c: 96fc3e2b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9610: a9007f3f     	stp	xzr, xzr, [x25]
 40f9614: f9000b3f     	str	xzr, [x25, #0x10]
 40f9618: 14000015     	b	0x40f966c <_ChromeMain+0x40f43d0>
 40f961c: aa0003f7     	mov	x23, x0
 40f9620: a94622aa     	ldp	x10, x8, [x21, #0x60]
 40f9624: 8b080509     	add	x9, x8, x8, lsl #1
 40f9628: f90007ea     	str	x10, [sp, #0x8]
 40f962c: cb0a002a     	sub	x10, x1, x10
 40f9630: eb09115f     	cmp	x10, x9, lsl #4
 40f9634: 54000620     	b.eq	0x40f96f8 <_ChromeMain+0x40f445c>
 40f9638: d37ced28     	lsl	x8, x9, #4
 40f963c: f94007e9     	ldr	x9, [sp, #0x8]
 40f9640: cb0903f8     	neg	x24, x9
 40f9644: cb010108     	sub	x8, x8, x1
 40f9648: f9000be8     	str	x8, [sp, #0x10]
 40f964c: 8b170128     	add	x8, x9, x23
 40f9650: f90013e8     	str	x8, [sp, #0x20]
 40f9654: 8b010137     	add	x23, x9, x1
 40f9658: f94013e8     	ldr	x8, [sp, #0x20]
 40f965c: 8b180108     	add	x8, x8, x24
 40f9660: f9000fe8     	str	x8, [sp, #0x18]
 40f9664: 39c05d08     	ldrsb	w8, [x8, #0x17]
 40f9668: 37fffca8     	tbnz	w8, #0x1f, 0x40f95fc <_ChromeMain+0x40f4360>
 40f966c: 8b1802f9     	add	x25, x23, x24
 40f9670: 3dc00320     	ldr	q0, [x25]
 40f9674: f9400b28     	ldr	x8, [x25, #0x10]
 40f9678: f9400fe9     	ldr	x9, [sp, #0x18]
 40f967c: f9000928     	str	x8, [x9, #0x10]
 40f9680: 3d800120     	str	q0, [x9]
 40f9684: 39005f3f     	strb	wzr, [x25, #0x17]
 40f9688: 3900033f     	strb	wzr, [x25]
 40f968c: 39c0bd28     	ldrsb	w8, [x9, #0x2f]
 40f9690: 37fffa28     	tbnz	w8, #0x1f, 0x40f95d4 <_ChromeMain+0x40f4338>
 40f9694: f94007eb     	ldr	x11, [sp, #0x8]
 40f9698: cb0b03ea     	neg	x10, x11
 40f969c: 8b0a02e8     	add	x8, x23, x10
 40f96a0: 3cc18320     	ldur	q0, [x25, #0x18]
 40f96a4: f8428329     	ldur	x9, [x25, #0x28]
 40f96a8: f9400fec     	ldr	x12, [sp, #0x18]
 40f96ac: f8028189     	stur	x9, [x12, #0x28]
 40f96b0: 3c818180     	stur	q0, [x12, #0x18]
 40f96b4: 3900bd1f     	strb	wzr, [x8, #0x2f]
 40f96b8: 3801833f     	sturb	wzr, [x25, #0x18]
 40f96bc: f9400be9     	ldr	x9, [sp, #0x10]
 40f96c0: d100c129     	sub	x9, x9, #0x30
 40f96c4: f94013e8     	ldr	x8, [sp, #0x20]
 40f96c8: 9100c108     	add	x8, x8, #0x30
 40f96cc: f90013e8     	str	x8, [sp, #0x20]
 40f96d0: 9100c2f7     	add	x23, x23, #0x30
 40f96d4: cb0b03f8     	neg	x24, x11
 40f96d8: f9000be9     	str	x9, [sp, #0x10]
 40f96dc: eb09015f     	cmp	x10, x9
 40f96e0: 54fffbc1     	b.ne	0x40f9658 <_ChromeMain+0x40f43bc>
 40f96e4: f94013e8     	ldr	x8, [sp, #0x20]
 40f96e8: f94007e9     	ldr	x9, [sp, #0x8]
 40f96ec: cb090117     	sub	x23, x8, x9
 40f96f0: a94622a9     	ldp	x9, x8, [x21, #0x60]
 40f96f4: f90007e9     	str	x9, [sp, #0x8]
 40f96f8: f94007e9     	ldr	x9, [sp, #0x8]
 40f96fc: 9b1c2509     	madd	x9, x8, x28, x9
 40f9700: eb0902ff     	cmp	x23, x9
 40f9704: 54000340     	b.eq	0x40f976c <_ChromeMain+0x40f44d0>
 40f9708: f94007e9     	ldr	x9, [sp, #0x8]
 40f970c: 9b1c2508     	madd	x8, x8, x28, x9
 40f9710: d1006119     	sub	x25, x8, #0x18
 40f9714: 1400000f     	b	0x40f9750 <_ChromeMain+0x40f44b4>
 40f9718: f85e8320     	ldur	x0, [x25, #-0x18]
 40f971c: f85f8328     	ldur	x8, [x25, #-0x8]
 40f9720: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9724: 96fc3de5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9728: 14000007     	b	0x40f9744 <_ChromeMain+0x40f44a8>
 40f972c: f9400320     	ldr	x0, [x25]
 40f9730: f9400b28     	ldr	x8, [x25, #0x10]
 40f9734: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9738: 96fc3de0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f973c: 38dff328     	ldursb	w8, [x25, #-0x1]
 40f9740: 37fffec8     	tbnz	w8, #0x1f, 0x40f9718 <_ChromeMain+0x40f447c>
 40f9744: d100c339     	sub	x25, x25, #0x30
 40f9748: eb17031f     	cmp	x24, x23
 40f974c: 540000c0     	b.eq	0x40f9764 <_ChromeMain+0x40f44c8>
 40f9750: f1006338     	subs	x24, x25, #0x18
 40f9754: 54fff380     	b.eq	0x40f95c4 <_ChromeMain+0x40f4328>
 40f9758: 39c05f28     	ldrsb	w8, [x25, #0x17]
 40f975c: 36ffff08     	tbz	w8, #0x1f, 0x40f973c <_ChromeMain+0x40f44a0>
 40f9760: 17fffff3     	b	0x40f972c <_ChromeMain+0x40f4490>
 40f9764: f84602a8     	ldur	x8, [x21, #0x60]
 40f9768: f90007e8     	str	x8, [sp, #0x8]
 40f976c: f94007e8     	ldr	x8, [sp, #0x8]
 40f9770: cb0802e8     	sub	x8, x23, x8
 40f9774: 9344fd08     	asr	x8, x8, #4
 40f9778: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 40f977c: f2955569     	movk	x9, #0xaaab
 40f9780: 9b097d08     	mul	x8, x8, x9
 40f9784: f90036a8     	str	x8, [x21, #0x68]
 40f9788: 17fffe9b     	b	0x40f91f4 <_ChromeMain+0x40f3f58>
